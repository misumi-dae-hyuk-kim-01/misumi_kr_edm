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
// 실제 템플릿 18개가 실제로 갖는 "목적"(온보딩/육성/이탈방지/상품소개/쿠폰/내근영업) 하나로
// 통일했습니다. 이유: edm-no10(육성)에 상품그리드가 들어가는 등, "상품계냐 아니냐"와
// "목적이 뭐냐"는 서로 무관한 축이라는 게 실제 템플릿에서 확인됐기 때문입니다.
const PURPOSES = ["온보딩", "육성", "이탈방지", "상품소개", "쿠폰", "내근영업"];

export function renderGenerator(root, params) {
  const editId = params.get("id");
  let existing = editId ? store.getCampaign(editId) : null;
  const purposeParam = params.get("purpose");
  const firstTemplateOfPurpose = purposeParam
    ? Object.entries(EDM_TEMPLATE_FIELDS).find(([, info]) => info.purpose === purposeParam)?.[0]
    : null;
  const initialTemplateId = existing?.draftData?.templateId || params.get("template") || firstTemplateOfPurpose || Object.keys(EDM_TEMPLATE_FIELDS)[0];

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

  let previewDebounceTimer = null;
  // ⚠️ 카피를 타이핑할 때마다 renderPreview()가 즉시 실행되면 iframe이 매번 통째로
  // 새로 로드되어 심하게 깜박입니다. 입력을 잠깐(300ms) 멈춘 후에만 실제로 갱신하도록
  // 미룹니다 — 버튼 클릭 등 즉시 반영이 필요한 곳은 그대로 renderPreview()를 직접 씁니다.
  function schedulePreview() {
    clearTimeout(previewDebounceTimer);
    previewDebounceTimer = setTimeout(renderPreview, 300);
  }

  // 서브 카피/설명처럼 "있어도 없어도 되는" 필드인지 판단 — 이 기준으로만 개별
  // 사용/미사용 토글을 보여줍니다(모든 필드에 토글을 붙이면 화면이 복잡해짐).
  function isOptionalField(f) {
    return f.key.startsWith("sub_") || f.key.startsWith("desc_") || f.key === "copy_sub" || f.key === "copy_sub_strong";
  }
  // ⚠️ 그룹화 기준 전환: 처음엔 "필드 키의 숫자 접미사(_N)가 같으면 같은 섹션"으로 묶었는데,
  // NO.1처럼 "섹션 제목 1" 아래 이미지/카피가 1,2,3으로 3개 있고, 그 다음 "섹션 제목 2" 아래도
  // 다시 1,2,3,4로 번호가 재사용되는 템플릿에서는 완전히 틀리게 묶였습니다(이미지2,3이 엉뚱한
  // 섹션으로 흩어짐, 섹션 삭제가 일부만 지워짐). 대신 "문서 순서상 어떤 섹션 제목(c_headline_N)
  // 뒤에 나오는가"를 기준으로 묶습니다 — 섹션 제목이 나오면 새 그룹 시작, 다음 섹션 제목 전까지
  // 나오는 모든 필드(번호가 몇이든)가 그 그룹에 속합니다.
  function groupFieldsBySection(fields) {
    const groups = [{ name: "히어로", fields: [] }];
    let ctaGroup = null;
    for (const f of fields) {
      if (f.key.startsWith("cta_")) {
        if (!ctaGroup) { ctaGroup = { name: "CTA", sectionKey: "CTA", fields: [] }; groups.push(ctaGroup); }
        ctaGroup.fields.push(f);
        continue;
      }
      const headingMatch = f.key.match(/^c_headline_(\d+)$/);
      if (headingMatch) {
        groups.push({ name: `섹션 ${headingMatch[1]}`, sectionKey: parseInt(headingMatch[1], 10), fields: [f] });
        continue;
      }
      groups[groups.length - 1].fields.push(f);
    }
    return groups.filter(g => g.fields.length);
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
        values[`price_${n}`] = p.price ? `${p.price}원~` : ""; // 가격 뒤 "원~" 자동 부착
        values[`image_${n}`] = p.image;
        values[`image_${n}_alt`] = p.name || "상품 이미지";
        values[`brandName_${n}`] = p.brand || "MISUMI";
        values[`link_${n}`] = p.code ? withUtm(`https://kr.misumi-ec.com/vona2/detail/${encodeURIComponent(p.code)}/`) : "";
      });
    }
    for (const f of t.fields) {
      if (f.type === "image" && !values[`${f.key}_alt`]) {
        values[`${f.key}_alt`] = f.label;
      }
    }
    for (const f of t.fields) {
      if (["text", "textarea", "button-label"].includes(f.type) && !values[f.key]) {
        values[f.key] = `[${f.label}]`;
      }
    }
    // ⚠️ 링크는 다른 텍스트 필드와 다르게 처리합니다 — [링크 1] 같은 안내 문구를 href에
    // 그대로 넣으면, hover 시 브라우저가 "127.0.0.1:5500/[링크 1]"처럼 실제 URL인 척하는
    // 깨진 링크로 보여줘서 혼란스럽습니다. 빈 링크는 안전하게 href="#"만 넣고, "여기 링크가
    // 비어있다"는 안내는 같이 붙는 버튼 문구([버튼 문구 1] 등)가 이미 보여주고 있어 충분합니다.
    for (const f of t.fields) {
      if (f.type === "link") {
        values[f.key] = values[f.key] ? withUtm(values[f.key]) : "#";
      }
    }
    return values;
  }

  /** 삭제된 섹션/필드(hiddenRowKeys)와, 시리즈 코드 입력 개수를 넘는 상품 슬롯(hiddenCardKeys)을
   *  계산합니다. blocks.js가 이 목록을 받아서 해당 영역을 미리보기에서 통째로 제외합니다.
   *  ⚠️ "이 필드가 어느 섹션에 속하는가"는 필드 자신의 번호가 아니라, groupFieldsBySection()과
   *  똑같은 기준(문서 순서상 바로 앞의 c_headline_N)으로 판단해야 폼에서 보이는 그룹과
   *  실제로 숨겨지는 범위가 일치합니다 — 번호가 재사용되는 템플릿(NO.1 등)에서 특히 중요합니다. */
  function computeHiddenUnits() {
    const t = resolveTemplate();
    if (!t) return { hiddenRowKeys: [], hiddenCardKeys: [] };
    const hiddenRowKeys = [];
    const hiddenCardKeys = [];

    const nonProductFields = t.fields.filter(f => f.type !== "coupon-field" && f.type !== "product-field");
    const groups = groupFieldsBySection(nonProductFields);
    const sectionKeyByField = {};
    for (const g of groups) {
      if (g.sectionKey === undefined) continue;
      for (const f of g.fields) sectionKeyByField[f.key] = g.sectionKey;
    }

    for (const f of t.fields) {
      if (f.type === "coupon-field") continue;
      const secKey = sectionKeyByField[f.key];
      const sectionDeleted = secKey !== undefined && draft.hiddenSections.includes(secKey);
      const fieldDeleted = draft.hiddenFields.includes(f.key);
      if (f.type === "product-field") {
        if (f.key.startsWith("seriesName_") && (sectionDeleted || fieldDeleted)) hiddenCardKeys.push(f.key);
        continue;
      }
      if (sectionDeleted || fieldDeleted) hiddenRowKeys.push(f.key);
    }

    if (templateHasFieldType("product-field")) {
      const maxSlots = t.fields.filter(f => f.key.startsWith("seriesName_")).length;
      for (let n = draft.products.length + 1; n <= maxSlots; n++) {
        hiddenCardKeys.push(`seriesName_${n}`);
      }
    }
    return { hiddenRowKeys, hiddenCardKeys };
  }

  function groupHeader(label) {
    return el("div", { class: "form-group-header" }, label);
  }

  function renderForm() {
    formBody.innerHTML = "";
    const subtitle = root.querySelector("#gen-form-subtitle");
    const t = resolveTemplate();
    if (subtitle) subtitle.textContent = t ? `${t.purpose} · ${t.name}` : "";

    // 캠페인 설정: 한 번 정하면 되는 값들 (이 캠페인이 "뭔지" 정의)
    formBody.appendChild(groupHeader("캠페인 설정"));
    formBody.appendChild(sectionCampaignName());
    formBody.appendChild(sectionPromotionLink());
    formBody.appendChild(sectionPurposeAndTemplate());
    formBody.appendChild(sectionOffer());

    // 이메일 콘텐츠: 실제로 이메일 본문에 들어가는 것들. AI 프롬프트는 "설정값"이 아니라
    // 카피/이미지를 만들어내는 콘텐츠 제작 보조 도구라 여기 속합니다.
    formBody.appendChild(groupHeader("이메일 콘텐츠"));
    if (templateHasFieldType("product-field")) formBody.appendChild(sectionSeriesCodes());
    if (templateHasFieldType("coupon-field")) formBody.appendChild(sectionCoupon());
    formBody.appendChild(sectionAiPrompt());
    formBody.appendChild(sectionDynamicFields());
  }

  function sectionCampaignName() {
    return el("div", {}, [
      el("div", { class: "field", style: "margin-bottom:14px;" }, [
        el("label", {}, ["캠페인명 ", el("span", { class: "req-tag" }, "· 필수")]),
        el("input", {
          type: "text", value: draft.campaignName || "",
          placeholder: "예: 7월 웰컴 쿠폰 안내",
          oninput: e => { draft.campaignName = e.target.value; }
        }),
        el("p", { class: "hint" }, "캠페인 목록에서 이 이름으로 표시됩니다.")
      ]),
      el("div", { class: "field", style: "margin-bottom:14px;" }, [
        el("label", {}, ["작성자 ", el("span", { class: "req-tag" }, "· 필수")]),
        el("input", {
          type: "text", value: draft.author || "",
          placeholder: "예: 홍길동",
          oninput: e => { draft.author = e.target.value; }
        })
      ])
    ]);
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
    return sectionWrap(null, "캠페인 목적 · 템플릿", "high", [
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
        style: "margin-top:10px;width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #d0d0d0;border-radius:6px;font-size:12.5px;",
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
    // ⚠️ URL이 처음 들어왔을 때의 값에 계속 고정되어 있던 문제 때문에 template=edm-no06-nurture
    // 처럼 내부 코드명을 URL에 그대로 반영했었는데, 이 "no06" 같은 내부 코드명이 주소창에
    // 보이는 게 어색하다는 피드백을 받았습니다. 저장된 캠페인(id 있음)은 id만 있으면 어느
    // 템플릿인지 draftData에서 복원 가능하니 id만 남기고, 새 캠페인(id 없음)은 내부 코드
    // 대신 사람이 읽기 편한 "목적" 이름으로 표시합니다.
    const t = EDM_TEMPLATE_FIELDS[newId];
    const hash = editId
      ? `#/generator?id=${encodeURIComponent(editId)}`
      : `#/generator?purpose=${encodeURIComponent(t?.purpose || "온보딩")}`;
    history.replaceState(null, "", hash);
    renderForm();
    renderPreview();
  }

  function sectionAiPrompt() {
    return sectionWrap(null, "AI 프롬프트", "ai", [
      el("div", { class: "field" }, [
        el("label", {}, "AI에게 요청할 내용 (선택 · 카피와 이미지 선택 양쪽에 함께 반영됩니다)"),
        el("textarea", {
          placeholder: "예: 구매담당자 대상, 신뢰감 있는 톤으로 / FA·금형부품 신제품 카탈로그 강조",
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

  function toggleSwitch(checked, onChange) {
    return el("label", { class: "toggle-switch" }, [
      el("input", { type: "checkbox", checked: checked ? "checked" : null, onchange: e => onChange(e.target.checked) }),
      el("span", { class: "toggle-track" })
    ]);
  }

  function sectionDynamicFields() {
    const t = resolveTemplate();
    if (!t) return el("div");
    const visibleFields = t.fields.filter(f => f.type !== "coupon-field" && f.type !== "product-field" && f.key !== "preheader");
    const groups = groupFieldsBySection(visibleFields);

    return el("div", {}, groups.map((g, idx) => {
      const isDeleted = g.sectionKey !== undefined && draft.hiddenSections.includes(g.sectionKey);
      const headerExtra = g.sectionKey !== undefined
        ? el("div", { class: "sec-toggle-wrap" }, [
            el("span", { class: "sec-toggle-label" }, g.name === "CTA" ? "CTA 사용" : "섹션 사용"),
            toggleSwitch(!isDeleted, on => {
              if (on) draft.hiddenSections = draft.hiddenSections.filter(k => k !== g.sectionKey);
              else draft.hiddenSections = [...draft.hiddenSections, g.sectionKey];
              renderForm(); renderPreview();
            })
          ])
        : null;
      return sectionWrap(null, g.name, "high", [
        isDeleted
          ? el("p", { class: "hint" }, "이 섹션은 미리보기에서 제외됩니다.")
          : el("div", {}, g.fields.map(f => renderFieldInput(f)))
      ], isDeleted ? "sec-deleted" : "", headerExtra);
    }));
  }

  function renderFieldInput(f) {
    const value = draft.fieldValues[f.key] || "";
    const onChange = v => { draft.fieldValues[f.key] = v; schedulePreview(); };
    const optional = isOptionalField(f);
    const fieldDisabled = draft.hiddenFields.includes(f.key);

    const labelRow = optional
      ? el("label", { class: "field-label-row" }, [
          el("span", {}, [f.label, el("span", { class: "opt-tag" }, " · 선택")]),
          toggleSwitch(!fieldDisabled, on => {
            if (on) draft.hiddenFields = draft.hiddenFields.filter(k => k !== f.key);
            else draft.hiddenFields = [...draft.hiddenFields, f.key];
            renderForm(); renderPreview();
          })
        ])
      : el("label", {}, [f.label, !["image", "link", "button-label"].includes(f.type) ? el("span", { class: "req-tag" }, " · 필수") : null]);

    if (fieldDisabled) {
      return el("div", { class: "field" }, [
        labelRow,
        el("input", { type: "text", disabled: "disabled", placeholder: "사용 안 함 — 미리보기에서 이 줄이 제외됩니다" })
      ]);
    }
    if (f.type === "textarea") {
      return el("div", { class: "field" }, [labelRow, el("textarea", { oninput: e => onChange(e.target.value) }, value)]);
    }
    if (f.type === "image") {
      return el("div", { class: "field" }, [
        labelRow,
        el("input", { type: "text", value, placeholder: "https://... (에셋 관리에서 URL을 복사해 붙여넣으세요)", oninput: e => onChange(e.target.value) })
      ]);
    }
    return el("div", { class: "field" }, [labelRow, el("input", { type: "text", value, oninput: e => onChange(e.target.value) })]);
  }

  function sectionCoupon() {
    const c = draft.coupon;
    return sectionWrap(null, "쿠폰 정보", "high", [
      el("div", { class: "row2" }, [
        field("할인율/금액", c.value, v => { c.value = v; schedulePreview(); }),
        field("최대 할인 금액", c.max, v => { c.max = v; schedulePreview(); })
      ]),
      el("div", { class: "row2" }, [
        field("적용 대상", c.target, v => { c.target = v; schedulePreview(); }),
        field("주의 문구", c.note, v => { c.note = v; schedulePreview(); })
      ]),
      el("div", { class: "row2" }, [
        field("쿠폰 코드", c.code, v => { c.code = v; schedulePreview(); }),
        field("사용 기한", c.expiry, v => { c.expiry = v; schedulePreview(); })
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
    return sectionWrap(null, "시리즈 코드 입력 (최대 15개, 3×5)", "high", [
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
    return sectionWrap(null, "오퍼번호", "high", [
      el("div", { class: "field" }, [
        el("input", {
          type: "text", value: draft.offerNo, placeholder: "예: OFFER2026070",
          oninput: e => { draft.offerNo = e.target.value; schedulePreview(); }
        }),
        el("p", { class: "hint" }, draft.offerNo
          ? `UTM에는 "${withGenSuffix(draft.offerNo)}"로 자동 저장됩니다 (이 생성기로 만든 캠페인임을 구분하기 위한 _GEN 접미사, 자동 부착)`
          : "오퍼번호를 입력하면 UTM에 자동으로 반영됩니다 (뒤에 _GEN 접미사가 자동으로 붙습니다)")
      ])
    ]);
  }

  function field(label, value, onChange) {
    return el("div", { class: "field" }, [
      el("label", {}, label),
      el("input", { type: "text", value: value || "", oninput: e => onChange(e.target.value) })
    ]);
  }

  function sectionWrap(badge, title, kind, children, extraClass = "", headerExtra = null) {
    return el("div", { class: "sec" + (extraClass ? " " + extraClass : "") }, [
      el("div", { class: "sec-hd" }, [
        el("div", { class: "sec-hd-left" }, [
          badge ? el("span", { class: "sec-badge" + (kind === "ai" ? " ai" : "") }, badge) : null,
          el("span", { class: "sec-title" }, title)
        ]),
        headerExtra
      ]),
      el("div", { class: "sec-body" }, children)
    ]);
  }

  function renderPreview() {
    const { hiddenRowKeys, hiddenCardKeys } = computeHiddenUnits();
    const html = assembleEdmHtml(draft.templateId, currentValues(), { hiddenRowKeys, hiddenCardKeys });
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
    const { hiddenRowKeys, hiddenCardKeys } = computeHiddenUnits();
    const html = assembleEdmHtml(draft.templateId, currentValues(), { hiddenRowKeys, hiddenCardKeys });
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

  function draftToCampaign(statusOverride) {
    const t = resolveTemplate();
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
    return {
      id: draft.id,
      name: (draft.campaignName || "").trim() || "(캠페인명 미입력)",
      author: (draft.author || "").trim() || "(작성자 미입력)",
      channel: "EDM",
      purpose: t?.purpose || "",
      templateName: t?.name || "", // 목록엔 안 보이지만, 다른 용도로 쓸 수 있어 데이터는 유지
      status: statusOverride || existing?.status || "초안",
      createdAt: existing ? existing.createdAt : today, // 작성일: 최초 생성 시점, 이후 안 바뀜
      updatedAt: today, // 최종 수정일: 저장/내보내기마다 갱신
      promotionName: draft.promotionName || "",
      draftData: { ...draft }
    };
  }

  function persistCampaign(statusOverride) {
    const campaign = draftToCampaign(statusOverride);
    store.upsertCampaign(campaign);
    existing = campaign; // ⚠️ existing이 최초 진입 시점 값으로 고정돼 있으면, 내보내기로 "완료"
    // 상태를 저장한 뒤 다시 임시저장할 때 draftToCampaign()이 옛 existing.status(초안 등)를
    // 참조해서 "완료"가 "초안"으로 되돌아가는 버그가 생깁니다. 매번 저장할 때마다 최신값으로
    // 갱신해서 이 문제를 막습니다.
    return campaign;
  }

  function saveDraft() {
    persistCampaign();
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
    const { hiddenRowKeys, hiddenCardKeys } = computeHiddenUnits();
    const html = assembleEdmHtml(draft.templateId, currentValues(), { hiddenRowKeys, hiddenCardKeys });
    if (!(await confirmExportGuards(html))) return;
    navigator.clipboard?.writeText(html).then(
      () => {
        persistCampaign("완료");
        toast("HTML을 클립보드에 복사했습니다"); log("HTML 복사 완료 · 상태: 완료");
        renderForm();
      },
      () => toast("복사에 실패했습니다")
    );
  }

  async function downloadHtml() {
    const { hiddenRowKeys, hiddenCardKeys } = computeHiddenUnits();
    const html = assembleEdmHtml(draft.templateId, currentValues(), { hiddenRowKeys, hiddenCardKeys });
    if (!(await confirmExportGuards(html))) return;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (draft.fieldValues.copy_headline || "edm") + ".html";
    a.click();
    persistCampaign("완료");
    log("HTML 다운로드 완료 · 상태: 완료");
    renderForm();
  }
}

function buildInitialDraft(templateId, existing) {
  const t = EDM_TEMPLATE_FIELDS[templateId];
  const base = {
    id: existing?.id || "c" + Date.now(),
    campaignName: "",
    author: "",
    promotionName: "",
    aiPrompt: "",
    purpose: t?.purpose || "온보딩",
    templateId,
    fieldValues: {},
    hiddenSections: [],
    hiddenFields: [],
    coupon: { value: "10%", max: "50,000", target: "전 상품 적용", note: "3만원 이상 구매 시", code: "KORWELCOME10", expiry: "2026.09.30" },
    seriesCodes: Array.from({ length: 15 }, () => ""),
    products: [],
    offerNo: "",
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
