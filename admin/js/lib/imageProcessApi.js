// ⚠️ 실서비스 연동 지점 (assets.js의 CONFIG.uploadApiUrl과 동일한 패턴)
// IMAGE_PROCESS_CONFIG.apiUrl이 비어있으면 데모 모드로 동작합니다: 실제 AI 가공/S3 저장 없이
// 브라우저 안에서만 유효한 임시 URL을 만들어서 흐름만 미리 볼 수 있게 합니다.
//
// 실제로 연동하려면 백엔드에 아래와 같은 엔드포인트가 필요합니다 (개발팀 협의 필요):
//   POST { file, instruction, purpose } → { url }
// 파일과 보정 요청(instruction)을 같이 보내면, 서버가 AI 가공 후 S3에 저장하고
// 최종 이미지 URL을 반환합니다. CLI 업로드 파이프라인도 이 엔드포인트를 그대로 호출하는
// 얇은 래퍼가 되므로, 생성기 쪽과 CLI 쪽이 같은 백엔드를 공유합니다.
export const IMAGE_PROCESS_CONFIG = {
  apiUrl: "" // 예: "https://xxxx.execute-api.ap-northeast-2.amazonaws.com/process-image"
};

/**
 * @param {File} file 업로드한 원본 이미지 파일
 * @param {string} instruction 이 이미지의 보정 요청 (선택, 비어있으면 "기본 보정") — 캠페인
 *   전체의 AI 프롬프트(카피 톤)와는 별개입니다. 이미지마다 원하는 보정이 다를 수 있고,
 *   카피 톤 지시가 이미지 가공 요청에 섞이면 오히려 혼란을 주므로 의도적으로 분리합니다.
 * @param {string} purpose 캠페인 목적 (참고용 컨텍스트)
 * @returns {Promise<string>} 가공 완료된 이미지의 최종 URL
 */
export async function processImage(file, instruction, purpose) {
  if (IMAGE_PROCESS_CONFIG.apiUrl) {
    const form = new FormData();
    form.append("file", file);
    form.append("instruction", instruction || "");
    form.append("purpose", purpose || "");
    const res = await fetch(IMAGE_PROCESS_CONFIG.apiUrl, { method: "POST", body: form });
    if (!res.ok) throw new Error("이미지 처리 실패: " + res.status);
    const { url } = await res.json();
    return url;
  }
  // 데모 모드 — 실제 AI 가공/S3 저장 없이 흐름만 재현 (새로고침하면 사라지는 임시 URL)
  await new Promise(r => setTimeout(r, 900));
  return URL.createObjectURL(file);
}
