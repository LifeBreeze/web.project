/*
 * 달빛 카페 프로젝트 상세 — 페이지 안의 창(iframe)으로 카페 사이트를 둘러본다.
 * 위쪽 버튼으로 쪽을 옮기고, '넓은 화면' · '휴대폰 크기'로 창 폭을 바꾼다.
 * 창 안에서 링크를 눌러 쪽이 바뀌면 위쪽 버튼도 따라 바뀐다.
 */
(function () {
    'use strict';

    var BASE = 'moonlight-cafe/';
    var frame = document.getElementById('site-frame');
    var view = document.getElementById('site-view');
    var openLink = document.getElementById('site-open');
    if (!frame || !view) return;

    var pageButtons = document.querySelectorAll('[data-page]');
    var sizeButtons = document.querySelectorAll('[data-size]');

    function markPage(page) {
        pageButtons.forEach(function (button) {
            button.setAttribute('aria-pressed', String(button.dataset.page === page));
        });
        if (openLink) openLink.href = BASE + page;
    }

    pageButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            frame.src = BASE + button.dataset.page;
            markPage(button.dataset.page);
        });
    });

    sizeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            sizeButtons.forEach(function (other) {
                other.setAttribute('aria-pressed', String(other === button));
            });
            view.classList.toggle('is-phone', button.dataset.size === 'phone');
        });
    });

    // 창 안에서 다른 쪽으로 옮기면 버튼도 맞춘다
    // (파일로 바로 열면 브라우저가 창 안 주소를 막을 수 있어 그때는 그냥 넘어간다)
    frame.addEventListener('load', function () {
        try {
            var path = frame.contentWindow.location.pathname;
            var page = path.slice(path.lastIndexOf('/') + 1) || 'index.html';
            markPage(page);
        } catch (error) {
            /* 창 안 주소를 읽을 수 없음 */
        }
    });
})();
