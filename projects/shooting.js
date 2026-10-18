// 몬스터 디펜스 (pygame 원본을 브라우저 캔버스로 옮긴 것)
// 화면 564x564, 60fps, 수치와 규칙은 원본 그대로
(function () {
    var W = 564, H = 564;
    var canvas = document.getElementById('shooting');
    var ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    var M = 'media/shooting/';
    function img(src) { var i = new Image(); i.src = M + src; return i; }
    var images = {
        background: img('background.png'),
        fighter: img('fighter.png'),
        missile: img('missile.png'),
        explosion: img('explosion.png'),
        viruses: ['01', '02', '03', '04', '05', '06'].map(function (n) { return img('virus/virus' + n + '.png'); })
    };

    var soundOn = true;
    function play(name) {
        if (!soundOn) return;
        var a = new Audio(M + name);
        a.volume = 0.4;
        a.play().catch(function () {});
    }

    function randint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

    var fighter = { x: 0, y: 0, w: 100, h: 137, dx: 0, dy: 0 };
    function resetFighter() {
        fighter.w = images.fighter.naturalWidth || 100;
        fighter.h = images.fighter.naturalHeight || 137;
        fighter.x = Math.floor(W / 2);
        fighter.y = H - fighter.h;
        fighter.dx = 0;
        fighter.dy = 0;
    }

    var missiles = [], viruses = [], explosions = [];
    var occurProb = 55, shotCount = 0, countMissed = 0;
    var menuOn = true, pauseUntil = 0;

    function hit(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function startGame() {
        shotCount = 0;
        countMissed = 0;
        missiles = [];
        viruses = [];
        explosions = [];
        resetFighter();
        menuOn = false;
        canvas.focus({ preventScroll: true });
    }

    function fire() {
        if (menuOn) return;
        var m = images.missile;
        missiles.push({ x: fighter.x + fighter.w / 2, y: fighter.y, w: m.naturalWidth || 30, h: m.naturalHeight || 63, speed: 10 });
        play('missile.wav');
    }

    function explode(x, y) {
        explosions.push({ x: x, y: y, until: performance.now() + 220 });
        play('explosion0' + randint(1, 3) + '.wav');
    }

    // 원본 run_logic() 의 난이도 곡선을 웹 체험용으로 완만하게:
    // 처음엔 천천히(초당 약 60px) 1~2마리, 잡을수록 수와 속도가 조금씩 늘어난다
    function runLogic() {
        var occur = Math.min(1 + Math.floor(shotCount / 15), 4);
        var minSpeed = Math.min(0.9 + shotCount * 0.03, 4);
        var maxSpeed = Math.min(1.3 + shotCount * 0.04, 5);

        if (randint(1, occurProb) === 1) {
            for (var i = 0; i < occur; i++) {
                var v = images.viruses[randint(0, 5)];
                viruses.push({ img: v, x: randint(0, W - 30), y: -60, w: v.naturalWidth || 100, h: v.naturalHeight || 100, speed: minSpeed + Math.random() * (maxSpeed - minSpeed) });
            }
        }

        missiles.forEach(function (m) {
            for (var k = 0; k < viruses.length; k++) {
                if (hit(m, viruses[k])) {
                    explode(viruses[k].x, viruses[k].y);
                    shotCount++;
                    m.dead = true;
                    viruses.splice(k, 1);
                    break;
                }
            }
        });
        missiles = missiles.filter(function (m) { return !m.dead; });

        viruses = viruses.filter(function (v) {
            if (v.y > H) { countMissed++; return false; }
            return true;
        });

        var crashed = viruses.some(function (v) { return hit(fighter, v); });
        if (crashed || countMissed >= 6) {
            explode(fighter.x, fighter.y);
            play('gameover.wav');
            lastResult = { shot: shotCount, missed: countMissed };
            viruses = [];
            resetFighter();
            menuOn = true;
            pauseUntil = performance.now() + 1000;
        }
    }

    function text(str, size, x, y, color) {
        ctx.font = '700 ' + size + 'px Pretendard, "Malgun Gothic", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        ctx.fillText(str, x, y);
    }

    var lastResult = null;

    function displayMenu() {
        ctx.drawImage(images.background, 0, 0, W, H);
        var x = W / 2, y = H / 4;
        text('몬스터 디펜스', 70, x, y, 'rgb(0,255,128)');
        if (lastResult) text('잡은 몬스터 ' + lastResult.shot + '  ·  놓친 몬스터 ' + lastResult.missed, 24, x, y + 110, '#ffffff');
        text('스페이스 키를 누르면', 30, x, y + 200, 'rgb(250,50,50)');
        text('게임이 시작됩니다.', 30, x, y + 250, 'rgb(250,50,50)');
    }

    function displayFrame(now) {
        ctx.drawImage(images.background, 0, 0, W, H);
        text('잡은 몬스터: ' + shotCount, 28, 130, 20, 'rgb(0,128,255)');
        text('놓친 몬스터: ' + countMissed, 28, 450, 20, 'rgb(250,50,50)');

        viruses.forEach(function (v) { v.y += v.speed; ctx.drawImage(v.img, v.x, v.y); });
        missiles.forEach(function (m) { m.y -= m.speed; ctx.drawImage(images.missile, m.x, m.y); });
        missiles = missiles.filter(function (m) { return m.y + m.h >= 0; });

        fighter.x += fighter.dx;
        fighter.y += fighter.dy;
        if (fighter.x < 0 || fighter.x + fighter.w > W) fighter.x -= fighter.dx;
        if (fighter.y < 0 || fighter.y + fighter.h > H) fighter.y -= fighter.dy;
        ctx.drawImage(images.fighter, fighter.x, fighter.y);
    }

    function drawExplosions(now) {
        explosions = explosions.filter(function (e) { return e.until > now; });
        explosions.forEach(function (e) { ctx.drawImage(images.explosion, e.x, e.y); });
    }

    // 원본처럼 60fps 고정 간격으로 진행
    var acc = 0, last = performance.now(), STEP = 1000 / 60;
    function loop(now) {
        acc += Math.min(now - last, 100);
        last = now;
        while (acc >= STEP) {
            acc -= STEP;
            if (!menuOn) {
                runLogic();
                if (!menuOn) displayFrame(now);
            }
        }
        if (menuOn) displayMenu();
        drawExplosions(now);
        requestAnimationFrame(loop);
    }

    // 원본 process_events(): 누를 때 속도 ±5, 뗄 때 0
    var down = {};
    function press(key) {
        if (menuOn) {
            if (key === ' ' && performance.now() > pauseUntil) startGame();
            return;
        }
        if (key === 'ArrowLeft') fighter.dx -= 5;
        else if (key === 'ArrowRight') fighter.dx += 5;
        else if (key === 'ArrowUp') fighter.dy -= 5;
        else if (key === 'ArrowDown') fighter.dy += 5;
        else if (key === ' ') fire();
    }
    function release(key) {
        if (key === 'ArrowLeft' || key === 'ArrowRight') fighter.dx = 0;
        else if (key === 'ArrowUp' || key === 'ArrowDown') fighter.dy = 0;
    }

    canvas.addEventListener('keydown', function (e) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].indexOf(e.key) < 0) return;
        e.preventDefault();
        if (e.repeat || down[e.key]) return;
        down[e.key] = true;
        press(e.key);
    });
    canvas.addEventListener('keyup', function (e) {
        down[e.key] = false;
        release(e.key);
    });
    canvas.addEventListener('blur', function () {
        down = {};
        fighter.dx = 0;
        fighter.dy = 0;
    });
    canvas.addEventListener('pointerdown', function () {
        canvas.focus({ preventScroll: true });
        if (menuOn && performance.now() > pauseUntil) startGame();
    });

    // 휴대폰 버튼: 누르고 있는 동안 이동
    document.querySelectorAll('[data-key]').forEach(function (b) {
        var key = b.getAttribute('data-key');
        b.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            if (key === ' ' && menuOn) { if (performance.now() > pauseUntil) startGame(); return; }
            press(key);
        });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (t) {
            b.addEventListener(t, function () { release(key); });
        });
    });

    var soundBtn = document.getElementById('sound');
    soundBtn.addEventListener('click', function () {
        soundOn = !soundOn;
        soundBtn.setAttribute('aria-pressed', String(soundOn));
        soundBtn.textContent = soundOn ? '소리 켜짐' : '소리 꺼짐';
    });

    document.getElementById('start').addEventListener('click', function () {
        if (performance.now() > pauseUntil) startGame();
    });

    images.fighter.onload = resetFighter;
    requestAnimationFrame(loop);
})();
