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

    getTheme: function(){
      try {
        var t = localStorage.getItem(WI_THEME_KEY);
        if(t === 'hunt' || t === 'wolf') return t;
      } catch(e){}
      var m = WI.meta;
      if(m && (m.theme === 'hunt' || m.theme === 'wolf')) return m.theme;
      return 'wolf';
    },

    setTheme: function(themeName){
      var t = (themeName === 'hunt') ? 'hunt' : 'wolf';
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
        '<img src="symbols/Witcher/wolf_medallion.png?v=152" alt="" draggable="false" style="width:100%;height:100%;object-fit:contain;display:block;" />' +
      '</div>';
    },

    buildWildHuntEmblemSvg: function(){
      return '<div class="wi-bg-medallion wi-bg-medallion-hunt" aria-hidden="true">' +
        '<img src="symbols/Witcher/wild_hunt_crest.png?v=152" alt="" draggable="false" style="width:100%;height:100%;object-fit:contain;display:block;" />' +
      '</div>';
    },

    buildThemeFx: function(cont){
      if(!cont) return;
      cont.innerHTML = '';
      var theme = WI.getTheme();
      cont.setAttribute('data-wi-theme', theme);

      // 1. Медальон Волка или Корона Дикой Охоты
      var medallionWrap = document.createElement('div');
      medallionWrap.innerHTML = (theme === 'hunt') ? WI.buildWildHuntEmblemSvg() : WI.buildWolfMedallionSvg();
      cont.appendChild(medallionWrap.firstChild);

      // 2. Фоновые парящие знаки Ведьмаков (8 шт, в разные стороны с неоновым свечением)
      var signContainer = document.createElement('div');
      signContainer.className = 'wi-bg-signs';

      var particleDefs = [
        { type: 'aard', file: 'symbols/Witcher/Aard.png', top: 72, left: 12, dir: 'up-right', dur: 22, delay: -6 },
        { type: 'igni', file: 'symbols/Witcher/Igni.png', top: 18, left: 82, dir: 'down-left', dur: 24, delay: -14 },
        { type: 'quen', file: 'symbols/Witcher/Quen.png', top: 76, left: 78, dir: 'up-left', dur: 21, delay: -8 },
        { type: 'axii', file: 'symbols/Witcher/Axii.png', top: 22, left: 16, dir: 'down-right', dur: 25, delay: -17 },
        { type: 'aard', file: 'symbols/Witcher/Aard.png', top: 46, left: 74, dir: 'wave', dur: 23, delay: -11 },
        { type: 'igni', file: 'symbols/Witcher/Igni.png', top: 68, left: 32, dir: 'cross', dur: 22, delay: -19 },
        { type: 'quen', file: 'symbols/Witcher/Quen.png', top: 16, left: 46, dir: 'down-right', dur: 24, delay: -5 },
        { type: 'axii', file: 'symbols/Witcher/Axii.png', top: 80, left: 52, dir: 'up-left', dur: 23, delay: -13 }
      ];

      for (var s = 0; s < particleDefs.length; s++) {
        var p = particleDefs[s];
        var img = document.createElement('img');
        img.className = 'wi-sign-particle wi-sign-' + p.type + ' wi-dir-' + p.dir;
        img.src = p.file;
        img.alt = p.type;
        img.draggable = false;

        var size = (s % 2 === 0) ? 26 : 24;
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

      // 4. Парящие искры (Игни) или кристаллы льда Белого Хлада (Дикая Охота)
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
      if(cont.children.length === 0 || !cont.querySelector('.wi-bg-signs img') || cont.getAttribute('data-wi-theme') !== curTheme){
        WI.buildThemeFx(cont);
      }
      cont.style.display = 'block';
    },

    applyWitcherTheme: function(){
      if(typeof document === 'undefined' || !document.body) return;
      var fx = document.getElementById('wiThemeFx');
      if(typeof HB === 'undefined' || HB.mode !== 'wi'){
        document.body.classList.remove('wi-theme', 'wi-theme-hunt');
        if(fx) fx.style.display = 'none';
        return;
      }
      var curTheme = WI.getTheme();
      document.body.classList.add('wi-theme');
      document.body.classList.toggle('wi-theme-hunt', curTheme === 'hunt');
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

    return crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Данные' }]) +
      '<button class="back" data-nav="wiHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiHome\');">← Назад</button>' +
      '<h1>Данные и Ростер Персонажей</h1>' +

      '<div class="sheet-section wi-data-section">' +
        '<div class="section-label" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
          '<span>🎨 Визуальная Тема Раздела («Ведьмак»)</span>' +
          '<span style="font-size:12px;color:var(--wi-amber, #f59e0b);font-weight:700;">' + (curTheme === 'hunt' ? '❄️ Дикая Охота и Белый Хлад' : '🐺 Школа Волка и Пламя Игни') + '</span>' +
        '</div>' +
        '<div class="desc">' +
          'Выберите атмосферное оформление всего раздела «Ведьмак». Изменяет цветовую палитру интерфейса, свечение карточек, фоновую геральдическую эмблему и частицы окружения.' +
        '</div>' +
        '<div style="margin:12px 0 14px 0;max-width:460px;">' +
          '<label style="display:block;font-size:12px;color:var(--wi-steel, #94a3b8);margin-bottom:6px;font-weight:600;">Выбор темы оформления:</label>' +
          '<select id="wiThemeSelect" class="wi-hud-profile-sel" style="width:100%;font-size:14px;padding:9px 12px;border-radius:4px;">' +
            '<option value="wolf"' + (curTheme === 'wolf' ? ' selected' : '') + '>🐺 Школа Волка — Каэр Морхен и Пламя Игни (Янтарь, кованая сталь и угли)</option>' +
            '<option value="hunt"' + (curTheme === 'hunt' ? ' selected' : '') + '>❄️ Дикая Охота — Белый Хлад и Нагльфар (Ледяной циан, сталь Морхунга и иней)</option>' +
          '</select>' +
        '</div>' +
        '<div class="wi-theme-picker-grid">' +
          '<div class="wi-theme-option-card wi-theme-card-wolf' + (curTheme === 'wolf' ? ' active' : '') + '" data-wi-theme-pick="wolf">' +
            '<div class="wi-theme-card-top">' +
              '<span class="wi-theme-card-icon"><img src="symbols/Witcher/wolf_medallion.png?v=152" alt="Волк" style="width:42px;height:42px;object-fit:contain;filter:drop-shadow(0 0 8px rgba(245,158,11,0.45));" /></span>' +
              '<span class="wi-theme-card-badge">' + (curTheme === 'wolf' ? '✓ Активна' : 'Выбрать') + '</span>' +
            '</div>' +
            '<div class="wi-theme-card-title">Школа Волка и Пламя Игни</div>' +
            '<div class="wi-theme-card-sub">Классическая атмосфера крепости Каэр Морхен: тёмный обсидиан, кованое серебро, пылающий янтарь знака Игни, медальон Волка и летящие искры костра.</div>' +
          '</div>' +
          '<div class="wi-theme-option-card wi-theme-card-hunt' + (curTheme === 'hunt' ? ' active' : '') + '" data-wi-theme-pick="hunt">' +
            '<div class="wi-theme-card-top">' +
              '<span class="wi-theme-card-icon"><img src="symbols/Witcher/wild_hunt_crest.png?v=152" alt="Дикая Охота" style="width:42px;height:42px;object-fit:contain;filter:drop-shadow(0 0 8px rgba(56,189,248,0.55));" /></span>' +
              '<span class="wi-theme-card-badge">' + (curTheme === 'hunt' ? '✓ Активна' : 'Выбрать') + '</span>' +
            '</div>' +
            '<div class="wi-theme-card-title">Дикая Охота и Белый Хлад</div>' +
            '<div class="wi-theme-card-sub">Призрачная кавалькада Эредина (Dearg Ruadhri): ледяная полночь Спирали, морозный циан, астральный индиго Старшей Крови, корона-череп Морхунга и кристаллы инея.</div>' +
          '</div>' +
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
    var themeSel = g('wiThemeSelect');
    if(themeSel){
      themeSel.addEventListener('change', function(){
        var chosen = this.value === 'hunt' ? 'hunt' : 'wolf';
        WI.setTheme(chosen);
        if(typeof render === 'function') render();
        WI.toast(chosen === 'hunt' ? '❄️ Включена тема «Дикая Охота и Белый Хлад»' : '🐺 Включена тема «Школа Волка и Пламя Игни»', 'success');
      });
    }
    document.querySelectorAll('[data-wi-theme-pick]').forEach(function(card){
      card.addEventListener('click', function(){
        var chosen = card.getAttribute('data-wi-theme-pick') === 'hunt' ? 'hunt' : 'wolf';
        if(WI.getTheme() === chosen) return;
        WI.setTheme(chosen);
        if(typeof render === 'function') render();
        WI.toast(chosen === 'hunt' ? '❄️ Включена тема «Дикая Охота и Белый Хлад»' : '🐺 Включена тема «Школа Волка и Пламя Игни»', 'success');
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
    { id: 'novigrad', name: 'Вольный Город Новиград', x: 1170, y: 1025, icon: '🏰', type: 'capital', regionKey: 'redania', region: 'Вольный Город / Редания', ruler: 'Иерарх Хеммельфарт / Синдикат', climate: 'Приморский порт, умеренный', danger: 'Высокая (Охотники за колдуньями)', desc: 'Крупнейший торговый мегаполис Континента, порт Великого Моря, цитадель культа Вечного Огня и четырёх боссов преступного синдиката.' },
    { id: 'oxenfurt', name: 'Оксенфурт', x: 1265, y: 1035, icon: '🎓', type: 'magic', regionKey: 'redania', region: 'Редания', ruler: 'Королевский магистрат и ректорат', climate: 'Речная пойма Понтара', danger: 'Средняя (Реданская стража)', desc: 'Город студентов, алхимиков, поэтов и учёных на реке Понтар. Знаменитая Оксенфуртская академия и переправа через Понтар.' },
    { id: 'vizima', name: 'Вызима', x: 1615, y: 1125, icon: '👑', type: 'capital', regionKey: 'temeria', region: 'Темерия', ruler: 'Король Фольтест / Имперский наместник', climate: 'Озёрная долина, влажный', danger: 'Средняя (Королевская стража)', desc: 'Столица Темерии на берегу озера Вызима. Королевский замок Фольтеста, Храмовый квартал, Дамба и Купеческий район.' },
    { id: 'white_orchard', name: 'Белый Сад (White Orchard)', x: 1680, y: 1175, icon: '🌸', type: 'city', regionKey: 'temeria', region: 'Темерия', ruler: 'Нильфгаардский гарнизон (Петер Саар Гвинлеве)', climate: 'Цветущие сады и речные заводи', danger: 'Высокая (Грифоны, гули, утопцы)', desc: 'Мирная темерская деревня на реке Ина, где Геральт и Весемир выслеживали Йеннифэр и взяли контракт на царственного грифона.' },
    { id: 'crows_perch', name: 'Вроницы (Crow\'s Perch)', x: 1180, y: 1115, icon: '🏰', type: 'city', regionKey: 'temeria', region: 'Велен (Ничейная Земля)', ruler: 'Филипп Стенгер (Кровавый Барон)', climate: 'Болота и топи Ничейной Земли', danger: 'Смертельная (Чудовища Велена)', desc: 'Укреплённый частоколом деревянный замок Кровавого Барона посреди раздираемых войной болот Велена.' },
    { id: 'hangmans_tree', name: 'Дерево Висельников (Велен)', x: 1320, y: 1140, icon: '🌳', type: 'nature', regionKey: 'temeria', region: 'Велен (Ничейная Земля)', ruler: 'Ничейная Земля / Дезертиры', climate: 'Выжженные поля и распутица', danger: 'Высокая (Дезертиры, трупоеды)', desc: 'Мрачный вековой дуб на перекрёстке военных трактов Велена, ставший символом ужасов Третьей Северной войны.' },
    { id: 'crookback_bog', name: 'Кривоуховы Топи (Приют)', x: 1295, y: 1215, icon: '🌫️', type: 'nature', regionKey: 'temeria', region: 'Велен (Кривоуховы Топи)', ruler: 'Хозяйки Леса (Пряха, Ткаха, Шептуха)', climate: 'Зловонная трясина и вечный туман', danger: 'Экстремальная (Ведьмы, бесы, водные бабы)', desc: 'Древнее проклятое болото в сердце Велена, где властвуют три хтонические Ведьмы и стоит Шепчущий Холм.' },
    { id: 'gors_velen', name: 'Горс Велен', x: 1240, y: 1230, icon: '🏛️', type: 'city', regionKey: 'temeria', region: 'Темерия / Побережье', ruler: 'Городской совет и чародеи', climate: 'Морское побережье', danger: 'Средняя', desc: 'Богатый купеческий портовый город на побережье Великого Моря, ворота на священный остров Танедд.' },
    { id: 'thanedd', name: 'Остров Танедд (Аретуза)', x: 1175, y: 1185, icon: '🔮', type: 'magic', regionKey: 'temeria', region: 'Темерия / Остров Танедд', ruler: 'Капитул Чародеев (Тиссая де Врие)', climate: 'Морские ветра, скалистый остров', danger: 'Экстремальная (Магические барьеры, Башня Чайки)', desc: 'Магическая академия Аретуза для юных чародеек, дворец Гарштанг, дворец Локсия и древняя эльфийская Башня Чайки (Тор Лара).' },
    { id: 'kaer_morhen', name: 'Каэр Морхен (Школа Волка)', x: 2595, y: 245, icon: '🐺', type: 'witcher', regionKey: 'kaedwen_aedirn', region: 'Синие Горы (Каэдвен)', ruler: 'Весемир (Мастер Школы Волка)', climate: 'Суровый высокогорный, ледники', danger: 'Высокая (Дикая Охота, горные бестии)', desc: 'Крепость Старого Моря в уединённом ущелье Синих Гор. Древняя цитадель Школы Волка, где зимуют ведьмаки.' },
    { id: 'kaer_seren', name: 'Руины Каэр Серен (Школа Грифона)', x: 720, y: 560, icon: '🦅', type: 'witcher', regionKey: 'kovir', region: 'Морской берег Повисса', ruler: 'Эрланд из Ларвика (в древности)', climate: 'Скалистый морской утёс, шторма', danger: 'Высокая (Лавины, элементали)', desc: 'Разрушенная обвалом прибрежная твердыня ведьмаков Школы Грифона у подножия Пастушьих Гор в Повиссе.' },
    { id: 'haern_caduch', name: 'Руины Хаэрн Кадух (Школа Медведя)', x: 2210, y: 2040, icon: '🐻', type: 'witcher', regionKey: 'nilfgaard', region: 'Горы Амелл (Геммера)', ruler: 'Арнагад (Основатель Школы Медведя)', climate: 'Заснеженные пики Амелл', danger: 'Высокая (Горные тролли, призраки)', desc: 'Суровая горная цитадель ведьмаков Школы Медведя среди ледяных хребтов Амелл на границе с Туссентом.' },
    { id: 'kaer_trolde', name: 'Каэр Трольде', x: 595, y: 1590, icon: '⛵', type: 'capital', regionKey: 'skellige', region: 'Острова Скеллиге', ruler: 'Крах ан Крайт / Керис ан Крайт', climate: 'Океанический, фьорды и скалы', danger: 'Высокая (Сирены, гарпии, шторма)', desc: 'Неприступная цитадель ярлов клана ан Крайт, высеченная в отвесной скале острова Ард Скеллиг.' },
    { id: 'undvik', name: 'Остров Ундвик (Кузница Тиршах)', x: 692, y: 1612, icon: '❄️', type: 'nature', regionKey: 'skellige', region: 'Острова Скеллиге', ruler: 'Ледяной Великан (Мыргыф) / Ярл Хьялмар', climate: 'Полярные скалы, замёрзшая бухта', danger: 'Смертельная (Ледяной Великан, Нагльфар)', desc: 'Опустошённый остров клана Тиршах, захваченный пробудившимся Ледяным Великаном, и место решающей битвы с Дикой Охотой.' },
    { id: 'beauclair', name: 'Боклер (Beauclair)', x: 2420, y: 2180, icon: '🍇', type: 'capital', regionKey: 'toussaint', region: 'Княжество Туссент', ruler: 'Княгиня Анна-Генриетта', climate: 'Солнечный средиземноморский', danger: 'Средняя (Странствующие рыцари, вампиры)', desc: 'Сказочная столица княжества Туссент. Эльфский дворец Сансетре, рыцарские турниры и легендарные виноградники.' },
    { id: 'corvo_bianco', name: 'Корво Бьянко (Поместье Геральта)', x: 2445, y: 2260, icon: '🍷', type: 'witcher', regionKey: 'toussaint', region: 'Княжество Туссент', ruler: 'Геральт из Ривии', climate: 'Солнечная долина Сансретур', danger: 'Низкая (Домашняя лаборатория)', desc: 'Живописное винодельческое поместье, пожалованное Геральту княгиней Анной-Генриеттой. Погреба, стойла Плотвы и алхимический стол.' },
    { id: 'castel_ravello', name: 'Кастель Равелло', x: 2305, y: 2195, icon: '🏰', type: 'city', regionKey: 'toussaint', region: 'Княжество Туссент', ruler: 'Фабрицио (Княжеский сомелье)', climate: 'Холмы виноградников', danger: 'Низкая', desc: 'Главная княжеская винодельня Туссента, где производятся драгоценные сорта вин Эст-Эст, Эрвелис и Сангреаль.' },
    { id: 'cintra', name: 'Цинтра', x: 1290, y: 1815, icon: '🦁', type: 'capital', regionKey: 'nilfgaard', region: 'Королевство Цинтра', ruler: 'Королева Калантэ / Император Эмгыр', climate: 'Устье Яруги, равнинный', danger: 'Высокая (Оккупационные гарнизоны)', desc: 'Древняя столица королевства Цинтра на южном берегу устья реки Яруга. Родина Львицы из Цинтры и княжны Цириллы.' },
    { id: 'sodden_hill', name: 'Содденский Холм (Обелиск)', x: 1530, y: 1695, icon: '🔥', type: 'magic', regionKey: 'temeria', region: 'Верхний Содден', ruler: 'Памятный мемориал Чародеев', climate: 'Лесистые холмы долины Яруги', danger: 'Высокая (Призраки павших, гули)', desc: 'Священный холм с каменным обелиском в память о Четырнадцати чародеях, остановивших Первое вторжение Нильфгаарда.' },
    { id: 'brokilon', name: 'Лес Брокилон (Дуэн Канэлл)', x: 1360, y: 1550, icon: '🏹', type: 'capital', regionKey: 'scoiatael', region: 'Заповедный Лес Брокилон', ruler: 'Владычица Эитнэ', climate: 'Первобытная реликтовая чаща', danger: 'Смертельная для чужаков (Стрелы дриад)', desc: 'Сердце первобытного заповедного леса дриад, чаша Дуэн Канэлл и целебная Вода Брокилона, пробуждающая Старшую Кровь.' },
    { id: 'tretogor', name: 'Третогор', x: 1505, y: 805, icon: '🏛️', type: 'capital', regionKey: 'redania', region: 'Редания', ruler: 'Король Радовид V / Сигизмунд Дийкстра', climate: 'Хлебные равнины Севера', danger: 'Средняя (Тайная служба Редании)', desc: 'Официальная столица Редании, резиденция королей и штаб-квартира реданской разведки.' },
    { id: 'blaviken', name: 'Блавикен', x: 1310, y: 510, icon: '⚔️', type: 'city', regionKey: 'redania', region: 'Редания / Побережье', ruler: 'Войт Калькштейн / Чародей Стрегобор', climate: 'Приморский залив Пракседа', danger: 'Средняя (Банды наёмников)', desc: 'Приморский городок на реке Буина, где Геральт сделал выбор меньшего зла в схватке с бандой Ренфри Сорокопутки.' },
    { id: 'vengerberg', name: 'Венгерберг', x: 2335, y: 1175, icon: '🔮', type: 'capital', regionKey: 'kaedwen_aedirn', region: 'Аэдирн', ruler: 'Король Демавенд III', climate: 'Индустриальный, предгорья', danger: 'Средняя', desc: 'Столица Аэдирна и родина чародейки Йеннифэр. Крупный торговый, металлургический и ткацкий узел Континента.' },
    { id: 'dol_blathanna', name: 'Дол Блатанна (Долина Цветов)', x: 2440, y: 1140, icon: '🌺', type: 'magic', regionKey: 'scoiatael', region: 'Восточный Аэдирн', ruler: 'Княгиня Францеска Финдабаир (Энид ан Глеанна)', climate: 'Цветущее предгорье Синих Гор', danger: 'Средняя (Эльфийские дозоры)', desc: 'Благословенная Долина Цветов, возрождённое королевство свободных эльфов Aen Seidhe под властью Маргаритки из Долин.' },
    { id: 'vergen', name: 'Верген (Верхний Аэдирн)', x: 2120, y: 960, icon: '🛡️', type: 'city', regionKey: 'kaedwen_aedirn', region: 'Верхний Аэдирн / Махакам', ruler: 'Саския (Дева из Аэдирна)', climate: 'Горные каньоны у реки Понтар', danger: 'Высокая (Осадные войска Хенсельта)', desc: 'Неприступный краснолюдский город-крепость в скалах Верхнего Аэдирна, оплот восстания Саскии Драконоубийцы.' },
    { id: 'rivia', name: 'Ривия', x: 2255, y: 1415, icon: '🛡️', type: 'capital', regionKey: 'kaedwen_aedirn', region: 'Лирия и Ривия', ruler: 'Королева Мэва', climate: 'Озеро Лок Эскалотт, холмы', danger: 'Средняя (Партизаны Лирии)', desc: 'Столичный озёрный город объединённого королевства королевы Мэвы. Место, где Геральт был посвящён в рыцари «Геральт Ривийский».' },
    { id: 'mahakam', name: 'Махакам (Гора Карбон)', x: 2030, y: 1120, icon: '🪓', type: 'capital', regionKey: 'scoiatael', region: 'Махакам', ruler: 'Старейшина Брувер Гоог', climate: 'Высокогорный, подземные плавильни', danger: 'Высокая (Рать краснолюдов)', desc: 'Горная твердыня краснолюдов и гномов. Центр металлургии высочайшего класса, где куются рунные сидеритовые клинки.' },
    { id: 'brenna', name: 'Бренна (Поле Битвы)', x: 1665, y: 1440, icon: '⚔️', type: 'nature', regionKey: 'temeria', region: 'Темерия', ruler: 'Ян Наталис (Великий Коннетабль)', climate: 'Открытые поля и перелески у речки Золотой', danger: 'Высокая (Мародёры, гули, призраки войны)', desc: 'Историческое поле грандиозной битвы при Бренне (1268 г.), решившей исход Второй Северной Войны против Нильфгаарда.' },
    { id: 'maribor', name: 'Марибор', x: 1735, y: 1380, icon: '🏰', type: 'city', regionKey: 'temeria', region: 'Темерия', ruler: 'Темерский наместник', climate: 'Старые дубравы реки Ина', danger: 'Средняя', desc: 'Второй по величине город-крепость Темерии, окружённый мощными каменными стенами и вековыми дубовыми лесами.' },
    { id: 'flotsam', name: 'Флотзам (Flotsam)', x: 1925, y: 830, icon: '🌲', type: 'city', regionKey: 'temeria', region: 'Темерия / Долина Понтара', ruler: 'Комендант Бернард Лоредо', climate: 'Глухие девственные леса Понтара', danger: 'Высокая (Скоя\'таэли Иорвета, кейран)', desc: 'Лесной торговый факторий на реке Понтар, окружённый первобытной пущей, эльфийскими руинами и логовом кейрана.' },
    { id: 'melitele', name: 'Храм Мелитэле (Элландер)', x: 1895, y: 870, icon: '🕊️', type: 'magic', regionKey: 'temeria', region: 'Княжество Элландер (Темерия)', ruler: 'Настоятельница Нэннеке', climate: 'Цветущие холмы, лечебные сады', danger: 'Низкая (Священное убежище)', desc: 'Древнее святилище богини плодородия Мелитэле. Здесь воспитывалась Цири и залечивал раны Геральт из Ривии.' },
    { id: 'loc_muinne', name: 'Лок Муинне', x: 2625, y: 670, icon: '🏛️', type: 'magic', regionKey: 'kaedwen_aedirn', region: 'Синие Горы (Каэдвен)', ruler: 'Совет и Капитул Чародеев (в руинах)', climate: 'Высокогорный каньон', danger: 'Смертельная (Горгульи, дракон, магический хаос)', desc: 'Древний эльфийский город-амфитеатр в Синих Горах, место Саммита королей и чародеев (1271 г.).' },
    { id: 'ban_ard', name: 'Бан Ард', x: 2555, y: 590, icon: '⚡', type: 'magic', regionKey: 'kaedwen_aedirn', region: 'Каэдвен', ruler: 'Ректорат Академии Бан Арда', climate: 'Горное предгорье, сухой', danger: 'Высокая (Магические аномалии)', desc: 'Каэдвенский город магов и знаменитая мужская академия магии, где обучают боевым заклинаниям Хаоса.' },
    { id: 'ard_carraigh', name: 'Ард Каррайг', x: 2320, y: 320, icon: '👑', type: 'capital', regionKey: 'kaedwen_aedirn', region: 'Каэдвен', ruler: 'Король Хенсельт', climate: 'Суровый северный, сосновые боры', danger: 'Средняя', desc: 'Суровая северная столица Каэдвена на реке Буина, окружённая деревянными и каменными валами.' },
    { id: 'pont_vannis', name: 'Понт Ваннис', x: 840, y: 440, icon: '💎', type: 'capital', regionKey: 'kovir', region: 'Ковир и Повисс', ruler: 'Король Эстерид Тиссенид / Танкред', climate: 'Северный приморский, гранитные фьорды', danger: 'Низкая (Неприступная гвардия)', desc: 'Зимняя столица Ковира, вырубленная в гранитных скалах. Центр мировой добычи золота, платины, серебра и двимерита.' },
    { id: 'lan_exeter', name: 'Лан Эксетер', x: 795, y: 270, icon: '⛵', type: 'capital', regionKey: 'kovir', region: 'Ковир и Повисс', ruler: 'Адмиралтейство Ковира', climate: 'Каналы, залив Пракседа', danger: 'Низкая (Богатейший мегаполис)', desc: 'Летняя столица Ковира без единой улицы — только величественные морские каналы и мраморные дворцы на сваях.' },
    { id: 'cidaris', name: 'Сидарис', x: 1020, y: 1180, icon: '⚓', type: 'city', regionKey: 'temeria', region: 'Королевство Сидарис', ruler: 'Король Этайл', climate: 'Тёплые морские бризы', danger: 'Низкая', desc: 'Приморское королевство мореходов и корабелов, чей флот защищал устье Понтара и берега Севера.' },
    { id: 'kerack', name: 'Керак', x: 1130, y: 1390, icon: '⛵', type: 'city', regionKey: 'temeria', region: 'Королевство Керак', ruler: 'Король Белогун / Вираксас', climate: 'Устье реки Адалатте', danger: 'Средняя (Контрабандисты и маги Риссберга)', desc: 'Приморское королевство на реке Адалатте, порт каперов и арена событий романа «Сезон Гроз».' },
    { id: 'brugge', name: 'Бругге', x: 1605, y: 1575, icon: '🏰', type: 'city', regionKey: 'temeria', region: 'Королевство Бругге', ruler: 'Король Венцлав', climate: 'Лесостепь у реки Вроница', danger: 'Средняя', desc: 'Крепость и перекрёсток военных трактов между Брокилоном, Содденом и долиной реки Яруга.' },
    { id: 'stygga_castle', name: 'Замок Стигга (Цитадель Вильгефорца)', x: 1390, y: 2980, icon: '💀', type: 'magic', regionKey: 'nilfgaard', region: 'Эббинг (Мыс Сорочий)', ruler: 'Чародей Вильгефорц из Роггевеена', climate: 'Штормовой скалистый утёс в Эббинге', danger: 'Смертельная (Лаборатории Вильгефорца, наёмники Бонарта)', desc: 'Мрачный замок на неприступном морском утёсе в Эббинге, где разыгралась финальная битва ганзы Геральта с Вильгефорцем и Лео Бонартом.' },
    { id: 'korath_desert', name: 'Пустыня Корат («Сковорода»)', x: 2580, y: 2920, icon: '🏜️', type: 'nature', regionKey: 'nilfgaard', region: 'Восток Империи (За горами Тир Тохар)', ruler: 'Песчаные чудовища (Гogловоры)', climate: 'Испепеляющий зной, безводные дюны', danger: 'Экстремальная (Обезвоживание, песчаные бестии)', desc: 'Беспощадная раскалённая пустыня за хребтом Тир Тохар, куда портал Башни Чайки забросил Цири.' },
    { id: 'hengfors_city', name: 'Хенгфорс (Столица Лиги)', x: 1515, y: 390, icon: '🦅', type: 'capital', regionKey: 'kovir', region: 'Лига Хенгфорса (Каингорн)', ruler: 'Король Недамир из Каингорна', climate: 'Предгорья Драконьих и Пустельских гор', danger: 'Низкая', desc: 'Столица Лиги Хенгфорса на реке Браа — богатого союза северных княжеств (Каингорн, Маллеора, Крейден, Арксия и Ямурлак).' },
    { id: 'verden_city', name: 'Настрог и Хамм (Вердэн)', x: 1190, y: 1685, icon: '🌲', type: 'capital', regionKey: 'temeria', region: 'Королевство Вердэн', ruler: 'Король Эрвилл / Принц Кистрин', climate: 'Лесное побережье у устья Яруги', danger: 'Высокая (Рейды дриад Брокилона)', desc: 'Королевство Вердэн между лесом Брокилон и северным берегом устья Яруги, охраняемое крепостями Настрог, Розрог и Бодрог.' },
    { id: 'nazair_city', name: 'Ассенгард и Рис-Рун (Назаир)', x: 1685, y: 2135, icon: '⚔️', type: 'capital', regionKey: 'nilfgaard', region: 'Королевство Назаир', ruler: 'Короли Назаира / Наместник', climate: 'Скалистые склоны Марнадаля и озеро Муредах', danger: 'Высокая', desc: 'Древнее южное королевство к югу от ступеней Марнадаля и гор Амелл, славящееся замком Рис-Рун и бездонным озером Тарн Мира.' },
    { id: 'metinna_city', name: 'Метинна', x: 1675, y: 2565, icon: '🐎', type: 'capital', regionKey: 'nilfgaard', region: 'Королевство Метинна', ruler: 'Короли Метинны', climate: 'Степные равнины реки Сильте', danger: 'Средняя', desc: 'Столица королевства Метинна на реке Сильте, прославленного своими коневодами и лучшей лёгкой кавалерией Юга.' },
    { id: 'geso_city', name: 'Глисвен и Амарилло (Гесо)', x: 2365, y: 2745, icon: '🏜️', type: 'capital', regionKey: 'nilfgaard', region: 'Королевство Гесо', ruler: 'Правители Гесо', climate: 'Засушливые предгорья Тир Тохар', danger: 'Высокая (Банды Крыс, наёмники)', desc: 'Восточное южное королевство у подножия хребта Тир Тохар на границе с раскалённой пустыней Корат.' },
    { id: 'maecht_city', name: 'Маэхт', x: 1995, y: 3015, icon: '👑', type: 'capital', regionKey: 'nilfgaard', region: 'Королевство Маэхт', ruler: 'Король Хотспорн / Короли Маэхта', climate: 'Долина рек Вельда и Им Лебар', danger: 'Средняя', desc: 'Богатое южное королевство между Метинной, Эббингом и Геммерой, сохраняющее собственную корону и привилегии.' },
    { id: 'gemmera_city', name: 'Геммера', x: 1955, y: 3255, icon: '🐻', type: 'capital', regionKey: 'nilfgaard', region: 'Геммера', ruler: 'Правители Геммеры', climate: 'Суровые нагорья у хребта Тир Тохар', danger: 'Высокая (Пацификаторы, горные бестии)', desc: 'Воинственная горная страна к югу от реки Им Лебар, известная своими суровыми наёмниками и рудниками.' },
    { id: 'etolia_city', name: 'Башня Ветров и Эйддон (Этолия)', x: 1395, y: 3495, icon: '🌊', type: 'capital', regionKey: 'nilfgaard', region: 'Королевство Этолия', ruler: 'Правители Этолии', climate: 'Приморские утёсы и виноградники Баккалы', danger: 'Средняя', desc: 'Прибрежное южное королевство между Даэрланом и устьем Альбы, славящееся портами Эйддон, Баккала и древней Башней Ветров.' },
    { id: 'vicovaro_city', name: 'Виковаро', x: 2295, y: 3480, icon: '🔮', type: 'capital', regionKey: 'nilfgaard', region: 'Виковаро', ruler: 'Князья и ректоры Виковаро', climate: 'Тёплая долина верхней Альбы', danger: 'Средняя', desc: 'Древняя столица Виковаро со знаменитой академией медицины и магии, откуда родом чародейка Фрингилья Виго и Кагыр.' },
    { id: 'nilfgaard_city', name: 'Город Золотых Башен (Нильфгаард)', x: 1710, y: 3800, icon: '☀️', type: 'capital', regionKey: 'nilfgaard', region: 'Империя Нильфгаард', ruler: 'Император Эмгыр вар Эмрейс', climate: 'Южный субтропический, река Альба', danger: 'Смертельная (Имперская гвардия «Импера», Ватье де Ридо)', desc: 'Сердце Империи Великого Солнца на реке Альба. Императорский дворец Белого Пламени и купола из чистого золота.' }
  ];

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
      d: "M 1144 1052 L 1161 1054 L 1195 1058 L 1209 1069 L 1203 1087 L 1185 1098 L 1155 1102 L 1137 1107 L 1131 1113 L 1129 1124 L 1131 1140 L 1139 1154 L 1153 1166 L 1164 1172 L 1172 1172 L 1180 1178 L 1188 1190 L 1192 1200 L 1192 1208 L 1187 1215 L 1177 1221 L 1172 1224 L 1174 1232 L 1180 1247 L 1184 1269 L 1186 1296 L 1195 1321 L 1208 1344 L 1215 1355 L 1255 1375 L 1272 1376 L 1308 1379 L 1340 1389 L 1370 1406 L 1400 1425 L 1430 1445 L 1458 1465 L 1482 1485 L 1495 1495 L 1508 1492 L 1532 1488 L 1558 1482 L 1582 1478 L 1605 1478 L 1625 1482 L 1635 1485 L 1648 1492 L 1672 1508 L 1700 1515 L 1730 1515 L 1758 1508 L 1782 1492 L 1802 1478 L 1818 1462 L 1825 1455 L 1840 1445 L 1870 1425 L 1900 1402 L 1930 1378 L 1945 1365 L 1942 1345 L 1938 1305 L 1932 1258 L 1928 1202 L 1930 1142 L 1940 1078 L 1955 1018 L 1975 962 L 1985 935 L 1978 918 L 1962 882 L 1945 849 L 1925 816 L 1915 800 L 1890 806 L 1840 819 L 1792 830 L 1748 840 L 1708 862 L 1672 898 L 1630 918 L 1580 922 L 1535 945 L 1495 985 L 1452 1012 L 1408 1028 L 1360 1035 L 1310 1035 L 1268 1037 L 1232 1040 L 1197 1044 L 1162 1050 L 1144 1052 Z"
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
      locId: "cintra",
      name: "Вердэн",
      icon: "🌲",
      baseColor: "#84cc16",
      defaultFaction: "verden",
      labelX: 1185, labelY: 1615,
      d: "M 1064 1504 L 1066 1512 L 1070 1528 L 1080 1543 L 1096 1557 L 1101 1582 L 1095 1618 L 1108 1648 L 1140 1672 L 1158 1694 L 1162 1714 L 1171 1727 L 1185 1733 L 1198 1744 L 1210 1760 L 1224 1766 L 1240 1762 L 1248 1760 L 1260 1749 L 1283 1726 L 1310 1712 L 1340 1708 L 1355 1705 L 1359 1698 L 1368 1682 L 1377 1668 L 1387 1652 L 1395 1635 L 1402 1615 L 1405 1605 L 1385 1608 L 1345 1612 L 1308 1610 L 1272 1600 L 1248 1582 L 1235 1558 L 1227 1532 L 1226 1508 L 1225 1495 L 1212 1496 L 1188 1497 L 1160 1499 L 1130 1501 L 1102 1502 L 1077 1504 L 1064 1504 Z"
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
      d: "M 1405 1605 L 1402 1615 L 1395 1635 L 1387 1652 L 1377 1668 L 1368 1682 L 1359 1698 L 1355 1705 L 1375 1704 L 1415 1703 L 1455 1700 L 1495 1697 L 1530 1692 L 1560 1688 L 1575 1685 L 1585 1682 L 1605 1675 L 1622 1670 L 1638 1667 L 1645 1665 L 1650 1650 L 1660 1620 L 1662 1590 L 1658 1560 L 1650 1530 L 1640 1500 L 1635 1485 L 1625 1482 L 1605 1478 L 1582 1478 L 1558 1482 L 1532 1488 L 1508 1492 L 1495 1495 L 1490 1508 L 1480 1532 L 1470 1555 L 1460 1575 L 1442 1590 L 1418 1600 L 1405 1605 Z"
    },
    {
      id: "sodden",
      locId: "sodden_hill",
      name: "Содден",
      icon: "🔥",
      baseColor: "#fb7185",
      defaultFaction: "sodden",
      labelX: 1820, labelY: 1760,
      d: "M 1635 1485 L 1640 1500 L 1650 1530 L 1658 1560 L 1662 1590 L 1660 1620 L 1650 1650 L 1645 1665 L 1638 1667 L 1622 1670 L 1605 1675 L 1585 1682 L 1575 1685 L 1582 1700 L 1598 1730 L 1608 1765 L 1612 1805 L 1620 1848 L 1630 1892 L 1642 1932 L 1658 1968 L 1668 1998 L 1672 2022 L 1675 2035 L 1745 2045 L 1772 2040 L 1828 2030 L 1885 2028 L 1945 2032 L 2000 2032 L 2050 2028 L 2092 2022 L 2128 2018 L 2145 2015 L 2170 2000 L 2220 1970 L 2262 1942 L 2298 1918 L 2322 1885 L 2338 1845 L 2345 1825 L 2455 1795 L 2428 1802 L 2372 1818 L 2320 1810 L 2270 1780 L 2220 1750 L 2170 1720 L 2120 1698 L 2070 1682 L 2022 1660 L 1978 1630 L 1955 1615 L 1945 1620 L 1925 1630 L 1902 1628 L 1878 1612 L 1860 1588 L 1850 1552 L 1840 1515 L 1830 1475 L 1825 1455 L 1818 1462 L 1802 1478 L 1782 1492 L 1758 1508 L 1730 1515 L 1700 1515 L 1672 1508 L 1648 1492 L 1635 1485 Z"
    },
    {
      id: "angren",
      locId: "brenna",
      name: "Ангрен",
      icon: "🌫️",
      baseColor: "#a3e635",
      defaultFaction: "angren",
      labelX: 2035, labelY: 1515,
      d: "M 1825 1455 L 1830 1475 L 1840 1515 L 1850 1552 L 1860 1588 L 1878 1612 L 1902 1628 L 1925 1630 L 1945 1620 L 1955 1615 L 1982 1630 L 2038 1660 L 2092 1668 L 2148 1652 L 2188 1618 L 2212 1562 L 2222 1512 L 2218 1468 L 2210 1425 L 2200 1385 L 2195 1365 L 2175 1375 L 2135 1395 L 2092 1408 L 2048 1412 L 2005 1402 L 1965 1378 L 1945 1365 L 1930 1378 L 1900 1402 L 1870 1425 L 1840 1445 L 1825 1455 Z"
    },
    {
      id: "mahakam",
      locId: "mahakam",
      name: "Махакам",
      icon: "🪓",
      baseColor: "#94a3b8",
      defaultFaction: "mahakam",
      labelX: 2045, labelY: 1185,
      d: "M 1985 935 L 1975 962 L 1955 1018 L 1940 1078 L 1930 1142 L 1928 1202 L 1932 1258 L 1938 1305 L 1942 1345 L 1945 1365 L 1965 1378 L 2005 1402 L 2048 1412 L 2092 1408 L 2135 1395 L 2175 1375 L 2195 1365 L 2175 1295 L 2172 1280 L 2168 1250 L 2155 1208 L 2135 1152 L 2110 1095 L 2080 1035 L 2045 988 L 2005 952 L 1985 935 Z"
    },
    {
      id: "aedirn",
      locId: "vengerberg",
      name: "Аэдирн",
      icon: "🔥",
      baseColor: "#f97316",
      defaultFaction: "aedirn",
      labelX: 2335, labelY: 1125,
      d: "M 1915 800 L 1925 816 L 1945 849 L 1962 882 L 1978 918 L 1985 935 L 2005 952 L 2045 988 L 2080 1035 L 2110 1095 L 2135 1152 L 2155 1208 L 2168 1250 L 2172 1280 L 2175 1295 L 2198 1299 L 2242 1306 L 2292 1311 L 2348 1314 L 2405 1308 L 2465 1292 L 2525 1282 L 2585 1278 L 2635 1278 L 2675 1282 L 2695 1285 L 2699 1258 L 2706 1202 L 2711 1145 L 2714 1085 L 2715 1055 L 2660 1055 L 2550 1055 L 2462 1045 L 2398 1025 L 2358 992 L 2342 948 L 2340 899 L 2350 846 L 2355 820 L 2328 815 L 2272 805 L 2218 809 L 2162 826 L 2105 830 L 2045 820 L 1990 811 L 1940 804 L 1915 800 Z"
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
      labelX: 2440, labelY: 1460,
      d: "M 2175 1295 L 2195 1365 L 2200 1385 L 2210 1425 L 2218 1468 L 2222 1512 L 2212 1562 L 2188 1618 L 2148 1652 L 2092 1668 L 2038 1660 L 1982 1630 L 1955 1615 L 1978 1630 L 2022 1660 L 2070 1682 L 2120 1698 L 2170 1720 L 2220 1750 L 2270 1780 L 2320 1810 L 2372 1818 L 2428 1802 L 2455 1795 L 2488 1788 L 2552 1772 L 2608 1730 L 2652 1660 L 2684 1582 L 2701 1498 L 2706 1412 L 2699 1328 L 2695 1285 L 2675 1282 L 2635 1278 L 2585 1278 L 2525 1282 L 2465 1292 L 2405 1308 L 2348 1314 L 2292 1311 L 2242 1306 L 2198 1299 L 2175 1295 Z"
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
      d: "M 1248 1760 L 1262 1759 L 1290 1757 L 1305 1761 L 1307 1771 L 1302 1777 L 1290 1779 L 1270 1789 L 1242 1807 L 1229 1829 L 1231 1855 L 1240 1876 L 1256 1892 L 1264 1907 L 1264 1921 L 1261 1951 L 1255 1997 L 1246 2023 L 1234 2029 L 1226 2036 L 1222 2044 L 1226 2051 L 1238 2057 L 1252 2058 L 1268 2054 L 1296 2064 L 1336 2088 L 1356 2100 L 1371 2091 L 1400 2074 L 1432 2070 L 1468 2080 L 1500 2088 L 1530 2092 L 1562 2088 L 1598 2072 L 1630 2058 L 1660 2042 L 1675 2035 L 1672 2022 L 1668 1998 L 1658 1968 L 1642 1932 L 1630 1892 L 1620 1848 L 1612 1805 L 1608 1765 L 1598 1730 L 1582 1700 L 1575 1685 L 1560 1688 L 1530 1692 L 1495 1697 L 1455 1700 L 1415 1703 L 1375 1704 L 1355 1705 L 1340 1708 L 1310 1712 L 1283 1726 L 1260 1749 L 1248 1760 Z"
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
      owners: { cintra: 'nilfgaard', lyria: 'nilfgaard', aedirn: 'nilfgaard', nilfgaard_provinces: 'nilfgaard', ebbing_gemmera: 'nilfgaard', nilfgaard_core: 'nilfgaard' },
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

  /* --- РЕКИ КОНТИНЕНТА (ГЕОМЕТРИЯ И ВОДНЫЕ БАРЬЕРЫ) --- */
  var WI_MAP_RIVERS = [
    {
      id: 'pontar',
      name: 'Река Понтар',
      crossDelayHours: 10,
      polyline: [
        {x: 1040, y: 1000}, {x: 1170, y: 1025}, {x: 1265, y: 1035},
        {x: 1420, y: 1060}, {x: 1580, y: 1050}, {x: 1750, y: 980},
        {x: 1925, y: 830}, {x: 2150, y: 780}, {x: 2320, y: 760}
      ],
      crossingLocIds: ['novigrad', 'oxenfurt', 'flotsam']
    },
    {
      id: 'yaruga',
      name: 'Река Яруга',
      crossDelayHours: 12,
      polyline: [
        {x: 1200, y: 1860}, {x: 1290, y: 1815}, {x: 1440, y: 1790},
        {x: 1605, y: 1575}, {x: 1740, y: 1780}, {x: 1890, y: 1775},
        {x: 2050, y: 1780}, {x: 2250, y: 1760}, {x: 2420, y: 1720}
      ],
      crossingLocIds: ['cintra', 'brugge']
    },
    {
      id: 'buina',
      name: 'Река Буина',
      crossDelayHours: 6,
      polyline: [
        {x: 1180, y: 560}, {x: 1310, y: 510}, {x: 1420, y: 510}, {x: 1600, y: 490}
      ],
      crossingLocIds: ['blaviken']
    }
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
    showPins: false,
    showTerritories: false,
    showRivers: false,
    showUserMarkers: true,
    regionFilter: 'all',
    typeFilter: 'all',
    fullscreen: false,
    encounter: null,
    activeContract: null,
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

    var selLoc = WI_MAP_LOCATIONS.find(function(l){ return l.id === m.selectedLocId; }) || WI_MAP_LOCATIONS[0];

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
      riversSvg = WI_MAP_RIVERS.map(function(rv){
        if(!rv.pts || rv.pts.length < 2) return '';
        var dRv = 'M ' + rv.pts.map(function(p){ return p[0] + ' ' + p[1]; }).join(' L ');
        var midPt = rv.pts[Math.floor(rv.pts.length / 2)];
        return '<g class="wi-river-overlay" pointer-events="none">' +
          '<path d="' + dRv + '" fill="none" stroke="rgba(14,165,233,0.45)" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />' +
          '<path d="' + dRv + '" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="12,6" stroke-linecap="round" stroke-linejoin="round" />' +
          (m.showLabels !== false && midPt ? '<text x="' + midPt[0] + '" y="' + (midPt[1] - 10) + '" text-anchor="middle" fill="#7dd3fc" font-size="13" font-family="Cinzel, serif" font-weight="800" filter="url(#wiLabelShadow)">🌊 ' + esc(rv.name) + '</text>' : '') +
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
        var isEnd = (idx === rpts.length - 1 && rpts.length > 1);

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

    // 4. Интерактивные пины городов, крепостей ведьмаков и столиц Континента (только при включённом слое Города)
    var pinsSvg = '';
    if(m.showPins === true){
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
        } else {
          var rad = isSel ? 10.5 : 8;
          shapeSvg =
            '<circle cx="' + l.x + '" cy="' + l.y + '" r="' + (rad + 3) + '" fill="rgba(0,0,0,0.82)"/>' +
            '<circle cx="' + l.x + '" cy="' + l.y + '" r="' + rad + '" fill="' + pinCol + '" stroke="#ffffff" stroke-width="' + (isSel ? '2.5' : '1.8') + '"/>';
        }

        var labelSvg = '';
        if(m.showLabels !== false && (isVisible || isSel)){
          var shortName = l.name.split(' (')[0];
          var fSize = isSel ? '15.5' : (l.type === 'capital' || l.type === 'witcher' ? '13.5' : '12');
          var fCol = isSel ? '#fbbf24' : (l.type === 'witcher' ? '#fde68a' : '#f8fafc');
          labelSvg = '<text x="' + l.x + '" y="' + (l.y + (isSel ? 30 : 24)) + '" fill="' + fCol + '" font-size="' + fSize + '" font-family="Cinzel, serif" font-weight="' + (isSel || l.type === 'capital' ? '800' : '700') + '" text-anchor="middle" filter="url(#wiLabelShadow)" pointer-events="none">' +
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

    return '<svg id="wiMapSvg" viewBox="' + minX + ' ' + minY + ' ' + vbW + ' ' + vbH + '" width="100%" height="100%" style="display:block;touch-action:none;user-select:none;">' +
      defsSvg +
      mapImg +
      '<g id="wiMapRivers">' + riversSvg + '</g>' +
      '<g id="wiMapTerritories">' + territoriesSvg + '</g>' +
      warGroupSvg +
      routeSvg +
      '<g id="wiMapPinsGroup">' + pinsSvg + '</g>' +
      '<g id="wiMapUserMarkersGroup">' + userPinsSvg + '</g>' +
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

  /* Экран КАРТА МИРА (wiMap) */
  function wiMap(){
    var m = WI.map;
    if(!m.userMarkers || !m.userMarkers.length) WI.loadUserMarkers();
    if(!m.tacticsLoaded) WI.loadTacticalState();

    var markersCount = (m.userMarkers || []).length;
    var tacticsCount = ((m.warPaths && m.warPaths.length) || 0) + ((m.tacticalUnits && m.tacticalUnits.length) || 0);
    var curLoc = WI_MAP_LOCATIONS.find(function(l){ return l.id === m.selectedLocId; }) || WI_MAP_LOCATIONS[0];
    var isTactics = (m.mode === 'tactics');
    var isRoute = (m.mode === 'route');
    var isMarkers = (m.mode === 'markers');

    // Компактная панель инструментов режима Тактики (выпадающие списки вместо громоздких рядов кнопок)
    var tacticsPaletteHtml = '';
    if(isTactics){
      var toolBtns = [
        { id: 'pan',     label: '✋ Выбор / Камера', title: 'Перемещение карты и выбор отрядов кликом' },
        { id: 'unit',    label: '♟️ + Отряд',        title: 'Клик по карте размещает выбранный род войск' },
        { id: 'march',   label: '🏃 Марш',           title: 'Клик по карте добавляет точку маршрута выбранному отряду' },
        { id: 'arrow',   label: '🏹 Стрела удара',   title: 'Зажмите ЛКМ и проведите стрелу наступления армии' },
        { id: 'paint',   label: '🧱 Линия фронта',   title: 'Зажмите ЛКМ и нарисуйте оборонительный рубеж' },
        { id: 'capture', label: '🏴 Захват страны',  title: 'Клик по региону передаёт его выбранной державе' },
        { id: 'eraser',  label: '🧹 Ластик',         title: 'Клик по отряду или линии фронта удаляет их с карты' }
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

      var toolHint = '✋ Клик по отряду — открыть штаб соединения; Зажать ЛКМ — перетащить';
      if(m.tacticsTool === 'unit') toolHint = '♟️ Кликните в любую точку карты для высадки выбранного отряда';
      else if(m.tacticsTool === 'march') toolHint = '🏃 Кликайте по карте, чтобы задать маршрут марша выбранному отряду';
      else if(m.tacticsTool === 'arrow') toolHint = '🏹 Зажмите ЛКМ и проведите наступательную стрелу удара';
      else if(m.tacticsTool === 'paint') toolHint = '🧱 Зажмите ЛКМ и проведите линию фронта';
      else if(m.tacticsTool === 'capture') toolHint = '🏴 Кликните внутри границ королевства для смены владельца';
      else if(m.tacticsTool === 'eraser') toolHint = '🧹 Кликните по любому отряду или линии/стреле, чтобы удалить';

      var activeFac = WI_TACTICAL_FACTIONS[m.warNation] || WI_TACTICAL_FACTIONS.nilfgaard;

      tacticsPaletteHtml =
        '<div class="wi-war-palette">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;width:100%;">' +
            '<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">' +
              toolBtns +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">' +
              '<button class="wi-war-tool" id="wiWarAnimateAllBtn" style="color:#38bdf8;border-color:rgba(56,189,248,0.45);" title="Плавно переместить все отряды по их маршрутам марша">▶️ Ход марша</button>' +
              '<button class="wi-war-tool" id="wiWarUndoBtn" title="Отменить последнее действие">↩️ Назад</button>' +
              '<button class="wi-war-tool" id="wiWarClearBtn" style="color:#fca5a5;" title="Сбросить тактическую карту">🗑️ Сброс</button>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding-top:6px;border-top:1px solid rgba(255,255,255,0.08);width:100%;">' +
            '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
              '<label style="font-size:11px;color:var(--wi-steel);font-family:\'JetBrains Mono\',monospace;display:inline-flex;align-items:center;gap:5px;">' +
                '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + activeFac.color + ';"></span>ФРАКЦИЯ:' +
                '<select id="wiWarFactionSelect" class="wi-war-select">' + factionSelectOpts + '</select>' +
              '</label>' +
              '<label style="font-size:11px;color:var(--wi-steel);font-family:\'JetBrains Mono\',monospace;display:inline-flex;align-items:center;gap:5px;">' +
                'РОД ВОЙСК:' +
                '<select id="wiWarUnitTypeSelect" class="wi-war-select">' + buildWiUnitTypeOptionsHtml(m.unitType || 'army') + '</select>' +
              '</label>' +
              ((m.tacticsTool === 'paint' || m.tacticsTool === 'arrow') ? (
                '<label style="font-size:11px;color:var(--wi-steel);font-family:\'JetBrains Mono\',monospace;display:inline-flex;align-items:center;gap:5px;">' +
                  'МАСШТАБ:' +
                  '<select id="wiWarBrushSizeSelect" class="wi-war-select">' + brushSelectOpts + '</select>' +
                '</label>'
              ) : '') +
            '</div>' +
            '<div style="font-size:11.5px;color:#fde68a;font-family:\'JetBrains Mono\',monospace;">' + toolHint + '</div>' +
          '</div>' +
        '</div>';
    }

    // Панель фильтрации и быстрого выбора локаций в режиме Атласа
    var atlasFilterHtml = '';
    if(m.mode === 'inspect'){
      var regionTabs = [
        { k: 'all', l: 'Все (' + WI_MAP_LOCATIONS.length + ')' },
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
        { k: 'all', l: 'Все типы' },
        { k: 'capital', l: '👑 Столицы' },
        { k: 'witcher', l: '🐺 Ведьмачьи крепости' },
        { k: 'city', l: '🏰 Города и замки' },
        { k: 'magic', l: '🔮 Академии и святилища' },
        { k: 'nature', l: '🌲 Природа и поля битв' }
      ];

      var filteredLocs = WI_MAP_LOCATIONS.filter(function(l){
        if(m.regionFilter && m.regionFilter !== 'all' && l.regionKey !== m.regionFilter) return false;
        if(m.typeFilter && m.typeFilter !== 'all' && l.type !== m.typeFilter) return false;
        var q = (m.search || '').toLowerCase().trim();
        if(q && l.name.toLowerCase().indexOf(q) === -1 && (l.region || '').toLowerCase().indexOf(q) === -1) return false;
        return true;
      });

      atlasFilterHtml = '<div style="margin-top:10px;background:rgba(14,18,24,0.85);border:1px solid var(--wi-border);border-radius:8px;padding:10px 12px;">' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">' +
          regionTabs.map(function(rt){
            return '<button class="wi-pill ' + ((m.regionFilter || 'all') === rt.k ? 'active' : '') + '" data-wi-reg-filter="' + escA(rt.k) + '" style="font-size:11.5px;padding:4px 10px;">' + esc(rt.l) + '</button>';
          }).join('') +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.06);">' +
          typeTabs.map(function(tt){
            return '<button class="wi-pill ' + ((m.typeFilter || 'all') === tt.k ? 'active' : '') + '" data-wi-type-filter="' + escA(tt.k) + '" style="font-size:11px;padding:3px 9px;">' + esc(tt.l) + '</button>';
          }).join('') +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;max-height:115px;overflow-y:auto;padding-right:4px;">' +
          filteredLocs.map(function(l){
            var isCur = (l.id === curLoc.id);
            return '<button class="wi-war-tool ' + (isCur ? 'active' : '') + '" data-wi-select-loc="' + escA(l.id) + '" style="font-size:11px;padding:3px 8px;font-family:\'Cinzel\',serif;">' + l.icon + ' ' + esc(l.name.split(' (')[0]) + '</button>';
          }).join('') +
        '</div>' +
      '</div>';
    }

    // Инспектор локации/маршрута/меток/тактики
    var inspectorHtml = '';

    if(m.mode === 'inspect'){
      var locTer = getTerrainAt(curLoc.x, curLoc.y);
      var contractHtml = '';
      if(m.activeContract){
        var c = m.activeContract;
        contractHtml = '<div style="margin-top:14px;background:linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(15,23,42,0.92) 100%);border:1px solid rgba(245,158,11,0.45);border-left:4px solid var(--wi-amber);border-radius:6px;padding:12px 14px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:8px;">' +
            '<div>' +
              '<div style="font-size:14px;font-weight:800;color:#fbbf24;font-family:\'Cinzel\',serif;">📜 ' + esc(c.title) + '</div>' +
              '<div style="font-size:11.5px;color:#cbd5e1;">Заказчик: <b>' + esc(c.client) + ' (' + esc(curLoc.name) + ')</b> • Награда: <b style="color:#fde68a;">🪙 ' + esc(c.reward) + '</b></div>' +
            '</div>' +
            '<button class="btn btn-ghost" id="wiContractMarkOnMapBtn" style="font-size:11px;padding:3px 8px;color:#fbbf24;border-color:rgba(245,158,11,0.4);">📍 Отметить логово на карте</button>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;font-size:12px;">' +
            '<div style="background:rgba(0,0,0,0.35);padding:7px 10px;border-radius:4px;"><span style="color:var(--wi-steel);font-size:10.5px;display:block;">БЕСТИЯ:</span><b style="color:#fca5a5;">🐺 ' + esc(c.monster) + '</b></div>' +
            '<div style="background:rgba(0,0,0,0.35);padding:7px 10px;border-radius:4px;"><span style="color:var(--wi-steel);font-size:10.5px;display:block;">УЛИКИ (ВЕДЬМАЧЬЕ ЧУТЬЁ):</span><span style="color:#e2e8f0;">🔍 ' + esc(c.clues) + '</span></div>' +
            '<div style="background:rgba(0,0,0,0.35);padding:7px 10px;border-radius:4px;"><span style="color:var(--wi-steel);font-size:10.5px;display:block;">ПОДГОТОВКА И УЯЗВИМОСТИ:</span><span style="color:#6ee7b7;">🧪 ' + esc(c.prep) + '</span></div>' +
          '</div>' +
        '</div>';
      }

      inspectorHtml = '<div class="wi-char-sheet-card" style="margin-top:14px;">' +
        '<div class="wi-char-header">' +
          '<span>' + (curLoc.icon || '🏰') + ' <b>' + esc(curLoc.name) + '</b> <span style="font-size:11px;color:var(--wi-steel);font-family:\'JetBrains Mono\',monospace;font-weight:normal;">[' + curLoc.x + ', ' + curLoc.y + ']</span></span>' +
          '<span class="wi-school-badge" style="font-size:11px;">' + esc(curLoc.region) + '</span>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:8px;margin-top:10px;margin-bottom:10px;font-size:12.5px;">' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wi-border);border-radius:4px;padding:8px 10px;">' +
            '<span style="color:var(--wi-steel);font-size:11px;display:block;">ВЛАСТЬ / ПРАВИТЕЛЬ:</span>' +
            '<b style="color:#f1f5f9;">' + esc(curLoc.ruler || '—') + '</b>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wi-border);border-radius:4px;padding:8px 10px;">' +
            '<span style="color:var(--wi-steel);font-size:11px;display:block;">КЛИМАТ И МЕСТНОСТЬ:</span>' +
            '<b style="color:#f1f5f9;">' + esc(curLoc.climate || '—') + ' (' + locTer.icon + ' ' + esc(locTer.name) + ')</b>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wi-border);border-radius:4px;padding:8px 10px;">' +
            '<span style="color:var(--wi-steel);font-size:11px;display:block;">УРОВЕНЬ ОПАСНОСТИ:</span>' +
            '<b style="color:#fca5a5;">' + esc(curLoc.danger || '—') + '</b>' +
          '</div>' +
        '</div>' +
        '<div class="desc" style="margin-top:6px;font-size:13.5px;line-height:1.55;color:#e2e8f0;font-family:\'EB Garamond\',serif;font-style:italic;">' +
          esc(curLoc.desc) +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">' +
          '<button class="btn btn-primary" id="wiMapSetRouteDestBtn" data-loc-id="' + curLoc.id + '">🧭 Проложить путь сюда</button>' +
          '<button class="btn btn-ghost" id="wiMapSetRouteOriginBtn" data-loc-id="' + curLoc.id + '">🏁 Начать маршрут отсюда</button>' +
          '<button class="btn btn-ghost" id="wiMapCenterOnLocBtn" data-loc-id="' + curLoc.id + '">🎯 Сфокусировать камеру</button>' +
          '<button class="btn btn-ghost" id="wiMapRollContractBtn" data-loc-id="' + curLoc.id + '" style="color:#fbbf24;border-color:rgba(245,158,11,0.4);">📜 Доска объявлений (Заказ)</button>' +
          '<button class="btn btn-ghost" id="wiMapCopyLocLoreBtn" data-loc-id="' + curLoc.id + '">📋 Скопировать лор</button>' +
        '</div>' +
        contractHtml +
      '</div>';
    } else if(isTactics){
      inspectorHtml = renderWiTacticsInspector();
    } else if(isRoute){
      if(!m.routeLoaded){
        WI.loadRoute();
        m.routeLoaded = true;
      }
      var rCalc = calcFullRoute(m.routePoints || [], m.travelMode || 'horse', m.travelPace || 'normal');

      var encHtml = m.encounter ? ('<div style="background:rgba(245,158,11,0.12);border:1px solid var(--wi-amber);border-radius:6px;padding:12px;margin-top:12px;">' +
        '<div style="font-weight:700;color:#fbbf24;margin-bottom:4px;font-family:\'Cinzel\',serif;">' + esc(m.encounter.title) + '</div>' +
        '<div style="font-size:13px;line-height:1.45;color:var(--wi-silver);font-family:\'EB Garamond\',serif;font-style:italic;">' + esc(m.encounter.desc) + '</div>' +
      '</div>') : '';

      var warningsHtml = (rCalc.warnings && rCalc.warnings.length) ? ('<div style="margin-top:10px;display:flex;flex-direction:column;gap:6px;">' +
        rCalc.warnings.map(function(w){
          return '<div style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.35);border-radius:4px;padding:8px 12px;font-size:12.5px;color:#fca5a5;">' + esc(w) + '</div>';
        }).join('') +
      '</div>') : '';

      var pointsTableRows = (m.routePoints && m.routePoints.length) ? m.routePoints.map(function(pt, idx){
        var isStart = (idx === 0);
        var isEnd = (idx === m.routePoints.length - 1 && m.routePoints.length > 1);
        var badgeColor = isStart ? '#10b981' : (isEnd ? '#ef4444' : '#f59e0b');
        var badgeText = isStart ? '1 (Старт)' : (isEnd ? (idx + 1) + ' (Цель)' : (idx + 1) + ' (Стоянка)');
        var ter = getTerrainAt(pt.x, pt.y);

        var segInfo = rCalc.segments[idx];
        var distToNext = '';
        if(segInfo){
          distToNext = '<div style="font-weight:700;color:#fbbf24;">' + segInfo.dist + ' миль <span style="color:var(--wi-steel);font-size:11px;font-weight:normal;">(~' + segInfo.days + ' дн.)</span></div>';
          if(segInfo.usedCrossing){
            distToNext += '<div style="margin-top:2px;"><span style="background:rgba(16,185,129,0.15);color:#6ee7b7;border:1px solid rgba(16,185,129,0.3);padding:2px 6px;border-radius:3px;font-size:10.5px;display:inline-block;">✓ 🌉 Переправа: ' + esc(segInfo.usedCrossing.name) + '</span></div>';
          }
          if(segInfo.wildCrossings && segInfo.wildCrossings.length > 0 && rCalc.mode !== 'boat'){
            segInfo.wildCrossings.forEach(function(wc){
              distToNext += '<div style="margin-top:4px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.35);border-radius:4px;padding:4px 6px;font-size:11px;color:#fca5a5;">' +
                '⚠️ Дикая переправа: <b>' + esc(wc.river.name) + '</b> (+' + wc.river.crossDelayHours + ' ч)' +
                (wc.crossingLoc ? ('<br><button type="button" class="btn btn-xs wi-insert-crossing-btn" data-seg-idx="' + idx + '" data-loc-id="' + escA(wc.crossingLoc.id) + '" style="margin-top:4px;padding:2px 6px;font-size:10.5px;color:#38bdf8;border:1px solid rgba(56,189,248,0.4);border-radius:3px;background:rgba(56,189,248,0.1);cursor:pointer;" title="Добавить город с переправой в маршрут">' +
                  '🏰 Направить через «' + esc(wc.crossingLoc.name) + '»' +
                '</button>') : '') +
              '</div>';
            });
          }
          if(segInfo.crossesWater && rCalc.mode !== 'boat'){
            distToNext += '<div style="margin-top:4px;background:rgba(239,68,68,0.2);border:1px solid #ef4444;border-radius:4px;padding:3px 6px;font-size:10.5px;color:#fca5a5;font-weight:700;">' +
              '⛔ Открытое море (преграда)' +
            '</div>';
          }
        } else {
          distToNext = '<span style="color:var(--wi-steel);">Финиш</span>';
        }

        return '<tr class="wi-route-row" data-wi-route-row-id="' + pt.id + '" style="border-bottom:1px solid rgba(255,255,255,0.06);">' +
          '<td style="padding:8px 6px;text-align:center;"><span style="background:' + badgeColor + ';color:#0f172a;padding:2px 7px;border-radius:10px;font-size:11px;font-weight:900;font-family:\'JetBrains Mono\',monospace;">' + badgeText + '</span></td>' +
          '<td style="padding:8px 6px;">' +
            '<div style="font-weight:700;color:#fff;cursor:pointer;" class="wi-pt-name-edit" data-wi-pt-id="' + pt.id + '" title="Кликните, чтобы переименовать">' + esc(pt.name || ('Точка ' + (idx + 1))) + ' ✏️</div>' +
            '<div style="font-size:11px;color:var(--wi-steel);font-family:\'JetBrains Mono\',monospace;">[' + pt.x + ', ' + pt.y + ']</div>' +
          '</td>' +
          '<td style="padding:8px 6px;font-size:12px;">' + ter.icon + ' ' + esc(ter.name) + '</td>' +
          '<td style="padding:8px 6px;">' +
            '<select class="wi-input" data-wi-pt-stop="' + pt.id + '" style="padding:3px 6px;font-size:11.5px;max-width:160px;">' +
              '<option value="none" ' + (pt.stopType === 'none' ? 'selected' : '') + '>📍 Без остановки</option>' +
              '<option value="camp" ' + (pt.stopType === 'camp' ? 'selected' : '') + '>⛺ Привал / Лагерь</option>' +
              '<option value="inn" ' + (pt.stopType === 'inn' ? 'selected' : '') + '>🍺 Корчма / Постой</option>' +
              '<option value="ferry" ' + (pt.stopType === 'ferry' ? 'selected' : '') + '>⛵ Паромная пристань</option>' +
            '</select>' +
          '</td>' +
          '<td style="padding:8px 6px;font-size:12px;">' + distToNext + '</td>' +
          '<td style="padding:8px 6px;text-align:right;white-space:nowrap;">' +
            '<button class="btn btn-ghost" data-wi-pt-focus="' + pt.id + '" style="padding:3px 7px;font-size:11px;margin-right:4px;" title="Сфокусировать карту на точке">🎯</button>' +
            '<button class="btn btn-ghost" data-wi-pt-del="' + pt.id + '" style="padding:3px 7px;font-size:11px;color:#ef4444;" title="Удалить точку">🗑️</button>' +
          '</td>' +
        '</tr>';
      }).join('') : '<tr><td colspan="6" class="char-empty" style="text-align:center;padding:16px;">Маршрут пуст. Кликните по любому городу или точке на карте, чтобы поставить первую точку!</td></tr>';

      inspectorHtml = '<div class="wi-char-sheet-card" style="margin-top:14px;">' +
        '<div class="wi-char-header">' +
          '<span>🧭 Свободный планировщик маршрутов Континента</span>' +
          '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' +
            '<span class="wi-school-badge" style="font-size:12px;background:rgba(245,158,11,0.2);color:#fbbf24;">📏 ' + rCalc.totalDist + ' миль</span>' +
            '<span class="wi-school-badge" style="font-size:12px;background:rgba(59,130,246,0.2);color:#93c5fd;">⏳ ' + rCalc.wholeDays + ' дн. ' + rCalc.remHours + ' ч.</span>' +
          '</div>' +
        '</div>' +
        '<div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:6px;padding:8px 12px;margin-top:10px;font-size:12.5px;color:#e2e8f0;line-height:1.45;">' +
          '💡 <b>Свободный выбор маршрута:</b> Кликайте по пинам городов или любой точке карты для добавления путевых точек. <span style="color:#fbbf24;font-weight:700;">Клик ЛКМ по точке маршрута — удалить</span>, <span style="color:#6ee7b7;font-weight:700;">Зажать ЛКМ и тянуть — переместить</span>.' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:12px;margin-top:12px;">' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wi-border);border-radius:6px;padding:10px;">' +
            '<div style="font-size:11px;font-weight:700;color:var(--wi-steel);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Тип передвижения:</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
              '<button class="wi-pill ' + (rCalc.mode === 'horse' ? 'active' : '') + '" data-wi-route-mode="horse" title="38 миль/день на тракте">🐎 Верхом (Плотва)</button>' +
              '<button class="wi-pill ' + (rCalc.mode === 'foot' ? 'active' : '') + '" data-wi-route-mode="foot" title="18 миль/день">🥾 Пешком</button>' +
              '<button class="wi-pill ' + (rCalc.mode === 'witcher' ? 'active' : '') + '" data-wi-route-mode="witcher" title="28 миль/день, мутации, эликсиры">🐺 Ведьмачий марш</button>' +
              '<button class="wi-pill ' + (rCalc.mode === 'boat' ? 'active' : '') + '" data-wi-route-mode="boat" title="48 миль/день по воде">⛵ На лодке</button>' +
            '</div>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wi-border);border-radius:6px;padding:10px;">' +
            '<div style="font-size:11px;font-weight:700;color:var(--wi-steel);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Темп движения:</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
              '<button class="wi-pill ' + (rCalc.pace === 'normal' ? 'active' : '') + '" data-wi-route-pace="normal">⚖️ Обычный (8 ч/дн)</button>' +
              '<button class="wi-pill ' + (rCalc.pace === 'fast' ? 'active' : '') + '" data-wi-route-pace="fast">⚡ Форсированный (+30% скор.)</button>' +
              '<button class="wi-pill ' + (rCalc.pace === 'stealth' ? 'active' : '') + '" data-wi-route-pace="stealth">🕵️ Скрытный (-30% скор.)</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:8px;margin-top:12px;font-size:12.5px;">' +
          '<div style="background:rgba(255,255,255,0.04);border:1px solid var(--wi-border);border-radius:4px;padding:8px 10px;">' +
            '<span style="color:var(--wi-steel);font-size:11px;display:block;">РЕЛЬЕФ ПУТИ:</span>' +
            '<b>' + rCalc.dominantTerrain.icon + ' ' + esc(rCalc.dominantTerrain.name) + '</b>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.04);border:1px solid var(--wi-border);border-radius:4px;padding:8px 10px;">' +
            '<span style="color:var(--wi-steel);font-size:11px;display:block;">ВРЕМЯ ПЕРЕХОДА:</span>' +
            '<b style="color:#93c5fd;">⏳ ' + rCalc.wholeDays + ' дн. ' + rCalc.remHours + ' ч.</b>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.04);border:1px solid var(--wi-border);border-radius:4px;padding:8px 10px;">' +
            '<span style="color:var(--wi-steel);font-size:11px;display:block;">ПРОЗАПАС / РАЦИОНЫ:</span>' +
            '<b style="color:#fcd34d;">🍖 ' + rCalc.rations + ' рационов</b>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.04);border:1px solid var(--wi-border);border-radius:4px;padding:8px 10px;">' +
            '<span style="color:var(--wi-steel);font-size:11px;display:block;">СТОЯНКИ И НОЧЛЕГ:</span>' +
            '<b>⛺ ' + rCalc.campsCount + ' привалов / 🍺 ' + rCalc.innsCount + ' корчм</b>' +
          '</div>' +
        '</div>' +
        warningsHtml +
        '<div style="margin-top:16px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">' +
            '<div style="font-weight:700;font-size:13.5px;color:#fff;font-family:\'Cinzel\',serif;">Маршрутный лист и стоянки (' + (m.routePoints || []).length + ')</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
              '<button class="btn btn-ghost" id="wiRouteAddCenterBtn" style="font-size:11px;padding:3px 8px;">➕ Точка в центр</button>' +
              '<button class="btn btn-ghost" id="wiRouteReverseBtn" style="font-size:11px;padding:3px 8px;" title="Развернуть маршрут в обратную сторону">🔄 Обратный</button>' +
              '<button class="btn btn-ghost" id="wiRouteLoopBtn" style="font-size:11px;padding:3px 8px;" title="Вернуться в начальную точку">🔁 Замкнуть</button>' +
              '<button class="btn btn-ghost" id="wiRouteClearBtn" style="font-size:11px;padding:3px 8px;color:#ef4444;" title="Удалить все точки">🧹 Очистить</button>' +
            '</div>' +
          '</div>' +
          '<div style="overflow-x:auto;background:rgba(10,14,20,0.6);border:1px solid var(--wi-border);border-radius:6px;">' +
            '<table style="width:100%;border-collapse:collapse;font-size:12.5px;">' +
              '<thead>' +
                '<tr style="background:rgba(255,255,255,0.04);border-bottom:1px solid var(--wi-border);color:var(--wi-steel);font-size:11px;text-transform:uppercase;">' +
                  '<th style="padding:6px 8px;text-align:center;">#</th>' +
                  '<th style="padding:6px 8px;text-align:left;">Название точки</th>' +
                  '<th style="padding:6px 8px;text-align:left;">Рельеф</th>' +
                  '<th style="padding:6px 8px;text-align:left;">Тип стоянки</th>' +
                  '<th style="padding:6px 8px;text-align:left;">До следующей</th>' +
                  '<th style="padding:6px 8px;text-align:right;">Действия</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' + pointsTableRows + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
        '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--wi-border);">' +
          '<div style="font-size:11px;color:var(--wi-steel);font-weight:700;margin-bottom:6px;text-transform:uppercase;">Каноничные шаблоны переходов:</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
            '<button class="wi-pill" data-wi-route-preset="novi_vizima">🏰 Новиград ➔ Оксенфурт ➔ Вызима</button>' +
            '<button class="wi-pill" data-wi-route-preset="vizima_km">🐺 Вызима ➔ Бан Ард ➔ Каэр Морхен</button>' +
            '<button class="wi-pill" data-wi-route-preset="oxen_toussaint">🍇 Оксенфурт ➔ Махакам ➔ Боклер</button>' +
            '<button class="wi-pill" data-wi-route-preset="novi_skellige">⛵ Новиград ➔ Каэр Трольде (Скеллиге)</button>' +
          '</div>' +
        '</div>' +
        '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
          '<button class="btn btn-primary" id="wiMapRollEncounterBtn">🎲 Случайная встреча для рельефа маршрута</button>' +
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
        '<div style="background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.35);border-radius:6px;padding:12px;margin-bottom:14px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
            '<b style="color:#fbbf24;font-family:\'Cinzel\',serif;">📍 ' + (edMarker ? 'Редактирование метки' : 'Новая тактическая метка на карте') + ' [' + formObj.x + ', ' + formObj.y + ']</b>' +
            '<button class="btn btn-ghost" id="wiMarkerCancelFormBtn" style="font-size:11px;padding:2px 8px;">Отмена</button>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:10px;">' +
            '<div>' +
              '<label style="font-size:11px;color:var(--wi-steel);display:block;margin-bottom:4px;">Название метки:</label>' +
              '<input type="text" id="wiMarkerFormTitle" class="wi-input" value="' + escA(formObj.title) + '" placeholder="Логово архигрифона / Тайник Школы Кота">' +
            '</div>' +
            '<div>' +
              '<label style="font-size:11px;color:var(--wi-steel);display:block;margin-bottom:4px;">Иконка категории:</label>' +
              '<div style="display:flex;gap:4px;flex-wrap:wrap;">' +
                markerIcons.map(function(ic){
                  return '<button type="button" class="wi-war-tool ' + (formObj.icon === ic ? 'active' : '') + '" data-wi-micon="' + ic + '" style="font-size:15px;padding:3px 8px;">' + ic + '</button>';
                }).join('') +
              '</div>' +
              '<input type="hidden" id="wiMarkerFormIcon" value="' + escA(formObj.icon || '🐺') + '">' +
            '</div>' +
          '</div>' +
          '<div style="margin-bottom:10px;">' +
            '<label style="font-size:11px;color:var(--wi-steel);display:block;margin-bottom:4px;">Заметка (награда, чудовище, секрет):</label>' +
            '<input type="text" id="wiMarkerFormDesc" class="wi-input" value="' + escA(formObj.desc || '') + '" placeholder="Награда 300 крон, уязвимость к Игни и маслу против гибридов">' +
          '</div>' +
          '<input type="hidden" id="wiMarkerFormX" value="' + formObj.x + '">' +
          '<input type="hidden" id="wiMarkerFormY" value="' + formObj.y + '">' +
          '<div style="display:flex;gap:8px;">' +
            '<button class="btn btn-primary" id="wiMarkerSaveFormBtn" data-marker-id="' + escA(formObj.id) + '">💾 Сохранить метку</button>' +
          '</div>' +
        '</div>'
      ) : '';

      inspectorHtml = '<div class="wi-char-sheet-card" style="margin-top:14px;">' +
        '<div class="wi-char-header">' +
          '<span>📍 Тактические метки ведьмака (' + markersCount + ')</span>' +
          '<div style="display:flex;gap:6px;">' +
            '<button class="btn btn-primary" id="wiMapAddMarkerOpenBtn" style="font-size:11px;padding:4px 10px;">➕ Добавить метку в центр</button>' +
            (markersCount > 0 ? '<button class="btn btn-ghost" id="wiMapClearAllMarkersBtn" style="font-size:11px;padding:4px 10px;color:#ef4444;">🗑️ Очистить все</button>' : '') +
          '</div>' +
        '</div>' +
        '<div style="font-size:12px;color:var(--wi-steel);margin-top:4px;margin-bottom:10px;">💡 <b>Совет:</b> Кликните в любое место на карте, чтобы поставить метку логова чудовища, места силы или тайника. Зажмите ЛКМ на метке, чтобы перетащить её!</div>' +
        formHtml +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:8px;">' +
          (m.userMarkers && m.userMarkers.length ? m.userMarkers.map(function(um){
            return '<div style="background:rgba(255,255,255,0.03);border:1px solid ' + (m.selectedMarkerId === um.id ? 'var(--wi-amber)' : 'var(--wi-border)') + ';border-radius:4px;padding:8px;display:flex;justify-content:space-between;align-items:center;gap:6px;">' +
              '<div style="flex:1;min-width:0;cursor:pointer;" class="wi-user-marker-row" data-marker-id="' + escA(um.id) + '">' +
                '<div style="font-weight:700;font-size:12.5px;color:#fff;">' + (um.icon || '📍') + ' ' + esc(um.title || 'Метка') + ' <span style="font-size:10px;color:var(--wi-steel);font-weight:normal;">[' + um.x + ', ' + um.y + ']</span></div>' +
                (um.desc ? ('<div style="font-size:11px;color:var(--wi-steel);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(um.desc) + '</div>') : '') +
              '</div>' +
              '<div style="display:flex;gap:4px;">' +
                '<button class="btn btn-ghost" data-wi-edit-marker="' + escA(um.id) + '" style="font-size:11px;padding:2px 6px;" title="Редактировать метку">✏️</button>' +
                '<button class="btn btn-ghost" data-wi-del-marker="' + escA(um.id) + '" style="font-size:11px;padding:2px 6px;color:#ef4444;" title="Удалить метку">🗑️</button>' +
              '</div>' +
            '</div>';
          }).join('') : '<div class="char-empty" style="grid-column:1/-1;">Нет меток. Кликните по карте или нажмите кнопку выше, чтобы отметить контракт или тайник.</div>') +
        '</div>' +
      '</div>';
    }

    var curTerHud = getTerrainAt(Math.round(m.cx || 1440), Math.round(m.cy || 1200));

    return crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Карта мира' }]) +
      '<button class="back" data-nav="wiHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiHome\');">← Назад</button>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
        '<div>' +
          '<h1 style="margin-bottom:4px;">🗺️ Карта Континента (4K Атлас и Военный Штаб)</h1>' +
          '<div class="desc" style="margin-bottom:0;">Подлинная 4K-карта Континента (' + WI_MAP_LOCATIONS.length + ' локации): Северные Королевства, Скеллиге, Туссент, Нильфгаард и штаб Северных Войн.</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
          '<button class="wi-pill ' + (m.mode === 'inspect' ? 'active' : '') + '" id="wiMapModeInspect">🗺️ Атлас</button>' +
          '<button class="wi-pill ' + (m.mode === 'route' ? 'active' : '') + '" id="wiMapModeRoute">🧭 Маршруты</button>' +
          '<button class="wi-pill ' + (m.mode === 'markers' ? 'active' : '') + '" id="wiMapModeMarkers">📍 Метки (' + markersCount + ')</button>' +
          '<button class="wi-pill ' + (m.mode === 'tactics' ? 'active' : '') + '" id="wiMapModeTactics">⚔️ Тактика' + (tacticsCount > 0 ? ' (' + tacticsCount + ')' : '') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="wi-map-container ' + (m.fullscreen ? 'wi-fullscreen' : '') + '" id="wiMapContainer" style="background:#070c14;border:1px solid var(--wi-border);border-radius:8px;overflow:hidden;position:relative;box-shadow:0 8px 30px rgba(0,0,0,0.6);">' +
        '<div class="wi-map-toolbar" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(14,18,24,0.95);border-bottom:1px solid var(--wi-border);flex-wrap:wrap;gap:8px;">' +
          '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:220px;">' +
            '<span style="color:var(--wi-steel);font-size:13px;">🔍</span>' +
            '<input type="text" id="wiMapSearch" class="wi-input" style="padding:5px 10px;font-size:12.5px;max-width:300px;" placeholder="Поиск города, крепости, школы или реки..." value="' + escA(m.search || '') + '">' +
          '</div>' +
          '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' +
            '<button class="btn btn-ghost" id="wiMapToggleTerritories" title="Показать/скрыть границы королевств и регионов" style="padding:4px 9px;font-size:12px;' + (m.showTerritories ? 'color:#fbbf24;border-color:rgba(245,158,11,0.45);' : '') + '">🏴 Границы</button>' +
            '<button class="btn btn-ghost" id="wiMapToggleRivers" title="Показать/скрыть стратегические реки и переправы" style="padding:4px 9px;font-size:12px;' + (m.showRivers ? 'color:#38bdf8;border-color:rgba(56,189,248,0.45);' : '') + '">🌊 Реки</button>' +
            '<button class="btn btn-ghost" id="wiMapTogglePins" title="Показать/скрыть интерактивные пины городов и крепостей" style="padding:4px 9px;font-size:12px;' + (m.showPins === true ? 'color:#fbbf24;border-color:rgba(245,158,11,0.45);' : '') + '">📍 Города</button>' +
            '<button class="btn btn-ghost" id="wiMapToggleLabels" title="Показать/скрыть подписи городов" style="padding:4px 9px;font-size:12px;">' + (m.showLabels !== false ? '🏷️ Текст' : '🏷️ Без текста') + '</button>' +
            '<button class="btn btn-ghost" id="wiMapZoomIn" title="Приблизить" style="padding:4px 10px;font-size:12px;">➕</button>' +
            '<button class="btn btn-ghost" id="wiMapZoomOut" title="Отдалить" style="padding:4px 10px;font-size:12px;">➖</button>' +
            '<button class="btn btn-ghost" id="wiMapZoomReset" title="Сбросить масштаб" style="padding:4px 10px;font-size:12px;">⟲ 100%</button>' +
            '<button class="btn btn-ghost" id="wiMapToggleFullscreen" title="Развернуть карту на весь экран" style="padding:4px 10px;font-size:12px;color:#fbbf24;">' + (m.fullscreen ? '✕ Свернуть' : '⛶ Полный экран') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="wi-map-quick-jumps" style="display:flex;gap:6px;flex-wrap:wrap;padding:6px 12px;background:rgba(10,14,20,0.85);border-bottom:1px solid var(--wi-border);overflow-x:auto;">' +
          '<span style="font-size:11px;color:var(--wi-steel);align-self:center;font-weight:600;font-family:\'JetBrains Mono\',monospace;">ФОКУС:</span>' +
          '<button class="wi-pill" data-wi-jump="north">🐺 Север</button>' +
          '<button class="wi-pill" data-wi-jump="novigrad">🏰 Новиград/Вызима</button>' +
          '<button class="wi-pill" data-wi-jump="kaer_morhen">🐺 Каэр Морхен</button>' +
          '<button class="wi-pill" data-wi-jump="skellige">⛵ Скеллиге</button>' +
          '<button class="wi-pill" data-wi-jump="toussaint">🍇 Туссент</button>' +
          '<button class="wi-pill" data-wi-jump="brokilon">🏹 Брокилон/Яруга</button>' +
          '<button class="wi-pill" data-wi-jump="nilfgaard">☀️ Нильфгаард</button>' +
          '<button class="wi-pill" data-wi-jump="all">🗺️ Весь Континент</button>' +
        '</div>' +
        tacticsPaletteHtml +
        '<div class="wi-map-viewport" id="wiMapViewport" style="height:580px;position:relative;cursor:' + (isTactics && m.tacticsTool === 'paint' ? 'crosshair' : 'grab') + ';overflow:hidden;background:#05080e;">' +
          renderWitcherMapSvg() +
          '<div class="wi-map-hud" id="wiMapHud">' +
            '<span id="wiHudCoords">[' + Math.round(m.cx || 1440) + ', ' + Math.round(m.cy || 1200) + ']</span>' +
            '<span style="color:var(--wi-amber);">•</span>' +
            '<span id="wiHudTerrain">' + curTerHud.icon + ' ' + esc(curTerHud.name) + '</span>' +
            '<span style="color:var(--wi-amber);">•</span>' +
            '<span id="wiHudZoom">' + Math.round((m.zoom || 1.1) * 100) + '%</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      atlasFilterHtml +
      inspectorHtml;
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
      updateHud();
    }

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

    var togglePinsBtn = document.getElementById('wiMapTogglePins');
    if(togglePinsBtn){
      togglePinsBtn.addEventListener('click', function(){
        m.showPins = (m.showPins === false ? true : false);
        if(typeof render === 'function') render();
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
    document.querySelectorAll('[data-wi-jump]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var target = btn.getAttribute('data-wi-jump');
        var cfg = presets[target];
        if(cfg){
          focusOn(cfg.cx, cfg.cy, cfg.zoom);
        }
      });
    });

    // Фильтры Атласа и быстрый выбор локации
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
          m.activeContract = null;
          focusOn(loc.x, loc.y, Math.max(m.zoom || 1.1, 2.0));
          if(typeof render === 'function') render();
        }
      });
    });

    // Генератор ведьмачьих заказов и копирование лора
    var rollContractBtn = document.getElementById('wiMapRollContractBtn');
    if(rollContractBtn){
      rollContractBtn.addEventListener('click', function(){
        var lid = rollContractBtn.getAttribute('data-loc-id');
        var loc = WI_MAP_LOCATIONS.find(function(l){ return l.id === lid; }) || WI_MAP_LOCATIONS[0];
        var ter = getTerrainAt(loc.x, loc.y);
        var pool = WI_CONTRACTS_POOL[ter.id] || WI_CONTRACTS_POOL.road;
        if(loc.regionKey === 'skellige' && WI_CONTRACTS_POOL.sea){
          pool = pool.concat(WI_CONTRACTS_POOL.sea);
        }
        var picked = pool[Math.floor(Math.random() * pool.length)];
        m.activeContract = JSON.parse(JSON.stringify(picked));
        WI.toast('📜 С доски объявлений снят заказ: «' + picked.title + '»', 'info');
        if(typeof render === 'function') render();
      });
    }

    var markContractBtn = document.getElementById('wiContractMarkOnMapBtn');
    if(markContractBtn){
      markContractBtn.addEventListener('click', function(){
        var loc = WI_MAP_LOCATIONS.find(function(l){ return l.id === m.selectedLocId; }) || WI_MAP_LOCATIONS[0];
        var c = m.activeContract;
        if(!c) return;
        var offsetAngle = Math.random() * Math.PI * 2;
        var offsetDist = 45 + Math.floor(Math.random() * 45);
        var mx = Math.max(40, Math.min(2840, Math.round(loc.x + Math.cos(offsetAngle) * offsetDist)));
        var my = Math.max(40, Math.min(4050, Math.round(loc.y + Math.sin(offsetAngle) * offsetDist)));
        m.userMarkers = m.userMarkers || [];
        var newM = {
          id: 'um_' + Date.now(),
          title: c.title + ' (' + loc.name.split(' (')[0] + ')',
          icon: '🐺',
          desc: c.monster + ' • Награда: ' + c.reward + ' • ' + c.prep,
          x: mx,
          y: my
        };
        m.userMarkers.push(newM);
        m.selectedMarkerId = newM.id;
        WI.saveUserMarkers();
        focusOn(mx, my, Math.max(m.zoom || 1.1, 2.3));
        WI.toast('📍 Логово по заказу отмечено на карте!', 'success');
        if(typeof render === 'function') render();
      });
    }

    var copyLoreBtn = document.getElementById('wiMapCopyLocLoreBtn');
    if(copyLoreBtn){
      copyLoreBtn.addEventListener('click', function(){
        var lid = copyLoreBtn.getAttribute('data-loc-id');
        var loc = WI_MAP_LOCATIONS.find(function(l){ return l.id === lid; });
        if(loc){
          var txt = loc.icon + ' ' + loc.name + ' (' + loc.region + ')\nПравитель: ' + (loc.ruler || '—') + '\nОпасность: ' + (loc.danger || '—') + '\n' + loc.desc;
          if(navigator.clipboard && navigator.clipboard.writeText){
            navigator.clipboard.writeText(txt);
          }
          WI.toast('📋 Описание «' + loc.name + '» скопировано в буфер обмена', 'success');
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
        var id = centerOnLocBtn.getAttribute('data-loc-id');
        var loc = WI_MAP_LOCATIONS.find(function(l){ return l.id === id; });
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
        var id = setRouteDestBtn.getAttribute('data-loc-id');
        var loc = WI_MAP_LOCATIONS.find(function(l){ return l.id === id; });
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
        var id = setRouteOrigBtn.getAttribute('data-loc-id');
        var loc = WI_MAP_LOCATIONS.find(function(l){ return l.id === id; });
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

        // Проверяем клик непосредственно по интерактивному пину города
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
              WI.toast('✓ Город «' + pinLoc.name + '» добавлен в маршрут', 'success');
              if(typeof render === 'function') render();
              return;
            } else {
              m.selectedLocId = pinLoc.id;
              m.activeContract = null;
              WI.toast(pinLoc.icon + ' ' + pinLoc.name + ' (' + pinLoc.region + ')', 'info');
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

        // В режиме 'inspect' (Атлас) - клик примерно в место города выбирает его и показывает инфо
        if(m.mode === 'inspect'){
          if(e.target.closest && (e.target.closest('.wi-user-marker') || e.target.closest('.wi-char-sheet-card'))) return;

          var nearCity = findNearestCity(clickX, clickY, 75);
          if(nearCity){
            m.selectedLocId = nearCity.id;
            m.activeContract = null;
            WI.toast('🏰 ' + nearCity.name + ' (' + nearCity.region + ')', 'info');
            if(typeof render === 'function') render();
          } else {
            var ter = getTerrainAt(clickX, clickY);
            WI.toast(ter.icon + ' Местность: ' + ter.name + ' [' + clickX + ', ' + clickY + ']', 'info');
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
