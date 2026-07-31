import { store, resetDemoData } from "../state.js";
import { el, toast } from "../lib/dom.js";
import { navigate } from "../router.js";

const statusBadge = {
  "초안": "gray",
  "검토중": "amber",
  "완료": "green"
};
const categoryBadge = {
  "비상품계": "blue",
  "상품계": "purple"
};

let filters = { category: "전체", status: "전체" };
let page = 1;
const PAGE_SIZE = 10;

export function renderCampaigns(root) {
  root.appendChild(
    el("div", { class: "page-head" }, [
      el("div", {}, [
        el("h1", {}, "캠페인 목록"),
        el("p", {}, "메인 대시보드 · 전체 캠페인 조회 · 편집 · 복제 · 삭제")
      ]),
      el("div", { class: "page-actions" }, [
        el("a", { class: "btn primary", href: "#/generator?type=non-product" }, "+ 새 캠페인"),
        el("button", {
          class: "btn ghost",
          title: "템플릿 목록이 최신 코드와 다르게 보이거나 캠페인 화면이 이상할 때 사용하세요. 저장된 캠페인/에셋은 초기 데모 값으로 리셋되고, 템플릿은 항상 최신 코드 기준이라 영향 없습니다.",
          onclick: () => {
            if (!confirm("데모 데이터를 초기화할까요? 지금까지 만든 캠페인/업로드한 에셋이 초기값으로 리셋됩니다.")) return;
            resetDemoData();
          }
        }, "⟲ 데모 데이터 초기화")
      ])
    ])
  );

  const filterBar = el("div", { class: "filter-bar" }, [
    select(["전체", "비상품계", "상품계"], filters.category, v => { filters.category = v; page = 1; renderTable(); }),
    select(["전체", "초안", "검토중", "완료"], filters.status, v => { filters.status = v; page = 1; renderTable(); })
  ]);
  root.appendChild(filterBar);

  const tableHost = el("div", { id: "campaign-table-host" });
  root.appendChild(tableHost);

  function renderTable() {
    tableHost.innerHTML = "";
    let rows = store.campaigns;
    if (filters.category !== "전체") rows = rows.filter(c => c.category === filters.category);
    if (filters.status !== "전체") rows = rows.filter(c => c.status === filters.status);

    if (rows.length === 0) {
      tableHost.appendChild(
        el("div", { class: "empty-state" }, [
          el("div", { class: "e-title" }, "조건에 맞는 캠페인이 없습니다"),
          el("div", { class: "e-desc" }, "필터를 변경하거나 새 캠페인을 만들어 보세요."),
          el("a", { class: "btn primary", href: "#/generator?type=non-product" }, "+ 새 캠페인")
        ])
      );
      return;
    }

    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    page = Math.min(page, totalPages);
    const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const table = el("table", { class: "tbl" }, [
      el("thead", {}, el("tr", {}, [
        "캠페인명", "구분", "유형", "세그먼트", "상태", "생성일", "액션"
      ].map(h => el("th", {}, h)))),
      el("tbody", {}, pageRows.map(c => el("tr", {}, [
        el("td", { class: "cell-name" }, c.name),
        el("td", {}, el("span", { class: "badge " + (categoryBadge[c.category] || "gray") }, c.category)),
        el("td", {}, c.type),
        el("td", {}, c.segment),
        el("td", {}, el("span", { class: "badge " + (statusBadge[c.status] || "gray") }, c.status)),
        el("td", {}, c.createdAt),
        el("td", {}, el("div", { class: "row-actions" }, [
          el("button", {
            class: "btn btn-sm",
            onclick: () => navigate("generator", {
              type: c.category === "상품계" ? "product" : "non-product",
              id: c.id
            })
          }, "편집"),
          el("button", {
            class: "btn btn-sm",
            onclick: () => {
              store.duplicateCampaign(c.id);
              toast("캠페인을 복제했습니다");
              renderTable();
            }
          }, "복제"),
          el("button", {
            class: "btn btn-sm danger",
            onclick: () => {
              if (!confirm(`"${c.name}" 캠페인을 삭제할까요?`)) return;
              store.deleteCampaign(c.id);
              toast("캠페인을 삭제했습니다");
              renderTable();
            }
          }, "삭제")
        ]))
      ])))
    ]);

    tableHost.appendChild(el("div", { class: "tbl-wrap" }, table));

    const pag = el("div", { class: "pagination" }, [`${rows.length}건`]);
    for (let p = 1; p <= totalPages; p++) {
      pag.appendChild(el("button", {
        class: p === page ? "active" : "",
        onclick: () => { page = p; renderTable(); }
      }, String(p)));
    }
    tableHost.appendChild(pag);
  }

  renderTable();
}

function select(options, value, onChange) {
  const s = el("select", { onchange: e => onChange(e.target.value) },
    options.map(o => el("option", { value: o, ...(o === value ? { selected: "selected" } : {}) }, o))
  );
  return s;
}
