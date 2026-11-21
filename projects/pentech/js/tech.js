/* 기술공법 페이지: 주소의 ?id= 값으로 공법을 골라 같은 틀에 그린다 */
window.initPage = function () {
  var m = /[?&]id=(\w+)/.exec(location.search);
  var t = techById(m ? m[1] : 'roof') || TECH[0];
  document.title = t.name + ' (' + t.area + ') — (주)펜테크 | 리디자인 시안';
  var IMGB = IMG;
  var no = 0;
  function eb(label) { no++; return '<span class="eyebrow"><b>' + (no < 10 ? '0' : '') + no + '</b> ' + label + '</span>'; }

  var h = '';

  /* 머리: 글은 종이 칸, 사진은 옆 칸 */
  h += '<section class="page-head" style="--banner:url(\'' + t.banner + '\')"><div class="wrap"><div>' +
    '<nav class="crumb" aria-label="현재 위치"><a href="index.html">홈</a><span><a href="tech.html?id=roof">기술공법</a></span><span>' + t.name + '</span></nav>' +
    '<div class="tech-switch" aria-label="다른 공법">' + TECH.map(function (x) {
      return '<a href="tech.html?id=' + x.id + '" style="--c:' + x.color + '"' + (x.id === t.id ? ' aria-current="page"' : '') + '><i></i>' + x.name + '</a>';
    }).join('') + '</div>' +
    '<h1 class="rv-h"><small>' + t.en.toUpperCase() + ' · ' + t.area + '</small>' + t.name + '</h1>' +
    '<p class="lead rv-h">' + esc(t.lead) + '</p>' +
    '<p class="define">' + t.define + '</p></div></div></section>';

  /* 페이지 안 목차 */
  var toc = [['why', '왜 문제인가'], ['method', '공법 개요'], ['keys', '핵심 기술'], ['process', '시공 과정'], ['cases', '적용 사례'], ['perf', '성능 · 특허']];
  h += '<nav class="toc" aria-label="이 페이지 목차"><div class="wrap"><ul>' + toc.map(function (x) { return '<li><a href="#' + x[0] + '">' + x[1] + '</a></li>'; }).join('') + '</ul></div></nav>';

  /* 왜 문제인가 */
  var p = t.problem;
  h += '<section class="sec" id="why"><div class="wrap why' + (p.photos.length ? '' : ' why-solo') + '"><div class="rv">' + eb('왜 문제인가') +
    '<h2 class="h2">' + esc(p.title) + '</h2><p class="lead">' + esc(p.text) + '</p>' +
    '<p class="causes-label" style="margin-top:28px;font-weight:800">' + esc(p.label) + '</p>' +
    '<ol class="causes" style="margin-top:10px">' + p.items.map(function (c, i) {
      return '<li><em>0' + (i + 1) + '</em><b>' + esc(c[0]) + '<small>' + esc(c[1]) + '</small></b><span>' + esc(c[2]) + '</span></li>';
    }).join('') + '</ol></div>' +
    (p.photos.length ? '<div class="why-photos rv' + (p.photos.length === 1 ? ' one' : (p.items.length >= 4 ? ' stack' : '')) + '">' + p.photos.map(function (x) { return ph(x[0], x[1], 'why'); }).join('') + '</div>' : '') + '</div></section>';

  /* 공법 개요 + 층 단면 */
  var md = t.method;
  var isSteps = /^\d차/.test(md.points[0]);
  var pts = isSteps
    ? '<ol class="steps-list">' + md.points.map(function (s) {
        var mm = /^(\d차):\s*(.*)$/.exec(s);
        return mm ? '<li><span><b>' + mm[1] + '</b> · ' + esc(mm[2]) + '</span></li>' : '<li class="note"><span>' + esc(s) + '</span></li>';
      }).join('') + '</ol>'
    : '<ul class="checks" style="margin-top:18px">' + md.points.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
  h += '<section class="sec alt" id="method"><div class="wrap"><div class="method' + (md.diagram ? ' fit' : '') + '"><div class="rv">' + eb('공법 개요') +
    '<h2 class="h2">' + esc(md.title) + '</h2>' + pts +
    '<p class="fields"><b>적용 분야</b>' + esc(md.fields) + '</p></div>' +
    '<div class="rv">' + strataHTML(t) + (md.diagram ? '' : '<div style="margin-top:16px">' + ph(md.image[0], md.image[1], 'method') + '</div>') + '</div></div>';
  if (t.compare) {
    var c = t.compare;
    h += '<div class="compare rv"><h3 class="h3" style="margin-bottom:30px">' + esc(c.title) + '</h3><div class="tbl tbl-scroll"><table>' +
      '<thead><tr>' + c.head.map(function (x) { return '<th scope="col">' + esc(x) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      c.rows.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td><td class="hi">' + esc(r[2]) + '</td></tr>'; }).join('') +
      '</tbody></table></div></div>';
  }
  h += '</div></section>';

  /* 핵심 기술: 기존 사이트 방식 (큰 도해 → 2열 설명 → 사진 옆 설명), 장점 4가지는 2×2, 아래에 블로그 링크 */
  h += '<section class="sec" id="keys"><div class="wrap"><div class="sec-head rv" style="margin-bottom:28px"><div>' + eb('핵심 기술') +
    '<h2 class="h2">' + t.name + ' 핵심 기술 요소<small class="en">(Key Technology)</small></h2>' +
    '<p class="fields-line">적용 분야: ' + esc(md.fields) + '</p></div></div>';
  if (md.diagram) h += '<figure class="diagram rv">' + ph(md.image[0], md.image[1], 'diagram') + '</figure>';
  h += '<div class="keys">' + t.keys.map(function (k) {
      return '<article class="key rv"><h3>' + esc(k[0]) + '<small>(' + esc(k[1]) + ')</small></h3>' +
        '<ul class="dots">' + k[2].map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></article>';
    }).join('') + '</div>';
  if (t.proof) {
    h += '<div class="proof rv"><div><b>차열 상도, 열화상으로 확인했습니다</b><p>' + esc(t.proof.text) + '</p></div>' +
      '<div>' + ph(t.proof.img, '열화상 비교: 슁글 마감(오른쪽) vs 루프가드 차열 상도(왼쪽)', 'proof') + '</div></div>';
  }
  h += '<div class="keys-foot rv"><p>현장 이야기와 더 많은 시공 기록은 펜테크 블로그와 유튜브에 있습니다.</p><div class="btns">' +
    '<a class="btn btn-ink btn-sm" href="' + t.blog + '" target="_blank" rel="noopener">' + t.name + ' 블로그 바로가기 <span class="arr">↗</span></a>' +
    (t.blog2 ? '<a class="btn btn-line btn-sm" href="' + t.blog2 + '" target="_blank" rel="noopener">시공 현장 인터뷰 ↗</a>' : '') +
    '<a class="btn btn-line btn-sm" href="cases.html#' + t.videoCat + '">시공 영상 보기</a></div></div></div></section>';

  /* 시공 과정: 큰 사진 하나 + 차수 목록. 사진을 누르면 다음 단계로 넘어간다 */
  h += '<section class="sec alt" id="process"><div class="wrap"><div class="sec-head rv"><div>' + eb('시공 과정') +
    '<h2 class="h2">사진을 눌러 공정을 따라가 보세요</h2><p class="lead">차수를 고르거나, 사진을 누르면 다음 단계로 넘어갑니다. 마지막은 시공 완료입니다.</p></div></div>' +
    '<div id="procBox" class="rv"></div></div></section>';

  /* 적용 사례 */
  h += '<section class="sec" id="cases"><div class="wrap"><div class="sec-head rv"><div>' + eb('적용 사례') +
    '<h2 class="h2">' + t.name + '로 다시 태어난 현장</h2><p class="lead">사진을 누르면 크게 볼 수 있습니다.</p></div>' +
    '<a class="link-arrow" href="cases.html#' + t.videoCat + '">시공 영상으로 보기 →</a></div>' +
    '<div class="cases rv" style="grid-template-columns:repeat(' + casesCols(t.cases.items.length) + ',1fr)">' + t.cases.items.map(function (c) { return ph(IMGB + t.cases.base + c[0] + '.webp', c[1], 'cases'); }).join('') + '</div></div></section>';

  /* 성능 · 시험성적: 표는 양옆으로 */
  h += '<section class="sec alt" id="perf"><div class="wrap"><div class="sec-head rv"><div>' + eb('성능') +
    '<h2 class="h2">성능 · 시험성적 · 특허</h2></div></div>';
  if (t.tests) {
    h += '<div class="tests rv">' + t.tests.map(function (ts) {
      return '<div class="tbl tbl-scroll"><table><caption>' + esc(ts.title) + '</caption><thead><tr>' +
        ts.head.map(function (x) { return '<th scope="col">' + esc(x) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        ts.rows.map(function (r) {
          return '<tr><th scope="row">' + esc(r[0]) + '</th>' + r.slice(1).map(function (v, vi) {
            if (v === '합격') return '<td><span class="pass">합격</span></td>';
            var last = vi === r.length - 2 && ts.head[ts.head.length - 1] === '결과';
            var res = ts.head[ts.head.length - 1] === '판정' && vi === r.length - 3;
            return '<td' + (last || res ? ' class="hi"' : '') + '>' + esc(v) + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>';
    }).join('') + '</div>';
    if (t.tests[0].note) h += '<p class="warn">※ 기존 사이트에 적힌 수치를 그대로 옮겼습니다. 표 제목이 \'월터가드\'로 되어 있고 숫자가 루프가드 표와 같아, 실제 폴리우레아 성적인지 확인이 필요합니다.</p>';
  }
  if (t.metrics) {
    h += '<div class="metrics rv" style="margin-top:' + (t.tests ? '16px' : '0') + '">' + t.metrics.map(function (x) { return '<div class="metric"><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></div>'; }).join('') + '</div>';
  }
  /* 특허: 성능과 같은 구역 안에 (따로 두면 한 줄짜리 구역이 생겨 허전함) */
  h += '<div class="sec-head rv" id="patent" style="margin:44px 0 16px"><h3 class="h3">' + t.name + ' 관련 특허 ' + t.patents.length + '건</h3>' +
    '<a class="link-arrow" href="about.html#cert">특허 · 인증 전체 →</a></div>' +
    '<div class="patents rv">' + t.patents.map(function (x) { return patentBtn(x, 'pat-' + t.id); }).join('') + '</div>';
  h += '</div></section>';

  /* 다른 공법 */
  h += '<section class="sec tight"><div class="wrap"><div class="sec-head rv" style="margin-bottom:20px"><h2 class="h3">다른 곳도 문제인가요?</h2></div>' +
    '<div class="solutions four rv" aria-label="다른 공법">' +
    TECH.filter(function (x) { return x.id !== t.id; }).map(function (x) {
      return '<a class="solution" href="tech.html?id=' + x.id + '" style="--c:' + x.color + '"><img src="' + x.card + '" alt="" loading="lazy"><div><small>다른 공법 · ' + x.where + '</small><b>' + x.name + '</b></div></a>';
    }).join('') + '</div></div></section>';

  /* 상담 띠 */
  h += '<section class="cta"><div class="wrap"><div><h2>' + esc(t.cta) + '</h2><p>현장 상태를 보고 ' + t.name + '가 맞는지부터 정직하게 말씀드립니다.</p></div>' +
    '<div class="btns"><a class="btn btn-light" href="contact.html?tech=' + t.id + '#inquiry">' + t.name + ' 견적 문의 <span class="arr">→</span></a>' +
    '<a class="btn btn-line" href="contact.html#docs">시공 제안서</a></div></div></section>';

  $('#tech').innerHTML = h;
  initProc(t);
  initWhyFit();
};

/* 왜 문제인가 (PC): 사진 묶음을 '5대 원인' 표와 위·아래 줄을 맞춤. 사진은 자르지 않고 폭만 조절 */
function fitWhy() {
  var box = document.querySelector('.why-photos'), list = document.querySelector('.why .causes');
  if (!box || !list) return;
  var phs = [].slice.call(box.querySelectorAll('.ph')), imgs = phs.map(function (p) { return p.querySelector('img'); });
  box.style.width = ''; box.style.marginTop = ''; box.style.gridTemplateColumns = '';
  imgs.forEach(function (m) { m.style.height = ''; m.style.objectFit = ''; });
  if (window.innerWidth <= 980) return;
  if (imgs.some(function (m) { return !m.naturalWidth; })) return;          // 사진을 다 받은 뒤에 계산
  var n = phs.length, sumR = 0;
  imgs.forEach(function (m) { sumR += m.naturalHeight / m.naturalWidth; });
  var cs = getComputedStyle(box), gapY = (parseFloat(cs.rowGap) || 0) * (n - 1), gapX = parseFloat(cs.columnGap) || 0;
  function pageTop(el) { var y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }   // 나타나기 움직임(transform)에 영향받지 않는 위치
  function caps() { var c = 0; phs.forEach(function (p, i) { c += p.offsetHeight - imgs[i].offsetHeight; }); return c; }
  box.style.width = '100%';
  var cw = box.offsetWidth, top = pageTop(list) - pageTop(box), target = list.offsetHeight;
  /* 1) 사진을 자르지 않고 위아래로 쌓았을 때 표 높이에 딱 맞는 폭 */
  var w = Math.min(cw, 500);
  for (var k = 0; k < 4; k++) {
    box.style.width = w + 'px';
    var nw = Math.floor(Math.max(300, Math.min(600, cw, (target - gapY - caps()) / sumR)));
    if (Math.abs(nw - w) < 1) break;
    w = nw;
  }
  box.style.marginTop = Math.max(0, top) + 'px';
  if (n === 1) { box.style.width = w + 'px'; return; }
  /* 2) 그 폭이 좁으면 루프가드처럼 넓게(540px) 키우고, 높이는 표에 맞춰 사진을 살짝 자름 */
  var wide = Math.max(w, Math.min(cw, 540)), avail = target - gapY - caps();
  if ((avail / n) / wide >= (sumR / n) * 0.6) {                     // 원래 높이의 60% 이상은 남을 때만
    box.style.width = wide + 'px';
    imgs.forEach(function (m) { m.style.height = Math.floor(avail * (m.naturalHeight / m.naturalWidth) / sumR) + 'px'; m.style.objectFit = 'cover'; });
    return;
  }
  /* 3) 표가 짧아 쌓으면 너무 많이 잘리면: 두 장을 나란히 놓아 칸 폭을 꽉 채움 (높이는 표에 맞추되 너무 길쭉해지진 않게) */
  box.style.width = '100%'; box.style.gridTemplateColumns = 'repeat(' + n + ', 1fr)';
  var colW = (cw - gapX * (n - 1)) / n, capS = 0;
  phs.forEach(function (p, i) { capS = Math.max(capS, p.offsetHeight - imgs[i].offsetHeight); });
  var h = Math.floor(Math.min(target - capS, colW * 1.15));
  imgs.forEach(function (m) { m.style.height = h + 'px'; m.style.objectFit = 'cover'; });
}
function initWhyFit() {
  var box = document.querySelector('.why-photos'), list = document.querySelector('.why .causes');
  if (!box || !list) return;
  [].slice.call(box.querySelectorAll('img')).forEach(function (m) { m.loading = 'eager'; m.addEventListener('load', fitWhy); });
  window.addEventListener('resize', fitWhy);
  if (window.ResizeObserver) new ResizeObserver(fitWhy).observe(list);       // 글꼴 · 영어 전환으로 표 높이가 바뀌면 다시 맞춤
  fitWhy();
}

/* 적용 사례 칸 수: 마지막 줄에 사진 한 장만 남지 않게 (5장 → 5칸, 9장 → 5 + 4) */
function casesCols(n) {
  if (window.innerWidth <= 760) return 2;
  if (window.innerWidth <= 960) return 3;
  return n === 5 || n === 9 ? 5 : 4;
}

/* ── 공정 보기 ── */
function procItems(pr) {
  var a = [];
  pr.steps.forEach(function (s) { a.push({ imgs: [hd(IMG + pr.base + s[0] + '.webp')], tag: /^\d+$/.test(s[1]) ? s[1] + '단계' : s[1], label: s[2], done: false }); });
  if (pr.done && pr.done.length) {                                   // 완료 사진은 한 단계로 합쳐서 함께 보여 줌
    var labels = [];
    pr.done.forEach(function (d) { if (labels.indexOf(d[1]) < 0) labels.push(d[1]); });
    a.push({ imgs: pr.done.map(function (d) { return hd(IMG + pr.base + d[0] + '.webp'); }), tag: '완료', label: labels.join(' · '), done: true });
  }
  return a;
}
function initProc(t) {
  var box = document.getElementById('procBox');
  if (!box) return;
  var g = 0, i = 0, pre = -1;
  function draw() {
    var items = procItems(t.process[g]), it = items[i], last = i === items.length - 1;
    if (pre !== g) { pre = g; items.forEach(function (s) { s.imgs.forEach(function (u) { new Image().src = u; }); }); }   // 이 그룹 사진을 미리 받아 둠
    var groups = t.process.length > 1 ? '<div class="pv-groups" role="tablist" aria-label="시공 종류">' + t.process.map(function (p, pi) {
      return '<button class="chip" role="tab" aria-selected="' + (pi === g) + '" data-g="' + pi + '">' + esc(p.title) + '</button>';
    }).join('') + '</div>' : '';
    var photo = it.done
      ? '<div class="pv-photo n' + it.imgs.length + '">' + it.imgs.map(function (u) {
          return '<button type="button" class="pv-img" data-zoom data-src="' + esc(u) + '" data-cap="' + esc(it.label) + '" data-group="pv" aria-label="사진 크게 보기"><img src="' + esc(u) + '" alt="' + esc(it.label) + '"></button>';
        }).join('') + '<span class="pv-badge done">' + esc(it.tag) + '</span></div>'
      : '<button type="button" class="pv-photo" data-next aria-label="다음 단계 사진 보기"><img src="' + esc(it.imgs[0]) + '" alt="' + esc(it.tag + ' ' + it.label) + '"><span class="pv-badge">' + esc(it.tag) + '</span></button>';
    box.innerHTML = groups + '<div class="procview"><div>' +
      '<div class="pv-cap" aria-live="polite"><b>' + esc(it.label) + '</b><span>' + (i + 1) + ' / ' + items.length + '</span></div>' + photo +
      '<div class="pv-nav"><button class="btn btn-line btn-sm" data-prev' + (i === 0 ? ' disabled style="opacity:.35"' : '') + '>← 이전</button>' +
      '<button class="btn btn-ink btn-sm" data-next>' + (last ? '처음으로' : '다음 단계 →') + '</button></div></div>' +
      '<ol class="pv-steps' + (items.length <= 5 ? ' few' : '') + '">' + items.map(function (s, si) {
        return '<li class="' + (s.done ? 'done' : '') + '"><button data-i="' + si + '"' + (si === i ? ' aria-current="step"' : '') + '><span class="tg">' + esc(s.tag) + '</span><span class="lb">' + esc(s.label) + '</span></button></li>';
      }).join('') + '</ol></div>';
  }
  box.addEventListener('click', function (e) {
    var items = procItems(t.process[g]), c;
    if ((c = e.target.closest('[data-g]'))) { g = +c.getAttribute('data-g'); i = 0; draw(); return; }
    if ((c = e.target.closest('[data-i]'))) { i = +c.getAttribute('data-i'); draw(); return; }
    if (e.target.closest('[data-prev]')) { if (i > 0) { i--; draw(); } return; }
    if (e.target.closest('[data-next]')) { i = (i + 1) % items.length; draw(); }
  });
  draw();
}
