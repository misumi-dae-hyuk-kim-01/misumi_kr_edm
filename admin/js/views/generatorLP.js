import { store } from "../state.js";
import { el, toast } from "../lib/dom.js";
import { generateCopyLP } from "../lib/copyGeneratorLP.js";
import { generateSeoMeta } from "../lib/seoMetaGenerator.js";
import { assembleLpHtml, assembleLpCatalogGroupHtml, CATALOG_GROUPS, CATALOG_STYLE, CATALOG_SCRIPT } from "../lib/blocksLP.js";
import { seedLpTemplates } from "../data/lpTemplates.js";
import { checkGuidelinesLP, summarizeGuidelineIssuesLP, LP_WIDTH_PATTERNS, DEPLOYMENT_COUNTRY } from "../lib/guidelineCheckLP.js";
import { checkAllLinks, summarizeLinkResults } from "../lib/linkChecker.js";
import { fetchSeriesInfo, fetchSeriesInfoBatch } from "../lib/seriesApi.js";
import { deployLpToS3, deployLpFilesToS3 } from "../lib/lpDeploy.js";

const LP_TEMPLATES = seedLpTemplates();
// ⚠️ 신상품카탈로그는 다른 LP 템플릿과 완전히 다른 화면(캐치카피 등 타이핑 폼이 아니라
// 엑셀 업로드 중심)이라, LP_TEMPLATES 안에 넣지 않고 별도 상수로 관리합니다.
// 템플릿 드롭다운에는 이 값도 같이 보여주고, templateId로 어느 쪽인지 구분합니다.
const CATALOG_TEMPLATE_ID = "catalog-신상품";

const PAGE_TYPES = [
  { key: "일반형", desc: "기본 페이지 구조" },
  { key: "경제형", desc: `${DEPLOYMENT_COUNTRY} 한정 · 920px 전용` }
];

export function renderGeneratorLP(root, params) {
  const editId = params.get("id");
  const existing = editId ? store.getCampaign(editId) : null;
  const draft = buildInitialDraftLP(existing);

  root.appendChild(el("div", { class: "gen-app" }, [
    el("div", { class: "gen-form-area" }, [
      el("div", { class: "gen-topbar" }, [
        el("a", { class: "gen-back", href: "#/campaigns" }, "← 캠페인 목록")
      ]),
      el("div", { class: "gen-form-header" }, [
        el("h1", {}, "LP 생성기"),
        el("p", { id: "genlp-subtitle" }, `랜딩페이지 · ${DEPLOYMENT_COUNTRY}`)
      ]),
      el("div", { class: "gen-form-body", id: "genlp-form-body" }),
      el("div", { class: "gen-form-footer" }, [
        el("div", { class: "log-summary", id: "genlp-log-summary", onclick: toggleLogDetails }, [
          el("span", { class: "log-chevron", id: "genlp-log-chevron" }, "▸"),
          el("span", { class: "log-summary-text", id: "genlp-log-summary-text" }, "대기 중...")
        ]),
        el("div", { class: "log-details", id: "genlp-log-details", style: "display:none;" }),
        el("div", { id: "genlp-guideline-badge", class: "guideline-badge", onclick: toggleGuidelineDetails }, "가이드라인 확인 중..."),
        el("div", { id: "genlp-guideline-results", style: "display:none;" }),
        el("div", { class: "footer-btn-row" }, [
          el("div", { class: "export-dropdown" }, [
            el("button", { class: "btn primary export-btn", onclick: toggleExportMenu }, "내보내기 ▾"),
            el("div", { class: "export-menu", id: "genlp-export-menu", style: "display:none;" }, [
              el("button", { class: "export-menu-item", onclick: () => { closeExportMenu(); copyHtml(); } }, "HTML 복사"),
              el("button", { class: "export-menu-item", onclick: () => { closeExportMenu(); downloadHtml(); } }, "파일 다운로드")
            ])
          ]),
          el("button", { class: "btn", onclick: runLinkCheck }, "🔗 링크 확인")
        ]),
        el("div", { id: "genlp-link-check-results" }),
        el("div", { class: "footer-btn-row", style: "margin-top:8px;" }, [
          el("button", { class: "btn primary", style: "width:100%;", onclick: deployLp }, "🚀 배포하기 (S3)")
        ]),
        el("div", { id: "genlp-deploy-result" }),
        el("button", { class: "btn ghost", style: "width:100%;", onclick: saveDraft }, "임시저장")
      ])
    ]),
    el("div", { class: "gen-preview-area" }, [
      el("div", { class: "gen-preview-header" }, [
        el("h2", {}, "미리보기"),
        el("div", { class: "view-toggle" }, [
          el("button", { class: "active", id: "genlp-view-desktop", onclick: () => setViewport("desktop") }, "🖥️ 데스크탑"),
          el("button", { id: "genlp-view-mobile", onclick: () => setViewport("mobile") }, "📱 모바일")
        ])
      ]),
      el("div", { class: "preview-wrap", id: "genlp-preview-wrap" }, [
        el("div", { class: "preview-frame" }, [
          el("div", { id: "genlp-preview-frame-wrap" })
        ])
      ])
    ])
  ]));

  const formBody = root.querySelector("#genlp-form-body");
  const previewFrame = root.querySelector("#genlp-preview-frame-wrap");
  let latestGuidelineIssues = [];
  let logHistory = [];

  renderForm();
  renderPreview();
  if (draft.deployedUrl) renderDeployResult(draft.deployedUrl);

  function renderForm() {
    formBody.innerHTML = "";
    formBody.appendChild(sectionTemplate());
    if (draft.templateId === CATALOG_TEMPLATE_ID) {
      // ⚠️ 신상품카탈로그는 캐치카피 등을 타이핑하는 화면이 아니라 엑셀 업로드
      // 중심이라, 일반 LP 섹션들을 전부 건너뜁니다.
      formBody.appendChild(sectionCatalogUpload());
      return;
    }
    formBody.appendChild(sectionPromotionLink());
    formBody.appendChild(sectionPageType());
    formBody.appendChild(sectionWidthPattern());
    formBody.appendChild(sectionBreadcrumb());
    formBody.appendChild(sectionSeriesCodesLP());
    formBody.appendChild(sectionCatchcopy());
    formBody.appendChild(sectionAiCopy());
    formBody.appendChild(sectionHeroImage());
    formBody.appendChild(sectionBodyImage());
    formBody.appendChild(sectionBodyText());
    formBody.appendChild(sectionSeoMeta());
  }

  // ==========================================================================
  // 신상품카탈로그 — 엑셀 업로드 → 시리즈 API 배치 조회 → 그룹별 HTML 생성 → 배포
  // ==========================================================================

  function sectionCatalogUpload() {
    const groupRows = CATALOG_GROUPS.map(g => {
      const info = (draft.catalogGroups || {})[g.id];
      const statusLabel = !info ? "대기 중" : info.status === "processing" ? "처리 중" : "완료";
      const statusClass = !info ? "" : info.status === "processing" ? "badge-warn" : "badge-pass";
      return el("div", { class: "catalog-group-row" }, [
        el("span", { class: "catalog-group-label" }, g.label),
        el("span", { class: "catalog-group-count" }, info ? `${info.count}개` : ""),
        el("span", { class: "guideline-badge " + statusClass, style: "margin-left:auto;" }, statusLabel),
        el("button", {
          class: "btn btn-sm", disabled: info?.status === "done" ? null : "disabled",
          onclick: () => { renderCatalogPreviewFor(g.id); }
        }, "미리보기")
      ]);
    });

    const readyCount = Object.values(draft.catalogGroups || {}).filter(g => g.status === "done").length;
    const totalGroupsWithData = Object.keys(draft.catalogGroups || {}).length;
    const allReady = totalGroupsWithData > 0 && readyCount === totalGroupsWithData && !draft.catalogImporting;

    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [
          el("span", { class: "sec-badge" }, "②"),
          el("span", { class: "sec-title" }, "상품 데이터 업로드")
        ])
      ]),
      el("div", { class: "sec-body" }, [
        el("label", { class: "btn upload-label", style: "width:100%;justify-content:center;" }, [
          draft.catalogImporting ? "처리 중..." : "엑셀 업로드",
          el("input", {
            type: "file", accept: ".xlsx,.xls,.csv", style: "display:none;", disabled: draft.catalogImporting ? "disabled" : null,
            onchange: e => { if (e.target.files[0]) handleCatalogUpload(e.target.files[0]); }
          })
        ]),
        el("p", { class: "hint" }, "1열부터 group(경제형/공압기기/도어 부품/외장 부품/배관 부품/위치결정/고정부품/FA용 기타/나사/볼트/와셔/너트/기타), category, code, price(선택), badges(선택, ;로 구분), since, bid 순서입니다. code만 있으면 상품명·이미지·가격·브랜드명은 시리즈 API가 자동으로 채웁니다."),
        draft.catalogProgress ? el("div", { class: "catalog-progress" }, [
          el("div", { class: "catalog-progress-bar" }, [
            el("div", { class: "catalog-progress-fill", style: `width:${Math.round(draft.catalogProgress.done / draft.catalogProgress.total * 100)}%;` })
          ]),
          el("p", { class: "hint" }, `${draft.catalogProgress.done} / ${draft.catalogProgress.total}건 조회 중${draft.catalogProgress.failed ? ` · 실패 ${draft.catalogProgress.failed}건` : ""}`)
        ]) : null,
        el("div", { class: "catalog-group-list" }, groupRows),
        el("button", {
          class: "btn primary", style: "width:100%;margin-top:10px;",
          disabled: allReady ? null : "disabled",
          onclick: deployCatalog
        }, allReady ? "전체 배포" : `전체 배포 (${readyCount}/${totalGroupsWithData || "?"}건 조회 완료)`),
        el("div", { id: "genlp-catalog-deploy-result" })
      ])
    ]);
  }

  /** 배포 파일은 style.css/script.js를 외부 참조(공유용)로 두지만, 미리보기(iframe srcdoc)는
   *  실제 파일이 옆에 없어서 그 참조가 그냥 깨집니다 — 미리보기에서만 실제 CSS/JS 내용을
   *  그 자리에 바꿔 넣어서 배포본과 똑같이 보이게 합니다. 배포되는 파일 자체는 안 건드립니다. */
  function buildCatalogPreviewHtml(html) {
    return html
      .replace('<link rel="stylesheet" href="./style.css">', `<style>${CATALOG_STYLE}</style>`)
      .replace('<script src="./script.js"></script>', `<script>${CATALOG_SCRIPT}</script>`);
  }

  function renderCatalogPreviewFor(groupId) {
    const info = (draft.catalogGroups || {})[groupId];
    if (!info || info.status !== "done") return;
    previewFrame.innerHTML = "";
    previewFrame.appendChild(el("iframe", { srcdoc: buildCatalogPreviewHtml(info.html) }));
  }

  /** "2026-07;신규" 처럼 세미콜론으로 구분된 배지 문자열을 배열로 */
  function parseBadges(raw) {
    return String(raw || "").split(";").map(s => s.trim()).filter(Boolean);
  }

  /** 엑셀의 "그룹" 칸엔 화면(탭)에서 보이는 한글 라벨("경제형")을 그대로 쓰는 게
   *  자연스러워서, 영문 id("economy")뿐 아니라 한글 라벨도 같이 인식합니다. */
  function resolveCatalogGroupId(raw) {
    const v = String(raw || "").trim();
    const byId = CATALOG_GROUPS.find(g => g.id === v);
    if (byId) return byId.id;
    const byLabel = CATALOG_GROUPS.find(g => g.label === v);
    if (byLabel) return byLabel.id;
    return null;
  }

  async function handleCatalogUpload(file) {
    if (typeof window === "undefined" || !window.XLSX) {
      toast("엑셀 업로드 기능을 불러오지 못했습니다");
      log("오류: XLSX 라이브러리가 로드되지 않았습니다 (index.html의 <script> 태그 확인 필요)");
      return;
    }
    try {
      const buf = await file.arrayBuffer();
      const wb = window.XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // 첫 행이 헤더 텍스트일 수 있으니, code 칸(3번째 열)에 숫자가 없는 행은 건너뜁니다
      // (EDM 엑셀 업로드와 동일한 필터링 방식).
      const parsed = rows
        .map(r => {
          const rawGroup = String(r[0] ?? "").trim();
          return {
            rawGroup,
            group: resolveCatalogGroupId(rawGroup) || rawGroup, // 한글 라벨이면 id로 정규화, 못 찾으면 원본 그대로 둬서 경고에 노출
            category: String(r[1] ?? "").trim(),
            code: String(r[2] ?? "").trim(),
            price: String(r[3] ?? "").trim(),
            badges: parseBadges(r[4]),
            since: String(r[5] ?? "").trim(),
            bid: String(r[6] ?? "").trim()
          };
        })
        .filter(r => r.code && /\d/.test(r.code));

      const validRows = parsed.filter(r => CATALOG_GROUPS.some(cg => cg.id === r.group));
      const unknownGroups = [...new Set(parsed.map(r => r.rawGroup))].filter(g => !CATALOG_GROUPS.some(cg => cg.id === g || cg.label === g));
      if (unknownGroups.length) {
        log(`⚠ 알 수 없는 그룹 값이 있어 건너뜁니다: ${unknownGroups.join(", ")} (그룹 열엔 "${CATALOG_GROUPS.map(g => g.label).join('", "')}" 중 하나를 입력해주세요)`);
      }

      // 필터링 후 남는 행이 없으면 조용히 끝내지 않고 바로 눈에 띄게 알립니다 —
      // 안 그러면 "업로드했는데 미리보기에 아무것도 안 뜬다"는 상황이 이유도 모른 채 발생합니다.
      if (!validRows.length) {
        toast("처리할 상품이 없습니다 — 그룹 값을 확인해주세요");
        log(`⚠ 유효한 행이 0개라 카탈로그를 만들지 못했습니다. 그룹 열엔 "${CATALOG_GROUPS.map(g => g.label).join('", "')}" 중 하나를 정확히 입력해주세요.`);
        return;
      }

      await runCatalogImport(validRows);
    } catch (e) {
      toast("엑셀 파일을 읽는 중 오류가 발생했습니다");
      log("오류: " + e.message);
    }
  }

  /** 그룹 순서대로 하나씩 처리합니다(그룹 전체를 한꺼번에 돌리지 않음) — 그룹별
   *  진행 상태(대기/처리중/완료)를 화면에 정확히 보여주기 위함이고, 배치 크기(10)는
   *  seriesApi.js의 fetchSeriesInfoBatch 기본값을 그대로 씁니다. */
  async function runCatalogImport(rows) {
    draft.catalogImporting = true;
    draft.catalogGroups = {};
    const byGroup = {};
    rows.forEach(r => { (byGroup[r.group] = byGroup[r.group] || []).push(r); });

    const totalCodes = rows.length;
    let doneCodes = 0;
    let failedCodes = 0;
    draft.catalogProgress = { done: 0, total: totalCodes, failed: 0 };
    renderForm();

    for (const group of CATALOG_GROUPS) {
      const groupRows = byGroup[group.id];
      if (!groupRows || !groupRows.length) continue;

      draft.catalogGroups[group.id] = { status: "processing", count: groupRows.length };
      renderForm();
      log(`${group.label} — ${groupRows.length}건 조회 시작`);

      const codes = groupRows.map(r => r.code);
      const results = await fetchSeriesInfoBatch(codes, 10, (done) => {
        draft.catalogProgress = { done: doneCodes + done, total: totalCodes, failed: failedCodes };
        renderForm();
      });
      doneCodes += codes.length;
      failedCodes += results.filter(r => r.error).length;
      draft.catalogProgress = { done: doneCodes, total: totalCodes, failed: failedCodes };

      // 카테고리별로 묶되, 그룹 안에서 처음 등장한 순서대로 cat-1, cat-2... 번호를 매깁니다
      // (디자인팀 산출물의 앵커 id 규칙과 동일).
      const categoryOrder = [];
      const byCategory = {};
      groupRows.forEach((row, i) => {
        if (!byCategory[row.category]) {
          const id = `cat-${categoryOrder.length + 1}`;
          byCategory[row.category] = { id, label: row.category, items: [] };
          categoryOrder.push(row.category);
        }
        const apiResult = results[i] || {};
        byCategory[row.category].items.push({
          code: row.code,
          name: apiResult.name,
          image: apiResult.image,
          price: apiResult.price || row.price,
          brandName: apiResult.brandName,
          since: row.since,
          badges: row.badges,
          bid: row.bid
        });
      });

      const categories = categoryOrder.map(label => byCategory[label]);
      const html = assembleLpCatalogGroupHtml(group.id, categories, currentSeoMeta());
      draft.catalogGroups[group.id] = { status: "done", count: groupRows.length, html };
      log(`${group.label} — 생성 완료 (${groupRows.length}건, 실패 ${results.filter(r => r.error).length}건)`);
      renderForm();
      renderPreview();
    }

    draft.catalogImporting = false;
    draft.catalogProgress = null;
    renderForm();
    log(`전체 조회 완료 — 총 ${doneCodes}건, 실패 ${failedCodes}건`);
    toast("카탈로그 생성이 완료됐습니다");
  }

  /** style.css/script.js + 완료된 그룹 html들을 한 캠페인 폴더에 전부 배포합니다. */
  async function deployCatalog() {
    const files = [
      { name: "style.css", content: CATALOG_STYLE, contentType: "text/css" },
      { name: "script.js", content: CATALOG_SCRIPT, contentType: "application/javascript" },
      ...CATALOG_GROUPS
        .filter(g => draft.catalogGroups?.[g.id]?.status === "done")
        .map(g => ({ name: g.file, content: draft.catalogGroups[g.id].html, contentType: "text/html" }))
    ];
    log("배포 중...");
    try {
      const results = await deployLpFilesToS3(files, draft.id, (done, total, name) => {
        log(`배포 중... (${done}/${total}) ${name}`);
      });
      const failed = results.filter(r => r.error);
      const succeeded = results.filter(r => r.url);
      draft.catalogDeployedUrls = succeeded;
      log(`배포 완료 — 성공 ${succeeded.length}건${failed.length ? ` · 실패 ${failed.length}건` : ""}`);
      toast(failed.length ? "일부 파일 배포에 실패했습니다" : "배포가 완료됐습니다");
      renderCatalogDeployResult(succeeded, failed);
    } catch (e) {
      log("배포 실패: " + e.message);
      toast("배포에 실패했습니다");
    }
  }

  function renderCatalogDeployResult(succeeded, failed) {
    const host = root.querySelector("#genlp-catalog-deploy-result");
    if (!host) return;
    host.innerHTML = "";
    const indexFile = succeeded.find(r => r.name === "economy.html") || succeeded.find(r => r.name.endsWith(".html"));
    if (indexFile) {
      host.appendChild(el("div", { class: "guide-result guide-pass", style: "display:flex;align-items:center;gap:8px;" }, [
        el("span", { style: "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" }, indexFile.url),
        el("button", { class: "btn btn-sm", onclick: () => { navigator.clipboard?.writeText(indexFile.url); toast("링크를 복사했습니다"); } }, "복사")
      ]));
    }
    if (failed.length) {
      host.appendChild(el("p", { class: "hint" }, `배포 실패한 파일: ${failed.map(f => f.name).join(", ")}`));
    }
  }

  // ---------- 폼 섹션 ----------

  function resolveTemplate() {
    if (draft.templateId === CATALOG_TEMPLATE_ID) return null;
    return LP_TEMPLATES.find(t => t.id === draft.templateId) || LP_TEMPLATES[0] || null;
  }

  function sectionTemplate() {
    const current = resolveTemplate();
    const isCatalog = draft.templateId === CATALOG_TEMPLATE_ID;
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [
          el("span", { class: "sec-badge" }, "①"),
          el("span", { class: "sec-title" }, "템플릿")
        ])
      ]),
      el("div", { class: "sec-body" }, [
        el("select", {
          onchange: e => { draft.templateId = e.target.value; renderForm(); renderPreview(); }
        }, [
          ...LP_TEMPLATES.map(t =>
            el("option", { value: t.id, ...(t.id === draft.templateId ? { selected: "selected" } : {}) }, t.name)
          ),
          el("option", { value: CATALOG_TEMPLATE_ID, ...(isCatalog ? { selected: "selected" } : {}) }, "신상품카탈로그")
        ]),
        current ? el("p", { class: "hint" }, "블록: " + current.blocks.join(" → ")) : null
      ])
    ]);
  }

  function sectionSeriesCodesLP() {
    const slots = draft.seriesCodes;
    const grid = el("div", { class: "series-grid" }, slots.map((code, i) =>
      el("div", { class: "series-slot" }, [
        el("input", {
          type: "text", placeholder: `시리즈코드 ${i + 1}`, value: code,
          oninput: e => { slots[i] = e.target.value; }
        }),
        code ? el("button", { class: "rm", onclick: () => { slots[i] = ""; renderForm(); } }, "✕") : null
      ])
    ));
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [
          el("span", { class: "sec-badge" }, "③"),
          el("span", { class: "sec-title" }, "추천상품 시리즈 코드 (선택, 최대 6개)")
        ])
      ]),
      el("div", { class: "sec-body" }, [
        grid,
        el("button", { class: "btn series-lookup-btn", onclick: lookupSeriesCodesLP }, "전체 조회 (상품 데이터 자동 불러오기)"),
        el("p", { class: "hint" }, "미리보기에 바로 반영됩니다. 조회 결과에 없는 항목은 \"연동 예정\" 플레이스홀더로 표시됩니다.")
      ])
    ]);
  }

  async function lookupSeriesCodesLP() {
    const codes = draft.seriesCodes.filter(c => c && c.trim());
    if (!codes.length) { toast("시리즈 코드를 1개 이상 입력하세요"); return; }
    log(`시리즈 코드 ${codes.length}건 조회 중...`);
    const results = await Promise.all(codes.map(async code => {
      try {
        const product = await fetchSeriesInfo(code);
        if (!product.name) log(`⚠ 시리즈 코드 "${code}"의 상품을 찾지 못했습니다.`);
        return product;
      } catch (e) {
        log(`⚠ 시리즈 코드 "${code}" 조회 실패: ${e.message}`);
        return { code };
      }
    }));
    draft.products = results;
    const successCount = results.filter(p => p.name).length;
    log(`시리즈 조회 완료 — 성공 ${successCount}건${results.length - successCount ? ` · 실패 ${results.length - successCount}건` : ""}`);
    toast(`상품 데이터 ${successCount}건을 불러왔습니다`);
    renderForm();
    renderPreview();
  }

  function sectionPromotionLink() {
    return el("div", { class: "field", style: "margin-bottom:14px;" }, [
      el("label", {}, "프로모션명 (선택)"),
      el("input", {
        type: "text",
        value: draft.promotionName || "",
        placeholder: "예: 2026년 7월 경제형 프로모션",
        oninput: e => { draft.promotionName = e.target.value; }
      }),
      el("p", { class: "hint" }, "같은 프로모션의 EDM/LP를 나중에 묶어보고 싶으면, 양쪽에 똑같은 이름을 입력하세요.")
    ]);
  }

  function sectionPageType() {
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [
          el("span", { class: "sec-badge" }, "②"),
          el("span", { class: "sec-title" }, "페이지 유형")
        ])
      ]),
      el("div", { class: "sec-body" }, [
        el("div", { class: "seg-tabs" }, PAGE_TYPES.map(t =>
          el("div", {
            class: "seg-tab" + (draft.pageType === t.key ? " active" : ""),
            onclick: () => {
              draft.pageType = t.key;
              if (t.key !== "경제형" && draft.widthPattern === 920) draft.widthPattern = 1200;
              renderForm();
              renderPreview();
            }
          }, [
            el("div", { class: "sn" }, t.key),
            el("div", { style: "font-size:9.5px;color:#888;margin-top:2px;" }, t.desc)
          ])
        ))
      ])
    ]);
  }

  function sectionWidthPattern() {
    const options = Object.keys(LP_WIDTH_PATTERNS).map(Number).sort((a, b) => a - b);
    return el("div", { class: "field", style: "margin-bottom:14px;" }, [
      el("label", {}, "컨텐츠 폭"),
      el("div", { class: "row3" }, options.map(w => {
        const info = LP_WIDTH_PATTERNS[w];
        const disabled = info.pageType && info.pageType !== draft.pageType;
        return el("div", {
          class: "opt-btn" + (draft.widthPattern === w ? " active" : ""),
          style: disabled ? "opacity:.4;cursor:not-allowed;" : "",
          onclick: () => {
            if (disabled) { toast(`${w}px는 ${info.scope}입니다`); return; }
            draft.widthPattern = w;
            renderForm();
            renderPreview();
          }
        }, `${w}px`);
      })),
      draft.widthPattern === 920
        ? el("p", { class: "hint", style: "color:#a9660a;" }, `⚠ ${LP_WIDTH_PATTERNS[920].scope}`)
        : null
    ]);
  }

  function sectionBreadcrumb() {
    return el("div", { class: "field" }, [
      el("label", {}, "브레드크럼 / 상위 카테고리"),
      el("input", {
        type: "text",
        value: draft.breadcrumb || "",
        placeholder: "예: FA 부품 > 리니어가이드",
        oninput: e => { draft.breadcrumb = e.target.value; renderPreview(); }
      })
    ]);
  }

  function sectionCatchcopy() {
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [
          el("span", { class: "sec-badge" }, "④"),
          el("span", { class: "sec-title" }, "캐치카피")
        ])
      ]),
      el("div", { class: "sec-body" }, [
        el("div", { class: "field" }, [
          el("textarea", {
            oninput: e => { draft.catchcopy = e.target.value; renderPreview(); }
          }, draft.catchcopy || "")
        ])
      ])
    ]);
  }

  function sectionAiCopy() {
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [
          el("span", { class: "sec-badge ai" }, "⑤"),
          el("span", { class: "sec-title" }, "AI 카피 자동생성")
        ])
      ]),
      el("div", { class: "sec-body" }, [
        el("button", {
          class: "ai-btn",
          disabled: draft.generating || null,
          onclick: async () => {
            draft.generating = true;
            renderForm();
            log("AI 카피 생성 요청 중...");
            const result = await generateCopyLP({ pageType: draft.pageType });
            draft.catchcopy = result.catchcopy;
            draft.cta = result.cta;
            draft.generating = false;
            log("AI 카피 생성 완료");
            renderForm();
            renderPreview();
          }
        }, draft.generating ? "생성 중..." : "✨ AI 카피 생성")
      ])
    ]);
  }

  function sectionHeroImage() {
    return el("div", { class: "field" }, [
      el("label", {}, "히어로 이미지"),
      el("div", { class: "hero-opts" }, [
        optBtn("hero", "기본", "HTML+CSS 자동 생성"),
        optBtn("hero", "선택1", "S3 배경 이미지 추천 + Pillow 합성"),
        optBtn("hero", "선택2", "이미지 URL 직접 입력")
      ]),
      draft.heroImageOption === "선택2"
        ? el("input", {
            type: "text",
            style: "margin-top:8px;",
            value: draft.heroImageUrl || "",
            placeholder: "https://...",
            oninput: e => { draft.heroImageUrl = e.target.value; renderPreview(); }
          })
        : null,
      el("p", { class: "hint" },
        draft.heroImageOption === "선택1" ? "⚠ 연동 예정 — 아직 실제 파이프라인 없음 (EDM과 동일한 상태)" :
        draft.heroImageOption === "선택2" ? "이미지 URL을 입력하면 바로 미리보기에 반영됩니다 · 에셋 관리에서 사이즈 칩을 클릭해 URL을 복사해 붙여넣으세요" :
        "이미지 없이 배경색+텍스트만으로 구성됩니다"
      )
    ]);
  }

  function sectionBodyImage() {
    return el("div", { class: "field" }, [
      el("label", {}, "본문 이미지"),
      el("div", { class: "body-img-opts" }, [
        optBtn("bodyImage", "기본", "Claude Vision 자동 편집"),
        optBtn("bodyImage", "선택2", "직접 업로드")
      ]),
      el("p", { class: "hint" }, "⚠ 연동 예정 — 아직 실제 파이프라인 없음 (EDM과 동일한 상태)")
    ]);
  }

  function optBtn(group, value, label) {
    const current = group === "hero" ? draft.heroImageOption : draft.bodyImageOption;
    return el("div", {
      class: "opt-btn" + (current === value ? " active" : ""),
      onclick: () => {
        if (group === "hero") draft.heroImageOption = value; else draft.bodyImageOption = value;
        renderForm();
        renderPreview();
      }
    }, label);
  }

  function sectionBodyText() {
    return el("div", { class: "field" }, [
      el("label", {}, "본문"),
      el("textarea", {
        oninput: e => { draft.bodyText = e.target.value; renderPreview(); }
      }, draft.bodyText || "")
    ]);
  }

  function sectionSeoMeta() {
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [
          el("span", { class: "sec-badge ai" }, "⑥"),
          el("span", { class: "sec-title" }, "SEO 메타")
        ])
      ]),
      el("div", { class: "sec-body" }, [
        el("button", {
          class: "ai-btn",
          style: "margin-bottom:10px;",
          onclick: async () => {
            log("SEO 메타 생성 요청 중...");
            const result = await generateSeoMeta({ contentName: draft.catchcopy || "컨텐츠", parentCategory: draft.breadcrumb });
            draft.seoTitle = result.title;
            draft.seoDescription = result.description;
            draft.seoKeywords = result.keywords;
            log("SEO 메타 생성 완료");
            renderForm();
            renderPreview();
          }
        }, "✨ AI 자동생성"),
        el("div", { class: "field" }, [
          el("label", {}, `타이틀 (${(draft.seoTitle || "").length}/35자)`),
          el("input", {
            type: "text", value: draft.seoTitle || "",
            oninput: e => { draft.seoTitle = e.target.value; renderPreview(); }
          })
        ]),
        el("div", { class: "field" }, [
          el("label", {}, `디스크립션 (${(draft.seoDescription || "").length}/100자)`),
          el("textarea", {
            oninput: e => { draft.seoDescription = e.target.value; renderPreview(); }
          }, draft.seoDescription || "")
        ]),
        el("div", { class: "field" }, [
          el("label", {}, "키워드"),
          el("input", {
            type: "text", value: (draft.seoKeywords || []).join(", "),
            placeholder: "쉼표로 구분",
            oninput: e => { draft.seoKeywords = e.target.value.split(",").map(s => s.trim()).filter(Boolean); renderPreview(); }
          })
        ])
      ])
    ]);
  }

  // ---------- 미리보기 / 가이드라인 / 로그 ----------

  function currentSeoMeta() {
    return { title: draft.seoTitle, description: draft.seoDescription, keywords: draft.seoKeywords || [] };
  }

  function renderPreview() {
    if (draft.templateId === CATALOG_TEMPLATE_ID) {
      renderCatalogPreview();
      return;
    }
    const html = assembleLpHtml(draft, resolveTemplate(), currentSeoMeta());
    previewFrame.innerHTML = "";
    previewFrame.appendChild(el("iframe", { srcdoc: html }));

    latestGuidelineIssues = checkGuidelinesLP(html, {
      ...currentSeoMeta(),
      widthPattern: draft.widthPattern,
      pageType: draft.pageType
    });
    updateGuidelineBadge(latestGuidelineIssues);
  }

  /** 카탈로그 모드 미리보기 — 완료된 그룹 중 첫 번째를 보여줍니다.
   *  가이드라인은 그룹마다 결과가 달라질 수 있어 배지는 비워두고, 그룹별 카드에서
   *  각각 확인하도록 안내합니다(화면이 여러 장이라 배지 하나로 요약하기 어려움). */
  function renderCatalogPreview() {
    const groups = draft.catalogGroups || {};
    const firstReady = CATALOG_GROUPS.find(g => groups[g.id]?.status === "done");
    previewFrame.innerHTML = "";
    if (firstReady) {
      previewFrame.appendChild(el("iframe", { srcdoc: buildCatalogPreviewHtml(groups[firstReady.id].html) }));
    } else {
      previewFrame.appendChild(el("p", { class: "hint", style: "padding:40px;text-align:center;" }, "엑셀을 업로드하면 그룹별로 미리보기가 여기 표시됩니다."));
    }
    const badge = root.querySelector("#genlp-guideline-badge");
    if (badge) { badge.className = "guideline-badge"; badge.textContent = "그룹별 미리보기에서 확인하세요"; }
  }

  function updateGuidelineBadge(issues) {
    const badge = root.querySelector("#genlp-guideline-badge");
    if (!badge) return;
    const summary = summarizeGuidelineIssuesLP(issues);
    badge.className = "guideline-badge " + (issues.length === 0 ? "badge-pass" : summary.errors ? "badge-fail" : "badge-warn");
    badge.textContent = issues.length === 0
      ? "✅ LP 가이드라인 통과"
      : `${summary.errors ? "❌" : "⚠️"} 위반 ${summary.errors}건 · 경고 ${summary.warnings}건 (클릭해서 보기)`;
  }

  function toggleGuidelineDetails() {
    const host = root.querySelector("#genlp-guideline-results");
    const isHidden = host.style.display === "none";
    if (isHidden) {
      renderGuidelineResults(latestGuidelineIssues);
      host.style.display = "block";
    } else {
      host.style.display = "none";
    }
  }

  function renderGuidelineResults(issues) {
    const host = root.querySelector("#genlp-guideline-results");
    host.innerHTML = "";
    if (!issues.length) {
      host.appendChild(el("div", { class: "guide-result guide-pass" }, "✅ 모두 통과했습니다"));
      return;
    }
    host.appendChild(el("ul", { class: "guide-list" }, issues.map(i =>
      el("li", { class: "guide-item " + i.level }, [
        el("span", { class: "guide-badge " + i.level }, i.level === "error" ? "위반" : i.level === "warning" ? "경고" : "정보"),
        el("span", {}, i.message)
      ])
    )));
  }

  function setViewport(mode) {
    root.querySelector("#genlp-preview-wrap").className = "preview-wrap" + (mode === "mobile" ? " mobile" : "");
    root.querySelector("#genlp-view-desktop").classList.toggle("active", mode === "desktop");
    root.querySelector("#genlp-view-mobile").classList.toggle("active", mode === "mobile");
  }

  function log(msg) {
    const t = new Date().toLocaleTimeString();
    logHistory.push(`[${t}] ${msg}`);
    const summaryEl = root.querySelector("#genlp-log-summary-text");
    if (summaryEl) summaryEl.textContent = msg;
    const detailsEl = root.querySelector("#genlp-log-details");
    if (detailsEl && detailsEl.style.display !== "none") renderLogDetails();
  }

  function renderLogDetails() {
    const detailsEl = root.querySelector("#genlp-log-details");
    detailsEl.textContent = logHistory.join("\n");
    detailsEl.scrollTop = detailsEl.scrollHeight;
  }

  function toggleLogDetails() {
    const detailsEl = root.querySelector("#genlp-log-details");
    const chevron = root.querySelector("#genlp-log-chevron");
    const isHidden = detailsEl.style.display === "none";
    if (isHidden) { renderLogDetails(); detailsEl.style.display = "block"; chevron.textContent = "▾"; }
    else { detailsEl.style.display = "none"; chevron.textContent = "▸"; }
  }

  function toggleExportMenu() {
    const menu = root.querySelector("#genlp-export-menu");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  }
  function closeExportMenu() {
    const menu = root.querySelector("#genlp-export-menu");
    if (menu) menu.style.display = "none";
  }

  async function confirmExportGuards(html) {
    const summary = summarizeGuidelineIssuesLP(latestGuidelineIssues);
    if (summary.errors > 0) {
      if (!confirm(`가이드라인 위반 ${summary.errors}건이 있습니다. 그래도 진행하시겠습니까?`)) {
        log("내보내기 취소 (가이드라인 위반)");
        return false;
      }
    }
    log("내보내기 전 링크/이미지 확인 중...");
    const results = await checkAllLinks(html);
    renderLinkResults(results, summarizeLinkResults(results));
    const broken = results.filter(r => r.ok === false);
    if (broken.length) {
      if (!confirm(`깨진 링크/이미지가 ${broken.length}건 있습니다. 그래도 진행하시겠습니까?`)) {
        log("내보내기 취소 (깨진 링크 발견)");
        return false;
      }
    }
    return true;
  }

  async function runLinkCheck() {
    const html = assembleLpHtml(draft, resolveTemplate(), currentSeoMeta());
    log("링크/이미지 확인 중...");
    const results = await checkAllLinks(html);
    log(`링크/이미지 확인 완료 — 정상 ${results.filter(r => r.ok).length}건`);
    renderLinkResults(results, summarizeLinkResults(results));
  }

  function renderLinkResults(results, summary) {
    const host = root.querySelector("#genlp-link-check-results");
    host.innerHTML = "";
    if (!results.length) {
      host.appendChild(el("div", { class: "guide-result guide-pass" }, "확인할 외부 이미지/링크가 없습니다"));
      return;
    }
    host.appendChild(el("div", { class: "guide-result " + (summary.broken ? "guide-fail" : "guide-pass") },
      `정상 ${summary.ok}건 · 깨짐 ${summary.broken}건 · 확인불가(CORS) ${summary.unknown}건`));
  }

  async function deployLp() {
    if (draft.templateId === CATALOG_TEMPLATE_ID) {
      toast("신상품카탈로그는 위 '전체 배포' 버튼을 사용하세요");
      return;
    }
    const html = assembleLpHtml(draft, resolveTemplate(), currentSeoMeta());
    if (!(await confirmExportGuards(html))) return;
    log("배포 중...");
    try {
      const url = await deployLpToS3(html, draft.id);
      draft.deployedUrl = url;
      log(`배포 완료: ${url}`);
      toast("배포가 완료됐습니다");
      renderDeployResult(url);
    } catch (e) {
      log("배포 실패: " + e.message);
      toast("배포에 실패했습니다");
    }
  }

  function renderDeployResult(url) {
    const host = root.querySelector("#genlp-deploy-result");
    host.innerHTML = "";
    host.appendChild(el("div", { class: "guide-result guide-pass", style: "display:flex;align-items:center;gap:8px;" }, [
      el("span", { style: "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" }, url),
      el("button", { class: "btn btn-sm", onclick: () => { navigator.clipboard?.writeText(url); toast("링크를 복사했습니다"); } }, "복사")
    ]));
  }

  async function copyHtml() {
    const html = assembleLpHtml(draft, resolveTemplate(), currentSeoMeta());
    if (!(await confirmExportGuards(html))) return;
    navigator.clipboard?.writeText(html).then(
      () => { toast("HTML을 클립보드에 복사했습니다"); log("HTML 복사 완료"); },
      () => toast("복사에 실패했습니다 (브라우저 권한 확인)")
    );
  }

  async function downloadHtml() {
    const html = assembleLpHtml(draft, resolveTemplate(), currentSeoMeta());
    if (!(await confirmExportGuards(html))) return;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (draft.catchcopy || "lp") + ".html";
    a.click();
    log("HTML 다운로드 완료");
  }

  function saveDraft() {
    const campaign = draftToCampaignLP();
    store.upsertCampaign(campaign);
    toast("임시저장했습니다");
    log("임시저장 완료");
  }

  function draftToCampaignLP() {
    return {
      id: draft.id,
      name: (draft.catchcopy || "LP 캠페인").slice(0, 24),
      channel: "LP",
      category: draft.pageType,
      type: "랜딩페이지",
      segment: "-",
      createdAt: existing ? existing.createdAt : new Date().toISOString().slice(0, 10).replace(/-/g, "."),
      promotionName: draft.promotionName || "",
      draftData: { ...draft }
    };
  }
}

function buildInitialDraftLP(existing) {
  const base = {
    id: existing?.id || "lp-" + crypto.randomUUID(),
    promotionName: "",
    templateId: LP_TEMPLATES[0]?.id || "lp1",
    pageType: "일반형",
    widthPattern: 1200,
    breadcrumb: "",
    seriesCodes: Array.from({ length: 6 }, () => ""),
    products: [],
    deployedUrl: "",
    catalogGroups: {},
    catalogImporting: false,
    catalogProgress: null,
    catalogDeployedUrls: [],
    catchcopy: "",
    cta: "",
    heroImageOption: "기본",
    heroImageUrl: "",
    bodyImageOption: "기본",
    bodyText: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
    generating: false
  };
  if (existing?.draftData) {
    return { ...base, ...existing.draftData, id: base.id };
  }
  return base;
}
