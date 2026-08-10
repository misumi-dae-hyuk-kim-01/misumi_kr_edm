// ⚠️ 실서비스 연동 지점
// Phase 1 요건(CMN-05)의 AI 카피 자동생성은 Lambda(fn-generate) → Claude API 호출로 구현됩니다.
// 이 데모에서는 백엔드 없이 목업 카피를 반환합니다. 실 연동 시 CONFIG.copyApiUrl을
// API Gateway 엔드포인트로 바꾸고, generateCopy()의 목업 분기를 fetch 호출로 교체하세요.
//
// ⚠️ 아키텍처 전환: 예전엔 category(상품/비상품)+segment 조합별로 고정된 필드(catchcopy,
// headline 등)를 채웠는데, 이제 템플릿마다 필드 구성이 달라서 "이 템플릿이 요구하는 필드
// 키 목록"을 받아서 그만큼만 돌려주는 방식으로 바꿨습니다. customPrompt는 카피 생성뿐 아니라
// (나중에 연동될) 이미지 선택/편집에도 같은 값이 쓰입니다 — 여기서는 카피에만 반영합니다.
export const CONFIG = {
  copyApiUrl: "" // 예: "https://xxxx.execute-api.ap-northeast-2.amazonaws.com/generate-copy"
};

// 목적별 데모 문구 후보. 실제 필드 키와 무관하게 "이런 느낌의 문구"만 후보로 갖고 있고,
// 실제 반환 시에는 요청받은 fieldKeys 개수만큼 순환해서 채웁니다.
const PURPOSE_PHRASES = {
  "온보딩": {
    headline: ["미스미 코리아에 오신 것을 환영합니다", "가입을 환영합니다 — 첫 구매 혜택 확인", "신규 회원님을 위한 안내"],
    sub: ["회원가입을 축하드리며 첫 구매 혜택을 안내드립니다.", "미스미 서비스를 하나씩 소개해드릴게요.", "지금 바로 확인해보세요."],
    button: ["첫 주문 혜택 확인 →", "자세히 보기", "지금 확인하기"]
  },
  "육성": {
    headline: ["자주 찾아주셔서 감사합니다", "지금 필요한 정보를 모아봤습니다", "이런 정보도 도움이 될 거예요"],
    sub: ["이용해 주신 고객님께 도움이 될 정보를 안내드립니다.", "필요하실 때 바로 찾아보세요.", "더 편리하게 이용하는 방법을 소개합니다."],
    button: ["더 알아보기 →", "자세히 보기", "지금 확인하기"]
  },
  "이탈방지": {
    headline: ["그동안 잘 지내셨나요?", "오랜만입니다, 다시 찾아주세요", "놓치신 혜택이 있어요"],
    sub: ["한동안 뵙지 못해 다시 찾아주실 수 있도록 준비했습니다.", "특별한 혜택을 드리고 싶어요.", "다시 만나서 반갑습니다."],
    button: ["재참여 혜택 받기 →", "지금 확인하기", "혜택 받기"]
  },
  "상품소개": {
    headline: ["정밀 가공의 시작, 리니어 샤프트로", "지금 만나보세요, 이번 주 추천 상품", "합리적인 가격, 확실한 품질"],
    sub: ["신제품을 지금 확인해보세요.", "이번 주 추천 상품을 소개합니다.", "다양한 상품을 한눈에 확인하세요."],
    button: ["지금 구매하기", "상품 보러가기", "자세히 보기"]
  },
  "쿠폰": {
    headline: ["특별한 혜택을 준비했습니다", "지금이 기회입니다", "쿠폰으로 더 알차게"],
    sub: ["기간 한정 쿠폰을 확인해보세요.", "이번 주만 진행되는 혜택입니다.", "지금 바로 사용해보세요."],
    button: ["혜택 받기", "지금 확인하기", "쿠폰 사용하기"]
  },
  "내부영업": {
    headline: ["전문 상담사가 도와드립니다", "이용 방법을 안내드립니다", "더 편리하게 이용하는 법"],
    sub: ["궁금한 점이 있으시면 언제든 문의해주세요.", "이런 방법으로도 이용 가능합니다.", "전문 상담을 받아보세요."],
    button: ["상담 신청하기", "자세히 보기", "지금 문의하기"]
  }
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function pick(arr, i) {
  return arr[i % arr.length];
}

/**
 * @param {string} purpose 온보딩/육성/이탈방지/상품소개/쿠폰/내부영업
 * @param {string[]} fieldKeys 이 템플릿이 요구하는 텍스트 필드 키 목록 (예: ["copy_headline","main_1","sub_1"])
 * @param {string} [customPrompt] 담당자가 입력한 추가 지시사항(선택) — 실 연동 시 그대로 Claude에게 전달
 * @returns {Promise<Record<string,string>>} { 필드키: 생성된 문구 }
 */
export async function generateCopy(purpose, fieldKeys, customPrompt) {
  if (CONFIG.copyApiUrl) {
    const res = await fetch(CONFIG.copyApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose, fieldKeys, customPrompt: customPrompt || "" })
    });
    if (!res.ok) throw new Error("카피 생성 API 오류: " + res.status);
    return res.json();
  }

  // ---- 데모 목업 (지연으로 실제 생성 느낌 재현) ----
  await delay(650);
  const phrases = PURPOSE_PHRASES[purpose] || PURPOSE_PHRASES["온보딩"];
  const note = customPrompt && customPrompt.trim()
    ? ` (요청사항 반영 예정: "${customPrompt.trim().slice(0, 24)}")`
    : "";

  const result = {};
  let headlineUsed = false;
  fieldKeys.forEach((key, i) => {
    if (/headline/.test(key) && !headlineUsed) {
      result[key] = pick(phrases.headline, 0) + note;
      headlineUsed = true;
    } else if (/^btn_|^cta_label|button/.test(key)) {
      result[key] = pick(phrases.button, i);
    } else if (/^main_/.test(key)) {
      result[key] = pick(phrases.headline, i);
    } else {
      result[key] = pick(phrases.sub, i);
    }
  });
  return result;
}

/** 필드 하나만 재생성 — 데모에서는 같은 후보 배열을 순환합니다 */
export async function regenerateField(purpose, fieldKey) {
  await delay(450);
  const phrases = PURPOSE_PHRASES[purpose] || PURPOSE_PHRASES["온보딩"];
  const pool = /^btn_|^cta_label/.test(fieldKey) ? phrases.button
    : /headline|^main_/.test(fieldKey) ? phrases.headline
    : phrases.sub;
  return pool[Math.floor(Math.random() * pool.length)];
}
