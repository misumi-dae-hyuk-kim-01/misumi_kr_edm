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

/** ⚠️ 2026-09 신설 — resizeImage()는 원본 비율을 그대로 유지한 채 긴 변만 줄이는
 *  방식이라, 슬롯이 기대하는 가로세로 비율과 원본 비율이 다르면(특히 세로로 긴
 *  스크린샷 등) 실제 템플릿에서 "가로는 맞는데 세로가 제한 없이 길어지는" 문제가
 *  있었습니다. 템플릿 HTML엔 슬롯마다 목표 width/height가 이미 박혀 있어서
 *  (generator.js의 inferImageMaxWidth/inferImageTargetSize 참고), 그 비율에 맞춰
 *  원본을 중앙 기준으로 잘라낸(center-crop) 뒤 정확한 목표 크기로 리사이즈합니다.
 *  실제 이메일 마크업 자체는 계속 width:100%;height:auto(이메일 클라이언트 호환을
 *  위한 표준 반응형 방식)를 쓰지만, 원본 이미지 자체가 이미 목표 비율이므로
 *  height:auto로 렌더링해도 항상 슬롯 비율대로 나옵니다.
 *  targetWidth/targetHeight가 없으면(비율 정보를 못 찾은 필드) 기존 resizeImage()와
 *  동일하게 동작합니다(하위 호환). */
export function resizeImageToRatio(file, targetWidth, targetHeight, maxDim = EDM_IMAGE_MAX_DIM) {
  if (!targetWidth || !targetHeight) return resizeImage(file, maxDim);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const targetRatio = targetWidth / targetHeight;
      const srcRatio = img.width / img.height;
      // 원본이 목표보다 옆으로 더 넓으면(srcRatio > targetRatio) 좌우를 잘라내고,
      // 세로로 더 길면(srcRatio < targetRatio) 위아래를 잘라냅니다 — 중앙 기준.
      let cropW = img.width, cropH = img.height, cropX = 0, cropY = 0;
      if (srcRatio > targetRatio) {
        cropW = Math.round(img.height * targetRatio);
        cropX = Math.round((img.width - cropW) / 2);
      } else if (srcRatio < targetRatio) {
        cropH = Math.round(img.width / targetRatio);
        cropY = Math.round((img.height - cropH) / 2);
      }
      // ⚠️ 2026-09 버그 수정 — scale 계산을 targetWidth/targetHeight(슬롯의
      // 작은 표시 크기, 예: 176x110) 기준으로 하면, Math.min(1, ...)이 거의
      // 항상 1로 캡핑되어서 출력 해상도가 그 작은 슬롯 크기 자체로 강제
      // 고정돼버립니다 — "화질이 너무 떨어진다"는 문의의 정확한 원인이었습니다
      // (176x110처럼 매우 낮은 해상도로 저장되니, 실제 이메일에서 더 크게
      // 표시되거나 고해상도(레티나) 화면에서 보면 뿌옇게 보임). scale은
      // "크롭된 원본의 실제 픽셀 크기"(cropW/cropH — 원본이 크면 이것도 큼)를
      // 기준으로 계산해야, maxDim(600)이 실제로 "이 정도 해상도까지는
      // 유지해도 된다"는 의미를 갖습니다. 비율 자체는 crop 단계에서 이미
      // targetRatio로 확정됐으니, 여기서는 순수하게 해상도(선명도)만 결정합니다.
      const scale = Math.min(1, maxDim / Math.max(cropW, cropH));
      const outW = Math.round(cropW * scale);
      const outH = Math.round(cropH * scale);
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
      canvas.toBlob(blob => resolve(blob || file), file.type || "image/jpeg", 0.9);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}
