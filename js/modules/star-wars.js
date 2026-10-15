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
          '<div class="sw-card-title"><span>🌌</span> Карта Мира</div>' +
          '<div class="sw-card-desc">Астрографическая карта Галактики: Миры Ядра, Мандалор, Коррибан и Внешнее Кольцо</div>' +
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
   6. КАРТА ГАЛАКТИКИ (swMap)
   ========================================================================== */
var SW_PLANETS = [
  { id: 'coruscant', name: 'Корусант', region: 'Миры Ядра', x: 500, y: 275, color: '#38bdf8', desc: 'Столица Галактики, планета-экуменополис, место расположения Храма Джедаев и Галактического Сената.' },
  { id: 'tython', name: 'Тайтон', region: 'Глубокое Ядро', x: 465, y: 315, color: '#7dd3fc', desc: 'Древняя колыбель Ордена Дже’дайи и Джедаев, богатая мощными нексусами Живой Силы.' },
  { id: 'alderaan', name: 'Альдераан', region: 'Миры Ядра', x: 548, y: 260, color: '#60a5fa', desc: 'Мир искусства, дипломатии и благородных домов вблизи Корусанта.' },
  { id: 'corellia', name: 'Кореллия', region: 'Миры Ядра', x: 530, y: 310, color: '#93c5fd', desc: 'Знаменитые верфи Галактики, родина лучших пилотов, контрабандистов и кораблей серии YT.' },
  { id: 'ilum', name: 'Илум', region: 'Неизведанные Регионы', x: 310, y: 175, color: '#38bdf8', desc: 'Ледяной священный мир в Неизведанных Регионах, где падаваны проходят Испытание и находят свой кайбер-кристалл.' },
  { id: 'csilla', name: 'Ксилла', region: 'Неизведанные Регионы', x: 255, y: 225, color: '#0284c7', desc: 'Скрытая ледяная столица Доминации Чиссов.' },
  { id: 'mandalore', name: 'Мандалор', region: 'Внешнее Кольцо', x: 640, y: 165, color: '#f59e0b', desc: 'Родина воинственных кланов Мандалорцев и кузниц священного сплава бескара.' },
  { id: 'korriban', name: 'Коррибан (Морабанд)', region: 'Внешнее Кольцо (Пространство Ситхов)', x: 695, y: 120, color: '#ef4444', desc: 'Древняя прародина Ситхов, Долина Тёмных Лордов и Академия Ситхов.' },
  { id: 'dromund', name: 'Дромунд-Каас', region: 'Пространство Ситхов', x: 740, y: 145, color: '#dc2626', desc: 'Окутанная грозовыми джунглями имперская столица Империи Ситхов.' },
  { id: 'dathomir', name: 'Датомир', region: 'Внешнее Кольцо', x: 600, y: 140, color: '#f43f5e', desc: 'Багровый мир Сестёр Ночи, Забраков и диких ранкоров.' },
  { id: 'kashyyyk', name: 'Кашиик', region: 'Среднее Кольцо', x: 625, y: 240, color: '#10b981', desc: 'Мир гигантских деревьев врошир, родина гордого народа Вуки.' },
  { id: 'nar_shaddaa', name: 'Нар-Шаддаа / Нал-Хатта', region: 'Пространство Хаттов', x: 715, y: 295, color: '#eab308', desc: '«Луна контрабандистов», неоновая столица криминальных синдикатов и Картеля Хаттов.' },
  { id: 'naboo', name: 'Набу', region: 'Среднее Кольцо', x: 585, y: 390, color: '#34d399', desc: 'Живописная планета озёр, водопадов и подводных городов гунганов.' },
  { id: 'tatooine', name: 'Татуин', region: 'Внешнее Кольцо', x: 685, y: 385, color: '#fbbf24', desc: 'Пустынный мир под двумя солнцами: космопорты Мос-Эйсли и Мос-Эспа, кантины и дюнные моря.' },
  { id: 'geonosis', name: 'Джеонозис', region: 'Внешнее Кольцо', x: 720, y: 410, color: '#f97316', desc: 'Каменистый мир оружейных заводов, литейных фабрик дроидов и гладиаторских арен.' },
  { id: 'kamino', name: 'Камино', region: 'За пределами Внешнего Кольца', x: 790, y: 445, color: '#38bdf8', desc: 'Штормовой океанический мир на краю Галактики, центр передового клонирования.' },
  { id: 'mustafar', name: 'Мустафар', region: 'Внешнее Кольцо', x: 430, y: 465, color: '#ef4444', desc: 'Вулканическая планета лавовых рек и древних святилищ Тёмной стороны.' },
  { id: 'hoth', name: 'Хот / Беспин', region: 'Внешнее Кольцо (Коридор Иссон)', x: 380, y: 425, color: '#bae6fd', desc: 'Ледяная пустошь Хот и газовый гигант Беспин с Облачным Городом.' },
  { id: 'dagobah', name: 'Дагоба', region: 'Внешнее Кольцо', x: 505, y: 455, color: '#4ade80', desc: 'Затерянный мир болот и джунглей, пронизанный чистой Живой Силой.' }
];

var swSelectedPlanetId = 'coruscant';

function swMap() {
  applyStarWarsTheme();
  var isSith = SW.getTheme() === 'sith';
  renderCrumb([
    { label: 'Звездные войны', nav: 'swHome' },
    { label: 'Карта Галактики' }
  ]);

  var selected = SW_PLANETS.find(function(p) { return p.id === swSelectedPlanetId; }) || SW_PLANETS[0];

  var nodesSvg = SW_PLANETS.map(function(p) {
    var isSel = (p.id === selected.id);
    var r = isSel ? 9 : 6;
    return '<g class="sw-planet-node" data-sw-planet="' + esc(p.id) + '">' +
      (isSel ? '<circle cx="' + p.x + '" cy="' + p.y + '" r="16" fill="none" stroke="' + p.color + '" stroke-width="1.6" stroke-dasharray="4 3"/>' : '') +
      '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + r + '" fill="' + p.color + '" stroke="#020617" stroke-width="2"/>' +
      '<text x="' + p.x + '" y="' + (p.y - 12) + '" text-anchor="middle" fill="' + (isSel ? '#ffffff' : (isSith ? '#fecdd3' : '#bae6fd')) + '" font-size="' + (isSel ? '13' : '11') + '" font-weight="700" style="text-shadow:0 2px 6px #000">' + esc(p.name) + '</text>' +
    '</g>';
  }).join('');

  var ringStrokeOuter = isSith ? 'rgba(239,68,68,0.2)' : 'rgba(56,189,248,0.16)';
  var ringStrokeMid = isSith ? 'rgba(239,68,68,0.28)' : 'rgba(56,189,248,0.22)';
  var routeStrokeA = isSith ? 'rgba(239,68,68,0.36)' : 'rgba(56,189,248,0.32)';
  var coreGlowColor = isSith ? '#ef4444' : '#38bdf8';

  var html =
    '<button class="back" id="swMapBackHome">← Назад</button>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px">' +
      '<div>' +
        '<h1 style="margin-bottom:4px;">🌌 Астрографическая Карта Галактики</h1>' +
        '<div class="desc" style="margin-bottom:0;">Выберите звёздную систему на голо-карте для просмотра разведданных сектора</div>' +
      '</div>' +
    '</div>' +

    '<div class="sw-galaxy-wrap">' +
      '<svg viewBox="0 0 1000 540" style="width:100%;height:auto;display:block">' +
        '<defs>' +
          '<radialGradient id="swCoreGlow" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#f59e0b" stop-opacity="0.38"/>' +
            '<stop offset="35%" stop-color="' + coreGlowColor + '" stop-opacity="0.22"/>' +
            '<stop offset="100%" stop-color="#020617" stop-opacity="0"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<!-- Спиральные рукава и Кольца Галактики -->' +
        '<ellipse cx="500" cy="275" rx="440" ry="225" fill="none" stroke="' + ringStrokeOuter + '" stroke-dasharray="8 6"/>' +
        '<ellipse cx="500" cy="275" rx="310" ry="160" fill="none" stroke="' + ringStrokeMid + '" stroke-dasharray="6 4"/>' +
        '<ellipse cx="500" cy="275" rx="170" ry="92" fill="none" stroke="rgba(245,158,11,0.28)"/>' +
        '<circle cx="500" cy="275" r="185" fill="url(#swCoreGlow)"/>' +
        '<!-- Главные гипермаршруты (Перлемианский, Кореллианский, Хайдианский) -->' +
        '<polyline points="380,425 430,465 505,455 585,390 530,310 500,275 640,165 695,120 740,145" fill="none" stroke="' + routeStrokeA + '" stroke-width="1.8" stroke-dasharray="5 5"/>' +
        '<polyline points="255,225 310,175 500,275 548,260 625,240 715,295 685,385 720,410 790,445" fill="none" stroke="rgba(245,158,11,0.32)" stroke-width="1.8" stroke-dasharray="5 5"/>' +
        '<!-- Подписи регионов -->' +
        '<text x="200" y="95" fill="' + (isSith ? 'rgba(252,165,165,0.5)' : 'rgba(125,211,252,0.45)') + '" font-size="12" font-family="Cinzel,serif" letter-spacing="2">НЕИЗВЕДАННЫЕ РЕГИОНЫ</text>' +
        '<text x="500" y="210" text-anchor="middle" fill="rgba(252,211,77,0.55)" font-size="11" font-family="Cinzel,serif" letter-spacing="2">МИРЫ ЯДРА</text>' +
        '<text x="815" y="95" text-anchor="end" fill="rgba(252,165,165,0.55)" font-size="12" font-family="Cinzel,serif" letter-spacing="2">ВНЕШНЕЕ КОЛЬЦО</text>' +
        nodesSvg +
      '</svg>' +
    '</div>' +

    '<div class="sw-char-sheet-card" style="margin-top:14px">' +
      '<div class="sw-char-header">' +
        '<span>🪐 ' + esc(selected.name) + '</span>' +
        '<span class="sw-role-badge">' + esc(selected.region) + '</span>' +
      '</div>' +
      '<div style="margin-top:10px;font-size:14px;color:#e2edf8;line-height:1.6">' + esc(selected.desc) + '</div>' +
    '</div>';

  mount(html);

  document.getElementById('swMapBackHome').addEventListener('click', function() {
    go({ screen: 'swHome' });
  });
  document.querySelectorAll('[data-sw-planet]').forEach(function(node) {
    node.addEventListener('click', function() {
      swSelectedPlanetId = node.getAttribute('data-sw-planet');
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

