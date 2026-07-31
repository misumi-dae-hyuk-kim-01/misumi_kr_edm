// LP(랜딩페이지) 콘텐츠가 회사 코딩/디자인 가이드라인을 위배하지 않는지 자동 점검합니다.
// ⚠️ 아직 LP 생성기 자체가 없습니다 — 이 파일은 LP 생성기를 실제로 만들 때 바로 연결해서
// 쓸 수 있도록 규칙만 먼저 정리해둔 것입니다. EDM용 guidelineCheck.js와 반대되는 규칙이
// 여럿 있으니 절대 서로 바꿔 쓰면 안 됩니다 (GUIDELINE_SOURCES.md 참고).
//
// 공용 규칙(최소폰트/alt/UTF-8/형광색)은 js/lib/guidelineRules/shared.js에서 가져옵니다.

import {
  checkImgAlt,
  checkMinFontSize,
  checkFontSizeNotPercent,
  checkUtf8Charset,
  checkFluorescentColors
} from "./guidelineRules/shared.js";

/** 코딩가이드 A-2에 정의된 컨텐츠 폭 패턴.
 *  1200px(.page2), 950px(.page1)는 misumi_codingguideline_KOR_ver_2.pptx에 명시된 범용 값이고,
 *  920px은 문서엔 없지만 담당자 확인 결과 "한국 한정 · 경제형 페이지 전용"인 조건부 값입니다 —
 *  다른 두 패턴과 달리 아무 페이지에나 선택하면 안 됩니다. */
export const LP_WIDTH_PATTERNS = {
  1200: { class: "page2", scope: "전체" },
  950: { class: "page1", scope: "전체" },
  920: { class: null, scope: "한국 한정 · 경제형(economy) 페이지 전용", country: "KR", pageType: "경제형" }
};

/** 코딩가이드 C-3에 정의된 전체 국가별 언어 코드 목록 (참고용 — 아래 DEPLOYMENT_LANG이
 *  실제로 쓰는 값입니다). */
export const LP_LANGUAGE_CODES = {
  "한국": "ko", "일본": "ja", "미국": "en-US", "영국": "en-GB", "독일": "de",
  "이탈리아": "it", "프랑스": "fr", "체코": "cs-CZ", "동남아시아": "en-SG",
  "태국": "en-TH", "중국": "zh-CN", "대만": "zh-TW", "인도": "en-IN", "말레이시아": "en-MY"
};

/** 국가명 → ISO 국가코드. LP_WIDTH_PATTERNS의 country 조건(예: "KR")과 비교할 때 씁니다. */
export const LP_COUNTRY_CODES = {
  "한국": "KR", "일본": "JP", "미국": "US", "영국": "GB", "독일": "DE",
  "이탈리아": "IT", "프랑스": "FR", "체코": "CZ", "동남아시아": "SG",
  "태국": "TH", "중국": "CN", "대만": "TW", "인도": "IN", "말레이시아": "MY"
};

/** ⚠️ 이 배포판이 담당하는 국가 — 딱 한 곳만 고칩니다.
 *  EDM 생성기가 "MISUMI KOREA"/kr.misumi-ec.com을 코드에 그대로 박아두고 국가 선택 UI를
 *  두지 않는 것과 동일한 패턴입니다("소스는 하나, 배포는 국가별" 원칙 — LP_EDM_ARCHITECTURE.md 참고).
 *  LP 생성기 폼에도 언어 선택 드롭다운을 두지 않고, 이 값을 그대로 <html lang="..."> 등에 씁니다.
 *  다른 국가에 배포할 땐 이 한 줄만 바꾸면 됩니다. */
export const DEPLOYMENT_COUNTRY = "한국";
export const DEPLOYMENT_LANG = LP_LANGUAGE_CODES[DEPLOYMENT_COUNTRY];
export const DEPLOYMENT_COUNTRY_CODE = LP_COUNTRY_CODES[DEPLOYMENT_COUNTRY];

/** 코딩가이드 C-4에 정의된 디스크립션 필수 고정 문구 (끝에 반드시 포함되어야 함) */
export const LP_REQUIRED_DESCRIPTION_SUFFIX =
  "미스미 종합 Web 카탈로그, FA, 금형부품, 공구, 소모품의 검색, 인터넷 구매는 MISUMI";

/**
 * @param {string} html LP 생성기가 만든 완성 HTML
 * @param {object} meta { title, description, keywords, widthPattern } — 생성기 폼에서 입력받은 SEO 메타 정보
 * @returns {{level: "error"|"warning"|"info", message: string}[]}
 */
export function checkGuidelinesLP(html, meta = {}) {
  const issues = [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  // country를 명시적으로 안 넘기면 이 배포판의 고정 국가로 간주 (드롭다운이 없으므로 항상 이 값)
  const effectiveMeta = { country: DEPLOYMENT_COUNTRY_CODE, ...meta };

  // ---------- 공용 규칙 (EDM/LP 동일) ----------
  checkImgAlt(doc, issues);
  checkMinFontSize(html, issues);
  checkFontSizeNotPercent(html, issues);
  checkUtf8Charset(html, issues);
  checkFluorescentColors(html, issues);

  // ---------- 여기부터 LP 전용 규칙 (EDM과 반대인 것들 포함) ----------

  // 1. 테이블 레이아웃 금지 — EDM과 정반대! 출처: 코딩가이드 B-2 CSS "레이아웃을 위해 테이블 태그를 사용하지 말 것"
  //    표 형태의 실제 데이터(가격표 등)까지 막을 순 없어서, "레이아웃처럼 많이 쓰인" 경우만 감지합니다
  //    (완벽한 판정은 불가 — 테이블 3개 이상이면 레이아웃 목적일 가능성이 높다고 보고 경고).
  const tableCount = doc.querySelectorAll("table").length;
  if (tableCount >= 3) {
    issues.push({ level: "warning", message: `<table>이 ${tableCount}개 사용되었습니다 — LP는 레이아웃에 테이블 사용이 금지입니다(CSS로 구성하세요). 실제 표 데이터라면 무시해도 됩니다.` });
  }

  // 2. !important 사용 금지 — EDM과 정반대! 출처: 코딩가이드 B-2 CSS "!important는 기본적으로 사용 금지"
  //    (EDM은 반응형 스택 기법 때문에 !important가 사실상 필수라 정반대 규칙입니다)
  if (/!important/i.test(html)) {
    issues.push({ level: "warning", message: "!important가 사용되었습니다 — LP 코딩가이드상 기본적으로 금지입니다. 셀렉터 우선순위로 해결하세요." });
  }

  // 3. 외부 도메인 스크립트만 금지 (EDM처럼 script 태그 자체를 막지 않음 — jQuery 등 로컬/승인된 스크립트는 허용)
  //    출처: 코딩가이드 B-3 JavaScript "외부 도메인의 JavaScript를 불러오는 것은 금지"
  doc.querySelectorAll("script[src]").forEach(s => {
    const src = s.getAttribute("src");
    if (/^https?:\/\//.test(src) && !src.includes("misumi-ec.com")) {
      issues.push({ level: "error", message: `외부 도메인 스크립트가 포함되어 있습니다: ${src}` });
    }
  });

  // 4. UTF-8 BOM 없이 저장됐는지는 HTML 문자열만으로 확인 불가(파일 인코딩 문제) — 배포 파이프라인에서 체크 필요.
  //    여기서는 <meta charset=utf-8>만 확인합니다 (shared.checkUtf8Charset가 이미 처리).

  // 5. 컨텐츠 폭 패턴 선택 여부 확인
  if (meta.widthPattern && !(meta.widthPattern in LP_WIDTH_PATTERNS)) {
    issues.push({ level: "warning", message: `컨텐츠 폭(${meta.widthPattern}px)이 정의된 패턴(${Object.keys(LP_WIDTH_PATTERNS).join("/")}px)에 없습니다. 실제 지원 패턴인지 확인하세요.` });
  } else if (meta.widthPattern) {
    const pattern = LP_WIDTH_PATTERNS[meta.widthPattern];
    // 920px처럼 국가/페이지유형이 한정된 패턴인 경우, 지금 만드는 페이지가 그 조건에
    // 맞는지 확인합니다 (예: 920px은 한국 · 경제형 페이지에서만 써야 함).
    if (pattern.country && effectiveMeta.country && pattern.country !== effectiveMeta.country) {
      issues.push({ level: "error", message: `컨텐츠 폭 ${meta.widthPattern}px는 ${pattern.scope}인데, 지금 국가는 ${effectiveMeta.country}입니다.` });
    }
    if (pattern.pageType && meta.pageType && pattern.pageType !== meta.pageType) {
      issues.push({ level: "error", message: `컨텐츠 폭 ${meta.widthPattern}px는 ${pattern.scope}인데, 지금 페이지 유형은 ${meta.pageType}입니다.` });
    }
  }
  if (!meta.widthPattern) {
    issues.push({ level: "warning", message: "컨텐츠 폭 패턴이 선택되지 않았습니다." });
  }

  // 6. SEO 메타(타이틀/디스크립션/키워드) — 출처: 코딩가이드 C-4
  if (!meta.title) {
    issues.push({ level: "error", message: "타이틀이 비어있습니다." });
  } else if (meta.title.length > 35) {
    issues.push({ level: "warning", message: `타이틀이 35자를 초과합니다 (현재 ${meta.title.length}자) — 검색 결과에서 잘려 보일 수 있습니다.` });
  }

  if (!meta.description) {
    issues.push({ level: "error", message: "디스크립션이 비어있습니다." });
  } else {
    if (meta.description.length > 100) {
      issues.push({ level: "warning", message: `디스크립션이 100자를 초과합니다 (현재 ${meta.description.length}자).` });
    }
    if (!meta.description.trim().endsWith(LP_REQUIRED_DESCRIPTION_SUFFIX)) {
      issues.push({ level: "error", message: `디스크립션 마지막에 필수 고정 문구가 없습니다: "${LP_REQUIRED_DESCRIPTION_SUFFIX}"` });
    }
  }

  if (!meta.keywords || !meta.keywords.length) {
    issues.push({ level: "warning", message: "키워드가 입력되지 않았습니다 (5개 정도 권장)." });
  } else if (meta.keywords.length > 5) {
    issues.push({ level: "info", message: `키워드가 ${meta.keywords.length}개입니다 (5개 정도 권장, 초과해도 치명적이진 않음).` });
  }

  return issues;
}

/** guidelineCheck.js의 summarizeGuidelineIssues와 동일한 로직 — 필요하면 그쪽 걸 그대로 import해서 써도 됩니다. */
export function summarizeGuidelineIssuesLP(issues) {
  const errors = issues.filter(i => i.level === "error").length;
  const warnings = issues.filter(i => i.level === "warning").length;
  return { errors, warnings, pass: errors === 0 };
}
