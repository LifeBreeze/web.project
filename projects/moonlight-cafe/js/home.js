/*
 * 달빛 홈 — index.html에서만 쓴다.
 * data-news.js · common.js 다음에 불러온다.
 *
 * 1. 오늘 밤의 달: 날짜로 달의 위상을 계산해 첫 화면의 달 사진에 그림자를 드리운다.
 *    영업 중이면 달이 밝게, 문을 닫았으면 어둡게 보인다. 마감·오픈까지 남은 시간도 적는다.
 * 2. 최신 소식 한 줄.
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
    const phase = window.Dalbit.moonPhase(date);

    if (shadow) {
      shadow.setAttribute("d", window.Dalbit.moonShadowPath(phase, 200, 200, 196));
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

  /* ---------- 2. 최신 소식 한 줄 ---------- */
  const latest = document.querySelector("[data-news-latest]");

  if (latest && typeof NEWS !== "undefined" && NEWS.length) {
    const news = NEWS[0];
    latest.innerHTML =
      '<a class="text-link" href="news.html#' + encodeURIComponent(news.id) + '">' +
      "최근 소식: " + escapeHtml(news.title) + "</a>";
  }
})();
