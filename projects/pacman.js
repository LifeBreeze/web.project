// 팩맨 게임 (C 콘솔 원본 pacmanreal (3).cpp 를 브라우저로 옮긴 것)
// 규칙과 수치는 원본 그대로: 50x30 판, C = 팩맨, X = 악마, # = 벽, . = 먹이
(function () {
    var HEIGHT = 30;
    var WIDTH = 50;
    var PACMAN = 'C';
    var WALL = '#';
    var FOOD = '.';
    var EMPTY = ' ';
    var DEMON = 'X';

    // 원본 main() 의 난이도 설정 그대로
    var LEVELS = {
        easy:   { name: '쉬움',   lives: 5, demonMoveEnabled: 0, wallCount: 0,  demonadd: 10, randomfood: 0,  visibilityRadius: 0 },
        normal: { name: '보통',   lives: 3, demonMoveEnabled: 1, wallCount: 5,  demonadd: 10, randomfood: 15, visibilityRadius: 0 },
        hard:   { name: '어려움', lives: 1, demonMoveEnabled: 1, wallCount: 10, demonadd: 20, randomfood: 25, visibilityRadius: 7 }
    };

    var canvas = document.getElementById('pacman');
    var ctx = canvas.getContext('2d');
    var CELL_W = 16;
    var CELL_H = 18;
    canvas.width = WIDTH * CELL_W;
    canvas.height = HEIGHT * CELL_H;

    var el = {
        score: document.getElementById('pm-score'),
        lives: document.getElementById('pm-lives'),
        food: document.getElementById('pm-food'),
        level: document.getElementById('pm-level')
    };

    var board, pacX, pacY, score, lives, food, totalFood, eaten, state, level, freeze;

    function rand(n) {
        return Math.floor(Math.random() * n);
    }

    // 원본 initialize() + placeFood()
    function initialize(d) {
        board = [];
        for (var i = 0; i < HEIGHT; i++) {
            board.push([]);
            for (var j = 0; j < WIDTH; j++) {
                if (i === 0 || i === HEIGHT - 1 || j === 0 || j === WIDTH - 1) {
                    board[i][j] = WALL;
                } else if (i > 1 && i < HEIGHT - 2 && j > 1 && j < WIDTH - 2 && rand(100) < 20) {
                    board[i][j] = WALL;
                } else {
                    board[i][j] = EMPTY;
                }
            }
        }

        // 악마 추가
        for (var k = 0; k < d.demonadd; k++) {
            while (true) {
                var y = rand(HEIGHT), x = rand(WIDTH);
                if (board[y][x] !== WALL && board[y][x] !== PACMAN && board[y][x] !== DEMON) {
                    board[y][x] = DEMON;
                    break;
                }
            }
        }

        // 중앙 벽 추가: 주변에 벽이 없는 칸에만
        var count = 20 + d.wallCount;
        while (count !== 0) {
            var a = rand(HEIGHT - 2) + 1, b = rand(WIDTH - 2) + 1;
            if (board[a][b] !== WALL && board[a][b] !== PACMAN &&
                board[a - 1][b] !== WALL && board[a + 1][b] !== WALL &&
                board[a][b - 1] !== WALL && board[a][b + 1] !== WALL) {
                board[a][b] = WALL;
                count--;
            }
        }

        // 팩맨 초기 위치: 판 가운데
        pacX = Math.floor(WIDTH / 2);
        pacY = Math.floor(HEIGHT / 2);
        board[pacY][pacX] = PACMAN;

        // 먹이 배치
        var foodCount = 50 + d.randomfood;
        totalFood = foodCount;
        while (foodCount !== 0) {
            var p = rand(HEIGHT - 2) + 1, q = rand(WIDTH - 2) + 1;
            if (board[p][q] !== WALL && board[p][q] !== DEMON && board[p][q] !== PACMAN && board[p][q] !== FOOD) {
                board[p][q] = FOOD;
                foodCount--;
            }
        }
    }

    // 웹 버전에서 추가: 무작위 벽에 갇혀 못 먹는 먹이가 없는 판만 쓴다
    function allFoodReachable() {
        var seen = {}, stack = [[pacY, pacX]], found = 0;
        seen[pacY + ',' + pacX] = true;
        while (stack.length) {
            var c = stack.pop();
            if (board[c[0]][c[1]] === FOOD) found++;
            [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (m) {
                var y = c[0] + m[0], x = c[1] + m[1], key = y + ',' + x;
                if (!seen[key] && board[y][x] !== WALL) {
                    seen[key] = true;
                    stack.push([y, x]);
                }
            });
        }
        return found === totalFood;
    }

    // 원본 moveDemon(): 반씩 확률로 2칸씩 점프 (벽, 팩맨, 먹이, 다른 악마 칸으로는 못 감)
    function moveDemon() {
        if (lives <= 0) return;
        if (freeze > 0) { freeze--; return; }
        var demons = [];
        for (var i = 0; i < HEIGHT; i++) {
            for (var j = 0; j < WIDTH; j++) {
                if (board[i][j] === DEMON) demons.push([i, j]);
            }
        }
        demons.forEach(function (dm) {
            if (rand(2) !== 0) return;
            for (var tries = 0; tries < 30; tries++) {
                var mx = (rand(3) - 1) * 2, my = (rand(3) - 1) * 2;
                var nx = dm[1] + mx, ny = dm[0] + my;
                if (nx < 0 || nx >= WIDTH || ny < 0 || ny >= HEIGHT) continue;
                var t = board[ny][nx];
                if (t === WALL || t === PACMAN || t === FOOD || t === DEMON) continue;
                board[dm[0]][dm[1]] = EMPTY;
                board[ny][nx] = DEMON;
                return;
            }
        });
    }

    // 원본 move()
    function move(dx, dy) {
        var x = pacX + dx, y = pacY + dy;
        if (board[y][x] === WALL) return;
        var original = board[y][x];
        if (original === FOOD) {
            score++;
            food--;
            eaten++;
            if (food === 0) state = 'win';
        } else if (original === DEMON) {
            lives--;
            freeze = 3;
            flash = 8;
            if (lives === 0) state = 'dead';
        }
        board[pacY][pacX] = EMPTY;
        pacX = x;
        pacY = y;
        board[pacY][pacX] = PACMAN;
    }

    var flash = 0;

    // 원본 draw(): 콘솔 색 그대로 (팩맨 노랑 14, 악마 빨강 12, 벽 파랑 9)
    var COLORS = { 'C': '#ffff55', 'X': '#ff5555', '#': '#5555ff', '.': '#c0c0c0' };

    function draw() {
        if (state === 'menu' || !level) {
            menu();
            updateStats();
            return;
        }
        ctx.fillStyle = flash > 0 && flash % 2 ? '#3a0000' : '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 17px Consolas, "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var fog = level.demonMoveEnabled === 1 && level.visibilityRadius > 0;
        for (var i = 0; i < HEIGHT; i++) {
            for (var j = 0; j < WIDTH; j++) {
                var c = board[i][j];
                if (c === EMPTY) continue;
                if (fog && Math.abs(pacX - j) + Math.abs(pacY - i) > level.visibilityRadius) continue;
                // 원본은 어려움에서 벽을 회색으로 찍었음
                ctx.fillStyle = (fog && c === WALL) ? '#c0c0c0' : COLORS[c];
                ctx.fillText(c, j * CELL_W + CELL_W / 2, i * CELL_H + CELL_H / 2 + 1);
            }
        }
        if (flash > 0) flash--;
        if (state === 'win' || state === 'dead') banner(state === 'win' ? 'You Win!' : 'Game Over! Dead by Demon', 'Score: ' + score + '   ·   R 키 또는 다시 하기');
        updateStats();
    }

    function banner(title, sub) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
        ctx.fillRect(0, canvas.height / 2 - 70, canvas.width, 140);
        ctx.fillStyle = state === 'win' ? '#ffff55' : '#ff5555';
        ctx.font = 'bold 38px Consolas, monospace';
        ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Pretendard, sans-serif';
        ctx.fillText(sub, canvas.width / 2, canvas.height / 2 + 26);
    }

    // 원본 시작 메뉴 화면
    function menu() {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var lines = [
            '┏━━━━━━━━━━━━━━━━━━━━━━┓',
            '┃   ▤▤ 팩맨 게임 ▤▤   ┃',
            '┃  ▤▤  난이도 선택  ▤▤ ┃',
            '┃                      ┃',
            '┃     1. 쉬    움      ┃',
            '┃     2. 보    통      ┃',
            '┃     3. 어 려 움      ┃',
            '┗━━━━━━━━━━━━━━━━━━━━━━┛'
        ];
        ctx.fillStyle = '#c0c0c0';
        ctx.font = '22px Consolas, "Malgun Gothic", monospace';
        lines.forEach(function (l, n) {
            ctx.fillText(l, canvas.width / 2, 120 + n * 34);
        });
        ctx.fillStyle = '#ffff55';
        ctx.font = '18px Pretendard, sans-serif';
        ctx.fillText('1 · 2 · 3 키를 누르거나 위의 난이도 버튼을 고르세요', canvas.width / 2, 440);
    }

    function updateStats() {
        el.level.textContent = level ? level.name : '-';
        el.score.textContent = score || 0;
        el.lives.textContent = lives === undefined ? '-' : lives;
        el.food.textContent = state === 'menu' ? '-' : eaten + ' / ' + totalFood;
    }

    function start(key) {
        level = LEVELS[key];
        do { initialize(level); } while (!allFoodReachable());
        score = 0;
        eaten = 0;
        food = totalFood;
        lives = level.lives;
        freeze = 0;
        state = 'play';
        document.querySelectorAll('[data-level]').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.getAttribute('data-level') === key));
        });
        draw();
        canvas.focus({ preventScroll: true });
    }

    function step(dx, dy) {
        if (state !== 'play') return;
        move(dx, dy);
        if (state === 'play' && level.demonMoveEnabled === 1) moveDemon();
        draw();
    }

    var KEYS = {
        w: [0, -1], ArrowUp: [0, -1],
        s: [0, 1], ArrowDown: [0, 1],
        a: [-1, 0], ArrowLeft: [-1, 0],
        d: [1, 0], ArrowRight: [1, 0]
    };

    canvas.addEventListener('keydown', function (e) {
        var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (KEYS[k]) {
            e.preventDefault();
            step(KEYS[k][0], KEYS[k][1]);
        } else if (k === '1' || k === '2' || k === '3') {
            start(['easy', 'normal', 'hard'][Number(k) - 1]);
        } else if (k === 'r' && level) {
            start(Object.keys(LEVELS).filter(function (n) { return LEVELS[n] === level; })[0]);
        } else if (k === 'q') {
            state = 'menu';
            draw();
        }
    });

    canvas.addEventListener('pointerdown', function () {
        canvas.focus({ preventScroll: true });
    });

    document.querySelectorAll('[data-level]').forEach(function (b) {
        b.addEventListener('click', function () { start(b.getAttribute('data-level')); });
    });

    document.querySelectorAll('[data-move]').forEach(function (b) {
        b.addEventListener('click', function () {
            var m = KEYS[b.getAttribute('data-move')];
            step(m[0], m[1]);
        });
    });

    state = 'menu';
    level = null;
    draw();
})();
