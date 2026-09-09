"""
fn-generate-copy
-----------------
admin/js/lib/copyGenerator.js의 generateCopy()가 호출하는 AI 카피 자동생성 API.
OpenAI Chat Completions API(ChatGPT)로 EDM 텍스트 필드를 채운다.

요청  : POST { purpose, fieldKeys: string[], customPrompt?: string }
응답  : { [fieldKey]: string, ... }  — fieldKeys 각각에 대한 생성 카피

환경변수
  OPENAI_API_KEY : OpenAI API 키
  OPENAI_MODEL   : 사용할 모델 (기본 gpt-4o-mini)

IAM 실행 역할
  S3/기타 AWS 리소스 접근 불필요 — 외부 HTTPS 호출만 하므로
  AWSLambdaBasicExecutionRole 정도면 충분.
"""

import json
import os
import urllib.request
import urllib.error

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL   = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_URL     = "https://api.openai.com/v1/chat/completions"

CORS_HEADERS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type":                 "application/json",
}


# ── 프롬프트 생성 ──────────────────────────────────────────────────────────────
def build_prompt(purpose: str, field_keys: list, custom_prompt: str) -> str:
    keys_desc = "\n".join(f"- {k}" for k in field_keys)
    extra = f"\n\n[담당자 추가 요청사항]\n{custom_prompt.strip()}" if custom_prompt and custom_prompt.strip() else ""

    return f"""당신은 미스미 코리아(MISUMI, B2B 제조 부품 이커머스) EDM 마케팅 카피라이터입니다.

[캠페인 목적]
{purpose or "안내"}

[작성 규칙]
- 언어: 한국어, 실제 발송 가능한 자연스러운 문장으로 작성
- 이모지 사용 금지
- 필드 키 이름에서 다음 패턴이 보이면 그에 맞는 길이/톤으로 작성하세요:
  - headline, main_ 로 시작/포함 : 짧고 임팩트 있는 제목 (25자 이내)
  - sub, desc_ 로 시작/포함 : 제목을 보완하는 한 문장 설명
  - btn_, cta_, button 이 포함 : 버튼에 들어갈 아주 짧은 문구 (10자 이내)
  - preheader : 미리보기 문구 (40자 이내)
  - 그 외 : 문맥에 맞는 자연스러운 한국어 마케팅 카피
- 반드시 JSON 객체 하나만 반환하세요 (설명, 코드블록 등 다른 텍스트 금지)
- JSON의 키는 아래 [생성할 필드 키 목록]에 있는 키와 정확히 동일해야 합니다

[생성할 필드 키 목록]
{keys_desc}
{extra}

응답 예시 형식: {{"{field_keys[0] if field_keys else 'field_key'}": "생성된 문구"}}"""


# ── OpenAI 호출 ────────────────────────────────────────────────────────────────
def call_openai(prompt: str) -> dict:
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")

    payload = json.dumps({
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.8,
        "response_format": {"type": "json_object"},
    }).encode("utf-8")

    req = urllib.request.Request(
        OPENAI_URL,
        data=payload,
        headers={
            "Content-Type":  "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        data = json.loads(res.read().decode("utf-8"))

    content = data["choices"][0]["message"]["content"]
    return json.loads(content)


# ── 메인 핸들러 ────────────────────────────────────────────────────────────────
def lambda_handler(event, context):

    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS" \
       or event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        if "body" in event and event["body"]:
            body = json.loads(event["body"]) if isinstance(event["body"], str) else event["body"]
        else:
            body = event
    except Exception as e:
        return {"statusCode": 400, "headers": CORS_HEADERS,
                "body": json.dumps({"error": f"바디 파싱 실패: {e}"})}

    purpose       = body.get("purpose", "")
    field_keys    = body.get("fieldKeys", [])
    custom_prompt = body.get("customPrompt", "")

    if not field_keys:
        return {"statusCode": 400, "headers": CORS_HEADERS,
                "body": json.dumps({"error": "fieldKeys가 필요합니다."})}

    try:
        prompt = build_prompt(purpose, field_keys, custom_prompt)
        result = call_openai(prompt)
        # 모델이 요청하지 않은 키를 추가하거나 일부 키를 누락할 수 있으므로,
        # 요청받은 field_keys만 걸러서 반환한다 (누락분은 빈 문자열).
        filtered = {k: str(result.get(k, "")) for k in field_keys}
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "ignore")
        return {"statusCode": 502, "headers": CORS_HEADERS,
                "body": json.dumps({"error": f"OpenAI API 호출 실패: {e.code} {detail}"}, ensure_ascii=False)}
    except Exception as e:
        return {"statusCode": 500, "headers": CORS_HEADERS,
                "body": json.dumps({"error": f"카피 생성 실패: {e}"}, ensure_ascii=False)}

    return {
        "statusCode": 200,
        "headers":    CORS_HEADERS,
        "body":       json.dumps(filtered, ensure_ascii=False),
    }
