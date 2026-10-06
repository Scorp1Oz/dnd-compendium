/* ============================================================
   ВЕДЬМАК (THE WITCHER) МОДУЛЬ
   ============================================================ */

(function(){
  'use strict';

  var WI_PROFILES_KEY = 'ttc_wi_profiles';
  var WI_ACTIVE_ID_KEY = 'ttc_wi_active_id';
  var WI_META_KEY = 'ttc_wi_meta';

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
      notes: ''
    };
  }

  var WI = window.WI = {
    profiles: [],
    activeProfileId: '',
    meta: { name: 'Хроники Континента: Неверлэнд', note: 'Контракты, заказчики, награды и бестиарий.' },

    loadProfiles: function(){
      try {
        var raw = localStorage.getItem(WI_PROFILES_KEY);
        if(raw){
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
              WI.profiles = arr;
              var savedActive = localStorage.getItem(WI_ACTIVE_ID_KEY);
              WI.activeProfileId = (savedActive && arr.some(function(p){ return p.id === savedActive; })) ? savedActive : arr[0].id;
              return WI.profiles;
            }
          }
        }
        var legacyRaw = localStorage.getItem('wi_profile');
        if(legacyRaw){
          var legacy = JSON.parse(legacyRaw);
          if(legacy && legacy.name && legacy.name !== 'Геральт из Ривии' && legacy.id !== 'wi_prof_geralt'){
            legacy.id = 'wi_prof_legacy';
            if(!legacy.school) legacy.school = '';
            if(!legacy.energy) legacy.energy = 50;
            if(!legacy.maxEnergy) legacy.maxEnergy = 50;
            if(!legacy.silverSword) legacy.silverSword = '';
            if(!legacy.steelSword) legacy.steelSword = '';
            if(!legacy.armor) legacy.armor = '';
            WI.profiles = [legacy];
            WI.activeProfileId = legacy.id;
            WI.saveProfiles();
            return WI.profiles;
          }
        }
      } catch(e){}

      var def = defaultWitcherProfile();
      WI.profiles = [def];
      WI.activeProfileId = def.id;
      WI.saveProfiles();
      return WI.profiles;
    },

    saveProfiles: function(){
      try {
        localStorage.setItem(WI_PROFILES_KEY, JSON.stringify(WI.profiles));
        localStorage.setItem(WI_ACTIVE_ID_KEY, WI.activeProfileId);
        var act = WI.getActiveProfile();
        if(act){
          localStorage.setItem('wi_profile', JSON.stringify(act));
        }
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
      return act;
    },

    getProfile: function(){
      return WI.getActiveProfile();
    },

    saveProfile: function(p){
      if(!p || !p.id) return;
      var idx = (WI.profiles || []).findIndex(function(item){ return item.id === p.id; });
      if(idx !== -1){
        WI.profiles[idx] = p;
      } else {
        WI.profiles.push(p);
      }
      WI.saveProfiles();
    },

    switchProfile: function(newId){
      if(!newId || newId === WI.activeProfileId) return;
      var next = (WI.profiles || []).find(function(p){ return p.id === newId; });
      if(next){
        WI.activeProfileId = newId;
        WI.saveProfiles();
        if(typeof render === 'function') render();
      }
    },

    createProfile: function(opts){
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

      if(!Array.isArray(WI.profiles)) WI.profiles = [];
      WI.profiles.push(def);
      WI.activeProfileId = def.id;
      WI.saveProfiles();
      if(typeof render === 'function') render();
      return def;
    },

    cloneProfile: function(id){
      id = id || WI.activeProfileId;
      var src = (WI.profiles || []).find(function(p){ return p.id === id; }) || WI.getActiveProfile();
      if(!src) return null;
      var copy = JSON.parse(JSON.stringify(src));
      copy.id = 'wi_prof_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      copy.name = (copy.name || 'Персонаж') + ' (Копия)';
      WI.profiles.push(copy);
      WI.activeProfileId = copy.id;
      WI.saveProfiles();
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
        WI.saveProfiles();
        if(typeof render === 'function') render();
        return;
      }
      var idx = WI.profiles.findIndex(function(p){ return p.id === id; });
      if(idx === -1) return;
      WI.profiles.splice(idx, 1);
      if(WI.activeProfileId === id){
        WI.activeProfileId = WI.profiles[Math.max(0, idx - 1)].id;
      }
      WI.saveProfiles();
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
      if(typeof render === 'function') render();
    },

    getMeta: function(){
      try {
        var raw = localStorage.getItem(WI_META_KEY);
        if(raw){
          var m = JSON.parse(raw);
          if(m && m.name) {
            WI.meta = m;
            return m;
          }
        }
      } catch(e){}
      return WI.meta;
    },

    saveMeta: function(meta){
      if(meta) WI.meta = meta;
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
      return '<svg class="wi-bg-medallion" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<defs>' +
          '<filter id="wiEyeGlow" x="-50%" y="-50%" width="200%" height="200%">' +
            '<feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />' +
            '<feMerge>' +
              '<feMergeNode in="blur" />' +
              '<feMergeNode in="SourceGraphic" />' +
            '</feMerge>' +
          '</filter>' +
          '<linearGradient id="wiWolfSteel" x1="0%" y1="0%" x2="100%" y2="100%">' +
            '<stop offset="0%" stop-color="#cbd5e1" stop-opacity="0.8" />' +
            '<stop offset="50%" stop-color="#64748b" stop-opacity="0.6" />' +
            '<stop offset="100%" stop-color="#1e293b" stop-opacity="0.9" />' +
          '</linearGradient>' +
        '</defs>' +
        '<!-- Внешнее кольцо медальона -->' +
        '<circle cx="250" cy="250" r="235" stroke="url(#wiWolfSteel)" stroke-width="4" stroke-dasharray="14 8" opacity="0.6" />' +
        '<circle cx="250" cy="250" r="220" stroke="#f59e0b" stroke-width="1.5" opacity="0.4" />' +
        '<!-- Уши Волка -->' +
        '<polygon points="250,110 180,40 195,150" fill="url(#wiWolfSteel)" stroke="#cbd5e1" stroke-width="2" />' +
        '<polygon points="250,110 320,40 305,150" fill="url(#wiWolfSteel)" stroke="#cbd5e1" stroke-width="2" />' +
        '<!-- Череп и скулы -->' +
        '<polygon points="250,110 195,150 140,210 210,230 250,180" fill="url(#wiWolfSteel)" stroke="#94a3b8" stroke-width="2" />' +
        '<polygon points="250,110 305,150 360,210 290,230 250,180" fill="url(#wiWolfSteel)" stroke="#94a3b8" stroke-width="2" />' +
        '<!-- Лоб и переносица -->' +
        '<polygon points="250,180 210,230 250,290 290,230" fill="url(#wiWolfSteel)" stroke="#f59e0b" stroke-width="2" />' +
        '<!-- Морда и нос -->' +
        '<polygon points="250,290 215,360 250,420 285,360" fill="url(#wiWolfSteel)" stroke="#cbd5e1" stroke-width="2" />' +
        '<!-- Глаза (Пылающий янтарь) -->' +
        '<polygon points="205,215 235,225 220,238" fill="#f59e0b" filter="url(#wiEyeGlow)" />' +
        '<polygon points="295,215 265,225 280,238" fill="#f59e0b" filter="url(#wiEyeGlow)" />' +
        '<circle cx="220" cy="225" r="3" fill="#ff4500" />' +
        '<circle cx="280" cy="225" r="3" fill="#ff4500" />' +
        '<!-- Клыки и челюсть -->' +
        '<polygon points="215,360 170,390 200,410 220,380" fill="url(#wiWolfSteel)" stroke="#94a3b8" stroke-width="1.5" />' +
        '<polygon points="285,360 330,390 300,410 280,380" fill="url(#wiWolfSteel)" stroke="#94a3b8" stroke-width="1.5" />' +
        '<polygon points="220,380 230,440 245,395" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />' +
        '<polygon points="280,380 270,440 255,395" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />' +
      '</svg>';
    },

    buildThemeFx: function(cont){
      if(!cont) return;
      cont.innerHTML = '';

      // 1. Медальон Волка
      var medallionWrap = document.createElement('div');
      medallionWrap.innerHTML = WI.buildWolfMedallionSvg();
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

      // 3. Слои тумана
      var mist1 = document.createElement('div');
      mist1.className = 'wi-mist-layer';
      cont.appendChild(mist1);

      var mist2 = document.createElement('div');
      mist2.className = 'wi-mist-layer wi-mist-layer-2';
      cont.appendChild(mist2);

      // 4. Парящие искры / угли (Игни)
      var emberCount = 24;
      for(var i = 0; i < emberCount; i++){
        var ember = document.createElement('div');
        ember.className = 'wi-ember';
        var size = (Math.random() * 3.5 + 2).toFixed(1);
        var left = (Math.random() * 100).toFixed(1);
        var dur = (Math.random() * 7 + 6).toFixed(1);
        var delay = (-Math.random() * 14).toFixed(1);
        ember.style.width = size + 'px';
        ember.style.height = size + 'px';
        ember.style.left = left + '%';
        ember.style.animationDuration = dur + 's';
        ember.style.animationDelay = delay + 's';
        if(Math.random() > 0.6){
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
      if(cont.children.length === 0 || !cont.querySelector('.wi-bg-signs img')){
        WI.buildThemeFx(cont);
      }
      cont.style.display = 'block';
    },

    applyWitcherTheme: function(){
      if(typeof document === 'undefined' || !document.body) return;
      var fx = document.getElementById('wiThemeFx');
      if(typeof HB === 'undefined' || HB.mode !== 'wi'){
        document.body.classList.remove('wi-theme');
        if(fx) fx.style.display = 'none';
        return;
      }
      document.body.classList.add('wi-theme');
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
          '<span class="wi-stat-badge hp">❤️ ' + p.hp + '/' + p.maxHp + ' HP</span>' +
          '<span class="wi-stat-badge ac">🛡️ КБ ' + p.ac + '</span>' +
          '<button class="wi-hud-edit-btn" data-nav="wiData" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiData\');" title="Перейти к анкете и списку персонажей в Данные">⚙️ Ростер</button>' +
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

    // Системные разделы: Способности, Приёмы, Карта мира, Справочник и Данные
    var sectionsList = '<div class="menu-list grid-2" style="margin-top:10px;">' +
      '<div class="wi-card wi-card-clickable" data-nav="wiTechs" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechs\');" role="button" tabindex="0" title="Открыть Способности">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wi-card-title"><span>✨</span> Способности</div>' +
          '<div class="wi-card-desc">Знаки ведьмаков, магия Хаоса, врождённые дары, мутации и чародейство</div>' +
        '</div>' +
        '<div class="wi-card-arrow">→</div>' +
      '</div>' +
      '<div class="wi-card wi-card-clickable" data-nav="wiMoves" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoves\');" role="button" tabindex="0" title="Открыть Боевые приёмы">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wi-card-title"><span>⚔️</span> Боевые приёмы</div>' +
          '<div class="wi-card-desc">Стили фехтования, пируэты, парирование, тактические маневры и рипост</div>' +
        '</div>' +
        '<div class="wi-card-arrow">→</div>' +
      '</div>' +
      '<div class="wi-card wi-card-clickable" data-nav="wiMap" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMap\');" role="button" tabindex="0" title="Открыть Карту Континента">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wi-card-title"><span>🗺️</span> Карта мира</div>' +
          '<div class="wi-card-desc">Интерактивный атлас Континента, королевства, маршруты и калькулятор переходов</div>' +
        '</div>' +
        '<div class="wi-card-arrow">→</div>' +
      '</div>' +
      '<div class="wi-card wi-card-clickable" data-nav="wiRef" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiRef\');" role="button" tabindex="0" title="Открыть Справочник Континента">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wi-card-title"><span>📚</span> Справочник Континента</div>' +
          '<div class="wi-card-desc">Знаки, 7 ведьмачьих школ, алхимия, масла, бестиарий чудовищ, фехтование и лор</div>' +
        '</div>' +
        '<div class="wi-card-arrow">→</div>' +
      '</div>' +
      '<div class="wi-card wi-card-clickable" data-nav="wiData" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiData\');" role="button" tabindex="0" title="Открыть Данные и Ростер">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wi-card-title"><span>💾</span> Данные и Ростер</div>' +
          '<div class="wi-card-desc">Профиль персонажа, происхождение/школа, сталь и серебро, экипировка и экспорт</div>' +
        '</div>' +
        '<div class="wi-card-arrow">→</div>' +
      '</div>' +
    '</div>';

    return hud + rule + heroDice + label + sectionsList;
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

    return crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Данные' }]) +
      '<button class="back" data-nav="wiHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiHome\');">← Назад</button>' +
      '<h1>Данные и Ростер Персонажей</h1>' +

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
              '<label>Очки здоровья (HP)</label>' +
              '<input type="number" id="wiDataInHp" class="wi-input" value="' + escA(p.hp != null ? p.hp : '20') + '" placeholder="20">' +
            '</div>' +
            '<div class="wi-edit-item">' +
              '<label>Максимум HP</label>' +
              '<input type="number" id="wiDataInMaxHp" class="wi-input" value="' + escA(p.maxHp != null ? p.maxHp : '20') + '" placeholder="20">' +
            '</div>' +
            '<div class="wi-edit-item">' +
              '<label>Класс брони (КБ)</label>' +
              '<input type="number" id="wiDataInAc" class="wi-input" value="' + escA(p.ac != null ? p.ac : '10') + '" placeholder="10">' +
            '</div>' +
            '<div class="wi-edit-item">' +
              '<label>Энергия знаков / Выносливость</label>' +
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
        p.maxHp = parseInt(v('wiDataInMaxHp'), 10) || 20;
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
        var payload = {
          kind: 'witcher',
          version: 1,
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
              WI.profiles = data.profiles;
              WI.activeProfileId = data.activeProfileId || data.profiles[0].id;
              WI.saveProfiles();
            }
            if(data.meta){
              WI.meta = data.meta;
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

  var DEFAULT_WI_TECHS = [];
  var DEFAULT_WI_MOVES = [];
  var OLD_DEFAULT_TECH_IDS = ['wi_tech_aard', 'wi_tech_igni', 'wi_tech_quen', 'wi_tech_axii', 'wi_tech_yrden', 'wi_tech_heliotrop', 'wi_tech_alzurs_thunder', 'wi_tech_fireball', 'wi_tech_portal', 'wi_tech_euphoria', 'wi_tech_warcry', 'wi_tech_bard_mock'];
  var OLD_DEFAULT_MOVE_IDS = ['wi_move_whirl', 'wi_move_rend', 'wi_move_pirouette', 'wi_move_riposte', 'wi_move_deflect', 'wi_move_shield_bash', 'wi_move_low_sweep', 'wi_move_aimed_shot'];

  var WI_MAP_LOCATIONS = [
    { id: 'novigrad', name: 'Вольный Город Новиград', x: 330, y: 190, icon: '🏰', region: 'Редания / Вольный город', desc: 'Крупнейший торговый мегаполис Континента, порт Великого Моря, цитадель культа Вечного Огня.' },
    { id: 'vizima', name: 'Вызима', x: 370, y: 260, icon: '👑', region: 'Темерия', desc: 'Столица Темерии на берегу озера Вызима. Королевский замок Фольтеста, Храмовый квартал и Купеческий район.' },
    { id: 'oxenfurt', name: 'Оксенфурт', x: 420, y: 220, icon: '🎓', region: 'Редания', desc: 'Город студентов, алхимиков и поэтов на реке Понтар. Знаменитая Оксенфуртская академия.' },
    { id: 'kaer_morhen', name: 'Каэр Морхен', x: 620, y: 110, icon: '🐺', region: 'Синие Горы (Каэдвен)', desc: 'Крепость Старого Моря в уединенном ущелье Синих Гор. Древняя цитадель Школы Волка.' },
    { id: 'beauclair', name: 'Боклер (Beauclair)', x: 490, y: 450, icon: '🍇', region: 'Туссент', desc: 'Сказочная столица княжества Туссент. Эльфский дворец Сансетре, рыцарские турниры и легендарные виноградники.' },
    { id: 'vengerberg', name: 'Венгерберг', x: 530, y: 250, icon: '🔮', region: 'Аэдирн', desc: 'Столица Аэдирна и родина чародейки Йеннифэр. Крупный торговый и ремесленный узел.' },
    { id: 'kaer_trolde', name: 'Каэр Трольде', x: 130, y: 260, icon: '⛵', region: 'Острова Скеллиге', desc: 'Неприступная цитадель ярлов клана ан Крайт на отвесной скале острова Ард Скеллиг.' },
    { id: 'cintra', name: 'Цинтра', x: 310, y: 350, icon: '🦁', region: 'Королевство Цинтра', desc: 'Древняя столица королевства Цинтра на южном берегу устья реки Яруга. Родина княжны Цириллы.' },
    { id: 'tretegor', name: 'Третогор', x: 460, y: 160, icon: '🏛️', region: 'Редания', desc: 'Официальная столица Редании, резиденция королей и тайной службы Сигизмунда Дийкстры.' },
    { id: 'blaviken', name: 'Блавикен', x: 330, y: 110, icon: '⚔️', region: 'Редания', desc: 'Приморский городок, где Геральт получил прозвище «Мясник из Блавикена» в схватке с бандой Ренфри.' },
    { id: 'pont_vannis', name: 'Понт Ваннис', x: 390, y: 50, icon: '💎', region: 'Ковир и Повисс', desc: 'Зимняя столица Ковира, вырубленная в гранитных скалах. Центр мировой добычи золота и соли.' },
    { id: 'nilfgaard_city', name: 'Город Золотых Башен', x: 480, y: 570, icon: '☀️', region: 'Империя Нильфгаард', desc: 'Сердце Империи Великого Солнца на реке Альба. Императорский дворец Эмгыра вар Эмрейса.' }
  ];

  var WI_MAP_REGIONS = [
    { id: 'temeria', name: 'Темерия (Temeria)', capital: 'Вызима', ruler: 'Король Фольтест', color: '#1d4ed8', desc: 'Одно из могущественнейших королевств Севера под знаменем серебряных лилий. Развитая торговля, река Понтар и прославленный спецотряд Синих Полосок.' },
    { id: 'redania', name: 'Редания (Redania)', capital: 'Третогор', ruler: 'Король Радовид V', color: '#b91c1c', desc: 'Богатейшая хлебная держава со знаком белого орла. Включает торговый порт Новиград и университетский Оксенфурт. Сильнейшая тайная служба.' },
    { id: 'kaedwen', name: 'Каэдвен (Kaedwen)', capital: 'Ард Каррайг', ruler: 'Король Хенсельт', color: '#4338ca', desc: 'Крупнейшее по территории северное лесное королевство. Суровые зимы, Синие Горы, долина Гвенллех и развалины Каэр Морхена.' },
    { id: 'aedirn', name: 'Аэдирн (Aedirn)', capital: 'Венгерберг', ruler: 'Король Демавенд III', color: '#b45309', desc: 'Индустриальное и сельскохозяйственное сердце Севера. Плодородная долина Дол Блатанна и кузницы на границе с Махакамом.' },
    { id: 'skellige', name: 'Острова Скеллиге', capital: 'Каэр Трольде', ruler: 'Бран Туирсеах / Крах ан Крайт', color: '#0e7490', desc: 'Суровый океанский архипелаг бесстрашных мореходов, ярлов, друидов и кланов, поклоняющихся богине Фрейе и Хемдаллю.' },
    { id: 'nilfgaard', name: 'Империя Нильфгаард', capital: 'Город Золотых Башен', ruler: 'Эмгыр вар Эмрейс', color: '#3f3f46', desc: 'Южная империя Белого Пламени с несокрушимыми легионами, железным законом, вассальными княжествами и символом Великого Золотого Солнца.' },
    { id: 'toussaint', name: 'Княжество Туссент', capital: 'Боклер', ruler: 'Княгиня Анна-Генриетта', color: '#7e22ce', desc: 'Вассальное сказочное княжество под сенью горы Горгона. Земля странствующих рыцарей, беспечных празднеств, турниров и благородного вина.' },
    { id: 'mahakam', name: 'Махакам', capital: 'Карбон', ruler: 'Старейшина Брувер Гоог', color: '#475569', desc: 'Горная твердыня краснолюдов и гномов. Центр металлургии высочайшего класса, где куются лучшие мечи Континента.' },
    { id: 'brokilon', name: 'Лес Брокилон', capital: 'Дуэн Канэлл', ruler: 'Владычица Эитнэ', color: '#15803d', desc: 'Древний заповедный первобытный лес дриад. Смертоносные лучницы убивают любого чужака, ступившего за пограничные ленты.' },
    { id: 'kovir', name: 'Ковир и Повисс', capital: 'Понт Ваннис', ruler: 'Король Эстерид Тиссенид', color: '#0284c7', desc: 'Самое богатое королевство крайнего Севера. 80% мировой добычи золота, нейтралитет в войнах и непревзойденный наемный флот.' }
  ];

  var WI_MAP_PRESETS = [
    { from: 'novigrad', to: 'vizima', dist: 130, daysHorse: 3, daysFoot: 7, desc: 'Королевский тракт через реку Понтар. Оживленный торговый путь с частыми корчмами и патрулями.' },
    { from: 'vizima', to: 'kaer_morhen', dist: 460, daysHorse: 12, daysFoot: 24, desc: 'Долгий и суровый путь в Синие Горы Каэдвена через глухие леса и переправы через реку Гвенллех.' },
    { from: 'oxenfurt', to: 'beauclair', dist: 540, daysHorse: 14, daysFoot: 28, desc: 'Переход на юг через долину Яруги, Содден и предгорья Амелл в сказочный солнечный Туссент.' },
    { from: 'novigrad', to: 'kaer_trolde', dist: 380, daysHorse: 6, daysFoot: 14, desc: 'Морской маршрут из порта Новиграда через Великое Море на архипелаг Скеллиге.' },
    { from: 'vizima', to: 'cintra', dist: 220, daysHorse: 5, daysFoot: 11, desc: 'Южный тракт к устью Яруги через земли Нижней Соддении в королевство Цинтра.' }
  ];

  var WI_MAP_ENCOUNTERS = [
    { title: '🐺 Волчья засада в тумане', desc: 'Из ночного болотного тумана на обочину выскакивает стая одичавших волков во главе с матерым варгом.' },
    { title: '🧟 Утопцы у брода', desc: 'У разрушенного моста через ручей копошатся четыре утопца и мерзкая Водная баба, швыряющаяся грязью.' },
    { title: '⚔️ Застава дезертиров', desc: 'Шайка бывших солдат «Ганзы» перегородила тракт бревнами и требует 20 крон «подорожного налога».' },
    { title: '🍺 Придорожная корчма «Под дубом»', desc: 'Дым из трубы, теплый очаг, махакамский эль, бродячий бард и доска со свежими заказами на чудовищ.' },
    { title: '👻 Полуденница над полями', desc: 'В полдень над залитым солнцем золотым полем колышется полупрозрачный призрак невесты в рваном венке.' },
    { title: '🔮 Странствующий друид', desc: 'Седой друид у священного менгира предлагает целебные травы в обмен на редкие алхимические ингредиенты.' },
    { title: '🛡️ Разъезд Синих Полосок', desc: 'Конный патруль темерского спецназа проверяет подорожные грамоты в поисках шпионов Нильфгаарда.' },
    { title: '🐉 Тень виверны в небе', desc: 'Огромная чешуйчатая виверна делает круги над трактом, высматривая отбившихся лошадей.' }
  ];

  /* Расширение методов WI */
  WI.techs = [];
  WI.moves = [];
  WI.techFilter = 'all';
  WI.techSearch = '';
  WI.moveFilter = 'all';
  WI.moveSearch = '';
  WI.map = {
    mode: 'inspect',
    zoom: 1,
    cx: 400,
    cy: 325,
    selectedLocId: 'novigrad',
    selectedRegionId: null,
    userMarkers: [],
    routeFrom: 'novigrad',
    routeTo: 'vizima',
    showLabels: true,
    showVillages: true,
    showUserMarkers: true,
    encounter: null,
    search: ''
  };

  WI.loadTechs = function(){
    try {
      var raw = localStorage.getItem(WI_TECHS_KEY);
      if(raw){
        var arr = JSON.parse(raw);
        if(Array.isArray(arr)){
          WI.techs = arr.filter(function(t){ return t && OLD_DEFAULT_TECH_IDS.indexOf(t.id) === -1; });
          WI.saveTechs();
          return WI.techs;
        }
      }
    } catch(e){}
    WI.techs = [];
    return WI.techs;
  };

  WI.saveTechs = function(){
    try {
      localStorage.setItem(WI_TECHS_KEY, JSON.stringify(WI.techs || []));
    } catch(e){}
  };

  WI.getTechById = function(id){
    if(!WI.techs) WI.loadTechs();
    return (WI.techs || []).find(function(t){ return t.id === id; });
  };

  WI.loadMoves = function(){
    try {
      var raw = localStorage.getItem(WI_MOVES_KEY);
      if(raw){
        var arr = JSON.parse(raw);
        if(Array.isArray(arr)){
          WI.moves = arr.filter(function(m){ return m && OLD_DEFAULT_MOVE_IDS.indexOf(m.id) === -1; });
          WI.saveMoves();
          return WI.moves;
        }
      }
    } catch(e){}
    WI.moves = [];
    return WI.moves;
  };

  WI.saveMoves = function(){
    try {
      localStorage.setItem(WI_MOVES_KEY, JSON.stringify(WI.moves || []));
    } catch(e){}
  };

  WI.getMoveById = function(id){
    if(!WI.moves) WI.loadMoves();
    return (WI.moves || []).find(function(m){ return m.id === id; });
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

  /* Общий переключатель вкладок Способности / Приёмы */
  function renderWiAbilitiesTabBar(activeTab){
    return '<div class="wi-nav-tabs" style="display:flex;gap:8px;margin-bottom:18px;border-bottom:1px solid var(--wi-border);padding-bottom:10px;">' +
      '<button class="wi-nav-tab ' + (activeTab === 'techs' ? 'active' : '') + '" data-nav="wiTechs" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechs\');">✨ Способности и Магия</button>' +
      '<button class="wi-nav-tab ' + (activeTab === 'moves' ? 'active' : '') + '" data-nav="wiMoves" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoves\');">⚔️ Боевые приёмы</button>' +
    '</div>';
  }

  /* Экран СПОСОБНОСТИ (wiTechs) */
  function wiTechs(){
    if(!WI.techs || !WI.techs.length) WI.loadTechs();
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
          '<button class="btn btn-ghost" data-nav="wiTechView:' + escA(t.id) + '" style="font-size:11px;padding:3px 8px;">Подробнее</button>' +
          '<button class="btn btn-ghost" data-nav="wiTechEdit:' + escA(t.id) + '" style="font-size:11px;padding:3px 8px;">✏️</button>' +
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
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">' +
          '<button class="btn btn-ghost" data-nav="wiTechs" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiTechs\');">Отмена</button>' +
          '<button class="btn btn-primary" id="wiEdTechSaveBtn" data-tech-id="' + escA(t.id) + '">💾 Сохранить способность</button>' +
        '</div>' +
      '</div>';
  }

  /* Экран БОЕВЫЕ ПРИЁМЫ (wiMoves) */
  function wiMoves(){
    if(!WI.moves || !WI.moves.length) WI.loadMoves();
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
          '<button class="btn btn-ghost" data-nav="wiMoveView:' + escA(m.id) + '" style="font-size:11px;padding:3px 8px;">Подробнее</button>' +
          '<button class="btn btn-ghost" data-nav="wiMoveEdit:' + escA(m.id) + '" style="font-size:11px;padding:3px 8px;">✏️</button>' +
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
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">' +
          '<button class="btn btn-ghost" data-nav="wiMoves" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiMoves\');">Отмена</button>' +
          '<button class="btn btn-primary" id="wiEdMoveSaveBtn" data-move-id="' + escA(m.id) + '">💾 Сохранить приём</button>' +
        '</div>' +
      '</div>';
  }

  /* ============================================================
     ИНТЕРАКТИВНАЯ КАРТА КОНТИНЕНТА (WITCHER MAP)
     ============================================================ */

  function renderWitcherMapSvg(){
    var m = WI.map;
    var z = m.zoom || 1;
    var cx = m.cx || 400;
    var cy = m.cy || 325;
    var vbW = 800 / z;
    var vbH = 650 / z;
    var minX = cx - vbW / 2;
    var minY = cy - vbH / 2;

    var selLoc = WI_MAP_LOCATIONS.find(function(l){ return l.id === m.selectedLocId; });
    var selReg = WI_MAP_REGIONS.find(function(r){ return r.id === m.selectedRegionId; });

    // 1. Океан и рельеф континента
    var bgSvg = '<rect x="-1000" y="-1000" width="3000" height="3000" fill="#070c14" />' +
      '<pattern id="wiOceanGrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56,189,248,0.03)" stroke-width="1"/></pattern>' +
      '<rect x="-1000" y="-1000" width="3000" height="3000" fill="url(#wiOceanGrid)" />';

    // Основная береговая линия Континента
    var continentLand = '<path d="M 180,20 Q 280,30 350,20 Q 450,15 650,20 Q 750,80 770,250 Q 780,450 760,630 L 320,630 Q 300,550 330,480 Q 280,400 310,340 Q 240,320 230,240 Q 260,200 240,160 Q 200,120 180,20 Z" fill="#0f1520" stroke="#334155" stroke-width="2" />';

    // Архипелаг Скеллиге
    var skelligeIsles = '<g id="wiSkelligeGroup">' +
      '<path d="M 110,240 Q 140,230 150,260 Q 135,290 115,280 Z" fill="#155e75" stroke="#38bdf8" stroke-width="1.5" />' +
      '<path d="M 140,210 Q 160,205 165,220 Q 150,230 138,220 Z" fill="#155e75" stroke="#38bdf8" stroke-width="1.2" />' +
      '<path d="M 90,260 Q 105,255 105,275 Q 90,280 85,270 Z" fill="#155e75" stroke="#38bdf8" stroke-width="1" />' +
      '<text x="125" y="305" fill="#7dd3fc" font-size="10" font-family="Cinzel,serif" text-anchor="middle" font-weight="700">СКЕЛЛИГЕ</text>' +
    '</g>';

    // Реки (Яруга, Понтар, Гвенллех, Альба)
    var rivers = '<g stroke="#38bdf8" fill="none" opacity="0.75">' +
      // Яруга (граница Севера и Юга)
      '<path d="M 310,350 Q 380,340 450,335 Q 560,330 650,310 Q 750,300 770,305" stroke-width="3" />' +
      // Понтар (Темерия / Редания)
      '<path d="M 325,195 Q 370,210 420,220 Q 480,215 540,230 Q 600,240 680,220" stroke-width="2.5" />' +
      // Гвенллех (Каэр Морхен)
      '<path d="M 620,110 Q 580,140 550,170 Q 540,230 540,230" stroke-width="1.8" />' +
      // Альба (Нильфгаард)
      '<path d="M 480,570 Q 520,530 550,490 Q 620,460 700,450" stroke-width="2.5" />' +
    '</g>';

    // Горы (Синие горы, Махакам, Амелл)
    var mountains = '<g fill="none" stroke="#64748b" stroke-width="1.5" opacity="0.6">' +
      // Синие горы (восток)
      '<path d="M 640,60 L 650,45 L 660,60 M 655,75 L 665,55 L 675,75 M 680,100 L 690,80 L 700,100 M 710,130 L 720,110 L 730,130 M 720,170 L 730,150 L 740,170" />' +
      // Махакам (центр)
      '<path d="M 450,260 L 460,245 L 470,260 M 465,275 L 475,255 L 485,275 M 460,295 L 470,280 L 480,295" />' +
      // Хребет Амелл (юг)
      '<path d="M 400,420 L 415,400 L 430,420 M 435,430 L 450,410 L 465,430 M 470,440 L 485,420 L 500,440" />' +
    '</g>';

    // Подсветка выбранного региона
    var regionHighlights = WI_MAP_REGIONS.map(function(reg){
      var isSel = m.selectedRegionId === reg.id;
      return '<path class="wi-map-region ' + (isSel ? 'active' : '') + '" data-region-id="' + reg.id + '" style="cursor:pointer;" />';
    }).join('');

    // Отрисовка маршрута, если активен режим маршрутов
    var routeSvg = '';
    if(m.mode === 'route' && m.routeFrom && m.routeTo){
      var p1 = WI_MAP_LOCATIONS.find(function(l){ return l.id === m.routeFrom; });
      var p2 = WI_MAP_LOCATIONS.find(function(l){ return l.id === m.routeTo; });
      if(p1 && p2){
        routeSvg = '<line x1="' + p1.x + '" y1="' + p1.y + '" x2="' + p2.x + '" y2="' + p2.y + '" stroke="#fbbf24" stroke-width="3" stroke-dasharray="6,4" opacity="0.9">' +
          '<animate attributeName="stroke-dashoffset" values="20;0" dur="1.2s" repeatCount="indefinite" />' +
        '</line>';
      }
    }

    // Города и ключевые пункты
    var pinsSvg = WI_MAP_LOCATIONS.map(function(loc){
      var isSel = m.selectedLocId === loc.id;
      return '<g class="wi-map-pin ' + (isSel ? 'selected' : '') + '" data-loc-id="' + loc.id + '" transform="translate(' + loc.x + ',' + loc.y + ')" style="cursor:pointer;">' +
        '<circle r="' + (isSel ? '14' : '9') + '" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" stroke-width="1.5">' +
          (isSel ? '<animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />' : '') +
        '</circle>' +
        '<circle r="4" fill="#fbbf24" />' +
        (m.showLabels !== false ? ('<text y="18" fill="#e2e8f0" font-size="10.5" font-family="Cinzel,serif" font-weight="700" text-anchor="middle" filter="drop-shadow(0 1px 3px #000)">' + esc(loc.name) + '</text>') : '') +
      '</g>';
    }).join('');

    // Пользовательские метки
    var userPinsSvg = (m.showUserMarkers !== false ? (m.userMarkers || []).map(function(um){
      return '<g class="wi-user-marker" data-user-marker-id="' + um.id + '" transform="translate(' + um.x + ',' + um.y + ')" style="cursor:pointer;">' +
        '<circle r="10" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="1.5" />' +
        '<text y="4" text-anchor="middle" font-size="11">' + (um.icon || '📍') + '</text>' +
        (m.showLabels !== false ? ('<text y="20" fill="#fca5a5" font-size="9.5" text-anchor="middle" font-weight="600" filter="drop-shadow(0 1px 2px #000)">' + esc(um.title || 'Метка') + '</text>') : '') +
      '</g>';
    }).join('') : '');

    return '<svg id="wiMapSvg" viewBox="' + minX + ' ' + minY + ' ' + vbW + ' ' + vbH + '" width="100%" height="100%" style="display:block;touch-action:none;user-select:none;">' +
      bgSvg + continentLand + skelligeIsles + rivers + mountains + regionHighlights + routeSvg + pinsSvg + userPinsSvg +
    '</svg>';
  }

  /* Экран КАРТА МИРА (wiMap) */
  function wiMap(){
    var m = WI.map;
    if(!m.userMarkers || !m.userMarkers.length) WI.loadUserMarkers();

    var markersCount = (m.userMarkers || []).length;

    var curLoc = WI_MAP_LOCATIONS.find(function(l){ return l.id === m.selectedLocId; }) || WI_MAP_LOCATIONS[0];
    var curReg = WI_MAP_REGIONS.find(function(r){ return r.id === m.selectedRegionId; });

    // Инспектор локации/региона/маршрута
    var inspectorHtml = '';

    if(m.mode === 'inspect'){
      inspectorHtml = '<div class="wi-char-sheet-card" style="margin-top:14px;">' +
        '<div class="wi-char-header">' +
          '<span>' + (curLoc.icon || '🏰') + ' <b>' + esc(curLoc.name) + '</b></span>' +
          '<span class="wi-school-badge" style="font-size:11px;">' + esc(curLoc.region) + '</span>' +
        '</div>' +
        '<div class="desc" style="margin-top:8px;font-size:13px;line-height:1.5;">' + esc(curLoc.desc) + '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">' +
          '<button class="btn btn-primary" id="wiMapSetRouteDestBtn" data-loc-id="' + curLoc.id + '">🧭 Проложить путь сюда</button>' +
          '<button class="btn btn-ghost" id="wiMapSetRouteOriginBtn" data-loc-id="' + curLoc.id + '">🏁 Начать маршрут отсюда</button>' +
        '</div>' +
      '</div>';
    } else if(m.mode === 'route'){
      var curPreset = WI_MAP_PRESETS.find(function(p){ return p.from === m.routeFrom && p.to === m.routeTo; }) || {
        dist: 250, daysHorse: 6, daysFoot: 13, desc: 'Пользовательский тракт через земли Континента.'
      };

      var locFrom = WI_MAP_LOCATIONS.find(function(l){ return l.id === m.routeFrom; }) || WI_MAP_LOCATIONS[0];
      var locTo = WI_MAP_LOCATIONS.find(function(l){ return l.id === m.routeTo; }) || WI_MAP_LOCATIONS[1];

      var encHtml = m.encounter ? ('<div style="background:rgba(245,158,11,0.12);border:1px solid var(--wi-amber);border-radius:6px;padding:12px;margin-top:10px;">' +
        '<div style="font-weight:700;color:#fbbf24;margin-bottom:4px;">' + esc(m.encounter.title) + '</div>' +
        '<div style="font-size:13px;line-height:1.45;color:var(--wi-silver);">' + esc(m.encounter.desc) + '</div>' +
      '</div>') : '';

      inspectorHtml = '<div class="wi-char-sheet-card" style="margin-top:14px;">' +
        '<div class="wi-char-header">' +
          '<span>🧭 Калькулятор переходов Континента</span>' +
          '<span class="wi-school-badge" style="font-size:11px;">' + curPreset.dist + ' миль</span>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:10px;margin-top:10px;">' +
          '<div>' +
            '<label style="font-size:11px;color:var(--wi-steel);font-weight:600;">Откуда:</label>' +
            '<select id="wiMapRouteFromSel" class="wi-input">' +
              WI_MAP_LOCATIONS.map(function(l){ return '<option value="' + l.id + '" ' + (l.id === m.routeFrom ? 'selected' : '') + '>' + l.icon + ' ' + esc(l.name) + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label style="font-size:11px;color:var(--wi-steel);font-weight:600;">Куда:</label>' +
            '<select id="wiMapRouteToSel" class="wi-input">' +
              WI_MAP_LOCATIONS.map(function(l){ return '<option value="' + l.id + '" ' + (l.id === m.routeTo ? 'selected' : '') + '>' + l.icon + ' ' + esc(l.name) + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;font-size:13px;">' +
          '<div style="background:rgba(255,255,255,0.04);border:1px solid var(--wi-border);padding:8px 12px;border-radius:4px;">🐎 <b>На коне:</b> ' + curPreset.daysHorse + ' дн.</div>' +
          '<div style="background:rgba(255,255,255,0.04);border:1px solid var(--wi-border);padding:8px 12px;border-radius:4px;">🥾 <b>Пешком:</b> ' + curPreset.daysFoot + ' дн.</div>' +
          '<div style="background:rgba(255,255,255,0.04);border:1px solid var(--wi-border);padding:8px 12px;border-radius:4px;">🍖 <b>Провиант:</b> ' + (curPreset.daysHorse * 2) + ' рационов</div>' +
        '</div>' +
        '<div class="desc" style="margin-top:8px;font-size:12.5px;">' + esc(curPreset.desc) + '</div>' +
        '<div style="margin-top:10px;">' +
          '<button class="btn btn-primary" id="wiMapRollEncounterBtn">🎲 Случайная встреча на тракте</button>' +
        '</div>' +
        encHtml +
      '</div>';
    } else if(m.mode === 'markers'){
      inspectorHtml = '<div class="wi-char-sheet-card" style="margin-top:14px;">' +
        '<div class="wi-char-header">' +
          '<span>📍 Тактические метки ведьмака (' + markersCount + ')</span>' +
          '<button class="btn btn-primary" id="wiMapAddMarkerOpenBtn" style="font-size:11px;padding:3px 8px;">➕ Добавить метку в центр</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:8px;margin-top:10px;">' +
          (m.userMarkers && m.userMarkers.length ? m.userMarkers.map(function(um){
            return '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wi-border);border-radius:4px;padding:8px;display:flex;justify-content:space-between;align-items:center;gap:6px;">' +
              '<div>' +
                '<div style="font-weight:700;font-size:12.5px;color:#fff;">' + (um.icon || '📍') + ' ' + esc(um.title || 'Метка') + '</div>' +
                '<div style="font-size:11px;color:var(--wi-steel);">' + esc(um.desc || '') + '</div>' +
              '</div>' +
              '<button class="btn btn-ghost" data-wi-del-marker="' + um.id + '" style="font-size:11px;padding:2px 6px;color:#ef4444;">🗑️</button>' +
            '</div>';
          }).join('') : '<div class="char-empty" style="grid-column:1/-1;">Нет меток. Нажмите кнопку выше, чтобы отметить логово чудовища или тайник.</div>') +
        '</div>' +
      '</div>';
    }

    return crumbWi([{ label: 'Ведьмак', nav: 'wiHome' }, { label: 'Карта мира' }]) +
      '<button class="back" data-nav="wiHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wiHome\');">← Назад</button>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
        '<div>' +
          '<h1 style="margin-bottom:4px;">🗺️ Карта Континента</h1>' +
          '<div class="desc" style="margin-bottom:0;">Интерактивный атлас Северных Королевств, Великого Моря и Нильфгаарда, маршруты и путевой журнал.</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
          '<button class="wi-pill ' + (m.mode === 'inspect' ? 'active' : '') + '" id="wiMapModeInspect">🗺️ Атлас</button>' +
          '<button class="wi-pill ' + (m.mode === 'route' ? 'active' : '') + '" id="wiMapModeRoute">🧭 Маршруты</button>' +
          '<button class="wi-pill ' + (m.mode === 'markers' ? 'active' : '') + '" id="wiMapModeMarkers">📍 Метки (' + markersCount + ')</button>' +
        '</div>' +
      '</div>' +
      '<div class="wi-map-container" style="background:#070c14;border:1px solid var(--wi-border);border-radius:6px;overflow:hidden;position:relative;">' +
        '<div class="wi-map-toolbar" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(14,18,24,0.9);border-bottom:1px solid var(--wi-border);flex-wrap:wrap;gap:8px;">' +
          '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:200px;">' +
            '<span style="color:var(--wi-steel);font-size:13px;">🔍</span>' +
            '<input type="text" id="wiMapSearch" class="wi-input" style="padding:4px 8px;font-size:12px;max-width:280px;" placeholder="Поиск города или крепости..." value="' + escA(m.search || '') + '">' +
          '</div>' +
          '<div style="display:flex;gap:6px;align-items:center;">' +
            '<button class="btn btn-ghost" id="wiMapZoomIn" title="Приблизить" style="padding:3px 8px;font-size:12px;">➕</button>' +
            '<button class="btn btn-ghost" id="wiMapZoomOut" title="Отдалить" style="padding:3px 8px;font-size:12px;">➖</button>' +
            '<button class="btn btn-ghost" id="wiMapZoomReset" title="Сбросить масштаб" style="padding:3px 8px;font-size:12px;">⟲ 100%</button>' +
          '</div>' +
        '</div>' +
        '<div class="wi-map-viewport" id="wiMapViewport" style="height:480px;position:relative;cursor:grab;overflow:hidden;">' +
          renderWitcherMapSvg() +
        '</div>' +
      '</div>' +
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

    wireWiNav();
  }

  function wireWiTechView(){
    var delBtn = document.getElementById('wiTechDeleteBtn');
    if(delBtn){
      delBtn.addEventListener('click', function(){
        var id = delBtn.getAttribute('data-tech-id');
        if(!confirm('Удалить эту способность?')) return;
        WI.techs = (WI.techs || []).filter(function(t){ return t.id !== id; });
        WI.saveTechs();
        WI.toast('✓ Способность удалена', 'info');
        if(typeof window.navigate === 'function') window.navigate('wiTechs');
      });
    }
    wireWiNav();
  }

  function wireWiTechEdit(){
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

        var idx = (WI.techs || []).findIndex(function(x){ return x.id === id; });
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

    wireWiNav();
  }

  function wireWiMoveView(){
    var delBtn = document.getElementById('wiMoveDeleteBtn');
    if(delBtn){
      delBtn.addEventListener('click', function(){
        var id = delBtn.getAttribute('data-move-id');
        if(!confirm('Удалить этот боевой приём?')) return;
        WI.moves = (WI.moves || []).filter(function(m){ return m.id !== id; });
        WI.saveMoves();
        WI.toast('✓ Приём удален', 'info');
        if(typeof window.navigate === 'function') window.navigate('wiMoves');
      });
    }
    wireWiNav();
  }

  function wireWiMoveEdit(){
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

        var idx = (WI.moves || []).findIndex(function(x){ return x.id === id; });
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

    // Зум и центрирование
    var btnIn = document.getElementById('wiMapZoomIn');
    if(btnIn){
      btnIn.addEventListener('click', function(){
        m.zoom = Math.min((m.zoom || 1) * 1.3, 4);
        refreshMapSvg();
      });
    }

    var btnOut = document.getElementById('wiMapZoomOut');
    if(btnOut){
      btnOut.addEventListener('click', function(){
        m.zoom = Math.max((m.zoom || 1) / 1.3, 0.7);
        refreshMapSvg();
      });
    }

    var btnReset = document.getElementById('wiMapZoomReset');
    if(btnReset){
      btnReset.addEventListener('click', function(){
        m.zoom = 1;
        m.cx = 400;
        m.cy = 325;
        refreshMapSvg();
      });
    }

    // Клик по метке города/пункта
    document.querySelectorAll('.wi-map-pin').forEach(function(pin){
      pin.addEventListener('click', function(){
        var lid = pin.getAttribute('data-loc-id');
        if(lid){
          m.selectedLocId = lid;
          m.mode = 'inspect';
          if(typeof render === 'function') render();
        }
      });
    });

    // Маршруты: From / To
    var selFrom = document.getElementById('wiMapRouteFromSel');
    if(selFrom){
      selFrom.addEventListener('change', function(){
        m.routeFrom = selFrom.value;
        refreshMapSvg();
      });
    }

    var selTo = document.getElementById('wiMapRouteToSel');
    if(selTo){
      selTo.addEventListener('change', function(){
        m.routeTo = selTo.value;
        refreshMapSvg();
      });
    }

    var setRouteDestBtn = document.getElementById('wiMapSetRouteDestBtn');
    if(setRouteDestBtn){
      setRouteDestBtn.addEventListener('click', function(){
        var id = setRouteDestBtn.getAttribute('data-loc-id');
        m.routeTo = id;
        m.mode = 'route';
        if(typeof render === 'function') render();
      });
    }

    var setRouteOrigBtn = document.getElementById('wiMapSetRouteOriginBtn');
    if(setRouteOrigBtn){
      setRouteOrigBtn.addEventListener('click', function(){
        var id = setRouteOrigBtn.getAttribute('data-loc-id');
        m.routeFrom = id;
        m.mode = 'route';
        if(typeof render === 'function') render();
      });
    }

    var rollEncBtn = document.getElementById('wiMapRollEncounterBtn');
    if(rollEncBtn){
      rollEncBtn.addEventListener('click', function(){
        var rnd = WI_MAP_ENCOUNTERS[Math.floor(Math.random() * WI_MAP_ENCOUNTERS.length)];
        m.encounter = rnd;
        if(typeof render === 'function') render();
      });
    }

    // Метки: добавление и удаление
    var addMarkerBtn = document.getElementById('wiMapAddMarkerOpenBtn');
    if(addMarkerBtn){
      addMarkerBtn.addEventListener('click', function(){
        var title = prompt('Название метки (например: Логово грифона, Заброшенная корчма):');
        if(!title) return;
        var icon = prompt('Иконка-эмодзи (🐺, ⚔️, 🍺, 🔮, 🎒, 🐉):', '🐺') || '📍';
        var desc = prompt('Заметка к метке:') || '';

        var um = {
          id: 'um_' + Date.now(),
          title: title,
          icon: icon,
          desc: desc,
          x: Math.round(m.cx || 400),
          y: Math.round(m.cy || 325)
        };
        m.userMarkers.push(um);
        WI.saveUserMarkers();
        WI.toast('✓ Метка добавлена на карту', 'success');
        if(typeof render === 'function') render();
      });
    }

    document.querySelectorAll('[data-wi-del-marker]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var id = btn.getAttribute('data-wi-del-marker');
        m.userMarkers = (m.userMarkers || []).filter(function(x){ return x.id !== id; });
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
          var found = WI_MAP_LOCATIONS.find(function(l){ return l.name.toLowerCase().indexOf(q) !== -1; });
          if(found){
            m.cx = found.x;
            m.cy = found.y;
            m.selectedLocId = found.id;
            refreshMapSvg();
          }
        }
      });
    }

    // Drag / Pan карты
    var vport = document.getElementById('wiMapViewport');
    if(vport && !vport.__panBound){
      vport.__panBound = true;
      var isDown = false;
      var startX, startY;

      vport.addEventListener('mousedown', function(e){
        isDown = true;
        startX = e.clientX;
        startY = e.clientY;
        vport.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', function(e){
        if(!isDown) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;
        var z = m.zoom || 1;
        m.cx -= dx / z;
        m.cy -= dy / z;
        refreshMapSvg();
      });

      window.addEventListener('mouseup', function(){
        if(isDown){
          isDown = false;
          if(vport) vport.style.cursor = 'grab';
        }
      });

      vport.addEventListener('wheel', function(e){
        e.preventDefault();
        var delta = e.deltaY > 0 ? 0.9 : 1.1;
        m.zoom = Math.max(0.6, Math.min(4, (m.zoom || 1) * delta));
        refreshMapSvg();
      }, { passive: false });
    }

    function refreshMapSvg(){
      var vp = document.getElementById('wiMapViewport');
      if(vp){
        vp.innerHTML = renderWitcherMapSvg();
        wireWiMapPins();
      }
    }

    function wireWiMapPins(){
      document.querySelectorAll('.wi-map-pin').forEach(function(pin){
        pin.addEventListener('click', function(){
          var lid = pin.getAttribute('data-loc-id');
          if(lid){
            m.selectedLocId = lid;
            m.mode = 'inspect';
            if(typeof render === 'function') render();
          }
        });
      });
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

        if(!WI.techs) WI.techs = [];
        WI.techs.unshift(item);
        WI.saveTechs();
        WI.toast('✓ Способность сохранена в ростер!', 'success');
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

        if(!WI.moves) WI.moves = [];
        WI.moves.unshift(item);
        WI.saveMoves();
        WI.toast('✓ Боевой приём сохранен в ростер!', 'success');
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
  window.wireWiHome = wireWiHome;
  window.wireWiNav = wireWiNav;
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
  WI.wireWiHome = wireWiHome;
  WI.wireWiNav = wireWiNav;
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
