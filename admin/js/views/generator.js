import { store } from "../state.js";
import { el, toast, esc } from "../lib/dom.js";
import { navigate } from "../router.js";
import { generateCopy, regenerateField } from "../lib/copyGenerator.js";
import { assembleEdmHtml } from "../lib/blocks.js";
import { checkGuidelines, summarizeGuidelineIssues } from "../lib/guidelineCheck.js";
import { checkAllLinks, summarizeLinkResults } from "../lib/linkChecker.js";
import { fetchSeriesInfo } from "../lib/seriesApi.js";
import { EDM_TEMPLATE_FIELDS } from "../data/edmTemplateFields.js";

// ⚠️ 아키텍처 전환: "상품계/비상품계" 이분법과 "신규/육성/이탈예측" 세그먼트를 없애고,
// 실제 템플릿 18개가 실제로 갖는 "목적"(온보딩/육성/이탈방지/상품소개/쿠폰/내부영업) 하나로
// 통일했습니다. 이유: edm-no10(육성)에 상품그리드가 들어가는 등, "상품계냐 아니냐"와
// "목적이 뭐냐"는 서로 무관한 축이라는 게 실제 템플릿에서 확인됐기 때문입니다.
const PURPOSES = ["온보딩", "육성", "이탈방지", "상품소개", "쿠폰", "내부영업"];

export function renderGenerator(root, params) {
  const editId = params.get("id");
  const existing = editId ? store.getCampaign(editId) : null;
  const initialTemplateId = existing?.draftData?.templateId || params.get("template") || Object.keys(EDM_TEMPLATE_FIELDS)[0];

  const draft = buildInitialDraft(initialTemplateId, existing);

  root.appendChild(el("div", { class: "gen-app" }, [
    buildFormArea(),
    buildPreviewArea()
  ]));

  const formBody = root.querySelector("#gen-form-body");
  const previewFrame = root.querySelector("#gen-preview-frame-wrap");
  let latestGuidelineIssues = [];

  renderForm();
  renderPreview();

  function buildFormArea() {
    return el("section", { class: "gen-form-area" }, [
      el("div", { class: "gen-topbar" }, [
        el("a", { class: "gen-back", href: "#/campaigns" }, "← 캠페인 목록")
      ]),
      el("div", { class: "gen-form-header" }, [
        el("h1", {}, existing ? `EDM 생성기 · ${existing.name}` : "EDM 생성기"),
        el("p", { id: "gen-form-subtitle" }, "")
      ]),
      el("div", { class: "gen-form-body", id: "gen-form-body" }),
      el("div", { class: "gen-form-footer" }, [
        el("div", { class: "log-summary", id: "log-summary", onclick: toggleLogDetails }, [
          el("span", { class: "log-chevron", id: "log-chevron" }, "▸"),
          el("span", { class: "log-summary-text", id: "log-summary-text" }, "대기 중...")
        ]),
        el("div", { class: "log-details", id: "log-details", style: "display:none;" }),
        el("div", { id: "guideline-badge", class: "guideline-badge", onclick: toggleGuidelineDetails }, "가이드라인 확인 중..."),
        el("div", { id: "guideline-results", style: "display:none;" }),
        el("div", { class: "footer-btn-row" }, [
          el("div", { class: "export-dropdown" }, [
            el("button", { class: "btn primary export-btn", onclick: toggleExportMenu }, "내보내기 ▾"),
            el("div", { class: "export-menu", id: "export-menu", style: "display:none;" }, [
              el("button", { class: "export-menu-item", onclick: () => { closeExportMenu(); copyHtml(); } }, "HTML 복사"),
              el("button", { class: "export-menu-item", onclick: () => { closeExportMenu(); downloadHtml(); } }, "파일 다운로드")
            ])
          ]),
          el("button", { class: "btn", onclick: runLinkCheck }, "🔗 링크 확인")
        ]),
        el("div", { id: "link-check-results" }),
        el("button", { class: "btn ghost", style: "width:100%;", onclick: saveDraft }, "임시저장")
      ])
    ]);
  }

  function buildPreviewArea() {
    return el("section", { class: "gen-preview-area" }, [
      el("div", { class: "gen-preview-header" }, [
        el("h2", {}, "미리보기"),
        el("div", { class: "view-toggle" }, [
          el("button", { class: "active", id: "vt-desktop", onclick: () => setViewport("desktop") }, "🖥 데스크탑"),
          el("button", { id: "vt-mobile", onclick: () => setViewport("mobile") }, "📱 모바일")
        ])
      ]),
      el("div", { class: "preview-wrap", id: "gen-preview-wrap" }, [
        el("div", { class: "preview-frame", id: "gen-preview-frame-wrap" })
      ])
    ]);
  }

  function setViewport(mode) {
    root.querySelector("#gen-preview-wrap").classList.toggle("mobile", mode === "mobile");
    root.querySelector("#vt-desktop").classList.toggle("active", mode === "desktop");
    root.querySelector("#vt-mobile").classList.toggle("active", mode === "mobile");
  }

  let logHistory = [];
  function log(msg) {
    const t = new Date().toLocaleTimeString();
    logHistory.push(`[${t}] ${msg}`);
    const summaryEl = root.querySelector("#log-summary-text");
    if (summaryEl) summaryEl.textContent = msg;
    const detailsEl = root.querySelector("#log-details");
    if (detailsEl && detailsEl.style.display !== "none") renderLogDetails();
  }
  function renderLogDetails() {
    const detailsEl = root.querySelector("#log-details");
    detailsEl.textContent = logHistory.join("\n");
    detailsEl.scrollTop = detailsEl.scrollHeight;
  }
  function toggleLogDetails() {
    const detailsEl = root.querySelector("#log-details");
    const chevron = root.querySelector("#log-chevron");
    const isHidden = detailsEl.style.display === "none";
    if (isHidden) { renderLogDetails(); detailsEl.style.display = "block"; chevron.textContent = "▾"; }
    else { detailsEl.style.display = "none"; chevron.textContent = "▸"; }
  }
  function toggleExportMenu() {
    const menu = root.querySelector("#export-menu");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  }
  function closeExportMenu() {
    const menu = root.querySelector("#export-menu");
    if (menu) menu.style.display = "none";
  }

  function resolveTemplate() {
    return EDM_TEMPLATE_FIELDS[draft.templateId] || null;
  }
  function templateHasFieldType(type) {
    const t = resolveTemplate();
    return !!(t && t.fields.some(f => f.type === type));
  }
  function withGenSuffix(offerNo) {
    return offerNo.endsWith("_GEN") ? offerNo : `${offerNo}_GEN`;
  }
  function buildUtmQuery() {
    return `utm_source=misumi&utm_medium=email&utm_campaign=${encodeURIComponent(withGenSuffix(draft.offerNo || ""))}`;
  }
  function withUtm(url) {
    const q = buildUtmQuery();
    return `${url}${url.includes("?") ? "&" : "?"}${q}`;
  }

  function currentValues() {
    const t = resolveTemplate();
    if (!t) return {};
    const values = { ...draft.fieldValues };

    if (templateHasFieldType("coupon-field")) {
      const c = draft.coupon;
      values.coupon_value = c.value; values.coupon_max = c.max;
      values.coupon_target = c.target; values.coupon_note = c.note;
      values.coupon_code = c.code; values.coupon_expiry = c.expiry;
    }
    if (templateHasFieldType("product-field")) {
      draft.products.forEach((p, i) => {
        const n = i + 1;
        values[`seriesName_${n}`] = p.name;
        values[`price_${n}`] = p.price;
        values[`image_${n}`] = p.image;
        values[`brandName_${n}`] = p.brand || "MISUMI";
        values[`link_${n}`] = p.code ? withUtm(`https://kr.misumi-ec.com/vona2/detail/${encodeURIComponent(p.code)}/`) : "";
      });
    }
    // ⚠️ 비어있는 카피/링크/버튼 필드는 그냥 빈 칸(뭘 넣어야 할지 안 보임)이나 원본 {{변수명}}
    // (마케터에겐 의미 없는 코드로 보임) 대신, 친절한 라벨을 [ ]로 감싸서 보여줍니다 —
    // "여기에 뭘 넣어야 하는지" 미리보기만 보고도 바로 알 수 있게 하기 위함입니다.
    // 이미지/상품그리드/쿠폰 필드는 각자 자기만의 안내 문구(이미지 연동 예정 등)가 이미 있어서 제외합니다.
    for (const f of t.fields) {
      if (["text", "textarea", "link", "button-label"].includes(f.type) && !values[f.key]) {
        values[f.key] = `[${f.label}]`;
      }
    }
    for (const f of t.fields) {
      if (f.type === "link" && values[f.key] && !values[f.key].startsWith("[")) {
        values[f.key] = withUtm(values[f.key]);
      }
    }
    return values;
  }

  function renderForm() {
    formBody.innerHTML = "";
    const subtitle = root.querySelector("#gen-form-subtitle");
    const t = resolveTemplate();
    if (subtitle) subtitle.textContent = t ? `${t.purpose} · ${t.name}` : "";

    formBody.appendChild(sectionPromotionLink());
    formBody.appendChild(sectionPurposeAndTemplate());
    if (templateHasFieldType("product-field")) formBody.appendChild(sectionSeriesCodes());
    if (templateHasFieldType("coupon-field")) formBody.appendChild(sectionCoupon());
    formBody.appendChild(sectionAiPrompt());
    formBody.appendChild(sectionDynamicFields());
    formBody.appendChild(sectionOffer());
  }

  function sectionPromotionLink() {
    return el("div", { class: "field", style: "margin-bottom:14px;" }, [
      el("label", {}, "프로모션명 (선택)"),
      el("input", {
        type: "text", value: draft.promotionName || "",
        placeholder: "예: 2026년 7월 경제형 프로모션",
        oninput: e => { draft.promotionName = e.target.value; }
      }),
      el("p", { class: "hint" }, "같은 프로모션의 EDM/LP를 나중에 묶어보고 싶으면, 양쪽에 똑같은 이름을 입력하세요.")
    ]);
  }

  function sectionPurposeAndTemplate() {
    const t = resolveTemplate();
    const templatesForPurpose = Object.entries(EDM_TEMPLATE_FIELDS).filter(([, info]) => info.purpose === draft.purpose);
    return sectionWrap("①", "캠페인 목적 · 템플릿", "high", [
      el("div", { class: "seg-tabs" }, PURPOSES.map(p =>
        el("div", {
          class: "seg-tab" + (draft.purpose === p ? " active" : ""),
          onclick: () => {
            if (draft.purpose === p) return;
            draft.purpose = p;
            const firstOfPurpose = Object.entries(EDM_TEMPLATE_FIELDS).find(([, info]) => info.purpose === p);
            if (firstOfPurpose) switchTemplate(firstOfPurpose[0]);
          }
        }, [el("div", { class: "sn" }, p)])
      )),
      el("select", {
        style: "margin-top:10px;",
        onchange: e => switchTemplate(e.target.value)
      }, templatesForPurpose.map(([id, info]) =>
        el("option", { value: id, ...(id === draft.templateId ? { selected: "selected" } : {}) }, info.name)
      )),
      t ? el("p", { class: "hint" },
        `입력 항목 ${t.fields.filter(f => f.type !== "coupon-field" && f.type !== "product-field").length}개`
        + (templateHasFieldType("coupon-field") ? " + 쿠폰 정보" : "")
        + (templateHasFieldType("product-field") ? " + 상품 그리드(시리즈 코드 조회)" : "")) : null
    ]);
  }

  function switchTemplate(newId) {
    const oldFieldValues = draft.fieldValues;
    draft.templateId = newId;
    const newFields = EDM_TEMPLATE_FIELDS[newId]?.fields || [];
    const nextValues = {};
    for (const f of newFields) {
      if (oldFieldValues[f.key] !== undefined) nextValues[f.key] = oldFieldValues[f.key];
    }
    draft.fieldValues = nextValues;
    renderForm();
    renderPreview();
  }

  function sectionAiPrompt() {
    return sectionWrap("②", "AI 프롬프트", "ai", [
      el("div", { class: "field" }, [
        el("label", {}, "AI에게 요청할 내용 (선택 · 카피와 이미지 선택 양쪽에 함께 반영됩니다)"),
        el("textarea", {
          placeholder: "예: 20대 여성 타겟으로 캐주얼한 톤, 여름 프로모션 느낌의 이미지",
          oninput: e => { draft.aiPrompt = e.target.value; }
        }, draft.aiPrompt || "")
      ]),
      el("button", {
        class: "ai-btn", disabled: draft.generating ? "disabled" : null,
        onclick: runGenerateCopy
      }, draft.generating ? "생성 중..." : "✨ AI로 카피 자동 채우기")
    ]);
  }

  async function runGenerateCopy() {
    const t = resolveTemplate();
    if (!t) return;
    draft.generating = true;
    renderForm();
    log("AI 카피 생성 요청...");
    try {
      const textFieldKeys = t.fields.filter(f => ["text", "textarea", "button-label"].includes(f.type)).map(f => f.key);
      const result = await generateCopy(t.purpose, textFieldKeys, draft.aiPrompt);
      Object.assign(draft.fieldValues, result);
      log("AI 카피 생성 완료");
    } catch (e) {
      log("오류: " + e.message);
    } finally {
      draft.generating = false;
      renderForm();
      renderPreview();
    }
  }

  function sectionDynamicFields() {
    const t = resolveTemplate();
    if (!t) return el("div");
    const visibleFields = t.fields.filter(f => f.type !== "coupon-field" && f.type !== "product-field" && f.key !== "preheader");
    return sectionWrap("③", "카피 · 이미지 · 링크", "high", visibleFields.map(f => renderFieldInput(f)));
  }

  function renderFieldInput(f) {
    const value = draft.fieldValues[f.key] || "";
    const onChange = v => { draft.fieldValues[f.key] = v; renderPreview(); };

    if (f.type === "textarea") {
      return el("div", { class: "field" }, [
        el("label", {}, f.label),
        el("textarea", { oninput: e => onChange(e.target.value) }, value)
      ]);
    }
    if (f.type === "image") {
      return el("div", { class: "field" }, [
        el("label", {}, f.label),
        el("input", {
          type: "text", value, placeholder: "https://... (에셋 관리에서 URL을 복사해 붙여넣으세요)",
          oninput: e => onChange(e.target.value)
        })
      ]);
    }
    return el("div", { class: "field" }, [
      el("label", {}, f.label),
      el("input", { type: "text", value, oninput: e => onChange(e.target.value) })
    ]);
  }

  function sectionCoupon() {
    const c = draft.coupon;
    return sectionWrap("④", "쿠폰 정보", "high", [
      el("div", { class: "row2" }, [
        field("할인율/금액", c.value, v => { c.value = v; renderPreview(); }),
        field("최대 할인 금액", c.max, v => { c.max = v; renderPreview(); })
      ]),
      el("div", { class: "row2" }, [
        field("적용 대상", c.target, v => { c.target = v; renderPreview(); }),
        field("주의 문구", c.note, v => { c.note = v; renderPreview(); })
      ]),
      el("div", { class: "row2" }, [
        field("쿠폰 코드", c.code, v => { c.code = v; renderPreview(); }),
        field("사용 기한", c.expiry, v => { c.expiry = v; renderPreview(); })
      ]),
      el("p", { class: "hint" }, "※ 쿠폰 정보는 쿠폰 블록이 포함된 템플릿에서만 표시됩니다")
    ]);
  }

  function sectionSeriesCodes() {
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
    return sectionWrap("★", "시리즈 코드 입력 (최대 15개, 3×5)", "high", [
      grid,
      el("button", { class: "btn series-lookup-btn", onclick: lookupSeriesCodes }, "전체 조회 (상품 데이터 자동 불러오기)"),
      el("p", { class: "hint" }, "조회된 상품 데이터는 오른쪽 미리보기의 상품 그리드에 바로 반영됩니다.")
    ]);
  }

  async function lookupSeriesCodes() {
    const codes = draft.seriesCodes.map(c => String(c || "").trim()).filter(Boolean);
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

  function sectionOffer() {
    return sectionWrap("⑤", "오퍼번호", "high", [
      el("div", { class: "field" }, [
        el("input", { type: "text", value: draft.offerNo, oninput: e => { draft.offerNo = e.target.value; renderPreview(); } }),
        el("p", { class: "hint" }, `UTM에는 "${withGenSuffix(draft.offerNo || "")}"로 자동 저장됩니다 (이 생성기로 만든 캠페인임을 구분하기 위한 _GEN 접미사, 자동 부착)`)
      ])
    ]);
  }

  function field(label, value, onChange) {
    return el("div", { class: "field" }, [
      el("label", {}, label),
      el("input", { type: "text", value: value || "", oninput: e => onChange(e.target.value) })
    ]);
  }

  function sectionWrap(badge, title, kind, children) {
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [
          el("span", { class: "sec-badge" + (kind === "ai" ? " ai" : "") }, badge),
          el("span", { class: "sec-title" }, title)
        ])
      ]),
      el("div", { class: "sec-body" }, children)
    ]);
  }

  function renderPreview() {
    const html = assembleEdmHtml(draft.templateId, currentValues());
    previewFrame.innerHTML = "";
    const iframe = el("iframe", { srcdoc: html });
    // ⚠️ iframe은 기본적으로 안의 콘텐츠 길이에 맞춰 스스로 커지지 않아서, 고정 높이만
    // 줘두면 긴 템플릿은 내부 스크롤이 생겨 답답해 보입니다. 로드 완료 후 실제 콘텐츠
    // 높이를 측정해서 iframe 자체의 높이를 그만큼 맞춰줍니다 (짧은 템플릿은 짧게).
    iframe.addEventListener("load", () => {
      try {
        const h = iframe.contentWindow.document.documentElement.scrollHeight;
        iframe.style.height = Math.max(h, 300) + "px";
      } catch (e) { /* 크로스오리진 등의 이유로 측정 불가하면 기존 min-height 그대로 둠 */ }
    });
    previewFrame.appendChild(iframe);

    latestGuidelineIssues = checkGuidelines(html);
    const summary = summarizeGuidelineIssues(latestGuidelineIssues);
    const badge = root.querySelector("#guideline-badge");
    badge.className = "guideline-badge " + (latestGuidelineIssues.length === 0 ? "badge-pass" : summary.errors ? "badge-fail" : "badge-warn");
    badge.textContent = latestGuidelineIssues.length === 0
      ? "✅ 가이드라인 통과"
      : `${summary.errors ? "❌" : "⚠️"} 위반 ${summary.errors}건 · 경고 ${summary.warnings}건`;
  }

  function toggleGuidelineDetails() {
    const host = root.querySelector("#guideline-results");
    const isHidden = host.style.display === "none";
    if (isHidden) { renderGuidelineResults(latestGuidelineIssues, summarizeGuidelineIssues(latestGuidelineIssues)); host.style.display = "block"; }
    else host.style.display = "none";
  }

  function renderGuidelineResults(issues, summary) {
    const host = root.querySelector("#guideline-results");
    host.innerHTML = "";
    if (!issues.length) {
      host.appendChild(el("div", { class: "guide-result guide-pass" }, "✅ 코딩/디자인 가이드라인을 모두 통과했습니다"));
      return;
    }
    host.appendChild(el("div", { class: "guide-result " + (summary.errors ? "guide-fail" : "guide-warn") },
      summary.errors ? `❌ 위반 ${summary.errors}건 · 경고 ${summary.warnings}건 발견` : `⚠️ 경고 ${summary.warnings}건 발견`));
    host.appendChild(el("ul", { class: "guide-list" }, issues.map(i =>
      el("li", { class: "guide-item " + i.level }, [
        el("span", { class: "guide-badge " + i.level }, i.level === "error" ? "위반" : "경고"),
        el("span", {}, i.message)
      ])
    )));
  }

  async function runLinkCheck() {
    const html = assembleEdmHtml(draft.templateId, currentValues());
    log("링크/이미지 확인 중...");
    const results = await checkAllLinks(html);
    const summary = summarizeLinkResults(results);
    log(`링크/이미지 확인 완료 — 정상 ${summary.ok}건, 깨짐 ${summary.broken}건, 확인불가 ${summary.unknown}건`);
    renderLinkResults(results, summary);
  }

  function renderLinkResults(results, summary) {
    const host = root.querySelector("#link-check-results");
    host.innerHTML = "";
    if (!results.length) { host.appendChild(el("div", { class: "guide-result guide-pass" }, "확인할 외부 이미지/링크가 없습니다")); return; }
    host.appendChild(el("div", { class: "guide-result " + (summary.broken ? "guide-fail" : "guide-pass") },
      `정상 ${summary.ok}건 · 깨짐 ${summary.broken}건 · 확인불가(CORS) ${summary.unknown}건`));
  }

  function draftToCampaign() {
    const t = resolveTemplate();
    return {
      id: draft.id,
      name: (draft.fieldValues.copy_headline || draft.fieldValues.main_1 || t?.name || "EDM 캠페인").slice(0, 24),
      channel: "EDM",
      purpose: t?.purpose || "",
      templateName: t?.name || "",
      createdAt: existing ? existing.createdAt : new Date().toISOString().slice(0, 10).replace(/-/g, "."),
      promotionName: draft.promotionName || "",
      draftData: { ...draft }
    };
  }

  function saveDraft() {
    store.upsertCampaign(draftToCampaign());
    toast("임시저장했습니다");
    log("임시저장 완료");
  }

  async function confirmExportGuards(html) {
    const summary = summarizeGuidelineIssues(latestGuidelineIssues);
    if (summary.errors > 0) {
      if (!confirm(`가이드라인 위반 ${summary.errors}건이 있습니다. 그래도 진행하시겠습니까?`)) { log("내보내기 취소"); return false; }
    }
    log("내보내기 전 링크/이미지 확인 중...");
    const results = await checkAllLinks(html);
    renderLinkResults(results, summarizeLinkResults(results));
    const broken = results.filter(r => r.ok === false);
    if (broken.length) {
      if (!confirm(`깨진 링크/이미지가 ${broken.length}건 있습니다. 그래도 진행하시겠습니까?`)) { log("내보내기 취소"); return false; }
    }
    return true;
  }

  async function copyHtml() {
    const html = assembleEdmHtml(draft.templateId, currentValues());
    if (!(await confirmExportGuards(html))) return;
    navigator.clipboard?.writeText(html).then(
      () => { toast("HTML을 클립보드에 복사했습니다"); log("HTML 복사 완료"); },
      () => toast("복사에 실패했습니다")
    );
  }

  async function downloadHtml() {
    const html = assembleEdmHtml(draft.templateId, currentValues());
    if (!(await confirmExportGuards(html))) return;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (draft.fieldValues.copy_headline || "edm") + ".html";
    a.click();
    log("HTML 다운로드 완료");
  }
}

function buildInitialDraft(templateId, existing) {
  const t = EDM_TEMPLATE_FIELDS[templateId];
  const base = {
    id: existing?.id || "c" + Date.now(),
    promotionName: "",
    aiPrompt: "",
    purpose: t?.purpose || "온보딩",
    templateId,
    fieldValues: {},
    coupon: { value: "10%", max: "50,000", target: "전 상품 적용", note: "3만원 이상 구매 시", code: "KORWELCOME10", expiry: "2026.09.30" },
    seriesCodes: Array.from({ length: 15 }, () => ""),
    products: [],
    offerNo: "OFFER2026070",
    generating: false
  };
  if (existing?.draftData) {
    return { ...base, ...existing.draftData, id: base.id };
  }
  return base;
}
