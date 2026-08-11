// ⚠️ 아키텍처 전환: 블록을 JS 함수로 새로 그리던 이전 방식 대신, 실제 운영 템플릿
// HTML(js/data/edmTemplateHtml.js, 18개)을 그대로 쓰고 {{변수}}만 치환하는 방식으로 바꿨습니다.
// 실제 발송 템플릿과 100% 동일한 결과가 보장되고, 새 템플릿 추가 시 blocks.js를 안 건드리고
// 원본 HTML + 필드 스키마(edmTemplateFields.js)만 추가하면 됩니다.
//
// ⚠️ {{customer_name}}은 치환하지 않고 그대로 남깁니다 — 이건 마케터가 채우는 값이 아니라
// 발송 시스템(ESP)이 수신자별로 채우는 병합 태그입니다. 그 외 모든 {{변수}}는 이 도구에서
// 값을 채워서 최종 HTML을 만듭니다.

import { esc } from "./dom.js";
import { EDM_TEMPLATE_HTML } from "../data/edmTemplateHtml.js";

const ESP_MERGE_TAGS = new Set(["customer_name"]);

/** 상품카드처럼 "적당한 크기의 td"만 후보로 남깁니다 — 너무 작은(글자 크기 수준) td나
 *  너무 큰(전체 그리드/페이지 래퍼) td를 카드 경계로 잘못 고르지 않도록, width 속성이
 *  100~300px 범위인 것만 후보로 씁니다. 이 범위 밖이면 필터링 없이(전체 후보로) 처리합니다. */
function filterCardSizedOpens(html, opens) {
  const filtered = opens.filter(idx => {
    const tagEnd = html.indexOf(">", idx);
    const tag = html.slice(idx, tagEnd + 1);
    const m = tag.match(/width="(\d+)"/);
    if (!m) return false;
    const w = parseInt(m[1], 10);
    return w >= 100 && w <= 300;
  });
  return filtered.length ? filtered : opens;
}

/** {{marker}}를 포함하는 <tagName>...</tagName>을 찾아서 통째로 제거합니다.
 *  단순 정규식이 아니라 여는/닫는 태그 개수를 실제로 추적해서, 중첩된 table/tr/td 구조에서도
 *  정확히 짝이 맞는 닫는 태그를 찾습니다 (필드/섹션 삭제, 상품카드 개수 제한에 사용).
 *  @param {boolean} preferOutermost true면 가장 바깥쪽 겹(상품카드처럼 여러 겹 중첩된 td의
 *    "카드 경계"를 찾을 때)을, false면 가장 안쪽(해당 필드 하나의 행만 지울 때)을 찾습니다. */
function removeEnclosingTag(html, marker, tagName, preferOutermost = false) {
  const markerIdx = html.indexOf(marker);
  if (markerIdx === -1) return html;

  const openTagFullRe = new RegExp(`<${tagName}(?=[\\s>])[^>]*>`, "gi");
  let opens = [];
  let om;
  while ((om = openTagFullRe.exec(html)) && om.index < markerIdx) opens.push(om.index);
  if (!opens.length) return html;
  if (preferOutermost) opens = filterCardSizedOpens(html, opens);

  const tokenRe = new RegExp(`<${tagName}(?=[\\s>])[^>]*>|</${tagName}>`, "gi");
  const order = preferOutermost
    ? opens.map((_, i) => i)                 // 0,1,2,... (바깥쪽부터)
    : opens.map((_, i) => opens.length - 1 - i); // 안쪽부터
  for (const k of order) {
    const start = opens[k];
    const scanText = html.slice(start);
    let depth = 0, matchEnd = -1, tk;
    tokenRe.lastIndex = 0;
    while ((tk = tokenRe.exec(scanText))) {
      if (tk[0].startsWith("</")) {
        depth--;
        if (depth === 0) { matchEnd = start + tk.index + tk[0].length; break; }
      } else {
        depth++;
      }
    }
    if (matchEnd !== -1 && matchEnd > markerIdx) {
      return html.slice(0, start) + html.slice(matchEnd);
    }
  }
  return html;
}

/** 숨김 처리할 필드/섹션(<tr> 단위, 해당 필드만)과 상품카드(가장 바깥쪽 <td> 카드 경계 단위)를
 *  제거합니다. 일반 치환보다 먼저 실행해야 {{변수명}}이 아직 살아있어서 위치를 찾을 수 있습니다. */
function stripHiddenUnits(html, hiddenRowKeys = [], hiddenCardKeys = []) {
  let result = html;
  for (const key of hiddenCardKeys) {
    result = removeEnclosingTag(result, `{{${key}}}`, "td", true);
  }
  for (const key of hiddenRowKeys) {
    result = removeEnclosingTag(result, `{{${key}}}`, "tr", false);
  }
  return result;
}
/** {{image_N}}<!-- 발송 시 교체: <img .../> --> 패턴을 실제 <img> 태그로 교체(값 있을 때)
 *  ⚠️ 이미지가 클릭 가능한 링크(<a>)로 감싸인 템플릿(NO.11 링크그리드, NO.15 상품그리드)은
 *  {{image_N}}</a><!--...--> 처럼 닫는 태그가 끼어있어서, 그 경우도 인식하도록 (?:<\/a>)?를 넣었습니다.
 *  ⚠️ 원본 템플릿의 img 태그는 alt=""로 비어있어서 가이드라인 검사에서 "alt 없음" 경고가 뜹니다.
 *  values에 "{key}_alt" 값이 있으면(예: 상품명) 그걸로 채우고, 없으면 일반 안내 문구로 대체합니다. */
function substituteImages(html, values) {
  return html.replace(
    /\{\{(image_[a-zA-Z0-9_]+)\}\}(<\/a>)?<!--\s*발송 시 교체:\s*(<img[^>]*>)\s*-->/g,
    (match, key, closingTag, imgTag) => {
      const url = values[key];
      const closing = closingTag || "";
      if (url) {
        const altText = values[`${key}_alt`] || "상품/콘텐츠 이미지";
        const withSrc = imgTag.replace(`{{${key}}}`, esc(url));
        const withAlt = withSrc.replace(/alt="[^"]*"/, `alt="${esc(altText)}"`);
        return withAlt + closing;
      }
      return `<span style="color:#c9a227;font-style:italic;font-size:11px;">이미지 연동 예정</span>` + closing;
    }
  );
}

/** 나머지 모든 {{변수}} 치환. ESP 병합 태그는 그대로 남기고, 값이 없는 필드는 빈 문자열로
 *  치환합니다(레이아웃 자체는 원본 그대로 유지되고, 텅 빈 자리로만 보임 — 실제 발송 전에
 *  가이드라인 검사에서 "값이 비어있음"을 별도로 잡아내는 걸 전제로 합니다). */
function substituteRest(html, values) {
  return html.replace(/\{\{([a-zA-Z_0-9]+)\}\}/g, (match, key) => {
    if (ESP_MERGE_TAGS.has(key)) return match;
    const v = values[key];
    return v !== undefined && v !== null && v !== "" ? esc(String(v)) : "";
  });
}

/**
 * @param {string} templateId edmTemplateHtml.js의 키 (예: "edm-no05-onboarding")
 * @param {Record<string, string>} values {{변수명}} → 실제 값
 * @param {{hiddenRowKeys?: string[], hiddenCardKeys?: string[]}} [options] 숨길 필드(행 단위)/상품카드(카드 단위)
 * @returns {string} 완성된 EDM HTML
 */
export function assembleEdmHtml(templateId, values = {}, options = {}) {
  const raw = EDM_TEMPLATE_HTML[templateId];
  if (!raw) {
    return `<p style="font-family:sans-serif;color:#c62828;">템플릿을 찾을 수 없습니다: ${esc(templateId)}</p>`;
  }
  let html = stripHiddenUnits(raw, options.hiddenRowKeys, options.hiddenCardKeys);
  html = substituteImages(html, values);
  html = substituteRest(html, values);
  return html;
}
