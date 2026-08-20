// LP(랜딩페이지) 콘텐츠 HTML을 조립합니다.
// ⚠️ blocks.js(EDM)와 기술 기반이 정반대입니다 — 테이블 대신 클래스 기반 CSS를 씁니다.
// 왜 이렇게 다른지는 GUIDELINE_SOURCES.md / LP_EDM_ARCHITECTURE.md를 참고하세요.
//
// blocks.js(EDM)와 동일한 블록 레지스트리 패턴입니다 — mockData.js의 LP 템플릿이
// blocks 배열로 어떤 블록을 어떤 순서로 쓸지 선언하면, 여기서 그 이름을 실제 렌더
// 함수에 매핑해서 조립합니다. 새 LP 템플릿 추가 시 mockData.js에 선언만 하면 되고,
// 완전히 새로운 블록이 필요할 때만 이 파일에 함수를 추가하면 됩니다.

import { esc } from "./dom.js";
import { LP_WIDTH_PATTERNS, DEPLOYMENT_LANG, LP_REQUIRED_DESCRIPTION_SUFFIX } from "./guidelineCheckLP.js";

// ==========================================================================
// 개별 블록 렌더 함수 (모두 동일 시그니처: (draft) => htmlString)
// ==========================================================================

function breadcrumbBlock(draft) {
  if (!draft.breadcrumb) return "";
  return `<nav class="lp-breadcrumb">${esc(draft.breadcrumb)}</nav>`;
}

function heroBlock(draft) {
  return `
  <section class="lp-hero">
    <div class="lp-hero__eyebrow">MISUMI</div>
    <h1 class="lp-hero__catchcopy">${esc(draft.catchcopy || "")}</h1>
    ${heroImageSlot(draft)}
  </section>`;
}

/** 히어로 이미지 옵션.
 *  - 기본: 이미 배경색+텍스트로 완결된 모습이라 박스 자체를 안 그립니다.
 *  - 선택1: S3 추천+Pillow 합성 — 아직 파이프라인이 없어 "연동 예정" 플레이스홀더.
 *  - 선택2: 담당자가 입력한 이미지 URL을 실제로 렌더링합니다 (URL 없으면 입력 안내). */
function heroImageSlot(draft) {
  if (draft.heroImageOption === "선택1") {
    return `<div class="lp-hero__image-slot">S3 배경 이미지 추천 + Pillow 합성 (연동 예정)</div>`;
  }
  if (draft.heroImageOption === "선택2") {
    if (draft.heroImageUrl) {
      return `<img class="lp-hero__image" src="${esc(draft.heroImageUrl)}" alt="${esc(draft.catchcopy || "")}">`;
    }
    return `<div class="lp-hero__image-slot">이미지 URL을 입력해주세요</div>`;
  }
  return ""; // 기본: 이미지 슬롯 없음
}

/**
 * 추천상품 그리드 블록 — EDM productGridBlock과 같은 필드 계약(code/name/image/price)을 씁니다.
 * ⚠️ name/image/price가 비어 있으면(=시리즈 API 연동 전) 명확한 플레이스홀더를 표시합니다.
 * code는 화면에 직접 안 보이고 상세페이지 링크(`/vona2/detail/{code}/`) 생성에만 씁니다.
 */
function productGridBlockLP(draft) {
  const products = draft.products || [];
  if (!products.length) return "";

  const cards = products.map(p => {
    const detailUrl = `https://kr.misumi-ec.com/vona2/detail/${encodeURIComponent(p.code)}/`;
    return `
    <a class="lp-product-card" href="${esc(detailUrl)}">
      <div class="lp-product-card__image">
        ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name || "")}">` : "상품 이미지 (연동 예정)"}
      </div>
      <div class="lp-product-card__name">
        ${p.name ? esc(p.name) : `<span class="lp-pending">상품명 연동 예정</span>`}
      </div>
      <div class="lp-product-card__price">
        ${p.price ? `₩${esc(p.price)}` : `<span class="lp-pending">가격 정보 연동 예정</span>`}
      </div>
    </a>`;
  }).join("");

  return `
  <section class="lp-products">
    <h2 class="lp-products__title">추천상품</h2>
    <div class="lp-products__grid">${cards}</div>
  </section>`;
}

function bodyBlock(draft) {
  return `
  <main class="lp-body">
    ${bodyImageSlot(draft)}
    <p>${esc(draft.bodyText || "")}</p>
  </main>`;
}

/** 위와 동일한 이유로 자리표시자입니다. */
function bodyImageSlot(draft) {
  const label =
    draft.bodyImageOption === "선택2" ? "담당자가 직접 제작한 이미지 (연동 예정)" :
    "Claude Vision 자동 편집 (연동 예정)";
  return `<div class="lp-body__image-slot">${esc(label)}</div>`;
}

// ==========================================================================
// 블록 레지스트리 — mockData.js LP 템플릿의 blocks 배열에 쓰인 이름과 정확히 일치해야 합니다.
// ==========================================================================
const blockRegistry = {
  "브레드크럼": breadcrumbBlock,
  "히어로": heroBlock,
  "추천상품 그리드": productGridBlockLP,
  "본문": bodyBlock
};

// 템플릿을 못 찾았을 때의 최소 안전망
const FALLBACK_BLOCKS = ["브레드크럼", "히어로", "본문"];

const STYLE = `
  .lp-wrap { margin: 0 auto; font-family: 'Apple SD Gothic Neo', sans-serif; }
  .lp-breadcrumb { font-size: 11px; color: #888; padding: 12px 0; }
  .lp-hero { background: #0F218B; color: #fff; text-align: center; padding: 60px 24px; }
  .lp-hero__eyebrow { font-size: 12px; letter-spacing: 2px; opacity: .8; margin-bottom: 10px; }
  .lp-hero__catchcopy { font-size: 26px; font-weight: 700; line-height: 1.4; }
  .lp-hero__image-slot { background: #f5f5f5; border-radius: 8px; height: 220px; display: flex;
    align-items: center; justify-content: center; color: #aaa; font-size: 12px; margin-top: 20px; }
  .lp-hero__image { max-width: 100%; border-radius: 8px; margin-top: 20px; display: block; }
  .lp-body { padding: 40px 24px; font-size: 14px; line-height: 1.8; color: #333; }
  .lp-body__image-slot { background: #f5f5f5; border-radius: 8px; height: 280px; display: flex;
    align-items: center; justify-content: center; color: #aaa; font-size: 12px; margin: 20px 0; }
  .lp-products { padding: 40px 24px; }
  .lp-products__title { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 20px; }
  .lp-products__grid { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }
  .lp-product-card { display: block; width: 200px; text-decoration: none; color: #333; }
  .lp-product-card__image { background: #f5f5f5; border-radius: 8px; height: 140px; display: flex;
    align-items: center; justify-content: center; color: #aaa; font-size: 11px; overflow: hidden; margin-bottom: 8px; }
  .lp-product-card__image img { width: 100%; height: 100%; object-fit: cover; }
  .lp-product-card__name { font-size: 13px; margin-bottom: 4px; }
  .lp-product-card__price { font-size: 15px; font-weight: 700; color: #0F218B; }
  .lp-pending { color: #c9a227; font-style: italic; font-weight: normal; font-size: 12px; }
`;

/**
 * @param {object} draft LP 생성기 폼 상태
 * @param {object|null} template store.templates에서 찾은 LP 템플릿 (blocks 배열의 단일 출처)
 * @param {{title, description, keywords}} seoMeta
 * @returns {string} 완성된 LP HTML
 */
export function assembleLpHtml(draft, template, seoMeta = {}) {
  const widthInfo = LP_WIDTH_PATTERNS[draft.widthPattern] || LP_WIDTH_PATTERNS[1200];
  const bodyClass = widthInfo.class || "page-unknown"; // 920px처럼 실제 클래스명 미확인인 경우 대비
  const keywordsAttr = (seoMeta.keywords || []).join(", ");

  const blockNames = (template && template.blocks && template.blocks.length)
    ? template.blocks
    : FALLBACK_BLOCKS;

  const bodyHtml = blockNames.map(name => {
    const render = blockRegistry[name];
    if (!render) {
      console.warn(`[blocksLP.js] 레지스트리에 없는 블록명입니다: "${name}"`);
      return "";
    }
    return render(draft) || "";
  }).filter(Boolean).join("\n");

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${DEPLOYMENT_LANG}" lang="${DEPLOYMENT_LANG}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(seoMeta.title || draft.catchcopy || "")}</title>
<meta name="description" content="${esc(seoMeta.description || "")}">
<meta name="keywords" content="${esc(keywordsAttr)}">
<style>
  .lp-wrap { max-width: ${draft.widthPattern || 1200}px; }
  ${STYLE}
</style>
</head>
<body class="${bodyClass}">
  <div class="lp-wrap">${bodyHtml}</div>
</body>
</html>`;
}

// ==========================================================================
// 신상품카탈로그 — 디자인팀이 전달한 실제 마크업(door/economy/etc/fa-etc/fastener/
// piping/pneumatic/positioning.html, card-states.html, script.js, style.css)을
// 그대로 재현하는 조립 함수입니다. 위 기본 LP(assembleLpHtml)와는 완전히 다른
// 산출물 형태입니다 — 파일 하나가 아니라 그룹 수만큼 여러 HTML + 공용 CSS/JS
// 묶음을 만듭니다 (lpDeploy.js의 다중 파일 배포로 한 번에 올립니다).
//
// ⚠️ 여기 CATALOG_STYLE / CATALOG_SCRIPT는 디자인팀이 준 style.css / script.js
// 원문 그대로입니다 — 화면(카드/배지/검색·필터 동작)을 고치고 싶으면 이 상수를
// 고치면 되고, 조립 로직(assembleLpCatalogGroupHtml)은 건드릴 필요 없습니다.
// ==========================================================================

// ⚠️ 예전엔 이 배열이 "8개 그룹 고정 목록"이었지만, 이제 그룹은 엑셀에 어떤 값이
// 들어오느냐에 따라 매번 자동으로 정해집니다(resolveCatalogGroups 참고). 이 배열은
// 그 중 "이미 알려진 8개"에 한해 파일명을 예쁘게(영문) 유지하기 위한 참고표로만 씁니다 —
// 여기 없는 새 그룹명이 들어와도 문제없이 자동으로 처리됩니다.
export const KNOWN_GROUP_PRESETS = [
  { label: "경제형", file: "economy.html" },
  { label: "공압기기", file: "pneumatic.html" },
  { label: "도어 부품/외장 부품", file: "door.html" },
  { label: "배관 부품", file: "piping.html" },
  { label: "위치결정/고정부품", file: "positioning.html" },
  { label: "FA용 기타", file: "fa-etc.html" },
  { label: "나사/볼트/와셔/너트", file: "fastener.html" },
  { label: "기타", file: "etc.html" }
];

/**
 * 엑셀에 실제로 등장한 그룹 라벨 목록(첫 등장 순서 그대로)을 받아서, 탭/파일명에 쓸
 * {label, file}[] 을 만듭니다. 마케터가 새 그룹명을 써도(예: "신규 카테고리") 코드
 * 수정 없이 자동으로 파일이 하나 더 생깁니다.
 *
 * ⚠️ 한글 그룹명은 영문 파일명으로 자동 변환이 안 되므로(알파벳/숫자만 남기면 빈 문자열이
 * 되는 경우가 많음), KNOWN_GROUP_PRESETS에 없는 새 그룹은 "group-2.html"처럼 순번으로
 * 파일명이 정해집니다 — URL이 안 예뻐지는 것뿐, 동작에는 문제없습니다. 예쁜 파일명이
 * 필요해지면 KNOWN_GROUP_PRESETS에 그 그룹을 추가하면 됩니다.
 *
 * @param {string[]} rawLabels 엑셀 "group" 열에서 뽑은 값들 (첫 등장 순서, 중복 제거 전)
 * @returns {{label: string, file: string}[]} 중복 제거된 그룹 목록
 */
export function resolveCatalogGroups(rawLabels) {
  const seen = new Set();
  const groups = [];
  let autoIndex = 1;
  for (const raw of rawLabels) {
    const label = String(raw || "").trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    const preset = KNOWN_GROUP_PRESETS.find(g => g.label === label);
    const file = preset ? preset.file : `group-${autoIndex++}.html`;
    groups.push({ label, file });
  }
  return groups;
}

function catalogTabsHtml(activeGroupLabel, allGroups) {
  const links = allGroups.map(g =>
    g.label === activeGroupLabel
      ? `      <a href="./${g.file}" class="is-active" aria-current="page">${esc(g.label)}</a>`
      : `      <a href="./${g.file}">${esc(g.label)}</a>`
  ).join("\n");
  return `    <nav class="lp-tabs" aria-label="상품 그룹">\n${links}\n    </nav>`;
}

/** 배지 이름이 무엇이든 같은 스타일을 쓰되, 색이 지정된 종류만 style.css의
 *  .p-badge--{key} 클래스로 연결합니다. 여기 없는 배지는 회색 폴백으로 자동 표시됩니다
 *  (style.css의 .p-badge 기본색). 새 배지 종류가 색이 필요해지면 이 표와 CATALOG_STYLE의
 *  .p-badge--{key} 규칙을 같이 추가하면 됩니다.
 */
const BADGE_CLASS_MAP = { "경제형": "economy", "신규": "new" };

/**
 * 8개 그룹 페이지가 전부 공유하는 상단 배너 4개입니다(디자인팀 원본 economy.html 등
 * 그대로 — 그룹마다 다른 배너가 아니라 카탈로그 전체가 같은 배너를 씁니다).
 *
 * ⚠️ 이 배너는 CSV 데이터가 아니라 월별로 바뀌는 프로모션 이미지라, 나중에 이걸
 * 생성기 화면에서 직접 바꿀 수 있게 하고 싶으면 이 배열을 draft에서 받아오도록
 * 고치면 됩니다(지금은 고정값입니다). href/img/alt만 있으면 되는 구조라 확장은 쉽습니다.
 *
 * ⚠️ img 경로(./images/...)는 배포 시 style.css/script.js와 마찬가지로 같은 캠페인
 * 폴더 안의 images/ 하위에 실제 파일이 있어야 합니다 — 지금 generatorLP.js의
 * 배포 목록엔 이 이미지 파일들이 아직 포함되어 있지 않습니다(실제 배너 이미지 파일을
 * 받아서 같이 올리는 작업이 별도로 필요합니다).
 */
const CATALOG_BANNERS = [
  { href: "/pr/vona/economy/aluminum_frame/?bid=bid_kr_all_KR240048_4858", img: "./images/topbanner1_260616.png", alt: "프로파일 국내 규격 출시", label: "프로파일 국내 규격 출시" },
  { href: "/pr/vona/july_coreproduct_brand?bid=bid_kr_all_KR240048_5631", img: "./images/topbanner2_260728_v2.png", alt: "브랜드 특별전", label: "브랜드 특별전" },
  { href: "/pr/vona/economy/july_coreproduct_lg/?bid=bid_kr_all_KR240048_5705", img: "./images/topbanner3_260728.png", alt: "리니어가이드 규격 확대", label: "리니어가이드 규격 확대" },
  { href: "/pr/vona/june_coreproduct?bid=bid_kr_all_KR240048_4861", img: "./images/topbanner4_260626_v2.png", alt: "자동화 설비 부품 확대", label: "자동화 설비 부품 확대" }
];

function badgeClass(label) {
  const key = BADGE_CLASS_MAP[label];
  return key ? ` p-badge--${key}` : "";
}

function catalogProductCard(item) {
  const badgesHtml = (item.badges || []).length
    ? `<span class="p-badges">${item.badges.map(b => `<span class="p-badge${badgeClass(b)}">${esc(b)}</span>`).join("")}</span>`
    : "";
  const monthHtml = item.since ? `<span class="p-month">${esc(formatSinceLabel(item.since))}</span>` : "";
  const priceHtml = item.price
    ? `<span class="p-price">${esc(item.price)}원 ~</span>`
    : `<span class="p-price p-price--none">가격 문의</span>`;
  const detailUrl = `https://kr.misumi-ec.com/vona2/detail/${encodeURIComponent(item.code)}/${item.bid ? `?bid=${encodeURIComponent(item.bid)}` : ""}`;

  return `<li class="p-item" data-code="${esc(item.code)}" data-name="${esc(item.name || "")}" data-brand="${esc(item.brandName || "")}" data-since="${esc(item.since || "")}">
            <a class="p-link" href="${esc(detailUrl)}" target="_blank" rel="noopener">
              <span class="p-thumb">
                <img src="${esc(item.image || "./__missing__.jpg")}" alt="${esc(item.name || "")}" loading="lazy" onerror="lpImgFallback(this)">
                ${badgesHtml}
                ${monthHtml}
              </span>
              <span class="p-brand">${esc(item.brandName || "MISUMI")}</span>
              <span class="p-name">${esc(item.name || "상품명 조회 예정")}</span>
              ${priceHtml}
            </a>
          </li>`;
}

/** "2026-07" → "26.07" (style.css .p-month / lnb-chips 표기와 동일한 형식) */
function formatSinceLabel(since) {
  const m = /^(\d{4})-(\d{2})$/.exec(since || "");
  return m ? `${m[1].slice(2)}.${m[2]}` : since;
}

function catalogSectionHtml(category) {
  const cards = category.items.map(catalogProductCard).join("\n");
  return `      <section class="p-section" id="${esc(category.id)}" data-cat="${esc(category.id)}">
        <div class="p-section-head">
          <h3>${esc(category.label)}</h3>
          <span class="p-section-count"><b>${category.items.length}</b>개</span>
        </div>
        <ul class="p-grid">
${cards}
        </ul>
      </section>`;
}

/**
 * 상단 배너(최대 4개) — 모든 그룹 페이지가 동일한 배너를 공유합니다(캠페인 하나에
 * 배너 세트 하나). banners가 비어있으면 안내 플레이스홀더 하나로 대체합니다.
 * @param {{img: string, href: string, label: string}[]} banners
 */
function catalogBannerHtml(banners) {
  const list = (banners || []).filter(b => b && b.img);
  if (!list.length) {
    return `    <div class="lp-banner">
      <ul class="lp-banner-slides">
        <li class="is-on"><span>배너 이미지를 등록해주세요 (선택)</span></li>
      </ul>
    </div>`;
  }
  const slides = list.map((b, i) =>
    `        <li${i === 0 ? ' class="is-on"' : ""}><a href="${esc(b.href || "#")}" target="_blank" rel="noopener"><img src="${esc(b.img)}" alt="${esc(b.label || "")}"></a></li>`
  ).join("\n");
  const btns = list.map((b, i) =>
    `        <li><button type="button"${i === 0 ? ' class="is-on"' : ""} data-slide="${i}">${esc(b.label || `배너 ${i + 1}`)}</button></li>`
  ).join("\n");

  return `    <div class="lp-banner">
      <ul class="lp-banner-slides">
${slides}
      </ul>
      <ul class="lp-banner-btns">
${btns}
      </ul>
    </div>`;
}

function catalogLnbHtml(group, categories, totalCount, months) {
  const chips = months.map(m =>
    `        <button type="button" class="chip" data-month="${esc(m)}">${esc(formatSinceLabel(m))}월</button>`
  ).join("\n");
  const items = categories.map(c =>
    `        <li><a href="#${esc(c.id)}" data-cat="${esc(c.id)}"><span class="lnb-label">${esc(c.label)}</span><span class="lnb-count">${c.items.length}</span></a></li>`
  ).join("\n");

  return `    <aside class="lnb">
      <p class="lnb-total">표시 <b id="lnbTotal">${totalCount}</b>개</p>
      <div class="lnb-head">
        <span>${esc(group.label)}</span>
        <button type="button" class="lnb-reset">전체보기</button>
      </div>
      <div class="lnb-search">
        <input type="search" id="lpSearch" placeholder="상품명 · 품번 검색" autocomplete="off">
      </div>
      <div class="lnb-chips">
${chips}
      </div>
      <ul class="lnb-list">
${items}
      </ul>
    </aside>`;
}

/**
 * @param {string} groupId CATALOG_GROUPS의 id 중 하나
 * @param {{id: string, label: string, items: object[]}[]} categories 이 그룹의 카테고리별 상품 목록
 * @param {{title?: string, description?: string}} seoMeta
 * @param {{img: string, href: string, label: string}[]} [banners] 상단 배너 (최대 4개, 모든 그룹이 공유)
 * @returns {string} 완성된 그룹 페이지 HTML (style.css/script.js는 별도 파일로 같이 배포해야 함)
 */
/**
 * 그룹 하나의 유효 SEO 메타(타이틀/디스크립션)를 계산합니다. assembleLpCatalogGroupHtml
 * 내부에서 쓰는 것과 완전히 같은 로직을 export해서, generatorLP.js가 checkGuidelinesLP를
 * 돌릴 때도 똑같은 값을 넘길 수 있게 합니다(안 그러면 HTML엔 기본값이 박혀 있는데
 * 검사기는 "타이틀이 비어있습니다"라고 잘못 판단하게 됩니다).
 *
 * ⚠️ 디스크립션 기본값엔 가이드라인 필수 고정 문구(LP_REQUIRED_DESCRIPTION_SUFFIX)를
 * 반드시 붙입니다 — 안 붙이면 매 그룹 페이지가 가이드라인 위반으로 잡힙니다.
 */
export function resolveCatalogSeoMeta(group, totalCount, seoMeta = {}) {
  return {
    title: seoMeta.title || `${group.label} 신상품 | 미스미 신상품 안내`,
    description: seoMeta.description || `한국미스미 ${group.label} 신상품 ${totalCount}건을 확인해보세요. ${LP_REQUIRED_DESCRIPTION_SUFFIX}`,
    keywords: seoMeta.keywords
  };
}

/**
 * @param {{label: string, file: string}} group 지금 만들 그룹 (resolveCatalogGroups 결과 중 하나)
 * @param {{label: string, file: string}[]} allGroups 이번 업로드에 실제로 등장한 전체 그룹 목록 (탭 nav용)
 * @param {{id: string, label: string, items: object[]}[]} categories 이 그룹의 카테고리별 상품 목록
 * @param {{title?: string, description?: string}} seoMeta
 * @param {{img: string, href: string, label: string}[]} banners 상단 배너 (비어있으면 안내 문구로 대체)
 * @returns {string} 완성된 그룹 페이지 HTML (style.css/script.js는 별도 파일로 같이 배포해야 함)
 */
export function assembleLpCatalogGroupHtml(group, allGroups, categories, seoMeta = {}, banners = []) {
  const groupKey = group.file.replace(/\.html$/, "");
  const totalCount = categories.reduce((sum, c) => sum + c.items.length, 0);
  const effectiveSeoMeta = resolveCatalogSeoMeta(group, totalCount, seoMeta);
  const months = [...new Set(categories.flatMap(c => c.items.map(it => it.since)).filter(Boolean))].sort().reverse();
  const sectionsHtml = categories.map(catalogSectionHtml).join("\n");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(effectiveSeoMeta.title)}</title>
  <meta name="description" content="${esc(effectiveSeoMeta.description)}">
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
  <link rel="stylesheet" href="./style.css">
</head>
<body>
<div class="lp" data-group="${esc(groupKey)}">

  <header class="lp-head">
    <h1>미스미 <em>신상품</em> 안내<span class="lp-n">N</span></h1>
    <p class="lp-sub">한국미스미 신상품 빠르게 알아보세요</p>
  </header>

  <div class="lp-inner">

${catalogBannerHtml(banners)}

${catalogTabsHtml(group.label, allGroups)}

    <div class="lp-body">

${catalogLnbHtml(group, categories, totalCount, months)}

      <main class="lp-main">
        <p class="lp-empty" hidden>조건에 맞는 상품이 없습니다. 검색어를 줄이거나 <button type="button" class="lnb-reset lp-empty-reset">전체보기</button>를 눌러주세요.</p>
${sectionsHtml}
      </main>

    </div>
  </div>
</div>
<script src="./script.js"></script>
</body>
</html>`;
}

/** 디자인팀이 전달한 style.css 원문 그대로입니다 — 배포 시 별도 style.css 파일로 나갑니다. */
export const CATALOG_STYLE = `@charset "UTF-8";
/* 신상품 LP — 그룹 페이지 공통 스타일
   모든 그룹 html이 이 파일 하나를 참조합니다.
   색상/치수는 상단 변수만 바꾸면 전체에 반영됩니다. */

:root {
  --lp-accent: #004098;
  --lp-accent-dark: #002f70;
  --lp-ink: #333;
  --lp-ink-sub: #6b7684;
  --lp-line: #ddd;
  --lp-line-soft: #e6eaee;
  --lp-bg-soft: #f0f4f8;
  --lp-badge-fallback: #7b8794;
  --lp-card-min: 148px;
  --lp-max: 1200px;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0; background: #fff; color: var(--lp-ink);
  font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Malgun Gothic", sans-serif;
  -webkit-font-smoothing: antialiased;
}
img { border: 0; }
button { font-family: inherit; }
a { color: var(--lp-accent); }
a:hover { color: var(--lp-accent-dark); }

/* ── 상단 타이틀 ───────────────────────────── */
.lp-head { background: var(--lp-bg-soft); padding: 26px 20px 24px; text-align: center; }
.lp-head h1 {
  margin: 0; font-size: 40px; font-weight: 700; line-height: 1.2;
  letter-spacing: -2px; display: inline-flex; align-items: flex-start; gap: 8px;
}
.lp-head h1 em { font-style: normal; color: var(--lp-accent); }
.lp-n {
  width: 28px; height: 28px; margin-top: 4px; border-radius: 50%;
  background: var(--lp-accent); color: #fff; font-size: 17px; font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center;
}
.lp-sub { margin: 8px 0 0; font-size: 20px; font-weight: 500; letter-spacing: -1px; color: #505050; }

.lp-inner { max-width: var(--lp-max); margin: 0 auto; padding: 28px 20px 80px; }

/* ── 탑배너 ───────────────────────────────── */
.lp-banner { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 28px; }
.lp-banner-slides {
  flex: 1 1 520px; min-width: 0; margin: 0; padding: 0; list-style: none;
  border: 1px solid var(--lp-line-soft); border-radius: 6px; overflow: hidden; background: #f6f8fa;
}
.lp-banner-slides li { display: none; }
.lp-banner-slides li.is-on { display: block; }
.lp-banner-slides img { display: block; width: 100%; aspect-ratio: 1200 / 190; object-fit: cover; }
.lp-banner-btns {
  flex: 0 1 300px; min-width: 220px; display: flex; flex-direction: column;
  margin: 0; padding: 0; list-style: none;
  border: 1px solid #dfdfdf; border-bottom: none;
}
.lp-banner-btns li { flex: 1; display: flex; }
.lp-banner-btns button {
  flex: 1; min-height: 47px; padding: 0 14px; text-align: left; cursor: pointer;
  border: 0; border-bottom: 1px solid #dfdfdf; background: #f6f6f6;
  font-size: 15px; font-weight: 600; letter-spacing: -0.4px; color: #505050;
  transition: background .25s;
}
.lp-banner-btns button:hover { background: #fff; }
.lp-banner-btns button.is-on { background: #fff; color: var(--lp-ink); font-weight: 700; }

/* ── 그룹 탭 (= 페이지 이동 링크) ─────────────
   현재 페이지의 탭에 .is-active 가 붙습니다. */
.lp-tabs {
  display: flex; flex-wrap: nowrap; overflow-x: auto;
  border: 1px solid var(--lp-line); border-right: 0; background: #fff;
  -webkit-overflow-scrolling: touch; scrollbar-width: none;
}
.lp-tabs::-webkit-scrollbar { display: none; }
.lp-tabs a {
  flex: 1 0 auto; height: 48px; padding: 0 16px; display: flex; align-items: center; justify-content: center;
  border-right: 1px solid var(--lp-line); background: #fff; color: var(--lp-ink);
  font-size: 15px; font-weight: 600; letter-spacing: -0.5px; white-space: nowrap;
  text-decoration: none; transition: background .2s, color .2s;
}
.lp-tabs a:hover { background: var(--lp-bg-soft); color: var(--lp-accent); }
.lp-tabs a.is-active { background: var(--lp-ink); color: #fff; cursor: default; }
.lp-tabs a.is-active:hover { background: var(--lp-ink); color: #fff; }

/* ── 본문 2단 ─────────────────────────────── */
.lp-body { display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start; margin-top: 24px; }

/* ── 좌측 LNB ─────────────────────────────── */
.lnb {
  flex: 1 1 240px; position: sticky; top: 12px;
  border: 1px solid var(--lp-line); background: #fff;
}
.lnb-total {
  margin: 0; padding: 16px 0 12px; text-align: center;
  font-size: 24px; font-weight: 500; letter-spacing: -0.5px;
  border-bottom: 1px solid var(--lp-line);
}
.lnb-total b { font-weight: 700; }
.lnb-head {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  height: 50px; padding: 0 14px; background: var(--lp-ink); color: #fff;
  font-size: 18px; font-weight: 600; letter-spacing: -0.5px;
}
.lnb-reset {
  border: 1px solid rgba(255,255,255,.4); background: none; color: #fff;
  font-size: 12px; padding: 4px 9px; border-radius: 3px; cursor: pointer; white-space: nowrap;
}
.lnb-reset:hover { background: rgba(255,255,255,.15); }
.lnb-search { padding: 10px; }
.lnb-search input {
  width: 100%; height: 36px; padding: 0 10px; border: 1px solid #dcdfe3; border-radius: 3px;
  font-family: inherit; font-size: 14px; letter-spacing: -0.3px; outline: 0;
}
.lnb-search input:focus { border-color: var(--lp-accent); }
.lnb-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 10px 10px; }
.chip {
  border: 1px solid #dcdfe3; background: #fff; color: #505050;
  font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 20px; cursor: pointer;
}
.chip:hover { border-color: var(--lp-accent); color: var(--lp-accent); }
.chip.is-on { background: var(--lp-accent); border-color: var(--lp-accent); color: #fff; }
.lnb-list { margin: 0; padding: 0 10px 14px; list-style: none; max-height: 340px; overflow-y: auto; }
.lnb-list a {
  display: flex; justify-content: space-between; align-items: baseline; gap: 8px;
  padding: 7px 10px; border-radius: 3px; text-decoration: none; color: var(--lp-ink);
  font-size: 14px; font-weight: 500; line-height: 1.35; letter-spacing: -0.5px; word-break: keep-all;
}
.lnb-list a:hover { background: #f2f4f6; }
.lnb-list a.is-on { background: #ffe786; font-weight: 700; }
.lnb-list a.is-empty { opacity: .38; }
.lnb-count { font-size: 12px; color: var(--lp-ink-sub); font-variant-numeric: tabular-nums; }

/* ── 상품 영역 ────────────────────────────── */
.lp-main { flex: 999 1 480px; min-width: 0; }
.lp-empty {
  margin: 0 0 24px; padding: 70px 20px; text-align: center;
  border: 1px dashed #dcdfe3; border-radius: 4px;
  color: var(--lp-ink-sub); font-size: 15px; letter-spacing: -0.4px; line-height: 1.7;
}
.lp-empty-reset { border: 1px solid #dcdfe3; background: #fff; color: var(--lp-accent); }
.lp-empty-reset:hover { background: var(--lp-bg-soft); }

.p-section { margin-bottom: 36px; }
.p-section-head {
  display: flex; align-items: baseline; gap: 10px;
  padding-bottom: 10px; margin-bottom: 16px; border-bottom: 2px solid var(--lp-ink);
}
.p-section-head h3 { margin: 0; font-size: 19px; font-weight: 700; letter-spacing: -0.8px; word-break: keep-all; }
.p-section-count { font-size: 14px; color: var(--lp-ink-sub); font-variant-numeric: tabular-nums; }

.p-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(var(--lp-card-min), 1fr));
  gap: 26px 16px; margin: 0; padding: 0; list-style: none;
}
.p-item[hidden] { display: none; }
.p-link { display: block; text-decoration: none; color: inherit; }
.p-thumb {
  position: relative; display: block; aspect-ratio: 1 / 1; padding: 9px; margin-bottom: 8px;
  border: 1px solid var(--lp-line); border-radius: 3px; background: #fff;
  transition: border-color .2s, box-shadow .2s;
}
.p-link:hover .p-thumb { border-color: var(--lp-accent); box-shadow: 0 4px 14px rgba(0,64,152,.13); }
.p-thumb img { display: block; width: 100%; height: 100%; object-fit: contain; }
.p-thumb img.is-fallback { object-fit: cover; }

/* 배지 — 이름이 무엇이든 동일한 범용 스타일.
   색 구분이 필요한 종류만 아래에 추가하고, 정의가 없으면 회색으로 표시됩니다. */
.p-badges { position: absolute; top: 5px; left: 5px; display: flex; flex-wrap: wrap; gap: 3px; max-width: calc(100% - 46px); }
.p-badge {
  background: var(--lp-badge-fallback); color: #fff;
  font-size: 10px; font-weight: 700; letter-spacing: -0.2px; padding: 3px 6px; border-radius: 2px;
  white-space: nowrap;
}
.p-badge--economy { background: #1a1a1a; }
.p-badge--new { background: #b4232a; }

.p-month {
  position: absolute; top: 5px; right: 5px;
  background: #ffe786; color: #4a3a00;
  font-size: 10px; font-weight: 700; padding: 3px 6px; border-radius: 2px;
  font-variant-numeric: tabular-nums;
}
.p-brand { display: block; font-size: 13px; font-weight: 500; line-height: 1.4; margin-bottom: 3px; }
.p-name {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  height: 40px; margin-bottom: 4px;
  font-size: 14px; font-weight: 500; line-height: 20px; letter-spacing: -0.5px;
  color: var(--lp-accent); word-break: keep-all;
}
.p-price { display: block; font-size: 15px; font-weight: 700; letter-spacing: -0.5px; }
.p-price--none { color: var(--lp-ink-sub); font-weight: 500; }

.p-more {
  display: block; width: 100%; height: 54px; margin-top: 4px;
  border: 1px solid var(--lp-line); border-radius: 3px; background: #fff; color: var(--lp-ink);
  font-size: 16px; font-weight: 600; letter-spacing: -0.5px; cursor: pointer;
}
.p-more:hover { background: var(--lp-bg-soft); border-color: var(--lp-accent); }
.p-more[hidden] { display: none; }

/* ── 반응형 ───────────────────────────────── */
@media (max-width: 1024px) {
  .lnb { position: static; flex: 1 1 100%; }
  .lnb-list { max-height: none; }
}
@media (max-width: 640px) {
  :root { --lp-card-min: 130px; }
  .lp-head { padding: 20px 16px; }
  .lp-head h1 { font-size: 28px; letter-spacing: -1.4px; }
  .lp-sub { font-size: 15px; letter-spacing: -0.6px; }
  .lp-inner { padding: 18px 14px 60px; }
  .lp-banner-btns { flex: 1 1 100%; }
  .p-grid { gap: 20px 10px; }
  .p-section-head h3 { font-size: 17px; }
}
`;

/** 디자인팀이 전달한 script.js 원문 그대로입니다 — 배포 시 별도 script.js 파일로 나갑니다. */
export const CATALOG_SCRIPT = `/* 신상품 LP — 그룹 페이지 공통 스크립트 (바닐라 JS, 의존성 없음)
 *
 * 전제: 상품 카드는 이미 HTML에 정적으로 출력되어 있습니다(SEO).
 *       이 스크립트는 DOM을 읽어 검색 / 카테고리 / 월 / 더 보기만 처리합니다.
 *       별도 JSON 파싱이나 렌더링은 하지 않습니다.
 *
 * 확정된 동작
 *  - 검색      : 입력 즉시 필터 (200ms 디바운스). 상품명·품번·브랜드 대상.
 *  - 카테고리  : 단일 선택. 같은 항목을 다시 누르면 해제.
 *  - 월        : 단일 선택 토글. 카테고리와 함께 걸 수 있음(AND).
 *  - 더 보기   : 섹션당 PAGE_SIZE개씩 노출, 버튼 클릭으로 증가. 무한 스크롤 아님.
 *  - 개수 표기 : 필터 결과로 매번 재계산 (수동 입력값 없음).
 */
(function () {
  'use strict';

  var PAGE_SIZE = 60;          // 카테고리 하나를 펼쳤을 때 처음 보여줄 개수
  var PREVIEW_SIZE = 6;        // 전체보기 상태에서 카테고리별 미리보기 개수
  var DEBOUNCE = 200;

  var root = document.querySelector('.lp');
  if (!root) return;

  var searchInput = document.getElementById('lpSearch');
  var totalEl = document.getElementById('lnbTotal');
  var emptyEl = document.querySelector('.lp-empty');
  var lnbLinks = [].slice.call(document.querySelectorAll('.lnb-list a'));
  var chips = [].slice.call(document.querySelectorAll('.chip'));
  var sections = [].slice.call(document.querySelectorAll('.p-section'));

  var state = { q: '', cat: null, month: null, shown: {} };

  /* 카드 색인 (검색용 문자열을 한 번만 만들어 둡니다) */
  var index = sections.map(function (sec) {
    var items = [].slice.call(sec.querySelectorAll('.p-item')).map(function (li) {
      return {
        el: li,
        since: li.getAttribute('data-since') || '',
        hay: ((li.getAttribute('data-name') || '') + ' ' +
              (li.getAttribute('data-code') || '') + ' ' +
              (li.getAttribute('data-brand') || '')).toLowerCase()
      };
    });
    return {
      el: sec,
      cat: sec.getAttribute('data-cat'),
      head: sec.querySelector('.p-section-count'),
      more: sec.querySelector('.p-more'),
      items: items
    };
  });

  function matches(item) {
    if (state.month && item.since !== state.month) return false;
    if (state.q && item.hay.indexOf(state.q) === -1) return false;
    return true;
  }

  function render() {
    var total = 0;
    var visibleSections = 0;
    var filtering = !!(state.q || state.month);
    var counts = {};

    index.forEach(function (sec) {
      var isTarget = !state.cat || state.cat === sec.cat;
      var hits = sec.items.filter(matches);
      counts[sec.cat] = hits.length;
      if (isTarget) total += hits.length;

      if (!isTarget || hits.length === 0) {
        sec.el.hidden = true;
        return;
      }
      sec.el.hidden = false;
      visibleSections++;

      /* 노출 개수: 카테고리를 골랐거나 검색 중이면 PAGE_SIZE 단위, 아니면 미리보기 */
      var base = (state.cat || filtering) ? PAGE_SIZE : PREVIEW_SIZE;
      var limit = state.shown[sec.cat] || base;
      var shownCount = 0;

      sec.items.forEach(function (item) {
        var ok = hits.indexOf(item) !== -1 && shownCount < limit;
        item.el.hidden = !ok;
        if (ok) shownCount++;
      });

      if (sec.head) sec.head.innerHTML = '<b>' + hits.length + '</b>개';

      if (sec.more) {
        var rest = hits.length - shownCount;
        if (rest > 0) {
          sec.more.hidden = false;
          sec.more.textContent = (state.cat || filtering)
            ? '더 보기 (' + rest + '개 남음)'
            : '전체 ' + hits.length + '개 보기';
        } else {
          sec.more.hidden = true;
        }
      }
    });

    if (totalEl) totalEl.textContent = total.toLocaleString();
    if (emptyEl) emptyEl.hidden = visibleSections !== 0;

    lnbLinks.forEach(function (a) {
      var cat = a.getAttribute('data-cat');
      var n = counts[cat] || 0;
      var countEl = a.querySelector('.lnb-count');
      if (countEl) countEl.textContent = n;
      a.classList.toggle('is-on', state.cat === cat);
      a.classList.toggle('is-empty', n === 0);
    });

    chips.forEach(function (b) {
      b.classList.toggle('is-on', state.month === b.getAttribute('data-month'));
    });
  }

  /* 검색 */
  if (searchInput) {
    var timer = null;
    searchInput.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.q = searchInput.value.trim().toLowerCase();
        state.shown = {};
        render();
      }, DEBOUNCE);
    });
    searchInput.addEventListener('search', function () {
      state.q = searchInput.value.trim().toLowerCase();
      state.shown = {};
      render();
    });
  }

  /* 카테고리 — 단일 선택 토글 */
  lnbLinks.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var cat = a.getAttribute('data-cat');
      state.cat = (state.cat === cat) ? null : cat;
      state.shown = {};
      render();
      var target = state.cat ? document.getElementById(cat) : null;
      var y = target ? target.getBoundingClientRect().top + window.pageYOffset - 16 : 0;
      window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
    });
  });

  /* 월 — 단일 선택 토글 */
  chips.forEach(function (b) {
    b.addEventListener('click', function () {
      var m = b.getAttribute('data-month');
      state.month = (state.month === m) ? null : m;
      state.shown = {};
      render();
    });
  });

  /* 더 보기 */
  index.forEach(function (sec) {
    if (!sec.more) return;
    sec.more.addEventListener('click', function () {
      if (!state.cat && !state.q && !state.month) {
        state.cat = sec.cat;        // 미리보기 → 해당 카테고리 펼치기
        state.shown = {};
      } else {
        var base = PAGE_SIZE;
        state.shown[sec.cat] = (state.shown[sec.cat] || base) + PAGE_SIZE;
      }
      render();
    });
  });

  /* 전체보기 (LNB 헤더 · 빈 화면) */
  [].slice.call(document.querySelectorAll('.lnb-reset')).forEach(function (b) {
    b.addEventListener('click', function () {
      state = { q: '', cat: null, month: null, shown: {} };
      if (searchInput) searchInput.value = '';
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* 탑배너 */
  var slides = [].slice.call(document.querySelectorAll('.lp-banner-slides li'));
  var slideBtns = [].slice.call(document.querySelectorAll('.lp-banner-btns button'));
  if (slides.length > 1) {
    var cur = 0;
    var go = function (i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (li, n) { li.classList.toggle('is-on', n === cur); });
      slideBtns.forEach(function (b, n) { b.classList.toggle('is-on', n === cur); });
    };
    slideBtns.forEach(function (b, n) { b.addEventListener('click', function () { go(n); }); });
    setInterval(function () { go(cur + 1); }, 4500);
  }

  render();
})();

/* 이미지 오류 대체 — 카드 마크업의 onerror에서 호출합니다. */
window.lpImgFallback = function (img) {
  if (img.getAttribute('data-fallback')) return;
  img.setAttribute('data-fallback', '1');
  img.classList.add('is-fallback');
  img.src = 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
    '<rect width="200" height="200" fill="#f2f5f8"/>' +
    '<path d="M0 0L200 200M200 0L0 200" stroke="#e2e8ee" stroke-width="1"/>' +
    '<text x="100" y="106" font-family="sans-serif" font-size="13" fill="#9aa6b2" text-anchor="middle">이미지 준비 중</text></svg>');
};

/* 정적 마크업의 배너 이미지에도 같은 폴백을 걸어 둡니다. */
document.addEventListener('DOMContentLoaded', function () {
  [].slice.call(document.querySelectorAll('.lp-banner-slides img')).forEach(function (img) {
    img.addEventListener('error', function () { window.lpImgFallback(img); });
    if (img.complete && img.naturalWidth === 0) window.lpImgFallback(img);
  });
});
`;
