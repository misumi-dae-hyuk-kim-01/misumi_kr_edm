"""
fn-render-mock
--------------
MJML 없이 Python만으로 HTML을 조립해서 S3에 저장하는 Mock 버전
Jinja2도 불필요 — 순수 Python f-string으로 처리

환경변수
  S3_BUCKET   : kor-ecmkt-storage
  S3_PREFIX   : edm/
  BASE_URL    : https://kor-smartlp.s3.ap-northeast-1.amazonaws.com/edm
  SQS_QA_URL  : fn-qa 로 보낼 SQS URL (테스트 시 비워두기)
"""

import json
import os
import re
import boto3

S3_BUCKET  = os.environ.get("S3_BUCKET",  "kor-smartlp ")
S3_PREFIX  = os.environ.get("S3_PREFIX",  "edm/")
BASE_URL   = os.environ.get("BASE_URL",
    f"https://kor-smartlp.s3.ap-northeast-1.amazonaws.com/edm")
SQS_QA_URL = os.environ.get("SQS_QA_URL", "")

s3  = boto3.client("s3",  region_name="ap-northeast-2")
sqs = boto3.client("sqs", region_name="ap-northeast-2")


# ── HTML 조립 ─────────────────────────────────────────────────────────────────
def build_html(d: dict) -> str:
    """
    d 딕셔너리의 변수를 받아 완성된 이메일 HTML 반환
    실제 환경에서는 이 부분이 MJML 컴파일로 교체됨
    """

    coupon_block = ""
    if d.get("coupon_code"):
        coupon_block = f"""
        <!-- 쿠폰 블록 -->
        <tr>
          <td style="background:#fff9e6;padding:24px 40px;text-align:center;
                     border-top:1px solid #ffe082;">
            <p style="margin:0 0 6px;font-size:13px;color:#666666;">
              {d.get('coupon_label','Your Coupon Code')}
            </p>
            <p style="margin:0 0 8px;font-size:28px;font-weight:bold;
                      color:#cc0000;letter-spacing:3px;
                      border:2px solid #cc0000;display:inline-block;
                      padding:10px 24px;border-radius:4px;">
              {d['coupon_code']}
            </p>
            <p style="margin:6px 0 16px;font-size:11px;color:#999999;">
              ※ {d.get('coupon_note','')}
            </p>
            <a href="{d.get('cta_url','#')}"
               style="background:#ff6600;color:#ffffff;text-decoration:none;
                      font-size:14px;font-weight:bold;padding:14px 32px;
                      border-radius:4px;display:inline-block;">
              {d.get('cta_text','지금 시작하기')}
            </a>
          </td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>{d.get('email_subject','MiSUMi')}</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background:#eeeeee;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background:#eeeeee;">
  <tr>
    <td align="center" style="padding:20px 0;">

      <!-- 메인 컨테이너 -->
      <table width="600" cellpadding="0" cellspacing="0" border="0"
             style="background:#ffffff;border-radius:4px;overflow:hidden;">

        <!-- 헤더 -->
        <tr>
          <td style="background:#003087;padding:14px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="color:#ffffff;font-size:20px;font-weight:bold;
                           letter-spacing:1px;">
                  MiSUMi
                  <span style="font-size:11px;font-weight:normal;
                               margin-left:6px;opacity:0.7;">
                    South East Asia
                  </span>
                </td>
                <td align="right" style="font-size:11px;">
                  <a href="#" style="color:#aabbcc;text-decoration:none;">
                    View in browser
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- 히어로 배너 -->
        <tr>
          <td style="padding:0;">
            <img src="{d.get('banner_image_url', BASE_URL+'/assets/hero_default.jpg')}"
                 width="600" alt="{d.get('banner_alt','MiSUMi')}"
                 style="display:block;width:100%;max-width:600px;" />
          </td>
        </tr>

        <!-- 본문 -->
        <tr>
          <td style="padding:28px 40px 8px;">
            <h2 style="margin:0 0 12px;font-size:22px;color:#003087;
                       line-height:1.4;">
              {d.get('body_headline','')}
            </h2>
            <p style="margin:0;font-size:14px;color:#444444;line-height:1.7;">
              {d.get('body_copy','').replace(chr(10),'<br>')}
            </p>
          </td>
        </tr>

        {coupon_block}

        <!-- 파트너 로고 -->
        <tr>
          <td style="background:#f5f5f5;padding:16px 40px;text-align:center;
                     border-top:1px solid #e0e0e0;">
            <p style="margin:0 0 8px;font-size:11px;color:#999999;">
              Our Partner Brands
            </p>
            <img src="{BASE_URL}/assets/partner_logos.png"
                 width="520" alt="Partner Brands"
                 style="display:block;margin:0 auto;max-width:100%;" />
          </td>
        </tr>

        <!-- 푸터 -->
        <tr>
          <td style="background:#003087;padding:18px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#aabbcc;line-height:1.7;">
              MiSUMi South East Asia &nbsp;|&nbsp;
              <a href="#" style="color:#aabbcc;text-decoration:none;">
                Privacy Policy
              </a>
              &nbsp;|&nbsp;
              <a href="{d.get('unsubscribe_url','#')}"
                 style="color:#aabbcc;text-decoration:none;">
                Unsubscribe
              </a>
              <br>
              © 2025 MISUMI Corporation. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
      <!-- /메인 컨테이너 -->

    </td>
  </tr>
</table>

</body>
</html>"""


# ── S3 저장 ───────────────────────────────────────────────────────────────────
def save_to_s3(html: str, campaign_id: str, segment_name: str) -> str:
    safe  = re.sub(r"[^a-zA-Z0-9가-힣_-]", "_", segment_name)
    key   = f"{S3_PREFIX}output/{campaign_id}/{safe}.html"
    s3.put_object(
        Bucket      = S3_BUCKET,
        Key         = key,
        Body        = html.encode("utf-8"),
        ContentType = "text/html; charset=utf-8",
    )
    url = f"https://{S3_BUCKET}.s3.ap-northeast-2.amazonaws.com/{key}"
    print(f"[fn-render-mock] S3 저장: {url}")
    return url


# ── 메인 핸들러 ───────────────────────────────────────────────────────────────
def lambda_handler(event, context):

    if "Records" in event:
        body = json.loads(event["Records"][0]["body"])
    else:
        body = event

    campaign_id = body.get("campaign_id", "test-001")
    results     = body.get("results", [])
    output_urls = []

    for item in results:
        segment = item["segment"]
        brief   = item["brief"]
        copy    = item["copy"]

        # 템플릿 변수 조합
        data = {
            "email_subject":   copy.get("subject_a", "MiSUMi"),
            "preheader":       copy.get("preheader",  ""),
            "banner_image_url": brief.get("banner_image_url",
                                 f"{BASE_URL}/assets/hero_default.jpg"),
            "banner_alt":      copy.get("banner_alt",      "MiSUMi"),
            "body_headline":   copy.get("body_headline",   ""),
            "body_copy":       copy.get("body_copy",       ""),
            "coupon_code":     brief.get("coupon_code",    ""),
            "coupon_label":    copy.get("coupon_label",    "Your Coupon Code"),
            "coupon_note":     copy.get("coupon_note",     ""),
            "cta_text":        copy.get("cta_text",        "지금 시작하기"),
            "cta_url":         brief.get("landing_url",    "https://sea.misumi-ec.com"),
            "unsubscribe_url": brief.get("unsubscribe_url","#"),
        }

        html = build_html(data)
        url  = save_to_s3(html, campaign_id, segment)
        output_urls.append({"segment": segment, "url": url})

    qa_payload = {"campaign_id": campaign_id, "output_urls": output_urls}

    if SQS_QA_URL:
        sqs.send_message(
            QueueUrl    = SQS_QA_URL,
            MessageBody = json.dumps(qa_payload, ensure_ascii=False)
        )
        print(f"[fn-render-mock] fn-qa SQS 전달 완료")
    else:
        return {"statusCode": 200, "body": qa_payload}

    return {"statusCode": 200, "body": "render complete"}