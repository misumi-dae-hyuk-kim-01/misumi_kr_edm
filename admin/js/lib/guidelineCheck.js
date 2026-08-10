// 생성된 EDM HTML이 회사 코딩/디자인 가이드라인을 위배하지 않는지 자동 점검합니다.
// "승인 요청" 전에 사람이 눈으로 하나하나 확인하던 것 중 기계적으로 확인 가능한 항목만
// 자동화한 것입니다 — 카피 톤, 브랜드 가이드 준수 같은 주관적 판단은 여전히 사람이 봐야 합니다.
//
// DOMParser는 브라우저 내장 API라 별도 의존성이 필요 없습니다 (Node 테스트 환경에서만 폴리필 필요).
//
// ⚠️ 규칙 출처: 아래 규칙 중 다수는 misumi_designguideline_KOR_ver_2.pptx /
// misumi_codingguideline_KOR_ver_2.pptx 에서 가져왔습니다. 자세한 출처 매핑과, 웹 LP
// 코딩가이드 중 "이메일에는 일부러 적용하지 않은" 규칙(테이블 레이아웃 금지, !important 금지 등)에
// 대한 설명은 GUIDELINE_SOURCES.md를 참고하세요.
//
// ⚠️ EDM/LP 공용 규칙(최소폰트/alt/UTF-8/형광색 등)은 js/lib/guidelineRules/shared.js에 있습니다.
// LP 전용 체커는 js/lib/guidelineCheckLP.js를 보세요 — 두 체커가 같은 공용 규칙을 나눠 씁니다.

import {
  checkImgAlt,
  checkMinFontSize,
  checkFontSizeNotPercent,
  checkUtf8Charset,
  checkFluorescentColors
} from "./guidelineRules/shared.js";

/** MiSUMi 공식 브랜드 컬러 (디자인 가이드라인 Brand Color 슬라이드의 스와치 이미지에 인쇄된
 *  스펙 텍스트를 OCR로 직접 읽어서 확인한 값입니다 — PANTONE/CMYK/RGB 수치가 이미지 안에
 *  텍스트로 박혀 있어서, 이게 픽셀 색상 추정보다 신뢰도 높은 근거입니다).
 *  Blue: RGB R15+G33+B139 / Yellow: RGB R255+G204+B0 / Black: RGB R0+G0+B0 */
export const BRAND_COLORS = {
  blue: "#0F218B",
  yellow: "#FFCC00",
  black: "#000000"
};

/**
 * @param {string} html assembleEdmHtml()이 만든 완성 이메일 HTML
 * @returns {{level: "error"|"warning"|"info", message: string}[]} 발견된 이슈 목록. 비어 있으면 통과.
 */
export function checkGuidelines(html) {
  const issues = [];
  const doc = new DOMParser().parseFromString(html, "text/html");

  // ---------- 공용 규칙 (EDM/LP 동일) ----------
  checkImgAlt(doc, issues);
  checkMinFontSize(html, issues);
  checkFontSizeNotPercent(html, issues);
  checkUtf8Charset(html, issues);
  checkFluorescentColors(html, issues);

  // ---------- 여기부터 EDM 전용 규칙 ----------

  // 링크가 아직 "#"로 비어있음 (CTA/링크 URL 미설정 상태로 승인 요청되는 것 방지)
  doc.querySelectorAll("a[href]").forEach(a => {
    if (a.getAttribute("href") === "#") {
      issues.push({ level: "warning", message: `링크 URL이 아직 설정되지 않았습니다 ("${a.textContent.trim().slice(0, 20)}" 버튼/링크)` });
    }
  });

  // 외부(http/https) 링크인데 UTM 파라미터가 없음
  doc.querySelectorAll("a[href]").forEach(a => {
    const href = a.getAttribute("href");
    if (/^https?:\/\//.test(href) && !href.includes("utm_source")) {
      issues.push({ level: "error", message: `UTM 파라미터가 없는 링크: ${href}` });
    }
  });

  // 이메일 클라이언트 비호환 CSS (display:flex / display:grid) — Outlook 등 다수 클라이언트 미지원
  // ⚠️ 코딩가이드 B-2 CSS는 "레이아웃을 위해 테이블 태그를 사용하지 말 것"이라 되어있지만,
  // 그건 LP 기준입니다. 이메일은 반대로 테이블 레이아웃이 표준이라 여기서 테이블 자체는 검사하지 않습니다
  // (LP는 반대로 테이블을 금지합니다 — guidelineCheckLP.js 참고).
  if (/display\s*:\s*flex/i.test(html)) {
    issues.push({ level: "error", message: "display:flex가 사용되었습니다 — Outlook 등 다수 이메일 클라이언트에서 레이아웃이 깨집니다. 테이블 기반 레이아웃으로 바꾸세요." });
  }
  if (/display\s*:\s*grid/i.test(html)) {
    issues.push({ level: "error", message: "display:grid가 사용되었습니다 — 대부분의 이메일 클라이언트에서 지원하지 않습니다. 테이블 기반 레이아웃으로 바꾸세요." });
  }

  // 외부 스타일시트/스크립트 — 이메일 클라이언트가 대부분 제거하거나 차단함
  // (LP는 jQuery 등 로컬/승인된 스크립트를 전제로 하므로 이 규칙이 그대로 적용되지 않습니다 — LP 전용 규칙 참고)
  if (doc.querySelector('link[rel="stylesheet"]')) {
    issues.push({ level: "error", message: "외부 <link rel=\"stylesheet\">가 포함되어 있습니다 — 대부분의 이메일 클라이언트가 무시합니다. 인라인 스타일을 쓰세요." });
  }
  if (doc.querySelector("script")) {
    issues.push({ level: "error", message: "<script> 태그가 포함되어 있습니다 — 모든 주요 이메일 클라이언트가 스크립트를 차단합니다." });
  }

  // 시리즈 API 연동 전 플레이스홀더가 남아있는 채로 승인 요청되는 것 방지
  if (html.includes("연동 예정")) {
    issues.push({ level: "warning", message: "'OO 연동 예정' 플레이스홀더가 아직 남아있습니다 — 시리즈 코드 조회로 실제 상품 데이터를 채웠는지 확인하세요." });
  }

  // 바깥 테이블이 유동폭(반응형) 구조를 갖추고 있는지 — 모바일 대응 안전장치
  // ⚠️ 18개 실제 템플릿 도입 전에는 이 도구가 직접 만든 "email-wrap"이라는 클래스명을 썼는데,
  // 실제 운영 템플릿들은 전부 "w600"을 씁니다. 옛 이름으로 검사하면 항상 경고가 뜨는
  // 오탐이었던 걸 여기서 발견하고 고쳤습니다.
  if (!html.includes('class="w600"')) {
    issues.push({ level: "warning", message: "이메일 바깥 테이블에 반응형 클래스(w600)가 없습니다 — 모바일에서 잘려 보일 수 있습니다." });
  }

  return issues;
}

/** 통과/실패를 한눈에 보기 위한 요약. UI에서 배지 색상 등에 사용하세요. */
export function summarizeGuidelineIssues(issues) {
  const errors = issues.filter(i => i.level === "error").length;
  const warnings = issues.filter(i => i.level === "warning").length;
  return { errors, warnings, pass: errors === 0 };
}
