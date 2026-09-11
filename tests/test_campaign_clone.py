"""Clone API regression tests; AWS services are mocked and no network is used."""
import importlib.util
import json
import sys
import unittest
from copy import deepcopy
from pathlib import Path
from types import ModuleType
from unittest.mock import MagicMock, patch


def load_handler():
    boto3 = ModuleType("boto3")
    boto3.resource = MagicMock()
    botocore = ModuleType("botocore")
    exceptions = ModuleType("botocore.exceptions")
    exceptions.ClientError = type("ClientError", (Exception,), {})
    module_path = Path(__file__).resolve().parents[1] / "lambda/misumi-kr-edm-campaign/lambda_function.py"
    spec = importlib.util.spec_from_file_location("campaign_handler", module_path)
    module = importlib.util.module_from_spec(spec)
    with patch.dict(sys.modules, {"boto3": boto3, "botocore": botocore, "botocore.exceptions": exceptions}):
        spec.loader.exec_module(module)
    return module


handler = load_handler()


class CampaignCloneTests(unittest.TestCase):
    def setUp(self):
        self.source = {
            "campaignId": "original", "channel": "LP", "name": "Summer sale",
            "campaignKey": "summer_260909120000",
            "deployedUrl": "https://example.invalid/original",
            "catalogDeployedUrls": [{"name": "index.html", "url": "https://example.invalid/original"}],
            "draftData": {
                "id": "original", "campaignName": "Summer sale", "slug": "summer",
                "campaignKey": "summer_260909120000", "campaignKeyOwnerId": "original",
                "deployedUrl": "https://example.invalid/original",
                "catalogDeployedUrls": [{"name": "index.html", "url": "https://example.invalid/original"}],
                "catalogGroups": {"products": {"categories": [{"items": [{"code": "123"}]}]}},
            },
        }
        handler.table = MagicMock()
        handler.table.get_item.return_value = {"Item": self.source}
        self.event = {
            "requestContext": {"http": {"method": "POST"}},
            "rawPath": "/campaigns/original/clone", "pathParameters": {"campaignId": "original"},
        }

    def clone(self):
        result = handler.lambda_handler(self.event, None)
        self.assertEqual(result["statusCode"], 201)
        return json.loads(result["body"])

    def test_clone_clears_all_deployment_metadata_and_updates_identity(self):
        cloned = self.clone()
        self.assertNotEqual(cloned["campaignId"], self.source["campaignId"])
        self.assertEqual(cloned["sourceCampaignId"], "original")
        self.assertEqual(cloned["status"], "초안")
        self.assertEqual(cloned["draftData"]["id"], cloned["campaignId"])
        self.assertEqual(cloned["draftData"]["campaignName"], cloned["name"])
        self.assertEqual(cloned["draftData"]["sourceCampaignId"], "original")
        for target in (cloned, cloned["draftData"]):
            self.assertEqual(target["campaignKey"], "")
            self.assertEqual(target["campaignKeyOwnerId"], "")
            self.assertEqual(target["deployedUrl"], "")
            self.assertEqual(target["catalogDeployedUrls"], [])
        saved = handler.table.put_item.call_args.kwargs
        self.assertEqual(saved["Item"], cloned)
        self.assertEqual(saved["ConditionExpression"], "attribute_not_exists(campaignId)")

    def test_original_and_nested_content_are_not_modified_or_shared(self):
        snapshot = deepcopy(self.source)
        cloned = self.clone()
        self.assertEqual(self.source, snapshot)
        self.assertEqual(cloned["draftData"]["catalogGroups"], snapshot["draftData"]["catalogGroups"])
        saved = handler.table.put_item.call_args.kwargs["Item"]
        saved["draftData"]["catalogGroups"]["products"]["categories"][0]["items"][0]["code"] = "changed"
        self.assertEqual(self.source, snapshot)

    def test_rapid_clones_get_distinct_ids(self):
        with patch.object(handler.time, "time", return_value=1234567890):
            first, second = self.clone(), self.clone()
        self.assertNotEqual(first["campaignId"], second["campaignId"])

    def test_cloning_a_clone_sets_immediate_source_and_clears_previous_owner(self):
        self.source["sourceCampaignId"] = "ancestor"
        self.source["draftData"]["sourceCampaignId"] = "ancestor"
        cloned = self.clone()
        self.assertEqual(cloned["sourceCampaignId"], "original")
        self.assertEqual(cloned["draftData"]["sourceCampaignId"], "original")
        self.assertEqual(cloned["draftData"]["campaignKeyOwnerId"], "")

    def test_legacy_lp_without_draft_data_can_be_cloned(self):
        del self.source["draftData"]
        self.assertEqual(self.clone()["campaignKey"], "")

    def test_edm_content_is_preserved(self):
        self.source["channel"] = "EDM"
        self.source["draftData"] = {"templateId": "edm-template", "fieldValues": {"headline": "Hello"}}
        cloned = self.clone()
        self.assertEqual(cloned["draftData"]["fieldValues"], {"headline": "Hello"})
        self.assertEqual(cloned["draftData"]["templateId"], "edm-template")

    def test_missing_source_does_not_write(self):
        handler.table.get_item.return_value = {}
        self.assertEqual(handler.lambda_handler(self.event, None)["statusCode"], 404)
        handler.table.put_item.assert_not_called()


if __name__ == "__main__":
    unittest.main()
