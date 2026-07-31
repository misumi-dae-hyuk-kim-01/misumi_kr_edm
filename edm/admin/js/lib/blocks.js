// ⚠️ 실서비스 연동 지점
// Phase 1 요건(TPL-01/CMN-16)에서는 블록이 S3(kor-smartlp/edm/templates/blocks/*.mjml)에 저장되고,
// templates.json(=mockData.js seedTemplates())에 정의된 순서로 로드/컴파일됩니다.
// 이 데모는 그 결과물을 로컬 함수(blockRegistry)로 흉내낸 것입니다.
//
// 실 연동 시 아래 blockRegistry의 각 함수 본문만 "S3에서 mjml 원본 fetch → Handlebars 데이터 바인딩
// → mjml2html 컴파일" 로 교체하면 됩니다. 레지스트리 구조 자체(블록 이름 → 렌더 함수)와
// assembleEdmHtml()의 순회 로직은 그대로 유지됩니다.

import { esc } from "./dom.js";

/** 캠페인 내 모든 링크에 UTM을 일관되게 붙이기 위한 헬퍼.
 *  draft.linkUrl은 generator.js의 buildLink()에서 이미 UTM이 붙은 채로 내려오므로 그대로 쓰면 되고,
 *  blocks.js 내부에서 code 등으로 새로 조립하는 링크(상품 상세, 관련상품 등)는 이 함수로 붙여야 합니다. */
function withUtm(url, draft) {
  if (!draft.utmQuery) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${draft.utmQuery}`;
}

// ==========================================================================
// 개별 블록 렌더 함수 (모두 동일 시그니처: (draft) => htmlString)
// ==========================================================================

function heroBlock(draft) {
  const headline = draft.headline || draft.catchcopy || "";
  const bg = draft.heroOption === "선택1" ? "#0b3d91" : "#0F218B";
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${bg};">
    <tr><td style="padding:40px 30px;text-align:center;color:#fff;font-family:Arial,sans-serif;">
      <div style="font-size:13px;letter-spacing:2px;opacity:.8;margin-bottom:10px;">MISUMI KOREA</div>
      <div style="font-size:22px;font-weight:bold;line-height:1.4;">${esc(headline)}</div>
    </td></tr>
  </table>`;
}

function couponBlock(draft) {
  const { code, discount, minOrder, maxDiscount, expiry } = draft.coupon || {};
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff9e6;border:2px solid #F5C842;">
    <tr><td style="padding:24px;text-align:center;font-family:Arial,sans-serif;">
      <div style="font-size:34px;font-weight:bold;color:#F5C842;">${esc(discount)}%</div>
      <div style="font-size:11px;color:#aaa;letter-spacing:2px;margin:4px 0 12px;">DISCOUNT</div>
      <div style="display:inline-block;border:2px dashed #cc0000;padding:8px 22px;border-radius:4px;">
        <span style="font-size:18px;font-weight:bold;color:#cc0000;letter-spacing:3px;">${esc(code)}</span>
      </div>
      <div style="font-size:11px;color:#999;margin-top:8px;">
        만료: ${esc(expiry)} · 최소주문 ${esc(minOrder)}원 · 최대할인 ${esc(maxDiscount)}원
      </div>
    </td></tr>
  </table>`;
}

/** 범용 본문 텍스트 블록. "본문"/"환영 본문"/"재참여 본문"/"상품 설명"이 모두 이걸 공유합니다
 *  (텍스트 톤은 다르지만 레이아웃은 동일 — copyGenerator.js가 세그먼트별로 다른 문구를 채워줍니다) */
function bodyCopyBlock(draft) {
  const body = draft.body || draft.catchcopy || "";
  if (!body) return "";
  return `
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:26px 30px;font-family:Arial,sans-serif;font-size:14px;line-height:1.8;color:#333;text-align:center;">
      ${esc(body)}
    </td></tr>
  </table>`;
}

/** 쿠폰 사용법 이미지 블록 (t1 전용) — 실 연동 시 assets.js에서 고른 이미지를 바인딩하세요 */
function usageImageBlock(draft) {
  const placeholder = `
    <table width="100%" height="140" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border-radius:8px;">
      <tr><td align="center" valign="middle" style="color:#aaa;font-size:11px;font-family:Arial,sans-serif;">
        쿠폰 사용방법 이미지 (에셋 관리에서 선택 예정)
      </td></tr>
    </table>`;
  return `
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:6px 30px 20px;text-align:center;">
      ${draft.usageImageUrl
        ? `<img src="${esc(draft.usageImageUrl)}" width="100%" alt="쿠폰 사용방법" style="display:block;border-radius:8px;">`
        : placeholder}
    </td></tr>
  </table>`;
}

function ctaBlock(draft) {
  const text = draft.cta || "자세히 보기";
  const url = draft.linkUrl || "#";
  return `
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:0 30px 30px;text-align:center;">
      <a href="${esc(url)}" style="display:inline-block;background:#0F218B;color:#fff;font-weight:bold;
        font-size:13px;padding:13px 28px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;">
        ${esc(text)}
      </a>
    </td></tr>
  </table>`;
}

/** 상품 리스트 블록 (t4 기본형).
 *  ⚠️ 시리즈 API 연동 계약: 각 상품 객체는 { code, name?, price?, shipDate?, image? } 형태입니다.
 *  code를 제외한 나머지는 연동 전까지 비어 있을 수 있으며, 이 함수는 비어 있는 필드를
 *  값처럼 보이지 않는 명확한 플레이스홀더로 표시합니다 (연동 진행 상황을 화면에서 바로 확인하기 위함). */
function productListBlock(draft) {
  const products = draft.products || [];
  const cells = products.map(p => `
    <td class="stack-col" style="width:33.3%;padding:10px;text-align:center;font-family:Arial,sans-serif;vertical-align:top;">
      <table width="100%" height="100" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border-radius:6px;margin-bottom:8px;">
        <tr><td align="center" valign="middle" style="color:#aaa;font-size:11px;">
          ${p.image ? `<img src="${esc(p.image)}" width="100%" alt="${esc(p.name || '')}" style="display:block;">` : "상품 이미지 (연동 예정)"}
        </td></tr>
      </table>
      <div style="font-size:11px;color:#888;font-family:monospace;">${esc(p.code)}</div>
      <div style="font-size:13px;font-weight:bold;color:#0F218B;margin-top:2px;">
        ${p.price ? "₩" + esc(p.price) : `<span style="color:#c9a227;font-weight:normal;font-style:italic;">가격 정보 연동 예정</span>`}
      </div>
      <div style="font-size:11px;color:#999;">
        ${p.shipDate ? esc(p.shipDate) + " 출하" : `<span style="font-style:italic;">출하일 연동 예정</span>`}
      </div>
    </td>`).join("");
  return `
  <table width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>`;
}

/**
 * 추천상품 그리드 블록 (t5, product-category.mjml 미러링).
 *
 * ⚠️ 시리즈 API 연동 계약: products 배열의 각 항목은 아래 형태를 기대합니다.
 *   {
 *     code: string,              // 필수 — 사용자가 입력한 시리즈 코드
 *     name?: string,              // 상품명 — 연동 전엔 undefined
 *     price?: string,             // 가격(쉼표 포함 문자열, 예: "17,562") — 연동 전엔 undefined
 *     image?: string,             // 이미지 URL — 연동 전엔 undefined
 *     spec?: string,              // 스펙 한 줄 요약 (선택) — 없으면 원래 스펙 표기가 없는 상품이라는 뜻이라 조용히 생략
 *     isNew?: boolean,            // 신규상품 배지 (선택) — 없으면 배지 자체가 없는 게 정상이라 조용히 생략
 *     discountPercent?: number    // 할인 배지 (선택) — 없으면 배지 자체가 없는 게 정상이라 조용히 생략
 *   }
 *
 * name/price/image는 "값이 있어야 정상"인 필수 필드라서, 연동 전까지 비어 있으면
 * 실제 값처럼 보이지 않는 명확한 플레이스홀더로 표시합니다 (연동 진행 상황 확인용).
 * spec/isNew/discountPercent는 상품에 따라 원래 없을 수도 있는 선택 필드라서,
 * 값이 없으면 플레이스홀더 없이 조용히 생략하는 게 최종 운영 화면에서도 맞는 동작입니다.
 *
 * code는 화면에 직접 표시하지 않고, 각 상품 카드를 감싸는 링크
 * `https://kr.misumi-ec.com/vona2/detail/{code}/` 를 만드는 데만 사용합니다.
 */
function productGridBlock(draft) {
  const products = draft.products || [];
  const columns = 3;
  const rows = [];
  for (let i = 0; i < products.length; i += columns) rows.push(products.slice(i, i + columns));

  const rowsHtml = rows.map(row => {
    const cells = row.map(p => {
      const detailUrl = withUtm(`https://kr.misumi-ec.com/vona2/detail/${encodeURIComponent(p.code)}/`, draft);
      return `
      <td class="stack-col" width="${Math.floor(100 / columns)}%" style="padding:8px;vertical-align:top;text-align:center;font-family:Arial,sans-serif;">
        <a href="${esc(detailUrl)}" style="display:block;text-decoration:none;color:inherit;">
          <table width="100%" height="110" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border-radius:6px;margin-bottom:8px;">
            <tr><td align="center" valign="middle" style="color:#aaa;font-size:11px;">
              ${p.image ? `<img src="${esc(p.image)}" width="100%" alt="${esc(p.name || '')}" style="display:block;">` : "상품 이미지 (연동 예정)"}
            </td></tr>
          </table>
          ${p.isNew ? `<span style="display:inline-block;background:#e6efff;color:#0F218B;font-weight:bold;font-size:11px;padding:2px 8px;border-radius:12px;margin-bottom:4px;">신규상품</span>` : ""}
          ${p.discountPercent ? `<span style="display:inline-block;background:#fde8e8;color:#c62828;font-weight:bold;font-size:11px;padding:2px 8px;border-radius:12px;margin-bottom:4px;">동종품비 최대 ${esc(p.discountPercent)}% 절감</span>` : ""}
          <div style="font-size:11px;margin:2px 0;">
            ${p.name
              ? esc(p.name)
              : `<span style="color:#c9a227;font-style:italic;">상품명 연동 예정</span>`}
          </div>
          <div style="font-size:14px;font-weight:bold;">
            ${p.price
              ? `<span style="color:#0F218B;">₩${esc(p.price)}</span>`
              : `<span style="color:#c9a227;font-weight:normal;font-style:italic;font-size:11px;">가격 정보 연동 예정</span>`}
          </div>
          ${p.spec ? `<div style="font-size:11px;color:#999;margin-top:2px;">${esc(p.spec)}</div>` : ""}
        </a>
      </td>`;
    }).join("");
    return `<tr>${cells}</tr>`;
  }).join("");

  return `
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:20px 22px 4px;text-align:center;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#1a1a1a;">
      추천상품
    </td></tr>
    <tr><td><table width="100%" cellpadding="0" cellspacing="0">${rowsHtml || `<tr><td style="padding:20px;text-align:center;color:#aaa;font-size:11px;">시리즈 코드를 조회하면 상품이 표시됩니다</td></tr>`}</table></td></tr>
  </table>`;
}

/** 관련상품 그리드만 담당 (CTA는 별도 블록으로 분리 — mockData.js의 blocks 배열과 1:1 대응시키기 위함).
 *  관련상품이 없으면 빈 문자열을 반환해 섹션 자체가 자동으로 생략됩니다.
 *  각 카드도 추천상품 그리드와 동일하게 code 기반 상세페이지로 연결되고 UTM이 붙습니다. */
function relatedProductsGridBlock(draft) {
  const products = draft.relatedProducts || [];
  if (!products.length) return "";
  const cells = products.map(p => {
    const detailUrl = withUtm(`https://kr.misumi-ec.com/vona2/detail/${encodeURIComponent(p.code)}/`, draft);
    return `
    <td class="stack-col" width="${Math.floor(100 / products.length)}%" style="padding:6px;text-align:center;font-family:Arial,sans-serif;vertical-align:top;">
      <a href="${esc(detailUrl)}" style="display:block;text-decoration:none;color:inherit;">
        <table width="100%" height="70" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:6px;margin-bottom:6px;">
          <tr><td align="center" valign="middle" style="color:#aaa;font-size:11px;">
            ${p.image ? `<img src="${esc(p.image)}" width="100%" alt="${esc(p.name || '')}" style="display:block;">` : "이미지"}
          </td></tr>
        </table>
        <div style="font-size:11px;color:#555;">${esc(p.name || "-")}</div>
      </a>
    </td>`;
  }).join("");

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;">
    <tr><td style="padding:20px 22px 8px;text-align:center;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#1a1a1a;">
      ${esc(draft.relatedSectionTitle || "관련 상품")}
    </td></tr>
    <tr><td><table width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table></td></tr>
  </table>`;
}

/** 관련상품 섹션 전용 아웃라인 CTA. 관련상품이 없으면 이 버튼도 같이 생략됩니다.
 *  draft.linkUrl로 폴백하는 경우는 이미 UTM이 붙어 있으므로 중복으로 붙이지 않고,
 *  draft.relatedDetailUrl을 직접 쓰는 경우에만 UTM을 새로 붙입니다. */
function relatedDetailCtaBlock(draft) {
  const products = draft.relatedProducts || [];
  if (!products.length) return "";
  const url = draft.relatedDetailUrl ? withUtm(draft.relatedDetailUrl, draft) : (draft.linkUrl || "#");
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;">
    <tr><td style="padding:14px 22px 20px;text-align:center;">
      <a href="${esc(url)}" style="display:inline-block;background:#fff;color:#0F218B;font-weight:bold;
        font-size:12px;padding:10px 22px;border-radius:6px;text-decoration:none;border:1.5px solid #0F218B;font-family:Arial,sans-serif;">
        더 자세히 살펴보기 →
      </a>
    </td></tr>
  </table>`;
}

function footerBlock() {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
    <tr><td style="padding:18px 30px;text-align:center;font-family:Arial,sans-serif;font-size:11px;color:#999;">
      MISUMI Korea · 본 메일은 발신 전용입니다 · 수신거부
    </td></tr>
  </table>`;
}

// ==========================================================================
// 블록 레지스트리 — mockData.js seedTemplates()의 blocks 배열에 쓰인 이름과
// 정확히 일치해야 합니다. 새 템플릿을 추가할 때:
//   1) mockData.js에 blocks: [...] 배열로 어떤 블록을 어떤 순서로 쓸지 "선언"
//   2) 그 이름이 아래 레지스트리에 이미 있으면 → 끝 (blocks.js 수정 불필요)
//   3) 완전히 새로운 블록이 필요하면 → 렌더 함수 하나 만들고 레지스트리에 등록
// ==========================================================================
const blockRegistry = {
  "히어로": heroBlock,
  "헤더+캐치카피": heroBlock,
  "쿠폰": couponBlock,
  "사용방법 이미지": usageImageBlock,
  "본문": bodyCopyBlock,
  "환영 본문": bodyCopyBlock,
  "재참여 본문": bodyCopyBlock,
  "상품 설명": bodyCopyBlock,
  "상품 리스트": productListBlock,
  "추천상품 그리드": productGridBlock,
  "관련상품": relatedProductsGridBlock,
  "CTA": ctaBlock,
  "전상품 CTA": ctaBlock,
  "상세보기 CTA": relatedDetailCtaBlock,
  "푸터": footerBlock
};

// 템플릿을 찾지 못했을 때(예: templateId 오기입, 데이터 마이그레이션 중 등)의 최소 안전망
const FALLBACK_BLOCKS = {
  "product": ["히어로", "상품 리스트", "CTA", "푸터"],
  "non-product": ["히어로", "쿠폰", "본문", "CTA", "푸터"]
};

/**
 * 화면 02/03 draft(state) + 선택된 템플릿(store.templates에서 조회) → 완성된 이메일 HTML.
 * @param {object} draft 생성기 폼 상태
 * @param {object|null} template store.templates 에서 찾은 템플릿 객체 (블록 순서의 단일 출처)
 */
export function assembleEdmHtml(draft, template) {
  const blockNames = (template && template.blocks && template.blocks.length)
    ? template.blocks
    : FALLBACK_BLOCKS[draft.category] || FALLBACK_BLOCKS["product"];

  const bodyHtml = blockNames.map(name => {
    const render = blockRegistry[name];
    if (!render) {
      console.warn(`[blocks.js] 레지스트리에 없는 블록명입니다: "${name}" — mockData.js의 blocks 배열 표기와 blockRegistry 키가 일치하는지 확인하세요.`);
      return "";
    }
    return render(draft) || "";
  }).filter(Boolean).join("\n");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  /* 실제로 모바일에서 줄어들도록: 바깥 테이블은 유동폭(최대 600px), 다열 그리드는 480px 이하에서 1열로 스택.
     width 속성(HTML attribute)은 미디어쿼리를 못 읽는 구형 클라이언트(Outlook 등)용 폴백이고,
     아래 규칙이 실제 브라우저/모바일 미리보기에서 우선 적용됩니다. */
  @media only screen and (max-width: 600px) {
    .email-wrap { width: 100% !important; }
  }
  @media only screen and (max-width: 480px) {
    .stack-col { display: block !important; width: 100% !important; box-sizing: border-box !important; }
  }
</style>
</head>
<body style="margin:0;background:#eee;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#eee;">
<tr><td align="center" style="padding:20px 0;">
<table width="600" class="email-wrap" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#fff;">
<tr><td>${bodyHtml}</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
