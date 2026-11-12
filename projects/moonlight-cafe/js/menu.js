/*
 * 달빛 메뉴 페이지 — menu.html에서만 쓴다.
 * data-menu.js(MENU · CATEGORIES · BEANS)와 common.js(Dalbit.formatPrice) 다음에 불러온다.
 *
 * 1. 카테고리 탭: 주소의 #coffee 같은 값과 연결. 뒤로 가기로도 탭이 바뀐다.
 * 2. 검색: 선택한 탭 안에서 이름 · 영문 이름 · 설명으로 찾는다.
 * 3. 찜: 별을 누르면 localStorage("moonlight-favorites")에 저장된다.
 * 4. 상세 창: <dialog>. ✕ 버튼 · 바깥 클릭 · Esc로 닫힌다.
 * 5. 원두 선택: beans가 true인 커피만. 고르면 맛 설명과 가격이 바뀌고, 저장하지 않는다.
 */
(function () {
  "use strict";

  const list = document.querySelector("[data-menu-list]");
  if (!list || typeof MENU === "undefined") return;

  const tabsList = document.querySelector("[data-menu-tabs]");
  const searchInput = document.querySelector("[data-menu-search]");
  const countText = document.querySelector("[data-menu-count]");
  const boardTitle = document.querySelector("[data-menu-title]");
  const tabsBar = document.querySelector(".menu-tabs-bar");
  const board = document.querySelector(".menu-board");

  const PLACEHOLDER = "images/placeholder.svg";
  const STORAGE_KEY = "moonlight-favorites";
  const BADGE_TEXT = { best: "BEST", new: "NEW", season: "SEASONAL" };
  const formatPrice = window.Dalbit ? window.Dalbit.formatPrice : function (n) {
    return n.toLocaleString("ko-KR") + "원";
  };

  const categoryById = {};
  CATEGORIES.forEach(function (category) {
    categoryById[category.id] = category;
  });

  const menuById = {};
  MENU.forEach(function (item) {
    menuById[item.id] = item;
  });

  const TABS = [
    { id: "all", name: "전체" },
    { id: "favorites", name: "찜", isFavorites: true }
  ].concat(CATEGORIES);

  const STAR_SVG =
    '<svg class="star" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M12 3.6l2.55 5.2 5.75.83-4.16 4.05.98 5.72L12 16.7l-5.12 2.7.98-5.72L3.7 9.63l5.75-.83z"/>' +
    "</svg>";

  const state = {
    tab: "all",
    query: ""
  };

  /* ---------- 찜 저장 ---------- */
  function loadFavorites() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
      // 없어진 메뉴 id는 버린다.
      return new Set(saved.filter(function (id) { return menuById[id]; }));
    } catch (error) {
      return new Set();
    }
  }

  const favorites = loadFavorites();

  function saveFavorites() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
    } catch (error) {
      // 저장할 수 없는 환경(사생활 보호 모드 등)에서는 이번 방문 동안만 기억한다.
    }
  }

  function toggleFavorite(id) {
    if (favorites.has(id)) {
      favorites.delete(id);
    } else {
      favorites.add(id);
    }
    saveFavorites();
  }

  /*
   * 찜을 바꾼 뒤 화면 반영.
   * 찜 탭이 아니면 목록을 다시 그리지 않고 그 별과 탭 개수만 바꾼다(초점이 그대로 남는다).
   * 찜 탭이면 메뉴가 빠지거나 생기므로 목록을 다시 그린다.
   */
  function refreshAfterFavorite(id) {
    if (state.tab === "favorites") {
      render();
      return;
    }
    const button = list.querySelector('[data-fav="' + id + '"]');
    if (button) {
      button.setAttribute("aria-pressed", String(favorites.has(id)));
      button.setAttribute("aria-label", favLabel(menuById[id]));
    }
    renderTabs();
  }

  /* ---------- 글자 다듬기 ---------- */
  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* 배지 · 온도 · 원두 선택 한 줄. 영문은 넓은 자간, 한글은 본문 글꼴로 쓴다. */
  function metaHtml(item) {
    const parts = [];
    if (item.badges.length) parts.push(BADGE_TEXT[item.badges[0]]);
    if (item.temp.length) parts.push(item.temp.join(" / "));
    if (item.beans) parts.push('<span class="menu-meta-ko">원두 선택</span>');
    return parts.join(" · ");
  }

  function favLabel(item) {
    return favorites.has(item.id) ? item.name + " 찜 해제" : item.name + " 찜하기";
  }

  /* ---------- 사진이 없으면 placeholder ---------- */
  function useFallbackImage(img) {
    img.addEventListener("error", function () {
      img.src = PLACEHOLDER;
      img.classList.add("is-placeholder");
    }, { once: true });
  }

  /* ---------- 탭 ---------- */
  function tabFromHash() {
    const id = decodeURIComponent(window.location.hash.slice(1));
    return TABS.some(function (tab) { return tab.id === id; }) ? id : "all";
  }

  function renderTabs() {
    tabsList.innerHTML = TABS.map(function (tab) {
      const current = tab.id === state.tab ? ' aria-current="true"' : "";
      let label = escapeHtml(tab.name);
      if (tab.isFavorites) {
        label = STAR_SVG + label +
          '<span class="menu-tab-count">' + favorites.size + "</span>" +
          '<span class="sr-only">개</span>';
      }
      return '<li><a class="menu-tab' + (tab.isFavorites ? " menu-tab--fav" : "") +
        '" href="#' + tab.id + '"' + current + ">" + label + "</a></li>";
    }).join("");

    const active = tabsList.querySelector('[aria-current="true"]');
    if (active) {
      // 휴대폰에서 선택한 탭이 가로 스크롤 밖에 있으면 보이게 옮긴다.
      const nav = tabsList.parentElement;
      const left = active.offsetLeft - nav.offsetLeft;
      if (left < nav.scrollLeft || left + active.offsetWidth > nav.scrollLeft + nav.clientWidth) {
        nav.scrollLeft = left - 20;
      }
    }
  }

  /* ---------- 목록 ---------- */
  function matchesQuery(item, query) {
    if (!query) return true;
    const haystack = (item.name + " " + item.nameEn + " " + item.desc).toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function visibleItems() {
    const query = state.query.trim().toLowerCase();
    return MENU.filter(function (item) {
      if (state.tab === "favorites" && !favorites.has(item.id)) return false;
      if (state.tab !== "all" && state.tab !== "favorites" && item.category !== state.tab) return false;
      return matchesQuery(item, query);
    });
  }

  function itemHtml(item) {
    const meta = metaHtml(item);
    const isFav = favorites.has(item.id);
    return (
      '<li class="menu-item">' +
        '<button class="menu-item-open" type="button" aria-haspopup="dialog" data-open="' + item.id + '">' +
          '<span class="menu-thumb"><img src="' + escapeHtml(item.image) + '" alt="" width="144" height="144" loading="lazy"></span>' +
          '<span class="menu-item-text">' +
            '<span class="menu-item-name">' + escapeHtml(item.name) + "</span>" +
            '<span class="menu-item-en">' + escapeHtml(item.nameEn) + "</span>" +
            '<span class="menu-item-desc">' + escapeHtml(item.desc) + "</span>" +
            (meta ? '<span class="menu-meta">' + meta + "</span>" : "") +
          "</span>" +
          '<span class="menu-item-price">' + formatPrice(item.price) + "</span>" +
        "</button>" +
        '<button class="fav-btn" type="button" aria-pressed="' + isFav + '" aria-label="' + escapeHtml(favLabel(item)) + '" data-fav="' + item.id + '">' +
          STAR_SVG +
        "</button>" +
      "</li>"
    );
  }

  function emptyMessage() {
    if (state.query.trim()) return "찾으시는 메뉴가 없습니다.";
    if (state.tab === "favorites") return "아직 찜한 메뉴가 없습니다. 메뉴 옆의 별을 누르면 이곳에 모아 둡니다.";
    return "준비된 메뉴가 없습니다.";
  }

  function renderList() {
    const items = visibleItems();
    const tab = TABS.find(function (t) { return t.id === state.tab; });
    const query = state.query.trim();

    boardTitle.textContent = state.tab === "all" ? "전체 메뉴" : state.tab === "favorites" ? "찜한 메뉴" : tab.name;
    countText.textContent = query
      ? "“" + query + "” 검색 결과 " + items.length + "개"
      : items.length + "개의 메뉴";

    if (!items.length) {
      list.innerHTML = '<p class="menu-empty">' + escapeHtml(emptyMessage()) + "</p>";
      return;
    }

    // 어느 탭이든 카테고리별로 묶어서 메뉴판처럼 보여 준다.
    list.innerHTML = CATEGORIES.map(function (category) {
      const groupItems = items.filter(function (item) { return item.category === category.id; });
      if (!groupItems.length) return "";
      return (
        '<section class="menu-group" aria-labelledby="group-' + category.id + '">' +
          '<div class="menu-group-head">' +
            '<p class="label">' + escapeHtml(category.nameEn) + "</p>" +
            '<h3 id="group-' + category.id + '" class="title-md">' + escapeHtml(category.name) + "</h3>" +
          "</div>" +
          '<ul class="menu-list">' + groupItems.map(itemHtml).join("") + "</ul>" +
        "</section>"
      );
    }).join("");

    list.querySelectorAll("img").forEach(useFallbackImage);
  }

  function render() {
    renderTabs();
    renderList();
  }

  /* 탭을 바꿨을 때 이미 아래로 내려와 있으면 목록 맨 위로 올린다. */
  function scrollToBoardTop() {
    const header = document.querySelector(".site-header");
    const offset = (header ? header.offsetHeight : 0) + (tabsBar ? tabsBar.offsetHeight : 0);
    const top = board.getBoundingClientRect().top + window.scrollY - offset;
    if (window.scrollY > top) {
      window.scrollTo({ top: top, behavior: "auto" });
    }
  }

  /* ---------- 상세 창 ---------- */
  const dialog = document.querySelector("[data-menu-dialog]");
  const dialogEl = {
    image: dialog.querySelector("[data-dialog-image]"),
    category: dialog.querySelector("[data-dialog-category]"),
    name: dialog.querySelector("[data-dialog-name]"),
    en: dialog.querySelector("[data-dialog-en]"),
    meta: dialog.querySelector("[data-dialog-meta]"),
    detail: dialog.querySelector("[data-dialog-detail]"),
    beans: dialog.querySelector("[data-dialog-beans]"),
    price: dialog.querySelector("[data-dialog-price]"),
    fav: dialog.querySelector("[data-dialog-fav]")
  };
  let dialogItem = null;
  let dialogTrigger = null;

  function renderDialogFav() {
    const isFav = favorites.has(dialogItem.id);
    dialogEl.fav.setAttribute("aria-pressed", String(isFav));
    dialogEl.fav.innerHTML = STAR_SVG + "<span>" + (isFav ? "찜한 메뉴" : "찜하기") + "</span>";
  }

  function beanPickerHtml() {
    return (
      '<fieldset class="bean-picker">' +
        '<legend class="bean-legend">원두 선택</legend>' +
        '<div class="bean-options">' +
          BEANS.map(function (bean) {
            return (
              '<label class="bean-option">' +
                '<input type="radio" name="bean" value="' + bean.id + '"' + (bean.isDefault ? " checked" : "") + ">" +
                '<span class="bean-text">' +
                  '<span class="bean-name">' + escapeHtml(bean.name) + "</span>" +
                  '<span class="bean-en">' + escapeHtml(bean.nameEn) + "</span>" +
                  '<span class="bean-taste">' + escapeHtml(bean.taste) + "</span>" +
                "</span>" +
                '<span class="bean-extra">' + (bean.extra ? "+" + formatPrice(bean.extra) : "추가 금액 없음") + "</span>" +
              "</label>"
            );
          }).join("") +
        "</div>" +
        '<p class="bean-note" data-bean-note></p>' +
      "</fieldset>"
    );
  }

  function selectedBean() {
    const checked = dialogEl.beans.querySelector('input[name="bean"]:checked');
    const id = checked ? checked.value : null;
    return BEANS.find(function (bean) { return bean.id === id; }) ||
      BEANS.find(function (bean) { return bean.isDefault; });
  }

  function renderDialogPrice() {
    if (dialogItem.beans) {
      const bean = selectedBean();
      dialogEl.price.textContent = formatPrice(dialogItem.price + bean.extra);
      const note = dialogEl.beans.querySelector("[data-bean-note]");
      note.textContent = bean.name + " — " + bean.note;
    } else {
      dialogEl.price.textContent = formatPrice(dialogItem.price);
    }
  }

  function openDialog(id, trigger) {
    const item = menuById[id];
    if (!item) return;
    dialogItem = item;
    dialogTrigger = trigger || null;

    dialogEl.image.classList.remove("is-placeholder");
    dialogEl.image.src = item.image;
    dialogEl.image.alt = item.name;
    useFallbackImage(dialogEl.image);

    dialogEl.category.textContent = categoryById[item.category].nameEn;
    dialogEl.name.textContent = item.name;
    dialogEl.en.textContent = item.nameEn;
    dialogEl.meta.innerHTML = metaHtml(item);
    dialogEl.meta.hidden = !dialogEl.meta.textContent;
    dialogEl.detail.textContent = item.detail;

    // 원두는 열 때마다 기본값(브라질 산토스)으로 돌아간다.
    dialogEl.beans.innerHTML = item.beans ? beanPickerHtml() : "";

    renderDialogPrice();
    renderDialogFav();

    dialog.showModal();
    dialog.querySelector(".menu-dialog-inner").scrollTop = 0;
    dialog.scrollTop = 0;
  }

  dialog.addEventListener("change", function (event) {
    if (event.target.name === "bean") renderDialogPrice();
  });

  dialog.addEventListener("click", function (event) {
    // 바깥(어두운 배경)을 누르면 닫는다. 창 안쪽은 .menu-dialog-inner가 채우고 있다.
    if (event.target === dialog) {
      dialog.close();
      return;
    }
    if (event.target.closest("[data-dialog-close]")) {
      dialog.close();
      return;
    }
    if (event.target.closest("[data-dialog-fav]")) {
      toggleFavorite(dialogItem.id);
      renderDialogFav();
      refreshAfterFavorite(dialogItem.id);
    }
  });

  dialog.addEventListener("close", function () {
    // 창을 열었던 메뉴로 초점을 돌려준다. 목록이 다시 그려졌으면 같은 메뉴를 찾는다.
    let target = dialogTrigger;
    if (!target || !document.body.contains(target)) {
      target = list.querySelector('[data-open="' + (dialogItem && dialogItem.id) + '"]');
    }
    if (target) target.focus();
  });

  /* ---------- 이벤트 ---------- */
  list.addEventListener("click", function (event) {
    const favButton = event.target.closest("[data-fav]");
    if (favButton) {
      const id = favButton.dataset.fav;
      const index = Array.prototype.indexOf.call(list.querySelectorAll("[data-fav]"), favButton);
      toggleFavorite(id);
      refreshAfterFavorite(id);
      if (state.tab === "favorites") {
        // 찜 탭에서 해제하면 메뉴가 빠진다. 키보드 초점을 잃지 않게
        // 그 자리의 다음 별로, 마지막이었으면 검색창으로 옮긴다.
        const buttons = list.querySelectorAll("[data-fav]");
        (buttons[Math.min(index, buttons.length - 1)] || searchInput).focus();
      }
      return;
    }
    const openButton = event.target.closest("[data-open]");
    if (openButton) openDialog(openButton.dataset.open, openButton);
  });

  searchInput.addEventListener("input", function () {
    state.query = searchInput.value;
    renderList();
  });

  window.addEventListener("hashchange", function () {
    const next = tabFromHash();
    if (next === state.tab) return;
    state.tab = next;
    render();
    scrollToBoardTop();
  });

  // 다른 탭(브라우저 창)에서 찜을 바꾸면 이 창에도 반영한다.
  window.addEventListener("storage", function (event) {
    if (event.key !== STORAGE_KEY) return;
    const fresh = loadFavorites();
    favorites.clear();
    fresh.forEach(function (id) { favorites.add(id); });
    render();
  });

  state.tab = tabFromHash();
  render();
})();
