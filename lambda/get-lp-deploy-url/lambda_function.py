"""
fn-get-lp-deploy-url
---------------------
프론트엔드(admin/js/lib/lpDeploy.js)가 완성된 LP HTML(및 style.css/script.js 등 동반 파일)을
S3에 직접 업로드할 수 있도록 presigned PUT URL을 발급해주는 함수. get-upload-url과 달리
파일명을 서버가 새로 짓지 않고, 프론트가 넘긴 key를 그대로 신뢰해서 씁니다 — LP는
"이 캠페인 id = 이 폴더"라는 고정 규칙이 있어야 같은 캠페인의 여러 파일(index.html,
style.css, script.js)이 같은 폴더에 모이기 때문입니다(buildLpDeployKey 참고).
그래서 key를 그대로 믿는 대신, "lp/" 프리픽스 강제 + 상위 경로 이탈(..) 차단으로
버킷 내 다른 위치에 덮어쓰는 것을 막습니다.

요청  : POST { key, contentType }
응답  : { uploadUrl, publicUrl }

환경변수
  S3_BUCKET   : kor-smartlp
  URL_EXPIRES : presigned URL 유효시간(초), 기본 300

주의: kor-smartlp 버킷은 ap-northeast-1(도쿄)에 있음 — ap-northeast-2로 서명하면
S3가 AuthorizationQueryParametersError를 반환함 (get-upload-url과 동일한 주의사항).
"""

import json
import os
import re
import boto3

S3_BUCKET   = os.environ.get("S3_BUCKET",   "kor-smartlp")
URL_EXPIRES = int(os.environ.get("URL_EXPIRES", "300"))

s3 = boto3.client("s3", region_name="ap-northeast-1")

HEADERS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type":                 "application/json",
}

# 허용하는 key 형태: lp/campaigns/{campaignKey}/{fileName} 또는
# lp/shared/{namespace}/{fileName} (lpDeploy.js의 buildLpDeployKey/
# deployLpFilesToS3/deploySharedAssetsToS3 참고) — campaignKey·namespace·
# fileName 모두 경로 구분자나 ".."를 포함할 수 없음. draft.id가 항상 안전한
# 문자로 생성된다는 프론트 쪽 전제를 여기서도 다시 한번 서버 측에서 강제합니다
# (신뢰 경계는 항상 서버에서 검증).
LP_KEY_PATTERN = re.compile(r"^lp/(campaigns|shared)/[a-zA-Z0-9_-]+/[a-zA-Z0-9_.-]+$")


def lambda_handler(event, context):

    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS" \
       or event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": HEADERS, "body": ""}

    try:
        if "body" in event and event["body"]:
            body = json.loads(event["body"]) if isinstance(event["body"], str) else event["body"]
        else:
            body = event
    except Exception as e:
        return {"statusCode": 400, "headers": HEADERS,
                "body": json.dumps({"error": f"바디 파싱 실패: {e}"})}

    key          = body.get("key")
    content_type = body.get("contentType", "application/octet-stream")

    if not key or not LP_KEY_PATTERN.match(key):
        return {"statusCode": 400, "headers": HEADERS,
                "body": json.dumps({"error": "key가 없거나 허용된 형식(lp/campaigns/{campaignKey}/{fileName} 또는 lp/shared/{namespace}/{fileName})이 아닙니다."})}

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
