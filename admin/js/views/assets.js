import { store } from "../state.js";
import { el, toast } from "../lib/dom.js";
import { resizeImage } from "../lib/imageResize.js";
import { nowDate } from "../lib/datetime.js";
import { uploadToS3, S3_UPLOAD_CONFIG } from "../lib/s3Upload.js";

// ⚠️ 2026-09 수정 — 예전엔 이 파일이 CONFIG.uploadApiUrl이라는 별도 설정을 갖고
// 있었는데, generator.js(EDM/LP 생성기)는 s3Upload.js의 S3_UPLOAD_CONFIG를 썼습니다.
// 백엔드가 실제로 연동된 건 s3Upload.js 쪽 URL이었는데, 이 파일의 CONFIG는 계속
// 빈 값으로 남아있어서 — 생성기에서 올린 이미지는 새로고침해도 안 사라지는데
// 에셋관리 화면에서 직접 올린 이미지는 데모 모드로만 동작하는 불일치가 있었습니다.
// 두 화면의 실제 presign 요청/응답 형태가 완전히 같아서(둘 다
// { filename, contentType, channel } → { uploadUrl, publicUrl }), 별도 CONFIG를
// 유지하는 대신 s3Upload.js의 uploadToS3()를 그대로 재사용합니다 — 앞으로 엔드포인트가
// 바뀌어도 한 곳(S3_UPLOAD_CONFIG)만 고치면 되고, 이런 불일치가 다시 생기지 않습니다.

// ⚠️ 2026-09 단순화 — 예전엔 LP를 1200/950/920(경제형 컨텐츠폭) 3가지로 세분화해서
// 각각 리사이즈 변형을 만들었는데, LP 이미지는 실제 화면에 width:100%로 들어가서
// 브라우저가 알아서 줄여 보여주므로 950/920 슬롯에 1200px짜리를 넣어도 시각적으로는
// 차이가 없습니다(파일 용량만 살짝 더 클 뿐). 그 미세한 용량 최적화보다, 마케터가
// 매번 "이건 950용인가 1200용인가"를 판단해야 하는 부담이 더 컸습니다 — EDM/LP
// 채널 하나씩으로 단순화합니다. 원본이 목표보다 작으면 resizeImage()가 그대로
// 원본을 반환하니(업스케일 안 함) "원본이 작으면 원본 그대로 저장"도 이미 됩니다.
const SIZE_TARGETS = [
  { key: "EDM", label: "EDM", channel: "EDM", dim: 600 },
  { key: "LP", label: "LP", channel: "LP", dim: 1200 }
];

const PAGE_SIZE = 10;
let filters = { usage: "전체" };
let searchQuery = "";
let sortBy = "recent"; // "recent" | "size" | "name"
let viewMode = "list"; // "list" | "grid"
let page = 1;
let selectedTargetKeys = new Set(["EDM"]);
let selectedAssetIds = new Set();
// ⚠️ 2026-09 — confirm()은 동기적으로 화면을 막는 다이얼로그인데, 그 사이
// 다른 클릭(다음 행의 삭제 버튼, 페이지네이션 등)이 큐에 쌓였다가 confirm이
// 닫히자마자 바로 처리되면서, 의도치 않게 다른 요소까지 같이 트리거되는
// 경쟁 상태가 있었습니다("삭제 한 번 눌렀는데 다른 것까지 같이 영향을 받는
// 것처럼 보인다"는 문의의 원인으로 추정). 삭제 처리 중엔 추가 삭제 요청을
// 무시하도록 막습니다.
let deleting = false;

export function renderAssets(root) {
  root.appendChild(
    el("div", { class: "page-head" }, [
      el("div", {}, [
        el("h1", {}, "에셋 관리"),
        el("p", {}, "이미지 등록 · 확인 · 삭제 · 사이즈 칩 클릭 시 URL 복사 → 생성기의 이미지 URL 입력란에 붙여넣기")
      ])
    ])
  );

  // ⚠️ 2026-09 — 예전엔 "라벨 한 줄 + 배경박스(패딩 10px) 체크박스 한 줄"로 세로
  // 공간을 꽤 차지했습니다. 이제 사이즈가 EDM/LP 2개뿐이라, 짧은 라벨과 체크박스를
  // 한 줄에 나란히 붙여서 훨씬 컴팩트하게 만듭니다.
  root.appendChild(el("div", { style: "display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:11.5px;" }, [
    el("span", { style: "color:#555;font-weight:700;" }, "생성 사이즈:"),
    ...SIZE_TARGETS.map(t =>
      el("label", { style: "display:flex;align-items:center;gap:5px;cursor:pointer;color:#444;" }, [
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
    )
  ]));

  // ⚠️ 2026-09 버그 수정 — "드래그하거나"라는 안내 문구는 있었는데, 실제 드롭
  // 이벤트 처리(ondragover/ondrop)가 코드에 전혀 없어서 드래그로는 아무 반응이
  // 없었습니다(클릭해서 파일 선택창을 여는 것만 실제로 동작). 실제 드래그앤드롭을
  // 구현합니다 — 드래그 중엔 시각적 피드백(테두리 강조)도 추가합니다.
  const drop = el("label", { class: "dropzone" }, [
    "파일 드래그·클릭 업로드",
    el("input", {
      type: "file", accept: "image/*,video/*,.pdf,.zip", multiple: "multiple",
      onchange: e => handleUpload(e.target.files)
    })
  ]);
  drop.ondragover = e => { e.preventDefault(); drop.classList.add("dropzone--active"); };
  drop.ondragleave = () => drop.classList.remove("dropzone--active");
  drop.ondrop = e => {
    e.preventDefault();
    drop.classList.remove("dropzone--active");
    handleUpload(e.dataTransfer.files);
  };
  root.appendChild(drop);

  // 검색 · 정렬 · 필터 · 보기전환
  root.appendChild(el("div", { class: "filter-bar" }, [
    el("input", {
      type: "text", placeholder: "파일명으로 검색...", style: "min-width:180px;",
      oninput: e => { searchQuery = e.target.value; page = 1; renderTable(); }
    }),
    select(["전체", "사용 중", "미사용"], filters.usage, v => { filters.usage = v; page = 1; renderTable(); }, "사용여부 필터"),
    select(
      ["최신순", "용량순", "이름순"],
      sortBy === "recent" ? "최신순" : sortBy === "size" ? "용량순" : "이름순",
      v => { sortBy = v === "최신순" ? "recent" : v === "용량순" ? "size" : "name"; renderTable(); },
      "정렬"
    ),
    (() => {
      // ⚠️ 2026-09 버그 수정 — 페이지네이션 버튼은 renderTable() 안에서 매번
      // 새로 그려져서 active 클래스가 항상 최신 상태였는데, 이 목록/그리드
      // 버튼은 renderAssets() 최초 렌더링 시 한 번만 만들어지고 renderTable()
      // 호출로는 다시 안 그려집니다 — 그래서 실제로는 그리드로 전환되는데도
      // 버튼 색은 계속 "목록"에 파랗게 남아있는 위화감이 있었습니다. 두 버튼을
      // 변수로 잡아서, 클릭 시 renderTable()과 별개로 class를 직접 갱신합니다.
      const listBtn = el("button", { class: viewMode === "list" ? "active" : "" }, "목록");
      const gridBtn = el("button", { class: viewMode === "grid" ? "active" : "" }, "그리드");
      listBtn.onclick = () => { viewMode = "list"; page = 1; listBtn.className = "active"; gridBtn.className = ""; renderTable(); };
      gridBtn.onclick = () => { viewMode = "grid"; page = 1; gridBtn.className = "active"; listBtn.className = ""; renderTable(); };
      return el("div", { class: "view-toggle" }, [listBtn, gridBtn]);
    })()
  ]));

  const bulkBar = el("div", { id: "asset-bulk-bar", style: "display:none;" });
  root.appendChild(bulkBar);

  const tableHost = el("div", { id: "asset-table-host", style: "margin-top:8px;" });
  root.appendChild(tableHost);

  // resizeImage는 ../lib/imageResize.js, 실제 업로드는 ../lib/s3Upload.js의
  // uploadToS3()를 generator.js와 공유해서 씁니다(이 파일 안에 별도 함수를 두지
  // 않습니다 — 위 import 설명 참고).

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
          const url = await uploadToS3(resized, withSizeSuffix(f.name, target.key), target.channel);
          variants[target.key] = { url, sizeKB: Math.round(resized.size / 1024), isDemoUrl: !S3_UPLOAD_CONFIG.uploadApiUrl };
        }
        store.addAsset({
          id: "a" + Date.now() + Math.random().toString(16).slice(2),
          filename: f.name,
          uploadedAt: nowDate(),
          variants,
          source: "assets-page",
          aiProcessed: false
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
      // ⚠️ 2026-09 버그 수정 — draftData 안에 순환 참조나 JSON으로 직렬화 못 하는
      // 값이 섞여 있으면 JSON.stringify()가 예외를 던집니다. 이 함수는
      // renderList()가 각 행을 만들 때마다 호출되는데, 여기서 예외가 나면
      // 그 행 하나만 실패하는 게 아니라 renderList() 전체(그리고 뒤이어 그려질
      // 페이지네이션까지)가 조용히 멈춰버립니다 — 특정 캠페인 데이터가 있는
      // 페이지로 갈 때만 "페이지네이션이 안 눌린다"는 문의의 실제 원인으로
      // 추정됩니다. 캠페인 하나가 문제여도 나머지는 정상 처리되도록 격리합니다.
      let json;
      try {
        json = JSON.stringify(c.draftData || {});
      } catch (err) {
        console.error(`캠페인 "${c.name}"의 draftData를 확인하는 중 오류(건너뜀)`, err);
        continue;
      }
      if (urls.some(u => json.includes(u))) used.push(c.name);
    }
    return used;
  }

  /** findUsage()는 "지금 어느 캠페인에서 쓰이고 있는지"(재사용 여부)를 보는 거고,
   *  이건 "원래 어느 캠페인에서 만들어졌는지"(출처)를 봅니다 — 서로 다른 정보입니다.
   *  생성기(registerAsset)가 등록할 때 sourceCampaignId를 남겨두면, "이 에셋이
   *  원래 어디서 왔는지"를 알 수 있습니다. 에셋관리 화면에서 직접 업로드한 경우엔
   *  sourceCampaignId가 없으므로 null을 반환합니다.
   *  ⚠️ 2026-09 — "고아 에셋"(원본 캠페인이 삭제됨) 구분을 없앴습니다. 원본
   *  캠페인이 삭제됐으면 보여줄 유의미한 정보가 없으므로, 있던 캠페인과 똑같이
   *  null을 반환해서 배지 자체가 안 뜨게 합니다 — sourceCampaignId가 없는 경우와
   *  구분 없이 동일하게 처리됩니다.
   *  ⚠️ promotionName도 같이 반환합니다 — 캠페인명만으로는 "이 EDM 이미지랑 이 LP
   *  배너가 같은 프로모션 소속"인지 알기 어렵고, 같은 프로모션이면 캠페인 설정 화면의
   *  안내처럼 EDM/LP 양쪽에 동일한 프로모션명을 입력해두므로 이 값으로 매핑이 됩니다.
   *  @returns {{name: string, promotionName: string}|null} */
  function sourceCampaignInfo(a) {
    if (!a.sourceCampaignId) return null;
    const campaign = store.campaigns.find(c => c.id === a.sourceCampaignId);
    if (!campaign) return null;
    return { name: campaign.name, promotionName: campaign.promotionName || "" };
  }

  function getVariants(a) {
    return a.variants || legacyToVariants(a);
  }

  function matchesFilters(a) {
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
          if (deleting) return;
          if (!confirm(`선택한 ${selectedAssetIds.size}개 에셋을 삭제할까요?`)) return;
          deleting = true;
          try {
            selectedAssetIds.forEach(id => store.deleteAsset(id));
            toast(`${selectedAssetIds.size}개 에셋을 삭제했습니다`);
            selectedAssetIds.clear();
            renderTable();
          } catch (err) {
            console.error("일괄 삭제/재렌더링 중 오류", err);
            toast("삭제 중 오류가 발생했습니다: " + err.message);
          } finally {
            deleting = false;
          }
        }
      }, "선택 삭제"),
      el("button", { class: "btn btn-sm", onclick: () => { selectedAssetIds.clear(); renderTable(); } }, "선택 해제")
    ]));
  }

  function renderTable() {
    // ⚠️ 2026-09 버그 수정 — 이전엔 renderList()/renderGrid() 호출부만
    // try/catch로 감쌌는데, 그 앞뒤(matchesFilters, sortRows, renderBulkBar,
    // 페이지네이션 조립 자체)에서 예외가 나면 여전히 방어가 안 됐습니다.
    // "1페이지에서 삭제해도 2페이지 클릭이 안 된다"는 재현 사례가 있어서,
    // 아직 제가 못 찾은 예외 지점이 더 있을 수 있다고 보고 함수 전체를
    // 한 번 더 감쌉니다 — 어떤 이유로 실패하든 최소한 "다시 시도" 안내와
    // 페이지네이션은 항상 보이게 합니다.
    try {
      renderTableInner();
    } catch (err) {
      console.error("에셋 목록 렌더링 중 예상치 못한 오류", err);
      tableHost.innerHTML = "";
      tableHost.appendChild(
        el("div", { class: "empty-state" }, [
          el("div", { class: "e-title" }, "목록을 표시하는 중 오류가 발생했습니다"),
          el("div", { class: "e-desc" }, err.message),
          el("button", { class: "btn btn-sm", style: "margin-top:8px;", onclick: () => { page = 1; renderTable(); } }, "1페이지부터 다시 시도")
        ])
      );
    }
  }

  function renderTableInner() {
    // ⚠️ 2026-09 버그 수정 — 라이트박스(openImageLightbox)는 position:fixed로
    // 화면 전체를 덮는 오버레이라, 사용자가 이미지를 클릭해 열어놓고 닫는 걸
    // 잊으면 그 뒤의 페이지네이션·필터·검색 등 어떤 클릭도 먹통이 됩니다
    // ("페이징이 안 눌린다"는 문의의 실제 원인이었습니다). 검색/필터/페이지
    // 전환처럼 목록을 다시 그리는 모든 시점에 열려있는 라이트박스를 자동으로
    // 닫아서, 사용자가 직접 닫는 걸 잊어도 다른 조작이 항상 가능하게 합니다.
    document.querySelectorAll(".asset-lightbox-overlay").forEach(n => n.remove());
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

    // ⚠️ 2026-09 — 목록/그리드가 서로 다른 페이지 크기(10/30)를 쓰던 걸 하나로
    // 통일했습니다. 뷰 전환 시 페이지 계산이 어긋나 보일 수 있다는 우려가 있어서,
    // 안전하게 항상 같은 개수를 기준으로 페이지를 나눕니다.
    const pageSize = PAGE_SIZE;
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    page = Math.min(page, totalPages);
    const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

    // ⚠️ 2026-09 버그 수정 — renderList()/renderGrid() 안에서 예외가 나면(예:
    // 캠페인 데이터를 대조하다가, 혹은 다른 예상 못한 데이터 문제로) 그 아래
    // 있는 페이지네이션 코드까지 도달을 못 해서, 페이지 버튼 자체가 화면에서
    // 사라지는 문제가 있었습니다("2페이지 버튼은 보이는데 눌러도 반응이
    // 없다"는 문의의 실제 원인 — 예외가 나면 그 순간의 오래된 버튼이 클릭
    // 리스너 없이 남아있게 됨). 목록 렌더링이 실패해도 최소한 페이지 이동은
    // 항상 가능하도록 분리합니다.
    try {
      if (viewMode === "grid") renderGrid(pageRows);
      else renderList(pageRows);
    } catch (err) {
      console.error("목록/그리드 렌더링 중 오류", err);
      tableHost.appendChild(
        el("p", { style: "color:#c0392b;font-size:12px;padding:12px;" },
          "일부 항목을 표시하는 중 오류가 발생했습니다: " + err.message)
      );
    }

    const pag = el("div", { class: "pagination" }, [`${rows.length}건`]);
    for (let p = 1; p <= totalPages; p++) {
      pag.appendChild(el("button", { class: p === page ? "active" : "", onclick: () => { page = p; renderTable(); } }, String(p)));
    }
    tableHost.appendChild(pag);

    if (!S3_UPLOAD_CONFIG.uploadApiUrl) {
      tableHost.appendChild(
        el("p", { style: "font-size:11px;color:#999;margin-top:12px;" },
          "⚠ 데모 모드 — 실제 S3에 저장되지 않고 브라우저 임시 URL만 생성됩니다.")
      );
    }
  }

  function renderList(pageRows) {
    const table = el("table", { class: "tbl tbl-assets" }, [
      el("thead", {}, el("tr", {}, ["", "", "파일명", "출처 캠페인", "생성된 사이즈", "사용여부", "업로드일", "액션"].map(h => el("th", {}, h)))),
      el("tbody", {}, pageRows.flatMap((a, idx) => {
        const variants = getVariants(a);
        const firstUrl = Object.values(variants)[0]?.url;
        const variantCount = Object.keys(variants).length;
        const usedIn = findUsage(variants);
        const origin = sourceCampaignInfo(a);
        // ⚠️ idx는 pageRows 안에서의 상대 위치라 페이지가 바뀌어도 항상 0부터
        // 다시 시작합니다 — asset.id 기반으로 만들어야 페이지가 달라져도
        // 고유합니다(예전엔 1페이지의 detail-0과 2페이지의 detail-0이 같은
        // id라서 중복 DOM id가 생겼습니다).
        const detailId = `asset-link-detail-${a.id}`;

        const mainRow = el("tr", {}, [
          el("td", {}, el("input", {
            type: "checkbox",
            checked: selectedAssetIds.has(a.id) ? "checked" : null,
            onchange: e => { if (e.target.checked) selectedAssetIds.add(a.id); else selectedAssetIds.delete(a.id); renderBulkBar(); }
          })),
          el("td", {}, (() => {
            if (!firstUrl) return el("span", { class: "badge gray" }, "IMG");
            const kind = getFileKind(a.filename);
            const previewUrl = largestVariantUrl(variants) || firstUrl;
            if (kind.type === "image") {
              return el("img", {
                src: firstUrl, alt: a.filename, class: "asset-thumb", style: "cursor:zoom-in;",
                onclick: () => openImageLightbox(previewUrl, a.filename)
              });
            }
            if (kind.type === "video") {
              // ⚠️ 2026-09 — <video preload="metadata">는 재생 버튼을 안 눌러도
              // 브라우저가 자동으로 첫 프레임을 그려서 보여줍니다 — 별도 썸네일
              // 생성 없이 실제 영상 내용을 미리 보여줄 수 있는 가장 간단한 방법.
              return el("video", {
                src: firstUrl, class: "asset-thumb", style: "cursor:zoom-in;object-fit:cover;",
                preload: "metadata", muted: "muted",
                onclick: () => openImageLightbox(previewUrl, a.filename)
              });
            }
            // PDF·ZIP 등 — 썸네일은 아이콘이지만, 클릭하면 openImageLightbox가
            // 종류에 맞게(PDF는 실제 렌더링, 그 외는 안내) 열어줍니다.
            return el("div", {
              class: "asset-thumb asset-thumb--file", title: a.filename, style: "cursor:zoom-in;",
              onclick: () => openImageLightbox(previewUrl, a.filename)
            }, [
              el("span", {}, kind.icon),
              el("span", { style: "font-size:9px;" }, kind.ext)
            ]);
          })()),
          // ⚠️ 2026-09 재시도 — 예전엔 "종류" 컬럼까지 있어서 9컬럼이라 좁은 화면에서
          // 액션이 밀려났는데, 종류 컬럼을 완전히 없앤 지금은 8컬럼(종류 제거 전과
          // 동일한 개수)이라 여유가 생겼습니다. 실무 확인 결과 실제 관리자 화면
          // 폭에서는 문제없다고 판단해서, 출처 캠페인을 다시 별도 컬럼으로 뺍니다 —
          // 파일명이 길 때 배지까지 같이 줄바꿈되며 세로로 길어지던 문제도 해결됩니다.
          el("td", { class: "cell-name" }, [
            el("div", {}, a.filename),
            el("div", { style: "margin-top:3px;" }, [
              sourceBadge(a.source),
              a.aiProcessed ? el("span", { class: "badge green", style: "margin-left:4px;" }, "AI 보정") : null
            ])
          ]),
          el("td", {}, origin
            ? el("span", {
                class: "badge gray", style: "max-width:100%;overflow:hidden;text-overflow:ellipsis;display:inline-block;vertical-align:top;",
                title: origin.promotionName ? `${origin.name} · ${origin.promotionName}` : origin.name
              }, origin.promotionName ? `${origin.name} · ${origin.promotionName}` : origin.name)
            : "-"),
          el("td", {}, el("div", { class: "variant-chips" }, SIZE_TARGETS.map(t => {
            const v = variants[t.key];
            if (!v) return null;
            return el("span", { class: "badge " + (t.channel === "LP" ? "purple" : "blue") }, t.key + (v.isDemoUrl ? " ⚠" : ""));
          }))),
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
                if (deleting) return;
                if (!confirm(`"${a.filename}" 을(를) 삭제할까요? (생성된 모든 사이즈가 같이 삭제됩니다)`)) return;
                deleting = true;
                try {
                  store.deleteAsset(a.id);
                  toast("에셋을 삭제했습니다");
                  renderTable();
                } catch (err) {
                  // ⚠️ 2026-09 버그 수정 — renderTable() 도중 예외가 나면(예:
                  // 데이터가 이상한 에셋을 렌더링하다가) deleting=false가 실행될
                  // 기회 자체가 없어서 영원히 true로 남아, 이후 모든 삭제 클릭이
                  // 막혀버렸습니다. 게다가 renderTable()이 중간에 멈추면 마지막에
                  // 그려야 할 페이지네이션 버튼 자체가 아예 안 그려져서 "페이징이
                  // 안 된다"로 보였습니다("클릭이 막힌다"는 게 정확히 이 증상과
                  // 일치합니다). try/finally로 무슨 일이 있어도 락은 풀리게 하고,
                  // 에러 내용도 조용히 삼키지 않고 알려줍니다.
                  console.error("에셋 삭제/재렌더링 중 오류", err);
                  toast("삭제 중 오류가 발생했습니다: " + err.message);
                } finally {
                  deleting = false;
                }
              }
            }, "삭제")
          ]))
        ]);

        const detailRow = el("tr", { id: detailId, style: "display:none;background:#fafbfd;" }, [
          el("td", { colspan: "8", style: "padding:10px 14px;" }, [
            // ⚠️ 2026-09 버그 수정 — "링크" 버튼을 누르면 이 상세 행이 펼쳐지는데,
            // variants가 비어있는(오래된 데이터 등) 에셋은 URL 행이 하나도 안 나오고
            // 그 아래 "사용 중인 캠페인: ..."만 덩그러니 남아서, 마치 "링크 대신
            // 캠페인명만 나온다"는 혼란을 줬습니다. 그런 경우 이유를 명확히 알려줍니다.
            variantCount === 0
              ? el("div", { style: "font-size:12px;color:#999;" }, "등록된 URL 정보가 없습니다.")
              : null,
            el("div", { class: "link-detail-list" }, SIZE_TARGETS.map(t => {
              const v = variants[t.key];
              if (!v) return null;
              return el("div", { class: "link-detail-row" }, [
                el("span", { class: "badge " + (t.channel === "LP" ? "purple" : "blue") }, t.key),
                el("input", { type: "text", readonly: "readonly", value: v.url, onclick: e => e.target.select() }),
                el("button", { class: "btn btn-sm", onclick: () => window.open(v.url, "_blank") }, "열기"),
                el("button", {
                  class: "btn btn-sm",
                  onclick: () => navigator.clipboard?.writeText(v.url).then(() => toast("URL을 복사했습니다"))
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
        (() => {
          if (!firstUrl) return el("div", { class: "asset-grid-thumb asset-grid-thumb--empty" }, "IMG");
          const kind = getFileKind(a.filename);
          const previewUrl = largestVariantUrl(variants) || firstUrl;
          if (kind.type === "image") {
            return el("img", {
              src: firstUrl, alt: a.filename, class: "asset-grid-thumb", style: "cursor:zoom-in;",
              onclick: () => openImageLightbox(previewUrl, a.filename)
            });
          }
          if (kind.type === "video") {
            return el("video", {
              src: firstUrl, class: "asset-grid-thumb", style: "cursor:zoom-in;",
              preload: "metadata", muted: "muted",
              onclick: () => openImageLightbox(previewUrl, a.filename)
            });
          }
          return el("div", {
            class: "asset-grid-thumb asset-grid-thumb--file", title: a.filename, style: "cursor:zoom-in;",
            onclick: () => openImageLightbox(previewUrl, a.filename)
          }, [
            el("span", { style: "font-size:28px;" }, kind.icon),
            el("span", { style: "font-size:10px;color:#888;" }, kind.ext)
          ]);
        })(),
        el("div", { class: "asset-grid-name" }, a.filename),
        // ⚠️ 2026-09 재수정 — 예전엔 출처 배지(생성기업로드/AI보정/출처캠페인) 유무가
        // 카드마다 달라서 사용여부 배지 위치가 어긋났고, 빈 자리를 만들어 정렬만
        // 맞추니 이번엔 불필요한 여백이 어색해 보였습니다. 그리드는 "빠르게 훑어보는"
        // 용도라 판단해서, 상세 출처 정보는 목록 뷰에만 남기고 그리드는 파일명+
        // 사용여부만 보여주도록 단순화합니다 — 어차피 사용여부는 필터로 따로
        // 걸러볼 수 있으니 그리드에서 더 자세한 정보를 표시할 필요가 크지 않습니다.
        el("div", {}, usedIn.length
          ? el("span", { class: "badge green" }, `사용 중 (${usedIn.length})`)
          : el("span", { class: "badge amber" }, "미사용"))
      ]);
    }));
    tableHost.appendChild(grid);
  }

  renderTable();
}

/** 에셋이 어디서 업로드됐는지 배지로 표시합니다. 생성기에서 직접 업로드하는 기능이 생기고,
 *  CLI 업로드 파이프라인도 같은 자산 목록에 등록될 예정이라 — 이 화면이 "업로드 창구"에서
 *  "여러 경로로 들어온 이미지를 한곳에서 찾아 재사용하는 라이브러리"로 역할이 바뀌었습니다. */
function sourceBadge(source) {
  if (source === "generator") return el("span", { class: "badge blue" }, "생성기 업로드");
  if (source === "cli") return el("span", { class: "badge purple" }, "CLI 업로드");
  return el("span", { class: "badge gray" }, "에셋관리 업로드");
}

/** 여러 사이즈로 생성된 variant 중, 실제 픽셀 크기가 가장 큰 것의 URL을 찾습니다.
 *  ⚠️ "이미지 클릭 시 실제 크기로 보기" 기능에서 씁니다 — 목록/그리드에 쓰이는
 *  firstUrl(Object.values(variants)[0])은 그냥 "가장 먼저 생성된" 사이즈일 뿐이라,
 *  꼭 가장 큰 해상도라는 보장이 없습니다. */
function largestVariantUrl(variants) {
  let best = null, bestDim = -1;
  for (const [key, v] of Object.entries(variants || {})) {
    if (!v?.url) continue;
    const target = SIZE_TARGETS.find(t => t.key === key);
    const dim = target?.dim ?? 0;
    if (dim > bestDim) { bestDim = dim; best = v.url; }
  }
  return best;
}

// ⚠️ 2026-09 — PDF·ZIP·동영상 등 이미지가 아닌 파일도 업로드는 가능하지만
// (GIF·동영상 활용 사례 고려), <img src="...pdf">처럼 무조건 이미지 태그로
// 렌더링을 시도하면 브라우저가 못 읽어서 깨진 이미지 아이콘만 보였습니다.
// 확장자로 종류를 미리 판별해서, 썸네일뿐 아니라 미리보기(아래 openFilePreview)
// 방식도 종류에 맞게 분기합니다. renderAssets() 안(썸네일)과 밖(라이트박스)
// 양쪽에서 다 써야 해서 모듈 최상위로 뺐습니다.
const FILE_KIND_ICONS = { pdf: "📄", zip: "📦" };
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "mkv"]); // ⚠️ avi는 브라우저 내장 <video>가 재생 못 하는 경우가 많아서 제외 — 미리보기 불가 취급이 오히려 정직함
function getFileKind(filename) {
  const dot = filename.lastIndexOf(".");
  const ext = dot === -1 ? "" : filename.slice(dot + 1).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return { type: "image" };
  if (VIDEO_EXTENSIONS.has(ext)) return { type: "video", icon: "🎬", ext: ext.toUpperCase() };
  if (ext === "pdf") return { type: "pdf", icon: "📄", ext: "PDF" };
  return { type: "other", icon: FILE_KIND_ICONS[ext] || "📁", ext: ext ? ext.toUpperCase() : "FILE" };
}

/** 파일을 실제 크기/형태로 보여주는 미리보기. 배경(오버레이) 클릭이나 ESC로 닫힙니다.
 *  ⚠️ 2026-09 확장 — 예전엔 이미지만 지원했는데(함수명은 그대로 두되 내부에서
 *  분기), 브라우저가 원래 자체적으로 재생/렌더링 가능한 종류(동영상, PDF)는
 *  실제 내용을 그대로 보여줍니다. ZIP처럼 브라우저가 못 여는 종류만 "미리보기
 *  불가 — 새 창에서 열기" 안내로 대체합니다.
 *  ⚠️ 매번 새로 append하고 닫힐 때 완전히 제거합니다 — DOM에 여러 개가 쌓이지
 *  않도록, 여는 시점에 기존 라이트박스가 있으면 먼저 지웁니다. */
function openImageLightbox(url, filename) {
  document.querySelectorAll(".asset-lightbox-overlay").forEach(n => n.remove());
  const kind = getFileKind(filename || "");
  // ⚠️ 2026-09 — 배경 클릭/X버튼으로 닫을 때 keydown 리스너 제거를 안 하고
  // 있었습니다(ESC로 닫을 때만 제거됨) — 라이트박스를 여러 번 열고 닫으면
  // 리스너가 계속 쌓이는 누수였습니다. 닫는 경로 3가지(배경 클릭/X버튼/ESC)를
  // 전부 이 함수 하나로 모아서 항상 리스너까지 같이 정리합니다.
  const close = () => {
    overlay.remove();
    document.removeEventListener("keydown", onKeydown);
  };
  const previewStyle = "max-width:90vw;max-height:85vh;object-fit:contain;box-shadow:0 8px 32px rgba(0,0,0,.4);border-radius:4px;";
  let content;
  if (kind.type === "video") {
    content = el("video", { src: url, controls: "controls", autoplay: "autoplay", style: previewStyle, onclick: e => e.stopPropagation() });
  } else if (kind.type === "pdf") {
    // ⚠️ PDF는 브라우저 내장 뷰어가 <iframe>/<embed> 안에서 그대로 렌더링해줍니다 —
    // 별도 라이브러리(PDF.js 등) 없이도 실제 페이지 내용을 그대로 보여줄 수 있습니다.
    content = el("iframe", {
      src: url, style: "width:90vw;height:85vh;border:none;border-radius:4px;background:#fff;box-shadow:0 8px 32px rgba(0,0,0,.4);",
      onclick: e => e.stopPropagation()
    });
  } else if (kind.type === "other") {
    // ⚠️ ZIP 등은 브라우저가 내용을 열어서 보여줄 방법이 없습니다 — 안 되는 척
    // 흉내내지 않고, 정직하게 "미리보기를 지원하지 않는다"고 안내하고 대신
    // 새 창에서 열기(내려받기로 이어짐)를 제공합니다.
    content = el("div", {
      style: "background:#fff;border-radius:8px;padding:32px 40px;text-align:center;max-width:80vw;",
      onclick: e => e.stopPropagation()
    }, [
      el("div", { style: "font-size:48px;margin-bottom:12px;" }, kind.icon),
      el("div", { style: "font-size:13px;color:#555;margin-bottom:16px;" }, `${kind.ext} 파일은 미리보기를 지원하지 않습니다.`),
      el("a", { href: url, target: "_blank", rel: "noopener", class: "btn btn-sm", style: "text-decoration:none;" }, "새 창에서 열기")
    ]);
  } else {
    content = el("img", {
      src: url, alt: filename || "",
      style: previewStyle,
      onclick: e => e.stopPropagation() // 이미지 자체를 눌러도 안 닫히게(배경만 닫힘)
    });
  }
  const overlay = el("div", {
    class: "asset-lightbox-overlay",
    style: "position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;",
    onclick: close
  }, [
    content,
    el("button", {
      style: "position:absolute;top:20px;right:24px;background:none;border:none;color:#fff;font-size:28px;cursor:pointer;line-height:1;",
      onclick: close
    }, "×"),
    // ⚠️ 2026-09 — 이 오버레이가 화면 전체를 덮어서, 닫는 방법을 모르면 뒤에 있는
    // 페이지네이션·필터·검색 등 어떤 클릭도 안 먹히는 것처럼 느껴집니다("페이징이
    // 안 눌린다"는 문의의 실제 원인이었습니다) — 닫는 방법을 명확히 안내합니다.
    el("div", {
      style: "position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:#fff;font-size:12px;background:rgba(0,0,0,.5);padding:4px 10px;border-radius:4px;text-align:center;"
    }, [
      filename ? el("div", {}, filename) : null,
      el("div", { style: filename ? "margin-top:2px;opacity:.8;" : "" }, "배경을 클릭하거나 ESC 키를 누르면 닫힙니다")
    ])
  ]);
  const onKeydown = e => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKeydown);
  document.body.appendChild(overlay);
}

function legacyToVariants(a) {
  if (!a.channel || !a.url) return {};
  const key = a.channel === "LP" ? "LP" : "EDM";
  return { [key]: { url: a.url, sizeKB: a.sizeKB, isDemoUrl: a.isDemoUrl } };
}

function select(options, value, onChange, ariaLabel) {
  return el("select", { onchange: e => onChange(e.target.value), "aria-label": ariaLabel || "" },
    options.map(o => el("option", { value: o, ...(o === value ? { selected: "selected" } : {}) }, o))
  );
}
