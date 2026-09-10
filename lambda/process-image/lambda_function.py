"""
process-image
--------------
프론트엔드(admin/js/lib/imageProcessApi.js)의 processImage()/generateImage()가
호출하는 AI 이미지 가공 API. OpenAI의 gpt-image-1(images/edits)로 이미지를 넘겨
가공한 뒤, 결과 바이너리를 그대로 응답한다 — S3에는 아무것도 저장하지 않는다
(최종 저장은 사용자가 확정한 뒤 get-upload-url → uploadToS3() 흐름으로 별도 진행됨).

요청  : multipart/form-data { file?, referenceFiles[]?, referenceUrls[]?, instruction, purpose }
        file / referenceFiles / referenceUrls 중 최소 하나는 있어야 함
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
import traceback
import urllib.request
import urllib.error
from email.parser import BytesParser
from email.policy import default as email_default_policy

# 참고 이미지를 무제한으로 붙이면 OpenAI 호출이 길어져 API Gateway 30초 벽에 걸립니다.
# 앞에서부터 이 개수까지만 씁니다.
MAX_REFERENCE_IMAGES = int(os.environ.get("MAX_REFERENCE_IMAGES", "4"))
# referenceUrls는 서버가 직접 내려받아야 하므로 그만큼 시간을 더 씁니다 — 짧게 끊습니다.
REFERENCE_FETCH_TIMEOUT = int(os.environ.get("REFERENCE_FETCH_TIMEOUT", "5"))

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
    """API Gateway가 넘겨준 multipart/form-data 바디를 필드별로 분해.

    ⚠️ 예전엔 "파일명이 있는 파트면 무조건 fields['file']"로 넣었는데, 프론트가
    file 다음에 referenceFiles를 붙이기 때문에 참고 이미지가 있으면 마지막
    참고 이미지가 원본(file)을 덮어써서 "엉뚱한 이미지가 편집되는" 버그가
    있었습니다. 파트의 name을 실제로 보고 구분합니다.
    """
    msg = BytesParser(policy=email_default_policy).parsebytes(
        b"Content-Type: " + content_type.encode() + b"\r\n\r\n" + body
    )
    fields = {"file": None, "referenceFiles": [], "referenceUrls": []}
    for part in msg.iter_parts():
        name = part.get_param("name", header="content-disposition")
        filename = part.get_filename()
        # decode=True는 파트가 비어있을 때 None을 돌려줄 수 있습니다 — 그대로 .decode()를
        # 부르면 AttributeError로 죽어서, 원인을 알 수 없는 500이 됩니다.
        payload = part.get_payload(decode=True) or b""
        if filename is not None:
            item = {
                "filename":     filename,
                "content_type": part.get_content_type(),
                "data":         payload,
            }
            if name == "referenceFiles":
                fields["referenceFiles"].append(item)
            else:
                fields["file"] = item
        elif name:
            # 지시문에 잘못된 바이트가 섞여도 요청 전체를 실패시키지는 않습니다.
            text = payload.decode("utf-8", "replace")
            if name == "referenceUrls":
                fields["referenceUrls"].append(text)
            else:
                fields[name] = text
    return fields


def _fetch_reference_url(url: str) -> dict:
    """referenceUrls로 넘어온 기존 자산을 내려받아 참고 이미지로 씁니다."""
    req = urllib.request.Request(url, headers={"User-Agent": "EDM-process-image/1.0"})
    with urllib.request.urlopen(req, timeout=REFERENCE_FETCH_TIMEOUT) as res:
        return {
            "filename":     url.rsplit("/", 1)[-1] or "reference.png",
            "content_type": res.headers.get("Content-Type", "image/png"),
            "data":         res.read(),
        }


EXT_BY_CONTENT_TYPE = {
    "image/png": "png", "image/jpeg": "jpg", "image/jpg": "jpg", "image/webp": "webp",
}


def _describe(item) -> str:
    """로그용 요약 — 이미지 바이너리 자체는 절대 로그에 남기지 않습니다."""
    if not item:
        return "없음"
    return f"{item.get('filename')!r}({item.get('content_type')}, {len(item.get('data') or b'')}B)"


def call_openai_image_edit(images: list, instruction: str, purpose: str) -> tuple:
    """
    OpenAI images/edits(gpt-image-1) 호출 — images[0]을 편집 대상으로, 나머지는
    참고 이미지로 함께 넘긴다(gpt-image-1은 여러 장 입력을 지원).
    반환값: (processed_bytes, response_content_type)
    """
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
    if not instruction or not instruction.strip():
        raise ValueError("instruction이 필요합니다.")
    if not images:
        raise ValueError("편집할 이미지가 없습니다.")

    prompt = instruction.strip()
    if purpose:
        prompt = f"{prompt}\n\n(참고: 이 이미지는 '{purpose}' 목적의 EDM 이메일에 사용됩니다. 이메일에 바로 쓸 수 있는 자연스러운 결과물로 만들어주세요.)"

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

    # 한 장이면 "image", 여러 장이면 "image[]" — gpt-image-1은 둘 다 받지만, 배열
    # 표기는 여러 장일 때만 쓰는 쪽이 OpenAI 예제와 같아 안전합니다.
    image_field = "image" if len(images) == 1 else "image[]"
    for idx, img in enumerate(images):
        ctype = img.get("content_type") or "image/png"
        ext = EXT_BY_CONTENT_TYPE.get(ctype, "png")
        body.extend(f"--{boundary}\r\n".encode())
        body.extend(
            f'Content-Disposition: form-data; name="{image_field}"; filename="upload{idx}.{ext}"\r\n'
            f"Content-Type: {ctype}\r\n\r\n".encode()
        )
        body.extend(img["data"])
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

    # ⚠️ 실패해도 CloudWatch에 아무것도 남지 않아 원인 추적이 불가능했습니다(에러 메시지가
    # HTTP 응답 본문에만 담겨 브라우저 콘솔에는 상태코드만 보임). 요청 모양과 예외를
    # 반드시 로그로 남깁니다.
    print(f"[process-image] content-type={content_type_header[:80]!r} "
          f"bodyBytes={len(raw_body)} isBase64={event.get('isBase64Encoded')}")

    try:
        fields = _parse_multipart(content_type_header, raw_body)
        file_field = fields.get("file")
        # ⚠️ 클라이언트가 Blob이 아닌 값을 file로 붙이면(예: 저장/복원으로 Blob이 빈
        # 객체가 된 경우, 브라우저가 "[object Object]" 문자열 파트로 보냄) 파일명 없는
        # 텍스트 파트로 도착합니다. 그대로 파일처럼 다루면 원인을 알 수 없는 500이
        # 되므로, 파일이 아닌 file 필드는 없는 것으로 취급하고 명확히 400을 돌려줍니다.
        if file_field is not None and not isinstance(file_field, dict):
            print(f"[process-image] file 필드가 파일이 아님(무시): {str(file_field)[:80]!r}")
            file_field = None
        ref_files = fields.get("referenceFiles") or []
        ref_urls = fields.get("referenceUrls") or []
        instruction = fields.get("instruction", "")

        print(f"[process-image] file={_describe(file_field)} "
              f"referenceFiles={[_describe(r) for r in ref_files]} "
              f"referenceUrls={len(ref_urls)}건 instruction={instruction[:60]!r}")

        # 편집 대상(file)이 없으면 참고 이미지 중 첫 장을 대상으로 삼습니다 — 프론트의
        # "참고 이미지만으로 새로 생성" 흐름(file 없이 referenceFiles만 오는 경우)이
        # 400으로 튕기지 않도록.
        images = []
        if file_field:
            images.append(file_field)
        images.extend(ref_files)
        for url in ref_urls[: max(0, MAX_REFERENCE_IMAGES - len(images))]:
            try:
                images.append(_fetch_reference_url(url))
            except Exception as e:  # 참고 이미지 하나 못 받았다고 전체를 실패시키지 않음
                print(f"[process-image] 참고 이미지 다운로드 실패({url[:80]}): {e}")

        if not images:
            return {"statusCode": 400, "headers": CORS_HEADERS,
                    "body": json.dumps({"error": "file 또는 참고 이미지가 최소 하나는 필요합니다."},
                                       ensure_ascii=False)}

        processed_bytes, processed_content_type = call_openai_image_edit(
            images[:MAX_REFERENCE_IMAGES],
            instruction,
            fields.get("purpose", ""),
        )
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "ignore")
        print(f"[process-image] OpenAI HTTP {e.code}: {detail[:800]}")
        return {"statusCode": 502, "headers": CORS_HEADERS,
                "body": json.dumps({"error": f"OpenAI API 호출 실패: {e.code} {detail}"}, ensure_ascii=False)}
    except Exception as e:
        print("[process-image] 실패:\n" + traceback.format_exc())
        return {"statusCode": 500, "headers": CORS_HEADERS,
                "body": json.dumps({"error": f"이미지 처리 실패: {e}"}, ensure_ascii=False)}

    print(f"[process-image] 성공 — 결과 {len(processed_bytes)}바이트")

    return {
        "statusCode":      200,
        "headers":         {**CORS_HEADERS, "Content-Type": processed_content_type},
        "isBase64Encoded": True,
        "body":            base64.b64encode(processed_bytes).decode("ascii"),
    }
