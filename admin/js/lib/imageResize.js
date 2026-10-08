// assets.js와 generator.js가 공유하는 이미지 리사이징 유틸.
// 원본이 maxDim보다 크면 canvas로 축소하고, 작거나 같으면 원본을 그대로 반환합니다
// (업스케일은 하지 않음 — 화질만 나빠지고 용량 이득이 없어서).
// ⚠️ 2026-09 신설 — 고화질 축소. canvas drawImage로 한 번에 크게 줄이면(예: 1800px →
// 600px) 브라우저 기본 보간(bilinear)이 중간 픽셀을 건너뛰어서 글자·얇은 선이
// 뭉개지거나 계단져 보입니다(특히 UI 스크린샷). 그 결과물을 이메일 슬롯에서 한 번 더
// 줄이므로 이중으로 열화돼 "화질이 너무 저하됐다"로 보였습니다. 목표 크기까지 2배
// 이하씩 단계적으로 줄이면(그때마다 2x2 픽셀 평균) 사실상 영역 평균이 되어 훨씬
// 선명하고, 마지막 단계는 imageSmoothingQuality "high"로 그립니다.
function drawScaledHQ(ctx, src, sx, sy, sw, sh, dx, dy, dw, dh) {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  let cur = src, cx = sx, cy = sy, cw = sw, ch = sh;
  while (cw > dw * 2 || ch > dh * 2) {
    const nw = Math.max(dw, Math.ceil(cw / 2));
    const nh = Math.max(dh, Math.ceil(ch / 2));
    const c = document.createElement("canvas");
    c.width = nw; c.height = nh;
    const cctx = c.getContext("2d");
    cctx.imageSmoothingEnabled = true;
    cctx.imageSmoothingQuality = "high";
    cctx.drawImage(cur, cx, cy, cw, ch, 0, 0, nw, nh);
    cur = c; cx = 0; cy = 0; cw = nw; ch = nh;
  }
  ctx.drawImage(cur, cx, cy, cw, ch, dx, dy, dw, dh);
}

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
      drawScaledHQ(ctx, img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => resolve(blob || file), file.type || "image/jpeg", 0.9);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

// EDM 캠페인 본문에 들어가는 이미지의 표준 최대 폭. EDM 템플릿은 600px 고정폭이라,
// 이보다 큰 원본을 그대로 보내는 건 이메일 용량만 키우고 화질 이득이 없습니다.
export const EDM_IMAGE_MAX_DIM = 600;
// ⚠️ 2026-09 — 이 값은 "기본(최소)" 상한입니다. 슬롯이 넓으면(예: 전체 폭 552px) 레티나/모바일에서
// 600px는 흐릿하므로, generator.js의 pickResize가 슬롯 표시 폭의 2배(최대 1200)까지 올려
// 넘깁니다. 이미지는 S3 외부 링크라 이메일 본문 용량엔 영향이 없고 로딩 시간만 약간 늘어납니다.

/** 비율이 10% 넘게 다르면 육안으로도 꽤 잘려나간 걸로 보이는 수준이라 판단해서
 *  경고 문구를 만듭니다. generator.js의 checkUrlAspectRatio()(URL 직접 입력 경로)와
 *  같은 기준·같은 말투입니다 — ⚠️ 2026-09 신설: 예전엔 "URL 직접 입력"에서만 이
 *  경고가 떴고, 파일 업로드·AI 생성 경로는 크롭이 조용히 일어나서 사용자가
 *  "왜 이미지 일부만 나오지"를 결과물을 보고 나서야 알아차렸습니다(팀 테스트
 *  제보: 이미지 삽입 시 잘림현상). 크롭을 직접 계산하는 resizeImageToRatio() 안에서
 *  바로 판단하면 두 경로 모두 같은 경고를 띄울 수 있습니다. */
function buildCropWarning(srcRatio, targetRatio, targetWidth, targetHeight) {
  const diff = Math.abs(srcRatio - targetRatio) / targetRatio;
  if (diff <= 0.1) return null;
  const guess = srcRatio > targetRatio
    ? "원본이 슬롯보다 가로로 넓어서 좌우가 잘렸습니다"
    : "원본이 슬롯보다 세로로 길어서 위아래가 잘렸습니다";
  return `⚠ 이 이미지의 비율이 슬롯(${targetWidth}:${targetHeight})과 달라서 ${guess}. 필요한 부분이 잘렸다면 원본을 슬롯 비율에 맞게 미리 잘라서 다시 올려주세요.`;
}

/** 이미지 테두리에서 가장 많이 나오는 색(여백 채움용)을 구합니다. 스크린샷은 테두리가 흰색/회색 단색인
 *  경우가 대부분이라, 이 색으로 여백을 채우면 원본의 배경과 자연스럽게 이어집니다. 못 구하면 흰색입니다.
 *  ⚠️ 2026-10 버그 수정 — 예전엔 이미지 전체를 48×48로 줄인 뒤 그 테두리 한 줄을 읽었습니다. 그러면 가장자리
 *  1~2px짜리 얇은 테두리가 안쪽 내용과 섞여서 실제로 없는 색이 나옵니다. 팀 테스트의 NPay 카드 이미지(268×167)는
 *  위·왼쪽 가장자리가 순백(255·250), 아래·오른쪽은 카드 그림자(194·137)이고 카드가 가장자리에서 1~2px 거리인데,
 *  어두운 카드와 섞여 어두운 회색(약 102)이 나와 "그대로 첨부하면 여백이 회색으로 뜬다"로 보였습니다.
 *  이제는 축소 없이 원본 해상도의 가장자리 한 줄 네 개(위·아래·왼·오른)를 그대로 읽습니다(가장자리만 읽어서
 *  이미지가 커도 가볍습니다). */
function dominantBorderColor(img) {
  try {
    const w = img.width, h = img.height;
    const strips = [[0, 0, w, 1], [0, h - 1, w, 1], [0, 0, 1, h], [w - 1, 0, 1, h]];
    const buckets = new Map();
    for (const [sx, sy, sw, sh] of strips) {
      const c = document.createElement("canvas");
      c.width = sw; c.height = sh;
      const cx = c.getContext("2d");
      cx.imageSmoothingEnabled = false; // 보간으로 섞이지 않게(축소 없음)
      cx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const d = cx.getImageData(0, 0, sw, sh).data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 200) continue; // 투명 픽셀은 제외
        const key = (d[i] >> 4) + "," + (d[i + 1] >> 4) + "," + (d[i + 2] >> 4);
        const b = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
        b.n++; b.r += d[i]; b.g += d[i + 1]; b.b += d[i + 2];
        buckets.set(key, b);
      }
    }
    let best = null;
    for (const b of buckets.values()) if (!best || b.n > best.n) best = b;
    if (!best) return "#ffffff";
    return `rgb(${Math.round(best.r / best.n)},${Math.round(best.g / best.n)},${Math.round(best.b / best.n)})`;
  } catch (e) {
    return "#ffffff";
  }
}

/** ⚠️ 2026-09 신설 — 크롭을 요청하지 않았을 때의 기본 리사이즈(contain)입니다.
 *  EDM 이메일은 이미지를 width:100%(슬롯 폭 고정) + height:auto로 그리기 때문에,
 *  파일의 "비율"이 곧 슬롯의 표시 높이를 결정합니다. 그래서 "원본 전체가 다 보이고
 *  + 슬롯 영역을 벗어나지 않고 + 슬롯 높이가 변하지 않으려면", 결과 이미지 파일
 *  자체를 정확히 슬롯 비율로 만들고 그 안에 원본을 통째로(자르지 않고) 가운데에
 *  넣은 뒤 남는 부분을 여백으로 채우는 방법뿐입니다. 원본 비율이 슬롯과 다르면
 *  좌우 또는 상하에 여백이 생기는 게 이 방식의 대가입니다(여백 색은 원본 테두리의
 *  대표색). 해상도는 원본이 통째로 들어가는 가장 작은 슬롯비율 캔버스를 기준으로
 *  하고, 긴 변이 maxDim을 넘을 때만 줄입니다.
 *  target.width/height를 못 찾은 경우(비교 기준 없음)는 resizeImage()와 동일합니다. */
// ⚠️ 2026-10 — padColor를 주면(예: "#FFFFFF") 여백을 그 색으로 채우고, 없으면 원본 테두리의 대표색으로 채웁니다
// (원본 배경이 단색인 스크린샷은 그게 자연스럽지만, 원본 테두리가 회색이면 여백이 회색 띠로 보입니다 —
// 팀 테스트: "그대로 첨부하면 배경이 회색으로 뜬다"). 반환에 padded(여백이 실제로 생겼는지)와 padColor를 넣어서
// 호출하는 쪽이 "회색 여백이 생겼다"는 안내를 줄 수 있게 합니다.
export function resizeImageContain(file, targetWidth, targetHeight, maxDim = EDM_IMAGE_MAX_DIM, padColor = null) {
  if (!targetWidth || !targetHeight) {
    return resizeImage(file, maxDim).then(blob => ({ blob, cropWarning: null }));
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const targetRatio = targetWidth / targetHeight;
      // 슬롯 비율이면서 원본이 원래 크기로 통째로 들어가는 가장 작은 캔버스
      let canvasW = Math.max(img.width, Math.round(img.height * targetRatio));
      let canvasH = Math.round(canvasW / targetRatio);
      const scale = Math.min(1, maxDim / Math.max(canvasW, canvasH));
      canvasW = Math.max(1, Math.round(canvasW * scale));
      canvasH = Math.max(1, Math.round(canvasH * scale));
      const drawW = Math.min(canvasW, Math.round(img.width * scale));
      const drawH = Math.min(canvasH, Math.round(img.height * scale));
      const dx = Math.round((canvasW - drawW) / 2);
      const dy = Math.round((canvasH - drawH) / 2);
      const canvas = document.createElement("canvas");
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d");
      const fill = padColor || dominantBorderColor(img);
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, canvasW, canvasH);
      drawScaledHQ(ctx, img, 0, 0, img.width, img.height, dx, dy, drawW, drawH);
      const padded = canvasW !== drawW || canvasH !== drawH;
      canvas.toBlob(blob => resolve({ blob: blob || file, cropWarning: null, padded, padColor: fill }), file.type || "image/jpeg", 0.9);
    };
    img.onerror = () => resolve({ blob: file, cropWarning: null });
    img.src = URL.createObjectURL(file);
  });
}

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
 *  동일하게 동작합니다(하위 호환).
 *  ⚠️ 2026-09 변경 — 반환값이 Blob 하나에서 { blob, cropWarning } 객체로
 *  바뀌었습니다. 호출하는 쪽(generator.js) 전부 구조분해로 받도록 같이
 *  고쳤습니다 — 이 함수를 쓰는 곳이 거기뿐이라 하위 호환 걱정 없이 바꿨습니다. */
export function resizeImageToRatio(file, targetWidth, targetHeight, maxDim = EDM_IMAGE_MAX_DIM) {
  if (!targetWidth || !targetHeight) {
    return resizeImage(file, maxDim).then(blob => ({ blob, cropWarning: null }));
  }
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
      drawScaledHQ(ctx, img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
      const cropWarning = buildCropWarning(srcRatio, targetRatio, targetWidth, targetHeight);
      canvas.toBlob(blob => resolve({ blob: blob || file, cropWarning }), file.type || "image/jpeg", 0.9);
    };
    img.onerror = () => resolve({ blob: file, cropWarning: null });
    img.src = URL.createObjectURL(file);
  });
}
