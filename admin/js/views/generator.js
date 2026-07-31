import { store } from "../state.js";
import { el, toast, esc } from "../lib/dom.js";
import { navigate } from "../router.js";
import { generateCopy, regenerateField } from "../lib/copyGenerator.js";
import { assembleEdmHtml } from "../lib/blocks.js";
import { checkGuidelines, summarizeGuidelineIssues } from "../lib/guidelineCheck.js";
import { checkAllLinks, summarizeLinkResults } from "../lib/linkChecker.js";
import { fetchSeriesInfo } from "../lib/seriesApi.js";
import { segmentTemplateMap } from "../data/mockData.js";

const SEGMENTS = [
  { key: "신규", icon: "🌱" },
  { key: "육성", icon: "📈" },
  { key: "이탈 예측", icon: "⚠️" }
];

export function renderGenerator(root, params) {
  const editId = params.get("id");
  const existing = editId ? store.getCampaign(editId) : null;
  const initialCategory = existing
    ? (existing.category === "상품계" ? "product" : "non-product")
    : (params.get("type") === "product" ? "product" : "non-product");

  const draft = buildInitialDraft(initialCategory, existing);

  // ---------- 레이아웃 뼈대 ----------
  root.appendChild(el("div", { class: "gen-app" }, [
    buildFormArea(),
    buildPreviewArea()
  ]));

  const formBody = root.querySelector("#gen-form-body");
  const previewFrame = root.querySelector("#gen-preview-frame-wrap");
  let latestGuidelineIssues = [];

  renderForm();
  renderPreview();

  // ==================================================================
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
    if (detailsEl && detailsEl.style.display !== "none") {
      renderLogDetails();
    }
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
    if (isHidden) {
      renderLogDetails();
      detailsEl.style.display = "block";
      chevron.textContent = "▾";
    } else {
      detailsEl.style.display = "none";
      chevron.textContent = "▸";
    }
  }

  function toggleExportMenu() {
    const menu = root.querySelector("#export-menu");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  }

  function closeExportMenu() {
    const menu = root.querySelector("#export-menu");
    if (menu) menu.style.display = "none";
  }

  // ---------- 폼 렌더 ----------
  function renderForm() {
    formBody.innerHTML = "";

    // 헤더 서브타이틀 갱신 — buildFormArea()는 최초 1회만 그려지므로,
    // 카테고리가 바뀔 때마다(=renderForm 호출될 때마다) 여기서 같이 최신화합니다.
    const subtitle = root.querySelector("#gen-form-subtitle");
    if (subtitle) {
      subtitle.textContent = draft.category === "product"
        ? "상품계 · 시리즈 코드 최대 15개 · 세그먼트 없음"
        : "비상품계 · 고객 분류 기반";
    }

    formBody.appendChild(sectionCategoryToggle());
    formBody.appendChild(sectionPromotionLink());
    if (draft.category === "non-product") {
      formBody.appendChild(sectionSegment());
      formBody.appendChild(sectionTemplateNonProduct());
      formBody.appendChild(sectionCoupon());
    } else {
      formBody.appendChild(sectionTemplateProduct());
      formBody.appendChild(sectionSeriesCodes());
      formBody.appendChild(sectionCatchcopy());
    }
    formBody.appendChild(sectionAiCopy());
    formBody.appendChild(sectionHero());
    if (draft.category === "product") formBody.appendChild(sectionBodyImage());
    formBody.appendChild(sectionOffer());
  }

  // ① 상품계 / 비상품계
  /** 같은 프로모션의 다른 캠페인(예: EDM+LP)과 느슨하게 묶기 위한 선택 입력란.
   *  ID로 관리하지 않고, 사람이 같은 문자열을 각 캠페인에 입력하면 캠페인 목록에서
   *  자동으로 "연결된 캠페인"으로 묶여 보입니다. 비워두면 지금까지처럼 독립 캠페인입니다. */
  function sectionPromotionLink() {
    return el("div", { class: "field", style: "margin-bottom:14px;" }, [
      el("label", {}, "프로모션명 (선택)"),
      el("input", {
        type: "text",
        value: draft.promotionName || "",
        placeholder: "예: 2026년 7월 경제형 프로모션",
        oninput: e => { draft.promotionName = e.target.value; }
      }),
      el("p", { class: "hint" }, "같은 프로모션의 EDM/LP를 나중에 묶어보고 싶으면, 양쪽에 똑같은 이름을 입력하세요. 안 쓰셔도 됩니다.")
    ]);
  }

  function sectionCategoryToggle() {
    return el("div", { class: "cat-toggle" }, [
      catTab("non-product", "비상품계", "쿠폰형 · 고객 분류 기반"),
      catTab("product", "상품계", "시리즈 코드 · 세그먼트 없음")
    ]);
  }
  function catTab(value, label, desc) {
    return el("div", {
      class: "cat-tab" + (draft.category === value ? " active" : ""),
      onclick: () => {
        if (draft.category === value) return;
        // 원래 불러온 캠페인(existing)과 같은 카테고리로 돌아오는 거라면 그 데이터를 복원하고,
        // 그렇지 않다면(반대 카테고리로 처음 넘어가는 거라면) 복원할 데이터가 없으므로 기본값으로
        // 초기화합니다 — 단, id는 어느 경우든 유지해서 저장 시 새 캠페인이 중복 생성되지 않게 합니다.
        const matchesExisting = existing && (
          (value === "product" && existing.category === "상품계") ||
          (value === "non-product" && existing.category === "비상품계")
        );
        const restored = buildInitialDraft(value, matchesExisting ? existing : null);
        restored.id = draft.id;
        Object.assign(draft, restored);
        renderForm();
        renderPreview();
      }
    }, [
      el("div", { class: "cn" }, label),
      el("div", { class: "cd" }, desc)
    ]);
  }

  // ② 고객 분류 (비상품계)
  function sectionSegment() {
    return sectionWrap("②", "고객 분류", "high", [
      el("div", { class: "seg-tabs" }, SEGMENTS.map(s =>
        el("div", {
          class: "seg-tab" + (draft.segment === s.key ? " active" : ""),
          onclick: () => {
            draft.segment = s.key;
            draft.templateId = segmentTemplateMap[s.key];
            renderForm();
            renderPreview();
          }
        }, [
          el("div", { class: "si" }, s.icon),
          el("div", { class: "sn" }, s.key)
        ])
      ))
    ]);
  }

  // ③ 템플릿 (비상품계 — 자동 추천)
  function sectionTemplateNonProduct() {
    const t = store.templates.find(t => t.id === draft.templateId);
    return sectionWrap("③", "템플릿 (자동 추천)", "high", [
      el("select", {
        onchange: e => { draft.templateId = e.target.value; renderPreview(); }
      }, store.templates.filter(t => t.category === "비상품계").map(opt =>
        el("option", { value: opt.id, ...(opt.id === draft.templateId ? { selected: "selected" } : {}) },
          `${opt.id === draft.templateId ? "✓ " : ""}${opt.name}`)
      )),
      t ? el("p", { class: "hint" }, "블록: " + t.blocks.join(" → ")) : null
    ]);
  }

  // ② 템플릿 (상품계)
  function sectionTemplateProduct() {
    const t = store.templates.find(t => t.id === draft.templateId);
    return sectionWrap("②", "템플릿", "high", [
      el("select", {
        onchange: e => { draft.templateId = e.target.value; renderPreview(); }
      }, store.templates.filter(t => t.category === "상품계").map(opt =>
        el("option", { value: opt.id, ...(opt.id === draft.templateId ? { selected: "selected" } : {}) },
          `✓ ${opt.name}`)
      )),
      t ? el("p", { class: "hint" }, "블록: " + t.blocks.join(" → ")) : null
    ]);
  }

  // ④ 쿠폰 정보 (비상품계) — 쿠폰 블록 포함 템플릿에서만 표시 (CPN-01/02)
  function sectionCoupon() {
    const t = store.templates.find(t => t.id === draft.templateId);
    const hasCoupon = t && t.blocks.includes("쿠폰");
    if (!hasCoupon) return el("div");
    return sectionWrap("④", "쿠폰 정보", "high", [
      el("div", { class: "row2" }, [
        field("쿠폰 코드", draft.coupon.code, v => { draft.coupon.code = v; renderPreview(); }),
        field("할인율(%)", draft.coupon.discount, v => { draft.coupon.discount = v; renderPreview(); })
      ]),
      el("div", { class: "row2" }, [
        field("최소주문금액", draft.coupon.minOrder, v => { draft.coupon.minOrder = v; renderPreview(); }),
        field("최대할인금액", draft.coupon.maxDiscount, v => { draft.coupon.maxDiscount = v; renderPreview(); })
      ]),
      field("만료일", draft.coupon.expiry, v => { draft.coupon.expiry = v; renderPreview(); }),
      couponPreviewBlock(),
      el("p", { class: "hint" }, "※ 쿠폰 정보는 쿠폰 블록이 포함된 템플릿 선택 시에만 표시됩니다")
    ]);
  }

  function couponPreviewBlock() {
    const c = draft.coupon;
    return el("div", { class: "coupon-preview" }, [
      el("div", { class: "cp-discount" }, (c.discount || "0") + "%"),
      el("div", { class: "cp-unit" }, "DISCOUNT"),
      el("div", { class: "cp-code-box" }, el("span", { class: "cp-code" }, c.code || "COUPON")),
      el("div", { class: "cp-note" }, `만료: ${c.expiry || "-"} · 최대 ${c.maxDiscount || "0"}원`)
    ]);
  }

  // ③ 시리즈 코드 입력 (상품계, 최대 15개 3x5) — PRD-01/04
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
    return sectionWrap("③", "시리즈 코드 입력 (최대 15개, 3×5)", "high", [
      grid,
      el("button", {
        class: "btn series-lookup-btn",
        onclick: lookupSeriesCodes
      }, "전체 조회 (상품 데이터 자동 불러오기)"),
      el("p", { class: "hint" }, "조회된 상품 데이터(상품명·이미지·가격·출하일)는 오른쪽 미리보기에 바로 반영됩니다.")
    ]);
  }

  async function lookupSeriesCodes() {
    const codes = draft.seriesCodes
      .map(code => String(code || "").trim())
      .filter(Boolean);
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
    const successCount = results.filter(product => product.name).length;
    const failedCount = results.length - successCount;
    log(`시리즈 조회 완료 — 성공 ${successCount}건${failedCount ? ` · 실패 ${failedCount}건` : ""}`);
    toast(`상품 데이터 ${successCount}건을 불러왔습니다${failedCount ? ` (${failedCount}건 실패)` : ""}`);
    renderForm();
    renderPreview();
  }

  // ④ 캐치카피 (상품계)
  function sectionCatchcopy() {
    return sectionWrap("④", "캐치카피", "ai", [
      fieldWithRegen("캐치카피", draft.catchcopy, v => { draft.catchcopy = v; renderPreview(); },
        async () => {
          draft.catchcopy = await regenerateField("product", null, "catchcopy");
          renderForm(); renderPreview();
        })
    ]);
  }

  // AI 카피 생성 (공통) — CMN-05~07 / CMN-19
  function sectionAiCopy() {
    const isProduct = draft.category === "product";
    return sectionWrap(isProduct ? "⑤" : "⑤", "AI 카피 자동생성", "ai", [
      el("button", {
        class: "ai-btn", disabled: draft.generating ? "disabled" : null,
        onclick: runGenerateCopy
      }, draft.generating ? "생성 중..." : "✨ AI 전체 카피 자동생성"),

      !isProduct ? el("div", { class: "field" }, [
        el("label", {}, "이메일 제목"),
        el("div", { class: "subject-tabs" }, (draft.subjects.length ? draft.subjects : ["", "", ""]).map((s, i) =>
          el("div", {
            class: "subject-tab" + (draft.subjectIdx === i ? " active" : ""),
            onclick: () => { draft.subjectIdx = i; renderForm(); }
          }, [
            el("div", { class: "s-label" }, "안 " + (i + 1)),
            el("div", { class: "s-text" }, s || "-")
          ])
        ))
      ]) : isProduct ? fieldWithRegen("이메일 제목", draft.subjectSingle || "", v => draft.subjectSingle = v,
          async () => { draft.subjectSingle = await regenerateField("product", null, "subject"); renderForm(); }) : null,

      !isProduct ? fieldWithRegen("헤드라인 (배너 문구)", draft.headline, v => { draft.headline = v; renderPreview(); },
        async () => { draft.headline = await regenerateField("non-product", draft.segment, "headline"); renderForm(); renderPreview(); }) : null,

      !isProduct ? fieldWithRegen("본문 카피", draft.body, v => { draft.body = v; renderPreview(); },
        async () => { draft.body = await regenerateField("non-product", draft.segment, "body"); renderForm(); renderPreview(); }, "textarea") : null,

      fieldWithRegen("CTA 버튼 텍스트", draft.cta, v => { draft.cta = v; renderPreview(); },
        async () => {
          draft.cta = await regenerateField(isProduct ? "product" : "non-product", draft.segment, "cta");
          renderForm(); renderPreview();
        })
    ]);
  }

  async function runGenerateCopy() {
    draft.generating = true;
    renderForm();
    log("AI 카피 생성 요청...");
    try {
      const result = await generateCopy(draft.category, draft.segment);
      if (draft.category === "product") {
        draft.catchcopy = result.catchcopy;
        draft.subjectSingle = result.subject;
        draft.cta = result.cta;
      } else {
        draft.subjects = result.subjects;
        draft.subjectIdx = 0;
        draft.headline = result.headline;
        draft.body = result.body;
        draft.cta = result.cta;
      }
      log("AI 카피 생성 완료");
    } catch (e) {
      log("오류: " + e.message);
    } finally {
      draft.generating = false;
      renderForm();
      renderPreview();
    }
  }

  // ⑤ / ⑥ 히어로 배너 옵션 — CMN-17
  function sectionHero() {
    const label = draft.category === "product" ? "⑤" : "⑤";
    return sectionWrap(label, "히어로 배너", "opt", [
      el("div", { class: "hero-opts" }, [
        optBtn("기본", "hero", "기본"),
        optBtn("선택1", "hero", "선택1"),
        optBtn("선택2", "hero", "선택2")
      ]),
      el("p", { class: "hint" },
        draft.heroOption === "기본" ? "HTML+CSS 자동 생성" :
        draft.heroOption === "선택1" ? "S3 배경 이미지 추천 + Pillow 합성" : "담당자가 직접 업로드한 이미지 사용")
    ]);
  }

  // ⑥ 본문 이미지 옵션 (상품계) — CMN-18
  function sectionBodyImage() {
    return sectionWrap("⑥", "본문 이미지", "opt", [
      el("div", { class: "body-img-opts" }, [
        optBtn("기본", "bodyImg", "기본"),
        optBtn("선택1", "bodyImg", "선택1"),
        optBtn("선택2", "bodyImg", "선택2")
      ]),
      el("p", { class: "hint" },
        draft.bodyImgOption === "선택2" ? "담당자가 직접 제작한 이미지 업로드" : "Claude Vision이 이미지의 중요 영역을 자동 감지·강조 편집 (재요청 가능)")
    ]);
  }

  function optBtn(label, group, value) {
    const current = group === "hero" ? draft.heroOption : draft.bodyImgOption;
    return el("button", {
      class: "opt-btn" + (current === value ? " active" : ""),
      onclick: () => {
        if (group === "hero") draft.heroOption = value; else draft.bodyImgOption = value;
        renderForm(); renderPreview();
      }
    }, label);
  }

  // 오퍼번호 (UTM) — CMN-08
  function sectionOffer() {
    return sectionWrap("", "오퍼번호 (WebCAS · utm_campaign)", "opt", [
      field("오퍼번호", draft.offerNo, v => { draft.offerNo = v; }),
      el("p", { class: "hint" }, "캠페인 내 모든 링크(상품·CTA·배너)에 자동 적용됩니다. utm_source=misumi · utm_medium=email 고정")
    ]);
  }

  // ---------- 공용 섹션/필드 위젯 ----------
  function sectionWrap(num, title, badgeType, children) {
    const badgeClass = badgeType === "high" ? "" : badgeType === "ai" ? "ai" : "opt";
    return el("div", { class: "sec" }, [
      el("div", { class: "sec-hd", onclick: e => e.currentTarget.parentElement.classList.toggle("collapsed") }, [
        el("div", { class: "sec-hd-left" }, [
          num ? el("span", { class: "sec-badge " + badgeClass }, num) : null,
          el("span", { class: "sec-title" }, title)
        ]),
        el("span", { class: "sec-toggle-ico" }, "▾")
      ]),
      el("div", { class: "sec-body" }, children)
    ]);
  }

  function field(label, value, onChange, type = "text") {
    return el("div", { class: "field" }, [
      el("label", {}, label),
      el("input", { type, value: value ?? "", oninput: e => onChange(e.target.value) })
    ]);
  }

  function fieldWithRegen(label, value, onChange, onRegen, kind = "input") {
    return el("div", { class: "field" }, [
      el("div", { class: "field-with-regen" }, [
        el("label", {}, label),
        el("button", { class: "regen-btn", title: "재생성", onclick: onRegen }, "🔄")
      ]),
      kind === "textarea"
        ? el("textarea", { oninput: e => onChange(e.target.value) }, value || "")
        : el("input", { type: "text", value: value ?? "", oninput: e => onChange(e.target.value) })
    ]);
  }

  // 현재 draft.templateId에 해당하는 템플릿 객체를 store에서 조회합니다.
  // blocks.js의 assembleEdmHtml()은 이 객체의 blocks 배열을 "단일 출처"로 삼아 렌더링합니다.
  function resolveTemplate() {
    return store.templates.find(t => t.id === draft.templateId) || null;
  }

  // ---------- 미리보기 ----------
  function renderPreview() {
    if (draft.category === "non-product") {
      draft.headline = draft.headline || "";
    }
    const html = assembleEdmHtml(currentEdmModel(), resolveTemplate());
    previewFrame.innerHTML = "";
    const iframe = el("iframe", { srcdoc: html });
    previewFrame.appendChild(iframe);

    // 가이드라인 검사는 폼이 바뀔 때마다 조용히 자동 실행 — 팝업 없이 배지만 갱신.
    // (링크 확인은 네트워크 비용 때문에 자동으로 계속 돌리지 않고 버튼/내보내기 시점에만 실행)
    latestGuidelineIssues = checkGuidelines(html);
    updateGuidelineBadge(latestGuidelineIssues);
  }

  function updateGuidelineBadge(issues) {
    const badge = root.querySelector("#guideline-badge");
    if (!badge) return;
    const summary = summarizeGuidelineIssues(issues);
    badge.className = "guideline-badge " + (issues.length === 0 ? "badge-pass" : summary.errors ? "badge-fail" : "badge-warn");
    badge.textContent = issues.length === 0
      ? "✅ 가이드라인 통과"
      : `${summary.errors ? "❌" : "⚠️"} 가이드라인 위반 ${summary.errors}건 · 경고 ${summary.warnings}건 (클릭해서 보기)`;
  }

  function toggleGuidelineDetails() {
    const host = root.querySelector("#guideline-results");
    const isHidden = host.style.display === "none";
    if (isHidden) {
      renderGuidelineResults(latestGuidelineIssues, summarizeGuidelineIssues(latestGuidelineIssues));
      host.style.display = "block";
    } else {
      host.style.display = "none";
    }
  }

  function currentEdmModel() {
    return {
      category: draft.category,
      templateId: draft.templateId,
      headline: draft.headline,
      catchcopy: draft.catchcopy,
      body: draft.body,
      cta: draft.cta,
      heroOption: draft.heroOption,
      coupon: draft.coupon,
      products: draft.products,
      // ⚠️ 실서비스 연동 지점: 관련상품은 시리즈 API 연동 후 자동 채워질 예정입니다.
      // 그 전까지는 비어 있으며, blocks.js는 비어 있으면 관련상품 섹션을 자동으로 생략합니다.
      relatedProducts: draft.relatedProducts || [],
      relatedSectionTitle: draft.relatedSectionTitle,
      relatedDetailUrl: draft.relatedDetailUrl,
      utmQuery: buildUtmQuery(),
      linkUrl: buildLink()
    };
  }

  function buildLink() {
    const base = draft.category === "product"
      ? "https://kr.misumi-ec.com/vona2/detail/SERIES/"
      : "https://kr.misumi-ec.com/";
    return `${base}?${buildUtmQuery()}`;
  }

  // 캠페인 내 모든 링크(CTA·상품 카드·관련상품 등)가 공유하는 단일 UTM 소스.
  // blocks.js가 draft.utmQuery를 받아서 자체적으로 조립하는 링크(상품 상세 등)에도 붙입니다.
  function buildUtmQuery() {
    return `utm_source=misumi&utm_medium=email&utm_campaign=${encodeURIComponent(draft.offerNo || "")}`;
  }

  // ---------- 저장 / 출력 ----------
  function saveDraft() {
    const campaign = draftToCampaign("초안");
    store.upsertCampaign(campaign);
    toast("임시저장했습니다");
    log("임시저장 완료");
  }

  function renderGuidelineResults(issues, summary) {
    const host = root.querySelector("#guideline-results");
    host.innerHTML = "";
    if (!issues.length) {
      host.appendChild(el("div", { class: "guide-result guide-pass" }, "✅ 코딩/디자인 가이드라인을 모두 통과했습니다"));
      return;
    }
    host.appendChild(el("div", { class: "guide-result " + (summary.errors ? "guide-fail" : "guide-warn") },
      summary.errors
        ? `❌ 위반 ${summary.errors}건 · 경고 ${summary.warnings}건 발견`
        : `⚠️ 경고 ${summary.warnings}건 발견 (승인 가능하지만 확인 권장)`
    ));
    host.appendChild(el("ul", { class: "guide-list" }, issues.map(i =>
      el("li", { class: "guide-item " + i.level }, [
        el("span", { class: "guide-badge " + i.level }, i.level === "error" ? "위반" : "경고"),
        el("span", {}, i.message)
      ])
    )));
  }

  async function runLinkCheck() {
    const html = assembleEdmHtml(currentEdmModel(), resolveTemplate());
    log("링크/이미지 확인 중...");
    const host = root.querySelector("#link-check-results");
    host.innerHTML = "";
    host.appendChild(el("div", { class: "guide-result guide-warn" }, "확인 중... (도메인에 따라 몇 초 걸릴 수 있습니다)"));

    const results = await checkAllLinks(html);
    const summary = summarizeLinkResults(results);
    log(`링크/이미지 확인 완료 — 정상 ${summary.ok}건, 깨짐 ${summary.broken}건, 확인불가 ${summary.unknown}건`);
    renderLinkResults(results, summary);
  }

  function renderLinkResults(results, summary) {
    const host = root.querySelector("#link-check-results");
    host.innerHTML = "";

    if (!results.length) {
      host.appendChild(el("div", { class: "guide-result guide-pass" }, "확인할 외부 이미지/링크가 없습니다"));
      return;
    }

    host.appendChild(el("div", { class: "guide-result " + (summary.broken ? "guide-fail" : "guide-pass") },
      `정상 ${summary.ok}건 · 깨짐 ${summary.broken}건 · 확인불가(CORS) ${summary.unknown}건`
    ));

    const problems = results.filter(r => r.ok !== true);
    if (problems.length) {
      host.appendChild(el("ul", { class: "guide-list" }, problems.map(r =>
        el("li", { class: "guide-item " + (r.ok === false ? "error" : "warning") }, [
          el("span", { class: "guide-badge " + (r.ok === false ? "error" : "warning") },
            r.ok === false ? "깨짐" : "확인불가"),
          el("span", {}, `[${r.type === "image" ? "이미지" : "링크"}] ${r.url}${r.reason ? ` — ${r.reason}` : ""}`)
        ])
      )));
    }
  }

  function draftToCampaign(status) {
    return {
      id: draft.id,
      name: draft.category === "product"
        ? (draft.catchcopy || "상품계 캠페인").slice(0, 24)
        : (draft.headline || "비상품계 캠페인").slice(0, 24),
      category: draft.category === "product" ? "상품계" : "비상품계",
      type: draft.category === "product" ? "상품 소개형" : "쿠폰형",
      segment: draft.category === "product" ? "-" : draft.segment,
      status,
      createdAt: existing ? existing.createdAt : new Date().toISOString().slice(0, 10).replace(/-/g, "."),
      // ⚠️ promotionName: "같은 프로모션의 여러 캠페인(예: EDM+LP)"을 느슨하게 묶기 위한 선택 필드.
      // ID 기반 그룹핑 대신 사람이 같은 문자열을 각 캠페인에 입력하는 방식 — 캠페인 목록에서
      // 이 값이 같은(비어있지 않은) 캠페인끼리 "연결된 캠페인" 배지로 묶어서 보여줍니다.
      // (LP_EDM_ARCHITECTURE.md 참고. 오타로 안 묶여도 다시 고치면 그만이라 크게 문제되지 않음)
      promotionName: draft.promotionName || "",
      // ⚠️ 실서비스 연동 지점: 캠페인 목록 화면(campaigns.js)은 위 필드들만 씁니다(표시용 메타데이터).
      // 아래 draftData가 실제 편집 가능한 전체 입력값의 단일 스냅샷입니다 — 편집(생성기 재진입) 시
      // buildInitialDraft()가 이 값으로 폼을 그대로 복원합니다. 이전에는 이 필드가 없어서
      // "임시저장 후 다시 편집하면 입력값이 전부 사라지는" 버그가 있었습니다.
      // DynamoDB로 이관할 때는 위 메타데이터 + draftData를 합쳐 캠페인 아이템 하나로 저장하면 됩니다.
      draftData: { ...draft }
    };
  }

  /** 내보내기(복사/다운로드) 직전 공통 게이트.
   *  - 가이드라인 위반(error)이 있으면 확인창으로 한 번 막습니다 (경고는 막지 않음 — 알림 피로 방지).
   *  - 링크 확인은 자동으로 계속 돌리지 않다가, 내보내는 이 순간에만 1회 실행합니다
   *    (네트워크 비용이 있는 작업이라 상시 자동 실행 대신 "내보내기 직전 1회"로 절충).
   *  @returns {Promise<boolean>} true면 계속 진행, false면 사용자가 취소함
   */
  async function confirmExportGuards(html) {
    const summary = summarizeGuidelineIssues(latestGuidelineIssues);
    if (summary.errors > 0) {
      const proceed = confirm(`가이드라인 위반 ${summary.errors}건이 있습니다. 그래도 진행하시겠습니까?`);
      if (!proceed) { log("내보내기 취소 (가이드라인 위반)"); return false; }
    }

    log("내보내기 전 링크/이미지 확인 중...");
    const results = await checkAllLinks(html);
    renderLinkResults(results, summarizeLinkResults(results));
    const broken = results.filter(r => r.ok === false);
    if (broken.length) {
      const proceed = confirm(`깨진 링크/이미지가 ${broken.length}건 있습니다. 그래도 진행하시겠습니까?`);
      if (!proceed) { log("내보내기 취소 (깨진 링크 발견)"); return false; }
    }
    return true;
  }

  async function copyHtml() {
    const html = assembleEdmHtml(currentEdmModel(), resolveTemplate());
    if (!(await confirmExportGuards(html))) return;
    navigator.clipboard?.writeText(html).then(
      () => { toast("HTML을 클립보드에 복사했습니다"); log("HTML 복사 완료"); },
      () => toast("복사에 실패했습니다 (브라우저 권한 확인)")
    );
  }

  async function downloadHtml() {
    const html = assembleEdmHtml(currentEdmModel(), resolveTemplate());
    if (!(await confirmExportGuards(html))) return;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (draft.headline || draft.catchcopy || "edm") + ".html";
    a.click();
    log("HTML 다운로드 완료");
  }

}

// ---------- 초기 draft 상태 ----------
function buildInitialDraft(category, existing) {
  const base = {
    id: existing?.id || "c" + Date.now(),
    category,
    promotionName: "",
    segment: existing?.segment && existing.segment !== "-" ? existing.segment : "신규",
    templateId: category === "product" ? "t5" : segmentTemplateMap["신규"],
    coupon: { code: "KORWELCOME10", discount: "10", minOrder: "30,000", maxDiscount: "50,000", expiry: "2026.09.30" },
    seriesCodes: Array.from({ length: 15 }, () => ""),
    products: [],
    relatedProducts: [],
    relatedSectionTitle: "관련 상품",
    relatedDetailUrl: "",
    catchcopy: "정밀 가공의 시작, 리니어 샤프트로",
    subjects: [],
    subjectIdx: 0,
    subjectSingle: "",
    headline: category === "non-product" ? "미스미 코리아에 오신 것을 환영합니다" : "",
    body: category === "non-product" ? "회원가입을 축하드리며 첫 구매 혜택을 안내드립니다." : "",
    cta: category === "product" ? "지금 구매하기" : "첫 주문 혜택 확인 →",
    heroOption: "기본",
    bodyImgOption: "기본",
    offerNo: "OFFER2026070",
    generating: false
  };

  // ⚠️ existing.draftData가 있으면(=임시저장/승인요청 이력이 있는 캠페인 편집 진입) 그 스냅샷으로
  // 폼을 복원합니다. base를 먼저 깔아두는 건 과거에 저장된 캠페인에 지금은 있지만 그때는 없던
  // 필드(예: relatedProducts)가 없어도 undefined 에러 없이 기본값으로 채워지도록 하기 위함입니다.
  if (existing?.draftData) {
    return { ...base, ...existing.draftData, id: base.id };
  }
  return base;
}
