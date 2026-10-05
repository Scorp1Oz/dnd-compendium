/* ============================================================
   МОДУЛЬ «КОСМОС» (MASS EFFECT)
   ============================================================ */
var ME = window.ME = {
  meta: {
    name: 'Космос',
    universe: 'Mass Effect',
    status: 'ONLINE'
  },
  
  // Базовое досье (статические параметры, без динамических шкал боя)
  defaultChar: {
    name: 'Джон Шепард',
    callsign: 'Коммандер',
    race: 'Человек',
    role: 'Солдат',
    origin: 'N7 / Землянин',
    biochemistry: 'Левоаминокислотная',
    level: 1,
    devPoints: 4,
    profBonus: 2,
    stats: { str: 14, dex: 14, con: 15, int: 10, wis: 12, cha: 10 },
    baseAc: 15,
    baseShield: 15,
    baseArmorPoints: 10,
    damageThreshold: 1,
    baseBarrier: 0,
    maxHp: 24,
    speed: '30 фт (9 м)',
    omniTool: 'Омнитек Марк-IV',
    bioAmp: '—',
    loadout: 'Штурмовая винтовка M-8 Мститель, Тяжелый пистолет M-3 Хищник, Броня N7',
    background: 'Герой Скиллианского блица. Отличная огневая подготовка, лидерские качества.'
  },

  // --- РОСТЕР И МУЛЬТИ-ПРОФИЛИ ОПЕРАТИВНИКОВ (ПО АНАЛОГИИ С ШИНОБИ) ---
  profiles: null,
  activeProfileId: null,

  loadProfiles: function(){
    try {
      var raw = localStorage.getItem('me_profiles');
      if(raw){
        var arr = JSON.parse(raw);
        if(Array.isArray(arr) && arr.length){
          ME.profiles = arr;
          return arr;
        }
      }
    } catch(e){}

    // Миграция существующих данных персонажа
    var initChar = null;
    try {
      var sc = localStorage.getItem('me_character');
      if(sc) initChar = JSON.parse(sc);
    } catch(e){}
    if(!initChar) initChar = JSON.parse(JSON.stringify(ME.defaultChar));

    var initPowers = [];
    try {
      var sp = localStorage.getItem('me_powers');
      if(sp) initPowers = JSON.parse(sp);
    } catch(e){}

    var initArsenal = [];
    try {
      var sa = localStorage.getItem('me_arsenal');
      if(sa) initArsenal = JSON.parse(sa);
    } catch(e){}

    var firstProf = {
      id: 'me_prof_default',
      name: initChar.name || 'Джон Шепард',
      callsign: initChar.callsign || 'Коммандер',
      race: initChar.race || 'Человек',
      role: initChar.role || 'Солдат',
      level: parseInt(initChar.level, 10) || 1,
      baseShield: parseInt(initChar.baseShield, 10) || 15,
      maxHp: parseInt(initChar.maxHp, 10) || 24,
      baseAc: parseInt(initChar.baseAc, 10) || 15,
      powers: Array.isArray(initPowers) ? initPowers : [],
      arsenal: Array.isArray(initArsenal) ? initArsenal : []
    };

    var list = [firstProf];
    ME.profiles = list;
    ME.activeProfileId = firstProf.id;
    try {
      localStorage.setItem('me_profiles', JSON.stringify(list));
      localStorage.setItem('me_active_profile_id', firstProf.id);
    } catch(e){}
    return list;
  },

  getProfiles: function(){
    if(!Array.isArray(ME.profiles) || !ME.profiles.length){
      return ME.loadProfiles();
    }
    return ME.profiles;
  },

  saveProfilesList: function(list){
    ME.profiles = list;
    try {
      localStorage.setItem('me_profiles', JSON.stringify(list));
    } catch(e){}
  },

  getActiveProfile: function(){
    var list = ME.getProfiles();
    if(!ME.activeProfileId){
      try { ME.activeProfileId = localStorage.getItem('me_active_profile_id'); } catch(e){}
    }
    var act = null;
    if(ME.activeProfileId){
      act = list.find(function(p){ return p.id === ME.activeProfileId; });
    }
    if(!act){
      act = list[0] || ME.createProfile({ name: 'Джон Шепард' });
      ME.activeProfileId = act.id;
      try { localStorage.setItem('me_active_profile_id', act.id); } catch(e){}
    }
    return act;
  },

  switchProfile: function(newId){
    if(!newId) return;
    var list = ME.getProfiles();
    var target = list.find(function(p){ return p.id === newId; });
    if(!target) return;
    ME.activeProfileId = target.id;
    try { localStorage.setItem('me_active_profile_id', target.id); } catch(e){}
    try {
      localStorage.setItem('me_character', JSON.stringify(target));
      localStorage.setItem('me_powers', JSON.stringify(target.powers || []));
      localStorage.setItem('me_arsenal', JSON.stringify(target.arsenal || []));
    } catch(e){}
    if(typeof render === 'function') render();
  },

  createProfile: function(opts){
    var list = ME.getProfiles();
    var p = {
      id: 'me_prof_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: (opts && opts.name) || 'Новый оперативник',
      callsign: (opts && opts.callsign) || '',
      race: (opts && opts.race) || 'Человек',
      role: (opts && opts.role) || 'Солдат',
      level: 1,
      baseShield: 15,
      maxHp: 24,
      baseAc: 15,
      powers: [],
      arsenal: []
    };
    list.push(p);
    ME.saveProfilesList(list);
    ME.switchProfile(p.id);
    return p;
  },

  cloneProfile: function(id){
    id = id || ME.activeProfileId;
    var list = ME.getProfiles();
    var src = list.find(function(p){ return p.id === id; }) || ME.getActiveProfile();
    if(!src) return null;
    var copy = JSON.parse(JSON.stringify(src));
    copy.id = 'me_prof_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    copy.name = (copy.name || 'Оперативник') + ' (Копия)';
    list.push(copy);
    ME.saveProfilesList(list);
    ME.switchProfile(copy.id);
    return copy;
  },

  resetProfile: function(id){
    id = id || ME.activeProfileId;
    var list = ME.getProfiles();
    var p = list.find(function(item){ return item.id === id; });
    if(!p) return;
    p.name = 'Новый оперативник';
    p.callsign = '';
    p.race = 'Человек';
    p.role = 'Солдат';
    p.level = 1;
    p.baseShield = 15;
    p.maxHp = 24;
    p.baseAc = 15;
    p.powers = [];
    p.arsenal = [];
    ME.saveProfilesList(list);
    if(ME.activeProfileId === id){
      try {
        localStorage.setItem('me_character', JSON.stringify(p));
        localStorage.setItem('me_powers', JSON.stringify([]));
        localStorage.setItem('me_arsenal', JSON.stringify([]));
      } catch(e){}
    }
    if(typeof render === 'function') render();
  },

  deleteProfile: function(id){
    id = id || ME.activeProfileId;
    var list = ME.getProfiles();
    if(list.length <= 1){
      ME.resetProfile(id);
      return;
    }
    var idx = list.findIndex(function(p){ return p.id === id; });
    if(idx === -1) return;
    list.splice(idx, 1);
    ME.saveProfilesList(list);
    if(ME.activeProfileId === id){
      var next = list[Math.max(0, idx - 1)] || list[0];
      ME.switchProfile(next.id);
    } else {
      if(typeof render === 'function') render();
    }
  },

  getChar: function(){
    return ME.getActiveProfile();
  },

  saveChar: function(c){
    var act = ME.getActiveProfile();
    if(act && c){
      act.name = c.name || 'Оперативник';
      act.callsign = c.callsign || '';
      act.race = c.race || 'Человек';
      act.role = c.role || 'Солдат';
      act.level = parseInt(c.level, 10) || 1;
      act.baseShield = parseInt(c.baseShield, 10) || 15;
      act.maxHp = parseInt(c.maxHp, 10) || 24;
      act.baseAc = parseInt(c.baseAc, 10) || 15;
      ME.saveProfilesList(ME.profiles);
      try { localStorage.setItem('me_character', JSON.stringify(act)); } catch(e){}
    }
  },

  resetChar: function(){
    return ME.resetProfile(ME.activeProfileId);
  },

  // --- СПОСОБНОСТИ ОПЕРАТИВНИКА ---
  getPowers: function(){
    var act = ME.getActiveProfile();
    if(!Array.isArray(act.powers)) act.powers = [];
    return act.powers;
  },

  savePowers: function(list){
    var act = ME.getActiveProfile();
    act.powers = list;
    ME.saveProfilesList(ME.profiles);
    try { localStorage.setItem('me_powers', JSON.stringify(list)); } catch(e){}
  },

  addPower: function(p){
    var list = ME.getPowers();
    if(!p.id) p.id = 'pow_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    list.push(p);
    ME.savePowers(list);
    return p;
  },

  updatePower: function(p){
    var list = ME.getPowers();
    var idx = list.findIndex(function(item){ return item.id === p.id; });
    if(idx !== -1){
      list[idx] = p;
      ME.savePowers(list);
    }
  },

  deletePower: function(id){
    var list = ME.getPowers().filter(function(item){ return item.id !== id; });
    ME.savePowers(list);
  },

  // --- ОРУЖЕЙНЫЙ АРСЕНАЛ ОПЕРАТИВНИКА ---
  getArsenal: function(){
    var act = ME.getActiveProfile();
    if(!Array.isArray(act.arsenal)) act.arsenal = [];
    return act.arsenal;
  },

  saveArsenal: function(list){
    var act = ME.getActiveProfile();
    act.arsenal = list;
    ME.saveProfilesList(ME.profiles);
    try { localStorage.setItem('me_arsenal', JSON.stringify(list)); } catch(e){}
  },

  addWeapon: function(w){
    var list = ME.getArsenal();
    if(!w.id) w.id = 'wpn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    list.push(w);
    ME.saveArsenal(list);
    return w;
  },

  updateWeapon: function(w){
    var list = ME.getArsenal();
    var idx = list.findIndex(function(item){ return item.id === w.id; });
    if(idx !== -1){
      list[idx] = w;
      ME.saveArsenal(list);
    }
  },

  deleteWeapon: function(id){
    var list = ME.getArsenal().filter(function(item){ return item.id !== id; });
    ME.saveArsenal(list);
  },

  // Спецбоеприпасы (справочная матрица Альянса)
  ammo: [
    { name: 'Зажигательные патроны', type: 'Огонь', effect: '+1d6 огненного урона, поджог на 2 раунда. Двойной урон (×2) по броне и органике (HP).' },
    { name: 'Крио-патроны', type: 'Крио', effect: '+1d4 крио-урона, спасбросок ТЕЛ или замедление на 50%. Размягчает броню целей.' },
    { name: 'Бронебойные патроны', type: 'Кинетика/Пробитие', effect: 'Игнорируют 2 единицы порога брони цели, +1d6 кинетического урона по броне.' },
    { name: 'Деформирующие патроны', type: 'Биотика', effect: '+1d8 биотического урона. Удвоенный урон (×2) по барьерам и броне; усиливают био-комбо.' },
    { name: 'Фазовые патроны', type: 'Электро/Импульс', effect: '+2d6 электро-урона по щитам и синтетикам. Снимают кинетические барьеры за секунды.' }
  ],

  // --- КОРАБЛЬ И ЭКИПАЖ (СТАНДАРТНЫЕ СЛОТЫ МОДУЛЕЙ И КАСТОМНЫЙ ЭКИПАЖ) ---
  defaultShipData: {
    name: 'Не зарегистрировано',
    cls: 'Фрегат / Класс не определен',
    status: 'Требуется оснащение систем',
    notes: 'Корабль находится в сухом доке. Заполните стандартные слоты модулей и укомплектуйте экипаж.',
    modules: [
      { id: 'core', slot: 'Ядро масс-эффекта и Двигатели', icon: '⚛️', name: 'Слот пуст', stat: 'Не установлено', desc: 'Место под маршевые двигатели и танталовое ядро масс-эффекта.' },
      { id: 'shields', slot: 'Генератор щитов и Барьеры', icon: '🛡️', name: 'Слот пуст', stat: 'Не установлено', desc: 'Место под многослойные кинетические генераторы барьеров и щитов.' },
      { id: 'armor', slot: 'Броня корпуса и Защита', icon: '🧱', name: 'Слот пуст', stat: 'Не установлено', desc: 'Место под композитную абляционную броню, нанотрубки и теплоотводы.' },
      { id: 'weapons', slot: 'Орудийные системы и Калибр', icon: '💥', name: 'Слот пуст', stat: 'Не установлено', desc: 'Место под главный калибр, излучатели частиц или систему ПОИСК.' },
      { id: 'sensors', slot: 'Сенсоры, Связь и Стелс', icon: '📡', name: 'Слот пуст', stat: 'Не установлено', desc: 'Место под массив сенсоров дальнего обнаружения и систему IES.' },
      { id: 'life', slot: 'Жизнеобеспечение и Медотсек', icon: '🩺', name: 'Слот пуст', stat: 'Не установлено', desc: 'Место под капсулы СЖО, криокамеры и медотсек с запасом панацелина.' },
      { id: 'cargo', slot: 'Грузовой трюм и Спецмодули', icon: '📦', name: 'Слот пуст', stat: 'Не установлено', desc: 'Свободный отсек для вспомогательного челнока, зондов или мастерской.' }
    ],
    crew: []
  },

  shipData: null,
  getShip: function(){
    if(ME.shipData) return ME.shipData;
    try {
      var saved = localStorage.getItem('me_ship_data');
      if(saved) {
        ME.shipData = JSON.parse(saved);
        return ME.shipData;
      }
    } catch(e){}
    ME.shipData = JSON.parse(JSON.stringify(ME.defaultShipData));
    return ME.shipData;
  },

  saveShip: function(s){
    ME.shipData = s;
    try {
      localStorage.setItem('me_ship_data', JSON.stringify(s));
    } catch(e){}
  },

  resetShip: function(){
    ME.shipData = JSON.parse(JSON.stringify(ME.defaultShipData));
    ME.saveShip(ME.shipData);
    return ME.shipData;
  },

  updateShipInfo: function(name, cls, status, notes){
    var s = ME.getShip();
    s.name = name;
    s.cls = cls;
    s.status = status;
    s.notes = notes;
    ME.saveShip(s);
  },

  updateShipModule: function(modId, name, stat, desc){
    var s = ME.getShip();
    var m = s.modules.find(function(item){ return item.id === modId; });
    if(m){
      m.name = name;
      m.stat = stat;
      m.desc = desc;
      ME.saveShip(s);
    }
  },

  addCrewMember: function(c){
    var s = ME.getShip();
    if(!c.id) c.id = 'crew_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    s.crew.push(c);
    ME.saveShip(s);
    return c;
  },

  updateCrewMember: function(c){
    var s = ME.getShip();
    var idx = s.crew.findIndex(function(item){ return item.id === c.id; });
    if(idx !== -1){
      s.crew[idx] = c;
      ME.saveShip(s);
    }
  },

  deleteCrewMember: function(id){
    var s = ME.getShip();
    s.crew = s.crew.filter(function(item){ return item.id !== id; });
    ME.saveShip(s);
  },

  // Процедурный генератор миссий
  generateMission: function(){
    var clients = [
      { name: 'Альянс Систем', icon: '🎖️', desc: 'Командование 5-го флота' },
      { name: 'СБ Цитадели (C-Sec)', icon: '🛡️', desc: 'Исполнительный комитет безопасности' },
      { name: 'STG (ГОР саларианцев)', icon: '🦎', desc: 'Группа Особого Реагирования' },
      { name: 'Теневой Брокер', icon: '👁️', desc: 'Шифрованный терминал агентурной сети' },
      { name: 'Ария Т\'Лоак (Омега)', icon: '🍷', desc: 'Контракт станции Омега' }
    ];
    var planets = [
      'Цитадель (Президиум и Трущобы)', 'Илос (Руины протеан)', 'Новерия (Лаборатории Пик 15)',
      'Омега (Станция Терминуса)', 'Тучанка (Пустоши Кроганов)', 'Ферос (Колония Надежда Чжу)',
      'Святилище (Сектор Горизонт)', 'Заброшенный дрейфующий фрахтовщик'
    ];
    var targets = [
      'Ликвидировать полевого командира наёмников',
      'Извлечь зашифрованное ядро экспериментального ВИ',
      'Освободить исследовательскую группу из захваченного комплекса',
      'Предотвратить диверсию на охладителе ретранслятора',
      'Зачистить гнездо мутировавших хасков и спасти образцы',
      'Перехватить партию контрабандного нулевого элемента'
    ];
    var enemies = [
      'Наёмники «Затмение» (азари-биотики и мехи LOKI)',
      'Картель «Синие Светила» (батарианские штурмовики и тяжелые орудия)',
      'Банда «Кровавая Стая» (кроганы и ворча с огнеметами)',
      'Диверсионная группа «Цербера» (фантомы и центурионы)',
      'Разведывательный рой Гетов (платформы охотников)',
      'Коллекционеры (трутни и предвестники)'
    ];
    var twists = [
      'Утечка токсичной радиации: таймер 5 раундов до закрытия шлюзов.',
      'Генераторы помех: связь с кораблем полностью заглушена.',
      'Противник активировал стационарную тяжелую турель YMIR.',
      'Один из заложников оказался замаскированным агентом врага.',
      'Атмосферный вакуум: повреждение скафандров грозит удушьем.'
    ];

    var cl = clients[Math.floor(Math.random()*clients.length)];
    var pl = planets[Math.floor(Math.random()*planets.length)];
    var tg = targets[Math.floor(Math.random()*targets.length)];
    var en = enemies[Math.floor(Math.random()*enemies.length)];
    var tw = twists[Math.floor(Math.random()*twists.length)];
    var rank = Math.floor(Math.random()*4) + 1;
    var credits = (rank * 1500) + Math.floor(Math.random()*10)*100;
    var op = rank;

    return {
      id: 'mis_' + Date.now() + '_' + Math.floor(Math.random()*100),
      client: cl.name,
      clientIcon: cl.icon,
      location: pl,
      rank: rank,
      target: tg,
      enemy: en,
      twist: tw,
      reward: credits + ' кредитов, +' + op + ' ОР',
      status: 'active'
    };
  }
};

// HTML escape helper
// Предустановленные шаблоны A92 для опционального быстрого добавления в 1 клик
var ME_CANON_POWERS_PRESETS = [
  { branch: 'Биотика', icon: '🌀', name: 'Притяжение', cd: 3, req: 'Узлы L-типа', cost: 1, r1: 'Цель в 40 фт без щита/барьера поднимается в воздух на 20 фт (Обездвижена).', r2: 'Длительность 2 хода.', r3: 'Захватывает сразу две цели в радиусе 15 фт.', desc: 'Микро-гравитационное поле, выдергивающее из укрытия.' },
  { branch: 'Биотика', icon: '💨', name: 'Отталкивание', cd: 2, req: 'Узлы L-типа', cost: 1, r1: '1d8 биотического урона, отброс на 15 фт (Сбита с ног).', r2: '2d8 урона, отброс на 20 фт.', r3: 'Конус отталкивания 15 фт.', desc: 'Импульсная биотическая волна, активирует био-детонации.' },
  { branch: 'Биотика', icon: '🛡️', name: 'Барьер', cd: 5, req: 'Узлы L-типа', cost: 1, r1: 'Биотический щит емкостью 10 единиц вокруг себя.', r2: 'Емкость 15 единиц.', r3: 'Емкость 20 единиц или наложение на союзника в 30 фт.', desc: 'Концентрированное защитное силовое поле.' },
  { branch: 'Биотика', icon: '💥', name: 'Деформация', cd: 3, req: 'Узлы L-типа', cost: 1, r1: '2d6 биотического урона (x2 по барьерам и броне). Порог брони -1.', r2: '3d6 урона.', r3: 'Снижает порог брони цели на -2.', desc: 'Молекулярное гравитационное искажение.' },
  { branch: 'Биотика', icon: '⚡', name: 'Биотический рывок', cd: 3, req: 'Узлы L-типа', cost: 1, r1: 'Рывок до 40 фт: 1d10 урона, восстанавливает +5 к щиту.', r2: '2d10 урона.', r3: '100% восстановление щитов при ударе.', desc: 'Сближение со скоростью света с таранным импульсом.' },
  { branch: 'Биотика', icon: '❄️', name: 'Стазис', cd: 4, req: 'Узлы L-типа', cost: 1, r1: 'Цель замирает в пространстве на 1 раунд (спасбр. МУД).', r2: 'Длительность 2 раунда.', r3: 'Срабатывает даже по защищенной цели.', desc: 'Локальная кинетическая остановка цели.' },
  { branch: 'Техника', icon: '⚡', name: 'Перегрузка', cd: 3, req: 'Омни-инструмент', cost: 1, r1: '2d6 электро-урона (по щитам и синтетикам x2).', r2: '3d6 урона.', r3: 'Цепная дуга на вторую цель в 15 фт.', desc: 'Высоковольтный электромагнитный импульс.' },
  { branch: 'Техника', icon: '🔥', name: 'Поджог', cd: 3, req: 'Омни-инструмент', cost: 1, r1: '2d6 огненного урона, горение 1d4 (x2 по броне).', r2: '3d6 урона.', r3: 'Радиус взрыва 5 фт вокруг цели.', desc: 'Плазменный термозаряд, выжигающий броню.' },
  { branch: 'Техника', icon: '🧊', name: 'Заморозка', cd: 3, req: 'Омни-инструмент', cost: 1, r1: '1d6 крио-урона, скорость 0 и помеха на атаки.', r2: '2d6 урона.', r3: 'Радиус заморозки 5 фт.', desc: 'Субнулевое охлаждение, размягчающее броню.' },
  { branch: 'Техника', icon: '💻', name: 'Взлом синтетиков', cd: 4, req: 'Омни-инструмент', cost: 1, r1: 'Мех, дрон или турель переходят на твою сторону на 2 раунда.', r2: 'Длительность 3 раунда.', r3: 'Постоянный контроль до гибели единицы.', desc: 'Перехват протоколов управления синтетиками.' },
  { branch: 'Техника', icon: '👤', name: 'Тактическая маскировка', cd: 5, req: 'Омни-инструмент', cost: 1, r1: 'Невидимость на 2 раунда; атака с преимуществом.', r2: 'Длительность 3 раунда.', r3: 'Критический удар на 19-20 из маскировки.', desc: 'Светопреломляющее покрытие костюма.' },
  { branch: 'Бой', icon: '💉', name: 'Адреналиновый прилив', cd: 4, req: 'Боевая подготовка', cost: 1, r1: 'Замедление времени: дополнительное действие атаки в ход.', r2: '+2 к урону оружием.', r3: 'Снижает весь входящий урон на 25%.', desc: 'Боевой био-стимулятор мышечной реакции.' },
  { branch: 'Бой', icon: '🎯', name: 'Оглушающий выстрел', cd: 2, req: 'Боевая подготовка', cost: 1, r1: '1d6 урона, цель Сбита с ног; спасбр. СИЛ.', r2: '2d6 урона.', r3: 'Радиус детонации 10 фт.', desc: 'Выстрел микро-снарядом с кинетическим импульсом.' },
  { branch: 'Медицина', icon: '🩹', name: 'Инъекция омни-геля', cd: 3, req: 'Омни-инструмент', cost: 1, r1: 'Восстанавливает 1d8+ИНТ здоровья союзнику в 5 фт.', r2: '2d8+ИНТ лечения.', r3: 'Снимает эффекты горения и заморозки.', desc: 'Синтез медицинского геля в полевых условиях.' }
];

// Предустановленные шаблоны оружия Альянса
var ME_CANON_WEAPONS_PRESETS = [
  { name: 'M-8 «Мститель»', cat: 'rifles', type: 'Штурмовая винтовка', dmg: '1d8+2 кин.', range: '60/180 фт', clip: 30, desc: 'Надежная стандартная винтовка Альянса. Универсальный выбор пехоты.' },
  { name: 'M-96 «Мотыга»', cat: 'rifles', type: 'Тяжелая винтовка', dmg: '1d10+2 кин.', range: '80/240 фт', clip: 16, desc: 'Полуавтоматическая штурмовая винтовка с тяжелым ударом и высокой кучностью.' },
  { name: 'M-3 «Хищник»', cat: 'pistols', type: 'Тяжелый пистолет', dmg: '1d6+1 кин.', range: '40/120 фт', clip: 12, desc: 'Штатный пистолет офицеров флота Альянса. Надежен в любых условиях.' },
  { name: 'M-6 «Палач»', cat: 'pistols', type: 'Тяжелый пистолет', dmg: '1d8+2 кин.', range: '50/150 фт', clip: 6, desc: 'Ручная пушка. Бронебойные патроны наносят огромный урон броне и металлу.' },
  { name: 'M-4 «Сюрикен»', cat: 'pistols', type: 'Пистолет-пулемет', dmg: '1d6 кин. (очередь 3)', range: '30/90 фт', clip: 24, desc: 'Легкий ПП с отсечкой по три выстрела. Быстро разрушает щиты.' },
  { name: 'M-23 «Меч»', cat: 'shotguns', type: 'Дробовик', dmg: '2d6+2 кин.', range: '20/40 фт', clip: 8, desc: 'Классический военный дробовик с колоссальным уроном в упор.' },
  { name: 'M-92 «Богомол»', cat: 'snipers', type: 'Снайперская винтовка', dmg: '1d12+3 кин.', range: '150/600 фт', clip: 1, desc: 'Снайперская винтовка с ручной перезарядкой. Смертельна в уязвимые точки.' },
  { name: 'M-98 «Вдова»', cat: 'snipers', type: 'Антиматериальная винтовка', dmg: '2d10+4 кин.', range: '200/800 фт', clip: 1, desc: 'Тяжелая крупнокалиберная винтовка, способная пробить броню бронетранспортера.' },
  { name: 'М-920 «Каин»', cat: 'heavy', type: 'Тяжелое ядерное орудие', dmg: '10d10 взрывной', range: '100 фт', clip: 1, desc: 'Переносной микро-ускоритель массы. Вызывает локальный ядерный взрыв.' }
];

// Каноничный пресет судна «Нормандия SR-2»
var ME_CANON_NORMANDY_PRESET = {
  name: 'Нормандия',
  cls: 'Стелс-фрегат глубокой разведки Альянса',
  status: '100% НОМИНАЛ // ГОТОВ К ВЫЛЕТУ',
  notes: 'Флагман тактической разведки Альянса. Оснащен передовой маскировкой IES и орудием Таникс.',
  modules: [
    { id: 'core', slot: 'Ядро масс-эффекта и Двигатели', icon: '⚛️', name: 'Танталовое ядро масс-эффекта', stat: 'Номинал (без следа)', desc: 'Ядро увеличенного объема, позволяющее двигаться без выброса тепла и радиации.' },
    { id: 'shields', slot: 'Генератор щитов и Барьеры', icon: '🛡️', name: 'Щиты «Циклоп»', stat: '100% Заряд', desc: 'Многослойные кинетические щиты по технологии азари, отражающие кинетические снаряды.' },
    { id: 'armor', slot: 'Броня корпуса и Защита', icon: '🧱', name: 'Броня «Силарис»', stat: '100% Целостность', desc: 'Углеродные нанотрубки с титановым напылением, устойчивые к лазерному нагреву.' },
    { id: 'weapons', slot: 'Орудийные системы и Калибр', icon: '💥', name: 'Главный калибр «Таникс»', stat: 'Готов к залпу', desc: 'Магнитно-гидродинамическое орудие на основе технологий Властелина.' },
    { id: 'sensors', slot: 'Сенсоры, Связь и Стелс', icon: '📡', name: 'Стелс-система IES', stat: 'Активна', desc: 'Радиаторы хранения внутреннего тепла. Корабль невидим для дальних сенсоров.' },
    { id: 'life', slot: 'Жизнеобеспечение и Медотсек', icon: '🩺', name: 'Модульный медотсек', stat: 'Снабжен', desc: 'Капсула крио-восстановления и запас панацелина для полевой хирургии.' },
    { id: 'cargo', slot: 'Грузовой трюм и Спецмодули', icon: '📦', name: 'Челнок «Кадьяк» UT-47', stat: 'В ангаре', desc: 'Бронированный десантный челнок для оперативной высадки наземных групп.' }
  ],
  crew: [
    { id: 'cr_joker', name: 'Джефф «Джокер» Моро', race: 'Человек', role: 'Главный пилот / Рулевой', loyalty: 'Предан', note: 'Лучший рулевой флота Альянса. Синдром Вролика.' },
    { id: 'cr_garrus', name: 'Гаррус Вакариан', race: 'Турианец', role: 'Начальник оружейных систем', loyalty: 'Предан', note: 'Калибровка орудия «Таникс» и тактическое прикрытие.' },
    { id: 'cr_liara', name: 'Лиара Т\'Сони', race: 'Азари', role: 'Научный офицер / Исследователь', loyalty: 'Предана', note: 'Специалист по технологиям протеан и мощный биотик.' },
    { id: 'cr_tali', name: 'Тали\'Зора вас Нормандия', race: 'Кварианка', role: 'Главный инженер привода', loyalty: 'Предана', note: 'Гениальный инженер двигателей масс-эффекта.' },
    { id: 'cr_mordin', name: 'Мордин Солус', race: 'Саларианец', role: 'Бортовой врач-генетик', loyalty: 'Предан', note: 'Бывший оперативник STG. Скоростной гений биохимии.' }
  ]
};

// Модальное окно для Mass Effect
function meShowModal(title, subtitle, bodyHtml, onSave){
  var old = document.querySelector('.me-modal-overlay');
  if(old) old.remove();

  var overlay = document.createElement('div');
  overlay.className = 'me-modal-overlay';
  overlay.innerHTML = '<div class="me-modal-box">' +
    '<div class="me-modal-header">' +
      '<div>' +
        '<div style="font-size:16px;font-weight:700;color:#00d2ff;font-family:monospace;">' + meEsc(title) + '</div>' +
        (subtitle ? '<div style="font-size:11.5px;color:#7da5c9;margin-top:2px;">' + meEsc(subtitle) + '</div>' : '') +
      '</div>' +
      '<button class="btn-subtle" id="meModalCloseBtn" style="font-size:14px;padding:2px 8px;cursor:pointer;">✕</button>' +
    '</div>' +
    '<div class="me-modal-body" style="margin-bottom:16px;">' + bodyHtml + '</div>' +
    '<div style="display:flex;justify-content:flex-end;gap:10px;">' +
      '<button class="btn-subtle" id="meModalCancelBtn">Отмена</button>' +
      (onSave ? '<button class="btn-primary" id="meModalSaveBtn">Сохранить</button>' : '') +
    '</div>' +
  '</div>';

  document.body.appendChild(overlay);

  var close = function(){ overlay.remove(); };
  document.getElementById('meModalCloseBtn').onclick = close;
  document.getElementById('meModalCancelBtn').onclick = close;
  overlay.onclick = function(e){ if(e.target === overlay) close(); };

  if(onSave){
    document.getElementById('meModalSaveBtn').onclick = function(){
      if(onSave() !== false) close();
    };
  }
}

function meEsc(s){
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function meNavHeader(title, tag){
  return '<div class="me-hud">' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
      '<button class="btn-subtle" data-go="meHome" style="color:#00d2ff;border-color:rgba(0,210,255,0.4);font-family:monospace;padding:4px 10px;cursor:pointer;">← В ТЕРМИНАЛ</button>' +
      '<span class="me-hud-status"><span class="me-hud-pulse"></span>' + meEsc(title) + '</span>' +
    '</div>' +
    '<div style="display:flex;gap:6px;">' +
      '<span class="me-tag-holo">' + meEsc(tag || 'EXTRANET ONLINE') + '</span>' +
      '<span class="me-tag-omni">СИСТЕМЫ СВЯЗИ</span>' +
    '</div>' +
  '</div>';
}


/* ==========================================================================
   MASS EFFECT ENGINE & THEMES
   ========================================================================== */
window.getMeTheme = function(){
  try { return localStorage.getItem('me_theme') || 'citadel'; } catch(e){ return 'citadel'; }
};
window.setMeTheme = function(t){
  try { localStorage.setItem('me_theme', t); } catch(e){}
  applyMeTheme();
};

function initCitadelParticles(){
  if(typeof document === 'undefined' || !document.body) return null;
  var cont = document.getElementById('meCitadelParticles');
  if(!cont){
    cont = document.createElement('div');
    cont.id = 'meCitadelParticles';
    cont.className = 'me-citadel-particles';
    cont.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(cont, document.body.firstChild);
  }
  if(!cont.children || cont.children.length === 0){
                // Простые синие вертикальные полоски с неоновым свечением
    for(var i = 0; i < 22; i++){
      var p = document.createElement("div");
      p.className = "me-citadel-traffic-streak";
      var w = 2;
      var h = Math.floor(16 + Math.random() * 24); // 16px - 40px
      p.style.width = w + "px";
      p.style.height = h + "px";
      p.style.left = (Math.random() * 100).toFixed(2) + "%";
      p.style.bottom = "-60px";
      var duration = (12 + Math.random() * 10).toFixed(2); // 12s - 22s
      var delay = (-Math.random() * 22).toFixed(2);
      var maxOp = (0.55 + Math.random() * 0.30).toFixed(2); // 0.55 - 0.85 (выразительное неоновое свечение)
      p.style.setProperty("--p-op", maxOp);
      p.style.animation = "citadelTrafficStream " + duration + "s linear " + delay + "s infinite";
      cont.appendChild(p);
    }

    // Летающие на фоне голографические логотипы Цитадели
    for(var j = 0; j < 12; j++){
      var c = document.createElement('div');
      c.className = 'me-citadel-crest-particle';
      var csize = Math.floor(32 + Math.random() * 32); // 32px - 64px
      c.style.width = csize + 'px';
      c.style.height = csize + 'px';
      c.style.left = Math.floor(4 + Math.random() * 88) + '%';
      c.style.top = Math.floor(4 + Math.random() * 88) + '%';
      var cdur = (22 + Math.random() * 18).toFixed(1); // 22s - 40s
      var cdelay = (-Math.random() * 35).toFixed(1);
      var cop = (0.10 + Math.random() * 0.08).toFixed(2); // 0.10 - 0.18
      c.style.setProperty('--p-op', cop);
      var canim = (j % 2 === 0) ? 'citadelDrift1' : 'citadelDrift2';
      c.style.animation = canim + ' ' + cdur + 's ease-in-out ' + cdelay + 's infinite';
      cont.appendChild(c);
    }
  }
  return cont;
}

function initOmniProjections(){
  if(typeof document === "undefined" || !document.body) return null;
  var cont = document.getElementById("meOmniProjections");
  if(!cont){
    cont = document.createElement("div");
    cont.id = "meOmniProjections";
    cont.className = "me-omni-projections";
    cont.setAttribute("aria-hidden", "true");
    document.body.insertBefore(cont, document.body.firstChild);
  }
  if(!cont.children || cont.children.length === 0){
    // 1. Сканирующий луч
    var beam = document.createElement("div");
    beam.className = "omni-scan-beam";
    cont.appendChild(beam);

    // 2. Вращающийся радар-диск
    var radar = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    radar.setAttribute("class", "omni-radar-widget");
    radar.setAttribute("viewBox", "0 0 400 400");
    radar.setAttribute("fill", "none");
    radar.setAttribute("stroke", "#ff8800");
    radar.innerHTML = '<g class="omni-spin-cw">' +
      '<circle cx="200" cy="200" r="180" stroke-width="1.5" stroke-dasharray="16 8 4 8" />' +
      '<circle cx="200" cy="200" r="160" stroke-width="1" stroke-opacity="0.4" />' +
      '<path d="M 200,10 L 200,30 M 200,370 L 200,390 M 10,200 L 30,200 M 370,200 L 390,200" stroke-width="2" />' +
      '</g>' +
      '<g class="omni-spin-ccw">' +
      '<path d="M 200,60 A 140 140 0 0 1 340,200" stroke-width="3" stroke-linecap="round" />' +
      '<path d="M 200,340 A 140 140 0 0 1 60,200" stroke-width="2" stroke-dasharray="8 6" />' +
      '<circle cx="200" cy="200" r="100" stroke-width="1.5" stroke-dasharray="30 15" stroke-opacity="0.6" />' +
      '</g>' +
      '<circle cx="200" cy="200" r="40" stroke-width="1" stroke-dasharray="4 4" />' +
      '<path d="M 180,200 L 220,200 M 200,180 L 200,220" stroke-width="1.5" />' +
      '<text x="200" y="250" text-anchor="middle" fill="#ffaa33" stroke="none" font-size="10" letter-spacing="2" font-family="monospace">OMNI // RADAR</text>';
    cont.appendChild(radar);

    // 3. Гексагональная сетка синтеза / щита слева
    var hex = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    hex.setAttribute("class", "omni-hex-matrix");
    hex.setAttribute("viewBox", "0 0 240 240");
    hex.setAttribute("fill", "none");
    hex.setAttribute("stroke", "#ff8800");
    hex.setAttribute("stroke-width", "1.2");
    hex.innerHTML = '<polygon points="60,20 100,20 120,55 100,90 60,90 40,55" fill="rgba(255,136,0,0.06)" />' +
      '<polygon points="120,55 160,55 180,90 160,125 120,125 100,90" fill="rgba(255,136,0,0.12)" />' +
      '<polygon points="60,90 100,90 120,125 100,160 60,160 40,125" fill="rgba(255,136,0,0.04)" />' +
      '<polygon points="120,125 160,125 180,160 160,195 120,195 100,160" fill="rgba(255,136,0,0.08)" />' +
      '<polygon points="180,90 220,90 240,125 220,160 180,160 160,125" />' +
      '<polygon points="0,90 40,90 60,125 40,160 0,160 -20,125" stroke-dasharray="4 4" />' +
      '<circle cx="100" cy="90" r="2.5" fill="#ffaa33" stroke="none" />' +
      '<circle cx="120" cy="125" r="3" fill="#ffedd5" stroke="none" />' +
      '<circle cx="160" cy="125" r="2.5" fill="#ffaa33" stroke="none" />' +
      '<text x="50" y="215" fill="#ffaa33" stroke="none" font-size="9" letter-spacing="1.5" font-family="monospace">[ FABRICATOR MATRIX ]</text>';
    cont.appendChild(hex);

    // 4. Волновой спектрограф слева внизу
    var wave = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    wave.setAttribute("class", "omni-wave-widget");
    wave.setAttribute("viewBox", "0 0 280 90");
    wave.setAttribute("fill", "none");
    wave.setAttribute("stroke", "#ff8800");
    wave.innerHTML = '<rect x="0" y="0" width="280" height="90" stroke-width="1" stroke-dasharray="4 6" stroke-opacity="0.3" rx="4" />' +
      '<path d="M 0,45 L 40,45 L 55,25 L 70,65 L 85,35 L 100,55 L 115,15 L 130,75 L 145,45 L 175,45 L 190,30 L 205,60 L 220,45 L 280,45" stroke-width="1.8" />' +
      '<line x1="0" y1="45" x2="280" y2="45" stroke-width="0.8" stroke-dasharray="2 4" stroke-opacity="0.4" />' +
      '<text x="12" y="20" fill="#ffaa33" stroke="none" font-size="9" letter-spacing="1" font-family="monospace">SIG.ANALYSIS // 142.8 MHz</text>' +
      '<text x="12" y="80" fill="#f97316" stroke="none" font-size="8" letter-spacing="1" font-family="monospace">STATUS: CARRIER ACQUIRED</text>' +
      '<rect x="230" y="12" width="38" height="6" fill="#ff8800" fill-opacity="0.3" stroke="none" />' +
      '<rect x="230" y="12" width="26" height="6" fill="#ffaa33" stroke="none" />';
    cont.appendChild(wave);

    // 5. Тактическая рамка справа внизу
    var target = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    target.setAttribute("class", "omni-target-widget");
    target.setAttribute("viewBox", "0 0 240 180");
    target.setAttribute("fill", "none");
    target.setAttribute("stroke", "#ff8800");
    target.innerHTML = '<path d="M 20,40 L 20,20 L 40,20" stroke-width="2" />' +
      '<path d="M 220,40 L 220,20 L 200,20" stroke-width="2" />' +
      '<path d="M 20,140 L 20,160 L 40,160" stroke-width="2" />' +
      '<path d="M 220,140 L 220,160 L 200,160" stroke-width="2" />' +
      '<circle cx="120" cy="90" r="45" stroke-width="1.2" stroke-dasharray="12 6" />' +
      '<circle cx="120" cy="90" r="15" stroke-width="1" />' +
      '<path d="M 120,35 L 120,45 M 120,135 L 120,145 M 65,90 L 75,90 M 165,90 L 175,90" stroke-width="1.5" />' +
      '<text x="45" y="30" fill="#ffaa33" stroke="none" font-size="9" letter-spacing="1.5" font-family="monospace">SYS.OMNI // V.4.12</text>' +
      '<text x="45" y="155" fill="#f97316" stroke="none" font-size="8" letter-spacing="1" font-family="monospace">COORD: 47.902 // +12.44</text>';
    cont.appendChild(target);

    // 6. Голографический Омни-клинок справа
    var blade = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    blade.setAttribute("class", "omni-blade-widget");
    blade.setAttribute("viewBox", "0 0 150 270");
    blade.setAttribute("fill", "none");
    blade.setAttribute("stroke", "#ff8800");
    blade.innerHTML = '<path d="M 40,250 L 75,20 L 110,250 Z" stroke-width="1.8" fill="rgba(255,136,0,0.06)" />' +
      '<path d="M 75,20 L 75,250" stroke-width="1.5" stroke-dasharray="6 4" />' +
      '<line x1="68" y1="60" x2="82" y2="60" stroke-width="1.5" />' +
      '<line x1="62" y1="100" x2="88" y2="100" stroke-width="1.5" />' +
      '<line x1="56" y1="140" x2="94" y2="140" stroke-width="1.5" />' +
      '<line x1="50" y1="180" x2="100" y2="180" stroke-width="1.5" />' +
      '<line x1="44" y1="220" x2="106" y2="220" stroke-width="1.5" />' +
      '<rect x="25" y="248" width="100" height="14" rx="2" stroke-width="1.2" fill="rgba(255,136,0,0.12)" />' +
      '<circle cx="75" cy="20" r="3" fill="#ffedd5" stroke="none" />' +
      '<text x="75" y="260" text-anchor="middle" fill="#ffedd5" stroke="none" font-size="7.5" letter-spacing="1" font-family="monospace">[ OMNI-BLADE ]</text>';
    cont.appendChild(blade);

    // 7. Летающие искры-частицы омнитула
    for(var i = 0; i < 14; i++){
      var sp = document.createElement("div");
      sp.className = "omni-spark";
      sp.style.left = (Math.random() * 100).toFixed(1) + "%";
      sp.style.bottom = (Math.random() * 80).toFixed(1) + "%";
      var dur = (9 + Math.random() * 8).toFixed(1);
      var del = (-Math.random() * 12).toFixed(1);
      var op = (0.30 + Math.random() * 0.40).toFixed(2);
      sp.style.setProperty("--sp-op", op);
      sp.style.animation = "omniSparkRise " + dur + "s ease-in-out " + del + "s infinite";
      cont.appendChild(sp);
    }
  }
  return cont;
}

function initN7Background(){
  if(typeof document === "undefined" || !document.body) return null;
  var cont = document.getElementById("meN7Background");
  if(!cont){
    cont = document.createElement("div");
    cont.id = "meN7Background";
    cont.className = "me-n7-background";
    cont.setAttribute("aria-hidden", "true");
    document.body.insertBefore(cont, document.body.firstChild);
  }
  if(!cont.children || cont.children.length === 0){
    // 1. Полоса брони N7
    var stripe = document.createElement("div");
    stripe.className = "n7-armor-stripe";
    stripe.innerHTML = '<div class="n7-stripe-white"></div><div class="n7-stripe-red"></div>';
    cont.appendChild(stripe);

    // 2. Статический логотип N7
    var logo = document.createElement("div");
    logo.className = "n7-static-logo";
    cont.appendChild(logo);

    // 3. Частички огня (искры/угольки)
    var fireColors = [
      { bg: "#ff3b00", shadow: "0 0 6px #ff3b00, 0 0 12px rgba(255, 59, 0, 0.8)" },
      { bg: "#ff6200", shadow: "0 0 5px #ff6200, 0 0 10px rgba(255, 98, 0, 0.8)" },
      { bg: "#ff8800", shadow: "0 0 6px #ff8800, 0 0 12px rgba(255, 136, 0, 0.8)" },
      { bg: "#ff2200", shadow: "0 0 5px #ff2200, 0 0 14px rgba(255, 34, 0, 0.8)" },
      { bg: "#ffaa33", shadow: "0 0 6px #ffaa33, 0 0 10px rgba(255, 170, 51, 0.7)" }
    ];

    for(var i = 0; i < 35; i++){
      var p = document.createElement("div");
      p.className = "n7-fire-ember";
      var size = (2 + Math.random() * 2.5).toFixed(1); // 2px - 4.5px
      p.style.width = size + "px";
      p.style.height = (size * (1 + Math.random() * 0.5)).toFixed(1) + "px";
      p.style.left = (Math.random() * 100).toFixed(2) + "%";
      p.style.bottom = "-30px";
      var col = fireColors[i % fireColors.length];
      p.style.background = col.bg;
      p.style.boxShadow = col.shadow;
      var dur = (7 + Math.random() * 9).toFixed(1); // 7s - 16s
      var del = (-Math.random() * 16).toFixed(1);
      var op = (0.45 + Math.random() * 0.45).toFixed(2);
      p.style.setProperty("--e-op", op);
      var anim = (i % 2 === 0) ? "n7EmberFloat1" : "n7EmberFloat2";
      p.style.animation = anim + " " + dur + "s ease-in-out " + del + "s infinite";
      cont.appendChild(p);
    }
  }
  return cont;
}

function initCerberusBackground(){
  if(typeof document === "undefined" || !document.body) return null;
  var cont = document.getElementById("meCerberusBackground");
  if(!cont){
    cont = document.createElement("div");
    cont.id = "meCerberusBackground";
    cont.className = "me-cerberus-background";
    cont.setAttribute("aria-hidden", "true");
    document.body.insertBefore(cont, document.body.firstChild);
  }
  if(!cont.children || cont.children.length === 0){
    // 1. Сетка люминофора терминала
    var grid = document.createElement("div");
    grid.className = "cerberus-crt-grid";
    cont.appendChild(grid);

    // 2. Официальный логотип Цербера
    var logo = document.createElement("img");
    logo.className = "cerberus-official-logo";
    logo.src = "symbols/Mass Effect/Cerberus.png";
    logo.alt = "Cerberus Logo";
    cont.appendChild(logo);

    // 3. Засекреченная директива Лазаря
    var stamp = document.createElement("div");
    stamp.className = "cerberus-dossier-stamp";
    stamp.innerHTML = '<div class="badge">CLASSIFIED // EYES ONLY</div><br>OPERATIONAL BASE: CRONOS STATION<br>DIRECTIVE: LAZARUS PROTOCOL<br>RELAY: QEC SECURE NODE 0x09';
    cont.appendChild(stamp);

    // 4. Плавающие частички золотой плазмы
    for(var i = 0; i < 20; i++){
      var p = document.createElement("div");
      p.className = "cerberus-plasma-spark";
      var size = (1.6 + Math.random() * 2.2).toFixed(1);
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.left = (Math.random() * 100).toFixed(2) + "%";
      p.style.bottom = (Math.random() * 80).toFixed(2) + "%";
      var dur = (11 + Math.random() * 10).toFixed(1);
      var del = (-Math.random() * 14).toFixed(1);
      var op = (0.28 + Math.random() * 0.38).toFixed(2);
      p.style.setProperty("--sp-op", op);
      p.style.animationDelay = del + "s";
      p.style.animationDuration = dur + "s";
      cont.appendChild(p);
    }

    // 5. Эффекты ЭЛТ-монитора на фоне (строго ниже интерфейса и кнопок, z-index: 0)
    var scanlines = document.createElement("div");
    scanlines.className = "cerberus-crt-scanlines";
    cont.appendChild(scanlines);

    var roll = document.createElement("div");
    roll.className = "cerberus-crt-roll";
    cont.appendChild(roll);

    var vignette = document.createElement("div");
    vignette.className = "cerberus-crt-vignette";
    cont.appendChild(vignette);

    var flicker = document.createElement("div");
    flicker.className = "cerberus-crt-flicker";
    cont.appendChild(flicker);

    var bTl = document.createElement("div");
    bTl.className = "cerberus-crt-bracket tl";
    cont.appendChild(bTl);

    var bBl = document.createElement("div");
    bBl.className = "cerberus-crt-bracket bl";
    cont.appendChild(bBl);

    var bBr = document.createElement("div");
    bBr.className = "cerberus-crt-bracket br";
    cont.appendChild(bBr);

    var status = document.createElement("div");
    status.className = "cerberus-crt-status";
    status.textContent = "CRONOS // CRT-TERMINAL // CH-01 [QEC ACTIVE]";
    cont.appendChild(status);
  }

  // Очистка старого оверлея если остался
  var oldCrt = document.getElementById("meCerberusCrtOverlay");
  if(oldCrt && oldCrt.parentNode) oldCrt.parentNode.removeChild(oldCrt);

  return cont;
}

window.applyMeTheme = function(){
  if(typeof document === "undefined" || !document.body) return;
  if(typeof HB === "undefined" || HB.mode !== "me"){
    document.body.classList.remove("me-theme-citadel", "me-theme-omni", "me-theme-n7", "me-theme-cerberus");
    var pCit = document.getElementById("meCitadelParticles");
    if(pCit) pCit.style.display = "none";
    var pOmni = document.getElementById("meOmniProjections");
    if(pOmni) pOmni.style.display = "none";
    var pN7 = document.getElementById("meN7Background");
    if(pN7) pN7.style.display = "none";
    var pCerb = document.getElementById("meCerberusBackground");
    if(pCerb) pCerb.style.display = "none";
    var oldCrt = document.getElementById("meCerberusCrtOverlay");
    if(oldCrt && oldCrt.parentNode) oldCrt.parentNode.removeChild(oldCrt);
    return;
  }
  var t = getMeTheme();
  document.body.classList.remove("me-theme-citadel", "me-theme-omni", "me-theme-n7", "me-theme-cerberus");
  document.body.classList.add("me-theme-" + t);

  var pCit = document.getElementById("meCitadelParticles");
  if(t === "citadel"){
    initCitadelParticles();
    pCit = document.getElementById("meCitadelParticles");
    if(pCit) pCit.style.display = "block";
  } else {
    if(pCit) pCit.style.display = "none";
  }

  var pOmni = document.getElementById("meOmniProjections");
  if(t === "omni"){
    initOmniProjections();
    pOmni = document.getElementById("meOmniProjections");
    if(pOmni) pOmni.style.display = "block";
  } else {
    if(pOmni) pOmni.style.display = "none";
  }

  var pN7 = document.getElementById("meN7Background");
  if(t === "n7"){
    initN7Background();
    pN7 = document.getElementById("meN7Background");
    if(pN7) pN7.style.display = "block";
  } else {
    if(pN7) pN7.style.display = "none";
  }

  var pCerb = document.getElementById("meCerberusBackground");
  if(t === "cerberus"){
    initCerberusBackground();
    pCerb = document.getElementById("meCerberusBackground");
    if(pCerb) pCerb.style.display = "block";
  } else {
    if(pCerb) pCerb.style.display = "none";
  }
};

function renderMeHudHtml(c){
  c = c || ME.getChar();
  var nameDisplay = meEsc(c.name || 'Оперативник Альянса');
  var callsignHtml = c.callsign ? (' <span style="font-size:13px;color:var(--brass);font-weight:normal;">[' + meEsc(c.callsign) + ']</span>') : '';
  var metaHtml = '<span>' + meEsc(c.race || 'Человек') + '</span> • <span>' + meEsc(c.role || 'Солдат') + '</span>';

  return '<div class="sh-hud" id="meHud">' +
    '<div class="sh-hud-top">' +
      '<div class="sh-hud-identity">' +
        '<div class="sh-hud-name">' + nameDisplay + callsignHtml + '</div>' +
        '<div class="sh-hud-meta">' + metaHtml + '</div>' +
      '</div>' +
      '<div class="sh-hud-badges">' +
        '<span class="sh-hud-level">Ур. ' + (c.level || 1) + '</span>' +
        '<button class="sh-hud-edit-btn" data-nav="meData" title="Настроить досье и темы в Данных">⚙️ Досье</button>' +
      '</div>' +
    '</div>' +
    '<div class="sh-hud-stats">' +
      '<div class="sh-hud-stat-pill">' +
        '<span class="stat-icon">🛡️</span>' +
        '<span class="stat-label">Щиты</span>' +
        '<span class="stat-val">' + (c.baseShield || 15) + '</span>' +
      '</div>' +
      '<div class="sh-hud-stat-pill">' +
        '<span class="stat-icon">❤️</span>' +
        '<span class="stat-label">ОЗ</span>' +
        '<span class="stat-val">' + (c.maxHp || 24) + '</span>' +
      '</div>' +
      '<div class="sh-hud-stat-pill">' +
        '<span class="stat-icon">🔰</span>' +
        '<span class="stat-label">КД</span>' +
        '<span class="stat-val">' + (c.baseAc || 15) + '</span>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function meHome(){
  var c = ME.getChar();
  var hudHtml = renderMeHudHtml(c);

  var hero = '<div class="hero-dice" data-go="dice">'+
    '<div class="hero-dice-icon">'+(typeof dieShapeSvg==='function'? dieShapeSvg(20,'meHeroDie',20) : '🎲')+'</div>'+
    '<div class="hero-dice-text">'+
      '<div class="hero-dice-name">Бросок костей</div>'+
      '<div class="hero-dice-desc">Кубики d4–d20, d100 критов, монетка шанса W/L и модификаторы ME</div>'+
    '</div><div class="hero-dice-arrow">→</div></div>';

  var powersCount = (ME.getPowers ? ME.getPowers().length : 0);
  var weaponsCount = (ME.getArsenal ? ME.getArsenal().length : 0);
  var ship = (ME.getShip ? ME.getShip() : {});
  var crewCount = (ship.crew || []).length;
  var profCount = (ME.getProfiles ? ME.getProfiles().length : 1);

  var shipName = (ship.name && ship.name !== 'Не зарегистрировано') ? ship.name : 'Нормандия SR-2';
  var shipDesc = shipName + ' • ' + crewCount + ' в экипаже';

  var items = [
    {nav:'mePowers',   icon:'⚡', t:'Способности и Древо',    d:(powersCount ? powersCount + ' в списке' : 'Биотика, техника, силы')},
    {nav:'meArsenal',  icon:'🔫', t:'Оружейный арсенал',      d:(weaponsCount ? weaponsCount + ' в списке' : 'Винтовки, моды и урон')},
    {nav:'meShip',     icon:'🚀', t:'Корабль и Экипаж',       d:shipDesc},
    {nav:'meCodex',    icon:'📖', t:'Кодекс Галактики',       d:'Расы, фракции, урон'},
    {nav:'meMap',      icon:'🗺️', t:'Галактическая карта',    d:'Сектора и контракты'},
    {nav:'meData',     icon:'💾', t:'Данные',                 d:profCount + ' в отряде, темы и ИИ'}
  ];

  return ''+
    hudHtml +
    '<div class="rule"></div>'+ hero +
    '<div class="section-label">СИСТЕМНЫЕ РАЗДЕЛЫ // КОНСОЛЬ</div>'+
    '<div class="menu-list grid-2">'+items.map(function(i){
      return '<div class="menu-item" data-nav="'+i.nav+'">'+
        '<div class="name">'+i.icon+' '+meEsc(i.t)+'</div>'+
        '<div class="desc">'+meEsc(i.d)+'</div>'+
        '<div class="arrow">›</div>'+
      '</div>';
    }).join('')+'</div>';
}

// 1. ДОСЬЕ ОПЕРАТИВНИКА
function meChar(){
  var c = ME.getChar();
  function mod(v){
    var m = Math.floor((v - 10) / 2);
    return m >= 0 ? '+' + m : String(m);
  }

  var isEditing = ME._editingChar;

  var statsHtml = [
    { k: 'str', label: 'СИЛА', val: c.stats.str },
    { k: 'dex', label: 'ЛОВКОСТЬ', val: c.stats.dex },
    { k: 'con', label: 'ТЕЛОСЛОЖЕНИЕ', val: c.stats.con },
    { k: 'int', label: 'ИНТЕЛЛЕКТ', val: c.stats.int },
    { k: 'wis', label: 'МУДРОСТЬ', val: c.stats.wis },
    { k: 'cha', label: 'ХАРИЗМА', val: c.stats.cha }
  ].map(function(s){
    if(isEditing){
      return '<div class="me-stat-box">' +
        '<div class="stat-name">' + s.label + '</div>' +
        '<input type="number" class="me-input" data-stat="' + s.k + '" value="' + s.val + '" style="width:60px;text-align:center;font-size:16px;margin:4px 0;">' +
        '<div class="stat-mod">' + mod(s.val) + '</div>' +
      '</div>';
    }
    return '<div class="me-stat-box">' +
      '<div class="stat-name">' + s.label + '</div>' +
      '<div class="stat-val">' + s.val + '</div>' +
      '<div class="stat-mod">' + mod(s.val) + '</div>' +
    '</div>';
  }).join('');

  var defenseHtml = '<div class="me-def-grid">' +
    '<div class="me-def-card"><div class="def-title">КЛАСС БРОНИ (AC)</div><div class="def-num">' + (isEditing ? '<input type="number" class="me-input" id="meEditAc" value="' + c.baseAc + '" style="width:60px;">' : c.baseAc) + '</div><div class="def-sub">Сложность попадания</div></div>' +
    '<div class="me-def-card"><div class="def-title">ЩИТЫ (SHIELD)</div><div class="def-num" style="color:#00d2ff;">' + (isEditing ? '<input type="number" class="me-input" id="meEditShield" value="' + c.baseShield + '" style="width:60px;">' : c.baseShield) + '</div><div class="def-sub">Ёмкость щита</div></div>' +
    '<div class="me-def-card"><div class="def-title">БРОНЯ (ARMOR)</div><div class="def-num" style="color:#ffaa33;">' + (isEditing ? '<input type="number" class="me-input" id="meEditArmor" value="' + c.baseArmorPoints + '" style="width:60px;">' : c.baseArmorPoints) + '</div><div class="def-sub">Порог (DT): ' + (isEditing ? '<input type="number" class="me-input" id="meEditDt" value="' + c.damageThreshold + '" style="width:40px;">' : c.damageThreshold) + '</div></div>' +
    '<div class="me-def-card"><div class="def-title">БАРЬЕР (BARRIER)</div><div class="def-num" style="color:#b266ff;">' + (isEditing ? '<input type="number" class="me-input" id="meEditBarrier" value="' + c.baseBarrier + '" style="width:60px;">' : c.baseBarrier) + '</div><div class="def-sub">Биотический резерв</div></div>' +
    '<div class="me-def-card"><div class="def-title">ЗДОРОВЬЕ (HP)</div><div class="def-num" style="color:#ff5555;">' + (isEditing ? '<input type="number" class="me-input" id="meEditHp" value="' + c.maxHp + '" style="width:60px;">' : c.maxHp) + '</div><div class="def-sub">Базовое здоровье</div></div>' +
  '</div>';

  var bodyContent = '';
  if(isEditing){
    bodyContent = '<div class="me-panel" style="margin-top:16px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
        '<h3 style="margin:0;color:#00d2ff;">РЕДАКТИРОВАНИЕ ДОСЬЕ ОПЕРАТИВНИКА</h3>' +
        '<button class="btn-primary" id="meSaveCharBtn">✓ Сохранить изменения</button>' +
      '</div>' +
      '<div class="form-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;">' +
        '<div><label>Имя оперативника:</label><input class="me-input" id="meEditName" value="' + meEsc(c.name) + '"></div>' +
        '<div><label>Позывной:</label><input class="me-input" id="meEditCallsign" value="' + meEsc(c.callsign) + '"></div>' +
        '<div><label>Раса:</label><input class="me-input" id="meEditRace" value="' + meEsc(c.race) + '"></div>' +
        '<div><label>Роль / Класс:</label><input class="me-input" id="meEditRole" value="' + meEsc(c.role) + '"></div>' +
        '<div><label>Происхождение / Квалификация:</label><input class="me-input" id="meEditOrigin" value="' + meEsc(c.origin) + '"></div>' +
        '<div><label>Биохимия:</label><select class="me-input" id="meEditBio"><option ' + (c.biochemistry.indexOf('Лево')>=0?'selected':'') + '>Левоаминокислотная</option><option ' + (c.biochemistry.indexOf('Декстро')>=0?'selected':'') + '>Декстроаминокислотная</option></select></div>' +
        '<div><label>Уровень:</label><input type="number" class="me-input" id="meEditLevel" value="' + c.level + '"></div>' +
        '<div><label>Очки развития (ОР):</label><input type="number" class="me-input" id="meEditDevPoints" value="' + c.devPoints + '"></div>' +
        '<div><label>Бонус мастерства:</label><input type="number" class="me-input" id="meEditProf" value="' + c.profBonus + '"></div>' +
        '<div><label>Скорость:</label><input class="me-input" id="meEditSpeed" value="' + meEsc(c.speed) + '"></div>' +
      '</div>' +
      '<div style="margin-top:16px;">' +
        '<label>Снаряжение и вооружение:</label>' +
        '<input class="me-input" id="meEditLoadout" style="width:100%;margin-bottom:8px;" value="' + meEsc(c.loadout) + '">' +
        '<label>Омни-инструмент:</label>' +
        '<input class="me-input" id="meEditOmni" style="width:100%;margin-bottom:8px;" value="' + meEsc(c.omniTool) + '">' +
        '<label>Биотический усилитель (имплантат):</label>' +
        '<input class="me-input" id="meEditBioAmp" style="width:100%;margin-bottom:8px;" value="' + meEsc(c.bioAmp) + '">' +
        '<label>Биография и боевые заметки:</label>' +
        '<textarea class="me-input" id="meEditBg" style="width:100%;height:70px;">' + meEsc(c.background) + '</textarea>' +
      '</div>' +
      '<div style="margin-top:16px;text-align:right;">' +
        '<button class="btn-subtle" id="meCancelEditBtn" style="margin-right:8px;">Отмена</button>' +
        '<button class="btn-primary" id="meSaveCharBtn2">Сохранить</button>' +
      '</div>' +
    '</div>';
  } else {
    bodyContent = '<div class="me-panel" style="margin-top:16px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">' +
        '<div>' +
          '<div style="font-size:22px;font-weight:700;color:#00d2ff;letter-spacing:0.5px;">' + meEsc(c.name) + ' <span style="font-size:14px;color:#8bb1d6;font-weight:normal;">[Позывной: ' + meEsc(c.callsign) + ']</span></div>' +
          '<div style="color:#7da5c9;font-size:13px;margin-top:4px;">' + meEsc(c.race) + ' • ' + meEsc(c.role) + ' • ' + meEsc(c.origin) + ' • Биохимия: ' + meEsc(c.biochemistry) + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;">' +
          '<span class="me-tag-holo">УРОВЕНЬ ' + c.level + '</span>' +
          '<span class="me-tag-omni">ОР: ' + c.devPoints + '</span>' +
          '<span class="me-tag-holo">МАСТЕРСТВО: +' + c.profBonus + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="rule" style="margin:14px 0;"></div>' +
      '<div class="section-label">СЛОИ БАЗОВОЙ ЗАЩИТЫ // СТАТИЧЕСКИЙ ПРОФИЛЬ</div>' +
      defenseHtml +
      '<div class="section-label" style="margin-top:16px;">ХАРАКТЕРИСТИКИ D&D 5E // БАЗОВЫЕ МОДИФИКАТОРЫ</div>' +
      '<div class="me-stats-grid">' + statsHtml + '</div>' +
      '<div class="rule" style="margin:16px 0;"></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:14px;">' +
        '<div class="me-card">' +
          '<div class="me-card-title">ЭКИПИРОВКА И СНАРЯЖЕНИЕ</div>' +
          '<div style="font-size:13px;color:#8bb1d6;line-height:1.6;">' +
            '<div><strong>Оружие:</strong> ' + meEsc(c.loadout) + '</div>' +
            '<div><strong>Омни-инструмент:</strong> ' + meEsc(c.omniTool) + '</div>' +
            '<div><strong>Усилитель:</strong> ' + meEsc(c.bioAmp) + '</div>' +
            '<div><strong>Скорость перемещения:</strong> ' + meEsc(c.speed) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="me-card">' +
          '<div class="me-card-title">ЛИЧНОЕ ДЕЛО И БИОГРАФИЯ</div>' +
          '<div style="font-size:13px;color:#8bb1d6;line-height:1.6;">' + meEsc(c.background) + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end;">' +
        '<button class="btn-subtle" id="meResetCharBtn" style="color:#ff7777;">↺ Сбросить к образцу</button>' +
        '<button class="btn-subtle" id="meCopyDmBriefBtn">📋 Копировать для AI DM</button>' +
        '<button class="btn-primary" id="meEditCharBtn">✎ Редактировать досье</button>' +
      '</div>' +
    '</div>';
  }

  return meNavHeader('ДОСЬЕ ОПЕРАТИВНИКА // ЛИЧНОЕ ДЕЛО', 'СЕКРЕТНО: ДОПУСК СВ-3') +
    '<h1>ДОСЬЕ ОПЕРАТИВНИКА</h1>' +
    '<div class="subtitle">СИСТЕМЫ АЛЬЯНСА • СТАТИЧЕСКИЙ ПРОФИЛЬ ПЕРСОНАЖА (5E SCI-FI)</div>' +
    bodyContent;
}

// 2. ДРЕВО СПОСОБНОСТЕЙ (A92: ВПИСЫВАЮТСЯ ИГРОКОМ)

function mePowerEdit(id){
  var isNew = (id === 'new' || !id);
  var p = isNew ? {
    id: 'pow_' + Date.now(),
    name: '',
    branch: 'Биотика',
    req: 'Узлы L-типа',
    cd: '0',
    cost: '1 ОР',
    icon: '⚡',
    r1: '', r2: '', r3: '',
    desc: ''
  } : (ME.getPowers().find(function(x){ return x.id === id; }) || {});

  var branches = ['Биотика', 'Техника', 'Бой', 'Медицина', 'Производные'].map(function(b){
    return '<option value="' + b + '" ' + (p.branch === b ? 'selected' : '') + '>' + b + '</option>';
  }).join('');

  return meNavHeader('РЕДАКТИРОВАНИЕ СПОСОБНОСТИ', isNew ? 'НОВЫЙ ПРОТОКОЛ' : 'ОБНОВЛЕНИЕ БАЗЫ') +
    '<button class="back" data-nav="mePowers">← Отмена</button>' +
    '<h1>' + (isNew ? 'ДОБАВИТЬ СПОСОБНОСТЬ' : '✏️ ' + meEsc(p.name)) + '</h1>' +
    '<div class="me-card" style="margin-top:16px;">' +
      '<div class="grid-2">' +
        '<div><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Название</label><input type="text" class="me-input" id="mepow_name" value="' + meEsc(p.name) + '"></div>' +
        '<div><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Ветка (Класс)</label><select class="me-input" id="mepow_branch">' + branches + '</select></div>' +
        '<div><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Откат (Раундов)</label><input type="text" class="me-input" id="mepow_cd" value="' + meEsc(p.cd) + '"></div>' +
        '<div><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Стоимость</label><input type="text" class="me-input" id="mepow_cost" value="' + meEsc(p.cost) + '"></div>' +
        '<div style="grid-column: 1 / -1;"><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Иконка (Эмодзи)</label><input type="text" class="me-input" id="mepow_icon" value="' + meEsc(p.icon) + '"></div>' +
        '<div style="grid-column: 1 / -1;"><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Описание и механика</label><textarea class="me-input" id="mepow_desc" style="height:100px;">' + meEsc(p.desc) + '</textarea></div>' +
        '<div style="grid-column: 1 / -1;"><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Ранг 1</label><input type="text" class="me-input" id="mepow_r1" value="' + meEsc(p.r1) + '"></div>' +
        '<div style="grid-column: 1 / -1;"><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Ранг 2</label><input type="text" class="me-input" id="mepow_r2" value="' + meEsc(p.r2) + '"></div>' +
        '<div style="grid-column: 1 / -1;"><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Ранг 3</label><input type="text" class="me-input" id="mepow_r3" value="' + meEsc(p.r3) + '"></div>' +
      '</div>' +
      '<input type="hidden" id="mepow_id" value="' + p.id + '">' +
      '<button class="btn-primary" id="meSavePowerBtn" style="margin-top:16px;width:100%;">💾 СОХРАНИТЬ В БАЗУ</button>' +
    '</div>';
}

function wireMePowerEdit(){
  var btn = document.getElementById('meSavePowerBtn');
  if(btn){
    btn.onclick = function(){
      var id = document.getElementById('mepow_id').value;
      var list = ME.getPowers();
      var p = list.find(function(x){ return x.id === id; });
      var isNew = false;
      if(!p){ p = {id: id}; isNew = true; }
      
      p.name = document.getElementById('mepow_name').value;
      p.branch = document.getElementById('mepow_branch').value;
      p.cd = document.getElementById('mepow_cd').value;
      p.cost = document.getElementById('mepow_cost').value;
      p.icon = document.getElementById('mepow_icon').value;
      p.desc = document.getElementById('mepow_desc').value;
      p.r1 = document.getElementById('mepow_r1').value;
      p.r2 = document.getElementById('mepow_r2').value;
      p.r3 = document.getElementById('mepow_r3').value;
      
      if(isNew) list.push(p);
      ME.savePowers(list);
      window.navigate('mePowers');
    };
  }
}

function meArsenalEdit(id){
  var isNew = (id === 'new' || !id);
  var w = isNew ? {
    id: 'weap_' + Date.now(),
    name: '',
    cat: 'assault',
    dmg: '1d8',
    ammo: '40/400',
    mod1: '', mod2: '', desc: ''
  } : (ME.getArsenal().find(function(x){ return x.id === id; }) || {});

  var cats = [
    {val:'assault', label:'Штурмовые винтовки'},
    {val:'shotgun', label:'Дробовики'},
    {val:'sniper', label:'Снайперские винтовки'},
    {val:'pistol', label:'Пистолеты / ПП'},
    {val:'heavy', label:'Тяжелое оружие'}
  ].map(function(c){
    return '<option value="' + c.val + '" ' + (w.cat === c.val ? 'selected' : '') + '>' + c.label + '</option>';
  }).join('');

  return meNavHeader('РЕДАКТИРОВАНИЕ АРСЕНАЛА', isNew ? 'НОВОЕ ОРУЖИЕ' : 'ОБНОВЛЕНИЕ ТТХ') +
    '<button class="back" data-nav="meArsenal">← Отмена</button>' +
    '<h1>' + (isNew ? 'ДОБАВИТЬ ОРУЖИЕ' : '🔫 ' + meEsc(w.name)) + '</h1>' +
    '<div class="me-card" style="margin-top:16px;">' +
      '<div class="grid-2">' +
        '<div><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Модель / Название</label><input type="text" class="me-input" id="meweap_name" value="' + meEsc(w.name) + '"></div>' +
        '<div><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Категория</label><select class="me-input" id="meweap_cat">' + cats + '</select></div>' +
        '<div><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Урон (Кости)</label><input type="text" class="me-input" id="meweap_dmg" value="' + meEsc(w.dmg) + '"></div>' +
        '<div><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Боезапас (Термозаряды)</label><input type="text" class="me-input" id="meweap_ammo" value="' + meEsc(w.ammo) + '"></div>' +
        '<div style="grid-column: 1 / -1;"><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Свойства / Описание</label><textarea class="me-input" id="meweap_desc" style="height:60px;">' + meEsc(w.desc) + '</textarea></div>' +
        '<div style="grid-column: 1 / -1;"><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Модификация 1</label><input type="text" class="me-input" id="meweap_mod1" value="' + meEsc(w.mod1) + '"></div>' +
        '<div style="grid-column: 1 / -1;"><label style="color:#00d2ff;font-size:11px;display:block;margin-bottom:4px;">Модификация 2</label><input type="text" class="me-input" id="meweap_mod2" value="' + meEsc(w.mod2) + '"></div>' +
      '</div>' +
      '<input type="hidden" id="meweap_id" value="' + w.id + '">' +
      '<button class="btn-primary" id="meSaveWeapBtn" style="margin-top:16px;width:100%;">💾 СОХРАНИТЬ В АРСЕНАЛ</button>' +
    '</div>';
}

function wireMeArsenalEdit(){
  var btn = document.getElementById('meSaveWeapBtn');
  if(btn){
    btn.onclick = function(){
      var id = document.getElementById('meweap_id').value;
      var list = ME.getArsenal();
      var w = list.find(function(x){ return x.id === id; });
      var isNew = false;
      if(!w){ w = {id: id}; isNew = true; }
      
      w.name = document.getElementById('meweap_name').value;
      w.cat = document.getElementById('meweap_cat').value;
      w.dmg = document.getElementById('meweap_dmg').value;
      w.ammo = document.getElementById('meweap_ammo').value;
      w.desc = document.getElementById('meweap_desc').value;
      w.mod1 = document.getElementById('meweap_mod1').value;
      w.mod2 = document.getElementById('meweap_mod2').value;
      
      if(isNew) list.push(w);
      ME.saveArsenal(list);
      window.navigate('meArsenal');
    };
  }
}


function mePowers(){
  var allPowers = ME.getPowers();
  var activeBranch = ME._activeBranch || 'all';
  var search = (ME._powersSearch || '').toLowerCase().trim();

  // Dynamic branch counts
  var branchCounts = {};
  allPowers.forEach(function(p){
    var b = (p.branch || 'Кастомная').trim();
    branchCounts[b] = (branchCounts[b] || 0) + 1;
  });

  var standardBranches = ['Биотика', 'Техника', 'Бой', 'Медицина', 'Производные'];
  var branchTabs = [
    { id: 'all', name: 'Все (' + allPowers.length + ')' }
  ];
  standardBranches.forEach(function(b){
    var count = branchCounts[b] || 0;
    branchTabs.push({ id: b, name: b + ' (' + count + ')' });
  });
  Object.keys(branchCounts).forEach(function(b){
    if(standardBranches.indexOf(b) === -1){
      branchTabs.push({ id: b, name: b + ' (' + branchCounts[b] + ')' });
    }
  });

  var tabsHtml = '<div class="me-tabs">' + branchTabs.map(function(b){
    var on = activeBranch === b.id ? 'on' : '';
    return '<button class="me-tab-btn ' + on + '" data-branch="' + meEsc(b.id) + '">' + meEsc(b.name) + '</button>';
  }).join('') + '</div>';

  var filteredList = allPowers.filter(function(p){
    if(activeBranch !== 'all' && (p.branch || 'Кастомная') !== activeBranch) return false;
    if(search && (p.name || '').toLowerCase().indexOf(search) === -1 && (p.desc || '').toLowerCase().indexOf(search) === -1) return false;
    return true;
  });

  var contentHtml = '';
  if(allPowers.length === 0){
    contentHtml = '<div class="me-empty-box" style="grid-column: 1 / -1;">' +
      '<div class="me-empty-box-icon">⚡</div>' +
      '<div class="me-empty-box-title">РЕЕСТР СПОСОБНОСТЕЙ ПУСТ</div>' +
      '<div class="me-empty-box-desc">Способности и боевые протоколы A92 добавляются по мере обучения и полевой практики оперативника. Создайте новую способность или загрузите проверенные шаблоны Альянса.</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
        '<button class="btn-primary" id="meAddPowerEmptyBtn">+ Добавить способность</button>' +
        '<button class="btn-subtle" id="mePresetPowerEmptyBtn">⚡ Шаблоны из Кодекса</button>' +
      '</div>' +
    '</div>';
  } else if(filteredList.length === 0){
    contentHtml = '<div class="me-card" style="grid-column: 1 / -1;text-align:center;color:#8bb1d6;padding:24px;">' +
      'В выбранной категории или по запросу поиска способностей не найдено.' +
    '</div>';
  } else {
    contentHtml = filteredList.map(function(p){
      var branchColor = p.branch === 'Биотика' ? '#b266ff' : (p.branch === 'Техника' ? '#00d2ff' : (p.branch === 'Бой' ? '#ffaa33' : (p.branch === 'Медицина' ? '#33cc66' : '#ffd700')));
      var cdText = (p.cd === 0 || p.cd === '0') ? 'БЕЗ КД' : 'КД: ' + p.cd + ' рнд';
      var costText = p.cost ? (p.cost + ' ОР') : '1 ОР';
      return '<div class="me-card" style="border-left:4px solid ' + branchColor + ';">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">' +
          '<div>' +
            '<div style="font-size:16px;font-weight:700;color:#fff;">' + (p.icon || '⚡') + ' ' + meEsc(p.name) + '</div>' +
            '<div style="font-size:11.5px;color:' + branchColor + ';margin-top:2px;">' + meEsc(p.branch || 'Кастомная') + ' • ' + meEsc(p.req || 'Узлы L-типа/Омни') + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:4px;">' +
            '<span class="me-tag-holo">' + meEsc(cdText) + '</span>' +
            '<span class="me-tag-omni">' + meEsc(costText) + '</span>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:12.5px;color:#8bb1d6;margin:10px 0;line-height:1.5;">' + meEsc(p.desc) + '</div>' +
        '<div class="me-ranks-box">' +
          (p.r1 ? '<div class="rank-row"><strong>Ранг 1 (1 ОР):</strong> ' + meEsc(p.r1) + '</div>' : '') +
          (p.r2 ? '<div class="rank-row"><strong>Ранг 2 (2 ОР):</strong> ' + meEsc(p.r2) + '</div>' : '') +
          (p.r3 ? '<div class="rank-row"><strong>Ранг 3 (3 ОР):</strong> ' + meEsc(p.r3) + '</div>' : '') +
        '</div>' +
        '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px;border-top:1px solid rgba(0,210,255,0.15);padding-top:8px;">' +
          '<button class="btn-subtle me-edit-power-btn" data-id="' + p.id + '" style="font-size:11px;padding:3px 8px;">✎ Редактировать</button>' +
          '<button class="btn-subtle me-del-power-btn" data-id="' + p.id + '" style="font-size:11px;padding:3px 8px;color:#ff5555;border-color:rgba(255,85,85,0.4);">🗑️ Удалить</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  return meNavHeader('ДРЕВО СПОСОБНОСТЕЙ // ПРОТОКОЛЫ A92', 'АКТИВНЫХ: ' + allPowers.length) +
    '<h1>СПОСОБНОСТИ И ДРЕВО НАВЫКОВ</h1>' +
    '<div class="subtitle">СИСТЕМА РОСТА A92 • КОРНИ, РАНГИ И ПРОИЗВОДНЫЕ ЗА ОЧКИ РАЗВИТИЯ (ОР)</div>' +
'<div class="me-panel" style="margin-top:14px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button class="btn-primary" id="meAddPowerBtn">+ Добавить способность</button>' +
          '<button class="btn-subtle" id="mePresetPowersBtn">⚡ Шаблоны из Кодекса</button>' +
        '</div>' +
        '<input type="text" class="me-input" id="mePowersSearchInput" placeholder="🔍 Поиск способности..." value="' + meEsc(search) + '" style="min-width:200px;">' +
      '</div>' +
      '<div style="margin-bottom:12px;">' + tabsHtml + '</div>' +
      '<div class="grid-2">' + contentHtml + '</div>' +
    '</div>';
}

// 3. ОРУЖЕЙНЫЙ АРСЕНАЛ (ВПИСЫВАЕТСЯ ИГРОКОМ)
function meArsenal(){
  var allWeapons = ME.getArsenal();
  var activeCat = ME._activeArsenalCat || 'all';

  var catCounts = {};
  allWeapons.forEach(function(w){
    var c = w.cat || 'rifles';
    catCounts[c] = (catCounts[c] || 0) + 1;
  });

  var cats = [
    { id: 'all', name: 'Все оружие (' + allWeapons.length + ')' },
    { id: 'rifles', name: 'Винтовки (' + (catCounts['rifles'] || 0) + ')' },
    { id: 'pistols', name: 'Пистолеты/ПП (' + (catCounts['pistols'] || 0) + ')' },
    { id: 'shotguns', name: 'Дробовики (' + (catCounts['shotguns'] || 0) + ')' },
    { id: 'snipers', name: 'Снайперские (' + (catCounts['snipers'] || 0) + ')' },
    { id: 'heavy', name: 'Тяжелое (' + (catCounts['heavy'] || 0) + ')' },
    { id: 'ammo', name: 'Спецбоеприпасы (5)' }
  ];

  var tabsHtml = '<div class="me-tabs">' + cats.map(function(c){
    var on = activeCat === c.id ? 'on' : '';
    return '<button class="me-tab-btn ' + on + '" data-arsenal-cat="' + c.id + '">' + c.name + '</button>';
  }).join('') + '</div>';

  var contentHtml = '';
  if(activeCat === 'ammo'){
    contentHtml = '<div class="grid-2">' + ME.ammo.map(function(a){
      return '<div class="me-card">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<div style="font-size:15px;font-weight:700;color:#ffaa33;">⚡ ' + meEsc(a.name) + '</div>' +
          '<span class="me-tag-omni">' + a.type + '</span>' +
        '</div>' +
        '<div style="font-size:12.5px;color:#8bb1d6;margin-top:8px;line-height:1.5;">' + meEsc(a.effect) + '</div>' +
      '</div>';
    }).join('') + '</div>';
  } else {
    var weapons = allWeapons.filter(function(w){
      return activeCat === 'all' || w.cat === activeCat;
    });

    if(allWeapons.length === 0){
      contentHtml = '<div class="me-empty-box" style="grid-column: 1 / -1;">' +
        '<div class="me-empty-box-icon">🔫</div>' +
        '<div class="me-empty-box-title">ОРУЖЕЙНЫЙ АРСЕНАЛ ПУСТ</div>' +
        '<div class="me-empty-box-desc">Оружие и снаряжение вписываются оперативником вручную. Добавьте кастомное вооружение или загрузите стандартные модели вооружения Альянса Систем.</div>' +
        '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
          '<button class="btn-primary" id="meAddWeaponEmptyBtn">+ Вписать оружие</button>' +
          '<button class="btn-subtle" id="mePresetWeaponEmptyBtn">🔫 Каталог Альянса</button>' +
        '</div>' +
      '</div>';
    } else if(weapons.length === 0){
      contentHtml = '<div class="me-card" style="grid-column: 1 / -1;text-align:center;color:#8bb1d6;padding:24px;">' +
        'В выбранной категории оружия не найдено.' +
      '</div>';
    } else {
      contentHtml = '<div class="grid-2">' + weapons.map(function(w){
        return '<div class="me-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
            '<div>' +
              '<div style="font-size:16px;font-weight:700;color:#fff;">' + meEsc(w.name) + '</div>' +
              '<div style="font-size:12px;color:#00d2ff;margin-top:2px;">' + meEsc(w.type || 'Огнестрел') + '</div>' +
            '</div>' +
            '<span class="me-tag-holo">' + meEsc(w.dmg || '1d8') + '</span>' +
          '</div>' +
          '<div style="font-size:12.5px;color:#8bb1d6;margin:10px 0;line-height:1.5;">' + meEsc(w.desc || '—') + '</div>' +
          '<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(0,210,255,0.15);padding-top:8px;font-size:12px;color:#7da5c9;">' +
            '<div>Дистанция: ' + meEsc(w.range || '—') + ' | Магазин: ' + (w.clip || '—') + '</div>' +
            '<button class="btn-subtle me-roll-weapon-btn" data-weapon-name="' + meEsc(w.name) + '" data-dmg="' + meEsc(w.dmg || '1d8') + '" style="font-size:11.5px;padding:3px 8px;cursor:pointer;">🎲 Бросить урон</button>' +
          '</div>' +
          '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px;padding-top:6px;border-top:1px dashed rgba(0,210,255,0.1);">' +
            '<button class="btn-subtle me-edit-weapon-btn" data-id="' + w.id + '" style="font-size:11px;padding:2px 7px;">✎ Редактировать</button>' +
            '<button class="btn-subtle me-del-weapon-btn" data-id="' + w.id + '" style="font-size:11px;padding:2px 7px;color:#ff5555;border-color:rgba(255,85,85,0.4);">🗑️ Удалить</button>' +
          '</div>' +
        '</div>';
      }).join('') + '</div>';
    }
  }

  return meNavHeader('ОРУЖЕЙНЫЙ АРСЕНАЛ // СКЛАД СНАРЯЖЕНИЯ', 'АРСЕНАЛ: ' + allWeapons.length) +
    '<h1>ОРУЖЕЙНЫЙ АРСЕНАЛ</h1>' +
    '<div class="subtitle">СТРЕЛЬБА, МОДИФИКАЦИИ, СПЕЦБОЕПРИПАСЫ И МАТРИЦА УРОНА</div>' +
    '<div class="me-panel" style="margin-top:14px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button class="btn-primary" id="meAddWeaponBtn">+ Вписать оружие</button>' +
          '<button class="btn-subtle" id="mePresetWeaponsBtn">🔫 Каталог Альянса</button>' +
        '</div>' +
      '</div>' +
      '<div style="margin-bottom:14px;">' + tabsHtml + '</div>' +
      contentHtml +
    '</div>';
}

// 4. КОРАБЛЬ И ЭКИПАЖ (СТАНДАРТНЫЕ СЛОТЫ МОДУЛЕЙ И КАСТОМНЫЙ ЭКИПАЖ)
function meShip(){
  var s = ME.getShip();

  var modulesHtml = '<div class="grid-2">' + s.modules.map(function(m){
    var isSet = m.name && m.name !== 'Слот пуст';
    var badgeColor = isSet ? '#00d2ff' : '#7da5c9';
    var borderStyle = isSet ? 'border-left:4px solid #00d2ff;' : 'border-left:4px solid rgba(0,210,255,0.2);opacity:0.85;';
    return '<div class="me-slot-card" style="' + borderStyle + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">' +
        '<div>' +
          '<div class="me-slot-badge">' + (m.icon || '🛰️') + ' ' + meEsc(m.slot) + '</div>' +
          '<div class="me-slot-name">' + meEsc(m.name || 'Слот пуст') + '</div>' +
        '</div>' +
        '<span class="me-tag-holo" style="font-size:11px;color:' + badgeColor + ';">' + meEsc(m.stat || 'Не установлено') + '</span>' +
      '</div>' +
      '<div class="me-slot-desc">' + meEsc(m.desc || 'Требуется оснащение.') + '</div>' +
      '<div style="display:flex;justify-content:flex-end;margin-top:6px;border-top:1px solid rgba(0,210,255,0.15);padding-top:6px;">' +
        '<button class="btn-subtle me-edit-module-btn" data-mod-id="' + m.id + '" style="font-size:11px;padding:3px 9px;">✎ Настроить модуль</button>' +
      '</div>' +
    '</div>';
  }).join('') + '</div>';

  var crewHtml = '';
  if(!s.crew || s.crew.length === 0){
    crewHtml = '<div class="me-empty-box">' +
      '<div class="me-empty-box-icon">👤</div>' +
      '<div class="me-empty-box-title">ОТСЕК ЭКИПАЖА ПУСТ</div>' +
      '<div class="me-empty-box-desc">Команда судна не укомплектована. Добавьте офицеров, пилота, инженеров и соратников отряда.</div>' +
      '<button class="btn-primary" id="meAddCrewEmptyBtn">+ Добавить члена экипажа</button>' +
    '</div>';
  } else {
    crewHtml = '<div class="grid-2">' + s.crew.map(function(c){
      return '<div class="me-card">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
          '<div>' +
            '<div style="font-size:15px;font-weight:700;color:#fff;">👤 ' + meEsc(c.name) + '</div>' +
            '<div style="font-size:12.5px;color:#00d2ff;margin-top:2px;">' + meEsc(c.race || 'Человек') + ' • ' + meEsc(c.role || 'Специалист') + '</div>' +
          '</div>' +
          '<span class="me-tag-omni">' + meEsc(c.loyalty || 'В отряде') + '</span>' +
        '</div>' +
        '<div style="font-size:12px;color:#8bb1d6;margin:8px 0;line-height:1.4;">' + meEsc(c.note || '—') + '</div>' +
        '<div style="display:flex;justify-content:flex-end;gap:8px;border-top:1px solid rgba(0,210,255,0.15);padding-top:6px;">' +
          '<button class="btn-subtle me-edit-crew-btn" data-id="' + c.id + '" style="font-size:11px;padding:2px 7px;">✎ Редактировать</button>' +
          '<button class="btn-subtle me-del-crew-btn" data-id="' + c.id + '" style="font-size:11px;padding:2px 7px;color:#ff5555;border-color:rgba(255,85,85,0.4);">🗑️ Удалить</button>' +
        '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  return meNavHeader('КОРАБЛЬ И ЭКИПАЖ // СИСТЕМЫ СУДНА', meEsc(s.name)) +
    '<h1>КОРАБЛЬ И ЭКИПАЖ</h1>' +
    '<div class="subtitle">МОДУЛЬНЫЕ СИСТЕМЫ СУДНА И ЛИЧНЫЙ СОСТАВ ОТРЯДА</div>' +
    '<div class="me-panel" style="margin-top:14px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">' +
        '<div>' +
          '<div style="font-size:20px;font-weight:700;color:#00d2ff;">🚀 ' + meEsc(s.name) + '</div>' +
          '<div style="font-size:13px;color:#8bb1d6;margin-top:2px;">' + meEsc(s.cls) + '</div>' +
          (s.notes ? '<div style="font-size:12px;color:#7da5c9;margin-top:4px;">' + meEsc(s.notes) + '</div>' : '') +
        '</div>' +
        '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
          '<span class="me-tag-omni" style="font-size:12px;padding:4px 10px;">СТАТУС: ' + meEsc(s.status) + '</span>' +
          '<button class="btn-subtle" id="meEditShipBtn" style="font-size:12px;">✎ Настроить судно</button>' +
          '<button class="btn-subtle" id="mePresetShipBtn" style="font-size:12px;color:#ffd700;border-color:rgba(255,215,0,0.3);">🚀 Пресет «Нормандия SR-2»</button>' +
          '<button class="btn-subtle" id="meResetShipBtn" style="font-size:12px;color:#ff5555;border-color:rgba(255,85,85,0.3);">↺ Очистить всё</button>' +
        '</div>' +
      '</div>' +
      '<div class="rule" style="margin:14px 0;"></div>' +
      '<div class="section-label">СИСТЕМЫ СУДНА // СТАНДАРТНЫЕ МОДУЛЬНЫЕ СЛОТЫ (7 МЕСТ)</div>' +
      modulesHtml +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:22px;margin-bottom:10px;">' +
        '<div class="section-label" style="margin:0;">ЭКИПАЖ И ОФИЦЕРСКИЙ СОСТАВ (' + (s.crew ? s.crew.length : 0) + ')</div>' +
        '<button class="btn-primary" id="meAddCrewBtn" style="font-size:12px;padding:3px 10px;">+ Добавить члена экипажа</button>' +
      '</div>' +
      crewHtml +
    '</div>';
}


// ============================================================
// КОДЕКС ГАЛАКТИКИ (АРХИВЫ ЦИТАДЕЛИ) — ПОЛНАЯ БАЗА ЗНАНИЙ
// ============================================================

ME.codexCategories = [
  {
    group: '⚔️ Боевая система и механики',
    color: '#00d2ff',
    items: [
      { id: 'matrix', icon: '🛡️', title: 'Матрица урона и слои защиты', tag: 'Щиты / Барьеры / DT', desc: 'Кинетические щиты, биотические барьеры, броня с порогом DT и здоровье: матрица сопротивлений и уязвимостей.' },
      { id: 'combos', icon: '💥', title: 'Технические и биотические комбо', tag: 'Маркер + Детонатор', desc: 'Механика связок: Биотический взрыв, Огненная волна, Технический разряд и Крио-раскол.' },
      { id: 'tactics', icon: '🎯', title: 'Тактика боя 5e и укрытия', tag: 'Позиционка 5e', desc: 'Правила укрытий (+2/+5 AC), дистанции перестрелок, термозаряды и активные реакции защиты.' }
    ]
  },
  {
    group: '🌌 Расы Млечного Пути',
    color: '#b266ff',
    items: [
      { id: 'races_citadel', icon: '🏛️', title: 'Расы Пространства Цитадели', tag: 'Совет Цитадели', desc: 'Азари, Турианцы, Саларианцы и Человечество: происхождение, биология, культура и базовые особенности 5e.' },
      { id: 'races_outer', icon: '💀', title: 'Расы Внешних Систем и Терминала', tag: 'Фронтир и ДМЗ', desc: 'Кроганы, Кварианцы, Дреллы, Батарианцы и Ворча: физиология выживания, генофаг и изгнание.' },
      { id: 'races_ancient', icon: '🔮', title: 'Уникальные и древние формы жизни', tag: 'Синтетики и Реликты', desc: 'Волусы, Элкоры, Ханары, Геты и исчезнувшие Протеане: дипломатия, синтетический консенсус и артефакты.' }
    ]
  },
  {
    group: '🏛️ Фракции и Политика',
    color: '#ffaa33',
    items: [
      { id: 'factions_council', icon: '⚖️', title: 'Совет Цитадели и СПЕКТРы', tag: 'Высшая власть', desc: 'Структура Совета, элитный институт СПЕКТР с неограниченными полномочиями и служба СБ Цитадели (C-Sec).' },
      { id: 'factions_alliance', icon: '🎖️', title: 'Альянс Систем и Войска Земли', tag: 'Флот Человечества', desc: 'Парламент Арктура, программа спецподразделений N7, доктрина авианосцев и 5-й космический флот.' },
      { id: 'factions_syndicates', icon: '☣️', title: 'Синдикаты Терминала и «Цербер»', tag: 'Омега и Теневые сети', desc: 'Ария Т\'Лоак, Омега, триада наёмников (Синие Светила, Затмение, Кровавая Стая) и секретная сеть Призрака.' }
    ]
  },
  {
    group: '🚀 Звездоплавание и Технологии',
    color: '#22c55e',
    items: [
      { id: 'tech_eezo', icon: '🌀', title: 'Элемент Ноль и Ретрансляторы массы', tag: 'Физика Темной Энергии', desc: 'Принцип работы поля темной энергии, физика FTL-сверхсвета, первичные и вторичные ретрансляторы.' },
      { id: 'tech_omnitool', icon: '🔶', title: 'Омни-инструменты и Уни-гель', tag: 'Голо-интерфейс', desc: 'Микрофабрикаторы омни-инструментов, тактические омни-лезвия, применение меди-геля и полевой ремонт.' },
      { id: 'tech_normandy', icon: '🛸', title: 'Фрегат «Нормандия» SR-2 и системы IES', tag: 'Стелс-прототипы', desc: 'Стелс-маскировка IES, колоссальное ядро Тантала, отсеки фрегата и тактические сенсоры дальнего сканирования.' }
    ]
  }
];

ME.codexArticles = {
  matrix: {
    title: 'Матрица урона и слои защиты',
    subtitle: 'Взаимодействие типов урона со слоями кинетической, биотической и биологической защиты',
    tag: 'МЕХАНИКА 5E',
    icon: '🛡️',
    contentHtml:
      '<div style="background:rgba(0,210,255,0.06);border-left:3px solid #00d2ff;padding:12px 14px;border-radius:3px;margin-bottom:14px;">' +
        '<strong style="color:#00d2ff;">Архитектура защиты в Mass Effect 5e:</strong> Каждое живое существо или боевой мех обладает слоями обороны. Урон наносится строго последовательно: снаружи внутрь (Щиты / Барьеры ➔ Броня ➔ Здоровье).' +
      '</div>' +
      '<div style="overflow-x:auto;margin-bottom:16px;">' +
        '<table class="me-table" style="width:100%;border-collapse:collapse;font-size:12.5px;">' +
          '<thead>' +
            '<tr style="border-bottom:1px solid rgba(0,210,255,0.4);color:#00d2ff;text-align:left;">' +
              '<th style="padding:8px;">Тип урона</th>' +
              '<th style="padding:8px;color:#00d2ff;">Щиты (Shields)</th>' +
              '<th style="padding:8px;color:#b266ff;">Барьеры (Barriers)</th>' +
              '<th style="padding:8px;color:#ffaa33;">Броня (Armor)</th>' +
              '<th style="padding:8px;color:#ff5555;">Здоровье (HP)</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            '<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">' +
              '<td style="padding:8px;font-weight:bold;color:#fff;">Оружие / Кинетика</td>' +
              '<td style="padding:8px;color:#00d2ff;">100%</td>' +
              '<td style="padding:8px;color:#b266ff;">50%</td>' +
              '<td style="padding:8px;color:#ffaa33;">− Порог DT</td>' +
              '<td style="padding:8px;color:#ff5555;">100%</td>' +
            '</tr>' +
            '<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">' +
              '<td style="padding:8px;font-weight:bold;color:#00d2ff;">Электро / Перегрузка</td>' +
              '<td style="padding:8px;color:#00d2ff;font-weight:bold;">200% (×2)</td>' +
              '<td style="padding:8px;color:#b266ff;">100%</td>' +
              '<td style="padding:8px;color:#ffaa33;">50%</td>' +
              '<td style="padding:8px;color:#ff5555;">100% (синтетики ×2)</td>' +
            '</tr>' +
            '<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">' +
              '<td style="padding:8px;font-weight:bold;color:#b266ff;">Биотика / Деформация</td>' +
              '<td style="padding:8px;color:#00d2ff;">50%</td>' +
              '<td style="padding:8px;color:#b266ff;font-weight:bold;">200% (×2)</td>' +
              '<td style="padding:8px;color:#ffaa33;font-weight:bold;">200% (порог DT −2)</td>' +
              '<td style="padding:8px;color:#ff5555;">100%</td>' +
            '</tr>' +
            '<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">' +
              '<td style="padding:8px;font-weight:bold;color:#ffaa33;">Огонь / Поджог</td>' +
              '<td style="padding:8px;color:#00d2ff;">50%</td>' +
              '<td style="padding:8px;color:#b266ff;">50%</td>' +
              '<td style="padding:8px;color:#ffaa33;font-weight:bold;">200% (горение)</td>' +
              '<td style="padding:8px;color:#ff5555;font-weight:bold;">200% (органика)</td>' +
            '</tr>' +
            '<tr>' +
              '<td style="padding:8px;font-weight:bold;color:#70dbdb;">Крио / Заморозка</td>' +
              '<td style="padding:8px;color:#00d2ff;">50%</td>' +
              '<td style="padding:8px;color:#b266ff;">50%</td>' +
              '<td style="padding:8px;color:#ffaa33;">Хрупкость (порог −2)</td>' +
              '<td style="padding:8px;color:#ff5555;">Заморозка / Оцепенение</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="me-card">' +
          '<h4 style="color:#ffaa33;margin-top:0;">🛡️ Порог брони (Damage Threshold — DT)</h4>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Каждая единица тяжелой брони имеет значение DT (обычно 2–6). Значение DT вычитается из <em>каждого отдельного попадания или пули в очереди</em>. Из-за этого скорострельные пистолеты-пулемёты (SMG) почти бессильны против брони шагоходов и кроганов, тогда как тяжелые крупнокалиберные снайперские винтовки («Вдова») пробивают DT одним сокрушительным залпом.</p>' +
        '</div>' +
        '<div class="me-card">' +
          '<h4 style="color:#00d2ff;margin-top:0;">⚡ Регенерация кинетических щитов</h4>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Если персонаж находится в полном укрытии и не получает урона в течение 1 полного раунда (6 секунд), его кинетический щит начинает мгновенно перезаряжаться со скоростью <strong>5 + Бонус Мастерства</strong> хитов в начале каждого хода.</p>' +
        '</div>' +
      '</div>'
  },

  combos: {
    title: 'Технические и биотические комбо',
    subtitle: 'Двухфазная боевая система: маркеры (Primers) и детонаторы (Detonators)',
    tag: 'КОМБО-СИСТЕМА',
    icon: '💥',
    contentHtml:
      '<div style="background:rgba(178,102,255,0.06);border-left:3px solid #b266ff;padding:12px 14px;border-radius:3px;margin-bottom:14px;">' +
        '<strong style="color:#b266ff;">Правило связки:</strong> Первая способность накладывает на цель статус <em>Маркера (Primer)</em> на 1 минуту. Любая последующая способность с дескриптором <em>Детонатор (Detonator)</em> снимает статус и производит сокрушительный взрыв в радиусе 15 фт.' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="me-card" style="border-left:3px solid #b266ff;">' +
          '<h3 style="color:#b266ff;margin-top:0;">💥 БИОТИЧЕСКИЙ ВЗРЫВ</h3>' +
          '<div style="font-size:12.5px;color:#8bb1d6;margin-bottom:8px;"><strong>Маркеры:</strong> Деформация, Притяжение, Сингулярность, Стазис.</div>' +
          '<div style="font-size:12.5px;color:#8bb1d6;margin-bottom:8px;"><strong>Детонаторы:</strong> Биотический рывок, Отталкивание, Новая, Ударная волна.</div>' +
          '<div style="font-size:12px;color:#c8e1f5;background:rgba(0,0,0,0.3);padding:8px;border-radius:3px;">Эффект: Мощнейший гравитационный коллапс в радиусе 15 фт. Наносит 3d8 + Уровень игрока силового биотического урона и сбивает все цели с ног (спасбросок СИЛ отменяет падение).</div>' +
        '</div>' +
        '<div class="me-card" style="border-left:3px solid #00d2ff;">' +
          '<h3 style="color:#00d2ff;margin-top:0;">⚡ ТЕХНИЧЕСКИЙ РАЗРЯД</h3>' +
          '<div style="font-size:12.5px;color:#8bb1d6;margin-bottom:8px;"><strong>Маркеры:</strong> Перегрузка, Поглощение энергии.</div>' +
          '<div style="font-size:12.5px;color:#8bb1d6;margin-bottom:8px;"><strong>Детонаторы:</strong> Поджог, Заморозка, Омни-луч, Выстрел дрона.</div>' +
          '<div style="font-size:12px;color:#c8e1f5;background:rgba(0,0,0,0.3);padding:8px;border-radius:3px;">Эффект: Цепная статическая дуга на 20 фт. Наносит 2d10 урона электричеством, снимает щиты по площади и оглушает синтетиков на 1 раунд (спасбросок ТЕЛ).</div>' +
        '</div>' +
        '<div class="me-card" style="border-left:3px solid #ffaa33;">' +
          '<h3 style="color:#ffaa33;margin-top:0;">🔥 ОГНЕННЫЙ ВЗРЫВ</h3>' +
          '<div style="font-size:12.5px;color:#8bb1d6;margin-bottom:8px;"><strong>Маркеры:</strong> Поджог, Зажигательные патроны.</div>' +
          '<div style="font-size:12.5px;color:#8bb1d6;margin-bottom:8px;"><strong>Детонаторы:</strong> Перегрузка, Деформация, Биотический рывок.</div>' +
          '<div style="font-size:12px;color:#c8e1f5;background:rgba(0,0,0,0.3);padding:8px;border-radius:3px;">Эффект: Вспышка белого напалма 15 фт. Наносит 2d8 урона огнем, поджигает цели на 1d6 каждый раунд и снижает показатель брони DT на 2 до конца боя.</div>' +
        '</div>' +
        '<div class="me-card" style="border-left:3px solid #70dbdb;">' +
          '<h3 style="color:#70dbdb;margin-top:0;">❄️ КРИО-РАСКОЛ</h3>' +
          '<div style="font-size:12.5px;color:#8bb1d6;margin-bottom:8px;"><strong>Маркеры:</strong> Заморозка, Крио-патроны.</div>' +
          '<div style="font-size:12.5px;color:#8bb1d6;margin-bottom:8px;"><strong>Детонаторы:</strong> Любой критический урон или прямая атака.</div>' +
          '<div style="font-size:12px;color:#c8e1f5;background:rgba(0,0,0,0.3);padding:8px;border-radius:3px;">Эффект: Разрыв ледяной корки. Осколки наносят 2d6 колющего крио-урона и уменьшают скорость передвижения всех врагов в радиусе вдвое на 2 хода.</div>' +
        '</div>' +
      '</div>'
  },

  tactics: {
    title: 'Тактика боя 5e и укрытия',
    subtitle: 'Позиционные перестрелки, баллистические дистанции и экономика термозарядов',
    tag: 'ТАКТИЧЕСКИЙ БОЙ',
    icon: '🎯',
    contentHtml:
      '<div class="me-card" style="margin-bottom:14px;">' +
        '<h4 style="color:#00d2ff;margin-top:0;">🧱 Система укрытий (Cover System)</h4>' +
        '<ul style="font-size:13px;color:#8bb1d6;line-height:1.7;margin:0;padding-left:20px;">' +
          '<li><strong>Половинное укрытие (Half Cover):</strong> низкие бетонные блоки, консоли, ящики. Дает <strong style="color:#fff;">+2 к КБ (AC)</strong> и спасброскам Ловкости.</li>' +
          '<li><strong>Укрытие на три четверти (Three-Quarters Cover):</strong> дверные проемы, углы коридоров космических станций. Дает <strong style="color:#fff;">+5 к КБ (AC)</strong>.</li>' +
          '<li><strong>Полное укрытие (Full Cover):</strong> герметичные переборки, монолитные стены. Субъект не может быть выбран прямой целью для выстрелов и направленной биотики.</li>' +
        '</ul>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="me-card">' +
          '<h4 style="color:#ffaa33;margin-top:0;">🔄 Охлаждение и термозаряды</h4>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Современное стрелковое оружие Млечного Пути использует одноразовые радиаторные картриджи — <strong>термозаряды</strong>. Замена отработанного блока требует <em>Бонусного действия</em> (для подготовленных бойцов N7) или <em>Основного действия</em>. В полевых условиях запас термозарядов ограничен ячейками боекомплекта брони.</p>' +
        '</div>' +
        '<div class="me-card">' +
          '<h4 style="color:#22c55e;margin-top:0;">⚡ Активная реакция: Перекат в укрытие</h4>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Когда по персонажу совершается успешная дальнобойная атака, он может потратить свою <em>Реакцию</em> на тактический перекат к ближайшему укрытию (в пределах 10 фт), совершив проверку Ловкости (Акробатика) против броска атаки врага.</p>' +
        '</div>' +
      '</div>'
  },

  races_citadel: {
    title: 'Расы Пространства Цитадели',
    subtitle: 'Азари, Турианцы, Саларианцы и Человечество — архитекторы галактического мира',
    tag: 'СОВЕТ ЦИТАДЕЛИ',
    icon: '🏛️',
    contentHtml:
      '<div class="grid-2">' +
        '<div class="me-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;"><h3 style="color:#b266ff;margin:0;">Азари (Asari)</h3><span class="me-tag-holo">Тессия • Левоамино</span></div>' +
          '<p style="font-size:12.5px;color:#8bb1d6;margin-top:8px;">Однополая биотическая раса непревзойденных дипломатов и философов, живущая до 1000 лет. Их нервная система пронизана природным элементом ноль, что делает каждую азари потенциальным биотиком.</p>' +
          '<div style="font-size:11.5px;color:#c8e1f5;background:rgba(0,0,0,0.3);padding:6px 10px;border-radius:3px;">Бонусы 5e: +2 Харизма, +1 Мудрость. Врожденный заговор биотики, способность к слиянию сознаний (Мельд).</div>' +
        '</div>' +
        '<div class="me-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;"><h3 style="color:#00d2ff;margin:0;">Турианцы (Turians)</h3><span class="me-tag-holo">Палавен • Декстроамино</span></div>' +
          '<p style="font-size:12.5px;color:#8bb1d6;margin-top:8px;">Милитаризованная культура строжайшей чести и дисциплины. Хитиновый панцирь защищает от жесткой радиации родного светила. Составляют основу миротворческого флота Совета.</p>' +
          '<div style="font-size:11.5px;color:#c8e1f5;background:rgba(0,0,0,0.3);padding:6px 10px;border-radius:3px;">Бонусы 5e: +2 Ловкость, +1 Телосложение. +1 к базовому КБ за счет панциря, владение всеми видами оружия.</div>' +
        '</div>' +
        '<div class="me-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;"><h3 style="color:#ffaa33;margin:0;">Саларианцы (Salarians)</h3><span class="me-tag-holo">Сур\'Кеш • Левоамино</span></div>' +
          '<p style="font-size:12.5px;color:#8bb1d6;margin-top:8px;">Амфибии с молниеносным метаболизмом: спят по 1 часу в сутки, мыслят и говорят с невероятной скоростью. Мастера шпионажа (ГОР / STG), генетики и технической разведки.</p>' +
          '<div style="font-size:11.5px;color:#c8e1f5;background:rgba(0,0,0,0.3);padding:6px 10px;border-radius:3px;">Бонусы 5e: +2 Интеллект, +1 Ловкость. Преимущество на проверки Инициативы и взлома систем (Анализ).</div>' +
        '</div>' +
        '<div class="me-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;"><h3 style="color:#22c55e;margin:0;">Человечество (Humans)</h3><span class="me-tag-holo">Земля • Левоамино</span></div>' +
          '<p style="font-size:12.5px;color:#8bb1d6;margin-top:8px;">Новички на галактической арене (вышли в космос менее 30 лет назад), но поразили Совет своей адаптивностью, военной инициативой Альянса и безграничными амбициями.</p>' +
          '<div style="font-size:11.5px;color:#c8e1f5;background:rgba(0,0,0,0.3);padding:6px 10px;border-radius:3px;">Бонусы 5e: +1 к двум характеристикам, одна бесплатная черта (Feat) или навык на выбор.</div>' +
        '</div>' +
      '</div>'
  },

  races_outer: {
    title: 'Расы Внешних Систем и Терминала',
    subtitle: 'Кроганы, Кварианцы, Дреллы, Батарианцы, Ворча — обитатели опасного фронтира',
    tag: 'ФРОНТИР И ДМЗ',
    icon: '💀',
    contentHtml:
      '<div class="grid-2">' +
        '<div class="me-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;"><h3 style="color:#ff5555;margin:0;">Кроганы (Krogans)</h3><span class="me-tag-holo">Тучанка • Левоамино</span></div>' +
          '<p style="font-size:12.5px;color:#8bb1d6;margin-top:8px;">Невероятно живучие гиганты с дублированными внутренними органами и горбом-накопителем. Пережили ядерную зиму Тучанки, восстание и генофаг саларианцев.</p>' +
          '<div style="font-size:11.5px;color:#c8e1f5;background:rgba(0,0,0,0.3);padding:6px 10px;border-radius:3px;">Бонусы 5e: +2 Сила, +2 Телосложение. Кровавая ярость (Blood Rage) при падении ниже половины HP (+2 к урону в ближнем бою).</div>' +
        '</div>' +
        '<div class="me-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;"><h3 style="color:#b266ff;margin:0;">Кварианцы (Quarians)</h3><span class="me-tag-holo">Раннох • Декстроамино</span></div>' +
          '<p style="font-size:12.5px;color:#8bb1d6;margin-top:8px;">Скитальцы Мигрирующего Флота из 50 000 кораблей. Создали гетов и потеряли родной мир. Из-за стерильной среды флота вынуждены постоянно носить гермокостюмы.</p>' +
          '<div style="font-size:11.5px;color:#c8e1f5;background:rgba(0,0,0,0.3);padding:6px 10px;border-radius:3px;">Бонусы 5e: +2 Интеллект, +1 Ловкость. Экспертиза в ремонте техники, робототехнике и перепрограммировании синтетиков.</div>' +
        '</div>' +
        '<div class="me-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;"><h3 style="color:#22c55e;margin:0;">Дреллы (Drell)</h3><span class="me-tag-holo">Рахана • Левоамино</span></div>' +
          '<p style="font-size:12.5px;color:#8bb1d6;margin-top:8px;">Рептилоидные гуманоиды с эйдетической памятью: способны переживать прошлое в мельчайших деталях. Спасены ханарами от гибели родного мира Рахана, служат разведчиками и ассасинами.</p>' +
          '<div style="font-size:11.5px;color:#c8e1f5;background:rgba(0,0,0,0.3);padding:6px 10px;border-radius:3px;">Бонусы 5e: +2 Ловкость, +1 Мудрость. Фотографическая память, мастерство рукопашного боя и скрытности.</div>' +
        '</div>' +
        '<div class="me-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;"><h3 style="color:#ffaa33;margin:0;">Батарианцы (Batarians)</h3><span class="me-tag-holo">Хар\'шан • Левоамино</span></div>' +
          '<p style="font-size:12.5px;color:#8bb1d6;margin-top:8px;">Четырехглазые милитаристы с жесткой кастовой системой. Порвали отношения с Советом Цитадели из-за экспансии людей в Скиллианском Пределе; контролируют пиратство Терминала.</p>' +
          '<div style="font-size:11.5px;color:#c8e1f5;background:rgba(0,0,0,0.3);padding:6px 10px;border-radius:3px;">Бонусы 5e: +2 Телосложение, +1 Сила. Четыре глаза дают преимущество на проверки Внимания от засад.</div>' +
        '</div>' +
      '</div>'
  },

  races_ancient: {
    title: 'Уникальные и древние формы жизни',
    subtitle: 'Волусы, Элкоры, Ханары, Геты и загадочные Протеане',
    tag: 'СИНТЕТИКИ И ДРЕВНИЕ',
    icon: '🔮',
    contentHtml:
      '<div class="grid-2">' +
        '<div class="me-card">' +
          '<h3 style="color:#ffaa33;margin-top:0;">💰 Волусы (Volus)</h3>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Родом с аммиачной планеты Ирун с высоким давлением. Архитекторы «Акта об универсальной банковской системе Цитадели» и создатели кредита. Постоянно находятся в защитных скафандрах под давлением.</p>' +
        '</div>' +
        '<div class="me-card">' +
          '<h3 style="color:#00d2ff;margin-top:0;">🐘 Элкоры (Elcor)</h3>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Массивные четвероногие великаны с высокой гравитацией родного мира Декууна. Говорят медленно и монотонно, предварительно озвучивая эмоцию («С искренним любопытством: как дела?»). В бою несут тяжелые пушки на спине.</p>' +
        '</div>' +
        '<div class="me-card">' +
          '<h3 style="color:#b266ff;margin-top:0;">🪼 Ханары (Hanar)</h3>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Глубоководные полупрозрачные медузы планеты Кахье. Исключительно вежливы, о себе говорят в третьем лице («Этот скромно просит извинить»). Поклоняются Протеанам как «Вдохновителям».</p>' +
        '</div>' +
        '<div class="me-card">' +
          '<h3 style="color:#70dbdb;margin-top:0;">🤖 Геты (Geth)</h3>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Сетевой синтетический разум. Отдельная программа гета не умнее мыши, но в кластере из сотен программ мобильная платформа обретает сверхразум. Ищут самоопределение и будущее своего народа.</p>' +
        '</div>' +
      '</div>'
  },

  factions_council: {
    title: 'Совет Цитадели и СПЕКТРы',
    subtitle: 'Высшая законодательная и арбитражная власть Пространства Цитадели',
    tag: 'ВЫСШАЯ ВЛАСТЬ',
    icon: '⚖️',
    contentHtml:
      '<div class="me-card" style="margin-bottom:14px;">' +
        '<h3 style="color:#00d2ff;margin-top:0;">🏛️ Совет Цитадели (The Council)</h3>' +
        '<p style="font-size:12.5px;color:#8bb1d6;line-height:1.6;">Триумвират послов Азари, Саларианцев и Турианцев (позже расширенный представителем Человечества). Совет разрешает межзвездные споры, регулирует применение флотских дредноутов (Фаросская конвенция) и курирует сеть ретрансляторов массы.</p>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="me-card" style="border-left:3px solid #b266ff;">' +
          '<h3 style="color:#b266ff;margin-top:0;">🗡️ Институт СПЕКТР (Spectres)</h3>' +
          '<p style="font-size:12.5px;color:#8bb1d6;"><strong>Специальный Корпус Тактической Разведки.</strong> Элитные оперативники, наделенные Советом чрезвычайными правами. Спектр стоит выше любых местных законов, имеет доступ к секретным арсеналам и отчитывается <em>исключительно перед Советом Цитадели</em>. Девиз: «Цель оправдывает любые средства».</p>' +
        '</div>' +
        '<div class="me-card" style="border-left:3px solid #00d2ff;">' +
          '<h3 style="color:#00d2ff;margin-top:0;">👮 Служба Безопасности Цитадели (C-Sec)</h3>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Огромная 200-тысячная многовидовая полиция, патрулирующая Кольцо Президиума и жилые Закоулки гигантской космической станции Цитадель. Возглавляется исполнительным директором (палавенский турианский офицер).</p>' +
        '</div>' +
      '</div>'
  },

  factions_alliance: {
    title: 'Альянс Систем и Вооруженные силы',
    subtitle: 'Объединенное правительство человечества, Станция Арктур и доктрина N7',
    tag: 'АЛЬЯНС СИСТЕМ',
    icon: '🎖️',
    contentHtml:
      '<div class="me-card" style="margin-bottom:14px;">' +
        '<h3 style="color:#00d2ff;margin-top:0;">🌍 Альянс Систем (Systems Alliance)</h3>' +
        '<p style="font-size:12.5px;color:#8bb1d6;line-height:1.6;">Создан после раскопок на Марсе в 2148 году и обнаружения ретранслятора Харона. Представляет интересы всего человечества в Галактике со штаб-квартирой на Станции Арктур. Обладает крупным современным авианосным флотом во главе с флагманом «Эверест».</p>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="me-card" style="border-left:3px solid #ff5555;">' +
          '<h3 style="color:#ff5555;margin-top:0;">🎖️ Программа N7 (Special Forces)</h3>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Высший знак отличия спецназа ВКС Альянса. Буква <strong>N</strong> обозначает Специальные силы, цифра <strong>7</strong> — высший уровень прохождения жесточайших боевых симуляций на полигоне Вилла Рома (Рио-де-Жанейро) и в открытом космосе. Оперативники N7 обучаются действовать в абсолютном меньшинстве.</p>' +
        '</div>' +
        '<div class="me-card" style="border-left:3px solid #00d2ff;">' +
          '<h3 style="color:#00d2ff;margin-top:0;">🚀 5-й Флот Альянса</h3>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Командующий: адмирал Стивен Хакетт. Быстроходные крейсеры и фрегаты, применяющие тактику прикрытия звеньев истребителей перехватчиками. Флот показал высочайшую эффективность при защите Цитадели.</p>' +
        '</div>' +
      '</div>'
  },

  factions_syndicates: {
    title: 'Синдикаты Терминала и «Цербер»',
    subtitle: 'Ария Т\'Лоак, криминальная теневая экономика и сеть Призрака',
    tag: 'ТЕНЕВОЙ СЕКТОР',
    icon: '☣️',
    contentHtml:
      '<div class="me-card" style="margin-bottom:14px;">' +
        '<h3 style="color:#b266ff;margin-top:0;">🍸 Ария Т\'Лоак и Станция Омега</h3>' +
        '<p style="font-size:12.5px;color:#8bb1d6;line-height:1.6;">«На Омеге есть только одно правило: не переходи дорогу Арии». Заброшенная шахтерская станция в поясе астероидов стала некоронованной столицей Систем Терминала, черным рынком наркотиков, оружия и контрабандного нулевого элемента.</p>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="me-card" style="border-left:3px solid #ffaa33;">' +
          '<h3 style="color:#ffaa33;margin-top:0;">🏴 Наёмные армии Терминала</h3>' +
          '<ul style="font-size:12px;color:#8bb1d6;padding-left:16px;margin:0;line-height:1.7;">' +
            '<li><strong>Синие Светила (Blue Suns):</strong> ЧВК людей и батарианцев с бронетехникой и тяжелой артиллерией.</li>' +
            '<li><strong>Затмение (Eclipse):</strong> наёмники-азари и саларианцы, мастера диверсий, биотики и боевых мехов ИМИР.</li>' +
            '<li><strong>Кровавая Стая (Blood Pack):</strong> штурмовые банды кроганов и ворча с тяжелыми огнеметами.</li>' +
          '</ul>' +
        '</div>' +
        '<div class="me-card" style="border-left:3px solid #ff5555;">' +
          '<h3 style="color:#ff5555;margin-top:0;">🧬 Организация «Цербер» (Cerberus)</h3>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Военизированный подпольный синдикат, созданный загадочным лидером по прозвищу «Призрак» (Illusive Man). Цель — выживание и абсолютное превосходство человечества в Галактике любой ценой. Имеет неограниченный бюджет, собственные верфи и генетические лаборатории.</p>' +
        '</div>' +
      '</div>'
  },

  tech_eezo: {
    title: 'Элемент Ноль и Ретрансляторы массы',
    subtitle: 'Физика эффекта массы, сверхсветовые полеты и галактическая сеть ретрансляторов',
    tag: 'ФИЗИКА И СВЕРХСВЕТ',
    icon: '🌀',
    contentHtml:
      '<div class="me-card" style="margin-bottom:14px;">' +
        '<h3 style="color:#00d2ff;margin-top:0;">⚛️ Нулевой элемент (Element Zero / Eezo)</h3>' +
        '<p style="font-size:12.5px;color:#8bb1d6;line-height:1.6;">Редчайший минерал, образующийся при взрывах сверхновых звезд в ядрах планет. При пропускании постоянного электрического тока определенной полярности темная энергия сжимает или расширяет метрику пространства, увеличивая или уменьшая массу объектов в поле действия эффекта массы до нуля.</p>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="me-card">' +
          '<h4 style="color:#b266ff;margin-top:0;">🛰️ Ретрансляторы массы (Mass Relays)</h4>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Гигантские 15-километровые монолиты в глубоком вакууме. Создают безинерционный туннель между звездами. <strong>Первичные ретрансляторы</strong> способны мгновенно перебрасывать корабли через тысячи световых лет в другие сектора. <strong>Вторичные</strong> связывают соседние скопления на сотни световых лет.</p>' +
        '</div>' +
        '<div class="me-card">' +
          '<h4 style="color:#ffaa33;margin-top:0;">⚡ Сброс статического заряда FTL</h4>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Любой корабль, летящий со сверхсветовой скоростью (FTL), накапливает в корпусе колоссальный статический заряд. Каждые 50 часов полета корабль <em>обязан войти в магнитное поле газового гиганта или планеты</em> для разрядки, иначе ядро взорвется от перегрева.</p>' +
        '</div>' +
      '</div>'
  },

  tech_omnitool: {
    title: 'Омни-инструменты и Уни-гель',
    subtitle: 'Голографический интерфейс, 3D-микрофабрикаторы, омни-лезвия и нано-медицина',
    tag: 'ЭКИПИРОВКА И СОФТ',
    icon: '🔶',
    contentHtml:
      '<div class="me-card" style="margin-bottom:14px;">' +
        '<h3 style="color:#ffaa33;margin-top:0;">📱 Омни-инструмент (Omni-Tool)</h3>' +
        '<p style="font-size:12.5px;color:#8bb1d6;line-height:1.6;">Миниатюрный квантовый компьютер, закрепляемый на предплечье. Проецирует оранжевый сенсорный голографический дисплей и содержит встроенный 3D-микрофабрикатор, способный на молекулярном уровне за секунды печатать детали, сканеры, дешифраторы и боевые лезвия.</p>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="me-card" style="border-left:3px solid #ffaa33;">' +
          '<h4 style="color:#ffaa33;margin-top:0;">🗡️ Омни-клинок (Omni-Blade)</h4>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Голографический раскаленный клинок из алмазоподобного полимера, синтезируемый за долю секунды. Наносит 1d8 + Модификатор ЛОВ/СИЛ колющего урона, игнорируя базовый порог брони (DT) цели за счет сверхвысокой температуры лезвия.</p>' +
        '</div>' +
        '<div class="me-card" style="border-left:3px solid #22c55e;">' +
          '<h4 style="color:#22c55e;margin-top:0;">🧪 Меди-гель (Medi-Gel)</h4>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Универсальный фармакологический гель. Содержит анестетики, свертывающие наномашины и генные стимуляторы. В бою применение меди-геля в качестве <em>Бонусного действия</em> восстанавливает <strong>2d4 + 2 HP</strong> и стабилизирует умирающего оперативника.</p>' +
        '</div>' +
      '</div>'
  },

  tech_normandy: {
    title: 'Фрегат «Нормандия» SR-2 и системы IES',
    subtitle: 'Скрытные поглотители выбросов IES, ядро Тантала и тактическое превосходство',
    tag: 'ФЛАГМАН И СТЕЛС',
    icon: '🛸',
    contentHtml:
      '<div class="me-card" style="margin-bottom:14px;">' +
        '<h3 style="color:#00d2ff;margin-top:0;">🛸 Фрегат «Нормандия» SR-2</h3>' +
        '<p style="font-size:12.5px;color:#8bb1d6;line-height:1.6;">Вершина космического кораблестроения Млечного Пути. Вдвое крупнее предшественницы SR-1, оснащена передовым боевым информационным центром (CIC), каютами экипажа, арсеналом и ангаром для шаттла «Кадьяк».</p>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="me-card" style="border-left:3px solid #00d2ff;">' +
          '<h4 style="color:#00d2ff;margin-top:0;">🔇 Стелс-маскировка IES</h4>' +
          '<p style="font-size:12.5px;color:#8bb1d6;"><strong>Internal Emissions Sink (IES).</strong> Обычные корабли выдают себя тепловым излучением в холодный космос. «Нормандия» временно запирает всё тепло двигателей во внутренних криогенных радиаторах. До 3 часов корабль абсолютно невидим для дальних сенсоров вражеских флотов.</p>' +
        '</div>' +
        '<div class="me-card" style="border-left:3px solid #b266ff;">' +
          '<h4 style="color:#b266ff;margin-top:0;">⚡ Ядро эффекта массы «Тантал»</h4>' +
          '<p style="font-size:12.5px;color:#8bb1d6;">Непропорционально гигантское ядро нулевого элемента, генерирующее концентрации гравитации перед носом корабля. Фрегат фактически «падает» вперед без задействования плазменных реактивных сопел, что дает максимальную скрытность и маневренность.</p>' +
        '</div>' +
      '</div>'
  }
};


// ============================================================
// РАЗДЕЛ СТИХИЯ (ELEMENTS MODE)
// ============================================================
var EL = window.EL = window.EL || {
  getProfile: function(){
    try {
      var raw = localStorage.getItem('el_profile');
      if(raw){
        var p = JSON.parse(raw);
        if(!p.firstName && p.name){
          var parts = String(p.name).trim().split(' ');
          p.firstName = parts[0] || 'Новый';
          p.lastName = parts.slice(1).join(' ') || '';
        }
        if(!p.firstName) p.firstName = 'Новый';
        if(typeof p.lastName === 'undefined') p.lastName = '';
        if(!p.element) p.element = 'Земля';
        if(typeof p.level === 'undefined') p.level = 1;
        if(typeof p.hp === 'undefined') p.hp = 12;
        if(typeof p.ac === 'undefined') p.ac = 10;
        if(typeof p.note === 'undefined') p.note = '';
        return p;
      }
    } catch(e){}
    return {
      firstName: 'Новый',
      lastName: '',
      element: 'Земля',
      level: 1,
      hp: 12,
      ac: 10,
      note: ''
    };
  },
  saveProfile: function(p){
    try {
      localStorage.setItem('el_profile', JSON.stringify(p));
    } catch(e){}
  },
  elementToTheme: function(elem){
    if(elem === 'Ветер') return 'wind';
    if(elem === 'Вода') return 'water';
    if(elem === 'Огонь') return 'fire';
    if(elem === 'Земля') return 'earth';
    if(elem === 'Тьма') return 'dark';
    // Аватар и Без стихии: темы пока не делаем -> используем базовую earth
    return 'earth';
  },
  getTheme: function(){
    var p = EL.getProfile();
    return EL.elementToTheme(p.element);
  },
  setTheme: function(t){
    try { localStorage.setItem('el_theme', t); } catch(e){}
    EL.applyTheme();
  },
  applyTheme: function(){
    if(typeof document === 'undefined' || !document.body) return;
    var fx = document.getElementById('elThemeFx');
    if(typeof HB === 'undefined' || HB.mode !== 'el'){
      document.body.classList.remove('el-theme', 'el-theme-wind', 'el-theme-water', 'el-theme-fire', 'el-theme-earth', 'el-theme-dark');
      if(fx) fx.style.display = 'none';
      return;
    }
    var t = EL.getTheme();
    document.body.classList.remove('el-theme-wind', 'el-theme-water', 'el-theme-fire', 'el-theme-earth', 'el-theme-dark');
    document.body.classList.add('el-theme-' + t);
    EL.updateThemeFx(t);
  },
  updateThemeFx: function(theme){
    if(typeof document === 'undefined' || !document.body) return;
    var cont = document.getElementById('elThemeFx');
    if(!cont){
      cont = document.createElement('div');
      cont.id = 'elThemeFx';
      cont.className = 'el-theme-fx';
      cont.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(cont, document.body.firstChild);
    }
    cont.style.display = 'block';
    if(cont.getAttribute('data-theme') === theme && cont.children.length > 0) return;
    cont.setAttribute('data-theme', theme);
    cont.innerHTML = '';
    EL.buildThemeFx(cont, theme);
  },
  buildThemeFx: function(cont, theme){
    // Священный знак стихии на фоне темы
    if(theme === 'wind' || theme === 'water' || theme === 'fire' || theme === 'earth'){
      var crest = document.createElement('div');
      crest.className = 'el-theme-crest el-crest-' + theme;
      crest.setAttribute('aria-hidden', 'true');
      cont.appendChild(crest);
    }
    if(theme === 'wind'){
      // 3 плавных ветровых потока / воздушных порыва
      for(var g = 0; g < 3; g++){
        var gust = document.createElement('div');
        gust.className = 'el-wind-gust';
        var gw = Math.floor(400 + Math.random() * 250);
        var gh = Math.floor(130 + Math.random() * 90);
        gust.style.width = gw + 'px';
        gust.style.height = gh + 'px';
        gust.style.top = (15 + g * 28 + (Math.random() * 10 - 5)) + '%';
        gust.style.left = (-25 + Math.random() * 15) + 'vw';
        var gdur = (16 + Math.random() * 8).toFixed(1);
        var gdel = (-Math.random() * 20).toFixed(1);
        gust.style.animation = 'elWindGustWave ' + gdur + 's cubic-bezier(0.4, 0, 0.2, 1) ' + gdel + 's infinite';
        cont.appendChild(gust);
      }
      // 22 парящих золотых/янтарных листа духа
      for(var i = 0; i < 22; i++){
        var leaf = document.createElement('div');
        leaf.className = 'el-wind-leaf';
        var lw = Math.floor(12 + Math.random() * 14);
        var lh = Math.floor(7 + Math.random() * 8);
        leaf.style.width = lw + 'px';
        leaf.style.height = lh + 'px';
        leaf.style.left = (Math.random() * 110 - 10).toFixed(2) + '%';
        leaf.style.top = (Math.random() * 110 - 10).toFixed(2) + '%';
        var driftX = Math.floor(180 + Math.random() * 240);
        var driftY = Math.floor(240 + Math.random() * 320);
        var ldur = (10 + Math.random() * 9).toFixed(1);
        var ldel = (-Math.random() * 20).toFixed(1);
        var lop = (0.55 + Math.random() * 0.40).toFixed(2);
        leaf.style.setProperty('--w-drift-x', driftX + 'px');
        leaf.style.setProperty('--w-drift-y', driftY + 'px');
        leaf.style.setProperty('--w-op', lop);
        leaf.style.animation = 'elWindDrift ' + ldur + 's ease-in-out ' + ldel + 's infinite';
        cont.appendChild(leaf);
      }
      // 16 золотых воздушных пылинок
      for(var m = 0; m < 16; m++){
        var mote = document.createElement('div');
        mote.className = 'el-wind-mote';
        var msize = Math.floor(2 + Math.random() * 4);
        mote.style.width = msize + 'px';
        mote.style.height = msize + 'px';
        mote.style.left = (Math.random() * 100).toFixed(2) + '%';
        mote.style.top = (Math.random() * 100).toFixed(2) + '%';
        var mdriftX = Math.floor(220 + Math.random() * 280);
        var mdriftY = Math.floor(150 + Math.random() * 220);
        var mdur = (7 + Math.random() * 8).toFixed(1);
        var mdel = (-Math.random() * 15).toFixed(1);
        var mop = (0.60 + Math.random() * 0.35).toFixed(2);
        mote.style.setProperty('--w-drift-x', mdriftX + 'px');
        mote.style.setProperty('--w-drift-y', mdriftY + 'px');
        mote.style.setProperty('--w-op', mop);
        mote.style.animation = 'elWindDrift ' + mdur + 's ease-in-out ' + mdel + 's infinite';
        cont.appendChild(mote);
      }
    } else if(theme === 'water'){
      // 3 каустических подводных световых луча
      for(var c = 0; c < 3; c++){
        var cBeam = document.createElement('div');
        cBeam.className = 'el-water-caustic';
        var cw = Math.floor(220 + Math.random() * 180);
        cBeam.style.width = cw + 'px';
        cBeam.style.height = '100vh';
        cBeam.style.top = '0';
        cBeam.style.left = (12 + c * 34 + (Math.random() * 8 - 4)) + '%';
        var cdur = (14 + Math.random() * 10).toFixed(1);
        var cdel = (-Math.random() * 20).toFixed(1);
        cBeam.style.animation = 'elWaterCausticSway ' + cdur + 's ease-in-out ' + cdel + 's infinite';
        cont.appendChild(cBeam);
      }
      // 24 светящихся лазурных пузырька
      for(var b = 0; b < 24; b++){
        var bub = document.createElement('div');
        bub.className = 'el-water-bubble';
        var bsize = Math.floor(8 + Math.random() * 18);
        bub.style.width = bsize + 'px';
        bub.style.height = bsize + 'px';
        bub.style.left = (Math.random() * 96 + 2).toFixed(2) + '%';
        bub.style.bottom = '-40px';
        var bdist = -Math.floor(750 + Math.random() * 550);
        var bsway = Math.floor((Math.random() * 60) - 30);
        var bdur = (13 + Math.random() * 13).toFixed(1);
        var bdel = (-Math.random() * 26).toFixed(1);
        var bop = (0.55 + Math.random() * 0.40).toFixed(2);
        bub.style.setProperty('--wb-dist', bdist + 'px');
        bub.style.setProperty('--wb-sway', bsway + 'px');
        bub.style.setProperty('--wb-op', bop);
        bub.style.animation = 'elWaterFloatUp ' + bdur + 's ease-in-out ' + bdel + 's infinite';
        cont.appendChild(bub);
      }
      // 14 мерцающих водяных капель
      for(var d = 0; d < 14; d++){
        var drop = document.createElement('div');
        drop.className = 'el-water-droplet';
        var dsize = Math.floor(2 + Math.random() * 4);
        drop.style.width = dsize + 'px';
        drop.style.height = dsize + 'px';
        drop.style.left = (Math.random() * 96 + 2).toFixed(2) + '%';
        drop.style.bottom = '-30px';
        var ddist = -Math.floor(650 + Math.random() * 500);
        var dsway = Math.floor((Math.random() * 40) - 20);
        var ddur = (9 + Math.random() * 9).toFixed(1);
        var ddel = (-Math.random() * 18).toFixed(1);
        var dop = (0.65 + Math.random() * 0.35).toFixed(2);
        drop.style.setProperty('--wb-dist', ddist + 'px');
        drop.style.setProperty('--wb-sway', dsway + 'px');
        drop.style.setProperty('--wb-op', dop);
        drop.style.animation = 'elWaterFloatUp ' + ddur + 's ease-in-out ' + ddel + 's infinite';
        cont.appendChild(drop);
      }
    } else if(theme === 'fire'){
      // 2 пульсирующих пятна жара кальдеры
      for(var fg = 0; fg < 2; fg++){
        var glow = document.createElement('div');
        glow.className = 'el-fire-glow-spot';
        var gw = Math.floor(400 + Math.random() * 220);
        var gh = Math.floor(280 + Math.random() * 140);
        glow.style.width = gw + 'px';
        glow.style.height = gh + 'px';
        glow.style.bottom = '-90px';
        glow.style.left = (fg === 0 ? '10%' : '58%');
        var fdur = (7 + Math.random() * 5).toFixed(1);
        glow.style.animation = 'elFireCalderaPulse ' + fdur + 's ease-in-out infinite alternate';
        cont.appendChild(glow);
      }
      // 34 раскаленные восходящие искры
      for(var e = 0; e < 34; e++){
        var ember = document.createElement('div');
        ember.className = 'el-fire-ember';
        var esize = Math.floor(3 + Math.random() * 5);
        ember.style.width = esize + 'px';
        ember.style.height = esize + 'px';
        ember.style.left = (Math.random() * 98 + 1).toFixed(2) + '%';
        ember.style.bottom = '-20px';
        var eh = -Math.floor(550 + Math.random() * 650);
        var edrift = Math.floor((Math.random() * 90) - 45);
        var edur = (5 + Math.random() * 8).toFixed(1);
        var edel = (-Math.random() * 14).toFixed(1);
        var eop = (0.70 + Math.random() * 0.30).toFixed(2);
        ember.style.setProperty('--fe-h', eh + 'px');
        ember.style.setProperty('--fe-drift', edrift + 'px');
        ember.style.setProperty('--fe-op', eop);
        ember.style.animation = 'elFireEmberRise ' + edur + 's cubic-bezier(0.25, 0.46, 0.45, 0.94) ' + edel + 's infinite';
        cont.appendChild(ember);
      }
      // 12 темных пепельных хлопьев
      for(var a = 0; a < 12; a++){
        var ash = document.createElement('div');
        ash.className = 'el-fire-ash';
        var asize = Math.floor(2 + Math.random() * 4);
        ash.style.width = asize + 'px';
        ash.style.height = asize + 'px';
        ash.style.left = (Math.random() * 98 + 1).toFixed(2) + '%';
        ash.style.bottom = '-20px';
        var ah = -Math.floor(400 + Math.random() * 550);
        var adrift = Math.floor((Math.random() * 120) - 60);
        var adur = (8 + Math.random() * 9).toFixed(1);
        var adel = (-Math.random() * 17).toFixed(1);
        ash.style.setProperty('--fe-h', ah + 'px');
        ash.style.setProperty('--fe-drift', adrift + 'px');
        ash.style.setProperty('--fe-op', '0.45');
        ash.style.animation = 'elFireEmberRise ' + adur + 's ease-in-out ' + adel + 's infinite';
        cont.appendChild(ash);
      }
    } else if(theme === 'dark'){
      // ТЬМА (DARK / KURAYAMI VOID) — На основе темы Кураями из раздела Шиноби
      // 28 левитирующих частиц-плюсиков Тьмы
      var particleCount = 28;
      var colors = ['#cfcfcf', '#9e9e9e', '#b8b8b8', '#787878', '#e5e5e5'];
      for(var i = 0; i < particleCount; i++){
        var p = document.createElement('div');
        p.className = 'sh-kurayami-plus-particle';
        var size = Math.floor(7 + ((i * 5 + 3) % 9));
        var left = Math.floor((i * 13 + (i % 5) * 7) % 94 + 2);
        var top = Math.floor((i * 19 + (i % 4) * 8) % 92 + 3);
        var duration = (9 + ((i * 3 + 2) % 11)).toFixed(1);
        var delay = (-1 * ((i * 2.9 + 1.1) % 16)).toFixed(1);
        var animIndex = (i % 5) + 1;
        var maxOp = (0.16 + ((i % 5) * 0.04)).toFixed(2);
        var col = colors[i % colors.length];
        var thickness = (size > 11 ? '1.5px' : '1.2px');
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = left + '%';
        p.style.top = top + '%';
        p.style.setProperty('--p-op', maxOp);
        p.style.setProperty('--p-col', col);
        p.style.setProperty('--p-th', thickness);
        p.style.animation = 'kurayamiDrift' + animIndex + ' ' + duration + 's ease-in-out ' + delay + 's infinite';
        cont.appendChild(p);
      }
      // 14 медленно дрейфующих графитовых дымных искр
      for(var dk = 0; dk < 14; dk++){
        var dmote = document.createElement('div');
        dmote.className = 'el-dark-shadow-mote';
        var dsize = Math.floor(2 + Math.random() * 5);
        dmote.style.width = dsize + 'px';
        dmote.style.height = dsize + 'px';
        dmote.style.left = (Math.random() * 96 + 2).toFixed(2) + '%';
        dmote.style.top = (Math.random() * 94 + 2).toFixed(2) + '%';
        var ddriftX = Math.floor((Math.random() * 60) - 30);
        var ddriftY = Math.floor((Math.random() * 80) - 40);
        var ddur = (7 + Math.random() * 9).toFixed(1);
        var ddel = (-Math.random() * 15).toFixed(1);
        var dop = (0.45 + Math.random() * 0.35).toFixed(2);
        dmote.style.setProperty('--dk-drift-x', ddriftX + 'px');
        dmote.style.setProperty('--dk-drift-y', ddriftY + 'px');
        dmote.style.setProperty('--dk-op', dop);
        dmote.style.animation = 'elDarkMoteDrift ' + ddur + 's ease-in-out ' + ddel + 's infinite';
        cont.appendChild(dmote);
      }
    } else {
      // Earth (Земля - default/fallback)
      // 2 изумрудных резонансных свечения
      for(var eg = 0; eg < 2; eg++){
        var eglow = document.createElement('div');
        eglow.className = 'el-earth-resonance';
        var ew = Math.floor(450 + Math.random() * 200);
        var eh2 = Math.floor(320 + Math.random() * 150);
        eglow.style.width = ew + 'px';
        eglow.style.height = eh2 + 'px';
        eglow.style.top = (eg === 0 ? '15%' : '60%');
        eglow.style.left = (eg === 0 ? '-10%' : '65%');
        var edur2 = (9 + Math.random() * 6).toFixed(1);
        eglow.style.animation = 'elEarthPulse ' + edur2 + 's ease-in-out infinite alternate';
        cont.appendChild(eglow);
      }
      // 20 парящих кристаллов нефрита в левитации
      for(var k = 0; k < 20; k++){
        var cryst = document.createElement('div');
        cryst.className = 'el-earth-crystal';
        var csize = Math.floor(9 + Math.random() * 15);
        cryst.style.width = csize + 'px';
        cryst.style.height = csize + 'px';
        cryst.style.left = (Math.random() * 92 + 4).toFixed(2) + '%';
        cryst.style.top = (Math.random() * 88 + 6).toFixed(2) + '%';
        var cdriftX = Math.floor((Math.random() * 50) - 25);
        var cdriftY = Math.floor((Math.random() * 70) - 35);
        var cdurt = (8 + Math.random() * 10).toFixed(1);
        var cdelt = (-Math.random() * 18).toFixed(1);
        var cop2 = (0.50 + Math.random() * 0.40).toFixed(2);
        cryst.style.setProperty('--ec-drift-x', cdriftX + 'px');
        cryst.style.setProperty('--ec-drift-y', cdriftY + 'px');
        cryst.style.setProperty('--ec-op', cop2);
        cryst.style.animation = 'elEarthLevitate ' + cdurt + 's ease-in-out ' + cdelt + 's infinite';
        cont.appendChild(cryst);
      }
      // 16 светящихся нефритовых песчинок
      for(var m2 = 0; m2 < 16; m2++){
        var emote = document.createElement('div');
        emote.className = 'el-earth-mote';
        var emsize = Math.floor(2 + Math.random() * 4);
        emote.style.width = emsize + 'px';
        emote.style.height = emsize + 'px';
        emote.style.left = (Math.random() * 94 + 3).toFixed(2) + '%';
        emote.style.top = (Math.random() * 90 + 5).toFixed(2) + '%';
        var edriftX2 = Math.floor((Math.random() * 40) - 20);
        var edriftY2 = Math.floor((Math.random() * 60) - 30);
        var edur3 = (6 + Math.random() * 8).toFixed(1);
        var edel2 = (-Math.random() * 14).toFixed(1);
        var eop2 = (0.60 + Math.random() * 0.35).toFixed(2);
        emote.style.setProperty('--ec-drift-x', edriftX2 + 'px');
        emote.style.setProperty('--ec-drift-y', edriftY2 + 'px');
        emote.style.setProperty('--ec-op', eop2);
        emote.style.animation = 'elEarthLevitate ' + edur3 + 's ease-in-out ' + edel2 + 's infinite';
        cont.appendChild(emote);
      }
    }
  }
};

function elHome(){
  var p = EL.getProfile();
  var fullName = (p.firstName + (p.lastName ? (' ' + p.lastName) : '')).trim() || 'Персонаж';
  var elemIcons = {
    'Ветер': '🌪️',
    'Вода': '🌊',
    'Огонь': '🔥',
    'Земля': '⛰️',
    'Тьма': '🌑',
    'Аватар': '☸️',
    'Без стихии': '⚔️'
  };
  var elemIcon = elemIcons[p.element] || '🌀';

  var hero = '<div class="el-hero-dice" data-go="dice">' +
    '<div class="hero-dice-icon">' + (typeof dieShapeSvg === 'function' ? dieShapeSvg(20, 'elHeroDie', 20) : '🎲') + '</div>' +
    '<div class="hero-dice-text" style="flex:1;min-width:0;">' +
      '<div class="hero-dice-name" style="font-size:24px;font-weight:700;letter-spacing:0.03em;color:#fff;margin-bottom:4px;font-family:\'Cinzel\',serif;">Бросок костей</div>' +
      '<div class="hero-dice-desc" style="font-size:14.5px;color:#94a3b8;font-style:italic;font-family:\'EB Garamond\',serif;">Кубики d4–d20, стихийные резонансы, модификаторы и проверки</div>' +
    '</div>' +
    '<div class="hero-dice-arrow" style="font-size:22px;color:var(--el-accent);font-weight:700;flex-shrink:0;">→</div>' +
  '</div>';

  var items = [
    { nav: 'elTechs', icon: '⚡', t: 'Формы стихий', d: 'Изученные магические формы четырёх стихий, высшие искусства, шкала 0–5 и затраты МВН' },
    { nav: 'elMoves', icon: '🥋', t: 'Боевые приёмы', d: 'Тактические действия, навязывание Окон возможностей (A94/A95), чи-блокинг и атаки оружием' },
    { nav: 'elMap',   icon: '🗺️', t: 'Карта мира', d: 'Интерактивная карта четырёх народов, ключевые локации, калькулятор путешествий и досье' },
    { nav: 'elRef',   icon: '📚', t: 'Справочник', d: 'Полный свод правил, боевой механики, магии четырёх стихий и законов мира' },
    { nav: 'elData',  icon: '💾', t: 'Данные', d: 'Профиль персонажа, стихия, экспорт и параметры' }
  ];

  return '<div class="el-hud">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
      '<div>' +
        '<div style="font-size:24px;font-weight:800;color:#fff;letter-spacing:0.02em;font-family:\'Cinzel\',serif;">' + escapeHtml(fullName) + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
        '<span style="background:var(--el-accent-dim);color:var(--el-tag-text);border:1px solid var(--el-accent-border);padding:4px 11px;border-radius:999px;font-size:12.5px;font-weight:700;font-family:\'JetBrains Mono\',monospace;">' + elemIcon + ' ' + escapeHtml(p.element || 'Стихия') + '</span>' +
        '<span style="background:rgba(255,255,255,0.06);color:#cbd5e1;border:1px solid rgba(255,255,255,0.12);padding:4px 10px;border-radius:999px;font-size:12px;font-family:\'JetBrains Mono\',monospace;">Ур. ' + (p.level || 1) + '</span>' +
        '<span style="background:rgba(239,68,68,0.12);color:#fca5a5;border:1px solid rgba(239,68,68,0.25);padding:4px 10px;border-radius:999px;font-size:12px;font-family:\'JetBrains Mono\',monospace;">❤️ ' + (p.hp || 10) + ' HP</span>' +
        '<span style="background:rgba(56,189,248,0.12);color:#7dd3fc;border:1px solid rgba(56,189,248,0.25);padding:4px 10px;border-radius:999px;font-size:12px;font-family:\'JetBrains Mono\',monospace;">🛡️ КБ ' + (p.ac || 10) + '</span>' +
      '</div>' +
    '</div>' +
  '</div>' +
  '<div class="el-rule"></div>' +
  hero +
  '<div class="section-label" style="font-size:11px;letter-spacing:0.15em;color:var(--el-accent);font-weight:700;margin:18px 0 10px;font-family:\'JetBrains Mono\',monospace;">СИСТЕМНЫЕ РАЗДЕЛЫ // СТИХИЯ</div>' +
  '<div class="menu-list grid-2">' +
    items.map(function(it){
      return '<div class="el-card" data-nav="' + it.nav + '">' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-size:16px;font-weight:700;color:#fff;display:flex;align-items:center;gap:8px;margin-bottom:4px;font-family:\'Cinzel\',serif;">' +
            it.icon + ' ' + it.t +
          '</div>' +
          '<div style="font-size:12.5px;color:#94a3b8;line-height:1.45;font-style:italic;font-family:\'EB Garamond\',serif;">' + it.d + '</div>' +
        '</div>' +
        '<div style="color:var(--el-accent);font-size:22px;flex-shrink:0;margin-left:8px;">›</div>' +
      '</div>';
    }).join('') +
  '</div>';
}
window.elHome = elHome;

function elData(){
  var prof = EL.getProfile();

  var elements = [
    { val: 'Ветер', label: '🌪️ Ветер' },
    { val: 'Вода', label: '🌊 Вода' },
    { val: 'Огонь', label: '🔥 Огонь' },
    { val: 'Земля', label: '⛰️ Земля' },
    { val: 'Тьма', label: '🌑 Тьма' },
    { val: 'Аватар', label: '☸️ Аватар' },
    { val: 'Без стихии', label: '⚔️ Без стихии' }
  ];

  var elementOpts = elements.map(function(el){
    return '<option value="' + escapeAttr(el.val) + '" ' + (prof.element === el.val ? 'selected' : '') + '>' + el.label + '</option>';
  }).join('');

  return renderCrumb([{label:'Стихия', nav:'elHome'},{label:'Данные'}]) +
    '<button class="back" data-go="elHome">← Назад в Стихию</button>' +
    '<h1>Данные</h1>' +
    '<div class="subtitle">Управление профилем персонажа, стихией, резервными копиями и синхронизацией</div>' +
    '<div class="rule"></div>' +

    // ПРОФИЛЬ ПЕРСОНАЖА
    '<div class="sheet-section" style="background:var(--el-card-bg);border:1px solid var(--el-accent-border);border-left:4px solid var(--el-accent);border-radius:4px;padding:16px 20px;margin-bottom:20px;">' +
      '<div class="section-label" style="font-size:11px;letter-spacing:0.15em;color:var(--el-accent);font-weight:700;margin-bottom:12px;font-family:\'JetBrains Mono\',monospace;">👤 ПРОФИЛЬ ПЕРСОНАЖА</div>' +
      
      // Имя и Фамилия
      '<div class="grid-2" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:14px;">' +
        '<div>' +
          '<label style="display:block;font-size:12px;color:var(--ink-dim);margin-bottom:4px;font-weight:600;">Имя:</label>' +
          '<input type="text" id="elProfFirstName" value="' + escapeAttr(prof.firstName || '') + '" placeholder="Имя персонажа" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid var(--el-accent-border);color:#fff;padding:8px 12px;border-radius:4px;font-size:14px;">' +
        '</div>' +
        '<div>' +
          '<label style="display:block;font-size:12px;color:var(--ink-dim);margin-bottom:4px;font-weight:600;">Фамилия / Род:</label>' +
          '<input type="text" id="elProfLastName" value="' + escapeAttr(prof.lastName || '') + '" placeholder="Фамилия или клан" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid var(--el-accent-border);color:#fff;padding:8px 12px;border-radius:4px;font-size:14px;">' +
        '</div>' +
      '</div>' +

      // Стихия и Уровень
      '<div class="grid-2" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:14px;">' +
        '<div>' +
          '<label style="display:block;font-size:12px;color:var(--ink-dim);margin-bottom:4px;font-weight:600;">Стихия:</label>' +
          '<select id="elProfElement" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid var(--el-accent-border);color:#fff;padding:8px 12px;border-radius:4px;font-size:14px;cursor:pointer;">' +
            elementOpts +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label style="display:block;font-size:12px;color:var(--ink-dim);margin-bottom:4px;font-weight:600;">Уровень (1–20):</label>' +
          '<input type="number" min="1" max="20" id="elProfLevel" value="' + (prof.level || 1) + '" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid var(--el-accent-border);color:#fff;padding:8px 12px;border-radius:4px;font-size:14px;">' +
        '</div>' +
      '</div>' +

      // Здоровье и КБ
      '<div class="grid-2" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:14px;">' +
        '<div>' +
          '<label style="display:block;font-size:12px;color:var(--ink-dim);margin-bottom:4px;font-weight:600;">❤️ Здоровье (HP):</label>' +
          '<input type="number" min="1" id="elProfHp" value="' + (prof.hp || 12) + '" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid var(--el-accent-border);color:#fff;padding:8px 12px;border-radius:4px;font-size:14px;">' +
        '</div>' +
        '<div>' +
          '<label style="display:block;font-size:12px;color:var(--ink-dim);margin-bottom:4px;font-weight:600;">🛡️ КБ (Класс Брони / КД):</label>' +
          '<input type="number" min="1" id="elProfAc" value="' + (prof.ac || 10) + '" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid var(--el-accent-border);color:#fff;padding:8px 12px;border-radius:4px;font-size:14px;">' +
        '</div>' +
      '</div>' +

      // Заметки
      '<div style="margin-bottom:14px;">' +
        '<label style="display:block;font-size:12px;color:var(--ink-dim);margin-bottom:4px;font-weight:600;">Хроники и заметки персонажа:</label>' +
        '<textarea id="elProfNote" rows="3" placeholder="Биография, эпоха, школа, наставник..." style="width:100%;box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid var(--el-accent-border);color:#fff;padding:8px 12px;border-radius:4px;font-size:13px;resize:vertical;">' + escapeHtml(prof.note || '') + '</textarea>' +
      '</div>' +

      '<button class="btn btn-primary" id="elSaveProfBtn" style="background:var(--el-gradient);border:none;color:#fff;padding:9px 20px;border-radius:4px;font-weight:700;cursor:pointer;box-shadow:0 0 12px var(--el-accent-glow);">✓ Сохранить профиль</button>' +
    '</div>' +

    // Облако GHSync
    (typeof GHSync !== 'undefined' ? GHSync.renderUI() : '') +

    // Gemini API
    '<div class="gh-sync-card" id="elGeminiApiSection" style="margin-top:20px; margin-bottom:20px;background:var(--el-card-bg);border:1px solid var(--el-accent-border);border-radius:4px;padding:16px 20px;">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">' +
        '<span style="font-size:20px;">✨</span>' +
        '<div>' +
          '<div style="font-weight:700;font-size:14px;color:#fff;font-family:\'Cinzel\',serif;">Google Gemini AI (Интеграция ИИ)</div>' +
          '<div style="font-size:12px;color:#94a3b8;">Генерация стихийных явлений, испытаний и свитков</div>' +
        '</div>' +
      '</div>' +
      '<p style="font-size:12px;color:#94a3b8;margin:0 0 12px 0;">Ключ хранится локально на этом устройстве. Получить бесплатный API-ключ можно в <a href="https://aistudio.google.com/" target="_blank" style="color:var(--el-tag-text);text-decoration:underline;">Google AI Studio</a>.</p>' +
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">' +
        '<input type="password" id="elDataGeminiKey" value="' + escapeAttr(typeof getGeminiApiKey === 'function' ? getGeminiApiKey() : '') + '" placeholder="Вставьте ключ AIzaSy..." style="flex:1; min-width:200px; box-sizing:border-box; background:rgba(0,0,0,0.4); border:1px solid var(--el-accent-border); color:#fff; padding:8px 12px; border-radius:4px; font-family:monospace; font-size:13px;">' +
        '<button class="btn btn-primary" id="elDataSaveGeminiKey" style="background:var(--el-gradient); border:none; padding:8px 16px; border-radius:4px; color:#fff; font-weight:bold; cursor:pointer;">💾 Сохранить API Ключ</button>' +
      '</div>' +
    '</div>' +

    // ХРАНИЛИЩЕ И ЗАЩИТА ДАННЫХ
    (typeof AppStorage !== 'undefined' ? AppStorage.renderWidget('el') : '') +

    // РЕЗЕРВНАЯ КОПИЯ И ЭКСПОРТ СТИХИЙ
    '<div class="sheet-section" style="background:var(--el-card-bg);border:1px solid var(--el-accent-border);border-left:4px solid var(--el-accent);border-radius:4px;padding:16px 20px;margin-bottom:20px;">' +
      '<div class="section-label" style="font-size:11px;letter-spacing:0.15em;color:var(--el-accent);font-weight:700;margin-bottom:12px;font-family:\'JetBrains Mono\',monospace;">💾 РЕЗЕРВНАЯ КОПИЯ СТИХИИ</div>' +
      '<div style="font-size:12.5px;color:#94a3b8;margin-bottom:12px;line-height:1.45;">' +
        'Экспорт всех данных Стихии в единый файл JSON: профиль мага, изученные формы четырёх стихий, боевые приёмы и метки интерактивной карты.' +
      '</div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">' +
        '<button class="btn btn-primary" id="elExportBtn" style="background:var(--el-gradient);border:none;color:#fff;padding:8px 16px;border-radius:4px;font-weight:700;cursor:pointer;">📥 Экспорт в файл JSON</button>' +
        '<button class="btn btn-ghost" id="elImportBtn" style="border:1px solid var(--el-accent-border);color:var(--el-tag-text);padding:8px 16px;border-radius:4px;cursor:pointer;">📤 Импорт из файла...</button>' +
        '<input type="file" id="elImportFile" accept=".json,application/json" style="display:none;">' +
      '</div>' +
    '</div>';
}
window.elData = elData;

function wireElData(){
  var elemSel = document.getElementById('elProfElement');
  if(elemSel){
    elemSel.onchange = function(){
      var elem = this.value;
      var th = EL.elementToTheme(elem);
      EL.setTheme(th);
      paintShBar();
    };
  }

  var saveBtn = document.getElementById('elSaveProfBtn');
  if(saveBtn){
    saveBtn.onclick = function(){
      var firstName = (document.getElementById('elProfFirstName').value || '').trim() || 'Персонаж';
      var lastName = (document.getElementById('elProfLastName').value || '').trim();
      var element = (document.getElementById('elProfElement').value || 'Земля');
      var level = parseInt(document.getElementById('elProfLevel').value, 10) || 1;
      var hp = parseInt(document.getElementById('elProfHp').value, 10) || 12;
      var ac = parseInt(document.getElementById('elProfAc').value, 10) || 10;
      var note = (document.getElementById('elProfNote').value || '').trim();

      var prof = {
        firstName: firstName,
        lastName: lastName,
        element: element,
        level: level,
        hp: hp,
        ac: ac,
        note: note
      };

      EL.saveProfile(prof);
      EL.setTheme(EL.elementToTheme(element));

      saveBtn.textContent = 'Сохранено ✓';
      setTimeout(function(){ saveBtn.textContent = '✓ Сохранить профиль'; }, 1200);
      paintShBar();
    };
  }

  var saveKeyBtn = document.getElementById('elDataSaveGeminiKey');
  if(saveKeyBtn){
    saveKeyBtn.onclick = function(){
      var key = (document.getElementById('elDataGeminiKey').value || '').trim();
      if(typeof saveGeminiApiKey === 'function'){
        saveGeminiApiKey(key);
      } else {
        try { localStorage.setItem('gemini_api_key', key); } catch(e){}
      }
      saveKeyBtn.textContent = 'Сохранено ✓';
      setTimeout(function(){ saveKeyBtn.textContent = '💾 Сохранить API Ключ'; }, 1200);
    };
  }

  // Storage monitor widget
  if(typeof AppStorage !== 'undefined' && AppStorage.wireWidget){
    AppStorage.wireWidget('el');
  }

  // Экспорт данных Стихии
  var expBtn = document.getElementById('elExportBtn');
  if(expBtn && !expBtn.__wired){
    expBtn.__wired = true;
    expBtn.onclick = function(){
      var data = {
        kind: 'avatar_elements',
        version: 1,
        savedAt: new Date().toISOString(),
        profile: EL.getProfile(),
        theme: localStorage.getItem('el_theme') || 'earth',
        techs: (function(){ try { return JSON.parse(localStorage.getItem('el_techs') || '[]'); } catch(e){ return []; } })(),
        moves: (function(){ try { return JSON.parse(localStorage.getItem('el_moves') || '[]'); } catch(e){ return []; } })(),
        markers: (function(){ try { return JSON.parse(localStorage.getItem('el_user_markers') || '[]'); } catch(e){ return []; } })(),
        warPaths: (function(){ try { return JSON.parse(localStorage.getItem('ttc_el_war_paths') || '[]'); } catch(e){ return []; } })()
      };
      var str = JSON.stringify(data, null, 2);
      var blob = new Blob([str], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      var prof = EL.getProfile();
      var charName = ((prof.firstName || '') + (prof.lastName ? ('_' + prof.lastName) : '')).trim() || 'avatar';
      a.download = 'elements_' + charName.replace(/[^\wа-яА-ЯёЁ\-]/g, '_') + '_' + Date.now() + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 600);
    };
  }

  // Импорт данных Стихии
  var impBtn = document.getElementById('elImportBtn');
  var impFile = document.getElementById('elImportFile');
  if(impBtn && impFile && !impBtn.__wired){
    impBtn.__wired = true;
    impBtn.onclick = function(){ impFile.click(); };
    impFile.onchange = function(){
      var f = impFile.files && impFile.files[0];
      if(!f) return;
      var fr = new FileReader();
      fr.onload = function(){
        try {
          var obj = JSON.parse(fr.result);
          if(!obj || (obj.kind !== 'avatar_elements' && !obj.profile)){
            alert('Ошибка: выбранный файл не содержит распознанных данных Стихии.');
            return;
          }
          if(obj.profile) EL.saveProfile(obj.profile);
          if(obj.theme) EL.setTheme(obj.theme);
          if(Array.isArray(obj.techs)) localStorage.setItem('el_techs', JSON.stringify(obj.techs));
          if(Array.isArray(obj.moves)) localStorage.setItem('el_moves', JSON.stringify(obj.moves));
          if(Array.isArray(obj.markers)) localStorage.setItem('el_user_markers', JSON.stringify(obj.markers));
          if(Array.isArray(obj.warPaths)) localStorage.setItem('ttc_el_war_paths', JSON.stringify(obj.warPaths));
          alert('✓ Данные Стихии успешно импортированы!');
          if(typeof render === 'function') render();
        } catch(err){
          alert('Ошибка чтения файла: ' + (err.message || err));
        }
      };
      fr.readAsText(f);
      impFile.value = '';
    };
  }
}
window.wireElData = wireElData;

// 5. ГЛАВНЫЙ ЭКРАН КОДЕКСА ГАЛАКТИКИ (КАТАЛОГ С ПОИСКОМ)
function meCodex(){
  var searchVal = (typeof ME !== 'undefined' && ME.codexSearch) ? ME.codexSearch.toLowerCase().trim() : '';

  var html = meNavHeader('АРХИВЫ ЦИТАДЕЛИ // БАЗА ЗНАНИЙ', 'СТАТЕЙ В АРХИВЕ: 12') +
    '<h1 style="margin-bottom:6px;">📚 КОДЕКС ГАЛАКТИКИ</h1>' +
    '<div class="subtitle">ТАКТИЧЕСКИЙ АТЛАС МЛЕЧНОГО ПУТИ • БОЕВЫЕ МЕХАНИКИ • РАСЫ • ФРАКЦИИ • ТЕХНОЛОГИИ</div>' +
    
    '<div class="sh-ref-search-wrap" style="margin:16px 0;">' +
      '<span class="sh-ref-search-icon">🔍</span>' +
      '<input type="text" id="meCodexSearchInput" class="sh-ref-search-input me-input" placeholder="Быстрый поиск по Кодексу (щиты, комбо, азари, кроганы, N7, омни-клинок, Нормандия)..." value="' + meEsc(searchVal) + '" style="width:100%;font-size:13px;padding-left:36px;">' +
    '</div>';

  var totalFound = 0;

  ME.codexCategories.forEach(function(sec){
    var filteredItems = sec.items.filter(function(it){
      if(!searchVal) return true;
      var haystack = (it.title + ' ' + it.desc + ' ' + (it.tag || '')).toLowerCase();
      return haystack.indexOf(searchVal) !== -1;
    });

    if(filteredItems.length === 0) return;
    totalFound += filteredItems.length;

    html += '<div class="sh-ref-group-block" style="margin-bottom:20px;">' +
      '<div class="sh-ref-group-title" style="border-left:3px solid ' + sec.color + ';display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:rgba(255,255,255,0.03);margin-bottom:10px;">' +
        '<span style="font-size:14px;font-weight:700;color:#fff;">' + sec.group + '</span>' +
        '<span class="sh-ref-group-count" style="font-size:11px;background:rgba(0,210,255,0.15);color:#00d2ff;padding:2px 8px;border-radius:10px;font-family:monospace;">' + filteredItems.length + '</span>' +
      '</div>' +
      '<div class="menu-list grid-2">' +
        filteredItems.map(function(it){
          return '<div class="menu-item me-card me-codex-item" data-nav="meCodexView:' + it.id + '">' +
            '<div class="me-codex-content">' +
              '<div class="me-codex-title">' +
                '<span>' + it.icon + ' ' + meEsc(it.title) + '</span>' +
                (it.tag ? '<span class="me-tag-holo">' + meEsc(it.tag) + '</span>' : '') +
              '</div>' +
              '<div class="me-codex-desc">' + meEsc(it.desc) + '</div>' +
            '</div>' +
            '<div class="me-codex-arrow">›</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  });

  if(totalFound === 0 && searchVal){
    html += '<div class="char-empty" style="margin-top:24px;text-align:center;color:#7da5c9;padding:30px;background:rgba(0,0,0,0.3);border:1px solid rgba(0,210,255,0.2);border-radius:4px;">По запросу «' + meEsc(searchVal) + '» записей в архиве Совета Цитадели не найдено. Попробуйте другой термин.</div>';
  }

  return html;
}

// 5b. ПРОСМОТР СТАТЬИ КОДЕКСА
function meCodexView(){
  var key = (window.view && window.view.codexKey) ? window.view.codexKey : 'matrix';
  var art = ME.codexArticles[key];
  if(!art) return meCodex();

  return meNavHeader('КОДЕКС ГАЛАКТИКИ // АРХИВЫ ЦИТАДЕЛИ', art.tag || 'АРХИВ') +
    '<div style="margin-bottom:12px;">' +
      '<button class="btn-subtle" data-nav="meCodex" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;font-size:12px;cursor:pointer;">' +
        '← Назад в Кодекс' +
      '</button>' +
    '</div>' +
    '<h1>' + art.icon + ' ' + meEsc(art.title) + '</h1>' +
    '<div class="subtitle">' + meEsc(art.subtitle || art.tag) + '</div>' +
    '<div class="me-panel" style="margin-top:14px;line-height:1.65;font-size:13px;color:#c8e1f5;">' +
      art.contentHtml +
    '</div>' +
    '<div style="margin-top:20px;padding-top:14px;border-top:1px solid rgba(0,210,255,0.15);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">' +
      '<button class="btn-subtle" data-nav="meCodex" style="cursor:pointer;">← Вернуться ко всем статьям Кодекса</button>' +
      '<div style="font-size:11px;color:#7da5c9;">БАЗА ДАННЫХ ЦИТАДЕЛИ • РАЗДЕЛ ' + meEsc(art.tag || 'LORE') + '</div>' +
    '</div>';
}

// 6. ТЕРМИНАЛ КОНТРАКТОВ
// Данные секторов и ретрансляторов Галактики
ME.galaxySectors = [
  {
    "nameRu": "Системы Терминала",
    "nameEn": "Terminus Systems",
    "color": "#ffaa00",
    "borderColor": "#00d2ff",
    "faction": "Независимые миры / Пиратские кланы",
    "species": "Батарианцы, Ворча, Кроганы, Наёмники",
    "threat": "КРАЙНЕ ВЫСОКАЯ (Зона беззакония)",
    "capital": "Станция Омега",
    "relay": "Первичный ретранслятор Омеги",
    "clusters": "Туманность Омега, Разлом Калестон, Системы Терминала, Бездна Пангей",
    "desc": "Огромный регион за пределами юрисдикции Совета Цитадели. Центр криминала, работорговли и независимых корпораций. Регулярные рейды наемников Синих Светил, Кровавой Стаи и Затмения.",
    "id": "terminus",
    "d": "M 739,229 L 708,185 L 665,143 L 674,130 L 624,96 L 632,79 L 588,57 L 541,41 L 494,32 L 453,31 L 453,46 L 459,46 L 455,57 L 448,55 L 448,49 L 369,58 L 327,70 L 321,55 L 275,75 L 238,98 L 197,92 L 146,140 L 118,175 L 90,220 L 72,260 L 82,262 L 110,242 L 133,199 L 163,159 L 170,161 L 194,184 L 161,229 L 136,282 L 188,301 L 232,271 L 312,317 L 338,284 L 359,267 L 403,246 L 447,240 L 449,224 L 478,226 L 482,210 L 529,223 L 556,166 L 588,182 L 618,205 L 652,241 L 671,269 Z",
    "cx": 398,
    "cy": 164
  },
  {
    "nameRu": "Аттический Траверс",
    "nameEn": "Attican Traverse",
    "color": "#a855f7",
    "borderColor": "#00d2ff",
    "faction": "Фронтир / Колонии Альянса / Буфер Совета",
    "species": "Люди, Азари, Батарианцы, Саларианцы",
    "threat": "ПОВЫШЕННАЯ (Пиратские набеги)",
    "capital": "Элизиум (Скиллианский предел)",
    "relay": "Ретранслятор Надежды Чжу",
    "clusters": "Предел Исиды, Туманность Конская Голова, Бетта Аттики, Гамма Аида",
    "desc": "Нестабильная буферная зона между пространством Совета и Системами Терминала. Арена Скиллианского блица. Богата ресурсами нулевого элемента и молодыми колониями Альянса.",
    "id": "attican",
    "d": "M 849,327 L 830,266 L 802,276 L 756,261 L 742,236 L 670,277 L 622,217 L 584,188 L 592,200 L 597,199 L 601,203 L 601,209 L 612,209 L 613,212 L 604,217 L 601,229 L 589,219 L 582,220 L 584,225 L 580,222 L 569,227 L 562,225 L 557,197 L 552,195 L 553,188 L 533,230 L 488,216 L 482,232 L 453,230 L 452,245 L 405,252 L 361,274 L 333,300 L 314,325 L 231,277 L 188,308 L 134,288 L 120,343 L 115,345 L 86,339 L 82,366 L 198,375 L 199,397 L 373,398 L 382,365 L 370,354 L 394,327 L 431,310 L 461,309 L 479,313 L 485,298 L 491,297 L 512,308 L 537,331 L 554,361 L 553,367 L 538,372 L 542,402 L 527,403 L 521,432 L 502,457 L 519,478 L 535,467 L 571,497 L 595,454 L 602,452 L 713,493 L 732,529 L 786,554 L 799,525 L 814,530 L 818,526 L 830,488 L 837,449 L 838,404 L 820,402 L 814,335 Z",
    "cx": 563,
    "cy": 356
  },
  {
    "nameRu": "Пространство Альянса Систем",
    "nameEn": "Earth Alliance Space",
    "color": "#ef4444",
    "borderColor": "#00d2ff",
    "faction": "Альянс Систем (Земля)",
    "species": "Человечество (Люди)",
    "threat": "НИЗКАЯ / ВОЕННЫЙ ПАТРУЛЬ",
    "capital": "Земля / Станция Арктур",
    "relay": "Харон (Солнечная система)",
    "clusters": "Местный Кластер (Солнечная система), Поток Арктура, Скопление Вояджер, Скопление Исход",
    "desc": "Суверенная территория объединенного человечества. Включает колыбель цивилизации Землю, военный штаб Арктур и первые колониальные успехи: Терра Нова и Иден Прайм.",
    "id": "alliance",
    "d": "M 784,559 L 727,533 L 710,498 L 600,459 L 584,491 L 572,505 L 534,475 L 509,494 L 525,527 L 493,541 L 465,546 L 453,560 L 453,593 L 416,610 L 398,607 L 388,644 L 409,650 L 405,675 L 424,702 L 449,677 L 488,675 L 540,663 L 586,642 L 628,612 L 633,613 L 659,644 L 680,626 L 713,659 L 756,607 Z",
    "cx": 586,
    "cy": 579
  },
  {
    "nameRu": "Внутреннее Пространство Совета",
    "nameEn": "Inner Council Space",
    "color": "#22c55e",
    "borderColor": "#00d2ff",
    "faction": "Совет Цитадели (Республики Азари / Саларианский Союз)",
    "species": "Азари, Саларианцы, Дреллы, Волусы",
    "threat": "МИНИМАЛЬНАЯ (Флот Цитадели)",
    "capital": "Станция Цитадель",
    "relay": "Ретрансляторы Цитадели (Туманность Змея)",
    "clusters": "Туманность Змея (Цитадель), Туманность Афина (Тессия), Внутренний Сур'Кеш, Колыбель Сигурда",
    "desc": "Сердце галактической цивилизации и верховной власти. Высочайший уровень жизни, дипломатический центр галактики и штаб СБ Цитадели (C-Sec).",
    "id": "inner_council",
    "d": "M 208,608 L 213,638 L 236,659 L 216,686 L 251,712 L 294,735 L 319,768 L 314,784 L 389,803 L 427,807 L 483,806 L 480,774 L 447,774 L 447,738 L 506,731 L 496,679 L 452,683 L 425,710 L 419,711 L 420,707 L 399,677 L 403,653 L 382,648 L 392,606 L 371,598 L 364,602 L 365,596 L 361,594 L 356,602 L 359,614 L 351,615 L 353,607 L 349,605 L 349,599 L 338,603 L 339,607 L 335,609 L 334,604 L 302,582 L 269,583 L 255,569 Z",
    "cx": 347,
    "cy": 693
  },
  {
    "nameRu": "Внешнее Пространство Совета",
    "nameEn": "Outer Council Space",
    "color": "#0ea5e9",
    "borderColor": "#00d2ff",
    "faction": "Турианская Иерархия / Демилитаризованная Зона",
    "species": "Турианцы, Кроганы, Батарианцы",
    "threat": "УМЕРЕННАЯ (Патрули миротворцев)",
    "capital": "Палавен (Апийский крест)",
    "relay": "Ретранслятор Палавена",
    "clusters": "Апийский Крест (Палавен), ДМЗ Кроганов (Тучанка), Граница Иерархии, Пространство Ару",
    "desc": "Милитаризованное пространство Турианской Иерархии и контролируемые территории Кроганов. Мощнейший космический флот поддержания галактического порядка.",
    "id": "outer_council",
    "d": "M 82,372 L 81,424 L 82,430 L 87,428 L 87,433 L 81,436 L 68,470 L 50,475 L 52,485 L 59,485 L 53,491 L 67,537 L 118,519 L 142,572 L 159,567 L 176,593 L 176,597 L 164,605 L 182,626 L 171,642 L 211,680 L 228,660 L 208,642 L 201,606 L 224,582 L 234,578 L 291,529 L 291,522 L 297,521 L 292,514 L 271,504 L 269,496 L 273,493 L 267,491 L 266,480 L 264,486 L 260,484 L 261,476 L 267,475 L 266,470 L 256,476 L 254,469 L 258,466 L 258,459 L 254,468 L 253,453 L 243,454 L 249,440 L 246,435 L 250,429 L 257,431 L 255,425 L 259,420 L 254,419 L 249,428 L 238,428 L 241,414 L 237,411 L 227,415 L 223,407 L 221,412 L 225,418 L 222,419 L 215,413 L 218,409 L 209,410 L 211,404 L 195,404 L 194,382 L 134,377 L 134,389 L 127,392 L 123,390 L 122,375 Z",
    "cx": 170,
    "cy": 492
  },
  {
    "nameRu": "Галактическое Ядро",
    "nameEn": "Galactic Core",
    "color": "#f97316",
    "borderColor": "#00d2ff",
    "faction": "Коллекционеры / Жнецы / Неизведанно",
    "species": "Синтетики, Коллекционеры",
    "threat": "СМЕРТЕЛЬНАЯ (Нестабильные гравитационные поля)",
    "capital": "База Коллекционеров",
    "relay": "Ретранслятор Омега-4",
    "clusters": "Сверхмассивная Черная Дыра, Центр Галактики, Радиоактивные скопления",
    "desc": "Сверхплотное звездное ядро Млечного Пути. Экстремальная гравитация, радиация и единственная точка входа — зашифрованный ретранслятор Омега-4, из которого никто не возвращался живым.",
    "id": "core",
    "d": "M 490,303 L 482,320 L 450,314 L 416,321 L 393,336 L 377,355 L 389,362 L 379,393 L 380,416 L 367,434 L 353,441 L 371,470 L 407,496 L 412,497 L 423,467 L 457,471 L 491,458 L 512,435 L 520,414 L 521,398 L 536,396 L 535,385 L 531,386 L 533,376 L 527,367 L 548,362 L 526,328 Z",
    "cx": 449,
    "cy": 395
  },
  {
    "nameRu": "Внутренние Рукава / Магистраль",
    "nameEn": "Inner Relay Corridor",
    "color": "#6366f1",
    "borderColor": "#00d2ff",
    "faction": "Смешанная юрисдикция торговых путей",
    "species": "Все виды Совета",
    "threat": "НИЗКАЯ / КОММЕРЧЕСКИЙ ТРАФИК",
    "capital": "Узлы ретрансляторов 1-го порядка",
    "relay": "Магистральные Ретрансляторы Массы",
    "clusters": "Торговый коридор, Промежуточные системы нулевого элемента",
    "desc": "Магистральный коридор сверхсветовых перелетов, соединяющий Внутреннее пространство Совета с секторами Альянса и внешними рубежами.",
    "id": "transit",
    "d": "M 279,404 L 283,436 L 298,480 L 296,484 L 293,482 L 289,497 L 307,521 L 307,526 L 295,537 L 301,543 L 304,541 L 308,550 L 312,548 L 313,540 L 325,544 L 317,551 L 322,552 L 325,558 L 330,554 L 336,560 L 336,564 L 329,568 L 342,579 L 347,579 L 349,584 L 345,591 L 364,588 L 393,600 L 415,604 L 447,589 L 447,561 L 421,559 L 423,539 L 437,540 L 447,528 L 463,526 L 465,540 L 518,523 L 509,509 L 505,510 L 507,505 L 502,504 L 501,492 L 514,482 L 497,461 L 471,475 L 440,477 L 427,474 L 415,505 L 380,487 L 364,472 L 345,439 L 347,434 L 365,427 L 374,414 L 373,404 L 323,404 L 315,408 L 316,414 L 313,412 L 305,416 L 301,412 L 302,420 L 307,421 L 306,427 L 313,426 L 307,430 L 316,444 L 321,444 L 319,448 L 329,456 L 329,462 L 334,463 L 332,468 L 337,472 L 330,480 L 325,475 L 316,477 L 314,471 L 322,469 L 323,472 L 325,465 L 321,467 L 311,458 L 312,465 L 308,466 L 307,457 L 295,443 L 296,440 L 302,443 L 299,436 L 302,429 L 299,425 L 296,429 L 288,428 L 293,413 L 291,409 L 298,404 Z",
    "cx": 384,
    "cy": 510
  }
];
ME.relays = [
  {
    "id": "citadel",
    "sector": "inner_council",
    "name": "Цитадель // Туманность Змея",
    "type": "primary",
    "icon": "🏛️",
    "x": 346,
    "y": 559,
    "lore": "Стратегически важный узел в секторе inner_council."
  },
  {
    "id": "earth",
    "sector": "alliance",
    "name": "Земля // Местный Кластер",
    "type": "primary",
    "icon": "🌍",
    "x": 545,
    "y": 675,
    "lore": "Стратегически важный узел в секторе alliance."
  },
  {
    "id": "arcturus",
    "sector": "alliance",
    "name": "Станция Арктур // Поток Арктура",
    "type": "primary",
    "icon": "🛡️",
    "x": 565,
    "y": 611,
    "lore": "Стратегически важный узел в секторе alliance."
  },
  {
    "id": "eden_prime",
    "sector": "alliance",
    "name": "Иден Прайм // Скопление Исход",
    "type": "secondary",
    "icon": "🌴",
    "x": 479,
    "y": 750,
    "lore": "Стратегически важный узел в секторе alliance."
  },
  {
    "id": "tuchanka",
    "sector": "outer_council",
    "name": "Тучанка // Кроганская ДМЗ",
    "type": "primary",
    "icon": "☢️",
    "x": 193,
    "y": 366,
    "lore": "Стратегически важный узел в секторе outer_council."
  },
  {
    "id": "palaven",
    "sector": "outer_council",
    "name": "Палавен // Апийский крест",
    "type": "primary",
    "icon": "🦅",
    "x": 250,
    "y": 429,
    "lore": "Стратегически важный узел в секторе outer_council."
  },
  {
    "id": "rannoch",
    "sector": "geth",
    "name": "Раннох // Вуаль Персея",
    "type": "primary",
    "icon": "🤖",
    "x": 343,
    "y": 120,
    "lore": "Стратегически важный узел в секторе geth."
  },
  {
    "id": "omega",
    "sector": "terminus",
    "name": "Омега // Туманность Омега",
    "type": "relay_core",
    "icon": "💀",
    "x": 641,
    "y": 251,
    "lore": "Стратегически важный узел в секторе terminus."
  },
  {
    "id": "illium",
    "sector": "terminus",
    "name": "Иллиум // Туманность Полумесяц",
    "type": "secondary",
    "icon": "💎",
    "x": 562,
    "y": 101,
    "lore": "Стратегически важный узел в секторе terminus."
  },
  {
    "id": "thessia",
    "sector": "inner_council",
    "name": "Тессия // Туманность Афина",
    "type": "primary",
    "icon": "🔮",
    "x": 281,
    "y": 553,
    "lore": "Стратегически важный узел в секторе inner_council."
  },
  {
    "id": "surkesh",
    "sector": "inner_council",
    "name": "Сур'Кеш // Бассейн Аннос",
    "type": "primary",
    "icon": "🐸",
    "x": 378,
    "y": 609,
    "lore": "Стратегически важный узел в секторе inner_council."
  },
  {
    "id": "noveria",
    "sector": "traverse",
    "name": "Новерия // Конская Голова",
    "type": "secondary",
    "icon": "❄️",
    "x": 738,
    "y": 437,
    "lore": "Стратегически важный узел в секторе traverse."
  },
  {
    "id": "feros",
    "sector": "traverse",
    "name": "Ферос // Тета Эксода",
    "type": "secondary",
    "icon": "🏢",
    "x": 694,
    "y": 526,
    "lore": "Стратегически важный узел в секторе traverse."
  },
  {
    "id": "virmire",
    "sector": "traverse",
    "name": "Вермайр // Скопление Хокинг",
    "type": "secondary",
    "icon": "🌊",
    "x": 797,
    "y": 505,
    "lore": "Стратегически важный узел в секторе traverse."
  },
  {
    "id": "kharshan",
    "sector": "terminus",
    "name": "Кхар'шан // Батарианская Гегемония",
    "type": "primary",
    "icon": "👁️",
    "x": 741,
    "y": 305,
    "lore": "Стратегически важный узел в секторе terminus."
  },
  {
    "id": "horizon",
    "sector": "terminus",
    "name": "Горизонт // Икар",
    "type": "secondary",
    "icon": "🌅",
    "x": 687,
    "y": 128,
    "lore": "Стратегически важный узел в секторе terminus."
  },
  {
    "id": "omega4",
    "sector": "core",
    "name": "Омега-4 // Галактическое Ядро",
    "type": "relay_core",
    "icon": "⚠️",
    "x": 511,
    "y": 360,
    "lore": "Стратегически важный узел в секторе core."
  },
  {
    "id": "hades_gamma",
    "sector": "alliance",
    "name": "Гамма Аида",
    "type": "secondary",
    "icon": "✨",
    "x": 655,
    "y": 657,
    "lore": "Стратегически важный узел в секторе alliance."
  },
  {
    "id": "artemis_tau",
    "sector": "traverse",
    "name": "Артемида Тау",
    "type": "secondary",
    "icon": "✨",
    "x": 706,
    "y": 366,
    "lore": "Стратегически важный узел в секторе traverse."
  },
  {
    "id": "kepler_verge",
    "sector": "traverse",
    "name": "Предел Кеплера",
    "type": "secondary",
    "icon": "✨",
    "x": 728,
    "y": 607,
    "lore": "Стратегически важный узел в секторе traverse."
  },
  {
    "id": "sigurd",
    "sector": "inner_council",
    "name": "Колыбель Сигурда",
    "type": "secondary",
    "icon": "✨",
    "x": 314,
    "y": 475,
    "lore": "Стратегически важный узел в секторе inner_council."
  },
  {
    "id": "rosetta",
    "sector": "outer_council",
    "name": "Туманность Розетта",
    "type": "secondary",
    "icon": "✨",
    "x": 172,
    "y": 251,
    "lore": "Стратегически важный узел в секторе outer_council."
  }
];
ME.mapState = {
  zoom: 1.0,
  cx: 450,
  cy: 412.5,
  activeSectorId: 'alliance'
};

function meRenderSidebarContent(s){
  if(!s) return '<div style="color:#7da5c9;">Выберите сектор на карте для вывода тактической информации.</div>';
  var threatClass = s.threat.indexOf('СМЕРТЕЛЬНАЯ') >= 0 ? '#ff5555' : (s.threat.indexOf('ВЫСОКАЯ') >= 0 ? '#ffaa33' : (s.threat.indexOf('УМЕРЕННАЯ') >= 0 ? '#ffd700' : '#22c55e'));
  var clustersArr = s.clusters.split(',').map(function(c){ return c.trim(); });
  
  return '<div class="me-sidebar-header">' +
    '<div class="me-sidebar-title">' + meEsc(s.nameRu) + '</div>' +
    '<div class="me-sidebar-subtitle">' + meEsc(s.nameEn) + '</div>' +
  '</div>' +
  '<div style="margin:8px 0;">' +
    '<span style="background:rgba(255,255,255,0.06);border:1px solid ' + threatClass + ';color:' + threatClass + ';font-size:11px;padding:2px 8px;border-radius:2px;font-family:monospace;font-weight:bold;">' +
      'УГРОЗА: ' + meEsc(s.threat) +
    '</span>' +
  '</div>' +
  '<div class="me-sidebar-prop"><strong>Контролирующая фракция:</strong><br>' + meEsc(s.faction) + '</div>' +
  '<div class="me-sidebar-prop"><strong>Доминирующие виды:</strong><br>' + meEsc(s.species) + '</div>' +
  '<div class="me-sidebar-prop"><strong>Главный узел / Столица:</strong><br>' + meEsc(s.capital) + '</div>' +
  '<div class="me-sidebar-prop"><strong>Первичный ретранслятор:</strong><br><span style="color:#00d2ff;">' + meEsc(s.relay) + '</span></div>' +
  '<div class="me-sidebar-prop">' +
    '<strong>Звёздные скопления:</strong>' +
    '<div class="me-clusters-badge-list">' + clustersArr.map(function(cl){
      return '<span class="me-cluster-badge">' + meEsc(cl) + '</span>';
    }).join('') + '</div>' +
  '</div>' +
  '<div class="rule" style="margin:10px 0;"></div>' +
  '<div style="font-size:12.5px;color:#8bb1d6;line-height:1.55;">' + meEsc(s.desc) + '</div>' +
  '<div style="margin-top:14px;">' +
    '<button class="btn-primary" id="mePlotCourseBtn" data-sector-id="' + s.id + '" style="width:100%;padding:7px;font-size:12px;">' +
      '🎯 Проложить курс в сектор (Контракт)' +
    '</button>' +
  '</div>';
}

function meMap(){
  var activeId = ME.mapState.activeSectorId || 'alliance';
  var activeSector = ME.galaxySectors.find(function(s){ return s.id === activeId; }) || ME.galaxySectors[0];

  var filterChips = [
    { id: 'all', label: '🌌 Вся Галактика' },
    { id: 'alliance', label: '🎖️ Альянс' },
    { id: 'inner_council', label: '🏛️ Совет (Ядро)' },
    { id: 'outer_council', label: '🦅 Иерархия / ДМЗ' },
    { id: 'terminus', label: '💀 Терминус' },
    { id: 'attican', label: '🌾 Траверс' },
    { id: 'core', label: '⚡ Ядро / Омега-4' }
  ];

  var filtersHtml = '<div class="me-map-filters">' + filterChips.map(function(fc){
    var on = activeId === fc.id ? 'on' : '';
    return '<button class="me-filter-btn ' + on + '" data-map-filter="' + fc.id + '">' + fc.label + '</button>';
  }).join('') + '</div>';

  var controlsHtml = '<div class="me-map-zoom-controls">' +
    '<button class="me-zoom-btn" id="meZoomInBtn" title="Приблизить">+</button>' +
    '<button class="me-zoom-btn" id="meZoomOutBtn" title="Отдалить">−</button>' +
    '<button class="me-zoom-btn" id="meZoomResetBtn" title="Сброс вида" style="font-size:12px;">⛶</button>' +
  '</div>';

  // SVG Layers
  var sectorsSvgHtml = ME.galaxySectors.map(function(s){
    var isSel = s.id === activeId ? 'selected' : '';
    return '<path class="me-sector-path ' + isSel + '" id="sector-' + s.id + '" data-sector-id="' + s.id + '" d="' + s.d + '" fill="' + s.color + '"></path>';
  }).join('');

  var relaysSvgHtml = ME.relays.map(function(r){
    var col = r.type === 'relay_core' ? '#ff3333' : (r.type === 'primary' ? '#00d2ff' : '#ffd700');
    return '<g class="me-relay-marker" data-relay-id="' + r.id + '" transform="translate(' + r.x + ',' + r.y + ')">' +
      '<circle cx="0" cy="0" r="14" fill="transparent" stroke="none" style="cursor:pointer;"></circle>' +
      '<circle class="pulse" cx="0" cy="0" r="5" fill="none" stroke="' + col + '" stroke-width="1.5" pointer-events="none"></circle>' +
      '<polygon points="0,-6 6,0 0,6 -6,0" fill="' + col + '" stroke="#fff" stroke-width="0.8" pointer-events="none"></polygon>' +
      '<text x="8" y="4" pointer-events="none">' + meEsc(r.name.split('//')[0].trim()) + '</text>' +
    '</g>';
  }).join('');

  var polarGridHtml = '<g opacity="0.25" stroke="#00d2ff" stroke-width="1" stroke-dasharray="4 4" fill="none">' +
    '<circle cx="450" cy="412.5" r="100"></circle>' +
    '<circle cx="450" cy="412.5" r="200"></circle>' +
    '<circle cx="450" cy="412.5" r="300"></circle>' +
    '<circle cx="450" cy="412.5" r="400"></circle>' +
    '<line x1="50" y1="412.5" x2="850" y2="412.5"></line>' +
    '<line x1="450" y1="12.5" x2="450" y2="812.5"></line>' +
  '</g>';

  return meNavHeader('ГАЛАКТИЧЕСКАЯ КАРТА // СЕНСОРЫ IES', 'КАРТА РЕТРАНСЛЯТОРОВ') +
    '<h1>ГАЛАКТИЧЕСКАЯ КАРТА</h1>' +
    '<div class="subtitle">СЕТЬ РЕТРАНСЛЯТОРОВ МАССЫ • СЕКТОРА ВЛИЯНИЯ • ТАКТИЧЕСКИЙ АТЛАС МЛЕЧНОГО ПУТИ</div>' +
    '<div class="me-map-container">' +
      '<div class="me-map-toolbar">' +
        filtersHtml +
        controlsHtml +
      '</div>' +
      '<div class="me-map-layout">' +
        '<div class="me-map-viewport" id="meGalaxyViewportBox">' +
          '<div class="me-map-hud-overlay">' +
            '<span class="me-map-hud-badge">IES STEALTH: NOMINAL</span>' +
            '<span class="me-map-hud-badge" style="color:#ffaa33;border-color:rgba(255,170,51,0.3);">MASS RELAYS: ONLINE</span>' +
          '</div>' +
          '<svg id="meGalaxySvg" class="me-galaxy-svg" viewBox="0 0 900 825">' +
            '<defs>' +
              '<filter id="meSectorGlow" x="-20%" y="-20%" width="140%" height="140%">' +
                '<feGaussianBlur stdDeviation="4" result="blur"></feGaussianBlur>' +
                '<feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>' +
              '</filter>' +
            '</defs>' +
            '<g id="meGalaxyStage">' +
              '<image href="mass_effect_galaxy_map.jpg" x="0" y="0" width="900" height="825" preserveAspectRatio="xMidYMid meet"></image>' +
              polarGridHtml +
              '<g id="meSectorsGroup">' + sectorsSvgHtml + '</g>' +
              '<g id="meRelaysGroup">' + relaysSvgHtml + '</g>' +
            '</g>' +
          '</svg>' +
        '</div>' +
        '<div class="me-map-sidebar" id="meMapSidebar">' +
          meRenderSidebarContent(activeSector) +
        '</div>' +
      '</div>' +
    '</div>';
}

function wireMeMap(){
  var vp = document.getElementById('meGalaxyViewportBox');
  var svg = document.getElementById('meGalaxySvg');
  var sidebar = document.getElementById('meMapSidebar');
  if(!vp || !svg) return;

  var state = ME.mapState;

  function updateViewBox(){
    var z = Math.min(4.0, Math.max(1.0, state.zoom));
    var vbW = 900 / z;
    var vbH = 825 / z;
    var minX = state.cx - vbW / 2;
    var minY = state.cy - vbH / 2;
    minX = Math.max(-50, Math.min(950 - vbW, minX));
    minY = Math.max(-50, Math.min(875 - vbH, minY));
    svg.setAttribute('viewBox', minX.toFixed(2) + ' ' + minY.toFixed(2) + ' ' + vbW.toFixed(2) + ' ' + vbH.toFixed(2));
  }
  updateViewBox();

  // Dragging
  var isDragging = false;
  var startX = 0, startY = 0;
  var startCx = 450, startCy = 412.5;

  vp.onmousedown = function(e){
    if(e.button !== 0 && e.button !== 1) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startCx = state.cx;
    startCy = state.cy;
    vp.classList.add('grabbing');
  };

  window.addEventListener('mousemove', function(e){
    if(!isDragging) return;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    var rect = vp.getBoundingClientRect();
    var vw = rect.width || 800;
    var vh = rect.height || 540;
    var scaleX = (900 / state.zoom) / vw;
    var scaleY = (825 / state.zoom) / vh;
    state.cx = startCx - dx * scaleX;
    state.cy = startCy - dy * scaleY;
    updateViewBox();
  });

  window.addEventListener('mouseup', function(){
    if(isDragging){
      isDragging = false;
      vp.classList.remove('grabbing');
    }
  });

  // Wheel zoom centered at cursor
  vp.onwheel = function(e){
    e.preventDefault();
    var rect = vp.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;
    var vw = rect.width || 800;
    var vh = rect.height || 540;

    var curW = 900 / state.zoom;
    var curH = 825 / state.zoom;
    var curMinX = state.cx - curW / 2;
    var curMinY = state.cy - curH / 2;

    var worldX = curMinX + (mouseX / vw) * curW;
    var worldY = curMinY + (mouseY / vh) * curH;

    var factor = e.deltaY < 0 ? 1.25 : 0.8;
    var newZoom = Math.min(4.0, Math.max(1.0, state.zoom * factor));
    if(newZoom === state.zoom) return;

    state.zoom = newZoom;
    state.cx = worldX - (mouseX / vw - 0.5) * (900 / newZoom);
    state.cy = worldY - (mouseY / vh - 0.5) * (825 / newZoom);
    updateViewBox();
  };

  // Zoom buttons
  var zoomIn = document.getElementById('meZoomInBtn');
  if(zoomIn) zoomIn.onclick = function(){
    state.zoom = Math.min(4.0, state.zoom * 1.3);
    updateViewBox();
  };
  var zoomOut = document.getElementById('meZoomOutBtn');
  if(zoomOut) zoomOut.onclick = function(){
    state.zoom = Math.max(1.0, state.zoom / 1.3);
    if(state.zoom <= 1.05){ state.cx = 450; state.cy = 412.5; }
    updateViewBox();
  };
  var zoomReset = document.getElementById('meZoomResetBtn');
  if(zoomReset) zoomReset.onclick = function(){
    state.zoom = 1.0;
    state.cx = 450;
    state.cy = 412.5;
    updateViewBox();
  };

  // Sector selection and hover
  function selectSector(sId, panTo){
    state.activeSectorId = sId;
    var sec = ME.galaxySectors.find(function(s){ return s.id === sId; });
    if(!sec) return;

    document.querySelectorAll('.me-sector-path').forEach(function(p){
      p.classList.toggle('selected', p.getAttribute('data-sector-id') === sId);
    });

    document.querySelectorAll('.me-filter-btn').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-map-filter') === sId);
    });

    if(sidebar) sidebar.innerHTML = meRenderSidebarContent(sec);

    if(panTo && sec.cx && sec.cy){
      state.cx = sec.cx;
      state.cy = sec.cy;
      state.zoom = Math.max(1.6, state.zoom);
      updateViewBox();
    }
    
    // Bind plot course button
    var plotBtn = document.getElementById('mePlotCourseBtn');
    if(plotBtn){
      plotBtn.onclick = function(){
        if(sec.id === 'alliance') ME._activeMissionClient = 'Альянс Систем';
        else if(sec.id === 'inner_council') ME._activeMissionClient = 'СБ Цитадели (C-Sec)';
        else if(sec.id === 'outer_council') ME._activeMissionClient = 'STG (ГОР саларианцев)';
        else if(sec.id === 'terminus') ME._activeMissionClient = 'Ария Т\'Лоак (Омега)';
        else ME._activeMissionClient = 'all';

        if(typeof ME.generateMission === 'function'){
          var m = ME.generateMission();
          m.location = sec.nameRu + ' // ' + (sec.clusters.split(',')[0] || 'Фронтир');
          if(!ME._missionsList) ME._missionsList = [];
          ME._missionsList.unshift(m);

          var modalBody = '<div style="font-size:13px;line-height:1.6;color:#c8e1f5;">' +
            '<div style="margin-bottom:10px;"><strong style="color:#00d2ff;">ЗАКАЗЧИК:</strong> ' + meEsc(m.client) + '</div>' +
            '<div style="margin-bottom:10px;"><strong style="color:#00d2ff;">ЛОКАЦИЯ:</strong> ' + meEsc(m.location) + '</div>' +
            '<div style="margin-bottom:10px;"><strong style="color:#ffaa33;">ОПИСАНИЕ ОПЕРАЦИИ:</strong><br>' + meEsc(m.title) + '</div>' +
            '<div style="margin-bottom:10px;"><strong style="color:#ff5555;">ПРОТИВНИК:</strong> ' + meEsc(m.enemy) + ' (' + meEsc(m.difficulty) + ')</div>' +
            '<div style="margin-bottom:10px;"><strong style="color:#22c55e;">НАГРАДА:</strong> ' + meEsc(m.reward) + '</div>' +
            '<div style="font-size:11px;color:#7da5c9;margin-top:10px;">Контракт добавлен в тактический журнал миссий сектора.</div>' +
            '</div>';
          meShowModal('ТАКТИЧЕСКИЙ КОНТРАКТ // ' + m.type, 'СЕКТОР: ' + sec.nameRu, modalBody);
        }
      };
    }
  }

  // Sector paths
  document.querySelectorAll('.me-sector-path').forEach(function(p){
    p.onclick = function(e){
      e.stopPropagation();
      var id = p.getAttribute('data-sector-id');
      selectSector(id, false);
    };
    p.onmouseenter = function(){
      var id = p.getAttribute('data-sector-id');
      var sec = ME.galaxySectors.find(function(s){ return s.id === id; });
      if(sec && sidebar && !state.activeSectorId) sidebar.innerHTML = meRenderSidebarContent(sec);
    };
  });

  // Filter buttons
  document.querySelectorAll('.me-filter-btn').forEach(function(b){
    b.onclick = function(){
      var f = b.getAttribute('data-map-filter');
      if(f === 'all'){
        state.activeSectorId = null;
        state.zoom = 1.0;
        state.cx = 450;
        state.cy = 412.5;
        updateViewBox();
        document.querySelectorAll('.me-sector-path').forEach(function(p){ p.classList.remove('selected'); });
        document.querySelectorAll('.me-filter-btn').forEach(function(btn){ btn.classList.toggle('on', btn === b); });
        if(sidebar) sidebar.innerHTML = '<div class="me-sidebar-header"><div class="me-sidebar-title">ГАЛАКТИКА МЛЕЧНЫЙ ПУТЬ</div><div class="me-sidebar-subtitle">ОБЗОР СЕКТОРОВ И РЕТРАНСЛЯТОРОВ</div></div><p style="color:#8bb1d6;font-size:13px;line-height:1.5;">Наведите курсор или выберите сектор на карте для детального тактического анализа, оценки угрозы и доступа к оперативным миссиям.</p>';
      } else {
        selectSector(f, true);
      }
    };
  });

  // Relay markers click
  document.querySelectorAll('.me-relay-marker').forEach(function(rm){
    rm.onclick = function(e){
      e.stopPropagation();
      var rId = rm.getAttribute('data-relay-id');
      var r = ME.relays.find(function(item){ return item.id === rId; });
      if(!r) return;
      
      var sec = ME.galaxySectors.find(function(s){ return s.id === r.sector; });
      if(sec) selectSector(sec.id, false);

      if(typeof meShowNotice === 'function'){
        var overlay = document.createElement('div');
        overlay.className = 'me-modal-overlay';
        overlay.innerHTML = '<div class="me-modal-box">' +
          '<div class="me-modal-header"><span class="me-tag-holo">[РЕТРАНСЛЯТОР МАССЫ]</span><span style="color:#00d2ff;font-family:monospace;font-size:11px;">КАНАЛ: АКТИВЕН</span></div>' +
          '<h3 style="margin:10px 0 6px;color:#00d2ff;font-family:monospace;">' + r.icon + ' ' + meEsc(r.name) + '</h3>' +
          '<p style="color:#8bb1d6;font-size:13px;line-height:1.55;margin-bottom:16px;">' + meEsc(r.lore) + '</p>' +
          '<div style="text-align:right;"><button class="btn-primary" id="meCloseRelayModal" style="padding:5px 16px;">Закрыть</button></div>' +
        '</div>';
        document.body.appendChild(overlay);
        document.getElementById('meCloseRelayModal').onclick = function(){ overlay.remove(); };
        overlay.onclick = function(ev){ if(ev.target === overlay) overlay.remove(); };
      }
    };
  });

  // Initial plot course button bind
  var initPlotBtn = document.getElementById('mePlotCourseBtn');
  if(initPlotBtn){
    initPlotBtn.onclick = function(){
      var sId = initPlotBtn.getAttribute('data-sector-id');
      var sec = ME.galaxySectors.find(function(s){ return s.id === sId; }) || ME.galaxySectors[0];
      if(sec.id === 'alliance') ME._activeMissionClient = 'Альянс Систем';
      else if(sec.id === 'inner_council') ME._activeMissionClient = 'СБ Цитадели (C-Sec)';
      else if(sec.id === 'outer_council') ME._activeMissionClient = 'STG (ГОР саларианцев)';
      else if(sec.id === 'terminus') ME._activeMissionClient = 'Ария Т\'Лоак (Омега)';
      else ME._activeMissionClient = 'all';

      if(typeof ME.generateMission === 'function'){
        var m = ME.generateMission();
        m.location = sec.nameRu + ' // ' + (sec.clusters.split(',')[0] || 'Фронтир');
        if(!ME._missionsList) ME._missionsList = [];
        ME._missionsList.unshift(m);

        var modalBody = '<div style="font-size:13px;line-height:1.6;color:#c8e1f5;">' +
          '<div style="margin-bottom:10px;"><strong style="color:#00d2ff;">ЗАКАЗЧИК:</strong> ' + meEsc(m.client) + '</div>' +
          '<div style="margin-bottom:10px;"><strong style="color:#00d2ff;">ЛОКАЦИЯ:</strong> ' + meEsc(m.location) + '</div>' +
          '<div style="margin-bottom:10px;"><strong style="color:#ffaa33;">ОПИСАНИЕ ОПЕРАЦИИ:</strong><br>' + meEsc(m.title) + '</div>' +
          '<div style="margin-bottom:10px;"><strong style="color:#ff5555;">ПРОТИВНИК:</strong> ' + meEsc(m.enemy) + ' (' + meEsc(m.difficulty) + ')</div>' +
          '<div style="margin-bottom:10px;"><strong style="color:#22c55e;">НАГРАДА:</strong> ' + meEsc(m.reward) + '</div>' +
          '<div style="font-size:11px;color:#7da5c9;margin-top:10px;">Контракт добавлен в тактический журнал миссий сектора.</div>' +
          '</div>';
        meShowModal('ТАКТИЧЕСКИЙ КОНТРАКТ // ' + m.type, 'СЕКТОР: ' + sec.nameRu, modalBody);
      }
    };
  }
}

// 8. ДАННЫЕ СИСТЕМ
function meData(){
  var c = ME.getChar();
  var profList = (typeof ME.getProfiles === 'function') ? ME.getProfiles() : [];
  var actId = ME.activeProfileId || (c && c.id);

  var profOptions = profList.map(function(p){
    var pTitle = (p.name || 'Оперативник') + (p.callsign ? ' [' + p.callsign + ']' : '') + ' • ' + (p.role || 'Солдат') + ' (Ур. ' + (p.level || 1) + ')';
    return '<option value="' + escA(p.id) + '" ' + (p.id === actId ? 'selected' : '') + '>' + esc(pTitle) + '</option>';
  }).join('');

  var races = ['Человек', 'Турианец', 'Азари', 'Салариан', 'Кроган', 'Квариан', 'Дрелл', 'Батарианец', 'Ворча'];
  var raceOpts = races.map(function(r){
    return '<option value="' + escA(r) + '" ' + (c.race === r ? 'selected' : '') + '>' + esc(r) + '</option>';
  }).join('');
  if(races.indexOf(c.race) === -1 && c.race){
    raceOpts = '<option value="' + escA(c.race) + '" selected>' + esc(c.race) + '</option>' + raceOpts;
  }

  var curTheme = (typeof getMeTheme === 'function') ? getMeTheme() : 'citadel';
  var themeOpts = [
    { id: 'citadel', name: '🔹 Цитадель (Альянс Систем / Неоновый циан)' },
    { id: 'omni', name: '🔸 Инструментрон (Omni-Tool / Теплый янтарь)' },
    { id: 'n7', name: '🔴 N7 Спецназ (Матовый карбон / Алый акцент)' },
    { id: 'cerberus', name: '🟡 Цербер (Обсидиан / Белое золото)' }
  ].map(function(th){
    return '<option value="' + th.id + '" ' + (curTheme === th.id ? 'selected' : '') + '>' + th.name + '</option>';
  }).join('');

  var isCollapsed = false;
  try { isCollapsed = (localStorage.getItem('me_dossier_collapsed') === '1'); } catch(e){}

  var activeCharDisplay = (c.name || 'Оперативник Альянса') + (c.callsign ? (' [' + c.callsign + ']') : '');

  return meNavHeader('ДАННЫЕ // ДОСЬЕ И РОСТЕР', 'КОНФИГУРАЦИЯ') +
    '<button class="back" data-go="meHome">← Назад</button>' +
    '<h1>ДАННЫЕ</h1>' +
    '<div class="subtitle">Управление ростером оперативников, темами оформления, облачной синхронизацией и ИИ</div>' +

    // 1. РОСТЕР И ВЫБОР ОПЕРАТИВНИКОВ
    '<div class="me-panel" style="margin-top:14px;">' +
      '<div class="section-label" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
        '<span>👥 ВЫБОР И УПРАВЛЕНИЕ ОПЕРАТИВНИКАМИ</span>' +
        '<span style="font-size:11px;color:var(--ink-dim);font-weight:normal;">Всего в отряде: ' + profList.length + '</span>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--ink-dim);margin:6px 0 10px;">' +
        'Выберите активного оперативника для боевых миссий или зарегистрируйте нового в терминале Альянса. Способности, боевые щиты и арсенал оружия изолированы и сохраняются индивидуально для каждого бойца.' +
      '</div>' +

      '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin:14px 0 12px 0;">' +
        '<div style="flex:1;min-width:240px;">' +
          '<label style="display:block;font-size:12px;color:var(--ink-dim);margin-bottom:4px;font-weight:600;">Активный оперативник (переключение на лету):</label>' +
          '<select id="meDataProfileSelect" class="me-input" style="width:100%;font-size:13px;padding:9px 12px;">' +
            profOptions +
          '</select>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button class="btn-primary" id="meDataNewProfileBtn" title="Зарегистрировать нового оперативника">➕ Новый оперативник</button>' +
          '<button class="btn-subtle" id="meDataCloneProfileBtn" title="Клонировать активного оперативника со способностями и оружием">📋 Дублировать</button>' +
        '</div>' +
      '</div>' +

      // АНКЕТА ОПЕРАТИВНИКА (СВОРАЧИВАЕМАЯ)
      '<div class="me-operative-card" style="background:rgba(4,9,20,0.7);border:1px solid rgba(0,210,255,0.25);border-radius:4px;padding:14px 16px;margin-top:14px;transition:all .2s ease;">' +
        '<div id="meOperativeHeader" style="cursor:pointer;user-select:none;font-weight:700;color:var(--ink);font-family:\'JetBrains Mono\',monospace;font-size:13px;display:flex;justify-content:space-between;align-items:center;transition:all .2s ease;' + (isCollapsed ? '' : 'margin-bottom:12px;border-bottom:1px solid rgba(0,210,255,0.2);padding-bottom:8px;') + '">' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span id="meOperativeToggleIcon" style="font-size:11px;color:#00d2ff;display:inline-block;width:12px;text-align:center;">' + (isCollapsed ? '▶' : '▼') + '</span>' +
            '<span>ДОСЬЕ ОПЕРАТИВНИКА: <b style="color:#00d2ff;">' + esc(activeCharDisplay) + '</b></span>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<span style="font-size:11px;color:var(--ink-dim);">' + esc(c.race || 'Человек') + ' // ' + esc(c.role || 'Солдат') + '</span>' +
            '<button class="btn-subtle" id="meOperativeToggleBtn" style="font-size:11px;padding:2px 8px;" title="Свернуть/развернуть анкету">' + (isCollapsed ? 'Развернуть' : 'Свернуть') + '</button>' +
          '</div>' +
        '</div>' +

        '<div id="meOperativeBody" style="' + (isCollapsed ? 'display:none;' : 'display:block;') + '">' +
          '<div class="grid-2" style="margin-top:10px;">' +
            '<div>' +
              '<div style="font-size:12px;color:var(--ink-dim);margin-bottom:4px;">Имя оперативника</div>' +
              '<input type="text" class="me-input" id="meInpName" value="' + escA(c.name || '') + '" style="width:100%;">' +
            '</div>' +
            '<div>' +
              '<div style="font-size:12px;color:var(--ink-dim);margin-bottom:4px;">Позывной / Звание</div>' +
              '<input type="text" class="me-input" id="meInpCallsign" value="' + escA(c.callsign || '') + '" placeholder="Коммандер, Спектр..." style="width:100%;">' +
            '</div>' +
            '<div>' +
              '<div style="font-size:12px;color:var(--ink-dim);margin-bottom:4px;">Раса / Вид</div>' +
              '<select class="me-input" id="meSelRace" style="width:100%;">' + raceOpts + '</select>' +
            '</div>' +
            '<div>' +
              '<div style="font-size:12px;color:var(--ink-dim);margin-bottom:4px;">Специализация / Класс (вписывается)</div>' +
              '<input type="text" class="me-input" id="meInpRole" value="' + escA(c.role || '') + '" placeholder="Например: Солдат / Биотик / Разведчик..." style="width:100%;">' +
            '</div>' +
            '<div>' +
              '<div style="font-size:12px;color:var(--ink-dim);margin-bottom:4px;">Уровень</div>' +
              '<input type="number" class="me-input" id="meInpLevel" value="' + (c.level || 1) + '" min="1" max="20" style="width:100%;">' +
            '</div>' +
          '</div>' +

          // Базовые боевые статы (Щиты, ОЗ, КД)
          '<div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(0,210,255,0.2);">' +
            '<div style="font-size:12px;color:var(--ink-dim);margin-bottom:8px;">Базовые боевые параметры:</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(110px, 1fr));gap:10px;">' +
              '<div>' +
                '<div style="font-size:11px;color:var(--ink-dim);">🛡️ Щиты</div>' +
                '<input type="number" class="me-input" id="meInpShield" value="' + (c.baseShield || 15) + '" style="width:100%;text-align:center;">' +
              '</div>' +
              '<div>' +
                '<div style="font-size:11px;color:var(--ink-dim);">❤️ Макс. ОЗ</div>' +
                '<input type="number" class="me-input" id="meInpHp" value="' + (c.maxHp || 24) + '" style="width:100%;text-align:center;">' +
              '</div>' +
              '<div>' +
                '<div style="font-size:11px;color:var(--ink-dim);">🔰 КД (Броня)</div>' +
                '<input type="number" class="me-input" id="meInpAc" value="' + (c.baseAc || 15) + '" style="width:100%;text-align:center;">' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px;">' +
            '<button class="btn-primary" id="meSaveDossierBtn">✓ Сохранить досье</button>' +
            '<button class="btn-subtle" id="meResetProfileBtn" title="Сбросить досье текущего оперативника">↺ Сбросить параметры</button>' +
            '<button class="btn-subtle" id="meDelProfileBtn" style="color:#ff7777;border-color:rgba(255,85,85,0.4);margin-left:auto;" title="Удалить текущего оперативника">🗑️ Удалить оперативника</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    // 2. ОФОРМЛЕНИЕ И ТЕМЫ
    '<div class="me-panel" style="margin-top:16px;">' +
      '<div class="section-label">🎨 ОФОРМЛЕНИЕ И ТЕМЫ ИНТЕРФЕЙСА</div>' +
      '<div style="font-size:12.5px;color:var(--ink-dim);margin:6px 0 10px;">Выберите цветовую гамму терминала:</div>' +
      '<select class="me-input" id="meThemeSelect" style="width:100%;max-width:400px;font-size:13px;padding:8px;">' +
        themeOpts +
      '</select>' +
    '</div>' +

    // 3. GITHUB SYNC
    '<div class="me-panel" style="margin-top:16px;">' +
      '<div class="section-label">☁️ ОБЛАЧНАЯ СИНХРОНИЗАЦИЯ GITHUB</div>' +
      (typeof GHSync !== 'undefined' ? GHSync.renderUI() : '<div style="color:var(--ink-dim);font-size:12px;">Модуль синхронизации недоступен</div>') +
    '</div>' +

    // 4. GEMINI API
    '<div class="me-panel" style="margin-top:16px;">' +
      '<div class="section-label">✨ ИНТЕГРАЦИЯ С GOOGLE GEMINI AI</div>' +
      '<div style="font-size:12.5px;color:var(--ink-dim);margin:6px 0 10px;">API-ключ используется для работы с ИИ:</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<input type="password" class="me-input" id="meGeminiKeyInput" placeholder="AIzaSy..." value="' + escA(getGeminiApiKey()) + '" style="flex:1;min-width:240px;">' +
        '<button class="btn-primary" id="meSaveGeminiKeyBtn">Сохранить ключ</button>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--ink-dim);margin-top:6px;">Ключ хранится исключительно локально в браузере.</div>' +
    '</div>' +

    // СИСТЕМНОЕ ХРАНИЛИЩЕ И ЗАЩИТА ДАННЫХ
    (typeof AppStorage !== 'undefined' ? AppStorage.renderWidget('me') : '') +

    // 5. РЕЗЕРВНАЯ КОПИЯ
    '<div class="me-panel" style="margin-top:16px;">' +
      '<div class="section-label">💾 РЕЗЕРВНАЯ КОПИЯ И БЭКАП</div>' +
      '<div class="grid-2" style="margin-top:10px;">' +
        '<div class="me-card">' +
          '<h4 style="margin:0 0 6px;color:var(--brass);">Экспорт профиля</h4>' +
          '<p style="font-size:12px;color:var(--ink-dim);margin-bottom:10px;">Сохранение полного досье, арсенала и корабля в JSON-файл.</p>' +
          '<button class="btn-primary" id="meExportJsonBtn" style="font-size:12px;">Экспорт в JSON</button>' +
        '</div>' +
        '<div class="me-card">' +
          '<h4 style="margin:0 0 6px;color:var(--brass);">Импорт профиля</h4>' +
          '<p style="font-size:12px;color:var(--ink-dim);margin-bottom:10px;">Восстановление данных космоса из резервного JSON-файла.</p>' +
          '<input type="file" id="meImportFileInput" style="display:none;" accept=".json">' +
          '<button class="btn-ghost" id="meImportFileBtn" style="font-size:12px;">Выбрать файл...</button>' +
        '</div>' +
      '</div>' +
      '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
        '<button class="btn-ghost" id="meCopyDmCardBtn" style="font-size:12px;">📋 Скопировать досье для AI DM</button>' +
        '<button class="btn-ghost" id="meDataResetBtn" style="color:#f87171;border-color:rgba(248,113,113,0.3);font-size:12px;">↺ Сбросить данные космоса</button>' +
      '</div>' +
    '</div>';
}
window.meData = meData;
if(typeof ME !== 'undefined') ME.meData = meData;

// Привязка интерактивных событий всех экранов
function wireMe(){
  if(typeof wireMePowerEdit === 'function') wireMePowerEdit();
  if(typeof wireMeArsenalEdit === 'function') wireMeArsenalEdit();

  // Поиск по Кодексу Галактики
  var codexSearchInput = document.getElementById('meCodexSearchInput');
  if(codexSearchInput && !codexSearchInput.__wired){
    codexSearchInput.__wired = true;
    codexSearchInput.addEventListener('input', function(){
      ME.codexSearch = this.value;
      var curVal = this.value.toLowerCase().trim();
      var blocks = document.querySelectorAll('.sh-ref-group-block');
      var anyFound = false;

      blocks.forEach(function(b){
        var items = b.querySelectorAll('.menu-item');
        var groupFound = false;
        items.forEach(function(it){
          var text = (it.innerText || '').toLowerCase();
          var match = !curVal || text.indexOf(curVal) !== -1;
          it.style.display = match ? 'flex' : 'none';
          if(match) groupFound = true;
        });
        b.style.display = groupFound ? 'block' : 'none';
        if(groupFound) anyFound = true;
      });

      var emptyMsg = document.querySelector('.char-empty');
      if(emptyMsg){
        emptyMsg.style.display = anyFound ? 'none' : 'block';
      }
    });
  }

  // Навигация по кнопкам с [data-nav] или [data-go]
  document.querySelectorAll('[data-nav]').forEach(function(el){
    if(el.__meNavBound) return;
    el.__meNavBound = true;
    el.addEventListener('click', function(){
      var target = el.getAttribute('data-nav');
      if(target) navigate(target);
    });
  });



  document.querySelectorAll('[data-go]').forEach(function(el){
    if(el.__meGoBound) return;
    el.__meGoBound = true;
    el.addEventListener('click', function(){
      var target = el.getAttribute('data-go');
      if(target) navigate(target);
    });
  });

  // Сворачивание / разворачивание анкеты оперативника в meData
  var opHeader = document.getElementById('meOperativeHeader');
  var opToggleBtn = document.getElementById('meOperativeToggleBtn');
  var opBody = document.getElementById('meOperativeBody');
  var opIcon = document.getElementById('meOperativeToggleIcon');

  function toggleOperativeWindow(){
    if(!opBody) return;
    var isHidden = (opBody.style.display === 'none');
    if(isHidden){
      opBody.style.display = 'block';
      if(opIcon) opIcon.textContent = '▼';
      if(opToggleBtn) opToggleBtn.textContent = 'Свернуть';
      if(opHeader){
        opHeader.style.marginBottom = '12px';
        opHeader.style.borderBottom = '1px solid rgba(0,210,255,0.2)';
        opHeader.style.paddingBottom = '8px';
      }
      try { localStorage.setItem('me_dossier_collapsed', '0'); } catch(err){}
    } else {
      opBody.style.display = 'none';
      if(opIcon) opIcon.textContent = '▶';
      if(opToggleBtn) opToggleBtn.textContent = 'Развернуть';
      if(opHeader){
        opHeader.style.marginBottom = '0';
        opHeader.style.borderBottom = 'none';
        opHeader.style.paddingBottom = '0';
      }
      try { localStorage.setItem('me_dossier_collapsed', '1'); } catch(err){}
    }
  }

  if(opHeader){
    opHeader.onclick = function(e){
      if(e.target && e.target.closest('#meOperativeToggleBtn')) return;
      toggleOperativeWindow();
    };
  }
  if(opToggleBtn){
    opToggleBtn.onclick = function(e){
      e.stopPropagation();
      toggleOperativeWindow();
    };
  }

  // Переключение активного оперативника
  var profSel = document.getElementById('meDataProfileSelect');
  if(profSel){
    profSel.onchange = function(){
      if(this.value && this.value !== ME.activeProfileId){
        ME.switchProfile(this.value);
      }
    };
  }

  // Создание нового оперативника
  var newProfBtn = document.getElementById('meDataNewProfileBtn');
  if(newProfBtn){
    newProfBtn.onclick = function(){
      var name = prompt('Введите имя нового оперативника:', 'Новый оперативник');
      if(!name) return;
      ME.createProfile({ name: name.trim() });
    };
  }

  // Клонирование активного оперативника
  var cloneProfBtn = document.getElementById('meDataCloneProfileBtn');
  if(cloneProfBtn){
    cloneProfBtn.onclick = function(){
      ME.cloneProfile(ME.activeProfileId);
    };
  }

  // Сброс параметров текущего оперативника
  var resetProfBtn = document.getElementById('meResetProfileBtn');
  if(resetProfBtn){
    resetProfBtn.onclick = function(){
      if(confirm('Сбросить параметры текущего оперативника к начальным значениям?')){
        ME.resetProfile(ME.activeProfileId);
      }
    };
  }

  // Удаление текущего оперативника
  var delProfBtn = document.getElementById('meDelProfileBtn');
  if(delProfBtn){
    delProfBtn.onclick = function(){
      var act = ME.getActiveProfile();
      var pName = act ? (act.name || 'оперативника') : 'оперативника';
      if(confirm('Удалить досье «' + pName + '» из отряда?')){
        ME.deleteProfile(ME.activeProfileId);
      }
    };
  }

  // Сохранение Досье Оперативника в meData
  var saveDossierBtn = document.getElementById('meSaveDossierBtn');
  if(saveDossierBtn){
    saveDossierBtn.onclick = function(){
      var c = ME.getChar();
      var inpName = document.getElementById('meInpName');
      var inpCallsign = document.getElementById('meInpCallsign');
      var selRace = document.getElementById('meSelRace');
      var inpRole = document.getElementById('meInpRole');
      var inpLevel = document.getElementById('meInpLevel');
      var inpShield = document.getElementById('meInpShield');
      var inpHp = document.getElementById('meInpHp');
      var inpAc = document.getElementById('meInpAc');

      if(inpName) c.name = inpName.value.trim() || 'Оперативник';
      if(inpCallsign) c.callsign = inpCallsign.value.trim();
      if(selRace) c.race = selRace.value;
      if(inpRole) c.role = inpRole.value.trim() || 'Оперативник';
      if(inpLevel) c.level = parseInt(inpLevel.value, 10) || 1;
      if(inpShield) c.baseShield = parseInt(inpShield.value, 10) || 15;
      if(inpHp) c.maxHp = parseInt(inpHp.value, 10) || 24;
      if(inpAc) c.baseAc = parseInt(inpAc.value, 10) || 15;

      ME.saveChar(c);
      alert('✓ Досье оперативника успешно сохранено!');
      render();
    };
  }

  // Селектор темы в meData
  var themeSelect = document.getElementById('meThemeSelect');
  if(themeSelect){
    themeSelect.onchange = function(){
      if(typeof setMeTheme === 'function'){
        setMeTheme(this.value);
        render();
      }
    };
  }

  // Сохранение ключа Gemini AI
  var saveGeminiBtn = document.getElementById('meSaveGeminiKeyBtn');
  if(saveGeminiBtn){
    saveGeminiBtn.onclick = function(){
      var inp = document.getElementById('meGeminiKeyInput');
      if(inp){
        var key = inp.value.trim();
        saveGeminiApiKey(key);
        alert(key ? '✓ Ключ Gemini API успешно сохранен!' : 'Ключ удален');
      }
    };
  }

  // Системное хранилище и защита
  if(typeof AppStorage !== 'undefined' && AppStorage.wireWidget){
    AppStorage.wireWidget('me');
  }

  // Облачный синхронизатор GitHub
  if(typeof GHSync !== 'undefined' && GHSync.wireUI) GHSync.wireUI();

  // Экспорт / Импорт / Сброс
  var expBtn = document.getElementById('meExportJsonBtn');
  if(expBtn){
    expBtn.onclick = function(){
      var data = {
        profiles: ME.getProfiles(),
        activeProfileId: ME.activeProfileId,
        char: ME.getChar(),
        powers: ME.getPowers(),
        arsenal: ME.getArsenal(),
        ship: ME.getShip(),
        savedAt: new Date().toISOString()
      };
      var str = JSON.stringify(data, null, 2);
      var blob = new Blob([str], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'mass_effect_roster_' + Date.now() + '.json';
      a.click();
      URL.revokeObjectURL(url);
    };
  }

  var impFileBtn = document.getElementById('meImportFileBtn');
  var impFileInput = document.getElementById('meImportFileInput');
  if(impFileBtn && impFileInput){
    impFileBtn.onclick = function(){ impFileInput.click(); };
    impFileInput.onchange = function(e){
      var f = e.target.files && e.target.files[0];
      if(!f) return;
      var r = new FileReader();
      r.onload = function(evt){
        try {
          var d = JSON.parse(evt.target.result);
          if(d.profiles && Array.isArray(d.profiles)){
            ME.saveProfilesList(d.profiles);
            if(d.activeProfileId) ME.switchProfile(d.activeProfileId);
          } else if(d.char){
            ME.saveChar(d.char);
          }
          if(d.powers) ME.savePowers(d.powers);
          if(d.arsenal) ME.saveArsenal(d.arsenal);
          if(d.ship) ME.saveShip(d.ship);
          alert('✓ Данные космоса успешно импортированы!');
          render();
        } catch(err){
          alert('Ошибка чтения файла: ' + err.message);
        }
      };
      r.readAsText(f);
    };
  }

  var resetBtn = document.getElementById('meDataResetBtn');
  if(resetBtn){
    resetBtn.onclick = function(){
      if(confirm('Сбросить данные всех оперативников и корабля к начальным заводским настройкам?')){
        ME.resetProfile(ME.activeProfileId);
        ME.resetShip();
        alert('Данные сброшены!');
        render();
      }
    };
  }

  var copyDmBtn = document.getElementById('meCopyDmCardBtn');
  if(copyDmBtn){
    copyDmBtn.onclick = function(){
      var c = ME.getChar();
      var s = ME.getShip();
      var text = '=== ДОСЬЕ ОПЕРАТИВНИКА (MASS EFFECT) ===\n' +
        'Имя: ' + c.name + (c.callsign ? ' [' + c.callsign + ']' : '') + '\n' +
        'Раса: ' + c.race + ' | Специализация: ' + c.role + ' (Ур. ' + c.level + ')\n' +
        'Защита: Щиты ' + c.baseShield + ' | ОЗ ' + c.maxHp + ' | КД ' + c.baseAc + '\n' +
        'Судно: ' + s.name + ' (' + s.model + ')\n' +
        'Капитан: ' + s.captain + ' | Экипаж: ' + (s.crew || []).length + ' чел.';
      copyText(text);
      alert('✓ Бриф для AI DM скопирован в буфер обмена!');
    };
  }

  // Проводка экрана галактической карты
  if(typeof wireMeMap === 'function') wireMeMap();

  // ===== Восстановлено из 019422a: проводка Досье / Способностей / Арсенала / Корабля =====
  var editCharBtn = document.getElementById('meEditCharBtn');
  if(editCharBtn){
    editCharBtn.addEventListener('click', function(){
      ME._editingChar = true;
      render();
    });
  }
  var cancelEditBtn = document.getElementById('meCancelEditBtn');
  if(cancelEditBtn){
    cancelEditBtn.addEventListener('click', function(){
      ME._editingChar = false;
      render();
    });
  }
  var saveCharBtn = document.getElementById('meSaveCharBtn') || document.getElementById('meSaveCharBtn2');
  if(saveCharBtn){
    var doSave = function(){
      var c = ME.getChar();
      var nameInp = document.getElementById('meEditName'); if(nameInp) c.name = nameInp.value;
      var csInp = document.getElementById('meEditCallsign'); if(csInp) c.callsign = csInp.value;
      var raceInp = document.getElementById('meEditRace'); if(raceInp) c.race = raceInp.value;
      var roleInp = document.getElementById('meEditRole'); if(roleInp) c.role = roleInp.value;
      var origInp = document.getElementById('meEditOrigin'); if(origInp) c.origin = origInp.value;
      var bioInp = document.getElementById('meEditBio'); if(bioInp) c.biochemistry = bioInp.value;
      var lvlInp = document.getElementById('meEditLevel'); if(lvlInp) c.level = parseInt(lvlInp.value, 10) || 1;
      var devInp = document.getElementById('meEditDevPoints'); if(devInp) c.devPoints = parseInt(devInp.value, 10) || 0;
      var profInp = document.getElementById('meEditProf'); if(profInp) c.profBonus = parseInt(profInp.value, 10) || 2;
      var spdInp = document.getElementById('meEditSpeed'); if(spdInp) c.speed = spdInp.value;
      
      var acInp = document.getElementById('meEditAc'); if(acInp) c.baseAc = parseInt(acInp.value, 10) || 10;
      var shInp = document.getElementById('meEditShield'); if(shInp) c.baseShield = parseInt(shInp.value, 10) || 0;
      var armInp = document.getElementById('meEditArmor'); if(armInp) c.baseArmorPoints = parseInt(armInp.value, 10) || 0;
      var dtInp = document.getElementById('meEditDt'); if(dtInp) c.damageThreshold = parseInt(dtInp.value, 10) || 0;
      var barInp = document.getElementById('meEditBarrier'); if(barInp) c.baseBarrier = parseInt(barInp.value, 10) || 0;
      var hpInp = document.getElementById('meEditHp'); if(hpInp) c.maxHp = parseInt(hpInp.value, 10) || 10;

      document.querySelectorAll('[data-stat]').forEach(function(sInp){
        var statKey = sInp.getAttribute('data-stat');
        if(statKey && c.stats) c.stats[statKey] = parseInt(sInp.value, 10) || 10;
      });

      var loadInp = document.getElementById('meEditLoadout'); if(loadInp) c.loadout = loadInp.value;
      var omniInp = document.getElementById('meEditOmni'); if(omniInp) c.omniTool = omniInp.value;
      var ampInp = document.getElementById('meEditBioAmp'); if(ampInp) c.bioAmp = ampInp.value;
      var bgInp = document.getElementById('meEditBg'); if(bgInp) c.background = bgInp.value;

      ME.saveChar(c);
      ME._editingChar = false;
      render();
    };
    if(document.getElementById('meSaveCharBtn')) document.getElementById('meSaveCharBtn').addEventListener('click', doSave);
    if(document.getElementById('meSaveCharBtn2')) document.getElementById('meSaveCharBtn2').addEventListener('click', doSave);
  }

  var resetCharBtn = document.getElementById('meResetCharBtn');
  if(resetCharBtn){
    resetCharBtn.addEventListener('click', function(){
      if(confirm('Сбросить досье оперативника к стандартному образцу Альянса?')){
        ME.resetChar();
        render();
      }
    });
  }

  var copyDmBriefBtn = document.getElementById('meCopyDmBriefBtn') || document.getElementById('meCopyDmCardBtn');
  if(copyDmBriefBtn){
    copyDmBriefBtn.addEventListener('click', function(){
      var c = ME.getChar();
      var s = ME.getShip();
      var brief = 'ДОСЬЕ ОПЕРАТИВНИКА [' + c.name + ' // ' + c.callsign + ']' + String.fromCharCode(10) +
        'Раса: ' + c.race + ' | Роль: ' + c.role + ' | Уровень: ' + c.level + ' | ОР: ' + c.devPoints + String.fromCharCode(10) +
        'Слои защиты: AC ' + c.baseAc + ' | Барьер: ' + c.baseBarrier + ' | Щит: ' + c.baseShield + ' | Броня: ' + c.baseArmorPoints + ' (Порог DT ' + c.damageThreshold + ') | HP: ' + c.maxHp + String.fromCharCode(10) +
        'Характеристики: СИЛ ' + c.stats.str + ' | ЛОВ ' + c.stats.dex + ' | ТЕЛ ' + c.stats.con + ' | ИНТ ' + c.stats.int + ' | МУД ' + c.stats.wis + ' | ХАР ' + c.stats.cha + String.fromCharCode(10) +
        'Корабль: ' + s.name + ' (' + s.cls + ') | Статус: ' + s.status + String.fromCharCode(10) +
        'Снаряжение: ' + c.loadout + String.fromCharCode(10) +
        'Омни-тул: ' + c.omniTool + ' | Имплантат: ' + c.bioAmp;
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(brief).then(function(){ alert('Сводка досье скопирована в буфер обмена для AI DM!'); });
      } else {
        alert(brief);
      }
    });
  }

  // --- Экран: mePowers ---
  document.querySelectorAll('[data-branch]').forEach(function(btn){
    btn.addEventListener('click', function(){
      ME._activeBranch = btn.getAttribute('data-branch');
      render();
    });
  });

  var powersSearch = document.getElementById('mePowersSearchInput');
  if(powersSearch){
    powersSearch.addEventListener('input', function(){
      ME._powersSearch = powersSearch.value;
      render();
      var inputAgain = document.getElementById('mePowersSearchInput');
      if(inputAgain){
        inputAgain.focus();
        inputAgain.selectionStart = inputAgain.selectionEnd = inputAgain.value.length;
      }
    });
  }

  var openPowerForm = function(editPower){
    var p = editPower || { name: '', branch: 'Биотика', icon: '🌀', req: 'Узлы L-типа', cd: 3, cost: 1, desc: '', r1: '', r2: '', r3: '' };
    var isNew = !editPower;
    var htmlForm = '<div style="display:flex;flex-direction:column;gap:10px;">' +
      '<div class="grid-2">' +
        '<div><label style="font-size:11px;color:#7da5c9;">Название способности</label><input type="text" id="mPowName" class="me-input" style="width:100%;" value="' + meEsc(p.name) + '" placeholder="например: Сингулярность"></div>' +
        '<div><label style="font-size:11px;color:#7da5c9;">Ветвь / Категория</label>' +
          '<select id="mPowBranch" class="me-input" style="width:100%;background:#040914;">' +
            ['Биотика', 'Техника', 'Бой', 'Медицина', 'Производные', 'Кастомная'].map(function(b){
              return '<option value="' + b + '" ' + (p.branch === b ? 'selected' : '') + '>' + b + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div><label style="font-size:11px;color:#7da5c9;">Иконка (эмодзи)</label><input type="text" id="mPowIcon" class="me-input" style="width:100%;" value="' + meEsc(p.icon || '⚡') + '"></div>' +
        '<div><label style="font-size:11px;color:#7da5c9;">Требование</label><input type="text" id="mPowReq" class="me-input" style="width:100%;" value="' + meEsc(p.req) + '" placeholder="Узлы L-типа / Омни-инструмент"></div>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div><label style="font-size:11px;color:#7da5c9;">Кулдаун (раундов, 0 = без КД)</label><input type="number" id="mPowCd" class="me-input" style="width:100%;" value="' + (p.cd !== undefined ? p.cd : 3) + '"></div>' +
        '<div><label style="font-size:11px;color:#7da5c9;">Стоимость в ОР</label><input type="number" id="mPowCost" class="me-input" style="width:100%;" value="' + (p.cost || 1) + '"></div>' +
      '</div>' +
      '<div><label style="font-size:11px;color:#7da5c9;">Описание и механика применения</label><textarea id="mPowDesc" class="me-input" style="width:100%;height:60px;" placeholder="Краткое описание действия способности...">' + meEsc(p.desc) + '</textarea></div>' +
      '<div><label style="font-size:11px;color:#7da5c9;">Ранг 1 (1 ОР)</label><input type="text" id="mPowR1" class="me-input" style="width:100%;" value="' + meEsc(p.r1) + '" placeholder="Эффект на 1 ранге..."></div>' +
      '<div><label style="font-size:11px;color:#7da5c9;">Ранг 2 (2 ОР)</label><input type="text" id="mPowR2" class="me-input" style="width:100%;" value="' + meEsc(p.r2) + '" placeholder="Эффект на 2 ранге..."></div>' +
      '<div><label style="font-size:11px;color:#7da5c9;">Ранг 3 (3 ОР)</label><input type="text" id="mPowR3" class="me-input" style="width:100%;" value="' + meEsc(p.r3) + '" placeholder="Эффект на 3 ранге..."></div>' +
    '</div>';

    meShowModal(isNew ? 'СОЗДАНИЕ СПОСОБНОСТИ A92' : 'РЕДАКТИРОВАНИЕ СПОСОБНОСТИ', 'ПРОТОКОЛ БОЕВОЙ СИСТЕМЫ', htmlForm, function(){
      var name = (document.getElementById('mPowName').value || '').trim();
      if(!name){ alert('Укажите название способности!'); return false; }
      var updated = {
        id: editPower ? editPower.id : ('pow_' + Date.now()),
        name: name,
        branch: document.getElementById('mPowBranch').value,
        icon: document.getElementById('mPowIcon').value || '⚡',
        req: document.getElementById('mPowReq').value || '—',
        cd: parseInt(document.getElementById('mPowCd').value, 10) || 0,
        cost: parseInt(document.getElementById('mPowCost').value, 10) || 1,
        desc: document.getElementById('mPowDesc').value || '',
        r1: document.getElementById('mPowR1').value || '',
        r2: document.getElementById('mPowR2').value || '',
        r3: document.getElementById('mPowR3').value || ''
      };
      if(isNew) ME.addPower(updated);
      else ME.updatePower(updated);
      render();
      return true;
    });
  };

  var addPowerBtn = document.getElementById('meAddPowerBtn') || document.getElementById('meAddPowerEmptyBtn');
  if(addPowerBtn){
    addPowerBtn.onclick = function(){ openPowerForm(null); };
  }

  var presetPowersBtn = document.getElementById('mePresetPowersBtn') || document.getElementById('mePresetPowerEmptyBtn');
  if(presetPowersBtn){
    presetPowersBtn.onclick = function(){
      var listHtml = '<div style="max-height:55vh;overflow-y:auto;display:flex;flex-direction:column;gap:8px;">' +
        ME_CANON_POWERS_PRESETS.map(function(cp, idx){
          return '<div class="me-card" style="padding:10px 12px;display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
            '<div>' +
              '<div style="font-weight:700;color:#fff;">' + cp.icon + ' ' + meEsc(cp.name) + ' <span class="me-tag-holo" style="font-size:10px;">' + cp.branch + '</span></div>' +
              '<div style="font-size:11.5px;color:#8bb1d6;margin-top:2px;">' + meEsc(cp.desc) + '</div>' +
            '</div>' +
            '<button class="btn-primary me-add-preset-power-btn" data-idx="' + idx + '" style="font-size:11px;padding:3px 10px;white-space:nowrap;">+ Добавить</button>' +
          '</div>';
        }).join('') +
      '</div>';
      meShowModal('ШАБЛОНЫ СПОСОБНОСТЕЙ ИЗ КОДЕКСА', 'ВЫБЕРИТЕ ПРОТОКОЛ ДЛЯ ДОБАВЛЕНИЯ В ВАШЕ ДРЕВО', listHtml, null);
      document.querySelectorAll('.me-add-preset-power-btn').forEach(function(b){
        b.onclick = function(){
          var idx = parseInt(b.getAttribute('data-idx'), 10);
          var template = ME_CANON_POWERS_PRESETS[idx];
          if(template){
            ME.addPower(JSON.parse(JSON.stringify(template)));
            b.innerText = '✓ Добавлено';
            b.disabled = true;
            b.style.opacity = '0.6';
            render();
          }
        };
      });
    };
  }

  document.querySelectorAll('.me-edit-power-btn').forEach(function(b){
    b.onclick = function(){
      var id = b.getAttribute('data-id');
      var item = ME.getPowers().find(function(x){ return x.id === id; });
      if(item) openPowerForm(item);
    };
  });

  document.querySelectorAll('.me-del-power-btn').forEach(function(b){
    b.onclick = function(){
      var id = b.getAttribute('data-id');
      if(confirm('Удалить эту способность из древа?')){
        ME.deletePower(id);
        render();
      }
    };
  });

  // --- Экран: meArsenal ---
  document.querySelectorAll('[data-arsenal-cat]').forEach(function(btn){
    btn.addEventListener('click', function(){
      ME._activeArsenalCat = btn.getAttribute('data-arsenal-cat');
      render();
    });
  });

  var openWeaponForm = function(editWeapon){
    var w = editWeapon || { name: '', cat: 'rifles', type: 'Штурмовая винтовка', dmg: '1d8+2 кин.', range: '60/180 фт', clip: 30, desc: '' };
    var isNew = !editWeapon;
    var htmlForm = '<div style="display:flex;flex-direction:column;gap:10px;">' +
      '<div class="grid-2">' +
        '<div><label style="font-size:11px;color:#7da5c9;">Название оружия</label><input type="text" id="mWpnName" class="me-input" style="width:100%;" value="' + meEsc(w.name) + '" placeholder="например: M-8 «Мститель»"></div>' +
        '<div><label style="font-size:11px;color:#7da5c9;">Категория арсенала</label>' +
          '<select id="mWpnCat" class="me-input" style="width:100%;background:#040914;">' +
            [
              { id: 'rifles', name: 'Винтовки' },
              { id: 'pistols', name: 'Пистолеты/ПП' },
              { id: 'shotguns', name: 'Дробовики' },
              { id: 'snipers', name: 'Снайперские' },
              { id: 'heavy', name: 'Тяжелое' }
            ].map(function(c){
              return '<option value="' + c.id + '" ' + (w.cat === c.id ? 'selected' : '') + '>' + c.name + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div><label style="font-size:11px;color:#7da5c9;">Тип / Подтип</label><input type="text" id="mWpnType" class="me-input" style="width:100%;" value="' + meEsc(w.type) + '" placeholder="Штурмовая винтовка / Дробовик"></div>' +
        '<div><label style="font-size:11px;color:#7da5c9;">Кость урона</label><input type="text" id="mWpnDmg" class="me-input" style="width:100%;" value="' + meEsc(w.dmg) + '" placeholder="например: 1d8+2 кин."></div>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div><label style="font-size:11px;color:#7da5c9;">Дистанция</label><input type="text" id="mWpnRange" class="me-input" style="width:100%;" value="' + meEsc(w.range) + '" placeholder="60/180 фт"></div>' +
        '<div><label style="font-size:11px;color:#7da5c9;">Магазин / Заряды</label><input type="text" id="mWpnClip" class="me-input" style="width:100%;" value="' + meEsc(w.clip) + '" placeholder="30"></div>' +
      '</div>' +
      '<div><label style="font-size:11px;color:#7da5c9;">Описание и особенности</label><textarea id="mWpnDesc" class="me-input" style="width:100%;height:60px;" placeholder="Особенности стрельбы, модификации...">' + meEsc(w.desc) + '</textarea></div>' +
    '</div>';

    meShowModal(isNew ? 'ВПИСАТЬ ОРУЖИЕ В АРСЕНАЛ' : 'РЕДАКТИРОВАНИЕ ОРУЖИЯ', 'СКЛАД БОЕВОГО СНАРЯЖЕНИЯ', htmlForm, function(){
      var name = (document.getElementById('mWpnName').value || '').trim();
      if(!name){ alert('Укажите название оружия!'); return false; }
      var updated = {
        id: editWeapon ? editWeapon.id : ('wpn_' + Date.now()),
        name: name,
        cat: document.getElementById('mWpnCat').value,
        type: document.getElementById('mWpnType').value || 'Огнестрел',
        dmg: document.getElementById('mWpnDmg').value || '1d8',
        range: document.getElementById('mWpnRange').value || '—',
        clip: document.getElementById('mWpnClip').value || '—',
        desc: document.getElementById('mWpnDesc').value || ''
      };
      if(isNew) ME.addWeapon(updated);
      else ME.updateWeapon(updated);
      render();
      return true;
    });
  };

  var addWeaponBtn = document.getElementById('meAddWeaponBtn') || document.getElementById('meAddWeaponEmptyBtn');
  if(addWeaponBtn){
    addWeaponBtn.onclick = function(){ openWeaponForm(null); };
  }

  var presetWeaponsBtn = document.getElementById('mePresetWeaponsBtn') || document.getElementById('mePresetWeaponEmptyBtn');
  if(presetWeaponsBtn){
    presetWeaponsBtn.onclick = function(){
      var listHtml = '<div style="max-height:55vh;overflow-y:auto;display:flex;flex-direction:column;gap:8px;">' +
        ME_CANON_WEAPONS_PRESETS.map(function(cw, idx){
          return '<div class="me-card" style="padding:10px 12px;display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
            '<div>' +
              '<div style="font-weight:700;color:#fff;">🔫 ' + meEsc(cw.name) + ' <span class="me-tag-holo" style="font-size:10px;">' + cw.dmg + '</span></div>' +
              '<div style="font-size:11.5px;color:#8bb1d6;margin-top:2px;">' + meEsc(cw.desc) + '</div>' +
            '</div>' +
            '<button class="btn-primary me-add-preset-weapon-btn" data-idx="' + idx + '" style="font-size:11px;padding:3px 10px;white-space:nowrap;">+ Добавить</button>' +
          '</div>';
        }).join('') +
      '</div>';
      meShowModal('КАТАЛОГ ВООРУЖЕНИЯ АЛЬЯНСА', 'ВЫБЕРИТЕ ОРУЖИЕ ДЛЯ ДОБАВЛЕНИЯ В ВАШ АРСЕНАЛ', listHtml, null);
      document.querySelectorAll('.me-add-preset-weapon-btn').forEach(function(b){
        b.onclick = function(){
          var idx = parseInt(b.getAttribute('data-idx'), 10);
          var template = ME_CANON_WEAPONS_PRESETS[idx];
          if(template){
            ME.addWeapon(JSON.parse(JSON.stringify(template)));
            b.innerText = '✓ Добавлено';
            b.disabled = true;
            b.style.opacity = '0.6';
            render();
          }
        };
      });
    };
  }

  document.querySelectorAll('.me-edit-weapon-btn').forEach(function(b){
    b.onclick = function(){
      var id = b.getAttribute('data-id');
      var item = ME.getArsenal().find(function(x){ return x.id === id; });
      if(item) openWeaponForm(item);
    };
  });

  document.querySelectorAll('.me-del-weapon-btn').forEach(function(b){
    b.onclick = function(){
      var id = b.getAttribute('data-id');
      if(confirm('Удалить это оружие из арсенала?')){
        ME.deleteWeapon(id);
        render();
      }
    };
  });

  document.querySelectorAll('.me-roll-weapon-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var wName = btn.getAttribute('data-weapon-name') || 'Оружие';
      var wDmg = btn.getAttribute('data-dmg') || '';
      diceState.labelCat = 'space';
      diceState.label = '💥 ' + wName + (wDmg ? ' [' + wDmg + ']' : '');
      navigate('dice');
    });
  });

  // --- Экран: meShip ---
  var editShipBtn = document.getElementById('meEditShipBtn');
  if(editShipBtn){
    editShipBtn.onclick = function(){
      var s = ME.getShip();
      var htmlForm = '<div style="display:flex;flex-direction:column;gap:10px;">' +
        '<div><label style="font-size:11px;color:#7da5c9;">Название судна</label><input type="text" id="mShipName" class="me-input" style="width:100%;" value="' + meEsc(s.name) + '"></div>' +
        '<div><label style="font-size:11px;color:#7da5c9;">Класс корабля</label><input type="text" id="mShipCls" class="me-input" style="width:100%;" value="' + meEsc(s.cls) + '"></div>' +
        '<div><label style="font-size:11px;color:#7da5c9;">Статус готовности</label><input type="text" id="mShipStatus" class="me-input" style="width:100%;" value="' + meEsc(s.status) + '"></div>' +
        '<div><label style="font-size:11px;color:#7da5c9;">Заметки и назначение</label><textarea id="mShipNotes" class="me-input" style="width:100%;height:60px;">' + meEsc(s.notes || '') + '</textarea></div>' +
      '</div>';
      meShowModal('ПАРАМЕТРЫ КОРАБЛЯ', 'РЕГИСТРАЦИОННЫЕ ДАННЫЕ СУДНА', htmlForm, function(){
        var name = (document.getElementById('mShipName').value || '').trim() || 'Без названия';
        var cls = document.getElementById('mShipCls').value || 'Фрегат';
        var status = document.getElementById('mShipStatus').value || 'В строю';
        var notes = document.getElementById('mShipNotes').value || '';
        ME.updateShipInfo(name, cls, status, notes);
        render();
        return true;
      });
    };
  }

  var presetShipBtn = document.getElementById('mePresetShipBtn');
  if(presetShipBtn){
    presetShipBtn.onclick = function(){
      if(confirm('Загрузить конфигурацию фрегата «Нормандия SR-2» с полным комплектом модулей и экипажем?')){
        ME.saveShip(JSON.parse(JSON.stringify(ME_CANON_NORMANDY_PRESET)));
        render();
      }
    };
  }

  var resetShipBtn = document.getElementById('meResetShipBtn');
  if(resetShipBtn){
    resetShipBtn.onclick = function(){
      if(confirm('Очистить все модули и список экипажа корабля?')){
        ME.resetShip();
        render();
      }
    };
  }

  document.querySelectorAll('.me-edit-module-btn').forEach(function(b){
    b.onclick = function(){
      var modId = b.getAttribute('data-mod-id');
      var s = ME.getShip();
      var m = s.modules.find(function(item){ return item.id === modId; });
      if(!m) return;

      var htmlForm = '<div style="display:flex;flex-direction:column;gap:10px;">' +
        '<div style="font-size:13px;font-weight:700;color:#00d2ff;margin-bottom:4px;">' + (m.icon || '🛰️') + ' Слот: ' + meEsc(m.slot) + '</div>' +
        '<div><label style="font-size:11px;color:#7da5c9;">Название установленного модуля</label><input type="text" id="mModName" class="me-input" style="width:100%;" value="' + (m.name === 'Слот пуст' ? '' : meEsc(m.name)) + '" placeholder="например: Танталовое ядро T-90"></div>' +
        '<div><label style="font-size:11px;color:#7da5c9;">Состояние / Характеристика</label><input type="text" id="mModStat" class="me-input" style="width:100%;" value="' + (m.stat === 'Не установлено' ? '' : meEsc(m.stat)) + '" placeholder="например: 100% Номинал / Активен"></div>' +
        '<div><label style="font-size:11px;color:#7da5c9;">Описание и свойства</label><textarea id="mModDesc" class="me-input" style="width:100%;height:60px;" placeholder="Технические характеристики модуля...">' + (m.name === 'Слот пуст' ? '' : meEsc(m.desc)) + '</textarea></div>' +
        '<div style="text-align:left;margin-top:6px;">' +
          '<button type="button" class="btn-subtle" id="mModClearBtn" style="font-size:11px;color:#ff5555;border-color:rgba(255,85,85,0.3);">Очистить этот слот</button>' +
        '</div>' +
      '</div>';

      meShowModal('НАСТРОЙКА МОДУЛЯ', meEsc(m.slot), htmlForm, function(){
        var modName = (document.getElementById('mModName').value || '').trim();
        var modStat = (document.getElementById('mModStat').value || '').trim();
        var modDesc = (document.getElementById('mModDesc').value || '').trim();
        if(!modName){
          modName = 'Слот пуст';
          modStat = 'Не установлено';
          modDesc = 'Место под ' + m.slot.toLowerCase() + '.';
        } else {
          if(!modStat) modStat = 'Установлен';
          if(!modDesc) modDesc = 'Модуль смонтирован и функционирует штатно.';
        }
        ME.updateShipModule(modId, modName, modStat, modDesc);
        render();
        return true;
      });

      var clearBtn = document.getElementById('mModClearBtn');
      if(clearBtn){
        clearBtn.onclick = function(){
          document.getElementById('mModName').value = '';
          document.getElementById('mModStat').value = '';
          document.getElementById('mModDesc').value = '';
        };
      }
    };
  });

  var openCrewForm = function(editCrew){
    var c = editCrew || { name: '', race: 'Человек', role: 'Специалист', loyalty: 'В отряде', note: '' };
    var isNew = !editCrew;
    var htmlForm = '<div style="display:flex;flex-direction:column;gap:10px;">' +
      '<div class="grid-2">' +
        '<div><label style="font-size:11px;color:#7da5c9;">Имя / Позывной</label><input type="text" id="mCrewName" class="me-input" style="width:100%;" value="' + meEsc(c.name) + '" placeholder="Имя соратника..."></div>' +
        '<div><label style="font-size:11px;color:#7da5c9;">Раса</label><input type="text" id="mCrewRace" class="me-input" style="width:100%;" value="' + meEsc(c.race) + '" placeholder="Человек, Турианец, Азари..."></div>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div><label style="font-size:11px;color:#7da5c9;">Роль / Должность</label><input type="text" id="mCrewRole" class="me-input" style="width:100%;" value="' + meEsc(c.role) + '" placeholder="Пилот, Старпом, Инженер..."></div>' +
        '<div><label style="font-size:11px;color:#7da5c9;">Статус / Лояльность</label><input type="text" id="mCrewLoyalty" class="me-input" style="width:100%;" value="' + meEsc(c.loyalty) + '" placeholder="Предан, В отряде..."></div>' +
      '</div>' +
      '<div><label style="font-size:11px;color:#7da5c9;">Заметки, навыки и биография</label><textarea id="mCrewNote" class="me-input" style="width:100%;height:60px;" placeholder="Особые черты, биография, специализация...">' + meEsc(c.note) + '</textarea></div>' +
    '</div>';

    meShowModal(isNew ? 'ДОБАВИТЬ ЧЛЕНА ЭКИПАЖА' : 'РЕДАКТИРОВАНИЕ ДАННЫХ СОРАТНИКА', 'СОСТАВ КОМАНДЫ СУДНА', htmlForm, function(){
      var name = (document.getElementById('mCrewName').value || '').trim();
      if(!name){ alert('Укажите имя члена экипажа!'); return false; }
      var updated = {
        id: editCrew ? editCrew.id : ('crew_' + Date.now()),
        name: name,
        race: document.getElementById('mCrewRace').value || 'Человек',
        role: document.getElementById('mCrewRole').value || 'Специалист',
        loyalty: document.getElementById('mCrewLoyalty').value || 'В отряде',
        note: document.getElementById('mCrewNote').value || ''
      };
      if(isNew) ME.addCrewMember(updated);
      else ME.updateCrewMember(updated);
      render();
      return true;
    });
  };

  var addCrewBtn = document.getElementById('meAddCrewBtn') || document.getElementById('meAddCrewEmptyBtn');
  if(addCrewBtn){
    addCrewBtn.onclick = function(){ openCrewForm(null); };
  }

  document.querySelectorAll('.me-edit-crew-btn').forEach(function(b){
    b.onclick = function(){
      var id = b.getAttribute('data-id');
      var item = ME.getShip().crew.find(function(x){ return x.id === id; });
      if(item) openCrewForm(item);
    };
  });

  document.querySelectorAll('.me-del-crew-btn').forEach(function(b){
    b.onclick = function(){
      var id = b.getAttribute('data-id');
      if(confirm('Удалить этого соратника из состава экипажа?')){
        ME.deleteCrewMember(id);
        render();
      }
    };
  });

}