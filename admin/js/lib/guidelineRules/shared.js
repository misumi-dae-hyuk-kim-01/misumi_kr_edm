// EDM과 LP 둘 다에 공통으로 적용되는 가이드라인 규칙만 모아둔 곳입니다.
// 채널마다 다르게 적용되는 규칙(테이블 레이아웃, !important 등)은 여기 넣지 마세요 —
// js/lib/guidelineCheck.js(EDM 전용) / js/lib/guidelineCheckLP.js(LP 전용, 예정)에 각자 두세요.
//
// 각 함수는 (html, issues) 형태로 받아서 issues 배열에 그대로 push합니다 — 호출부에서
// issues 배열 하나를 여러 규칙 함수에 계속 넘기면서 채우는 방식입니다.

/** 이미지에 alt 속성이 없으면 경고. 출처: codingguideline B-1 HTML */
export function checkImgAlt(doc, issues) {
  doc.querySelectorAll("img").forEach(img => {
    if (!img.getAttribute("alt")) {
      const src = img.getAttribute("src") || "(src 없음)";
      issues.push({ level: "warning", message: `이미지에 alt 속성이 없습니다: ${src}` });
    }
  });
}

/** 최소 폰트 11px 미만 사용 금지. 출처: designguideline B-2 Design Elements */
export function checkMinFontSize(html, issues) {
  const matches = [...html.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/gi)];
  const tooSmall = matches.filter(m => parseFloat(m[1]) < 11);
  if (tooSmall.length) {
    const sizes = [...new Set(tooSmall.map(m => m[1] + "px"))].join(", ");
    issues.push({ level: "warning", message: `최소 폰트 크기(11px) 미만이 사용되었습니다: ${sizes}` });
  }
}

/** font-size를 %(상대단위)로 지정 금지, px 고정값 사용. 출처: codingguideline B-2 CSS */
export function checkFontSizeNotPercent(html, issues) {
  if (/font-size\s*:\s*\d+(\.\d+)?%/i.test(html)) {
    issues.push({ level: "warning", message: "font-size가 %(상대단위)로 지정되어 있습니다. px 고정값을 쓰세요." });
  }
}

/** UTF-8 charset 메타 태그 존재 확인. 출처: codingguideline A-1 파일 형식 */
export function checkUtf8Charset(html, issues) {
  if (!/<meta\s+charset\s*=\s*["']?utf-8["']?/i.test(html)) {
    issues.push({ level: "error", message: "UTF-8 charset 메타 태그가 없습니다 — 한글이 깨져 보일 수 있습니다." });
  }
}

/** 형광색(네온) 사용 감지 — 채도가 극단적으로 높은 색상. 출처: designguideline B-1/B-6 */
export function checkFluorescentColors(html, issues) {
  const hexColors = [...html.matchAll(/#([0-9A-Fa-f]{6})\b/g)].map(m => m[1]);
  const fluorescent = hexColors.filter(isFluorescent);
  if (fluorescent.length) {
    const uniq = [...new Set(fluorescent)].map(c => "#" + c).join(", ");
    issues.push({ level: "warning", message: `형광색으로 보이는 색상이 사용되었습니다 (회사 가이드라인상 금지): ${uniq}` });
  }
}

function isFluorescent(hex) {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return false;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  return s > 0.9 && l > 0.35 && l < 0.75;
}
