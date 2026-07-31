"""
fn-qa
-----
역할  : S3에 저장된 HTML을 꺼내 자동 QA 후 Slack으로 결과 전달
트리거: SQS (fn-render 출력)

환경변수
  S3_BUCKET       : kor-smartlp
  SLACK_WEBHOOK   : Slack Incoming Webhook URL
  APPROVE_API_URL : fn-publish 를 트리거할 API Gateway URL (승인 버튼용)
"""

import json
import os
import re
import urllib.request
import urllib.error
import boto3

S3_BUCKET       = os.environ.get("S3_BUCKET",       "kor-smartlp")
SLACK_WEBHOOK   = os.environ.get("SLACK_WEBHOOK",   "")
APPROVE_API_URL = os.environ.get("APPROVE_API_URL", "")

s3 = boto3.client("s3", region_name="ap-northeast-2")


# ── HTML 가져오기 ─────────────────────────────────────────────────────────────
def fetch_html_from_s3(url: str) -> str:
    # URL → S3 Key 추출
    bucket_domain = f"{S3_BUCKET}.s3.ap-northeast-1.amazonaws.com/"
    key = url.split(bucket_domain)[-1]
    obj = s3.get_object(Bucket=S3_BUCKET, Key=key)
    return obj["Body"].read().decode("utf-8")


# ── QA 체크 1: 미치환 변수 탐지 ─────────────────────────────────────────────
def check_unresolved_vars(html: str) -> list:
    """{{ var }} 형태가 HTML에 남아있으면 탐지"""
    found = re.findall(r"\{\{[^}]+\}\}", html)
    return list(set(found))


# ── QA 체크 2: 링크 유효성 ───────────────────────────────────────────────────
def check_links(html: str) -> list:
    broken = []
    urls   = re.findall(r'href=["\']([^"\'#][^"\']*)["\']', html)
    for url in set(urls):
        if not url.startswith("http"):
            continue
        try:
            req = urllib.request.Request(url, method="HEAD",
                                          headers={"User-Agent": "EDM-QA-Bot/1.0"})
            with urllib.request.urlopen(req, timeout=5):
                pass
        except Exception as e:
            broken.append({"url": url, "error": str(e)})
    return broken


# ── QA 체크 3: UTM 파라미터 누락 ─────────────────────────────────────────────
def check_utm(html: str) -> list:
    urls     = re.findall(r'href=["\']([^"\'#][^"\']*)["\']', html)
    missing  = []
    for url in set(urls):
        if not url.startswith("http"):
            continue
        if "utm_source" not in url:
            missing.append(url)
    return missing


# ── QA 체크 4: 텍스트 길이 ───────────────────────────────────────────────────
def check_text_length(html: str) -> list:
    warnings = []
    title_m  = re.search(r"<title>([^<]+)</title>", html)
    if title_m:
        title = title_m.group(1)
        if len(title) > 50:
            warnings.append(f"제목 {len(title)}자 초과 (권장 50자 이내): {title[:30]}...")
    return warnings


# ── Slack 알림 발송 ───────────────────────────────────────────────────────────
def send_slack(campaign_id: str, qa_summary: list):
    if not SLACK_WEBHOOK:
        print("[fn-qa] SLACK_WEBHOOK 미설정, 알림 스킵")
        return

    all_passed = all(r["passed"] for r in qa_summary)
    icon       = "✅" if all_passed else "⚠️"
    status_txt = "전체 통과" if all_passed else "일부 항목 실패"

    rows = []
    for r in qa_summary:
        mark = "✅" if r["passed"] else "❌"
        rows.append(f"{mark} *{r['segment']}* — {r['summary']}")

    blocks = [
        {
            "type": "header",
            "text": {"type": "plain_text",
                     "text": f"{icon} EDM QA 결과 | {campaign_id}"}
        },
        {
            "type": "section",
            "text": {"type": "mrkdwn",
                     "text": "\n".join(rows)}
        }
    ]

    # 전체 통과 시 승인 버튼 추가
    if all_passed and APPROVE_API_URL:
        blocks.append({
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "✅ 발송 승인"},
                    "style": "primary",
                    "url": f"{APPROVE_API_URL}?campaign_id={campaign_id}"
                },
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "❌ 반려"},
                    "style": "danger",
                    "url": f"{APPROVE_API_URL}?campaign_id={campaign_id}&action=reject"
                }
            ]
        })

    payload = json.dumps({"blocks": blocks}).encode("utf-8")
    req = urllib.request.Request(
        SLACK_WEBHOOK,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as res:
        print(f"[fn-qa] Slack 전송: {res.status}")


# ── 메인 핸들러 ───────────────────────────────────────────────────────────────
def lambda_handler(event, context):
    if "Records" in event:
        body = json.loads(event["Records"][0]["body"])
    else:
        body = event

    campaign_id = body.get("campaign_id", "test-001")
    output_urls = body.get("output_urls", [])
    qa_summary  = []

    for item in output_urls:
        segment  = item["segment"]
        html_url = item["url"]
        issues   = []

        try:
            html = fetch_html_from_s3(html_url)

            unresolved = check_unresolved_vars(html)
            if unresolved:
                issues.append(f"미치환 변수: {', '.join(unresolved)}")

            broken_links = check_links(html)
            if broken_links:
                issues.append(f"깨진 링크 {len(broken_links)}개")

            missing_utm = check_utm(html)
            if missing_utm:
                issues.append(f"UTM 누락 링크 {len(missing_utm)}개")

            length_warns = check_text_length(html)
            issues.extend(length_warns)

        except Exception as e:
            issues.append(f"HTML 로드 실패: {e}")

        passed = len(issues) == 0
        qa_summary.append({
            "segment": segment,
            "url":     html_url,
            "passed":  passed,
            "issues":  issues,
            "summary": "통과" if passed else " / ".join(issues),
        })
        print(f"[fn-qa] {segment}: {'통과' if passed else issues}")

    send_slack(campaign_id, qa_summary)

    return {
        "statusCode": 200,
        "body": {
            "campaign_id": campaign_id,
            "qa_summary":  qa_summary
        }
    }