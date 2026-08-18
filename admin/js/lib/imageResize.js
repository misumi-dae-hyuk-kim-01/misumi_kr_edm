// assets.js와 generator.js가 공유하는 이미지 리사이징 유틸.
// 원본이 maxDim보다 크면 canvas로 축소하고, 작거나 같으면 원본을 그대로 반환합니다
// (업스케일은 하지 않음 — 화질만 나빠지고 용량 이득이 없어서).
export function resizeImage(file, maxDim) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      if (scale === 1) { resolve(file); return; }
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => resolve(blob || file), file.type || "image/jpeg", 0.9);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

// EDM 캠페인 본문에 들어가는 이미지의 표준 최대 폭. EDM 템플릿은 600px 고정폭이라,
// 이보다 큰 원본을 그대로 보내는 건 이메일 용량만 키우고 화질 이득이 없습니다.
export const EDM_IMAGE_MAX_DIM = 600;
