const routes = {};

export function registerRoute(name, renderFn) {
  routes[name] = renderFn;
}

function parseHash() {
  const hash = location.hash.replace(/^#\/?/, "");
  const [path, query] = hash.split("?");
  const params = new URLSearchParams(query || "");
  return { path: path || "campaigns", params };
}

function setActiveSidebarItem(path) {
  document.querySelectorAll(".sb-item").forEach(el => {
    el.classList.toggle("active", el.dataset.route === path);
  });
}

function setShellMode(path) {
  // EDM/LP 생성기는 전체 화면 편집기 형태로, 사이드바 없이 넓게 씁니다.
  const shell = document.getElementById("shell");
  shell.classList.toggle("no-sidebar", path === "generator" || path === "generator-lp");
}

export function startRouter() {
  window.addEventListener("hashchange", render);
  render();
}

function render() {
  const { path, params } = parseHash();
  const content = document.getElementById("content");
  const view = routes[path] || routes["campaigns"];

  setActiveSidebarItem(path);
  setShellMode(path);

  content.innerHTML = "";
  view(content, params);
  content.scrollTop = 0;
}

export function navigate(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  location.hash = "#/" + path + (qs ? "?" + qs : "");
}
