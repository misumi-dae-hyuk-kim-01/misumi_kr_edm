import { seedAssets, seedTemplates } from "./data/mockData.js";
import {
  listCampaigns,
  createCampaign,
  updateCampaign,
  cloneCampaign,
  deleteCampaign as deleteCampaignFromApi
} from "./lib/api.js";

const STORAGE_KEY = "edm_app_state_v1";

function load() {
  let savedAssets = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      savedAssets = parsed.assets || null;
    }
  } catch (e) {
    console.warn("상태 로드 실패, 초기값 사용", e);
  }
  return {
    // 캠페인은 앱 시작 시 DynamoDB에서 불러옵니다.
    campaigns: [],
    // 에셋은 아직 브라우저 로컬 저장소를 사용합니다.
    assets: savedAssets || seedAssets(),
    // ⚠️ templates는 여기서 절대 localStorage 값을 쓰지 않고 항상 새로 계산합니다.
    // 템플릿은 개발자가 배포하는 마스터 데이터(실서비스: S3 + templates.json)라서,
    // mockData.js에 새 템플릿을 추가/수정하면 예전에 이 앱을 열어본 브라우저에서도
    // 다음 새로고침에 즉시 반영되어야 합니다. 여기서 캐시하면 "코드를 고쳤는데 안 바뀐다"는
    // 혼란의 원인이 됩니다.
    templates: seedTemplates()
  };
}

// 캠페인은 DynamoDB를 사용하고, 에셋만 데모용으로 브라우저 로컬에 저장합니다.
// 템플릿은 여기서 저장하지 않습니다 — mockData.js(→실서비스 S3)가 항상 단일 출처입니다.
const data = load();

function persistAssets() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    assets: data.assets
  }));
}

function normalizeCampaign(campaign) {
  const campaignId = campaign.campaignId || campaign.id;
  return {
    ...campaign,
    campaignId,
    // 기존 화면은 c.id를 사용하므로 DynamoDB 키를 화면용 id로도 연결합니다.
    id: campaignId
  };
}

function toApiCampaign(campaign) {
  const { id, ...apiCampaign } = campaign;
  return {
    ...apiCampaign,
    campaignId: apiCampaign.campaignId || id
  };
}

export const store = {
  get campaigns() { return data.campaigns; },
  get assets() { return data.assets; },
  get templates() { return data.templates; },

  getCampaign(id) {
    return data.campaigns.find(c => c.id === id || c.campaignId === id) || null;
  },

  async upsertCampaign(campaign) {
    const campaignId = campaign.campaignId || campaign.id;
    const idx = data.campaigns.findIndex(
      c => c.id === campaignId || c.campaignId === campaignId
    );
    const payload = toApiCampaign(campaign);
    const savedCampaign = idx >= 0
      ? await updateCampaign(campaignId, payload)
      : await createCampaign(payload);
    const normalized = normalizeCampaign(savedCampaign);

    if (idx >= 0) data.campaigns[idx] = normalized;
    else data.campaigns.unshift(normalized);

    return normalized;
  },

  async duplicateCampaign(id) {
    const src = this.getCampaign(id);
    if (!src) return null;

    const copy = normalizeCampaign(await cloneCampaign(id));
    data.campaigns.unshift(copy);
    return copy;
  },

  async deleteCampaign(id) {
    const result = await deleteCampaignFromApi(id);
    data.campaigns = data.campaigns.filter(
      c => c.id !== id && c.campaignId !== id
    );
    return result;
  },

  addAsset(asset) {
    data.assets.unshift(asset);
    persistAssets();
  },

  deleteAsset(id) {
    data.assets = data.assets.filter(a => a.id !== id);
    persistAssets();
  }
};

export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

export async function loadCampaignsFromApi() {
  const campaigns = await listCampaigns();
  data.campaigns = campaigns.map(normalizeCampaign);

  return data.campaigns;
}
