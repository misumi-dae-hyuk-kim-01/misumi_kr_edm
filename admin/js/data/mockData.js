// 실제 배포 시 이 목업 데이터는 DynamoDB(캠페인) / S3(에셋·템플릿) 조회로 교체합니다.
// API 연동 지점은 js/lib/api.js 의 각 함수를 참고하세요.

export const seedCampaigns = () => [
  {
    id: "c1",
    name: "KOR 웰컴 쿠폰 2026-07",
    channel: "EDM",
    category: "비상품계",
    type: "쿠폰형",
    segment: "신규",
    status: "검토중",
    createdAt: "2026.07.07"
  },
  {
    id: "c2",
    name: "이코노미 시리즈 소개",
    channel: "EDM",
    category: "상품계",
    type: "상품 소개형",
    segment: "-",
    status: "완료",
    createdAt: "2026.07.05"
  },
  {
    id: "c3",
    name: "THA 재참여 쿠폰",
    channel: "EDM",
    category: "비상품계",
    type: "쿠폰형",
    segment: "이탈 예측",
    status: "초안",
    createdAt: "2026.07.03"
  },
  {
    id: "c4",
    name: "KOR VIP 감사 쿠폰",
    channel: "EDM",
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
    id: "t5",
    name: "상품 카테고리형 (추천상품 그리드 + 관련상품)",
    category: "상품계",
    segment: "전체",
    blocks: ["히어로", "추천상품 그리드", "전상품 CTA", "관련상품", "상세보기 CTA", "푸터"],
    // ⭐ 자동 추천용 메타데이터. 템플릿이 늘어나면 각 템플릿에 이 필드를 채우는 것만으로
    // js/lib/templateRecommender.js가 자동으로 더 정교하게 추천합니다 (코드 수정 불필요).
    // minProducts/maxProducts: 이 템플릿이 적합한 상품 개수 범위. tags: 상황별 적합도 태그.
    recommend: { minProducts: 1, tags: ["다품목", "그리드형"] }
    // ⚠️ 실서비스 연동 지점: 위 blocks 배열의 각 항목은 S3(kor-smartlp/edm/templates/blocks/)의
    // 개별 .mjml 파일 하나씩과 1:1 대응됩니다 (어떤 블록명이 어떤 파일인지는 같은 폴더의
    // manifest.json 참고, 로컬 blockRegistry 키와도 동일). 이 템플릿 하나를 담은 단일 파일은
    // 없습니다 — 블록을 이 순서대로 이어붙여 컴파일하는 것이 "이 템플릿을 렌더링한다"는 뜻입니다.
  }
];

// 세그먼트 → 추천 템플릿 매핑 (CMN-04)
export const segmentTemplateMap = {
  "신규": "t2",
  "육성": "t1",
  "이탈 예측": "t3"
};
