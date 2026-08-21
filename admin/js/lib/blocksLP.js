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
    wrapperWidthPc: 920,
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
