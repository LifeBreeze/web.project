/* 시공사례 · 회사소개 · 소식 · 고객지원 */
window.initPage = function () {
  var page = document.body.getAttribute('data-page');
  if (page === 'cases') initCases();
  if (page === 'about') initAbout();
  if (page === 'news' && $('#newsGrid')) initNews();
  if (page === 'news' && $('#artBox')) initArticle();
  if (page === 'contact') initContact();
  if (page === 'partner') initPartners();
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
    map.title = T(o.name + ' 위치 지도');
    $('#naverLink').href = 'https://map.naver.com/p/search/' + encodeURIComponent(o.addr);
    $('#kakaoLink').href = 'https://map.kakao.com/?q=' + encodeURIComponent(o.addr);
    $('#copyAddr').setAttribute('data-addr', o.addr);
  }
  offBox.addEventListener('click', function (e) { var b = e.target.closest('.office'); if (b) showOffice(+b.getAttribute('data-i')); });
  $('#copyAddr').addEventListener('click', function () {
    var btn = this, a = btn.getAttribute('data-addr');
    function done() { btn.textContent = '복사했어요'; setTimeout(function () { btn.textContent = '주소 복사'; }, 1600); }
    if (navigator.clipboard) navigator.clipboard.writeText(a).then(done, function () { prompt(T('주소를 복사하세요'), a); });
    else prompt(T('주소를 복사하세요'), a);
  });
  showOffice(0);
}

/* ── 소식: 언론보도 3열 × 2행 ── */
function initNews() {
  // 넓은 화면(1280px 이상)에서는 한 줄 4장 × 2줄 = 8개씩, 그보다 좁으면 3장 × 2줄 = 6개씩
  function perPage() { return window.innerWidth >= 1280 ? 8 : 6; }
  var per = perPage(), pages = Math.ceil(NEWS.length / per), grid = $('#newsGrid'), pager = $('#pager');
  function go(p, scroll) {
    grid.innerHTML = NEWS.slice((p - 1) * per, p * per).map(newsCard).join('');
    var h = '<button aria-label="이전 쪽" ' + (p === 1 ? 'disabled' : '') + ' data-p="' + (p - 1) + '">‹</button>';
    for (var i = 1; i <= pages; i++) h += '<button data-p="' + i + '"' + (i === p ? ' aria-current="page"' : '') + '>' + i + '</button>';
    h += '<button aria-label="다음 쪽" ' + (p === pages ? 'disabled' : '') + ' data-p="' + (p + 1) + '">›</button>';
    pager.innerHTML = h;
    if (scroll) document.getElementById('press').scrollIntoView({ behavior: 'smooth' });
  }
  pager.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && !b.disabled) go(+b.getAttribute('data-p'), true); });
  window.addEventListener('resize', function () {                 // 창 너비가 1280px 기준을 넘나들면 쪽 나누기를 다시 계산
    var np = perPage();
    if (np !== per) { per = np; pages = Math.ceil(NEWS.length / per); go(1); }
  });
  var q = parseInt((location.search.match(/[?&]n=(\d+)/) || [])[1], 10);
  if (q >= 0 && q < NEWS.length) {                       // 홈에서 누른 기사: 그 기사가 있는 쪽을 열고 카드를 잠깐 강조
    go(Math.floor(q / per) + 1);
    var card = grid.children[q % per];
    if (card) {
      card.classList.add('hl');
      setTimeout(function () { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 200);
      setTimeout(function () { card.classList.remove('hl'); }, 3200);
    }
  } else go(1);
}

/* ── 소식: 기사 보기 (원래 펜테크 사이트 언론보도에 올라온 글을 옮겨 온 것) ── */
function initArticle() {
  var id = (location.search.match(/[?&]id=(\d+)/) || [])[1], box = $('#artBox'), idx = -1;
  NEWS.forEach(function (n, i) { var m = /id=(\d+)/.exec(n[4]); if (m && m[1] === id) idx = i; });
  var a = window.NEWS_ARTICLES && NEWS_ARTICLES[id];
  if (!a || idx < 0) {
    $('#artTitle').innerHTML = T('언론보도');
    box.innerHTML = '<p>' + T('기사를 찾을 수 없습니다.') + '</p><div class="art-actions"><a class="btn btn-ink" href="news.html#press">' + T('언론보도 목록') + '</a></div>';
    return;
  }
  var n = NEWS[idx];
  document.title = a.t + ' — (주)펜테크 | 리디자인 시안';
  $('#artTitle').innerHTML = '<small>' + esc((a.s ? a.s + ' · ' : '') + a.d) + '</small>' + esc(a.t);
  var h = '';
  if (a.sub) h += '<p class="art-sub">' + esc(a.sub).replace(/\n/g, '<br>') + '</p>';
  a.b.forEach(function (b) {
    if (b[0] === 'i') h += '<figure class="art-fig"><img src="' + esc(b[1]) + '" alt="' + esc(b[2]) + '" loading="lazy" onerror="this.closest(\'figure\').style.display=\'none\'">' + (b[2] ? '<figcaption>' + esc(b[2]) + '</figcaption>' : '') + '</figure>';
    else if (b[0] === 'h') h += '<h3 class="art-h">' + esc(b[1]) + '</h3>';
    else b[1].split('\n').forEach(function (t) { if (t.trim()) h += '<p>' + esc(t) + '</p>'; });
  });
  if (a.note === 'stub') h += '<p class="art-note">' + T('원래 사이트에도 이 기사는 제목과 기자 이름만 올라와 있습니다. 기사 전문은 아래 원문 보기에서 확인하세요.') + '</p>';
  if (a.note === 'shared') h += '<p class="art-note">' + T('원래 사이트에는 이 기사의 본문이 따로 올라와 있지 않고 같은 안내 글이 공통으로 쓰입니다. 기사 전문은 아래 원문 보기에서 확인하세요.') + '</p>';
  h += '<div class="art-actions"><a class="btn btn-ink" href="' + esc(n[4]) + '" target="_blank" rel="noopener">' + T('원문 기사 보기') + ' <span class="arr">↗</span></a><a class="btn btn-line" href="news.html#press">' + T('언론보도 목록') + '</a></div>';
  var prev = NEWS[idx - 1], next = NEWS[idx + 1];
  function link(x, label) { var m = /id=(\d+)/.exec(x[4]); return '<a href="news-article.html?id=' + m[1] + '"><small>' + label + '</small><b>' + esc(x[2]) + '</b></a>'; }
  h += '<nav class="art-nav" aria-label="' + T('이전 · 다음 기사') + '">' + (prev ? link(prev, T('이전 기사')) : '<span></span>') + (next ? link(next, T('다음 기사')) : '<span></span>') + '</nav>';
  box.innerHTML = h;
}

/* ── 고객지원: 폼 · FAQ · 제안서 ── */
/* 견적 문의 (PC): 오른쪽 입력 칸 맨 위를 왼쪽 굵은 제목 바로 아래 글(안내 문장) 첫 줄에 맞춤 */
function fitInquiry() {
  var form = document.getElementById('inqForm'), aside = document.querySelector('.form-aside'), lead = aside && aside.querySelector('.lead');
  if (!form || !lead) return;
  form.style.marginTop = ''; aside.style.minHeight = '';
  if (window.innerWidth <= 980) return;
  /* 왼쪽 칸(.form-aside)과 폼은 같은 줄 맨 위에서 시작하므로 '칸 맨 위에서 안내 글까지의 거리'를 씀 */
  form.style.marginTop = Math.max(0, lead.offsetTop) + 'px';
  aside.style.minHeight = (Math.max(0, lead.offsetTop) + form.offsetHeight) + 'px';   // 왼쪽 칸 아래 끝도 폼 아래 끝에 맞춤(상담 순서 칸이 남는 높이를 채움)
}

function initContact() {
  fitInquiry();
  window.addEventListener('resize', fitInquiry);
  if (window.ResizeObserver) { var _ro = new ResizeObserver(fitInquiry); _ro.observe(document.querySelector('.form-aside')); _ro.observe(document.getElementById('inqForm')); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitInquiry);
  if (window.MutationObserver) { var _t = 0; new MutationObserver(function () { cancelAnimationFrame(_t); _t = requestAnimationFrame(fitInquiry); }).observe(document.querySelector('.form-aside'), { subtree: true, childList: true, characterData: true }); }
  // 견적 문의 폼 (시안: 아무것도 보내지 않음)
  var sel = $('#f-tech');
  sel.innerHTML = '<option value="">공법을 고르세요 (모르면 비워 두세요)</option>' + TECH.map(function (t) { return '<option value="' + t.id + '">' + t.name + ' — ' + t.area + '</option>'; }).join('') + '<option value="etc">잘 모르겠어요 · 진단 요청</option>';
  var m = /[?&]tech=(\w+)/.exec(location.search); if (m) sel.value = m[1];
  if (/[?&]kind=/.test(decodeURIComponent(location.search)) && /kind=협약/.test(decodeURIComponent(location.search))) { var kr = document.querySelector('input[name="kind"][value="협약"]'); if (kr) kr.checked = true; }
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
  var filt = $('#faqFilter'), list = $('#faqList'), q = $('#faqSearch'), cur = 'all', fper = 10, fpage = 1, fpager = $('#faqPager');
  var keys = ['all', 'roof', 'wall', 'penter', 'road', 'poly', ''];
  filt.innerHTML = keys.map(function (k) {
    var n = k === 'all' ? FAQ.length : FAQ.filter(function (f) { return f[0] === k; }).length;
    return '<button class="chip" aria-pressed="' + (k === 'all') + '" data-k="' + k + '">' + (k === 'all' ? '전체' : techName[k]) + '<span class="n">' + n + '</span></button>';
  }).join('');
  function renderFaq(scroll) {
    var s = q.value.trim().toLowerCase();
    var items = FAQ.filter(function (f) { return (cur === 'all' || f[0] === cur) && (!s || (f[2] + f[3] + f[1]).toLowerCase().indexOf(s) > -1); });
    var fpages = Math.max(1, Math.ceil(items.length / fper));
    if (fpage > fpages) fpage = fpages;
    items = items.slice((fpage - 1) * fper, fpage * fper);          // 10개씩 끊어서 보여 줌
    list.innerHTML = items.length ? items.map(function (f) {
      return '<details><summary><span class="q">Q</span><b><small>' + techName[f[0]] + (f[1] ? ' · ' + esc(f[1]) : '') + '</small>' + esc(f[2]) + '</b><span class="pm" aria-hidden="true"></span></summary><div class="a">' + esc(f[3]) + '</div></details>';
    }).join('') : '<p class="faq-empty">찾는 질문이 없나요? <a class="link-arrow" href="#inquiry">직접 문의하기 →</a></p>';
    var h = '';
    if (fpages > 1) {
      h = '<button aria-label="이전 쪽" ' + (fpage === 1 ? 'disabled' : '') + ' data-p="' + (fpage - 1) + '">‹</button>';
      for (var i = 1; i <= fpages; i++) h += '<button data-p="' + i + '"' + (i === fpage ? ' aria-current="page"' : '') + '>' + i + '</button>';
      h += '<button aria-label="다음 쪽" ' + (fpage === fpages ? 'disabled' : '') + ' data-p="' + (fpage + 1) + '">›</button>';
    }
    fpager.innerHTML = h;
    if (scroll === true) $('.faq-tools').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  fpager.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && !b.disabled) { fpage = +b.getAttribute('data-p'); renderFaq(true); } });
  filt.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    cur = b.getAttribute('data-k'); fpage = 1;
    $$('.chip', filt).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    renderFaq();
  });
  q.addEventListener('input', function () { fpage = 1; renderFaq(); });
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
    $('#f-msg').value = LANG === 'en' ? 'I would like to receive the [' + T(a.getAttribute('data-doc')) + '] material.\n' : '[' + a.getAttribute('data-doc') + '] 자료를 받고 싶습니다.\n';
    document.getElementById('inquiry').scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () { $('#f-name').focus({ preventScroll: true }); }, 500);
  });
}


/* ── 협력기업: 지역 · 검색으로 협약사 찾기 (89곳, 한 장에 모두) ── */
function initPartners() {
  var bar = $('#pRegion'), body = $('#pBody'), q = $('#pSearch'), cnt = $('#pCount'), empty = $('#pEmpty'), cur = '전체';
  // '서울 금천구'는 서울로 묶음
  var order = ['서울', '인천', '경기도', '대전', '대구', '울산', '부산', '충청북도', '충청남도', '경상북도', '경상남도', '전라북도'];
  function region(p) { return p[0].indexOf('서울') === 0 ? '서울' : p[0]; }
  var regs = order.filter(function (r) { return PARTNERS.some(function (p) { return region(p) === r; }); });
  bar.innerHTML = ['전체'].concat(regs).map(function (r) {
    var n = r === '전체' ? PARTNERS.length : PARTNERS.filter(function (p) { return region(p) === r; }).length;
    return '<button class="chip" aria-pressed="' + (r === '전체') + '" data-r="' + r + '">' + r + '<span class="n">' + n + '</span></button>';
  }).join('');
  /* PC: 검색 칸이 지역 칩 아래 줄에 따로 놓이면, 바로 위 줄 맨 끝 칩 두 개의 왼쪽 끝 ~ 오른쪽 끝과 같은 폭 · 같은 자리에 맞춤.
     칩과 같은 줄에 놓이면 기본 폭(260px) 그대로 */
  function fitPartnerSearch() {
    var box = document.querySelector('.partner-tools'), lab = box && box.querySelector('.search');
    if (!lab) return;
    lab.style.flex = ''; lab.style.width = ''; lab.style.marginLeft = '';
    if (window.innerWidth <= 760) return;
    var chips = [].slice.call(bar.children);
    if (chips.length < 2) return;
    var sr = lab.getBoundingClientRect(), last = chips[chips.length - 1], lr = last.getBoundingClientRect();
    if (sr.top < lr.bottom - 2) return;                                  // 칩과 같은 줄이면 그대로
    var row = chips.filter(function (c) { return Math.abs(c.getBoundingClientRect().top - lr.top) < 3; });
    if (row.length < 2) return;
    var a = row[row.length - 2].getBoundingClientRect(), b = lr, br = box.getBoundingClientRect();
    lab.style.flex = 'none'; lab.style.width = Math.round(b.right - a.left) + 'px'; lab.style.marginLeft = Math.round(a.left - br.left) + 'px';
  }
  fitPartnerSearch();
  window.addEventListener('resize', fitPartnerSearch);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPartnerSearch);
  if (window.MutationObserver) { var _pt = 0; new MutationObserver(function () { cancelAnimationFrame(_pt); _pt = requestAnimationFrame(fitPartnerSearch); }).observe(bar, { subtree: true, childList: true, characterData: true }); }
  var per = 20, page = 1, pager = $('#pPager');
  function render(scroll) {
    var s = q.value.trim().toLowerCase();
    var items = PARTNERS.filter(function (p) { return (cur === '전체' || region(p) === cur) && (!s || (p[1] + p[3] + p[0]).toLowerCase().indexOf(s) > -1); });
    var pages = Math.max(1, Math.ceil(items.length / per));
    if (page > pages) page = pages;
    var start = (page - 1) * per;
    body.innerHTML = items.slice(start, start + per).map(function (p, i) {
      var tel = p[2].replace(/~.*$/, '').replace(/[^\d]/g, '');
      return '<div class="prow" role="row"><span class="no">' + (start + i + 1) + '</span><span class="rg">' + esc(p[0]) + '</span><b class="nm">' + esc(p[1]) + '</b>' +
        '<a class="tl" href="tel:' + tel + '">' + esc(p[2]) + '</a><span class="ad">' + esc(p[3]) + '</span></div>';
    }).join('');
    cnt.textContent = items.length;
    empty.hidden = items.length > 0;
    // 쪽 번호: 20개씩 끊어서 다음 목록으로
    var h = '';
    if (pages > 1) {
      h = '<button aria-label="이전 쪽" ' + (page === 1 ? 'disabled' : '') + ' data-p="' + (page - 1) + '">‹</button>';
      for (var i = 1; i <= pages; i++) h += '<button data-p="' + i + '"' + (i === page ? ' aria-current="page"' : '') + '>' + i + '</button>';
      h += '<button aria-label="다음 쪽" ' + (page === pages ? 'disabled' : '') + ' data-p="' + (page + 1) + '">›</button>';
    }
    pager.innerHTML = h;
    if (scroll === true) $('#list .ptable').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  pager.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && !b.disabled) { page = +b.getAttribute('data-p'); render(true); } });
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    cur = b.getAttribute('data-r'); page = 1;
    $$('.chip', bar).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    render();
  });
  q.addEventListener('input', function () { page = 1; render(); });
  render();
}
