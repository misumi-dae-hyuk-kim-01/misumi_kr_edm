// AI 이미지 생성 전용 — S3 저장은 하지 않습니다.
// "확인 후 업로드" 흐름: 이 함수는 생성된 이미지를 blob으로만 반환하고, 사용자가
// 미리보기를 확인한 뒤 s3Upload.js의 uploadToS3()를 호출해야 실제로 S3에 저장됩니다.
// IMAGE_PROCESS_CONFIG.apiUrl이 비어있으면 데모 모드로 동작합니다.
//
// ⚠️ 2026-08 변경: 예전엔 "기존 이미지 1장을 고치는 것"(processImage)과 "참고 이미지
// 여러 장을 보고 새로 만드는 것"(composeImageFromReferences)을 별도 함수·별도 UI
// 모드로 나눠뒀었습니다. 그런데 "편집인지 합성인지"를 사용자가 버튼으로 미리 골라야
// 하는 게 오히려 번거롭고, 실제로는 그 경계가 애매한 요청도 많습니다(예: "이 사진
// 배경을 저 참고 이미지 분위기로 바꿔줘"는 편집이자 합성). 그래서 하나로 합쳤습니다 —
// file과 referenceUrls를 둘 다(또는 하나만) 넘기고, 편집/합성 여부는 AI가 지시문과
// 입력 구성을 보고 알아서 판단하게 합니다. 코드가 미리 갈라치지 않습니다.
//
// 실제로 연동하려면 백엔드에 아래와 같은 엔드포인트가 필요합니다 (개발팀·AI팀 협의 필요):
//   POST (multipart/form-data) { file?, referenceUrls[]?, instruction, purpose }
//     → 생성/편집된 이미지 바이너리(Content-Type: image/*)
// ⚠️ 서버는 이 요청에서 S3에 아무것도 저장하면 안 됩니다. 결과를 바이너리로 그대로
// 응답에 실어 보내기만 하면 됩니다. 최종 저장은 사용자가 확정한 뒤 별도의
// uploadToS3() 흐름(=presigned URL)을 통해 이루어집니다.
export const IMAGE_PROCESS_CONFIG = {
  apiUrl: "" // 예: "https://xxxx.execute-api.ap-northeast-2.amazonaws.com/generate-image"
};

/**
 * AI로 이미지를 만들거나 고칩니다. file/referenceUrls 중 최소 하나는 있어야 하고,
 * 지시문은 항상 필수입니다 — "무엇을 하고 싶은지"가 곧 편집인지 합성인지를 결정하므로,
 * 이 함수 자체는 편집/합성을 구분하지 않습니다.
 * ⚠️ S3에 저장하지 않습니다 — 확정 전 미리보기 단계에서만 사용하세요.
 * @param {object} input
 * @param {File|Blob} [input.file] 손에 들고 있는 원본(또는 리사이즈된) 이미지 — 있으면
 *   "이 이미지를 고쳐줘" 쪽에 가까운 요청이 됩니다.
 * @param {string[]} [input.referenceUrls] 참고할 이미지들의 URL(에셋관리 등에서 이미
 *   확보된 것) — 있으면 "이 이미지들을 참고해서 만들어줘" 쪽에 가까운 요청이 됩니다.
 *   file과 같이 넘기면 "이 파일을 저 참고 이미지들 분위기로 바꿔줘" 같은 요청도 가능합니다.
 * @param {string} input.instruction 무엇을 원하는지 설명 (필수) — 편집인지 합성인지는
 *   여기 적힌 내용과 위 입력 구성을 보고 AI가 판단합니다.
 * @param {string} [input.purpose] 캠페인 목적 (참고용 컨텍스트)
 * @returns {Promise<Blob>} 생성/편집된 이미지 blob (아직 S3에 저장되지 않은 미리보기용 상태)
 */
export async function generateImage({ file, referenceUrls, instruction, purpose } = {}) {
  const urls = (referenceUrls || []).filter(Boolean);
  if (!file && !urls.length) {
    throw new Error("원본 이미지를 업로드하거나, 참고 이미지를 하나 이상 추가해주세요");
  }
  if (!instruction?.trim()) {
    throw new Error("어떤 이미지를 원하는지 설명(지시문)을 입력해주세요");
  }

  if (IMAGE_PROCESS_CONFIG.apiUrl) {
    const form = new FormData();
    if (file) form.append("file", file);
    urls.forEach(u => form.append("referenceUrls", u));
    form.append("instruction", instruction);
    form.append("purpose", purpose || "");
    const res = await fetch(IMAGE_PROCESS_CONFIG.apiUrl, { method: "POST", body: form });
    if (!res.ok) throw new Error("이미지 생성 실패: " + res.status);
    // 서버가 결과를 바이너리로 직접 응답 (S3 저장은 여기서 하지 않음)
    return await res.blob();
  }

  // 데모 모드 — 실제 AI 호출 없이 그럴듯한 미리보기만 흉내냅니다.
  await new Promise(r => setTimeout(r, 900));
  if (file) return file; // 편집 요청이면 원본을 그대로 돌려줌 (가공 안 된 상태라는 걸 호출부에서 안내해야 함)
  const res = await fetch(urls[0]); // 합성 요청이면 첫 참고 이미지를 대신 돌려줌
  if (!res.ok) throw new Error("데모 모드: 참고 이미지를 불러오지 못했습니다");
  return await res.blob();
}

// ==========================================================================
// ⚠️ 하위호환 래퍼 — generator.js(EDM)는 아직 업로드 UI 개편 방향을 고민 중이라
// 예전 시그니처(processImage(file, instruction, purpose))를 그대로 씁니다.
// generator.js를 안 건드려도 계속 동작하도록, 예전 함수 이름을 새 generateImage()
// 위에 얇게 얹어서 유지합니다. generator.js의 업로드 UI 개편이 끝나면 이 래퍼는
// 지우고 generatorLP.js처럼 generateImage()를 직접 쓰도록 정리하면 됩니다.
// ==========================================================================

/** @deprecated generateImage()를 쓰세요. generator.js 개편 전까지만 유지합니다. */
export async function processImage(file, instruction, purpose) {
  return generateImage({ file, instruction, purpose });
}

/** @deprecated generateImage()를 쓰세요. generator.js 개편 전까지만 유지합니다. */
export async function composeImageFromReferences(referenceUrls, instruction, purpose) {
  return generateImage({ referenceUrls, instruction, purpose });
}
