// AI 이미지 생성 전용 — S3 저장은 하지 않습니다.
// "확인 후 업로드" 흐름: 이 함수는 생성된 이미지를 blob으로만 반환하고, 사용자가
// 미리보기를 확인한 뒤 s3Upload.js의 uploadToS3()를 호출해야 실제로 S3에 저장됩니다.
// IMAGE_PROCESS_CONFIG.apiUrl이 비어있으면 데모 모드로 동작합니다.
//
// ⚠️ 2026-09 변경: 소재(참고 이미지)를 referenceUrls(이미 S3에 올라간 URL)가 아니라
// referenceFiles(브라우저 메모리의 File 그대로)로 받도록 바꿨습니다. 이전엔 소재를
// 고르는 순간 바로 S3에 업로드했는데, 그러면 AI 합성이 성공하든 실패하든 소재
// 파일이 영원히 S3에 남고, 이 소재는 최종 페이지에 직접 등장하지 않아서(AI가
// "참고만" 하는 용도라) 고아 에셋 탐지 화면에 항상 "안 쓰는 파일"로 잡힙니다.
// file(단일 편집 원본)이 원래부터 이렇게(메모리 보관, 결과만 저장) 동작하던 것과
// 같은 원칙으로 통일한 것입니다 — "최종 결과물만 저장한다"는 원칙 하나로 소재도
// 처리됩니다.
//
// 실제로 연동하려면 백엔드에 아래와 같은 엔드포인트가 필요합니다 (개발팀·AI팀 협의 필요):
//   POST (multipart/form-data) { file?, referenceFiles[]?, instruction, purpose }
//     → 생성/편집된 이미지 바이너리(Content-Type: image/*)
// ⚠️ 서버는 이 요청에서 S3에 아무것도 저장하면 안 됩니다. 결과를 바이너리로 그대로
// 응답에 실어 보내기만 하면 됩니다. 최종 저장은 사용자가 확정한 뒤 별도의
// uploadToS3() 흐름(=presigned URL)을 통해 이루어집니다.
export const IMAGE_PROCESS_CONFIG = {
  apiUrl: "" // 예: "https://xxxx.execute-api.ap-northeast-2.amazonaws.com/generate-image"
};

/**
 * AI로 이미지를 만들거나 고칩니다. file/referenceFiles/referenceUrls 중 최소
 * 하나는 있어야 하고, 지시문은 항상 필수입니다.
 * ⚠️ S3에 저장하지 않습니다 — 확정 전 미리보기 단계에서만 사용하세요.
 * ⚠️ referenceFiles와 referenceUrls는 성격이 다릅니다:
 *   - referenceFiles: 아직 어디에도 없는, 이번 요청만을 위해 새로 고른 파일
 *     (브라우저 메모리 그대로 넘김 — 미리 S3에 올려두지 마세요. "최종 결과물만
 *     저장한다" 원칙 때문에, 이 파일들은 절대 S3에 안 올라갑니다)
 *   - referenceUrls: 에셋관리 등에서 이미 확보된, 원래도 존재하던 자산의 URL
 *     (재사용 목적으로 이미 등록된 것이라 새로 올릴 필요가 없고, 애초에 "고아
 *     자산" 문제가 발생하지 않습니다)
 * @param {object} input
 * @param {File|Blob} [input.file] 손에 들고 있는 원본(또는 리사이즈된) 이미지 — 있으면
 *   "이 이미지를 고쳐줘" 쪽에 가까운 요청이 됩니다.
 * @param {(File|Blob)[]} [input.referenceFiles] 이번 요청 전용으로 새로 고른 참고 파일들
 * @param {string[]} [input.referenceUrls] 이미 존재하는 참고 자산들의 URL
 * @param {string} input.instruction 무엇을 원하는지 설명 (필수) — 편집인지 합성인지는
 *   여기 적힌 내용과 위 입력 구성을 보고 AI가 판단합니다.
 * @param {string} [input.purpose] 캠페인 목적 (참고용 컨텍스트)
 * @returns {Promise<Blob>} 생성/편집된 이미지 blob (아직 S3에 저장되지 않은 미리보기용 상태)
 */
export async function generateImage({ file, referenceFiles, referenceUrls, instruction, purpose } = {}) {
  const refFiles = (referenceFiles || []).filter(Boolean);
  const refUrls = (referenceUrls || []).filter(Boolean);
  if (!file && !refFiles.length && !refUrls.length) {
    throw new Error("원본 이미지를 업로드하거나, 참고 이미지를 하나 이상 추가해주세요");
  }
  if (!instruction?.trim()) {
    throw new Error("어떤 이미지를 원하는지 설명(지시문)을 입력해주세요");
  }

  if (IMAGE_PROCESS_CONFIG.apiUrl) {
    const form = new FormData();
    if (file) form.append("file", file);
    // 같은 필드명으로 여러 번 append하면 서버(멀티파트 파서)가 배열로 받습니다.
    refFiles.forEach(f => form.append("referenceFiles", f, f.name || "reference.png"));
    refUrls.forEach(u => form.append("referenceUrls", u));
    form.append("instruction", instruction);
    form.append("purpose", purpose || "");
    const res = await fetch(IMAGE_PROCESS_CONFIG.apiUrl, { method: "POST", body: form });
    if (!res.ok) throw new Error("이미지 생성 실패: " + res.status);
    // 서버가 결과를 바이너리로 직접 응답 (S3 저장은 여기서 하지 않음)
    return await res.blob();
  }

  // 데모 모드 — 실제 AI 호출 없이 그럴듯한 미리보기만 흉내냅니다.
  await new Promise(r => setTimeout(r, 900));
  if (file) return file; // 편집 요청이면 원본을 그대로 돌려줌
  if (refFiles.length) return refFiles[0]; // 이미 브라우저 메모리의 Blob이라 그대로 반환
  const res = await fetch(refUrls[0]); // URL 참조는 여전히 fetch가 필요
  if (!res.ok) throw new Error("데모 모드: 참고 이미지를 불러오지 못했습니다");
  return await res.blob();
}

// ==========================================================================
// alt 텍스트 자동 생성 — 완성된 이미지를 "보고" 설명을 만듭니다(vision 기반).
// ⚠️ 2026-09 신설, 현재 데모 모드만 구현됨 — 실제 AI 모델(GPT 티어)이 아직
// 확정 전이라(ChatGPT로 통일 예정, 정확한 티어 미정), 실제 연동부는 비워두고
// 함수 자리와 호출 흐름만 만들어뒀습니다. 티어가 정해지면 이 함수 안의
// IMAGE_ALT_CONFIG.apiUrl 분기만 채우면 되고, 이 함수를 호출하는 쪽(generator.js/
// generatorLP.js의 배포·다운로드 함수)은 안 건드려도 됩니다.
//
// ⚠️ 왜 지시문 기반 변환이 아니라 이미지를 직접 보고 만드는가: 지시문 품질에
// alt 품질이 좌우되는 문제가 있었습니다("예쁘게 만들어줘" 같은 부실한 지시문은
// 변환해도 부실한 alt만 나옴). 또한 지시문 자체가 없는 경우(그냥 업로드만 한
// 이미지)엔 애초에 변환할 재료가 없습니다. 이미지를 직접 분석하면 지시문 유무나
// 품질과 무관하게 항상 실제 내용에 기반한 alt를 만들 수 있습니다.
//
// ⚠️ 왜 배포/다운로드 시점에 딱 한 번만 호출하는가: 이미지를 여러 번 재생성하는
// 동안 매번 호출하면, 최종적으로 쓰이지도 않는 중간 결과물의 분석 비용까지
// 다 내게 됩니다(재생성 10회 기준 최대 90% 비용 절감 효과 확인됨). 호출하는
// 쪽(generator.js/generatorLP.js)이 "배포/다운로드 직전 한 번"이라는 원칙을
// 지켜야 이 절감 효과가 실제로 발생합니다 — 이 함수 자체는 몇 번을 호출하든
// 매번 정직하게 API를 호출합니다(스스로 호출 빈도를 제한하지 않음).
// ==========================================================================

export const IMAGE_ALT_CONFIG = {
  apiUrl: "" // 예: "https://xxxx.execute-api.ap-northeast-2.amazonaws.com/generate-alt-text"
};

/** alt 텍스트가 너무 길면 스크린리더가 통째로 읽어줘야 해서 오히려 사용성이
 *  떨어집니다(WebAIM 등에서 대략 125자 이내 권장). 단어 중간이 아니라 마지막
 *  공백에서 잘라서 어색하게 끊기지 않게 합니다. */
function truncateForAlt(text, maxLen = 125) {
  const trimmed = (text || "").trim();
  if (trimmed.length <= maxLen) return trimmed;
  const cut = trimmed.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut) + "…";
}

/**
 * 완성된 이미지를 직접 분석해서 SEO/접근성에 적합한 alt 텍스트를 만듭니다.
 * @param {Blob} imageBlob 이미 완성되어 S3에 저장(또는 저장 예정)된 이미지
 * @param {string} [purpose] 캠페인 목적 (참고용 컨텍스트 — "이게 신상품 안내
 *   페이지의 배너다" 같은 맥락을 주면 더 적절한 alt가 나올 수 있음)
 * @returns {Promise<string>} alt 텍스트 (125자 이내로 정리됨)
 */
export async function generateAltTextFromImage(imageBlob, purpose) {
  if (!imageBlob) return "";

  if (IMAGE_ALT_CONFIG.apiUrl) {
    const form = new FormData();
    form.append("image", imageBlob, "image.png");
    form.append("purpose", purpose || "");
    const res = await fetch(IMAGE_ALT_CONFIG.apiUrl, { method: "POST", body: form });
    if (!res.ok) throw new Error("alt 텍스트 생성 실패: " + res.status);
    const { altText } = await res.json();
    return truncateForAlt(altText);
  }

  // 데모 모드 — 실제 vision 분석 없이 자리만 채웁니다. 호출 자체는 정상적으로
  // 되고 있다는 걸 알 수 있도록 구분 가능한 문구를 반환합니다.
  await new Promise(r => setTimeout(r, 500));
  return "(자동 생성된 이미지 설명 — 실제 AI 연동 전 데모 값)";
}
