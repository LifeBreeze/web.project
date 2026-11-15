/*
 * 달빛 홈 — index.html에서만 쓴다.
 * data-menu.js · data-news.js · common.js 다음에 불러온다.
 *
 * 1. 오늘 밤의 달: 날짜로 달의 위상을 계산해 첫 화면의 달 사진에 그림자를 드리운다.
 *    영업 중이면 달이 밝게, 문을 닫았으면 어둡게 보인다. 마감·오픈까지 남은 시간도 적는다.
 * 2. 오늘 밤의 메뉴: MENU 전체를 메뉴판처럼 한 크기 글자로 늘어놓는다.
 * 3. 최신 소식 한 줄.
 *
 * 콘솔에서 시험: Dalbit.updateHero(new Date(2026, 10, 18, 22, 0))  // 수요일 22:00
 */
(function () {
  "use strict";

  if (!window.Dalbit) return;

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* ---------- 1. 오늘 밤의 달 ---------- */
  const SYNODIC = 29.530588853;                       // 삭망월(일)
  const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // 기준 삭: 2000-01-06 18:14 UTC

  function moonPhase(now) {
    const days = (now.getTime() - KNOWN_NEW_MOON) / 86400000;
    const age = ((days % SYNODIC) + SYNODIC) % SYNODIC;
    const angle = (age / SYNODIC) * Math.PI * 2;
    const lit = (1 - Math.cos(angle)) / 2;

    let name;
    if (age < 1 || age >= 28.5) name = "삭, 보이지 않는 달";
    else if (age < 6.4) name = "초승달";
    else if (age < 8.4) name = "상현달";
    else if (age < 13.8) name = "차오르는 달";
    else if (age < 15.8) name = "보름달";
    else if (age < 21.1) name = "기우는 달";
    else if (age < 23.1) name = "하현달";
    else name = "그믐달";

    return { age: age, angle: angle, lit: lit, name: name, waxing: angle <= Math.PI };
  }

  // 지름 392인 달(가운데 200,200)의 그림자 모양. 차는 달은 왼쪽, 기우는 달은 오른쪽이 어둡다.
  function shadowPath(phase) {
    const r = 196;
    const theta = phase.waxing ? phase.angle : Math.PI * 2 - phase.angle;
    const rx = Math.abs(r * Math.cos(theta)).toFixed(2);
    const sweep = Math.cos(theta) > 0 ? 0 : 1;
    return "M200 4 A196 196 0 0 0 200 396 A" + rx + " 196 0 0 " + sweep + " 200 4 Z";
  }

  function minutesText(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h && m) return h + "시간 " + m + "분";
    if (h) return h + "시간";
    return m + "분";
  }

  // 다음에 문을 여는 시각(18:00, 월요일 제외)
  function nextOpening(now) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
    while (d <= now || d.getDay() === 1) d.setDate(d.getDate() + 1);
    return d;
  }

  function countdownText(now, status) {
    if (status.state === "open") {
      const close = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 2, 0, 0);
      if (now.getHours() >= 2) close.setDate(close.getDate() + 1);
      return "문 닫기까지 " + minutesText(Math.ceil((close - now) / 60000));
    }
    const open = nextOpening(now);
    const minutes = Math.ceil((open - now) / 60000);
    if (minutes <= 24 * 60 && open.getDate() === now.getDate()) {
      return "문 열기까지 " + minutesText(minutes);
    }
    const DAY = ["일", "월", "화", "수", "목", "금", "토"];
    return "오늘은 쉽니다. " + DAY[open.getDay()] + "요일 18:00에 엽니다";
  }

  const heroMoon = document.querySelector("[data-hero-moon]");
  const shadow = document.querySelector("[data-moon-shadow]"); // taste-skill-ignore: 달 그림자 모양
  const moonLabel = document.querySelector("[data-moon-label]");
  const phaseText = document.querySelector("[data-moon-phase]");
  const countdown = document.querySelector("[data-countdown]");

  function updateHero(now) {
    const date = now instanceof Date ? now : new Date();
    const status = window.Dalbit.getOpenStatus(date);
    const phase = moonPhase(date);

    if (shadow) {
      shadow.setAttribute("d", shadowPath(phase));
      shadow.setAttribute("transform", phase.waxing ? "" : "matrix(-1 0 0 1 400 0)");
    }
    const percent = Math.round(phase.lit * 100);
    if (moonLabel) moonLabel.textContent = "오늘 밤의 달, " + phase.name + ", " + percent + "퍼센트 밝음";
    if (phaseText) phaseText.textContent = "오늘 밤, " + phase.name;
    if (countdown) countdown.textContent = countdownText(date, status);
    if (heroMoon) heroMoon.dataset.state = status.state;
    return { status: status, phase: phase };
  }

  window.Dalbit.updateHero = updateHero;
  updateHero();
  window.setInterval(function () {
    updateHero();
  }, 60 * 1000);

  /* ---------- 2. 오늘 밤의 메뉴 ---------- */
  const lineup = document.querySelector("[data-menu-lineup]");

  if (lineup && typeof MENU !== "undefined" && typeof CATEGORIES !== "undefined") {
    lineup.innerHTML = CATEGORIES.map(function (category) {
      const items = MENU.filter(function (item) { return item.category === category.id; });
      return (
        '<div class="lineup-group">' +
          '<h3 class="lineup-cat">' + escapeHtml(category.name) + "</h3>" +
          '<ul class="lineup-list">' +
            items.map(function (item) {
              return (
                '<li class="lineup-row">' +
                  '<span class="lineup-name">' + escapeHtml(item.name) + "</span>" +
                  '<span class="lineup-en">' + escapeHtml(item.nameEn) + "</span>" +
                  '<span class="lineup-temp">' + escapeHtml(item.temp.join(" · ")) + "</span>" +
                  '<span class="lineup-price">' + window.Dalbit.formatPrice(item.price) + "</span>" +
                "</li>"
              );
            }).join("") +
          "</ul>" +
        "</div>"
      );
    }).join("");
    if (window.Dalbit.reveal) window.Dalbit.reveal(lineup.querySelectorAll(".lineup-cat, .lineup-row"));
  }

  /* ---------- 3. 최신 소식 한 줄 ---------- */
  const latest = document.querySelector("[data-news-latest]");

  if (latest && typeof NEWS !== "undefined" && NEWS.length) {
    const news = NEWS[0];
    latest.innerHTML =
      '<a class="text-link" href="news.html#' + encodeURIComponent(news.id) + '">' +
      "최근 소식: " + escapeHtml(news.title) + "</a>";
  }
})();
