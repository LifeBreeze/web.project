/* =========================================================
 * chess.js - chess_plus.c(콘솔 체스 PLUS)를 웹으로 옮긴 버전
 * 규칙 검사 함수는 C 코드를 한 줄씩 그대로 옮겼다.
 * 콘솔의 명령어(e2, e2e4, show e2, undo, save, resign, draw, help)도 그대로 쓸 수 있고,
 * 판을 눌러서 둘 수도 있다.
 * ========================================================= */
(function () {
    'use strict';

    var SIZE = 8;
    var WHITE = 0, BLACK = 1;
    var EMPTY = 0, PAWN = 1, ROOK = 2, KNIGHT = 3, BISHOP = 4, QUEEN = 5, KING = 6;
    var MAX_MOVES = 512;
    var KIBO_KEY = 'life1008-chess-kibo';

    var pieceLetters = ' PRNBQK';
    var pieceValue = [0, 1, 5, 3, 3, 9, 0];
    var pieceKo = ['', '폰', '룩', '나이트', '비숍', '퀸', '킹'];
    var colorNames = ['백', '흑'];

    var boardEl = document.getElementById('chess-board');
    var logEl = document.getElementById('chess-log');
    var formEl = document.getElementById('chess-form');
    var inputEl = document.getElementById('chess-input');
    var promptEl = document.getElementById('chess-prompt');
    var quickEl = document.getElementById('chess-quick');
    var turnEl = document.getElementById('ch-turn');
    var clockEl = document.getElementById('ch-clock');
    var capEl = document.getElementById('chess-captured');
    if (!boardEl) return;

    /* ---------- 게임 상태 (C의 GameState 구조체) ---------- */
    var game;
    var history = [];
    var moveLog = [];
    var playerNames = ['White', 'Black'];
    var timeLimit = 0;
    var timeLeft = [0, 0];
    var timer = null;

    /* 화면 상태: play 대국 중, promo 승격 고르는 중, setup 이름 입력 중,
       saveask 끝나고 저장 여부, over 끝남, replay 기보 다시 보기 */
    var mode = 'over';
    var selected = null;     /* 고른 말 {x, y} */
    var marks = null;        /* 갈 수 있는 칸 */
    var pending = null;      /* 승격을 기다리는 수 */
    var setup = null;        /* 새 게임 입력 단계 */
    var replay = null;       /* 기보 다시 보기 */

    function P(type, color, moved) { return { type: type, color: color, hasMoved: !!moved }; }
    function emptyBoard() {
        var b = [];
        for (var i = 0; i < SIZE; i++) {
            b.push([]);
            for (var j = 0; j < SIZE; j++) b[i].push(P(EMPTY, WHITE, false));
        }
        return b;
    }
    function copyState(s) {
        return {
            board: s.board.map(function (r) { return r.map(function (p) { return P(p.type, p.color, p.hasMoved); }); }),
            turn: s.turn,
            enPassantAvailable: s.enPassantAvailable,
            enPassantX: s.enPassantX,
            enPassantY: s.enPassantY,
            captured: [s.captured[0].slice(), s.captured[1].slice()]
        };
    }

    function initGame() {
        game = { board: emptyBoard(), turn: WHITE, enPassantAvailable: false, enPassantX: -1, enPassantY: -1, captured: [[], []] };
        var back = [ROOK, KNIGHT, BISHOP, QUEEN, KING, BISHOP, KNIGHT, ROOK];
        for (var i = 0; i < SIZE; i++) {
            game.board[1][i] = P(PAWN, BLACK);
            game.board[6][i] = P(PAWN, WHITE);
            game.board[0][i] = P(back[i], BLACK);
            game.board[7][i] = P(back[i], WHITE);
        }
        history = [];
        moveLog = [];
    }

    /* "e2" -> x = 행(0이 8번 줄), y = 열(0이 a) */
    function parseSquare(s) {
        if (!s || s.length < 2) return null;
        var col = s.toLowerCase().charCodeAt(0) - 97;
        var row = 8 - (s.charCodeAt(1) - 48);
        if (col < 0 || col >= 8 || row < 0 || row >= 8) return null;
        return { x: row, y: col };
    }
    function squareName(x, y) { return String.fromCharCode(97 + y) + (8 - x); }

    /* ---------- 이동 규칙 (C 코드 그대로) ---------- */
    function isPathClear(sx, sy, dx, dy) {
        var stepX = dx - sx ? (dx - sx) / Math.abs(dx - sx) : 0;
        var stepY = dy - sy ? (dy - sy) / Math.abs(dy - sy) : 0;
        sx += stepX; sy += stepY;
        while (sx !== dx || sy !== dy) {
            if (game.board[sx][sy].type !== EMPTY) return false;
            sx += stepX; sy += stepY;
        }
        return true;
    }

    function isValidMove(sx, sy, dx, dy) {
        var src = game.board[sx][sy], dest = game.board[dx][dy];
        if (src.type === EMPTY) return false;
        if (sx === dx && sy === dy) return false;
        if (dest.type !== EMPTY && dest.color === src.color) return false;
        var dxAbs = Math.abs(dx - sx), dyAbs = Math.abs(dy - sy);

        switch (src.type) {
        case PAWN:
            if (src.color === WHITE) {
                if (sx - dx === 1 && sy === dy && dest.type === EMPTY) return true;
                if (sx === 6 && dx === 4 && sy === dy && dest.type === EMPTY && game.board[5][sy].type === EMPTY) return true;
                if (sx - dx === 1 && dyAbs === 1 && dest.type !== EMPTY && dest.color === BLACK) return true;
                if (sx === 3 && dx === 2 && dyAbs === 1 && game.enPassantAvailable && dx === game.enPassantX && dy === game.enPassantY) return true;
            } else {
                if (dx - sx === 1 && sy === dy && dest.type === EMPTY) return true;
                if (sx === 1 && dx === 3 && sy === dy && dest.type === EMPTY && game.board[2][sy].type === EMPTY) return true;
                if (dx - sx === 1 && dyAbs === 1 && dest.type !== EMPTY && dest.color === WHITE) return true;
                if (sx === 4 && dx === 5 && dyAbs === 1 && game.enPassantAvailable && dx === game.enPassantX && dy === game.enPassantY) return true;
            }
            break;
        case ROOK:
            if (sx === dx || sy === dy) return isPathClear(sx, sy, dx, dy);
            break;
        case KNIGHT:
            if ((dxAbs === 2 && dyAbs === 1) || (dxAbs === 1 && dyAbs === 2)) return true;
            break;
        case BISHOP:
            if (dxAbs === dyAbs) return isPathClear(sx, sy, dx, dy);
            break;
        case QUEEN:
            if ((dxAbs === dyAbs || sx === dx || sy === dy) && isPathClear(sx, sy, dx, dy)) return true;
            break;
        case KING:
            if (dxAbs <= 1 && dyAbs <= 1) return true;
            if (!src.hasMoved && dxAbs === 0 && dyAbs === 2) return canCastle(src.color, dy > sy ? 1 : 0);
            break;
        }
        return false;
    }

    function isSquareAttacked(x, y, by) {
        for (var i = 0; i < SIZE; i++) {
            for (var j = 0; j < SIZE; j++) {
                var p = game.board[i][j];
                if (p.type === EMPTY || p.color !== by) continue;
                var ax = Math.abs(x - i), ay = Math.abs(y - j);
                if (p.type === PAWN) {
                    var forward = by === WHITE ? -1 : 1;
                    if (x - i === forward && ay === 1) return true;
                } else if (p.type === KING) {
                    if (ax <= 1 && ay <= 1 && ax + ay > 0) return true;
                } else if (isValidMove(i, j, x, y)) {
                    return true;
                }
            }
        }
        return false;
    }

    function isCheck(color) {
        for (var i = 0; i < SIZE; i++)
            for (var j = 0; j < SIZE; j++)
                if (game.board[i][j].type === KING && game.board[i][j].color === color)
                    return isSquareAttacked(i, j, color === WHITE ? BLACK : WHITE);
        return false;
    }

    function canCastle(color, side) {
        var row = color === WHITE ? 7 : 0;
        var enemy = color === WHITE ? BLACK : WHITE;
        var king = game.board[row][4];
        if (king.type !== KING || king.color !== color || king.hasMoved) return false;
        if (side === 1) {
            if (game.board[row][7].type !== ROOK || game.board[row][7].hasMoved) return false;
            if (game.board[row][5].type !== EMPTY || game.board[row][6].type !== EMPTY) return false;
        } else {
            if (game.board[row][0].type !== ROOK || game.board[row][0].hasMoved) return false;
            if (game.board[row][1].type !== EMPTY || game.board[row][2].type !== EMPTY || game.board[row][3].type !== EMPTY) return false;
        }
        if (isSquareAttacked(row, 4, enemy)) return false;
        if (isSquareAttacked(row, side === 1 ? 5 : 3, enemy)) return false;
        return true;
    }

    function doMove(sx, sy, dx, dy) {
        var b = game.board;
        var src = b[sx][sy], dest = b[dx][dy];
        var captured = P(dest.type, dest.color, dest.hasMoved);

        if (src.type === PAWN && dy !== sy && dest.type === EMPTY &&
            game.enPassantAvailable && dx === game.enPassantX && dy === game.enPassantY) {
            var cx = src.color === WHITE ? dx + 1 : dx - 1;
            captured = P(b[cx][dy].type, b[cx][dy].color, true);
            b[cx][dy] = P(EMPTY, WHITE);
        }
        if (src.type === KING && Math.abs(dy - sy) === 2) {
            if (dy > sy) { b[sx][5] = P(ROOK, src.color, true); b[sx][7] = P(EMPTY, WHITE); }
            else { b[sx][3] = P(ROOK, src.color, true); b[sx][0] = P(EMPTY, WHITE); }
        }
        b[dx][dy] = P(src.type, src.color, true);
        b[sx][sy] = P(EMPTY, WHITE);

        if (src.type === PAWN && Math.abs(dx - sx) === 2) {
            game.enPassantAvailable = true;
            game.enPassantX = (sx + dx) / 2;
            game.enPassantY = dy;
        } else {
            game.enPassantAvailable = false;
        }
        return captured;
    }

    function isLegalMove(sx, sy, dx, dy) {
        if (!isValidMove(sx, sy, dx, dy)) return false;
        var mover = game.board[sx][sy].color;
        var backup = copyState(game);
        doMove(sx, sy, dx, dy);
        var ok = !isCheck(mover);
        game = backup;
        return ok;
    }

    function hasAnyLegalMove(color) {
        for (var i = 0; i < SIZE; i++)
            for (var j = 0; j < SIZE; j++) {
                if (game.board[i][j].type === EMPTY || game.board[i][j].color !== color) continue;
                for (var x = 0; x < SIZE; x++)
                    for (var y = 0; y < SIZE; y++)
                        if (isLegalMove(i, j, x, y)) return true;
            }
        return false;
    }

    /* "e2e4" 또는 "e7e8q". 성공 true, 승격할 말을 물어봐야 하면 'promo' */
    function movePiece(input, interactive) {
        var len = input.length;
        if (len !== 4 && len !== 5) return false;
        var s = parseSquare(input.slice(0, 2)), d = parseSquare(input.slice(2, 4));
        if (!s || !d) return false;
        var src = game.board[s.x][s.y];
        if (src.type === EMPTY || src.color !== game.turn) return false;
        if (!isValidMove(s.x, s.y, d.x, d.y)) return false;

        var backup = copyState(game);
        var captured = doMove(s.x, s.y, d.x, d.y);
        if (isCheck(game.turn)) {
            game = backup;
            if (interactive) print('자기 킹이 체크 상태가 되는 수는 둘 수 없습니다.');
            return false;
        }

        var promo = '';
        if (game.board[d.x][d.y].type === PAWN && (d.x === 0 || d.x === 7)) {
            promo = len === 5 ? input.charAt(4).toLowerCase() : '';
            if (!promo && interactive) {
                /* 콘솔에서는 여기서 입력을 기다린다. 웹에서는 상태를 되돌려 두고 고른 뒤 다시 둔다 */
                game = backup;
                return 'promo';
            }
            var t = { r: ROOK, b: BISHOP, n: KNIGHT }[promo];
            if (!t) { t = QUEEN; promo = 'q'; }
            game.board[d.x][d.y].type = t;
        }

        if (captured.type !== EMPTY) game.captured[game.turn].push(captured.type);

        if (moveLog.length < MAX_MOVES) {
            history.push(backup);
            moveLog.push(input.slice(0, 4).toLowerCase() + promo);
        }
        game.turn = game.turn === WHITE ? BLACK : WHITE;
        return true;
    }

    function undoMove() {
        if (!history.length) return false;
        game = history.pop();
        moveLog.pop();
        return true;
    }

    /* ---------- 출력 ---------- */
    function print(text, cls) {
        var line = document.createElement('div');
        line.textContent = text;
        if (cls) line.className = cls;
        logEl.appendChild(line);
        while (logEl.childNodes.length > 300) logEl.removeChild(logEl.firstChild);
        logEl.scrollTop = logEl.scrollHeight;
    }

    function printHelp() {
        print('[명령어]', 'c-cyan');
        print('  e2      e2의 말을 골라 갈 수 있는 칸 보기 -> 이어서 도착 칸(e4) 입력');
        print('  e2e4    바로 옮기기 (e7e8q 처럼 끝에 q/r/b/n을 붙이면 프로모션)');
        print('  undo    한 수 무르기');
        print('  save    지금까지의 기보 저장');
        print('  resign  기권      draw  무승부');
        print('  help    도움말');
        print('[말] P 폰  R 룩  N 나이트  B 비숍  Q 퀸  K 킹  (W 백, B 흑)');
    }

    function scoreOf(c) {
        return game.captured[c].reduce(function (s, t) { return s + pieceValue[t]; }, 0);
    }

    function renderCaptured() {
        capEl.textContent = '';
        for (var c = WHITE; c <= BLACK; c++) {
            var row = document.createElement('p');
            var pieces = game.captured[c].map(function (t) { return (c === WHITE ? 'B' : 'W') + pieceLetters[t]; }).join(' ');
            row.textContent = colorNames[c] + '(' + playerNames[c] + ')이 잡은 말: ' + (pieces || '없음') + '  (점수 ' + scoreOf(c) + ')';
            capEl.appendChild(row);
        }
        var w = scoreOf(WHITE), b = scoreOf(BLACK);
        if (w !== b) {
            var lead = document.createElement('p');
            lead.className = 'c-yellow';
            lead.textContent = '-> ' + colorNames[w > b ? WHITE : BLACK] + '이 ' + Math.abs(w - b) + '점 앞서 있습니다';
            capEl.appendChild(lead);
        }
    }

    var squares = [];
    function buildBoard() {
        boardEl.textContent = '';
        var files = 'abcdefgh';
        function label(text) {
            var s = document.createElement('span');
            s.className = 'cb-label';
            s.textContent = text;
            s.setAttribute('aria-hidden', 'true');
            boardEl.appendChild(s);
        }
        label('');
        for (var f = 0; f < 8; f++) label(files[f]);
        label('');
        for (var i = 0; i < SIZE; i++) {
            label(String(8 - i));
            squares.push([]);
            for (var j = 0; j < SIZE; j++) {
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'cb-sq';
                b.dataset.x = i;
                b.dataset.y = j;
                boardEl.appendChild(b);
                squares[i].push(b);
            }
            label(String(8 - i));
        }
        label('');
        for (f = 0; f < 8; f++) label(files[f]);
        label('');
    }

    function render() {
        for (var i = 0; i < SIZE; i++) {
            for (var j = 0; j < SIZE; j++) {
                var p = game.board[i][j];
                var b = squares[i][j];
                var text = p.type === EMPTY ? '' : (p.color === WHITE ? 'W' : 'B') + pieceLetters[p.type];
                var cls = 'cb-sq ' + ((i + j) % 2 === 0 ? 'is-light' : 'is-dark');
                if (p.type !== EMPTY) cls += p.color === WHITE ? ' is-white' : ' is-black';
                if (selected && selected.x === i && selected.y === j) {
                    cls += ' is-sel';
                    text = '(' + text + ')';
                } else if (marks && marks[i][j]) {
                    if (p.type === EMPTY) { cls += ' is-move'; text = '**'; }
                    else { cls += ' is-take'; text = '[' + text + ']'; }
                }
                b.className = cls;
                b.textContent = text;
                var name = squareName(i, j);
                b.setAttribute('aria-label', p.type === EMPTY ? name : name + ' ' + colorNames[p.color] + ' ' + pieceKo[p.type]);
            }
        }
        renderCaptured();
        var me = game.turn;
        turnEl.textContent = mode === 'replay' ? '기보 다시 보기' : (mode === 'over' || mode === 'saveask') ? '대국 끝' : playerNames[me] + '(' + colorNames[me] + ')';
        renderClock();
        renderPrompt();
    }

    function fmt(sec) { return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2); }
    function renderClock() {
        clockEl.textContent = timeLimit > 0 ? colorNames[WHITE] + ' ' + fmt(timeLeft[WHITE]) + ' / ' + colorNames[BLACK] + ' ' + fmt(timeLeft[BLACK]) : '없음';
    }

    function renderPrompt() {
        var me = game.turn;
        quickEl.textContent = '';
        if (mode === 'play') promptEl.textContent = playerNames[me] + '(' + colorNames[me] + ') 차례 >';
        else if (mode === 'pick') {
            promptEl.textContent = '어디로 옮길까요? (취소: Enter) >';
            quick('Enter 취소', '');
        }
        else if (mode === 'promo') {
            promptEl.textContent = '승격할 말 >';
            [['q', '퀸'], ['r', '룩'], ['b', '비숍'], ['n', '나이트']].forEach(function (o) {
                quick(o[0] + ' ' + o[1], o[0]);
            });
        } else if (mode === 'setup') promptEl.textContent = setup.ask;
        else if (mode === 'saveask') {
            promptEl.textContent = '기보 저장 (y/n) >';
            quick('y 저장', 'y');
            quick('n 안 함', 'n');
        } else if (mode === 'replay') {
            promptEl.textContent = '다음 수 >';
            quick('Enter 다음 수', '');
            quick('q 그만 보기', 'q');
        } else promptEl.textContent = '>';
    }

    function quick(label, value) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'stage-btn';
        b.textContent = label;
        b.addEventListener('click', function () { submit(value); });
        quickEl.appendChild(b);
    }

    /* ---------- 대국 진행 ---------- */
    function startGame(names, limitMin) {
        playerNames = names;
        timeLimit = Math.max(0, limitMin * 60);
        timeLeft = [timeLimit, timeLimit];
        initGame();
        selected = marks = pending = null;
        mode = 'play';
        print('');
        print(playerNames[WHITE] + '(백) vs ' + playerNames[BLACK] + '(흑)' + (timeLimit ? ', 1인당 ' + limitMin + '분' : ''), 'c-cyan');
        startTurn();
    }

    /* C의 while 반복에서 한 바퀴 도는 앞부분: 끝났는지, 체크인지 확인 */
    function startTurn() {
        var me = game.turn, enemy = me === WHITE ? BLACK : WHITE;
        if (!hasAnyLegalMove(me)) {
            if (isCheck(me)) print('체크메이트! ' + playerNames[enemy] + '(' + colorNames[enemy] + ') 승리!', 'c-yellow');
            else print('스테일메이트! 둘 수 있는 수가 없어서 무승부입니다.', 'c-yellow');
            endGame();
            return;
        }
        if (isCheck(me)) print('체크! ' + colorNames[me] + '의 킹이 공격받고 있습니다.', 'c-red');
        render();
    }

    function endGame() {
        mode = 'saveask';
        selected = marks = null;
        print('기보를 저장할까요? (y/n)');
        render();
    }

    function afterMove() {
        var last = moveLog[moveLog.length - 1];
        var mover = game.turn === WHITE ? BLACK : WHITE;
        print(colorNames[mover] + ' ' + last, 'c-gray');
        selected = marks = null;
        startTurn();
    }

    function tryMove(input) {
        var r = movePiece(input, true);
        if (r === 'promo') {
            pending = input.slice(0, 4);
            mode = 'promo';
            print('폰을 무엇으로 바꿀까요? (q 퀸 / r 룩 / b 비숍 / n 나이트)');
            render();
            return true;
        }
        if (r) { afterMove(); return true; }
        return false;
    }

    /* 반환값: 갈 수 있는 칸 수 (잘못 고르면 -1) */
    function showMoves(square) {
        var s = parseSquare(square || '');
        if (!s) { print('칸 이름을 확인해 주세요. 예) e2'); return -1; }
        var p = game.board[s.x][s.y];
        if (p.type === EMPTY || p.color !== game.turn) { print('자기 말이 있는 칸을 골라 주세요.'); return -1; }
        return selectPiece(s.x, s.y, true);
    }

    function selectPiece(x, y, verbose) {
        var count = 0;
        marks = [];
        for (var i = 0; i < SIZE; i++) {
            marks.push([]);
            for (var j = 0; j < SIZE; j++) {
                var ok = isLegalMove(x, y, i, j);
                marks[i].push(ok);
                if (ok) count++;
            }
        }
        selected = { x: x, y: y };
        render();
        if (count === 0) print('이 말은 지금 움직일 수 없습니다.');
        else if (verbose) print('갈 수 있는 칸 ' + count + '개 ( ** 빈칸, [ ] 잡을 수 있는 말)');
        return count;
    }

    function saveKibo() {
        var text = playerNames[WHITE] + '\n' + playerNames[BLACK] + '\n' + moveLog.join('\n') + (moveLog.length ? '\n' : '');
        try {
            localStorage.setItem(KIBO_KEY, text);
            print(moveLog.length + '수를 kibo.txt 에 저장했습니다. (이 브라우저에 저장, 메뉴의 기보 다시 보기로 볼 수 있습니다)', 'c-green');
        } catch (e) {
            print('이 브라우저에서는 기보를 저장할 수 없습니다.', 'c-red');
        }
    }

    function startReplay() {
        var text = null;
        try { text = localStorage.getItem(KIBO_KEY); } catch (e) { text = null; }
        if (!text) {
            print('kibo.txt 파일이 없습니다. 게임 중에 save 로 먼저 저장해 주세요.', 'c-red');
            return;
        }
        var lines = text.split('\n');
        initGame();
        timeLimit = 0;
        playerNames = [lines[0] || 'White', lines[1] || 'Black'];
        replay = { moves: lines.slice(2).filter(function (l) { return l.trim(); }), n: 0 };
        mode = 'replay';
        selected = marks = null;
        print('');
        print('[기보 다시 보기] ' + playerNames[WHITE] + '(백) vs ' + playerNames[BLACK] + '(흑)', 'c-cyan');
        replayAsk();
    }

    function replayAsk() {
        if (replay.n >= replay.moves.length) { stopReplay(); return; }
        print('Enter: 다음 수 (' + (replay.n + 1) + '수째 ' + replay.moves[replay.n] + ')   q: 그만 보기');
        render();
    }

    function stopReplay() {
        print('기보 다시 보기를 마칩니다. (' + replay.n + '수)');
        replay = null;
        mode = 'over';
        render();
    }

    /* ---------- 입력 처리 ---------- */
    function submit(raw) {
        var line = String(raw).trim();
        if (mode === 'setup') { setupStep(line); return; }
        if (mode !== 'over') print(promptEl.textContent + ' ' + line, 'c-echo');

        if (mode === 'promo') {
            var c = line.charAt(0).toLowerCase();
            var input = pending + ('qrbn'.indexOf(c) >= 0 && c ? c : 'q');
            pending = null;
            mode = 'play';
            if (movePiece(input, false)) afterMove();
            return;
        }
        if (mode === 'saveask') {
            if (line.charAt(0).toLowerCase() === 'y') saveKibo();
            mode = 'over';
            print('새 게임을 누르면 다시 시작합니다.', 'c-gray');
            render();
            return;
        }
        if (mode === 'replay') {
            if (line.charAt(0) === 'q') { stopReplay(); return; }
            var mv = replay.moves[replay.n];
            if (!movePiece(mv, false)) {
                print('기보에 둘 수 없는 수가 있습니다: ' + mv, 'c-red');
                stopReplay();
                return;
            }
            replay.n++;
            replayAsk();
            return;
        }
        /* [추가 ②] "e2"로 말을 고른 뒤: 도착 칸을 받아 "e2" + "e4" → "e2e4" */
        if (mode === 'pick') {
            var dest = (line.split(/\s+/)[0] || '').slice(0, 5).toLowerCase();
            mode = 'play';
            if (!dest) { selected = marks = null; render(); return; }   /* 취소 */
            if (!tryMove(squareName(selected.x, selected.y) + dest)) {
                selected = marks = null;
                render();
                print('그 칸으로는 갈 수 없습니다. 다시 골라 주세요.', 'c-red');
            }
            return;
        }
        if (mode !== 'play') {
            print('새 게임 버튼을 눌러 주세요.', 'c-gray');
            return;
        }

        var parts = line.split(/\s+/);
        var cmd = (parts[0] || '').toLowerCase(), arg = parts[1] || '';
        var me = game.turn, enemy = me === WHITE ? BLACK : WHITE;
        if (!cmd) return;
        if (cmd.length === 2) {                   /* "e2"처럼 칸만 입력 */
            if (showMoves(cmd) > 0) { mode = 'pick'; render(); }
            else { selected = marks = null; render(); }
            return;
        }
        if (cmd === 'help') printHelp();
        else if (cmd === 'resign') {
            print(colorNames[me] + ' 기권. ' + playerNames[enemy] + '(' + colorNames[enemy] + ') 승리!', 'c-yellow');
            endGame();
        } else if (cmd === 'draw') {
            print('무승부로 끝냅니다.', 'c-yellow');
            endGame();
        } else if (cmd === 'show') showMoves(arg);
        else if (cmd === 'undo') {
            if (undoMove()) { print('한 수 물렀습니다.'); selected = marks = null; render(); }
            else print('무를 수가 없습니다.');
        } else if (cmd === 'save') saveKibo();
        else if (!tryMove(cmd)) print('둘 수 없는 수입니다. (도움말: help)', 'c-red');
    }

    /* 새 게임: 콘솔처럼 이름과 제한 시간을 차례로 묻는다 */
    function beginSetup() {
        stopReplayIfAny();
        mode = 'setup';
        selected = marks = null;
        setup = { step: 0, names: [], ask: '백 플레이어 이름:' };
        print('');
        print('백 플레이어 이름을 입력하세요. (그냥 Enter = White)', 'c-cyan');
        render();
        inputEl.focus();
    }

    function setupStep(line) {
        print(setup.ask + ' ' + line, 'c-echo');
        if (setup.step === 0) {
            setup.names[WHITE] = line.slice(0, 49) || 'White';
            setup.step = 1;
            setup.ask = '흑 플레이어 이름:';
            print('흑 플레이어 이름을 입력하세요. (그냥 Enter = Black)', 'c-cyan');
        } else if (setup.step === 1) {
            setup.names[BLACK] = line.slice(0, 49) || 'Black';
            setup.step = 2;
            setup.ask = '1인당 제한 시간(분, 0 = 없음):';
            print('1인당 제한 시간(분)을 입력하세요. (0 = 없음)', 'c-cyan');
        } else {
            var min = parseInt(line, 10);
            if (isNaN(min) || min < 0) min = 0;
            if (min > 120) min = 120;
            var names = setup.names;
            setup = null;
            startGame(names, min);
            printHelp();
            return;
        }
        render();
    }

    function stopReplayIfAny() { replay = null; }

    /* [추가 ⑥] 제한 시간: 차례인 사람의 시간이 1초씩 줄어든다 */
    function tick() {
        if (timeLimit <= 0 || (mode !== 'play' && mode !== 'promo' && mode !== 'pick')) return;
        if (document.hidden) return;
        var me = game.turn, enemy = me === WHITE ? BLACK : WHITE;
        timeLeft[me]--;
        if (timeLeft[me] <= 0) {
            timeLeft[me] = 0;
            pending = null;
            print('시간 초과! ' + playerNames[enemy] + '(' + colorNames[enemy] + ') 승리!', 'c-yellow');
            endGame();
            return;
        }
        renderClock();
    }

    boardEl.addEventListener('click', function (e) {
        var b = e.target.closest('.cb-sq');
        if (!b || (mode !== 'play' && mode !== 'pick')) return;
        mode = 'play';
        var x = +b.dataset.x, y = +b.dataset.y;
        var p = game.board[x][y];
        if (selected && marks && marks[x][y]) {
            var input = squareName(selected.x, selected.y) + squareName(x, y);
            print(promptEl.textContent + ' ' + input, 'c-echo');
            tryMove(input);
            return;
        }
        if (selected && selected.x === x && selected.y === y) {
            selected = marks = null;
            render();
            return;
        }
        if (p.type !== EMPTY && p.color === game.turn) selectPiece(x, y, false);
        else if (selected) { selected = marks = null; render(); }
    });

    formEl.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = inputEl.value;
        inputEl.value = '';
        submit(v);
    });

    document.querySelectorAll('[data-chess]').forEach(function (b) {
        b.addEventListener('click', function () {
            var act = b.dataset.chess;
            if (act === 'new') beginSetup();
            else if (act === 'undo') { if (mode === 'play') submit('undo'); }
            else if (act === 'save') { if (mode === 'play' || mode === 'over') saveKibo(); }
            else if (act === 'replay') { if (mode !== 'setup') startReplay(); }
            else if (act === 'help') printHelp();
        });
    });

    buildBoard();
    print('===============================', 'c-cyan');
    print('         콘솔 체스 PLUS', 'c-cyan');
    print('===============================', 'c-cyan');
    print('바로 둘 수 있게 White(백) vs Black(흑), 제한 시간 없이 시작했습니다.', 'c-gray');
    print('이름과 제한 시간을 정하려면 새 게임을 누르세요.', 'c-gray');
    startGame(['White', 'Black'], 0);
    printHelp();
    timer = setInterval(tick, 1000);
})();
