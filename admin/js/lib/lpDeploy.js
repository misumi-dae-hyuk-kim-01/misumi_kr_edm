// s3Upload.js(이미지 업로드)와 완전히 같은 패턴입니다 — CONFIG.deployApiUrl이 비어있으면
// 데모 모드로 동작합니다. 실제 연동 시 백엔드에 presigned URL 발급 엔드포인트가 필요합니다
// (S3_UPLOAD_CONFIG와 별개로 관리하는 이유: 이미지는 아무 채널이나 올릴 수 있는 자산이고,
// LP 배포는 "이 경로 = 이 캠페인" 규칙이 있는 별개의 관심사라서 CONFIG를 분리했습니다).
export const LP_DEPLOY_CONFIG = {
  deployApiUrl: "" // 예: "https://xxxx.execute-api.ap-northeast-2.amazonaws.com/deploy-lp"
};

// findNextAvailableSeq()의 HEAD 요청, deploySharedAssetsToS3()의 스킵 시 URL 조립에
// 공통으로 쓰입니다 — 두 곳에 하드코딩하지 않고 한 곳에서 관리합니다.
export const S3_BUCKET_BASE_URL = "https://kor-smartlp.s3.ap-northeast-1.amazonaws.com";

// 캠페인마다 겹치지 않는 폴더가 필요합니다. 한글 캠페인명을 그대로 경로에 쓰면 URL
// 인코딩이 지저분해지므로, 이미 유니크하게 생성되는 draft.id를 폴더명으로 씁니다 —
// 사람이 알아볼 이름(캠페인명)은 캠페인 목록에만 남기고, 실제 경로는 id 하나로 통일합니다.
export function buildLpDeployKey(campaignKey) {
  return `lp/campaigns/${campaignKey}/index.html`;
}

/**
 * @param {string} html assembleLpHtml()이 만든 완성 LP HTML
 * @param {string} campaignId 이 캠페인의 고유 id (draft.id) — 배포 경로를 결정합니다
 * @returns {Promise<string>} 배포된 페이지의 최종 URL
 */
export async function deployLpToS3(html, campaignKey) {
  const key = buildLpDeployKey(campaignKey);

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
export async function deployLpFilesToS3(files, campaignKey, onProgress) {
  const results = [];
  for (const file of files) {
    const key = `lp/campaigns/${campaignKey}/${file.name}`;
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

// ⚠️ v2(2026-09) 폴더구조 확정 이후: shared/엔 이제 common.js 하나만 남습니다
// (카탈로그/경제형라인업/Evolution의 CSS/JS는 campaigns/{key}/ 안으로 되돌아감 —
// "배포된 페이지는 재배포 전까지 안 바뀐다"는 원칙과 shared 방식이 어긋났기
// 때문입니다. LP_S3_최종확정.md 참고). 그래서 예전엔 템플릿마다 있던 버전
// 상수(CATALOG_SHARED_ASSET_VERSION 등)가 이제 common.js용 하나만 필요합니다 —
// 그 상수(LP_SHELL_SCRIPT_VERSION)는 blocksLP.js에 있습니다.

/**
 * ⚠️ 캠페인마다 달라지는 파일(deployLpFilesToS3)과 달리, 이 함수가 다루는 파일은
 * "도구 코드가 바뀔 때만 바뀌는, 모든 캠페인이 공유하는 자산"입니다(신상품카탈로그의
 * style.css/script.js가 대표적 — 마케터가 뭘 입력해도 내용이 절대 안 바뀝니다).
 * 캠페인 폴더(lp/{campaignId}/) 안이 아니라 lp/shared/{namespace}/ 밑의 고정 경로에
 * 올라가므로, 캠페인 100개를 배포해도 이 파일은 딱 1벌만 존재합니다.
 *
 * localStorage에 "이 버전을 이미 배포했는지"를 기록해둬서, 같은 브라우저에서
 * 반복 배포할 때 불필요한 재업로드를 건너뜁니다 — 다만 이건 그 브라우저 안에서만
 * 유효한 캐시라, 다른 PC에서 처음 배포할 땐 다시 한 번 실제로 업로드됩니다
 * (파일 내용이 결국 똑같으므로 덮어써도 안전합니다 — 그냥 "최적화"일 뿐입니다).
 *
 * @param {string} namespace 예: "catalog" → lp/shared/catalog/ 밑에 저장
 * @param {{name: string, content: string, contentType: string}[]} files
 * @param {string} version 이 자산의 버전 표시 — 바뀌면 강제로 재업로드
 */
export async function deploySharedAssetsToS3(namespace, files, version) {
  const cacheKey = `lp-shared-asset-version:${namespace}`;
  const alreadyDeployedVersion = localStorage.getItem(cacheKey);
  if (alreadyDeployedVersion === version) {
    return files.map(f => ({
      name: f.name,
      url: `${S3_BUCKET_BASE_URL}/lp/shared/${namespace}/${f.name}`,
      skipped: true
    }));
  }

  const results = [];
  for (const file of files) {
    const key = `lp/shared/${namespace}/${file.name}`;
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
        const blob = new Blob([file.content], { type: file.contentType });
        url = URL.createObjectURL(blob);
      }
      results.push({ name: file.name, url });
    } catch (e) {
      results.push({ name: file.name, error: e.message });
    }
  }
  if (results.every(r => !r.error)) localStorage.setItem(cacheKey, version);
  return results;
}

// ==========================================================================
// 캠페인 키 규칙: {slug}_{YYMM}_{seq}
// ⚠️ 슬러그 안에 언더스코어가 몇 개 있든 안전하게 다시 쪼갤 수 있도록,
// 파싱은 반드시 "뒤에서부터" 합니다 — 앞에서부터 split하면 슬러그에 포함된
// 언더스코어와 구분자용 언더스코어를 구별할 수 없습니다. 이 파일 밖에서
// 이 키를 직접 split하지 말고, 항상 parseCampaignKey()를 거치세요.
// ==========================================================================

/** 마케터가 뭘 입력하든(한글/공백/특수문자 포함) 영문 소문자·숫자·하이픈·
 *  언더스코어만 남기고 나머지는 하이픈으로 바꿉니다. 결과가 비어버리면
 *  기본값("campaign")을 씁니다 — 빈 슬러그로 인해 "_2603_1"처럼 앞이 잘려
 *  보이는 키가 생기는 걸 막기 위함입니다. */
export function sanitizeSlug(input) {
  const slug = String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
  return slug || "campaign";
}

/** 현재 연월을 YYMM 형식으로. (예: 2026년 3월 → "2603") */
export function currentYYMM() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return yy + mm;
}

export function buildCampaignKey(slug, yyyymm, seq) {
  return `${sanitizeSlug(slug)}_${yyyymm}_${seq}`;
}

/** ⚠️ 항상 뒤에서부터 파싱합니다 — 슬러그에 언더스코어가 있어도 안전합니다. */
export function parseCampaignKey(key) {
  const parts = String(key || "").split("_");
  if (parts.length < 3) return { slug: key, yyyymm: "", seq: "" };
  const seq = parts.pop();
  const yyyymm = parts.pop();
  const slug = parts.join("_");
  return { slug, yyyymm, seq };
}

/** 이 슬러그로 이미 배포된 게 있는지, S3에서 순번을 늘려가며 확인합니다.
 *  ⚠️ 이 함수는 "여러 명이 동시에 만들 때 완전히 충돌을 막는" 용도가
 *  아닙니다 — 그러려면 presigned URL 발급 시 IfNoneMatch 옵션이 필요하고,
 *  이건 백엔드(get-upload-url Lambda) 수정이 있어야 완성됩니다(별도 확인 필요).
 *  이 함수는 그 전까지 쓰는 차선책으로, "이미 존재하는 순번인지 HEAD 요청으로
 *  확인 후 다음 번호를 추천"하는 수준입니다 — 아주 드물게(동시 클릭) 겹칠 수
 *  있습니다. IfNoneMatch가 준비되면 이 함수 대신 "실패 시 seq+1 재시도" 루프로
 *  교체하는 게 맞습니다. */
export async function findNextAvailableSeq(slug, yyyymm, bucketBaseUrl) {
  const safeSlug = sanitizeSlug(slug);
  let seq = 1;
  // 최대 999번까지만 시도 — 그 이상 겹치는 건 비정상 상황으로 보고 그대로 반환
  while (seq < 999) {
    const key = buildCampaignKey(safeSlug, yyyymm, seq);
    try {
      const res = await fetch(`${bucketBaseUrl}/lp/campaigns/${key}/index.html`, { method: "HEAD" });
      if (res.status === 404) return seq; // 없으면 이 번호 사용 가능
    } catch (e) {
      // 네트워크 오류 등 확인 불가 시, 안전하게 이 번호를 그대로 추천
      return seq;
    }
    seq++;
  }
  return seq;
}

/**
 * ⚠️ 캠페인 키는 한 번 정해지면 절대 바뀌면 안 됩니다 — URL이 그대로 바뀌는
 * 것이기 때문입니다("배포된 페이지는 재배포 전까지 절대 안 바뀐다" 원칙,
 * LP_S3_최종확정.md 참고). 이 함수가 그 "한 번만 정하고 그 다음부턴 재사용"을
 * 담당합니다:
 *   - draft에 이미 campaignKey가 있으면(=이전에 한 번이라도 배포/키 확정을
 *     했으면) 그대로 반환합니다 — slug를 그 사이에 고쳤어도 무시합니다.
 *   - 없으면 지금 draft.slug로 새로 만들고, draft.campaignKey에 저장해서
 *     잠급니다.
 * 호출하는 쪽(generatorLP.js)에서 draft 객체를 직접 변형(mutate)한다는 점에
 * 주의하세요 — 순수 함수가 아니라 "확정 + 저장"을 한 번에 하는 함수입니다.
 * @param {object} draft
 * @returns {Promise<string>} 확정된 캠페인 키
 */
export async function resolveCampaignKey(draft) {
  if (draft.campaignKey) return draft.campaignKey;
  const yyyymm = currentYYMM();
  const seq = await findNextAvailableSeq(draft.slug, yyyymm, S3_BUCKET_BASE_URL);
  const key = buildCampaignKey(draft.slug, yyyymm, seq);
  draft.campaignKey = key;
  return key;
}
