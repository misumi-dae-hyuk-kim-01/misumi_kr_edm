import { seedCampaigns, seedAssets, seedTemplates } from "./data/mockData.js";

const STORAGE_KEY = "edm_app_state_v1";

function load() {
  let savedCampaigns = null;
  let savedAssets = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      savedCampaigns = parsed.campaigns || null;
      savedAssets = parsed.assets || null;
    }
  } catch (e) {
    console.warn("상태 로드 실패, 초기값 사용", e);
  }
  return {
    // 캠페인/에셋은 사용자가 직접 만들고 편집하는 데이터라 이전 방문 기록을 이어서 씁니다.
    campaigns: savedCampaigns || seedCampaigns(),
    assets: savedAssets || seedAssets(),
    // ⚠️ templates는 여기서 절대 localStorage 값을 쓰지 않고 항상 새로 계산합니다.
    // 템플릿은 개발자가 배포하는 마스터 데이터(실서비스: S3 + templates.json)라서,
    // mockData.js에 새 템플릿을 추가/수정하면 예전에 이 앱을 열어본 브라우저에서도
    // 다음 새로고침에 즉시 반영되어야 합니다. 여기서 캐시하면 "코드를 고쳤는데 안 바뀐다"는
    // 혼란의 원인이 됩니다.
    templates: seedTemplates()
  };
}

// 캠페인/에셋은 데모용으로 브라우저 로컬에 저장합니다 (실서비스: 캠페인→DynamoDB, 에셋→S3).
// 템플릿은 여기서 저장하지 않습니다 — mockData.js(→실서비스 S3)가 항상 단일 출처입니다.
const data = load();

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    campaigns: data.campaigns,
    assets: data.assets
  }));
}

export const store = {
  get campaigns() { return data.campaigns; },
  get assets() { return data.assets; },
  get templates() { return data.templates; },

  getCampaign(id) {
    return data.campaigns.find(c => c.id === id) || null;
  },

  upsertCampaign(campaign) {
    const idx = data.campaigns.findIndex(c => c.id === campaign.id);
    if (idx >= 0) data.campaigns[idx] = campaign;
    else data.campaigns.unshift(campaign);
    persist();
  },

  duplicateCampaign(id) {
    const src = this.getCampaign(id);
    if (!src) return null;
    const copy = {
      ...src,
      id: "c" + Date.now(),
      name: src.name + " (복제)",
      status: "초안",
      createdAt: new Date().toISOString().slice(0, 10).replace(/-/g, ".")
    };
    data.campaigns.unshift(copy);
    persist();
    return copy;
  },

  deleteCampaign(id) {
    data.campaigns = data.campaigns.filter(c => c.id !== id);
    persist();
  },

  addAsset(asset) {
    data.assets.unshift(asset);
    persist();
  },

  deleteAsset(id) {
    data.assets = data.assets.filter(a => a.id !== id);
    persist();
  }
};

export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}
