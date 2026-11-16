/*
 * 달빛 홈 — index.html에서만 쓴다.
 * data-news.js · common.js 다음에 불러온다.
 *
 * 1. 오늘 밤의 달: 날짜로 달의 위상을 계산해 첫 화면의 달 사진에 그림자를 드리운다.
 *    영업 중이면 달이 밝게, 문을 닫았으면 어둡게 보인다. 마감·오픈까지 남은 시간도 적는다.
 * 2. 최신 소식 한 줄.
 * 3. 첫 화면 사진 넘기기: 공간 사진과 시그니처 메뉴 사진을 한 장씩 번갈아 보여 준다.
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

  /* ---------- 3. 첫 화면 사진 넘기기 ----------
   * 공간 사진과 시그니처 메뉴 사진을 번갈아 한 장씩 보여 준다.
   * 6초마다 다음 사진, 사진 왼쪽 반 · 오른쪽 반을 누르면 이전 · 다음 사진.
   * 마우스를 올리거나 버튼에 초점이 있으면 멈추고, 다른 탭으로 가면 쉰다. */
  (function heroSlides() {
    const figure = document.querySelector("[data-hero-slides]");
    if (!figure) return;
    const frame = figure.querySelector(".hero-photo-frame");
    const first = frame.querySelector("img");
    const caption = figure.querySelector("[data-slide-caption]");
    const count = figure.querySelector("[data-slide-count]");
    const buttons = figure.querySelectorAll("[data-slide-step]");
    const DELAY = 6000;

    const space = [
      {
        src: "images/space/hall.jpg",
        caption: "공간 · 달빛의 홀. 입구에서 바를 바라본 모습으로, 도면을 바탕으로 그린 가상 공간입니다."
      },
      {
        src: "images/space/bar.jpg", w: 1200, h: 1500, position: "50% 70%",
        alt: "끝이 둥근 오크 바 카운터와 뒤쪽 선반의 흰 잔들",
        caption: "공간 · 끝이 둥근 오크 바와 흰 잔이 놓인 선반"
      },
      {
        src: "images/space/window-bench.jpg", w: 1200, h: 1500, position: "50% 60%",
        alt: "밤의 월하길이 보이는 긴 창 아래 남색 벨벳 벤치와 작은 테이블",
        caption: "공간 · 월하길이 내다보이는 긴 창 아래 남색 벨벳 벤치"
      },
      {
        src: "images/space/lamp-table.jpg", w: 1600, h: 1600,
        alt: "한지 탁상 등이 놓인 둥근 오크 테이블과 남색 의자, 뒤로 창가 벤치와 벽돌 기둥",
        caption: "공간 · 한지 탁상 등을 둔 둥근 오크 테이블"
      },
      {
        src: "images/space/moon-window.jpg", w: 2400, h: 1350,
        alt: "석회 벽에 뚫린 둥근 창 너머 비탈 아래 불 켜진 지붕들과 보름달, 창 앞의 둥근 테이블과 남색 의자 두 개",
        caption: "공간 · 비탈 아래 지붕들과 달이 보이는 만월창 자리"
      }
    ];

    const menu = (typeof MENU !== "undefined" ? MENU : [])
      .filter(function (item) { return item.category === "signature" && item.image; })
      .map(function (item) {
        return {
          src: item.image, w: 800, h: 800,
          alt: item.name + ", " + item.desc,
          caption: "시그니처 · " + item.name + " " + item.price.toLocaleString("ko-KR") + "원. " + item.desc
        };
      });

    // 공간 → 메뉴 → 공간 → 메뉴 … 번갈아, 사진마다 한 번씩
    const slides = [];
    for (let i = 0; i < Math.max(space.length, menu.length); i++) {
      if (space[i]) slides.push(space[i]);
      if (menu[i]) slides.push(menu[i]);
    }
    if (slides.length < 2) return;

    const imgs = new Array(slides.length);
    imgs[0] = first;
    let index = 0;
    let timer = null;
    let paused = false;

    function imgFor(i) {
      if (imgs[i]) return imgs[i];
      const s = slides[i];
      const img = document.createElement("img");
      img.src = s.src;
      img.alt = s.alt;
      img.width = s.w;
      img.height = s.h;
      img.decoding = "async";
      img.setAttribute("aria-hidden", "true");
      if (s.position) img.style.objectPosition = s.position;
      img.addEventListener("error", function () { s.broken = true; });
      frame.insertBefore(img, buttons[0]);
      imgs[i] = img;
      return img;
    }

    function step(from, dir) {
      // 불러오지 못한 사진은 건너뛴다
      let next = from;
      for (let k = 0; k < slides.length; k++) {
        next = (next + dir + slides.length) % slides.length;
        if (!slides[next].broken) return next;
      }
      return from;
    }

    let wanted = 0; // 마지막으로 고른 사진. 늦게 불러온 사진이 그 뒤에 끼어들지 않게 한다

    function show(next, fromUser) {
      wanted = next;
      const img = imgFor(next);
      if (!img.complete) {
        const retry = function () { if (wanted === next) show(next, fromUser); };
        img.addEventListener("load", retry, { once: true });
        img.addEventListener("error", retry, { once: true });
        return;
      }
      if (slides[next].broken) {
        show(step(next, 1), fromUser);
        return;
      }
      imgs.forEach(function (el, k) {
        if (!el) return;
        const on = k === next;
        el.classList.toggle("is-current", on);
        if (on) el.removeAttribute("aria-hidden");
        else el.setAttribute("aria-hidden", "true");
      });
      index = next;
      caption.parentElement.setAttribute("aria-live", fromUser ? "polite" : "off");
      caption.textContent = slides[next].caption;
      count.textContent = next + 1 + " / " + slides.length;
      imgFor(step(next, 1)); // 다음 사진은 미리 불러 둔다
      restart();
    }

    function restart() {
      window.clearTimeout(timer);
      if (paused || document.hidden) return;
      timer = window.setTimeout(function () { show(step(index, 1), false); }, DELAY);
    }

    buttons.forEach(function (button) {
      button.hidden = false;
      button.addEventListener("click", function () {
        show(step(index, Number(button.dataset.slideStep)), true);
      });
    });
    count.hidden = false;

    figure.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") show(step(index, -1), true);
      if (event.key === "ArrowRight") show(step(index, 1), true);
    });

    // 휴대폰: 옆으로 밀어서 넘기기
    let touchX = null;
    frame.addEventListener("touchstart", function (event) {
      touchX = event.touches[0].clientX;
    }, { passive: true });
    frame.addEventListener("touchend", function (event) {
      if (touchX === null) return;
      const dx = event.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 40) show(step(index, dx < 0 ? 1 : -1), true);
    });

    function pause() { paused = true; window.clearTimeout(timer); }
    function resume() { paused = false; restart(); }
    frame.addEventListener("mouseenter", pause);
    frame.addEventListener("mouseleave", resume);
    figure.addEventListener("focusin", pause);
    figure.addEventListener("focusout", resume);
    document.addEventListener("visibilitychange", restart);

    caption.textContent = slides[0].caption;
    count.textContent = "1 / " + slides.length;
    imgFor(1);
    restart();
  })();
})();
