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
// 백엔드는 process-image Lambda(OpenAI gpt-image-1의 images/edits)로 구현되어 있고,
// 계약은 아래와 같습니다:
//   POST (multipart/form-data) { file?, referenceFiles[]?, instruction, purpose }
//     → 생성/편집된 이미지 바이너리(Content-Type: image/*)
// ⚠️ 서버는 이 요청에서 S3에 아무것도 저장하면 안 됩니다. 결과를 바이너리로 그대로
// 응답에 실어 보내기만 하면 됩니다. 최종 저장은 사용자가 확정한 뒤 별도의
// uploadToS3() 흐름(=presigned URL)을 통해 이루어집니다.
export const IMAGE_PROCESS_CONFIG = {
  apiUrl: "https://2ylb31kte6.execute-api.ap-northeast-1.amazonaws.com" // process-image (OpenAI gpt-image-1)
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
// ⚠️ 2026-10 — 편집 요청에는 지시문 뒤에 아무 문구도 덧붙이지 않습니다(사용자가 쓴 그대로 보냄).
// 예전에는 "기존 내용·글자는 그대로 유지하고 새 요소를 추가하지 말라"는 보호 문구를 모든 요청에 붙였는데,
// 개발팀 실측(AI 이미지 보정 프롬프트 가이드)에서 그런 보존 문구는 효과가 없고 오히려 역효과였습니다:
// 서버가 이미 input_fidelity=high로 원본을 보존하고, 지켜야 할 것을 하나하나 열거하면 모델이 "그것들이
// 편집 대상"으로 받아들여 보존 문구를 붙인 쪽이 "최대 35% 할인"의 빨간색을 흰색으로 바꾼 사례가
// 있었습니다(문구 유무 각 3회 비교). 그래서 제거했습니다. 대신 화면의 "프롬프트 작성 팁"으로
// "무엇을 + 어떻게, 한 번에 한 가지" 쓰는 법을 안내합니다. (참고 이미지 없는 순수 생성에만 아래
// TEXT_ONLY_SUFFIX를 붙입니다 — 이쪽은 "보존"이 아니라 새로 그릴 때의 글자 깨짐을 피하려는 것입니다.)

// 캠페인 목적(purpose)을 AI 이미지 생성에 넘길지 여부. 목적이 "쿠폰 안내" 같은 주제면 모델이
// 그 주제에 끌려 지시와 무관한 쿠폰 그림·홍보 문구("Use your coupon today and save!" 등)를
// 지어내는 경우가 있어서(팀 테스트 제보), 지시문과 참고 이미지만으로 결정되도록 기본은 보내지
// 않습니다. 예전 동작으로 되돌리려면 true로 바꾸세요(호출하는 쪽 코드는 그대로 purpose를
// 넘깁니다). alt 텍스트 생성(generateAltTextFromImage)의 purpose는 이 값과 무관합니다.
const SEND_PURPOSE_TO_AI = false;

// 참고 이미지 없이 "설명(지시문)만으로" 새 이미지를 만드는 것(순수 생성)을 허용할지 여부.
// ⚠️ 지금 process-image Lambda는 OpenAI images/edits(입력 이미지 필수)로 만들어져 있어서
// 이미지가 없으면 호출 자체가 불가능합니다 — 그래서 기본은 false(참고 이미지 1장 이상 강제)입니다.
// 순수 생성을 쓰려면 Lambda가 "이미지가 하나도 없는 요청(mode=generate)"을 받았을 때
// images/generations로 분기하도록 먼저 바뀌어야 합니다. 그 배포가 끝난 뒤 이 값을 true로 바꾸면
// generator.js/generatorLP.js의 "소재를 먼저 등록하세요" 검증과 안내 문구도 같이 풀립니다.
export const ALLOW_TEXT_ONLY_GENERATION = false;

// 순수 생성(참고 이미지 없음)에는 "기존 내용 유지" 지시가 의미 없고, 대신 이미지 모델이 글자를
// 깨뜨려 그리는 문제가 있어서 이미지 안에 글자·로고를 넣지 않게 합니다(텍스트는 화면에서 별도로
// 얹힙니다).
const TEXT_ONLY_SUFFIX =
  "\n\n(중요: 이미지 안에 문자·글자·숫자·로고·워터마크를 넣지 마세요. 텍스트는 화면에서 별도로 얹힙니다. " +
  "지시한 내용만 표현하고, 지시에 없는 불필요한 장식 요소를 임의로 추가하지 마세요.)";

export async function generateImage({ file, referenceFiles, referenceUrls, instruction, purpose } = {}) {
  const refFiles = (referenceFiles || []).filter(Boolean);
  const refUrls = (referenceUrls || []).filter(Boolean);
  const textOnly = !file && !refFiles.length && !refUrls.length;
  if (textOnly && !ALLOW_TEXT_ONLY_GENERATION) {
    throw new Error("원본 이미지를 업로드하거나, 참고 이미지를 하나 이상 추가해주세요");
  }
  if (!instruction?.trim()) {
    throw new Error("어떤 이미지를 원하는지 설명(지시문)을 입력해주세요");
  }
  const safeInstruction = instruction.trim() + (textOnly ? TEXT_ONLY_SUFFIX : "");

  if (IMAGE_PROCESS_CONFIG.apiUrl) {
    const form = new FormData();
    if (file) form.append("file", file);
    // 같은 필드명으로 여러 번 append하면 서버(멀티파트 파서)가 배열로 받습니다.
    refFiles.forEach(f => form.append("referenceFiles", f, f.name || "reference.png"));
    refUrls.forEach(u => form.append("referenceUrls", u));
    form.append("instruction", safeInstruction);
    // 이미지가 하나도 없을 때만 "새로 생성" 모드임을 명시합니다(Lambda가 images/generations로 분기하는 기준).
    if (textOnly) form.append("mode", "generate");
    form.append("purpose", SEND_PURPOSE_TO_AI ? (purpose || "") : "");
    const res = await fetch(IMAGE_PROCESS_CONFIG.apiUrl, { method: "POST", body: form });
    if (!res.ok) {
      // ⚠️ 2026-09 — 상태 코드만 보여주면 원인을 알 수 없습니다. 실제로 "502"의 정체가 OpenAI 크레딧
      // 소진(429 "You have no credits remaining")이었는데, Lambda가 이를 502로 감싸 돌려줘서 한참
      // 엉뚱한 곳(응답 크기·시간 초과)을 의심했습니다. 서버가 돌려준 본문을 같이 보여주고, 사용자가
      // 조치할 수 있는 흔한 원인(크레딧/결제, 요청 한도)은 한글로 안내합니다.
      let full = "";
      try { full = (await res.text()).trim().replace(/\s+/g, " "); } catch (e) { /* 본문 없음 */ }
      let hint = res.status >= 500 ? " (서버 오류 — 개발팀 확인 필요)" : "";
      if (/no credits|insufficient_quota|exceeded your current quota|billing/i.test(full)) {
        hint = " (OpenAI 크레딧/결제 한도 소진 — 계정 크레딧 충전이 필요합니다. 관리자에게 문의하세요)";
      } else if (/timed out|timeout|time-out/i.test(full) || res.status === 504) {
        hint = " (서버 응답 시간 초과 — 이미지 생성이 오래 걸려 중단됐습니다. 이 슬롯의 요청문을 한 가지로 줄이고 참고 소재를 꼭 필요한 것만 남긴 뒤 다시 시도해보세요. 슬롯 수와는 무관합니다)";
      } else if (/rate.?limit|too many requests/i.test(full)) {
        hint = " (OpenAI 요청 한도 초과 — 잠시 후 다시 시도하세요)";
      }
      throw new Error("이미지 생성 실패: " + res.status + hint + (full ? " — " + full.slice(0, 200) : ""));
    }
    // 서버가 결과를 바이너리로 직접 응답 (S3 저장은 여기서 하지 않음)
    return await res.blob();
  }

  // 데모 모드 — 실제 AI 호출 없이 그럴듯한 미리보기만 흉내냅니다.
  await new Promise(r => setTimeout(r, 900));
  if (textOnly) { // 순수 생성 데모: 실제 AI 없이 안내용 이미지만 만들어 돌려줌
    const c = document.createElement("canvas");
    c.width = 1200; c.height = 750;
    const g = c.getContext("2d");
    g.fillStyle = "#e8ebf5"; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#0F218B"; g.font = "bold 40px sans-serif"; g.textAlign = "center";
    g.fillText("데모 모드 — 설명만으로 생성(실제 AI 미연결)", c.width / 2, c.height / 2);
    return await new Promise(r => c.toBlob(b => r(b), "image/png"));
  }
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
