// ⚠️ 참고 예시 구현 — 현재 generator.js에서 이 파일을 import/호출하지 않습니다.
// 시리즈 API 실연동은 개발팀에서 직접 진행하기로 했습니다. 이 파일은 그때 그대로 갖다 쓰거나
// 참고하시라고 만들어둔 예시입니다 (실제 API 응답으로 파싱 로직까지 테스트 완료된 상태).
// generator.js에 연결하려면: 상단에 `import { fetchSeriesInfo } from "../lib/seriesApi.js";` 추가 후
// lookupSeriesCodes() 안의 주석 처리된 예시 코드를 그대로 활성화하면 됩니다.
//
// ⚠️ 실서비스 연동 지점 (SERIES_API_CONTRACT.md 참고)
// 미스미 시리즈 검색 API 실제 응답을 draft.products 계약(code/name/image/price)으로 변환합니다.
//
// 실제 API 예시:
// https://api.kr.misumi-ec.com/api/v1/series/search?applicationId=...&lang=KOR&seriesCode=110302580750&field=%40search
//
// ⚠️ CORS 주의: 위 API를 브라우저에서 직접 fetch하면 도메인이 달라 CORS 정책에 막힐 가능성이 높습니다.
// applicationId도 브라우저 코드에 그대로 두면 노출됩니다. 실서비스에서는 CONFIG.seriesApiUrl에
// 백엔드(Lambda 등) 프록시 엔드포인트를 넣고, 그 프록시가 실제 미스미 API를 호출하도록 구성하세요.
// CONFIG.seriesApiUrl이 비어 있는 지금은 데모이므로 미스미 API를 브라우저에서 직접 호출하도록
// 되어 있습니다 — 로컬 개발 중 CORS 에러가 나면 정상입니다 (백엔드 프록시 필요하다는 신호입니다).

export const CONFIG = {
  seriesApiUrl: "" // 예: "https://xxxx.execute-api.ap-northeast-2.amazonaws.com/series-search"
};

const MISUMI_DIRECT_API_BASE = "https://api.kr.misumi-ec.com/api/v1/series/search";
const APPLICATION_ID = "c77a7279-ff8b-4f62-b874-509d42c7c896"; // ⚠️ 예시 값 — 실서비스 발급 키로 교체 필요

/**
 * API 원본 응답(matched = seriesList[i])의 필드를 draft.products 계약 필드로 변환하는 매핑표.
 *
 * ⚠️ 새 템플릿이 지금 안 쓰는 정보를 필요로 할 때 (예: 재고, 리뷰 수, 카테고리 태그 등)
 * 이 표에 한 줄만 추가하면 됩니다. 다른 코드(fetchSeriesInfo, generator.js 등)는 안 건드려도 됩니다.
 *
 *   1. 아래 FIELD_MAP에 `필드명: matched => 변환값` 한 줄 추가
 *   2. SERIES_API_CONTRACT.md의 매핑표에 같은 줄 추가 (문서 동기화용)
 *   3. 그 필드를 화면에 쓰고 싶은 템플릿의 블록 함수(blocks.js)에서 사용
 *
 * extractor가 undefined를 반환하면 그 필드는 그냥 비어있는 것으로 처리되어
 * blocks.js가 "OO 연동 예정" 플레이스홀더를 표시합니다 (에러 아님).
 */
const FIELD_MAP = {
  name: matched => matched.seriesName || undefined,
  image: matched => normalizeImageUrl(matched.productImageList?.[0]?.url),
  price: matched => formatPrice(matched.minStandardUnitPrice),
  shipDate: matched => formatDaysToShip(matched.minStandardDaysToShip)
};

function normalizeImageUrl(rawUrl) {
  if (!rawUrl) return undefined;
  return rawUrl.startsWith("//") ? "https:" + rawUrl : rawUrl; // 프로토콜 상대경로(//로 시작) 보정
}

function formatPrice(rawPrice) {
  return typeof rawPrice === "number" ? rawPrice.toLocaleString() : undefined; // blocks.js 계약: 가격은 쉼표 포함 문자열
}

/**
 * minStandardDaysToShip(숫자) → blocks.js가 그대로 출력할 수 있는 문자열.
 *
 * ⚠️ 숫자를 그대로 넘기면 안 됩니다. blocks.js의 productListBlock은
 * `p.shipDate ? esc(p.shipDate) + " 출하" : 플레이스홀더` 로 분기하는데,
 *   - 0(당일출하)은 falsy라서 "출하일 연동 예정" 플레이스홀더로 잘못 표시되고
 *   - esc()도 `String(s || "")` 이라 0을 빈 문자열로 만들어 버립니다.
 * 그래서 여기서 반드시 비어있지 않은 문자열로 변환합니다.
 */
function formatDaysToShip(rawDays) {
  if (typeof rawDays !== "number") return undefined;
  return rawDays === 0 ? "당일" : `${rawDays}일`;
}

/**
 * 시리즈 검색 API 원본 응답(JSON)에서 특정 seriesCode와 일치하는 항목을 찾아
 * draft.products 계약에 맞는 객체로 변환합니다 (필드 목록은 FIELD_MAP 참고).
 * 네트워크 호출과 분리해뒀습니다 — 이 함수만 따로 유닛 테스트하기 위함입니다.
 *
 * @param {object} apiResponse 미스미 시리즈 검색 API의 원본 JSON 응답
 * @param {string} code 사용자가 입력한 시리즈 코드
 * @returns {{code: string, [key: string]: any}} FIELD_MAP에 정의된 필드들이 code와 함께 채워짐
 */
export function parseSeriesResponse(apiResponse, code) {
  const matched = (apiResponse?.seriesList || []).find(s => s.seriesCode === code);
  if (!matched) {
    // 코드가 일치하는 상품을 못 찾음 (오탈자, 단종 등) — code만 채우고 나머지는
    // blocks.js가 "연동 예정" 플레이스홀더로 표시하도록 비워둡니다.
    return { code };
  }

  const result = { code };
  for (const [field, extractor] of Object.entries(FIELD_MAP)) {
    result[field] = extractor(matched);
  }
  return result;
}

/**
 * 시리즈 코드 하나를 조회해서 draft.products에 들어갈 객체 하나를 반환합니다.
 * API 호출 자체가 실패(네트워크 오류, 404 등)하면 예외를 던집니다 — 호출부(generator.js)에서
 * 코드별로 개별 catch해서 "이 코드는 조회 실패"만 표시하고 나머지는 계속 진행하도록 하세요.
 */
export async function fetchSeriesInfo(code) {
  const url = CONFIG.seriesApiUrl
    ? `${CONFIG.seriesApiUrl}?seriesCode=${encodeURIComponent(code)}`
    : `${MISUMI_DIRECT_API_BASE}?applicationId=${APPLICATION_ID}&lang=KOR&seriesCode=${encodeURIComponent(code)}&field=%40search`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`시리즈 API 오류: ${res.status}`);
  const data = await res.json();
  return parseSeriesResponse(data, code);
}