// LP 템플릿 레지스트리. blocks.js(EDM)/blocksLP.js와 같은 블록 레지스트리 패턴을 씁니다 —
// 여기 blocks 배열이 실제 렌더링 순서의 단일 출처입니다 (js/lib/blocksLP.js의 blockRegistry
// 키와 이름이 정확히 일치해야 합니다).
//
// ⚠️ 일부러 mockData.js/state.js에 안 넣고 이 파일로 분리했습니다 — mockData.js/state.js는
// 개발팀이 시리즈 API 연동 작업 중인 파일이라, 지금은 안 건드리는 게 안전합니다. LP 템플릿은
// 사용자가 편집하는 데이터가 아니라 코드가 정의하는 고정 목록이라, store를 거치지 않고
// 이렇게 별도 모듈로 export해도 아무 문제 없습니다. 나중에 개발팀 작업이 끝나고 나면
// mockData.js의 seedTemplates()와 이 파일을 하나로 합치는 것도 고려해볼 수 있습니다.

export const seedLpTemplates = () => [
  {
    id: "lp1",
    name: "기본형 (히어로 + 추천상품 + 본문)",
    pageType: "전체",
    blocks: ["브레드크럼", "히어로", "추천상품 그리드", "본문"]
  }
];
