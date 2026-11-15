/*
 * 달빛 공간 — space.html에서만 쓴다. common.js 다음에 불러온다.
 *
 * 1. 입체 도면: 화면에 들어오면 바닥부터 벽, 가구, 조명 순서로 한 겹씩 놓인다.
 *    스크립트가 없거나 "동작 줄이기"를 켰으면 처음부터 다 그려진 채로 보인다.
 * 2. 평면도 번호: 목록의 자리를 누르면 도면에서 그 번호가 까맣게 칠해진다.
 *    도면의 번호를 눌러도 목록의 같은 자리가 함께 켜진다. 한 번 더 누르면 꺼진다.
 */
(function () {
  "use strict";

  /* ---------- 1. 입체 도면 ---------- */
  const axon = document.querySelector("[data-axon]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (axon && !reduceMotion.matches && "IntersectionObserver" in window) {
    axon.classList.add("is-waiting");
    const observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      axon.classList.add("is-built");
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(axon);
  }

  /* ---------- 2. 평면도 번호 ---------- */
  const plan = document.querySelector("[data-plan]");
  const buttons = document.querySelectorAll("[data-zone-btn]");
  if (!plan || !buttons.length) return;

  const marks = plan.querySelectorAll("[data-zone]");
  let current = null;

  function select(zone) {
    current = current === zone ? null : zone;
    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.zoneBtn === current));
    });
    marks.forEach(function (mark) {
      mark.classList.toggle("is-active", mark.dataset.zone === current);
    });
    plan.classList.toggle("has-active", current !== null);
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      select(button.dataset.zoneBtn);
    });
  });

  // 도면의 번호는 마우스로 누르는 보조 수단이다. 키보드로는 목록의 버튼을 쓴다.
  marks.forEach(function (mark) {
    mark.addEventListener("click", function () {
      select(mark.dataset.zone);
    });
  });
})();
