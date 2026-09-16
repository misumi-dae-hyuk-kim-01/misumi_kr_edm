// ⚠️ 아키텍처 전환: 블록을 JS 함수로 새로 그리던 이전 방식 대신, 실제 운영 템플릿
// HTML(js/data/edmTemplateHtml.js, 18개)을 그대로 쓰고 {{변수}}만 치환하는 방식으로 바꿨습니다.
// 실제 발송 템플릿과 100% 동일한 결과가 보장되고, 새 템플릿 추가 시 blocks.js를 안 건드리고
// 원본 HTML + 필드 스키마(edmTemplateFields.js)만 추가하면 됩니다.
//
// ⚠️ {{customer_name}}은 치환하지 않고 그대로 남깁니다 — 이건 마케터가 채우는 값이 아니라
// 발송 시스템(ESP)이 수신자별로 채우는 병합 태그입니다. 그 외 모든 {{변수}}는 이 도구에서
// 값을 채워서 최종 HTML을 만듭니다.

import { esc } from "./dom.js";
import { EDM_TEMPLATE_HTML } from "../data/edmTemplateHtml.js";
import { EDM_TEMPLATE_FIELDS } from "../data/edmTemplateFields.js";

const ESP_MERGE_TAGS = new Set(["customer_name"]);

/** CSS padding 단축 속성(1~4개 값)을 top/right/bottom/left로 풀어줍니다. */
function paddingSides(paddingValue) {
  const parts = paddingValue.trim().split(/\s+/).map(s => parseInt(s, 10) || 0);
  if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
  if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
  if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
  return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
}

/** 상품카드처럼 "적당한 크기의 td"만 후보로 남깁니다 — 너무 작은(글자 크기 수준) td나
 *  너무 큰(전체 그리드/페이지 래퍼) td를 카드 경계로 잘못 고르지 않도록, width 속성이
 *  100~300px 범위인 것만 후보로 씁니다. 이 범위 밖이면 필터링 없이(전체 후보로) 처리합니다. */
function filterCardSizedOpens(html, opens) {
  const filtered = opens.filter(idx => {
    const tagEnd = html.indexOf(">", idx);
    const tag = html.slice(idx, tagEnd + 1);
    const m = tag.match(/width="(\d+)"/);
    if (!m) return false;
    const w = parseInt(m[1], 10);
    return w >= 100 && w <= 300;
  });
  return filtered.length ? filtered : opens;
}

/** {{marker}}를 포함하는 <tagName>...</tagName>을 찾아서 통째로 제거합니다.
 *  단순 정규식이 아니라 여는/닫는 태그 개수를 실제로 추적해서, 중첩된 table/tr/td 구조에서도
 *  정확히 짝이 맞는 닫는 태그를 찾습니다 (필드/섹션 삭제, 상품카드 개수 제한에 사용).
 *  @param {boolean} preferOutermost true면 가장 바깥쪽 겹(상품카드처럼 여러 겹 중첩된 td의
 *    "카드 경계"를 찾을 때)을, false면 가장 안쪽(해당 필드 하나의 행만 지울 때)을 찾습니다. */
function removeEnclosingTag(html, marker, tagName, preferOutermost = false, alsoRemoveNextSibling = false) {
  const markerIdx = html.indexOf(marker);
  if (markerIdx === -1) return html;

  const openTagFullRe = new RegExp(`<${tagName}(?=[\\s>])[^>]*>`, "gi");
  let opens = [];
  let om;
  while ((om = openTagFullRe.exec(html)) && om.index < markerIdx) opens.push(om.index);
  if (!opens.length) return html;
  if (preferOutermost) opens = filterCardSizedOpens(html, opens);

  const tokenRe = new RegExp(`<${tagName}(?=[\\s>])[^>]*>|</${tagName}>`, "gi");
  const order = preferOutermost
    ? opens.map((_, i) => i)                 // 0,1,2,... (바깥쪽부터)
    : opens.map((_, i) => opens.length - 1 - i); // 안쪽부터
  for (const k of order) {
    const start = opens[k];
    const matchEnd = findMatchingClose(html, start, tokenRe);
    if (matchEnd !== -1 && matchEnd > markerIdx) {
      let removeUpTo = matchEnd;
      // ⚠️ 섹션 제목(c_headline_N) 뒤에는 {{}} 변수가 아예 없는 순수 장식/여백 행(밑줄,
      // 카드 그리드 전 여백 등)이 하나가 아니라 여러 개 연달아 붙어있을 수 있습니다.
      // 그 행만 따로는 찾을 방법이 없으니, 지운 행 바로 뒤에 공백만 두고 같은 태그가
      // 이어지는 동안(=변수 없는 순수 장식/여백 행인 동안) 계속 같이 지웁니다. {{}} 변수가
      // 들어있는(=실제 살려야 할 콘텐츠) 형제 태그를 만나면 그 자리서 멈춥니다.
      if (alsoRemoveNextSibling) {
        while (true) {
          const afterGap = html.slice(removeUpTo).match(/^\s*/)[0].length;
          const nextStart = removeUpTo + afterGap;
          if (html.slice(nextStart, nextStart + tagName.length + 1).toLowerCase() !== `<${tagName}`.toLowerCase()) break;
          const nextEnd = findMatchingClose(html, nextStart, tokenRe);
          if (nextEnd === -1) break;
          const siblingContent = html.slice(nextStart, nextEnd);
          if (/\{\{[a-zA-Z_0-9]+\}\}/.test(siblingContent)) break;
          removeUpTo = nextEnd;
        }
      }
      return html.slice(0, start) + html.slice(removeUpTo);
    }
  }
  return html;
}

/** start 위치의 여는 태그부터 depth를 추적해서, 정확히 짝이 맞는 닫는 태그의 끝 위치를 찾습니다. */
function findMatchingClose(html, start, tokenRe) {
  const scanText = html.slice(start);
  let depth = 0, matchEnd = -1, tk;
  tokenRe.lastIndex = 0;
  while ((tk = tokenRe.exec(scanText))) {
    if (tk[0].startsWith("</")) {
      depth--;
      if (depth === 0) { matchEnd = start + tk.index + tk[0].length; break; }
    } else {
      depth++;
    }
  }
  return matchEnd;
}

/** sub_N/desc_N처럼 선택적으로 켜고 끄는 개별 필드 행을 지울 때, 그 행 자신이 "다음 요소와의
 *  간격"을 padding-bottom으로 책임지고 있던 경우(다음 요소는 위쪽 padding이 0)를 감지해서,
 *  행을 통째로 지우는 대신 그 padding-bottom 크기만큼의 spacer로 대체합니다. 다음 요소가
 *  이미 자기 몫의 위쪽 여백을 갖고 있으면(=이 행이 여백을 책임지던 게 아니면) 그대로 완전히
 *  지웁니다 — 불필요한 이중 여백을 만들지 않기 위함입니다. */
function removeFieldRowPreservingGap(html, key) {
  const marker = `{{${key}}}`;
  const markerIdx = html.indexOf(marker);
  if (markerIdx === -1) return html;

  const trOpenRe = /<tr(?=[\s>])[^>]*>/gi;
  let opens = [];
  let om;
  while ((om = trOpenRe.exec(html)) && om.index < markerIdx) opens.push(om.index);
  if (!opens.length) return removeEnclosingTag(html, marker, "tr", false);

  const tokenRe = /<tr(?=[\s>])[^>]*>|<\/tr>/gi;
  let start = -1, end = -1;
  for (let k = opens.length - 1; k >= 0; k--) {
    const e = findMatchingClose(html, opens[k], tokenRe);
    if (e !== -1 && e > markerIdx) { start = opens[k]; end = e; break; }
  }
  if (start === -1) return removeEnclosingTag(html, marker, "tr", false);

  const rowHtml = html.slice(start, end);
  const padMatches = [...rowHtml.matchAll(/style="[^"]*?padding:([^";]+)[";]/g)];
  const bottomPad = padMatches.length ? paddingSides(padMatches[padMatches.length - 1][1]).bottom : 0;

  const afterHtml = html.slice(end, end + 400);
  const nextPadMatch = afterHtml.match(/<td(?=[\s>])[^>]*style="[^"]*?padding:([^";]+)[";]/);
  const nextTop = nextPadMatch ? paddingSides(nextPadMatch[1]).top : null;

  const needsSpacer = bottomPad >= 8 && (nextTop === null || nextTop < 8);
  if (needsSpacer) {
    const spacerRow = `<tr><td height="${bottomPad}" style="height:${bottomPad}px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
    return html.slice(0, start) + spacerRow + html.slice(end);
  }
  return html.slice(0, start) + html.slice(end);
}

/** 숨김 처리할 필드/섹션(<tr> 단위, 해당 필드만)과 상품카드(가장 바깥쪽 <td> 카드 경계 단위)를
 *  제거합니다. 일반 치환보다 먼저 실행해야 {{변수명}}이 아직 살아있어서 위치를 찾을 수 있습니다. */
/** startMarker가 속한 행의 시작부터, endMarker가 속한 행의 끝까지 — 그 사이에 뭐가
 *  있든(여백용 spacer, 장식용 밑줄 등 {{}} 없는 행 포함) 통째로 하나의 구간으로 지웁니다.
 *  ⚠️ 개별 행/형제를 하나씩 추적해서 지우는 기존 방식은, 그 사이에 있는 "장식/여백 행"을
 *  놓치면 빈 여백이 남는 문제가 있었습니다. 섹션 전체를 지울 때는 "제목이 시작하는 지점"부터
 *  "마지막 필드가 끝나는 지점"까지를 하나의 구간으로 보고 통째로 잘라내면, 중간에 뭐가
 *  껴있어도 다 같이 사라져서 이 문제 자체가 생기지 않습니다. */
function removeSectionSpan(html, startMarker, endMarker) {
  const startIdx = html.indexOf(`{{${startMarker}}}`);
  const endIdx = html.indexOf(`{{${endMarker}}}`);
  if (startIdx === -1 || endIdx === -1) return html;

  // 시작 지점: 이번 재설계는 "각 블록이 자기 여백을 포함"하는 구조라, 제목(c_headline_N)의
  // 실제 여백은 그 행 자체가 아니라 그 행을 감싸는 가장 바깥 <tr><td class="pad">에 있습니다.
  // (제목+밑줄만 담는 안쪽 <table>이 한 겹 더 있는 경우가 많아, 그냥 "제목 앞의 가장 가까운
  // <tr>"을 쓰면 이 바깥 wrapper를 놓쳐서 삭제 후에도 빈 여백 상자가 남습니다.)
  const sectionWrapperRe = /<tr><td class="pad"(?=[\s>])[^>]*>/gi;
  let startOpens = [];
  let om;
  sectionWrapperRe.lastIndex = 0;
  while ((om = sectionWrapperRe.exec(html)) && om.index < startIdx) startOpens.push(om.index);
  let rangeStart;
  if (startOpens.length) {
    rangeStart = startOpens[startOpens.length - 1];
  } else {
    // pad wrapper를 못 찾으면(예전 구조 등) 예전 방식으로 안전하게 폴백
    const trOpenRe = /<tr(?=[\s>])[^>]*>/gi;
    let fallbackOpens = [];
    trOpenRe.lastIndex = 0;
    while ((om = trOpenRe.exec(html)) && om.index < startIdx) fallbackOpens.push(om.index);
    if (!fallbackOpens.length) return html;
    rangeStart = fallbackOpens[fallbackOpens.length - 1];
  }

  // 끝 지점: 마지막 필드는 여러 겹 중첩된 안쪽 태그일 수 있어서, 그 행만 지우면 바깥을
  // 감싸던 태그들의 닫는 부분이 짝 없이 남습니다. 카드 삭제와 똑같이 "적당한 크기(카드
  // 경계로 보기 좋은 100~300px)의 가장 바깥쪽 td"를 찾아서 그 경계를 끝점으로 씁니다.
  const tdOpenRe = /<td(?=[\s>])[^>]*>/gi;
  let endTdOpens = [];
  tdOpenRe.lastIndex = 0;
  while ((om = tdOpenRe.exec(html)) && om.index < endIdx) endTdOpens.push(om.index);
  if (!endTdOpens.length) return html;
  void endTdOpens; // (폭 휴리스틱은 더 이상 끝점 탐색에 쓰지 않음 — 아래 설명 참고)

  // ⚠️ 폭(100~300px) 기준으로 "카드처럼 보이는 td"를 찾아 끝점으로 쓰던 예전 방식은, 이번
  // 재설계에서 폭이 그 범위 밖인 섹션(552px 풀와이드 텍스트, 87px 6열 그리드 등)을 만나면
  // 맞는 후보가 없어 실패하거나, 후보를 잘못 골라 태그 짝이 깨지는 문제가 있었습니다.
  // 대신 rangeStart(제목 행 시작)부터 태그 깊이(depth)를 직접 추적합니다 — 제목 행, 그 뒤의
  // 장식/여백 행, 카드 그리드 행이 전부 "형제(sibling) <tr>"이므로, depth가 0으로 돌아올
  // 때마다 "형제 행 하나가 완전히 끝났다"는 뜻입니다. endIdx(마지막 필드)를 지나고서 처음
  // depth가 0이 되는 지점 = 그 형제 행이 끝나는 지점이며, 항상 태그 짝이 맞습니다.
  const tagRe = /<!--[\s\S]*?-->|<[a-zA-Z][a-zA-Z0-9]*(?:\s[^>]*)?\/?>|<\/[a-zA-Z][a-zA-Z0-9]*\s*>/g;

  // ⚠️ 제목 행(rangeStart)이 그 자체로 최상위 형제가 아니라, 더 바깥 wrapper 안에서 밑줄
  // 장식 행 같은 다른 형제 행과 나란히 있는 구조일 수 있습니다(예: <table>가 제목 행과
  // 밑줄 행 두 개를 함께 감쌈). 그리고 하이브리드 그리드(.hgrid/.hcell, div+table 혼합)처럼
  // 카드마다 반복되는 구조는 "숫자로만 잰 깊이"가 진짜 형제 경계가 아닌 곳에서도 우연히
  // rangeStart와 같은 깊이를 지나칠 수 있습니다(카드 하나가 닫힐 때마다). 그래서 깊이
  // 숫자가 아니라 "열린 태그 이름의 전체 스택"이 rangeStart 시점과 정확히 같아지는
  // 지점을 찾습니다 — 스택 내용까지 같아야 진짜로 같은 조상 레벨로 돌아온 것이기
  // 때문에, 우연히 개수만 같은 지점에서는 멈추지 않습니다.
  function stackAt(pos) {
    tagRe.lastIndex = 0;
    const stack = [];
    let m;
    while ((m = tagRe.exec(html)) && m.index < pos) {
      const t = m[0];
      if (t.startsWith("<!--")) continue;
      if (t.startsWith("</")) stack.pop();
      else if (!t.endsWith("/>")) stack.push(t.match(/^<([a-zA-Z][a-zA-Z0-9]*)/)[1].toLowerCase());
    }
    return stack;
  }
  const baseStack = stackAt(rangeStart);
  const baseKey = baseStack.join(">");

  tagRe.lastIndex = rangeStart;
  const stack = baseStack.slice();
  let rangeEnd = -1;
  let tm;
  while ((tm = tagRe.exec(html))) {
    const tok = tm[0];
    if (tok.startsWith("<!--")) continue;
    if (tok.startsWith("</")) {
      stack.pop();
      if (stack.join(">") === baseKey && tm.index + tok.length > endIdx) { rangeEnd = tm.index + tok.length; break; }
    } else if (!tok.endsWith("/>")) {
      stack.push(tok.match(/^<([a-zA-Z][a-zA-Z0-9]*)/)[1].toLowerCase());
    }
  }
  if (rangeEnd === -1) return html;

  // rangeEnd 이후에도 이 필드를 감싸던 상위 </tr> 하나가 더 남을 수 있으므로, 바로 뒤가
  // 공백만 두고 </tr>이면 그것까지 포함해서 tr 짝이 확실히 맞도록 합니다.
  const afterGap = html.slice(rangeEnd).match(/^\s*/)[0].length;
  if (html.slice(rangeEnd + afterGap, rangeEnd + afterGap + 5).toLowerCase() === "</tr>") {
    rangeEnd = rangeEnd + afterGap + 5;
  }

  if (rangeEnd <= rangeStart) return html;

  // ⚠️ 각 섹션이 "자기 여백을 포함"하는 구조지만, 실제로는 두 가지 패턴이 섞여 있습니다:
  // (a) 이 섹션이 위쪽 여백만 갖고 아래쪽은 0 — 그 다음 섹션의 위쪽 여백이 사실상 이
  //     섹션의 아래쪽 여백 역할을 함, 또는
  // (b) 이 섹션이 아래쪽 여백을 갖고, 그 다음 섹션은 위쪽 여백이 0 — 이 섹션이 사실상
  //     다음 섹션의 위쪽 여백까지 책임짐(쿠폰 블록이 그 예: 자기 wrapper가 padding-bottom
  //     40px를 갖고, 다음 c_headline_2 섹션은 위쪽 0).
  // 어느 경우든, 지우는 섹션이 "여백 제공자" 역할을 하고 있었다면, 완전히 지웠을 때 그
  // 여백 제공자가 사라져서 다음 콘�텐츠가 위쪽 내용에 딱 붙어버립니다. 그래서:
  // 1) 뒤에 아무 콘텐츠도 안 남으면(문서 끝) → 지우는 섹션의 위쪽 여백 크기로 spacer.
  // 2) 뒤에 남는 다음 섹션(<td class="pad">)이 위쪽 여백을 0으로 갖고 있으면 → 지우는
  //    섹션의 마지막 wrapper가 갖고 있던 "아래쪽" 여백 크기로 spacer.
  const tail = html.slice(rangeEnd);
  const strippedTail = tail.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").trim();
  const isLastVisibleBlock = strippedTail.length === 0 && !tail.includes("{{");

  let nextHasZeroTopPadding = false;
  if (!isLastVisibleBlock) {
    const nextPadMatch = tail.match(/<td class="pad"(?=[\s>])[^>]*style="padding:([^"]+)"/);
    if (nextPadMatch && paddingSides(nextPadMatch[1]).top === 0) nextHasZeroTopPadding = true;
  }

  if (isLastVisibleBlock || nextHasZeroTopPadding) {
    const removedSpan = html.slice(rangeStart, rangeEnd);
    const padMatches = [...removedSpan.matchAll(/class="pad"(?=[\s>])[^>]*style="padding:([^"]+)"/g)];
    let spacerHeight = 40;
    if (isLastVisibleBlock) {
      // 뒤에 아무것도 없으면, 이 섹션이 원래 갖고 있던 "위쪽" 여백 크기를 씀
      const first = padMatches[0];
      spacerHeight = first ? paddingSides(first[1]).top : 40;
    } else {
      // 다음 섹션이 위쪽 여백이 0이면, 이 섹션의 마지막 wrapper가 갖고 있던 "아래쪽" 여백 크기를 씀
      const last = padMatches[padMatches.length - 1];
      spacerHeight = last ? paddingSides(last[1]).bottom : 40;
    }
    if (!spacerHeight) spacerHeight = 40;
    const spacerRow = `<tr><td height="${spacerHeight}" style="height:${spacerHeight}px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
    return html.slice(0, rangeStart) + spacerRow + html.slice(rangeEnd);
  }

  return html.slice(0, rangeStart) + html.slice(rangeEnd);
}

function stripHiddenUnits(html, hiddenRowKeys = [], hiddenCardKeys = [], hiddenSectionSpans = []) {
  let result = html;
  // ⚠️ 섹션 전체를 지울 때는 "제목 시작 지점"부터 "마지막 필드 끝 지점"까지를 하나의
  // 구간으로 통째로 잘라냅니다. 개별 행/카드를 하나씩 지우는 것보다 훨씬 안전합니다 —
  // 중간에 {{}} 없는 여백/장식 행이 몇 개가 껴있든 다 같이 사라지므로, "빈 여백이 남는"
  // 문제 자체가 생기지 않습니다. 이 처리가 끝난 필드들은 아래 개별 처리에서 건너뜁니다.
  const spannedKeys = new Set();
  for (const span of hiddenSectionSpans) {
    result = removeSectionSpan(result, span.start, span.end);
    for (const k of span.allKeys || []) spannedKeys.add(k);
  }

  const hiddenSet = new Set(hiddenRowKeys);
  for (const key of hiddenCardKeys) {
    if (spannedKeys.has(key)) continue;
    result = removeEnclosingTag(result, `{{${key}}}`, "td", true);
  }
  const blankOnly = [];
  for (const key of hiddenRowKeys) {
    if (spannedKeys.has(key)) continue;
    // ⚠️ copy_sub/copy_sub_strong처럼 <br/> 하나로만 나뉘어 같은 <td> 안에 같이 있는
    // 필드가 있습니다. 이런 경우 행을 통째로 지우면 옆에 있는(숨기려 하지 않은) 필드까지
    // 같이 사라집니다. 지우기 전에 "이 행 안에 다른 살려야 할 변수가 있는지" 먼저
    // 확인하고, 있으면 행 삭제를 포기하고 이 값만 빈 문자열로 대체합니다.
    if (rowContainsOtherLiveField(result, key, hiddenSet)) {
      blankOnly.push(key);
      // ⚠️ 값만 비우면 원래 있던 {{key}}<br/> 의 <br/>이 그대로 남아서 빈 줄이 생깁니다.
      // {{key}} 바로 앞이나 뒤에 붙어있는 <br/>을 같이 제거해서 빈 줄 없이 자연스럽게
      // 다음 줄로 이어지게 합니다.
      result = removeAdjacentBr(result, key);
      continue;
    }
    const isHeading = key.startsWith("c_headline");
    result = isHeading
      ? removeEnclosingTag(result, `{{${key}}}`, "tr", false, true)
      : removeFieldRowPreservingGap(result, key);
  }
  return { html: result, blankOnly };
}

/** {{key}} 바로 앞 또는 뒤에 공백 없이 붙어있는 <br/> 하나를 제거합니다(값을 비운 자리에
 *  줄바꿈만 남아 빈 줄처럼 보이는 것을 방지). */
function removeAdjacentBr(html, key) {
  const marker = `{{${key}}}`;
  const brRe = /<br\s*\/?>/i;
  // 뒤에 붙은 경우: {{key}}<br/>
  const afterIdx = html.indexOf(marker);
  if (afterIdx !== -1) {
    const after = html.slice(afterIdx + marker.length);
    const m = after.match(brRe);
    if (m && m.index === 0) {
      return html.slice(0, afterIdx + marker.length) + after.slice(m[0].length);
    }
  }
  // 앞에 붙은 경우: <br/>{{key}}
  const idx = html.indexOf(marker);
  if (idx !== -1) {
    const before = html.slice(0, idx);
    const m = before.match(new RegExp(brRe.source + "$", "i"));
    if (m) {
      return html.slice(0, idx - m[0].length) + html.slice(idx);
    }
  }
  return html;
}

/** key의 {{}}를 감싸는 <tr>을 실제로 찾아서, 그 안에 hiddenSet에 없는(=살려야 하는)
 *  다른 {{다른변수}}가 있는지 확인합니다. */
function rowContainsOtherLiveField(html, key, hiddenSet) {
  const marker = `{{${key}}}`;
  const markerIdx = html.indexOf(marker);
  if (markerIdx === -1) return false;

  const openTagFullRe = /<tr(?=[\s>])[^>]*>/gi;
  let opens = [];
  let om;
  while ((om = openTagFullRe.exec(html)) && om.index < markerIdx) opens.push(om.index);
  if (!opens.length) return false;

  const tokenRe = /<tr(?=[\s>])[^>]*>|<\/tr>/gi;
  for (let k = opens.length - 1; k >= 0; k--) {
    const start = opens[k];
    const end = findMatchingClose(html, start, tokenRe);
    if (end !== -1 && end > markerIdx) {
      const rowContent = html.slice(start, end);
      const otherVars = [...rowContent.matchAll(/\{\{([a-zA-Z_0-9]+)\}\}/g)].map(m => m[1]);
      return otherVars.some(v => v !== key && !hiddenSet.has(v));
    }
  }
  return false;
}
/** {{image_N}}<!-- 발송 시 교체: <img .../> --> 패턴을 실제 <img> 태그로 교체(값 있을 때)
 *  ⚠️ 이미지가 클릭 가능한 링크(<a>)로 감싸인 템플릿(NO.11 링크그리드, NO.15 상품그리드)은
 *  {{image_N}}</a><!--...--> 처럼 닫는 태그가 끼어있어서, 그 경우도 인식하도록 (?:<\/a>)?를 넣었습니다.
 *  ⚠️ 원본 템플릿의 img 태그는 alt=""로 비어있어서 가이드라인 검사에서 "alt 없음" 경고가 뜹니다.
 *  values에 "{key}_alt" 값이 있으면(예: 상품명) 그걸로 채우고, 없으면 일반 안내 문구로 대체합니다. */
function substituteImages(html, values, labelMap) {
  return html.replace(
    // ⚠️ 2026-09 버그 수정 — 원본 템플릿은 빈 슬롯일 때 "여기 이미지 넣으세요"
    // 안내처럼 회색 테두리(border:1px solid #DFDFDF)가 있는 <td>로 placeholder를
    // 감싸두는데, 실제 이미지로 치환될 때(발송 시 교체 주석의 <img border:0>)는
    // 이미지 자체에만 border:0이 적용될 뿐, 그 이미지를 담고 있는 부모 <td>의
    // 테두리는 전혀 안 건드려져서 그대로 남아있었습니다 — 실제 이미지를 넣어도
    // 액자처럼 회색 테두리가 계속 보이는 원인이었습니다. 앞쪽 <td ... style="...">
    // 부분을 통째로 하나의 선택적(optional) 그룹으로 매칭해서, 이미지가 있을 때만
    // 그 style에서 테두리를 제거합니다(값이 없을 때는 원래대로 "여기 이미지
    // 넣으세요" 테두리를 유지). ⚠️ 반드시 그룹 전체를 (?:...)?로 감싸야 합니다 —
    // 이 <td> 구조가 없는 템플릿(예: 상품그리드형)도 있는데, 개별 서브그룹만
    // 선택적으로 두면 그 부분이 없을 때 패턴 전체가 매칭 실패해서 이미지 자체가
    // 통째로 치환 안 되는 심각한 회귀가 났었습니다.
    /(?:(<td\b[^>]*\bstyle="[^"]*)(border:1px solid #DFDFDF;)([^"]*"[^>]*>))?\{\{(image_[a-zA-Z0-9_]+)\}\}(<\/a>)?<!--\s*발송 시 교체:\s*(<img[^>]*>)\s*-->/g,
    (match, tdBefore, borderStyle, tdAfter, key, closingTag, imgTag) => {
      const url = values[key];
      const closing = closingTag || "";
      const label = labelMap?.[key] || key;
      const tdPrefix = tdBefore != null ? tdBefore + (url ? "" : borderStyle) + tdAfter : "";
      if (url) {
        const altText = values[`${key}_alt`] || "상품/콘텐츠 이미지";
        const withSrc = imgTag.replace(`{{${key}}}`, esc(url));
        const withAlt = withSrc.replace(/alt="[^"]*"/, `alt="${esc(altText)}"`);
        // ⚠️ 미리보기 전용 식별용 — 왼쪽 폼의 "이미지1" 등과 오른쪽 미리보기의
        // 실제 위치를 매칭할 방법이 없어서, 어느 슬롯인지 호버로 확인할 수 있게
        // <img> 태그 자체에 data-image-key/data-image-label을 심어둡니다. 폼에
        // 표시되는 라벨(예: "이미지 2")과 실제 키(예: image_7)가 항상 같은 숫자를
        // 쓰는 게 아니라서(라벨은 실제 화면 순서 기준으로 재조정될 수 있음),
        // 키에서 숫자만 뽑아 추측하면 폼과 다른 값이 나올 수 있습니다 — 그래서
        // 폼이 실제로 보여주는 라벨 문자열을 그대로 심어서 100% 일치시킵니다.
        // 발송용 실제 HTML에는 영향 없는 속성이라(이메일 클라이언트가 무시함)
        // 그대로 둬도 안전합니다.
        const withKey = withAlt.replace("<img ", `<img data-image-key="${esc(key)}" data-image-label="${esc(label)}" `);
        return tdPrefix + withKey + closing;
      }
      return tdPrefix + `<span data-image-key="${esc(key)}" data-image-label="${esc(label)}" style="color:#c9a227;font-style:italic;font-size:11px;">${esc(label)}</span>` + closing;
    }
  );
}

/** 나머지 모든 {{변수}} 치환. ESP 병합 태그는 그대로 남기고, 값이 없는 필드는 빈 문자열로
 *  치환합니다(레이아웃 자체는 원본 그대로 유지되고, 텅 빈 자리로만 보임 — 실제 발송 전에
 *  가이드라인 검사에서 "값이 비어있음"을 별도로 잡아내는 걸 전제로 합니다). */
/** ⚠️ 미리보기에서 직접 편집 가능하게 하려고, text/textarea 타입 필드만
 *  <span data-field="key">로 감쌉니다. link/image 타입은 href="{{...}}"처럼
 *  속성값 안에서 쓰이는 경우가 있어서, 거기다 <span>을 넣으면 HTML 자체가
 *  깨집니다(태그를 속성값 문자열 안에 넣을 수 없음) — 그래서 반드시 타입으로
 *  구분해서 텍스트 계열만 감싸야 합니다. LP의 LP_PREVIEW_EDIT_SCRIPT와 같은
 *  방식(부모 창이 postMessage로 편집 내용을 받아 처리)을 그대로 씁니다.
 *  ⚠️ 같은 <td> 안에 필드가 두 개 붙어있는 경우(예: {{copy_sub}}<br/>
 *  <strong>{{copy_sub_strong}}</strong>)가 실제로 있어서, 부모 요소가 아니라
 *  치환되는 값 하나하나를 개별로 감싸야 각 필드가 독립적으로 편집됩니다. */
/** 버튼 문구 필드(btn_N, cta_label 등)마다, 같은 <a href="{{링크키}}">에 묶여있는
 *  링크 필드가 뭔지 원본 템플릿(치환 전)에서 찾아둡니다. 실제 확인 결과 항상
 *  `<a href="{{링크}}" style="...">​{{버튼문구}}` 형태로, href와 내용 사이에
 *  스타일 속성 외엔 다른 텍스트/태그가 없어서 이 정규식으로 안전하게 찾을 수
 *  있습니다. 이 짝을 알아야, 미리보기에서 버튼 문구를 클릭했을 때 "문구+링크를
 *  같이 고치는 팝업"에 어떤 링크 필드를 같이 보여줄지 알 수 있습니다. */
function findLinkFieldPairs(rawHtml, buttonLabelKeys) {
  const pairs = {};
  for (const labelKey of buttonLabelKeys) {
    const re = new RegExp(`<a href="\\{\\{([a-zA-Z_0-9]+)\\}\\}"[^>]*>\\s*\\{\\{${labelKey}\\}\\}`);
    const m = rawHtml.match(re);
    if (m) pairs[labelKey] = m[1];
  }
  return pairs;
}

function substituteRest(html, values, textFieldKeys, linkFieldPairs) {
  return html.replace(/\{\{([a-zA-Z_0-9]+)\}\}/g, (match, key) => {
    if (ESP_MERGE_TAGS.has(key)) return match;
    const v = values[key];
    const text = v !== undefined && v !== null && v !== "" ? esc(String(v)) : "";
    if (textFieldKeys.has(key)) {
      const linkKey = linkFieldPairs[key];
      const linkAttr = linkKey ? ` data-link-field="${linkKey}"` : "";
      return `<span data-field="${key}"${linkAttr}>${text}</span>`;
    }
    return text;
  });
}

/**
 * @param {string} templateId edmTemplateHtml.js의 키 (예: "edm-no05-onboarding")
 * @param {Record<string, string>} values {{변수명}} → 실제 값
 * @param {{hiddenRowKeys?: string[], hiddenCardKeys?: string[]}} [options] 숨길 필드(행 단위)/상품카드(카드 단위)
 * @returns {string} 완성된 EDM HTML
 */
export function assembleEdmHtml(templateId, values = {}, options = {}) {
  const raw = EDM_TEMPLATE_HTML[templateId];
  if (!raw) {
    return `<p style="font-family:sans-serif;color:#c62828;">템플릿을 찾을 수 없습니다: ${esc(templateId)}</p>`;
  }
  const stripped = stripHiddenUnits(raw, options.hiddenRowKeys, options.hiddenCardKeys, options.hiddenSectionSpans);
  let html = stripped.html;
  // 행 전체 삭제가 아니라 값만 비우는 쪽으로 전환된 필드(같은 줄에 다른 살아있는 필드가
  // 있던 경우)는, values에 남아있을 수 있는 원래 텍스트나 [라벨] 안내문구를 덮어써서
  // 확실히 빈 값으로 만듭니다.
  const finalValues = { ...values };
  for (const key of stripped.blankOnly) finalValues[key] = "";
  // ⚠️ text/textarea 타입만 골라서 substituteRest에 넘깁니다 — link/image 타입은
  // 절대 <span>으로 감싸면 안 됩니다(속성값 안에서 쓰이므로).
  const textFieldKeys = new Set(
    (EDM_TEMPLATE_FIELDS[templateId]?.fields || [])
      .filter(f => f.type === "text" || f.type === "textarea" || f.type === "button-label" || f.type === "coupon-field")
      .map(f => f.key)
  );
  const buttonLabelKeys = (EDM_TEMPLATE_FIELDS[templateId]?.fields || [])
    .filter(f => f.type === "button-label")
    .map(f => f.key);
  const linkFieldPairs = findLinkFieldPairs(raw, buttonLabelKeys);
  // ⚠️ 미리보기 호버 툴팁이 폼과 정확히 같은 라벨을 보여주도록, 스키마의
  // 실제 label 문자열을 그대로 맵으로 만들어 넘깁니다(키에서 숫자만 추측하면
  // 라벨 재조정 시 폼과 어긋날 수 있음 — 실제로 이 문제를 겪었습니다).
  const imageLabelMap = {};
  for (const f of (EDM_TEMPLATE_FIELDS[templateId]?.fields || [])) {
    if (f.type === "image") imageLabelMap[f.key] = f.label;
  }
  html = substituteImages(html, finalValues, imageLabelMap);
  html = substituteRest(html, finalValues, textFieldKeys, linkFieldPairs);
  html = collapseAdjacentSpacers(html);
  return html;
}

/** 섹션/카드를 지우고 나면, 원래 그 섹션의 앞뒤를 감싸던 순수 여백용 spacer 행
 *  (<tr><td height="N">&nbsp;</td></tr> 형태, {{변수}} 없이 그냥 간격만 주던 행)이
 *  서로 바로 붙어버려서 여백이 이상하게 커 보일 수 있습니다. 이런 spacer 행이 공백만
 *  두고 연달아 나오면, 그중 가장 큰 높이 하나만 남기고 나머지는 제거합니다. */
function collapseAdjacentSpacers(html) {
  const spacerRowRe = /<tr>\s*<td[^>]*height="(\d+)"[^>]*>\s*(?:&nbsp;)?\s*<\/td>\s*<\/tr>/gi;
  return html.replace(
    new RegExp(`(?:${spacerRowRe.source}\\s*)+`, "gi"),
    match => {
      const heights = [...match.matchAll(spacerRowRe)].map(m => parseInt(m[1], 10));
      if (heights.length <= 1) return match;
      const maxHeight = Math.max(...heights);
      const single = [...match.matchAll(spacerRowRe)][0][0];
      return single.replace(/height="\d+"/, `height="${maxHeight}"`).replace(/height:\d+px/, `height:${maxHeight}px`);
    }
  );
}

// ⚠️ 2026-09 신설 — EDM "완전 프리 템플릿" 파일럿: 6개 헤더 + 3개 섹션 블록을
// 자유롭게 조합할 수 있는 데이터 구조입니다. LP의 EVOLUTION_BLOCK_TYPES와
// 동일한 패턴(label/html/fields)을 따릅니다. 각 블록의 html은 18개 기존
// EDM 템플릿에서 실제로 추출한 원본 마크업이며, 태그(tr/table/td) 여닫힘
// 균형을 전수 검증했습니다 — 이메일 HTML은 일반 웹페이지보다 구조가
// 엄격해서(Outlook 호환 테이블 레이아웃), 블록 하나만 잘못 잘라도 전체
// 레이아웃이 깨질 수 있습니다.

// 모든 템플릿이 공유하는 바깥 wrapper(전처리/전체 배경/600px 흰 배경 박스).
// 헤더/섹션 블록들은 이 안에 들어가는 콘텐츠만 담당합니다.
// ⚠️ 2026-09 버그 수정 — 프리템플릿 HTML이 <body>로 바로 시작해서 <head>/<meta
// charset> 자체가 없었습니다. 가이드라인 검사(checkUtf8Charset, shared.js)가 이걸
// 찾다가 못 찾아서 "UTF-8 charset 메타 태그가 없습니다" 경고를 냈던 것입니다.
// 기존 18개 고정 템플릿(edmTemplateHtml.js)과 동일한 <head> 구조를 그대로 맞춰서
// 해결합니다.
export const EDM_SHELL_OPEN = "<!DOCTYPE html>\n<html lang=\"ko\" xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\">\n<head>\n<meta charset=\"utf-8\" />\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />\n<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />\n<meta name=\"color-scheme\" content=\"light dark\" />\n<meta name=\"supported-color-schemes\" content=\"light dark\" />\n<title>자유 조합 템플릿</title>\n<style type=\"text/css\">\n  body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}\n  table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}\n  img{border:0;outline:none;-ms-interpolation-mode:bicubic;}\n  a{color:#025FAE;}\n  @media only screen and (max-width:599px){\n    .w600{width:100%!important;max-width:100%!important;}\n    .fw{width:100%!important;max-width:100%!important;}\n    .fwc{width:auto!important;}\n    .stripeA{width:72%!important;}\n    .stripeB{width:28%!important;}\n    .col{display:block!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;}\n    .gapcol{display:block!important;width:100%!important;height:14px!important;line-height:14px!important;font-size:0!important;}\n    .pad{padding-left:16px!important;padding-right:16px!important;}\n    .hpad{padding:30px 18px 32px 18px!important;}\n    .rowt,.rowt>tbody,.rowt>tbody>tr{display:block!important;width:100%!important;}\n    .rowt>tbody>tr{font-size:0!important;text-align:center!important;}\n    .rowt .gapcol{display:none!important;}\n    .up2{display:inline-block!important;width:50%!important;max-width:50%!important;vertical-align:top!important;box-sizing:border-box!important;padding:0 4px 12px 4px!important;}\n    .up3{display:inline-block!important;width:33.3%!important;max-width:33.3%!important;vertical-align:top!important;box-sizing:border-box!important;padding:0 3px 10px 3px!important;}\n    .hgrid{text-align:left!important;}\n    .hcell{width:50%!important;padding:0 4px 12px 4px!important;}\n    .fluidimg{width:100%!important;height:auto!important;}\n    img{max-width:100%;}\n  }\n</style>\n</head>\n<body style=\"margin:0;padding:0;background-color:#F4F4F4;\">\n<span style=\"display:none;font-size:0;line-height:0;max-height:0;opacity:0;overflow:hidden;mso-hide:all;\">{{preheader}}</span>\n<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"width:100%;background-color:#F4F4F4;\"><tr><td align=\"center\" style=\"padding:0;\">\n  <table role=\"presentation\" class=\"w600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" bgcolor=\"#FFFFFF\" style=\"width:600px;background-color:#FFFFFF;\">\n";
export const EDM_SHELL_CLOSE = "  </table>\n</td></tr></table>\n</body>\n</html>";

export const EDM_HEADER_TYPES = {
  onboarding: {
    label: "\ud30c\ub791+\ub178\ub791 \uc2a4\ud2b8\ub77c\uc774\ud504, \uc54c\uc57d\ud615 \ubc30\uc9c0",
    html: "\n\n      <tr><td bgcolor=\"#FFFFFF\" style=\"background-color:#FFFFFF;padding:0;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;border-collapse:collapse;\">\n          <tr><td class=\"fwc\" width=\"600\" style=\"width:600px;font-size:0;line-height:0;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\"><tr><td class=\"stripeA\" width=\"430\" height=\"3\" bgcolor=\"#0F218B\" style=\"width:430px;height:3px;background-color:#0F218B;font-size:0;line-height:0;\">&nbsp;</td><td class=\"stripeB\" width=\"170\" height=\"3\" bgcolor=\"#FFCC00\" style=\"width:170px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr>\n          <tr><td class=\"fwc\" width=\"600\" style=\"width:600px;padding:0;\">\n            <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\">\n              <tr>\n                <td width=\"5\" bgcolor=\"#0F218B\" style=\"width:5px;background-color:#0F218B;font-size:0;line-height:0;\">&nbsp;</td>\n                <td class=\"fwc hpad\" width=\"531\" align=\"center\" style=\"width:531px;padding:42px 32px 46px 32px;\">\n                  <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"531\" style=\"width:531px;border-collapse:collapse;\">\n                    <tr><td align=\"center\" style=\"padding:0 0 26px 0;\">\n                      <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;\"><tr><td bgcolor=\"#E8EBF5\" style=\"background-color:#E8EBF5;border-radius:14px;padding:8px 18px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:13px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.2em;color:#0F218B;\">{{badge_text}}</td></tr></table>\n                    </td></tr>\n                    <tr><td align=\"center\" style=\"font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:24px;line-height:36px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;\">{{customer_name}} \uace0\uac1d\ub2d8,<br />{{copy_headline}}</td></tr>\n                    <tr><td align=\"center\" style=\"padding:24px 0 22px 0;font-size:0;line-height:0;\">\n                      <table  role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"44\" style=\"width:44px;border-collapse:collapse;\"><tr><td width=\"44\" height=\"3\" bgcolor=\"#FFCC00\" style=\"width:44px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;\">&nbsp;</td></tr></table>\n                    </td></tr>\n                    <tr><td align=\"center\" style=\"font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;\">{{copy_sub}}<br /><strong style=\"color:#0F218B;\">{{copy_sub_strong}}</strong></td></tr>\n                  </table>\n                </td>\n              </tr>\n            </table>\n          </td></tr>\n          <tr><td class=\"fwc\" width=\"600\" style=\"width:600px;font-size:0;line-height:0;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"600\" height=\"1\" bgcolor=\"#EEEEEE\" style=\"width:600px;height:1px;background-color:#EEEEEE;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr>\n        </table>\n      </td></tr>",
    fields: [{"key": "badge_text", "label": "배지 문구", "type": "text"}, {"key": "customer_name", "label": "고객명", "type": "text"}, {"key": "copy_headline", "label": "헤드라인", "type": "text"}, {"key": "copy_sub", "label": "서브카피", "type": "text"}, {"key": "copy_sub_strong", "label": "서브카피(강조)", "type": "text"}]
  },
  nurture: {
    label: "\uc138\ub85c\uc120 \uad6c\ubd84, \ucc28\ubd84\ud55c \ud1a4",
    html: "\n\n      <tr><td bgcolor=\"#FFFFFF\" style=\"background-color:#FFFFFF;padding:0;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;border-collapse:collapse;\">\n          <tr><td class=\"fwc\" width=\"600\" style=\"width:600px;padding:0;\">\n            <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\">\n              <tr>\n                <td class=\"fwc hpad\" width=\"600\" align=\"center\" style=\"width:600px;box-sizing:border-box;padding:44px 32px 48px 32px;\">\n                  <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"536\" style=\"width:536px;table-layout:fixed;border-collapse:collapse;\">\n                    <tr><td class=\"fwc\" width=\"536\" align=\"center\" style=\"width:536px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;text-indent:0.14em;color:#0F218B;word-break:break-word;overflow-wrap:break-word;\">{{badge_text}}</td></tr>\n                    <tr><td align=\"center\" style=\"padding:18px 0 20px 0;font-size:0;line-height:0;\">\n                      <table  role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"1\" style=\"width:1px;border-collapse:collapse;\"><tr><td width=\"1\" height=\"26\" bgcolor=\"#C9CDDB\" style=\"width:1px;height:26px;background-color:#C9CDDB;font-size:0;line-height:0;\">&nbsp;</td></tr></table>\n                    </td></tr>\n                    <tr><td align=\"center\" style=\"font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:24px;line-height:36px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;\">{{copy_headline}}</td></tr>\n                    <tr><td align=\"center\" style=\"padding:22px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;\">{{copy_sub}}</td></tr>\n                  </table>\n                </td>\n              </tr>\n            </table>\n          </td></tr>\n          <tr><td class=\"fwc\" width=\"600\" style=\"width:600px;font-size:0;line-height:0;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"240\" height=\"3\" bgcolor=\"#0F218B\" style=\"width:240px;height:3px;background-color:#0F218B;font-size:0;line-height:0;\">&nbsp;</td><td class=\"fwc\" width=\"360\" height=\"3\" bgcolor=\"#EEEEEE\" style=\"width:360px;height:3px;background-color:#EEEEEE;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr>\n        </table>\n      </td></tr>",
    fields: [{"key": "badge_text", "label": "배지 문구", "type": "text"}, {"key": "copy_headline", "label": "헤드라인", "type": "text"}, {"key": "copy_sub", "label": "서브카피", "type": "text"}]
  },
  winback: {
    label: "\uac80\uc815+\ub178\ub780 \uc0ac\uc774\ub4dc\ubc14",
    html: "\n\n      <tr><td bgcolor=\"#000000\" style=\"background-color:#000000;padding:0;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\">\n          <tr>\n            <td class=\"fwc sidebar\" width=\"88\" bgcolor=\"#FFCC00\" style=\"width:88px;background-color:#FFCC00;font-size:0;line-height:0;\">&nbsp;</td>\n            <td class=\"fwc hpad\" width=\"512\" valign=\"top\" style=\"width:512px;box-sizing:border-box;padding:42px 32px 44px 28px;\">\n              <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"452\" style=\"width:452px;table-layout:fixed;border-collapse:collapse;\">\n                <tr><td class=\"fwc\" width=\"452\" style=\"width:452px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;color:#FFCC00;word-break:break-word;overflow-wrap:break-word;\">{{badge_text}}</td></tr>\n                <tr><td style=\"padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:26px;line-height:37px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;letter-spacing:-0.02em;\">{{copy_headline}}</td></tr>\n                <tr><td style=\"padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#A7A7A7;\">{{copy_sub}}</td></tr>\n              </table>\n            </td>\n          </tr>\n        </table>\n      </td></tr>",
    fields: [{"key": "badge_text", "label": "배지 문구", "type": "text"}, {"key": "copy_headline", "label": "헤드라인", "type": "text"}, {"key": "copy_sub", "label": "서브카피", "type": "text"}]
  },
  product: {
    label: "\uac80\uc815 \ubc30\uacbd, \ub178\ub780 \ud14c\ub450\ub9ac \ubc30\uc9c0",
    html: "\n\n      <tr><td bgcolor=\"#000000\" style=\"background-color:#000000;padding:0;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\">\n          <tr><td class=\"fwc hpad\" width=\"600\" valign=\"top\" style=\"width:600px;box-sizing:border-box;padding:36px 32px 38px 32px;\">\n            <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"536\" style=\"width:536px;table-layout:fixed;border-collapse:collapse;\">\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;padding:0 0 16px 0;\"><table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;\"><tr><td style=\"box-sizing:border-box;border:1px solid #FFCC00;padding:6px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;color:#FFCC00;\">{{badge_text}}</td></tr></table></td></tr>\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:27px;line-height:36px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;letter-spacing:-0.02em;\">{{customer_name}} \uace0\uac1d\ub2d8,<br />{{copy_headline}}</td></tr>\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;padding:20px 0 0 0;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"536\" style=\"width:536px;table-layout:fixed;border-collapse:collapse;\"><tr><td width=\"3\" bgcolor=\"#FFCC00\" style=\"width:3px;background-color:#FFCC00;font-size:0;line-height:0;\">&nbsp;</td><td class=\"fwc\" width=\"533\" bgcolor=\"#2A2A2A\" style=\"width:533px;box-sizing:border-box;background-color:#2A2A2A;padding:11px 16px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#FFFFFF;\">{{copy_sub}}</td></tr></table></td></tr>\n            </table>\n          </td></tr>\n          <tr><td class=\"fwc\" width=\"600\" style=\"width:600px;font-size:0;line-height:0;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"400\" height=\"5\" bgcolor=\"#000000\" style=\"width:400px;height:5px;background-color:#000000;font-size:0;line-height:0;\">&nbsp;</td><td class=\"fwc\" width=\"200\" height=\"5\" bgcolor=\"#FFCC00\" style=\"width:200px;height:5px;background-color:#FFCC00;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr>\n        </table>\n      </td></tr>",
    fields: [{"key": "badge_text", "label": "배지 문구", "type": "text"}, {"key": "customer_name", "label": "고객명", "type": "text"}, {"key": "copy_headline", "label": "헤드라인", "type": "text"}, {"key": "copy_sub", "label": "서브카피", "type": "text"}]
  },
  coupon: {
    label: "\ud070 \ud560\uc778\uc728 \uac15\uc870",
    html: "\n\n      <tr><td bgcolor=\"#FFFFFF\" style=\"background-color:#FFFFFF;padding:0;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\">\n          <tr><td class=\"fwc hpad\" width=\"600\" valign=\"top\" style=\"width:600px;box-sizing:border-box;padding:40px 32px 40px 32px;\">\n            <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"536\" style=\"width:536px;table-layout:fixed;border-collapse:collapse;\">\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;color:#0F218B;\">{{badge_text}}</td></tr>\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;padding:16px 0 0 0;\">\n                <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"536\" style=\"width:536px;border-collapse:collapse;\">\n                  <tr>\n                    <td valign=\"bottom\" style=\"font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:70px;line-height:66px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;letter-spacing:-0.05em;white-space:nowrap;\">{{rate}}<span style=\"font-size:38px;line-height:40px;letter-spacing:-0.02em;\"> \ud560\uc778</span></td>\n                  </tr>\n                </table>\n              </td></tr>\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;padding:12px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:22px;line-height:32px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;letter-spacing:-0.02em;\">{{copy_headline}}</td></tr>\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;padding:12px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;\">{{customer_name}} \uace0\uac1d\ub2d8, {{copy_sub}}</td></tr>\n            </table>\n          </td></tr>\n          <tr><td class=\"fwc\" width=\"600\" style=\"width:600px;font-size:0;line-height:0;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"240\" height=\"5\" bgcolor=\"#FFCC00\" style=\"width:240px;height:5px;background-color:#FFCC00;font-size:0;line-height:0;\">&nbsp;</td><td class=\"fwc\" width=\"360\" height=\"5\" bgcolor=\"#EEEEEE\" style=\"width:360px;height:5px;background-color:#EEEEEE;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr>\n        </table>\n      </td></tr>",
    fields: [{"key": "badge_text", "label": "배지 문구", "type": "text"}, {"key": "rate", "label": "할인율", "type": "text"}, {"key": "copy_headline", "label": "헤드라인", "type": "text"}, {"key": "customer_name", "label": "고객명", "type": "text"}, {"key": "copy_sub", "label": "서브카피", "type": "text"}]
  },
  insideSales: {
    label: "\ud30c\ub780 \uc2a4\ud2b8\ub77c\uc774\ud504",
    html: "\n\n      <tr><td bgcolor=\"#FFFFFF\" style=\"background-color:#FFFFFF;padding:0;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\">\n          <tr><td class=\"fwc\" width=\"600\" style=\"width:600px;font-size:0;line-height:0;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"600\" height=\"3\" bgcolor=\"#0F218B\" style=\"width:600px;height:3px;background-color:#0F218B;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr>\n          <tr><td class=\"fwc hpad\" width=\"600\" valign=\"top\" style=\"width:600px;box-sizing:border-box;padding:40px 32px 44px 32px;\">\n            <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"536\" style=\"width:536px;table-layout:fixed;border-collapse:collapse;\">\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;padding:0 0 22px 0;\">\n                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;\"><tr><td bgcolor=\"#E8EBF5\" style=\"background-color:#E8EBF5;padding:9px 16px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;color:#0F218B;\">{{badge_text}}</td></tr></table>\n              </td></tr>\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:24px;line-height:35px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;letter-spacing:-0.02em;\">{{customer_name}} \uace0\uac1d\ub2d8,<br />{{copy_headline}}</td></tr>\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;padding:16px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#868686;\">{{copy_sub}}</td></tr>\n            </table>\n          </td></tr>\n          <tr><td class=\"fwc\" width=\"600\" style=\"width:600px;font-size:0;line-height:0;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"600\" height=\"1\" bgcolor=\"#EEEEEE\" style=\"width:600px;height:1px;background-color:#EEEEEE;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr>\n        </table>\n      </td></tr>",
    fields: [{"key": "badge_text", "label": "배지 문구", "type": "text"}, {"key": "customer_name", "label": "고객명", "type": "text"}, {"key": "copy_headline", "label": "헤드라인", "type": "text"}, {"key": "copy_sub", "label": "서브카피", "type": "text"}]
  },
  winbackService: {
    label: "\uc5f0\ud55c \ubc30\uacbd+\ud14c\ub450\ub9ac \ubc30\uc9c0, \ubc11\uc904 \uac15\uc870 \ud5e4\ub4dc\ub77c\uc778",
    html: "\n\n      <tr><td bgcolor=\"#EDF1F8\" style=\"background-color:#EDF1F8;padding:0;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\">\n          <tr><td class=\"fwc hpad\" width=\"600\" valign=\"top\" style=\"width:600px;box-sizing:border-box;padding:42px 32px 44px 32px;\">\n            <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"536\" style=\"width:536px;table-layout:fixed;border-collapse:collapse;\">\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;padding:0 0 18px 0;\">\n                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;\"><tr><td style=\"box-sizing:border-box;border:1px solid #0F218B;padding:7px 13px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;color:#0F218B;\">{{badge_text}}</td></tr></table>\n              </td></tr>\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:26px;line-height:38px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;\">{{customer_name}} \uace0\uac1d\ub2d8,<br /><span style=\"border-bottom:4px solid #FFCC00;\">{{copy_headline}}</span></td></tr>\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:13px;line-height:21px;mso-line-height-rule:exactly;color:#5E6780;\">{{copy_sub}}</td></tr>\n            </table>\n          </td></tr>\n        </table>\n      </td></tr>",
    fields: [{"key": "badge_text", "label": "배지 문구", "type": "text"}, {"key": "customer_name", "label": "고객명", "type": "text"}, {"key": "copy_headline", "label": "헤드라인", "type": "text"}, {"key": "copy_sub", "label": "서브카피", "type": "text"}]
  },
  productH: {
    label: "\ud30c\ub780 \ubc30\uacbd, \ud770 \ud14c\ub450\ub9ac \ubc30\uc9c0",
    html: "\n\n      <tr><td bgcolor=\"#0F218B\" style=\"background-color:#0F218B;padding:0;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\">\n          <tr><td class=\"fwc hpad\" width=\"600\" valign=\"top\" style=\"width:600px;box-sizing:border-box;padding:40px 32px 42px 32px;\">\n            <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"536\" style=\"width:536px;table-layout:fixed;border-collapse:collapse;\">\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;padding:0 0 16px 0;\"><table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;\"><tr><td style=\"box-sizing:border-box;border:1px solid #FFFFFF;padding:6px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;color:#FFFFFF;\">{{badge_text}}</td></tr></table></td></tr>\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:26px;line-height:37px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;letter-spacing:-0.02em;\">{{customer_name}} \uace0\uac1d\ub2d8,<br />{{copy_headline}}</td></tr>\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;padding:18px 0 0 0;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"536\" style=\"width:536px;table-layout:fixed;border-collapse:collapse;\"><tr><td width=\"3\" bgcolor=\"#FFFFFF\" style=\"width:3px;background-color:#FFFFFF;font-size:0;line-height:0;\">&nbsp;</td><td class=\"fwc\" width=\"533\" bgcolor=\"#1B2F9E\" style=\"width:533px;box-sizing:border-box;background-color:#1B2F9E;padding:11px 16px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#FFFFFF;\">{{copy_sub}}</td></tr></table></td></tr>\n            </table>\n          </td></tr>\n        </table>\n      </td></tr>",
    fields: [{"key": "badge_text", "label": "배지 문구", "type": "text"}, {"key": "customer_name", "label": "고객명", "type": "text"}, {"key": "copy_headline", "label": "헤드라인", "type": "text"}, {"key": "copy_sub", "label": "서브카피", "type": "text"}]
  },
  productV: {
    label: "\ud770 \ubc30\uacbd, \ud30c\ub780 \ud14c\ub450\ub9ac \ubc30\uc9c0",
    html: "\n\n      <tr><td bgcolor=\"#FFFFFF\" style=\"background-color:#FFFFFF;padding:0;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\">\n          <tr><td class=\"fwc hpad\" width=\"600\" valign=\"top\" style=\"width:600px;box-sizing:border-box;padding:40px 32px 42px 32px;\">\n            <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"536\" style=\"width:536px;table-layout:fixed;border-collapse:collapse;\">\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;padding:0 0 16px 0;\"><table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-collapse:collapse;\"><tr><td style=\"box-sizing:border-box;border:1px solid #0F218B;padding:6px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.14em;color:#0F218B;\">{{badge_text}}</td></tr></table></td></tr>\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:26px;line-height:37px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;\">{{customer_name}} \uace0\uac1d\ub2d8,<br />{{copy_headline}}</td></tr>\n              <tr><td class=\"fwc\" width=\"536\" style=\"width:536px;padding:18px 0 0 0;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"536\" style=\"width:536px;table-layout:fixed;border-collapse:collapse;\"><tr><td width=\"3\" bgcolor=\"#0F218B\" style=\"width:3px;background-color:#0F218B;font-size:0;line-height:0;\">&nbsp;</td><td class=\"fwc\" width=\"533\" bgcolor=\"#EDF1F8\" style=\"width:533px;box-sizing:border-box;background-color:#EDF1F8;padding:11px 16px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#0F218B;\">{{copy_sub}}</td></tr></table></td></tr>\n            </table>\n          </td></tr>\n          <tr><td class=\"fwc\" width=\"600\" style=\"width:600px;font-size:0;line-height:0;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"600\" style=\"width:600px;table-layout:fixed;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"240\" height=\"4\" bgcolor=\"#0F218B\" style=\"width:240px;height:4px;background-color:#0F218B;font-size:0;line-height:0;\">&nbsp;</td><td class=\"fwc\" width=\"360\" height=\"4\" bgcolor=\"#EEEEEE\" style=\"width:360px;height:4px;background-color:#EEEEEE;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr>\n        </table>\n      </td></tr>",
    fields: [{"key": "badge_text", "label": "배지 문구", "type": "text"}, {"key": "customer_name", "label": "고객명", "type": "text"}, {"key": "copy_headline", "label": "헤드라인", "type": "text"}, {"key": "copy_sub", "label": "서브카피", "type": "text"}]
  },
};

export const EDM_SECTION_TYPES = {
  imageCards: {
    label: "이미지 카드 1x3 (이미지+카피)",
    html: "<tr><td class=\"pad\" style=\"padding:44px 24px 18px 24px;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;border-collapse:collapse;\">\n          <tr><td class=\"fwc\" width=\"552\" style=\"width:552px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;\">{{c_headline_1}}</td></tr>\n          <tr><td class=\"fwc\" width=\"552\" style=\"width:552px;padding:10px 0 0 0;font-size:0;line-height:0;\"><table  role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"40\" style=\"width:40px;border-collapse:collapse;\"><tr><td width=\"40\" height=\"3\" bgcolor=\"#FFCC00\" style=\"width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr>\n        </table>\n      </td></tr>      <tr><td class=\"pad\" style=\"padding:0 24px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;border-collapse:collapse;\"><tr><td class=\"col\" width=\"176\" valign=\"top\" style=\"width:176px;\">\n              <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:176px;border-collapse:collapse;\">\n                <tr><td class=\"fwc\" width=\"176\" style=\"width:176px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:176px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"176\" height=\"110\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:176px;height:110px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;\">{{image_1}}<!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_1}}\" width=\"176\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:176px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"176\" align=\"center\" style=\"width:176px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:21px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;\">{{main_1}}</td></tr>\n                <tr><td class=\"fwc\" width=\"176\" align=\"center\" style=\"width:176px;padding:6px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:13px;line-height:19px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;\">{{sub_1}}</td></tr>\n                <tr><td class=\"fwc\" width=\"176\" align=\"center\" style=\"width:176px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;\">{{desc_1}}</td></tr>\n              </table></td><td class=\"gapcol\" width=\"12\" style=\"width:12px;font-size:0;line-height:0;\">&nbsp;</td><td class=\"col\" width=\"176\" valign=\"top\" style=\"width:176px;\">\n              <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:176px;border-collapse:collapse;\">\n                <tr><td class=\"fwc\" width=\"176\" style=\"width:176px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:176px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"176\" height=\"110\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:176px;height:110px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;\">{{image_2}}<!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_2}}\" width=\"176\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:176px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"176\" align=\"center\" style=\"width:176px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:21px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;\">{{main_2}}</td></tr>\n                <tr><td class=\"fwc\" width=\"176\" align=\"center\" style=\"width:176px;padding:6px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:13px;line-height:19px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;\">{{sub_2}}</td></tr>\n                <tr><td class=\"fwc\" width=\"176\" align=\"center\" style=\"width:176px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;\">{{desc_2}}</td></tr>\n              </table></td><td class=\"gapcol\" width=\"12\" style=\"width:12px;font-size:0;line-height:0;\">&nbsp;</td><td class=\"col\" width=\"176\" valign=\"top\" style=\"width:176px;\">\n              <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:176px;border-collapse:collapse;\">\n                <tr><td class=\"fwc\" width=\"176\" style=\"width:176px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:176px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"176\" height=\"110\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:176px;height:110px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;\">{{image_3}}<!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_3}}\" width=\"176\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:176px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"176\" align=\"center\" style=\"width:176px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:21px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;\">{{main_3}}</td></tr>\n                <tr><td class=\"fwc\" width=\"176\" align=\"center\" style=\"width:176px;padding:6px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:13px;line-height:19px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;\">{{sub_3}}</td></tr>\n                <tr><td class=\"fwc\" width=\"176\" align=\"center\" style=\"width:176px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;\">{{desc_3}}</td></tr>\n              </table></td></tr></table></td></tr>",
    fields: [{"key": "c_headline_1", "label": "섹션 제목", "type": "text"}, {"key": "image_1", "label": "카드1 이미지", "type": "image"}, {"key": "main_1", "label": "카드1 메인 카피", "type": "text"}, {"key": "sub_1", "label": "카드1 서브 카피", "type": "text"}, {"key": "desc_1", "label": "카드1 설명", "type": "text"}, {"key": "image_2", "label": "카드2 이미지", "type": "image"}, {"key": "main_2", "label": "카드2 메인 카피", "type": "text"}, {"key": "sub_2", "label": "카드2 서브 카피", "type": "text"}, {"key": "desc_2", "label": "카드2 설명", "type": "text"}, {"key": "image_3", "label": "카드3 이미지", "type": "image"}, {"key": "main_3", "label": "카드3 메인 카피", "type": "text"}, {"key": "sub_3", "label": "카드3 서브 카피", "type": "text"}, {"key": "desc_3", "label": "카드3 설명", "type": "text"}]
  },
  couponBox: {
    label: "\ucfe0\ud3f0 \ucf54\ub4dc \ubc15\uc2a4",
    html: "<tr><td class=\"pad\" style=\"padding:44px 24px 0 24px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;\">{{c_headline}}</td></tr><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;padding:10px 0 0 0;font-size:0;line-height:0;\"><table  role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"40\" style=\"width:40px;border-collapse:collapse;\"><tr><td width=\"40\" height=\"3\" bgcolor=\"#FFCC00\" style=\"width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr></table></td></tr><tr><td class=\"pad\" style=\"padding:18px 24px 0 24px;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" bgcolor=\"#EDF1F8\" style=\"width:552px;background-color:#EDF1F8;border-collapse:collapse;\">\n          <tr><td class=\"fwc\" width=\"552\" align=\"center\" style=\"width:552px;padding:22px 20px;\">\n            <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"512\" style=\"width:512px;table-layout:fixed;border-collapse:collapse;\">\n              <tr>\n                <td class=\"col\" width=\"280\" bgcolor=\"#FFFFFF\" valign=\"middle\" align=\"center\" style=\"width:280px;box-sizing:border-box;background-color:#FFFFFF;padding:34px 16px 36px 16px;\">\n                  <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"248\" style=\"width:248px;table-layout:fixed;border-collapse:collapse;\">\n                    <tr><td align=\"center\" style=\"font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:18px;line-height:22px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.4em;text-indent:0.4em;color:#9AA3BE;\">COUPON</td></tr>\n                    <tr><td align=\"center\" style=\"padding:16px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:44px;line-height:50px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.02em;word-break:break-all;overflow-wrap:anywhere;\">{{coupon_value}}</td></tr>\n                    <tr><td align=\"center\" style=\"padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;\">\ucd5c\ub300 \ud560\uc778 \uae08\uc561 <span style=\"font-weight:bold;color:#111111;\">{{coupon_max}}</span></td></tr>\n                  </table>\n                </td>\n                <td class=\"gapcol\" width=\"2\" bgcolor=\"#0F218B\" style=\"width:2px;background-color:#0F218B;background-image:repeating-linear-gradient(to bottom,#EDF1F8 0,#EDF1F8 6px,#0F218B 6px,#0F218B 12px);font-size:0;line-height:0;\">&nbsp;</td>\n                <td class=\"col\" width=\"230\" bgcolor=\"#0F218B\" valign=\"middle\" align=\"center\" style=\"width:230px;box-sizing:border-box;background-color:#0F218B;padding:34px 16px 36px 16px;\">\n                  <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"190\" style=\"width:190px;table-layout:fixed;border-collapse:collapse;\">\n                    <tr><td align=\"center\" style=\"font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:16px;line-height:22px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:-0.01em;color:#FFFFFF;\">{{coupon_target}}</td></tr>\n                    <tr><td align=\"center\" style=\"padding:5px 0 16px 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;color:#C9CDDB;\">\u203b {{coupon_note}}</td></tr>\n                    <tr><td align=\"center\" style=\"font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:13px;line-height:17px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#FFFFFF;\">\ucfe0\ud3f0\ubc88\ud638</td></tr>\n                    <tr><td align=\"center\" style=\"padding:10px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:26px;line-height:32px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.04em;color:#FFCC00;word-break:break-all;overflow-wrap:anywhere;\">{{coupon_code}}</td></tr>\n                    <tr><td align=\"center\" style=\"padding:12px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;color:#C9CDDB;\">\uc0ac\uc6a9 \uae30\ud55c {{coupon_expiry}}</td></tr>\n                  </table>\n                </td>\n              </tr>\n            </table>\n          </td></tr>\n        </table>\n      </td></tr>",
    fields: [{"key": "c_headline", "label": "섹션 제목", "type": "text"}, {"key": "coupon_value", "label": "할인율", "type": "text"}, {"key": "coupon_max", "label": "최대 할인 금액", "type": "text"}, {"key": "coupon_target", "label": "대상", "type": "text"}, {"key": "coupon_note", "label": "유의사항", "type": "text"}, {"key": "coupon_code", "label": "쿠폰 코드", "type": "text"}, {"key": "coupon_expiry", "label": "유효기간", "type": "text"}]
  },
  ctaButton: {
    label: "CTA 버튼 1x1",
    html: "<tr><td class=\"pad\" align=\"center\" style=\"padding:44px 24px 44px 24px;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"300\" style=\"width:300px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"300\" align=\"center\" bgcolor=\"#0F218B\" style=\"width:300px;background-color:#0F218B;border-radius:2px;\"><a href=\"{{cta_url}}\" style=\"display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;\">{{cta_label}}</a></td></tr></table>\n      </td></tr>",
    fields: [{"key": "cta_url", "label": "링크", "type": "link"}, {"key": "cta_label", "label": "버튼 문구", "type": "button-label"}]
  },
  imageCardWithButton: {
    label: "\uc774\ubbf8\uc9c0 \uce74\ub4dc 1x1 (\uc774\ubbf8\uc9c0+\uce74\ud53c+\ubc84\ud2bc 1)",
    html: "<tr><td class=\"pad\" style=\"padding:44px 24px 0 24px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;\">{{c_headline}}</td></tr><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;padding:10px 0 0 0;font-size:0;line-height:0;\"><table  role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"40\" style=\"width:40px;border-collapse:collapse;\"><tr><td width=\"40\" height=\"3\" bgcolor=\"#FFCC00\" style=\"width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr></table></td></tr><tr><td class=\"pad\" style=\"padding:18px 24px 0 24px;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n          <tr><td class=\"fwc\" width=\"550\" style=\"width:550px;padding:16px 18px 18px 18px;\">\n            <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"514\" style=\"width:514px;border-collapse:collapse;\">\n              <tr><td class=\"fwc\" width=\"514\" align=\"center\" style=\"width:514px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"514\" style=\"width:514px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"514\" height=\"132\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\">{{image_1}}<!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_1}}\" width=\"514\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:514px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n              <tr><td class=\"fwc\" width=\"514\" align=\"center\" style=\"width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;\">{{main_1}}</td></tr>\n              <tr><td class=\"fwc\" width=\"514\" align=\"center\" style=\"width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;\">{{sub_1}}</td></tr>\n            </table>\n          </td></tr>\n        </table>\n      </td></tr>\n      <tr><td align=\"center\" style=\"padding:20px 24px 0 24px;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"260\" style=\"width:260px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"260\" align=\"center\" bgcolor=\"#0F218B\" style=\"width:260px;background-color:#0F218B;border-radius:2px;\"><a href=\"{{link_1}}\" style=\"display:block;padding:13px 10px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:13px;line-height:17px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;\">{{btn_1}}</a></td></tr></table>\n      </td></tr>",
    fields: [{"key": "c_headline", "label": "섹션 제목", "type": "text"}, {"key": "image_1", "label": "이미지", "type": "image"}, {"key": "main_1", "label": "메인 카피", "type": "text"}, {"key": "sub_1", "label": "서브 카피", "type": "text"}, {"key": "link_1", "label": "버튼 링크", "type": "link"}, {"key": "btn_1", "label": "버튼 문구", "type": "button-label"}]
  },
  simpleCard: {
    label: "\uc774\ubbf8\uc9c0 \uce74\ub4dc 1x1 (\uc774\ubbf8\uc9c0+\uce74\ud53c)",
    html: "<tr><td class=\"pad\" style=\"padding:44px 24px 0 24px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;\">{{c_headline}}</td></tr><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;padding:10px 0 0 0;font-size:0;line-height:0;\"><table  role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"40\" style=\"width:40px;border-collapse:collapse;\"><tr><td width=\"40\" height=\"3\" bgcolor=\"#FFCC00\" style=\"width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr></table></td></tr><tr><td class=\"pad\" style=\"padding:18px 24px 0 24px;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n          <tr><td class=\"fwc\" width=\"550\" style=\"width:550px;padding:16px 18px 18px 18px;\">\n            <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"514\" style=\"width:514px;border-collapse:collapse;\">\n              <tr><td class=\"fwc\" width=\"514\" align=\"center\" style=\"width:514px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"514\" style=\"width:514px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"514\" height=\"132\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:514px;height:132px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\">{{image_1}}<!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_1}}\" width=\"514\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:514px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n              <tr><td class=\"fwc\" width=\"514\" align=\"center\" style=\"width:514px;padding:14px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;\">{{main_1}}</td></tr>\n              <tr><td class=\"fwc\" width=\"514\" align=\"center\" style=\"width:514px;padding:7px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;\">{{sub_1}}</td></tr>\n            </table>\n          </td></tr>\n        </table>\n      </td></tr>\n      ",
    fields: [{"key": "c_headline", "label": "섹션 제목", "type": "text"}, {"key": "image_1", "label": "이미지", "type": "image"}, {"key": "main_1", "label": "메인 카피", "type": "text"}, {"key": "sub_1", "label": "서브 카피", "type": "text"}]
  },
  textCopy: {
    label: "\ud14d\uc2a4\ud2b8 1x1",
    html: "<tr><td class=\"pad\" style=\"padding:44px 24px 0 24px;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;border-collapse:collapse;\">\n          <tr><td class=\"fwc\" width=\"552\" align=\"center\" style=\"width:552px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:20px;line-height:31px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;\">{{main_1}}</td></tr>\n          <tr><td class=\"fwc\" width=\"552\" align=\"center\" style=\"width:552px;padding:12px 0 0 0;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:14px;line-height:22px;mso-line-height-rule:exactly;color:#868686;\">{{sub_1}}</td></tr>\n        </table>\n      </td></tr>",
    fields: [{"key": "main_1", "label": "메인 카피", "type": "text"}, {"key": "sub_1", "label": "서브 카피", "type": "text"}]
  },
  bigImage: {
    label: "이미지 카드 1x1 (이미지)",
    html: "<tr><td class=\"pad\" style=\"padding:44px 24px 0 24px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;\">{{c_headline}}</td></tr><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;padding:10px 0 0 0;font-size:0;line-height:0;\"><table  role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"40\" style=\"width:40px;border-collapse:collapse;\"><tr><td width=\"40\" height=\"3\" bgcolor=\"#FFCC00\" style=\"width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr></table></td></tr><tr><td class=\"pad\" style=\"padding:18px 24px 0 24px;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;border-collapse:collapse;\">\n          <tr><td class=\"fwc\" width=\"552\" height=\"240\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:552px;height:240px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\">{{image_main}}<!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_main}}\" width=\"552\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:552px;height:auto;border:0;\" /> --></td></tr>\n        </table>\n      </td></tr>",
    fields: [{"key": "c_headline", "label": "섹션 제목", "type": "text"}, {"key": "image_main", "label": "이미지", "type": "image"}]
  },
  productGrid: {
    label: "상품 그리드 (5x3)",
    html: "<tr><td class=\"pad\" style=\"padding:44px 24px 0 24px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;\">{{c_headline}}</td></tr><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;padding:10px 0 0 0;font-size:0;line-height:0;\"><table  role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"40\" style=\"width:40px;border-collapse:collapse;\"><tr><td width=\"40\" height=\"3\" bgcolor=\"#FFCC00\" style=\"width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr></table></td></tr><tr><td class=\"pad\" style=\"padding:18px 24px 0 24px;\">\n        <!--[if mso]><table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;border-collapse:collapse;\"><tr><![endif]-->\n        <div class=\"hgrid\" style=\"font-size:0;line-height:0;text-align:left;width:100%;max-width:552px;\">\n            <!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_1}}\" style=\"color:#868686;text-decoration:none;\">{{image_1}}</a><!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_1}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"27\" style=\"width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;\"><a href=\"{{link_1}}\" style=\"color:#868686;text-decoration:none;\">{{brandName_1}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"52\" style=\"width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;\"><a href=\"{{link_1}}\" style=\"color:#025FAE;text-decoration:underline;\">{{seriesName_1}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;\"><a href=\"{{link_1}}\" style=\"color:#EA0000;text-decoration:none;\">{{price_1}}</a></td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_2}}\" style=\"color:#868686;text-decoration:none;\">{{image_2}}</a><!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_2}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"27\" style=\"width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;\"><a href=\"{{link_2}}\" style=\"color:#868686;text-decoration:none;\">{{brandName_2}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"52\" style=\"width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;\"><a href=\"{{link_2}}\" style=\"color:#025FAE;text-decoration:underline;\">{{seriesName_2}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;\"><a href=\"{{link_2}}\" style=\"color:#EA0000;text-decoration:none;\">{{price_2}}</a></td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_3}}\" style=\"color:#868686;text-decoration:none;\">{{image_3}}</a><!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_3}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"27\" style=\"width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;\"><a href=\"{{link_3}}\" style=\"color:#868686;text-decoration:none;\">{{brandName_3}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"52\" style=\"width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;\"><a href=\"{{link_3}}\" style=\"color:#025FAE;text-decoration:underline;\">{{seriesName_3}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;\"><a href=\"{{link_3}}\" style=\"color:#EA0000;text-decoration:none;\">{{price_3}}</a></td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_4}}\" style=\"color:#868686;text-decoration:none;\">{{image_4}}</a><!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_4}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"27\" style=\"width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;\"><a href=\"{{link_4}}\" style=\"color:#868686;text-decoration:none;\">{{brandName_4}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"52\" style=\"width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;\"><a href=\"{{link_4}}\" style=\"color:#025FAE;text-decoration:underline;\">{{seriesName_4}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;\"><a href=\"{{link_4}}\" style=\"color:#EA0000;text-decoration:none;\">{{price_4}}</a></td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_5}}\" style=\"color:#868686;text-decoration:none;\">{{image_5}}</a><!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_5}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"27\" style=\"width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;\"><a href=\"{{link_5}}\" style=\"color:#868686;text-decoration:none;\">{{brandName_5}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"52\" style=\"width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;\"><a href=\"{{link_5}}\" style=\"color:#025FAE;text-decoration:underline;\">{{seriesName_5}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;\"><a href=\"{{link_5}}\" style=\"color:#EA0000;text-decoration:none;\">{{price_5}}</a></td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_6}}\" style=\"color:#868686;text-decoration:none;\">{{image_6}}</a><!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_6}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"27\" style=\"width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;\"><a href=\"{{link_6}}\" style=\"color:#868686;text-decoration:none;\">{{brandName_6}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"52\" style=\"width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;\"><a href=\"{{link_6}}\" style=\"color:#025FAE;text-decoration:underline;\">{{seriesName_6}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;\"><a href=\"{{link_6}}\" style=\"color:#EA0000;text-decoration:none;\">{{price_6}}</a></td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_7}}\" style=\"color:#868686;text-decoration:none;\">{{image_7}}</a><!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_7}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"27\" style=\"width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;\"><a href=\"{{link_7}}\" style=\"color:#868686;text-decoration:none;\">{{brandName_7}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"52\" style=\"width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;\"><a href=\"{{link_7}}\" style=\"color:#025FAE;text-decoration:underline;\">{{seriesName_7}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;\"><a href=\"{{link_7}}\" style=\"color:#EA0000;text-decoration:none;\">{{price_7}}</a></td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_8}}\" style=\"color:#868686;text-decoration:none;\">{{image_8}}</a><!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_8}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"27\" style=\"width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;\"><a href=\"{{link_8}}\" style=\"color:#868686;text-decoration:none;\">{{brandName_8}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"52\" style=\"width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;\"><a href=\"{{link_8}}\" style=\"color:#025FAE;text-decoration:underline;\">{{seriesName_8}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;\"><a href=\"{{link_8}}\" style=\"color:#EA0000;text-decoration:none;\">{{price_8}}</a></td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_9}}\" style=\"color:#868686;text-decoration:none;\">{{image_9}}</a><!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_9}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"27\" style=\"width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;\"><a href=\"{{link_9}}\" style=\"color:#868686;text-decoration:none;\">{{brandName_9}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"52\" style=\"width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;\"><a href=\"{{link_9}}\" style=\"color:#025FAE;text-decoration:underline;\">{{seriesName_9}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;\"><a href=\"{{link_9}}\" style=\"color:#EA0000;text-decoration:none;\">{{price_9}}</a></td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_10}}\" style=\"color:#868686;text-decoration:none;\">{{image_10}}</a><!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_10}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"27\" style=\"width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;\"><a href=\"{{link_10}}\" style=\"color:#868686;text-decoration:none;\">{{brandName_10}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"52\" style=\"width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;\"><a href=\"{{link_10}}\" style=\"color:#025FAE;text-decoration:underline;\">{{seriesName_10}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;\"><a href=\"{{link_10}}\" style=\"color:#EA0000;text-decoration:none;\">{{price_10}}</a></td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_11}}\" style=\"color:#868686;text-decoration:none;\">{{image_11}}</a><!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_11}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"27\" style=\"width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;\"><a href=\"{{link_11}}\" style=\"color:#868686;text-decoration:none;\">{{brandName_11}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"52\" style=\"width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;\"><a href=\"{{link_11}}\" style=\"color:#025FAE;text-decoration:underline;\">{{seriesName_11}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;\"><a href=\"{{link_11}}\" style=\"color:#EA0000;text-decoration:none;\">{{price_11}}</a></td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_12}}\" style=\"color:#868686;text-decoration:none;\">{{image_12}}</a><!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_12}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"27\" style=\"width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;\"><a href=\"{{link_12}}\" style=\"color:#868686;text-decoration:none;\">{{brandName_12}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"52\" style=\"width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;\"><a href=\"{{link_12}}\" style=\"color:#025FAE;text-decoration:underline;\">{{seriesName_12}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;\"><a href=\"{{link_12}}\" style=\"color:#EA0000;text-decoration:none;\">{{price_12}}</a></td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]></tr><tr><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_13}}\" style=\"color:#868686;text-decoration:none;\">{{image_13}}</a><!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_13}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"27\" style=\"width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;\"><a href=\"{{link_13}}\" style=\"color:#868686;text-decoration:none;\">{{brandName_13}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"52\" style=\"width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;\"><a href=\"{{link_13}}\" style=\"color:#025FAE;text-decoration:underline;\">{{seriesName_13}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;\"><a href=\"{{link_13}}\" style=\"color:#EA0000;text-decoration:none;\">{{price_13}}</a></td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_14}}\" style=\"color:#868686;text-decoration:none;\">{{image_14}}</a><!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_14}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"27\" style=\"width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;\"><a href=\"{{link_14}}\" style=\"color:#868686;text-decoration:none;\">{{brandName_14}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"52\" style=\"width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;\"><a href=\"{{link_14}}\" style=\"color:#025FAE;text-decoration:underline;\">{{seriesName_14}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;\"><a href=\"{{link_14}}\" style=\"color:#EA0000;text-decoration:none;\">{{price_14}}</a></td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_15}}\" style=\"color:#868686;text-decoration:none;\">{{image_15}}</a><!-- \ubc1c\uc1a1 \uc2dc \uad50\uccb4: <img src=\"{{image_15}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"27\" style=\"width:174px;height:27px;padding:12px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:0.06em;color:#868686;\"><a href=\"{{link_15}}\" style=\"color:#868686;text-decoration:none;\">{{brandName_15}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"52\" style=\"width:174px;height:52px;padding:5px 12px 0 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;\"><a href=\"{{link_15}}\" style=\"color:#025FAE;text-decoration:underline;\">{{seriesName_15}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:174px;height:34px;padding:8px 12px 14px 12px;font-family:Arial,'Malgun Gothic','\ub9d1\uc740 \uace0\ub515',Helvetica,sans-serif;font-size:15px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#EA0000;\"><a href=\"{{link_15}}\" style=\"color:#EA0000;text-decoration:none;\">{{price_15}}</a></td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]-->\n        </div>\n        <!--[if mso]></tr></table><![endif]-->\n      </td></tr>",
    fields: [{"key": "c_headline", "label": "섹션 제목", "type": "text"}, {"key": "image_1", "label": "상품1 이미지", "type": "image"}, {"key": "brandName_1", "label": "상품1 브랜드명", "type": "text"}, {"key": "seriesName_1", "label": "상품1 시리즈명", "type": "text"}, {"key": "price_1", "label": "상품1 가격", "type": "text"}, {"key": "link_1", "label": "상품1 링크", "type": "link"}, {"key": "image_2", "label": "상품2 이미지", "type": "image"}, {"key": "brandName_2", "label": "상품2 브랜드명", "type": "text"}, {"key": "seriesName_2", "label": "상품2 시리즈명", "type": "text"}, {"key": "price_2", "label": "상품2 가격", "type": "text"}, {"key": "link_2", "label": "상품2 링크", "type": "link"}, {"key": "image_3", "label": "상품3 이미지", "type": "image"}, {"key": "brandName_3", "label": "상품3 브랜드명", "type": "text"}, {"key": "seriesName_3", "label": "상품3 시리즈명", "type": "text"}, {"key": "price_3", "label": "상품3 가격", "type": "text"}, {"key": "link_3", "label": "상품3 링크", "type": "link"}, {"key": "image_4", "label": "상품4 이미지", "type": "image"}, {"key": "brandName_4", "label": "상품4 브랜드명", "type": "text"}, {"key": "seriesName_4", "label": "상품4 시리즈명", "type": "text"}, {"key": "price_4", "label": "상품4 가격", "type": "text"}, {"key": "link_4", "label": "상품4 링크", "type": "link"}, {"key": "image_5", "label": "상품5 이미지", "type": "image"}, {"key": "brandName_5", "label": "상품5 브랜드명", "type": "text"}, {"key": "seriesName_5", "label": "상품5 시리즈명", "type": "text"}, {"key": "price_5", "label": "상품5 가격", "type": "text"}, {"key": "link_5", "label": "상품5 링크", "type": "link"}, {"key": "image_6", "label": "상품6 이미지", "type": "image"}, {"key": "brandName_6", "label": "상품6 브랜드명", "type": "text"}, {"key": "seriesName_6", "label": "상품6 시리즈명", "type": "text"}, {"key": "price_6", "label": "상품6 가격", "type": "text"}, {"key": "link_6", "label": "상품6 링크", "type": "link"}, {"key": "image_7", "label": "상품7 이미지", "type": "image"}, {"key": "brandName_7", "label": "상품7 브랜드명", "type": "text"}, {"key": "seriesName_7", "label": "상품7 시리즈명", "type": "text"}, {"key": "price_7", "label": "상품7 가격", "type": "text"}, {"key": "link_7", "label": "상품7 링크", "type": "link"}, {"key": "image_8", "label": "상품8 이미지", "type": "image"}, {"key": "brandName_8", "label": "상품8 브랜드명", "type": "text"}, {"key": "seriesName_8", "label": "상품8 시리즈명", "type": "text"}, {"key": "price_8", "label": "상품8 가격", "type": "text"}, {"key": "link_8", "label": "상품8 링크", "type": "link"}, {"key": "image_9", "label": "상품9 이미지", "type": "image"}, {"key": "brandName_9", "label": "상품9 브랜드명", "type": "text"}, {"key": "seriesName_9", "label": "상품9 시리즈명", "type": "text"}, {"key": "price_9", "label": "상품9 가격", "type": "text"}, {"key": "link_9", "label": "상품9 링크", "type": "link"}, {"key": "image_10", "label": "상품10 이미지", "type": "image"}, {"key": "brandName_10", "label": "상품10 브랜드명", "type": "text"}, {"key": "seriesName_10", "label": "상품10 시리즈명", "type": "text"}, {"key": "price_10", "label": "상품10 가격", "type": "text"}, {"key": "link_10", "label": "상품10 링크", "type": "link"}, {"key": "image_11", "label": "상품11 이미지", "type": "image"}, {"key": "brandName_11", "label": "상품11 브랜드명", "type": "text"}, {"key": "seriesName_11", "label": "상품11 시리즈명", "type": "text"}, {"key": "price_11", "label": "상품11 가격", "type": "text"}, {"key": "link_11", "label": "상품11 링크", "type": "link"}, {"key": "image_12", "label": "상품12 이미지", "type": "image"}, {"key": "brandName_12", "label": "상품12 브랜드명", "type": "text"}, {"key": "seriesName_12", "label": "상품12 시리즈명", "type": "text"}, {"key": "price_12", "label": "상품12 가격", "type": "text"}, {"key": "link_12", "label": "상품12 링크", "type": "link"}, {"key": "image_13", "label": "상품13 이미지", "type": "image"}, {"key": "brandName_13", "label": "상품13 브랜드명", "type": "text"}, {"key": "seriesName_13", "label": "상품13 시리즈명", "type": "text"}, {"key": "price_13", "label": "상품13 가격", "type": "text"}, {"key": "link_13", "label": "상품13 링크", "type": "link"}, {"key": "image_14", "label": "상품14 이미지", "type": "image"}, {"key": "brandName_14", "label": "상품14 브랜드명", "type": "text"}, {"key": "seriesName_14", "label": "상품14 시리즈명", "type": "text"}, {"key": "price_14", "label": "상품14 가격", "type": "text"}, {"key": "link_14", "label": "상품14 링크", "type": "link"}, {"key": "image_15", "label": "상품15 이미지", "type": "image"}, {"key": "brandName_15", "label": "상품15 브랜드명", "type": "text"}, {"key": "seriesName_15", "label": "상품15 시리즈명", "type": "text"}, {"key": "price_15", "label": "상품15 가격", "type": "text"}, {"key": "link_15", "label": "상품15 링크", "type": "link"}]
  },
  miniIconGrid: {
    label: "이미지 카드 1x6 (이미지+카피)",
    html: "<tr><td class=\"pad\" style=\"padding:44px 24px 0 24px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;\">{{c_headline}}</td></tr><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;padding:10px 0 0 0;font-size:0;line-height:0;\"><table  role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"40\" style=\"width:40px;border-collapse:collapse;\"><tr><td width=\"40\" height=\"3\" bgcolor=\"#FFCC00\" style=\"width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr></table></td></tr><tr><td class=\"pad\" style=\"padding:18px 24px 0 24px;\"><table class=\"fw rowt\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;table-layout:fixed;border-collapse:collapse;\"><tr><td class=\"col up3\" width=\"87\" valign=\"top\" style=\"width:87px;\">\n              <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"87\" style=\"width:87px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"85\" align=\"center\" style=\"width:85px;padding:7px 7px 0 7px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"71\" style=\"width:71px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"71\" height=\"52\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:71px;height:52px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\">{{image_1}}<!-- 발송 시 교체: <img src=\"{{image_1}}\" width=\"71\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:71px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"77\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:77px;height:34px;padding:8px 4px 10px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;word-break:break-all;overflow-wrap:anywhere;\">{{copy_1}}</td></tr>\n              </table></td><td class=\"gapcol\" width=\"6\" style=\"width:6px;font-size:0;line-height:0;\">&nbsp;</td><td class=\"col up3\" width=\"87\" valign=\"top\" style=\"width:87px;\">\n              <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"87\" style=\"width:87px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"85\" align=\"center\" style=\"width:85px;padding:7px 7px 0 7px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"71\" style=\"width:71px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"71\" height=\"52\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:71px;height:52px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\">{{image_2}}<!-- 발송 시 교체: <img src=\"{{image_2}}\" width=\"71\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:71px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"77\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:77px;height:34px;padding:8px 4px 10px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;word-break:break-all;overflow-wrap:anywhere;\">{{copy_2}}</td></tr>\n              </table></td><td class=\"gapcol\" width=\"6\" style=\"width:6px;font-size:0;line-height:0;\">&nbsp;</td><td class=\"col up3\" width=\"87\" valign=\"top\" style=\"width:87px;\">\n              <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"87\" style=\"width:87px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"85\" align=\"center\" style=\"width:85px;padding:7px 7px 0 7px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"71\" style=\"width:71px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"71\" height=\"52\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:71px;height:52px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\">{{image_3}}<!-- 발송 시 교체: <img src=\"{{image_3}}\" width=\"71\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:71px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"77\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:77px;height:34px;padding:8px 4px 10px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;word-break:break-all;overflow-wrap:anywhere;\">{{copy_3}}</td></tr>\n              </table></td><td class=\"gapcol\" width=\"6\" style=\"width:6px;font-size:0;line-height:0;\">&nbsp;</td><td class=\"col up3\" width=\"87\" valign=\"top\" style=\"width:87px;\">\n              <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"87\" style=\"width:87px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"85\" align=\"center\" style=\"width:85px;padding:7px 7px 0 7px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"71\" style=\"width:71px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"71\" height=\"52\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:71px;height:52px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\">{{image_4}}<!-- 발송 시 교체: <img src=\"{{image_4}}\" width=\"71\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:71px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"77\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:77px;height:34px;padding:8px 4px 10px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;word-break:break-all;overflow-wrap:anywhere;\">{{copy_4}}</td></tr>\n              </table></td><td class=\"gapcol\" width=\"6\" style=\"width:6px;font-size:0;line-height:0;\">&nbsp;</td><td class=\"col up3\" width=\"87\" valign=\"top\" style=\"width:87px;\">\n              <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"87\" style=\"width:87px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"85\" align=\"center\" style=\"width:85px;padding:7px 7px 0 7px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"71\" style=\"width:71px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"71\" height=\"52\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:71px;height:52px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\">{{image_5}}<!-- 발송 시 교체: <img src=\"{{image_5}}\" width=\"71\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:71px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"77\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:77px;height:34px;padding:8px 4px 10px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;word-break:break-all;overflow-wrap:anywhere;\">{{copy_5}}</td></tr>\n              </table></td><td class=\"gapcol\" width=\"6\" style=\"width:6px;font-size:0;line-height:0;\">&nbsp;</td><td class=\"col up3\" width=\"87\" valign=\"top\" style=\"width:87px;\">\n              <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"87\" style=\"width:87px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"85\" align=\"center\" style=\"width:85px;padding:7px 7px 0 7px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"71\" style=\"width:71px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"71\" height=\"52\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:71px;height:52px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\">{{image_6}}<!-- 발송 시 교체: <img src=\"{{image_6}}\" width=\"71\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:71px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"77\" align=\"center\" valign=\"top\" height=\"34\" style=\"width:77px;height:34px;padding:8px 4px 10px 4px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:15px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;word-break:break-all;overflow-wrap:anywhere;\">{{copy_6}}</td></tr>\n              </table></td></tr></table></td></tr>",
    fields: [{"key":"c_headline","label":"섹션 제목","type":"text"},{"key":"image_1","label":"아이콘1 이미지","type":"image"},{"key":"image_2","label":"아이콘2 이미지","type":"image"},{"key":"image_3","label":"아이콘3 이미지","type":"image"},{"key":"image_4","label":"아이콘4 이미지","type":"image"},{"key":"image_5","label":"아이콘5 이미지","type":"image"},{"key":"image_6","label":"아이콘6 이미지","type":"image"},{"key":"copy_1","label":"카피1","type":"text"},{"key":"copy_2","label":"카피2","type":"text"},{"key":"copy_3","label":"카피3","type":"text"},{"key":"copy_4","label":"카피4","type":"text"},{"key":"copy_5","label":"카피5","type":"text"},{"key":"copy_6","label":"카피6","type":"text"}]
  },

  twoColCards: {
    label: "이미지 카드 1x2 (이미지+카피)",
    html: "<tr><td class=\"pad\" style=\"padding:44px 24px 0 24px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;\">{{c_headline}}</td></tr><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;padding:10px 0 0 0;font-size:0;line-height:0;\"><table  role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"40\" style=\"width:40px;border-collapse:collapse;\"><tr><td width=\"40\" height=\"3\" bgcolor=\"#FFCC00\" style=\"width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr></table></td></tr><tr><td class=\"pad\" style=\"padding:18px 24px 0 24px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;table-layout:fixed;border-collapse:collapse;\">\n          <tr><td class=\"col\" width=\"270\" valign=\"top\" style=\"width:270px;\">\n              <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"270\" style=\"width:270px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"268\" align=\"center\" style=\"width:268px;padding:16px 16px 0 16px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"236\" style=\"width:236px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"236\" height=\"130\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:236px;height:130px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\">{{image_1}}<!-- 발송 시 교체: <img src=\"{{image_1}}\" width=\"236\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:236px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"268\" align=\"center\" valign=\"top\" height=\"50\" style=\"width:268px;height:50px;padding:16px 16px 0 16px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;\">{{main_1}}</td></tr>\n                <tr><td class=\"fwc\" width=\"268\" align=\"center\" valign=\"top\" height=\"62\" style=\"width:268px;height:62px;padding:8px 16px 18px 16px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;\">{{sub_1}}</td></tr>\n              </table></td><td class=\"gapcol\" width=\"12\" style=\"width:12px;font-size:0;line-height:0;\">&nbsp;</td><td class=\"col\" width=\"270\" valign=\"top\" style=\"width:270px;\">\n              <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"270\" style=\"width:270px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"268\" align=\"center\" style=\"width:268px;padding:16px 16px 0 16px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"236\" style=\"width:236px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"236\" height=\"130\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:236px;height:130px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\">{{image_2}}<!-- 발송 시 교체: <img src=\"{{image_2}}\" width=\"236\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:236px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"268\" align=\"center\" valign=\"top\" height=\"50\" style=\"width:268px;height:50px;padding:16px 16px 0 16px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:16px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;\">{{main_2}}</td></tr>\n                <tr><td class=\"fwc\" width=\"268\" align=\"center\" valign=\"top\" height=\"62\" style=\"width:268px;height:62px;padding:8px 16px 18px 16px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#868686;\">{{sub_2}}</td></tr>\n              </table></td></tr>\n        </table></td></tr>",
    fields: [{"key": "c_headline", "label": "섹션 제목", "type": "text"}, {"key": "image_1", "label": "카드1 이미지", "type": "image"}, {"key": "main_1", "label": "카드1 메인 카피", "type": "text"}, {"key": "sub_1", "label": "카드1 서브 카피", "type": "text"}, {"key": "image_2", "label": "카드2 이미지", "type": "image"}, {"key": "main_2", "label": "카드2 메인 카피", "type": "text"}, {"key": "sub_2", "label": "카드2 서브 카피", "type": "text"}]
  },

  linkCardsWithDesc: {
    label: "이미지 카드 1x3 (이미지 링크+카피)",
    html: "<tr><td class=\"pad\" style=\"padding:44px 24px 0 24px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:19px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;color:#0F218B;letter-spacing:-0.01em;\">{{c_headline}}</td></tr><tr><td class=\"fwc\" width=\"552\" style=\"width:552px;padding:10px 0 0 0;font-size:0;line-height:0;\"><table  role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"40\" style=\"width:40px;border-collapse:collapse;\"><tr><td width=\"40\" height=\"3\" bgcolor=\"#FFCC00\" style=\"width:40px;height:3px;background-color:#FFCC00;font-size:0;line-height:0;\">&nbsp;</td></tr></table></td></tr></table></td></tr><tr><td class=\"pad\" style=\"padding:18px 24px 0 24px;\">\n        <!--[if mso]><table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;border-collapse:collapse;\"><tr><![endif]-->\n        <div class=\"hgrid\" style=\"font-size:0;line-height:0;text-align:left;width:100%;max-width:552px;\">\n            <!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_1}}\" style=\"color:#868686;text-decoration:none;\">{{image_1}}</a><!-- 발송 시 교체: <img src=\"{{image_1}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" style=\"width:174px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;\"><a href=\"{{link_1}}\" style=\"color:#000000;text-decoration:none;\">{{main_1}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" style=\"width:174px;padding:6px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;\">{{sub_1}}</td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" style=\"width:174px;padding:7px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;color:#A0A0A0;\">{{desc_1}}</td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_2}}\" style=\"color:#868686;text-decoration:none;\">{{image_2}}</a><!-- 발송 시 교체: <img src=\"{{image_2}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" style=\"width:174px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;\"><a href=\"{{link_2}}\" style=\"color:#000000;text-decoration:none;\">{{main_2}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" style=\"width:174px;padding:6px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;\">{{sub_2}}</td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" style=\"width:174px;padding:7px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;color:#A0A0A0;\">{{desc_2}}</td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]--><!--[if mso]><td width=\"184\" valign=\"top\" style=\"width:184px;\"><![endif]-->\n            <div class=\"hcell\" style=\"display:inline-block;width:184px;max-width:100%;vertical-align:top;box-sizing:border-box;padding:0 4px 12px 4px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"176\" style=\"width:100%;max-width:176px;box-sizing:border-box;border-collapse:collapse;border:1px solid #EEEEEE;\">\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" style=\"width:174px;padding:12px 12px 0 12px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"150\" style=\"width:150px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"150\" height=\"96\" align=\"center\" valign=\"middle\" bgcolor=\"#FFFFFF\" style=\"width:150px;height:96px;box-sizing:border-box;background-color:#FFFFFF;border:1px solid #DFDFDF;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:14px;mso-line-height-rule:exactly;color:#868686;letter-spacing:0.02em;word-break:break-all;overflow-wrap:anywhere;\"><a href=\"{{link_3}}\" style=\"color:#868686;text-decoration:none;\">{{image_3}}</a><!-- 발송 시 교체: <img src=\"{{image_3}}\" width=\"150\" alt=\"\" class=\"fluidimg\" style=\"display:block;width:100%;max-width:150px;height:auto;border:0;\" /> --></td></tr></table></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" style=\"width:174px;padding:13px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:20px;mso-line-height-rule:exactly;font-weight:bold;color:#000000;\"><a href=\"{{link_3}}\" style=\"color:#000000;text-decoration:none;\">{{main_3}}</a></td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" style=\"width:174px;padding:6px 12px 0 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:12px;line-height:18px;mso-line-height-rule:exactly;color:#868686;\">{{sub_3}}</td></tr>\n                <tr><td class=\"fwc\" width=\"174\" align=\"center\" valign=\"top\" style=\"width:174px;padding:7px 12px 14px 12px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:11px;line-height:16px;mso-line-height-rule:exactly;color:#A0A0A0;\">{{desc_3}}</td></tr>\n              </table></div>\n            <!--[if mso]></td><![endif]-->\n        </div>\n        <!--[if mso]></tr></table><![endif]-->\n      </td></tr>",
    fields: [{"key":"c_headline","label":"섹션 제목","type":"text"},{"key":"image_1","label":"카드1 이미지","type":"image"},{"key":"main_1","label":"카드1 카피","type":"text"},{"key":"sub_1","label":"카드1 카피","type":"text"},{"key":"desc_1","label":"카드1 카피","type":"text"},{"key":"link_1","label":"카드1 링크","type":"link"},{"key":"image_2","label":"카드2 이미지","type":"image"},{"key":"main_2","label":"카드2 카피","type":"text"},{"key":"sub_2","label":"카드2 카피","type":"text"},{"key":"desc_2","label":"카드2 카피","type":"text"},{"key":"link_2","label":"카드2 링크","type":"link"},{"key":"image_3","label":"카드3 이미지","type":"image"},{"key":"main_3","label":"카드3 카피","type":"text"},{"key":"sub_3","label":"카드3 카피","type":"text"},{"key":"desc_3","label":"카드3 카피","type":"text"},{"key":"link_3","label":"카드3 링크","type":"link"}]
  },

  twoCtaButtons: {
    label: "CTA 버튼 1x2",
    html: "<tr><td class=\"pad\" align=\"center\" style=\"padding:44px 24px 44px 24px;\">\n        <table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"552\" style=\"width:552px;table-layout:fixed;border-collapse:collapse;\">\n          <tr>\n            <td class=\"col\" width=\"270\" align=\"center\" style=\"width:270px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"270\" style=\"width:270px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"270\" align=\"center\" bgcolor=\"#0F218B\" style=\"width:270px;background-color:#0F218B;border-radius:2px;\"><a href=\"{{cta_url_1}}\" style=\"display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;\">{{cta_label_1}}</a></td></tr></table></td>\n            <td class=\"gapcol\" width=\"12\" style=\"width:12px;font-size:0;line-height:0;\">&nbsp;</td>\n            <td class=\"col\" width=\"270\" align=\"center\" style=\"width:270px;\"><table class=\"fw\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"270\" style=\"width:270px;border-collapse:collapse;\"><tr><td class=\"fwc\" width=\"270\" align=\"center\" bgcolor=\"#0F218B\" style=\"width:270px;background-color:#0F218B;border-radius:2px;\"><a href=\"{{cta_url_2}}\" style=\"display:block;padding:14px 10px;font-family:Arial,'Malgun Gothic','맑은 고딕',Helvetica,sans-serif;font-size:14px;line-height:18px;mso-line-height-rule:exactly;font-weight:bold;color:#FFFFFF;text-decoration:none;letter-spacing:0.02em;\">{{cta_label_2}}</a></td></tr></table></td>\n          </tr>\n        </table>\n      </td></tr>",
    fields: [{"key": "cta_url_1", "label": "버튼1 링크", "type": "link"}, {"key": "cta_label_1", "label": "버튼1 문구", "type": "button-label"}, {"key": "cta_url_2", "label": "버튼2 링크", "type": "link"}, {"key": "cta_label_2", "label": "버튼2 문구", "type": "button-label"}]
  },

};

/** ⚠️ 2026-09 신설 — 헤더 1개 + 섹션 여러 개를 자유롭게 골라 조합하는 파일럿
 *  조립 함수. blocks.js의 substituteImages/substituteRest는 export가 안 되어
 *  있어서(기존 18개 완성형 템플릿 전용으로 내부에 갇혀 있음), 이 파일럿은
 *  독립적으로 동작하도록 자체 치환 로직을 둡니다 — 기존 조립 로직을 건드리지
 *  않아 회귀 위험이 없습니다.
 *
 *  ⚠️ 2026-09 재설계 — 같은 섹션 종류(예: "이미지 카드 3단")를 두 번 추가하면,
 *  둘 다 똑같은 필드 키(c_headline_1, main_1 등)를 쓰기 때문에 값이 서로
 *  독립적이지 않고 하나로 뒤섞이는 문제가 있었습니다. 이제 각 섹션은 고유
 *  인스턴스 id를 갖고(sectionInstances가 문자열 배열이 아니라 {id, type}
 *  객체 배열), 그 인스턴스의 값은 values.sections[id] 아래에 따로 저장해서
 *  완전히 독립적으로 만듭니다. 헤더는 항상 1개뿐이라 네임스페이스 없이
 *  values를 그대로 씁니다.
 *  @param {string} headerId - EDM_HEADER_TYPES의 키
 *  @param {{id:string, type:string}[]} sectionInstances - 추가한 순서대로
 *  @param {Record<string,any>} values - 헤더 값(최상위) + values.sections[id]에 섹션별 값
 */
export function assembleFreeformEdmHtml(headerId, sectionInstances, values = {}) {
  const header = EDM_HEADER_TYPES[headerId];
  if (!header) throw new Error(`알 수 없는 헤더 종류: ${headerId}`);

  // ⚠️ 2026-09 신설 — "다른 템플릿처럼 미리보기에서 직접 수정 가능하게" 요청
  // 반영. blocks.js의 substituteRest()와 같은 방식(<span data-field="key">로
  // 텍스트 필드를 감싸서 iframe 안에서 contenteditable로 편집 가능하게)을
  // 재사용합니다. 다만 프리템플릿은 같은 섹션을 여러 번 추가할 수 있어서
  // 필드 키가 중복될 수 있으니, namespace(섹션 인스턴스 id)를 key 앞에
  // "id::key" 형태로 붙여 서로 절대 안 겹치게 합니다. 헤더는 인스턴스가 항상
  // 1개뿐이라 namespace 없이 key 그대로 씁니다.
  const substitute = (rawHtml, fieldValues, fieldDefs, namespace) => {
    const ns = key => (namespace ? `${namespace}::${key}` : key);
    const textFieldKeys = new Set(fieldDefs.filter(f => f.type === "text" || f.type === "button-label").map(f => f.key));
    // ⚠️ 2026-09 — 값이 없을 때 "[copy_headline]"처럼 영어 필드 키를 그대로
    // 보여주고 있었는데, 고정 템플릿은 텍스트는 그냥 빈 칸, 이미지는 한글
    // 라벨("이미지 1")을 보여줍니다. 완전히 동일하게 맞추기 위해 라벨을
    // 찾을 수 있는 맵을 만듭니다.
    const labelByKey = new Map(fieldDefs.map(f => [f.key, f.label]));

    // ⚠️ 2026-09 신설 — 텍스트("카피") 필드마다 사용 여부 토글을 추가했습니다.
    // 꺼진 필드는 값을 비우는 게 아니라, 그 필드가 들어있는 행(<tr>) 자체를
    // 완전히 제거합니다(기존 고정 템플릿의 필드 숨김과 동일하게
    // removeFieldRowPreservingGap 재사용) — 안 그러면 "카피는 없는데 그
    // 자리만 비어서 어색한 여백"이 남기 때문입니다. 다른 치환보다 반드시
    // 먼저 실행해야 {{key}} 마커가 아직 살아있어서 행 위치를 찾을 수 있습니다.
    //
    // ⚠️ 2026-09 버그 수정 — "고객명" 토글을 껐더니 같은 줄에 있던
    // "헤드라인"까지 같이 사라지는 문제가 있었습니다(예:
    // "{{customer_name}} 고객님,<br/>{{copy_headline}}"처럼 두 필드가 같은
    // <tr> 한 줄을 공유하는 경우, 행 전체 삭제가 둘 다 지워버림). 이제 지우기
    // 전에 그 행 안에 아직 살아있는(숨김 안 된) 다른 텍스트 필드가 있는지
    // 먼저 확인해서, 있으면 행 전체를 지우는 대신 이 필드의 {{key}}만
    // 빈 문자열로 바꿔 그 필드 부분만 사라지게 합니다.
    let out = rawHtml;
    for (const key of textFieldKeys) {
      if (!fieldValues[`${key}__hidden`]) continue;
      const idx = out.indexOf(`{{${key}}}`);
      if (idx === -1) continue;
      const rowStart = out.lastIndexOf("<tr>", idx);
      const rowEnd = out.indexOf("</tr>", idx);
      const row = rowStart !== -1 && rowEnd !== -1 ? out.slice(rowStart, rowEnd) : "";
      const otherLiveFieldInRow = [...textFieldKeys].some(otherKey =>
        otherKey !== key && row.includes(`{{${otherKey}}}`) && !fieldValues[`${otherKey}__hidden`]
      );
      if (otherLiveFieldInRow) {
        out = out.replace(`{{${key}}}`, "");
      } else {
        out = removeFieldRowPreservingGap(out, key);
        // ⚠️ 2026-09 버그 수정 — "섹션 제목"류(c_headline로 시작) 필드는
        // 바로 다음에 순수 장식용 노란 밑줄 <tr>(글자가 없어서
        // removeFieldRowPreservingGap이 못 찾음)이 따로 붙어 있습니다.
        // 제목을 꺼도 밑줄만 남아 어색했던 문제라, 제목 행을 지운 자리
        // 바로 뒤에 남은 밑줄 장식 행(bgcolor="#FFCC00")도 같이 지웁니다.
        if (key.startsWith("c_headline")) {
          out = out.replace(
            /(<tr><td[^>]*>&nbsp;<\/td><\/tr>)?(\s*<tr><td[^>]*style="[^"]*"><table[^>]*width="40"[^>]*>[\s\S]*?bgcolor="#FFCC00"[\s\S]*?<\/table><\/td><\/tr>)/,
            (m, spacer) => spacer || ""
          );
        }
      }
    }

    // CTA류 버튼(<a href="{{urlKey}}" ...>{{labelKey}}</a>)은 문구와 링크가
    // 한 세트라, 미리보기의 팝업 편집기(문구+링크 동시 수정)가 동작하도록
    // data-link-field를 함께 심습니다. 이 블록의 필드가 아니면(다른 섹션의
    // 우연한 패턴이면) 손대지 않고 그대로 둡니다.
    out = out.replace(
      /<a href="\{\{([a-zA-Z0-9_]+)\}\}"([^>]*)>\{\{([a-zA-Z0-9_]+)\}\}<\/a>/g,
      (match, urlKey, attrs, labelKey) => {
        if (!textFieldKeys.has(labelKey)) return match;
        const hrefVal = fieldValues[urlKey] || "#";
        const label = fieldValues[labelKey];
        const labelText = label !== undefined && label !== "" ? esc(label) : `[${labelByKey.get(labelKey) || labelKey}]`;
        return `<a href="${esc(hrefVal)}"${attrs}><span data-field="${ns(labelKey)}" data-link-field="${ns(urlKey)}">${labelText}</span></a>`;
      }
    );

    // ⚠️ 2026-09 버그 수정 — img 태그 원본은 alt=""로 비어있는데(가이드라인
    // 검사가 "alt 없음"으로 잡아냄), 고정 템플릿의 substituteImages()에는
    // altText로 채우는 로직이 있던 게 여기(프리템플릿)엔 통째로 빠져 있었습니다
    // — 그래서 상품그리드 등 이미지를 채워도 항상 alt가 비어서 경고가 났습니다.
    // fieldValues[`${key}_alt`](예: 시리즈 조회 시 채워지는 상품명)가 있으면
    // 그걸, 없으면 기본 문구를 씁니다.
    out = out.replace(
      /\{\{(image_[a-zA-Z0-9_]+)\}\}(<\/a>)?<!--\s*발송 시 교체:\s*(<img[^>]*>)\s*-->/g,
      (match, key, closingA, imgTag) => {
        const url = fieldValues[key];
        const closing = closingA || "";
        if (url) {
          const altText = fieldValues[`${key}_alt`] || "상품/콘텐츠 이미지";
          const withSrc = imgTag.replace(`{{${key}}}`, esc(url));
          const withAlt = withSrc.replace(/alt="[^"]*"/, `alt="${esc(altText)}"`);
          return withAlt + closing;
        }
        return `<span style="color:#c9a227;font-style:italic;font-size:11px;">${esc(labelByKey.get(key) || key)}</span>` + closing;
      }
    );

    // ⚠️ 2026-09 — "[copy_headline]"처럼 영어 필드 키를 그대로 보여주고
    // 있었는데, 고정 템플릿은 값이 없으면 그냥 빈 칸입니다. 완전히 동일하게
    // 맞췄습니다 — 부수 효과로, coupon_value(44px 폰트)에 긴 영어 placeholder가
    // 들어가서 줄바꿈되던 문제도 근본적으로 사라집니다(빈 문자열은 절대
    // 줄바꿈되지 않으므로 SHORT_PLACEHOLDERS 같은 특수 처리 자체가 불필요).
    // ⚠️ 2026-09 재수정 — CSS :empty::before로 "(클릭해서 입력)"류 안내를
    // 띄우는 방식은, 그 안내 문구가 항상 회색·이탤릭(::before 규칙에 박힌
    // 스타일)로 나와서 "그 자리의 원래 색상/폰트(예: 파란 굵은 헤드라인)를
    // 유지하지 않는다"는 지적을 받았습니다. 고정 템플릿의 currentValues()를
    // 다시 보니, 실제로는 CSS 트릭이 아니라 "값이 비어있으면 [라벨]이라는
    // 문자열 자체를 값으로 채워 넣는" 방식이었습니다 — 이러면 일반 텍스트로
    // 치환되니 그 요소 고유의 스타일을 그대로 물려받습니다. 완전히 동일하게
    // 맞춥니다.
    out = out.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
      if (key === "preheader") return match; // shell에서 별도 처리
      const val = fieldValues[key];
      const text = val !== undefined && val !== "" ? esc(val) : `[${labelByKey.get(key) || key}]`;
      // ⚠️ link 타입(href 속성값 등)에 <span>을 끼워 넣으면 HTML 자체가
      // 깨지니, 반드시 textFieldKeys(type이 "text"인 것)만 감쌉니다.
      return textFieldKeys.has(key) ? `<span data-field="${ns(key)}">${text}</span>` : text;
    });
    return out;
  };

  // ⚠️ 2026-09 신설 — productGrid는 15칸이 항상 다 있는데, 시리즈코드를 몇 개만
  // 입력하면 나머지 빈 칸은 [brandName_N] 같은 placeholder만 덩그러니 보여서
  // 어색합니다. 기존 고정 템플릿(product-field, hiddenCardKeys)처럼가 값이 없는
  // 카드는 아예 통째로 안 보이게(<div class="hcell">...</div> 자체를 제거)
  // 합니다 — 그래야 입력한 개수만큼만 딱 맞게 나옵니다.
  function removeEmptyProductCards(html, fieldValues) {
    let out = html;
    for (let n = 15; n >= 1; n--) {
      const hasValue = fieldValues[`brandName_${n}`] || fieldValues[`seriesName_${n}`] || fieldValues[`price_${n}`] || fieldValues[`image_${n}`];
      if (hasValue) continue;
      const priceMarker = `{{price_${n}}}`;
      const priceIdx = out.indexOf(priceMarker);
      if (priceIdx === -1) continue;
      const hcellOpenIdx = out.lastIndexOf('<div class="hcell"', priceIdx);
      if (hcellOpenIdx === -1) continue;
      const msoOpenMarker = '<!--[if mso]><td width="184" valign="top" style="width:184px;"><![endif]-->\n            ';
      const startIdx = out.slice(hcellOpenIdx - msoOpenMarker.length, hcellOpenIdx) === msoOpenMarker
        ? hcellOpenIdx - msoOpenMarker.length : hcellOpenIdx;
      let endIdx = out.indexOf("</div>", priceIdx) + "</div>".length;
      const msoCloseMarker = "\n            <!--[if mso]></td><![endif]-->";
      if (out.slice(endIdx, endIdx + msoCloseMarker.length) === msoCloseMarker) endIdx += msoCloseMarker.length;
      out = out.slice(0, startIdx) + out.slice(endIdx);
    }
    return out;
  }

  let body = substitute(header.html, values, header.fields, null);
  for (const inst of sectionInstances) {
    const section = EDM_SECTION_TYPES[inst.type];
    if (!section) continue; // 알 수 없는 섹션 종류는 조용히 건너뜀(오타 등으로 전체가 깨지지 않게)
    const instanceValues = values.sections?.[inst.id] || {};
    const sourceHtml = inst.type === "productGrid" ? removeEmptyProductCards(section.html, instanceValues) : section.html;
    body += substitute(sourceHtml, instanceValues, section.fields, inst.id);
  }

  let html = EDM_SHELL_OPEN + body + EDM_SHELL_CLOSE;
  html = html.replace("{{preheader}}", esc(values.preheader || ""));
  return html;
}
