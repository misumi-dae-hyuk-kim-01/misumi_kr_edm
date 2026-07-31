import { store } from "../state.js";
import { el, toast, esc } from "../lib/dom.js";
import { navigate } from "../router.js";
import { generateCopy, regenerateField } from "../lib/copyGenerator.js";
import { assembleEdmHtml } from "../lib/blocks.js";
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
  const statusBar = root.querySelector("#gen-status");

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
        el("p", {}, draft.category === "product"
          ? "상품계 · 시리즈 코드 최대 15개 · 세그먼트 없음"
          : "비상품계 · 고객 분류 기반")
      ]),
      el("div", { class: "gen-form-body", id: "gen-form-body" }),
      el("div", { class: "gen-form-footer" }, [
        el("div", { class: "status-bar", id: "gen-status" }, "대기 중..."),
        el("div", { class: "footer-btn-row" }, [
          el("button", { class: "btn", onclick: copyHtml }, "HTML 복사"),
          el("button", { class: "btn", onclick: downloadHtml }, "다운로드"),
          el("button", { class: "btn primary", onclick: requestApproval }, "승인 요청")
        ]),
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

  function log(msg) {
    const t = new Date().toLocaleTimeString();
    statusBar.textContent += `\n[${t}] ${msg}`;
    statusBar.scrollTop = statusBar.scrollHeight;
  }

  // ---------- 폼 렌더 ----------
  function renderForm() {
    formBody.innerHTML = "";
    formBody.appendChild(sectionCategoryToggle());
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
        Object.assign(draft, buildInitialDraft(value, null));
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
      el("p", { class: "hint" }, "조회된 상품 데이터(이미지·가격·출하일)가 본문 상품 리스트에 자동 반영됩니다 · 미결 사항 #2 확인 필요"),
      draft.products.length ? el("div", { class: "product-mini-list" }, draft.products.map(p =>
        el("div", { class: "product-mini" }, [
          el("span", { class: "pm-code" }, p.code),
          el("span", {}, `₩${p.price} · ${p.shipDate} 출하`)
        ])
      )) : null
    ]);
  }

  async function lookupSeriesCodes() {
    const codes = draft.seriesCodes.filter(c => c && c.trim());
    if (!codes.length) { toast("시리즈 코드를 1개 이상 입력하세요"); return; }
    log(`시리즈 코드 ${codes.length}건 조회 중...`);
    // ⚠️ 실서비스 연동 지점: 미결 사항 #2 — 미스미 상품 API 또는 내부 DB로 교체
    await new Promise(r => setTimeout(r, 500));
    draft.products = codes.map(code => ({
      code,
      price: (12000 + Math.floor(Math.random() * 4000)).toLocaleString(),
      shipDate: "당일"
    }));
    log(`상품 데이터 ${draft.products.length}건 조회 완료`);
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

  // ---------- 미리보기 ----------
  function renderPreview() {
    if (draft.category === "non-product") {
      draft.headline = draft.headline || "";
    }
    const html = assembleEdmHtml(currentEdmModel());
    previewFrame.innerHTML = "";
    const iframe = el("iframe", { srcdoc: html });
    previewFrame.appendChild(iframe);
  }

  function currentEdmModel() {
    return {
      category: draft.category,
      headline: draft.headline,
      catchcopy: draft.catchcopy,
      body: draft.body,
      cta: draft.cta,
      heroOption: draft.heroOption,
      coupon: draft.coupon,
      products: draft.products,
      linkUrl: buildLink()
    };
  }

  function buildLink() {
    const base = draft.category === "product"
      ? "https://kr.misumi-ec.com/vona2/detail/SERIES/"
      : "https://kr.misumi-ec.com/";
    const utm = `utm_source=misumi&utm_medium=email&utm_campaign=${encodeURIComponent(draft.offerNo || "")}`;
    return `${base}?${utm}`;
  }

  // ---------- 저장 / 출력 ----------
  function saveDraft() {
    const campaign = draftToCampaign("초안");
    store.upsertCampaign(campaign);
    toast("임시저장했습니다");
    log("임시저장 완료");
  }

  function requestApproval() {
    const campaign = draftToCampaign("검토중");
    store.upsertCampaign(campaign);
    log("승인 요청 이메일 발송 (AWS SES) — 데모에서는 실제 발송하지 않습니다");
    toast("검토자에게 승인 요청을 보냈습니다");
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
      createdAt: existing ? existing.createdAt : new Date().toISOString().slice(0, 10).replace(/-/g, ".")
    };
  }

  function copyHtml() {
    const html = assembleEdmHtml(currentEdmModel());
    navigator.clipboard?.writeText(html).then(
      () => { toast("HTML을 클립보드에 복사했습니다"); log("HTML 복사 완료"); },
      () => toast("복사에 실패했습니다 (브라우저 권한 확인)")
    );
  }

  function downloadHtml() {
    const html = assembleEdmHtml(currentEdmModel());
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
    segment: existing?.segment && existing.segment !== "-" ? existing.segment : "신규",
    templateId: category === "product" ? "t4" : segmentTemplateMap["신규"],
    coupon: { code: "KORWELCOME10", discount: "10", minOrder: "30,000", maxDiscount: "50,000", expiry: "2026.09.30" },
    seriesCodes: Array.from({ length: 15 }, () => ""),
    products: [],
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
  return base;
}
