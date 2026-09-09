import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCampaignKey, buildLpDeployKey, currentTimestamp, parseCampaignKey,
  restoreLpDeploymentState, resolveCampaignKey, deployLpToS3, deployLpFilesToS3,
  LP_DEPLOY_CONFIG
} from "../admin/js/lib/lpDeploy.js";

const original = {
  id: "original",
  campaignId: "original",
  channel: "LP",
  draftData: {
    id: "original",
    slug: "summer-sale",
    campaignKey: "summer-sale_260909120000",
    deployedUrl: "https://example.invalid/original/index.html",
    catalogDeployedUrls: [{ name: "index.html", url: "https://example.invalid/original/index.html" }],
    catalogGroups: { products: { categories: [{ items: [{ code: "123" }] }] } }
  }
};

function legacyClone(id = "clone-a") {
  return { ...structuredClone(original), id, campaignId: id, sourceCampaignId: original.id };
}

function restore(campaign, source = original) {
  // buildInitialDraftLP also overrides draftData.id before restoring deployment state.
  return restoreLpDeploymentState({ ...campaign.draftData, id: campaign.id }, campaign, source);
}

test("legacy clone drops inherited deployment records without changing content or original", () => {
  const copy = legacyClone();
  const snapshot = structuredClone(copy);
  const draft = restore(copy);
  assert.equal(draft.campaignKey, "");
  assert.equal(draft.campaignKeyOwnerId, "");
  assert.equal(draft.deployedUrl, "");
  assert.deepEqual(draft.catalogDeployedUrls, []);
  assert.deepEqual(draft.catalogGroups, original.draftData.catalogGroups);
  assert.equal(draft.sourceCampaignId, original.id);
  assert.deepEqual(copy, snapshot);
  assert.equal(original.draftData.campaignKey, "summer-sale_260909120000");
});

test("a legacy clone saved once is still detected by its source deployment key", () => {
  const copy = legacyClone();
  copy.draftData.id = copy.id;
  assert.equal(restore(copy).campaignKey, "");
});

test("legacy top-level source key is checked as well", () => {
  const copy = legacyClone();
  copy.draftData.id = copy.id;
  assert.equal(restore(copy, { campaignKey: original.draftData.campaignKey }).campaignKey, "");
});

test("a clone cannot inherit a deployment key owned by another clone", () => {
  const copy = legacyClone("clone-b");
  copy.sourceCampaignId = "clone-a";
  copy.draftData.campaignKeyOwnerId = "clone-a";
  assert.equal(restore(copy, null).campaignKey, "");
});

test("an orphan legacy clone gets a new destination when ownership cannot be verified", () => {
  const copy = legacyClone();
  copy.draftData.id = copy.id;
  assert.equal(restore(copy, null).campaignKey, "");
});

test("an original campaign retains its published URL", async () => {
  const draft = restore(original, null);
  assert.equal(await resolveCampaignKey(draft), original.draftData.campaignKey);
  assert.equal(draft.deployedUrl, original.draftData.deployedUrl);
  assert.equal(draft.campaignKeyOwnerId, original.id);
});

test("an independently deployed legacy clone retains its own URL", () => {
  const copy = legacyClone();
  copy.draftData.id = copy.id;
  copy.draftData.campaignKey = "independent_260908120000";
  const draft = restore(copy);
  assert.equal(draft.campaignKey, "independent_260908120000");
  assert.equal(draft.campaignKeyOwnerId, copy.id);
});

test("same-second deployments of original and two clones use distinct destinations", async () => {
  const RealDate = globalThis.Date;
  globalThis.Date = class extends RealDate {
    constructor(...args) { super(...(args.length ? args : [Date.UTC(2026, 8, 9, 12)])); }
  };
  try {
    const originalDraft = { id: "original", slug: "summer-sale" };
    const a = restore(legacyClone("clone-a"));
    const b = restore(legacyClone("clone-b"));
    const timestamp = currentTimestamp();
    const keys = await Promise.all([originalDraft, a, b].map(resolveCampaignKey));
    assert.equal(new Set(keys).size, 3);
    assert.equal(buildCampaignKey(a.slug, timestamp, a.id), keys[1]);
    keys.forEach(key => {
      assert.match(key, /^[a-zA-Z0-9_-]+$/);
      assert.equal(parseCampaignKey(key).timestamp, timestamp);
    });
  } finally {
    globalThis.Date = RealDate;
  }
});

test("a saved clone reuses its own destination even if its source is deleted", async () => {
  const copy = legacyClone();
  const draft = restore(copy);
  const key = await resolveCampaignKey(draft);
  draft.deployedUrl = "https://example.invalid/clone/index.html";
  copy.draftData = JSON.parse(JSON.stringify(draft));
  const reopened = restore(copy, null);
  reopened.slug = "changed-slug";
  assert.equal(await resolveCampaignKey(reopened), key);
  assert.equal(reopened.deployedUrl, draft.deployedUrl);
});

test("single and multi-file clone deployment never writes the original object", async t => {
  const originalKey = buildLpDeployKey(original.draftData.campaignKey);
  const objects = new Map([[originalKey, "published original"]]);
  const signedKeys = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    if (url === LP_DEPLOY_CONFIG.deployApiUrl) {
      const { key } = JSON.parse(options.body);
      signedKeys.push(key);
      return Response.json({
        uploadUrl: `https://uploads.example.invalid/${encodeURIComponent(key)}`,
        publicUrl: `https://pages.example.invalid/${key}`
      });
    }
    assert.ok(url.startsWith("https://uploads.example.invalid/"), "unexpected network destination");
    const key = decodeURIComponent(new URL(url).pathname.slice(1));
    objects.set(key, options.body);
    return new Response(null, { status: 200 });
  });
  const draft = restore(legacyClone());
  const key = await resolveCampaignKey(draft);
  await deployLpToS3("clone page", key);
  const results = await deployLpFilesToS3([
    { name: "index.html", content: "clone index", contentType: "text/html" },
    { name: "economy_all.html", content: "clone catalogue", contentType: "text/html" }
  ], key);
  assert.ok(results.every(result => result.url && !result.error));
  assert.equal(objects.get(originalKey), "published original");
  assert.equal(objects.get(buildLpDeployKey(key)), "clone index");
  assert.ok(signedKeys.every(k => k.startsWith(`lp/campaigns/${key}/`)));
  assert.ok(signedKeys.every(k => !k.startsWith(`lp/campaigns/${original.draftData.campaignKey}/`)));
});
