/* 언어: 한국어(기본) / 영어. 고른 언어는 이 브라우저에 기억한다. 영어로 바꾸는 일은 i18n.js가 맡는다 */
var LANG = (function () {
  try {
    var m = /[?&]lang=(en|ko)/.exec(location.search);
    if (m) { localStorage.setItem('pentech-lang', m[1]); return m[1]; }
    return localStorage.getItem('pentech-lang') === 'en' ? 'en' : 'ko';
  } catch (e) { return 'ko'; }
})();
document.documentElement.lang = LANG;
function T(s) { return window.__tr ? window.__tr(s) : s; }
function setLang(l) {
  try { localStorage.setItem('pentech-lang', l); } catch (e) {}
  var u = new URL(location.href); u.searchParams.delete('lang');
  if (u.href === location.href) location.reload(); else location.href = u.href;
}

/* 모든 페이지 공통: 머리 · 푸터 · ☰ · 맨 위로 · 사진 크게 보기 · 영상 창 · 나타나기 효과 */
document.documentElement.classList.add('js');

function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function $(s, el) { return (el || document).querySelector(s); }
function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
function techById(id) { for (var i = 0; i < TECH.length; i++) if (TECH[i].id === id) return TECH[i]; return null; }
function ytThumb(id) { return 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg'; }
function videoById(id) { for (var i = 0; i < VIDEOS.length; i++) if (VIDEOS[i][2] === id) return VIDEOS[i]; return null; }

var ICON = {
  caret: '<svg class="caret" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  arr: '<span class="arr" aria-hidden="true">→</span>',
  phone: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>',
  up: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  x: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  zoom: '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M16 16l4.5 4.5M11 8v6M8 11h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  prev: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  next: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>'
};

var NAV = [
  { key: 'tech', label: '기술공법', href: 'tech.html?id=roof', sub: TECH.map(function (t) { return [t.name, 'tech.html?id=' + t.id, t.area]; }) },
  { key: 'cases', label: '시공사례', href: 'cases.html', sub: [['지붕방수', 'cases.html#roof', '루프가드'], ['외벽보수 · 방수', 'cases.html#wall', '월터가드'], ['바닥재', 'cases.html#floor', '펜터가드 외']] },
  { key: 'about', label: '회사소개', href: 'ceo.html', sub: [['CEO 인사말', 'ceo.html'], ['회사소개', 'company.html'], ['연혁', 'history.html'], ['비전 · ESG', 'vision.html'], ['특허 · 인증', 'cert.html'], ['회사 위치', 'location.html']] },
  { key: 'partner', label: '협력기업', href: 'partners.html', sub: [['협약사 리스트', 'partners.html#list'], ['협약 문의', 'contact.html?kind=협약#inquiry']] },
  { key: 'news', label: '소식', href: 'news.html', sub: [['언론보도', 'news.html#press'], ['블로그 · 유튜브', 'news.html#channels']] },
  { key: 'contact', label: '고객지원', href: 'contact.html', sub: [['견적/협약 문의', 'contact.html#inquiry'], ['시방서', 'contact.html#docs'], ['자주 묻는 질문', 'faq.html']] }
];

function logoHTML() {
  // 회사 원래 로고 (pentech.kr)
  // 영어 화면에서는 영문 로고(PENTECH PAINT TECHNOLOGY)
  if (LANG === 'en') return '<a class="logo logo-en" href="index.html" aria-label="Pentech home"><img src="images/logo-en.png" alt="Pentech Paint Technology" width="950" height="226"></a>';
  return '<a class="logo" href="index.html" aria-label="(주)펜테크 홈"><img src="images/logo.png" alt="(주)펜테크 Paint Technology" width="632" height="172"></a>';
}

function buildChrome() {
  var page = document.body.getAttribute('data-page');

  var gnb = NAV.map(function (n) {
    var cur = n.key === page ? ' aria-current="page"' : '';
    var sub = '<div class="sub">' + n.sub.map(function (s) { return '<a href="' + s[1] + '">' + esc(s[0]) + (s[2] ? '<small>' + esc(s[2]) + '</small>' : '') + '</a>'; }).join('') + '</div>';
    return '<li><a href="' + n.href + '"' + cur + '>' + n.label + ICON.caret + '</a>' + sub + '</li>';
  }).join('');
  var head = document.createElement('header');
  head.className = 'head';
  head.innerHTML = '<div class="wrap">' + logoHTML() +
    '<nav aria-label="주 메뉴" style="height:100%"><ul class="gnb">' + gnb + '</ul></nav>' +
    '<div class="head-cta"><a class="tel-pill" href="tel:' + PHONE + '" aria-label="상담 전화 ' + PHONE + '">' + ICON.phone + PHONE + '</a>' +
    '<div class="lang" role="group" aria-label="언어 선택"><button type="button" data-l="ko" aria-pressed="' + (LANG === 'ko') + '" lang="ko">KR</button><span aria-hidden="true"></span><button type="button" data-l="en" aria-pressed="' + (LANG === 'en') + '" lang="en">EN</button></div></div>' +
    '<button class="burger" aria-label="메뉴 열기" aria-expanded="false" aria-controls="mnav"><span></span><span></span><span></span></button></div>';

  var mnav = document.createElement('nav');
  mnav.className = 'mnav'; mnav.id = 'mnav'; mnav.setAttribute('aria-label', '휴대폰 메뉴');
  mnav.innerHTML = '<ul>' + NAV.map(function (n) {
    return '<li><a href="' + n.href + '">' + n.label + '</a><div class="msub">' + n.sub.map(function (s) { return '<a href="' + s[1] + '">' + esc(s[0]) + '</a>'; }).join('') + '</div></li>';
  }).join('') + '</ul><a class="btn btn-blue" href="contact.html#inquiry">견적 문의하기</a><a class="btn btn-line" href="tel:' + PHONE + '">' + ICON.phone + ' ' + PHONE + '</a>';

  document.body.insertBefore(mnav, document.body.firstChild);
  document.body.insertBefore(head, document.body.firstChild);

  var foot = document.createElement('footer');
  foot.className = 'foot';
  foot.innerHTML = '<div class="wrap">' +
    '<div>' + logoHTML() + '<p style="margin-top:16px;max-width:360px">건물의 상처를 발견하고, 치유하며, 오래도록 지켜냅니다. 지붕부터 외벽, 바닥, 지하주차장까지 — 건설보수 전문 기업 (주)펜테크.</p></div>' +
    '<div><h4>찾아오시는 곳</h4><ul>' + OFFICES.map(function (o) { return '<li><b style="color:#fff">' + o.name + '</b><br>' + o.addr + '</li>'; }).join('') + '</ul></div>' +
    '<div><h4>고객 문의</h4><a class="big-tel" href="tel:' + PHONE + '">' + PHONE + '</a><ul><li><a href="contact.html#inquiry">견적 문의</a> · <a href="faq.html">자주 묻는 질문</a></li>' +
    '<li><a href="' + BLOG + '" target="_blank" rel="noopener">네이버 블로그</a> · <a href="' + YOUTUBE + '" target="_blank" rel="noopener">유튜브 옥상남TV</a></li></ul></div>' +
    '<p class="disc"><b>비공식 리디자인 시안</b> — 웹 수업 과제로 (주)펜테크 사이트의 내용을 그대로 두고 구성과 디자인만 새로 짠 화면입니다. 글과 사진의 저작권은 (주)펜테크에 있으며, 이 페이지의 문의 폼은 실제로 아무것도 보내지 않습니다. 원본: <a href="https://www.pentech.kr/kor/main/" target="_blank" rel="noopener">pentech.kr</a></p>' +
    '</div>';
  document.body.appendChild(foot);

  var top = document.createElement('button');
  top.className = 'to-top'; top.setAttribute('aria-label', '맨 위로'); top.innerHTML = ICON.up;
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(top);

  var bar = document.createElement('div');
  bar.className = 'mbar';
  bar.innerHTML = '<a class="btn btn-line" href="tel:' + PHONE + '">' + ICON.phone + ' 전화</a><a class="btn btn-blue" href="contact.html#inquiry">견적 문의</a>';
  document.body.appendChild(bar);

  // ☰
  var burger = $('.burger', head);
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', T(open ? '메뉴 닫기' : '메뉴 열기'));
    mnav.classList.toggle('open', open); document.body.style.overflow = open ? 'hidden' : '';
    document.body.classList.toggle('menu-open', open); topState();
    document.documentElement.style.setProperty('--note-h', '0px');   // 맨 위 안내 띠를 뺐으므로 0
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  window.addEventListener('scroll', function () { top.classList.toggle('show', window.scrollY > 500); }, { passive: true });

  // 페이지 맨 위에서는 헤더를 투명하게 해서 배너 사진과 이어 보이게, 조금만 내려도 흰 헤더로
  function topState() {
    var home = document.body.getAttribute('data-page') === 'home';     // 홈은 흰 헤더 아래에 둥근 사진이 놓이는 구성이라 항상 흰색
    head.classList.toggle('is-top', window.scrollY < 10 && !document.body.classList.contains('menu-open'));
    head.classList.toggle('scrolled', window.scrollY > 6);
  }
  window.addEventListener('scroll', topState, { passive: true });
  topState();
}

/* ── 사진 칸: 누르면 크게 보기. group이 같은 사진끼리 넘겨 본다 ── */
/* 보정본(2배 확대 + 선명도 보정)이 있는 원래 사이트 사진은 images/hd/ 아래 같은 경로로 바꿔 준다 (목록: js/hd-images.js) */
function hd(u) {
  if (typeof IMG === 'undefined' || typeof HD_IMG === 'undefined' || !u || u.indexOf(IMG) !== 0) return u;
  var r = u.slice(IMG.length);
  return HD_IMG[r] ? 'images/hd/' + r + '?v=3' : u;                  // ?v=2: 사진을 새로 만들었을 때 브라우저가 옛 사진을 쓰지 않게
}

function ph(src, cap, group, extraClass, badge) {
  src = hd(src);
  return '<button type="button" class="ph ' + (extraClass || '') + '" data-src="' + esc(src) + '" data-cap="' + esc(cap || '') + '" data-group="' + esc(group || '') + '">' +
    '<span class="im"><img src="' + esc(src) + '" alt="' + esc(cap || '') + '" loading="lazy"></span>' +
    (badge ? '<span class="badge">' + esc(badge) + '</span>' : '') +
    '<span class="zoom" aria-hidden="true">' + ICON.zoom + '</span>' +
    (cap ? '<span class="cap">' + esc(cap) + '</span>' : '') + '</button>';
}

var modal, modalBox, lastFocus, gallery = [], gIndex = 0;
function buildModal() {
  modal = document.createElement('div');
  modal.className = 'modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', '크게 보기');
  modal.innerHTML = '<div class="modal-box"><button class="modal-x" aria-label="닫기">' + ICON.x + '</button><div class="modal-in"></div></div>';
  document.body.appendChild(modal);
  modalBox = $('.modal-in', modal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.closest('.modal-x')) closeModal();
    if (e.target.closest('.modal-nav.prev')) showImg(gIndex - 1);
    if (e.target.closest('.modal-nav.next')) showImg(gIndex + 1);
  });
  document.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft' && gallery.length > 1) showImg(gIndex - 1);
    if (e.key === 'ArrowRight' && gallery.length > 1) showImg(gIndex + 1);
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.ph, [data-lightbox], [data-zoom]');
    if (b) {
      var g = b.getAttribute('data-group');
      gallery = g ? $$('[data-group="' + g + '"]') : [b];
      openModal(); showImg(gallery.indexOf(b)); return;
    }
    var v = e.target.closest('[data-video]');
    if (v) { e.preventDefault(); openVideo(v.getAttribute('data-video')); }
  });
}
function openModal() { lastFocus = document.activeElement; modal.classList.add('open'); document.body.style.overflow = 'hidden'; setTimeout(function () { $('.modal-x', modal).focus(); }, 10); }
function closeModal() { modal.classList.remove('open', 'photo'); placeX(); modalBox.innerHTML = ''; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
function showImg(i) {
  gIndex = (i + gallery.length) % gallery.length;
  var b = gallery[gIndex];
  var nav = gallery.length > 1 ? '<button class="modal-nav prev" aria-label="이전 사진">' + ICON.prev + '</button><button class="modal-nav next" aria-label="다음 사진">' + ICON.next + '</button>' : '';
  modalBox.innerHTML = '<img' + (b.hasAttribute('data-lightbox') ? ' class="cert"' : '') + ' src="' + esc(b.getAttribute('data-src')) + '" alt="' + esc(b.getAttribute('data-cap')) + '">' + nav +
    '<p class="modal-cap">' + esc(b.getAttribute('data-cap')) + (gallery.length > 1 ? '<small>' + (gIndex + 1) + ' / ' + gallery.length + '</small>' : '') + '</p>';
  modal.classList.add('photo'); placeX();
}
/* 닫기(X)는 사진의 오른쪽 위 모서리 안쪽에 얹는다 (영상일 때는 위쪽 바깥) */
function placeX() {
  var x = $('.modal-x', modal), im = $('img', modalBox);
  if (!x) return;
  if (!im || !modal.classList.contains('photo')) { x.style.top = ''; x.style.right = ''; return; }
  function set() {
    var box = x.parentNode, w = im.offsetWidth, h = im.offsetHeight, r = im.naturalWidth && im.naturalHeight ? im.naturalWidth / im.naturalHeight : w / h;
    var vw = w / h > r ? h * r : w, vh = w / h > r ? h : w / r;
    var left = im.offsetLeft + (w - vw) / 2, top = im.offsetTop + (h - vh) / 2;
    x.style.top = (top + 12) + 'px'; x.style.right = (box.clientWidth - left - vw + 12) + 'px';
  }
  if (im.complete && im.naturalWidth) set(); else im.addEventListener('load', set);
}
window.addEventListener('resize', function () { if (modal && modal.classList.contains('open')) placeX(); });
function openVideo(id) {
  var v = videoById(id);
  gallery = [];
  modal.classList.remove('photo'); placeX();
  openModal();
  modalBox.innerHTML = '<div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(id) + '?autoplay=1&rel=0" title="' + esc(v ? v[3] : '시공 영상') + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>' +
    '<p class="modal-cap">' + esc(v ? v[3] : '') + '<small>재생이 안 되면 <a href="https://www.youtube.com/watch?v=' + esc(id) + '" target="_blank" rel="noopener">유튜브에서 보기</a></small></p>';
}

/* 특허 카드: 누르면 기존 사이트의 특허증 사진이 크게 열린다 */
function patentBtn(x, group, techName) {
  var cap = '제 ' + x[0] + ' 호 · ' + x[1];
  return '<button type="button" class="patent" data-lightbox data-src="' + esc(x[2]) + '" data-cap="' + esc(cap) + '" data-group="' + esc(group) + '">' +
    '<span class="seal">특허</span><span class="pt"><small>제 ' + x[0] + ' 호' + (techName ? ' · ' + esc(techName) : '') + '</small>' +
    '<b>' + esc(x[1]) + '</b><em>특허증 보기 →</em></span></button>';
}

/* 영상 카드 */
function vcard(id, showCat) {
  var v = videoById(id);
  if (!v) return '';
  return '<a class="vcard" href="https://www.youtube.com/watch?v=' + id + '" data-video="' + id + '">' +
    '<span class="vthumb"><img src="' + ytThumb(id) + '" alt="" loading="lazy"></span>' +
    '<span><p>' + esc(v[3]) + '</p>' + (showCat ? '<small>' + esc(v[1]) + '</small>' : '') + '</span></a>';
}

/* 언론보도 카드: 누르면 우리 사이트의 기사 페이지(news-article.html)로 간다. 원문은 기사 페이지 아래 '원문 기사 보기'에서 */
function newsCard(n) {
  var m = /id=(\d+)/.exec(n[4]);
  var href = m ? 'news-article.html?id=' + m[1] : n[4];
  return '<a class="ncard" href="' + href + '"' + (m ? '' : ' target="_blank" rel="noopener"') + '><span class="im"><img src="' + n[3] + '" alt="" loading="lazy"></span>' +
    '<span class="meta"><b>' + esc(n[1] || '보도') + '</b><span>' + n[0] + '</span></span><h3>' + esc(n[2]) + '</h3></a>';
}

/* 층 단면: 위(마감)부터 아래(바탕) 순서로 그린다 */
function strataHTML(t, compact) {
  var n = t.layers.length;
  var items = t.layers.map(function (name, i) {
    var depth = i === 0 ? 0 : i / (n - 1);          // 0 = 바탕, 1 = 마감
    var mix = Math.round(14 + depth * 74);
    var cls = i === 0 ? 'base' : (mix > 58 ? 'dark' : '');
    return '<li class="' + cls + '" style="--m:' + mix + '%"><em>' + (i === 0 ? '—' : i) + '</em>' + esc(name) + '</li>';
  }).reverse().join('');
  return '<div class="strata-cap"><span>' + (compact ? esc(t.name) + ' 단면' : '마감 ↑') + '</span><span>' + (compact ? '마감 ↑ 바탕 ↓' : '') + '</span></div>' +
    '<ol class="strata" style="--c:' + t.color + '" aria-label="' + esc(t.name) + ' 층 구성, 위가 마감">' + items + '</ol>';
}

/* 나타나기 */
function reveal() {
  var els = $$('.rv:not(.in)');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (e) { io.observe(e); });
}

/* 페이지 안 목차: 지금 보는 구역 표시 */
function tocSpy() {
  var links = $$('.toc a');
  if (!links.length) return;
  var secs = links.map(function (a) { var h = a.getAttribute('href'); return h.charAt(0) === '#' ? document.getElementById(h.slice(1)) : null; });   // 다른 페이지로 가는 링크는 건너뜀
  var first = 0; for (var k = 0; k < secs.length; k++) { if (secs[k]) { first = k; break; } }
  function on() {
    var y = window.scrollY + window.innerHeight * 0.3, cur = first;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
    var act = links[cur]; if (act && act.parentNode.parentNode.scrollWidth > act.parentNode.parentNode.clientWidth) {
      var ul = act.parentNode.parentNode; ul.scrollLeft = act.offsetLeft - 40;
    }
  }
  window.addEventListener('scroll', on, { passive: true }); on();
}

document.addEventListener('DOMContentLoaded', function () {
  buildChrome();
  buildModal();
  if (window.initPage) window.initPage();
  reveal();
  tocSpy();
  // 다른 페이지에서 #구역 으로 들어왔을 때, 내용이 그려진 뒤 다시 맞춰 이동
  if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(function () { t.scrollIntoView(); }, 60); }
});


document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('.lang button');
  if (b && b.getAttribute('aria-pressed') !== 'true') setLang(b.getAttribute('data-l'));
});
