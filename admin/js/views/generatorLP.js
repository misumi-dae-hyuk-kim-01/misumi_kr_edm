import { store } from "../state.js";
import { el, toast } from "../lib/dom.js";
import { generateCopyLP } from "../lib/copyGeneratorLP.js";
import { generateSeoMeta } from "../lib/seoMetaGenerator.js";
import { assembleLpHtml } from "../lib/blocksLP.js";
import { seedLpTemplates } from "../data/lpTemplates.js";
import { checkGuidelinesLP, summarizeGuidelineIssuesLP, LP_WIDTH_PATTERNS, DEPLOYMENT_COUNTRY } from "../lib/guidelineCheckLP.js";
import { checkAllLinks, summarizeLinkResults } from "../lib/linkChecker.js";

const LP_TEMPLATES = seedLpTemplates();

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

  function renderForm() {
    formBody.innerHTML = "";
    formBody.appendChild(sectionTemplate());
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

  // ---------- 폼 섹션 ----------

  function resolveTemplate() {
    return LP_TEMPLATES.find(t => t.id === draft.templateId) || LP_TEMPLATES[0] || null;
  }

  function sectionTemplate() {
    const current = resolveTemplate();
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [
          el("span", { class: "sec-badge" }, "①"),
          el("span", { class: "sec-title" }, "템플릿")
        ])
      ]),
      el("div", { class: "sec-body" }, [
        el("select", {
          onchange: e => { draft.templateId = e.target.value; renderPreview(); }
        }, LP_TEMPLATES.map(t =>
          el("option", { value: t.id, ...(t.id === draft.templateId ? { selected: "selected" } : {}) }, t.name)
        )),
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
        el("p", { class: "hint" }, "미리보기에 바로 반영됩니다 · 시리즈 API 연동 전까지는 플레이스홀더로 표시")
      ])
    ]);
  }

  async function lookupSeriesCodesLP() {
    const codes = draft.seriesCodes.filter(c => c && c.trim());
    if (!codes.length) { toast("시리즈 코드를 1개 이상 입력하세요"); return; }
    log(`시리즈 코드 ${codes.length}건 등록 중...`);
    // ⚠️ 실서비스 연동 지점: EDM의 lookupSeriesCodes()와 동일한 자리입니다. 개발팀이 EDM쪽에
    // seriesApi.js를 연동하면, 같은 fetchSeriesInfo()를 그대로 여기 import해서 쓰면 됩니다.
    // 지금은 API를 호출하지 않고 code만 채웁니다 — blocksLP.js가 나머지 필드를
    // "연동 예정" 플레이스홀더로 표시합니다.
    await new Promise(r => setTimeout(r, 400));
    draft.products = codes.map(code => ({ code }));
    log(`시리즈 코드 ${draft.products.length}건 등록 완료`);
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
    id: existing?.id || "lp" + Date.now(),
    promotionName: "",
    templateId: LP_TEMPLATES[0]?.id || "lp1",
    pageType: "일반형",
    widthPattern: 1200,
    breadcrumb: "",
    seriesCodes: Array.from({ length: 6 }, () => ""),
    products: [],
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
