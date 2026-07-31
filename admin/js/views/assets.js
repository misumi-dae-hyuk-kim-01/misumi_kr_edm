import { store } from "../state.js";
import { el, toast } from "../lib/dom.js";
import { LP_WIDTH_PATTERNS } from "../lib/guidelineCheckLP.js";

// ⚠️ 실서비스 연동 지점 (copyGenerator.js/seriesApi.js와 동일한 패턴)
// CONFIG.uploadApiUrl이 비어있으면 데모 모드로 동작합니다: 실제 S3에 올라가지 않고
// 브라우저 안에서만 유효한 임시 URL(blob:)을 만들어서 미리보기가 되는 척합니다.
// (새로고침하거나 다른 브라우저/기기에서 열면 사라집니다 — 진짜 S3 URL이 아니기 때문)
//
// 실제로 연동하려면 백엔드에 아래와 같은 "presigned URL 발급" 엔드포인트가 필요합니다
// (개발팀 협의 필요 — ASSET_UPLOAD_CONTRACT.md 참고):
//   POST { filename, contentType, channel: "EDM"|"LP" } → { uploadUrl, publicUrl }
// uploadUrl로 브라우저가 파일을 직접 PUT하고, publicUrl을 최종 이미지 주소로 저장합니다.
export const CONFIG = {
  uploadApiUrl: "" // 예: "https://xxxx.execute-api.ap-northeast-2.amazonaws.com/generate-upload-url"
};

const SIZE_TARGETS = [
  { key: "EDM", label: "EDM (600px)", channel: "EDM", dim: 600 },
  { key: "LP1200", label: "LP 1200px", channel: "LP", dim: 1200 },
  { key: "LP950", label: "LP 950px", channel: "LP", dim: 950 },
  { key: "LP920", label: `LP 920px (${LP_WIDTH_PATTERNS[920].scope})`, channel: "LP", dim: 920 }
];
const CATEGORY_PRESETS = ["히어로 배경", "본문 이미지"];

const PAGE_SIZE = 10;
let filters = { category: "전체", usage: "전체" };
let searchQuery = "";
let sortBy = "recent"; // "recent" | "size" | "name"
let viewMode = "list"; // "list" | "grid"
let page = 1;
let uploadCategory = "히어로 배경";
let selectedTargetKeys = new Set(["EDM"]);
let selectedAssetIds = new Set();

export function renderAssets(root) {
  root.appendChild(
    el("div", { class: "page-head" }, [
      el("div", {}, [
        el("h1", {}, "에셋 관리"),
        el("p", {}, "이미지 등록 · 확인 · 삭제 · 사이즈 칩 클릭 시 URL 복사 → 생성기의 이미지 URL 입력란에 붙여넣기 (⚠ 데모 모드 — 새로고침 시 사라짐, ASSET_UPLOAD_CONTRACT.md 참고)")
      ])
    ])
  );

  const sizeCheckboxes = el("div", { class: "size-target-picker" }, SIZE_TARGETS.map(t =>
    el("label", { class: "size-target-item" }, [
      el("input", {
        type: "checkbox",
        checked: selectedTargetKeys.has(t.key) ? "checked" : null,
        onchange: e => {
          if (e.target.checked) selectedTargetKeys.add(t.key);
          else selectedTargetKeys.delete(t.key);
        }
      }),
      el("span", {}, t.label)
    ])
  ));

  root.appendChild(el("div", { class: "field", style: "margin-bottom:10px;" }, [
    el("label", {}, "업로드 시 생성할 사이즈 (여러 개 선택 가능)"),
    sizeCheckboxes
  ]));
  root.appendChild(el("div", { class: "filter-bar" }, [
    select(CATEGORY_PRESETS, uploadCategory, v => { uploadCategory = v; }, "업로드 종류")
  ]));

  const drop = el("label", { class: "dropzone" }, [
    "이미지를 드래그하거나 클릭하여 업로드 — 선택한 사이즈로 각각 자동 리사이징",
    el("input", {
      type: "file", accept: "image/*", multiple: "multiple",
      onchange: e => handleUpload(e.target.files)
    })
  ]);
  root.appendChild(drop);

  // 검색 · 정렬 · 필터 · 보기전환
  root.appendChild(el("div", { class: "filter-bar" }, [
    el("input", {
      type: "text", placeholder: "파일명으로 검색...", style: "min-width:180px;",
      oninput: e => { searchQuery = e.target.value; page = 1; renderTable(); }
    }),
    select(["전체", ...CATEGORY_PRESETS], filters.category, v => { filters.category = v; page = 1; renderTable(); }, "종류 필터"),
    select(["전체", "사용 중", "미사용"], filters.usage, v => { filters.usage = v; page = 1; renderTable(); }, "사용여부 필터"),
    select(
      ["최신순", "용량순", "이름순"],
      sortBy === "recent" ? "최신순" : sortBy === "size" ? "용량순" : "이름순",
      v => { sortBy = v === "최신순" ? "recent" : v === "용량순" ? "size" : "name"; renderTable(); },
      "정렬"
    ),
    el("div", { class: "view-toggle" }, [
      el("button", { class: viewMode === "list" ? "active" : "", onclick: () => { viewMode = "list"; renderTable(); } }, "목록"),
      el("button", { class: viewMode === "grid" ? "active" : "", onclick: () => { viewMode = "grid"; renderTable(); } }, "그리드")
    ])
  ]));

  const bulkBar = el("div", { id: "asset-bulk-bar", style: "display:none;" });
  root.appendChild(bulkBar);

  const tableHost = el("div", { id: "asset-table-host", style: "margin-top:8px;" });
  root.appendChild(tableHost);

  function resizeImage(file, maxDim) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        if (scale === 1) { resolve(file); return; }
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => resolve(blob || file), file.type || "image/jpeg", 0.9);
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  }

  async function uploadAsset(blob, filename, channel) {
    if (CONFIG.uploadApiUrl) {
      const presignRes = await fetch(CONFIG.uploadApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, contentType: blob.type, channel })
      });
      if (!presignRes.ok) throw new Error("업로드 URL 발급 실패: " + presignRes.status);
      const { uploadUrl, publicUrl } = await presignRes.json();
      const putRes = await fetch(uploadUrl, { method: "PUT", body: blob, headers: { "Content-Type": blob.type } });
      if (!putRes.ok) throw new Error("S3 업로드 실패: " + putRes.status);
      return publicUrl;
    }
    return URL.createObjectURL(blob);
  }

  function withSizeSuffix(filename, sizeKey) {
    const dot = filename.lastIndexOf(".");
    if (dot === -1) return `${filename}_${sizeKey}`;
    return `${filename.slice(0, dot)}_${sizeKey}${filename.slice(dot)}`;
  }

  /** 중복 업로드 감지 — 같은 파일명이 이미 있으면 확인창. 파일 내용까지 검사하는 건
   *  아니라서 완벽하진 않지만, "어 이거 이미 올렸나?" 하는 실수는 충분히 막아줍니다. */
  function findDuplicateByName(filename) {
    return store.assets.find(a => a.filename.toLowerCase() === filename.toLowerCase());
  }

  async function handleUpload(files) {
    if (!files || !files.length) return;
    const targets = SIZE_TARGETS.filter(t => selectedTargetKeys.has(t.key));
    if (!targets.length) { toast("생성할 사이즈를 1개 이상 선택하세요"); return; }

    const fileList = Array.from(files);
    const category = uploadCategory;

    for (const f of fileList) {
      const dup = findDuplicateByName(f.name);
      if (dup) {
        const proceed = confirm(`"${f.name}" 과 같은 파일명이 이미 있습니다 (업로드 ${dup.uploadedAt}). 그래도 새로 업로드할까요?`);
        if (!proceed) continue;
      }

      const variants = {};
      try {
        for (const target of targets) {
          const resized = await resizeImage(f, target.dim);
          const url = await uploadAsset(resized, withSizeSuffix(f.name, target.key), target.channel);
          variants[target.key] = { url, sizeKB: Math.round(resized.size / 1024), isDemoUrl: !CONFIG.uploadApiUrl };
        }
        store.addAsset({
          id: "a" + Date.now() + Math.random().toString(16).slice(2),
          filename: f.name,
          category,
          uploadedAt: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
          variants
        });
      } catch (e) {
        toast(`${f.name} 업로드 실패: ${e.message}`);
      }
    }
    toast(`${fileList.length}개 파일 처리를 완료했습니다`);
    renderTable();
  }

  /** 캠페인들의 draftData 안에 이 에셋의 URL이 실제로 쓰이고 있는지 대조합니다.
   *  ⚠️ 지금은 캠페인/에셋이 전부 같은 브라우저 localStorage 안에 있어서 이 대조가
   *  가능합니다 — DynamoDB 연동 후에도 "캠페인 JSON에 이 URL이 들어있는지" 대조하는
   *  방식 자체는 그대로 쓸 수 있습니다. */
  function findUsage(variants) {
    const urls = Object.values(variants).map(v => v.url).filter(Boolean);
    if (!urls.length) return [];
    const used = [];
    for (const c of store.campaigns) {
      const json = JSON.stringify(c.draftData || {});
      if (urls.some(u => json.includes(u))) used.push(c.name);
    }
    return used;
  }

  function getVariants(a) {
    return a.variants || legacyToVariants(a);
  }

  function matchesFilters(a) {
    if (filters.category !== "전체" && a.category !== filters.category) return false;
    if (searchQuery && !a.filename.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.usage !== "전체") {
      const used = findUsage(getVariants(a)).length > 0;
      if (filters.usage === "사용 중" && !used) return false;
      if (filters.usage === "미사용" && used) return false;
    }
    return true;
  }

  function sortRows(rows) {
    const arr = [...rows];
    if (sortBy === "name") arr.sort((a, b) => a.filename.localeCompare(b.filename));
    else if (sortBy === "size") arr.sort((a, b) => totalSizeKB(getVariants(b)) - totalSizeKB(getVariants(a)));
    else arr.sort((a, b) => (b.uploadedAt || "").localeCompare(a.uploadedAt || ""));
    return arr;
  }

  function totalSizeKB(variants) {
    return Object.values(variants).reduce((sum, v) => sum + (v.sizeKB || 0), 0);
  }

  function renderBulkBar() {
    const bar = root.querySelector("#asset-bulk-bar");
    if (selectedAssetIds.size === 0) { bar.style.display = "none"; bar.innerHTML = ""; return; }
    bar.style.display = "flex";
    bar.className = "bulk-action-bar";
    bar.innerHTML = "";
    bar.appendChild(el("span", { style: "font-weight:700;" }, `${selectedAssetIds.size}개 선택됨`));
    bar.appendChild(el("div", { style: "display:flex;gap:8px;" }, [
      el("button", {
        class: "btn btn-sm",
        onclick: () => {
          if (!confirm(`선택한 ${selectedAssetIds.size}개 에셋을 삭제할까요?`)) return;
          selectedAssetIds.forEach(id => store.deleteAsset(id));
          toast(`${selectedAssetIds.size}개 에셋을 삭제했습니다`);
          selectedAssetIds.clear();
          renderTable();
        }
      }, "선택 삭제"),
      el("button", { class: "btn btn-sm", onclick: () => { selectedAssetIds.clear(); renderTable(); } }, "선택 해제")
    ]));
  }

  function renderTable() {
    tableHost.innerHTML = "";
    let rows = store.assets.filter(matchesFilters);
    rows = sortRows(rows);
    renderBulkBar();

    if (rows.length === 0) {
      tableHost.appendChild(
        el("div", { class: "empty-state" }, [
          el("div", { class: "e-title" }, "조건에 맞는 에셋이 없습니다"),
          el("div", { class: "e-desc" }, "필터/검색어를 변경하거나 이미지를 업로드해보세요.")
        ])
      );
      return;
    }

    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    page = Math.min(page, totalPages);
    const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    if (viewMode === "grid") renderGrid(pageRows);
    else renderList(pageRows);

    const pag = el("div", { class: "pagination" }, [`${rows.length}건`]);
    for (let p = 1; p <= totalPages; p++) {
      pag.appendChild(el("button", { class: p === page ? "active" : "", onclick: () => { page = p; renderTable(); } }, String(p)));
    }
    tableHost.appendChild(pag);

    tableHost.appendChild(
      el("p", { style: "font-size:11px;color:#999;margin-top:12px;" },
        CONFIG.uploadApiUrl
          ? "📁 파일은 실제 S3에 저장됩니다."
          : "⚠ 데모 모드 — 실제 S3에 저장되지 않고 브라우저 임시 URL만 생성됩니다. 실 연동은 ASSET_UPLOAD_CONTRACT.md 참고.")
    );
  }

  function renderList(pageRows) {
    const table = el("table", { class: "tbl tbl-assets" }, [
      el("thead", {}, el("tr", {}, ["", "", "파일명", "생성된 사이즈", "종류", "사용여부", "업로드 일시", "액션"].map(h => el("th", {}, h)))),
      el("tbody", {}, pageRows.flatMap((a, idx) => {
        const variants = getVariants(a);
        const firstUrl = Object.values(variants)[0]?.url;
        const variantCount = Object.keys(variants).length;
        const usedIn = findUsage(variants);
        const detailId = `asset-link-detail-${idx}`;

        const mainRow = el("tr", {}, [
          el("td", {}, el("input", {
            type: "checkbox",
            checked: selectedAssetIds.has(a.id) ? "checked" : null,
            onchange: e => { if (e.target.checked) selectedAssetIds.add(a.id); else selectedAssetIds.delete(a.id); renderBulkBar(); }
          })),
          el("td", {}, firstUrl
            ? el("img", { src: firstUrl, alt: a.filename, class: "asset-thumb" })
            : el("span", { class: "badge gray" }, "IMG")),
          el("td", { class: "cell-name" }, a.filename),
          el("td", {}, el("div", { class: "variant-chips" }, SIZE_TARGETS.map(t => {
            const v = variants[t.key];
            if (!v) return null;
            return el("span", { class: "badge " + (t.channel === "LP" ? "purple" : "blue") }, t.key + (v.isDemoUrl ? " ⚠" : ""));
          }))),
          el("td", {}, a.category),
          el("td", {}, usedIn.length
            ? el("span", { class: "badge green", title: usedIn.join(", ") }, `사용 중 (${usedIn.length})`)
            : el("span", { class: "badge amber" }, "미사용")),
          el("td", {}, a.uploadedAt),
          el("td", {}, el("div", { class: "row-actions" }, [
            el("button", {
              class: "btn btn-sm",
              onclick: () => {
                const row = tableHost.querySelector(`#${detailId}`);
                if (row) row.style.display = row.style.display === "none" ? "table-row" : "none";
              }
            }, `링크 (${variantCount})`),
            el("button", {
              class: "btn btn-sm danger",
              onclick: () => {
                if (!confirm(`"${a.filename}" 을(를) 삭제할까요? (생성된 모든 사이즈가 같이 삭제됩니다)`)) return;
                store.deleteAsset(a.id);
                toast("에셋을 삭제했습니다");
                renderTable();
              }
            }, "삭제")
          ]))
        ]);

        const detailRow = el("tr", { id: detailId, style: "display:none;background:#fafbfd;" }, [
          el("td", { colspan: "8", style: "padding:10px 14px;" }, [
            el("div", { class: "link-detail-list" }, SIZE_TARGETS.map(t => {
              const v = variants[t.key];
              if (!v) return null;
              return el("div", { class: "link-detail-row" }, [
                el("span", { class: "badge " + (t.channel === "LP" ? "purple" : "blue") }, t.key),
                el("input", { type: "text", readonly: "readonly", value: v.url, onclick: e => e.target.select() }),
                el("button", { class: "btn btn-sm", onclick: () => window.open(v.url, "_blank") }, "열기"),
                el("button", {
                  class: "btn btn-sm",
                  onclick: () => navigator.clipboard?.writeText(v.url).then(() => toast(`${t.label} URL을 복사했습니다`))
                }, "복사"),
                v.isDemoUrl ? el("span", { style: "font-size:10px;color:#a9660a;" }, "⚠ 데모 URL") : null
              ]);
            })),
            usedIn.length ? el("div", { style: "margin-top:8px;font-size:11px;color:#555;" }, "사용 중인 캠페인: " + usedIn.join(", ")) : null
          ])
        ]);

        return [mainRow, detailRow];
      }))
    ]);
    tableHost.appendChild(el("div", { class: "tbl-wrap" }, table));
  }

  function renderGrid(pageRows) {
    const grid = el("div", { class: "asset-grid" }, pageRows.map(a => {
      const variants = getVariants(a);
      const firstUrl = Object.values(variants)[0]?.url;
      const usedIn = findUsage(variants);
      return el("div", { class: "asset-grid-card" }, [
        el("input", {
          type: "checkbox", class: "asset-grid-check",
          checked: selectedAssetIds.has(a.id) ? "checked" : null,
          onchange: e => { if (e.target.checked) selectedAssetIds.add(a.id); else selectedAssetIds.delete(a.id); renderBulkBar(); }
        }),
        firstUrl
          ? el("img", { src: firstUrl, alt: a.filename, class: "asset-grid-thumb" })
          : el("div", { class: "asset-grid-thumb asset-grid-thumb--empty" }, "IMG"),
        el("div", { class: "asset-grid-name" }, a.filename),
        el("div", {}, usedIn.length
          ? el("span", { class: "badge green" }, `사용 중 (${usedIn.length})`)
          : el("span", { class: "badge amber" }, "미사용"))
      ]);
    }));
    tableHost.appendChild(grid);
  }

  renderTable();
}

function legacyToVariants(a) {
  if (!a.channel || !a.url) return {};
  const key = a.channel === "LP" ? "LP1200" : "EDM";
  return { [key]: { url: a.url, sizeKB: a.sizeKB, isDemoUrl: a.isDemoUrl } };
}

function select(options, value, onChange, ariaLabel) {
  return el("select", { onchange: e => onChange(e.target.value), "aria-label": ariaLabel || "" },
    options.map(o => el("option", { value: o, ...(o === value ? { selected: "selected" } : {}) }, o))
  );
}
