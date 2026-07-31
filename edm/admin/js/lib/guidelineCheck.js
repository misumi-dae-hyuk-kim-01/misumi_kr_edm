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

  // 1. 이미지에 alt 속성이 없음 (접근성 + 이미지 차단 시 대체 텍스트)
  // 출처: 코딩가이드 B-1 HTML "img태그는 내용을 표시하는 alt 속성값을 부여할 것(필수)"
  doc.querySelectorAll("img").forEach(img => {
    if (!img.getAttribute("alt")) {
      const src = img.getAttribute("src") || "(src 없음)";
      issues.push({ level: "warning", message: `이미지에 alt 속성이 없습니다: ${src}` });
    }
  });

  // 2. 링크가 아직 "#"로 비어있음 (CTA/링크 URL 미설정 상태로 승인 요청되는 것 방지)
  doc.querySelectorAll("a[href]").forEach(a => {
    if (a.getAttribute("href") === "#") {
      issues.push({ level: "warning", message: `링크 URL이 아직 설정되지 않았습니다 ("${a.textContent.trim().slice(0, 20)}" 버튼/링크)` });
    }
  });

  // 3. 외부(http/https) 링크인데 UTM 파라미터가 없음
  doc.querySelectorAll("a[href]").forEach(a => {
    const href = a.getAttribute("href");
    if (/^https?:\/\//.test(href) && !href.includes("utm_source")) {
      issues.push({ level: "error", message: `UTM 파라미터가 없는 링크: ${href}` });
    }
  });

  // 4. 이메일 클라이언트 비호환 CSS (display:flex / display:grid) — Outlook 등 다수 클라이언트 미지원
  //    ⚠️ 코딩가이드 B-2 CSS는 "레이아웃을 위해 테이블 태그를 사용하지 말 것"이라 되어있지만,
  //    그건 일반 웹페이지(LP) 기준입니다. 이메일은 반대로 테이블 레이아웃이 표준이라
  //    테이블 사용 자체는 여기서 검사하지 않습니다 (GUIDELINE_SOURCES.md 참고).
  if (/display\s*:\s*flex/i.test(html)) {
    issues.push({ level: "error", message: "display:flex가 사용되었습니다 — Outlook 등 다수 이메일 클라이언트에서 레이아웃이 깨집니다. 테이블 기반 레이아웃으로 바꾸세요." });
  }
  if (/display\s*:\s*grid/i.test(html)) {
    issues.push({ level: "error", message: "display:grid가 사용되었습니다 — 대부분의 이메일 클라이언트에서 지원하지 않습니다. 테이블 기반 레이아웃으로 바꾸세요." });
  }

  // 5. 외부 스타일시트/스크립트 — 이메일 클라이언트가 대부분 제거하거나 차단함
  //    출처: 코딩가이드 B-3 JavaScript "외부 도메인의 JavaScript를 불러오는 것은 금지" (이메일 기준으로는 더 엄격하게, script 태그 자체를 금지)
  if (doc.querySelector('link[rel="stylesheet"]')) {
    issues.push({ level: "error", message: "외부 <link rel=\"stylesheet\">가 포함되어 있습니다 — 대부분의 이메일 클라이언트가 무시합니다. 인라인 스타일을 쓰세요." });
  }
  if (doc.querySelector("script")) {
    issues.push({ level: "error", message: "<script> 태그가 포함되어 있습니다 — 모든 주요 이메일 클라이언트가 스크립트를 차단합니다." });
  }

  // 6. 시리즈 API 연동 전 플레이스홀더가 남아있는 채로 승인 요청되는 것 방지
  if (html.includes("연동 예정")) {
    issues.push({ level: "warning", message: "'OO 연동 예정' 플레이스홀더가 아직 남아있습니다 — 시리즈 코드 조회로 실제 상품 데이터를 채웠는지 확인하세요." });
  }

  // 7. 바깥 테이블이 유동폭(반응형) 구조를 갖추고 있는지 — 모바일 대응 안전장치
  if (!html.includes('class="email-wrap"')) {
    issues.push({ level: "warning", message: "이메일 바깥 테이블에 반응형 클래스(email-wrap)가 없습니다 — 모바일에서 잘려 보일 수 있습니다." });
  }

  // 8. 폰트 크기 최소 11px 미만 사용 금지
  //    출처: 디자인가이드 B-2 Design Elements "필요에 따라 폰트 크기를 자유롭게 사용(단, 최소 폰트는 11px로 규정)"
  const fontSizePxMatches = [...html.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/gi)];
  const tooSmall = fontSizePxMatches.filter(m => parseFloat(m[1]) < 11);
  if (tooSmall.length) {
    const sizes = [...new Set(tooSmall.map(m => m[1] + "px"))].join(", ");
    issues.push({ level: "warning", message: `최소 폰트 크기(11px) 미만이 사용되었습니다: ${sizes}` });
  }

  // 9. 폰트 크기를 %(상대단위)로 지정 — px 고정값 사용 원칙
  //    출처: 코딩가이드 B-2 CSS "폰트 사이즈는 픽셀치로 설정 (○ font-size:16px / ✕ font-size:133%)"
  if (/font-size\s*:\s*\d+(\.\d+)?%/i.test(html)) {
    issues.push({ level: "warning", message: "font-size가 %(상대단위)로 지정되어 있습니다 — 이메일 클라이언트마다 기준 크기가 달라 예측 불가능하게 렌더링됩니다. px 고정값을 쓰세요." });
  }

  // 10. UTF-8 charset 메타 태그 존재 확인
  //     출처: 코딩가이드 A-1 파일 형식 "문자 코드 : UTF-8 (BOM X)"
  if (!/<meta\s+charset\s*=\s*["']?utf-8["']?/i.test(html)) {
    issues.push({ level: "error", message: "UTF-8 charset 메타 태그가 없습니다 — 한글이 깨져 보일 수 있습니다." });
  }

  // 11. 형광색(네온) 사용 감지 — 채도가 극단적으로 높은 색상
  //     출처: 디자인가이드 B-1 Design Tones / B-6 Main Banner "형광색을 제외한 색상으로 자유롭게 사용 가능"
  const hexColors = [...html.matchAll(/#([0-9A-Fa-f]{6})\b/g)].map(m => m[1]);
  const fluorescent = hexColors.filter(isFluorescent);
  if (fluorescent.length) {
    const uniq = [...new Set(fluorescent)].map(c => "#" + c).join(", ");
    issues.push({ level: "warning", message: `형광색으로 보이는 색상이 사용되었습니다 (회사 가이드라인상 금지): ${uniq}` });
  }

  return issues;
}

/** 채도/명도 기준으로 "형광색"에 해당하는지 판단하는 간단한 휴리스틱.
 *  완벽한 판정은 불가능하므로(디자이너의 육안 판단을 완전히 대체할 수 없음), 명백히 채도가
 *  극단적으로 높은 색만 경고합니다 — 애매한 색은 일부러 통과시켜 오탐(false positive)을 줄였습니다. */
function isFluorescent(hex) {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return false; // 무채색
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  return s > 0.9 && l > 0.35 && l < 0.75;
}

/** 통과/실패를 한눈에 보기 위한 요약. UI에서 배지 색상 등에 사용하세요. */
export function summarizeGuidelineIssues(issues) {
  const errors = issues.filter(i => i.level === "error").length;
  const warnings = issues.filter(i => i.level === "warning").length;
  return { errors, warnings, pass: errors === 0 };
}
