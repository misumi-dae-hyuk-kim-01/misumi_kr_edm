// ⚠️ 실서비스 연동 지점 — 새 Lambda를 만들지 않고, EDM용으로 이미 만들어져 있는
// fn-generate-copy(copyGenerator.js의 generateCopy())를 그대로 재사용합니다.
// 이 Lambda의 요청/응답 형태(purpose, fieldKeys, customPrompt → {필드키: 문구})가
// 이미 채널에 안 얽매인 범용 설계라, 백엔드 쪽은 전혀 안 건드립니다.
//
// ⚠️ 다만 Lambda의 시스템 프롬프트가 "당신은 ... EDM 마케팅 카피라이터입니다"로
// 고정되어 있어서, 지금은 LP 카피도 "이메일에 들어갈 글"이라는 전제로 만들어질
// 수 있습니다 — 우선 연결부터 하고, 실제로 써보면서 톤이 많이 어긋나면 그때
// Lambda 쪽에 channel 구분을 추가하는 걸 고려하면 됩니다.
//
// ⚠️ subjects는 배열인데, generateCopy()는 fieldKeys 하나당 문자열 하나만
// 돌려주는 구조라(EDM은 애초에 배열 필드가 없어서 이 제약이 문제된 적이 없었음),
// "subject_1/2/3"처럼 여러 개의 개별 필드키로 나눠 요청한 뒤 배열로 조립합니다.

import { generateCopy } from "./copyGenerator.js";

// pageType별 폴백 카피. EDM의 NON_PRODUCT_COPY(세그먼트별)와 같은 구조인데, LP는 세그먼트 대신
// 페이지 유형(경제형/일반형 등)으로 나뉩니다. pageType이 늘어나면 이 표에 항목만 추가하면 됩니다.
// ⚠️ 이제 "데모 목업"이 아니라 "API 실패 시 안전망"입니다 — generateCopy()가 참조하는
// copyApiUrl이 이미 채워져 있어서 항상 실제 API가 호출되고, 아래 폴백은 그 응답이
// 예외적으로 비어있을 때(네트워크 문제, AI가 이상하게 응답한 경우 등)만 씁니다.
// 완전히 없애면 그런 상황에서 화면이 통째로 깨지거나 아무것도 안 뜨게 되므로,
// "최소한 뭔가는 보여준다"는 안전망으로 계속 필요합니다.
const PAGE_TYPE_COPY = {
  "경제형": {
    subjects: [
      "합리적인 가격, 확실한 품질 — 경제형 시리즈",
      "가성비로 선택하는 이유가 있습니다",
      "경제형 시리즈로 비용은 줄이고 품질은 그대로"
    ],
    catchcopy: "합리적인 가격의 시작, 경제형 시리즈로",
    cta: "경제형 전상품 보러가기 →"
  },
  "일반형": {
    subjects: [
      "지금 확인해보세요",
      "새로운 시리즈를 만나보세요",
      "자세히 알아보기"
    ],
    catchcopy: "정밀함과 신뢰를 담은 시리즈",
    cta: "자세히 보기 →"
  }
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @param {{ pageType?: string, pageName?: string, categoryName?: string, instruction?: string }} input
 *   pageType: "경제형" | "일반형" 등 (없으면 "일반형" 취급)
 *   instruction: 마케터가 입력한 자유 프롬프트 (선택 — 실제 연동 시 정확도를 높이는 데 씁니다)
 * @returns {Promise<{ catchcopy: string, subjects: string[], cta: string }>}
 */
export async function generateCopyLP(input = {}) {
  const fieldKeys = ["catchcopy", "subject_1", "subject_2", "subject_3", "cta"];
  const result = await generateCopy(input.pageType || "", fieldKeys, input.instruction || "");
  // ⚠️ generateCopy()는 copyApiUrl이 채워져 있는 한 항상 실제 API를 호출합니다 —
  // 즉 여기 아래로 빠지는 건 "API 미연동"이 아니라 "API가 호출됐는데 요청한
  // 필드가 하나도 안 돌아온 예외 상황"입니다. 그럴 때만 이 파일의 폴백
  // (PAGE_TYPE_COPY)으로 대체합니다.
  if (!result.catchcopy && !result.subject_1) {
    await delay(200);
    return structuredClone(PAGE_TYPE_COPY[input.pageType] || PAGE_TYPE_COPY["일반형"]);
  }
  return {
    catchcopy: result.catchcopy || "",
    subjects: [result.subject_1, result.subject_2, result.subject_3].filter(Boolean),
    cta: result.cta || ""
  };
}

/** 필드별 재생성 (EDM의 regenerateField와 동일한 역할) — 데모에서는 후보 배열을 순환합니다 */
export async function regenerateFieldLP(input = {}, field) {
  await delay(450);
  const set = PAGE_TYPE_COPY[input.pageType] || PAGE_TYPE_COPY["일반형"];
  if (field === "catchcopy") return set.catchcopy;
  if (field === "cta") return set.cta;
  return set.subjects[Math.floor(Math.random() * set.subjects.length)];
}

/**
 * ⚠️ 이벤트 LP 전용 — "캠페인 설정 > 템플릿 > 캠페인 URL > 콘텐츠" 순서의
 * 콘텐츠 영역에서, 프롬프트 하나로 본문(KV 문구)과 SEO 메타(타이틀/설명/키워드)를
 * 한 번에 채웁니다. EDM의 "AI로 카피 자동 채우기"와 같은 패턴 — 지금까지는
 * 본문용 generateCopyLP()(pageType 기반, 프롬프트 없음)와 SEO용 generateSeoMeta()가
 * 완전히 분리되어 있어서 두 번 따로 요청해야 했는데, 이 함수가 그 둘을 하나의
 * 진입점으로 묶습니다.
 * @param {{ instruction?: string, title?: string }} input
 *   instruction: 마케터가 입력한 자유 프롬프트 (선택 — 비워도 동작은 하되, 있으면
 *   실제 연동 시 훨씬 정확한 결과를 만드는 데 씁니다)
 * @returns {Promise<{ kvBadge: string, kvHeadline: string, kvSubcopy: string,
 *   seoTitle: string, seoDescription: string, seoKeywords: string[] }>}
 */
export async function generateEventLpContent(input = {}) {
  const fieldKeys = ["kvBadge", "kvHeadline", "kvSubcopy", "seoTitle", "seoDescription", "keyword_1", "keyword_2", "keyword_3"];
  const result = await generateCopy(input.instruction || input.title || "이벤트", fieldKeys, input.instruction || "");
  if (result.kvHeadline || result.seoTitle) {
    return {
      kvBadge: result.kvBadge || "EVENT",
      // ⚠️ kvHeadline은 <em>강조</em> 마크업이 일부 들어가야 하는 특수 필드인데,
      // 지금 이 Lambda 프롬프트엔 이 마크업 규칙이 없어서 AI가 순수 텍스트만
      // 돌려줍니다. 마크업 없는 순수 텍스트를 그대로 쓰는 게, 잘못된 자리에
      // AI가 임의로 <em>을 넣는 것보다 안전합니다 — 강조하고 싶으면 마케터가
      // 결과를 미리보기에서 직접 편집하면 됩니다.
      kvHeadline: result.kvHeadline || "",
      kvSubcopy: result.kvSubcopy || "",
      seoTitle: result.seoTitle || "",
      seoDescription: result.seoDescription || "",
      seoKeywords: [result.keyword_1, result.keyword_2, result.keyword_3].filter(Boolean)
    };
  }
  // ---- API 실패 시 안전망 (요청한 필드가 하나도 안 왔을 때) ----
  await delay(200);
  const instruction = (input.instruction || "").trim();
  const topic = instruction || input.title || "신규 이벤트";
  return {
    kvBadge: "EVENT",
    kvHeadline: instruction ? `${instruction.slice(0, 24)}<em>지금 확인하세요</em>` : "이번 기회, <em>놓치지 마세요</em>",
    kvSubcopy: instruction ? `${instruction} — 지금 바로 만나보세요.` : "미스미가 준비한 특별한 혜택을 확인해보세요.",
    seoTitle: `${topic} 안내`,
    seoDescription: `${topic}에 대한 자세한 내용을 확인해보세요. 지금 바로 미스미에서 만나보세요.`,
    seoKeywords: ["미스미", "이벤트", ...(instruction ? [instruction.split(" ")[0]] : [])]
  };
}
