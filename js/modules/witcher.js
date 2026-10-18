/* ============================================================
   ВЕДЬМАК (THE WITCHER) МОДУЛЬ
   ============================================================ */

(function(){
  'use strict';

  var WI_PROFILES_KEY = 'ttc_wi_profiles';
  var WI_ACTIVE_ID_KEY = 'ttc_wi_active_id';
  var WI_META_KEY = 'ttc_wi_meta';
  var WI_THEME_KEY = 'ttc_wi_theme';

  function defaultWitcherProfile(){
    return {
      id: 'wi_prof_primary',
      name: '',
      title: '',
      school: '',
      level: 1,
      hp: 20,
      maxHp: 20,
      ac: 10,
      energy: 50,
      maxEnergy: 50,
      silverSword: '',
      steelSword: '',
      armor: '',
      notes: '',
      techs: [],
      moves: []
    };
  }

  var WI = window.WI = {
    profiles: [],
    activeProfileId: '',
    meta: { name: 'Хроники Континента: Неверлэнд', note: 'Контракты, заказчики, награды и бестиарий.', theme: 'wolf' },

    _migrateAndNormalizeProfiles: function(arr, activeId){
      if(!Array.isArray(arr)) return [];
      var hasAnyTechsField = arr.some(function(p){ return p && Array.isArray(p.techs); });
      var hasAnyMovesField = arr.some(function(p){ return p && Array.isArray(p.moves); });

      var legacyTechs = [];
      var legacyMoves = [];
      if(!hasAnyTechsField){
        try {
          var rawT = localStorage.getItem('ttc_wi_techs');
          if(rawT && rawT !== 'undefined'){
            var parsedT = JSON.parse(rawT);
            if(Array.isArray(parsedT)){
              legacyTechs = parsedT.filter(function(t){ return t && (!OLD_DEFAULT_TECH_IDS || OLD_DEFAULT_TECH_IDS.indexOf(t.id) === -1); });
            }
          }
        } catch(e){}
      }
      if(!hasAnyMovesField){
        try {
          var rawM = localStorage.getItem('ttc_wi_moves');
          if(rawM && rawM !== 'undefined'){
            var parsedM = JSON.parse(rawM);
            if(Array.isArray(parsedM)){
              legacyMoves = parsedM.filter(function(m){ return m && (!OLD_DEFAULT_MOVE_IDS || OLD_DEFAULT_MOVE_IDS.indexOf(m.id) === -1); });
            }
          }
        } catch(e){}
      }

      arr.forEach(function(p){
        if(!p) return;
        if(!Array.isArray(p.techs)){
          p.techs = (p.id === activeId && legacyTechs.length) ? JSON.parse(JSON.stringify(legacyTechs)) : [];
        } else {
          p.techs = p.techs.filter(function(t){ return t && (!OLD_DEFAULT_TECH_IDS || OLD_DEFAULT_TECH_IDS.indexOf(t.id) === -1); });
        }
        p.techs.forEach(function(t, idx){
          if(t && !t.id) t.id = 'wi_tech_' + Date.now() + '_' + idx;
        });
        if(!Array.isArray(p.moves)){
          p.moves = (p.id === activeId && legacyMoves.length) ? JSON.parse(JSON.stringify(legacyMoves)) : [];
        } else {
          p.moves = p.moves.filter(function(m){ return m && (!OLD_DEFAULT_MOVE_IDS || OLD_DEFAULT_MOVE_IDS.indexOf(m.id) === -1); });
        }
        p.moves.forEach(function(m, idx){
          if(m && !m.id) m.id = 'wi_move_' + Date.now() + '_' + idx;
        });
      });
      return arr;
    },

    loadProfiles: function(){
      try {
        var raw = localStorage.getItem(WI_PROFILES_KEY);
        if(raw && raw !== 'undefined'){
          try {
            var arr = JSON.parse(raw);
            if(Array.isArray(arr) && arr.length > 0){
              // Очищаем стандартного Геральта из прошлых версий
              arr = arr.filter(function(p){
                if(!p) return false;
                if(p.id === 'wi_prof_geralt') return false;
                if(p.name === 'Геральт из Ривии' && (!p.notes || p.notes.indexOf('Мутации третьего круга') !== -1)) return false;
                return true;
              });
              if(arr.length > 0){
                var savedActive = localStorage.getItem(WI_ACTIVE_ID_KEY);
                var resolvedId = (savedActive && arr.some(function(p){ return p.id === savedActive; })) ? savedActive : arr[0].id;
                WI._migrateAndNormalizeProfiles(arr, resolvedId);
                WI.profiles = arr;
                WI.activeProfileId = resolvedId;
                var actProf = WI.profiles.find(function(p){ return p.id === WI.activeProfileId; }) || WI.profiles[0];
                WI.techs = actProf && Array.isArray(actProf.techs) ? actProf.techs : [];
                WI.moves = actProf && Array.isArray(actProf.moves) ? actProf.moves : [];
                WI.saveProfiles();
                return WI.profiles;
              }
            }
          } catch(innerErr){}
        }
        var legacyRaw = localStorage.getItem('wi_profile');
        if(legacyRaw && legacyRaw !== 'undefined'){
          var legacy = JSON.parse(legacyRaw);
          if(legacy && legacy.name && legacy.name !== 'Геральт из Ривии' && legacy.id !== 'wi_prof_geralt'){
            if(!legacy.id) legacy.id = 'wi_prof_legacy';
            if(!legacy.school) legacy.school = '';
            if(!legacy.energy) legacy.energy = 50;
            if(!legacy.maxEnergy) legacy.maxEnergy = 50;
            if(!legacy.silverSword) legacy.silverSword = '';
            if(!legacy.steelSword) legacy.steelSword = '';
            if(!legacy.armor) legacy.armor = '';
            WI._migrateAndNormalizeProfiles([legacy], legacy.id);
            WI.profiles = [legacy];
            WI.activeProfileId = legacy.id;
            WI.techs = legacy.techs;
            WI.moves = legacy.moves;
            WI.saveProfiles();
            return WI.profiles;
          }
        }
      } catch(e){}

      var def = defaultWitcherProfile();
      WI._migrateAndNormalizeProfiles([def], def.id);
      WI.profiles = [def];
      WI.activeProfileId = def.id;
      WI.techs = def.techs;
      WI.moves = def.moves;
      WI.saveProfiles();
      return WI.profiles;
    },

    saveProfiles: function(){
      try {
        var act = (WI.profiles || []).find(function(p){ return p && p.id === WI.activeProfileId; }) || (WI.profiles && WI.profiles[0]);
        if(act){
          if(Array.isArray(WI.techs)) act.techs = WI.techs;
          else if(!Array.isArray(act.techs)) act.techs = [];
          if(Array.isArray(WI.moves)) act.moves = WI.moves;
          else if(!Array.isArray(act.moves)) act.moves = [];
          localStorage.setItem('wi_profile', JSON.stringify(act));
          localStorage.setItem('ttc_wi_techs', JSON.stringify(act.techs));
          localStorage.setItem('ttc_wi_moves', JSON.stringify(act.moves));
        }
        if(Array.isArray(WI.profiles)){
          localStorage.setItem(WI_PROFILES_KEY, JSON.stringify(WI.profiles));
        }
        localStorage.setItem(WI_ACTIVE_ID_KEY, WI.activeProfileId);
      } catch(e){}
    },

    getActiveProfile: function(){
      if(!Array.isArray(WI.profiles) || WI.profiles.length === 0){
        WI.loadProfiles();
      }
      var act = WI.profiles.find(function(p){ return p.id === WI.activeProfileId; });
      if(!act){
        act = WI.profiles[0] || defaultWitcherProfile();
        WI.activeProfileId = act.id;
      }
      if(!Array.isArray(act.techs)) act.techs = [];
      if(!Array.isArray(act.moves)) act.moves = [];
      return act;
    },

    getProfile: function(){
      return WI.getActiveProfile();
    },

    saveProfile: function(p){
      if(!p || !p.id) return;
      var idx = (WI.profiles || []).findIndex(function(item){ return item.id === p.id; });
      if(idx !== -1){
        if(!Array.isArray(p.techs)) p.techs = Array.isArray(WI.profiles[idx].techs) ? WI.profiles[idx].techs : [];
        if(!Array.isArray(p.moves)) p.moves = Array.isArray(WI.profiles[idx].moves) ? WI.profiles[idx].moves : [];
        WI.profiles[idx] = p;
      } else {
        if(!Array.isArray(p.techs)) p.techs = [];
        if(!Array.isArray(p.moves)) p.moves = [];
        WI.profiles.push(p);
      }
      if(p.id === WI.activeProfileId){
        WI.techs = p.techs;
        WI.moves = p.moves;
      }
      WI.saveProfiles();
    },

    switchProfile: function(newId){
      if(!newId || newId === WI.activeProfileId) return;
      var cur = (WI.profiles || []).find(function(p){ return p.id === WI.activeProfileId; });
      if(cur){
        if(Array.isArray(WI.techs)) cur.techs = WI.techs;
        if(Array.isArray(WI.moves)) cur.moves = WI.moves;
      }
      var next = (WI.profiles || []).find(function(p){ return p.id === newId; });
      if(next){
        if(!Array.isArray(next.techs)) next.techs = [];
        if(!Array.isArray(next.moves)) next.moves = [];
        WI.activeProfileId = newId;
        WI.techs = next.techs;
        WI.moves = next.moves;
        WI.saveProfiles();
        if(typeof paintShBar === 'function') paintShBar();
        if(typeof render === 'function') render();
      }
    },

    createProfile: function(opts){
      var cur = (WI.profiles || []).find(function(p){ return p.id === WI.activeProfileId; });
      if(cur){
        if(Array.isArray(WI.techs)) cur.techs = WI.techs;
        if(Array.isArray(WI.moves)) cur.moves = WI.moves;
      }
      var def = defaultWitcherProfile();
      def.id = 'wi_prof_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      def.name = (opts && opts.name) ? opts.name : '';
      def.school = (opts && opts.school !== undefined) ? opts.school : '';
      def.title = (opts && opts.title) ? opts.title : '';
      def.level = 1;
      def.hp = 20;
      def.maxHp = 20;
      def.ac = 10;
      def.energy = 50;
      def.maxEnergy = 50;
      def.silverSword = '';
      def.steelSword = '';
      def.armor = '';
      def.notes = '';
      def.techs = [];
      def.moves = [];

      if(!Array.isArray(WI.profiles)) WI.profiles = [];
      WI.profiles.push(def);
      WI.activeProfileId = def.id;
      WI.techs = def.techs;
      WI.moves = def.moves;
      WI.saveProfiles();
      if(typeof paintShBar === 'function') paintShBar();
      if(typeof render === 'function') render();
      return def;
    },

    cloneProfile: function(id){
      id = id || WI.activeProfileId;
      var cur = (WI.profiles || []).find(function(p){ return p.id === WI.activeProfileId; });
      if(cur){
        if(Array.isArray(WI.techs)) cur.techs = WI.techs;
        if(Array.isArray(WI.moves)) cur.moves = WI.moves;
      }
      var src = (WI.profiles || []).find(function(p){ return p.id === id; }) || WI.getActiveProfile();
      if(!src) return null;
      var copy = JSON.parse(JSON.stringify(src));
      copy.id = 'wi_prof_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      copy.name = (copy.name || 'Персонаж') + ' (Копия)';
      if(!Array.isArray(copy.techs)) copy.techs = [];
      if(!Array.isArray(copy.moves)) copy.moves = [];
      WI.profiles.push(copy);
      WI.activeProfileId = copy.id;
      WI.techs = copy.techs;
      WI.moves = copy.moves;
      WI.saveProfiles();
      if(typeof paintShBar === 'function') paintShBar();
      if(typeof render === 'function') render();
      return copy;
    },

    deleteProfile: function(id){
      id = id || WI.activeProfileId;
      if(!Array.isArray(WI.profiles)) return;
      if(WI.profiles.length <= 1){
        var fresh = defaultWitcherProfile();
        WI.profiles = [fresh];
        WI.activeProfileId = fresh.id;
        WI.techs = fresh.techs;
        WI.moves = fresh.moves;
        WI.saveProfiles();
        if(typeof paintShBar === 'function') paintShBar();
        if(typeof render === 'function') render();
        return;
      }
      var idx = WI.profiles.findIndex(function(p){ return p.id === id; });
      if(idx === -1) return;
      WI.profiles.splice(idx, 1);
      if(WI.activeProfileId === id){
        WI.activeProfileId = WI.profiles[Math.max(0, idx - 1)].id;
      }
      var nextAct = WI.getActiveProfile();
      WI.techs = nextAct.techs;
      WI.moves = nextAct.moves;
      WI.saveProfiles();
      if(typeof paintShBar === 'function') paintShBar();
      if(typeof render === 'function') render();
    },

    resetProfile: function(id){
      id = id || WI.activeProfileId;
      var p = (WI.profiles || []).find(function(item){ return item.id === id; });
      if(!p) return;
      p.level = 1;
      p.hp = 20;
      p.maxHp = 20;
      p.ac = 10;
      p.energy = 50;
      WI.saveProfiles();
      if(typeof paintShBar === 'function') paintShBar();
      if(typeof render === 'function') render();
    },

    THEMES: [
      {
        id: 'wolf',
        title: 'Школа Волка',
        sub: 'Каэр Морхен • Игни',
        icon: 'symbols/Witcher/wolf_medallion.png?v=154',
        accent: '#f59e0b',
        glow: 'rgba(245,158,11,0.45)',
        toast: '🐺 Тема: Школа Волка и Пламя Игни'
      },
      {
        id: 'hunt',
        title: 'Дикая Охота',
        sub: 'Белый Хлад • Нагльфар',
        icon: 'symbols/Witcher/wild_hunt_crest.png?v=154',
        accent: '#38bdf8',
        glow: 'rgba(56,189,248,0.55)',
        toast: '❄️ Тема: Дикая Охота и Белый Хлад'
      },
      {
        id: 'north',
        title: 'Королевства Севера',
        sub: 'Темерия • Серебряные лилии',
        icon: 'symbols/Witcher/northern_realms_crest.png?v=155',
        accent: '#60a5fa',
        glow: 'rgba(59,130,246,0.5)',
        toast: '⚜️ Тема: Королевства Севера (Серебряные лилии Темерии)'
      },
      {
        id: 'nilfgaard',
        title: 'Империя Нильфгаард',
        sub: 'Великое Солнце • Оникс и Золото',
        icon: 'symbols/Witcher/nilfgaard_sun.png?v=156',
        accent: '#eab308',
        glow: 'rgba(234,179,8,0.5)',
        toast: '☀️ Тема: Империя Нильфгаард (Великое Солнце)'
      },
      {
        id: 'scoiatael',
        title: 'Эльфы и Скоя\'таэли',
        sub: 'Aen Seidhe • Брокилон и Дол Блатанна',
        icon: 'symbols/Witcher/scoiatael_crest.png?v=160',
        accent: '#34d399',
        glow: 'rgba(52,211,153,0.5)',
        toast: '🌿 Тема: Эльфы Aen Seidhe и Скоя\'таэли'
      },
      {
        id: 'skellige',
        title: 'Острова Скеллиге',
        sub: 'Кланы и Драккары • Шторм и Сталь',
        icon: 'symbols/Witcher/skellige_crest.png?v=161',
        accent: '#2dd4bf',
        glow: 'rgba(45,212,191,0.5)',
        toast: '🌊 Тема: Острова Скеллиге (Кланы и Драккары)'
      },
      {
        id: 'syndicate',
        title: 'Синдикат и Бандиты',
        sub: 'Новиград • Золото и Кинжалы',
        icon: 'symbols/Witcher/syndicate_crest.png?v=162',
        accent: '#fbbf24',
        glow: 'rgba(251,191,36,0.55)',
        toast: '🪙 Тема: Синдикат и Бандиты (Золото Новиграда)'
      },
      {
        id: 'dragon',
        title: 'Ониксовый Дракон',
        sub: 'Чёрный Оникс • Обсидиан и Пепел',
        icon: 'symbols/Witcher/onyx_dragon_crest.png?v=165',
        accent: '#d4d4d8',
        glow: 'rgba(212,212,216,0.45)',
        toast: '🐉 Тема: Ониксовый Дракон (Чёрный Оникс и Обсидиан)'
      }
    ],

    getTheme: function(){
      var valid = function(id){
        return WI.THEMES.some(function(item){ return item.id === id; });
      };
      try {
        var t = localStorage.getItem(WI_THEME_KEY);
        if(t && valid(t)) return t;
      } catch(e){}
      var m = WI.meta;
      if(m && m.theme && valid(m.theme)) return m.theme;
      return 'wolf';
    },

    setTheme: function(themeName){
      var valid = WI.THEMES.some(function(item){ return item.id === themeName; });
      var t = valid ? themeName : 'wolf';
      try {
        localStorage.setItem(WI_THEME_KEY, t);
      } catch(e){}
      var m = WI.getMeta();
      m.theme = t;
      WI.saveMeta(m);
      WI.applyWitcherTheme();
    },

    getMeta: function(){
      try {
        var raw = localStorage.getItem(WI_META_KEY);
        if(raw){
          var m = JSON.parse(raw);
          if(m && m.name) {
            if(!m.theme) m.theme = WI.getTheme();
            WI.meta = m;
            return m;
          }
        }
      } catch(e){}
      if(!WI.meta.theme) WI.meta.theme = WI.getTheme();
      return WI.meta;
    },

    saveMeta: function(meta){
      if(meta) WI.meta = meta;
      if(!WI.meta.theme) WI.meta.theme = WI.getTheme();
      try {
        localStorage.setItem(WI_META_KEY, JSON.stringify(WI.meta));
      } catch(e){}
    },

    toast: function(msg, type){
      if(typeof GHSync !== 'undefined' && GHSync.toast){
        GHSync.toast(msg, type);
        return;
      }
      var t = document.createElement('div');
      t.className = 'gh-sync-toast ' + (type || 'info') + ' show';
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(function(){
        t.classList.remove('show');
        setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 300);
      }, 3000);
    },

    buildWolfMedallionSvg: function(){
      return '<div class="wi-bg-medallion" aria-hidden="true">' +
        '<img src="symbols/Witcher/wolf_medallion.png?v=154" alt="" draggable="false" style="width:100%;height:100%;object-fit:contain;display:block;" />' +
      '</div>';
    },

    buildWildHuntEmblemSvg: function(){
      return '<div class="wi-bg-medallion wi-bg-medallion-hunt" aria-hidden="true">' +
        '<img src="symbols/Witcher/wild_hunt_crest.png?v=154" alt="" draggable="false" style="width:100%;height:100%;object-fit:contain;display:block;" />' +
      '</div>';
    },

    buildNorthernRealmsEmblemSvg: function(){
      return '<div class="wi-bg-north-banners" aria-hidden="true">' +
        '<div class="wi-bg-north-crest wi-bg-north-crest-tr">' +
          '<img src="symbols/Witcher/northern_realms_crest.png?v=155" alt="" draggable="false" />' +
        '</div>' +
        '<div class="wi-bg-north-crest wi-bg-north-crest-bl">' +
          '<img src="symbols/Witcher/northern_realms_crest.png?v=155" alt="" draggable="false" />' +
        '</div>' +
      '</div>';
    },

    buildNilfgaardEmblemSvg: function(){
      return '<div class="wi-bg-nilfgaard-wrap" aria-hidden="true">' +
        '<div class="wi-bg-nilfgaard-ring wi-bg-nilfgaard-ring-outer"></div>' +
        '<div class="wi-bg-nilfgaard-ring wi-bg-nilfgaard-ring-inner"></div>' +
        '<div class="wi-bg-nilfgaard-sun">' +
          '<img src="symbols/Witcher/nilfgaard_sun.png?v=156" alt="" draggable="false" />' +
        '</div>' +
      '</div>';
    },

    buildScoiataelEmblemSvg: function(){
      return '<div class="wi-bg-scoiatael-wrap" aria-hidden="true">' +
        '<div class="wi-bg-scoiatael-crest wi-bg-scoiatael-main">' +
          '<img src="symbols/Witcher/scoiatael_crest.png?v=160" alt="" draggable="false" />' +
        '</div>' +
        '<div class="wi-bg-scoiatael-crest wi-bg-scoiatael-corner">' +
          '<img src="symbols/Witcher/scoiatael_crest.png?v=160" alt="" draggable="false" />' +
        '</div>' +
      '</div>';
    },

    buildSkelligeEmblemSvg: function(){
      return '<div class="wi-bg-skellige-wrap" aria-hidden="true">' +
        '<div class="wi-bg-skellige-crest wi-bg-skellige-main">' +
          '<img src="symbols/Witcher/skellige_crest.png?v=161" alt="" draggable="false" />' +
        '</div>' +
        '<div class="wi-bg-skellige-crest wi-bg-skellige-corner">' +
          '<img src="symbols/Witcher/skellige_crest.png?v=161" alt="" draggable="false" />' +
        '</div>' +
      '</div>';
    },

    buildSyndicateEmblemSvg: function(){
      return '<div class="wi-bg-syndicate-wrap" aria-hidden="true">' +
        '<div class="wi-bg-syndicate-crest wi-bg-syndicate-main">' +
          '<img src="symbols/Witcher/syndicate_crest.png?v=162" alt="" draggable="false" />' +
        '</div>' +
        '<div class="wi-bg-syndicate-crest wi-bg-syndicate-corner">' +
          '<img src="symbols/Witcher/syndicate_crest.png?v=162" alt="" draggable="false" />' +
        '</div>' +
      '</div>';
    },

    buildOnyxDragonEmblemSvg: function(){
      return '<div class="wi-bg-dragon-wrap" aria-hidden="true">' +
        '<div class="wi-bg-dragon-crest">' +
          '<img src="symbols/Witcher/onyx_dragon_crest.png?v=165" alt="" draggable="false" />' +
        '</div>' +
      '</div>';
    },

    buildThemeFx: function(cont){
      if(!cont) return;
      cont.innerHTML = '';
      var theme = WI.getTheme();
      cont.setAttribute('data-wi-theme', theme);

      // 1. Фоновая геральдика активной темы
      var medallionWrap = document.createElement('div');
      if(theme === 'hunt'){
        medallionWrap.innerHTML = WI.buildWildHuntEmblemSvg();
      } else if(theme === 'north'){
        medallionWrap.innerHTML = WI.buildNorthernRealmsEmblemSvg();
      } else if(theme === 'nilfgaard'){
        medallionWrap.innerHTML = WI.buildNilfgaardEmblemSvg();
      } else if(theme === 'scoiatael'){
        medallionWrap.innerHTML = WI.buildScoiataelEmblemSvg();
      } else if(theme === 'skellige'){
        medallionWrap.innerHTML = WI.buildSkelligeEmblemSvg();
      } else if(theme === 'syndicate'){
        medallionWrap.innerHTML = WI.buildSyndicateEmblemSvg();
      } else if(theme === 'dragon'){
        medallionWrap.innerHTML = WI.buildOnyxDragonEmblemSvg();
      } else {
        medallionWrap.innerHTML = WI.buildWolfMedallionSvg();
      }
      cont.appendChild(medallionWrap.firstChild);

      // 2. Фоновые парящие знаки Ведьмаков (для всех тем кроме Ониксового Дракона, где летает пепельная пыль)
      var signContainer = document.createElement('div');
      signContainer.className = 'wi-bg-signs';

      var particleDefs = (theme === 'dragon') ? [] : [
        { type: 'aard', file: 'symbols/Witcher/Aard.png', top: 72, left: 12, dir: 'up-right', dur: 22, delay: -6 },
        { type: 'igni', file: 'symbols/Witcher/Igni.png', top: 18, left: 82, dir: 'down-left', dur: 24, delay: -14 },
        { type: 'quen', file: 'symbols/Witcher/Quen.png', top: 76, left: 78, dir: 'up-left', dur: 21, delay: -8 },
        { type: 'axii', file: 'symbols/Witcher/Axii.png', top: 22, left: 16, dir: 'down-right', dur: 25, delay: -17 },
        { type: 'aard', file: 'symbols/Witcher/Aard.png', top: 46, left: 74, dir: 'wave', dur: 23, delay: -11 },
        { type: 'igni', file: 'symbols/Witcher/Igni.png', top: 68, left: 32, dir: 'cross', dur: 22, delay: -19 },
        { type: 'quen', file: 'symbols/Witcher/Quen.png', top: 16, left: 46, dir: 'down-right', dur: 24, delay: -5 },
        { type: 'axii', file: 'symbols/Witcher/Axii.png', top: 80, left: 52, dir: 'up-left', dur: 23, delay: -13 }
      ];

      if (theme === 'nilfgaard') {
        particleDefs = particleDefs.concat([
          { type: 'sun', file: 'symbols/clans/sun.png', top: 64, left: 8, dir: 'up-right', dur: 40, delay: -5, size: 48 },
          { type: 'sun', file: 'symbols/clans/sun.png', top: 14, left: 88, dir: 'down-left', dur: 44, delay: -16, size: 44 },
          { type: 'sun', file: 'symbols/clans/sun.png', top: 82, left: 84, dir: 'up-left', dur: 38, delay: -24, size: 52 },
          { type: 'sun', file: 'symbols/clans/sun.png', top: 28, left: 22, dir: 'down-right', dur: 42, delay: -12, size: 42 },
          { type: 'sun', file: 'symbols/clans/sun.png', top: 52, left: 62, dir: 'wave', dur: 46, delay: -31, size: 46 },
          { type: 'sun', file: 'symbols/clans/sun.png', top: 75, left: 38, dir: 'cross', dur: 39, delay: -9, size: 50 }
        ]);
      } else if (theme === 'syndicate') {
        particleDefs = particleDefs.concat([
          { type: 'coin', file: 'symbols/Witcher/coin_crown.png?v=163', top: -6, left: 7, dir: 'coin-fall-right', dur: 20, delay: -2, size: 28 },
          { type: 'coin', file: 'symbols/Witcher/coin_floren.png?v=163', top: -6, left: 16, dir: 'coin-fall-left', dur: 24, delay: -11, size: 25 },
          { type: 'coin', file: 'symbols/Witcher/coin_oren.png?v=163', top: -6, left: 25, dir: 'coin-fall-right', dur: 19, delay: -6, size: 26 },
          { type: 'coin', file: 'symbols/Witcher/coin_ducat.png?v=163', top: -6, left: 34, dir: 'coin-fall-left', dur: 23, delay: -17, size: 30 },
          { type: 'coin', file: 'symbols/Witcher/coin_crown.png?v=163', top: -6, left: 43, dir: 'coin-fall-right', dur: 21, delay: -9, size: 24 },
          { type: 'coin', file: 'symbols/Witcher/coin_floren.png?v=163', top: -6, left: 53, dir: 'coin-fall-left', dur: 25, delay: -14, size: 29 },
          { type: 'coin', file: 'symbols/Witcher/coin_oren.png?v=163', top: -6, left: 62, dir: 'coin-fall-right', dur: 18, delay: -4, size: 27 },
          { type: 'coin', file: 'symbols/Witcher/coin_ducat.png?v=163', top: -6, left: 71, dir: 'coin-fall-left', dur: 22, delay: -19, size: 25 },
          { type: 'coin', file: 'symbols/Witcher/coin_crown.png?v=163', top: -6, left: 80, dir: 'coin-fall-right', dur: 26, delay: -8, size: 31 },
          { type: 'coin', file: 'symbols/Witcher/coin_floren.png?v=163', top: -6, left: 88, dir: 'coin-fall-left', dur: 20, delay: -15, size: 26 },
          { type: 'coin', file: 'symbols/Witcher/coin_oren.png?v=163', top: -6, left: 94, dir: 'coin-fall-left', dur: 23, delay: -21, size: 28 },
          { type: 'coin', file: 'symbols/Witcher/coin_ducat.png?v=163', top: -6, left: 12, dir: 'coin-fall-right', dur: 27, delay: -23, size: 24 }
        ]);
      }

      if (theme === 'dragon') {
        var dustDirs = ['up-right', 'up-left', 'down-right', 'down-left', 'cross', 'wave'];
        var dustCount = 42;
        for (var d = 0; d < dustCount; d++) {
          var mote = document.createElement('div');
          var dir = dustDirs[d % dustDirs.length];
          mote.className = 'wi-sign-particle wi-dragon-dust wi-dir-' + dir;
          var dSize = (Math.random() * 3.8 + 1.6).toFixed(1);
          var dTop = (Math.random() * 90 + 5).toFixed(1);
          var dLeft = (Math.random() * 94 + 3).toFixed(1);
          var dDur = (Math.random() * 18 + 16).toFixed(1);
          var dDelay = (-Math.random() * 32).toFixed(1);
          mote.style.width = dSize + 'px';
          mote.style.height = dSize + 'px';
          mote.style.top = dTop + '%';
          mote.style.left = dLeft + '%';
          mote.style.animationDuration = dDur + 's';
          mote.style.animationDelay = dDelay + 's';
          if (d % 3 === 0) {
            mote.style.background = '#e4e4e7';
            mote.style.boxShadow = '0 0 6px rgba(228, 228, 231, 0.55)';
          } else if (d % 3 === 1) {
            mote.style.background = '#a1a1aa';
            mote.style.boxShadow = '0 0 5px rgba(161, 161, 170, 0.45)';
          } else {
            mote.style.background = '#71717a';
            mote.style.boxShadow = '0 0 4px rgba(113, 113, 122, 0.38)';
          }
          signContainer.appendChild(mote);
        }
      }

      for (var s = 0; s < particleDefs.length; s++) {
        var p = particleDefs[s];
        var img = document.createElement('img');
        img.className = 'wi-sign-particle wi-sign-' + p.type + ' wi-dir-' + p.dir;
        img.src = p.file;
        img.alt = p.type;
        img.draggable = false;

        var size = p.size || ((s % 2 === 0) ? 26 : 24);
        img.style.width = size + 'px';
        img.style.height = 'auto';
        img.style.top = p.top + '%';
        img.style.left = p.left + '%';
        img.style.animationDuration = p.dur + 's';
        img.style.animationDelay = p.delay + 's';

        signContainer.appendChild(img);
      }
      cont.appendChild(signContainer);

      // 3. Слои тумана / вьюги Белого Хлада
      var mist1 = document.createElement('div');
      mist1.className = 'wi-mist-layer';
      cont.appendChild(mist1);

      var mist2 = document.createElement('div');
      mist2.className = 'wi-mist-layer wi-mist-layer-2';
      cont.appendChild(mist2);

      // 4. Парящие частицы темы
      var emberCount = 26;
      for(var i = 0; i < emberCount; i++){
        var ember = document.createElement('div');
        ember.className = (theme === 'hunt') ? 'wi-ember wi-frost-shard' : 'wi-ember';
        var size = (Math.random() * 3.5 + 2).toFixed(1);
        var left = (Math.random() * 100).toFixed(1);
        var dur = (Math.random() * 7 + 6).toFixed(1);
        var delay = (-Math.random() * 14).toFixed(1);
        ember.style.width = size + 'px';
        ember.style.height = size + 'px';
        ember.style.left = left + '%';
        ember.style.animationDuration = dur + 's';
        ember.style.animationDelay = delay + 's';
        if(theme === 'hunt'){
          if(Math.random() > 0.5){
            ember.style.background = '#e0f2fe';
            ember.style.boxShadow = '0 0 10px #38bdf8, 0 0 20px rgba(129, 140, 248, 0.9)';
          } else {
            ember.style.background = '#38bdf8';
            ember.style.boxShadow = '0 0 8px #0284c7, 0 0 16px rgba(56, 189, 248, 0.85)';
          }
        } else if(theme === 'north'){
          if(Math.random() > 0.45){
            ember.style.background = '#f8fafc';
            ember.style.boxShadow = '0 0 9px #cbd5e1, 0 0 18px rgba(147, 197, 253, 0.85)';
          } else {
            ember.style.background = '#93c5fd';
            ember.style.boxShadow = '0 0 9px #3b82f6, 0 0 18px rgba(59, 130, 246, 0.85)';
          }
        } else if(theme === 'nilfgaard'){
          if(Math.random() > 0.4){
            ember.style.background = '#fef08a';
            ember.style.boxShadow = '0 0 10px #eab308, 0 0 20px rgba(250, 204, 21, 0.85)';
          } else {
            ember.style.background = '#eab308';
            ember.style.boxShadow = '0 0 8px #ca8a04, 0 0 16px rgba(234, 179, 8, 0.75)';
          }
        } else if(theme === 'scoiatael'){
          if(Math.random() > 0.4){
            ember.style.background = '#6ee7b7';
            ember.style.boxShadow = '0 0 10px #10b981, 0 0 20px rgba(52, 211, 153, 0.85)';
          } else {
            ember.style.background = '#fcd34d';
            ember.style.boxShadow = '0 0 9px #d97706, 0 0 18px rgba(245, 158, 11, 0.8)';
          }
        } else if(theme === 'skellige'){
          if(Math.random() > 0.45){
            ember.style.background = '#5eead4';
            ember.style.boxShadow = '0 0 10px #14b8a6, 0 0 18px rgba(45, 212, 191, 0.85)';
          } else {
            ember.style.background = '#fbbf24';
            ember.style.boxShadow = '0 0 9px #d97706, 0 0 18px rgba(217, 119, 6, 0.85)';
          }
        } else if(theme === 'syndicate'){
          if(Math.random() > 0.35){
            ember.style.background = '#fde047';
            ember.style.boxShadow = '0 0 10px #f59e0b, 0 0 20px rgba(251, 191, 36, 0.9)';
          } else {
            ember.style.background = '#f87171';
            ember.style.boxShadow = '0 0 9px #dc2626, 0 0 18px rgba(220, 38, 38, 0.85)';
          }
        } else if(theme === 'dragon'){
          if(Math.random() > 0.45){
            ember.style.background = '#e4e4e7';
            ember.style.boxShadow = '0 0 9px #a1a1aa, 0 0 18px rgba(212, 212, 216, 0.75)';
          } else {
            ember.style.background = '#71717a';
            ember.style.boxShadow = '0 0 8px #52525b, 0 0 16px rgba(161, 161, 170, 0.65)';
          }
        } else if(Math.random() > 0.6){
          ember.style.background = '#ff4500';
          ember.style.boxShadow = '0 0 10px #ff0000, 0 0 18px rgba(255, 69, 0, 0.9)';
        }
        cont.appendChild(ember);
      }
    },

    initWitcherFx: function(){
      if(typeof document === 'undefined' || !document.body) return;
      var cont = document.getElementById('wiThemeFx');
      if(!cont){
        cont = document.createElement('div');
        cont.id = 'wiThemeFx';
        cont.setAttribute('aria-hidden', 'true');
        document.body.insertBefore(cont, document.body.firstChild);
      }
      var curTheme = WI.getTheme();
      if(cont.children.length === 0 || !cont.querySelector('.wi-sign-particle') || cont.getAttribute('data-wi-theme') !== curTheme){
        WI.buildThemeFx(cont);
      }
      cont.style.display = 'block';
    },

    applyWitcherTheme: function(){
      if(typeof document === 'undefined' || !document.body) return;
      var fx = document.getElementById('wiThemeFx');
      if(typeof HB === 'undefined' || HB.mode !== 'wi'){
        document.body.classList.remove('wi-theme');
        WI.THEMES.forEach(function(t){
          document.body.classList.remove('wi-theme-' + t.id);
        });
        if(fx) fx.style.display = 'none';
        return;
      }
      var curTheme = WI.getTheme();
      document.body.classList.add('wi-theme');
      WI.THEMES.forEach(function(t){
        document.body.classList.toggle('wi-theme-' + t.id, curTheme === t.id);
      });
      WI.initWitcherFx();
    }
  };

  function esc(s){ var str = String(s == null ? '' : s); return typeof escapeHtml === 'function' ? escapeHtml(str) : str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function escA(s){ var str = String(s == null ? '' : s); return typeof escapeAttr === 'function' ? escapeAttr(str) : str.replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }

  function getSchoolIcon(school){
    if(!school || school === 'Без школы' || school === 'Не ведьмак') return '👤';
    if(school.indexOf('Чародей') !== -1 || school.indexOf('Маг') !== -1) return '🔮';
    if(school.indexOf('Рыцар') !== -1 || school.indexOf('Воин') !== -1) return '🛡️';
    if(school.indexOf('Следопыт') !== -1 || school.indexOf('Лучник') !== -1) return '🏹';
    if(school.indexOf('Бард') !== -1) return '🪕';
    if(school.indexOf('Краснолюд') !== -1 || school.indexOf('Наёмник') !== -1) return '🪓';
    if(school.indexOf('Кот') !== -1) return '🐱';
    if(school.indexOf('Грифон') !== -1) return '🦅';
    if(school.indexOf('Медвед') !== -1) return '🐻';
    if(school.indexOf('Зме') !== -1) return '🐍';
    if(school.indexOf('Мантикор') !== -1) return '🦂';
    if(school.indexOf('Журавл') !== -1) return '🪶';
    if(school.indexOf('Волк') !== -1) return '🐺';
    return '⚔️';
  }

  function crumbWi(parts){
    return '<div class="crumb">' + parts.map(function(p, i){
      var last = i === parts.length - 1;
      var onclickAttr = p.nav ? ' onclick="if(typeof window.navigate===\'function\') window.navigate(\'' + escA(p.nav) + '\');"' : '';
      return (i > 0 ? '<span class="sep">/</span>' : '') + '<span class="seg ' + (last ? 'current' : '') + '" data-nav="' + escA(p.nav || '') + '"' + onclickAttr + '>' + esc(p.label) + '</span>';
    }).join('') + '</div>';
  }

  function fld(l, inner, hint){
    return '<div class="field"><label>' + esc(l) + (hint ? '<span class="hint">' + esc(hint) + '</span>' : '') + '</label>' + inner + '</div>';
  }

  /* Главный экран раздела Ведьмак */
  function wiHome(){
    var p = WI.getProfile();
    var scIcon = getSchoolIcon(p.school);

    var schoolBadge = '';
    if(p.school && p.school !== 'Без школы' && p.school !== 'Не ведьмак'){
      schoolBadge = '<span class="wi-school-badge">' + scIcon + ' ' + esc(p.school) + '</span>';
    } else {
      schoolBadge = '<span class="wi-school-badge non-witcher" style="background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.15);color:#cbd5e1;">👤 ' + esc(p.school || 'Без школы') + '</span>';
    }

    var charDisplayName = p.name ? esc(p.name) : 'Новый персонаж';
    var charDisplayTitle = p.title ? esc(p.title) : (p.school ? 'Мастер меча и знаков' : 'Искатель приключений');

    // Экран профиля (HUD)
    var hud = '<div class="wi-hud">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">' +
        '<div>' +
          '<div class="wi-title">' + scIcon + ' ' + charDisplayName + '</div>' +
          '<div style="font-family:\'EB Garamond\',serif;font-style:italic;color:#94a3b8;font-size:14px;margin-top:2px;">' +
            charDisplayTitle +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
          schoolBadge +
          '<span class="wi-stat-badge">Ур. ' + p.level + '</span>' +
          '<span class="wi-stat-badge hp">❤️ ХП ' + p.hp + '</span>' +
          '<span class="wi-stat-badge ac">🛡️ КБ ' + p.ac + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';

    var rule = '<div class="wi-rule"></div>';

    // 1. Раздел броска кубиков (кликабельный)
    var heroDice = '<div class="wi-hero-dice" data-go="dice" onclick="if(typeof window.navigate===\'function\') window.navigate(\'dice\');" role="button" tabindex="0" title="Открыть бросок костей">' +
      '<div class="wi-hero-dice-icon">' +
        (typeof dieShapeSvg === 'function' ? dieShapeSvg(20, 'wiHeroDie', 20) : '🎲') +
      '</div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="wi-hero-dice-title">Бросок костей</div>' +
        '<div class="wi-hero-dice-desc">Кубики d4–d100, знаки Аард, Игни, Квен, Аксий, Ирден, атаки стальным и серебряным клинком</div>' +
      '</div>' +
      '<div class="wi-hero-dice-arrow">→</div>' +
    '</div>';

    // Разделитель перед разделами
    var label = '<div class="section-label">СИСТЕМНЫЕ РАЗДЕЛЫ // ВЕДЬМАК</div>';

    // Системные разделы: Способности, Приёмы, Карта мира, Справочник, AI Генератор и Данные
    var sectionsList = '<div class="menu-list grid-2">' +
      '<div class="wi-card wi-card-clickable" data-nav="wiTechs" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechs\');" role="button" tabindex="0" title="Открыть Способности">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wi-card-title"><span>✨</span> Способности</div>' +
          '<div class="wi-card-desc">Знаки ведьмаков, магия Хаоса, врождённые дары, мутации и чародейство</div>' +
        '</div>' +
        '<div class="wi-card-arrow">›</div>' +
      '</div>' +
      '<div class="wi-card wi-card-clickable" data-nav="wiMoves" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoves\');" role="button" tabindex="0" title="Открыть Боевые приёмы">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wi-card-title"><span>⚔️</span> Боевые приёмы</div>' +
          '<div class="wi-card-desc">Стили фехтования, пируэты, парирование, тактические маневры и рипост</div>' +
        '</div>' +
        '<div class="wi-card-arrow">›</div>' +
      '</div>' +
      '<div class="wi-card wi-card-clickable" data-nav="wiGames" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiGames\');" role="button" tabindex="0" title="Открыть Игровой хаб">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wi-card-title"><span>🎲</span> Игровой хаб</div>' +
          '<div class="wi-card-desc">Корчмарские забавы: карточный Гвинт со всеми фракциями и Покер на костях (5d6)</div>' +
        '</div>' +
        '<div class="wi-card-arrow">›</div>' +
      '</div>' +
      '<div class="wi-card wi-card-clickable" data-nav="wiMap" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMap\');" role="button" tabindex="0" title="Открыть Карту Континента">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wi-card-title"><span>🗺️</span> Карта мира</div>' +
          '<div class="wi-card-desc">Интерактивный атлас Континента, королевства, маршруты и калькулятор переходов</div>' +
        '</div>' +
        '<div class="wi-card-arrow">›</div>' +
      '</div>' +
      '<div class="wi-card wi-card-clickable" data-nav="wiRef" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiRef\');" role="button" tabindex="0" title="Открыть Справочник Континента">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wi-card-title"><span>📚</span> Справочник Континента</div>' +
          '<div class="wi-card-desc">Знаки, 7 ведьмачьих школ, алхимия, масла, бестиарий чудовищ, фехтование и лор</div>' +
        '</div>' +
        '<div class="wi-card-arrow">›</div>' +
      '</div>' +
      '<div class="wi-card wi-card-clickable" data-nav="wiData" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiData\');" role="button" tabindex="0" title="Открыть Данные и Ростер">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wi-card-title"><span>💾</span> Данные и Ростер</div>' +
          '<div class="wi-card-desc">Профиль персонажа, происхождение/школа, сталь и серебро, экипировка и экспорт</div>' +
        '</div>' +
        '<div class="wi-card-arrow">›</div>' +
      '</div>' +
    '</div>';

    return hud + rule + heroDice + label + sectionsList;
  }

  /* ============================================================
     ИГРОВОЙ ХАБ ВЕДЬМАКА (ГВИНТ И ПОКЕР НА КОСТЯХ)
     ============================================================ */

  function wiGames(){
    var crumb = crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Игровой хаб' }]);
    var backBtn = '<button class="back" data-nav="wiHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiHome\');">← Назад</button>';

    var tavernEmblemSvg = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M8 6l9 10 7-5 7 5 9-10-3 17 5 7-9 4-9 8-9-8-9-4 5-7-3-17z" stroke="#f59e0b" fill="rgba(245,158,11,0.12)"/>' +
      '<path d="M18 25l4 3m8-3l-4 3" stroke="#fbbf24" stroke-width="2"/>' +
      '<path d="M21 33h6" stroke="#fde68a"/>' +
    '</svg>';

    var tankardSvg = '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M9 13h14v15a3 3 0 01-3 3H12a3 3 0 01-3-3V13z" fill="rgba(245,158,11,0.14)" stroke="#f59e0b"/>' +
      '<path d="M23 15h3.5a2.5 2.5 0 012.5 2.5v5a2.5 2.5 0 01-2.5 2.5H23" stroke="#fbbf24"/>' +
      '<path d="M8 11c0-2 2-3.5 4.2-3 .8-2 3.8-2.5 5.3-.7 1.7-1.2 4.5-.2 4.5 1.9 1.5.3 2.5 1.5 2 2.8H8z" fill="rgba(254,243,199,0.22)" stroke="#fde68a"/>' +
      '<line x1="13" y1="17" x2="13" y2="27" stroke="rgba(251,191,36,0.55)"/>' +
      '<line x1="19" y1="17" x2="19" y2="27" stroke="rgba(251,191,36,0.55)"/>' +
    '</svg>';

    var gwentEmblemSvg = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="9" y="8" width="20" height="28" rx="3" transform="rotate(-8 9 8)" fill="rgba(185,28,28,0.22)" stroke="#f87171"/>' +
      '<rect x="19" y="8" width="20" height="28" rx="3" transform="rotate(8 19 8)" fill="rgba(20,26,36,0.92)" stroke="#fbbf24"/>' +
      '<path d="M24 16l3.2 5.4 5.8 1.2-4 4.3.8 5.9-5.8-2.6-5.8 2.6.8-5.9-4-4.3 5.8-1.2L24 16z" fill="rgba(245,158,11,0.28)" stroke="#ffd700"/>' +
    '</svg>';

    var pokerEmblemSvg = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="7" y="13" width="21" height="21" rx="4" transform="rotate(-10 7 13)" fill="rgba(16,185,129,0.18)" stroke="#34d399"/>' +
      '<rect x="20" y="14" width="21" height="21" rx="4" transform="rotate(8 20 14)" fill="rgba(20,26,36,0.92)" stroke="#fbbf24"/>' +
      '<circle cx="26.5" cy="20.5" r="1.5" fill="#ffd700" stroke="none"/>' +
      '<circle cx="34.5" cy="20.5" r="1.5" fill="#ffd700" stroke="none"/>' +
      '<circle cx="30.5" cy="24.5" r="1.5" fill="#ffd700" stroke="none"/>' +
      '<circle cx="26.5" cy="28.5" r="1.5" fill="#ffd700" stroke="none"/>' +
      '<circle cx="34.5" cy="28.5" r="1.5" fill="#ffd700" stroke="none"/>' +
      '<circle cx="15" cy="20" r="1.4" fill="#6ee7b7" stroke="none"/>' +
      '<circle cx="12" cy="26" r="1.4" fill="#6ee7b7" stroke="none"/>' +
    '</svg>';

    var hud = '<div class="wi-hud wi-tavern-hud">' +
      '<div class="wi-tavern-hud-top">' +
        '<div class="wi-tavern-brand">' +
          '<div class="wi-tavern-emblem">' + tavernEmblemSvg + '</div>' +
          '<div>' +
            '<div class="wi-title">Игровой хаб корчмы «На распутье»</div>' +
            '<div class="wi-tavern-sub">Традиционные корчмарские забавы Континента: карточный Гвинт со всеми фракциями и азартный покер на костях (5d6).</div>' +
          '</div>' +
        '</div>' +
        '<div class="wi-tavern-actions">' +
          '<span class="wi-school-badge">🐺 Корчмы Континента</span>' +
          '<a href="games/index.html" class="wi-hub-ext-btn" target="_blank" title="Открыть отдельный полноэкранный хаб игр в новой вкладке">' +
            '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
            '<span>Отдельный хаб</span>' +
          '</a>' +
        '</div>' +
      '</div>' +
      '<div class="wi-tavern-quote">' +
        '<div class="wi-tavern-quote-icon">' + tankardSvg + '</div>' +
        '<div class="wi-tavern-quote-text">' +
          '«Когда монстры повержены, трофеи сданы старосте, а серебряный клинок покоится за спиной — корчма распахивает двери. Садитесь к очагу, закажите кружку махакамского эля и испытайте удачу в Гвинт или бросьте кости на орены!»' +
        '</div>' +
      '</div>' +
    '</div>';

    var rule = '<div class="wi-rule"></div>';
    var sectionLabel = '<div class="section-label">ИГРОВЫЕ ЗАЛЫ КОРЧМЫ // ВЫБЕРИТЕ СТОЛ</div>';

    var gamesGrid = '<div class="wi-games-grid">' +
      // Карточка 1: ГВИНТ
      '<div class="wi-game-card wi-game-gwent">' +
        '<div>' +
          '<div class="wi-game-card-header">' +
            '<div class="wi-game-emblem gwent-emblem">' + gwentEmblemSvg + '</div>' +
            '<div style="flex:1;min-width:0;">' +
              '<div class="wi-game-title-row">' +
                '<div class="wi-game-card-title">Гвинт (Gwent)</div>' +
                '<span class="wi-game-tier-pill gwent-pill">522 КАРТЫ</span>' +
              '</div>' +
              '<div class="wi-game-card-sub">Карточная дуэль армий, героев и лидеров</div>' +
            '</div>' +
          '</div>' +
          '<div class="wi-game-badges">' +
            '<span class="wi-game-badge highlight">TW3 + DLC + Standalone</span>' +
            '<span class="wi-game-badge">6 фракций + Синдикат</span>' +
            '<span class="wi-game-badge">27 лидеров</span>' +
            '<span class="wi-game-badge">Автосбор и фильтры</span>' +
            '<span class="wi-game-badge">Хроника для ДМа</span>' +
          '</div>' +
          '<div class="wi-game-desc">' +
            'Полноценная игра в Гвинт со всеми колодами «Ведьмака 3» («Каменные сердца», «Кровь и вино») и расширенной коллекцией <b>Gwent Standalone (522 карты)</b>, шестой фракцией «Синдикат», фильтрами рядов, живым поиском, автосбором колоды и тактическим ИИ.' +
          '</div>' +
          '<ul class="wi-game-feature-list">' +
            '<li>Три ряда боя (рукопашный, дальнобойный, осадный), погода и специальные карты</li>' +
            '<li>27 уникальных способностей лидеров, пассивные бонусы 6 фракций и золотые герои</li>' +
            '<li>Удобный конструктор колоды: поиск, фильтрация по рядам, автосбор, импорт/экспорт JSON</li>' +
            '<li>Готовый отчёт партии в один клик для вставки в хронику ДМа</li>' +
          '</ul>' +
        '</div>' +
        '<div class="wi-game-actions">' +
          '<button class="wi-launch-game-btn gwent-btn" data-game-url="games/gwent/index.html" data-game-title="Гвинт (Gwent: The Witcher Card Game)">' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/><path d="M14.5 6.5L18 3h3v3l-3.5 3.5"/><path d="M5 14l4 4"/><path d="M7 17l-3 3"/><path d="M3 19l2 2"/></svg>' +
            '<span>Сесть за стол в Гвинт</span>' +
          '</button>' +
          '<a href="games/gwent/index.html" class="wi-open-tab-btn" target="_blank" title="Открыть Гвинт в отдельной вкладке браузера">' +
            '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><polyline points="7 7 17 7 17 17"/></svg>' +
            '<span>Открыть в новой вкладке</span>' +
          '</a>' +
        '</div>' +
      '</div>' +

      // Карточка 2: ПОКЕР НА КОСТЯХ
      '<div class="wi-game-card wi-game-poker">' +
        '<div>' +
          '<div class="wi-game-card-header">' +
            '<div class="wi-game-emblem poker-emblem">' + pokerEmblemSvg + '</div>' +
            '<div style="flex:1;min-width:0;">' +
              '<div class="wi-game-title-row">' +
                '<div class="wi-game-card-title">Покер на костях (5d6)</div>' +
                '<span class="wi-game-tier-pill poker-pill">5D6 СТАВКИ</span>' +
              '</div>' +
              '<div class="wi-game-card-sub">Традиционная игра корчмарей, купцов и шулеров</div>' +
            '</div>' +
          '</div>' +
          '<div class="wi-game-badges">' +
            '<span class="wi-game-badge highlight">Система 5d6</span>' +
            '<span class="wi-game-badge highlight">Ставки на орены</span>' +
            '<span class="wi-game-badge">3 уровня достатка</span>' +
            '<span class="wi-game-badge">3 сложности ИИ</span>' +
            '<span class="wi-game-badge">Честный рандом</span>' +
            '<span class="wi-game-badge">Хроника для ДМа</span>' +
          '</div>' +
          '<div class="wi-game-desc">' +
            'Классический покер на пяти костях из «Ведьмака 1 и 2». Бросайте кости, выбирайте какие грани зафиксировать для второго броска, поднимайте банк в оренах, блефуйте и собирайте покер и стриты против горожан и богатых купцов.' +
          '</div>' +
          '<ul class="wi-game-feature-list">' +
            '<li>Уровни соперника: Бедный (5 оренов), Горожанин (20 оренов), Богатый купец (50 оренов)</li>' +
            '<li>Интеллект ИИ: Низкий (ошибается), Средний (стандарт), Мастер (расчёт аутов и блефа)</li>' +
            '<li>Комбинации от Пары и Фулл-хауса до Пяти одинаковых (Покер) с анимацией бросков</li>' +
            '<li>Аутентичные звуковые эффекты костей и деревянного стаканчика + лог для ДМа</li>' +
          '</ul>' +
        '</div>' +
        '<div class="wi-game-actions">' +
          '<button class="wi-launch-game-btn poker-btn" data-game-url="games/dice_poker/index.html" data-game-title="Покер на костях (5d6 Dice Poker)">' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3.5"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/></svg>' +
            '<span>Бросить кости на орены</span>' +
          '</button>' +
          '<a href="games/dice_poker/index.html" class="wi-open-tab-btn" target="_blank" title="Открыть Покер на костях в отдельной вкладке браузера">' +
            '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><polyline points="7 7 17 7 17 17"/></svg>' +
            '<span>Открыть в новой вкладке</span>' +
          '</a>' +
        '</div>' +
      '</div>' +
    '</div>';

    return crumb + backBtn + hud + rule + sectionLabel + gamesGrid;
  }

  function wireWiGames(){
    wireWiNav();

    document.querySelectorAll('.wi-launch-game-btn').forEach(function(btn){
      btn.addEventListener('click', function(e){
        var url = btn.getAttribute('data-game-url');
        var title = btn.getAttribute('data-game-title') || 'Игра';
        if(url){
          openWiGameModal(url, title);
        }
      });
    });

    if(!window._wiGameModalListenerAdded){
      window._wiGameModalListenerAdded = true;
      window.addEventListener('message', function(e){
        if(!e || !e.data) return;
        var action = (typeof e.data === 'string') ? e.data : e.data.action;
        var targetScreen = (e.data && e.data.screen) ? e.data.screen : null;

        if(action === 'closeWiGameModal' || action === 'compendium-back' || action === 'nav'){
          var m = document.getElementById('wiGameModal');
          if(m && m.parentNode) m.parentNode.removeChild(m);
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';

          if(typeof nav === 'function'){
            if(typeof HB !== 'undefined') HB.mode = 'wi';
            if(targetScreen){
              nav(targetScreen);
            } else {
              nav('wiGames');
            }
          }
        }
      });
    }
  }

  function openWiGameModal(url, title){
    var old = document.getElementById('wiGameModal');
    if(old && old.parentNode) old.parentNode.removeChild(old);

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    var modal = document.createElement('div');
    modal.id = 'wiGameModal';
    modal.className = 'wi-game-modal-overlay';
    modal.style.cssText = 'position:fixed;inset:0;background:#000;z-index:100000;display:flex;width:100%;height:100%;overflow:hidden;';
    modal.innerHTML = 
      '<iframe src="' + url + '" class="wi-game-modal-iframe" scrolling="no" style="width:100%;height:100%;border:none;background:#000;overflow:hidden;" allow="fullscreen; autoplay" allowfullscreen></iframe>';

    document.body.appendChild(modal);

    function onEsc(e){
      if(e.key === 'Escape' && !document.fullscreenElement){
        if(modal && modal.parentNode) modal.parentNode.removeChild(modal);
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onEsc);
      }
    }
    window.addEventListener('keydown', onEsc);
  }

  /* Экран Данные и Ростер Ведьмака */
  function wiData(){
    var profList = WI.profiles || [];
    if(!profList.length){
      WI.loadProfiles();
      profList = WI.profiles || [];
    }
    var p = WI.getActiveProfile();
    var meta = WI.getMeta();

    var schoolList = [
      { k: '', icon: '👤', label: 'Без школы (Не ведьмак / Обычный смертный)' },
      { k: 'Школа Волка', icon: '🐺', label: 'Школа Волка' },
      { k: 'Школа Кота', icon: '🐱', label: 'Школа Кота' },
      { k: 'Школа Грифона', icon: '🦅', label: 'Школа Грифона' },
      { k: 'Школа Медведя', icon: '🐻', label: 'Школа Медведя' },
      { k: 'Школа Змеи', icon: '🐍', label: 'Школа Змеи' },
      { k: 'Школа Мантикоры', icon: '🦂', label: 'Школа Мантикоры' },
      { k: 'Школа Журавля', icon: '🪶', label: 'Школа Журавля' },
      { k: 'Чародей / Чародейка', icon: '🔮', label: 'Чародей / Чародейка (Магия Хаоса)' },
      { k: 'Рыцарь / Воин', icon: '🛡️', label: 'Рыцарь / Воин (Тяжелые латы)' },
      { k: 'Следопыт / Лучник', icon: '🏹', label: 'Следопыт / Лучник (Скоя\'таэли)' },
      { k: 'Бард / Учёный', icon: '🪕', label: 'Бард / Учёный (Острословие и сказания)' },
      { k: 'Краснолюд / Наёмник', icon: '🪓', label: 'Краснолюд / Наёмник (Секира)' }
    ];

    var profOptions = profList.map(function(item){
      var scIcon = getSchoolIcon(item.school);
      var scLabel = item.school ? (' • ' + item.school) : ' • Без школы';
      var pTitle = scIcon + ' ' + (item.name || 'Безымянный персонаж') + scLabel + ' (Ур. ' + (item.level || 1) + ')';
      return '<option value="' + escA(item.id) + '" ' + (item.id === WI.activeProfileId ? 'selected' : '') + '>' + esc(pTitle) + '</option>';
    }).join('');

    var schoolOptions = schoolList.map(function(sc){
      return '<option value="' + escA(sc.k) + '" ' + ((p.school || '') === sc.k ? 'selected' : '') + '>' + sc.icon + ' ' + esc(sc.label || sc.k) + '</option>';
    }).join('');
    if(p.school && !schoolList.some(function(sc){ return sc.k === p.school; })){
      schoolOptions = '<option value="' + escA(p.school) + '" selected>👤 ' + esc(p.school) + '</option>' + schoolOptions;
    }

    var schoolIcon = getSchoolIcon(p.school);
    var curTheme = WI.getTheme();
    var activeThemeObj = WI.THEMES.find(function(t){ return t.id === curTheme; }) || WI.THEMES[0];

    var themeChipsHtml = WI.THEMES.map(function(t){
      var isAct = (t.id === curTheme);
      return '<button type="button" class="wi-theme-option-card wi-theme-card-' + escA(t.id) + (isAct ? ' active' : '') + '" data-wi-theme-pick="' + escA(t.id) + '" style="--wi-chip-accent:' + escA(t.accent) + ';--wi-chip-glow:' + escA(t.glow) + ';">' +
        '<span class="wi-theme-card-icon"><img src="' + escA(t.icon) + '" alt="" draggable="false" /></span>' +
        '<span class="wi-theme-card-info">' +
          '<span class="wi-theme-card-title">' + esc(t.title) + '</span>' +
          '<span class="wi-theme-card-sub">' + esc(t.sub) + '</span>' +
        '</span>' +
        '<span class="wi-theme-card-dot">' + (isAct ? '✓' : '') + '</span>' +
      '</button>';
    }).join('');

    return crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Данные' }]) +
      '<button class="back" data-nav="wiHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiHome\');">← Назад</button>' +
      '<h1>Данные и Ростер Персонажей</h1>' +

      '<div class="sheet-section wi-data-section wi-theme-section-compact">' +
        '<div class="section-label" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:8px;">' +
          '<span>🎨 Тема раздела</span>' +
          '<span style="font-size:11.5px;color:var(--wi-amber, #f59e0b);font-weight:700;">' + esc(activeThemeObj.title) + '</span>' +
        '</div>' +
        '<div class="wi-theme-picker-grid">' +
          themeChipsHtml +
        '</div>' +
      '</div>' +

      '<div class="sheet-section wi-data-section">' +
        '<div class="section-label" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
          '<span>👥 Выбор и управление персонажами</span>' +
          '<span style="font-size:12px;color:var(--wi-steel, #94a3b8);">Всего профилей: ' + profList.length + '</span>' +
        '</div>' +
        '<div class="desc">' +
          'Выберите активного персонажа (ведьмака, чародея, воина, следопыта или барда) или создайте нового. Характеристики, оружие, броня, инвентарь и заметки сохраняются индивидуально для каждого жителя Континента.' +
        '</div>' +

        '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin:14px 0 12px 0;">' +
          '<div style="flex:1;min-width:240px;">' +
            '<label style="display:block;font-size:12px;color:var(--wi-steel, #94a3b8);margin-bottom:4px;font-weight:600;">Активный персонаж (переключение на лету):</label>' +
            '<select id="wiDataProfileSelect" class="wi-hud-profile-sel" style="width:100%;font-size:14px;padding:9px 12px;border-radius:4px;">' +
              profOptions +
            '</select>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" id="wiDataNewProfileBtn" title="Создать нового персонажа">➕ Новый персонаж</button>' +
            '<button class="btn" id="wiDataCloneProfileBtn" title="Клонировать текущего персонажа">📋 Дублировать</button>' +
          '</div>' +
        '</div>' +

        '<div class="wi-char-sheet-card">' +
          '<div class="wi-char-header">' +
            '<span>Анкета персонажа: <b style="color:var(--wi-amber, #f59e0b);">' + schoolIcon + ' ' + esc(p.name || 'Новый персонаж') + '</b></span>' +
            (p.school ? ('<span class="wi-school-badge" style="font-size:11px;">' + schoolIcon + ' ' + esc(p.school) + '</span>') : '<span class="wi-school-badge non-witcher" style="font-size:11px;background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.15);color:#cbd5e1;">👤 Без школы</span>') +
          '</div>' +

          '<div class="wi-edit-grid">' +
            '<div class="wi-edit-item">' +
              '<label>Имя персонажа</label>' +
              '<input type="text" id="wiDataInName" class="wi-input" value="' + escA(p.name || '') + '" placeholder="Имя персонажа">' +
            '</div>' +
            '<div class="wi-edit-item">' +
              '<label>Школа / Класс / Происхождение <span class="hint" style="color:var(--wi-steel);font-weight:normal;">(необязательно)</span></label>' +
              '<select id="wiDataInSchool" class="wi-input">' + schoolOptions + '</select>' +
            '</div>' +
            '<div class="wi-edit-item">' +
              '<label>Титул / Прозвище / Роль</label>' +
              '<input type="text" id="wiDataInTitle" class="wi-input" value="' + escA(p.title || '') + '" placeholder="Титул, прозвище или класс">' +
            '</div>' +
            '<div class="wi-edit-item">' +
              '<label>Уровень</label>' +
              '<input type="number" min="1" max="100" id="wiDataInLevel" class="wi-input" value="' + escA(p.level != null ? p.level : '1') + '" placeholder="1">' +
            '</div>' +
            '<div class="wi-edit-item">' +
              '<label>❤️ ХП</label>' +
              '<input type="number" id="wiDataInHp" class="wi-input" value="' + escA(p.hp != null ? p.hp : '20') + '" placeholder="20">' +
            '</div>' +
            '<div class="wi-edit-item">' +
              '<label>🛡️ Класс брони (КБ)</label>' +
              '<input type="number" id="wiDataInAc" class="wi-input" value="' + escA(p.ac != null ? p.ac : '10') + '" placeholder="10">' +
            '</div>' +
            '<div class="wi-edit-item">' +
              '<label>⚡ Энергия знаков / Выносливость</label>' +
              '<input type="number" id="wiDataInEnergy" class="wi-input" value="' + escA(p.energy != null ? p.energy : '50') + '" placeholder="50">' +
            '</div>' +
            '<div class="wi-edit-item">' +
              '<label>⚔️ Серебряный клинок (против чудовищ)</label>' +
              '<input type="text" id="wiDataInSilverSword" class="wi-input" value="' + escA(p.silverSword || '') + '" placeholder="Серебряный меч или спец. оружие">' +
            '</div>' +
            '<div class="wi-edit-item">' +
              '<label>🗡️ Стальной меч (против людей и зверей)</label>' +
              '<input type="text" id="wiDataInSteelSword" class="wi-input" value="' + escA(p.steelSword || '') + '" placeholder="Основное оружие / стальной клинок">' +
            '</div>' +
            '<div class="wi-edit-item" style="grid-column: 1 / -1;">' +
              '<label>🛡️ Доспех / Защитное снаряжение</label>' +
              '<input type="text" id="wiDataInArmor" class="wi-input" value="' + escA(p.armor || '') + '" placeholder="Доспех или защитное снаряжение">' +
            '</div>' +
            '<div class="wi-edit-item" style="grid-column: 1 / -1;">' +
              '<label>📜 Заметки, контракты, эликсиры и мутации</label>' +
              '<textarea id="wiDataInNotes" class="wi-input" rows="3" placeholder="Контракты, инвентарь, эликсиры, биография...">' + esc(p.notes || '') + '</textarea>' +
            '</div>' +
          '</div>' +

          '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px;">' +
            '<button class="btn btn-primary" id="wiDataSaveCharBtn">✓ Сохранить анкету</button>' +
            '<button class="btn" id="wiDataResetProfileBtn" title="Сбросить боевые статы персонажа">🔄 Сбросить статы</button>' +
            '<button class="btn" id="wiDataDelProfileBtn" style="color:#ff7675;border-color:rgba(231,76,60,0.4);margin-left:auto;" title="Удалить текущий профиль">🗑️ Удалить профиль</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="sheet-section wi-data-section">' +
        '<div class="section-label">Параметры мира и кампании</div>' +
        fld('Название хроник / Кампании', '<input id="wiWName" class="wi-input" type="text" value="' + escA(meta.name || '') + '">') +
        fld('Заметки хроник Континента', '<textarea id="wiWNote" class="wi-input" rows="3">' + esc(meta.note || '') + '</textarea>') +
        '<div class="sheet-actions"><button class="btn-primary" id="wiWSave">Сохранить мир</button></div>' +
      '</div>' +

      (typeof GHSync !== 'undefined' ? GHSync.renderUI() : '') +

      '<div class="gh-sync-card" id="wiGeminiApiSection" style="margin-top:20px; margin-bottom:20px;">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">' +
          '<span style="font-size:20px;">🤖</span>' +
          '<div>' +
            '<div style="font-weight:700;font-size:14px;color:#fff;">Google Gemini AI (Интеграция ИИ)</div>' +
            '<div style="font-size:12px;color:var(--wi-steel, #94a3b8);">Генерация ведьмачьих контрактов, бестиария и событий</div>' +
          '</div>' +
        '</div>' +
        '<p style="font-size:12px;color:var(--wi-steel, #94a3b8);margin:0 0 12px 0;">Ключ безопасно хранится <b style="color:var(--wi-amber, #f59e0b);">только в браузере этого устройства</b>. Получить бесплатный API-ключ можно за пару минут в <a href="https://aistudio.google.com/" target="_blank" style="color:var(--wi-amber, #fbbf24);text-decoration:underline;">Google AI Studio</a>.</p>' +
        '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">' +
          '<input type="password" id="wiDataGeminiKey" value="' + escA(typeof window.getGeminiApiKey === 'function' ? window.getGeminiApiKey() : '') + '" placeholder="Вставьте ключ AIzaSy..." style="flex:1; min-width:200px; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 12px; border-radius:4px; font-family:monospace; font-size:13px;">' +
          '<button class="btn-primary" id="wiDataSaveGeminiKey" style="background:linear-gradient(135deg, #8b0000, #b45309); border:none; padding:8px 16px; border-radius:4px; color:#fff; font-weight:bold; cursor:pointer;">💾 Сохранить API Ключ</button>' +
        '</div>' +
      '</div>' +

      (typeof AppStorage !== 'undefined' ? AppStorage.renderWidget('wi') : '') +

      '<div class="sheet-section wi-data-section">' +
        '<div class="section-label">Экспорт и импорт</div>' +
        '<div class="desc">Единый файл на весь режим «Ведьмак»: все профили ведьмаков, снаряжение, заметки и хроники Континента. Импорт заменяет текущее содержимое.</div>' +
        '<div class="sheet-actions">' +
          '<button class="btn-primary" id="wiExport">Экспорт в файл</button>' +
          '<button class="btn-ghost" id="wiImportBtn">Импорт из файла</button>' +
          '<input type="file" id="wiImportFile" accept="application/json,.json" style="display:none">' +
        '</div>' +
      '</div>';
  }

  /* Обработчики экрана Данные */
  function wireWiData(){
    if(typeof HB === 'undefined' || HB.mode !== 'wi') return;
    if(typeof GHSync !== 'undefined' && GHSync.wireUI) GHSync.wireUI();
    if(typeof AppStorage !== 'undefined' && AppStorage.wireWidget) AppStorage.wireWidget('wi');

    var g = function(id){ return document.getElementById(id); };
    var v = function(id){ var e = g(id); return e ? e.value : ''; };

    // Переключение визуальной темы раздела «Ведьмак»
    document.querySelectorAll('[data-wi-theme-pick]').forEach(function(card){
      card.addEventListener('click', function(){
        var chosen = card.getAttribute('data-wi-theme-pick') || 'wolf';
        if(WI.getTheme() === chosen) return;
        WI.setTheme(chosen);
        if(typeof render === 'function') render();
        var tObj = WI.THEMES.find(function(t){ return t.id === chosen; });
        WI.toast(tObj && tObj.toast ? tObj.toast : ('✓ Включена тема «' + chosen + '»'), 'success');
      });
    });

    // Выбор активного профиля
    var sel = g('wiDataProfileSelect');
    if(sel){
      sel.addEventListener('change', function(){
        WI.switchProfile(this.value);
      });
    }

    // Создание нового профиля
    var newBtn = g('wiDataNewProfileBtn');
    if(newBtn){
      newBtn.addEventListener('click', function(){
        var name = prompt('Введите имя нового персонажа (или оставьте пустым):', '');
        if(name !== null){
          WI.createProfile({ name: name.trim() });
        }
      });
    }

    // Дублирование профиля
    var cloneBtn = g('wiDataCloneProfileBtn');
    if(cloneBtn){
      cloneBtn.addEventListener('click', function(){
        WI.cloneProfile(WI.activeProfileId);
      });
    }

    // Сброс статов
    var resetBtn = g('wiDataResetProfileBtn');
    if(resetBtn){
      resetBtn.addEventListener('click', function(){
        var p = WI.getActiveProfile();
        var name = p && p.name ? ('«' + p.name + '»') : 'текущего персонажа';
        if(confirm('Сбросить боевые параметры персонажа ' + name + ' к начальным значениям? Снаряжение и заметки сохранятся.')){
          WI.resetProfile(WI.activeProfileId);
        }
      });
    }

    // Удаление профиля
    var delBtn = g('wiDataDelProfileBtn');
    if(delBtn){
      delBtn.addEventListener('click', function(){
        var p = WI.getActiveProfile();
        var name = p && p.name ? ('«' + p.name + '»') : 'текущего персонажа';
        var isLast = (WI.profiles || []).length <= 1;
        var msg = isLast
          ? 'У вас остался единственный персонаж в ростере. Удаление сбросит его к чистому шаблону. Продолжить?'
          : ('Удалить профиль ' + name + ' из ростера?');
        if(confirm(msg)){
          WI.deleteProfile(WI.activeProfileId);
        }
      });
    }

    // Сохранение анкеты ведьмака
    var saveCharBtn = g('wiDataSaveCharBtn');
    if(saveCharBtn){
      saveCharBtn.addEventListener('click', function(){
        var p = WI.getActiveProfile();
        if(!p) return;
        p.name = (v('wiDataInName') || '').trim();
        p.school = (v('wiDataInSchool') || '').trim();
        p.title = (v('wiDataInTitle') || '').trim();
        p.level = parseInt(v('wiDataInLevel'), 10) || 1;
        p.hp = parseInt(v('wiDataInHp'), 10) || 0;
        p.maxHp = p.hp;
        p.ac = parseInt(v('wiDataInAc'), 10) || 10;
        p.energy = parseInt(v('wiDataInEnergy'), 10) || 50;
        p.maxEnergy = p.energy;
        p.silverSword = (v('wiDataInSilverSword') || '').trim();
        p.steelSword = (v('wiDataInSteelSword') || '').trim();
        p.armor = (v('wiDataInArmor') || '').trim();
        p.notes = (v('wiDataInNotes') || '').trim();

        WI.saveProfile(p);
        if(typeof paintShBar === 'function') paintShBar();
        if(typeof render === 'function') render();
        WI.toast('✓ Анкета персонажа успешно сохранена!', 'success');
      });
    }

    // Сохранение параметров мира
    var wSave = g('wiWSave');
    if(wSave){
      wSave.addEventListener('click', function(){
        WI.meta.name = (v('wiWName') || 'Хроники Континента').trim();
        WI.meta.note = (v('wiWNote') || '').trim();
        WI.saveMeta();
        if(typeof paintShBar === 'function') paintShBar();
        if(typeof navigate === 'function') navigate('wiHome');
        WI.toast('✓ Хроники сохранены!', 'success');
      });
    }

    // Сохранение Gemini API ключа
    var saveGeminiBtn = g('wiDataSaveGeminiKey');
    if(saveGeminiBtn && !saveGeminiBtn.__wired){
      saveGeminiBtn.__wired = true;
      saveGeminiBtn.addEventListener('click', function(){
        var inp = g('wiDataGeminiKey');
        var k = inp ? inp.value.trim() : '';
        if(typeof window.saveGeminiApiKey === 'function'){
          window.saveGeminiApiKey(k);
        } else {
          try { localStorage.setItem('gemini_api_key', k); } catch(e){}
        }
        alert(k ? '✓ API-ключ Gemini успешно сохранён!' : 'API-ключ удалён.');
      });
    }

    // Экспорт в файл
    var ex = g('wiExport');
    if(ex){
      ex.addEventListener('click', function(){
        var act = WI.getActiveProfile();
        if(act){
          if(Array.isArray(WI.techs)) act.techs = WI.techs;
          if(Array.isArray(WI.moves)) act.moves = WI.moves;
        }
        var payload = {
          kind: 'witcher',
          version: 2,
          meta: WI.meta,
          profiles: WI.profiles,
          activeProfileId: WI.activeProfileId
        };
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = ((WI.meta && WI.meta.name) || 'witcher_chronicles').replace(/[^\wа-яА-ЯёЁ\- ]/g, '') + '.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function(){ URL.revokeObjectURL(a.href); }, 600);
      });
    }

    // Импорт из файла
    var ib = g('wiImportBtn'), ifl = g('wiImportFile');
    if(ib && ifl){
      ib.addEventListener('click', function(){ ifl.click(); });
      ifl.addEventListener('change', function(){
        var f = ifl.files && ifl.files[0];
        if(!f) return;
        var fr = new FileReader();
        fr.onload = function(){
          try {
            var data = JSON.parse(fr.result);
            if(!data || (!Array.isArray(data.profiles) && !data.meta)) throw 0;
            if(!confirm('Заменить текущие данные режима «Ведьмак» данными из файла?')) return;
            if(Array.isArray(data.profiles) && data.profiles.length > 0){
              var targetActiveId = data.activeProfileId || data.profiles[0].id;
              if(Array.isArray(data.techs) || Array.isArray(data.moves)){
                var actInFile = data.profiles.find(function(p){ return p && p.id === targetActiveId; }) || data.profiles[0];
                if(actInFile){
                  if(!Array.isArray(actInFile.techs) && Array.isArray(data.techs)) actInFile.techs = data.techs;
                  if(!Array.isArray(actInFile.moves) && Array.isArray(data.moves)) actInFile.moves = data.moves;
                }
              }
              WI._migrateAndNormalizeProfiles(data.profiles, targetActiveId);
              WI.profiles = data.profiles;
              WI.activeProfileId = targetActiveId;
              var actNow = WI.getActiveProfile();
              WI.techs = actNow.techs;
              WI.moves = actNow.moves;
              WI.saveProfiles();
            }
            if(data.meta){
              WI.meta = data.meta;
              if(data.meta.theme) WI.setTheme(data.meta.theme);
              WI.saveMeta();
            }
            if(typeof paintShBar === 'function') paintShBar();
            if(typeof render === 'function') render();
            WI.toast('✓ Данные импортированы!', 'success');
          } catch(e){
            alert('Не удалось прочитать файл резервной копии.');
          }
        };
        fr.readAsText(f);
      });
    }
  }

  function wireWiNav(){
    document.querySelectorAll('[data-nav]').forEach(function(el){
      if(el.__wiNavBound) return;
      el.__wiNavBound = true;
      el.addEventListener('click', function(e){
        var target = el.getAttribute('data-nav');
        if(target && typeof window.navigate === 'function'){
          window.navigate(target);
        }
      });
    });

    document.querySelectorAll('[data-go]').forEach(function(el){
      if(el.__wiGoBound) return;
      el.__wiGoBound = true;
      el.addEventListener('click', function(e){
        var target = el.getAttribute('data-go');
        if(target && typeof window.navigate === 'function'){
          window.navigate(target);
        }
      });
    });

    document.querySelectorAll('[data-wi-quick-profile-select]').forEach(function(sel){
      if(sel.__wiProfBound) return;
      sel.__wiProfBound = true;
      sel.addEventListener('change', function(){
        if(this.value && this.value !== WI.activeProfileId){
          WI.switchProfile(this.value);
        }
      });
    });
  }

  /* ============================================================
     СПРАВОЧНИК КОНТИНЕНТА (WITCHER COMPENDIUM)
     ============================================================ */

  var WI_REF_SECTIONS = [
    {
      group: '🔮 Знаки Ведьмаков',
      color: '#f59e0b',
      items: [
        { key: 'aard', icon: '💨', t: 'Знак Аард (Aard)', tag: 'Телекинез', d: 'Направленный телекинетический импульс, сбивающий с ног, ломающий препятствия и оглушающий врагов.' },
        { key: 'igni', icon: '🔥', t: 'Знак Игни (Igni)', tag: 'Пирокинез', d: 'Конусный выброс пламени и раскаленных искр, поджигающий противников и разрушающий броню.' },
        { key: 'quen', icon: '🛡️', t: 'Знак Квен (Quen)', tag: 'Защитный барьер', d: 'Персональный магический щит, поглощающий удары и отражающий часть кинетической энергии.' },
        { key: 'axii', icon: '💫', t: 'Знак Аксий (Axii)', tag: 'Контроль разума', d: 'Нейропатическое гипнотическое воздействие: успокоение, ошеломление или подчинение воли цели.' },
        { key: 'yrden', icon: '🟣', t: 'Знак Ирден (Yrden)', tag: 'Магическая ловушка', d: 'Пространственная гексаграмма на земле: сковывает движения, блокирует телепортацию и материализует призраков.' },
        { key: 'rare_signs', icon: '✨', t: 'Редкие знаки (Гелиотроп и Сомн)', tag: 'Тайные знаки', d: 'Каноничные знаки из книг Сапковского: Гелиотроп для гашения смертельных чар и Сомн для усыпления.' }
      ]
    },
    {
      group: '🐺 Ведьмачьи Школы',
      color: '#38bdf8',
      items: [
        { key: 'school_wolf', icon: '🐺', t: 'Школа Волка (Каэр Морхен)', tag: 'Синяя гора', d: 'Баланс стали, серебра, знаков и алхимии. Крепость Каэр Морхен в долине реки Гвенллех.' },
        { key: 'school_cat', icon: '🐱', t: 'Школа Кота (Династия Стигга)', tag: 'Скорость и криты', d: 'Невероятная ловкость, лёгкие доспехи, парные клинки и наёмные контракты. Замок Стигга в Эббинге.' },
        { key: 'school_griffin', icon: '🦅', t: 'Школа Грифона (Цитадель Поварн)', tag: 'Мощь Знаков', d: 'Магия, рыцарский этикет, глубинное изучение знаков и защита слабых. Замок Поварн в Ковире.' },
        { key: 'school_bear', icon: '🐻', t: 'Школа Медведя (Хаерн Кадух)', tag: 'Тяжелая броня', d: 'Северные горы Амелл, непробиваемые латы, тяжелые удары, бескомпромиссная стойкость и одиночество.' },
        { key: 'school_viper', icon: '🐍', t: 'Школа Змеи (Горгона / Гулетор)', tag: 'Парные клинки и яды', d: 'Крепости в горах Тир Тохаир, двойные короткие клинки, смертоносные токсины и тайны Дикой Охоты.' },
        { key: 'school_manticore', icon: '🦂', t: 'Школа Мантикоры (Далёкий Восток)', tag: 'Эликсиры и мутагены', d: 'Восточные границы Хакланда и Зеррикании. Максимальная толерантность к токсинам и взрывчатка.' },
        { key: 'school_crane', icon: '🪶', t: 'Школа Журавля (Побережье)', tag: 'Морские твари и пушки', d: 'Побережье Великого Моря. Подводный бой, гарпуны, шесты и кремневые пистоли против кракенов.' }
      ]
    },
    {
      group: '🧪 Алхимия и Мутации',
      color: '#4ade80',
      items: [
        { key: 'alch_potions', icon: '🧪', t: 'Эликсиры Ведьмаков', tag: 'Зелья', d: 'Смертоносные для обычных людей отвары на спирту: Ласточка, Гром, Кошка, Неясыть, Белый Мёд, Пурга.' },
        { key: 'alch_oils', icon: '🛢️', t: 'Масла для Мечей (10 Классов)', tag: 'Смазки для лезвий', d: 'Нанесение травяных и минеральных экстрактов на кромку лезвия против 10 типов чудовищ.' },
        { key: 'alch_bombs', icon: '💣', t: 'Ведьмачьи Бомбы', tag: 'Метательное оружие', d: 'Керамические гранаты с зерриканским порохом: Самум, Танцующая звезда, Северный ветер, Лунная пыль, Двимерит.' },
        { key: 'alch_toxicity', icon: '🧬', t: 'Интоксикация и Мутагены', tag: 'Биохимия', d: 'Физиология ведьмака, пределы отравления зельями, отвары из монстров и мутации Трав.' }
      ]
    },
    {
      group: '👹 Бестиарий Континента',
      color: '#f43f5e',
      items: [
        { key: 'bestiary_necro', icon: '🧟', t: 'Трупоеды (Necrophages)', tag: 'Падальщики', d: 'Порождения полей сражений и могильников: гули, альгули, гра Graveir, цеметавры, утопцы и гнильцы.' },
        { key: 'bestiary_specters', icon: '👻', t: 'Призраки и Духи (Specters)', tag: 'Эфирные сущности', d: 'Неприкаянные души: полуденницы, полуночницы, моры, чумные девы и привидения склепов.' },
        { key: 'bestiary_vampires', icon: '🦇', t: 'Вампиры (Низшие и Высшие)', tag: 'Дети ночи', d: 'Пришельцы Сопряжения: от кровожадных экимм и фледеров до бессмертных разумных Высших Вампиров.' },
        { key: 'bestiary_cursed', icon: '🐺', t: 'Проклятые (Cursed Ones)', tag: 'Жертвы проклятий', d: 'Люди, изувеченные древней магией: волколаки, стрыги, игоши и берсерки Скеллиге.' },
        { key: 'bestiary_draconids', icon: '🐉', t: 'Дракониды (Draconids)', tag: 'Крылатые хищники', d: 'Опаснейшие чешуйчатые охотники: виверны, василиски, ослизги, куролишки и истинные драконы.' },
        { key: 'bestiary_relicts', icon: '🦌', t: 'Реликты (Relicts)', tag: 'Древние боги', d: 'Первобытные хозяева лесов до Сопряжения Сфер: лешие, бесы, сильваны и Ведьмы Кривоуховых топей.' }
      ]
    },
    {
      group: '⚔️ Фехтование и Боевая Система',
      color: '#cbd5e1',
      items: [
        { key: 'comb_swords', icon: '⚔️', t: 'Два Меча: Сталь и Серебро', tag: 'Клинки ведьмака', d: 'Стальной клинок из метеоритной руды для людей и зверей. Серебряный меч с рунами для монстров.' },
        { key: 'comb_styles', icon: '🌪️', t: 'Три Стиля Фехтования', tag: 'Школа меча', d: 'Классические стили: Быстрый стиль (Темп), Силовой стиль (Дробящий) и Групповой («Мельница»).' },
        { key: 'comb_defense', icon: '🛡️', t: 'Пируэты, Рипост и Защита', tag: 'Тактическая защита', d: 'Мастерство уклонения: пируэты, полупируэты, вольты, парирование клинком и отбивание стрел на лету.' },
        { key: 'comb_runes', icon: '💎', t: 'Рунные Камни и Глифы', tag: 'Зачарование', d: 'Вставка магических камней в мечи (Чернобог, Велес, Сварог) и нашивка глифов знаков на доспехи.' }
      ]
    },
    {
      group: '🏰 Лор, Королевства и Кодекс',
      color: '#fbbf24',
      items: [
        { key: 'lore_conjunction', icon: '🌌', t: 'Сопряжение Сфер (Conjunction)', tag: 'Космология', d: 'Катаклизм 1500-летней давности, столкнувший миры и породивший магию, чудовищ и приход людей.' },
        { key: 'lore_trials', icon: '🌿', t: 'Испытание Травами (Trial of Grasses)', tag: 'Мутация ведьмака', d: 'Мучительный алхимический процесс трансформации детей в ведьмаков. Выживают лишь трое из десяти.' },
        { key: 'lore_north', icon: '👑', t: 'Северные Королевства (The North)', tag: 'Четыре Королевства', d: 'Темерия, Редания, Аэдирн, Каэдвен, острова Скеллиге и вольный город Новиград.' },
        { key: 'lore_nilfgaard', icon: '☀️', t: 'Империя Нильфгаард (Nilfgaard)', tag: 'Великое Солнце', d: 'Южная сверхдержава с железной дисциплиной, развитой экономикой и знаком Золотого Солнца.' },
        { key: 'lore_code', icon: '📜', t: 'Кодекс Ведьмака и Право Неожиданности', tag: 'Законы и традиции', d: 'Нейтралитет цеха, вымышленный кодекс самозащиты, размен звонкой монеты и закон Предназначения.' }
      ]
    }
  ];

  var WI_REF = {
    aard: {
      t: 'Знак Аард (Aard)',
      icon: '💨',
      badge: 'Телекинез',
      lead: 'Телекинетический импульс направленного действия. Основной инструмент контроля дистанции, сбивания врагов с ног и разрушения преград.',
      rows: [
        { k: 'Суть и механика', v: 'Телекинетическая волна сжатого воздуха. Ведьмак складывает пальцы в форму клина и выбрасывает пси-энергию. При попадании цель проходит спасбросок Силы/Стойкости или опрокидывается ничком (Prone) и оглушается (Stunned).' },
        { k: 'Боевое применение', v: 'Прерывание атак противника, разрушение строя, сбивание летящих гарпий и грифонов на землю, разрушение щитов и хрупких деревянных перекрытий/завалов.' },
        { k: 'Альтернативная форма (Ударная волна)', v: 'Круговой импульс на 360 градусов вокруг ведьмака, раскидывающий всех противников в радиусе 3-4 метров. Идеально при окружении стаей утопцев или накеров.' },
        { k: 'Мутации и эффекты', v: 'Замораживающий Аард (мутация «Эйфория» / исследования профессора Моро): поток воздуха переохлаждается, замораживая врагов намертво с шансом мгновенного раскола.' },
        { k: 'Слабости и ограничения', v: 'Тяжеловесные монстры (големы, великаны, элементали) имеют колоссальный бонус к сопротивлению и лишь слегка вздрагивают.' }
      ]
    },
    igni: {
      t: 'Знак Игни (Igni)',
      icon: '🔥',
      badge: 'Пирокинез',
      lead: 'Выброс стихийного огня. Высокотемпературный конус пламени, выжигающий плоть чудовищ, расплавляющий броню и взрывающий горючие газы.',
      rows: [
        { k: 'Суть и механика', v: 'Выброс искр и концентрированного огненного потока. Наносит урон огнем и поджигает цель (эффект Горение — процентный периодический урон, паника и потеря хода).' },
        { k: 'Боевое применение', v: 'Уничтожение плоти и шерсти чудовищ, уязвимых к пламени (гулей, леших, трупоедов), детонация горючих газов от бомб (Драконий бриз), плавление доспехов врага.' },
        { k: 'Альтернативная форма (Огненная струя)', v: 'Непрерывный узкий луч пламени высокой температуры, буквально прожигающий щиты и закаленные латы рыцарей или чешую драконидов.' },
        { k: 'В быту и исследовании', v: 'Зажигание костров, факелов, запалов пороха, подогрев пищи и раскаливание металла в полевых условиях без огнива.' },
        { k: 'Противопоказания', v: 'Существа стихии огня (огненные элементали, ифриты) поглощают пламя Игни или не получают вреда.' }
      ]
    },
    quen: {
      t: 'Знак Квен (Quen)',
      icon: '🛡️',
      badge: 'Защитный барьер',
      lead: 'Персональный статический щит ведьмака. Поглощает удары любой силы, спасая жизнь в безнадежных ситуациях.',
      rows: [
        { k: 'Суть и механика', v: 'Статический энергетический кокон вокруг тела ведьмака. Поглощает 100% следующего полученного удара или определенный порог урона (включая физический, стихийный и яды).' },
        { k: 'Боевое применение', v: 'Страховка при сближении с опасными монстрами, парирование неблокируемых ударов (дубины троллей, хвосты василисков, таран бесов).' },
        { k: 'Альтернативная форма (Активный щит)', v: 'Удерживаемый сферический барьер. Ведьмак не может атаковать, пока удерживает щит, но каждый поглощенный удар конвертирует кинетическую силу в восстановление здоровья ведьмака.' },
        { k: 'Разрядка щита', v: 'При разрушении Квен взрывается волной искр, ошеломляя и отбрасывая находящихся в упор врагов.' },
        { k: 'Ограничение', v: 'При активном знаке выносливость не восстанавливается, пока барьер не спадет или не будет поглощен.' }
      ]
    },
    axii: {
      t: 'Знак Аксий (Axii)',
      icon: '💫',
      badge: 'Контроль разума',
      lead: 'Гипнотическое пси-воздействие на нервную систему. Успокаивает животных, ошеломляет чудовищ и переподчиняет врагов.',
      rows: [
        { k: 'Суть и механика', v: 'Ментальный импульс, подавляющий нервную систему противника. Цель впадает в ступор, роняет оружие или на короткое время воспринимает ведьмака союзником.' },
        { k: 'Боевое применение', v: 'Остановка разогнавшегося монстра (шального вепря, беса, гаргульи), лишение цели защиты для нанесения смертельного критического добивания.' },
        { k: 'Альтернативная форма (Марионетка)', v: 'Враг полностью переходит под контроль ведьмака и начинает яростно атаковать своих бывших соратников с удвоенным уроном.' },
        { k: 'Диалоги и мирное применение', v: 'Успокоение испуганной Плотвы (лошади), снятие агрессии у стражников, выбивание информации у упрямых свидетелей или снижение цен у торговцев.' },
        { k: 'Устойчивость', v: 'Существа с мощной психической структурой или отсутствием мозга (големы, высшие вампиры, чародеи) почти невосприимчивы к Аксию.' }
      ]
    },
    yrden: {
      t: 'Знак Ирден (Yrden)',
      icon: '🟣',
      badge: 'Магическая ловушка',
      lead: 'Магический круг на грунте. Замедляет врагов, блокирует враждебную магию и принудительно материализует бесплотных призраков.',
      rows: [
        { k: 'Суть и механика', v: 'Магический круг на грунте. Все враги внутри круга замедляют скорость перемещения и атак на 50-70%. Главное средство против бесплотных созданий.' },
        { k: 'Материализация призраков', v: 'Полуденницы, полуночницы, моры и привидения, заходя в зону Ирден, обретают плотную физическую форму, теряя неуязвимость к серебряному мечу.' },
        { k: 'Альтернативная форма (Магическая турель)', v: 'Знак ставится в виде светящегося кристалла в воздухе, который периодически стреляет молниями по приближающимся врагам и сбивает летящие стрелы/снаряды.' },
        { k: 'Блокировка магии', v: 'Разрушает иллюзии, обезвреживает магические мины и препятствует вампирской или чародейской телепортации.' },
        { k: 'Синергия', v: 'Идеально комбинируется с маслом против призраков и бомбой Лунная Пыль.' }
      ]
    },
    rare_signs: {
      t: 'Редкие знаки (Гелиотроп и Сомн)',
      icon: '✨',
      badge: 'Тайные знаки',
      lead: 'Малоизвестные каноничные знаки из саги Анджея Сапковского. Используются в критических ситуациях против высшей магии и скрытных проникновений.',
      rows: [
        { k: 'Знак Гелиотроп (Heliotrop)', v: 'Срабатывает инстинктивно в момент скрещивания запястий при приближении магической или кинетической волны колоссальной силы. Гасит направленные чародейские заклинания (файерболы Йеннифэр, удары Вильгефорца) и спасает от разбивания о каменные стены.' },
        { k: 'Отличие Гелиотропа от Квена', v: 'Квен накладывается заранее как превентивный барьер. Гелиотроп — это реакция-вспышка прямо в миг удара высшей магии.' },
        { k: 'Знак Сомн (Somne)', v: 'Описан в романе «Сезон гроз». Мягкий жест пальцами у лица собеседника, вызывающий мгновенное засыпание и стирание краткосрочной памяти о последних минутах.' },
        { k: 'Применение Сомна', v: 'Бесшумное устранение часовых, предотвращение паники среди гражданских и бескровное разрешение деликатных контрактов.' },
        { k: 'Ограничение концентрации', v: 'Сотворение знаков требует свободного дыхания, чистоты сознания и четкого жеста руки (сомы).' }
      ]
    },
    school_wolf: {
      t: 'Школа Волка (Каэр Морхен)',
      icon: '🐺',
      badge: 'Синяя гора',
      lead: 'Символ универсальности, выдержки и непоколебимого братства. Крепость Каэр Морхен в долине реки Гвенллех.',
      rows: [
        { k: 'Крепость и история', v: 'Каэр Морхен (Крепость Старого Моря) в Синих Горах Каэдвена. Была разорена фанатичной толпой подстрекаемых чародеями горожан. Обитель Геральта, Весемира, Эскеля, Ламберта и Цири.' },
        { k: 'Философия боя', v: 'Гармоничный универсализм. Волки в совершенстве владеют как быстрым, так и силовым стилями, одинаково эффективно фехтуют против чудовищ и людей, плавно чередуя удары клинка со знаками.' },
        { k: 'Экипировка школы', v: 'Куртки из плотной кожи с клепаным усилением и кольчужными вставками на плечах. Мечи сбалансированы для критических выпадов и быстрого набора энергии.' },
        { k: 'Знаменитые мастера', v: 'Весемир (старейший наставник фехтования), Геральт из Ривии (Белый Волк, Мясник из Блавикена), Эскель, Ламберт, Койон из Повисса.' },
        { k: 'Девиз', v: 'Никогда не суйся в чужие распри бесплатно. Слушай свой медальон.' }
      ]
    },
    school_cat: {
      t: 'Школа Кота (Династия Стигга)',
      icon: '🐱',
      badge: 'Скорость и криты',
      lead: 'Школа легких клинков, молниеносных убийств и нестабильных мутаций. Замок Стигга в Эббинге.',
      rows: [
        { k: 'Штаб-квартира', v: 'Замок Стигга на юге, позже бродячий караван «Династия». В отличие от других школ, Коты принимали контракты на людей и часто служили наемными ликвидаторами.' },
        { k: 'Особенности мутаций', v: 'Экспериментальные мутации Травами привели к эмоциональной нестабильности, вспышкам неконтролируемой ярости и патологической жестокости у многих адептов.' },
        { k: 'Боевая доктрина', v: 'Легкая броня без сковывающих пластин, акробатика, удары в спину, яды на лезвиях, использование миниатюрных скрытых арбалетов. Высочайший шанс критического рассечения.' },
        { k: 'Известные представители', v: 'Бреген (Кот из Иелло), Гаэтан (школа Кота, резня в деревне Добров), Айден (друг Ламберта), Киян (павший жертвой безумного мага).' },
        { k: 'Отношение в цехе', v: 'Остальные школы презирают и опасаются Котов за пренебрежение нейтралитетом и убийства за звонкую монету.' }
      ]
    },
    school_griffin: {
      t: 'Школа Грифона (Цитадель Поварн)',
      icon: '🦅',
      badge: 'Мощь Знаков',
      lead: 'Рыцарский кодекс, глубокие тайны магии и сокрушительная сила Знаков. Замок Поварн в Ковире.',
      rows: [
        { k: 'Крепость', v: 'Замок Поварн на высоких приморских утесах Ковира. Обладал гигантской библиотекой свитков по магии и древней истории.' },
        { k: 'Философия и кодекс', v: 'Грифоны подражали благородным рыцарям. Они искренне блюли кодекс чести, изучали этикет, защищали слабых и не торговались до последней кроны за спасение невинных.' },
        { k: 'Магическая мощь', v: 'Глубокая трансформация чакр. Грифоны способны применять знаки непрерывно, кастуя их без перезарядки и накрывая целые площади колоссальным пламенем или штормами Аарда.' },
        { k: 'Экипировка', v: 'Доспехи средней тяжести с гравированными рунами и золочеными деталями, усиливающие силу и интенсивность ведьмачьих знаков в разы.' },
        { k: 'Судьба', v: 'Крепость была погребена под гигантской лавиной, вызванной ревнивыми чародеями, завидовавшими магическим открытиям Грифонов.' }
      ]
    },
    school_bear: {
      t: 'Школа Медведя (Хаерн Кадух)',
      icon: '🐻',
      badge: 'Тяжелая броня',
      lead: 'Суровые горные воины, несокрушимые доспехи и бескомпромиссная стойкость. Крепость Хаерн Кадух в горах Амелл.',
      rows: [
        { k: 'Крепость', v: 'Хаерн Кадух в суровых заснеженных горах Амелл. Холодные гранитные залы и полное спартанское отречение от мирских благ.' },
        { k: 'Боевой стиль', v: 'Тяжелая кольчуга и толстые стеганые плащи. Медведи не полагаются на прыжки и акробатику: они держат прямой строй, парируют удары гигантских монстров и сокрушают врага размашистыми тяжелыми ударами.' },
        { k: 'Особенности мутаций', v: 'Упор на физическую плотность костей, колоссальную выносливость и способность игнорировать боль от переломов и рваных ран.' },
        { k: 'Отношения между братьями', v: 'У Медведей не было братства. Каждый ученик после выпуска уходил на большак один и никогда не возвращался назад в крепость без крайней нужды.' },
        { k: 'Известные имена', v: 'Герд (легендарный ведьмак, защищавший кланы Скеллиге от сирен и драконидов), Арнагад (основатель школы, отколовшийся от Ордена Ведьмаков).' }
      ]
    },
    school_viper: {
      t: 'Школа Змеи (Горгона / Гулетор)',
      icon: '🐍',
      badge: 'Парные клинки и яды',
      lead: 'Мастера ядов, скрытных ударов и хранители тайн о Дикой Охоте. Цитадель Гулетор в горах Тир Тохаир.',
      rows: [
        { k: 'Обитель', v: 'Крепость Гулетор в ущельях хребта Горгона (земли Нильфгаарда). Позже разрушена по приказу императора за отказ подчиниться.' },
        { k: 'Специализация', v: 'Бой двумя короткими мечами/кинжалами, схожими с ядовитыми клыками гадюки. Мастера скрытных засад, использования парализующих ядов и противостояния Дикой Охоте (Дрожи).' },
        { k: 'Сделка с Эмгыром', v: 'Лето из Гулетора и его соратники согласились устранить королей Севера (Фольтеста, Демавенда) в обмен на обещание императора возродить Школу Змеи.' },
        { k: 'Знаменитые змеи', v: 'Лето из Гулетора (Убийца Королей), Эган, Серрит, Колгрим.' },
        { k: 'Библиотека тайных знаний', v: 'Школа Змеи собрала самые полные архивы о природе Aen Elle, Всадниках Красных Всадников и пространственных разломах.' }
      ]
    },
    school_manticore: {
      t: 'Школа Мантикоры (Далёкий Восток)',
      icon: '🦂',
      badge: 'Эликсиры и мутагены',
      lead: 'Алхимический триумф, взрывчатка и выживание в пустынях. Восточные рубежи Зеррикании и Хакланда.',
      rows: [
        { k: 'География', v: 'Границы знойной Зеррикании и степей Хакланда. Ведьмаки Мантикоры сопровождали торговые караваны через великие пустыни, кишащие мантикорами и гигантскими скорпионами.' },
        { k: 'Алхимическое мастерство', v: 'Глубочайшая переработка органов чудовищ. Доспехи Мантикоры увешаны подсумками под эликсиры, масла и метательные бомбы зерриканского пороха.' },
        { k: 'Боевой транс', v: 'Способность выпивать до 4-5 сильнейших эликсиров одновременно, входя в состояние контролируемой эйфории, где скорость и реакция превосходят человеческие пределы в десятки раз.' },
        { k: 'Экипировка', v: 'Кожа серебряного дубления, кольчужные кольца и поясные ремни для мгновенного доступа к фиалам.' }
      ]
    },
    school_crane: {
      t: 'Школа Журавля (Побережье)',
      icon: '🪶',
      badge: 'Морские твари и пушки',
      lead: 'Охотники глубин Великого Моря. Подводный бой, гарпуны и раннее кремневое оружие.',
      rows: [
        { k: 'Среда обитания', v: 'Западные берега Континента, Синдас и залив Праксида. Охота на морских чудовищ, кракенов, утопленников глубоководных разломов и сирен.' },
        { k: 'Уникальный арсенал', v: 'Использование раннего порохового оружия (кремневых пистолетов с серебряной дробью) для поражения тварей сквозь толщу воды, а также гибких гарпунных шестов.' },
        { k: 'Дыхательные техники', v: 'Специальные эликсиры и мутации легких, позволяющие задерживать дыхание под водой до полутора часов.' }
      ]
    },
    alch_potions: {
      t: 'Эликсиры Ведьмаков',
      icon: '🧪',
      badge: 'Зелья',
      lead: 'Смертоносные токсичные отвары, многократно усиливающие метаболизм, зрение и регенерацию ведьмака.',
      rows: [
        { k: 'Ласточка (Swallow)', v: 'Ускоряет свертывание крови и клеточную регенерацию. Затягивает глубокие рваные раны прямо во время ожесточенного боя за считанные секунды.' },
        { k: 'Гром (Thunderbolt)', v: 'Увеличивает мышечную силу удара на 30-50%. Клинки рассекают кости и толстую шкуру чудовищ, словно сухую траву.' },
        { k: 'Кошка (Cat)', v: 'Расширяет зрачки, делая радужку фосфоресцирующей. Позволяет видеть в абсолютной тьме пещер и катакомб без факела, но делает зрение уязвимым к внезапным вспышкам света.' },
        { k: 'Неясыть (Tawny Owl)', v: 'Стимулирует выброс ментальной энергии, ускоряя регенерацию запаса выносливости для частого сотворения знаков.' },
        { k: 'Белый Мёд (White Honey)', v: 'Абсолютный нейтрализатор. Мгновенно выводит все токсины из крови, снимая отравление, но при этом сбрасывает все активные боевые эффекты других зелий.' },
        { k: 'Чёрная Кровь (Black Blood)', v: 'Превращает кровь ведьмака в едкую кислоту. Любой вампир или трупоед, укусивший ведьмака, получает страшнейшие ожоги пищевода и паралич.' },
        { k: 'Пурга (Blizzard)', v: 'Реакции обостряются до предела: мир вокруг замедляется в несколько раз. Ведьмак способен уворачиваться от стрел в упор и разрубать несколько целей на одном шаге.' },
        { k: 'Иволга (Golden Oriole)', v: 'Дарует иммунитет к ядам сколопендроморфов, кикимор и виверн, обращая токсический урон в исцеление.' }
      ]
    },
    alch_oils: {
      t: 'Масла для Мечей (10 Классов)',
      icon: '🛢️',
      badge: 'Смазки для лезвий',
      lead: 'Алхимические эмульсии для лезвий. Усиливают поражающий фактор клинка против конкретного типа монстров.',
      rows: [
        { k: 'Масло против трупоедов', v: 'Содержит толченый аконит и селитру. Выжигает плоть гулей, альгулей, гра Graveir и цеметавров.' },
        { k: 'Масло против призраков', v: 'Основа из лунной пыли и белого мирта. Принуждает нематериальных духов терять эфирную связь с миром живых.' },
        { k: 'Масло против вампиров', v: 'Чесночные дистилляты, серебряная амальгама и кровь петуха. Препятствует вампирской регенерации экимм, катаканов и фледеров.' },
        { k: 'Масло против проклятых', v: 'Омела, ладан и собачья петрушка. Смертоносно для волколаков, упырей, игош и берсерков.' },
        { k: 'Масло против драконидов', v: 'Экстракты корня мандрагоры и чемерицы. Размягчает жесткую ороговевшую чешую виверн, василисков и ослизгов.' },
        { k: 'Масло против инсектоидов', v: 'Жир скорпиона и смола. Разъедает хитиновые панцири кикимор, эндриаг и главоглазов.' },
        { k: 'Масло против реликтов', v: 'Древние травы и мох дольменов. Эффективно против леших, бесов, сильванов и ведьм с Кривоуховых топей.' },
        { k: 'Масло против огров', v: 'Ядовитые грибы шиике. Направлено против троллей, циклопов, голиафов и великанов.' },
        { k: 'Масло против магических тварей', v: 'Двимеритовый порошок и жимолость. Рассекает каменную плоть гаргулий, големов и элементалей.' },
        { k: 'Яд Повешенного', v: 'Специальный состав для стального меча. Смертелен для гуманоидов — бандитов, дезертиров и наемников.' }
      ]
    },
    alch_bombs: {
      t: 'Ведьмачьи Бомбы',
      icon: '💣',
      badge: 'Метательное оружие',
      lead: 'Метательные гранаты с зерриканским порохом, серебряной крошкой и магическими реагентами.',
      rows: [
        { k: 'Самум (Samum)', v: 'Ослепительная магниевая вспышка и оглушающий грохот. Вводит противников в радиусе поражения в полное ошеломление и паралич.' },
        { k: 'Танцующая звезда (Dancing Star)', v: 'Зажигательный снаряд на основе нефти и фосфора. Создает огненную стену, поджигая все живое и уничтожая гнезда чудовищ.' },
        { k: 'Северный ветер (Northern Wind)', v: 'Алхимический хладагент мгновенного действия. Замораживает плоть противников до состояния ломкого льда, позволяя расколоть их одним ударом.' },
        { k: 'Лунная пыль (Moon Dust)', v: 'Облако серебряных микрокристаллов. Оседает на теле врага, наглухо блокируя трансформацию оборотней и превращение вампиров в туман.' },
        { k: 'Двимеритовая бомба (Dimeritium)', v: 'Распыляет частицы двимерита. Полностью блокирует любую магию чародеев, рассеивает иллюзии и деактивирует магические знаки и элементалей.' },
        { k: 'Картечь (Grapeshot)', v: 'Шрапнельная осколочная бомба с серебряной и стальной сечкой. Наносит чудовищный рваный физический урон живой силе.' },
        { k: 'Смертоцвет (Puffball)', v: 'Выброс ядовитого зеленого газа фосгена. Удушает врагов без защиты дыхания.' }
      ]
    },
    alch_toxicity: {
      t: 'Интоксикация и Мутагены',
      icon: '🧬',
      badge: 'Биохимия',
      lead: 'Пределы токсической нагрузки ведьмачьей печени, баланс зелий, мутагенные отвары и эйфория.',
      rows: [
        { k: 'Порог безопасности (Интоксикация)', v: 'Каждое выпитое зелье оставляет в крови токсичные шлаки (15-25 единиц). Превышение порога в 75-80% вызывает некроз сосудов, помутнение рассудка и стремительную потерю здоровья.' },
        { k: 'Внешние признаки передозировки', v: 'Кожа становится мертвенно-бледной, вены на лице чернеют и вздуваются, белки глаз заливаются кровью, появляется тремор конечностей.' },
        { k: 'Отвары (Decoctions)', v: 'Мощнейшие зелья длительного действия, сваренные на основе мутагенов уникальных монстров (василиска, архигрифона, тролля). Действуют часами, но занимают львиную долю шкалы токсичности.' },
        { k: 'Зеленые, синие и красные мутагены', v: 'Генетические выжимки монстров, вживляемые в нервные узлы. Красные усиливают силу фехтования, синие — мощь знаков, зеленые — запас здоровья и алхимию.' },
        { k: 'Эйфория', v: 'Состояние боевого транса, когда высокая интоксикация конвертируется в сокрушительный прирост физического урона.' }
      ]
    },
    bestiary_necro: {
      t: 'Трупоеды (Necrophages)',
      icon: '🧟',
      badge: 'Падальщики',
      lead: 'Существа, питающиеся падалью, разлагающейся плотью и свежими могилами. Обитают на полях сражений и у болот.',
      rows: [
        { k: 'Гули и Альгули', v: 'Падальщики с острыми когтями и шипами. Альгули крупнее, умнее, выпускают костяные шипы при ярости (нужен Аксий, чтобы заставить их убрать шипы) и быстро регенерируют.' },
        { k: 'Утопцы и Водные бабы', v: 'Трупы утопленников, оживленные магией гниения. Атакуют стаями у болот и берегов. Крайне уязвимы к серебру, маслу трупоедов и огненному знаку Игни.' },
        { k: 'Гнильцы (Rotfiends)', v: 'Перед смертью их тела чудовищно раздуваются от скопившихся трупных газов и детонируют, разлетаясь градом ядовитых костей и гноя. Необходимо отпрыгивать назад.' },
        { k: 'Гра Graveir и Цеметавры', v: 'Гигантские элитные трупоеды. Питаются костным мозгом мертвецов, способны перекусить бедро человека за один щелчок челюстей. Требуют силового стиля фехтования.' }
      ]
    },
    bestiary_specters: {
      t: 'Призраки и Духи (Specters)',
      icon: '👻',
      badge: 'Эфирные сущности',
      lead: 'Эфирные призраки, прикованные к миру живых тяжелым грехом, предательством или мучительной гибелью.',
      rows: [
        { k: 'Полуденницы и Полуночницы', v: 'Души невест, убитых перед свадьбой, или жертв жестокой ревности. Парят над полями в полдень или полночь. В обычном состоянии нематериальны: удары клинка рассекают воздух.' },
        { k: 'Тактика охоты', v: 'Поставить знак Ирден или бросить Лунную Пыль. Оказавшись в круге, призрак материализуется и получает полный урон серебряным мечом с маслом против призраков.' },
        { k: 'Моры (Hym)', v: 'Призраки совести, вселяющиеся в людей, совершивших чудовищное злодеяние. Питаются чувством вины и сводят жертву с ума шепотом из теней.' },
        { k: 'Чумные девы (Pesta)', v: 'Духи, рожденные во время мора и эпидемий. Их окружает туча трупных мух и ядовитые споры чумы.' }
      ]
    },
    bestiary_vampires: {
      t: 'Вампиры (Низшие и Высшие)',
      icon: '🦇',
      badge: 'Дети ночи',
      lead: 'Существа иной сферы. От слепых бешеных зверей до древних бессмертных мыслителей.',
      rows: [
        { k: 'Классификация вампиров', v: 'Разделяются на низших (лишенных разума зверей: гаркаины, фледеры, экиммы) и высших (катаканы, бруксы, альпы, и истинные Высшие Вампиры).' },
        { k: 'Бруксы и Альпы', v: 'Прекрасные девы-вампиры, поющие чарующие песни. Способны становиться полностью невидимыми, передвигаться со сверхзвуковой скоростью и издавать звуковые волны, сбивающие с ног (нужен Аард и Квен).' },
        { k: 'Истинные Высшие Вампиры (Регис, Детлафф)', v: 'Бессмертные разумные сущности колоссальной силы. Не боятся солнца, чеснока и святой воды. Убить Высшего Вампира окончательно может только другой Высший Вампир.' },
        { k: 'Уязвимости', v: 'Масло против вампиров, Чёрная Кровь (смертельный яд при попытке укуса), бомба Лунная пыль и знак Игни.' }
      ]
    },
    bestiary_cursed: {
      t: 'Проклятые (Cursed Ones)',
      icon: '🐺',
      badge: 'Жертвы проклятий',
      lead: 'Трагические жертвы чужих или собственных проклятий. Сохраняют частицы человеческой души в теле чудовища.',
      rows: [
        { k: 'Стрыга (Striga)', v: 'Женщина, родившаяся мертвой в гробу и проклятая до рождения (пример: принцесса Адда). Обладает стальными когтями и невероятной силой. Расколдовать можно, продержавшись в ее склепе до третьего крика петуха.' },
        { k: 'Волколаки и Ликантропы', v: 'Оборотни, сочетающие разум человека и ярость волка. В бою мгновенно регенерируют здоровье. Без Лунной пыли или бомбы Самум бой превращается в бесконечную бойню.' },
        { k: 'Игоша (Botchling)', v: 'Монстр, рожденный из мертворожденного некрещеного младенца, брошенного без погребения. Превращается в огромного уродливого зверя либо может быть упокоен ритуалом в доброго духа-хранителя (Чурика).' },
        { k: 'Берсерки Скеллиге (Вильдкаарлы)', v: 'Воины, отведавшие мяса жертвенных медведей под воздействием галлюциногенных грибов Мардрём и теряющие человеческий облик.' }
      ]
    },
    bestiary_draconids: {
      t: 'Дракониды (Draconids)',
      icon: '🐉',
      badge: 'Крылатые хищники',
      lead: 'Властелины поднебесья. Рептилии колоссальной физической мощи, вооруженные ядами и сокрушительными ударами крыльев.',
      rows: [
        { k: 'Охотничьи повадки', v: 'Гнездятся на высоких скалах. Нападают с воздуха, пикируя на караваны скота и людей. Сбиваются на землю знаком Аард или выстрелом из арбалета.' },
        { k: 'Василиски и Куролишки', v: 'Миф о взгляде, обращающем в камень — людская сказка. На самом деле их клюв наносит страшный нервно-паралитический яд, а хвост с шипами ломает щиты и кости.' },
        { k: 'Виверны и Ослизги', v: 'Крупные крылатые ящеры, плюющиеся ядовитой кислотой или огнем. Требуют масла против драконидов и знака Квен для парирования таранных ударов крыльев.' },
        { k: 'Истинные драконы (Золотые, Зеленые, Красные)', v: 'Разумные древние владыки небес (Борх Три Галки / Виллентретенмерт). Согласно Ведьмачьему Кодексу, ведьмаки принципиально НЕ берут контракты на разумных драконов.' }
      ]
    },
    bestiary_relicts: {
      t: 'Реликты (Relicts)',
      icon: '🦌',
      badge: 'Древние боги',
      lead: 'Первобытные хозяева лесов и топей, жившие на Континенте еще до Сопряжения Сфер.',
      rows: [
        { k: 'Леший (Leshen)', v: 'Древний дух чащи. Управляет волчьими стаями, призывает рои хищных воронов, обращается в стаю птиц для телепортации и проращивает корни деревьев из-под земли.' },
        { k: 'Охота на лешего', v: 'Необходимо найти человека в деревне, которого леший «пометил» печатью своей связи, и изгнать либо разорвать эту связь, иначе дух возродится.' },
        { k: 'Бесы и Чёрты', v: 'Огромные рогатые исполины с третьим гипнотическим глазом во лбу. Третий глаз беса погружает охотника в полную тьму и транс. Парировать разбег беса невозможно — только уворот.' },
        { k: 'Хозяйки Леса (Ведьмы Кривоуховых топей)', v: 'Пряха, Ткаха и Шептуха. Древние хтонические божества Велена, питающиеся ушами и кровью людей в обмен на «защиту» от чумы и голода.' }
      ]
    },
    comb_swords: {
      t: 'Два Меча: Сталь и Серебро',
      icon: '⚔️',
      badge: 'Клинки ведьмака',
      lead: 'Оба меча — для чудовищ. Одно для тех, что рождены магией, другое — для тех, что носят человеческий облик.',
      rows: [
        { k: 'Стальной меч (Steel Sword)', v: 'Выкован из сидеритовой стали или метеоритной руды. Прочен как алмаз, не гнется и держит идеальную бритвенную заточку. Используется против бандитов, рыцарей, диких волков и медведей.' },
        { k: 'Серебряный меч (Silver Sword)', v: 'Стальной сердечник, покрытый толстым слоем серебра высшей пробы с нанесенными эльфскими рунами. Серебро глубоко токсично для магических тварей и существ Сопряжения Сфер.' },
        { k: 'Хрупкость серебра', v: 'Серебро — мягкий металл. Удар серебряным мечом по железным латам или каменному панцирю голема затупит или расколет клинок. Ведьмак бережет серебро пуще глаза.' },
        { k: 'Ношение за спиной', v: 'Ножны крепятся на кожаной перевязи за правым плечом с особым замком и свободным ходом, позволяющим выхватить метровый клинок за долю секунды одним слитным движением.' }
      ]
    },
    comb_styles: {
      t: 'Три Стиля Фехтования',
      icon: '🌪️',
      badge: 'Школа меча',
      lead: 'Боевая пластика ведьмака: Темп (быстрый), Дробящий (силовой) и Мельница (круговой групповой).',
      rows: [
        { k: 'Быстрый стиль (Temerian Swift)', v: 'Непрерывная цепочка молниеносных режущих выпадов и уколов. Направлен на легких, подвижных противников, бруксов и лучников. Поражает уязвимые сочленения, шею и сухожилия.' },
        { k: 'Силовой стиль (Redanian Strong)', v: 'Тяжелые двуручные сокрушительные взмахи с максимальным вложением корпуса и веса плеч. Пробивает щиты, раскалывает шлемы и крошит панцири гигантских чудовищ.' },
        { k: 'Групповой стиль («Мельница» / Whirl)', v: 'Ведьмак закручивается в смертоносный акробатический вихрь стали. Клинок описывает восьмерки и круги на 360 градусов, рассекая сразу всех окруживших противников.' },
        { k: 'Танец на кончиках пальцев', v: 'Ведьмачье фехтование напоминает балет: ноги никогда не скрещиваются, вес тела постоянно балансирует на полусогнутых коленях.' }
      ]
    },
    comb_defense: {
      t: 'Пируэты, Рипост и Защита',
      icon: '🛡️',
      badge: 'Тактическая защита',
      lead: 'Искусство защиты: не блокировать лоб в лоб удар дубины тролля, а соскользнуть по воздуху и нанести контрудар.',
      rows: [
        { k: 'Пируэт (Pirouette)', v: 'Вращение на одной ноге с уходом с линии атаки. Позволяет пропустить удар вражеского топора мимо и оказаться у противника за спиной для смертельного удара.' },
        { k: 'Вольт (Volt)', v: 'Быстрый акробатический прыжок-кувырок в сторону или назад, разрывающий дистанцию при дыхании огнем или падении чудовища с неба.' },
        { k: 'Рипост (Riposte / Контрудар)', v: 'Парирование удара в самый миг контакта с последующим немедленным выворачивающим ответным ударом в незащищенный бок врага.' },
        { k: 'Отбивание стрел', v: 'Сверхчеловеческая реакция ведьмака позволяет видеть траекторию летящего оперенного снаряда и отбивать стрелы и арбалетные болты плоскостью клинка прямо в воздухе.' }
      ]
    },
    comb_runes: {
      t: 'Рунные Камни и Глифы',
      icon: '💎',
      badge: 'Зачарование',
      lead: 'Эльфская магия рун. Превращает простое оружие в грозное орудие стихий и насыщает броню защитой.',
      rows: [
        { k: 'Руна Чернобог (Chernobog)', v: 'Увеличивает общую силу атаки меча и кинетическую энергию удара.' },
        { k: 'Руна Сварог (Svarog)', v: 'Пробивание брони — лезвие легче режет закаленные металлические латы и чешую.' },
        { k: 'Руна Велес (Veles)', v: 'Повышает силу сотворения всех ведьмачьих знаков при удерживании оружия в руке.' },
        { k: 'Руна Даждьбог (Dazhbog)', v: 'Шанс воспламенения цели при каждом успешном ударе меча.' },
        { k: 'Глифы Знаков (Глиф Квена, Игни, Аарда)', v: 'Вшиваются в подкладку ведьмачьего колета, снижая затраты выносливости и повышая сопротивляемость соответствующим стихиям.' },
        { k: 'Рунный мастер из Офира', v: 'Нанесение мощных слов силы («Рассечение», «Воодушевление», «Отражение») поверх стандартных ячеек рун.' }
      ]
    },
    lore_conjunction: {
      t: 'Сопряжение Сфер (Conjunction)',
      icon: '🌌',
      badge: 'Космология',
      lead: 'Величайшая космологическая катастрофа в истории мира. Столкновение параллельных вселенных.',
      rows: [
        { k: 'Суть катастрофы', v: 'Около 1500 лет назад миры на краткое мгновение наложились друг на друга. Космический разлом забросил на Континент людей, чудовищ из иных планов бытия и первородный Хаос (Магию).' },
        { k: 'До Сопряжения', v: 'Континент принадлежал Изначальным Народам: краснолюдам, гномам, а затем приплывшим на белых кораблях эльфам Aen Seidhe. В мире не было ни гулей, ни вампиров, ни людей.' },
        { k: 'Приход Людей', v: 'Люди прибыли на Континент на Первой Высадке (корабли Яна Беккера), быстро размножились, вытеснили Старшие Народы в горы и леса и основали королевства.' },
        { k: 'Необходимость ведьмаков', v: 'Люди массово гибли от клыков чудовищ. Короли и чародеи осознали, что обычные солдаты бессильны, и инициировали проект создания мутантов-охотников.' }
      ]
    },
    lore_trials: {
      t: 'Испытание Травами (Trial of Grasses)',
      icon: '🌿',
      badge: 'Мутация ведьмака',
      lead: 'Алхимический ад трансформации. Горнило, через которое мальчики становятся хладнокровными убийцами чудовищ.',
      rows: [
        { k: 'Подготовка к Испытанию', v: 'Мальчиков поят специальными травами, заставляют бегать «Мучильню» (полосу препятствий на скалах) и тренируют до изнеможения, развивая пластичность связок.' },
        { k: 'Сам ритуал Трав', v: 'Ребенка привязывают к каменному столу в лаборатории и вводят смесь из вирусных мутагенов, сока мандрагоры и экстрактов ядовитых трав. Процесс длится 7 дней в агонии.' },
        { k: 'Статистика выживания', v: 'Около 30-35% мальчиков переносят Испытание. Остальные умирают от отказа внутренних органов или безумия. Выжившие теряют пигмент, их глаза становятся кошачьими, а организм — стерильным.' },
        { k: 'Дополнительные мутации', v: 'Геральт из Ривии проявил феноменальную стойкость, и наставники подвергли его повторным экспериментальным мутациям, из-за чего его волосы навсегда побелели (Белый Волк).' },
        { k: 'Утрата секретов', v: 'После разгрома крепостей ведьмаков секреты проведения Испытания Травами были утеряны, и новые ведьмаки больше не создаются.' }
      ]
    },
    lore_north: {
      t: 'Северные Королевства (The North)',
      icon: '👑',
      badge: 'Четыре Королевства',
      lead: 'Земли четырех великих королевств Севера, вечно балансирующие между феодальными распрями и южной угрозой.',
      rows: [
        { k: 'Темерия (Temeria)', v: 'Королевство под знаком серебряных лилий. Столица — Вызима. Правитель — король Фольтест, опиравшийся на Синие Полоски Вернона Роше.' },
        { k: 'Редания (Redania)', v: 'Богатейшая держава со столицей в Третогоре. Знак — белый орел. Король Радовид V Свирепый и шеф тайной службы Сигизмунд Дийкстра.' },
        { k: 'Каэдвен (Kaedwen)', v: 'Суровое лесное северное королевство единорога со столицей в Ард Каррайге. Король Хенсельт. Земли крепости Каэр Морхен.' },
        { k: 'Аэдирн (Aedirn)', v: 'Промышленное и земледельческое сердце Севера со столицей в Венгерберге (родина Йеннифэр). Король Демавенд.' },
        { k: 'Острова Скеллиге (Skellige)', v: 'Суровый архипелаг воинов-мореплавателей кланов ан Крайт, друидов и ярлов, почитающих богиню Фрейю и море.' },
        { k: 'Вольный Город Новиград', v: 'Крупнейший торговый мегаполис Континента. Власть храма Вечного Огня, иерарха Хеммельфарта и четырех криминальных боссов.' }
      ]
    },
    lore_nilfgaard: {
      t: 'Империя Нильфгаард (Nilfgaard)',
      icon: '☀️',
      badge: 'Великое Солнце',
      lead: 'Великая империя Юга с непревзойденной военной машиной, золотыми башнями и железной волей императора.',
      rows: [
        { k: 'Империя Великого Солнца', v: 'Столица — Город Золотых Башен на реке Альба. Жесткая централизованная власть, идеальная армейская дисциплина, верховенство имперского права и развитая бюрократия.' },
        { k: 'Император Эмгыр вар Эмрейс', v: '«Белое Пламя, Пляшущее на Курганах Врагов» (Deithwen Addan yn Carn aep Morvudd). Расширил границы империи, подчинив Цинтру, Метинну, Туссент, Эббинг и Назаир.' },
        { k: 'Северные Войны', v: 'Три полномасштабных вторжения через реку Яругу с целью сокрушить раздробленные Северные Королевства. Битва при Содденском Холме и Битва под Бренной.' },
        { k: 'Отношение к ведьмакам', v: 'В Нильфгаарде ведьмаков считают бродягами и мутантами вне закона, однако спецслужбы империи охотно нанимали Школу Змеи для диверсий.' },
        { k: 'Княжество Туссент', v: 'Вассальное благословенное княжество вина, турниров, странствующих рыцарей и вечного солнца под правлением княгини Анны-Генриетты.' }
      ]
    },
    lore_code: {
      t: 'Кодекс Ведьмака и Право Неожиданности',
      icon: '📜',
      badge: 'Законы и традиции',
      lead: 'Мифы и правда о морали ведьмаков, нейтралитете, плате за жизнь чудовищ и законе Предназначения.',
      rows: [
        { k: 'Миф о «Кодексе Ведьмака»', v: 'Единого письменного кодекса никогда не существовало. Ведьмаки сами придумали «Кодекс», чтобы вежливо отказывать королям и баронам в грязных политических убийствах, ссылаясь на «запрет школы».' },
        { k: 'Главное реальное правило', v: 'Брать плату за работу. Бесплатная охота обесценивает ремесло и обрекает собратьев на голод. Ведьмак никогда не обнажает клинок без вознаграждения.' },
        { k: 'Принцип меньшего зла', v: '«Зло — это зло. Меньшее, большее, среднее — всё едино. Если приходится выбирать между одним злом и другим, я предпочитаю не выбирать вовсе» (Геральт из Ривии).' },
        { k: 'Право Неожиданности (Law of Surprise)', v: 'Древнейший закон Предназначения: «Отдай мне то, что дома оставил, но о чем еще не знаешь» или «То, что первое встретит тебя на пороге». Так ведьмаки находили детей-неожиданностей (Паветта, Цири).' },
        { k: 'Ведьмачий Медальон', v: 'Серебряный амулет школы, вибрирующий при приближении магии, чудовищ или пространственных разломов. Главное сокровище ведьмака.' }
      ]
    }
  };

  /* Экран каталога Справочника Континента */
  function wiRef(){
    var searchVal = (typeof WI !== 'undefined' && WI.refSearch) ? WI.refSearch.toLowerCase().trim() : '';

    var html = crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Справочник' }]) +
      '<button class="back" data-nav="wiHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiHome\');">← Назад</button>' +
      '<div class="wi-ref-header">' +
        '<h1 style="margin-bottom:6px;">📚 Справочник Континента</h1>' +
        '<div class="wi-ref-lead">Свод знаний цеха ведьмаков: знаки, 7 ведьмачьих школ, алхимия, масла, бестиарий чудовищ, фехтование и лор вселенной.</div>' +
        '<div class="wi-ref-search-wrap">' +
          '<span class="wi-ref-search-icon">🔍</span>' +
          '<input type="text" id="wiRefSearch" class="wi-ref-search-input" placeholder="Быстрый поиск по справочнику (аард, игни, волка, ласточка, гули, серебро, травы...)" value="' + escA(searchVal) + '">' +
        '</div>' +
      '</div>';

    var totalFound = 0;

    WI_REF_SECTIONS.forEach(function(sec){
      var filteredItems = sec.items.filter(function(it){
        if(!searchVal) return true;
        var haystack = (it.t + ' ' + it.d + ' ' + (it.tag || '')).toLowerCase();
        return haystack.indexOf(searchVal) !== -1;
      });

      if(filteredItems.length === 0) return;
      totalFound += filteredItems.length;

      html += '<div class="wi-ref-group-block">' +
        '<div class="wi-ref-group-title" style="border-left:3px solid ' + sec.color + ';">' +
          '<span>' + sec.group + '</span>' +
          '<span class="wi-ref-group-count">' + filteredItems.length + '</span>' +
        '</div>' +
        '<div class="menu-list grid-2">' +
          filteredItems.map(function(it){
            var navTarget = 'wiRefView:' + it.key;
            return '<div class="menu-item" data-nav="' + escA(navTarget) + '" onclick="if(typeof window.navigate===\'function\') window.navigate(\'' + escA(navTarget) + '\');" style="position:relative;cursor:pointer;">' +
              '<div>' +
                '<div class="name" style="display:flex;align-items:center;gap:8px;">' +
                  it.icon + ' ' + esc(it.t) +
                  (it.tag ? '<span class="wi-ref-item-tag">' + esc(it.tag) + '</span>' : '') +
                '</div>' +
                '<div class="desc">' + esc(it.d) + '</div>' +
              '</div>' +
              '<div class="arrow">›</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
    });

    if(totalFound === 0 && searchVal){
      html += '<div class="char-empty" style="margin-top:24px;">По запросу «' + esc(searchVal) + '» ничего не найдено в справочнике Континента. Попробуйте другой запрос.</div>';
    }

    return html;
  }

  /* Экран детального просмотра статьи Справочника Континента */
  function wiRefView(key){
    var r = WI_REF[key];
    if(!r) return wiRef();

    var crumb = crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Справочник', nav: 'wiRef' }, { label: r.t }]) +
      '<button class="back" data-nav="wiRef" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiRef\');">← Назад в Справочник</button>';

    var header = '<div class="wi-ref-header">' +
      '<div class="wi-ref-header-top">' +
        '<div class="wi-ref-title-wrap">' +
          '<h1 style="margin-bottom:4px;">' + (r.icon || '📖') + ' ' + esc(r.t) + '</h1>' +
          (r.badge ? '<span class="wi-ref-header-badge">' + esc(r.badge) + '</span>' : '') +
        '</div>' +
        '<button class="wi-ref-copy-btn" id="wiCopyRefLoreBtn" data-ref-key="' + escA(key) + '" title="Скопировать лор статьи в буфер">' +
          '📋 Скопировать лор' +
        '</button>' +
      '</div>' +
      (r.lead ? '<div class="wi-ref-lead">' + esc(r.lead) + '</div>' : '') +
    '</div>';

    var cards = '<div class="wi-ref-cards-grid">' +
      (r.rows || []).map(function(x){
        return '<div class="wi-ref-card">' +
          '<div class="wi-ref-card-k">' + esc(x.k) + '</div>' +
          '<div class="wi-ref-card-v">' + esc(x.v).replace(/\n/g, '<br>') + '</div>' +
        '</div>';
      }).join('') +
    '</div>';

    return '<div class="wi-ref-box">' + crumb + header + cards + '</div>';
  }

  function wireWiRef(){
    var searchInput = document.getElementById('wiRefSearch');
    if(searchInput){
      searchInput.addEventListener('input', function(){
        if(typeof WI !== 'undefined') WI.refSearch = searchInput.value;
        var query = searchInput.value.toLowerCase().trim();
        var blocks = document.querySelectorAll('.wi-ref-group-block');
        blocks.forEach(function(block){
          var items = block.querySelectorAll('.menu-item');
          var visibleInBlock = 0;
          items.forEach(function(item){
            var text = (item.textContent || '').toLowerCase();
            if(!query || text.indexOf(query) !== -1){
              item.style.display = '';
              visibleInBlock++;
            } else {
              item.style.display = 'none';
            }
          });
          block.style.display = visibleInBlock ? '' : 'none';
          var cntBadge = block.querySelector('.wi-ref-group-count');
          if(cntBadge) cntBadge.textContent = visibleInBlock;
        });
      });
    }
    wireWiNav();
  }

  function wireWiRefView(key){
    var copyBtn = document.getElementById('wiCopyRefLoreBtn');
    if(copyBtn){
      copyBtn.addEventListener('click', function(){
        var rk = copyBtn.getAttribute('data-ref-key') || key;
        var r = (typeof WI_REF !== 'undefined' ? WI_REF[rk] : null);
        if(!r) return;
        var lines = ['*[' + (r.icon ? r.icon + ' ' : '') + r.t + ']*'];
        if(r.badge) lines.push('Категория: ' + r.badge);
        if(r.lead) lines.push(r.lead);
        lines.push('');
        (r.rows || []).forEach(function(rw){
          lines.push('• ' + rw.k + ': ' + rw.v.replace(/\n/g, ' '));
        });
        var text = lines.join('\n');
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(text).then(function(){
            WI.toast('✓ Лор скопирован в буфер!', 'success');
          }).catch(function(){
            WI.toast('Лор скопирован!', 'info');
          });
        } else {
          WI.toast('✓ Скопировано в буфер!', 'success');
        }
      });
    }
    wireWiNav();
  }

  /* ============================================================
     СПОСОБНОСТИ И МАГИЯ (WITCHER ABILITIES / TECHS)
     ============================================================ */

  var WI_TECHS_KEY = 'ttc_wi_techs';
  var WI_MOVES_KEY = 'ttc_wi_moves';
  var WI_MARKERS_KEY = 'ttc_wi_markers';
  var WI_ROUTE_KEY = 'ttc_wi_route_v2';
  var WI_TACTICAL_KEY = 'ttc_wi_tactics_v3';

  var DEFAULT_WI_TECHS = [];
  var DEFAULT_WI_MOVES = [];
  var OLD_DEFAULT_TECH_IDS = ['wi_tech_aard', 'wi_tech_igni', 'wi_tech_quen', 'wi_tech_axii', 'wi_tech_yrden', 'wi_tech_heliotrop', 'wi_tech_alzurs_thunder', 'wi_tech_fireball', 'wi_tech_portal', 'wi_tech_euphoria', 'wi_tech_warcry', 'wi_tech_bard_mock'];
  var OLD_DEFAULT_MOVE_IDS = ['wi_move_whirl', 'wi_move_rend', 'wi_move_pirouette', 'wi_move_riposte', 'wi_move_deflect', 'wi_move_shield_bash', 'wi_move_low_sweep', 'wi_move_aimed_shot'];

  var WI_MAP_LOCATIONS = [
    /* --- ВЕДЬМАЧЬИ ШКОЛЫ И ЦИТАДЕЛИ (7 ШКОЛ) --- */
    { id: 'kaer_morhen', name: 'Каэр Морхен (Школа Волка)', x: 2595, y: 245, icon: '🐺', type: 'witcher', regionKey: 'kaedwen_aedirn', region: 'Синие Горы (Каэдвен)', ruler: 'Весемир (Мастер Школы Волка)', climate: 'Суровый высокогорный, ледники', danger: 'Высокая (Дикая Охота, горные бестии)', population: '5–8 ведьмаков на зимовке (в древности ~40)', economy: 'Алхимическая лаборатория, кузня,猎-промысел в долине Гвенллех', inn: 'Главный зал Каэр Морхена (Каэдвенский стаут и «Белая Чайка» — бесплатно для своих)', factions: 'Братство Школы Волка, Ложа (гости)', npcs: 'Весемир, Геральт, Эскель, Ламберт, Цирилла, Лето', monsters: 'Вилохвосты, гарпии, старый чёрт, экимы, Гончие Дикой Охоты', rumors: ['В заброшенном бастионе у озера слышны голоса мальчиков, погибших во время погрома фанатиков.', 'В старой штольне под горой пробудился элементаль земли, охраняющий чертежи гроссмейстерских доспехов Волка.'], desc: 'Крепость Старого Моря в уединённом ущелье Синих Гор. Древняя цитадель Школы Волка, построенная на морских окаменелостях, где ведьмаки пережидают зимние бураны на Мучильне.' },
    { id: 'kaer_seren', name: 'Руины Каэр Серен (Школа Грифона)', x: 720, y: 560, icon: '🦅', type: 'witcher', regionKey: 'kovir', region: 'Морской берег Повисса', ruler: 'Эрланд из Ларвика / Койон (в прошлом)', climate: 'Скалистый морской утёс, шторма', danger: 'Высокая (Лавины, элементали)', population: 'Заброшенная цитадель (призраки и стихийные стражи)', economy: 'Древняя библиотека магии Знаков и алхимических манускриптов', inn: 'Прибрежный грот контрабандистов Повисса в 4 милях к югу (2 кроны за ночлег)', factions: 'Школа Грифона (в прошлом), Чародеи-ренегаты', npcs: 'Дух Эрланда из Ларвика, Келдар, Койон', monsters: 'Архигрифоны, ледяные элементали, сирены, гаргульи', rumors: ['Завистливые чародеи обрушили скальную лавину на крепость, когда ведьмаки Грифона отказались делиться эликсирами.', 'Под завалами тронного зала всё ещё горит вечный магический очаг, усиливающий Знаки втрое.'], desc: 'Разрушенная магическим обвалом прибрежная твердыня ведьмаков Школы Грифона у подножия Пастушьих Гор в Повиссе. Славилась рыцарским кодексом и глубоким изучением Знаков.' },
    { id: 'haern_caduch', name: 'Руины Хаэрн Кадух (Школа Медведя)', x: 2210, y: 2040, icon: '🐻', type: 'witcher', regionKey: 'nilfgaard', region: 'Горы Амелл (Геммера)', ruler: 'Арнагад (Основатель Школы Медведя)', climate: 'Заснеженные пики Амелл', danger: 'Высокая (Горные тролли, призраки)', population: 'Руины в ледниках (изредка заходят отшельники Медведя)', economy: 'Тяжёлая броня, горный хрусталь и метеоритная руда', inn: 'Перевальное зимовье пастухов Амелл (горячий сбитень и баранина — 4 флорена)', factions: 'Школа Медведя, Горные кланы Амелл', npcs: 'Арнагад, Герд, Иво из Бельхавена', monsters: 'Ледяные тролли, белые волки, альпы, виверны', rumors: ['В склепах под цитаделью покоится скелет гигантского пещерного медведя, чью шкуру носил сам Арнагад.', 'Ведьмак Герд спрятал в оружейной чертежи тяжёлого арбалета и стальных пластинчатых доспехов.'], desc: 'Суровая горная цитадель ведьмаков Школы Медведя среди ледяных хребтов Амелл на границе с Туссентом и Геммерой.' },
    { id: 'gorthur_gvaed', name: 'Руины Гортур Гваэд (Школа Змеи)', x: 2510, y: 3120, icon: '🐍', type: 'witcher', regionKey: 'nilfgaard', region: 'Хребет Тир Тохар', ruler: 'Ивар Злобоглаз / Лето из Гулеты', climate: 'Скалистые пики над ущельем', danger: 'Смертельная (Призраки, сколопендроморфы)', population: 'Разрушена узурпатором Нильфгаарда', economy: 'Тайные архивы о Дикой Охоте и парные клинки с ядами', inn: 'Пещерный схрон ведьмаков Змеи у горного ручья', factions: 'Школа Змеи, Имперская разведка Ватье де Ридо', npcs: 'Лето из Гулеты, Зеррит, Эган, Ивар Злобоглаз, Кольгрим', monsters: 'Мантикоры, василиски, куролиски, призраки', rumors: ['В подземельях Гортур Гваэд хранятся фолианты на Старшей Речи о природе Всадников Дикой Охоты и Короля Ольх.', 'Император Эмгыр обещал Лето восстановить цитадель Змеи в обмен на головы королей Севера.'], desc: 'Цитадель Клинка Тьмы в неприступных горах Тир Тохар. Оплот ведьмаков Школы Змеи, владевших бесшумным боем парными мечами и знаниями о мире Aen Elle.' },
    { id: 'dyn_marv', name: 'Караван Дин Марв (Школа Кота)', x: 1840, y: 1250, icon: '🐱', type: 'witcher', regionKey: 'temeria', region: 'Граница Темерии и Аэдирна', ruler: 'Гезрас из Лейды / Трегубова', climate: 'Кочевой лагерь у лесных трактов', danger: 'Высокая (Наёмные убийцы, мутанты)', population: 'Кочующее братство (~15 ведьмаков-изгоев и эльфов)', economy: 'Заказные убийства, охрана караванов, контрабанда мутагенов', inn: 'Походный шатёр «Чёрный Кот» (эльфийская настойка и кости — 5 оренов)', factions: 'Школа Кота, Скоя\'таэли', npcs: 'Гаэтан, Шрёдингер, Киян, Айден, Бреген (Кот из Иелло)', monsters: 'Наёмники, бруксы, главоглазы, оборотни', rumors: ['После падения замка Стигга остатки Школы Кота кочуют в расписных фургонах Дин Марв между Марибором и Элландером.', 'Некоторые ведьмаки Кота принимают заказы не только на чудовищ, но и на баронов и купцов.'], desc: 'Легендарный кочевой караван фургонов Школы Кота, ставший их домом после захвата замка Стигга. Приют ловких фехтовальщиков с нестабильными мутациями.' },
    { id: 'manticore_keep', name: 'Цитадель Тир Тохар (Школа Мантикоры)', x: 2680, y: 2790, icon: '🦂', type: 'witcher', regionKey: 'nilfgaard', region: 'Восточный склон Тир Тохар / Корат', ruler: 'Магистры Школы Мантикоры', climate: 'Сухой пустынный каньон', danger: 'Экстремальная (Королевские мантикоры, скорпионы)', population: 'Уединённый орден пустынных ведьмаков', economy: 'Взрывчатые смеси, зерриканский огонь, тяжёлые эликсиры', inn: 'Караван-сарай «Оазис Миражей» у подножия хребта (6 золотых флоренов)', factions: 'Школа Мантикоры, Купцы Зеррикании и Хакланда', npcs: 'Ведьмак Мертен, странствующие алхимики Зеррикании', monsters: 'Имперские мантикоры, песчаные черви, гоголоворы, василиски', rumors: ['Ведьмаки Мантикоры пьют по пять эликсиров зараз благодаря особой закалке печени ядом скорпионов.', 'Их щиты и кривые клинки выкованы по секретам кузнецов Зеррикании.'], desc: 'Восточная твердыня ведьмаков Школы Мантикоры на границе пустыни Корат и караванных троп в Зерриканию. Мастера алхимии, бомб и высокой интоксикации.' },
    { id: 'crane_eyrie', name: 'Гнездо Школы Журавля', x: 960, y: 1295, icon: '🦩', type: 'witcher', regionKey: 'temeria', region: 'Скалы побережья Сидариса', ruler: 'Капитаны-ведьмаки Школы Журавля', climate: 'Океанские утёсы и штормовые бухты', danger: 'Высокая (Кракен, сирены, морские змеи)', population: 'Малый прибрежный бастион морских охотников', economy: 'Охрана галеонов, добыча амбры и жемчуга, гарпунный промысел', inn: 'Таверна «Сломанный Бушприт» в бухте (3 кроны)', factions: 'Школа Журавля, Адмиралтейство Сидариса', npcs: 'Мастер Лукашевич, корсары Великого Моря', monsters: 'Эхидны, мелюзины, дагоны, морские черти', rumors: ['Ведьмаки Журавля сражаются на палубах кораблей с помощью гарпунов, канатов и ранних кремнёвых пистолетов.', 'В бухте под башней видели щупальца древнего глубоководного кракена.'], desc: 'Морской бастион ведьмаков Школы Журавля на отвесных скалах Великого Моря, специализирующихся на охоте на воздушных и океанических чудовищ.' },

    /* --- РЕДАНИЯ, ВОЛЬНЫЙ НОВИГРАД И ВЕЛЕН --- */
    { id: 'novigrad', name: 'Вольный Город Новиград', x: 1170, y: 1025, icon: '🏰', type: 'capital', regionKey: 'redania', region: 'Вольный Город / Редания', ruler: 'Иерарх Хеммельфарт / Совет Синдиката', climate: 'Приморский порт, умеренный', danger: 'Высокая (Охотники за колдуньями, банды)', population: '30 000+ жителей (крупнейший мегаполис)', economy: 'Банк Вивальди, морской порт, судоверфи, торговля со всем миром', inn: 'Корчма «Зимородок» (на площади Иерарха) и бордель «Пассифлора» (10–25 крон)', factions: 'Церковь Вечного Огня, «Большая Четвёрка» Синдиката, Реданская разведка', npcs: 'Сигизмунд Дийкстра, Король Нищих, Тесак, Ублюдок Младший, Золтана Хивай, Лютик, Присцилла, Трисс Меригольд', monsters: 'Допплеры, суккубы, высшие вампиры (Катакан в каналах), гули за стенами', rumors: ['В подземных коллекторах под Обрезками кто-то оставляет обескровленные тела проповедников Вечного Огня.', 'В казне Сигизмунда Дийкстры под банями пропали двадцать тонн золота Синдиката.'], desc: 'Столица мира по словам горожан: богатейший торговый порт Континента, освещённый девятнадцатью маяками и кострами Вечного Огня.' },
    { id: 'temple_isle', name: 'Храмовый Остров (Новиград)', x: 1142, y: 998, icon: '🔥', type: 'magic', regionKey: 'redania', region: 'Вольный Город Новиград', ruler: 'Иерарх Хеммельфарт и Калеб Менге', climate: 'Скалистый остров над заливом Понтара', danger: 'Смертельная для магов и нелюдей', population: '4 000 жрецов, патрициев и храмовой стражи', economy: 'Церковная десятина, конфискованное золото чародеев, реликвии', inn: 'Постоялый двор «Семь Котов» в предместье (6 крон)', factions: 'Храмовая стража, Охотники за колдуньями', npcs: 'Калеб Менге, Иерарх Хеммельфарт, Чаппел (допплер Дуду)', monsters: 'Призраки замученных в казематах, горгульи', rumors: ['В подземельях казарм Охотников за колдуньями держат плененную чародейку из Ложи.', 'Под фундаментом Великого Храма скрыто древнее эльфийское святилище со стеной силы.'], desc: 'Величественный верхний остров Новиграда с девятнадцатью золотыми алтарями Вечного Огня, резиденцией Иерарха и штабом Калеба Менге.' },
    { id: 'oxenfurt', name: 'Оксенфурт', x: 1265, y: 1035, icon: '🎓', type: 'magic', regionKey: 'redania', region: 'Редания', ruler: 'Королевский магистрат и Король Радовид V', climate: 'Речная пойма Понтара', danger: 'Средняя (Реданская гвардия, катакан)', population: '12 000 горожан и школяров', economy: 'Оксенфуртская Академия, алхимия, книгопечатание, таможня на Понтаре', inn: 'Таверна «Алхимия» (студенческое пиво — 3 кроны, жареный гусь — 5 крон)', factions: 'Учёные Оксенфуртской Академии, Ставка Радовида V, Реданская разведка', npcs: 'Шани, Профессор Прехтль, Радовид V Свирепый, Гаэль (вампир)', monsters: 'Катакан («Оксенфуртский кровопийца»), накеры у паромной переправы, гули', rumors: ['Академия закрыта указом короля Радовида, но в анатомическом театре по ночам всё равно горят свечи.', 'Пьяниц, возвращающихся из таверны «Алхимия», находят в переулках без единой капли крови.'], desc: 'Город студентов, философов, алхимиков и поэтов на северном берегу Понтара. Знаменит старейшим университетом Севера и каменными мостами.' },
    { id: 'tretogor', name: 'Третогор', x: 1505, y: 805, icon: '🏛️', type: 'capital', regionKey: 'redania', region: 'Редания', ruler: 'Король Радовид V / Регентский совет', climate: 'Хлебные равнины Севера', danger: 'Средняя (Тайная служба Редании)', population: '18 000 жителей', economy: 'Зерновые житницы, королевский монетный двор, оружейные мануфактуры', inn: 'Трактир «Под Белым Орлом» (8 крон за комнату с камином)', factions: 'Двор Редании, Реданская Секретная Служба, Орден Пылающей Розы', npcs: 'Филиппа Эйльхарт, Сигизмунд Дийкстра, граф Ори Ройвен', monsters: 'Высшие вампиры при дворе, бруксы, полуденницы на пшеничных полях', rumors: ['В подземных казематах замка Третогора до сих пор ищут следы заговорщиков, убивших короля Визимира II.', 'Ослеплённая Филиппа Эйльхарт обратилась в сову и улетела из башни прямо сквозь магическую решётку.'], desc: 'Официальная королевская столица Редании с неприступным замком, резиденцией монархов и главным архивом разведки.' },
    { id: 'blaviken', name: 'Блавикен', x: 1310, y: 510, icon: '⚔️', type: 'city', regionKey: 'redania', region: 'Редания / Лукоморье', ruler: 'Войт Калькштейн / Чародей Стрегобор', climate: 'Приморский залив Пракседа', danger: 'Средняя (Банды наёмников, морские чудовища)', population: '3 500 жителей', economy: 'Рыболовство, ярмарка Лукоморья, соляные варницы', inn: 'Корчма «Под Золотым Судаком» (пиво и копчёная камбала — 2 кроны)', factions: 'Городская управа Блавикена, Башня чародея Ирзион', npcs: 'Чародей Стрегобор, Войт Калькштейн, Ренфри (Сорокопутка)', monsters: 'Кикимора в болотах за околицей, утопцы, сирены', rumors: ['Местные до сих пор шепчутся о дне ярмарки, когда Белый Волк в одиночку перебил всю ганзу Ренфри на рыночной площади.', 'Чародей Стрегобор заперся в своей иллюзорной башне и скупает тела мутантов для вскрытия.'], desc: 'Приморский городок в Лукоморье, где Геральт выбрал «меньшее зло» и получил мрачное прозвище Мясник из Блавикена.' },
    { id: 'crinfrid', name: 'Кринфрид', x: 1620, y: 470, icon: '🐉', type: 'city', regionKey: 'kovir', region: 'Лига Хенгфорса / Кринфрид', ruler: 'Князь Кринфрида', climate: 'Предгорья Пустельских гор', danger: 'Высокая (Дракониды, виверны)', population: '4 200 жителей', economy: 'Охота на драконидов, выделка чешуйчатых панцирей, рудники', inn: 'Корчма «Разрубленный Вилохвост» (4 кроны)', factions: 'Рубайлы из Кринфрида (Бохун, Нищук и Кеннет)', npcs: 'Бохун, Нищук, Живодер из Кринфрида', monsters: 'Ослизги, вилохвосты, королевские виверны, драконы', rumors: ['Знаменитые Рубайлы из Кринфрида истребили всех ослизгов в округе и теперь ищут след настоящего Золотого Дракона.', 'Оружейник на окраине куёт щиты из панциря старого вилохвоста, не пробиваемые даже арбалетным болтом.'], desc: 'Суровый северный город у Пустельских гор, родина бесстрашных наёмников и охотников на драконов — Рубайл из Кринфрида.' },
    { id: 'drakenborg', name: 'Крепость Дракенборг', x: 1410, y: 920, icon: '⛓️', type: 'city', regionKey: 'redania', region: 'Редания', ruler: 'Комендант тюрьмы (Тайная полиция)', climate: 'Холодная лесная чаща', danger: 'Высокая (Карательные отряды)', population: '1 500 стражников и узников', economy: 'Главный острог и лагерь военнопленных Редании', inn: 'Застава у тракта (только для офицеров и гонцов)', factions: 'Реданская военная юстиция, Охотники за колдуньями', npcs: 'Дийкстра, узники скоя\'таэли и политические заговорщики', monsters: 'Альгули и гравейры у рвов вокруг острога', rumors: ['Говорят, из Дракенборга ещё никто не выходил живым — даже эльфийские командиры бригады «Врихедд».', 'По ночам вокруг стен крепости бродят стаи альгулей, прикормленных тюремщиками.'], desc: 'Зловещая государственная тюрьма и крепость Редании, куда свозят пленных скоя\'таэлей, шпионов Нильфгаарда и мятежников.' },
    { id: 'roggeveen', name: 'Роггевеен', x: 1095, y: 1120, icon: '🌊', type: 'city', regionKey: 'redania', region: 'Побережье Редании / Сидарис', ruler: 'Магистрат Роггевеена', climate: 'Скалистый морской берег', danger: 'Средняя (Морские разбойники)', population: '5 000 жителей', economy: 'Маяки, китобойный промысел, алхимические лавки', inn: 'Трактир «Под Чёрной Чайкой» (3 кроны)', factions: 'Цех мореходов, Братство Чародеев', npcs: 'Вильгефорц из Роггевеена (уроженец водосточных канав города)', monsters: 'Топцы, агуары, туманники у маяка', rumors: ['В трущобах этого портового города некогда нашли брошенного младенца, ставшего могущественнейшим магом Вильгефорцем.', 'Маяк на Чёрном мысу погас три ночи назад — смотритель бесследно исчез.'], desc: 'Старинный приморский город к югу от устья Понтара, известный как место рождения чародея Вильгефорца.' },
    { id: 'crows_perch', name: 'Вроницы (Crow\'s Perch)', x: 1180, y: 1115, icon: '🏰', type: 'city', regionKey: 'temeria', region: 'Велен (Ничейная Земля)', ruler: 'Филипп Стенгер (Кровавый Барон) / Сержант Ардаль', climate: 'Болота и топи Ничейной Земли', danger: 'Смертельная (Чудовища Велена)', population: '450 кметов и солдат Барона', economy: 'Военные трофеи, кузня мастера Фергуса и Иоанны, оброк с деревень', inn: 'Дворцовая корчма Врониц (самогон на брюкве и сало — 2 кроны)', factions: 'Люди Кровавого Барона, Нильфгаардские квартирьеры', npcs: 'Кровавый Барон (Филипп Стенгер), Тамара, бронница Иоанна и Фергус Грем, Игоша/Чур', monsters: 'Игоша (проклятое дитя), водные бабы, виверна на башне, гули', rumors: ['По ночам из сада за барским теремом доносится леденящий душу плач нерождённого младенца.', 'Подлинным мастером-бронником в замке является не краснолюд Фергус, а его молчаливая подмастерье Иоанна со Скеллиге.'], desc: 'Укреплённый частоколом замок Кровавого Барона на холме посреди раздираемых войной и голодом болот Велена.' },
    { id: 'hangmans_tree', name: 'Дерево Висельников (Велен)', x: 1320, y: 1140, icon: '🌳', type: 'nature', regionKey: 'temeria', region: 'Велен (Ничейная Земля)', ruler: 'Ничейная Земля / Дезертиры', climate: 'Выжженные поля и распутица', danger: 'Высокая (Дезертиры, трупоеды)', population: 'Перекрёсток военных дорог (без постоянных жителей)', economy: 'Трофеи мародёров на тракте', inn: 'Корчма «На распутье» неподалёку на западе (3 кроны)', factions: 'Дезертиры Темерии, мародёры', npcs: 'Золтан Хивай (встреча у дерева), учёный из Оксенфурта (квест Гвинта)', monsters: 'Гули, альгули, одичавшие псы, трупоеды', rumors: ['Под корнями дуба зарыта шкатулка повешенного реданского казначея с золотыми кронами.', 'Стая альгулей выходит на пир к дереву каждую полночь после дождя.'], desc: 'Мрачный вековой дуб на перекрёстке военных трактов Велена, увешанный жертвами Третьей Северной войны.' },
    { id: 'crookback_bog', name: 'Кривоуховы Топи (Приют)', x: 1295, y: 1215, icon: '🌫️', type: 'nature', regionKey: 'temeria', region: 'Велен (Кривоуховы Топи)', ruler: 'Хозяйки Леса (Пряха, Ткаха, Шептуха)', climate: 'Зловонная трясина и вечный туман', danger: 'Экстремальная (Ведьмы, бесы, водные бабы)', population: 'Сироты приюта и отшельники Сладкой Тропинки', economy: 'Кровавая дань отрезанными ушами и волосами крестьян', inn: 'Нет (только хижины приюта на болотной гати)', factions: 'Культ Хозяек Леса', npcs: 'Пряха, Ткаха, Шептуха, Анна Стенгер, Ивасик (прибожек), Дух Шепчущего Холма', monsters: 'Хозяйки Леса (Реликты), бес Морвудд, древний туманник Игнис Фатуус, водные бабы', rumors: ['Дети, отправленные голодающими кметами по «Сладкой тропинке», исчезают после визита к гобелену из человеческих волос.', 'Под корнями Шепчущего Холма бьётся живое чёрное сердце древнего духа, ненавидящего Ведьм.'], desc: 'Древнее проклятое болото в сердце Велена, где властвуют три хтонические Ведьмы и стоит Шепчущий Холм.' },
    { id: 'fyke_isle', name: 'Остров Коломница (Fyke Isle)', x: 1215, y: 1170, icon: '🕯️', type: 'magic', regionKey: 'temeria', region: 'Озеро в Велене', ruler: 'Призрак Анабелль (Моровая Дева)', climate: 'Туманный озёрный остров', danger: 'Смертельная (Моровая дева, полуночницы, гули)', population: 'Разрушенная башня лорда Всерада (необитаема)', economy: 'Алхимические записи чародея Александара о чуме «Катриона»', inn: 'Рыбацкий причал у деревни Рудник (1 крона)', factions: 'Призраки бунта кметов, Кейра Мец', npcs: 'Кейра Мец, призрак Анабелль, рыбак Всеслав', monsters: 'Моровая дева (Песта), полуночницы, гнильцы, утопцы', rumors: ['В башне на острове чародей ставил опыты на крысах и чуме, пока голодные крестьяне не пошли на приступ.', 'Магический светильник Кейры Мец позволяет услышать голоса мертвецов, погибших в башне.'], desc: 'Проклятый остров посреди озера в Велене с полуразрушенной башней, кишащей призраками и крысами.' },
    { id: 'bald_mountain', name: 'Лысая Гора (Велен)', x: 1355, y: 1255, icon: '🔥', type: 'magic', regionKey: 'temeria', region: 'Южный Велен', ruler: 'Имлерих и Хозяйки Леса', climate: 'Грозовой скалистый пик над топями', danger: 'Экстремальная (Шабаш, Имлерих, сильван)', population: 'Поселение у подножия (раз в год — тысячи паломников Шабаша)', economy: 'Дары Хозяйкам и волшебные жёлуди векового дуба', inn: 'Шатры праздника Шабаша у костров', factions: 'Дикая Охота (Имлерих), Хозяйки Леса, Верующие Велена', npcs: 'Полководец Имлерих, привратник Фугас (сильван), Текла', monsters: 'Имлерих, сильван Фугас, гарпии, виверны', rumors: ['Раз в году на вершине под гигантским дубом проходит кровавый Шабаш, где избранных угощают волшебными желудями.', 'В пещере под корнями дуба кипит котёл Ведьм, а на вершине ждёт боя сам Имлерих из Дикой Охоты.'], desc: 'Священная и зловещая гора в южном Велене, увенчанная исполинским мёртвым дубом — место ежегодного Шабаша.' },
    { id: 'midcopse', name: 'Подлесье и Залипье (Велен)', x: 1140, y: 1145, icon: '🌾', type: 'city', regionKey: 'temeria', region: 'Западный Велен', ruler: 'Староста Болька', climate: 'Лесные опушки и курганы', danger: 'Высокая (Варги, призраки, беорн)', population: '300 кметов', economy: 'Лесозаготовки, бортничество, травы ворожеи', inn: 'Сельская корчма Залипья (1 крона)', factions: 'Селяне Велена, Кейра Мец (под видом деревенской ведуньи)', npcs: 'Кейра Мец, староста Болька, охотник Мыслав, Лето из Гулеты (в поместье Реардон)', monsters: 'Волколак Ниеллен, полуденница («Лихо у колодца»), эльфийский голем в руинах', rumors: ['В соседнем заброшенном поместье Реардон кто-то расставил десятки арбалетных растяжек и медвежьих капканов.', 'В эльфийских руинах под деревней искал убежище таинственный эльфский чародей в золотой маске.'], desc: 'Бедные деревни западного Велена на границе густых лесов, где скрывалась чародейка Кейра Мец и прятался Лето.' },

    /* --- ТЕМЕРИЯ, СОДДЕН И ДОЛИНА ПОНТАРА --- */
    { id: 'vizima', name: 'Вызима', x: 1615, y: 1125, icon: '👑', type: 'capital', regionKey: 'temeria', region: 'Темерия', ruler: 'Король Фольтест / Император Эмгыр вар Эмрейс', climate: 'Озёрная долина, влажный', danger: 'Средняя (Королевская стража / Гвардия «Импера»)', population: '22 000 жителей', economy: 'Столичная торговля, оружейные ряды, королевский дворец, мануфактуры', inn: 'Корчма «Под Кудлатым Мишкой» (в Храмовом квартале) и «Новый Наракорт» (8 оренов)', factions: 'Синие Полоски (Вернон Роше), Орден Пылающей Розы, Ставка Императора Эмгыра', npcs: 'Король Фольтест, Вернон Роше, Талер, принцесса Адда, камергер Морвран Воорхис', monsters: 'Стрыга в склепе Старой Вызимы, гравейры на кладбище, гули, риггер в каналах', rumors: ['Говорят, проклятие принцессы Адды может вернуться, если кто-то снова нарушит печать саркофага в Старой Вызиме.', 'В канализации под Храмовым кварталом поселился чудовищный риггер и культ Львиноголового Паука.'], desc: 'Древняя столица Темерии на берегу озера Вызима: Королевский дворец, Купеческий и Храмовый кварталы и мрачная дамба.' },
    { id: 'white_orchard', name: 'Белый Сад (White Orchard)', x: 1680, y: 1175, icon: '🌸', type: 'city', regionKey: 'temeria', region: 'Темерия', ruler: 'Нильфгаардский гарнизон (Петер Саар Гвинлеве)', climate: 'Цветущие яблоневые сады и река Ина', danger: 'Высокая (Царственный грифон, гули, утопцы)', population: '380 жителей + имперский гарнизон', economy: 'Яблоневые сады, лесопилка, травничество, пасека Томиры', inn: 'Корчма Белого Сада (хозяйка Эльза — вишнёвка на спирту и гусятина, 2 кроны)', factions: 'Гарнизон Нильфгаарда, Темерские партизаны', npcs: 'Капитан Петер Саар Гвинлеве, травница Томира, кузнец Виллис, купец Гюнтер О\'Дим', monsters: 'Царственный грифон, полуденница («Лихо у колодца»), медведь у Места Силы, гули на поле боя', rumors: ['В корчме видели странного лысоватого человека по имени Гюнтер О\'Дим, называющего себя Господином Зеркало.', 'На старом кладбище за мельницей змеиный ведьмак Кольгрим оставил чертежи отравленных клинков.'], desc: 'Живописная темерская долина с цветущими яблоневыми садами, где Геральт и Весемир начали поиски Йеннифэр.' },
    { id: 'gors_velen', name: 'Горс Велен', x: 1240, y: 1230, icon: '🏛️', type: 'city', regionKey: 'temeria', region: 'Темерия / Побережье', ruler: 'Городской магистрат и чародеи', climate: 'Морское побережье', danger: 'Средняя (Виверна на базаре, воры)', population: '11 000 жителей', economy: 'Банк Чианфанелли, морская торговля, снабжение академии Аретуза', inn: 'Таверна «Под Серебряной Цаплей» (7 крон)', factions: 'Капитул Чародеек (Аретуза), Банк гномов Чианфанелли', npcs: 'Мольнар Чианфанелли, Фабио Сахс, чародейки Кейра Мец и Маргарита Ло-Антиль', monsters: 'Виверны (в клетках ярмарки), сирены у волнореза', rumors: ['В банях «Под Серебряной Цаплей» чародейки ведут тайные переговоры накануне бунта на Танедде.', 'Молодой клерк Фабио Сахс мечтает уплыть из порта Горс Велена к неведомым берегам на западе.'], desc: 'Богатый приморский город Темерии, соединённый древним каменным мостом с волшебным островом Танедд.' },
    { id: 'thanedd', name: 'Остров Танедд (Аретуза и Тор Лара)', x: 1175, y: 1185, icon: '🔮', type: 'magic', regionKey: 'temeria', region: 'Темерия / Остров Танедд', ruler: 'Ректор Маргарита Ло-Антиль / Тиссая де Врие', climate: 'Морские ветра, скалистый остров-гора', danger: 'Экстремальная (Магические аномалии, нестабильные порталы)', population: '300 адепток и магистров (до бунта 1267 г.)', economy: 'Высшая школа магии Аретуза, артефакты, эльфийские залы Гарштанга', inn: 'Гостевые покои дворца Локсия (для приглашённых послов и чародеев)', factions: 'Капитул и Совет Чародеев, Ложа Чародеек', npcs: 'Тиссая де Врие, Маргарита Ло-Антиль, Вильгефорц, Йеннифэр, Филиппа Эйльхарт', monsters: 'Элементали молний, фантомы разорванного портала Тор Лара', rumors: ['На самой вершине острова рухнула древняя Башня Чайки (Тор Лара), чей искажённый портал выбросил Цири в пустыню Корат.', 'В пещере под основанием скалы бьётся первородная Сила Земли и Воды.'], desc: 'Священный остров чародеев, высеченный эльфами из цельной скалы: дворцы Локсия, Гарштанг и академия Аретуза.' },
    { id: 'maribor', name: 'Марибор', x: 1735, y: 1380, icon: '🏰', type: 'city', regionKey: 'temeria', region: 'Темерия', ruler: 'Князь-наместник Марибора', climate: 'Старые дубравы реки Ина', danger: 'Средняя', population: '15 000 жителей', economy: 'Пивоварни («Мариборское тёмное»), кузнечные цеха, торговый узел', inn: 'Корчма «Золотой Жёлудь» (знаменитый мариборский эль — 3 орена)', factions: 'Темерская армия, Гильдия пивоваров, Жрицы Мелитэле', npcs: 'Трисс Меригольд (уроженка Марибора), коннетабль Ян Наталис', monsters: 'Гули у старых курганов, волколаки в Мариборском лесу', rumors: ['В лесах к востоку от Марибора друиды оберегают древнюю рощу от топоров лесорубов.', 'Трисс Меригольд сохранила тайный портал в одной из башен старой городской стены.'], desc: 'Второй по величине город-крепость Темерии с двойным кольцом стен, родина чародейки Трисс Меригольд.' },
    { id: 'brenna', name: 'Бренна (Поле Битвы)', x: 1665, y: 1440, icon: '⚔️', type: 'nature', regionKey: 'temeria', region: 'Южная Темерия', ruler: 'Ян Наталис (Великий Коннетабль)', climate: 'Открытые поля и холмы у речки Золотой', danger: 'Высокая (Трупоеды, призраки павших легионов)', population: 'Полевые мемориалы и окрестные хутора', economy: 'Раскопки доспехов, оружия и военного серебра', inn: 'Постоялый двор «У Коннетабля» (2 орена)', factions: 'Ветераны Северных войн, мародёры', npcs: 'Ян Наталис, хирург Русти (Мило Вандербек), Шани, Ярпен Зигрин', monsters: 'Кладбищенские бабы, альгули, гнильцы, призраки-знаменосцы («Драуг»)', rumors: ['В дождливые ночи над холмами Бренны встаёт призрачный туман, в котором маршируют павшие полки Коегоорна.', 'У переправы через речку Золотую до сих пор находят золотые нильфгаардские флорены и сломанные мечи.'], desc: 'Историческое поле генерального сражения при Бренне (1268 г.), где объединённый Север сокрушил группу армий «Центр».' },
    { id: 'flotsam', name: 'Флотзам (Flotsam)', x: 1925, y: 830, icon: '🌲', type: 'city', regionKey: 'temeria', region: 'Долина Понтара (Темерия)', ruler: 'Комендант Бернард Лоредо / Иорвет', climate: 'Глухие девственные леса Понтара', danger: 'Высокая (Скоя\'таэли, Кейран, эндриаги)', population: '1 800 жителей и купцов', economy: 'Речная пошлина на Понтаре, торговля строевым лесом и фисстехом', inn: 'Таверна Флотзама (бои без правил и покер с костями в подвале — 4 орена)', factions: 'Гарнизон Лоредо, Скоя\'таэли Иорвета, Синие Полоски', npcs: 'Иорвет, Вернон Роше, Бернард Лоредо, Шеала де Тансервилль, Седрик', monsters: 'Кейран (исполинский речной монстр), королевы эндриаг, накеры, главоглазы', rumors: ['Гигантский Кейран разрушил королевский мост и топит купеческие барки на Понтаре — купцы собрали двойную награду.', 'В сгоревшей лечебнице для душевнобольных в чаще леса прячется призрак нильфгаардского знаменосца.'], desc: 'Пограничная фактория в первобытных чащах долины Понтара, зажатая между рекой, руинами эльфов и отрядами Иорвета.' },
    { id: 'melitele', name: 'Храм Мелитэле (Элландер)', x: 1895, y: 870, icon: '🕊️', type: 'magic', regionKey: 'temeria', region: 'Княжество Элландер (Темерия)', ruler: 'Настоятельница Нэннеке и князь Эревард', climate: 'Цветущие холмы, целебные оранжереи', danger: 'Низкая (Священное убежище)', population: '250 жриц и послушниц храма + город Элландер (6 000)', economy: 'Целебные травы, редкие эликсиры, переписка древних хроник', inn: 'Трактир «Под Головой Вепря» в городе Элландере (3 орена)', factions: 'Культ богини Мелитэле, Орден Белой Розы (Таулер)', npcs: 'Матушка Нэннеке, Иоля Первая, Ярре, граф Фальвик', monsters: 'Мантикора в предгорьях Пустельских гор, вулканические накеры', rumors: ['В подземной стеклянной оранжерее храма растут травы, которые больше нигде не встречаются в этом мире.', 'Матушка Нэннеке хранит в ларце мешочек с первыми ведьмачьими медальонами Геральта.'], desc: 'Древнее святилище трёхликой богини Мелитэле в княжестве Элландер, где исцеляли Геральта и обучали юную Цири.' },
    { id: 'carreras', name: 'Каррерас', x: 1835, y: 1090, icon: '🏰', type: 'city', regionKey: 'temeria', region: 'Восточная Темерия', ruler: 'Темерский кастелян', climate: 'Лесистые холмы у границы Махакама', danger: 'Средняя (Разбойники, гарпии)', population: '4 800 жителей', economy: 'Торговля махакамским железом и углём', inn: 'Корчма «Кузнечный Мех» (3 орена)', factions: 'Темерские пограничники, Краснолюдские караванщики', npcs: 'Мастер-кузнец Вальдо, купцы из Каррераса', monsters: 'Гарпии, гнильцы, лесные тролли', rumors: ['Через Каррерас идут обозы с махакамской сталью для королевской армии в Вызиме.', 'В заброшенной шахте у тракта поселился разговорчивый скальный тролль, собирающий пустые бочки.'], desc: 'Укреплённый город на востоке Темерии у подножия горного массива Махакам.' },
    { id: 'anchor', name: 'Дориан и Якорная Стоянка', x: 1455, y: 1280, icon: '⚓', type: 'city', regionKey: 'temeria', region: 'Центральная Темерия', ruler: 'Бургомистр Дориана', climate: 'Умеренный равнинный', danger: 'Средняя (Вампиры, банды Риенса)', population: '6 500 жителей', economy: 'Перекрёсток купеческих трактов, ростовщики и нотариусы', inn: 'Трактир «Старая Мельница» (4 орена)', factions: 'Контора Кодрингера и Фэнна, Агенты Риенса', npcs: 'Кодрангер и Фэнн (частные сыщики и юристы), Ширру', monsters: 'Фледеры, брукса в старом особняке, гули', rumors: ['В переулке Дориана сгорела контора знаменитых законников Кодрингера и Фэнна, раскопавших тайну Старшей Крови.', 'На чердаке заброшенного поместья видели полупрозрачную женщину, поющую колыбельную.'], desc: 'Торговый город в сердце Темерии, где располагалась тайная сыскная контора Кодрингера и Фэнна.' },
    { id: 'sodden_hill', name: 'Содденский Холм (Обелиск)', x: 1835, y: 1612, icon: '🔥', type: 'magic', regionKey: 'temeria', region: 'Нижний Содден (Темерия, севернее Яруги)', ruler: 'Мемориал Четырнадцати Чародеев (под короной Темерии)', climate: 'Лесистые холмы над северным берегом Яруги', danger: 'Высокая (Магический фон, призраки битвы)', population: 'Смотритель мемориала и паломники', economy: 'Место паломничества магов и жителей Севера', inn: 'Корчма в деревне Подхолмье у Каркано (2 орена)', factions: 'Братство Чародеев, Корона Темерии', npcs: 'Вильгефорц, Йеннифэр, Трисс Меригольд («Четырнадцатая с Холма»), Лират из Бельхавена', monsters: 'Призраки сожжённых солдат, полуденницы, баргесты', rumors: ['Каждый год в день Беллетэйна обелиск с четырнадцатью именами светится призрачным пламенем.', 'Одно из имён на камне принадлежит живой чародейке — Трисс Меригольд, которую на Холме не узнали из-за ожогов.'], desc: 'Величественный холм на северном берегу Яруги (в историческом Нижнем Соддене, отошедшем к Темерии) с каменным обелиском в память о битве Четырнадцати чародеев.' },
    { id: 'armeria', name: 'Крепости Армерия, Майена и Видорт', x: 1702, y: 1550, icon: '🏰', type: 'city', regionKey: 'temeria', region: 'Нижний Содден (Под властью Темерии)', ruler: 'Темерский наместник (Король Фольтест)', climate: 'Междуречье рек О и Трава к северу от Яруги', danger: 'Высокая (Пограничные гарнизоны и разъезды)', population: '6 200 жителей и ратников гарнизона', economy: 'Оборонительный пояс крепостей на подступах к Марибору (Видорт, Каркано, Армерия, Майена, Разван)', inn: 'Постоялый двор «У Заставного Моста» в Армерии (3 орена)', factions: 'Темерская королевская армия, Друиды Коль Серрай', npcs: 'Кастеляны Видорта и Армерии, гонцы Яна Наталиса', monsters: 'Гули на старых полях сражений, виверны, болотные бабы у переправ', rumors: ['Именно через крепости Видорт, Каркано и Майену в 1268 году прорывалась на север к Бренне группа армий «Центр» Менно Коегоорна.', 'После Первой Северной войны земли Нижнего Соддена к северу от Яруги перешли под протекторат короля Фольтеста.'], desc: 'Ключевой пояс пограничных крепостей Нижнего Соддена к северу от Яруги, защищающий южные рубежи Темерии.' },
    { id: 'brugge', name: 'Бругге', x: 1610, y: 1555, icon: '🏰', type: 'city', regionKey: 'temeria', region: 'Королевство Бругге', ruler: 'Король Венцлав (вассал Темерии)', climate: 'Лесостепь у рек Чотла, Ленточка и О', danger: 'Средняя (Лесорубы против дриад)', population: '7 000 жителей', economy: 'Лесозаготовки на границе Брокилона, конные заводы', inn: 'Королевский трактир в Бругге (3 орена)', factions: 'Дружина короля Венцлава, Пограничная стража', npcs: 'Король Венцлав, рыцарь Дани (Йож из Эрленвальда), мытник', monsters: 'Эхинопсы и археспоры у кромки леса, волчьи стаи', rumors: ['Любой лесоруб, срубивший дуб за пограничной речкой Ленточкой, получает стрелу с серебряным наконечником без предупреждения.', 'В Бругге собираются беженцы из сожжённого Верхнего Соддена и Цинтры.'], desc: 'Столица королевства Бругге к северу от Яруги, на восточной границе заповедного леса Брокилон.' },
    { id: 'dillingen', name: 'Диллинген и Кернов (Переправа на Яруге)', x: 1535, y: 1682, icon: '⚓', type: 'village', regionKey: 'temeria', region: 'Южное Бругге (Северный берег Яруги)', ruler: 'Бургомистр Диллингена (Королевство Бругге)', climate: 'Речная долина у Совиных Холмов (Owl Hills)', danger: 'Средняя (Контрабандисты, речные чудовища)', population: '3 400 жителей', economy: 'Паромная переправа через Яругу, цирюльня и травяная лавка Региса, речная торговля', inn: 'Корчма «У Переправы» в Диллингене (3 орена)', factions: 'Стража Бругге, Речные паромщики Яруги', npcs: 'Эмиель Регис (постоянный дом и цирюльня в Диллингене), купцы и беженцы с Юга', monsters: 'Утопцы и водяные бабы в камышах Яруги, гули на Совиных холмах', rumors: ['Именно в Диллингене на северном берегу Яруги держит свой зимний дом и врачебный кабинет знаменитый цирюльник Эмиель Регис.', 'Паромщики берут тройную плату за ночную переправу на южный берег к Цинтре и Верхнему Соддену.'], desc: 'Оживлённый портовый городок королевства Бругге прямо на северном берегу Яруги — зимняя резиденция вампира Эмиеля Региса.' },
    { id: 'kagen', name: 'Каген и Заречье (Верхний Содден)', x: 1980, y: 1705, icon: '🏰', type: 'city', regionKey: 'nilfgaard', region: 'Верхний Содден и Заречье (Riverdell, к югу от Яруги)', ruler: 'Нильфгаардский префект Верхнего Соддена', climate: 'Лесистое междуречье к югу от изгиба Яруги', danger: 'Высокая (Мародёры, чудовища Гнилого Леса)', population: '4 800 жителей', economy: 'Речной порт у слияния рек Яруга и Нови (Newi), лесоторговля', inn: 'Постоялый двор «Зареченский Тракт» в Кагене (3 флорена)', factions: 'Гарнизон Нильфгаарда в Верхнем Соддене, Партизаны Заречья', npcs: 'Купец Йурга (хутор в Заречье), Золотая Липка', monsters: 'Болотные тролли в Гнилом Лесу (Dankwood Wild), гули, накеры', rumors: ['К югу от Яруги лежат земли Верхнего Соддена и Заречья (Riverdell), обращённые Империей в пограничную провинцию.', 'В лесах к югу от Кагена раскинулось проклятое озеро Лок Мондуирн.'], desc: 'Крупный укреплённый город и речной узел на южном берегу Яруги в регионе Верхний Содден и Заречье (Riverdell).' },

    /* --- КАЭДВЕН, АЭДИРН, ЛИРИЯ, РИВИЯ И МАХАКАМ --- */
    { id: 'ard_carraigh', name: 'Ард Каррайг', x: 2320, y: 320, icon: '👑', type: 'capital', regionKey: 'kaedwen_aedirn', region: 'Каэдвен', ruler: 'Король Хенсельт / Радовид V', climate: 'Суровый северный, вековые боры', danger: 'Средняя (Бурые Хоругви, морозы)', population: '16 000 жителей', economy: 'Пушнина, осадные мастерские, пивоварни («Каэдвенский стаут»), серебряные копи', inn: 'Трактир «Под Чёрным Единорогом» (4 кроны)', factions: 'Двор короля Хенсельта, Бурая Хоругвь, Чародеи Детмольда', npcs: 'Король Хенсельт, чародей Детмольд, Сабрина Глевиссиг', monsters: 'Лешие в северных борах, белые волки, гарпии', rumors: ['В тронном зале Ард Каррайга висят знамёна Нижней Мархии, за которые Каэдвен воюет с Аэдирном уже сотню лет.', 'После гибели Сабрины Глевиссиг на костре над южными рубежами Каэдвена висит проклятие Кровавого Тумана.'], desc: 'Суровая северная столица Каэдвена, окружённая толстыми каменными стенами и бескрайними хвойными пущами.' },
    { id: 'ban_ard', name: 'Бан Ард', x: 2555, y: 590, icon: '⚡', type: 'magic', regionKey: 'kaedwen_aedirn', region: 'Каэдвен', ruler: 'Ректорат Академии Бан Арда', climate: 'Горное предгорье Синих Гор', danger: 'Высокая (Магические эксперименты, джинны)', population: '8 500 жителей и адептов магии', economy: 'Мужская Академия Магии, портальная навигация, алхимические реактивы', inn: 'Таверна «У Разбитой Реторты» (5 крон)', factions: 'Магистры Бан Арда, Капитул Чародеев', npcs: 'Доррегарай из Воле, Истредд, Риенс (исключённый недоучка)', monsters: 'Элементали огня и земли, горгульи, сбежавшие гомункулы', rumors: ['Говорят, чародея Риенса выгнали из академии Бан Арда со второго курса за мелкое воровство в лаборатории.', 'В библиотеке верхнего яруса хранятся подлинные свитки Альзура о создании первых ведьмаков.'], desc: 'Город чародеев в предгорьях Синих Гор и знаменитая мужская академия магии, соперничающая с Аретузой.' },
    { id: 'loc_muinne', name: 'Лок Муинне', x: 2625, y: 670, icon: '🏛️', type: 'magic', regionKey: 'kaedwen_aedirn', region: 'Синие Горы (Каэдвен)', ruler: 'Древние руины Aen Seidhe', climate: 'Высокогорный каньон', danger: 'Смертельная (Горгульи, дракон, Оператор)', population: 'Руины (в 1271 г. — лагеря Саммита королей)', economy: 'Эльфийские реликвии Вранов и Aen Seidhe, рунные печати', inn: 'Полевые шатры делегаций Редании, Темерии и Нильфгаарда', factions: 'Ложа Чародеек, Орден Пылающей Розы, Посольство Шиллярда фиц-Эстерлена', npcs: 'Саския (Борх / Саэсентессис), Филиппа Эйльхарт, Лето из Гулеты, Оператор Вранов', monsters: 'Каменные горгульи, элементали, древний маг-страж Оператор, дракон', rumors: ['Под эльфийским амфитеатром лежат ещё более древние залы ящеролюдей-Вранов, где страж Оператор перераспределяет навыки.', 'Крыши разрушенного дворца опалены пламенем дракона Саэсентессис.'], desc: 'Загадочный эльфийский город-амфитеатр в облаках Синих Гор, построенный на костях цивилизации Вранов.' },
    { id: 'shaerrawedd', name: 'Руины Шаэрраведд', x: 2235, y: 685, icon: '🌹', type: 'magic', regionKey: 'scoiatael', region: 'Леса Каэдвена', ruler: 'Память Аэлирэнн (Элирены)', climate: 'Заросшие плющом мраморные террасы', danger: 'Высокая (Отряды скоя\'таэлей, гули)', population: 'Священные эльфийские руины', economy: 'Белый эльфийский мрамор и кусты белых роз Аэлирэнн', inn: 'Лагерь караванщиков Ярпена Зигрина на тракте в 5 милях', factions: 'Скоя\'таэли («Белки»)', npcs: 'Статуя Аэлирэнн, Торувьель, Ярпен Зигрин', monsters: 'Кладбищенские бабы, призраки павших эльфов, эхинопсы', rumors: ['Кусты белых роз Шаэрраведда цветут круглый год на камнях, орошённых кровью юных эльфов восстания Аэлирэнн.', 'Краснолюды отказываются ломать мрамор дворца для людских строек, считая это святотатством.'], desc: 'Прекрасные и печальные руины эльфийского дворца из белого мрамора и роз — символ обречённого восстания Аэлирэнн.' },
    { id: 'est_tayiar', name: 'Эст Тайяр (Эльфийский некрополь)', x: 1410, y: 1015, icon: '🏺', type: 'magic', regionKey: 'redania', region: 'Восточный Оксенфурт / Гусиная Гузка', ruler: 'Древние князья Aen Seidhe', climate: 'Лесная котловина', danger: 'Высокая (Плакальщицы, вампиры)', population: 'Заброшенный подземный комплекс', economy: 'Эльфийские кубки, короны и фрески Первой Высадки', inn: 'Корчма «Гусиная Гузка» в 6 милях к западу (3 кроны)', factions: 'Охотники за сокровищами, Агенты Принца Ольгерда фон Эверека', npcs: 'Принц Тобиаш Хоффман (покоится в склепе), эльфские скульпторы', monsters: 'Арахноморфы (гигантские пауки), призраки, катакан', rumors: ['В подземных чертогах Эст Тайяра сохранились нетронутые винные погреба эльфийских правителей.', 'Свод главного зала обвалился столетия назад, скрыв вход в княжескую усыпальницу.'], desc: 'Величественный подземный эльфийский дворец-некрополь к востоку от Оксенфурта, полный паутины и реликвий.' },
    { id: 'vengerberg', name: 'Венгерберг', x: 2335, y: 1175, icon: '🔮', type: 'capital', regionKey: 'kaedwen_aedirn', region: 'Аэдирн', ruler: 'Король Демавенд III / Принц Стеннис', climate: 'Предгорья, умеренный', danger: 'Средняя (Осадные пожары, мародёры)', population: '19 000 жителей', economy: 'Металлургия, сукноделие, солодовни, магическая парфюмерия (сирень и крыжовник)', inn: 'Трактир «Под Чёрным Котом» (5 крон)', factions: 'Двор Аэдирна, Гильдия суконщиков и оружейников', npcs: 'Йеннифэр из Венгерберга, король Демавенд III, купец Сулейк', monsters: 'Огненные элементали, гули на пепелищах пригородов', rumors: ['В квартале чародеев всё ещё стоит особняк Йеннифэр, где пахнет сиренью и крыжовником и спрятано обсидиановое зеркало.', 'Во время штурма города армией Коегоорна шесть тысяч горожан укрылись в подземных каменоломнях.'], desc: 'Богатая индустриальная столица королевства Аэдирн и родина чародейки Йеннифэр из Венгерберга.' },
    { id: 'dol_blathanna', name: 'Дол Блатанна (Долина Цветов)', x: 2440, y: 1140, icon: '🌺', type: 'magic', regionKey: 'scoiatael', region: 'Восточный Аэдирн', ruler: 'Княгиня Францеска Финдабаир (Энид ан Глеанна)', climate: 'Вечноцветущее предгорье Синих Гор', danger: 'Средняя (Эльфийские дозоры)', population: '9 000 свободных эльфов Aen Seidhe', economy: 'Эльфийское виноградарство, шелка, древняя магия и земледелие', inn: 'Гостевой павильон на границе долины (только по дозволению княгини)', factions: 'Княжество Дол Блатанна, Ложа Чародеек', npcs: 'Францеска Финдабаир, Филавандрель из Серебряных Башен, Ида Эмеан, дуаль Леший (Торкве)', monsters: 'Сильван Торкве («дьявол», ворующий семена), лесные духи', rumors: ['В полях конопли и хмеля до сих пор бродит рогатый сильван Торкве, который некогда связал Геральта и Лютика.', 'Эльфийская чародейка Ида Эмеан предсказывает грядущий Белый Хлад по цветению горных лилий.'], desc: 'Благословенная Долина Цветов у подножия Синих Гор — суверенное княжество эльфов Aen Seidhe.' },
    { id: 'vergen', name: 'Верген (Верхний Аэдирн)', x: 2120, y: 960, icon: '🛡️', type: 'city', regionKey: 'kaedwen_aedirn', region: 'Верхний Аэдирн (Нижняя Мархия)', ruler: 'Саския (Дева из Аэдирна) и староста Сессиль Бурдон', climate: 'Скальные каньоны над Понтаром', danger: 'Высокая (Гарпии в каменоломнях, призраки битвы)', population: '6 500 краснолюдов, людей и эльфов', economy: 'Каменоломни, рунные кузницы, оборонительные бастионы в скале', inn: 'Корчма «Под Полной Кубышкой» (махакамский спирт и борьба на руках — 3 орена)', factions: 'Повстанцы Свободной Долины Понтара, Клан Зигринов, Скоя\'таэли Иорвета', npcs: 'Саския Драконоубийца, Ярпен Зигрин, Золтан Хивай, Филиппа Эйльхарт, Сессиль Бурдон', monsters: 'Гарпии и королева гарпий в ущелье, призрачный туман («Драуг»), гнильцы в катакомбах', rumors: ['Говорят, благородная предводительница восстания Саския на самом деле — дочь золотого дракона Борха Три Галки!', 'В заброшенной каменоломне за городом гарпии собирают магические кристаллы снов в своём гнезде.'], desc: 'Неприступный краснолюдский город-крепость, высеченный в отвесных скалах Верхнего Аэдирна.' },
    { id: 'gulet', name: 'Гулета и Альдсберг', x: 2180, y: 1230, icon: '⚒️', type: 'city', regionKey: 'kaedwen_aedirn', region: 'Западный Аэдирн', ruler: 'Наместник Аэдирна', climate: 'Холмы и угольные копи', danger: 'Средняя (Гаргульи, дезертиры)', population: '7 200 жителей', economy: 'Сталелитейные печи, оружейное дело, торговля с Махакамом', inn: 'Корчма «Ржавый Меч» в Гулете (3 орена)', factions: 'Ополчение Аэдирна, Наёмные отряды', npcs: 'Лето из Гулеты (прозвище убийцы королей), Даниэль Эчеверриа', monsters: 'Гули, альгули, накеры в старых угольных забоях', rumors: ['В битвах под Альдсбергом и Гулетой в 1267 году сгорели целые кварталы оружейников.', 'Уроженец этих мест, огромный лысый ведьмак со шрамом, принёс голову короля Демавенда в мешке со льдом.'], desc: 'Крупные ремесленные города западного Аэдирна на тракте между Венгербергом и Махакамом.' },
    { id: 'rivia', name: 'Ривия', x: 2255, y: 1415, icon: '🛡️', type: 'capital', regionKey: 'kaedwen_aedirn', region: 'Лирия и Ривия (Севернее Яруги)', ruler: 'Королева Мэва', climate: 'Озеро Лок Эскалотт, холмы', danger: 'Средняя (Напряжение между людьми и нелюдями)', population: '14 000 жителей', economy: 'Кузницы Ривии, рыбный промысел на озере Лок Эскалотт, торговля с Махакамом', inn: 'Таверна «Под Выдрой» в квартале Вязы (4 орена)', factions: 'Королевская гвардия Лирии и Ривии, Гильдия кузнецов-краснолюдов', npcs: 'Королева Мэва, Геральт из Ривии, Золтан Хивай, Ярпен Зигрин, Надя', monsters: 'Водяные и утопцы озера Лок Эскалотт, полуночницы', rumors: ['За героическую оборону моста на Яруге королева Мэва лично посвятила ведьмака в рыцари под именем «Геральт Ривийский».', 'В квартале Вязы в 1268 году вспыхнул кровавый погром, где Геральт встал на защиту своих друзей-краснолюдов.'], desc: 'Зимняя столица объединённого королевства Лирии и Ривии на живописном берегу озера Лок Эскалотт к северу от Яруги.' },
    { id: 'lyria_city', name: 'Лирия (Летняя столица)', x: 2548, y: 1272, icon: '👑', type: 'city', regionKey: 'kaedwen_aedirn', region: 'Лирия и Ривия (Севернее Яруги)', ruler: 'Королева Мэва / Рейнард Одо', climate: 'Плодородная долина и фруктовые сады у Синих Гор', danger: 'Средняя', population: '11 500 жителей', economy: 'Садоводство, виноделие, коневодство, полотно', inn: 'Трактир «Золотая Подкова» (4 орена)', factions: 'Партизаны Белой Королевы Мэвы, Рыцарство Лирии', npcs: 'Королева Мэва, граф Рейнард Одо, Гаскон («Пёс из Спаллы»)', monsters: 'Археспоры в заброшенных садах, виверны на кряже', rumors: ['Когда предатели сдали замок Лирии нильфгаардцам, королева Мэва ушла в леса и собрала непобедимую партизанскую армию.', 'Вино из королевских погребов Лирии ценится даже при дворе в Вызиме.'], desc: 'Солнечная летняя резиденция королевы Мэвы среди цветущих полей и замков восточной Лирии к северу от Яруги.' },
    { id: 'dillmoor', name: 'Диллмор и Мост на Яруге (Ривия)', x: 2348, y: 1442, icon: '🌉', type: 'village', regionKey: 'kaedwen_aedirn', region: 'Лирия и Ривия (Северный берег Яруги)', ruler: 'Королева Мэва', climate: 'Речная переправа и пойменные луга Яруги', danger: 'Высокая (Сражения за переправу, утопцы)', population: '2 400 жителей', economy: 'Стратегический мост и паром через Яругу, таможня Ривии', inn: 'Постоялый двор «У Королевского Моста» в Диллморе (3 орена)', factions: 'Рать королевы Мэвы, Ганза Геральта', npcs: 'Королева Мэва, Геральт из Ривии, Кагыр аэп Кеаллах, Мильва, Рейнард Одо', monsters: 'Утопцы и болотные бабы в камышах Яруги, гули на берегах после битвы', rumors: ['Именно на этом мосту у Диллмора Геральт и Кагыр возглавили отчаянную контратаку лирийцев против нильфгаардцев, за что Мэва пожаловала ведьмаку рыцарский титул «Геральт из Ривии».', 'По обе стороны переправы до сих пор находят пробитые щиты с золотым солнцем и лирийскими орлами.'], desc: 'Знаменитое поселение и стратегический мост через Яругу к югу от Ривии — место легендарной Битвы за Мост на Яруге.' },
    { id: 'glevitzingen', name: 'Крепость Глевицинген (Дол Ангра)', x: 2482, y: 1502, icon: '🏰', type: 'city', regionKey: 'nilfgaard', region: 'Дол Ангра (Южный берег Яруги)', ruler: 'Комендант переправы (Спорное пограничье Лирии и Нильфгаарда)', climate: 'Широкая речная долина у впадения реки Ангры в Яругу', danger: 'Высокая (Пограничные гарнизоны, мародёры)', population: '4 600 жителей и солдат', economy: 'Охрана восточного моста через Яругу к замку Скала, лесоторговля долины Ангры', inn: 'Гарнизонный трактир «Страж Яруги» в Глевицингене (3 флорена)', factions: 'Гарнизон Глевицингена, Разъезды Нильфгаарда и Лирии', npcs: 'Кастелян Глевицингена, купцы тракта из Туссента в Венгерберг', monsters: 'Виверны со склонов Тир Тохар, гули, речные чудовища Яруги', rumors: ['Замок Глевицинген на южном берегу и крепость Скала на северном стерегут главную восточную переправу через Яругу в долине Дол Ангра.', 'К югу от крепости вдоль реки Ангры уходит военный тракт к перевалам Тир Тохар и Вратам Сольвейги.'], desc: 'Мощная пограничная крепость на южном берегу Яруги в долине Дол Ангра, контролирующая мост напротив лирийской Скалы.' },
    { id: 'angren_post', name: 'Красный Порт и Застава Ангрена', x: 1945, y: 1625, icon: '🌫️', type: 'nature', regionKey: 'temeria', region: 'Южный Ангрен (Северный берег Яруги)', ruler: 'Вольные лесорубы, друиды и партизаны Ангрена', climate: 'Сырые первобытные топи и лесные пристани на северном берегу Яруги', danger: 'Экстремальная (Гернихора, пиявки, друиды, скоя\'таэли)', population: 'Фактория Красный Порт (Red Port), лесорубы и старатели', economy: 'Сплав кедра и дуба по Яруге, намывка речного золота, переправа', inn: 'Фактория «Сорвиголова» на сваях в Красном Порту (2 орена)', factions: 'Круг Друидов Ангрена, Партизаны Мэвы, Ганза Геральта', npcs: 'Друидка Фламинария, Эмиель Регис, Мильва, лесорубы Красного Порта', monsters: 'Кровожадная Гернихора (Хозяйка Ангрена), болотные пиявки, утопцы, стрыги', rumors: ['Через паром у Красного Порта в Ангрене переправляются лесорубы, контрабандисты и военные разъезды.', 'В глубине пущи к северу от порта раскинулись непроходимые топи Исгита и Чёрный Лес Каэд Дху.'], desc: 'Укреплённая речная фактория Красный Порт (Red Port) и заставы на северном берегу излучины Яруги в диком Ангрене.' },
    { id: 'mahakam', name: 'Махакам (Гора Карбон)', x: 2030, y: 1120, icon: '🪓', type: 'capital', regionKey: 'scoiatael', region: 'Горный массив Махакам', ruler: 'Старейшина Брувер Гоог', climate: 'Высокогорный, подземные лавовые кузницы', danger: 'Высокая (Неприступная рать краснолюдов)', population: '45 000 краснолюдов и гномов', economy: 'Лучшая в мире сталь, сидеритовые и рунные мечи (Рунный Сигиль), паровые молоты', inn: 'Пивная палата «Под Молотом и Наковальней» в чреве горы Карбон (3 орена)', factions: 'Совет Старейшин Махакама, Добровольческая Рать Махакама, Мастерские гномов-оружейников', npcs: 'Старейшина Брувер Гоог, Габор Зигрин, Персиваль Шуттенбах, Калеб Страттон', monsters: 'Каменные тролли, подземные элементали огня, главоглазы в глубоких штреках', rumors: ['В кузнях под горой Карбон гномы куют легендарные клинки «Рунный Сигиль» с гравировкой: «На погибель сукиным сынам».', 'Старейшина Брувер Гоог запрещает молодым краснолюдам уходить на поверхность, но целые роты всё равно бегут биться под Бренну.'], desc: 'Несокрушимая подземная твердыня краснолюдов и гномов в горе Карбон — индустриальное сердце Континента.' },

    /* --- КОВИР, ПОВИСС И ЛИГА ХЕНГФОРСА --- */
    { id: 'pont_vannis', name: 'Понт Ваннис', x: 840, y: 440, icon: '💎', type: 'capital', regionKey: 'kovir', region: 'Ковир и Повисс', ruler: 'Король Эстерид Тиссенид и королева Зулейка', climate: 'Северный приморский, гранитные фьорды', danger: 'Низкая (Королевская гвардия и наёмники)', population: '26 000 жителей', economy: '80% мировой добычи золота, платины и двимерита; стекольные мануфактуры', inn: 'Гостиница «Адмиралтейская» на Главном Канале (12 бизантов)', factions: 'Династия Тиссенидов, Ложа Чародеек (Шеала де Тансервилль), Наёмная Кондотьерия', npcs: 'Король Эстерид Тиссенид, принц Танкред, Шеала де Тансервилль, Трисс Меригольд', monsters: 'Морские змеи фьордов, горные тролли в рудниках', rumors: ['Король Эстерид тайно выделил Дийкстре миллион бизантов на наём Вольной Кондотьерии против Нильфгаарда.', 'После погромов в Новиграде Трисс Меригольд переправила десятки чародеев на кораблях в безопасность Ковира.'], desc: 'Зимняя столица Ковира и Повисса, высеченная в гранитных фьордах — финансовая сверхдержава Севера.' },
    { id: 'lan_exeter', name: 'Лан Эксетер', x: 795, y: 270, icon: '⛵', type: 'capital', regionKey: 'kovir', region: 'Ковир и Повисс', ruler: 'Король Эстерид Тиссенид / Адмиралтейство', climate: 'Морские каналы залива Пракседа', danger: 'Низкая (Богатейший мегаполис)', population: '24 000 жителей', economy: 'Морская биржа, банковские дома, строительство трёхмачтовых галеонов', inn: 'Винный салон «Золотая Гондола» на Большом Канале (15 бизантов)', factions: 'Торговое Адмиралтейство Ковира, Гильдия банкиров', npcs: 'Эстерид Тиссенид, Зулейка из Тальгара, послы всех держав', monsters: 'Сирены залива Пракседа, водяные в старых доках', rumors: ['В Лан Эксетере нет ни одной сухопутной улицы — даже королевские кареты здесь заменены золочёными барками и гондолами.', 'Фасады всех домов на Большом Канале не шире пяти саженей из-за древнего налога на ширину набережной.'], desc: 'Летняя столица Ковира на воде — северная Венеция с мраморными дворцами и глубоководным каналом для океанских судов.' },
    { id: 'aeedd_ginvael', name: 'Аэдд Гинваэль («Осколок Льда»)', x: 1125, y: 265, icon: '❄️', type: 'city', regionKey: 'kovir', region: 'Наррок / Повисс', ruler: 'Мэр Гербольт и чародей Истредд', climate: 'Холодный северный на реке Тоина', danger: 'Средняя (Разбойники, zeugl на свалке)', population: '7 500 жителей', economy: 'Археологические раскопки эльфов, пушной торг, лесопилки', inn: 'Постоялый двор «Лисий Хвост» (4 кроны)', factions: 'Городской магистрат, Археологи Бан Арда', npcs: 'Чародей Истредд, Йеннифэр, Геральт, вор Цикада', monsters: 'Риггер (Zeugl) на городской свалке, призраки Дикого Гона', rumors: ['В этом промозглом северном городе Геральт и чародей Истредд едва не сошлись на смертельной дуэли из-за любви Йеннифэр.', 'По утрам в куче нечистот за городскими стенами ведьмак бился с отвратительным многощупальцевым риггером.'], desc: 'Город на крайнем севере, чьё название переводится со Старшей Речи как «Осколок Льда», связанный с легендой о Королеве Зимы.' },
    { id: 'hengfors_city', name: 'Хенгфорс (Столица Лиги)', x: 1515, y: 390, icon: '🦅', type: 'capital', regionKey: 'kovir', region: 'Лига Хенгфорса (Каингорн)', ruler: 'Король Недамир из Каингорна', climate: 'Предгорья Драконьих и Пустельских гор', danger: 'Низкая', population: '13 000 жителей', economy: 'Медные и серебряные копи, торговля с Ковиром и Каэдвеном', inn: 'Корчма «Под Драконьим Крылом» (4 кроны)', factions: 'Совет Лиги Хенгфорса (Каингорн, Маллеора, Крейден)', npcs: 'Король Недамир, чародей Доррегарай, рыцарь Эйк из Денесле', monsters: 'Виверны, гарпии, горные тролли', rumors: ['Король Недамир снарядил целую экспедицию с рыцарями, чародеями и ведьмаком ради покорения Пустельских гор.', 'В казне Хенгфорса хранятся самоцветы гномов из северных копей Драконьих гор.'], desc: 'Столица Лиги Хенгфорса на реке Браа — процветающего союза северных княжеств.' },
    { id: 'craghorn', name: 'Голополье (Пустельские Горы)', x: 1735, y: 435, icon: '🐉', type: 'nature', regionKey: 'kovir', region: 'Граница Хенгфорса и Редании', ruler: 'Вольные кметы и пастухи', climate: 'Скалистые ущелья и висячие мосты через реку Браа', danger: 'Экстремальная (Золотой и Зелёный драконы)', population: 'Горная околица у обрыва', economy: 'Овцеводство и охотничьи трофеи', inn: 'Трактир на старом почтовом тракте перед обвалом (2 кроны)', factions: 'Экспедиция короля Недамира, Рубайлы из Кринфрида, Сапожник Козоед', npcs: 'Борх Три Галки (Золотой дракон Виллентретенмерт), Тэя и Вэя (зерриканки), Эйк из Денесле', monsters: 'Зелёная драконица Миргтабракке, Золотой дракон Виллентретенмерт, гиirash (огнеед)', rumors: ['На каменистом плато за прогнившим мостом через пропасть Золотой Дракон Виллентретенмерт защищал детёныша Саэсентессис.', 'Местный сапожник Козоед пытался отравить драконицу овечьей тушей, набитой чемерицей и сапожным варом.'], desc: 'Скалистое ущелье в Пустельских горах, где произошла легендарная охота на дракона («Предел возможного»).' },

    /* --- СИДАРИС, КЕРАК, ВЕРДЭН И ЛЕС БРОКИЛОН --- */
    { id: 'cidaris', name: 'Сидарис', x: 1020, y: 1180, icon: '⚓', type: 'city', regionKey: 'temeria', region: 'Королевство Сидарис', ruler: 'Король Этайл', climate: 'Тёплые морские бризы', danger: 'Низкая (Пираты и морские чудовища)', population: '14 500 жителей', economy: 'Кораблестроение, виноделие («Сидарисское сухое»), морская торговля', inn: 'Таверна «Морской Конёк» на набережной (4 кроны)', factions: 'Королевский флот Сидариса, Гильдия мореходов', npcs: 'Король Этайл, чародей Доррегарай, адмиралы Севера', monsters: 'Сирены, морские змеи, утопцы у рифов', rumors: ['Боевые когги и галеры Сидариса не раз топили драккары налётчиков со Скеллиге и каперов Нильфгаарда.', 'На местном базаре можно купить редкий серый янтарь и кораллы со дна Великого Моря.'], desc: 'Приморское королевство искусных мореходов и корабелов к югу от дельты Понтара.' },
    { id: 'bremervoord', name: 'Бремервоорд (Жертвенный Камень)', x: 985, y: 1235, icon: '🧜‍♀️', type: 'city', regionKey: 'temeria', region: 'Княжество Бремервоорд (Сидарис)', ruler: 'Князь Агловаль', climate: 'Скалистые лагуны и жемчужные отмели', danger: 'Средняя (Морской народ, эхидны)', population: '3 800 жителей', economy: 'Добыча голубого жемчуга на «Драконьих Клыках», рыболовство', inn: 'Корчма «Под Жемчужной Раковиной» (3 кроны)', factions: 'Ловцы жемчуга князя Агловаля, Морской народ (сирены)', npcs: 'Эсси Давен («Глазок»), Лютик, князь Агловаль, сирена Шъееназ', monsters: 'Подводные обитатели в колоколообразных шлемах, морские черти, сирены', rumors: ['Здесь бард Эсси Давен по прозвищу «Глазок» подарила Геральту голубую жемчужину, которую он хранил всю жизнь.', 'Князь Агловаль безумно влюбился в певучую сирену Шъееназ, которая ради него выпила зелье и обрела человеческие ноги.'], desc: 'Романтичное прибрежное княжество с жемчужными отмелями, воспетое в балладе «Немного жертвенности».' },
    { id: 'kerack', name: 'Керак и Замок Риссберг', x: 1130, y: 1390, icon: '⛵', type: 'city', regionKey: 'temeria', region: 'Королевство Керак', ruler: 'Король Белогун / Король Вираксас и Илдико Брекль', climate: 'Устье реки Адалатте, штормовой', danger: 'Высокая (Мутанты Риссберга, лисица-агуара)', population: '9 500 жителей (Пальмира, порт и Верхний город)', economy: 'Лесопилки, верфи, контрабанда, магический комплекс Риссберг в горах', inn: 'Ресторация «Natura Rerum» (для знати — 15 крон) и кабак «Чёрный Зуб» в Пальмире (2 кроны)', factions: 'Гвардия Керака, Чародеи комплекса Риссберг (Ортолан, Сорель Дегерлунд)', npcs: 'Кораал (Литта Нейд), Илдико Брекль, Сорель Дегерлунд, Пинети, Пирал Пратт', monsters: 'Идры (генетические химеры Риссберга), лисица-агуара (иллюзионист), демон Гоэтии', rumors: ['У ведьмака Геральта в Кераке украли оба меча — и вскоре их выставили на тайный аукцион дома Борсоди в Новиграде!', 'В горной цитадели Риссберг чародеи Ортолана тайно создают кровожадных инсектоидов-идр, вырезающих целые хутора.'], desc: 'Приморское королевство контрастов: роскошный королевский холм, злачный порт Пальмира и зловещая лаборатория чародеев Риссберг («Сезон Гроз»).' },
    { id: 'verden_city', name: 'Настрог и Хамм (Вердэн)', x: 1190, y: 1685, icon: '🌲', type: 'capital', regionKey: 'temeria', region: 'Королевство Вердэн', ruler: 'Король Эрвилл / Принц Кистрин', climate: 'Лесное побережье у устья Яруги', danger: 'Высокая (Рейды дриад Брокилона, партизаны)', population: '8 000 жителей', economy: 'Охрана устья Яруги (крепости Настрог, Розрог и Бодрог), пушнина и янтарь', inn: 'Трактир «Три Башни» в Хамме (3 кроны)', factions: 'Гарнизоны короля Эрвилла, Повстанцы Вердэна', npcs: 'Король Эрвилл, принц Кистрин, кастелян Левек, барон Фрейксенет', monsters: 'Многоножки-сколопендроморфы на границе Брокилона, утопцы Яруги', rumors: ['В лесной чаще на границе с Брокилоном Геральт встретил потерявшуюся маленькую княжну Цири, сбежавшую от сватовства с принцем Кистрином.', 'Три пограничных замка — Настрог, Розрог и Бодрог — запирают северный вход в дельту Яруги.'], desc: 'Лесное королевство между чащей Брокилона и устьем Яруги, чья история неразрывно связана с судьбой юной Цири.' },
    { id: 'brokilon', name: 'Лес Брокилон (Дуэн Канэлл)', x: 1360, y: 1550, icon: '🏹', type: 'capital', regionKey: 'scoiatael', region: 'Заповедный Лес Брокилон', ruler: 'Владычица Эитнэ (Сереброглазая)', climate: 'Первобытная реликтовая чаща', danger: 'Смертельная для людей (Стрелы дриад без предупреждения)', population: 'Дриады Брокилона, пустельги и беглые скоя\'таэли', economy: 'Древесное плетение, целебная Вода Брокилона, луки из живого тиса', inn: 'Дупла и террасы исполинских дубов Дуэн Канэлл (только для друзей леса)', factions: 'Дриады Дуэн Канэлл, Поправляющие (лучницы), Уцелевшие скоя\'таэли', npcs: 'Владычица Эитнэ, Браэнн, Моренн, сэр Фрейксенет (в образе баклана)', monsters: 'Древние лешие, сколопендроморфы, археспоры, древесные пауки', rumors: ['Чаша Воды Брокилона стирает человеческую память у девочек, но у Геральта и Цири лишь вызвала пророческие видения.', 'Деревья в Дуэн Канэлл выращены песнями дриад так, что их ветви образуют живые залы и переходы под самым небом.'], desc: 'Сердце неприступного первобытного леса дриад, куда тысячелетиями не смеет ступить нога человека с топором.' },
    { id: 'col_serrai', name: 'Гроты Коль Серрай (Брокилон)', x: 1415, y: 1605, icon: '💧', type: 'magic', regionKey: 'scoiatael', region: 'Восточный Брокилон', ruler: 'Целительницы дриад (Аглайиса)', climate: 'Горячие подземные ключи и светящийся мох', danger: 'Низкая для раненых под защитой Эитнэ', population: 'Купель исцеления дриад и чародеек', economy: 'Лечебные геотермальные воды, корень мандрагоры, конский каштан', inn: 'Тёплые каменные ложа у термальных бассейнов Коль Серрай', factions: 'Целительницы Дуэн Канэлл', npcs: 'Чародейка Аглайиса, Эитнэ, Мильва (Мария Барринг), Лютик', monsters: 'Стражи леса на внешних подступах', rumors: ['В этих волшебных горячих гротах дриады и чародейка Аглайиса исцелили переломанные кости Геральта после бойни на Танедде.', 'Отсюда лучница Мильва выводила израненные отряды скоя\'таэлей от королевских облав.'], desc: 'Тайные подземные пещеры с горячими целебными источниками в глубине Брокилона, где залечивают смертельные раны.' },

    /* --- АРХИПЕЛАГ ОСТРОВОВ СКЕЛЛИГЕ --- */
    { id: 'kaer_trolde', name: 'Каэр Трольде (Ард Скеллиг)', x: 595, y: 1590, icon: '⛵', type: 'capital', regionKey: 'skellige', region: 'Острова Скеллиге (Клан ан Крайт)', ruler: 'Крах ан Крайт / Королева Керис ан Крайт', climate: 'Океанический, фьорды и отвесные утёсы', danger: 'Высокая (Сирены, гарпии, шторма)', population: '6 500 островитян и дружинников', economy: 'Боевые драккары, кузни бронебойных топоров, китобойный промысел, мёд', inn: 'Корчма «Новый Порт» у гавани Каэр Трольде (жареный лосось и вересковый мёд — 3 кроны)', factions: 'Клан ан Крайт, Друиды Скеллиге', npcs: 'Крах ан Крайт, Керис ан Крайт, Хьялмар Криворот, Мышовур, Бирна Бран', monsters: 'Эхидны, сирены, берсерки-медведи (Вильдкарлы) в пиршественном зале', rumors: ['Во время пира претендентов на престол в тронный зал Каэр Трольде ворвались огромные медведи-оборотни Вильдкарлы!', 'Каменный мост к цитадели высечен в скале самим легендарным героем Гримом по прозвищу Тролль.'], desc: 'Неприступная твердыня клана ан Крайт на вершине гранитного утёса над фьордом Гулльфакс — столица Скеллиге.' },
    { id: 'gedyneith', name: 'Дуб Гединейт (Святилище Друидов)', x: 645, y: 1565, icon: '🌳', type: 'magic', regionKey: 'skellige', region: 'Остров Ард Скеллиг', ruler: 'Иерофант Мышовур (Mousesack)', climate: 'Священная дубовая роща на плато', danger: 'Низкая (Защита друидов и лесовиков)', population: '120 друидов круга Скеллиге и скальдов', economy: 'Алхимические травы, отвары, коронация монархов Скеллиге', inn: 'Приют паломников у корней Гединейта (бесплатный кров)', factions: 'Круг Друидов Скеллиге, Жрицы Фрейи', npcs: 'Мышовур, друид Гремист (мастер высшей алхимии и спирта), Фритьоф (заклинатель бурь)', monsters: 'Дух леса «В лесу сердце бьётся» (Древний Леший), туманники, суккуб в лесу', rumors: ['В пещере неподалёку ворчливый мастер-алхимик Гремист варит лучший мандрагоровый самогон на всех островах.', 'Под сенью священного дуба Гединейт ярлы выбирают нового короля Скеллиге и приносят клятвы на крови.'], desc: 'Древнейший священный дуб архипелага Скеллиге, вокруг которого расположено главное святилище друидов и лаборатория Гремиста.' },
    { id: 'kaer_muire', name: 'Каэр Мюр (Клан Друммонд)', x: 615, y: 1650, icon: '🪓', type: 'city', regionKey: 'skellige', region: 'Южный Ард Скеллиг', ruler: 'Ярл Лугос Безумный', climate: 'Скалистое южное плато', danger: 'Высокая (Вражда кланов, циклопы)', population: '2 400 воинов клана Друммонд', economy: 'Добыча железа, разведение горных коз, грабительские походы', inn: 'Длинный дом ярла Лугоса (пиво и баранина — 2 кроны)', factions: 'Клан Друммонд', npcs: 'Лугос Безумный, Лугос Синий, чемпион кулачных боёв Олаф (медведь!)', monsters: 'Циклопы в южных горах, виверны, гарпии', rumors: ['Говорят, абсолютным чемпионом южного Ард Скеллиг по кулачному бою является настоящий матёрый бурый медведь по кличке Олаф!', 'Лугос Безумный готов перерезать глотку любому послу из клана ан Крайт за старые обиды.'], desc: 'Горная крепость вспыльчивого ярла Лугоса Безумного и клана Друммонд на южной оконечности Ард Скеллиг.' },
    { id: 'undvik', name: 'Остров Ундвик (Кузница Тиршах)', x: 692, y: 1612, icon: '❄️', type: 'nature', regionKey: 'skellige', region: 'Остров Ундвик', ruler: 'Ледяной Великан Мыргыф / Ярл Хьялмар', climate: 'Замёрзшая бухта, снежные скалы', danger: 'Смертельная (Ледяной Великан, Нагльфар)', population: 'Заброшен после нашествия Великана (остался безумный корабел в остове драккара)', economy: 'Древняя клановая кузница оружия из сидеритовой руды', inn: 'Заброшенная деревня Дорве и пещера охотника Фолана', factions: 'Отряд Хьялмара ан Крайта, Дикая Охота (во время финальной битвы)', npcs: 'Хьялмар ан Крайт, лучник Фолан, ярл Виги Безумный, Эредин и Карантир', monsters: 'Ледяной Великан Мыргыф, архисирены, дезертиры-пожиратели падали, ледяные тролли', rumors: ['Весь остров опустел, когда с гор спустился исполинский Ледяной Великан в доспехах из корабельных досок.', 'У берегов Ундвика сковал море льдом призрачный корабль из костей и ногтей мертвецов — Нагльфар!'], desc: 'Суровый, покрытый вечным снегом остров с заброшенной кузницей клана Тиршах — арена решающей битвы с Дикой Охотой.' },
    { id: 'hindarsfjall', name: 'Остров Хиндарсфьялль (Роща Фрейи)', x: 755, y: 1555, icon: '🐺', type: 'magic', regionKey: 'skellige', region: 'Восточный остров Скеллиге (Клан Хеймэй)', ruler: 'Ярл Донар ан Хиндар и жрицы Фрейи', climate: 'Туманные утёсы и вечнозелёная священная роща', danger: 'Высокая (Проклятый волколак Моркварг, Дикая Охота)', population: '1 800 жителей деревни Ларвик и жриц храма', economy: 'Священный храм богини Фрейи, рыболовство, корабельная смола', inn: 'Корчма деревни Ларвик (горячий грог — 2 кроны)', factions: 'Клан Хеймэй, Жрицы богини Фрейи', npcs: 'Ярл Донар ан Хиндар, жрица Ютта ан Димун (непобедимая мечница), Трус (Скьялль)', monsters: 'Бессмертный волколак Моркварг, гончие Дикой Охоты, эхидны', rumors: ['В священной роще Фрейи бродит проклятый пират-оборотень Моркварг, который возрождается после каждой смерти и терзает сам себя от голода.', 'На вершине холма воительница Ютта ан Димун ждёт поединка с тем, кто сумеет выбить меч из её руки.'], desc: 'Священный восточный остров архипелага с главным храмом богини Фрейи, деревней Ларвик и проклятым садом.' },
    { id: 'spikeroog', name: 'Остров Спикероог (Сворлаг)', x: 525, y: 1530, icon: '🗡️', type: 'city', regionKey: 'skellige', region: 'Северо-западный Скеллиге (Клан Броквар)', ruler: 'Ярл Удальрик ан Броквар', climate: 'Скалистые фьорды и ветреные вересковые пустоши', danger: 'Высокая (Хим, берсерки Сворлага)', population: '2 100 жителей', economy: 'Охота на тюленей, лучшие лучники архипелага, арена Сворлага', inn: 'Корчма Сворлага (крепкий мёд и поединок на арене — 2 кроны)', factions: 'Клан Броквар', npcs: 'Ярл Удальрик, Керис ан Крайт, Хيم (демон вины)', monsters: 'Демон Хим (питающийся чувством вины), утопцы, водные бабы, сирены', rumors: ['В старом заброшенном доме ярла Удальрика на утёсе прячется тень с длинными когтями — демон Хим, доводящий хозяина до безумия.', 'Перехитрить Хима можно лишь заставив его поверить, что ты сам совершил немыслимое злодеяние.'], desc: 'Северо-западный остров клана Броквар с деревней Сворлаг и проклятым старым домом ярла Удальрика.' },
    { id: 'an_skellig', name: 'Остров Ан Скеллиг (Уриалла)', x: 660, y: 1475, icon: '🗼', type: 'city', regionKey: 'skellige', region: 'Северный Скеллиге (Клан Тиршах)', ruler: 'Ярл Сванриге Тиршах', climate: 'Штормовой северный остров с высокой горой', danger: 'Высокая (Башня из ниоткуда, архигрифон)', population: '1 900 жителей гавани Уриалла', economy: 'Добыча перламутра, кузницы Тиршах, морские рейды', inn: 'Корчма гавани Уриалла (2 кроны)', factions: 'Клан Тиршах', npcs: 'Чародей Сиго Буи, смотритель маяка, кузнец Уриаллы', monsters: 'Архигрифон на северном мысу, големы и элементали в телепортировавшейся Башне', rumors: ['На вершине горы посреди ясного дня из вспышки молнии возникла древняя башня чародея с системой защиты «ГОГ» (Глобальное Ограждение Готфрида)!', 'Вокруг острова бушует непрекращающийся магический шторм, топящий рыбацкие лодки.'], desc: 'Северный остров клана Тиршах с портом Уриалла, Тропой Воинов и загадочной башней чародея.' },
    { id: 'faroe', name: 'Остров Фареры (Харвикен)', x: 645, y: 1715, icon: '🏴‍☠️', type: 'city', regionKey: 'skellige', region: 'Южный остров Скеллиге (Клан Димун)', ruler: 'Ярл Хольгер Чернорукий', climate: 'Южные скалы и пиратские бухты', danger: 'Высокая (Пираты Димун, наёмники Хаммонда)', population: '1 600 корсаров и мореходов', economy: 'Пиратские набеги на берега Нильфгаарда и работорговля', inn: 'Кабак в Харвикене (ром и кости — 2 кроны)', factions: 'Клан Димун, Пираты Хаммонда', npcs: 'Ярл Хольгер Чернорукий, Ламберт (поиски Хаммонда), Тимон', monsters: 'Циклопы, эхидны, гарпии на утёсах Трольдхейма', rumors: ['В часовне на вершине Трольдхейма молится благочестивый главарь работорговцев и бывший подельник Ламберта — Хаммонд.', 'Драккары клана Димун выходят в море даже в самый лютый шторм за золотом южан.'], desc: 'Самый южный остров архипелага Скеллиге — пристанище грозных корсаров клана Димун.' },

    /* --- КНЯЖЕСТВО ТУССЕНТ --- */
    { id: 'beauclair', name: 'Боклер (Beauclair)', x: 2420, y: 2180, icon: '🍇', type: 'capital', regionKey: 'toussaint', region: 'Княжество Туссент', ruler: 'Княгиня Анна-Генриетта (Аarietta)', climate: 'Солнечный средиземноморский', danger: 'Средняя (Бестия из Боклера, бруксы)', population: '21 000 жителей', economy: 'Экспорт лучших вин Континента («Сангреаль», «Эст-Эст»), парфюмерия, рыцарские турниры', inn: 'Корчма «Куролиск» и таверна «Алые кардиналы» (ужин с фазаном и вином — 10 крон)', factions: 'Странствующие рыцари Туссента, Княжеская гвардия (Дамьен де ла Тур), Гроссмейстер Лафарг', npcs: 'Анна-Генриетта, Сианна, Детлафф ван дер Эретайн, Эмиель Регис, Дамьен де ла Тур, Орианна', monsters: 'Высшие вампиры (Детлафф), бруксы, альпы, шарлей на турнирной арене', rumors: ['В подвальной мастерской бронника Лафарга можно выковать полные гроссмейстерские комплекты всех ведьмачьих школ!', 'В приюте состоятельной меценатки Орианны дети поют странную колыбельную: «Ночь темна и страшен лес, не помогут ни меч, ни крест...»'], desc: 'Сказочная столица Туссента с белоснежным эльфийским дворцом, рыцарскими турнирами и тайным миром высших вампиров.' },
    { id: 'corvo_bianco', name: 'Корво Бьянко (Поместье Геральта)', x: 2445, y: 2260, icon: '🍷', type: 'witcher', regionKey: 'toussaint', region: 'Княжество Туссент', ruler: 'Геральт из Ривии и мажордом Варнава-Базиль Фоулти', climate: 'Солнечные холмы долины Сансретур', danger: 'Низкая (После победы над бруксой в погребе)', population: 'Мажордом, виноделы и кухарка Марлен де Третогар', economy: 'Собственная винодельня («Белый Волк»), сад редких алхимических трав, алхимическая лаборатория', inn: 'Собственная господская спальня ведьмака (даёт бонус к здоровью и бодрости!)', factions: 'Дом Геральта из Ривии', npcs: 'Варнава-Базиль Фоулти, Марлен (расколдованный вихт), Йеннифэр / Трисс / Цири / Лютик', monsters: 'Брукса в винном погребе (уничтожена), сколопендроморфы на дальнем винограднике', rumors: ['В потайной комнате за шкафом в погребе оборудована секретная мутагенная лаборатория профессора Моро.', 'Кухарка Марлен некогда была проклята нищим в день свадьбы и десятилетиями жила в обличье пятнистого вихта, одержимого ложками.'], desc: 'Уютное винодельческое поместье Геральта из Ривии в Туссенте со стойлами для Плотвы, стендами для мечей и погребом.' },
    { id: 'castel_ravello', name: 'Кастель Равелло', x: 2305, y: 2195, icon: '🏰', type: 'city', regionKey: 'toussaint', region: 'Княжество Туссент', ruler: 'Фабрицио (Княжеский управляющий)', climate: 'Холмы виноградников', danger: 'Низкая (Археспоры на старых плантациях)', population: '1 200 виноделов и бондарей', economy: 'Поставщик священного вина «Сангреаль» ко двору княгини и императора', inn: 'Дегустационный павильон Кастель Равелло (5 крон за кубок)', factions: 'Винная гильдия Туссента', npcs: 'Управляющий Фабрицио, княжеские дегустаторы', monsters: 'Гигантские сороконожки, эхинопсы, археспоры', rumors: ['Бочку священного вина «Сангреаль» запрещено открывать кому-либо, кроме самой княгини — печать скреплена кровью.', 'Из погребов винодельни таинственным образом пропал бочонок урожая 1269 года.'], desc: 'Старейшая и богатейшая княжеская винодельня Туссента, окружённая кипарисами и золотыми виноградниками.' },
    { id: 'tesham_mutna', name: 'Руины Тесхам Мутна', x: 2350, y: 2310, icon: '🦇', type: 'magic', regionKey: 'toussaint', region: 'Южный Туссент', ruler: 'Древний род Высших Вампиров (Племя Гараш)', climate: 'Мрачное скальное ущелье', danger: 'Экстремальная (Детлафф, клетки для людей, катаканы)', population: 'Подземная цитадель вампиров', economy: 'Древние кровавые доспехи и клинки Хен Гайдт', inn: 'Нет (подземные казематы и ритуальная арена)', factions: 'Высшие вампиры (Регис, Детлафф)', npcs: 'Эмиель Регис, Детлафф ван дер Эретайн, Скрытый (Старейшина вампиров в пещере неподалёку)', monsters: 'Детлафф в истинной крылатой форме, бруксы, фледеры, гаркаины, протофледеры', rumors: ['Тысячу лет назад после Сопряжения Сфер вампиры держали здесь людей в железных клетках как скот ради чистой крови.', 'В глубоких залах хранится багровый комплект доспехов из Тесхам Мутна, исцеляющий владельца за каждого убитого врага.'], desc: 'Зловещая подземная крепость и древняя скотобойня высших вампиров, где решилась судьба Боклера и Детлаффа.' },
    { id: 'mont_crane', name: 'Замок Мон-Кран (Цитадель Ганзы)', x: 2515, y: 2155, icon: '⚔️', type: 'city', regionKey: 'toussaint', region: 'Восточный Туссент', ruler: 'Филиберт фон Виттен («Четырёхпалый») / Ганза разбойников', climate: 'Горный отрог у восточного тракта', danger: 'Высокая (Сотня головорезов Ганзы)', population: '250 бандитов и дезертиров', economy: 'Разбойничьи трофеи, тайный портал чародея Моро', inn: 'Костровище во внутреннем дворе замка', factions: 'Ганза Четырёхпалого Филиберта', npcs: 'Филиберт фон Виттен, сигнальщики с факелами', monsters: 'Гончие ганзы, в подземелье — стражи портала к чертежам Школы Грифона', rumors: ['Если не перебить сигнальщиков с факелами у главной жаровни, к замку сбегутся подкрепления со всей округи!', 'В подвале разрушенной башни работает древний кристальный портал в подводную лабораторию Моро.'], desc: 'Полуразрушенный горный замок на востоке Туссента, превращённый огромной ганзой разбойников в неприступную крепость.' },
    { id: 'gorgon_mount', name: 'Гора Горгона и Перевал Теодула', x: 2310, y: 2075, icon: '⛰️', type: 'nature', regionKey: 'toussaint', region: 'Северный рубеж Туссента (Горы Амелл)', ruler: 'Пограничные рыцари и отшельники', climate: 'Заснеженный вулканический пик («Гора Дьявола»)', danger: 'Высокая (Дракониды, снежные бури, суккубы)', population: 'Горные заставы и пещерные святилища', economy: 'Единственный зимний и летний проход из Севера в долину Туссента', inn: 'Корчма «Под Головой Горгоны» у перевала (4 кроны)', factions: 'Странствующие рыцари, Караванщики', npcs: 'Регис, Кагыр, Мильва, Ангулема, барон де Пейрак-Пейран', monsters: 'Серые ослизги, королевские виверны, каменные тролли, баргесты', rumors: ['Зимой перевал Теодула заносит снегом по самые верхушки сосен — именно поэтому Геральт с ганзой застрял в Туссенте на всю зиму.', 'В глубоких штольнях под горой Горгона чудовища свили гнездо прямо над жилой серебра и зелёного золота.'], desc: 'Величественный снежный вулкан Горгона, возвышающийся над солнечной долиной Боклера и запирающий перевалы Амелл.' },

    /* --- ЦИНТРА, ПРОТЕКТОРАТЫ И ИМПЕРИЯ НИЛЬФГААРД --- */
    { id: 'cintra', name: 'Цинтра', x: 1290, y: 1815, icon: '🦁', type: 'capital', regionKey: 'nilfgaard', region: 'Королевство Цинтра', ruler: 'Королева Калантэ (Львица) / Император Эмгыр', climate: 'Южный берег устья Яруги, морской', danger: 'Высокая (Имперский гарнизон, руины старого дворца)', population: '17 000 жителей', economy: 'Главный морской порт устья Яруги, торговля с островами Скеллиге и Югом', inn: 'Трактир «Под Золотым Львом» (5 флоренов)', factions: 'Двор Цинтры (в изгнании), Наместничество Нильфгаарда, Союз со Скеллиге', npcs: 'Королева Калантэ, Эйст Тиршах, Паветта, Дани (Эмгыр), княжна Цирилла, Кагыр аэп Кеаллах', monsters: 'Утопцы в устье Яруги, призраки сожжённого дворца, экимы', rumors: ['Во время «Бойни в Цинтре» королева Калантэ бросилась с зубцов башни, чтобы не попасть живой в руки нильфгаардцев.', 'В городе подписан знаменитый Цинтрийский мир 1268 года, завершивший Вторую Северную войну.'], desc: 'Гордая столица королевства Цинтра у впадения Яруги в Великое Море — родина Цири, Дитя Старшей Крови.' },
    { id: 'belhaven', name: 'Бельхавен', x: 1580, y: 1985, icon: '🌲', type: 'city', regionKey: 'nilfgaard', region: 'Верхний Содден / Склоны Марнадаля', ruler: 'Князья Бельхавена (протекторат Империи)', climate: 'Горные леса и ступени Марнадаля', danger: 'Средняя (Виверны, разбойники)', population: '5 400 жителей', economy: 'Охотничьи угодья, пушнина, горные перевалы к Марнадалю', inn: 'Постоялый двор «Марнадальские Ступени» (3 флорена)', factions: 'Рыцари Бельхавена, Имперские таможенники', npcs: 'Иво из Бельхавена (ведьмак Школы Медведя), Лират из Бельхавена', monsters: 'Мантикоры, вилохвосты, лесные тролли', rumors: ['У ступеней Марнадаля легионы Нильфгаарда разбили первую армию Цинтры и убили короля Эйста Тиршаха стрелой в глаз.', 'Здешние егеря славятся меткостью не хуже эльфов из Дол Блатанны.'], desc: 'Укреплённый город у знаменитых горных Ступеней Марнадаля между долиной Яруги и Назаиром.' },
    { id: 'nazair_city', name: 'Ассенгард и Рис-Рун (Назаир)', x: 1685, y: 2135, icon: '⚔️', type: 'capital', regionKey: 'nilfgaard', region: 'Провинция Назаир', ruler: 'Имперский префект Назаира', climate: 'Скалистые склоны и сады цитрусов', danger: 'Высокая (Секретная полиция Стефана Скеллена)', population: '15 000 жителей', economy: 'Мандрагоровые плантации в замке Рис-Рун, горное дело, виноделие', inn: 'Таверна «Под Чёрным Соколом» (4 флорена)', factions: 'Ведомство имперского коронера Стефана Скеллена («Филина»), Купцы Назаира', npcs: 'Стефан Скеллен (Филин), Дالص (разведчик), чародейка Ассирэ вар Анагыд', monsters: 'Горгульи в старых бастионах, песчаные бестии', rumors: ['В замке Рис-Рун посреди рощ мандрагоры собирались заговорщики против императора Эмгыра.', 'Здесь можно достать редчайшие южные эликсиры и снадобья виковарских медиков.'], desc: 'Древнее южное королевство к югу от хребта Амелл, известное замком Рис-Рун и бездонными горными озёрами.' },
    { id: 'tarn_mira', name: 'Озеро Тарн Мира (Башня Ласточки)', x: 1855, y: 2295, icon: '🕊️', type: 'magic', regionKey: 'nilfgaard', region: 'Котловина в Назаире / Метинне', ruler: 'Отшельник Высогота из Корво / Миф о Тор Зираэль', climate: 'Туманное замерзающее озеро и камышовые топи Переплюта', danger: 'Экстремальная (Наёмные убийцы Скеллена, Бонарт, портал миров)', population: 'Хижина философа Высоготы на болотах и обсидиановая Башня Ласточки', economy: 'Межмировой портал Старшей Крови (Aen Elle — Тир на Лиа)', inn: 'Тёплая землянка старца Высоготы из Корво в камышах', factions: 'Охотники за Цири (Лео Бонарт, Стефан Скеллен, Риенс), Всадники Aen Elle (Аваллак\'х и Эредин)', npcs: 'Цирилла (Фалька), старец Высогота из Корво, Лео Бонарт, Риенс, Аваллак\'х (Знающий)', monsters: 'Болотные хищники, Красные Всадники Эредина у портала', rumors: ['На льду озера Тарн Мира Цири на коньках вырезала из тумана всю банду Риенса и Скеллена, прежде чем шагнуть в призрачную Башню Ласточки!', 'Башня Тор Зираэль появляется из тумана только для тех, в чьих жилах течёт истинная Кровь Ласточки (Лары Доррен).'], desc: 'Легендарное туманное озеро, на льду которого перед Цири открылись врата обсидиановой Башни Ласточки (Тор Зираэль).' },
    { id: 'metinna_city', name: 'Метинна (Столица конников)', x: 1675, y: 2565, icon: '🐎', type: 'capital', regionKey: 'nilfgaard', region: 'Королевство Метинна', ruler: 'Короли Метинны (под властью Империи)', climate: 'Бескрайние ковыльные степи реки Сильте', danger: 'Средняя (Конокрады, степные хищники)', population: '16 500 жителей', economy: 'Крупнейшие конные заводы Империи, кузнечная ковка, вино «Метиннское розовое»', inn: 'Постоялый двор «Степной Скакун» (3 флорена)', factions: 'Метиннская лёгкая кавалерия, Гильдия кузнецов', npcs: 'Магистры конных заводов, офицеры кавалерии Империи', monsters: 'Мантикоры в сухих балках, виверны, степные варги', rumors: ['Говорят, метиннские кузнецы подкуют даже дикого единорога, а местное розовое вино подают в самом Боклере.', 'На великой конной ярмарке Метинны собираются купцы от Зеррикании до Цинтры.'], desc: 'Столица равнинного королевства Метинна на реке Сильте, поставляющего лучших боевых коней для кавалерии Юга.' },
    { id: 'mag_turga', name: 'Маг Турга (Казематы предгорий)', x: 2110, y: 2420, icon: '⛏️', type: 'city', regionKey: 'nilfgaard', region: 'Нагорье Маг Турга', ruler: 'Военный префект Маг Турги', climate: 'Суровые каменистые предгорья Тир Тохар', danger: 'Высокая (Шахты каторжников, горные бестии)', population: '6 000 гарнизона и рудокопов', economy: 'Железные и медные рудники, пограничные крепости', inn: 'Гарнизонный кабак «Чёрная Руда» (2 флорена)', factions: 'Имперский штрафной гарнизон, Вольные старатели', npcs: 'Комендант рудников, беглые наёмники', monsters: 'Каменные тролли, главоглазы, василиски', rumors: ['В рудники Маг Турги ссылают опальных дворян и пленных солдат с Севера.', 'Старатели наткнулись в глубоком штреке на зал с золотыми статуями древних эльфов.'], desc: 'Суровый горнорудный край между хребтом Амелл и горами Тир Тохар.' },
    { id: 'geso_city', name: 'Глисвен и Амарилло (Гесо)', x: 2365, y: 2745, icon: '🏜️', type: 'capital', regionKey: 'nilfgaard', region: 'Провинция Гесо', ruler: 'Бароны Гесо и префект Амарилло', climate: 'Засушливое пограничье у пустыни Корат', danger: 'Высокая (Ловчие, банды наёмников, Лео Бонарт)', population: '8 500 жителей', economy: 'Скотоводство, охрана восточных перевалов, торговля солью', inn: 'Трактир «Под Химерой» в Двуречье (2 флорена)', factions: 'Имперские ловчие (Trappers), Банда «Крыс» (в прошлом)', npcs: 'Цири (Фалька), Мистле, Гиселер, Кайлей, Искдра, Рееф, Ассе, Лео Бонарт', monsters: 'Пустынные сколопендроморфы, виверны, песчаные бестии', rumors: ['В деревушке Ревность наемный убийца Лео Бонарт в одиночку перебил всю знаменитую банду «Крыс» на глазах у Цири.', 'У барона Касадей в Глисвене хранятся трофейные клинки убитых разбойников пограничья.'], desc: 'Дикая восточная провинция Империи у подножия хребта Тир Тохар, где промышляла банда «Крыс» и охотился Лео Бонарт.' },
    { id: 'claremont', name: 'Клермон (Арена Бонарта)', x: 1580, y: 2880, icon: '🏟️', type: 'city', regionKey: 'nilfgaard', region: 'Эббинг', ruler: 'Купец Хувенагель', climate: 'Тёплый южный, торговое перепутье', danger: 'Высокая (Гладиаторская арена, работорговцы)', population: '9 200 жителей', economy: 'Знаменитая бойцовская арена Хувенагеля, невольничий и пушной рынок', inn: 'Гостиница «У Амфитеатра» (4 флорена)', factions: 'Синдикат Хувенагеля, Охотники за головами', npcs: 'Борх Хувенагель, Лео Бонарт, Цири (сражавшаяся на арене с мечом «Ласточка»)', monsters: 'Боевые мантикоры, виверны и гладиаторы в яме арены', rumors: ['В яме арены Клермона пепельноволосая девушка с мечом Гвихир в одиночку уложила четырёх лучших наёмников Хувенагеля.', 'У оружейника Эстерхази в Клермоне Бонарт купил для Цири легендарный гномский клинок «Zireael» (Ласточка).'], desc: 'Богатый торговый город в Эббинге, печально знаменитый своей кровавой гладиаторской ареной Хувенагеля.' },
    { id: 'stygga_castle', name: 'Замок Стигга (Цитадель Вильгефорца)', x: 1390, y: 2980, icon: '💀', type: 'magic', regionKey: 'nilfgaard', region: 'Эббинг (Мыс Сорочий)', ruler: 'Чародей Вильгефорц из Роггевеена', climate: 'Штормовой скалистый утёс над морем', danger: 'Смертельная (Вильгефорц, Лео Бонарт, Скеллен)', population: 'Лаборатория Вильгефорца и сотня наёмников Скеллена', economy: 'Древние магические лаборатории (бывшая цитадель Школы Кота)', inn: 'Нет (оплавленные магическим огнём бастионы)', factions: 'Клиенты Вильгефорца и заговорщики Скеллена', npcs: 'Вильгефорц, Лео Бонарт, Стефан Скеллен, Геральт, Йеннифэр, Цири, Регис, Кагыр, Мильва, Ангулема', monsters: 'Гомункулы лаборатории, сам Вильгефорц (вооружённый железным посохом)', rumors: ['В стенах этого замка некогда базировалась ведьмачья Школа Кота, прежде чем её выбил оттуда чародей Вильгефорц.', 'В главном зале Вильгефорц расплавил высшего вампира Региса в колонну жидкого стекла, но пал от меча Геральта и медальона Фрингильи!'], desc: 'Неприступный чёрный замок на морском утёсе в Эббинге — место легендарной финальной битвы ганзы Геральта за спасение Цири и Йеннифэр.' },
    { id: 'korath_desert', name: 'Пустыня Корат («Сковорода»)', x: 2580, y: 2920, icon: '🏜️', type: 'nature', regionKey: 'nilfgaard', region: 'За горами Тир Тохар', ruler: 'Стихия песка и стаи единорогов', climate: 'Испепеляющий зной, безводные барханы', danger: 'Экстремальная (Гоголоворы, миражи, первородный Огонь)', population: 'Необитаемая пустыня (редкие табуны единорогов)', economy: 'Занесённые песком караванные сокровища древности', inn: 'Пересыхающие каменные водоемы в скалах', factions: 'Табун Единорогов (Ихуарраквакс)', npcs: 'Цирилла, единорог Ихуарраквакс («Коник»)', monsters: 'Песчаные монстры-гоголоворы (в воронках из песка), скорпионы, огненные фантомы', rumors: ['Чтобы спасти жизнь раненому единорогу Ихуарракваксу, Цири почерпнула запретную силу Первородного Огня и едва не сожгла мир.', 'В песках Кората покоятся кости целых армий, пытавшихся обойти хребет Тир Тохар с востока.'], desc: 'Беспощадная раскалённая пустыня «Сковорода» за хребтом Тир Тохар, где Цири выжила благодаря единорогу Ихуарракваксу.' },
    { id: 'maecht_city', name: 'Маэхт', x: 1995, y: 3015, icon: '👑', type: 'capital', regionKey: 'nilfgaard', region: 'Королевство Маэхт', ruler: 'Король Аккерспаарк / Наместник Империи', climate: 'Тёплая долина рек Вельда и Им Лебар', danger: 'Средняя', population: '19 000 жителей', economy: 'Богатые золотые и серебряные рудники, торговые караваны Юга', inn: 'Дворец постоя «Золотая Корона» (6 флоренов)', factions: 'Вассальный двор Маэхта, Имперский сенат', npcs: 'Король Аккерспаарк, князь Хотспорн, сенаторы Империи', monsters: 'Василиски, мантикоры, призраки старых курганов', rumors: ['Маэхт добровольно признал протекторат Нильфгаарда и благодаря этому сохранил собственного короля и золотую казну.', 'Отсюда выходят самые богатые купеческие караваны на север к перевалам Амелл.'], desc: 'Богатое автономное королевство в составе Империи Нильфгаард между реками Вельда и Им Лебар.' },
    { id: 'gemmera_city', name: 'Геммера', x: 1955, y: 3255, icon: '🐻', type: 'capital', regionKey: 'nilfgaard', region: 'Провинция Геммера', ruler: 'Военный губернатор Геммеры', climate: 'Скалистые нагорья у хребта Тир Тохар', danger: 'Высокая (Каратели-пацификаторы, горные чудовища)', population: '11 000 жителей', economy: 'Военные лагеря подготовки штрафных полков («Пацификаторов»), рудники', inn: 'Кабак «Железный Намордник» (3 флорена)', factions: 'Геммерские пацификаторы, Горные кланы', npcs: 'Командиры карательных когорт Империи', monsters: 'Горные тролли, циклопы, вилохвосты', rumors: ['Геммерские пацификаторы считаются самыми жестокими солдатами Империи — ими пугают даже ветеранов легионов.', 'В неприступных горах Геммеры до сих пор находят тайники ведьмаков Школы Медведя.'], desc: 'Воинственная горная провинция Юга, поставляющая самых беспощадных карателей в армию Империи.' },
    { id: 'etolia_city', name: 'Башня Ветров и Баккала (Этолия)', x: 1395, y: 3495, icon: '🌊', type: 'capital', regionKey: 'nilfgaard', region: 'Провинция Этолия', ruler: 'Префект Этолии', climate: 'Субтропическое побережье и виноградники', danger: 'Средняя (Корсары Скеллиге у берегов)', population: '16 000 жителей', economy: 'Знаменитые белые вина Баккалы, оливковые рощи, порты Эйддон и Лок Грим', inn: 'Приморская вилла «Ветер с Юга» в Баккале (6 флоренов)', factions: 'Адмиралтейство Южного Флота, Купеческие гильдии Этолии', npcs: 'Губернатор Баккалы, адмиралы Имперского флота', monsters: 'Сирены южных морей, эхидны, песчаные крабы-исполины', rumors: ['В гавани Лок Грим стоит летняя резиденция императора Эмгыра, куда привозили лже-Цириллу.', 'Белое вино из долины Баккалы соперничает по цене с лучшими сортами Туссента.'], desc: 'Солнечная прибрежная провинция Нильфгаарда со знаменитыми виноградниками Баккалы и замком Лок Грим.' },
    { id: 'vicovaro_city', name: 'Виковаро', x: 2295, y: 3480, icon: '🔮', type: 'capital', regionKey: 'nilfgaard', region: 'Княжество Виковаро', ruler: 'Князья Виковаро и род Диффрин', climate: 'Тёплая плодородная долина верхней Альбы', danger: 'Средняя (Некроманты и тайная разведка)', population: '20 000 жителей', economy: 'Императорская Академия Медицины и Магии, хирургия, виноделие', inn: 'Гостиница «У Академии Альбы» (7 флоренов)', factions: 'Виковарская Академия Медицины, Имперская коллегия чародеев, Дом Диффрин', npcs: 'Кагыр Маур Дыффин аэп Кеаллах, Фрингилья Виго, Ассирэ вар Анагыд, граф Кеаллах', monsters: 'Кадавры и гули у старых анатомических склепов, вампиры', rumors: ['Виковарские полевые хирурги славятся лучшей медициной в мире, а местные чародеи не гнушаются чёрной некромантии по приказу Императора.', 'Отсюда родом благородный рыцарь Кагыр с крыльями хищной птицы на шлеме и чародейка Фрингилья Виго.'], desc: 'Учёная и аристократическая столица Виковаро в верховьях Альбы — родина Кагыра и Фрингильи Виго.' },
    { id: 'nilfgaard_city', name: 'Город Золотых Башен (Нильфгаард)', x: 1710, y: 3800, icon: '☀️', type: 'capital', regionKey: 'nilfgaard', region: 'Сердце Империи Нильфгаард', ruler: 'Император Эмгыр вар Эмрейс (Белое Пламя)', climate: 'Южный субтропический, дельта реки Альба', danger: 'Смертельная для врагов Короны (Бригада «Импера», разведка Ватье де Ридо)', population: '45 000+ жителей (столица Юга)', economy: 'Золотая казна Империи, торговая корпорация Шиллярда фиц-Эстерлена, порт на Альбе', inn: 'Имперский гранд-отель «Великое Солнце» на проспекте Триумфов (20 золотых флоренов)', factions: 'Двор Императора Эмгыра, Гвардейская бригада «Импера», Военная разведка (Ватье де Ридо), Торговая гильдия (Бернгер из Левенделя)', npcs: 'Император Эмгыр вар Эмрейс, Ватье де Ридо, Морвран Воорхис, Шиллярд фиц-Эстерлен, Ксартисиус (астролог)', monsters: 'Боевые чудовища в императорском зверинце, проклятые артефакты башни Ксартисиуса', rumors: ['Все купола и шпили императорского дворца над рекой Альбой отлиты из чистого червонного золота.', 'В обсерватории престарелого астролога Ксартисиуса хранятся звёздные карты, по которым ищут след Старшей Крови по всему Континенту.'], desc: 'Величественная столица Империи Нильфгаард на полноводной реке Альба, сверкающая золотыми башнями под знаменем Великого Солнца.' },

    // === ДЕРЕВНИ, ПОСТОЯЛЫЕ ДВОРЫ И МЕЛКИЕ ПОСЕЛЕНИЯ (type: 'village') ===
    { id: 'blackbough', name: 'Деревня Чёрная Ветвь', x: 1295, y: 1235, icon: '🏡', type: 'village', regionKey: 'temeria', region: 'Велен (Западная чаща)', ruler: 'Староста Чёрной Ветви (под властью Барона)', climate: 'Густой сырой лес у болот', danger: 'Высокая (Дикие псы, волколаки, дезертиры)', population: '115 жителей', economy: 'Охота, заготовка дров, кузнечный горн', inn: 'Ночлег у старосты за 1 крону', factions: 'Крестьяне Велена, люди Кровавого Барона', npcs: 'Кузнец Чёрной Ветви, охотник Мыслав, купцы-беженцы', monsters: 'Волколак в пещере под холмом, стаи варгов, утопцы', rumors: ['Жена охотника пропала в чаще за деревней — говорят, там бродит огромный волколак.', 'На доске у кузницы вывешено три свежих заказа от лесорубов.'], desc: 'Крупная лесная деревня к западу от Врониц, зажатая между болотами и чащей, где промышляют охотники и лесорубы.' },
    { id: 'downwarren', name: 'Деревня Штейгеры', x: 1412, y: 1322, icon: '🏡', type: 'village', regionKey: 'temeria', region: 'Велен (Подгорье Топей)', ruler: 'Старейшина Штейгеров (дань Хозяйкам Леса)', climate: 'Туманные предгорья над Кривоуховыми топями', danger: 'Смертельная (Хозяйки Леса, Дух Шепчущего Холма)', population: '80 жителей', economy: 'Торфоразработки, сбор болотных трав, оброк ушами', inn: 'Хлев на окраине деревни', factions: 'Культ Хозяек Леса (Пряха, Кухарка, Шептуха)', npcs: 'Староста с отрезанным ухом, деревенские сироты', monsters: 'Кладбищенские бабы, призрак Чёрной Мары, бесы', rumors: ['Староста отрезал себе ухо у Говорящего Камня в знак верности Хозяйкам Леса.', 'Корни под Шепчущим Холмом сочатся свежей кровью по ночам.'], desc: 'Мрачная деревня на краю Кривоуховых топей, жители которой платят кровавую дань древним Хозяйкам Леса.' },
    { id: 'lindenvale', name: 'Деревня Линденвейл', x: 1352, y: 1255, icon: '🏡', type: 'village', regionKey: 'temeria', region: 'Велен (Долина реки)', ruler: 'Староста Линденвейла', climate: 'Сырая речная низина', danger: 'Высокая (Кладбищенские бабы, призраки погоста)', population: '95 жителей', economy: 'Рыбная ловля, пашня, плетение корзин', inn: 'Постоялый дом у переправы (1 крона)', factions: 'Сельская община Велена', npcs: 'Староста-вдовец, гробовщик, кузнец', monsters: 'Старая кладбищенская баба «Скорбящая», гули, полуденницы', rumors: ['По ночам на деревенском кладбище старая трупоедка раскапывает свежие могилы детей.', 'В заброшенном поместье Реардон за рекой кто-то расставил медвежьи капканы.'], desc: 'Небольшая бедная деревня в центре Велена, страдающая от набегов трупоедов со старого погоста.' },
    { id: 'midcopse', name: 'Деревня Залесье', x: 1268, y: 1268, icon: '🏡', type: 'village', regionKey: 'temeria', region: 'Велен (Юго-западный лес)', ruler: 'Войт Залесья', climate: 'Хвойный бор и поля', danger: 'Средняя (Полуденницы, главоглазы в роще)', population: '110 жителей', economy: 'Бортничество, сбор грибов и целебных трав', inn: 'Сеновал у мельника', factions: 'Вольные крестьяне Велена', npcs: 'Войт Залесья, Кейра Мец (в хижине травницы неподалёку)', monsters: 'Полуденница «Белая Дама», лесной архигрифон, эндриаги', rumors: ['В лесу за деревней поселилась городская ведьма, которая лечит крестьянских коров и берёт плату курами.', 'Неподалёку в эльфийских руинах видели воинов Дикой Охоты в ледяной броне.'], desc: 'Тихая деревня на опушке западного бора Велена, рядом с которой скрывалась чародейка Кейра Мец.' },
    { id: 'oreton', name: 'Деревня Рудник', x: 1322, y: 1292, icon: '🏡', type: 'village', regionKey: 'temeria', region: 'Велен (Старые копи)', ruler: 'Десятник ополчения', climate: 'Глинистые овраги и старые штольни', danger: 'Высокая (Тролли, призраки шахт, бандиты)', population: '90 жителей', economy: 'Древние железные штольни, углежоги', inn: 'Кабак «У Старой Штольни» (1 крона)', factions: 'Шахтёрская артель, люди Барона', npcs: 'Старый рудокоп, бронник деревни', monsters: 'Воющий элементаль земли в шахте, накеры, альгули', rumors: ['Рабочие, ушедшие в старую железную шахту неделю назад, так и не вернулись.', 'Ночью со стороны Коломницы доносится плач призраков.'], desc: 'Шахтёрская деревушка в Велене у заброшенных железорудных копей и старых углежогных ям.' },
    { id: 'inn_crossroads', name: 'Корчма на Перепутье', x: 1345, y: 1192, icon: '🍺', type: 'village', regionKey: 'temeria', region: 'Велен (Большой тракт к Понтару)', ruler: 'Корчмарь перепутья', climate: 'Перекрёсток размытых военных дорог', danger: 'Средняя (Люди Кровавого Барона, мародёры)', population: '45 постояльцев и челяди', economy: 'Трактир, конюшня, торговля контрабандой и сведениями', inn: 'Корчма на Перепутье (2 кроны за горячую похлёбку и койку)', factions: 'Дружинники Барона, темерские лазутчики, купцы', npcs: 'Корчмарь, агент Хендрик (в прошлом), головорезы Барона', monsters: 'Виверны у разрушенного моста, гули у обочин', rumors: ['В сапоге убитого шпиона в соседней Вересковке нашли зашифрованные записи о пепельноволосой девушке.', 'Командир гарнизона обещает щедрую плату за голову королевской виверны, нападающей на обозы.'], desc: 'Главный постоялый двор Велена на скрещении всех дорог между Вроницами, Оксенфуртом и Вызимой.' },
    { id: 'mulbrydale', name: 'Деревня Яворник', x: 1368, y: 1208, icon: '🏡', type: 'village', regionKey: 'temeria', region: 'Велен (Центральный тракт)', ruler: 'Заброшена / Староста Яворника', climate: 'Поля у перекрёстка', danger: 'Высокая (Гули, дезертиры)', population: '65 жителей', economy: 'Кузница, ремонт телег', inn: 'Постоялый сарай у кузни', factions: 'Беженцы войны', npcs: 'Спасённый кузнец Яворника', monsters: 'Стаи гулей и альгулей, трупоеды', rumors: ['Банда дезертиров захватила кузнеца, чтобы он ковал им оружие.', 'На холме за деревней стоит одинокое дерево висельников.'], desc: 'Разорённая войной деревушка к востоку от Врониц на дороге к переправам через Понтар.' },
    { id: 'byways', name: 'Деревня Заушье', x: 1252, y: 1312, icon: '🏡', type: 'village', regionKey: 'temeria', region: 'Велен (Западное взморье)', ruler: 'Войт Заушья', climate: 'Холодные морские ветра и глинистые холмы', danger: 'Высокая (Эккимы в эльфийских руинах под деревней)', population: '70 жителей', economy: 'Овцеводство, заготовка торфа', inn: 'Изба войта', factions: 'Крестьяне Заушья', npcs: 'Войт Заушья, ведьмак Ламберт (при расследовании заказа)', monsters: 'Древняя эккима «Сарасти» в подземельях под деревней, гули', rumors: ['Крестьяне провалились в древние эльфийские руины под овином и разбудили кровожадного вампира.', 'Ночью по крышам изб кто-то скребётся длинными когтями.'], desc: 'Отдалённая деревня у западного берега Велена, стоящая прямо над древним эльфийским святилищем.' },
    { id: 'seven_cats_inn', name: 'Корчма «Семь Котов»', x: 1295, y: 1018, icon: '🍺', type: 'village', regionKey: 'redania', region: 'Предместья Новиграда', ruler: 'Хозяйка корчмы', climate: 'Оживлённый тракт у южных ворот Новиграда', danger: 'Низкая (Воры, наёмники, охотники за колдуньями)', population: '85 постояльцев и торговцев', economy: 'Трактир, игра в гвинт, найм охраны для караванов', inn: 'Корчма «Семь Котов» (4 новиградские кроны, лучшее пиво в округе)', factions: 'Купцы Новиграда, барды, вольные ведьмаки', npcs: 'Корчмарка, купцы с Понтара, странствующие игроки в гвинт', monsters: 'Туманники в роще у реки, накеры под мостом', rumors: ['В лесной чаще к востоку от корчмы завёлся древний леший, которого местные почитают как лесного духа.', 'На доске у входа всегда висят самые свежие заказы со всех окрестных хуторов Новиграда.'], desc: 'Знаменитая шумная корчма у развилки дорог перед Новиградом, где встречаются купцы, барды и ведьмаки.' },
    { id: 'cunny_of_the_goose', name: 'Корчма «Гусиная Гузка»', x: 1278, y: 1052, icon: '🍺', type: 'village', regionKey: 'redania', region: 'Южное предместье Новиграда', ruler: 'Корчмарь Иоанн', climate: 'Речная пойма у городских стен', danger: 'Низкая (Пьяные драки, реданские вербовщики)', population: '60 человек', economy: 'Дешёвый ночлег, переправа через рукав Понтара', inn: 'Корчма «Гусиная Гузка» (3 кроны за кружку эля и жаркое из гуся)', factions: 'Реданская пехота, речные лодочники', npcs: 'Корчмарь, травник в лавке напротив', monsters: 'Утопцы в камышах у старой мельницы', rumors: ['Под мостом через канал по ночам всплывают тела контрабандистов.', 'Хозяин корчмы скупает шкуры и редкие алхимические травы без лишних вопросов.'], desc: 'Популярный загородный трактир на южном берегу канала перед стенами вольного города Новиграда.' },
    { id: 'yantra', name: 'Деревня Янтра', x: 1358, y: 1012, icon: '🏡', type: 'village', regionKey: 'redania', region: 'Реданское Заречье (к северо-востоку от Новиграда)', ruler: 'Староста Янтры', climate: 'Хлебные поля и пасеки', danger: 'Средняя (Королевский архигрифон, трупоеды)', population: '130 жителей', economy: 'Пасеки, производство мёда и воска, хлебопашество', inn: 'Корчма у пасеки (2 кроны)', factions: 'Бортники Холмогорья, Реданская стража', npcs: 'Семья низушков-пчеловодов Мейерсдорфов', monsters: 'Дикая Охота (гончая у замёрзшего улья), архигрифон на холмах', rumors: ['Что-то заморозило ульи на дальней пасеке посреди лета и оставило следы огромных копыт во льду.', 'На северной лесопилке лесорубов растерзал огромный грифон с белым оперением.'], desc: 'Богатая реданская деревня бортников и пахарей к востоку от Новиграда, известная своим липовым мёдом.' },
    { id: 'brunwich', name: 'Деревня Брунвик', x: 1418, y: 982, icon: '🏡', type: 'village', regionKey: 'redania', region: 'Северо-восточная Редания', ruler: 'Войт Брунвика', climate: 'Озёрный край, золотые пшеничные нивы', danger: 'Высокая (Пауки-арахноморфы в пещерах, кабаны)', population: '150 жителей', economy: 'Земледелие, мельницы, кузня офирского мастера रून (Рунного Мастера)', inn: 'Деревенский трактир у пруда (3 кроны)', factions: 'Крестьяне Редании, Офирская торговая экспедиция', npcs: 'Офирский мастер рун и глифов (у Верхней Мельницы), призрак Витольда фон Эверека', monsters: 'Гигантские арахноморфы в нефритовой шахте, полуденницы в полях', rumors: ['В старом семейном склепе фон Эвереков по ночам слышен звон сабель и смех мертвецов.', 'У Верхней Мельницы разбил шатёр заморский мастер из Офира, способный зачаровывать ведьмачьи мечи.'], desc: 'Живописная реданская деревня у пруда с кувшинками, прообраз деревни из поэмы «Свадьба», рядом с усадьбой фон Эвереков.' },
    { id: 'carsten', name: 'Поместье Карстен', x: 1322, y: 1028, icon: '🏡', type: 'village', regionKey: 'redania', region: 'Долина Новиграда', ruler: 'Управляющий поместья', climate: 'Ухоженные сады и виноградники', danger: 'Низкая (Гарпии на скалах у реки)', population: '95 жителей', economy: 'Поставки фруктов, овощей и вина ко двору Новиграда', inn: 'Гостевой флигель поместья (3 кроны)', factions: 'Купеческие дома Новиграда', npcs: 'Садовник поместья, купец-виноторговец', monsters: 'Полуденница на пшеничном поле, эндриаги в роще', rumors: ['В заброшенной башне на холме нашли дневники старого алхимика Школы Кота.', 'По ночам в старом амбаре прячутся беглые чародеи.'], desc: 'Зажиточное загородное поместье и слобода между Новиградом и Оксенфуртом.' },
    { id: 'heddel', name: 'Деревня Хеддель', x: 1445, y: 1022, icon: '🏡', type: 'village', regionKey: 'redania', region: 'Восточное пограничье Редании', ruler: 'Командор Ордена Пылающей Розы (в изгнании)', climate: 'Заброшенные хутора у кромки леса', danger: 'Высокая (Рыцари-ренегаты Пылающей Розы, гули)', population: '40 выживших крестьян', economy: 'Разорённые поля, тайные лаборатории фисштеха', inn: 'Разгромленный постоялый двор', factions: 'Падшие рыцари Ордена Пылающей Розы', npcs: 'Ульрих (рыцарь-командор ренегатов)', monsters: 'Альгули, гнильцы, призраки сожжённых хуторов', rumors: ['Бывшие рыцари Ордена Пылающей Розы под предводительством Ульриха варят фисштех в лесных лагерях.', 'Крестьяне боятся выходить из домов после заката из-за вооружённых латников в красных плащах.'], desc: 'Приграничная реданская деревня у восточных лесов, захваченная мародёрами и падшими рыцарями.' },
    { id: 'rinde', name: 'Городок Ринда', x: 1485, y: 1045, icon: '🏡', type: 'village', regionKey: 'redania', region: 'Южная Редания', ruler: 'Бургомистр Невилл и советник Ламберт', climate: 'Зелёные холмы и фруктовые сады', danger: 'Средняя (Джинны, чародейские эксперименты)', population: '2 400 жителей', economy: 'Ремесленные лавки, винокурни, торговля яблочным сидром', inn: 'Трактир Эрамуса Нидаля (4 кроны)', factions: 'Городской магистрат Ринды, гильдия аптекарей', npcs: 'Йеннифэр из Венгерберга (гостила в усадьбе Бо, где Геральт загадал последнее желание), бургомистр Невилл, жрец Крепп', monsters: 'Воздушный гений (джинн) из кувшина на дне реки', rumors: ['Говорят, именно здесь беловолосый ведьмак и чернокудрая чародейка связали свои судьбы Последним Желанием, едва не разрушив полгорода.', 'Рыбаки до сих пор находят на дне реки осколки древних печатей.'], desc: 'Уютный реданский городок, вошедший в легенды как место первой встречи Геральта и Йеннифэр при укрощении джинна.' },
    { id: 'outskirts_vizima', name: 'Предместья Вызимы', x: 1625, y: 1175, icon: '🏡', type: 'village', regionKey: 'temeria', region: 'Окрестности столицы Темерии', ruler: 'Преподобный (духовный пастырь слободы)', climate: 'Карантинная слобода у южных ворот Вызимы', danger: 'Высокая (Адская гончая Зверь, баргесты, гули)', population: '350 жителей', economy: 'Торговля припасами у городских ворот, трактир, кузня краснолюда', inn: 'Купеческий трактир Олафа на тракте (3 орена)', factions: 'Прихожане Вечного Огня, купцы Харрена Брогга, скоя\'таэли у реки', npcs: 'Преподобный, травница Абигайл, купец Харрен Брогг, Микула, Одо', monsters: 'Призрачный пёс «Зверь», стаи баргестов, утопцы, эхинопсы в пещере', rumors: ['По ночам улицы Предместий окутывает зелёный туман, и призрачные псы разрывают припозднившихся путников.', 'Преподобный обвиняет в проклятии рыжеволосую ведунью Абигайл, живущую на отшибе.'], desc: 'Разросшаяся слобода у закрытых на карантин ворот Вызимы, терзаемая призрачными баргестами и фанатизмом.' },
    { id: 'murky_waters', name: 'Деревня Темноводье', x: 1585, y: 1218, icon: '🏡', type: 'village', regionKey: 'temeria', region: 'Южный берег озера Вызима', ruler: 'Староста Тобиас Гофман', climate: 'Золотые пшеничные поля у зеркальной глади озера', danger: 'Высокая (Полуденница Алина, водяные Дагона, виверны)', population: '180 жителей', economy: 'Пекарня, хлебопашество, рыбный промысел, гончарное дело', inn: 'Деревенская корчма Темноводья с видом на озеро (3 орена)', factions: 'Крестьяне Темноводья, жрецы подводного бога Дагона, отряд Торувьель', npcs: 'Староста Тобиас Гофман, сёстры Алина и Селина, кузнец, травница, Владычица Озера (на острове)', monsters: 'Полуденница «Белая Невеста» в малиннике, ночница, рыболюди-обитатели глубин, королевские виверны', rumors: ['Невеста старосты Алина погибла накануне свадьбы и теперь бродит по полям в полдень в окровавленном подвенечном платье.', 'На древнем алтаре у берега крестьяне оставляют дары подводным тварям, чтобы те не топили рыбацкие лодки.'], desc: 'Идиллическая на вид темерская деревня на южном берегу озера Вызима, хранящая мрачную тайну сестёр Алины и Селины.' },
    { id: 'flotsam', name: 'Фактория Флотзам', x: 1930, y: 1130, icon: '🏡', type: 'village', regionKey: 'temeria', region: 'Долина Понтара (Верхняя Темерия)', ruler: 'Комендант Бернард Лоредо', climate: 'Густые первобытные леса у излучины Понтара', danger: 'Экстремальная (Кейран, эндриаги, скоя\'таэли Иорвета)', population: '650 жителей (люди, эльфы, краснолюды)', economy: 'Речная таможня Понтара, лесозаготовки, торговля с Каэдвеном и Аэдирном', inn: 'Двухэтажная таверна Флотзама с бойцовским подвалом (4 орена)', factions: 'Гарнизон Лоредо, Синие Полоски Вернона Роше, скоя\'таэли Иорвета', npcs: 'Комендант Лоредо, Седрик, купец Луи Мерсе, трактирщик Марго, Шеала де Танкарвилль', monsters: 'Гигантский речной монстр Кейран, королевы эндриаг, накеры, главоглазы', rumors: ['Огромный речной монстр Кейран перекрыл фарватер Понтара и разрушил королевский мост.', 'В лесной чаще за факторией скрывается лесной эльф Иорвет со своей самой опасной сотней «белок».'], desc: 'Пограничная торговая фактория Темерии в дремучих лесах долины Понтара на стыке трёх королевств.' },
    { id: 'lower_posada', name: 'Деревня Нижняя Посада', x: 2450, y: 1185, icon: '🏡', type: 'village', regionKey: 'scoiatael', region: 'Край Земли (предгорья Дол Блатанна)', ruler: 'Староста Дункан и старейшина Кильморек', climate: 'Благодатная цветущая долина у подножия Синих Гор', danger: 'Средняя (Сильван Торкве, горные эльфы Филавандреля)', population: '220 жителей', economy: 'Обильные урожаи зерна, льна, конопли и овощей', inn: 'Деревенский постоялый двор Нижней Посады (2 орена)', factions: 'Крестьяне долины, Свободные эльфы Филавандреля', npcs: 'Староста Дункан, вещая дева Лилле (Дана Меабдх), сильван Торкве, Геральт и Лютик', monsters: 'Рогатый сильван Торкве («дьявол»), ворующие посевы по заказу голодающих эльфов в горах', rumors: ['В конопляных полях за деревней завелся хитрый рогатый «дьявол», который требует мешки зерна и редких семян, но никого не убивает.', 'Молчаливая деревенская девушка Лилле почитается самими эльфами как живое воплощение богини урожая Дана Меабдх.'], desc: 'Знаменитая деревня из рассказа «Край света», где Геральт и Лютик столкнулись с сильваном Торкве и эльфами Дол Блатанна.' },
    { id: 'vergen', name: 'Вольный город Верген', x: 2150, y: 1170, icon: '⚒️', type: 'village', regionKey: 'kaedwen_aedirn', region: 'Верхний Аэдирн (Марка Саэссентессис)', ruler: 'Саския (Дева из Аэдирна) и староста Сессиль Бурдон', climate: 'Скалистые ущелья у подножия гор Махакама', danger: 'Высокая (Гарпии в каньонах, армия Каэдвена, мгла)', population: '3 800 жителей (краснолюды, люди, эльфы)', economy: 'Серебряные и железные рудники, кузни краснолюдов', inn: 'Корчма «Под Ползучим Котлом» (3 орена, крепкий махакамский эль)', factions: 'Защитники Свободной Марки Саскии, кланы краснолюдов, отряд Иорвета', npcs: 'Саския (Драконоубийца / золотой дракон Борх), Сессиль Бурдон, Ярпен Зигрин, Золтан Хивай, Филиппа Эйльхарт', monsters: 'Стаи гарпий и келено в ущелье, гнильцы и призраки на проклятом поле битвы', rumors: ['Говорят, за неприступными воротами Вергена сражается сама Дева из Аэдирна, которой не страшен ни меч, ни драконий огонь.', 'В заброшенных штольнях под городом шахтёры наткнулись на гнёзда трупоедов.'], desc: 'Высеченная в скалах древняя краснолюдская твердыня Верхнего Аэдирна, ставшая оплотом восстания Саскии за свободу долины Понтара.' },
    { id: 'blaviken', name: 'Приморский городок Блавикен', x: 960, y: 455, icon: '🏡', type: 'village', regionKey: 'kovir', region: 'Лукоморье (залив Пракседа)', ruler: 'Войт Кальдемейн и чародей Иррион (Стрегобор)', climate: 'Свежий морской бриз, рыбацкая бухта и ярмарочная площадь', danger: 'Средняя (Банда Ренфри «Сорокопутки», морские чудовища)', population: '1 900 жителей', economy: 'Рыбный рынок, морская торговля, ежегодные большие ярмарки', inn: 'Корчма «Под Золотым Судом» на рыночной площади (3 бизанта)', factions: 'Городская стража войта Кальдемейна, чародей Стрегобор в каменной башне', npcs: 'Войт Кальдемейн, чародей Стрегобор, княжна Ренфри («Сорокопутка»), Геральт из Ривии', monsters: 'Кикимора из лесных болот за городом, мантикоры в горах', rumors: ['В ярмарочный день беловолосый ведьмак в одиночку перебил на рыночной площади всю шайку головорезов Ренфри, за что получил прозвище «Мясник из Блавикена».', 'В глухой башне без дверей за околицей живёт старый чародей Стрегобор, прячущийся от проклятия Чёрного Солнца.'], desc: 'Знаменитый приморский городок в Лукоморье, где Геральт выбрал «меньшее зло» и навсегда стал известен как Мясник из Блавикена.' },
    { id: 'blandare', name: 'Деревня Бландаре', x: 675, y: 1580, icon: '🏡', type: 'village', regionKey: 'skellige', region: 'Центральный Ард Скеллиг', ruler: 'Клан ан Крайт', climate: 'Горное плато и серебряные рудники', danger: 'Средняя (Гарпии, тролли, древний дух леса)', population: '160 островитян', economy: 'Добыча руды, выпас овец на вересковых пустошах', inn: 'Общинный дом рудокопов (2 кроны)', factions: 'Воины клана ан Крайт', npcs: 'Старейшина Харольд, молодые охотники деревни', monsters: 'Древний леший «Дух Леса» в священной роще, сирены в горах', rumors: ['Молодые воины деревни требуют убить древнего Духа Леса, а старики хотят принести ему жертву по заветам предков.', 'В заброшенной винокурне в горах варят легендарный скеллигский спирт для друидов.'], desc: 'Горная деревня пастухов и рудокопов в самом сердце острова Ард Скеллиг.' },
    { id: 'rannvaig', name: 'Деревня Раннваг', x: 585, y: 1595, icon: '🏡', type: 'village', regionKey: 'skellige', region: 'Западный берег Ард Скеллига', ruler: 'Клан ан Крайт / Клан Друммонд', climate: 'Скалистый фьорд и рыбацкие причалы', danger: 'Средняя (Сирены, утопцы, проклятие нидинга)', population: '140 жителей', economy: 'Ловля трески и сельди, постройка дракаров', inn: 'Таверна у причала Раннвага (2 кроны)', factions: 'Рыбаки и мореходы фьорда', npcs: 'Лотар, травница Ютта, кормчие дракаров', monsters: 'Эхидны на утёсах, водные бабы у разбитых остовов кораблей', rumors: ['В деревне установили резной шест проклятия «нидинг» с черепом коня, обрекающий сына рыбака на неминуемую гибель.', 'На соседнем полуострове возвышается мрачный маяк Эльдберг, окутанный неестественным туманом.'], desc: 'Рыбацкое селение в глубоком западном фьорде Ард Скеллига, откуда уходят лодки к маяку Эльдберг.' },
    { id: 'arinbjorn', name: 'Деревня Аринбьорн', x: 565, y: 1622, icon: '🍺', type: 'village', regionKey: 'skellige', region: 'Западный фьорд Ард Скеллига', ruler: 'Клан ан Крайт', climate: 'Штормовая бухта под утёсами', danger: 'Высокая (Кающийся призрак на маяке Эльдберг, сирены)', population: '175 жителей', economy: 'Охота на китов, рыбный промысел, таверна у гавани', inn: 'Таверна Аринбьорна (3 кроны, жареная сельдь и мёд)', factions: 'Мореходы Аринбьорна, воины Лугоса Безумного', npcs: 'Корчмарь Йонас, смотритель маяка Миккель, скальд Йорунд', monsters: 'Могущественный призрак «Кающийся» у маяка Эльдберг, полуночницы', rumors: ['Маяк Эльдберг погас, а вся бухта укрылась ледяным туманом, в котором гибнут корабли.', 'В таверне Аринбьорна чужакам лучше не задерживаться после полуночи — местные рубаки скоры на топор.'], desc: 'Суровая китобойная деревня и порт на западе Ард Скеллига напротив проклятого маяка Эльдберг.' },
    { id: 'fyresdal', name: 'Деревня Фиресдаль', x: 650, y: 1648, icon: '🏡', type: 'village', regionKey: 'skellige', region: 'Южный берег Ард Скеллига', ruler: 'Клан ан Крайт / Клан Тордаррох', climate: 'Долина у южного залива и пастбища', danger: 'Высокая (Дракониды, вилохвосты на утёсах)', population: '165 жителей', economy: 'Скотоводство, кузнечное ремесло, торговля шерстью', inn: 'Деревенский постоялый двор Фиресдаля (2 кроны)', factions: 'Островитяне южного берега', npcs: 'Старейшина Фиресдаля, кузнец, травник', monsters: 'Крупный вилохвост и накеры в старом редуте (заказ «Дракон»)', rumors: ['На пастбищах Фиресдаля крылатая бестия утаскивает овец и коров — пастухи клянутся, что это настоящий дракон.', 'На южных скалах за деревней нашли полуразрушенные башни древних великанов.'], desc: 'Крупная прибрежная деревня на юге главного острова Скеллиге у подножия скалистых гор.' },
    { id: 'holmstein', name: 'Гавань Хольмстейн', x: 615, y: 1685, icon: '⚓', type: 'village', regionKey: 'skellige', region: 'Юго-запад Ард Скеллига (земли клана Друммонд)', ruler: 'Ярл Лугос Безумный (Клан Друммонд)', climate: 'Суровый скалистый порт под крепостью Каэр Мюр', danger: 'Высокая (Воины Лугоса, морские чудовища, пещера снов)', population: '310 жителей', economy: 'Верфи боевых дракаров, рыбный порт, кузни клана Друммонд', inn: 'Портовый кабак Хольмстейна (3 кроны)', factions: 'Клан Друммонд', npcs: 'Лугос Синий, друиды Пещеры Снов', monsters: 'Сирены, эхидны, призраки Пещеры Снов на мысе', rumors: ['В Пещере Снов к востоку от порта смельчаки видят свои самые глубокие кошмары наяву.', 'Дракары Лугоса Безумного возвращаются в Хольмстейн с богатой добычей с южных морей.'], desc: 'Укреплённый порт клана Друммонд у подножия цитадели Каэр Мюр на южной оконечности Ард Скеллига.' },
    { id: 'lofoten', name: 'Деревня Лофотен', x: 785, y: 1575, icon: '🏡', type: 'village', regionKey: 'skellige', region: 'Остров Хиндарсфьялль', ruler: 'Клан Хеймэй и жрицы Фрейи', climate: 'Цветущие луга рядом со Священной рощей Фрейи', danger: 'Высокая (Проклятый волколак Моркварг в саду, Дикая Охота)', population: '150 жителей', economy: 'Садоводство, уход за святилищем богини Фрейи, рыболовство', inn: 'Постоялый дом паломников в Ларвике и Лофотене (2 кроны)', factions: 'Жрицы храма Фрейи, воины клана Хеймэй', npcs: 'Верховная жрица Сигрдрифа, Скьялль («Трус»), Йеннифэр и Геральт', monsters: 'Бессмертный проклятый волколак Моркварг в священном саду Фрейи', rumors: ['В священном саду Фрейи у деревни заперт проклятый пират Моркварг, который оживает каждый раз после смерти.', 'Во время набега ледяных воинов Дикой Охоты на Лофотен юный Скьялль спас пепельноволосую девушку.'], desc: 'Древнее селение на священном острове Хиндарсфьялль у входа в заповедный сад богини Фрейи.' },
    { id: 'flovive', name: 'Деревня Фловив', x: 2390, y: 2210, icon: '🍇', type: 'village', regionKey: 'toussaint', region: 'Восточный Туссент (долина Сансретур)', ruler: 'Княжеский фогт Фловива', climate: 'Солнечная долина оливковых рощ и виноградников', danger: 'Средняя (Сколопендроморфы, вихты, археспоры)', population: '420 жителей', economy: 'Виноделие, производство бочек (бондари), оливковое масло', inn: 'Корчма «Под Фазаном» во Фловиве (5 крон)', factions: 'Гильдия бондарей и виноделов Туссента, Странствующие рыцари', npcs: 'Бондарь Фловива, управляющий складами княжеских вин', monsters: 'Пятнистый вихт в проклятой усадьбе Трэстах, археспоры на заброшенных плантациях', rumors: ['В лесной усадьбе за деревней живёт безумное существо, одержимое сотнями старых ложек.', 'В погребах Фловива хранятся редкие бочки с вином Сангреаль для самого княжеского двора.'], desc: 'Живописная винодельческая деревня в долине реки Сансретур к востоку от Боклера.' },
    { id: 'foxhole_inn', name: 'Корчма «Лисьи Ямы» (Туссент)', x: 2415, y: 2175, icon: '🍺', type: 'village', regionKey: 'toussaint', region: 'Северный тракт Туссента', ruler: 'Корчмарь «Лисьих Ям»', climate: 'Оживлённый перекрёсток у северных виноградников', danger: 'Средняя (Банды ганзы в старых замках, бруксы)', population: '90 жителей и путников', economy: 'Постоялый двор, винная ярмарка, кузня и турнирный лагерь', inn: 'Корчма «Лисьи Ямы» (4 кроны, вино Кот-де-Блессюр)', factions: 'Купцы Туссента, странствующие рыцари', npcs: 'Корчмарь, странствующий рыцарь Гильом де Лонфаль', monsters: 'Альпы и бруксы в старых руинах, великаны-гроты в пещерах', rumors: ['На северных холмах за корчмой огромная шайка разбойников захватила руины замка Монкран.', 'На доске объявлений у «Лисьих Ям» виноделы щедро платят золотом за зачистку пещер от чудовищ.'], desc: 'Крупный постоялый двор и торговое селение на северном перепутье княжества Туссент.' },
    { id: 'corvo_bianco', name: 'Поместье Корво Бьянко', x: 2445, y: 2195, icon: '🍷', type: 'village', regionKey: 'toussaint', region: 'Долина Сансретур (Восточный Туссент)', ruler: 'Ведьмак Геральт из Ривии и дворецкий Варнава-Базиль Фоулти', climate: 'Кипарисовая аллея на солнечном холме над рекой', danger: 'Низкая (в прошлом — брукса в винном погребе)', population: '25 виноградарей и челяди', economy: 'Собственная винодельня («Белый Волк» / «Бутчер из Блавикена»), алхимический сад и оружейная', inn: 'Господский дом Корво Бьянко (бесплатно для владельца и друзей)', factions: 'Дом Геральта из Ривии под грамотой княгини Анны-Генриетты', npcs: 'Мажордом Варнава-Базиль Фоулти, кухарка Марлен де Трэстах, Геральт, Йеннифэр / Трисс / Цири / Лютик', monsters: 'Винный погреб очищен от бруксы; в теплице растут редкие алхимические травы для мутагенов', rumors: ['Княгиня Анна-Генриетта пожаловала старое поместье Корво Бьянко самому Белому Волку в награду за охоту на Бестию из Боклера.', 'В тайной подземной лаборатории под винным погребом ведьмак восстановил древний мутагенератор профессора Моро.'], desc: 'Личное винодельческое поместье Геральта из Ривии в Туссенте с алхимической теплицей, конюшней для Плотвы и залом трофеев.' },
    { id: 'jealousy_geso', name: 'Деревня Ревность (Гесо)', x: 2310, y: 2785, icon: '🩸', type: 'village', regionKey: 'nilfgaard', region: 'Провинция Гесо (Пограничье)', ruler: 'Трактирщик и староста Ревности', climate: 'Пыльное степное перепутье', danger: 'Смертельная (Наёмный убийца Лео Бонарт, банды)', population: '190 жителей', economy: 'Постоялый двор «Под Головой Химеры», торговля скотом', inn: 'Трактир «Под Головой Химеры» (2 флорена)', factions: 'Наёмники Юга, охотники за головами', npcs: 'Лео Бонарт, Цири (Фалька), банда «Крыс» (Мистле, Гиселер, Кайлей, Искдра, Рееф, Ассе)', monsters: 'Степные виверны и сколопендроморфы, но опаснее всех — человек с рыбьими глазами Лео Бонарт', rumors: ['На рассвете в грязи главной улицы Ревности старый фехтовальщик Лео Бонарт в одиночку зарубил шестерых знаменитых разбойников из банды «Крыс».', 'Трактирщик до сих пор отмывает кровь с крыльца «Под Головой Химеры».'], desc: 'Мрачно известная пограничная деревня в провинции Гесо, где наёмный убийца Лео Бонарт уничтожил банду «Крыс» и пленил Цири.' },

    // === ИМЕННЫЕ ЛЕСА, ПУЩИ, БОЛОТА, ОЗЁРА И ГОРНЫЕ ХРЕБТЫ (type: 'nature') ===
    { id: 'whispering_hillock', name: 'Шепчущий Холм и Вековечный Дуб', x: 1365, y: 1315, icon: '🌳', type: 'nature', regionKey: 'temeria', region: 'Велен (Южные леса у Топей)', ruler: 'Пленённый Дух Шепчущего Холма (Чёрная Мара)', climate: 'Кровавые корни, древний курган и чаща', danger: 'Смертельная (Бешеный волколак, водные бабы, эндриаги)', population: 'Необитаемое проклятое урочище', economy: 'Древний друидский круг и подземный грот под корнями дуба', inn: 'Нет (стоянка у границ холма опасна)', factions: 'Первобытный дух леса (враг Хозяек Леса)', npcs: 'Дух в корнях дерева, волколак-страж холма', monsters: 'Волколак, водные бабы, кладбищенские бабы, бешенство зверей', rumors: ['Внутри пещеры под Вековечным Дубом бьётся живое сердце из древесных корней, шепчущее голосом древней жрицы.', 'Ни один зверь в радиусе мили от Шепчущего Холма не знает пощады к людям.'], desc: 'Проклятый курган с исполинским дубом в лесах Велена, в корнях которого заточен древний и опасный лесной дух.' },
    { id: 'crookback_deadwood', name: 'Мёртвый лес Кривоуховых Топей', x: 1410, y: 1275, icon: '🌲', type: 'nature', regionKey: 'temeria', region: 'Центральный Велен', ruler: 'Древний Леший и Хозяйки Леса', climate: 'Вечный густой туман, иссохшие деревья и трясина', danger: 'Экстремальная (Древние лешие, туманники, бесы)', population: 'Вороньи стаи и болотные твари', economy: 'Редкие болотные травы, торф и затонувшие обозы', inn: 'Заброшенные хижины торфяников', factions: 'Слуги Хозяек Леса', npcs: 'Ивасик (прибожек в норе на опушке), старый отшельник', monsters: 'Древний леший, старый туманник «Игнис Фатуус», бесы, водные бабы', rumors: ['В самой чаще топей растёт кривая тропа из сладостей, по которой потерянные дети уходят в приют на болотах.', 'Густой болотный туман скрывает древнего туманника, заманивающего путников болотных огоньками в трясину.'], desc: 'Гиблое лесное урочище вокруг Кривоуховых топей, где среди кривых ив и тумана охотятся лешие и туманники.' },
    { id: 'lake_wyzima', name: 'Озеро Вызима и Остров Причалища', x: 1610, y: 1200, icon: '🌊', type: 'nature', regionKey: 'temeria', region: 'Озёрный край Вызимы', ruler: 'Владычица Озера и подводный культ Дагона', climate: 'Глубокое пресноводное озеро в кольце камышей и ив', danger: 'Высокая (Рыболюди-обитатели глубин, Дагон, королевские виверны)', population: 'Рыбацкие причалы и святилище на острове', economy: 'Судоходство, рыболовство, древний алтарь Владычицы', inn: 'Костер Короля-Рыбака на отмели', factions: 'Жрецы Владычицы Озера, культ Дагона', npcs: 'Владычица Озера (пожаловавшая Геральту меч Арондит), Король-Рыбак, жрец Вредеац', monsters: 'Бессмертное божество глубин Дагон, жрецы-водяные, утопцы, цеметавры на отмелях', rumors: ['В центре озера лежит туманный Остров Причалища, где Владычица Озера вручает достойным рыцарям легендарный серебряный меч Арондит.', 'Со дна озера поднимаются чешуйчатые рыболюди, поклоняющиеся древнему чудовищу Дагону.'], desc: 'Великое озеро у стен столицы Темерии с таинственным Островом Причалища, где обитает Владычица Озера.' },
    { id: 'swamps_vizima', name: 'Вызимские Топи и Старая Гать', x: 1565, y: 1180, icon: '🌿', type: 'nature', regionKey: 'temeria', region: 'Западный берег озера Вызима', ruler: 'Старейшина кирпичников Васка и Друидский круг', climate: 'Непроходимые болота, глиняные ямы и священная роща друидов', danger: 'Экстремальная (Кокатриксы, археспоры, кикиморы, пиявки)', population: '120 кирпичников, лесорубов и друидов', economy: 'Обжиг кирпича из болотной глины, заготовка строевого леса, сбор трав', inn: 'Шалаши кирпичников и костёр у рощи друидов', factions: 'Община кирпичников (культ Водяных), Круг друидов Вызимы, артель лесорубов Ярена Болта, скоя\'таэли', npcs: 'Старуха Васка, Иерофант друидов, лесоруб Ярен Болт, Калькштейн (у Башни Мага)', monsters: 'Королева кикимор, археспоры, эхинопсы, пиявки-бруколы, голем на кладбище големов', rumors: ['В центре болот возвышается запечатанная Башня Мага, открыть которую можно лишь десятью сефиротами.', 'Между отрядом Ордена Пылающей Розы и скоя\'таэлями в топях назревает кровопролитная битва за контроль над переправой.'], desc: 'Обширные болота у Вызимы с деревней кирпичников, рощей друидов, кладбищем големов и древней Башней Мага.' },
    { id: 'redanian_woods', name: 'Реданская Королевская Пуща', x: 1495, y: 920, icon: '🌲', type: 'nature', regionKey: 'redania', region: 'Центральная Редания (между Третогором и Оксенфуртом)', ruler: 'Королевский ловчий Редании', climate: 'Могучие дубравы и сосновые боры', danger: 'Высокая (Лешие, виверны, вольные отряды скоя\'таэлей)', population: 'Охотничьи заимки и лесные кордоны', economy: 'Королевские охотничьи угодья, корабельный лес для флота', inn: 'Охотничий двор «Олений Рог» (3 кроны)', factions: 'Королевские егеря Радовида, лесные братья', npcs: 'Главный королевский ловчий, следопыты пущи', monsters: 'Старый леший «Кернунн», королевские виверны, стаи волков и медведей', rumors: ['В глубине Реданской пущи скрываются беглые маги из Оксенфурта и Третогора.', 'Королевские егеря нашли растерзанный патруль — раны нанесены не сталью, а древесными корнями и когтями лешего.'], desc: 'Древний заповедный лесной массив в самом сердце Редании, где охотятся короли и таятся древние реликты.' },
    { id: 'pontar_floodplain_forest', name: 'Пойменная чаща Долины Понтара', x: 1790, y: 1095, icon: '🌲', type: 'nature', regionKey: 'temeria', region: 'Долина реки Понтар', ruler: 'Ничья земля / Лесные хищники', climate: 'Густые плавни, старицы и вековые ивы', danger: 'Высокая (Кейраны, главоглазы, эндриаги, речные пираты)', population: 'Стоянки плотогонов и контрабандистов', economy: 'Сплав леса по Понтару, тайные пристани контрабандистов', inn: 'Причал плотогонов у костра', factions: 'Речные контрабандисты, разведчики Темерии и Каэдвена', npcs: 'Атаман речных лодочников, старый зверолов', monsters: 'Королевы эндриаг, бронированные главоглазы, болотные биндюжники', rumors: ['В туманных протоках Понтара контрабандисты перевозят оружие и краснолюдскую сталь в обход королевских таможен.', 'В прибрежных чащах расплодились колонии гигантских эндриаг, чьи коконы висят прямо на ветвях сосен.'], desc: 'Дикие пойменные леса вдоль среднего течения Понтара, служащие естественной границей между Реданией, Темерией и Каэдвеном.' },
    { id: 'kaedwen_blue_taiga', name: 'Синяя Тайга Каэдвена', x: 2390, y: 580, icon: '🌲', type: 'nature', regionKey: 'kaedwen_aedirn', region: 'Северный Каэдвен', ruler: 'Дикая природа и лешие Севера', climate: 'Суровая вековая хвойная тайга, ранние снега', danger: 'Экстремальная (Вендиго, лешие, мантикоры, белые волки)', population: 'Редкие зимовья пушных охотников', economy: 'Добыча соболя и куницы, сбор редких северных кореньев', inn: 'Зимовье звероловов у ручья', factions: 'Охотники Каэдвена, ведьмаки Школы Волка на Зимовке', npcs: 'Весемир, Эскель, Ламберт (во время выходов с тракта из Каэр Морхена)', monsters: 'Древние северные лешие, бесы, химеры, стаи лютоволков', rumors: ['В глухой Синей Тайге к югу от Каэр Морхена до сих пор стоят руины эльфийских дворцов из белого мрамора — Шаэрраведд.', 'Охотники клянутся, что зимой по верхушкам вековых елей проносятся призрачные всадники Дикой Охоты.'], desc: 'Бескрайняя первобытная тайга Каэдвена между Бан Ардом и крепостью Каэр Морхен — охотничьи угодья древних бестий.' },
    { id: 'blue_mountains_peaks', name: 'Хребет Синих Гор', x: 2630, y: 1080, icon: '🏔️', type: 'nature', regionKey: 'kaedwen_aedirn', region: 'Восточный предел Северных Королевств', ruler: 'Свободные эльфы гор и драконы', climate: 'Неприступные заснеженные пики и ледяные ущелья', danger: 'Экстремальная (Драконы, виверны, ослизги, каменные тролли)', population: 'Кочевья горных эльфов и пещеры драконов', economy: 'Самородное серебро, метеоритная руда в кратерах', inn: 'Карстовые пещеры у перевалов', factions: 'Вольные эльфы Синих Гор, Братство охотников за драконами', npcs: 'Филавандрель (в годы изгнания в горах), Борх Три Галки', monsters: 'Зелёные и красные драконы, ослизги, королевские виверны, гарпии', rumors: ['За заснеженными перевалами Синих Гор лежат неизведанные земли Зеррикании и Хакланда.', 'В высоких гротах над облаками драконы высиживают кладки на грудах древнего эльфийского золота.'], desc: 'Колоссальная горная цепь на восточной границе известного Континента, отделяющая Северные Королевства от Хакланда и Зеррикании.' },
    { id: 'kestrel_mountains', name: 'Пустельговые Горы (Одинокая Скала)', x: 2150, y: 690, icon: '⛰️', type: 'nature', regionKey: 'kaedwen_aedirn', region: 'Граница Каэдвена и Ковира', ruler: 'Горные кланы и тролли', climate: 'Отвесные базальтовые скалы и ветреные плато', danger: 'Высокая (Мантикоры, вилохвосты, грифоны)', population: 'Горняцкие заставы и пастушьи стоянки', economy: 'Добыча меди, свинца и горного хрусталя', inn: 'Застава на Пустельговом перевале (2 орена)', factions: 'Горная стража Каэдвена, контрабандисты Треугольника', npcs: 'Десятник горной заставы, проводник через перевалы', monsters: 'Королевский грифон, скальные тролли, гарпии-келено', rumors: ['Через тайные тропы Пустельговых гор идут караваны с нелегальным оружием из Махакама.', 'На вершине Одинокой Скалы гнездится пара свирепых архигрифонов.'], desc: 'Скалистый горный хребет между Каэдвеном, Реданией и землями Хенгфорса.' },
    { id: 'dragon_mountains', name: 'Драконьи Горы (Край Севера)', x: 1580, y: 95, icon: '🐉', type: 'nature', regionKey: 'kovir', region: 'Крайний Север за Ковиром и Каингорном', ruler: 'Великие драконы Севера', climate: 'Вечные ледники, вулканические термы и метели', danger: 'Смертельная (Золотые, белые и зелёные драконы, ледяные великаны)', population: 'Необитаемые ледяные вершины', economy: 'Драконьи сокровищницы и жилы чистого двимерита и платины', inn: 'Тёплые серные пещеры у подножия хребта', factions: 'Стая драконов Севера', npcs: 'Виллентретенмерт (Борх Три Галки), Саския, драконица Миргатабракке', monsters: 'Древние драконы, ледяные элементали, белые виверны, снежные тролли', rumors: ['Драконьи Горы — последнее пристанище истинных драконов Континента, куда не осмеливаются заходить даже королевские армии.', 'В тёплых вулканических долинах среди вечных льдов растут реликтовые травы времён Сопряжения Сфер.'], desc: 'Самый северный горный хребет Континента на краю вечных льдов, давший приют последним драконам мира.' },
    { id: 'caed_myrkvid', name: 'Заповедный лес Каэд Мирквид', x: 2340, y: 2290, icon: '🌳', type: 'nature', regionKey: 'toussaint', region: 'Юго-западная чаща у границ Туссента и Ривии', ruler: 'Повелительница друидов (Фламинига) и Иерофант Каэд Мирквида', climate: 'Вековые священные дубы, омела и целебные источники', danger: 'Высокая для нарушителей границ (Живые корни, медведи-оборотни, василиски)', population: 'Круг друидов Каэд Мирквида', economy: 'Святилище природы, лечение раненых зверей и путников', inn: 'Поляна друидов у священного дуба', factions: 'Круг Друидов Каэд Мирквида', npcs: 'Фламинига Каэд Мирквида, Геральт, Кагыр, Мильва, Регис, Ангулема', monsters: 'Оживший Пень (Древесный страж друидов), лесные пантеры, в пещерах под лесом — накеры и сколопендроморфы', rumors: ['Друиды Каэд Мирквида повелевают самим лесом: на разбойников Соловья и Шбальца они обрушили живого исполина из дубовых корней.', 'В глубоких карстовых пещерах под дубравой можно пройти тайным путём прямо в долину Туссента.'], desc: 'Священная неприкосновенная дубрава друидов на границе Туссента, куда не смеют ступить ни имперские легионы, ни разбойники.' },
    { id: 'caed_dhu', name: 'Чёрный лес Каэд Дху (Ангрен)', x: 2115, y: 1545, icon: '🌲', type: 'nature', regionKey: 'scoiatael', region: 'Восточный Ангрен (Севернее Яруги)', ruler: 'Круг друидов Чёрного Леса и лесорубы Ангрена', climate: 'Сумрачный первобытный бор из чёрных елей и буков над излучиной Яруги', danger: 'Высокая (Лешие, волколаки, партизанские отряды)', population: 'Друидские стоянки и укреплённые заимки лесорубов', economy: 'Добыча чёрного морёного дуба и янтаря', inn: 'Костровище углежогов в чаще', factions: 'Друиды Каэд Дху, вольные кметы Ангрена', npcs: 'Иерофант Чёрного Леса, вампир Эмиель Регис, Ганза Геральта', monsters: 'Древний леший Чёрного Леса, гигантские сороконожки, гули на военных гатях', rumors: ['В чаще Каэд Дху деревья растут так густо, что солнечный свет не пробивается к мшистой земле даже в полдень.', 'Во время второй войны с Нильфгаардом в этих лесах бесследно исчезли три конных разъезда Империи.'], desc: 'Дремучий Чёрный Лес в глубине Ангрена к северу от изгиба Яруги — край вековых буков, туманных оврагов и друидских святилищ.' },
    { id: 'ysgith_swamps', name: 'Топи Исгита и Дрегсдон (Ангрен)', x: 1965, y: 1565, icon: '🌿', type: 'nature', regionKey: 'temeria', region: 'Южный Ангрен (Севернее Красного Порта на Яруге)', ruler: 'Болотные хищники, старатели и отшельники', climate: 'Бездонные торфяные трясины, камышовые лабиринты и туман', danger: 'Экстремальная (Болотные бабы, гигантские пиявки, Гернихора)', population: 'Редкие хижины на сваях и фактория Дрегсдон', economy: 'Торф, болотная руда, сплав леса к Красному Порту (Red Port)', inn: 'Сторожка лесорубов на сваях в Дрегсдоне (2 орена)', factions: 'Лесорубы Ангрена, партизаны королевы Мэвы', npcs: 'Проводники через трясину Исгита, друиды Ангрена', monsters: 'Кровожадная Гернихора, болотные ведьмы, кладбищенские бабы, утопцы', rumors: ['В топях Исгита между Дрегсдоном и Красным Портом шаг в сторону с бревенчатой гати означает верную смерть в трясине.', 'Во время войны королева Мэва провела своё войско через эти гиблые болота, ударив в тыл нильфгаардцам.'], desc: 'Непроходимый край топей и камышовых болот Исгита в Ангрене к северу от переправы у Красного Порта.' },
    { id: 'fen_carn', name: 'Долина Курганов Фен Карн (Заречье)', x: 1965, y: 1775, icon: '🪦', type: 'nature', regionKey: 'scoiatael', region: 'Заречье / Riverdell (Верхний Содден, к югу от Яруги)', ruler: 'Высший вампир Эмиель Регис Рогеллек Терзиефф-Годфрой', climate: 'Холмистое урочище древних эльфийских могильников и трав', danger: 'Высокая (Могильные призраки, гули, мародёры войны)', population: 'Один отшельник-травник в сторожке у курганов', economy: 'Выращивание мандрагоры и дистилляция знаменитого мандрагорового самогона', inn: 'Каменная хижина Региса у старого дольмена', factions: 'Ганза Геральта (Геральт, Лютик, Мильва, Кагыр, Регис)', npcs: 'Эмиель Регис (цирюльник и травник из Диллингена)', monsters: 'Баргесты и призраки древнего эльфийского некрополя (самого хозяина хижины не возьмёт даже серебро)', rumors: ['В развалинах древнего эльфийского кладбища в Заречье живёт учтивый седой цирюльник-эрудит, который угощает путников крепчайшей настойкой из корня мандрагоры.', 'Беженцы говорят, что этот травник голыми руками вытаскивает раскалённые подковы из кузнечного горна.'], desc: 'Древний эльфийский некрополь «Луг Курганов» в Заречье (Riverdell) к югу от Яруги, где в летней хижине гнал мандрагоровый самогон высший вампир Регис.' },
    { id: 'sodden_primordial_forest', name: 'Холмы и пущи Верхнего Соддена', x: 1815, y: 1720, icon: '🌲', type: 'nature', regionKey: 'nilfgaard', region: 'Верхний Содден (К югу от Яруги)', ruler: 'Имперское наместничество Соддена и кметы Заречья', climate: 'Сосновые и дубовые рощи между Яругой и горами Армуш', danger: 'Высокая (Гули и трупоеды на старых пепелищах войны)', population: 'Хутора лесорубов, деревня Смоллтон и купеческие обозы', economy: 'Дёготь, смола, восстановление сожжённых войной деревень', inn: 'Хутор купца Йурги в Заречье', factions: 'Кметы Верхнего Соддена, пограничные разъезды', npcs: 'Купец Йурга, его жена Золотая Липка, целительница Висенна (мать Геральта)', monsters: 'Подземные трупоеды-накеры у старого моста, гули, мантикоры с гор Армуш', rumors: ['В лесу у старого моста раненый ведьмак спас купца Йургу от полчища подземных тварей под Право Неожиданности.', 'На лесной дороге раненого Геральта исцелила рыжеволосая чародейка-целительница Висенна — его собственная мать.'], desc: 'Обширные леса и холмы Верхнего Соддена к югу от реки Яруги у подножия гор Армуш (Armush Mountains).' },
    { id: 'amell_mountains', name: 'Горная гряда Амелл', x: 2040, y: 2280, icon: '🏔️', type: 'nature', regionKey: 'nilfgaard', region: 'Граница Севера, Туссента и Империи Нильфгаард', ruler: 'Горные кланы, краснолюды и заставы Империи', climate: 'Субальпийские луга, ледяные перевалы (Теодуль, Сансретур, Мальгуэн)', danger: 'Высокая (Снежные виверны, каменные тролли, лавины)', population: 'Горняцкие посёлки и пограничные форты на перевалах', economy: 'Мраморные каменоломни, серебряные копи, охрана перевалов', inn: 'Горный приют «На Перевале Теодуль» (3 флорена)', factions: 'Стража перевалов Амелл, караваны Туссента и Назаира', npcs: 'Горные проводники, контрабандисты перевалов', monsters: 'Ледяные тролли, королевские виверны, гарпии-эринии', rumors: ['С наступлением первых осенних метелей все перевалы через хребет Амелл намертво заносит снегом до самой весны.', 'В отрогах Амелла скрывается знаменитая гора Горгона с обсерваторией чародеев.'], desc: 'Величественный горный хребет, разделяющий бассейн Яруги и цветущий Туссент от южных провинций Империи Нильфгаард.' },
    { id: 'tir_tochair_ridge', name: 'Хребет Тир Тохар', x: 2440, y: 2640, icon: '⛰️', type: 'nature', regionKey: 'nilfgaard', region: 'Восточный рубеж Империи (между Гесо и пустыней Корат)', ruler: 'Кланы гномов и краснолюдов Тир Тохара', climate: 'Сухие краснокаменные пики и глубокие рудные каньоны', danger: 'Экстремальная (Мантикоры, василиски, вилохвосты, горные разбойники)', population: 'Подземные кузни гномов и краснолюдов', economy: 'Лучшие в мире оружейные кузни гномов (клинки «Гвихир» / «Ласточка»), добыча рубинов и железной руды', inn: 'Караван-сарай у подножия перевала (3 флорена)', factions: 'Гильдия гномских оружейников Тир Тохара, Имперские ловчие', npcs: 'Мастера-клиночники гномов, оружейник Эстерхази', monsters: 'Имперские мантикоры, огненные элементали в глубоких жилах, скальные василиски', rumors: ['Именно в подземных кузнях Тир Тохара гномы выковали непревзойдённые мечи Гвихир, один из которых стал легендарной «Ласточкой» (Zireael) Цириллы.', 'За восточными склонами хребта начинается раскалённый ад пустыни Корат.'], desc: 'Древний восточный горный хребет, славящийся подземными кузнями гномов и отделяющий Империю от пустыни Корат.' }
  ];

  /* Обогатитель энциклопедических данных локации (гарантирует заполненность всех полей паспорта) */
  function getWiLocationEncyclopedia(loc){
    if(!loc) return {};
    var defByRegion = {
      redania: {
        population: '8 000 жителей',
        economy: 'Ремесленные цеха, зерновая торговля, таможенные сборы',
        inn: 'Корчма «Под Алым Орлом» (4 кроны за ночлег и жаркое)',
        factions: 'Реданская королевская стража, Церковь Вечного Огня',
        npcs: 'Королевский наместник, агенты Дийкстры',
        monsters: 'Гули, утопцы, полуденницы на полях',
        rumors: ['Охотники за колдуньями разыскивают травницу, скрывающуюся в предместьях.', 'На старом тракте пропал обоз с реданским серебром.']
      },
      temeria: {
        population: '6 500 жителей',
        economy: 'Сельское хозяйство, лесопилки, речная торговля',
        inn: 'Трактир «Серебряная Лилия» (3 орена за ужин и пиво)',
        factions: 'Темерское ополчение, Купеческая гильдия',
        npcs: 'Староста поселения, десятник стражи',
        monsters: 'Утопцы, водные бабы, кладбищенские бабы, гули',
        rumors: ['На доске объявлений у корчмы прибит свежий заказ с печатью войта.', 'В окрестных лесах видели разведчиков Синих Полосок.']
      },
      kaedwen_aedirn: {
        population: '7 000 жителей',
        economy: 'Кузнечное дело, горная руда, пушнина и лес',
        inn: 'Корчма «Горный Перевал» (3 орена, каэдвенский стаут)',
        factions: 'Королевские ратники, Краснолюдские кузнецы',
        npcs: 'Кастелян крепости, мастер-оружейник',
        monsters: 'Гарпии, вилохвосты, накеры, лешие',
        rumors: ['Горняки слышали подземный гул в заброшенной штольне у хребта.', 'По ночам над предгорьем кружит старый чешуйчатый вилохвост.']
      },
      skellige: {
        population: '2 200 островитян',
        economy: 'Мореходство, рыболовство, кузни и морские походы',
        inn: 'Длинный дом у причала (2 кроны, вересковый мёд и лосось)',
        factions: 'Дружина ярла, Друиды и жрицы Фрейи',
        npcs: 'Местный ярл, скальд-летописец, старый кормчий',
        monsters: 'Сирены, эхидны, утопцы, циклопы на скалах',
        rumors: ['У дальних рифов разбился торговый когг с грузом южного вина и серебра.', 'Скальды поют о древнем кургане на вершине утёса, где спит проклятый берсерк.']
      },
      toussaint: {
        population: '4 500 жителей',
        economy: 'Виноградники, винные погреба, рыцарские поместья',
        inn: 'Винный погребок «Золотая Лоза» (6 крон за кубок Эст-Эст)',
        factions: 'Странствующие рыцари Туссента, Гильдия виноделов',
        npcs: 'Княжеский сомелье, странствующий рыцарь-паладин',
        monsters: 'Археспоры, гигантские сколопендроморфы, бруксы',
        rumors: ['В заброшенном гроте за виноградником нашли следы когтей высшего вампира.', 'Местный винодел обещает бочонок марочного вина тому, кто очистит погреб от чудовищ.']
      },
      nilfgaard: {
        population: '12 000 жителей',
        economy: 'Имперские мануфактуры, снабжение легионов, рудники',
        inn: 'Постоялый двор «Имперский Тракт» (5 золотых флоренов)',
        factions: 'Гарнизон Империи Нильфгаард, Торговая корпорация',
        npcs: 'Имперский префект, офицер военной разведки',
        monsters: 'Мантикоры, василиски, виверны, альгули',
        rumors: ['Караван корпорации фиц-Эстерлена ищет опытных мечников для охраны груза через перевал.', 'Тайная служба Ватье де Ридо ведёт допросы в цитадели на холме.']
      },
      scoiatael: {
        population: '3 500 нелюдей (эльфы / краснолюды / дриады)',
        economy: 'Древнее ремесло, металлургия или лесные дары',
        inn: 'Привал у лесного костра / таверна слободы',
        factions: 'Свободные нелюди, Скоя\'таэли',
        npcs: 'Старейшина общины, командир дозора',
        monsters: 'Лешие, эндриаги, главоглазы, каменные тролли',
        rumors: ['В чаще найдены нетронутые эльфийские руины времён Первой Высадки.', 'Следопыты заметили вооружённый разъезд на границе заповедных земель.']
      },
      kovir: {
        population: '10 000 жителей',
        economy: 'Золотые и серебряные прииски, морская торговля, стеклодувы',
        inn: 'Таверна «Северный Фьорд» (6 бизантов)',
        factions: 'Гвардия Ковира / Лиги Хенгфорса, Гильдия рудокопов',
        npcs: 'Королевский казначей, капитан наёмной роты',
        monsters: 'Горные тролли, виверны, элементали льда',
        rumors: ['В новой жиле Пастушьих гор нашли редкий самородок двимерита.', 'Книга заклинаний пропала из архива местного магистра магии.']
      }
    };
    var fallback = defByRegion[loc.regionKey] || defByRegion.temeria;
    var popVal = loc.population || loc.pop || fallback.population;
    var rawRumors = (Array.isArray(loc.rumors) && loc.rumors.length) ? loc.rumors : fallback.rumors;
    var rumorStr = Array.isArray(rawRumors) ? rawRumors.join(' • ') : String(rawRumors || '');
    return {
      pop: popVal,
      population: popVal,
      economy: loc.economy || fallback.economy,
      inn: loc.inn || fallback.inn,
      factions: loc.factions || fallback.factions,
      npcs: loc.npcs || fallback.npcs,
      monsters: loc.monsters || fallback.monsters,
      rumors: rumorStr,
      rumorsList: Array.isArray(rawRumors) ? rawRumors : [rumorStr]
    };
  }

  /* Поиск ближайшего города или поселения к координатам (x, y) */
  function findNearestCity(x, y, maxDist){
    maxDist = maxDist != null ? maxDist : 75;
    var nearest = null;
    var minDist = maxDist;
    if(WI_MAP_LOCATIONS && WI_MAP_LOCATIONS.length){
      for(var i = 0; i < WI_MAP_LOCATIONS.length; i++){
        var loc = WI_MAP_LOCATIONS[i];
        var d = Math.hypot(x - loc.x, y - loc.y);
        if(d < minDist){
          minDist = d;
          nearest = loc;
        }
      }
    }
    return nearest;
  }

  /* Автоматическое определение каноничного названия любого леса, хребта, болота, долины или моря по клику на карте */
  function resolveWiWildernessLocation(x, y){
    var ter = (typeof getTerrainAt === 'function') ? getTerrainAt(x, y) : { id: 'forest', name: 'Лесная чаща', icon: '🌲' };
    var nearLoc = findNearestCity(x, y, 9999) || WI_MAP_LOCATIONS[0];
    var shortNear = nearLoc ? nearLoc.name.split(' (')[0] : 'Перепутье';
    var regKey = nearLoc ? nearLoc.regionKey : 'temeria';
    var regName = nearLoc ? nearLoc.region : 'Континент';

    // Каноничные лесные массивы, пущи, хребты и моря Континента по координатам
    var wildZones = [
      { x1: 1120, y1: 1410, x2: 1480, y2: 1690, name: 'Заповедный лес Брокилон (Кущи Дриад)', icon: '🏹', regionKey: 'scoiatael', region: 'Лес Брокилон', monsters: 'Дриады-лучницы, древние лешие, эндриаги, сколопендроморфы', desc: 'Первобытная чаща Брокилона, куда людям нет хода под страхом верной стрелы дриады.' },
      { x1: 1220, y1: 1150, x2: 1520, y2: 1380, name: 'Леса и топи Ничейной Земли (Велен)', icon: '🌲', regionKey: 'temeria', region: 'Велен (Ничейная Земля)', monsters: 'Лешие, туманники, водные и кладбищенские бабы, волколаки, бесы', desc: 'Мрачные леса и болотистые чащобы Велена между Понтаром и горами Махакама.' },
      { x1: 1250, y1: 820, x2: 1750, y2: 1080, name: 'Реданская Пуща и рощи Оксенфурта', icon: '🌳', regionKey: 'redania', region: 'Королевство Редания', monsters: 'Старые лешие, королевские виверны, гули, арахноморфы', desc: 'Густые дубравы и сосновые боры Редании вдоль северного берега реки Понтар.' },
      { x1: 1500, y1: 1080, x2: 2020, y2: 1350, name: 'Темерский Бор и леса долины Понтара', icon: '🌲', regionKey: 'temeria', region: 'Королевство Темерия', monsters: 'Королевы эндриаг, главоглазы, накеры, лесные тролли', desc: 'Обширные леса Темерии и пойменные чащи вдоль реки Понтар.' },
      { x1: 2050, y1: 150, x2: 2780, y2: 880, name: 'Северная Тайга Каэдвена и отроги Каэр Морхена', icon: '🌲', regionKey: 'kaedwen_aedirn', region: 'Королевство Каэдвен', monsters: 'Северные лешие, вендиго, мантикоры, химеры, лютоволки', desc: 'Суровая вековая хвойная тайга и предгорья Северного Каэдвена.' },
      { x1: 2450, y1: 750, x2: 2860, y2: 1650, name: 'Ущелья и леса Синих Гор (Дол Блатанна)', icon: '🏔️', regionKey: 'scoiatael', region: 'Синие Горы и Долина Цветов', monsters: 'Сильваны, дракониды, ослизги, гарпии, горные тролли', desc: 'Неприступные склоны Синих Гор и заповедные рощи эльфов Дол Блатанна.' },
      { x1: 1750, y1: 1320, x2: 2080, y2: 1560, name: 'Горный массив Махакам и перевалы', icon: '⛰️', regionKey: 'scoiatael', region: 'Подгорный Махакам', monsters: 'Каменные и ледяные тролли, элементали земли, гарпии', desc: 'Богатые рудой скалистые вершины и хвойные склоны горного Махакама.' },
      { x1: 1805, y1: 1365, x2: 2238, y2: 1655, name: 'Первобытные леса Ангрена, Каэд Дху и топи Исгита', icon: '🌲', regionKey: 'scoiatael', region: 'Ангрен (К северу от Яруги)', monsters: 'Древние лешие Каэд Дху, Гернихора, болотные ведьмы, сороконожки, гули', desc: 'Сумрачные чащобы буков и сосен Ангрена к северу от изгиба Яруги, изрезанные протоками и болотами Исгита.' },
      { x1: 2215, y1: 1235, x2: 2700, y2: 1475, name: 'Поля и предгорья Лирии и Ривии (Севернее Яруги)', icon: '🛡️', regionKey: 'kaedwen_aedirn', region: 'Королевство Лирии и Ривии', monsters: 'Водяные Лок Эскалотт, виверны на кряжах, археспоры в заброшенных садах, гули', desc: 'Плодородные холмы, сады и озёрные берега объединённого королевства Лирии и Ривии на северном берегу Яруги.' },
      { x1: 1360, y1: 1480, x2: 1880, y2: 1665, name: 'Леса Бругге и Нижнего Соддена (К северу от Яруги)', icon: '🌳', regionKey: 'temeria', region: 'Бругге и Нижний Содден (Темерия)', monsters: 'Гули, трупоеды на полях сражений, эхинопсы, волколаки', desc: 'Приречные дубравы и холмы Бругге и Нижнего Соддена на северном берегу Яруги под протекторатом Темерии.' },
      { x1: 1580, y1: 1650, x2: 2248, y2: 2030, name: 'Холмы Верхнего Соддена, Заречье и Гнилой Лес (К югу от Яруги)', icon: '🌲', regionKey: 'nilfgaard', region: 'Верхний Содден и Заречье (Riverdell)', monsters: 'Подземные накеры, баргесты курганов, болотные тролли, мантикоры гор Армуш', desc: 'Лесистые угодья Верхнего Соддена, Заречья (Riverdell) и Стоков (Slopes) на южном берегу реки Яруги.' },
      { x1: 2235, y1: 1460, x2: 2705, y2: 1850, name: 'Южная Долина Ангры и Врата Сольвейги (К югу от Яруги)', icon: '🌉', regionKey: 'nilfgaard', region: 'Дол Ангра (Южный берег Яруги)', monsters: 'Королевские виверны, каменные тролли, мародёры и трупоеды у переправ', desc: 'Широкая речная долина Дол Ангра к югу от верхнего течения Яруги между крепостью Глевицинген и отрогами Тир Тохар.' },
      { x1: 2220, y1: 2080, x2: 2620, y2: 2420, name: 'Кипарисовые рощи Туссента и Каэд Мирквид', icon: '🍇', regionKey: 'toussaint', region: 'Княжество Туссент', monsters: 'Археспоры, гигантские сколопендроморфы, бруксы, альпы, шарлеи', desc: 'Солнечные склоны долины Сансретур, оливковые рощи и заповедная дубрава Каэд Мирквид.' },
      { x1: 420, y1: 1350, x2: 890, y2: 1820, name: 'Вересковые пустоши и фьорды Скеллиге', icon: '⛵', regionKey: 'skellige', region: 'Архипелаг Скеллиге', monsters: 'Сирены, эхидны, древние лешие островов, ледяные великаны', desc: 'Продуваемые морскими штормами скалистые фьорды и сосновые боры островов Скеллиге.' },
      { x1: 850, y1: 50, x2: 1950, y2: 680, name: 'Кедровые леса Ковира, Повисса и Хенгфорса', icon: '🌲', regionKey: 'kovir', region: 'Крайний Север (Ковир и Хенгфорс)', monsters: 'Мантикоры, виверны, снежные тролли, дракониды', desc: 'Холодные северные боры и скалистые отроги залива Пракседа и Драконьих Гор.' },
      { x1: 1200, y1: 2350, x2: 2380, y2: 3980, name: 'Кипарисовые леса и нагорья Империи Нильфгаард', icon: '☀️', regionKey: 'nilfgaard', region: 'Империя Нильфгаард', monsters: 'Имперские мантикоры, василиски, виверны, сколопендроморфы', desc: 'Южные леса, холмистые провинции и речные долины бассейна Альбы и Вельды.' }
    ];

    var matchedZone = null;
    for(var i = 0; i < wildZones.length; i++){
      var z = wildZones[i];
      if(x >= z.x1 && x <= z.x2 && y >= z.y1 && y <= z.y2){
        matchedZone = z;
        break;
      }
    }

    var featureTitle = '';
    var featureIcon = ter.icon || '🌲';
    if(ter.id === 'sea'){
      featureIcon = '🌊';
      featureTitle = (x < 950 && y > 1250 && y < 1950) ? 'Штормовые воды архипелага Скеллиге' : (y < 750 ? 'Воды залива Пракседа (Северное море)' : 'Прибрежные воды Великого Моря');
    } else if(ter.id === 'mountain'){
      featureIcon = '🏔️';
      featureTitle = matchedZone ? ('Горные отроги: ' + matchedZone.name.split(' (')[0]) : ('Скалистый хребет у «' + shortNear + '»');
    } else if(ter.id === 'swamp'){
      featureIcon = '🌿';
      featureTitle = matchedZone ? ('Глухие топи: ' + matchedZone.name.split(' (')[0]) : ('Болотистая трясина у «' + shortNear + '»');
    } else if(ter.id === 'forest'){
      featureIcon = '🌲';
      featureTitle = matchedZone ? (matchedZone.name.split(' (')[0] + ' (урочище у «' + shortNear + '»)') : ('Лесная чаща у поселения «' + shortNear + '»');
    } else {
      featureIcon = matchedZone ? matchedZone.icon : (ter.icon || '🏕️');
      featureTitle = matchedZone ? (matchedZone.name.split(' (')[0] + ' — урочище у «' + shortNear + '»') : ('Окрестности и тракт у «' + shortNear + '»');
    }

    return {
      id: 'wild_spot',
      isWildSpot: true,
      name: featureTitle,
      x: x,
      y: y,
      icon: featureIcon,
      type: 'nature',
      regionKey: matchedZone ? matchedZone.regionKey : regKey,
      region: matchedZone ? matchedZone.region : regName,
      ruler: 'Дикие земли (ближайший оплот: ' + shortNear + ')',
      climate: ter.name + ' • Пересечённая местность',
      danger: (ter.id === 'swamp' || ter.id === 'mountain') ? 'Экстремальная (Дикие бестии и бездорожье)' : 'Высокая (Охотничьи угодья чудовищ)',
      population: 'Стоянки охотников, лесорубов и путников (близ «' + shortNear + '»)',
      economy: 'Охотничий промысел, сбор редких алхимических трав и ингредиентов',
      inn: 'Лесной привал у костра или постоялый двор в «' + shortNear + '»',
      factions: 'Местные звероловы, егеря, вольные ведьмаки на Шляхе',
      npcs: 'Старый лесничий, травница, староста из «' + shortNear + '»',
      monsters: matchedZone ? matchedZone.monsters : 'Лешие, волколаки, виверны, гули, эндриаги',
      rumors: [
        'Егеря из «' + shortNear + '» прибили на пограничном столбе свежий заказ на бестию, рыщущую в этой чаще.',
        'Путники находили в этом урочище следы старого ведьмачьего костра и пустые склянки из-под эликсиров.'
      ],
      desc: (matchedZone ? matchedZone.desc : 'Живописное и полное опасностей природное урочище на просторах Континента.') + ' Расположено неподалёку от локации «' + shortNear + '» [' + x + ', ' + y + '].'
    };
  }

  /* Получение текущей активной локации (включая выбранную произвольную точку леса/местности) */
  function getWiActiveLocation(m){
    m = m || WI.map;
    if(m.customWildLoc && m.selectedLocId === m.customWildLoc.id){
      return m.customWildLoc;
    }
    return WI_MAP_LOCATIONS.find(function(l){ return l.id === m.selectedLocId; }) || WI_MAP_LOCATIONS[0];
  }


  var WI_MAP_REGIONS = [
    { id: 'temeria', name: 'Темерия и Велен', capital: 'Вызима', ruler: 'Король Фольтест / Вернон Роше', color: '#3b82f6', desc: 'Одно из могущественнейших королевств Севера под знаменем серебряных лилий. Развитая торговля, река Понтар и прославленный спецотряд Синих Полосок.' },
    { id: 'redania', name: 'Редания и Новиград', capital: 'Третогор', ruler: 'Король Радовид V / Дийкстра', color: '#ef4444', desc: 'Богатейшая хлебная держава со знаком белого орла. Включает торговый порт Новиград и университетский Оксенфурт. Сильнейшая тайная служба.' },
    { id: 'kaedwen', name: 'Каэдвен', capital: 'Ард Каррайг', ruler: 'Король Хенсельт', color: '#eab308', desc: 'Крупнейшее по территории северное лесное королевство. Суровые зимы, Синие Горы, долина Гвенллех и развалины Каэр Морхена.' },
    { id: 'aedirn', name: 'Аэдирн и Лирия', capital: 'Венгерберг', ruler: 'Король Демавенд III / Королева Мэва', color: '#f97316', desc: 'Индустриальное и сельскохозяйственное сердце Севера. Плодородная долина Дол Блатанна и кузницы на границе с Махакамом.' },
    { id: 'skellige', name: 'Острова Скеллиге', capital: 'Каэр Трольде', ruler: 'Бран Туирсеах / Крах ан Крайт', color: '#06b6d4', desc: 'Суровый океанский архипелаг бесстрашных мореходов, ярлов, друидов и кланов, поклоняющихся богине Фрейе и Хемдаллю.' },
    { id: 'nilfgaard', name: 'Империя Нильфгаард', capital: 'Город Золотых Башен', ruler: 'Император Эмгыр вар Эмрейс', color: '#facc15', desc: 'Южная империя Белого Пламени с несокрушимыми легионами, железным законом, вассальными княжествами и символом Великого Золотого Солнца.' },
    { id: 'toussaint', name: 'Княжество Туссент', capital: 'Боклер', ruler: 'Княгиня Анна-Генриетта', color: '#a855f7', desc: 'Вассальное сказочное княжество под сенью горы Горгона. Земля странствующих рыцарей, беспечных празднеств, турниров и благородного вина.' },
    { id: 'mahakam', name: 'Махакам', capital: 'Гора Карбон', ruler: 'Старейшина Брувер Гоог', color: '#94a3b8', desc: 'Горная твердыня краснолюдов и гномов. Центр металлургии высочайшего класса, где куются лучшие мечи Континента.' },
    { id: 'brokilon', name: 'Лес Брокилон', capital: 'Дуэн Канэлл', ruler: 'Владычица Эитнэ', color: '#22c55e', desc: 'Древний заповедный первобытный лес дриад. Смертоносные лучницы убивают любого чужака, ступившего за пограничные ленты.' },
    { id: 'kovir', name: 'Ковир и Повисс', capital: 'Понт Ваннис / Лан Эксетер', ruler: 'Король Эстерид Тиссенид', color: '#38bdf8', desc: 'Самое богатое королевство крайнего Севера. 80% мировой добычи золота, нейтралитет в войнах и непревзойдённый наёмный флот.' }
  ];

  /* ============================================================
     ВОЕННО-ТАКТИЧЕСКИЙ РЕЖИМ КАРТЫ КОНТИНЕНТА (⚔️ ТАКТИКА)
     ============================================================ */

  var WI_TACTICAL_FACTIONS = {
    independent:     { id: 'independent',     name: 'Суверенитет (Родной цвет страны)', short: '🕊️ Суверенитет',  icon: '🕊️', color: '#94a3b8' },
    nilfgaard:       { id: 'nilfgaard',       name: 'Империя Нильфгаард',               short: '☀️ Нильфгаард',   icon: '☀️', color: '#facc15' },
    redania:         { id: 'redania',         name: 'Королевство Редания',              short: '🦅 Редания',      icon: '🦅', color: '#ef4444' },
    temeria:         { id: 'temeria',         name: 'Королевство Темерия',              short: '⚜️ Темерия',      icon: '⚜️', color: '#3b82f6' },
    kaedwen:         { id: 'kaedwen',         name: 'Королевство Каэдвен',              short: '🦄 Каэдвен',      icon: '🦄', color: '#eab308' },
    aedirn:          { id: 'aedirn',          name: 'Королевство Аэдирн',               short: '🔥 Аэдирн',       icon: '🔥', color: '#f97316' },
    lyria:           { id: 'lyria',           name: 'Лирия и Ривия',                    short: '🛡️ Лирия',        icon: '🛡️', color: '#f59e0b' },
    cintra:          { id: 'cintra',          name: 'Королевство Цинтра',               short: '🦁 Цинтра',       icon: '🦁', color: '#10b981' },
    kovir:           { id: 'kovir',           name: 'Ковир и Повисс',                   short: '💎 Ковир',        icon: '💎', color: '#38bdf8' },
    skellige:        { id: 'skellige',        name: 'Кланы Скеллиге',                   short: '⛵ Скеллиге',     icon: '⛵', color: '#06b6d4' },
    scoiatael:       { id: 'scoiatael',       name: 'Брокилон и Скоя\'таэли',           short: '🏹 Скоя\'таэли',  icon: '🏹', color: '#16a34a' },
    wild_hunt:       { id: 'wild_hunt',       name: 'Дикая Охота (Aen Elle)',           short: '💀 Дикая Охота',  icon: '💀', color: '#a855f7' },
    kovir_witchers:  { id: 'kovir_witchers',  name: 'Ведьмачьи Школы (Братство)',       short: '🐺 Ведьмаки',     icon: '🐺', color: '#f59e0b' },
    mages:           { id: 'mages',           name: 'Капитул и Ложа Чародеек',          short: '🔮 Чародеи',      icon: '🔮', color: '#c084fc' },
    monsters:        { id: 'monsters',        name: 'Бестии и Чудовища Континента',     short: '🐉 Чудовища',     icon: '🐉', color: '#dc2626' }
  };

  var WI_TACTICAL_UNIT_TYPES = {
    army:         { id: 'army',         cat: 'Войска и Флот',           icon: '🛡️', label: 'Пехота / Бригада',          basePow: 5, defaultStr: '5 000 мечников' },
    cavalry:      { id: 'cavalry',      cat: 'Войска и Флот',           icon: '🐎', label: 'Тяжёлая кавалерия',         basePow: 7, defaultStr: '2 500 латников' },
    archers:      { id: 'archers',      cat: 'Войска и Флот',           icon: '🏹', label: 'Стрелки / Арбалетчики',     basePow: 5, defaultStr: '2 000 стрелков' },
    pikemen:      { id: 'pikemen',      cat: 'Войска и Флот',           icon: '🔱', label: 'Копейщики / Алебардщики',   basePow: 6, defaultStr: '4 000 пикинёров' },
    fleet:        { id: 'fleet',        cat: 'Войска и Флот',           icon: '⛵', label: 'Военный флот / Драккары',   basePow: 7, defaultStr: '25 кораблей' },
    siege_engine: { id: 'siege_engine', cat: 'Войска и Флот',           icon: '🎯', label: 'Осадные орудия / Требушеты', basePow: 6, defaultStr: '18 требушетов' },
    witcher:      { id: 'witcher',      cat: 'Герои и Спецотряды',      icon: '🐺', label: 'Ведьмак / Ганза героев',    basePow: 8, defaultStr: 'Ганза (6 героев)' },
    mages:        { id: 'mages',        cat: 'Герои и Спецотряды',      icon: '🔮', label: 'Чародеи / Капитул',         basePow: 9, defaultStr: 'Ложа / 14 Магов' },
    guerrilla:    { id: 'guerrilla',    cat: 'Герои и Спецотряды',      icon: '🌲', label: 'Скоя\'таэли / Партизаны',   basePow: 6, defaultStr: 'Командо (800 бойцов)' },
    spies:        { id: 'spies',        cat: 'Герои и Спецотряды',      icon: '🕵️', label: 'Разведка / Шпионская сеть', basePow: 4, defaultStr: 'Агентурная сеть' },
    monster:      { id: 'monster',      cat: 'Герои и Спецотряды',      icon: '🐉', label: 'Чудовище / Стая бестий',    basePow: 8, defaultStr: 'Древний Архигрифон' },
    fort:         { id: 'fort',         cat: 'Укрепления и События',    icon: '🏰', label: 'Гарнизон / Цитадель',       basePow: 8, defaultStr: 'Гарнизон 6 000' },
    camp:         { id: 'camp',         cat: 'Укрепления и События',    icon: '⛺', label: 'Военный лагерь / Обоз',     basePow: 4, defaultStr: 'Полевой лагерь' },
    siege:        { id: 'siege',        cat: 'Укрепления и События',    icon: '💥', label: 'Осада крепости',            basePow: 7, defaultStr: 'Штурм стен' },
    battle:       { id: 'battle',       cat: 'Укрепления и События',    icon: '⚔️', label: 'Генеральное сражение',      basePow: 8, defaultStr: 'Поле битвы' },
    raze:         { id: 'raze',         cat: 'Укрепления и События',    icon: '🔥', label: 'Пожарище / Разорение',      basePow: 5, defaultStr: 'Выжженная земля' }
  };

  var WI_TACTICAL_UNIT_STATUSES = {
    ready:   { id: 'ready',   icon: '🛡️', label: 'В строю / Оборона', color: '#10b981' },
    march:   { id: 'march',   icon: '🏃', label: 'На марше',          color: '#38bdf8' },
    battle:  { id: 'battle',  icon: '⚔️', label: 'В бою!',            color: '#ef4444' },
    siege:   { id: 'siege',   icon: '💥', label: 'Осада / Штурм',     color: '#f97316' },
    camp:    { id: 'camp',    icon: '⛺', label: 'На привале',        color: '#a3e635' },
    damaged: { id: 'damaged', icon: '🩸', label: 'Потрёпан / Отход',  color: '#f43f5e' }
  };

  var WI_TACTICAL_TERRITORIES_BASE = [
    {
      id: "kovir",
      locId: "pont_vannis",
      name: "Ковир и Повисс",
      icon: "💎",
      baseColor: "#38bdf8",
      defaultFaction: "kovir",
      labelX: 820, labelY: 240,
      d: "M 336 16 L 335 25 L 333 43 L 319 67 L 293 97 L 277 127 L 271 157 L 255 178 L 229 190 L 215 209 L 213 235 L 222 245 L 242 239 L 256 241 L 264 251 L 266 269 L 262 295 L 255 317 L 245 335 L 240 350 L 240 362 L 246 373 L 258 383 L 264 393 L 264 403 L 254 427 L 234 465 L 222 497 L 218 523 L 222 538 L 234 542 L 249 534 L 267 514 L 280 504 L 288 504 L 294 510 L 298 522 L 296 540 L 288 564 L 285 580 L 287 588 L 303 611 L 333 649 L 356 669 L 372 671 L 372 643 L 356 585 L 353 554 L 363 550 L 373 526 L 383 482 L 392 456 L 400 448 L 412 445 L 428 447 L 446 445 L 466 439 L 480 439 L 488 445 L 494 445 L 498 439 L 504 436 L 512 436 L 522 440 L 534 448 L 545 447 L 555 437 L 565 419 L 575 393 L 605 370 L 655 350 L 688 340 L 704 340 L 715 335 L 721 325 L 728 320 L 736 320 L 748 328 L 764 344 L 784 350 L 808 346 L 825 351 L 835 365 L 839 394 L 837 438 L 824 475 L 800 505 L 795 535 L 809 565 L 828 575 L 852 565 L 871 548 L 885 524 L 901 508 L 919 500 L 939 496 L 961 496 L 981 480 L 999 448 L 1012 428 L 1020 420 L 1028 416 L 1036 416 L 1047 407 L 1061 389 L 1081 378 L 1107 374 L 1120 372 L 1132 356 L 1156 326 L 1170 296 L 1173 269 L 1178 238 L 1182 202 L 1180 168 L 1170 132 L 1165 115 L 1119 112 L 1026 108 L 930 102 L 830 98 L 722 90 L 608 80 L 496 60 L 390 31 L 336 16 Z"
    },
    {
      id: "hengfors",
      locId: "blaviken",
      name: "Лига Хенгфорса",
      icon: "🦅",
      baseColor: "#818cf8",
      defaultFaction: "hengfors",
      labelX: 1540, labelY: 340,
      d: "M 1165 115 L 1219 114 L 1326 111 L 1440 106 L 1560 99 L 1681 99 L 1804 106 L 1865 110 L 1872 135 L 1888 185 L 1889 236 L 1876 289 L 1864 341 L 1851 394 L 1849 446 L 1856 499 L 1859 550 L 1856 600 L 1855 625 L 1832 624 L 1788 621 L 1745 616 L 1705 609 L 1665 592 L 1625 568 L 1588 540 L 1552 510 L 1512 502 L 1468 518 L 1422 524 L 1378 521 L 1338 526 L 1305 538 L 1288 544 L 1283 526 L 1273 490 L 1264 466 L 1256 454 L 1246 442 L 1234 430 L 1220 423 L 1204 421 L 1189 413 L 1175 399 L 1156 387 L 1132 377 L 1120 372 L 1132 356 L 1156 326 L 1170 296 L 1173 269 L 1178 238 L 1182 202 L 1180 168 L 1170 132 L 1165 115 Z"
    },
    {
      id: "kaedwen",
      locId: "ard_carraigh",
      name: "Каэдвен",
      icon: "🦄",
      baseColor: "#eab308",
      defaultFaction: "kaedwen",
      labelX: 2260, labelY: 440,
      d: "M 1865 110 L 1936 111 L 2079 114 L 2225 112 L 2375 108 L 2510 102 L 2630 98 L 2690 95 L 2698 141 L 2712 234 L 2724 340 L 2731 460 L 2729 584 L 2716 711 L 2710 775 L 2679 778 L 2616 782 L 2555 790 L 2495 800 L 2438 809 L 2382 816 L 2355 820 L 2328 815 L 2272 805 L 2218 809 L 2162 826 L 2105 830 L 2045 820 L 1990 811 L 1940 804 L 1915 800 L 1908 789 L 1892 766 L 1880 742 L 1870 718 L 1862 685 L 1858 645 L 1855 625 L 1856 600 L 1859 550 L 1856 499 L 1849 446 L 1851 394 L 1864 341 L 1876 289 L 1889 236 L 1888 185 L 1872 135 L 1865 110 Z"
    },
    {
      id: "redania",
      locId: "tretogor",
      name: "Редания",
      icon: "🦅",
      baseColor: "#ef4444",
      defaultFaction: "redania",
      labelX: 1440, labelY: 760,
      d: "M 1288 544 L 1290 550 L 1294 562 L 1290 575 L 1278 589 L 1259 598 L 1233 602 L 1215 611 L 1205 625 L 1184 638 L 1152 650 L 1137 670 L 1139 698 L 1127 721 L 1101 739 L 1085 759 L 1079 781 L 1072 796 L 1064 804 L 1074 822 L 1102 850 L 1116 870 L 1116 882 L 1122 902 L 1134 930 L 1137 966 L 1131 1010 L 1132 1037 L 1140 1047 L 1144 1052 L 1162 1050 L 1197 1044 L 1232 1040 L 1268 1037 L 1310 1035 L 1360 1035 L 1408 1028 L 1452 1012 L 1495 985 L 1535 945 L 1580 922 L 1630 918 L 1672 898 L 1708 862 L 1748 840 L 1792 830 L 1840 819 L 1890 806 L 1915 800 L 1908 789 L 1892 766 L 1880 742 L 1870 718 L 1862 685 L 1858 645 L 1855 625 L 1832 624 L 1788 621 L 1745 616 L 1705 609 L 1665 592 L 1625 568 L 1588 540 L 1552 510 L 1512 502 L 1468 518 L 1422 524 L 1378 521 L 1338 526 L 1305 538 L 1288 544 Z"
    },
    {
      id: "temeria",
      locId: "vizima",
      name: "Темерия",
      icon: "⚜️",
      baseColor: "#3b82f6",
      defaultFaction: "temeria",
      labelX: 1560, labelY: 1220,
      d: "M 1144 1052 L 1161 1054 L 1195 1058 L 1209 1069 L 1203 1087 L 1185 1098 L 1155 1102 L 1137 1107 L 1131 1113 L 1129 1124 L 1131 1140 L 1139 1154 L 1153 1166 L 1164 1172 L 1172 1172 L 1180 1178 L 1188 1190 L 1192 1200 L 1192 1208 L 1187 1215 L 1177 1221 L 1172 1224 L 1174 1232 L 1180 1247 L 1184 1269 L 1186 1296 L 1195 1321 L 1208 1344 L 1215 1355 L 1255 1375 L 1272 1376 L 1308 1379 L 1340 1389 L 1370 1406 L 1400 1425 L 1430 1445 L 1458 1465 L 1482 1485 L 1495 1495 L 1508 1492 L 1532 1488 L 1558 1482 L 1582 1478 L 1605 1478 L 1625 1482 L 1635 1485 L 1648 1505 L 1658 1540 L 1662 1580 L 1662 1620 L 1660 1661 L 1680 1666 L 1700 1670 L 1720 1650 L 1740 1650 L 1760 1652 L 1780 1654 L 1800 1649 L 1820 1647 L 1840 1649 L 1860 1652 L 1880 1655 L 1870 1615 L 1848 1580 L 1815 1565 L 1805 1540 L 1825 1510 L 1855 1485 L 1875 1445 L 1895 1410 L 1925 1365 L 1945 1365 L 1942 1345 L 1938 1305 L 1932 1258 L 1928 1202 L 1930 1142 L 1940 1078 L 1955 1018 L 1975 962 L 1985 935 L 1978 918 L 1962 882 L 1945 849 L 1925 816 L 1915 800 L 1890 806 L 1840 819 L 1792 830 L 1748 840 L 1708 862 L 1672 898 L 1630 918 L 1580 922 L 1535 945 L 1495 985 L 1452 1012 L 1408 1028 L 1360 1035 L 1310 1035 L 1268 1037 L 1232 1040 L 1197 1044 L 1162 1050 L 1144 1052 Z"
    },
    {
      id: "cidaris",
      locId: "cidaris",
      name: "Сидарис",
      icon: "⚓",
      baseColor: "#0ea5e9",
      defaultFaction: "cidaris",
      labelX: 1045, labelY: 1295,
      d: "M 1172 1224 L 1172 1230 L 1172 1242 L 1166 1249 L 1154 1251 L 1140 1248 L 1124 1240 L 1104 1233 L 1080 1227 L 1061 1226 L 1047 1230 L 1038 1229 L 1034 1223 L 1026 1219 L 1014 1217 L 997 1225 L 975 1243 L 963 1266 L 961 1294 L 948 1313 L 924 1323 L 891 1330 L 849 1334 L 825 1339 L 819 1345 L 817 1354 L 819 1366 L 823 1374 L 829 1378 L 843 1381 L 865 1383 L 881 1381 L 891 1375 L 903 1375 L 917 1381 L 943 1383 L 981 1381 L 1006 1385 L 1018 1395 L 1037 1401 L 1063 1403 L 1076 1404 L 1088 1399 L 1113 1390 L 1138 1380 L 1162 1370 L 1185 1362 L 1205 1358 L 1215 1355 L 1208 1344 L 1195 1321 L 1186 1296 L 1184 1269 L 1180 1247 L 1174 1232 L 1172 1224 Z"
    },
    {
      id: "kerack",
      locId: "kerack",
      name: "Керак",
      icon: "⛵",
      baseColor: "#14b8a6",
      defaultFaction: "kerack",
      labelX: 1125, labelY: 1445,
      d: "M 1076 1404 L 1085 1407 L 1103 1413 L 1113 1421 L 1115 1431 L 1107 1439 L 1089 1445 L 1074 1455 L 1062 1469 L 1058 1483 L 1062 1497 L 1064 1504 L 1077 1504 L 1102 1502 L 1130 1501 L 1160 1499 L 1188 1497 L 1212 1496 L 1225 1495 L 1224 1485 L 1221 1465 L 1222 1445 L 1228 1425 L 1236 1405 L 1249 1385 L 1255 1375 L 1215 1355 L 1205 1358 L 1185 1362 L 1162 1370 L 1138 1380 L 1113 1390 L 1088 1399 L 1076 1404 Z"
    },
    {
      id: "verden",
      locId: "verden_city",
      name: "Вердэн",
      icon: "🌲",
      baseColor: "#84cc16",
      defaultFaction: "verden",
      labelX: 1185, labelY: 1615,
      d: "M 1064 1504 L 1066 1512 L 1070 1528 L 1080 1543 L 1096 1557 L 1101 1582 L 1095 1618 L 1108 1648 L 1140 1672 L 1158 1694 L 1162 1714 L 1171 1727 L 1185 1742 L 1205 1768 L 1220 1793 L 1240 1787 L 1260 1778 L 1280 1769 L 1300 1769 L 1320 1766 L 1340 1761 L 1355 1752 L 1368 1705 L 1382 1658 L 1395 1625 L 1405 1605 L 1385 1608 L 1345 1612 L 1308 1610 L 1272 1600 L 1248 1582 L 1235 1558 L 1227 1532 L 1226 1508 L 1225 1495 L 1212 1496 L 1188 1497 L 1160 1499 L 1130 1501 L 1102 1502 L 1077 1504 L 1064 1504 Z"
    },
    {
      id: "brokilon",
      locId: "brokilon",
      name: "Брокилон",
      icon: "🏹",
      baseColor: "#16a34a",
      defaultFaction: "brokilon",
      labelX: 1355, labelY: 1500,
      d: "M 1255 1375 L 1249 1385 L 1236 1405 L 1228 1425 L 1222 1445 L 1221 1465 L 1224 1485 L 1225 1495 L 1226 1508 L 1227 1532 L 1235 1558 L 1248 1582 L 1272 1600 L 1308 1610 L 1345 1612 L 1385 1608 L 1405 1605 L 1418 1600 L 1442 1590 L 1460 1575 L 1470 1555 L 1480 1532 L 1490 1508 L 1495 1495 L 1482 1485 L 1458 1465 L 1430 1445 L 1400 1425 L 1370 1406 L 1340 1389 L 1308 1379 L 1272 1376 L 1255 1375 Z"
    },
    {
      id: "brugge",
      locId: "brugge",
      name: "Бругге",
      icon: "🏰",
      baseColor: "#60a5fa",
      defaultFaction: "brugge",
      labelX: 1535, labelY: 1600,
      d: "M 1405 1605 L 1395 1625 L 1382 1658 L 1368 1705 L 1355 1752 L 1380 1741 L 1400 1737 L 1420 1738 L 1440 1744 L 1460 1749 L 1480 1747 L 1500 1751 L 1520 1749 L 1540 1744 L 1560 1742 L 1580 1734 L 1600 1710 L 1620 1683 L 1640 1662 L 1660 1661 L 1662 1620 L 1662 1580 L 1658 1540 L 1648 1505 L 1635 1485 L 1625 1482 L 1605 1478 L 1582 1478 L 1558 1482 L 1532 1488 L 1508 1492 L 1495 1495 L 1490 1508 L 1480 1532 L 1470 1555 L 1460 1575 L 1442 1590 L 1418 1600 L 1405 1605 Z"
    },
    {
      id: "sodden",
      locId: "kagen",
      name: "Содден",
      icon: "🔥",
      baseColor: "#fb7185",
      defaultFaction: "sodden",
      labelX: 1840, labelY: 1765,
      d: "M 1580 1734 L 1600 1710 L 1620 1683 L 1640 1662 L 1660 1661 L 1680 1666 L 1700 1670 L 1720 1650 L 1740 1650 L 1760 1652 L 1780 1654 L 1800 1649 L 1820 1647 L 1840 1649 L 1860 1652 L 1880 1655 L 1900 1664 L 1920 1669 L 1940 1667 L 1960 1658 L 1980 1628 L 2000 1605 L 2025 1585 L 2045 1598 L 2065 1607 L 2115 1655 L 2165 1685 L 2218 1702 L 2240 1720 L 2248 1765 L 2235 1820 L 2215 1870 L 2185 1915 L 2162 1965 L 2145 2015 L 2128 2018 L 2092 2022 L 2050 2028 L 2000 2032 L 1945 2032 L 1885 2028 L 1828 2030 L 1772 2040 L 1745 2045 L 1675 2035 L 1672 2022 L 1668 1998 L 1658 1968 L 1642 1932 L 1630 1892 L 1620 1848 L 1612 1805 L 1608 1775 L 1598 1750 L 1580 1734 Z"
    },
    {
      id: "angren",
      locId: "ysgith_swamps",
      name: "Ангрен",
      icon: "🌫️",
      baseColor: "#a3e635",
      defaultFaction: "angren",
      labelX: 2025, labelY: 1495,
      d: "M 1880 1655 L 1900 1664 L 1920 1669 L 1940 1667 L 1960 1658 L 1980 1628 L 2000 1605 L 2025 1585 L 2045 1598 L 2065 1607 L 2100 1605 L 2135 1605 L 2165 1592 L 2195 1592 L 2215 1568 L 2238 1515 L 2212 1465 L 2205 1415 L 2198 1365 L 2175 1340 L 2135 1395 L 2092 1408 L 2048 1412 L 2005 1402 L 1965 1378 L 1945 1365 L 1925 1365 L 1895 1410 L 1875 1445 L 1855 1485 L 1825 1510 L 1805 1540 L 1815 1565 L 1848 1580 L 1870 1615 L 1880 1655 Z"
    },
    {
      id: "mahakam",
      locId: "mahakam",
      name: "Махакам",
      icon: "🪓",
      baseColor: "#94a3b8",
      defaultFaction: "mahakam",
      labelX: 2045, labelY: 1185,
      d: "M 1985 935 L 1975 962 L 1955 1018 L 1940 1078 L 1930 1142 L 1928 1202 L 1932 1258 L 1938 1305 L 1942 1345 L 1945 1365 L 1965 1378 L 2005 1402 L 2048 1412 L 2092 1408 L 2135 1395 L 2175 1340 L 2175 1295 L 2172 1280 L 2168 1250 L 2155 1208 L 2135 1152 L 2110 1095 L 2080 1035 L 2045 988 L 2005 952 L 1985 935 Z"
    },
    {
      id: "aedirn",
      locId: "vengerberg",
      name: "Аэдирн",
      icon: "🔥",
      baseColor: "#f97316",
      defaultFaction: "aedirn",
      labelX: 2335, labelY: 1125,
      d: "M 1915 800 L 1925 816 L 1945 849 L 1962 882 L 1978 918 L 1985 935 L 2005 952 L 2045 988 L 2080 1035 L 2110 1095 L 2135 1152 L 2155 1208 L 2168 1250 L 2172 1280 L 2175 1295 L 2175 1340 L 2215 1340 L 2250 1340 L 2282 1318 L 2315 1312 L 2365 1315 L 2412 1315 L 2452 1285 L 2490 1245 L 2535 1235 L 2585 1242 L 2640 1238 L 2695 1245 L 2706 1202 L 2711 1145 L 2714 1085 L 2715 1055 L 2660 1055 L 2550 1055 L 2462 1045 L 2398 1025 L 2358 992 L 2342 948 L 2340 899 L 2350 846 L 2355 820 L 2328 815 L 2272 805 L 2218 809 L 2162 826 L 2105 830 L 2045 820 L 1990 811 L 1940 804 L 1915 800 Z"
    },
    {
      id: "dol_blathanna",
      locId: "dol_blathanna",
      name: "Дол Блатанна",
      icon: "🌺",
      baseColor: "#ec4899",
      defaultFaction: "dol_blathanna",
      labelX: 2535, labelY: 945,
      d: "M 2355 820 L 2350 846 L 2340 899 L 2342 948 L 2358 992 L 2398 1025 L 2462 1045 L 2550 1055 L 2660 1055 L 2715 1055 L 2716 1020 L 2719 950 L 2718 880 L 2712 810 L 2710 775 L 2679 778 L 2616 782 L 2555 790 L 2495 800 L 2438 809 L 2382 816 L 2355 820 Z"
    },
    {
      id: "lyria",
      locId: "rivia",
      name: "Лирия и Ривия",
      icon: "🛡️",
      baseColor: "#f59e0b",
      defaultFaction: "lyria",
      labelX: 2445, labelY: 1375,
      d: "M 2175 1340 L 2198 1365 L 2205 1415 L 2212 1465 L 2238 1515 L 2260 1498 L 2285 1482 L 2320 1475 L 2348 1468 L 2380 1468 L 2420 1462 L 2460 1455 L 2482 1462 L 2515 1468 L 2535 1442 L 2558 1432 L 2590 1435 L 2630 1445 L 2665 1438 L 2702 1435 L 2700 1328 L 2695 1245 L 2640 1238 L 2585 1242 L 2535 1235 L 2490 1245 L 2452 1285 L 2412 1315 L 2365 1315 L 2315 1312 L 2282 1318 L 2250 1340 L 2215 1340 L 2175 1340 Z"
    },
    {
      id: "dol_angra",
      locId: "glevitzingen",
      name: "Дол Ангра",
      icon: "🌉",
      baseColor: "#2dd4bf",
      defaultFaction: "dol_angra",
      labelX: 2410, labelY: 1615,
      d: "M 2065 1607 L 2100 1605 L 2135 1605 L 2165 1592 L 2195 1592 L 2215 1568 L 2238 1515 L 2260 1498 L 2285 1482 L 2320 1475 L 2348 1468 L 2380 1468 L 2420 1462 L 2460 1455 L 2482 1462 L 2515 1468 L 2535 1442 L 2558 1432 L 2590 1435 L 2630 1445 L 2665 1438 L 2702 1435 L 2701 1498 L 2684 1582 L 2652 1660 L 2608 1730 L 2552 1772 L 2488 1788 L 2455 1795 L 2428 1802 L 2372 1818 L 2345 1825 L 2298 1918 L 2262 1942 L 2220 1970 L 2170 2000 L 2145 2015 L 2162 1965 L 2185 1915 L 2215 1870 L 2235 1820 L 2248 1765 L 2240 1720 L 2218 1702 L 2165 1685 L 2115 1655 L 2065 1607 Z"
    },
    {
      id: "skellige",
      locId: "kaer_trolde",
      name: "Скеллиге",
      icon: "⛵",
      baseColor: "#06b6d4",
      defaultFaction: "skellige",
      labelX: 595, labelY: 1615,
      d: "M 602 1575 L 604 1576 L 606 1578 L 608 1582 L 611 1584 L 616 1586 L 622 1587 L 627 1587 L 634 1584 L 643 1580 L 650 1577 L 658 1576 L 663 1578 L 668 1580 L 670 1585 L 671 1592 L 667 1598 L 660 1605 L 656 1611 L 655 1616 L 654 1620 L 652 1622 L 648 1623 L 644 1624 L 638 1628 L 634 1636 L 631 1642 L 631 1646 L 633 1650 L 637 1654 L 639 1658 L 639 1664 L 636 1668 L 628 1670 L 622 1674 L 618 1680 L 612 1682 L 608 1684 L 604 1683 L 600 1680 L 597 1679 L 594 1680 L 591 1681 L 590 1683 L 590 1686 L 591 1690 L 590 1693 L 587 1694 L 585 1703 L 584 1720 L 581 1729 L 574 1731 L 568 1731 L 564 1730 L 557 1722 L 548 1707 L 541 1689 L 535 1666 L 540 1651 L 558 1642 L 566 1634 L 568 1625 L 566 1617 L 564 1610 L 569 1602 L 584 1592 L 593 1584 L 598 1578 Z M 632 1466 L 637 1469 L 639 1475 L 640 1484 L 642 1493 L 646 1503 L 648 1511 L 648 1518 L 650 1524 L 653 1532 L 653 1537 L 648 1541 L 640 1541 L 630 1538 L 622 1536 L 618 1534 L 614 1525 L 609 1506 L 603 1494 L 596 1488 L 592 1484 L 592 1482 L 594 1480 L 597 1476 L 604 1474 L 615 1473 L 622 1470 L 628 1466 Z M 544 1503 L 549 1510 L 552 1520 L 553 1535 L 553 1542 L 552 1544 L 550 1549 L 550 1558 L 545 1566 L 536 1571 L 530 1572 L 524 1566 L 520 1557 L 517 1543 L 519 1529 L 528 1515 L 534 1506 L 540 1502 Z M 703 1584 L 708 1584 L 712 1586 L 716 1591 L 718 1597 L 719 1606 L 718 1612 L 717 1614 L 711 1618 L 702 1621 L 696 1626 L 695 1631 L 692 1635 L 690 1636 L 686 1638 L 681 1639 L 678 1640 L 674 1638 L 672 1633 L 672 1623 L 674 1616 L 679 1610 L 684 1604 L 686 1595 L 691 1589 L 698 1586 Z M 732 1552 L 736 1553 L 738 1555 L 739 1559 L 738 1563 L 734 1568 L 732 1572 L 730 1576 L 728 1578 L 725 1580 L 721 1579 L 717 1576 L 715 1572 L 715 1564 L 716 1560 L 718 1557 L 722 1555 L 728 1553 Z M 554 1763 L 566 1764 L 572 1766 L 575 1772 L 579 1775 L 584 1778 L 588 1781 L 589 1784 L 590 1788 L 590 1790 L 589 1793 L 586 1796 L 581 1797 L 573 1796 L 566 1794 L 561 1791 L 556 1789 L 553 1788 L 545 1790 L 532 1795 L 523 1796 L 518 1795 L 515 1792 L 515 1786 L 516 1783 L 518 1780 L 523 1776 L 531 1768 L 538 1764 L 546 1764 Z M 400 1692 L 405 1694 L 408 1697 L 409 1700 L 409 1708 L 409 1721 L 406 1726 L 402 1726 L 396 1724 L 391 1724 L 386 1719 L 381 1710 L 380 1703 L 382 1698 L 386 1694 L 394 1692 Z"
    },
    {
      id: "cintra",
      locId: "cintra",
      name: "Цинтра",
      icon: "🦁",
      baseColor: "#10b981",
      defaultFaction: "cintra",
      labelX: 1435, labelY: 1885,
      d: "M 1248 1785 L 1260 1778 L 1280 1769 L 1300 1769 L 1320 1766 L 1340 1761 L 1355 1752 L 1380 1741 L 1400 1737 L 1420 1738 L 1440 1744 L 1460 1749 L 1480 1747 L 1500 1751 L 1520 1749 L 1540 1744 L 1560 1742 L 1580 1734 L 1598 1750 L 1608 1775 L 1612 1805 L 1620 1848 L 1630 1892 L 1642 1932 L 1658 1968 L 1668 1998 L 1672 2022 L 1675 2035 L 1660 2042 L 1630 2058 L 1598 2072 L 1562 2088 L 1530 2092 L 1500 2088 L 1468 2080 L 1432 2070 L 1400 2074 L 1371 2091 L 1356 2100 L 1336 2088 L 1296 2064 L 1268 2054 L 1252 2058 L 1238 2057 L 1226 2051 L 1222 2044 L 1226 2036 L 1234 2029 L 1246 2023 L 1255 1997 L 1261 1951 L 1264 1921 L 1264 1907 L 1256 1892 L 1240 1876 L 1231 1855 L 1229 1829 L 1242 1807 L 1248 1785 Z"
    },
    {
      id: "nazair",
      locId: "stygga_castle",
      name: "Назаир",
      icon: "⚔️",
      baseColor: "#d97706",
      defaultFaction: "nazair",
      labelX: 1520, labelY: 2250,
      d: "M 1356 2100 L 1360 2114 L 1368 2142 L 1361 2166 L 1339 2186 L 1332 2206 L 1340 2226 L 1340 2262 L 1332 2314 L 1330 2345 L 1334 2355 L 1341 2363 L 1351 2369 L 1356 2372 L 1383 2370 L 1438 2367 L 1490 2372 L 1540 2388 L 1592 2395 L 1648 2395 L 1695 2390 L 1735 2380 L 1755 2375 L 1755 2340 L 1755 2270 L 1745 2210 L 1725 2160 L 1722 2112 L 1738 2068 L 1745 2045 L 1675 2035 L 1660 2042 L 1630 2058 L 1598 2072 L 1562 2088 L 1530 2092 L 1500 2088 L 1468 2080 L 1432 2070 L 1400 2074 L 1371 2091 L 1356 2100 Z"
    },
    {
      id: "mag_turga",
      locId: "haern_caduch",
      name: "Маг Турге",
      icon: "⛰️",
      baseColor: "#c084fc",
      defaultFaction: "mag_turga",
      labelX: 1955, labelY: 2215,
      d: "M 1745 2045 L 1738 2068 L 1722 2112 L 1725 2160 L 1745 2210 L 1755 2270 L 1755 2340 L 1755 2375 L 1782 2385 L 1838 2405 L 1890 2425 L 1940 2445 L 1990 2462 L 2040 2478 L 2065 2485 L 2078 2460 L 2102 2410 L 2128 2358 L 2152 2302 L 2165 2275 L 2165 2242 L 2165 2178 L 2160 2112 L 2150 2048 L 2145 2015 L 2128 2018 L 2092 2022 L 2050 2028 L 2000 2032 L 1945 2032 L 1885 2028 L 1828 2030 L 1772 2040 L 1745 2045 Z"
    },
    {
      id: "toussaint",
      locId: "beauclair",
      name: "Туссент",
      icon: "🍇",
      baseColor: "#a855f7",
      defaultFaction: "toussaint",
      labelX: 2385, labelY: 2165,
      d: "M 2145 2015 L 2150 2048 L 2160 2112 L 2165 2178 L 2165 2242 L 2165 2275 L 2190 2290 L 2240 2320 L 2295 2338 L 2355 2342 L 2418 2332 L 2482 2308 L 2540 2282 L 2590 2258 L 2615 2245 L 2602 2205 L 2578 2125 L 2552 2048 L 2528 1972 L 2500 1900 L 2470 1830 L 2428 1802 L 2372 1818 L 2345 1825 L 2338 1845 L 2322 1885 L 2298 1918 L 2262 1942 L 2220 1970 L 2170 2000 L 2145 2015 Z"
    },
    {
      id: "metinna",
      locId: "stygga_castle",
      name: "Метинна",
      icon: "🐎",
      baseColor: "#e879f9",
      defaultFaction: "metinna",
      labelX: 1685, labelY: 2615,
      d: "M 1356 2372 L 1354 2378 L 1350 2390 L 1343 2397 L 1333 2399 L 1320 2407 L 1304 2421 L 1280 2429 L 1248 2431 L 1240 2441 L 1256 2459 L 1264 2473 L 1264 2483 L 1259 2492 L 1249 2500 L 1245 2510 L 1247 2522 L 1252 2533 L 1260 2543 L 1272 2549 L 1288 2551 L 1298 2561 L 1302 2579 L 1308 2589 L 1316 2591 L 1325 2598 L 1335 2610 L 1339 2621 L 1337 2631 L 1322 2645 L 1294 2663 L 1280 2672 L 1314 2695 L 1381 2742 L 1445 2765 L 1505 2765 L 1565 2770 L 1625 2780 L 1680 2790 L 1730 2800 L 1772 2810 L 1808 2820 L 1825 2825 L 1848 2818 L 1892 2802 L 1935 2792 L 1975 2788 L 2015 2788 L 2055 2792 L 2075 2795 L 2068 2780 L 2052 2750 L 2050 2715 L 2060 2675 L 2078 2632 L 2102 2588 L 2102 2545 L 2078 2505 L 2065 2485 L 2040 2478 L 1990 2462 L 1940 2445 L 1890 2425 L 1838 2405 L 1782 2385 L 1755 2375 L 1735 2380 L 1695 2390 L 1648 2395 L 1592 2395 L 1540 2388 L 1490 2372 L 1438 2367 L 1383 2370 L 1356 2372 Z"
    },
    {
      id: "geso",
      locId: "korath_desert",
      name: "Гесо",
      icon: "🏜️",
      baseColor: "#fb923c",
      defaultFaction: "geso",
      labelX: 2285, labelY: 2615,
      d: "M 2065 2485 L 2078 2505 L 2102 2545 L 2102 2588 L 2078 2632 L 2060 2675 L 2050 2715 L 2052 2750 L 2068 2780 L 2075 2795 L 2102 2802 L 2158 2818 L 2218 2830 L 2282 2840 L 2340 2842 L 2390 2838 L 2432 2832 L 2468 2828 L 2485 2825 L 2492 2798 L 2508 2742 L 2522 2675 L 2538 2595 L 2552 2515 L 2568 2435 L 2585 2358 L 2605 2282 L 2615 2245 L 2590 2258 L 2540 2282 L 2482 2308 L 2418 2332 L 2355 2342 L 2295 2338 L 2240 2320 L 2190 2290 L 2165 2275 L 2152 2302 L 2128 2358 L 2102 2410 L 2078 2460 L 2065 2485 Z"
    },
    {
      id: "ebbing",
      locId: "stygga_castle",
      name: "Эббинг",
      icon: "💀",
      baseColor: "#2dd4bf",
      defaultFaction: "ebbing",
      labelX: 1615, labelY: 3025,
      d: "M 1280 2672 L 1267 2680 L 1241 2696 L 1227 2717 L 1225 2743 L 1216 2762 L 1200 2774 L 1191 2787 L 1189 2801 L 1184 2813 L 1176 2823 L 1172 2843 L 1172 2873 L 1177 2895 L 1187 2909 L 1206 2918 L 1234 2922 L 1255 2927 L 1269 2933 L 1280 2942 L 1288 2954 L 1302 2961 L 1322 2963 L 1331 2972 L 1329 2988 L 1337 3015 L 1355 3053 L 1378 3082 L 1406 3102 L 1425 3119 L 1435 3133 L 1443 3153 L 1449 3179 L 1448 3197 L 1440 3207 L 1431 3213 L 1421 3215 L 1419 3226 L 1425 3246 L 1424 3262 L 1416 3274 L 1412 3289 L 1412 3307 L 1423 3329 L 1445 3355 L 1456 3368 L 1483 3370 L 1538 3373 L 1595 3370 L 1655 3360 L 1710 3345 L 1760 3325 L 1802 3302 L 1838 3278 L 1855 3265 L 1865 3240 L 1885 3190 L 1905 3142 L 1925 3098 L 1935 3075 L 1918 3055 L 1882 3015 L 1852 2975 L 1828 2935 L 1818 2892 L 1822 2848 L 1825 2825 L 1808 2820 L 1772 2810 L 1730 2800 L 1680 2790 L 1625 2780 L 1565 2770 L 1505 2765 L 1445 2765 L 1381 2742 L 1314 2695 L 1280 2672 Z"
    },
    {
      id: "maecht",
      locId: "stygga_castle",
      name: "Маэхт",
      icon: "👑",
      baseColor: "#f472b6",
      defaultFaction: "maecht",
      labelX: 2085, labelY: 2935,
      d: "M 1825 2825 L 1822 2848 L 1818 2892 L 1828 2935 L 1852 2975 L 1882 3015 L 1918 3055 L 1935 3075 L 1965 3075 L 2025 3075 L 2085 3070 L 2145 3060 L 2210 3048 L 2280 3032 L 2352 3025 L 2428 3025 L 2465 3025 L 2468 3000 L 2472 2950 L 2478 2900 L 2482 2850 L 2485 2825 L 2468 2828 L 2432 2832 L 2390 2838 L 2340 2842 L 2282 2840 L 2218 2830 L 2158 2818 L 2102 2802 L 2075 2795 L 2055 2792 L 2015 2788 L 1975 2788 L 1935 2792 L 1892 2802 L 1848 2818 L 1825 2825 Z"
    },
    {
      id: "gemmera",
      locId: "haern_caduch",
      name: "Геммера",
      icon: "🐻",
      baseColor: "#a78bfa",
      defaultFaction: "gemmera",
      labelX: 2185, labelY: 3215,
      d: "M 1935 3075 L 1925 3098 L 1905 3142 L 1885 3190 L 1865 3240 L 1855 3265 L 1870 3282 L 1900 3318 L 1940 3342 L 1990 3358 L 2015 3365 L 2052 3365 L 2128 3365 L 2208 3368 L 2292 3372 L 2388 3378 L 2492 3382 L 2545 3385 L 2538 3338 L 2522 3242 L 2502 3152 L 2478 3068 L 2465 3025 L 2428 3025 L 2352 3025 L 2280 3032 L 2210 3048 L 2145 3060 L 2085 3070 L 2025 3075 L 1965 3075 L 1935 3075 Z"
    },
    {
      id: "etolia",
      locId: "nilfgaard_city",
      name: "Этолия",
      icon: "🌊",
      baseColor: "#34d399",
      defaultFaction: "etolia",
      labelX: 1715, labelY: 3495,
      d: "M 1456 3368 L 1458 3378 L 1462 3398 L 1446 3422 L 1410 3450 L 1392 3468 L 1392 3476 L 1385 3490 L 1371 3510 L 1365 3526 L 1367 3538 L 1364 3553 L 1356 3571 L 1356 3583 L 1364 3589 L 1381 3594 L 1407 3598 L 1425 3610 L 1435 3630 L 1444 3641 L 1452 3643 L 1462 3651 L 1474 3665 L 1483 3683 L 1489 3705 L 1512 3711 L 1552 3701 L 1575 3710 L 1581 3738 L 1599 3756 L 1629 3764 L 1644 3768 L 1667 3742 L 1712 3691 L 1755 3645 L 1795 3605 L 1842 3582 L 1898 3578 L 1925 3575 L 1940 3562 L 1970 3538 L 1995 3508 L 2015 3472 L 2022 3432 L 2018 3388 L 2015 3365 L 1990 3358 L 1940 3342 L 1900 3318 L 1870 3282 L 1855 3265 L 1838 3278 L 1802 3302 L 1760 3325 L 1710 3345 L 1655 3360 L 1595 3370 L 1538 3373 L 1483 3370 L 1456 3368 Z"
    },
    {
      id: "vicovaro",
      locId: "nilfgaard_city",
      name: "Виковаро",
      icon: "🔮",
      baseColor: "#6366f1",
      defaultFaction: "vicovaro",
      labelX: 2265, labelY: 3555,
      d: "M 2015 3365 L 2018 3388 L 2022 3432 L 2015 3472 L 1995 3508 L 1970 3538 L 1940 3562 L 1925 3575 L 1952 3592 L 2008 3628 L 2068 3662 L 2132 3698 L 2210 3722 L 2300 3738 L 2402 3748 L 2518 3752 L 2575 3755 L 2572 3708 L 2568 3612 L 2560 3520 L 2550 3430 L 2545 3385 L 2492 3382 L 2388 3378 L 2292 3372 L 2208 3368 L 2128 3365 L 2052 3365 L 2015 3365 Z"
    },
    {
      id: "nilfgaard_core",
      locId: "nilfgaard_city",
      name: "Нильфгаард",
      icon: "☀️",
      baseColor: "#facc15",
      defaultFaction: "nilfgaard",
      labelX: 2055, labelY: 3915,
      d: "M 1644 3768 L 1648 3788 L 1656 3828 L 1652 3857 L 1636 3875 L 1631 3891 L 1637 3905 L 1638 3933 L 1634 3975 L 1647 4006 L 1677 4026 L 1697 4048 L 1707 4072 L 1712 4084 L 1948 4084 L 2419 4084 L 2645 4044 L 2625 3965 L 2605 3882 L 2585 3798 L 2575 3755 L 2518 3752 L 2402 3748 L 2300 3738 L 2210 3722 L 2132 3698 L 2068 3662 L 2008 3628 L 1952 3592 L 1925 3575 L 1898 3578 L 1842 3582 L 1795 3605 L 1755 3645 L 1712 3691 L 1667 3742 L 1644 3768 Z"
    }
  ];

  function getWiTerritoriesList(){
    var owners = (WI.map && WI.map.territoryOwners) || {};
    return WI_TACTICAL_TERRITORIES_BASE.map(function(tb){
      var rawOwner = owners[tb.id];
      var isCaptured = !!(rawOwner && rawOwner !== 'independent' && rawOwner !== tb.defaultFaction && WI_TACTICAL_FACTIONS[rawOwner]);
      var fac = isCaptured ? WI_TACTICAL_FACTIONS[rawOwner] : null;
      var color = fac ? fac.color : (tb.baseColor || '#3b82f6');
      var icon = fac ? fac.icon : (tb.icon || '🏴');
      return {
        id: tb.id,
        locId: tb.locId,
        name: tb.name,
        defaultFaction: tb.defaultFaction,
        ownerFaction: fac ? fac.id : tb.defaultFaction,
        color: color,
        icon: icon,
        labelX: tb.labelX,
        labelY: tb.labelY,
        labelText: icon + ' ' + tb.name.toUpperCase() + (fac ? ' [' + fac.short.replace(/^[^\s]+\s*/, '') + ']' : ''),
        d: tb.d
      };
    });
  }

  var WI_TACTICAL_SCENARIOS = [
    {
      id: 'canon_peace',
      name: '🕊️ Классический баланс Континента (До Северных войн)',
      desc: 'Традиционные границы королевств Севера, вольного Брокилона, Скеллиге и Южной Империи.',
      cam: { cx: 1550, cy: 1380, zoom: 1.05 },
      owners: {},
      warPaths: [],
      units: [
        { id: 'cp1', nation: 'kovir_witchers', type: 'witcher', status: 'ready', strength: 'Школа Волка (Весемир)', hp: 100, x: 2595, y: 245, label: 'Цитадель Каэр Морхен' },
        { id: 'cp2', nation: 'temeria', type: 'fort', status: 'ready', strength: '8 000 гвардейцев', hp: 100, x: 1615, y: 1125, label: 'Королевская Вызима (Фольтест)' },
        { id: 'cp3', nation: 'redania', type: 'fleet', status: 'ready', strength: '35 галер и коггов', hp: 100, x: 1150, y: 1025, label: 'Флот Вольного Новиграда' },
        { id: 'cp4', nation: 'skellige', type: 'fleet', status: 'march', strength: '40 драккаров', hp: 100, x: 595, y: 1590, marchPath: [{x:780,y:1520},{x:940,y:1440}], label: 'Драккары клана ан Крайт' },
        { id: 'cp5', nation: 'nilfgaard', type: 'fort', status: 'ready', strength: 'Легион «Импера»', hp: 100, x: 1710, y: 3800, label: 'Город Золотых Башен (Эмгыр)' },
        { id: 'cp6', nation: 'scoiatael', type: 'archers', status: 'ready', strength: 'Дриады Дуэн Канэлль', hp: 100, x: 1210, y: 1585, label: 'Стражи Брокилона (Эитнэ)' }
      ]
    },
    {
      id: 'first_war_sodden',
      name: '🔥 Первая Северная война: Содденский Холм (1263 г.)',
      desc: 'Резня в Цинтре, форсирование Яруги легионами Нильфгаарда и легендарная битва Четырнадцати Чародеев на Содденском Холме.',
      cam: { cx: 1480, cy: 1720, zoom: 1.85 },
      owners: { cintra: 'nilfgaard', nilfgaard_provinces: 'nilfgaard', ebbing_gemmera: 'nilfgaard', nilfgaard_core: 'nilfgaard' },
      warPaths: [
        { nation: 'nilfgaard', style: 'arrow', size: 48, points: [{x:1520,y:2020},{x:1380,y:1890},{x:1290,y:1815}] },
        { nation: 'nilfgaard', style: 'arrow', size: 48, points: [{x:1350,y:1815},{x:1460,y:1750},{x:1530,y:1695}] },
        { nation: 'temeria', style: 'front', size: 38, points: [{x:1380,y:1660},{x:1530,y:1680},{x:1690,y:1645}] }
      ],
      units: [
        { id: 'fw1', nation: 'nilfgaard', type: 'raze', status: 'siege', strength: 'Армия Узурпатора', hp: 90, x: 1290, y: 1815, label: 'Сожжение Цинтры (Падение Калантэ)' },
        { id: 'fw2', nation: 'mages', nation_override: 'mages', type: 'mages', status: 'battle', strength: '22 Чародея Капитула', hp: 80, x: 1530, y: 1695, label: 'Капитул: 14 Чародеев (Вильгефорц)' },
        { id: 'fw3', nation: 'nilfgaard', type: 'cavalry', status: 'battle', strength: '40 000 легионеров', hp: 75, x: 1545, y: 1748, marchPath: [{x:1530,y:1695}], label: 'Штурмовой корпус Нильфгаарда' },
        { id: 'fw4', nation: 'temeria', type: 'pikemen', status: 'march', strength: '55 000 ратников Севера', hp: 95, x: 1605, y: 1575, marchPath: [{x:1565,y:1645},{x:1535,y:1690}], label: 'Союзная рать Фольтеста и Визимира' },
        { id: 'fw5', nation: 'skellige', type: 'fleet', status: 'ready', strength: '30 боевых драккаров', hp: 85, x: 960, y: 1790, label: 'Драккары ярла Эйста Тиршаха' }
      ]
    },
    {
      id: 'second_war_brenna',
      name: '⚔️ Вторая Северная война: Битва под Бренной (1268 г.)',
      desc: 'Трёхсоттысячное вторжение маршала Менно Коегоорна, бунт на Танедде, рейд королевы Мэвы и генеральное сражение под Бренной.',
      cam: { cx: 1690, cy: 1430, zoom: 1.75 },
      owners: { cintra: 'nilfgaard', sodden: 'nilfgaard', dol_angra: 'nilfgaard', lyria: 'nilfgaard', aedirn: 'nilfgaard', nilfgaard_provinces: 'nilfgaard', ebbing_gemmera: 'nilfgaard', nilfgaard_core: 'nilfgaard' },
      warPaths: [
        { nation: 'nilfgaard', style: 'arrow', size: 65, points: [{x:1560,y:1820},{x:1605,y:1620},{x:1665,y:1460}] },
        { nation: 'nilfgaard', style: 'arrow', size: 48, points: [{x:2050,y:1780},{x:2255,y:1415},{x:2335,y:1175}] },
        { nation: 'temeria', style: 'front', size: 48, points: [{x:1480,y:1395},{x:1665,y:1410},{x:1860,y:1390}] }
      ],
      units: [
        { id: 'sw1', nation: 'nilfgaard', type: 'cavalry', status: 'battle', strength: '46 000 (Дивизия «Ард Феаинн»)', hp: 85, x: 1665, y: 1475, label: 'Группа армий «Центр» (Менно Коегоорн)' },
        { id: 'sw2', nation: 'temeria', type: 'battle', status: 'battle', strength: '45 000 (Пехота и Пикинёры)', hp: 80, x: 1665, y: 1420, label: 'Рать Яна Наталиса (Бренна)' },
        { id: 'sw3', nation: 'redania', type: 'cavalry', status: 'march', strength: '12 000 (Вольная Кондотьерия)', hp: 100, x: 1520, y: 1350, marchPath: [{x:1600,y:1395},{x:1660,y:1445}], label: 'Конница Адама Пангратта и Редании' },
        { id: 'sw4', nation: 'lyria', type: 'guerrilla', status: 'march', strength: '5 000 ветеранов Лирии', hp: 90, x: 2255, y: 1415, marchPath: [{x:2120,y:1490},{x:1980,y:1560}], label: 'Партизаны королевы Мэвы' },
        { id: 'sw5', nation: 'scoiatael', type: 'guerrilla', status: 'battle', strength: '3 500 эльфийских всадников', hp: 70, x: 1850, y: 1460, label: 'Бригада «Врихедд» (Исенгрим Фаоильтиарна)' },
        { id: 'sw6', nation: 'mages', type: 'mages', status: 'battle', strength: 'Раскол Капитула', hp: 65, x: 1175, y: 1185, label: 'Бунт на острове Танедд' },
        { id: 'sw7', nation: 'kovir_witchers', type: 'witcher', status: 'march', strength: 'Геральт, Кагыр, Мильва, Регис, Ангулема', hp: 95, x: 1760, y: 1680, marchPath: [{x:1820,y:1860},{x:1895,y:2040}], label: 'Ганза Геральта (Путь к замку Стигга)' }
      ]
    },
    {
      id: 'third_war_1272',
      name: '🦅 Третья Северная война: Линия Понтара (1272 г. / Ведьмак 3)',
      desc: 'Темерия и Аэдирн пали, Каэдвен поглощён Реданией. Армии Радовида V и Эмгыра вар Эмрейса стоят друг против друга вдоль реки Понтар.',
      cam: { cx: 1380, cy: 1120, zoom: 1.85 },
      owners: {
        temeria: 'nilfgaard',
        cintra: 'nilfgaard',
        sodden: 'nilfgaard',
        dol_angra: 'nilfgaard',
        lyria: 'nilfgaard',
        aedirn: 'nilfgaard',
        kaedwen: 'redania',
        hengfors: 'redania',
        redania: 'redania'
      },
      warPaths: [
        { nation: 'nilfgaard', style: 'front', size: 65, points: [{x:1120,y:1110},{x:1320,y:1120},{x:1615,y:1125},{x:1925,y:1060}] },
        { nation: 'redania', style: 'front', size: 65, points: [{x:1140,y:995},{x:1320,y:1005},{x:1580,y:1000},{x:1920,y:940}] }
      ],
      units: [
        { id: 'tw1', nation: 'nilfgaard', type: 'fort', status: 'ready', strength: 'Гвардия Императора', hp: 100, x: 1615, y: 1125, label: 'Ставка Эмгыра в Вызиме' },
        { id: 'tw2', nation: 'nilfgaard', type: 'camp', status: 'camp', strength: '65 000 легионеров', hp: 90, x: 1320, y: 1160, marchPath: [{x:1285,y:1085}], label: 'Лагерь группы армий «Центр» (Велен)' },
        { id: 'tw3', nation: 'redania', type: 'fort', status: 'ready', strength: '50 000 + Охотники за колдуньями', hp: 95, x: 1265, y: 1035, label: 'Ставка Радовида V в Оксенфурте' },
        { id: 'tw4', nation: 'temeria', type: 'spies', status: 'ready', strength: 'Отряд Вернона Роше и Бьянки', hp: 85, x: 1220, y: 1065, label: 'Подполье Синих Полосок (В. Роше)' },
        { id: 'tw5', nation: 'nilfgaard', type: 'fleet', status: 'march', strength: '80 боевых кораблей', hp: 90, x: 760, y: 1740, marchPath: [{x:660,y:1640}], label: 'Армада Нильфгаарда у Скеллиге' },
        { id: 'tw6', nation: 'skellige', type: 'fleet', status: 'battle', strength: 'Флот ярлов Скеллиге', hp: 95, x: 595, y: 1590, label: 'Флот кланов Скеллиге (Хьялмар / Керис)' }
      ]
    },
    {
      id: 'wild_hunt_invasion',
      name: '💀 Вторжение Дикой Охоты: Осада Каэр Морхена и Ундвик',
      desc: 'Корабль Нагльфар и Красные Всадники Эредина прорываются сквозь Белый Хлад в Синих Горах, Велене и на острове Ундвик.',
      cam: { cx: 2540, cy: 270, zoom: 2.3 },
      owners: { kaedwen: 'wild_hunt' },
      warPaths: [
        { nation: 'wild_hunt', style: 'arrow', size: 48, points: [{x:2420,y:180},{x:2520,y:215},{x:2585,y:240}] },
        { nation: 'wild_hunt', style: 'arrow', size: 48, points: [{x:810,y:1670},{x:745,y:1640},{x:692,y:1612}] }
      ],
      units: [
        { id: 'wh1', nation: 'wild_hunt', type: 'siege', status: 'siege', strength: 'Всадники Морхогга и Гончие', hp: 90, x: 2595, y: 245, label: 'Осада Каэр Морхена (Эредин и Имлерих)' },
        { id: 'wh2', nation: 'kovir_witchers', type: 'witcher', status: 'battle', strength: 'Геральт, Цири, Весемир, Ламберт, Эскель, Лето', hp: 85, x: 2560, y: 275, label: 'Братство Волка (Оборона Каэр Морхена)' },
        { id: 'wh3', nation: 'wild_hunt', type: 'monster', status: 'battle', strength: 'Имлерих и Хозяйки Леса', hp: 80, x: 1295, y: 1215, label: 'Шабаш на Лысой Горе (Кривоуховы топи)' },
        { id: 'wh4', nation: 'wild_hunt', type: 'fleet', status: 'battle', strength: 'Корабль «Нагльфар» и навигаторы', hp: 85, x: 692, y: 1612, label: 'Нагльфар у острова Ундвик (Карантир)' },
        { id: 'wh5', nation: 'skellige', type: 'mages', status: 'battle', strength: 'Флот Скеллиге + Ложа Чародеек + Фрингилья', hp: 90, x: 640, y: 1585, label: 'Союзный флот Скеллиге и Ложи Чародеек' }
      ]
    }
  ];

  /* Генератор ведьмачьих контрактов с доски объявлений региона */
  var WI_CONTRACTS_POOL = {
    swamp: [
      { title: 'Контракт: «Туманы над трясиной»', monster: 'Древний Туманник — Игнис Фатуус (Реликт / Трупоед)', client: 'Староста деревни Залипье', reward: '280 новиградских крон', clues: 'Тела сборщиков торфа со следами длинных когтей; блуждающие болотные огни гаснут при приближении медальона.', prep: 'Масло против трупоедов, бомба «Лунная пыль», знак Квен и знак Аард для рассеивания иллюзий.' },
      { title: 'Контракт: «Плач у старой гати»', monster: 'Кладбищенская баба — Морвудд (Трупоед)', client: 'Десятник темерского ополчения', reward: '240 оренов + редкая руна Велес', clues: 'Разрытые братские могилы у переправы, длинный раздвоенный язык, парализующий яд на доспехах.', prep: 'Масло против трупоедов, эликсир «Иволга», отсечение языка в контратаке (Рипост).' }
    ],
    mountain: [
      { title: 'Контракт: «Крылатый ужас перевала»', monster: 'Королевская Виверна (Драконид)', client: 'Караванщик краснолюдской гильдии Махакама', reward: '350 крон + слиток двимерита', clues: 'Растерзанные мулы на горном серпантине, запах едкой серы и сброшенная багровая чешуя у утёса.', prep: 'Масло против драконидов, эликсир «Иволга», арбалет или знак Аард для сбивания в полёте.' },
      { title: 'Контракт: «Хозяин ледяного ущелья»', monster: 'Старый Чёрт (Реликт)', client: 'Горный мастер рудника', reward: '410 крон', clues: 'Проломленные брёвна крепи, следы раздвоенных копыт и гипнотическое свечение третьего глаза во тьме штольни.', prep: 'Масло против реликтов, бомба «Самум» (ослепление), эликсир «Гром» и уклонение от тарана.' }
    ],
    forest: [
      { title: 'Контракт: «Сердце чащи»', monster: 'Древний Леший — Кернунн (Реликт)', client: 'Лесорубы фактории', reward: '380 крон + древний мутаген', clues: 'Тотемные столбы из оленьих черепов, вороньи стаи и волчий вой; леший пометил одного из охотников деревни.', prep: 'Масло против реликтов, бомба «Танцующая звезда», знак Игни (уязвимость к огню) и разрушение тотемов.' },
      { title: 'Контракт: «Паутина в старом бору»', monster: 'Главоглаз-матриарх (Инсектоид)', client: 'Травница из предгорья', reward: '260 крон + рецептура «Белого мёда»', clues: 'Коконы из липкой стальной паутины в кронах вековых елей и кислотные ожоги на коре.', prep: 'Масло против инсектоидов, эликсир «Иволга» и «Кошка», знак Ирден для замедления рывка.' }
    ],
    water: [
      { title: 'Контракт: «Песнь разбитых рифов»', monster: 'Архисирена — Мелюзина (Гибрид)', client: 'Капитан торгового когга / Ярл пристани', reward: '320 крон + жемчуг Великого Моря', clues: 'Обломки драккаров на острых скалах, вырванные вёсла и пронзительный ультразвуковой крик в шторм.', prep: 'Масло против гибридов, рог Хорнвалла или знак Аард, огненные болты.' }
    ],
    road: [
      { title: 'Контракт: «Ночной гость в винных погребах»', monster: 'Высший Катакан / Брукса (Вампир)', client: 'Бургомистр / Старшина купеческого цеха', reward: '450 крон + реликтовый клинок', clues: 'Обескровленные тела ночной стражи без единого следа взлома дверей; запах бузины и старого вина.', prep: 'Масло против вампиров, эликсир «Чёрная кровь», бомба «Лунная пыль» и ловушка знака Ирден.' },
      { title: 'Контракт: «Невеста полуденного зноя»', monster: 'Белая Дама / Полуденница (Призрак)', client: 'Управляющий поместьем', reward: '230 крон', clues: 'Жнецы падают замертво в полдень на золотом поле; у колодца найдено обручальное кольцо и дневник невесты.', prep: 'Масло против призраков, знак Ирден (для воплощения в материальную форму) и сожжение проклятого предмета.' }
    ]
  };


  /* ============================================================
     ЛАНДШАФТ И СИСТЕМА ПУТЕШЕСТВИЙ ПО КОНТИНЕНТУ
     ============================================================ */

  var WI_TERRAINS = {
    road: {
      id: 'road',
      name: 'Королевский тракт / Равнины',
      icon: '🛣️',
      speedHorse: 38,
      speedFoot: 18,
      speedWitcher: 28,
      speedBoat: 0,
      costMod: 1.0,
      danger: 'Низкая (патрули, корчмы, редкие бандиты)',
      desc: 'Укатанный каменный или грунтовый тракт. Идеально для верховой езды и быстрых повозок.'
    },
    hills: {
      id: 'hills',
      name: 'Холмы и перелески',
      icon: '🌾',
      speedHorse: 28,
      speedFoot: 15,
      speedWitcher: 24,
      speedBoat: 0,
      costMod: 1.3,
      danger: 'Средняя (дикие звери, полуденницы)',
      desc: 'Пересеченная холмистая местность, кустарники и полевые тропы. Лошади идут рысью.'
    },
    forest: {
      id: 'forest',
      name: 'Дремучий первобытный лес',
      icon: '🌲',
      speedHorse: 18,
      speedFoot: 14,
      speedWitcher: 22,
      speedBoat: 0,
      costMod: 1.8,
      danger: 'Высокая (лешие, скоя’таэли, волчьи стаи)',
      desc: 'Вековые чащи без дорог, коряги и буреломы. Лошади продвигаются с трудом только шагом.'
    },
    swamp: {
      id: 'swamp',
      name: 'Топкие болота и трясины',
      icon: '🌫️',
      speedHorse: 10,
      speedFoot: 9,
      speedWitcher: 16,
      speedBoat: 14,
      costMod: 2.4,
      danger: 'Смертельная (утопцы, водные бабы, туманники, болотный газ)',
      desc: 'Коварные топи Велена или Ангрена. Лошадь вязнет по брюхо, пеший идет по пояс в зловонной жиже.'
    },
    mountain: {
      id: 'mountain',
      name: 'Горные перевалы и скалы',
      icon: '⛰️',
      speedHorse: 12,
      speedFoot: 11,
      speedWitcher: 18,
      speedBoat: 0,
      costMod: 2.2,
      danger: 'Очень высокая (гарпии, виверны, камнепады, мороз)',
      desc: 'Крутые скалистые тропы Синих Гор или Махакама. Холодные ветра, обрывы и узкие карнизы.'
    },
    water: {
      id: 'water',
      name: 'Великое Море / Глубокие реки',
      icon: '⛵',
      speedHorse: 0,
      speedFoot: 0,
      speedWitcher: 0,
      speedBoat: 48,
      costMod: 1.0,
      danger: 'Морская (сирены, эхидны, шторма, пираты)',
      desc: 'Морские просторы или полноводные фарватеры рек Понтар и Яруга. Требуется лодка, когг или паром.'
    }
  };

  /* --- БИТОВАЯ МАСКА ОТКРЫТОЙ ВОДЫ И ЗАЛИВОВ (RLE: 288x410, шаг 10px, точность 99%) --- */
  var WI_WATER_RLE = [34,254,34,254,33,255,33,255,33,255,33,255,32,256,31,257,30,258,29,259,29,259,28,260,28,260,28,260,27,261,27,261,27,261,26,262,24,264,22,266,22,266,22,266,22,266,21,267,21,2,2,263,26,262,27,261,20,2,5,261,19,3,4,262,19,4,3,262,18,5,3,262,18,5,2,263,19,3,3,48,1,214,24,48,3,213,24,47,5,212,24,43,10,3,2,206,24,41,18,205,24,37,23,204,26,33,25,23,7,174,26,32,26,22,9,173,26,31,27,22,11,171,26,31,27,21,13,170,26,30,28,18,18,168,25,25,1,5,27,18,23,164,25,20,3,2,2,4,27,18,24,163,24,16,13,1,29,17,25,163,23,16,44,17,26,162,23,16,43,17,27,162,22,17,42,17,29,161,22,17,42,17,29,161,22,17,41,12,35,32,1,128,21,6,3,9,40,12,37,160,21,6,3,8,41,10,39,160,21,5,3,9,42,8,40,160,18,1,3,3,4,9,42,8,41,159,17,3,9,6,1,1,43,7,43,158,16,5,8,6,45,6,45,157,15,5,8,8,45,4,44,159,29,7,46,1,45,160,29,8,90,161,29,8,85,1,2,163,30,7,84,167,31,6,84,167,32,5,82,169,33,4,79,172,34,4,76,174,14,2,18,4,75,175,14,4,18,2,75,175,16,3,95,174,16,3,22,2,71,174,17,4,20,3,70,174,17,4,20,3,70,174,17,4,21,2,68,176,19,3,89,177,38,2,6,1,62,179,103,1,5,179,108,180,108,180,108,180,107,181,106,182,102,1,3,87,1,94,107,181,109,67,5,107,110,65,1,112,111,63,1,113,111,63,1,113,112,61,1,114,112,59,2,115,112,56,1,119,112,55,2,119,113,54,1,120,113,47,3,3,2,120,113,46,2,2,4,121,114,44,2,128,114,43,2,129,114,42,2,130,114,41,2,131,114,40,1,133,109,1,4,30,4,3,3,134,109,1,3,28,4,4,3,136,113,27,2,146,113,26,2,147,113,25,2,148,113,24,2,149,114,18,6,150,121,10,2,155,121,1,6,1,3,156,120,2,2,3,3,158,121,167,114,174,113,42,2,131,113,42,2,131,113,42,2,131,113,175,114,174,115,173,101,3,12,172,101,3,12,172,101,3,12,172,112,1,3,1,2,169,101,1,16,170,100,4,9,3,1,171,99,10,8,3,1,167,98,16,3,171,96,21,4,167,96,192,97,191,97,191,96,192,96,192,94,194,92,196,84,204,82,206,82,206,82,206,82,206,83,6,3,196,101,120,3,64,103,118,3,64,109,112,1,66,112,176,112,176,62,1,47,178,60,1,1,4,41,181,107,137,4,40,62,2,42,136,2,7,2,35,52,2,5,5,42,144,2,36,51,2,2,2,3,4,42,182,61,4,41,120,2,60,53,2,6,4,41,118,3,61,52,3,6,4,42,117,1,63,52,3,7,3,8,2,32,116,2,63,52,3,14,4,1,3,31,114,2,64,52,3,54,113,2,64,52,3,2,2,1,4,8,2,36,111,2,65,72,1,37,110,2,66,32,4,6,3,1,1,11,3,3,3,43,91,3,16,2,66,32,1,2,1,6,1,1,1,1,1,11,9,2,3,38,90,5,9,7,67,32,2,1,8,1,1,1,1,1,6,3,9,2,4,38,89,3,1,12,2,2,69,32,9,1,1,1,1,1,3,1,4,2,10,2,4,38,88,3,4,4,79,31,12,1,1,1,8,3,8,2,3,40,88,2,88,32,1,16,2,6,7,3,2,40,88,2,89,49,1,6,7,47,69,5,12,2,90,54,10,2,5,41,59,13,3,2,99,53,11,49,50,10,15,7,93,54,9,51,48,2,3,5,18,5,93,54,5,56,46,2,125,39,1,14,5,57,44,2,126,38,3,14,3,58,44,2,126,38,3,14,3,58,43,2,127,39,2,15,2,58,42,2,128,35,2,6,1,73,22,4,14,2,129,37,1,1,1,1,2,76,16,15,1,7,130,54,3,63,14,4,6,10,134,55,1,65,6,9,152,53,5,75,155,52,7,57,1,11,160,52,2,3,2,56,2,4,1,4,162,115,1,4,1,3,164,123,165,123,165,123,165,115,2,6,165,123,165,123,165,123,79,2,84,125,77,3,83,126,162,126,162,126,162,126,162,126,162,126,162,126,162,127,161,126,162,125,163,125,163,115,1,9,163,125,163,125,163,123,165,122,166,123,165,115,1,12,160,130,158,133,155,134,154,136,152,130,2,4,152,137,151,137,151,137,151,137,151,137,151,136,152,135,153,133,11,3,141,133,11,4,140,133,12,3,23,2,115,133,155,134,37,3,114,134,38,1,115,134,154,134,32,1,10,1,110,134,31,2,3,1,4,1,1,1,110,134,31,1,9,1,4,1,4,1,102,133,45,1,4,1,1,1,102,133,30,1,2,1,11,2,2,2,104,133,42,1,112,133,155,133,29,2,6,3,115,133,34,1,2,1,1,1,1,2,112,133,38,1,2,2,5,1,106,134,37,2,5,1,1,2,106,136,28,1,123,137,27,1,123,135,153,133,30,2,2,1,120,131,33,1,2,1,23,1,3,1,92,130,58,2,6,1,91,123,64,1,100,123,63,1,12,1,88,124,164,125,163,126,56,2,104,120,2,5,53,1,20,1,86,126,52,1,109,125,163,124,53,1,110,125,52,1,110,125,163,126,49,1,112,127,47,1,113,130,44,1,113,130,158,130,158,131,41,1,115,132,31,5,3,1,116,133,13,1,2,14,6,1,118,134,4,1,149,137,151,132,156,130,158,129,159,128,160,127,161,124,164,123,165,122,166,123,165,123,165,122,166,122,166,122,166,120,168,119,169,119,169,119,169,118,170,118,170,117,171,117,171,117,171,117,171,117,171,117,171,117,171,118,170,118,170,120,168,125,163,128,160,128,160,129,159,134,154,134,154,133,155,133,155,133,155,134,154,135,153,135,153,136,152,136,152,136,152,137,151,138,150,140,148,141,147,143,145,143,145,144,144,144,144,145,143,145,143,145,143,145,143,144,144,143,145,142,146,142,146,143,145,143,145,142,146,142,146,141,147,141,147,141,147,141,147,141,147,142,146,143,145,143,145,145,143,146,142,146,142,146,142,146,142,146,142,145,143,144,144,143,145,141,147,139,149,139,149,139,149,138,150,138,150,137,151,136,152,137,151,137,151,136,152,136,152,135,153,135,153,136,152,140,148,143,44,3,4,3,91,143,52,3,90,144,51,3,90,144,52,3,89,146,33,1,108,147,141,15,10,12,3,108,140,8,67,1,26,46,140,8,94,46,28,1,111,8,94,46,8,1,131,8,94,47,6,3,130,8,94,56,130,8,94,56,15,1,114,8,94,56,15,1,114,9,93,56,12,3,115,9,93,59,8,1,118,9,93,64,122,9,93,63,123,9,93,63,123,9,93,63,123,8,94,63,123,8,94,63,123,8,93,65,122,8,94,64,122,9,93,64,122,8,94,63,123,8,94,61,125,8,94,61,125,8,94,61,125,8,94,61,125,9,93,61,125,10,92,40,4,18,124,10,92,62,124,9,93,62,124,10,92,38,8,16,124,10,92,62,124,9,93,41,2,19,124,9,93,61,125,9,93,61,125,9,72,2,19,61,125,10,5,1,8,77,1,63,123,166,122,168,120,169,119,170,118,170,118,171,117,171,117,171,117];
  var WI_WATER_MASK = null;
  function initWaterMask(){
    if(WI_WATER_MASK) return WI_WATER_MASK;
    var total = 288 * 410;
    var mask = new Uint8Array(total);
    var ptr = 0;
    var val = 1; // старт с открытой воды в точке (0, 0)
    for(var i = 0; i < WI_WATER_RLE.length; i++){
      var len = WI_WATER_RLE[i];
      if(val === 1) mask.fill(1, ptr, ptr + len);
      ptr += len;
      val = val ? 0 : 1;
    }
    WI_WATER_MASK = mask;
    return mask;
  }

  function isPointWater(x, y){
    if(x < 0 || x >= 2880 || y < 0 || y >= 4096) return false;
    var gx = Math.min(287, Math.max(0, Math.floor(x / 10)));
    var gy = Math.min(409, Math.max(0, Math.floor(y / 10)));
    var m = WI_WATER_MASK || initWaterMask();
    return m[gy * 288 + gx] === 1;
  }

  /* --- РЕКИ КОНТИНЕНТА (14 ГЛАВНЫХ ВОДНЫХ АРТЕРИЙ И ПЕРЕПРАВ) --- */
  var WI_MAP_RIVERS = [
    {
      id: 'pontar',
      name: 'Река Понтар',
      crossDelayHours: 10,
      polyline: [
        {x: 1040, y: 1000}, {x: 1170, y: 1025}, {x: 1265, y: 1035},
        {x: 1420, y: 1060}, {x: 1580, y: 1050}, {x: 1750, y: 980},
        {x: 1925, y: 830}, {x: 2150, y: 780}, {x: 2380, y: 740}
      ],
      crossingLocIds: ['novigrad', 'oxenfurt', 'flotsam', 'vergen']
    },
    {
      id: 'yaruga',
      name: 'Река Яруга',
      crossDelayHours: 12,
      polyline: [
        {x: 1220, y: 1793}, {x: 1280, y: 1769}, {x: 1355, y: 1752},
        {x: 1460, y: 1749}, {x: 1580, y: 1734}, {x: 1660, y: 1661},
        {x: 1740, y: 1650}, {x: 1840, y: 1649}, {x: 1940, y: 1667},
        {x: 2025, y: 1585}, {x: 2135, y: 1605}, {x: 2238, y: 1515},
        {x: 2348, y: 1468}, {x: 2482, y: 1462}, {x: 2558, y: 1432},
        {x: 2702, y: 1435}
      ],
      crossingLocIds: ['cintra', 'verden_city', 'dillingen', 'sodden_hill', 'angren_post', 'kagen', 'rivia', 'dillmoor', 'glevitzingen']
    },
    {
      id: 'buina',
      name: 'Река Буина',
      crossDelayHours: 7,
      polyline: [
        {x: 1180, y: 560}, {x: 1310, y: 510}, {x: 1480, y: 505},
        {x: 1690, y: 495}, {x: 1940, y: 420}, {x: 2210, y: 355}, {x: 2320, y: 320}
      ],
      crossingLocIds: ['blaviken', 'ard_carraigh']
    },
    {
      id: 'braa',
      name: 'Река Браа',
      crossDelayHours: 6,
      polyline: [
        {x: 1420, y: 310}, {x: 1515, y: 390}, {x: 1620, y: 470}, {x: 1735, y: 435}
      ],
      crossingLocIds: ['hengfors_city', 'crinfrid', 'craghorn']
    },
    {
      id: 'toina',
      name: 'Река Тоина',
      crossDelayHours: 5,
      polyline: [
        {x: 780, y: 320}, {x: 940, y: 295}, {x: 1125, y: 265}, {x: 1280, y: 240}
      ],
      crossingLocIds: ['lan_exeter', 'aeedd_ginvael']
    },
    {
      id: 'gwenllech',
      name: 'Река Гвенллех (Белая Вода)',
      crossDelayHours: 6,
      polyline: [
        {x: 2210, y: 355}, {x: 2380, y: 310}, {x: 2510, y: 280}, {x: 2595, y: 245}
      ],
      crossingLocIds: ['ard_carraigh', 'kaer_morhen']
    },
    {
      id: 'ina',
      name: 'Река Ина',
      crossDelayHours: 6,
      polyline: [
        {x: 1560, y: 1135}, {x: 1680, y: 1175}, {x: 1735, y: 1380}, {x: 1860, y: 1410}
      ],
      crossingLocIds: ['vizima', 'white_orchard', 'maribor']
    },
    {
      id: 'chotla',
      name: 'Река Чотла (Ина Южная)',
      crossDelayHours: 6,
      polyline: [
        {x: 1415, y: 1580}, {x: 1510, y: 1578}, {x: 1605, y: 1575}, {x: 1665, y: 1440}
      ],
      crossingLocIds: ['col_serrai', 'brugge', 'brenna']
    },
    {
      id: 'ribbon',
      name: 'Река Ленточка (Граница Брокилона)',
      crossDelayHours: 5,
      polyline: [
        {x: 1255, y: 1485}, {x: 1335, y: 1515}, {x: 1425, y: 1530}, {x: 1510, y: 1578}
      ],
      crossingLocIds: ['brokilon', 'brugge']
    },
    {
      id: 'adalatte',
      name: 'Река Адалатте',
      crossDelayHours: 5,
      polyline: [
        {x: 1080, y: 1395}, {x: 1130, y: 1390}, {x: 1275, y: 1370}, {x: 1410, y: 1350}
      ],
      crossingLocIds: ['kerack']
    },
    {
      id: 'dyfne',
      name: 'Река Дифне (Долина Цветов)',
      crossDelayHours: 5,
      polyline: [
        {x: 2150, y: 1090}, {x: 2335, y: 1175}, {x: 2440, y: 1140}, {x: 2560, y: 1110}
      ],
      crossingLocIds: ['vengerberg', 'dol_blathanna']
    },
    {
      id: 'sansretour',
      name: 'Река Сансретур и Блессюр',
      crossDelayHours: 6,
      polyline: [
        {x: 2250, y: 1980}, {x: 2335, y: 2115}, {x: 2420, y: 2180}, {x: 2445, y: 2260}, {x: 2490, y: 2350}
      ],
      crossingLocIds: ['beauclair', 'corvo_bianco', 'castel_ravello']
    },
    {
      id: 'velda',
      name: 'Река Вельда и Сильте',
      crossDelayHours: 8,
      polyline: [
        {x: 1360, y: 2995}, {x: 1580, y: 2880}, {x: 1790, y: 2810}, {x: 1995, y: 3015}, {x: 2180, y: 2960}
      ],
      crossingLocIds: ['stygga_castle', 'claremont', 'maecht_city']
    },
    {
      id: 'alba',
      name: 'Великая Река Альба',
      crossDelayHours: 11,
      polyline: [
        {x: 1580, y: 3890}, {x: 1710, y: 3800}, {x: 1885, y: 3690},
        {x: 2090, y: 3580}, {x: 2295, y: 3480}, {x: 2460, y: 3390}
      ],
      crossingLocIds: ['nilfgaard_city', 'vicovaro_city']
    }
  ];

  /* --- КОРОЛЕВСКИЕ ТРАКТЫ, ГОРНЫЕ ПЕРЕВАЛЫ И МОРСКИЕ ФАРВАТЕРЫ (🛣️ ТРАКТЫ) --- */
  var WI_MAP_ROADS = [
    {
      id: 'pontar_highway',
      name: 'Великий Понтарский тракт',
      kind: 'road',
      pts: [[1170,1025], [1265,1035], [1420,1060], [1615,1125], [1895,870], [1925,830], [2120,960], [2335,1175]]
    },
    {
      id: 'northern_coastal',
      name: 'Северный Приморский тракт',
      kind: 'road',
      pts: [[795,270], [840,440], [1125,265], [1310,510], [1505,805], [1265,1035], [1170,1025]]
    },
    {
      id: 'witcher_trail',
      name: 'Ведьмачья Тропа («Мучильня»)',
      kind: 'pass',
      passLabel: '⛰️ Ущелье Гвенллех',
      pts: [[1895,870], [2320,320], [2555,590], [2595,245]]
    },
    {
      id: 'temerian_royal',
      name: 'Королевский Южный тракт',
      kind: 'road',
      pts: [[1615,1125], [1455,1280], [1735,1380], [1665,1440], [1605,1575], [1530,1695], [1290,1815]]
    },
    {
      id: 'west_coast_road',
      name: 'Тракт Побережья (Сидарис — Керак — Вердэн)',
      kind: 'road',
      pts: [[1170,1025], [1095,1120], [1020,1180], [985,1235], [1240,1230], [1130,1390], [1190,1685], [1290,1815]]
    },
    {
      id: 'mahakam_klamat_pass',
      name: 'Перевал Кламат и Эльскердег',
      kind: 'pass',
      passLabel: '⛰️ Перевал Кламат',
      pts: [[1735,1380], [1835,1090], [2030,1120], [2180,1230], [2255,1415], [2380,1510]]
    },
    {
      id: 'toussaint_theodula_pass',
      name: 'Перевал Теодула и Маллеоре (Амелл)',
      kind: 'pass',
      passLabel: '⛰️ Перевал Теодула',
      pts: [[2255,1415], [2040,1690], [2210,2040], [2310,2075], [2420,2180], [2445,2260]]
    },
    {
      id: 'imperial_south_highway',
      name: 'Великий Имперский тракт (Назаир — Нильфгаард)',
      kind: 'road',
      pts: [[1290,1815], [1580,1985], [1685,2135], [1855,2295], [1675,2565], [1580,2880], [1995,3015], [1955,3255], [2295,3480], [1710,3800]]
    },
    {
      id: 'eastern_desert_trail',
      name: 'Караванный путь Тир Тохар — Корат',
      kind: 'pass',
      passLabel: '⛰️ Ущелье Тир Тохар',
      pts: [[2420,2180], [2110,2420], [2365,2745], [2580,2920], [2680,2790], [2510,3120]]
    },
    {
      id: 'sea_lane_skellige',
      name: 'Морской фарватер Новиград — Скеллиге',
      kind: 'sea',
      pts: [[1170,1025], [960,1140], [790,1340], [660,1475], [595,1590]]
    },
    {
      id: 'sea_lane_cintra_skellige',
      name: 'Морской путь Цинтра — Каэр Трольде',
      kind: 'sea',
      pts: [[595,1590], [645,1715], [940,1780], [1290,1815]]
    },
    {
      id: 'sea_lane_imperial',
      name: 'Южный Океанский маршрут (Цинтра — Альба)',
      kind: 'sea',
      pts: [[1290,1815], [1160,2350], [1390,2980], [1395,3495], [1710,3800]]
    }
  ];

  /* --- МЕСТА СИЛЫ (5 ЗНАКОВ) И ЛОГОВА ЧУДОВИЩ КОНТИНЕНТА (🔮 МЕСТА СИЛЫ И БЕСТИИ) --- */
  var WI_MAP_LORE_HOTSPOTS = [
    /* Места Силы Знаков Ведьмака */
    { id: 'pop_aard_km', kind: 'power', sign: 'Аард', icon: '💨', color: '#38bdf8', name: 'Место Силы: Знак Аард (Пик Каэр Морхена)', x: 2645, y: 215, desc: 'Древний ветреный менгир на ледяном уступе над крепостью Каэр Морхен. Усиливает телекинетическую волну Знака Аард (+1 очко умений).' },
    { id: 'pop_igni_bald', kind: 'power', sign: 'Игни', icon: '🔥', color: '#ef4444', name: 'Место Силы: Знак Игни (Лысая Гора)', x: 1385, y: 1245, desc: 'Пылающий рунный камень у входа в пещеры под корнями дуба на Лысой Горе. Наполняет жилы ведьмака яростью первородного пламени Игни.' },
    { id: 'pop_quen_ orchard', kind: 'power', sign: 'Квен', icon: '🛡️', color: '#fbbf24', name: 'Место Силы: Знак Квен (Кладбище Белого Сада)', x: 1720, y: 1150, desc: 'Камень Силы у старой часовни Белого Сада, охраняемый призраком полуночницы. Укрепляет защитную сферу Знака Квен.' },
    { id: 'pop_yrden_elven', kind: 'power', sign: 'Ирден', icon: '🟣', color: '#c084fc', name: 'Место Силы: Знак Ирден (Эльфийские руины Велена)', x: 1125, y: 1190, desc: 'Подземный эльфийский обелиск рядом с логовом Кейры Мец. Многократно усиливает магические глифы ловушки Ирден.' },
    { id: 'pop_axii_trolde', kind: 'power', sign: 'Аксий', icon: '🌀', color: '#10b981', name: 'Место Силы: Знак Аксий (Бастион Каэр Трольде)', x: 560, y: 1565, desc: 'Монолит древних мореходов у северного бастиона Каэр Трольде. Пробуждает ментальную мощь внушения Знака Аксий.' },
    { id: 'pop_igni_sansretour', kind: 'power', sign: 'Игни', icon: '🔥', color: '#ef4444', name: 'Место Силы: Знак Игни (Виноградники Туссента)', x: 2480, y: 2220, desc: 'Солнечный алтарь эльфов Aen Seidhe в долине Сансретур к востоку от Боклера.' },
    { id: 'pop_aard_locmuinne', kind: 'power', sign: 'Аард', icon: '💨', color: '#38bdf8', name: 'Место Силы: Круг Стихий Лок Муинне', x: 2665, y: 650, desc: 'Высокогорный круг стихий Вранов над амфитеатром Лок Муинне.' },
    { id: 'pop_quen_gedyneith', kind: 'power', sign: 'Квен', icon: '🛡️', color: '#fbbf24', name: 'Место Силы: Знак Квен (Роща Дуба Гединейт)', x: 670, y: 1545, desc: 'Друидский менгир Земли под кроной священного дуба Гединейт на Ард Скеллиг.' },

    /* Знаковые Логова Бестий и Аномалии */
    { id: 'lair_kayran', kind: 'monster', icon: '🐙', color: '#f43f5e', name: 'Логово Кейрана (Затон у Флотзама)', x: 1965, y: 855, desc: 'Затопленные руины эльфийского моста на Понтаре, где засел гигантский мутировавший Кейран. Рекомендация: ловушка Ирден и бомба «Самум».' },
    { id: 'lair_striga', kind: 'monster', icon: '🩸', color: '#dc2626', name: 'Склеп Стрыги (Старая Вызима)', x: 1650, y: 1100, desc: 'Заброшенный дворец посреди болот Старой Вызимы с двойным саркофагом проклятой дочери Фольтеста. Чтобы снять проклятие, нужно продержаться до третьих петухов.' },
    { id: 'lair_dragon', kind: 'monster', icon: '🐉', color: '#f59e0b', name: 'Плато Золотого Дракона (Пустельские Горы)', x: 1775, y: 410, desc: 'Неприступное горное ущелье над рекой Браа, где Золотой Дракон Виллентретенмерт (Борх Три Галки) принял бой за детёныша Саэсентессис.' },
    { id: 'lair_unseen_elder', kind: 'monster', icon: '🦇', color: '#991b1b', name: 'Пещера Скрытого (Старейшина Вампиров)', x: 2495, y: 2335, desc: 'Глубокая пещера над рекой Сансретур, где спит Скрытый — первородный Высший Вампир, стерегущий Врата между мирами со времён Сопряжения Сфер.' },
    { id: 'lair_kraken', kind: 'monster', icon: '🦑', color: '#0ea5e9', name: 'Бездна Кракена и Нагльфара (Великое Море)', x: 845, y: 1495, desc: 'Штормовая впадина между материком и островами Скеллиге, где обитают архисирены, мелюзины и морские змеи.' },
    { id: 'lair_leshen_brokilon', kind: 'monster', icon: '🦌', color: '#22c55e', name: 'Тотемы Древнего Лешего (Чаща Брокилона)', x: 1310, y: 1595, desc: 'Вековая чаща, охраняемая реликтовым Лешим Кернунном. Уязвим к знаку Игни, бомбе «Лунная пыль» и маслу против реликтов.' },
    { id: 'lair_sandworm', kind: 'monster', icon: '🦂', color: '#d97706', name: 'Воронки Гоголоворов (Пустыня Корат)', x: 2630, y: 2975, desc: 'Зыбучие песчаные воронки хищных инсектоидов-гоголоворов и имперских мантикор в сердце пустыни «Сковорода».' }
  ];

  /* Пересечение отрезков (p1-p2) и (p3-p4) */
  function getLineIntersection(p1, p2, p3, p4){
    var d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
    if(Math.abs(d) < 1e-9) return null;
    var t = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
    var u = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
    if(t >= 0 && t <= 1 && u >= 0 && u <= 1){
      return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y), t: t };
    }
    return null;
  }

  /* Проверка пересечения речных русел и городов с переправами */
  function checkSegmentRiverCrossings(p1, p2){
    var crossings = [];
    WI_MAP_RIVERS.forEach(function(r){
      var riverCrossings = [];
      for(var k = 0; k < r.polyline.length - 1; k++){
        var rA = r.polyline[k];
        var rB = r.polyline[k + 1];
        var ix = getLineIntersection(p1, p2, rA, rB);
        if(ix){
          var isDuplicate = riverCrossings.some(function(rc){
            return Math.hypot(rc.ix.x - ix.x, rc.ix.y - ix.y) < 2;
          });
          if(!isDuplicate){
            var relLocs = (r.crossingLocIds || []).map(function(cid){
              return WI_MAP_LOCATIONS.find(function(l){ return l.id === cid; });
            }).filter(Boolean);

            var bestLoc = null, minD = 999999;
            relLocs.forEach(function(l){
              var dIx = Math.hypot(ix.x - l.x, ix.y - l.y);
              var dEnds = Math.min(Math.hypot(p1.x - l.x, p1.y - l.y), Math.hypot(p2.x - l.x, p2.y - l.y));
              var d = Math.min(dIx, dEnds);
              if(d < minD){ minD = d; bestLoc = l; }
            });
            riverCrossings.push({
              river: r,
              ix: ix,
              crossingLoc: bestLoc,
              distToCrossing: minD,
              isCrossing: minD <= 60
            });
          }
        }
      }
      crossings = crossings.concat(riverCrossings);
    });
    return crossings;
  }

  function getTerrainAt(x, y){
    // 1. Окрестности городов и крепостей (радиус 30px) считаются дорогами и безопасными зонами
    if(WI_MAP_LOCATIONS && WI_MAP_LOCATIONS.length){
      for(var li = 0; li < WI_MAP_LOCATIONS.length; li++){
        var loc = WI_MAP_LOCATIONS[li];
        if(Math.hypot(x - loc.x, y - loc.y) <= 30) return WI_TERRAINS.road;
      }
    }

    // 2. Высокоточная растровая маска открытой воды и заливов Великого Моря
    if(isPointWater(x, y)){
      return WI_TERRAINS.water;
    }

    // 3. Болота и трясины (Велен, Ангрен)
    if(x >= 1100 && x <= 1400 && y >= 1150 && y <= 1420) return WI_TERRAINS.swamp;
    if(x >= 1950 && x <= 2350 && y >= 1600 && y <= 1860) return WI_TERRAINS.swamp;

    // 4. Горы и скалистые хребты (Синие Горы, Драконьи, Махакам, Амелл, Тир Тохар)
    if((x >= 2400 && y <= 1450) || (x >= 2520 && y <= 2100)) return WI_TERRAINS.mountain;
    if(y <= 420 && x >= 1500) return WI_TERRAINS.mountain;
    if(x >= 1850 && x <= 2180 && y >= 1220 && y <= 1530) return WI_TERRAINS.mountain;
    if(x >= 1750 && x <= 2350 && y >= 1860 && y <= 2160) return WI_TERRAINS.mountain;
    if(x >= 2500 && y >= 2100 && y <= 3000) return WI_TERRAINS.mountain;
    if(y >= 3920 && x >= 1200 && x <= 2400) return WI_TERRAINS.mountain;

    // 5. Дремучие реликтовые леса (Брокилон, Каэдвенские чащи, Содден)
    if(x >= 1260 && x <= 1500 && y >= 1440 && y <= 1700) return WI_TERRAINS.forest;
    if(x >= 1800 && x <= 2450 && y >= 400 && y <= 750) return WI_TERRAINS.forest;
    if(x >= 1480 && x <= 1780 && y >= 1560 && y <= 1820) return WI_TERRAINS.forest;

    // 6. Королевские тракты, долины и открытые равнины
    if(x >= 1100 && x <= 1800 && y >= 700 && y <= 1120) return WI_TERRAINS.road;
    if(x >= 1450 && x <= 1850 && y >= 1100 && y <= 1360) return WI_TERRAINS.road;
    if(x >= 2320 && x <= 2560 && y >= 2150 && y <= 2400) return WI_TERRAINS.road;
    if(x >= 1550 && x <= 1950 && y >= 3600 && y <= 3880) return WI_TERRAINS.road;

    return WI_TERRAINS.hills;
  }

  function calcFullRoute(points, mode, pace){
    mode = mode || 'horse';
    pace = pace || 'normal';

    var paceConfig = {
      normal: { name: 'Обычный шаг', speedMod: 1.0, hoursPerDay: 8, fatigue: 'Нет', ambushMod: 1.0, desc: 'Переход по 8 часов в сутки с плановыми привалами.' },
      fast: { name: 'Форсированный марш', speedMod: 1.3, hoursPerDay: 12, fatigue: '+1 уровень истощения в сутки', ambushMod: 1.25, desc: 'Быстрый марш по 12 часов. Повышенный расход сил и усталость.' },
      stealth: { name: 'Скрытный / Осторожный шаг', speedMod: 0.7, hoursPerDay: 7, fatigue: 'Нет', ambushMod: 0.45, desc: 'Осторожное передвижение, обход засад и маскировка следов.' }
    };
    var pCfg = paceConfig[pace] || paceConfig.normal;

    if(!points || points.length < 2){
      return {
        points: points || [],
        segments: [],
        totalDist: 0,
        totalDays: 0,
        wholeDays: 0,
        remHours: 0,
        rations: 0,
        campsCount: 0,
        innsCount: 0,
        warnings: ['Кликните по карте или по городам, чтобы поставить первую и последующие точки маршрута.'],
        dominantTerrain: WI_TERRAINS.road,
        mode: mode,
        pace: pace,
        pCfg: pCfg
      };
    }

    var segments = [];
    var totalDist = 0;
    var totalDays = 0;
    var allTerrains = [];
    var warnings = [];
    var hasSwampWarning = false;

    for(var i = 0; i < points.length - 1; i++){
      var p1 = points[i];
      var p2 = points[i + 1];
      var pixelDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      var dist = Math.max(1, Math.round(pixelDist * 0.26));
      totalDist += dist;

      var sampled = [];
      var sampleSteps = [0.1, 0.3, 0.5, 0.7, 0.9];
      for(var s = 0; s < sampleSteps.length; s++){
        var t = sampleSteps[s];
        var sx = p1.x + t * (p2.x - p1.x);
        var sy = p1.y + t * (p2.y - p1.y);
        var ter = getTerrainAt(sx, sy);
        sampled.push(ter);
        allTerrains.push(ter);
      }

      var counts = {};
      sampled.forEach(function(t){ counts[t.id] = (counts[t.id] || 0) + 1; });
      var domTerId = Object.keys(counts).reduce(function(a, b){ return counts[a] >= counts[b] ? a : b; });
      var domTer = WI_TERRAINS[domTerId] || WI_TERRAINS.hills;

      // Проверка пересечения речных русел и городов-переправ
      var riverCrossings = checkSegmentRiverCrossings(p1, p2);
      var usedCrossing = null;
      var wildCrossings = [];

      riverCrossings.forEach(function(rc){
        if(rc.isCrossing){
          if(!usedCrossing) usedCrossing = rc.crossingLoc;
        } else {
          wildCrossings.push(rc);
        }
      });

      var riverDelayHours = 0;
      if(wildCrossings.length > 0 && mode !== 'boat'){
        wildCrossings.forEach(function(wc){
          riverDelayHours += wc.river.crossDelayHours;
          var warnMsg = '🌊 Водная преграда без переправы: «' + wc.river.name + '» (+ ' + wc.river.crossDelayHours + ' ч на переправу вплавь / поиск брода). Ближайший город с переправой: «' + (wc.crossingLoc ? wc.crossingLoc.name : 'город') + '».';
          if(warnings.indexOf(warnMsg) === -1) warnings.push(warnMsg);
        });
      }

      var crossesWater = sampled.some(function(t){ return t.id === 'water'; });
      if(crossesWater && mode !== 'boat'){
        var seaWarn = '⛔ Отрезок [' + (p1.name || ('Точка ' + (i + 1))) + ' ➔ ' + (p2.name || ('Точка ' + (i + 2))) + '] проходит по открытым водам Великого Моря! Пешком или верхом преодолеть море невозможно — переключитесь на «⛵ На лодке» или проложите маршрут по суше.';
        if(warnings.indexOf(seaWarn) === -1) warnings.push(seaWarn);
      }

      var crossesSwamp = sampled.some(function(t){ return t.id === 'swamp'; });
      if(crossesSwamp && !hasSwampWarning){
        warnings.push('🌫️ Путь проходит через зловонные топи (Кривоуховы Топи/Ангрен): высокий риск утопцев и болотного газа!');
        hasSwampWarning = true;
      }

      var segDays = 0;
      var stepDist = dist / sampled.length;
      for(var j = 0; j < sampled.length; j++){
        var st = sampled[j];
        var baseSpeed = 18;
        if(mode === 'horse') baseSpeed = st.speedHorse;
        else if(mode === 'foot') baseSpeed = st.speedFoot;
        else if(mode === 'witcher') baseSpeed = st.speedWitcher;
        else if(mode === 'boat') baseSpeed = st.speedBoat;

        if(baseSpeed <= 0){
          baseSpeed = (mode === 'boat') ? 4 : 5;
        }
        var effectiveSpeed = baseSpeed * pCfg.speedMod;
        segDays += stepDist / effectiveSpeed;
      }

      if(riverDelayHours > 0){
        segDays += (riverDelayHours / pCfg.hoursPerDay);
      }

      totalDays += segDays;

      segments.push({
        index: i + 1,
        fromName: p1.name || ('Точка ' + (i + 1)),
        toName: p2.name || ('Точка ' + (i + 2)),
        dist: dist,
        days: Math.round(segDays * 10) / 10,
        dominantTerrain: domTer,
        crossesWater: crossesWater,
        usedCrossing: usedCrossing,
        wildCrossings: wildCrossings,
        riverDelayHours: riverDelayHours,
        stopType: p2.stopType || 'none'
      });
    }

    var campsCount = 0;
    var innsCount = 0;
    points.forEach(function(pt, idx){
      if(idx > 0 && idx < points.length - 1){
        if(pt.stopType === 'camp') campsCount++;
        if(pt.stopType === 'inn') innsCount++;
      }
    });

    var rationPerDay = (mode === 'horse') ? 2 : 1;
    var totalRations = Math.max(1, Math.ceil(totalDays * rationPerDay));

    var wholeDays = Math.floor(totalDays);
    var remHours = Math.round((totalDays - wholeDays) * pCfg.hoursPerDay);
    if(remHours >= pCfg.hoursPerDay){
      wholeDays += 1;
      remHours = 0;
    }

    var allCounts = {};
    allTerrains.forEach(function(t){ allCounts[t.id] = (allCounts[t.id] || 0) + 1; });
    var overallDomId = Object.keys(allCounts).length ? Object.keys(allCounts).reduce(function(a, b){ return allCounts[a] >= allCounts[b] ? a : b; }) : 'road';

    return {
      points: points,
      segments: segments,
      totalDist: totalDist,
      totalDays: totalDays,
      wholeDays: wholeDays,
      remHours: remHours,
      rations: totalRations,
      campsCount: campsCount,
      innsCount: innsCount,
      warnings: warnings,
      dominantTerrain: WI_TERRAINS[overallDomId] || WI_TERRAINS.road,
      mode: mode,
      pace: pace,
      pCfg: pCfg
    };
  }

  var WI_ROUTE_PRESETS = {
    novi_vizima: [
      { id: 'wp_novigrad', name: 'Новиград', x: 1170, y: 1025, stopType: 'inn' },
      { id: 'wp_oxenfurt', name: 'Оксенфурт', x: 1265, y: 1035, stopType: 'inn' },
      { id: 'wp_bridge_redlob', name: 'Редлобский мост (Понтар)', x: 1420, y: 1060, stopType: 'camp' },
      { id: 'wp_vizima', name: 'Вызима', x: 1615, y: 1125, stopType: 'camp' }
    ],
    vizima_km: [
      { id: 'wp_vizima', name: 'Вызима', x: 1615, y: 1125, stopType: 'inn' },
      { id: 'wp_flotsam', name: 'Флотзам (Понтар)', x: 1925, y: 830, stopType: 'camp' },
      { id: 'wp_ban_ard', name: 'Бан Ард (Школа Магии)', x: 2390, y: 490, stopType: 'inn' },
      { id: 'wp_gwenllech', name: 'Река Гвенллех (Перевал)', x: 2510, y: 340, stopType: 'camp' },
      { id: 'wp_kaer_morhen', name: 'Каэр Морхен', x: 2595, y: 245, stopType: 'camp' }
    ],
    oxen_toussaint: [
      { id: 'wp_oxenfurt', name: 'Оксенфурт', x: 1265, y: 1035, stopType: 'inn' },
      { id: 'wp_mahakam', name: 'Махакам (Горный проход)', x: 1980, y: 1380, stopType: 'camp' },
      { id: 'wp_jaruga', name: 'Переправа через Яругу', x: 2050, y: 1780, stopType: 'camp' },
      { id: 'wp_amell', name: 'Перевал Амелл (Горгона)', x: 2280, y: 2060, stopType: 'camp' },
      { id: 'wp_beauclair', name: 'Боклер (Туссент)', x: 2420, y: 2180, stopType: 'inn' },
      { id: 'wp_corvo', name: 'Корво Бьянко', x: 2445, y: 2260, stopType: 'inn' }
    ],
    novi_skellige: [
      { id: 'wp_novi_port', name: 'Новиград (Главный причал)', x: 1150, y: 1020, stopType: 'inn' },
      { id: 'wp_great_sea', name: 'Великое Море (Открытый фарватер)', x: 880, y: 1240, stopType: 'ferry' },
      { id: 'wp_an_skellig', name: 'Остров Ан Скеллиг', x: 740, y: 1480, stopType: 'camp' },
      { id: 'wp_kaer_trolde', name: 'Каэр Трольде (Пристань)', x: 595, y: 1590, stopType: 'inn' }
    ]
  };

  var WI_MAP_PRESETS = [
    { from: 'novigrad', to: 'vizima', dist: 130, daysHorse: 3, daysFoot: 7, desc: 'Королевский тракт через реку Понтар. Оживленный торговый путь с частыми корчмами, патрулями реданцев и темерцев.' },
    { from: 'vizima', to: 'white_orchard', dist: 45, daysHorse: 1, daysFoot: 3, desc: 'Короткий переход на восток к цветущим садам, речным мельницам и нильфгаардскому гарнизону.' },
    { from: 'novigrad', to: 'oxenfurt', dist: 35, daysHorse: 1, daysFoot: 2, desc: 'Оживленная речная дорога вдоль Понтара между вольным торговым портом и университетским городком.' },
    { from: 'novigrad', to: 'crows_perch', dist: 95, daysHorse: 2, daysFoot: 5, desc: 'Путь на юг через переправу на реке Понтар в топкие болота Велена к замку Кровавого Барона.' },
    { from: 'vizima', to: 'kaer_morhen', dist: 480, daysHorse: 13, daysFoot: 26, desc: 'Долгий и суровый путь в Синие Горы Каэдвена через глухие леса, переправу через Гвенллех и горные перевалы.' },
    { from: 'oxenfurt', to: 'beauclair', dist: 560, daysHorse: 15, daysFoot: 30, desc: 'Грандиозный переход на юг через долину Яруги, Содден и перевалы Амелл в сказочный солнечный Туссент.' },
    { from: 'novigrad', to: 'kaer_trolde', dist: 390, daysHorse: 7, daysFoot: 15, desc: 'Морской переход из порта Новиграда через коварное Великое Море на суровый архипелаг Скеллиге.' },
    { from: 'vizima', to: 'cintra', dist: 240, daysHorse: 6, daysFoot: 12, desc: 'Южный тракт к устью Яруги через земли Соддена и Бругге в приморское королевство Цинтра.' },
    { from: 'flotsam', to: 'loc_muinne', dist: 320, daysHorse: 8, daysFoot: 17, desc: 'Сложный переход вдоль русла Понтара на восток к заброшенной эльфской твердыне в Синих Горах.' },
    { from: 'beauclair', to: 'corvo_bianco', dist: 15, daysHorse: 1, daysFoot: 1, desc: 'Живописная прогулка верхом на Плотве среди цветущих холмов Туссента прямо в уютное поместье Геральта.' }
  ];

  function getRouteDetails(fromId, toId){
    var preset = WI_MAP_PRESETS.find(function(p){
      return (p.from === fromId && p.to === toId) || (p.from === toId && p.to === fromId);
    });
    if(preset) return preset;

    var p1 = WI_MAP_LOCATIONS.find(function(l){ return l.id === fromId; });
    var p2 = WI_MAP_LOCATIONS.find(function(l){ return l.id === toId; });
    if(!p1 || !p2){
      return { dist: 100, daysHorse: 3, daysFoot: 6, desc: 'Пользовательский маршрут по дорогам Континента.' };
    }
    var pixelDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    var dist = Math.max(10, Math.round(pixelDist * 0.26));
    var daysHorse = Math.max(1, Math.round(dist / 35));
    var daysFoot = Math.max(1, Math.round(dist / 16));
    return {
      dist: dist,
      daysHorse: daysHorse,
      daysFoot: daysFoot,
      desc: 'Прямой континентальный переход из «' + p1.name + '» в «' + p2.name + '» (' + dist + ' миль).'
    };
  }

  var WI_MAP_ENCOUNTERS_BY_TERRAIN = {
    swamp: [
      { title: '🧟 Водная баба в затопленной низине', desc: 'Среди зловонной тины и коряг подстерегает жирная Водная баба в окружении пяти утопцев, швыряющая комья ядовитой болотной грязи.' },
      { title: '🌫️ Туманники на старой гати', desc: 'Внезапный густой туман с запахом гнили скрывает дорогу. В дымке вспыхивают блуждающие огоньки — засада туманников, использующих иллюзии.' },
      { title: '🐊 Ослизг над гнилыми топями', desc: 'Огромный болотный драконид пикирует из серых облаков на обоз. Его ядовитый шип на хвосте готов пробить любые латы.' },
      { title: '🕯️ Игоша у заброшенной избы', desc: 'Жуткий детский плач доносится из-под порога сгоревшей хаты в болотах. Неупокоенный дух может быть расколдован или уничтожен.' }
    ],
    mountain: [
      { title: '🦅 Стая гарпий на скальном карнизе', desc: 'Визжащие гарпии атакуют с высоты, пытаясь сбросить путников в пропасть и забрать блестящие амулеты и серебро.' },
      { title: '🐉 Вилохвост у горного перевала', desc: 'Чешуйчатый вилохвост устроил гнездо прямо над горной тропой. Проход заблокирован, если не одолеть чудовище.' },
      { title: '🪨 Внезапный камнепад и обвал', desc: 'Грохот раскалывает тишину ущелья! Огромные валуны катятся вниз по склону. Нужна проверка ловкости (DC 14), чтобы спасти коней и груз.' },
      { title: '❄️ Ледяная буря на высоте', desc: 'Свирепый ветер и снежная крупа сбивают с ног. Видимость падает до 5 шагов, температура стремительно падает. Требуется срочный поиск пещеры.' }
    ],
    forest: [
      { title: '🌲 Древний Леший на священной поляне', desc: 'Вековые сосны скрипят и смыкают ветви. Двухметровый Леший с оленьим черепом вместо головы насылает стаю матерых волков и стаи воронья.' },
      { title: '🏹 Засада скоя’таэлей («Белок»)', desc: 'С ветвей свистят стрелы с серыми перьями. Эльфский отряд скоя’таэлей окружает тропу, требуя сложить оружие и отдать провиант на нужды партизан.' },
      { title: '🐺 Стая бешеных варгов', desc: 'Семеро волков во главе с гигантским черным варгом берут отряд в полукольцо, отрезая путь к отступлению.' },
      { title: '🔮 Круг стихий и друидский менгир', desc: 'Древний каменный монолит пульсирует магической энергией. Ведьмак может восстановить запас энергии и усилить Знаки на 24 часа.' }
    ],
    road: [
      { title: '⚔️ Застава дезертиров и «Ганзы»', desc: 'Шайка бывших солдат перегородила тракт срубленными деревьями и требует 30 новиградских крон «подорожного сбора».' },
      { title: '🍺 Переполненная корчма «Под дубом»', desc: 'Уютный очаг, горячая похлебка, махакамский эль и доска объявлений с новым контрактом на полуденницу на пшеничном поле.' },
      { title: '🛡️ Разъезд королевской стражи', desc: 'Конный патруль проверяет подорожные грамоты и осматривает мешки в поисках контрабанды фисстеха и нильфгаардских шпионов.' },
      { title: '🛒 Сломанная повозка купца', desc: 'Краснолюдский купец с перевернутой телегой просит помощи с починкой колеса и готов щедро отплатить редкой рудой или серебряными слитками.' }
    ],
    water: [
      { title: '🧜‍♀️ Стая сирен и эхидн у рифов', desc: 'Очаровательное пение оборачивается яростным нападением крылатых морских бестий, рвущих паруса и пытающихся опрокинуть судно.' },
      { title: '🏴‍☠️ Драккар пиратов Скеллиге', desc: 'Быстроходный драккар под черным парусом настигает лодку. Суровые островитяне предлагают решить дело поединком капитанов или мечами.' },
      { title: '🌪️ Морской шквал и водоворот', desc: 'Темные свинцовые волны захлестывают борт. Мачта трещит под напором ветра, а впереди пенится коварный рифовый водоворот.' }
    ],
    hills: [
      { title: '👻 Полуденница над колосьями', desc: 'В полуденный зной над золотым холмом мерцает полупрозрачный призрак невесты. Палящее солнце слепит глаза, а в воздухе звенит траурная песнь.' },
      { title: '🐗 Разъяренный секач', desc: 'Огромный дикий вепрь вылетает из кустарника прямо под копыта коня, рискуя покалечить скакуна.' },
      { title: '⛪ Заброшенное святилище Мелитэле', desc: 'Осыпавшийся алтарь богини плодородия, где можно набрать целебных трав и спокойно передохнуть без риска нападения чудовищ.' }
    ]
  };

  function getRandomEncounterForRoute(routeCalc){
    var terId = (routeCalc && routeCalc.dominantTerrain && routeCalc.dominantTerrain.id) || 'road';
    var pool = WI_MAP_ENCOUNTERS_BY_TERRAIN[terId] || WI_MAP_ENCOUNTERS_BY_TERRAIN.road;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  var WI_MAP_ENCOUNTERS = WI_MAP_ENCOUNTERS_BY_TERRAIN.road;

  /* Расширение методов WI */
  WI.techs = [];
  WI.moves = [];
  WI.techFilter = 'all';
  WI.techSearch = '';
  WI.moveFilter = 'all';
  WI.moveSearch = '';
  WI.map = {
    mode: 'inspect',
    zoom: 1.1,
    cx: 1440,
    cy: 1200,
    selectedLocId: 'novigrad',
    selectedRegionId: null,
    selectedHotspotId: null,
    userMarkers: [],
    selectedMarkerId: null,
    editingMarkerId: null,
    placingMarkerCoords: null,
    routePoints: [],
    travelMode: 'horse',
    travelPace: 'normal',
    routeFrom: 'novigrad',
    routeTo: 'vizima',
    showLabels: true,
    showPins: true,
    showTerritories: false,
    showRivers: false,
    showRoads: false,
    showLoreLayer: false,
    showMinimap: true,
    measureMode: false,
    measurePoints: [],
    showUserMarkers: true,
    regionFilter: 'all',
    typeFilter: 'all',
    fullscreen: false,
    encounter: null,
    activeContract: null,
    customWildLoc: null,
    boardLoaded: false,
    boardContracts: {},
    boardSelectedContractId: null,
    boardBuilderOpen: false,
    boardCfgTab: null,
    boardType: 'monster',
    boardMonsterClass: 'auto',
    boardRewardTier: 'standard',
    boardDifficulty: 'medium',
    boardDepth: 'detailed',
    boardTwist: 'random',
    boardCurrency: 'auto',
    boardPrompt: '',
    boardLoading: false,
    atlasFilterCollapsed: true,
    sidebarBelow: false,
    search: '',
    tacticsLoaded: false,
    tacticsTool: 'pan',
    tacticsTab: 'units',
    selectedUnitIdx: -1,
    unitFactionFilter: 'all',
    regionSearch: '',
    battleAttackerIdx: 0,
    battleDefenderIdx: 1,
    battleLog: [],
    aiWarReport: '',
    isAnimatingMarch: false,
    warNation: 'nilfgaard',
    brushSize: 48,
    unitType: 'army',
    warPaths: [],
    tacticalUnits: [],
    territoryOwners: {}
  };

  var WI_BOARD_STORAGE_KEY = 'wi_board_contracts_v1';

  WI.loadBoardContracts = function(){
    if(WI.map.boardLoaded) return;
    WI.map.boardLoaded = true;
    try {
      var raw = localStorage.getItem(WI_BOARD_STORAGE_KEY);
      if(raw){
        var parsed = JSON.parse(raw);
        if(parsed && typeof parsed === 'object'){
          WI.map.boardContracts = parsed;
        }
      }
    } catch(e){}
  };

  WI.saveBoardContracts = function(){
    try {
      localStorage.setItem(WI_BOARD_STORAGE_KEY, JSON.stringify(WI.map.boardContracts || {}));
    } catch(e){}
  };

  function getWiCurrencyForLoc(loc, pref){
    if(pref && pref !== 'auto'){
      var mapC = {
        crowns: 'новиградских крон',
        orens: 'темерских оренов',
        florens: 'нильфгаардских флоренов',
        bizants: 'ковирских бизантов',
        barter: 'крон + редкий дар / Право Неожиданности'
      };
      return mapC[pref] || 'крон';
    }
    var rk = loc ? loc.regionKey : 'temeria';
    if(rk === 'redania' || rk === 'skellige' || rk === 'toussaint') return 'новиградских крон';
    if(rk === 'nilfgaard') return 'нильфгаардских флоренов';
    if(rk === 'kovir') return 'ковирских бизантов';
    return 'темерских оренов';
  }

  function generateWiRandomBoardContract(loc, opts){
    opts = opts || {};
    loc = loc || WI_MAP_LOCATIONS[0];
    var enc = getWiLocationEncyclopedia(loc);
    var ter = (typeof getTerrainAt === 'function') ? getTerrainAt(loc.x, loc.y) : { id: 'forest', name: 'Лес' };
    var shortLoc = loc.name.split(' (')[0];
    var cType = opts.type || WI.map.boardType || 'monster';
    var mClass = opts.monsterClass || WI.map.boardMonsterClass || 'auto';
    var rTier = opts.rewardTier || WI.map.boardRewardTier || 'standard';
    var diff = opts.difficulty || WI.map.boardDifficulty || 'medium';
    var depth = opts.depth || WI.map.boardDepth || 'detailed';
    var twistKey = opts.twist || WI.map.boardTwist || 'random';
    var curr = getWiCurrencyForLoc(loc, opts.currency || WI.map.boardCurrency || 'auto');
    var userNote = (opts.prompt || WI.map.boardPrompt || '').trim();

    var rewardBase = 260;
    var haggleExtra = 65;
    var haggleDc = 14;
    if(rTier === 'poor'){ rewardBase = 55 + Math.floor(Math.random() * 55); haggleExtra = 20; haggleDc = 12; }
    else if(rTier === 'standard'){ rewardBase = 210 + Math.floor(Math.random() * 190); haggleExtra = 60; haggleDc = 14; }
    else if(rTier === 'generous'){ rewardBase = 520 + Math.floor(Math.random() * 360); haggleExtra = 140; haggleDc = 16; }
    else if(rTier === 'royal'){ rewardBase = 1350 + Math.floor(Math.random() * 1150); haggleExtra = 350; haggleDc = 18; }

    var diffLabels = {
      low: '🟢 Низкая (Ур. 1–4)',
      medium: '🟡 Средняя (Ур. 5–9)',
      hard: '🟠 Высокая (Ур. 10–14)',
      deadly: '🔴 Смертельная / Архибестия (Ур. 15+)'
    };
    var typeLabels = {
      monster: '🐺 Охота на чудовище',
      curse: '🕯️ Снятие проклятия',
      missing: '🔍 Поиск пропавших / Расследование',
      escort: '🛡️ Охрана и зачистка тракта',
      alchemy: '🧪 Добыча редкого мутагена',
      bounty: '⚔️ Контракт на головорезов / нелюдей'
    };

    var classMonsters = {
      necrophages: [
        { name: 'Древняя кладбищенская баба «Плакальщица»', cls: 'Трупоеды', prep: 'Масло против трупоедов, эликсир «Чёрная кровь», Знак Ирден и Квен, бомба «Лунная пыль»', clues: 'Разрытые могилы у околицы, запах формалина и тухлого сала, следы длинного раздвоенного языка на камнях.' },
        { name: 'Матёрый альгуль-вожак стаи', cls: 'Трупоеды', prep: 'Масло против трупоедов, Знак Аксий (сбить шипы со спины), эликсир «Гром»', clues: 'Изглоданные кости обозных лошадей, глубокие борозды от когтей в промёрзшей глине.' },
        { name: 'Старый туманник «Блуждающий Огонёк»', cls: 'Трупоеды', prep: 'Масло против трупоедов, бомба «Лунная пыль», Знак Квен и Ирден', clues: 'Холодный густой туман даже в безветрие, тела жертв со свёрнутыми шеями у болотных кочек.' }
      ],
      specters: [
        { name: 'Полуночница «Невеста в Пепле»', cls: 'Призраки', prep: 'Масло против призраков, ловушка Знака Ирден (обязательно для материализации), бомба «Лунная пыль»', clues: 'Выжженный круг травы у старой мельницы, обрывки фаты на колючках и ледяной шёпот после заката.' },
        { name: 'Моровая дева (Химора)', cls: 'Призраки', prep: 'Масло против призраков, Знак Ирден, эликсир «Иволга» от трупного яда и крысиных стай', clues: 'Внезапный мор скота, полчища крыс и запах цветущей бузины посреди гнили.' },
        { name: 'Кающийся (Призрак маяка)', cls: 'Призраки', prep: 'Масло против призраков, Знак Ирден, зажжённые жаровни для ослабления тумана', clues: 'Неестественный мрак, рунические знаки покаяния на дверях и следы цепей.' }
      ],
      relicts: [
        { name: 'Древний леший «Хозяин Чащи»', cls: 'Реликты', prep: 'Масло против реликтов, Знак Игни, бомба «Двимеритовая» и «Танцующая звезда», уничтожить тотемы в лесу', clues: 'Тотемы из оленьих черепов и вороньих перьев, корни деревьев, пробившие грудь лесорубов.' },
        { name: 'Матёрый бес «Чернорог»', cls: 'Реликты', prep: 'Масло против реликтов, бомба «Чёртов гриб», эликсир «Кошка» против гипноза третьего глаза', clues: 'Поваленные вековые сосны, огромные раздвоенные копыта и запах мускуса.' },
        { name: 'Водная ведьма и прибожек в болотах', cls: 'Реликты', prep: 'Масло против реликтов, Знак Квен и Игни, бомба «Северный ветер»', clues: 'Следы перепончатых лап у колодца, пропавшие дети и заговорённые куклы из соломы.' }
      ],
      vampires: [
        { name: 'Коварная брукса в руинах усадьбы', cls: 'Вампиры', prep: 'Масло против вампиров, эликсир «Чёрная кровь», Знак Ирден и бомба «Лунная пыль» против невидимости', clues: 'Обескровленные тела без единой капли крови вокруг, два аккуратных прокола на шее и пение по ночам.' },
        { name: 'Старый катакан из винных подвалов', cls: 'Вампиры', prep: 'Масло против вампиров, «Чёрная кровь», Знак Игни, серебряная картечь', clues: 'Запах дорогого вина и старой крови в коллекторах, разорванная стража ночного дозора.' }
      ],
      draconids: [
        { name: 'Королевская виверна с лазурным гребнем', cls: 'Дракониды', prep: 'Масло против драконидов, эликсир «Иволга» (нейтрализует яд), арбалет для сбивания в полёте, Знак Аард', clues: 'Огромное гнездо из костей скота на скальном уступе, едкий запах серы и чешуя.' },
        { name: 'Пещерный василиск «Сереброглаз»', cls: 'Дракониды', prep: 'Масло против драконидов, «Золотая иволга», бомба «Картечь», Знак Квен', clues: 'Почерневшие от нейротоксина тела рудокопов и характерный куриный клёкот в темноте штольни.' }
      ],
      hybrids: [
        { name: 'Королевский архигрифон', cls: 'Гибриды', prep: 'Масло против гибридов, Знак Аард, арбалетные болты с широким наконечником (кровотечение), эликсир «Гром»', clues: 'Обезглавленные туши быков, белые маховые перья длиной в локоть на верхушках сосен.' },
        { name: 'Стая морских эхидн и сирен', cls: 'Гибриды', prep: 'Масло против гибридов, рог Хорнвалла или Знак Аард и Игни', clues: 'Разбитые о скалы баркасы и обрывки парусов, затянутые в прибрежные гроты.' }
      ],
      cursed: [
        { name: 'Волколак-альфа «Кровавый Клык»', cls: 'Проклятые', prep: 'Масло против проклятых, бомба «Лунная пыль» и «Чёртов гриб» (блокируют регенерацию!), Знак Игни', clues: 'Следы волчьих лап, переходящие в босые человеческие ступни у ручья, клочья бурой шерсти.' },
        { name: 'Проклятый медведь-берсерк (Ульфхеднар)', cls: 'Проклятые', prep: 'Масло против проклятых, Знак Квен и Игни, эликсир «Пурга»', clues: 'Развороченные дубовые двери склада, следы медвежьих когтей и обрывки кольчуги.' }
      ],
      insectoids: [
        { name: 'Королева эндриаг и кладка коконов', cls: 'Инсектоиды', prep: 'Масло против инсектоидов, эликсир «Золотая иволга», Знак Игни и «Танцующая звезда» для сжигания коконов', clues: 'Липкая паутина между деревьями, высосанные панцири кабанов и щёлканье жвал в чаще.' },
        { name: 'Гигантский панцирный главоглаз', cls: 'Инсектоиды', prep: 'Масло против инсектоидов, Знак Ирден и Аксий, удары с фланга по брюху', clues: 'Растворённые кислотной слюной доспехи стражников и глубокие норы в песчанике.' }
      ],
      ogroids: [
        { name: 'Скальный тролль-мостовик «Громобой»', cls: 'Огроиды', prep: 'Масло против огроидов, Знак Квен (или мирные переговоры и загадка!), удары со спины', clues: 'Нагромождение валунов поперёк дороги, котёл с варевом из сапог и костей.' },
        { name: 'Стая подземных накеров-воинов', cls: 'Огроиды', prep: 'Масло против огроидов, бомба «Самум» или «Картечь» для уничтожения гнезда, эликсир «Кошка»', clues: 'Десятки узких лазов в склоне холма, украденные блестящие вещи и мелкие трёхпалые следы.' }
      ],
      elementa: [
        { name: 'Древний голем-страж руин', cls: 'Элементали', prep: 'Масло против магических тварей, бомба «Двимеритовая», Знак Квен, тяжёлые силовые удары', clues: 'Оплавленные рунические плиты, гул земли при каждом шаге и раздробленные в пыль скелеты расхитителей.' }
      ],
      beasts: [
        { name: 'Шайка дезертиров и «белок» с ручным варгом', cls: 'Люди и Звери', prep: 'Масло «Яд повешенного» на стальной меч, Знак Аксий и Игни, бомба «Самум»', clues: 'Костровища у тракта, оперённые беличьими хвостами стрелы в стволах дубов.' }
      ]
    };

    var chosenClassKey = mClass;
    if(!chosenClassKey || chosenClassKey === 'auto' || !classMonsters[chosenClassKey]){
      if(cType === 'curse') chosenClassKey = (Math.random() < 0.5 ? 'cursed' : 'specters');
      else if(cType === 'bounty') chosenClassKey = 'beasts';
      else if(ter.id === 'swamp') chosenClassKey = 'necrophages';
      else if(ter.id === 'mountain') chosenClassKey = (Math.random() < 0.5 ? 'draconids' : 'ogroids');
      else if(ter.id === 'sea') chosenClassKey = 'hybrids';
      else {
        var keys = ['necrophages', 'specters', 'relicts', 'vampires', 'draconids', 'hybrids', 'cursed', 'insectoids'];
        chosenClassKey = keys[Math.floor(Math.random() * keys.length)];
      }
    }
    var mList = classMonsters[chosenClassKey] || classMonsters.necrophages;
    var pickedM = mList[Math.floor(Math.random() * mList.length)];

    var twistsPool = {
      monster_innocent: 'Чудовище не нападало первым — оно защищает свой выводок или древнее святилище от браконьеров старосты. Ведьмак может пощадить его и договориться.',
      client_lying: 'Заказчик скрыл, что жертвы погибли от рук контрабандистов, а на чудовище лишь свалили вину, чтобы избавиться от свидетелей.',
      double_monster: 'В логове помимо заявленной твари скрывается куда более опасный хищник, привлечённый запахом свежей крови.',
      curse_love: 'Чудовище — результат проклятия отвергнутой любви или предательства в семье заказчика; проклятие можно снять без убийства, проведя ритуал в полночь.',
      straight: 'Классическая и беспощадная ведьмачья охота: бестия умна, устроила засаду в своём логове и не пойдёт ни на какие уговоры.'
    };
    if(!twistKey || twistKey === 'random' || !twistsPool[twistKey]){
      var tKeys = Object.keys(twistsPool);
      twistKey = tKeys[Math.floor(Math.random() * tKeys.length)];
    }
    var twistText = twistsPool[twistKey];

    var clients = [
      'Войт и старейшины («' + shortLoc + '»)',
      'Комендант гарнизона в «' + shortLoc + '»',
      'Купеческий старшина из «' + shortLoc + '»',
      'Местный травник и смотритель погоста',
      'Вдова лесоруба и община «' + shortLoc + '»'
    ];
    var clientName = clients[Math.floor(Math.random() * clients.length)];

    var titleStr = 'Заказ: Бестия у «' + shortLoc + '»';
    if(cType === 'curse') titleStr = 'Заказ: Проклятие в окрестностях «' + shortLoc + '»';
    else if(cType === 'missing') titleStr = 'Заказ: Пропавшие без вести у «' + shortLoc + '»';
    else if(cType === 'escort') titleStr = 'Заказ: Кровавый тракт близ «' + shortLoc + '»';
    else if(cType === 'alchemy') titleStr = 'Заказ: Редкий мутаген из «' + shortLoc + '»';
    else if(cType === 'bounty') titleStr = 'Заказ: Охота за головами у «' + shortLoc + '»';
    if(userNote){
      titleStr = 'Заказ: ' + (userNote.length > 48 ? userNote.slice(0, 48) + '…' : userNote);
    }

    var noticeBody = '«Люди добрые и милсдари ведьмаки! В окрестностях «' + shortLoc + '» (' + loc.region + ') объявилась лютая напасть. ' +
      (userNote ? ('Особая примета дела: ' + userNote + '. ') : ('Уж который день пропадают люди у кромки леса и старого тракта. ')) +
      'Кто возьмётся извести сию пакость мечом иль знахарством и принесёт трофей в доказательство — тому от общины честная плата звонкой монетой!»';

    var phasesList = [
      '1. Опрос заказчика (' + clientName + ') и торг о цене (Проверка Харизмы / Запугивания СЛ ' + haggleDc + ').',
      '2. Осмотр места нападения с Ведьмачьим Чутьём (СЛ 13 Выживание / Восприятие) и определение класса бестии.',
      '3. Подготовка эликсиров, масел и приманки у костра перед входом в логово.',
      '4. Решающая схватка или проведение ритуала снятия проклятия в логове.'
    ];
    if(depth === 'short'){
      phasesList = [phasesList[0], phasesList[3]];
    }

    return {
      id: 'wbc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      locId: loc.id,
      locName: loc.name,
      title: titleStr,
      type: cType,
      typeLabel: typeLabels[cType] || typeLabels.monster,
      difficulty: diffLabels[diff] || diffLabels.medium,
      client: clientName,
      reward: rewardBase + ' ' + curr,
      haggleMax: (rewardBase + haggleExtra) + ' ' + curr + ' (СЛ торга ' + haggleDc + ')',
      monster: pickedM.name + (userNote ? ' — ' + userNote : ''),
      monsterClass: pickedM.cls,
      noticeText: noticeBody,
      clues: pickedM.clues + (enc.monsters ? (' В этих краях также встречаются: ' + enc.monsters + '.') : ''),
      prep: pickedM.prep,
      phases: phasesList,
      twist: twistText,
      isAi: false,
      createdAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };
  }

  function getWiBoardContractsForLoc(loc){
    WI.loadBoardContracts();
    loc = loc || WI_MAP_LOCATIONS[0];
    var lid = loc.id || 'novigrad';
    if(!WI.map.boardContracts[lid] || !WI.map.boardContracts[lid].length){
      var c1 = generateWiRandomBoardContract(loc, { type: 'monster', rewardTier: 'standard', difficulty: 'medium', prompt: '' });
      var c2 = generateWiRandomBoardContract(loc, { type: 'curse', rewardTier: 'generous', difficulty: 'hard', prompt: '' });
      c2.id = c1.id + '_b';
      WI.map.boardContracts[lid] = [c1, c2];
      WI.saveBoardContracts();
    }
    return WI.map.boardContracts[lid];
  }

  function callGeminiWiContractGenerator(loc, opts, apiKey, onDone){
    loc = loc || WI_MAP_LOCATIONS[0];
    opts = opts || {};
    var enc = getWiLocationEncyclopedia(loc);
    var ter = (typeof getTerrainAt === 'function') ? getTerrainAt(loc.x, loc.y) : { id: 'forest', name: 'Лес' };
    var curr = getWiCurrencyForLoc(loc, opts.currency || WI.map.boardCurrency || 'auto');

    var sysPrompt = 'Ты — сценарист квестов и мастер настольной ролевой игры по вселенной «Ведьмак» (Анджей Сапковский / The Witcher 3: Wild Hunt).\n' +
      'Сгенерируй колоритный, проработанный ведьмачий заказ для доски объявлений конкретной локации Континента.\n' +
      'Верни СТРОГО валидный JSON-объект (без markdown-обёрток вне JSON) со следующими полями:\n' +
      '{\n' +
      '  "title": "Атмосферное название заказа (например: Заказ: Хозяин Шепчущей Чащи)",\n' +
      '  "typeLabel": "Категория заказа с эмодзи",\n' +
      '  "difficulty": "Сложность и рекомендуемый уровень",\n' +
      '  "client": "Имя и должность заказчика в этой локации",\n' +
      '  "reward": "Базовая награда в валюте региона",\n' +
      '  "haggleMax": "Максимальная награда при успешном торге (с указанием СЛ Харизмы) и возможный доп. трофей",\n' +
      '  "monster": "Точное название бестии, проклятия или противника (с уникальным прозвищем)",\n' +
      '  "monsterClass": "Класс бестии по ведьмачьему бестиарию (Реликты, Призраки, Вампиры, Трупоеды, Гибриды, Дракониды, Проклятые и т.д.)",\n' +
      '  "noticeText": "Аутентичный текст объявления на пергаменте от лица заказчика (просторечный крестьянский говор, купеческая грамота или воинский приказ — в зависимости от локации)",\n' +
      '  "clues": "Улики для Ведьмачьего Чутья (запахи, следы, раны жертв, зацепки на месте преступления со СЛ проверок)",\n' +
      '  "prep": "Подготовка ведьмака: необходимые масла, эликсиры, отвары, ведьмачьи Знаки и бомбы",\n' +
      '  "phases": ["Этап 1...", "Этап 2...", "Этап 3...", "Этап 4..."],\n' +
      '  "twist": "Неожиданный сюжетный поворот, моральная дилемма в духе «меньшего зла» Сапковского или секрет логова"\n' +
      '}';

    var userMsg = 'ЛОКАЦИЯ НА КАРТЕ: ' + loc.name + ' (' + loc.region + ', координаты [' + loc.x + ', ' + loc.y + '], рельеф: ' + ter.name + ')\n' +
      'ЛОР ЛОКАЦИИ: ' + (loc.desc || '') + '\n' +
      'ПРАВИТЕЛЬ: ' + (loc.ruler || '—') + ' | НАСЕЛЕНИЕ: ' + enc.pop + ' | КОРЧМА: ' + enc.inn + '\n' +
      'МЕСТНЫЕ ЧУДОВИЩА: ' + enc.monsters + ' | СЛУХИ: ' + enc.rumors + '\n\n' +
      'ПАРАМЕТРЫ ЗАКАЗА ОТ ПОЛЬЗОВАТЕЛЯ:\n' +
      '- Тип контракта: ' + (opts.type || WI.map.boardType) + '\n' +
      '- Желаемый класс бестии: ' + (opts.monsterClass || WI.map.boardMonsterClass) + '\n' +
      '- Уровень оплаты: ' + (opts.rewardTier || WI.map.boardRewardTier) + ' (Валюта: ' + curr + ')\n' +
      '- Сложность охоты: ' + (opts.difficulty || WI.map.boardDifficulty) + '\n' +
      '- Глубина проработки: ' + (opts.depth || WI.map.boardDepth) + '\n' +
      '- Сюжетный поворот / Мораль: ' + (opts.twist || WI.map.boardTwist) + '\n' +
      '- ПОЖЕЛАНИЯ / ОПИСАНИЕ ОТ ИГРОКА: ' + ((opts.prompt || WI.map.boardPrompt || '').trim() || 'Полная свобода в рамках лора этой локации!') + '\n\n' +
      'Сгенерируй JSON ведьмачьего заказа на русском языке.';

    if(typeof window.requestGeminiGenerateContent !== 'function'){
      onDone(new Error('Модуль ИИ Gemini недоступен'), null);
      return;
    }

    window.requestGeminiGenerateContent({
      apiKey: apiKey,
      systemInstruction: { parts: [{ text: sysPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMsg }] }],
      generationConfig: {
        temperature: 0.85,
        responseMimeType: 'application/json'
      }
    }).then(function(resp){
      var rawText = '';
      try {
        rawText = resp.data.candidates[0].content.parts.map(function(p){ return p.text || ''; }).join('');
      } catch(e){}
      var parsed = (typeof window.extractJsonFromAi === 'function') ? window.extractJsonFromAi(rawText) : null;
      if(!parsed){
        try { parsed = JSON.parse(rawText); } catch(e2){}
      }
      if(!parsed || typeof parsed !== 'object'){
        onDone(new Error('Не удалось распознать ответ ИИ. Попробуйте ещё раз.'), null);
        return;
      }
      var fallback = generateWiRandomBoardContract(loc, opts);
      var contract = {
        id: 'wbc_ai_' + Date.now(),
        locId: loc.id,
        locName: loc.name,
        title: parsed.title || fallback.title,
        type: opts.type || WI.map.boardType || 'monster',
        typeLabel: parsed.typeLabel || fallback.typeLabel,
        difficulty: parsed.difficulty || fallback.difficulty,
        client: parsed.client || fallback.client,
        reward: parsed.reward || fallback.reward,
        haggleMax: parsed.haggleMax || fallback.haggleMax,
        monster: parsed.monster || fallback.monster,
        monsterClass: parsed.monsterClass || fallback.monsterClass,
        noticeText: parsed.noticeText || fallback.noticeText,
        clues: parsed.clues || fallback.clues,
        prep: parsed.prep || fallback.prep,
        phases: Array.isArray(parsed.phases) && parsed.phases.length ? parsed.phases : fallback.phases,
        twist: parsed.twist || fallback.twist,
        isAi: true,
        createdAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      };
      onDone(null, contract);
    }).catch(function(err){
      onDone(err || new Error('Ошибка сети при обращении к Gemini API'), null);
    });
  }


  WI.loadTacticalState = function(){
    try {
      var raw = localStorage.getItem(WI_TACTICAL_KEY);
      if(raw){
        var d = JSON.parse(raw);
        if(d && typeof d === 'object'){
          var hasAutoBrenna = Array.isArray(d.tacticalUnits) && d.tacticalUnits.some(function(u){ return u && u.id === 'sw1'; }) && !d.explicitUserSave;
          if(hasAutoBrenna){
            localStorage.removeItem(WI_TACTICAL_KEY);
            WI.map.warPaths = [];
            WI.map.tacticalUnits = [];
            WI.map.territoryOwners = {};
            WI.map.battleLog = [];
          } else {
            if(Array.isArray(d.warPaths)) WI.map.warPaths = d.warPaths;
            if(Array.isArray(d.tacticalUnits)) WI.map.tacticalUnits = d.tacticalUnits;
            if(d.territoryOwners && typeof d.territoryOwners === 'object') WI.map.territoryOwners = d.territoryOwners;
            if(Array.isArray(d.battleLog)) WI.map.battleLog = d.battleLog;
          }
        }
      }
    } catch(e){}
    WI.map.tacticsLoaded = true;
  };

  WI.saveTacticalState = function(){
    try {
      var d = {
        explicitUserSave: true,
        warPaths: WI.map.warPaths || [],
        tacticalUnits: WI.map.tacticalUnits || [],
        territoryOwners: WI.map.territoryOwners || {},
        battleLog: (WI.map.battleLog || []).slice(0, 25)
      };
      localStorage.setItem(WI_TACTICAL_KEY, JSON.stringify(d));
    } catch(e){}
  };

  WI.loadTechs = function(){
    var act = WI.getActiveProfile();
    if(act){
      if(!Array.isArray(act.techs)) act.techs = [];
      act.techs = act.techs.filter(function(t){ return t && (!OLD_DEFAULT_TECH_IDS || OLD_DEFAULT_TECH_IDS.indexOf(t.id) === -1); });
      act.techs.forEach(function(t, idx){
        if(t && !t.id) t.id = 'wi_tech_' + Date.now() + '_' + idx;
      });
      WI.techs = act.techs;
      return WI.techs;
    }
    WI.techs = [];
    return WI.techs;
  };

  WI.saveTechs = function(){
    var currentTechs = Array.isArray(WI.techs) ? WI.techs : [];
    var act = WI.getActiveProfile();
    WI.techs = currentTechs;
    if(act){
      act.techs = currentTechs;
    }
    WI.saveProfiles();
  };

  WI.getTechById = function(id){
    WI.loadTechs();
    return (WI.techs || []).find(function(t){ return t && String(t.id) === String(id); });
  };

  WI.deleteTech = function(id){
    if(id == null) return;
    WI.loadTechs();
    var targetId = String(id);
    WI.techs = (WI.techs || []).filter(function(t){ return t && String(t.id) !== targetId; });
    WI.saveTechs();
  };

  WI.loadMoves = function(){
    var act = WI.getActiveProfile();
    if(act){
      if(!Array.isArray(act.moves)) act.moves = [];
      act.moves = act.moves.filter(function(m){ return m && (!OLD_DEFAULT_MOVE_IDS || OLD_DEFAULT_MOVE_IDS.indexOf(m.id) === -1); });
      act.moves.forEach(function(m, idx){
        if(m && !m.id) m.id = 'wi_move_' + Date.now() + '_' + idx;
      });
      WI.moves = act.moves;
      return WI.moves;
    }
    WI.moves = [];
    return WI.moves;
  };

  WI.saveMoves = function(){
    var currentMoves = Array.isArray(WI.moves) ? WI.moves : [];
    var act = WI.getActiveProfile();
    WI.moves = currentMoves;
    if(act){
      act.moves = currentMoves;
    }
    WI.saveProfiles();
  };

  WI.getMoveById = function(id){
    WI.loadMoves();
    return (WI.moves || []).find(function(m){ return m && String(m.id) === String(id); });
  };

  WI.deleteMove = function(id){
    if(id == null) return;
    WI.loadMoves();
    var targetId = String(id);
    WI.moves = (WI.moves || []).filter(function(m){ return m && String(m.id) !== targetId; });
    WI.saveMoves();
  };

  WI.loadUserMarkers = function(){
    try {
      var raw = localStorage.getItem(WI_MARKERS_KEY);
      if(raw){
        var arr = JSON.parse(raw);
        if(Array.isArray(arr)){
          WI.map.userMarkers = arr;
          return arr;
        }
      }
    } catch(e){}
    WI.map.userMarkers = [];
    return [];
  };

  WI.saveUserMarkers = function(){
    try {
      localStorage.setItem(WI_MARKERS_KEY, JSON.stringify(WI.map.userMarkers || []));
    } catch(e){}
  };

  WI.loadRoute = function(){
    try {
      var raw = localStorage.getItem(WI_ROUTE_KEY);
      if(raw){
        var data = JSON.parse(raw);
        if(data && Array.isArray(data.points)){
          // Очищаем старые тестовые точки-заглушки (Новиград, Оксенфурт, Вызима, Понтар и т.д.)
          data.points = data.points.filter(function(p){
            return p && p.id && !p.id.startsWith('wp_novi') && !p.id.startsWith('wp_oxen') && !p.id.startsWith('wp_vizi') && !p.id.startsWith('wp_pontar');
          });
          WI.map.routePoints = data.points;
          if(data.travelMode) WI.map.travelMode = data.travelMode;
          if(data.travelPace) WI.map.travelPace = data.travelPace;
          return data;
        }
      }
    } catch(e){}

    WI.map.routePoints = [];
    WI.map.travelMode = 'horse';
    WI.map.travelPace = 'normal';
    return { points: [], travelMode: 'horse', travelPace: 'normal' };
  };

  WI.saveRoute = function(){
    try {
      var data = {
        points: WI.map.routePoints || [],
        travelMode: WI.map.travelMode || 'horse',
        travelPace: WI.map.travelPace || 'normal'
      };
      localStorage.setItem(WI_ROUTE_KEY, JSON.stringify(data));
    } catch(e){}
  };

  /* Общий переключатель вкладок Способности / Приёмы + быстрый выбор профиля */
  function renderWiAbilitiesTabBar(activeTab){
    var act = WI.getActiveProfile() || {};
    var profOpts = (WI.profiles || []).map(function(prof){
      var sel = (prof.id === WI.activeProfileId) ? 'selected' : '';
      return '<option value="' + escA(prof.id) + '" ' + sel + '>👤 ' + esc(prof.name || 'Безымянный') + (prof.class ? (' (' + esc(prof.class) + ')') : '') + '</option>';
    }).join('');

    return '<div class="wi-nav-tabs" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:18px;border-bottom:1px solid var(--wi-border);padding-bottom:10px;">' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button class="wi-nav-tab ' + (activeTab === 'techs' ? 'active' : '') + '" data-nav="wiTechs" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechs\');">✨ Способности и Магия (' + ((act.techs && act.techs.length) || 0) + ')</button>' +
        '<button class="wi-nav-tab ' + (activeTab === 'moves' ? 'active' : '') + '" data-nav="wiMoves" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoves\');">⚔️ Боевые приёмы (' + ((act.moves && act.moves.length) || 0) + ')</button>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:8px;">' +
        '<span style="font-size:11.5px;color:var(--wi-steel);font-family:\'JetBrains Mono\',monospace;">Профиль:</span>' +
        '<select class="wi-input" data-wi-quick-profile-select style="width:auto;min-width:180px;padding:5px 10px;font-size:12.5px;border-color:rgba(245,158,11,0.35);color:#fbbf24;font-weight:600;">' +
          profOpts +
        '</select>' +
      '</div>' +
    '</div>';
  }

  /* Экран СПОСОБНОСТИ (wiTechs) */
  function wiTechs(){
    WI.loadTechs();
    var list = WI.techs || [];

    var curFilter = WI.techFilter || 'all';
    var curSearch = (WI.techSearch || '').toLowerCase().trim();

    var categories = ['Все', 'Знаки ведьмака', 'Магия Хаоса', 'Мутации', 'Воинские дары', 'Бардовские дары'];

    var filterPills = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:12px 0;">' +
      categories.map(function(cat){
        var key = (cat === 'Все' ? 'all' : cat);
        var active = curFilter === key;
        return '<button class="wi-pill ' + (active ? 'active' : '') + '" data-wi-tech-filter="' + escA(key) + '">' + esc(cat) + '</button>';
      }).join('') +
    '</div>';

    var filtered = list.filter(function(t){
      if(curFilter !== 'all' && t.cat !== curFilter) return false;
      if(curSearch){
        var str = (t.name + ' ' + (t.desc || '') + ' ' + (t.cat || '') + ' ' + (t.req || '')).toLowerCase();
        if(str.indexOf(curSearch) === -1) return false;
      }
      return true;
    });

    var cards = filtered.map(function(t){
      var dmgStr = (t.dmgN ? (t.dmgN + t.dmgD + (t.dmgMod ? ('+' + t.dmgMod) : '')) : (t.dmgMod ? ('+' + t.dmgMod) : ''));
      return '<div class="wi-ref-card wi-tech-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">' +
        '<div>' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
            '<div class="wi-ref-card-k" style="margin-bottom:0;">' + (t.icon || '✨') + ' ' + esc(t.name) + '</div>' +
            '<span class="wi-ref-item-tag" style="font-size:10px;">' + esc(t.cat || 'Способность') + '</span>' +
          '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:11.5px;color:var(--wi-steel);margin-bottom:6px;">' +
            (t.cost ? '<span style="background:rgba(245,158,11,0.1);padding:2px 6px;border-radius:3px;color:#fbbf24;">⚡ ' + esc(t.cost) + '</span>' : '') +
            (t.req ? '<span style="background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:3px;">📜 ' + esc(t.req) + '</span>' : '') +
            (dmgStr ? '<span style="background:rgba(239,68,68,0.12);padding:2px 6px;border-radius:3px;color:#fca5a5;">💥 ' + esc(dmgStr) + '</span>' : '') +
          '</div>' +
          '<div class="wi-ref-card-v" style="font-size:12.5px;line-height:1.45;">' + esc(t.desc || '') + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);">' +
          '<button class="btn btn-ghost" data-nav="wiTechView:' + escA(t.id) + '" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechView:' + escA(t.id) + '\');" style="font-size:11px;padding:3px 8px;">Подробнее</button>' +
          '<button class="btn btn-ghost" data-nav="wiTechEdit:' + escA(t.id) + '" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechEdit:' + escA(t.id) + '\');" style="font-size:11px;padding:3px 8px;" title="Редактировать">✏️</button>' +
          '<button class="btn btn-ghost" data-wi-del-tech="' + escA(t.id) + '" style="font-size:11px;padding:3px 8px;color:#ef4444;" title="Удалить из ростера">🗑️</button>' +
        '</div>' +
      '</div>';
    }).join('');

    return crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Способности' }]) +
      '<button class="back" data-nav="wiHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiHome\');">← Назад</button>' +
      renderWiAbilitiesTabBar('techs') +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
        '<div>' +
          '<h1 style="margin-bottom:4px;">✨ Способности и Магия</h1>' +
          '<div class="desc" style="margin-bottom:0;">Знаки ведьмаков, магия Хаоса чародеев, мутации профессора Моро и расовые дары Континента.</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button class="btn btn-primary" data-nav="wiTechEdit:new" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechEdit:new\');">➕ Новая способность</button>' +
          '<button class="btn btn-ghost" data-nav="wiTechGen" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechGen\');" style="color:#fbbf24;border-color:rgba(245,158,11,0.4);">✨ AI Генератор</button>' +
        '</div>' +
      '</div>' +
      '<div class="wi-ref-search-wrap" style="margin-top:10px;">' +
        '<span class="wi-ref-search-icon">🔍</span>' +
        '<input type="text" id="wiTechSearch" class="wi-ref-search-input" placeholder="Поиск по способностям, магии и мутациям..." value="' + escA(WI.techSearch || '') + '">' +
      '</div>' +
      filterPills +
      '<div class="wi-ref-cards-grid" style="margin-top:14px;">' +
        (cards || '<div class="char-empty" style="grid-column:1/-1;text-align:center;padding:36px 16px;">' +
          '<div style="font-size:32px;margin-bottom:8px;">✨</div>' +
          '<div style="font-weight:700;font-size:15px;color:#fff;margin-bottom:6px;">Список способностей пуст</div>' +
          '<div style="font-size:13px;color:var(--wi-steel);max-width:420px;margin:0 auto 16px;">Создайте собственную способность вручную или сгенерируйте её через AI Генератор.</div>' +
          '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" data-nav="wiTechEdit:new" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechEdit:new\');">➕ Добавить способность</button>' +
            '<button class="btn btn-ghost" data-nav="wiTechGen" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechGen\');" style="color:#fbbf24;border-color:rgba(245,158,11,0.4);">✨ AI Генератор способностей</button>' +
          '</div>' +
        '</div>') +
      '</div>';
  }

  /* Просмотр способности (wiTechView) */
  function wiTechView(id){
    var t = WI.getTechById(id);
    if(!t) return wiTechs();

    var dmgStr = (t.dmgN ? (t.dmgN + t.dmgD + (t.dmgMod ? ('+' + t.dmgMod) : '')) : (t.dmgMod ? ('+' + t.dmgMod) : '—'));

    return crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Способности', nav: 'wiTechs' }, { label: t.name }]) +
      '<button class="back" data-nav="wiTechs" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechs\');">← К способностям</button>' +
      '<div class="wi-ref-box">' +
        '<div class="wi-ref-header">' +
          '<div class="wi-ref-header-top">' +
            '<div class="wi-ref-title-wrap">' +
              '<h1>' + (t.icon || '✨') + ' ' + esc(t.name) + '</h1>' +
              '<span class="wi-ref-header-badge">' + esc(t.cat || 'Способность') + '</span>' +
            '</div>' +
            '<div style="display:flex;gap:8px;">' +
              '<button class="btn btn-primary" data-nav="wiTechEdit:' + escA(t.id) + '" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechEdit:' + escA(t.id) + '\');">✏️ Изменить</button>' +
              '<button class="btn btn-ghost" id="wiTechDeleteBtn" data-tech-id="' + escA(t.id) + '" style="color:#ef4444;">🗑️ Удалить</button>' +
            '</div>' +
          '</div>' +
          '<div class="wi-ref-lead">' + esc(t.desc || '') + '</div>' +
        '</div>' +
        '<div class="wi-ref-cards-grid">' +
          '<div class="wi-ref-card">' +
            '<div class="wi-ref-card-k">⚡ Затраты энергии / маны</div>' +
            '<div class="wi-ref-card-v">' + esc(t.cost || 'Нет затрат / пассивно') + '</div>' +
          '</div>' +
          '<div class="wi-ref-card">' +
            '<div class="wi-ref-card-k">📜 Требования</div>' +
            '<div class="wi-ref-card-v">' + esc(t.req || 'Доступно всем') + '</div>' +
          '</div>' +
          '<div class="wi-ref-card">' +
            '<div class="wi-ref-card-k">💥 Формула урона / эффекта</div>' +
            '<div class="wi-ref-card-v">' + esc(dmgStr) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* Редактор / создание способности (wiTechEdit) */
  function wiTechEdit(id){
    var isNew = (id === 'new' || !id);
    var t = isNew ? { id: 'wi_tech_' + Date.now(), name: '', icon: '✨', cat: 'Знаки ведьмака', cost: '10 Выносливости', req: '', dmgN: 0, dmgD: 'd6', dmgMod: 0, desc: '' } : (WI.getTechById(id) || {});

    var cats = ['Знаки ведьмака', 'Магия Хаоса', 'Мутации', 'Воинские дары', 'Бардовские дары', 'Общие'];
    var catOpts = cats.map(function(c){
      return '<option value="' + escA(c) + '" ' + (t.cat === c ? 'selected' : '') + '>' + esc(c) + '</option>';
    }).join('');

    return crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Способности', nav: 'wiTechs' }, { label: isNew ? 'Новая способность' : 'Правка' }]) +
      '<button class="back" data-nav="wiTechs" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechs\');">← Отмена</button>' +
      '<h1>' + (isNew ? '➕ Создание способности' : ('✏️ ' + esc(t.name))) + '</h1>' +
      '<div class="wi-char-sheet-card" style="margin-top:16px;">' +
        '<div class="wi-edit-grid">' +
          '<div class="wi-edit-item">' +
            '<label>Название способности</label>' +
            '<input type="text" id="wiEdTechName" class="wi-input" value="' + escA(t.name || '') + '" placeholder="Знак Игни / Огненный шар">' +
          '</div>' +
          '<div class="wi-edit-item">' +
            '<label>Иконка (эмодзи)</label>' +
            '<input type="text" id="wiEdTechIcon" class="wi-input" value="' + escA(t.icon || '✨') + '" placeholder="🔥">' +
          '</div>' +
          '<div class="wi-edit-item">' +
            '<label>Категория</label>' +
            '<select id="wiEdTechCat" class="wi-input">' + catOpts + '</select>' +
          '</div>' +
          '<div class="wi-edit-item">' +
            '<label>Затраты (энергия / мана / отдыха)</label>' +
            '<input type="text" id="wiEdTechCost" class="wi-input" value="' + escA(t.cost || '') + '" placeholder="10 Выносливости">' +
          '</div>' +
          '<div class="wi-edit-item">' +
            '<label>Требования (класс, раса, уровень)</label>' +
            '<input type="text" id="wiEdTechReq" class="wi-input" value="' + escA(t.req || '') + '" placeholder="Ведьмак / Чародей">' +
          '</div>' +
          '<div class="wi-edit-item">' +
            '<label>Кубы урона (кол-во, тип, бонус)</label>' +
            '<div style="display:flex;gap:6px;">' +
              '<input type="number" id="wiEdTechDmgN" class="wi-input" style="width:70px;" value="' + escA(t.dmgN || 0) + '">' +
              '<select id="wiEdTechDmgD" class="wi-input" style="width:80px;"><option value="d0">d0</option><option value="d4" '+(t.dmgD==='d4'?'selected':'')+'>d4</option><option value="d6" '+(t.dmgD==='d6'?'selected':'')+'>d6</option><option value="d8" '+(t.dmgD==='d8'?'selected':'')+'>d8</option><option value="d10" '+(t.dmgD==='d10'?'selected':'')+'>d10</option><option value="d12" '+(t.dmgD==='d12'?'selected':'')+'>d12</option></select>' +
              '<input type="number" id="wiEdTechDmgMod" class="wi-input" style="width:70px;" value="' + escA(t.dmgMod || 0) + '">' +
            '</div>' +
          '</div>' +
          '<div class="wi-edit-item" style="grid-column:1/-1;">' +
            '<label>Описание эффекта, механики и лора</label>' +
            '<textarea id="wiEdTechDesc" class="wi-input" rows="4" placeholder="Подробное описание применения...">' + esc(t.desc || '') + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap;">' +
          (!isNew ? '<button class="btn btn-ghost" id="wiEdTechDelBtn" data-tech-id="' + escA(t.id) + '" style="color:#ef4444;margin-right:auto;">🗑️ Удалить</button>' : '') +
          '<button class="btn btn-ghost" data-nav="wiTechs" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechs\');">Отмена</button>' +
          '<button class="btn btn-primary" id="wiEdTechSaveBtn" data-tech-id="' + escA(t.id) + '">💾 Сохранить способность</button>' +
        '</div>' +
      '</div>';
  }

  /* Экран БОЕВЫЕ ПРИЁМЫ (wiMoves) */
  function wiMoves(){
    WI.loadMoves();
    var list = WI.moves || [];

    var curFilter = WI.moveFilter || 'all';
    var curSearch = (WI.moveSearch || '').toLowerCase().trim();

    var kinds = ['Все', 'Фехтование', 'Защита и парирование', 'Тактические приёмы', 'Стрельба'];

    var filterPills = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:12px 0;">' +
      kinds.map(function(k){
        var key = (k === 'Все' ? 'all' : k);
        var active = curFilter === key;
        return '<button class="wi-pill ' + (active ? 'active' : '') + '" data-wi-move-filter="' + escA(key) + '">' + esc(k) + '</button>';
      }).join('') +
    '</div>';

    var filtered = list.filter(function(m){
      if(curFilter !== 'all' && m.kind !== curFilter) return false;
      if(curSearch){
        var str = (m.name + ' ' + (m.desc || '') + ' ' + (m.kind || '') + ' ' + (m.trigger || '')).toLowerCase();
        if(str.indexOf(curSearch) === -1) return false;
      }
      return true;
    });

    var cards = filtered.map(function(m){
      return '<div class="wi-ref-card wi-move-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">' +
        '<div>' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
            '<div class="wi-ref-card-k" style="margin-bottom:0;">' + (m.icon || '⚔️') + ' ' + esc(m.name) + '</div>' +
            '<span class="wi-ref-item-tag" style="font-size:10px;">' + esc(m.kind || 'Приём') + '</span>' +
          '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:11.5px;color:var(--wi-steel);margin-bottom:6px;">' +
            (m.action ? '<span style="background:rgba(245,158,11,0.1);padding:2px 6px;border-radius:3px;color:#fbbf24;">⚡ ' + esc(m.action) + '</span>' : '') +
            (m.trigger ? '<span style="background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:3px;">🎯 ' + esc(m.trigger) + '</span>' : '') +
          '</div>' +
          '<div class="wi-ref-card-v" style="font-size:12.5px;line-height:1.45;">' + esc(m.desc || '') + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);">' +
          '<button class="btn btn-ghost" data-nav="wiMoveView:' + escA(m.id) + '" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoveView:' + escA(m.id) + '\');" style="font-size:11px;padding:3px 8px;">Подробнее</button>' +
          '<button class="btn btn-ghost" data-nav="wiMoveEdit:' + escA(m.id) + '" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoveEdit:' + escA(m.id) + '\');" style="font-size:11px;padding:3px 8px;" title="Редактировать">✏️</button>' +
          '<button class="btn btn-ghost" data-wi-del-move="' + escA(m.id) + '" style="font-size:11px;padding:3px 8px;color:#ef4444;" title="Удалить из ростера">🗑️</button>' +
        '</div>' +
      '</div>';
    }).join('');

    return crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Боевые приёмы' }]) +
      '<button class="back" data-nav="wiHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiHome\');">← Назад</button>' +
      renderWiAbilitiesTabBar('moves') +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
        '<div>' +
          '<h1 style="margin-bottom:4px;">⚔️ Боевые приёмы и Тактика</h1>' +
          '<div class="desc" style="margin-bottom:0;">Стили фехтования («Мельница», силовой разрез), пируэты, парирование, рипост и тактические маневры.</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button class="btn btn-primary" data-nav="wiMoveEdit:new" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoveEdit:new\');">➕ Новый приём</button>' +
          '<button class="btn btn-ghost" data-nav="wiMoveGen" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoveGen\');" style="color:#fbbf24;border-color:rgba(245,158,11,0.4);">⚔️ AI Генератор</button>' +
        '</div>' +
      '</div>' +
      '<div class="wi-ref-search-wrap" style="margin-top:10px;">' +
        '<span class="wi-ref-search-icon">🔍</span>' +
        '<input type="text" id="wiMoveSearch" class="wi-ref-search-input" placeholder="Поиск по боевым приёмам, стилям и защите..." value="' + escA(WI.moveSearch || '') + '">' +
      '</div>' +
      filterPills +
      '<div class="wi-ref-cards-grid" style="margin-top:14px;">' +
        (cards || '<div class="char-empty" style="grid-column:1/-1;text-align:center;padding:36px 16px;">' +
          '<div style="font-size:32px;margin-bottom:8px;">⚔️</div>' +
          '<div style="font-weight:700;font-size:15px;color:#fff;margin-bottom:6px;">Список боевых приёмов пуст</div>' +
          '<div style="font-size:13px;color:var(--wi-steel);max-width:420px;margin:0 auto 16px;">Создайте собственный боевой приём вручную или сгенерируйте его через AI Генератор.</div>' +
          '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" data-nav="wiMoveEdit:new" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoveEdit:new\');">➕ Добавить приём</button>' +
            '<button class="btn btn-ghost" data-nav="wiMoveGen" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoveGen\');" style="color:#fbbf24;border-color:rgba(245,158,11,0.4);">⚔️ AI Генератор приёмов</button>' +
          '</div>' +
        '</div>') +
      '</div>';
  }

  /* Просмотр приёма (wiMoveView) */
  function wiMoveView(id){
    var m = WI.getMoveById(id);
    if(!m) return wiMoves();

    return crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Приёмы', nav: 'wiMoves' }, { label: m.name }]) +
      '<button class="back" data-nav="wiMoves" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoves\');">← К приёмам</button>' +
      '<div class="wi-ref-box">' +
        '<div class="wi-ref-header">' +
          '<div class="wi-ref-header-top">' +
            '<div class="wi-ref-title-wrap">' +
              '<h1>' + (m.icon || '⚔️') + ' ' + esc(m.name) + '</h1>' +
              '<span class="wi-ref-header-badge">' + esc(m.kind || 'Приём') + '</span>' +
            '</div>' +
            '<div style="display:flex;gap:8px;">' +
              '<button class="btn btn-primary" data-nav="wiMoveEdit:' + escA(m.id) + '" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoveEdit:' + escA(m.id) + '\');">✏️ Изменить</button>' +
              '<button class="btn btn-ghost" id="wiMoveDeleteBtn" data-move-id="' + escA(m.id) + '" style="color:#ef4444;">🗑️ Удалить</button>' +
            '</div>' +
          '</div>' +
          '<div class="wi-ref-lead">' + esc(m.desc || '') + '</div>' +
        '</div>' +
        '<div class="wi-ref-cards-grid">' +
          '<div class="wi-ref-card">' +
            '<div class="wi-ref-card-k">⚡ Тип действия</div>' +
            '<div class="wi-ref-card-v">' + esc(m.action || 'Действие') + '</div>' +
          '</div>' +
          '<div class="wi-ref-card">' +
            '<div class="wi-ref-card-k">🎯 Условие / Триггер</div>' +
            '<div class="wi-ref-card-v">' + esc(m.trigger || 'В любой момент своего хода') + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* Редактор приёма (wiMoveEdit) */
  function wiMoveEdit(id){
    var isNew = (id === 'new' || !id);
    var m = isNew ? { id: 'wi_move_' + Date.now(), name: '', icon: '⚔️', kind: 'Фехтование', action: 'Основное действие', trigger: '', desc: '' } : (WI.getMoveById(id) || {});

    var kinds = ['Фехтование', 'Защита и парирование', 'Тактические приёмы', 'Стрельба', 'Рукопашный бой'];
    var kindOpts = kinds.map(function(k){
      return '<option value="' + escA(k) + '" ' + (m.kind === k ? 'selected' : '') + '>' + esc(k) + '</option>';
    }).join('');

    return crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Приёмы', nav: 'wiMoves' }, { label: isNew ? 'Новый приём' : 'Правка' }]) +
      '<button class="back" data-nav="wiMoves" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoves\');">← Отмена</button>' +
      '<h1>' + (isNew ? '➕ Создание боевого приёма' : ('✏️ ' + esc(m.name))) + '</h1>' +
      '<div class="wi-char-sheet-card" style="margin-top:16px;">' +
        '<div class="wi-edit-grid">' +
          '<div class="wi-edit-item">' +
            '<label>Название приёма</label>' +
            '<input type="text" id="wiEdMoveName" class="wi-input" value="' + escA(m.name || '') + '" placeholder="«Мельница» / Рипост">' +
          '</div>' +
          '<div class="wi-edit-item">' +
            '<label>Иконка (эмодзи)</label>' +
            '<input type="text" id="wiEdMoveIcon" class="wi-input" value="' + escA(m.icon || '⚔️') + '" placeholder="🌪️">' +
          '</div>' +
          '<div class="wi-edit-item">' +
            '<label>Категория / Стиль</label>' +
            '<select id="wiEdMoveKind" class="wi-input">' + kindOpts + '</select>' +
          '</div>' +
          '<div class="wi-edit-item">' +
            '<label>Тип действия</label>' +
            '<input type="text" id="wiEdMoveAction" class="wi-input" value="' + escA(m.action || 'Основное действие') + '" placeholder="Действие / Бонусное / Реакция">' +
          '</div>' +
          '<div class="wi-edit-item" style="grid-column:1/-1;">' +
            '<label>Триггер / Условие применения</label>' +
            '<input type="text" id="wiEdMoveTrigger" class="wi-input" value="' + escA(m.trigger || '') + '" placeholder="После парирования удара / При окружении врагами">' +
          '</div>' +
          '<div class="wi-edit-item" style="grid-column:1/-1;">' +
            '<label>Описание приёма и механический эффект</label>' +
            '<textarea id="wiEdMoveDesc" class="wi-input" rows="4" placeholder="Подробное описание действия...">' + esc(m.desc || '') + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap;">' +
          (!isNew ? '<button class="btn btn-ghost" id="wiEdMoveDelBtn" data-move-id="' + escA(m.id) + '" style="color:#ef4444;margin-right:auto;">🗑️ Удалить</button>' : '') +
          '<button class="btn btn-ghost" data-nav="wiMoves" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoves\');">Отмена</button>' +
          '<button class="btn btn-primary" id="wiEdMoveSaveBtn" data-move-id="' + escA(m.id) + '">💾 Сохранить приём</button>' +
        '</div>' +
      '</div>';
  }

  /* ============================================================
     ИНТЕРАКТИВНАЯ КАРТА КОНТИНЕНТА (WITCHER MAP)
     ============================================================ */

  function detectWiTacticalClashes(units){
    var clashes = [];
    var list = units || [];
    for(var i = 0; i < list.length; i++){
      var uA = list[i];
      if(!uA) continue;
      var facA = uA.nation_override || uA.nation || 'nilfgaard';
      for(var j = i + 1; j < list.length; j++){
        var uB = list[j];
        if(!uB) continue;
        var facB = uB.nation_override || uB.nation || 'nilfgaard';
        if(facA === facB) continue;
        var dist = Math.hypot((uA.x || 0) - (uB.x || 0), (uA.y || 0) - (uB.y || 0));
        if(dist <= 115){
          clashes.push({
            idxA: i,
            idxB: j,
            uA: uA,
            uB: uB,
            mx: Math.round(((uA.x || 0) + (uB.x || 0)) / 2),
            my: Math.round(((uA.y || 0) + (uB.y || 0)) / 2),
            dist: Math.round(dist)
          });
        }
      }
    }
    return clashes;
  }

  function renderWiWarLayerInner(){
    var m = WI.map || {};
    var isTactics = (m.mode === 'tactics');
    var hasWarData = (m.warPaths && m.warPaths.length > 0) || (m.tacticalUnits && m.tacticalUnits.length > 0);
    if(!isTactics && !hasWarData) return '';

    var isEraser = (isTactics && m.tacticsTool === 'eraser');

    // 1. Линии фронта и наступательные стрелы ударов
    var pathsHtml = (m.warPaths || []).map(function(wp, wpIdx){
      if(!wp) return '';
      var fac = WI_TACTICAL_FACTIONS[wp.nation] || WI_TACTICAL_FACTIONS.nilfgaard;
      var color = fac.color;
      var sw = wp.size || 48;
      var isArrow = (wp.style === 'arrow');
      var hitAttrs = ' class="' + (isEraser ? 'wi-war-path-hit' : '') + '" data-wi-warpath-idx="' + wpIdx + '"';

      var ptsArr = [];
      var dStr = '';
      if(wp.points && wp.points.length > 0){
        ptsArr = wp.points;
        if(ptsArr.length === 1){
          var p0 = ptsArr[0];
          return '<g' + hitAttrs + '><circle cx="' + p0.x.toFixed(1) + '" cy="' + p0.y.toFixed(1) + '" r="' + (sw / 2).toFixed(1) + '" fill="' + color + '" fill-opacity="0.52" /></g>';
        }
        dStr = 'M ' + ptsArr.map(function(p){ return p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' L ');
      } else if(wp.d){
        dStr = wp.d;
        var nums = String(wp.d).match(/-?\d+(\.\d+)?/g);
        if(nums && nums.length >= 4){
          for(var ni = 0; ni < nums.length - 1; ni += 2){
            ptsArr.push({ x: parseFloat(nums[ni]), y: parseFloat(nums[ni + 1]) });
          }
        }
      }
      if(!dStr) return '';

      var arrowHeadSvg = '';
      if(isArrow && ptsArr.length >= 2){
        var pLast = ptsArr[ptsArr.length - 1];
        var pPrev = ptsArr[Math.max(0, ptsArr.length - 3)] || ptsArr[ptsArr.length - 2];
        var ang = Math.atan2(pLast.y - pPrev.y, pLast.x - pPrev.x) * 180 / Math.PI;
        var headLen = Math.max(28, sw * 0.85);
        var headW = Math.max(22, sw * 0.68);
        arrowHeadSvg = '<g transform="translate(' + pLast.x.toFixed(1) + ',' + pLast.y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')" pointer-events="none">' +
          '<polygon points="' + (headLen * 0.45).toFixed(1) + ',0 ' + (-headLen * 0.55).toFixed(1) + ',' + (-headW).toFixed(1) + ' ' + (-headLen * 0.25).toFixed(1) + ',0 ' + (-headLen * 0.55).toFixed(1) + ',' + headW.toFixed(1) + '" fill="' + color + '" stroke="#ffffff" stroke-width="2.5" filter="url(#wiPinGlow)" opacity="0.95"/>' +
        '</g>';
      }

      return '<g' + hitAttrs + '>' +
        (isEraser ? '<title>🧹 Кликните, чтобы стереть эту линию/стрелу</title>' : '') +
        '<path d="' + dStr + '" fill="none" stroke="' + color + '" stroke-width="' + (isArrow ? Math.max(18, sw * 0.55) : sw) + '" stroke-linecap="round" stroke-linejoin="round" opacity="' + (isArrow ? '0.68' : '0.48') + '" />' +
        '<path d="' + dStr + '" fill="none" stroke="#ffffff" stroke-width="' + (isArrow ? '4' : '3') + '" stroke-dasharray="' + (isArrow ? '16,10' : '10,10') + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.88">' +
          (isArrow ? '<animate attributeName="stroke-dashoffset" values="52;0" dur="1.1s" repeatCount="indefinite"/>' : '') +
        '</path>' +
        arrowHeadSvg +
      '</g>';
    }).join('');

    // 2. Маршруты выдвижения отрядов (marchPath) с анимацией потока
    var marchPathsHtml = (m.tacticalUnits || []).map(function(u, idx){
      if(!u || !Array.isArray(u.marchPath) || u.marchPath.length === 0) return '';
      var facKey = u.nation_override || u.nation;
      var fac = WI_TACTICAL_FACTIONS[facKey] || WI_TACTICAL_FACTIONS.nilfgaard;
      var allPts = [{ x: u.x, y: u.y }].concat(u.marchPath);
      var dMarch = 'M ' + allPts.map(function(p){ return Math.round(p.x) + ' ' + Math.round(p.y); }).join(' L ');
      var totalPx = 0;
      for(var k = 1; k < allPts.length; k++){
        totalPx += Math.hypot(allPts[k].x - allPts[k - 1].x, allPts[k].y - allPts[k - 1].y);
      }
      var miles = Math.max(5, Math.round(totalPx * 0.62));
      var lastPt = u.marchPath[u.marchPath.length - 1];
      var prevPt = allPts[allPts.length - 2];
      var ang = Math.atan2(lastPt.y - prevPt.y, lastPt.x - prevPt.x) * 180 / Math.PI;

      var wpDots = u.marchPath.map(function(wp, wIdx){
        var isFinal = (wIdx === u.marchPath.length - 1);
        return '<circle cx="' + wp.x + '" cy="' + wp.y + '" r="' + (isFinal ? 9 : 5) + '" fill="' + (isFinal ? fac.color : '#090d16') + '" stroke="#ffffff" stroke-width="2" />' +
          (isFinal ? (
            '<g transform="translate(' + wp.x + ',' + wp.y + ') rotate(' + ang.toFixed(1) + ')">' +
              '<polygon points="14,0 -10,-10 -5,0 -10,10" fill="' + fac.color + '" stroke="#ffffff" stroke-width="1.8" />' +
            '</g>' +
            '<rect x="' + (wp.x - 46) + '" y="' + (wp.y - 30) + '" width="92" height="18" rx="4" fill="rgba(9,13,22,0.92)" stroke="' + fac.color + '" stroke-width="1.2" />' +
            '<text x="' + wp.x + '" y="' + (wp.y - 17) + '" text-anchor="middle" fill="#fde68a" font-size="10.5" font-weight="800" font-family="\'JetBrains Mono\',monospace">🏃 ' + miles + ' миль</text>'
          ) : '');
      }).join('');

      return '<g class="wi-unit-march-layer" data-wi-march-unit="' + idx + '" pointer-events="none">' +
        '<path d="' + dMarch + '" fill="none" stroke="rgba(0,0,0,0.75)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />' +
        '<path d="' + dMarch + '" fill="none" stroke="' + fac.color + '" stroke-width="5" stroke-dasharray="14,9" stroke-linecap="round" stroke-linejoin="round" filter="url(#wiPinGlow)">' +
          '<animate attributeName="stroke-dashoffset" values="46;0" dur="0.95s" repeatCount="indefinite"/>' +
        '</path>' +
        wpDots +
      '</g>';
    }).join('');

    // 3. Автоматические индикаторы столкновений и сражений между враждебными отрядами
    var clashes = detectWiTacticalClashes(m.tacticalUnits || []);
    var clashesHtml = clashes.map(function(cl){
      return '<g class="wi-clash-indicator" data-wi-clash-pair="' + cl.idxA + ',' + cl.idxB + '" transform="translate(' + cl.mx + ',' + cl.my + ')" style="cursor:pointer;">' +
        '<title>⚔️ Столкновение: ' + escA((cl.uA.label || 'Отряд 1') + ' vs ' + (cl.uB.label || 'Отряд 2') + ' — Кликните, чтобы открыть Симулятор Боя!') + '</title>' +
        '<line x1="' + (cl.uA.x - cl.mx) + '" y1="' + (cl.uA.y - cl.my) + '" x2="' + (cl.uB.x - cl.mx) + '" y2="' + (cl.uB.y - cl.my) + '" stroke="#ef4444" stroke-width="3.5" stroke-dasharray="6,5" opacity="0.85" />' +
        '<circle cx="0" cy="0" r="24" fill="none" stroke="#ef4444" class="wi-battle-shockwave" />' +
        '<circle cx="0" cy="0" r="24" fill="none" stroke="#f97316" class="wi-battle-shockwave-delayed" />' +
        '<rect x="-44" y="-13" width="88" height="24" rx="12" fill="rgba(127,29,29,0.95)" stroke="#fca5a5" stroke-width="1.8" filter="url(#wiPinGlow)" />' +
        '<text x="0" y="3" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="900" font-family="\'JetBrains Mono\',monospace" pointer-events="none">⚔️ В БОЙ!</text>' +
      '</g>';
    }).join('');

    // 4. Боевые соединения, герои, флот, крепости и события
    var unitsHtml = (m.tacticalUnits || []).map(function(u, idx){
      var facKey = u.nation_override || u.nation;
      var fac = WI_TACTICAL_FACTIONS[facKey] || WI_TACTICAL_FACTIONS.nilfgaard;
      var ut = WI_TACTICAL_UNIT_TYPES[u.type] || WI_TACTICAL_UNIT_TYPES.army;
      var st = WI_TACTICAL_UNIT_STATUSES[u.status || 'ready'] || WI_TACTICAL_UNIT_STATUSES.ready;
      var hp = (u.hp != null ? Math.max(0, Math.min(100, u.hp)) : 100);
      var strText = u.strength || ut.defaultStr || '';
      var isSel = (m.selectedUnitIdx === idx);
      var titleText = u.label || (ut.label + ' (' + fac.name + ')');

      var isCombatAura = (u.status === 'battle' || u.status === 'siege' || u.type === 'battle' || u.type === 'siege' || u.type === 'raze');
      var auraCol = (u.type === 'mages' ? '#c084fc' : (isCombatAura ? '#ef4444' : fac.color));
      var auraSvg = '';
      if(isCombatAura || u.type === 'mages' || u.type === 'witcher'){
        auraSvg = '<circle cx="0" cy="0" r="32" fill="' + auraCol + '" fill-opacity="0.18" stroke="' + auraCol + '" stroke-width="2" class="wi-unit-aura-pulse" />' +
          (isCombatAura ? '<circle cx="0" cy="0" r="26" fill="none" stroke="#ef4444" class="wi-battle-shockwave" />' : '');
      }

      var selHaloSvg = '';
      if(isSel){
        selHaloSvg = '<circle cx="0" cy="0" r="37" fill="rgba(251,191,36,0.16)" stroke="#fbbf24" stroke-width="3" stroke-dasharray="8,5">' +
          '<animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="8s" repeatCount="indefinite"/>' +
        '</circle>';
      }

      var hpColor = hp >= 70 ? '#10b981' : (hp >= 40 ? '#f59e0b' : '#ef4444');
      var hpBarW = Math.round(38 * (hp / 100));

      return '<g class="wi-tactical-unit ' + (isSel ? 'selected' : '') + '" data-wi-unit-idx="' + idx + '" transform="translate(' + u.x + ',' + u.y + ')" style="cursor:' + (isEraser ? 'pointer' : 'grab') + ';touch-action:none;">' +
        '<title>' + escA(titleText + ' [' + st.label + ' • ' + hp + '%] — Клик: выбрать в штабе, Зажать ЛКМ: переместить') + '</title>' +
        auraSvg +
        selHaloSvg +
        '<circle cx="0" cy="0" r="24" fill="rgba(9,12,18,0.95)" stroke="' + (isSel ? '#fbbf24' : fac.color) + '" stroke-width="' + (isSel ? '4.5' : '3.8') + '" filter="url(#wiPinGlow)" />' +
        '<circle cx="0" cy="0" r="29" fill="none" stroke="' + fac.color + '" stroke-width="1.6" stroke-dasharray="6,4" opacity="0.85" />' +
        '<text x="0" y="7" text-anchor="middle" font-size="21" pointer-events="none">' + ut.icon + '</text>' +
        '<circle cx="18" cy="-18" r="10.5" fill="#090d16" stroke="' + fac.color + '" stroke-width="2" />' +
        '<text x="18" y="-13" text-anchor="middle" font-size="12.5" pointer-events="none">' + fac.icon + '</text>' +
        '<circle cx="-18" cy="-18" r="10" fill="#090d16" stroke="' + st.color + '" stroke-width="1.8" />' +
        '<text x="-18" y="-14" text-anchor="middle" font-size="11.5" pointer-events="none">' + st.icon + '</text>' +
        '<rect x="-19" y="19" width="38" height="4.5" rx="2" fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" pointer-events="none" />' +
        '<rect x="-19" y="19" width="' + hpBarW + '" height="4.5" rx="2" fill="' + hpColor + '" pointer-events="none" />' +
        (m.showLabels !== false ? (
          '<rect x="-102" y="27" width="204" height="' + (strText ? '34' : '22') + '" rx="5" fill="rgba(9,13,22,0.92)" stroke="' + (isSel ? '#fbbf24' : fac.color) + '" stroke-width="' + (isSel ? '1.8' : '1.2') + '" pointer-events="none" />' +
          '<text x="0" y="41" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="700" font-family="\'JetBrains Mono\',monospace" pointer-events="none">' + esc(titleText.slice(0, 27)) + '</text>' +
          (strText ? '<text x="0" y="55" text-anchor="middle" fill="#cbd5e1" font-size="10" font-family="\'JetBrains Mono\',monospace" pointer-events="none">' + esc(strText.slice(0, 30)) + ' • ' + hp + '%</text>' : '')
        ) : '') +
      '</g>';
    }).join('');

    return '<g class="wi-war-paths-layer">' + pathsHtml + '</g>' +
           '<g class="wi-war-march-layer">' + marchPathsHtml + '</g>' +
           '<g class="wi-war-clashes-layer">' + clashesHtml + '</g>' +
           '<g class="wi-war-units-layer">' + unitsHtml + '</g>';
  }

  function updateWiWarLayerOnly(){
    var g = document.getElementById('wiMapWarGroup');
    if(g){
      g.innerHTML = renderWiWarLayerInner();
    }
  }

  function renderWitcherMapSvg(){
    var m = WI.map;
    if(!m.tacticsLoaded) WI.loadTacticalState();

    var z = Math.max(0.4, Math.min(5.0, m.zoom || 1.1));
    var cx = m.cx != null ? m.cx : 1440;
    var cy = m.cy != null ? m.cy : 1200;

    var vp = document.getElementById('wiMapViewport');
    var vw = (vp && vp.clientWidth) || 800;
    var vh = (vp && vp.clientHeight) || 540;
    var ar = vw / vh;

    var baseW = 2400;
    var baseH = baseW / ar;
    var vbW = baseW / z;
    var vbH = baseH / z;
    var minX = cx - vbW / 2;
    var minY = cy - vbH / 2;

    var selLoc = getWiActiveLocation(m);

    // 1. Defs: фильтры подсветки и теней
    var defsSvg = '<defs>' +
      '<filter id="wiPinGlow" x="-50%" y="-50%" width="200%" height="200%">' +
        '<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>' +
        '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '<filter id="wiLabelShadow" x="-30%" y="-30%" width="160%" height="160%">' +
        '<feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.95"/>' +
      '</filter>' +
    '</defs>';

    // 2. Растровая 4K карта Континента (Nolan Kotulan, 2880x4096)
    var mapImg = '<image href="new-4k-map-of-the-continent-v0-s4ryngvic0ga1.webp" x="0" y="0" width="2880" height="4096" preserveAspectRatio="xMidYMid meet" />';

    // 2.3. Слой стратегических рек и переправ (при включении кнопки 🌊 Реки)
    var riversSvg = '';
    if(m.showRivers && typeof WI_MAP_RIVERS !== 'undefined'){
      var renderedCrossings = {};
      riversSvg = WI_MAP_RIVERS.map(function(rv){
        var pts = rv.polyline || rv.pts || [];
        if(!pts || pts.length < 2) return '';
        var dRv = 'M ' + pts.map(function(p){
          var px = (p.x != null ? p.x : p[0]);
          var py = (p.y != null ? p.y : p[1]);
          return px + ' ' + py;
        }).join(' L ');
        var midPt = pts[Math.floor(pts.length / 2)];
        var midX = midPt ? (midPt.x != null ? midPt.x : midPt[0]) : 1400;
        var midY = midPt ? (midPt.y != null ? midPt.y : midPt[1]) : 1200;

        var crossingsHtml = '';
        if(Array.isArray(rv.crossingLocIds)){
          crossingsHtml = rv.crossingLocIds.map(function(cid){
            if(renderedCrossings[cid]) return '';
            renderedCrossings[cid] = true;
            var cloc = WI_MAP_LOCATIONS.find(function(l){ return l.id === cid; });
            if(!cloc) return '';
            return '<g class="wi-river-crossing-pin" data-wi-loc-pin="' + escA(cloc.id) + '" transform="translate(' + cloc.x + ',' + (cloc.y - 16) + ')" style="cursor:pointer;">' +
              '<title>🌉 Переправа / Мост: ' + escA(cloc.name) + ' (' + escA(rv.name) + ')</title>' +
              '<rect x="-11" y="-9" width="22" height="17" rx="4" fill="rgba(8,14,26,0.92)" stroke="#38bdf8" stroke-width="1.5"/>' +
              '<text y="3.5" text-anchor="middle" font-size="11" pointer-events="none">🌉</text>' +
            '</g>';
          }).join('');
        }

        return '<g class="wi-river-overlay">' +
          '<path d="' + dRv + '" fill="none" stroke="rgba(14,165,233,0.38)" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" />' +
          '<path d="' + dRv + '" fill="none" stroke="#38bdf8" stroke-width="3.8" stroke-dasharray="14,8" stroke-linecap="round" stroke-linejoin="round" pointer-events="none">' +
            '<animate attributeName="stroke-dashoffset" values="44;0" dur="2.2s" repeatCount="indefinite"/>' +
          '</path>' +
          (m.showLabels !== false && midPt ? '<text x="' + midX + '" y="' + (midY - 12) + '" text-anchor="middle" fill="#7dd3fc" font-size="12.5" font-family="Cinzel, serif" font-weight="800" filter="url(#wiLabelShadow)" pointer-events="none">🌊 ' + esc(rv.name) + '</text>' : '') +
          crossingsHtml +
        '</g>';
      }).join('');
    }

    // 2.4. Слой королевских трактов, перевалов и морских путей (при включении кнопки 🛣️ Тракты)
    var roadsSvg = '';
    if(m.showRoads && typeof WI_MAP_ROADS !== 'undefined'){
      roadsSvg = WI_MAP_ROADS.map(function(rd){
        var pts = rd.pts || [];
        if(pts.length < 2) return '';
        var dRd = 'M ' + pts.map(function(p){ return p.x + ' ' + p.y; }).join(' L ');
        var midPt = pts[Math.floor(pts.length / 2)];
        var isSea = (rd.type === 'sea');
        var isPass = (rd.type === 'pass');
        var strokeCol = isSea ? '#22d3ee' : (isPass ? '#fb923c' : '#fbbf24');
        var bgStroke = isSea ? 'rgba(8,51,68,0.6)' : 'rgba(20,14,8,0.72)';
        var dashArr = isSea ? '8,10' : (isPass ? '4,7' : '12,6');
        var iconTag = isSea ? '⛵ ' : (isPass ? '⛰️ ' : '🛣️ ');

        return '<g class="wi-road-overlay" pointer-events="none">' +
          '<path d="' + dRd + '" fill="none" stroke="' + bgStroke + '" stroke-width="' + (isSea ? '6' : '7.5') + '" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="' + dRd + '" fill="none" stroke="' + strokeCol + '" stroke-width="' + (isSea ? '2.5' : '3.2') + '" stroke-dasharray="' + dashArr + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.9">' +
            (isSea ? '<animate attributeName="stroke-dashoffset" values="36;0" dur="2.8s" repeatCount="indefinite"/>' : '') +
          '</path>' +
          (m.showLabels !== false && midPt ? (
            '<text x="' + midPt.x + '" y="' + (midPt.y - 9) + '" text-anchor="middle" fill="' + (isSea ? '#67e8f9' : (isPass ? '#fdba74' : '#fde68a')) + '" font-size="11.5" font-family="Cinzel, serif" font-weight="700" filter="url(#wiLabelShadow)">' +
              iconTag + esc(rd.name) +
            '</text>'
          ) : '') +
        '</g>';
      }).join('');
    }

    // 2.5. Политические границы и зоны контроля держав (активны при включённом слое Границы или инструменте захвата)
    var territoriesSvg = '';
    if(m.showTerritories || (m.mode === 'tactics' && m.tacticsTool === 'capture')){
      var territoriesList = getWiTerritoriesList();
      territoriesSvg = territoriesList.map(function(t){
        var isSel = (m.selectedRegionId === t.id || (selLoc && selLoc.id === t.locId));
        var fillOp = (m.mode === 'tactics') ? (isSel ? '0.30' : '0.20') : (isSel ? '0.22' : '0.13');
        var strokeW = isSel ? '4.2' : '2.6';
        var labelHtml = '';
        if(m.showLabels !== false){
          labelHtml = '<text x="' + t.labelX + '" y="' + t.labelY + '" text-anchor="middle" fill="' + t.color + '" font-size="' + (isSel ? '15.5' : '13') + '" font-weight="900" font-family="Cinzel, serif" filter="url(#wiLabelShadow)" pointer-events="none" opacity="0.95">' +
            esc(t.labelText) +
          '</text>';
        }
        return '<g class="wi-territory-group" data-territory-id="' + escA(t.id) + '">' +
          '<path d="' + t.d + '" fill="none" stroke="rgba(8,10,16,0.72)" stroke-width="' + (isSel ? '6.5' : '4.5') + '" stroke-linejoin="round" stroke-linecap="round" pointer-events="none" />' +
          '<path class="wi-territory ' + (isSel ? 'active' : '') + '" data-territory-id="' + escA(t.id) + '" data-territory-loc="' + escA(t.locId) + '" d="' + t.d + '" fill-rule="evenodd" fill="' + t.color + '" fill-opacity="' + fillOp + '" stroke="' + t.color + '" stroke-width="' + strokeW + '" stroke-dasharray="10,5" stroke-linejoin="round" stroke-linecap="round" />' +
          labelHtml +
        '</g>';
      }).join('');
    }

    // 2.6. Слой Мест Силы и Логов Чудовищ (при включении кнопки 🔮 Места Силы)
    var loreHotspotsSvg = '';
    if(m.showLoreLayer && typeof WI_MAP_LORE_HOTSPOTS !== 'undefined'){
      loreHotspotsSvg = WI_MAP_LORE_HOTSPOTS.map(function(hs){
        var isSign = (hs.kind === 'sign');
        var isHSel = (m.selectedHotspotId === hs.id);
        var col = hs.color || (isSign ? '#a855f7' : '#ef4444');
        var rad = isHSel ? 16 : 13;
        return '<g class="wi-lore-hotspot ' + (isHSel ? 'active' : '') + '" data-wi-hotspot-id="' + escA(hs.id) + '" transform="translate(' + hs.x + ',' + hs.y + ')">' +
          '<title>' + escA(hs.icon + ' ' + hs.name + ' (' + hs.region + ')\n' + hs.bonus + '\n' + hs.desc) + '</title>' +
          '<circle r="' + (rad + 7) + '" fill="' + col + '" fill-opacity="0.18" stroke="' + col + '" stroke-width="1.5" stroke-dasharray="4,3">' +
            '<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite"/>' +
          '</circle>' +
          (isSign
            ? '<polygon points="0,-' + rad + ' ' + rad + ',0 0,' + rad + ' -' + rad + ',0" fill="rgba(10,14,24,0.94)" stroke="' + col + '" stroke-width="2.4" filter="url(#wiPinGlow)"/>'
            : '<circle r="' + rad + '" fill="rgba(24,8,12,0.94)" stroke="' + col + '" stroke-width="2.4" filter="url(#wiPinGlow)"/>'
          ) +
          '<text y="4.5" text-anchor="middle" font-size="13" pointer-events="none">' + (hs.icon || '🔮') + '</text>' +
          (m.showLabels !== false ? (
            '<text y="' + (rad + 15) + '" text-anchor="middle" fill="' + (isSign ? '#e9d5ff' : '#fecaca') + '" font-size="11" font-family="Cinzel, serif" font-weight="800" filter="url(#wiLabelShadow)" pointer-events="none">' +
              esc(hs.name.split(' (')[0]) +
            '</text>'
          ) : '') +
        '</g>';
      }).join('');
    }

    // 2.8. Слой тактики (линии фронтов + маршруты марша + индикаторы боёв + боевые соединения)
    var warGroupSvg = '<g id="wiMapWarGroup">' + renderWiWarLayerInner() + '</g>';

    // 3. Маршрут между выбранными точками
    var routeSvg = '';
    if(m.routePoints && m.routePoints.length >= 1 && (m.mode === 'route' || m.routePoints.length >= 2)){
      var rpts = m.routePoints;
      var pathData = '';
      if(rpts.length >= 2){
        pathData = 'M ' + rpts[0].x + ' ' + rpts[0].y;
        for(var k = 1; k < rpts.length; k++){
          pathData += ' L ' + rpts[k].x + ' ' + rpts[k].y;
        }
      }

      var linesSvg = '';
      if(pathData){
        linesSvg = '<path class="wi-route-path-bg" d="' + pathData + '" fill="none" style="fill:none !important;" stroke="rgba(0,0,0,0.75)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path class="wi-route-path-fg" d="' + pathData + '" fill="none" style="fill:none !important;" stroke="#fbbf24" stroke-width="4.5" stroke-dasharray="14,10" stroke-linecap="round" stroke-linejoin="round" filter="url(#wiPinGlow)">' +
            '<animate attributeName="stroke-dashoffset" values="48;0" dur="1.4s" repeatCount="indefinite"/>' +
          '</path>';
      }

      var waypointsSvg = (m.mode === 'route' ? rpts.map(function(pt, idx){
        var isStart = (idx === 0);
        var isEnd = (idx === rpts.length - 1 && m.routePoints.length > 1);

        var pinColor = isStart ? '#10b981' : (isEnd ? '#ef4444' : '#f59e0b');
        var badgeLabel = (idx + 1);
        var stopIcon = (pt.stopType === 'inn' ? '🍺' : (pt.stopType === 'camp' ? '⛺' : (pt.stopType === 'ferry' ? '⛵' : '')));
        var ptTer = getTerrainAt(pt.x, pt.y);
        var hint = (isStart ? 'Старт: ' : (isEnd ? 'Цель: ' : 'Остановка ' + (idx + 1) + ': ')) + (pt.name || '') + ' (' + ptTer.name + ') — Клик ЛКМ: удалить, Зажать: переместить';

        return '<g class="wi-route-point" data-route-pt-id="' + pt.id + '" transform="translate(' + pt.x + ',' + pt.y + ')" style="cursor:grab;touch-action:none;">' +
          '<title>' + escA(hint) + '</title>' +
          '<circle r="18" fill="rgba(0,0,0,0.4)" stroke="' + pinColor + '" stroke-width="2" stroke-dasharray="4,2"/>' +
          '<circle r="13" fill="' + pinColor + '" stroke="#ffffff" stroke-width="2.2" filter="url(#wiPinGlow)"/>' +
          '<text y="4" text-anchor="middle" font-size="10.5" font-weight="900" font-family="\'JetBrains Mono\',monospace" fill="#0f172a" pointer-events="none">' + badgeLabel + '</text>' +
          (stopIcon ? ('<text x="14" y="-7" font-size="12" pointer-events="none">' + stopIcon + '</text>') : '') +
          (m.showLabels !== false ? ('<text y="27" fill="' + (isStart ? '#6ee7b7' : (isEnd ? '#fca5a5' : '#fbbf24')) + '" font-size="11.5" font-family="Cinzel, serif" font-weight="700" text-anchor="middle" filter="url(#wiLabelShadow)">' + esc(pt.name || ('Точка ' + (idx + 1))) + '</text>') : '') +
        '</g>';
      }).join('') : '');

      routeSvg = '<g id="wiRouteLayer">' + linesSvg + waypointsSvg + '</g>';
    }

    // 4. Интерактивные пины городов, деревень, лесов, крепостей ведьмаков и столиц Континента
    var pinsSvg = '';
    if(m.showPins !== false){
      var regFilter = m.regionFilter || 'all';
      var tpFilter = m.typeFilter || 'all';
      var qSearch = (m.search || '').toLowerCase().trim();

      pinsSvg = WI_MAP_LOCATIONS.map(function(l){
        var matchReg = (regFilter === 'all' || l.regionKey === regFilter);
        var matchType = (tpFilter === 'all' || l.type === tpFilter);
        var matchSearch = !qSearch || (l.name.toLowerCase().indexOf(qSearch) !== -1 || (l.region || '').toLowerCase().indexOf(qSearch) !== -1 || (l.desc || '').toLowerCase().indexOf(qSearch) !== -1);
        var isVisible = matchReg && matchType && matchSearch;
        var isSel = (selLoc && l.id === selLoc.id);

        var pinCol = '#3b82f6';
        if(l.regionKey === 'redania') pinCol = '#ef4444';
        else if(l.regionKey === 'kaedwen_aedirn') pinCol = '#f97316';
        else if(l.regionKey === 'skellige') pinCol = '#06b6d4';
        else if(l.regionKey === 'nilfgaard') pinCol = '#eab308';
        else if(l.regionKey === 'toussaint') pinCol = '#a855f7';
        else if(l.regionKey === 'scoiatael') pinCol = '#22c55e';
        else if(l.regionKey === 'kovir') pinCol = '#38bdf8';
        if(l.type === 'witcher') pinCol = '#f59e0b';
        else if(l.type === 'nature') pinCol = '#10b981';

        var pulseSvg = '';
        if(isSel){
          pulseSvg = '<circle cx="' + l.x + '" cy="' + l.y + '" r="28" fill="rgba(245,158,11,0.18)" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="6,4">' +
            '<animateTransform attributeName="transform" type="rotate" from="0 ' + l.x + ' ' + l.y + '" to="360 ' + l.x + ' ' + l.y + '" dur="10s" repeatCount="indefinite"/>' +
          '</circle>' +
          '<circle cx="' + l.x + '" cy="' + l.y + '" r="20" fill="none" stroke="' + pinCol + '" class="wi-pin-pulse"/>';
        }

        var shapeSvg = '';
        if(l.type === 'capital'){
          shapeSvg =
            '<circle cx="' + l.x + '" cy="' + l.y + '" r="' + (isSel ? 15 : 12) + '" fill="rgba(8,12,20,0.9)" stroke="' + pinCol + '" stroke-width="2.2"/>' +
            '<circle cx="' + l.x + '" cy="' + l.y + '" r="' + (isSel ? 10 : 8) + '" fill="' + pinCol + '" stroke="#ffffff" stroke-width="2"/>' +
            '<circle cx="' + l.x + '" cy="' + l.y + '" r="3.5" fill="#ffffff"/>';
        } else if(l.type === 'witcher'){
          var ws = isSel ? 15 : 12.5;
          var dDia = 'M ' + l.x + ' ' + (l.y - ws) + ' L ' + (l.x + ws) + ' ' + l.y + ' L ' + l.x + ' ' + (l.y + ws) + ' L ' + (l.x - ws) + ' ' + l.y + ' Z';
          shapeSvg =
            '<path d="' + dDia + '" fill="#f59e0b" stroke="#ffffff" stroke-width="2.4" filter="url(#wiPinGlow)"/>' +
            '<circle cx="' + l.x + '" cy="' + l.y + '" r="4" fill="#090b0e"/>';
        } else if(l.type === 'magic'){
          var ms = isSel ? 13 : 10.5;
          var dMag = 'M ' + l.x + ' ' + (l.y - ms) + ' L ' + (l.x + ms) + ' ' + l.y + ' L ' + l.x + ' ' + (l.y + ms) + ' L ' + (l.x - ms) + ' ' + l.y + ' Z';
          shapeSvg =
            '<path d="' + dMag + '" fill="' + pinCol + '" stroke="#ffffff" stroke-width="2" filter="url(#wiPinGlow)"/>' +
            '<circle cx="' + l.x + '" cy="' + l.y + '" r="3" fill="#ffffff"/>';
        } else if(l.type === 'village'){
          var vRad = isSel ? 9.5 : 6.5;
          shapeSvg =
            '<circle cx="' + l.x + '" cy="' + l.y + '" r="' + (vRad + 2.2) + '" fill="rgba(0,0,0,0.82)"/>' +
            '<circle cx="' + l.x + '" cy="' + l.y + '" r="' + vRad + '" fill="' + pinCol + '" stroke="#fef3c7" stroke-width="' + (isSel ? '2.2' : '1.5') + '"/>' +
            '<circle cx="' + l.x + '" cy="' + l.y + '" r="2" fill="#fef3c7"/>';
        } else if(l.type === 'nature'){
          var nRad = isSel ? 10 : 7;
          shapeSvg =
            '<circle cx="' + l.x + '" cy="' + l.y + '" r="' + (nRad + 2.5) + '" fill="rgba(4,24,18,0.85)"/>' +
            '<circle cx="' + l.x + '" cy="' + l.y + '" r="' + nRad + '" fill="#10b981" stroke="#a7f3d0" stroke-width="' + (isSel ? '2.3' : '1.5') + '"/>';
        } else {
          var rad = isSel ? 10.5 : 8;
          shapeSvg =
            '<circle cx="' + l.x + '" cy="' + l.y + '" r="' + (rad + 3) + '" fill="rgba(0,0,0,0.82)"/>' +
            '<circle cx="' + l.x + '" cy="' + l.y + '" r="' + rad + '" fill="' + pinCol + '" stroke="#ffffff" stroke-width="' + (isSel ? '2.5' : '1.8') + '"/>';
        }

        var labelSvg = '';
        if(m.showLabels !== false && (isVisible || isSel)){
          var shortName = l.name.split(' (')[0];
          var isMinor = (l.type === 'village' || l.type === 'nature');
          var fSize = isSel ? '15' : (l.type === 'capital' || l.type === 'witcher' ? '13.5' : (isMinor ? '10.5' : '12'));
          var fCol = isSel ? '#fbbf24' : (l.type === 'witcher' ? '#fde68a' : (l.type === 'nature' ? '#a7f3d0' : (l.type === 'village' ? '#fef3c7' : '#f8fafc')));
          labelSvg = '<text x="' + l.x + '" y="' + (l.y + (isSel ? 28 : (isMinor ? 19 : 23))) + '" fill="' + fCol + '" font-size="' + fSize + '" font-family="Cinzel, serif" font-weight="' + (isSel || l.type === 'capital' ? '800' : '700') + '" text-anchor="middle" filter="url(#wiLabelShadow)" pointer-events="none">' +
            esc(shortName) +
          '</text>';
        }

        return '<g class="wi-map-pin ' + (isSel ? 'active' : '') + '" data-wi-loc-pin="' + escA(l.id) + '" opacity="' + (isVisible || isSel ? '1' : '0.18') + '">' +
          '<title>' + escA(l.icon + ' ' + l.name + ' (' + l.region + ')') + '</title>' +
          pulseSvg +
          shapeSvg +
          labelSvg +
        '</g>';
      }).join('');

      if(selLoc && selLoc.isWildSpot){
        pinsSvg += '<g class="wi-map-pin active" transform="translate(' + selLoc.x + ',' + selLoc.y + ')" pointer-events="none">' +
          '<circle r="28" fill="rgba(16,185,129,0.18)" stroke="#10b981" stroke-width="2.5" stroke-dasharray="6,4">' +
            '<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="9s" repeatCount="indefinite"/>' +
          '</circle>' +
          '<circle r="14" fill="rgba(6,24,18,0.92)" stroke="#34d399" stroke-width="2.4" filter="url(#wiPinGlow)"/>' +
          '<text y="5" text-anchor="middle" font-size="14">' + (selLoc.icon || '🌲') + '</text>' +
          '<text y="28" fill="#6ee7b7" font-size="13" font-family="Cinzel, serif" font-weight="800" text-anchor="middle" filter="url(#wiLabelShadow)">' + esc(selLoc.name.split(' (')[0]) + '</text>' +
        '</g>';
      }
    }

    // 5. Пользовательские тактические метки
    var userPinsSvg = (m.showUserMarkers !== false ? (m.userMarkers || []).map(function(um){
      var isMSel = (m.selectedMarkerId === um.id);
      return '<g class="wi-user-marker ' + (isMSel ? 'active' : '') + '" data-user-marker-id="' + escA(um.id) + '" transform="translate(' + um.x + ',' + um.y + ')" style="cursor:grab;touch-action:none;">' +
        '<title>' + escA((um.title || 'Метка') + (um.desc ? ' — ' + um.desc : '') + ' (Клик: выбрать, Зажать: переместить)') + '</title>' +
        (isMSel ? '<circle r="24" fill="none" stroke="#fbbf24" class="wi-pin-pulse" />' : '') +
        '<circle r="15" fill="rgba(18, 16, 22, 0.94)" stroke="' + (isMSel ? '#fbbf24' : '#ef4444') + '" stroke-width="2.5" filter="url(#wiPinGlow)"/>' +
        '<text y="5" text-anchor="middle" font-size="15" pointer-events="none">' + (um.icon || '📍') + '</text>' +
        (m.showLabels !== false ? ('<text y="28" fill="' + (isMSel ? '#fde68a' : '#fca5a5') + '" font-size="12" font-family="Cinzel, serif" text-anchor="middle" font-weight="700" filter="url(#wiLabelShadow)" pointer-events="none">' + esc(um.title || 'Метка') + '</text>') : '') +
      '</g>';
    }).join('') : '');

    // 6. Инструмент измерения расстояний (📏 Линейка)
    var rulerSvg = '';
    if(m.measureMode && Array.isArray(m.measurePoints) && m.measurePoints.length > 0){
      var mpA = m.measurePoints[0];
      var mpB = m.measurePoints[1] || null;
      var lineRuler = '';
      if(mpB){
        var rawPx = Math.hypot(mpB.x - mpA.x, mpB.y - mpA.y);
        var milesR = Math.max(1, Math.round(rawPx * 0.42));
        var daysHorse = (milesR / 38).toFixed(1);
        var daysFoot = (milesR / 18).toFixed(1);
        var midRX = Math.round((mpA.x + mpB.x) / 2);
        var midRY = Math.round((mpA.y + mpB.y) / 2);
        lineRuler =
          '<line x1="' + mpA.x + '" y1="' + mpA.y + '" x2="' + mpB.x + '" y2="' + mpB.y + '" stroke="rgba(0,0,0,0.85)" stroke-width="7" stroke-linecap="round"/>' +
          '<line x1="' + mpA.x + '" y1="' + mpA.y + '" x2="' + mpB.x + '" y2="' + mpB.y + '" stroke="#38bdf8" stroke-width="3.5" stroke-dasharray="10,6" stroke-linecap="round"/>' +
          '<g transform="translate(' + midRX + ',' + (midRY - 18) + ')">' +
            '<rect x="-115" y="-22" width="230" height="38" rx="6" fill="rgba(8,14,24,0.94)" stroke="#38bdf8" stroke-width="1.8"/>' +
            '<text y="-5" text-anchor="middle" fill="#7dd3fc" font-size="12.5" font-weight="800" font-family="\'JetBrains Mono\',monospace">📏 ' + milesR + ' миль по прямой</text>' +
            '<text y="10" text-anchor="middle" fill="#fde68a" font-size="10.5" font-weight="700" font-family="\'JetBrains Mono\',monospace">🐎 ~' + daysHorse + ' дн.  •  🥾 ~' + daysFoot + ' дн.</text>' +
          '</g>';
      }
      rulerSvg = '<g id="wiMapRulerGroup" pointer-events="none">' +
        lineRuler +
        m.measurePoints.map(function(pt, idx){
          return '<g transform="translate(' + pt.x + ',' + pt.y + ')">' +
            '<circle r="11" fill="#0284c7" stroke="#ffffff" stroke-width="2.2"/>' +
            '<text y="3.5" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="900" font-family="\'JetBrains Mono\',monospace">' + (idx === 0 ? 'А' : 'Б') + '</text>' +
            (pt.label ? '<text y="24" text-anchor="middle" fill="#7dd3fc" font-size="11.5" font-family="Cinzel, serif" font-weight="700" filter="url(#wiLabelShadow)">' + esc(pt.label) + '</text>' : '') +
          '</g>';
        }).join('') +
      '</g>';
    }

    return '<svg id="wiMapSvg" viewBox="' + minX + ' ' + minY + ' ' + vbW + ' ' + vbH + '" width="100%" height="100%" style="display:block;touch-action:none;user-select:none;">' +
      defsSvg +
      mapImg +
      '<g id="wiMapRivers">' + riversSvg + '</g>' +
      '<g id="wiMapRoads">' + roadsSvg + '</g>' +
      '<g id="wiMapTerritories">' + territoriesSvg + '</g>' +
      '<g id="wiMapLoreHotspots">' + loreHotspotsSvg + '</g>' +
      warGroupSvg +
      routeSvg +
      '<g id="wiMapPinsGroup">' + pinsSvg + '</g>' +
      '<g id="wiMapUserMarkersGroup">' + userPinsSvg + '</g>' +
      rulerSvg +
    '</svg>';
  }

  function buildWiUnitTypeOptionsHtml(selectedKey){
    var groups = {};
    Object.keys(WI_TACTICAL_UNIT_TYPES).forEach(function(uk){
      var ut = WI_TACTICAL_UNIT_TYPES[uk];
      var cat = ut.cat || 'Войска';
      if(!groups[cat]) groups[cat] = [];
      groups[cat].push(ut);
    });
    return Object.keys(groups).map(function(cat){
      var opts = groups[cat].map(function(ut){
        return '<option value="' + escA(ut.id) + '"' + (selectedKey === ut.id ? ' selected' : '') + '>' + ut.icon + ' ' + esc(ut.label) + ' (Сила ' + (ut.basePow || 5) + ')</option>';
      }).join('');
      return '<optgroup label="' + escA(cat) + '">' + opts + '</optgroup>';
    }).join('');
  }

  function renderWiTacticsInspector(){
    var m = WI.map;
    var units = m.tacticalUnits || [];
    var curTab = m.tacticsTab || 'units';
    var clashes = detectWiTacticalClashes(units);
    var marchingUnitsCount = units.filter(function(u){ return u && Array.isArray(u.marchPath) && u.marchPath.length > 0; }).length;

    // Карточка выбранного соединения (если выбран отряд на карте или в списке)
    var selectedUnitHtml = '';
    if(m.selectedUnitIdx != null && m.selectedUnitIdx >= 0 && units[m.selectedUnitIdx]){
      var su = units[m.selectedUnitIdx];
      var suIdx = m.selectedUnitIdx;
      var suFacKey = su.nation_override || su.nation || 'nilfgaard';
      var suFac = WI_TACTICAL_FACTIONS[suFacKey] || WI_TACTICAL_FACTIONS.nilfgaard;
      var suType = WI_TACTICAL_UNIT_TYPES[su.type] || WI_TACTICAL_UNIT_TYPES.army;
      var suStatus = WI_TACTICAL_UNIT_STATUSES[su.status || 'ready'] || WI_TACTICAL_UNIT_STATUSES.ready;
      var suHp = (su.hp != null ? su.hp : 100);
      var suTer = getTerrainAt(su.x, su.y);
      var suMarchCount = (su.marchPath && su.marchPath.length) || 0;

      var facOpts = Object.keys(WI_TACTICAL_FACTIONS).filter(function(fk){ return fk !== 'independent'; }).map(function(fk){
        var f = WI_TACTICAL_FACTIONS[fk];
        return '<option value="' + fk + '"' + (suFacKey === fk ? ' selected' : '') + '>' + f.icon + ' ' + esc(f.name) + '</option>';
      }).join('');

      var stOpts = Object.keys(WI_TACTICAL_UNIT_STATUSES).map(function(sk){
        var st = WI_TACTICAL_UNIT_STATUSES[sk];
        return '<option value="' + sk + '"' + ((su.status || 'ready') === sk ? ' selected' : '') + '>' + st.icon + ' ' + esc(st.label) + '</option>';
      }).join('');

      selectedUnitHtml =
        '<div class="wi-char-sheet-card" style="margin-top:12px;border-color:' + suFac.color + ';background:linear-gradient(145deg, rgba(16,22,34,0.96) 0%, rgba(9,12,18,0.98) 100%);box-shadow:0 0 20px rgba(0,0,0,0.6);">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.08);">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<span style="font-size:26px;background:rgba(0,0,0,0.5);border:2px solid ' + suFac.color + ';border-radius:50%;width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;">' + suType.icon + '</span>' +
              '<div>' +
                '<div style="font-size:10.5px;color:' + suFac.color + ';font-family:\'JetBrains Mono\',monospace;font-weight:800;text-transform:uppercase;">УПРАВЛЕНИЕ ВЫБРАННЫМ СОЕДИНЕНИЕМ #' + (suIdx + 1) + '</div>' +
                '<div style="font-family:\'Cinzel\',serif;font-size:16px;font-weight:800;color:#fff;">' + esc(su.label || suType.label) + '</div>' +
              '</div>' +
            '</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
              '<button class="btn btn-primary" id="wiSelUnitMarchModeBtn" style="font-size:11.5px;padding:5px 10px;' + (m.tacticsTool === 'march' ? 'box-shadow:0 0 12px #38bdf8;' : '') + '">🏃 ' + (m.tacticsTool === 'march' ? 'Кликайте по карте (Марш активен)' : 'Проложить марш') + '</button>' +
              (suMarchCount > 0 ? '<button class="btn btn-ghost" id="wiSelUnitAnimMarchBtn" style="font-size:11.5px;padding:5px 10px;color:#38bdf8;border-color:rgba(56,189,248,0.45);">▶️ Двинуть по маршруту (' + suMarchCount + ')</button>' : '') +
              (suMarchCount > 0 ? '<button class="btn btn-ghost" id="wiSelUnitClearMarchBtn" style="font-size:11.5px;padding:5px 10px;color:#fca5a5;">✖ Сброс марша</button>' : '') +
              '<button class="btn btn-ghost" data-wi-focus-unit="' + suIdx + '" style="font-size:11.5px;padding:5px 10px;">🎯 Навести</button>' +
              '<button class="btn btn-ghost" id="wiSelUnitCloneBtn" style="font-size:11.5px;padding:5px 10px;" title="Дублировать отряд рядом">📑 Копия</button>' +
              '<button class="btn btn-ghost" data-wi-del-unit="' + suIdx + '" style="font-size:11.5px;padding:5px 10px;color:#ef4444;">🗑️ Снять</button>' +
              '<button class="btn btn-ghost" id="wiSelUnitCloseBtn" style="font-size:11.5px;padding:5px 8px;">✕</button>' +
            '</div>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(185px, 1fr));gap:10px;align-items:end;">' +
            '<div>' +
              '<label style="font-size:10.5px;color:var(--wi-steel);display:block;margin-bottom:3px;">НАЗВАНИЕ АРМИИ / ОТРЯДА</label>' +
              '<input type="text" id="wiSelUnitNameInp" class="wi-input" style="font-size:12.5px;padding:5px 8px;" value="' + escA(su.label || '') + '">' +
            '</div>' +
            '<div>' +
              '<label style="font-size:10.5px;color:var(--wi-steel);display:block;margin-bottom:3px;">ЧИСЛЕННОСТЬ / СОСТАВ</label>' +
              '<input type="text" id="wiSelUnitStrInp" class="wi-input" style="font-size:12.5px;padding:5px 8px;" placeholder="Напр. 5 000 латников" value="' + escA(su.strength || suType.defaultStr || '') + '">' +
            '</div>' +
            '<div>' +
              '<label style="font-size:10.5px;color:var(--wi-steel);display:block;margin-bottom:3px;">ДЕРЖАВА / ФРАКЦИЯ</label>' +
              '<select id="wiSelUnitFacSel" class="wi-war-select" style="width:100%;">' + facOpts + '</select>' +
            '</div>' +
            '<div>' +
              '<label style="font-size:10.5px;color:var(--wi-steel);display:block;margin-bottom:3px;">РОД ВОЙСК / ТИП</label>' +
              '<select id="wiSelUnitTypeSel" class="wi-war-select" style="width:100%;">' + buildWiUnitTypeOptionsHtml(su.type || 'army') + '</select>' +
            '</div>' +
            '<div>' +
              '<label style="font-size:10.5px;color:var(--wi-steel);display:block;margin-bottom:3px;">БОЕВОЙ СТАТУС</label>' +
              '<select id="wiSelUnitStatusSel" class="wi-war-select" style="width:100%;">' + stOpts + '</select>' +
            '</div>' +
            '<div>' +
              '<label style="font-size:10.5px;color:var(--wi-steel);display:block;margin-bottom:3px;">БОЕСПОСОБНОСТЬ: <b id="wiSelUnitHpVal" style="color:#fbbf24;">' + suHp + '%</b> (' + suTer.icon + ' ' + esc(suTer.name) + ')</label>' +
              '<input type="range" id="wiSelUnitHpRange" min="10" max="100" step="5" value="' + suHp + '" style="width:100%;accent-color:#f59e0b;cursor:pointer;">' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    // Вкладки Тактического Штаба
    var tabsBarHtml =
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--wi-border);">' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
          '<button class="wi-tactics-tab-btn ' + (curTab === 'units' ? 'active' : '') + '" data-wi-tactics-tab="units">♟️ Войска и Штаб (' + units.length + ')</button>' +
          '<button class="wi-tactics-tab-btn ' + (curTab === 'battles' ? 'active' : '') + '" data-wi-tactics-tab="battles">⚔️ Бои и Симулятор' + (clashes.length > 0 ? ' <span style="background:#ef4444;color:#fff;padding:1px 6px;border-radius:10px;font-size:10.5px;">' + clashes.length + '</span>' : '') + '</button>' +
          '<button class="wi-tactics-tab-btn ' + (curTab === 'regions' ? 'active' : '') + '" data-wi-tactics-tab="regions">🏴 Державы и Границы (21)</button>' +
          '<button class="wi-tactics-tab-btn ' + (curTab === 'scenarios' ? 'active' : '') + '" data-wi-tactics-tab="scenarios">📜 Сценарии и Сводка ИИ</button>' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
          (marchingUnitsCount > 0 ? '<button class="btn btn-primary" id="wiWarAnimateAllInspectorBtn" style="font-size:12px;padding:5px 12px;">▶️ Двинуть все войска на марше (' + marchingUnitsCount + ')</button>' : '') +
          '<button class="btn btn-ghost" id="wiWarQuickSpawnCenterBtn" style="font-size:12px;padding:5px 10px;">➕ Разместить отряд в центре</button>' +
        '</div>' +
      '</div>';

    var tabBodyHtml = '';

    if(curTab === 'units'){
      var facFilter = m.unitFactionFilter || 'all';
      var facFilterOpts = '<option value="all"' + (facFilter === 'all' ? ' selected' : '') + '>Все фракции (' + units.length + ')</option>' +
        Object.keys(WI_TACTICAL_FACTIONS).filter(function(fk){ return fk !== 'independent'; }).map(function(fk){
          var f = WI_TACTICAL_FACTIONS[fk];
          var cnt = units.filter(function(u){ return (u.nation_override || u.nation) === fk; }).length;
          if(cnt === 0 && facFilter !== fk) return '';
          return '<option value="' + fk + '"' + (facFilter === fk ? ' selected' : '') + '>' + f.icon + ' ' + esc(f.name) + ' (' + cnt + ')</option>';
        }).join('');

      var filteredUnits = [];
      units.forEach(function(u, idx){
        var fk = u.nation_override || u.nation;
        if(facFilter === 'all' || fk === facFilter){
          filteredUnits.push({ u: u, idx: idx });
        }
      });

      tabBodyHtml =
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
            '<span style="font-size:11.5px;color:var(--wi-steel);font-family:\'JetBrains Mono\',monospace;">ФИЛЬТР ПО ДЕРЖАВЕ:</span>' +
            '<select id="wiTacticsRosterFilter" class="wi-war-select">' + facFilterOpts + '</select>' +
          '</div>' +
          '<div style="font-size:11.5px;color:var(--wi-steel);">💡 Кликните по отряду в списке или на карте для настройки приказа, численности и маршрута марша</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:8px;max-height:360px;overflow-y:auto;padding-right:4px;">' +
          (filteredUnits.length ? filteredUnits.map(function(item){
            var u = item.u;
            var idx = item.idx;
            var fk = u.nation_override || u.nation;
            var fac = WI_TACTICAL_FACTIONS[fk] || WI_TACTICAL_FACTIONS.nilfgaard;
            var ut = WI_TACTICAL_UNIT_TYPES[u.type] || WI_TACTICAL_UNIT_TYPES.army;
            var st = WI_TACTICAL_UNIT_STATUSES[u.status || 'ready'] || WI_TACTICAL_UNIT_STATUSES.ready;
            var hp = (u.hp != null ? u.hp : 100);
            var isSel = (m.selectedUnitIdx === idx);
            var hasMarch = (u.marchPath && u.marchPath.length > 0);
            return '<div class="wi-unit-roster-row ' + (isSel ? 'selected' : '') + '" data-wi-select-unit="' + idx + '">' +
              '<div style="display:flex;align-items:center;gap:9px;min-width:0;flex:1;">' +
                '<span style="font-size:20px;width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,0.55);border:2px solid ' + fac.color + ';display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">' + ut.icon + '</span>' +
                '<div style="min-width:0;flex:1;">' +
                  '<div style="font-weight:700;font-size:12.5px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + fac.icon + ' ' + esc(u.label || ut.label) + '</div>' +
                  '<div style="font-size:11px;color:var(--wi-steel);display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' +
                    '<span style="color:' + st.color + ';font-weight:700;">' + st.icon + ' ' + esc(st.label) + '</span>' +
                    '<span>• ' + esc(u.strength || ut.defaultStr || ut.label) + '</span>' +
                    '<span style="color:' + (hp >= 70 ? '#6ee7b7' : (hp >= 40 ? '#fde68a' : '#fca5a5')) + ';">• ' + hp + '%</span>' +
                    (hasMarch ? '<span style="color:#38bdf8;font-weight:700;">• 🏃 Марш (' + u.marchPath.length + ')</span>' : '') +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div style="display:flex;gap:4px;flex-shrink:0;">' +
                '<button class="btn btn-ghost" data-wi-focus-unit="' + idx + '" style="font-size:11px;padding:3px 7px;" title="Навести камеру">🎯</button>' +
                '<button class="btn btn-ghost" data-wi-march-unit="' + idx + '" style="font-size:11px;padding:3px 7px;color:#38bdf8;" title="Задать маршрут марша">🏃</button>' +
                '<button class="btn btn-ghost" data-wi-del-unit="' + idx + '" style="font-size:11px;padding:3px 7px;color:#ef4444;" title="Снять соединение">🗑️</button>' +
              '</div>' +
            '</div>';
          }).join('') : '<div class="char-empty" style="grid-column:1/-1;">Нет размещённых соединений выбранной фракции. Выберите инструмент «♟️ Отряд» и кликните по карте или загрузите сценарий!</div>') +
        '</div>';

    } else if(curTab === 'battles'){
      var attIdx = Math.max(0, Math.min(units.length - 1, m.battleAttackerIdx || 0));
      var defIdx = Math.max(0, Math.min(units.length - 1, m.battleDefenderIdx != null ? m.battleDefenderIdx : (units.length > 1 ? 1 : 0)));
      var unitSelectOpts = function(selIdx){
        return units.map(function(u, i){
          var fk = u.nation_override || u.nation;
          var fac = WI_TACTICAL_FACTIONS[fk] || WI_TACTICAL_FACTIONS.nilfgaard;
          var ut = WI_TACTICAL_UNIT_TYPES[u.type] || WI_TACTICAL_UNIT_TYPES.army;
          var hp = (u.hp != null ? u.hp : 100);
          return '<option value="' + i + '"' + (i === selIdx ? ' selected' : '') + '>' + fac.icon + ' ' + ut.icon + ' ' + esc(u.label || ut.label) + ' (Сила ' + (ut.basePow || 5) + ', Боесп. ' + hp + '%)</option>';
        }).join('');
      };

      var clashesCardsHtml = clashes.length ? (
        '<div style="margin-bottom:14px;">' +
          '<div style="font-size:11.5px;color:#fca5a5;font-weight:800;font-family:\'JetBrains Mono\',monospace;margin-bottom:6px;">🔥 АКТИВНЫЕ СОПРИКОСНОВЕНИЯ ВОЙСК НА КАРТЕ (' + clashes.length + '):</div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:8px;">' +
            clashes.map(function(cl){
              var facA = WI_TACTICAL_FACTIONS[cl.uA.nation_override || cl.uA.nation] || WI_TACTICAL_FACTIONS.nilfgaard;
              var facB = WI_TACTICAL_FACTIONS[cl.uB.nation_override || cl.uB.nation] || WI_TACTICAL_FACTIONS.redania;
              var ter = getTerrainAt(cl.mx, cl.my);
              return '<div style="background:rgba(127,29,29,0.22);border:1px solid rgba(239,68,68,0.45);border-radius:6px;padding:8px 10px;display:flex;justify-content:space-between;align-items:center;gap:8px;">' +
                '<div style="min-width:0;">' +
                  '<div style="font-size:12px;font-weight:700;color:#fff;">' + facA.icon + ' ' + esc(cl.uA.label) + ' <span style="color:#ef4444;">⚔️</span> ' + facB.icon + ' ' + esc(cl.uB.label) + '</div>' +
                  '<div style="font-size:11px;color:var(--wi-steel);">Поле боя: ' + ter.icon + ' ' + esc(ter.name) + ' • Дистанция: ' + cl.dist + 'px</div>' +
                '</div>' +
                '<button class="btn btn-primary" data-wi-sim-pair="' + cl.idxA + ',' + cl.idxB + '" style="font-size:11px;padding:4px 9px;flex-shrink:0;">🎲 В симулятор</button>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>'
      ) : '';

      var logHtml = (m.battleLog && m.battleLog.length) ? (
        '<div style="margin-top:12px;border-top:1px solid var(--wi-border);padding-top:10px;">' +
          '<div style="font-size:11.5px;color:var(--wi-amber);font-family:\'JetBrains Mono\',monospace;font-weight:700;margin-bottom:6px;">📜 ХРОНИКА СРАЖЕНИЙ И ПОТЕРЬ:</div>' +
          '<div style="display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;">' +
            m.battleLog.map(function(entry){
              return '<div style="background:rgba(255,255,255,0.03);border-left:3px solid ' + (entry.color || '#f59e0b') + ';padding:6px 10px;border-radius:4px;font-size:12px;color:#e2e8f0;">' +
                '<div style="font-weight:700;color:#fbbf24;">' + esc(entry.title) + '</div>' +
                '<div style="font-size:11.5px;color:var(--wi-silver);margin-top:2px;">' + esc(entry.desc) + '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>'
      ) : '';

      tabBodyHtml =
        clashesCardsHtml +
        '<div style="background:rgba(15,20,30,0.85);border:1px solid var(--wi-border);border-radius:8px;padding:12px;">' +
          '<div style="font-family:\'Cinzel\',serif;font-weight:800;font-size:14px;color:var(--wi-amber);margin-bottom:8px;">🎲 ТАКТИЧЕСКИЙ СИМУЛЯТОР СРАЖЕНИЯ (2d6 + Мощь рода войск + Рельеф)</div>' +
          (units.length >= 2 ? (
            '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(230px, 1fr));gap:10px;align-items:end;">' +
              '<div>' +
                '<label style="font-size:11px;color:#fca5a5;font-weight:700;display:block;margin-bottom:4px;">⚔️ АТАКУЮЩЕЕ СОЕДИНЕНИЕ:</label>' +
                '<select id="wiSimAttackerSel" class="wi-war-select" style="width:100%;">' + unitSelectOpts(attIdx) + '</select>' +
              '</div>' +
              '<div>' +
                '<label style="font-size:11px;color:#6ee7b7;font-weight:700;display:block;margin-bottom:4px;">🛡️ ОБОРОНЯЮЩЕЕСЯ СОЕДИНЕНИЕ:</label>' +
                '<select id="wiSimDefenderSel" class="wi-war-select" style="width:100%;">' + unitSelectOpts(defIdx) + '</select>' +
              '</div>' +
              '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
                '<button class="btn btn-primary" id="wiSimRollClashBtn" style="flex:1;padding:7px 14px;font-weight:800;">⚔️ Разыграть столкновение (2d6)</button>' +
                '<button class="btn btn-ghost" id="wiSimMoveToBattleBtn" title="Подтянуть атакующий отряд вплотную к обороняющемуся с анимацией">🏃 Сблизить войска</button>' +
              '</div>' +
            '</div>'
          ) : '<div class="char-empty">Разместите на карте хотя бы 2 отряда, чтобы разыгрывать тактические сражения.</div>') +
          logHtml +
        '</div>';

    } else if(curTab === 'regions'){
      var territoriesList = getWiTerritoriesList();
      var counts = {};
      territoriesList.forEach(function(t){
        var fk = t.ownerKey || t.defaultFaction || 'independent';
        counts[fk] = (counts[fk] || 0) + 1;
      });
      var totalReg = territoriesList.length || 1;
      var barSegments = Object.keys(counts).map(function(fk){
        var f = WI_TACTICAL_FACTIONS[fk] || { name: fk, color: '#64748b', icon: '🏴' };
        var pct = ((counts[fk] / totalReg) * 100).toFixed(1);
        return '<div style="width:' + pct + '%;background:' + f.color + ';height:100%;" title="' + escA(f.name + ': ' + counts[fk] + ' рег. (' + pct + '%)') + '"></div>';
      }).join('');

      var qReg = (m.regionSearch || '').toLowerCase().trim();
      var filteredRegs = territoriesList.filter(function(t){
        return !qReg || t.name.toLowerCase().indexOf(qReg) !== -1 || t.labelText.toLowerCase().indexOf(qReg) !== -1;
      });

      tabBodyHtml =
        '<div style="margin-bottom:10px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;font-size:11.5px;color:var(--wi-steel);">' +
            '<span>ГЕОПОЛИТИЧЕСКИЙ БАЛАНС КОНТИНЕНТА (' + territoriesList.length + ' СТРАН И КНЯЖЕСТВ):</span>' +
            '<input type="text" id="wiTacticsRegionSearch" class="wi-input" style="max-width:220px;padding:3px 8px;font-size:11.5px;" placeholder="🔍 Фильтр региона..." value="' + escA(m.regionSearch || '') + '">' +
          '</div>' +
          '<div style="height:10px;width:100%;border-radius:5px;overflow:hidden;display:flex;background:#090d16;border:1px solid var(--wi-border);">' + barSegments + '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(250px, 1fr));gap:8px;max-height:320px;overflow-y:auto;padding-right:4px;">' +
          filteredRegs.map(function(t){
            var curOwner = (m.territoryOwners && m.territoryOwners[t.id]) || 'independent';
            var opts = Object.keys(WI_TACTICAL_FACTIONS).map(function(fk){
              var f = WI_TACTICAL_FACTIONS[fk];
              return '<option value="' + fk + '"' + (curOwner === fk ? ' selected' : '') + '>' + f.short + '</option>';
            }).join('');
            return '<div style="background:rgba(15,20,30,0.75);border:1px solid var(--wi-border);border-left:4px solid ' + t.color + ';border-radius:6px;padding:7px 10px;display:flex;justify-content:space-between;align-items:center;gap:8px;">' +
              '<div style="min-width:0;flex:1;">' +
                '<div style="font-weight:700;font-size:12px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + t.icon + ' ' + esc(t.name) + '</div>' +
              '</div>' +
              '<select class="wi-war-select wi-territory-owner-sel" data-tid="' + escA(t.id) + '" style="padding:3px 6px;font-size:11px;max-width:145px;">' + opts + '</select>' +
            '</div>';
          }).join('') +
        '</div>';

    } else if(curTab === 'scenarios'){
      tabBodyHtml =
        '<div style="margin-bottom:12px;">' +
          '<div style="font-size:11.5px;color:var(--wi-steel);margin-bottom:8px;">Выберите историческую кампанию Северных войн, чтобы мгновенно расставить армии, фронты, стрелы ударов и границы:</div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(270px, 1fr));gap:10px;">' +
            WI_TACTICAL_SCENARIOS.map(function(sc){
              return '<div class="wi-tactics-scenario-card" data-wi-scenario="' + escA(sc.id) + '">' +
                '<div style="font-family:\'Cinzel\',serif;font-weight:800;font-size:13px;color:var(--wi-amber);margin-bottom:4px;">' + esc(sc.name) + '</div>' +
                '<div style="font-size:11.5px;color:var(--wi-silver);line-height:1.4;">' + esc(sc.desc) + '</div>' +
                '<div style="margin-top:6px;font-size:10.5px;color:#38bdf8;font-family:\'JetBrains Mono\',monospace;">♟️ Соединений: ' + (sc.units ? sc.units.length : 0) + ' • 🏹 Фронтов: ' + (sc.warPaths ? sc.warPaths.length : 0) + '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div style="background:rgba(15,20,30,0.85);border:1px solid rgba(245,158,11,0.35);border-radius:8px;padding:12px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
            '<div>' +
              '<div style="font-family:\'Cinzel\',serif;font-weight:800;font-size:14px;color:#fbbf24;">🤖 Сводка Военного Совета и Разведки ИИ</div>' +
              '<div style="font-size:11.5px;color:var(--wi-steel);">ИИ-аналитик (Дийкстра / Ваттье де Ридо) проанализирует текущее положение армий и границ на вашей карте</div>' +
            '</div>' +
            '<button class="btn btn-primary" id="wiTacticsAiReportBtn" style="font-size:12px;">📜 Составить оперативную сводку</button>' +
          '</div>' +
          (m.aiWarReport ? ('<div style="margin-top:10px;padding:10px 12px;background:rgba(0,0,0,0.45);border-left:3px solid var(--wi-amber);border-radius:4px;font-family:\'EB Garamond\',serif;font-size:14.5px;line-height:1.55;color:#f1f5f9;white-space:pre-wrap;">' + esc(m.aiWarReport) + '</div>') : '') +
        '</div>';
    }

    return selectedUnitHtml +
      '<div class="wi-char-sheet-card" style="margin-top:12px;">' +
        tabsBarHtml +
        tabBodyHtml +
      '</div>';
  }

  /* Инспектор режима «📜 Доска объявлений» (Notice Board + пошаговый конструктор ИИ/случайных заказов) */
  function renderWiNoticeBoardInspector(curLoc){
    var m = WI.map;
    curLoc = curLoc || getWiActiveLocation(m);
    var enc = getWiLocationEncyclopedia(curLoc);
    var locContracts = getWiBoardContractsForLoc(curLoc);
    var activeCid = m.boardSelectedContractId;
    var selContract = locContracts.find(function(c){ return c.id === activeCid; }) || locContracts[0] || null;
    if(selContract && m.boardSelectedContractId !== selContract.id){
      m.boardSelectedContractId = selContract.id;
    }

    var cfgDefs = [
      {
        key: 'type',
        prop: 'boardType',
        defVal: 'monster',
        title: 'Тип заказа',
        shortLbl: 'Тип',
        items: [
          { v: 'monster', l: '🐺 Охота на чудовище', s: '🐺 Охота' },
          { v: 'curse',   l: '🕯️ Снятие проклятия', s: '🕯️ Проклятие' },
          { v: 'missing', l: '🔍 Поиск пропавших / Детектив', s: '🔍 Детектив' },
          { v: 'escort',  l: '🛡️ Охрана / Зачистка тракта', s: '🛡️ Охрана' },
          { v: 'alchemy', l: '🧪 Редкий трофей / Алхимия', s: '🧪 Алхимия' },
          { v: 'bounty',  l: '⚔️ Головорезы / Скоя\'таэли', s: '⚔️ Головорезы' }
        ]
      },
      {
        key: 'class',
        prop: 'boardMonsterClass',
        defVal: 'auto',
        title: 'Класс бестии',
        shortLbl: 'Бестия',
        items: [
          { v: 'auto',        l: '🎲 Авто (по местности)', s: '🎲 Авто' },
          { v: 'necrophages', l: '💀 Трупоеды (гули, бабы, туманники)', s: '💀 Трупоеды' },
          { v: 'specters',    l: '👻 Призраки (полуденницы, химоры)', s: '👻 Призраки' },
          { v: 'relicts',     l: '🦌 Реликты (лешие, бесы, ведьмы)', s: '🦌 Реликты' },
          { v: 'vampires',    l: '🦇 Вампиры (бруксы, катаканы, эккимы)', s: '🦇 Вампиры' },
          { v: 'draconids',   l: '🐉 Дракониды (виверны, василиски)', s: '🐉 Дракониды' },
          { v: 'hybrids',     l: '🦅 Гибриды (грифоны, сирены, эхидны)', s: '🦅 Гибриды' },
          { v: 'cursed',      l: '🌕 Проклятые (волколаки, берсерки)', s: '🌕 Проклятые' },
          { v: 'insectoids',  l: '🕷️ Инсектоиды (эндриаги, главоглазы)', s: '🕷️ Инсектоиды' },
          { v: 'ogroids',     l: '🧌 Огроиды (тролли, накеры, циклопы)', s: '🧌 Огроиды' },
          { v: 'elementa',    l: '🗿 Элементали и големы', s: '🗿 Элементали' },
          { v: 'beasts',      l: '🗡️ Бандиты, дезертиры и звери', s: '🗡️ Бандиты' }
        ]
      },
      {
        key: 'reward',
        prop: 'boardRewardTier',
        defVal: 'standard',
        title: 'Уровень оплаты',
        shortLbl: 'Оплата',
        items: [
          { v: 'poor',     l: '🪙 Скромная (50–110 + припасы)', s: '🪙 50–110' },
          { v: 'standard', l: '💰 Стандартная (200–400 монет)', s: '💰 200–400' },
          { v: 'generous', l: '💎 Щедрая купеческая (500–900)', s: '💎 500–900' },
          { v: 'royal',    l: '👑 Королевская (1350–2500 + реликт)', s: '👑 1350+' }
        ]
      },
      {
        key: 'currency',
        prop: 'boardCurrency',
        defVal: 'auto',
        title: 'Валюта расчёта',
        shortLbl: 'Валюта',
        items: [
          { v: 'auto',    l: '🏛️ По региону локации', s: '🏛️ Авто' },
          { v: 'crowns',  l: '🪙 Новиградские кроны', s: '🪙 Кроны' },
          { v: 'orens',   l: '⚜️ Темерские орены', s: '⚜️ Орены' },
          { v: 'florens', l: '☀️ Нильфгаардские флорены', s: '☀️ Флорены' },
          { v: 'bizants', l: '💎 Ковирские бизанты', s: '💎 Бизанты' },
          { v: 'barter',  l: '🎁 Бартер / Право Неожиданности', s: '🎁 Бартер' }
        ]
      },
      {
        key: 'difficulty',
        prop: 'boardDifficulty',
        defVal: 'medium',
        title: 'Сложность охоты',
        shortLbl: 'Сложность',
        items: [
          { v: 'low',    l: '🟢 Низкая (Ур. 1–4)', s: '🟢 Ур. 1–4' },
          { v: 'medium', l: '🟡 Средняя (Ур. 5–9)', s: '🟡 Ур. 5–9' },
          { v: 'hard',   l: '🟠 Высокая (Ур. 10–14)', s: '🟠 Ур. 10–14' },
          { v: 'deadly', l: '🔴 Смертельная / Архибестия (15+)', s: '🔴 Архибестия' }
        ]
      },
      {
        key: 'depth',
        prop: 'boardDepth',
        defVal: 'detailed',
        title: 'Глубина проработки',
        shortLbl: 'Детали',
        items: [
          { v: 'short',    l: '📄 Краткая сводка', s: '📄 Кратко' },
          { v: 'detailed', l: '📜 Детальный заказ (фазы + улики)', s: '📜 Детально' },
          { v: 'master',   l: '📖 Глубокий модуль Мастера', s: '📖 Модуль ГМ' }
        ]
      },
      {
        key: 'twist',
        prop: 'boardTwist',
        defVal: 'random',
        title: 'Сюжетный поворот',
        shortLbl: 'Поворот',
        items: [
          { v: 'random',           l: '🎲 Случайная интрига', s: '🎲 Случайно' },
          { v: 'monster_innocent', l: '🕊️ Бестия разумна / защищается', s: '🕊️ Бестия невинна' },
          { v: 'client_lying',     l: '🐍 Заказчик скрывает правду', s: '🐍 Ложь нанимателя' },
          { v: 'double_monster',   l: '🐺🐺 В логове более опасная тварь', s: '🐺🐺 Двойное дно' },
          { v: 'curse_love',       l: '💔 Трагическое проклятие любви/крови', s: '💔 Проклятие' },
          { v: 'straight',         l: '⚔️ Прямая охота без подвоха', s: '⚔️ Без подвоха' }
        ]
      }
    ];

    // Отдельная пошаговая панель настройки заказа (открывается по кнопке, каждый параметр выбирается отдельно по клику на вкладку)
    var builderHtml = '';
    if(m.boardBuilderOpen){
      var activeCfgKey = m.boardCfgTab || null;
      var activeCfgObj = cfgDefs.find(function(cd){ return cd.key === activeCfgKey; }) || null;

      var cfgChipsHtml = cfgDefs.map(function(cd){
        var curVal = m[cd.prop] || cd.defVal;
        var foundItem = cd.items.find(function(it){ return it.v === curVal; }) || cd.items[0];
        var isTabOpen = (activeCfgKey === cd.key);
        var isChanged = (curVal !== cd.defVal);
        return '<button type="button" class="wi-board-step-chip ' + (isTabOpen ? 'active' : '') + (isChanged ? ' customized' : '') + '" data-wi-board-cfg-tab="' + cd.key + '" title="Нажмите, чтобы отдельно выбрать: ' + escA(cd.title) + '">' +
          '<span class="wi-board-step-chip-k">' + esc(cd.shortLbl) + ':</span> ' +
          '<span class="wi-board-step-chip-v">' + esc(foundItem.s) + '</span>' +
          '<span style="font-size:9px;opacity:0.65;margin-left:2px;">' + (isTabOpen ? '▲' : '▼') + '</span>' +
        '</button>';
      }).join('');

      var activePickerHtml = '';
      if(activeCfgObj){
        var curPropVal = m[activeCfgObj.prop] || activeCfgObj.defVal;
        activePickerHtml =
          '<div class="wi-board-step-picker">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
              '<span style="font-size:11px;font-weight:700;color:#fbbf24;text-transform:uppercase;letter-spacing:0.4px;">Выберите параметр — ' + esc(activeCfgObj.title) + ':</span>' +
              '<button type="button" class="btn btn-ghost" id="wiBoardCloseCfgTabBtn" style="font-size:10px;padding:1px 6px;">Свернуть ▲</button>' +
            '</div>' +
            '<div style="display:flex;gap:5px;flex-wrap:wrap;">' +
              activeCfgObj.items.map(function(it){
                var isPicked = (curPropVal === it.v);
                return '<button type="button" class="wi-war-tool ' + (isPicked ? 'active' : '') + '" data-wi-board-cfg-pick="' + activeCfgObj.prop + ':' + it.v + '" style="font-size:11.5px;padding:4px 9px;">' + esc(it.l) + '</button>';
              }).join('') +
            '</div>' +
          '</div>';
      }

      builderHtml =
        '<div class="wi-board-builder-panel">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:6px;">' +
            '<span style="font-size:11.5px;font-weight:800;color:#fde68a;font-family:\'Cinzel\',serif;">✨ Конструктор заказа (выбирайте только нужные параметры по отдельности)</span>' +
            '<button type="button" class="btn btn-ghost" id="wiBoardResetCfgBtn" style="font-size:10px;padding:2px 7px;color:#94a3b8;" title="Сбросить все параметры к авто-значениям">↺ Сброс</button>' +
          '</div>' +
          '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:7px;">' +
            '<input type="text" id="wiBoardPromptInput" class="wi-input" style="flex:1;min-width:180px;padding:5px 10px;font-size:12px;" placeholder="✍️ Своё описание (необязательно: леший у мельницы, проклятая свадьба)..." value="' + escA(m.boardPrompt || '') + '">' +
            '<button type="button" class="btn btn-primary" id="wiBoardGenAiBtn" ' + (m.boardLoading ? 'disabled' : '') + ' style="font-size:11.5px;padding:5px 11px;white-space:nowrap;">' + (m.boardLoading ? '⏳ ИИ пишет...' : '✨ Создать через ИИ') + '</button>' +
            '<button type="button" class="btn btn-ghost" id="wiBoardGenCustomRandomBtn" style="font-size:11px;padding:5px 9px;color:#fde68a;border-color:rgba(245,158,11,0.4);white-space:nowrap;" title="Сгенерировать заказ с выбранными ниже параметрами без ИИ">🎲 По параметрам</button>' +
          '</div>' +
          '<div style="font-size:10.5px;color:#94a3b8;margin-bottom:4px;">Нажмите на любой параметр ниже, чтобы настроить его отдельно:</div>' +
          '<div class="wi-board-step-chips-row">' +
            cfgChipsHtml +
          '</div>' +
          activePickerHtml +
        '</div>';
    }

    var noticesHtml = locContracts.map(function(c){
      var isSel = (selContract && selContract.id === c.id);
      return '<div class="wi-board-note ' + (isSel ? 'active' : '') + '" data-wi-board-cid="' + escA(c.id) + '">' +
        '<div class="wi-board-pin"></div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:4px;margin-bottom:2px;">' +
          '<span style="font-size:9.5px;font-weight:800;color:' + (c.isAi ? '#c084fc' : '#d97706') + ';text-transform:uppercase;letter-spacing:0.3px;">' + (c.isAi ? '✨ ИИ' : '📜 Заказ') + ' • ' + esc((c.typeLabel || 'Охота').replace(/^[^\s]+\s/, '')) + '</span>' +
          '<button type="button" class="wi-board-del-btn" data-wi-board-del="' + escA(c.id) + '" title="Сорвать объявление с доски">✕</button>' +
        '</div>' +
        '<div style="font-family:\'Cinzel\',serif;font-weight:800;font-size:12px;color:#fef3c7;line-height:1.22;margin-bottom:3px;">' + esc(c.title) + '</div>' +
        '<div style="font-size:10.5px;color:#cbd5e1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">🐺 ' + esc(c.monster) + '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;padding-top:3px;border-top:1px dashed rgba(245,158,11,0.22);font-size:10.5px;">' +
          '<span style="color:#fde68a;font-weight:700;">🪙 ' + esc(c.reward) + '</span>' +
          '<span style="color:#94a3b8;font-size:9.5px;">' + esc((c.difficulty || '').split(' (')[0]) + '</span>' +
        '</div>' +
      '</div>';
    }).join('');

    var detailHtml = '';
    if(selContract){
      var phasesHtml = (Array.isArray(selContract.phases) && selContract.phases.length)
        ? '<div style="margin-top:7px;padding:6px 9px;background:rgba(0,0,0,0.32);border-radius:5px;border:1px solid rgba(255,255,255,0.06);">' +
            '<div style="font-size:10px;font-weight:700;color:#fbbf24;text-transform:uppercase;margin-bottom:3px;">🗺️ Этапы расследования и охоты:</div>' +
            '<div style="display:flex;flex-direction:column;gap:3px;font-size:11px;color:#e2e8f0;">' +
              selContract.phases.map(function(ph){ return '<div>• ' + esc(ph) + '</div>'; }).join('') +
            '</div>' +
          '</div>'
        : '';

      detailHtml =
        '<div class="wi-board-detail-card" style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(245,158,11,0.22);">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;flex-wrap:wrap;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.06);">' +
            '<div style="flex:1;min-width:180px;">' +
              '<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">' +
                '<span style="font-family:\'Cinzel\',serif;font-size:14px;font-weight:800;color:#fbbf24;">📜 ' + esc(selContract.title) + '</span>' +
                '<span class="wi-school-badge" style="font-size:10px;padding:1px 6px;">' + esc(selContract.monsterClass || 'Бестия') + '</span>' +
              '</div>' +
              '<div style="font-size:11px;color:#cbd5e1;margin-top:2px;">' +
                'Заказчик: <b style="color:#fff;">' + esc(selContract.client) + '</b> • Плата: <b style="color:#fde68a;">🪙 ' + esc(selContract.reward) + '</b>' +
                (selContract.haggleMax ? (' <span style="color:#6ee7b7;">(торг до ' + esc(selContract.haggleMax) + ')</span>') : '') +
              '</div>' +
            '</div>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap;">' +
              '<button type="button" class="btn btn-primary" id="wiBoardMarkLairBtn" data-cid="' + escA(selContract.id) + '" style="font-size:10.5px;padding:3px 8px;" title="Отметить логово на карте">📍 На карту</button>' +
              '<button type="button" class="btn btn-ghost" id="wiBoardCopyContractBtn" data-cid="' + escA(selContract.id) + '" style="font-size:10.5px;padding:3px 7px;" title="Скопировать текст заказа">📋</button>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:6px;padding:6px 10px;background:rgba(245,158,11,0.06);border-left:3px solid #f59e0b;border-radius:4px;font-family:\'EB Garamond\',serif;font-style:italic;font-size:13px;color:#fef3c7;line-height:1.4;">' +
            esc(selContract.noticeText || '') +
          '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:6px;margin-top:7px;font-size:11px;">' +
            '<div style="background:rgba(0,0,0,0.35);padding:5px 8px;border-radius:4px;border:1px solid rgba(255,255,255,0.05);">' +
              '<span style="color:var(--wi-steel);font-size:9.5px;display:block;text-transform:uppercase;">🐺 Цель охоты:</span>' +
              '<b style="color:#fca5a5;">' + esc(selContract.monster) + '</b>' +
            '</div>' +
            '<div style="background:rgba(0,0,0,0.35);padding:5px 8px;border-radius:4px;border:1px solid rgba(255,255,255,0.05);">' +
              '<span style="color:var(--wi-steel);font-size:9.5px;display:block;text-transform:uppercase;">🔍 Улики (Ведьмачье чутьё):</span>' +
              '<span style="color:#e2e8f0;">' + esc(selContract.clues) + '</span>' +
            '</div>' +
            '<div style="background:rgba(0,0,0,0.35);padding:5px 8px;border-radius:4px;border:1px solid rgba(255,255,255,0.05);">' +
              '<span style="color:var(--wi-steel);font-size:9.5px;display:block;text-transform:uppercase;">🧪 Подготовка (Масла / Знаки):</span>' +
              '<span style="color:#6ee7b7;">' + esc(selContract.prep) + '</span>' +
            '</div>' +
            (selContract.twist ? (
              '<div style="background:rgba(168,85,247,0.08);padding:5px 8px;border-radius:4px;border:1px solid rgba(168,85,247,0.28);">' +
                '<span style="color:#d8b4fe;font-size:9.5px;display:block;text-transform:uppercase;">🎭 Секрет / Интрига:</span>' +
                '<span style="color:#f3e8ff;">' + esc(selContract.twist) + '</span>' +
              '</div>'
            ) : '') +
          '</div>' +
          phasesHtml +
        '</div>';
    }

    return '<div class="wi-char-sheet-card wi-notice-board-wrap" style="padding:10px 12px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;padding-bottom:7px;border-bottom:1px solid var(--wi-border);">' +
        '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0;">' +
          '<span style="font-family:\'Cinzel\',serif;font-weight:800;font-size:14px;color:#fbbf24;">📜 ' + (curLoc.icon || '🏰') + ' ' + esc(curLoc.name) + '</span>' +
          '<span class="wi-school-badge" style="font-size:10px;padding:1px 6px;">' + esc(curLoc.region) + '</span>' +
        '</div>' +
        '<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;">' +
          '<button type="button" class="btn btn-ghost" id="wiBoardGenRandomBtn" style="font-size:11px;padding:3px 8px;color:#fde68a;border-color:rgba(245,158,11,0.45);" title="Сразу повесить на доску случайный ведьмачий заказ">🎲 Случайный</button>' +
          '<button type="button" class="btn ' + (m.boardBuilderOpen ? 'btn-primary' : 'btn-ghost') + '" id="wiBoardToggleBuilderBtn" style="font-size:11px;padding:3px 9px;' + (!m.boardBuilderOpen ? 'color:#c084fc;border-color:rgba(192,132,252,0.45);' : '') + '" title="Открыть конструктор заказа (описание и пошаговые настройки через ИИ)">' + (m.boardBuilderOpen ? '✕ Скрыть конструктор' : '⚙️ Свой заказ / ИИ') + '</button>' +
          '<button type="button" class="btn btn-ghost" id="wiBoardSwitchToInspectBtn" style="font-size:11px;padding:3px 7px;" title="Перейти к паспорту локации">🗺️ Инфо</button>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:10.5px;color:var(--wi-steel);margin-top:5px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;">' +
        '<span>🐺 Бестии в округе: <b style="color:#fca5a5;">' + esc(enc.monsters) + '</b></span>' +
        '<span style="color:#94a3b8;">Объявлений: <b style="color:#fbbf24;">' + locContracts.length + '</b></span>' +
      '</div>' +
      builderHtml +
      '<div class="wi-board-grid">' +
        noticesHtml +
      '</div>' +
      detailHtml +
    '</div>';
  }

  /* Экран КАРТА МИРА (wiMap) — удобный двухколоночный интерфейс (Карта слева + Боковая панель справа) */
  function wiMap(){
    var m = WI.map;
    if(!m.userMarkers || !m.userMarkers.length) WI.loadUserMarkers();
    if(!m.tacticsLoaded) WI.loadTacticalState();
    WI.loadBoardContracts();

    var markersCount = (m.userMarkers || []).length;
    var tacticsCount = ((m.warPaths && m.warPaths.length) || 0) + ((m.tacticalUnits && m.tacticalUnits.length) || 0);
    var curLoc = getWiActiveLocation(m);
    var isTactics = (m.mode === 'tactics');
    var isRoute = (m.mode === 'route');
    var isMarkers = (m.mode === 'markers');
    var isBoard = (m.mode === 'board');

    // Компактная панель инструментов режима Тактики
    var tacticsPaletteHtml = '';
    if(isTactics){
      var toolBtns = [
        { id: 'pan',     label: '✋ Камера', title: 'Перемещение карты и выбор отрядов кликом' },
        { id: 'unit',    label: '♟️ + Отряд', title: 'Клик по карте размещает выбранный род войск' },
        { id: 'march',   label: '🏃 Марш', title: 'Клик по карте добавляет точку маршрута выбранному отряду' },
        { id: 'arrow',   label: '🏹 Стрела', title: 'Зажмите ЛКМ и проведите стрелу наступления армии' },
        { id: 'paint',   label: '🧱 Фронт', title: 'Зажмите ЛКМ и нарисуйте оборонительный рубеж' },
        { id: 'capture', label: '🏴 Захват', title: 'Клик по региону передаёт его выбранной державе' },
        { id: 'eraser',  label: '🧹 Ластик', title: 'Клик по отряду или линии фронта удаляет их с карты' }
      ].map(function(tb){
        return '<button class="wi-war-tool ' + (m.tacticsTool === tb.id ? 'active' : '') + '" data-wi-tactics-tool="' + tb.id + '" title="' + escA(tb.title) + '">' + tb.label + '</button>';
      }).join('');

      var factionSelectOpts = Object.keys(WI_TACTICAL_FACTIONS).map(function(fk){
        var f = WI_TACTICAL_FACTIONS[fk];
        return '<option value="' + fk + '"' + (m.warNation === fk ? ' selected' : '') + '>' + f.short + ' — ' + esc(f.name) + '</option>';
      }).join('');

      var brushSelectOpts = [
        { s: 28, l: 'Тонкая (28px)' },
        { s: 48, l: 'Средняя (48px)' },
        { s: 75, l: 'Широкая (75px)' }
      ].map(function(sz){
        return '<option value="' + sz.s + '"' + ((m.brushSize || 48) === sz.s ? ' selected' : '') + '>' + sz.l + '</option>';
      }).join('');

      var activeFac = WI_TACTICAL_FACTIONS[m.warNation] || WI_TACTICAL_FACTIONS.nilfgaard;

      tacticsPaletteHtml =
        '<div class="wi-war-palette">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;width:100%;">' +
            '<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">' +
              toolBtns +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">' +
              '<button class="wi-war-tool" id="wiWarAnimateAllBtn" style="color:#38bdf8;border-color:rgba(56,189,248,0.45);" title="Плавно переместить все отряды по их маршрутам марша">▶️ Марш</button>' +
              '<button class="wi-war-tool" id="wiWarUndoBtn" title="Отменить последнее действие">↩️</button>' +
              '<button class="wi-war-tool" id="wiWarClearBtn" style="color:#fca5a5;" title="Сбросить тактическую карту">🗑️</button>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-top:5px;border-top:1px solid rgba(255,255,255,0.08);width:100%;">' +
            '<label style="font-size:10.5px;color:var(--wi-steel);font-family:\'JetBrains Mono\',monospace;display:inline-flex;align-items:center;gap:4px;">' +
              '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + activeFac.color + ';"></span>ДЕРЖАВА:' +
              '<select id="wiWarFactionSelect" class="wi-war-select">' + factionSelectOpts + '</select>' +
            '</label>' +
            '<label style="font-size:10.5px;color:var(--wi-steel);font-family:\'JetBrains Mono\',monospace;display:inline-flex;align-items:center;gap:4px;">' +
              'ВОЙСКА:' +
              '<select id="wiWarUnitTypeSelect" class="wi-war-select">' + buildWiUnitTypeOptionsHtml(m.unitType || 'army') + '</select>' +
            '</label>' +
            ((m.tacticsTool === 'paint' || m.tacticsTool === 'arrow') ? (
              '<label style="font-size:10.5px;color:var(--wi-steel);font-family:\'JetBrains Mono\',monospace;display:inline-flex;align-items:center;gap:4px;">' +
                'КИСТЬ:' +
                '<select id="wiWarBrushSizeSelect" class="wi-war-select">' + brushSelectOpts + '</select>' +
              '</label>'
            ) : '') +
          '</div>' +
        '</div>';
    }

    // Компактный навигатор локаций в верхней части правой панели (для Атласа и Доски объявлений)
    var atlasFilterHtml = '';
    if(m.mode === 'inspect' || m.mode === 'board'){
      var regionTabs = [
        { k: 'all', l: '🌍 Все регионы (' + WI_MAP_LOCATIONS.length + ')' },
        { k: 'temeria', l: '⚜️ Темерия и Велен' },
        { k: 'redania', l: '🦅 Редания и Новиград' },
        { k: 'kaedwen_aedirn', l: '🦄 Каэдвен, Аэдирн и Лирия' },
        { k: 'skellige', l: '⛵ Острова Скеллиге' },
        { k: 'nilfgaard', l: '☀️ Нильфгаард и Цинтра' },
        { k: 'toussaint', l: '🍇 Княжество Туссент' },
        { k: 'scoiatael', l: '🏹 Брокилон и Махакам' },
        { k: 'kovir', l: '💎 Ковир и Повисс' }
      ];
      var typeTabs = [
        { k: 'all', l: '🏷️ Все типы' },
        { k: 'capital', l: '👑 Столицы' },
        { k: 'witcher', l: '🐺 Крепости ведьмаков' },
        { k: 'city', l: '🏰 Города и замки' },
        { k: 'village', l: '🏡 Деревни и корчмы' },
        { k: 'nature', l: '🌲 Леса, топи и горы' },
        { k: 'magic', l: '🔮 Академии и святилища' }
      ];

      var filteredLocs = WI_MAP_LOCATIONS.filter(function(l){
        if(m.regionFilter && m.regionFilter !== 'all' && l.regionKey !== m.regionFilter) return false;
        if(m.typeFilter && m.typeFilter !== 'all' && l.type !== m.typeFilter) return false;
        var q = (m.search || '').toLowerCase().trim();
        if(q && l.name.toLowerCase().indexOf(q) === -1 && (l.region || '').toLowerCase().indexOf(q) === -1) return false;
        return true;
      });

      var regSelectOpts = regionTabs.map(function(rt){
        return '<option value="' + escA(rt.k) + '"' + ((m.regionFilter || 'all') === rt.k ? ' selected' : '') + '>' + esc(rt.l) + '</option>';
      }).join('');

      var typeSelectOpts = typeTabs.map(function(tt){
        return '<option value="' + escA(tt.k) + '"' + ((m.typeFilter || 'all') === tt.k ? ' selected' : '') + '>' + esc(tt.l) + '</option>';
      }).join('');

      var locSelectOpts = filteredLocs.map(function(l){
        return '<option value="' + escA(l.id) + '"' + (curLoc && curLoc.id === l.id ? ' selected' : '') + '>' + l.icon + ' ' + esc(l.name) + ' (' + esc(l.region) + ')</option>';
      }).join('');
      if(curLoc && curLoc.isWildSpot){
        locSelectOpts = '<option value="wild_spot" selected>' + (curLoc.icon || '🌲') + ' ' + esc(curLoc.name) + ' [' + curLoc.x + ', ' + curLoc.y + ']</option>' + locSelectOpts;
      }

      atlasFilterHtml = '<div class="wi-atlas-compact-bar" style="margin-bottom:8px;">' +
        '<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;width:100%;">' +
          '<select id="wiAtlasRegionSelect" class="wi-war-select" style="font-size:11px;padding:4px 7px;flex:1;min-width:130px;">' + regSelectOpts + '</select>' +
          '<select id="wiAtlasTypeSelect" class="wi-war-select" style="font-size:11px;padding:4px 7px;flex:1;min-width:115px;">' + typeSelectOpts + '</select>' +
          '<button type="button" class="wi-war-tool" id="wiAtlasTogglePillsBtn" style="font-size:10px;padding:3px 7px;" title="Показать/скрыть облако быстрых тегов">' + (m.atlasFilterCollapsed ? '▼ Теги (' + filteredLocs.length + ')' : '▲ Теги') + '</button>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:5px;width:100%;margin-top:5px;">' +
          '<select id="wiAtlasLocSelect" class="wi-war-select" style="font-size:11.5px;padding:4px 8px;width:100%;">' + locSelectOpts + '</select>' +
        '</div>' +
        (!m.atlasFilterCollapsed ? (
          '<div style="display:flex;gap:4px;flex-wrap:wrap;width:100%;margin-top:6px;max-height:76px;overflow-y:auto;padding-right:2px;">' +
            filteredLocs.map(function(l){
              var isCur = (curLoc && l.id === curLoc.id);
              return '<button class="wi-war-tool ' + (isCur ? 'active' : '') + '" data-wi-select-loc="' + escA(l.id) + '" style="font-size:10px;padding:2px 6px;font-family:\'Cinzel\',serif;">' + l.icon + ' ' + esc(l.name.split(' (')[0]) + '</button>';
            }).join('') +
          '</div>'
        ) : '') +
      '</div>';
    }

    // Инспектор локации / доски объявлений / маршрута / меток / тактики
    var inspectorHtml = '';

    if(isBoard){
      inspectorHtml = renderWiNoticeBoardInspector(curLoc);
    } else if(m.mode === 'inspect'){
      var locTer = getTerrainAt(curLoc.x, curLoc.y);
      var enc = getWiLocationEncyclopedia(curLoc);

      var hotspotHtml = '';
      if(m.selectedHotspotId && typeof WI_MAP_LORE_HOTSPOTS !== 'undefined'){
        var selHs = WI_MAP_LORE_HOTSPOTS.find(function(h){ return h.id === m.selectedHotspotId; });
        if(selHs){
          var isSignHs = (selHs.kind === 'sign');
          hotspotHtml = '<div style="margin-bottom:8px;background:linear-gradient(135deg, ' + (isSignHs ? 'rgba(168,85,247,0.14)' : 'rgba(239,68,68,0.14)') + ' 0%, rgba(12,16,24,0.95) 100%);border:1px solid ' + (selHs.color || '#a855f7') + ';border-left:4px solid ' + (selHs.color || '#a855f7') + ';border-radius:6px;padding:8px 11px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;">' +
              '<div style="font-size:12.5px;font-weight:800;color:#fff;font-family:\'Cinzel\',serif;">' + (selHs.icon || '🔮') + ' ' + esc(selHs.name) + ' <span style="font-size:10px;color:#fde68a;margin-left:4px;">⚡ ' + esc(selHs.bonus) + '</span></div>' +
              '<div style="display:flex;gap:4px;">' +
                '<button class="btn btn-ghost" id="wiHotspotToMarkerBtn" data-hs-id="' + escA(selHs.id) + '" style="font-size:10px;padding:2px 6px;color:#fbbf24;">📍 В метки</button>' +
                '<button class="btn btn-ghost" id="wiHotspotCloseBtn" style="font-size:10px;padding:2px 6px;">✕</button>' +
              '</div>' +
            '</div>' +
            '<div style="font-size:11.5px;color:#e2e8f0;font-family:\'EB Garamond\',serif;font-style:italic;margin-top:3px;">' + esc(selHs.desc) + '</div>' +
          '</div>';
        }
      }

      inspectorHtml = hotspotHtml + '<div class="wi-char-sheet-card wi-atlas-minimal-card" style="padding:10px 12px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;flex-wrap:wrap;padding-bottom:7px;border-bottom:1px solid rgba(255,255,255,0.07);">' +
          '<div style="flex:1;min-width:170px;">' +
            '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' +
              '<span style="font-size:15px;font-weight:800;color:#fff;font-family:\'Cinzel\',serif;">' + (curLoc.icon || '🏰') + ' ' + esc(curLoc.name) + '</span>' +
              '<span class="wi-school-badge" style="font-size:10px;padding:1px 6px;">' + esc(curLoc.region) + '</span>' +
            '</div>' +
            '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:4px;">' +
              '<span style="font-size:10.5px;color:#cbd5e1;background:rgba(255,255,255,0.04);padding:1px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.06);">👑 ' + esc(curLoc.ruler || '—') + '</span>' +
              '<span style="font-size:10.5px;color:#cbd5e1;background:rgba(255,255,255,0.04);padding:1px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.06);">' + locTer.icon + ' ' + esc(curLoc.climate || locTer.name) + '</span>' +
              '<span style="font-size:10.5px;color:#fca5a5;background:rgba(239,68,68,0.1);padding:1px 6px;border-radius:4px;border:1px solid rgba(239,68,68,0.25);">⚠️ ' + esc(curLoc.danger || 'Средняя') + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;gap:4px;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" id="wiMapOpenBoardForLocBtn" data-loc-id="' + escA(curLoc.id) + '" style="font-size:11px;padding:3px 9px;">📜 Доска</button>' +
            '<button class="btn btn-ghost" id="wiMapSetRouteDestBtn" data-loc-id="' + escA(curLoc.id) + '" style="font-size:10.5px;padding:3px 7px;" title="Проложить маршрут сюда">🧭 Сюда</button>' +
            '<button class="btn btn-ghost" id="wiMapSetRouteOriginBtn" data-loc-id="' + escA(curLoc.id) + '" style="font-size:10.5px;padding:3px 7px;" title="Начать маршрут отсюда">🏁 Старт</button>' +
            '<button class="btn btn-ghost" id="wiMapCenterOnLocBtn" data-loc-id="' + escA(curLoc.id) + '" style="font-size:10.5px;padding:3px 6px;" title="Сфокусировать камеру">🎯</button>' +
            '<button class="btn btn-ghost" id="wiMapSpawnGarrisonAtLocBtn" data-loc-id="' + escA(curLoc.id) + '" style="font-size:10.5px;padding:3px 6px;color:#38bdf8;" title="Развернуть гарнизон">♟️</button>' +
            '<button class="btn btn-ghost" id="wiMapCopyLocLoreBtn" data-loc-id="' + escA(curLoc.id) + '" style="font-size:10.5px;padding:3px 6px;" title="Скопировать паспорт локации">📋</button>' +
          '</div>' +
        '</div>' +
        '<div style="margin-top:6px;margin-bottom:7px;font-size:12.5px;line-height:1.42;color:#e2e8f0;font-family:\'EB Garamond\',serif;font-style:italic;">' +
          esc(curLoc.desc) +
        '</div>' +
        '<div class="wi-atlas-compact-grid">' +
          '<div class="wi-atlas-mini-cell"><span class="wi-atlas-mini-k">👥 Население:</span> <span class="wi-atlas-mini-v">' + esc(enc.pop) + '</span></div>' +
          '<div class="wi-atlas-mini-cell"><span class="wi-atlas-mini-k">⚒️ Экономика:</span> <span class="wi-atlas-mini-v">' + esc(enc.economy) + '</span></div>' +
          '<div class="wi-atlas-mini-cell"><span class="wi-atlas-mini-k">🍺 Корчма / Постой:</span> <span class="wi-atlas-mini-v" style="color:#fde68a;">' + esc(enc.inn) + '</span></div>' +
          '<div class="wi-atlas-mini-cell"><span class="wi-atlas-mini-k">🏴 Фракции:</span> <span class="wi-atlas-mini-v">' + esc(enc.factions) + '</span></div>' +
          '<div class="wi-atlas-mini-cell"><span class="wi-atlas-mini-k">👑 Личности:</span> <span class="wi-atlas-mini-v" style="color:#93c5fd;">' + esc(enc.npcs) + '</span></div>' +
          '<div class="wi-atlas-mini-cell"><span class="wi-atlas-mini-k">🐺 Бестиарий:</span> <span class="wi-atlas-mini-v" style="color:#fca5a5;">' + esc(enc.monsters) + '</span></div>' +
          '<div class="wi-atlas-mini-cell" style="grid-column:1/-1;background:rgba(245,158,11,0.05);border-color:rgba(245,158,11,0.2);"><span class="wi-atlas-mini-k" style="color:#fbbf24;">🗣️ Слухи:</span> <span class="wi-atlas-mini-v" style="font-style:italic;color:#f8fafc;">«' + esc(enc.rumors) + '»</span></div>' +
        '</div>' +
      '</div>';
    } else if(isTactics){
      inspectorHtml = renderWiTacticsInspector();
    } else if(isRoute){
      if(!m.routeLoaded){
        WI.loadRoute();
        m.routeLoaded = true;
      }
      var rCalc = calcFullRoute(m.routePoints || [], m.travelMode || 'horse', m.travelPace || 'normal');

      var encHtml = m.encounter ? ('<div style="background:rgba(245,158,11,0.12);border:1px solid var(--wi-amber);border-radius:6px;padding:10px;margin-top:8px;">' +
        '<div style="font-weight:700;color:#fbbf24;margin-bottom:3px;font-family:\'Cinzel\',serif;font-size:12.5px;">' + esc(m.encounter.title) + '</div>' +
        '<div style="font-size:12px;line-height:1.4;color:var(--wi-silver);font-family:\'EB Garamond\',serif;font-style:italic;">' + esc(m.encounter.desc) + '</div>' +
      '</div>') : '';

      var warningsHtml = (rCalc.warnings && rCalc.warnings.length) ? ('<div style="margin-top:8px;display:flex;flex-direction:column;gap:4px;">' +
        rCalc.warnings.map(function(w){
          return '<div style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.35);border-radius:4px;padding:6px 9px;font-size:11.5px;color:#fca5a5;">' + esc(w) + '</div>';
        }).join('') +
      '</div>') : '';

      var pointsTableRows = (m.routePoints && m.routePoints.length) ? m.routePoints.map(function(pt, idx){
        var isStart = (idx === 0);
        var isEnd = (idx === m.routePoints.length - 1 && m.routePoints.length > 1);
        var badgeColor = isStart ? '#10b981' : (isEnd ? '#ef4444' : '#f59e0b');
        var badgeText = isStart ? 'Старт' : (isEnd ? 'Цель' : '#' + (idx + 1));

        var segInfo = rCalc.segments[idx];
        var distToNext = '';
        if(segInfo){
          distToNext = '<div style="font-weight:700;color:#fbbf24;font-size:11px;">' + segInfo.dist + ' миль <span style="color:var(--wi-steel);font-weight:normal;">(~' + segInfo.days + ' дн.)</span></div>';
          if(segInfo.usedCrossing){
            distToNext += '<div style="margin-top:2px;"><span style="background:rgba(16,185,129,0.15);color:#6ee7b7;border:1px solid rgba(16,185,129,0.3);padding:1px 5px;border-radius:3px;font-size:9.5px;display:inline-block;">✓ 🌉 ' + esc(segInfo.usedCrossing.name) + '</span></div>';
          }
          if(segInfo.wildCrossings && segInfo.wildCrossings.length > 0 && rCalc.mode !== 'boat'){
            segInfo.wildCrossings.forEach(function(wc){
              distToNext += '<div style="margin-top:3px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.35);border-radius:4px;padding:3px 5px;font-size:10px;color:#fca5a5;">' +
                '⚠️ Брод: <b>' + esc(wc.river.name) + '</b> (+' + wc.river.crossDelayHours + ' ч)' +
                (wc.crossingLoc ? ('<br><button type="button" class="btn btn-xs wi-insert-crossing-btn" data-seg-idx="' + idx + '" data-loc-id="' + escA(wc.crossingLoc.id) + '" style="margin-top:2px;padding:1px 5px;font-size:9.5px;color:#38bdf8;border:1px solid rgba(56,189,248,0.4);border-radius:3px;background:rgba(56,189,248,0.1);cursor:pointer;">' +
                  '🏰 Через «' + esc(wc.crossingLoc.name) + '»' +
                '</button>') : '') +
              '</div>';
            });
          }
          if(segInfo.crossesWater && rCalc.mode !== 'boat'){
            distToNext += '<div style="margin-top:3px;background:rgba(239,68,68,0.2);border:1px solid #ef4444;border-radius:4px;padding:2px 5px;font-size:9.5px;color:#fca5a5;font-weight:700;">⛔ Море</div>';
          }
        } else {
          distToNext = '<span style="color:var(--wi-steel);font-size:10.5px;">Финиш</span>';
        }

        return '<tr class="wi-route-row" data-wi-route-row-id="' + pt.id + '" style="border-bottom:1px solid rgba(255,255,255,0.06);">' +
          '<td style="padding:5px 4px;text-align:center;"><span style="background:' + badgeColor + ';color:#0f172a;padding:1px 5px;border-radius:8px;font-size:10px;font-weight:900;font-family:\'JetBrains Mono\',monospace;">' + badgeText + '</span></td>' +
          '<td style="padding:5px 4px;">' +
            '<div style="font-weight:700;color:#fff;cursor:pointer;font-size:11.5px;" class="wi-pt-name-edit" data-wi-pt-id="' + pt.id + '" title="Кликните, чтобы переименовать">' + esc(pt.name || ('Точка ' + (idx + 1))) + ' ✏️</div>' +
          '</td>' +
          '<td style="padding:5px 4px;">' +
            '<select class="wi-input" data-wi-pt-stop="' + pt.id + '" style="padding:2px 4px;font-size:10.5px;max-width:115px;">' +
              '<option value="none" ' + (pt.stopType === 'none' ? 'selected' : '') + '>📍 Транзит</option>' +
              '<option value="camp" ' + (pt.stopType === 'camp' ? 'selected' : '') + '>⛺ Лагерь</option>' +
              '<option value="inn" ' + (pt.stopType === 'inn' ? 'selected' : '') + '>🍺 Корчма</option>' +
              '<option value="ferry" ' + (pt.stopType === 'ferry' ? 'selected' : '') + '>⛵ Паром</option>' +
            '</select>' +
          '</td>' +
          '<td style="padding:5px 4px;">' + distToNext + '</td>' +
          '<td style="padding:5px 4px;text-align:right;white-space:nowrap;">' +
            '<button class="btn btn-ghost" data-wi-pt-focus="' + pt.id + '" style="padding:2px 5px;font-size:10px;margin-right:2px;" title="Сфокусировать">🎯</button>' +
            '<button class="btn btn-ghost" data-wi-pt-del="' + pt.id + '" style="padding:2px 5px;font-size:10px;color:#ef4444;" title="Удалить">🗑️</button>' +
          '</td>' +
        '</tr>';
      }).join('') : '<tr><td colspan="5" class="char-empty" style="text-align:center;padding:12px;font-size:11.5px;">Маршрут пуст. Кликайте по пинам или точкам на карте!</td></tr>';

      inspectorHtml = '<div class="wi-char-sheet-card" style="padding:10px 12px;">' +
        '<div class="wi-char-header" style="margin-bottom:6px;">' +
          '<span style="font-size:13.5px;">🧭 Планировщик маршрута</span>' +
          '<div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap;">' +
            '<span class="wi-school-badge" style="font-size:11px;background:rgba(245,158,11,0.2);color:#fbbf24;">📏 ' + rCalc.totalDist + ' миль</span>' +
            '<span class="wi-school-badge" style="font-size:11px;background:rgba(59,130,246,0.2);color:#93c5fd;">⏳ ' + rCalc.wholeDays + ' дн. ' + rCalc.remHours + ' ч.</span>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;">' +
          '<button class="wi-pill ' + (rCalc.mode === 'horse' ? 'active' : '') + '" data-wi-route-mode="horse" style="font-size:10.5px;padding:2px 7px;">🐎 Верхом</button>' +
          '<button class="wi-pill ' + (rCalc.mode === 'foot' ? 'active' : '') + '" data-wi-route-mode="foot" style="font-size:10.5px;padding:2px 7px;">🥾 Пешком</button>' +
          '<button class="wi-pill ' + (rCalc.mode === 'witcher' ? 'active' : '') + '" data-wi-route-mode="witcher" style="font-size:10.5px;padding:2px 7px;">🐺 Ведьмак</button>' +
          '<button class="wi-pill ' + (rCalc.mode === 'boat' ? 'active' : '') + '" data-wi-route-mode="boat" style="font-size:10.5px;padding:2px 7px;">⛵ Лодка</button>' +
          '<span style="color:var(--wi-border);">|</span>' +
          '<button class="wi-pill ' + (rCalc.pace === 'normal' ? 'active' : '') + '" data-wi-route-pace="normal" style="font-size:10.5px;padding:2px 7px;">⚖️ Обычный</button>' +
          '<button class="wi-pill ' + (rCalc.pace === 'fast' ? 'active' : '') + '" data-wi-route-pace="fast" style="font-size:10.5px;padding:2px 7px;">⚡ Быстрый</button>' +
          '<button class="wi-pill ' + (rCalc.pace === 'stealth' ? 'active' : '') + '" data-wi-route-pace="stealth" style="font-size:10.5px;padding:2px 7px;">🕵️ Скрытный</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:5px;margin-bottom:8px;font-size:11px;">' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wi-border);border-radius:4px;padding:4px 7px;">🍖 Рационы: <b style="color:#fcd34d;">' + rCalc.rations + ' шт.</b></div>' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wi-border);border-radius:4px;padding:4px 7px;">⛺ Стоянки: <b>' + rCalc.campsCount + ' лаг. / ' + rCalc.innsCount + ' корчм</b></div>' +
        '</div>' +
        warningsHtml +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;margin-bottom:5px;flex-wrap:wrap;gap:4px;">' +
          '<div style="font-weight:700;font-size:12px;color:#fff;font-family:\'Cinzel\',serif;">Точки пути (' + (m.routePoints || []).length + ')</div>' +
          '<div style="display:flex;gap:4px;flex-wrap:wrap;">' +
            '<button class="btn btn-ghost" id="wiRouteAddCenterBtn" style="font-size:10px;padding:2px 6px;">➕ В центр</button>' +
            '<button class="btn btn-ghost" id="wiRouteReverseBtn" style="font-size:10px;padding:2px 6px;">🔄</button>' +
            '<button class="btn btn-ghost" id="wiRouteLoopBtn" style="font-size:10px;padding:2px 6px;">🔁</button>' +
            '<button class="btn btn-ghost" id="wiRouteClearBtn" style="font-size:10px;padding:2px 6px;color:#ef4444;">🧹</button>' +
          '</div>' +
        '</div>' +
        '<div style="overflow-x:auto;background:rgba(10,14,20,0.6);border:1px solid var(--wi-border);border-radius:6px;">' +
          '<table style="width:100%;border-collapse:collapse;font-size:11px;">' +
            '<tbody>' + pointsTableRows + '</tbody>' +
          '</table>' +
        '</div>' +
        '<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--wi-border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:5px;">' +
          '<div style="display:flex;gap:4px;flex-wrap:wrap;">' +
            '<button class="wi-pill" data-wi-route-preset="novi_vizima" style="font-size:10px;padding:2px 6px;">Новиград➔Вызима</button>' +
            '<button class="wi-pill" data-wi-route-preset="vizima_km" style="font-size:10px;padding:2px 6px;">Вызима➔Каэр Морхен</button>' +
            '<button class="wi-pill" data-wi-route-preset="oxen_toussaint" style="font-size:10px;padding:2px 6px;">Оксенфурт➔Боклер</button>' +
          '</div>' +
          '<button class="btn btn-primary" id="wiMapRollEncounterBtn" style="font-size:10.5px;padding:3px 8px;">🎲 Встреча в пути</button>' +
        '</div>' +
        encHtml +
      '</div>';
    } else if(isMarkers){
      var markerIcons = ['🐺', '⚔️', '🔮', '💎', '🍺', '💀', '⛺', '🐉', '⚓'];
      var edMarker = m.editingMarkerId ? (m.userMarkers || []).find(function(x){ return x.id === m.editingMarkerId; }) : null;
      var showForm = !!(edMarker || m.placingMarkerCoords);
      var formObj = edMarker || {
        id: 'um_' + Date.now(),
        title: '',
        icon: '🐺',
        desc: '',
        x: m.placingMarkerCoords ? m.placingMarkerCoords.x : Math.round(m.cx || 1440),
        y: m.placingMarkerCoords ? m.placingMarkerCoords.y : Math.round(m.cy || 1200)
      };

      var formHtml = showForm ? (
        '<div style="background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.35);border-radius:6px;padding:8px;margin-bottom:8px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
            '<b style="color:#fbbf24;font-family:\'Cinzel\',serif;font-size:12px;">📍 ' + (edMarker ? 'Редактирование метки' : 'Новая метка') + ' [' + formObj.x + ', ' + formObj.y + ']</b>' +
            '<button class="btn btn-ghost" id="wiMarkerCancelFormBtn" style="font-size:10px;padding:2px 6px;">Отмена</button>' +
          '</div>' +
          '<div style="margin-bottom:6px;">' +
            '<input type="text" id="wiMarkerFormTitle" class="wi-input" style="font-size:11.5px;padding:4px 8px;" value="' + escA(formObj.title) + '" placeholder="Название (Логово архигрифона / Тайник)">' +
          '</div>' +
          '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:6px;">' +
            markerIcons.map(function(ic){
              return '<button type="button" class="wi-war-tool ' + (formObj.icon === ic ? 'active' : '') + '" data-wi-micon="' + ic + '" style="font-size:13px;padding:2px 6px;">' + ic + '</button>';
            }).join('') +
            '<input type="hidden" id="wiMarkerFormIcon" value="' + escA(formObj.icon || '🐺') + '">' +
          '</div>' +
          '<div style="margin-bottom:6px;">' +
            '<input type="text" id="wiMarkerFormDesc" class="wi-input" style="font-size:11.5px;padding:4px 8px;" value="' + escA(formObj.desc || '') + '" placeholder="Заметка (награда, чудовище, секрет)">' +
          '</div>' +
          '<input type="hidden" id="wiMarkerFormX" value="' + formObj.x + '">' +
          '<input type="hidden" id="wiMarkerFormY" value="' + formObj.y + '">' +
          '<button class="btn btn-primary" id="wiMarkerSaveFormBtn" data-marker-id="' + escA(formObj.id) + '" style="font-size:11px;padding:3px 9px;">💾 Сохранить</button>' +
        '</div>'
      ) : '';

      inspectorHtml = '<div class="wi-char-sheet-card" style="padding:10px 12px;">' +
        '<div class="wi-char-header" style="margin-bottom:6px;">' +
          '<span style="font-size:13.5px;">📍 Метки ведьмака (' + markersCount + ')</span>' +
          '<div style="display:flex;gap:4px;">' +
            '<button class="btn btn-primary" id="wiMapAddMarkerOpenBtn" style="font-size:10.5px;padding:3px 8px;">➕ В центр</button>' +
            (markersCount > 0 ? '<button class="btn btn-ghost" id="wiMapClearAllMarkersBtn" style="font-size:10.5px;padding:3px 7px;color:#ef4444;">🗑️</button>' : '') +
          '</div>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--wi-steel);margin-bottom:7px;">Кликните по карте, чтобы поставить метку, или перетащите существующую.</div>' +
        formHtml +
        '<div style="display:flex;flex-direction:column;gap:5px;">' +
          (m.userMarkers && m.userMarkers.length ? m.userMarkers.map(function(um){
            return '<div style="background:rgba(255,255,255,0.03);border:1px solid ' + (m.selectedMarkerId === um.id ? 'var(--wi-amber)' : 'var(--wi-border)') + ';border-radius:4px;padding:5px 8px;display:flex;justify-content:space-between;align-items:center;gap:6px;">' +
              '<div style="flex:1;min-width:0;cursor:pointer;" class="wi-user-marker-row" data-marker-id="' + escA(um.id) + '">' +
                '<div style="font-weight:700;font-size:11.5px;color:#fff;">' + (um.icon || '📍') + ' ' + esc(um.title || 'Метка') + ' <span style="font-size:9.5px;color:var(--wi-steel);font-weight:normal;">[' + um.x + ', ' + um.y + ']</span></div>' +
                (um.desc ? ('<div style="font-size:10px;color:var(--wi-steel);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(um.desc) + '</div>') : '') +
              '</div>' +
              '<div style="display:flex;gap:3px;">' +
                '<button class="btn btn-ghost" data-wi-edit-marker="' + escA(um.id) + '" style="font-size:10px;padding:2px 5px;">✏️</button>' +
                '<button class="btn btn-ghost" data-wi-del-marker="' + escA(um.id) + '" style="font-size:10px;padding:2px 5px;color:#ef4444;">🗑️</button>' +
              '</div>' +
            '</div>';
          }).join('') : '<div class="char-empty" style="padding:10px;font-size:11.5px;">Нет пользовательских меток.</div>') +
        '</div>' +
      '</div>';
    }

    var curTerHud = getTerrainAt(Math.round(m.cx || 1440), Math.round(m.cy || 1200));
    var curZoomVal = Math.max(0.4, Math.min(5.0, m.zoom || 1.1));
    var scaleMiles = Math.max(25, Math.round((300 / curZoomVal) * 0.42 / 25) * 25);
    var scaleDays = (scaleMiles / 38).toFixed(1);

    var compassOverlayHtml =
      '<div class="wi-map-compass">' +
        '<svg viewBox="0 0 100 100" width="100%" height="100%">' +
          '<circle cx="50" cy="50" r="44" fill="rgba(8,12,20,0.82)" stroke="rgba(245,158,11,0.55)" stroke-width="2"/>' +
          '<circle cx="50" cy="50" r="37" fill="none" stroke="rgba(245,158,11,0.28)" stroke-width="1" stroke-dasharray="3,3"/>' +
          '<polygon points="50,8 57,43 50,36 43,43" fill="#fbbf24"/>' +
          '<polygon points="50,92 56,57 50,64 44,57" fill="#64748b"/>' +
          '<polygon points="8,50 43,44 36,50 43,56" fill="#64748b"/>' +
          '<polygon points="92,50 57,44 64,50 57,56" fill="#64748b"/>' +
          '<circle cx="50" cy="50" r="4.5" fill="#fbbf24" stroke="#0f172a" stroke-width="1.5"/>' +
          '<text x="50" y="21" text-anchor="middle" fill="#fef08a" font-size="10.5" font-family="Cinzel,serif" font-weight="900">N</text>' +
          '<text x="50" y="87" text-anchor="middle" fill="#94a3b8" font-size="8.5" font-family="Cinzel,serif" font-weight="700">S</text>' +
          '<text x="17" y="53" text-anchor="middle" fill="#94a3b8" font-size="8.5" font-family="Cinzel,serif" font-weight="700">W</text>' +
          '<text x="83" y="53" text-anchor="middle" fill="#94a3b8" font-size="8.5" font-family="Cinzel,serif" font-weight="700">E</text>' +
        '</svg>' +
      '</div>';

    var scaleBarOverlayHtml =
      '<div class="wi-map-scale-bar" id="wiMapScaleBar">' +
        '<div style="display:flex;justify-content:space-between;width:110px;">' +
          '<span id="wiScaleMilesLbl">0 — ' + scaleMiles + ' миль</span>' +
          '<span id="wiScaleDaysLbl" style="color:#fde68a;">🐎 ~' + scaleDays + ' дн.</span>' +
        '</div>' +
        '<div class="wi-map-scale-line" style="width:110px;"></div>' +
      '</div>';

    var minimapOverlayHtml = '';
    if(m.showMinimap !== false){
      var mmDots = WI_MAP_LOCATIONS.map(function(l){
        var isSel = (curLoc && curLoc.id === l.id);
        var col = isSel ? '#fbbf24' : (l.type === 'witcher' ? '#f59e0b' : (l.type === 'capital' ? '#38bdf8' : (l.type === 'nature' ? '#10b981' : '#94a3b8')));
        var r = isSel ? 55 : (l.type === 'capital' || l.type === 'witcher' ? 34 : 18);
        return '<circle cx="' + l.x + '" cy="' + l.y + '" r="' + r + '" fill="' + col + '" />';
      }).join('');
      minimapOverlayHtml =
        '<div class="wi-map-minimap" id="wiMapMinimap" title="Кликните для быстрого перемещения камеры">' +
          '<svg viewBox="0 0 2880 4096" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">' +
            '<image href="new-4k-map-of-the-continent-v0-s4ryngvic0ga1.webp" x="0" y="0" width="2880" height="4096" opacity="0.82"/>' +
            mmDots +
            '<rect id="wiMinimapRect" x="400" y="400" width="1800" height="1200" fill="rgba(245,158,11,0.16)" stroke="#fbbf24" stroke-width="36" rx="24"/>' +
          '</svg>' +
        '</div>';
    }

    var curBoardCount = getWiBoardContractsForLoc(curLoc).length;

    return crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Карта мира' }]) +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
          '<button class="back" data-nav="wiHome" style="margin:0;" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiHome\');">← Назад</button>' +
          '<h1 style="margin:0;font-size:19px;">🗺️ Карта Континента</h1>' +
          '<span style="font-size:11.5px;color:var(--wi-steel);">Клик по любому городу, деревне или лесу открывает паспорт или доску объявлений</span>' +
        '</div>' +
        '<div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;">' +
          '<button class="wi-pill ' + (m.mode === 'inspect' ? 'active' : '') + '" id="wiMapModeInspect">🗺️ Атлас (' + WI_MAP_LOCATIONS.length + ')</button>' +
          '<button class="wi-pill ' + (m.mode === 'board' ? 'active' : '') + '" id="wiMapModeBoard">📜 Доска объявлений (' + curBoardCount + ')</button>' +
          '<button class="wi-pill ' + (m.mode === 'route' ? 'active' : '') + '" id="wiMapModeRoute">🧭 Маршруты</button>' +
          '<button class="wi-pill ' + (m.mode === 'markers' ? 'active' : '') + '" id="wiMapModeMarkers">📍 Метки (' + markersCount + ')</button>' +
          '<button class="wi-pill ' + (m.mode === 'tactics' ? 'active' : '') + '" id="wiMapModeTactics">⚔️ Тактика' + (tacticsCount > 0 ? ' (' + tacticsCount + ')' : '') + '</button>' +
          '<button class="btn btn-ghost" id="wiMapToggleLayoutBtn" style="padding:3px 7px;font-size:11px;" title="Переключить расположение панели (сбоку от карты / под картой)">' + (m.sidebarBelow ? '◫ Панель сбоку' : '⊟ Панель снизу') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="wi-map-workspace ' + (m.sidebarBelow ? 'layout-stacked' : 'layout-split') + '">' +
        '<div class="wi-map-main-col">' +
          '<div class="wi-map-container ' + (m.fullscreen ? 'wi-fullscreen' : '') + '" id="wiMapContainer" style="background:#070c14;border:1px solid var(--wi-border);border-radius:8px;overflow:hidden;position:relative;box-shadow:0 8px 30px rgba(0,0,0,0.6);">' +
            '<div class="wi-map-toolbar" style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:rgba(14,18,24,0.95);border-bottom:1px solid var(--wi-border);flex-wrap:wrap;gap:5px;">' +
              '<div style="display:flex;align-items:center;gap:5px;flex:1;min-width:190px;">' +
                '<input type="text" id="wiMapSearch" class="wi-input" style="padding:3px 8px;font-size:11.5px;max-width:195px;" placeholder="🔍 Поиск локации..." value="' + escA(m.search || '') + '">' +
                '<select id="wiMapJumpSelect" class="wi-war-select" style="padding:3px 7px;font-size:11px;" title="Быстрое перемещение камеры к региону">' +
                  '<option value="">🌍 Переход к региону...</option>' +
                  '<option value="north">🐺 Северные Королевства</option>' +
                  '<option value="novigrad">🏰 Новиград, Велен и Вызима</option>' +
                  '<option value="kaer_morhen">⚔️ Каэр Морхен</option>' +
                  '<option value="skellige">⛵ Острова Скеллиге</option>' +
                  '<option value="toussaint">🍇 Княжество Туссент</option>' +
                  '<option value="brokilon">🏹 Брокилон и Махакам</option>' +
                  '<option value="nilfgaard">☀️ Империя Нильфгаард</option>' +
                  '<option value="all">🗺️ Весь Континент целиком</option>' +
                '</select>' +
              '</div>' +
              '<div style="display:flex;gap:3px;align-items:center;flex-wrap:wrap;">' +
                '<button class="btn btn-ghost" id="wiMapToggleTerritories" title="Показать/скрыть границы королевств" style="padding:2px 6px;font-size:10.5px;' + (m.showTerritories ? 'color:#fbbf24;border-color:rgba(245,158,11,0.45);' : '') + '">🏴 Границы</button>' +
                '<button class="btn btn-ghost" id="wiMapToggleRivers" title="Показать/скрыть реки и переправы" style="padding:2px 6px;font-size:10.5px;' + (m.showRivers ? 'color:#38bdf8;border-color:rgba(56,189,248,0.45);' : '') + '">🌊 Реки</button>' +
                '<button class="btn btn-ghost" id="wiMapToggleRoads" title="Показать/скрыть тракты и морские пути" style="padding:2px 6px;font-size:10.5px;' + (m.showRoads ? 'color:#fbbf24;border-color:rgba(245,158,11,0.45);' : '') + '">🛣️ Тракты</button>' +
                '<button class="btn btn-ghost" id="wiMapToggleLore" title="Показать/скрыть Места Силы и логова чудовищ" style="padding:2px 6px;font-size:10.5px;' + (m.showLoreLayer ? 'color:#c084fc;border-color:rgba(192,132,252,0.5);' : '') + '">🔮 Сила</button>' +
                '<button class="btn btn-ghost" id="wiMapTogglePins" title="Показать/скрыть пины на карте" style="padding:2px 6px;font-size:10.5px;' + (m.showPins !== false ? 'color:#fbbf24;border-color:rgba(245,158,11,0.45);' : '') + '">📍</button>' +
                '<button class="btn btn-ghost" id="wiMapToggleMeasure" title="Линейка расстояний" style="padding:2px 6px;font-size:10.5px;' + (m.measureMode ? 'color:#38bdf8;border-color:rgba(56,189,248,0.55);background:rgba(56,189,248,0.12);' : '') + '">📏</button>' +
                '<button class="btn btn-ghost" id="wiMapToggleMinimap" title="Показать/скрыть мини-карту" style="padding:2px 6px;font-size:10.5px;' + (m.showMinimap !== false ? 'color:#fbbf24;border-color:rgba(245,158,11,0.45);' : '') + '">🗺️</button>' +
                '<button class="btn btn-ghost" id="wiMapToggleLabels" title="Показать/скрыть подписи пинов" style="padding:2px 6px;font-size:10.5px;">🏷️</button>' +
                '<button class="btn btn-ghost" id="wiMapToggleFullscreen" title="На весь экран" style="padding:2px 7px;font-size:10.5px;color:#fbbf24;">' + (m.fullscreen ? '✕' : '⛶') + '</button>' +
              '</div>' +
            '</div>' +
            tacticsPaletteHtml +
            '<div class="wi-map-viewport" id="wiMapViewport" style="height:610px;position:relative;cursor:' + ((isTactics && m.tacticsTool === 'paint') || m.measureMode ? 'crosshair' : 'grab') + ';overflow:hidden;background:#05080e;">' +
              renderWitcherMapSvg() +
              compassOverlayHtml +
              scaleBarOverlayHtml +
              minimapOverlayHtml +
              '<div class="wi-map-floating-zoom">' +
                '<button type="button" class="wi-zoom-fab" id="wiMapZoomIn" title="Приблизить">➕</button>' +
                '<button type="button" class="wi-zoom-fab" id="wiMapZoomOut" title="Отдалить">➖</button>' +
                '<button type="button" class="wi-zoom-fab" id="wiMapZoomReset" title="Сбросить масштаб">⟲</button>' +
              '</div>' +
              '<div class="wi-map-hud" id="wiMapHud">' +
                '<span id="wiHudCoords">[' + Math.round(m.cx || 1440) + ', ' + Math.round(m.cy || 1200) + ']</span>' +
                '<span style="color:var(--wi-amber);">•</span>' +
                '<span id="wiHudTerrain">' + curTerHud.icon + ' ' + esc(curTerHud.name) + '</span>' +
                '<span style="color:var(--wi-amber);">•</span>' +
                '<span id="wiHudZoom">' + Math.round((m.zoom || 1.1) * 100) + '%</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="wi-map-side-col">' +
          atlasFilterHtml +
          inspectorHtml +
        '</div>' +
      '</div>';
  }

  /* Привязка событий СПОСОБНОСТЕЙ */
  function wireWiTechs(){
    var search = document.getElementById('wiTechSearch');
    if(search){
      search.addEventListener('input', function(){
        WI.techSearch = search.value;
        if(typeof render === 'function') render();
      });
    }

    document.querySelectorAll('[data-wi-tech-filter]').forEach(function(btn){
      btn.addEventListener('click', function(){
        WI.techFilter = btn.getAttribute('data-wi-tech-filter');
        if(typeof render === 'function') render();
      });
    });

    document.querySelectorAll('[data-wi-del-tech]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var id = btn.getAttribute('data-wi-del-tech');
        var t = WI.getTechById(id);
        var title = (t && t.name) ? ('«' + t.name + '»') : 'эту способность';
        if(!confirm('Удалить ' + title + ' из ростера персонажа?')) return;
        WI.deleteTech(id);
        WI.toast('✓ Способность удалена из ростера', 'info');
        if(typeof render === 'function') render();
      });
    });

    wireWiNav();
  }

  function wireWiTechView(){
    var delBtn = document.getElementById('wiTechDeleteBtn');
    if(delBtn){
      delBtn.addEventListener('click', function(){
        var id = delBtn.getAttribute('data-tech-id');
        if(!confirm('Удалить эту способность из ростера персонажа?')) return;
        WI.deleteTech(id);
        WI.toast('✓ Способность удалена', 'info');
        if(typeof window.navigate === 'function') window.navigate('wiTechs');
      });
    }
    wireWiNav();
  }

  function wireWiTechEdit(){
    var delBtn = document.getElementById('wiEdTechDelBtn');
    if(delBtn){
      delBtn.addEventListener('click', function(){
        var id = delBtn.getAttribute('data-tech-id');
        if(!confirm('Удалить эту способность из ростера персонажа?')) return;
        WI.deleteTech(id);
        WI.toast('✓ Способность удалена', 'info');
        if(typeof window.navigate === 'function') window.navigate('wiTechs');
      });
    }

    var saveBtn = document.getElementById('wiEdTechSaveBtn');
    if(saveBtn){
      saveBtn.addEventListener('click', function(){
        var id = saveBtn.getAttribute('data-tech-id');
        var name = (document.getElementById('wiEdTechName').value || '').trim();
        if(!name){
          alert('Введите название способности');
          return;
        }

        var t = WI.getTechById(id) || { id: id };
        t.name = name;
        t.icon = (document.getElementById('wiEdTechIcon').value || '✨').trim();
        t.cat = document.getElementById('wiEdTechCat').value;
        t.cost = (document.getElementById('wiEdTechCost').value || '').trim();
        t.req = (document.getElementById('wiEdTechReq').value || '').trim();
        t.dmgN = parseInt(document.getElementById('wiEdTechDmgN').value, 10) || 0;
        t.dmgD = document.getElementById('wiEdTechDmgD').value;
        t.dmgMod = parseInt(document.getElementById('wiEdTechDmgMod').value, 10) || 0;
        t.desc = (document.getElementById('wiEdTechDesc').value || '').trim();

        var idx = (WI.techs || []).findIndex(function(x){ return x && String(x.id) === String(id); });
        if(idx !== -1){
          WI.techs[idx] = t;
        } else {
          WI.techs.push(t);
        }
        WI.saveTechs();
        WI.toast('✓ Способность сохранена!', 'success');
        if(typeof window.navigate === 'function') window.navigate('wiTechView:' + id);
      });
    }
    wireWiNav();
  }

  /* Привязка событий ПРИЁМОВ */
  function wireWiMoves(){
    var search = document.getElementById('wiMoveSearch');
    if(search){
      search.addEventListener('input', function(){
        WI.moveSearch = search.value;
        if(typeof render === 'function') render();
      });
    }

    document.querySelectorAll('[data-wi-move-filter]').forEach(function(btn){
      btn.addEventListener('click', function(){
        WI.moveFilter = btn.getAttribute('data-wi-move-filter');
        if(typeof render === 'function') render();
      });
    });

    document.querySelectorAll('[data-wi-del-move]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var id = btn.getAttribute('data-wi-del-move');
        var m = WI.getMoveById(id);
        var title = (m && m.name) ? ('«' + m.name + '»') : 'этот боевой приём';
        if(!confirm('Удалить ' + title + ' из ростера персонажа?')) return;
        WI.deleteMove(id);
        WI.toast('✓ Боевой приём удален из ростера', 'info');
        if(typeof render === 'function') render();
      });
    });

    wireWiNav();
  }

  function wireWiMoveView(){
    var delBtn = document.getElementById('wiMoveDeleteBtn');
    if(delBtn){
      delBtn.addEventListener('click', function(){
        var id = delBtn.getAttribute('data-move-id');
        if(!confirm('Удалить этот боевой приём из ростера персонажа?')) return;
        WI.deleteMove(id);
        WI.toast('✓ Приём удален', 'info');
        if(typeof window.navigate === 'function') window.navigate('wiMoves');
      });
    }
    wireWiNav();
  }

  function wireWiMoveEdit(){
    var delBtn = document.getElementById('wiEdMoveDelBtn');
    if(delBtn){
      delBtn.addEventListener('click', function(){
        var id = delBtn.getAttribute('data-move-id');
        if(!confirm('Удалить этот боевой приём из ростера персонажа?')) return;
        WI.deleteMove(id);
        WI.toast('✓ Приём удален', 'info');
        if(typeof window.navigate === 'function') window.navigate('wiMoves');
      });
    }

    var saveBtn = document.getElementById('wiEdMoveSaveBtn');
    if(saveBtn){
      saveBtn.addEventListener('click', function(){
        var id = saveBtn.getAttribute('data-move-id');
        var name = (document.getElementById('wiEdMoveName').value || '').trim();
        if(!name){
          alert('Введите название приёма');
          return;
        }

        var m = WI.getMoveById(id) || { id: id };
        m.name = name;
        m.icon = (document.getElementById('wiEdMoveIcon').value || '⚔️').trim();
        m.kind = document.getElementById('wiEdMoveKind').value;
        m.action = (document.getElementById('wiEdMoveAction').value || 'Основное действие').trim();
        m.trigger = (document.getElementById('wiEdMoveTrigger').value || '').trim();
        m.desc = (document.getElementById('wiEdMoveDesc').value || '').trim();

        var idx = (WI.moves || []).findIndex(function(x){ return x && String(x.id) === String(id); });
        if(idx !== -1){
          WI.moves[idx] = m;
        } else {
          WI.moves.push(m);
        }
        WI.saveMoves();
        WI.toast('✓ Боевой приём сохранен!', 'success');
        if(typeof window.navigate === 'function') window.navigate('wiMoveView:' + id);
      });
    }
    wireWiNav();
  }

  /* Привязка событий КАРТЫ МИРА */
  function wireWiMap(){
    var m = WI.map;

    var modeInspect = document.getElementById('wiMapModeInspect');
    if(modeInspect){
      modeInspect.addEventListener('click', function(){
        m.mode = 'inspect';
        if(typeof render === 'function') render();
      });
    }

    var modeBoard = document.getElementById('wiMapModeBoard');
    if(modeBoard){
      modeBoard.addEventListener('click', function(){
        m.mode = 'board';
        if(typeof render === 'function') render();
      });
    }

    var modeRoute = document.getElementById('wiMapModeRoute');
    if(modeRoute){
      modeRoute.addEventListener('click', function(){
        m.mode = 'route';
        if(typeof render === 'function') render();
      });
    }

    var modeMarkers = document.getElementById('wiMapModeMarkers');
    if(modeMarkers){
      modeMarkers.addEventListener('click', function(){
        m.mode = 'markers';
        if(typeof render === 'function') render();
      });
    }

    var modeTactics = document.getElementById('wiMapModeTactics');
    if(modeTactics){
      modeTactics.addEventListener('click', function(){
        m.mode = 'tactics';
        if(typeof render === 'function') render();
      });
    }

    function updateHud(ptX, ptY){
      var hudCoords = document.getElementById('wiHudCoords');
      var hudTer = document.getElementById('wiHudTerrain');
      var hudZoom = document.getElementById('wiHudZoom');
      var x = ptX != null ? Math.round(ptX) : Math.round(m.cx || 1440);
      var y = ptY != null ? Math.round(ptY) : Math.round(m.cy || 1200);
      if(hudCoords) hudCoords.textContent = '[' + x + ', ' + y + ']';
      if(hudTer){
        var ter = getTerrainAt(x, y);
        hudTer.textContent = ter.icon + ' ' + ter.name;
      }
      if(hudZoom) hudZoom.textContent = Math.round((m.zoom || 1.1) * 100) + '%';
    }

    function updateMapTransform(){
      var svg = document.getElementById('wiMapSvg');
      var vp = document.getElementById('wiMapViewport');
      if(!svg || !vp) return;
      var vw = vp.clientWidth || 800;
      var vh = vp.clientHeight || 540;
      var ar = vw / vh;
      var z = Math.max(0.4, Math.min(5.0, m.zoom || 1.1));
      var baseW = 2400;
      var baseH = baseW / ar;
      var vbW = baseW / z;
      var vbH = baseH / z;
      var minX = (m.cx != null ? m.cx : 1440) - vbW / 2;
      var minY = (m.cy != null ? m.cy : 1200) - vbH / 2;
      svg.setAttribute('viewBox', minX + ' ' + minY + ' ' + vbW + ' ' + vbH);

      var mmRect = document.getElementById('wiMinimapRect');
      if(mmRect){
        mmRect.setAttribute('x', Math.round(minX));
        mmRect.setAttribute('y', Math.round(minY));
        mmRect.setAttribute('width', Math.round(vbW));
        mmRect.setAttribute('height', Math.round(vbH));
      }
      var scaleMilesLbl = document.getElementById('wiScaleMilesLbl');
      var scaleDaysLbl = document.getElementById('wiScaleDaysLbl');
      if(scaleMilesLbl || scaleDaysLbl){
        var scMiles = Math.max(25, Math.round((300 / z) * 0.42 / 25) * 25);
        var scDays = (scMiles / 38).toFixed(1);
        if(scaleMilesLbl) scaleMilesLbl.textContent = '0 — ' + scMiles + ' миль';
        if(scaleDaysLbl) scaleDaysLbl.textContent = '🐎 ~' + scDays + ' дн.';
      }
      updateHud();
    }

    updateMapTransform();

    function focusOn(x, y, zoom){
      m.cx = x;
      m.cy = y;
      if(zoom != null) m.zoom = zoom;
      updateMapTransform();
    }

    function clientToSvgCoords(clientX, clientY){
      var vp = document.getElementById('wiMapViewport');
      if(!vp) return { x: 1440, y: 1200 };
      var rect = vp.getBoundingClientRect();
      var vw = vp.clientWidth || 800;
      var vh = vp.clientHeight || 540;
      var ar = vw / vh;
      var z = Math.max(0.4, Math.min(5.0, m.zoom || 1.1));
      var baseW = 2400;
      var baseH = baseW / ar;
      var vbW = baseW / z;
      var vbH = baseH / z;
      var minX = (m.cx != null ? m.cx : 1440) - vbW / 2;
      var minY = (m.cy != null ? m.cy : 1200) - vbH / 2;
      var mouseX = clientX - rect.left;
      var mouseY = clientY - rect.top;
      var ptX = Math.round(minX + (mouseX / vw) * vbW);
      var ptY = Math.round(minY + (mouseY / vh) * vbH);
      return {
        x: Math.max(20, Math.min(2860, ptX)),
        y: Math.max(20, Math.min(4076, ptY))
      };
    }

    // Тумблеры панели инструментов
    var toggleTerritoriesBtn = document.getElementById('wiMapToggleTerritories');
    if(toggleTerritoriesBtn){
      toggleTerritoriesBtn.addEventListener('click', function(){
        m.showTerritories = !m.showTerritories;
        if(typeof render === 'function') render();
      });
    }

    var toggleRiversBtn = document.getElementById('wiMapToggleRivers');
    if(toggleRiversBtn){
      toggleRiversBtn.addEventListener('click', function(){
        m.showRivers = !m.showRivers;
        if(typeof render === 'function') render();
      });
    }

    var toggleRoadsBtn = document.getElementById('wiMapToggleRoads');
    if(toggleRoadsBtn){
      toggleRoadsBtn.addEventListener('click', function(){
        m.showRoads = !m.showRoads;
        if(typeof render === 'function') render();
      });
    }

    var toggleLoreBtn = document.getElementById('wiMapToggleLore');
    if(toggleLoreBtn){
      toggleLoreBtn.addEventListener('click', function(){
        m.showLoreLayer = !m.showLoreLayer;
        if(m.showLoreLayer){
          WI.toast('🔮 Включён слой Мест Силы и Логов Чудовищ (кликните по знаку на карте для подробностей)', 'info');
        }
        if(typeof render === 'function') render();
      });
    }

    var togglePinsBtn = document.getElementById('wiMapTogglePins');
    if(togglePinsBtn){
      togglePinsBtn.addEventListener('click', function(){
        m.showPins = (m.showPins === false ? true : false);
        if(typeof render === 'function') render();
      });
    }

    var toggleMeasureBtn = document.getElementById('wiMapToggleMeasure');
    if(toggleMeasureBtn){
      toggleMeasureBtn.addEventListener('click', function(){
        m.measureMode = !m.measureMode;
        if(!m.measureMode){
          m.measurePoints = [];
        } else {
          m.measurePoints = [];
          WI.toast('📏 Режим линейки: кликните по двум точкам на карте для расчёта расстояния и дней пути', 'info');
        }
        if(typeof render === 'function') render();
      });
    }

    var toggleMinimapBtn = document.getElementById('wiMapToggleMinimap');
    if(toggleMinimapBtn){
      toggleMinimapBtn.addEventListener('click', function(){
        m.showMinimap = (m.showMinimap === false ? true : false);
        if(typeof render === 'function') render();
      });
    }

    var minimapEl = document.getElementById('wiMapMinimap');
    if(minimapEl){
      minimapEl.addEventListener('click', function(e){
        e.stopPropagation();
        var rect = minimapEl.getBoundingClientRect();
        var rx = (e.clientX - rect.left) / (rect.width || 118);
        var ry = (e.clientY - rect.top) / (rect.height || 168);
        focusOn(Math.round(rx * 2880), Math.round(ry * 4096));
      });
    }

    var toggleLabelsBtn = document.getElementById('wiMapToggleLabels');
    if(toggleLabelsBtn){
      toggleLabelsBtn.addEventListener('click', function(){
        m.showLabels = (m.showLabels === false ? true : false);
        if(typeof render === 'function') render();
      });
    }

    var toggleFsBtn = document.getElementById('wiMapToggleFullscreen');
    if(toggleFsBtn){
      toggleFsBtn.addEventListener('click', function(){
        m.fullscreen = !m.fullscreen;
        if(typeof render === 'function') render();
      });
    }

    if(!window.__wiMapEscBound){
      window.__wiMapEscBound = true;
      window.addEventListener('keydown', function(e){
        if(e.key === 'Escape' && WI.map && WI.map.fullscreen){
          WI.map.fullscreen = false;
          if(typeof render === 'function') render();
        }
      });
    }

    // Зум и центрирование
    var btnIn = document.getElementById('wiMapZoomIn');
    if(btnIn){
      btnIn.addEventListener('click', function(){
        m.zoom = Math.min((m.zoom || 1.1) * 1.3, 5.0);
        updateMapTransform();
      });
    }

    var btnOut = document.getElementById('wiMapZoomOut');
    if(btnOut){
      btnOut.addEventListener('click', function(){
        m.zoom = Math.max((m.zoom || 1.1) / 1.3, 0.4);
        updateMapTransform();
      });
    }

    var btnReset = document.getElementById('wiMapZoomReset');
    if(btnReset){
      btnReset.addEventListener('click', function(){
        m.zoom = 1.1;
        m.cx = 1440;
        m.cy = 1200;
        updateMapTransform();
      });
    }

    // Переключение компоновки экрана (панель сбоку / снизу)
    var toggleLayoutBtn = document.getElementById('wiMapToggleLayoutBtn');
    if(toggleLayoutBtn){
      toggleLayoutBtn.addEventListener('click', function(){
        m.sidebarBelow = !m.sidebarBelow;
        if(typeof render === 'function') render();
      });
    }

    // Быстрые прыжки / фокусировки
    var presets = {
      north: { cx: 1400, cy: 500, zoom: 1.6 },
      novigrad: { cx: 1350, cy: 1080, zoom: 2.3 },
      kaer_morhen: { cx: 2595, cy: 245, zoom: 2.7 },
      skellige: { cx: 620, cy: 1600, zoom: 2.0 },
      toussaint: { cx: 2430, cy: 2220, zoom: 2.5 },
      brokilon: { cx: 1360, cy: 1550, zoom: 2.4 },
      nilfgaard: { cx: 1710, cy: 3750, zoom: 2.0 },
      all: { cx: 1440, cy: 2048, zoom: 0.65 }
    };
    var jumpSel = document.getElementById('wiMapJumpSelect');
    if(jumpSel){
      jumpSel.addEventListener('change', function(){
        var target = jumpSel.value;
        var cfg = presets[target];
        if(cfg){
          focusOn(cfg.cx, cfg.cy, cfg.zoom);
        }
        jumpSel.value = '';
      });
    }
    document.querySelectorAll('[data-wi-jump]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var target = btn.getAttribute('data-wi-jump');
        var cfg = presets[target];
        if(cfg){
          focusOn(cfg.cx, cfg.cy, cfg.zoom);
        }
      });
    });

    // Минималистичные селекты Атласа и Доски объявлений
    var atlasRegSel = document.getElementById('wiAtlasRegionSelect');
    if(atlasRegSel){
      atlasRegSel.addEventListener('change', function(){
        m.regionFilter = atlasRegSel.value || 'all';
        if(typeof render === 'function') render();
      });
    }

    var atlasTypeSel = document.getElementById('wiAtlasTypeSelect');
    if(atlasTypeSel){
      atlasTypeSel.addEventListener('change', function(){
        m.typeFilter = atlasTypeSel.value || 'all';
        if(typeof render === 'function') render();
      });
    }

    var atlasLocSel = document.getElementById('wiAtlasLocSelect');
    if(atlasLocSel){
      atlasLocSel.addEventListener('change', function(){
        var lid = atlasLocSel.value;
        var loc = WI_MAP_LOCATIONS.find(function(l){ return l.id === lid; });
        if(loc){
          m.selectedLocId = loc.id;
          m.customWildLoc = null;
          m.activeContract = null;
          m.boardSelectedContractId = null;
          focusOn(loc.x, loc.y, Math.max(m.zoom || 1.1, 2.0));
          if(typeof render === 'function') render();
        }
      });
    }

    var togglePillsBtn = document.getElementById('wiAtlasTogglePillsBtn');
    if(togglePillsBtn){
      togglePillsBtn.addEventListener('click', function(){
        m.atlasFilterCollapsed = (m.atlasFilterCollapsed === false);
        if(typeof render === 'function') render();
      });
    }

    // Фильтры Атласа и быстрый выбор локации (в раскладном списке)
    document.querySelectorAll('[data-wi-reg-filter]').forEach(function(btn){
      btn.addEventListener('click', function(){
        m.regionFilter = btn.getAttribute('data-wi-reg-filter');
        if(typeof render === 'function') render();
      });
    });

    document.querySelectorAll('[data-wi-type-filter]').forEach(function(btn){
      btn.addEventListener('click', function(){
        m.typeFilter = btn.getAttribute('data-wi-type-filter');
        if(typeof render === 'function') render();
      });
    });

    document.querySelectorAll('[data-wi-select-loc]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var lid = btn.getAttribute('data-wi-select-loc');
        var loc = WI_MAP_LOCATIONS.find(function(l){ return l.id === lid; });
        if(loc){
          m.selectedLocId = loc.id;
          m.customWildLoc = null;
          m.activeContract = null;
          m.boardSelectedContractId = null;
          focusOn(loc.x, loc.y, Math.max(m.zoom || 1.1, 2.0));
          if(typeof render === 'function') render();
        }
      });
    });

    var openBoardForLocBtn = document.getElementById('wiMapOpenBoardForLocBtn');
    if(openBoardForLocBtn){
      openBoardForLocBtn.addEventListener('click', function(){
        m.mode = 'board';
        m.boardSelectedContractId = null;
        if(typeof render === 'function') render();
      });
    }

    var boardSwitchToInspectBtn = document.getElementById('wiBoardSwitchToInspectBtn');
    if(boardSwitchToInspectBtn){
      boardSwitchToInspectBtn.addEventListener('click', function(){
        m.mode = 'inspect';
        if(typeof render === 'function') render();
      });
    }

    // ============================================================
    // ОБРАБОТЧИКИ ДОСКИ ОБЪЯВЛЕНИЙ (📜 РЕЖИМ ДОСКИ + ПОШАГОВЫЙ КОНСТРУКТОР ИИ)
    // ============================================================
    var toggleBuilderBtn = document.getElementById('wiBoardToggleBuilderBtn');
    if(toggleBuilderBtn){
      toggleBuilderBtn.addEventListener('click', function(){
        m.boardBuilderOpen = !m.boardBuilderOpen;
        if(!m.boardBuilderOpen) m.boardCfgTab = null;
        if(typeof render === 'function') render();
      });
    }

    document.querySelectorAll('[data-wi-board-cfg-tab]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var tKey = btn.getAttribute('data-wi-board-cfg-tab');
        m.boardCfgTab = (m.boardCfgTab === tKey) ? null : tKey;
        if(typeof render === 'function') render();
      });
    });

    var closeCfgTabBtn = document.getElementById('wiBoardCloseCfgTabBtn');
    if(closeCfgTabBtn){
      closeCfgTabBtn.addEventListener('click', function(){
        m.boardCfgTab = null;
        if(typeof render === 'function') render();
      });
    }

    document.querySelectorAll('[data-wi-board-cfg-pick]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var raw = btn.getAttribute('data-wi-board-cfg-pick') || '';
        var idx = raw.indexOf(':');
        if(idx !== -1){
          var prop = raw.slice(0, idx);
          var val = raw.slice(idx + 1);
          m[prop] = val;
          m.boardCfgTab = null;
          if(typeof render === 'function') render();
        }
      });
    });

    var resetCfgBtn = document.getElementById('wiBoardResetCfgBtn');
    if(resetCfgBtn){
      resetCfgBtn.addEventListener('click', function(){
        m.boardType = 'monster';
        m.boardMonsterClass = 'auto';
        m.boardRewardTier = 'standard';
        m.boardCurrency = 'auto';
        m.boardDifficulty = 'medium';
        m.boardDepth = 'detailed';
        m.boardTwist = 'random';
        m.boardPrompt = '';
        m.boardCfgTab = null;
        WI.toast('↺ Параметры конструктора сброшены к стандартным', 'info');
        if(typeof render === 'function') render();
      });
    }

    var boardPromptInput = document.getElementById('wiBoardPromptInput');
    if(boardPromptInput){
      boardPromptInput.addEventListener('input', function(){
        m.boardPrompt = boardPromptInput.value;
      });
    }

    function getBoardGeneratorOpts(){
      var pEl = document.getElementById('wiBoardPromptInput');
      if(pEl) m.boardPrompt = pEl.value;
      return {
        prompt: m.boardPrompt || '',
        contractType: m.boardType || 'monster',
        monsterClass: m.boardMonsterClass || 'auto',
        rewardTier: m.boardRewardTier || 'standard',
        currency: m.boardCurrency || 'auto',
        difficulty: m.boardDifficulty || 'medium',
        depth: m.boardDepth || 'detailed',
        twist: m.boardTwist || 'random'
      };
    }

    function addRandomBoardContractWithOpts(opts){
      var curLoc = getWiActiveLocation(m);
      var newC = generateWiRandomBoardContract(curLoc, opts);
      var list = getWiBoardContractsForLoc(curLoc);
      list.unshift(newC);
      m.boardContracts[curLoc.id] = list;
      m.boardSelectedContractId = newC.id;
      WI.saveBoardContracts();
      WI.toast('🎲 На доску «' + curLoc.name.split(' (')[0] + '» приколото объявление: «' + newC.title + '»', 'success');
      if(typeof render === 'function') render();
    }

    var boardGenRandBtn = document.getElementById('wiBoardGenRandomBtn');
    if(boardGenRandBtn){
      boardGenRandBtn.addEventListener('click', function(){
        addRandomBoardContractWithOpts({
          prompt: '',
          contractType: 'monster',
          monsterClass: 'auto',
          rewardTier: 'standard',
          currency: 'auto',
          difficulty: 'medium',
          depth: 'detailed',
          twist: 'random'
        });
      });
    }

    var boardGenCustomRandBtn = document.getElementById('wiBoardGenCustomRandomBtn');
    if(boardGenCustomRandBtn){
      boardGenCustomRandBtn.addEventListener('click', function(){
        addRandomBoardContractWithOpts(getBoardGeneratorOpts());
      });
    }

    var boardGenAiBtn = document.getElementById('wiBoardGenAiBtn');
    if(boardGenAiBtn){
      boardGenAiBtn.addEventListener('click', function(){
        if(m.boardLoading) return;
        var curLoc = getWiActiveLocation(m);
        var opts = getBoardGeneratorOpts();
        var apiKey = '';
        try {
          apiKey = (typeof state !== 'undefined' && state.settings && state.settings.apiKey) ? state.settings.apiKey : (localStorage.getItem('dnd_gemini_api_key') || '');
        } catch(e){}
        if(!apiKey || !apiKey.trim()){
          var entered = prompt('Для ИИ-генерации заказа введите ваш Gemini API ключ (или нажмите Отмена для процедурной генерации):', '');
          if(entered && entered.trim()){
            apiKey = entered.trim();
            try {
              localStorage.setItem('dnd_gemini_api_key', apiKey);
              if(typeof state !== 'undefined' && state.settings) state.settings.apiKey = apiKey;
            } catch(e){}
          } else {
            var fbC = generateWiRandomBoardContract(curLoc, opts);
            var fbList = getWiBoardContractsForLoc(curLoc);
            fbList.unshift(fbC);
            m.boardContracts[curLoc.id] = fbList;
            m.boardSelectedContractId = fbC.id;
            WI.saveBoardContracts();
            WI.toast('📜 Создан контракт по вашим настройкам: «' + fbC.title + '»', 'info');
            if(typeof render === 'function') render();
            return;
          }
        }
        m.boardLoading = true;
        if(typeof render === 'function') render();
        callGeminiWiContractGenerator(curLoc, opts, apiKey.trim(), function(err, aiContract){
          m.boardLoading = false;
          if(err || !aiContract){
            var fallbackC = generateWiRandomBoardContract(curLoc, opts);
            var listF = getWiBoardContractsForLoc(curLoc);
            listF.unshift(fallbackC);
            m.boardContracts[curLoc.id] = listF;
            m.boardSelectedContractId = fallbackC.id;
            WI.saveBoardContracts();
            WI.toast('⚠️ ИИ недоступен (' + (err || 'ошибка') + '), создан процедурный заказ: «' + fallbackC.title + '»', 'info');
          } else {
            var listA = getWiBoardContractsForLoc(curLoc);
            listA.unshift(aiContract);
            m.boardContracts[curLoc.id] = listA;
            m.boardSelectedContractId = aiContract.id;
            WI.saveBoardContracts();
            WI.toast('✨ ИИ создал ведьмачий заказ: «' + aiContract.title + '»!', 'success');
          }
          if(typeof render === 'function') render();
        });
      });
    }

    document.querySelectorAll('[data-wi-board-cid]').forEach(function(card){
      card.addEventListener('click', function(e){
        if(e.target && e.target.closest && e.target.closest('[data-wi-board-del]')) return;
        var cid = card.getAttribute('data-wi-board-cid');
        m.boardSelectedContractId = cid;
        if(typeof render === 'function') render();
      });
    });

    document.querySelectorAll('[data-wi-board-del]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var cid = btn.getAttribute('data-wi-board-del');
        var curLoc = getWiActiveLocation(m);
        var list = getWiBoardContractsForLoc(curLoc).filter(function(c){ return c.id !== cid; });
        m.boardContracts[curLoc.id] = list;
        if(m.boardSelectedContractId === cid){
          m.boardSelectedContractId = list.length ? list[0].id : null;
        }
        WI.saveBoardContracts();
        WI.toast('🗑️ Объявление сорвано с доски', 'info');
        if(typeof render === 'function') render();
      });
    });

    var boardMarkLairBtn = document.getElementById('wiBoardMarkLairBtn');
    if(boardMarkLairBtn){
      boardMarkLairBtn.addEventListener('click', function(){
        var curLoc = getWiActiveLocation(m);
        var list = getWiBoardContractsForLoc(curLoc);
        var c = list.find(function(x){ return x.id === m.boardSelectedContractId; }) || list[0];
        if(!c) return;
        var offsetAngle = Math.random() * Math.PI * 2;
        var offsetDist = 35 + Math.floor(Math.random() * 45);
        var mx = Math.max(40, Math.min(2840, Math.round(curLoc.x + Math.cos(offsetAngle) * offsetDist)));
        var my = Math.max(40, Math.min(4050, Math.round(curLoc.y + Math.sin(offsetAngle) * offsetDist)));
        m.userMarkers = m.userMarkers || [];
        var newM = {
          id: 'um_' + Date.now(),
          title: c.title + ' (' + curLoc.name.split(' (')[0] + ')',
          icon: '🐺',
          desc: c.monster + ' • Награда: ' + c.reward + ' • ' + (c.prep || ''),
          x: mx,
          y: my
        };
        m.userMarkers.push(newM);
        m.selectedMarkerId = newM.id;
        WI.saveUserMarkers();
        focusOn(mx, my, Math.max(m.zoom || 1.1, 2.3));
        WI.toast('📍 След/логово по контракту «' + c.title + '» отмечено на карте!', 'success');
        if(typeof render === 'function') render();
      });
    }

    var boardCopyBtn = document.getElementById('wiBoardCopyContractBtn');
    if(boardCopyBtn){
      boardCopyBtn.addEventListener('click', function(){
        var curLoc = getWiActiveLocation(m);
        var list = getWiBoardContractsForLoc(curLoc);
        var c = list.find(function(x){ return x.id === m.boardSelectedContractId; }) || list[0];
        if(!c) return;
        var txt = '📜 ВЕДЬМАЧИЙ ЗАКАЗ: ' + c.title.toUpperCase() + '\n' +
          'Локация: ' + curLoc.name + ' (' + curLoc.region + ')\n' +
          'Заказчик: ' + (c.patron || 'Местный староста') + ' | Сложность: ' + (c.difficulty || 'Обычная') + '\n' +
          'Награда: ' + c.reward + ' (Торг: ' + (c.haggleReward || '—') + ')\n\n' +
          '«' + (c.noticeText || c.hook || '') + '»\n\n' +
          '🐺 ЦЕЛЬ: ' + c.monster + ' (' + (c.monsterClass || 'Бестия') + ')\n' +
          '🧪 ПОДГОТОВКА (УЯЗВИМОСТИ): ' + (c.prep || '—') + '\n' +
          '🔎 УЛИКИ (ВЕДЬМАЧЬЕ ЧУТЬЁ): ' + (c.clues || '—') + '\n' +
          '🎭 СЕКРЕТ И РАЗВЯЗКА: ' + (c.twist || '—') + '\n' +
          '⚖️ ВЫБОР ДЛЯ ИГРОКОВ: ' + (c.outcomes || '—');
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(txt);
        }
        WI.toast('📋 Контракт «' + c.title + '» скопирован в буфер обмена', 'success');
      });
    }

    var spawnGarrisonLocBtn = document.getElementById('wiMapSpawnGarrisonAtLocBtn');
    if(spawnGarrisonLocBtn){
      spawnGarrisonLocBtn.addEventListener('click', function(){
        var loc = getWiActiveLocation(m);
        if(!loc) return;
        var facMap = {
          temeria: 'temeria',
          redania: 'redania',
          kaedwen_aedirn: 'kaedwen_aedirn',
          skellige: 'skellige',
          nilfgaard: 'nilfgaard',
          toussaint: 'toussaint',
          scoiatael: 'scoiatael',
          kovir: 'kovir'
        };
        var facKey = facMap[loc.regionKey] || 'temeria';
        var uType = (loc.type === 'witcher') ? 'witchers' : (loc.type === 'magic' ? 'mages' : 'fort');
        var uInfo = WI_TACTICAL_UNIT_TYPES[uType] || WI_TACTICAL_UNIT_TYPES.fort;
        m.tacticalUnits = m.tacticalUnits || [];
        m.tacticalUnits.push({
          id: 'u_' + Date.now(),
          x: loc.x,
          y: loc.y,
          nation: facKey,
          type: uType,
          status: 'fortified',
          strength: uInfo.defaultStr || 'Гарнизон 2 500 бойцов',
          hp: 100,
          label: 'Гарнизон: ' + loc.name.split(' (')[0]
        });
        m.selectedUnitIdx = m.tacticalUnits.length - 1;
        m.mode = 'tactics';
        WI.saveTacticalState();
        WI.toast('♟️ Развёрнут гарнизон в «' + loc.name + '»', 'success');
        if(typeof render === 'function') render();
      });
    }

    var hsToMarkerBtn = document.getElementById('wiHotspotToMarkerBtn');
    if(hsToMarkerBtn && typeof WI_MAP_LORE_HOTSPOTS !== 'undefined'){
      hsToMarkerBtn.addEventListener('click', function(){
        var hId = hsToMarkerBtn.getAttribute('data-hs-id');
        var hs = WI_MAP_LORE_HOTSPOTS.find(function(h){ return h.id === hId; });
        if(!hs) return;
        m.userMarkers = m.userMarkers || [];
        var newM = {
          id: 'um_' + Date.now(),
          title: hs.name,
          icon: hs.icon || '🔮',
          desc: hs.bonus + ' • ' + hs.desc,
          x: hs.x,
          y: hs.y
        };
        m.userMarkers.push(newM);
        m.selectedMarkerId = newM.id;
        WI.saveUserMarkers();
        WI.toast('📍 «' + hs.name + '» сохранено в ваши метки!', 'success');
        if(typeof render === 'function') render();
      });
    }

    var hsCloseBtn = document.getElementById('wiHotspotCloseBtn');
    if(hsCloseBtn){
      hsCloseBtn.addEventListener('click', function(){
        m.selectedHotspotId = null;
        if(typeof render === 'function') render();
      });
    }

    var copyLoreBtn = document.getElementById('wiMapCopyLocLoreBtn');
    if(copyLoreBtn){
      copyLoreBtn.addEventListener('click', function(){
        var loc = getWiActiveLocation(m);
        if(loc){
          var enc = getWiLocationEncyclopedia(loc);
          var txt = loc.icon + ' ' + loc.name + ' (' + loc.region + ')\n' +
            'Правитель: ' + (loc.ruler || '—') + ' | Опасность: ' + (loc.danger || '—') + '\n' +
            'Население: ' + enc.pop + '\n' +
            'Экономика: ' + enc.economy + '\n' +
            'Корчма: ' + enc.inn + '\n' +
            'Фракции: ' + enc.factions + '\n' +
            'Ключевые лица: ' + enc.npcs + '\n' +
            'Бестиарий: ' + enc.monsters + '\n' +
            'Слухи: «' + enc.rumors + '»\n' +
            loc.desc;
          if(navigator.clipboard && navigator.clipboard.writeText){
            navigator.clipboard.writeText(txt);
          }
          WI.toast('📋 Полный паспорт «' + loc.name + '» скопирован в буфер обмена', 'success');
        }
      });
    }

    // ============================================================
    // ПАНЕЛЬ ИНСТРУМЕНТОВ И ШТАБ РЕЖИМА ТАКТИКА (⚔️)
    // ============================================================
    document.querySelectorAll('[data-wi-tactics-tool]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var tl = btn.getAttribute('data-wi-tactics-tool') || 'pan';
        if(tl === 'march' && (m.selectedUnitIdx == null || m.selectedUnitIdx < 0 || !m.tacticalUnits || !m.tacticalUnits[m.selectedUnitIdx])){
          if(m.tacticalUnits && m.tacticalUnits.length > 0){
            m.selectedUnitIdx = 0;
            WI.toast('🏃 Выбран отряд «' + (m.tacticalUnits[0].label || 'Отряд #1') + '» — кликайте по карте для маршрута марша', 'info');
          } else {
            WI.toast('⚠️ Сначала разместите или выберите отряд на карте', 'info');
            m.tacticsTool = 'unit';
            if(typeof render === 'function') render();
            return;
          }
        }
        m.tacticsTool = tl;
        if(typeof render === 'function') render();
      });
    });

    var warFacSel = document.getElementById('wiWarFactionSelect');
    if(warFacSel){
      warFacSel.addEventListener('change', function(){
        m.warNation = warFacSel.value || 'nilfgaard';
        if(typeof render === 'function') render();
      });
    }

    var warUnitTypeSel = document.getElementById('wiWarUnitTypeSelect');
    if(warUnitTypeSel){
      warUnitTypeSel.addEventListener('change', function(){
        m.unitType = warUnitTypeSel.value || 'army';
        if(m.tacticsTool === 'pan') m.tacticsTool = 'unit';
        if(typeof render === 'function') render();
      });
    }

    var warBrushSizeSel = document.getElementById('wiWarBrushSizeSelect');
    if(warBrushSizeSel){
      warBrushSizeSel.addEventListener('change', function(){
        m.brushSize = parseInt(warBrushSizeSel.value, 10) || 48;
        if(typeof render === 'function') render();
      });
    }

    document.querySelectorAll('[data-wi-tactics-tab]').forEach(function(btn){
      btn.addEventListener('click', function(){
        m.tacticsTab = btn.getAttribute('data-wi-tactics-tab') || 'units';
        if(typeof render === 'function') render();
      });
    });

    // Анимация плавного передвижения войск по их маршрутам марша (marchPath)
    function animateWiUnitsMarch(unitIndices){
      if(m.isAnimatingMarch) return;
      var units = m.tacticalUnits || [];
      var targets = [];
      unitIndices.forEach(function(idx){
        var u = units[idx];
        if(u && Array.isArray(u.marchPath) && u.marchPath.length > 0){
          targets.push({ u: u, idx: idx });
        }
      });
      if(targets.length === 0){
        WI.toast('💡 Нет назначенных точек марша. Выберите инструмент «🏃 Марш» и кликните по карте!', 'info');
        return;
      }
      m.isAnimatingMarch = true;
      WI.toast('🥁 Войска выдвинулись по маршруту марша (' + targets.length + ' соед.)...', 'info');

      var speedPxPerFrame = 7.5;
      function stepFrame(){
        var anyMoving = false;
        targets.forEach(function(t){
          var u = t.u;
          if(!u.marchPath || u.marchPath.length === 0) return;
          anyMoving = true;
          var wp = u.marchPath[0];
          var dx = wp.x - u.x;
          var dy = wp.y - u.y;
          var dist = Math.hypot(dx, dy);
          if(dist <= speedPxPerFrame){
            u.x = Math.round(wp.x);
            u.y = Math.round(wp.y);
            u.marchPath.shift();
            if(u.marchPath.length === 0){
              u.status = 'ready';
            }
          } else {
            u.x = Math.round(u.x + (dx / dist) * speedPxPerFrame);
            u.y = Math.round(u.y + (dy / dist) * speedPxPerFrame);
          }
        });

        updateWiWarLayerOnly();

        if(anyMoving){
          requestAnimationFrame(stepFrame);
        } else {
          m.isAnimatingMarch = false;
          var clashesNow = detectWiTacticalClashes(m.tacticalUnits || []);
          if(clashesNow.length > 0){
            clashesNow.forEach(function(cl){
              cl.uA.status = 'battle';
              cl.uB.status = 'battle';
            });
            WI.toast('⚔️ Войска вошли в соприкосновение с противником! (' + clashesNow.length + ' боёв)', 'success');
          } else {
            WI.toast('🏁 Марш успешно завершён, войска заняли новые позиции', 'success');
          }
          WI.saveTacticalState();
          if(typeof render === 'function') render();
        }
      }
      requestAnimationFrame(stepFrame);
    }

    var animAllBtn = document.getElementById('wiWarAnimateAllBtn');
    if(animAllBtn){
      animAllBtn.addEventListener('click', function(){
        var allIndices = (m.tacticalUnits || []).map(function(_, i){ return i; });
        animateWiUnitsMarch(allIndices);
      });
    }
    var animAllInspBtn = document.getElementById('wiWarAnimateAllInspectorBtn');
    if(animAllInspBtn){
      animAllInspBtn.addEventListener('click', function(){
        var allIndices = (m.tacticalUnits || []).map(function(_, i){ return i; });
        animateWiUnitsMarch(allIndices);
      });
    }

    var quickSpawnBtn = document.getElementById('wiWarQuickSpawnCenterBtn');
    if(quickSpawnBtn){
      quickSpawnBtn.addEventListener('click', function(){
        var cx = Math.round(m.cx || 1440);
        var cy = Math.round(m.cy || 1200);
        var facKey = m.warNation === 'independent' ? 'nilfgaard' : (m.warNation || 'nilfgaard');
        var facInfo = WI_TACTICAL_FACTIONS[facKey] || WI_TACTICAL_FACTIONS.nilfgaard;
        var uType = m.unitType || 'army';
        var uInfo = WI_TACTICAL_UNIT_TYPES[uType] || WI_TACTICAL_UNIT_TYPES.army;
        var nearLoc = findNearestCity(cx, cy, 110);
        var defaultLabel = uInfo.label + ' (' + (nearLoc ? nearLoc.name.split(' (')[0] : facInfo.name.split(' ')[0]) + ')';
        m.tacticalUnits = m.tacticalUnits || [];
        m.tacticalUnits.push({
          id: 'u_' + Date.now(),
          x: cx,
          y: cy,
          nation: facKey,
          type: uType,
          status: 'ready',
          strength: uInfo.defaultStr || '4 000 бойцов',
          hp: 100,
          label: defaultLabel
        });
        m.selectedUnitIdx = m.tacticalUnits.length - 1;
        WI.saveTacticalState();
        WI.toast('♟️ Размещено в центре карты: ' + defaultLabel, 'success');
        if(typeof render === 'function') render();
      });
    }

    // Управление карточкой выбранного отряда
    var selUnitObj = (m.selectedUnitIdx != null && m.selectedUnitIdx >= 0 && m.tacticalUnits) ? m.tacticalUnits[m.selectedUnitIdx] : null;
    if(selUnitObj){
      var uNameInp = document.getElementById('wiSelUnitNameInp');
      if(uNameInp){
        uNameInp.addEventListener('change', function(){
          selUnitObj.label = uNameInp.value.trim() || 'Отряд';
          WI.saveTacticalState();
          if(typeof render === 'function') render();
        });
      }
      var uStrInp = document.getElementById('wiSelUnitStrInp');
      if(uStrInp){
        uStrInp.addEventListener('change', function(){
          selUnitObj.strength = uStrInp.value.trim();
          WI.saveTacticalState();
          if(typeof render === 'function') render();
        });
      }
      var uFacSel = document.getElementById('wiSelUnitFacSel');
      if(uFacSel){
        uFacSel.addEventListener('change', function(){
          selUnitObj.nation = uFacSel.value;
          delete selUnitObj.nation_override;
          WI.saveTacticalState();
          if(typeof render === 'function') render();
        });
      }
      var uTypeSel = document.getElementById('wiSelUnitTypeSel');
      if(uTypeSel){
        uTypeSel.addEventListener('change', function(){
          selUnitObj.type = uTypeSel.value;
          var utInfo = WI_TACTICAL_UNIT_TYPES[selUnitObj.type];
          if(utInfo && !selUnitObj.strength) selUnitObj.strength = utInfo.defaultStr;
          WI.saveTacticalState();
          if(typeof render === 'function') render();
        });
      }
      var uStatusSel = document.getElementById('wiSelUnitStatusSel');
      if(uStatusSel){
        uStatusSel.addEventListener('change', function(){
          selUnitObj.status = uStatusSel.value;
          WI.saveTacticalState();
          if(typeof render === 'function') render();
        });
      }
      var uHpRange = document.getElementById('wiSelUnitHpRange');
      var uHpVal = document.getElementById('wiSelUnitHpVal');
      if(uHpRange){
        uHpRange.addEventListener('input', function(){
          selUnitObj.hp = parseInt(uHpRange.value, 10) || 100;
          if(uHpVal) uHpVal.textContent = selUnitObj.hp + '%';
          updateWiWarLayerOnly();
        });
        uHpRange.addEventListener('change', function(){
          selUnitObj.hp = parseInt(uHpRange.value, 10) || 100;
          if(selUnitObj.hp <= 45 && selUnitObj.status === 'ready') selUnitObj.status = 'damaged';
          WI.saveTacticalState();
          if(typeof render === 'function') render();
        });
      }
      var uMarchModeBtn = document.getElementById('wiSelUnitMarchModeBtn');
      if(uMarchModeBtn){
        uMarchModeBtn.addEventListener('click', function(){
          m.tacticsTool = (m.tacticsTool === 'march' ? 'pan' : 'march');
          if(m.tacticsTool === 'march'){
            WI.toast('🏃 Режим марша: кликайте по карте, чтобы проложить путь для «' + (selUnitObj.label || 'Отряда') + '»', 'info');
          }
          if(typeof render === 'function') render();
        });
      }
      var uAnimMarchBtn = document.getElementById('wiSelUnitAnimMarchBtn');
      if(uAnimMarchBtn){
        uAnimMarchBtn.addEventListener('click', function(){
          animateWiUnitsMarch([m.selectedUnitIdx]);
        });
      }
      var uClearMarchBtn = document.getElementById('wiSelUnitClearMarchBtn');
      if(uClearMarchBtn){
        uClearMarchBtn.addEventListener('click', function(){
          selUnitObj.marchPath = [];
          if(selUnitObj.status === 'march') selUnitObj.status = 'ready';
          WI.saveTacticalState();
          if(typeof render === 'function') render();
        });
      }
      var uCloneBtn = document.getElementById('wiSelUnitCloneBtn');
      if(uCloneBtn){
        uCloneBtn.addEventListener('click', function(){
          var copy = JSON.parse(JSON.stringify(selUnitObj));
          copy.id = 'u_' + Date.now();
          copy.x = Math.min(2840, (selUnitObj.x || 1400) + 45);
          copy.y = Math.min(4040, (selUnitObj.y || 1200) + 35);
          copy.marchPath = [];
          m.tacticalUnits.push(copy);
          m.selectedUnitIdx = m.tacticalUnits.length - 1;
          WI.saveTacticalState();
          WI.toast('📑 Соединение дублировано на карте', 'success');
          if(typeof render === 'function') render();
        });
      }
      var uCloseBtn = document.getElementById('wiSelUnitCloseBtn');
      if(uCloseBtn){
        uCloseBtn.addEventListener('click', function(){
          m.selectedUnitIdx = -1;
          if(m.tacticsTool === 'march') m.tacticsTool = 'pan';
          if(typeof render === 'function') render();
        });
      }
    }

    var rosterFilterSel = document.getElementById('wiTacticsRosterFilter');
    if(rosterFilterSel){
      rosterFilterSel.addEventListener('change', function(){
        m.unitFactionFilter = rosterFilterSel.value || 'all';
        if(typeof render === 'function') render();
      });
    }

    document.querySelectorAll('[data-wi-select-unit]').forEach(function(row){
      row.addEventListener('click', function(e){
        if(e.target.closest && e.target.closest('button')) return;
        var idx = parseInt(row.getAttribute('data-wi-select-unit'), 10);
        m.selectedUnitIdx = idx;
        var u = (m.tacticalUnits || [])[idx];
        if(u){
          focusOn(u.x, u.y, Math.max(m.zoom || 1.1, 1.9));
        }
        if(typeof render === 'function') render();
      });
    });

    document.querySelectorAll('[data-wi-march-unit]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute('data-wi-march-unit'), 10);
        m.selectedUnitIdx = idx;
        m.tacticsTool = 'march';
        var u = (m.tacticalUnits || [])[idx];
        if(u){
          focusOn(u.x, u.y, Math.max(m.zoom || 1.1, 1.9));
          WI.toast('🏃 Кликайте по карте, чтобы проложить маршрут марша для «' + (u.label || 'Отряда') + '»', 'info');
        }
        if(typeof render === 'function') render();
      });
    });

    // Симулятор боя и индикаторы схваток
    var simAttSel = document.getElementById('wiSimAttackerSel');
    if(simAttSel){
      simAttSel.addEventListener('change', function(){
        m.battleAttackerIdx = parseInt(simAttSel.value, 10) || 0;
      });
    }
    var simDefSel = document.getElementById('wiSimDefenderSel');
    if(simDefSel){
      simDefSel.addEventListener('change', function(){
        m.battleDefenderIdx = parseInt(simDefSel.value, 10) || 0;
      });
    }

    document.querySelectorAll('[data-wi-sim-pair]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var parts = (btn.getAttribute('data-wi-sim-pair') || '0,1').split(',');
        m.battleAttackerIdx = parseInt(parts[0], 10) || 0;
        m.battleDefenderIdx = parseInt(parts[1], 10) || 1;
        m.tacticsTab = 'battles';
        if(typeof render === 'function') render();
      });
    });

    var simMoveToBattleBtn = document.getElementById('wiSimMoveToBattleBtn');
    if(simMoveToBattleBtn){
      simMoveToBattleBtn.addEventListener('click', function(){
        var uA = (m.tacticalUnits || [])[m.battleAttackerIdx || 0];
        var uB = (m.tacticalUnits || [])[m.battleDefenderIdx || 1];
        if(!uA || !uB || uA === uB){
          WI.toast('⚠️ Выберите два разных отряда для сближения', 'info');
          return;
        }
        var ang = Math.atan2(uA.y - uB.y, uA.x - uB.x);
        uA.marchPath = [{
          x: Math.round(uB.x + Math.cos(ang) * 58),
          y: Math.round(uB.y + Math.sin(ang) * 58)
        }];
        uA.status = 'march';
        focusOn(uB.x, uB.y, Math.max(m.zoom || 1.1, 2.0));
        animateWiUnitsMarch([m.battleAttackerIdx || 0]);
      });
    }

    var simRollClashBtn = document.getElementById('wiSimRollClashBtn');
    if(simRollClashBtn){
      simRollClashBtn.addEventListener('click', function(){
        var idxA = m.battleAttackerIdx || 0;
        var idxB = m.battleDefenderIdx != null ? m.battleDefenderIdx : 1;
        var uA = (m.tacticalUnits || [])[idxA];
        var uB = (m.tacticalUnits || [])[idxB];
        if(!uA || !uB || idxA === idxB){
          WI.toast('⚠️ Выберите два разных соединения (Атакующего и Обороняющегося)', 'info');
          return;
        }
        var utA = WI_TACTICAL_UNIT_TYPES[uA.type] || WI_TACTICAL_UNIT_TYPES.army;
        var utB = WI_TACTICAL_UNIT_TYPES[uB.type] || WI_TACTICAL_UNIT_TYPES.army;
        var ter = getTerrainAt(uB.x, uB.y);
        var defTerBonus = (ter.id === 'mountain' || ter.id === 'swamp' || ter.id === 'forest') ? 2 : (uB.type === 'fort' ? 3 : 1);

        var rollA = (1 + Math.floor(Math.random() * 6)) + (1 + Math.floor(Math.random() * 6));
        var rollB = (1 + Math.floor(Math.random() * 6)) + (1 + Math.floor(Math.random() * 6));
        var hpModA = Math.round(((uA.hp != null ? uA.hp : 100) / 100) * 4);
        var hpModB = Math.round(((uB.hp != null ? uB.hp : 100) / 100) * 4);

        var totalA = rollA + (utA.basePow || 5) + hpModA;
        var totalB = rollB + (utB.basePow || 5) + hpModB + defTerBonus;

        var diff = totalA - totalB;
        var lossA = 0, lossB = 0, outcomeTitle = '', outcomeColor = '#f59e0b';
        if(diff >= 3){
          lossA = 10; lossB = 30;
          outcomeTitle = '🏆 Сокрушительная победа атакующих: ' + (uA.label || utA.label);
          outcomeColor = '#10b981';
          uA.status = 'battle';
          uB.status = 'damaged';
        } else if(diff > 0){
          lossA = 15; lossB = 20;
          outcomeTitle = '⚔️ Тактический успех атаки: ' + (uA.label || utA.label);
          outcomeColor = '#38bdf8';
          uA.status = 'battle';
          uB.status = 'battle';
        } else if(diff === 0){
          lossA = 20; lossB = 20;
          outcomeTitle = '🩸 Кровавая ничья на рубеже (' + ter.name + ')';
          outcomeColor = '#f59e0b';
          uA.status = 'battle';
          uB.status = 'battle';
        } else {
          lossA = 25; lossB = 10;
          outcomeTitle = '🛡️ Оборона устояла! ' + (uB.label || utB.label) + ' отбили штурм';
          outcomeColor = '#ef4444';
          uA.status = 'damaged';
          uB.status = 'ready';
        }

        uA.hp = Math.max(10, (uA.hp != null ? uA.hp : 100) - lossA);
        uB.hp = Math.max(10, (uB.hp != null ? uB.hp : 100) - lossB);

        m.battleLog = m.battleLog || [];
        m.battleLog.unshift({
          title: outcomeTitle,
          color: outcomeColor,
          desc: 'Атака [' + (uA.label || utA.label) + ']: 2d6(' + rollA + ') + Сила(' + (utA.basePow || 5) + ') + Боесп.(' + hpModA + ') = ' + totalA +
                '  VS  Оборона [' + (uB.label || utB.label) + ']: 2d6(' + rollB + ') + Сила(' + (utB.basePow || 5) + ') + Боесп.(' + hpModB + ') + Рельеф(' + defTerBonus + ', ' + ter.name + ') = ' + totalB +
                ' • Потери: -' + lossA + '% / -' + lossB + '%'
        });
        focusOn(Math.round((uA.x + uB.x) / 2), Math.round((uA.y + uB.y) / 2), Math.max(m.zoom || 1.1, 1.9));
        WI.saveTacticalState();
        WI.toast(outcomeTitle + ' (' + totalA + ' против ' + totalB + ')', 'success');
        if(typeof render === 'function') render();
      });
    }

    var regSearchInp = document.getElementById('wiTacticsRegionSearch');
    if(regSearchInp){
      regSearchInp.addEventListener('input', function(){
        m.regionSearch = regSearchInp.value;
        if(typeof render === 'function') render();
        var el = document.getElementById('wiTacticsRegionSearch');
        if(el){
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      });
    }

    var aiReportBtn = document.getElementById('wiTacticsAiReportBtn');
    if(aiReportBtn){
      aiReportBtn.addEventListener('click', function(){
        var unitsList = (m.tacticalUnits || []).map(function(u){
          var fac = WI_TACTICAL_FACTIONS[u.nation_override || u.nation] || WI_TACTICAL_FACTIONS.nilfgaard;
          var ut = WI_TACTICAL_UNIT_TYPES[u.type] || WI_TACTICAL_UNIT_TYPES.army;
          return '- ' + (u.label || ut.label) + ' (' + fac.name + ', ' + (u.strength || ut.label) + ', Боеспособность ' + (u.hp != null ? u.hp : 100) + '%)';
        }).join('\n');
        var clashesNow = detectWiTacticalClashes(m.tacticalUnits || []);

        aiReportBtn.disabled = true;
        aiReportBtn.textContent = '⏳ Разведка собирает донесения...';

        var sysPrompt = 'Ты — глава военной разведки Континента во вселенной «Ведьмака» (в стиле Сигизмунда Дийкстры и маршала Менно Коегоорна). Напиши краткую, атмосферную оперативно-стратегическую сводку (4-6 предложений) по текущей карте боевых действий.';
        var userPrompt = 'Развернутые войска на карте:\n' + (unitsList || 'Войска не развернуты') + '\nАктивных столкновений: ' + clashesNow.length + '. Опиши стратегическую обстановку, угрозы флангам и дай 1 тактический совет командующему.';

        if(typeof WI.callGemini === 'function'){
          WI.callGemini(sysPrompt, userPrompt, 0.8).then(function(res){
            m.aiWarReport = (res || '').trim();
            if(typeof render === 'function') render();
          }).catch(function(){
            m.aiWarReport = '📜 Донесение Реданской Секретной Службы (Дийкстра):\nНа театре военных действий развёрнуто ' + (m.tacticalUnits || []).length + ' соединений (активных очагов боёв: ' + clashesNow.length + '). Основные переправы через Яругу и Понтар остаются ключевыми узлами снабжения. Рекомендуется подтянуть тяжёлую кавалерию во фланг наступающим колоннам и удерживать высоты силами чародеев и стрелков.';
            if(typeof render === 'function') render();
          });
        } else {
          m.aiWarReport = '📜 Донесение Реданской Секретной Службы (Дийкстра):\nНа театре военных действий развёрнуто ' + (m.tacticalUnits || []).length + ' соединений (активных очагов боёв: ' + clashesNow.length + '). Основные переправы через Яругу и Понтар остаются ключевыми узлами снабжения.';
          if(typeof render === 'function') render();
        }
      });
    }

    function undoWarAction(){
      if(m.warPaths && m.warPaths.length > 0){
        m.warPaths.pop();
        WI.saveTacticalState();
        WI.toast('↩️ Последняя линия/стрела удалена', 'info');
        if(typeof render === 'function') render();
      } else if(m.tacticalUnits && m.tacticalUnits.length > 0){
        m.tacticalUnits.pop();
        if(m.selectedUnitIdx >= m.tacticalUnits.length) m.selectedUnitIdx = m.tacticalUnits.length - 1;
        WI.saveTacticalState();
        WI.toast('↩️ Последний размещённый отряд снят', 'info');
        if(typeof render === 'function') render();
      } else {
        WI.toast('Нет тактических действий для отмены', 'info');
      }
    }

    function clearWarState(){
      if(!confirm('Сбросить все линии фронта, размещённые отряды и вернуть границы королевств к исходному состоянию?')) return;
      m.warPaths = [];
      m.tacticalUnits = [];
      m.territoryOwners = {};
      m.battleLog = [];
      m.selectedUnitIdx = -1;
      WI.saveTacticalState();
      WI.toast('🧹 Тактическая карта полностью очищена', 'info');
      if(typeof render === 'function') render();
    }

    var warUndoBtn = document.getElementById('wiWarUndoBtn');
    if(warUndoBtn) warUndoBtn.addEventListener('click', undoWarAction);
    var warUndoInspBtn = document.getElementById('wiWarUndoInspectorBtn');
    if(warUndoInspBtn) warUndoInspBtn.addEventListener('click', undoWarAction);

    var warClearBtn = document.getElementById('wiWarClearBtn');
    if(warClearBtn) warClearBtn.addEventListener('click', clearWarState);
    var warClearInspBtn = document.getElementById('wiWarClearInspectorBtn');
    if(warClearInspBtn) warClearInspBtn.addEventListener('click', clearWarState);

    // Загрузка каноничного сценария Северных войн
    document.querySelectorAll('[data-wi-scenario]').forEach(function(card){
      card.addEventListener('click', function(){
        var scId = card.getAttribute('data-wi-scenario');
        var sc = WI_TACTICAL_SCENARIOS.find(function(s){ return s.id === scId; });
        if(sc){
          m.territoryOwners = JSON.parse(JSON.stringify(sc.owners || {}));
          m.tacticalUnits = JSON.parse(JSON.stringify(sc.units || []));
          m.warPaths = JSON.parse(JSON.stringify(sc.warPaths || sc.paths || []));
          m.selectedUnitIdx = m.tacticalUnits.length > 0 ? 0 : -1;
          if(sc.cam){
            m.cx = sc.cam.cx;
            m.cy = sc.cam.cy;
            m.zoom = sc.cam.zoom;
          }
          WI.saveTacticalState();
          WI.toast('⚔️ Загружен сценарий: «' + sc.name + '»', 'success');
          if(typeof render === 'function') render();
        }
      });
    });

    // Смена владельца территории из селекта в инспекторе
    document.querySelectorAll('.wi-territory-owner-sel').forEach(function(sel){
      sel.addEventListener('change', function(){
        var tid = sel.getAttribute('data-tid');
        if(tid){
          m.territoryOwners = m.territoryOwners || {};
          if(sel.value === 'independent'){
            delete m.territoryOwners[tid];
          } else {
            m.territoryOwners[tid] = sel.value;
          }
          WI.saveTacticalState();
          var fac = WI_TACTICAL_FACTIONS[sel.value];
          WI.toast('🏴 Регион перешёл под контроль: ' + (fac ? fac.name : sel.value), 'info');
          if(typeof render === 'function') render();
        }
      });
    });

    // Действия со списком отрядов в инспекторе
    document.querySelectorAll('[data-wi-focus-unit]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute('data-wi-focus-unit'), 10);
        var u = (m.tacticalUnits || [])[idx];
        if(u){
          m.selectedUnitIdx = idx;
          focusOn(u.x, u.y, Math.max(m.zoom || 1.1, 2.2));
          WI.toast('🎯 Камера наведена на ' + (u.label || 'отряд'), 'info');
          if(typeof render === 'function') render();
        }
      });
    });

    document.querySelectorAll('[data-wi-del-unit]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute('data-wi-del-unit'), 10);
        if(m.tacticalUnits && m.tacticalUnits[idx]){
          var removed = m.tacticalUnits.splice(idx, 1)[0];
          if(m.selectedUnitIdx === idx) m.selectedUnitIdx = -1;
          else if(m.selectedUnitIdx > idx) m.selectedUnitIdx--;
          WI.saveTacticalState();
          WI.toast('🗑️ Соединение «' + (removed.label || 'Отряд') + '» снято с карты', 'info');
          if(typeof render === 'function') render();
        }
      });
    });

    // Клик по строке метки в инспекторе
    document.querySelectorAll('.wi-user-marker-row').forEach(function(row){
      row.addEventListener('click', function(){
        var mid = row.getAttribute('data-marker-id');
        var um = (m.userMarkers || []).find(function(x){ return x.id === mid; });
        if(um){
          m.selectedMarkerId = um.id;
          focusOn(um.x, um.y, Math.max(m.zoom || 1.1, 2.2));
          WI.toast('📍 Камера перемещена к «' + um.title + '»', 'info');
        }
      });
    });

    // Форма создания/редактирования меток
    document.querySelectorAll('[data-wi-micon]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var ic = btn.getAttribute('data-wi-micon');
        var inp = document.getElementById('wiMarkerFormIcon');
        if(inp) inp.value = ic;
        document.querySelectorAll('[data-wi-micon]').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });

    var cancelMarkerFormBtn = document.getElementById('wiMarkerCancelFormBtn');
    if(cancelMarkerFormBtn){
      cancelMarkerFormBtn.addEventListener('click', function(){
        m.editingMarkerId = null;
        m.placingMarkerCoords = null;
        if(typeof render === 'function') render();
      });
    }

    var saveMarkerFormBtn = document.getElementById('wiMarkerSaveFormBtn');
    if(saveMarkerFormBtn){
      saveMarkerFormBtn.addEventListener('click', function(){
        var mid = saveMarkerFormBtn.getAttribute('data-marker-id');
        var titleEl = document.getElementById('wiMarkerFormTitle');
        var iconEl = document.getElementById('wiMarkerFormIcon');
        var descEl = document.getElementById('wiMarkerFormDesc');
        var xEl = document.getElementById('wiMarkerFormX');
        var yEl = document.getElementById('wiMarkerFormY');
        var title = (titleEl && titleEl.value ? titleEl.value.trim() : '');
        if(!title){
          WI.toast('⚠️ Введите название метки', 'info');
          if(titleEl) titleEl.focus();
          return;
        }
        var icon = (iconEl && iconEl.value) || '🐺';
        var desc = (descEl && descEl.value ? descEl.value.trim() : '');
        var mx = parseInt(xEl && xEl.value, 10) || Math.round(m.cx || 1440);
        var my = parseInt(yEl && yEl.value, 10) || Math.round(m.cy || 1200);

        m.userMarkers = m.userMarkers || [];
        var existing = m.userMarkers.find(function(x){ return x.id === mid; });
        if(existing){
          existing.title = title;
          existing.icon = icon;
          existing.desc = desc;
          existing.x = mx;
          existing.y = my;
        } else {
          m.userMarkers.push({
            id: mid || ('um_' + Date.now()),
            title: title,
            icon: icon,
            desc: desc,
            x: mx,
            y: my
          });
        }
        m.selectedMarkerId = mid;
        m.editingMarkerId = null;
        m.placingMarkerCoords = null;
        WI.saveUserMarkers();
        WI.toast('✓ Тактическая метка «' + title + '» сохранена', 'success');
        if(typeof render === 'function') render();
      });
    }

    document.querySelectorAll('[data-wi-edit-marker]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var id = btn.getAttribute('data-wi-edit-marker');
        m.editingMarkerId = id;
        m.placingMarkerCoords = null;
        if(typeof render === 'function') render();
      });
    });

    var clearAllMarkersBtn = document.getElementById('wiMapClearAllMarkersBtn');
    if(clearAllMarkersBtn){
      clearAllMarkersBtn.addEventListener('click', function(){
        if(!confirm('Удалить все пользовательские метки с карты?')) return;
        m.userMarkers = [];
        m.selectedMarkerId = null;
        m.editingMarkerId = null;
        m.placingMarkerCoords = null;
        WI.saveUserMarkers();
        WI.toast('🧹 Все метки очищены', 'info');
        if(typeof render === 'function') render();
      });
    }

    // Центрировать камеру на выбранной локации из инспектора
    var centerOnLocBtn = document.getElementById('wiMapCenterOnLocBtn');
    if(centerOnLocBtn){
      centerOnLocBtn.addEventListener('click', function(){
        var loc = getWiActiveLocation(m);
        if(loc){
          focusOn(loc.x, loc.y, Math.max(m.zoom || 1.1, 2.0));
          WI.toast('🎯 Камера сфокусирована на ' + loc.name, 'info');
        }
      });
    }

    // Кнопка быстрого направления маршрута через город с переправой
    document.querySelectorAll('.wi-insert-crossing-btn').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var sIdx = parseInt(btn.getAttribute('data-seg-idx'), 10);
        var locId = btn.getAttribute('data-loc-id');
        var loc = WI_MAP_LOCATIONS.find(function(l){ return l.id === locId; });
        if(loc && !isNaN(sIdx) && m.routePoints && sIdx >= 0 && sIdx < m.routePoints.length){
          var newPt = {
            id: 'wp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: loc.name,
            x: loc.x,
            y: loc.y,
            stopType: 'inn'
          };
          m.routePoints.splice(sIdx + 1, 0, newPt);
          WI.saveRoute();
          WI.toast('✓ Маршрут направлен через «' + loc.name + '»', 'success');
          if(typeof render === 'function') render();
        }
      });
    });

    // Удаление точки маршрута
    function removeRoutePoint(ptId){
      m.routePoints = m.routePoints || [];
      var idx = m.routePoints.findIndex(function(p){ return p.id === ptId; });
      if(idx !== -1){
        var removed = m.routePoints.splice(idx, 1)[0];
        WI.saveRoute();
        WI.toast('🗑️ Точка «' + (removed.name || ('#' + (idx + 1))) + '» удалена из маршрута', 'info');
        if(typeof render === 'function') render();
      }
    }

    document.querySelectorAll('.wi-route-row').forEach(function(row){
      row.addEventListener('contextmenu', function(e){
        e.preventDefault();
      });
    });

    document.querySelectorAll('[data-wi-pt-del]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var ptId = btn.getAttribute('data-wi-pt-del');
        removeRoutePoint(ptId);
      });
    });

    document.querySelectorAll('[data-wi-pt-focus]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var ptId = btn.getAttribute('data-wi-pt-focus');
        var pt = (m.routePoints || []).find(function(p){ return p.id === ptId; });
        if(pt){
          focusOn(pt.x, pt.y, Math.max(m.zoom || 1.1, 2.2));
          WI.toast('🎯 Фокус на: ' + pt.name, 'info');
        }
      });
    });

    document.querySelectorAll('.wi-pt-name-edit').forEach(function(el){
      el.addEventListener('click', function(){
        var ptId = el.getAttribute('data-wi-pt-id');
        var pt = (m.routePoints || []).find(function(p){ return p.id === ptId; });
        if(!pt) return;
        var newName = prompt('Новое название точки маршрута:', pt.name);
        if(newName && newName.trim()){
          pt.name = newName.trim();
          WI.saveRoute();
          if(typeof render === 'function') render();
        }
      });
    });

    document.querySelectorAll('[data-wi-pt-stop]').forEach(function(sel){
      sel.addEventListener('change', function(){
        var ptId = sel.getAttribute('data-wi-pt-stop');
        var pt = (m.routePoints || []).find(function(p){ return p.id === ptId; });
        if(pt){
          pt.stopType = sel.value;
          WI.saveRoute();
          if(typeof render === 'function') render();
        }
      });
    });

    var addCenterPtBtn = document.getElementById('wiRouteAddCenterBtn');
    if(addCenterPtBtn){
      addCenterPtBtn.addEventListener('click', function(){
        var cx = Math.round(m.cx || 1440);
        var cy = Math.round(m.cy || 1200);
        var ter = getTerrainAt(cx, cy);
        m.routePoints = m.routePoints || [];
        var count = m.routePoints.length;
        m.routePoints.push({
          id: 'wp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: (count === 0 ? 'Старт: ' : 'Точка ' + (count + 1) + ': ') + ter.name,
          x: cx,
          y: cy,
          stopType: count > 0 ? 'camp' : 'none'
        });
        WI.saveRoute();
        WI.toast('✓ Добавлена точка #' + (count + 1) + ' в центре карты', 'success');
        if(typeof render === 'function') render();
      });
    }

    var revBtn = document.getElementById('wiRouteReverseBtn');
    if(revBtn){
      revBtn.addEventListener('click', function(){
        if(!m.routePoints || m.routePoints.length < 2) return;
        m.routePoints.reverse();
        WI.saveRoute();
        WI.toast('🔄 Маршрут развернут в обратную сторону', 'info');
        if(typeof render === 'function') render();
      });
    }

    var loopBtn = document.getElementById('wiRouteLoopBtn');
    if(loopBtn){
      loopBtn.addEventListener('click', function(){
        if(!m.routePoints || m.routePoints.length < 2) return;
        var p0 = m.routePoints[0];
        m.routePoints.push({
          id: 'wp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: 'Возвращение: ' + p0.name,
          x: p0.x,
          y: p0.y,
          stopType: 'camp'
        });
        WI.saveRoute();
        WI.toast('🔁 Маршрут замкнут в кольцо', 'success');
        if(typeof render === 'function') render();
      });
    }

    var clearBtn = document.getElementById('wiRouteClearBtn');
    if(clearBtn){
      clearBtn.addEventListener('click', function(){
        if(!m.routePoints || !m.routePoints.length) return;
        if(!confirm('Очистить все точки текущего маршрута?')) return;
        m.routePoints = [];
        WI.saveRoute();
        WI.toast('🧹 Маршрут очищен', 'info');
        if(typeof render === 'function') render();
      });
    }

    document.querySelectorAll('[data-wi-route-mode]').forEach(function(btn){
      btn.addEventListener('click', function(){
        m.travelMode = btn.getAttribute('data-wi-route-mode');
        WI.saveRoute();
        if(typeof render === 'function') render();
      });
    });

    document.querySelectorAll('[data-wi-route-pace]').forEach(function(btn){
      btn.addEventListener('click', function(){
        m.travelPace = btn.getAttribute('data-wi-route-pace');
        WI.saveRoute();
        if(typeof render === 'function') render();
      });
    });

    document.querySelectorAll('[data-wi-route-preset]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var pKey = btn.getAttribute('data-wi-route-preset');
        var pts = WI_ROUTE_PRESETS[pKey];
        if(pts){
          m.routePoints = JSON.parse(JSON.stringify(pts));
          if(pKey === 'novi_skellige') m.travelMode = 'boat';
          else if(m.travelMode === 'boat') m.travelMode = 'horse';
          WI.saveRoute();
          WI.toast('✓ Загружен маршрут «' + btn.textContent.trim() + '»', 'success');
          if(typeof render === 'function') render();
        }
      });
    });

    var setRouteDestBtn = document.getElementById('wiMapSetRouteDestBtn');
    if(setRouteDestBtn){
      setRouteDestBtn.addEventListener('click', function(){
        var loc = getWiActiveLocation(m);
        if(loc){
          m.routePoints = m.routePoints || [];
          m.routePoints.push({
            id: 'wp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: loc.name,
            x: loc.x,
            y: loc.y,
            stopType: m.routePoints.length > 0 ? 'inn' : 'none'
          });
          m.mode = 'route';
          WI.saveRoute();
          if(typeof render === 'function') render();
        }
      });
    }

    var setRouteOrigBtn = document.getElementById('wiMapSetRouteOriginBtn');
    if(setRouteOrigBtn){
      setRouteOrigBtn.addEventListener('click', function(){
        var loc = getWiActiveLocation(m);
        if(loc){
          m.routePoints = [{
            id: 'wp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: 'Старт: ' + loc.name,
            x: loc.x,
            y: loc.y,
            stopType: 'inn'
          }];
          m.mode = 'route';
          WI.saveRoute();
          if(typeof render === 'function') render();
        }
      });
    }

    var rollEncBtn = document.getElementById('wiMapRollEncounterBtn');
    if(rollEncBtn){
      rollEncBtn.addEventListener('click', function(){
        var rCalc = calcFullRoute(m.routePoints, m.travelMode || 'horse', m.travelPace || 'normal');
        var rnd = getRandomEncounterForRoute(rCalc);
        m.encounter = rnd;
        if(typeof render === 'function') render();
      });
    }

    // Метки: открытие встроенной формы добавления в центр экрана
    var addMarkerBtn = document.getElementById('wiMapAddMarkerOpenBtn');
    if(addMarkerBtn){
      addMarkerBtn.addEventListener('click', function(){
        m.editingMarkerId = null;
        m.placingMarkerCoords = {
          x: Math.round(m.cx || 1440),
          y: Math.round(m.cy || 1200)
        };
        if(typeof render === 'function') render();
        var tEl = document.getElementById('wiMarkerFormTitle');
        if(tEl) tEl.focus();
      });
    }

    document.querySelectorAll('[data-wi-del-marker]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var id = btn.getAttribute('data-wi-del-marker');
        m.userMarkers = (m.userMarkers || []).filter(function(x){ return x.id !== id; });
        if(m.selectedMarkerId === id) m.selectedMarkerId = null;
        if(m.editingMarkerId === id) m.editingMarkerId = null;
        WI.saveUserMarkers();
        if(typeof render === 'function') render();
      });
    });

    // Поиск
    var searchInput = document.getElementById('wiMapSearch');
    if(searchInput){
      searchInput.addEventListener('input', function(){
        m.search = searchInput.value;
        var q = (searchInput.value || '').toLowerCase().trim();
        if(q){
          var found = WI_MAP_LOCATIONS.find(function(l){
            return l.name.toLowerCase().indexOf(q) !== -1 || (l.region || '').toLowerCase().indexOf(q) !== -1;
          });
          if(found){
            m.selectedLocId = found.id;
            focusOn(found.x, found.y, Math.max(m.zoom || 1.1, 2.2));
          }
        }
      });
      searchInput.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){
          if(typeof render === 'function') render();
        }
      });
    }

    // Drag, Wheel, Pinch-Zoom, перемещение точек/отрядов/меток, рисование фронта и клик по карте
    var vport = document.getElementById('wiMapViewport');
    if(vport && !vport.__panBound){
      vport.__panBound = true;
      var isDown = false;
      var startX, startY;
      var hasDragged = false;

      var isDraggingPoint = false;
      var dragPtId = null;
      var dragPtObj = null;
      var dragPtEl = null;
      var dragStartClientX = 0, dragStartClientY = 0;
      var dragPtHasMoved = false;
      var justHandledPointAction = false;

      var isPaintingWar = false;
      var currentWarPath = null;

      var isDraggingUnit = false;
      var dragUnitIdx = -1;
      var dragUnitObj = null;
      var dragUnitEl = null;
      var dragUnitHasMoved = false;

      var isDraggingMarker = false;
      var dragMarkerId = null;
      var dragMarkerObj = null;
      var dragMarkerEl = null;
      var dragMarkerHasMoved = false;

      vport.addEventListener('contextmenu', function(e){
        e.preventDefault();
        e.stopPropagation();
      });

      vport.addEventListener('mousedown', function(e){
        if(e.button !== 0) return;

        // 1. Проверяем нажатие на тактический отряд
        var unitEl = e.target.closest && e.target.closest('.wi-tactical-unit');
        if(unitEl){
          var uIdx = parseInt(unitEl.getAttribute('data-wi-unit-idx'), 10);
          var uObj = (m.tacticalUnits || [])[uIdx];
          if(uObj){
            isDraggingUnit = true;
            dragUnitIdx = uIdx;
            dragUnitObj = uObj;
            dragUnitEl = unitEl;
            dragStartClientX = e.clientX;
            dragStartClientY = e.clientY;
            dragUnitHasMoved = false;
            vport.style.cursor = 'grabbing';
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }

        // 2. Проверяем нажатие на пользовательскую метку
        var markerEl = e.target.closest && e.target.closest('.wi-user-marker');
        if(markerEl){
          var mid = markerEl.getAttribute('data-user-marker-id');
          var mObj = (m.userMarkers || []).find(function(x){ return x.id === mid; });
          if(mObj){
            isDraggingMarker = true;
            dragMarkerId = mid;
            dragMarkerObj = mObj;
            dragMarkerEl = markerEl;
            dragStartClientX = e.clientX;
            dragStartClientY = e.clientY;
            dragMarkerHasMoved = false;
            vport.style.cursor = 'grabbing';
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }

        // 3. Проверяем нажатие на путевую точку маршрута
        var ptEl = e.target.closest && e.target.closest('.wi-route-point');
        if(ptEl){
          var ptId = ptEl.getAttribute('data-route-pt-id');
          var ptObj = (m.routePoints || []).find(function(p){ return p.id === ptId; });
          if(ptObj){
            isDraggingPoint = true;
            dragPtId = ptId;
            dragPtObj = ptObj;
            dragPtEl = ptEl;
            dragStartClientX = e.clientX;
            dragStartClientY = e.clientY;
            dragPtHasMoved = false;
            vport.style.cursor = 'grabbing';
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }

        // 4. Режим рисования линии фронта или наступательной стрелы удара (Тактика -> Фронт / Стрела)
        if(m.mode === 'tactics' && (m.tacticsTool === 'paint' || m.tacticsTool === 'arrow')){
          isPaintingWar = true;
          hasDragged = true;
          var pt = clientToSvgCoords(e.clientX, e.clientY);
          currentWarPath = {
            nation: m.warNation === 'independent' ? 'nilfgaard' : (m.warNation || 'nilfgaard'),
            style: (m.tacticsTool === 'arrow' ? 'arrow' : 'front'),
            size: m.brushSize || 48,
            d: 'M ' + pt.x + ' ' + pt.y
          };
          m.warPaths = m.warPaths || [];
          m.warPaths.push(currentWarPath);
          updateWiWarLayerOnly();
          e.preventDefault();
          return;
        }

        // 5. Обычное панорамирование карты
        isDown = true;
        hasDragged = false;
        startX = e.clientX;
        startY = e.clientY;
        vport.style.cursor = 'grabbing';
      });

      if(window.__wiMapOnMouseMove) window.removeEventListener('mousemove', window.__wiMapOnMouseMove);
      if(window.__wiMapOnMouseUp) window.removeEventListener('mouseup', window.__wiMapOnMouseUp);

      window.__wiMapOnMouseMove = function(e){
        // Обновление координат и рельефа в живом HUD при движении над картой
        if(vport && e.target && (e.target === vport || vport.contains(e.target))){
          var hoverPt = clientToSvgCoords(e.clientX, e.clientY);
          updateHud(hoverPt.x, hoverPt.y);
        }

        // Рисование линии фронта или стрелы удара
        if(isPaintingWar && currentWarPath){
          var wPt = clientToSvgCoords(e.clientX, e.clientY);
          currentWarPath.d += ' L ' + wPt.x + ' ' + wPt.y;
          updateWiWarLayerOnly();
          return;
        }

        // Перетаскивание тактического отряда
        if(isDraggingUnit && dragUnitObj){
          var dxU = e.clientX - dragStartClientX;
          var dyU = e.clientY - dragStartClientY;
          if(Math.hypot(dxU, dyU) > 4) dragUnitHasMoved = true;
          if(dragUnitHasMoved){
            var uPt = clientToSvgCoords(e.clientX, e.clientY);
            dragUnitObj.x = uPt.x;
            dragUnitObj.y = uPt.y;
            if(dragUnitEl){
              dragUnitEl.setAttribute('transform', 'translate(' + uPt.x + ',' + uPt.y + ')');
            }
          }
          return;
        }

        // Перетаскивание пользовательской метки
        if(isDraggingMarker && dragMarkerObj){
          var dxM = e.clientX - dragStartClientX;
          var dyM = e.clientY - dragStartClientY;
          if(Math.hypot(dxM, dyM) > 4) dragMarkerHasMoved = true;
          if(dragMarkerHasMoved){
            var mPt = clientToSvgCoords(e.clientX, e.clientY);
            dragMarkerObj.x = mPt.x;
            dragMarkerObj.y = mPt.y;
            if(dragMarkerEl){
              dragMarkerEl.setAttribute('transform', 'translate(' + mPt.x + ',' + mPt.y + ')');
            }
          }
          return;
        }

        // Перетаскивание точки маршрута
        if(isDraggingPoint && dragPtObj){
          var dxPt = e.clientX - dragStartClientX;
          var dyPt = e.clientY - dragStartClientY;
          if(Math.hypot(dxPt, dyPt) > 4){
            dragPtHasMoved = true;
          }

          if(dragPtHasMoved){
            var newCoords = clientToSvgCoords(e.clientX, e.clientY);
            var newPtX = newCoords.x;
            var newPtY = newCoords.y;

            dragPtObj.x = newPtX;
            dragPtObj.y = newPtY;

            if(dragPtEl){
              dragPtEl.setAttribute('transform', 'translate(' + newPtX + ',' + newPtY + ')');
            }

            var rpts = m.routePoints || [];
            if(rpts.length >= 2){
              var pData = 'M ' + rpts[0].x + ' ' + rpts[0].y;
              for(var k = 1; k < rpts.length; k++){
                pData += ' L ' + rpts[k].x + ' ' + rpts[k].y;
              }
              var pathBg = vport.querySelector('.wi-route-path-bg');
              var pathFg = vport.querySelector('.wi-route-path-fg');
              if(pathBg){ pathBg.setAttribute('d', pData); pathBg.style.fill = 'none'; }
              if(pathFg){ pathFg.setAttribute('d', pData); pathFg.style.fill = 'none'; }
            }
          }
          return;
        }

        if(!isDown) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        if(Math.hypot(dx, dy) > 4) hasDragged = true;
        startX = e.clientX;
        startY = e.clientY;

        var vw = vport.clientWidth || 800;
        var z = Math.max(0.4, Math.min(5.0, m.zoom || 1.1));
        var baseW = 2400;
        var scale = (baseW / z) / vw;

        m.cx = Math.max(-200, Math.min(3080, (m.cx || 1440) - dx * scale));
        m.cy = Math.max(-200, Math.min(4296, (m.cy || 1200) - dy * scale));
        updateMapTransform();
      };

      window.__wiMapOnMouseUp = function(){
        if(isPaintingWar){
          isPaintingWar = false;
          currentWarPath = null;
          justHandledPointAction = true;
          setTimeout(function(){ justHandledPointAction = false; }, 160);
          WI.saveTacticalState();
          if(typeof render === 'function') render();
          return;
        }

        if(isDraggingUnit){
          var uIdxDone = dragUnitIdx;
          var uMoved = dragUnitHasMoved;
          var uRef = dragUnitObj;
          isDraggingUnit = false;
          dragUnitIdx = -1;
          dragUnitObj = null;
          dragUnitEl = null;
          dragUnitHasMoved = false;
          if(vport) vport.style.cursor = (m.mode === 'tactics' && (m.tacticsTool === 'paint' || m.tacticsTool === 'arrow')) ? 'crosshair' : 'grab';

          justHandledPointAction = true;
          setTimeout(function(){ justHandledPointAction = false; }, 200);

          if(uMoved){
            m.selectedUnitIdx = uIdxDone;
            WI.saveTacticalState();
            WI.toast('♟️ Позиция соединения обновлена [' + uRef.x + ', ' + uRef.y + ']', 'success');
            if(typeof render === 'function') render();
          } else if(m.tacticalUnits && m.tacticalUnits[uIdxDone]){
            if(m.mode === 'tactics' && m.tacticsTool === 'eraser'){
              var removedU = m.tacticalUnits.splice(uIdxDone, 1)[0];
              if(m.selectedUnitIdx === uIdxDone) m.selectedUnitIdx = -1;
              else if(m.selectedUnitIdx > uIdxDone) m.selectedUnitIdx--;
              WI.saveTacticalState();
              WI.toast('🗑️ Соединение «' + (removedU.label || 'Отряд') + '» стёрто с карты', 'info');
              if(typeof render === 'function') render();
            } else {
              m.selectedUnitIdx = uIdxDone;
              m.mode = 'tactics';
              WI.toast('♟️ Выбрано соединение: «' + (uRef.label || 'Отряд') + '»', 'info');
              if(typeof render === 'function') render();
            }
          }
          return;
        }

        if(isDraggingMarker){
          var mMoved = dragMarkerHasMoved;
          var mRef = dragMarkerObj;
          isDraggingMarker = false;
          dragMarkerId = null;
          dragMarkerObj = null;
          dragMarkerEl = null;
          dragMarkerHasMoved = false;
          if(vport) vport.style.cursor = 'grab';

          justHandledPointAction = true;
          setTimeout(function(){ justHandledPointAction = false; }, 200);

          if(mMoved && mRef){
            WI.saveUserMarkers();
            WI.toast('📍 Метка «' + mRef.title + '» перемещена [' + mRef.x + ', ' + mRef.y + ']', 'success');
            if(typeof render === 'function') render();
          } else if(mRef){
            m.selectedMarkerId = mRef.id;
            WI.toast('📍 ' + mRef.title + (mRef.desc ? ': ' + mRef.desc : ''), 'info');
            if(m.mode === 'markers'){
              m.editingMarkerId = mRef.id;
              if(typeof render === 'function') render();
            }
          }
          return;
        }

        if(isDraggingPoint){
          var handledPtId = dragPtId;
          var didMove = dragPtHasMoved;
          var pt = dragPtObj;

          isDraggingPoint = false;
          dragPtId = null;
          dragPtObj = null;
          dragPtEl = null;
          dragPtHasMoved = false;
          if(vport) vport.style.cursor = 'grab';

          justHandledPointAction = true;
          setTimeout(function(){ justHandledPointAction = false; }, 200);

          if(didMove){
            if(pt){
              var nearCity = findNearestCity(pt.x, pt.y, 65);
              var isFirst = (m.routePoints && m.routePoints[0] && m.routePoints[0].id === pt.id);
              var idx = (m.routePoints || []).findIndex(function(p){ return p.id === pt.id; });
              if(nearCity){
                pt.name = (isFirst ? 'Старт: ' : '') + nearCity.name;
                pt.x = nearCity.x;
                pt.y = nearCity.y;
                if(!isFirst && pt.stopType === 'none') pt.stopType = 'inn';
              } else {
                var ter = getTerrainAt(pt.x, pt.y);
                pt.name = (isFirst ? 'Старт: ' : ('Точка ' + (idx + 1) + ' (')) + ter.name + (isFirst ? '' : ')');
              }
            }
            WI.saveRoute();
            WI.toast('✓ Точка перемещена', 'success');
            if(typeof render === 'function') render();
          } else {
            removeRoutePoint(handledPtId);
          }
          return;
        }

        if(isDown){
          isDown = false;
          if(vport) vport.style.cursor = (m.mode === 'tactics' && (m.tacticsTool === 'paint' || m.tacticsTool === 'arrow')) ? 'crosshair' : 'grab';
        }
      };

      window.addEventListener('mousemove', window.__wiMapOnMouseMove);
      window.addEventListener('mouseup', window.__wiMapOnMouseUp);

      // Зум колесиком мыши с привязкой к курсору
      vport.addEventListener('wheel', function(e){
        e.preventDefault();
        var vw = vport.clientWidth || 800;
        var vh = vport.clientHeight || 540;
        var ar = vw / vh;
        var rect = vport.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;
        var mouseY = e.clientY - rect.top;

        var curZoom = Math.max(0.4, Math.min(5.0, m.zoom || 1.1));
        var curVbW = 2400 / curZoom;
        var curVbH = (2400 / ar) / curZoom;
        var curMinX = (m.cx != null ? m.cx : 1440) - curVbW / 2;
        var curMinY = (m.cy != null ? m.cy : 1200) - curVbH / 2;

        var ptX = curMinX + (mouseX / vw) * curVbW;
        var ptY = curMinY + (mouseY / vh) * curVbH;

        var factor = e.deltaY > 0 ? 0.85 : 1.18;
        var newZoom = Math.max(0.4, Math.min(5.0, curZoom * factor));
        var newVbW = 2400 / newZoom;
        var newVbH = (2400 / ar) / newZoom;

        m.cx = ptX + (0.5 - mouseX / vw) * newVbW;
        m.cy = ptY + (0.5 - mouseY / vh) * newVbH;
        m.zoom = newZoom;
        updateMapTransform();
      }, { passive: false });

      // Клик по карте: пины городов, территории, отряды, путевые точки, метки
      vport.addEventListener('click', function(e){
        if(hasDragged) return;
        if(justHandledPointAction) return;
        if(e.button !== 0) return;

        var cPt = clientToSvgCoords(e.clientX, e.clientY);
        var clickX = cPt.x;
        var clickY = cPt.y;

        // Режим измерения расстояний (📏 Линейка)
        if(m.measureMode){
          m.measurePoints = Array.isArray(m.measurePoints) ? m.measurePoints : [];
          if(m.measurePoints.length >= 2) m.measurePoints = [];
          var nearCityRul = findNearestCity(clickX, clickY, 65);
          m.measurePoints.push({
            x: nearCityRul ? nearCityRul.x : clickX,
            y: nearCityRul ? nearCityRul.y : clickY,
            label: nearCityRul ? nearCityRul.name.split(' (')[0] : ''
          });
          if(m.measurePoints.length === 1){
            WI.toast('📏 Точка А установлена' + (nearCityRul ? ' (' + nearCityRul.name + ')' : '') + '. Кликните по второй точке!', 'info');
          } else if(m.measurePoints.length === 2){
            var p0 = m.measurePoints[0];
            var p1 = m.measurePoints[1];
            var distMiles = Math.max(1, Math.round(Math.hypot(p1.x - p0.x, p1.y - p0.y) * 0.42));
            var dHorse = (distMiles / 38).toFixed(1);
            var dFoot = (distMiles / 18).toFixed(1);
            WI.toast('📏 Дистанция: ' + distMiles + ' миль (🐎 ~' + dHorse + ' дн. верхом / 🥾 ~' + dFoot + ' дн. пешком)', 'success');
          }
          if(typeof render === 'function') render();
          return;
        }

        // Проверяем клик по Месту Силы или Логову Бестии (🔮)
        var hsEl = e.target.closest && e.target.closest('[data-wi-hotspot-id]');
        if(hsEl && typeof WI_MAP_LORE_HOTSPOTS !== 'undefined'){
          var hsId = hsEl.getAttribute('data-wi-hotspot-id');
          var hsObj = WI_MAP_LORE_HOTSPOTS.find(function(h){ return h.id === hsId; });
          if(hsObj){
            m.selectedHotspotId = hsObj.id;
            m.mode = 'inspect';
            WI.toast(hsObj.icon + ' ' + hsObj.name + ' — ' + hsObj.bonus, 'info');
            if(typeof render === 'function') render();
            return;
          }
        }

        // Проверяем клик по индикатору столкновения войск (⚔️ В БОЙ!)
        var clashEl = e.target.closest && e.target.closest('[data-wi-clash-pair]');
        if(clashEl){
          var clParts = (clashEl.getAttribute('data-wi-clash-pair') || '0,1').split(',');
          m.battleAttackerIdx = parseInt(clParts[0], 10) || 0;
          m.battleDefenderIdx = parseInt(clParts[1], 10) || 1;
          m.mode = 'tactics';
          m.tacticsTab = 'battles';
          WI.toast('⚔️ Открыт Тактический Симулятор Сражения!', 'info');
          if(typeof render === 'function') render();
          return;
        }

        // Проверяем клик непосредственно по интерактивному пину города/деревни/леса
        var pinEl = e.target.closest && e.target.closest('[data-wi-loc-pin]');
        if(pinEl && m.mode !== 'tactics'){
          var pinLocId = pinEl.getAttribute('data-wi-loc-pin');
          var pinLoc = WI_MAP_LOCATIONS.find(function(l){ return l.id === pinLocId; });
          if(pinLoc){
            if(m.mode === 'route'){
              m.routePoints = m.routePoints || [];
              var isFirstPin = m.routePoints.length === 0;
              m.routePoints.push({
                id: 'wp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                name: (isFirstPin ? 'Старт: ' : '') + pinLoc.name,
                x: pinLoc.x,
                y: pinLoc.y,
                stopType: isFirstPin ? 'none' : 'inn'
              });
              WI.saveRoute();
              WI.toast('✓ Локация «' + pinLoc.name + '» добавлена в маршрут', 'success');
              if(typeof render === 'function') render();
              return;
            } else {
              m.selectedLocId = pinLoc.id;
              m.customWildLoc = null;
              m.activeContract = null;
              m.boardSelectedContractId = null;
              WI.toast((m.mode === 'board' ? '📜 Доска объявлений: ' : pinLoc.icon + ' ') + pinLoc.name + ' (' + pinLoc.region + ')', 'info');
              if(typeof render === 'function') render();
              return;
            }
          }
        }

        // В режиме 'tactics' (Военный штаб)
        if(m.mode === 'tactics'){
          if(m.tacticsTool === 'eraser'){
            var wpEl = e.target.closest && e.target.closest('[data-wi-warpath-idx]');
            if(wpEl){
              var wpIdx = parseInt(wpEl.getAttribute('data-wi-warpath-idx'), 10);
              if(m.warPaths && m.warPaths[wpIdx]){
                m.warPaths.splice(wpIdx, 1);
                WI.saveTacticalState();
                WI.toast('🧹 Линия фронта / стрела удара стёрта', 'info');
                if(typeof render === 'function') render();
              }
              return;
            }
            WI.toast('🧹 Кликните по отряду или линии фронта, чтобы стереть их', 'info');
            return;
          }

          if(m.tacticsTool === 'march'){
            var marchU = (m.selectedUnitIdx != null && m.selectedUnitIdx >= 0 && m.tacticalUnits) ? m.tacticalUnits[m.selectedUnitIdx] : null;
            if(!marchU && m.tacticalUnits && m.tacticalUnits.length > 0){
              m.selectedUnitIdx = 0;
              marchU = m.tacticalUnits[0];
            }
            if(marchU){
              marchU.marchPath = Array.isArray(marchU.marchPath) ? marchU.marchPath : [];
              var nearCityM = findNearestCity(clickX, clickY, 65);
              marchU.marchPath.push({
                x: nearCityM ? nearCityM.x : clickX,
                y: nearCityM ? nearCityM.y : clickY
              });
              marchU.status = 'march';
              WI.saveTacticalState();
              WI.toast('🏃 Назначена точка марша #' + marchU.marchPath.length + ' для «' + (marchU.label || 'Отряда') + '» (Нажмите «▶️ Ход марша» для анимации!)', 'success');
              if(typeof render === 'function') render();
            } else {
              WI.toast('⚠️ Сначала выберите или разместите отряд на карте', 'info');
            }
            return;
          }

          if(m.tacticsTool === 'capture'){
            var terEl = e.target.closest && e.target.closest('.wi-territory');
            if(terEl){
              var tid = terEl.getAttribute('data-territory-id');
              var terObj = WI_TACTICAL_TERRITORIES_BASE.find(function(t){ return t.id === tid; });
              if(tid && terObj){
                m.territoryOwners = m.territoryOwners || {};
                var chosenFac = m.warNation || 'nilfgaard';
                if(chosenFac === 'independent' || chosenFac === terObj.defaultFaction){
                  delete m.territoryOwners[tid];
                  WI.saveTacticalState();
                  WI.toast('🕊️ «' + terObj.name + '»: восстановлен суверенитет', 'info');
                } else {
                  m.territoryOwners[tid] = chosenFac;
                  WI.saveTacticalState();
                  var fac = WI_TACTICAL_FACTIONS[chosenFac];
                  WI.toast('🏴 «' + terObj.name + '» под контролем: ' + (fac ? fac.name : chosenFac), 'success');
                }
                if(typeof render === 'function') render();
              }
            } else {
              WI.toast('💡 Кликните внутри границ любой страны на карте для смены контроля', 'info');
            }
            return;
          }

          if(m.tacticsTool === 'unit'){
            var facKey = m.warNation === 'independent' ? 'nilfgaard' : (m.warNation || 'nilfgaard');
            var facInfo = WI_TACTICAL_FACTIONS[facKey] || WI_TACTICAL_FACTIONS.nilfgaard;
            var uType = m.unitType || 'army';
            var uInfo = WI_TACTICAL_UNIT_TYPES[uType] || WI_TACTICAL_UNIT_TYPES.army;
            var nearLoc = findNearestCity(clickX, clickY, 85);
            var defaultLabel = uInfo.label + ' (' + (nearLoc ? nearLoc.name.split(' (')[0] : facInfo.name.split(' ')[0]) + ')';
            m.tacticalUnits = m.tacticalUnits || [];
            m.tacticalUnits.push({
              id: 'u_' + Date.now(),
              x: clickX,
              y: clickY,
              nation: facKey,
              type: uType,
              status: 'ready',
              strength: uInfo.defaultStr || '4 000 бойцов',
              hp: 100,
              label: defaultLabel
            });
            m.selectedUnitIdx = m.tacticalUnits.length - 1;
            WI.saveTacticalState();
            WI.toast('♟️ Размещено: ' + defaultLabel, 'success');
            if(typeof render === 'function') render();
            return;
          }

          // В режиме камеры (pan) клик по пину города выбирает его
          if(pinEl){
            var tLocId = pinEl.getAttribute('data-wi-loc-pin');
            var tLoc = WI_MAP_LOCATIONS.find(function(l){ return l.id === tLocId; });
            if(tLoc){
              WI.toast(tLoc.icon + ' ' + tLoc.name + ' — ' + tLoc.region, 'info');
            }
          }
          return;
        }

        // В режиме 'inspect' (Атлас) или 'board' (Доска объявлений) — клик выбирает ближайшую метку или распознаёт название любого леса/топи/гор
        if(m.mode === 'inspect' || m.mode === 'board'){
          if(e.target.closest && (e.target.closest('.wi-user-marker') || e.target.closest('.wi-char-sheet-card'))) return;

          var nearCity = findNearestCity(clickX, clickY, 44);
          if(nearCity){
            m.selectedLocId = nearCity.id;
            m.customWildLoc = null;
            m.activeContract = null;
            m.boardSelectedContractId = null;
            WI.toast((m.mode === 'board' ? '📜 Доска объявлений: ' : nearCity.icon + ' ') + nearCity.name + ' (' + nearCity.region + ')', 'info');
            if(typeof render === 'function') render();
          } else {
            var wildLoc = resolveWiWildernessLocation(clickX, clickY);
            m.customWildLoc = wildLoc;
            m.selectedLocId = wildLoc.id;
            m.activeContract = null;
            m.boardSelectedContractId = null;
            WI.toast((m.mode === 'board' ? '📜 Придорожный столб: ' : wildLoc.icon + ' ') + wildLoc.name + ' (' + wildLoc.region + ')', 'info');
            if(typeof render === 'function') render();
          }
          return;
        }

        // В режиме 'route' - свободное добавление путевой точки с распознаванием города
        if(m.mode === 'route'){
          if(e.target.closest && (e.target.closest('.wi-route-point') || e.target.closest('.wi-user-marker') || e.target.closest('.wi-char-sheet-card'))) return;

          m.routePoints = m.routePoints || [];
          var count = m.routePoints.length;
          var isFirst = count === 0;

          var nearCityR = findNearestCity(clickX, clickY, 75);
          var ptX = nearCityR ? nearCityR.x : clickX;
          var ptY = nearCityR ? nearCityR.y : clickY;
          var ptName = '';
          var ptStop = isFirst ? 'none' : 'camp';

          if(nearCityR){
            ptName = (isFirst ? 'Старт: ' : '') + nearCityR.name;
            ptStop = isFirst ? 'none' : 'inn';
          } else {
            var terR = getTerrainAt(clickX, clickY);
            ptName = isFirst ? ('Старт: ' + terR.name) : ('Точка ' + (count + 1) + ' (' + terR.name + ')');
          }

          m.routePoints.push({
            id: 'wp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: ptName,
            x: ptX,
            y: ptY,
            stopType: ptStop
          });
          WI.saveRoute();
          WI.toast('✓ ' + (nearCityR ? ('Город «' + nearCityR.name + '» добавлен в маршрут') : ('Добавлена точка #' + (count + 1))), 'success');
          if(typeof render === 'function') render();
          return;
        }

        // В режиме 'markers' - открытие встроенной формы создания метки в точке клика
        if(m.mode === 'markers'){
          if(e.target.closest && (e.target.closest('.wi-user-marker') || e.target.closest('.wi-char-sheet-card'))) return;

          m.editingMarkerId = null;
          m.placingMarkerCoords = { x: clickX, y: clickY };
          if(typeof render === 'function') render();
          var titleInp = document.getElementById('wiMarkerFormTitle');
          if(titleInp) titleInp.focus();
          return;
        }
      });

      // Сенсорное управление: перемещение, драг точек и пинч-зум
      var lastTouchDist = 0;
      var touchStartX = 0, touchStartY = 0;
      var isTouching = false;

      vport.addEventListener('touchstart', function(e){
        if(e.touches.length === 1){
          var touch = e.touches[0];
          var ptEl = (touch.target && touch.target.closest && touch.target.closest('.wi-route-point')) ||
            (document.elementFromPoint ? (function(){
              var el = document.elementFromPoint(touch.clientX, touch.clientY);
              return el && el.closest && el.closest('.wi-route-point');
            })() : null);

          if(ptEl){
            var ptId = ptEl.getAttribute('data-route-pt-id');
            var ptObj = (m.routePoints || []).find(function(p){ return p.id === ptId; });
            if(ptObj){
              isDraggingPoint = true;
              dragPtId = ptId;
              dragPtObj = ptObj;
              dragPtEl = ptEl;
              dragStartClientX = touch.clientX;
              dragStartClientY = touch.clientY;
              dragPtHasMoved = false;
              return;
            }
          }

          isTouching = true;
          hasDragged = false;
          touchStartX = touch.clientX;
          touchStartY = touch.clientY;
        } else if(e.touches.length === 2){
          isTouching = false;
          isDraggingPoint = false;
          lastTouchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      }, { passive: true });

      vport.addEventListener('touchmove', function(e){
        if(isDraggingPoint && dragPtObj && e.touches.length === 1){
          var t = e.touches[0];
          var dxPt = t.clientX - dragStartClientX;
          var dyPt = t.clientY - dragStartClientY;
          if(Math.hypot(dxPt, dyPt) > 5){
            dragPtHasMoved = true;
          }
          if(dragPtHasMoved){
            var tCoords = clientToSvgCoords(t.clientX, t.clientY);
            dragPtObj.x = tCoords.x;
            dragPtObj.y = tCoords.y;

            if(dragPtEl){
              dragPtEl.setAttribute('transform', 'translate(' + tCoords.x + ',' + tCoords.y + ')');
            }

            var rpts = m.routePoints || [];
            if(rpts.length >= 2){
              var pData = 'M ' + rpts[0].x + ' ' + rpts[0].y;
              for(var k = 1; k < rpts.length; k++){
                pData += ' L ' + rpts[k].x + ' ' + rpts[k].y;
              }
              var pathBg = vport.querySelector('.wi-route-path-bg');
              var pathFg = vport.querySelector('.wi-route-path-fg');
              if(pathBg){ pathBg.setAttribute('d', pData); pathBg.style.fill = 'none'; }
              if(pathFg){ pathFg.setAttribute('d', pData); pathFg.style.fill = 'none'; }
            }
          }
          return;
        }

        if(e.touches.length === 1 && isTouching){
          var dx = e.touches[0].clientX - touchStartX;
          var dy = e.touches[0].clientY - touchStartY;
          if(Math.hypot(dx, dy) > 4) hasDragged = true;
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;

          var vw = vport.clientWidth || 800;
          var z = Math.max(0.4, Math.min(5.0, m.zoom || 1.1));
          var baseW = 2400;
          var scale = (baseW / z) / vw;

          m.cx = Math.max(-200, Math.min(3080, (m.cx || 1440) - dx * scale));
          m.cy = Math.max(-200, Math.min(4296, (m.cy || 1200) - dy * scale));
          updateMapTransform();
        } else if(e.touches.length === 2){
          var dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          if(lastTouchDist > 0){
            var factor = dist / lastTouchDist;
            m.zoom = Math.max(0.4, Math.min(5.0, (m.zoom || 1.1) * factor));
            updateMapTransform();
          }
          lastTouchDist = dist;
        }
      }, { passive: true });

      vport.addEventListener('touchend', function(){
        if(isDraggingPoint){
          var handledPtId = dragPtId;
          var didMove = dragPtHasMoved;
          var pt = dragPtObj;

          isDraggingPoint = false;
          dragPtId = null;
          dragPtObj = null;
          dragPtEl = null;
          dragPtHasMoved = false;

          justHandledPointAction = true;
          setTimeout(function(){ justHandledPointAction = false; }, 250);

          if(didMove){
            if(pt){
              var nearCity = findNearestCity(pt.x, pt.y, 65);
              var isFirst = (m.routePoints && m.routePoints[0] && m.routePoints[0].id === pt.id);
              var idx = (m.routePoints || []).findIndex(function(p){ return p.id === pt.id; });
              if(nearCity){
                pt.name = (isFirst ? 'Старт: ' : '') + nearCity.name;
                pt.x = nearCity.x;
                pt.y = nearCity.y;
                if(!isFirst && pt.stopType === 'none') pt.stopType = 'inn';
              } else {
                var ter = getTerrainAt(pt.x, pt.y);
                pt.name = (isFirst ? 'Старт: ' : ('Точка ' + (idx + 1) + ' (')) + ter.name + (isFirst ? '' : ')');
              }
            }
            WI.saveRoute();
            WI.toast('✓ Точка перемещена', 'success');
            if(typeof render === 'function') render();
          } else {
            removeRoutePoint(handledPtId);
          }
          return;
        }

        isTouching = false;
        lastTouchDist = 0;
      }, { passive: true });
    }

    wireWiNav();
  }

  /* ============================================================
     AI ГЕНЕРАТОРЫ СПОСОБНОСТЕЙ И БОЕВЫХ ПРИЁМОВ
     ============================================================ */

  function renderWiTechCardPreview(t){
    var dmgStr = (t.dmgN ? (t.dmgN + t.dmgD + (t.dmgMod ? ('+' + t.dmgMod) : '')) : (t.dmgMod ? ('+' + t.dmgMod) : ''));
    return '<div class="wi-ref-card wi-tech-card" style="border-color:var(--wi-amber);box-shadow:0 0 16px rgba(245,158,11,0.2);">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
        '<div class="wi-ref-card-k" style="margin-bottom:0;font-size:16px;">' + (t.icon || '✨') + ' ' + esc(t.name) + '</div>' +
        '<span class="wi-ref-item-tag">' + esc(t.cat || 'Способность') + '</span>' +
      '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:12px;color:var(--wi-steel);margin-bottom:8px;">' +
        (t.cost ? '<span style="background:rgba(245,158,11,0.12);padding:2px 8px;border-radius:3px;color:#fbbf24;">⚡ ' + esc(t.cost) + '</span>' : '') +
        (t.req ? '<span style="background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:3px;">📜 ' + esc(t.req) + '</span>' : '') +
        (dmgStr ? '<span style="background:rgba(239,68,68,0.15);padding:2px 8px;border-radius:3px;color:#fca5a5;">💥 ' + esc(dmgStr) + '</span>' : '') +
      '</div>' +
      '<div class="wi-ref-card-v" style="font-size:13px;line-height:1.55;">' + esc(t.desc || '').replace(/\n/g, '<br>') + '</div>' +
    '</div>';
  }

  function renderWiMoveCardPreview(m){
    return '<div class="wi-ref-card wi-move-card" style="border-color:var(--wi-amber);box-shadow:0 0 16px rgba(245,158,11,0.2);">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
        '<div class="wi-ref-card-k" style="margin-bottom:0;font-size:16px;">' + (m.icon || '⚔️') + ' ' + esc(m.name) + '</div>' +
        '<span class="wi-ref-item-tag">' + esc(m.kind || 'Приём') + '</span>' +
      '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:12px;color:var(--wi-steel);margin-bottom:8px;">' +
        (m.action ? '<span style="background:rgba(245,158,11,0.12);padding:2px 8px;border-radius:3px;color:#fbbf24;">⚡ ' + esc(m.action) + '</span>' : '') +
        (m.trigger ? '<span style="background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:3px;">🎯 ' + esc(m.trigger) + '</span>' : '') +
      '</div>' +
      '<div class="wi-ref-card-v" style="font-size:13px;line-height:1.55;">' + esc(m.desc || '').replace(/\n/g, '<br>') + '</div>' +
    '</div>';
  }

  function callGeminiWiTechGenerator(opts, apiKey, callback){
    if(!apiKey){
      callback("API ключ не указан", null);
      return;
    }
    var prompt = "Ты Ведущий (Dungeon Master) настольной ролевой игры по вселенной Ведьмака (The Witcher / Анджей Сапковский / CD Projekt RED). " +
      "Сгенерируй атмосферную способность, ведьмачий знак, заклинание Хаоса, мутацию профессора Моро или расовый дар Континента. " +
      "Тема / Идея: " + (opts.theme || "Случайная способность вселенной Ведьмака") + ". " +
      "Категория: " + (opts.cat || "Знаки ведьмака / Магия Хаоса / Мутации / Воинские дары / Бардовские дары") + ". " +
      "Затраты: " + (opts.cost || "Выносливость / Мана / 1 раз за отдых / Пассивно") + ". " +
      "Требования: " + (opts.req || "Ведьмак / Чародей / Воин / Бард / Без ограничений") + ". " +
      "Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n" +
      "{\n" +
      '  "name": "Атмосферное название способности",\n' +
      '  "icon": "Один подходящий эмодзи (например ✨, 🔥, 💨, 🛡️, 💫, 🟣, ⚡, 🧬, 🪓, 🪕)",\n' +
      '  "cat": "Категория (строго одно из: Знаки ведьмака, Магия Хаоса, Мутации, Воинские дары, Бардовские дары, Общие)",\n' +
      '  "cost": "Затраты ресурса (например: 10 Выносливости, 20 Маны, 1 раз за отдых, Пассивно)",\n' +
      '  "req": "Требования (например: Ведьмак, Чародей, или пусто)",\n' +
      '  "dmgN": "Количество кубов урона (целое число, например 2. Если урона нет, то 0)",\n' +
      '  "dmgD": "Тип куба (строго одно из: d0, d4, d6, d8, d10, d12)",\n' +
      '  "dmgMod": "Бонус к урону (целое число, например 2, или 0)",\n' +
      '  "desc": "Художественное и механическое описание того, как действует способность (дистанция, эффект, спасбросок, последствия)."\n' +
      "}";

    var reqFn = window.requestGeminiGenerateContent;
    if(typeof reqFn !== 'function'){
      callback("Функция requestGeminiGenerateContent не найдена", null);
      return;
    }

    reqFn(prompt, apiKey, function(err, data){
      if(err || !data){
        callback(err ? (err.message || String(err)) : "Пустой ответ от AI", null);
        return;
      }
      try{
        var extractFn = window.extractJsonFromAi || function(d){ return JSON.parse(d); };
        var parsed = extractFn(data);
        callback(null, parsed);
      }catch(err2){
        callback("Ошибка разбора JSON: " + err2.message, null);
      }
    });
  }

  function callGeminiWiMoveGenerator(opts, apiKey, callback){
    if(!apiKey){
      callback("API ключ не указан", null);
      return;
    }
    var prompt = "Ты Ведущий (Dungeon Master) настольной ролевой игры по вселенной Ведьмака (The Witcher). " +
      "Придумай тактический боевой приём, стиль фехтования мечом (быстрый, силовой, круговой), маневр защиты (пируэт, вольт, рипост) или стрелковый трюк. " +
      "Тема / Идея: " + (opts.theme || "Случайный тактический приём фехтования") + ". " +
      "Категория (стиль): " + (opts.kind || "Фехтование / Защита и парирование / Тактические приёмы / Стрельба / Рукопашный бой") + ". " +
      "Тип действия: " + (opts.action || "Основное действие / Бонусное действие / Реакция / Свободное действие") + ". " +
      "Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n" +
      "{\n" +
      '  "name": "Название приёма (например: Пируэт с подсечкой, Рассекающий размах)",\n' +
      '  "icon": "Один подходящий эмодзи (например ⚔️, 🗡️, 🌪️, 🛡️, 🔄, ⚡, 🏹, 🦵, 🎯)",\n' +
      '  "kind": "Категория (строго одно из: Фехтование, Защита и парирование, Тактические приёмы, Стрельба, Рукопашный бой)",\n' +
      '  "action": "Тип действия (Основное действие, Бонусное действие, Реакция, Свободное действие)",\n' +
      '  "trigger": "Триггер / Условие применения (например: При парировании удара, В ближнем бою, При окружении)",\n' +
      '  "desc": "Подробное фехтовальное описание движений бойца и точный механический эффект в бою."\n' +
      "}";

    var reqFn = window.requestGeminiGenerateContent;
    if(typeof reqFn !== 'function'){
      callback("Функция requestGeminiGenerateContent не найдена", null);
      return;
    }

    reqFn(prompt, apiKey, function(err, data){
      if(err || !data){
        callback(err ? (err.message || String(err)) : "Пустой ответ от AI", null);
        return;
      }
      try{
        var extractFn = window.extractJsonFromAi || function(d){ return JSON.parse(d); };
        var parsed = extractFn(data);
        callback(null, parsed);
      }catch(err2){
        callback("Ошибка разбора JSON: " + err2.message, null);
      }
    });
  }

  /* Экран AI Генератора способностей (wiTechGen) */
  function wiTechGen(){
    var key = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
    return crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Способности', nav: 'wiTechs' }, { label: 'AI Генератор' }]) +
      '<button class="back" data-nav="wiTechs" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechs\');">← Назад к способностям</button>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">' +
        '<div>' +
          '<h1 style="margin-bottom:4px;">✨ AI Генератор способностей и магии</h1>' +
          '<div class="desc" style="margin-bottom:0;">Генерация каноничных знаков, магии Хаоса, мутаций и расовых даров через Google Gemini AI.</div>' +
        '</div>' +
      '</div>' +
      '<div class="wi-char-sheet-card" id="wiTgFormSection" style="margin-top:14px;">' +
        '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wi-border);border-radius:4px;padding:10px 14px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">' +
          '<div style="font-size:12.5px;color:var(--wi-steel);display:flex;align-items:center;gap:6px;">' +
            '<span>🔑 Gemini API:</span> ' + (key ? '<span style="color:#4ade80;font-weight:600;">✓ Подключен (' + esc(key.slice(0,6)) + '...' + esc(key.slice(-4)) + ')</span>' : '<span style="color:#f87171;font-weight:600;">Не указан</span>') +
          '</div>' +
          '<button type="button" class="btn btn-ghost" id="wiTgChangeKeyBtn" style="padding:4px 10px;font-size:11.5px;">' + (key ? 'Изменить ключ' : 'Указать ключ') + '</button>' +
        '</div>' +
        '<div class="wi-edit-grid">' +
          '<div class="wi-edit-item" style="grid-column:1/-1;">' +
            '<label>Идея / Описание способности (или оставьте пустым для случайной):</label>' +
            '<textarea id="wiTgTheme" class="wi-input" rows="3" placeholder="Например: Знак кинетического отталкивания, Огненная буря Хаоса, Мутация звериного чутья, Ледяная стена..."></textarea>' +
          '</div>' +
          '<div class="wi-edit-item">' +
            '<label>Категория</label>' +
            '<select id="wiTgCat" class="wi-input">' +
              '<option value="">Авто (на выбор AI)</option>' +
              '<option value="Знаки ведьмака">Знаки ведьмака</option>' +
              '<option value="Магия Хаоса">Магия Хаоса</option>' +
              '<option value="Мутации">Мутации</option>' +
              '<option value="Воинские дары">Воинские дары</option>' +
              '<option value="Бардовские дары">Бардовские дары</option>' +
              '<option value="Общие">Общие</option>' +
            '</select>' +
          '</div>' +
          '<div class="wi-edit-item">' +
            '<label>Затраты ресурса</label>' +
            '<select id="wiTgCost" class="wi-input">' +
              '<option value="">Авто (на выбор AI)</option>' +
              '<option value="10 Выносливости">10 Выносливости (Знак)</option>' +
              '<option value="15 Выносливости">15 Выносливости (Сложный знак)</option>' +
              '<option value="20 Маны / 2 ячейка">20 Маны / 2 ячейка</option>' +
              '<option value="30 Маны / 3 ячейка">30 Маны / 3 ячейка</option>' +
              '<option value="1 раз за отдых">1 раз за отдых</option>' +
              '<option value="Пассивно">Пассивно</option>' +
            '</select>' +
          '</div>' +
          '<div class="wi-edit-item" style="grid-column:1/-1;">' +
            '<label>Требования (класс, раса, статус)</label>' +
            '<input type="text" id="wiTgReq" class="wi-input" placeholder="Авто (например: Ведьмак, Чародей, Краснолюд, или пусто)">' +
          '</div>' +
        '</div>' +
        '<div style="margin-top:16px;">' +
          '<button class="btn btn-primary" id="btnWiTechGen" style="width:100%;padding:12px;font-size:14px;">✨ Сгенерировать способность через AI</button>' +
        '</div>' +
      '</div>' +
      '<div id="wiTgResult" style="display:none;margin-top:16px;">' +
        '<div id="wiTgPreview" style="margin-bottom:16px;"></div>' +
        '<div style="display:flex;flex-direction:column;gap:10px;">' +
          '<button class="btn btn-primary" id="btnWiTechSave" style="width:100%;padding:12px;font-size:14px;">💾 Сохранить в Мои Способности</button>' +
          '<div style="display:flex;gap:10px;">' +
            '<button class="btn btn-ghost" id="btnWiTechRegen" style="flex:1;">🔄 Сгенерировать ещё раз</button>' +
            '<button class="btn btn-ghost" id="btnWiTechBack" style="flex:1;">✏️ Изменить параметры</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="wiTgHistoryWrap" style="margin-top:24px;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;display:none;">' +
        '<div class="section-label" style="font-size:12px;letter-spacing:0.1em;color:var(--wi-amber);font-weight:700;margin-bottom:10px;font-family:\'JetBrains Mono\',monospace;">📜 ИСТОРИЯ ГЕНЕРАЦИЙ (ЛОКАЛЬНО)</div>' +
        '<div id="wiTgHistoryList" style="display:flex;flex-direction:column;gap:8px;"></div>' +
      '</div>';
  }

  /* Экран AI Генератора приёмов (wiMoveGen) */
  function wiMoveGen(){
    var key = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
    return crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Приёмы', nav: 'wiMoves' }, { label: 'AI Генератор' }]) +
      '<button class="back" data-nav="wiMoves" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoves\');">← Назад к приёмам</button>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">' +
        '<div>' +
          '<h1 style="margin-bottom:4px;">⚔️ AI Генератор боевых приёмов</h1>' +
          '<div class="desc" style="margin-bottom:0;">Создание тактических стилей фехтования, защитных рипостов, маневров и приёмов стрельбы.</div>' +
        '</div>' +
      '</div>' +
      '<div class="wi-char-sheet-card" id="wiMgFormSection" style="margin-top:14px;">' +
        '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wi-border);border-radius:4px;padding:10px 14px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">' +
          '<div style="font-size:12.5px;color:var(--wi-steel);display:flex;align-items:center;gap:6px;">' +
            '<span>🔑 Gemini API:</span> ' + (key ? '<span style="color:#4ade80;font-weight:600;">✓ Подключен (' + esc(key.slice(0,6)) + '...' + esc(key.slice(-4)) + ')</span>' : '<span style="color:#f87171;font-weight:600;">Не указан</span>') +
          '</div>' +
          '<button type="button" class="btn btn-ghost" id="wiMgChangeKeyBtn" style="padding:4px 10px;font-size:11.5px;">' + (key ? 'Изменить ключ' : 'Указать ключ') + '</button>' +
        '</div>' +
        '<div class="wi-edit-grid">' +
          '<div class="wi-edit-item" style="grid-column:1/-1;">' +
            '<label>Идея / Название приёма (или оставьте пустым для случайного):</label>' +
            '<textarea id="wiMgTheme" class="wi-input" rows="3" placeholder="Например: Тяжелый разруб лат сверху, Пируэт с выпадом под ребра, Парирование клинком и подсечка, Отбивание арбалетного болта..."></textarea>' +
          '</div>' +
          '<div class="wi-edit-item">' +
            '<label>Категория / Стиль</label>' +
            '<select id="wiMgKind" class="wi-input">' +
              '<option value="">Авто (на выбор AI)</option>' +
              '<option value="Фехтование">Фехтование</option>' +
              '<option value="Защита и парирование">Защита и парирование</option>' +
              '<option value="Тактические приёмы">Тактические приёмы</option>' +
              '<option value="Стрельба">Стрельба</option>' +
              '<option value="Рукопашный бой">Рукопашный бой</option>' +
            '</select>' +
          '</div>' +
          '<div class="wi-edit-item">' +
            '<label>Тип действия</label>' +
            '<select id="wiMgAction" class="wi-input">' +
              '<option value="">Авто (на выбор AI)</option>' +
              '<option value="Основное действие">Основное действие</option>' +
              '<option value="Бонусное действие">Бонусное действие</option>' +
              '<option value="Реакция">Реакция</option>' +
              '<option value="Свободное действие">Свободное действие</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div style="margin-top:16px;">' +
          '<button class="btn btn-primary" id="btnWiMoveGen" style="width:100%;padding:12px;font-size:14px;">⚔️ Сгенерировать боевой приём через AI</button>' +
        '</div>' +
      '</div>' +
      '<div id="wiMgResult" style="display:none;margin-top:16px;">' +
        '<div id="wiMgPreview" style="margin-bottom:16px;"></div>' +
        '<div style="display:flex;flex-direction:column;gap:10px;">' +
          '<button class="btn btn-primary" id="btnWiMoveSave" style="width:100%;padding:12px;font-size:14px;">💾 Сохранить этот приём</button>' +
          '<div style="display:flex;gap:10px;">' +
            '<button class="btn btn-ghost" id="btnWiMoveRegen" style="flex:1;">🔄 Сгенерировать ещё раз</button>' +
            '<button class="btn btn-ghost" id="btnWiMoveBack" style="flex:1;">✏️ Изменить параметры</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="wiMgHistoryWrap" style="margin-top:24px;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;display:none;">' +
        '<div class="section-label" style="font-size:12px;letter-spacing:0.1em;color:var(--wi-amber);font-weight:700;margin-bottom:10px;font-family:\'JetBrains Mono\',monospace;">📜 ИСТОРИЯ ГЕНЕРАЦИЙ (ЛОКАЛЬНО)</div>' +
        '<div id="wiMgHistoryList" style="display:flex;flex-direction:column;gap:8px;"></div>' +
      '</div>';
  }

  function wireWiTechGen(){
    function renderTechHist(){
      var wrap = document.getElementById('wiTgHistoryWrap');
      var list = document.getElementById('wiTgHistoryList');
      if(!wrap || !list) return;
      try {
        var h = JSON.parse(localStorage.getItem('wi_ai_hist_techs') || '[]');
        if(h.length === 0){ wrap.style.display = 'none'; return; }
        wrap.style.display = 'block';
        list.innerHTML = h.map(function(item, i){
          return '<div class="wi-ref-card" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;padding:10px 14px;" onclick="window._loadWiTechHist(' + i + ')">' +
            '<div style="flex:1;min-width:0;">' +
              '<div style="font-size:14px;font-weight:700;color:#fbbf24;font-family:\'Cinzel\',serif;">' +
                (item.icon || '✨') + ' ' + esc(item.name || 'Безымянная способность') +
              '</div>' +
              '<div style="font-size:11.5px;color:var(--wi-steel);font-family:\'JetBrains Mono\',monospace;">' +
                esc(item.cat || 'Способность') + (item.cost ? (' · ' + esc(item.cost)) : '') +
              '</div>' +
            '</div>' +
            '<button class="btn btn-ghost" style="padding:4px 8px;color:#ef4444;font-size:12px;" onclick="event.stopPropagation(); window._delWiTechHist(' + i + ')" title="Удалить из истории">🗑️</button>' +
          '</div>';
        }).join('');
      } catch(e){}
    }

    window._loadWiTechHist = function(i){
      try {
        var h = JSON.parse(localStorage.getItem('wi_ai_hist_techs') || '[]');
        var item = h[i];
        if(!item) return;
        window._lastGenWiTech = item;
        var form = document.getElementById('wiTgFormSection');
        var resDiv = document.getElementById('wiTgResult');
        var preview = document.getElementById('wiTgPreview');
        if(form) form.style.display = 'none';
        if(resDiv) resDiv.style.display = 'block';
        if(preview) preview.innerHTML = renderWiTechCardPreview(item);
        window.scrollTo(0, 0);
      } catch(e){}
    };

    window._delWiTechHist = function(i){
      try {
        var h = JSON.parse(localStorage.getItem('wi_ai_hist_techs') || '[]');
        h.splice(i, 1);
        localStorage.setItem('wi_ai_hist_techs', JSON.stringify(h));
        renderTechHist();
      } catch(e){}
    };

    renderTechHist();

    var keyBtn = document.getElementById('wiTgChangeKeyBtn');
    if(keyBtn){
      keyBtn.addEventListener('click', function(){
        var curKey = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
        var input = prompt('Введите ваш Google Gemini API ключ:', curKey || '');
        if(input !== null && typeof window.saveGeminiApiKey === 'function'){
          window.saveGeminiApiKey(input.trim());
          if(typeof render === 'function') render();
        }
      });
    }

    var btnGen = document.getElementById('btnWiTechGen');
    if(btnGen){
      btnGen.addEventListener('click', function(){
        var k = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
        if(!k){
          var input = prompt('Введите Google Gemini API ключ для генерации:');
          if(input && input.trim()){
            k = input.trim();
            if(typeof window.saveGeminiApiKey === 'function') window.saveGeminiApiKey(k);
          } else {
            return;
          }
        }

        var theme = (document.getElementById('wiTgTheme').value || '').trim();
        var cat = document.getElementById('wiTgCat').value;
        var cost = document.getElementById('wiTgCost').value;
        var req = (document.getElementById('wiTgReq').value || '').trim();

        btnGen.disabled = true;
        btnGen.textContent = 'Генерация способности (ждите)...';

        callGeminiWiTechGenerator({ theme: theme, cat: cat, cost: cost, req: req }, k, function(err, result){
          btnGen.disabled = false;
          btnGen.textContent = '✨ Сгенерировать способность через AI';

          if(err || !result){
            alert('Ошибка генерации: ' + (err || 'Пустой ответ от AI'));
            return;
          }

          window._lastGenWiTech = result;

          try {
            var h = JSON.parse(localStorage.getItem('wi_ai_hist_techs') || '[]');
            h.unshift(result);
            if(h.length > 20) h.length = 20;
            localStorage.setItem('wi_ai_hist_techs', JSON.stringify(h));
          } catch(e){}

          var form = document.getElementById('wiTgFormSection');
          var resDiv = document.getElementById('wiTgResult');
          var preview = document.getElementById('wiTgPreview');

          if(form) form.style.display = 'none';
          if(resDiv) resDiv.style.display = 'block';
          if(preview) preview.innerHTML = renderWiTechCardPreview(result);

          renderTechHist();
          if(resDiv) resDiv.scrollIntoView({ behavior: 'smooth' });
        });
      });
    }

    var btnBack = document.getElementById('btnWiTechBack');
    if(btnBack){
      btnBack.addEventListener('click', function(){
        var form = document.getElementById('wiTgFormSection');
        var resDiv = document.getElementById('wiTgResult');
        if(resDiv) resDiv.style.display = 'none';
        if(form) form.style.display = 'block';
      });
    }

    var btnRegen = document.getElementById('btnWiTechRegen');
    if(btnRegen){
      btnRegen.addEventListener('click', function(){
        var btnG = document.getElementById('btnWiTechGen');
        var form = document.getElementById('wiTgFormSection');
        var resDiv = document.getElementById('wiTgResult');
        if(resDiv) resDiv.style.display = 'none';
        if(form) form.style.display = 'block';
        if(btnG) btnG.click();
      });
    }

    var btnSave = document.getElementById('btnWiTechSave');
    if(btnSave){
      btnSave.addEventListener('click', function(){
        var t = window._lastGenWiTech;
        if(!t) return;
        var item = {
          id: 'wi_tech_' + Date.now(),
          name: t.name || 'Безымянная способность',
          icon: t.icon || '✨',
          cat: t.cat || 'Знаки ведьмака',
          cost: t.cost || '',
          req: t.req || '',
          dmgN: parseInt(t.dmgN, 10) || 0,
          dmgD: t.dmgD || 'd6',
          dmgMod: parseInt(t.dmgMod, 10) || 0,
          desc: t.desc || ''
        };

        WI.loadTechs();
        if(!WI.techs) WI.techs = [];
        WI.techs.unshift(item);
        WI.saveTechs();
        WI.toast('✓ Способность сохранена в профиль!', 'success');
        if(typeof window.navigate === 'function') window.navigate('wiTechView:' + item.id);
      });
    }

    wireWiNav();
  }

  function wireWiMoveGen(){
    function renderMoveHist(){
      var wrap = document.getElementById('wiMgHistoryWrap');
      var list = document.getElementById('wiMgHistoryList');
      if(!wrap || !list) return;
      try {
        var h = JSON.parse(localStorage.getItem('wi_ai_hist_moves') || '[]');
        if(h.length === 0){ wrap.style.display = 'none'; return; }
        wrap.style.display = 'block';
        list.innerHTML = h.map(function(item, i){
          return '<div class="wi-ref-card" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;padding:10px 14px;" onclick="window._loadWiMoveHist(' + i + ')">' +
            '<div style="flex:1;min-width:0;">' +
              '<div style="font-size:14px;font-weight:700;color:#fbbf24;font-family:\'Cinzel\',serif;">' +
                (item.icon || '⚔️') + ' ' + esc(item.name || 'Безымянный приём') +
              '</div>' +
              '<div style="font-size:11.5px;color:var(--wi-steel);font-family:\'JetBrains Mono\',monospace;">' +
                esc(item.kind || 'Приём') + (item.action ? (' · ' + esc(item.action)) : '') +
              '</div>' +
            '</div>' +
            '<button class="btn btn-ghost" style="padding:4px 8px;color:#ef4444;font-size:12px;" onclick="event.stopPropagation(); window._delWiMoveHist(' + i + ')" title="Удалить из истории">🗑️</button>' +
          '</div>';
        }).join('');
      } catch(e){}
    }

    window._loadWiMoveHist = function(i){
      try {
        var h = JSON.parse(localStorage.getItem('wi_ai_hist_moves') || '[]');
        var item = h[i];
        if(!item) return;
        window._lastGenWiMove = item;
        var form = document.getElementById('wiMgFormSection');
        var resDiv = document.getElementById('wiMgResult');
        var preview = document.getElementById('wiMgPreview');
        if(form) form.style.display = 'none';
        if(resDiv) resDiv.style.display = 'block';
        if(preview) preview.innerHTML = renderWiMoveCardPreview(item);
        window.scrollTo(0, 0);
      } catch(e){}
    };

    window._delWiMoveHist = function(i){
      try {
        var h = JSON.parse(localStorage.getItem('wi_ai_hist_moves') || '[]');
        h.splice(i, 1);
        localStorage.setItem('wi_ai_hist_moves', JSON.stringify(h));
        renderMoveHist();
      } catch(e){}
    };

    renderMoveHist();

    var keyBtn = document.getElementById('wiMgChangeKeyBtn');
    if(keyBtn){
      keyBtn.addEventListener('click', function(){
        var curKey = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
        var input = prompt('Введите ваш Google Gemini API ключ:', curKey || '');
        if(input !== null && typeof window.saveGeminiApiKey === 'function'){
          window.saveGeminiApiKey(input.trim());
          if(typeof render === 'function') render();
        }
      });
    }

    var btnGen = document.getElementById('btnWiMoveGen');
    if(btnGen){
      btnGen.addEventListener('click', function(){
        var k = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
        if(!k){
          var input = prompt('Введите Google Gemini API ключ для генерации:');
          if(input && input.trim()){
            k = input.trim();
            if(typeof window.saveGeminiApiKey === 'function') window.saveGeminiApiKey(k);
          } else {
            return;
          }
        }

        var theme = (document.getElementById('wiMgTheme').value || '').trim();
        var kind = document.getElementById('wiMgKind').value;
        var action = document.getElementById('wiMgAction').value;

        btnGen.disabled = true;
        btnGen.textContent = 'Генерация приёма (ждите)...';

        callGeminiWiMoveGenerator({ theme: theme, kind: kind, action: action }, k, function(err, result){
          btnGen.disabled = false;
          btnGen.textContent = '⚔️ Сгенерировать боевой приём через AI';

          if(err || !result){
            alert('Ошибка генерации: ' + (err || 'Пустой ответ от AI'));
            return;
          }

          window._lastGenWiMove = result;

          try {
            var h = JSON.parse(localStorage.getItem('wi_ai_hist_moves') || '[]');
            h.unshift(result);
            if(h.length > 20) h.length = 20;
            localStorage.setItem('wi_ai_hist_moves', JSON.stringify(h));
          } catch(e){}

          var form = document.getElementById('wiMgFormSection');
          var resDiv = document.getElementById('wiMgResult');
          var preview = document.getElementById('wiMgPreview');

          if(form) form.style.display = 'none';
          if(resDiv) resDiv.style.display = 'block';
          if(preview) preview.innerHTML = renderWiMoveCardPreview(result);

          renderMoveHist();
          if(resDiv) resDiv.scrollIntoView({ behavior: 'smooth' });
        });
      });
    }

    var btnBack = document.getElementById('btnWiMoveBack');
    if(btnBack){
      btnBack.addEventListener('click', function(){
        var form = document.getElementById('wiMgFormSection');
        var resDiv = document.getElementById('wiMgResult');
        if(resDiv) resDiv.style.display = 'none';
        if(form) form.style.display = 'block';
      });
    }

    var btnRegen = document.getElementById('btnWiMoveRegen');
    if(btnRegen){
      btnRegen.addEventListener('click', function(){
        var btnG = document.getElementById('btnWiMoveGen');
        var form = document.getElementById('wiMgFormSection');
        var resDiv = document.getElementById('wiMgResult');
        if(resDiv) resDiv.style.display = 'none';
        if(form) form.style.display = 'block';
        if(btnG) btnG.click();
      });
    }

    var btnSave = document.getElementById('btnWiMoveSave');
    if(btnSave){
      btnSave.addEventListener('click', function(){
        var m = window._lastGenWiMove;
        if(!m) return;
        var item = {
          id: 'wi_move_' + Date.now(),
          name: m.name || 'Безымянный приём',
          icon: m.icon || '⚔️',
          kind: m.kind || 'Фехтование',
          action: m.action || 'Основное действие',
          trigger: m.trigger || '',
          desc: m.desc || ''
        };

        WI.loadMoves();
        if(!WI.moves) WI.moves = [];
        WI.moves.unshift(item);
        WI.saveMoves();
        WI.toast('✓ Боевой приём сохранен в профиль!', 'success');
        if(typeof window.navigate === 'function') window.navigate('wiMoveView:' + item.id);
      });
    }

    wireWiNav();
  }

  function wireWiHome(){
    wireWiNav();
  }

  window.wiHome = wiHome;
  window.wiData = wiData;
  window.wiRef = wiRef;
  window.wiRefView = wiRefView;
  window.wiTechs = wiTechs;
  window.wiTechView = wiTechView;
  window.wiTechEdit = wiTechEdit;
  window.wiTechGen = wiTechGen;
  window.wiMoves = wiMoves;
  window.wiMoveView = wiMoveView;
  window.wiMoveEdit = wiMoveEdit;
  window.wiMoveGen = wiMoveGen;
  window.wiMap = wiMap;
  window.wiGames = wiGames;
  window.wireWiHome = wireWiHome;
  window.wireWiNav = wireWiNav;
  window.wireWiGames = wireWiGames;
  window.wireWiData = wireWiData;
  window.wireWiRef = wireWiRef;
  window.wireWiRefView = wireWiRefView;
  window.wireWiTechs = wireWiTechs;
  window.wireWiTechView = wireWiTechView;
  window.wireWiTechEdit = wireWiTechEdit;
  window.wireWiTechGen = wireWiTechGen;
  window.wireWiMoves = wireWiMoves;
  window.wireWiMoveView = wireWiMoveView;
  window.wireWiMoveEdit = wireWiMoveEdit;
  window.wireWiMoveGen = wireWiMoveGen;
  window.wireWiMap = wireWiMap;
  window.callGeminiWiTechGenerator = callGeminiWiTechGenerator;
  window.callGeminiWiMoveGenerator = callGeminiWiMoveGenerator;
  window.WI_REF = WI_REF;
  window.WI_REF_SECTIONS = WI_REF_SECTIONS;
  window.DEFAULT_WI_TECHS = DEFAULT_WI_TECHS;
  window.DEFAULT_WI_MOVES = DEFAULT_WI_MOVES;
  window.WI_MAP_LOCATIONS = WI_MAP_LOCATIONS;
  window.WI_MAP_REGIONS = WI_MAP_REGIONS;
  window.WI_MAP_PRESETS = WI_MAP_PRESETS;
  window.WI_MAP_ENCOUNTERS = WI_MAP_ENCOUNTERS;

  WI.wiHome = wiHome;
  WI.wiData = wiData;
  WI.wiRef = wiRef;
  WI.wiRefView = wiRefView;
  WI.wiTechs = wiTechs;
  WI.wiTechView = wiTechView;
  WI.wiTechEdit = wiTechEdit;
  WI.wiTechGen = wiTechGen;
  WI.wiMoves = wiMoves;
  WI.wiMoveView = wiMoveView;
  WI.wiMoveEdit = wiMoveEdit;
  WI.wiMoveGen = wiMoveGen;
  WI.wiMap = wiMap;
  WI.wiGames = wiGames;
  WI.wireWiHome = wireWiHome;
  WI.wireWiNav = wireWiNav;
  WI.wireWiGames = wireWiGames;
  WI.wireWiData = wireWiData;
  WI.wireWiRef = wireWiRef;
  WI.wireWiRefView = wireWiRefView;
  WI.wireWiTechs = wireWiTechs;
  WI.wireWiTechView = wireWiTechView;
  WI.wireWiTechEdit = wireWiTechEdit;
  WI.wireWiTechGen = wireWiTechGen;
  WI.wireWiMoves = wireWiMoves;
  WI.wireWiMoveView = wireWiMoveView;
  WI.wireWiMoveEdit = wireWiMoveEdit;
  WI.wireWiMoveGen = wireWiMoveGen;
  WI.wireWiMap = wireWiMap;
  WI.callGeminiWiTechGenerator = callGeminiWiTechGenerator;
  WI.callGeminiWiMoveGenerator = callGeminiWiMoveGenerator;
  WI.WI_REF = WI_REF;
  WI.WI_REF_SECTIONS = WI_REF_SECTIONS;
  window.applyWitcherTheme = WI.applyWitcherTheme;

})();
