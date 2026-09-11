// ⚠️ 실서비스 연동 지점 — 새 Lambda를 만들거나 기존 Lambda를 수정하지 않고,
// EDM용으로 이미 만들어져 있는 fn-generate-copy(copyGenerator.js의 generateCopy())를
// 그대로 재사용합니다. EDM(generator.js의 runGenerateCopy())이 하는 것과 똑같이,
// 특별한 이름을 지어내지 않고 이 함수가 실제로 다루는 필드명(title, description)을
// 그대로 fieldKeys로 보냅니다 — "title"/"description"은 Lambda의 특별 패턴
// (headline/sub/btn_ 등)에 안 걸려서 "그 외: 자연스러운 마케팅 카피" 규칙으로
// 처리되지만, 글자수 제한(35자/100자)은 이 파일이 이미 클라이언트 쪽에서
// trimTitle()/buildDescription()으로 강제하고 있으므로 문제 없습니다.
//
// ⚠️ 2026-09 수정 — 이 파일이 원래 자체적으로 "MISUMI｜미스미 종합 Web 카탈로그"
// 접미사를 title에 붙이고 있었는데, 카탈로그 템플릿의 resolveCatalogSeoMeta()가
// 여기서 나온 title에 LP_TITLE_SUFFIX를 또 붙이면서 접미사가 두 번 겹치는 버그가
// 있었습니다(예: "...카탈로그 ｜ MISUMI｜미스미 종합 Web 카탈로그"). 접미사는
// 배포 조립 시점(각 템플릿의 LP_TITLE_SUFFIX 로직)에서만 붙이기로 하고, 여기서는
// 순수 제목(접미사 없음)만 만들도록 정리했습니다 — 대신 접미사 길이를 미리 감안해서
// TITLE_MAX보다 더 짧게 잘라야, 나중에 접미사가 붙었을 때 최종 결과가 35자를
// 넘지 않습니다.
//
// ⚠️ 디스크립션의 가이드라인 필수 고정 문구(LP_REQUIRED_DESCRIPTION_SUFFIX)는
// 절대 AI가 생성하게 하지 않고 계속 여기서 기계적으로 붙입니다 — 정확한 문구가
// 매번 100% 재현되어야 하기 때문입니다(이 원칙은 그대로 유지).

// ⚠️ 2026-09 재수정 — description도 title과 똑같은 원칙으로 바꿨습니다. 예전엔
// 이 파일이 buildDescription()에서 필수 고정 문구를 즉시 붙여서 반환했는데,
// blocksLP.js에 withRequiredDescriptionSuffix()가 새로 생겨서 배포 조립 시점에
// 항상 자동으로 붙여주게 됐습니다 — 그러니 이 파일이 미리 붙여서 반환하면
// title(접미사 없이 순수하게 반환)과 처리 방식이 어긋나고, 관리자 화면에서
// "타이틀엔 안 보이는 접미사가 디스크립션엔 미리 보인다"는 혼란을 줬습니다.
// 이제 여기도 순수 hook 문구만 반환하고, 필수 고정 문구는 배포 시점에만
// 붙습니다 — 대신 길이 제한(100자)에서 고정 문구 길이만큼을 미리 빼서 자릅니다
// (title이 LP_TITLE_SUFFIX 길이를 미리 빼는 것과 동일한 원리).

import { LP_REQUIRED_DESCRIPTION_SUFFIX } from "./guidelineCheckLP.js";
import { generateCopy } from "./copyGenerator.js";
import { LP_TITLE_SUFFIX } from "./blocksLP.js";

const TITLE_MAX = 35;
const DESCRIPTION_MAX = 100;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @param {{ contentName: string, parentCategory?: string, keywordHint?: string }} input
 *   contentName: 컨텐츠명(필수), parentCategory: 상위 카테고리명(있으면 타이틀 예2 형식 사용)
 * @returns {Promise<{ title: string, description: string, keywords: string[] }>}
 *   ⚠️ title/description 둘 다 접미사(LP_TITLE_SUFFIX / LP_REQUIRED_DESCRIPTION_SUFFIX)
 *   없는 순수 내용입니다 — 배포 조립 시점에 각 템플릿이 알아서 붙입니다. 여기서
 *   반환하는 값은 형식 규정(35자/100자+키워드 개수, 접미사 붙을 걸 미리 감안한 여유
 *   길이)에 맞게 이미 다듬어진 상태입니다 — 그래도 실제로 규정을 지켰는지는
 *   항상 guidelineCheckLP.js로 재검증하세요(AI 생성물은 100% 신뢰하지 말고, 우리가
 *   이미 만든 체커로 다시 한번 걸러야 합니다).
 */
export async function generateSeoMeta({ contentName, parentCategory, keywordHint }) {
  const purpose = parentCategory ? `${contentName} (상위: ${parentCategory})` : contentName;
  // ⚠️ 이 Lambda엔 SEO 전용 필드 패턴이 없어서, 이미 있는 패턴("headline"→25자
  // 이내, "desc_"로 시작→한 문장 설명)에 맞는 이름으로 요청합니다. headline은
  // 25자 이내로 나오므로 SEO 타이틀 제한(35자)엔 항상 여유 있게 걸립니다.
  const fieldKeys = ["title", "description", "keyword_1", "keyword_2", "keyword_3", "keyword_4", "keyword_5"];
  const promptNote = "description 필드는 뒤에 안내 문구가 자동으로 더 붙을 예정이니, 50자 이내의 도입부 한 문장만 작성해주세요.";
  const customPrompt = keywordHint ? `${keywordHint}\n\n${promptNote}` : promptNote;
  const result = await generateCopy(purpose, fieldKeys, customPrompt);
  if (result.title || result.description) {
    // ⚠️ AI가 만든 원문 그대로 쓰지 않고, 여전히 이 파일의 길이 제한 로직을
    // 거칩니다 — AI는 글자수를 어길 수 있기 때문입니다.
    const title = trimTitle(result.title || contentName);
    const description = trimDescription(result.description || `${contentName} 관련 최신 정보를 지금 바로 확인해보세요.`);
    const keywords = [result.keyword_1, result.keyword_2, result.keyword_3, result.keyword_4, result.keyword_5]
      .filter(Boolean).slice(0, 5);
    return { title, description, keywords: keywords.length ? keywords : buildKeywords(contentName, keywordHint) };
  }

  // ---- 데모 목업 (요청한 필드가 하나도 안 왔을 때) ----
  await delay(600);

  const title = trimTitle(contentName);
  const description = trimDescription(buildDescriptionHook(contentName));
  const keywords = buildKeywords(contentName, keywordHint);

  return { title, description, keywords };
}

/** 순수 제목(접미사 없음)을 만듭니다. 나중에 LP_TITLE_SUFFIX가 뒤에 붙을 걸
 *  감안해서, 그만큼을 미리 제외한 길이로 자릅니다. */
function trimTitle(contentName) {
  const room = TITLE_MAX - LP_TITLE_SUFFIX.length;
  return contentName.length > room ? contentName.slice(0, Math.max(0, room)) : contentName;
}

/** 순수 디스크립션(필수 고정 문구 없음)을 만듭니다. 나중에
 *  LP_REQUIRED_DESCRIPTION_SUFFIX가 뒤에 붙을 걸 감안해서(공백 1자 포함),
 *  그만큼을 미리 제외한 길이로 자릅니다. */
function trimDescription(hook) {
  const separator = " ";
  const room = DESCRIPTION_MAX - LP_REQUIRED_DESCRIPTION_SUFFIX.length - separator.length;
  return hook.length > room ? hook.slice(0, Math.max(0, room)) : hook;
}

/** 디스크립션의 "후킹 문구" 부분만 AI가 생성한다고 가정한 목업 (실제로는 Claude가 채울 부분) */
function buildDescriptionHook(contentName) {
  return `${contentName} 관련 최신 정보를 지금 바로 확인해보세요.`;
}

/** 키워드 5개 목업 — 실제로는 contentName/keywordHint 기반으로 Claude가 생성 */
function buildKeywords(contentName, keywordHint) {
  const base = [contentName, "미스미", "MISUMI"];
  if (keywordHint) base.push(keywordHint);
  while (base.length < 5) base.push(`관련상품${base.length}`);
  return base.slice(0, 5);
}
