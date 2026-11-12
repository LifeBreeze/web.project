/* =========================================================
 * vicarious.js - Vicarious(C 콘솔 인생 시뮬레이션)를 웹으로 옮긴 버전
 * life.c 와 main.c 를 함수 단위로 그대로 옮겼다.
 * 콘솔에서 입력을 기다리던 곳(readChoice, waitEnter)은 await 로 기다린다.
 * 데이터(종족, 직업, 사건)는 data.c 를 자동 변환한 vicarious-data.js 를 쓴다.
 * ========================================================= */
(function () {
    'use strict';

    var D = window.VIC_DATA;
    var termEl = document.getElementById('vic-term');
    var choiceEl = document.getElementById('vic-choices');
    var infoEl = document.getElementById('vic-info');
    var statEls = document.querySelectorAll('[data-stat]');
    var fastBtn = document.getElementById('vic-fast');
    var fileBtn = document.getElementById('vic-file');
    if (!D || !termEl) return;

    /* ---------- game.h 상수 ---------- */
    var STAT_COUNT = 5, RACE_COUNT = 10, JOB_COUNT = 27, MAX_NPC = 12, MAX_CHILD = 4, MAX_FRIEND = 3;
    var TWIN_COUNT = 4, NAME_COUNT = 8, ANY_STAGE = -2, COOLDOWN = 8, MAX_REPEAT = 3, ACH_COUNT = 8;
    var MAX_LOG = 100, TURNS = 80;
    var HEALTH = 0, HAPPY = 1, MONEY = 2, KNOW = 3, FAME = 4;
    var CHILD = 0, ADULT = 2, OLD = 3;
    var HUMAN = 0, GOBLIN = 2, VAMPIRE = 4, MERMAID = 8, SLIME = 9, BEAST = 7;
    var J_HEIR = 5;
    var R_NONE = 0, R_FATHER = 1, R_MOTHER = 2, R_SPOUSE = 3, R_CHILD = 4, R_FRIEND = 5, R_PARENT = 6, R_DEAD = 7;
    var F_NONE = 0, F_SHOP = 1, F_DEBT = 2, F_RETIRED = 3, FLAG_COUNT = 4;
    var A_LEADER = 0, A_SERIAN = 1, A_MARRY = 2, A_CHILD = 3, A_OLDAGE = 4, A_FAME = 5, A_RICH = 6, A_SPIRIT = 7;
    var C = { RANK_MID: 1, RANK_HIGH: 2, MARRIED: 3, FAME70: 4, POOR: 5, NOT_SERIAN: 6, HURT: 7, CANCHILD: 8, WORKING: 9, MONEY40: 10, FRIENDSLOT: 11 };
    var SP = { NONE: 0, SERIAN: 1, GAMBLE: 2, MARRY: 3, CHILD: 4, BUSINESS: 5, WAR: 6, INVENT: 7, BLACKMARKET: 8, DUEL: 9, WINTER: 10,
        CHALLENGE: 11, BLOOD: 12, GUILD: 13, BOOK: 14, CONTRACT: 15, LANDLOVE: 16, SPLIT: 17, ABSORB: 18, CAPTURE: 19, HEAL: 20,
        FRIEND: 21, SICKCHILD: 22, RIVAL: 23, DEBT: 24, DEBTFREE: 25, JOBLOSS: 26, RETIRE: 27 };

    /* ---------- data.c 배열을 구조체처럼 쓰기 ---------- */
    function five(a) { a = (a || []).slice(); while (a.length < STAT_COUNT) a.push(0); return a; }
    var statNames = D.statNames, stageNames = D.stageNames, genderNames = D.genderNames;
    var bloodNames = D.bloodNames, bloodBonus = D.bloodBonus, rankBonus = D.rankBonus, achieveNames = D.achieveNames;
    var raceNames = D.raceNames;
    var continents = D.continents.map(function (c) { return { name: c[0], area: c[1], mood: c[2], cause: c[3] }; });
    var races = D.races.map(function (r) {
        return { name: r[0], continent: r[1], group: r[2], leader: r[3], life: r[4], weight: r[5], bonus: five(r[6]), rank: r[7], deathCause: r[8], trait: r[9] };
    });
    var jobs = D.jobs.map(function (j) {
        return { name: j[0], race: j[1], rankReq: j[2], bonus: five(j[3]), randStat: j[4], randRange: j[5], risk: j[6], riskRate: j[7] };
    });
    var events = D.events.map(function (e) {
        return { name: e[0], text: e[1], race: e[2], stage: e[3], effect: five(e[4]), cond: e[5] || 0, special: e[6] || 0, once: e[7] || 0, npcRel: e[8] || 0, needFlag: e[9] || 0 };
    });
    var jobEvents = D.jobEvents.map(function (e) {
        return { job: e[0], name: e[1], text: e[2], effect: five(e[3]), once: e[4] || 0, option1: e[5] || '', rate: e[6] || 0,
            good: five(e[7]), goodText: e[8] || '', bad: five(e[9]), badText: e[10] || '', option2: e[11] || '', effect2: five(e[12]), text2: e[13] || '' };
    });
    var crises = D.crises.map(function (c) { return { cause: c[0], text: c[1] }; });

    /* ---------- 콘솔 출력 ---------- */
    var COLORS = { 7: '', 8: 'c-gray', 10: 'c-green', 11: 'c-cyan', 12: 'c-red', 14: 'c-yellow' };
    var WHITE = 7, GREEN = 10, CYAN = 11, RED = 12, YELLOW = 14;
    var color = WHITE, span = null, printedThisTurn = false;

    function setColor(c) { color = c; span = null; }
    function printf(text) {
        if (!text) return;
        if (!span) {
            span = document.createElement('span');
            if (COLORS[color]) span.className = COLORS[color];
            termEl.appendChild(span);
        }
        span.textContent += text;
        printedThisTurn = true;
        termEl.scrollTop = termEl.scrollHeight;
    }
    function trimTerm() {
        while (termEl.childNodes.length > 1500) termEl.removeChild(termEl.firstChild);
    }
    function pad4(n) { var s = String(n); while (s.length < 4) s = ' ' + s; return s; }
    function signed(n) { return (n >= 0 ? '+' : '') + n; }
    function idiv(a, b) { return Math.trunc(a / b); }
    function rnd(n) { return Math.floor(Math.random() * n); }
    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    /* ---------- 입력 기다리기 ---------- */
    var waiting = null;
    function clearChoices() { choiceEl.textContent = ''; }

    /* readChoice: 버튼이나 숫자 키로 고른다. labels 는 버튼 글자 */
    function readChoice(min, max, labels) {
        if (current) showInfo(current);
        setColor(YELLOW);
        printf('선택 > ');
        setColor(WHITE);
        clearChoices();
        return new Promise(function (resolve) {
            var done = false;
            function pick(n) {
                if (done) return;      /* 두 번 눌러도 한 번만 처리 */
                done = true;
                waiting = null;
                clearChoices();
                printf(n + '\n');
                resolve(n);
            }
            for (var n = min; n <= max; n++) {
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'stage-btn';
                b.textContent = n + ') ' + (labels && labels[n - min] ? labels[n - min] : n);
                b.addEventListener('click', pick.bind(null, n));
                choiceEl.appendChild(b);
            }
            waiting = { key: function (k) { var n = parseInt(k, 10); if (n >= min && n <= max) pick(n); } };
            choiceEl.firstChild.focus({ preventScroll: true });
        });
    }

    function waitEnter() {
        if (current) showInfo(current);
        setColor(8);
        printf('(계속하려면 Enter)');
        setColor(WHITE);
        clearChoices();
        return new Promise(function (resolve) {
            var done = false;
            function go() {
                if (done) return;
                done = true;
                waiting = null;
                clearChoices();
                printf('\n');
                resolve();
            }
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'stage-btn vic-continue';
            b.textContent = '계속 (Enter)';
            b.addEventListener('click', go);
            choiceEl.appendChild(b);
            waiting = { key: function (k) { if (k === 'Enter' || k === ' ') go(); } };
            b.focus({ preventScroll: true });
        });
    }

    document.addEventListener('keydown', function (e) {
        if (!waiting || e.ctrlKey || e.metaKey || e.altKey) return;
        var t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
        if (e.key === 'Enter' || e.key === ' ') {
            /* 버튼에 포커스가 있으면 브라우저가 클릭으로 처리한다 */
            if (t && t.tagName === 'BUTTON' && choiceEl.contains(t)) return;
            e.preventDefault();
        }
        waiting.key(e.key);
    });

    /* ---------- 기본 도구 함수 ---------- */
    function randInt(min, max) { return min + rnd(max - min + 1); }
    function chance(perMille) { return rnd(1000) < perMille; }

    function addStat(p, s, amount) {
        if (p.race === GOBLIN && s === MONEY) amount *= 2;
        p.stat[s] += amount;
        if (p.stat[s] > 100) p.stat[s] = 100;
        if (p.stat[s] < 0) p.stat[s] = 0;
    }
    function changeStat(p, s, amount) {
        if (amount === 0) return;
        addStat(p, s, amount);
        if (p.race === GOBLIN && s === MONEY) amount *= 2;
        setColor(amount > 0 ? GREEN : RED);
        printf('  ' + statNames[s] + signed(amount));
        setColor(WHITE);
    }
    function addLog(p, text) {
        if (p.logCount >= MAX_LOG) return;
        p.log.push('[' + pad4(p.age) + '세] ' + text);
        p.logCount++;
    }
    function giveAchieve(p, a) {
        if (p.achieve[a]) return;
        p.achieve[a] = 1;
        setColor(YELLOW);
        printf('  ★ 업적 달성: ' + achieveNames[a] + '\n');
        setColor(WHITE);
    }
    function die(p, cause) { p.alive = 0; p.deathCause = cause; }
    function getStage(p) {
        var ratio = idiv(p.age * 100, p.life);
        if (ratio < 15) return CHILD;
        if (ratio < 35) return 1;
        if (ratio < 70) return ADULT;
        return OLD;
    }
    function printStatus(p) {
        var parts = [];
        for (var i = 0; i < STAT_COUNT; i++) parts.push(statNames[i] + ' ' + (p.stat[i] < 10 ? '  ' : p.stat[i] < 100 ? ' ' : '') + p.stat[i]);
        printf(parts.join(' | ') + '\n');
    }
    function vary(amount) {
        if (amount === 0) return 0;
        var half = idiv(Math.abs(amount), 2);
        return amount + randInt(-half, half);
    }
    function pickCause(race, continent) {
        var r = rnd(5);
        if (r < 3) {
            if (continent === 2 && r === 2 && race !== VAMPIRE) r = 0;
            return continents[continent].cause[r];
        }
        if (r === 3) return races[race].deathCause;
        return '불의의 사고';
    }

    /* ---------- 가족·친구 ---------- */
    function nameUsed(p, name) {
        if (p.name === name) return 1;
        for (var i = 0; i < p.npcCount; i++) if (p.npc[i].name === name) return 1;
        for (i = 0; i < p.twin.length; i++) if (p.twin[i].name === name) return 1;
        return 0;
    }
    function pickName(p, race, gender) {
        var start = rnd(NAME_COUNT);
        for (var i = 0; i < NAME_COUNT; i++) {
            var idx = (start + i) % NAME_COUNT;
            if (gender !== 2 && idx % 2 !== gender) continue;
            if (!nameUsed(p, raceNames[race][idx])) return raceNames[race][idx];
        }
        return raceNames[race][start];
    }
    function addNpc(p, relation, race, gender, age) {
        if (p.npcCount >= MAX_NPC) return -1;
        var n = { name: '', relation: relation, race: race, gender: gender, age: age, alive: 1, cause: '' };
        n.name = pickName(p, race, gender);
        p.npc.push(n);
        return p.npcCount++;
    }
    function npcLabel(p, i) {
        var n = p.npc[i], title = '';
        switch (n.relation) {
        case R_FATHER: title = '아버지'; break;
        case R_MOTHER: title = n.race === SLIME ? '모체' : '어머니'; break;
        case R_SPOUSE: title = '배우자'; break;
        case R_CHILD: title = n.gender === 0 ? '아들' : (n.gender === 1 ? '딸' : '아이'); break;
        case R_FRIEND: title = '친구'; break;
        }
        if (n.race !== p.race) return title + ' ' + n.name + '(' + races[n.race].name + ')';
        return title + ' ' + n.name;
    }
    function matchRel(n, rel) {
        if (rel === R_DEAD) return !n.alive;
        if (!n.alive) return 0;
        if (rel === R_PARENT) return n.relation === R_FATHER || n.relation === R_MOTHER;
        return n.relation === rel;
    }
    function findNpc(p, rel) {
        var list = [];
        for (var i = 0; i < p.npcCount; i++) if (matchRel(p.npc[i], rel)) list.push(i);
        if (!list.length) return -1;
        return list[rnd(list.length)];
    }
    function countNpc(p, rel) {
        var n = 0;
        for (var i = 0; i < p.npcCount; i++) if (p.npc[i].relation === rel) n++;
        return n;
    }
    function partnerRace(p) {
        if (p.race === SLIME) return SLIME;
        if (rnd(100) < (p.inSerian ? 40 : 15)) {
            var r = rnd(RACE_COUNT);
            if (r !== SLIME) return r;
        }
        return p.race;
    }
    function friendRace(p) {
        if (rnd(100) < (p.inSerian ? 50 : 25)) return rnd(RACE_COUNT);
        return p.race;
    }
    function sameStageAge(p, race) { return idiv(p.age * races[race].life, p.life); }

    function createFamily(p) {
        p.siblings = rnd(5);
        if (p.race === SLIME) {
            addNpc(p, R_MOTHER, SLIME, 2, idiv(races[SLIME].life * randInt(20, 40), 100));
            return;
        }
        var pa = idiv(races[p.race].life * randInt(25, 40), 100);
        addNpc(p, R_FATHER, p.race, 0, pa + randInt(0, idiv(races[p.race].life, 20)));
        addNpc(p, R_MOTHER, p.race, 1, pa);
    }

    function ageNpcs(p, years) {
        for (var i = 0; i < p.npcCount; i++) {
            var n = p.npc[i];
            if (!n.alive) continue;
            n.age += years;
            var ratio = idiv(n.age * 100, races[n.race].life);
            if (n.race !== VAMPIRE && ratio >= 80 && chance((ratio - 75) * 20)) n.cause = '노환';
            else if (chance(2)) n.cause = pickCause(n.race, races[n.race].continent);
            else continue;

            n.alive = 0;
            var label = npcLabel(p, i), loss;
            setColor(CYAN);
            printf('[' + pad4(p.age) + '세] ');
            setColor(WHITE);
            printf(label + '이(가) ' + n.age + '세로 세상을 떠났다. (' + n.cause + ')');
            if (n.relation === R_CHILD) loss = 25;
            else if (n.relation === R_SPOUSE) loss = 20;
            else if (n.relation === R_FRIEND) loss = 10;
            else loss = 15;
            changeStat(p, HAPPY, -vary(loss));
            printf('\n');
            addLog(p, label + ' 세상을 떠남');
        }
    }

    /* ---------- 같은 날 태어난 이들 ---------- */
    function randomRaceJob(race) {
        var list = [];
        for (var i = 0; i < JOB_COUNT; i++) if (jobs[i].race === race) list.push(i);
        return list[rnd(list.length)];
    }
    function createTwins(p) {
        var used = [];
        used[p.race] = 1;
        p.twin = [];
        for (var i = 0; i < TWIN_COUNT; i++) {
            var race, pct;
            do { race = rnd(RACE_COUNT); } while (used[race]);
            used[race] = 1;
            var t = { name: '', race: race, job: 0, deathAge: 0, cause: '', alive: 1 };
            t.name = pickName(p, race, 2);
            p.twin.push(t);
            t.job = randomRaceJob(race);
            if (race === VAMPIRE) pct = randInt(10, 130);
            else if (rnd(100) < 70) pct = randInt(75, 110);
            else pct = randInt(3, 75);
            t.deathAge = idiv(races[race].life * pct, 100);
            if (t.deathAge < 1) t.deathAge = 1;
            if (race !== VAMPIRE && pct >= 75) t.cause = '노화';
            else t.cause = pickCause(race, races[race].continent);
        }
    }
    function twinStatus(p, i) {
        var t = p.twin[i];
        if (!t.alive) return t.deathAge + '세에 세상을 떠남 (' + t.cause + ')';
        var ratio = idiv(p.age * 100, races[t.race].life);
        if (ratio < 20) return '아직 어린아이';
        if (ratio >= 70) return '노년의 ' + jobs[t.job].name;
        return jobs[t.job].name;
    }
    function printTwins(p) {
        setColor(8);
        printf('같은 날 태어난 이들\n');
        for (var i = 0; i < TWIN_COUNT; i++)
            printf('  ' + p.twin[i].name + '(' + races[p.twin[i].race].name + '): ' + twinStatus(p, i) + '\n');
        setColor(WHITE);
    }
    function checkTwins(p) {
        for (var i = 0; i < TWIN_COUNT; i++) {
            var t = p.twin[i];
            if (!t.alive || t.deathAge > p.age) continue;
            t.alive = 0;
            setColor(8);
            printf('[' + pad4(p.age) + '세] 같은 날 태어난 ' + races[t.race].name + ' ' + t.name + '의 소식이 들려왔다. ' +
                t.deathAge + '세에 세상을 떠났다고 한다. (' + t.cause + ')\n');
            setColor(WHITE);
        }
    }

    /* ---------- 출생 ---------- */
    function newPerson() {
        return { name: '', race: 0, gender: 0, rank: 0, siblings: 0, continent: 0, bloodline: -1, stat: [0, 0, 0, 0, 0],
            age: 0, life: 1, stage: CHILD, job: -1, alive: 1, married: 0, inSerian: 0, onLand: 0, isLeader: 0, inGuild: 0,
            split: 0, generation: 1, turn: 0, warned: 0, jobChanges: 0, flag: [0, 0, 0, 0], npc: [], npcCount: 0, curNpc: 0,
            twin: [], eventUsed: events.map(function () { return 0; }), lastTurn: events.map(function () { return 0; }),
            jobEventUsed: jobEvents.map(function () { return 0; }), jobEventLast: jobEvents.map(function () { return 0; }),
            achieve: [0, 0, 0, 0, 0, 0, 0, 0], lastHarm: '', deathCause: '', log: [], logCount: 0 };
    }

    function createPerson() {
        var p = newPerson(), i, r, total = 0;
        for (i = 0; i < RACE_COUNT; i++) total += races[i].weight;
        r = rnd(total);
        for (i = 0; i < RACE_COUNT; i++) {
            if (r < races[i].weight) { p.race = i; break; }
            r -= races[i].weight;
        }
        p.continent = races[p.race].continent;
        p.gender = p.race === SLIME ? 2 : rnd(2);
        r = rnd(100);
        if (r < 5) p.rank = 0;
        else if (r < 25) p.rank = 1;
        else if (r < 75) p.rank = 2;
        else p.rank = 3;

        p.life = races[p.race].life;
        p.bloodline = -1;
        if (p.race === BEAST) {
            p.bloodline = rnd(4);
            if (p.bloodline === 3) p.life -= 10;
        }
        for (i = 0; i < STAT_COUNT; i++) {
            p.stat[i] = 50 + races[p.race].bonus[i];
            if (p.bloodline >= 0) p.stat[i] += bloodBonus[p.bloodline][i];
        }
        p.stat[MONEY] += rankBonus[p.rank];
        p.stat[FAME] += rankBonus[p.rank];
        for (i = 0; i < STAT_COUNT; i++) addStat(p, i, 0);

        p.age = 0;
        p.stage = CHILD;
        p.job = -1;
        p.alive = 1;
        p.generation = 1;
        p.name = pickName(p, p.race, p.gender);
        createFamily(p);
        createTwins(p);
        return p;
    }

    function createSplit(parent) {
        var child = newPerson(), i;
        child.race = SLIME;
        child.gender = 2;
        child.rank = parent.rank;
        child.continent = parent.continent;
        child.inSerian = parent.inSerian;
        child.bloodline = -1;
        child.life = races[SLIME].life;
        for (i = 0; i < STAT_COUNT; i++) child.stat[i] = idiv(parent.stat[i], 2) + 25;
        child.stage = CHILD;
        child.job = -1;
        child.alive = 1;
        child.generation = parent.generation + 1;
        i = addNpc(child, R_MOTHER, SLIME, 2, parent.age);
        child.npc[i].name = parent.name;
        child.npc[i].alive = 0;
        child.npc[i].cause = parent.deathCause;
        child.name = pickName(child, SLIME, 2);
        createTwins(child);
        return child;
    }

    function printBirth(p) {
        var r = races[p.race], c = continents[p.continent], i, line = '';
        setColor(CYAN);
        printf('\n========================================\n');
        if (p.generation > 1) printf(' 제 ' + p.generation + '세대 분열체\n');
        setColor(WHITE);
        printf(' 당신은 ' + c.name + '(' + c.mood + ')의 ' + r.name);
        if (p.bloodline >= 0) printf('(' + bloodNames[p.bloodline] + ' 혈통)');
        printf(' ' + genderNames[p.gender] + ',\n ' + r.group + '의 ' + r.rank[p.rank] + '(으)로 태어났습니다.\n');
        printf(' 이름     - ' + p.name + '\n');
        printf(' 종족 특성 - ' + r.trait + '\n');
        printf(' 기대 수명 - ' + p.life + '년\n');
        for (i = 0; i < p.npcCount; i++) {
            if (p.npc[i].alive) line += npcLabel(p, i) + '(' + p.npc[i].age + '세)  ';
            else line += npcLabel(p, i) + '(세상을 떠남)  ';
        }
        if (p.siblings > 0) line += '위로 형제자매 ' + p.siblings + '명';
        printf(' 가족     - ' + line + '\n');
        printf(' 같은 순간, 티아니어 곳곳에서 ' + TWIN_COUNT + '명이 함께 태어났습니다.\n   ');
        line = '';
        for (i = 0; i < TWIN_COUNT; i++)
            line += p.twin[i].name + '(' + races[p.twin[i].race].name + ', ' + continents[races[p.twin[i].race].continent].name + ')  ';
        printf(line + '\n');
        setColor(CYAN);
        printf('========================================\n');
        setColor(WHITE);
        printStatus(p);
        printf('\n');
    }

    /* ---------- 직업 ---------- */
    function jobText(idx) {
        var j = jobs[idx], s, t = j.name + '  (';
        for (s = 0; s < STAT_COUNT; s++) if (j.bonus[s] !== 0) t += ' ' + statNames[s] + signed(j.bonus[s]);
        if (j.randStat === -2) t += ' 아무 능력치±' + j.randRange;
        else if (j.randStat >= 0) t += ' ' + statNames[j.randStat] + '±' + j.randRange;
        return t + ' )';
    }
    function printJob(idx) {
        var j = jobs[idx];
        printf(jobText(idx));
        if (j.riskRate > 0) {
            setColor(RED);
            printf(' 위험: ' + j.risk);
            setColor(WHITE);
        }
        printf('\n');
    }

    async function chooseJob(p) {
        var options = [], list = [], i;
        for (i = 0; i < JOB_COUNT; i++) if (jobs[i].race === -1 && p.rank <= jobs[i].rankReq) list.push(i);
        options.push(list[rnd(list.length)]);
        for (i = 0; i < JOB_COUNT; i++) if (jobs[i].race === -2 && jobs[i].rankReq === p.rank) options.push(i);
        list = [];
        for (i = 0; i < JOB_COUNT; i++) if (jobs[i].race === p.race) list.push(i);
        if (options.length === 1) { options.push(list[0]); options.push(list[1]); }
        else options.push(list[rnd(2)]);

        setColor(CYAN);
        if (p.jobChanges === 0) printf('\n[' + pad4(p.age) + '세] 성인이 되었습니다. 직업을 고르세요.\n');
        else printf('\n[' + pad4(p.age) + '세] 새 일자리를 고르세요.\n');
        setColor(WHITE);
        for (i = 0; i < options.length; i++) {
            printf('  ' + (i + 1) + ') ');
            printJob(options[i]);
        }
        var pick = await readChoice(1, options.length, options.map(function (o) { return jobs[o].name; }));
        p.job = options[pick - 1];
        printf('  → ' + jobs[p.job].name + '의 길을 걷기 시작했다.\n');
        addLog(p, '직업: ' + jobs[p.job].name);
    }

    function applyJob(p) {
        var j = jobs[p.job], s;
        if (rnd(100) >= 30) return;
        for (s = 0; s < STAT_COUNT; s++) addStat(p, s, j.bonus[s]);
        if (j.randStat === -2) addStat(p, rnd(STAT_COUNT), randInt(-j.randRange, j.randRange));
        else if (j.randStat >= 0) addStat(p, j.randStat, randInt(-j.randRange, j.randRange));
    }

    /* 콘솔처럼 "  1) A  2) B" 를 찍고 고르게 한다 */
    function ask2(a, b) {
        printf('  1) ' + a + '  2) ' + b + '\n');
        return readChoice(1, 2, [a.replace(/ \(.*\)$/, ''), b.replace(/ \(.*\)$/, '')]);
    }

    /* ---------- 수장 도전 ---------- */
    async function tryLeader(p, deadly) {
        if (await ask2('도전한다', '물러선다') === 2) {
            printf('  → 때를 기다리기로 했다.\n');
            return;
        }
        var successRate = idiv(p.stat[FAME] + p.stat[HEALTH], 3) + 10;
        if (rnd(100) < successRate) {
            p.isLeader = 1;
            printf('  → 도전에 성공해 ' + races[p.race].leader + '의 자리에 올랐다!');
            changeStat(p, FAME, 20);
            printf('\n');
            addLog(p, races[p.race].leader + '의 자리에 올랐다');
            giveAchieve(p, A_LEADER);
        } else {
            printf('  → 도전에 실패했다.');
            if (deadly && rnd(2) === 0) {
                printf(' 패배의 대가는 목숨이었다.\n');
                die(p, races[p.race].deathCause);
                return;
            }
            changeStat(p, FAME, -20);
            if (deadly) {
                changeStat(p, HEALTH, -30);
                p.lastHarm = '대족장 도전 실패';
            }
            printf('\n');
            addLog(p, '수장 도전에 실패했다');
        }
    }

    /* ---------- 특별 사건 (선택지) ---------- */
    async function doSpecial(p, sp) {
        var s, i, r2, nm, label;
        switch (sp) {
        case SP.SERIAN:
            if (await ask2('세리안으로 떠난다', '고향에 남는다') === 1) {
                p.inSerian = 1;
                p.continent = 0;
                printf('  → 자유 교역 도시 세리안에 정착했다.');
                changeStat(p, HAPPY, 5);
                if (p.race !== HUMAN) changeStat(p, MONEY, -10);
                printf('\n');
                if (p.race === MERMAID) {
                    p.onLand = 1;
                    printf('  → 이제 육지에서 살아야 한다. 몸이 조금씩 마른다.\n');
                }
                addLog(p, '세리안으로 이주했다');
                giveAchieve(p, A_SERIAN);
            } else printf('  → 고향에 남기로 했다.\n');
            break;

        case SP.GAMBLE:
            if (await ask2('돈을 건다', '거절한다') === 1) {
                if (rnd(2)) { printf('  → 판돈을 쓸어 담았다!'); changeStat(p, MONEY, 15); }
                else {
                    printf('  → 가진 돈을 날렸다.');
                    changeStat(p, MONEY, -15);
                    if (rnd(100) < 40) { p.flag[F_DEBT] = 1; printf('  빚까지 지고 말았다.'); }
                }
                printf('\n');
            } else printf('  → 자리를 떴다.\n');
            break;

        case SP.MARRY: {
            r2 = partnerRace(p);
            var g = p.gender === 0 ? 1 : (p.gender === 1 ? 0 : 2);
            nm = pickName(p, r2, g);
            if (r2 !== p.race) printf('  상대는 ' + races[r2].name + ' ' + nm + '.\n');
            else printf('  상대는 ' + nm + '.\n');
            if (await ask2('결혼한다', '혼자 산다') === 1) {
                i = addNpc(p, R_SPOUSE, r2, g, sameStageAge(p, r2));
                if (i >= 0) p.npc[i].name = nm;
                p.married = 1;
                printf('  → ' + nm + '와(과) 평생을 약속했다.');
                changeStat(p, HAPPY, 15);
                printf('\n');
                addLog(p, nm + '와(과) 결혼했다');
                giveAchieve(p, A_MARRY);
            } else {
                printf('  → 혼자의 길을 택했다.');
                changeStat(p, HAPPY, -5);
                printf('\n');
            }
            break;
        }

        case SP.CHILD:
            i = addNpc(p, R_CHILD, p.race, p.race === SLIME ? 2 : rnd(2), 0);
            if (i >= 0) {
                label = npcLabel(p, i);
                printf('  → ' + label + '이(가) 태어났다.\n');
                addLog(p, label + ' 태어남');
            }
            giveAchieve(p, A_CHILD);
            break;

        case SP.BUSINESS:
            if (await ask2('투자한다', '거절한다') === 1) {
                if (rnd(2)) {
                    if (!p.flag[F_SHOP]) {
                        p.flag[F_SHOP] = 1;
                        printf('  → 사업이 번창해 내 가게를 차렸다!');
                        addLog(p, '가게를 차렸다');
                    } else printf('  → 가게 매출이 늘었다!');
                    changeStat(p, MONEY, 20);
                } else {
                    p.flag[F_DEBT] = 1;
                    printf('  → 사업이 망해 빚이 생겼다.');
                    changeStat(p, MONEY, -20);
                }
                printf('\n');
            } else printf('  → 신중하게 거절했다.\n');
            break;

        case SP.FRIEND:
            r2 = friendRace(p);
            i = addNpc(p, R_FRIEND, r2, r2 === SLIME ? 2 : rnd(2), sameStageAge(p, r2));
            if (i >= 0) {
                label = npcLabel(p, i);
                printf('  → ' + label + '와(과) 가까워졌다.\n');
                addLog(p, label + '와(과) 친구가 되었다');
            }
            break;

        case SP.SICKCHILD:
            label = npcLabel(p, p.curNpc);
            if (await ask2('이름난 치료사를 부른다 (재산이 든다)', '집에서 정성껏 돌본다') === 1) {
                printf('  → 치료를 받고 ' + label + '이(가) 나았다. 밤새 곁을 지켰다.');
                changeStat(p, MONEY, -randInt(10, 18));
            } else if (rnd(100) < 70) {
                printf('  → 며칠 밤을 새운 끝에 ' + label + '이(가) 기운을 되찾았다.');
                changeStat(p, HEALTH, -5);
            } else {
                printf('  → ' + label + '이(가) 끝내 눈을 뜨지 못했다.');
                p.npc[p.curNpc].alive = 0;
                p.npc[p.curNpc].cause = '병';
                changeStat(p, HAPPY, -vary(25));
                addLog(p, label + ' 세상을 떠남');
            }
            printf('\n');
            break;

        case SP.RIVAL:
            if (await ask2('값을 내려 버틴다', '가게를 접는다') === 1 && rnd(2)) {
                printf('  → 단골들이 다시 찾아와 고비를 넘겼다.');
                changeStat(p, FAME, 5);
            } else {
                printf('  → 결국 가게 문을 닫았다.');
                changeStat(p, MONEY, -15);
                p.flag[F_SHOP] = 0;
                addLog(p, '가게를 접었다');
            }
            printf('\n');
            break;

        case SP.DEBT:
            if (await ask2('밤낮없이 일해 갚는다', '가까운 이에게 도움을 청한다') === 1) {
                printf('  → 몸은 축났지만 빚이 조금 줄었다.');
                changeStat(p, HEALTH, -10);
                changeStat(p, MONEY, 8);
                p.lastHarm = '과로';
            } else {
                i = findNpc(p, R_PARENT);
                if (i < 0) i = findNpc(p, R_SPOUSE);
                if (i < 0) i = findNpc(p, R_FRIEND);
                if (i >= 0) {
                    printf('  → ' + npcLabel(p, i) + '이(가) 형편껏 돈을 모아 주었다.');
                    changeStat(p, MONEY, 12);
                    changeStat(p, FAME, -3);
                } else {
                    printf('  → 손을 내밀 곳이 없었다.');
                    changeStat(p, HAPPY, -5);
                }
            }
            printf('\n');
            break;

        case SP.DEBTFREE:
            p.flag[F_DEBT] = 0;
            printf('  → 모아 둔 돈으로 남은 빚을 갚았다.');
            changeStat(p, MONEY, -20);
            printf('\n');
            addLog(p, '빚을 모두 갚았다');
            break;

        case SP.JOBLOSS:
            addLog(p, '일자리를 잃었다 (' + jobs[p.job].name + ')');
            p.job = -1;
            p.jobChanges++;
            printf('  → 새 일자리를 찾아야 한다.\n');
            break;

        case SP.RETIRE:
            if (await ask2('은퇴한다', '계속 일한다') === 1) {
                p.flag[F_RETIRED] = 1;
                printf('  → 오랜 일을 내려놓았다.');
                changeStat(p, HAPPY, 10);
                addLog(p, '은퇴했다');
            } else {
                printf('  → 아직은 손을 놓고 싶지 않았다.');
                changeStat(p, MONEY, 5);
                changeStat(p, FAME, 3);
            }
            printf('\n');
            break;

        case SP.WAR:
            if (await ask2('징집에 응한다', '도망친다') === 1) {
                if (rnd(100) < 10) {
                    printf('  → 전장에서 돌아오지 못했다.\n');
                    die(p, '전쟁터에서 전사');
                    return;
                }
                printf('  → 살아 돌아와 공을 인정받았다.');
                changeStat(p, FAME, 10);
                changeStat(p, HEALTH, -20);
                p.lastHarm = '전쟁 부상';
                printf('\n');
                addLog(p, '전쟁에 나가 살아 돌아왔다');
            } else {
                printf('  → 탈영병이라는 낙인이 찍혔다.');
                changeStat(p, FAME, -15);
                printf('\n');
            }
            break;

        case SP.INVENT:
            if (rnd(2)) {
                printf('  → 대성공! 발명품이 팔려 나갔다.');
                changeStat(p, MONEY, 30);
                addLog(p, '발명품이 대박 났다');
            } else {
                printf('  → 펑! 발명품이 폭발했다.');
                changeStat(p, HEALTH, -20);
                p.lastHarm = '발명품 폭발';
            }
            printf('\n');
            break;

        case SP.BLACKMARKET:
            if (await ask2('거래한다', '거절한다') === 1) {
                printf('  → 짭짤했지만 소문이 났다.');
                changeStat(p, MONEY, 15);
                changeStat(p, FAME, -10);
                printf('\n');
            } else printf('  → 손을 내저었다.\n');
            break;

        case SP.DUEL:
            if (await ask2('받아들인다', '거부한다') === 1) {
                if (rnd(100) < p.stat[HEALTH]) {
                    printf('  → 결투에서 승리했다!');
                    changeStat(p, FAME, 15);
                    addLog(p, '결투에서 승리했다');
                } else {
                    printf('  → 결투에서 패배했다.');
                    changeStat(p, HEALTH, -25);
                    p.lastHarm = '결투';
                }
            } else {
                printf('  → 겁쟁이라는 소리를 들었다.');
                changeStat(p, FAME, -10);
            }
            printf('\n');
            break;

        case SP.WINTER:
            printf('  →');
            if (p.stat[MONEY] < 30) { printf(' 땔감 살 돈이 없어 꽁꽁 얼었다.'); changeStat(p, HEALTH, -25); }
            else { printf(' 모피를 껴입고 버텼다.'); changeStat(p, HEALTH, -15); }
            p.lastHarm = '동사';
            printf('\n');
            break;

        case SP.CHALLENGE:
            await tryLeader(p, 1);
            break;

        case SP.BLOOD:
            if (await ask2('피를 마신다', '참는다') === 1) {
                printf('  → 힘이 솟았지만 마음이 무겁다.');
                changeStat(p, HEALTH, 15);
                changeStat(p, HAPPY, -10);
            } else {
                printf('  → 이를 악물고 참았다.');
                changeStat(p, HEALTH, -10);
                p.lastHarm = '굶주림';
            }
            printf('\n');
            break;

        case SP.GUILD:
            if (await ask2('입단한다', '거절한다') === 1) {
                p.inGuild = 1;
                printf('  → 그림자 길드의 일원이 되었다. 배신을 조심해야 한다.');
                changeStat(p, MONEY, 15);
                printf('\n');
                addLog(p, '그림자 길드에 입단했다');
            } else printf('  → 그림자에서 한 걸음 물러났다.\n');
            break;

        case SP.BOOK:
            if (await ask2('펼쳐 읽는다', '덮어 둔다') === 1) {
                if (rnd(100) < p.stat[KNOW]) {
                    printf('  → 금지된 지식을 깨우쳤다.');
                    changeStat(p, KNOW, 20);
                    addLog(p, '금지된 마법을 익혔다');
                } else {
                    printf('  → 마법이 폭주했다!');
                    changeStat(p, HEALTH, -25);
                    p.lastHarm = '마법 폭주';
                }
                printf('\n');
            } else printf('  → 책을 깊숙이 숨겼다.\n');
            break;

        case SP.CONTRACT:
            if (await ask2('계약한다 (지식이 높을수록 성공)', '거절한다') === 1) {
                if (rnd(100) < p.stat[KNOW]) {
                    printf('  → 정령과 계약을 맺었다!');
                    for (s = 0; s < STAT_COUNT; s++) changeStat(p, s, 10);
                    addLog(p, '정령과 계약했다');
                    giveAchieve(p, A_SPIRIT);
                } else {
                    printf('  → 계약에 실패해 정령의 분노를 샀다.');
                    changeStat(p, HEALTH, -30);
                    p.lastHarm = '정령 계약 실패';
                }
                printf('\n');
            } else printf('  → 정령이 아쉬운 듯 사라졌다.\n');
            break;

        case SP.LANDLOVE:
            if (await ask2('육지로 올라간다', '바다에 남는다') === 1) {
                p.onLand = 1;
                printf('  → 사랑을 따라 육지로 올라갔다. 몸이 조금씩 마른다.');
                changeStat(p, HAPPY, 20);
                addLog(p, '사랑을 따라 육지로 올라갔다');
            } else {
                printf('  → 바다에 남아 이별했다.');
                changeStat(p, HAPPY, -10);
            }
            printf('\n');
            break;

        case SP.SPLIT:
            p.split = 1;
            addLog(p, '분열체가 생겼다');
            break;

        case SP.ABSORB:
            s = rnd(STAT_COUNT);
            printf('  →');
            changeStat(p, s, 15);
            printf('\n');
            break;

        case SP.CAPTURE:
            if (rnd(100) < p.stat[HEALTH]) {
                printf('  → 유리병을 깨고 탈출했다!');
                changeStat(p, HEALTH, -10);
                p.lastHarm = '포획';
                printf('\n');
            } else {
                printf('  → 탈출하지 못했다...\n');
                die(p, '마법사에게 포획');
            }
            break;

        case SP.HEAL:
            if (await ask2('치료를 받는다 (재산이 든다)', '그냥 버틴다') === 1) {
                printf('  → 치료를 받고 한결 가벼워졌다.');
                changeStat(p, MONEY, -randInt(8, 15));
                changeStat(p, HEALTH, randInt(20, 30));
                addLog(p, '치료사에게 치료를 받았다');
            } else {
                printf('  → 돈을 아끼기로 했다.');
                changeStat(p, HAPPY, -3);
            }
            printf('\n');
            break;
        }
    }

    /* ---------- 사건 ---------- */
    function checkCond(p, cond) {
        switch (cond) {
        case C.RANK_MID: return p.rank <= 2;
        case C.RANK_HIGH: return p.rank <= 1;
        case C.MARRIED: return p.married;
        case C.FAME70: return p.stat[FAME] >= 70 && !p.isLeader;
        case C.POOR: return p.rank === 3 || rnd(2);
        case C.NOT_SERIAN: return !p.inSerian;
        case C.HURT: return p.stat[HEALTH] < 60;
        case C.CANCHILD: return p.married && findNpc(p, R_SPOUSE) >= 0 && countNpc(p, R_CHILD) < MAX_CHILD;
        case C.WORKING: return p.job >= 0 && p.job !== J_HEIR && !p.isLeader && !p.flag[F_RETIRED];
        case C.MONEY40: return p.stat[MONEY] >= 40;
        case C.FRIENDSLOT: return countNpc(p, R_FRIEND) < MAX_FRIEND;
        }
        return 1;
    }

    function pickEvent(p) {
        var list = [], raceEvent = p.stage !== CHILD && rnd(100) < 30;
        for (var i = 0; i < events.length; i++) {
            var e = events[i];
            if (raceEvent) {
                if (e.race !== p.race) continue;
            } else {
                if (e.race !== -1) continue;
                if (e.stage !== p.stage && e.stage !== ANY_STAGE) continue;
            }
            if (e.needFlag !== F_NONE && !p.flag[e.needFlag]) continue;
            if (e.npcRel !== R_NONE && findNpc(p, e.npcRel) < 0) continue;
            if (e.once && p.eventUsed[i]) continue;
            if (p.eventUsed[i] >= MAX_REPEAT) continue;
            if (p.eventUsed[i] && p.turn - p.lastTurn[i] < COOLDOWN) continue;
            if (!checkCond(p, e.cond)) continue;
            list.push(i);
        }
        if (!list.length) return -1;
        return list[rnd(list.length)];
    }

    async function runEvent(p, idx) {
        var e = events[idx], s;
        p.eventUsed[idx]++;
        p.lastTurn[idx] = p.turn;
        setColor(CYAN);
        printf('[' + pad4(p.age) + '세] ');
        setColor(WHITE);
        if (e.npcRel !== R_NONE) {
            p.curNpc = findNpc(p, e.npcRel);
            var label = npcLabel(p, p.curNpc);
            printf(e.text.replace('%s', label));
            addLog(p, e.name + ' (' + label + ')');
        } else {
            printf(e.text);
            addLog(p, e.name);
        }
        if (e.effect[HEALTH] < 0) p.lastHarm = e.name;
        for (s = 0; s < STAT_COUNT; s++) changeStat(p, s, vary(e.effect[s]));
        printf('\n');
        if (e.special !== SP.NONE) await doSpecial(p, e.special);
    }

    /* ---------- 사망 판정 ---------- */
    function deathScene(p, text) {
        setColor(RED);
        printf('[' + pad4(p.age) + '세] ' + text + '\n');
        setColor(WHITE);
    }
    function finalScene(p, text) {
        deathScene(p, text);
        var i = findNpc(p, R_SPOUSE);
        if (i < 0) i = findNpc(p, R_CHILD);
        if (i < 0) i = findNpc(p, R_FRIEND);
        if (i >= 0) printf('         마지막 날들을 ' + npcLabel(p, i) + ' 곁에서 보냈다. 하고 싶던 말을 나눌 시간이 있었다.\n');
        else printf('         곁을 지키는 이 없이, 홀로 조용히 떠났다.\n');
    }
    function crisisText(cause) {
        for (var i = 0; i < crises.length; i++) if (crises[i].cause === cause) return crises[i].text;
        return '뜻밖의 사고를 당했다.';
    }
    async function crisis(p, cause) {
        var survive = idiv(p.stat[HEALTH], 2) + 10;
        setColor(RED);
        printf('[' + pad4(p.age) + '세] 위기! ');
        setColor(WHITE);
        printf(crisisText(cause) + '\n');
        await waitEnter();
        if (rnd(100) < survive) {
            printf('  → 간신히 목숨을 건졌다.');
            changeStat(p, HEALTH, -randInt(15, 30));
            printf('\n');
            p.lastHarm = cause;
            addLog(p, '위기(' + cause + ')에서 살아남았다');
            return 0;
        }
        printf('  → 끝내 버티지 못했다.\n');
        die(p, cause);
        return 1;
    }

    async function checkDeath(p) {
        var ratio = idiv(p.age * 100, p.life), risk;
        if (!p.alive) return 1;
        if (p.stat[HEALTH] <= 0) {
            deathScene(p, '몸이 더는 버티지 못하고 쓰러졌다.');
            die(p, p.lastHarm || '질병');
            return 1;
        }
        if (p.race !== VAMPIRE && ratio >= 80) {
            if (chance((ratio - 75) * 20)) {
                finalScene(p, '기력이 다해 조용히 눈을 감았다.');
                die(p, '노화');
                return 1;
            }
        }
        if (p.race === VAMPIRE && ratio >= 100 && chance(200)) {
            deathScene(p, '긴 삶에 지쳐 스스로 관 속에 몸을 눕혔다.');
            die(p, '영원한 잠');
            return 1;
        }
        if (p.race !== VAMPIRE && p.stat[HEALTH] < 30) {
            risk = (30 - p.stat[HEALTH]) * 3;
            if (p.rank === 3) risk += 10;
            if (p.stat[MONEY] >= 70) risk = idiv(risk, 2);
            if (chance(risk)) {
                finalScene(p, '약해진 몸에 병이 깊어져 자리에서 일어나지 못했다.');
                die(p, '질병');
                return 1;
            }
        }
        if (p.continent === 1 && p.stat[MONEY] < 30 && chance(5)) return crisis(p, '동사');
        if (p.job >= 0 && !p.flag[F_RETIRED] && chance(jobs[p.job].riskRate)) return crisis(p, jobs[p.job].risk);
        if (p.inGuild && chance(3)) return crisis(p, '길드의 배신');
        if ((p.rank <= 1 || p.stat[FAME] >= 80) && chance(2)) return crisis(p, '암살');
        risk = 3;
        if (p.rank === 3) risk += 3;
        if (chance(risk)) return crisis(p, pickCause(p.race, p.continent));
        return 0;
    }

    /* ---------- 직업 사건 ---------- */
    function pickJobEvent(p) {
        var list = [];
        for (var i = 0; i < jobEvents.length; i++) {
            var e = jobEvents[i];
            if (e.job !== p.job) continue;
            if (e.once && p.jobEventUsed[i]) continue;
            if (p.jobEventUsed[i] >= MAX_REPEAT) continue;
            if (p.jobEventUsed[i] && p.turn - p.jobEventLast[i] < COOLDOWN) continue;
            list.push(i);
        }
        if (!list.length) return -1;
        return list[rnd(list.length)];
    }
    function applyEffect(p, effect, harm) {
        if (effect[HEALTH] < 0) p.lastHarm = harm;
        for (var s = 0; s < STAT_COUNT; s++) changeStat(p, s, vary(effect[s]));
    }
    async function runJobEvent(p, idx) {
        var e = jobEvents[idx];
        p.jobEventUsed[idx]++;
        p.jobEventLast[idx] = p.turn;
        setColor(CYAN);
        printf('[' + pad4(p.age) + '세] ');
        setColor(8);
        printf('(' + jobs[p.job].name + ') ');
        setColor(WHITE);
        printf(e.text);
        applyEffect(p, e.effect, e.name);
        printf('\n');
        addLog(p, e.name + ' (' + jobs[p.job].name + ')');
        if (!e.option1) return;
        if (await ask2(e.option1, e.option2) === 1) {
            if (rnd(100) < e.rate) { printf('  → ' + e.goodText); applyEffect(p, e.good, e.name); }
            else { printf('  → ' + e.badText); applyEffect(p, e.bad, e.name); }
        } else {
            printf('  → ' + e.text2);
            applyEffect(p, e.effect2, e.name);
        }
        printf('\n');
    }

    /* ---------- 한 턴 진행 ---------- */
    async function passTurn(p) {
        var years = idiv(p.life, TURNS), st, idx;
        if (years < 1) years = 1;
        p.age += years;
        p.turn++;

        st = getStage(p);
        if (st !== p.stage) {
            p.stage = st;
            printf('\n');
            await waitEnter();
            setColor(CYAN);
            printf('\n───── ' + stageNames[st] + ' (' + p.age + '세) ─────\n');
            setColor(WHITE);
            if (p.job >= 0) printf('직업: ' + jobs[p.job].name + (p.flag[F_RETIRED] ? '(은퇴)' : '') + '  ');
            printStatus(p);
            printTwins(p);
        }

        ageNpcs(p, years);
        checkTwins(p);

        if (p.job === -1 && p.age >= idiv(p.life * 20, 100)) await chooseJob(p);
        if (p.job >= 0 && !p.flag[F_RETIRED]) applyJob(p);

        if (p.stage !== OLD && p.stat[HEALTH] < 70 && rnd(100) < 40 + idiv(p.stat[MONEY], 4)) addStat(p, HEALTH, 2);
        if (p.stage === OLD && p.race !== VAMPIRE) { addStat(p, HEALTH, -1); p.lastHarm = '노환'; }
        if (p.race === MERMAID && p.onLand) { addStat(p, HEALTH, -1); p.lastHarm = '육지에서 말라 죽음'; }

        if (p.job === J_HEIR && !p.isLeader && !p.flag[F_RETIRED] && p.stage >= ADULT && p.stat[FAME] >= 70 && rnd(100) < 10) {
            setColor(CYAN);
            printf('[' + pad4(p.age) + '세] ');
            setColor(WHITE);
            printf('선대 ' + races[p.race].leader + '이(가) 물러났다. 그 자리에 도전하시겠습니까?\n');
            await tryLeader(p, 0);
        }

        if (p.alive && rnd(100) < 50) {
            idx = -1;
            if (p.job >= 0 && !p.flag[F_RETIRED] && rnd(100) < 25) {
                idx = pickJobEvent(p);
                if (idx >= 0) await runJobEvent(p, idx);
            }
            if (idx < 0) {
                idx = pickEvent(p);
                if (idx >= 0) await runEvent(p, idx);
            }
        }

        if (p.alive && p.stat[HEALTH] > 0 && p.stat[HEALTH] < 30 && !p.warned) {
            setColor(YELLOW);
            printf('[' + pad4(p.age) + '세] ※ 몸 상태가 좋지 않다. 건강이 회복되지 않으면 병으로 쓰러질 수 있다. (건강 ' + p.stat[HEALTH] + ')\n');
            setColor(WHITE);
            p.warned = 1;
        }
        if (p.stat[HEALTH] >= 40) p.warned = 0;
        if (p.stat[FAME] >= 100) giveAchieve(p, A_FAME);
        if (p.stat[MONEY] >= 100) giveAchieve(p, A_RICH);
    }

    async function playLife(p) {
        current = p;
        printBirth(p);
        showInfo(p);
        await waitEnter();
        while (true) {
            printedThisTurn = false;
            await passTurn(p);
            showInfo(p);
            if (await checkDeath(p)) break;
            if (printedThisTurn && !fast) await sleep(140);
            trimTerm();
        }
        if (p.deathCause === '노화') giveAchieve(p, A_OLDAGE);
        setColor(RED);
        printf('\n[' + pad4(p.age) + '세] ' + p.deathCause + '(으)로 생을 마감했습니다.\n');
        setColor(WHITE);
        addLog(p, '사망');
        showInfo(p);
    }

    /* ---------- 점수와 요약 ---------- */
    function calcScore(p) {
        var sum = 0, ach = 0, i, lived;
        for (i = 0; i < STAT_COUNT; i++) sum += p.stat[i];
        for (i = 0; i < ACH_COUNT; i++) ach += p.achieve[i];
        lived = idiv(p.age * 100, p.life);
        if (lived > 100) lived = 100;
        return idiv(sum, STAT_COUNT) + ach * 5 + idiv(lived, 5);
    }

    function summaryText(p) {
        var r = races[p.race], i, lived = idiv(p.age * 100, p.life), o = '';
        o += '\n============ 인생 요약 ============\n';
        if (p.generation > 1) o += '세대     : 제 ' + p.generation + '세대 분열체\n';
        o += '이름     : ' + p.name + '\n';
        o += '종족     : ' + r.name + (p.bloodline >= 0 ? '(' + bloodNames[p.bloodline] + ' 혈통)' : '') + ' / ' + genderNames[p.gender] + '\n';
        o += '출신     : ' + continents[r.continent].name + ', ' + r.group + '의 ' + r.rank[p.rank] + '\n';
        if (p.continent !== r.continent || p.inSerian)
            o += '마지막 터전: ' + continents[p.continent].name + '(' + continents[p.continent].area + ')\n';
        o += '직업     : ' + (p.job >= 0 ? jobs[p.job].name : '없음') + (p.flag[F_RETIRED] ? '(은퇴)' : '') + (p.isLeader ? ' → ★ 수장' : '') + '\n';
        o += '향년     : ' + p.age + '세 (수명 ' + p.life + '년의 ' + lived + '%)\n';
        o += '사망 원인: ' + p.deathCause + '\n';
        o += '능력치   : ';
        for (i = 0; i < STAT_COUNT; i++) o += statNames[i] + ' ' + p.stat[i] + '  ';
        o += '\n\n--- 가족과 친구 ---\n';
        if (p.siblings > 0) o += '형제자매 ' + p.siblings + '명\n';
        for (i = 0; i < p.npcCount; i++) {
            if (p.npc[i].alive) o += npcLabel(p, i) + ' - 살아 있음 (' + p.npc[i].age + '세)\n';
            else o += npcLabel(p, i) + ' - ' + p.npc[i].age + '세에 세상을 떠남 (' + p.npc[i].cause + ')\n';
        }
        o += '\n--- 같은 날 태어난 이들 ---\n';
        for (i = 0; i < TWIN_COUNT; i++)
            o += p.twin[i].name + '(' + races[p.twin[i].race].name + ') - ' + (p.twin[i].alive ? '지금도 살아 있음: ' : '') + twinStatus(p, i) + '\n';
        o += '\n--- 인생 기록 ---\n';
        for (i = 0; i < p.logCount; i++) o += p.log[i] + '\n';
        o += '\n--- 업적 ---\n';
        for (i = 0; i < ACH_COUNT; i++) if (p.achieve[i]) o += '★ ' + achieveNames[i] + '\n';
        o += '\n최종 점수: ' + calcScore(p) + '점\n';
        o += '===================================\n';
        return o;
    }

    /* ---------- 위쪽 상태 표시 ---------- */
    var current = null;
    function showInfo(p) {
        if (!p) {
            infoEl.textContent = '아직 태어나지 않았습니다';
            statEls.forEach(function (el) {
                el.querySelector('b').textContent = '-';
                el.querySelector('.vic-bar span').style.width = '0%';
            });
            return;
        }
        var r = races[p.race];
        infoEl.textContent = p.name + ' · ' + r.name + ' · ' + p.age + '세 / 수명 ' + p.life + '년' +
            (p.job >= 0 ? ' · ' + jobs[p.job].name : '') + (p.alive ? '' : ' · 사망');
        statEls.forEach(function (el) {
            var v = p.stat[+el.dataset.stat];
            el.querySelector('b').textContent = v;
            el.querySelector('.vic-bar span').style.width = v + '%';
        });
    }

    /* ---------- 기록 파일 (브라우저에 저장) ---------- */
    var RECORD_KEY = 'life1008-vicarious-records';
    function loadRecords() {
        try { return localStorage.getItem(RECORD_KEY) || ''; } catch (e) { return ''; }
    }
    function saveRecord(text) {
        try {
            localStorage.setItem(RECORD_KEY, loadRecords() + text);
            return true;
        } catch (e) { return false; }
    }
    fileBtn.addEventListener('click', function () {
        var text = loadRecords();
        if (!text) {
            setColor(8);
            printf('\n아직 저장한 인생 기록이 없습니다.\n');
            setColor(WHITE);
            return;
        }
        var url = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' }));
        var a = document.createElement('a');
        a.href = url;
        a.download = 'vicarious_records.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });

    var fast = false;
    fastBtn.addEventListener('click', function () {
        fast = !fast;
        fastBtn.setAttribute('aria-pressed', String(fast));
    });

    /* ---------- main.c ---------- */
    async function main() {
        var games = 0, totalScore = 0, bestScore = -1, bestDesc = '';
        while (true) {
            setColor(CYAN);
            printf('\n==================================\n');
            printf('            Vicarious\n');
            printf('   행성 티아니어 인생 시뮬레이션\n');
            printf('==================================\n');
            setColor(WHITE);
            printf('  1) 새 인생 시작\n  2) 지금까지의 통계\n  3) 종료\n');
            var menu = await readChoice(1, 3, ['새 인생 시작', '지금까지의 통계', '종료']);

            if (menu === 3) break;
            if (menu === 2) {
                printf('\n플레이한 인생: ' + games + '번\n');
                if (games > 0) {
                    printf('평균 점수   : ' + idiv(totalScore, games) + '점\n');
                    printf('최고 점수   : ' + bestScore + '점 (' + bestDesc + ')\n');
                }
                continue;
            }

            var p = createPerson();
            while (true) {
                await playLife(p);
                await waitEnter();
                printf(summaryText(p));

                var score = calcScore(p);
                games++;
                totalScore += score;
                if (score > bestScore) {
                    bestScore = score;
                    bestDesc = races[p.race].name + ' ' + races[p.race].rank[p.rank] + ', 향년 ' + p.age + '세';
                }

                printf('\n인생 기록을 파일에 저장할까요?  1) 저장  2) 안 함\n');
                if (await readChoice(1, 2, ['저장', '안 함']) === 1) {
                    if (saveRecord(summaryText(p))) printf('vicarious_records.txt 에 저장했습니다. (이 브라우저에 저장, 위의 기록 파일 받기로 내려받을 수 있습니다)\n');
                    else printf('파일을 열 수 없습니다.\n');
                }

                if (p.race === SLIME && p.split) {
                    printf('\n남겨진 분열체가 꿈틀거립니다. 분열체로 이어서 살아갈까요?\n');
                    printf('  1) 이어서 산다  2) 여기서 끝낸다\n');
                    if (await readChoice(1, 2, ['이어서 산다', '여기서 끝낸다']) === 1) {
                        p = createSplit(p);
                        continue;
                    }
                }
                break;
            }
        }
        printf('플레이해 주셔서 감사합니다.\n');
        clearChoices();
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'stage-btn';
        b.textContent = '처음부터 다시';
        b.addEventListener('click', function () { termEl.textContent = ''; span = null; current = null; showInfo(null); main(); });
        choiceEl.appendChild(b);
    }

    showInfo(null);
    main();
})();
