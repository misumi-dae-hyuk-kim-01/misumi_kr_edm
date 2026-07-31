// 생성된 EDM HTML 안의 이미지/링크가 실제로 살아있는지 확인합니다.
//
// ⚠️ 중요한 제약 (정직하게 알아야 할 것):
// - <img>는 브라우저의 Image() 로딩 이벤트(onload/onerror)로 확인합니다. 이건 CORS 제약 없이
//   "이미지가 실제로 로드되는지"를 신뢰성 있게 알 수 있습니다 (이미지 태그는 원래 CORS 없이도
//   로드/실패 여부를 브라우저가 알려주도록 설계되어 있습니다).
// - <a href>(상품 상세 페이지 등)는 다른 도메인(kr.misumi-ec.com 등)으로 가는 링크라서,
//   브라우저에서 직접 fetch()로 실제 HTTP 상태 코드(404 등)를 읽으려면 그 도메인이 CORS를
//   허용해야 합니다. 대부분의 외부 사이트는 이걸 허용하지 않습니다.
//   따라서 이 모듈은 "확인 가능하면 상태 코드까지, 안 되면 최소한 네트워크 요청이 실패했는지"만
//   보고합니다. 완전히 신뢰할 수 있는 404 체크가 필요하면 백엔드에서 대신 요청해주는 프록시가
//   필요합니다 (시리즈 API 연동 때 만들 프록시와 동일한 이유/구조입니다).

/**
 * HTML에서 검사 대상 URL을 전부 추출합니다 (이미지 src, 링크 href).
 * @param {string} html
 * @returns {{images: string[], links: string[]}}
 */
export function extractUrls(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const images = Array.from(doc.querySelectorAll("img[src]"))
    .map(img => img.getAttribute("src"))
    .filter(src => src && /^https?:\/\//.test(src));

  const links = Array.from(doc.querySelectorAll("a[href]"))
    .map(a => a.getAttribute("href"))
    .filter(href => href && /^https?:\/\//.test(href));

  // 중복 제거
  return {
    images: [...new Set(images)],
    links: [...new Set(links)]
  };
}

/** 이미지 하나가 실제로 로드되는지 확인 (CORS 제약 없음, 신뢰 가능) */
function checkImage(url, timeoutMs = 8000) {
  return new Promise(resolve => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.src = ""; // 로딩 취소
      resolve({ url, type: "image", status: "timeout", ok: false });
    }, timeoutMs);

    img.onload = () => { clearTimeout(timer); resolve({ url, type: "image", status: "ok", ok: true }); };
    img.onerror = () => { clearTimeout(timer); resolve({ url, type: "image", status: "broken", ok: false }); };
    img.src = url;
  });
}

/** 링크 하나를 최선으로 확인 (CORS 허용 도메인이면 실제 상태코드까지, 아니면 "확인 불가") */
async function checkLink(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: "HEAD", mode: "cors", signal: controller.signal });
    clearTimeout(timer);
    return { url, type: "link", status: res.status, ok: res.ok };
  } catch (e) {
    clearTimeout(timer);
    // CORS 차단, 네트워크 오류, 타임아웃을 구분하지 않고 "확인 불가"로 보고합니다.
    // (브라우저가 CORS 실패와 순수 네트워크 실패를 구분해서 알려주지 않기 때문입니다)
    return { url, type: "link", status: "unknown", ok: null, reason: "CORS 제한 또는 네트워크 오류로 상태 확인 불가" };
  }
}

/**
 * HTML 안의 모든 이미지/링크를 검사합니다.
 * @param {string} html
 * @returns {Promise<{url: string, type: "image"|"link", status: string|number, ok: boolean|null, reason?: string}[]>}
 */
export async function checkAllLinks(html) {
  const { images, links } = extractUrls(html);
  const results = await Promise.all([
    ...images.map(url => checkImage(url)),
    ...links.map(url => checkLink(url))
  ]);
  return results;
}

/** ok:null(확인 불가)은 실패로 세지 않고 별도 집계합니다 — 오탐 방지 */
export function summarizeLinkResults(results) {
  const broken = results.filter(r => r.ok === false);
  const unknown = results.filter(r => r.ok === null);
  const ok = results.filter(r => r.ok === true);
  return { total: results.length, ok: ok.length, broken: broken.length, unknown: unknown.length };
}
