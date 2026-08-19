import { store } from "../state.js";
import { el, toast, esc } from "../lib/dom.js";
import { navigate } from "../router.js";
import { generateCopy, regenerateField } from "../lib/copyGenerator.js";
import { processImage } from "../lib/imageProcessApi.js";
import { resizeImage, EDM_IMAGE_MAX_DIM } from "../lib/imageResize.js";
import { uploadToS3 } from "../lib/s3Upload.js";
import { assembleEdmHtml } from "../lib/blocks.js";
import { checkGuidelines, summarizeGuidelineIssues } from "../lib/guidelineCheck.js";
import { checkAllLinks, summarizeLinkResults } from "../lib/linkChecker.js";
import { fetchSeriesInfo } from "../lib/seriesApi.js";
import { EDM_TEMPLATE_FIELDS } from "../data/edmTemplateFields.js";
import { EDM_TEMPLATE_HTML } from "../data/edmTemplateHtml.js";

// ⚠️ 아키텍처 전환: "상품계/비상품계" 이분법과 "신규/육성/이탈예측" 세그먼트를 없애고,
// 실제 템플릿 18개가 실제로 갖는 "목적"(온보딩/육성/이탈방지/상품소개/쿠폰/내근영업) 하나로
// 통일했습니다. 이유: edm-no10(육성)에 상품그리드가 들어가는 등, "상품계냐 아니냐"와
// "목적이 뭐냐"는 서로 무관한 축이라는 게 실제 템플릿에서 확인됐기 때문입니다.
const PURPOSES = ["온보딩", "육성", "이탈방지", "상품소개", "쿠폰", "내근영업"];
// "히어로 필드"로 보는 키 목록 — 이 목록에 없는 필드가 아직 제목(c_headline)도 나오기
// 전에 등장하면, 그건 히어로가 아니라 "제목 없는 콘텐츠 블록"(NO.16의 main_1/sub_1 같은
// [B08] 텍스트 블록)일 가능성이 높습니다. groupFieldsBySection()에서 사용합니다.
const HERO_FIELD_KEYS = new Set(["preheader", "copy_headline", "copy_sub", "copy_sub_strong", "customer_name", "rate"]);

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
  // ⚠️ "히어로 필드"로 보는 키 목록은 모듈 상단(HERO_FIELD_KEYS)에서 가져와 씁니다.

  function groupFieldsBySection(fields) {
    const groups = [{ name: "히어로", fields: [] }];
    let ctaGroup = null;
    let sectionCounter = 0;
    let leftPureHero = false; // 히어로 필드가 아닌 것이 한 번이라도 히어로 그룹에 들어갔는지
    for (const f of fields) {
      if (f.key.startsWith("cta_")) {
        if (!ctaGroup) { ctaGroup = { name: "CTA", sectionKey: "CTA", fields: [] }; groups.push(ctaGroup); }
        ctaGroup.fields.push(f);
        continue;
      }
      const headingMatch = f.key.match(/^c_headline_(\d+)$/);
      if (headingMatch) {
        sectionCounter++;
        groups.push({ name: `섹션 ${sectionCounter}`, sectionKey: sectionCounter, fields: [f] });
        continue;
      }
      if (f.key === "c_headline") {
        // ⚠️ 번호 없는 단일 제목이라도, 다른 템플릿과 똑같이 순번을 매겨 "섹션 N"으로 이름
        // 붙이고 토글도 달아줍니다 — 예전엔 "섹션이 하나뿐이면 토글 없음"이었는데, 굳이
        // 다르게 취급할 이유가 없고 오히려 템플릿마다 규칙이 달라 보여 혼란스러웠습니다.
        sectionCounter++;
        groups.push({ name: `섹션 ${sectionCounter}`, sectionKey: sectionCounter, fields: [f] });
        continue;
      }
      if (groups.length === 1 && !leftPureHero && !HERO_FIELD_KEYS.has(f.key)) {
        // ⚠️ 제목(c_headline) 없이 히어로 다음에 바로 오는 콘텐츠 블록(예: NO.16의
        // main_1/sub_1, [B08] 텍스트 블록)도 다른 섹션과 똑같이 "섹션 N" + 토글을 갖게
        // 합니다. removeSectionSpan 쪽은 제목 필드가 없으면 이 그룹의 첫 필드(main_1)를
        // 시작점으로 쓰도록 이미 되어 있어서(CTA와 동일한 방식), 별도 처리가 필요 없습니다.
        leftPureHero = true;
        sectionCounter++;
        groups.push({ name: `섹션 ${sectionCounter}`, sectionKey: sectionCounter, fields: [f] });
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
        values[`brandName_${n}`] = p.brandName || p.brand || "MISUMI";
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
    if (!t) return { hiddenRowKeys: [], hiddenCardKeys: [], hiddenSectionSpans: [] };
    const hiddenRowKeys = [];
    const hiddenCardKeys = [];
    const hiddenSectionSpans = [];

    const nonProductFields = t.fields.filter(f => f.type !== "coupon-field" && f.type !== "product-field");
    const groups = groupFieldsBySection(nonProductFields);
    const sectionKeyByField = {};
    for (const g of groups) {
      if (g.sectionKey === undefined) continue;
      for (const f of g.fields) sectionKeyByField[f.key] = g.sectionKey;
    }

    // ⚠️ 쿠폰 필드(coupon-field)는 별도의 "쿠폰 정보 입력" UI로 그리기 때문에 개별 필드
    // 토글/카드 삭제 대상에서는 제외하지만(아래 루프), 문서 안에서는 특정 섹션(c_headline_N)
    // 바로 아래에 물리적으로 위치합니다. 구간(span)의 "끝 지점"을 계산할 때 coupon-field를
    // 빼버리면 그 섹션의 span이 쿠폰 블록 앞에서 끊겨서, 섹션을 꺼도 쿠폰 블록만 덩그러니
    // 남는 문제가 있었습니다. 그래서 span 계산용 그룹핑에는 coupon-field를 포함시킵니다
    // (product-field만 제외 — 상품그리드는 항상 별도 템플릿이라 c_headline 섹션과 안 겹침).
    const fieldsForSpan = t.fields.filter(f => f.type !== "product-field");
    const spanGroups = groupFieldsBySection(fieldsForSpan);

    // ⚠️ 섹션 전체를 지울 때는 "제목(c_headline_N)부터 그 섹션의 마지막 필드까지"를
    // 구간(span)으로 통째로 잘라냅니다. 예전에는 필드/카드를 하나씩 따로 지웠는데,
    // 그 사이에 낀 여백/장식 행을 놓치면 빈 공간이 남는 문제가 있었습니다 — 구간을
    // 통째로 지우면 중간에 뭐가 있든 다 같이 사라져서 이 문제 자체가 생기지 않습니다.
    // CTA는 c_headline이 없지만, 이번 재설계에서 CTA 행도 다른 섹션과 똑같이 자기 여백을
    // 포함한 <tr><td class="pad"> 구조이므로, "제목" 대신 그룹의 첫 필드를 시작점으로 써서
    // 똑같이 구간 삭제합니다 — 안 그러면 버튼만 지워지고 위아래 여백 상자가 남습니다.
    const spanBySectionKey = {};
    for (const g of spanGroups) {
      if (g.sectionKey === undefined || !g.fields.length) continue;
      const headingField = g.fields.find(f => f.key.startsWith("c_headline")) || g.fields[0];
      const lastField = g.fields[g.fields.length - 1];
      spanBySectionKey[g.sectionKey] = { start: headingField.key, end: lastField.key, allKeys: g.fields.map(f => f.key) };
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
      if (!(sectionDeleted || fieldDeleted)) continue;
      if (sectionDeleted && spanBySectionKey[secKey]) continue; // 구간(span) 처리로 통째로 커버됨 (CTA 포함)
      hiddenRowKeys.push(f.key);
    }

    for (const secKey of draft.hiddenSections) {
      if (spanBySectionKey[secKey]) hiddenSectionSpans.push(spanBySectionKey[secKey]);
    }

    if (templateHasFieldType("product-field")) {
      const maxSlots = t.fields.filter(f => f.key.startsWith("seriesName_")).length;
      for (let n = draft.products.length + 1; n <= maxSlots; n++) {
        hiddenCardKeys.push(`seriesName_${n}`);
      }
    }
    return { hiddenRowKeys, hiddenCardKeys, hiddenSectionSpans };
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
        el("label", {}, "AI에게 요청할 내용 (선택 · 카피 생성에 반영됩니다)"),
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

  // ⚠️ 에셋 관리가 재사용 라이브러리가 되면서 "종류"(히어로 배경/본문 이미지) 필터로
  // 찾는 게 중요해졌는데, 생성기 업로드를 전부 "생성기 업로드"로 뭉뚱그리면 필터가
  // 안 먹힙니다. 판단 기준은 오직 "이 필드가 히어로 그룹 소속이냐"입니다 — 이미지 개수
  // 같은 건 무관합니다. (현재 18개 템플릿 중 히어로 그룹에 image 타입 필드를 둔 템플릿은
  // 없어서 지금은 항상 "본문 이미지"로 나오지만, 나중에 히어로에 이미지가 들어가는
  // 템플릿이 생기면 자동으로 "히어로 배경"으로 분류됩니다.)
  function inferImageCategory(key) {
    const t = resolveTemplate();
    if (!t) return "본문 이미지";
    const nonProduct = t.fields.filter(f => f.type !== "coupon-field" && f.type !== "product-field");
    const groups = groupFieldsBySection(nonProduct);
    const g = groups.find(grp => grp.fields.some(f => f.key === key));
    return g === groups[0] ? "히어로 배경" : "본문 이미지";
  }

  // ⚠️ 에셋 관리가 "재사용 라이브러리"로 바뀌면서, 생성기에서 업로드한 이미지도 여기서
  // 바로 찾아 다른 캠페인에 재사용할 수 있어야 합니다. 그래서 에셋 목록에도 같이 등록합니다.
  function registerAsset(key, filename, url, blob, instruction, aiProcessed) {
    const id = "a" + Date.now() + Math.random().toString(16).slice(2);
    store.addAsset({
      id,
      filename,
      category: inferImageCategory(key),
      uploadedAt: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
      variants: { EDM: { url, sizeKB: Math.round((blob?.size || 0) / 1024), isDemoUrl: !url.startsWith("http") } },
      source: "generator",
      aiProcessed,
      instruction
    });
    return id;
  }

  // ⚠️ 이미지 슬롯 폭은 템플릿/위치마다 다릅니다(71px 짜리 6열 그리드부터 552px 짜리 단독
  // 이미지까지). 전부 600px(EDM 전체 폭)로 리사이징하면 좁은 슬롯엔 필요 이상으로 큰
  // 파일을 만들게 됩니다. raw HTML에서 그 필드 바로 앞에 나오는 width="N"을 읽어와서
  // 실제 슬롯 폭에 맞춰 리사이징합니다. 못 찾으면(상품그리드 등) EDM 표준폭으로 대신합니다.
  function inferImageMaxWidth(key) {
    const html = EDM_TEMPLATE_HTML[draft.templateId];
    if (!html) return EDM_IMAGE_MAX_DIM;
    const idx = html.indexOf(`{{${key}}}`);
    if (idx === -1) return EDM_IMAGE_MAX_DIM;
    const before = html.slice(Math.max(0, idx - 400), idx);
    const matches = [...before.matchAll(/width="(\d+)"/g)];
    if (!matches.length) return EDM_IMAGE_MAX_DIM;
    const w = parseInt(matches[matches.length - 1][1], 10);
    return w > 0 ? w : EDM_IMAGE_MAX_DIM;
  }

  async function handleImageUpload(key, file) {
    draft.imageUploading = key;
    renderForm();
    const t = resolveTemplate();
    const instruction = (draft.imageMeta[key] || {}).instruction || "";
    try {
      // 이 필드가 실제로 들어가는 슬롯의 폭에 맞춰 리사이징합니다 (원본을 그대로 보내면
      // 이메일 용량만 커지고, 좁은 슬롯엔 화질 이득도 없음).
      const resized = await resizeImage(file, inferImageMaxWidth(key));
      let url, aiProcessed;
      if (instruction.trim()) {
        log(`이미지 업로드 · AI 가공 요청 중... (${file.name})`);
        url = await processImage(resized, instruction, t?.purpose);
        aiProcessed = true;
      } else {
        // 보정 요청이 비어있으면 AI 가공 자체를 건너뛰고 리사이징 후 그냥 업로드만 합니다.
        log(`이미지 업로드 중... (${file.name})`);
        url = await uploadToS3(resized, file.name, "EDM");
        aiProcessed = false;
      }
      draft.fieldValues[key] = url;
      // fileBlob을 남겨두면, 지금 이미지를 다시 선택할 필요 없이 "나중에 보정 요청"이
      // 가능해집니다. Blob은 JSON으로 저장되지 않으니 새로고침하면 사라지고, 그땐
      // "다시 업로드"로 원본을 다시 선택해야 합니다 — 세션 중 편의 기능입니다.
      draft.imageMeta[key] = { filename: file.name, processed: true, instruction, aiProcessed, fileBlob: resized };
      draft.imageMeta[key].assetId = registerAsset(key, file.name, url, resized, instruction, aiProcessed);
      log(aiProcessed ? `이미지 가공 완료: ${file.name}` : `이미지 업로드 완료: ${file.name}`);
    } catch (e) {
      log("오류: " + e.message);
    } finally {
      draft.imageUploading = null;
      renderForm();
      renderPreview();
    }
  }

  /** 이미 업로드된 이미지에 보정을 요청(또는 재요청)합니다. 원본을 다시 선택할 필요 없이,
   *  업로드 때 남겨둔 fileBlob으로 다시 AI 가공을 겁니다. */
  async function handleRecorrect(key) {
    const meta = draft.imageMeta[key] || {};
    if (!meta.fileBlob || !meta.newInstruction?.trim()) return;
    draft.imageUploading = key;
    renderForm();
    const t = resolveTemplate();
    log(`보정 재요청 중... (${meta.filename})`);
    try {
      const url = await processImage(meta.fileBlob, meta.newInstruction, t?.purpose);
      draft.fieldValues[key] = url;
      // 재보정한 새 버전만 남기고, 이 필드의 예전 버전 에셋은 지웁니다 — 안 그러면 보정을
      // 시도할 때마다 안 쓰는 예전 이미지가 에셋 목록에 계속 쌓입니다.
      if (meta.assetId) store.deleteAsset(meta.assetId);
      const newAssetId = registerAsset(key, meta.filename, url, meta.fileBlob, meta.newInstruction, true);
      draft.imageMeta[key] = { ...meta, instruction: meta.newInstruction, newInstruction: "", aiProcessed: true, processed: true, assetId: newAssetId };
      log(`보정 완료: ${meta.filename}`);
    } catch (e) {
      log("오류: " + e.message);
    } finally {
      draft.imageUploading = null;
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
    // ⚠️ customer_name은 마케터가 입력하는 값이 아니라 발송 시스템(ESP)이 수신자별로 채우는
    // 병합 태그입니다(blocks.js가 절대 치환하지 않고 {{customer_name}}을 그대로 남김). 폼에
    // 편집 가능한 입력창으로 노출하면 값을 입력해도 실제로는 반영되지 않아 혼란만 줍니다.
    const visibleFields = t.fields.filter(f => f.type !== "coupon-field" && f.type !== "product-field" && f.key !== "preheader" && f.key !== "customer_name");
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
      const meta = draft.imageMeta[f.key] || {};
      const uploading = draft.imageUploading === f.key;

      // 완료 상태 — 썸네일 + 배지 + 다시 업로드/URL 전환 + (가능하면) 추가 보정 요청
      if (value && meta.processed) {
        return el("div", { class: "field" }, [
          labelRow,
          el("div", { class: "image-field-filled" }, [
            el("img", { src: value, alt: "", class: "image-field-thumb" }),
            el("div", { class: "image-field-info" }, [
              el("p", { class: "image-field-name" }, meta.filename || "이미지"),
              el("span", { class: "badge " + (meta.aiProcessed ? "green" : "blue") }, meta.aiProcessed ? "AI 보정 완료" : "업로드 완료"),
              el("span", { class: "badge blue" }, "S3 저장됨")
            ])
          ]),
          meta.instruction ? el("p", { class: "hint" }, `요청한 보정: "${meta.instruction}"`) : null,
          meta.fileBlob ? el("div", { class: "field-with-regen", style: "margin:6px 0;" }, [
            el("input", {
              type: "text", value: meta.newInstruction || "", style: "flex:1;min-width:0;",
              placeholder: "보정 요청 추가 · 예: 배경을 더 어둡게",
              oninput: e => { draft.imageMeta[f.key] = { ...draft.imageMeta[f.key], newInstruction: e.target.value }; }
            }),
            el("button", {
              class: "btn btn-sm", style: "flex-shrink:0;white-space:nowrap;", disabled: uploading ? "disabled" : null,
              onclick: () => handleRecorrect(f.key)
            }, uploading ? "처리 중..." : "보정 요청")
          ]) : null,
          el("div", { class: "row2" }, [
            el("button", { class: "btn btn-sm", onclick: () => { draft.imageMeta[f.key] = {}; onChange(""); renderForm(); } }, "다시 업로드"),
            el("button", { class: "btn btn-sm ghost", onclick: () => { draft.imageMeta[f.key] = { urlMode: true }; renderForm(); } }, "URL 직접 입력")
          ])
        ]);
      }

      // URL 직접 입력 상태 — CLI로 만든 링크 등을 그대로 붙여넣는 기존 경로
      if (meta.urlMode || (value && !meta.processed)) {
        return el("div", { class: "field" }, [
          labelRow,
          el("input", { type: "text", value, placeholder: "https://... (CLI로 만든 링크 등 붙여넣기)", oninput: e => onChange(e.target.value) }),
          el("button", { class: "btn btn-sm ghost", onclick: () => { draft.imageMeta[f.key] = {}; renderForm(); } }, "업로드로 전환")
        ]);
      }

      // 비어있음 — 업로드 유도 (보정 요청은 선택 사항, 한 줄로 압축)
      return el("div", { class: "field" }, [
        labelRow,
        el("input", {
          type: "text", value: meta.instruction || "",
          placeholder: "보정 요청 (선택) · 예: 배경 제거, 제품 중앙 정렬",
          oninput: e => { draft.imageMeta[f.key] = { ...draft.imageMeta[f.key], instruction: e.target.value }; }
        }),
        el("div", { class: "image-upload-row" }, [
          el("label", { class: "btn btn-sm upload-label" }, [
            uploading ? "AI로 이미지 가공 중..." : "이미지 업로드",
            el("input", {
              type: "file", accept: "image/*", style: "display:none;", disabled: uploading ? "disabled" : null,
              onchange: e => { if (e.target.files[0]) handleImageUpload(f.key, e.target.files[0]); }
            })
          ]),
          el("button", { class: "btn btn-sm", onclick: () => { draft.imageMeta[f.key] = { ...draft.imageMeta[f.key], urlMode: true }; renderForm(); } }, "URL 직접 입력")
        ])
      ]);
    }
    return el("div", { class: "field" }, [labelRow, el("input", { type: "text", value, oninput: e => onChange(e.target.value) })]);
  }

  function sectionCoupon() {
    const c = draft.coupon;
    return sectionWrap(null, "쿠폰 정보", "high", [
      el("div", { class: "row2" }, [
        field("할인율/금액", c.value, v => { c.value = v; schedulePreview(); }),
        field("최대 할인 금액 (단위 포함, 예: 50,000원)", c.max, v => { c.max = v; schedulePreview(); })
      ]),
      el("div", { class: "row2" }, [
        field("적용 대상", c.target, v => { c.target = v; schedulePreview(); }),
        field("주의 문구", c.note, v => { c.note = v; schedulePreview(); })
      ]),
      el("div", { class: "row2" }, [
        field("쿠폰 코드 (최대 9자)", c.code, v => { c.code = v.slice(0, 9); schedulePreview(); }, { maxlength: 9 }),
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
      el("div", { class: "row2" }, [
        el("button", { class: "btn series-lookup-btn", onclick: lookupSeriesCodes }, "전체 조회"),
        el("label", { class: "btn upload-label" }, [
          "엑셀 업로드",
          el("input", {
            type: "file", accept: ".xlsx,.xls,.csv", style: "display:none;",
            onchange: e => { if (e.target.files[0]) handleSeriesExcelUpload(e.target.files[0]); }
          })
        ])
      ]),
      el("p", { class: "hint" }, "상품 데이터 자동 조회 · 엑셀은 1열 시리즈코드, 2열(선택) 가격(조회 결과에 가격 없을 때만 사용) · 조회 결과는 미리보기에 바로 반영됩니다.")
    ]);
  }

  /** 엑셀/CSV 첫 번째 열에서 시리즈 코드를 읽어와 15칸에 채우고, 곧바로 전체 조회를 실행합니다. */
  // ⚠️ API로 조회된 가격은 seriesApi.js의 formatPrice()가 toLocaleString()으로 천단위
  // 쉼표를 넣어줍니다. 엑셀로 직접 입력한 가격도 같은 형식으로 맞춰야 나란히 봤을 때
  // 표기가 안 어긋납니다 — 사용자가 "15000"이든 "15,000"이든 숫자만 뽑아 다시 포맷합니다.
  function formatPriceComma(rawPrice) {
    const num = parseInt(String(rawPrice).replace(/[^\d]/g, ""), 10);
    return Number.isFinite(num) ? num.toLocaleString() : rawPrice;
  }

  async function handleSeriesExcelUpload(file) {
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
      // 첫 번째 열에서 값을 뽑고, 숫자가 하나도 없는 행(헤더 텍스트 등)은 걸러냅니다 —
      // 시리즈 코드는 항상 숫자를 포함하는 형식이라 이 정도 필터로 충분합니다.
      // 두 번째 열이 있으면 "이 코드는 조회 결과에 가격이 없을 때 쓸 수동 가격"으로 보관합니다.
      const priceByCode = {};
      const codes = [];
      for (const r of rows) {
        const code = String(r[0] ?? "").trim();
        if (!code || !/\d/.test(code)) continue;
        codes.push(code);
        const price = String(r[1] ?? "").trim();
        if (price) priceByCode[code] = formatPriceComma(price);
      }
      if (!codes.length) { toast("엑셀에서 시리즈 코드를 찾지 못했습니다"); return; }
      const trimmed = codes.slice(0, 15);
      if (codes.length > 15) log(`⚠ 엑셀에 ${codes.length}개가 있어 처음 15개만 반영했습니다 (3×5 한도)`);
      draft.seriesCodes = Array.from({ length: 15 }, (_, i) => trimmed[i] || "");
      draft.seriesPriceOverrides = priceByCode;
      const priceCount = Object.keys(priceByCode).length;
      log(`엑셀에서 시리즈 코드 ${trimmed.length}건을 불러왔습니다${priceCount ? ` (수동 가격 ${priceCount}건 포함)` : ""}`);
      renderForm();
      await lookupSeriesCodes();
    } catch (e) {
      toast("엑셀 파일을 읽는 중 오류가 발생했습니다");
      log("오류: " + e.message);
    }
  }

  async function lookupSeriesCodes() {
    const codes = draft.seriesCodes.map(c => String(c || "").trim()).filter(Boolean);
    if (!codes.length) { toast("시리즈 코드를 1개 이상 입력하세요"); return; }
    log(`시리즈 코드 ${codes.length}건 조회 중...`);
    const results = await Promise.all(codes.map(async code => {
      try {
        const product = await fetchSeriesInfo(code);
        // API 조회 결과에 가격이 없으면, 엑셀 업로드 때 미리 넣어둔 수동 가격으로 대신합니다.
        if (!product.price && draft.seriesPriceOverrides?.[code]) {
          product.price = draft.seriesPriceOverrides[code];
          log(`시리즈 코드 "${code}" — 조회된 가격이 없어 엑셀에 입력한 수동 가격을 사용했습니다.`);
        }
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

  function field(label, value, onChange, extraAttrs = {}) {
    return el("div", { class: "field" }, [
      el("label", {}, label),
      el("input", { type: "text", value: value || "", oninput: e => onChange(e.target.value), ...extraAttrs })
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
    const { hiddenRowKeys, hiddenCardKeys, hiddenSectionSpans } = computeHiddenUnits();
    const html = assembleEdmHtml(draft.templateId, currentValues(), { hiddenRowKeys, hiddenCardKeys, hiddenSectionSpans });
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
    const { hiddenRowKeys, hiddenCardKeys, hiddenSectionSpans } = computeHiddenUnits();
    const html = assembleEdmHtml(draft.templateId, currentValues(), { hiddenRowKeys, hiddenCardKeys, hiddenSectionSpans });
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

  async function persistCampaign(statusOverride) {
    const campaign = draftToCampaign(statusOverride);
    const savedCampaign = await store.upsertCampaign(campaign);
    draft.id = savedCampaign.id;
    existing = savedCampaign; // ⚠️ existing이 최초 진입 시점 값으로 고정돼 있으면, 내보내기로 "완료"
    // 상태를 저장한 뒤 다시 임시저장할 때 draftToCampaign()이 옛 existing.status(초안 등)를
    // 참조해서 "완료"가 "초안"으로 되돌아가는 버그가 생깁니다. 매번 저장할 때마다 최신값으로
    // 갱신해서 이 문제를 막습니다.
    return savedCampaign;
  }

  async function saveDraft(e) {
    const button = e?.currentTarget;
    if (button) button.disabled = true;
    try {
      await persistCampaign();
      toast("임시저장했습니다");
      log("임시저장 완료");
    } catch (error) {
      console.error("캠페인 저장 실패", error);
      toast(`임시저장에 실패했습니다: ${error.message}`);
      log(`임시저장 실패 — ${error.message}`);
    } finally {
      if (button) button.disabled = false;
    }
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
    const { hiddenRowKeys, hiddenCardKeys, hiddenSectionSpans } = computeHiddenUnits();
    const html = assembleEdmHtml(draft.templateId, currentValues(), { hiddenRowKeys, hiddenCardKeys, hiddenSectionSpans });
    if (!(await confirmExportGuards(html))) return;
    if (!navigator.clipboard) {
      toast("복사에 실패했습니다 (브라우저 권한 확인)");
      return;
    }
    try {
      await navigator.clipboard.writeText(html);
    } catch (error) {
      console.error("HTML 복사 실패", error);
      toast("복사에 실패했습니다");
      return;
    }
    try {
      await persistCampaign("완료");
      toast("HTML을 클립보드에 복사했습니다");
      log("HTML 복사 완료 · 상태: 완료");
      renderForm();
    } catch (error) {
      console.error("캠페인 완료 상태 저장 실패", error);
      toast(`HTML은 복사했지만 캠페인 저장에 실패했습니다: ${error.message}`);
      log(`HTML 복사 완료 · 캠페인 저장 실패 — ${error.message}`);
    }
  }

  async function downloadHtml() {
    const { hiddenRowKeys, hiddenCardKeys, hiddenSectionSpans } = computeHiddenUnits();
    const html = assembleEdmHtml(draft.templateId, currentValues(), { hiddenRowKeys, hiddenCardKeys, hiddenSectionSpans });
    if (!(await confirmExportGuards(html))) return;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (draft.fieldValues.copy_headline || "edm") + ".html";
    a.click();
    try {
      await persistCampaign("완료");
      log("HTML 다운로드 완료 · 상태: 완료");
      renderForm();
    } catch (error) {
      console.error("캠페인 완료 상태 저장 실패", error);
      toast(`파일은 다운로드했지만 캠페인 저장에 실패했습니다: ${error.message}`);
      log(`HTML 다운로드 완료 · 캠페인 저장 실패 — ${error.message}`);
    }
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
    imageMeta: {}, // key별 { filename, processed, instruction, urlMode } — 업로드 UI 상태
    imageUploading: null, // 지금 "AI로 가공 중"인 필드 key (동시에 하나만)
    hiddenSections: [],
    hiddenFields: [],
    coupon: { value: "10%", max: "50,000원", target: "전 상품 적용", note: "3만원 이상 구매 시", code: "WELCOME10", expiry: "2026.09.30" },
    seriesCodes: Array.from({ length: 15 }, () => ""),
    seriesPriceOverrides: {},
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
