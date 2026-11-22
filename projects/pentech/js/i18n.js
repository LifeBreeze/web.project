/* 한 / 영 전환 — 영어를 고르면 화면에 나온 한국어 문장을 영어 문구(i18n-dict.js)로 바꿔 보여 준다.
   · 이미 그려진 글자와, 나중에 자바스크립트가 그리는 글자(탭 · 목록 · 팝업)를 모두 바꾼다
   · 사전에 없는 글(협약사 이름 · 주소 같은 고유 이름)은 한국어 그대로 둔다 */
(function () {
  if (window.LANG !== 'en' || !window.EN_DICT) { window.__tr = null; return; }
  var EN = window.EN_DICT;
  var HANGUL = /[가-힣]/;
  var MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // 숫자가 붙은 문구는 사전 대신 규칙으로
  var RULES = [
    [/^상담 전화 (.+)$/, function (m) { return 'Call us ' + m[1]; }],
    [/^(\d+)월$/, function (m) { return MONTHS[+m[1]] || m[0]; }],
    [/^(\d+)편$/, function (m) { return m[1] + ' videos'; }],
    [/^(\d+)건$/, function (m) { return m[1]; }],
    [/^(\d+)차$/, function (m) { return 'Step ' + m[1]; }],
    [/^(\d+)개 협약사$/, function (m) { return m[1] + ' partner companies'; }],
    [/^(\d+)공정$/, function (m) { return m[1] + ' steps'; }],
    [/^제 ?([\d-]+) ?호$/, function (m) { return 'No. ' + m[1]; }],
    [/^(\d+)단계$/, function (m) { return 'Step ' + m[1]; }],
    [/^(\d+)단계 (.+)$/, function (m) { var v = tr(m[2]); return v == null ? null : 'Step ' + m[1] + ': ' + v; }],
    [/^(\d+)차 (.+)$/, function (m) { var v = tr(m[2]); return v == null ? null : 'Step ' + m[1] + ': ' + v; }],
    [/^(.+) 관련 특허 (\d+)건$/, function (m) { var v = tr(m[1]); return v == null ? null : m[2] + ' ' + v + ' patents'; }],
    [/^적용 분야: (.+)$/, function (m) { var v = tr(m[1]); return v == null ? null : 'Applications: ' + v; }],
    [/^현장 상태를 보고 (.+)가 맞는지부터 정직하게 말씀드립니다\.$/, function (m) { var v = tr(m[1]); return v == null ? null : "We look at the site's condition and honestly tell you first whether " + v + ' is the right fit.'; }]
  ];

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

  // 이름 + 말머리/말꼬리로 만든 문구 ("루프가드 자세히", "옥상 · 지붕 문제라면" ...)
  var AFFIX = [
    [/^(.+) 자세히$/, function (a) { return a + ' details'; }],
    [/^(.+) 시공 사례 영상$/, function (a) { return a + ' case videos'; }],
    [/^(.+) 시공 모습$/, function (a) { return a + ' in use'; }],
    [/^(.+) 문제라면$/, function (a) { return 'For ' + a + ' problems'; }],
    [/^(.+) 시험성적서$/, function (a) { return a + ' test report'; }],
    [/^(.+) 도포$/, function (a) { return a + ' application'; }],
    [/^(.+) 위치 지도$/, function (a) { return a + ' location map'; }],
    [/^(.+) 핵심 기술 요소$/, function (a) { return 'Core technology elements of ' + a; }],
    [/^(.+) 블로그 바로가기$/, function (a) { return a + ' blog'; }],
    [/^(.+)로 다시 태어난 현장$/, function (a) { return 'Sites reborn with ' + a; }],
    [/^(.+) 견적 문의$/, function (a) { return a + ' quote inquiry'; }],
    [/^(.+) 층 구성, 위가 마감$/, function (a) { return a + ' layers, finish on top'; }],
    [/^— (.+)$/, function (a) { return '— ' + a; }]
  ];

  function tr(s) {
    var k = norm(s);
    if (!k || !HANGUL.test(k)) return null;
    var v = EN[k];
    if (v != null) return v;
    for (var i = 0; i < RULES.length; i++) { var m = RULES[i][0].exec(k); if (m) { var rv = RULES[i][1](m); if (rv != null) return rv; } }
    for (var j = 0; j < AFFIX.length; j++) {
      var am = AFFIX[j][0].exec(k);
      if (am) { var inner = tr(am[1]); if (inner != null) return AFFIX[j][1](inner); }
    }
    // "A · B · C" 처럼 가운뎃점으로 이은 문구는 가장 긴 덩어리부터 맞춰 보며 조각마다 번역 (한글 없는 조각은 그대로)
    if (k.indexOf(' · ') > 0) {
      var parts = k.split(' · '), n = parts.length, outp = [], i = 0;
      while (i < n) {
        var got = null, used = 0;
        for (var e = n; e > i; e--) {
          if (i === 0 && e === n) continue;                       // 문장 전체는 이미 찾아 봤음
          var chunk = parts.slice(i, e).join(' · ');
          got = HANGUL.test(chunk) ? tr(chunk) : chunk;
          if (got != null) { used = e - i; break; }
        }
        if (got == null) return null;
        outp.push(got); i += used;
      }
      return outp.join(' · ');
    }
    if (k.indexOf(' — ') > 0) {
      var dp = k.split(' — '), dt = dp.map(function (x) { return HANGUL.test(x) ? tr(x) : x; });
      if (dt.every(function (x) { return x != null; })) return dt.join(' — ');
    }
    var dm = /^· (.+)$/.exec(k);
    if (dm) { var dv = tr(dm[1]); if (dv != null) return '· ' + dv; }
    return null;
  }
  window.__tr = function (s) { var v = tr(s); return v == null ? s : v; };

  function applyText(node) {
    var orig = node.nodeValue;
    if (!HANGUL.test(orig)) return;
    var v = tr(orig);
    if (v == null) return;
    var lead = /^\s*/.exec(orig)[0], trail = /\s*$/.exec(orig)[0];
    if (/^\s/.test(v)) lead = ''; if (/\s$/.test(v)) trail = '';
    node.nodeValue = lead + v + trail;
  }

  var ATTRS = ['alt', 'aria-label', 'placeholder', 'title'];
  function applyAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], val = el.getAttribute && el.getAttribute(a);
      if (val && HANGUL.test(val)) {
        var v = tr(val);
        if (v != null) el.setAttribute(a, v);
      }
    }
  }

  function apply(root) {
    if (!root) return;
    if (root.nodeType === 3) { if (root.parentNode && !/^(SCRIPT|STYLE)$/.test(root.parentNode.nodeName)) applyText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    if (root.nodeType === 1) applyAttrs(root);
    // 줄 조각(span.ln)으로만 나눈 문단: 조각을 이어 붙인 문장 전체로 사전을 찾음
    var ps = root.querySelectorAll ? root.querySelectorAll('p') : [];
    for (var pi = 0; pi < ps.length; pi++) {
      var pe = ps[pi], kids = pe.children;
      if (!kids.length) continue;
      var allLn = true;
      for (var ki = 0; ki < kids.length; ki++) if (!kids[ki].classList.contains('ln')) { allLn = false; break; }
      if (!allLn) continue;
      var whole = EN[norm(pe.textContent)];
      if (whole != null) pe.textContent = whole;
    }
    var w = document.createTreeWalker(root, 1 | 4, {
      acceptNode: function (n) {
        if (n.nodeType === 1) return /^(SCRIPT|STYLE|NOSCRIPT)$/.test(n.nodeName) ? 2 : 1;
        return 1;
      }
    });
    var n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) applyText(n); else applyAttrs(n); }
  }

  // 탭 제목: "루프가드 (지붕방수) — (주)펜테크 | 리디자인 시안"
  function trTitle(t) {
    var whole = tr(t); if (whole != null) return whole;
    return t.split(/( — | \| )/).map(function (seg) {
      if (seg === ' — ' || seg === ' | ') return seg;
      var m = /^(.*?) \((.*)\)$/.exec(seg);
      if (m && !EN[seg]) { var a = tr(m[1]), b = tr(m[2]); return (a == null ? m[1] : a) + (b == null ? '' : ' (' + b + ')'); }
      var v = tr(seg); return v == null ? seg : v;
    }).join('');
  }
  function doTitle() {
    var t = document.title;
    if (HANGUL.test(t)) document.title = trTitle(t);
    var md = document.querySelector('meta[name="description"]');
    if (md && HANGUL.test(md.content)) { var v = tr(md.content); if (v != null) md.content = v; }
  }

  var queued = [], raf = 0;
  function flush() {
    raf = 0;
    var list = queued; queued = [];
    for (var i = 0; i < list.length; i++) if (list[i].isConnected !== false) apply(list[i]);
  }
  var mo = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var added = muts[i].addedNodes;
      for (var j = 0; j < added.length; j++) queued.push(added[j]);
    }
    if (queued.length && !raf) raf = setTimeout(flush, 0);
  });

  function start() {
    apply(document.body);
    doTitle();
    mo.observe(document.body, { childList: true, subtree: true });
    var t = document.querySelector('title');
    if (t) new MutationObserver(doTitle).observe(t, { childList: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
