/* ==========================================================================
   ВЕСТЕРОС (ПЕСНЬ ЛЬДА И ОГНЯ) — МОДУЛЬ РАЗДЕЛА (D&D 2024 LOW-FANTASY)
   Главный экран: Профиль персонажа + 3 кнопки (Способности, Карта, Данные)
   [ОТКЛЮЧЕНО ДО УЛУЧШЕНИЯ]: Раздел временно скрыт из верхней панели миров
   (hbModeBar) в homebrew.js и app.js до дальнейшей проработки и улучшения.
   Весь код модуля сохранён.
   ========================================================================== */

(function(){
  'use strict';

  var WE_PROFILES_KEY = 'ttc_we_profiles';
  var WE_ACTIVE_ID_KEY = 'ttc_we_active_id';
  var WE_CAMPAIGN_KEY = 'ttc_we_campaign';
  var WE_THEME_KEY = 'ttc_we_theme';

  var WE_ORIGINS_LIST = [
    'Первые Люди (Северянин)',
    'Первые Люди (Вольный Народ / Одичалый)',
    'Андалы (Долина / Речные Земли / Запад / Простор / Штормовые Земли)',
    'Солёный Дорниец',
    'Песчаный Дорниец',
    'Каменный Дорниец',
    'Железнорождённый (Железные Острова)',
    'Болотник Перешейка (Кранногмен)',
    'Кровь Старой Валирии (Драконий Камень / Вольные Города)',
    'Браавосиец',
    'Волантинец / Лисениец / Мириец / Тирошиец',
    'Дотракиец',
    'Гискарец / Безупречный',
    'Уроженец Летних Островов',
    'Квартиец / Асшаец'
  ];

  var WE_ROLES_LIST = [
    'Лорд / Наследник замка',
    'Помазанный рыцарь (Сир)',
    'Межевой рыцарь (Странствующий)',
    'Северный воин / Знаменосец',
    'Водяной танцор Браавоса (Браво)',
    'Брат Ночного Дозора (Разведчик / Строитель / Стюард)',
    'Рыцарь Королевской Гвардии (Белый Плащ)',
    'Мейстер Цитадели / Аколит',
    'Мастер над шептунами / Придворный интриган',
    'Капитан наёмной роты / Наёмный меч',
    'Дорнийский копейщик / Дуэлянт',
    'Капитан железнорождённых / Мореход',
    'Владелец заведения (Таверна / Шёлковый дом / Торговый дом)',
    'Куртизанка / Фаворитка двора',
    'Красный жрец Р\'глора / Алхимик / Безликий'
  ];

  var WE_HOUSES_LIST = [
    'Дом Старк из Винтерфелла',
    'Дом Таргариен с Драконьего Камня',
    'Дом Ланнистер из Утёса Кастерли',
    'Дом Баратеон из Штормового Предела',
    'Дом Талли из Риверрана',
    'Дом Аррен из Орлиного Гнезда',
    'Дом Тирелл из Хайгардена',
    'Дом Мартелл из Солнечного Копья',
    'Дом Грейджой из Пайка',
    'Дом Болтон из Дредфорта',
    'Дом Мандерли из Белой Гавани',
    'Дом Мормонт с Медвежьего Острова',
    'Дом Блэквуд из Воронодрева',
    'Дом Дейн из Звездопада',
    'Дом Веларион из Дрифтмарка',
    'Дом Хайтауэр из Староместа',
    'Ночной Дозор (Чёрный Замок)',
    'Орден Мейстеров (Цитадель)',
    'Малый рыцарский дом / Межевой рыцарь без герба',
    'Бастард (Сноу / Стоун / Риверс / Уотерс / Хилл / Пайк / Флауэрс / Шторм / Сэнд)'
  ];

  var WE_REGIONS_LIST = [
    'Север',
    'Королевские Земли (Королевская Гавань / Драконий Камень)',
    'Западные Земли (Утёс Кастерли / Ланниспорт)',
    'Простор (Хайгарден / Старомест)',
    'Штормовые Земли',
    'Долина Аррен',
    'Речные Земли',
    'Железные Острова',
    'Дорн',
    'Стена и Земли за Стеной',
    'Вольные Города Эссоса (Браавос, Волантис, Лис, Мир, Пентос)',
    'Залив Работорговцев / Дотракийское море'
  ];

  var WE_ERAS_LIST = [
    '298 З.Э. — Канон «Игры престолов» (Конец Долгого Лета)',
    '299–300 З.Э. — Война Пяти Королей',
    '281–283 З.Э. — Восстание Роберта Баратеона (Война Узурпатора)',
    '209–259 З.Э. — Эпоха «Рыцаря Семи Королевств» и Восстания Блэкфайра',
    '129–131 З.Э. — Танец Драконов',
    '1–103 З.Э. — Завоевание Эйгона и Расцвет Таргариенов'
  ];

  var WE_SEASONS_LIST = [
    '☀️ Долгое Лето',
    '🍂 Осень (Холодные ветра и дожди)',
    '❄️ Белая Зима («Зима близко»)',
    '🌱 Ложная Весна / Оттепель'
  ];

  var WE_TECH_CATEGORIES = [
    { key: 'all', label: 'Все способности', icon: '⚔️' },
    { key: 'prepared', label: 'Выбранное (Наготове)', icon: '🌟' },
    { key: 'Воинские приёмы и Стойки', label: 'Воинские приёмы и Стойки', icon: '🗡️' },
    { key: 'Рыцарское мастерство и Командование', label: 'Рыцарство и Командование', icon: '🛡️' },
    { key: 'Водяной танец и Школы Эссоса', label: 'Водяной танец и Эссос', icon: '💃' },
    { key: 'Интриги, Шептуны и Мейстерство', label: 'Интриги и Мейстерство', icon: '🍷' },
    { key: 'Древние Дары Крови (Дракон / Варг / Р\'глор)', label: 'Дары Крови (Опционально)', icon: '🐉' },
    { key: 'Черты и Особые таланты', label: 'Черты и Таланты', icon: '🎖️' }
  ];

  var WE_THEMES = [
    {
      id: 'iron_throne',
      title: 'Железный Трон',
      sub: 'Королевская Гавань • Кованая сталь, золото Короны и багрянец',
      icon: '👑',
      accent: '#c9a45c',
      accentBright: '#fbbf24',
      accentDim: 'rgba(201,164,92,0.42)',
      accentSoft: 'rgba(201,164,92,0.14)',
      glow: 'rgba(201,164,92,0.46)',
      secondary: '#991b1b',
      secondaryGlow: 'rgba(153,27,27,0.38)',
      bg0: '#0b0d12',
      bg1: 'rgba(18,22,30,0.92)',
      bg2: 'rgba(26,32,44,0.96)',
      radialTop: 'rgba(201,164,92,0.15)',
      radialBot: 'rgba(153,27,27,0.13)',
      ember1: '#fbbf24',
      ember2: '#dc2626',
      spin: false,
      toast: '👑 Тема Вестероса: Железный Трон Семи Королевств'
    },
    {
      id: 'stark',
      title: 'Дом Старк',
      sub: 'Винтерфелл • Зимняя сталь, лютоволк и багряная листва чардрева',
      icon: '🐺',
      accent: '#94a3b8',
      accentBright: '#e2e8f0',
      accentDim: 'rgba(148,163,184,0.42)',
      accentSoft: 'rgba(148,163,184,0.14)',
      glow: 'rgba(226,232,240,0.42)',
      secondary: '#991b1b',
      secondaryGlow: 'rgba(153,27,27,0.35)',
      bg0: '#090d14',
      bg1: 'rgba(15,21,31,0.92)',
      bg2: 'rgba(22,30,44,0.96)',
      radialTop: 'rgba(148,163,184,0.16)',
      radialBot: 'rgba(153,27,27,0.12)',
      ember1: '#e2e8f0',
      ember2: '#cbd5e1',
      spin: false,
      toast: '🐺 Тема Дома: Старки из Винтерфелла • «Зима близко»'
    },
    {
      id: 'targaryen',
      title: 'Дом Таргариен',
      sub: 'Драконий Камень • Чёрный обсидиан и кровавое драконье пламя',
      icon: '🐉',
      accent: '#dc2626',
      accentBright: '#f87171',
      accentDim: 'rgba(220,38,38,0.45)',
      accentSoft: 'rgba(220,38,38,0.16)',
      glow: 'rgba(239,68,68,0.50)',
      secondary: '#f59e0b',
      secondaryGlow: 'rgba(245,158,11,0.35)',
      bg0: '#0f0709',
      bg1: 'rgba(24,11,15,0.93)',
      bg2: 'rgba(36,15,21,0.96)',
      radialTop: 'rgba(220,38,38,0.20)',
      radialBot: 'rgba(245,158,11,0.12)',
      ember1: '#ef4444',
      ember2: '#f59e0b',
      spin: true,
      toast: '🐉 Тема Дома: Таргариены • «Пламя и Кровь»'
    },
    {
      id: 'lannister',
      title: 'Дом Ланнистер',
      sub: 'Утёс Кастерли • Червонное золото Запада и пурпур плащей',
      icon: '🦁',
      accent: '#eab308',
      accentBright: '#fde047',
      accentDim: 'rgba(234,179,8,0.44)',
      accentSoft: 'rgba(234,179,8,0.15)',
      glow: 'rgba(250,204,21,0.48)',
      secondary: '#b91c1c',
      secondaryGlow: 'rgba(185,28,28,0.42)',
      bg0: '#110809',
      bg1: 'rgba(28,13,15,0.92)',
      bg2: 'rgba(40,18,21,0.96)',
      radialTop: 'rgba(234,179,8,0.18)',
      radialBot: 'rgba(185,28,28,0.16)',
      ember1: '#fde047',
      ember2: '#ef4444',
      spin: false,
      toast: '🦁 Тема Дома: Ланнистеры • «Услышь мой рёв!»'
    },
    {
      id: 'baratheon',
      title: 'Дом Баратеон',
      sub: 'Штормовой Предел • Грозовое золото, чёрный олень и молнии',
      icon: '🦌',
      accent: '#f59e0b',
      accentBright: '#fcd34d',
      accentDim: 'rgba(245,158,11,0.44)',
      accentSoft: 'rgba(245,158,11,0.15)',
      glow: 'rgba(245,158,11,0.48)',
      secondary: '#38bdf8',
      secondaryGlow: 'rgba(56,189,248,0.34)',
      bg0: '#0d0c08',
      bg1: 'rgba(22,20,14,0.92)',
      bg2: 'rgba(32,29,20,0.96)',
      radialTop: 'rgba(245,158,11,0.19)',
      radialBot: 'rgba(56,189,248,0.12)',
      ember1: '#fcd34d',
      ember2: '#38bdf8',
      spin: false,
      toast: '🦌 Тема Дома: Баратеоны • «Нам — ярость!»'
    },
    {
      id: 'martell',
      title: 'Дом Мартелл',
      sub: 'Солнечное Копьё • Дорнийское солнце, бронза и красные пески',
      icon: '☀️',
      accent: '#f97316',
      accentBright: '#fdba74',
      accentDim: 'rgba(249,115,22,0.44)',
      accentSoft: 'rgba(249,115,22,0.15)',
      glow: 'rgba(249,115,22,0.48)',
      secondary: '#eab308',
      secondaryGlow: 'rgba(234,179,8,0.36)',
      bg0: '#120a06',
      bg1: 'rgba(28,16,10,0.92)',
      bg2: 'rgba(40,23,14,0.96)',
      radialTop: 'rgba(249,115,22,0.19)',
      radialBot: 'rgba(234,179,8,0.14)',
      ember1: '#fb923c',
      ember2: '#fde047',
      spin: true,
      toast: '☀️ Тема Дома: Мартеллы из Дорна • «Непреклонные, несгибаемые, непокорённые»'
    },
    {
      id: 'nights_watch',
      title: 'Ночной Дозор',
      sub: 'Чёрный Замок и Стена • Вороново крыло, синий лёд и обсидиан',
      icon: '🐦‍⬛',
      accent: '#38bdf8',
      accentBright: '#bae6fd',
      accentDim: 'rgba(56,189,248,0.40)',
      accentSoft: 'rgba(56,189,248,0.14)',
      glow: 'rgba(56,189,248,0.45)',
      secondary: '#64748b',
      secondaryGlow: 'rgba(100,116,139,0.36)',
      bg0: '#060a10',
      bg1: 'rgba(11,17,26,0.93)',
      bg2: 'rgba(16,24,37,0.96)',
      radialTop: 'rgba(56,189,248,0.16)',
      radialBot: 'rgba(100,116,139,0.14)',
      ember1: '#bae6fd',
      ember2: '#e2e8f0',
      spin: false,
      toast: '🐦‍⬛ Тема Ордена: Ночной Дозор • «Щит, охраняющий царства людей»'
    },
    {
      id: 'citadel',
      title: 'Цитадель Староместа',
      sub: 'Орден Мейстеров • Зелёный огонь сфинксов, серебряная цепь и пергамент',
      icon: '📜',
      accent: '#10b981',
      accentBright: '#6ee7b7',
      accentDim: 'rgba(16,185,129,0.42)',
      accentSoft: 'rgba(16,185,129,0.14)',
      glow: 'rgba(16,185,129,0.45)',
      secondary: '#c9a45c',
      secondaryGlow: 'rgba(201,164,92,0.35)',
      bg0: '#070f0c',
      bg1: 'rgba(12,24,20,0.92)',
      bg2: 'rgba(18,34,28,0.96)',
      radialTop: 'rgba(16,185,129,0.17)',
      radialBot: 'rgba(201,164,92,0.13)',
      ember1: '#6ee7b7',
      ember2: '#fbbf24',
      spin: true,
      toast: '📜 Тема Ордена: Цитадель Староместа и Гильдия Алхимиков'
    }
  ];

  var WE_MAP_SOURCES = [
    {
      id: 'loremaps_got',
      label: 'LoreMaps: The Known World (Вестерос и Эссос)',
      url: 'https://loremaps.azurewebsites.net/Maps/GoT'
    },
    {
      id: 'quartermaester',
      label: 'Quartermaester (Интерактивная карта маршрутов и Домов)',
      url: 'https://quartermaester.info/'
    },
    {
      id: 'awoiaf_map',
      label: 'A Wiki of Ice and Fire — Атлас',
      url: 'https://awoiaf.westeros.org/index.php/Portal:Geography'
    }
  ];

  function esc(s){
    return (typeof escapeHtml === 'function')
      ? escapeHtml(String(s == null ? '' : s))
      : String(s == null ? '' : s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
  }

  function escAttr(s){
    return (typeof escapeAttr === 'function')
      ? escapeAttr(String(s == null ? '' : s))
      : esc(s);
  }

  function getWeRoleIcon(roleOrHouse){
    var s = String(roleOrHouse || '').toLowerCase();
    if(s.indexOf('таргариен') !== -1 || s.indexOf('дракон') !== -1 || s.indexOf('валир') !== -1) return '🐉';
    if(s.indexOf('старк') !== -1 || s.indexOf('север') !== -1 || s.indexOf('волк') !== -1) return '🐺';
    if(s.indexOf('ланнистер') !== -1 || s.indexOf('лев') !== -1) return '🦁';
    if(s.indexOf('баратеон') !== -1 || s.indexOf('олень') !== -1 || s.indexOf('шторм') !== -1) return '🦌';
    if(s.indexOf('мартелл') !== -1 || s.indexOf('дорн') !== -1 || s.indexOf('копь') !== -1) return '☀️';
    if(s.indexOf('грейджой') !== -1 || s.indexOf('железн') !== -1 || s.indexOf('море') !== -1) return '🦑';
    if(s.indexOf('тирелл') !== -1 || s.indexOf('простор') !== -1) return '🌹';
    if(s.indexOf('аррен') !== -1 || s.indexOf('долин') !== -1) return '🦅';
    if(s.indexOf('дозор') !== -1 || s.indexOf('ворон') !== -1) return '🐦‍⬛';
    if(s.indexOf('мейстер') !== -1 || s.indexOf('цитадел') !== -1) return '📜';
    if(s.indexOf('шептун') !== -1 || s.indexOf('интриг') !== -1 || s.indexOf('куртизан') !== -1 || s.indexOf('заведен') !== -1) return '🍷';
    if(s.indexOf('водян') !== -1 || s.indexOf('браво') !== -1) return '💃';
    if(s.indexOf('жрец') !== -1 || s.indexOf('р\'глор') !== -1 || s.indexOf('алхим') !== -1) return '🔥';
    if(s.indexOf('рыцарь') !== -1 || s.indexOf('сир') !== -1 || s.indexOf('гварди') !== -1) return '🛡️';
    if(s.indexOf('лорд') !== -1 || s.indexOf('наследн') !== -1) return '👑';
    return '⚔️';
  }

  function defaultWesterosCharacter(customName){
    return {
      id: 'we_char_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: customName || '',
      playerName: '',
      house: 'Дом Старк из Винтерфелла',
      role: 'Помазанный рыцарь (Сир)',
      origin: 'Первые Люди (Северянин)',
      region: 'Север',
      era: '298 З.Э. — Канон «Игры престолов» (Конец Долгого Лета)',
      season: '☀️ Долгое Лето',
      motto: '',
      heraldry: 'Чистый дублет с родовым гербом, меч в ножнах на перевязи',
      level: 1,
      xp: 0,
      ac: 16,
      armorType: 'Кольчуга поверх стёганого гамбезона',
      hpCur: 12,
      hpMax: 12,
      staminaCur: 10,
      staminaMax: 10,
      hitDiceTotal: '1',
      hitDiceType: 'd10',
      exhaustion: 0,
      initMisc: 0,
      woundsAndEffects: 'Чист (без ранений, хмеля и макового молока)',
      abilities: { str: 15, dex: 13, con: 14, int: 10, wis: 12, cha: 11 },
      saveProf: { str: true, dex: false, con: true, int: false, wis: false, cha: false },
      skillProf: { athletics: 1, intimidation: 1, perception: 1, insight: 1 },
      attacks: [
        {
          name: 'Длинный меч (Замковая сталь)',
          bonus: '+5',
          damage: '1d8+3 рубящий',
          mastery: 'Пронзание (Sap) • Замковая сталь'
        },
        {
          name: 'Кинжал-рондель (Мизерикорд)',
          bonus: '+5',
          damage: '1d4+3 колющий',
          mastery: 'Быстрое оружие (Nick) • Против сочленений лат'
        }
      ],
      goldDragons: 2,
      silverStags: 45,
      copperStars: 0,
      copperPennies: 24,
      bankVault: '0 зд (Железный Банк / Казна замка)',
      equipOnSelf: 'Меч на поясе, кинжал-рондель, кожаный кошель с монетами, фляга с вином, перевязки мейстера (2 шт.), личная печатка и сургуч.',
      equipStorage: 'В седельных сумах скакуна: походный плащ с меховым подбоем, сменная рубаха, запас стрел (20 шт.), сухпаёк на 3 дня.',
      profArmor: 'Лёгкие, средние и тяжёлые доспехи, щиты',
      profWeapons: 'Воинское и простое оружие Вестероса',
      profTools: 'Верховая езда, геральдика, игра в Кайвассу',
      languages: 'Общий язык Семи Королевств',
      bloodGiftType: 'none',
      bloodGiftNotes: '',
      companionNotes: 'Боевой конь (дестриэ «Гром», HP 19, КБ 11) • Оруженосец',
      domainNotes: '',
      repRecognition: '1 / 5 (Известен в своём регионе)',
      repHonor: '+15 (Человек чести и верный слову)',
      repHouses: 'Дом сюзерена: Благосклонность (+1)',
      repLegal: 'Законное право ношения меча и родового герба',
      oathsAndDebts: '',
      traits: '',
      ideals: '',
      bonds: '',
      flaws: '',
      age: '22 года',
      height: '6 футов',
      weight: '185 фунтов',
      eyes: '',
      skin: '',
      hair: '',
      backstory: '',
      techs: [
        {
          id: 'we_tech_default_1',
          prepared: true,
          name: 'Второе дыхание и Стойкость в латах',
          category: 'Воинские приёмы и Стойки',
          source: 'Рыцарская выучка • 1 ур.',
          actionCost: '1 бонусное действие',
          cooldown: 'Короткий или долгий отдых',
          checkOrSave: '1d10+1',
          desc: 'Собрав волю и переведя дух за щитом или в глухой защите, боец восстанавливает 1d10 + уровень хитов (Бодрости) и снимает мелкое ошеломление в схватке.'
        },
        {
          id: 'we_tech_default_2',
          prepared: true,
          name: 'Парирование и Ответный выпад клинком',
          category: 'Воинские приёмы и Стойки',
          source: 'Мастер оружия • Кость d8',
          actionCost: '1 реакция',
          cooldown: '4 кости за короткий отдых',
          checkOrSave: '1d8+3',
          desc: 'Когда противник попадает по вам рукопашной атакой, вы можете реакцией потратить кость мастерства (1d8) и уменьшить входящий урон на 1d8 + модификатор ЛОВ или СИЛ. Если урон снижен до 0 — вы открываете брешь в защите врага.'
        }
      ]
    };
  }

  var WE = window.WE = {
    profiles: [],
    activeProfileId: '',
    THEMES: WE_THEMES,
    MAP_SOURCES: WE_MAP_SOURCES,
    TECH_CATEGORIES: WE_TECH_CATEGORIES,

    loadProfiles: function(){
      try {
        var raw = localStorage.getItem(WE_PROFILES_KEY);
        if(raw && raw !== 'undefined'){
          var arr = JSON.parse(raw);
          if(Array.isArray(arr) && arr.length > 0){
            var def = defaultWesterosCharacter();
            arr.forEach(function(c, idx){
              if(!c) return;
              if(!c.id) c.id = 'we_char_' + Date.now() + '_' + idx;
              Object.keys(def).forEach(function(k){
                if(c[k] === undefined) c[k] = JSON.parse(JSON.stringify(def[k]));
              });
              if(!Array.isArray(c.techs)) c.techs = [];
              if(!Array.isArray(c.attacks)) c.attacks = [];
              if(!c.abilities || typeof c.abilities !== 'object') c.abilities = JSON.parse(JSON.stringify(def.abilities));
              if(!c.saveProf || typeof c.saveProf !== 'object') c.saveProf = JSON.parse(JSON.stringify(def.saveProf));
              if(!c.skillProf || typeof c.skillProf !== 'object') c.skillProf = JSON.parse(JSON.stringify(def.skillProf));
            });
            var savedAct = localStorage.getItem(WE_ACTIVE_ID_KEY);
            var resolved = (savedAct && arr.some(function(p){ return p && p.id === savedAct; })) ? savedAct : arr[0].id;
            WE.profiles = arr;
            WE.activeProfileId = resolved;
            return WE.profiles;
          }
        }
      } catch(e){}
      var first = defaultWesterosCharacter();
      WE.profiles = [first];
      WE.activeProfileId = first.id;
      WE.saveProfiles();
      return WE.profiles;
    },

    saveProfiles: function(){
      try {
        localStorage.setItem(WE_PROFILES_KEY, JSON.stringify(WE.profiles));
        if(WE.activeProfileId) localStorage.setItem(WE_ACTIVE_ID_KEY, WE.activeProfileId);
      } catch(e){}
      if(typeof paintShBar === 'function') paintShBar();
    },

    getActiveCharacter: function(){
      if(!Array.isArray(WE.profiles) || !WE.profiles.length) WE.loadProfiles();
      var found = WE.profiles.find(function(c){ return c && c.id === WE.activeProfileId; });
      if(!found){
        found = WE.profiles[0];
        if(found) WE.activeProfileId = found.id;
      }
      return found;
    },

    setActiveCharacter: function(id){
      if(!Array.isArray(WE.profiles) || !WE.profiles.length) WE.loadProfiles();
      var found = WE.profiles.find(function(c){ return c && c.id === id; });
      if(found){
        WE.activeProfileId = found.id;
        try { localStorage.setItem(WE_ACTIVE_ID_KEY, found.id); } catch(e){}
        if(typeof paintShBar === 'function') paintShBar();
      }
      return found;
    },

    loadCampaign: function(){
      try {
        var raw = localStorage.getItem(WE_CAMPAIGN_KEY);
        if(raw) return JSON.parse(raw);
      } catch(e){}
      return {
        title: 'Хроники Семи Королевств',
        era: '298 З.Э. — Канец Долгого Лета',
        location: 'Королевская Гавань / Королевский тракт',
        notes: ''
      };
    },

    saveCampaign: function(camp){
      try {
        localStorage.setItem(WE_CAMPAIGN_KEY, JSON.stringify(camp || {}));
      } catch(e){}
    },

    getTheme: function(){
      try {
        var s = localStorage.getItem(WE_THEME_KEY);
        if(s && WE_THEMES.some(function(t){ return t.id === s; })) return s;
      } catch(e){}
      return 'iron_throne';
    },

    setTheme: function(id){
      var found = WE_THEMES.find(function(t){ return t.id === id; }) || WE_THEMES[0];
      try {
        localStorage.setItem(WE_THEME_KEY, found.id);
      } catch(e){}
      applyWesterosTheme();
      return found.id;
    },

    toast: function(msg){
      if(typeof showFaerunToast === 'function'){
        showFaerunToast(msg);
      } else if(typeof GHSync !== 'undefined' && typeof GHSync.toast === 'function'){
        GHSync.toast(msg, 'success');
      }
    }
  };

  WE.loadProfiles();
  window.getActiveWesterosCharacter = function(){ return WE.getActiveCharacter(); };

  /* ---------- ФОНОВЫЕ ВЕКТОРНЫЕ ГЕРБЫ ДОМОВ И ОРДЕНОВ ВЕСТЕРОСА ---------- */
  function buildWesterosCrestSvg(themeId){
    switch(themeId){
      case 'stark':
        /* Геральдический щит Севера, профиль лютоволка и ветви чардрева */
        return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
          '<circle cx="100" cy="100" r="86" stroke-dasharray="10 6" opacity="0.38"/>' +
          '<path d="M52 42 L100 28 L148 42 L148 104 C148 142, 100 168, 100 176 C100 168, 52 142, 52 104 Z" fill="currentColor" fill-opacity="0.12" stroke-width="3"/>' +
          '<path d="M72 118 L66 84 L82 96 L96 68 L112 86 L128 66 L132 98 L142 106 L124 126 L102 138 L78 130 Z" fill="currentColor" fill-opacity="0.22" stroke-width="2.6"/>' +
          '<circle cx="114" cy="96" r="2.8" fill="currentColor"/>' +
          '<line x1="100" y1="18" x2="100" y2="184" stroke-opacity="0.35"/>' +
        '</svg>';
      case 'targaryen':
        /* Трёхглавое кольцо пламени и крылья дракона Валирии */
        return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
          '<g class="fae-spin-ring">' +
            '<circle cx="100" cy="100" r="88" stroke-dasharray="8 5" opacity="0.45"/>' +
            '<circle cx="100" cy="100" r="76" opacity="0.32"/>' +
          '</g>' +
          '<path d="M100 32 C122 54, 152 56, 166 38 C156 76, 136 96, 100 100 C64 96, 44 76, 34 38 C48 56, 78 54, 100 32 Z" fill="currentColor" fill-opacity="0.18" stroke-width="2.6"/>' +
          '<path d="M100 100 C134 110, 156 134, 154 166 C128 146, 114 134, 100 168 C86 134, 72 146, 46 166 C44 134, 66 110, 100 100 Z" fill="currentColor" fill-opacity="0.16" stroke-width="2.4"/>' +
          '<circle cx="100" cy="100" r="18" fill="currentColor" fill-opacity="0.26" stroke-width="2.8"/>' +
        '</svg>';
      case 'lannister':
        /* Коронованный лев Утёса Кастерли и солнечные лучи золота */
        return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">' +
          '<circle cx="100" cy="100" r="86" stroke-dasharray="12 6" opacity="0.4"/>' +
          '<path d="M54 44 L100 28 L146 44 L146 104 C146 140, 100 166, 100 174 C100 166, 54 140, 54 104 Z" fill="currentColor" fill-opacity="0.14" stroke-width="3"/>' +
          '<polygon points="74,64 84,48 100,60 116,48 126,64" fill="currentColor" fill-opacity="0.28"/>' +
          '<path d="M74 72 C64 92, 68 122, 100 142 C132 122, 136 92, 126 72 Z" fill="currentColor" fill-opacity="0.20" stroke-width="2.6"/>' +
          '<line x1="100" y1="68" x2="100" y2="148" stroke-width="2.8"/>' +
        '</svg>';
      case 'baratheon':
        /* Корона и рога Штормового Оленя + молнии */
        return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
          '<circle cx="100" cy="100" r="86" stroke-dasharray="9 6" opacity="0.38"/>' +
          '<path d="M100 156 L84 112 L90 84 L100 94 L110 84 L116 112 Z" fill="currentColor" fill-opacity="0.22"/>' +
          '<path d="M88 86 C64 74, 46 52, 48 28 M64 62 L52 44 M74 74 L68 52" stroke-width="3.2"/>' +
          '<path d="M112 86 C136 74, 154 52, 152 28 M136 62 L148 44 M126 74 L132 52" stroke-width="3.2"/>' +
          '<polygon points="78,104 88,92 100,102 112,92 122,104" fill="currentColor" fill-opacity="0.32"/>' +
        '</svg>';
      case 'martell':
        /* Солнце Дорна, пронзённое золотым копьём */
        return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">' +
          '<g class="fae-spin-ring">' +
            '<circle cx="100" cy="100" r="86" stroke-dasharray="6 6" opacity="0.45"/>' +
            '<polygon points="100,12 114,42 146,24 134,58 170,58 144,84 182,100 144,116 170,142 134,142 146,176 114,158 100,188 86,158 54,176 66,142 30,142 56,116 18,100 56,84 30,58 66,58 54,24 86,42" fill="currentColor" fill-opacity="0.14"/>' +
          '</g>' +
          '<circle cx="100" cy="100" r="34" fill="currentColor" fill-opacity="0.22" stroke-width="3"/>' +
          '<line x1="26" y1="174" x2="174" y2="26" stroke-width="4.5"/>' +
          '<polygon points="174,26 148,36 164,52" fill="currentColor"/>' +
        '</svg>';
      case 'nights_watch':
        /* Чёрный щит Дозора, скрещённые клинки и крылья ворона */
        return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
          '<circle cx="100" cy="100" r="86" stroke-dasharray="8 6" opacity="0.38"/>' +
          '<path d="M56 46 L100 32 L144 46 L144 106 C144 140, 100 166, 100 172 C100 166, 56 140, 56 106 Z" fill="currentColor" fill-opacity="0.15" stroke-width="3"/>' +
          '<path d="M32 76 C58 68, 78 78, 100 98 C122 78, 142 68, 168 76 C148 98, 126 112, 100 118 C74 112, 52 98, 32 76 Z" fill="currentColor" fill-opacity="0.22"/>' +
          '<line x1="100" y1="22" x2="100" y2="178" stroke-width="3.6"/>' +
        '</svg>';
      case 'citadel':
        /* Цепь Мейстера Цитадели и пламя стеклянной свечи */
        return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
          '<g class="fae-spin-ring">' +
            '<circle cx="100" cy="100" r="84" stroke-width="7" stroke-dasharray="14 8" opacity="0.42"/>' +
            '<circle cx="100" cy="100" r="70" stroke-dasharray="5 5" opacity="0.35"/>' +
          '</g>' +
          '<path d="M100 44 C122 72, 126 102, 100 128 C74 102, 78 72, 100 44 Z" fill="currentColor" fill-opacity="0.24" stroke-width="2.8"/>' +
          '<rect x="86" y="128" width="28" height="34" fill="currentColor" fill-opacity="0.18"/>' +
        '</svg>';
      default:
        /* Железный Трон: корона, щит и веер скрещённых клинков */
        return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">' +
          '<circle cx="100" cy="100" r="86" stroke-dasharray="10 6" opacity="0.38"/>' +
          '<line x1="100" y1="14" x2="100" y2="186" stroke-width="4.2"/>' +
          '<line x1="36" y1="164" x2="164" y2="36" stroke-width="3.6"/>' +
          '<line x1="164" y1="164" x2="36" y2="36" stroke-width="3.6"/>' +
          '<line x1="64" y1="176" x2="136" y2="24" stroke-width="2.4" opacity="0.65"/>' +
          '<line x1="136" y1="176" x2="64" y2="24" stroke-width="2.4" opacity="0.65"/>' +
          '<path d="M58 52 L100 36 L142 52 L142 106 C142 138, 100 162, 100 168 C100 162, 58 138, 58 106 Z" fill="currentColor" fill-opacity="0.16" stroke-width="3"/>' +
          '<polygon points="72,88 84,66 100,82 116,66 128,88 122,102 78,102" fill="currentColor" fill-opacity="0.28" stroke-width="2.4"/>' +
        '</svg>';
    }
  }

  function getWesterosFlyingSymbolSvg(themeId, idx){
    var v = idx % 3;
    if(v === 0){
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="6" y1="30" x2="30" y2="6"/><line x1="10" y1="20" x2="16" y2="26"/><circle cx="6" cy="30" r="2" fill="currentColor"/></svg>';
    }
    if(v === 1){
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 7 L18 4 L28 7 L28 18 C28 25, 18 31, 18 32 C18 31, 8 25, 8 18 Z" fill="currentColor" fill-opacity="0.24"/></svg>';
    }
    return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><polygon points="8,24 12,12 18,19 24,12 28,24" fill="currentColor" fill-opacity="0.28"/></svg>';
  }

  function buildWesterosThemeFx(cont, themeObj){
    if(!cont || !themeObj) return;
    cont.innerHTML = '';
    cont.setAttribute('data-we-theme', themeObj.id);

    var aura = document.createElement('div');
    aura.className = 'fae-fx-aura';
    cont.appendChild(aura);

    var mist = document.createElement('div');
    mist.className = 'fae-fx-mist';
    cont.appendChild(mist);

    var crestWrap = document.createElement('div');
    crestWrap.className = 'fae-bg-crest-wrap';
    var crestSvg = buildWesterosCrestSvg(themeObj.id);
    crestWrap.innerHTML =
      '<div class="fae-bg-crest-main' + (themeObj.spin ? ' spin-slow' : '') + '">' + crestSvg + '</div>' +
      '<div class="fae-bg-crest-corner">' + crestSvg + '</div>';
    cont.appendChild(crestWrap);

    var signsWrap = document.createElement('div');
    signsWrap.className = 'fae-bg-signs';
    var spots = [
      { top: 74, left: 10, dir: 'up-right', dur: 24, delay: -4, size: 26 },
      { top: 18, left: 84, dir: 'down-left', dur: 26, delay: -12, size: 24 },
      { top: 78, left: 80, dir: 'up-left', dur: 23, delay: -7, size: 27 },
      { top: 22, left: 14, dir: 'down-right', dur: 25, delay: -16, size: 24 },
      { top: 48, left: 76, dir: 'wave', dur: 24, delay: -10, size: 25 },
      { top: 68, left: 28, dir: 'cross', dur: 25, delay: -18, size: 24 }
    ];
    for(var i = 0; i < spots.length; i++){
      var sp = spots[i];
      var sym = document.createElement('div');
      sym.className = 'fae-flying-symbol fae-dir-' + sp.dir + (i % 3 === 2 ? ' alt-color' : '');
      sym.style.width = sp.size + 'px';
      sym.style.height = sp.size + 'px';
      sym.style.top = sp.top + '%';
      sym.style.left = sp.left + '%';
      sym.style.animationDuration = sp.dur + 's';
      sym.style.animationDelay = sp.delay + 's';
      sym.innerHTML = getWesterosFlyingSymbolSvg(themeObj.id, i);
      signsWrap.appendChild(sym);
    }
    cont.appendChild(signsWrap);

    var emberCount = 10;
    for(var e = 0; e < emberCount; e++){
      var ember = document.createElement('div');
      ember.className = 'fae-ember';
      var sz = (Math.random() * 3.0 + 2.0).toFixed(1);
      var left = (Math.random() * 96 + 2).toFixed(1);
      var dur = (Math.random() * 8 + 8).toFixed(1);
      var delay = (-Math.random() * 16).toFixed(1);
      ember.style.width = sz + 'px';
      ember.style.height = sz + 'px';
      ember.style.left = left + '%';
      ember.style.animationDuration = dur + 's';
      ember.style.animationDelay = delay + 's';
      var cHex = (e % 2 === 0) ? (themeObj.ember1 || themeObj.accentBright) : (themeObj.ember2 || themeObj.accent);
      ember.style.background = cHex;
      ember.style.boxShadow = '0 0 6px ' + cHex;
      cont.appendChild(ember);
    }
  }

  function applyWesterosTheme(){
    if(typeof document === 'undefined' || !document.body) return;
    var fx = document.getElementById('weThemeFx');
    var isWeMode = (typeof HB !== 'undefined' && HB.mode === 'we');
    if(!isWeMode){
      if(document.body.classList.contains('we-theme')){
        document.body.classList.remove('we-theme');
        document.body.removeAttribute('data-we-theme-active');
      }
      if(fx && fx.style.display !== 'none') fx.style.display = 'none';
      return;
    }

    var curId = WE.getTheme();
    var tObj = WE_THEMES.find(function(t){ return t.id === curId; }) || WE_THEMES[0];

    if(!document.body.classList.contains('we-theme') || document.body.getAttribute('data-we-theme-active') !== tObj.id){
      document.body.classList.add('we-theme');
      document.body.setAttribute('data-we-theme-active', tObj.id);
      var st = document.body.style;
      st.setProperty('--fae-accent', tObj.accent);
      st.setProperty('--fae-accent-bright', tObj.accentBright);
      st.setProperty('--fae-accent-dim', tObj.accentDim);
      st.setProperty('--fae-accent-soft', tObj.accentSoft);
      st.setProperty('--fae-accent-glow', tObj.glow);
      st.setProperty('--fae-secondary', tObj.secondary);
      st.setProperty('--fae-secondary-glow', tObj.secondaryGlow);
      st.setProperty('--fae-bg-0', tObj.bg0);
      st.setProperty('--fae-bg-1', tObj.bg1);
      st.setProperty('--fae-bg-2', tObj.bg2);
      st.setProperty('--fae-radial-top', tObj.radialTop);
      st.setProperty('--fae-radial-bot', tObj.radialBot);
    }

    if(!fx){
      fx = document.createElement('div');
      fx.id = 'weThemeFx';
      fx.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(fx, document.body.firstChild);
    }
    if(fx.getAttribute('data-we-theme') !== tObj.id || fx.children.length === 0){
      buildWesterosThemeFx(fx, tObj);
    }
    if(fx.style.display !== 'block') fx.style.display = 'block';
  }
  window.applyWesterosTheme = applyWesterosTheme;

  /* ==========================================================================
     1. ГЛАВНЫЙ ЭКРАН «ВЕСТЕРОС» (weHome)
     Только Профиль Персонажа + 3 кнопки: Способности, Карта, Данные
     ========================================================================== */
  function weHome(){
    var c = WE.getActiveCharacter();
    var icon = c ? getWeRoleIcon(c.house || c.role) : '👑';
    var heroName = (c && c.name) ? esc(c.name) : 'Новый персонаж Вестероса';
    var heroSubtitle = c
      ? ([
          c.house,
          c.role ? (c.role + ' ' + (c.level || 1) + ' ур.') : null,
          c.region,
          c.season
        ].filter(Boolean).map(esc).join(' • ') || 'Семь Королевств и Эссос • Песнь Льда и Огня')
      : 'Семь Королевств и Эссос • D&D 2024 Low-Fantasy';

    var hpMax = c ? (c.hpMax != null ? c.hpMax : 12) : 12;
    var hpCur = c ? (c.hpCur != null ? c.hpCur : hpMax) : hpMax;
    var acVal = c ? (c.ac != null ? c.ac : 16) : 16;
    var lvlVal = c ? (c.level || 1) : 1;
    var pbVal = (typeof fmtMod === 'function' && typeof profBonus === 'function') ? fmtMod(profBonus(lvlVal)) : '+2';
    var techsCount = (c && Array.isArray(c.techs)) ? c.techs.length : 0;
    var prepCount = (c && Array.isArray(c.techs)) ? c.techs.filter(function(t){ return t && t.prepared; }).length : 0;
    var gd = c ? (Number(c.goldDragons) || 0) : 0;
    var ss = c ? (Number(c.silverStags) || 0) : 0;

    var hudHtml =
      '<div class="fae-hud" data-go="weData" role="button" tabindex="0" title="Открыть профиль, ростер и лист персонажа в разделе Данные" style="cursor:pointer;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">' +
          '<div>' +
            '<div class="fae-title">' + icon + ' ' + heroName + '</div>' +
            '<div style="font-family:\'EB Garamond\',serif;font-style:italic;color:#cbd5e1;font-size:14.5px;margin-top:2px;">' +
              heroSubtitle +
            '</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
            '<span class="fae-class-badge">' + icon + ' ' + (c && c.role ? esc(c.role) : 'Вестерос') + '</span>' +
            '<span class="fae-stat-badge">Ур. ' + lvlVal + ' (БМ ' + pbVal + ')</span>' +
            '<span class="fae-stat-badge hp">❤️ ' + hpCur + '/' + hpMax + ' HP</span>' +
            '<span class="fae-stat-badge ac">🛡️ КБ ' + acVal + '</span>' +
            '<span class="fae-stat-badge" title="Кошель: Золотые Драконы и Серебряные Олени">🪙 ' + gd + ' зд • ' + ss + ' со</span>' +
          '</div>' +
        '</div>' +
      '</div>';

    var cardsHtml =
      '<div class="menu-list grid-2">' +
        '<div class="fae-card fae-card-clickable" data-go="weTechs" role="button" tabindex="0">' +
          '<div style="flex:1;min-width:0;">' +
            '<div class="fae-card-title"><span>⚔️</span> Способности ' +
              (techsCount ? '<span class="fae-ref-header-badge" style="margin-left:6px;padding:1px 8px;font-size:11px;">' + techsCount + '</span>' : '') +
              (prepCount ? '<span class="fae-ref-header-badge" style="margin-left:5px;padding:1px 8px;font-size:11px;border-color:#fbbf24;color:#fde68a;background:rgba(251,191,36,0.16);" title="Выбранные (готовые к применению) приёмы и способности">🌟 ' + prepCount + ' выбр.</span>' : '') +
            '</div>' +
            '<div class="fae-card-desc">Воинские приёмы, рыцарское мастерство, фехтовальные школы, интриги, опциональные Дары Крови и боевой расчёт</div>' +
          '</div>' +
          '<div class="fae-card-arrow">›</div>' +
        '</div>' +

        '<div class="fae-card fae-card-clickable" data-go="weMap" role="button" tabindex="0">' +
          '<div style="flex:1;min-width:0;">' +
            '<div class="fae-card-title"><span>🗺️</span> Карта</div>' +
            '<div class="fae-card-desc">Интерактивная карта Известного Мира (LoreMaps: The Known World — Вестерос и Эссос) прямо на странице</div>' +
          '</div>' +
          '<div class="fae-card-arrow">›</div>' +
        '</div>' +

        '<div class="fae-card fae-card-clickable" data-go="weData" role="button" tabindex="0" style="grid-column: 1 / -1;">' +
          '<div style="flex:1;min-width:0;">' +
            '<div class="fae-card-title"><span>💾</span> Данные</div>' +
            '<div class="fae-card-desc">Полный лист персонажа Вестероса, ростер героев, казна (Драконы/Олени/Гроши), владения, темы Великих Домов, Gemini AI и резервные копии</div>' +
          '</div>' +
          '<div class="fae-card-arrow">›</div>' +
        '</div>' +
      '</div>';

    return hudHtml +
      '<div class="fae-rule"></div>' +
      '<div class="section-label">СИСТЕМНЫЕ РАЗДЕЛЫ // ВЕСТЕРОС</div>' +
      cardsHtml;
  }

  /* ==========================================================================
     2. КАРТА ВЕСТЕРОСА И ЭССОСА (weMap — LoreMaps: The Known World)
     ========================================================================== */
  function weMap(){
    if(!window._weMapSourceId) window._weMapSourceId = 'loremaps_got';
    var current = WE_MAP_SOURCES.find(function(m){ return m.id === window._weMapSourceId; }) || WE_MAP_SOURCES[0];
    var pills = WE_MAP_SOURCES.map(function(m){
      return '<button type="button" class="pill map-source-pill ' + (m.id === current.id ? 'active' : '') + '" data-we-map-src="' + escAttr(m.id) + '">' + esc(m.label) + '</button>';
    }).join('');

    return renderCrumb([{ label: 'Вестерос', nav: 'weHome' }, { label: 'Карта Известного Мира' }]) +
      '<button class="back" data-go="weHome">← На главную</button>' +
      '<h1>🗺️ Карта Известного Мира (The Known World)</h1>' +
      '<p class="subtitle">Интерактивная карта Вестероса и Эссоса (LoreMaps: The Known World) — встроена прямо на странице по образцу Фаэруна.</p>' +
      '<div class="fae-rule"></div>' +
      '<div class="pill-row" style="margin-bottom:14px;">' + pills + '</div>' +
      '<div class="map-controls-row">' +
        '<button type="button" class="map-toggle" id="weMapDarkToggle">🌙 Тёмные цвета карты</button>' +
        '<span style="font-size:12.5px;color:var(--ink-dim);">Инвертирует карту целиком — включай для комфортного чтения ночью.</span>' +
      '</div>' +
      '<div class="map-frame-wrap" id="weMapFrameWrap">' +
        '<iframe id="weMapIframe" src="' + escAttr(current.url) + '" title="Карта Вестероса и Эссоса (The Known World)" loading="lazy" ' +
          'referrerpolicy="no-referrer-when-downgrade" allowfullscreen allow="fullscreen" ' +
          'sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"></iframe>' +
      '</div>' +
      '<div class="map-fallback-row">' +
        '<span>Карта не загрузилась внутри фрейма?</span>' +
        '<a id="weMapFallbackLink" href="' + escAttr(current.url) + '" target="_blank" rel="noopener noreferrer">Открыть в новой вкладке ↗</a>' +
      '</div>';
  }

  function wireWeMap(){
    document.querySelectorAll('[data-we-map-src]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var srcId = btn.getAttribute('data-we-map-src');
        if(!srcId) return;
        window._weMapSourceId = srcId;
        render();
      });
    });

    var darkToggle = document.getElementById('weMapDarkToggle');
    var wrap = document.getElementById('weMapFrameWrap');
    if(darkToggle && wrap){
      var savedDark = false;
      try { savedDark = localStorage.getItem('ttc_we_map_dark') === '1'; } catch(e){}
      if(savedDark){
        wrap.classList.add('map-dark');
        darkToggle.classList.add('active');
      }
      darkToggle.addEventListener('click', function(){
        var isDark = wrap.classList.toggle('map-dark');
        darkToggle.classList.toggle('active', isDark);
        try { localStorage.setItem('ttc_we_map_dark', isDark ? '1' : '0'); } catch(e){}
      });
    }
  }

  /* ==========================================================================
     3. СПОСОБНОСТИ, ВОИНСКИЕ ПРИЁМЫ И ДАРЫ КРОВИ (weTechs)
     ========================================================================== */
  function renderWeTechLauncher(c){
    var techs = (c && Array.isArray(c.techs)) ? c.techs : [];
    if(!techs.length){
      return '<div class="sh-launcher" style="margin-bottom:16px;">' +
        '<div class="sh-launcher-title">⚔️ Боевой расчёт способности <span class="sh-badge-tag">AI Studio</span></div>' +
        '<div class="char-empty" style="margin:10px 0 0;padding:12px;">Способности и приёмы ещё не добавлены. Добавьте приём кнопкой выше или через ИИ-генератор, чтобы использовать боевой расчёт.</div>' +
      '</div>';
    }

    if(!window._weTechLauncher) window._weTechLauncher = {};
    var L = window._weTechLauncher;
    if(L.isOpen === undefined) L.isOpen = false;
    if(!L.mods) L.mods = { conc: 0, atk: 0, dmg: 0 };
    if(!L.rolledValues) L.rolledValues = {};
    if(!L.selectedTarget) L.selectedTarget = 'atk';

    var prepTechs = techs.filter(function(x){ return x && x.prepared; });
    var onlyPrep = !!(L.onlyPrepared && prepTechs.length > 0);
    var poolTechs = onlyPrep ? prepTechs : (prepTechs.length ? prepTechs.concat(techs.filter(function(x){ return !x.prepared; })) : techs);

    var selTech = poolTechs.find(function(x){ return x.id === L.techId; }) || poolTechs[0];
    if(L.techId !== selTech.id){
      L.techId = selTech.id;
      var initDmg = (typeof parseFaeDiceFormula === 'function') ? parseFaeDiceFormula(selTech.checkOrSave || selTech.desc || '') : null;
      L.mods.dmg = initDmg ? (initDmg.mod || 0) : 0;
      L.mods.atk = (typeof parseFaeSignedMod === 'function') ? parseFaeSignedMod(selTech.checkOrSave) : 0;
    }

    var isConc = !!L.isConc;
    var pDmg = (typeof parseFaeDiceFormula === 'function') ? parseFaeDiceFormula(selTech.checkOrSave || selTech.desc || '') : null;
    var selTarget = L.selectedTarget;
    if(selTarget === 'conc' && !isConc) selTarget = 'atk';
    if(selTarget === 'dmg' && !pDmg) selTarget = 'atk';
    L.selectedTarget = selTarget;

    var targetNames = { conc: '🛡️ Стойкость / Выдержка', atk: '🎯 Попадание / Проверка', dmg: '💥 Урон / Эффект' };
    var targetTitle = targetNames[selTarget] || '🎯 Попадание / Проверка';
    var curModVal = L.mods[selTarget] || 0;

    var buildTechOpt = function(t){
      var act = t.actionCost ? (' (' + t.actionCost + ')') : '';
      var sav = t.checkOrSave ? (' [' + t.checkOrSave + ']') : '';
      var pref = t.prepared ? '🌟 ' : '';
      return '<option value="' + escAttr(t.id) + '" ' + (t.id === selTech.id ? 'selected' : '') + '>' +
        pref + esc(t.category || 'Приём') + ' · ' + esc(t.name || 'Без названия') + act + sav +
      '</option>';
    };

    var techOpts = '';
    if(onlyPrep){
      techOpts = prepTechs.map(buildTechOpt).join('');
    } else if(prepTechs.length > 0){
      var restTechs = techs.filter(function(t){ return !t.prepared; });
      techOpts = '<optgroup label="🌟 ВЫБРАННОЕ (Наготове — ' + prepTechs.length + ')">' +
        prepTechs.map(buildTechOpt).join('') +
        '</optgroup>' +
        (restTechs.length ? ('<optgroup label="⚔️ Остальные приёмы (' + restTechs.length + ')">' + restTechs.map(buildTechOpt).join('') + '</optgroup>') : '');
    } else {
      techOpts = techs.map(buildTechOpt).join('');
    }

    var screenHtml = (typeof renderFaeTechLauncherDiceHtml === 'function')
      ? renderFaeTechLauncherDiceHtml(selTech, isConc, selTarget, L.mods, L.rolledValues)
      : '';

    var modBarHtml =
      '<div class="sh-mod-bar">' +
        '<div class="sh-mod-target-info">' +
          '<span>Выбран кубик:</span>' +
          '<span class="sh-mod-target-tag" id="weTechModTargetName">' + targetTitle + '</span>' +
        '</div>' +
        '<div class="sh-mod-controls">' +
          '<button type="button" class="sh-mod-step" data-we-tech-mod-delta="-5">−5</button>' +
          '<button type="button" class="sh-mod-step" data-we-tech-mod-delta="-1">−</button>' +
          '<input type="number" id="weTechActiveModInput" class="sh-active-mod-input" value="' + curModVal + '">' +
          '<button type="button" class="sh-mod-step" data-we-tech-mod-delta="1">+</button>' +
          '<button type="button" class="sh-mod-step" data-we-tech-mod-delta="5">+5</button>' +
          '<button type="button" class="sh-mod-reset" id="weTechModResetBtn">Сброс</button>' +
        '</div>' +
        '<label class="sh-exp-check">' +
          '<input type="checkbox" id="weTechLauncherConc"' + (isConc ? ' checked' : '') + '> 🛡️ Проверка Стойкости / Спасбросок' +
        '</label>' +
      '</div>';

    var actionsHtml =
      '<div class="sh-launcher-actions">' +
        '<button type="button" class="sh-btn-launch" id="weLaunchTechComboBtn">⚔️ Применить приём</button>' +
        '<button type="button" class="sh-btn-copy-all" id="weCopyAllTechBtn">📋 Скопировать всё</button>' +
        '<button type="button" class="sh-micro-btn" id="weLaunchTechAtkBtn">🎯 Попадание</button>' +
        (pDmg ? '<button type="button" class="sh-micro-btn" id="weLaunchTechDmgBtn">💥 Урон / Эффект</button>' : '') +
        (isConc ? '<button type="button" class="sh-micro-btn" id="weLaunchTechConcBtn">🛡️ Стойкость</button>' : '') +
        '<button type="button" class="sh-micro-btn" id="weLaunchTechClaimBtn">📜 Только заявка</button>' +
      '</div>';

    var hasRes = !!(L.lastResult);
    var resultBoxHtml =
      '<div class="sh-launcher-result ' + (hasRes ? 'has-result' : '') + '" id="weTechLauncherResultBox">' +
        '<div class="sh-launcher-result-text" id="weTechLauncherResultText">' + esc(L.lastResult || '') + '</div>' +
        '<div class="sh-copy-badge" id="weTechLauncherCopyBadge" style="display:' + (hasRes ? 'inline-flex' : 'none') + ';">' +
          '<span>' + (L.lastResultCopied ? '✓ Скопировано в буфер обмена для AI Studio' : '🎲 Бросок зафиксирован. Нажмите «📋 Скопировать всё»') + '</span>' +
        '</div>' +
      '</div>';

    var isOpen = !!L.isOpen;
    var toggleHeadHtml =
      '<div class="sh-launcher-toggle-head" id="weTechLauncherToggle" role="button" tabindex="0">' +
        '<div class="sh-launcher-title">' +
          '<span>⚔️ Боевой расчёт приёма / способности</span>' +
          '<span class="sh-badge-tag">AI Studio</span>' +
        '</div>' +
        '<div class="sh-launcher-toggle-btn">' +
          '<span class="sh-launcher-toggle-text">' + (isOpen ? 'Свернуть' : 'Развернуть') + '</span>' +
          '<span class="sh-launcher-toggle-arrow">' + (isOpen ? '▲' : '▼') + '</span>' +
        '</div>' +
      '</div>';

    var bodyHtml =
      '<div class="sh-launcher-body" id="weTechLauncherBody">' +
        '<div class="sh-launcher-head" style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:10px;">' +
          '<div class="sh-launcher-sel-wrap" style="flex:1;min-width:240px;">' +
            '<div class="sh-launcher-sel-label">Приём или способность для броска:</div>' +
            '<select class="sh-launcher-sel" id="weTechLauncherSelect">' + techOpts + '</select>' +
          '</div>' +
          (prepTechs.length > 0 ? (
            '<label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#fde68a;cursor:pointer;user-select:none;background:rgba(251,191,36,0.14);border:1px solid rgba(251,191,36,0.45);padding:7px 12px;border-radius:6px;font-family:\'Cinzel\',serif;font-weight:700;">' +
              '<input type="checkbox" id="weTechLauncherOnlyPrep"' + (onlyPrep ? ' checked' : '') + ' style="accent-color:#fbbf24;"> 🌟 Только выбранное (' + prepTechs.length + ')' +
            '</label>'
          ) : '') +
        '</div>' +
        '<div class="sh-launcher-screen" id="weTechLauncherScreen">' + screenHtml + '</div>' +
        modBarHtml +
        actionsHtml +
        resultBoxHtml +
      '</div>';

    return '<div class="sh-launcher ' + (isOpen ? '' : 'collapsed') + '" id="weTechLauncherContainer">' +
      toggleHeadHtml +
      bodyHtml +
    '</div>';
  }

  function wireWeTechLauncher(){
    var c = WE.getActiveCharacter();
    var techs = (c && Array.isArray(c.techs)) ? c.techs : [];
    if(!window._weTechLauncher) window._weTechLauncher = { isOpen: false, mods: { conc: 0, atk: 0, dmg: 0 }, rolledValues: {}, selectedTarget: 'atk' };
    var L = window._weTechLauncher;

    var tHead = document.getElementById('weTechLauncherToggle');
    if(tHead){
      tHead.addEventListener('click', function(){
        L.isOpen = !L.isOpen;
        var cont = document.getElementById('weTechLauncherContainer');
        if(cont){
          cont.classList.toggle('collapsed', !L.isOpen);
          var txt = cont.querySelector('.sh-launcher-toggle-text');
          var arr = cont.querySelector('.sh-launcher-toggle-arrow');
          if(txt) txt.textContent = L.isOpen ? 'Свернуть' : 'Развернуть';
          if(arr) arr.textContent = L.isOpen ? '▲' : '▼';
        }
      });
    }

    var getSelTech = function(){
      return techs.find(function(x){ return x.id === L.techId; }) || techs[0] || null;
    };

    var updateModUI = function(){
      var targetNames = { conc: '🛡️ Стойкость / Выдержка', atk: '🎯 Попадание / Проверка', dmg: '💥 Урон / Эффект' };
      var nameEl = document.getElementById('weTechModTargetName');
      if(nameEl) nameEl.textContent = targetNames[L.selectedTarget] || '🎯 Попадание / Проверка';
      var inp = document.getElementById('weTechActiveModInput');
      if(inp) inp.value = (L.mods && L.mods[L.selectedTarget]) || 0;
    };

    var scr = document.getElementById('weTechLauncherScreen');
    if(scr){
      var els = scr.querySelectorAll('[data-select-fae-tech-roll]');
      els.forEach(function(el){
        el.addEventListener('click', function(){
          var target = el.getAttribute('data-select-fae-tech-roll');
          if(!target) return;
          L.selectedTarget = target;
          els.forEach(function(s){ s.classList.remove('selected'); });
          el.classList.add('selected');
          updateModUI();
        });
      });
    }

    var setTargetMod = function(newVal){
      var target = L.selectedTarget || 'atk';
      L.mods[target] = newVal;
      updateModUI();
      var t = getSelTech();
      if(target === 'conc'){
        var subC = document.getElementById('faeScrSub_techConc');
        if(subC) subC.textContent = '1d20' + (formatFaeLauncherMod(newVal) ? ' ' + formatFaeLauncherMod(newVal) : '');
      } else if(target === 'atk'){
        var subA = document.getElementById('faeScrSub_techAtk');
        if(subA) subA.textContent = '1d20' + (formatFaeLauncherMod(newVal) ? ' ' + formatFaeLauncherMod(newVal) : '');
      } else if(target === 'dmg' && t){
        var pDmg = parseFaeDiceFormula(t.checkOrSave || t.desc || '');
        if(pDmg){
          var subD = document.getElementById('faeScrSub_techDmg');
          if(subD) subD.textContent = pDmg.n + 'd' + pDmg.sides + (formatFaeLauncherMod(newVal) ? ' ' + formatFaeLauncherMod(newVal) : '');
        }
      }
      if(L.lastResult && t && typeof buildFaeTechComboText === 'function'){
        L.lastResult = buildFaeTechComboText(t, !!L.isConc, L.rolledValues, L.mods);
        var rTxt = document.getElementById('weTechLauncherResultText');
        if(rTxt) rTxt.textContent = L.lastResult;
      }
    };

    document.querySelectorAll('[data-we-tech-mod-delta]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var delta = parseInt(btn.getAttribute('data-we-tech-mod-delta'), 10) || 0;
        var cur = parseInt(L.mods[L.selectedTarget], 10) || 0;
        setTargetMod(cur + delta);
      });
    });

    var resetBtn = document.getElementById('weTechModResetBtn');
    if(resetBtn) resetBtn.addEventListener('click', function(){ setTargetMod(0); });

    var modInp = document.getElementById('weTechActiveModInput');
    if(modInp){
      modInp.addEventListener('input', function(){
        var v = parseInt(this.value, 10);
        if(isNaN(v)) v = 0;
        setTargetMod(v);
      });
    }

    var selEl = document.getElementById('weTechLauncherSelect');
    if(selEl){
      selEl.addEventListener('change', function(){
        L.techId = this.value;
        var t = getSelTech();
        if(t){
          var pDmg = parseFaeDiceFormula(t.checkOrSave || t.desc || '');
          L.mods.dmg = pDmg ? (pDmg.mod || 0) : 0;
          L.mods.atk = parseFaeSignedMod(t.checkOrSave);
        }
        L.rolledValues = {};
        L.lastResult = '';
        L.lastResultCopied = false;
        render();
      });
    }

    var onlyPrepCb = document.getElementById('weTechLauncherOnlyPrep');
    if(onlyPrepCb){
      onlyPrepCb.addEventListener('change', function(){
        L.onlyPrepared = !!this.checked;
        var prepList = techs.filter(function(x){ return x && x.prepared; });
        if(L.onlyPrepared && prepList.length > 0 && !prepList.some(function(x){ return x.id === L.techId; })){
          L.techId = prepList[0].id;
        }
        render();
      });
    }

    var concCb = document.getElementById('weTechLauncherConc');
    if(concCb){
      concCb.addEventListener('change', function(){
        L.isConc = !!this.checked;
        if(!L.isConc && L.selectedTarget === 'conc') L.selectedTarget = 'atk';
        render();
      });
    }

    var executeTechLaunch = function(mode, autoCopy){
      var t = getSelTech();
      if(!t) return;
      var pDmg = parseFaeDiceFormula(t.checkOrSave || t.desc || '');
      if(mode !== 'claim'){
        if(mode === 'all' || mode === 'conc'){
          if(L.isConc) L.rolledValues.conc = 1 + Math.floor(Math.random() * 20);
        }
        if(mode === 'all' || mode === 'atk'){
          L.rolledValues.atk = 1 + Math.floor(Math.random() * 20);
        }
        if((mode === 'all' || mode === 'dmg') && pDmg){
          var rolls = [];
          for(var i = 0; i < pDmg.n; i++){
            rolls.push(1 + Math.floor(Math.random() * pDmg.sides));
          }
          L.rolledValues.dmgRolls = rolls;
          L.rolledValues.dmgSides = pDmg.sides;
        }
      }
      var output = (typeof buildFaeTechComboText === 'function')
        ? buildFaeTechComboText(t, !!L.isConc, L.rolledValues, L.mods)
        : ('*[Приём: ' + (t.name || '') + ']*');
      L.lastResult = output;
      if(autoCopy && typeof copyText === 'function'){
        copyText(output);
        L.lastResultCopied = true;
      } else {
        L.lastResultCopied = false;
      }
      render();
    };

    var bCombo = document.getElementById('weLaunchTechComboBtn');
    if(bCombo) bCombo.addEventListener('click', function(){ executeTechLaunch('all', false); });
    var bCopyAll = document.getElementById('weCopyAllTechBtn');
    if(bCopyAll){
      bCopyAll.addEventListener('click', function(){
        if(!L.lastResult) executeTechLaunch('all', true);
        else {
          if(typeof copyText === 'function') copyText(L.lastResult);
          L.lastResultCopied = true;
          WE.toast('📋 Скопировано в буфер обмена');
          render();
        }
      });
    }
    var bAtk = document.getElementById('weLaunchTechAtkBtn'); if(bAtk) bAtk.addEventListener('click', function(){ executeTechLaunch('atk', true); });
    var bDmg = document.getElementById('weLaunchTechDmgBtn'); if(bDmg) bDmg.addEventListener('click', function(){ executeTechLaunch('dmg', true); });
    var bConc = document.getElementById('weLaunchTechConcBtn'); if(bConc) bConc.addEventListener('click', function(){ executeTechLaunch('conc', true); });
    var bClaim = document.getElementById('weLaunchTechClaimBtn'); if(bClaim) bClaim.addEventListener('click', function(){ executeTechLaunch('claim', true); });
  }

  function weTechs(){
    var c = WE.getActiveCharacter();
    var techs = (c && Array.isArray(c.techs)) ? c.techs : [];
    var activeCat = window._weTechCat || 'all';
    var searchQ = (window._weTechSearch || '').trim().toLowerCase();
    var prepTechs = techs.filter(function(t){ return t && t.prepared; });
    var prepCount = prepTechs.length;

    var pillsHtml = WE_TECH_CATEGORIES.map(function(cat){
      var cnt = 0;
      if(cat.key === 'all') cnt = techs.length;
      else if(cat.key === 'prepared') cnt = prepCount;
      else cnt = techs.filter(function(t){ return t.category === cat.key; }).length;
      var prepStyle = (cat.key === 'prepared' && activeCat !== 'prepared')
        ? ' style="border-color:rgba(251,191,36,0.5);color:#fde68a;background:rgba(251,191,36,0.10);"'
        : (cat.key === 'prepared' && activeCat === 'prepared' ? ' style="border-color:#fbbf24;color:#fde68a;background:rgba(251,191,36,0.24);"' : '');
      return '<button type="button" class="fae-pill ' + (activeCat === cat.key ? 'active' : '') + '" data-we-tech-cat="' + escAttr(cat.key) + '"' + prepStyle + '>' +
        cat.icon + ' ' + esc(cat.label) + ' <span style="opacity:0.75;font-size:11px;">(' + cnt + ')</span>' +
      '</button>';
    }).join('');

    var filtered = techs.filter(function(t){
      if(activeCat === 'prepared'){
        if(!t.prepared) return false;
      } else if(activeCat !== 'all' && t.category !== activeCat){
        return false;
      }
      if(searchQ){
        var hay = [t.name, t.category, t.source, t.actionCost, t.cooldown, t.checkOrSave, t.desc].join(' ').toLowerCase();
        if(hay.indexOf(searchQ) === -1) return false;
      }
      return true;
    });

    if(activeCat !== 'prepared'){
      filtered = filtered.slice().sort(function(a, b){
        return (b && b.prepared ? 1 : 0) - (a && a.prepared ? 1 : 0);
      });
    }

    var emptyMsg = activeCat === 'prepared'
      ? '<div class="char-empty">В подменю «🌟 Выбранное» пока нет активных приёмов.<br><span style="font-size:13px;color:#cbd5e1;">Нажмите <b>«📌 В выбранное»</b> на любой карточке во вкладке «Все способности»!</span></div>'
      : '<div class="char-empty">В этой категории пока нет способностей. Нажмите «+ Добавить способность» или «🤖 Создать с ИИ»!</div>';

    var cardsHtml = filtered.length ? (
      '<div class="fae-ref-cards-grid">' +
        filtered.map(function(t){
          var isPrep = !!t.prepared;
          var copyStr = (isPrep ? '🌟 ' : '⚔️ ') + (t.name || 'Способность') + ' [' + (t.category || 'Приём') + ', ' + (t.actionCost || '1 действие') + (t.cooldown ? (', ' + t.cooldown) : '') + ']: ' + (t.desc || '');
          var cardBorder = isPrep ? 'border-color:rgba(251,191,36,0.62);background:linear-gradient(145deg,rgba(32,27,18,0.92),rgba(18,22,30,0.94));' : '';
          var prepBtn = isPrep
            ? '<button type="button" class="rc-btn" data-we-tech-prep="' + escAttr(t.id) + '" style="background:rgba(251,191,36,0.22);border-color:#fbbf24;color:#fde68a;font-weight:700;">🌟 Выбрано ✓</button>'
            : '<button type="button" class="rc-btn" data-we-tech-prep="' + escAttr(t.id) + '" style="border-color:rgba(251,191,36,0.45);color:#fde68a;">📌 В выбранное</button>';

          return '<div class="fae-ref-card" data-we-tech-open="' + escAttr(t.id) + '" style="display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;' + cardBorder + '">' +
            '<div>' +
              '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
                '<div class="fae-ref-card-k" style="margin-bottom:0;">' + (isPrep ? '🌟 ' : '⚔️ ') + esc(t.name || 'Без названия') + '</div>' +
                '<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">' +
                  (isPrep ? '<span class="fae-ref-item-tag" style="background:rgba(251,191,36,0.2);border-color:#fbbf24;color:#fde68a;">🌟 Наготове</span>' : '') +
                  '<span class="fae-ref-item-tag">' + esc(t.actionCost || '1 действие') + '</span>' +
                '</div>' +
              '</div>' +
              '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;font-size:11.5px;color:#cbd5e1;font-family:\'JetBrains Mono\',monospace;">' +
                '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;">📂 ' + esc(t.category || 'Воинские приёмы и Стойки') + '</span>' +
                (t.source ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;color:#fde68a;">🎓 ' + esc(t.source) + '</span>' : '') +
                (t.cooldown ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;">🔄 ' + esc(t.cooldown) + '</span>' : '') +
                (t.checkOrSave ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;color:#fca5a5;">🎲 ' + esc(t.checkOrSave) + '</span>' : '') +
              '</div>' +
              '<div class="fae-ref-card-v" style="margin-bottom:12px;">' + esc(t.desc || '') + '</div>' +
            '</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;padding-top:8px;border-top:1px solid rgba(201,164,92,0.18);">' +
              prepBtn +
              '<button type="button" class="rc-btn" data-we-tech-to-calc="' + escAttr(t.id) + '" style="border-color:rgba(200,67,55,0.5);color:#ff9085;">⚔️ В расчёт</button>' +
              '<button type="button" class="rc-btn" data-we-tech-copy="' + escAttr(copyStr) + '">📋 Копировать</button>' +
              '<button type="button" class="rc-btn" data-go="weTechEdit:' + escAttr(t.id) + '">✏️ Изменить</button>' +
              '<button type="button" class="rc-btn" data-we-tech-del="' + escAttr(t.id) + '" style="color:#f87171;">🗑️</button>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>'
    ) : emptyMsg;

    return renderCrumb([{ label: 'Вестерос', nav: 'weHome' }, { label: activeCat === 'prepared' ? 'Выбранное (Наготове)' : 'Способности и Приёмы' }]) +
      '<button class="back" data-go="weHome">← На главную</button>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
        '<div>' +
          '<h1>' + (activeCat === 'prepared' ? '🌟 Выбранное: Активные Приёмы и Способности' : '⚔️ Способности, Воинские Приёмы и Дары Крови') + '</h1>' +
          '<p class="subtitle">Фехтовальные школы Вестероса и Эссоса, рыцарская выучка, интриги и опциональные Дары Крови (Всадник дракона, Варг, Р\'глор).</p>' +
        '</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
          '<button type="button" class="btn btn-primary" data-go="weTechEdit:new">+ Добавить способность</button>' +
          '<button type="button" class="ai-gen-btn" data-go="weTechGen" style="padding:9px 16px;font-size:13px;">🤖 Создать с ИИ</button>' +
        '</div>' +
      '</div>' +
      '<div class="fae-rule"></div>' +
      renderWeTechLauncher(c) +
      '<div class="fae-ref-search-wrap" style="margin-bottom:14px;">' +
        '<span class="fae-ref-search-icon">🔍</span>' +
        '<input type="text" id="weTechSearchInp" class="fae-ref-search-input" value="' + escAttr(window._weTechSearch || '') + '" placeholder="Поиск по названию приёма, школе фехтования, оружию или дару крови..." autocomplete="off">' +
      '</div>' +
      '<div class="pill-row" style="margin-bottom:18px;">' + pillsHtml + '</div>' +
      cardsHtml;
  }

  function weTechView(){
    var c = WE.getActiveCharacter();
    var t = (c && Array.isArray(c.techs)) ? c.techs.find(function(x){ return x.id === view.techId; }) : null;
    if(!t) return weTechs();
    var isPrep = !!t.prepared;

    return renderCrumb([{ label: 'Вестерос', nav: 'weHome' }, { label: 'Способности', nav: 'weTechs' }, { label: t.name || 'Способность' }]) +
      '<button class="back" data-go="weTechs">← К списку способностей</button>' +
      '<div class="fae-ref-card" style="padding:22px;border-color:' + (isPrep ? 'rgba(251,191,36,0.65)' : 'rgba(201,164,92,0.45)') + ';">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">' +
          '<div>' +
            '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' +
              '<span class="fae-ref-item-tag">⚔️ ' + esc(t.category || 'Воинские приёмы и Стойки') + '</span>' +
              (isPrep ? '<span class="fae-ref-item-tag" style="background:rgba(251,191,36,0.2);border-color:#fbbf24;color:#fde68a;">🌟 В выбранном (Наготове)</span>' : '') +
            '</div>' +
            '<h1 style="margin:8px 0 0 0;font-size:24px;">' + esc(t.name || 'Способность') + '</h1>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button type="button" class="btn btn-ghost" data-we-tech-prep="' + escAttr(t.id) + '" style="' + (isPrep ? 'background:rgba(251,191,36,0.22);border-color:#fbbf24;color:#fde68a;' : 'border-color:rgba(251,191,36,0.5);color:#fde68a;') + '">' + (isPrep ? '🌟 Выбрано ✓' : '📌 В выбранное') + '</button>' +
            '<button type="button" class="btn btn-ghost" data-we-tech-to-calc="' + escAttr(t.id) + '" style="border-color:rgba(200,67,55,0.6);color:#ff9085;">⚔️ В боевой расчёт</button>' +
            '<button type="button" class="btn btn-primary" data-go="weTechEdit:' + escAttr(t.id) + '">✏️ Редактировать</button>' +
          '</div>' +
        '</div>' +
        '<div class="fae-rule"></div>' +
        '<div class="fae-gen-stat-grid" style="margin-bottom:14px;">' +
          '<div class="fae-gen-stat-box"><span class="lbl">🎓 Выучка / Источник</span><span class="val">' + esc(t.source || 'Выучка героя') + '</span></div>' +
          '<div class="fae-gen-stat-box"><span class="lbl">⚡ Тип действия</span><span class="val">' + esc(t.actionCost || '1 действие') + '</span></div>' +
          '<div class="fae-gen-stat-box"><span class="lbl">🔄 Выносливость / Отдых</span><span class="val">' + esc(t.cooldown || 'Короткий / Долгий отдых') + '</span></div>' +
          '<div class="fae-gen-stat-box"><span class="lbl">🎲 Бросок / СЛ</span><span class="val">' + esc(t.checkOrSave || '—') + '</span></div>' +
        '</div>' +
        '<div class="fae-gen-block"><b>📜 Описание и механика:</b><br><span style="white-space:pre-line;">' + esc(t.desc || '') + '</span></div>' +
      '</div>';
  }

  function weTechEdit(){
    var c = WE.getActiveCharacter();
    var existing = (c && Array.isArray(c.techs) && view.techId && view.techId !== 'new')
      ? c.techs.find(function(x){ return x.id === view.techId; })
      : null;
    var d = existing ? JSON.parse(JSON.stringify(existing)) : {
      id: '',
      prepared: window._weTechCat === 'prepared',
      name: '',
      category: 'Воинские приёмы и Стойки',
      source: (c && c.role ? (c.role + ' • ' + (c.level || 1) + ' ур.') : 'Выучка 1 ур.'),
      actionCost: '1 действие',
      cooldown: 'Короткий или долгий отдых',
      checkOrSave: '',
      desc: ''
    };

    return renderCrumb([{ label: 'Вестерос', nav: 'weHome' }, { label: 'Способности', nav: 'weTechs' }, { label: existing ? d.name : 'Новая способность' }]) +
      '<button class="back" data-go="weTechs">← К списку способностей</button>' +
      '<h1>' + esc(existing ? ('Редактирование: ' + d.name) : 'Новый приём или способность Вестероса') + '</h1>' +
      '<div class="fae-rule"></div>' +
      '<div class="fae-ref-card" style="padding:20px;">' +
        '<input type="hidden" id="weTechEditId" value="' + escAttr(d.id || '') + '">' +
        '<div class="fae-edit-grid">' +
          '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
            '<label>Название приёма / способности / дара крови</label>' +
            '<input type="text" class="fae-input" id="weTechName" value="' + escAttr(d.name) + '" placeholder="Напр. Выпад Водяного Танцора, Удар в сочленение лат, Скольжение в шкуру лютоволка">' +
          '</div>' +
          '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
            '<label style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;color:#fde68a;font-weight:700;padding:8px 12px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.4);border-radius:6px;">' +
              '<input type="checkbox" id="weTechPrepared"' + (d.prepared ? ' checked' : '') + ' style="width:16px;height:16px;accent-color:#fbbf24;">' +
              '<span>🌟 Добавить в подменю «Выбранное» (приём наготове прямо сейчас)</span>' +
            '</label>' +
          '</div>' +
          '<div class="fae-edit-item">' +
            '<label>Категория</label>' +
            '<select class="fae-input" id="weTechCat">' +
              WE_TECH_CATEGORIES.filter(function(x){ return x.key !== 'all' && x.key !== 'prepared'; }).map(function(cat){
                return '<option value="' + escAttr(cat.key) + '" ' + (d.category === cat.key ? 'selected' : '') + '>' + cat.icon + ' ' + esc(cat.label) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="fae-edit-item">' +
            '<label>Источник / Школа / Требование</label>' +
            '<input type="text" class="fae-input" id="weTechSource" value="' + escAttr(d.source) + '" placeholder="Напр. Рыцарская выучка / Браавос / Кровь Первых Людей">' +
          '</div>' +
          '<div class="fae-edit-item">' +
            '<label>Затраты времени (Action Economy)</label>' +
            '<select class="fae-input" id="weTechAction">' +
              ['Пассивно (Постоянно)', '1 действие', '1 бонусное действие', '1 реакция', 'Часть действия Атаки', 'Свободное действие', '1 минута (Обряд)'].map(function(act){
                return '<option value="' + escAttr(act) + '" ' + (d.actionCost === act ? 'selected' : '') + '>' + esc(act) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="fae-edit-item">' +
            '<label>Расход выносливости / Перезарядка</label>' +
            '<input type="text" class="fae-input" id="weTechCooldown" value="' + escAttr(d.cooldown) + '" placeholder="Напр. 1 кость мастерства / Короткий отдых">' +
          '</div>' +
          '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
            '<label>Формула броска, урона или СЛ спасброска (необязательно)</label>' +
            '<input type="text" class="fae-input" id="weTechSave" value="' + escAttr(d.checkOrSave) + '" placeholder="Напр. 1d8+3 / СЛ 14 СИЛ">' +
          '</div>' +
          '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
            '<label>Полное описание и механика</label>' +
            '<textarea class="fae-input" id="weTechDesc" rows="5" placeholder="Опишите точные правила работы приёма в реализме Песни Льда и Огня (D&D 2024)...">' + esc(d.desc) + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;margin-top:18px;">' +
          '<button type="button" class="btn btn-primary" id="btnWeSaveTech">💾 Сохранить способность</button>' +
          '<button type="button" class="btn btn-ghost" data-go="weTechs">Отмена</button>' +
        '</div>' +
      '</div>';
  }

  function weTechGen(){
    var c = WE.getActiveCharacter();
    var hasKey = !!((typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '');
    var heroCtx = c ? ((c.name || 'Герой') + ' (' + (c.house || 'Вестерос') + ', ' + (c.role || 'Рыцарь') + ' ' + (c.level || 1) + ' ур.)') : 'Герой Вестероса';

    var presets = [
      { label: 'Сшибка на рыцарском копье (Joust)', theme: 'Приём конного рыцарского удара копьём в щит или забрало с опрокидыванием из седла', cat: 'Рыцарское мастерство и Командование' },
      { label: 'Шаг Цапли Водяного Танцора', theme: 'Фехтовальный приём браво Браавоса: уклонение в последний миг с мгновенным колющим уколом узким клинком', cat: 'Водяной танец и Школы Эссоса' },
      { label: 'Мизерикорд в сочленение лат', theme: 'Приём ближнего боя кинжалом-ронделем против закованного в латы рыцаря (поиск щели под забралом или подмышкой)', cat: 'Воинские приёмы и Стойки' },
      { label: 'Скольжение варга (Slipping)', theme: 'Древний дар крови Первых Людей: вход сознанием в шкуру лютоволка или ворона для разведки и совместной охоты', cat: 'Древние Дары Крови (Дракон / Варг / Р\'глор)' }
    ];

    return renderCrumb([{ label: 'Вестерос', nav: 'weHome' }, { label: 'Способности', nav: 'weTechs' }, { label: 'AI Конструктор' }]) +
      '<button class="back" data-go="weTechs">← К списку способностей</button>' +
      '<h1>🤖 AI Генератор Приёмов и Способностей Вестероса</h1>' +
      '<p class="subtitle">Создание воинских приёмов, рыцарских техник, интриг и даров крови в духе Джорджа Мартина для героя: <b style="color:#c9a45c;">' + esc(heroCtx) + '</b></p>' +
      '<div class="fae-rule"></div>' +
      '<div class="ai-gen-box">' +
        '<div class="fae-gen-preset-wrap" style="margin-bottom:14px;">' +
          '<div style="font-size:11.5px;color:#c9a45c;font-family:\'Cinzel\',serif;font-weight:700;margin-bottom:6px;">⚡ БЫСТРЫЕ ИДЕИ ПРИЁМОВ ВЕСТЕРОСА И ЭССОСА:</div>' +
          '<div class="fae-gen-preset-row">' +
            presets.map(function(p){
              return '<button type="button" class="fae-gen-preset-chip" data-we-tech-preset="' + escAttr(p.theme) + '" data-cat="' + escAttr(p.cat) + '">💡 ' + esc(p.label) + '</button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="fae-edit-grid">' +
          '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
            '<label>Идея или название приёма / способности</label>' +
            '<input type="text" class="fae-input" id="weTechGenTheme" placeholder="Напр. Рассекающий удар аракхом, Сеть кранногмена, Приказ Дракарис...">' +
          '</div>' +
          '<div class="fae-edit-item">' +
            '<label>Категория</label>' +
            '<select class="fae-input" id="weTechGenCat">' +
              WE_TECH_CATEGORIES.filter(function(x){ return x.key !== 'all' && x.key !== 'prepared'; }).map(function(cat){
                return '<option value="' + escAttr(cat.key) + '">' + cat.icon + ' ' + esc(cat.label) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="fae-edit-item">' +
            '<label>Тип активации в бою</label>' +
            '<select class="fae-input" id="weTechGenAction">' +
              '<option value="1 действие" selected>⚡ 1 действие</option>' +
              '<option value="1 бонусное действие">🏃 1 бонусное действие</option>' +
              '<option value="1 реакция">🛡️ 1 реакция</option>' +
              '<option value="Пассивно (Постоянно)">♾️ Пассивно (Постоянно)</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:16px;">' +
          '<button type="button" class="btn-ghost" data-go="weData" style="font-size:12.5px;">🔑 API ключ: ' + (hasKey ? '<span style="color:#4ade80;">✓ Установлен</span>' : '<span style="color:#fbbf24;">⚠️ Настроить в Данных</span>') + '</button>' +
          '<button type="button" class="ai-gen-btn" id="btnWeTechAiRun">✨ Сгенерировать способность</button>' +
        '</div>' +
      '</div>' +
      '<div id="weTechGenPreviewWrap" style="display:none;margin-top:20px;"></div>';
  }

  function wireWeTechs(){
    wireWeTechLauncher();

    document.querySelectorAll('[data-we-tech-cat]').forEach(function(btn){
      btn.addEventListener('click', function(){
        window._weTechCat = btn.getAttribute('data-we-tech-cat') || 'all';
        render();
      });
    });

    var sInp = document.getElementById('weTechSearchInp');
    if(sInp){
      sInp.addEventListener('input', function(){
        window._weTechSearch = this.value;
        var pos = this.selectionStart;
        render();
        var nextInp = document.getElementById('weTechSearchInp');
        if(nextInp){ nextInp.focus(); try { nextInp.setSelectionRange(pos, pos); } catch(e){} }
      });
    }

    document.querySelectorAll('[data-we-tech-open]').forEach(function(card){
      card.addEventListener('click', function(e){
        if(e.target.closest('button')) return;
        var id = card.getAttribute('data-we-tech-open');
        if(id) navigate('weTechView:' + id);
      });
    });

    document.querySelectorAll('[data-we-tech-prep]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var id = btn.getAttribute('data-we-tech-prep');
        var c = WE.getActiveCharacter();
        if(!c || !Array.isArray(c.techs)) return;
        var t = c.techs.find(function(x){ return x.id === id; });
        if(!t) return;
        t.prepared = !t.prepared;
        WE.saveProfiles();
        WE.toast(t.prepared ? ('🌟 «' + t.name + '» добавлено в Выбранное') : ('📌 «' + t.name + '» убрано из Выбранного'));
        render();
      });
    });

    document.querySelectorAll('[data-we-tech-to-calc]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var id = btn.getAttribute('data-we-tech-to-calc');
        if(!id) return;
        if(!window._weTechLauncher) window._weTechLauncher = { isOpen: true, mods: { conc: 0, atk: 0, dmg: 0 }, rolledValues: {}, selectedTarget: 'atk' };
        window._weTechLauncher.isOpen = true;
        window._weTechLauncher.techId = id;
        if(view.screen !== 'weTechs') navigate('weTechs');
        else render();
        setTimeout(function(){
          var cont = document.getElementById('weTechLauncherContainer');
          if(cont) cont.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      });
    });

    document.querySelectorAll('[data-we-tech-copy]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var txt = btn.getAttribute('data-we-tech-copy') || '';
        if(typeof copyText === 'function') copyText(txt);
        WE.toast('📋 Способность скопирована');
      });
    });

    document.querySelectorAll('[data-we-tech-del]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var id = btn.getAttribute('data-we-tech-del');
        var c = WE.getActiveCharacter();
        if(!c || !Array.isArray(c.techs)) return;
        c.techs = c.techs.filter(function(x){ return x.id !== id; });
        WE.saveProfiles();
        render();
      });
    });

    var saveBtn = document.getElementById('btnWeSaveTech');
    if(saveBtn){
      saveBtn.addEventListener('click', function(){
        var c = WE.getActiveCharacter();
        if(!c) return;
        if(!Array.isArray(c.techs)) c.techs = [];
        var editId = (document.getElementById('weTechEditId') || {}).value || '';
        var nameVal = ((document.getElementById('weTechName') || {}).value || '').trim() || 'Новый приём';
        var obj = {
          id: editId || ('we_tech_' + Date.now()),
          prepared: !!(document.getElementById('weTechPrepared') && document.getElementById('weTechPrepared').checked),
          name: nameVal,
          category: (document.getElementById('weTechCat') || {}).value || 'Воинские приёмы и Стойки',
          source: ((document.getElementById('weTechSource') || {}).value || '').trim(),
          actionCost: (document.getElementById('weTechAction') || {}).value || '1 действие',
          cooldown: ((document.getElementById('weTechCooldown') || {}).value || '').trim(),
          checkOrSave: ((document.getElementById('weTechSave') || {}).value || '').trim(),
          desc: ((document.getElementById('weTechDesc') || {}).value || '').trim()
        };
        var idx = c.techs.findIndex(function(x){ return x.id === obj.id; });
        if(idx !== -1) c.techs[idx] = obj;
        else c.techs.unshift(obj);
        WE.saveProfiles();
        WE.toast('💾 Способность сохранена');
        navigate('weTechs');
      });
    }

    document.querySelectorAll('[data-we-tech-preset]').forEach(function(chip){
      chip.addEventListener('click', function(){
        var th = document.getElementById('weTechGenTheme');
        var ct = document.getElementById('weTechGenCat');
        if(th) th.value = chip.getAttribute('data-we-tech-preset') || '';
        if(ct && chip.getAttribute('data-cat')) ct.value = chip.getAttribute('data-cat');
      });
    });

    var aiRunBtn = document.getElementById('btnWeTechAiRun');
    if(aiRunBtn){
      aiRunBtn.addEventListener('click', async function(){
        var theme = ((document.getElementById('weTechGenTheme') || {}).value || '').trim();
        var cat = (document.getElementById('weTechGenCat') || {}).value || 'Воинские приёмы и Стойки';
        var act = (document.getElementById('weTechGenAction') || {}).value || '1 действие';
        if(!theme){
          WE.toast('⚠️ Введите идею приёма или выберите пресет выше');
          return;
        }
        var apiKey = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
        if(!apiKey){
          WE.toast('🔑 Сначала укажите ключ Gemini API в разделе «Данные»');
          return;
        }
        aiRunBtn.disabled = true;
        var oldTxt = aiRunBtn.textContent;
        aiRunBtn.textContent = '⏳ Куём приём в Цитадели...';
        try {
          var c = WE.getActiveCharacter();
          var prompt = 'Ты — мейстер и гранд-мастер боевых искусств мира «Песни Льда и Огня» (Вестерос и Эссос, адаптация D&D 2024 Low-Fantasy без аркадной магии). ' +
            'Создай способность/приём для героя (' + (c ? (c.name + ', ' + c.house + ', ' + c.role + ' ' + c.level + ' ур.') : 'Рыцарь Вестероса') + '). ' +
            'Идея: "' + theme + '". Категория: "' + cat + '". Действие: "' + act + '". ' +
            'Верни ТОЛЬКО валидный JSON без markdown-обёртки с полями: ' +
            '{"name":"...","category":"' + cat + '","source":"...","actionCost":"' + act + '","cooldown":"...","checkOrSave":"например 1d8+3 или СЛ 14 СИЛ","desc":"подробная механика D&D 2024 и описание в суровом стиле Джорджа Мартина"}';
          var resText = await window.callGeminiAPI(prompt);
          var clean = String(resText || '').replace(/```json|```/gi, '').trim();
          var parsed = JSON.parse(clean);
          var wrap = document.getElementById('weTechGenPreviewWrap');
          if(wrap && parsed){
            wrap.style.display = 'block';
            wrap.innerHTML =
              '<div class="fae-ref-card" style="padding:18px;border-color:#fbbf24;">' +
                '<div class="fae-ref-card-k">⚔️ ' + esc(parsed.name || 'Новый приём') + '</div>' +
                '<div style="font-size:12px;color:#fde68a;margin-bottom:8px;">' + esc(parsed.category || cat) + ' • ' + esc(parsed.actionCost || act) + ' • ' + esc(parsed.checkOrSave || '') + '</div>' +
                '<div class="fae-ref-card-v" style="white-space:pre-line;margin-bottom:14px;">' + esc(parsed.desc || '') + '</div>' +
                '<button type="button" class="btn btn-primary" id="weAddGenTechBtn">➕ Добавить герою</button>' +
              '</div>';
            var addB = document.getElementById('weAddGenTechBtn');
            if(addB){
              addB.addEventListener('click', function(){
                var hero = WE.getActiveCharacter();
                if(!hero) return;
                if(!Array.isArray(hero.techs)) hero.techs = [];
                hero.techs.unshift({
                  id: 'we_tech_' + Date.now(),
                  prepared: true,
                  name: parsed.name || 'Новый приём',
                  category: parsed.category || cat,
                  source: parsed.source || 'Выучка Вестероса',
                  actionCost: parsed.actionCost || act,
                  cooldown: parsed.cooldown || 'Короткий отдых',
                  checkOrSave: parsed.checkOrSave || '',
                  desc: parsed.desc || ''
                });
                WE.saveProfiles();
                WE.toast('⚔️ Приём добавлен в способности героя!');
                navigate('weTechs');
              });
            }
          }
        } catch(err){
          WE.toast('⚠️ Ошибка генерации: ' + (err && err.message ? err.message : 'проверьте API ключ'));
        } finally {
          aiRunBtn.disabled = false;
          aiRunBtn.textContent = oldTxt;
        }
      });
    }
  }

  /* ==========================================================================
     4. ДАННЫЕ, ЛИСТ ПЕРСОНАЖА, КАЗНА, ДОМА И КАМПАНИЯ (weData)
     По подобию Фаэруна (renderFaeData)
     ========================================================================== */
  function weAbilityBoxHtml(k, d){
    var score = (d.abilities && d.abilities[k] != null) ? Number(d.abilities[k]) : 10;
    var m = (typeof abilityMod === 'function') ? abilityMod(score) : Math.floor((score - 10) / 2);
    var mStr = (typeof fmtMod === 'function') ? fmtMod(m) : (m >= 0 ? '+' + m : String(m));
    var lbl = (typeof ABILITY_RU !== 'undefined' && ABILITY_RU[k]) ? ABILITY_RU[k] : k.toUpperCase();
    var shortLbl = (typeof ABILITY_SHORT_RU !== 'undefined' && ABILITY_SHORT_RU[k]) ? ABILITY_SHORT_RU[k] : k.toUpperCase();
    return '<div class="ability-box">' +
      '<div class="ab-label" title="' + escAttr(lbl) + '">' + esc(shortLbl) + '</div>' +
      '<div class="ab-mod" id="weMod_' + k + '">' + mStr + '</div>' +
      '<input type="number" class="ab-score" min="1" max="30" data-we-ab="' + k + '" value="' + score + '">' +
    '</div>';
  }

  function weSaveRowHtml(k, d, pb){
    var prof = !!(d.saveProf && d.saveProf[k]);
    var score = (d.abilities && d.abilities[k] != null) ? Number(d.abilities[k]) : 10;
    var m = ((typeof abilityMod === 'function') ? abilityMod(score) : Math.floor((score - 10) / 2)) + (prof ? pb : 0);
    var mStr = (typeof fmtMod === 'function') ? fmtMod(m) : (m >= 0 ? '+' + m : String(m));
    var lbl = (typeof ABILITY_RU !== 'undefined' && ABILITY_RU[k]) ? ABILITY_RU[k] : k.toUpperCase();
    return '<div class="save-row" data-we-save="' + k + '" style="cursor:pointer;">' +
      '<span class="prof-dot ' + (prof ? 'prof' : '') + '"></span>' +
      '<span class="sr-name">' + esc(lbl) + '</span>' +
      '<span class="sr-val" id="weSaveVal_' + k + '">' + mStr + '</span>' +
    '</div>';
  }

  function weSkillRowHtml(def, d, pb){
    var rank = Number((d.skillProf && d.skillProf[def.key]) || 0);
    var score = (d.abilities && d.abilities[def.ab] != null) ? Number(d.abilities[def.ab]) : 10;
    var baseMod = (typeof abilityMod === 'function') ? abilityMod(score) : Math.floor((score - 10) / 2);
    var total = baseMod + rank * pb;
    var mStr = (typeof fmtMod === 'function') ? fmtMod(total) : (total >= 0 ? '+' + total : String(total));
    var dotCls = rank === 2 ? 'exp' : (rank === 1 ? 'prof' : '');
    var abShort = (typeof ABILITY_SHORT_RU !== 'undefined' && ABILITY_SHORT_RU[def.ab]) ? ABILITY_SHORT_RU[def.ab] : def.ab.toUpperCase();
    return '<div class="skill-row" data-we-skill="' + def.key + '" style="cursor:pointer;">' +
      '<span class="prof-dot ' + dotCls + '"></span>' +
      '<span class="sk-name">' + esc(def.ru) + ' <small>(' + esc(abShort) + ')</small></span>' +
      '<span class="sk-val" id="weSkillVal_' + def.key + '">' + mStr + '</span>' +
    '</div>';
  }

  function weAttackRowHtml(a, idx){
    return '<div class="attack-row" data-we-atk-idx="' + idx + '">' +
      '<input type="text" data-we-atk-field="name" data-idx="' + idx + '" value="' + escAttr(a.name || '') + '" placeholder="Оружие (напр. Длинный меч замковой стали)">' +
      '<input type="text" data-we-atk-field="bonus" data-idx="' + idx + '" value="' + escAttr(a.bonus || '') + '" placeholder="+5">' +
      '<input type="text" data-we-atk-field="damage" data-idx="' + idx + '" value="' + escAttr(a.damage || '') + '" placeholder="1d8+3 рубящий">' +
      '<input type="text" list="weMasteryDatalist" data-we-atk-field="mastery" data-idx="' + idx + '" value="' + escAttr(a.mastery || '') + '" placeholder="Мастерство / Сталь">' +
      '<button type="button" class="del-row-btn" data-we-del-atk="' + idx + '" title="Удалить оружие">✕</button>' +
    '</div>';
  }

  function weData(){
    var d = WE.getActiveCharacter();
    var chars = Array.isArray(WE.profiles) ? WE.profiles : [d];
    var camp = WE.loadCampaign();

    var isCollapsed = false;
    var activeTab = 'main';
    try {
      isCollapsed = localStorage.getItem('we_sheet_collapsed') === '1';
      activeTab = localStorage.getItem('we_sheet_tab') || 'main';
    } catch(e){}

    var charOptions = chars.map(function(c){
      var isSel = d && d.id === c.id;
      var sub = [c.house, c.role ? (c.role + ' ' + (c.level || 1) + ' ур.') : null, c.region].filter(Boolean).join(' • ');
      return '<option value="' + escAttr(c.id) + '" ' + (isSel ? 'selected' : '') + '>' +
        getWeRoleIcon(c.house || c.role) + ' ' + esc(c.name || 'Безымянный персонаж') + ' (' + esc(sub || 'Вестерос') + ')' +
      '</option>';
    }).join('');

    var pb = (typeof profBonus === 'function') ? profBonus(d.level || 1) : 2;
    var abMod = function(k){
      var sc = (d.abilities && d.abilities[k] != null) ? Number(d.abilities[k]) : 10;
      return (typeof abilityMod === 'function') ? abilityMod(sc) : Math.floor((sc - 10) / 2);
    };
    var passivePerception = 10 + abMod('wis') + (Number(d.skillProf && d.skillProf.perception) || 0) * pb;
    var passiveInvestigation = 10 + abMod('int') + (Number(d.skillProf && d.skillProf.investigation) || 0) * pb;
    var passiveInsight = 10 + abMod('wis') + (Number(d.skillProf && d.skillProf.insight) || 0) * pb;
    var initTotal = abMod('dex') + Number(d.initMisc || 0);
    var fmtM = function(n){ return (typeof fmtMod === 'function') ? fmtMod(n) : (n >= 0 ? '+' + n : String(n)); };

    var abKeys = (typeof ABILITY_KEYS !== 'undefined' && Array.isArray(ABILITY_KEYS)) ? ABILITY_KEYS : ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    var skDefs = (typeof SKILL_DEFS !== 'undefined' && Array.isArray(SKILL_DEFS)) ? SKILL_DEFS : [];
    var abilityBoxes = abKeys.map(function(k){ return weAbilityBoxHtml(k, d); }).join('');
    var saveRows = abKeys.map(function(k){ return weSaveRowHtml(k, d, pb); }).join('');
    var skillRows = skDefs.map(function(def){ return weSkillRowHtml(def, d, pb); }).join('');
    var attackRows = (Array.isArray(d.attacks) ? d.attacks : []).map(function(a, i){ return weAttackRowHtml(a, i); }).join('');

    var totalSilverEquiv = (Number(d.goldDragons) || 0) * 210 + (Number(d.silverStags) || 0) + Math.floor(((Number(d.copperStars) || 0) * 8 + (Number(d.copperPennies) || 0)) / 56);

    var datalistsHtml =
      '<datalist id="weOriginsDatalist">' + WE_ORIGINS_LIST.map(function(s){ return '<option value="' + escAttr(s) + '">'; }).join('') + '</datalist>' +
      '<datalist id="weRolesDatalist">' + WE_ROLES_LIST.map(function(s){ return '<option value="' + escAttr(s) + '">'; }).join('') + '</datalist>' +
      '<datalist id="weHousesDatalist">' + WE_HOUSES_LIST.map(function(s){ return '<option value="' + escAttr(s) + '">'; }).join('') + '</datalist>' +
      '<datalist id="weRegionsDatalist">' + WE_REGIONS_LIST.map(function(s){ return '<option value="' + escAttr(s) + '">'; }).join('') + '</datalist>' +
      '<datalist id="weErasDatalist">' + WE_ERAS_LIST.map(function(s){ return '<option value="' + escAttr(s) + '">'; }).join('') + '</datalist>' +
      '<datalist id="weSeasonsDatalist">' + WE_SEASONS_LIST.map(function(s){ return '<option value="' + escAttr(s) + '">'; }).join('') + '</datalist>' +
      '<datalist id="weMasteryDatalist">' + ((typeof WEAPON_MASTERY !== 'undefined' && Array.isArray(WEAPON_MASTERY)) ? WEAPON_MASTERY.map(function(m){ return '<option value="' + escAttr(m.ru + ' (' + m.orig + ')') + '">'; }).join('') : '') + '</datalist>';

    var showTab = function(tabName){
      return (activeTab === 'all' || activeTab === tabName) ? '' : 'display:none;';
    };

    var curThemeId = WE.getTheme();
    var activeThemeObj = WE_THEMES.find(function(t){ return t.id === curThemeId; }) || WE_THEMES[0];
    var isThemeCollapsed = false;
    try { isThemeCollapsed = localStorage.getItem('we_theme_collapsed') === '1'; } catch(e){}

    var themeCardsHtml = WE_THEMES.map(function(t){
      var isAct = (t.id === curThemeId);
      return '<button type="button" class="fae-theme-option-card' + (isAct ? ' active' : '') + '" data-we-theme-pick="' + escAttr(t.id) + '" style="--fae-chip-accent:' + escAttr(t.accentBright) + ';--fae-chip-glow:' + escAttr(t.glow) + ';">' +
        '<span class="fae-theme-card-icon">' + t.icon + '</span>' +
        '<span class="fae-theme-card-info">' +
          '<span class="fae-theme-card-title">' + esc(t.title) + '</span>' +
          '<span class="fae-theme-card-sub">' + esc(t.sub) + '</span>' +
        '</span>' +
        '<span class="fae-theme-card-dot">' + (isAct ? '●' : '') + '</span>' +
      '</button>';
    }).join('');

    var themeSectionHtml =
      '<div class="sheet-section fae-data-section">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">' +
          '<div>' +
            '<div class="section-label" style="margin:0;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
              '<span>🎨 ТЕМА ОФОРМЛЕНИЯ ВЕСТЕРОСА (ВЕЛИКИЕ ДОМА И ОРДЕНА)</span>' +
              '<span class="fae-class-badge" style="font-size:11px;padding:2px 10px;">' + activeThemeObj.icon + ' ' + esc(activeThemeObj.title) + '</span>' +
            '</div>' +
            '<div class="desc" style="margin-top:4px;">Выбор визуальной атмосферы раздела Вестерос: палитра Великого Дома или Ордена, фоновый геральдический щит и парящие частицы.</div>' +
          '</div>' +
          '<button type="button" class="btn btn-ghost" id="weThemeGridToggleBtn" style="font-size:12px;padding:5px 12px;">' +
            (isThemeCollapsed ? '▼ Развернуть темы (8)' : '▲ Свернуть темы') +
          '</button>' +
        '</div>' +
        '<div id="weThemeGridBody" style="' + (isThemeCollapsed ? 'display:none;' : '') + '">' +
          '<div class="fae-theme-grid">' + themeCardsHtml + '</div>' +
        '</div>' +
      '</div>';

    var heroSectionHtml =
      datalistsHtml +
      '<div class="sheet-section fae-data-section">' +
        '<div class="section-label" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
          '<span>👑 РОСТЕР ПЕРСОНАЖЕЙ & ЛИСТ ГЕРОЯ ВЕСТЕРОСА (D&D 2024)</span>' +
          '<span style="font-size:12px;color:var(--ink-dim);">Персонажей в ростере: <b>' + chars.length + '</b></span>' +
        '</div>' +
        '<p class="desc">Все персонажи Вестероса и Эссоса хранятся и редактируются здесь. Выбранный герой отображается в главном профиле раздела, а любые правки сохраняются автоматически.</p>' +

        '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin:14px 0;">' +
          '<div style="flex:1;min-width:250px;">' +
            '<label style="display:block;font-size:12px;color:#c9a45c;margin-bottom:4px;font-weight:600;font-family:\'Cinzel\',serif;">Активный персонаж Вестероса:</label>' +
            '<select id="weDataProfileSelect" style="width:100%;font-size:14px;padding:9px 12px;border-radius:4px;background:#0f172a;color:#f8fafc;border:1px solid rgba(201,164,92,0.45);">' +
              charOptions +
            '</select>' +
          '</div>' +
          '<div style="display:flex;gap:7px;flex-wrap:wrap;">' +
            '<button type="button" class="btn btn-primary" id="weDataNewCharBtn">➕ Новый герой</button>' +
            '<button type="button" class="btn btn-ghost" id="weDataCloneCharBtn">📋 Дублировать</button>' +
            '<button type="button" class="btn btn-ghost" id="weDataResetCharBtn">🔄 Сбросить</button>' +
            '<button type="button" class="btn btn-ghost" id="weDataCopyTextBtn" title="Скопировать текстовую анкету для System Log / ДМа">📋 Текст</button>' +
            '<button type="button" class="btn btn-ghost" id="weDataExportCharBtn">⬇️ JSON героя</button>' +
            '<button type="button" class="btn btn-ghost" id="weDataImportCharBtn">⬆️ Импорт героя</button>' +
            '<input type="file" id="weDataImportCharFile" accept="application/json,.json" style="display:none;">' +
            '<button type="button" class="btn btn-ghost" id="weDataDelCharBtn" style="color:#f87171;border-color:rgba(239,68,68,0.4);">🗑️ Удалить</button>' +
          '</div>' +
        '</div>' +

        '<div class="fae-data-card" id="weCharSheetCard">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding-bottom:12px;border-bottom:1px solid rgba(201,164,92,0.25);">' +
            '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
              '<div id="weSheetHeroTitle" style="font-size:15px;font-weight:700;color:#c9a45c;letter-spacing:0.06em;font-family:\'Cinzel\',serif;">' +
                getWeRoleIcon(d.house || d.role) + ' ' + esc(d.name || 'Безымянный персонаж') + ' — ' + esc(d.role || 'Вестерос') + ' ' + (d.level || 1) + ' ур.' +
              '</div>' +
              '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">' +
                '<span class="fae-stat-badge">БМ ' + fmtM(pb) + '</span>' +
                '<span class="fae-stat-badge hp">❤️ ' + (d.hpCur != null ? d.hpCur : d.hpMax) + '/' + d.hpMax + ' HP</span>' +
                '<span class="fae-stat-badge ac">🛡️ КБ ' + d.ac + '</span>' +
                '<span class="fae-stat-badge">⚡ Иниц. ' + fmtM(initTotal) + '</span>' +
                '<span class="fae-stat-badge">🪙 ' + (d.goldDragons || 0) + ' зд • ' + (d.silverStags || 0) + ' со</span>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="btn btn-ghost" id="weCharSheetCollapseBtn" style="font-size:12px;padding:5px 12px;">' +
              (isCollapsed ? '▶ Развернуть лист героя' : '▼ Свернуть лист героя') +
            '</button>' +
          '</div>' +

          '<div id="weCharSheetBody" style="' + (isCollapsed ? 'display:none;' : '') + 'padding-top:14px;">' +
            '<div class="fae-sheet-tabs" id="weSheetTabs">' +
              '<button type="button" class="fae-sheet-tab ' + (activeTab === 'main' ? 'active' : '') + '" data-we-tab="main">⚔️ Основное и Бой</button>' +
              '<button type="button" class="fae-sheet-tab ' + (activeTab === 'stats' ? 'active' : '') + '" data-we-tab="stats">🎲 Характеристики и Навыки</button>' +
              '<button type="button" class="fae-sheet-tab ' + (activeTab === 'blood' ? 'active' : '') + '" data-we-tab="blood">🐉 Дары Крови и Свита</button>' +
              '<button type="button" class="fae-sheet-tab ' + (activeTab === 'gear' ? 'active' : '') + '" data-we-tab="gear">🪙 Казна, Снаряжение и Владения</button>' +
              '<button type="button" class="fae-sheet-tab ' + (activeTab === 'bio' ? 'active' : '') + '" data-we-tab="bio">📜 Честь, Клятвы и Биография</button>' +
              '<button type="button" class="fae-sheet-tab ' + (activeTab === 'all' ? 'active' : '') + '" data-we-tab="all">👁️ Весь лист сразу</button>' +
            '</div>' +

            /* ВКЛАДКА 1: ОСНОВНОЕ И БОЙ */
            '<div class="fae-sheet-pane" data-we-pane="main" style="' + showTab('main') + 'padding-top:12px;">' +
              '<div class="section-label" style="margin-top:4px;">👑 Имя, Благородный Дом, Сословие и Эпоха</div>' +
              '<div class="sheet-grid">' +
                '<div class="field"><label>Имя и Титул персонажа</label><input type="text" data-we-field="name" value="' + escAttr(d.name) + '" placeholder="Напр. Сир Дункан Высокий / Джон Сноу"></div>' +
                '<div class="field"><label>Благородный Дом / Орден / Фамилия бастарда</label><input type="text" list="weHousesDatalist" data-we-field="house" value="' + escAttr(d.house) + '" placeholder="Дом Старк / Межевой рыцарь / Сноу..."></div>' +
                '<div class="field"><label>Социальная роль / Архетип</label><input type="text" list="weRolesDatalist" data-we-field="role" value="' + escAttr(d.role) + '" placeholder="Помазанный рыцарь, Мейстер, Водяной танцор..."></div>' +
                '<div class="field"><label>Народ и Кровь (W3)</label><input type="text" list="weOriginsDatalist" data-we-field="origin" value="' + escAttr(d.origin) + '" placeholder="Первые Люди, Андалы, Кровь Валирии..."></div>' +
                '<div class="field"><label>Регион происхождения (W1)</label><input type="text" list="weRegionsDatalist" data-we-field="region" value="' + escAttr(d.region) + '" placeholder="Север, Дорн, Королевская Гавань, Браавос..."></div>' +
                '<div class="field"><label>Эпоха летоисчисления (З.Э. / AC)</label><input type="text" list="weErasDatalist" data-we-field="era" value="' + escAttr(d.era) + '"></div>' +
                '<div class="field"><label>Многолетний сезон (W1-БИС)</label><input type="text" list="weSeasonsDatalist" data-we-field="season" value="' + escAttr(d.season) + '"></div>' +
                '<div class="field"><label>Уровень (1–20)</label><input type="number" min="1" max="20" data-we-field="level" value="' + (d.level || 1) + '"></div>' +
                '<div class="field"><label>Опыт (XP)</label><input type="number" min="0" data-we-field="xp" value="' + (d.xp || 0) + '"></div>' +
                '<div class="field"><label>Бонус мастерства</label><div class="readonly-val" style="padding-top:8px;font-family:\'Cinzel\',serif;font-size:18px;color:#c9a45c;font-weight:700;">' + fmtM(pb) + '</div></div>' +
              '</div>' +

              '<div class="section-label" style="margin-top:20px;">🛡️ Боевые параметры, Бодрость и Ранения (Б1, W25)</div>' +
              '<div class="combat-strip">' +
                '<div class="combat-box"><span class="cb-label">КБ (Доспех)</span><input type="number" data-we-field="ac" value="' + d.ac + '"></div>' +
                '<div class="combat-box"><span class="cb-label">Хиты (Текущ.)</span><input type="number" data-we-field="hpCur" value="' + (d.hpCur != null ? d.hpCur : d.hpMax) + '" style="color:#86efac;font-weight:700;"></div>' +
                '<div class="combat-box"><span class="cb-label">Хиты (Макс.)</span><input type="number" data-we-field="hpMax" value="' + d.hpMax + '" style="color:#fca5a5;font-weight:700;"></div>' +
                '<div class="combat-box"><span class="cb-label">Выносливость</span><input type="number" data-we-field="staminaMax" value="' + (d.staminaMax || 10) + '" title="Запас выносливости / костей боевого мастерства"></div>' +
                '<div class="combat-box"><span class="cb-label">Кости хитов</span><input type="text" data-we-field="hitDiceTotal" value="' + escAttr(String(d.hitDiceTotal || '1')) + '"></div>' +
                '<div class="combat-box"><span class="cb-label">Тип кости</span><input type="text" data-we-field="hitDiceType" value="' + escAttr(d.hitDiceType || 'd10') + '"></div>' +
                '<div class="combat-box"><span class="cb-label">Истощение (0–6)</span><input type="number" min="0" max="6" data-we-field="exhaustion" value="' + (d.exhaustion || 0) + '"></div>' +
                '<div class="combat-box"><span class="cb-label">Инициатива</span><div class="readonly-val">' + fmtM(initTotal) + '</div></div>' +
                '<div class="combat-box"><span class="cb-label">Пасс. Воспр.</span><div class="readonly-val">' + passivePerception + '</div></div>' +
              '</div>' +

              '<div class="sheet-grid" style="margin-top:12px;">' +
                '<div class="field"><label>Надетый доспех и видимость герба (A100, Б6)</label><input type="text" data-we-field="armorType" value="' + escAttr(d.armorType || '') + '" placeholder="Полные миланские латы / Кольчуга / Дублет с гербом..."></div>' +
                '<div class="field"><label>Ранения, перевязки мейстера, хмель или маковое молоко (Б1)</label><input type="text" data-we-field="woundsAndEffects" value="' + escAttr(d.woundsAndEffects || '') + '" placeholder="Чист / Перевязанная рана плеча / Маковое молоко (1 стадия)..."></div>' +
              '</div>' +

              '<div class="section-label" style="margin-top:20px;">⚔️ Оружие Вестероса и Эссоса (Обычная / Замковая / Валирийская сталь)</div>' +
              '<div id="weAttacksList">' + attackRows + '</div>' +
              '<button type="button" class="add-row-btn" id="weAddAttackBtn">+ Добавить оружие или атаку</button>' +
            '</div>' +

            /* ВКЛАДКА 2: ХАРАКТЕРИСТИКИ И НАВЫКИ */
            '<div class="fae-sheet-pane" data-we-pane="stats" style="' + showTab('stats') + 'padding-top:12px;">' +
              '<div class="section-label" style="margin-top:4px;">🎲 6 Основных Характеристик</div>' +
              '<div class="ability-row">' + abilityBoxes + '</div>' +
              '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:20px;margin-top:20px;">' +
                '<div>' +
                  '<div class="section-label" style="margin-top:0;">🛡️ Спасброски</div>' +
                  '<div style="background:rgba(15,23,42,0.5);border:1px solid rgba(201,164,92,0.2);border-radius:6px;padding:8px 12px;">' +
                    saveRows +
                  '</div>' +
                '</div>' +
                '<div>' +
                  '<div class="section-label" style="margin-top:0;">🎯 Навыки (Клик: Нет → Владение → Экспертиза)</div>' +
                  '<div style="background:rgba(15,23,42,0.5);border:1px solid rgba(201,164,92,0.2);border-radius:6px;padding:8px 12px;">' +
                    skillRows +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +

            /* ВКЛАДКА 3: ДАРЫ КРОВИ И СВИТА (W3-БИС, Б4.1) */
            '<div class="fae-sheet-pane" data-we-pane="blood" style="' + showTab('blood') + 'padding-top:12px;">' +
              '<div class="section-label" style="margin-top:4px;">🐉 Опциональный модуль: Древний Дар Крови (W3-БИС, Б5)</div>' +
              '<div class="sheet-grid" style="margin-bottom:14px;">' +
                '<div class="field" style="grid-column:1 / -1;">' +
                  '<label>Наличие сверхъестественного дара крови в кампании</label>' +
                  '<select data-we-field="bloodGiftType">' +
                    '<option value="none" ' + (d.bloodGiftType === 'none' ? 'selected' : '') + '>⚔️ Обычный человек Семи Королевств (Без мистических даров)</option>' +
                    '<option value="dragonrider" ' + (d.bloodGiftType === 'dragonrider' ? 'selected' : '') + '>🐉 Всадник Дракона (Кровь Старой Валирии)</option>' +
                    '<option value="warg" ' + (d.bloodGiftType === 'warg' ? 'selected' : '') + '>🐺 Варг и Оборотень (Кровь Первых Людей — связь с лютоволком/зверем)</option>' +
                    '<option value="greensight" ' + (d.bloodGiftType === 'greensight' ? 'selected' : '') + '>🌳 Зелёные сны и Древовидение (Greensight)</option>' +
                    '<option value="rhllor" ' + (d.bloodGiftType === 'rhllor' ? 'selected' : '') + '>🔥 Тайные искусства (Красный жрец Р\'глора / Безликий / Алхимик Дикого огня)</option>' +
                  '</select>' +
                '</div>' +
              '</div>' +
              '<div class="field" style="margin-bottom:18px;">' +
                '<label>Профиль Дракона / Лютоволка / Тайных обрядов (если выбран дар крови)</label>' +
                '<textarea data-we-field="bloodGiftNotes" style="min-height:100px;" placeholder="Кличка лютоволка или дракона, стадия роста, HP, КБ, нрав, сытость, команды на Высоком Валирийском или 3 табу Хаггона...">' + esc(d.bloodGiftNotes || '') + '</textarea>' +
              '</div>' +
              '<div class="section-label">🐎 Боевой скакун, Оруженосец и Свита («Рыцарское копьё», Б4.1)</div>' +
              '<div class="field">' +
                '<label>Спутники, присяжные мечи, оруженосец и кони (дестриэ / курсер / гаррон)</label>' +
                '<textarea data-we-field="companionNotes" style="min-height:110px;" placeholder="Конь: дестриэ «Гром» (HP 19, КБ 11, чепрак с гербом).\nОруженосец: Подрик (HP 11, КБ 14, лояльность высокая)...">' + esc(d.companionNotes || '') + '</textarea>' +
              '</div>' +
            '</div>' +

            /* ВКЛАДКА 4: КАЗНА, СНАРЯЖЕНИЕ И ВЛАДЕНИЯ (W10, Б6, Б11, Б12) */
            '<div class="fae-sheet-pane" data-we-pane="gear" style="' + showTab('gear') + 'padding-top:12px;">' +
              '<div class="section-label" style="margin-top:4px;">🪙 Монетный Двор Семи Королевств (1 зд = 210 со = 11 760 мг)</div>' +
              '<div class="we-coin-strip">' +
                '<div class="we-coin-box"><label>🟡 Золотые Драконы (зд)</label><input type="number" min="0" data-we-field="goldDragons" value="' + (d.goldDragons || 0) + '"><span class="we-coin-sub">1 зд = 210 серебряных оленей</span></div>' +
                '<div class="we-coin-box"><label>⚪ Серебряные Олени (со)</label><input type="number" min="0" data-we-field="silverStags" value="' + (d.silverStags || 0) + '"><span class="we-coin-sub">1 со = 7 звёзд = 56 грошей</span></div>' +
                '<div class="we-coin-box"><label>🟠 Медные Звёзды</label><input type="number" min="0" data-we-field="copperStars" value="' + (d.copperStars || 0) + '"><span class="we-coin-sub">1 звезда = 8 медных грошей</span></div>' +
                '<div class="we-coin-box"><label>🟤 Медные Гроши (мг)</label><input type="number" min="0" data-we-field="copperPennies" value="' + (d.copperPennies || 0) + '"><span class="we-coin-sub">Обычная разменная монета</span></div>' +
              '</div>' +
              '<div class="sheet-grid" style="margin-top:12px;">' +
                '<div class="field"><label>Эквивалент наличных в Серебряных Оленях</label><div class="readonly-val" style="padding-top:8px;color:#fde68a;font-family:\'JetBrains Mono\',monospace;font-weight:700;">≈ ' + totalSilverEquiv + ' со</div></div>' +
                '<div class="field"><label>Казна замка / Сундук / Векселя Железного Банка Браавоса</label><input type="text" data-we-field="bankVault" value="' + escAttr(d.bankVault || '') + '" placeholder="Напр. 500 зд в казне замка, вексель на 1000 зд..."></div>' +
              '</div>' +

              '<div class="section-label" style="margin-top:20px;">🎒 Двухзонное хранение снаряжения (Б6 — без бездонных сумок!)</div>' +
              '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;">' +
                '<div class="field"><label>🗡️ Зона 1: ПРИ СЕБЕ СЕЙЧАС (На поясе, в руках, в кошеле)</label><textarea data-we-field="equipOnSelf" style="min-height:120px;">' + esc(d.equipOnSelf || '') + '</textarea></div>' +
                '<div class="field"><label>🐎 Зона 2: ВО ВЬЮКАХ СКАКУНА / В СУНДУКЕ ПОКОЕВ / НА КОРАБЛЕ</label><textarea data-we-field="equipStorage" style="min-height:120px;">' + esc(d.equipStorage || '') + '</textarea></div>' +
              '</div>' +

              '<div class="section-label" style="margin-top:20px;">🏰 Замок, Поместье, Заведение (Шёлковый дом / Таверна) или Корабль (Б11–Б12)</div>' +
              '<div class="field"><label>Феодальные владения, гарнизон, доход и флот (если есть у героя)</label><textarea data-we-field="domainNotes" style="min-height:100px;" placeholder="Замок / Рыцарская башня / Таверна / Корабль: укрепления, гарнизон, запасы на зиму, кастелян, мейстер и лунный доход...">' + esc(d.domainNotes || '') + '</textarea></div>' +
            '</div>' +

            /* ВКЛАДКА 5: ЧЕСТЬ, КЛЯТВЫ И БИОГРАФИЯ (Б7, Б8) */
            '<div class="fae-sheet-pane" data-we-pane="bio" style="' + showTab('bio') + 'padding-top:12px;">' +
              '<div class="section-label" style="margin-top:4px;">⚖️ 5 слоёв Репутации, Рыцарской Чести и Клятвы (Б7, Б8)</div>' +
              '<div class="sheet-grid">' +
                '<div class="field"><label>Б8-1. Узнаваемость лица, имени и герба (0–5)</label><input type="text" data-we-field="repRecognition" value="' + escAttr(d.repRecognition || '') + '"></div>' +
                '<div class="field"><label>Б8-2. Рыцарская честь и молва (-100…+100)</label><input type="text" data-we-field="repHonor" value="' + escAttr(d.repHonor || '') + '"></div>' +
                '<div class="field"><label>Б8-3/4. Отношение Великих Домов и Регионов</label><input type="text" data-we-field="repHouses" value="' + escAttr(d.repHouses || '') + '"></div>' +
                '<div class="field"><label>Б8-5. Правовой статус и охранные грамоты</label><input type="text" data-we-field="repLegal" value="' + escAttr(d.repLegal || '') + '"></div>' +
              '</div>' +
              '<div class="field" style="margin-top:12px;"><label>📜 Клятвы, Долги, Вороньи письма и Дедлайны (Б7)</label><textarea data-we-field="oathsAndDebts" style="min-height:90px;" placeholder="Присяга сюзерену, долг Железному Банку, назначенный турнир или суд поединком...">' + esc(d.oathsAndDebts || '') + '</textarea></div>' +

              '<div class="section-label" style="margin-top:20px;">👤 Внешность, Шрамы и История</div>' +
              '<div class="sheet-grid">' +
                '<div class="field"><label>Возраст</label><input type="text" data-we-field="age" value="' + escAttr(d.age || '') + '"></div>' +
                '<div class="field"><label>Рост</label><input type="text" data-we-field="height" value="' + escAttr(d.height || '') + '"></div>' +
                '<div class="field"><label>Вес</label><input type="text" data-we-field="weight" value="' + escAttr(d.weight || '') + '"></div>' +
                '<div class="field"><label>Глаза</label><input type="text" data-we-field="eyes" value="' + escAttr(d.eyes || '') + '"></div>' +
                '<div class="field"><label>Волосы</label><input type="text" data-we-field="hair" value="' + escAttr(d.hair || '') + '"></div>' +
                '<div class="field"><label>Родовой девиз</label><input type="text" data-we-field="motto" value="' + escAttr(d.motto || '') + '" placeholder="Напр. Зима близко"></div>' +
              '</div>' +
              '<div class="field" style="margin-top:12px;"><label>📖 Биография, старые шрамы и квента персонажа</label><textarea data-we-field="backstory" style="min-height:120px;">' + esc(d.backstory || '') + '</textarea></div>' +
            '</div>' +

            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-top:18px;padding-top:14px;border-top:1px solid rgba(201,164,92,0.25);">' +
              '<button type="button" class="btn btn-primary" id="weDataSaveCharBtn">💾 Сохранить лист героя</button>' +
              '<span style="font-size:12px;color:#94a3b8;font-style:italic;">Автосохранение включено — все правки сразу записываются в профиль</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    var curKey = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';

    return renderCrumb([{ label: 'Вестерос', nav: 'weHome' }, { label: 'Данные & Кампания' }]) +
      '<button class="back" data-go="weHome">← На главную</button>' +
      '<h1>💾 Данные & Кампания Вестероса</h1>' +
      '<p class="subtitle">Ростер и полный лист персонажа «Песни Льда и Огня», темы Великих Домов, монетный двор, хроники кампании, Gemini AI и резервные копии.</p>' +
      '<div class="fae-rule"></div>' +

      themeSectionHtml +
      heroSectionHtml +

      '<div class="sheet-section fae-data-section">' +
        '<div class="section-label">🐦‍⬛ ХРОНИКИ КАМПАНИИ СЕМИ КОРОЛЕВСТВ & ЗАМЕТКИ</div>' +
        '<div class="desc">Текущий год от Завоевания Эйгона (З.Э.), локация, вороньи вести, часы интриг и заметки партии.</div>' +
        '<div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:10px;">' +
          '<div>' +
            '<label style="display:block;font-size:11.5px;color:#c9a45c;margin-bottom:4px;font-family:\'Cinzel\',serif;">Название хроники / кампании:</label>' +
            '<input type="text" id="weCampaignTitle" value="' + escAttr(camp.title || '') + '" style="width:100%;box-sizing:border-box;padding:9px 12px;background:#0b0f17;border:1px solid rgba(201,164,92,0.3);color:#fff;border-radius:4px;">' +
          '</div>' +
          '<div>' +
            '<label style="display:block;font-size:11.5px;color:#c9a45c;margin-bottom:4px;font-family:\'Cinzel\',serif;">Текущий год З.Э., сезон и замок/город:</label>' +
            '<input type="text" id="weCampaignLocation" value="' + escAttr(camp.location || '') + '" style="width:100%;box-sizing:border-box;padding:9px 12px;background:#0b0f17;border:1px solid rgba(201,164,92,0.3);color:#fff;border-radius:4px;">' +
          '</div>' +
        '</div>' +
        '<div style="margin-top:10px;">' +
          '<label style="display:block;font-size:11.5px;color:#c9a45c;margin-bottom:4px;font-family:\'Cinzel\',serif;">Вороньи письма, слухи и журнал событий:</label>' +
          '<textarea id="weCampaignNotes" rows="5" style="width:100%;box-sizing:border-box;padding:10px 12px;background:#0b0f17;border:1px solid rgba(201,164,92,0.3);color:#cbd5e1;border-radius:4px;font-family:\'EB Garamond\',serif;font-size:14px;line-height:1.5;">' + esc(camp.notes || '') + '</textarea>' +
        '</div>' +
        '<div style="margin-top:12px;">' +
          '<button type="button" class="btn btn-primary" id="weSaveCampaignBtn">💾 Сохранить хроники кампании</button>' +
        '</div>' +
      '</div>' +

      '<div class="sheet-section fae-data-section">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
          '<span style="font-size:22px;">🤖</span>' +
          '<div>' +
            '<div style="font-weight:700;font-size:13.5px;color:#c9a45c;font-family:\'Cinzel\',serif;">GOOGLE GEMINI AI // АРХИВЫ ЦИТАДЕЛИ</div>' +
            '<div style="font-size:12px;color:#94a3b8;">Единый ключ для ИИ-генерации способностей, воинских приёмов и контента Вестероса</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">' +
          '<input type="password" id="weDataGeminiKey" value="' + escAttr(curKey) + '" placeholder="Вставьте ключ AIzaSy..." style="flex:1;min-width:220px;box-sizing:border-box;background:#0b0f17;border:1px solid rgba(201,164,92,0.35);color:#fff;padding:9px 12px;border-radius:4px;font-family:monospace;font-size:13px;">' +
          '<button type="button" class="btn btn-primary" id="weSaveGeminiKeyBtn">💾 Сохранить API Ключ</button>' +
        '</div>' +
      '</div>' +

      (typeof AppStorage !== 'undefined' ? AppStorage.renderWidget('we') : '') +

      '<div class="sheet-section fae-data-section">' +
        '<div class="section-label">📦 ПОЛНЫЙ ЭКСПОРТ И ИМПОРТ РАЗДЕЛА «ВЕСТЕРОС»</div>' +
        '<div class="desc">Резервная копия сохраняет всех персонажей ростера Вестероса, их воинские приёмы, казну, владения и хроники кампании в один JSON-файл.</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">' +
          '<button type="button" class="btn btn-primary" id="weExportAllBtn">📥 Экспорт в файл JSON</button>' +
          '<button type="button" class="btn btn-ghost" id="weImportBtn">📤 Импорт из файла JSON</button>' +
          '<input type="file" id="weImportFile" accept="application/json,.json" style="display:none;">' +
        '</div>' +
      '</div>' +

      (typeof GHSync !== 'undefined' && typeof GHSync.renderUI === 'function' ? GHSync.renderUI() : '');
  }

  function wireWeData(){
    var g = function(id){ return document.getElementById(id); };
    if(typeof AppStorage !== 'undefined' && AppStorage.wireWidget) AppStorage.wireWidget('we');
    if(typeof GHSync !== 'undefined' && typeof GHSync.wireUI === 'function') GHSync.wireUI();

    var themeToggleBtn = g('weThemeGridToggleBtn');
    var themeGridBody = g('weThemeGridBody');
    if(themeToggleBtn && themeGridBody){
      themeToggleBtn.addEventListener('click', function(){
        var hidden = themeGridBody.style.display === 'none';
        themeGridBody.style.display = hidden ? '' : 'none';
        themeToggleBtn.textContent = hidden ? '▲ Свернуть темы' : '▼ Развернуть темы (8)';
        try { localStorage.setItem('we_theme_collapsed', hidden ? '0' : '1'); } catch(e){}
      });
    }

    document.querySelectorAll('[data-we-theme-pick]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.getAttribute('data-we-theme-pick');
        if(!id) return;
        WE.setTheme(id);
        var tObj = WE_THEMES.find(function(t){ return t.id === id; });
        if(tObj && tObj.toast) WE.toast(tObj.toast);
        render();
      });
    });

    var profSel = g('weDataProfileSelect');
    if(profSel){
      profSel.addEventListener('change', function(){
        WE.setActiveCharacter(this.value);
        render();
      });
    }

    var newBtn = g('weDataNewCharBtn');
    if(newBtn){
      newBtn.addEventListener('click', function(){
        var nc = defaultWesterosCharacter('Новый персонаж ' + (WE.profiles.length + 1));
        WE.profiles.push(nc);
        WE.activeProfileId = nc.id;
        WE.saveProfiles();
        WE.toast('➕ Создан новый персонаж Вестероса');
        render();
      });
    }

    var cloneBtn = g('weDataCloneCharBtn');
    if(cloneBtn){
      cloneBtn.addEventListener('click', function(){
        var cur = WE.getActiveCharacter();
        if(!cur) return;
        var copy = JSON.parse(JSON.stringify(cur));
        copy.id = 'we_char_' + Date.now();
        copy.name = (copy.name || 'Персонаж') + ' (Копия)';
        WE.profiles.push(copy);
        WE.activeProfileId = copy.id;
        WE.saveProfiles();
        WE.toast('📋 Профиль дублирован');
        render();
      });
    }

    var resetBtn = g('weDataResetCharBtn');
    if(resetBtn){
      resetBtn.addEventListener('click', function(){
        var cur = WE.getActiveCharacter();
        if(!cur) return;
        var fresh = defaultWesterosCharacter(cur.name || '');
        fresh.id = cur.id;
        var idx = WE.profiles.findIndex(function(x){ return x.id === cur.id; });
        if(idx !== -1) WE.profiles[idx] = fresh;
        WE.saveProfiles();
        WE.toast('🔄 Параметры персонажа сброшены по умолчанию');
        render();
      });
    }

    var copyTxtBtn = g('weDataCopyTextBtn');
    if(copyTxtBtn){
      copyTxtBtn.addEventListener('click', function(){
        var c = WE.getActiveCharacter();
        if(!c) return;
        var txt = [
          '👑 ПЕРСОНАЖ ВЕСТЕРОСА: ' + (c.name || 'Безымянный'),
          'Дом / Статус: ' + (c.house || '—') + ' | Роль: ' + (c.role || '—') + ' (' + (c.level || 1) + ' ур.)',
          'Народ: ' + (c.origin || '—') + ' | Регион: ' + (c.region || '—') + ' | Эпоха: ' + (c.era || '—') + ' (' + (c.season || '') + ')',
          'Бой: HP ' + (c.hpCur != null ? c.hpCur : c.hpMax) + '/' + c.hpMax + ' | КБ ' + c.ac + ' (' + (c.armorType || '') + ') | Выносливость: ' + (c.staminaMax || 10),
          'Характеристики: СИЛ ' + c.abilities.str + ', ЛОВ ' + c.abilities.dex + ', ТЕЛ ' + c.abilities.con + ', ИНТ ' + c.abilities.int + ', МУД ' + c.abilities.wis + ', ХАР ' + c.abilities.cha,
          'Казна: ' + (c.goldDragons || 0) + ' зд, ' + (c.silverStags || 0) + ' со, ' + (c.copperStars || 0) + ' зв., ' + (c.copperPennies || 0) + ' мг | Хранение: ' + (c.bankVault || '—'),
          'При себе (Б6): ' + (c.equipOnSelf || '—'),
          'Во вьюках / сундуке: ' + (c.equipStorage || '—')
        ].join('\n');
        if(typeof copyText === 'function') copyText(txt);
        WE.toast('📋 Анкета персонажа скопирована в буфер обмена');
      });
    }

    var expCharBtn = g('weDataExportCharBtn');
    if(expCharBtn){
      expCharBtn.addEventListener('click', function(){
        var c = WE.getActiveCharacter();
        if(!c) return;
        var blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'westeros_hero_' + (c.name || 'character').replace(/\s+/g, '_') + '.json';
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    var impCharBtn = g('weDataImportCharBtn');
    var impCharFile = g('weDataImportCharFile');
    if(impCharBtn && impCharFile){
      impCharBtn.addEventListener('click', function(){ impCharFile.click(); });
      impCharFile.addEventListener('change', function(e){
        var file = e.target.files && e.target.files[0];
        if(!file) return;
        var reader = new FileReader();
        reader.onload = function(){
          try {
            var parsed = JSON.parse(reader.result);
            if(parsed && typeof parsed === 'object'){
              parsed.id = 'we_char_' + Date.now();
              WE.profiles.push(parsed);
              WE.activeProfileId = parsed.id;
              WE.loadProfiles();
              WE.saveProfiles();
              WE.toast('⬆️ Персонаж Вестероса импортирован!');
              render();
            }
          } catch(err){
            WE.toast('⚠️ Некорректный JSON-файл героя');
          }
        };
        reader.readAsText(file);
      });
    }

    var delBtn = g('weDataDelCharBtn');
    if(delBtn){
      delBtn.addEventListener('click', function(){
        if(WE.profiles.length <= 1){
          WE.toast('⚠️ В ростере должен оставаться хотя бы один персонаж');
          return;
        }
        var cur = WE.getActiveCharacter();
        WE.profiles = WE.profiles.filter(function(x){ return x.id !== cur.id; });
        WE.activeProfileId = WE.profiles[0].id;
        WE.saveProfiles();
        WE.toast('🗑️ Персонаж удалён из ростера');
        render();
      });
    }

    var colBtn = g('weCharSheetCollapseBtn');
    var sheetBody = g('weCharSheetBody');
    if(colBtn && sheetBody){
      colBtn.addEventListener('click', function(){
        var hidden = sheetBody.style.display === 'none';
        sheetBody.style.display = hidden ? '' : 'none';
        colBtn.textContent = hidden ? '▼ Свернуть лист героя' : '▶ Развернуть лист героя';
        try { localStorage.setItem('we_sheet_collapsed', hidden ? '0' : '1'); } catch(e){}
      });
    }

    document.querySelectorAll('[data-we-tab]').forEach(function(tabBtn){
      tabBtn.addEventListener('click', function(){
        var tName = tabBtn.getAttribute('data-we-tab') || 'main';
        try { localStorage.setItem('we_sheet_tab', tName); } catch(e){}
        document.querySelectorAll('[data-we-tab]').forEach(function(b){
          b.classList.toggle('active', b.getAttribute('data-we-tab') === tName);
        });
        document.querySelectorAll('[data-we-pane]').forEach(function(pane){
          var pName = pane.getAttribute('data-we-pane');
          pane.style.display = (tName === 'all' || pName === tName) ? '' : 'none';
        });
      });
    });

    document.querySelectorAll('[data-we-field]').forEach(function(inp){
      var evt = (inp.tagName === 'SELECT' || inp.type === 'number') ? 'change' : 'input';
      inp.addEventListener(evt, function(){
        var c = WE.getActiveCharacter();
        if(!c) return;
        var f = inp.getAttribute('data-we-field');
        var val = inp.type === 'number' ? (Number(inp.value) || 0) : inp.value;
        c[f] = val;
        WE.saveProfiles();
        if(f === 'level' || f === 'goldDragons' || f === 'silverStags' || f === 'copperStars' || f === 'copperPennies' || f === 'name' || f === 'role' || f === 'house'){
          if(evt === 'change') render();
        }
      });
    });

    document.querySelectorAll('[data-we-ab]').forEach(function(inp){
      inp.addEventListener('change', function(){
        var c = WE.getActiveCharacter();
        if(!c) return;
        var k = inp.getAttribute('data-we-ab');
        var v = Math.max(1, Math.min(30, parseInt(inp.value, 10) || 10));
        c.abilities[k] = v;
        WE.saveProfiles();
        render();
      });
    });

    document.querySelectorAll('[data-we-save]').forEach(function(row){
      row.addEventListener('click', function(){
        var c = WE.getActiveCharacter();
        if(!c) return;
        var k = row.getAttribute('data-we-save');
        c.saveProf[k] = !c.saveProf[k];
        WE.saveProfiles();
        render();
      });
    });

    document.querySelectorAll('[data-we-skill]').forEach(function(row){
      row.addEventListener('click', function(){
        var c = WE.getActiveCharacter();
        if(!c) return;
        var k = row.getAttribute('data-we-skill');
        var cur = Number(c.skillProf[k] || 0);
        c.skillProf[k] = (cur + 1) % 3;
        WE.saveProfiles();
        render();
      });
    });

    var addAtkBtn = g('weAddAttackBtn');
    if(addAtkBtn){
      addAtkBtn.addEventListener('click', function(){
        var c = WE.getActiveCharacter();
        if(!c) return;
        if(!Array.isArray(c.attacks)) c.attacks = [];
        c.attacks.push({ name: '', bonus: '+0', damage: '1d8', mastery: '' });
        WE.saveProfiles();
        render();
      });
    }

    document.querySelectorAll('[data-we-atk-field]').forEach(function(inp){
      inp.addEventListener('input', function(){
        var c = WE.getActiveCharacter();
        if(!c || !Array.isArray(c.attacks)) return;
        var idx = parseInt(inp.getAttribute('data-idx'), 10);
        var f = inp.getAttribute('data-we-atk-field');
        if(c.attacks[idx]) c.attacks[idx][f] = inp.value;
        WE.saveProfiles();
      });
    });

    document.querySelectorAll('[data-we-del-atk]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var c = WE.getActiveCharacter();
        if(!c || !Array.isArray(c.attacks)) return;
        var idx = parseInt(btn.getAttribute('data-we-del-atk'), 10);
        c.attacks.splice(idx, 1);
        WE.saveProfiles();
        render();
      });
    });

    var saveCharBtn = g('weDataSaveCharBtn');
    if(saveCharBtn){
      saveCharBtn.addEventListener('click', function(){
        WE.saveProfiles();
        WE.toast('💾 Лист персонажа Вестероса сохранён!');
        render();
      });
    }

    var saveCampBtn = g('weSaveCampaignBtn');
    if(saveCampBtn){
      saveCampBtn.addEventListener('click', function(){
        WE.saveCampaign({
          title: (g('weCampaignTitle') || {}).value || '',
          location: (g('weCampaignLocation') || {}).value || '',
          notes: (g('weCampaignNotes') || {}).value || ''
        });
        WE.toast('💾 Хроники кампании Вестероса сохранены');
      });
    }

    var saveKeyBtn = g('weSaveGeminiKeyBtn');
    if(saveKeyBtn){
      saveKeyBtn.addEventListener('click', function(){
        var kVal = ((g('weDataGeminiKey') || {}).value || '').trim();
        if(typeof window.setGeminiApiKey === 'function') window.setGeminiApiKey(kVal);
        else {
          try { localStorage.setItem('dnd_gemini_api_key', kVal); } catch(e){}
        }
        WE.toast('🔑 Ключ Gemini API сохранён');
      });
    }

    var expAllBtn = g('weExportAllBtn');
    if(expAllBtn){
      expAllBtn.addEventListener('click', function(){
        var payload = {
          kind: 'westeros',
          version: 1,
          exportedAt: new Date().toISOString(),
          activeProfileId: WE.activeProfileId,
          theme: WE.getTheme(),
          campaign: WE.loadCampaign(),
          profiles: WE.profiles
        };
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'westeros_compendium_backup_' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    var impAllBtn = g('weImportBtn');
    var impAllFile = g('weImportFile');
    if(impAllBtn && impAllFile){
      impAllBtn.addEventListener('click', function(){ impAllFile.click(); });
      impAllFile.addEventListener('change', function(e){
        var file = e.target.files && e.target.files[0];
        if(!file) return;
        var reader = new FileReader();
        reader.onload = function(){
          try {
            var data = JSON.parse(reader.result);
            if(data && Array.isArray(data.profiles) && data.profiles.length){
              WE.profiles = data.profiles;
              WE.activeProfileId = data.activeProfileId || data.profiles[0].id;
              WE.saveProfiles();
              if(data.campaign) WE.saveCampaign(data.campaign);
              if(data.theme) WE.setTheme(data.theme);
              WE.toast('📤 Данные раздела «Вестерос» успешно импортированы!');
              render();
            } else {
              WE.toast('⚠️ Некорректный формат резервной копии Вестероса');
            }
          } catch(err){
            WE.toast('⚠️ Ошибка чтения JSON-файла');
          }
        };
        reader.readAsText(file);
      });
    }
  }

  window.weHome = weHome;
  window.weMap = weMap;
  window.wireWeMap = wireWeMap;
  window.weTechs = weTechs;
  window.weTechView = weTechView;
  window.weTechEdit = weTechEdit;
  window.weTechGen = weTechGen;
  window.wireWeTechs = wireWeTechs;
  window.weData = weData;
  window.wireWeData = wireWeData;
})();
