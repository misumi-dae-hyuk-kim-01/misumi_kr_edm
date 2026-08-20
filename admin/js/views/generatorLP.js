import { store } from "../state.js";
import { el, toast, esc } from "../lib/dom.js";
import { generateCopyLP } from "../lib/copyGeneratorLP.js";
import { generateSeoMeta } from "../lib/seoMetaGenerator.js";
import { assembleLpHtml, assembleLpCatalogGroupHtml, resolveCatalogGroups, resolveCatalogSeoMeta, CATALOG_STYLE, CATALOG_SCRIPT } from "../lib/blocksLP.js";
import { seedLpTemplates } from "../data/lpTemplates.js";
import { checkGuidelinesLP, summarizeGuidelineIssuesLP, LP_WIDTH_PATTERNS, LP_ECONOMY_LAYOUT, DEPLOYMENT_COUNTRY } from "../lib/guidelineCheckLP.js";
import { checkAllLinks, summarizeLinkResults } from "../lib/linkChecker.js";
import { fetchSeriesInfo, fetchSeriesInfoBatch } from "../lib/seriesApi.js";
import { deployLpToS3, deployLpFilesToS3 } from "../lib/lpDeploy.js";
import { resizeImage } from "../lib/imageResize.js";
import { uploadToS3 } from "../lib/s3Upload.js";

const LP_TEMPLATES = seedLpTemplates();
// ⚠️ 신상품카탈로그는 다른 LP 템플릿과 완전히 다른 화면(캐치카피 등 타이핑 폼이 아니라
// 엑셀 업로드 중심)이라, LP_TEMPLATES 안에 넣지 않고 별도 상수로 관리합니다.
// 템플릿 드롭다운에는 이 값도 같이 보여주고, templateId로 어느 쪽인지 구분합니다.
const CATALOG_TEMPLATE_ID = "catalog-신상품";

const PAGE_TYPES = [
  { key: "일반형", desc: "기본 페이지 구조" },
  // ⚠️ 경제형은 컨텐츠 "총 폭"이 다른 게 아니라(950/1200은 페이지 유형과 무관한 총 폭
  // 선택지), 총 폭은 항상 1200px로 고정하고 그 안을 240px 사이드 + 920px 컨텐츠로
  // 나누는 전용 레이아웃입니다. LP_ECONOMY_LAYOUT 참고.
  { key: "경제형", desc: `${DEPLOYMENT_COUNTRY} 한정 · 1200px(240+920 분할)` }
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
        // ⚠️ 이 안의 내용은 고정이 아니라 renderFooterActions()가 템플릿에 따라 매번
        // 다시 그립니다 — 일반 LP는 "내보내기 ▾"(다운로드/배포) + 링크확인, 카탈로그는
        // 링크확인 + 전체배포로 내용이 다르지만, "배포 관련 버튼은 항상 이 위치(하단
        // footer)"라는 자리 자체는 템플릿과 무관하게 고정해서 일관성을 유지합니다.
        el("div", { id: "genlp-standard-export-area" }),
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

  /** EDM 생성기의 groupHeader()와 동일합니다 — "캠페인 설정" / "콘텐츠"처럼 폼을
   *  큰 영역으로 나눠서 보여줄 때 씁니다. */
  function groupHeader(label) {
    return el("div", { class: "form-group-header" }, label);
  }

  /** 배포 관련 버튼(내보내기/링크확인)이 있는 자리는 항상 footer 하나로 고정하고,
   *  내용도 일반 LP와 완전히 동일한 구조(내보내기▾ 드롭다운 + 링크확인)로 그립니다 —
   *  카탈로그는 다운로드/배포/링크확인이 각각 여러 파일을 대상으로 동작한다는
   *  차이만 있고, 화면 구조 자체는 다를 이유가 없습니다. */
  function renderFooterActions(isCatalog) {
    const host = root.querySelector("#genlp-standard-export-area");
    if (!host) return;
    host.innerHTML = "";

    const downloadFn = isCatalog ? downloadCatalogZip : downloadHtml;
    const deployFn = isCatalog ? deployCatalog : deployLp;
    const linkCheckFn = isCatalog ? runCatalogLinkCheck : runLinkCheck;
    const linkCheckResultsId = isCatalog ? "genlp-catalog-link-check-results" : "genlp-link-check-results";
    const deployResultId = isCatalog ? "genlp-catalog-deploy-result" : "genlp-deploy-result";

    // 카탈로그는 조회가 다 끝나야 다운로드/배포가 의미가 있어서, 완료 전엔 메뉴
    // 항목을 비활성화하고 눌러도 안내만 하도록 합니다(일반 LP는 이런 제약이 없음).
    const { readyCount, totalGroupsWithData, allReady } = isCatalog ? catalogReadiness() : {};
    const downloadDisabled = isCatalog && readyCount === 0;
    const deployDisabled = isCatalog && !allReady;
    const linkCheckDisabled = isCatalog && readyCount === 0;

    host.appendChild(el("div", { class: "footer-btn-row" }, [
      el("div", { class: "export-dropdown" }, [
        el("button", { class: "btn primary export-btn", onclick: toggleExportMenu }, "내보내기 ▾"),
        el("div", { class: "export-menu", id: "genlp-export-menu", style: "display:none;" }, [
          el("button", {
            class: "export-menu-item", disabled: downloadDisabled ? "disabled" : null,
            onclick: () => { closeExportMenu(); downloadFn(); }
          }, isCatalog ? "파일 다운로드 (zip)" : "파일 다운로드"),
          el("button", {
            class: "export-menu-item", disabled: deployDisabled ? "disabled" : null,
            onclick: () => { closeExportMenu(); deployFn(); }
          }, isCatalog && !allReady ? `배포하기 (S3) — ${readyCount}/${totalGroupsWithData || "?"}건 조회 완료` : "배포하기 (S3)")
        ])
      ]),
      el("button", { class: "btn", disabled: linkCheckDisabled ? "disabled" : null, onclick: linkCheckFn }, "🔗 링크 확인")
    ]));
    host.appendChild(el("div", { id: linkCheckResultsId }));
    host.appendChild(el("div", { id: deployResultId }));
  }

  function renderForm() {
    formBody.innerHTML = "";
    // 캠페인 설정: EDM 생성기와 동일하게 "이 캠페인이 뭔지" 정의하는 값들을 템플릿
    // 선택보다 먼저 두고, "콘텐츠" 영역과 구분되도록 groupHeader로 나눕니다.
    formBody.appendChild(groupHeader("캠페인 설정"));
    formBody.appendChild(sectionCampaignSettings());
    formBody.appendChild(sectionTemplate());

    const isCatalog = draft.templateId === CATALOG_TEMPLATE_ID;
    renderFooterActions(isCatalog);

    formBody.appendChild(groupHeader("콘텐츠"));
    if (isCatalog) {
      // ⚠️ 신상품카탈로그는 캐치카피 등을 타이핑하는 화면이 아니라 엑셀 업로드
      // 중심이라, 일반 LP 섹션들을 전부 건너뜁니다.
      // 배너 → 상품 데이터 업로드 → SEO 메타 순서로 배치합니다(콘텐츠 순서와 일치 —
      // 실제 완성된 페이지에서도 배너가 상품 목록보다 위에 나오므로).
      formBody.appendChild(sectionCatalogBanners());
      formBody.appendChild(sectionCatalogUpload());
      formBody.appendChild(sectionSeoMeta());
      return;
    }
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
    const groupRows = (draft.catalogGroupsMeta || []).map(g => {
      const info = (draft.catalogGroups || {})[g.label];
      const statusLabel = !info ? "대기 중" : info.status === "processing" ? "처리 중" : "완료";
      const statusClass = !info ? "" : info.status === "processing" ? "badge-warn" : "badge-pass";
      return el("div", { class: "catalog-group-row", style: "display:flex !important;align-items:center !important;gap:8px !important;" }, [
        el("span", { class: "catalog-group-label" }, g.label),
        el("span", { class: "catalog-group-count" }, info ? `${info.count}개` : ""),
        // ⚠️ !important를 붙인 이유: 인라인 스타일은 보통 외부 CSS보다 우선하지만,
        // 외부 CSS 쪽에 !important가 걸려있으면(EDM 쪽 반응형 스택 기법 때문에 이
        // 프로젝트 CSS에 !important가 흔합니다) 일반 인라인 스타일은 거기에 밀립니다.
        // 확실히 이기도록 여기도 !important로 강제합니다.
        el("span", {
          class: "guideline-badge " + statusClass,
          style: "margin-left:auto !important;display:inline-flex !important;align-items:center !important;height:26px !important;line-height:26px !important;padding:0 8px !important;border:0 !important;box-sizing:border-box !important;"
        }, statusLabel),
        el("button", {
          class: "btn btn-sm",
          style: "display:inline-flex !important;align-items:center !important;height:26px !important;line-height:26px !important;padding:0 10px !important;box-sizing:border-box !important;",
          disabled: info?.status === "done" ? null : "disabled",
          onclick: () => { renderCatalogPreviewFor(g.label); }
        }, "미리보기")
      ]);
    });

    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [
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
        el("p", { class: "hint" }, "열 순서: group · category · code · price(선택) · badges(선택) · since · bid. code만 있으면 나머지는 자동으로 채워집니다."),
        draft.catalogProgress ? el("div", { class: "catalog-progress" }, [
          el("div", { class: "catalog-progress-bar" }, [
            el("div", { class: "catalog-progress-fill", style: `width:${Math.round(draft.catalogProgress.done / draft.catalogProgress.total * 100)}%;` })
          ]),
          el("p", { class: "hint" }, `${draft.catalogProgress.done} / ${draft.catalogProgress.total}건 조회 중${draft.catalogProgress.failed ? ` · 실패 ${draft.catalogProgress.failed}건` : ""}`)
        ]) : null,
        el("div", { class: "catalog-group-list" }, groupRows)
      ])
    ]);
  }

  /** footer의 배포/링크확인 버튼 disabled 조건 계산에 재사용합니다(sectionCatalogUpload와
   *  footer 렌더링 양쪽에서 동일한 기준을 써야 하므로 하나로 뽑아뒀습니다). */
  function catalogReadiness() {
    const readyCount = Object.values(draft.catalogGroups || {}).filter(g => g.status === "done").length;
    const totalGroupsWithData = Object.keys(draft.catalogGroups || {}).length;
    const allReady = totalGroupsWithData > 0 && readyCount === totalGroupsWithData && !draft.catalogImporting;
    return { readyCount, totalGroupsWithData, allReady };
  }

  /** 상단 배너(최대 4개) 입력 — 모든 그룹 페이지가 같은 배너를 공유합니다.
   *  이미지 URL이 비어있는 칸은 무시되고, 하나도 안 채우면 조립 함수가 안내
   *  플레이스홀더를 대신 넣습니다. */
  function sectionCatalogBanners() {
    const banners = draft.catalogBanners;
    const rows = banners.map((b, i) => el("div", { class: "field", style: "margin-bottom:10px;border-bottom:1px solid #f0f0f0;padding-bottom:10px;" }, [
      el("label", {}, `배너 ${i + 1}`),
      el("input", {
        type: "text", value: b.img, placeholder: "이미지 URL (또는 아래에서 업로드)",
        oninput: e => { banners[i].img = e.target.value; },
        onblur: () => rebuildCatalogHtml()
      }),
      el("div", { class: "image-upload-row", style: "margin-top:6px;" }, [
        el("label", { class: "btn btn-sm upload-label" }, [
          draft.catalogBannerUploading === i ? "업로드 중..." : "이미지 업로드",
          el("input", {
            type: "file", accept: "image/*", style: "display:none;", disabled: draft.catalogBannerUploading === i ? "disabled" : null,
            onchange: e => { if (e.target.files[0]) handleCatalogBannerUpload(i, e.target.files[0]); }
          })
        ]),
        b.img ? el("img", { src: b.img, alt: "", style: "width:36px;height:36px;object-fit:cover;border-radius:4px;border:1px solid #e0e0e0;" }) : null
      ]),
      el("input", {
        type: "text", value: b.href, placeholder: "클릭 시 이동할 링크 (선택)", style: "margin-top:6px;",
        oninput: e => { banners[i].href = e.target.value; },
        onblur: () => rebuildCatalogHtml()
      }),
      el("input", {
        type: "text", value: b.label, placeholder: "배너 이름 (버튼에 표시)", style: "margin-top:6px;",
        oninput: e => { banners[i].label = e.target.value; },
        onblur: () => rebuildCatalogHtml()
      })
    ]));

    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [
          el("span", { class: "sec-title" }, "상단 배너 (선택, 최대 4개)")
        ])
      ]),
      el("div", { class: "sec-body" }, [
        ...rows,
        banners.length < 4 ? el("button", {
          class: "btn btn-sm ghost", style: "width:100%;",
          onclick: () => { banners.push({ img: "", href: "", label: "" }); renderForm(); }
        }, "+ 배너 추가") : null,
        // ⚠️ 예전 문구("다시 배포하면 반영됩니다")는 사실이 아니었습니다 — 배포는 이미
        // 만들어진 HTML을 그대로 올릴 뿐이라 재배포만으로는 반영되지 않았습니다.
        // 지금은 배너를 바꾸면(입력란에서 벗어나는 순간) 완료된 그룹 HTML을 즉시
        // 다시 조립하므로, 별도 조치 없이 미리보기/배포 모두에 바로 반영됩니다.
        el("p", { class: "hint" }, "배너를 바꾸면 완료된 그룹들에 즉시 반영됩니다 (미리보기도 새로 여시면 최신 상태로 보입니다).")
      ])
    ]);
  }

  /** EDM 생성기의 registerAsset()과 동일한 목적/구조입니다 — 재사용 라이브러리(에셋관리)에
   *  등록해야 다른 캠페인에서도 이 배너 이미지를 찾아 재사용할 수 있고, sourceCampaignId를
   *  남겨야 "이 이미지가 어느 캠페인에서 만들어졌는지" 추적이 됩니다. 지금까지는 LP 쪽에
   *  이 헬퍼가 없어서 배너를 업로드해도 에셋관리 목록에 전혀 나타나지 않았습니다. */
  function registerBannerAsset(filename, url, blob) {
    const id = "a" + Date.now() + Math.random().toString(16).slice(2);
    store.addAsset({
      id,
      filename,
      category: "배너 이미지",
      uploadedAt: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
      variants: { LP1200: { url, sizeKB: Math.round((blob?.size || 0) / 1024), isDemoUrl: !url.startsWith("http") } },
      source: "generator",
      sourceCampaignId: draft.id,
      aiProcessed: false
    });
    return id;
  }

  /** 배너 이미지는 그냥 정적 이미지라 AI 보정이 필요 없어서, EDM 이미지 필드처럼
   *  리사이징 + 순수 업로드만 합니다(카피/보정 요청 없음). 배너는 가로로 넓은 형태라
   *  1200px 기준으로 리사이징합니다(배너 슬라이드 폭이 520px 이상이라 여유 있게). */
  async function handleCatalogBannerUpload(index, file) {
    draft.catalogBannerUploading = index;
    renderForm();
    try {
      const resized = await resizeImage(file, 1200);
      const url = await uploadToS3(resized, file.name, "LP");
      draft.catalogBanners[index].img = url;
      registerBannerAsset(file.name, url, resized);
      log(`배너 ${index + 1} 이미지 업로드 완료: ${file.name}`);
      rebuildCatalogHtml(); // 업로드 직후 바로 완료된 그룹들에 반영
    } catch (e) {
      log("오류: " + e.message);
      toast("배너 업로드에 실패했습니다");
    } finally {
      draft.catalogBannerUploading = null;
      renderForm();
    }
  }

  /** 배포 파일은 style.css/script.js를 외부 참조(공유용)로 두지만, 미리보기(iframe srcdoc)는
   *  실제 파일이 옆에 없어서 그 참조가 그냥 깨집니다 — 미리보기에서만 실제 CSS/JS 내용을
   *  그 자리에 바꿔 넣어서 배포본과 똑같이 보이게 합니다. 배포되는 파일 자체는 안 건드립니다. */
  function buildCatalogPreviewHtml(html) {
    return html
      .replace('<link rel="stylesheet" href="./style.css">', `<style>${CATALOG_STYLE}</style>`)
      .replace('<script src="./script.js"></script>', `<script>${CATALOG_SCRIPT}</script>`);
  }

  /** iframe이 고정 높이만 갖고 있으면 내용이 길 때 안에서 스크롤이 생겨 "짧아 보이는"
   *  문제가 생깁니다. 로드되자마자 실제 문서 높이를 재서 iframe 자체를 그만큼 늘립니다
   *  (카탈로그처럼 배너+헤더+LNB만으로도 300px를 훌쩍 넘는 화면에 특히 필요합니다). */
  function appendAutoHeightIframe(host, srcdoc) {
    const iframe = el("iframe", { srcdoc });
    iframe.addEventListener("load", () => {
      try {
        const h = iframe.contentDocument.documentElement.scrollHeight;
        iframe.style.height = Math.max(h, 300) + "px";
      } catch (e) { /* srcdoc은 동일 출처라 실패할 일이 거의 없지만, 방어적으로 무시 */ }
    });
    host.appendChild(iframe);
  }

  function renderCatalogPreviewFor(groupId) {
    const info = (draft.catalogGroups || {})[groupId];
    if (!info || info.status !== "done") return;
    previewFrame.innerHTML = "";
    appendAutoHeightIframe(previewFrame, buildCatalogPreviewHtml(info.html));
  }

  /** "2026-07;신규" 처럼 세미콜론으로 구분된 배지 문자열을 배열로 */
  function parseBadges(raw) {
    return String(raw || "").split(";").map(s => s.trim()).filter(Boolean);
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
      // (EDM 엑셀 업로드와 동일한 필터링 방식). 그룹 값은 이제 검증하지 않습니다 —
      // 엑셀에 뭐라고 쓰든 그 값 그대로 새 그룹이 만들어집니다(resolveCatalogGroups).
      const parsed = rows
        .map(r => ({
          group: String(r[0] ?? "").trim(),
          category: String(r[1] ?? "").trim(),
          code: String(r[2] ?? "").trim(),
          price: String(r[3] ?? "").trim(),
          badges: parseBadges(r[4]),
          since: String(r[5] ?? "").trim(),
          bid: String(r[6] ?? "").trim()
        }))
        .filter(r => r.code && /\d/.test(r.code) && r.group);

      if (!parsed.length) {
        toast("처리할 상품이 없습니다 — 그룹/코드 값을 확인해주세요");
        log("⚠ 유효한 행이 0개라 카탈로그를 만들지 못했습니다. group과 code 칸이 채워져 있는지 확인해주세요.");
        return;
      }

      await runCatalogImport(parsed);
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

    // 엑셀에 실제로 등장한 그룹 값들로 이번 배포의 그룹 목록을 매번 새로 만듭니다 —
    // 코드에 그룹을 미리 정의해둘 필요가 없습니다.
    const allGroups = resolveCatalogGroups(rows.map(r => r.group));
    draft.catalogGroupsMeta = allGroups;

    const totalCodes = rows.length;
    let doneCodes = 0;
    let failedCodes = 0;
    draft.catalogProgress = { done: 0, total: totalCodes, failed: 0 };
    renderForm();

    for (const group of allGroups) {
      const groupRows = byGroup[group.label];
      if (!groupRows || !groupRows.length) continue;

      draft.catalogGroups[group.label] = { status: "processing", count: groupRows.length };
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
      buildAndStoreGroupHtml(group, allGroups, categories);
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

  /** HTML 조립 + 가이드라인 체크 + draft.catalogGroups에 저장을 한 번에 합니다.
   *  ⚠️ categories(그룹별 상품 목록)는 여기서 draft.catalogGroups[group.label]에도
   *  같이 보관합니다 — 나중에 배너만 바뀌었을 때 시리즈 API를 다시 부르지 않고도
   *  rebuildCatalogHtml()이 이 categories로 HTML만 재조립할 수 있게 하기 위함입니다. */
  function buildAndStoreGroupHtml(group, allGroups, categories) {
    const validBanners = (draft.catalogBanners || []).filter(b => b.img && b.img.trim());
    const html = assembleLpCatalogGroupHtml(group, allGroups, categories, currentSeoMeta(), validBanners);
    const totalCount = categories.reduce((sum, c) => sum + c.items.length, 0);
    const effectiveSeoMeta = resolveCatalogSeoMeta(group, totalCount, currentSeoMeta());
    // ⚠️ HTML에 박힌 것과 검사기에 넘기는 메타가 어긋나면 "타이틀이 비어있습니다" 같은
    // 오탐이 나므로, assembleLpCatalogGroupHtml이 실제로 쓴 것과 동일한 유효 메타를 씁니다.
    const groupIssues = checkGuidelinesLP(html, { ...effectiveSeoMeta, widthPattern: 1200 });
    draft.catalogGroups[group.label] = {
      status: "done",
      count: categories.reduce((sum, c) => sum + c.items.length, 0),
      html,
      issues: groupIssues,
      categories // ⚠️ 배너 재조립용 원본 보관 (deployCatalog엔 포함되지 않음 — html만 배포됨)
    };
    updateCatalogGuidelineBadge();
  }

  /** 배너(이미지/링크/라벨)만 바뀌었을 때, 시리즈 API를 다시 호출하지 않고 이미
   *  조회해둔 categories로 완료된 그룹들의 HTML만 다시 조립합니다.
   *  ⚠️ 이 함수를 안 만들었을 때 있었던 버그: 배너를 바꾼 뒤 "전체 배포"를 눌러도
   *  deployCatalog()는 이미 구워진 draft.catalogGroups[g].html을 그대로 올릴 뿐이라
   *  새 배너가 절대 반영되지 않았습니다. 배너가 바뀌면 반드시 이 함수부터 호출해서
   *  HTML을 새로 구운 다음에 배포해야 합니다. */
  function rebuildCatalogHtml() {
    const allGroups = draft.catalogGroupsMeta || [];
    let rebuiltCount = 0;
    for (const group of allGroups) {
      const info = draft.catalogGroups[group.label];
      if (!info || info.status !== "done" || !info.categories) continue;
      buildAndStoreGroupHtml(group, allGroups, info.categories);
      rebuiltCount++;
    }
    if (rebuiltCount > 0) {
      log(`배너 변경 반영 — ${rebuiltCount}개 그룹 HTML 재조립 완료`);
      renderForm();
    }
    // ⚠️ 예전엔 rebuiltCount > 0일 때만 renderPreview()를 호출해서, 완료된 그룹이
    // 아직 하나도 없는 상태(엑셀 업로드 전에 배너부터 올린 경우 — 지금은 배너가
    // 상품데이터 업로드보다 먼저 나오니 오히려 흔한 순서)에서는 배너를 올려도
    // 미리보기(스켈레톤)에 전혀 반영되지 않는 버그가 있었습니다. 그룹이 있든 없든
    // 항상 미리보기를 다시 그립니다 — 그룹이 없으면 스켈레톤에 배너만 반영됩니다.
    renderPreview();
  }

  /** style.css/script.js + 완료된 그룹 html들을 한 캠페인 폴더에 전부 배포합니다. */
  /** footer의 "🔗 링크 확인"(runLinkCheck)과 정확히 같은 역할입니다 — 다만 카탈로그는
   *  단일 페이지가 아니라 그룹별로 여러 HTML이라 checkAllLinks()를 그룹마다 돌려서
   *  합산합니다. runLinkCheck()처럼 이 함수도 두 군데서 트리거됩니다:
   *  1) "🔗 링크 확인" 버튼으로 수동 실행
   *  2) deployCatalog() 배포 직전 가드로 자동 실행(confirmExportGuards와 동일한 패턴)
   *  결과를 항상 화면에 렌더링하고, 집계 결과(총 깨짐 건수 등)도 반환해서 가드 쪽에서
   *  confirm() 여부를 판단할 수 있게 합니다.
   *  @returns {{totalOk:number, totalBroken:number, totalUnknown:number}} */
  async function runCatalogLinkCheck() {
    const doneGroups = (draft.catalogGroupsMeta || []).filter(g => draft.catalogGroups?.[g.label]?.status === "done");
    const host = root.querySelector("#genlp-catalog-link-check-results");
    if (!doneGroups.length) {
      toast("완료된 그룹이 없습니다");
      return { totalOk: 0, totalBroken: 0, totalUnknown: 0 };
    }

    if (host) host.innerHTML = "";
    log(`링크 확인 중... (${doneGroups.length}개 그룹)`);

    const perGroup = [];
    for (const group of doneGroups) {
      const html = draft.catalogGroups[group.label].html;
      const results = await checkAllLinks(html);
      perGroup.push({ label: group.label, summary: summarizeLinkResults(results) });
    }

    const totalBroken = perGroup.reduce((sum, g) => sum + g.summary.broken, 0);
    const totalUnknown = perGroup.reduce((sum, g) => sum + g.summary.unknown, 0);
    const totalOk = perGroup.reduce((sum, g) => sum + g.summary.ok, 0);
    log(`링크 확인 완료 — 정상 ${totalOk}건 · 깨짐 ${totalBroken}건 · 확인불가 ${totalUnknown}건`);

    if (host) {
      host.appendChild(el("div", { class: "guide-result " + (totalBroken ? "guide-fail" : "guide-pass") },
        `전체: 정상 ${totalOk}건 · 깨짐 ${totalBroken}건 · 확인불가(CORS) ${totalUnknown}건`));
      perGroup.forEach(g => {
        if (!g.summary.total) return; // 이미지/링크가 없는 그룹은 굳이 안 보여줌
        host.appendChild(el("div", { class: "guide-result " + (g.summary.broken ? "guide-fail" : "guide-pass"), style: "margin-top:4px;font-size:12px;" },
          `${g.label}: 정상 ${g.summary.ok} · 깨짐 ${g.summary.broken} · 확인불가 ${g.summary.unknown}`));
      });
    }

    return { totalOk, totalBroken, totalUnknown };
  }

  /** 일반 LP의 confirmExportGuards()와 동일한 역할 — 배포 직전에 가이드라인/링크 확인을
   *  거치고, 문제가 있으면 confirm()으로 계속할지 물어봅니다. 카탈로그는 그룹별
   *  가이드라인 이슈가 이미 draft.catalogGroups[].issues에 쌓여있으므로 그걸 합산해서
   *  씁니다. */
  async function confirmCatalogExportGuards() {
    const allIssues = (draft.catalogGroupsMeta || [])
      .flatMap(g => draft.catalogGroups?.[g.label]?.issues || []);
    const summary = summarizeGuidelineIssuesLP(allIssues);
    if (summary.errors > 0) {
      if (!confirm(`가이드라인 위반 ${summary.errors}건이 있습니다. 그래도 진행하시겠습니까?`)) {
        log("배포 취소 (가이드라인 위반)");
        return false;
      }
    }
    const linkSummary = await runCatalogLinkCheck();
    if (linkSummary.totalBroken > 0) {
      if (!confirm(`깨진 링크/이미지가 ${linkSummary.totalBroken}건 있습니다. 그래도 진행하시겠습니까?`)) {
        log("배포 취소 (깨진 링크 발견)");
        return false;
      }
    }
    return true;
  }

  /** ⚠️ 빌드툴 없는 vanilla ES모듈 환경이라 JSZip 같은 외부 라이브러리를 그냥
   *  import할 수 없습니다(엑셀 업로드가 window.XLSX를 별도 <script> 태그로 불러오는
   *  것과 같은 사정) — index.html에 CDN 스크립트를 추가하는 방법도 있지만, 여기선
   *  브라우저 내장 기능(TextEncoder/DataView/Blob)만으로 ZIP 포맷(무압축 "store"
   *  방식)을 직접 만듭니다. 압축은 안 하지만(전부 텍스트라 원본도 작음), 표준 ZIP
   *  포맷이라 압축 프로그램에서 정상적으로 열립니다.
   *  @param {{name: string, content: string}[]} files
   *  @returns {Blob} */
  function buildZip(files) {
    const encoder = new TextEncoder();
    const now = new Date();
    const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
    const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;

    let crcTable = null;
    function crc32(bytes) {
      if (!crcTable) {
        crcTable = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
          let c = n;
          for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
          crcTable[n] = c;
        }
      }
      let crc = 0xFFFFFFFF;
      for (let i = 0; i < bytes.length; i++) crc = crcTable[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
      return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    const localParts = [];
    const centralParts = [];
    let offset = 0;

    for (const file of files) {
      const nameBytes = encoder.encode(file.name);
      const dataBytes = encoder.encode(file.content);
      const crc = crc32(dataBytes);
      const size = dataBytes.length;

      const local = new Uint8Array(30 + nameBytes.length);
      const ldv = new DataView(local.buffer);
      ldv.setUint32(0, 0x04034b50, true);
      ldv.setUint16(4, 20, true);
      ldv.setUint16(6, 0, true);
      ldv.setUint16(8, 0, true); // 압축방식 0 = store(무압축)
      ldv.setUint16(10, dosTime, true);
      ldv.setUint16(12, dosDate, true);
      ldv.setUint32(14, crc, true);
      ldv.setUint32(18, size, true);
      ldv.setUint32(22, size, true);
      ldv.setUint16(26, nameBytes.length, true);
      ldv.setUint16(28, 0, true);
      local.set(nameBytes, 30);
      localParts.push(local, dataBytes);

      const central = new Uint8Array(46 + nameBytes.length);
      const cdv = new DataView(central.buffer);
      cdv.setUint32(0, 0x02014b50, true);
      cdv.setUint16(4, 20, true);
      cdv.setUint16(6, 20, true);
      cdv.setUint16(8, 0, true);
      cdv.setUint16(10, 0, true);
      cdv.setUint16(12, dosTime, true);
      cdv.setUint16(14, dosDate, true);
      cdv.setUint32(16, crc, true);
      cdv.setUint32(20, size, true);
      cdv.setUint32(24, size, true);
      cdv.setUint16(28, nameBytes.length, true);
      cdv.setUint32(42, offset, true);
      central.set(nameBytes, 46);
      centralParts.push(central);

      offset += local.length + dataBytes.length;
    }

    const centralSize = centralParts.reduce((sum, p) => sum + p.length, 0);
    const centralOffset = offset;
    const end = new Uint8Array(22);
    const edv = new DataView(end.buffer);
    edv.setUint32(0, 0x06054b50, true);
    edv.setUint16(8, files.length, true);
    edv.setUint16(10, files.length, true);
    edv.setUint32(12, centralSize, true);
    edv.setUint32(16, centralOffset, true);

    return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
  }

  /** 완료된 그룹들의 style.css/script.js/그룹html을 하나의 zip으로 다운로드합니다.
   *  deployCatalog()가 S3에 올리는 파일 목록과 동일한 구성입니다 — 배포 전에 로컬에서
   *  실제 파일들을 한 번 열어보고 싶을 때 씁니다(일반 LP의 downloadHtml()과 같은 역할). */
  async function downloadCatalogZip() {
    if (!(await confirmCatalogExportGuards())) return;
    const files = [
      { name: "style.css", content: CATALOG_STYLE },
      { name: "script.js", content: CATALOG_SCRIPT },
      ...(draft.catalogGroupsMeta || [])
        .filter(g => draft.catalogGroups?.[g.label]?.status === "done")
        .map(g => ({ name: g.file, content: draft.catalogGroups[g.label].html }))
    ];
    if (files.length <= 2) { toast("완료된 그룹이 없습니다"); return; }
    const blob = buildZip(files);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `catalog-${draft.id}.zip`;
    a.click();
    log(`카탈로그 zip 다운로드 완료 (${files.length}개 파일)`);
  }

  async function deployCatalog() {
    // ⚠️ 배포 직전에 한 번 더 재조립합니다 — 사용자가 배너를 바꾼 뒤 rebuildCatalogHtml
    // 호출을 놓쳤어도(예: 수동 URL 입력 필드에서 blur 없이 바로 배포 클릭), 배포되는
    // 파일이 항상 최신 배너 상태를 반영하도록 하는 안전장치입니다.
    rebuildCatalogHtml();
    // 일반 LP의 downloadHtml()/deployLp()가 confirmExportGuards()를 거치는 것과 동일하게,
    // 카탈로그도 배포 직전에 가이드라인/링크 확인 가드를 거칩니다.
    if (!(await confirmCatalogExportGuards())) return;
    const files = [
      { name: "style.css", content: CATALOG_STYLE, contentType: "text/css" },
      { name: "script.js", content: CATALOG_SCRIPT, contentType: "application/javascript" },
      ...(draft.catalogGroupsMeta || [])
        .filter(g => draft.catalogGroups?.[g.label]?.status === "done")
        .map(g => ({ name: g.file, content: draft.catalogGroups[g.label].html, contentType: "text/html" }))
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

  /** EDM 생성기의 sectionCampaignName()과 동일한 필드 구성(캠페인명/프로모션명/작성자,
   *  전부 필수 표시)입니다 — 예전엔 LP에 프로모션명만 선택사항으로 있었는데 EDM과
   *  일관성을 맞췄습니다. */
  function sectionCampaignSettings() {
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [
          el("span", { class: "sec-title" }, "캠페인 설정")
        ])
      ]),
      el("div", { class: "sec-body" }, [
        el("div", { class: "field", style: "margin-bottom:14px;" }, [
          el("label", {}, ["캠페인명 ", el("span", { class: "req-tag" }, "· 필수")]),
          el("input", {
            type: "text", value: draft.campaignName || "",
            placeholder: "예: 7월 신규 LP 캠페인",
            oninput: e => { draft.campaignName = e.target.value; }
          }),
          el("p", { class: "hint" }, "캠페인 목록에서 이 이름으로 표시됩니다.")
        ]),
        el("div", { class: "field", style: "margin-bottom:14px;" }, [
          el("label", {}, ["프로모션명 ", el("span", { class: "req-tag" }, "· 필수")]),
          el("input", {
            type: "text", value: draft.promotionName || "",
            placeholder: "예: 2026년 7월 경제형 프로모션",
            oninput: e => { draft.promotionName = e.target.value; }
          }),
          el("p", { class: "hint" }, "같은 프로모션의 EDM/LP를 나중에 묶어보고 싶으면, 양쪽에 똑같은 이름을 입력하세요.")
        ]),
        el("div", { class: "field", style: "margin-bottom:14px;" }, [
          el("label", {}, ["작성자 ", el("span", { class: "req-tag" }, "· 필수")]),
          el("input", {
            type: "text", value: draft.author || "",
            placeholder: "예: 홍길동",
            oninput: e => { draft.author = e.target.value; }
          })
        ])
      ])
    ]);
  }

  function sectionPageType() {
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [
          el("span", { class: "sec-title" }, "페이지 유형")
        ])
      ]),
      el("div", { class: "sec-body" }, [
        el("div", { class: "seg-tabs" }, PAGE_TYPES.map(t =>
          el("div", {
            class: "seg-tab" + (draft.pageType === t.key ? " active" : ""),
            onclick: () => {
              draft.pageType = t.key;
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
    // 경제형은 총 폭이 항상 1200px 고정(내부 240/920 분할)이라 폭 선택 자체가 무의미합니다 —
    // 선택지를 보여주는 대신 고정값 안내만 표시합니다.
    if (draft.pageType === LP_ECONOMY_LAYOUT.pageType) {
      return el("div", { class: "field", style: "margin-bottom:14px;" }, [
        el("label", {}, "컨텐츠 폭"),
        el("p", { class: "hint", style: "color:#a9660a;" },
          `⚠ 경제형은 총 폭 ${LP_ECONOMY_LAYOUT.totalWidth}px 고정입니다 (사이드 ${LP_ECONOMY_LAYOUT.sidebarWidth}px + 컨텐츠 ${LP_ECONOMY_LAYOUT.contentWidth}px 분할, ${LP_ECONOMY_LAYOUT.scope}).`)
      ]);
    }
    const options = Object.keys(LP_WIDTH_PATTERNS).map(Number).sort((a, b) => a - b);
    return el("div", { class: "field", style: "margin-bottom:14px;" }, [
      el("label", {}, "컨텐츠 폭"),
      el("div", { class: "row3" }, options.map(w => {
        return el("div", {
          class: "opt-btn" + (draft.widthPattern === w ? " active" : ""),
          onclick: () => {
            draft.widthPattern = w;
            renderForm();
            renderPreview();
          }
        }, `${w}px`);
      }))
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

  // renderPreview()가 카탈로그일 때 rebuildCatalogHtml()까지 매 키 입력마다 돌리면
  // (완료된 그룹 전체를 다시 조립 + 가이드라인 재검사) 타이핑이 끊길 수 있어서,
  // 살짝 디바운스합니다 — 화면 UI 자체는 기본형과 완전히 동일하게 유지합니다.
  let seoMetaRebuildTimer = null;

  function sectionSeoMeta() {
    const isCatalog = draft.templateId === CATALOG_TEMPLATE_ID;
    const handleChange = () => {
      renderPreview();
      if (isCatalog) {
        clearTimeout(seoMetaRebuildTimer);
        seoMetaRebuildTimer = setTimeout(rebuildCatalogHtml, 500);
      }
    };
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [
          el("span", { class: "sec-title" }, "SEO 메타")
        ])
      ]),
      el("div", { class: "sec-body" }, [
        el("button", {
          class: "ai-btn",
          style: "margin-bottom:10px;",
          onclick: async () => {
            log("SEO 메타 생성 요청 중...");
            const result = await generateSeoMeta({
              contentName: draft.catchcopy || (isCatalog ? "신상품카탈로그" : "컨텐츠"),
              parentCategory: draft.breadcrumb
            });
            draft.seoTitle = result.title;
            draft.seoDescription = result.description;
            draft.seoKeywords = result.keywords;
            log("SEO 메타 생성 완료");
            renderForm();
            handleChange();
          }
        }, "✨ AI 자동생성"),
        el("div", { class: "field" }, [
          el("label", {}, `타이틀 (${(draft.seoTitle || "").length}/35자)`),
          el("input", {
            type: "text", value: draft.seoTitle || "",
            oninput: e => { draft.seoTitle = e.target.value; handleChange(); }
          })
        ]),
        el("div", { class: "field" }, [
          el("label", {}, `디스크립션 (${(draft.seoDescription || "").length}/100자)`),
          el("textarea", {
            oninput: e => { draft.seoDescription = e.target.value; handleChange(); }
          }, draft.seoDescription || "")
        ]),
        el("div", { class: "field" }, [
          el("label", {}, "키워드"),
          el("input", {
            type: "text", value: (draft.seoKeywords || []).join(", "),
            placeholder: "쉼표로 구분",
            oninput: e => { draft.seoKeywords = e.target.value.split(",").map(s => s.trim()).filter(Boolean); handleChange(); }
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
  /** 카탈로그는 그룹이 여러 개라 그룹마다 이슈가 다를 수 있는데, 그렇다고 배지 자리를
   *  새로 만들지 않고 기존 하단 배지(#genlp-guideline-badge)를 그대로 씁니다 — 화면
   *  구조를 일관되게 유지하려고, 그룹별 결과는 여기에 다 합쳐서 보여줍니다. */
  function updateCatalogGuidelineBadge() {
    const badge = root.querySelector("#genlp-guideline-badge");
    if (!badge) return;
    const allIssues = Object.entries(draft.catalogGroups || {}).flatMap(([label, info]) =>
      (info.issues || []).map(i => ({ ...i, message: `[${label}] ${i.message}` }))
    );
    latestGuidelineIssues = allIssues;
    const summary = summarizeGuidelineIssuesLP(allIssues);
    badge.className = "guideline-badge " + (allIssues.length === 0 ? "badge-pass" : summary.errors ? "badge-fail" : "badge-warn");
    badge.textContent = allIssues.length === 0
      ? "✅ 완료된 그룹 전체 가이드라인 통과"
      : `${summary.errors ? "❌" : "⚠️"} 위반 ${summary.errors}건 · 경고 ${summary.warnings}건 — 그룹별 상세는 클릭해서 보기`;
  }

  function renderCatalogPreview() {
    const groups = draft.catalogGroups || {};
    const firstReady = (draft.catalogGroupsMeta || []).find(g => groups[g.label]?.status === "done");
    previewFrame.innerHTML = "";
    if (firstReady) {
      appendAutoHeightIframe(previewFrame, buildCatalogPreviewHtml(groups[firstReady.label].html));
      updateCatalogGuidelineBadge();
    } else {
      previewFrame.appendChild(el("p", { class: "hint", style: "text-align:center;margin:8px 0;" }, "샘플 미리보기입니다 (실제 데이터 아님) — 엑셀을 업로드하면 실제 상품으로 바뀝니다."));
      appendAutoHeightIframe(previewFrame, buildCatalogPreviewHtml(catalogSampleHtml()));
      const badge = root.querySelector("#genlp-guideline-badge");
      if (badge) { badge.className = "guideline-badge"; badge.textContent = "엑셀을 업로드하면 가이드라인을 확인합니다"; }
    }
  }

  /** 엑셀 업로드 전 미리보기 — 예전엔 인라인 스타일로 그린 회색 와이어프레임이었는데,
   *  실제 프로덕션 CSS(CATALOG_STYLE)를 안 써서 색상/폰트/여백이 실제 결과물과 달랐고
   *  구체성도 떨어졌습니다. 이제 실제 CATALOG_STYLE을 그대로 입히고, 진짜 상품 데이터
   *  대신 샘플 값(샘플 상품명/가격 등)을 채운 완전한 HTML을 만들어서 iframe으로
   *  보여줍니다 — 실제 배포될 때와 색/폰트/레이아웃이 100% 동일하게 보입니다.
   *  ⚠️ 배너는 실제로 업로드된 게 있으면 그대로 반영하고, 카테고리/상품은 전부
   *  가짜 샘플입니다(엑셀 업로드 전에는 실제 개수/이름을 알 수 없으므로). */
  function catalogSampleHtml() {
    const validBanners = (draft.catalogBanners || []).filter(b => b.img && b.img.trim());
    const sampleCategory = {
      id: "cat-1", label: "샘플 카테고리",
      items: [1, 2, 3, 4, 5, 6].map(n => ({
        code: `SAMPLE-${n}`, name: `샘플 상품명 ${n}`, image: "", price: "10,000",
        brandName: "MISUMI", since: "", badges: [], bid: ""
      }))
    };
    const sampleGroup = { label: "샘플 그룹", file: "sample.html" };
    return assembleLpCatalogGroupHtml(
      sampleGroup, [sampleGroup], [sampleCategory],
      { title: "샘플 미리보기", description: "샘플 미리보기입니다." },
      validBanners
    );
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
    if (draft.templateId === CATALOG_TEMPLATE_ID) return; // 표준 내보내기 영역과 함께 숨겨짐 — 방어적 가드
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

  function toggleExportMenu() {
    const menu = root.querySelector("#genlp-export-menu");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  }
  function closeExportMenu() {
    const menu = root.querySelector("#genlp-export-menu");
    if (menu) menu.style.display = "none";
  }

  async function downloadHtml() {
    if (draft.templateId === CATALOG_TEMPLATE_ID) {
      // ⚠️ 방어적 가드 — 표준 내보내기 영역과 함께 숨겨지므로 정상적으론 호출될 일이
      // 없지만, 예전엔 이 가드가 없어서 카탈로그 모드에서 이 함수가 호출되면
      // resolveTemplate()이 null → FALLBACK_BLOCKS로 조립된 빈 페이지가 조용히
      // 다운로드되는 버그가 있었습니다.
      toast("신상품카탈로그는 위 '전체 배포' 버튼을 사용하세요");
      return;
    }
    const html = assembleLpHtml(draft, resolveTemplate(), currentSeoMeta());
    if (!(await confirmExportGuards(html))) return;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (draft.catchcopy || "lp") + ".html";
    a.click();
    log("HTML 다운로드 완료");
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

  /** 캠페인 설정의 필수 항목(캠페인명/프로모션명/작성자)이 비어있는지 확인합니다.
   *  ⚠️ 예전엔 이 검증이 없어서 아무것도 안 입력해도 그냥 임시저장이 됐습니다 —
   *  "(캠페인명 미입력)" 같은 플레이스홀더 문구로 저장은 되긴 했지만, 캠페인 목록에서
   *  뭐가 뭔지 구분이 안 되는 문제가 있었습니다. */
  function validateRequiredCampaignFields() {
    const missing = [];
    if (!(draft.campaignName || "").trim()) missing.push("캠페인명");
    if (!(draft.promotionName || "").trim()) missing.push("프로모션명");
    if (!(draft.author || "").trim()) missing.push("작성자");
    return missing;
  }

  function saveDraft() {
    const missing = validateRequiredCampaignFields();
    if (missing.length) {
      toast(`필수 입력 항목을 채워주세요: ${missing.join(", ")}`);
      log(`임시저장 실패 — 필수 항목 누락: ${missing.join(", ")}`);
      return;
    }
    const campaign = draftToCampaignLP();
    store.upsertCampaign(campaign);
    toast("임시저장했습니다");
    log("임시저장 완료");
  }

  function draftToCampaignLP() {
    return {
      id: draft.id,
      name: (draft.campaignName || "").trim() || "(캠페인명 미입력)",
      author: (draft.author || "").trim() || "(작성자 미입력)",
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
    campaignName: "",
    author: "",
    promotionName: "",
    templateId: LP_TEMPLATES[0]?.id || "lp1",
    pageType: "일반형",
    widthPattern: 1200,
    breadcrumb: "",
    seriesCodes: Array.from({ length: 6 }, () => ""),
    products: [],
    deployedUrl: "",
    catalogGroups: {},
    catalogGroupsMeta: [],
    catalogImporting: false,
    catalogProgress: null,
    catalogDeployedUrls: [],
    catalogBanners: [{ img: "", href: "", label: "" }],
    catalogBannerUploading: null,
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
    return {
      ...base, ...existing.draftData, id: base.id,
      campaignName: existing.draftData.campaignName || existing.name || "",
      author: existing.draftData.author || existing.author || ""
    };
  }
  if (existing?.name) {
    return { ...base, campaignName: existing.name, author: existing.author || "" };
  }
  return base;
}
