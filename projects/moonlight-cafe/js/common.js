/*
 * 달빛 공통 스크립트 — 모든 페이지에서 쓴다.
 * 1. 휴대폰 메뉴 열고 닫기
 * 2. 영업 상태 계산과 표시 (헤더의 작은 달)
 * 3. 맨 위로 버튼
 * 4. 화면에 들어올 때 천천히 나타나기
 *
 * 다른 스크립트와 콘솔에서 쓸 수 있도록 window.Dalbit에 함수를 모아 둔다.
 *   Dalbit.getOpenStatus(new Date(2026, 10, 16, 1, 0))  // 2026-11-16(월) 01:00
 *   Dalbit.renderOpenStatus(new Date(2026, 10, 17, 1, 0)) // 그 시각으로 화면 표시 바꾸기
 */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- 1. 휴대폰 메뉴 ---------- */
  function initNav() {
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

    // Esc로 닫고 버튼으로 초점을 돌려준다.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setMenuOpen(false);
        toggle.focus();
      }
    });

    // 넓은 화면으로 바뀌면 열린 상태를 정리한다.
    window.matchMedia("(min-width: 900px)").addEventListener("change", function (event) {
      if (event.matches) setMenuOpen(false);
    });
  }

  /* ---------- 2. 영업 상태 ---------- */
  const OPEN_HOUR = 18;  // 18:00 오픈
  const CLOSE_HOUR = 2;  // 다음 날 02:00 마감
  const DAY_OFF = 1;     // 월요일 휴무 (일요일 0 ~ 토요일 6)

  /*
   * 주어진 시각의 영업 상태를 돌려준다.
   * 00:00~02:00은 전날 밤 영업으로 본다.
   *   state: "open"(영업 중) | "preparing"(영업 준비 중) | "closed"(휴무)
   *   phase: "evening" | "night" | "dawn" | "day" | "holiday" — 홈 첫 화면 문구에 쓴다.
   */
  function getOpenStatus(now) {
    const date = now instanceof Date ? now : new Date();
    const day = date.getDay();
    const hour = date.getHours();

    let state;
    let phase;

    if (hour < CLOSE_HOUR) {
      // 새벽: 전날 밤 영업이 이어지는 시간
      const nightOf = (day + 6) % 7;
      if (nightOf === DAY_OFF) {
        state = "closed";
        phase = "holiday";
      } else {
        state = "open";
        phase = "dawn";
      }
    } else if (day === DAY_OFF) {
      state = "closed";
      phase = "holiday";
    } else if (hour >= OPEN_HOUR) {
      state = "open";
      phase = hour < 21 ? "evening" : "night";
    } else {
      state = "preparing";
      phase = "day";
    }

    const text = {
      open: { label: "영업 중", detail: "02:00까지" },
      preparing: { label: "영업 준비 중", detail: "18:00 오픈" },
      closed: { label: "오늘 휴무", detail: "화요일 18:00 오픈" }
    }[state];

    return { state: state, phase: phase, isOpen: state === "open", label: text.label, detail: text.detail };
  }

  /* 실제 달처럼 그린 작은 달 + 글자. 달 모양만으로 구분하지 않도록 글자를 항상 함께 쓴다. */
  function renderOpenStatus(now) {
    const status = getOpenStatus(now);
    const targets = document.querySelectorAll("[data-open-status]");

    targets.forEach(function (target) {
      let moon = target.querySelector(".moon");
      if (!moon) {
        target.innerHTML =
          '<span class="moon" aria-hidden="true"></span>' +
          '<span class="open-status-text">' +
          '<span class="open-status-label"></span>' +
          '<span class="open-status-detail"></span>' +
          "</span>";
        moon = target.querySelector(".moon");
      }
      moon.classList.toggle("is-lit", status.isOpen);
      target.querySelector(".open-status-label").textContent = status.label;
      target.querySelector(".open-status-detail").textContent = " · " + status.detail;
      target.dataset.state = status.state;
      target.hidden = false;
    });

    return status;
  }

  function initOpenStatus() {
    renderOpenStatus();
    // 1분마다 다시 계산한다. 18:00이나 02:00을 지나면 달이 천천히 켜지고 꺼진다.
    window.setInterval(function () {
      renderOpenStatus();
    }, 60 * 1000);
  }

  /* ---------- 3. 맨 위로 버튼 ---------- */
  function initToTop() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "to-top";
    button.innerHTML =
      '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
      '<path d="M8 13V3.5M3.5 8 8 3.5 12.5 8" fill="none" stroke="currentColor" stroke-width="1"/>' +
      "</svg>" +
      '<span class="sr-only">맨 위로</span>';
    document.body.appendChild(button);

    let ticking = false;
    function update() {
      ticking = false;
      button.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.8);
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
      // 키보드 사용자가 맨 위에서 다시 시작할 수 있게 로고로 초점을 옮긴다.
      const logo = document.querySelector(".logo");
      if (logo) logo.focus({ preventScroll: true });
    });

    update();
  }

  /* ---------- 4. 천천히 나타나기 ---------- */
  function initReveal() {
    // "동작 줄이기"를 켰거나 오래된 브라우저면 처음부터 모두 보인다.
    if (reduceMotion.matches || !("IntersectionObserver" in window)) return;

    const items = document.querySelectorAll("main .section > .container > *, [data-reveal]");
    if (!items.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    items.forEach(function (item) {
      item.classList.add("reveal");
      observer.observe(item);
    });
  }

  /* ---------- 다른 스크립트·콘솔에서 쓰는 도구 ---------- */
  function formatPrice(price) {
    return price.toLocaleString("ko-KR") + "원";
  }

  window.Dalbit = {
    getOpenStatus: getOpenStatus,
    renderOpenStatus: renderOpenStatus,
    formatPrice: formatPrice
  };

  initNav();
  initOpenStatus();
  initToTop();
  initReveal();
})();
