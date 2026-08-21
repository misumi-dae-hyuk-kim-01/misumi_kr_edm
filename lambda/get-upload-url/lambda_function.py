"""
fn-get-upload-url
------------------
프론트엔드(admin/js/lib/s3Upload.js)가 S3에 직접 업로드할 수 있도록
presigned PUT URL을 발급해주는 함수. 이 함수 자체는 S3에 아무것도 쓰지 않음
(파일 바이너리를 받지 않음) — 실제 업로드는 브라우저가 발급받은 uploadUrl로
직접 PUT 요청을 보내서 수행함.

요청  : POST { filename, contentType, channel }
응답  : { uploadUrl, publicUrl }

환경변수
  S3_BUCKET   : kor-smartlp
  S3_PREFIX   : edm/
  BASE_URL    : https://kor-smartlp.s3.ap-northeast-1.amazonaws.com/edm
  URL_EXPIRES : presigned URL 유효시간(초), 기본 300

주의: kor-smartlp 버킷은 ap-northeast-1(도쿄)에 있음 — ap-northeast-2로 서명하면
S3가 AuthorizationQueryParametersError를 반환함.
"""

import json
import os
import re
import uuid
import boto3

S3_BUCKET   = os.environ.get("S3_BUCKET",   "kor-smartlp")
S3_PREFIX   = os.environ.get("S3_PREFIX",   "edm/")
BASE_URL    = os.environ.get("BASE_URL",
    "https://kor-smartlp.s3.ap-northeast-1.amazonaws.com/edm")
URL_EXPIRES = int(os.environ.get("URL_EXPIRES", "300"))

s3 = boto3.client("s3", region_name="ap-northeast-1")

HEADERS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type":                 "application/json",
}


def _safe_filename(filename: str) -> str:
    name = re.sub(r"[^a-zA-Z0-9._-]", "_", filename or "upload")
    return f"{uuid.uuid4().hex}_{name}"


def lambda_handler(event, context):

    # OPTIONS 프리플라이트
    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS" \
       or event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": HEADERS, "body": ""}

    # 바디 파싱
    try:
        if "body" in event and event["body"]:
            body = json.loads(event["body"]) if isinstance(event["body"], str) else event["body"]
        else:
            body = event
    except Exception as e:
        return {"statusCode": 400, "headers": HEADERS,
                "body": json.dumps({"error": f"바디 파싱 실패: {e}"})}

    filename     = body.get("filename")
    content_type = body.get("contentType", "application/octet-stream")
    channel      = body.get("channel", "EDM")

    if not filename:
        return {"statusCode": 400, "headers": HEADERS,
                "body": json.dumps({"error": "filename이 필요합니다."})}

    safe_channel = re.sub(r"[^a-zA-Z0-9_-]", "_", channel)
    key = f"{S3_PREFIX}uploads/{safe_channel}/{_safe_filename(filename)}"

    try:
        upload_url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket":      S3_BUCKET,
                "Key":         key,
                "ContentType": content_type,
            },
            ExpiresIn=URL_EXPIRES,
        )
    except Exception as e:
        return {"statusCode": 500, "headers": HEADERS,
                "body": json.dumps({"error": f"presigned URL 발급 실패: {e}"})}

    public_url = f"https://{S3_BUCKET}.s3.ap-northeast-1.amazonaws.com/{key}"

    return {
        "statusCode": 200,
        "headers":    HEADERS,
        "body":       json.dumps({"uploadUrl": upload_url, "publicUrl": public_url}),
    }
