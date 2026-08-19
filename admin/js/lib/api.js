const API_BASE_URL =
  "https://8sokw2hakd.execute-api.ap-northeast-1.amazonaws.com";


async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  let data = null;

  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      `API 요청 실패 (${response.status})`;

    throw new Error(message);
  }

  return data;
}


// 캠페인 전체 목록
export async function listCampaigns() {
  const data = await request("/campaigns");

  return data.items || [];
}


// 캠페인 1건 조회
export async function getCampaign(campaignId) {
  return request(
    `/campaigns/${encodeURIComponent(campaignId)}`
  );
}


// 신규 캠페인 생성
export async function createCampaign(campaign) {
  return request("/campaigns", {
    method: "POST",
    body: JSON.stringify(campaign)
  });
}


// 캠페인 수정
export async function updateCampaign(campaignId, campaign) {
  return request(
    `/campaigns/${encodeURIComponent(campaignId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(campaign)
    }
  );
}


// 캠페인 복제
export async function cloneCampaign(campaignId) {
  return request(
    `/campaigns/${encodeURIComponent(campaignId)}/clone`,
    {
      method: "POST"
    }
  );
}


// 캠페인 삭제
export async function deleteCampaign(campaignId) {
  return request(
    `/campaigns/${encodeURIComponent(campaignId)}`,
    {
      method: "DELETE"
    }
  );
}
