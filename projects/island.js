// 무인도 탈출 (엔트리 원본의 장면 그림 + 기획서의 갈림길을 따라 진행)
(function () {
    function img(n) { return 'media/island/scene' + (n < 10 ? '0' : '') + n + '.jpg'; }

    // 장면 이름: { 그림, 설명, 버튼들 } / type: ending, over (게임 오버: retry 로 돌아감)
    // 대사와 선택지는 원본 엔트리 작품에 들어 있던 문장 그대로
    var S = {
        start: { pic: img(0), alt: '무인도 탈출 시작 화면', go: [['시작하기', 'plane']] },
        plane: { pic: img(1), alt: '바다 위 섬', text: '방학을 맞아, 해외여행을 가기 위해 비행기를 탔다.', go: [['다음', 'crash']] },
        crash: { pic: img(2), alt: '불붙은 비행기가 섬으로 떨어지는 장면', go: [['다음', 'beach']] },
        beach: { pic: img(3), alt: '넓은 해안가', text: '정신을 차려보니, 넓은 해안가에 나 혼자 쓰러져 있었다.\n주변에 보이는 짐은 휴대폰과 라이터, 손거울 뿐이다.', go: [['다음', 'items']] },
        items: { pic: img(4), alt: '모래사장에 떨어진 라이터, 휴대폰, 손거울', text: '(도구를 클릭해서 살펴보자.)', items: true, go: [['휴대폰', 'phone'], ['손거울', 'mirror'], ['라이터', 'lighter'], ['다음', 'sos']] },
        phone: { pic: img(5), alt: '금지 표시가 뜬 휴대폰', text: '(휴대폰을 확인해봤지만, 역시나 작동하지 않는다.)', go: [['돌아가기', 'items']] },
        mirror: { pic: img(6), alt: '깨끗한 손거울', text: '(손거울은 손상없이 깨끗하다.)', go: [['돌아가기', 'items']] },
        lighter: { pic: img(7), alt: '불이 붙은 라이터', text: '(라이터는 불이 잘 나온다.)', go: [['돌아가기', 'items']] },
        sos: { pic: img(8), alt: '빈 모래사장', text: '우선 구조표시를 남겨두어야 할 것 같다.\n(나뭇가지를 클릭해보자.)', go: [['나뭇가지로 쓰기', 'sos2']] },
        sos2: { pic: 'media/island/scene08b.jpg', alt: '모래사장에 쓴 HELP SOS', text: '모래사장에 HELP SOS를 크게 남겼다.', go: [['숲으로 들어간다', 'forest']] },
        forest: { pic: img(9), alt: '어두운 숲', go: [['숲 안쪽에 동굴 하나가 보인다. 들어가보자.', 'cave'], ['거목 아래 공간이 나름 아늑해보인다.', 'tree']] },
        cave: { pic: img(11), alt: '동굴 안 곰', text: '동굴 안쪽에는 거대한 곰이 웅크리고 있었다!', go: [['다음', 'bear']] },
        bear: { pic: img(12), alt: '곰 그림과 GAME OVER', type: 'over', retry: 'forest' },
        tree: { pic: img(10), alt: '큰 나무 아래 거처', text: '취침중..\n머무를 곳은 정했고, 이제 배가 고파 참기가 힘들다. 숲에서 먹을 것을 구해보자.', go: [['다음', 'hungry']] },
        hungry: { pic: img(13), alt: '숲 속 갈림길', text: '옆에는 버섯이 있고, 앞에는 토끼가 있다. 어떻게 할까?', go: [['채집한다.', 'mushroom'], ['사냥한다.', 'hunt']] },
        mushroom: { pic: img(15), alt: '버섯과 토끼가 있는 숲', text: '(버섯을 클릭하여 채집해보자.)', go: [['버섯을 채집한다', 'poison']] },
        poison: { pic: img(14), alt: '독버섯과 GAME OVER', type: 'over', retry: 'hungry' },
        hunt: { pic: 'media/island/hunt.jpg', alt: '토끼 사냥 장면', hunt: true, text: '(토끼를 클릭하여 사냥해보자.)' },
        fire: { pic: img(16), alt: '나무 아래에서 고기를 굽는 장면', fire: true, text: '(스페이스바로 라이터를 켜보자.)' },
        meal: { pic: img(16), alt: '나무 아래에서 고기를 굽는 장면', text: '먹는중.. 자는중..\n일단은 비가 오니 좀 쉬어야겠다.. 소화도 시킬 겸, 섬을 좀 둘러보자.', go: [['섬을 둘러본다', 'fall']] },
        fall: { pic: img(17), alt: '폭포 앞 갈림길', text: '탐사하는 도중에 갑자기 비가 와서 돌아가려는데,\n앞에 폭포가 있다. 어떻게 할까?', go: [['건너간다.', 'drown'], ['돌아서 간다.', 'natives']] },
        drown: { pic: img(18), alt: '물고기 그림과 GAME OVER', type: 'over', retry: 'fall', text: '건너다가 물살에 휩쓸려버렸다.' },
        natives: { pic: img(19), alt: '숲에서 몰려온 원주민들', text: '자는데 시끄러워서 보니 원주민들이 몰려왔다.\n뭐라고 소리치는지 모르겠다. 어떻게 할까?', go: [['공격한다.', 'fight'], ['몸짓을 이용해 소통을 시도한다.', 'talk']] },
        fight: { pic: img(22), alt: '원주민과 GAME OVER', type: 'over', retry: 'natives' },
        talk: { pic: img(20), alt: '원주민들과 함께 있는 숲', text: '어느정도 시간이 지나니 서로 말이 통한다.\n그들과 소통하면서 친해졌지만, 정체성에 혼란을 느낀다. 어떻게 해야할까?', go: [['원주민들과 정착한다.', 'endTribe'], ['내 힘으로 살아간다.', 'flee']] },
        flee: { pic: img(20), alt: '원주민들과 함께 있는 숲', text: '원주민들에게 대충 둘러대고 도망쳤다.', go: [['다음', 'boat']] },
        endTribe: { pic: img(21), alt: '원주민들과 행복하게 살았다는 엔딩', type: 'ending', name: '원주민 엔딩' },
        boat: { pic: img(23), alt: '해변에 끌고 온 작은 배', text: '탈출하기 위해 배를 만들어 해변가까지 끌고왔다.', go: [['바다로 나간다', 'sea']] },
        sea: { pic: img(24), alt: '바다 위의 작은 배', text: '선박은 생각보다 잘 버텨주었고, 어느새 섬도 보이지 않는다.\n어디선가 헬기소리가 들린다.. 헬기가 멀리 있어서 내가 안보이는 것 같다. 어떻게 할까?', go: [['팔을 흔들며 소리치기.', 'missed'], ['손거울의 빛 반사를 이용하자.', 'ladder']] },
        ladder: { pic: img(25), alt: '헬기가 배 위로 사다리를 내린 장면', go: [['사다리를 잡는다', 'endHeli']] },
        endHeli: { pic: img(26), alt: '헬기를 타고 돌아가는 엔딩', type: 'ending', name: '헬기 구조 엔딩' },
        missed: { pic: img(24), alt: '헬기가 지나간 바다', text: '헬기가 나를 못 보고 지나쳤다..\n나는 어떻게든 살아남기 위해 항해를 계속 했다.', go: [['다음', 'storm']] },
        storm: { pic: img(27), alt: '폭풍우 치는 바다', storm: true, text: '(스페이스바를 연타해서 탈출하자.) 6초 안에 25번!' },
        sink: { pic: img(28), alt: '불타는 배와 GAME OVER', type: 'over', retry: 'storm' },
        endStorm: { pic: img(29), alt: '폭풍우를 뚫고 탈출한 엔딩', type: 'ending', name: '폭풍우 탈출 엔딩' }
    };
    var ENDINGS = ['endTribe', 'endHeli', 'endStorm'];

    var view = document.getElementById('isl-pic');
    var text = document.getElementById('isl-text');
    var actions = document.getElementById('isl-actions');
    var stage = document.getElementById('isl-stage');
    var found = document.getElementById('isl-found');
    var rabbit = document.getElementById('isl-rabbit');
    var meter = document.getElementById('isl-meter');
    var seen = {};
    var timers = [];

    function clearTimers() {
        timers.forEach(function (t) { if (t && t.off) t.off(); else { clearInterval(t); clearTimeout(t); } });
        timers = [];
        rabbit.hidden = true;
        meter.hidden = true;
        document.removeEventListener('keydown', onSpace);
    }

    function button(label, fn, primary) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = primary ? 'btn btn-primary' : 'stage-btn';
        b.textContent = label;
        b.addEventListener('click', fn);
        actions.appendChild(b);
        return b;
    }

    function go(id) {
        clearTimers();
        var s = S[id];
        view.src = s.pic;
        view.alt = s.alt;
        text.textContent = s.text || '';
        text.hidden = !s.text;
        actions.innerHTML = '';
        if (s.type === 'over') {
            text.textContent = s.text || '';
            text.hidden = !s.text;
            button('선택지로 돌아가기', function () { go(s.retry); }, true);
            button('처음부터', function () { go('start'); });
        } else if (s.type === 'ending') {
            seen[id] = true;
            found.textContent = ENDINGS.filter(function (e) { return seen[e]; }).length;
            text.textContent = s.name + '을(를) 찾았습니다!';
            text.hidden = false;
            button('처음부터 다시', function () { go('start'); }, true);
        } else if (s.hunt) {
            startHunt();
        } else if (s.storm) {
            startStorm();
        } else if (s.fire) {
            startFire();
        } else {
            s.go.forEach(function (g, i) {
                button(g[0], function () { go(g[1]); }, s.go.length === 1 || (s.items && g[1] === 'sos'));
            });
        }
        var first = actions.querySelector('button');
        if (first && id !== 'start') first.focus({ preventScroll: true });
    }

    // 토끼 사냥: 원본처럼 토끼가 무작위로 움직이고, 눌러서 잡는다
    function startHunt() {
        rabbit.hidden = false;
        var left = 10;
        function hop() {
            rabbit.style.left = (5 + Math.random() * 78) + '%';
            rabbit.style.top = (35 + Math.random() * 40) + '%';
        }
        hop();
        timers.push(setInterval(hop, 700));
        timers.push(setInterval(function () {
            left--;
            text.textContent = '도망 다니는 토끼를 눌러서 잡아 보자! (' + left + '초)';
            if (left <= 0) {
                clearTimers();
                text.textContent = '토끼가 숲으로 도망쳤다…';
                actions.innerHTML = '';
                button('다시 사냥한다', function () { go('hunt'); }, true);
            }
        }, 1000));
    }
    rabbit.addEventListener('click', function () { go('fire'); });

    // 라이터 켜기: 스페이스바(또는 버튼) 한 번
    function onFire(e) {
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            document.removeEventListener('keydown', onFire);
            go('meal');
        }
    }
    function startFire() {
        document.addEventListener('keydown', onFire);
        timers.push({ off: function () { document.removeEventListener('keydown', onFire); } });
        button('라이터 켜기 (스페이스바)', function () { go('meal'); }, true);
    }

    // 폭풍우: 스페이스바 연타
    var count = 0, need = 25;
    function onSpace(e) {
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            if (!e.repeat) pump();
        }
    }
    function pump() {
        count++;
        meter.value = count;
        if (count >= need) go('endStorm');
    }
    function startStorm() {
        count = 0;
        meter.max = need;
        meter.value = 0;
        meter.hidden = false;
        document.addEventListener('keydown', onSpace);
        button('노 젓기 (스페이스바)', pump, true);
        timers.push(setTimeout(function () { if (count < need) go('sink'); }, 6000));
    }

    document.getElementById('isl-restart').addEventListener('click', function () { go('start'); });
    go('start');
})();
