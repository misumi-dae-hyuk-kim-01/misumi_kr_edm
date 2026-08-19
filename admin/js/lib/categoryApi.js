// ⚠️ seriesApi.js와 완전히 동일한 패턴입니다 — 실서비스 연동 지점, FIELD_MAP 확장 방식,
// CORS 문제로 인한 백엔드 프록시 필요성까지 전부 그대로 적용됩니다. 궁금한 점이 있으면
// seriesApi.js의 주석을 먼저 참고하세요 (여기서는 카테고리 API와 다른 부분만 설명합니다).
//
// 실제 API 예시:
// https://api.kr.misumi-ec.com/api/v1/category/search?applicationId=...&lang=KOR&categoryCode=M0301030000
//
// ⚠️ CORS 주의 및 CONFIG.categoryApiUrl 사용법은 seriesApi.js와 동일합니다 — 브라우저에서
// 직접 호출하면 CORS에 막힐 가능성이 높고, 실서비스에서는 백엔드 프록시를 거쳐야 합니다.

export const CONFIG = {
  categoryApiUrl: "" // 예: "https://xxxx.execute-api.ap-northeast-2.amazonaws.com/category-search"
};

const MISUMI_DIRECT_API_BASE = "https://api.kr.misumi-ec.com/api/v1/category/search";
const APPLICATION_ID = "c77a7279-ff8b-4f62-b874-509d42c7c896"; // ⚠️ 예시 값 — 실서비스 발급 키로 교체 필요

/**
 * API 원본 응답(matched = categoryList[i])의 필드를 draft.category 계약 필드로 변환하는 매핑표.
 * seriesApi.js의 FIELD_MAP과 같은 확장 방식 — 새 필드가 필요하면 이 표에 한 줄만 추가하면 됩니다.
 *
 * ⚠️ 아직 어느 생성기 필드에 연결할지 정해지지 않아서, 우선 응답에 있는 걸 보이는 대로
 * 매핑해뒀습니다. 실제로 어떤 필드(섹션 제목/이미지/서브카피 등)에 쓸지 정해지면
 * generator.js/generatorLP.js 쪽 연결부만 추가하면 됩니다 (이 파일은 안 건드려도 됨).
 */
const FIELD_MAP = {
  name: matched => matched.categoryName || undefined,
  image: matched => normalizeImageUrl(matched.categoryImageUrl),
  description: matched => matched.categoryDetail || undefined,
  childCategories: matched => (matched.childCategoryList || []).map(c => c.categoryName).filter(Boolean)
};

function normalizeImageUrl(rawUrl) {
  if (!rawUrl) return undefined;
  return rawUrl.startsWith("//") ? "https:" + rawUrl : rawUrl; // 프로토콜 상대경로(//로 시작) 보정
}

/**
 * 카테고리 검색 API 원본 응답(JSON)에서 특정 categoryCode와 일치하는 항목을 찾아
 * draft.category 계약에 맞는 객체로 변환합니다 (필드 목록은 FIELD_MAP 참고).
 * 네트워크 호출과 분리해뒀습니다 — 이 함수만 따로 유닛 테스트하기 위함입니다.
 *
 * @param {object} apiResponse 미스미 카테고리 검색 API의 원본 JSON 응답
 * @param {string} code 사용자가 입력한 카테고리 코드
 * @returns {{code: string, [key: string]: any}} FIELD_MAP에 정의된 필드들이 code와 함께 채워짐
 */
export function parseCategoryResponse(apiResponse, code) {
  const matched = (apiResponse?.categoryList || []).find(c => c.categoryCode === code);
  if (!matched) {
    // 코드가 일치하는 카테고리를 못 찾음 (오탈자, 존재하지 않는 코드 등) — code만 채우고
    // 나머지는 호출부(generator.js 등)가 "연동 예정" 플레이스홀더로 표시하도록 비워둡니다.
    return { code };
  }

  const result = { code };
  for (const [field, extractor] of Object.entries(FIELD_MAP)) {
    result[field] = extractor(matched);
  }
  return result;
}

/**
 * 카테고리 코드 하나를 조회해서 결과 객체 하나를 반환합니다.
 * API 호출 자체가 실패(네트워크 오류, 404 등)하면 예외를 던집니다 — 호출부에서 코드별로
 * 개별 catch해서 "이 코드는 조회 실패"만 표시하고 나머지는 계속 진행하도록 하세요
 * (seriesApi.js의 fetchSeriesInfo와 동일한 호출 패턴을 그대로 쓰면 됩니다).
 */
export async function fetchCategoryInfo(code) {
  const url = CONFIG.categoryApiUrl
    ? `${CONFIG.categoryApiUrl}?categoryCode=${encodeURIComponent(code)}`
    : `${MISUMI_DIRECT_API_BASE}?applicationId=${APPLICATION_ID}&lang=KOR&categoryCode=${encodeURIComponent(code)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`카테고리 API 오류: ${res.status}`);
  const data = await res.json();
  return parseCategoryResponse(data, code);
}
