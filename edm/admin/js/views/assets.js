import { store } from "../state.js";
import { el, toast } from "../lib/dom.js";

export function renderAssets(root) {
  root.appendChild(
    el("div", { class: "page-head" }, [
      el("div", {}, [
        el("h1", {}, "에셋 관리"),
        el("p", {}, "이미지 등록 · 확인 · 삭제 · 히어로 배너/본문 이미지 옵션은 EDM 생성기에서 선택합니다")
      ])
    ])
  );

  const drop = el("label", { class: "dropzone" }, [
    "이미지를 드래그하거나 클릭하여 업로드 — 자동 리사이징 600px · S3 자동 저장",
    el("input", {
      type: "file", accept: "image/*", multiple: "multiple",
      onchange: e => handleUpload(e.target.files)
    })
  ]);
  root.appendChild(drop);

  const tableHost = el("div", { id: "asset-table-host" });
  root.appendChild(tableHost);

  function handleUpload(files) {
    if (!files || !files.length) return;
    Array.from(files).forEach(f => {
      store.addAsset({
        id: "a" + Date.now() + Math.random().toString(16).slice(2),
        filename: f.name,
        category: "미분류",
        sizeKB: Math.round(f.size / 1024),
        uploadedAt: new Date().toISOString().slice(0, 10).replace(/-/g, ".")
      });
    });
    toast(`${files.length}개 파일을 업로드했습니다`);
    renderTable();
  }

  function renderTable() {
    tableHost.innerHTML = "";
    const rows = store.assets;

    if (rows.length === 0) {
      tableHost.appendChild(
        el("div", { class: "empty-state" }, [
          el("div", { class: "e-title" }, "업로드된 에셋이 없습니다"),
          el("div", { class: "e-desc" }, "위 영역에 이미지를 업로드하면 EDM 생성기에서 바로 선택할 수 있습니다.")
        ])
      );
      return;
    }

    const table = el("table", { class: "tbl" }, [
      el("thead", {}, el("tr", {}, ["", "파일명", "종류", "크기", "업로드 일시", "액션"].map(h => el("th", {}, h)))),
      el("tbody", {}, rows.map(a => el("tr", {}, [
        el("td", {}, el("span", { class: "badge gray" }, "IMG")),
        el("td", { class: "cell-name" }, a.filename),
        el("td", {}, a.category),
        el("td", {}, a.sizeKB + "KB"),
        el("td", {}, a.uploadedAt),
        el("td", {}, el("div", { class: "row-actions" }, [
          el("button", { class: "btn btn-sm", onclick: () => toast(a.filename + " 미리보기 (데모)") }, "확인"),
          el("button", {
            class: "btn btn-sm danger",
            onclick: () => {
              if (!confirm(`"${a.filename}" 을(를) 삭제할까요?`)) return;
              store.deleteAsset(a.id);
              toast("에셋을 삭제했습니다");
              renderTable();
            }
          }, "삭제")
        ]))
      ])))
    ]);
    tableHost.appendChild(el("div", { class: "tbl-wrap" }, table));
    tableHost.appendChild(
      el("p", { style: "font-size:11px;color:#999;margin-top:12px;" },
        "📁 파일은 S3 (kor-smartlp/edm/assets/) 에 저장됩니다. 업로드 후 EDM 생성기에서 해당 이미지를 선택하여 사용할 수 있습니다.")
    );
  }

  renderTable();
}
