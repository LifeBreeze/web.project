/*
 * 달빛 소개 · 찾아오시는 길 · 소식 페이지 — about.html · visit.html · news.html에서 쓴다.
 * 각 기능은 해당 요소가 있는 페이지에서만 동작한다.
 *
 * 1. 소개: 원두 3종을 BEANS에서, 원두를 고를 수 있는 메뉴 이름을 MENU에서 가져온다.
 * 2. 찾아오시는 길: 영업시간 표에서 오늘(영업일 기준) 줄을 표시하고,
 *    만월창 그림 속 하늘에 오늘 날짜의 달 모양을 그린다.
 * 3. 소식: NEWS 전체를 목록으로 그리고, 주소에 #소식id가 있으면 그 글로 옮긴다.
 */
(function () {
  "use strict";

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  const formatPrice = window.Dalbit ? window.Dalbit.formatPrice : function (n) {
    return n.toLocaleString("ko-KR") + "원";
  };

  /* ---------- 1. 소개: 원두 ---------- */
  function initBeans() {
    const list = document.querySelector("[data-bean-list]");
    if (!list || typeof BEANS === "undefined") return;

    list.innerHTML = BEANS.map(function (bean, index) {
      return (
        '<li class="bean-card">' +
          '<h3 class="title-md">' + escapeHtml(bean.name) + "</h3>" +
          '<p class="bean-card-en">' + escapeHtml(bean.nameEn) + "</p>" +
          '<p class="bean-card-taste">' + escapeHtml(bean.taste) + "</p>" +
          '<p class="bean-card-note">' + escapeHtml(bean.note) + "</p>" +
          '<p class="bean-card-extra">' + (bean.extra ? "+" + formatPrice(bean.extra) : "추가 금액 없음") +
            (bean.isDefault ? " · 기본 원두" : "") + "</p>" +
        "</li>"
      );
    }).join("");

    const menus = document.querySelector("[data-bean-menus]");
    if (menus && typeof MENU !== "undefined") {
      const names = MENU.filter(function (item) { return item.beans; })
        .map(function (item) { return item.name; });
      menus.textContent = "원두를 고를 수 있는 메뉴: " + names.join(", ") + ".";
    }
  }

  /* ---------- 2. 찾아오시는 길: 오늘 줄 ---------- */
  // 00:00~02:00은 전날 밤 영업이므로 전날을 오늘로 본다.
  function serviceDay(now) {
    const date = now instanceof Date ? now : new Date();
    return date.getHours() < 2 ? (date.getDay() + 6) % 7 : date.getDay();
  }

  function markToday(now) {
    const rows = document.querySelectorAll(".hours-table [data-day]");
    if (!rows.length) return;
    const today = String(serviceDay(now));
    rows.forEach(function (row) {
      const isToday = row.dataset.day === today;
      row.classList.toggle("is-today", isToday);
      const old = row.querySelector(".today-tag");
      if (old) old.remove();
      if (isToday) {
        row.querySelector("th").insertAdjacentHTML("beforeend", ' <span class="today-tag">오늘</span>');
      }
    });
  }

  // 만월창 그림(1200×1440) 속 달의 자리. 그림을 그린 장면의 카메라로 계산한 값이다.
  const WINDOW_MOON = { cx: 725, cy: 447, r: 58 };

  function drawTonightMoon(now) {
    const figure = document.querySelector("[data-tonight]");
    if (!figure || !window.Dalbit || !window.Dalbit.moonPhase) return;
    const date = now instanceof Date ? now : new Date();
    const phase = window.Dalbit.moonPhase(date);
    const m = WINDOW_MOON;

    const shadow = figure.querySelector("[data-tonight-shadow]"); // taste-skill-ignore: 달 그림자 모양
    shadow.setAttribute("d", window.Dalbit.moonShadowPath(phase, m.cx, m.cy, m.r));
    shadow.setAttribute("transform", phase.waxing ? "" : "matrix(-1 0 0 1 " + m.cx * 2 + " 0)");
    figure.querySelector("[data-tonight-glow]").setAttribute("opacity", (0.12 + phase.lit * 0.88).toFixed(2));

    const percent = Math.round(phase.lit * 100);
    const days = Math.round(phase.daysToFull);
    const toFull = phase.name === "보름달" ? "오늘이 보름 무렵입니다" : "보름달까지 " + days + "일";
    const label = figure.querySelector("[data-tonight-label]");
    if (label) label.textContent = "만월창 너머 오늘 밤의 달, " + phase.name + ", " + percent + "퍼센트 밝음";
    const text = document.querySelector("[data-tonight-text]");
    if (text) {
      text.textContent = (date.getMonth() + 1) + "월 " + date.getDate() + "일 밤, " + phase.name +
        " · " + percent + "% 밝음 · " + toFull;
    }
  }

  /* ---------- 3. 소식 ---------- */
  function initNews() {
    const list = document.querySelector("[data-news-page]");
    if (!list || typeof NEWS === "undefined") return;

    list.innerHTML = NEWS.map(function (news) {
      return (
        '<li class="news-article" id="' + escapeHtml(news.id) + '" tabindex="-1">' +
          '<p class="news-meta">' +
            '<time datetime="' + news.date + '">' + news.date.replace(/-/g, ".") + "</time>" +
            '<span class="news-tag">' + escapeHtml(news.tag) + "</span>" +
          "</p>" +
          '<div class="news-article-body">' +
            '<h2 class="news-article-title">' + escapeHtml(news.title) + "</h2>" +
            '<p class="news-article-summary">' + escapeHtml(news.summary) + "</p>" +
          "</div>" +
        "</li>"
      );
    }).join("");

    if (window.Dalbit && window.Dalbit.reveal) window.Dalbit.reveal(list.children);

    // 글이 스크립트로 그려지므로, 홈에서 news.html#id로 왔을 때 직접 그 글로 옮긴다.
    function goToHash() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const target = document.getElementById(id);
      if (!target || !list.contains(target)) return;
      list.querySelectorAll(".is-target").forEach(function (el) { el.classList.remove("is-target"); });
      target.classList.add("is-target");
      target.scrollIntoView({ block: "start" });
      target.focus({ preventScroll: true });
    }

    goToHash();
    window.addEventListener("hashchange", goToHash);
  }

  initBeans();
  markToday();
  drawTonightMoon();
  if (document.querySelector("[data-tonight], .hours-table")) {
    window.setInterval(function () { markToday(); drawTonightMoon(); }, 10 * 60 * 1000);
  }
  initNews();

  if (window.Dalbit) {
    window.Dalbit.markToday = markToday;
    window.Dalbit.drawTonightMoon = drawTonightMoon; // 콘솔에서 시험: Dalbit.drawTonightMoon(new Date(2026, 10, 24))
  }
})();
