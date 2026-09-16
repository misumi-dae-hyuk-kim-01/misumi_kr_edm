// assets.js와 generator.js가 공유하는 "AI 가공 없이 순수 업로드"용 함수.
// CONFIG.uploadApiUrl이 비어있으면 데모 모드(브라우저 임시 URL)로 동작합니다 —
// assets.js의 기존 uploadAsset()과 동일한 패턴입니다.
export const S3_UPLOAD_CONFIG = {
  uploadApiUrl: "https://f72jhi4vw6.execute-api.ap-northeast-1.amazonaws.com/default/get-upload-url"
};

export async function uploadToS3(blob, filename, channel = "EDM") {
  if (S3_UPLOAD_CONFIG.uploadApiUrl) {
    const presignRes = await fetch(S3_UPLOAD_CONFIG.uploadApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, contentType: blob.type, channel })
    });
    if (!presignRes.ok) throw new Error("업로드 URL 발급 실패: " + presignRes.status);
    const { uploadUrl, publicUrl } = await presignRes.json();
    // ⚠️ 2026-09 버그 수정 — 백엔드 응답에 uploadUrl/publicUrl 필드가 없거나
    // 이름이 다르면(예: url, fileUrl 등으로 응답), 구조분해가 조용히 undefined가
    // 되는데도 여기선 예외를 안 던지고 있었습니다. S3에 파일 자체는 정상
    // 업로드됐어도(PUT은 성공), 그 공개 주소를 못 받아온 채로 그대로
    // registerAsset()에 넘어가서 — 에셋 목록엔 "업로드된 것처럼" 등록은
    // 되지만 URL이 비어있는 상태로 저장되는 문제가 있었습니다. 두 값 다
    // 반드시 있어야 정상이라고 보고 명확히 실패시킵니다.
    if (!uploadUrl || !publicUrl) {
      throw new Error("업로드 URL 응답 형식이 올바르지 않습니다 (uploadUrl/publicUrl 누락)");
    }
    const putRes = await fetch(uploadUrl, { method: "PUT", body: blob, headers: { "Content-Type": blob.type } });
    if (!putRes.ok) throw new Error("S3 업로드 실패: " + putRes.status);
    return publicUrl;
  }
  return URL.createObjectURL(blob);
}