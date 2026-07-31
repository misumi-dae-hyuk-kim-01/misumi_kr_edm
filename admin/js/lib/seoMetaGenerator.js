// ⚠️ 실서비스 연동 지점
// LP의 타이틀/디스크립션/키워드를 Claude API로 자동 생성합니다.
// copyGenerator.js(EDM 카피 자동생성)와 동일한 패턴입니다 — 실 연동 시 CONFIG.seoApiUrl에
// fn-generate Lambda(또는 그 확장)를 넣고, 아래 목업 분기를 fetch 호출로 교체하세요.
// fn-generate를 그대로 확장해서 쓸지, 새 함수로 뺄지는 개발팀 인프라 판단에 맡깁니다
// (SERIES_API_CONTRACT.md에도 같은 논의가 있습니다).

import { LP_REQUIRED_DESCRIPTION_SUFFIX } from "./guidelineCheckLP.js";

export const CONFIG = {
  seoApiUrl: "" // 예: "https://xxxx.execute-api.ap-northeast-2.amazonaws.com/generate-seo-meta"
};

const TITLE_MAX = 35;
const DESCRIPTION_MAX = 100;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @param {{ contentName: string, parentCategory?: string, keywordHint?: string }} input
 *   contentName: 컨텐츠명(필수), parentCategory: 상위 카테고리명(있으면 타이틀 예2 형식 사용)
 * @returns {Promise<{ title: string, description: string, keywords: string[] }>}
 *   ⚠️ 여기서 반환하는 값은 형식 규정(35자/100자+고정문구/키워드 개수)에 맞게 이미 다듬어진
 *   상태입니다 — 그래도 실제로 규정을 지켰는지는 항상 guidelineCheckLP.js로 재검증하세요
 *   (AI 생성물은 100% 신뢰하지 말고, 우리가 이미 만든 체커로 다시 한번 걸러야 합니다).
 */
export async function generateSeoMeta({ contentName, parentCategory, keywordHint }) {
  if (CONFIG.seoApiUrl) {
    const res = await fetch(CONFIG.seoApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentName, parentCategory, keywordHint })
    });
    if (!res.ok) throw new Error("SEO 메타 생성 API 오류: " + res.status);
    return res.json();
  }

  // ---- 데모 목업 ----
  await delay(600);

  const title = buildTitle(contentName, parentCategory);
  const hook = buildDescriptionHook(contentName);
  const description = buildDescription(hook);
  const keywords = buildKeywords(contentName, keywordHint);

  return { title, description, keywords };
}

/** 타이틀: "컨텐츠명 | (상위카테고리명 |) MISUMI｜미스미 종합 Web 카탈로그" 형식.
 *  35자를 넘으면 브랜드 고정 문구는 그대로 두고, 먼저 상위카테고리를 생략 → 그래도 길면
 *  컨텐츠명만 줄입니다 (고정 문구를 중간에서 잘라버리면 브랜드 표기가 깨지므로 우선순위를 이렇게 둡니다). */
function buildTitle(contentName, parentCategory) {
  const suffix = "MISUMI｜미스미 종합 Web 카탈로그";

  if (parentCategory) {
    const withParent = `${contentName} | ${parentCategory} | ${suffix}`;
    if (withParent.length <= TITLE_MAX) return withParent;
  }

  const withoutParent = `${contentName} | ${suffix}`;
  if (withoutParent.length <= TITLE_MAX) return withoutParent;

  // 그래도 길면 컨텐츠명만 줄여서 고정 문구는 보존
  const room = TITLE_MAX - suffix.length - 3; // " | " 구분자 길이만큼 제외
  const trimmedName = contentName.slice(0, Math.max(0, room));
  return `${trimmedName} | ${suffix}`;
}

/** 디스크립션의 "후킹 문구" 부분만 AI가 생성한다고 가정한 목업 (실제로는 Claude가 채울 부분) */
function buildDescriptionHook(contentName) {
  return `${contentName} 관련 최신 정보를 지금 바로 확인해보세요.`;
}

/** 후킹 문구 + 고정 문구를 합쳐서 최종 디스크립션 조립. 고정 문구는 절대 AI가 생성하게 하지 않고
 *  여기서 기계적으로 이어붙입니다 — 정확한 문구가 매번 100% 재현되어야 하기 때문입니다. */
function buildDescription(hook) {
  const separator = " ";
  const maxHookLen = DESCRIPTION_MAX - LP_REQUIRED_DESCRIPTION_SUFFIX.length - separator.length;
  const trimmedHook = hook.length > maxHookLen ? hook.slice(0, Math.max(0, maxHookLen)) : hook;
  return `${trimmedHook}${separator}${LP_REQUIRED_DESCRIPTION_SUFFIX}`;
}

/** 키워드 5개 목업 — 실제로는 contentName/keywordHint 기반으로 Claude가 생성 */
function buildKeywords(contentName, keywordHint) {
  const base = [contentName, "미스미", "MISUMI"];
  if (keywordHint) base.push(keywordHint);
  while (base.length < 5) base.push(`관련상품${base.length}`);
  return base.slice(0, 5);
}
