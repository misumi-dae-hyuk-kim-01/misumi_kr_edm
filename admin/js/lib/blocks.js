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
function removeEnclosingTag(html, marker, tagName, preferOutermost = false, alsoRemoveNextSibling = false) {
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
    const matchEnd = findMatchingClose(html, start, tokenRe);
    if (matchEnd !== -1 && matchEnd > markerIdx) {
      let removeUpTo = matchEnd;
      // ⚠️ 섹션 제목(c_headline_N) 바로 뒤엔 {{}} 변수가 아예 없는 순수 장식용 밑줄 행이
      // 붙어있어서, 그 행만 따로는 찾을 방법이 없습니다. 지금 지운 행 바로 뒤에 공백만 두고
      // 곧바로 같은 태그가 이어지면(=바로 다음 형제), 그것도 같이 지웁니다.
      if (alsoRemoveNextSibling) {
        const afterGap = html.slice(matchEnd).match(/^\s*/)[0].length;
        const nextStart = matchEnd + afterGap;
        if (html.slice(nextStart, nextStart + tagName.length + 1).toLowerCase() === `<${tagName}`.toLowerCase()) {
          const nextEnd = findMatchingClose(html, nextStart, tokenRe);
          if (nextEnd !== -1) removeUpTo = nextEnd;
        }
      }
      return html.slice(0, start) + html.slice(removeUpTo);
    }
  }
  return html;
}

/** start 위치의 여는 태그부터 depth를 추적해서, 정확히 짝이 맞는 닫는 태그의 끝 위치를 찾습니다. */
function findMatchingClose(html, start, tokenRe) {
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
  return matchEnd;
}

/** 숨김 처리할 필드/섹션(<tr> 단위, 해당 필드만)과 상품카드(가장 바깥쪽 <td> 카드 경계 단위)를
 *  제거합니다. 일반 치환보다 먼저 실행해야 {{변수명}}이 아직 살아있어서 위치를 찾을 수 있습니다. */
function stripHiddenUnits(html, hiddenRowKeys = [], hiddenCardKeys = []) {
  let result = html;
  const hiddenSet = new Set(hiddenRowKeys);
  for (const key of hiddenCardKeys) {
    result = removeEnclosingTag(result, `{{${key}}}`, "td", true);
  }
  const blankOnly = [];
  for (const key of hiddenRowKeys) {
    // ⚠️ copy_sub/copy_sub_strong처럼 <br/> 하나로만 나뉘어 같은 <td> 안에 같이 있는
    // 필드가 있습니다. 이런 경우 행을 통째로 지우면 옆에 있는(숨기려 하지 않은) 필드까지
    // 같이 사라집니다. 지우기 전에 "이 행 안에 다른 살려야 할 변수가 있는지" 먼저
    // 확인하고, 있으면 행 삭제를 포기하고 이 값만 빈 문자열로 대체합니다.
    if (rowContainsOtherLiveField(result, key, hiddenSet)) {
      blankOnly.push(key);
      // ⚠️ 값만 비우면 원래 있던 {{key}}<br/> 의 <br/>이 그대로 남아서 빈 줄이 생깁니다.
      // {{key}} 바로 앞이나 뒤에 붙어있는 <br/>을 같이 제거해서 빈 줄 없이 자연스럽게
      // 다음 줄로 이어지게 합니다.
      result = removeAdjacentBr(result, key);
      continue;
    }
    const isHeading = key.startsWith("c_headline");
    result = removeEnclosingTag(result, `{{${key}}}`, "tr", false, isHeading);
  }
  return { html: result, blankOnly };
}

/** {{key}} 바로 앞 또는 뒤에 공백 없이 붙어있는 <br/> 하나를 제거합니다(값을 비운 자리에
 *  줄바꿈만 남아 빈 줄처럼 보이는 것을 방지). */
function removeAdjacentBr(html, key) {
  const marker = `{{${key}}}`;
  const brRe = /<br\s*\/?>/i;
  // 뒤에 붙은 경우: {{key}}<br/>
  const afterIdx = html.indexOf(marker);
  if (afterIdx !== -1) {
    const after = html.slice(afterIdx + marker.length);
    const m = after.match(brRe);
    if (m && m.index === 0) {
      return html.slice(0, afterIdx + marker.length) + after.slice(m[0].length);
    }
  }
  // 앞에 붙은 경우: <br/>{{key}}
  const idx = html.indexOf(marker);
  if (idx !== -1) {
    const before = html.slice(0, idx);
    const m = before.match(new RegExp(brRe.source + "$", "i"));
    if (m) {
      return html.slice(0, idx - m[0].length) + html.slice(idx);
    }
  }
  return html;
}

/** key의 {{}}를 감싸는 <tr>을 실제로 찾아서, 그 안에 hiddenSet에 없는(=살려야 하는)
 *  다른 {{다른변수}}가 있는지 확인합니다. */
function rowContainsOtherLiveField(html, key, hiddenSet) {
  const marker = `{{${key}}}`;
  const markerIdx = html.indexOf(marker);
  if (markerIdx === -1) return false;

  const openTagFullRe = /<tr(?=[\s>])[^>]*>/gi;
  let opens = [];
  let om;
  while ((om = openTagFullRe.exec(html)) && om.index < markerIdx) opens.push(om.index);
  if (!opens.length) return false;

  const tokenRe = /<tr(?=[\s>])[^>]*>|<\/tr>/gi;
  for (let k = opens.length - 1; k >= 0; k--) {
    const start = opens[k];
    const end = findMatchingClose(html, start, tokenRe);
    if (end !== -1 && end > markerIdx) {
      const rowContent = html.slice(start, end);
      const otherVars = [...rowContent.matchAll(/\{\{([a-zA-Z_0-9]+)\}\}/g)].map(m => m[1]);
      return otherVars.some(v => v !== key && !hiddenSet.has(v));
    }
  }
  return false;
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
  const stripped = stripHiddenUnits(raw, options.hiddenRowKeys, options.hiddenCardKeys);
  let html = stripped.html;
  // 행 전체 삭제가 아니라 값만 비우는 쪽으로 전환된 필드(같은 줄에 다른 살아있는 필드가
  // 있던 경우)는, values에 남아있을 수 있는 원래 텍스트나 [라벨] 안내문구를 덮어써서
  // 확실히 빈 값으로 만듭니다.
  const finalValues = { ...values };
  for (const key of stripped.blankOnly) finalValues[key] = "";
  html = substituteImages(html, finalValues);
  html = substituteRest(html, finalValues);
  return html;
}
