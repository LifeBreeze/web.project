/* =========================================================
   달빛 · Café Dalbit — 모든 페이지 공통 스크립트
   1단계: 휴대폰 메뉴 열고 닫기
   ========================================================= */

(function () {
  "use strict";

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  const toggleText = toggle.querySelector(".sr-only");

  function setMenuOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    toggleText.textContent = open ? "메뉴 닫기" : "메뉴 열기";
  }

  toggle.addEventListener("click", function () {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  // Esc 키로 닫기
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setMenuOpen(false);
      toggle.focus();
    }
  });

  // 화면이 넓어져 메뉴가 한 줄로 바뀌면 열림 상태를 초기화
  window.matchMedia("(min-width: 900px)").addEventListener("change", function (event) {
    if (event.matches) setMenuOpen(false);
  });
})();
