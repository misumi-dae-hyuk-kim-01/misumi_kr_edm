import { store } from "../state.js";
import { el } from "../lib/dom.js";

export function renderTemplates(root) {
  root.appendChild(
    el("div", { class: "page-head" }, [
      el("div", {}, [
        el("h1", {}, "템플릿 관리"),
        el("p", {}, "템플릿 목록 조회 · 미리보기 (TPL-01) · 편집은 S3 콘솔에서 직접 관리 (Phase 1)")
      ])
    ])
  );

  const grid = el("div", { class: "card-grid" });
  store.templates.forEach(t => {
    grid.appendChild(
      el("div", { class: "card" }, [
        el("h3", {}, t.name),
        el("p", {}, `${t.category} · ${t.segment}`),
        el("p", { style: "margin-top:6px;" }, "블록: " + t.blocks.join(" → ")),
        el("button", {
          class: "btn btn-sm",
          style: "margin-top:10px;width:100%;",
          onclick: () => openPreview(t)
        }, "미리보기")
      ])
    );
  });
  root.appendChild(grid);

  root.appendChild(
    el("p", { style: "font-size:11px;color:#999;margin-top:16px;" },
      "📁 템플릿 추가 · 수정은 S3 콘솔 (kor-smartlp/edm/templates/blocks/) 에서 직접 파일을 관리합니다. templates.json 등록 후 자동 반영됩니다.")
  );

  function openPreview(t) {
    const backdrop = el("div", { class: "modal-backdrop", onclick: e => { if (e.target === backdrop) backdrop.remove(); } });
    const box = el("div", { class: "modal-box" }, [
      el("button", { class: "modal-close", onclick: () => backdrop.remove() }, "✕"),
      el("h2", {}, t.name),
      el("div", { class: "modal-sub" }, `${t.category} · ${t.segment}`),
      el("div", {
        style: "border:1px solid #eee;border-radius:8px;overflow:hidden;background:#fafbfd;"
      }, t.blocks.map((b, i) =>
        el("div", {
          style: `padding:16px;text-align:center;font-size:12px;color:#555;` +
                  (i < t.blocks.length - 1 ? "border-bottom:1px dashed #ddd;" : "") +
                  "background:" + blockColor(b)
        }, b)
      ))
    ]);
    backdrop.appendChild(box);
    document.getElementById("shell").appendChild(backdrop);
  }
}

function blockColor(name) {
  if (name.includes("히어로") || name.includes("헤더")) return "#eef2fb";
  if (name.includes("쿠폰")) return "#fff9e6";
  if (name.includes("푸터")) return "#f5f5f5";
  return "#fff";
}
