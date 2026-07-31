// ⚠️ 실서비스 연동 지점
// Phase 1 요건(TPL-01/CMN-16)에서는 블록이 S3(kor-smartlp/edm/templates/blocks/*.mjml)에 저장되고,
// templates.json에 정의된 순서로 로드/컴파일됩니다. 이 데모는 그 결과물을 로컬 함수로 흉내낸 것입니다.
// 실 연동 시 loadBlock(name) 을 S3 fetch + MJML 컴파일 결과로 교체하세요.

import { esc } from "./dom.js";

export function heroBlock({ headline, bannerOption }) {
  const bg = bannerOption === "선택1" ? "#0b3d91" : "#003087";
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${bg};">
    <tr><td style="padding:40px 30px;text-align:center;color:#fff;font-family:Arial,sans-serif;">
      <div style="font-size:13px;letter-spacing:2px;opacity:.8;margin-bottom:10px;">MISUMI KOREA</div>
      <div style="font-size:22px;font-weight:bold;line-height:1.4;">${esc(headline)}</div>
    </td></tr>
  </table>`;
}

export function couponBlock({ code, discount, minOrder, maxDiscount, expiry }) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff9e6;border:2px solid #F5C842;">
    <tr><td style="padding:24px;text-align:center;font-family:Arial,sans-serif;">
      <div style="font-size:34px;font-weight:bold;color:#F5C842;">${esc(discount)}%</div>
      <div style="font-size:10px;color:#aaa;letter-spacing:2px;margin:4px 0 12px;">DISCOUNT</div>
      <div style="display:inline-block;border:2px dashed #cc0000;padding:8px 22px;border-radius:4px;">
        <span style="font-size:18px;font-weight:bold;color:#cc0000;letter-spacing:3px;">${esc(code)}</span>
      </div>
      <div style="font-size:11px;color:#999;margin-top:8px;">
        만료: ${esc(expiry)} · 최소주문 ${esc(minOrder)}원 · 최대할인 ${esc(maxDiscount)}원
      </div>
    </td></tr>
  </table>`;
}

export function bodyCopyBlock({ body }) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:26px 30px;font-family:Arial,sans-serif;font-size:14px;line-height:1.8;color:#333;text-align:center;">
      ${esc(body)}
    </td></tr>
  </table>`;
}

export function ctaBlock({ text, url }) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:0 30px 30px;text-align:center;">
      <a href="${esc(url)}" style="display:inline-block;background:#003087;color:#fff;font-weight:bold;
        font-size:13px;padding:13px 28px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;">
        ${esc(text)}
      </a>
    </td></tr>
  </table>`;
}

export function productListBlock({ products }) {
  const cells = products.map(p => `
    <td style="width:33.3%;padding:10px;text-align:center;font-family:Arial,sans-serif;vertical-align:top;">
      <div style="background:#f5f5f5;height:100px;border-radius:6px;margin-bottom:8px;
        display:flex;align-items:center;justify-content:center;color:#aaa;font-size:11px;">상품 이미지</div>
      <div style="font-size:11px;color:#888;font-family:monospace;">${esc(p.code)}</div>
      <div style="font-size:13px;font-weight:bold;color:#003087;margin-top:2px;">₩${esc(p.price)}</div>
      <div style="font-size:10px;color:#999;">${esc(p.shipDate)} 출하</div>
    </td>`).join("");
  return `
  <table width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>`;
}

export function footerBlock() {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
    <tr><td style="padding:18px 30px;text-align:center;font-family:Arial,sans-serif;font-size:10px;color:#999;">
      MISUMI Korea · 본 메일은 발신 전용입니다 · 수신거부
    </td></tr>
  </table>`;
}

/** 화면 02/03 draft(state) → 완성된 이메일 HTML 문서 */
export function assembleEdmHtml(draft) {
  const blocks = [];
  blocks.push(heroBlock({ headline: draft.headline || draft.catchcopy || "", bannerOption: draft.heroOption }));

  if (draft.category === "non-product") {
    blocks.push(couponBlock({
      code: draft.coupon.code,
      discount: draft.coupon.discount,
      minOrder: draft.coupon.minOrder,
      maxDiscount: draft.coupon.maxDiscount,
      expiry: draft.coupon.expiry
    }));
    blocks.push(bodyCopyBlock({ body: draft.body || "" }));
    blocks.push(ctaBlock({ text: draft.cta || "자세히 보기", url: draft.linkUrl || "#" }));
  } else {
    blocks.push(productListBlock({ products: draft.products || [] }));
    blocks.push(ctaBlock({ text: draft.cta || "지금 구매하기", url: draft.linkUrl || "#" }));
  }
  blocks.push(footerBlock());

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;background:#eee;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#eee;">
<tr><td align="center" style="padding:20px 0;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;">
<tr><td>${blocks.join("\n")}</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
