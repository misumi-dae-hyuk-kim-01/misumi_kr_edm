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
function substituteImages(html, values) {
  return html.replace(
    /\{\{(image_[a-zA-Z0-9_]+)\}\}(<\/a>)?<!--\s*발송 시 교체:\s*(<img[^>]*>)\s*-->/g,
    (match, key, closingTag, imgTag) => {
      const url = values[key];
      const closing = closingTag || "";
      if (url) {
        const altText = values[`${key}_alt`] || "상품/콘텐츠 이미지";
        const withSrc = imgTag.replace(`{{${key}}}`, esc(url));
        const withAlt = withSrc.replace(/alt="[^"]*"/, `alt="${esc(altText)}"`);
        return withAlt + closing;
      }
      return `<span style="color:#c9a227;font-style:italic;font-size:11px;">이미지 연동 예정</span>` + closing;
    }
  );
}

/** 나머지 모든 {{변수}} 치환. ESP 병합 태그는 그대로 남기고, 값이 없는 필드는 빈 문자열로
 *  치환합니다(레이아웃 자체는 원본 그대로 유지되고, 텅 빈 자리로만 보임 — 실제 발송 전에
 *  가이드라인 검사에서 "값이 비어있음"을 별도로 잡아내는 걸 전제로 합니다). */
function substituteRest(html, values) {
  return html.replace(/\{\{([a-zA-Z_0-9]+)\}\}/g, (match, key) => {
    if (ESP_MERGE_TAGS.has(key)) return match;
    const v = values[key];
    return v !== undefined && v !== null && v !== "" ? esc(String(v)) : "";
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
  html = substituteImages(html, finalValues);
  html = substituteRest(html, finalValues);
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