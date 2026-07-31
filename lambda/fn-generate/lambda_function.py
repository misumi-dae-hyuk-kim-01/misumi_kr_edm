"""
fn-generate-gemini
------------------
Google Gemini API (무료)로 EDM 카피를 자동 생성하는 버전
gemini-1.5-flash 모델 사용 — 일 1,500회 무료

환경변수 (Lambda 콘솔에서 설정)
  GEMINI_API_KEY  : Google AI Studio에서 발급한 키
  S3_BUCKET       : kor-smartlp
  SQS_RENDER_URL  : fn-render SQS URL (비워두면 결과 직접 반환)
"""

import json
import os
import urllib.request
import boto3

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
S3_BUCKET      = os.environ.get("S3_BUCKET",      "kor-smartlp")
SQS_RENDER_URL = os.environ.get("SQS_RENDER_URL", "")

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"


# ── Gemini API 호출 ────────────────────────────────────────────────────────────
def call_gemini(prompt: str, retry: int = 3) -> dict:
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")

    import time

    payload = json.dumps({
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature":     0.7,
            "maxOutputTokens": 1000,
        }
    }).encode("utf-8")

    for attempt in range(retry):
        try:
            req = urllib.request.Request(
                GEMINI_URL,
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=30) as res:
                data = json.loads(res.read().decode("utf-8"))

            raw = data["candidates"][0]["content"]["parts"][0]["text"]
            clean = raw.replace("```json", "").replace("```", "").strip()
            return json.loads(clean)

        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < retry - 1:
                wait = (attempt + 1) * 5
                print(f"[Gemini] 429 Too Many Requests — {wait}초 후 재시도 ({attempt+1}/{retry})")
                time.sleep(wait)
            else:
                raise
        except Exception as e:
            if attempt < retry - 1:
                time.sleep(3)
            else:
                raise


# ── 프롬프트 생성 ──────────────────────────────────────────────────────────────
def build_prompt(brief: dict, segment: dict) -> str:
    seg_name  = segment.get("name",        "신규 가입자")
    seg_desc  = segment.get("description", "가입 후 7일 이내, 구매 이력 없음")
    goal      = brief.get("campaign_goal", "신규 고객 첫 구매 전환")
    tpl       = brief.get("campaign_type", "welcome")
    benefit   = brief.get("key_benefit",   "첫 주문 할인 혜택")
    coupon    = brief.get("coupon_code",   "")
    expiry    = brief.get("coupon_expiry", "")
    url       = brief.get("landing_url",   "https://kr.misumi-ec.com")

    return f"""당신은 미스미 코리아(B2B 제조 부품 이커머스) EDM 카피라이터입니다.

[캠페인 정보]
- 유형: {tpl}
- 목적: {goal}
- 핵심 혜택: {benefit}
- 쿠폰 코드: {coupon if coupon else "없음"}
- 쿠폰 만료: {expiry if expiry else "없음"}
- 랜딩 URL: {url}

[대상 세그먼트]
- 이름: {seg_name}
- 특성: {seg_desc}

[작성 규칙]
- 언어: 한국어
- 제목: 30자 이내, 이모지 사용 금지
- CTA: 10자 이내
- 본문: 3문장 이내, 간결하게
- JSON만 반환 (다른 텍스트 없이)

아래 JSON 형식으로 작성:
{{
  "subject_a":     "제목 A (호기심 유발형)",
  "subject_b":     "제목 B (혜택 직접 제시형)",
  "subject_c":     "제목 C (긴박감 강조형)",
  "preheader":     "프리헤더 (40자 이내)",
  "body_headline": "히어로 헤드라인",
  "body_copy":     "본문 카피 (3문장 이내)",
  "cta_text":      "CTA 버튼 문구",
  "coupon_label":  "쿠폰 박스 라벨",
  "coupon_note":   "쿠폰 조건 한 줄",
  "banner_alt":    "배너 이미지 alt 텍스트"
}}"""


# ── 메인 핸들러 ────────────────────────────────────────────────────────────────
def lambda_handler(event, context):

    # CORS 헤더
    headers = {
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type":                 "application/json",
    }

    # OPTIONS 프리플라이트
    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS" \
       or event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    # 바디 파싱
    try:
        if "body" in event and event["body"]:
            body = json.loads(event["body"]) if isinstance(event["body"], str) else event["body"]
        elif "Records" in event:
            body = json.loads(event["Records"][0]["body"])
        else:
            body = event
    except Exception as e:
        return {"statusCode": 400, "headers": headers,
                "body": json.dumps({"error": f"바디 파싱 실패: {e}"})}

    brief    = body.get("brief", {})
    segments = body.get("segments", [
        {"name": "신규 가입자", "description": "가입 후 7일 이내, 구매 이력 없음", "language": "Korean"},
    ])

    results = []
    for seg in segments:
        try:
            prompt = build_prompt(brief, seg)
            copy   = call_gemini(prompt)
            results.append({
                "segment": seg["name"],
                "brief":   brief,
                "copy":    copy,
            })
            print(f"[fn-generate-gemini] '{seg['name']}' 생성 완료")
        except Exception as e:
            print(f"[fn-generate-gemini] '{seg['name']}' 오류: {e}")
            results.append({
                "segment": seg["name"],
                "brief":   brief,
                "copy":    {
                    "subject_a":     f"미스미 코리아 {seg['name']} 전용 혜택",
                    "subject_b":     "특별 혜택이 도착했습니다",
                    "subject_c":     "지금 바로 확인하세요",
                    "preheader":     "미스미 코리아에서 특별한 혜택을 드립니다.",
                    "body_headline": "제조 부품 구매, 이제 더 스마트하게",
                    "body_copy":     "미스미 코리아에서 700만 개 이상의 부품을 찾아보세요.",
                    "cta_text":      "지금 시작하기",
                    "coupon_label":  "전용 쿠폰",
                    "coupon_note":   "기간 한정 혜택",
                    "banner_alt":    "미스미 코리아 EDM 배너",
                },
                "error": str(e)
            })

    payload = {
        "campaign_id": brief.get("campaign_id", "test-001"),
        "results":     results,
        "mode":        "gemini",
    }

    # SQS 연결된 경우 fn-render로 전달
    if SQS_RENDER_URL:
        sqs = boto3.client("sqs", region_name="ap-northeast-1")
        sqs.send_message(
            QueueUrl    = SQS_RENDER_URL,
            MessageBody = json.dumps(payload, ensure_ascii=False)
        )
        print(f"[fn-generate-gemini] SQS 전달 완료")
        return {
            "statusCode": 200,
            "headers":    headers,
            "body":       json.dumps({"message": "생성 완료"}, ensure_ascii=False)
        }

    return {
        "statusCode": 200,
        "headers":    headers,
        "body":       json.dumps(payload, ensure_ascii=False),
    }