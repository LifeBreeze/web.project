// 스마트 복합 만화 갤러리 룸 (tkinter 원본을 브라우저로 옮긴 것)
// 층 배경을 누른 위치로 계단/만화 찾기를 나누는 원본 chk_click() 판정을 그대로 씀
(function () {
    // books: [제목, 표지 파일]
    var FLOORS = {
        '1F': { name: '1층 웹툰', w: 1024, h: 683, books: [['SSS급 죽어야 사는 헌터', '1F-01'], ['게임 속 바바리안으로 살아남기', '1F-02'], ['나노마신', '1F-03'], ['나 혼자만 레벨업', '1F-04'], ['스파이더맨', '1F-05'], ['화산귀환', '1F-06']] },
        '2F': { name: '2층 일본만화', w: 1200, h: 900, books: [['귀멸의 칼날', '2F-07'], ['나루토', '2F-08'], ['블리치', '2F-09'], ['원피스', '2F-10'], ['체인소 맨', '2F-11']] },
        '3F': { name: '3층 카툰', w: 1200, h: 900, books: [['배트맨', '3F-12'], ['베놈', '3F-13'], ['슈퍼맨', '3F-14'], ['스파이더맨', '3F-15'], ['토르', '3F-16']] }
    };

    // 원본 좌표 그대로 (이미지 원래 크기 기준 픽셀)
    var STAIRS = {
        '1F': [{ x1: 0, x2: 300, y1: 400, y2: 750, ask: '어디로 이동하시겠습니까?', go: ['2F', '3F'] }],
        '2F': [
            { x1: 0, x2: 250, y1: 600, y2: 850, ask: '위층으로 이동하시겠습니까?', go: ['3F'] },
            { x1: 700, x2: 800, y1: 700, y2: 850, ask: '아래층으로 이동하시겠습니까?', go: ['1F'] }
        ],
        '3F': [{ x1: 650, x2: 800, y1: 650, y2: 850, ask: '아래층으로 이동하시겠습니까?', go: ['2F'] }]
    };

    var room = document.getElementById('room');
    var bg = document.getElementById('room-bg');
    var status = document.getElementById('room-status');
    var spots = document.getElementById('room-spots');
    var dialog = document.getElementById('room-dialog');
    var dialogTitle = document.getElementById('room-dialog-title');
    var dialogBody = document.getElementById('room-dialog-body');
    var cover = document.getElementById('room-cover');
    var coverImg = cover.querySelector('img');
    var zoomBtns = document.querySelectorAll('[data-zoom]');
    var current = '1F';
    var scale = 1;

    // 원본 chg_bg()
    function chgBg(floor) {
        current = floor;
        bg.src = 'media/comic/' + floor + '.jpg';
        bg.width = FLOORS[floor].w;
        bg.height = FLOORS[floor].h;
        bg.alt = FLOORS[floor].name + ' 내부 모습';
        status.textContent = '현재 위치 : ' + FLOORS[floor].name;
        document.querySelectorAll('[data-floor]').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.getAttribute('data-floor') === floor));
        });
        drawSpots();
        closeDialog();
        hideCover();
    }

    // 원본 load_img(): 만화 그림을 배경 가운데에 띄우고 상태창에 이름 표시
    function showCover(book) {
        coverImg.src = 'media/comic/books/' + book[1] + '.jpg';
        coverImg.alt = book[0] + ' 표지';
        scale = 1;
        applyScale();
        cover.hidden = false;
        status.textContent = '현재 보고 있는 만화 : ' + book[0];
        zoomBtns.forEach(function (b) { b.disabled = false; });
    }

    function hideCover() {
        cover.hidden = true;
        zoomBtns.forEach(function (b) { b.disabled = true; });
    }

    // 원본 func_zoom() / func_subsample(): 배수로 키우고 줄이기
    var STEPS = [0.5, 0.75, 1, 1.5, 2];
    function applyScale() {
        coverImg.style.transform = 'scale(' + scale + ')';
    }
    zoomBtns.forEach(function (b) {
        b.addEventListener('click', function () {
            var i = STEPS.indexOf(scale) + (b.getAttribute('data-zoom') === 'in' ? 1 : -1);
            scale = STEPS[Math.max(0, Math.min(STEPS.length - 1, i))];
            applyScale();
        });
    });
    cover.addEventListener('click', function (e) {
        if (e.target === cover) hideCover();
    });

    // 계단 영역을 눈에 보이는 버튼으로도 깔아 둔다
    function drawSpots() {
        spots.innerHTML = '';
        var f = FLOORS[current];
        STAIRS[current].forEach(function (s) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'room-spot';
            b.textContent = '계단';
            b.setAttribute('aria-label', '계단: ' + s.ask);
            var left = s.x1 / f.w * 100, top = s.y1 / f.h * 100;
            b.style.left = left + '%';
            b.style.top = top + '%';
            b.style.width = (Math.min(s.x2, f.w) - s.x1) / f.w * 100 + '%';
            b.style.height = (Math.min(s.y2, f.h) - s.y1) / f.h * 100 + '%';
            b.addEventListener('click', function (e) { e.stopPropagation(); askStairs(s); });
            spots.appendChild(b);
        });
    }

    function openDialog(title) {
        dialogTitle.textContent = title;
        dialogBody.innerHTML = '';
        dialog.hidden = false;
        return dialogBody;
    }

    function closeDialog() {
        dialog.hidden = true;
    }

    function askStairs(s) {
        var body = openDialog(s.ask);
        s.go.forEach(function (f) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn btn-primary';
            b.textContent = FLOORS[f].name + ' 가기';
            b.addEventListener('click', function () { chgBg(f); });
            body.appendChild(b);
        });
        body.querySelector('button').focus();
    }

    // 원본 pop_comic() → 만화 찾기: 이 층의 도서 목록
    function showBooks() {
        var body = openDialog(FLOORS[current].name + ' 도서 목록');
        var ul = document.createElement('ul');
        ul.className = 'room-books';
        FLOORS[current].books.forEach(function (t) {
            var li = document.createElement('li');
            var b = document.createElement('button');
            b.type = 'button';
            b.textContent = t[0];
            b.addEventListener('click', function () {
                closeDialog();
                showCover(t);
            });
            li.appendChild(b);
            ul.appendChild(li);
        });
        body.appendChild(ul);
        ul.querySelector('button').focus();
    }

    // 원본 chk_click(): 계단 영역이면 층 이동, 아니면 만화 찾기
    bg.addEventListener('click', function (e) {
        if (!cover.hidden) { hideCover(); return; }
        var r = bg.getBoundingClientRect();
        var f = FLOORS[current];
        var x = (e.clientX - r.left) / r.width * f.w;
        var y = (e.clientY - r.top) / r.height * f.h;
        var hitStairs = STAIRS[current].filter(function (s) {
            return x >= s.x1 && x <= s.x2 && y >= s.y1 && y <= s.y2;
        })[0];
        if (hitStairs) askStairs(hitStairs);
        else showBooks();
    });

    document.querySelectorAll('[data-floor]').forEach(function (b) {
        b.addEventListener('click', function () { chgBg(b.getAttribute('data-floor')); });
    });
    document.getElementById('room-list').addEventListener('click', showBooks);
    document.getElementById('room-close').addEventListener('click', closeDialog);
    room.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDialog(); });

    chgBg('1F');
})();
