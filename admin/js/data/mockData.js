// 실제 배포 시 이 목업 데이터는 DynamoDB(캠페인) / S3(에셋·템플릿) 조회로 교체합니다.
// API 연동 지점은 js/lib/api.js 의 각 함수를 참고하세요.

import { EDM_TEMPLATE_FIELDS } from "./edmTemplateFields.js";

export const seedCampaigns = () => [
  {
    id: "c1",
    name: "7월 웰컴 쿠폰 안내",
    author: "김민지",
    channel: "EDM",
    purpose: "온보딩",
    templateName: "미스미 이해도 업 1",
    promotionName: "2026년 7월 경제형 프로모션",
    status: "완료",
    createdAt: "2026.07.07",
    updatedAt: "2026.07.08"
  },
  {
    id: "c2",
    name: "이코노미 시리즈 소개",
    author: "박준혁",
    channel: "EDM",
    purpose: "상품소개",
    templateName: "E품",
    promotionName: "2026년 7월 경제형 프로모션",
    status: "완료",
    createdAt: "2026.07.05",
    updatedAt: "2026.07.05"
  },
  {
    id: "c3",
    name: "휴면고객 재참여 쿠폰",
    author: "김민지",
    channel: "EDM",
    purpose: "이탈방지",
    templateName: "웰컴백 쿠폰혜택 안내",
    promotionName: "",
    status: "초안",
    createdAt: "2026.07.03",
    updatedAt: "2026.07.03"
  },
  {
    id: "c4",
    name: "VIP 감사 쿠폰",
    author: "이서연",
    channel: "EDM",
    purpose: "쿠폰",
    templateName: "쿠폰 안내",
    promotionName: "",
    status: "완료",
    createdAt: "2026.06.30",
    updatedAt: "2026.07.01"
  }
];

export const seedAssets = () => [
  { id: "a1", filename: "coupon_use.jpg", category: "쿠폰 사용법", sizeKB: 48, uploadedAt: "2026.07.07" },
  { id: "a2", filename: "hero_bg_navy.jpg", category: "히어로 배경", sizeKB: 120, uploadedAt: "2026.07.06" },
  { id: "a3", filename: "hero_bg_green.jpg", category: "히어로 배경", sizeKB: 115, uploadedAt: "2026.07.06" },
  { id: "a4", filename: "product_shaft.jpg", category: "상품 이미지", sizeKB: 62, uploadedAt: "2026.07.05" },
  { id: "a5", filename: "product_bush.jpg", category: "상품 이미지", sizeKB: 55, uploadedAt: "2026.07.05" }
];

// ⚠️ 아키텍처 전환: 예전엔 blocks.js의 블록 레지스트리 이름 배열("히어로","쿠폰" 등)이었는데,
// 실제 운영 템플릿 18개(js/data/edmTemplateHtml.js)가 완성된 HTML로 있어서, 이제 템플릿은
// "어떤 원본 HTML을 쓸지"(id) + "그 안에 뭘 채워야 하는지"(fields, edmTemplateFields.js)로
// 정의됩니다. 18개 목록 자체는 edmTemplateFields.js에서 자동으로 가져옵니다 — 새 템플릿을
// 추가할 때는 원본 HTML을 edmTemplateHtml.js에, 필드 스키마를 edmTemplateFields.js에
// 추가하기만 하면 이 목록에 자동으로 나타납니다 (여기 코드 수정 불필요).
export const seedTemplates = () => Object.entries(EDM_TEMPLATE_FIELDS).map(([id, info]) => ({
  id,
  name: info.name,
  purpose: info.purpose, // 온보딩 / 육성 / 이탈방지 / 상품소개 / 쿠폰 / 내부영업
  fields: info.fields
}));

// 캠페인 목적(purpose) → 대표 템플릿 1개. 목적을 고르면 일단 이 템플릿이 기본 선택되고,
// 같은 목적의 다른 템플릿으로 언제든 바꿀 수 있습니다 (예전 segmentTemplateMap의 역할을
// purpose 기준으로 이어받은 것 — 신규/육성/이탈예측이라는 세그먼트 축과, 상품그리드가
// 있는지는 무관하다는 걸 이번에 확인했기 때문입니다).
export const purposeDefaultTemplate = () => {
  const map = {};
  for (const [id, info] of Object.entries(EDM_TEMPLATE_FIELDS)) {
    if (!map[info.purpose]) map[info.purpose] = id;
  }
  return map;
};

// ⚠️ 하위 호환용 — 기존 segmentTemplateMap을 쓰는 코드가 있다면 이 매핑으로 당분간 동작합니다.
// 신규→온보딩, 육성→육성, 이탈 예측→이탈방지로 대응시켰습니다. 새 코드는 purposeDefaultTemplate()을
// 쓰는 걸 권장합니다 — "세그먼트"와 "목적"은 이름이 비슷해도 서로 다른 개념입니다.
export const segmentTemplateMap = (() => {
  const byPurpose = purposeDefaultTemplate();
  return {
    "신규": byPurpose["온보딩"],
    "육성": byPurpose["육성"],
    "이탈 예측": byPurpose["이탈방지"]
  };
})();
