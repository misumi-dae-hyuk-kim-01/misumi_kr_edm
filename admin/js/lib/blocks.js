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

/** {{image_N}}<!-- 발송 시 교체: <img .../> --> 패턴을 실제 <img> 태그로 교체(값 있을 때)
 *  하거나, 플레이스홀더 문구로 남깁니다(값 없을 때 — 연동 진행 상황을 화면에서 바로 확인하기 위함).
 *  ⚠️ 이미지가 클릭 가능한 링크(<a>)로 감싸인 템플릿(NO.11 링크그리드, NO.15 상품그리드)은
 *  {{image_N}}</a><!--...--> 처럼 닫는 태그가 끼어있어서, 그 경우도 인식하도록 (?:<\/a>)?를 넣었습니다. */
function substituteImages(html, values) {
  return html.replace(
    /\{\{(image_[a-zA-Z0-9_]+)\}\}(<\/a>)?<!--\s*발송 시 교체:\s*(<img[^>]*>)\s*-->/g,
    (match, key, closingTag, imgTag) => {
      const url = values[key];
      const closing = closingTag || "";
      if (url) return imgTag.replace(`{{${key}}}`, esc(url)) + closing;
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
 * @returns {string} 완성된 EDM HTML
 */
export function assembleEdmHtml(templateId, values = {}) {
  const raw = EDM_TEMPLATE_HTML[templateId];
  if (!raw) {
    return `<p style="font-family:sans-serif;color:#c62828;">템플릿을 찾을 수 없습니다: ${esc(templateId)}</p>`;
  }
  let html = substituteImages(raw, values);
  html = substituteRest(html, values);
  return html;
}
