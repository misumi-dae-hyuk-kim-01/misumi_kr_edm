import { store } from "../state.js";
import { el, toast } from "../lib/dom.js";
import { navigate } from "../router.js";

const statusBadge = {
  "초안": "gray",
  "완료": "green"
};
const channelBadge = {
  "EDM": "blue",
  "LP": "purple"
};

let filters = { channel: "전체", purpose: "전체", status: "전체", searchScope: "전체", searchText: "" };
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
        newCampaignDropdown()
      ])
    ])
  );

  const filterBar = el("div", { class: "filter-bar", style: "justify-content:space-between;" }, [
    el("div", { style: "display:flex;gap:8px;flex-wrap:wrap;" }, [
      select(["전체", "EDM", "LP"], filters.channel, v => { filters.channel = v; page = 1; renderTable(); }),
      select(["전체", "온보딩", "육성", "이탈방지", "상품소개", "쿠폰", "내근영업"], filters.purpose, v => { filters.purpose = v; page = 1; renderTable(); }),
      select(["전체", "초안", "완료"], filters.status, v => { filters.status = v; page = 1; renderTable(); })
    ]),
    el("div", { style: "display:flex;gap:0;" }, [
      // ⚠️ 작성자는 원래 드롭다운 필터도 따로 있었는데, 작성자가 많아지면 드롭다운이
      // 스크롤해야 하는 긴 목록이 되어버려서 오히려 안 좋습니다. 검색(부분일치, 타이핑으로
      // 좁히기)이 인원수와 무관하게 항상 편하므로, 작성자는 검색 하나로 통일했습니다.
      el("select", {
        class: "search-scope-select",
        onchange: e => { filters.searchScope = e.target.value; page = 1; renderTable(); }
      }, ["전체", "캠페인명", "프로모션명", "작성자"].map(o => el("option", { value: o, ...(o === filters.searchScope ? { selected: "selected" } : {}) }, o))),
      el("input", {
        type: "text", class: "search-text-input", placeholder: "검색어 입력...",
        value: filters.searchText,
        oninput: e => { filters.searchText = e.target.value; page = 1; renderTable(); }
      })
    ])
  ]);
  root.appendChild(filterBar);

  const tableHost = el("div", { id: "campaign-table-host" });
  root.appendChild(tableHost);

  function newCampaignDropdown() {
    const menu = el("div", { class: "new-campaign-menu", style: "display:none;" }, [
      el("button", { class: "new-campaign-menu-item", onclick: () => navigate("generator", { purpose: "온보딩" }) }, "📧 EDM 캠페인 만들기"),
      el("button", { class: "new-campaign-menu-item", onclick: () => navigate("generator-lp", {}) }, "🌐 LP 캠페인 만들기")
    ]);
    const wrap = el("div", { class: "new-campaign-wrap" }, [
      el("button", {
        class: "btn primary",
        onclick: () => { menu.style.display = menu.style.display === "none" ? "block" : "none"; }
      }, "+ 새 캠페인 ▾"),
      menu
    ]);
    return wrap;
  }

  function editRoute(c) {
    if (c.channel === "LP") return navigate("generator-lp", { id: c.id });
    return navigate("generator", { id: c.id });
  }

  function renderTable() {
    tableHost.innerHTML = "";
    let rows = store.campaigns;
    if (filters.channel !== "전체") rows = rows.filter(c => (c.channel || "EDM") === filters.channel);
    if (filters.purpose !== "전체") rows = rows.filter(c => c.purpose === filters.purpose);
    if (filters.status !== "전체") rows = rows.filter(c => c.status === filters.status);
    if (filters.searchText.trim()) {
      const q = filters.searchText.trim().toLowerCase();
      rows = rows.filter(c => {
        if (filters.searchScope === "캠페인명") return (c.name || "").toLowerCase().includes(q);
        if (filters.searchScope === "작성자") return (c.author || "").toLowerCase().includes(q);
        if (filters.searchScope === "프로모션명") return (c.promotionName || "").toLowerCase().includes(q);
        return (c.name || "").toLowerCase().includes(q) || (c.author || "").toLowerCase().includes(q) || (c.promotionName || "").toLowerCase().includes(q);
      });
    }

    if (rows.length === 0) {
      tableHost.appendChild(
        el("div", { class: "empty-state" }, [
          el("div", { class: "e-title" }, "조건에 맞는 캠페인이 없습니다"),
          el("div", { class: "e-desc" }, "필터를 변경하거나 새 캠페인을 만들어 보세요.")
        ])
      );
      return;
    }

    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    page = Math.min(page, totalPages);
    const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // promotionName이 비어있지 않고, 전체 캠페인(필터와 무관하게) 중 같은 값을 가진 게 2개 이상이면
    // "연결된 캠페인"으로 취급합니다. ID가 아니라 텍스트 일치라서, 오타 나면 그냥 안 묶일 뿐입니다.
    const promoCounts = {};
    store.campaigns.forEach(c => {
      if (c.promotionName) promoCounts[c.promotionName] = (promoCounts[c.promotionName] || 0) + 1;
    });

    const table = el("table", { class: "tbl" }, [
      el("thead", {}, el("tr", {}, [
        "캠페인명", "프로모션명", "작성자", "채널", "목적", "상태", "작성일", "최종수정일", "액션"
      ].map(h => el("th", {}, h)))),
      el("tbody", {}, pageRows.map(c => el("tr", {}, [
        el("td", { class: "cell-name cell-truncate", title: c.name }, [
          el("div", { class: "cell-truncate-text" }, c.name),
          c.promotionName && promoCounts[c.promotionName] >= 2
            ? el("div", { class: "promo-link-badge" }, "🔗 연결된 캠페인")
            : null
        ]),
        el("td", { class: "cell-truncate", style: "color:#666;", title: c.promotionName || "" }, c.promotionName || "-"),
        el("td", { class: "cell-truncate", style: "color:#666;", title: c.author || "" }, c.author || "-"),
        el("td", {}, el("span", { class: "badge " + (channelBadge[c.channel || "EDM"] || "gray") }, c.channel || "EDM")),
        el("td", { style: "color:#666;" }, c.purpose || "-"),
        el("td", {}, c.status ? el("span", { class: "badge " + (statusBadge[c.status] || "gray") }, c.status) : "-"),
        el("td", { style: "color:#666;" }, c.createdAt),
        el("td", { style: "color:#666;" }, c.updatedAt || c.createdAt || "-"),
        el("td", {}, el("div", { class: "row-actions" }, [
          el("button", { class: "btn btn-sm", onclick: () => editRoute(c) }, "편집"),
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
