// 실제 배포 시 이 목업 데이터는 DynamoDB(캠페인) / S3(에셋·템플릿) 조회로 교체합니다.
// API 연동 지점은 js/lib/api.js 의 각 함수를 참고하세요.

export const seedCampaigns = () => [
  {
    id: "c1",
    name: "KOR 웰컴 쿠폰 2026-07",
    category: "비상품계",
    type: "쿠폰형",
    segment: "신규",
    status: "검토중",
    createdAt: "2026.07.07"
  },
  {
    id: "c2",
    name: "이코노미 시리즈 소개",
    category: "상품계",
    type: "상품 소개형",
    segment: "-",
    status: "완료",
    createdAt: "2026.07.05"
  },
  {
    id: "c3",
    name: "THA 재참여 쿠폰",
    category: "비상품계",
    type: "쿠폰형",
    segment: "이탈 예측",
    status: "초안",
    createdAt: "2026.07.03"
  },
  {
    id: "c4",
    name: "KOR VIP 감사 쿠폰",
    category: "비상품계",
    type: "쿠폰형",
    segment: "육성",
    status: "완료",
    createdAt: "2026.06.30"
  }
];

export const seedAssets = () => [
  { id: "a1", filename: "coupon_use.jpg", category: "쿠폰 사용법", sizeKB: 48, uploadedAt: "2026.07.07" },
  { id: "a2", filename: "hero_bg_navy.jpg", category: "히어로 배경", sizeKB: 120, uploadedAt: "2026.07.06" },
  { id: "a3", filename: "hero_bg_green.jpg", category: "히어로 배경", sizeKB: 115, uploadedAt: "2026.07.06" },
  { id: "a4", filename: "product_shaft.jpg", category: "상품 이미지", sizeKB: 62, uploadedAt: "2026.07.05" },
  { id: "a5", filename: "product_bush.jpg", category: "상품 이미지", sizeKB: 55, uploadedAt: "2026.07.05" }
];

export const seedTemplates = () => [
  {
    id: "t1",
    name: "쿠폰 + 사용방법 안내",
    category: "비상품계",
    segment: "육성",
    blocks: ["히어로", "쿠폰", "사용방법 이미지", "본문", "푸터"]
  },
  {
    id: "t2",
    name: "웰컴 + 쿠폰",
    category: "비상품계",
    segment: "신규",
    blocks: ["히어로", "환영 본문", "쿠폰", "푸터"]
  },
  {
    id: "t3",
    name: "재참여 + 쿠폰",
    category: "비상품계",
    segment: "이탈 예측",
    blocks: ["히어로", "재참여 본문", "쿠폰", "푸터"]
  },
  {
    id: "t4",
    name: "상품 소개 기본형",
    category: "상품계",
    segment: "전체",
    blocks: ["헤더+캐치카피", "상품 리스트", "상품 설명", "CTA", "푸터"]
  }
];

// 세그먼트 → 추천 템플릿 매핑 (CMN-04)
export const segmentTemplateMap = {
  "신규": "t2",
  "육성": "t1",
  "이탈 예측": "t3"
};
