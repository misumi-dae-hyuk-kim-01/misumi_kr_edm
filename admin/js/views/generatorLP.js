import { store } from "../state.js";
import { el, toast, esc } from "../lib/dom.js";
import { generateCopyLP } from "../lib/copyGeneratorLP.js";
import { generateSeoMeta } from "../lib/seoMetaGenerator.js";
import { assembleLpHtml, assembleLpCatalogGroupHtml, resolveCatalogGroups, resolveCatalogSeoMeta, CATALOG_STYLE, CATALOG_SCRIPT, assembleEventLpHtml, buildEventLpCss, detectBenefitType, benefitLayoutRule, enforceSingleEmphasis, NOTICE_COMMON_MASTER, EVENT_LP_TEMPLATE_ID, assembleEconomyLineupHtml, economyBid, economyLineupIssues, economySampleData, ECONOMY_LINEUP_TEMPLATE_ID, ECONOMY_LINEUP_PREVIEW_CSS, assembleEvolutionHtml, evolutionBlockDefaults, EVOLUTION_BLOCK_TYPES, EVOLUTION_PREVIEW_CSS, EVOLUTION_TEMPLATE_ID } from "../lib/blocksLP.js";
import { seedLpTemplates } from "../data/lpTemplates.js";
import { checkGuidelinesLP, summarizeGuidelineIssuesLP, LP_WIDTH_PATTERNS, LP_ECONOMY_LAYOUT, DEPLOYMENT_COUNTRY } from "../lib/guidelineCheckLP.js";
import { checkAllLinks, summarizeLinkResults } from "../lib/linkChecker.js";
import { fetchSeriesInfo, fetchSeriesInfoBatch } from "../lib/seriesApi.js";
import { deployLpToS3, deployLpFilesToS3 } from "../lib/lpDeploy.js";
import { resizeImage } from "../lib/imageResize.js";
import { uploadToS3 } from "../lib/s3Upload.js";
import { generateImage } from "../lib/imageProcessApi.js";

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
    const isEventLp = draft.templateId === EVENT_LP_TEMPLATE_ID;
    const isEconomyLineup = draft.templateId === ECONOMY_LINEUP_TEMPLATE_ID;
    const isEvolution = draft.templateId === EVOLUTION_TEMPLATE_ID;
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
    if (isEventLp) {
      // ⚠️ 이벤트 LP는 GENERATOR_SPEC.md 3절 "담당자가 채우는 순서 = LP의 블록
      // 순서" 원칙 그대로: 기본정보 → KV → 요약표 → 혜택 → STEP(선택) → CTA → 유의사항.
      formBody.appendChild(sectionEventLpBasic());
      formBody.appendChild(sectionEventLpKv());
      formBody.appendChild(sectionEventLpSummary());
      formBody.appendChild(sectionEventLpBenefits());
      formBody.appendChild(sectionEventLpSteps());
      formBody.appendChild(sectionEventLpCta());
      formBody.appendChild(sectionEventLpNotice());
      return;
    }
    if (isEconomyLineup) {
      // ⚠️ 신상품카탈로그와 마찬가지로 상시 운영되는(계속 갱신되는) 페이지입니다.
      // 다른 점은 "구조"입니다 — 카탈로그는 그룹별로 개별 페이지를 만드는 방식인
      // 반면, 경제형 라인업은 PC메인/전체라인업/모바일/데이터 4개 뷰가 하나의
      // 사이트 구조를 이루고, 상품 데이터만 주기적으로 갱신됩니다. 그래서 콘텐츠
      // 입력 폼도 기본정보(메타) → 상품 데이터 엑셀 업로드 → 뷰 전환 순서.
      formBody.appendChild(sectionEconomyBasic());
      formBody.appendChild(sectionEconomyUpload());
      formBody.appendChild(sectionEconomyView());
      return;
    }
    if (isEvolution) {
      // ⚠️ 다른 템플릿과 달리 "블록 조합형"입니다 — 고정된 필드 목록이 아니라
      // 담당자가 블록을 골라 추가/삭제/순서변경합니다. 기본정보 → 페이지 종류(LP/허브)
      // 전환 → 블록 팔레트+편집 순서.
      formBody.appendChild(sectionEvolutionBasic());
      formBody.appendChild(sectionEvolutionPalette());
      formBody.appendChild(sectionEvolutionBlocks());
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
      // ⚠️ 실제 원인은 .guideline-badge에 붙어있는 margin-top:8px였습니다(generator.css) —
      // .btn/.btn-sm엔 그런 마진이 없어서, .catalog-group-row가 이미 flex+align-items:center로
      // 잘 정렬돼 있어도 배지만 아래로 밀려 높이가 어긋나 보였습니다. margin-top만 0으로
      // 눌러주면 되고, 나머지(flex/CSS 우선순위)는 원래도 문제없었습니다.
      return el("div", { class: "catalog-group-row" }, [
        el("span", { class: "catalog-group-label" }, g.label),
        el("span", { class: "catalog-group-count" }, info ? `${info.count}개` : ""),
        el("span", {
          class: "guideline-badge " + statusClass,
          style: "margin-left:auto;margin-top:0;"
        }, statusLabel),
        el("button", {
          class: "btn btn-sm ghost",
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
    const rows = banners.map((b, i) => {
      const materials = b.materialUrls || [];
      const uploading = draft.catalogBannerUploading === i;
      return el("div", { class: "field", style: "margin-bottom:10px;border-bottom:1px solid #f0f0f0;padding-bottom:10px;" }, [
        el("label", {}, `배너 ${i + 1}`),
        el("input", {
          type: "text", value: b.img, placeholder: "이미지 URL (또는 아래에서 업로드/AI 생성)",
          oninput: e => { banners[i].img = e.target.value; },
          onblur: () => rebuildCatalogHtml()
        }),
        el("div", { class: "image-upload-row", style: "margin-top:6px;" }, [
          el("label", { class: "btn btn-sm upload-label" }, [
            uploading ? "처리 중..." : "이미지 업로드",
            el("input", {
              type: "file", accept: "image/*", style: "display:none;", disabled: uploading ? "disabled" : null,
              onchange: e => { if (e.target.files[0]) handleCatalogBannerGenerate(i, e.target.files[0]); }
            })
          ]),
          b.img ? el("img", { src: b.img, alt: "", style: "width:36px;height:36px;object-fit:cover;border-radius:4px;border:1px solid #e0e0e0;" }) : null
        ]),
        // ⚠️ EDM 생성기의 generateImage() 통합 방식과 동일 — 편집인지 합성인지는
        // 코드가 미리 안 가르고, 소재(참고 이미지)와 지시문을 그대로 AI에 넘겨서
        // 판단하게 합니다. 지시문 없이 업로드만 하면 예전처럼 그냥 업로드만 됩니다.
        el("div", { style: "margin-top:8px;padding:8px;background:#fafafa;border-radius:6px;" }, [
          el("p", { class: "hint", style: "margin:0 0 6px;" }, "AI로 배너 만들기 (선택) — 소재를 올리고/또는 프롬프트만으로 요청할 수 있습니다."),
          materials.length ? el("div", { style: "display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;" }, materials.map((url, mi) =>
            el("span", { style: "display:inline-flex;align-items:center;gap:4px;background:#eef0f8;border-radius:12px;padding:2px 8px 2px 2px;font-size:11px;" }, [
              el("img", { src: url, style: "width:18px;height:18px;object-fit:cover;border-radius:50%;" }),
              `소재${mi + 1}`,
              el("span", { style: "cursor:pointer;color:#999;font-weight:700;", onclick: () => { materials.splice(mi, 1); renderForm(); } }, "×")
            ])
          )) : null,
          el("label", { class: "btn btn-sm ghost", style: "margin-bottom:6px;" }, [
            "소재 업로드 (여러 장 가능)",
            el("input", {
              type: "file", accept: "image/*", multiple: true, style: "display:none;",
              onchange: async e => {
                const files = [...e.target.files];
                if (!files.length) return;
                log(`배너 소재 업로드 중... (${files.length}장)`);
                for (const file of files) {
                  try {
                    const url = await uploadToS3(file, file.name, "LP");
                    materials.push(url);
                  } catch (err) { log(`오류(${file.name}): ` + err.message); }
                }
                renderForm();
              }
            })
          ]),
          el("textarea", {
            placeholder: "예: 이 제품 사진들을 참고해서, 파란 배경에 '신상품 20% 할인'이라는 문구가 들어간 배너를 만들어줘",
            value: b.instruction || "",
            oninput: e => { banners[i].instruction = e.target.value; },
            style: "margin-bottom:6px;"
          }),
          el("button", {
            class: "btn btn-sm", disabled: uploading ? "disabled" : null,
            onclick: () => handleCatalogBannerGenerate(i, null)
          }, uploading ? "생성 중..." : "AI로 생성")
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
      ]);
    });

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
          onclick: () => { banners.push({ img: "", href: "", label: "", instruction: "", materialUrls: [] }); renderForm(); }
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
   *  이 헬퍼가 없어서 배너를 업로드해도 에셋관리 목록에 전혀 나타나지 않았습니다.
   *  ⚠️ 카테고리는 "히어로 배경"을 씁니다 — 카탈로그 배너와 EDM/LP의 상단 히어로 이미지는
   *  둘 다 "페이지 맨 위의 프로모션 이미지"라는 본질이 같아서, 예전에 "배너 이미지"라는
   *  별도 카테고리를 만들었던 건 채널별로 이름만 다르게 붙인 중복이었습니다. 하나로
   *  합쳐야 나중에 "상단 이미지 전부 찾기"가 카테고리 필터 하나로 됩니다. */
  function registerBannerAsset(filename, url, blob) {
    const id = "a" + Date.now() + Math.random().toString(16).slice(2);
    store.addAsset({
      id,
      filename,
      category: "히어로 배경",
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
  /** 배너 통합 핸들러 — file(직접 업로드)과 소재(materialUrls)/지시문 중 있는 대로
   *  조합해서 generateImage()에 넘깁니다. 지시문이 없고 file만 있으면(예전 동작
   *  그대로) AI 호출 없이 리사이즈+업로드만 합니다. */
  async function handleCatalogBannerGenerate(index, file) {
    const b = draft.catalogBanners[index];
    const materials = b.materialUrls || [];
    const instruction = b.instruction || "";
    if (!file && !materials.length) {
      toast("이미지를 업로드하거나, 소재를 하나 이상 추가해주세요");
      return;
    }
    draft.catalogBannerUploading = index;
    renderForm();
    try {
      let resultBlob;
      if (!instruction.trim() && file) {
        log(`배너 ${index + 1} 이미지 업로드 중... (${file.name})`);
        resultBlob = file;
      } else {
        log(`배너 ${index + 1} AI 생성 중... (소재 ${materials.length}개)`);
        resultBlob = await generateImage({ file, referenceUrls: materials, instruction, purpose: draft.seoTitle || "신상품카탈로그" });
      }
      const resized = await resizeImage(resultBlob, 1200);
      const filename = file?.name || `banner_${index + 1}.png`;
      const url = await uploadToS3(resized, filename, "LP");
      draft.catalogBanners[index].img = url;
      registerBannerAsset(filename, url, resized);
      log(`배너 ${index + 1} 완료: ${filename}`);
      rebuildCatalogHtml(); // 완료된 그룹들에 즉시 반영
    } catch (e) {
      log("오류: " + e.message);
      toast("배너 생성에 실패했습니다");
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
        el("button", { class: "btn btn-sm ghost", onclick: () => { navigator.clipboard?.writeText(indexFile.url); toast("링크를 복사했습니다"); } }, "복사")
      ]));
    }
    if (failed.length) {
      host.appendChild(el("p", { class: "hint" }, `배포 실패한 파일: ${failed.map(f => f.name).join(", ")}`));
    }
  }

  // ---------- 폼 섹션 ----------

  function resolveTemplate() {
    if ([CATALOG_TEMPLATE_ID, EVENT_LP_TEMPLATE_ID, ECONOMY_LINEUP_TEMPLATE_ID, EVOLUTION_TEMPLATE_ID].includes(draft.templateId)) return null;
    return LP_TEMPLATES.find(t => t.id === draft.templateId) || LP_TEMPLATES[0] || null;
  }

  function sectionTemplate() {
    const current = resolveTemplate();
    const isCatalog = draft.templateId === CATALOG_TEMPLATE_ID;
    const isEventLp = draft.templateId === EVENT_LP_TEMPLATE_ID;
    const isEconomyLineup = draft.templateId === ECONOMY_LINEUP_TEMPLATE_ID;
    const isEvolution = draft.templateId === EVOLUTION_TEMPLATE_ID;
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
          el("option", { value: CATALOG_TEMPLATE_ID, ...(isCatalog ? { selected: "selected" } : {}) }, "신상품카탈로그"),
          el("option", { value: EVENT_LP_TEMPLATE_ID, ...(isEventLp ? { selected: "selected" } : {}) }, "이벤트 LP"),
          el("option", { value: ECONOMY_LINEUP_TEMPLATE_ID, ...(isEconomyLineup ? { selected: "selected" } : {}) }, "경제형 전체상품 라인업"),
          el("option", { value: EVOLUTION_TEMPLATE_ID, ...(isEvolution ? { selected: "selected" } : {}) }, "미스미는 진화중! (기능 개선 안내)")
        ]),
        current ? el("p", { class: "hint" }, "블록: " + current.blocks.join(" → ")) : null,
        isEventLp ? el("p", { class: "hint hint-danger" },
          "🚫 실제로 확인됨: 이 페이지의 SSI include 구문(<!--#include virtual=...-->) 때문에 S3에 업로드 자체가 차단됩니다(보안 스캐너로 추정, 2026.08.21 콘솔에서 직접 재현 확인). 헤더/푸터가 안 붙는 문제 이전에, 업로드 시도 자체가 403으로 막힙니다. 개발팀이 웹서버 배치 방식을 확정하기 전까지 다운로드만 사용하세요."
        ) : null,
        isEconomyLineup ? el("p", { class: "hint hint-warn" },
          "⚠ 신상품카탈로그와 마찬가지로 상시 운영(계속 갱신)되는 페이지입니다. 다른 점은 구조 — 카탈로그는 그룹별 개별 페이지인 반면, 이건 PC메인/전체라인업/모바일/데이터(QA) 4개 뷰가 하나의 사이트를 이룹니다. 모바일은 SP 전용 CSS 미확보로 자리만 잡아둔 상태입니다. 이 페이지도 실제로는 SSI 셸에 얹히는 걸로 확인된 바 있어(경제형 실물 소스 검증 완료), 헤더/푸터 배포 방식은 이벤트 LP와 같은 사안입니다."
        ) : null,
        isEvolution ? el("p", { class: "hint hint-warn" },
          "⚠ 이 템플릿도 SSI 셸(헤더/푸터)에 얹히는 구조입니다 — 이벤트 LP·경제형 라인업과 같은 이유로 S3 배포는 막혀있고 다운로드만 지원합니다. 블록을 자유롭게 추가·삭제·순서변경할 수 있는 조합형 템플릿입니다."
        ) : null
      ])
    ]);
  }


  // ==========================================================================
  // 이벤트 LP — GENERATOR_SPEC.md 2절 콘텐츠 입력 스펙 그대로
  // ==========================================================================

  function sectionEventLpBasic() {
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [el("div", { class: "sec-hd-left" }, [el("span", { class: "sec-title" }, "기본 정보")])]),
      el("div", { class: "sec-body" }, [
        el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, ["slug ", el("span", { class: "req-tag" }, "· 필수")]),
          el("input", { type: "text", value: draft.slug || "", placeholder: "예: welcomeevent (경로: /pr/vona/<slug>/)", oninput: e => { draft.slug = e.target.value; renderPreview(); } })
        ]),
        el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, ["타이틀 ", el("span", { class: "req-tag" }, "· 필수")]),
          el("input", { type: "text", value: draft.title || "", placeholder: "｜MISUMI｜미스미 종합 Web 카탈로그 는 자동 부착", oninput: e => { draft.title = e.target.value; renderPreview(); } })
        ]),
        el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, "설명 (80자 이내)"),
          el("textarea", { oninput: e => { draft.description = e.target.value; renderPreview(); } }, draft.description || "")
        ]),
        el("div", { class: "field" }, [
          el("label", {}, "스킨"),
          el("div", { class: "row2" }, [
            el("div", { class: "opt-btn" + (draft.eventSkin !== "economy" ? " active" : ""), onclick: () => { draft.eventSkin = "normal"; renderForm(); renderPreview(); } }, "일반형 (950px)"),
            el("div", { class: "opt-btn" + (draft.eventSkin === "economy" ? " active" : ""), onclick: () => { draft.eventSkin = "economy"; renderForm(); renderPreview(); } }, "경제형 (920px, 컬러 다름)")
          ]),
          draft.eventSkin === "economy" ? el("p", { class: "hint hint-warn" }, "⚠ 경제형 스킨은 실제 사이트에서 카테고리 사이드 네비게이션(.ec-lnb)이 같이 붙는 것으로 확인됐습니다 — 이 생성기는 아직 그 블록을 안 만듭니다(개발팀 확인 중).") : null
        ])
      ])
    ]);
  }

  function sectionEventLpKv() {
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [el("div", { class: "sec-hd-left" }, [el("span", { class: "sec-title" }, "01. 메인 비주얼 (KV)")])]),
      el("div", { class: "sec-body" }, [
        el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, ["헤드라인 ", el("span", { class: "req-tag" }, "· 필수")]),
          el("input", { type: "text", value: draft.kvHeadline || "", placeholder: "강조는 <em>...</em> 하나만 (예: 최대 <em>5회</em> 구매 건별 혜택)", oninput: e => { draft.kvHeadline = e.target.value; renderPreview(); } })
        ]),
        el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, "배지 (선택, 비우면 미출력)"),
          el("input", { type: "text", value: draft.kvBadge || "", placeholder: "예: 경제형 구매 혜택", oninput: e => { draft.kvBadge = e.target.value; renderPreview(); } })
        ]),
        el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, "서브카피 (선택)"),
          el("input", { type: "text", value: draft.kvSubcopy || "", oninput: e => { draft.kvSubcopy = e.target.value; renderPreview(); } })
        ]),
        el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, ["이미지 URL 또는 업로드 ", el("span", { class: "req-tag" }, "· 필수")]),
          el("input", { type: "text", value: draft.kvImageUrl || "", placeholder: "일반형 950×300 / 경제형 920×300 기준", oninput: e => { draft.kvImageUrl = e.target.value; renderPreview(); } }),
          el("input", {
            type: "file", accept: "image/*",
            onchange: e => { if (e.target.files[0]) handleEventKvUpload(e.target.files[0]); }
          })
        ]),
        el("div", { class: "field" }, [
          el("label", {}, ["대체텍스트(alt) ", el("span", { class: "req-tag" }, "· 필수")]),
          el("input", { type: "text", value: draft.kvAlt || "", oninput: e => { draft.kvAlt = e.target.value; renderPreview(); } })
        ])
      ])
    ]);
  }

  async function handleEventKvUpload(file) {
    try {
      const resized = await resizeImage(file, 950);
      const url = await uploadToS3(resized, file.name, "LP");
      draft.kvImageUrl = url;
      log("KV 이미지 업로드 완료: " + file.name);
      renderForm(); renderPreview();
    } catch (e) {
      toast("이미지 업로드에 실패했습니다");
    }
  }

  function sectionEventLpSummary() {
    const rows = draft.summaryRows;
    const rowsHtml = rows.map((row, i) => el("div", { class: "field", style: "border-bottom:1px solid #f0f0f0;padding-bottom:8px;margin-bottom:8px;" }, [
      el("div", { class: "row2" }, [
        el("input", { type: "text", value: row.label, placeholder: "라벨 (8자 이내, 예: 대상)", oninput: e => { row.label = e.target.value; } }),
        el("input", { type: "text", value: row.value, placeholder: "값", oninput: e => { row.value = e.target.value; } })
      ]),
      el("label", { style: "display:flex;align-items:center;gap:6px;margin-top:6px;font-weight:400;" }, [
        el("input", {
          type: "checkbox", checked: row.emphasis ? "checked" : null,
          onchange: e => { rows.forEach(r => r.emphasis = false); row.emphasis = e.target.checked; renderForm(); renderPreview(); }
        }),
        "강조 (최대 1개)"
      ]),
      rows.length > 1 ? el("button", { class: "btn btn-sm ghost", onclick: () => { rows.splice(i, 1); renderForm(); renderPreview(); } }, "− 이 행 삭제") : null
    ]));
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [el("div", { class: "sec-hd-left" }, [el("span", { class: "sec-title" }, "02. 이벤트 요약표 (3~5행 권장)")])]),
      el("div", { class: "sec-body" }, [
        ...rowsHtml,
        rows.length < 6 ? el("button", { class: "btn btn-sm ghost", style: "width:100%;", onclick: () => { rows.push({ label: "", value: "", emphasis: false }); renderForm(); } }, "+ 행 추가") : null,
        el("p", { class: "hint" }, "6행 이상은 요약이 아니라 본문입니다 — 유의사항으로 내려주세요.")
      ])
    ]);
  }

  function sectionEventLpBenefits() {
    const items = draft.benefitItems;
    let typeLabel = "—", ruleLabel = "";
    try {
      const type = detectBenefitType(items);
      const layout = benefitLayoutRule(items.length);
      typeLabel = type === "tier" ? "구간형 (조건값이 금액·회차 형태 → 자동 판정)" : "나열형";
      ruleLabel = `${items.length}개 → 트랙 ${layout.tracks}개${layout.banner ? " (전폭 배너형)" : ""}`;
    } catch (e) {
      typeLabel = "—";
      ruleLabel = e.message;
    }
    const itemsHtml = items.map((item, i) => el("div", { class: "field", style: "border-bottom:1px solid #f0f0f0;padding-bottom:8px;margin-bottom:8px;" }, [
      el("input", {
        type: "text", value: item.condition || "", placeholder: "조건 (선택) — 금액형 '100,000원 이상' / 회차형 '3회차' / 나열형 라벨 '100% 증정'",
        oninput: e => { item.condition = e.target.value; renderForm(); },
        onblur: renderPreview
      }),
      el("input", { type: "text", value: item.title || "", placeholder: "혜택명 (필수)", style: "margin-top:6px;", oninput: e => { item.title = e.target.value; }, onblur: renderPreview }),
      el("input", {
        type: "text", value: (item.detail || []).join(", "), placeholder: "부가 항목 (쉼표 구분, 0~2개)", style: "margin-top:6px;",
        oninput: e => { item.detail = e.target.value.split(",").map(s => s.trim()).filter(Boolean); },
        onblur: renderPreview
      }),
      items.length > 1 ? el("button", { class: "btn btn-sm ghost", style: "margin-top:6px;", onclick: () => { items.splice(i, 1); renderForm(); renderPreview(); } }, "− 이 혜택 삭제") : null
    ]));
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [el("div", { class: "sec-hd-left" }, [el("span", { class: "sec-title" }, "03. 혜택 상세 (1~5개, 개수가 레이아웃을 결정)")])]),
      el("div", { class: "sec-body" }, [
        el("input", { type: "text", value: draft.benefitHeading || "", placeholder: "제목 (예: 이벤트 혜택)", oninput: e => { draft.benefitHeading = e.target.value; renderPreview(); } }),
        el("input", { type: "text", value: draft.benefitSubcopy || "", placeholder: "부제 (선택)", style: "margin-top:6px;margin-bottom:10px;", oninput: e => { draft.benefitSubcopy = e.target.value; renderPreview(); } }),
        ...itemsHtml,
        items.length < 5 ? el("button", { class: "btn btn-sm ghost", style: "width:100%;", onclick: () => { items.push({ condition: "", title: "", detail: [] }); renderForm(); } }, "+ 혜택 추가") : null,
        el("p", { class: "guideline-badge", style: "margin-top:10px;" }, `유형: ${typeLabel} · ${ruleLabel}`),
        el("p", { class: "hint" }, "나열형/구간형은 담당자가 고르는 게 아니라, 조건값이 금액·회차 패턴인지에 따라 자동으로 정해집니다.")
      ])
    ]);
  }

  function sectionEventLpSteps() {
    const items = draft.stepItems;
    const icons = ["cart", "click", "form", "upload", "check"];
    const itemsHtml = items.map((item, i) => el("div", { class: "field", style: "border-bottom:1px solid #f0f0f0;padding-bottom:8px;margin-bottom:8px;" }, [
      el("select", { onchange: e => { item.icon = e.target.value; renderPreview(); } }, icons.map(ic => el("option", { value: ic, ...(item.icon === ic ? { selected: "selected" } : {}) }, ic))),
      el("input", { type: "text", value: item.text || "", placeholder: "문구 (2줄 권장, <b>강조</b> 허용)", style: "margin-top:6px;", oninput: e => { item.text = e.target.value; }, onblur: renderPreview }),
      el("button", { class: "btn btn-sm ghost", style: "margin-top:6px;", onclick: () => { items.splice(i, 1); renderForm(); renderPreview(); } }, "− 삭제")
    ]));
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [el("div", { class: "sec-hd-left" }, [el("span", { class: "sec-title" }, "04. 참여 방법 (STEP, 선택 — 비우면 미출력, 3개 권장)")])]),
      el("div", { class: "sec-body" }, [
        el("input", { type: "text", value: draft.stepHeading || "", placeholder: "제목 (기본: 이벤트 참여 방법)", oninput: e => { draft.stepHeading = e.target.value; renderPreview(); } }),
        el("div", { style: "margin-top:10px;" }, itemsHtml),
        el("button", { class: "btn btn-sm ghost", style: "width:100%;", onclick: () => { items.push({ icon: "cart", text: "" }); renderForm(); } }, "+ STEP 추가"),
        items.length > 3 ? el("p", { class: "hint hint-warn" }, "⚠ 4개 이상이면 참여 장벽이 높다는 신호입니다 — 플로우를 줄이는 걸 권장합니다.") : null,
        el("input", { type: "text", value: draft.stepNote || "", placeholder: "하단 ※ 주석 (선택)", style: "margin-top:10px;", oninput: e => { draft.stepNote = e.target.value; renderPreview(); } })
      ])
    ]);
  }

  function sectionEventLpCta() {
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [el("div", { class: "sec-hd-left" }, [el("span", { class: "sec-title" }, "05. CTA (최대 2개)")])]),
      el("div", { class: "sec-body" }, [
        el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, ["전환 버튼 라벨 ", el("span", { class: "req-tag" }, "· 필수")]),
          el("input", { type: "text", value: draft.ctaPrimaryLabel || "", placeholder: "기본: 이벤트 응모하기", oninput: e => { draft.ctaPrimaryLabel = e.target.value; renderPreview(); } })
        ]),
        el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, ["전환 버튼 링크 ", el("span", { class: "req-tag" }, "· 필수")]),
          el("input", { type: "text", value: draft.ctaPrimaryHref || "", placeholder: "bid 등 추적 파라미터 포함", oninput: e => { draft.ctaPrimaryHref = e.target.value; renderPreview(); } })
        ]),
        el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, "보조 버튼 라벨 (선택 — 비우면 1버튼, 전환 버튼 중앙 정렬)"),
          el("input", { type: "text", value: draft.ctaSecondaryLabel || "", oninput: e => { draft.ctaSecondaryLabel = e.target.value; renderPreview(); } })
        ]),
        el("div", { class: "field" }, [
          el("label", {}, "보조 버튼 링크"),
          el("input", { type: "text", value: draft.ctaSecondaryHref || "", oninput: e => { draft.ctaSecondaryHref = e.target.value; renderPreview(); } })
        ])
      ])
    ]);
  }

  function sectionEventLpNotice() {
    const customs = draft.noticeCustom;
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [el("div", { class: "sec-hd-left" }, [el("span", { class: "sec-title" }, "06. 유의사항 (필수, include 안 함)")])]),
      el("div", { class: "sec-body" }, [
        el("input", { type: "text", value: draft.noticeHeading || "", placeholder: "제목 (기본: 응모 주의사항)", oninput: e => { draft.noticeHeading = e.target.value; renderPreview(); } }),
        el("p", { class: "hint", style: "margin-top:10px;" }, "공통 문구 마스터 (수정 불가 — 법무 확인 텍스트, 필요한 것만 체크):"),
        el("div", { style: "display:flex;flex-direction:column;gap:4px;margin:6px 0 12px;" }, NOTICE_COMMON_MASTER.map((line, i) =>
          el("label", { style: "display:flex;align-items:flex-start;gap:6px;font-size:11.5px;font-weight:400;line-height:1.5;" }, [
            el("input", {
              type: "checkbox", checked: (draft.noticeCommonIndexes || []).includes(i) ? "checked" : null,
              onchange: e => {
                const set = new Set(draft.noticeCommonIndexes || []);
                if (e.target.checked) set.add(i); else set.delete(i);
                draft.noticeCommonIndexes = [...set].sort();
                renderPreview();
              }
            }),
            el("span", {}, line)
          ])
        )),
        el("p", { class: "hint" }, "실제 캠페인엔 마스터에 없는 고유 문구가 여러 줄 필요한 게 일반적입니다. 법무 확인된 문구를 그대로 옮겨 적으세요:"),
        ...customs.map((line, i) => el("div", { style: "display:flex;gap:6px;margin-bottom:6px;" }, [
          el("input", { type: "text", value: line, style: "flex:1;", oninput: e => { customs[i] = e.target.value; }, onblur: renderPreview }),
          el("button", { class: "btn btn-sm ghost", onclick: () => { customs.splice(i, 1); renderForm(); renderPreview(); } }, "✕")
        ])),
        el("button", { class: "btn btn-sm ghost", style: "width:100%;", onclick: () => { customs.push(""); renderForm(); } }, "+ 고유 문구 추가"),
        el("p", { class: "hint", style: "margin-top:10px;" }, `※ "이벤트 관련 문의처 : event@misumi.co.kr"는 항상 마지막에 자동으로 붙습니다.`)
      ])
    ]);
  }

  // ==========================================================================
  // 경제형 전체상품 라인업 — 경제형_LP_템플릿_v2_dc.html 기준
  // ==========================================================================

  function sectionEconomyBasic() {
    const m = draft.economyMeta;
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [el("div", { class: "sec-hd-left" }, [el("span", { class: "sec-title" }, "기본 정보 (메타)")])]),
      el("div", { class: "sec-body" }, [
        el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, ["캠페인 코드 ", el("span", { class: "req-tag" }, "· 필수")]),
          el("input", { type: "text", value: m.campaign || "", placeholder: "예: KR260002", oninput: e => { m.campaign = e.target.value; renderPreview(); } })
        ]),
        el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, "bid 접두어 (기본: bid_kr_e)"),
          el("input", { type: "text", value: m.bidPrefix || "", oninput: e => { m.bidPrefix = e.target.value; renderPreview(); } })
        ]),
        el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, "정식 URL (canonical)"),
          el("input", { type: "text", value: m.canonical || "", placeholder: "https://kr.misumi-ec.com/pr/vona/economy/", oninput: e => { m.canonical = e.target.value; renderPreview(); } })
        ]),
        el("p", { class: "hint" }, "bid는 상품마다 직접 안 적어도 됩니다 — 캠페인 코드+접두어+배치 위치(메인 n / 카테고리 c / 대표상품 f)로 렌더 시점에 자동 생성됩니다.")
      ])
    ]);
  }

  function sectionEconomyUpload() {
    const products = draft.economyProducts || [];
    const issues = products.length ? economyLineupIssues(products) : [];
    const hasIssue = issues.some(i => i.count > 0);
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [el("div", { class: "sec-hd-left" }, [el("span", { class: "sec-title" }, "상품 데이터 업로드 (엑셀, 1행 = 상품 1개)")])]),
      el("div", { class: "sec-body" }, [
        el("p", { class: "hint" }, "열 순서: name · url · image · category · group(선택) · bid(선택, 비우면 자동생성) · isNew · featured · newArrival"),
        el("input", {
          type: "file", accept: ".xlsx,.xls",
          onchange: e => { if (e.target.files[0]) handleEconomyUpload(e.target.files[0]); }
        }),
        products.length ? el("p", { class: "guideline-badge", style: "margin-top:10px;" }, `${products.length}개 상품 업로드됨`) : null,
        products.length ? el("button", { class: "btn btn-sm ghost", style: "margin-top:6px;", onclick: () => { draft.economyView = "data"; renderForm(); renderPreview(); } }, "→ 데이터 검증 뷰로 확인하기") : null,
        hasIssue ? el("p", { class: "hint hint-warn" }, "⚠ 데이터 품질 문제가 발견됐습니다 — 아래 '뷰 전환'에서 '데이터(QA)'를 선택해 상세 내용을 확인하세요.") : null
      ])
    ]);
  }

  async function handleEconomyUpload(file) {
    if (typeof window === "undefined" || !window.XLSX) {
      toast("엑셀 업로드 기능을 불러오지 못했습니다");
      return;
    }
    try {
      const buf = await file.arrayBuffer();
      const wb = window.XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const toBool = v => /^(1|true|y|yes|o)$/i.test(String(v ?? "").trim());
      const parsed = rows
        .map((r, i) => ({
          id: "P" + String(i + 1).padStart(3, "0"),
          name: String(r[0] ?? "").trim(),
          url: String(r[1] ?? "").trim(),
          image: String(r[2] ?? "").trim(),
          category: String(r[3] ?? "").trim(),
          group: String(r[4] ?? "").trim(),
          bid: String(r[5] ?? "").trim(),
          isNew: toBool(r[6]),
          featured: toBool(r[7]),
          newArrival: toBool(r[8])
        }))
        .filter(r => r.name && r.url);

      if (!parsed.length) {
        toast("처리할 상품이 없습니다 — name/url 칸을 확인해주세요");
        return;
      }
      draft.economyProducts = parsed;
      // 엑셀에 등장한 카테고리 코드를 자동으로 카테고리 목록에 반영 (이름은 코드와 동일하게 시작, 수동 수정 가능)
      const seenCodes = new Set(draft.economyCategories.map(c => c.code));
      parsed.forEach(p => {
        if (p.category && !seenCodes.has(p.category)) {
          draft.economyCategories.push({ code: p.category, name: p.category });
          seenCodes.add(p.category);
        }
      });
      log(`경제형 상품 데이터 업로드 완료: ${parsed.length}개`);
      renderForm();
      renderPreview();
    } catch (e) {
      toast("엑셀 파일을 읽는 중 오류가 발생했습니다");
      log("오류: " + e.message);
    }
  }

  function sectionEconomyView() {
    const views = [
      { id: "main", label: "PC 메인" },
      { id: "all", label: "전체 라인업" },
      { id: "mobile", label: "모바일 (placeholder)" },
      { id: "data", label: "데이터 (QA)" }
    ];
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [el("div", { class: "sec-hd-left" }, [el("span", { class: "sec-title" }, "미리볼 뷰")])]),
      el("div", { class: "sec-body" }, [
        el("div", { class: "row2", style: "flex-wrap:wrap;" }, views.map(v =>
          el("div", {
            class: "opt-btn" + (draft.economyView === v.id ? " active" : ""),
            onclick: () => { draft.economyView = v.id; renderForm(); renderPreview(); }
          }, v.label)
        )),
        draft.economyView === "mobile" ? el("p", { class: "hint hint-warn", style: "margin-top:10px;" }, "⚠ SP 전용 CSS를 아직 못 받아서 레이아웃만 임시로 잡아둔 상태입니다 — PC용 데이터를 그대로 재사용합니다.") : null,
        el("p", { class: "hint", style: "margin-top:10px;" }, "실제 배포 시엔 PC메인=index.html, 전체라인업=economy_all.html처럼 뷰별로 별도 파일이 됩니다. '데이터' 뷰는 QA 확인용이라 배포 대상이 아닙니다.")
      ])
    ]);
  }

  // ==========================================================================
  // "미스미는 진화중!" — LP_템플릿_생성기_dc.html 기준. 블록 조합형이라 다른
  // 템플릿과 달리 필드가 고정돼 있지 않고, EVOLUTION_BLOCK_TYPES 정의를 그대로
  // 읽어서 폼을 그립니다(범용 필드 렌더러). 새 블록 타입이 추가돼도 이 파일을
  // 다시 고칠 필요 없이 blocksLP.js의 레지스트리만 늘리면 됩니다.
  // ==========================================================================

  function sectionEvolutionBasic() {
    const isLp = draft.evolutionPage === "lp";
    const m = isLp ? draft.evolutionMetaLp : draft.evolutionMetaHub;
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [el("div", { class: "sec-hd-left" }, [el("span", { class: "sec-title" }, "페이지 종류 · 기본 정보")])]),
      el("div", { class: "sec-body" }, [
        el("div", { class: "row2", style: "margin-bottom:10px;" }, [
          el("div", { class: "opt-btn" + (isLp ? " active" : ""), onclick: () => { draft.evolutionPage = "lp"; renderForm(); renderPreview(); } }, "LP 페이지"),
          el("div", { class: "opt-btn" + (!isLp ? " active" : ""), onclick: () => { draft.evolutionPage = "hub"; renderForm(); renderPreview(); } }, "허브 페이지")
        ]),
        el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, ["제목 (title / 브레드크럼) ", el("span", { class: "req-tag" }, "· 필수")]),
          el("input", { type: "text", value: m.title || "", oninput: e => { m.title = e.target.value; renderPreview(); } })
        ]),
        isLp ? el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, ["폴더명 (pr/new_feature/____/) ", el("span", { class: "req-tag" }, "· 필수")]),
          el("input", { type: "text", value: m.slug || "", placeholder: "예: stock_list", oninput: e => { m.slug = e.target.value; renderPreview(); } })
        ]) : null,
        el("div", { class: "field", style: "margin-bottom:10px;" }, [
          el("label", {}, "description"),
          el("textarea", { oninput: e => { m.desc = e.target.value; renderPreview(); } }, m.desc || "")
        ]),
        el("div", { class: "field" }, [
          el("label", {}, "keywords"),
          el("input", { type: "text", value: m.keywords || "", oninput: e => { m.keywords = e.target.value; } })
        ])
      ])
    ]);
  }

  function sectionEvolutionPalette() {
    const isLp = draft.evolutionPage === "lp";
    const types = Object.keys(EVOLUTION_BLOCK_TYPES).filter(k => EVOLUTION_BLOCK_TYPES[k].page === (isLp ? "lp" : "hub"));
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [el("div", { class: "sec-hd-left" }, [el("span", { class: "sec-title" }, "블록 추가")])]),
      el("div", { class: "sec-body" }, [
        el("div", { style: "display:flex;flex-wrap:wrap;gap:6px;" }, types.map(type =>
          el("button", {
            class: "btn btn-sm ghost",
            onclick: () => {
              const list = isLp ? draft.evolutionBlocksLp : draft.evolutionBlocksHub;
              list.push(evolutionBlockDefaults(type));
              renderForm(); renderPreview();
            }
          }, "+ " + EVOLUTION_BLOCK_TYPES[type].label)
        ))
      ])
    ]);
  }

  /** 필드 정의(t: text/html/mono/items) 하나를 실제 입력 엘리먼트로 그립니다.
   *  items 타입은 하위 항목(sub) 배열이라 sectionEvolutionBlocks에서 별도 처리합니다. */
  function evolutionFieldInput(field, value, onChange) {
    if (field.t === "text" || field.t === "mono") {
      return el("input", { type: "text", value: value || "", style: field.t === "mono" ? "font-family:ui-monospace,monospace;" : "", oninput: e => onChange(e.target.value) });
    }
    if (field.t === "html") {
      return el("textarea", { oninput: e => onChange(e.target.value) }, value || "");
    }
    return null;
  }

  function sectionEvolutionBlocks() {
    const isLp = draft.evolutionPage === "lp";
    const list = isLp ? draft.evolutionBlocksLp : draft.evolutionBlocksHub;
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [el("span", { class: "sec-title" }, "블록 편집")]),
        el("span", { style: "font-size:11px;color:#999;font-family:ui-monospace,monospace;" }, `${list.length} blocks`)
      ]),
      el("div", { class: "sec-body" }, list.length ? list.map((b, i) => {
        const def = EVOLUTION_BLOCK_TYPES[b.type];
        return el("div", { style: "border:1px solid #e3e5ea;border-radius:6px;margin-bottom:10px;overflow:hidden;" }, [
          el("div", { style: "display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fcfcfd;border-bottom:1px solid #eef0f3;" }, [
            el("span", { style: "width:20px;height:20px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#0f218b;color:#fff;border-radius:3px;font-size:11px;font-weight:700;" }, String(i + 1)),
            el("span", { style: "flex:1;font-size:13px;font-weight:700;" }, def.label),
            el("button", { class: "btn btn-sm ghost", disabled: i === 0 ? "disabled" : null, onclick: () => { [list[i - 1], list[i]] = [list[i], list[i - 1]]; renderForm(); renderPreview(); } }, "↑"),
            el("button", { class: "btn btn-sm ghost", disabled: i === list.length - 1 ? "disabled" : null, onclick: () => { [list[i], list[i + 1]] = [list[i + 1], list[i]]; renderForm(); renderPreview(); } }, "↓"),
            el("button", { class: "btn btn-sm ghost", onclick: () => { list.splice(i, 1); renderForm(); renderPreview(); } }, "✕")
          ]),
          el("div", { style: "padding:10px;display:flex;flex-direction:column;gap:9px;" }, def.fields.map(f => {
            if (f.t !== "items") {
              return el("div", {}, [
                el("div", { class: "hint", style: "margin-bottom:4px;" }, f.l),
                evolutionFieldInput(f, b[f.k], v => { b[f.k] = v; renderPreview(); })
              ]);
            }
            const items = b[f.k] || [];
            return el("div", {}, [
              el("div", { class: "hint", style: "margin-bottom:4px;" }, f.l),
              el("div", { style: "display:flex;flex-direction:column;gap:8px;" }, items.map((it, idx) =>
                el("div", { style: "border:1px dashed #d7dae1;border-radius:4px;padding:8px;background:#fff;" }, [
                  el("div", { style: "display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;" }, [
                    el("span", { style: "font-size:11px;font-weight:700;color:#0f218b;" }, String(idx + 1)),
                    el("button", { class: "btn btn-sm ghost", onclick: () => { items.splice(idx, 1); renderForm(); renderPreview(); } }, "삭제")
                  ]),
                  el("div", { style: "display:flex;flex-direction:column;gap:6px;" }, f.sub.map(sf =>
                    el("div", {}, [
                      el("div", { style: "font-size:10px;color:#8a90a0;margin-bottom:3px;" }, sf.l),
                      evolutionFieldInput(sf, it[sf.k], v => { it[sf.k] = v; renderPreview(); })
                    ])
                  ))
                ])
              )),
              el("button", { class: "btn btn-sm ghost", style: "align-self:flex-start;", onclick: () => { items.push(f.newItem(items.length + 1)); renderForm(); renderPreview(); } }, "+ 항목 추가")
            ]);
          }))
        ]);
      }) : [el("p", { class: "hint" }, "위에서 블록을 추가해주세요.")])
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
        el("p", { class: "hint hint-warn" },
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
    if (draft.templateId === EVENT_LP_TEMPLATE_ID) {
      renderEventLpPreview();
      return;
    }
    if (draft.templateId === ECONOMY_LINEUP_TEMPLATE_ID) {
      renderEconomyLineupPreview();
      return;
    }
    if (draft.templateId === EVOLUTION_TEMPLATE_ID) {
      renderEvolutionPreview();
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

  /** 경제형 라인업 미리보기 — 상품 데이터가 아직 없으면(초기 상태) 빈 화면
   *  대신 안내 문구를 보여줍니다. 실제 CSS 4개 파일은 미리보기 전용으로만
   *  인라인 삽입합니다(다운로드 산출물은 <link>만 유지 — 이벤트 LP와 동일). */
  function renderEconomyLineupPreview() {
    previewFrame.innerHTML = "";
    const usingSample = !draft.economyProducts.length;
    try {
      const data = usingSample ? economySampleData() : {
        meta: draft.economyMeta,
        products: draft.economyProducts,
        categories: draft.economyCategories,
        news: draft.economyNews,
        leadCards: draft.economyLeadCards,
        lnbLinks: draft.economyLnbLinks
      };
      const bodyHtml = assembleEconomyLineupHtml(data, draft.economyView);
      const sampleBanner = usingSample
        ? `<div style="position:sticky;top:0;z-index:999;background:#fff3cd;color:#7a5c00;padding:8px 16px;font-size:12px;text-align:center;">샘플 데이터 미리보기입니다 — 실제 상품 데이터를 엑셀로 업로드하면 이 자리가 실제 내용으로 바뀝니다</div>`
        : "";
      const previewHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${ECONOMY_LINEUP_PREVIEW_CSS}</style></head><body>${sampleBanner}${bodyHtml}</body></html>`;
      previewFrame.appendChild(el("iframe", { srcdoc: previewHtml }));

      const badge = root.querySelector("#genlp-guideline-badge");
      if (usingSample) {
        if (badge) { badge.className = "guideline-badge"; badge.textContent = "샘플 미리보기 — 실제 데이터 업로드 전"; }
        return;
      }
      const issues = economyLineupIssues(draft.economyProducts);
      const hasIssue = issues.some(i => i.count > 0);
      if (badge) {
        badge.className = hasIssue ? "guideline-badge badge-warn" : "guideline-badge badge-pass";
        badge.textContent = hasIssue
          ? "⚠ 데이터 품질 문제 있음 — '데이터(QA)' 뷰에서 확인하세요"
          : "✅ 데이터 검증 통과 (카테고리/bid/이미지/중복 URL 이상 없음)";
      }
    } catch (e) {
      previewFrame.appendChild(el("p", { class: "preview-error" }, e.message));
    }
  }

  /** Evolution 미리보기 — 실제 lp-common.css를 인라인 삽입(다운로드 산출물은
   *  <link>만 유지 — 이벤트 LP·경제형 라인업과 같은 이유). */
  function renderEvolutionPreview() {
    previewFrame.innerHTML = "";
    const isLp = draft.evolutionPage === "lp";
    const list = isLp ? draft.evolutionBlocksLp : draft.evolutionBlocksHub;
    if (!list.length) {
      previewFrame.appendChild(el("p", { class: "hint", style: "padding:40px;text-align:center;" }, "블록을 추가하면 미리보기가 나타납니다."));
      return;
    }
    try {
      const html = assembleEvolutionHtml(draft);
      const previewHtml = html.replace("</head>", `<style>${EVOLUTION_PREVIEW_CSS}</style></head>`);
      previewFrame.appendChild(el("iframe", { srcdoc: previewHtml }));
      const badge = root.querySelector("#genlp-guideline-badge");
      if (badge) { badge.className = "guideline-badge badge-pass"; badge.textContent = "✅ 조립 성공 (SSI 헤더/푸터는 실제 배포 서버에서만 채워짐 — 개발팀 확인 중)"; }
    } catch (e) {
      previewFrame.appendChild(el("p", { class: "preview-error" }, e.message));
    }
  }

  /** 이벤트 LP 미리보기 — 혜택 개수/조건값이 잘못돼(6개 이상 등) assembleEventLpHtml이
   *  예외를 던질 수 있어서, 그 경우 조립 실패 메시지를 미리보기 자리에 그대로 보여줍니다. */
  function renderEventLpPreview() {
    previewFrame.innerHTML = "";
    try {
      const html = assembleEventLpHtml(draft, currentSeoMeta());
      // ⚠️ assembleEventLpHtml()이 만드는 <link>는 실제 배포 후에나 존재하는
      // css/style_<날짜>.css 파일을 가리킵니다 — 아직 배포 전인 미리보기 단계에선
      // 그 파일이 어디에도 없어서, 그냥 iframe에 넣으면 레이아웃/색상이 하나도 안
      // 먹은 상태로 보입니다. 다운로드/배포용 산출물(html)은 스펙대로 "링크만"
      // 유지하고, 이 미리보기 iframe에만 실제 CSS를 <style>로 끼워 넣어서
      // 눈으로 확인 가능하게 합니다.
      const previewCss = buildEventLpCss(draft.eventSkin);
      const previewHtml = html.replace("</head>", `<style>${previewCss}</style></head>`);
      previewFrame.appendChild(el("iframe", { srcdoc: previewHtml }));
      latestGuidelineIssues = [];
      const badge = root.querySelector("#genlp-guideline-badge");
      if (badge) {
        badge.className = "guideline-badge badge-pass";
        badge.textContent = "✅ 조립 성공 (SSI 헤더/푸터는 실제 배포 서버에서만 채워짐 — 개발팀 확인 중)";
      }
    } catch (e) {
      previewFrame.appendChild(el("p", { class: "preview-error" }, e.message));
      const badge = root.querySelector("#genlp-guideline-badge");
      if (badge) { badge.className = "guideline-badge badge-fail"; badge.textContent = "❌ " + e.message; }
    }
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
    if (draft.templateId === ECONOMY_LINEUP_TEMPLATE_ID) {
      if (!draft.economyProducts.length) {
        toast("상품 데이터를 먼저 업로드해주세요");
        return;
      }
      const issues = economyLineupIssues(draft.economyProducts);
      const hasIssue = issues.some(i => i.count > 0);
      if (hasIssue && !confirm("데이터 품질 문제가 있습니다(카테고리 미지정/bid없음/이미지없음/URL중복 중 하나 이상). 그래도 다운로드할까요?")) return;
      const data = {
        meta: draft.economyMeta, products: draft.economyProducts, categories: draft.economyCategories,
        news: draft.economyNews, leadCards: draft.economyLeadCards, lnbLinks: draft.economyLnbLinks
      };
      // ⚠️ "데이터"/"모바일" 뷰는 QA·placeholder 용도라 배포 대상이 아니고,
      // 실제 사이트에 나가는 건 "PC메인"(index.html)과 "전체라인업"(economy_all.html) 뿐입니다.
      const files = [
        { name: "index.html", content: assembleEconomyLineupHtml(data, "main") },
        { name: "economy_all.html", content: assembleEconomyLineupHtml(data, "all") }
      ];
      const blob = buildZip(files);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "economy-lineup.zip";
      a.click();
      log("경제형 라인업 다운로드 완료 (index.html + economy_all.html, zip) — SSI 헤더/푸터는 별도 처리 필요");
      return;
    }
    if (draft.templateId === EVOLUTION_TEMPLATE_ID) {
      const isLp = draft.evolutionPage === "lp";
      const list = isLp ? draft.evolutionBlocksLp : draft.evolutionBlocksHub;
      if (!list.length) {
        toast("블록을 먼저 추가해주세요");
        return;
      }
      if (!confirm("이 페이지도 SSI include를 포함합니다 — S3에 그냥 올리면 헤더/푸터가 안 붙거나 업로드 자체가 막힐 수 있습니다. 웹서버(SSI 처리 가능)에 배치할 용도로만 사용하세요. 계속할까요?")) return;
      const html = assembleEvolutionHtml(draft);
      const blob = new Blob([html], { type: "text/html" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = (isLp ? (draft.evolutionMetaLp.slug || "evolution-lp") : "evolution-hub") + ".html";
      a.click();
      log("Evolution 페이지 다운로드 완료 (SSI include 포함 — 웹서버용)");
      return;
    }
    if (draft.templateId === EVENT_LP_TEMPLATE_ID) {
      let html;
      try {
        html = assembleEventLpHtml(draft, currentSeoMeta());
      } catch (e) {
        toast(e.message);
        return;
      }
      if (!confirm("⚠ 실제로 확인된 문제: 이 HTML의 SSI include 구문 때문에 S3에 그냥 업로드하면 (보안 스캐너로 추정) 업로드 자체가 403으로 차단됩니다 — 헤더/푸터가 안 붙는 것과는 별개로, 업로드 시도 자체가 막힙니다. 반드시 웹서버(SSI 처리 가능)에 배치하세요. 계속할까요?")) return;
      const css = buildEventLpCss(draft.eventSkin);
      // ⚠️ README "Target output" 규정: index.html은 css/style_<날짜>.css를 <link>로
      // 참조만 하고, 실제 CSS 규칙은 별도 파일이어야 합니다. 그래서 html 하나만
      // 다운로드하면 스타일이 하나도 안 먹은 페이지가 되므로, 두 파일을 zip으로
      // 같이 내려줍니다(신상품카탈로그의 buildZip()과 동일한 방식).
      const files = [
        { name: "index.html", content: html },
        { name: `style_${draft.cssVersion || "latest"}.css`, content: css }
      ];
      const blob = buildZip(files);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = (draft.slug || "event-lp") + ".zip";
      a.click();
      log("이벤트 LP 다운로드 완료 (index.html + style.css, zip) — SSI include 포함, 웹서버용");
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
    if (draft.templateId === ECONOMY_LINEUP_TEMPLATE_ID) {
      // ⚠️ 경제형 라인업도 실물 소스(경제형 구매혜택 이벤트 페이지) 검증 결과
      // SSI 셸에 얹히는 구조로 확인됐습니다 — 이벤트 LP와 같은 이유로 S3 배포를 막습니다.
      toast("경제형 라인업은 S3 배포를 지원하지 않습니다 — 이 페이지도 SSI 셸(헤더/사이드네비/푸터)에 얹히는 것으로 확인됐습니다. '내보내기 ▾'의 다운로드로 받아 웹서버에 직접 배치해주세요.");
      return;
    }
    if (draft.templateId === EVOLUTION_TEMPLATE_ID) {
      toast("이 템플릿도 S3 배포를 지원하지 않습니다 — SSI 셸(헤더/푸터)에 얹히는 구조입니다. '내보내기 ▾'의 다운로드로 받아 웹서버에 직접 배치해주세요.");
      return;
    }
    if (draft.templateId === EVENT_LP_TEMPLATE_ID) {
      // ⚠️ 이벤트 LP는 SSI로 공통 셸(헤더/푸터/사이드바)을 상속받는 부분 문서라,
      // S3에 단독으로 올리면 그 부분이 통째로 빠집니다. 실제 웹서버(SSI 처리 가능)에
      // 올려야 하는데 이 생성기는 그 배포 대상을 모릅니다 — 개발팀 확인 전까지는
      // "다운로드"만 지원하고 S3 배포는 막습니다.
      toast("이벤트 LP는 S3 배포를 지원하지 않습니다 — SSI include가 있으면 S3 업로드 자체가 차단되는 것을 실제로 확인했습니다(개발팀 확인 중). '내보내기 ▾'의 다운로드로 받아 웹서버에 직접 배치해주세요.");
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
      el("button", { class: "btn btn-sm ghost", onclick: () => { navigator.clipboard?.writeText(url); toast("링크를 복사했습니다"); } }, "복사")
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
    catalogBanners: [{ img: "", href: "", label: "", instruction: "", materialUrls: [] }],
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
    generating: false,
    // ---- 이벤트 LP (GENERATOR_SPEC.md 2절) ----
    slug: "",
    title: "",
    description: "",
    eventSkin: "normal",
    kvHeadline: "", kvBadge: "", kvSubcopy: "", kvImageUrl: "", kvAlt: "",
    summaryRows: [
      { label: "대상", value: "", emphasis: false },
      { label: "내용", value: "", emphasis: true },
      { label: "기간", value: "", emphasis: false },
      { label: "경품 발송일", value: "", emphasis: false }
    ],
    benefitHeading: "이벤트 혜택", benefitSubcopy: "",
    benefitItems: [{ condition: "", title: "", detail: [] }],
    stepHeading: "이벤트 참여 방법", stepItems: [], stepNote: "",
    ctaPrimaryLabel: "이벤트 응모하기", ctaPrimaryHref: "",
    ctaSecondaryLabel: "", ctaSecondaryHref: "",
    noticeHeading: "응모 주의사항", noticeCommonIndexes: [], noticeCustom: [],
    // ---- 경제형 전체상품 라인업 ----
    economyMeta: { campaign: "", bidPrefix: "bid_kr_e", canonical: "", lnbLogo: "", lnbBanner: "" },
    economyProducts: [],
    economyCategories: [],
    economyNews: [],
    economyLeadCards: [],
    economyLnbLinks: [],
    economyView: "main",
    // ---- 미스미는 진화중! (Evolution, 블록 조합형) ----
    evolutionPage: "lp",
    evolutionMetaLp: { title: "", slug: "", desc: "", keywords: "" },
    evolutionMetaHub: { title: "미스미는 진화중!", slug: "", desc: "미스미를 더 사용하기 쉽게. 고객님의 목소리를 바탕으로 개선한 내용을 안내해 드리고 있습니다.", keywords: "미스미 진화 중, 개선, 고객의 목소리" },
    evolutionBlocksLp: [],
    evolutionBlocksHub: []
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
