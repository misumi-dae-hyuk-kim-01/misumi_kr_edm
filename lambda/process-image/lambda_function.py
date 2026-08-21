"""
process-image
--------------
프론트엔드(admin/js/lib/imageProcessApi.js)의 processImage()가 호출하는 AI 이미지
가공 API. 외부 AI API(OpenAI 등)로 이미지를 넘겨 가공한 뒤, 결과 바이너리를 그대로
응답한다 — S3에는 아무것도 저장하지 않는다 (최종 저장은 사용자가 확정한 뒤
get-upload-url → uploadToS3() 흐름으로 별도 진행됨).

요청  : multipart/form-data { file, instruction, purpose }
응답  : 가공된 이미지 바이너리 (Content-Type: image/*)

환경변수
  AI_API_URL     : 외부 AI 이미지 가공 API 엔드포인트
  AI_API_KEY     : 위 API 인증 키
  AI_API_TIMEOUT : 외부 API 호출 타임아웃(초), 기본 30

IAM 실행 역할
  S3 권한 불필요 — 이 함수는 S3에 접근하지 않는다.
  (외부 HTTPS 호출만 하므로 AWSLambdaBasicExecutionRole 정도면 충분)
"""

import json
import os
import urllib.request
import urllib.error
from email.parser import BytesParser
from email.policy import default as email_default_policy

AI_API_URL     = os.environ.get("AI_API_URL", "")
AI_API_KEY     = os.environ.get("AI_API_KEY", "")
AI_API_TIMEOUT = int(os.environ.get("AI_API_TIMEOUT", "30"))

CORS_HEADERS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def _parse_multipart(content_type: str, body: bytes) -> dict:
    """API Gateway가 넘겨준 multipart/form-data 바디를 필드별로 분해."""
    msg = BytesParser(policy=email_default_policy).parsebytes(
        b"Content-Type: " + content_type.encode() + b"\r\n\r\n" + body
    )
    fields = {}
    for part in msg.iter_parts():
        name = part.get_param("name", header="content-disposition")
        filename = part.get_filename()
        if filename:
            fields["file"] = {
                "filename":     filename,
                "content_type": part.get_content_type(),
                "data":         part.get_payload(decode=True),
            }
        elif name:
            fields[name] = part.get_payload(decode=True).decode("utf-8")
    return fields


def call_external_ai_api(image_bytes: bytes, content_type: str, instruction: str, purpose: str) -> tuple:
    """
    외부 AI 이미지 가공 API 호출.
    ⚠️ 실제 사용할 API(OpenAI 등)의 요청/응답 스펙에 맞춰 이 함수 내부만 교체하면 됨 —
    아래는 "이미지 + 지시문을 multipart로 보내고 이미지 바이너리를 돌려받는" 가장 흔한
    패턴을 예시로 작성한 것.
    반환값: (processed_bytes, response_content_type)
    """
    if not AI_API_URL:
        raise ValueError("AI_API_URL 환경변수가 설정되지 않았습니다.")

    boundary = "----edmAiBoundary"
    body = bytearray()

    def add_field(name, value):
        body.extend(f"--{boundary}\r\n".encode())
        body.extend(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode())
        body.extend(value.encode())
        body.extend(b"\r\n")

    add_field("instruction", instruction or "")
    add_field("purpose", purpose or "")

    body.extend(f"--{boundary}\r\n".encode())
    body.extend(
        f'Content-Disposition: form-data; name="file"; filename="upload"\r\n'
        f"Content-Type: {content_type}\r\n\r\n".encode()
    )
    body.extend(image_bytes)
    body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode())

    req = urllib.request.Request(
        AI_API_URL,
        data=bytes(body),
        method="POST",
        headers={
            "Content-Type":  f"multipart/form-data; boundary={boundary}",
            "Authorization": f"Bearer {AI_API_KEY}",
        },
    )

    with urllib.request.urlopen(req, timeout=AI_API_TIMEOUT) as res:
        result_bytes = res.read()
        result_content_type = res.headers.get("Content-Type", "image/png")
    return result_bytes, result_content_type


def lambda_handler(event, context):

    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS" \
       or event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    content_type_header = event.get("headers", {}).get("content-type") \
        or event.get("headers", {}).get("Content-Type", "")

    raw_body = event.get("body", "")
    if event.get("isBase64Encoded"):
        import base64
        raw_body = base64.b64decode(raw_body)
    else:
        raw_body = raw_body.encode("utf-8") if isinstance(raw_body, str) else raw_body

    try:
        fields = _parse_multipart(content_type_header, raw_body)
        file_field = fields.get("file")
        if not file_field:
            return {"statusCode": 400, "headers": CORS_HEADERS,
                     "body": json.dumps({"error": "file 필드가 필요합니다."})}

        processed_bytes, processed_content_type = call_external_ai_api(
            file_field["data"],
            file_field["content_type"],
            fields.get("instruction", ""),
            fields.get("purpose", ""),
        )
    except urllib.error.HTTPError as e:
        return {"statusCode": 502, "headers": CORS_HEADERS,
                "body": json.dumps({"error": f"AI API 호출 실패: {e.code}"})}
    except Exception as e:
        return {"statusCode": 500, "headers": CORS_HEADERS,
                "body": json.dumps({"error": f"이미지 처리 실패: {e}"})}

    import base64
    return {
        "statusCode":      200,
        "headers":         {**CORS_HEADERS, "Content-Type": processed_content_type},
        "isBase64Encoded": True,
        "body":            base64.b64encode(processed_bytes).decode("ascii"),
    }
