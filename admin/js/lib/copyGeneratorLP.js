// ⚠️ 실서비스 연동 지점 (copyGenerator.js와 동일한 패턴)
// LP의 캐치카피/서브젝트/CTA를 Claude API로 자동 생성합니다. 실 연동 시 CONFIG.copyApiUrl에
// fn-generate Lambda(또는 그 확장)를 넣고, 목업 분기를 fetch 호출로 교체하세요.
//
// ⚠️ 아직 LP 생성기 자체가 없어서 이 파일은 어디서도 import되지 않는 미연결 상태입니다.

export const CONFIG = {
  copyApiUrl: "" // 예: "https://xxxx.execute-api.ap-northeast-2.amazonaws.com/generate-lp-copy"
};

// pageType별 목업 카피. EDM의 NON_PRODUCT_COPY(세그먼트별)와 같은 구조인데, LP는 세그먼트 대신
// 페이지 유형(경제형/일반형 등)으로 나뉩니다. pageType이 늘어나면 이 표에 항목만 추가하면 됩니다.
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
  if (CONFIG.copyApiUrl) {
    const res = await fetch(CONFIG.copyApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!res.ok) throw new Error("LP 카피 생성 API 오류: " + res.status);
    return res.json();
  }

  // ---- 데모 목업 (지연으로 실제 생성 느낌 재현) ----
  await delay(650);
  return structuredClone(PAGE_TYPE_COPY[input.pageType] || PAGE_TYPE_COPY["일반형"]);
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
  if (CONFIG.copyApiUrl) {
    const res = await fetch(CONFIG.copyApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, target: "event-lp-full" })
    });
    if (!res.ok) throw new Error("이벤트 LP 콘텐츠 생성 API 오류: " + res.status);
    return res.json();
  }

  // ---- 데모 목업 ----
  await delay(700);
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
