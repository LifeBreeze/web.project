/* 시공사례 · 회사소개 · 소식 · 고객지원 */
window.initPage = function () {
  var page = document.body.getAttribute('data-page');
  if (page === 'cases') initCases();
  if (page === 'about') initAbout();
  if (page === 'news') initNews();
  if (page === 'contact') initContact();
};

/* ── 시공사례: 공법 필터 + 하위 분류 묶음 ── */
function initCases() {
  var box = $('#videoList'), bar = $('#videoFilter');
  var cats = ['all', 'roof', 'wall', 'floor'];
  bar.innerHTML = cats.map(function (c) {
    var n = c === 'all' ? VIDEOS.length : VIDEOS.filter(function (v) { return v[0] === c; }).length;
    return '<button class="chip" aria-pressed="false" data-cat="' + c + '">' + (c === 'all' ? '전체' : VIDEO_CATS[c].split(' (')[0]) + '<span class="n">' + n + '</span></button>';
  }).join('');
  function render(cat) {
    $$('.chip', bar).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cat') === cat); });
    var groups = [];
    VIDEOS.forEach(function (v) {
      if (cat !== 'all' && v[0] !== cat) return;
      var key = v[0] + '|' + v[1], g = groups.filter(function (x) { return x.key === key; })[0];
      if (!g) { g = { key: key, cat: v[0], name: v[1], ids: [] }; groups.push(g); }
      g.ids.push(v[2]);
    });
    box.innerHTML = groups.map(function (g) {
      return '<section class="vgroup"><div class="vgroup-head"><h2>' + esc(g.name) + '</h2><span>' + esc(VIDEO_CATS[g.cat]) + ' · ' + g.ids.length + '편</span></div>' +
        '<div class="vgrid">' + g.ids.map(function (id) { return vcard(id); }).join('') + '</div></section>';
    }).join('');
  }
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    var c = b.getAttribute('data-cat'); render(c);
    history.replaceState(null, '', c === 'all' ? 'cases.html' : '#' + c);
  });
  // 주소 끝의 #roof · #wall · #floor 를 읽어서 목록을 거른다. 메뉴를 같은 페이지에서 눌러도(hashchange) 바뀐다.
  function fromHash(scroll) {
    var h = location.hash.slice(1), c = cats.indexOf(h) > 0 ? h : 'all';
    render(c);
    if (scroll && cats.indexOf(h) > 0) bar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  window.addEventListener('hashchange', function () { fromHash(true); });
  fromHash(false);
  if (cats.indexOf(location.hash.slice(1)) > 0) setTimeout(function () { bar.scrollIntoView({ block: 'start' }); }, 120);
}

/* ── 회사소개 ── */
function initAbout() {
  // 대표 솔루션 5칸
  $('#solutions').innerHTML = TECH.map(function (t) {
    return '<a class="solution" href="tech.html?id=' + t.id + '" style="--c:' + t.color + '"><img src="' + t.card + '" alt="" loading="lazy"><div><small>' + t.en + '</small><b>' + t.name + '</b><p>' + esc(t.area) + ' · ' + esc(t.where) + '</p></div></a>';
  }).join('');

  // 연혁: 시기 탭
  var tabs = $('#eraTabs'), body = $('#eraBody');
  tabs.innerHTML = HISTORY.map(function (e, i) {
    return '<button role="tab" aria-selected="' + (i === 0) + '" data-i="' + i + '"><b>' + e.era + '</b><span>' + e.years + '</span></button>';
  }).join('');
  function showEra(i) {
    var e = HISTORY[i];
    $$('button', tabs).forEach(function (b, bi) { b.setAttribute('aria-selected', bi === i); });
    body.innerHTML = '<div class="timeline-side"><span class="eyebrow">PENTECH ' + e.era.toUpperCase() + '</span><h3>' + esc(e.title) + '</h3><p>' + e.years + '</p></div>' +
      '<div class="years">' + e.list.map(function (y) {
        return '<div class="year"><b>' + y[0] + '</b><ul>' + y[1].map(function (m) {
          return '<li><em>' + m[0] + '월</em><div>' + m.slice(1).map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('') + '</div></li>';
        }).join('') + '</ul></div>';
      }).join('') + '</div>';
  }
  tabs.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) showEra(+b.getAttribute('data-i')); });
  showEra(0);

  // 특허: 공법 페이지에 적힌 특허를 모두 모음
  $('#patentAll').innerHTML = TECH.map(function (t) {
    return t.patents.map(function (x) { return patentBtn(x, 'pat-all', t.name); }).join('');
  }).join('');

  // 회사 위치: 지도 + 네이버 지도
  var offBox = $('#offices'), map = $('#mapFrame');
  offBox.innerHTML = OFFICES.map(function (o, i) {
    return '<button class="office" aria-pressed="' + (i === 0) + '" data-i="' + i + '"><b>' + o.name + '</b><span>' + o.addr + '</span></button>';
  }).join('');
  function showOffice(i) {
    var o = OFFICES[i], q = encodeURIComponent(o.addr.replace('서해구', '서구'));
    $$('.office', offBox).forEach(function (b, bi) { b.setAttribute('aria-pressed', bi === i); });
    map.src = 'https://maps.google.com/maps?q=' + q + '&z=16&output=embed&hl=ko';
    map.title = o.name + ' 위치 지도';
    $('#naverLink').href = 'https://map.naver.com/p/search/' + encodeURIComponent(o.addr);
    $('#kakaoLink').href = 'https://map.kakao.com/?q=' + encodeURIComponent(o.addr);
    $('#copyAddr').setAttribute('data-addr', o.addr);
  }
  offBox.addEventListener('click', function (e) { var b = e.target.closest('.office'); if (b) showOffice(+b.getAttribute('data-i')); });
  $('#copyAddr').addEventListener('click', function () {
    var btn = this, a = btn.getAttribute('data-addr');
    function done() { btn.textContent = '복사했어요'; setTimeout(function () { btn.textContent = '주소 복사'; }, 1600); }
    if (navigator.clipboard) navigator.clipboard.writeText(a).then(done, function () { prompt('주소를 복사하세요', a); });
    else prompt('주소를 복사하세요', a);
  });
  showOffice(0);
}

/* ── 소식: 언론보도 3열 × 2행 ── */
function initNews() {
  var per = 6, pages = Math.ceil(NEWS.length / per), grid = $('#newsGrid'), pager = $('#pager');
  function go(p, scroll) {
    grid.innerHTML = NEWS.slice((p - 1) * per, p * per).map(newsCard).join('');
    var h = '<button aria-label="이전 쪽" ' + (p === 1 ? 'disabled' : '') + ' data-p="' + (p - 1) + '">‹</button>';
    for (var i = 1; i <= pages; i++) h += '<button data-p="' + i + '"' + (i === p ? ' aria-current="page"' : '') + '>' + i + '</button>';
    h += '<button aria-label="다음 쪽" ' + (p === pages ? 'disabled' : '') + ' data-p="' + (p + 1) + '">›</button>';
    pager.innerHTML = h;
    if (scroll) document.getElementById('press').scrollIntoView({ behavior: 'smooth' });
  }
  pager.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && !b.disabled) go(+b.getAttribute('data-p'), true); });
  go(1);
}

/* ── 고객지원: 폼 · FAQ · 제안서 ── */
function initContact() {
  // 견적 문의 폼 (시안: 아무것도 보내지 않음)
  var sel = $('#f-tech');
  sel.innerHTML = '<option value="">공법을 고르세요 (모르면 비워 두세요)</option>' + TECH.map(function (t) { return '<option value="' + t.id + '">' + t.name + ' — ' + t.area + '</option>'; }).join('') + '<option value="etc">잘 모르겠어요 · 진단 요청</option>';
  var m = /[?&]tech=(\w+)/.exec(location.search); if (m) sel.value = m[1];
  var form = $('#inqForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true, first = null;
    $$('[data-req]', form).forEach(function (f) {
      var inp = $('input, textarea, select', f), bad;
      if (inp.type === 'checkbox') bad = !inp.checked;
      else if (inp.type === 'email') bad = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value.trim());
      else if (inp.type === 'tel') bad = inp.value.replace(/\D/g, '').length < 9;
      else bad = !inp.value.trim();
      f.classList.toggle('bad', bad);
      if (bad) { ok = false; if (!first) first = inp; }
    });
    var msg = $('#formMsg');
    if (!ok) { msg.classList.remove('show'); first.focus(); return; }
    msg.innerHTML = '<b>입력 확인 완료!</b> 이 화면은 수업 과제용 시안이라 실제로 전송되지 않습니다. 실제 상담은 <a href="tel:' + PHONE + '" style="text-decoration:underline">' + PHONE + '</a>로 연락해 주세요.';
    msg.classList.add('show'); msg.focus();
  });
  form.addEventListener('input', function (e) { var f = e.target.closest('.field'); if (f) f.classList.remove('bad'); });

  // FAQ: 공법 필터 + 검색
  var techName = { '': '공통', roof: '루프가드', wall: '월터가드', penter: '펜터가드', road: '로드가드', poly: '폴리우레아' };
  var filt = $('#faqFilter'), list = $('#faqList'), q = $('#faqSearch'), cur = 'all';
  var keys = ['all', 'roof', 'wall', 'penter', 'road', 'poly', ''];
  filt.innerHTML = keys.map(function (k) {
    var n = k === 'all' ? FAQ.length : FAQ.filter(function (f) { return f[0] === k; }).length;
    return '<button class="chip" aria-pressed="' + (k === 'all') + '" data-k="' + k + '">' + (k === 'all' ? '전체' : techName[k]) + '<span class="n">' + n + '</span></button>';
  }).join('');
  function renderFaq() {
    var s = q.value.trim().toLowerCase();
    var items = FAQ.filter(function (f) { return (cur === 'all' || f[0] === cur) && (!s || (f[2] + f[3] + f[1]).toLowerCase().indexOf(s) > -1); });
    list.innerHTML = items.length ? items.map(function (f) {
      return '<details><summary><span class="q">Q</span><b><small>' + techName[f[0]] + (f[1] ? ' · ' + esc(f[1]) : '') + '</small>' + esc(f[2]) + '</b><span class="pm" aria-hidden="true"></span></summary><div class="a">' + esc(f[3]) + '</div></details>';
    }).join('') : '<p class="faq-empty">찾는 질문이 없나요? <a class="link-arrow" href="#inquiry">직접 문의하기 →</a></p>';
  }
  filt.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    cur = b.getAttribute('data-k');
    $$('.chip', filt).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    renderFaq();
  });
  q.addEventListener('input', renderFaq);
  renderFaq();

  // 시공 제안서 (기존 '다운로드')
  $('#docList').innerHTML = DOCS.map(function (d) {
    var t = techById(d[2]);
    return '<div class="doc"><span class="kind">' + d[0] + '</span><div><b>' + esc(d[1]) + '</b><br><span class="muted" style="font-size:14px">' + (t ? t.name + ' · ' + t.area : '전체 공법') + '</span></div>' +
      '<a class="btn btn-line btn-sm" href="contact.html?tech=' + (t ? t.id : '') + '#inquiry" data-doc="' + esc(d[1]) + '">제안서 요청</a></div>';
  }).join('');
  $('#docList').addEventListener('click', function (e) {
    var a = e.target.closest('[data-doc]'); if (!a) return;
    e.preventDefault();
    var t = /tech=(\w*)/.exec(a.getAttribute('href'));
    if (t && t[1]) sel.value = t[1];
    $('#f-msg').value = '[' + a.getAttribute('data-doc') + '] 자료를 받고 싶습니다.\n';
    document.getElementById('inquiry').scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () { $('#f-name').focus({ preventScroll: true }); }, 500);
  });
}
