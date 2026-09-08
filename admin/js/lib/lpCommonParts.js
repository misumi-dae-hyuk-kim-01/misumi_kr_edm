// LP 페이지에 kr.misumi-ec.com 본사이트의 공용 헤더/푸터를 런타임에 fetch해서 끼워 넣는 스크립트.
//
// ⚠️ 출처: jp.misumi-ec.com의 실제 LP가 쓰는 /cluster/sb/lp/common/assets/js/common.js를
// 그대로 받아서 분석한 패턴입니다. 같은 /vcommon/common/include/* 엔드포인트가
// kr.misumi-ec.com에도 동일하게 존재함을 직접 확인했습니다(2026-08-27, curl로 200 응답 확인):
//   /vcommon/common/include/import_head_css.html  — 공용 CSS + link 태그
//   /vcommon/common/include/import_head_js.html   — core/function/vona2 공용 JS
//   /vcommon/common/include/head_navi.html         — 헤더(GNB, 카테고리 메가메뉴)
//   /vcommon/common/include/foot.html              — 푸터
//   /vcommon/common/include/analyze.html           — 분석 스크립트
//
// ⚠️ 전제조건: 이 LP가 kr.misumi-ec.com과 "같은 origin" 아래(CloudFront 경로 라우팅 등)로
// 배포되어야 location.origin이 실제 misumi 도메인을 가리켜서 fetch가 성공합니다.
// 순수 S3 버킷 URL로 열면 location.origin이 S3 도메인이 되어 전부 실패합니다 — catch에서
// 콘솔 경고만 남기고 로더를 제거해, 헤더/푸터 없이 컨텐츠만 노출되는 형태로 조용히 열화됩니다.
//
// ⚠️ jQuery 의존성을 일부러 뺐습니다. 원본(JP)은 jQuery의 prepend/append가 내부적으로
// 삽입된 <script>를 실행해주는 데 의존하는데, 코딩가이드 B-3(외부 도메인 JS 금지 —
// guidelineCheckLP.js 참고)를 지키려면 별도 jQuery CDN을 새로 붙이고 싶지 않았습니다.
// 그래서 insertAdjacentHTML로 삽입한 뒤 <script> 태그만 수동으로 재생성해서 실행합니다
// (브라우저가 innerHTML/insertAdjacentHTML로 삽입된 <script>를 자동 실행하지 않기 때문에
// 필요한 처리 — head_navi.html 안에 실제로 인라인 <script>가 들어있는 것을 확인했습니다).
//
// @returns {string} <script> 태그 안에 그대로 넣을 JS 코드 문자열 (src 없는 인라인 스크립트)
export function commonPartsLoaderScript() {
  return `(function () {
  var baseURL = location.origin;
  var urls = [
    baseURL + "/vcommon/common/include/import_head_css.html",
    baseURL + "/vcommon/common/include/import_head_js.html",
    baseURL + "/vcommon/common/include/head_navi.html",
    baseURL + "/vcommon/common/include/foot.html",
    baseURL + "/vcommon/common/include/analyze.html"
  ];

  function runScripts(root) {
    Array.prototype.forEach.call(root.querySelectorAll("script"), function (old) {
      var fresh = document.createElement("script");
      for (var i = 0; i < old.attributes.length; i++) {
        fresh.setAttribute(old.attributes[i].name, old.attributes[i].value);
      }
      if (!old.src) fresh.text = old.textContent;
      old.parentNode.replaceChild(fresh, old);
    });
  }

  function insertAndRun(el, position, html) {
    if (!el) return;
    el.insertAdjacentHTML(position, html);
    runScripts(el);
  }

  function handle(url, html) {
    if (url.indexOf("import_head_css") !== -1) {
      var tmp = document.createElement("div");
      tmp.innerHTML = html;
      var scripts = Array.prototype.slice.call(tmp.querySelectorAll("script"));
      scripts.forEach(function (s) { s.remove(); });
      while (tmp.firstChild) document.head.appendChild(tmp.firstChild);
      var staleLink = document.querySelector('link[rel="stylesheet"][href*="common_rev_use_display_collapses"]');
      if (staleLink) staleLink.remove();
      scripts.forEach(function (old) {
        var fresh = document.createElement("script");
        if (old.src) { fresh.src = old.src; fresh.async = false; }
        else { fresh.text = old.textContent; }
        document.head.appendChild(fresh);
      });
    } else if (url.indexOf("import_head_js") !== -1) {
      insertAndRun(document.body, "afterbegin", html);
      fetch(baseURL + "/vcommon/common/include/import_foot.html")
        .then(function (r) { return r.text(); })
        .then(function (footHtml) { insertAndRun(document.body, "beforeend", footHtml); })
        .catch(function (e) { console.error("[LP common parts] import_foot 로드 실패:", e); });
    } else if (url.indexOf("head_navi") !== -1) {
      insertAndRun(document.querySelector(".l-wrapper"), "afterbegin", html);
    } else if (url.indexOf("foot") !== -1) {
      insertAndRun(document.querySelector(".l-wrapper"), "beforeend", html);
    } else if (url.indexOf("analyze") !== -1) {
      insertAndRun(document.body, "beforeend", html);
    }
  }

  Promise.all(urls.map(function (url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error("Fetch failed for " + url + ": " + res.status);
      return res.text().then(function (data) { return { url: url, data: data }; });
    });
  }))
    .then(function (results) {
      results.forEach(function (r) { handle(r.url, r.data); });
    })
    .catch(function (err) {
      console.error("[LP common parts] 공용 헤더/푸터 로드 실패 — location.origin이 kr.misumi-ec.com과 다른 배포 환경일 수 있습니다.", err);
    })
    .finally(function () {
      var loader = document.querySelector(".lp-loader");
      if (loader) loader.remove();
      var wrapper = document.querySelector(".l-wrapper");
      if (wrapper) wrapper.classList.remove("lp-isLoading");
    });
})();`;
}
