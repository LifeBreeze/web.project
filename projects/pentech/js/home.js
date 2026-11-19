/* 홈: 첫 화면 단면 · 공법 찾기 탭 · 최신 언론보도 */
window.initPage = function () {
  initHero();

  var tabs = $('#finderTabs'), panel = $('#finderPanel');
  tabs.innerHTML = TECH.map(function (t, i) {
    return '<button role="tab" id="ft-' + t.id + '" aria-controls="finderPanel" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-id="' + t.id + '" style="--c:' + t.color + '">' +
      '<span class="no">0' + (i + 1) + '</span><span><b>' + t.where + '</b><span>' + t.name + ' · ' + t.area + '</span></span><i class="sw" aria-hidden="true"></i></button>';
  }).join('');

  function show(id, focus) {
    var t = techById(id);
    $$('[role=tab]', tabs).forEach(function (b) {
      var on = b.getAttribute('data-id') === id;
      b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    panel.setAttribute('aria-labelledby', 'ft-' + id);
    panel.innerHTML =
      '<div class="fp-top"><img src="' + t.card + '" alt="' + t.name + ' 시공 모습">' +
      '<div class="fp-body"><span class="tag">' + t.where + ' 문제라면</span>' +
      '<h3>' + t.name + '<small>' + t.en + ' · ' + t.area + '</small></h3>' +
      '<p>' + esc(t.lead) + '</p>' +
      '<ul class="checks">' + t.keys.slice(0, 3).map(function (k) { return '<li><b>' + esc(k[0]) + '</b> — ' + esc(k[2][0]) + '</li>'; }).join('') + '</ul>' +
      '<div class="btns"><a class="btn btn-ink btn-sm" href="tech.html?id=' + t.id + '">' + t.name + ' 자세히 <span class="arr">→</span></a>' +
      '<a class="btn btn-line btn-sm" href="tech.html?id=' + t.id + '#process">시공 과정 사진</a></div></div></div>' +
      '<div class="fp-cases"><div class="fp-cases-head"><b>' + t.name + ' 시공 사례 영상</b><a class="link-arrow" href="cases.html#' + t.videoCat + '">더 보기 →</a></div>' +
      '<div class="vgrid">' + TECH_VIDEOS[t.id].map(function (v) { return vcard(v); }).join('') + '</div></div>';
  }
  tabs.addEventListener('click', function (e) { var b = e.target.closest('[role=tab]'); if (b) show(b.getAttribute('data-id')); });
  tabs.addEventListener('keydown', function (e) {
    var list = $$('[role=tab]', tabs), i = list.indexOf(document.activeElement);
    if (i < 0) return;
    var n = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (n) { e.preventDefault(); show(list[(i + n + list.length) % list.length].getAttribute('data-id'), true); }
  });
  show('roof');

  $('#homeNews').innerHTML = NEWS.slice(0, 3).map(newsCard).join('');
};


/* 첫 화면 슬라이드: 옆으로 넘기기(화살표 · 눈금 · 마우스 끌기 · 휴대폰 스와이프 · 좌우 키), 천천히 자동으로 넘어감 */
function initHero() {
  var vp = $('.hero-viewport'), track = $('.hero-track'), slides = $$('.hero-card', track), ticks = $$('.hero-ticks button');
  if (!vp || !slides.length) return;
  var n = slides.length, i = 0, timer = null, startX = 0, startY = 0, dx = 0, drag = false, moved = false, hover = false;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function go(k) {
    i = (k + n) % n;
    track.style.transition = ''; track.style.transform = 'translateX(' + (-i * 100) + '%)';
    ticks.forEach(function (b, j) { b.classList.toggle('on', j === i); b.setAttribute('aria-selected', j === i); });
    slides.forEach(function (s, j) { s.classList.toggle('active', j === i); if ('inert' in s) s.inert = j !== i; });
  }
  function play() { stop(); if (!reduce) timer = setInterval(function () { if (!hover && !drag && !document.hidden) go(i + 1); }, 7000); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function user(k) { go(k); play(); }

  ticks.forEach(function (b, j) { b.addEventListener('click', function () { user(j); }); });
  $('.hero-arrow.prev', vp).addEventListener('click', function () { user(i - 1); });
  $('.hero-arrow.next', vp).addEventListener('click', function () { user(i + 1); });
  vp.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') { e.preventDefault(); user(i - 1); } if (e.key === 'ArrowRight') { e.preventDefault(); user(i + 1); } });
  vp.addEventListener('mouseenter', function () { hover = true; });
  vp.addEventListener('mouseleave', function () { hover = false; });

  // 끌어서 넘기기 (마우스 · 터치 · 펜). 세로 스크롤은 그대로 두고 가로로 끌 때만 반응
  vp.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button, a')) return;
    drag = true; moved = false; startX = e.clientX; startY = e.clientY; dx = 0;
  });
  vp.addEventListener('pointermove', function (e) {
    if (!drag) return;
    dx = e.clientX - startX;
    if (!moved) { if (Math.abs(dx) < 8) return; if (Math.abs(e.clientY - startY) > Math.abs(dx)) { drag = false; return; } moved = true; try { vp.setPointerCapture(e.pointerId); } catch (x) {} }
    track.style.transition = 'none';
    var edge = (i === 0 && dx > 0) || (i === n - 1 && dx < 0) ? 0.35 : 1;      // 끝에서는 덜 끌리게
    track.style.transform = 'translateX(calc(' + (-i * 100) + '% + ' + (dx * edge) + 'px))';
  });
  function end() {
    if (!drag) return; drag = false;
    if (moved && Math.abs(dx) > Math.min(90, vp.clientWidth * 0.12)) user(dx < 0 ? i + 1 : i - 1); else go(i);
    moved = false;
  }
  vp.addEventListener('pointerup', end); vp.addEventListener('pointercancel', end);
  vp.addEventListener('dragstart', function (e) { e.preventDefault(); });

  go(0); play();
}
