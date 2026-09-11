import json
import time
import uuid
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import boto3
from botocore.exceptions import ClientError


dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("misumi-kr-edm-campaigns")

# ⚠️ Lambda는 UTC로 돕니다. 날짜 문자열은 프론트(admin/js/lib/datetime.js)가 만드는
# 값과 같은 규칙이어야 목록 정렬(문자열 비교)이 어긋나지 않으므로, 반드시 한국시간
# 기준으로 만듭니다 — UTC로 찍으면 오전 9시 이전엔 하루 전 날짜가 됩니다.
KST = timezone(timedelta(hours=9))


def now_date() -> str:
    """'2026.09.10' — 작성일"""
    return datetime.now(KST).strftime("%Y.%m.%d")


def now_datetime() -> str:
    """'2026.09.10 14:32' — 최종수정일(같은 날 여러 번 갱신되므로 시:분까지)"""
    return datetime.now(KST).strftime("%Y.%m.%d %H:%M")


def to_jsonable(value):
    if isinstance(value, Decimal):
        if value % 1 == 0:
            return int(value)
        return float(value)

    if isinstance(value, list):
        return [to_jsonable(v) for v in value]

    if isinstance(value, dict):
        return {k: to_jsonable(v) for k, v in value.items()}

    return value


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json; charset=utf-8"
        },
        "body": json.dumps(
            to_jsonable(body),
            ensure_ascii=False
        )
    }


def parse_body(event):
    body = event.get("body")

    if not body:
        return {}

    if isinstance(body, dict):
        return body

    return json.loads(body)


def lambda_handler(event, context):

    # API Gateway HTTP API Payload 2.0
    request_context = event.get("requestContext", {})
    http = request_context.get("http", {})

    method = http.get("method")
    path = event.get("rawPath", "")
    path_parameters = event.get("pathParameters") or {}

    # --------------------------------------------------
    # GET /campaigns
    # 캠페인 전체 목록 조회
    # --------------------------------------------------
    if method == "GET" and path == "/campaigns":
        result = table.scan()
        items = result.get("Items", [])

        return response(
            200,
            {
                "items": items,
                "count": len(items)
            }
        )

    # --------------------------------------------------
    # POST /campaigns
    # 신규 캠페인 생성
    # --------------------------------------------------
    if method == "POST" and path == "/campaigns":
        campaign = parse_body(event)

        if not campaign:
            return response(
                400,
                {
                    "message": "campaign data is required"
                }
            )

        campaign_id = campaign.get("campaignId")

        if not campaign_id:
            campaign_id = "c" + str(int(time.time() * 1000))

        campaign["campaignId"] = campaign_id

        try:
            table.put_item(
                Item=campaign,
                ConditionExpression="attribute_not_exists(campaignId)"
            )

        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                return response(
                    409,
                    {
                        "message": "Campaign already exists"
                    }
                )

            raise

        return response(
            201,
            campaign
        )

    campaign_id = path_parameters.get("campaignId")

    # --------------------------------------------------
    # GET /campaigns/{campaignId}
    # 캠페인 상세 조회
    # --------------------------------------------------
    if method == "GET" and campaign_id:
        result = table.get_item(
            Key={
                "campaignId": campaign_id
            }
        )

        item = result.get("Item")

        if not item:
            return response(
                404,
                {
                    "message": "Campaign not found"
                }
            )

        return response(
            200,
            item
        )

    # --------------------------------------------------
    # PATCH /campaigns/{campaignId}
    # 캠페인 수정
    # --------------------------------------------------
    if method == "PATCH" and campaign_id:
        campaign = parse_body(event)

        if not campaign:
            return response(
                400,
                {
                    "message": "campaign data is required"
                }
            )

        campaign.pop("campaignId", None)

        if not campaign:
            return response(
                400,
                {
                    "message": "No fields to update"
                }
            )

        expression_names = {}
        expression_values = {}
        update_parts = []

        for index, (key, value) in enumerate(campaign.items()):
            name_key = f"#field{index}"
            value_key = f":value{index}"

            expression_names[name_key] = key
            expression_values[value_key] = value
            update_parts.append(f"{name_key} = {value_key}")

        try:
            result = table.update_item(
                Key={
                    "campaignId": campaign_id
                },
                UpdateExpression="SET " + ", ".join(update_parts),
                ExpressionAttributeNames=expression_names,
                ExpressionAttributeValues=expression_values,
                ConditionExpression="attribute_exists(campaignId)",
                ReturnValues="ALL_NEW"
            )

        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                return response(
                    404,
                    {
                        "message": "Campaign not found"
                    }
                )

            raise

        return response(
            200,
            result.get("Attributes")
        )

    # --------------------------------------------------
    # DELETE /campaigns/{campaignId}
    # 캠페인 삭제
    # --------------------------------------------------
    if method == "DELETE" and campaign_id:
        try:
            result = table.delete_item(
                Key={
                    "campaignId": campaign_id
                },
                ConditionExpression="attribute_exists(campaignId)",
                ReturnValues="ALL_OLD"
            )

        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                return response(
                    404,
                    {
                        "message": "Campaign not found"
                    }
                )

            raise

        return response(
            200,
            {
                "message": "Campaign deleted",
                "campaign": result.get("Attributes")
            }
        )

    # --------------------------------------------------
    # POST /campaigns/{campaignId}/clone
    # 캠페인 복제
    # --------------------------------------------------
    if (
        method == "POST"
        and campaign_id
        and path.endswith("/clone")
    ):
        result = table.get_item(
            Key={
                "campaignId": campaign_id
            }
        )

        source = result.get("Item")

        if not source:
            return response(
                404,
                {
                    "message": "Campaign not found"
                }
            )

        new_campaign_id = "c" + uuid.uuid4().hex

        cloned = deepcopy(source)

        cloned["campaignId"] = new_campaign_id
        cloned.pop("id", None)
        cloned["name"] = source.get("name", "") + " (복제)"
        cloned["status"] = "초안"
        cloned["sourceCampaignId"] = campaign_id
        # ⚠️ deepcopy라 원본의 작성일/최종수정일까지 그대로 물려받고 있었습니다. 복제본은
        # "지금 새로 만들어진 캠페인"이므로 원본의 날짜를 쓰면 안 됩니다 — 목록이 최종수정일
        # 내림차순으로 정렬되므로, 갱신하지 않으면 방금 복제한 것이 새로고침 후 원본 날짜
        # 위치로 내려가 한참 아래에서 찾아야 했습니다.
        cloned["createdAt"] = now_date()
        cloned["updatedAt"] = now_datetime()

        draft = cloned.get("draftData")
        if isinstance(draft, dict):
            draft["id"] = new_campaign_id
            draft["campaignName"] = cloned["name"]

        if cloned.get("channel") == "LP":
            # 배포 경로와 배포 기록은 복제본이 새로 만들어야 합니다.
            # 예전 데이터의 최상위 필드도 비워서 프론트의 fallback을 차단합니다.
            for target in [cloned] + ([draft] if isinstance(draft, dict) else []):
                target["campaignKey"] = ""
                target["campaignKeyOwnerId"] = ""
                target["deployedUrl"] = ""
                target["catalogDeployedUrls"] = []
            if isinstance(draft, dict):
                draft["sourceCampaignId"] = campaign_id

        table.put_item(
            Item=cloned,
            ConditionExpression="attribute_not_exists(campaignId)"
        )

        return response(
            201,
            cloned
        )

    return response(
        404,
        {
            "message": "Route not found"
        }
    )
