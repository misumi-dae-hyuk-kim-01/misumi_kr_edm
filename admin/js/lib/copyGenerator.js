// ⚠️ 실서비스 연동 지점
// Phase 1 요건(CMN-05)의 AI 카피 자동생성은 Lambda(fn-generate) → Claude API 호출로 구현됩니다.
// 이 데모에서는 백엔드 없이 목업 카피를 반환합니다. 실 연동 시 아래 CONFIG.copyApiUrl 을
// API Gateway 엔드포인트로 바꾸고, generateCopy()의 목업 분기를 fetch 호출로 교체하세요.
export const CONFIG = {
  copyApiUrl: "" // 예: "https://xxxx.execute-api.ap-northeast-2.amazonaws.com/generate-copy"
};

const NON_PRODUCT_COPY = {
  "신규": {
    subjects: [
      "미스미 코리아 첫 주문, 특별한 혜택을 드려요",
      "가입을 환영합니다 — 첫 구매 혜택 확인",
      "신규 회원님께 드리는 첫 주문 쿠폰"
    ],
    headline: "미스미 코리아에 오신 것을 환영합니다",
    body: "회원가입을 축하드리며 첫 구매 혜택을 안내드립니다.",
    cta: "첫 주문 혜택 확인 →"
  },
  "육성": {
    subjects: [
      "지금 사용하지 않으면 사라지는 혜택",
      "육성 고객님을 위한 추가 할인 쿠폰",
      "다음 주문에 바로 쓰는 할인 코드"
    ],
    headline: "자주 찾아주셔서 감사합니다",
    body: "이용해 주신 고객님께 추가 할인 쿠폰을 드립니다.",
    cta: "쿠폰 사용방법 보기 →"
  },
  "이탈 예측": {
    subjects: [
      "오랜만입니다, 다시 찾아주세요",
      "놓치신 혜택이 있어요",
      "돌아오시면 드리는 특별 쿠폰"
    ],
    headline: "그동안 잘 지내셨나요?",
    body: "한동안 뵙지 못해 다시 찾아주실 수 있도록 쿠폰을 준비했습니다.",
    cta: "재참여 쿠폰 받기 →"
  }
};

const PRODUCT_COPY = {
  catchcopy: "정밀 가공의 시작, 리니어 샤프트로",
  subject: "이코노미 시리즈 신제품, 지금 만나보세요",
  cta: "지금 구매하기"
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @param {"non-product"|"product"} category
 * @param {string} segment 비상품계일 때만 사용 (신규/육성/이탈 예측)
 */
export async function generateCopy(category, segment) {
  if (CONFIG.copyApiUrl) {
    const res = await fetch(CONFIG.copyApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, segment })
    });
    if (!res.ok) throw new Error("카피 생성 API 오류: " + res.status);
    return res.json();
  }

  // ---- 데모 목업 (지연으로 실제 생성 느낌 재현) ----
  await delay(650);
  if (category === "product") return structuredClone(PRODUCT_COPY);
  return structuredClone(NON_PRODUCT_COPY[segment] || NON_PRODUCT_COPY["신규"]);
}

/** 섹션별 재생성 (CMN-06, CMN-19) — 데모에서는 후보 배열을 순환합니다 */
export async function regenerateField(category, segment, field) {
  await delay(450);
  if (category === "product") {
    if (field === "catchcopy") {
      const alt = ["정밀함이 만드는 차이, 이코노미 시리즈", "합리적인 가격, 확실한 품질", "지금 리니어 샤프트를 만나보세요"];
      return alt[Math.floor(Math.random() * alt.length)];
    }
    return PRODUCT_COPY.cta;
  }
  const set = NON_PRODUCT_COPY[segment] || NON_PRODUCT_COPY["신규"];
  if (field === "headline") return set.headline;
  if (field === "body") return set.body;
  if (field === "cta") return set.cta;
  return set.subjects[Math.floor(Math.random() * set.subjects.length)];
}
