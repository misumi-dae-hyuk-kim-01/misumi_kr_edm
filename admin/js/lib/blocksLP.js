// LP(랜딩페이지) 콘텐츠 HTML을 조립합니다.
// ⚠️ blocks.js(EDM)와 기술 기반이 정반대입니다 — 테이블 대신 클래스 기반 CSS를 씁니다.
// 왜 이렇게 다른지는 GUIDELINE_SOURCES.md / LP_EDM_ARCHITECTURE.md를 참고하세요.
//
// blocks.js(EDM)와 동일한 블록 레지스트리 패턴입니다 — mockData.js의 LP 템플릿이
// blocks 배열로 어떤 블록을 어떤 순서로 쓸지 선언하면, 여기서 그 이름을 실제 렌더
// 함수에 매핑해서 조립합니다. 새 LP 템플릿 추가 시 mockData.js에 선언만 하면 되고,
// 완전히 새로운 블록이 필요할 때만 이 파일에 함수를 추가하면 됩니다.

import { esc } from "./dom.js";
import { LP_WIDTH_PATTERNS, LP_ECONOMY_LAYOUT, DEPLOYMENT_LANG, LP_REQUIRED_DESCRIPTION_SUFFIX } from "./guidelineCheckLP.js";

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

  /* ⚠️ 경제형(page-economy) 전용 — 240px 사이드 + 920px 컨텐츠 분할, 옐로우+블랙 테마.
     아직 디자인팀 목업이 없어서 색상 변수/사이드 내용은 뼈대만 잡아둔 상태입니다.
     실제 목업이 오면 --lp-eco-yellow/--lp-eco-black 값과 .lp-economy__side 내부 마크업만
     바꾸면 되고, 분할 구조(240/920) 자체는 LP_ECONOMY_LAYOUT과 맞춰뒀습니다. */
  .page-economy .lp-wrap {
    --lp-eco-yellow: #ffd400;
    --lp-eco-black: #111;
    display: flex;
    align-items: flex-start;
    gap: 0;
  }
  .lp-economy__side {
    width: ${LP_ECONOMY_LAYOUT.sidebarWidth}px;
    flex: 0 0 ${LP_ECONOMY_LAYOUT.sidebarWidth}px;
    background: var(--lp-eco-black);
    color: var(--lp-eco-yellow);
    min-height: 100%;
    padding: 24px 16px;
    box-sizing: border-box;
  }
  .lp-economy__content {
    width: ${LP_ECONOMY_LAYOUT.contentWidth}px;
    flex: 0 0 ${LP_ECONOMY_LAYOUT.contentWidth}px;
    box-sizing: border-box;
  }
  .page-economy .lp-hero { background: var(--lp-eco-black); color: var(--lp-eco-yellow); }
  .page-economy .lp-product-card__price { color: var(--lp-eco-black); }
`;

/**
 * @param {object} draft LP 생성기 폼 상태
 * @param {object|null} template store.templates에서 찾은 LP 템플릿 (blocks 배열의 단일 출처)
 * @param {{title, description, keywords}} seoMeta
 * @returns {string} 완성된 LP HTML
 */
/** 경제형 사이드 영역 — 디자인팀 목업이 오기 전까지의 임시 뼈대입니다.
 *  브레드크럼을 여기로 옮겨서 "경제형은 사이드에 카테고리 내비를 둔다"는 구조만
 *  잡아뒀습니다. 실제 내용(카테고리 트리 등)은 목업 확인 후 교체하세요. */
function economySideBlock(draft) {
  return `<aside class="lp-economy__side">${breadcrumbBlock(draft)}</aside>`;
}

export function assembleLpHtml(draft, template, seoMeta = {}) {
  const isEconomy = draft.pageType === LP_ECONOMY_LAYOUT.pageType;
  // 경제형은 총 폭이 항상 1200px 고정입니다(내부에서 240/920으로 나뉘는 것뿐) —
  // widthPattern 값과 무관하게 여기서 강제합니다.
  const effectiveWidthPattern = isEconomy ? LP_ECONOMY_LAYOUT.totalWidth : (draft.widthPattern || 1200);
  const widthInfo = LP_WIDTH_PATTERNS[effectiveWidthPattern] || LP_WIDTH_PATTERNS[1200];
  const bodyClass = isEconomy ? LP_ECONOMY_LAYOUT.class : (widthInfo.class || "page-unknown");
  const keywordsAttr = (seoMeta.keywords || []).join(", ");

  const blockNames = (template && template.blocks && template.blocks.length)
    ? template.blocks
    : FALLBACK_BLOCKS;

  // 경제형은 브레드크럼을 사이드로 빼고, 나머지 블록만 오른쪽 컨텐츠 컬럼에 놓습니다.
  const contentBlockNames = isEconomy ? blockNames.filter(name => name !== "브레드크럼") : blockNames;

  const bodyHtml = contentBlockNames.map(name => {
    const render = blockRegistry[name];
    if (!render) {
      console.warn(`[blocksLP.js] 레지스트리에 없는 블록명입니다: "${name}"`);
      return "";
    }
    return render(draft) || "";
  }).filter(Boolean).join("\n");

  const wrapInner = isEconomy
    ? `${economySideBlock(draft)}<div class="lp-economy__content">${bodyHtml}</div>`
    : bodyHtml;

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${DEPLOYMENT_LANG}" lang="${DEPLOYMENT_LANG}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(seoMeta.title || draft.catchcopy || "")}</title>
<meta name="description" content="${esc(seoMeta.description || "")}">
<meta name="keywords" content="${esc(keywordsAttr)}">
<style>
  .lp-wrap { max-width: ${effectiveWidthPattern}px; }
  ${STYLE}
</style>
</head>
<body class="${bodyClass}">
  <div class="lp-wrap">${wrapInner}</div>
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

function badgeClass(label) {
  const key = BADGE_CLASS_MAP[label];
  return key ? ` p-badge--${key}` : "";
}

/**
 * 엑셀 bid 열에 순수 코드("bid_kr_all_..."))가 들어올 수도, 이미 완성된 쿼리스트링
 * ("?bid=bid_kr_all_...")이 들어올 수도 있습니다 — 담당자마다 기존에 쓰던 시트를 복사해서
 * 채우다 보니 두 형태가 섞여 들어옵니다. 어느 쪽이 오든 항상 순수 코드만 뽑아내서,
 * 뒤에서 `?bid=` + encodeURIComponent를 한 번만 씌우게 만듭니다.
 * (이 방어 처리가 없으면 이미 "?bid="가 붙은 값을 다시 encodeURIComponent로 감싸서
 * "?bid=%3Fbid%3Dbid_kr_..." 처럼 이중 인코딩되는 버그가 발생합니다.)
 */
function normalizeBid(raw) {
  if (!raw) return "";
  const trimmed = String(raw).trim();
  const m = /bid=([^&]+)/.exec(trimmed); // "?bid=xxx" 또는 "...&bid=xxx" 형태에서 값만 추출
  const value = m ? m[1] : trimmed;
  try {
    return decodeURIComponent(value); // 혹시 이미 인코딩된 채로 들어온 경우까지 대비
  } catch {
    return value; // decode 실패 시(정상적인 순수 코드인데 %가 우연히 들어간 경우 등) 원본 그대로
  }
}

function catalogProductCard(item) {
  const badgesHtml = (item.badges || []).length
    ? `<span class="p-badges">${item.badges.map(b => `<span class="p-badge${badgeClass(b)}">${esc(b)}</span>`).join("")}</span>`
    : "";
  const monthHtml = item.since ? `<span class="p-month">${esc(formatSinceLabel(item.since))}</span>` : "";
  const priceHtml = item.price
    ? `<span class="p-price">${esc(item.price)}원 ~</span>`
    : `<span class="p-price p-price--none">가격 문의</span>`;
  const bid = normalizeBid(item.bid);
  const detailUrl = `https://kr.misumi-ec.com/vona2/detail/${encodeURIComponent(item.code)}/${bid ? `?bid=${encodeURIComponent(bid)}` : ""}`;

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

// ==========================================================================
// 이벤트 LP (README.md / GENERATOR_SPEC.md 기준) — 공통 셸에 SSI로 얹히는
// "부분 문서"용 블록입니다. 기존 일반형/경제형/신상품카탈로그 LP와는 완전히
// 다른 배포 모델입니다:
//   - index.html: 홈페이지 공통 셸(header/footer/사이드바)에 SSI로 얹히는
//     부분 문서 → 웹서버(SSI 처리 가능)에 올라가야 함. S3 단독 배포 불가
//     (SSI가 실행 안 되면 헤더/푸터/사이드바가 통째로 빠짐 — 개발팀 확인 중)
//   - css/style.css, images/*: S3 + CloudFront
// 이 함수들은 "콘텐츠 컬럼 내부"만 만듭니다 — 공통 셸 include는 건드리지 않습니다.
// ==========================================================================

/** README "Design Tokens" 표 그대로 옮긴 스킨별 값.
 *  ⚠️ 마크업은 두 스킨이 완전히 동일하고, 색상·최대폭·좌우여백만 다릅니다. */
export const EVENT_LP_SKINS = {
  normal: {
    key: "normal",
    wrapperWidthPc: 950,
    paddingInline: "clamp(20px, 5vw, 60px)",
    main: "#0f218b",
    mainHover: "#172ea3",
    emphasis: "#ffd633",
    cardAccent: "#ffcc00",
    bodyText: "#17171b",
    subText: "#666",
    noticeText: "#777",
    stepLabel: "#8a90b0",
    iconBg: "#eef0f8",
    cardBorder: "#dfe1ee",
    stepSectionBg: "#f5f6fa",
    noticeBg: "#f5f5f5",
    contactBadgeSecondaryBg: "#5b6280",
    linkColor: "#004bb1",
    ctaSecondaryMaxWidth: 330,
    summaryLabelBg: "#fff",
    summaryLabelText: "#0f218b"
  },
  economy: {
    key: "economy",
    // ⚠️ 이 920은 미스미 "경제형" 브랜드의 표준 컨텐츠 폭이라, 일반형/경제형 LP의
    // LP_ECONOMY_LAYOUT.contentWidth(240 사이드+920 컨텐츠=총 1200)와 정확히 같은
    // 값이어야 합니다. 따로 숫자를 하드코딩하면 한쪽만 바뀌었을 때 불일치가
    // 생기므로, 여기서도 같은 상수를 그대로 참조합니다.
    wrapperWidthPc: LP_ECONOMY_LAYOUT.contentWidth,
    paddingInline: "clamp(20px, 4.5vw, 45px)",
    main: "#111",
    mainHover: "#1c1c1c",
    emphasis: "#ffcc00",
    cardAccent: "#ffcc00",
    cardAccentBg: "#fffdf2",
    bodyText: "#111",
    subText: "#666",
    noticeText: "#777",
    stepLabel: "#888",
    iconBg: "#eef0f8",
    cardBorder: "#e2e2e2",
    cardBorderMuted: "#d9d9d9",
    stepSectionBg: "#f5f6fa",
    noticeBg: "#f6f6f6",
    contactBadgeSecondaryBg: "#555",
    linkColor: "#004bb1",
    ctaSecondaryMaxWidth: 320,
    summaryLabelBg: "#ffcc00",
    summaryLabelText: "#111"
  }
};

export const EVENT_LP_TEMPLATE_ID = "event-lp";

function eventSkinOf(skinKey) {
  return EVENT_LP_SKINS[skinKey] || EVENT_LP_SKINS.normal;
}

/** headline의 <em>강조구간</em>은 최대 1개(검증 규칙) — 2개 이상이면 첫 번째만
 *  실제 강조 처리하고 나머지는 일반 텍스트로 풀어 안전하게 방어합니다. */
export function normalizeHeadlineEm(headline) {
  let count = 0;
  return String(headline || "").replace(/<em>(.*?)<\/em>/g, (m, inner) => {
    count++;
    return count === 1 ? `<em>${inner}</em>` : inner;
  });
}

function eventKvBlock(draft, skin) {
  const badgeHtml = draft.kvBadge ? `<div class="lp-kv-badge">${esc(draft.kvBadge)}</div>` : "";
  const subcopyHtml = draft.kvSubcopy ? `<div class="lp-kv-subcopy">${esc(draft.kvSubcopy)}</div>` : "";
  const headlineHtml = normalizeHeadlineEm(draft.kvHeadline);
  const bgStyle = draft.kvImageUrl
    ? `background-image:url('${esc(draft.kvImageUrl)}');background-size:cover;background-position:center;`
    : `background:repeating-linear-gradient(135deg, ${skin.main}, ${skin.main} 12px, ${skin.mainHover} 12px, ${skin.mainHover} 24px);`;
  return `<div class="lp-kv" role="img" aria-label="${esc(draft.kvAlt || "")}" style="${bgStyle}">
    <div class="lp-kv-inner">
      ${badgeHtml}
      <div class="lp-kv-headline">${headlineHtml}</div>
      ${subcopyHtml}
    </div>
  </div>`;
}

/** 요약표 강조는 최대 1개 — 2개 이상 표시돼 있으면 첫 번째만 남기고 나머지는 해제. */
export function enforceSingleEmphasis(rows) {
  let seen = false;
  return (rows || []).map(row => {
    if (row.emphasis && !seen) { seen = true; return row; }
    return { ...row, emphasis: false };
  });
}

function eventSummaryBlock(rows) {
  const items = enforceSingleEmphasis(rows || []).map(row => `
    <div class="lp-summary-row">
      <div class="lp-summary-label">${esc(row.label)}</div>
      <div class="lp-summary-value${row.emphasis ? " is-emphasis" : ""}">${esc(row.value)}</div>
    </div>`).join("\n");
  return `<div class="lp-summary">${items}</div>`;
}

/** "구간형 판정 정규식" — GENERATOR_SPEC.md 그대로. 금액("100,000원 이상") 또는
 *  회차("3회차") 형태의 조건값인지 확인합니다. */
const TIER_CONDITION_RE = /^[\d,]+원\s*이상$/;
const TIER_ROUND_RE = /^\d+회차$/;

function isTierCondition(condition) {
  const c = String(condition || "").trim();
  return TIER_CONDITION_RE.test(c) || TIER_ROUND_RE.test(c);
}

/** 유형은 입력 구조가 결정합니다 — 라디오 버튼을 두면 안 됩니다.
 *  모든 항목의 condition이 구간형 패턴이면 "tier", 하나라도 아니면 "list". */
export function detectBenefitType(items) {
  if (!items || !items.length) return "list";
  return items.every(it => isTierCondition(it.condition)) ? "tier" : "list";
}

/** 개수 → 레이아웃 규칙(GENERATOR_SPEC.md 표 그대로). auto-fit 금지 — 트랙 수 명시 + span. */
export function benefitLayoutRule(count) {
  if (count < 1 || count > 5) {
    throw new Error("혜택이 6개 이상이면 카드가 아니라 표로 정리하는 편이 읽힙니다. 항목을 묶거나 유의사항으로 내려주세요.");
  }
  return count === 1 ? { tracks: 1, spanOf: () => null, banner: true }
    : count === 4 ? { tracks: 2, spanOf: () => null, banner: false }
    : count === 5 ? { tracks: 6, spanOf: i => (i < 3 ? 2 : 3), banner: false }
    : { tracks: count, spanOf: () => null, banner: false }; // 2, 3개
}

function eventBenefitsBlock(draft, skin) {
  const items = draft.benefitItems || [];
  const type = detectBenefitType(items);
  const isTierRow = type === "tier" && items.length === 5; // 구간형 5개 = 1행 5열 예외
  const layout = isTierRow ? { tracks: 5, spanOf: () => null, banner: false } : benefitLayoutRule(items.length);

  const subcopyHtml = draft.benefitSubcopy ? `<p class="lp-benefit-subcopy">${esc(draft.benefitSubcopy)}</p>` : "";

  const cardsHtml = items.map((item, i) => {
    const detailHtml = (item.detail || []).filter(Boolean).map(d => `<li>${esc(d)}</li>`).join("");
    const spanCss = layout.spanOf(i) ? `grid-column:span ${layout.spanOf(i)};` : "";
    if (isTierRow) {
      const isLast = i === items.length - 1; // 구간형은 항상 마지막(최고 등급)이 강조
      return `<div class="lp-benefit-card lp-benefit-card--tier${isLast ? " is-top" : ""}" style="${spanCss}">
        <div class="lp-benefit-cap">${esc(item.condition)}</div>
        <div class="lp-benefit-title">${esc(item.title)}</div>
        <ul class="lp-benefit-list">${detailHtml}</ul>
      </div>`;
    }
    const accentColor = i % 2 === 0 ? skin.main : skin.cardAccent;
    return `<div class="lp-benefit-card${layout.banner ? " lp-benefit-card--banner" : ""}" style="${spanCss}border-top-color:${accentColor};">
      <div class="lp-benefit-cap" style="color:${accentColor === skin.cardAccent ? "#8a6d00" : skin.main};">${esc(item.condition || "")}</div>
      <div class="lp-benefit-title">${esc(item.title)}</div>
      <ul class="lp-benefit-list">${detailHtml}</ul>
    </div>`;
  }).join("\n");

  return `<div class="lp-benefits">
    <h2 class="lp-benefit-heading">${esc(draft.benefitHeading || "이벤트 혜택")}</h2>
    ${subcopyHtml}
    <div class="lp-benefit-grid" style="grid-template-columns:repeat(${layout.tracks},1fr);" data-benefit-type="${type}">
      ${cardsHtml}
    </div>
  </div>`;
}

const EVENT_STEP_ICONS = {
  cart: `<path d="M3 4h2.2l2.3 10.4h9.6L19 7H6.2"></path><circle cx="9.5" cy="19" r="1.4"></circle><circle cx="16.5" cy="19" r="1.4"></circle>`,
  click: `<path d="M7.5 3.5v6"></path><path d="M4.4 6.2l2.1 2.1"></path><path d="M10.6 6.2L8.5 8.3"></path><path d="M10 12.2l9.4 3.4-3.7 1.4-1.4 3.7z"></path>`,
  form: `<path d="M13 3.5H5.5v17h13V9"></path><path d="M8.6 9.5h4"></path><path d="M8.6 13.4h6.8"></path><path d="M8.6 17.2h4.8"></path><path d="M15.6 3.2l4.6 4.6-1.9.5-.5 1.9z"></path>`,
  upload: `<path d="M12 16V4"></path><path d="M6 10l6-6 6 6"></path><path d="M4 20h16"></path>`,
  check: `<path d="M4 12l5 5L20 6"></path>`
};

function eventStepsBlock(draft) {
  const items = draft.stepItems || [];
  if (!items.length) return ""; // 블록 자체를 비우면 미출력 (구매·응모가 한 동작인 이벤트)
  const itemsHtml = items.map((it, i) => `
    <div class="lp-step-card">
      <div class="lp-step-label">STEP <b>${String(i + 1).padStart(2, "0")}</b></div>
      <div class="lp-step-icon">
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${EVENT_STEP_ICONS[it.icon] || EVENT_STEP_ICONS.click}</svg>
      </div>
      <div class="lp-step-text">${it.text}</div>
    </div>`).join("\n");
  const noteHtml = draft.stepNote ? `<p class="lp-step-note">${esc(draft.stepNote)}</p>` : "";
  return `<div class="lp-steps">
    <h2 class="lp-step-heading">${esc(draft.stepHeading || "이벤트 참여 방법")}</h2>
    <div class="lp-step-grid">${itemsHtml}</div>
    ${noteHtml}
  </div>`;
}

function eventCtaBlock(draft) {
  if (!draft.ctaPrimaryHref) return "";
  const secondaryHtml = draft.ctaSecondaryHref
    ? `<a href="${esc(draft.ctaSecondaryHref)}" class="lp-cta-btn lp-cta-btn--secondary" target="_blank" rel="noopener">${esc(draft.ctaSecondaryLabel || "")}</a>`
    : "";
  const primaryHtml = `<a href="${esc(draft.ctaPrimaryHref)}" class="lp-cta-btn lp-cta-btn--primary" target="_blank" rel="noopener">${esc(draft.ctaPrimaryLabel || "이벤트 응모하기")}</a>`;
  const singleClass = draft.ctaSecondaryHref ? "" : " lp-cta--single";
  return `<div class="lp-cta${singleClass}">${secondaryHtml}${primaryHtml}</div>`;
}

/** 공통 문구 마스터 — GENERATOR_SPEC.md 그대로. 절대 수정 금지(법무 확인 텍스트).
 *  11번(문의처)은 항상 마지막에 자동 부착하므로 체크리스트엔 안 넣고 별도 처리합니다. */
export const NOTICE_COMMON_MASTER = [
  "구매 금액은 할인 적용 후 VAT 미포함 금액 기준입니다.",
  "응모와 구매 월이 동일해야 하며 순서는 상관없습니다. (구매 후 응모 / 응모 후 구매 무관)",
  "당첨 후 발주를 취소할 경우 당첨이 취소되며, 미사용 사은품 반환 또는 전액(소비자가) 반환 청구 됩니다.",
  "이벤트 신청 시 등록해 주신 휴대폰 번호로 모바일 금액권이 발송됩니다. (번호 오기입으로 인한 재발송은 불가합니다.)",
  "고객 정보 및 휴대폰 번호가 불명확한 경우 당첨에서 취소됩니다.",
  "경품은 한 업체에 1회 지급으로 제한되어 있으며, 주문자별 중복 발행은 되지 않습니다.",
  "경품은 양도할 수 없으며, 정해진 경품 대신에 그에 상응하는 현금이나 기타 경품을 요구할 수 없습니다.",
  "본 이벤트는 당사 사정에 의해 예고 없이 변경 또는 조기 종료될 수 있습니다.",
  "오후 6시 이후 주문건은 다음날로 실적이 집계될 수 있습니다.",
  "개인정보 취급위탁동의(당사의 서비스 이행을 위해 아래와 같이 경품배송 업무를 위탁합니다) 수탁자 : 비즈 쿠팝 / 제공 범위 : 휴대폰 번호 / 수탁범위 : 경품 배송"
];
const NOTICE_CONTACT_LINE = "이벤트 관련 문의처 : event@misumi.co.kr";

function eventNoticeBlock(draft, skin) {
  const commonLines = (draft.noticeCommonIndexes || [])
    .filter(i => i >= 0 && i < NOTICE_COMMON_MASTER.length)
    .map(i => NOTICE_COMMON_MASTER[i]);
  const customLines = (draft.noticeCustom || []).filter(Boolean);
  const itemsHtml = [...commonLines, ...customLines].map(line => `<li>※ ${esc(line)}</li>`).join("\n");
  const contactHtml = `<li>※ ${NOTICE_CONTACT_LINE.replace("event@misumi.co.kr", `<a href="mailto:event@misumi.co.kr" style="color:${skin.linkColor};text-decoration:underline;">event@misumi.co.kr</a>`)}</li>`;
  return `<div class="lp-notice">
    <strong class="lp-notice-heading">${esc(draft.noticeHeading || "응모 주의사항")}</strong>
    <ul class="lp-notice-list">
      ${itemsHtml}
      ${contactHtml}
    </ul>
  </div>`;
}

/** ⚠️ 실제 배포본에서는 이 자리에 직접 렌더링하지 않고
 *  `<!--#include virtual="/pr/common/contact/event.html" -->` 한 줄만 넣습니다
 *  (이벤트별로 다른 연락처를 쓸 일이 없으므로 입력 필드를 두지 않음). */
function eventContactIncludeTag() {
  return `<!--#include virtual="/pr/common/contact/event.html" -->`;
}

const EVENT_LP_STYLE = `
  /* ⚠️ 사이트 공통 CSS(import_head_css.html, SSI)에 기대지 않는 독립 기본값 —
     SSI가 처리 안 돼도(또는 아직 해결 전이어도) 이 LP 콘텐츠 블록만은 항상
     의도한 대로 보이게 하기 위함. 헤더/푸터 자체의 스타일은 어차피 SSI가
     처리해야 나오므로 이걸로 못 고치지만, 최소한 저희가 만드는 콘텐츠는
     이 리셋 덕분에 SSI 상태와 무관하게 항상 정상 렌더링됩니다. */
  body{margin:0;background:#fff;font-family:"Pretendard Variable",Pretendard,sans-serif;-webkit-text-size-adjust:100%;}
  .lp-kv{min-height:clamp(240px,32vw,300px);display:flex;align-items:center;justify-content:center;text-align:center;padding:clamp(28px,5vw,40px) var(--lp-pad,20px);box-sizing:border-box;}
  .lp-kv-badge{display:inline-block;background:#ffcc00;color:#111;font-size:clamp(12px,1.6vw,14px);padding:6px 18px;border-radius:20px;margin-bottom:10px;}
  .lp-kv-headline{font-size:clamp(22px,3.6vw,32px);line-height:1.35;letter-spacing:-.5px;color:#fff;}
  .lp-kv-headline em{color:#ffd633;font-style:normal;}
  .lp-kv-subcopy{font-size:clamp(15px,2.2vw,20px);line-height:1.5;color:#ffd633;margin-top:14px;}
  .lp-summary{padding:clamp(28px,4.5vw,44px) var(--lp-pad,20px);display:flex;flex-direction:column;gap:14px;background:var(--lp-main,#0f218b);box-sizing:border-box;}
  .lp-summary-row{display:flex;flex-wrap:wrap;gap:8px 20px;align-items:baseline;}
  .lp-summary-label{flex:0 0 auto;width:clamp(110px,18vw,170px);line-height:36px;border-radius:6px;text-align:center;font-size:clamp(14px,1.7vw,16px);background:var(--lp-summary-label-bg,#fff);color:var(--lp-summary-label-text,#0f218b);}
  .lp-summary-value{flex:1 1 240px;font-size:clamp(14px,1.7vw,16px);line-height:1.6;color:#fff;}
  .lp-summary-value.is-emphasis{color:#ffd633;}
  .lp-benefits{padding:clamp(36px,5.5vw,56px) var(--lp-pad,20px);background:#fff;box-sizing:border-box;}
  .lp-benefit-heading{text-align:center;font-size:clamp(20px,2.8vw,26px);letter-spacing:-.5px;margin:0 0 8px;}
  .lp-benefit-subcopy{text-align:center;font-size:clamp(14px,1.6vw,15px);line-height:1.6;color:#666;margin:0 0 clamp(22px,3vw,30px);}
  .lp-benefit-grid{display:grid;gap:18px;}
  .lp-benefit-card{border:1px solid #dfe1ee;border-top:4px solid;padding:clamp(20px,3vw,26px) clamp(20px,3vw,28px);box-sizing:border-box;}
  .lp-benefit-card--banner{display:flex;flex-wrap:wrap;gap:12px 40px;align-items:center;justify-content:space-between;}
  .lp-benefit-card--tier{text-align:center;padding:22px 10px 24px;border-color:#e2e2e2;border-top-color:#d9d9d9;}
  .lp-benefit-card--tier.is-top{border-color:#111;border-top-color:#ffcc00;background:#fffdf2;}
  .lp-benefit-cap{font-size:clamp(13px,1.6vw,14px);letter-spacing:.02em;}
  .lp-benefit-title{font-size:clamp(17px,2vw,19px);line-height:1.4;margin-top:8px;color:#17171b;}
  .lp-benefit-list{list-style:none;margin:14px 0 0;padding:0;display:flex;flex-direction:column;gap:10px;font-size:clamp(14px,1.7vw,16px);line-height:1.5;color:#55555e;}
  .lp-steps{padding:clamp(36px,5.2vw,52px) var(--lp-pad,20px);background:#f5f6fa;box-sizing:border-box;}
  .lp-step-heading{text-align:center;font-size:clamp(20px,2.8vw,26px);letter-spacing:-.5px;margin:0 0 clamp(22px,3vw,30px);}
  .lp-step-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px;}
  .lp-step-card{background:#fff;padding:clamp(22px,3vw,28px) 20px clamp(24px,3vw,30px);text-align:center;box-sizing:border-box;}
  .lp-step-label{font-size:13px;letter-spacing:.08em;color:#8a90b0;}
  .lp-step-icon{margin:18px auto 20px;width:76px;height:76px;border-radius:50%;background:#eef0f8;display:flex;align-items:center;justify-content:center;color:#0f218b;}
  .lp-step-text{font-size:clamp(15px,1.8vw,17px);line-height:1.55;color:#17171b;}
  .lp-step-note{margin:22px 0 0;text-align:center;font-size:clamp(13px,1.5vw,14px);line-height:1.6;color:#666;}
  .lp-cta{padding:clamp(30px,4.4vw,44px) var(--lp-pad,20px);display:flex;flex-wrap:wrap;gap:14px;justify-content:center;box-sizing:border-box;}
  .lp-cta--single{justify-content:center;}
  .lp-cta-btn{flex:1 1 260px;max-width:330px;box-sizing:border-box;padding:19px 0;text-align:center;font-size:clamp(16px,1.9vw,18px);text-decoration:none;border:2px solid;}
  .lp-cta-btn--secondary{color:#0f218b;border-color:#0f218b;background:#fff;}
  .lp-cta-btn--primary{color:#fff;border-color:#0f218b;background:#0f218b;}
  .lp-notice{padding:clamp(26px,3.4vw,34px) var(--lp-pad,20px);background:#f5f5f5;font-size:clamp(13px,1.5vw,14px);line-height:1.55;color:#777;box-sizing:border-box;}
  .lp-notice-heading{display:block;margin-bottom:18px;color:#17171b;font-size:15px;}
  .lp-notice-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;}
  body.lp-skin--economy .lp-summary{background:#111;}
  body.lp-skin--economy .lp-kv-headline em{color:#ffcc00;}
  body.lp-skin--economy .lp-cta-btn--primary{color:#111;background:#ffcc00;border-color:#ffcc00;}
`;

/** README "Target output" 규정 그대로 — index.html은 <link>로 참조만 하고,
 *  실제 CSS 규칙은 이 함수가 만드는 별도 파일(css/style_<날짜>.css)에 있어야 합니다.
 *  ⚠️ 예전엔 assembleEventLpHtml()이 이 규칙을 어기고 <style> 태그로 인라인
 *  넣고 있었습니다 — <link>는 존재하지도 않는 파일을 가리키는 죽은 참조였고,
 *  실제 스타일은 중복으로 인라인에 있었습니다. 이제 분리했습니다.
 *  @param {string} [skinKey] "normal" | "economy" */
export function buildEventLpCss(skinKey) {
  const skin = eventSkinOf(skinKey);
  return `:root{
  --lp-main:${skin.main};
  --lp-pad:${skin.paddingInline};
  --lp-summary-label-bg:${skin.summaryLabelBg};
  --lp-summary-label-text:${skin.summaryLabelText};
}
${EVENT_LP_STYLE}`;
}

/** 이벤트 LP 전체 조립. GENERATOR_SPEC.md 1절의 고정 head/body 구조를 따릅니다.
 *  ⚠️ 이건 "콘텐츠 컬럼 내부 + 최소 확인용 셸"만 만듭니다 — 실제 배포 시엔 아래
 *  head_navi.html / foot.html 등 SSI include로 진짜 헤더·푸터가 치환되어야 하고,
 *  지금은 그 부분이 안 되어 있어 미리보기/시연용으로만 씁니다(개발팀 확인 중인 사안).
 *
 *  ⚠️⚠️ 2026-08-21 실제로 확인됨: 헤더/푸터가 안 붙는 문제보다 앞서서, 이 SSI
 *  include 구문(`<!--#include virtual="..." -->`) 자체가 S3 업로드 시점에
 *  403으로 차단됩니다(회사 S3 버킷의 보안 스캐너로 추정 — SSI 인젝션 공격의
 *  표준 시그니처라 이런 필터링이 흔함). 콘솔에서 직접 재현 테스트 완료:
 *  이 include 줄이 없는 HTML은 업로드 성공, 있으면 실패. 그래서 이 함수의
 *  결과물은 S3에 "잘못 배포되어 헤더가 안 보이는" 정도가 아니라, **애초에
 *  업로드 자체가 안 될 가능성이 높습니다** — generatorLP.js가 다운로드/S3배포
 *  버튼에 이 사실을 명시하는 이유입니다.
 *  @param {object} draft
 *  @param {{title?:string, description?:string, keywords?:string[]}} [seoMeta] */
export function assembleEventLpHtml(draft, seoMeta = {}) {
  const skin = eventSkinOf(draft.eventSkin);
  const skinClass = draft.eventSkin === "economy" ? "lp-skin--economy" : "lp-skin--normal";
  const wrapperWidth = skin.wrapperWidthPc;

  const bodyHtml = [
    eventKvBlock(draft, skin),
    eventSummaryBlock(draft.summaryRows),
    eventBenefitsBlock(draft, skin),
    eventStepsBlock(draft),
    eventCtaBlock(draft),
    eventNoticeBlock(draft, skin),
    eventContactIncludeTag()
  ].filter(Boolean).join("\n");

  const title = esc((seoMeta.title || draft.title || "") + " ｜ MISUMI｜미스미 종합 Web 카탈로그");
  const description = esc(seoMeta.description || draft.description || "");

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${DEPLOYMENT_LANG}" lang="${DEPLOYMENT_LANG}">
<head>
<!--#config errmsg="" -->
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="https://kr.misumi-ec.com/pr/vona/${esc(draft.slug || "")}/" />
<!--#include virtual="/vcommon/common/include/import_head_css.html" -->
<!-- ⚠️ 폰트는 SSI와 무관하게 CDN에서 직접 로드 — 원본 프로토타입(이벤트LP-일반형_dc.html)
     그대로. 이걸 빠뜨리면 SSI 해결 여부와 상관없이 브라우저 기본 서체로 보입니다. -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
<style>
@font-face{font-family:"GmarketSansMedium";src:url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff") format("woff");font-weight:normal;font-style:normal}
@font-face{font-family:"GmarketSansBold";src:url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff") format("woff");font-weight:normal;font-style:normal}
</style>
<link href="${esc(draft.assetBaseUrl || "")}/${esc(draft.slug || "")}/css/style_${esc(draft.cssVersion || "")}.css" rel="stylesheet" type="text/css" media="all" />
<script type="text/javascript">
<!--
var agentType = "win16|win32|win64|mac|macintel";
if (navigator.platform) {
	if (agentType.indexOf(navigator.platform.toLowerCase()) < 0)
		location.href = '/sp/pr/vona/${esc(draft.slug || "")}/' + location.search;
}
//-->
</script>
</head>
<body class="page2 ${skinClass}">
	<!--#include virtual="/vcommon/common/include/import_head_js.html" -->
	<div class="l-wrapper">
		<!--#include virtual="/vcommon/common/include/head_navi.html" -->
		<div class="l-main">
			<div data-user="attention">
				<!--#include virtual="/vcommon/common/include/attention_all.html" -->
			</div>
			<ul class="l-breadcrumb">
				<li><a href="/">MISUMI HOME</a>&gt;</li>
				<li><strong>${esc(draft.breadcrumbLabel || draft.title || "")}</strong></li>
			</ul>
			<div class="l-contentWrap">
				<div class="l-content" style="max-width:${wrapperWidth}px;margin:0 auto;">
					${bodyHtml}
				</div>
				<div class="l-nav">
					<!--#include virtual="/vcommon/common/include/side_user_menu.html" -->
					<div class="r-wingRight"><ul class="r-banner"></ul></div>
				</div>
			</div>
		</div>
		<!--#include virtual="/vcommon/common/include/foot.html" -->
	</div>
	<!--#include virtual="/vcommon/common/include/import_foot.html" -->
	<!--#include virtual="/vcommon/common/include/analyze.html" -->
</body>
</html>`;
}

// ==========================================================================
// 경제형 전체상품 라인업 (경제형_LP_템플릿_v2_dc.html 기준) — 신상품카탈로그와
// 다른 "다중 뷰 허브" 유형입니다. 신상품카탈로그와 마찬가지로 상시 운영(계속
// 갱신)되는 페이지지만, 구조가 다릅니다 — 카탈로그는 그룹별 개별 페이지인 반면,
// 이건 경제형 제품
// 전체를 카테고리별로 보여주는 정적 허브 페이지(/pr/vona/economy/ 성격)이고,
// PC메인 / 전체라인업 / 모바일 / 데이터(QA) 4개 뷰로 구성됩니다.
// ⚠️ 모바일(SP) 뷰는 원본 프로토타입에도 "sp CSS를 전달받지 않아 레이아웃만
// 잡아둔 상태"라고 명시되어 있어, 여기서도 동일하게 자리만 잡아둔 placeholder로
// 구현합니다 — 실제 SP CSS가 오면 그때 마저 채웁니다.
// ==========================================================================

export const ECONOMY_LINEUP_TEMPLATE_ID = "economy-lineup";

/** bid 자동생성 규칙 — 경제형_LP_템플릿_v2_dc.html의 Component.bid()/href() 그대로.
 *  상품에 bid가 이미 있으면 그대로 쓰고, 없으면 규칙으로 채웁니다:
 *  {bidPrefix}_{campaign}_{placement}{순번(3자리, 0패딩)}
 *  placement: "n"=신상품소식/대표상품 목록(메인), "c"=카테고리별 그리드, "f"=대표상품 */
export function economyBid(product, index, placement, meta) {
  if (product && product.bid) return product.bid;
  return `${meta.bidPrefix}_${meta.campaign}_${placement}${String(index + 1).padStart(3, "0")}`;
}

export function economyHref(product, index, placement, meta) {
  const bid = economyBid(product, index, placement, meta);
  const sep = product.url.includes("?") ? "&" : "?";
  return `${product.url}${sep}bid=${bid}`;
}

/** "데이터" 뷰가 보여주는 데이터 품질 검증 — 배포 전에 엑셀/JSON에 빠진 값이
 *  있는지 미리 잡아내는 용도입니다(신상품카탈로그의 링크확인과 같은 역할). */
export function economyLineupIssues(products) {
  const missingCat = products.filter(p => !p.category);
  const missingBid = products.filter(p => !p.bid);
  const missingImg = products.filter(p => !p.image);
  const seen = new Set();
  const dupes = [];
  products.forEach(p => { if (seen.has(p.url)) dupes.push(p.name); else seen.add(p.url); });
  const sample = arr => arr.length
    ? arr.slice(0, 3).map(p => p.name || p).join(", ") + (arr.length > 3 ? ` 외 ${arr.length - 3}건` : "")
    : "없음";
  return [
    { label: "카테고리 미지정", count: missingCat.length, sample: sample(missingCat) },
    { label: "bid 값 없음", count: missingBid.length, sample: missingBid.length ? sample(missingBid) + " — 규칙으로 자동 생성됨" : "없음" },
    { label: "이미지 경로 없음", count: missingImg.length, sample: sample(missingImg) },
    { label: "URL 중복", count: dupes.length, sample: sample(dupes) }
  ];
}

function economyProductCard(p, i, placement, meta) {
  const href = economyHref(p, i, placement, meta);
  const newBadge = p.isNew ? `<span class="icon new">NEW</span>` : "";
  return `<li>
    <a href="${esc(href)}">
      <span class="thumb">${newBadge}<img class="goods" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" /></span>
      <span class="txt3">${esc(p.name)}</span>
    </a>
  </li>`;
}

/** PC 메인 뷰 — 신상품소식(latest-bx) + 대표상품(featured) + 전체 라인업
 *  카테고리 요약(lnb 재활용) + 안내 카드(leadCards). */
function economyMainView(data) {
  const { meta, news, products, categories, leadCards } = data;
  const arrivals = products.filter(p => p.newArrival);
  const featured = products.filter(p => p.featured);

  const newsHtml = news.map(n => `
    <li><a href="${esc(n.url)}">
      ${n.isNew ? `<span class="icon new">NEW</span>` : ""}
      <span class="date">${esc(n.date)}</span>
      <span class="title">${esc(n.title)}</span>
    </a></li>`).join("\n");

  const arrivalsHtml = arrivals.map((p, i) => economyProductCard(p, i, "n", meta)).join("\n");
  const featuredHtml = featured.map((p, i) => economyProductCard(p, i, "f", meta)).join("\n");

  const catLinksHtml = categories.map(c => {
    const count = products.filter(p => p.category === c.code).length;
    return `<li><a href="#" data-eco-cat="${esc(c.code)}">${esc(c.name)}</a></li>`;
  }).join("\n");

  const leadHtml = (leadCards || []).map(l => `
    <a href="${esc(l.url)}" target="_blank" class="card">
      <div class="card-start"><img src="${esc(l.icon)}" alt="${esc(l.title)}" /></div>
      <div class="card-body">
        <strong>${esc(l.title)}</strong>
        ${(l.lines || []).map(line => `<small>${esc(line)}</small>`).join("")}
      </div>
    </a>`).join("\n");

  return `<div class="goods-card">
    <div class="latest-bx">
      <div class="latest-hd">경제형 신규 상품 소식</div>
      <div class="latest-by">
        <div class="latest-list"><ul>${newsHtml}</ul></div>
        <p class="emptybox"></p>
        <ul class="goods-lst">${arrivalsHtml}</ul>
      </div>
    </div>
  </div>
  <div class="show_best">
    <div class="goods-bx mb40">
      <h2 class="nomg">경제형 대표상품 라인업</h2>
      <ul class="goods-lst4">${featuredHtml}</ul>
    </div>
  </div>
  <div class="show_lnb1_1">
    <div class="goods-bx mb40">
      <h2 class="nomg">경제형 전체 라인업</h2>
      <ul class="goods-lst3">${catLinksHtml}</ul>
    </div>
    <p class="lead">원가절감, 설계시간 단축, 품질, 납기에 대한 고민<br><span class="bold"><strong>한국미스미가 함께 고민하여 해결하겠습니다.</strong></span></p>
    <div class="lead-box mb40">${leadHtml}</div>
  </div>`;
}

/** 전체 라인업 뷰 — 카테고리별로 묶어서(그룹이 있으면 그룹별로 한 번 더 쪼개서)
 *  상품 그리드를 나열. GENERATOR 원본의 sections/groups 구조를 그대로 재현. */
function economyAllView(data) {
  const { meta, categories, products } = data;
  const sectionsHtml = categories.map(c => {
    const items = products.filter(p => p.category === c.code);
    if (!items.length) return "";
    const groupLabels = [...new Set(items.map(p => p.group || ""))];
    const groupsHtml = groupLabels.map(label => {
      const groupItems = items.filter(p => (p.group || "") === label);
      const cardsHtml = groupItems.map((p, i) => economyProductCard(p, i, "c", meta)).join("\n");
      const labelHtml = label ? `<h3 class="economy_h3">${esc(label)}</h3>` : "";
      return `<div class="goods-bx mb40">${labelHtml}<ul class="goods-lst2 flex-wrap">${cardsHtml}</ul></div>`;
    }).join("\n");
    return `<div><h2 class="homeicon">${esc(c.name)}</h2>${groupsHtml}</div>`;
  }).join("\n");
  return sectionsHtml;
}

/** 모바일(SP) 뷰 — ⚠️ placeholder. 원본과 동일하게 레이아웃만 잡아뒀고, 실제
 *  SP 전용 CSS가 오기 전까지는 PC용 economy.json을 그대로 재사용합니다. */
function economyMobileView(data) {
  const { news, products } = data;
  const arrivals = products.filter(p => p.newArrival).slice(0, 4);
  const newsHtml = news.map(n => `<li><span class="tmpl-mono">${esc(n.date)}</span><br><a href="${esc(n.url)}">${esc(n.title)}</a></li>`).join("");
  const arrivalsHtml = arrivals.map(p => `<a href="${esc(p.url)}"><span class="thumb"><img src="${esc(p.image)}" alt="${esc(p.name)}"></span><span>${esc(p.name)}</span></a>`).join("");
  return `<div class="eco-mobile-placeholder" style="max-width:390px;margin:0 auto;">
    <p style="padding:8px;background:#fff3cd;font-size:12px;">⚠ SP 전용 CSS 미확보 — 레이아웃만 임시로 잡아둔 상태입니다.</p>
    <ul>${newsHtml}</ul>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">${arrivalsHtml}</div>
  </div>`;
}

/** 데이터(QA) 뷰 — 배포 전 담당자가 직접 확인하는 검증 패널. */
function economyDataView(data) {
  const { meta, categories, products } = data;
  const featured = products.filter(p => p.featured);
  const arrivals = products.filter(p => p.newArrival);
  const issues = economyLineupIssues(products);

  const statsHtml = [
    { label: "products", value: products.length },
    { label: "categories", value: categories.length },
    { label: "featured", value: featured.length },
    { label: "new arrivals", value: arrivals.length }
  ].map(s => `<div><div class="tmpl-mono">${s.label}</div><div style="font-size:22px;font-weight:bold;">${s.value}</div></div>`).join("");

  const issuesHtml = issues.map(i => `
    <div style="display:flex;gap:12px;padding:7px 10px;background:#f8f8f8;margin-bottom:5px;">
      <strong style="flex:0 0 120px;font-weight:normal;">${esc(i.label)}</strong>
      <span class="tmpl-mono" style="flex:0 0 40px;font-weight:bold;">${i.count}</span>
      <span style="color:#666;">${esc(i.sample)}</span>
    </div>`).join("");

  const rowsHtml = products.map(p => `
    <tr>
      <td class="tmpl-mono">${esc(p.id || "")}</td>
      <td>${esc(p.name)}</td>
      <td class="tmpl-mono">${esc(p.category || "—")}</td>
      <td>${esc(p.group || "—")}</td>
      <td class="tmpl-mono">${[p.featured ? "F" : "", p.newArrival ? "N" : "", p.isNew ? "new" : ""].filter(Boolean).join(" ") || "—"}</td>
      <td class="tmpl-mono">${esc(p.url)}</td>
      <td class="tmpl-mono">${esc(p.bid || "(auto)")}</td>
    </tr>`).join("\n");

  return `<div class="tmpl-data" style="display:flex;flex-direction:column;gap:16px;">
    <div style="display:flex;gap:24px;padding:14px 16px;border:1px solid #ddd;">${statsHtml}</div>
    <div style="padding:14px 16px;border:1px solid #ddd;">
      <div style="font-weight:bold;margin-bottom:8px;">bid 파라미터 생성 규칙</div>
      <div class="tmpl-mono" style="padding:10px 12px;background:#f8f8f8;">bid = {bidPrefix}_{campaign}_{placement}{순번}<br>예시 → ${esc(meta.bidPrefix)}_${esc(meta.campaign)}_c005</div>
      <p style="margin:8px 0 0;color:#555;">캠페인 코드와 순번만 데이터에 두면 bid는 렌더 시점에 붙습니다. 배치 위치(메인 n / 카테고리 c / 대표상품 f)별 구분도 규칙으로 처리됩니다.</p>
    </div>
    <div style="padding:14px 16px;border:1px solid #ddd;">
      <div style="font-weight:bold;margin-bottom:10px;">데이터 점검</div>
      ${issuesHtml}
    </div>
    <div style="border:1px solid #ddd;">
      <div style="padding:12px 16px;border-bottom:1px solid #ddd;"><strong>상품 테이블 — 엑셀 1행 = 상품 1개</strong> <span class="tmpl-mono">${products.length} rows</span></div>
      <div style="max-height:520px;overflow:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr>${["id","name","category","group","flags","url","bid"].map(c => `<th class="tmpl-mono" style="text-align:left;padding:7px 10px;background:#f4f4f4;position:sticky;top:0;">${c}</th>`).join("")}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}

/** 엑셀 업로드 전에도 "이렇게 나옵니다"를 보여주기 위한 샘플 데이터 —
 *  카탈로그의 catalogSampleHtml()과 같은 목적입니다. 실제 economy.json 형식과
 *  동일한 스키마로, 최소한의 그럴듯한 예시 몇 개만 채웠습니다. */
export function economySampleData() {
  const meta = { campaign: "SAMPLE", bidPrefix: "bid_kr_e", canonical: "https://kr.misumi-ec.com/pr/vona/economy/", lnbLogo: "", lnbBanner: "" };
  const categories = [
    { code: "A", name: "직동 부품" },
    { code: "B", name: "전동 부품" },
    { code: "C", name: "배선 부품" }
  ];
  const img = "https://via.placeholder.com/150x150/eef0f8/0f218b?text=SAMPLE";
  const products = [
    { id: "P001", name: "(샘플) 리니어가이드", url: "#", image: img, category: "A", group: "", bid: "", isNew: true, featured: true, newArrival: true },
    { id: "P002", name: "(샘플) 리니어부시", url: "#", image: img, category: "A", group: "", bid: "", isNew: false, featured: false, newArrival: false },
    { id: "P003", name: "(샘플) 타이밍벨트", url: "#", image: img, category: "B", group: "", bid: "", isNew: true, featured: true, newArrival: true },
    { id: "P004", name: "(샘플) 커플링", url: "#", image: img, category: "B", group: "", bid: "", isNew: false, featured: false, newArrival: false },
    { id: "P005", name: "(샘플) LAN 케이블", url: "#", image: img, category: "C", group: "", bid: "", isNew: false, featured: true, newArrival: false }
  ];
  const news = [
    { date: "2026/08/01", title: "(샘플) 신상품이 이 자리에 표시됩니다", url: "#", isNew: true }
  ];
  const leadCards = [
    { icon: img, title: "(샘플) 안내 카드 제목", lines: ["예시 문구 1", "예시 문구 2"], url: "#" }
  ];
  const lnbLinks = [
    { label: "(샘플) 진행중 이벤트", url: "#", cls: "event" }
  ];
  return { meta, categories, products, news, leadCards, lnbLinks };
}

/** 경제형 전체상품 라인업 페이지 조립. view는 "main"(PC메인) | "all"(전체라인업) |
 *  "mobile"(SP, placeholder) | "data"(QA검증) 중 하나 — 실제로는 뷰별로 각각
 *  별도 파일(index.html/economy_all.html/모바일용)로 배포하게 됩니다.
 *  ⚠️ 신상품카탈로그와 마찬가지로 이 페이지도 실제 사이트에서는 SSI 셸에
 *  얹히는 걸로 확인된 바 있어(경제형 실물 소스 검증 완료), 헤더/푸터는
 *  여기서 안 만듭니다 — 개발팀 확인 후 처리 방식이 정해질 부분입니다. */
export function assembleEconomyLineupHtml(data, view = "main") {
  const bodyHtml = view === "all" ? economyAllView(data)
    : view === "mobile" ? economyMobileView(data)
    : view === "data" ? economyDataView(data)
    : economyMainView(data);

  return `<div class="tmpl-wrap">
    <ul class="l-breadcrumb" style="list-style:none;margin:0 0 12px;padding:0;display:flex;gap:6px;font-size:11px;color:#666;">
      <li>MISUMI HOME &gt;</li>
      <li><strong>${view === "main" ? "경제형 전상품 분류" : "경제형 전체 라인업"}</strong></li>
    </ul>
    <div class="container">
      <div class="nav">
        <h1><a href="${esc(data.meta.canonical)}" class="allCate"><img src="${esc(data.meta.lnbLogo)}" alt="MISUMI 경제형" /></a></h1>
        <div class="ec-lnb left_sv">
          <ul class="event-lnb">
            ${(data.lnbLinks || []).map(l => `<li class="${esc(l.cls || "")}"><a href="${esc(l.url)}">${esc(l.label)}${l.badge ? `<span class="blt_bat">${esc(l.badge)}</span>` : ""}</a></li>`).join("\n")}
          </ul>
          <ul id="snb" class="allview"><li><a href="${esc(data.meta.canonical)}economy_all">전체 보기</a></li></ul>
          ${data.categories.map(c => {
            const count = data.products.filter(p => p.category === c.code).length;
            return `<ul id="snb"><li><a href="${esc(data.meta.canonical)}economy_all?cat=${esc(c.code)}">${esc(c.name)}${count === 0 ? "" : ""}</a></li></ul>`;
          }).join("\n")}
        </div>
        <div class="eco_bnr"><a href="https://www.misumi.co.kr/catalogrequest/" target="_blank"><img src="${esc(data.meta.lnbBanner)}" alt="경제형 카탈로그 무료신청하기" /></a></div>
      </div>
      <div class="contents">
        ${bodyHtml}
      </div>
    </div>
  </div>`;
}


/** 경제형 전체상품 라인업 — 실제 운영 중인 4개 CSS 파일(style.css, all_20250910.css,
 *  left_nav.css, event.css)을 그대로 합친 것입니다. ⚠️ 실제 배포 시엔 이 4개 파일을
 *  각각 <link>로 참조하는 게 맞고(원본 프로토타입도 그렇게 되어 있음), 이 상수는
 *  "미리보기 iframe에서 실제 스타일을 확인하기 위한 용도"로만 씁니다 — 이벤트 LP의
 *  buildEventLpCss()와 같은 이유입니다.
 */
export const ECONOMY_LINEUP_PREVIEW_CSS = `
/* ===== style.css ===== */
@charset "UTF-8";
@import url('https://kr.misumi-ec.com/vcommon/top/css/style_rev_1804121859.css');
@font-face {
    font-family: "GmarketSansLight";
    src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansLight.woff")
        format("woff");
    font-weight: normal;
    font-style: normal;
}

@font-face {
    font-family: "GmarketSansMedium";
    src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff")
        format("woff");
    font-weight: normal;
    font-style: normal;
}

@font-face {
    font-family: "GmarketSansBold";
    src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff")
        format("woff");
    font-weight: normal;
    font-style: normal;
}
p { margin-bottom: 0;}
.mb0{margin-bottom: 0;}
.mb10 { margin-bottom: 10px;}
.mb20 { margin-bottom: 20px;}
.mb30 { margin-bottom: 30px;}
.mb40 { margin-bottom: 40px;}


.btn_group{ text-align:center; margin:40px 0 0 0;}
.clearFix{clear: both;}
.center{margin: 0 auto;display: inline-block;}
.hide_txt{ position: absolute; top:-9999px; left:-9999px; }

.twoColumn .keyVisual{
	position: relative;
	width: 950px;
	height: auto;
	margin: 0 !important;
	padding: 0 !important;
	border: none !important;
}

#incNavArea{ margin:0 0 20px 0;}
#incNavArea ul.hover li a:hover,
a:hover img{
	opacity: 0.8 !important;
	filter: alpha(opacity=80) !important;
	border: none;
}



	

/*문의처*/
.askdesk {
border-bottom: 1px solid #dfdfdf;
border-left: 1px solid #dfdfdf;
border-right: 1px solid #dfdfdf;
}

.askdesk .text {
	padding:0 10px 20px 10px; 
}
.askdesk .text .big {
	font-size:16px;
	font-weight:bold;
}


/*top*/
.pageTop {
    margin: 40px 0 0;
    padding-bottom: 20px;
}
 .pageTop a {
    background-position: -131px -1338px;
}


/* */
.hdArea:after{content:""; display:block; height:0; clear:both; visibility:hidden;}

/* gnb */
#gnbWrap{ background-color:#666; position:relative; left:50%; z-index:9; width:100vw; transform: translateX(-50%); margin:0 0 30px 0; min-width:1200px;}
#gnbWrap #gnb{ max-width: 1200px; margin:0 auto; height:50px; display:flex;}
#gnbWrap #gnb > li{ position:relative; flex:0 0 auto;}
#gnbWrap #gnb > li + li{ margin-left:10px;}
#gnbWrap #gnb > li > a{ display:block; line-height:50px; height:50px; font-size:14px; color:#f5f5f5; padding:0 10px; text-align:center; font-weight:600; -webkit-transition: all 0.1s ease-in-out;-moz-transition: all 0.1s ease-in-out;-ms-transition: all 0.1s ease-in-out;-o-transition: all 0.1s ease-in-out; transition:all 0.1s ease-in-out;}
#gnbWrap #gnb > li > a::after{ content:""; display:inline-block; width:7px; height:7px; border-top:#fff 1px solid; border-right:#fff 1px solid; margin-left:8px; transform: rotate(135deg); vertical-align:4px; -webkit-transition: all 0.1s ease-in-out;-moz-transition: all 0.1s ease-in-out;-ms-transition: all 0.1s ease-in-out;-o-transition: all 0.1s ease-in-out; transition:all 0.1s ease-in-out;}
#gnbWrap #gnb > li > a::before{ content:""; position:absolute; bottom:0; left:0; width:100%; height:5px; background-color:#ffcc00; opacity:0; -webkit-transition: all 0.1s ease-in-out;-moz-transition: all 0.1s ease-in-out;-ms-transition: all 0.1s ease-in-out;-o-transition: all 0.1s ease-in-out; transition:all 0.1s ease-in-out;}
#gnbWrap #gnb > li:hover > a{ color:#ffcc00; text-decoration:none;}
#gnbWrap #gnb > li:hover > a::before{ opacity:1;}
#gnbWrap #gnb > li:hover > a::after{ transform: rotate(-45deg); vertical-align:-2px;border-color:#ffcc00; }
#gnbWrap #gnb > li.gnb1{ flex: 0 0 70px; }
#gnbWrap #gnb > li.gnb1 > a{ color:#000; background-color:#f2f2f2;}
#gnbWrap #gnb > li.gnb2{ flex: 0 0 180px; }
#gnbWrap #gnb > li.gnb2 > a{ color:#000; background-color:#ffcc00;}
#gnbWrap #gnb > li.gnb1 > a,
#gnbWrap #gnb > li.gnb2 > a{ color:#000; }
#gnbWrap #gnb > li.gnb1 > a::before{ display:none;}
#gnbWrap #gnb > li.gnb1 > a::after{ display:none;}
#gnbWrap #gnb > li.gnb2 > a::after{border-color:#000; }
#gnbWrap #gnb > li .depth2{ position:absolute; top:44px; left:0; padding-top:6px; width:220px; letter-spacing:-.05em; display:none;}
#gnbWrap #gnb > li .depth2 ul{ background-color:#fff; border:#bfbfbf 1px solid;}
#gnbWrap #gnb > li .depth2 ul > li > a{ display:block; height:40px; line-height:40px; padding:0 0 0 15px; color:#000; -webkit-transition: all 0.1s ease-in-out;-moz-transition: all 0.1s ease-in-out;-ms-transition: all 0.1s ease-in-out;-o-transition: all 0.1s ease-in-out; transition:all 0.1s ease-in-out;}
#gnbWrap #gnb > li .depth2 ul > li > a:hover{ background-color:#ffcc00; text-decoration:none;}

.l-wrapper{ overflow:hidden;}
.container{ position:relative; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;}
.container *{ -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;}

/* lnb */
.nav{ position:relative; float:left; width:240px; border-bottom:#ddd 1px solid;  -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }
.nav *{ -webkit-box-sizing: border-box;	-moz-box-sizing: border-box;	box-sizing: border-box; }
.nav > h1{ margin-bottom: 0  !important; padding: 0 !important; border-top: none !important;}
.nav > h1 a.allCate img{ display:block; padding:0;}

.ts-menu { background:#fff;	border:1px solid #ddd; padding:15px 0 30px; letter-spacing:-.05em;}
.ts-menu *{ white-space:nowrap;}
.ts-menu > .tit{ display:block; text-align:center; color:#000 !important; font-size:18px !important; font-weight:600 !important; margin:0 19px 25px 19px !important; border-bottom:#000 1px solid !important; padding:0 0 15px 0 !important;}
.ts-menu > .tit:hover{ text-decoration:none;}

#snb a{ position:relative; display: block; text-decoration: none; color:#000; font-size:14px; letter-spacing:-1.5px; line-height:30px; padding:0 0 0 28px; -webkit-transition: all 0.1s ease-in-out;-moz-transition: all 0.1s ease-in-out;-ms-transition: all 0.1s ease-in-out;-o-transition: all 0.1s ease-in-out; transition:all 0.1s ease-in-out;}
#snb > li > a{ line-height:30px; font-size:16px; color:#000; padding:0 19px; font-weight:600;}
#snb > li > a:hover{ background-color:#fbf9d2; text-decoration:none;} 
#snb > li + li{ margin-top:12px;}
#snb > li > ul{ margin-top:3px; }

#snb > li > ul > li:hover > a,
#snb > li > ul > li > a:hover{ background-color:#fbf9d2; text-decoration:none;}
#snb > li > ul > li.active > a:before{ transform: rotate(90deg);  } 
#snb > li > ul > li > div.dp3{ display:none; padding:1px 0 0 0;}
#snb > li > ul > li.active > div.dp3{ display:block;}
#snb > li > ul > li > div.dp3 > ul > li + li{ margin-top:1px;}
#snb > li > ul > li > div.dp3 > ul > li > a:hover{ background-color:#fbf9d2; text-decoration:none;}
#snb > li > ul > li > div.dp3 > ul > li.active > a{ background-color:#ffcc00; text-decoration:none;}

.contents{ position:relative; width:920px; float:right;}
.contents .page-tit{ font-size:26px !important; color:#000 !important; font-weight:600; line-height:1; background-color:transparent !important; padding:0 !important; border:none !important;}
.contents .sub-tit{ font-size:18px !important; margin:0 0 25px !important; color:#000 !important; padding:0 !important; font-weight:600; line-height:1; border:none !important; display:flex; align-items: center;}
.contents .sub-tit span{ flex:0 0 auto; margin-right:30px;}
.contents .sub-tit::after{ content:""; flex:1 1 auto; height:5px; background: -moz-linear-gradient(left,  rgba(51,51,51,1) 0%, rgba(255,255,255,1) 100%); background: -webkit-linear-gradient(left,  rgba(51,51,51,1) 0%,rgba(255,255,255,1) 100%); background: linear-gradient(to right,  rgba(51,51,51,1) 0%,rgba(255,255,255,1) 100%); }
.contents .page-tit + .sub-tit{ margin-top:25px !important;}

.goods-bx{ margin:-25px 0 35px 0;}
.goods-bx::after{ content:""; display:block; clear:both;}
.goods-bx .item{ float:left; width:200px; margin:25px 0 0 40px; }
.goods-bx .item:nth-child(4n+1){ margin-left:0; clear:both;}
.goods-bx .item a{ display:flex; flex-direction: column;  text-decoration:none; }
.goods-bx .item .thumb{ position:relative; display: block; padding:9px 0 0 0;width:100%; text-align:center; border:#ddd 1px solid; border-radius: 6px; flex:0 0 228px; -webkit-transition: all 0.1s ease-in-out;-moz-transition: all 0.1s ease-in-out;-ms-transition: all 0.1s ease-in-out;-o-transition: all 0.1s ease-in-out; transition:all 0.1s ease-in-out;}
.goods-bx .item .thumb img{ -webkit-transition: all 0.1s ease-in-out;-moz-transition: all 0.1s ease-in-out;-ms-transition: all 0.1s ease-in-out;-o-transition: all 0.1s ease-in-out; transition:all 0.1s ease-in-out;}
.goods-bx .item .desc{ text-align:center; margin-top:10px; color:#000; -webkit-transition: all 0.1s ease-in-out;-moz-transition: all 0.1s ease-in-out;-ms-transition: all 0.1s ease-in-out;-o-transition: all 0.1s ease-in-out; transition:all 0.1s ease-in-out; line-height: 1.4; }
.goods-bx .item .price{ text-align:center; margin-top:2px; color:#d00; font-weight: bold; -webkit-transition: all 0.1s ease-in-out;-moz-transition: all 0.1s ease-in-out;-ms-transition: all 0.1s ease-in-out;-o-transition: all 0.1s ease-in-out; transition:all 0.1s ease-in-out;  }
.goods-bx .item .flag{ top:10px; left:0; display:block; width:100%; padding:0 10px; text-align:left; }
.goods-bx .item .flag > img{ margin-right:2px; }
.goods-bx .item .flag .flag-sale{ font-style:normal; width:93px; height:36px; line-height:36px; display:inline-block; background:url(../images/blt_sale.png) 50% 50% no-repeat; text-align:center; font-size:10px; padding:0 2px 0 50px; color:#dd0000; letter-spacing:-.05em;}
.goods-bx .item .flag .flag-sale b{ display:block; position:absolute; top:-9999px; left:-9999px;}
.goods-bx .item .flag .flag-sale strong{ display:inline-block; font-size:22px;}
.goods-bx .item a:hover .thumb{ border-color:#0f218b; }
.goods-bx .item a:hover .desc{ color:#0f218b; text-decoration:none; font-weight:600; padding:0 10px;}

.goods-bx .item .flag2 { top:10px; left:0; display:block; width:100%; padding:0 10px; text-align:left; height: 28px; }
.goods-bx .item .flag2 > img{ margin:0px; }
.goods-bx .item .flag2 .flag-sale2 { font-style:normal; width:84px; height:28px; line-height:32px; display:inline-block; background:url(../images/blt_sale2.png) 50% 50% no-repeat; text-align:center; font-size:10px; padding:0 2px 0 33px; color:#c00; letter-spacing:-.05em; float: right;}
.goods-bx .item .flag2 .flag-sale2 b { font-size: 0; display: block; position: absolute;}
.goods-bx .item .flag2 .flag-sale2 strong{ display:inline-block; font-size:18px; font-weight: normal; font-family: 'GmarketSansBold';}
.goods-bx .item .flag2 .flag-new {width: 42px; height: 28px; display: inline-block;}
.goods-bx .item .flag2 .flag-plus {width: 42px; height: 28px; display: inline-block;}

.new_lnb {display: inline-block; margin-left: 5px;}
.new_lnb2 {display: inline-block; margin-left: 5px; vertical-align: text-bottom; height: 15px; }
.new_lnb2 img { vertical-align: top;}
.new_lnb2 img + img {margin-left: 2px;}
.new_goods {vertical-align: text-bottom; margin-right: 5px;}

.btn_box { background-color: #f5f5f5; box-sizing: border-box; padding: 20px; font-size: 18px; font-weight: bold; color: #333; text-align: center;}
.btn_box > a {display: inline-block; margin-left: 30px;}
@media screen and (max-width:1200px){
	#gnbWrap{ width:100%; left:0; transform: translateX(0); margin:0 0 30px 0; }
}

/* ===== all_20250910.css ===== */
@charset "UTF-8";
@font-face {
  font-family: "GmarketSansLight";
  src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansLight.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}
@font-face {
  font-family: "GmarketSansMedium";
  src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}
@font-face {
  font-family: "GmarketSansBold";
  src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}
.hide_txt {
  position: absolute;
  top: -9999px;
  left: -9999px;
}

.mainVisual {
  width: 920px;
  text-indent: 100%;
  white-space: nowrap;
  overflow: hidden;
  font-size: 0;
}

.mainVisual img {
  display: block;
}

.cBlue {
  color: #0f218b !important;
  font-weight: bold;
}

.red_txt {
  width: 100%;
  color: #ea0000;
  text-align: center;
  font-size: 16px;
  letter-spacing: -0.5px;
  margin-top: 20px;
}

.black_txt {
  width: 100%;
  color: #333;
  text-align: center;
  font-size: 16px;
  letter-spacing: -0.5px;
  margin-top: 20px;
}

/* 상단 박스 리스트 */
.goods-card {
  width: 920px;
  background: #ffcc00;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}
.goods-card .latest-hd {
  width: 100%;
  height: 46px;
  border-radius: 6px 6px 0px 0px;
  background: #222;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fc0;
  font-size: 24px;
  font-weight: 600;
  line-height: 23.2px;
}
.goods-card .latest-by {
  background: #fff;
  border-radius: 0 0 6px 6px;
  overflow: hidden;
}
.goods-card .latest-by .emptybox{
  width: 100%;
  height: 4px;
  background: #fff7d6;
  border-top: 1px solid #FFDE5D;
  border-bottom: 1px solid #FFDE5D;
  display: none;
}
.goods-card .latest-by .latest-list {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  padding: 8px 0;
  max-height: 104px;
  overflow-y: scroll;
}
.goods-card .latest-by .latest-list li {
  position: relative;
  display: flex;
  padding: 0 32px;
  height: 30px;
  align-items: center;
  gap: 20px;
  align-self: stretch;
}
.goods-card .latest-by .latest-list li a {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-left: 53px;
  text-decoration: none;
}
.goods-card .latest-by .latest-list li a .icon {
  position: absolute;
  left: 20px;
  display: flex;
  padding: 4px 5px;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
.goods-card .latest-by .latest-list li a .icon.new {
  border-radius: 3px;
  background: #fc0;
  color: #c00;
  text-align: center;
  font-family: "GmarketSansMedium";
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 100%;
}
.goods-card .latest-by .latest-list li a .date,
.goods-card .latest-by .latest-list li a .title {
  color: #222;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 100%; /* 14px */
  letter-spacing: -0.7px;
}
.goods-card .latest-by .latest-list li:hover {
  background: rgb(255, 247, 214);
}
.goods-card .latest-by .more {
  width: 100%;
  height: 40px;
  flex-shrink: 0;
  border-radius: 0px 0px 6px 6px;
  background: rgb(246, 246, 246);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  color: #222;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 19.2px;
  cursor: pointer;
}
.goods-card .latest-by .more > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: solid 1px rgb(245, 196, 0);
  background-color: rgb(255, 204, 0);
  color: #222;
  font-weight: 600;
}
.goods-card .latest-by .more > span::before {
  content: "+";
  transition: content 0.3s ease-in-out;
}
.goods-card .latest-by .more::after {
  content: "더보기";
  transition: content 0.3s ease-in-out;
}
.goods-card .latest-by.showon .emptybox{
  display: block;
}
.goods-card .latest-by.showon .goods-lst {
  display: flex;
}
.goods-card .latest-by.showon .more > span::before {
  content: "-";
}
.goods-card .latest-by.showon .more::after {
  content: "닫기";
}
.goods-card .goods-lst {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  width: 880px;
  min-height: 380px;
  border-radius: 6px;
  background: #fff;
  padding: 20px;
  display: none;
}
.goods-card .goods-lst > li {
  flex: 1 0 calc(16.66666667% - 12px);
  max-width: 130px;
}
.goods-card .goods-lst > li .thumb {
  border: #ddd 1px solid;
  background-color: #fff;
  display: flex !important;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  margin-bottom: 8px;
  position: relative;
}
.goods-card .goods-lst > li .thumb {
  max-width: 130px;
  aspect-ratio: 1/1;
}
.goods-card .goods-lst > li .thumb img {
  max-width: 100px;
  max-height: 100px;
  object-fit: cover;
}
.goods-card .goods-lst > li .thumb .icon {
  position: absolute;
  top: -1px;
  left: -1px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20px;
  border-radius: 5px 0px;
  z-index: 1;
}
.goods-card .goods-lst > li .thumb .icon.new {
  width: 44px;
  background: #c00;
  color: #fff;
  text-align: center;
  font-family: "GmarketSansMedium";
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: 100%; /* 10px */
}
.goods-card .goods-lst > li .thumb .icon.date {
  width: 70px;
  background: #333;
  color: #fff;
  text-align: center;
  font-size: 10px;
  font-style: normal;
  font-weight: 600;
  line-height: 100%; /* 10px */
}
.goods-card .goods-lst > li .txt3 {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 130px;
  text-align: center;
  padding: 0 5px;
  color: #333;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: 17px;
  letter-spacing: -1.5px;
  word-break: keep-all;
}
.goods-card .goods-lst > li a {
  text-decoration: none;
}
.goods-card .goods-lst > li a:hover {
  text-decoration: none;
}
.goods-card .goods-lst > li a:hover .txt3 {
  color: #000;
  font-weight: 600;
}
.goods-card .goods-lst > li a:hover .thumb {
  border-color: #fc0;
}

/*리스트*/
.goods-bx {
  margin: 0 0 16px !important;
}
.goods-bx.d-flex {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
}
.goods-bx > .col {
  flex: 1 0 0%;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
}
.goods-bx > .col.col-2 {
  flex: none;
  width: 344px;
}
.goods-bx > .col.col-15 {
  flex: none;
  width: 279px;
}
.goods-bx > .col.col-1 {
  flex: none;
  width: 189px;
}
.goods-bx > .col:last-child {
  position: relative;
  flex: 1 1 auto;
  width: 1%;
  min-width: 0;
}
.goods-bx h2.nomg{
  margin-bottom: 16px !important;
}

.goods-bx .goods-lst2 {
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 16px;
}
.goods-bx .goods-lst2 > li {
  margin: 0;
}
.goods-bx .goods-lst2 > li:last-child {
  padding-right: 48px;
}
.goods-bx .goods-lst2 > li a {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  position: relative;
  gap: 10px;
  width: 140px;
  text-decoration: none;
}
.goods-bx .goods-lst2 > li a .blt_goods {
  position: absolute;
  left: 4px;
  top: 4px;
}
.goods-bx .goods-lst2 > li a .thumb {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1/1;
  border-radius: 6px;
  border: 1px solid #DDD;
  background: #FFF;
  width: 140px;
  height: 132px;
  padding: 1px;
}
.goods-bx .goods-lst2 > li a .thumb img {
  max-width: 120px;
  max-height: 120px;
  object-fit: contain;
}
.goods-bx .goods-lst2 > li a .txt3 {
  color: #333;
  text-align: center;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: 18.8px; /* 120% */
  letter-spacing: -0.5px;
  word-break: keep-all;
}
.goods-bx .goods-lst2.flex-wrap {
  flex-wrap: wrap;
}
.goods-bx .goods-lst2.flex-wrap > li:last-child {
  padding-right: 0;
}

.lead {
  margin: 20px auto 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #333;
  text-align: center;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: 140%;
}
.lead .bold {
  position: relative;
}
.lead .bold strong {
  position: relative;
  color: #222;
  font-weight: 700;
}
.lead .bold::before {
  content: "";
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 14px;
  background-color: rgb(255, 231, 134);
}

.lead-box {
  display: flex;
  align-items: stretch;
  gap: 16px;
}
.lead-box .card {
  flex: 1 0 0%;
  border-radius: 6px;
  border: 1px solid #DDD;
  background: #FFF;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 20px;
  text-decoration: none;
  cursor: pointer;
}
.lead-box .card .card-start {
  width: 60px;
}
.lead-box .card .card-start img {
  max-width: 100%;
  object-fit: cover;
}
.lead-box .card .card-body {
  flex: 1 1 auto;
  width: 1%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lead-box .card .card-body > strang,
.lead-box .card .card-body > p,
.lead-box .card .card-body > small {
  font-style: normal;
  font-weight: 600;
  line-height: 140%;
}
.lead-box .card .card-body > strang {
  color: #222;
  font-size: 20px;
}
.lead-box .card .card-body > p {
  color: rgb(0, 64, 152);
  font-size: 16px;
}
.lead-box .card .card-body > small {
  color: rgb(117, 117, 117);
  font-size: 14px;
}

.contents h2 {
  position: relative;
  text-align: center;
  box-sizing: border-box;
  font-size: 24px !important;
  color: #fc0 !important;
  padding: 7px 0 4px 0 !important;
  background-color: #222 !important;
  border-bottom: 3px solid #fc0 !important;
  font-weight: 600 !important;
  margin-bottom: 16px !important;
}

.goods-bx .goods-lst3 {
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: stretch;
  row-gap: 16px;
}
.goods-bx .goods-lst3 > li > a{
  width: 218px;
  height: 48px; 
  box-sizing: border-box;
  background: #FFCC00;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.05em;
  line-height: 1;
  text-decoration: none;
}
.goods-bx .more {
  width: 100%;
  height: 40px;
  flex-shrink: 0;
  border-radius: 0px 0px 6px 6px;
  background: rgb(246, 246, 246);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  color: #222;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  margin-top: 16px;
}
.goods-bx .more2{
  height: 50px;
  font-size:20px;
}
.goods-bx .more > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: solid 1px rgb(245, 196, 0);
  background-color: rgb(255, 204, 0);
  color: #222;
  font-weight: 600;
}
.goods-bx .more > span::before {
  content: "+";
  transition: content 0.3s ease-in-out;
}
.goods-bx .more::before {
  content: "전체 카테고리 보러가기";
  transition: content 0.3s ease-in-out;
}

.goods-bx .goods-lst4 {
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: space-between;
  row-gap: 16px;
}
.goods-bx .goods-lst4 > li {
  flex: 1 0 16%;
  max-width: 140px;
}
.goods-bx .goods-lst4 > li .thumb {
  border: #ddd 1px solid;
  background-color: #fff;
  display: flex !important;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  margin-bottom: 8px;
  position: relative;
}
.goods-bx .goods-lst4 > li .thumb {
  max-width: 140px;
  height:132px;
  /*aspect-ratio: 1/1;*/
}
.goods-bx .goods-lst4 > li .thumb img {
  max-width: 120px;
  max-height: 120px;
  object-fit: cover;
}
.goods-bx .goods-lst4 > li .thumb .icon {
  position: absolute;
  top: -1px;
  left: -1px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20px;
  border-radius: 5px 0px;
  z-index: 1;
}
.goods-bx .goods-lst4 > li .thumb .icon.new {
  width: 44px;
  background: #c00;
  color: #fff;
  text-align: center;
  font-family: "GmarketSansMedium";
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: 100%; /* 10px */
}
.goods-bx .goods-lst4 > li .thumb .icon.date {
  width: 70px;
  background: #333;
  color: #fff;
  text-align: center;
  font-size: 10px;
  font-style: normal;
  font-weight: 600;
  line-height: 100%; /* 10px */
}
.goods-bx .goods-lst4 > li .txt3 {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 140px;
  text-align: center;
  padding: 0 5px;
  color: #333;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 16.8px;
  letter-spacing: -1.5px;
  word-break: keep-all;
}
.goods-bx .goods-lst4 > li a {
  text-decoration: none;
}
.goods-bx .goods-lst4 > li a:hover {
  text-decoration: none;
}
.goods-bx .goods-lst4 > li a:hover .txt3 {
  color: #000;
  font-weight: 600;
}
.goods-bx .goods-lst4 > li a:hover .thumb {
  border-color: #fc0;
}

.blt_goods {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 1;
}

.blt_goods img + img {
  margin-left: 3px;
}

.recommend {
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 1;
}

.txt1 {
  font-size: 18px;
  letter-spacing: -0.5px;
  position: relative;
  top: 0px;
  font-weight: bold;
  color: #333;
  text-decoration: none;
  line-height: 1.3;
}

.txt2 {
  position: relative;
  top: 0px;
  font-size: 12px;
  color: #777;
  text-decoration: none;
  margin-bottom: 8px;
}

.txt3 {
  font-size: 14px;
  letter-spacing: -0.5px;
  position: relative;
  top: 0px;
  color: #333;
  text-decoration: none;
  line-height: 1.2;
  text-align: center;
}

.txt4 {
  font-size: 12px;
  letter-spacing: -0.5px;
  position: relative;
  top: 0px;
  font-weight: bold;
  color: #c00;
  text-decoration: none;
  line-height: 1.2;
  text-align: center;
}

.mark_box {
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-family: "GmarketSansMedium";
  font-size: 12px;
  color: #777;
  line-height: 1.3;
  padding: 6px;
  box-sizing: border-box;
  height: 40px;
  margin-bottom: 4px;
}

.mark_box img {
  margin-right: 2px;
  vertical-align: middle;
}

.price {
  font-family: "GmarketSansMedium";
  position: relative;
  font-size: 12px;
  color: #777;
  top: 0px;
}

.price i {
  font-size: 18px;
  font-family: "GmarketSansBold";
  color: #c00;
  margin-right: 4px;
}

.discount {
  font-family: "GmarketSansMedium";
  position: relative;
  font-size: 14px;
  color: #0f218b;
  top: 0px;
  line-height: 1;
}

.discount b {
  font-size: 16px;
  font-family: "GmarketSansBold";
}

.badge {
  position: absolute;
  right: 5px;
  top: 90px;
  display: block;
}

.badge div {
  position: relative;
}

.badge div b {
  position: absolute;
  text-align: right;
  top: 8px;
  right: 24px;
  font-family: "GmarketSansBold";
  font-weight: normal;
  color: #333;
  font-size: 20px;
  letter-spacing: -0.5px;
}

/*top*/
.pageTop {
  margin: 40px 0 0;
  padding-bottom: 20px;
  text-align: right;
}

.pageTop a {
  background-position: -131px -1338px;
}

.side_banner {
  margin-top: 30px;
}

.mou {
  margin-bottom: 40px;
  position: relative;
}

.mou div {
  position: absolute;
  left: 0;
  top: 60px;
  vertical-align: top;
  font-family: "GmarketSansMedium";
  font-size: 17px;
  letter-spacing: -0.5px;
  color: #888;
  line-height: 1.3;
}

.mou div b {
  color: #333;
  font-size: 24px;
  display: block;
  font-family: "GmarketSansMedium";
  font-weight: normal;
}

.blue1_b {
  font-family: "GmarketSansBold";
  color: #0074be;
}

.blue2_b {
  font-family: "GmarketSansBold";
  color: #0f218b;
}

.blue1 {
  font-family: "GmarketSansMedium";
  color: #0074be;
}

.blue2 {
  font-family: "GmarketSansMedium";
  color: #0f218b;
}

.infoBlock_h2 {
  font-size: 16px;
  font-family: "GmarketSansBold";
  color: #333;
  margin-bottom: 5px !important;
  background-color: #fff !important;
  padding: 0 !important;
  margin-top: 40px;
  border: none !important;
}

.infoBlock_h2 span {
  color: #fc0;
  margin-right: 5px;
}

.infoBlock {
  border: 1px solid #ddd;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: scroll;
  padding: 10px 0;
  height: 90px;
  width: 918px;
  overflow: auto;
  scroll-snap-type: y mandatory;
  margin-bottom: 40px;
}

.infoBlock .inner {
  padding: 5px 0 0;
  width: 100%;
  box-sizing: border-box;
  display: table;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  position: relative;
  scroll-snap-align: start;
}

.infoBlock .inner .date {
  font-family: "GmarketSansBold";
  width: 180px;
  display: table-cell;
  padding: 0 0 0 20px;
}

.infoBlock .inner .txt {
  font-family: "GmarketSansMedium";
  display: table-cell;
  font-weight: normal;
  width: 890px;
}

.topFixedTab {
  position: fixed;
  z-index: 5000;
  background-color: #ffffff;
}

.rosh10 {
  white-space: nowrap;
  overflow: hidden;
  font-size: 0 !important;
  margin-bottom: 30px !important;
  padding: 0 !important;
  border: none !important;
}

.economy_h3 {
  width: 100%;
  height: 42px;
  display: flex;
  align-items: center;
  margin-bottom: 20px !important;
  padding: 0 !important;
  color: #000 !important;
  font-size: 20px !important;
  font-weight: bold !important;
  border: none !important;
  background-color: #fff !important;
  line-height: 1;
  border-bottom: 2px solid #ddd !important;
}

.economy_h3:before {
  content: "";
  width: 4px;
  height: 20px;
  background-color: #fc0;
  display: inline-block;
  margin-right: 8px;
}

.goods-bx ul li a:hover .thumb {
  border: #ffcc00 2px solid;
}

.goods-bx ul li a:hover .txt3 {
  color: #333;
  text-decoration: none;
  font-weight: bold;
}

.contents {
  min-height: 1200px;
}

.info_box {
  width: 920px;
  float: right;
}

.mb16{
  margin-bottom: 16px !important;
}

/* ===== left_nav.css ===== */
#snb a {
		position: relative;
		display: block;
		text-decoration: none;
		color: #000;
		font-size: 14px;
		letter-spacing: -1.5px;
		line-height: 30px;
		padding: 0 0 0 20px;
		-webkit-transition: all 0.1s ease-in-out;
		-moz-transition: all 0.1s ease-in-out;
		-ms-transition: all 0.1s ease-in-out;
		-o-transition: all 0.1s ease-in-out;
		transition: all 0.1s ease-in-out;
	}

	#snb>li>a {
		line-height: 30px;
		font-size: 16px;
		color: #000;
		padding-right: 20px;
		font-weight: 400;
	}

	#snb>li>a:hover {
		background-color: #fbf9d2;
		text-decoration: none;
	}

	#snb>li+li {
		margin-top: 0;
	}

	#snb>li>ul {
		margin-top: 3px;
	}

	#snb>li.event>ul>li>a::before {
		display: none;
	}

	#snb>li>ul>li:hover>a,
	#snb>li>ul>li>a:hover {
		background-color: #ffe786;
		text-decoration: none;
	}

	#snb>li>ul>li.active>a:before {
		transform: rotate(90deg);
	}

	#snb>li>ul>li>div.dp3 {
		display: none;
		padding: 1px 0 0 0;
	}

	#snb>li>ul>li.active>div.dp3 {
		display: block;
	}

	#snb>li>ul>li>div.dp3>ul>li+li {
		margin-top: 1px;
	}

	#snb>li>ul>li>div.dp3>ul>li>a:hover {
		background-color: #fbf9d2;
		text-decoration: none;
	}

	#snb>li>ul>li>div.dp3>ul>li.active>a {
		background-color: #ffcc00;
		text-decoration: none;
	}

	.left_sv::-webkit-scrollbar {
		width: 6px;
	}

	.left_sv::-webkit-scrollbar-thumb {
		background-color: #cdcdcd;
		border-radius: 3px;
	}

	.left_sv::-webkit-scrollbar-track {
		background-color: #F6F6F6;
	}

	.right_sv::-webkit-scrollbar {
		width: 0px;
	}

	.ec-lnb>.event-lnb {
		padding: 8px 0;
	}

	.ec-lnb>.event-lnb>li.event {
		background-color: #ffcc00;
		margin-bottom: 10px;
	}

	.ec-lnb>.event-lnb>li.event a{
		padding: 0 20px;
		font-weight: bold;
	}

	.ec-lnb>.event-lnb>li>a {
		padding: 0 10px;
		display: flex;
		height: 34px;
		font-weight: 400;
		font-size: 15px;
		letter-spacing: -0.5px;
		align-items: center;
		color: #000;
	}

	.ec-lnb>.event-lnb>li.event>a::before {
		content: "";
		display: inline-block;
		width: 2px;
		height: 8px;
		background-color: #000;
		margin: 0 8px 0 0;
		vertical-align: 3px;
		margin-right: 5px;
	}

	.ec-lnb>.event-lnb>li>a:hover,
	.ec-lnb>.event-lnb>li>ul>li>a:hover {
		text-decoration: none;
		background-color: #ffe786;
	}

	.ec-lnb>.event-lnb>li>a .blt {
		margin-left: auto;
		width: 44px;
		height: 15px;
		border-radius: 3px;
		background-color: #000;
		color: #ffcc00;
		font-size: 10px;
		text-align: center;
		line-height: 18px;
		font-family: 'GmarketSansMedium';
	}

	.ec-lnb>.event-lnb>li>a .blt_rohs {
		margin-left: auto;
		width: 44px;
		height: 15px;
		border-radius: 3px;
		background-color: #23a638;
		color: #fff;
		font-size: 10px;
		text-align: center;
		line-height: 18px;
		font-family: 'GmarketSansMedium';
	}

	.ec-lnb>.event-lnb>li>a .blt_new {
		margin-left: auto;
		width: 44px;
		height: 15px;
		border-radius: 3px;
		background-color: #fc0;
		color: #c00;
		font-size: 10px;
		text-align: center;
		line-height: 18px;
		font-family: 'GmarketSansMedium';
	}

	.blt_new2 {
		margin-left: 4px;
		width: 15px;
		height: 14px;
		letter-spacing: -0.5px;
		border-radius: 3px;
		background-color: #c00;
		color: #fff;
		font-size: 10px;
		text-align: center;
		line-height: 17px;
		font-family: 'GmarketSansMedium';
	}

	.blt_new3 {
		display: inline-block;
		margin-left: 4px;
		width: 15px;
		height: 14px;
		letter-spacing: -0.5px;
		border-radius: 3px;
		background-color: #c00;
		color: #fff;
		font-size: 10px;
		text-align: center;
		line-height: 17px;
		font-family: 'GmarketSansMedium';
	}

	.ec-lnb>.event-lnb>li>a .blt_bat {
		margin-left: auto;
		width: 44px;
		height: 15px;
		border-radius: 3px;
		background-color: #010446;
		color: #86ecff;
		font-size: 10px;
		text-align: center;
		line-height: 18px;
		font-family: 'GmarketSansMedium';
	}

	.ec-lnb>.event-lnb>li.active>ul {
		display: block;
	}

	.ec-lnb>.event-lnb>li>ul {
		display: none;
	}

	.ec-lnb>.event-lnb>li>ul>li>a {
		display: block;
		line-height: 22px;
		color: #000;
		font-size: 13px;
		padding: 0 20px;
	}

	.ec-lnb>.event-lnb>li>ul>li>a::before {
		top: 7px;
	}

	.ec-lnb>.event-lnb>li>ul>li>a:hover {
		background-color: #ffe786;
	}

	.ec-lnb>.event-lnb>li>ul {
		margin: 0;
		padding: 0 0 10px 0;
	}

	.ec-lnb>.event-lnb>li.noBlt>a {
		height: 26px;
		padding-left: 20px;
	}

	.ec-lnb>.event-lnb>li.noBlt>a::before {
		display: none;
	}

	.ec-lnb {
		border: #ddd 1px solid;
		border-top: none;
		max-height: 855px;
		padding: 0 0 10px 0;
		overflow-y: auto;
	}

	.ec-lnb::after {
		content: "";
		position: absolute;
		left: 1px;
		bottom: 0;
		background-color: #fff;
		display: block;
		width: calc(100% - 12px);
		height: 5px;
	}

	.ec-lnb>#snb>li>a {
		display: flex;
		height: 32px;
		font-size: 15px;
		align-items: center;
		color: #000;
	}
	.ec-lnb>#snb.allview>li>a{
		background: #000;
		color: #FFCD00;
		border-bottom: 2px solid #FFCD00;
		margin-bottom: 5px;
	}
	.ec-lnb>#snb.allview>li>a::before{
		content: "";
    display: inline-block;
    width: 2px;
    height: 8px;
    background-color: #FFCD00;
    margin-right: 5px;
	}
	.ec-lnb>#snb.allview>li>a:hover{
		background: #000;
		color: #FFCD00;
	}
	.ec-lnb>#snb>li>a:hover,
	.ec-lnb>#snb>li>ul>li>a:hover {
		background-color: #ffe786;
	}

	.ec-lnb>#snb>li.active>a:before {
		transform: rotate(90deg);
	}

	.ec-lnb>#snb>li>ul>li>a {
		line-height: 24px;
		font-size: 14px;
	}

	.ec-lnb>#snb>li>ul>li>.dp3>ul>li>a {
		line-height: 22px;
		font-size: 13px;
	}

	.ec-lnb>#snb>li>ul>li>.dp3>ul>li>a::before {
		content: "-";
		display: inline-block;
		margin-right: 3px;
	}

	.ec-lnb>#snb>li>ul>li>.dp3>ul>li>a:hover {
		background-color: #ffcc00;
	}

	.nav {
		background-color: #fff;
	}

	.nav.fix {
		position: fixed;
		top: 80px;
		left: 50%;
		margin-left: -600px;
	}

	.eco_bnr {
		position: relative;
		margin-top: 20px;
	}


/* ===== event.css ===== */
@charset "UTF-8";
@font-face {
    font-family: "GmarketSansLight";
    src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansLight.woff")
        format("woff");
    font-weight: normal;
    font-style: normal;
}

@font-face {
    font-family: "GmarketSansMedium";
    src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff")
        format("woff");
    font-weight: normal;
    font-style: normal;
}

@font-face {
    font-family: "GmarketSansBold";
    src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff")
        format("woff");
    font-weight: normal;
    font-style: normal;
}

.hide_txt{ position: absolute; top:-9999px; left:-9999px; }

.mainVisual{ width: 920px; text-indent: 100%; white-space: nowrap; overflow: hidden; font-size: 0;}
.mainVisual img{ display:block;}

.cBlue {color: #0f218b !important; font-weight: bold;}


.red_txt { width:100%; color:#ea0000; text-align: center; font-size: 16px; letter-spacing: -0.5px; margin-top: 20px; }
.black_txt { width:100%; color:#333; text-align: center; font-size: 16px; letter-spacing: -0.5px; margin-top: 20px; }


/*리스트 5개*/
.goods-bx {margin: 0 0 40px!important;}

.goods-bx h3 {
	text-align: left; box-sizing: border-box; font-family: 'GmarketSansBold'; font-size: 24px!important; color: #fff!important; padding: 7px 0 4px 20px!important; background-color: #222; border-bottom: 3px solid #fc0!important; font-weight: normal!important; margin-bottom: 0!important;
}

.goods-bx .goods-lst{ overflow:hidden; }
.goods-bx .goods-lst>li{ float:left; width:210px; text-align:left; box-sizing: border-box; padding:0; margin-top: 20px; margin-left: 26px; position: relative;}
.goods-bx .goods-lst>li:nth-child(4n+1){clear:both; margin-left: 0;}
.goods-bx .goods-lst>li>a{
    display: block;
    height: 300px;
    text-decoration: none;
    color: #004bb1;}
.goods-bx .goods-lst>li span{ display:block;}


.goods-bx .goods-lst2{ overflow:hidden; }
.goods-bx .goods-lst2>li{ float:left; width:168px; text-align:left; box-sizing: border-box; padding:0; margin-top: 20px; margin-left: 20px; position: relative;}
.goods-bx .goods-lst2>li:nth-child(5n+1){clear:both; margin-left: 0; width: 168px;}
.goods-bx .goods-lst2>li>a{
    display: block;
    text-decoration: none;
    color: #004bb1;}
.goods-bx .goods-lst2>li span{ display:block;}


.goods-bx .goods-lst3{ overflow:hidden; }
.goods-bx .goods-lst3>li{ float:left; width:215px; text-align:left; box-sizing: border-box; padding:0; margin-left: 20px; position: relative;}
.goods-bx .goods-lst3>li:nth-child(4n+1){clear:both; margin-left: 0; width: 215px;}
.goods-bx .goods-lst3>li>a{
    display: block;
    text-decoration: none;
    color: #004bb1;}
.goods-bx .goods-lst3>li span{ display:block;}

.goods {
    max-width: 150px;
    max-height: 150px;
    width: auto;    
    position: relative;
}

.thumb {
	border: #ddd 1px solid;
	background-color: #fff;
	display: flex!important;
	justify-content: center;
	align-items: center;
	border-radius: 6px;
	height: 160px;
	margin-bottom: 10px;
	position: relative;
}
.recommend {
	position: absolute;
	top: 5px;
	left: 5px;
	z-index: 1;
}

.txt1 {
	
	font-size: 18px;
	letter-spacing: -0.5px;	
	position: relative;
    top: 0px;
	font-weight:bold;
	color:#333;
	text-decoration: none;
	line-height:1.3; 
	}
.txt2 {
	
    position: relative;
    top: 0px;	
	font-size: 12px;
	color:#777;
	text-decoration: none;
	margin-bottom: 8px;
	}
.txt3 {
	
	font-size: 14px;
	letter-spacing: -0.5px;	
	position: relative;
    top: 0px;
	font-weight:bold;
	color:#333;
	text-decoration: none;
	line-height:1.2; 
	text-align: center;
	}
.txt4 {
	
	font-size: 12px;
	letter-spacing: -0.5px;	
	position: relative;
    top: 0px;
	font-weight:bold;
	color:#c00;
	text-decoration: none;
	line-height:1.2; 
	text-align: center;
	}
.mark_box {
	width: 100%;	
	background-color: #f5f5f5;
	border-radius: 4px;
	font-family: 'GmarketSansMedium';	
	font-size: 12px;
	color: #777;
	line-height: 1.3;
	padding: 6px;
	box-sizing: border-box;
	height: 40px;
	margin-bottom: 4px;
}
.mark_box img {
	margin-right: 2px;
	vertical-align: middle;
}
.price {
	font-family: 'GmarketSansMedium';
	position: relative;
	font-size: 12px;
	color:#777;   
	top: 0px;	
	}

.price i {
	font-size: 18px;
	font-family: 'GmarketSansBold';
	color: #c00;
	margin-right: 4px;
}
.discount {
	font-family: 'GmarketSansMedium';
	position: relative;
	font-size: 14px;
	color:#0f218b;   
	top: 0px;
	line-height: 1;
	}

.discount b {
	font-size: 16px;
	font-family: 'GmarketSansBold';
}
.badge {
	position: absolute;
	right: 5px;
	top: 90px;
	display: block;
}
.badge div {
	position: relative;
}
.badge div b {
	position: absolute;
	text-align: right;
	top: 8px; right: 24px;
	font-family: "GmarketSansBold"; font-weight: normal; color: #333; font-size: 20px; letter-spacing: -0.5px;
}
/*top*/
.pageTop {
    margin: 40px 0 0;
    padding-bottom: 20px;
	text-align: right;
}
 .pageTop a {
    background-position: -131px -1338px;
}


.side_banner {margin-top: 30px;}


.mou {margin-bottom: 40px; position: relative;}
.mou div {position: absolute; left: 0; top: 60px; vertical-align: top; font-family:"GmarketSansMedium"; font-size: 17px; letter-spacing: -0.5px; color: #888; line-height: 1.3;  }
.mou div b {color: #333; font-size: 24px; display: block; font-family:"GmarketSansMedium"; font-weight: normal;}
.blue1_b {font-family: "GmarketSansBold"; color: #0074be; }
.blue2_b {font-family: "GmarketSansBold"; color: #0f218b; }
.blue1 {font-family:"GmarketSansMedium"; color: #0074be; }
.blue2 {font-family:"GmarketSansMedium"; color: #0f218b; }


.infoBlock_h2 {
	font-size: 16px;
	font-family: 'GmarketSansBold';
	color: #333;
	margin-bottom: 5px!important;
	background-color: #fff!important;
	padding: 0!important;
	margin-top: 40px;
	border: none!important;
}
.infoBlock_h2 span {
	color: #fc0;
	margin-right: 5px;
}
.infoBlock {
  border: 1px solid #ddd;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: scroll;  
  padding: 10px 0;
  height: 90px;
  width: 918px;
  overflow: auto;
  scroll-snap-type: y mandatory;
	margin-bottom: 40px;
}

.infoBlock .inner {
  padding: 5px 0 0;
  width: 100%;
  box-sizing: border-box;
  display: table;
  font-size: 14px;
  font-weight: bold;
	color: #333;
  position: relative;
  scroll-snap-align: start;
}
.infoBlock .inner .date {
  font-family: 'GmarketSansBold';
  width: 180px;
  display: table-cell;
  padding: 0 0 0 20px;
}
.infoBlock .inner .txt {
  font-family: 'GmarketSansMedium';
  display: table-cell;
  font-weight: normal;
  width: 890px;
}

.topFixedTab{position: fixed; z-index: 5000; background-color: #ffffff;}	


.rosh10 {
	 white-space: nowrap; overflow: hidden; font-size: 0!important; margin-bottom: 20px!important; padding: 0!important; border: none!important;
}
.economy_h2 {
	font-family: 'GmarketSansBold'; margin-bottom: 20px!important; padding: 0!important; color:#000!important; font-size: 30px!important; font-weight: normal!important; border:none!important; background-color: #fff!important; line-height: 1;
}
.economy_h2:before {
	content: ""; width: 5px; height: 27px; background-color: #fc0; display: inline-block; margin-right: 8px; vertical-align: text-top;
}

.goods-bx ul li a:hover .thumb{ border-color:#0f218b; }
.goods-bx ul li a:hover .txt3{ color:#0f218b; text-decoration:none; font-weight:bold; }

`;

// ==========================================================================
// "미스미는 진화중!" (Evolution) — 기능 개선 안내 LP + 허브 페이지.
// LP_템플릿_생성기_dc.html 기준. 다른 템플릿과 달리 애초부터 "블록 조합형"으로
// 설계되어 있습니다 — 담당자가 블록을 골라 추가/삭제/순서변경하면서 페이지를
// 만드는 방식이라, 고정된 필드 목록이 아니라 블록 타입별 필드 정의(레지스트리)를
// 두고 그걸로 폼과 HTML을 둘 다 생성합니다.
//
// 페이지가 2종류입니다:
//   - "lp": 개별 기능 개선 안내 페이지 (/pr/misumi_evolution/pr/new_feature/{slug}/)
//   - "hub": 그 LP들을 모아 보여주는 허브 페이지 (/pr/misumi_evolution/)
// 두 페이지 다 SSI 셸에 얹히는 구조가 원본에 그대로 있어(head_navi.html 등),
// 이벤트 LP·경제형 라인업과 동일하게 S3 배포는 막고 다운로드만 지원합니다.
// ==========================================================================

export const EVOLUTION_TEMPLATE_ID = "evolution";

/** 블록 타입 레지스트리 — LP_템플릿_생성기_dc.html의 T 객체를 그대로 이식.
 *  fields의 t(타입)는 폼에서 어떤 입력을 그릴지 결정: text(한줄) / html(여러줄,
 *  <br><strong> 등 허용) / mono(파일명 등 고정폭) / items(하위 항목 배열). */
export const EVOLUTION_BLOCK_TYPES = {
  hero: {
    label: "히어로", page: "lp",
    fields: [{ k: "eyebrow", l: "상단 한 줄", t: "text" }, { k: "title", l: "제목 (<br> 사용 가능)", t: "html" }],
    make: () => ({ eyebrow: "- 효율적인 업무지원을 위한 개선 -", title: "새 기능이 추가되었습니다!" })
  },
  ba: {
    label: "BEFORE / AFTER", page: "lp",
    fields: [
      { k: "before", l: "BEFORE 문구", t: "html" }, { k: "after", l: "AFTER 문구", t: "html" },
      { k: "beforeImg", l: "BEFORE 이미지 파일", t: "mono" }, { k: "afterImg", l: "AFTER 이미지 파일", t: "mono" }, { k: "arrowImg", l: "화살표 이미지 파일", t: "mono" }
    ],
    make: () => ({ before: "", after: "", beforeImg: "before.png", afterImg: "after.png", arrowImg: "arrow.png" })
  },
  arrow: {
    label: "화살표 제목", page: "lp",
    fields: [{ k: "title", l: "제목", t: "text" }],
    make: () => ({ title: "개선내용" })
  },
  summary: {
    label: "요약 텍스트 박스", page: "lp",
    fields: [
      { k: "heading", l: "소제목", t: "html" }, { k: "body", l: "본문", t: "html" },
      { k: "ctaText", l: "CTA 문구 (비우면 미출력)", t: "text" }, { k: "ctaUrl", l: "CTA 링크", t: "mono" }
    ],
    make: () => ({ heading: "", body: "", ctaText: "", ctaUrl: "" })
  },
  improve: {
    label: "개선내용 리스트", page: "lp",
    fields: [
      { k: "heading", l: "소제목", t: "html" }, { k: "body", l: "본문", t: "html" },
      { k: "items", l: "개선내용 항목", t: "items", sub: [{ k: "label", l: "라벨", t: "text" }, { k: "title", l: "제목", t: "text" }, { k: "desc", l: "설명", t: "html" }], newItem: n => ({ label: "개선내용 " + n + ".", title: "", desc: "" }) },
      { k: "ctaText", l: "CTA 문구 (비우면 미출력)", t: "text" }, { k: "ctaUrl", l: "CTA 링크", t: "mono" }
    ],
    make: () => ({ heading: "무엇이 달라졌나요?", body: "", items: [{ label: "개선내용 1.", title: "", desc: "" }], ctaText: "", ctaUrl: "" })
  },
  num: {
    label: "이미지 + 번호 설명", page: "lp",
    fields: [
      { k: "heading", l: "소제목", t: "html" }, { k: "desc", l: "리드 문구 (선택)", t: "html" },
      { k: "img", l: "기능 이미지 파일", t: "mono" },
      { k: "items", l: "번호 설명", t: "items", sub: [{ k: "title", l: "영역 이름", t: "text" }, { k: "desc", l: "설명", t: "html" }, { k: "note", l: "※ 주석 (선택)", t: "text" }], newItem: () => ({ title: "", desc: "", note: "" }) }
    ],
    make: () => ({ heading: "기능 소개", desc: "", img: "feature1.png", items: [{ title: "", desc: "", note: "" }] })
  },
  steps: {
    label: "STEP 가이드", page: "lp",
    fields: [
      { k: "heading", l: "소제목", t: "html" },
      { k: "items", l: "STEP", t: "items", sub: [{ k: "badge", l: "배지", t: "text" }, { k: "title", l: "제목", t: "text" }, { k: "img", l: "이미지 파일", t: "mono" }], newItem: n => ({ badge: "STEP" + n, title: "", img: "step" + n + ".png" }) }
    ],
    make: () => ({ heading: "이용 방법 안내", items: [{ badge: "STEP1", title: "", img: "step1.png" }] })
  },
  twocol: {
    label: "좌우 2단", page: "lp",
    fields: [{ k: "img", l: "이미지 파일", t: "mono" }, { k: "heading", l: "소제목", t: "html" }, { k: "body", l: "본문", t: "html" }],
    make: () => ({ img: "info4.png", heading: "", body: "" })
  },
  cta: {
    label: "CTA 버튼", page: "lp",
    fields: [{ k: "text", l: "버튼 문구", t: "text" }, { k: "url", l: "링크", t: "mono" }],
    make: () => ({ text: "기능 바로가기 →", url: "https://kr.misumi-ec.com/" })
  },
  hubcard: {
    label: "최신 개선 카드", page: "hub",
    fields: [
      { k: "heading", l: "섹션 제목", t: "text" }, { k: "icon", l: "카테고리 아이콘 파일", t: "mono" }, { k: "category", l: "카테고리명", t: "text" },
      { k: "linkText", l: "LP 제목", t: "text" }, { k: "linkUrl", l: "LP 링크", t: "mono" },
      { k: "voice", l: "고객 목소리", t: "html" }, { k: "improve", l: "개선 내용", t: "html" }
    ],
    make: () => ({ heading: "미스미를 더 쉽게 사용하기 위한 최신 개선점", icon: "ic_la4.png", category: "", linkText: "", linkUrl: "", voice: "", improve: "" })
  },
  hublist: {
    label: "카테고리 리스트", page: "hub",
    fields: [
      { k: "heading", l: "섹션 제목", t: "text" },
      { k: "items", l: "카테고리", t: "items", sub: [{ k: "icon", l: "아이콘 파일", t: "mono" }, { k: "title", l: "카테고리", t: "text" }, { k: "sub", l: "보조 설명", t: "text" }, { k: "links", l: "LP 목록 (한 줄에 \"제목|링크\")", t: "html" }], newItem: () => ({ icon: "ic_la1.png", title: "", sub: "", links: "" }) }
    ],
    make: () => ({ heading: "지난 개선점", items: [{ icon: "ic_la1.png", title: "", sub: "", links: "" }] })
  }
};

export function evolutionBlockDefaults(type) {
  return Object.assign({ id: "eb" + Date.now() + Math.random().toString(16).slice(2), type }, EVOLUTION_BLOCK_TYPES[type].make());
}

function evolutionParseLinks(txt) {
  return String(txt || "").split("\n").map(l => l.trim()).filter(Boolean).map(l => {
    const p = l.split("|");
    return { text: (p[0] || "").trim(), url: (p[1] || "#").trim() };
  });
}

/** 블록 1개 → 실제 배포용 HTML 조각. LP_템플릿_생성기_dc.html의 blockHtml()과
 *  1:1 대응 — class명·구조를 그대로 유지해야 lp-common.css가 그대로 먹습니다. */
function evolutionBlockHtml(b, indent) {
  const t = indent, n = "\n";
  switch (b.type) {
    case "hero":
      return t + `<h1 class="first"><span>${b.eyebrow}</span><br />${b.title}</h1>`;
    case "arrow":
      return t + `<h1 class="downarrow">${b.title}</h1>`;
    case "ba":
      return t + `<div class="whitebox sect1">${n}` +
        `${t}\t<div class="before">${n}${t}\t\t<h5>BEFORE</h5>${n}${t}\t\t<img src="./images/${b.beforeImg}" alt="" />${n}${t}\t\t<p>${b.before}</p>${n}${t}\t</div>${n}` +
        `${t}\t<div class="ing"><img src="./images/${b.arrowImg}" alt="" /></div>${n}` +
        `${t}\t<div class="after">${n}${t}\t\t<h5>AFTER</h5>${n}${t}\t\t<img src="./images/${b.afterImg}" alt="" />${n}${t}\t\t<p>${b.after}</p>${n}${t}\t</div>${n}` +
        `${t}</div>`;
    case "summary":
      return t + `<div class="whitebox sect3">${n}${t}\t<h2>${b.heading}</h2>${n}${t}\t<p>${b.body}</p>${n}` +
        (b.ctaText ? `${t}\t<a href="${b.ctaUrl}" class="landingbtn" target="_blank">${b.ctaText}</a>${n}` : "") +
        `${t}</div>`;
    case "improve":
      return t + `<div class="whitebox sect3">${n}${t}\t<h2>${b.heading}</h2>${n}` +
        (b.body ? `${t}\t<p>${b.body}</p>${n}` : "") +
        `${t}\t<div class="improve_list">${n}` +
        b.items.map(it => `${t}\t\t<div class="improve_item">${n}${t}\t\t\t<div class="improve_head">${n}${t}\t\t\t\t<div class="improve_label">${it.label}</div>${n}${t}\t\t\t\t<div class="improve_title">${it.title}</div>${n}${t}\t\t\t</div>${n}${t}\t\t\t<div class="improve_desc">${it.desc}</div>${n}${t}\t\t</div>`).join(n) + n +
        `${t}\t</div>${n}` +
        (b.ctaText ? `${t}\t<a href="${b.ctaUrl}" class="landingbtn" target="_blank">${b.ctaText}</a>${n}` : "") +
        `${t}</div>`;
    case "num":
      return t + `<div class="whitebox sectcont">${n}${t}\t<h2>${b.heading}</h2>${n}` +
        (b.desc ? `${t}\t<p class="desc">${b.desc}</p>${n}` : "") +
        `${t}\t<img src="./images/${b.img}" alt="${esc(String(b.heading || "").replace(/<[^>]+>/g, ""))}" class="contimg" />${n}` +
        b.items.map((it, i) => `${t}\t<div class="numbox">${n}${t}\t\t<h6>${i + 1}</h6>${n}${t}\t\t<div class="numtxt">${n}${t}\t\t\t<h3>${it.title}</h3>${n}${t}\t\t\t<p>${it.desc}</p>${n}` + (it.note ? `${t}\t\t\t<span>${it.note}</span>${n}` : "") + `${t}\t\t</div>${n}${t}\t</div>`).join(n) + n +
        `${t}</div>`;
    case "steps":
      return t + `<div class="whitebox sectcont">${n}${t}\t<h2>${b.heading}</h2>${n}${t}\t<div class="step_guide">${n}` +
        b.items.map(it => `${t}\t\t<div class="step_card">${n}${t}\t\t\t<div class="step_textbox">${n}${t}\t\t\t\t<div class="step_badge">${it.badge}</div>${n}${t}\t\t\t\t<div class="step_title">${it.title}</div>${n}${t}\t\t\t</div>${n}${t}\t\t\t<div class="step_imagebox"><img src="./images/${it.img}" alt="${esc(it.badge)} ${esc(it.title)}" /></div>${n}${t}\t\t</div>`).join(n) + n +
        `${t}\t</div>${n}${t}</div>`;
    case "twocol":
      return t + `<div class="whitebox sect4">${n}${t}\t<div class="sectbox">${n}${t}\t\t<div><img src="./images/${b.img}" alt="" /></div>${n}${t}\t\t<div class="txtbox">${n}${t}\t\t\t<h2>${b.heading}</h2>${n}${t}\t\t\t<p>${b.body}</p>${n}${t}\t\t</div>${n}${t}\t</div>${n}${t}</div>`;
    case "cta":
      return t + `<div class="whitebox">${n}${t}\t<div class="btnbox"><a href="${b.url}" class="landingbtn" target="_blank">${b.text}</a></div>${n}${t}</div>`;
    case "hubcard":
      return t + `<h2 class="h2-tit">${b.heading}</h2>${n}${t}<div class="con_box">${n}${t}\t<div class="item">${n}${t}\t\t<div class="icon">${n}${t}\t\t\t<img src="./images/${b.icon}" alt="${esc(b.category)}" />${n}${t}\t\t\t<div>${b.category}</div>${n}${t}\t\t</div>${n}${t}\t\t<div class="desc">${n}${t}\t\t\t<a href="${b.linkUrl}" class="hd-tx">${b.linkText}</a>${n}${t}\t\t\t<ul>${n}${t}\t\t\t\t<li><p>고객 목소리</p><div>${b.voice}</div></li>${n}${t}\t\t\t\t<li><p>개선 내용</p><div>${b.improve}</div></li>${n}${t}\t\t\t</ul>${n}${t}\t\t</div>${n}${t}\t</div>${n}${t}</div>`;
    case "hublist":
      return t + `<h2 class="h2-tit">${b.heading}</h2>${n}${t}<div class="con_box">${n}${t}\t<ul class="tx-bx01">${n}` +
        b.items.map(it => `${t}\t\t<li>${n}${t}\t\t\t<div class="hd">${n}${t}\t\t\t\t<div class="ic"><img src="./images/${it.icon}" alt="" /></div>${n}${t}\t\t\t\t<div class="txt"><b>${it.title}</b><span>${it.sub}</span></div>${n}${t}\t\t\t</div>${n}` +
          evolutionParseLinks(it.links).map(l => `${t}\t\t\t<a href="${esc(l.url)}" class="link">${esc(l.text)}</a>`).join(n) + n +
          `${t}\t\t</li>`).join(n) + n +
        `${t}\t</ul>${n}${t}\t<!--#include virtual="/pr/common/evolution/list.html" -->${n}${t}</div>`;
    default: return "";
  }
}

/** "미스미는 진화중!" 페이지 전체 조립. draft.evolutionPage가 "lp"면 개별 기능
 *  안내 페이지, "hub"면 허브(목록) 페이지를 만듭니다.
 *  ⚠️ SSI include를 그대로 유지합니다 — 이벤트 LP·경제형 라인업과 같은 이유로
 *  S3 업로드/배포는 막고 다운로드만 지원해야 합니다(generatorLP.js에서 처리). */
export function assembleEvolutionHtml(draft) {
  const isLp = draft.evolutionPage === "lp";
  const m = isLp ? draft.evolutionMetaLp : draft.evolutionMetaHub;
  const blocks = isLp ? draft.evolutionBlocksLp : draft.evolutionBlocksHub;
  const n = "\n";
  const indent = isLp ? "\t\t\t\t\t\t" : "\t\t\t\t\t";
  const inner = blocks.map(b => evolutionBlockHtml(b, indent)).join(n);

  const canonical = isLp
    ? `https://kr.misumi-ec.com/pr/misumi_evolution/pr/new_feature/${m.slug}/`
    : `https://kr.misumi-ec.com/pr/misumi_evolution/`;
  const crumb = isLp
    ? `\t\t\t\t<li><a href="/">MISUMI HOME</a>&gt;</li>${n}\t\t\t\t<li><a href="/pr/misumi_evolution/">미스미는 진화중 !</a>&gt;</li>${n}\t\t\t\t<li><strong>${m.title}</strong></li>`
    : `\t\t\t\t<li><a href="/">MISUMI HOME</a>&gt;</li>${n}\t\t\t\t<li><strong>${m.title}</strong></li>`;
  const body = isLp
    ? `\t\t\t\t\t<div class="mainwrap">${n}${inner}${n}\t\t\t\t\t\t<!--#include virtual="/pr/common/evolution/list.html" -->${n}\t\t\t\t\t</div>`
    : inner;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${DEPLOYMENT_LANG}" lang="${DEPLOYMENT_LANG}">
<head>
<!--#config errmsg="" -->
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(m.title)} | MISUMI｜미스미 종합 Web 카탈로그</title>
<meta name="description" content="${esc(m.desc)}" />
<meta name="keywords" content="${esc(m.keywords)}" />
<link rel="icon" href="/favicon.ico" type="image/x-icon" />
<link rel="canonical" href="${canonical}" />
<!--#include virtual="/vcommon/common/include/import_head_css.html" -->
<!-- /import_head_css -->
<!--▼공통 LP 스타일 (전 LP 공용 · 수정 금지)▼-->
<link href="/pr/common/evolution/css/lp-common.css" rel="stylesheet" type="text/css" media="all" />
<!--▼이 LP 전용 추가분만 아래 파일에 작성▼-->
<!-- <link href="./css/local.css" rel="stylesheet" type="text/css" media="all" /> -->
</head>

<body class="page2">
	<!--#include virtual="/vcommon/common/include/import_head_js.html" -->
	<div class="l-wrapper">
		<!--#include virtual="/vcommon/common/include/head_navi.html" -->
		<div class="l-main">
			<div data-user="attention">
				<!--#include virtual="/vcommon/common/include/attention_all.html" -->
			</div>
			<ul class="l-breadcrumb">
${crumb}
			</ul>
			<div class="l-contentWrap">
				<div class="l-content">
					<!--▼콘텐츠영역 여기부터▼-->
${body}
					<!--▲콘텐츠영역 여기까지▲-->
				</div><!-- /.l-content -->
				<div class="l-nav">
					<!--#include virtual="/vcommon/common/include/side_user_menu.html" -->
				</div><!-- /.l-nav -->
			</div><!-- /.l-contentWrap -->
		</div><!-- /.l-main -->
		<!--#include virtual="/vcommon/common/include/foot.html" -->
	</div><!-- /.l-wrapper -->
	<!--#include virtual="/vcommon/common/include/import_foot.html" -->
	<!--#include virtual="/vcommon/common/include/analyze.html" -->
</body>
</html>
`;
}

/** "미스미는 진화중!" 미리보기 전용 CSS — 실제 운영 lp-common.css를 그대로 담았습니다.
 *  ⚠️ 실제 배포 시엔 <link href="/pr/common/evolution/css/lp-common.css">로 참조만 하고
 *  (assembleEvolutionHtml 참고), 이 상수는 미리보기 iframe에서만 인라인으로 씁니다 —
 *  이벤트 LP의 buildEventLpCss()와 같은 이유입니다. */
export const EVOLUTION_PREVIEW_CSS = `
@charset "UTF-8";
/* ============================================================
   미스미는 진화중! — LP 공통 스타일 (템플릿용 단일 CSS)
   - pr/misumi_evolution/ 허브 + pr/new_feature/** LP 공용
   - LP별 추가분은 각 LP 폴더의 css/local.css 에만 작성
   ============================================================ */

@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/variable/pretendardvariable.css");
@font-face {
  font-family: "GmarketSansBold";
  src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff") format("woff");
  font-weight: normal;
  font-style: normal;
}

:root {
  --lp-navy: #0f218b;
  --lp-navy-dark: #00319e;
  --lp-blue: #154acb;
  --lp-link: #004bb1;
  --lp-yellow: #ffcc00;
  --lp-gray: #bfbfbf;
  --lp-text: #333333;
  --lp-red: #cc0000;
  --lp-width: 930px;
  --lp-font: "Pretendard Variable", Pretendard, "Nanum Gothic", dotum, sans-serif;
}

/* ------------------------------------------------------------
   LP 본문
   ------------------------------------------------------------ */
.mainwrap { font-family: var(--lp-font); background: var(--lp-navy); box-sizing: border-box; }
.mainwrap * { box-sizing: border-box; }
.mainwrap h1 { font-family: "GmarketSansBold", var(--lp-font); position: relative; text-align: center; width: 100%; padding: 24px 0; font-size: 40px; letter-spacing: -0.025em; color: #fff; font-weight: bold; line-height: 1.2; }
.mainwrap h1 span { font-family: var(--lp-font); font-weight: 600; font-size: 18px; }
.mainwrap h1.first { background: url(../images/headbg.png) no-repeat center center / cover; }
.mainwrap h1.downarrow::after { content: ''; position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); border-left: 20px solid transparent; border-right: 20px solid transparent; border-top: 20px solid var(--lp-navy); }
.mainwrap .whitebox { width: var(--lp-width); margin: 0 auto; padding: 50px 30px; background: #fff; border-bottom: 10px solid var(--lp-navy); }
.mainwrap .whitebox > div { text-align: center; }

/* BEFORE / AFTER */
.mainwrap .sect1 { display: flex; justify-content: center; align-items: center; column-gap: 15px; border-bottom: none; }
.mainwrap .sect1 .before,
.mainwrap .sect1 .after { width: 407px; min-height: 336px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-bottom: 20px; border: 8px solid var(--lp-gray); }
.mainwrap .sect1 .after { border-color: var(--lp-yellow); }
.mainwrap .sect1 h5 { width: 100%; height: 37px; display: flex; justify-content: center; align-items: center; background: var(--lp-gray); font-size: 24px; font-weight: bold; color: var(--lp-text); }
.mainwrap .sect1 .after h5 { background: var(--lp-yellow); }
.mainwrap .sect1 .before img, .mainwrap .sect1 .after img { margin: 13px 0 20px; }
.mainwrap .sect1 p { text-align: center; font-size: 16px; font-weight: 500; line-height: 1.4; letter-spacing: -0.05em; padding: 0 12px; }
.mainwrap .sect1 p strong { font-weight: bold; }
.mainwrap .sect1 .ing { width: auto; flex: 0 0 auto; }

/* 요약 / 개선내용 리스트 */
.mainwrap .sect3 { padding-top: 30px; color: var(--lp-text); text-align: center; }
.mainwrap .sect3 h2 { color: var(--lp-navy); display: inline-block; font-size: 24px; font-weight: bold; line-height: 1.6; border-bottom: 4px solid var(--lp-yellow); }
.mainwrap .sect3 p { text-align: center; font-size: 18px; line-height: 1.5; font-weight: 500; margin-top: 30px; }
.mainwrap .sect3 .improve_list { margin: 30px auto 0; display: inline-flex; flex-direction: column; align-items: flex-start; row-gap: 15px; }
.mainwrap .sect3 .improve_item { display: flex; flex-direction: column; align-items: flex-start; gap: 5px; }
.mainwrap .sect3 .improve_head { display: flex; align-items: center; gap: 5px; }
.mainwrap .sect3 .improve_label { padding: 4px 10px; background: var(--lp-navy); color: #fff; font-size: 20px; font-weight: bold; line-height: 1.2; }
.mainwrap .sect3 .improve_title { color: var(--lp-navy); font-size: 20px; font-weight: bold; line-height: 1.2; }
.mainwrap .sect3 .improve_desc { color: var(--lp-text); font-size: 18px; font-weight: 500; line-height: 1.35; text-align: left; }

/* 기능 소개 (이미지 + 번호 설명 / STEP) */
.mainwrap .sectcont { color: var(--lp-text); text-align: center; }
.mainwrap .sectcont h2 { display: inline-block; color: var(--lp-navy); font-size: 24px; font-weight: bold; line-height: 1.2; padding-bottom: 7px; border-bottom: 4px solid var(--lp-yellow); }
.mainwrap .sectcont img.contimg { display: block; width: 100%; height: auto; margin: 20px 0; }
.mainwrap .sectcont p { font-size: 18px; font-weight: 500; line-height: 1.5; margin: 10px 0 38px; }
.mainwrap .sectcont p.desc { text-align: center; }
.mainwrap .sectcont h3 { font-size: 20px; font-weight: bold; text-align: left; }
.mainwrap .sectcont h3 strong { color: #ee0d0d; }

.mainwrap .numbox { width: 100%; margin: 20px auto 0; display: flex; justify-content: flex-start; align-items: flex-start; gap: 15px; }
.mainwrap .numbox h6 { flex: 0 0 auto; display: flex; align-items: center; justify-content: center; width: 25px; height: 25px; background: var(--lp-red); color: #fff; font-size: 15px; font-weight: 800; border-radius: 100%; }
.mainwrap .numbox .numtxt { text-align: left; }
.mainwrap .numbox .numtxt h3 { line-height: 1.2; font-size: 18px; font-weight: 800; margin-bottom: 10px; }
.mainwrap .numbox .numtxt p { line-height: 1.55; font-size: 16px; font-weight: 500; margin: 0; }
.mainwrap .numbox .numtxt ul li { line-height: 1.55; font-size: 16px; font-weight: 500; list-style: disc inside; }
.mainwrap .numbox .numtxt strong { font-weight: 800; }
.mainwrap .numbox .numtxt span { display: block; margin-top: 6px; font-size: 14px; color: #666; }

.mainwrap .sectcont .step_guide { margin: 40px auto 0; display: flex; flex-direction: column; row-gap: 40px; }
.mainwrap .sectcont .step_card { border: 2px solid var(--lp-navy); padding-top: 20px; text-align: center; }
.mainwrap .sectcont .step_textbox { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 0 20px 20px; }
.mainwrap .sectcont .step_badge { display: inline-flex; align-items: center; justify-content: center; min-width: 93px; padding: 8px 15px; border-radius: 50px; background: var(--lp-blue); color: #fff; font-size: 20px; font-weight: 700; line-height: 1; }
.mainwrap .sectcont .step_title { font-size: 24px; font-weight: 700; line-height: 1.3; letter-spacing: -0.05em; color: #111; }
.mainwrap .sectcont .step_imagebox { border-top: 1px solid #ddd; }
.mainwrap .sectcont .step_imagebox img { display: block; width: 100%; height: auto; }

/* 좌우 2단 */
.mainwrap .sect4 .sectbox { display: flex; align-items: center; column-gap: 30px; text-align: left; }
.mainwrap .sect4 .sectbox > div { flex: 1 1 0; }
.mainwrap .sect4 .sectbox img { max-width: 100%; height: auto; }
.mainwrap .sect4 .sectbox h2 { display: inline-block; color: var(--lp-navy); font-size: 24px; font-weight: bold; line-height: 1.4; border-bottom: 4px solid var(--lp-yellow); }
.mainwrap .sect4 .sectbox p { font-size: 16px; font-weight: 500; line-height: 1.6; margin-top: 16px; }

/* CTA */
.mainwrap .btnbox { text-align: center; margin: 50px auto 0; }
.mainwrap .landingbtn,
.mainwrap .sect3 a.landingbtn { width: 350px; height: 54px; margin: 0 auto; display: flex; justify-content: center; align-items: center; background: var(--lp-navy-dark); color: #fff; font-size: 20px; font-weight: 600; text-decoration: none; }
.mainwrap .landingbtn:hover { background: var(--lp-navy); color: #fff; }

/* ------------------------------------------------------------
   허브 (pr/misumi_evolution/)
   ------------------------------------------------------------ */
.l-content .mainVisual { width: 950px; height: 390px; }
.l-content .h2-tit { margin: 40px 0 0; padding: 14px 20px; background: var(--lp-navy); color: #fff; font-size: 22px; font-weight: bold; letter-spacing: -0.03em; }
.con_box { position: relative; border-left: 10px solid var(--lp-navy); border-right: 10px solid var(--lp-navy); border-bottom: 10px solid var(--lp-navy); padding: 0 50px; }
.con_box .item { display: flex; padding: 30px 0; width: 100%; align-items: center; }
.con_box .item + .item { border-top: 1px solid #010232; }
.con_box .item .icon { width: 170px; text-align: center; font-size: 14px; }
.con_box .item .desc { flex: 1; }
.con_box .item .hd-tx { font-size: 18px; color: var(--lp-link); display: block; text-decoration: underline; font-weight: 900; }
.con_box .item ul { margin: 25px 0 0; display: flex; font-size: 14px; width: 100%; }
.con_box .item ul li { position: relative; letter-spacing: -0.05em; flex: 1; }
.con_box .item ul li + li { margin-left: 70px; }
.con_box .item ul li p { position: relative; color: #000; font-weight: 600; font-size: 16px; margin: 0 0 15px; display: inline-block; }
.con_box .item ul li + li::before { content: ""; position: absolute; top: 53px; left: -59px; display: block; width: 30px; height: 30px; border-top: 3px solid var(--lp-navy); border-right: 3px solid var(--lp-navy); transform: rotate(45deg); }

.tx-bx01 { display: flex; flex-wrap: wrap; }
.tx-bx01 > li { width: 50%; margin: 30px 0 0; letter-spacing: -0.05em; }
.tx-bx01 > li .hd { display: flex; align-items: center; margin: 0 0 20px; }
.tx-bx01 > li .hd .ic { width: 100px; }
.tx-bx01 > li .hd .txt { font-size: 14px; }
.tx-bx01 > li .hd .txt b { display: block; font-size: 18px; }
.tx-bx01 > li .link { color: var(--lp-link); font-size: 14px; display: block; text-decoration: underline; text-indent: -10px; padding-left: 10px; }
.tx-bx01 > li .link::before { content: ""; display: inline-block; width: 4px; height: 4px; background-color: #000; margin: 0 5px 0 0; border-radius: 50%; vertical-align: 4px; }

/* ------------------------------------------------------------
   반응형 (LP / 허브 공통) — 기존 PC 고정폭을 유동폭으로 전환
   ------------------------------------------------------------ */
@media screen and (max-width: 980px) {
  .mainwrap .whitebox { width: 100%; padding: 40px 20px; }
  .l-content .mainVisual { width: 100%; height: auto; }
  .con_box { padding: 0 20px; }
}

@media screen and (max-width: 768px) {
  .mainwrap h1 { font-size: 26px; padding: 20px 16px; }
  .mainwrap h1 span { font-size: 15px; }
  .mainwrap .whitebox { padding: 30px 16px; }

  .mainwrap .sect1 { flex-direction: column; row-gap: 12px; }
  .mainwrap .sect1 .before,
  .mainwrap .sect1 .after { width: 100%; min-height: 0; padding-bottom: 16px; border-width: 5px; }
  .mainwrap .sect1 h5 { font-size: 18px; height: 32px; }
  .mainwrap .sect1 .ing img { transform: rotate(90deg); }

  .mainwrap .sect3 h2,
  .mainwrap .sectcont h2,
  .mainwrap .sect4 .sectbox h2 { font-size: 19px; }
  .mainwrap .sect3 p,
  .mainwrap .sectcont p { font-size: 16px; margin-top: 20px; }
  .mainwrap .sect3 .improve_label,
  .mainwrap .sect3 .improve_title { font-size: 17px; }
  .mainwrap .sect3 .improve_desc { font-size: 15px; }

  .mainwrap .sectcont .step_title { font-size: 18px; }
  .mainwrap .sectcont .step_badge { min-width: 78px; font-size: 16px; padding: 6px 12px; }
  .mainwrap .numbox .numtxt h3 { font-size: 16px; }
  .mainwrap .numbox .numtxt p,
  .mainwrap .numbox .numtxt ul li { font-size: 14px; }

  .mainwrap .sect4 .sectbox { flex-direction: column; row-gap: 20px; }
  .mainwrap .landingbtn,
  .mainwrap .sect3 a.landingbtn { width: 100%; max-width: 350px; height: 48px; font-size: 17px; }

  .con_box { padding: 0 14px; border-width: 6px; }
  .con_box .item { flex-direction: column; align-items: flex-start; row-gap: 14px; }
  .con_box .item .icon { width: auto; display: flex; align-items: center; gap: 10px; }
  .con_box .item ul { flex-direction: column; row-gap: 24px; }
  .con_box .item ul li + li { margin-left: 0; }
  .con_box .item ul li + li::before { display: none; }
  .tx-bx01 > li { width: 100%; }
}

`;
