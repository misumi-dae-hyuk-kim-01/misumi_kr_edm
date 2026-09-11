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

// ⚠️ 2026-09 신설 — EDM/LP가 저장 시 직접 채우는 updatedAt("YYYY.MM.DD HH:MM")과
// 캠페인 "복제" 시 백엔드 clone API가 그대로 내려주는 값(전체 ISO 타임스탬프,
// 예: "2026-09-10T15:39:10.000Z")의 형식이 서로 달라서, 복제한 캠페인만 표시가
// 다르게 보이는 문제가 있었습니다. 어떤 형식으로 들어오든 화면엔 항상 같은
// 모양("YYYY.MM.DD HH:MM")으로 보이도록 여기서 한 번 더 정규화합니다.
// ⚠️ 2026-09 재수정 — 처음엔 "복제한 캠페인만 시간이 보인다"는 불일치를
// "모두 시간까지 보이게" 통일하는 방향으로 고쳤는데, 다시 "시간 자체를 아예
// 안 보여주는 게 낫다"는 방향으로 정리합니다. 저장하는 값(updatedAt) 자체는
// 시:분까지 그대로 남겨둡니다 — 나중에 필요해지면 데이터가 이미 있으니
// 화면 쪽만 다시 바꾸면 됩니다. 여기서는 "화면에 보여줄 때만" 날짜까지 자릅니다.
function formatUpdatedAt(value) {
  if (!value) return "";
  // 이미 우리가 만든 형식("YYYY.MM.DD HH:MM")이든, 캠페인 복제 시 백엔드가
  // 주는 전체 ISO 타임스탬프든, 앞의 "YYYY.MM.DD" 10글자만 잘라서 보여줍니다.
  const normalized = /^\d{4}\.\d{2}\.\d{2}/.test(value) ? value : (() => {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
  })();
  return normalized.slice(0, 10);
}

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

  /** 목록 정렬 기준: 최종수정일 내림차순(최근 작업한 것이 위).
   *  ⚠️ 예전엔 정렬이 아예 없어서, 첫 로딩 때는 서버의 DynamoDB scan 순서(= 정렬 보장
   *  없음, 사실상 무작위)로, 그 뒤엔 store의 배열 조작 순서(신규/복제는 맨 위, 수정은
   *  제자리)로 뒤죽박죽이었습니다. "최종수정일" 컬럼이 있는데 그 기준으로 정렬되지
   *  않아 최근 작업한 캠페인을 찾기 어려웠습니다.
   *  ⚠️ 값이 "2026.09.10 14:32"처럼 0으로 채워진 고정 형식이라 문자열 비교로 충분합니다
   *  (Date 파싱 불필요 — lib/datetime.js 참고). 시각이 없는 옛 데이터("2026.09.10")가
   *  섞여 있어도 그날 00:00으로 취급되어 자연스럽게 아래에 놓입니다.
   *  updatedAt이 아예 없는 옛 캠페인은 createdAt으로 대신 비교합니다. */
  function sortByUpdatedDesc(list) {
    const key = c => c.updatedAt || c.createdAt || "";
    return [...list].sort((a, b) => key(b).localeCompare(key(a)));
  }

  function renderTable() {
    tableHost.innerHTML = "";
    // ⚠️ store.campaigns를 그대로 정렬하면 원본 배열이 뒤바뀝니다(sort는 제자리 정렬) —
    // sortByUpdatedDesc()가 복사본을 만들어 반환합니다.
    let rows = sortByUpdatedDesc(store.campaigns);
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
        el("td", { style: "color:#666;" }, formatUpdatedAt(c.updatedAt) || c.createdAt || "-"),
        el("td", {}, el("div", { class: "row-actions" }, [
          el("button", { class: "btn btn-sm", onclick: () => editRoute(c) }, "편집"),
          el("button", {
            class: "btn btn-sm",
            onclick: async e => {
              const button = e.currentTarget;
              button.disabled = true;
              try {
                const copy = await store.duplicateCampaign(c.id);
                if (!copy) throw new Error("복제할 캠페인을 찾을 수 없습니다");
                toast("캠페인을 복제했습니다");
                renderTable();
              } catch (error) {
                console.error("캠페인 복제 실패", error);
                toast(`캠페인 복제에 실패했습니다: ${error.message}`);
                button.disabled = false;
              }
            }
          }, "복제"),
          el("button", {
            class: "btn btn-sm danger",
            onclick: async e => {
              if (!confirm(`"${c.name}" 캠페인을 삭제할까요?`)) return;
              const button = e.currentTarget;
              button.disabled = true;
              try {
                await store.deleteCampaign(c.id);
                toast("캠페인을 삭제했습니다");
                renderTable();
              } catch (error) {
                console.error("캠페인 삭제 실패", error);
                toast(`캠페인 삭제에 실패했습니다: ${error.message}`);
                button.disabled = false;
              }
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
