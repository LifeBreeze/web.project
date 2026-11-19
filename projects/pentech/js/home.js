/* 홈: 첫 화면 단면 · 공법 찾기 탭 · 최신 언론보도 */
window.initPage = function () {

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
