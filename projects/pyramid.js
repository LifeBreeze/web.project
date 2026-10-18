// 피라미드 탈출 게임 - 1인 체험판
// 원본(C# WinForms, 4인 TCP 온라인)의 문제 4개, 제한 시간 45초, 하트 3개 규칙을 그대로 옮김
(function () {
    var QUESTIONS = [
        {
            problem: '이집트어 Shesepankh(‘살아있는 형상’), 고대 이집트어로는 Horemakhet 이다.\n스핑크스 이름은 어디서 유래했나',
            answer: '그리스',
            accept: ['그리스', '그리스어']
        },
        {
            problem: '이 상형 문자 중 새는 총 몇 마리인가?',
            answer: '16마리',
            accept: ['16마리', '16'],
            picture: 'media/pyramid/q2.jpg',
            alt: '세로줄로 빽빽하게 새겨진 이집트 상형 문자'
        },
        {
            problem: '다음 보기 중 저주로 제일 유명한 이집트 왕은?\n1. 투탕카튠  2. 투트앙크아문  3. 네페르티티  4. 아톤  5. 아케나톤',
            answer: '2',
            accept: ['2', '2번', '투트앙크아문']
        },
        {
            problem: '위 석관을 보고 문제를 풀어라.\n뱀의 순서대로 알파벳을 쓰고, 다리가 있는 동물의 알파벳을 순서대로 써라',
            answer: 'FJVALMW',
            accept: ['FJVALMW'],
            picture: 'media/pyramid/q4.jpg',
            alt: 'A부터 Z까지 알파벳에 대응하는 상형 문자 표'
        }
    ];
    var TIME = 45;

    var root = document.getElementById('pyramid');
    var screens = {
        start: root.querySelector('[data-screen="start"]'),
        game: root.querySelector('[data-screen="game"]'),
        result: root.querySelector('[data-screen="result"]')
    };
    var el = {
        round: document.getElementById('py-round'),
        question: document.getElementById('py-question'),
        figure: document.getElementById('py-figure'),
        picture: document.getElementById('py-picture'),
        timer: document.getElementById('py-timer'),
        hearts: document.getElementById('py-hearts'),
        form: document.getElementById('py-form'),
        input: document.getElementById('py-answer'),
        feedback: document.getElementById('py-feedback'),
        resultImg: document.getElementById('py-result-img'),
        resultTitle: document.getElementById('py-result-title'),
        resultList: document.getElementById('py-result-list')
    };

    var round, hearts, timeLeft, timer, log, locked;

    function show(name) {
        Object.keys(screens).forEach(function (k) { screens[k].hidden = k !== name; });
    }

    function normalize(s) {
        return s.replace(/\s+/g, '').toUpperCase();
    }

    function drawHearts() {
        el.hearts.innerHTML = '';
        for (var i = 0; i < 3; i++) {
            var h = document.createElement('img');
            h.src = i < hearts ? 'media/pyramid/heart.png' : 'media/pyramid/heart-broken.png';
            h.alt = i < hearts ? '남은 목숨' : '잃은 목숨';
            h.width = 44;
            h.height = 40;
            el.hearts.appendChild(h);
        }
    }

    function startGame() {
        round = 0;
        hearts = 3;
        log = [];
        show('game');
        drawHearts();
        showQuestion();
    }

    // 원본 ShowQuestion(): 문제 표시, 2·4라운드는 그림 문제, 타이머 45초로 다시 시작
    function showQuestion() {
        var q = QUESTIONS[round];
        locked = false;
        el.round.textContent = (round + 1) + ' / ' + QUESTIONS.length;
        el.question.textContent = q.problem;
        el.figure.hidden = !q.picture;
        if (q.picture) {
            el.picture.src = q.picture;
            el.picture.alt = q.alt;
        }
        el.input.value = '';
        el.feedback.textContent = '';
        el.feedback.className = 'py-feedback';
        el.input.focus({ preventScroll: true });
        timeLeft = TIME;
        el.timer.textContent = timeLeft;
        clearInterval(timer);
        timer = setInterval(tick, 1000);
    }

    function tick() {
        timeLeft--;
        el.timer.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            judge(null);
        }
    }

    // 원본 CheckAnswer() + LoseHeart()
    function judge(answer) {
        if (locked) return;
        locked = true;
        clearInterval(timer);
        var q = QUESTIONS[round];
        var ok = answer !== null && q.accept.some(function (a) { return normalize(a) === normalize(answer); });
        if (!ok) {
            hearts--;
            drawHearts();
        }
        log.push({ q: round + 1, ok: ok, given: answer, answer: q.answer });
        el.feedback.textContent = answer === null ? '시간 초과! 목숨을 하나 잃었습니다.' : ok ? '정답!' : '오답! 목숨을 하나 잃었습니다.';
        el.feedback.className = 'py-feedback ' + (ok ? 'is-ok' : 'is-bad');
        setTimeout(function () {
            if (hearts <= 0) return finish(false);
            round++;
            if (round >= QUESTIONS.length) return finish(true);
            showQuestion();
        }, 1200);
    }

    // 원본 Form3: 성공이면 탈출 성공 그림, 실패면 탈출 실패 그림
    function finish(success) {
        show('result');
        el.resultImg.src = success ? 'media/pyramid/clear.jpg' : 'media/pyramid/fail.jpg';
        el.resultImg.alt = success ? '보물이 쌓인 방의 문이 열린 탈출 성공 장면' : '문이 닫힌 탈출 실패 장면';
        el.resultTitle.textContent = success ? '탈출 성공! 남은 목숨 ' + hearts + '개' : '탈출 실패…';
        el.resultList.innerHTML = '';
        log.forEach(function (r) {
            var li = document.createElement('li');
            li.textContent = r.q + '번 ' + (r.ok ? '정답' : '오답') + ' · 정답: ' + r.answer;
            el.resultList.appendChild(li);
        });
    }

    el.form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = el.input.value.trim();
        if (!v) { el.input.focus(); return; }
        judge(v);
    });

    // 그림 문제는 눌러서 크게 보기 (원본도 그림을 눌러 확대)
    el.picture.addEventListener('click', function () {
        el.figure.classList.toggle('is-open');
    });

    root.querySelectorAll('[data-action="start"]').forEach(function (b) {
        b.addEventListener('click', startGame);
    });

    show('start');
})();
