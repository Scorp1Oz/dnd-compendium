/* ==========================================================================
   МОДУЛЬ: ЗВЕЗДНЫЕ ВОЙНЫ (ДАЛЁКАЯ-ДАЛЁКАЯ ГАЛАКТИКА — СИЛА, ФЕХТОВАНИЕ, ГОЛОКРОН)
   ========================================================================== */
(function(){

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

var _swCrumbHtml = '';
function renderCrumb(parts) {
  _swCrumbHtml = '<div class="crumb">' + (parts || []).map(function(p, i) {
    var last = i === parts.length - 1;
    return (i > 0 ? '<span class="sep">/</span>' : '') +
      '<span class="seg ' + (last ? 'current' : '') + '" data-sw-crumb-nav="' + esc(p.nav || '') + '"' +
      (p.nav ? ' style="cursor:pointer"' : '') + '>' + esc(p.label) + '</span>';
  }).join('') + '</div>';
  return _swCrumbHtml;
}

function go(nextView) {
  if (typeof nextView === 'string') nextView = { screen: nextView };
  window.view = view = nextView;
  if (typeof window.render === 'function') window.render();
  window.scrollTo(0, 0);
}

function mount(html) {
  var app = document.getElementById('app');
  if (app) {
    app.classList.remove('wide');
    app.classList.add('home-wide');
    app.innerHTML = (_swCrumbHtml || '') + html;
    _swCrumbHtml = '';
    app.querySelectorAll('[data-sw-crumb-nav]').forEach(function(el) {
      var target = el.getAttribute('data-sw-crumb-nav');
      if (target) {
        el.addEventListener('click', function() {
          go({ screen: target });
        });
      }
    });
  }
  if (typeof paintShBar === 'function') paintShBar();
}

var SW = {
  profiles: [],
  activeProfileId: '',
  techs: [],
  moves: [],
  skills: [],
  meta: {
    worldName: 'Далёкая-далёкая Галактика',
    era: 'Эпоха Старой Республики / Войн Клонов / Империи',
    campaignNotes: '',
    theme: 'jedi'
  },

  getTheme: function() {
    try {
      var saved = localStorage.getItem('ttc_sw_theme');
      if (saved === 'sith' || saved === 'jedi') {
        SW.meta.theme = saved;
        return saved;
      }
    } catch (e) {}
    return SW.meta && SW.meta.theme === 'sith' ? 'sith' : 'jedi';
  },

  setTheme: function(themeName) {
    var t = (themeName === 'sith') ? 'sith' : 'jedi';
    SW.meta.theme = t;
    try {
      localStorage.setItem('ttc_sw_theme', t);
    } catch (e) {}
    SW.saveMeta();
    applyStarWarsTheme();
    if (typeof updateHbSegIndicator === 'function') updateHbSegIndicator(false);
  },

  defaultTechs: function() {
    return [
      {
        id: 'sw_t_push',
        name: 'Толчок Силы (Force Push)',
        side: 'Универсальная',
        rank: 'Базовая',
        cost: '1 Очко Силы',
        actionType: '1 действие',
        range: '9 м (конус / линия)',
        duration: 'Мгновенно',
        tags: ['Сила', 'Телекинез', 'Контроль'],
        desc: 'Вы направляете мощную кинетическую волну Силы. Цель совершает спасбросок Силы (Сл = 8 + БМ + модификатор Силы/Мудрости/Харизмы). При провале получает 2d8 силового урона и отбрасывается на 4.5 м (или сбивается с ног).'
      },
      {
        id: 'sw_t_pull',
        name: 'Притяжение Силы (Force Pull)',
        side: 'Универсальная',
        rank: 'Базовая',
        cost: '1 Очко Силы',
        actionType: '1 бонусное действие',
        range: '12 м',
        duration: 'Мгновенно',
        tags: ['Сила', 'Телекинез', 'Оружие'],
        desc: 'Вытягивает предмет из рук противника или притягивает существо среднего размера на 4.5 м к вам. Цель проходит спасбросок Силы или Ловкости.'
      },
      {
        id: 'sw_t_mind_trick',
        name: 'Обман разума (Mind Trick)',
        side: 'Светлая сторона',
        rank: 'Адепт',
        cost: '2 Очка Силы',
        actionType: '1 действие',
        range: '6 м',
        duration: 'До 10 минут',
        tags: ['Сила', 'Разум', 'Дипломатия'],
        desc: '«Это не те дроиды, которых вы ищете». Вы внушаете разумному существу со слабой волей короткую правдоподобную мысль или заставляете проигнорировать ваше присутствие (спасбросок Мудрости).'
      },
      {
        id: 'sw_t_heal',
        name: 'Исцеление Силы (Force Heal)',
        side: 'Светлая сторона',
        rank: 'Мастер',
        cost: '2 Очка Силы',
        actionType: '1 действие',
        range: 'Касание',
        duration: 'Мгновенно',
        tags: ['Сила', 'Светлая сторона', 'Лечение'],
        desc: 'Передача жизненной энергии Живой Силы. Восстанавливает цели 2d8 + модификатор Мудрости ХП и снимает состояние отравления или оглушения.'
      },
      {
        id: 'sw_t_lightning',
        name: 'Молния Силы (Force Lightning)',
        side: 'Тёмная сторона',
        rank: 'Мастер',
        cost: '3 Очка Силы',
        actionType: '1 действие',
        range: '9 м',
        duration: 'Мгновенно',
        tags: ['Сила', 'Тёмная сторона', 'Урон'],
        desc: 'С кончиков ваших пальцев срываются ослепительные разряды тёмной энергии. Цель проходит спасбросок Ловкости: при провале получает 4d8 урона электричеством/Силой и теряет реакцию до конца своего следующего хода.'
      },
      {
        id: 'sw_t_choke',
        name: 'Удушение Силы (Force Choke)',
        side: 'Тёмная сторона',
        rank: 'Адепт',
        cost: '2 Очка Силы',
        actionType: '1 действие',
        range: '12 м',
        duration: 'Концентрация, до 1 мин',
        tags: ['Сила', 'Тёмная сторона', 'Контроль'],
        desc: 'Вы сжимаете горло цели невидимой хваткой. Цель проходит спасбросок Телосложения: при провале она обездвижена, не может говорить и получает 2d6 силового урона в начале каждого хода.'
      },
      {
        id: 'sw_t_sense',
        name: 'Чувство Силы и Предвидение',
        side: 'Универсальная',
        rank: 'Базовая',
        cost: '1 Очко Силы',
        actionType: '1 реакция / Бонусное',
        range: 'На себя (18 м)',
        duration: '1 раунд',
        tags: ['Сила', 'Защита', 'Восприятие'],
        desc: 'Вы ощущаете возмущения в Силе за долю секунды до опасности. Даёт +2 к КБ до начала вашего следующего хода или преимущество на бросок Инициативы / Восприятия.'
      },
      {
        id: 'sw_t_jetpack',
        name: 'Рывок на реактивном ранце (Мандалорский взлёт)',
        side: 'Технология',
        rank: 'Тактическая',
        cost: '1 заряд топлива',
        actionType: '1 бонусное действие',
        range: 'На себя (до 12 м)',
        duration: '1 раунд',
        tags: ['Технология', 'Мандалорец', 'Мобильность'],
        desc: 'Вы активируете реактивный ранец, взмывая в воздух или совершая стремительный рывок на 12 м без провоцирования атак возможности.'
      }
    ];
  },

  defaultMoves: function() {
    return [
      {
        id: 'sw_m_form1',
        name: 'Форма I: Шии-Чо — «Путь Сарлакка»',
        category: 'Форма светового меча',
        actionType: 'Стойка (Бонусное действие)',
        cost: 'Без затрат',
        damage: '+1d4 к широким рубящим ударам',
        tags: ['Форма I', 'Шии-Чо', 'Толпа'],
        desc: 'Древнейшая базовая форма фехтования на световых мечах. Широкие размашистые удары эффективны против нескольких противников: когда вы попадаете по врагу, соседний противник в пределах 1.5 м получает урон, равный вашему модификатору характеристики.'
      },
      {
        id: 'sw_m_form2',
        name: 'Форма II: Макаши — «Путь Исаламири»',
        category: 'Форма светового меча',
        actionType: 'Стойка / Реакция',
        cost: '1 Очко Силы (при рипосте)',
        damage: '1d8 + фехтовальный рипост',
        tags: ['Форма II', 'Макаши', 'Дуэль'],
        desc: 'Элегантная аристократическая форма дуэльного боя один на один. Даёт +2 к броскам атаки против одиночной цели и позволяет реакцией совершить ответный выпад, когда враг промахивается по вам в ближнем бою.'
      },
      {
        id: 'sw_m_form3',
        name: 'Форма III: Соресу — «Путь Майнока»',
        category: 'Форма светового меча',
        actionType: 'Стойка / Реакция',
        cost: 'Без затрат',
        damage: 'Отражение выстрела (1d10)',
        tags: ['Форма III', 'Соресу', 'Оборона'],
        desc: 'Абсолютная оборонительная форма. Пока вы удерживаете стойку Соресу со световым мечом, вы получаете +2 к КБ, а реакцией можете отразить бластерный выстрел обратно в стрелка.'
      },
      {
        id: 'sw_m_form4',
        name: 'Форма IV: Атару — «Путь Ястреба-летучей мыши»',
        category: 'Форма светового меча',
        actionType: 'Атака + Акробатика',
        cost: '1 Очко Силы',
        damage: '+1d8 энергетического урона',
        tags: ['Форма IV', 'Атару', 'Акробатика'],
        desc: 'Стремительная акробатическая форма, использующая Силу для головокружительных прыжков и кульбитов. Ваша скорость увеличивается на 3 м, а атака с разбега или в прыжке наносит дополнительные +1d8 урона.'
      },
      {
        id: 'sw_m_form5',
        name: 'Форма V: Шиен / Джем Со — «Путь Крайт-дракона»',
        category: 'Форма светового меча',
        actionType: 'Контратака',
        cost: '1 Очко Силы',
        damage: '+2d6 при силовом проломе',
        tags: ['Форма V', 'Джем Со', 'Мощь'],
        desc: 'Превращает защиту в сокрушительное нападение. Мощные вертикальные удары пробивают блок противника (цель проходит спасбросок Силы или теряет +2 КБ до конца хода), а отражённые бластерные болты наносят повышенный урон.'
      },
      {
        id: 'sw_m_form7',
        name: 'Форма VII: Джуйо / Ваапад — «Путь Воракра»',
        category: 'Форма светового меча',
        actionType: 'Агрессивная стойка',
        cost: '2 Очка Силы',
        damage: '+2d8, крит при 19–20',
        tags: ['Форма VII', 'Ваапад', 'Ярость'],
        desc: 'Опаснейшая форма, балансирующая на грани Тёмной стороны. Ваши атаки световым мечом совершаются с яростным напором, критический диапазон расширяется до 19–20, а при попадании вы добавляете 2d8 урона.'
      },
      {
        id: 'sw_m_saber_throw',
        name: 'Бросок светового меча (Saber Throw)',
        category: 'Приём Силы и клинка',
        actionType: '1 действие',
        cost: '1 Очко Силы',
        damage: '2d8 энергетического урона',
        tags: ['Световой меч', 'Дистанция', 'Телекинез'],
        desc: 'Вы метаете включённый световой меч по бумеранговой траектории на дистанцию до 9 м, поражая до двух целей на линии, после чего клинок возвращается в вашу ладонь.'
      },
      {
        id: 'sw_m_blaster_barrage',
        name: 'Шквальный огонь из бластера / Прицельный выстрел',
        category: 'Стрелковый приём',
        actionType: '1 действие',
        cost: 'Перегрев / 1 заряд',
        damage: '2d8 плазменного урона',
        tags: ['Бластер', 'Дистанция', 'Стрелок'],
        desc: 'Серия точных бластерных выстрелов по уязвимым узлам брони противника или подавляющий огонь по сектору.'
      }
    ];
  },

  defaultSkills: function() {
    return [
      {
        id: 'sw_sk_saber',
        name: 'Владение световым мечом',
        category: 'Боевое искусство',
        rank: 'Эксперт',
        stat: 'Ловкость / Сила',
        bonus: '+5',
        desc: 'Техника фехтования плазменным клинком, парирования ударов и отражения бластерного огня.'
      },
      {
        id: 'sw_sk_force',
        name: 'Познание Силы (Светлая / Тёмная / Живая Сила)',
        category: 'Сила',
        rank: 'Эксперт',
        stat: 'Мудрость / Харизма',
        bonus: '+5',
        desc: 'Глубина связи с мидихлорианами, чтение потоков Силы, медитация, распознавание голокронов и древних реликвий.'
      },
      {
        id: 'sw_sk_pilot',
        name: 'Пилотирование и Астронавигация',
        category: 'Техника и Космос',
        rank: 'Обучен',
        stat: 'Ловкость / Интеллект',
        bonus: '+4',
        desc: 'Управление звёздными истребителями, лёгкими кореллианскими грузовиками, спидерами и расчёт прыжков в гиперпространство.'
      },
      {
        id: 'sw_sk_slice',
        name: 'Слайсинг и Механика дроидов',
        category: 'Техника и Космос',
        rank: 'Обучен',
        stat: 'Интеллект',
        bonus: '+3',
        desc: 'Взлом имперских и республиканских терминалов, обход магнитных замков, ремонт дроидов, оружия и корабельных систем.'
      },
      {
        id: 'sw_sk_underworld',
        name: 'Знание Внешнего Кольца и Контрабанды',
        category: 'Социальный навык',
        rank: 'Обучен',
        stat: 'Харизма / Мудрость',
        bonus: '+3',
        desc: 'Ориентирование в синдикатах Хаттов, Гильдии охотников за головами, чёрных рынках Нар-Шаддаа и нелегальных гипермаршрутах.'
      }
    ];
  },

  defaultProfile: function(customName) {
    return {
      id: 'sw_char_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: customName || '',
      race: '',
      path: '',
      title: '',
      level: 1,
      hp: 20,
      ac: 10,
      force: 0,
      speed: '9 м',
      weapon: '',
      armor: '',
      ship: '',
      notes: '',
      techs: [],
      moves: [],
      skills: []
    };
  },

  _normalizeProfile: function(p) {
    if (!p || typeof p !== 'object') p = SW.defaultProfile();
    if (!p.id) p.id = 'sw_char_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    if (p.name == null) p.name = '';
    if (p.race == null) p.race = '';
    if (p.path == null) p.path = '';
    if (p.title == null) p.title = '';
    if (p.level == null || isNaN(Number(p.level))) p.level = 1;
    // Важно: только статичный ХП (никаких maxHp / разделений хп/макс хп)
    if (p.hp == null || isNaN(Number(p.hp))) p.hp = 20;
    delete p.maxHp;
    delete p.credits;
    if (p.ac == null || isNaN(Number(p.ac))) p.ac = 10;
    if (p.force == null || isNaN(Number(p.force))) p.force = 0;
    if (!p.speed) p.speed = '9 м';
    if (p.weapon == null) p.weapon = '';
    if (p.armor == null) p.armor = '';
    if (p.ship == null) p.ship = '';
    if (p.notes == null) p.notes = '';
    if (!Array.isArray(p.techs)) p.techs = [];
    if (!Array.isArray(p.moves)) p.moves = [];
    if (!Array.isArray(p.skills)) p.skills = [];
    return p;
  },

  loadAll: function() {
    try {
      // Одноразовая очистка предзаполненного профиля «Реван / Странник Силы» из v134
      var rawProf = localStorage.getItem('ttc_sw_profiles');
      if (rawProf) {
        var parsed = JSON.parse(rawProf);
        if (Array.isArray(parsed) && parsed.length) {
          parsed = parsed.filter(function(p) {
            if (!p) return false;
            if (p.name === 'Реван / Странник Силы') return false;
            if (p.notes && p.notes.indexOf('Голокрон базовых форм фехтования') !== -1) return false;
            return true;
          });
          if (parsed.length) {
            SW.profiles = parsed.map(function(p) { return SW._normalizeProfile(p); });
          } else {
            SW.profiles = [];
          }
        }
      }
    } catch (e) {}
    if (!SW.profiles || !SW.profiles.length) {
      SW.profiles = [SW.defaultProfile()];
      try {
        localStorage.setItem('ttc_sw_profiles', JSON.stringify(SW.profiles));
        localStorage.setItem('ttc_sw_active_id', SW.profiles[0].id);
      } catch (e) {}
    }

    try {
      var actId = localStorage.getItem('ttc_sw_active_id');
      if (actId && SW.profiles.some(function(p) { return p.id === actId; })) {
        SW.activeProfileId = actId;
      } else {
        SW.activeProfileId = SW.profiles[0].id;
      }
    } catch (e) {
      SW.activeProfileId = SW.profiles[0].id;
    }

    try {
      var rawMeta = localStorage.getItem('ttc_sw_meta');
      if (rawMeta) {
        var m = JSON.parse(rawMeta);
        if (m && typeof m === 'object') SW.meta = Object.assign(SW.meta, m);
      }
    } catch (e) {}

    SW.syncActiveCollections();
  },

  syncActiveCollections: function() {
    var prof = SW.getActiveProfile();
    if (!prof) return;
    SW.techs = prof.techs;
    SW.moves = prof.moves;
    SW.skills = prof.skills;
  },

  getActiveProfile: function() {
    if (!SW.profiles || !SW.profiles.length) SW.loadAll();
    var found = SW.profiles.find(function(p) { return p.id === SW.activeProfileId; });
    if (!found) {
      found = SW.profiles[0];
      SW.activeProfileId = found.id;
    }
    return found;
  },

  saveProfiles: function() {
    try {
      localStorage.setItem('ttc_sw_profiles', JSON.stringify(SW.profiles));
      localStorage.setItem('ttc_sw_active_id', SW.activeProfileId);
    } catch (e) {}
    SW.syncActiveCollections();
  },

  saveTechs: function() {
    var prof = SW.getActiveProfile();
    if (prof) prof.techs = SW.techs;
    SW.saveProfiles();
  },

  saveMoves: function() {
    var prof = SW.getActiveProfile();
    if (prof) prof.moves = SW.moves;
    SW.saveProfiles();
  },

  saveSkills: function() {
    var prof = SW.getActiveProfile();
    if (prof) prof.skills = SW.skills;
    SW.saveProfiles();
  },

  saveMeta: function() {
    try {
      localStorage.setItem('ttc_sw_meta', JSON.stringify(SW.meta));
    } catch (e) {}
  }
};

window.SW = SW;
SW.loadAll();

/* ==========================================================================
   ВИЗУАЛЬНАЯ ТЕМА И АНИМИРОВАННЫЙ ФОН (#swThemeFx) — ДЖЕДАИ И СИТХИ
   ========================================================================== */
function ensureSwThemeFx(themeMode) {
  var mode = (themeMode || SW.getTheme()) === 'sith' ? 'sith' : 'jedi';
  var fx = document.getElementById('swThemeFx');
  if (!fx) {
    fx = document.createElement('div');
    fx.id = 'swThemeFx';
    document.body.appendChild(fx);
  }
  if (fx.getAttribute('data-sw-theme') === mode && fx.children.length > 0) {
    return fx;
  }
  fx.setAttribute('data-sw-theme', mode);

  // Звёздное поле (мерцающие звёзды)
  var starsHtml = '';
  for (var s = 0; s < 44; s++) {
    var sx = (Math.random() * 98 + 1).toFixed(1);
    var sy = (Math.random() * 96 + 2).toFixed(1);
    var sz = (Math.random() * 2.3 + 1).toFixed(1);
    var sdur = (2.5 + Math.random() * 4.5).toFixed(1);
    var sdel = (Math.random() * 5).toFixed(1);
    starsHtml += '<div class="sw-star" style="left:' + sx + '%;top:' + sy + '%;width:' + sz + 'px;height:' + sz + 'px;animation-duration:' + sdur + 's;animation-delay:-' + sdel + 's"></div>';
  }

  // Гиперпространственные росчерки
  var hyperHtml = '';
  var hyperCount = mode === 'sith' ? 8 : 6;
  for (var h = 0; h < hyperCount; h++) {
    var hleft = (8 + h * (84 / hyperCount) + Math.random() * 6).toFixed(1);
    var hlen = (60 + Math.random() * 75).toFixed(0);
    var hdur = (6.5 + Math.random() * 6.5).toFixed(1);
    var hdel = (Math.random() * 10).toFixed(1);
    hyperHtml += '<div class="sw-hyperline" style="left:' + hleft + '%;height:' + hlen + 'px;animation-duration:' + hdur + 's;animation-delay:-' + hdel + 's"></div>';
  }

  if (mode === 'sith') {
    // Искры кровоточащих Кайбер-кристаллов и пепла Коррибана
    var sithSparksHtml = '';
    var sithColors = [
      'rgba(239, 68, 68, 0.92)',
      'rgba(220, 38, 38, 0.88)',
      'rgba(249, 115, 22, 0.85)',
      'rgba(251, 113, 133, 0.85)',
      'rgba(185, 28, 28, 0.9)'
    ];
    for (var i = 0; i < 28; i++) {
      var left = (Math.random() * 96 + 2).toFixed(1);
      var dur = (7 + Math.random() * 10).toFixed(1);
      var delay = (Math.random() * 12).toFixed(1);
      var drift = ((Math.random() - 0.5) * 110).toFixed(0) + 'px';
      var size = (2.2 + Math.random() * 3.4).toFixed(1) + 'px';
      var col = sithColors[i % sithColors.length];
      sithSparksHtml += '<div class="sw-spark" style="left:' + left + '%;width:' + size + ';height:' + size + ';background:' + col + ';box-shadow:0 0 12px ' + col + ', 0 0 22px rgba(220,38,38,0.6);animation-duration:' + dur + 's;animation-delay:-' + delay + 's;--sw-drift:' + drift + '"></div>';
    }

    // Разряды Молнии Силы на фоне
    var lightningSvg =
      '<svg class="sw-sith-lightning" viewBox="0 0 1000 700" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
        '<polyline class="sw-lightning-arc arc-1" points="140,0 165,85 130,145 185,230 155,310 210,415"/>' +
        '<polyline class="sw-lightning-arc arc-1" points="165,85 215,130 240,195"/>' +
        '<polyline class="sw-lightning-arc arc-2" points="860,0 825,95 870,165 810,255 845,340 790,440"/>' +
        '<polyline class="sw-lightning-arc arc-2" points="825,95 775,150 750,210"/>' +
        '<polyline class="sw-lightning-arc arc-3" points="510,680 485,590 525,520 490,445"/>' +
      '</svg>';

    // Монументальная Эмблема Империи Ситхов, Пирамидального Голокрона Коррибана и Гардового Меча
    fx.innerHTML =
      '<div class="sw-nebula-layer"></div>' +
      '<div class="sw-sith-horizon"></div>' +
      starsHtml +
      hyperHtml +
      lightningSvg +
      '<svg class="sw-bg-emblem" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<!-- Внешние рунические кольца Коррибана -->' +
        '<circle cx="160" cy="160" r="148" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="10 6 2 6" opacity="0.65"/>' +
        '<circle cx="160" cy="160" r="134" stroke="#f97316" stroke-width="1" stroke-dasharray="4 8" opacity="0.42"/>' +
        '<circle cx="160" cy="160" r="112" stroke="#ef4444" stroke-width="1.4" opacity="0.5"/>' +
        '<!-- Внешний гексагон Империи Ситхов -->' +
        '<polygon points="160,16 285,88 285,232 160,304 35,232 35,88" stroke="#ef4444" stroke-width="1.5" opacity="0.48"/>' +
        '<!-- Пирамидальный Голокрон Ситхов (внешний и перевёрнутый внутренний треугольник) -->' +
        '<polygon points="160,24 286,238 34,238" stroke="#ef4444" stroke-width="1.8" fill="rgba(153,27,27,0.08)" opacity="0.72"/>' +
        '<polygon points="160,292 272,96 48,96" stroke="#f97316" stroke-width="1.1" stroke-dasharray="6 4" opacity="0.45"/>' +
        '<!-- 6 лучей-клинков Империи Ситхов -->' +
        '<path d="M160 24 L170 120 L160 138 L150 120 Z" fill="#ef4444" opacity="0.6"/>' +
        '<path d="M160 296 L170 200 L160 182 L150 200 Z" fill="#ef4444" opacity="0.5"/>' +
        '<path d="M42 92 L128 134 L142 150 L118 150 Z" fill="#dc2626" opacity="0.5"/>' +
        '<path d="M278 92 L192 134 L178 150 L202 150 Z" fill="#dc2626" opacity="0.5"/>' +
        '<path d="M42 228 L118 170 L142 170 L128 186 Z" fill="#dc2626" opacity="0.5"/>' +
        '<path d="M278 228 L202 170 L178 170 L192 186 Z" fill="#dc2626" opacity="0.5"/>' +
        '<!-- Багровый Световой Меч с плазменной гардой-перекрестием -->' +
        '<line x1="160" y1="18" x2="160" y2="278" stroke="#ef4444" stroke-width="5" opacity="0.45"/>' +
        '<line x1="160" y1="22" x2="160" y2="274" stroke="#ffe4e6" stroke-width="2" opacity="0.9"/>' +
        '<!-- Боковые плазменные квилоны гарды -->' +
        '<line x1="112" y1="218" x2="208" y2="218" stroke="#ef4444" stroke-width="4" opacity="0.65"/>' +
        '<line x1="116" y1="218" x2="204" y2="218" stroke="#ffe4e6" stroke-width="1.6" opacity="0.9"/>' +
        '<!-- Кровоточащее сердце Кайбер-кристалла в центре Голокрона -->' +
        '<polygon points="160,112 172,148 208,160 172,172 160,208 148,172 112,160 148,148" fill="#ef4444" opacity="0.75"/>' +
        '<circle cx="160" cy="160" r="16" stroke="#fde047" stroke-width="1.4" opacity="0.7"/>' +
        '<circle cx="160" cy="160" r="8" fill="#ffe4e6" opacity="0.95"/>' +
      '</svg>' +
      sithSparksHtml;
  } else {
    // Искры Кайбер-кристаллов (Храм Джедаев — лазурные и золотые)
    var sparksHtml = '';
    var colors = [
      'rgba(56, 189, 248, 0.85)',
      'rgba(125, 211, 252, 0.8)',
      'rgba(245, 158, 11, 0.75)',
      'rgba(239, 68, 68, 0.7)'
    ];
    for (var j = 0; j < 20; j++) {
      var jleft = (Math.random() * 96 + 2).toFixed(1);
      var jdur = (8 + Math.random() * 11).toFixed(1);
      var jdelay = (Math.random() * 12).toFixed(1);
      var jdrift = ((Math.random() - 0.5) * 90).toFixed(0) + 'px';
      var jsize = (2 + Math.random() * 3).toFixed(1) + 'px';
      var jcol = colors[j % colors.length];
      sparksHtml += '<div class="sw-spark" style="left:' + jleft + '%;width:' + jsize + ';height:' + jsize + ';background:' + jcol + ';box-shadow:0 0 10px ' + jcol + ';animation-duration:' + jdur + 's;animation-delay:-' + jdelay + 's;--sw-drift:' + jdrift + '"></div>';
    }

    fx.innerHTML =
      '<div class="sw-nebula-layer"></div>' +
      starsHtml +
      hyperHtml +
      '<svg class="sw-bg-emblem" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<!-- Внешние кольца Голокрона и Галактического Астрографа -->' +
        '<circle cx="150" cy="150" r="138" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="6 6" opacity="0.55"/>' +
        '<circle cx="150" cy="150" r="120" stroke="#f59e0b" stroke-width="1" opacity="0.38"/>' +
        '<circle cx="150" cy="150" r="96" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="14 8" opacity="0.45"/>' +
        '<!-- Геометрия Голокрона (октагон + ромб) -->' +
        '<polygon points="150,18 282,150 150,282 18,150" stroke="#38bdf8" stroke-width="1.2" opacity="0.32"/>' +
        '<rect x="55" y="55" width="190" height="190" stroke="#f59e0b" stroke-width="0.9" opacity="0.24"/>' +
        '<!-- Крылья Ордена Джедаев и центральный луч Светового Меча -->' +
        '<path d="M150 32 L156 122 L150 135 L144 122 Z" fill="#7dd3fc" opacity="0.75"/>' +
        '<path d="M150 28 L150 250" stroke="#38bdf8" stroke-width="2.2" opacity="0.65"/>' +
        '<!-- Левое и правое крыло эмблемы Ордена -->' +
        '<path d="M135 190 C92 178, 66 136, 76 82 C88 122, 112 148, 138 160 C105 138, 92 104, 102 64 C112 104, 128 130, 142 144 Z" fill="#38bdf8" opacity="0.45"/>' +
        '<path d="M165 190 C208 178, 234 136, 224 82 C212 122, 188 148, 162 160 C195 138, 208 104, 198 64 C188 104, 172 130, 158 144 Z" fill="#38bdf8" opacity="0.45"/>' +
        '<!-- Звезда Кайбер-сердца в центре -->' +
        '<polygon points="150,115 158,142 185,150 158,158 150,185 142,158 115,150 142,142" fill="#f59e0b" opacity="0.55"/>' +
        '<circle cx="150" cy="150" r="8" fill="#e0f2fe" opacity="0.85"/>' +
      '</svg>' +
      sparksHtml;
  }

  return fx;
}

function applyStarWarsTheme() {
  var isSw = (typeof HB !== 'undefined' && HB.mode === 'sw');
  var mode = SW.getTheme();
  document.body.classList.toggle('sw-theme', isSw);
  document.body.classList.toggle('sw-theme-sith', isSw && mode === 'sith');
  document.body.classList.toggle('sw-theme-jedi', isSw && mode !== 'sith');
  var fx = ensureSwThemeFx(mode);
  if (fx) fx.style.display = isSw ? 'block' : 'none';
}
window.applyStarWarsTheme = applyStarWarsTheme;

function swSideBadgeClass(side) {
  var s = String(side || '').toLowerCase();
  if (s.indexOf('свет') !== -1) return 'sw-side-light';
  if (s.indexOf('тём') !== -1 || s.indexOf('темн') !== -1) return 'sw-side-dark';
  if (s.indexOf('техн') !== -1) return 'sw-side-tech';
  return 'sw-side-uni';
}

/* ==========================================================================
   ОБЩИЙ ПЕРЕКЛЮЧАТЕЛЬ ВКЛАДОК: СПОСОБНОСТИ / ПРИЁМЫ / НАВЫКИ
   ========================================================================== */
function renderSwAbilitiesTabBar(activeTab) {
  return '<div class="sw-nav-tabs">' +
    '<button class="sw-nav-tab ' + (activeTab === 'techs' ? 'active' : '') + '" data-sw-tab-nav="swTechs">✨ Способности</button>' +
    '<button class="sw-nav-tab ' + (activeTab === 'moves' ? 'active' : '') + '" data-sw-tab-nav="swMoves">⚔️ Приёмы</button>' +
    '<button class="sw-nav-tab ' + (activeTab === 'skills' ? 'active' : '') + '" data-sw-tab-nav="swSkills">🎯 Навыки</button>' +
  '</div>';
}

function wireSwAbilitiesTabBar() {
  document.querySelectorAll('[data-sw-tab-nav]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      go({ screen: btn.getAttribute('data-sw-tab-nav') });
    });
  });
}

/* ==========================================================================
   1. ГЛАВНЫЙ ЭКРАН ПРОФИЛЯ (swHome) — БЕЗ ВЕРХНЕЙ НАДПИСИ-КРАМБА
   ========================================================================== */
function swHome() {
  applyStarWarsTheme();
  var prof = SW.getActiveProfile();
  _swCrumbHtml = '';

  var charDisplayName = prof.name ? esc(prof.name) : 'Новый персонаж';
  var charDisplayTitle = prof.title
    ? esc(prof.title)
    : (prof.race ? 'Раса: ' + esc(prof.race) : 'Странник Галактики');
  var roleBadgeHtml = prof.path
    ? '<span class="sw-role-badge">⚔️ ' + esc(prof.path) + '</span>'
    : '<span class="sw-role-badge" style="background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.15);color:#cbd5e1;">👤 Без ордена</span>';

  var html =
    '<div class="sw-hud">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap">' +
        '<div>' +
          '<div class="sw-title">⚔️ ' + charDisplayName + '</div>' +
          '<div class="sw-subtitle" style="margin-top:2px">' +
            charDisplayTitle +
            (prof.ship ? ' &bull; 🚀 ' + esc(prof.ship) : '') +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
          roleBadgeHtml +
          '<span class="sw-stat-badge" title="Уровень">Ур. ' + esc(prof.level) + '</span>' +
          '<span class="sw-stat-badge hp" title="Здоровье (статичное)">❤️ ХП ' + esc(prof.hp) + '</span>' +
          '<span class="sw-stat-badge ac" title="Класс Брони">🛡️ КБ ' + esc(prof.ac) + '</span>' +
          '<span class="sw-stat-badge force" title="Очки Силы / Энергия">✨ Сила ' + esc(prof.force) + '</span>' +
        '</div>' +
      '</div>' +
      (prof.weapon || prof.armor
        ? '<div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--sw-border-subtle);display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--sw-accent-pale)">' +
            (prof.weapon ? '<span>⚡ <b>Оружие:</b> ' + esc(prof.weapon) + '</span>' : '') +
            (prof.armor ? '<span>🥋 <b>Броня:</b> ' + esc(prof.armor) + '</span>' : '') +
          '</div>'
        : '') +
    '</div>' +

    '<div class="sw-rule"></div>' +

    /* Кнопка броска костей (как в Ведьмаке и Волшебнике) */
    '<div class="sw-hero-dice" data-go="dice" role="button" tabindex="0" title="Открыть бросок костей">' +
      '<div class="sw-hero-dice-icon">' +
        (typeof dieShapeSvg === 'function' ? dieShapeSvg(20, 'swHeroDie', 20) : '🎲') +
      '</div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="sw-hero-dice-title">Бросок костей</div>' +
        '<div class="sw-hero-dice-desc">Кубики d4–d100, проверки Силы, атаки световым мечом, пилотирование и спасброски</div>' +
      '</div>' +
      '<div class="sw-hero-dice-arrow">→</div>' +
    '</div>' +

    '<div class="section-label">СИСТЕМНЫЕ РАЗДЕЛЫ // ЗВЕЗДНЫЕ ВОЙНЫ</div>' +

    /* Меню кнопок раздела Звездные войны */
    '<div class="menu-list grid-2">' +
      '<div class="sw-card sw-card-clickable" data-sw-nav="swTechs" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="sw-card-title"><span>✨</span> Способности</div>' +
          '<div class="sw-card-desc">Светлая и Тёмная сторона Силы, телекинез, предвидение и гаджеты</div>' +
        '</div>' +
        '<div class="sw-card-arrow">›</div>' +
      '</div>' +

      '<div class="sw-card sw-card-clickable" data-sw-nav="swMoves" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="sw-card-title"><span>⚔️</span> Приёмы</div>' +
          '<div class="sw-card-desc">7 Форм боя на световых мечах (I–VII), дуэльные выпады и бластерные залпы</div>' +
        '</div>' +
        '<div class="sw-card-arrow">›</div>' +
      '</div>' +

      '<div class="sw-card sw-card-clickable" data-sw-nav="swSkills" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="sw-card-title"><span>🎯</span> Навыки</div>' +
          '<div class="sw-card-desc">Фехтование, познание Силы, пилотирование, слайсинг и выживание</div>' +
        '</div>' +
        '<div class="sw-card-arrow">›</div>' +
      '</div>' +

      '<div class="sw-card sw-card-clickable" data-sw-nav="swMap" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="sw-card-title"><span>🌌</span> Карта Галактики</div>' +
          '<div class="sw-card-desc">Оцифрованный Атлас 4000×4000: 200 детальных миров, архив 6 755 систем из PDF по сетке и навигатор гиперпрыжков</div>' +
        '</div>' +
        '<div class="sw-card-arrow">›</div>' +
      '</div>' +

      '<div class="sw-card sw-card-clickable" data-sw-nav="swRef" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="sw-card-title"><span>🔷</span> Справочник</div>' +
          '<div class="sw-card-desc">Архивы Голокрона: Ордена, 7 Форм фехтования, кайбер-кристаллы, расы и фракции</div>' +
        '</div>' +
        '<div class="sw-card-arrow">›</div>' +
      '</div>' +

      '<div class="sw-card sw-card-clickable" data-sw-nav="swData" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="sw-card-title"><span>💾</span> Данные</div>' +
          '<div class="sw-card-desc">Профиль персонажа, выбор из ростера (' + SW.profiles.length + '), статичные параметры и экспорт</div>' +
        '</div>' +
        '<div class="sw-card-arrow">›</div>' +
      '</div>' +
    '</div>';

  mount(html);

  document.querySelectorAll('[data-sw-nav]').forEach(function(el) {
    el.addEventListener('click', function() {
      go({ screen: el.getAttribute('data-sw-nav') });
    });
  });
  var diceCard = document.querySelector('[data-go="dice"]');
  if (diceCard) {
    diceCard.addEventListener('click', function() {
      go({ screen: 'dice' });
    });
  }
}

/* ==========================================================================
   2. СПОСОБНОСТИ (swTechs, swTechView, swTechEdit)
   ========================================================================== */
var swTechFilter = 'all';
var swTechQuery = '';

function swTechs() {
  applyStarWarsTheme();
  SW.syncActiveCollections();
  var prof = SW.getActiveProfile();
  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Способности' }
  ]);

  var sides = ['all', 'Светлая сторона', 'Тёмная сторона', 'Универсальная', 'Технология'];
  var filterPills = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:12px 0;">' +
    sides.map(function(s) {
      var lbl = s === 'all' ? 'Все (' + SW.techs.length + ')' : s;
      return '<button class="sw-pill ' + (swTechFilter === s ? 'active' : '') + '" data-sw-side="' + esc(s) + '">' + esc(lbl) + '</button>';
    }).join('') +
  '</div>';

  var list = SW.techs.filter(function(t) {
    if (swTechFilter !== 'all' && t.side !== swTechFilter) return false;
    if (swTechQuery) {
      var q = swTechQuery.toLowerCase();
      var hay = ((t.name || '') + ' ' + (t.side || '') + ' ' + (t.desc || '') + ' ' + (t.tags || []).join(' ')).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });

  var cardsHtml = list.length ? list.map(function(t) {
    return '<div class="sw-ref-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">' +
      '<div>' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;">' +
          '<div class="sw-ref-card-k" style="margin-bottom:0;">✨ ' + esc(t.name) + '</div>' +
          '<span class="sw-side-badge ' + swSideBadgeClass(t.side) + '">' + esc(t.side || 'Универсальная') + '</span>' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:11.5px;color:var(--sw-muted);margin-bottom:6px;">' +
          (t.cost ? '<span style="background:rgba(245,158,11,0.14);padding:2px 6px;border-radius:3px;color:#fde047;">⚡ ' + esc(t.cost) + '</span>' : '') +
          (t.actionType ? '<span style="background:var(--sw-accent-soft);padding:2px 6px;border-radius:3px;color:var(--sw-accent-bright);">⏱ ' + esc(t.actionType) + '</span>' : '') +
          (t.range ? '<span style="background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:3px;">📏 ' + esc(t.range) + '</span>' : '') +
          (t.rank ? '<span style="background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:3px;">📜 ' + esc(t.rank) + '</span>' : '') +
        '</div>' +
        '<div class="sw-ref-card-v" style="font-size:12.5px;line-height:1.45;">' + esc(t.desc || '') + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:6px;padding-top:6px;border-top:1px solid var(--sw-border-subtle);">' +
        '<button class="btn btn-ghost" data-sw-tech-view="' + esc(t.id) + '" style="font-size:11px;padding:3px 8px;">Подробнее</button>' +
        '<button class="btn btn-ghost" data-sw-tech-edit="' + esc(t.id) + '" style="font-size:11px;padding:3px 8px;">✏️</button>' +
      '</div>' +
    '</div>';
  }).join('') : (
    '<div class="char-empty" style="grid-column:1/-1;text-align:center;padding:44px 16px;border:1px dashed var(--sw-border);border-radius:12px;background:var(--sw-empty-bg);">' +
      '<div style="font-size:40px;margin-bottom:8px;">✨ 🔷</div>' +
      '<div style="font-family:Cinzel,serif;font-size:17px;color:var(--sw-accent-bright);margin-bottom:6px;">Архив способностей персонажа пуст</div>' +
      '<div style="color:var(--sw-muted);font-size:13px;max-width:460px;margin:0 auto 16px;">Создайте способность Силы или тактический гаджет вручную, либо загрузите классический набор из Голокрона.</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
        '<button class="btn btn-primary" id="swAddTechEmptyBtn">➕ Создать способность</button>' +
        '<button class="btn btn-ghost" id="swAiTechEmptyBtn" style="color:var(--sw-accent-bright);border-color:var(--sw-border);">✨ AI Генератор способностей</button>' +
        (SW.techs.length === 0 ? '<button class="btn btn-ghost" id="swLoadDefaultTechsBtn">📚 Загрузить базовые из Голокрона</button>' : '') +
      '</div>' +
    '</div>'
  );

  var html =
    '<button class="back" id="swTechBackHome">← Назад</button>' +
    renderSwAbilitiesTabBar('techs') +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
      '<div>' +
        '<h1 style="margin-bottom:4px;">✨ Способности Силы и Технологии</h1>' +
        '<div class="desc" style="margin-bottom:0;">Светлая и Тёмная сторона Силы, телекинез, предвидение и мандалорские гаджеты профиля «' + esc(prof.name || 'Новый персонаж') + '».</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button class="btn btn-primary" id="swAddTechBtn">➕ Новая способность</button>' +
        '<button class="btn btn-ghost" id="swAiTechBtn" style="color:var(--sw-accent-bright);border-color:var(--sw-border);">✨ AI Генератор способностей</button>' +
      '</div>' +
    '</div>' +
    '<div class="sw-ref-search-wrap" style="margin-top:10px;">' +
      '<span class="sw-ref-search-icon">🔍</span>' +
      '<input type="text" id="swTechSearch" class="sw-ref-search-input" placeholder="Поиск способности по названию, стороне Силы или эффекту..." value="' + esc(swTechQuery) + '">' +
    '</div>' +
    filterPills +
    '<div class="sw-ref-cards-grid" style="margin-top:14px;">' +
      cardsHtml +
    '</div>';

  mount(html);
  wireSwAbilitiesTabBar();

  document.getElementById('swTechBackHome').addEventListener('click', function() {
    go({ screen: 'swHome' });
  });
  document.querySelectorAll('[data-sw-side]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      swTechFilter = btn.getAttribute('data-sw-side');
      swTechs();
    });
  });
  var sInp = document.getElementById('swTechSearch');
  if (sInp) {
    sInp.addEventListener('input', function() {
      swTechQuery = sInp.value;
      swTechs();
    });
  }
  var addBtn = document.getElementById('swAddTechBtn');
  if (addBtn) {
    addBtn.addEventListener('click', function() {
      go({ screen: 'swTechEdit', id: null });
    });
  }
  var addEmptyBtn = document.getElementById('swAddTechEmptyBtn');
  if (addEmptyBtn) {
    addEmptyBtn.addEventListener('click', function() {
      go({ screen: 'swTechEdit', id: null });
    });
  }
  var aiBtn = document.getElementById('swAiTechBtn');
  if (aiBtn) {
    aiBtn.addEventListener('click', function() {
      go({ screen: 'swTechGen' });
    });
  }
  var aiEmptyBtn = document.getElementById('swAiTechEmptyBtn');
  if (aiEmptyBtn) {
    aiEmptyBtn.addEventListener('click', function() {
      go({ screen: 'swTechGen' });
    });
  }
  var loadDefBtn = document.getElementById('swLoadDefaultTechsBtn');
  if (loadDefBtn) {
    loadDefBtn.addEventListener('click', function() {
      SW.techs = SW.defaultTechs();
      SW.saveTechs();
      swTechs();
    });
  }
  document.querySelectorAll('[data-sw-tech-view]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      go({ screen: 'swTechView', id: btn.getAttribute('data-sw-tech-view') });
    });
  });
  document.querySelectorAll('[data-sw-tech-edit]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      go({ screen: 'swTechEdit', id: btn.getAttribute('data-sw-tech-edit') });
    });
  });
}

function swTechView(id) {
  applyStarWarsTheme();
  var t = SW.techs.find(function(x) { return x.id === id; });
  if (!t) { swTechs(); return; }

  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Способности', nav: 'swTechs' },
    { label: t.name }
  ]);

  var html =
    '<button class="back" id="swBackTechBtn">← К способностям</button>' +
    '<div class="sw-char-sheet-card" style="margin-top:12px;">' +
      '<div class="sw-char-header">' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
          '<span style="font-size:22px;">✨</span>' +
          '<span style="font-size:20px;color:var(--sw-accent-pale);">' + esc(t.name) + '</span>' +
          '<span class="sw-side-badge ' + swSideBadgeClass(t.side) + '">' + esc(t.side || 'Универсальная') + '</span>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button class="btn btn-primary" id="swEditTechBtn">✏️ Изменить</button>' +
          '<button class="btn btn-ghost" id="swDelTechBtn" style="color:#fca5a5;border-color:rgba(239,68,68,0.4);">🗑️ Удалить</button>' +
        '</div>' +
      '</div>' +
      '<div class="sw-stat-box-grid" style="margin-top:14px;margin-bottom:14px;">' +
        '<div><div class="sw-field-lbl">Ранг</div><div style="font-weight:700">' + esc(t.rank || 'Базовая') + '</div></div>' +
        '<div><div class="sw-field-lbl">Затраты</div><div style="font-weight:700;color:#fcd34d">' + esc(t.cost || '1 Очко Силы') + '</div></div>' +
        '<div><div class="sw-field-lbl">Время применения</div><div style="font-weight:700">' + esc(t.actionType || '1 действие') + '</div></div>' +
        '<div><div class="sw-field-lbl">Дистанция</div><div style="font-weight:700">' + esc(t.range || '9 м') + '</div></div>' +
      '</div>' +
      '<div style="font-size:14px;line-height:1.65;color:#e2edf8;background:var(--sw-panel-bg);padding:14px;border-radius:8px;border:1px solid var(--sw-border-subtle);white-space:pre-wrap;">' + esc(t.desc) + '</div>' +
    '</div>';

  mount(html);

  document.getElementById('swEditTechBtn').addEventListener('click', function() {
    go({ screen: 'swTechEdit', id: t.id });
  });
  document.getElementById('swBackTechBtn').addEventListener('click', function() {
    go({ screen: 'swTechs' });
  });
  document.getElementById('swDelTechBtn').addEventListener('click', function() {
    if (!confirm('Удалить способность «' + t.name + '»?')) return;
    SW.techs = SW.techs.filter(function(x) { return x.id !== t.id; });
    SW.saveTechs();
    go({ screen: 'swTechs' });
  });
}

function swTechEdit(id) {
  applyStarWarsTheme();
  var existing = id ? SW.techs.find(function(x) { return x.id === id; }) : null;
  var t = existing ? JSON.parse(JSON.stringify(existing)) : {
    id: 'sw_t_' + Date.now(),
    name: '',
    side: 'Универсальная',
    rank: 'Базовая',
    cost: '1 Очко Силы',
    actionType: '1 действие',
    range: '9 м',
    duration: 'Мгновенно',
    tags: [],
    desc: ''
  };

  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Способности', nav: 'swTechs' },
    { label: existing ? 'Редактирование' : 'Новая способность' }
  ]);

  var html =
    '<button class="back" id="swTeBackBtn">← К способностям</button>' +
    '<div class="sw-char-sheet-card" style="margin-top:12px;">' +
      '<div class="sw-char-header">' +
        '<span>' + (existing ? '✏️ Редактирование: ' + esc(t.name) : '✨ Создание новой способности') + '</span>' +
      '</div>' +
      '<div class="sw-edit-grid">' +
        '<div class="sw-edit-item sw-field-full"><label>Название способности</label><input type="text" id="swTeName" class="sw-input" value="' + esc(t.name) + '" placeholder="Напр.: Толчок Силы / Молния Силы / Стазис"></div>' +
        '<div class="sw-edit-item"><label>Категория / Сторона</label>' +
          '<select id="swTeSide" class="sw-input">' +
            ['Светлая сторона', 'Тёмная сторона', 'Универсальная', 'Технология'].map(function(s) {
              return '<option value="' + esc(s) + '" ' + (t.side === s ? 'selected' : '') + '>' + esc(s) + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div class="sw-edit-item"><label>Ранг</label><input type="text" id="swTeRank" class="sw-input" value="' + esc(t.rank || '') + '" placeholder="Базовая / Адепт / Мастер"></div>' +
        '<div class="sw-edit-item"><label>Стоимость</label><input type="text" id="swTeCost" class="sw-input" value="' + esc(t.cost || '') + '" placeholder="1 Очко Силы"></div>' +
        '<div class="sw-edit-item"><label>Время применения</label><input type="text" id="swTeAct" class="sw-input" value="' + esc(t.actionType || '') + '" placeholder="1 действие / Бонусное / Реакция"></div>' +
        '<div class="sw-edit-item sw-field-full"><label>Дистанция</label><input type="text" id="swTeRange" class="sw-input" value="' + esc(t.range || '') + '" placeholder="9 м / На себя / Касание"></div>' +
        '<div class="sw-edit-item sw-field-full"><label>Описание и игровой эффект</label><textarea id="swTeDesc" class="sw-input" rows="4" placeholder="Опишите механику, спасброски и урон...">' + esc(t.desc || '') + '</textarea></div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">' +
        '<button class="btn btn-ghost" id="swTeCancelBtn">Отмена</button>' +
        '<button class="btn btn-primary" id="swTeSaveBtn">💾 Сохранить способность</button>' +
      '</div>' +
    '</div>';

  mount(html);

  document.getElementById('swTeBackBtn').addEventListener('click', function() {
    go({ screen: 'swTechs' });
  });
  document.getElementById('swTeSaveBtn').addEventListener('click', function() {
    var name = (document.getElementById('swTeName').value || '').trim();
    if (!name) { alert('Введите название способности'); return; }
    t.name = name;
    t.side = document.getElementById('swTeSide').value;
    t.rank = document.getElementById('swTeRank').value.trim();
    t.cost = document.getElementById('swTeCost').value.trim();
    t.actionType = document.getElementById('swTeAct').value.trim();
    t.range = document.getElementById('swTeRange').value.trim();
    t.desc = document.getElementById('swTeDesc').value.trim();
    if (existing) {
      var idx = SW.techs.findIndex(function(x) { return x.id === t.id; });
      if (idx !== -1) SW.techs[idx] = t;
    } else {
      SW.techs.unshift(t);
    }
    SW.saveTechs();
    go({ screen: 'swTechView', id: t.id });
  });
  document.getElementById('swTeCancelBtn').addEventListener('click', function() {
    go({ screen: 'swTechs' });
  });
}

/* ==========================================================================
   3. ПРИЁМЫ (swMoves, swMoveView, swMoveEdit)
   ========================================================================== */
var swMoveFilter = 'all';
var swMoveQuery = '';

function swMoves() {
  applyStarWarsTheme();
  SW.syncActiveCollections();
  var prof = SW.getActiveProfile();
  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Приёмы' }
  ]);

  var cats = ['all', 'Форма светового меча', 'Приём Силы и клинка', 'Стрелковый приём', 'Тактический приём'];
  var filterPills = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:12px 0;">' +
    cats.map(function(c) {
      var lbl = c === 'all' ? 'Все (' + SW.moves.length + ')' : c;
      return '<button class="sw-pill ' + (swMoveFilter === c ? 'active' : '') + '" data-sw-mcat="' + esc(c) + '">' + esc(lbl) + '</button>';
    }).join('') +
  '</div>';

  var list = SW.moves.filter(function(m) {
    if (swMoveFilter !== 'all' && m.category !== swMoveFilter) return false;
    if (swMoveQuery) {
      var q = swMoveQuery.toLowerCase();
      var hay = ((m.name || '') + ' ' + (m.category || '') + ' ' + (m.desc || '') + ' ' + (m.damage || '')).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });

  var cardsHtml = list.length ? list.map(function(m) {
    return '<div class="sw-ref-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">' +
      '<div>' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;">' +
          '<div class="sw-ref-card-k" style="margin-bottom:0;">⚔️ ' + esc(m.name) + '</div>' +
          '<span class="sw-side-badge sw-side-uni">' + esc(m.category || 'Форма светового меча') + '</span>' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:11.5px;color:var(--sw-muted);margin-bottom:6px;">' +
          (m.actionType ? '<span style="background:var(--sw-accent-soft);padding:2px 6px;border-radius:3px;color:var(--sw-accent-bright);">⏱ ' + esc(m.actionType) + '</span>' : '') +
          (m.cost ? '<span style="background:rgba(245,158,11,0.14);padding:2px 6px;border-radius:3px;color:#fde047;">⚡ ' + esc(m.cost) + '</span>' : '') +
          (m.damage ? '<span style="background:rgba(239,68,68,0.15);padding:2px 6px;border-radius:3px;color:#fca5a5;">💥 ' + esc(m.damage) + '</span>' : '') +
        '</div>' +
        '<div class="sw-ref-card-v" style="font-size:12.5px;line-height:1.45;">' + esc(m.desc || '') + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:6px;padding-top:6px;border-top:1px solid var(--sw-border-subtle);">' +
        '<button class="btn btn-ghost" data-sw-move-view="' + esc(m.id) + '" style="font-size:11px;padding:3px 8px;">Подробнее</button>' +
        '<button class="btn btn-ghost" data-sw-move-edit="' + esc(m.id) + '" style="font-size:11px;padding:3px 8px;">✏️</button>' +
      '</div>' +
    '</div>';
  }).join('') : (
    '<div class="char-empty" style="grid-column:1/-1;text-align:center;padding:44px 16px;border:1px dashed var(--sw-border);border-radius:12px;background:var(--sw-empty-bg);">' +
      '<div style="font-size:40px;margin-bottom:8px;">⚔️ 🔷</div>' +
      '<div style="font-family:Cinzel,serif;font-size:17px;color:var(--sw-accent-bright);margin-bottom:6px;">Список боевых приёмов пуст</div>' +
      '<div style="color:var(--sw-muted);font-size:13px;max-width:460px;margin:0 auto 16px;">Добавьте форму фехтования на световых мечах или стрелковый приём вручную, либо воспользуйтесь AI Генератором или базовым набором Голокрона.</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
        '<button class="btn btn-primary" id="swAddMoveEmptyBtn">➕ Создать приём</button>' +
        '<button class="btn btn-ghost" id="swAiMoveEmptyBtn" style="color:var(--sw-accent-bright);border-color:var(--sw-border);">⚔️ AI Генератор приёмов</button>' +
        (SW.moves.length === 0 ? '<button class="btn btn-ghost" id="swLoadDefaultMovesBtn">📚 Загрузить 7 Форм фехтования</button>' : '') +
      '</div>' +
    '</div>'
  );

  var html =
    '<button class="back" id="swMoveBackHome">← Назад</button>' +
    renderSwAbilitiesTabBar('moves') +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
      '<div>' +
        '<h1 style="margin-bottom:4px;">⚔️ Боевые Приёмы и Формы Светового Меча</h1>' +
        '<div class="desc" style="margin-bottom:0;">Стойки фехтования (Формы I–VII), дуэльные рипосты, броски меча и тактические манёвры профиля «' + esc(prof.name || 'Новый персонаж') + '».</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button class="btn btn-primary" id="swAddMoveBtn">➕ Новый приём</button>' +
        '<button class="btn btn-ghost" id="swAiMoveBtn" style="color:var(--sw-accent-bright);border-color:var(--sw-border);">⚔️ AI Генератор приёмов</button>' +
      '</div>' +
    '</div>' +
    '<div class="sw-ref-search-wrap" style="margin-top:10px;">' +
      '<span class="sw-ref-search-icon">🔍</span>' +
      '<input type="text" id="swMoveSearch" class="sw-ref-search-input" placeholder="Поиск боевого приёма или Формы фехтования..." value="' + esc(swMoveQuery) + '">' +
    '</div>' +
    filterPills +
    '<div class="sw-ref-cards-grid" style="margin-top:14px;">' +
      cardsHtml +
    '</div>';

  mount(html);
  wireSwAbilitiesTabBar();

  document.getElementById('swMoveBackHome').addEventListener('click', function() {
    go({ screen: 'swHome' });
  });
  document.querySelectorAll('[data-sw-mcat]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      swMoveFilter = btn.getAttribute('data-sw-mcat');
      swMoves();
    });
  });
  var sInp = document.getElementById('swMoveSearch');
  if (sInp) {
    sInp.addEventListener('input', function() {
      swMoveQuery = sInp.value;
      swMoves();
    });
  }
  document.getElementById('swAddMoveBtn').addEventListener('click', function() {
    go({ screen: 'swMoveEdit', id: null });
  });
  var addEmptyBtn = document.getElementById('swAddMoveEmptyBtn');
  if (addEmptyBtn) {
    addEmptyBtn.addEventListener('click', function() {
      go({ screen: 'swMoveEdit', id: null });
    });
  }
  var aiBtn = document.getElementById('swAiMoveBtn');
  if (aiBtn) {
    aiBtn.addEventListener('click', function() {
      go({ screen: 'swMoveGen' });
    });
  }
  var aiEmptyBtn = document.getElementById('swAiMoveEmptyBtn');
  if (aiEmptyBtn) {
    aiEmptyBtn.addEventListener('click', function() {
      go({ screen: 'swMoveGen' });
    });
  }
  var loadDefBtn = document.getElementById('swLoadDefaultMovesBtn');
  if (loadDefBtn) {
    loadDefBtn.addEventListener('click', function() {
      SW.moves = SW.defaultMoves();
      SW.saveMoves();
      swMoves();
    });
  }
  document.querySelectorAll('[data-sw-move-view]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      go({ screen: 'swMoveView', id: btn.getAttribute('data-sw-move-view') });
    });
  });
  document.querySelectorAll('[data-sw-move-edit]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      go({ screen: 'swMoveEdit', id: btn.getAttribute('data-sw-move-edit') });
    });
  });
}

function swMoveView(id) {
  applyStarWarsTheme();
  var m = SW.moves.find(function(x) { return x.id === id; });
  if (!m) { swMoves(); return; }

  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Приёмы', nav: 'swMoves' },
    { label: m.name }
  ]);

  var html =
    '<button class="back" id="swBackMoveBtn">← К приёмам</button>' +
    '<div class="sw-char-sheet-card" style="margin-top:12px;">' +
      '<div class="sw-char-header">' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
          '<span style="font-size:22px;">⚔️</span>' +
          '<span style="font-size:20px;color:var(--sw-accent-pale);">' + esc(m.name) + '</span>' +
          '<span class="sw-side-badge sw-side-uni">' + esc(m.category || 'Приём') + '</span>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button class="btn btn-primary" id="swEditMoveBtn">✏️ Изменить</button>' +
          '<button class="btn btn-ghost" id="swDelMoveBtn" style="color:#fca5a5;border-color:rgba(239,68,68,0.4);">🗑️ Удалить</button>' +
        '</div>' +
      '</div>' +
      '<div class="sw-stat-box-grid" style="margin-top:14px;margin-bottom:14px;">' +
        '<div><div class="sw-field-lbl">Тип действия</div><div style="font-weight:700">' + esc(m.actionType || '1 действие') + '</div></div>' +
        '<div><div class="sw-field-lbl">Затраты</div><div style="font-weight:700;color:#fcd34d">' + esc(m.cost || 'Без затрат') + '</div></div>' +
        '<div><div class="sw-field-lbl">Урон / Бонус</div><div style="font-weight:700;color:#fca5a5">' + esc(m.damage || '—') + '</div></div>' +
      '</div>' +
      '<div style="font-size:14px;line-height:1.65;color:#e2edf8;background:var(--sw-panel-bg);padding:14px;border-radius:8px;border:1px solid var(--sw-border-subtle);white-space:pre-wrap;">' + esc(m.desc) + '</div>' +
    '</div>';

  mount(html);

  document.getElementById('swEditMoveBtn').addEventListener('click', function() {
    go({ screen: 'swMoveEdit', id: m.id });
  });
  document.getElementById('swBackMoveBtn').addEventListener('click', function() {
    go({ screen: 'swMoves' });
  });
  document.getElementById('swDelMoveBtn').addEventListener('click', function() {
    if (!confirm('Удалить приём «' + m.name + '»?')) return;
    SW.moves = SW.moves.filter(function(x) { return x.id !== m.id; });
    SW.saveMoves();
    go({ screen: 'swMoves' });
  });
}

function swMoveEdit(id) {
  applyStarWarsTheme();
  var existing = id ? SW.moves.find(function(x) { return x.id === id; }) : null;
  var m = existing ? JSON.parse(JSON.stringify(existing)) : {
    id: 'sw_m_' + Date.now(),
    name: '',
    category: 'Форма светового меча',
    actionType: '1 действие',
    cost: '1 Очко Силы',
    damage: '1d10 + мод.',
    tags: [],
    desc: ''
  };

  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Приёмы', nav: 'swMoves' },
    { label: existing ? 'Редактирование' : 'Новый приём' }
  ]);

  var html =
    '<button class="back" id="swMvBackBtn">← К приёмам</button>' +
    '<div class="sw-char-sheet-card" style="margin-top:12px;">' +
      '<div class="sw-char-header">' +
        '<span>' + (existing ? '✏️ Редактирование: ' + esc(m.name) : '⚔️ Новый боевой приём') + '</span>' +
      '</div>' +
      '<div class="sw-edit-grid">' +
        '<div class="sw-edit-item sw-field-full"><label>Название приёма / Формы</label><input type="text" id="swMvName" class="sw-input" value="' + esc(m.name) + '" placeholder="Напр.: Форма III: Соресу / Бросок светового меча"></div>' +
        '<div class="sw-edit-item"><label>Категория</label>' +
          '<select id="swMvCat" class="sw-input">' +
            ['Форма светового меча', 'Приём Силы и клинка', 'Стрелковый приём', 'Тактический приём'].map(function(c) {
              return '<option value="' + esc(c) + '" ' + (m.category === c ? 'selected' : '') + '>' + esc(c) + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div class="sw-edit-item"><label>Тип действия</label><input type="text" id="swMvAct" class="sw-input" value="' + esc(m.actionType || '') + '" placeholder="1 действие / Стойка / Реакция"></div>' +
        '<div class="sw-edit-item"><label>Затраты</label><input type="text" id="swMvCost" class="sw-input" value="' + esc(m.cost || '') + '" placeholder="Без затрат / 1 Очко Силы"></div>' +
        '<div class="sw-edit-item"><label>Урон / Бонус</label><input type="text" id="swMvDmg" class="sw-input" value="' + esc(m.damage || '') + '" placeholder="+2 КБ / 2d8 урона"></div>' +
        '<div class="sw-edit-item sw-field-full"><label>Описание приёма</label><textarea id="swMvDesc" class="sw-input" rows="4" placeholder="Подробное описание стойки, движения клинка и боевого эффекта...">' + esc(m.desc || '') + '</textarea></div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">' +
        '<button class="btn btn-ghost" id="swMvCancelBtn">Отмена</button>' +
        '<button class="btn btn-primary" id="swMvSaveBtn">💾 Сохранить приём</button>' +
      '</div>' +
    '</div>';

  mount(html);

  document.getElementById('swMvBackBtn').addEventListener('click', function() {
    go({ screen: 'swMoves' });
  });
  document.getElementById('swMvSaveBtn').addEventListener('click', function() {
    var name = (document.getElementById('swMvName').value || '').trim();
    if (!name) { alert('Введите название приёма'); return; }
    m.name = name;
    m.category = document.getElementById('swMvCat').value;
    m.actionType = document.getElementById('swMvAct').value.trim();
    m.cost = document.getElementById('swMvCost').value.trim();
    m.damage = document.getElementById('swMvDmg').value.trim();
    m.desc = document.getElementById('swMvDesc').value.trim();
    if (existing) {
      var idx = SW.moves.findIndex(function(x) { return x.id === m.id; });
      if (idx !== -1) SW.moves[idx] = m;
    } else {
      SW.moves.unshift(m);
    }
    SW.saveMoves();
    go({ screen: 'swMoveView', id: m.id });
  });
  document.getElementById('swMvCancelBtn').addEventListener('click', function() {
    go({ screen: 'swMoves' });
  });
}

/* ==========================================================================
   4. НАВЫКИ (swSkills, swSkillEdit)
   ========================================================================== */
var swSkillFilter = 'all';
var swSkillQuery = '';

function swSkills() {
  applyStarWarsTheme();
  SW.syncActiveCollections();
  var prof = SW.getActiveProfile();
  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Навыки' }
  ]);

  var skillCats = ['all', 'Сила', 'Боевое искусство', 'Техника и Космос', 'Социальный навык', 'Выживание и Разведка'];
  var filterPills = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:12px 0;">' +
    skillCats.map(function(c) {
      var lbl = c === 'all' ? 'Все (' + SW.skills.length + ')' : c;
      return '<button class="sw-pill ' + (swSkillFilter === c ? 'active' : '') + '" data-sw-skcat="' + esc(c) + '">' + esc(lbl) + '</button>';
    }).join('') +
  '</div>';

  var list = SW.skills.filter(function(sk) {
    if (swSkillFilter !== 'all' && sk.category !== swSkillFilter) return false;
    if (swSkillQuery) {
      var q = swSkillQuery.toLowerCase();
      var hay = ((sk.name || '') + ' ' + (sk.category || '') + ' ' + (sk.stat || '') + ' ' + (sk.desc || '')).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });

  var cardsHtml = list.length ? list.map(function(sk) {
    return '<div class="sw-ref-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">' +
      '<div>' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;">' +
          '<div class="sw-ref-card-k" style="margin-bottom:0;">🎯 ' + esc(sk.name) + '</div>' +
          '<div style="display:flex;gap:6px;align-items:center;">' +
            '<span class="sw-side-badge sw-side-light">' + esc(sk.rank || 'Обучен') + '</span>' +
            '<span class="sw-stat-badge" style="color:#fcd34d;padding:2px 8px;font-size:11.5px;">' + esc(sk.bonus || '+2') + '</span>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:11.5px;color:var(--sw-muted);margin-bottom:6px;">' +
          '<span style="background:var(--sw-accent-soft);padding:2px 6px;border-radius:3px;color:var(--sw-accent-bright);">📂 ' + esc(sk.category || 'Общий') + '</span>' +
          (sk.stat ? '<span style="background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:3px;">🧠 ' + esc(sk.stat) + '</span>' : '') +
        '</div>' +
        '<div class="sw-ref-card-v" style="font-size:12.5px;line-height:1.45;">' + esc(sk.desc || '') + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:6px;padding-top:6px;border-top:1px solid var(--sw-border-subtle);">' +
        '<button class="btn btn-ghost" data-sw-skill-id="' + esc(sk.id) + '" style="font-size:11px;padding:3px 8px;">✏️ Изменить</button>' +
      '</div>' +
    '</div>';
  }).join('') : (
    '<div class="char-empty" style="grid-column:1/-1;text-align:center;padding:44px 16px;border:1px dashed var(--sw-border);border-radius:12px;background:var(--sw-empty-bg);">' +
      '<div style="font-size:40px;margin-bottom:8px;">🎯 🔷</div>' +
      '<div style="font-family:Cinzel,serif;font-size:17px;color:var(--sw-accent-bright);margin-bottom:6px;">Список навыков персонажа пуст</div>' +
      '<div style="color:var(--sw-muted);font-size:13px;max-width:460px;margin:0 auto 16px;">Добавьте боевую или техническую специализацию вручную, либо воспользуйтесь AI Генератором или базовыми навыками Галактики.</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
        '<button class="btn btn-primary" id="swAddSkillEmptyBtn">➕ Создать навык</button>' +
        '<button class="btn btn-ghost" id="swAiSkillEmptyBtn" style="color:var(--sw-accent-bright);border-color:var(--sw-border);">🎯 AI Генератор навыков</button>' +
        (SW.skills.length === 0 ? '<button class="btn btn-ghost" id="swLoadDefaultSkillsBtn">📚 Загрузить базовые навыки</button>' : '') +
      '</div>' +
    '</div>'
  );

  var html =
    '<button class="back" id="swSkillBackHome">← Назад</button>' +
    renderSwAbilitiesTabBar('skills') +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
      '<div>' +
        '<h1 style="margin-bottom:4px;">🎯 Навыки и Специализации</h1>' +
        '<div class="desc" style="margin-bottom:0;">Владение световым мечом, познание Силы, пилотирование, астронавигация и слайсинг профиля «' + esc(prof.name || 'Новый персонаж') + '».</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button class="btn btn-primary" id="swAddSkillBtn">➕ Добавить навык</button>' +
        '<button class="btn btn-ghost" id="swAiSkillBtn" style="color:var(--sw-accent-bright);border-color:var(--sw-border);">🎯 AI Генератор навыков</button>' +
      '</div>' +
    '</div>' +
    '<div class="sw-ref-search-wrap" style="margin-top:10px;">' +
      '<span class="sw-ref-search-icon">🔍</span>' +
      '<input type="text" id="swSkillSearch" class="sw-ref-search-input" placeholder="Поиск навыка по названию, категории или характеристике..." value="' + esc(swSkillQuery) + '">' +
    '</div>' +
    filterPills +
    '<div class="sw-ref-cards-grid" style="margin-top:14px;">' +
      cardsHtml +
    '</div>';

  mount(html);
  wireSwAbilitiesTabBar();

  document.getElementById('swSkillBackHome').addEventListener('click', function() {
    go({ screen: 'swHome' });
  });
  document.querySelectorAll('[data-sw-skcat]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      swSkillFilter = btn.getAttribute('data-sw-skcat');
      swSkills();
    });
  });
  var sInp = document.getElementById('swSkillSearch');
  if (sInp) {
    sInp.addEventListener('input', function() {
      swSkillQuery = sInp.value;
      swSkills();
    });
  }
  document.getElementById('swAddSkillBtn').addEventListener('click', function() {
    go({ screen: 'swSkillEdit', id: null });
  });
  var addEmptyBtn = document.getElementById('swAddSkillEmptyBtn');
  if (addEmptyBtn) {
    addEmptyBtn.addEventListener('click', function() {
      go({ screen: 'swSkillEdit', id: null });
    });
  }
  var aiBtn = document.getElementById('swAiSkillBtn');
  if (aiBtn) {
    aiBtn.addEventListener('click', function() {
      go({ screen: 'swSkillGen' });
    });
  }
  var aiEmptyBtn = document.getElementById('swAiSkillEmptyBtn');
  if (aiEmptyBtn) {
    aiEmptyBtn.addEventListener('click', function() {
      go({ screen: 'swSkillGen' });
    });
  }
  var loadDefBtn = document.getElementById('swLoadDefaultSkillsBtn');
  if (loadDefBtn) {
    loadDefBtn.addEventListener('click', function() {
      SW.skills = SW.defaultSkills();
      SW.saveSkills();
      swSkills();
    });
  }
  document.querySelectorAll('[data-sw-skill-id]').forEach(function(el) {
    el.addEventListener('click', function() {
      go({ screen: 'swSkillEdit', id: el.getAttribute('data-sw-skill-id') });
    });
  });
}

function swSkillEdit(id) {
  applyStarWarsTheme();
  var existing = id ? SW.skills.find(function(x) { return x.id === id; }) : null;
  var sk = existing ? JSON.parse(JSON.stringify(existing)) : {
    id: 'sw_sk_' + Date.now(),
    name: '',
    category: 'Сила',
    rank: 'Обучен',
    stat: 'Мудрость',
    bonus: '+3',
    desc: ''
  };

  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Навыки', nav: 'swSkills' },
    { label: existing ? sk.name : 'Новый навык' }
  ]);

  var html =
    '<button class="back" id="swSkBackBtn">← К навыкам</button>' +
    '<div class="sw-char-sheet-card" style="margin-top:12px;">' +
      '<div class="sw-char-header">' +
        '<span>' + (existing ? '✏️ Редактирование навыка: ' + esc(sk.name) : '🎯 Новый навык') + '</span>' +
        (existing ? '<button class="btn btn-ghost" id="swSkDelBtn" style="color:#fca5a5;border-color:rgba(239,68,68,0.4);">🗑️ Удалить</button>' : '') +
      '</div>' +
      '<div class="sw-edit-grid">' +
        '<div class="sw-edit-item sw-field-full"><label>Название навыка</label><input type="text" id="swSkName" class="sw-input" value="' + esc(sk.name) + '" placeholder="Напр.: Пилотирование истребителей / Познание Силы"></div>' +
        '<div class="sw-edit-item"><label>Категория</label>' +
          '<select id="swSkCat" class="sw-input">' +
            ['Сила', 'Боевое искусство', 'Техника и Космос', 'Социальный навык', 'Выживание и Разведка'].map(function(c) {
              return '<option value="' + esc(c) + '" ' + (sk.category === c ? 'selected' : '') + '>' + esc(c) + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div class="sw-edit-item"><label>Уровень мастерства</label><input type="text" id="swSkRank" class="sw-input" value="' + esc(sk.rank || '') + '" placeholder="Обучен / Эксперт / Мастер"></div>' +
        '<div class="sw-edit-item"><label>Базовая характеристика</label><input type="text" id="swSkStat" class="sw-input" value="' + esc(sk.stat || '') + '" placeholder="Ловкость / Интеллект / Мудрость"></div>' +
        '<div class="sw-edit-item"><label>Бонус проверки</label><input type="text" id="swSkBonus" class="sw-input" value="' + esc(sk.bonus || '+3') + '" placeholder="+4"></div>' +
        '<div class="sw-edit-item sw-field-full"><label>Описание и преимущества</label><textarea id="swSkDesc" class="sw-input" rows="3" placeholder="За какие проверки отвечает навык и какие преимущества даёт...">' + esc(sk.desc || '') + '</textarea></div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">' +
        '<button class="btn btn-ghost" id="swSkCancelBtn">Отмена</button>' +
        '<button class="btn btn-primary" id="swSkSaveBtn">💾 Сохранить навык</button>' +
      '</div>' +
    '</div>';

  mount(html);

  document.getElementById('swSkBackBtn').addEventListener('click', function() {
    go({ screen: 'swSkills' });
  });
  document.getElementById('swSkSaveBtn').addEventListener('click', function() {
    var name = (document.getElementById('swSkName').value || '').trim();
    if (!name) { alert('Введите название навыка'); return; }
    sk.name = name;
    sk.category = document.getElementById('swSkCat').value;
    sk.rank = document.getElementById('swSkRank').value.trim();
    sk.stat = document.getElementById('swSkStat').value.trim();
    sk.bonus = document.getElementById('swSkBonus').value.trim();
    sk.desc = document.getElementById('swSkDesc').value.trim();
    if (existing) {
      var idx = SW.skills.findIndex(function(x) { return x.id === sk.id; });
      if (idx !== -1) SW.skills[idx] = sk;
    } else {
      SW.skills.push(sk);
    }
    SW.saveSkills();
    go({ screen: 'swSkills' });
  });
  if (existing) {
    document.getElementById('swSkDelBtn').addEventListener('click', function() {
      if (!confirm('Удалить навык «' + sk.name + '»?')) return;
      SW.skills = SW.skills.filter(function(x) { return x.id !== sk.id; });
      SW.saveSkills();
      go({ screen: 'swSkills' });
    });
  }
  document.getElementById('swSkCancelBtn').addEventListener('click', function() {
    go({ screen: 'swSkills' });
  });
}

/* ==========================================================================
   4.5. AI ГЕНЕРАТОРЫ ГОЛОКРОНА (swTechGen, swMoveGen, swSkillGen)
   ========================================================================== */
function swGetGeminiKeyOrPrompt() {
  var k = (typeof window.getGeminiApiKey === 'function')
    ? window.getGeminiApiKey()
    : (localStorage.getItem('ttc_gemini_api_key') || localStorage.getItem('gemini_api_key') || '');
  if (!k) {
    var input = prompt('Введите Google Gemini API ключ для генерации через Голокрон-ИИ:');
    if (input && input.trim()) {
      k = input.trim();
      if (typeof window.saveGeminiApiKey === 'function') {
        window.saveGeminiApiKey(k);
      } else {
        try {
          localStorage.setItem('ttc_gemini_api_key', k);
          localStorage.setItem('gemini_api_key', k);
        } catch (e) {}
      }
    }
  }
  return k || '';
}

function swPromptChangeApiKey() {
  var curKey = (typeof window.getGeminiApiKey === 'function')
    ? window.getGeminiApiKey()
    : (localStorage.getItem('ttc_gemini_api_key') || localStorage.getItem('gemini_api_key') || '');
  var input = prompt('Введите Google Gemini API ключ:', curKey || '');
  if (input !== null) {
    var trimmed = input.trim();
    if (typeof window.saveGeminiApiKey === 'function') {
      window.saveGeminiApiKey(trimmed);
    } else {
      try {
        if (trimmed) {
          localStorage.setItem('ttc_gemini_api_key', trimmed);
          localStorage.setItem('gemini_api_key', trimmed);
        } else {
          localStorage.removeItem('ttc_gemini_api_key');
          localStorage.removeItem('gemini_api_key');
        }
      } catch (e) {}
    }
  }
}

function swRequestGemini(promptText, apiKey, callback) {
  if (typeof window.requestGeminiGenerateContent === 'function') {
    window.requestGeminiGenerateContent(promptText, apiKey, function(err, data) {
      if (err || !data) {
        callback(err ? (err.message || String(err)) : 'Пустой ответ от ИИ', null);
        return;
      }
      try {
        var extractFn = window.extractJsonFromAi || function(d) {
          var raw = (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts && d.candidates[0].content.parts[0].text) || d;
          return JSON.parse(String(raw).replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim());
        };
        callback(null, extractFn(data));
      } catch (e) {
        callback('Ошибка разбора ответа ИИ: ' + e.message, null);
      }
    });
    return;
  }
  if (!apiKey) {
    callback('API ключ Google Gemini не указан', null);
    return;
  }
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(apiKey);
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { temperature: 0.8, responseMimeType: 'application/json' }
    })
  }).then(function(res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }).then(function(data) {
    var raw = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) || '';
    var parsed = JSON.parse(String(raw).replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim());
    callback(null, parsed);
  }).catch(function(err) {
    callback(err.message || String(err), null);
  });
}

function renderSwTechCardPreview(t) {
  return '<div class="sw-ref-card" style="border-color:var(--sw-accent);box-shadow:0 0 18px var(--sw-glow);">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
      '<div class="sw-ref-card-k" style="margin-bottom:0;font-size:16px;">✨ ' + esc(t.name || 'Способность Силы') + '</div>' +
      '<span class="sw-side-badge ' + swSideBadgeClass(t.side) + '">' + esc(t.side || 'Универсальная') + '</span>' +
    '</div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:12px;color:var(--sw-muted);margin-bottom:8px;">' +
      (t.cost ? '<span style="background:rgba(245,158,11,0.14);padding:2px 8px;border-radius:3px;color:#fde047;">⚡ ' + esc(t.cost) + '</span>' : '') +
      (t.actionType ? '<span style="background:var(--sw-accent-soft);padding:2px 8px;border-radius:3px;color:var(--sw-accent-bright);">⏱ ' + esc(t.actionType) + '</span>' : '') +
      (t.range ? '<span style="background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:3px;">📏 ' + esc(t.range) + '</span>' : '') +
      (t.rank ? '<span style="background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:3px;">📜 ' + esc(t.rank) + '</span>' : '') +
    '</div>' +
    '<div class="sw-ref-card-v" style="font-size:13.5px;line-height:1.55;">' + esc(t.desc || '').replace(/\n/g, '<br>') + '</div>' +
  '</div>';
}

function renderSwMoveCardPreview(m) {
  return '<div class="sw-ref-card" style="border-color:var(--sw-accent);box-shadow:0 0 18px var(--sw-glow);">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
      '<div class="sw-ref-card-k" style="margin-bottom:0;font-size:16px;">⚔️ ' + esc(m.name || 'Боевой приём') + '</div>' +
      '<span class="sw-side-badge sw-side-uni">' + esc(m.category || 'Форма светового меча') + '</span>' +
    '</div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:12px;color:var(--sw-muted);margin-bottom:8px;">' +
      (m.actionType ? '<span style="background:var(--sw-accent-soft);padding:2px 8px;border-radius:3px;color:var(--sw-accent-bright);">⏱ ' + esc(m.actionType) + '</span>' : '') +
      (m.cost ? '<span style="background:rgba(245,158,11,0.14);padding:2px 8px;border-radius:3px;color:#fde047;">⚡ ' + esc(m.cost) + '</span>' : '') +
      (m.damage ? '<span style="background:rgba(239,68,68,0.15);padding:2px 8px;border-radius:3px;color:#fca5a5;">💥 ' + esc(m.damage) + '</span>' : '') +
    '</div>' +
    '<div class="sw-ref-card-v" style="font-size:13.5px;line-height:1.55;">' + esc(m.desc || '').replace(/\n/g, '<br>') + '</div>' +
  '</div>';
}

function renderSwSkillCardPreview(sk) {
  return '<div class="sw-ref-card" style="border-color:var(--sw-accent);box-shadow:0 0 18px var(--sw-glow);">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
      '<div class="sw-ref-card-k" style="margin-bottom:0;font-size:16px;">🎯 ' + esc(sk.name || 'Навык') + '</div>' +
      '<div style="display:flex;gap:6px;align-items:center;">' +
        '<span class="sw-side-badge sw-side-light">' + esc(sk.rank || 'Обучен') + '</span>' +
        '<span class="sw-stat-badge" style="color:#fcd34d;padding:2px 8px;font-size:11.5px;">' + esc(sk.bonus || '+3') + '</span>' +
      '</div>' +
    '</div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:12px;color:var(--sw-muted);margin-bottom:8px;">' +
      '<span style="background:var(--sw-accent-soft);padding:2px 8px;border-radius:3px;color:var(--sw-accent-bright);">📂 ' + esc(sk.category || 'Сила') + '</span>' +
      (sk.stat ? '<span style="background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:3px;">🧠 ' + esc(sk.stat) + '</span>' : '') +
    '</div>' +
    '<div class="sw-ref-card-v" style="font-size:13.5px;line-height:1.55;">' + esc(sk.desc || '').replace(/\n/g, '<br>') + '</div>' +
  '</div>';
}

/* --- 1) AI Генератор Способностей (swTechGen) --- */
function swTechGen() {
  applyStarWarsTheme();
  var prof = SW.getActiveProfile();
  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Способности', nav: 'swTechs' },
    { label: 'AI Генератор' }
  ]);

  var html =
    '<button class="back" id="swTgBackToList">← К способностям</button>' +
    '<div class="sw-char-sheet-card" style="margin-top:12px;">' +
      '<div class="sw-char-header">' +
        '<span>✨ AI Генератор способностей Силы и Гаджетов</span>' +
        '<button class="btn btn-ghost" id="swTgChangeKeyBtn" style="font-size:11px;padding:3px 8px;">🔑 API Ключ</button>' +
      '</div>' +
      '<div id="swTgFormSection" style="margin-top:14px;">' +
        '<div class="sw-edit-grid">' +
          '<div class="sw-edit-item sw-field-full">' +
            '<label>Тема, идея или описание способности</label>' +
            '<input type="text" id="swTgTheme" class="sw-input" placeholder="Например: Волна Силы, отбрасывающая врагов; Стазис поля боя; Залп мандалорских свистящих птиц; Сокрушение Силы">' +
          '</div>' +
          '<div class="sw-edit-item">' +
            '<label>Сторона Силы / Категория</label>' +
            '<select id="swTgSide" class="sw-input">' +
              '<option value="Универсальная">Универсальная (Живая / Космическая Сила)</option>' +
              '<option value="Светлая сторона">Светлая сторона Силы (Джедаи)</option>' +
              '<option value="Тёмная сторона">Тёмная сторона Силы (Ситхи)</option>' +
              '<option value="Технология">Технология / Мандалорский гаджет</option>' +
            '</select>' +
          '</div>' +
          '<div class="sw-edit-item">' +
            '<label>Ранг мастерства</label>' +
            '<input type="text" id="swTgRank" class="sw-input" value="Адепт" placeholder="Базовая / Адепт / Мастер / Гранд-мастер">' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;justify-content:flex-end;margin-top:16px;">' +
          '<button class="btn btn-primary" id="btnSwTechGen" style="padding:8px 20px;">✨ Сгенерировать способность через AI</button>' +
        '</div>' +
      '</div>' +
      '<div id="swTgResult" style="display:none;margin-top:16px;">' +
        '<div id="swTgPreview"></div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap;">' +
          '<button class="btn btn-ghost" id="btnSwTechBack">← Изменить запрос</button>' +
          '<button class="btn btn-ghost" id="btnSwTechRegen">🔄 Перегенерировать</button>' +
          '<button class="btn btn-primary" id="btnSwTechSave">💾 Добавить способность в профиль</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  mount(html);

  document.getElementById('swTgBackToList').addEventListener('click', function() {
    go({ screen: 'swTechs' });
  });
  document.getElementById('swTgChangeKeyBtn').addEventListener('click', swPromptChangeApiKey);

  var btnGen = document.getElementById('btnSwTechGen');
  btnGen.addEventListener('click', function() {
    var k = swGetGeminiKeyOrPrompt();
    if (!k) return;

    var theme = (document.getElementById('swTgTheme').value || '').trim();
    var side = document.getElementById('swTgSide').value;
    var rank = (document.getElementById('swTgRank').value || 'Адепт').trim();

    btnGen.disabled = true;
    btnGen.textContent = '✨ Обращение к Голокрону (генерация)...';

    var promptText = 'Ты — Хранитель Великого Голокрона во вселенной Звёздных Войн (Star Wars: Старая Республика, Войны Клонов, Галактическая Империя, НРИ D&D 5e / SW5e). ' +
      'Придумай каноничную, атмосферную и сбалансированную способность Силы или тактический гаджет для персонажа (' + (prof.path || 'Адепт Силы / Странник Галактики') + '). ' +
      'Тема/Идея: ' + (theme || 'Уникальная способность Силы или гаджет по категории') + '. ' +
      'Категория / Сторона: ' + side + '. ' +
      'Ранг: ' + rank + '. ' +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown-обёртки (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название способности на русском (и в скобках по-английски, например: Стазис Силы (Force Stasis))",\n' +
      '  "side": "Строго одно из: Светлая сторона, Тёмная сторона, Универсальная, Технология",\n' +
      '  "rank": "Ранг способности (например: Базовая, Адепт, Мастер, Тактическая)",\n' +
      '  "cost": "Затраты (например: 1 Очко Силы, 2 Очка Силы, 1 заряд гаджета)",\n' +
      '  "actionType": "Время применения (например: 1 действие, 1 бонусное действие, Реакция)",\n' +
      '  "range": "Дистанция (например: 9 м, 12 м (конус), На себя, Касание)",\n' +
      '  "desc": "Подробное атмосферное и механическое описание (3-4 предложения): как выглядит проявление Силы или работа гаджета, какой спасбросок или бросок атаки требуется, какой урон (например 3d8 силового/энергетического урона) или тактический эффект получает цель"\n' +
      '}';

    swRequestGemini(promptText, k, function(err, result) {
      btnGen.disabled = false;
      btnGen.textContent = '✨ Сгенерировать способность через AI';
      if (err || !result) {
        alert('Ошибка генерации: ' + (err || 'Пустой ответ от ИИ'));
        return;
      }
      window._lastGenSwTech = result;
      document.getElementById('swTgFormSection').style.display = 'none';
      var resDiv = document.getElementById('swTgResult');
      resDiv.style.display = 'block';
      document.getElementById('swTgPreview').innerHTML = renderSwTechCardPreview(result);
    });
  });

  document.getElementById('btnSwTechBack').addEventListener('click', function() {
    document.getElementById('swTgResult').style.display = 'none';
    document.getElementById('swTgFormSection').style.display = 'block';
  });
  document.getElementById('btnSwTechRegen').addEventListener('click', function() {
    document.getElementById('swTgResult').style.display = 'none';
    document.getElementById('swTgFormSection').style.display = 'block';
    btnGen.click();
  });
  document.getElementById('btnSwTechSave').addEventListener('click', function() {
    var r = window._lastGenSwTech;
    if (!r) return;
    var item = {
      id: 'sw_t_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: r.name || 'Способность Силы',
      side: r.side || 'Универсальная',
      rank: r.rank || 'Адепт',
      cost: r.cost || '1 Очко Силы',
      actionType: r.actionType || '1 действие',
      range: r.range || '9 м',
      duration: 'Мгновенно',
      tags: [],
      desc: r.desc || ''
    };
    SW.techs.unshift(item);
    SW.saveTechs();
    go({ screen: 'swTechView', id: item.id });
  });
}

/* --- 2) AI Генератор Боевых Приёмов (swMoveGen) --- */
function swMoveGen() {
  applyStarWarsTheme();
  var prof = SW.getActiveProfile();
  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Приёмы', nav: 'swMoves' },
    { label: 'AI Генератор' }
  ]);

  var html =
    '<button class="back" id="swMgBackToList">← К приёмам</button>' +
    '<div class="sw-char-sheet-card" style="margin-top:12px;">' +
      '<div class="sw-char-header">' +
        '<span>⚔️ AI Генератор боевых приёмов и Форм фехтования</span>' +
        '<button class="btn btn-ghost" id="swMgChangeKeyBtn" style="font-size:11px;padding:3px 8px;">🔑 API Ключ</button>' +
      '</div>' +
      '<div id="swMgFormSection" style="margin-top:14px;">' +
        '<div class="sw-edit-grid">' +
          '<div class="sw-edit-item sw-field-full">' +
            '<label>Тема или задумка боевого приёма</label>' +
            '<input type="text" id="swMgTheme" class="sw-input" placeholder="Например: Дуэльный рипост Макаши с отсечением оружия; Стремительный вихрь Атару; Рикошет бластерного выстрела">' +
          '</div>' +
          '<div class="sw-edit-item">' +
            '<label>Категория приёма</label>' +
            '<select id="swMgCat" class="sw-input">' +
              '<option value="Форма светового меча">Форма светового меча (Формы I–VII)</option>' +
              '<option value="Приём Силы и клинка">Приём Силы и клинка</option>' +
              '<option value="Стрелковый приём">Стрелковый приём (Бластеры / Снайпер)</option>' +
              '<option value="Тактический приём">Тактический приём (Мандалорец / Оперативник)</option>' +
            '</select>' +
          '</div>' +
          '<div class="sw-edit-item">' +
            '<label>Тип действия</label>' +
            '<input type="text" id="swMgAct" class="sw-input" value="1 действие" placeholder="1 действие / Бонусное / Реакция / Стойка">' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;justify-content:flex-end;margin-top:16px;">' +
          '<button class="btn btn-primary" id="btnSwMoveGen" style="padding:8px 20px;">⚔️ Сгенерировать приём через AI</button>' +
        '</div>' +
      '</div>' +
      '<div id="swMgResult" style="display:none;margin-top:16px;">' +
        '<div id="swMgPreview"></div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap;">' +
          '<button class="btn btn-ghost" id="btnSwMoveBack">← Изменить запрос</button>' +
          '<button class="btn btn-ghost" id="btnSwMoveRegen">🔄 Перегенерировать</button>' +
          '<button class="btn btn-primary" id="btnSwMoveSave">💾 Добавить приём в профиль</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  mount(html);

  document.getElementById('swMgBackToList').addEventListener('click', function() {
    go({ screen: 'swMoves' });
  });
  document.getElementById('swMgChangeKeyBtn').addEventListener('click', swPromptChangeApiKey);

  var btnGen = document.getElementById('btnSwMoveGen');
  btnGen.addEventListener('click', function() {
    var k = swGetGeminiKeyOrPrompt();
    if (!k) return;

    var theme = (document.getElementById('swMgTheme').value || '').trim();
    var cat = document.getElementById('swMgCat').value;
    var act = (document.getElementById('swMgAct').value || '1 действие').trim();

    btnGen.disabled = true;
    btnGen.textContent = '⚔️ Моделирование боевой техники...';

    var promptText = 'Ты — Мастер Боя Храма Джедаев и инструктор фехтования на световых мечах во вселенной Звёздных Войн (Star Wars / SW5e). ' +
      'Придумай эффектный, каноничный боевой приём, стойку одной из 7 Форм фехтования (Шии-Чо, Макаши, Соресу, Атару, Шиен/Джем Со, Ниман, Джуйо/Ваапад) или тактический/стрелковый манёвр для персонажа (' + (prof.path || 'Воин Галактики') + '). ' +
      'Тема/Идея: ' + (theme || 'Уникальный боевой приём или связка ударов') + '. ' +
      'Категория: ' + cat + '. ' +
      'Тип действия: ' + act + '. ' +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown-обёртки (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название боевого приёма и Формы (например: Форма II: Макаши — «Приветственный выпад дуэлянта»)",\n' +
      '  "category": "Строго одно из: Форма светового меча, Приём Силы и клинка, Стрелковый приём, Тактический приём",\n' +
      '  "actionType": "Тип действия (например: 1 действие, Стойка (Бонусное действие), Реакция)",\n' +
      '  "cost": "Затраты (например: Без затрат, 1 Очко Силы, 1 заряд)",\n' +
      '  "damage": "Урон или боевой бонус (например: +2d8 энергетического урона, +2 к КБ и ответный укол 1d10)",\n' +
      '  "desc": "Детальное описание траектории клинка или выстрела, работы ног и игровой механики (3-4 предложения)"\n' +
      '}';

    swRequestGemini(promptText, k, function(err, result) {
      btnGen.disabled = false;
      btnGen.textContent = '⚔️ Сгенерировать приём через AI';
      if (err || !result) {
        alert('Ошибка генерации: ' + (err || 'Пустой ответ от ИИ'));
        return;
      }
      window._lastGenSwMove = result;
      document.getElementById('swMgFormSection').style.display = 'none';
      var resDiv = document.getElementById('swMgResult');
      resDiv.style.display = 'block';
      document.getElementById('swMgPreview').innerHTML = renderSwMoveCardPreview(result);
    });
  });

  document.getElementById('btnSwMoveBack').addEventListener('click', function() {
    document.getElementById('swMgResult').style.display = 'none';
    document.getElementById('swMgFormSection').style.display = 'block';
  });
  document.getElementById('btnSwMoveRegen').addEventListener('click', function() {
    document.getElementById('swMgResult').style.display = 'none';
    document.getElementById('swMgFormSection').style.display = 'block';
    btnGen.click();
  });
  document.getElementById('btnSwMoveSave').addEventListener('click', function() {
    var r = window._lastGenSwMove;
    if (!r) return;
    var item = {
      id: 'sw_m_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: r.name || 'Боевой приём',
      category: r.category || 'Форма светового меча',
      actionType: r.actionType || '1 действие',
      cost: r.cost || '1 Очко Силы',
      damage: r.damage || '+1d8 урона',
      tags: [],
      desc: r.desc || ''
    };
    SW.moves.unshift(item);
    SW.saveMoves();
    go({ screen: 'swMoveView', id: item.id });
  });
}

/* --- 3) AI Генератор Навыков (swSkillGen) --- */
function swSkillGen() {
  applyStarWarsTheme();
  var prof = SW.getActiveProfile();
  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Навыки', nav: 'swSkills' },
    { label: 'AI Генератор' }
  ]);

  var html =
    '<button class="back" id="swSkgBackToList">← К навыкам</button>' +
    '<div class="sw-char-sheet-card" style="margin-top:12px;">' +
      '<div class="sw-char-header">' +
        '<span>🎯 AI Генератор навыков и специализаций Галактики</span>' +
        '<button class="btn btn-ghost" id="swSkgChangeKeyBtn" style="font-size:11px;padding:3px 8px;">🔑 API Ключ</button>' +
      '</div>' +
      '<div id="swSkgFormSection" style="margin-top:14px;">' +
        '<div class="sw-edit-grid">' +
          '<div class="sw-edit-item sw-field-full">' +
            '<label>Тема или идея навыка / специализации</label>' +
            '<input type="text" id="swSkgTheme" class="sw-input" placeholder="Например: Сборка световых мечей и настройка кайбера; Пилотирование в астероидных полях; Ковка бескара">' +
          '</div>' +
          '<div class="sw-edit-item">' +
            '<label>Категория навыка</label>' +
            '<select id="swSkgCat" class="sw-input">' +
              '<option value="Сила">Сила</option>' +
              '<option value="Боевое искусство">Боевое искусство</option>' +
              '<option value="Техника и Космос">Техника и Космос</option>' +
              '<option value="Социальный навык">Социальный навык</option>' +
              '<option value="Выживание и Разведка">Выживание и Разведка</option>' +
            '</select>' +
          '</div>' +
          '<div class="sw-edit-item">' +
            '<label>Уровень мастерства</label>' +
            '<select id="swSkgRank" class="sw-input">' +
              '<option value="Обучен">Обучен</option>' +
              '<option value="Эксперт" selected>Эксперт</option>' +
              '<option value="Мастер">Мастер</option>' +
              '<option value="Гранд-мастер">Гранд-мастер</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;justify-content:flex-end;margin-top:16px;">' +
          '<button class="btn btn-primary" id="btnSwSkillGen" style="padding:8px 20px;">🎯 Сгенерировать навык через AI</button>' +
        '</div>' +
      '</div>' +
      '<div id="swSkgResult" style="display:none;margin-top:16px;">' +
        '<div id="swSkgPreview"></div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap;">' +
          '<button class="btn btn-ghost" id="btnSwSkillBack">← Изменить запрос</button>' +
          '<button class="btn btn-ghost" id="btnSwSkillRegen">🔄 Перегенерировать</button>' +
          '<button class="btn btn-primary" id="btnSwSkillSave">💾 Добавить навык в профиль</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  mount(html);

  document.getElementById('swSkgBackToList').addEventListener('click', function() {
    go({ screen: 'swSkills' });
  });
  document.getElementById('swSkgChangeKeyBtn').addEventListener('click', swPromptChangeApiKey);

  var btnGen = document.getElementById('btnSwSkillGen');
  btnGen.addEventListener('click', function() {
    var k = swGetGeminiKeyOrPrompt();
    if (!k) return;

    var theme = (document.getElementById('swSkgTheme').value || '').trim();
    var cat = document.getElementById('swSkgCat').value;
    var rank = document.getElementById('swSkgRank').value;

    btnGen.disabled = true;
    btnGen.textContent = '🎯 Запрос к архивам Голокрона...';

    var promptText = 'Ты — Хранитель Архивов Храма Джедаев во вселенной Звёздных Войн (Star Wars / SW5e). ' +
      'Придумай каноничный, полезный и атмосферный навык или специализацию для персонажа (' + (prof.path || 'Герой Галактики') + '). ' +
      'Тема/Идея: ' + (theme || 'Уникальная специализация по выбранной категории') + '. ' +
      'Категория: ' + cat + '. ' +
      'Уровень мастерства: ' + rank + '. ' +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown-обёртки (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название навыка (например: Настройка кайбер-кристаллов и конструирование мечей)",\n' +
      '  "category": "Строго одно из: Сила, Боевое искусство, Техника и Космос, Социальный навык, Выживание и Разведка",\n' +
      '  "rank": "Уровень мастерства (Обучен, Эксперт, Мастер, Гранд-мастер)",\n' +
      '  "stat": "Базовая характеристика (например: Мудрость / Интеллект, Ловкость, Харизма)",\n' +
      '  "bonus": "Бонус проверки (например: +4, +5, +6)",\n' +
      '  "desc": "Подробное описание того, что умеет делать персонаж благодаря этому навыку и какие преимущества в проверках он получает (2-3 предложения)"\n' +
      '}';

    swRequestGemini(promptText, k, function(err, result) {
      btnGen.disabled = false;
      btnGen.textContent = '🎯 Сгенерировать навык через AI';
      if (err || !result) {
        alert('Ошибка генерации: ' + (err || 'Пустой ответ от ИИ'));
        return;
      }
      window._lastGenSwSkill = result;
      document.getElementById('swSkgFormSection').style.display = 'none';
      var resDiv = document.getElementById('swSkgResult');
      resDiv.style.display = 'block';
      document.getElementById('swSkgPreview').innerHTML = renderSwSkillCardPreview(result);
    });
  });

  document.getElementById('btnSwSkillBack').addEventListener('click', function() {
    document.getElementById('swSkgResult').style.display = 'none';
    document.getElementById('swSkgFormSection').style.display = 'block';
  });
  document.getElementById('btnSwSkillRegen').addEventListener('click', function() {
    document.getElementById('swSkgResult').style.display = 'none';
    document.getElementById('swSkgFormSection').style.display = 'block';
    btnGen.click();
  });
  document.getElementById('btnSwSkillSave').addEventListener('click', function() {
    var r = window._lastGenSwSkill;
    if (!r) return;
    var item = {
      id: 'sw_sk_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: r.name || 'Новый навык',
      category: r.category || 'Сила',
      rank: r.rank || 'Эксперт',
      stat: r.stat || 'Мудрость',
      bonus: r.bonus || '+4',
      desc: r.desc || ''
    };
    SW.skills.push(item);
    SW.saveSkills();
    go({ screen: 'swSkills' });
  });
}


/* ==========================================================================
   5. СПРАВОЧНИК / АРХИВЫ ГОЛОКРОНА (swRef, swRefView)
   ========================================================================== */
var SW_REF_SECTIONS = [
  { id: 'orders',   icon: '🏛️', title: 'Ордена, Кодексы и Пути Персонажей' },
  { id: 'forms',    icon: '⚔️', title: '7 Классических Форм Боя на Световых Мечах' },
  { id: 'kyber',    icon: '💎', title: 'Кайбер-кристаллы и Конструкции Световых Мечей' },
  { id: 'force',    icon: '✨', title: 'Природа Силы, Дисциплины и Высшие Техники' },
  { id: 'races',    icon: '👽', title: 'Расы и Народы Далёкой Галактики' },
  { id: 'factions', icon: '🚩', title: 'Фракции, Империи и Преступные Синдикаты' },
  { id: 'ships',    icon: '🚀', title: 'Звёздные Корабли, Броня и Вооружение' },
  { id: 'beasts',   icon: '👹', title: 'Бестиарий и Фауна Галактики' }
];

var SW_REF = {
  /* --- 1. ОРДЕНА, КОДЕКСЫ И ПУТИ --- */
  jedi_order: {
    sec: 'orders',
    icon: '📘',
    name: 'Орден Джедаев и Кодекс Света',
    tag: 'Светлая сторона',
    lead: '«Нет эмоций — есть покой. Нет неведения — есть знание. Нет страсти — есть безмятежность. Нет хаоса — есть гармония. Нет смерти — есть Великая Сила».',
    desc: 'Древний монашеский и миротворческий орден адептов Светлой стороны Силы, хранящий мир и справедливость в Галактической Республике на протяжении более тысячи поколений.\n\n' +
      '• Джедаи-стражи (Jedi Guardians, синий клинок): рыцари переднего края, мастера боевого фехтования, атлетики и защиты союзников.\n' +
      '• Джедаи-консулы (Jedi Consulars, зелёный клинок): дипломаты, целители, провидцы и исследователи глубин Живой и Космической Силы.\n' +
      '• Джедаи-часовые (Jedi Sentinels, жёлтый клинок): следователи, тени и храмовые стражи, сочетающие владение Силой с техническими навыками, слайсингом и разведкой.\n' +
      '• Иерархия Ордена: Юнлинг (младший ученик в клане) → Падаван (ученик рыцаря или мастера) → Рыцарь-джедай (прошедший Испытания) → Мастер-джедай → Гранд-мастер Высшего Совета.'
  },
  sith_order: {
    sec: 'orders',
    icon: '📕',
    name: 'Орден Ситхов и Правило Двух',
    tag: 'Тёмная сторона',
    lead: '«Спокойствие — ложь, есть только страсть. Через страсть я обретаю силу. Через силу я обретаю мощь. Через мощь я обретаю победу. Через победу мои оковы рвутся. Сила освободит меня».',
    desc: 'Философия и воинский орден адептов Тёмной стороны Силы, зародившийся после Столетней Тьмы и расцвета Империи на Коррибане и Дромунд-Каасе.\n\n' +
      '• Ситх-воин (Джаггернаут / Мародёр): воплощение физической ярости и сокрушительного фехтования Формами V и VII.\n' +
      '• Ситх-инквизитор (Колдун / Ассасин): повелитель Молний Силы, древних ситхских ритуалов, алхимии и двойных световых мечей.\n' +
      '• Правило Двух Дарта Бэйна: «Двое должны быть всегда: ни больше, ни меньше. Один — чтобы воплощать могущество, другой — чтобы жаждать его».'
  },
  grey_force: {
    sec: 'orders',
    icon: '⚖️',
    name: 'Серые Джедаи и Адепты Баланса',
    tag: 'Баланс Силы',
    lead: 'Странники Силы, идущие по грани между светом и тьмой без догматов Высшего Совета и без порабощения Тёмной стороной.',
    desc: 'Одинокие рыцари, изгнанники и древние мистики (такие как последователи Дже’дайи с Тайтона или Бенду), воспринимающие Силу как единый неделимый поток.\n\n' +
      '• Свобода воли: Серые адепты не боятся эмоций, но не позволяют гневу и жажде власти подчинить свой разум.\n' +
      '• Боевая универсальность: свободно комбинируют защитные стойки Джедаев с резкими телекинетическими и электрическими техниками.'
  },
  mandalorian_creed: {
    sec: 'orders',
    icon: '🪖',
    name: 'Кредо Мандалора и Воинские Кланы',
    tag: 'Таков Путь',
    lead: 'Воинская культура кланов Мандалора, способная на равных сражаться с рыцарями-джедаями и лордами ситхов благодаря броне из бескара и арсеналу гаджетов.',
    desc: 'Мандалорцы — не раса, а воинское братство и кодекс чести («Резол’наре» — Шесть Деяний).\n\n' +
      '• Броня из бескара (Мандалорского железа): выдерживает прямые попадания бластеров и скользящие удары светового меча.\n' +
      '• Наручный арсенал: реактивный ранец (джетпак), наручный огнемёт, тросомёт-грапплер, залп «свистящих птиц» (самонаводящихся микроракет) и виброклинки.'
  },

  /* --- 2. 7 ФОРМ БОЯ НА СВЕТОВЫХ МЕЧАХ --- */
  form_1_shiicho: {
    sec: 'forms',
    icon: '1️⃣',
    name: 'Форма I: Шии-Чо («Путь Сарлакка»)',
    tag: 'Базовая / Толпа',
    lead: 'Древнейший стиль фехтования, разработанный при переходе от металлических клинков к плазменным световым мечам.',
    desc: 'Шии-Чо закладывает фундамент всех зон атаки и защиты (голова, корпус, руки, ноги). Отличается широкими размашистыми горизонтальными и диагональными ударами.\n\n' +
      '• Сильная сторона: контроль окружения и бой против группы противников одновременно.\n' +
      '• Игровая механика: при попадании по основной цели соседний враг в радиусе 1.5 м получает рассекающий урон, равный модификатору характеристики бойца.\n' +
      '• Известные мастера: Кит Фисто, Сatele Шан.'
  },
  form_2_makashi: {
    sec: 'forms',
    icon: '2️⃣',
    name: 'Форма II: Макаши («Путь Исаламири»)',
    tag: 'Дуэльная',
    lead: 'Вершина аристократического фехтования клинок-против-клинка, созданная специально для поединков со световыми мечами.',
    desc: 'Макаши делает ставку на точность работы ног по одной линии, молниеносные уколы, обманные финты и мягкое отведение вражеского клинка без грубого силового клинча. Часто используется с изогнутой рукоятью.\n\n' +
      '• Сильная сторона: дуэли 1 на 1, защита от обезоруживания и мгновенные контратаки.\n' +
      '• Игровая механика: +2 к броскам атаки против одиночной цели и возможность реакцией совершить ответный выпад при промахе врага в ближнем бою.\n' +
      '• Известные мастера: Граф Дуку (Дарт Тиранус), Шаак Ти.'
  },
  form_3_soresu: {
    sec: 'forms',
    icon: '3️⃣',
    name: 'Форма III: Соресу («Путь Майнока»)',
    tag: 'Абсолютная защита',
    lead: 'Непробиваемая оборонительная форма, превращающая световой меч в плотный щит вокруг тела фехтовальщика.',
    desc: 'Возникшая как ответ на массовое распространение бластеров, Соресу учит держать клинок близко к корпусу, затрачивая минимум энергии и выжидая первой ошибки уставшего противника.\n\n' +
      '• Сильная сторона: выживаемость под шквальным бластерным огнём и удержание натиска превосходящего врага.\n' +
      '• Игровая механика: +2 к КБ в активной стойке и реакция «Отражение выстрела» обратно в стрелка.\n' +
      '• Известные мастера: Оби-Ван Кеноби, Депа Биллаба.'
  },
  form_4_ataru: {
    sec: 'forms',
    icon: '4️⃣',
    name: 'Форма IV: Атару («Путь Ястреба-летучей мыши»)',
    tag: 'Акробатика и Скорость',
    lead: 'Вихревой акробатический стиль, в котором фехтовальщик использует Силу для сверхчеловеческих прыжков, сальто и ударов со всех плоскостей.',
    desc: 'Боец Атару никогда не стоит на месте: он атакует с воздуха, отталкивается от стен и обрушивает град быстрых рубящих ударов прежде, чем враг успеет поднять блок.\n\n' +
      '• Сильная сторона: стремительный натиск на одиночную цель и преодоление препятствий.\n' +
      '• Игровая механика: +3 м к скорости перемещения, отсутствие провоцированных атак в прыжке и +1d8 урона с разбега.\n' +
      '• Известные мастера: Гранд-мастер Йода, Квай-Гон Джинн, Асока Тано.'
  },
  form_5_djemso: {
    sec: 'forms',
    icon: '5️⃣',
    name: 'Форма V: Шиен / Джем Со («Путь Крайт-дракона»)',
    tag: 'Мощь и Контратака',
    lead: 'Силовой стиль, созданный мастерами, которым чистая оборона Соресу казалась недостаточно решительной.',
    desc: 'Делится на две ветви: Шиен специализируется на прицельном рикошете бластерных залпов точно в уязвимые точки стрелков, а Джем Со — на тяжёлых проламывающих ударах сверху вниз, сминающих защиту оппонента.\n\n' +
      '• Сильная сторона: подавление врага грубой физической мощью и превращение каждого блока в сокрушительный ответный удар.\n' +
      '• Игровая механика: при силовом ударе цель проходит спасбросок Силы или теряет +2 КБ, получая дополнительные +2d6 урона.\n' +
      '• Известные мастера: Энакин Скайуокер / Дарт Вейдер, Пло Кун.'
  },
  form_6_niman: {
    sec: 'forms',
    icon: '6️⃣',
    name: 'Форма VI: Ниман («Путь Ранкора») и Джар’Кай',
    tag: 'Баланс + Сила',
    lead: 'Синтез предыдущих пяти форм, позволяющий органично вплетать телекинетические толчки, притяжения и молнии Силы прямо в связки ударов мечом.',
    desc: 'Ниман не имеет уязвимых мест и освобождает разум фехтовальщика для тактического управления полем боя. Также служит базой для техники Джар’Кай (фехтование двумя световыми мечами или двухклинковым посохом).\n\n' +
      '• Сильная сторона: комбинирование атаки световым мечом и применения способности Силы в один ход.\n' +
      '• Известные мастера: Реван, Экзар Кун, Дарт Мол (Джар’Кай / Джуйо).'
  },
  form_7_vaapad: {
    sec: 'forms',
    icon: '7️⃣',
    name: 'Форма VII: Джуйо / Ваапад («Путь Воракра»)',
    tag: 'Ярость на грани Тьмы',
    lead: 'Самая непредсказуемая и свирепая форма фехтования, требующая от бойца подойти к самому краю Тёмной стороны.',
    desc: 'Древний вариант Джуйо использует рваный, хаотичный ритм атак, питаемый яростью. Созданный Мейсом Винду стиль Ваапад превращает бойца в «сверхпроводящую петлю», отражающую тёмную энергию и агрессию противника обратно в него самого.\n\n' +
      '• Игровая механика: расширение диапазона критического удара до 19–20 и +2d8 дополнительного урона.\n' +
      '• Известные мастера: Мейс Винду (Ваапад), Дарт Мол, Гален Марек.'
  },

  /* --- 3. КАЙБЕР-КРИСТАЛЛЫ И КОНСТРУКЦИИ МЕЧЕЙ --- */
  kyber_crystals: {
    sec: 'kyber',
    icon: '💎',
    name: 'Природа Кайбер-кристаллов и Испытание Илума',
    tag: 'Резонанс Силы',
    lead: 'Живые кристаллы, резонирующие с Силой и выбирающие своего владельца через духовный отклик.',
    desc: 'Кайбер-кристаллы встречаются в ледяных пещерах Илума, на Джеде, Тайтоне и Датомире. Изначально бесцветный кристалл обретает свой оттенок в момент первого единения с падаваном.\n\n' +
      '• Фокусировка плазмы: кристалл преобразует энергию диатиевой ячейки в замкнутую дугу раскалённой плазмы, удерживаемую магнитным полем.'
  },
  blade_colors: {
    sec: 'kyber',
    icon: '🌈',
    name: 'Цвета Клинков и их Символизм',
    tag: 'Спектр Кайбера',
    lead: 'От классических синих и зелёных клинков Ордена до редких фиолетовых, белых и чёрного клинка Мандалора.',
    desc: '• Синий: Джедаи-стражи, доблесть, решительность и защита слабых.\n' +
      '• Зелёный: Джедаи-консулы, мудрость, дипломатия и глубокая связь с Живой Силой.\n' +
      '• Жёлтый: Джедаи-часовые и Стража Храма — бдительность, баланс боя и знаний.\n' +
      '• Фиолетовый: редкий кристалл воинов, обуздавших как Светлую, так и Тёмную грань боевого духа.\n' +
      '• Алый (Красный): кристалл, подвергнутый ситхскому ритуалу «кровоточения» (подчинения кристалла через боль, гнев и волю Тёмной стороны).\n' +
      '• Белый: очищенный и исцелённый через Светлую сторону бывший алый кристалл Ситха.\n' +
      '• Чёрный (Тёмный меч — Darksaber): уникальный древний меч Тарра Визслы, созданный первым мандалорцем-джедаем.'
  },
  hilt_types: {
    sec: 'kyber',
    icon: '🗡️',
    name: 'Архитектура Рукоятей и Модификации',
    tag: 'Оружейная',
    lead: 'Конструктивные особенности световых мечей и их игровые бонусы.',
    desc: '• Стандартная одноручная рукоять: универсальный баланс (1d8 / 1d10 энергетического урона в двуручном хвате).\n' +
      '• Изогнутая дуэльная рукоять (Макаши): смещает угол выпада на доли градуса, давая +1 к броскам атаки против одиночного фехтовальщика.\n' +
      '• Двухклинковый световой меч (Посох-меч): позволяет совершать дополнительную атаку вторым лезвием бонусным действием и даёт +1 к КБ при вращении.\n' +
      '• Парные клинки (Шото + основной меч): идеал стиля Джар’Кай для стремительных серий ударов.\n' +
      '• Рукоять с плазменной гардой-перекрестием: защищает кисти в тяжёлом силовом клинче и наносит +1d4 урона при пробивании блока.\n' +
      '• Световой меч-пика (Бескаровое древко): увеличенная досягаемость 3 метра.'
  },

  /* --- 4. ПРИРОДА СИЛЫ И ВЫСШИЕ ТЕХНИКИ --- */
  force_nature: {
    sec: 'force',
    icon: '🌌',
    name: 'Живая и Космическая Сила',
    tag: 'Метафизика',
    lead: 'Энергетическое поле, создаваемое всеми живыми существами: оно окружает нас, пронизывает нас и связывает Галактику воедино.',
    desc: 'Сила проявляется в двух взаимосвязанных аспектах:\n\n' +
      '• Живая Сила (Living Force): энергия жизни здесь и сейчас — эмоции, биологические токи, связь со зверями, исцеление и интуиция.\n' +
      '• Космическая Сила (Cosmic Force): великий замысел вселенной, связывающий пространство и время, источник пророческих видений и сохранения сознания после смерти.\n' +
      '• Полководческая Боевая Медитация (Battle Meditation): редчайший дар Силы (Бастила Шан, Наоми Санрайдер), укрепляющий боевой дух целого флота и ослабляющий волю врагов.'
  },
  dark_alchemy: {
    sec: 'force',
    icon: '⚡',
    name: 'Высшие Техники Тёмной Стороны и Алхимия Ситхов',
    tag: 'Тайны Коррибана',
    lead: 'Искажение природы через концентрированную волю, Молнии Силы, Вытягивание Жизни и ковка ситхских талисманов.',
    desc: 'Лорды Ситхов рассматривают Силу не как союзника, а как инструмент абсолютного господства:\n\n' +
      '• Молния Силы и Шторм Силы: чистая манифестация ненависти, выжигающая нервную систему и электронику.\n' +
      '• Вытягивание Силы (Force Drain): поглощение жизненной энергии и резерва Силы врагов (вершиной которой владел Дарт Нихилус).\n' +
      '• Алхимия Ситхов: закалка металлов и оружия Тёмной стороной (делающая мечи неразрушимыми для плазмы) и выведение боевых чудовищ.'
  },

  /* --- 5. РАСЫ И НАРОДЫ --- */
  races_core: {
    sec: 'races',
    icon: '🧑',
    name: 'Люди, Кореллианцы и Миралука',
    tag: 'Народы Ядра',
    lead: 'Адаптивные первопроходцы Галактики и слепые от рождения мистики, зрящие мир сквозь Силу.',
    desc: '• Люди (Корусант, Альдераан, Набу, Кореллия): самая многочисленная раса Галактики (+1 ко всем характеристикам или дополнительная черта мастерства).\n' +
      '• Миралука (Альферидис / Катарр): гуманоиды без физических глаз, от рождения обладающие Зрением Силы (видят сквозь темноту и иллюзии на 18 м).'
  },
  races_outer: {
    sec: 'races',
    icon: '👽',
    name: 'Тви’леки, Тогруты и Забраки',
    tag: 'Среднее и Внешнее Кольцо',
    lead: 'Изящные обитатели Рилота, охотники с эхолокацией Шили и двусердечные воины Иридонии и Датомира.',
    desc: '• Тви’леки (Рилот): отличаются парными головными отростками «лекку», высокой ловкостью, харизмой и природной грацией.\n' +
      '• Тогруты (Шили): полые рога-монтралы позволяют им пассивно ощущать движение в пространстве вокруг себя (не могут быть застигнуты врасплох).\n' +
      '• Забраки (Иридония / Датомир): знамениты венцом рогов на голове, двумя сердцами и невероятной стойкостью (преимущество против страха и оглушения).'
  },
  races_exotic: {
    sec: 'races',
    icon: '🦁',
    name: 'Чиссы, Вуки, Кел-Дор и Дроиды',
    tag: 'Уникальные виды',
    lead: 'Хладнокровные стратеги Неизведанных Регионов, исполины лесов Кашиика и разумные машины.',
    desc: '• Чиссы (Ксилла): синекожие гуманоиды со светящимися алыми глазами, обладающие инфракрасным зрением и блестящим аналитическим умом.\n' +
      '• Вуки (Кашиик): могучие долгожители, мастера арбалетов-боукастеров и корабельной механики.\n' +
      '• Кел-Дор (Дорин): вынуждены носить дыхательные маски и защитные очки в кислородной атмосфере, славятся обострённым чутьём справедливости (Пло Кун).\n' +
      '• Независимые Дроиды (HK-серия, IG-серия, Астромеханики): иммунны к ядам, вакууму и телепатическим приёмам разума.'
  },

  /* --- 6. ФРАКЦИИ И СИНДИКАТЫ --- */
  factions_galactic: {
    sec: 'factions',
    icon: '🏛️',
    name: 'Галактическая Республика, Империя и Альянс',
    tag: 'Сверхдержавы',
    lead: 'Вечное противостояние демократии Сената, железного порядка Империи и пламени Восстания.',
    desc: '• Галактическая Республика: тысячелетний союз миров Ядра и Колец, опирающийся на дипломатию Сената и миротворцев Ордена Джедаев.\n' +
      '• Галактическая Империя / Империя Ситхов: централизованная военная машина моффов, гранд-адмиралов, Инквизитория и флотов Звёздных Разрушителей.\n' +
      '• Альянс за восстановление Республики: коалиция подпольных ячеек, эскадрилий крестокрылов и разведчиков.'
  },
  factions_underworld: {
    sec: 'factions',
    icon: '🪙',
    name: 'Картель Хаттов, «Чёрное Солнце» и Гильдия Охотников',
    tag: 'Преступный мир',
    lead: 'Истинные хозяева Внешнего Кольца, Нар-Шаддаа и гипермаршрутов контрабанды.',
    desc: '• Картель Хаттов (Каджidic): кланы Нал-Хатты и Татуина, контролирующие торговлю спайсом Кесселя, арены и долговые контракты.\n' +
      '• Синдикат «Чёрное Солнце» и Пайки: могущественная криминальная сеть с крепостями на Корусанте, Оба-Диа и Мустафаре.\n' +
      '• Гильдия Охотников за головами: строго регулируемое братство следопытов, работающее по голо-шайбам и Кодексу Гильдии.'
  },

  /* --- 7. КОРАБЛИ, БРОНЯ И ВООРУЖЕНИЕ --- */
  starships_guide: {
    sec: 'ships',
    icon: '🚀',
    name: 'Звёздные Истребители, Фрахтовики и Гипердрайв',
    tag: 'Космофлот',
    lead: 'От стремительных перехватчиков Ордена и X-Wing до легендарных кореллианских кораблей серии YT.',
    desc: '• Перехватчики и Истребители: Дельта-7 и Эта-2 «Актис» (требующие рефлексов Джедая), T-65 X-Wing, TIE Defender и мандалорский «Клык».\n' +
      '• Лёгкие фрахтовики и корветы: YT-1300 («Тысячелетний сокол»), «Эбеновый ястреб» (Dynamic-class), «Лезвие бритвы» (ST-70) и «Фурия» ситхов-инквизиторов.\n' +
      '• Классы гипердвигателя: чем ниже число (Класс 0.5 — 1.0 у лучших кораблей), тем быстрее судно преодолевает гипермаршруты Галактики.'
  },
  armor_weapons: {
    sec: 'ships',
    icon: '🛡️',
    name: 'Бескар, Кортозис, Бластеры и Экипировка',
    tag: 'Арсенал',
    lead: 'Материалы, способные остановить световой меч, и вооружение стрелков Внешнего Кольца.',
    desc: '• Бескар (Мандалорское железо): отражает бластерные импульсы и выдерживает удары светового меча.\n' +
      '• Кортозис и Фрик: редкие сплавы; чистый кортозис при контакте вызывает короткое замыкание матрицы светового меча, временно гася клинок.\n' +
      '• Стрелковое оружие: тяжёлые бластерные пистолеты DL-44, мандалорские парные WESTAR-35, снайперские дизрапторы амбан и арбалеты Вуки.\n' +
      '• Тактические средства: термальные детонаторы (урон 6d6 огнём/силой в радиусе 6 м), стимуляторы с бактой (мгновенное лечение 2d8+2 ХП) и персональные дефлекторные щиты.'
  },

  /* --- 8. БЕСТИАРИЙ ГАЛАКТИКИ --- */
  beasts_iconic: {
    sec: 'beasts',
    icon: '🦖',
    name: 'Ранкор, Крайт-дракон и Сарлакк',
    tag: 'Высшие хищники',
    lead: 'Легендарные чудовища Датомира и пустынь Татуина.',
    desc: '• Ранкор (Датомир / Оттом): пятиметровый бронированный гигант с чудовищной хваткой; Сёстры Ночи приручают их как боевых скакунов.\n' +
      '• Большой Крайт-дракон (Татуин): исполинский подземный левиафан Дюнного моря, в желудке которого формируются драгоценные драконьи жемчужины (пригодные для фокусировки светового меча).\n' +
      '• Сарлакк (Большая яма Каркуна): древнее всеядное существо с кольцами щупалец и клювом в песках Татуина.'
  },
  beasts_force: {
    sec: 'beasts',
    icon: '🐉',
    name: 'Терентатек, Исаламири, Воракр и Пурргилы',
    tag: 'Существа Силы',
    lead: 'Охотники на адептов Силы, нейтрализаторы энергетического поля и космические киты гиперпространства.',
    desc: '• Терентатек (Коррибан / Кашиик): порождение Тёмной стороны с шипастой шкурой, устойчивой к Силе, питающееся кровью чувствительных к Силе существ.\n' +
      '• Исаламири (Миркр): древесные ящерицы, создающие вокруг себя «пузырь», внутри которого невозможно использовать способности Силы (использовались гранд-адмиралом Трауном).\n' +
      '• Воракр (Миркр): свирепые хищники, охотящиеся с помощью собственного чутья Силы.\n' +
      '• Пурргилы: полумифические космические создания, природно совершающие прыжки сквозь гиперпространство.'
  }
};

function swRef() {
  applyStarWarsTheme();
  var isSith = SW.getTheme() === 'sith';
  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Справочник' }
  ]);

  var sectionsHtml = SW_REF_SECTIONS.map(function(sec) {
    var keys = Object.keys(SW_REF).filter(function(k) { return SW_REF[k].sec === sec.id; });
    var itemsHtml = keys.map(function(k) {
      var it = SW_REF[k];
      return '<div class="sw-ref-card" data-sw-ref-key="' + esc(k) + '" style="cursor:pointer;">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;">' +
          '<div class="sw-ref-card-k">' + (it.icon || (isSith ? '🔺' : '🔷')) + ' ' + esc(it.name) + '</div>' +
          '<span class="sw-stat-badge" style="font-size:11px;">' + esc(it.tag) + '</span>' +
        '</div>' +
        '<div class="sw-ref-card-v" style="font-size:12.5px;color:var(--sw-muted);">' + esc(it.lead) + '</div>' +
      '</div>';
    }).join('');

    return '<div class="sw-char-sheet-card" style="margin-bottom:20px;">' +
      '<div class="sw-char-header">' +
        '<span>' + sec.icon + ' ' + esc(sec.title) + '</span>' +
        '<span style="font-size:12px;color:var(--sw-accent);">' + keys.length + ' стат.</span>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:10px;margin-top:12px;">' +
        itemsHtml +
      '</div>' +
    '</div>';
  }).join('');

  var totalTopics = Object.keys(SW_REF).length;

  var html =
    '<button class="back" id="swRefBackHome">← Назад</button>' +
    '<div style="margin-bottom:14px;">' +
      '<h1 style="margin-bottom:4px;">' + (isSith ? '🔺 Справочник Великого Голокрона' : '🔷 Справочник Великого Голокрона') + '</h1>' +
      '<div class="desc" style="margin-bottom:0;">Подробная энциклопедия Далёкой-далёкой Галактики: ' + SW_REF_SECTIONS.length + ' тематических разделов (' + totalTopics + ' статей) — Ордена Джедаев и Ситхов, Кредо Мандалора, все 7 Форм фехтования на световых мечах, кайбер-кристаллы, высшие техники Силы, расы, фракции, корабли и бестиарий.</div>' +
    '</div>' +
    '<div class="sw-ref-search-wrap" style="margin-bottom:16px;">' +
      '<span class="sw-ref-search-icon">🔍</span>' +
      '<input type="text" id="swRefSearch" class="sw-ref-search-input" placeholder="Поиск по всему Голокрону (Макаши, Соресу, Ваапад, бескар, кайбер, ситхи, расы, корабли)..." autocomplete="off">' +
    '</div>' +
    '<div id="swRefSearchResults" style="display:none;margin-bottom:20px;"></div>' +
    '<div id="swRefDefaultContainer">' +
      sectionsHtml +
    '</div>';

  mount(html);

  document.getElementById('swRefBackHome').addEventListener('click', function() {
    go({ screen: 'swHome' });
  });

  function bindRefCards(container) {
    (container || document).querySelectorAll('[data-sw-ref-key]').forEach(function(card) {
      card.addEventListener('click', function() {
        go({ screen: 'swRefView', id: card.getAttribute('data-sw-ref-key') });
      });
    });
  }
  bindRefCards(document);

  var searchInp = document.getElementById('swRefSearch');
  var resultsBox = document.getElementById('swRefSearchResults');
  var defaultBox = document.getElementById('swRefDefaultContainer');
  if (searchInp && resultsBox && defaultBox) {
    searchInp.addEventListener('input', function() {
      var q = (searchInp.value || '').toLowerCase().trim();
      if (!q) {
        resultsBox.style.display = 'none';
        defaultBox.style.display = 'block';
        return;
      }
      var matched = Object.keys(SW_REF).filter(function(k) {
        var it = SW_REF[k];
        var hay = (it.name + ' ' + it.tag + ' ' + it.lead + ' ' + it.desc).toLowerCase();
        return hay.indexOf(q) !== -1;
      });
      defaultBox.style.display = 'none';
      resultsBox.style.display = 'block';
      if (!matched.length) {
        resultsBox.innerHTML = '<div class="sw-char-sheet-card"><div style="color:var(--sw-muted);text-align:center;padding:18px;">По запросу «' + esc(searchInp.value) + '» в архивах Голокрона ничего не найдено.</div></div>';
        return;
      }
      resultsBox.innerHTML =
        '<div class="sw-char-sheet-card">' +
          '<div class="sw-char-header"><span>🔍 Результаты поиска в Голокроне</span><span style="font-size:12px;color:var(--sw-accent);">Найдено: ' + matched.length + '</span></div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:10px;margin-top:12px;">' +
            matched.map(function(k) {
              var it = SW_REF[k];
              return '<div class="sw-ref-card" data-sw-ref-key="' + esc(k) + '" style="cursor:pointer;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;">' +
                  '<div class="sw-ref-card-k">' + (it.icon || (isSith ? '🔺' : '🔷')) + ' ' + esc(it.name) + '</div>' +
                  '<span class="sw-stat-badge" style="font-size:11px;">' + esc(it.tag) + '</span>' +
                '</div>' +
                '<div class="sw-ref-card-v" style="font-size:12.5px;color:var(--sw-muted);">' + esc(it.lead) + '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>';
      bindRefCards(resultsBox);
    });
  }
}

function swRefView(refKey) {
  applyStarWarsTheme();
  var item = SW_REF[refKey];
  if (!item) {
    // Поддержка старых ключей разделов, если передан id секции
    var firstKey = Object.keys(SW_REF).find(function(k) { return SW_REF[k].sec === refKey; });
    item = firstKey ? SW_REF[firstKey] : null;
  }
  if (!item) { swRef(); return; }

  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Справочник', nav: 'swRef' },
    { label: item.name }
  ]);

  var html =
    '<button class="back" id="swBackRefBtn">← К справочнику</button>' +
    '<div class="sw-char-sheet-card" style="margin-top:12px;">' +
      '<div class="sw-char-header" style="font-size:20px;">' +
        '<span>' + (item.icon || '🔷') + ' ' + esc(item.name) + '</span>' +
        '<div style="display:flex;gap:8px;align-items:center;">' +
          '<span class="sw-stat-badge" style="font-size:12px;">' + esc(item.tag) + '</span>' +
          '<button class="btn btn-ghost" id="swCopyLoreBtn" style="font-size:11.5px;padding:4px 10px;">📋 Скопировать</button>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:15px;line-height:1.6;color:var(--sw-accent-bright);font-style:italic;margin-top:12px;margin-bottom:14px;border-left:3px solid var(--sw-accent);padding-left:12px;">' +
        esc(item.lead) +
      '</div>' +
      '<div style="font-size:14.5px;line-height:1.7;color:#e2edf8;white-space:pre-line;">' +
        esc(item.desc) +
      '</div>' +
    '</div>';

  mount(html);

  document.getElementById('swBackRefBtn').addEventListener('click', function() {
    go({ screen: 'swRef' });
  });
  var copyBtn = document.getElementById('swCopyLoreBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      var text = item.name + ' (' + item.tag + ')\n' + item.lead + '\n\n' + item.desc;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          copyBtn.textContent = '✓ Скопировано';
        });
      }
    });
  }
}

/* ==========================================================================
   6. КАРТА ГАЛАКТИКИ 4000×4000 (swMap) — АТЛАС 200 МИРОВ + АРХИВ PDF (6 755 СИСТЕМ) + НАВИКОМПЬЮТЕР
   ========================================================================== */
var swMapState = {
  mode: 'inspect', // 'inspect' | 'archive' | 'route' | 'markers'
  selectedId: 'coruscant',
  regionFilter: 'all',
  typeFilter: 'all',
  searchQuery: '',
  // Архив PDF (6 755 систем)
  pdfSearch: '',
  pdfRegionFilter: 'all',
  selectedGrid: 'L-9',
  highlightedPdfSys: null,
  // Слои карты
  showPins: true,
  showLabels: true,
  showRoutes: false,
  showGrid: false,
  showUserMarkers: true,
  // Навигационный компьютер (Гиперпрыжки)
  routeWaypoints: ['coruscant', 'corellia', 'tatooine'],
  hyperdriveClass: 1.0,
  astrogationMode: 'standard', // 'lane' | 'standard' | 'blind' | 'smuggler'
  lastEncounterText: '',
  lastHookText: '',
  // Полноэкранный режим и камера
  isFullscreen: false,
  camInit: false,
  tx: 0,
  ty: 0,
  scale: 0.34,
  // Пользовательские тактические метки (чистая карта по умолчанию)
  editingMarkerId: null
};

var SW_CUSTOM_MARKERS_KEY = 'sw_galaxy_custom_markers_v1';

function swLoadCustomMarkers() {
  try {
    var raw = localStorage.getItem(SW_CUSTOM_MARKERS_KEY);
    if (!raw) return [];
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function swSaveCustomMarkers(arr) {
  try {
    localStorage.setItem(SW_CUSTOM_MARKERS_KEY, JSON.stringify(arr || []));
  } catch (e) {}
}

var SW_MARKER_TYPES = [
  { id: 'fleet', icon: '🚀', label: 'Флот / Эскадра', color: '#38bdf8' },
  { id: 'base', icon: '🛡️', label: 'База / Аванпост', color: '#10b981' },
  { id: 'battle', icon: '⚔️', label: 'Поле битвы / Осада', color: '#ef4444' },
  { id: 'bounty', icon: '💀', label: 'Цель / Охота', color: '#f97316' },
  { id: 'holocron', icon: '🏛️', label: 'Храм / Артефакт Силы', color: '#c084fc' },
  { id: 'smuggler', icon: '📦', label: 'Тайник / Контрабанда', color: '#facc15' }
];

var SW_PLANET_TYPE_LABELS = {
  capital: { label: 'Столицы и центры секторов', badge: '👑 Столица / Узел' },
  force:   { label: 'Святыни и миры Силы', badge: '☯️ Локус Силы' },
  fortress:{ label: 'Крепости и военные базы', badge: '🛡️ Цитадель / База' },
  industry:{ label: 'Верфи, кузницы и рудники', badge: '🏭 Верфь / Индустрия' },
  city:    { label: 'Колонии и космопорты', badge: '🌆 Мир / Космопорт' }
};

var SW_CANONICAL_ROUTES = [
  { name: '① Перлемианский путь (Корусант ➔ Оссус ➔ Мон-Кала)', ids: ['coruscant', 'anaxes', 'brentaal', 'ralltiir', 'carida', 'lantillies', 'roche', 'ossus', 'felucia', 'raxus', 'mon_cala'] },
  { name: '② Кореллианский путь (Корусант ➔ Кореллия ➔ Татуин ➔ Рилот)', ids: ['coruscant', 'corellia', 'byblos', 'allanteen', 'druckenwell', 'christophsis', 'rodia', 'tatooine', 'geonosis', 'ryloth'] },
  { name: '③ Кореллианский хребет (Кореллия ➔ Фондор ➔ Беспин ➔ Хот)', ids: ['corellia', 'duro', 'fondor', 'bestine', 'thyferra', 'yag_dhul', 'belsavis', 'bespin', 'hoth'] },
  { name: '⑤ Хайдианский супермаршрут (Бонадан ➔ Мандалор ➔ Корусант ➔ Мустафар)', ids: ['bonadan', 'cantonica', 'serenno', 'taris', 'mandalore', 'brentaal', 'coruscant', 'chandrila', 'malastare', 'eriadu', 'mustafar', 'polis_massa'] },
  { name: '⚡ Дуга Кесселя и Хатты (Кристофсис ➔ Нар-Шаддаа ➔ Кессель)', ids: ['christophsis', 'scarif', 'circumtore', 'nal_hutta', 'ylesia', 'sleheyron', 'kessel'] },
  { name: '☯️ Путь Джедаев и Ситхов (Тайтон ➔ Джеда ➔ Илум ➔ Ак-То ➔ Морабанд)', ids: ['tython', 'coruscant', 'jedha', 'ilum', 'ahch_to', 'ossus', 'moraband', 'malachor', 'exegol'] }
];

var SW_HYPERSPACE_ENCOUNTERS = [
  '🚨 Гравитационная тень! Крейсер-заградитель типа «Иммобилайзер-418» активировал генераторы гравитационных колодцев и вырвал ваш корабль из гиперпространства. До прибытия патруля TIE-истребителей — 3 раунда!',
  '🐋 В иллюминаторах гипертуннеля показалась стая звёздных китов — пёрргилов! Их естественные био-гиперпрыжки создают мощный резонанс в Силе: навигатор получает Преимущество на следующую проверку Астронавигации.',
  '⚡ Нестабильный вихрь масс-тени! На маршруте вспыхнула блуждающая гравитационная аномалия. Требуется проверка Пилотирования (КС 15), иначе гипердвигатель получит перегрузку охлаждающего контура.',
  '🏴‍☠️ Сигнал бедствия на частотах Старой Республики: дрейфующий грузовой фрегат с отключённым транспондером. На борту могут быть ценные контейнеры коаксиума... или засада пиратов Хондо Онаки.',
  '✨ Чистый гиперкоридор! Навигационный компьютер рассчитал идеальный вектор сквозь гравитационные колодцы сектора — расход гипертоплива снижен на 15%, прыжок проходит без помех.',
  '🛰️ Древний ретранслятор эпохи Расцвета Республики передаёт зашифрованные координаты забытого аванпоста в соседнем квадрате сетки.'
];

function swGetPlanets() {
  return window.SW_MAP_PLANETS || [];
}

function swGetRegionMap() {
  var list = window.SW_GALAXY_REGIONS || [];
  var map = {};
  for (var i = 0; i < list.length; i++) map[list[i].id] = list[i];
  return map;
}

function swGeneratePlanetHook(p) {
  var hooks = [
    'На орбите мира «' + p.name + '» (квадрат ' + p.grid + ') перехвачена зашифрованная передача фракции «' + p.faction + '». Местный связной готов продать коды доступа к закрытому посадочному доку за 2 500 кредитов или услугу.',
    'В космопорте системы «' + p.name + '» (сектор ' + p.sector + ') заблокирован грузовой корабль с партией необработанного коаксиума и древним голокроном. Охотники за головами уже оцепили периметр.',
    'Секретная миссия в мире «' + p.name + '»: климатические условия (' + p.climate.toLowerCase() + ') вывели из строя сенсоры аванпоста. Отряду необходимо проникнуть на объект до прибытия подкрепления.',
    'Древний навигационный маяк на маршруте «' + p.route + '» у планеты «' + p.name + '» пробудился и указывает координаты затерянного крейсера времён Старой Республики в квадрате ' + p.grid + '.'
  ];
  return hooks[Math.floor(Math.random() * hooks.length)];
}

function swFocusCameraOn(px, py, targetScale) {
  var vp = document.getElementById('swMapViewport');
  var w = vp ? vp.clientWidth : 960;
  var h = vp ? vp.clientHeight : 640;
  var sc = targetScale || Math.max(swMapState.scale, 0.85);
  sc = Math.max(0.20, Math.min(5.5, sc));
  swMapState.scale = sc;
  swMapState.tx = (w / 2) - px * sc;
  swMapState.ty = (h / 2) - py * sc;
  swMapState.camInit = true;
}

function swFitFullGalaxy() {
  var vp = document.getElementById('swMapViewport');
  var w = vp ? vp.clientWidth : 960;
  var h = vp ? vp.clientHeight : 640;
  var sc = Math.min(w / 3200, h / 3200);
  sc = Math.max(0.20, Math.min(0.55, sc));
  swMapState.scale = sc;
  swMapState.tx = (w / 2) - 2080 * sc;
  swMapState.ty = (h / 2) - 2240 * sc;
  swMapState.camInit = true;
}

function swMap() {
  applyStarWarsTheme();
  var isSith = SW.getTheme() === 'sith';
  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Карта Галактики' }
  ]);

  var planets = swGetPlanets();
  var regMap = swGetRegionMap();
  var atlas = window.SW_GALAXY_ATLAS;
  var customMarkers = swLoadCustomMarkers();

  var selected = planets.find(function(p) { return p.id === swMapState.selectedId; }) || planets[0];
  if (selected && !swMapState.selectedGrid) {
    swMapState.selectedGrid = selected.grid;
  }

  // Фильтрация 200 курируемых планет
  var qLower = (swMapState.searchQuery || '').trim().toLowerCase();
  var filteredPlanets = planets.filter(function(p) {
    if (swMapState.regionFilter !== 'all' && p.region !== swMapState.regionFilter) return false;
    if (swMapState.typeFilter !== 'all' && p.type !== swMapState.typeFilter) return false;
    if (qLower) {
      var mName = p.name.toLowerCase().indexOf(qLower) !== -1;
      var mEn = p.en.toLowerCase().indexOf(qLower) !== -1;
      var mGrid = p.grid.toLowerCase().indexOf(qLower) !== -1;
      var mSec = (p.sector || '').toLowerCase().indexOf(qLower) !== -1;
      var mDesc = (p.desc || '').toLowerCase().indexOf(qLower) !== -1;
      if (!mName && !mEn && !mGrid && !mSec && !mDesc) return false;
    }
    return true;
  });

  // Сборка SVG-слоя сетки C-1..U-21 (если включена сетка или режим Архива PDF)
  var gridOverlaySvg = '';
  var showGridNow = swMapState.showGrid || swMapState.mode === 'archive';
  if (showGridNow && atlas) {
    var gridCounts = atlas.getGridCounts();
    var cols = 'CDEFGHIJKLMNOPQRSTU'.split('');
    var cellsArr = [];
    for (var ci = 0; ci < cols.length; ci++) {
      for (var rNum = 1; rNum <= 21; rNum++) {
        var gCode = cols[ci] + '-' + rNum;
        var box = atlas.gridToBox(gCode);
        if (!box) continue;
        var cnt = gridCounts[gCode] || 0;
        var isSelGrid = (swMapState.selectedGrid === gCode);
        cellsArr.push(
          '<g class="sw-grid-cell-group" data-sw-grid="' + gCode + '">' +
            '<rect class="sw-grid-cell-rect' + (isSelGrid ? ' active' : '') + '" x="' + box.x1 + '" y="' + box.y1 + '" width="' + box.size + '" height="' + box.size + '"/>' +
            '<text x="' + (box.x1 + 8) + '" y="' + (box.y1 + 20) + '" fill="' + (isSelGrid ? '#fde047' : 'rgba(186,230,253,0.75)') + '" font-size="15" font-family="JetBrains Mono,monospace" font-weight="700" pointer-events="none">' + gCode + '</text>' +
            (cnt > 0 ? '<text x="' + (box.x2 - 8) + '" y="' + (box.y1 + 20) + '" text-anchor="end" fill="' + (isSelGrid ? '#fde047' : 'rgba(56,189,248,0.8)') + '" font-size="13" font-family="JetBrains Mono,monospace" pointer-events="none">' + cnt + '✦</text>' : '') +
          '</g>'
        );
      }
    }
    gridOverlaySvg = '<g id="swSvgGridLayer">' + cellsArr.join('') + '</g>';
  } else if (swMapState.selectedGrid && atlas && swMapState.mode === 'archive') {
    var sBox = atlas.gridToBox(swMapState.selectedGrid);
    if (sBox) {
      gridOverlaySvg = '<rect class="sw-grid-cell-rect active" x="' + sBox.x1 + '" y="' + sBox.y1 + '" width="' + sBox.size + '" height="' + sBox.size + '"/>';
    }
  }

  // Сборка SVG-слоя 5 Великих торговых гипермаршрутов
  var tradeRoutesSvg = '';
  if (swMapState.showRoutes && window.SW_TRADE_ROUTES) {
    tradeRoutesSvg = '<g id="swSvgTradeRoutes" pointer-events="none">' +
      window.SW_TRADE_ROUTES.map(function(tr) {
        if (!tr.points || tr.points.length < 2) return '';
        var ptsStr = tr.points.map(function(pt) { return pt[0] + ',' + pt[1]; }).join(' ');
        var midPt = tr.points[Math.floor(tr.points.length / 2)];
        return '<g>' +
          '<polyline points="' + ptsStr + '" fill="none" stroke="' + tr.color + '" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" opacity="0.22"/>' +
          '<polyline class="sw-route-line" points="' + ptsStr + '" fill="none" stroke="' + tr.color + '" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.92"/>' +
          '<g transform="translate(' + midPt[0] + ',' + (midPt[1] - 18) + ')">' +
            '<rect x="-110" y="-14" width="220" height="22" rx="6" fill="rgba(2,6,23,0.86)" stroke="' + tr.color + '" stroke-width="1.5"/>' +
            '<text x="0" y="1" text-anchor="middle" fill="' + tr.color + '" font-size="12" font-weight="700">' + esc(tr.num + ' ' + tr.name) + '</text>' +
          '</g>' +
        '</g>';
      }).join('') +
    '</g>';
  }

  // Сборка SVG-слоя проложенного маршрута Навикомпьютера
  var activeRouteSvg = '';
  var routeStats = { totalLy: 0, totalParsecs: 0, segments: [], hazards: [] };
  var pById = {};
  for (var pi = 0; pi < planets.length; pi++) pById[planets[pi].id] = planets[pi];

  if (swMapState.routeWaypoints && swMapState.routeWaypoints.length >= 2) {
    var wpObjs = swMapState.routeWaypoints.map(function(id) { return pById[id]; }).filter(Boolean);
    if (wpObjs.length >= 2) {
      var segSvg = [];
      var lyPerPx = atlas ? atlas.lyPerPx : (5000 / 145.5926);
      for (var wi = 0; wi < wpObjs.length - 1; wi++) {
        var a = wpObjs[wi];
        var b = wpObjs[wi + 1];
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        var distPx = Math.sqrt(dx * dx + dy * dy);
        var distLy = Math.round(distPx * lyPerPx);
        var distPc = Math.round(distLy / 3.26156);
        routeStats.totalLy += distLy;
        routeStats.totalParsecs += distPc;
        routeStats.segments.push({ from: a, to: b, ly: distLy, pc: distPc });
        if (a.region === 'deep_core' || b.region === 'deep_core') {
          routeStats.hazards.push('🕳️ Гравитационные аномалии Глубокого Ядра (+5 к КС Астронавигации)');
        }
        if (a.region === 'unknown' || b.region === 'unknown') {
          routeStats.hazards.push('🌌 Барьеры Неизведанных Регионов (требуется путеводник Силы или расчёт Небесных странниц)');
        }
        if (a.region === 'hutt_corp' || b.region === 'hutt_corp') {
          routeStats.hazards.push('🐌 Таможенные патрули Картеля Хаттов и синдикатов');
        }
        var mx = (a.x + b.x) / 2;
        var my = (a.y + b.y) / 2;
        segSvg.push(
          '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="rgba(250,204,21,0.28)" stroke-width="14" stroke-linecap="round"/>' +
          '<line class="sw-active-route-line" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="#facc15" stroke-width="5.5" stroke-linecap="round"/>' +
          '<g transform="translate(' + mx + ',' + my + ')">' +
            '<rect x="-68" y="-13" width="136" height="24" rx="7" fill="rgba(2,6,23,0.92)" stroke="#facc15" stroke-width="1.8"/>' +
            '<text x="0" y="3" text-anchor="middle" fill="#fef08a" font-size="12.5" font-family="JetBrains Mono,monospace" font-weight="700">' + distLy.toLocaleString('ru-RU') + ' св.л.</text>' +
          '</g>'
        );
      }
      for (var wj = 0; wj < wpObjs.length; wj++) {
        var wp = wpObjs[wj];
        segSvg.push(
          '<g transform="translate(' + wp.x + ',' + wp.y + ')">' +
            '<circle r="19" fill="none" stroke="#facc15" stroke-width="3" stroke-dasharray="6 4"/>' +
            '<circle r="11" fill="#facc15" stroke="#020617" stroke-width="2.5"/>' +
            '<text x="0" y="4" text-anchor="middle" fill="#020617" font-size="12" font-weight="900">' + (wj + 1) + '</text>' +
          '</g>'
        );
      }
      if (swMapState.mode === 'route' || swMapState.showRoutes) {
        activeRouteSvg = '<g id="swSvgActiveRoute" pointer-events="none">' + segSvg.join('') + '</g>';
      }
    }
  }

  // Сборка SVG-слоя маркеров 200 курируемых планет
  var filteredIds = {};
  for (var fi = 0; fi < filteredPlanets.length; fi++) filteredIds[filteredPlanets[fi].id] = true;

  var pinsSvg = '';
  if (swMapState.showPins) {
    pinsSvg = '<g id="swSvgPlanetPins">' +
      planets.map(function(p) {
        var isMatch = !!filteredIds[p.id];
        if (!isMatch && (swMapState.regionFilter !== 'all' || swMapState.typeFilter !== 'all' || qLower)) {
          return '';
        }
        var isSel = selected && (p.id === selected.id);
        var regInfo = regMap[p.region] || { color: '#38bdf8' };
        var col = regInfo.color || '#38bdf8';
        var r = isSel ? 12 : (p.type === 'capital' || p.type === 'force' ? 7.5 : 6);
        var labelHtml = '';
        if (swMapState.showLabels || isSel) {
          var shortRu = p.name.split(' (')[0];
          labelHtml =
            '<g transform="translate(' + p.x + ',' + (p.y - r - 9) + ')" pointer-events="none">' +
              '<rect x="' + (-shortRu.length * 4.4 - 8) + '" y="-13" width="' + (shortRu.length * 8.8 + 16) + '" height="19" rx="5" fill="rgba(2,6,23,' + (isSel ? '0.92' : '0.78') + ')" stroke="' + (isSel ? '#ffffff' : col) + '" stroke-width="' + (isSel ? '1.8' : '1') + '"/>' +
              '<text x="0" y="1" text-anchor="middle" fill="' + (isSel ? '#ffffff' : '#f1f5f9') + '" font-size="' + (isSel ? '13.5' : '11.5') + '" font-weight="700">' + esc(shortRu) + '</text>' +
            '</g>';
        }
        return '<g class="sw-planet-node" data-sw-planet="' + esc(p.id) + '">' +
          (isSel
            ? '<circle cx="' + p.x + '" cy="' + p.y + '" r="26" fill="rgba(56,189,248,0.15)" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="6 4"/>' +
              '<circle cx="' + p.x + '" cy="' + p.y + '" r="18" fill="none" stroke="' + col + '" stroke-width="2"/>'
            : '') +
          '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + r + '" fill="' + col + '" stroke="#020617" stroke-width="2.2"/>' +
          labelHtml +
        '</g>';
      }).join('') +
    '</g>';
  }

  // Радарный маяк выбранной системы из Архива PDF (если она не входит в 200 курируемых)
  var pdfBeaconSvg = '';
  if (swMapState.highlightedPdfSys && atlas) {
    var bBox = atlas.gridToBox(swMapState.highlightedPdfSys.grid);
    if (bBox) {
      pdfBeaconSvg =
        '<g id="swSvgPdfBeacon" pointer-events="none" transform="translate(' + bBox.cx + ',' + bBox.cy + ')">' +
          '<circle r="38" fill="rgba(250,204,21,0.16)" stroke="#facc15" stroke-width="3" stroke-dasharray="8 5"/>' +
          '<circle r="10" fill="#facc15" stroke="#020617" stroke-width="2.5"/>' +
          '<rect x="-120" y="-44" width="240" height="26" rx="7" fill="rgba(2,6,23,0.94)" stroke="#facc15" stroke-width="2"/>' +
          '<text x="0" y="-26" text-anchor="middle" fill="#fde047" font-size="13.5" font-weight="700">📡 ' + esc(swMapState.highlightedPdfSys.system) + ' [' + esc(swMapState.highlightedPdfSys.grid) + ']</text>' +
        '</g>';
    }
  }

  // Сборка SVG-слоя пользовательских меток и флотов
  var customMarkersSvg = '';
  if (swMapState.showUserMarkers && customMarkers.length > 0) {
    customMarkersSvg = '<g id="swSvgCustomMarkers">' +
      customMarkers.map(function(m) {
        var mType = SW_MARKER_TYPES.find(function(t) { return t.id === m.type; }) || SW_MARKER_TYPES[0];
        var isEdit = (swMapState.editingMarkerId === m.id);
        return '<g class="sw-planet-node" data-sw-marker="' + esc(m.id) + '" transform="translate(' + m.x + ',' + m.y + ')">' +
          (isEdit ? '<circle r="26" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="5 4"/>' : '') +
          '<circle r="15" fill="rgba(2,6,23,0.9)" stroke="' + mType.color + '" stroke-width="3"/>' +
          '<text x="0" y="5" text-anchor="middle" font-size="15">' + mType.icon + '</text>' +
          '<g transform="translate(0,-24)">' +
            '<rect x="-85" y="-12" width="170" height="20" rx="5" fill="rgba(2,6,23,0.92)" stroke="' + mType.color + '" stroke-width="1.5"/>' +
            '<text x="0" y="2" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="700">' + esc(m.title) + '</text>' +
          '</g>' +
        '</g>';
      }).join('') +
    '</g>';
  }

  // Формирование нижней панели в зависимости от активного режима
  var bottomPanelHtml = '';

  if (swMapState.mode === 'inspect') {
    var selReg = selected ? (regMap[selected.region] || {}) : {};
    var selTypeObj = selected ? (SW_PLANET_TYPE_LABELS[selected.type] || { badge: '🪐 Мир' }) : { badge: '🪐 Мир' };
    var gridSysList = (selected && atlas) ? atlas.getSystemsInGrid(selected.grid) : [];

    bottomPanelHtml =
      '<div class="sw-map-panels-grid">' +
        '<!-- Левая колонка: Досье выбранного мира -->' +
        '<div class="sw-char-sheet-card">' +
          (selected ? (
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap">' +
              '<div>' +
                '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
                  '<span style="font-size:24px">' + selected.icon + '</span>' +
                  '<h2 style="margin:0;font-size:20px;color:#fff">' + esc(selected.name) + '</h2>' +
                  '<span class="sw-grid-badge" title="Квадрат астрографической сетки">Сетка ' + esc(selected.grid) + '</span>' +
                '</div>' +
                '<div style="font-size:12.5px;color:#94a3b8;margin-top:3px">' +
                  'Оригинал в Атласе: <strong style="color:#e2e8f0">' + esc(selected.en) + '</strong> • Координаты на карте 4000×4000: <code>[' + selected.x + ', ' + selected.y + ']</code>' +
                '</div>' +
              '</div>' +
              '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
                '<span class="sw-role-badge" style="border-color:' + (selReg.color || '#38bdf8') + ';color:' + (selReg.color || '#38bdf8') + '">' + esc(selected.regionName) + '</span>' +
                '<span class="sw-role-badge">' + esc(selTypeObj.badge) + '</span>' +
              '</div>' +
            '</div>' +

            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin-top:12px">' +
              '<div style="padding:8px 10px;border-radius:8px;background:rgba(15,23,42,0.65);border:1px solid rgba(56,189,248,0.18)">' +
                '<div style="font-size:11px;color:#94a3b8;text-transform:uppercase">Официальный сектор (PDF)</div>' +
                '<div style="font-size:13.5px;color:#f8fafc;font-weight:600;margin-top:2px">📡 ' + esc(selected.sector || 'Не указан') + '</div>' +
              '</div>' +
              '<div style="padding:8px 10px;border-radius:8px;background:rgba(15,23,42,0.65);border:1px solid rgba(56,189,248,0.18)">' +
                '<div style="font-size:11px;color:#94a3b8;text-transform:uppercase">Фракция / Контроль</div>' +
                '<div style="font-size:13.5px;color:#f8fafc;font-weight:600;margin-top:2px">🏛️ ' + esc(selected.faction) + '</div>' +
              '</div>' +
              '<div style="padding:8px 10px;border-radius:8px;background:rgba(15,23,42,0.65);border:1px solid rgba(56,189,248,0.18)">' +
                '<div style="font-size:11px;color:#94a3b8;text-transform:uppercase">Климат и биосфера</div>' +
                '<div style="font-size:13.5px;color:#f8fafc;font-weight:600;margin-top:2px">🌡️ ' + esc(selected.climate) + '</div>' +
              '</div>' +
              '<div style="padding:8px 10px;border-radius:8px;background:rgba(15,23,42,0.65);border:1px solid rgba(56,189,248,0.18)">' +
                '<div style="font-size:11px;color:#94a3b8;text-transform:uppercase">Гипермаршрут / Коридор</div>' +
                '<div style="font-size:13.5px;color:#f8fafc;font-weight:600;margin-top:2px">🛤️ ' + esc(selected.route) + '</div>' +
              '</div>' +
            '</div>' +

            '<div style="margin-top:12px;padding:11px 13px;border-radius:10px;background:rgba(2,6,23,0.55);border-left:3px solid ' + (selReg.color || '#38bdf8') + ';font-size:14px;color:#e2edf8;line-height:1.65">' +
              esc(selected.desc) +
            '</div>' +

            '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">' +
              '<button class="sw-btn sw-btn-primary" id="swBtnFocusSelected">🎯 Приблизить на карте</button>' +
              '<button class="sw-btn" id="swBtnInspectGridPdf">📡 Все системы квадрата ' + esc(selected.grid) + ' в PDF (' + gridSysList.length + ')</button>' +
              '<button class="sw-btn" id="swBtnAddSelectedToRoute">🧭 + В маршрут прыжка</button>' +
              '<button class="sw-btn" id="swBtnGenHook">🎲 Зацепка миссии</button>' +
            '</div>' +
            (swMapState.lastHookText
              ? '<div style="margin-top:10px;padding:10px 12px;border-radius:9px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.4);color:#fde68a;font-size:13px;line-height:1.5"><strong>🎲 Сюжетная зацепка:</strong> ' + esc(swMapState.lastHookText) + '</div>'
              : '')
          ) : '<div>Планета не выбрана</div>') +
        '</div>' +

        '<!-- Правая колонка: Поиск и фильтр по 200 мирам -->' +
        '<div class="sw-char-sheet-card">' +
          '<div class="sw-char-header" style="margin-bottom:8px">' +
            '<span>🪐 Каталог систем на карте (' + filteredPlanets.length + ' из ' + planets.length + ')</span>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">' +
            '<select id="swMapRegionSelect" class="sw-input">' +
              '<option value="all"' + (swMapState.regionFilter === 'all' ? ' selected' : '') + '>🌌 Все регионы (' + planets.length + ')</option>' +
              (window.SW_GALAXY_REGIONS || []).map(function(r) {
                return '<option value="' + esc(r.id) + '"' + (swMapState.regionFilter === r.id ? ' selected' : '') + '>' + esc(r.icon + ' ' + r.name) + '</option>';
              }).join('') +
            '</select>' +
            '<select id="swMapTypeSelect" class="sw-input">' +
              '<option value="all"' + (swMapState.typeFilter === 'all' ? ' selected' : '') + '>🪐 Все типы миров</option>' +
              Object.keys(SW_PLANET_TYPE_LABELS).map(function(tk) {
                return '<option value="' + esc(tk) + '"' + (swMapState.typeFilter === tk ? ' selected' : '') + '>' + esc(SW_PLANET_TYPE_LABELS[tk].badge) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<input type="text" id="swMapSearchInput" class="sw-input" placeholder="🔍 Поиск планеты (Корусант, Mandalore, R-16, Arkanis...)" value="' + esc(swMapState.searchQuery) + '" style="width:100%;margin-bottom:10px"/>' +

          '<div class="sw-planet-list-scroll">' +
            filteredPlanets.map(function(p) {
              var isAct = selected && (p.id === selected.id);
              var rCol = (regMap[p.region] && regMap[p.region].color) || '#38bdf8';
              return '<div class="sw-planet-list-item' + (isAct ? ' active' : '') + '" data-sw-list-planet="' + esc(p.id) + '">' +
                '<div style="min-width:0">' +
                  '<div style="font-size:13.5px;font-weight:700;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
                    p.icon + ' ' + esc(p.name) + ' <span style="font-weight:400;color:#94a3b8;font-size:12px">(' + esc(p.en) + ')</span>' +
                  '</div>' +
                  '<div style="font-size:11.5px;color:#94a3b8">' +
                    '<span style="color:' + rCol + '">' + esc(p.regionName) + '</span> • Сектор: ' + esc(p.sector) +
                  '</div>' +
                '</div>' +
                '<span class="sw-grid-badge">' + esc(p.grid) + '</span>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>';

  } else if (swMapState.mode === 'archive') {
    var totalPdf = atlas ? atlas.totalSystems : 0;
    var gridSys = atlas ? atlas.getSystemsInGrid(swMapState.selectedGrid) : [];
    var searchResults = atlas ? atlas.searchSystems(swMapState.pdfSearch, swMapState.pdfRegionFilter, '', 150) : [];
    var curatedInGrid = planets.filter(function(p) { return p.grid.toUpperCase() === (swMapState.selectedGrid || '').toUpperCase(); });

    bottomPanelHtml =
      '<div class="sw-map-panels-grid">' +
        '<!-- Левая колонка: Глобальный поиск по всем 6 755 системам из galaxy map.pdf -->' +
        '<div class="sw-char-sheet-card">' +
          '<div class="sw-char-header" style="margin-bottom:8px">' +
            '<span>📡 Полный Архив PDF «Star Systems of the Galaxy» (' + totalPdf.toLocaleString('ru-RU') + ' систем)</span>' +
            '<span class="sw-role-badge">612 секторов</span>' +
          '</div>' +
          '<div style="font-size:12.5px;color:#94a3b8;margin-bottom:10px">' +
            'Оцифрованная база всех 61 страниц приложения <code>galaxy map.pdf</code>. Введите название любой системы, сектора или квадрат сетки (например, <code>Coruscant</code>, <code>Mandalore</code>, <code>Chommell</code>, <code>L-9</code>):' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:8px;margin-bottom:10px">' +
            '<input type="text" id="swPdfSearchInput" class="sw-input" placeholder="🔍 Система, сектор или квадрат (напр. Alderaan, Arkanis, R-16)..." value="' + esc(swMapState.pdfSearch) + '"/>' +
            '<select id="swPdfRegionSelect" class="sw-input">' +
              '<option value="all"' + (swMapState.pdfRegionFilter === 'all' ? ' selected' : '') + '>Все регионы PDF</option>' +
              '<option value="Deep Core"' + (swMapState.pdfRegionFilter === 'Deep Core' ? ' selected' : '') + '>Глубокое Ядро (Deep Core)</option>' +
              '<option value="Core Worlds"' + (swMapState.pdfRegionFilter === 'Core Worlds' ? ' selected' : '') + '>Миры Ядра (Core Worlds)</option>' +
              '<option value="Colonies"' + (swMapState.pdfRegionFilter === 'Colonies' ? ' selected' : '') + '>Колонии (Colonies)</option>' +
              '<option value="Inner Rim"' + (swMapState.pdfRegionFilter === 'Inner Rim' ? ' selected' : '') + '>Внутреннее Кольцо (Inner Rim)</option>' +
              '<option value="Expansion Region"' + (swMapState.pdfRegionFilter === 'Expansion Region' ? ' selected' : '') + '>Регион Экспансии (Expansion Region)</option>' +
              '<option value="Mid Rim"' + (swMapState.pdfRegionFilter === 'Mid Rim' ? ' selected' : '') + '>Среднее Кольцо (Mid Rim)</option>' +
              '<option value="Outer Rim Territories"' + (swMapState.pdfRegionFilter === 'Outer Rim Territories' ? ' selected' : '') + '>Внешнее Кольцо (Outer Rim)</option>' +
              '<option value="Hutt Space"' + (swMapState.pdfRegionFilter === 'Hutt Space' ? ' selected' : '') + '>Пространство Хаттов (Hutt Space)</option>' +
              '<option value="Unknown Regions"' + (swMapState.pdfRegionFilter === 'Unknown Regions' ? ' selected' : '') + '>Неизведанные Регионы (Unknown Regions)</option>' +
              '<option value="Wild Space"' + (swMapState.pdfRegionFilter === 'Wild Space' ? ' selected' : '') + '>Дикое Пространство (Wild Space)</option>' +
            '</select>' +
          '</div>' +
          '<div class="sw-planet-list-scroll">' +
            searchResults.map(function(item) {
              return '<div class="sw-planet-list-item" data-sw-pdf-sys="' + esc(item.system) + '" data-sw-pdf-grid="' + esc(item.grid) + '" data-sw-pdf-curated="' + esc(item.curatedId || '') + '">' +
                '<div style="min-width:0">' +
                  '<div style="font-size:13.5px;font-weight:700;color:#f8fafc">' +
                    (item.curatedId ? '🪐 ' : '✦ ') + esc(item.system) +
                    (item.ruName ? ' <span style="color:#38bdf8;font-weight:600">— ' + esc(item.ruName) + '</span>' : '') +
                  '</div>' +
                  '<div style="font-size:11.5px;color:#94a3b8">' +
                    'Сектор: <strong style="color:#cbd5e1">' + esc(item.sector || '—') + '</strong> • Регион: ' + esc(item.regionRu) +
                  '</div>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:6px">' +
                  '<span class="sw-grid-badge">' + esc(item.grid) + '</span>' +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<!-- Правая колонка: Инспектор выбранного квадрата сетки (5000×5000 св. лет) -->' +
        '<div class="sw-char-sheet-card">' +
          '<div class="sw-char-header" style="margin-bottom:8px">' +
            '<span>🔢 Квадрат сетки <strong style="color:#fde047">' + esc(swMapState.selectedGrid) + '</strong> (5 000 × 5 000 св. лет)</span>' +
            '<button class="sw-btn" id="swBtnZoomGridBox" style="padding:4px 10px;font-size:12px">🎯 Показать квадрат</button>' +
          '</div>' +
          '<div style="font-size:12.5px;color:#94a3b8;margin-bottom:8px">' +
            'Кликните по любому квадрату на карте 4000×4000, чтобы увидеть все звёздные системы в этом секторе по данным PDF. Всего систем в квадрате <strong>' + esc(swMapState.selectedGrid) + '</strong>: <strong style="color:#fde047">' + gridSys.length + '</strong>.' +
          '</div>' +
          (curatedInGrid.length > 0 ? (
            '<div style="margin-bottom:10px;padding:8px 10px;border-radius:8px;background:rgba(14,165,233,0.12);border:1px solid rgba(56,189,248,0.3)">' +
              '<div style="font-size:11.5px;color:#bae6fd;font-weight:700;margin-bottom:6px">🪐 Ключевые миры на карте в квадрате ' + esc(swMapState.selectedGrid) + ':</div>' +
              '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
                curatedInGrid.map(function(cp) {
                  return '<button class="sw-map-jump-btn" data-sw-jump-planet="' + esc(cp.id) + '">' + cp.icon + ' ' + esc(cp.name.split(' (')[0]) + '</button>';
                }).join('') +
              '</div>' +
            '</div>'
          ) : '') +
          '<div class="sw-planet-list-scroll" style="max-height:340px">' +
            (gridSys.length > 0 ? gridSys.map(function(item) {
              return '<div class="sw-planet-list-item" data-sw-pdf-sys="' + esc(item.system) + '" data-sw-pdf-grid="' + esc(item.grid) + '" data-sw-pdf-curated="' + esc(item.curatedId || '') + '">' +
                '<div>' +
                  '<div style="font-size:13px;font-weight:700;color:#fff">' +
                    (item.curatedId ? '🪐 ' : '✦ ') + esc(item.system) +
                    (item.ruName ? ' <span style="color:#38bdf8">(' + esc(item.ruName) + ')</span>' : '') +
                  '</div>' +
                  '<div style="font-size:11.5px;color:#94a3b8">Сектор: ' + esc(item.sector || '—') + ' • ' + esc(item.regionRu) + '</div>' +
                '</div>' +
                '<span class="sw-grid-badge">' + esc(item.grid) + '</span>' +
              '</div>';
            }).join('') : '<div style="color:#94a3b8;font-size:13px;padding:12px">В этом квадрате нет зарегистрированных систем в каталоге PDF.</div>') +
          '</div>' +
        '</div>' +
      '</div>';

  } else if (swMapState.mode === 'route') {
    var modeMultipliers = { lane: 0.65, standard: 1.0, blind: 1.85, smuggler: 0.52 };
    var mult = modeMultipliers[swMapState.astrogationMode] || 1.0;
    var hoursTotal = Math.round((routeStats.totalLy / 1000) * 3.2 * swMapState.hyperdriveClass * mult * 10) / 10;
    var daysTotal = Math.round((hoursTotal / 24) * 10) / 10;
    var fuelCredits = Math.round(routeStats.totalLy * 0.18 * (1 / Math.max(0.5, swMapState.hyperdriveClass)) * (swMapState.astrogationMode === 'smuggler' ? 1.45 : 1.0));
    var uniqueHazards = [];
    for (var hi = 0; hi < routeStats.hazards.length; hi++) {
      if (uniqueHazards.indexOf(routeStats.hazards[hi]) === -1) uniqueHazards.push(routeStats.hazards[hi]);
    }

    bottomPanelHtml =
      '<div class="sw-map-panels-grid">' +
        '<!-- Левая колонка: Навигационный компьютер гиперпрыжка -->' +
        '<div class="sw-char-sheet-card">' +
          '<div class="sw-char-header" style="margin-bottom:8px">' +
            '<span>🧭 Навигационный Компьютер Гиперпрыжка</span>' +
            '<span class="sw-role-badge">Масштаб: 1 квадрат = 5 000 св. лет</span>' +
          '</div>' +
          '<div style="font-size:12.5px;color:#94a3b8;margin-bottom:10px">' +
            'Кликайте по планетам прямо на карте, чтобы добавить их в цепочку прыжка, или выберите один из канонических торговых маршрутов:' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">' +
            '<div>' +
              '<label style="font-size:11.5px;color:#94a3b8;display:block;margin-bottom:4px">Класс гипердвигателя корабля</label>' +
              '<select id="swRouteHyperdriveSelect" class="sw-input" style="width:100%">' +
                '<option value="0.5"' + (swMapState.hyperdriveClass === 0.5 ? ' selected' : '') + '>Класс 0.5 («Тысячелетний сокол» — сверхбыстрый)</option>' +
                '<option value="1"' + (swMapState.hyperdriveClass === 1.0 ? ' selected' : '') + '>Класс 1.0 (Военный флот / Истребители Джедаев)</option>' +
                '<option value="2"' + (swMapState.hyperdriveClass === 2.0 ? ' selected' : '') + '>Класс 2.0 (Стандартный гражданский / грузовой)</option>' +
                '<option value="3"' + (swMapState.hyperdriveClass === 3.0 ? ' selected' : '') + '>Класс 3.0 (Тяжёлые баржи и колониальные суда)</option>' +
                '<option value="4"' + (swMapState.hyperdriveClass === 4.0 ? ' selected' : '') + '>Класс 4.0 (Резервный / Устаревший привод)</option>' +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label style="font-size:11.5px;color:#94a3b8;display:block;margin-bottom:4px">Режим астронавигации</label>' +
              '<select id="swRouteAstroModeSelect" class="sw-input" style="width:100%">' +
                '<option value="lane"' + (swMapState.astrogationMode === 'lane' ? ' selected' : '') + '>По главным гипермаршрутам ①–⑤ (×0.65 времени, КС 10)</option>' +
                '<option value="standard"' + (swMapState.astrogationMode === 'standard' ? ' selected' : '') + '>Стандартные секторные коридоры (×1.0, КС 13)</option>' +
                '<option value="blind"' + (swMapState.astrogationMode === 'blind' ? ' selected' : '') + '>Дикое Пространство / Обход блокады (×1.85, КС 17)</option>' +
                '<option value="smuggler"' + (swMapState.astrogationMode === 'smuggler' ? ' selected' : '') + '>Срез контрабандиста сквозь гравиколодцы (×0.52, КС 20!)</option>' +
              '</select>' +
            '</div>' +
          '</div>' +

          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">' +
            '<div style="padding:10px;border-radius:9px;background:rgba(15,23,42,0.75);border:1px solid rgba(250,204,21,0.35);text-align:center">' +
              '<div style="font-size:11px;color:#94a3b8">ДИСТАНЦИЯ ПРЫЖКА</div>' +
              '<div style="font-size:16px;font-weight:800;color:#fde047;margin-top:3px">' + routeStats.totalLy.toLocaleString('ru-RU') + ' св. лет</div>' +
              '<div style="font-size:11.5px;color:#cbd5e1">' + routeStats.totalParsecs.toLocaleString('ru-RU') + ' парсек</div>' +
            '</div>' +
            '<div style="padding:10px;border-radius:9px;background:rgba(15,23,42,0.75);border:1px solid rgba(56,189,248,0.35);text-align:center">' +
              '<div style="font-size:11px;color:#94a3b8">ВРЕМЯ В ГИПЕРПРОСТРАНСТВЕ</div>' +
              '<div style="font-size:16px;font-weight:800;color:#38bdf8;margin-top:3px">' + hoursTotal + ' ч.</div>' +
              '<div style="font-size:11.5px;color:#cbd5e1">≈ ' + daysTotal + ' ст. суток</div>' +
            '</div>' +
            '<div style="padding:10px;border-radius:9px;background:rgba(15,23,42,0.75);border:1px solid rgba(16,185,129,0.35);text-align:center">' +
              '<div style="font-size:11px;color:#94a3b8">РАСХОД КОАКСИУМА</div>' +
              '<div style="font-size:16px;font-weight:800;color:#34d399;margin-top:3px">' + fuelCredits.toLocaleString('ru-RU') + ' кр.</div>' +
              '<div style="font-size:11.5px;color:#cbd5e1">Точек маршрута: ' + swMapState.routeWaypoints.length + '</div>' +
            '</div>' +
          '</div>' +

          (uniqueHazards.length > 0 ? (
            '<div style="margin-bottom:10px;padding:9px 12px;border-radius:8px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.4);font-size:12.5px;color:#fecaca">' +
              '<strong>⚠️ Навигационные предупреждения на маршруте:</strong><br/>' +
              uniqueHazards.map(function(h) { return '• ' + esc(h); }).join('<br/>') +
            '</div>'
          ) : '') +

          '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
            '<button class="sw-btn sw-btn-primary" id="swBtnRollHyperspaceEvent">🎲 Событие в гиперпрыжке</button>' +
            '<button class="sw-btn" id="swBtnReverseRoute">⇄ Развернуть маршрут</button>' +
            '<button class="sw-btn" id="swBtnClearRoute">🗑️ Очистить точки</button>' +
          '</div>' +
          (swMapState.lastEncounterText ? (
            '<div style="margin-top:10px;padding:10px 12px;border-radius:9px;background:rgba(56,189,248,0.14);border:1px solid rgba(56,189,248,0.45);color:#e0f2fe;font-size:13px;line-height:1.5">' +
              esc(swMapState.lastEncounterText) +
            '</div>'
          ) : '') +
        '</div>' +

        '<!-- Правая колонка: Точки маршрута и канонические пресеты -->' +
        '<div class="sw-char-sheet-card">' +
          '<div class="sw-char-header" style="margin-bottom:8px">' +
            '<span>📍 Цепочка путевых точек (' + swMapState.routeWaypoints.length + ')</span>' +
          '</div>' +
          '<div style="display:flex;gap:6px;margin-bottom:10px">' +
            '<select id="swRouteAddPlanetSelect" class="sw-input" style="flex:1">' +
              planets.map(function(p) {
                return '<option value="' + esc(p.id) + '">' + esc(p.name) + ' [' + esc(p.grid) + ']</option>';
              }).join('') +
            '</select>' +
            '<button class="sw-btn sw-btn-primary" id="swBtnAddWaypointSelect">+ Добавить</button>' +
          '</div>' +
          '<div class="sw-planet-list-scroll" style="max-height:210px;margin-bottom:12px">' +
            (swMapState.routeWaypoints.map(function(wpId, idx) {
              var wp = pById[wpId];
              if (!wp) return '';
              var segInfo = idx > 0 && routeStats.segments[idx - 1]
                ? ' (+' + routeStats.segments[idx - 1].ly.toLocaleString('ru-RU') + ' св.л. / ' + routeStats.segments[idx - 1].pc + ' пк)'
                : ' (Точка старта)';
              return '<div class="sw-planet-list-item">' +
                '<div style="font-size:13px;color:#fff">' +
                  '<strong style="color:#fde047">#' + (idx + 1) + '</strong> ' + wp.icon + ' <strong>' + esc(wp.name) + '</strong> <span class="sw-grid-badge">' + esc(wp.grid) + '</span>' +
                  '<span style="font-size:11.5px;color:#94a3b8">' + esc(segInfo) + '</span>' +
                '</div>' +
                '<button class="sw-btn" data-sw-remove-wp="' + idx + '" style="padding:2px 8px;font-size:11px">✕</button>' +
              '</div>';
            }).join('') || '<div style="color:#94a3b8;font-size:13px;padding:8px">Маршрут пуст. Кликните по любой планете на карте или выберите пресет ниже.</div>') +
          '</div>' +
          '<div style="font-size:12px;color:#94a3b8;font-weight:700;margin-bottom:6px">🛤️ Канонические гипермаршруты Галактики:</div>' +
          '<div style="display:flex;flex-direction:column;gap:5px">' +
            SW_CANONICAL_ROUTES.map(function(cr, cIdx) {
              return '<button class="sw-map-jump-btn" data-sw-preset-route="' + cIdx + '" style="text-align:left;padding:6px 10px">' + esc(cr.name) + '</button>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>';

  } else if (swMapState.mode === 'markers') {
    bottomPanelHtml =
      '<div class="sw-map-panels-grid">' +
        '<div class="sw-char-sheet-card">' +
          '<div class="sw-char-header" style="margin-bottom:8px">' +
            '<span>🚩 Тактические Метки и Флот Мастера</span>' +
            '<span class="sw-role-badge">В памяти: ' + customMarkers.length + '</span>' +
          '</div>' +
          '<div style="font-size:13px;color:#cbd5e1;line-height:1.55;margin-bottom:10px">' +
            'Карта по умолчанию полностью чистая от лишних фишек. В этом режиме <strong>клик в любое место карты 4000×4000</strong> создаёт вашу собственную метку (эскадру, секретную базу игроков, место крушения или цель охоты). Все метки сохраняются автоматически.' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">' +
            '<input type="text" id="swNewMarkerTitle" class="sw-input" placeholder="Название метки (напр. База «Эхо», 501-й флот)"/>' +
            '<select id="swNewMarkerType" class="sw-input">' +
              SW_MARKER_TYPES.map(function(t) {
                return '<option value="' + esc(t.id) + '">' + esc(t.icon + ' ' + t.label) + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<input type="text" id="swNewMarkerNote" class="sw-input" placeholder="Заметка мастера (состав флота, гарнизон, секреты)..." style="width:100%;margin-bottom:10px"/>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
            '<button class="sw-btn sw-btn-primary" id="swBtnAddMarkerAtSelected">📍 Поставить у выбранной планеты (' + esc(selected ? selected.name.split(' (')[0] : '') + ')</button>' +
            (customMarkers.length > 0 ? '<button class="sw-btn" id="swBtnClearAllMarkers">🗑️ Удалить все метки</button>' : '') +
          '</div>' +
        '</div>' +

        '<div class="sw-char-sheet-card">' +
          '<div class="sw-char-header" style="margin-bottom:8px">' +
            '<span>📋 Список пользовательских меток (' + customMarkers.length + ')</span>' +
          '</div>' +
          '<div class="sw-planet-list-scroll">' +
            (customMarkers.length > 0 ? customMarkers.map(function(m) {
              var mType = SW_MARKER_TYPES.find(function(t) { return t.id === m.type; }) || SW_MARKER_TYPES[0];
              var gStr = atlas ? (atlas.pixelToGrid(m.x, m.y) || '—') : '—';
              return '<div class="sw-planet-list-item" data-sw-focus-marker="' + esc(m.id) + '">' +
                '<div>' +
                  '<div style="font-size:13.5px;font-weight:700;color:#fff">' + mType.icon + ' ' + esc(m.title) + ' <span class="sw-grid-badge">' + esc(gStr) + '</span></div>' +
                  '<div style="font-size:11.5px;color:#94a3b8">' + esc(m.note || mType.label) + ' • [' + m.x + ', ' + m.y + ']</div>' +
                '</div>' +
                '<button class="sw-btn" data-sw-del-marker="' + esc(m.id) + '" style="padding:3px 8px;font-size:11px">✕</button>' +
              '</div>';
            }).join('') : '<div style="color:#94a3b8;font-size:13px;padding:12px">Пользовательских меток пока нет. Кликните в любую точку карты в этом режиме, чтобы разместить первую метку.</div>') +
          '</div>' +
        '</div>' +
      '</div>';
  }

  var html =
    '<button class="back" id="swMapBackHome">← Назад</button>' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:10px;flex-wrap:wrap;margin-bottom:10px">' +
      '<div>' +
        '<h1 style="margin-bottom:4px;">🌌 Астрографический Атлас Галактики (4000×4000)</h1>' +
        '<div class="desc" style="margin-bottom:0;">Оцифрованная карта Звёздных Войн: 200 калиброванных миров, архив всех 6 755 систем из PDF по сетке C-1..U-21 и навигатор гиперпрыжков</div>' +
      '</div>' +
    '</div>' +

    '<div class="sw-map-shell">' +
      '<!-- Панель режимов и слоёв -->' +
      '<div class="sw-map-mode-bar">' +
        '<div class="sw-map-mode-tabs">' +
          '<button class="sw-map-mode-btn' + (swMapState.mode === 'inspect' ? ' active' : '') + '" data-sw-mode="inspect">🪐 Атлас Планет (200)</button>' +
          '<button class="sw-map-mode-btn' + (swMapState.mode === 'archive' ? ' active' : '') + '" data-sw-mode="archive">📡 Архив PDF (6 755 систем и Сетка)</button>' +
          '<button class="sw-map-mode-btn' + (swMapState.mode === 'route' ? ' active' : '') + '" data-sw-mode="route">🧭 Гиперпрыжок и Маршруты</button>' +
          '<button class="sw-map-mode-btn' + (swMapState.mode === 'markers' ? ' active' : '') + '" data-sw-mode="markers">🚩 Метки и Флот (' + customMarkers.length + ')</button>' +
        '</div>' +
        '<div class="sw-map-layer-bar">' +
          '<span class="sw-map-layer-chip' + (swMapState.showPins ? ' on' : '') + '" data-sw-layer="showPins">📍 Пины (200)</span>' +
          '<span class="sw-map-layer-chip' + (swMapState.showLabels ? ' on' : '') + '" data-sw-layer="showLabels">🏷️ Подписи</span>' +
          '<span class="sw-map-layer-chip' + (swMapState.showRoutes ? ' on' : '') + '" data-sw-layer="showRoutes">🛤️ Гипермаршруты ①–⑤</span>' +
          '<span class="sw-map-layer-chip' + (swMapState.showGrid ? ' on' : '') + '" data-sw-layer="showGrid">🔢 Сетка PDF (C-1..U-21)</span>' +
        '</div>' +
      '</div>' +

      '<!-- Быстрые прыжки камеры по секторам -->' +
      '<div class="sw-map-quick-jumps">' +
        '<span style="font-size:11.5px;color:#94a3b8;font-weight:600">Быстрый обзор:</span>' +
        '<button class="sw-map-jump-btn" data-sw-cam-preset="full">🌌 Весь Диск</button>' +
        '<button class="sw-map-jump-btn" data-sw-cam-preset="core">👑 Миры Ядра (Корусант L-9)</button>' +
        '<button class="sw-map-jump-btn" data-sw-cam-preset="deep_core">🕳️ Глубокое Ядро (Тайтон)</button>' +
        '<button class="sw-map-jump-btn" data-sw-cam-preset="mandalore">🪖 Мандалор и Датомир (O-7)</button>' +
        '<button class="sw-map-jump-btn" data-sw-cam-preset="sith">💀 Морабанд и Малахор (R-5)</button>' +
        '<button class="sw-map-jump-btn" data-sw-cam-preset="hutt">🐌 Нал-Хатта и Кессель (S-12)</button>' +
        '<button class="sw-map-jump-btn" data-sw-cam-preset="tatooine">☀️ Татуин, Джеонозис, Рилот (R-16)</button>' +
        '<button class="sw-map-jump-btn" data-sw-cam-preset="south">🌋 Набу, Мустафар, Дагоба (M-19)</button>' +
        '<button class="sw-map-jump-btn" data-sw-cam-preset="anoat">❄️ Хот и Беспин (K-18)</button>' +
        '<button class="sw-map-jump-btn" data-sw-cam-preset="unknown">🟦 Ксилла, Илум, Экзегол (F-8)</button>' +
      '</div>' +

      '<!-- Интерактивный вьюпорт 4000×4000 -->' +
      '<div class="sw-galaxy-wrap' + (swMapState.isFullscreen ? ' sw-map-fullscreen' : '') + '" id="swMapViewport">' +
        '<div class="sw-map-canvas-layer" id="swMapCanvasLayer">' +
          '<img class="sw-map-base-img" src="star_wars_galaxy_map_4000x4000_20251009_3c4d0e08.jpeg" width="4000" height="4000" alt="Star Wars Galaxy Map 4000x4000" draggable="false"/>' +
          '<svg class="sw-map-overlay-svg" viewBox="0 0 4000 4000" width="4000" height="4000">' +
            gridOverlaySvg +
            tradeRoutesSvg +
            activeRouteSvg +
            pinsSvg +
            pdfBeaconSvg +
            customMarkersSvg +
          '</svg>' +
        '</div>' +

        '<!-- Кнопки управления камерой -->' +
        '<div class="sw-map-zoom-controls">' +
          '<button class="sw-map-ctrl-btn" id="swMapZoomIn" title="Приблизить (+)">+</button>' +
          '<button class="sw-map-ctrl-btn" id="swMapZoomOut" title="Отдалить (−)">−</button>' +
          '<button class="sw-map-ctrl-btn" id="swMapZoomReset" title="Показать всю Галактику">⟲</button>' +
          '<button class="sw-map-ctrl-btn" id="swMapCenterSel" title="Центрировать на выбранной планете">🎯</button>' +
          '<button class="sw-map-ctrl-btn" id="swMapToggleFs" title="Полноэкранный режим">' + (swMapState.isFullscreen ? '🗗' : '⛶') + '</button>' +
        '</div>' +

        '<!-- Нижний астрографический HUD -->' +
        '<div class="sw-map-hud" id="swMapHud">' +
          '<span id="swHudCoords">🎯 Выбран: ' + esc(selected ? selected.name : '—') + ' [' + esc(selected ? selected.grid : 'L-9') + ']</span>' +
          '<span id="swHudGridInfo">📡 Архив PDF: 6 755 систем • 1 квадрат = 5 000 св. лет</span>' +
          '<span id="swHudZoom">Зум: ' + Math.round(swMapState.scale * 100) + '%</span>' +
        '</div>' +
      '</div>' +

      bottomPanelHtml +
    '</div>';

  mount(html);

  var vp = document.getElementById('swMapViewport');
  var canvasLayer = document.getElementById('swMapCanvasLayer');
  var hudCoords = document.getElementById('swHudCoords');
  var hudGridInfo = document.getElementById('swHudGridInfo');
  var hudZoom = document.getElementById('swHudZoom');

  if (!swMapState.camInit) {
    swFitFullGalaxy();
  }

  function applyTransform() {
    if (!canvasLayer) return;
    canvasLayer.style.transform = 'translate(' + swMapState.tx + 'px, ' + swMapState.ty + 'px) scale(' + swMapState.scale + ')';
    if (hudZoom) hudZoom.textContent = 'Зум: ' + Math.round(swMapState.scale * 100) + '%';
  }
  applyTransform();

  function screenToMap(clientX, clientY) {
    var rect = vp.getBoundingClientRect();
    var mx = (clientX - rect.left - swMapState.tx) / swMapState.scale;
    var my = (clientY - rect.top - swMapState.ty) / swMapState.scale;
    return { x: Math.round(mx), y: Math.round(my) };
  }

  function zoomAtPoint(factor, clientX, clientY) {
    var rect = vp.getBoundingClientRect();
    var cx = clientX !== undefined ? (clientX - rect.left) : (rect.width / 2);
    var cy = clientY !== undefined ? (clientY - rect.top) : (rect.height / 2);
    var oldScale = swMapState.scale;
    var newScale = Math.max(0.18, Math.min(5.5, oldScale * factor));
    var mapX = (cx - swMapState.tx) / oldScale;
    var mapY = (cy - swMapState.ty) / oldScale;
    swMapState.scale = newScale;
    swMapState.tx = cx - mapX * newScale;
    swMapState.ty = cy - mapY * newScale;
    applyTransform();
  }

  // Панорамирование мышью и зумирование колесом
  var isDragging = false;
  var dragMoved = false;
  var startX = 0;
  var startY = 0;
  var startTx = 0;
  var startTy = 0;

  vp.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    if (e.target.closest('.sw-map-zoom-controls')) return;
    isDragging = true;
    dragMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    startTx = swMapState.tx;
    startTy = swMapState.ty;
    vp.classList.add('dragging');
  });

  window.addEventListener('mousemove', function onMove(e) {
    if (!document.body.contains(vp)) {
      window.removeEventListener('mousemove', onMove);
      return;
    }
    if (isDragging) {
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved = true;
      swMapState.tx = startTx + dx;
      swMapState.ty = startTy + dy;
      applyTransform();
    }
  });

  window.addEventListener('mouseup', function onUp() {
    if (!document.body.contains(vp)) {
      window.removeEventListener('mouseup', onUp);
      return;
    }
    if (isDragging) {
      isDragging = false;
      vp.classList.remove('dragging');
    }
  });

  vp.addEventListener('mousemove', function(e) {
    if (isDragging) return;
    var pt = screenToMap(e.clientX, e.clientY);
    if (pt.x >= 0 && pt.x <= 4000 && pt.y >= 0 && pt.y <= 4000) {
      var gStr = atlas ? atlas.pixelToGrid(pt.x, pt.y) : null;
      if (hudCoords) {
        hudCoords.textContent = 'Коорд: [' + pt.x + ', ' + pt.y + ']' + (gStr ? ' • Квадрат сетки: ' + gStr : '');
      }
      if (hudGridInfo && gStr && atlas) {
        var sysCnt = atlas.getSystemsInGrid(gStr).length;
        hudGridInfo.textContent = '📡 Систем из PDF в квадрате ' + gStr + ': ' + sysCnt + ' (1 квадрат = 5 000 св. лет)';
      }
    }
  });

  vp.addEventListener('wheel', function(e) {
    e.preventDefault();
    var factor = e.deltaY < 0 ? 1.18 : (1 / 1.18);
    zoomAtPoint(factor, e.clientX, e.clientY);
  }, { passive: false });

  // Сенсорное управление (1 палец — перемещение, 2 пальца — pinch-зум)
  var touchDist = 0;
  vp.addEventListener('touchstart', function(e) {
    if (e.target.closest('.sw-map-zoom-controls')) return;
    if (e.touches.length === 1) {
      isDragging = true;
      dragMoved = false;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTx = swMapState.tx;
      startTy = swMapState.ty;
    } else if (e.touches.length === 2) {
      isDragging = false;
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDist = Math.sqrt(dx * dx + dy * dy);
    }
  }, { passive: true });

  vp.addEventListener('touchmove', function(e) {
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
      var dx = e.touches[0].clientX - startX;
      var dy = e.touches[0].clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragMoved = true;
      swMapState.tx = startTx + dx;
      swMapState.ty = startTy + dy;
      applyTransform();
    } else if (e.touches.length === 2 && touchDist > 0) {
      e.preventDefault();
      var dx2 = e.touches[0].clientX - e.touches[1].clientX;
      var dy2 = e.touches[0].clientY - e.touches[1].clientY;
      var newDist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      var cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      var cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      zoomAtPoint(newDist / touchDist, cx, cy);
      touchDist = newDist;
    }
  }, { passive: false });

  vp.addEventListener('touchend', function() {
    isDragging = false;
    touchDist = 0;
  });

  // Клик по карте в режиме меток или архива сетки
  vp.addEventListener('click', function(e) {
    if (dragMoved) return;
    if (e.target.closest('.sw-map-zoom-controls')) return;
    if (e.target.closest('[data-sw-planet]') || e.target.closest('[data-sw-marker]')) return;

    var pt = screenToMap(e.clientX, e.clientY);
    if (pt.x < 0 || pt.x > 4000 || pt.y < 0 || pt.y > 4000) return;

    if (swMapState.mode === 'markers') {
      var titleInput = document.getElementById('swNewMarkerTitle');
      var typeSelect = document.getElementById('swNewMarkerType');
      var noteInput = document.getElementById('swNewMarkerNote');
      var titleVal = (titleInput && titleInput.value.trim()) || ('Метка [' + (atlas ? (atlas.pixelToGrid(pt.x, pt.y) || '') : '') + ']');
      var typeVal = (typeSelect && typeSelect.value) || 'fleet';
      var noteVal = (noteInput && noteInput.value.trim()) || '';
      var list = swLoadCustomMarkers();
      list.push({
        id: 'swm_' + Date.now(),
        title: titleVal,
        type: typeVal,
        note: noteVal,
        x: pt.x,
        y: pt.y
      });
      swSaveCustomMarkers(list);
      swMap();
      return;
    }

    if (swMapState.mode === 'archive' || swMapState.showGrid) {
      var gClicked = atlas ? atlas.pixelToGrid(pt.x, pt.y) : null;
      if (gClicked) {
        swMapState.selectedGrid = gClicked;
        swMapState.highlightedPdfSys = null;
        swMap();
      }
    }
  });

  // Клик по пинам планет на карте
  document.querySelectorAll('[data-sw-planet]').forEach(function(node) {
    node.addEventListener('click', function(e) {
      e.stopPropagation();
      if (dragMoved) return;
      var pid = node.getAttribute('data-sw-planet');
      swMapState.selectedId = pid;
      swMapState.lastHookText = '';
      var pObj = pById[pid];
      if (pObj) swMapState.selectedGrid = pObj.grid;
      if (swMapState.mode === 'route') {
        var wps = swMapState.routeWaypoints || [];
        if (wps[wps.length - 1] !== pid) {
          wps.push(pid);
          swMapState.routeWaypoints = wps;
        }
      }
      swMap();
    });
  });

  // Навигация и кнопки управления камерой
  document.getElementById('swMapBackHome').addEventListener('click', function() {
    swMapState.isFullscreen = false;
    go({ screen: 'swHome' });
  });

  document.getElementById('swMapZoomIn').addEventListener('click', function() { zoomAtPoint(1.3); });
  document.getElementById('swMapZoomOut').addEventListener('click', function() { zoomAtPoint(1 / 1.3); });
  document.getElementById('swMapZoomReset').addEventListener('click', function() {
    swFitFullGalaxy();
    applyTransform();
  });
  document.getElementById('swMapCenterSel').addEventListener('click', function() {
    if (selected) {
      swFocusCameraOn(selected.x, selected.y, 1.35);
      applyTransform();
    }
  });
  document.getElementById('swMapToggleFs').addEventListener('click', function() {
    swMapState.isFullscreen = !swMapState.isFullscreen;
    swMap();
  });

  // Переключение режимов и слоёв
  document.querySelectorAll('[data-sw-mode]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      swMapState.mode = btn.getAttribute('data-sw-mode');
      swMap();
    });
  });

  document.querySelectorAll('[data-sw-layer]').forEach(function(chip) {
    chip.addEventListener('click', function() {
      var key = chip.getAttribute('data-sw-layer');
      swMapState[key] = !swMapState[key];
      swMap();
    });
  });

  // Быстрые прыжки по секторам
  var camPresets = {
    full:      function() { swFitFullGalaxy(); },
    core:      function() { swFocusCameraOn(1987, 1986, 1.15); },
    deep_core: function() { swFocusCameraOn(1902, 2248, 1.35); },
    mandalore: function() { swFocusCameraOn(2458, 1670, 1.35); },
    sith:      function() { swFocusCameraOn(2880, 1360, 1.35); },
    hutt:      function() { swFocusCameraOn(3010, 2260, 1.15); },
    tatooine:  function() { swFocusCameraOn(2850, 3070, 1.35); },
    south:     function() { swFocusCameraOn(2220, 3320, 1.10); },
    anoat:     function() { swFocusCameraOn(1787, 3310, 1.45); },
    unknown:   function() { swFocusCameraOn(1180, 1850, 1.05); }
  };
  document.querySelectorAll('[data-sw-cam-preset]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var k = btn.getAttribute('data-sw-cam-preset');
      if (camPresets[k]) {
        camPresets[k]();
        applyTransform();
      }
    });
  });

  // Обработчики режима 1: Атлас Планет
  var btnFocusSel = document.getElementById('swBtnFocusSelected');
  if (btnFocusSel && selected) {
    btnFocusSel.addEventListener('click', function() {
      swFocusCameraOn(selected.x, selected.y, 1.55);
      applyTransform();
    });
  }
  var btnInspectGridPdf = document.getElementById('swBtnInspectGridPdf');
  if (btnInspectGridPdf && selected) {
    btnInspectGridPdf.addEventListener('click', function() {
      swMapState.selectedGrid = selected.grid;
      swMapState.mode = 'archive';
      swMap();
    });
  }
  var btnAddSelRoute = document.getElementById('swBtnAddSelectedToRoute');
  if (btnAddSelRoute && selected) {
    btnAddSelRoute.addEventListener('click', function() {
      swMapState.routeWaypoints.push(selected.id);
      swMapState.mode = 'route';
      swMap();
    });
  }
  var btnGenHook = document.getElementById('swBtnGenHook');
  if (btnGenHook && selected) {
    btnGenHook.addEventListener('click', function() {
      swMapState.lastHookText = swGeneratePlanetHook(selected);
      swMap();
    });
  }

  var regSel = document.getElementById('swMapRegionSelect');
  if (regSel) {
    regSel.addEventListener('change', function() {
      swMapState.regionFilter = regSel.value;
      swMap();
    });
  }
  var typeSel = document.getElementById('swMapTypeSelect');
  if (typeSel) {
    typeSel.addEventListener('change', function() {
      swMapState.typeFilter = typeSel.value;
      swMap();
    });
  }
  var searchInp = document.getElementById('swMapSearchInput');
  if (searchInp) {
    searchInp.addEventListener('input', function() {
      swMapState.searchQuery = searchInp.value;
      var pos = searchInp.selectionStart;
      swMap();
      var nextInp = document.getElementById('swMapSearchInput');
      if (nextInp) {
        nextInp.focus();
        try { nextInp.setSelectionRange(pos, pos); } catch (e) {}
      }
    });
  }
  document.querySelectorAll('[data-sw-list-planet]').forEach(function(row) {
    row.addEventListener('click', function() {
      var pid = row.getAttribute('data-sw-list-planet');
      swMapState.selectedId = pid;
      swMapState.lastHookText = '';
      var pObj = pById[pid];
      if (pObj) {
        swMapState.selectedGrid = pObj.grid;
        swFocusCameraOn(pObj.x, pObj.y, 1.35);
      }
      swMap();
    });
  });

  // Обработчики режима 2: Архив PDF (6 755 систем)
  var pdfSearchInp = document.getElementById('swPdfSearchInput');
  if (pdfSearchInp) {
    pdfSearchInp.addEventListener('input', function() {
      swMapState.pdfSearch = pdfSearchInp.value;
      var pos = pdfSearchInp.selectionStart;
      swMap();
      var nextInp = document.getElementById('swPdfSearchInput');
      if (nextInp) {
        nextInp.focus();
        try { nextInp.setSelectionRange(pos, pos); } catch (e) {}
      }
    });
  }
  var pdfRegSel = document.getElementById('swPdfRegionSelect');
  if (pdfRegSel) {
    pdfRegSel.addEventListener('change', function() {
      swMapState.pdfRegionFilter = pdfRegSel.value;
      swMap();
    });
  }
  var btnZoomGridBox = document.getElementById('swBtnZoomGridBox');
  if (btnZoomGridBox && atlas && swMapState.selectedGrid) {
    btnZoomGridBox.addEventListener('click', function() {
      var box = atlas.gridToBox(swMapState.selectedGrid);
      if (box) {
        swFocusCameraOn(box.cx, box.cy, 1.35);
        applyTransform();
      }
    });
  }
  document.querySelectorAll('[data-sw-jump-planet]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var pid = btn.getAttribute('data-sw-jump-planet');
      var pObj = pById[pid];
      if (pObj) {
        swMapState.selectedId = pid;
        swMapState.mode = 'inspect';
        swFocusCameraOn(pObj.x, pObj.y, 1.45);
        swMap();
      }
    });
  });
  document.querySelectorAll('[data-sw-pdf-sys]').forEach(function(row) {
    row.addEventListener('click', function() {
      var sysName = row.getAttribute('data-sw-pdf-sys');
      var gCode = row.getAttribute('data-sw-pdf-grid');
      var curId = row.getAttribute('data-sw-pdf-curated');
      swMapState.selectedGrid = gCode;
      if (curId && pById[curId]) {
        swMapState.selectedId = curId;
        swMapState.highlightedPdfSys = null;
        swFocusCameraOn(pById[curId].x, pById[curId].y, 1.45);
      } else if (atlas && gCode) {
        swMapState.highlightedPdfSys = { system: sysName, grid: gCode };
        var box = atlas.gridToBox(gCode);
        if (box) swFocusCameraOn(box.cx, box.cy, 1.25);
      }
      swMap();
    });
  });

  // Обработчики режима 3: Навигационный компьютер
  var hdSel = document.getElementById('swRouteHyperdriveSelect');
  if (hdSel) {
    hdSel.addEventListener('change', function() {
      swMapState.hyperdriveClass = parseFloat(hdSel.value) || 1.0;
      swMap();
    });
  }
  var astroSel = document.getElementById('swRouteAstroModeSelect');
  if (astroSel) {
    astroSel.addEventListener('change', function() {
      swMapState.astrogationMode = astroSel.value;
      swMap();
    });
  }
  var btnAddWpSel = document.getElementById('swBtnAddWaypointSelect');
  if (btnAddWpSel) {
    btnAddWpSel.addEventListener('click', function() {
      var selEl = document.getElementById('swRouteAddPlanetSelect');
      if (selEl && selEl.value) {
        swMapState.routeWaypoints.push(selEl.value);
        swMap();
      }
    });
  }
  document.querySelectorAll('[data-sw-remove-wp]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var idx = parseInt(btn.getAttribute('data-sw-remove-wp'), 10);
      swMapState.routeWaypoints.splice(idx, 1);
      swMap();
    });
  });
  document.querySelectorAll('[data-sw-preset-route]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var cIdx = parseInt(btn.getAttribute('data-sw-preset-route'), 10);
      var preset = SW_CANONICAL_ROUTES[cIdx];
      if (preset) {
        swMapState.routeWaypoints = preset.ids.slice();
        swFitFullGalaxy();
        swMap();
      }
    });
  });
  var btnRollEnc = document.getElementById('swBtnRollHyperspaceEvent');
  if (btnRollEnc) {
    btnRollEnc.addEventListener('click', function() {
      swMapState.lastEncounterText = SW_HYPERSPACE_ENCOUNTERS[Math.floor(Math.random() * SW_HYPERSPACE_ENCOUNTERS.length)];
      swMap();
    });
  }
  var btnRevRoute = document.getElementById('swBtnReverseRoute');
  if (btnRevRoute) {
    btnRevRoute.addEventListener('click', function() {
      swMapState.routeWaypoints.reverse();
      swMap();
    });
  }
  var btnClearRoute = document.getElementById('swBtnClearRoute');
  if (btnClearRoute) {
    btnClearRoute.addEventListener('click', function() {
      swMapState.routeWaypoints = [];
      swMapState.lastEncounterText = '';
      swMap();
    });
  }

  // Обработчики режима 4: Пользовательские метки
  var btnAddAtSel = document.getElementById('swBtnAddMarkerAtSelected');
  if (btnAddAtSel && selected) {
    btnAddAtSel.addEventListener('click', function() {
      var titleInput = document.getElementById('swNewMarkerTitle');
      var typeSelect = document.getElementById('swNewMarkerType');
      var noteInput = document.getElementById('swNewMarkerNote');
      var list = swLoadCustomMarkers();
      list.push({
        id: 'swm_' + Date.now(),
        title: (titleInput && titleInput.value.trim()) || ('Флот у ' + selected.name.split(' (')[0]),
        type: (typeSelect && typeSelect.value) || 'fleet',
        note: (noteInput && noteInput.value.trim()) || '',
        x: selected.x + 22,
        y: selected.y - 22
      });
      swSaveCustomMarkers(list);
      swMap();
    });
  }
  var btnClearMarkers = document.getElementById('swBtnClearAllMarkers');
  if (btnClearMarkers) {
    btnClearMarkers.addEventListener('click', function() {
      swSaveCustomMarkers([]);
      swMap();
    });
  }
  document.querySelectorAll('[data-sw-focus-marker]').forEach(function(row) {
    row.addEventListener('click', function(e) {
      if (e.target.closest('[data-sw-del-marker]')) return;
      var mid = row.getAttribute('data-sw-focus-marker');
      var m = customMarkers.find(function(it) { return it.id === mid; });
      if (m) {
        swMapState.editingMarkerId = m.id;
        swFocusCameraOn(m.x, m.y, 1.45);
        swMap();
      }
    });
  });
  document.querySelectorAll('[data-sw-del-marker]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var mid = btn.getAttribute('data-sw-del-marker');
      var list = swLoadCustomMarkers().filter(function(it) { return it.id !== mid; });
      swSaveCustomMarkers(list);
      swMap();
    });
  });
}

/* ==========================================================================
   7. ЭКРАН ДАННЫЕ И ПРОФИЛИ (swData) — СВОРАЧИВАЕМАЯ АНКЕТА, ТЕМЫ И СТАТИЧНЫЕ ПОЛЯ
   ========================================================================== */
function swData() {
  applyStarWarsTheme();
  SW.loadAll();
  var prof = SW.getActiveProfile();
  var currentTheme = SW.getTheme();

  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Данные' }
  ]);

  var isCollapsed = false;
  try { isCollapsed = localStorage.getItem('ttc_sw_char_collapsed') === '1'; } catch (e) {}
  if (typeof SW.charSheetCollapsed === 'boolean') isCollapsed = SW.charSheetCollapsed;

  var profOptions = SW.profiles.map(function(p) {
    return '<option value="' + esc(p.id) + '" ' + (p.id === prof.id ? 'selected' : '') + '>' +
      esc(p.name || 'Новый персонаж') + ' (' + esc(p.path || 'Без ордена') + ', Ур. ' + esc(p.level) + ')' +
    '</option>';
  }).join('');

  var roleBadgeHtml = prof.path
    ? '<span class="sw-role-badge" style="font-size:11px;">⚔️ ' + esc(prof.path) + '</span>'
    : '<span class="sw-role-badge" style="font-size:11px;background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.15);color:#cbd5e1;">👤 Без ордена</span>';

  var html =
    '<button class="back" id="swDataBackHome">← На главную</button>' +
    '<h1>Данные</h1>' +

    /* Выбор визуальной темы раздела (Голокрон Джедаев vs Империя Ситхов) */
    '<div class="sheet-section">' +
      '<div class="section-label" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-top:6px;">' +
        '<span>🎨 Визуальная Тема Раздела («Звездные войны»)</span>' +
        '<span class="sw-side-badge ' + (currentTheme === 'sith' ? 'sw-side-dark' : 'sw-side-light') + '">' +
          (currentTheme === 'sith' ? '🔺 Тема Ситха (Тёмная сторона)' : '🔷 Голокрон Джедаев (Светлая сторона)') +
        '</span>' +
      '</div>' +
      '<div class="desc">' +
        'Выберите оформление интерфейса, кнопок, карточек и задних эффектов Силы в разделе «Звездные войны».' +
      '</div>' +
      '<div style="max-width:440px;margin:10px 0 12px 0;">' +
        '<select id="swThemeSelect" class="sw-input" style="font-weight:700;font-size:14px;padding:9px 12px;">' +
          '<option value="jedi" ' + (currentTheme === 'jedi' ? 'selected' : '') + '>🔷 Голокрон Джедаев — Светлая сторона (Лазурный кайбер)</option>' +
          '<option value="sith" ' + (currentTheme === 'sith' ? 'selected' : '') + '>🔺 Империя Ситхов — Тёмная сторона (Багровый кайбер и молнии Силы)</option>' +
        '</select>' +
      '</div>' +
      '<div class="sw-theme-picker-grid">' +
        '<div class="sw-theme-option-card jedi-opt ' + (currentTheme === 'jedi' ? 'active' : '') + '" data-sw-theme-pick="jedi">' +
          '<div class="sw-theme-opt-head">' +
            '<div class="sw-theme-opt-title">🔷 Голокрон Джедаев</div>' +
            '<span class="sw-theme-opt-badge">' + (currentTheme === 'jedi' ? '✓ Активна' : 'Выбрать') + '</span>' +
          '</div>' +
          '<div class="sw-theme-opt-desc">' +
            'Лазурное сияние Храма Джедаев и Великого Голокрона, чистые голубые кайбер-искры, звёздная туманность Корусанта и Тайтона.' +
          '</div>' +
        '</div>' +
        '<div class="sw-theme-option-card sith-opt ' + (currentTheme === 'sith' ? 'active' : '') + '" data-sw-theme-pick="sith">' +
          '<div class="sw-theme-opt-head">' +
            '<div class="sw-theme-opt-title">🔺 Империя Ситхов</div>' +
            '<span class="sw-theme-opt-badge">' + (currentTheme === 'sith' ? '✓ Активна' : 'Выбрать') + '</span>' +
          '</div>' +
          '<div class="sw-theme-opt-desc">' +
            'Багровая обсидиановая атмосфера Коррибана и Экзегола, пирамидальный Голокрон Ситхов, «обескровленный» алый кайбер, всполохи молний Тёмной стороны и тёмно-багровые кнопки.' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="sheet-section">' +
      '<div class="section-label" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-top:6px;">' +
        '<span>👥 Выбор и управление персонажами</span>' +
        '<span style="font-size:12px;color:var(--sw-muted);">Всего профилей: ' + SW.profiles.length + '</span>' +
      '</div>' +
      '<div class="desc">' +
        'Выберите активного персонажа Галактики или создайте нового. Способности, боевые приёмы и навыки сохраняются индивидуально для каждого профиля.' +
      '</div>' +

      '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin:14px 0 14px 0;">' +
        '<div style="flex:1;min-width:240px;">' +
          '<label style="display:block;font-size:12px;color:var(--sw-muted);margin-bottom:4px;font-weight:600;">Активный персонаж (переключение на лету):</label>' +
          '<select id="swProfileSelect" class="sw-input" style="font-weight:700;font-size:14px;padding:9px 12px;">' +
            profOptions +
          '</select>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button class="btn btn-primary" id="swNewProfBtn" title="Создать нового персонажа">➕ Новый персонаж</button>' +
          '<button class="btn" id="swCloneProfBtn" title="Клонировать текущего персонажа">📋 Дублировать</button>' +
        '</div>' +
      '</div>' +

      /* Сворачиваемая карточка профиля персонажа (как в Волшебнике / Ведьмаке) */
      '<div class="sw-char-sheet-card" id="swCharSheetCard">' +
        '<div class="sw-char-header" id="swCharHeaderToggle" style="cursor:pointer;user-select:none;display:flex;justify-content:space-between;align-items:center;gap:10px;" title="Нажмите, чтобы свернуть или развернуть анкету">' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
            '<span>Анкета персонажа: <b style="color:var(--sw-accent-pale);">⚔️ ' + esc(prof.name || 'Новый персонаж') + '</b></span>' +
            roleBadgeHtml +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            '<span id="swCharToggleLabel" style="font-size:11.5px;color:var(--sw-muted);font-weight:normal;">' + (isCollapsed ? 'Развернуть' : 'Свернуть') + '</span>' +
            '<span id="swCharToggleIcon" style="font-size:12px;color:var(--sw-accent);transition:transform 0.2s ease;' + (isCollapsed ? 'transform:rotate(-90deg);' : '') + '">▼</span>' +
          '</div>' +
        '</div>' +

        '<div id="swCharSheetContent" style="' + (isCollapsed ? 'display:none;' : '') + 'margin-top:14px;">' +
          '<div class="sw-edit-grid">' +
            '<div class="sw-edit-item">' +
              '<label>Имя / Позывной персонажа</label>' +
              '<input type="text" id="swInpName" class="sw-input" value="' + esc(prof.name) + '" placeholder="Введите имя персонажа...">' +
            '</div>' +
            '<div class="sw-edit-item">' +
              '<label>Раса / Происхождение</label>' +
              '<input type="text" id="swInpRace" class="sw-input" value="' + esc(prof.race || '') + '" placeholder="Человек, Тви\'лек, Тогрута, Забрак, Чисс...">' +
            '</div>' +
            '<div class="sw-edit-item">' +
              '<label>Путь / Орден / Класс</label>' +
              '<input type="text" id="swInpPath" class="sw-input" value="' + esc(prof.path || '') + '" placeholder="Джедай-страж, Ситх-инквизитор, Мандалорец, Охотник...">' +
            '</div>' +
            '<div class="sw-edit-item">' +
              '<label>Титул / Звание / Клан</label>' +
              '<input type="text" id="swInpTitle" class="sw-input" value="' + esc(prof.title || '') + '" placeholder="Падаван, Рыцарь, Дарт, Лорд Ситхов, Клан Мандалора...">' +
            '</div>' +
          '</div>' +

          /* Статичные боевые параметры: Уровень, ХП, КБ, Сила, Скорость */
          '<div class="sw-stat-box-grid">' +
            '<div class="sw-edit-item">' +
              '<label>⭐ Уровень</label>' +
              '<input type="number" id="swInpLevel" class="sw-input" value="' + esc(prof.level) + '">' +
            '</div>' +
            '<div class="sw-edit-item">' +
              '<label>❤️ ХП</label>' +
              '<input type="number" id="swInpHp" class="sw-input" value="' + esc(prof.hp) + '">' +
            '</div>' +
            '<div class="sw-edit-item">' +
              '<label>🛡️ КБ</label>' +
              '<input type="number" id="swInpAc" class="sw-input" value="' + esc(prof.ac) + '">' +
            '</div>' +
            '<div class="sw-edit-item">' +
              '<label>✨ Сила / Энергия</label>' +
              '<input type="number" id="swInpForce" class="sw-input" value="' + esc(prof.force) + '">' +
            '</div>' +
            '<div class="sw-edit-item">' +
              '<label>🏃 Скорость</label>' +
              '<input type="text" id="swInpSpeed" class="sw-input" value="' + esc(prof.speed || '9 м') + '">' +
            '</div>' +
          '</div>' +

          '<div class="sw-edit-grid" style="margin-top:14px;">' +
            '<div class="sw-edit-item">' +
              '<label>⚔️ Оружие (Световой меч / Бластер)</label>' +
              '<input type="text" id="swInpWeapon" class="sw-input" value="' + esc(prof.weapon || '') + '" placeholder="Световой меч / Бластер...">' +
            '</div>' +
            '<div class="sw-edit-item">' +
              '<label>🥋 Броня / Облачение</label>' +
              '<input type="text" id="swInpArmor" class="sw-input" value="' + esc(prof.armor || '') + '" placeholder="Облачение / Броня...">' +
            '</div>' +
            '<div class="sw-edit-item sw-field-full">' +
              '<label>🚀 Звёздный корабль / Транспорт</label>' +
              '<input type="text" id="swInpShip" class="sw-input" value="' + esc(prof.ship || '') + '" placeholder="Корабль или спидер...">' +
            '</div>' +
            '<div class="sw-edit-item sw-field-full">' +
              '<label>📜 Инвентарь, Голокроны и Заметки персонажа</label>' +
              '<textarea id="swInpNotes" class="sw-input" rows="4" placeholder="Снаряжение, кристаллы, квесты, союзники и заметки...">' + esc(prof.notes || '') + '</textarea>' +
            '</div>' +
          '</div>' +

          '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:18px;padding-top:14px;border-top:1px solid var(--sw-border-subtle);">' +
            '<button class="btn btn-primary" id="swSaveCharBtn">✓ Сохранить анкету</button>' +
            '<span id="swSaveStatus" style="font-size:12px;color:var(--sw-accent-bright);">Автосохранение активно</span>' +
            (SW.profiles.length > 1
              ? '<button class="btn btn-ghost" id="swDelProfBtn" style="color:#fca5a5;border-color:rgba(239,68,68,0.4);margin-left:auto;" title="Удалить текущий профиль">🗑️ Удалить профиль</button>'
              : '') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    /* Параметры Галактической Кампании */
    '<div class="sheet-section">' +
      '<div class="section-label">🌌 Параметры Галактической Кампании</div>' +
      '<div class="sw-char-sheet-card">' +
        '<div class="sw-edit-grid" style="margin-top:0;">' +
          '<div class="sw-edit-item">' +
            '<label>Название кампании / Сектора</label>' +
            '<input type="text" id="swMetaWorld" class="sw-input" value="' + esc(SW.meta.worldName || '') + '">' +
          '</div>' +
          '<div class="sw-edit-item">' +
            '<label>Эпоха</label>' +
            '<input type="text" id="swMetaEra" class="sw-input" value="' + esc(SW.meta.era || '') + '">' +
          '</div>' +
          '<div class="sw-edit-item sw-field-full">' +
            '<label>Хроника и общие заметки отряда</label>' +
            '<textarea id="swMetaNotes" class="sw-input" rows="3">' + esc(SW.meta.campaignNotes || '') + '</textarea>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    /* Ключ Gemini API */
    '<div class="sheet-section">' +
      '<div class="section-label">🤖 Ключ Gemini AI (Голокрон-ИИ)</div>' +
      '<div class="sw-char-sheet-card">' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<input type="password" id="swGeminiKeyInp" class="sw-input" style="flex:1;min-width:220px" placeholder="AIzaSy..." value="' + esc((typeof window.getGeminiApiKey === 'function' ? window.getGeminiApiKey() : (localStorage.getItem('ttc_gemini_api_key') || localStorage.getItem('gemini_api_key') || ''))) + '">' +
          '<button class="btn btn-primary" id="swSaveGeminiKeyBtn">💾 Сохранить API Ключ</button>' +
        '</div>' +
      '</div>' +
    '</div>' +

    /* Память устройства, Облачная синхронизация GitHub и Экспорт/Импорт */
    (typeof AppStorage !== 'undefined' && AppStorage.renderWidget ? AppStorage.renderWidget('sw') : '') +
    (typeof GHSync !== 'undefined' && GHSync.renderUI ? '<div style="margin-top:14px">' + GHSync.renderUI() + '</div>' : '') +

    '<div class="sheet-section">' +
      '<div class="section-label">📦 Экспорт и Импорт (JSON)</div>' +
      '<div class="desc">Единый файл на весь раздел «Звездные войны»: все профили персонажей, способности, приёмы, навыки и хроника.</div>' +
      '<div class="sheet-actions" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">' +
        '<button class="btn btn-primary" id="swExportJsonBtn">⬇️ Экспорт в файл</button>' +
        '<label class="btn btn-ghost" style="cursor:pointer;margin:0">⬆️ Импорт из файла <input type="file" id="swImportJsonInp" accept=".json" style="display:none"></label>' +
      '</div>' +
    '</div>';

  mount(html);

  if (typeof AppStorage !== 'undefined' && AppStorage.bindEvents) AppStorage.bindEvents('sw');
  if (typeof AppStorage !== 'undefined' && AppStorage.wireWidget) AppStorage.wireWidget('sw');
  if (typeof GHSync !== 'undefined' && GHSync.bindUI) GHSync.bindUI();
  if (typeof GHSync !== 'undefined' && GHSync.wireUI) GHSync.wireUI();

  document.getElementById('swDataBackHome').addEventListener('click', function() {
    go({ screen: 'swHome' });
  });

  // Переключение визуальной темы (Jedi vs Sith)
  var themeSel = document.getElementById('swThemeSelect');
  if (themeSel) {
    themeSel.addEventListener('change', function() {
      SW.setTheme(themeSel.value);
      swData();
    });
  }
  document.querySelectorAll('[data-sw-theme-pick]').forEach(function(card) {
    card.addEventListener('click', function() {
      var picked = card.getAttribute('data-sw-theme-pick');
      if (picked) {
        SW.setTheme(picked);
        swData();
      }
    });
  });

  // Сворачивание и разворачивание анкеты персонажа
  var toggleHeader = document.getElementById('swCharHeaderToggle');
  if (toggleHeader) {
    toggleHeader.addEventListener('click', function() {
      var content = document.getElementById('swCharSheetContent');
      var icon = document.getElementById('swCharToggleIcon');
      var lbl = document.getElementById('swCharToggleLabel');
      if (!content) return;
      var isHidden = content.style.display === 'none';
      if (isHidden) {
        content.style.display = 'block';
        if (icon) icon.style.transform = '';
        if (lbl) lbl.textContent = 'Свернуть';
        SW.charSheetCollapsed = false;
        try { localStorage.setItem('ttc_sw_char_collapsed', '0'); } catch (e) {}
      } else {
        content.style.display = 'none';
        if (icon) icon.style.transform = 'rotate(-90deg)';
        if (lbl) lbl.textContent = 'Развернуть';
        SW.charSheetCollapsed = true;
        try { localStorage.setItem('ttc_sw_char_collapsed', '1'); } catch (e) {}
      }
    });
  }

  var saveGemBtn = document.getElementById('swSaveGeminiKeyBtn');
  if (saveGemBtn) {
    saveGemBtn.addEventListener('click', function() {
      var k = (document.getElementById('swGeminiKeyInp').value || '').trim();
      try {
        if (k) {
          localStorage.setItem('ttc_gemini_api_key', k);
          localStorage.setItem('gemini_api_key', k);
        } else {
          localStorage.removeItem('ttc_gemini_api_key');
          localStorage.removeItem('gemini_api_key');
        }
      } catch (e) {}
      alert(k ? '✓ Ключ Gemini API сохранён!' : 'Ключ удалён.');
    });
  }

  function collectCharInputs() {
    prof.name = (document.getElementById('swInpName').value || '').trim();
    prof.race = (document.getElementById('swInpRace').value || '').trim();
    prof.path = (document.getElementById('swInpPath').value || '').trim();
    prof.title = (document.getElementById('swInpTitle').value || '').trim();
    prof.level = parseInt(document.getElementById('swInpLevel').value, 10) || 1;
    prof.hp = parseInt(document.getElementById('swInpHp').value, 10) || 0;
    prof.ac = parseInt(document.getElementById('swInpAc').value, 10) || 10;
    prof.force = parseInt(document.getElementById('swInpForce').value, 10) || 0;
    prof.speed = (document.getElementById('swInpSpeed').value || '').trim() || '9 м';
    prof.weapon = (document.getElementById('swInpWeapon').value || '').trim();
    prof.armor = (document.getElementById('swInpArmor').value || '').trim();
    prof.ship = (document.getElementById('swInpShip').value || '').trim();
    prof.notes = document.getElementById('swInpNotes').value || '';
    SW.saveProfiles();
    if (typeof paintShBar === 'function') paintShBar();
    var st = document.getElementById('swSaveStatus');
    if (st) st.textContent = '✓ Сохранено (' + new Date().toLocaleTimeString('ru-RU') + ')';
  }

  ['swInpName','swInpRace','swInpPath','swInpTitle','swInpLevel','swInpHp','swInpAc','swInpForce','swInpSpeed','swInpWeapon','swInpArmor','swInpShip','swInpNotes'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', collectCharInputs);
      el.addEventListener('input', collectCharInputs);
    }
  });

  document.getElementById('swSaveCharBtn').addEventListener('click', function() {
    collectCharInputs();
    swData();
  });

  document.getElementById('swProfileSelect').addEventListener('change', function(e) {
    SW.activeProfileId = e.target.value;
    SW.saveProfiles();
    if (typeof paintShBar === 'function') paintShBar();
    swData();
  });

  document.getElementById('swNewProfBtn').addEventListener('click', function() {
    var name = prompt('Введите имя нового персонажа (или оставьте пустым):', '');
    if (name === null) return;
    var np = SW.defaultProfile(name.trim());
    SW.profiles.push(np);
    SW.activeProfileId = np.id;
    SW.saveProfiles();
    if (typeof paintShBar === 'function') paintShBar();
    swData();
  });

  document.getElementById('swCloneProfBtn').addEventListener('click', function() {
    var copy = JSON.parse(JSON.stringify(prof));
    copy.id = 'sw_char_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    copy.name = (prof.name || 'Новый персонаж') + ' (Копия)';
    SW.profiles.push(copy);
    SW.activeProfileId = copy.id;
    SW.saveProfiles();
    if (typeof paintShBar === 'function') paintShBar();
    swData();
  });

  var delBtn = document.getElementById('swDelProfBtn');
  if (delBtn) {
    delBtn.addEventListener('click', function() {
      if (SW.profiles.length <= 1) return;
      if (!confirm('Удалить профиль «' + (prof.name || 'Новый персонаж') + '»?')) return;
      SW.profiles = SW.profiles.filter(function(p) { return p.id !== prof.id; });
      SW.activeProfileId = SW.profiles[0].id;
      SW.saveProfiles();
      if (typeof paintShBar === 'function') paintShBar();
      swData();
    });
  }

  ['swMetaWorld', 'swMetaEra', 'swMetaNotes'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', function() {
        SW.meta.worldName = document.getElementById('swMetaWorld').value;
        SW.meta.era = document.getElementById('swMetaEra').value;
        SW.meta.campaignNotes = document.getElementById('swMetaNotes').value;
        SW.saveMeta();
      });
    }
  });

  document.getElementById('swExportJsonBtn').addEventListener('click', function() {
    var payload = {
      type: 'dnd_compendium_star_wars',
      exportedAt: new Date().toISOString(),
      profiles: SW.profiles,
      activeProfileId: SW.activeProfileId,
      meta: SW.meta
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'star_wars_profiles_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
  });

  document.getElementById('swImportJsonInp').addEventListener('change', function(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var data = JSON.parse(ev.target.result);
        if (Array.isArray(data.profiles) && data.profiles.length) {
          SW.profiles = data.profiles.map(function(p) { return SW._normalizeProfile(p); });
          SW.activeProfileId = data.activeProfileId || SW.profiles[0].id;
          if (data.meta) SW.meta = Object.assign(SW.meta, data.meta);
          if (SW.meta && SW.meta.theme) SW.setTheme(SW.meta.theme);
          SW.saveProfiles();
          SW.saveMeta();
          if (typeof paintShBar === 'function') paintShBar();
          swData();
        } else {
          alert('Неверный формат JSON для раздела Звездные войны.');
        }
      } catch (err) {
        alert('Ошибка чтения JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  });
}

window.swHome = swHome;
window.swTechs = swTechs;
window.swTechView = swTechView;
window.swTechEdit = swTechEdit;
window.swTechGen = swTechGen;
window.swMoves = swMoves;
window.swMoveView = swMoveView;
window.swMoveEdit = swMoveEdit;
window.swMoveGen = swMoveGen;
window.swSkills = swSkills;
window.swSkillEdit = swSkillEdit;
window.swSkillGen = swSkillGen;
window.swRef = swRef;
window.swRefView = swRefView;
window.swMap = swMap;
window.swData = swData;

})();

