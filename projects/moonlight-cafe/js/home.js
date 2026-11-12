/*
 * 달빛 홈 — index.html에서만 쓴다.
 * data-menu.js · data-news.js · common.js 다음에 불러온다.
 *
 * 1. 첫 화면: 시각에 따라 문구 한 줄이 바뀌고, 영업 중이면 달의 빛무리가 조금 밝아진다.
 * 2. 시그니처 5개를 MENU에서 가져와 가로로 놓는다.
 * 3. 최신 소식 2개를 NEWS에서 가져온다.
 *
 * 콘솔에서 시험: Dalbit.updateHero(new Date(2026, 10, 18, 22, 0))  // 수요일 22:00
 */
(function () {
  "use strict";

  if (!window.Dalbit) return;

  const PLACEHOLDER = "images/placeholder.svg";

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* ---------- 1. 첫 화면 ---------- */
  const GREETINGS = {
    evening: "저녁이 시작되는 시간입니다.",
    night: "밤이 깊어 갑니다. 천천히 머물다 가세요.",
    dawn: "조용한 새벽, 마지막 한 잔.",
    day: "오늘 저녁 여섯 시에 문을 엽니다.",
    holiday: "월요일은 쉬어 갑니다. 화요일 저녁에 뵙겠습니다."
  };

  const greeting = document.querySelector("[data-greeting]");
  const heroMoon = document.querySelector("[data-hero-moon]");

  function updateHero(now) {
    const status = window.Dalbit.getOpenStatus(now);
    if (greeting) greeting.textContent = GREETINGS[status.phase];
    if (heroMoon) heroMoon.classList.toggle("is-open", status.isOpen);
    return status;
  }

  window.Dalbit.updateHero = updateHero;
  updateHero();
  window.setInterval(function () {
    updateHero();
  }, 60 * 1000);

  /* ---------- 2. 시그니처 ---------- */
  const signatureList = document.querySelector("[data-signature-list]");

  if (signatureList && typeof MENU !== "undefined") {
    const items = MENU.filter(function (item) { return item.category === "signature"; });

    // 사진 옆에 이름이 바로 있으므로 사진 alt는 비워 두어 같은 이름을 두 번 읽지 않게 한다.
    signatureList.innerHTML = items.map(function (item) {
      return (
        '<li class="signature-item">' +
          '<a class="signature-link" href="menu.html#signature">' +
            '<span class="signature-photo"><img src="' + escapeHtml(item.image) + '" alt="" width="400" height="400" loading="lazy"></span>' +
            '<span class="signature-name">' + escapeHtml(item.name) + "</span>" +
            '<span class="signature-en">' + escapeHtml(item.nameEn) + "</span>" +
            '<span class="signature-price">' + window.Dalbit.formatPrice(item.price) + "</span>" +
          "</a>" +
        "</li>"
      );
    }).join("");

    signatureList.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.src = PLACEHOLDER;
      }, { once: true });
    });
  }

  /* ---------- 3. 최신 소식 2개 ---------- */
  const newsList = document.querySelector("[data-news-list]");

  if (newsList && typeof NEWS !== "undefined") {
    newsList.innerHTML = NEWS.slice(0, 2).map(function (news) {
      return (
        '<li class="news-item">' +
          '<a class="news-link" href="news.html#' + escapeHtml(news.id) + '">' +
            '<span class="news-meta">' +
              '<time datetime="' + news.date + '">' + news.date.replace(/-/g, ".") + "</time>" +
              '<span class="news-tag">' + escapeHtml(news.tag) + "</span>" +
            "</span>" +
            '<span class="news-title">' + escapeHtml(news.title) + "</span>" +
            '<span class="news-summary">' + escapeHtml(news.summary) + "</span>" +
          "</a>" +
        "</li>"
      );
    }).join("");
  }
})();
