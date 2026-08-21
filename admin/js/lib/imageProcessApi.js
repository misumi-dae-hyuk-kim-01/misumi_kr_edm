// AI 가공 전용 — S3 저장은 하지 않습니다.
// "확인 후 업로드" 흐름: 이 함수는 가공된 이미지를 blob으로만 반환하고, 사용자가
// 미리보기를 확인한 뒤 s3Upload.js의 uploadToS3()를 호출해야 실제로 S3에 저장됩니다.
// IMAGE_PROCESS_CONFIG.apiUrl이 비어있으면 데모 모드로 동작합니다: 실제 AI 가공 없이
// 원본 파일을 그대로 미리보기용으로 돌려줍니다.
//
// 실제로 연동하려면 백엔드에 아래와 같은 엔드포인트가 필요합니다 (개발팀 협의 필요):
//   POST { file, instruction, purpose } → 가공된 이미지 바이너리(Content-Type: image/*)
// ⚠️ 서버는 이 요청에서 S3에 아무것도 저장하면 안 됩니다. 가공 결과를 바이너리로
// 그대로 응답에 실어 보내기만 하면 됩니다. 최종 저장은 사용자가 확정("이 결과로
// 업로드")한 뒤 별도의 uploadToS3() 흐름(=presigned URL)을 통해 이루어집니다.
export const IMAGE_PROCESS_CONFIG = {
  apiUrl: "" // 예: "https://xxxx.execute-api.ap-northeast-2.amazonaws.com/process-image"
};

/**
 * AI로 이미지를 가공하고, 그 결과를 미리보기용 blob으로 반환합니다.
 * ⚠️ S3에 저장하지 않습니다 — 확정 전 미리보기 단계에서만 사용하세요.
 * @param {File|Blob} file 원본(또는 리사이즈된) 이미지 파일
 * @param {string} instruction 이 이미지의 보정 요청 (선택, 비어있으면 "기본 보정") — 캠페인
 *   전체의 AI 프롬프트(카피 톤)와는 별개입니다. 이미지마다 원하는 보정이 다를 수 있고,
 *   카피 톤 지시가 이미지 가공 요청에 섞이면 오히려 혼란을 주므로 의도적으로 분리합니다.
 * @param {string} purpose 캠페인 목적 (참고용 컨텍스트)
 * @returns {Promise<Blob>} 가공된 이미지 blob (아직 S3에 저장되지 않은 미리보기용 상태)
 */
export async function processImage(file, instruction, purpose) {
  if (IMAGE_PROCESS_CONFIG.apiUrl) {
    const form = new FormData();
    form.append("file", file);
    form.append("instruction", instruction || "");
    form.append("purpose", purpose || "");
    const res = await fetch(IMAGE_PROCESS_CONFIG.apiUrl, { method: "POST", body: form });
    if (!res.ok) throw new Error("이미지 처리 실패: " + res.status);
    // 서버가 가공된 이미지를 바이너리로 직접 응답 (S3 저장은 여기서 하지 않음)
    return await res.blob();
  }
  // 데모 모드 — 실제 AI 가공 없이 원본 그대로 미리보기 (지연만 흉내)
  await new Promise(r => setTimeout(r, 900));
  return file;
}