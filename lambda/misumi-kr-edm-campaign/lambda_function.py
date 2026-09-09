import json
import time
from decimal import Decimal

import boto3
from botocore.exceptions import ClientError


dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("misumi-kr-edm-campaigns")


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

        new_campaign_id = "c" + str(int(time.time() * 1000))

        cloned = dict(source)

        cloned["campaignId"] = new_campaign_id
        cloned["name"] = source.get("name", "") + " (복제)"
        cloned["status"] = "초안"
        cloned["sourceCampaignId"] = campaign_id

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
    