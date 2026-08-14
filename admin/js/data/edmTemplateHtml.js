// 18개 EDM 템플릿의 원본 HTML — {{변수}}를 발송 시스템이 실제 값으로 치환합니다.
// generator.js의 assembleEdmHtml()이 이 원본을 기준으로 값 삽입 + 섹션/카드 숨김을 적용합니다.
// ⚠️ 2026-08 재설계(A안) 반영본 — 여백이 각 블록 자체에 포함되어 섹션 삭제 시 여백도 함께 제거됩니다.

export const EDM_TEMPLATE_HTML = {
  "edm-no01-onboarding": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.1 온보딩(신규가입) · 미스미 이해도 업 1</title>
<!-- 캠페인입력 NO.1 : 온보딩(신규가입) / 한국+싱가포르 결합 / 테마 미스미 이해도 업 1 / 신규 가입 혜택 & 미스미 서비스안내
     히어로 텍스트만 · 배지 고정문구 WELCOME TO MISUMI · 수신자명 삽입 있음
     콘텐츠1 [B12] 버튼없음 / 콘텐츠2 [B14] 버튼 4개 / 콘텐츠3 [B21] 버튼없음 / 하단 CTA 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .rowt,.rowt>tbody,.rowt>tbody>tr{display:block!important;width:100%!important;}
    .rowt>tbody>tr{font-size:0!important;text-align:center!important;}
    .rowt .gapcol{display:none!important;}
    .up2{display:inline-block!important;width:50%!important;max-width:50%!important;vertical-align:top!important;box-sizing:border-box!important;padding:0 4px 12px 4px!important;}
    .up3{display:inline-block!important;width:33.3%!important;max-width:33.3%!important;vertical-align:top!important;box-sizing:border-box!important;padding:0 3px 10px 3px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;border-collapse:collapse;">
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="stripeA" width="430" height="3" bgcolor="#0F218B" style="width:430px;height:3px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td><td class="stripeB" width="170" height="3" bgcolor="#FFCC00" style="width:170px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
          <tr><td class="fwc" width="600" style="width:600px;padding:0;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
              <tr>
                <td width="5" bgcolor="#0F218B" style="width:5px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td>
                <td class="fwc hpad" width="531" align="center" style="width:531px;padding:42px 32px 46px 32px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="531" style="width:531px;border-collapse:collapse;">
                    <tr><td align="center" style="padding:0 0 26px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td bgcolor="#E8EBF5" style="background-color:#E8EBF5;border-radius:14px;padding:8px 18px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:13px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.2em;color:#0F218B;">WELCOME TO MISUMI</td></tr></table>
                    </td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:24px;line-height:36px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;">{{customer_name}} 고객님,<br />{{copy_headline}}</td></tr>
                    <tr><td align="center" style="padding:24px 0 22px 0;font-size:0;line-height:0;">
                      <table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="44" style="width:44px;border-collapse:collapse;"><tr><td width="44" height="3" bgcolor="#FFCC00" style="width:44px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table>
                    </td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;">{{copy_sub}}<br /><strong style="color:#0F218B;">{{copy_sub_strong}}</strong></td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="fwc" width="600" height="1" bgcolor="#EEEEEE" style="width:600px;height:1px;background-color:#EEEEEE;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:44px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_1}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>      <tr><td class="pad" style="padding:0 24px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;"><tr><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;border-collapse:collapse;">
                <tr><td class="fwc" width="176" style="width:176px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;border-collapse:collapse;"><tr><td class="fwc" width="176" height="110" align="center" valign="middle" bgcolor="#FFFFFF" style="width:176px;height:110px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;">{{image_1}}<!-- 발송 시 교체: <img src="{{image_1}}" width="176" alt="" class="fluidimg" style="display:block;width:100%;max-width:176px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="176" align="center" style="width:176px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:21px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_1}}</td></tr>
                <tr><td class="fwc" width="176" align="center" style="width:176px;padding:6px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:19px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;">{{sub_1}}</td></tr>
                <tr><td class="fwc" width="176" align="center" style="width:176px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{desc_1}}</td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;border-collapse:collapse;">
                <tr><td class="fwc" width="176" style="width:176px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;border-collapse:collapse;"><tr><td class="fwc" width="176" height="110" align="center" valign="middle" bgcolor="#FFFFFF" style="width:176px;height:110px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;">{{image_2}}<!-- 발송 시 교체: <img src="{{image_2}}" width="176" alt="" class="fluidimg" style="display:block;width:100%;max-width:176px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="176" align="center" style="width:176px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:21px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_2}}</td></tr>
                <tr><td class="fwc" width="176" align="center" style="width:176px;padding:6px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:19px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;">{{sub_2}}</td></tr>
                <tr><td class="fwc" width="176" align="center" style="width:176px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{desc_2}}</td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;border-collapse:collapse;">
                <tr><td class="fwc" width="176" style="width:176px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;border-collapse:collapse;"><tr><td class="fwc" width="176" height="110" align="center" valign="middle" bgcolor="#FFFFFF" style="width:176px;height:110px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;">{{image_3}}<!-- 발송 시 교체: <img src="{{image_3}}" width="176" alt="" class="fluidimg" style="display:block;width:100%;max-width:176px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="176" align="center" style="width:176px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:21px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_3}}</td></tr>
                <tr><td class="fwc" width="176" align="center" style="width:176px;padding:6px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:19px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;">{{sub_3}}</td></tr>
                <tr><td class="fwc" width="176" align="center" style="width:176px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{desc_3}}</td></tr>
              </table></td></tr></table></td></tr><tr><td class="pad" style="padding:46px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_2}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>      <tr><td class="pad" style="padding:0 24px;"><table class="fw rowt" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;"><tr><td class="col up2" width="132" valign="top" style="width:132px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="132" style="width:132px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="130" align="center" style="width:130px;padding:10px 10px 0 10px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="110" style="width:110px;border-collapse:collapse;"><tr><td class="fwc" width="110" height="72" align="center" valign="middle" bgcolor="#FFFFFF" style="width:110px;height:72px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_4}}<!-- 발송 시 교체: <img src="{{image_4}}" width="110" alt="" class="fluidimg" style="display:block;width:100%;max-width:110px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="130" align="center" valign="top" height="52" style="width:130px;height:52px;padding:11px 9px 0 9px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:17px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_4}}</td></tr>
                <tr><td class="fwc" width="130" align="center" style="width:130px;padding:8px 9px 11px 9px;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="112" style="width:112px;border-collapse:collapse;"><tr><td width="112" align="center" bgcolor="#0F218B" style="width:112px;background-color:#0F218B;border-radius:2px;"><a href="{{link_1}}" style="display:block;padding:11px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_1}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="8" style="width:8px;font-size:0;line-height:0;">&nbsp;</td><td class="col up2" width="132" valign="top" style="width:132px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="132" style="width:132px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="130" align="center" style="width:130px;padding:10px 10px 0 10px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="110" style="width:110px;border-collapse:collapse;"><tr><td class="fwc" width="110" height="72" align="center" valign="middle" bgcolor="#FFFFFF" style="width:110px;height:72px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_5}}<!-- 발송 시 교체: <img src="{{image_5}}" width="110" alt="" class="fluidimg" style="display:block;width:100%;max-width:110px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="130" align="center" valign="top" height="52" style="width:130px;height:52px;padding:11px 9px 0 9px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:17px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_5}}</td></tr>
                <tr><td class="fwc" width="130" align="center" style="width:130px;padding:8px 9px 11px 9px;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="112" style="width:112px;border-collapse:collapse;"><tr><td width="112" align="center" bgcolor="#0F218B" style="width:112px;background-color:#0F218B;border-radius:2px;"><a href="{{link_2}}" style="display:block;padding:11px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_2}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="8" style="width:8px;font-size:0;line-height:0;">&nbsp;</td><td class="col up2" width="132" valign="top" style="width:132px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="132" style="width:132px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="130" align="center" style="width:130px;padding:10px 10px 0 10px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="110" style="width:110px;border-collapse:collapse;"><tr><td class="fwc" width="110" height="72" align="center" valign="middle" bgcolor="#FFFFFF" style="width:110px;height:72px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_6}}<!-- 발송 시 교체: <img src="{{image_6}}" width="110" alt="" class="fluidimg" style="display:block;width:100%;max-width:110px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="130" align="center" valign="top" height="52" style="width:130px;height:52px;padding:11px 9px 0 9px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:17px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_6}}</td></tr>
                <tr><td class="fwc" width="130" align="center" style="width:130px;padding:8px 9px 11px 9px;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="112" style="width:112px;border-collapse:collapse;"><tr><td width="112" align="center" bgcolor="#0F218B" style="width:112px;background-color:#0F218B;border-radius:2px;"><a href="{{link_3}}" style="display:block;padding:11px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_3}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="8" style="width:8px;font-size:0;line-height:0;">&nbsp;</td><td class="col up2" width="132" valign="top" style="width:132px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="132" style="width:132px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="130" align="center" style="width:130px;padding:10px 10px 0 10px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="110" style="width:110px;border-collapse:collapse;"><tr><td class="fwc" width="110" height="72" align="center" valign="middle" bgcolor="#FFFFFF" style="width:110px;height:72px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_7}}<!-- 발송 시 교체: <img src="{{image_7}}" width="110" alt="" class="fluidimg" style="display:block;width:100%;max-width:110px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="130" align="center" valign="top" height="52" style="width:130px;height:52px;padding:11px 9px 0 9px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:17px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_7}}</td></tr>
                <tr><td class="fwc" width="130" align="center" style="width:130px;padding:8px 9px 11px 9px;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="112" style="width:112px;border-collapse:collapse;"><tr><td width="112" align="center" bgcolor="#0F218B" style="width:112px;background-color:#0F218B;border-radius:2px;"><a href="{{link_4}}" style="display:block;padding:11px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_4}}</a></td></tr></table></td></tr>
              </table></td></tr></table></td></tr><tr><td class="pad" style="padding:46px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_3}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>      <tr><td class="pad" style="padding:0 24px;"><table class="fw rowt" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;table-layout:fixed;border-collapse:collapse;"><tr><td class="col up3" width="87" valign="top" style="width:87px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="87" style="width:87px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="85" align="center" style="width:85px;padding:7px 7px 0 7px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="71" style="width:71px;border-collapse:collapse;"><tr><td class="fwc" width="71" height="52" align="center" valign="middle" bgcolor="#FFFFFF" style="width:71px;height:52px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:10px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_8}}<!-- 발송 시 교체: <img src="{{image_8}}" width="71" alt="" class="fluidimg" style="display:block;width:100%;max-width:71px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="77" align="center" valign="top" height="34" style="width:77px;height:34px;padding:8px 4px 10px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;word-break:break-all;overflow-wrap:anywhere;">{{copy_1}}</td></tr>
              </table></td><td class="gapcol" width="6" style="width:6px;font-size:0;line-height:0;">&nbsp;</td><td class="col up3" width="87" valign="top" style="width:87px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="87" style="width:87px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="85" align="center" style="width:85px;padding:7px 7px 0 7px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="71" style="width:71px;border-collapse:collapse;"><tr><td class="fwc" width="71" height="52" align="center" valign="middle" bgcolor="#FFFFFF" style="width:71px;height:52px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:10px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_9}}<!-- 발송 시 교체: <img src="{{image_9}}" width="71" alt="" class="fluidimg" style="display:block;width:100%;max-width:71px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="77" align="center" valign="top" height="34" style="width:77px;height:34px;padding:8px 4px 10px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;word-break:break-all;overflow-wrap:anywhere;">{{copy_2}}</td></tr>
              </table></td><td class="gapcol" width="6" style="width:6px;font-size:0;line-height:0;">&nbsp;</td><td class="col up3" width="87" valign="top" style="width:87px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="87" style="width:87px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="85" align="center" style="width:85px;padding:7px 7px 0 7px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="71" style="width:71px;border-collapse:collapse;"><tr><td class="fwc" width="71" height="52" align="center" valign="middle" bgcolor="#FFFFFF" style="width:71px;height:52px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:10px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_10}}<!-- 발송 시 교체: <img src="{{image_10}}" width="71" alt="" class="fluidimg" style="display:block;width:100%;max-width:71px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="77" align="center" valign="top" height="34" style="width:77px;height:34px;padding:8px 4px 10px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;word-break:break-all;overflow-wrap:anywhere;">{{copy_3}}</td></tr>
              </table></td><td class="gapcol" width="6" style="width:6px;font-size:0;line-height:0;">&nbsp;</td><td class="col up3" width="87" valign="top" style="width:87px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="87" style="width:87px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="85" align="center" style="width:85px;padding:7px 7px 0 7px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="71" style="width:71px;border-collapse:collapse;"><tr><td class="fwc" width="71" height="52" align="center" valign="middle" bgcolor="#FFFFFF" style="width:71px;height:52px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:10px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_11}}<!-- 발송 시 교체: <img src="{{image_11}}" width="71" alt="" class="fluidimg" style="display:block;width:100%;max-width:71px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="77" align="center" valign="top" height="34" style="width:77px;height:34px;padding:8px 4px 10px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;word-break:break-all;overflow-wrap:anywhere;">{{copy_4}}</td></tr>
              </table></td><td class="gapcol" width="6" style="width:6px;font-size:0;line-height:0;">&nbsp;</td><td class="col up3" width="87" valign="top" style="width:87px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="87" style="width:87px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="85" align="center" style="width:85px;padding:7px 7px 0 7px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="71" style="width:71px;border-collapse:collapse;"><tr><td class="fwc" width="71" height="52" align="center" valign="middle" bgcolor="#FFFFFF" style="width:71px;height:52px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:10px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_12}}<!-- 발송 시 교체: <img src="{{image_12}}" width="71" alt="" class="fluidimg" style="display:block;width:100%;max-width:71px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="77" align="center" valign="top" height="34" style="width:77px;height:34px;padding:8px 4px 10px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;word-break:break-all;overflow-wrap:anywhere;">{{copy_5}}</td></tr>
              </table></td><td class="gapcol" width="6" style="width:6px;font-size:0;line-height:0;">&nbsp;</td><td class="col up3" width="87" valign="top" style="width:87px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="87" style="width:87px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="85" align="center" style="width:85px;padding:7px 7px 0 7px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="71" style="width:71px;border-collapse:collapse;"><tr><td class="fwc" width="71" height="52" align="center" valign="middle" bgcolor="#FFFFFF" style="width:71px;height:52px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:10px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_13}}<!-- 발송 시 교체: <img src="{{image_13}}" width="71" alt="" class="fluidimg" style="display:block;width:100%;max-width:71px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="77" align="center" valign="top" height="34" style="width:77px;height:34px;padding:8px 4px 10px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;word-break:break-all;overflow-wrap:anywhere;">{{copy_6}}</td></tr>
              </table></td></tr></table></td></tr><tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#0F218B" style="width:300px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>`,
  "edm-no02-onboarding": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.2 온보딩(신규가입) · 미스미 이해도 업 2</title>
<!-- 캠페인입력 NO.2 : 온보딩(신규가입) / 한국+싱가포르 결합 / 테마 미스미 이해도 업 2 / 신규가입 쿠폰 & 쿠폰사용방법안내
     발송로직1 가입 +2일 & 쿠폰미사용
     히어로 텍스트만 · 배지 고정문구 NEW MEMBER BENEFIT · 수신자명 삽입 있음
     콘텐츠1 [B24] 쿠폰 블록 (코드는 텍스트) / 콘텐츠2 [B20] Main→sub→이미지 3단계, 버튼 없음 / 하단 CTA 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;border-collapse:collapse;">
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="stripeA" width="430" height="3" bgcolor="#0F218B" style="width:430px;height:3px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td><td class="stripeB" width="170" height="3" bgcolor="#FFCC00" style="width:170px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
          <tr><td class="fwc" width="600" style="width:600px;padding:0;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
              <tr>
                <td width="5" bgcolor="#0F218B" style="width:5px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td>
                <td class="fwc hpad" width="531" align="center" style="width:531px;padding:42px 32px 46px 32px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="531" style="width:531px;border-collapse:collapse;">
                    <tr><td align="center" style="padding:0 0 26px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td bgcolor="#E8EBF5" style="background-color:#E8EBF5;border-radius:14px;padding:8px 18px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:13px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.2em;color:#0F218B;">NEW MEMBER BENEFIT</td></tr></table>
                    </td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:24px;line-height:36px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;">{{customer_name}} 고객님,<br />{{copy_headline}}</td></tr>
                    <tr><td align="center" style="padding:24px 0 22px 0;font-size:0;line-height:0;">
                      <table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="44" style="width:44px;border-collapse:collapse;"><tr><td width="44" height="3" bgcolor="#FFCC00" style="width:44px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table>
                    </td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;">{{copy_sub}}<br /><strong style="color:#0F218B;">{{copy_sub_strong}}</strong></td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="fwc" width="600" height="1" bgcolor="#EEEEEE" style="width:600px;height:1px;background-color:#EEEEEE;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:44px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_1}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px 40px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" bgcolor="#EDF1F8" style="width:552px;background-color:#EDF1F8;border-collapse:collapse;">
          <tr><td class="fwc" width="552" align="center" style="width:552px;padding:22px 20px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="512" style="width:512px;table-layout:fixed;border-collapse:collapse;">
              <tr>
                <td class="col" width="280" bgcolor="#FFFFFF" valign="middle" align="center" style="width:280px;box-sizing:border-box;background-color:#FFFFFF;padding:34px 16px 36px 16px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="248" style="width:248px;table-layout:fixed;border-collapse:collapse;">
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:18px;line-height:22px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.4em;text-indent:0.4em;color:#9AA3BE;">COUPON</td></tr>
                    <tr><td align="center" style="padding:16px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:44px;line-height:50px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;word-break:break-all;overflow-wrap:anywhere;">{{coupon_value}}</td></tr>
                    <tr><td align="center" style="padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">최대 할인 금액 <span style="font-weight:bold;color:#111111;">{{coupon_max}}</span></td></tr>
                  </table>
                </td>
                <td class="gapcol" width="2" bgcolor="#0F218B" style="width:2px;background-color:#0F218B;background-image:repeating-linear-gradient(to bottom,#EDF1F8 0,#EDF1F8 6px,#0F218B 6px,#0F218B 12px);font-size:0;line-height:0;">&nbsp;</td>
                <td class="col" width="230" bgcolor="#0F218B" valign="middle" align="center" style="width:230px;box-sizing:border-box;background-color:#0F218B;padding:34px 16px 36px 16px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="190" style="width:190px;table-layout:fixed;border-collapse:collapse;">
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:22px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:-0.01em;color:#FFFFFF;">{{coupon_target}}</td></tr>
                    <tr><td align="center" style="padding:5px 0 16px 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;color:#C9CDDB;">※ {{coupon_note}}</td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:17px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#FFFFFF;">쿠폰번호</td></tr>
                    <tr><td align="center" style="padding:10px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:26px;line-height:32px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.04em;color:#FFCC00;word-break:break-all;overflow-wrap:anywhere;">{{coupon_code}}</td></tr>
                    <tr><td align="center" style="padding:12px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;color:#C9CDDB;">사용 기한 {{coupon_expiry}}</td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_2}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>      <tr><td class="pad" style="padding:0 24px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;"><tr><td class="fwc" width="552" style="width:552px;box-sizing:border-box;border:1px solid #EEEEEE;padding:20px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="510" style="width:510px;border-collapse:collapse;">
              <tr><td class="fwc" width="510" style="width:510px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:17px;line-height:24px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_1}}</td></tr>
              <tr><td class="fwc" width="510" style="width:510px;padding:7px 0 16px 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#3A3A3A;">{{sub_1}}</td></tr>
              <tr><td class="fwc" width="510" style="width:510px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="510" style="width:510px;border-collapse:collapse;"><tr><td class="fwc" width="510" height="220" align="center" valign="middle" bgcolor="#FFFFFF" style="width:510px;height:220px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_1}}<!-- 발송 시 교체: <img src="{{image_1}}" width="510" alt="" class="fluidimg" style="display:block;width:100%;max-width:510px;height:auto;border:0;" /> --></td></tr></table></td></tr>
            </table></td></tr><tr><td class="fwc" width="552" align="center" style="width:552px;padding:10px 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:15px;mso-line-height-rule:exactly;color:#868686;">&#9660;</td></tr><tr><td class="fwc" width="552" style="width:552px;box-sizing:border-box;border:1px solid #EEEEEE;padding:20px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="510" style="width:510px;border-collapse:collapse;">
              <tr><td class="fwc" width="510" style="width:510px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:17px;line-height:24px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_2}}</td></tr>
              <tr><td class="fwc" width="510" style="width:510px;padding:7px 0 16px 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#3A3A3A;">{{sub_2}}</td></tr>
              <tr><td class="fwc" width="510" style="width:510px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="510" style="width:510px;border-collapse:collapse;"><tr><td class="fwc" width="510" height="220" align="center" valign="middle" bgcolor="#FFFFFF" style="width:510px;height:220px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_2}}<!-- 발송 시 교체: <img src="{{image_2}}" width="510" alt="" class="fluidimg" style="display:block;width:100%;max-width:510px;height:auto;border:0;" /> --></td></tr></table></td></tr>
            </table></td></tr><tr><td class="fwc" width="552" align="center" style="width:552px;padding:10px 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:15px;mso-line-height-rule:exactly;color:#868686;">&#9660;</td></tr><tr><td class="fwc" width="552" style="width:552px;box-sizing:border-box;border:1px solid #EEEEEE;padding:20px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="510" style="width:510px;border-collapse:collapse;">
              <tr><td class="fwc" width="510" style="width:510px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:17px;line-height:24px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_3}}</td></tr>
              <tr><td class="fwc" width="510" style="width:510px;padding:7px 0 16px 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#3A3A3A;">{{sub_3}}</td></tr>
              <tr><td class="fwc" width="510" style="width:510px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="510" style="width:510px;border-collapse:collapse;"><tr><td class="fwc" width="510" height="220" align="center" valign="middle" bgcolor="#FFFFFF" style="width:510px;height:220px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_3}}<!-- 발송 시 교체: <img src="{{image_3}}" width="510" alt="" class="fluidimg" style="display:block;width:100%;max-width:510px;height:auto;border:0;" /> --></td></tr></table></td></tr>
            </table></td></tr></table></td></tr><tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#0F218B" style="width:300px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>

  </table>
</td></tr></table>
</body>
</html>`,
  "edm-no03-onboarding": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.3 온보딩(신규가입) · 미스미 이해도 업 3</title>
<!-- 캠페인입력 NO.3 : 온보딩(신규가입) / 싱가포르 콘텐츠 / 테마 미스미 이해도 업 3 / 스마트 검색 & 견적 및 결제 가이드
     히어로 텍스트만 · 배지 고정문구 QUICK & EASY ORDER · 수신자명 삽입 있음
     콘텐츠1 [B13] 버튼 3개 / 콘텐츠2 [B13] 버튼 3개 / 하단 CTA 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;border-collapse:collapse;">
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="stripeA" width="430" height="3" bgcolor="#0F218B" style="width:430px;height:3px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td><td class="stripeB" width="170" height="3" bgcolor="#FFCC00" style="width:170px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
          <tr><td class="fwc" width="600" style="width:600px;padding:0;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
              <tr>
                <td width="5" bgcolor="#0F218B" style="width:5px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td>
                <td class="fwc hpad" width="531" align="center" style="width:531px;padding:42px 32px 46px 32px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="531" style="width:531px;border-collapse:collapse;">
                    <tr><td align="center" style="padding:0 0 26px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td bgcolor="#E8EBF5" style="background-color:#E8EBF5;border-radius:14px;padding:8px 18px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:13px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.2em;color:#0F218B;">QUICK &amp; EASY ORDER</td></tr></table>
                    </td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:24px;line-height:36px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;">{{customer_name}} 고객님,<br />{{copy_headline}}</td></tr>
                    <tr><td align="center" style="padding:24px 0 22px 0;font-size:0;line-height:0;">
                      <table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="44" style="width:44px;border-collapse:collapse;"><tr><td width="44" height="3" bgcolor="#FFCC00" style="width:44px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table>
                    </td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;">{{copy_sub}}<br /><strong style="color:#0F218B;">{{copy_sub_strong}}</strong></td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="fwc" width="600" height="1" bgcolor="#EEEEEE" style="width:600px;height:1px;background-color:#EEEEEE;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:44px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_1}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;table-layout:fixed;border-collapse:collapse;"><tr><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_1}}<!-- 발송 시 교체: <img src="{{image_1}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_1}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_1}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_1}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_1}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_2}}<!-- 발송 시 교체: <img src="{{image_2}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_2}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_2}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_2}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_2}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_3}}<!-- 발송 시 교체: <img src="{{image_3}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_3}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_3}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_3}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_3}}</a></td></tr></table></td></tr>
              </table></td></tr></table></td></tr>
      <tr><td class="pad" style="padding:46px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_2}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;table-layout:fixed;border-collapse:collapse;"><tr><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_4}}<!-- 발송 시 교체: <img src="{{image_4}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_4}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_4}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_4}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_4}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_5}}<!-- 발송 시 교체: <img src="{{image_5}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_5}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_5}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_5}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_5}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_6}}<!-- 발송 시 교체: <img src="{{image_6}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_6}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_6}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_6}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_6}}</a></td></tr></table></td></tr>
              </table></td></tr></table></td></tr>
      <tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#0F218B" style="width:300px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>`,
  "edm-no04-onboarding": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.4 온보딩(신규가입) · 미스미 이해도 업 4</title>
<!-- 캠페인입력 NO.4 : 온보딩(신규가입) / 한국+싱가포르 결합 / 테마 미스미 이해도 업 4 / 미스미 브랜드 & 재고품 베리에이션 안내
     히어로 텍스트만 · 배지 고정문구 BRAND LINE UP · 수신자명 삽입 없음
     콘텐츠1 [B16] 버튼 1개 / 콘텐츠2 [B16] 버튼 1개 / 콘텐츠3 [B16] 버튼 1개 / 하단 CTA 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;border-collapse:collapse;">
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="stripeA" width="430" height="3" bgcolor="#0F218B" style="width:430px;height:3px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td><td class="stripeB" width="170" height="3" bgcolor="#FFCC00" style="width:170px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
          <tr><td class="fwc" width="600" style="width:600px;padding:0;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
              <tr>
                <td width="5" bgcolor="#0F218B" style="width:5px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td>
                <td class="fwc hpad" width="531" align="center" style="width:531px;padding:42px 32px 46px 32px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="531" style="width:531px;border-collapse:collapse;">
                    <tr><td align="center" style="padding:0 0 26px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td bgcolor="#E8EBF5" style="background-color:#E8EBF5;border-radius:14px;padding:8px 18px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:13px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.2em;color:#0F218B;">BRAND LINE UP</td></tr></table>
                    </td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:24px;line-height:36px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;">{{copy_headline}}</td></tr>
                    <tr><td align="center" style="padding:24px 0 22px 0;font-size:0;line-height:0;">
                      <table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="44" style="width:44px;border-collapse:collapse;"><tr><td width="44" height="3" bgcolor="#FFCC00" style="width:44px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table>
                    </td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;">{{copy_sub}}<br /><strong style="color:#0F218B;">{{copy_sub_strong}}</strong></td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="fwc" width="600" height="1" bgcolor="#EEEEEE" style="width:600px;height:1px;background-color:#EEEEEE;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:44px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_1}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" style="width:550px;padding:16px 18px 18px 18px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;">
              <tr><td class="fwc" width="514" align="center" style="width:514px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;"><tr><td class="fwc" width="514" height="132" align="center" valign="middle" bgcolor="#FFFFFF" style="width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_1}}<!-- 발송 시 교체: <img src="{{image_1}}" width="514" alt="" class="fluidimg" style="display:block;width:100%;max-width:514px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_1}}</td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_1}}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td align="center" style="padding:20px 24px 0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="260" style="width:260px;border-collapse:collapse;"><tr><td class="fwc" width="260" align="center" bgcolor="#0F218B" style="width:260px;background-color:#0F218B;border-radius:2px;"><a href="{{link_1}}" style="display:block;padding:13px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:17px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_1}}</a></td></tr></table>
      </td></tr>
      <tr><td class="pad" style="padding:46px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_2}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" style="width:550px;padding:16px 18px 18px 18px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;">
              <tr><td class="fwc" width="514" align="center" style="width:514px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;"><tr><td class="fwc" width="514" height="132" align="center" valign="middle" bgcolor="#FFFFFF" style="width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_2}}<!-- 발송 시 교체: <img src="{{image_2}}" width="514" alt="" class="fluidimg" style="display:block;width:100%;max-width:514px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_2}}</td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_2}}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td align="center" style="padding:20px 24px 0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="260" style="width:260px;border-collapse:collapse;"><tr><td class="fwc" width="260" align="center" bgcolor="#0F218B" style="width:260px;background-color:#0F218B;border-radius:2px;"><a href="{{link_2}}" style="display:block;padding:13px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:17px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_2}}</a></td></tr></table>
      </td></tr>
      <tr><td class="pad" style="padding:46px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_3}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" style="width:550px;padding:16px 18px 18px 18px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;">
              <tr><td class="fwc" width="514" align="center" style="width:514px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;"><tr><td class="fwc" width="514" height="132" align="center" valign="middle" bgcolor="#FFFFFF" style="width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_3}}<!-- 발송 시 교체: <img src="{{image_3}}" width="514" alt="" class="fluidimg" style="display:block;width:100%;max-width:514px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_3}}</td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_3}}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td align="center" style="padding:20px 24px 0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="260" style="width:260px;border-collapse:collapse;"><tr><td class="fwc" width="260" align="center" bgcolor="#0F218B" style="width:260px;background-color:#0F218B;border-radius:2px;"><a href="{{link_3}}" style="display:block;padding:13px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:17px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_3}}</a></td></tr></table>
      </td></tr>
      <tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#0F218B" style="width:300px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>`,
  "edm-no05-onboarding": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.5 온보딩(신규가입) · 미스미 이해도 업 5</title>
<!-- 캠페인입력 NO.5 : 온보딩(신규가입) / 싱가포르 콘텐츠 / 테마 미스미 이해도 업 5 / 고객서비스 & 반품방법안내
     히어로 텍스트만 · 배지 고정문구 CUSTOMER SUPPORT · 수신자명 삽입 없음
     콘텐츠1 [B16] 버튼 1개 / 콘텐츠2 [B16] 버튼 1개 / 하단 CTA 없음 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;border-collapse:collapse;">
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="stripeA" width="430" height="3" bgcolor="#0F218B" style="width:430px;height:3px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td><td class="stripeB" width="170" height="3" bgcolor="#FFCC00" style="width:170px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
          <tr><td class="fwc" width="600" style="width:600px;padding:0;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
              <tr>
                <td width="5" bgcolor="#0F218B" style="width:5px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td>
                <td class="fwc hpad" width="531" align="center" style="width:531px;padding:42px 32px 46px 32px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="531" style="width:531px;border-collapse:collapse;">
                    <tr><td align="center" style="padding:0 0 26px 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td bgcolor="#E8EBF5" style="background-color:#E8EBF5;border-radius:14px;padding:8px 18px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:13px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.2em;color:#0F218B;">CUSTOMER SUPPORT</td></tr></table>
                    </td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:24px;line-height:36px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;">{{copy_headline}}</td></tr>
                    <tr><td align="center" style="padding:24px 0 22px 0;font-size:0;line-height:0;">
                      <table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="44" style="width:44px;border-collapse:collapse;"><tr><td width="44" height="3" bgcolor="#FFCC00" style="width:44px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table>
                    </td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;">{{copy_sub}}<br /><strong style="color:#0F218B;">{{copy_sub_strong}}</strong></td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="fwc" width="600" height="1" bgcolor="#EEEEEE" style="width:600px;height:1px;background-color:#EEEEEE;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:44px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_1}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" style="width:550px;padding:16px 18px 18px 18px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;">
              <tr><td class="fwc" width="514" align="center" style="width:514px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;"><tr><td class="fwc" width="514" height="132" align="center" valign="middle" bgcolor="#FFFFFF" style="width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_1}}<!-- 발송 시 교체: <img src="{{image_1}}" width="514" alt="" class="fluidimg" style="display:block;width:100%;max-width:514px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_1}}</td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_1}}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td align="center" style="padding:20px 24px 0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="260" style="width:260px;border-collapse:collapse;"><tr><td class="fwc" width="260" align="center" bgcolor="#0F218B" style="width:260px;background-color:#0F218B;border-radius:2px;"><a href="{{link_1}}" style="display:block;padding:13px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:17px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_1}}</a></td></tr></table>
      </td></tr>
      <tr><td class="pad" style="padding:46px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_2}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" style="width:550px;padding:16px 18px 18px 18px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;">
              <tr><td class="fwc" width="514" align="center" style="width:514px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;"><tr><td class="fwc" width="514" height="132" align="center" valign="middle" bgcolor="#FFFFFF" style="width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_2}}<!-- 발송 시 교체: <img src="{{image_2}}" width="514" alt="" class="fluidimg" style="display:block;width:100%;max-width:514px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_2}}</td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_2}}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td align="center" style="padding:20px 24px 90px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="260" style="width:260px;border-collapse:collapse;"><tr><td class="fwc" width="260" align="center" bgcolor="#0F218B" style="width:260px;background-color:#0F218B;border-radius:2px;"><a href="{{link_2}}" style="display:block;padding:13px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:17px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_2}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>`,
  "edm-no06-nurture": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.6 육성(기존고객) · 기술정보 안내</title>
<!-- 캠페인입력 NO.6 : 육성(기존고객) / 싱가포르 콘텐츠 / 테마 기술정보 안내 / 기술정보 사이트 안내, PV 상위 기술정보 콘텐츠 소개
     히어로 텍스트만 · 배지 고정문구 RESOURCES YOU MAY NEED — TECHNICAL INFORMATION · 수신자명 삽입 없음
     콘텐츠1 [B17] 버튼 없음 / 콘텐츠2 [B13] 버튼 3개 / 하단 CTA 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;border-collapse:collapse;">
          <tr><td class="fwc" width="600" style="width:600px;padding:0;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
              <tr>
                <td class="fwc hpad" width="600" align="center" style="width:600px;box-sizing:border-box;padding:44px 32px 48px 32px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;table-layout:fixed;border-collapse:collapse;">
                    <tr><td class="fwc" width="536" align="center" style="width:536px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;text-indent:0.14em;color:#0F218B;word-break:break-word;overflow-wrap:break-word;">RESOURCES YOU MAY NEED &#8212; TECHNICAL INFORMATION</td></tr>
                    <tr><td align="center" style="padding:18px 0 20px 0;font-size:0;line-height:0;">
                      <table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="1" style="width:1px;border-collapse:collapse;"><tr><td width="1" height="26" bgcolor="#C9CDDB" style="width:1px;height:26px;background-color:#C9CDDB;font-size:0;line-height:0;">&nbsp;</td></tr></table>
                    </td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:24px;line-height:36px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;">{{copy_headline}}</td></tr>
                    <tr><td align="center" style="padding:22px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;">{{copy_sub}}</td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="fwc" width="240" height="3" bgcolor="#0F218B" style="width:240px;height:3px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td><td class="fwc" width="360" height="3" bgcolor="#EEEEEE" style="width:360px;height:3px;background-color:#EEEEEE;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:40px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_1}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" align="center" style="width:550px;padding:16px 18px 18px 18px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="514" align="center" style="width:514px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;"><tr><td class="fwc" width="514" height="132" align="center" valign="middle" bgcolor="#FFFFFF" style="width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_1}}<!-- 발송 시 교체: <img src="{{image_1}}" width="514" alt="" class="fluidimg" style="display:block;width:100%;max-width:514px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_1}}</td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_1}}</td></tr>
            </table>
          </td></tr>
        </table>
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;"><tr><td class="fwc" width="552" height="10" style="width:552px;height:10px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" align="center" style="width:550px;padding:16px 18px 18px 18px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="514" align="center" style="width:514px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;"><tr><td class="fwc" width="514" height="132" align="center" valign="middle" bgcolor="#FFFFFF" style="width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_2}}<!-- 발송 시 교체: <img src="{{image_2}}" width="514" alt="" class="fluidimg" style="display:block;width:100%;max-width:514px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_2}}</td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_2}}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:46px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_2}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;table-layout:fixed;border-collapse:collapse;"><tr><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_3}}<!-- 발송 시 교체: <img src="{{image_3}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_3}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_3}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_1}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_1}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_4}}<!-- 발송 시 교체: <img src="{{image_4}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_4}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_4}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_2}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_2}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_5}}<!-- 발송 시 교체: <img src="{{image_5}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_5}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_5}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_3}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_3}}</a></td></tr></table></td></tr>
              </table></td></tr></table></td></tr>
      <tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#0F218B" style="width:300px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>`,
  "edm-no07-nurture": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.7 육성(기존고객) · CAD D/L 안내</title>
<!-- 캠페인입력 NO.7 : 육성(기존고객) / 싱가포르 콘텐츠 / 테마 CAD D/L 안내 / CAD D/L 이용방법 안내
     히어로 텍스트만 · 배지 고정문구 RESOURCES YOU MAY NEED — FREE CAD DOWNLOAD · 수신자명 삽입 없음
     콘텐츠1 [B16] 버튼 없음 / 콘텐츠2 [B27] = [B16] 2개 버튼 없음 / 하단 CTA 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;border-collapse:collapse;">
          <tr><td class="fwc" width="600" style="width:600px;padding:0;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
              <tr>
                <td class="fwc hpad" width="600" align="center" style="width:600px;box-sizing:border-box;padding:44px 32px 48px 32px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;table-layout:fixed;border-collapse:collapse;">
                    <tr><td class="fwc" width="536" align="center" style="width:536px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;text-indent:0.14em;color:#0F218B;word-break:break-word;overflow-wrap:break-word;">RESOURCES YOU MAY NEED &#8212; FREE CAD DOWNLOAD</td></tr>
                    <tr><td align="center" style="padding:18px 0 20px 0;font-size:0;line-height:0;">
                      <table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="1" style="width:1px;border-collapse:collapse;"><tr><td width="1" height="26" bgcolor="#C9CDDB" style="width:1px;height:26px;background-color:#C9CDDB;font-size:0;line-height:0;">&nbsp;</td></tr></table>
                    </td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:24px;line-height:36px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;">{{copy_headline}}</td></tr>
                    <tr><td align="center" style="padding:22px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;">{{copy_sub}}</td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="fwc" width="240" height="3" bgcolor="#0F218B" style="width:240px;height:3px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td><td class="fwc" width="360" height="3" bgcolor="#EEEEEE" style="width:360px;height:3px;background-color:#EEEEEE;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:40px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_1}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" align="center" style="width:550px;padding:16px 18px 18px 18px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="514" align="center" style="width:514px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;"><tr><td class="fwc" width="514" height="132" align="center" valign="middle" bgcolor="#FFFFFF" style="width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_1}}<!-- 발송 시 교체: <img src="{{image_1}}" width="514" alt="" class="fluidimg" style="display:block;width:100%;max-width:514px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_1}}</td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_1}}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:46px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_2}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" align="center" style="width:550px;padding:16px 18px 18px 18px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="514" align="center" style="width:514px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;"><tr><td class="fwc" width="514" height="132" align="center" valign="middle" bgcolor="#FFFFFF" style="width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_2}}<!-- 발송 시 교체: <img src="{{image_2}}" width="514" alt="" class="fluidimg" style="display:block;width:100%;max-width:514px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_2}}</td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_2}}</td></tr>
            </table>
          </td></tr>
        </table>
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;"><tr><td class="fwc" width="552" height="10" style="width:552px;height:10px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" align="center" style="width:550px;padding:16px 18px 18px 18px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="514" align="center" style="width:514px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;"><tr><td class="fwc" width="514" height="132" align="center" valign="middle" bgcolor="#FFFFFF" style="width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_3}}<!-- 발송 시 교체: <img src="{{image_3}}" width="514" alt="" class="fluidimg" style="display:block;width:100%;max-width:514px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_3}}</td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_3}}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#0F218B" style="width:300px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>`,
  "edm-no08-nurture": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.8 육성(기존고객) · AI 기술대응 안내</title>
<!-- 캠페인입력 NO.8 : 육성(기존고객) / 싱가포르 콘텐츠 / 테마 AI 기술대응 안내 / AI상품문의 이용방법 안내
     히어로 텍스트만 · 배지 고정문구 RESOURCES YOU MAY NEED — PRODUCT Q&A WITH MISUMI AI · 수신자명 삽입 없음
     콘텐츠1 [B27] = [B16] 2개 버튼 없음 / 콘텐츠2 [B13] 버튼 3개 / 하단 CTA 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;border-collapse:collapse;">
          <tr><td class="fwc" width="600" style="width:600px;padding:0;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
              <tr>
                <td class="fwc hpad" width="600" align="center" style="width:600px;box-sizing:border-box;padding:44px 32px 48px 32px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;table-layout:fixed;border-collapse:collapse;">
                    <tr><td class="fwc" width="536" align="center" style="width:536px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;text-indent:0.14em;color:#0F218B;word-break:break-word;overflow-wrap:break-word;">RESOURCES YOU MAY NEED &#8212; PRODUCT Q&amp;A WITH MISUMI AI</td></tr>
                    <tr><td align="center" style="padding:18px 0 20px 0;font-size:0;line-height:0;">
                      <table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="1" style="width:1px;border-collapse:collapse;"><tr><td width="1" height="26" bgcolor="#C9CDDB" style="width:1px;height:26px;background-color:#C9CDDB;font-size:0;line-height:0;">&nbsp;</td></tr></table>
                    </td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:24px;line-height:36px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;">{{copy_headline}}</td></tr>
                    <tr><td align="center" style="padding:22px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;">{{copy_sub}}</td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="fwc" width="240" height="3" bgcolor="#0F218B" style="width:240px;height:3px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td><td class="fwc" width="360" height="3" bgcolor="#EEEEEE" style="width:360px;height:3px;background-color:#EEEEEE;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:40px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_1}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" align="center" style="width:550px;padding:16px 18px 18px 18px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="514" align="center" style="width:514px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;"><tr><td class="fwc" width="514" height="132" align="center" valign="middle" bgcolor="#FFFFFF" style="width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_1}}<!-- 발송 시 교체: <img src="{{image_1}}" width="514" alt="" class="fluidimg" style="display:block;width:100%;max-width:514px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_1}}</td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_1}}</td></tr>
            </table>
          </td></tr>
        </table>
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;"><tr><td class="fwc" width="552" height="10" style="width:552px;height:10px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" align="center" style="width:550px;padding:16px 18px 18px 18px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="514" align="center" style="width:514px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;"><tr><td class="fwc" width="514" height="132" align="center" valign="middle" bgcolor="#FFFFFF" style="width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_2}}<!-- 발송 시 교체: <img src="{{image_2}}" width="514" alt="" class="fluidimg" style="display:block;width:100%;max-width:514px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_2}}</td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_2}}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:46px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_2}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;table-layout:fixed;border-collapse:collapse;"><tr><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_3}}<!-- 발송 시 교체: <img src="{{image_3}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_3}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_3}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_1}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_1}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_4}}<!-- 발송 시 교체: <img src="{{image_4}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_4}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_4}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_2}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_2}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_5}}<!-- 발송 시 교체: <img src="{{image_5}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_5}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_5}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_3}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_3}}</a></td></tr></table></td></tr>
              </table></td></tr></table></td></tr>
      <tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#0F218B" style="width:300px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>`,
  "edm-no09-nurture": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.9 육성(기존고객) · 재구매 안내</title>
<!-- 캠페인입력 NO.9 : 육성(기존고객) / 싱가포르 콘텐츠 / 테마 재구매 안내 / 견적이력 확인 → 재구매 안내
     히어로 텍스트만 · 배지 고정문구 DO YOU NEED TO QUOTE OR ORDER? · 수신자명 삽입 없음
     콘텐츠1 [B27] = [B16] 2개 버튼 없음 / 하단 CTA 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;border-collapse:collapse;">
          <tr><td class="fwc" width="600" style="width:600px;padding:0;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
              <tr>
                <td class="fwc hpad" width="600" align="center" style="width:600px;box-sizing:border-box;padding:44px 32px 48px 32px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;table-layout:fixed;border-collapse:collapse;">
                    <tr><td class="fwc" width="536" align="center" style="width:536px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;text-indent:0.14em;color:#0F218B;word-break:break-word;overflow-wrap:break-word;">DO YOU NEED TO QUOTE OR ORDER?</td></tr>
                    <tr><td align="center" style="padding:18px 0 20px 0;font-size:0;line-height:0;">
                      <table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="1" style="width:1px;border-collapse:collapse;"><tr><td width="1" height="26" bgcolor="#C9CDDB" style="width:1px;height:26px;background-color:#C9CDDB;font-size:0;line-height:0;">&nbsp;</td></tr></table>
                    </td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:24px;line-height:36px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;">{{copy_headline}}</td></tr>
                    <tr><td align="center" style="padding:22px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;">{{copy_sub}}</td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="fwc" width="240" height="3" bgcolor="#0F218B" style="width:240px;height:3px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td><td class="fwc" width="360" height="3" bgcolor="#EEEEEE" style="width:360px;height:3px;background-color:#EEEEEE;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:40px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" align="center" style="width:550px;padding:16px 18px 18px 18px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="514" align="center" style="width:514px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;"><tr><td class="fwc" width="514" height="132" align="center" valign="middle" bgcolor="#FFFFFF" style="width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_1}}<!-- 발송 시 교체: <img src="{{image_1}}" width="514" alt="" class="fluidimg" style="display:block;width:100%;max-width:514px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_1}}</td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_1}}</td></tr>
            </table>
          </td></tr>
        </table>
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;"><tr><td class="fwc" width="552" height="10" style="width:552px;height:10px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" align="center" style="width:550px;padding:16px 18px 18px 18px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="514" align="center" style="width:514px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="514" style="width:514px;border-collapse:collapse;"><tr><td class="fwc" width="514" height="132" align="center" valign="middle" bgcolor="#FFFFFF" style="width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_2}}<!-- 발송 시 교체: <img src="{{image_2}}" width="514" alt="" class="fluidimg" style="display:block;width:100%;max-width:514px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_2}}</td></tr>
              <tr><td class="fwc" width="514" align="center" style="width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_2}}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#0F218B" style="width:300px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>`,
  "edm-no10-nurture": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.10 육성(기존고객) · 신상품, PD상품 안내</title>
<!-- 캠페인입력 NO.10 : 육성(기존고객) / 싱가포르 콘텐츠 / 테마 신상품, PD상품 안내 / 베스트 신상품, PD상품 및 전용페이지 안내
     히어로 텍스트만 · 배지 고정문구 NEW / DISCOUNTED ITEMS · 수신자명 삽입 있음
     콘텐츠1 [B13] 버튼 3개 (신상품) / 콘텐츠2 [B13] 버튼 3개 (PD상품) / 하단 CTA 버튼 2개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;border-collapse:collapse;">
          <tr><td class="fwc" width="600" style="width:600px;padding:0;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
              <tr>
                <td class="fwc hpad" width="600" align="center" style="width:600px;box-sizing:border-box;padding:44px 32px 48px 32px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;table-layout:fixed;border-collapse:collapse;">
                    <tr><td class="fwc" width="536" align="center" style="width:536px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;text-indent:0.14em;color:#0F218B;word-break:break-word;overflow-wrap:break-word;">NEW / DISCOUNTED ITEMS</td></tr>
                    <tr><td align="center" style="padding:18px 0 20px 0;font-size:0;line-height:0;">
                      <table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="1" style="width:1px;border-collapse:collapse;"><tr><td width="1" height="26" bgcolor="#C9CDDB" style="width:1px;height:26px;background-color:#C9CDDB;font-size:0;line-height:0;">&nbsp;</td></tr></table>
                    </td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:24px;line-height:36px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;">{{customer_name}} 고객님,<br />{{copy_headline}}</td></tr>
                    <tr><td align="center" style="padding:22px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;">{{copy_sub}}</td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="fwc" width="240" height="3" bgcolor="#0F218B" style="width:240px;height:3px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td><td class="fwc" width="360" height="3" bgcolor="#EEEEEE" style="width:360px;height:3px;background-color:#EEEEEE;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:40px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_1}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;table-layout:fixed;border-collapse:collapse;"><tr><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_1}}<!-- 발송 시 교체: <img src="{{image_1}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_1}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_1}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_1}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_1}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_2}}<!-- 발송 시 교체: <img src="{{image_2}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_2}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_2}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_2}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_2}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_3}}<!-- 발송 시 교체: <img src="{{image_3}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_3}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_3}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_3}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_3}}</a></td></tr></table></td></tr>
              </table></td></tr></table></td></tr>
      <tr><td class="pad" style="padding:46px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_2}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table  role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;table-layout:fixed;border-collapse:collapse;"><tr><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_6}}<!-- 발송 시 교체: <img src="{{image_6}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_6}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_6}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_6}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_6}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_5}}<!-- 발송 시 교체: <img src="{{image_5}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_5}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_5}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_5}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_5}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_4}}<!-- 발송 시 교체: <img src="{{image_4}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_4}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_4}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_4}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_4}}</a></td></tr></table></td></tr>
              </table></td></tr></table></td></tr>
      <tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;table-layout:fixed;border-collapse:collapse;">
          <tr>
            <td class="col" width="270" align="center" style="width:270px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="270" style="width:270px;border-collapse:collapse;"><tr><td class="fwc" width="270" align="center" bgcolor="#0F218B" style="width:270px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url_1}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label_1}}</a></td></tr></table></td>
            <td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td>
            <td class="col" width="270" align="center" style="width:270px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="270" style="width:270px;border-collapse:collapse;"><tr><td class="fwc" width="270" align="center" bgcolor="#0F218B" style="width:270px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url_2}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label_2}}</a></td></tr></table></td>
          </tr>
        </table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>
`,
  "edm-no11-winback": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.11 이탈방지(휴면고객) · 경제형상품 안내</title>
<!-- 캠페인입력 NO.11 : 이탈방지(휴면고객) / 한국 콘텐츠 / 경제형상품 안내
     히어로 텍스트만 · 배지 고정문구 MISUMI Economy Line-up · 수신자명 삽입 없음
     콘텐츠1 [B22] 이미지블록 버튼 없음 / 콘텐츠2 [B23] 3x2 링크 6개 / 하단 CTA 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .sidebar{width:8px!important;}
    .hgrid{text-align:left!important;}
    .hcell{width:50%!important;padding:0 4px 12px 4px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#000000" style="background-color:#000000;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
          <tr>
            <td class="fwc sidebar" width="88" bgcolor="#FFCC00" style="width:88px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td>
            <td class="fwc hpad" width="512" valign="top" style="width:512px;box-sizing:border-box;padding:42px 32px 44px 28px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="452" style="width:452px;table-layout:fixed;border-collapse:collapse;">
                <tr><td class="fwc" width="452" style="width:452px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;color:#FFCC00;word-break:break-word;overflow-wrap:break-word;">MISUMI ECONOMY LINE-UP</td></tr>
                <tr><td style="padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:26px;line-height:37px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;letter-spacing:-0.02em;">{{copy_headline}}</td></tr>
                <tr><td style="padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#A7A7A7;">{{copy_sub}}</td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:38px 24px 16px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;letter-spacing:-0.01em;">{{c_headline_1}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" height="240" align="center" valign="middle" bgcolor="#FFFFFF" style="width:552px;height:240px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;">{{image_1}}<!-- 발송 시 교체: <img src="{{image_1}}" width="552" alt="" class="fluidimg" style="display:block;width:100%;max-width:552px;height:auto;border:0;" /> --></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:40px 24px 16px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;letter-spacing:-0.01em;">{{c_headline_2}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>      <tr><td class="pad" style="padding:0 24px;">
        <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;"><tr><![endif]-->
        <div class="hgrid" style="font-size:0;line-height:0;text-align:left;width:100%;max-width:552px;">
            <!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_1}}" style="color:#868686;text-decoration:none;">{{image_7}}</a><!-- 발송 시 교체: <img src="{{image_7}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" style="width:174px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;"><a href="{{link_1}}" style="color:#000000;text-decoration:none;">{{main_1}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" style="width:174px;padding:6px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_1}}</td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_2}}" style="color:#868686;text-decoration:none;">{{image_2}}</a><!-- 발송 시 교체: <img src="{{image_2}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" style="width:174px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;"><a href="{{link_2}}" style="color:#000000;text-decoration:none;">{{main_2}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" style="width:174px;padding:6px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_2}}</td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_3}}" style="color:#868686;text-decoration:none;">{{image_3}}</a><!-- 발송 시 교체: <img src="{{image_3}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" style="width:174px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;"><a href="{{link_3}}" style="color:#000000;text-decoration:none;">{{main_3}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" style="width:174px;padding:6px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_3}}</td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_4}}" style="color:#868686;text-decoration:none;">{{image_4}}</a><!-- 발송 시 교체: <img src="{{image_4}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" style="width:174px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;"><a href="{{link_4}}" style="color:#000000;text-decoration:none;">{{main_4}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" style="width:174px;padding:6px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_4}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" style="width:174px;padding:7px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;color:#A0A0A0;">{{desc_4}}</td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_5}}" style="color:#868686;text-decoration:none;">{{image_5}}</a><!-- 발송 시 교체: <img src="{{image_5}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" style="width:174px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;"><a href="{{link_5}}" style="color:#000000;text-decoration:none;">{{main_5}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" style="width:174px;padding:6px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_5}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" style="width:174px;padding:7px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;color:#A0A0A0;">{{desc_5}}</td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_6}}" style="color:#868686;text-decoration:none;">{{image_6}}</a><!-- 발송 시 교체: <img src="{{image_6}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" style="width:174px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;"><a href="{{link_6}}" style="color:#000000;text-decoration:none;">{{main_6}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" style="width:174px;padding:6px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_6}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" style="width:174px;padding:7px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;color:#A0A0A0;">{{desc_6}}</td></tr>
              </table></div>
            <!--[if mso]></td><![endif]-->
        </div>
        <!--[if mso]></tr></table><![endif]-->
      </td></tr><tr><td class="pad" align="center" style="padding:38px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#FFCC00" style="width:300px;background-color:#FFCC00;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>`,
  "edm-no13-winback": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.13 이탈방지(휴면고객) · 납기/발주 서비스안내</title>
<!-- 캠페인입력 NO.13 : 이탈방지(휴면고객) / 한국+싱가포르 결합 / 납기·발주 서비스안내 (익스프레스 및 챗봇 서비스)
     히어로 텍스트만 · 배지 고정문구 WE ARE HERE TO HELP · 수신자명 삽입 있음
     콘텐츠1 [B22] 버튼 3개 / 콘텐츠2 [B16] 버튼 1개 / 콘텐츠3 [B16] 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#EDF1F8" style="background-color:#EDF1F8;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
          <tr><td class="fwc hpad" width="600" valign="top" style="width:600px;box-sizing:border-box;padding:42px 32px 44px 32px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="536" style="width:536px;padding:0 0 18px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td style="box-sizing:border-box;border:1px solid #0F218B;padding:7px 13px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;color:#0F218B;">WE ARE HERE TO HELP</td></tr></table>
              </td></tr>
              <tr><td class="fwc" width="536" style="width:536px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:26px;line-height:38px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;">{{customer_name}} 고객님,<br /><span style="border-bottom:4px solid #FFCC00;">{{copy_headline}}</span></td></tr>
              <tr><td class="fwc" width="536" style="width:536px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#5E6780;">{{copy_sub}}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:44px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_1}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" height="240" align="center" valign="middle" bgcolor="#FFFFFF" style="width:552px;height:240px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_main}}<!-- 발송 시 교체: <img src="{{image_main}}" width="552" alt="" class="fluidimg" style="display:block;width:100%;max-width:552px;height:auto;border:0;" /> --></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:46px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_2}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;table-layout:fixed;border-collapse:collapse;"><tr><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_1}}<!-- 발송 시 교체: <img src="{{image_1}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_1}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_1}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_1}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_1}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_2}}<!-- 발송 시 교체: <img src="{{image_2}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_2}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_2}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_2}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_2}}</a></td></tr></table></td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="176" valign="top" style="width:176px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_3}}<!-- 발송 시 교체: <img src="{{image_3}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="46" style="width:174px;height:46px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;">{{main_3}}</td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="54" style="width:174px;height:54px;padding:7px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">{{sub_3}}</td></tr>
                <tr><td class="fwc" width="174" style="width:174px;padding:10px 12px 14px 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" align="center" bgcolor="#0F218B" style="width:150px;background-color:#0F218B;border-radius:2px;"><a href="{{link_3}}" style="display:block;padding:11px 6px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{btn_3}}</a></td></tr></table></td></tr>
              </table></td></tr></table></td></tr><tr><td class="pad" style="padding:46px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_3}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" align="center" style="width:550px;padding:24px 20px 26px 20px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="510" style="width:510px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="510" align="center" style="width:510px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="510" style="width:510px;border-collapse:collapse;"><tr><td class="fwc" width="510" height="132" align="center" valign="middle" bgcolor="#FFFFFF" style="width:510px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_4}}<!-- 발송 시 교체: <img src="{{image_4}}" width="510" alt="" class="fluidimg" style="display:block;width:100%;max-width:510px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="510" align="center" style="width:510px;padding:16px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_4}}</td></tr>
              <tr><td class="fwc" width="510" align="center" style="width:510px;padding:8px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_4}}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr><tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#0F218B" style="width:300px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>
`,
  "edm-no14-winback": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.14 이탈방지(휴면고객) · 웰컴백 쿠폰혜택 안내</title>
<!-- 캠페인입력 NO.14 : 이탈방지(휴면고객) / 한국 콘텐츠 / 웰컴백 쿠폰혜택 안내 (SO +180일 & 미구매)
     히어로 텍스트만 · 배지 고정문구 WELCOME BACK COUPON · 수신자명 삽입 있음
     콘텐츠1 [B24] 쿠폰블록 버튼 없음 / 콘텐츠2 [B22] 이미지블록 버튼 없음 / 하단 CTA 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#EDF1F8" style="background-color:#EDF1F8;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
          <tr><td class="fwc hpad" width="600" valign="top" style="width:600px;box-sizing:border-box;padding:42px 32px 44px 32px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="536" style="width:536px;padding:0 0 18px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td style="box-sizing:border-box;border:1px solid #0F218B;padding:7px 13px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;color:#0F218B;">WELCOME BACK COUPON</td></tr></table>
              </td></tr>
              <tr><td class="fwc" width="536" style="width:536px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:26px;line-height:38px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;">{{customer_name}} 고객님,<br /><span style="border-bottom:4px solid #FFCC00;">{{copy_headline}}</span></td></tr>
              <tr><td class="fwc" width="536" style="width:536px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#5E6780;">{{copy_sub}}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:44px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_1}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" bgcolor="#EDF1F8" style="width:552px;background-color:#EDF1F8;border-collapse:collapse;">
          <tr><td class="fwc" width="552" align="center" style="width:552px;padding:22px 20px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="512" style="width:512px;table-layout:fixed;border-collapse:collapse;">
              <tr>
                <td class="col" width="280" bgcolor="#FFFFFF" valign="middle" align="center" style="width:280px;box-sizing:border-box;background-color:#FFFFFF;padding:34px 16px 36px 16px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="248" style="width:248px;table-layout:fixed;border-collapse:collapse;">
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:18px;line-height:22px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.4em;text-indent:0.4em;color:#9AA3BE;">COUPON</td></tr>
                    <tr><td align="center" style="padding:16px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:44px;line-height:50px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;word-break:break-all;overflow-wrap:anywhere;">{{coupon_value}}</td></tr>
                    <tr><td align="center" style="padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">최대 할인 금액 <span style="font-weight:bold;color:#111111;">{{coupon_max}}</span></td></tr>
                  </table>
                </td>
                <td class="gapcol" width="2" bgcolor="#0F218B" style="width:2px;background-color:#0F218B;background-image:repeating-linear-gradient(to bottom,#EDF1F8 0,#EDF1F8 6px,#0F218B 6px,#0F218B 12px);font-size:0;line-height:0;">&nbsp;</td>
                <td class="col" width="230" bgcolor="#0F218B" valign="middle" align="center" style="width:230px;box-sizing:border-box;background-color:#0F218B;padding:34px 16px 36px 16px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="190" style="width:190px;table-layout:fixed;border-collapse:collapse;">
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:22px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:-0.01em;color:#FFFFFF;">{{coupon_target}}</td></tr>
                    <tr><td align="center" style="padding:5px 0 16px 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;color:#C9CDDB;">※ {{coupon_note}}</td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:17px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#FFFFFF;">쿠폰번호</td></tr>
                    <tr><td align="center" style="padding:10px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:26px;line-height:32px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.04em;color:#FFCC00;word-break:break-all;overflow-wrap:anywhere;">{{coupon_code}}</td></tr>
                    <tr><td align="center" style="padding:12px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;color:#C9CDDB;">사용 기한 {{coupon_expiry}}</td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:44px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_2}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" height="240" align="center" valign="middle" bgcolor="#FFFFFF" style="width:552px;height:240px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_1}}<!-- 발송 시 교체: <img src="{{image_1}}" width="552" alt="" class="fluidimg" style="display:block;width:100%;max-width:552px;height:auto;border:0;" /> --></td></tr>
        </table>
      </td></tr><tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#0F218B" style="width:300px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>
`,
  "edm-no15e-product": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.15 상품계(상품 나열) · E품</title>
<!-- 캠페인입력 NO.15 : 상품계(상품 나열) / 한국 콘텐츠 / H품·V품·E품 제안 — E품 버전
     히어로 텍스트만 · 배지 RECOMMENDED FOR YOU · 수신자명 삽입 있음
     콘텐츠1 [B25] 3열 x 5행 (15개) 버튼 없음 / 하단 CTA 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .hgrid{text-align:left!important;}
    .hcell{width:50%!important;padding:0 4px 12px 4px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#000000" style="background-color:#000000;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
          <tr><td class="fwc hpad" width="600" valign="top" style="width:600px;box-sizing:border-box;padding:36px 32px 38px 32px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="536" style="width:536px;padding:0 0 16px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td style="box-sizing:border-box;border:1px solid #FFCC00;padding:6px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;color:#FFCC00;">RECOMMENDED FOR YOU</td></tr></table></td></tr>
              <tr><td class="fwc" width="536" style="width:536px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:27px;line-height:36px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;letter-spacing:-0.02em;">{{customer_name}} 고객님,<br />{{copy_headline}}</td></tr>
              <tr><td class="fwc" width="536" style="width:536px;padding:20px 0 0 0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;table-layout:fixed;border-collapse:collapse;"><tr><td width="3" bgcolor="#FFCC00" style="width:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td><td class="fwc" width="533" bgcolor="#2A2A2A" style="width:533px;box-sizing:border-box;background-color:#2A2A2A;padding:11px 16px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#FFFFFF;">{{copy_sub}}</td></tr></table></td></tr>
            </table>
          </td></tr>
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="fwc" width="400" height="5" bgcolor="#000000" style="width:400px;height:5px;background-color:#000000;font-size:0;line-height:0;">&nbsp;</td><td class="fwc" width="200" height="5" bgcolor="#FFCC00" style="width:200px;height:5px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:44px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;">
        <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;"><tr><![endif]-->
        <div class="hgrid" style="font-size:0;line-height:0;text-align:left;width:100%;max-width:552px;">
            <!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_1}}" style="color:#868686;text-decoration:none;">{{image_1}}</a><!-- 발송 시 교체: <img src="{{image_1}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_1}}" style="color:#868686;text-decoration:none;">{{brandName_1}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_1}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_1}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_1}}" style="color:#EA0000;text-decoration:none;">{{price_1}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_2}}" style="color:#868686;text-decoration:none;">{{image_2}}</a><!-- 발송 시 교체: <img src="{{image_2}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_2}}" style="color:#868686;text-decoration:none;">{{brandName_2}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_2}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_2}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_2}}" style="color:#EA0000;text-decoration:none;">{{price_2}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_3}}" style="color:#868686;text-decoration:none;">{{image_3}}</a><!-- 발송 시 교체: <img src="{{image_3}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_3}}" style="color:#868686;text-decoration:none;">{{brandName_3}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_3}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_3}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_3}}" style="color:#EA0000;text-decoration:none;">{{price_3}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_4}}" style="color:#868686;text-decoration:none;">{{image_4}}</a><!-- 발송 시 교체: <img src="{{image_4}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_4}}" style="color:#868686;text-decoration:none;">{{brandName_4}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_4}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_4}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_4}}" style="color:#EA0000;text-decoration:none;">{{price_4}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_5}}" style="color:#868686;text-decoration:none;">{{image_5}}</a><!-- 발송 시 교체: <img src="{{image_5}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_5}}" style="color:#868686;text-decoration:none;">{{brandName_5}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_5}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_5}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_5}}" style="color:#EA0000;text-decoration:none;">{{price_5}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_6}}" style="color:#868686;text-decoration:none;">{{image_6}}</a><!-- 발송 시 교체: <img src="{{image_6}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_6}}" style="color:#868686;text-decoration:none;">{{brandName_6}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_6}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_6}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_6}}" style="color:#EA0000;text-decoration:none;">{{price_6}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_7}}" style="color:#868686;text-decoration:none;">{{image_7}}</a><!-- 발송 시 교체: <img src="{{image_7}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_7}}" style="color:#868686;text-decoration:none;">{{brandName_7}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_7}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_7}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_7}}" style="color:#EA0000;text-decoration:none;">{{price_7}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_8}}" style="color:#868686;text-decoration:none;">{{image_8}}</a><!-- 발송 시 교체: <img src="{{image_8}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_8}}" style="color:#868686;text-decoration:none;">{{brandName_8}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_8}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_8}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_8}}" style="color:#EA0000;text-decoration:none;">{{price_8}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_9}}" style="color:#868686;text-decoration:none;">{{image_9}}</a><!-- 발송 시 교체: <img src="{{image_9}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_9}}" style="color:#868686;text-decoration:none;">{{brandName_9}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_9}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_9}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_9}}" style="color:#EA0000;text-decoration:none;">{{price_9}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_10}}" style="color:#868686;text-decoration:none;">{{image_10}}</a><!-- 발송 시 교체: <img src="{{image_10}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_10}}" style="color:#868686;text-decoration:none;">{{brandName_10}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_10}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_10}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_10}}" style="color:#EA0000;text-decoration:none;">{{price_10}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_11}}" style="color:#868686;text-decoration:none;">{{image_11}}</a><!-- 발송 시 교체: <img src="{{image_11}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_11}}" style="color:#868686;text-decoration:none;">{{brandName_11}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_11}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_11}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_11}}" style="color:#EA0000;text-decoration:none;">{{price_11}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_12}}" style="color:#868686;text-decoration:none;">{{image_12}}</a><!-- 발송 시 교체: <img src="{{image_12}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_12}}" style="color:#868686;text-decoration:none;">{{brandName_12}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_12}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_12}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_12}}" style="color:#EA0000;text-decoration:none;">{{price_12}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_13}}" style="color:#868686;text-decoration:none;">{{image_13}}</a><!-- 발송 시 교체: <img src="{{image_13}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_13}}" style="color:#868686;text-decoration:none;">{{brandName_13}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_13}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_13}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_13}}" style="color:#EA0000;text-decoration:none;">{{price_13}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_14}}" style="color:#868686;text-decoration:none;">{{image_14}}</a><!-- 발송 시 교체: <img src="{{image_14}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_14}}" style="color:#868686;text-decoration:none;">{{brandName_14}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_14}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_14}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_14}}" style="color:#EA0000;text-decoration:none;">{{price_14}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_15}}" style="color:#868686;text-decoration:none;">{{image_15}}</a><!-- 발송 시 교체: <img src="{{image_15}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_15}}" style="color:#868686;text-decoration:none;">{{brandName_15}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_15}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_15}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_15}}" style="color:#EA0000;text-decoration:none;">{{price_15}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]-->
        </div>
        <!--[if mso]></tr></table><![endif]-->
      </td></tr>
      <tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#FFCC00" style="width:300px;background-color:#FFCC00;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>
`,
  "edm-no15h-product": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.15 상품계(상품 나열) · H품</title>
<!-- 캠페인입력 NO.15 : 상품계(상품 나열) / 한국 콘텐츠 / H품·V품·E품 제안 — H품 버전
     히어로 텍스트만 · 배지 RECOMMENDED FOR YOU · 수신자명 삽입 있음
     콘텐츠1 [B25] 3열 x 5행 (15개) 버튼 없음 / 하단 CTA 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .hgrid{text-align:left!important;}
    .hcell{width:50%!important;padding:0 4px 12px 4px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#0F218B" style="background-color:#0F218B;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
          <tr><td class="fwc hpad" width="600" valign="top" style="width:600px;box-sizing:border-box;padding:40px 32px 42px 32px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="536" style="width:536px;padding:0 0 16px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td style="box-sizing:border-box;border:1px solid #FFFFFF;padding:6px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;color:#FFFFFF;">RECOMMENDED FOR YOU</td></tr></table></td></tr>
              <tr><td class="fwc" width="536" style="width:536px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:26px;line-height:37px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;letter-spacing:-0.02em;">{{customer_name}} 고객님,<br />{{copy_headline}}</td></tr>
              <tr><td class="fwc" width="536" style="width:536px;padding:18px 0 0 0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;table-layout:fixed;border-collapse:collapse;"><tr><td width="3" bgcolor="#FFFFFF" style="width:3px;background-color:#FFFFFF;font-size:0;line-height:0;">&nbsp;</td><td class="fwc" width="533" bgcolor="#1B2F9E" style="width:533px;box-sizing:border-box;background-color:#1B2F9E;padding:11px 16px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#FFFFFF;">{{copy_sub}}</td></tr></table></td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:44px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;">
        <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;"><tr><![endif]-->
        <div class="hgrid" style="font-size:0;line-height:0;text-align:left;width:100%;max-width:552px;">
            <!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td align="center" style="padding:12px 12px 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:100%;border-collapse:collapse;"><tr><td class="imgcell" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_1}}" style="color:#868686;text-decoration:none;">{{image_1}}</a><!-- 발송 시 교체: <img src="{{image_1}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td align="center" valign="top" height="52" style="height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_1}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_1}}</a></td></tr>
                <tr><td align="center" valign="top" height="34" style="height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_1}}" style="color:#EA0000;text-decoration:none;">{{price_1}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td align="center" style="padding:12px 12px 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:100%;border-collapse:collapse;"><tr><td class="imgcell" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_2}}" style="color:#868686;text-decoration:none;">{{image_2}}</a><!-- 발송 시 교체: <img src="{{image_2}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td align="center" valign="top" height="52" style="height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_2}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_2}}</a></td></tr>
                <tr><td align="center" valign="top" height="34" style="height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_2}}" style="color:#EA0000;text-decoration:none;">{{price_2}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td align="center" style="padding:12px 12px 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:100%;border-collapse:collapse;"><tr><td class="imgcell" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_3}}" style="color:#868686;text-decoration:none;">{{image_3}}</a><!-- 발송 시 교체: <img src="{{image_3}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td align="center" valign="top" height="52" style="height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_3}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_3}}</a></td></tr>
                <tr><td align="center" valign="top" height="34" style="height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_3}}" style="color:#EA0000;text-decoration:none;">{{price_3}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td align="center" style="padding:12px 12px 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:100%;border-collapse:collapse;"><tr><td class="imgcell" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_4}}" style="color:#868686;text-decoration:none;">{{image_4}}</a><!-- 발송 시 교체: <img src="{{image_4}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td align="center" valign="top" height="52" style="height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_4}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_4}}</a></td></tr>
                <tr><td align="center" valign="top" height="34" style="height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_4}}" style="color:#EA0000;text-decoration:none;">{{price_4}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td align="center" style="padding:12px 12px 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:100%;border-collapse:collapse;"><tr><td class="imgcell" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_5}}" style="color:#868686;text-decoration:none;">{{image_5}}</a><!-- 발송 시 교체: <img src="{{image_5}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td align="center" valign="top" height="52" style="height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_5}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_5}}</a></td></tr>
                <tr><td align="center" valign="top" height="34" style="height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_5}}" style="color:#EA0000;text-decoration:none;">{{price_5}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td align="center" style="padding:12px 12px 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:100%;border-collapse:collapse;"><tr><td class="imgcell" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_6}}" style="color:#868686;text-decoration:none;">{{image_6}}</a><!-- 발송 시 교체: <img src="{{image_6}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td align="center" valign="top" height="52" style="height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_6}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_6}}</a></td></tr>
                <tr><td align="center" valign="top" height="34" style="height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_6}}" style="color:#EA0000;text-decoration:none;">{{price_6}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td align="center" style="padding:12px 12px 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:100%;border-collapse:collapse;"><tr><td class="imgcell" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_7}}" style="color:#868686;text-decoration:none;">{{image_7}}</a><!-- 발송 시 교체: <img src="{{image_7}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td align="center" valign="top" height="52" style="height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_7}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_7}}</a></td></tr>
                <tr><td align="center" valign="top" height="34" style="height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_7}}" style="color:#EA0000;text-decoration:none;">{{price_7}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td align="center" style="padding:12px 12px 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:100%;border-collapse:collapse;"><tr><td class="imgcell" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_8}}" style="color:#868686;text-decoration:none;">{{image_8}}</a><!-- 발송 시 교체: <img src="{{image_8}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td align="center" valign="top" height="52" style="height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_8}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_8}}</a></td></tr>
                <tr><td align="center" valign="top" height="34" style="height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_8}}" style="color:#EA0000;text-decoration:none;">{{price_8}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td align="center" style="padding:12px 12px 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:100%;border-collapse:collapse;"><tr><td class="imgcell" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_9}}" style="color:#868686;text-decoration:none;">{{image_9}}</a><!-- 발송 시 교체: <img src="{{image_9}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td align="center" valign="top" height="52" style="height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_9}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_9}}</a></td></tr>
                <tr><td align="center" valign="top" height="34" style="height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_9}}" style="color:#EA0000;text-decoration:none;">{{price_9}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td align="center" style="padding:12px 12px 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:100%;border-collapse:collapse;"><tr><td class="imgcell" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_10}}" style="color:#868686;text-decoration:none;">{{image_10}}</a><!-- 발송 시 교체: <img src="{{image_10}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td align="center" valign="top" height="52" style="height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_10}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_10}}</a></td></tr>
                <tr><td align="center" valign="top" height="34" style="height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_10}}" style="color:#EA0000;text-decoration:none;">{{price_10}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td align="center" style="padding:12px 12px 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:100%;border-collapse:collapse;"><tr><td class="imgcell" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_11}}" style="color:#868686;text-decoration:none;">{{image_11}}</a><!-- 발송 시 교체: <img src="{{image_11}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td align="center" valign="top" height="52" style="height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_11}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_11}}</a></td></tr>
                <tr><td align="center" valign="top" height="34" style="height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_11}}" style="color:#EA0000;text-decoration:none;">{{price_11}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td align="center" style="padding:12px 12px 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:100%;border-collapse:collapse;"><tr><td class="imgcell" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_12}}" style="color:#868686;text-decoration:none;">{{image_12}}</a><!-- 발송 시 교체: <img src="{{image_12}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td align="center" valign="top" height="52" style="height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_12}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_12}}</a></td></tr>
                <tr><td align="center" valign="top" height="34" style="height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_12}}" style="color:#EA0000;text-decoration:none;">{{price_12}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td align="center" style="padding:12px 12px 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:100%;border-collapse:collapse;"><tr><td class="imgcell" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_13}}" style="color:#868686;text-decoration:none;">{{image_13}}</a><!-- 발송 시 교체: <img src="{{image_13}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td align="center" valign="top" height="52" style="height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_13}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_13}}</a></td></tr>
                <tr><td align="center" valign="top" height="34" style="height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_13}}" style="color:#EA0000;text-decoration:none;">{{price_13}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td align="center" style="padding:12px 12px 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:100%;border-collapse:collapse;"><tr><td class="imgcell" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_14}}" style="color:#868686;text-decoration:none;">{{image_14}}</a><!-- 발송 시 교체: <img src="{{image_14}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td align="center" valign="top" height="52" style="height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_14}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_14}}</a></td></tr>
                <tr><td align="center" valign="top" height="34" style="height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_14}}" style="color:#EA0000;text-decoration:none;">{{price_14}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td align="center" style="padding:12px 12px 0 12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:100%;border-collapse:collapse;"><tr><td class="imgcell" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_15}}" style="color:#868686;text-decoration:none;">{{image_15}}</a><!-- 발송 시 교체: <img src="{{image_15}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td align="center" valign="top" height="52" style="height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_15}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_15}}</a></td></tr>
                <tr><td align="center" valign="top" height="34" style="height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_15}}" style="color:#EA0000;text-decoration:none;">{{price_15}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]-->
        </div>
        <!--[if mso]></tr></table><![endif]-->
      </td></tr>
      <tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#0F218B" style="width:300px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>
`,
  "edm-no15v-product": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.15 상품계(상품 나열) · V품</title>
<!-- 캠페인입력 NO.15 : 상품계(상품 나열) / 한국 콘텐츠 / H품·V품·E품 제안 — V품 버전
     히어로 텍스트만 · 배지 RECOMMENDED FOR YOU · 수신자명 삽입 있음
     콘텐츠1 [B25] 3열 x 5행 (15개) 버튼 없음 / 하단 CTA 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .hgrid{text-align:left!important;}
    .hcell{width:50%!important;padding:0 4px 12px 4px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
          <tr><td class="fwc hpad" width="600" valign="top" style="width:600px;box-sizing:border-box;padding:40px 32px 42px 32px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="536" style="width:536px;padding:0 0 16px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td style="box-sizing:border-box;border:1px solid #0F218B;padding:6px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;color:#0F218B;">RECOMMENDED FOR YOU</td></tr></table></td></tr>
              <tr><td class="fwc" width="536" style="width:536px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:26px;line-height:37px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;">{{customer_name}} 고객님,<br />{{copy_headline}}</td></tr>
              <tr><td class="fwc" width="536" style="width:536px;padding:18px 0 0 0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;table-layout:fixed;border-collapse:collapse;"><tr><td width="3" bgcolor="#0F218B" style="width:3px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td><td class="fwc" width="533" bgcolor="#EDF1F8" style="width:533px;box-sizing:border-box;background-color:#EDF1F8;padding:11px 16px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#0F218B;">{{copy_sub}}</td></tr></table></td></tr>
            </table>
          </td></tr>
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="fwc" width="240" height="4" bgcolor="#0F218B" style="width:240px;height:4px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td><td class="fwc" width="360" height="4" bgcolor="#EEEEEE" style="width:360px;height:4px;background-color:#EEEEEE;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:44px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;">
        <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;"><tr><![endif]-->
        <div class="hgrid" style="font-size:0;line-height:0;text-align:left;width:100%;max-width:552px;">
            <!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_1}}" style="color:#868686;text-decoration:none;">{{image_1}}</a><!-- 발송 시 교체: <img src="{{image_1}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_1}}" style="color:#868686;text-decoration:none;">{{brandName_1}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_1}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_1}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_1}}" style="color:#EA0000;text-decoration:none;">{{price_1}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_2}}" style="color:#868686;text-decoration:none;">{{image_2}}</a><!-- 발송 시 교체: <img src="{{image_2}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_2}}" style="color:#868686;text-decoration:none;">{{brandName_2}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_2}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_2}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_2}}" style="color:#EA0000;text-decoration:none;">{{price_2}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_3}}" style="color:#868686;text-decoration:none;">{{image_3}}</a><!-- 발송 시 교체: <img src="{{image_3}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_3}}" style="color:#868686;text-decoration:none;">{{brandName_3}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_3}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_3}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_3}}" style="color:#EA0000;text-decoration:none;">{{price_3}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_4}}" style="color:#868686;text-decoration:none;">{{image_4}}</a><!-- 발송 시 교체: <img src="{{image_4}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_4}}" style="color:#868686;text-decoration:none;">{{brandName_4}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_4}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_4}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_4}}" style="color:#EA0000;text-decoration:none;">{{price_4}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_5}}" style="color:#868686;text-decoration:none;">{{image_5}}</a><!-- 발송 시 교체: <img src="{{image_5}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_5}}" style="color:#868686;text-decoration:none;">{{brandName_5}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_5}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_5}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_5}}" style="color:#EA0000;text-decoration:none;">{{price_5}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_6}}" style="color:#868686;text-decoration:none;">{{image_6}}</a><!-- 발송 시 교체: <img src="{{image_6}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_6}}" style="color:#868686;text-decoration:none;">{{brandName_6}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_6}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_6}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_6}}" style="color:#EA0000;text-decoration:none;">{{price_6}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_7}}" style="color:#868686;text-decoration:none;">{{image_7}}</a><!-- 발송 시 교체: <img src="{{image_7}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_7}}" style="color:#868686;text-decoration:none;">{{brandName_7}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_7}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_7}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_7}}" style="color:#EA0000;text-decoration:none;">{{price_7}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_8}}" style="color:#868686;text-decoration:none;">{{image_8}}</a><!-- 발송 시 교체: <img src="{{image_8}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_8}}" style="color:#868686;text-decoration:none;">{{brandName_8}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_8}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_8}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_8}}" style="color:#EA0000;text-decoration:none;">{{price_8}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_9}}" style="color:#868686;text-decoration:none;">{{image_9}}</a><!-- 발송 시 교체: <img src="{{image_9}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_9}}" style="color:#868686;text-decoration:none;">{{brandName_9}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_9}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_9}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_9}}" style="color:#EA0000;text-decoration:none;">{{price_9}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_10}}" style="color:#868686;text-decoration:none;">{{image_10}}</a><!-- 발송 시 교체: <img src="{{image_10}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_10}}" style="color:#868686;text-decoration:none;">{{brandName_10}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_10}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_10}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_10}}" style="color:#EA0000;text-decoration:none;">{{price_10}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_11}}" style="color:#868686;text-decoration:none;">{{image_11}}</a><!-- 발송 시 교체: <img src="{{image_11}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_11}}" style="color:#868686;text-decoration:none;">{{brandName_11}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_11}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_11}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_11}}" style="color:#EA0000;text-decoration:none;">{{price_11}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_12}}" style="color:#868686;text-decoration:none;">{{image_12}}</a><!-- 발송 시 교체: <img src="{{image_12}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_12}}" style="color:#868686;text-decoration:none;">{{brandName_12}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_12}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_12}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_12}}" style="color:#EA0000;text-decoration:none;">{{price_12}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_13}}" style="color:#868686;text-decoration:none;">{{image_13}}</a><!-- 발송 시 교체: <img src="{{image_13}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_13}}" style="color:#868686;text-decoration:none;">{{brandName_13}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_13}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_13}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_13}}" style="color:#EA0000;text-decoration:none;">{{price_13}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_14}}" style="color:#868686;text-decoration:none;">{{image_14}}</a><!-- 발송 시 교체: <img src="{{image_14}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_14}}" style="color:#868686;text-decoration:none;">{{brandName_14}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_14}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_14}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_14}}" style="color:#EA0000;text-decoration:none;">{{price_14}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]--><!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->
            <div class="hcell" style="display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="176" style="width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="174" align="center" style="width:174px;padding:12px 12px 0 12px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="150" style="width:150px;border-collapse:collapse;"><tr><td class="fwc" width="150" height="96" align="center" valign="middle" bgcolor="#FFFFFF" style="width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;"><a href="{{link_15}}" style="color:#868686;text-decoration:none;">{{image_15}}</a><!-- 발송 시 교체: <img src="{{image_15}}" width="150" alt="" class="fluidimg" style="display:block;width:100%;max-width:150px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="27" style="width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;"><a href="{{link_15}}" style="color:#868686;text-decoration:none;">{{brandName_15}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="52" style="width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;"><a href="{{link_15}}" style="color:#025FAE;text-decoration:underline;">{{seriesName_15}}</a></td></tr>
                <tr><td class="fwc" width="174" align="center" valign="top" height="34" style="width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;"><a href="{{link_15}}" style="color:#EA0000;text-decoration:none;">{{price_15}}</a></td></tr>
              </table></div>
            <!--[if mso]></td><![endif]-->
        </div>
        <!--[if mso]></tr></table><![endif]-->
      </td></tr>
      <tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#0F218B" style="width:300px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>
`,
  "edm-no16-coupon": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.16 상품계(쿠폰) · 쿠폰 안내</title>
<!-- 캠페인입력 NO.16 : 상품계(쿠폰) / 한국 콘텐츠 / 쿠폰 안내 (형번 생성 +3일)
     히어로 텍스트만 · 배지 COUPON FOR YOU · 수신자명 삽입 있음
     콘텐츠1 [B08] 안내 텍스트 / 콘텐츠2 [B24] 쿠폰블록 / 하단 CTA 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
          <tr><td class="fwc hpad" width="600" valign="top" style="width:600px;box-sizing:border-box;padding:40px 32px 40px 32px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="536" style="width:536px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;color:#0F218B;">COUPON FOR YOU</td></tr>
              <tr><td class="fwc" width="536" style="width:536px;padding:16px 0 0 0;">
                <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;border-collapse:collapse;">
                  <tr>
                    <td valign="bottom" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:70px;line-height:66px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;letter-spacing:-0.05em;white-space:nowrap;">{{rate}}<span style="font-size:38px;line-height:40px;letter-spacing:-0.02em;"> 할인</span></td>
                  </tr>
                </table>
              </td></tr>
              <tr><td class="fwc" width="536" style="width:536px;padding:12px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:22px;line-height:32px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;letter-spacing:-0.02em;">{{copy_headline}}</td></tr>
              <tr><td class="fwc" width="536" style="width:536px;padding:12px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;">{{customer_name}} 고객님, {{copy_sub}}</td></tr>
            </table>
          </td></tr>
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="fwc" width="240" height="5" bgcolor="#FFCC00" style="width:240px;height:5px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td><td class="fwc" width="360" height="5" bgcolor="#EEEEEE" style="width:360px;height:5px;background-color:#EEEEEE;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:44px 24px 0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" align="center" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:20px;line-height:31px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_1}}</td></tr>
          <tr><td class="fwc" width="552" align="center" style="width:552px;padding:12px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:22px;mso-line-height-rule:exactly;color:#868686;">{{sub_1}}</td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:46px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" bgcolor="#EDF1F8" style="width:552px;background-color:#EDF1F8;border-collapse:collapse;">
          <tr><td class="fwc" width="552" align="center" style="width:552px;padding:22px 20px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="512" style="width:512px;table-layout:fixed;border-collapse:collapse;">
              <tr>
                <td class="col" width="280" bgcolor="#FFFFFF" valign="middle" align="center" style="width:280px;box-sizing:border-box;background-color:#FFFFFF;padding:34px 16px 36px 16px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="248" style="width:248px;table-layout:fixed;border-collapse:collapse;">
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:18px;line-height:22px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.4em;text-indent:0.4em;color:#9AA3BE;">COUPON</td></tr>
                    <tr><td align="center" style="padding:16px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:44px;line-height:50px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;word-break:break-all;overflow-wrap:anywhere;">{{coupon_value}}</td></tr>
                    <tr><td align="center" style="padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;">최대 할인 금액 <span style="font-weight:bold;color:#111111;">{{coupon_max}}</span></td></tr>
                  </table>
                </td>
                <td class="gapcol" width="2" bgcolor="#0F218B" style="width:2px;background-color:#0F218B;background-image:repeating-linear-gradient(to bottom,#EDF1F8 0,#EDF1F8 6px,#0F218B 6px,#0F218B 12px);font-size:0;line-height:0;">&nbsp;</td>
                <td class="col" width="230" bgcolor="#0F218B" valign="middle" align="center" style="width:230px;box-sizing:border-box;background-color:#0F218B;padding:34px 16px 36px 16px;">
                  <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="190" style="width:190px;table-layout:fixed;border-collapse:collapse;">
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:22px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:-0.01em;color:#FFFFFF;">{{coupon_target}}</td></tr>
                    <tr><td align="center" style="padding:5px 0 16px 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;color:#C9CDDB;">※ {{coupon_note}}</td></tr>
                    <tr><td align="center" style="font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:17px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#FFFFFF;">쿠폰번호</td></tr>
                    <tr><td align="center" style="padding:10px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:26px;line-height:32px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.04em;color:#FFCC00;word-break:break-all;overflow-wrap:anywhere;">{{coupon_code}}</td></tr>
                    <tr><td align="center" style="padding:12px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;color:#C9CDDB;">사용 기한 {{coupon_expiry}}</td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#0F218B" style="width:300px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>
`,
  "edm-no17-inside-sales": `<!DOCTYPE html>
<html lang="ko" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>캠페인 NO.17 상품계(내근) · 내근 영업 안내</title>
<!-- 캠페인입력 NO.17 : 상품계(내근) / 한국 콘텐츠 / 내근 영업 이용 방법 2가지, 이용 장점 3가지
     히어로 텍스트만 · 배지 고정문구 TALK TO OUR SPECIALIST · 수신자명 삽입 있음
     콘텐츠1 [B26] 2칸 (이용 방법) 버튼 없음 / 콘텐츠2 [B28] 3단 스택 (이용 장점) / 하단 CTA 버튼 1개 -->
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}
  a{color:#025FAE;}
  @media only screen and (max-width:599px){
    .w600{width:100%!important;max-width:100%!important;}
    .fw{width:100%!important;max-width:100%!important;}
    .fwc{width:auto!important;}
    .stripeA{width:72%!important;}
    .stripeB{width:28%!important;}
    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}
    .pad{padding-left:16px!important;padding-right:16px!important;}
    .hpad{padding:30px 18px 32px 18px!important;}
    .fluidimg{width:100%!important;height:auto!important;}
    img{max-width:100%;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F4;">
<span style="display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;">{{preheader}}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F4F4F4;"><tr><td align="center" style="padding:0;">
  <table role="presentation" class="w600" cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#FFFFFF" style="width:600px;background-color:#FFFFFF;">

      <tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:0;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;">
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="fwc" width="600" height="3" bgcolor="#0F218B" style="width:600px;height:3px;background-color:#0F218B;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
          <tr><td class="fwc hpad" width="600" valign="top" style="width:600px;box-sizing:border-box;padding:40px 32px 44px 32px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="536" style="width:536px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="536" style="width:536px;padding:0 0 22px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td bgcolor="#E8EBF5" style="background-color:#E8EBF5;padding:9px 16px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;color:#0F218B;">TALK TO OUR SPECIALIST</td></tr></table>
              </td></tr>
              <tr><td class="fwc" width="536" style="width:536px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:24px;line-height:35px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;letter-spacing:-0.02em;">{{customer_name}} 고객님,<br />{{copy_headline}}</td></tr>
              <tr><td class="fwc" width="536" style="width:536px;padding:16px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;">{{copy_sub}}</td></tr>
            </table>
          </td></tr>
          <tr><td class="fwc" width="600" style="width:600px;font-size:0;line-height:0;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;table-layout:fixed;border-collapse:collapse;"><tr><td class="fwc" width="600" height="1" bgcolor="#EEEEEE" style="width:600px;height:1px;background-color:#EEEEEE;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr><tr><td class="pad" style="padding:44px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_1}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;table-layout:fixed;border-collapse:collapse;">
          <tr><td class="col" width="270" valign="top" style="width:270px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="270" style="width:270px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="268" align="center" style="width:268px;padding:16px 16px 0 16px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="236" style="width:236px;border-collapse:collapse;"><tr><td class="fwc" width="236" height="130" align="center" valign="middle" bgcolor="#FFFFFF" style="width:236px;height:130px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_1}}<!-- 발송 시 교체: <img src="{{image_1}}" width="236" alt="" class="fluidimg" style="display:block;width:100%;max-width:236px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="268" align="center" valign="top" height="50" style="width:268px;height:50px;padding:16px 16px 0 16px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_1}}</td></tr>
                <tr><td class="fwc" width="268" align="center" valign="top" height="62" style="width:268px;height:62px;padding:8px 16px 18px 16px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_1}}</td></tr>
              </table></td><td class="gapcol" width="12" style="width:12px;font-size:0;line-height:0;">&nbsp;</td><td class="col" width="270" valign="top" style="width:270px;">
              <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="270" style="width:270px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
                <tr><td class="fwc" width="268" align="center" style="width:268px;padding:16px 16px 0 16px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="236" style="width:236px;border-collapse:collapse;"><tr><td class="fwc" width="236" height="130" align="center" valign="middle" bgcolor="#FFFFFF" style="width:236px;height:130px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_2}}<!-- 발송 시 교체: <img src="{{image_2}}" width="236" alt="" class="fluidimg" style="display:block;width:100%;max-width:236px;height:auto;border:0;" /> --></td></tr></table></td></tr>
                <tr><td class="fwc" width="268" align="center" valign="top" height="50" style="width:268px;height:50px;padding:16px 16px 0 16px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_2}}</td></tr>
                <tr><td class="fwc" width="268" align="center" valign="top" height="62" style="width:268px;height:62px;padding:8px 16px 18px 16px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_2}}</td></tr>
              </table></td></tr>
        </table></td></tr>
      <tr><td class="pad" style="padding:46px 24px 18px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;">
          <tr><td class="fwc" width="552" style="width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{c_headline_2}}</td></tr>
          <tr><td class="fwc" width="552" style="width:552px;padding:10px 0 0 0;font-size:0;line-height:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="40" style="width:40px;border-collapse:collapse;"><tr><td width="40" height="3" bgcolor="#FFCC00" style="width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" style="padding:0 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" align="center" style="width:550px;padding:20px 20px 22px 20px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="510" style="width:510px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="510" align="center" style="width:510px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="510" style="width:510px;border-collapse:collapse;"><tr><td class="fwc" width="510" height="180" align="center" valign="middle" bgcolor="#FFFFFF" style="width:510px;height:180px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_3}}<!-- 발송 시 교체: <img src="{{image_3}}" width="510" alt="" class="fluidimg" style="display:block;width:100%;max-width:510px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="510" align="center" style="width:510px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_3}}</td></tr>
              <tr><td class="fwc" width="510" align="center" style="width:510px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_3}}</td></tr>
            </table>
          </td></tr>
        </table>
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;"><tr><td class="fwc" width="552" height="12" style="width:552px;height:12px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" align="center" style="width:550px;padding:20px 20px 22px 20px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="510" style="width:510px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="510" align="center" style="width:510px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="510" style="width:510px;border-collapse:collapse;"><tr><td class="fwc" width="510" height="180" align="center" valign="middle" bgcolor="#FFFFFF" style="width:510px;height:180px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_4}}<!-- 발송 시 교체: <img src="{{image_4}}" width="510" alt="" class="fluidimg" style="display:block;width:100%;max-width:510px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="510" align="center" style="width:510px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_4}}</td></tr>
              <tr><td class="fwc" width="510" align="center" style="width:510px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_4}}</td></tr>
            </table>
          </td></tr>
        </table>
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;border-collapse:collapse;"><tr><td class="fwc" width="552" height="12" style="width:552px;height:12px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="552" style="width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;">
          <tr><td class="fwc" width="550" align="center" style="width:550px;padding:20px 20px 22px 20px;">
            <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="510" style="width:510px;table-layout:fixed;border-collapse:collapse;">
              <tr><td class="fwc" width="510" align="center" style="width:510px;"><table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="510" style="width:510px;border-collapse:collapse;"><tr><td class="fwc" width="510" height="180" align="center" valign="middle" bgcolor="#FFFFFF" style="width:510px;height:180px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;">{{image_5}}<!-- 발송 시 교체: <img src="{{image_5}}" width="510" alt="" class="fluidimg" style="display:block;width:100%;max-width:510px;height:auto;border:0;" /> --></td></tr></table></td></tr>
              <tr><td class="fwc" width="510" align="center" style="width:510px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;">{{main_5}}</td></tr>
              <tr><td class="fwc" width="510" align="center" style="width:510px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;">{{sub_5}}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td class="pad" align="center" style="padding:44px 24px 44px 24px;">
        <table class="fw" role="presentation" cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px;border-collapse:collapse;"><tr><td class="fwc" width="300" align="center" bgcolor="#0F218B" style="width:300px;background-color:#0F218B;border-radius:2px;"><a href="{{cta_url}}" style="display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;">{{cta_label}}</a></td></tr></table>
      </td></tr>
  </table>
</td></tr></table>
</body>
</html>
`,
};
