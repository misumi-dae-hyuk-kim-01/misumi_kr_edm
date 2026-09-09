"""
process-image
--------------
프론트엔드(admin/js/lib/imageProcessApi.js)의 processImage()/generateImage()가
호출하는 AI 이미지 가공 API. OpenAI의 gpt-image-1(images/edits)로 이미지를 넘겨
가공한 뒤, 결과 바이너리를 그대로 응답한다 — S3에는 아무것도 저장하지 않는다
(최종 저장은 사용자가 확정한 뒤 get-upload-url → uploadToS3() 흐름으로 별도 진행됨).

요청  : multipart/form-data { file, instruction, purpose }
응답  : 가공된 이미지 바이너리 (Content-Type: image/*)

환경변수
  OPENAI_API_KEY    : OpenAI API 키
  OPENAI_IMAGE_MODEL: 이미지 편집 모델, 기본 gpt-image-1
  OPENAI_IMAGE_SIZE : 출력 크기 (1024x1024 | 1536x1024 | 1024x1536 | auto), 기본 auto
  OPENAI_IMAGE_QUALITY : low | medium | high, 기본 medium
    ⚠️ API Gateway(HTTP API)의 통합 타임아웃은 30초가 AWS 하드 리밋이라 늘릴 수 없음.
    high는 실측 28~29초로 그 한계에 거의 붙어 있어 타임아웃 위험이 큼 — medium이
    품질/속도의 안전한 균형점(실측 15~17초).
  AI_API_TIMEOUT    : 외부 API 호출 타임아웃(초), 기본 60 (API Gateway 한계보다 낮게 설정해야
    504 대신 이 함수의 에러 메시지가 응답됨)

IAM 실행 역할
  S3 권한 불필요 — 이 함수는 S3에 접근하지 않는다.
  (외부 HTTPS 호출만 하므로 AWSLambdaBasicExecutionRole 정도면 충분)
"""

import base64
import json
import os
import urllib.request
import urllib.error
from email.parser import BytesParser
from email.policy import default as email_default_policy

OPENAI_API_KEY      = os.environ.get("OPENAI_API_KEY", "")
OPENAI_IMAGE_MODEL  = os.environ.get("OPENAI_IMAGE_MODEL", "gpt-image-1")
OPENAI_IMAGE_SIZE   = os.environ.get("OPENAI_IMAGE_SIZE", "auto")
OPENAI_IMAGE_QUALITY = os.environ.get("OPENAI_IMAGE_QUALITY", "medium")
OPENAI_IMAGES_URL   = "https://api.openai.com/v1/images/edits"
AI_API_TIMEOUT      = int(os.environ.get("AI_API_TIMEOUT", "60"))

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


EXT_BY_CONTENT_TYPE = {
    "image/png": "png", "image/jpeg": "jpg", "image/jpg": "jpg", "image/webp": "webp",
}


def call_openai_image_edit(image_bytes: bytes, content_type: str, instruction: str, purpose: str) -> tuple:
    """
    OpenAI images/edits(gpt-image-1) 호출 — 업로드된 이미지를 지시문(instruction)에
    따라 편집한다. 반환값: (processed_bytes, response_content_type)
    """
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
    if not instruction or not instruction.strip():
        raise ValueError("instruction이 필요합니다.")

    prompt = instruction.strip()
    if purpose:
        prompt = f"{prompt}\n\n(참고: 이 이미지는 '{purpose}' 목적의 EDM 이메일에 사용됩니다. 이메일에 바로 쓸 수 있는 자연스러운 결과물로 만들어주세요.)"

    ext = EXT_BY_CONTENT_TYPE.get(content_type, "png")
    boundary = "----edmOpenAiBoundary"
    body = bytearray()

    def add_field(name, value):
        body.extend(f"--{boundary}\r\n".encode())
        body.extend(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode())
        body.extend(value.encode("utf-8"))
        body.extend(b"\r\n")

    add_field("model", OPENAI_IMAGE_MODEL)
    add_field("prompt", prompt)
    add_field("size", OPENAI_IMAGE_SIZE)
    add_field("quality", OPENAI_IMAGE_QUALITY)
    add_field("n", "1")

    body.extend(f"--{boundary}\r\n".encode())
    body.extend(
        f'Content-Disposition: form-data; name="image"; filename="upload.{ext}"\r\n'
        f"Content-Type: {content_type}\r\n\r\n".encode()
    )
    body.extend(image_bytes)
    body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode())

    req = urllib.request.Request(
        OPENAI_IMAGES_URL,
        data=bytes(body),
        method="POST",
        headers={
            "Content-Type":  f"multipart/form-data; boundary={boundary}",
            "Authorization": f"Bearer {OPENAI_API_KEY}",
        },
    )

    with urllib.request.urlopen(req, timeout=AI_API_TIMEOUT) as res:
        data = json.loads(res.read().decode("utf-8"))

    b64 = data["data"][0]["b64_json"]
    return base64.b64decode(b64), "image/png"


def lambda_handler(event, context):

    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS" \
       or event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    content_type_header = event.get("headers", {}).get("content-type") \
        or event.get("headers", {}).get("Content-Type", "")

    raw_body = event.get("body", "")
    if event.get("isBase64Encoded"):
        raw_body = base64.b64decode(raw_body)
    else:
        raw_body = raw_body.encode("utf-8") if isinstance(raw_body, str) else raw_body

    try:
        fields = _parse_multipart(content_type_header, raw_body)
        file_field = fields.get("file")
        if not file_field:
            return {"statusCode": 400, "headers": CORS_HEADERS,
                     "body": json.dumps({"error": "file 필드가 필요합니다."})}

        processed_bytes, processed_content_type = call_openai_image_edit(
            file_field["data"],
            file_field["content_type"],
            fields.get("instruction", ""),
            fields.get("purpose", ""),
        )
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "ignore")
        return {"statusCode": 502, "headers": CORS_HEADERS,
                "body": json.dumps({"error": f"OpenAI API 호출 실패: {e.code} {detail}"}, ensure_ascii=False)}
    except Exception as e:
        return {"statusCode": 500, "headers": CORS_HEADERS,
                "body": json.dumps({"error": f"이미지 처리 실패: {e}"}, ensure_ascii=False)}

    return {
        "statusCode":      200,
        "headers":         {**CORS_HEADERS, "Content-Type": processed_content_type},
        "isBase64Encoded": True,
        "body":            base64.b64encode(processed_bytes).decode("ascii"),
    }
