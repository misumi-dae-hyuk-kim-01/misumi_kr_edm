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
    const putRes = await fetch(uploadUrl, { method: "PUT", body: blob, headers: { "Content-Type": blob.type } });
    if (!putRes.ok) throw new Error("S3 업로드 실패: " + putRes.status);
    return publicUrl;
  }
  return URL.createObjectURL(blob);
}