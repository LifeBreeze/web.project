/*
 * 달빛 메뉴 데이터
 * - 서버 없이 동작하도록 일반 <script src>로 불러오는 전역 상수다.
 * - price는 숫자(원). 화면에는 "6,500원"처럼 바꿔서 보여 준다.
 * - badges: best(인기) · new(신메뉴) · season(시즌)
 * - temp: 고를 수 있는 온도. 음식과 아포가토는 빈 배열.
 * - beans: true면 상세 창에서 원두를 고를 수 있다(커피 6개).
 * - image: 사진이 아직 없으면 화면에서 images/placeholder.svg로 바꿔 보여 준다.
 */

const CATEGORIES = [
  { id: "signature", name: "시그니처",           nameEn: "Signature" },
  { id: "coffee",    name: "커피",               nameEn: "Coffee" },
  { id: "noncoffee", name: "논커피 · 차",        nameEn: "Non-Coffee & Tea" },
  { id: "ade",       name: "에이드 · 스무디",    nameEn: "Ade & Smoothie" },
  { id: "dessert",   name: "디저트",             nameEn: "Dessert" },
  { id: "bakery",    name: "베이커리 · 샌드위치", nameEn: "Bakery & Sandwich" }
];

const BOTH = ["HOT", "ICE"];

const MENU = [
  /* ① 시그니처 · 달빛 메뉴 */
  {
    id: "full-moon-latte",
    category: "signature",
    name: "보름달 라떼",
    nameEn: "Full Moon Latte",
    price: 6500,
    desc: "꿀과 바닐라 크림을 둥글게 얹은 라떼",
    detail: "에스프레소와 우유 위에 꿀과 바닐라를 섞은 크림을 둥글게 얹었습니다. 위에서 내려다보면 잔 안에 보름달이 뜬 것처럼 보입니다. 크림을 섞지 않고 마시면 단맛과 쌉쌀함을 차례로 느낄 수 있습니다.",
    badges: ["best"],
    temp: BOTH,
    beans: false,
    image: "images/menu/full-moon-latte.jpg"
  },
  {
    id: "crescent-cold-brew",
    category: "signature",
    name: "초승달 크림 콜드브루",
    nameEn: "Crescent Cream Cold Brew",
    price: 6300,
    desc: "콜드브루 위에 짭짤한 솔트 크림을 얹음",
    detail: "12시간 동안 내린 콜드브루 위에 소금을 살짝 넣은 크림을 얹었습니다. 크림이 잔 가장자리로 기울며 초승달 모양을 그립니다. 짭짤한 크림이 커피의 단맛을 또렷하게 해 줍니다.",
    badges: ["best"],
    temp: ["ICE"],
    beans: false,
    image: "images/menu/crescent-cold-brew.jpg"
  },
  {
    id: "blue-moon-tonic",
    category: "signature",
    name: "블루문 토닉",
    nameEn: "Blue Moon Tonic",
    price: 6800,
    desc: "버터플라이피 티에 토닉워터와 레몬을 더해 보랏빛으로 물드는 한 잔",
    detail: "버터플라이피 꽃잎으로 우린 푸른 차에 토닉워터를 붓고, 레몬즙을 따로 곁들여 드립니다. 레몬즙을 부으면 푸른빛이 보랏빛으로 천천히 바뀝니다. 커피가 들어가지 않아 늦은 밤에도 부담 없이 드실 수 있습니다.",
    badges: ["new"],
    temp: ["ICE"],
    beans: false,
    image: "images/menu/blue-moon-tonic.jpg"
  },
  {
    id: "sesame-latte",
    category: "signature",
    name: "월광 흑임자 라떼",
    nameEn: "Moonlight Sesame Latte",
    price: 6500,
    desc: "고소한 흑임자와 우유가 만난 밤의 라떼",
    detail: "곱게 간 흑임자를 우유에 풀어 만든 라떼입니다. 커피 없이 만들어 흑임자의 고소한 맛이 그대로 살아 있습니다. 달지 않게 맞춰 디저트와 함께 드시기 좋습니다.",
    badges: [],
    temp: BOTH,
    beans: false,
    image: "images/menu/sesame-latte.jpg"
  },
  {
    id: "yuja-cake",
    category: "signature",
    name: "월하 유자 케이크",
    nameEn: "Yuja Cake “Under the Moon”",
    price: 7000,
    desc: "쌀 시트에 유자 크림을 얇게 바른 케이크",
    detail: "쌀가루로 구운 촉촉한 시트 사이사이에 유자 크림을 얇게 발랐습니다. 유자 껍질을 함께 졸여 넣어 한 입마다 향이 은은하게 퍼집니다. 유자가 나는 계절에만 준비하는 케이크입니다.",
    badges: ["season"],
    temp: [],
    beans: false,
    image: "images/menu/yuja-cake.jpg"
  },

  /* ② 커피 */
  {
    id: "espresso",
    category: "coffee",
    name: "에스프레소",
    nameEn: "Espresso",
    price: 4000,
    desc: "진하고 묵직한 한 잔",
    detail: "곱게 간 원두에 높은 압력을 주어 짧게 뽑아낸 커피입니다. 원두의 맛이 가장 또렷하게 드러나 원두를 바꿔 가며 비교해 보기 좋습니다. 작은 잔에 따뜻하게 담아 드립니다.",
    badges: [],
    temp: ["HOT"],
    beans: true,
    image: "images/menu/espresso.jpg"
  },
  {
    id: "americano",
    category: "coffee",
    name: "아메리카노",
    nameEn: "Americano",
    price: 4500,
    desc: "원두 3종 중 골라 즐기는 기본 커피",
    detail: "에스프레소에 물을 더해 부드럽게 마시는 기본 커피입니다. 원두 세 가지 중 하나를 골라 맛을 바꿀 수 있습니다. 처음 오셨다면 고소한 브라질 산토스를 권해 드립니다.",
    badges: ["best"],
    temp: BOTH,
    beans: true,
    image: "images/menu/americano.jpg"
  },
  {
    id: "caffe-latte",
    category: "coffee",
    name: "카페 라떼",
    nameEn: "Caffè Latte",
    price: 5000,
    desc: "부드러운 우유와 에스프레소",
    detail: "에스프레소에 따뜻하게 데운 우유를 넉넉히 부었습니다. 우유 거품을 얇게 올려 끝까지 부드럽게 마실 수 있습니다. 산미가 있는 원두를 고르면 한결 가벼운 라떼가 됩니다.",
    badges: [],
    temp: BOTH,
    beans: true,
    image: "images/menu/caffe-latte.jpg"
  },
  {
    id: "vanilla-latte",
    category: "coffee",
    name: "바닐라 라떼",
    nameEn: "Vanilla Latte",
    price: 5500,
    desc: "은은한 바닐라 향의 달콤한 라떼",
    detail: "바닐라 빈을 넣어 직접 끓인 시럽으로 단맛을 냈습니다. 향은 은은하게, 단맛은 과하지 않게 맞췄습니다. 따뜻하게도, 차갑게도 잘 어울립니다.",
    badges: [],
    temp: BOTH,
    beans: true,
    image: "images/menu/vanilla-latte.jpg"
  },
  {
    id: "caramel-macchiato",
    category: "coffee",
    name: "카라멜 마키아토",
    nameEn: "Caramel Macchiato",
    price: 5800,
    desc: "카라멜 드리즐을 듬뿍 올림",
    detail: "바닐라 시럽을 넣은 우유 위에 에스프레소를 붓고 카라멜 드리즐을 듬뿍 올렸습니다. 섞기 전에는 층이 나뉘어 있어 한 모금마다 맛이 조금씩 달라집니다. 단맛을 좋아하시는 분께 잘 맞습니다.",
    badges: [],
    temp: BOTH,
    beans: true,
    image: "images/menu/caramel-macchiato.jpg"
  },
  {
    id: "cold-brew",
    category: "coffee",
    name: "콜드브루",
    nameEn: "Cold Brew",
    price: 5300,
    desc: "12시간 천천히 내린 깔끔한 커피",
    detail: "찬물로 12시간 동안 천천히 내린 커피입니다. 쓴맛이 적고 끝맛이 깔끔합니다. 미리 내려 두는 커피라 원두는 고를 수 없습니다.",
    badges: [],
    temp: ["ICE"],
    beans: false,
    image: "images/menu/cold-brew.jpg"
  },
  {
    id: "affogato",
    category: "coffee",
    name: "아포가토",
    nameEn: "Affogato",
    price: 6000,
    desc: "바닐라 젤라토 위에 뜨거운 에스프레소를 부어 먹는 커피",
    detail: "바닐라 젤라토 한 스쿱 위에 갓 뽑은 에스프레소를 부어 드립니다. 차가운 젤라토와 뜨거운 커피가 섞이며 녹아드는 맛이 특별합니다. 젤라토가 녹기 전에 바로 드시는 것을 권해 드립니다.",
    badges: [],
    temp: [],
    beans: true,
    image: "images/menu/affogato.jpg"
  },

  /* ③ 논커피 · 차 */
  {
    id: "matcha-latte",
    category: "noncoffee",
    name: "말차 라떼",
    nameEn: "Matcha Latte",
    price: 5800,
    desc: "진한 말차와 우유",
    detail: "말차를 진하게 풀어 우유를 더했습니다. 쌉쌀한 첫맛 뒤에 고소함이 오래 남습니다. 단맛을 줄여 말차 본연의 맛을 살렸습니다.",
    badges: ["best"],
    temp: BOTH,
    beans: false,
    image: "images/menu/matcha-latte.jpg"
  },
  {
    id: "sweet-potato-latte",
    category: "noncoffee",
    name: "고구마 라떼",
    nameEn: "Sweet Potato Latte",
    price: 5500,
    desc: "달콤하고 든든한 고구마 라떼",
    detail: "구운 고구마를 곱게 으깨 우유와 함께 끓였습니다. 단맛을 많이 더하지 않아도 고구마 자체의 단맛이 진합니다. 든든해서 늦은 저녁 출출할 때 잘 어울립니다.",
    badges: ["season"],
    temp: BOTH,
    beans: false,
    image: "images/menu/sweet-potato-latte.jpg"
  },
  {
    id: "chocolate-latte",
    category: "noncoffee",
    name: "초콜릿 라떼",
    nameEn: "Chocolate Latte",
    price: 5300,
    desc: "진한 다크 초콜릿",
    detail: "카카오 함량이 높은 다크 초콜릿을 녹여 우유에 섞었습니다. 달기보다는 진하고 묵직한 맛입니다. 따뜻하게 드시면 향이 더 짙게 올라옵니다.",
    badges: [],
    temp: BOTH,
    beans: false,
    image: "images/menu/chocolate-latte.jpg"
  },
  {
    id: "earl-grey-milk-tea",
    category: "noncoffee",
    name: "얼그레이 밀크티",
    nameEn: "Earl Grey Milk Tea",
    price: 5800,
    desc: "향긋한 얼그레이를 우유에 우림",
    detail: "베르가못 향이 나는 얼그레이 찻잎을 우유에 직접 우려 만들었습니다. 홍차의 향과 우유의 부드러움이 잘 어울립니다. 차갑게 드시면 향이 더 산뜻해집니다.",
    badges: [],
    temp: BOTH,
    beans: false,
    image: "images/menu/earl-grey-milk-tea.jpg"
  },
  {
    id: "chamomile-tea",
    category: "noncoffee",
    name: "캐모마일 티",
    nameEn: "Chamomile Tea",
    price: 5000,
    desc: "잠들기 전 편안한 허브티",
    detail: "말린 캐모마일 꽃으로 우린 허브티입니다. 사과를 닮은 향이 은은하고 카페인이 없습니다. 하루를 마무리하는 늦은 밤에 권해 드립니다.",
    badges: [],
    temp: BOTH,
    beans: false,
    image: "images/menu/chamomile-tea.jpg"
  },
  {
    id: "yuja-tea",
    category: "noncoffee",
    name: "유자차",
    nameEn: "Yuja Tea",
    price: 5500,
    desc: "직접 담근 유자청으로 만든 달콤하고 상큼한 차",
    detail: "유자를 얇게 썰어 직접 담근 유자청으로 만듭니다. 달콤함 속에 유자 껍질의 쌉쌀한 향이 함께 납니다. 따뜻하게 드시면 몸이 천천히 데워집니다.",
    badges: ["season"],
    temp: BOTH,
    beans: false,
    image: "images/menu/yuja-tea.jpg"
  },
  {
    id: "grapefruit-tea",
    category: "noncoffee",
    name: "자몽차",
    nameEn: "Grapefruit Tea",
    price: 5500,
    desc: "쌉싸름하고 향긋한 자몽청 차",
    detail: "자몽 과육과 껍질로 담근 자몽청을 풀어 만든 차입니다. 쌉싸름한 맛이 살짝 남아 너무 달지 않습니다. 식사 뒤 입안을 개운하게 해 줍니다.",
    badges: [],
    temp: BOTH,
    beans: false,
    image: "images/menu/grapefruit-tea.jpg"
  },

  /* ④ 에이드 · 스무디 (모두 ICE) */
  {
    id: "lemon-ade",
    category: "ade",
    name: "레몬 에이드",
    nameEn: "Lemon Ade",
    price: 5800,
    desc: "생레몬을 직접 짜 넣은 에이드",
    detail: "주문을 받으면 생레몬을 바로 짜서 탄산수와 섞습니다. 새콤한 맛이 분명하고 끝맛이 가볍습니다. 단맛을 조금 줄여 레몬 향을 살렸습니다.",
    badges: [],
    temp: ["ICE"],
    beans: false,
    image: "images/menu/lemon-ade.jpg"
  },
  {
    id: "grapefruit-ade",
    category: "ade",
    name: "자몽 에이드",
    nameEn: "Grapefruit Ade",
    price: 5800,
    desc: "쌉싸름하고 상큼한 자몽",
    detail: "붉은 자몽 과육을 넉넉히 넣은 에이드입니다. 쌉싸름함과 상큼함이 함께 있어 질리지 않습니다. 달빛에서 가장 많이 찾으시는 에이드입니다.",
    badges: ["best"],
    temp: ["ICE"],
    beans: false,
    image: "images/menu/grapefruit-ade.jpg"
  },
  {
    id: "green-grape-ade",
    category: "ade",
    name: "청포도 에이드",
    nameEn: "Green Grape Ade",
    price: 5800,
    desc: "청량한 청포도 과육",
    detail: "청포도 과육을 으깨 넣어 씹히는 맛이 있습니다. 청량한 향이 탄산과 잘 어울립니다. 산뜻한 음료를 찾으실 때 좋습니다.",
    badges: [],
    temp: ["ICE"],
    beans: false,
    image: "images/menu/green-grape-ade.jpg"
  },
  {
    id: "peach-iced-tea",
    category: "ade",
    name: "복숭아 아이스티",
    nameEn: "Peach Iced Tea",
    price: 4800,
    desc: "달콤한 복숭아 향의 시원한 아이스티",
    detail: "홍차를 진하게 우려 복숭아 향을 더한 아이스티입니다. 달콤하지만 홍차의 떫은맛이 살짝 남아 깔끔합니다. 디저트와 함께 가볍게 드시기 좋습니다.",
    badges: [],
    temp: ["ICE"],
    beans: false,
    image: "images/menu/peach-iced-tea.jpg"
  },
  {
    id: "strawberry-smoothie",
    category: "ade",
    name: "딸기 요거트 스무디",
    nameEn: "Strawberry Yogurt Smoothie",
    price: 6500,
    desc: "생딸기와 플레인 요거트",
    detail: "생딸기와 플레인 요거트를 함께 갈아 만들었습니다. 새콤달콤한 딸기에 요거트의 부드러움이 더해집니다. 딸기가 나는 계절에만 준비합니다.",
    badges: ["season"],
    temp: ["ICE"],
    beans: false,
    image: "images/menu/strawberry-smoothie.jpg"
  },
  {
    id: "blueberry-smoothie",
    category: "ade",
    name: "블루베리 요거트 스무디",
    nameEn: "Blueberry Yogurt Smoothie",
    price: 6500,
    desc: "블루베리와 플레인 요거트를 갈아 만든 스무디",
    detail: "블루베리와 플레인 요거트를 함께 갈아 만든 스무디입니다. 짙은 보랏빛에 새콤한 맛이 은은합니다. 걸쭉하지 않고 부드럽게 넘어갑니다.",
    badges: [],
    temp: ["ICE"],
    beans: false,
    image: "images/menu/blueberry-smoothie.jpg"
  },
  {
    id: "mango-smoothie",
    category: "ade",
    name: "망고 스무디",
    nameEn: "Mango Smoothie",
    price: 6300,
    desc: "진한 망고를 통째로 갈아 넣음",
    detail: "잘 익은 망고를 통째로 갈아 넣었습니다. 진하고 달콤한 과일 맛이 그대로 납니다. 얼음을 적게 넣어 맛이 묽어지지 않게 했습니다.",
    badges: [],
    temp: ["ICE"],
    beans: false,
    image: "images/menu/mango-smoothie.jpg"
  },

  /* ⑤ 디저트 */
  {
    id: "basque-cheesecake",
    category: "dessert",
    name: "바스크 치즈케이크",
    nameEn: "Basque Cheesecake",
    price: 6500,
    desc: "겉은 그을리고 속은 촉촉한 치즈케이크",
    detail: "높은 온도에서 구워 겉면은 짙게 그을리고 속은 크림처럼 촉촉합니다. 캐러멜 같은 쌉쌀함과 진한 치즈 맛이 함께 납니다. 산미가 있는 커피와 잘 어울립니다.",
    badges: ["best"],
    temp: [],
    beans: false,
    image: "images/menu/basque-cheesecake.jpg"
  },
  {
    id: "tiramisu",
    category: "dessert",
    name: "티라미수",
    nameEn: "Tiramisu",
    price: 6800,
    desc: "에스프레소에 적신 마스카포네 케이크",
    detail: "에스프레소에 적신 레이디핑거 위에 마스카포네 크림을 겹겹이 올렸습니다. 맨 위에는 코코아 가루를 고르게 뿌렸습니다. 촉촉하고 부드러워 따뜻한 커피와 함께 드시기 좋습니다.",
    badges: [],
    temp: [],
    beans: false,
    image: "images/menu/tiramisu.jpg"
  },
  {
    id: "macaron-trio",
    category: "dessert",
    name: "마카롱 3구",
    nameEn: "Macaron Trio",
    price: 7500,
    desc: "바닐라·라즈베리·피스타치오",
    detail: "바닐라, 라즈베리, 피스타치오 세 가지 맛을 한 접시에 담았습니다. 겉은 얇게 바삭하고 속은 쫀득합니다. 차와 함께 하나씩 천천히 드셔 보세요.",
    badges: [],
    temp: [],
    beans: false,
    image: "images/menu/macaron-trio.jpg"
  },
  {
    id: "brownie",
    category: "dessert",
    name: "초코 브라우니",
    nameEn: "Chocolate Brownie",
    price: 4500,
    desc: "꾸덕한 다크 초콜릿 브라우니",
    detail: "다크 초콜릿을 넉넉히 넣어 꾸덕하게 구운 브라우니입니다. 겉은 살짝 단단하고 속은 진하고 촉촉합니다. 아메리카노나 따뜻한 우유와 잘 어울립니다.",
    badges: [],
    temp: [],
    beans: false,
    image: "images/menu/brownie.jpg"
  },
  {
    id: "croffle",
    category: "dessert",
    name: "아이스크림 크로플",
    nameEn: "Croffle with Ice Cream",
    price: 6000,
    desc: "바삭한 크로플에 바닐라 아이스크림",
    detail: "크루아상 반죽을 와플 틀에 눌러 바삭하게 구웠습니다. 따뜻한 크로플 위에 바닐라 아이스크림을 올리고 메이플 시럽을 곁들입니다. 따뜻함과 차가움이 함께 있을 때 가장 맛있습니다.",
    badges: [],
    temp: [],
    beans: false,
    image: "images/menu/croffle.jpg"
  },

  /* ⑥ 베이커리 · 샌드위치 */
  {
    id: "croissant",
    category: "bakery",
    name: "버터 크루아상",
    nameEn: "Butter Croissant",
    price: 4200,
    desc: "버터 향 가득한 결이 살아 있는 크루아상",
    detail: "버터를 접어 넣은 반죽을 여러 겹으로 밀어 구웠습니다. 겉은 바삭하게 부서지고 속은 결마다 버터 향이 납니다. 원하시면 따뜻하게 데워 드립니다.",
    badges: [],
    temp: [],
    beans: false,
    image: "images/menu/croissant.jpg"
  },
  {
    id: "bagel",
    category: "bakery",
    name: "베이글 & 크림치즈",
    nameEn: "Bagel & Cream Cheese",
    price: 4800,
    desc: "쫄깃한 베이글에 크림치즈",
    detail: "쫄깃한 플레인 베이글을 반으로 갈라 크림치즈를 넉넉히 발랐습니다. 살짝 구워 겉은 바삭하고 속은 부드럽습니다. 커피 한 잔과 가볍게 드시기 좋습니다.",
    badges: [],
    temp: [],
    beans: false,
    image: "images/menu/bagel.jpg"
  },
  {
    id: "ham-cheese-sandwich",
    category: "bakery",
    name: "햄 치즈 샌드위치",
    nameEn: "Ham & Cheese Sandwich",
    price: 7500,
    desc: "햄, 체다치즈, 양상추를 넣은 샌드위치",
    detail: "슬라이스 햄과 체다치즈, 아삭한 양상추를 식빵 사이에 넣었습니다. 버터를 얇게 발라 고소함을 더했습니다. 저녁 식사 대신 찾으시는 분이 많은 든든한 샌드위치입니다.",
    badges: ["best"],
    temp: [],
    beans: false,
    image: "images/menu/ham-cheese-sandwich.jpg"
  },
  {
    id: "egg-mayo-sandwich",
    category: "bakery",
    name: "에그 마요 샌드위치",
    nameEn: "Egg Mayo Sandwich",
    price: 6800,
    desc: "부드러운 에그 마요",
    detail: "삶은 달걀을 곱게 으깨 마요네즈와 섞어 부드러운 식빵 사이에 넣었습니다. 후추를 살짝 더해 느끼하지 않습니다. 먹기 편하도록 한 입 크기로 잘라 드립니다.",
    badges: [],
    temp: [],
    beans: false,
    image: "images/menu/egg-mayo-sandwich.jpg"
  },
  {
    id: "chicken-avocado-sandwich",
    category: "bakery",
    name: "치킨 아보카도 샌드위치",
    nameEn: "Chicken Avocado Sandwich",
    price: 8500,
    desc: "구운 닭가슴살과 아보카도",
    detail: "구운 닭가슴살과 잘 익은 아보카도를 통밀빵 사이에 넣었습니다. 홀그레인 머스터드로 맛을 정리해 담백하면서도 든든합니다. 이번에 새로 선보이는 샌드위치입니다.",
    badges: ["new"],
    temp: [],
    beans: false,
    image: "images/menu/chicken-avocado-sandwich.jpg"
  }
];

/* 원두 3종 — beans: true인 메뉴의 상세 창에서 고른다. 고른 값은 저장하지 않는다. */
const BEANS = [
  {
    id: "santos",
    name: "브라질 산토스",
    nameEn: "Brazil Santos",
    taste: "고소함 · 견과 · 다크 초콜릿",
    note: "산미가 적고 묵직합니다.",
    extra: 0,
    isDefault: true
  },
  {
    id: "supremo",
    name: "콜롬비아 수프리모",
    nameEn: "Colombia Supremo",
    taste: "균형 · 캐러멜 단맛 · 부드러운 산미",
    note: "단맛과 산미가 고르게 어울립니다.",
    extra: 0,
    isDefault: false
  },
  {
    id: "yirgacheffe",
    name: "에티오피아 예가체프",
    nameEn: "Ethiopia Yirgacheffe",
    taste: "꽃향기 · 레몬 산미 · 가벼운 바디",
    note: "한 지역에서만 나는 싱글 오리진입니다.",
    extra: 500,
    isDefault: false
  }
];
