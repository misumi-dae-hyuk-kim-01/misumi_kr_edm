// s3Upload.js(이미지 업로드)와 완전히 같은 패턴입니다 — CONFIG.deployApiUrl이 비어있으면
// 데모 모드로 동작합니다. 실제 연동 시 백엔드에 presigned URL 발급 엔드포인트가 필요합니다
// (S3_UPLOAD_CONFIG와 별개로 관리하는 이유: 이미지는 아무 채널이나 올릴 수 있는 자산이고,
// LP 배포는 "이 경로 = 이 캠페인" 규칙이 있는 별개의 관심사라서 CONFIG를 분리했습니다).
export const LP_DEPLOY_CONFIG = {
  deployApiUrl: "" // 예: "https://xxxx.execute-api.ap-northeast-2.amazonaws.com/deploy-lp"
};

// 캠페인마다 겹치지 않는 폴더가 필요합니다. 한글 캠페인명을 그대로 경로에 쓰면 URL
// 인코딩이 지저분해지므로, 이미 유니크하게 생성되는 draft.id를 폴더명으로 씁니다 —
// 사람이 알아볼 이름(캠페인명)은 캠페인 목록에만 남기고, 실제 경로는 id 하나로 통일합니다.
export function buildLpDeployKey(campaignId) {
  return `lp/${campaignId}/index.html`;
}

/**
 * @param {string} html assembleLpHtml()이 만든 완성 LP HTML
 * @param {string} campaignId 이 캠페인의 고유 id (draft.id) — 배포 경로를 결정합니다
 * @returns {Promise<string>} 배포된 페이지의 최종 URL
 */
export async function deployLpToS3(html, campaignId) {
  const key = buildLpDeployKey(campaignId);

  if (LP_DEPLOY_CONFIG.deployApiUrl) {
    const presignRes = await fetch(LP_DEPLOY_CONFIG.deployApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, contentType: "text/html" })
    });
    if (!presignRes.ok) throw new Error("배포 URL 발급 실패: " + presignRes.status);
    const { uploadUrl, publicUrl } = await presignRes.json();
    const putRes = await fetch(uploadUrl, { method: "PUT", body: html, headers: { "Content-Type": "text/html; charset=utf-8" } });
    if (!putRes.ok) throw new Error("S3 배포 실패: " + putRes.status);
    return publicUrl;
  }

  // 데모 모드 — 실제 배포 없이 흐름만 재현 (새로고침하면 사라지는 임시 URL)
  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
}

/**
 * ⚠️ 신상품카탈로그 등 "파일 하나가 아니라 여러 개"인 캠페인을 위한 배포 함수입니다.
 * style.css, script.js, 그룹별 html이 전부 같은 캠페인 폴더(lp/{campaignId}/) 안에
 * 나란히 올라갑니다 — deployLpToS3 하나를 파일별로 반복 호출하는 것과 동일한 효과이되,
 * 진행 상황을 콜백으로 알려주고 실패한 파일이 있어도 나머지는 계속 올립니다
 * (seriesApi.js의 fetchSeriesInfoBatch와 동일한 "부분 실패 허용" 원칙).
 *
 * @param {{name: string, content: string, contentType: string}[]} files
 *   name: 파일명(예: "style.css", "economy.html") · content: 파일 내용 문자열 ·
 *   contentType: "text/css" | "application/javascript" | "text/html"
 * @param {string} campaignId 배포 경로를 결정하는 캠페인 고유 id
 * @param {(done: number, total: number, fileName: string) => void} [onProgress]
 * @returns {Promise<{name: string, url: string, error?: string}[]>} 파일별 배포 결과
 *   (실패한 파일은 error 필드만 채워지고 url이 없음 — 호출부에서 실패 목록을 따로 보여주세요)
 */
export async function deployLpFilesToS3(files, campaignId, onProgress) {
  const results = [];
  for (const file of files) {
    const key = `lp/${campaignId}/${file.name}`;
    try {
      let url;
      if (LP_DEPLOY_CONFIG.deployApiUrl) {
        const presignRes = await fetch(LP_DEPLOY_CONFIG.deployApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, contentType: file.contentType })
        });
        if (!presignRes.ok) throw new Error("배포 URL 발급 실패: " + presignRes.status);
        const { uploadUrl, publicUrl } = await presignRes.json();
        const putRes = await fetch(uploadUrl, { method: "PUT", body: file.content, headers: { "Content-Type": file.contentType } });
        if (!putRes.ok) throw new Error("S3 배포 실패: " + putRes.status);
        url = publicUrl;
      } else {
        // 데모 모드 — 실제 배포 없이 흐름만 재현
        const blob = new Blob([file.content], { type: file.contentType });
        url = URL.createObjectURL(blob);
      }
      results.push({ name: file.name, url });
    } catch (e) {
      results.push({ name: file.name, error: e.message });
    }
    if (onProgress) onProgress(results.length, files.length, file.name);
  }
  return results;
}
