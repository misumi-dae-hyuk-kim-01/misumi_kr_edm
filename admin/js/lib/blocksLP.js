// LP(랜딩페이지) 콘텐츠 HTML을 조립합니다.
// ⚠️ blocks.js(EDM)와 기술 기반이 정반대입니다 — 테이블 대신 클래스 기반 CSS를 씁니다.
// 왜 이렇게 다른지는 GUIDELINE_SOURCES.md / LP_EDM_ARCHITECTURE.md를 참고하세요.
//
// blocks.js(EDM)와 동일한 블록 레지스트리 패턴입니다 — mockData.js의 LP 템플릿이
// blocks 배열로 어떤 블록을 어떤 순서로 쓸지 선언하면, 여기서 그 이름을 실제 렌더
// 함수에 매핑해서 조립합니다. 새 LP 템플릿 추가 시 mockData.js에 선언만 하면 되고,
// 완전히 새로운 블록이 필요할 때만 이 파일에 함수를 추가하면 됩니다.

import { esc } from "./dom.js";
import { LP_WIDTH_PATTERNS, DEPLOYMENT_LANG } from "./guidelineCheckLP.js";

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
