// 캠페인/에셋의 날짜·시각 문자열을 만드는 공용 헬퍼.
//
// ⚠️ 왜 toISOString()을 쓰지 않는가: toISOString()은 UTC 기준입니다. 예전엔
// `new Date().toISOString().slice(0, 10)`로 날짜를 만들었는데, 한국(UTC+9)에서
// 오전 9시 이전에 저장하면 UTC로는 아직 전날이라 "작성일이 하루 전"으로 기록되는
// 버그가 있었습니다. 날짜만 보여줄 땐 눈에 잘 안 띄었지만, 시각까지 표시하는
// 지금은 9시간 어긋난 시각이 그대로 보이므로 반드시 로컬 시간대로 만들어야 합니다.
//
// ⚠️ 포맷을 "YYYY.MM.DD HH:mm"으로 고정한 이유: 이 값은 화면 표시용이면서 동시에
// 목록 정렬 키입니다(campaigns.js의 sortByUpdatedDesc). 모든 자리를 0으로 채운
// 고정 폭이라 Date로 파싱하지 않고 문자열 비교만으로 정확히 시간순 정렬됩니다.
// 시각이 없는 옛 데이터("2026.09.10")와 섞여도 그날 00:00으로 취급되어 자연스럽게
// 아래쪽에 놓입니다 — 별도 마이그레이션이 필요 없습니다.

function pad(n) {
  return String(n).padStart(2, "0");
}

/** "2026.09.10" — 날짜만 (작성일, 에셋 업로드일 등) */
export function nowDate(d = new Date()) {
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/** "2026.09.10 14:32" — 날짜 + 시:분 (최종수정일처럼 같은 날 여러 번 갱신되는 값) */
export function nowDateTime(d = new Date()) {
  return `${nowDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
