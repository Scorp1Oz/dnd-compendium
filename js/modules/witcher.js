/* ============================================================
   ВЕДЬМАК (THE WITCHER) МОДУЛЬ
   ============================================================ */

(function(){
  'use strict';

  var WI = window.WI = {
    getProfile: function(){
      try {
        var raw = localStorage.getItem('wi_profile');
        if(raw){
          var p = JSON.parse(raw);
          if(!p.name) p.name = 'Геральт из Ривии';
          if(!p.school) p.school = 'Школа Волка';
          if(typeof p.level === 'undefined') p.level = 1;
          if(typeof p.hp === 'undefined') p.hp = 45;
          if(typeof p.maxHp === 'undefined') p.maxHp = 45;
          if(typeof p.toxicity === 'undefined') p.toxicity = 0;
          if(typeof p.maxToxicity === 'undefined') p.maxToxicity = 100;
          if(typeof p.ac === 'undefined') p.ac = 16;
          if(!p.stats) p.stats = { str: 16, dex: 16, con: 15, int: 14, wis: 14, cha: 10 };
          return p;
        }
      } catch(e){}

      return {
        name: 'Геральт из Ривии',
        title: 'Белый Волк // Мясник из Блавикена',
        school: 'Школа Волка',
        level: 1,
        hp: 45,
        maxHp: 45,
        toxicity: 0,
        maxToxicity: 100,
        ac: 16,
        stats: { str: 16, dex: 16, con: 15, int: 14, wis: 14, cha: 10 }
      };
    },

    saveProfile: function(p){
      try {
        localStorage.setItem('wi_profile', JSON.stringify(p));
      } catch(e){}
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

      // 2. Фоновые Знаки Ведьмаков
      var signs = document.createElement('div');
      signs.className = 'wi-bg-signs';
      signs.innerHTML = 
        '<div class="wi-bg-sign-rune wi-rune-aard" title="Аард">∇</div>' +
        '<div class="wi-bg-sign-rune wi-rune-igni" title="Игни">Δ</div>' +
        '<div class="wi-bg-sign-rune wi-rune-quen" title="Квен">◊</div>' +
        '<div class="wi-bg-sign-rune wi-rune-axii" title="Аксий">∞</div>' +
        '<div class="wi-bg-sign-rune wi-rune-yrden" title="Ирден">☲</div>';
      cont.appendChild(signs);

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
      if(cont.children.length === 0){
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

  /* Главный экран раздела Ведьмак */
  function wiHome(){
    var p = WI.getProfile();

    // Экран профиля (HUD)
    var hud = '<div class="wi-hud">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">' +
        '<div>' +
          '<div class="wi-title">🐺 ' + escapeHtml(p.name) + '</div>' +
          '<div style="font-family:\'EB Garamond\',serif;font-style:italic;color:#94a3b8;font-size:14px;margin-top:2px;">' +
            escapeHtml(p.title || 'Мясник из Блавикена // Мастер Меча') +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
          '<span class="wi-school-badge">🐺 ' + escapeHtml(p.school) + '</span>' +
          '<span class="wi-stat-badge">Ур. ' + p.level + '</span>' +
          '<span class="wi-stat-badge hp">❤️ ' + p.hp + '/' + p.maxHp + ' HP</span>' +
          '<span class="wi-stat-badge tox">🧪 ' + p.toxicity + '/' + p.maxToxicity + ' Интокс.</span>' +
          '<span class="wi-stat-badge ac">🛡️ КБ ' + p.ac + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';

    var rule = '<div class="wi-rule"></div>';

    // 1. Раздел броска кубиков (кликабельный)
    var heroDice = '<div class="wi-hero-dice" data-go="dice" role="button" tabindex="0" title="Открыть бросок костей">' +
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

    // 2. Кнопка "Данные" (некликабельная пока что)
    var dataBtn = '<div class="menu-list" style="margin-top:10px;">' +
      '<div class="wi-card wi-disabled" aria-disabled="true">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wi-card-title"><span>💾</span> Данные</div>' +
          '<div class="wi-card-desc">Профиль ведьмака, школа, снаряжение и параметры</div>' +
        '</div>' +
        '<div class="wi-lock-badge">🔒 В разработке</div>' +
      '</div>' +
    '</div>';

    return hud + rule + heroDice + label + dataBtn;
  }

  window.wiHome = wiHome;
  window.applyWitcherTheme = WI.applyWitcherTheme;

})();
