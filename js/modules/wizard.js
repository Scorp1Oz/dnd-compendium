/* ============================================================
   ВОЛШЕБНИК (WIZARDING WORLD / HARRY POTTER) МОДУЛЬ
   ============================================================ */

(function(){
  'use strict';

  var WZ_PROFILES_KEY = 'ttc_wz_profiles';
  var WZ_ACTIVE_ID_KEY = 'ttc_wz_active_id';
  var WZ_META_KEY = 'ttc_wz_meta';
  var WZ_SPELLS_KEY = 'ttc_wz_spells';
  var WZ_DUELS_KEY = 'ttc_wz_duels';
  var WZ_SKILLS_KEY = 'ttc_wz_skills';
  var WZ_ROUTE_KEY = 'ttc_wz_route';
  var WZ_MARKERS_KEY = 'ttc_wz_markers';

  // Принудительная очистка устаревших предзаписанных заклинаний и приёмов из localStorage браузера
  try {
    var purgeKey = 'ttc_wz_purge_defaults_v4';
    if(!localStorage.getItem(purgeKey)){
      localStorage.setItem(purgeKey, '1');
      var rawSp = localStorage.getItem(WZ_SPELLS_KEY);
      if(rawSp){
        var listSp = JSON.parse(rawSp);
        if(Array.isArray(listSp)){
          var cleanSp = listSp.filter(function(s){
            if(!s || !s.id) return false;
            if(s.id.match(/^sp_(expelliarmus|protego|stupefy|lumos|wingardium|avada|incendio|accio|sectumsempra|patronum|expecto|alohomora|petrificus)/i)) return false;
            if(!s.id.match(/\d{6,}/) && !s.id.startsWith('wz_sp_')) return false;
            return true;
          });
          localStorage.setItem(WZ_SPELLS_KEY, JSON.stringify(cleanSp));
        }
      }
      var rawDu = localStorage.getItem(WZ_DUELS_KEY);
      if(rawDu){
        var listDu = JSON.parse(rawDu);
        if(Array.isArray(listDu)){
          var cleanDu = listDu.filter(function(d){
            if(!d || !d.id) return false;
            if(d.id.match(/^duel_(protego_reflect|nonverbal_snap|stupefy_disarm|transfig_shield|combat_apparate|wand_feint)/i)) return false;
            if(!d.id.match(/\d{6,}/) && !d.id.startsWith('wz_duel_')) return false;
            return true;
          });
          localStorage.setItem(WZ_DUELS_KEY, JSON.stringify(cleanDu));
        }
      }
    }
  } catch(e){}

  function defaultWizardProfile(){
    return {
      id: 'wz_prof_primary',
      name: '',
      title: '',
      house: '',
      year: '1 курс',
      hp: 20,
      maxHp: 20,
      ac: 10,
      wand: {
        name: '',
        wood: '',
        core: '',
        length: '',
        flexibility: '',
        features: '',
        saved: false
      },
      robe: '',
      relic: '',
      patronus: '',
      galleons: 0,
      sickles: 0,
      knuts: 0,
      inventory: '',
      notes: ''
    };
  }

  function getProfileWand(p){
    p = p || WZ.getActiveProfile();
    var defWand = { name: '', wood: '', core: '', length: '', flexibility: '', features: '', saved: false };
    if(!p) return defWand;
    if(p.wand && typeof p.wand === 'object'){
      return {
        name: p.wand.name || '',
        wood: p.wand.wood || '',
        core: p.wand.core || '',
        length: p.wand.length || '',
        flexibility: p.wand.flexibility || '',
        features: p.wand.features || '',
        saved: !!p.wand.saved
      };
    }
    if(typeof p.wand === 'string' && p.wand.trim()){
      defWand.name = p.wand.trim();
      defWand.saved = true;
    }
    return defWand;
  }

  var WZ = window.WZ = {
    profiles: [],
    activeProfileId: '',
    meta: { name: 'Волшебный мир: Хогвартс', note: 'Книга заклинаний, дуэльный клуб, Карта Мародёров и картотека магов.' },
    map: {
      zoom: 1.0,
      cx: 1200,
      cy: 1150,
      scope: 'hogwarts', // 'hogwarts' (интерьер замка) | 'world' (окрестности и нагорье)
      mode: 'inspect',   // 'inspect' | 'route' | 'markers'
      selectedLocId: 'great_hall',
      showLabels: true,
      routePoints: [],
      travelMode: 'walk',
      travelPace: 'normal',
      userMarkers: [],
      routes: {
        hogwarts: { points: [], travelMode: 'walk', travelPace: 'normal' },
        world: { points: [], travelMode: 'broom', travelPace: 'normal' }
      }
    },

    loadProfiles: function(){
      try {
        var raw = localStorage.getItem(WZ_PROFILES_KEY);
        if(raw){
          var arr = JSON.parse(raw);
          if(Array.isArray(arr) && arr.length > 0){
            // Очищаем предустановленный тестовый профиль если имя не было задано
            arr = arr.map(function(p){
              if(p && !p.name && p.house === 'Гриффиндор' && p.wandWood === 'Остролист' && p.patronus === 'Олень' && p.galleons === 42){
                return defaultWizardProfile();
              }
              return p;
            });
            WZ.profiles = arr;
            var savedActive = localStorage.getItem(WZ_ACTIVE_ID_KEY);
            WZ.activeProfileId = (savedActive && arr.some(function(p){ return p.id === savedActive; })) ? savedActive : arr[0].id;
            return WZ.profiles;
          }
        }
      } catch(e){}

      var def = defaultWizardProfile();
      WZ.profiles = [def];
      WZ.activeProfileId = def.id;
      WZ.saveProfiles();
      return WZ.profiles;
    },

    saveProfiles: function(){
      try {
        localStorage.setItem(WZ_PROFILES_KEY, JSON.stringify(WZ.profiles));
        localStorage.setItem(WZ_ACTIVE_ID_KEY, WZ.activeProfileId);
      } catch(e){}
    },

    getActiveProfile: function(){
      if(!Array.isArray(WZ.profiles) || WZ.profiles.length === 0){
        WZ.loadProfiles();
      }
      var act = WZ.profiles.find(function(p){ return p.id === WZ.activeProfileId; });
      if(!act){
        act = WZ.profiles[0] || defaultWizardProfile();
        WZ.activeProfileId = act.id;
      }
      return act;
    },

    getProfile: function(){
      return WZ.getActiveProfile();
    },

    saveProfile: function(p){
      if(!p || !p.id) return;
      var idx = (WZ.profiles || []).findIndex(function(item){ return item.id === p.id; });
      if(idx !== -1){
        WZ.profiles[idx] = p;
      } else {
        WZ.profiles.push(p);
      }
      WZ.saveProfiles();
    },

    switchProfile: function(newId){
      if(!newId || newId === WZ.activeProfileId) return;
      var next = (WZ.profiles || []).find(function(p){ return p.id === newId; });
      if(next){
        WZ.activeProfileId = newId;
        WZ.saveProfiles();
        if(typeof render === 'function') render();
      }
    },

    createProfile: function(opts){
      var def = defaultWizardProfile();
      def.id = 'wz_prof_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      def.firstName = (opts && opts.firstName) ? opts.firstName : '';
      def.lastName = (opts && opts.lastName) ? opts.lastName : '';
      def.name = (opts && opts.name) ? opts.name : [def.firstName, def.lastName].filter(Boolean).join(' ');
      def.house = (opts && opts.house !== undefined) ? opts.house : '';
      def.title = (opts && opts.title) ? opts.title : '';

      if(!Array.isArray(WZ.profiles)) WZ.profiles = [];
      WZ.profiles.push(def);
      WZ.activeProfileId = def.id;
      WZ.saveProfiles();
      if(typeof render === 'function') render();
      return def;
    },

    cloneProfile: function(id){
      id = id || WZ.activeProfileId;
      var src = (WZ.profiles || []).find(function(p){ return p.id === id; }) || WZ.getActiveProfile();
      if(!src) return null;
      var copy = JSON.parse(JSON.stringify(src));
      copy.id = 'wz_prof_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      copy.firstName = (copy.firstName || copy.name || 'Волшебник');
      copy.lastName = (copy.lastName ? (copy.lastName + ' (Копия)') : '(Копия)');
      copy.name = [copy.firstName, copy.lastName].filter(Boolean).join(' ');
      WZ.profiles.push(copy);
      WZ.activeProfileId = copy.id;
      WZ.saveProfiles();
      if(typeof render === 'function') render();
      return copy;
    },

    deleteProfile: function(id){
      id = id || WZ.activeProfileId;
      if(!Array.isArray(WZ.profiles)) return;
      if(WZ.profiles.length <= 1){
        var fresh = defaultWizardProfile();
        WZ.profiles = [fresh];
        WZ.activeProfileId = fresh.id;
        WZ.saveProfiles();
        if(typeof render === 'function') render();
        return;
      }
      var idx = WZ.profiles.findIndex(function(p){ return p.id === id; });
      if(idx === -1) return;
      WZ.profiles.splice(idx, 1);
      if(WZ.activeProfileId === id){
        WZ.activeProfileId = WZ.profiles[Math.max(0, idx - 1)].id;
      }
      WZ.saveProfiles();
      if(typeof render === 'function') render();
    },

    resetProfile: function(id){
      id = id || WZ.activeProfileId;
      var p = (WZ.profiles || []).find(function(item){ return item.id === id; });
      if(!p) return;
      p.hp = p.maxHp || 20;
      WZ.saveProfiles();
      if(typeof render === 'function') render();
    },

    getMeta: function(){
      try {
        var raw = localStorage.getItem(WZ_META_KEY);
        if(raw){
          var m = JSON.parse(raw);
          if(m && m.name) {
            WZ.meta = m;
            return m;
          }
        }
      } catch(e){}
      return WZ.meta;
    },

    saveMeta: function(meta){
      if(meta) WZ.meta = meta;
      try {
        localStorage.setItem(WZ_META_KEY, JSON.stringify(WZ.meta));
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

    buildThemeFx: function(cont){
      if(!cont) return;
      cont.innerHTML = '';

      // 1. Центральный священный магический реликт: Дары Смерти и Астролябия рун
      var relicDiv = document.createElement('div');
      relicDiv.className = 'wz-bg-relic';
      relicDiv.innerHTML = 
        '<svg viewBox="0 0 600 600" width="100%" height="100%" style="display:block;">' +
          '<defs>' +
            '<filter id="wzRelicGlow" x="-30%" y="-30%" width="160%" height="160%">' +
              '<feGaussianBlur stdDeviation="6" result="blur" />' +
              '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
            '</filter>' +
            '<path id="wzRelicCirclePath" d="M 300,300 m -240,0 a 240,240 0 1,1 480,0 a 240,240 0 1,1 -480,0" />' +
          '</defs>' +
          // Внешнее вращающееся кольцо рун и астролябии
          '<g class="wz-relic-ring-outer">' +
            '<circle cx="300" cy="300" r="275" fill="none" stroke="#d4af37" stroke-width="1.2" stroke-dasharray="10,6,3,6" opacity="0.65" />' +
            '<circle cx="300" cy="300" r="248" fill="none" stroke="#fbbf24" stroke-width="0.8" stroke-dasharray="4,8" opacity="0.45" />' +
            '<circle cx="300" cy="25" r="3.5" fill="#fde047" />' +
            '<circle cx="300" cy="575" r="3.5" fill="#fde047" />' +
            '<circle cx="25" cy="300" r="3.5" fill="#fde047" />' +
            '<circle cx="575" cy="300" r="3.5" fill="#fde047" />' +
            '<path d="M 300 12 L 300 40 M 300 560 L 300 588 M 12 300 L 40 300 M 560 300 L 588 300" stroke="#fde047" stroke-width="1.5" />' +
            '<path d="M 105 105 L 125 125 M 475 475 L 495 495 M 105 495 L 125 475 M 475 125 L 495 105" stroke="#d4af37" stroke-width="1.2" />' +
            '<text font-family="Cinzel, serif" font-size="10.5" fill="#fde047" letter-spacing="3" opacity="0.8">' +
              '<textPath href="#wzRelicCirclePath">✦ LUMOS • NOX • ALOHOMORA • EXPECTO PATRONUM • ACCIO • EXPELLIARMUS ✦</textPath>' +
            '</text>' +
          '</g>' +
          // Мантия-невидимка (Священный Треугольник)
          '<polygon points="300,85 500,430 100,430" fill="none" stroke="#d4af37" stroke-width="3" filter="url(#wzRelicGlow)" />' +
          '<polygon points="300,98 488,422 112,422" fill="none" stroke="#fbbf24" stroke-width="1" stroke-dasharray="6,4" opacity="0.45" />' +
          // Воскрешающий камень (Священный Круг)
          '<circle cx="300" cy="315" r="115" fill="none" stroke="#d4af37" stroke-width="2.5" filter="url(#wzRelicGlow)" />' +
          '<circle cx="300" cy="315" r="108" fill="none" stroke="#fbbf24" stroke-width="1" stroke-dasharray="8,6" opacity="0.5" />' +
          '<circle cx="300" cy="315" r="65" fill="none" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4,4" opacity="0.35" />' +
          // Бузинная палочка (Священная Линия с узлами)
          '<line x1="300" y1="85" x2="300" y2="430" stroke="#d4af37" stroke-width="3" filter="url(#wzRelicGlow)" />' +
          '<circle cx="300" cy="180" r="5" fill="#fde047" />' +
          '<circle cx="300" cy="265" r="6" fill="#fde047" />' +
          '<circle cx="300" cy="315" r="8" fill="#ffffff" filter="url(#wzRelicGlow)" />' +
          '<circle cx="300" cy="365" r="6" fill="#fde047" />' +
        '</svg>';
      cont.appendChild(relicDiv);

      // 2. Слои магической ауры и дымки
      var mistTop = document.createElement('div');
      mistTop.className = 'wz-magic-mist-top';
      cont.appendChild(mistTop);

      var mistBtm = document.createElement('div');
      mistBtm.className = 'wz-magic-mist';
      cont.appendChild(mistBtm);

      // 3. Зачарованный звёздный потолок (мерцающие звёзды)
      var starCount = 35;
      for(var s = 0; s < starCount; s++){
        var star = document.createElement('div');
        star.className = 'wz-star-twinkle';
        var sz = (Math.random() * 2.8 + 1.2).toFixed(1);
        star.style.width = sz + 'px';
        star.style.height = sz + 'px';
        star.style.left = (Math.random() * 100).toFixed(1) + '%';
        star.style.top = (Math.random() * 60).toFixed(1) + '%';
        star.style.animationDuration = (Math.random() * 4 + 2.5).toFixed(1) + 's';
        star.style.animationDelay = (-Math.random() * 6).toFixed(1) + 's';
        cont.appendChild(star);
      }

      // 5. Парящая магическая пыльца / пыль, медленно летающая в разные стороны (38 шт.)
      var sparkCount = 38;
      var sparkTypes = ['wz-spark-gold', 'wz-spark-gold', 'wz-spark-blue', 'wz-spark-purple', 'wz-spark-white'];
      for(var i = 0; i < sparkCount; i++){
        var spark = document.createElement('div');
        var type = sparkTypes[i % sparkTypes.length];
        var animIndex = (i % 8) + 1; // 8 разнонаправленных траекторий wzDustDrift1..8
        spark.className = 'wz-spark ' + type;
        var spSize = (Math.random() * 2.6 + 1.8).toFixed(1); // 1.8px - 4.4px
        spark.style.width = spSize + 'px';
        spark.style.height = spSize + 'px';
        spark.style.left = (Math.random() * 100).toFixed(1) + '%';
        spark.style.top = (Math.random() * 100).toFixed(1) + '%';
        var duration = (Math.random() * 10 + 14).toFixed(1); // 14s - 24s (медленное парение пыли)
        var delay = (-Math.random() * 24).toFixed(1);
        spark.style.animation = 'wzDustDrift' + animIndex + ' ' + duration + 's ease-in-out ' + delay + 's infinite';
        cont.appendChild(spark);
      }
    },

    initThemeFx: function(){
      if(typeof document === 'undefined' || !document.body) return;
      var cont = document.getElementById('wzThemeFx');
      if(!cont){
        cont = document.createElement('div');
        cont.id = 'wzThemeFx';
        cont.setAttribute('aria-hidden', 'true');
        document.body.insertBefore(cont, document.body.firstChild);
      }
      if(!cont.children || cont.children.length === 0 || !cont.querySelector('.wz-bg-relic')){
        WZ.buildThemeFx(cont);
      }
      cont.style.display = 'block';
    },

    applyTheme: function(){
      if(typeof document === 'undefined' || !document.body) return;
      var fx = document.getElementById('wzThemeFx');
      if(typeof HB === 'undefined' || HB.mode !== 'wz'){
        document.body.classList.remove('wz-theme');
        ['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff'].forEach(function(h){
          document.body.classList.remove('wz-house-' + h);
        });
        if(fx) fx.style.display = 'none';
        return;
      }
      document.body.classList.add('wz-theme');
      var p = (typeof WZ.getProfile === 'function') ? WZ.getProfile() : null;
      ['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff'].forEach(function(h){
        document.body.classList.remove('wz-house-' + h);
      });
      if(p && p.house){
        var slug = getHouseSlug(p.house);
        if(slug && slug !== 'neutral') document.body.classList.add('wz-house-' + slug);
      }
      WZ.initThemeFx();
    },

    triggerModeSwitchEffect: function(){},
    triggerCardFlourish: function(){}
  };

  function esc(s){ var str = String(s == null ? '' : s); return typeof escapeHtml === 'function' ? escapeHtml(str) : str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function escA(s){ var str = String(s == null ? '' : s); return typeof escapeAttr === 'function' ? escapeAttr(str) : str.replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }

  function getHouseSlug(house){
    if(!house) return 'neutral';
    var h = house.toLowerCase();
    if(h.indexOf('гриффиндор') !== -1 || h.indexOf('gryffindor') !== -1) return 'gryffindor';
    if(h.indexOf('слизерин') !== -1 || h.indexOf('slytherin') !== -1) return 'slytherin';
    if(h.indexOf('когтевран') !== -1 || h.indexOf('ravenclaw') !== -1) return 'ravenclaw';
    if(h.indexOf('пуффендуй') !== -1 || h.indexOf('hufflepuff') !== -1) return 'hufflepuff';
    return 'neutral';
  }

  function getHouseIcon(house){
    var slug = getHouseSlug(house);
    if(slug === 'gryffindor') return '🦁';
    if(slug === 'slytherin') return '🐍';
    if(slug === 'ravenclaw') return '🦅';
    if(slug === 'hufflepuff') return '🦡';
    return '🪄';
  }

  function crumbWz(parts){
    return '<div class="crumb">' + parts.map(function(p, i){
      var last = i === parts.length - 1;
      var onclickAttr = p.nav ? ' onclick="if(typeof window.navigate===\'function\') window.navigate(\'' + escA(p.nav) + '\');"' : '';
      return (i > 0 ? '<span class="sep">/</span>' : '') + '<span class="seg ' + (last ? 'current' : '') + '" data-nav="' + escA(p.nav || '') + '"' + onclickAttr + '>' + esc(p.label) + '</span>';
    }).join('') + '</div>';
  }

  function fldWz(l, inner, hint){
    return '<div class="field"><label>' + esc(l) + (hint ? '<span class="hint">' + esc(hint) + '</span>' : '') + '</label>' + inner + '</div>';
  }

  /* ============================================================
     БАЗОВЫЕ ДАННЫЕ СПРАВОЧНИКА (WZ_REF)
     ============================================================ */

  var WZ_REF_SECTIONS = [
  {
    "id": "houses",
    "title": "Факультеты и Основатели Хогвартса",
    "icon": "🏰",
    "count": 6
  },
  {
    "id": "world_schools",
    "title": "Школы магии мира",
    "icon": "🌍",
    "count": 7
  },
  {
    "id": "wands",
    "title": "Волшебные палочки и Сердцевины",
    "icon": "🪄",
    "count": 5
  },
  {
    "id": "factions",
    "title": "Ордена, Фракции и Министерства",
    "icon": "🏛️",
    "count": 6
  },
  {
    "id": "laws",
    "title": "Законы, Право и Тёмная магия",
    "icon": "⚡",
    "count": 6
  },
  {
    "id": "talents",
    "title": "Особые магические таланты",
    "icon": "✨",
    "count": 5
  },
  {
    "id": "potions",
    "title": "Зельеварение и Высшая Алхимия",
    "icon": "🧪",
    "count": 8
  },
  {
    "id": "herbology",
    "title": "Магическая флора и Травология",
    "icon": "🌿",
    "count": 5
  },
  {
    "id": "creatures",
    "title": "Бестиарий волшебных тварей",
    "icon": "🐉",
    "count": 12
  },
  {
    "id": "artifacts",
    "title": "Легендарные реликвии и Артефакты",
    "icon": "🔮",
    "count": 10
  },
  {
    "id": "transport",
    "title": "Магический транспорт и Связь",
    "icon": "🚂",
    "count": 6
  },
  {
    "id": "locations",
    "title": "Знаковые локации и Тайные места",
    "icon": "🗺️",
    "count": 9
  },
  {
    "id": "quidditch",
    "title": "Квиддич и Воздушный спорт",
    "icon": "🧹",
    "count": 4
  },
  {
    "id": "society",
    "title": "Магическое общество, Быт и Пресса",
    "icon": "📜",
    "count": 4
  }
];

  var WZ_REF = {
  "gryffindor": {
    "sec": "houses",
    "name": "Гриффиндор (Gryffindor)",
    "icon": "🦁",
    "tag": "Храбрость и Благородство",
    "lead": "«Быть может, вас ждет Гриффиндор, славный тем, что учатся там храбрецы. Сердца их отваги и силы полны, к тому ж благородны они».",
    "desc": "Основатель: Годрик Гриффиндор. Символ — золотой лев на алом поле. Стихия — Огонь. Гостиная факультета расположена в одной из самых высоких башен замка, вход охраняет портрет Полной Дамы, требующий пароль. Факультетское привидение — Сэр Николас де Мимси-Дельфингтон (Почти Безголовый Ник). Реликвия факультета — гоблинский Меч Гриффиндора, инкрустированный рубинами, являющийся лишь тем, кто доказал истинную доблесть."
  },
  "slytherin": {
    "sec": "houses",
    "name": "Слизерин (Slytherin)",
    "icon": "🐍",
    "tag": "Амбиции и Хитрость",
    "lead": "«А может быть, вам сужден Слизерин, где вы обретете друзей, хитрецы не брезгуют никакими путями для достижения целей».",
    "desc": "Основатель: Салазар Слизерин. Символ — серебряная змея на изумрудно-зеленом поле. Стихия — Вода. Гостиная расположена в древних подземельях под Черным Озером, из окон льется зеленоватый таинственный свет. Факультетское привидение — молчаливый и ужасающий Кровавый Барон. Реликвия — золотой Медальон Слизерина с выгравированной буквой «S». Факультет славится целеустремленностью, гордостью, искусством зельеварения и традицией змееустов (парселтанга)."
  },
  "ravenclaw": {
    "sec": "houses",
    "name": "Когтевран (Ravenclaw)",
    "icon": "🦅",
    "tag": "Мудрость и Острый ум",
    "lead": "«А если с мозгами в порядке у вас, вас к себе примет Когтевран. Там мудрые учатся и остряки, до ума дойдет каждый изъян».",
    "desc": "Основатель: Кандида Когтевран. Символ — парящий орёл на синем поле с бронзовой каймой. Стихия — Воздух. Гостиная расположена в западной башне с панорамным видом на горы. Вход открывает не пароль, а бронзовый молоточек в виде орла, задающий философскую загадку. Факультетское привидение — Елена Когтевран (Серая Дама). Реликвия — волшебная Диадема Кандиды Когтевран, дарующая безграничный разум и озарение тому, кто её наденет."
  },
  "hufflepuff": {
    "sec": "houses",
    "name": "Пуффендуй (Hufflepuff)",
    "icon": "🦡",
    "tag": "Верность и Трудолюбие",
    "lead": "«А может, вам в Пуффендуй суждено, где люди честны и верны, терпеливы они и упорны в труде, и слова их всегда крепки».",
    "desc": "Основатель: Хельга Пуффендуй. Символ — барсук на канареечно-желтом и угольно-черном поле. Стихия — Земля. Уютная гостиная находится в подвале у замковых кухонь, вход замаскирован под бочки, отбивающие ритм имени основательницы. Факультетское привидение — добродушный Толстый Монах. Реликвия — золотая Чаша Хельги Пуффендуй. Выпускники Пуффендуя славятся верностью друзьям, честной игрой и непревзойденными познаниями в травологии и защите слабых."
  },
  "founders": {
    "sec": "houses",
    "name": "Основатели Хогвартса и Раскол Слизерина",
    "icon": "📜",
    "tag": "История основания",
    "lead": "Четыре величайших мага X века объединились, чтобы создать оплот магического знания в эпоху гонений.",
    "desc": "Хогвартс был основан более тысячи лет назад четырьмя выдающимися чародеями: Годриком Гриффиндором из диких вересковых пустошей, Салазаром Слизерином из топких болот, Кандидой Когтевран из горных ущелий и Хельгой Пуффендуй из цветущих долин. Годами они жили и учили в гармонии, пока Салазар Слизерин не потребовал принимать в школу исключительно детей из чистокровных семей волшебников, утверждая, что маглорождённым нельзя доверять магию. Разгорелся ожесточённый спор, приведший к дуэли между Годриком и Салазаром. Покинув замок, Слизерин оставил за собой тайное святилище — Тайную Комнату, запечатанную до тех пор, пока в школу не явится его истинный Наследник."
  },
  "ghosts": {
    "sec": "houses",
    "name": "Призраки замка и Полтергейст Пивз",
    "icon": "👻",
    "tag": "Призрачный мир",
    "lead": "Серебристые полупрозрачные тени магов, отказавшихся уйти за грань Смерти из страха или раскаяния.",
    "desc": "Призраки Хогвартса помнят замок с момента его закладки:\n• Почти Безголовый Ник (Гриффиндор): сэр Николас де Мимси-Дельфингтон, казненный в 1492 году за неудачное заклинание; его голова держится на тонком лоскуте кожи, из-за чего его не принимают в «Клуб Обезглавленных охотников».\n• Кровавый Барон (Слизерин): закован в тяжелые серебряные цепи в знак вечного раскаяния за убийство своей возлюбленной Елены Когтевран.\n• Серая Дама (Когтевран): дочь основательницы Елена Когтевран, похитившая диадему матери из зависти к её мудрости.\n• Толстый Монах (Пуффендуй): казнен за излечение оспы прикосновением к крестьянам и вытаскивание кроликов из чаши для причастия.\n• Полтергейст Пивз: не призрак человека, а хаотический бессмертный сгусток разрушительной энергии, материализовавшийся из детского непослушания сотен поколений студентов."
  },
  "beauxbatons": {
    "sec": "world_schools",
    "name": "Академия магии Шармбатон (Франция)",
    "icon": "🏰",
    "tag": "Французская школа",
    "lead": "Величественный дворец в Пиренейских горах, наполненный ароматом роз и звоном зачарованных фонтанов.",
    "desc": "Шармбатон (L'Académie de Magie Beauxbâtons) принимает учеников из Франции, Бельгии, Испании, Португалии, Нидерландов и Люксембурга. Дворец окружен волшебными садами и ландшафтами, сотворенными магией из горных склонов. В центре парадного парка бьет фонтан с омолаживающими и исцеляющими водами, названный в честь великих выпускников — алхимика Николаса Фламеля и его супруги Перенеллы. Студенты носят элегантные мантии из тончайшего шелка пастельно-голубого цвета. Знаменитый транспорт школы — гигантская карета размером с дом, запряженная дюжиной крылатых паломино-коней породы Абраксан, пьющих исключительно чистый ячменный виски."
  },
  "durmstrang": {
    "sec": "world_schools",
    "name": "Институт Дурмстранг (Северная Европа)",
    "icon": "⚓",
    "tag": "Скандинавская школа",
    "lead": "Суровая цитадель за Полярным кругом среди вечных снегов и ледяных фьордов.",
    "desc": "Дурмстранг (Durmstrang Institute) славится безупречной военной дисциплиной, практической направленностью дуэлей и углубленным изучением Темных искусств (в отличие от других школ, преподающих лишь защиту). Точное местоположение замка скрыто чарами высшей секретности: каждый посетитель подвергается заклятию забвения перед отбытием. Территория замка мрачна и сурова: заснеженные горы, скованные льдом озера и пылающие очаги. Знаменитый корабль Дурмстранга способен погружаться под воду и перемещаться по подземным океаническим течениям. В этих стенах учился самый опасный темный маг начала XX века Геллерт Грин-де-Вальд, пока не был исключен за опасные эксперименты, оставив на стене школы вырезанный знак Даров Смерти."
  },
  "ilvermorny": {
    "sec": "world_schools",
    "name": "Школа Ильверморни (Северная Америка)",
    "icon": "🌲",
    "tag": "Американская школа",
    "lead": "Оплот магии Нового Света на лесистой вершине горы Грейлок в штате Массачусетс.",
    "desc": "Основана в XVII веке ирландской волшебницей Изольдой Сейр (прямой наследницей Салазара Слизерина, сбежавшей от жестокой тетки Гормлайт) и маглом Джеймсом Стюардом. Школа строилась как гранитный замок, сокрытый от немагов облаками и туманами. При поступлении ученики проходят в круглый зал, где их выбирают четыре резные деревянные скульптуры факультетов:\n• Рогатый Змей (Horned Serpent): покровительствует ученым и пытливому уму.\n• Вампус (Wampus): покровительствует воинам и физической силе.\n• Птица-гром (Thunderbird): покровительствует искателям приключений и душе мага.\n• Пакваджи (Pukwudgie): покровительствует целителям и добрым сердцам.\nВолшебную палочку американские юные маги выбирают лишь внутри стен Ильверморни."
  },
  "mahoutokoro": {
    "sec": "world_schools",
    "name": "Школа магии Махотокоро (Япония)",
    "icon": "🌸",
    "tag": "Восточная школа",
    "lead": "Изумительный дворец из розового нефрита на вершине вулканического острова Минами Иводзима.",
    "desc": "Махотокоро имеет наименьшее количество студентов среди одиннадцати великих школ, но принимает детей с семилетнего возраста (до одиннадцати лет они ежедневно возвращаются домой на гигантских буревестниках). При поступлении ученикам выдают зачарованные мантии, которые растут вместе с ними и меняют цвет: от бледно-розового до ослепительно золотого, если ученик достигает вершины магических искусств. Если мантия внезапно белеет — это признак того, что волшебник предал идеалы магии, применил запретные Темные искусства или нарушил Международный статут секретности, что влечет немедленное изгнание и суд Министерства."
  },
  "uagadou": {
    "sec": "world_schools",
    "name": "Школа волшебства Уагаду (Африка)",
    "icon": "🌙",
    "tag": "Африканская школа",
    "lead": "Гигантский храм, высеченный прямо в склоне Лунных Гор и парящий среди вечных туманов.",
    "desc": "Уагаду (Уганда) — старейшая и крупнейшая магическая школа планеты, собирающая студентов со всего африканского континента. Здание выглядит высеченным из цельного горного утеса, парящего над облаками. Приглашение в школу доставляют Посланники Сновидений: директор школы проникает в ночной сон ребенка и оставляет в его сжатой ладони резной камень с символом школы. Выпускники Уагаду — непревзойденные мастера астрономии, алхимии и самотрансфигурации (многие становятся сертифицированными анимагами уже к 14 годам: слонами, гепардами, львами). Кроме того, они виртуозно владеют беспалочковой магией, колдуя лишь жестами пальцев и ладоней."
  },
  "castelobruxo": {
    "sec": "world_schools",
    "name": "Школа Кастелобрушу (Бразилия)",
    "icon": "🦜",
    "tag": "Южноамериканская школа",
    "lead": "Древний золотой замок, укрытый в самом сердце непроходимой сельвы Амазонки.",
    "desc": "Кастелобрушу принимает волшебников со всей Южной Америки. Сложенный из мерцающего золотистого камня замок похож на величественный ступенчатый храм древних цивилизаций. Для случайных взоров маглов он предстает непролазными руинами. Территорию и дикую фауну вокруг замка оберегают кайпоры (Caipora) — маленькие мохнатые лесные духи-трикстеры, любящие озорство и появляющиеся из ниоткуда. Студенты носят ярко-зеленые мантии и славятся во всем мире непревзойденными познаниями в гербологии редких тропических растений и магозоологии."
  },
  "koldovstoretz": {
    "sec": "world_schools",
    "name": "Школа Колдовсторец (Россия)",
    "icon": "❄️",
    "tag": "Северная школа",
    "lead": "Древняя твердыня посреди глухой сибирской тайги, сокрытая трескучими морозами и буранами.",
    "desc": "Колдовсторец — одна из самых загадочных и закрытых магических школ Севера. Сокрыта в непроходимой тайге за Уральским хребтом, где температура опускается ниже сорока градусов, а морозный воздух звенит от стихийной силы. Ученики Колдовсторца играют в особую разновидность квиддича: вместо стандартных тонких метел они седлают цельные, вырванные с корнем вековые сосны и березы. Школа славится древнерусской магией заговоров, кузнечными чарами зачарования булатной стали, приручением северных чудовищ и суровым закаливанием характера."
  },
  "ollivander": {
    "sec": "wands",
    "name": "Лавка Олливандера и Закон выбора",
    "icon": "🪄",
    "tag": "Искусство палочек",
    "lead": "«Палочка сама выбирает волшебника, мистер Поттер. Это было ясно тем из нас, кто изучал палочковое дело».",
    "desc": "Гаррик Олливандер — величайший мастер волшебных палочек в мире, основавший семейное дело в Косом переулке еще в 382 году до н.э. Каждая палочка уникальна и состоит из подобранной древесины и мощной магической сердцевины. Палочка тонко чувствует характер, мораль и судьбу своего хозяина. Если волшебник применяет чужую палочку, её магия сопротивляется и ослабевает."
  },
  "wand_cores": {
    "sec": "wands",
    "name": "Высшие сердцевины (Перо, Жила, Волос)",
    "icon": "✨",
    "tag": "Сердцевины",
    "lead": "Три высших компонента Олливандера определяют темперамент и потенциал заклинаний.",
    "desc": "• Перо Феникса: Редчайшая сердцевина. Способна на величайший диапазон магии, действует по собственной инициативе, что пугает многих магов.\n• Сердечная жила Дракона: Производит самые сокрушительные боевые чары и легче всего осваивает сложные заклинания, но склонна к переходу на Темную сторону.\n• Волос Единорога: Дает самую стабильную, чистую и надежную магию, практически неспособную порождать Темные искусства. Предана первому владельцу."
  },
  "wand_woods": {
    "sec": "wands",
    "name": "Древесина: Остролист, Тис, Бузина и Дуб",
    "icon": "🌳",
    "tag": "Древесина",
    "lead": "Порода дерева задает характер, сопротивление и дух волшебной палочки.",
    "desc": "• Остролист (Holly): Редкая порода с мощным защитным духом, выбирает тех, кто преодолевает ярость и совершает опасные подвиги (палочка Гарри Поттера).\n• Тис (Yew): Ассоциируется с бессмертием, жизнью и смертью. Дарует непревзойденную мощь в дуэлях и проклятиях (палочка Волан-де-Морта).\n• Бузина (Elder): Самая редкая и капризная древесина. Приносит несчастья неумелым, но в руках истинного мастера творит немыслимые чудеса (Старшая палочка).\n• Черный вяз и Дуб: Исключительно верные палочки с непреклонным характером для сильных духом лидеров.\n• Ива (Willow): Палочка с даром исцеления и передовых чар, выбирает тех, кто скрывает внутреннюю неуверенность."
  },
  "wandlore": {
    "sec": "wands",
    "name": "Палочковое право и Приорат",
    "icon": "⚖️",
    "tag": "Законы дуэлей",
    "lead": "Правила смены преданности и эффект Priori Incantatem.",
    "desc": "Если волшебник обезоруживает противника в честном поединке или побеждает его, палочка побежденного способна изменить преданность новому хозяину. Если сталкиваются две палочки с сердцевинами из одного существа (как палочки Гарри и Волан-де-Морта с перьями Фоукса), возникает эффект Priori Incantatem: палочки отказываются сражаться, связываются золотой золотистой нитью и воспроизводят тени последних наложенных заклинаний."
  },
  "exotic_cores": {
    "sec": "wands",
    "name": "Экзотические сердцевины мира",
    "icon": "🔮",
    "tag": "Редкие материалы",
    "lead": "Мастера других континентов используют сердцевины местных волшебных существ.",
    "desc": "В то время как Олливандер признает лишь «Высшую Тройку», мастера мира используют иные субстанции:\n• Волос Вейлы: палочка Флёр Делакур (волос бабушки-вейлы). Чрезвычайно темпераментная, вспыльчивая и чуткая к эмоциям магия.\n• Рог Рогатого Змея: используется в Ильверморни. Невероятно мощная сердцевина, вибрирующая низким гулом при опасности и распознающая парселтанг.\n• Перо Птицы-гром: способно насылать стихийные бури и самопроизвольно накладывать проклятия при приближении врагов.\n• Шерсть Ругару: излюбленный материал мастера Тьяго Кинтаны, порождающий темную и тяжелую боевую магию.\n• Ус Вампуса: производит стремительные, разящие заклинания для прирожденных дуэлянтов."
  },
  "order_phoenix": {
    "sec": "factions",
    "name": "Орден Феникса (Order of the Phoenix)",
    "icon": "🔥",
    "tag": "Светлое сопротивление",
    "lead": "Тайное общество, основанное Альбусом Дамблдором для борьбы с Волан-де-Мортом.",
    "desc": "Орден был создан в 1970-х годах во время Первой магической войны, когда Министерство магии оказалось бессильно перед натиском Пожирателей смерти. Штаб-квартира Ордена — старинный особняк Блэков на площади Гриммо, 12, сокрытый чарами Доверия (Фиделиус) с Дамблдором в качестве Хранителя тайны. Члены Ордена первыми узнавали о возвращении Темного Лорда, координировали охрану пророчества в Отделе Тайн и вели круглосуточную разведку. Связь между членами Ордена осуществляется через телесных Патронусов — технику, изобретенную лично Дамблдором, позволяющую призрачным серебряным зверям говорить голосом мага."
  },
  "death_eaters": {
    "sec": "factions",
    "name": "Пожиратели Смерти и Тёмная Метка",
    "icon": "💀",
    "tag": "Культ Тьмы",
    "lead": "Организация чистокровных магов-радикалов под началом Лорда Волан-де-Морта.",
    "desc": "Пожиратели Смерти ведут родословную от школьного кружка «Вальпургиевых рыцарей» юного Тома Реддла. Их цель — свержение Статута секретности, подчинение маглов и утверждение абсолютного господства чистокровных магов. Каждый посвященный носит на внутренней стороне левого предплечья Тёмную Метку — изображение черепа с выползающей изо рта змеей. Прикосновение палочки Волан-де-Морта заставляет метку пылать черным огнем, созывая соратников на совет через мгновенную трансгрессию. В бою они носят черные плащи с капюшонами и серебряные литые маски с индивидуальной гравировкой."
  },
  "dumbledores_army": {
    "sec": "factions",
    "name": "Отряд Дамблдора (Dumbledore's Army)",
    "icon": "⚔️",
    "tag": "Студенческое братство",
    "lead": "«Если Министерство не научит нас защищаться — мы научимся сами».",
    "desc": "Организован Гарри Поттером, Гермионой Грейнджер и Роном Уизли осенью 1995 года на пятом курсе в ответ на запрет генерального инспектора Долорес Амбридж практиковать защитную магию. Собрания проходили тайно в Выручай-комнате. Гарри обучал студентов от третьего до седьмого курса боевым чарам: Экспеллиармусу, Остолбеней, Редукто, чарам помех и сложнейшему телесному Патронусу. Для координации встреч Гермиона создала заколдованные фальшивые золотые галлеоны: цифры по ободу монеты менялись Протеевыми чарами, сообщая дату и время следующего сбора. Отряд сыграл решающую роль в Битве в Отделе Тайн и Обороне Хогвартса."
  },
  "auror_office": {
    "sec": "factions",
    "name": "Мракоборческий центр (Аврорат)",
    "icon": "🛡️",
    "tag": "Магический спецназ",
    "lead": "Элитное подразделение Отдела магического правопорядка по борьбе с Тёмными магами.",
    "desc": "Мракоборцы (авроры) — высшая лига магического следствия и боевой магии. Чтобы быть допущенным к трехлетней подготовке, кандидат обязан сдать не менее пяти экзаменов Ж.А.Б.А. с оценками «Превосходно» или «Выше ожидаемого» (включая Защиту от Темных искусств, Зельеварение, Трансфигурацию и Заклинания). Подготовка включает сложнейшие тесты на маскировку, слежку, сопротивление ядам, ментальным атакам и дуэли на пределе физических возможностей. Легенда аврората Аластор «Грозный Глаз» Грюм лично пленил половину узников Азкабана ценой потерянного глаза, ноги и части носа."
  },
  "department_mysteries": {
    "sec": "factions",
    "name": "Отдел Тайн и Невыразимцы",
    "icon": "🌌",
    "tag": "Мистическая наука",
    "lead": "Сверхсекретный 9-й уровень Министерства магии, исследующий фундаментальные силы бытия.",
    "desc": "Служащие Отдела Тайн зовутся Невыразимцами (Unspeakables) и связаны нерушимым обетом молчания. Отдел исследует первичные космические загадки Вселенной:\n• Зал Смерти: древняя каменная чаша с висящей в воздухе Аркой и трепещущей черной Вуалью, из-за которой доносятся шепоты ушедших.\n• Зал Времени: наполнен маховиками времени, вечно текущим звездным песком и стеклянной колбой, где колибри непрерывно рождается, живет и умирает.\n• Зал Пророчеств: бесконечные стеллажи с тысячами светящихся хрустальных сфер.\n• Зал Мыслей: темный бассейн с плавающими мозгами, стреляющими агрессивными лентами воспоминаний.\n• Запертая Комната Любви: комната, которую невозможно открыть никакими чарами; Дамблдор называл любовь силой, превосходящей саму смерть."
  },
  "gringotts_goblins": {
    "sec": "factions",
    "name": "Банк Гринготтс и Нация Гоблинов",
    "icon": "🪙",
    "tag": "Гоблинский суверенитет",
    "lead": "Единственный банк волшебного мира и древний народ неподкупных финансистов и кузнецов.",
    "desc": "Основан гоблином Гринготтом в 1474 году. Белоснежное мраморное здание в Косом переулке с бронзовыми и серебряными дверями, на которых выбиты предостерегающие стихи о каре за воровство. Глубоко под Лондоном раскинулся лабиринт пещер, подземных рек и рельсовых путей. На нижних ярусах хранятся сокровища древнейших чистокровных фамилий под охраной полуслепых огнедышащих драконов и водопада «Гибель Воров», смывающего любые иллюзии и заклятия Империуса. Гоблины обладают собственной магией без палочек и свято чтут свое право собственности: по их законам вещь принадлежит кузнецу, а купивший её маг лишь арендует её на время своей жизни."
  },
  "unforgivable": {
    "sec": "laws",
    "name": "Три Непростительных заклятия",
    "icon": "☠️",
    "tag": "Тёмные искусства",
    "lead": "Применение любого из них к человеку карается пожизненным заключением в тюрьму Азкабан.",
    "desc": "1. Авада Кедавра (Убивающее): Ослепительный зеленый луч и шум несущейся смерти. Мгновенная гибель цели без единого физического повреждения. Не имеет контрзаклятия и не блокируется щитом Протего.\n2. Круциатус (Круцио): Пыточное заклятие. Вызывает невыносимую, выворачивающую кости боль. Требует искреннего желания причинить страдание.\n3. Империус (Империо): Заклятие подчинения. Погружает жертву в состояние блаженного подчинения, заставляя безоговорочно исполнять любые приказы хозяина."
  },
  "statute_secrecy": {
    "sec": "laws",
    "name": "Международный статут о секретности 1689 г.",
    "icon": "📜",
    "tag": "Законодательство",
    "lead": "Фундаментальный закон, скрывающий магический мир от взоров маглов.",
    "desc": "Статут секретности был ратифицирован Международной конфедерацией магов в 1689 году и окончательно утвержден в 1692 году. Предписывает полное сокрытие магического общества, сокрытие волшебных существ (драконов, кентавров), запрет колдовства перед не-магами и немедленное применение чар забвения (Обливиэйт) при любых нарушениях скрытности."
  },
  "ministry_law": {
    "sec": "laws",
    "name": "Министерство магии и Визенгамот",
    "icon": "🏛️",
    "tag": "Власть магов",
    "lead": "Высший руководящий орган магической Великобритании.",
    "desc": "Возглавляется Министром магии. Главный орган правосудия — верховный суд Визенгамот из 50 старейших магов в сливовых мантиях с серебряной буквой «W». Ключевые подразделения: Отдел магического правопорядка, Мракоборческий центр (элитные охотники за Темными магами) и сверхсекретный Отдел Тайн, исследующий Любовь, Смерть, Время, Мысли и Пророчества."
  },
  "horcruxes": {
    "sec": "laws",
    "name": "Крестражи и расщепление души",
    "icon": "🖤",
    "tag": "Абсолютная тьма",
    "lead": "Самое отвратительное и запретное волшебство, дарующее призрачное бессмертие ценой человечности.",
    "desc": "Изобретены древнегреческим чернокнижником Герпием Злостным. Крестраж (Horcrux) создается путем раскалывания души через совершение хладнокровного убийства — высшего преступления против природы. Осколок души запечатывается в материальный предмет посредством тайного омерзительного ритуала. Пока крестраж цел, создателя невозможно убить: даже если его тело уничтожено, душа остается привязана к миру живых в виде бестелесного призрака. Единственный способ исцелить душу — искреннее, невыносимое раскаяние, способное убить раскаивающегося мага от душевной боли. Уничтожить крестраж способны лишь субстанции за гранью обычной магии: яд василиска, Адское пламя (Fiendfyre) и Меч Гриффиндора."
  },
  "dark_magic_nature": {
    "sec": "laws",
    "name": "Природа Тёмной магии и неисцелимые раны",
    "icon": "🩸",
    "tag": "Метафизика тьмы",
    "lead": "Темная магия не просто разрушает плоть — она искажает самую ткань реальности и оставляет вечный след.",
    "desc": "В отличие от боевых чар и бытовых проклятий, Тёмные искусства питаются отрицательными эмоциями мага: ненавистью, садизмом, жаждой власти и презрением к жизни. Раны, нанесенные могущественными темными проклятиями (например, Сектумсемпра или потеря уха Джорджа Уизли от заклятия Снейпа), невозможно отрастить или залечить даже сильнейшими целебными чарами и зельями. Опаснейшим порождением Тьмы также являются Инферналы — трупы людей, поднятые темным некромантическим заклятием. Они лишены воли, боли и страха, действуя как слепые марионетки создателя, и боятся только яркого пламени и света."
  },
  "pureblood_supremacy": {
    "sec": "laws",
    "name": "Доктрина чистокровности и «Священные двадцать восемь»",
    "icon": "👑",
    "tag": "Идеология крови",
    "lead": "Многовековой фанатизм о сохранении «чистоты магической крови».",
    "desc": "В 1930-х годах в Великобритании был анонимно опубликован «Справочник чистокровных волшебников», выделивший двадцать восемь истинно чистокровных семей, не запятнавших себя браками с маглами («Священные двадцать восемь»: Блэки, Малфои, Гонты, Лестрейнджи, Уизли, Лонгботтомы и др.). Семьи, отвергшие расистскую доктрину (как Уизли), были объявлены «предателями крови». В семьях фанатиков выжигали неугодных родственников с генеалогических гобеленов (как Сириуса Блэка на площади Гриммо). Однако генетически чистокровных магов не существует: без притока маглорожденных волшебное сообщество давно бы вымерло от вырождения."
  },
  "animagus": {
    "sec": "talents",
    "name": "Анимагия и Магия превращения",
    "icon": "🐾",
    "tag": "Сложная трансфигурация",
    "lead": "Дар превращаться в определенное животное по собственному желанию без палочки.",
    "desc": "Один из сложнейших разделов высшей трансфигурации. Обучение требует месяцев подготовки: маг обязан держать во рту лист мандрагоры ровно от одного полнолуния до следующего не вынимая ни на секунду, затем приготовить рубиновое зелье с каплей росы и куколкой бражника мертвая голова и ждать сильнейшей грозы. В момент удара молнии палочку прижимают к сердцу и произносят заклинание. Животная форма отражает истинную сущность мага и совпадает с его телесным Патронусом. Ошибки в ритуале превращают волшебника в полузверя-мутанта навсегда. Министерство ведет строгий реестр анимагов; незарегистрированные анимаги караются заключением в Азкабан (Мародеры: Джеймс-олень, Сириус-пес, Питер-крыса; и Рита Скитер-жук)."
  },
  "occlumency_legilimency": {
    "sec": "talents",
    "name": "Окклюменция и Легилименция",
    "icon": "🧠",
    "tag": "Магия разума",
    "lead": "Искусство защиты и проникновения в потаенные глубины человеческого сознания.",
    "desc": "Легилименция позволяет магу проникать в чужой разум («Легилименс»), считывать текущие мысли, поднимать на поверхность забытые воспоминания, эмоции и определять ложь. Могущественный легилименс (как Волан-де-Морт) способен внушать жертве фальшивые образы на расстоянии миль. Окклюменция — контр-искусство глухой ментальной защиты. Требует абсолютного контроля над чувствами, полного подавления эмоций и возведения «зеркальных стен» внутри рассудка, чтобы скрыть правду. Северус Снейп являлся величайшим мастером окклюменции своего времени, годами успешно скрывавшим свои истинные мысли от Темного Лорда."
  },
  "metamorphmagus": {
    "sec": "talents",
    "name": "Метаморфомагия (Metamorphmagus)",
    "icon": "🎭",
    "tag": "Врождённый дар",
    "lead": "Редчайшая способность менять внешность усилием одной лишь мысли.",
    "desc": "В отличие от анимагов или пользователей Оборотного зелья, метаморфомагом нельзя стать благодаря усердной учебе — с этим даром нужно родиться. Метаморфомаги способны менять черты лица, форму носа, цвет кожи, пол, возраст и цвет волос за доли секунды без палочки и заклинаний. Этот дар тесно связан с эмоциональным состоянием: у Нимфадоры Тонкс волосы меняли цвет от ярко-розового до ядовито-желтого в зависимости от настроения. При сильном душевном потрясении или глубокой депрессии дар может временно исчезнуть."
  },
  "parseltongue": {
    "sec": "talents",
    "name": "Парселтанг (Змеиный язык)",
    "icon": "🐍",
    "tag": "Древний язык",
    "lead": "Способность общаться со змеями на их природном наречии.",
    "desc": "Змееусты (парселмуты) говорят на свистящем, шипящем наречии, непонятном обычным магам. Дар считается практически исключительно наследственным и традиционно ассоциируется с Темными магами, восходя к Салазару Слизерину и древнему роду Мраксов. Змеи инстинктивно подчиняются воле змееуста. Гарри Поттер обрел эту способность случайно в младенчестве, когда осколок расколотой души Волан-де-Морта прикрепился к его шраму. После уничтожения этого крестража Гарри утратил способность говорить на парселтанге."
  },
  "seers_prophecies": {
    "sec": "talents",
    "name": "Провидцы и Истинные Пророчества",
    "icon": "🔮",
    "tag": "Внутреннее Око",
    "lead": "Редкие маги, способные приоткрыть завесу грядущего в моменты священного транса.",
    "desc": "Истинный провидец не контролирует свои пророчества: дар нисходит внезапно, голос провидца грубеет и звучит потусторонним эхом, а после выхода из транса маг не помнит ни единого сказанного слова (как Сивилла Трелони, произнесшая пророчество о Гарри и Волан-де-Морте в трактире «Кабанья Голова»). Каждое истинное пророчество записывается зачарованным пером в Отделе Тайн и запечатывается в хрустальную сферу. Снять сферу с полки Зала Пророчеств без потери рассудка могут лишь те лица, о которых в ней говорится."
  },
  "polyjuice": {
    "sec": "potions",
    "name": "Оборотное зелье (Polyjuice Potion)",
    "icon": "🧪",
    "tag": "Сложное зелье",
    "lead": "Позволяет испившему принять точный физический облик другого человека ровно на 1 час.",
    "desc": "Сложнейший состав уровня Ж.А.Б.А., требующий целого месяца варки. Включает настойку из водорослей, собранных в полнолуние, спорыш, пиявок, тертый рог двурога, шкуру бумсланга и частицу человека, в которого превращаются (волос, ноготь). Зелье бурлит, пенится и меняет цвет в зависимости от сущности персоны. Не предназначено для превращения в животных."
  },
  "felix_felicis": {
    "sec": "potions",
    "name": "Феликс Фелицис («Жидкая удача»)",
    "icon": "🌟",
    "tag": "Жидкая удача",
    "lead": "Приносит выпившему ошеломительный успех и невероятное везение во всех начинаниях.",
    "desc": "Зелье сияет расплавленным золотом, капли отскакивают от поверхности подобно рыбкам. На протяжении действия волшебник интуитивно выбирает единственно верный путь, безупречно произносит заклинания и находит то, что искал годами. Запрещено на официальных дуэлях, спортивных матчах и экзаменах. При чрезмерном употреблении вызывает опасную самонадеянность."
  },
  "veritaserum": {
    "sec": "potions",
    "name": "Сыворотка правды (Veritaserum)",
    "icon": "💧",
    "tag": "Контроль разума",
    "lead": "Мощнейшее зелье, заставляющее выдать самые глубокие тайны.",
    "desc": "Прозрачное, не имеющее запаха и вкуса, неотличимое от родниковой воды. Достаточно трех капель в напиток, чтобы испытуемый потерял способность лгать и выложил чистую правду. Применение строго регулируется Министерством магии. Мастера окклюменции способны частично сопротивляться эффекту, запирая сознание."
  },
  "amortentia": {
    "sec": "potions",
    "name": "Амортенция (Любовное зелье)",
    "icon": "💖",
    "tag": "Страсть и морок",
    "lead": "Сильнейшее в мире любовное зелье с перламутровым отливом и спиральным паром.",
    "desc": "Зелье не способно сотворить истинную любовь (любовь нельзя искусственно создать), но порождает безумную, всепоглощающую страсть и навязчивое помешательство. Амортенция пахнет для каждого тем, что ему дороже всего: для Гарри — патокой, полиролью для метлы и ароматом волос Джинни; для Гермионы — скошенной травой, новым пергаментом и рондоловым мылом."
  },
  "bezoar": {
    "sec": "potions",
    "name": "Безоар и Универсальные противоядия",
    "icon": "🪨",
    "tag": "Целительство",
    "lead": "«Безоар — это камень, который извлекают из желудка козы, и он спасет вас от большинства ядов».",
    "desc": "Классическое средство скорой помощи в зельеварении, прославленное Северусом Снейпом на первом же уроке Гарри Поттера. В случае отравления смертельным зельем или ядом василиска безоар заталкивают глубоко в глотку пострадавшего. Камень мгновенно абсорбирует и нейтрализует токсин."
  },
  "draught_living_death": {
    "sec": "potions",
    "name": "Напиток живой смерти",
    "icon": "💤",
    "tag": "Высшее снотворное",
    "lead": "Могущественнейшее снотворное зелье, погружающее человека в состояние, неотличимое от смерти.",
    "desc": "Упоминается на первом же уроке Снейпа («Что получится, если смешать измельченный корень асфоделя с настойкой полыни?»). Человек, выпивший хотя бы глоток, впадает в глубочайшую летаргию: дыхание и пульс практически замирают. Зелье имеет цвет прозрачной лиловой дымки. Секрет идеального приготовления из учебника Принца-полукровки: раздавить дремоносный боб плоской стороной серебряного кинжала, а не резать его, и добавлять каплю сока после каждого седьмого помешивания по часовой стрелке."
  },
  "wolfsbane": {
    "sec": "potions",
    "name": "Вольчье противоядие (Аконитовое зелье)",
    "icon": "🐺",
    "tag": "Контроль ликантропии",
    "lead": "Сложнейший отвар, позволяющий оборотню сохранять человеческий разум в полнолуние.",
    "desc": "Изобретено выдающимся зельеваром Дамоклом Белби в конце XX века. Сложнейший дымящийся состав темно-синего цвета с отвратительным горьким вкусом на основе ядовитого волчьего аконита. Сахар добавлять нельзя, иначе зелье потеряет силу. Зелье не предотвращает физическую трансформацию оборотня в волка, но защищает его сознание: оборотень во время полнолуния сохраняет свой нормальный человеческий разум и может спокойно переждать ночь, свернувшись клубочком у камина, не представляя угрозы для окружающих."
  },
  "skele_gro": {
    "sec": "potions",
    "name": "Костерост и лекарские эликсиры",
    "icon": "🦴",
    "tag": "Медицинская магия",
    "lead": "Ужасное на вкус снадобье, заново отращивающее удаленные кости за восемь мучительных часов.",
    "desc": "Поставляется в характерных тяжелых бутылях с рельефным изображением скелета. Обжигает горло при глотании. Процесс регенерации костной ткани сопровождается непрерывной острой ноющей болью, из-за чего мадам Помфри держит пациентов в лазарете под действием сонных чар. Также в госпиталях незаменимы Бодроперцовое зелье (Pepperup Potion), мгновенно излечивающее простуду и заставляющее пар валить из ушей часами, и Крововосполняющее зелье при тяжелых ранениях."
  },
  "mandrake": {
    "sec": "herbology",
    "name": "Мандрагора (Mandrake)",
    "icon": "🌱",
    "tag": "Целебный корень",
    "lead": "Растение с корнем в виде живого человеческого младенца, чей крик смертельно опасен.",
    "desc": "Одно из важнейших растений магической травологии. Корень мандрагоры выглядит как уродливый сморщенный младенец, покрытый землей и зелеными листьями. Плач молодой мандрагоры способен оглушить человека на несколько часов, а крик взрослого созревшего растения убивает на месте любого, кто не защитил уши специальными зачарованными наушниками. Отвар из спелой мандрагоры — ключевой компонент мощнейшего оживляющего зелья, способного вернуть к жизни людей и призраков, пораженных окаменением."
  },
  "devils_snare": {
    "sec": "herbology",
    "name": "Дьявольские силки (Devil's Snare)",
    "icon": "🪴",
    "tag": "Хищное растение",
    "lead": "Хищная лоза темных глубин, душащая каждого, кто пытается с ней бороться.",
    "desc": "Обитает в темных сырых подземельях и пещерах. Имеет вид переплетенных эластичных лиан, чувствительных к теплу и движениям. Стоит человеку наступить на растение, как силки мгновенно обвивают его тело. Чем сильнее жертва барахтается, паникует и сопротивляется, тем быстрее и смертоноснее растение стягивает свои узлы. Полное расслабление замедляет хватку. Дьявольские силки ненавидят солнечный свет и огонь: заклинания Инсендио или Люмос Солем заставляют побеги в панике съеживаться и отступать."
  },
  "whomping_willow": {
    "sec": "herbology",
    "name": "Гремучая ива Хогвартса",
    "icon": "🌳",
    "tag": "Дерево-боец",
    "lead": "Свирепое дерево-великан во дворе замка, крушащее ветвями все, что приближается к его кроне.",
    "desc": "Крайне редкое и агрессивное волшебное дерево колоссальной силы. Было посажено на территории школы в 1971 году директором Альбусом Дамблдором для маскировки подземного хода, ведущего из замка в Воющую Хижину в Хогсмиде. Ива служила гарантией того, что юный Римус Люпин мог безопасно трансформироваться в оборотня без риска для студентов. Единственный способ утихомирить дерево — нажать кончиком палочки на крошечный сучок у основания ствола, что временно парализует его ветви."
  },
  "gillyweed": {
    "sec": "herbology",
    "name": "Жабросли (Gillyweed)",
    "icon": "🌿",
    "tag": "Подводное дыхание",
    "lead": "Склизкие средиземноморские водоросли, превращающие человека в подводного пловца на 1 час.",
    "desc": "На вид напоминают пучок скользких серо-зеленых резиновых крысиных хвостов. При проглатывании вызывают острое ощущение нехватки воздуха, после чего на шее мага прорезаются настоящие рыбьи жабры, пальцы рук и ног соединяются эластичными перепонками, а глаза обретают способность четко видеть в мутной озерной воде. Действие длится ровно один час в пресной воде (в соленой морской воде эффект может длиться дольше)."
  },
  "venomous_tentacula": {
    "sec": "herbology",
    "name": "Ядовитая тентакула",
    "icon": "🌺",
    "tag": "Смертоносная флора",
    "lead": "Зубастый плотоядный куст с колючими щупальцами и ядовитым соком.",
    "desc": "Крупное темно-красное хищное растение с подвижными колючими стеблями и челюстями с острыми шипами-зубами. Пытается схватить и проглотить любое живое существо поблизости. Сок тентакулы содержит концентрированный смертельный токсин. Семена тентакулы запрещены к свободной продаже Министерством магии и относятся к ценным товарам черного рынка. Использовалась студентами во время Битвы за Хогвартс для сброса на наступающих Пожирателей смерти."
  },
  "dementor": {
    "sec": "creatures",
    "name": "Дементоры (Dementors)",
    "icon": "🌑",
    "tag": "Твари Бездны",
    "lead": "Слепые парящие порождения гнили и отчаяния, питающиеся человеческой радостью.",
    "desc": "Дементоры облачены в истлевшие темные капюшоны. Их появление сопровождается леденящим космическим холодом, замерзанием воды и угасанием света. Жертва вновь переживает свои самые страшные воспоминания. Высшая кара — «Поцелуй дементора»: существо обнажает безгубый рот и безвозвратно высасывает душу через уста. Единственное оружие против дементора — телесный Патронус."
  },
  "hippogriff": {
    "sec": "creatures",
    "name": "Гиппогриф (Клювокрыл)",
    "icon": "🦅",
    "tag": "Гордый зверь",
    "lead": "Величественное создание: голова, крылья и передние лапы орла, туловище и круп коня.",
    "desc": "Чрезвычайно гордые и обидчивые твари. При приближении к гиппогрифу необходимо поддерживать непрерывный зрительный контакт, не моргая, и отвесить почтительный поклон. Если гиппогриф поклонится в ответ — к нему можно подойти и совершить полет в небеса. Малейшее оскорбление гиппогриф карает ударом железных когтей."
  },
  "basilisk": {
    "sec": "creatures",
    "name": "Василиск (Король Змей)",
    "icon": "🐍",
    "tag": "Смертоносный зверь",
    "lead": "Гигантский изумрудный змей, вырастающий до пятидесяти футов в длину.",
    "desc": "Рождается из куриного яйца, высиженного жабой. Живет сотни лет. Прямой взгляд желтых глаз василиска убивает на месте; отраженный взгляд (через зеркало, воду или привидение) обращает в камень. Клыки наполнены страшным ядом, разъедающим даже волшебные металлы и убивающим крестражи. Смертельно боится крика петуха."
  },
  "thestrals": {
    "sec": "creatures",
    "name": "Фестралы (Крылатые кони)",
    "icon": "🐴",
    "tag": "Вестники смерти",
    "lead": "Костлявые вороные кони с перепончатыми крыльями, как у летучих мышей.",
    "desc": "Фестралы невидимы для большинства магов. Их способны видеть исключительно те волшебники, которые лично видели смерть и осознали утрату. Приучены возить кареты в замок Хогвартс. Обладают невероятным чутьем направления: наездник может просто назвать любое место на Земле, и фестрал доставит его туда по кратчайшей траектории сквозь шторм."
  },
  "phoenix": {
    "sec": "creatures",
    "name": "Феникс (Фоукс)",
    "icon": "🔥",
    "tag": "Птица возрождения",
    "lead": "Величественная птица алого и золотого оперения с хвостом павлина.",
    "desc": "Когда наступает срок, феникс вспыхивает пламенем и возрождается крошечным птенцом из кучки пепла. Их слезы обладают чудодейственной целительной силой, исцеляющей даже смертельный яд василиска. Пение феникса наполняет храбростью чистые сердца и повергает в трепет нечестивцев. Способен переносить на себе немыслимый груз."
  },
  "niffler": {
    "sec": "creatures",
    "name": "Нюхлер (Niffler)",
    "icon": "🦔",
    "tag": "Искатель золота",
    "lead": "Пушистый черный зверек с вытянутым утиным носом, одержимый блестящими вещами.",
    "desc": "Обитает в норах на глубине до двадцати футов под землей. Обладает бездонной волшебной сумкой на брюшке, куда способен упрятать слитки золота, кольца, кубки и драгоценные камни. Очень ласков к хозяину, но в погоне за блестящей безделушкой способен разнести витрину магазина или сорвать золотые часы с шеи мага."
  },
  "boggart": {
    "sec": "creatures",
    "name": "Боггарт (Boggart)",
    "icon": "📦",
    "tag": "Перевёртыш",
    "lead": "Обитает в темных шкафах, под кроватями и ящиках старинных комодов.",
    "desc": "Никто не знает истинного облика боггарта, ибо при взгляде на волшебника он мгновенно превращается в то, чего этот человек боится больше всего на свете (дементор, луна-оборотень, гигантский паук, строгий профессор). Для победы над ним требуется заклинание Ридикулус, заставляющее страшилище выглядеть уморительно смешным."
  },
  "dragons": {
    "sec": "creatures",
    "name": "Драконы волшебного мира",
    "icon": "🐉",
    "tag": "Опасность XXXXX",
    "lead": "Вершина природной мощи магии — гигантские чешуйчатые рептилии, изрыгающие смертоносное пламя.",
    "desc": "Драконы относятся к наивысшему классу опасности. Их кожа, сердце и кровь обладают мощнейшими магическими свойствами:\n• Венгерская хвосторога (Hungarian Horntail): самый свирепый дракон с шипастым хвостом и пламенем до сорока футов.\n• Китайский огнемёт (Chinese Fireball): алая чешуя, золотые гребни и взрывное грибовидное пламя.\n• Шведский тупорылый (Swedish Short-Snout): серебристо-голубой чешуйчатый дракон, изрыгающий ослепительное лазурное пламя, сжигающее камень в пепел.\n• Украинский бронебрюх (Ukrainian Ironbelly): самый гигантский дракон в мире весом до шести тонн, со стальными когтями и чешуей цвета грозовой тучи (охранял сейфы банка Гринготтс)."
  },
  "werewolf": {
    "sec": "creatures",
    "name": "Оборотни и Ликантропия",
    "icon": "🐺",
    "tag": "Проклятие полнолуния",
    "lead": "Трагедия людей, обреченных каждое полнолуние терять разум и превращаться в свирепых хищников.",
    "desc": "Ликантропия передается исключительно через попадание слюны трансформированного оборотня в кровеносную систему человека во время укуса. В ночь полнолуния волшебник испытывает невыносимую ломку костей и суставов, превращаясь в волка. В этом состоянии он не помнит друзей и стремится убить любого человека на пути. Общество магов веками стигматизировало оборотней, отказывая им в работе и убежище. Трагический герой Римус Люпин долгие годы скрывал свою болезнь, в то время как вожак стаи Фенрир Сивый намеренно кусал детей, чтобы создать непобедимую армию полукровок."
  },
  "acromantula": {
    "sec": "creatures",
    "name": "Акромантулы Запретного леса",
    "icon": "🕷️",
    "tag": "Разумные пауки",
    "lead": "Гигантские восьмиглазые пауки-людоеды с размахом лап до пятнадцати футов и человеческой речью.",
    "desc": "Выведены магами на острове Борнео для охраны тайников и сокровищниц. Акромантулы покрыты густой жесткой щетиной, выделяют смертоносный яд (оцениваемый зельеварами до 100 галлеонов за пинту) и издают зловещее щелканье жвал при возбуждении. Они обладают развитым интеллектом, способны вести философские беседы, но рассматривают человека исключительно как добычу. Глава хогвартской колонии Арагог был выращен Рубеусом Хагридом в шкатулке и из уважения к создателю запрещал сородичам нападать на лесничего."
  },
  "centaurs": {
    "sec": "creatures",
    "name": "Кентавры и Звёздная мудрость",
    "icon": "🏹",
    "tag": "Гордый лесной народ",
    "lead": "Мудрые звездочеты и непревзойденные лучники с торсом человека и телом коня.",
    "desc": "Кентавры Запретного леса живут замкнутыми табунами, свято оберегая свою независимость и законы. Они отказываются от статуса «существ» в Министерстве магии, чтобы не стоять на одной ступени с вампирами и каргами. Кентавры не вмешиваются в дела людей и читают судьбы мира по движению планет («Марс сегодня необычайно ярок — это знак грядущей войны»). Нарушение древнего табу (причинение вреда жеребятам) карается смертью. Когда кентавр Флоренц согласился преподавать прорицания в Хогвартсе, соплеменники сочли это предательством и изгнали его из леса."
  },
  "house_elves": {
    "sec": "creatures",
    "name": "Домовые эльфы и древняя магия",
    "icon": "🧦",
    "tag": "Верные слуги",
    "lead": "Маленькие существа с колоссальной врожденной магией, веками скованные узами рабства.",
    "desc": "Домовые эльфы привязаны к поместьям старинных чистокровных фамилий или замку Хогвартс. Они обязаны беспрекословно исполнять любые приказы хозяев и наказывать себя за проступки (прижигать уши, биться головой о стены). Освободить эльфа хозяин может лишь одним способом — вручив ему предмет человеческой одежды (как Гарри освободил Добби старым носком Малфоя). Эльфийская магия превосходит палочковое волшебство людей: эльфы способны мгновенно трансгрессировать сквозь любые защитные барьеры и щиты замка Хогвартс."
  },
  "deathly_hallows": {
    "sec": "artifacts",
    "name": "Дары Смерти (The Deathly Hallows)",
    "icon": "⚯",
    "tag": "Повелитель Смерти",
    "lead": "«Тот, кто соберет все три Дара, станет истинным Повелителем Смерти».",
    "desc": "Древняя легенда о трех братьях Певереллах:\n1. Бузинная палочка (Линия): Непобедимое в бою орудие из ветви бузины с волосом хвоста фестрала.\n2. Воскрешающий камень (Круг): Позволяет вернуть тени ушедших из мира мертвых, вызывая щемящую тоску.\n3. Мантия-невидимка (Треугольник): Единственная в мире истинная мантия невидимости, не тускнеющая от времени и защищающая от чар."
  },
  "marauders_map": {
    "sec": "artifacts",
    "name": "Карта Мародёров (Marauder's Map)",
    "icon": "🗺️",
    "tag": "Тайны Хогвартса",
    "lead": "«Торжественно клянусь, что замышляю шалость, и только шалость!»",
    "desc": "Создана в 1970-х годах Римусом Люпином (Лунатик), Питером Петтигрю (Хвост), Сириусом Блэком (Бродяга) и Джеймсом Поттером (Сохатый). Показывает в реальном времени план замка Хогвартс, территорию школы, тайные проходы за пределы замка и местоположение каждого человека, включая тех, кто находится под Оборотным зельем или Мантией-невидимке. Гасится словами: «Шалость удалась!»."
  },
  "sorting_hat": {
    "sec": "artifacts",
    "name": "Распределяющая шляпа (Sorting Hat)",
    "icon": "🧙‍♂️",
    "tag": "Голос основателей",
    "lead": "Древний остроконечный головной убор, наделенный разумом и даром легилименции.",
    "desc": "Принадлежала Годрику Гриффиндору. В начале каждого учебного года исполняет новую поэтическую песнь, после чего надевается на головы первокурсников. Шляпа проникает в потаенные мысли, оценивает таланты и стремления ученика и оглашает факультет. Прислушивается к искреннему личному желанию ребенка («Только не Слизерин!»)."
  },
  "time_turner": {
    "sec": "artifacts",
    "name": "Маховик времени (Time-Turner)",
    "icon": "⏳",
    "tag": "Поток времени",
    "lead": "Миниатюрные золотые песочные часы на изящной цепочке для перемещений во времени.",
    "desc": "Каждый поворот песочных часов переносит владельца ровно на один час назад во времени. Использование регламентируется строжайшими законами Министерства магии: нельзя попадаться на глаза прошлому себе и изменять свершившиеся ключевые события под страхом парадокса и безумия."
  },
  "mirror_erised": {
    "sec": "artifacts",
    "name": "Зеркало Еиналеж (Mirror of Erised)",
    "icon": "🪞",
    "tag": "Зеркало желаний",
    "lead": "«Оно показывает нам не больше и не меньше, как самое сокровенное и страстное желание нашего сердца».",
    "desc": "Золоченая рама с надписью «Erised stra ehru oyt ube cafru oyt on wohsi» («Я показываю не ваше лицо, но желание вашего сердца»). Волшебники теряли рассудок перед ним, тоскуя по несбыточному. Профессор Дамблдор спрятал внутри зеркала Философский камень так, чтобы достать его мог лишь тот, кто желает найти камень, но не использовать его."
  },
  "pensieve": {
    "sec": "artifacts",
    "name": "Омут памяти (The Pensieve)",
    "icon": "🥣",
    "tag": "Хранилище воспоминаний",
    "lead": "Массивная каменная чаша с рунами, наполненная серебристым веществом — мыслями.",
    "desc": "Позволяет магу прикоснуться кончиком палочки к виску, извлечь мерцающую нить воспоминания и опустить её в чашу. Погрузив лицо в Омут, волшебник оказывается свидетелем событий прошлого, исследуя каждую мелкую деталь происходившего со стороны."
  },
  "philosophers_stone": {
    "sec": "artifacts",
    "name": "Философский камень (Philosopher's Stone)",
    "icon": "💎",
    "tag": "Бессмертие",
    "lead": "Легендарное творение знаменитого средневекового алхимика Николаса Фламеля.",
    "desc": "Кроваво-красный кристалл невероятной силы. Обладает двумя великими свойствами: превращает любой неблагородный металл в чистейшее золото и позволяет производить Эликсир жизни, дарующий выпившему физическое бессмертие."
  },
  "sword_gryffindor": {
    "sec": "artifacts",
    "name": "Меч Годрика Гриффиндора",
    "icon": "🗡️",
    "tag": "Оружие истинных храбрецов",
    "lead": "Выкован королем гоблинов Рагнуком I из чистого серебра и инкрустирован рубинами.",
    "desc": "Тысячелетний серебряный полуторный меч великого основателя Хогвартса. По законам гоблинской ковки клинок не тускнеет от времени, не требует чистки и впитывает в себя исключительно то, что делает его сильнее: пронзив пасть тысячелетнего василиска в Тайной Комнате, меч напитался смертоносным ядом змея, превратившись в совершенное оружие против крестражей. Меч заколдован основателем так, чтобы являться из Распределяющей шляпы исключительно истинному гриффиндорцу в минуту крайней смертельной опасности."
  },
  "deluminator": {
    "sec": "artifacts",
    "name": "Делюминатор Альбуса Дамблдора",
    "icon": "✨",
    "tag": "Хранитель света и сердца",
    "lead": "Уникальный прибор в виде серебряной зажигалки, управляющий светом и зовом души.",
    "desc": "Изобретен лично Альбусом Дамблдором. При щелчке прибор бесшумно вытягивает свет из всех уличных фонарей, свечей и каминов на сотни метров вокруг, удерживая шары света внутри своего корпуса, а при повторном щелчке возвращает свет на место. Кроме того, Дамблдор наложил на него высшие связующие чары: когда Рон Уизли в отчаянии покинул друзей во время охоты за крестражами, Делюминатор уловил голос Гермионы, зовущей Рона по имени, и породил светящуюся пульсирующую искру, указавшую верный путь сквозь пространство."
  },
  "vanishing_cabinets": {
    "sec": "artifacts",
    "name": "Парные Исчезательные шкафы",
    "icon": "🚪",
    "tag": "Пространственный мост",
    "lead": "Зачарованная пара шкафов, создающая мгновенный тайный коридор сквозь любые защитные чары.",
    "desc": "Шкафы были созданы во время Первой магической войны, чтобы волшебники могли спрятаться от Пожирателей смерти и мгновенно перенестись в безопасное место. Человек или предмет, вошедший в один шкаф, материализуется во втором. Один из шкафов десятилетиями пылился в Выручай-комнате Хогвартса, а второй стоял в лавке темных артефактов «Горбин и Бэркес» в Лютном переулке. Драко Малфой сумел починить поврежденную связь с помощью заколдованной монеты и канарейки, обеспечив скрытное вторжение Пожирателей смерти в замок."
  },
  "apparition": {
    "sec": "transport",
    "name": "Трансгрессия и Расщепление",
    "icon": "⚡",
    "tag": "Мгновенное перемещение",
    "lead": "Магия пространственного скачка из одной точки мира в другую.",
    "desc": "Сложнейший способ перемещения, требующий абсолютной ментальной концентрации по правилу «Трех Н»:\n• Направление (Destination): четко представить пункт назначения до мельчайших деталей.\n• Настойчивость (Determination): проявить несгибаемую волю занять это пространство.\n• Неспешность (Deliberation): шагнуть в пустоту плавно и выверено.\nПри малейшем сомнении или панике происходит расщепление (Splinching) — части тела мага остаются в точке отправления. Обучение и сдача лицензии в Министерстве магии разрешены строго с семнадцати лет. Территория Хогвартса защищена древними чарами, делающими трансгрессию внутри замка невозможной для людей."
  },
  "floo_network": {
    "sec": "transport",
    "name": "Летучий порох и Каминная сеть",
    "icon": "🔥",
    "tag": "Каминные перелеты",
    "lead": "Мерцающий порошок Игнатии Уайлдсмит, превращающий пламя в сеть скоростных порталов.",
    "desc": "Изобретен в XIII веке. Щепотка порошка бросается в огонь, отчего пламя вспыхивает ярким изумрудно-зеленым светом. Волшебник шагает в огонь (не обжигающий кожу) и четко, без запинки произносит название нужного камина. Если произнести название невнятно (как Гарри сказал «Диагон-алли» вместо «Косой переулок»), маг вылетит из камина в сомнительном месте вроде Лютного переулка. Сеть объединяет тысячи зарегистрированных каминов в жилых домах, Министерстве и пабах. Также можно вести беседу, просунув в огонь только голову."
  },
  "portkeys": {
    "sec": "transport",
    "name": "Порталы (Portkeys)",
    "icon": "🥫",
    "tag": "Групповые перелеты",
    "lead": "Зачарованные бытовые предметы, переносящие группы магов в строго назначенное мгновение.",
    "desc": "Порталы создаются заклинанием Портус (Portus) под строгим надзором Департамента магического транспорта. В качестве порталов специально используют самый неприметный магловский мусор (старый дырявый башмак, ржавую консервную банку, спущенный резиновый мяч), чтобы не привлекать внимание не-магов. В назначенную секунду все, кто держится пальцем за предмет, испытывают рывок где-то в районе пупка и несутся сквозь цветной вихрь к месту назначения. Незаменимы для доставки сотен тысяч зрителей на Чемпионат мира по квиддичу."
  },
  "knight_bus": {
    "sec": "transport",
    "name": "«Ночной Рыцарь» (The Knight Bus)",
    "icon": "🚌",
    "tag": "Экстренный экспресс",
    "lead": "Фиолетовый трехэтажный автобус для ведьм и волшебников, попавших в беду.",
    "desc": "Появляется с оглушительным взрывом из воздуха, стоит волшебнику на улице взмахнуть палочкой, удерживая руку на уровне пояса. Внутри автобуса днем стоят деревянные кресла, а ночью — ряды железных панцирных кроватей со свечами в медных подсвечниках. Под управлением подслеповатого водителя Эрни Пранга и кондуктора Стэна Шанпайка автобус на сумасшедшей скорости носится по Британии, заставляя магловские фонари, заборы и телефонные будки в панике расступаться в стороны."
  },
  "hogwarts_express": {
    "sec": "transport",
    "name": "Хогвартс-экспресс и Платформа 9¾",
    "icon": "🚂",
    "tag": "Школьный поезд",
    "lead": "Алый локомотив с паровой тягой, уносящий юных магов навстречу приключениям.",
    "desc": "В 1830 году Министр магии Отталин Гамбол приказала конфисковать и зачаровать магловский паровоз для безопасной и централизованной доставки студентов в школу. Поезд отправляется с лондонского вокзала Кингс-Кросс ровно в 11:00 первого сентября. Попасть на невидимую платформу 9¾ можно, только смело пройдя сквозь массивную кирпичную перегородку между платформами 9 и 10. Путь через живописные шотландские горы длится весь день до сумерек, завершаясь на станции Хогсмид."
  },
  "patronus_messenger": {
    "sec": "transport",
    "name": "Патронус как средство связи",
    "icon": "🕊️",
    "tag": "Связь Ордена",
    "lead": "Гениальная методика Дамблдора для мгновенной доставки сообщений сквозь любые барьеры.",
    "desc": "Обычный Патронус служит лишь защитой от дементоров и смеркулей. Однако Альбус Дамблдор разработал секретную модификацию чар, доверенную исключительно членам Ордена Феникса. Серебряный призрачный защитник мага способен преодолевать колоссальные расстояния, пролетать сквозь монолитные стены и вражеские охранные чары и говорить человеческим голосом своего создателя (как рысь Кингсли Бруствера ворвалась на свадьбу в Норе со словами: «Министерство пало. Скримджер мертв. Они идут»). Перехватить такое сообщение темной магией невозможно."
  },
  "hogwarts_castle": {
    "sec": "locations",
    "name": "Школа Чародейства и Волшебства Хогвартс",
    "icon": "🏰",
    "tag": "Школа магии",
    "lead": "Древнейшая магическая твердыня Шотландии, основанная более тысячи лет назад.",
    "desc": "Замок с бесчисленными башнями, тайными лестницами, меняющими направление, Большим Залом с заколдованным потолком, отображающим погоду на улице, Выручай-комнатой и Тайной Комнатой в глубинах фундамента. Защищен могущественными чарами маглоотталкивания и ненаносимости на магловские карты."
  },
  "hogsmeade": {
    "sec": "locations",
    "name": "Деревня Хогсмид (Hogsmeade)",
    "icon": "🍻",
    "tag": "Поселение магов",
    "lead": "Единственная полностью волшебная деревня во всей Великобритании.",
    "desc": "Живописное поселение с соломенными крышами у подножия замка Хогвартс. Знаменитые заведения: паб «Три Метлы» с фирменным сливочным пивом мадам Розмерты, паб «Кабанья Голова» Аберфорта Дамблдора, кондитерская «Сладкое Королевство» и Воющая Хижина — самое пугающее здание Британии."
  },
  "diagon_alley": {
    "sec": "locations",
    "name": "Косой переулок (Diagon Alley)",
    "icon": "🛍️",
    "tag": "Магический Лондон",
    "lead": "Торговое сердце волшебного мира за пабом «Дырявый Котёл».",
    "desc": "Мощеная улица, вход на которую открывается постукиванием палочки по кирпичу в стене заднего двора. Здесь расположены: белоснежный мраморный банк «Гринготтс» под охраной гоблинов и дракона, лавка Олливандера, магазин одежды мадам Малкин, книжный «Флориш и Блоттс» и «Всевозможные волшебные вредилки» братьев Уизли."
  },
  "knockturn_alley": {
    "sec": "locations",
    "name": "Лютный переулок (Knockturn Alley)",
    "icon": "🖤",
    "tag": "Тёмный квартал",
    "lead": "Мрачное туманное ответвление Косого переулка, пристанище темных магов и скупщиков краденого.",
    "desc": "Узкий, промозглый переулок, окутанный черным смогом. Приличные волшебники избегают появляться здесь без крайней нужды. Витрины пестрят сушеными человеческими пальцами, ядами акромантула, оживающими колодами карт и проклятыми масками. Сердце переулка — антикварная лавка «Горбин и Бэркес» (Borgin and Burkes), где хранятся Проклятое опаловое ожерелье, Рука Славы (дарующая свет лишь тому, кто её держит) и второй Исчезательный шкаф. В юности здесь работал Том Реддл, выведывая тайны древних реликвий."
  },
  "azkaban": {
    "sec": "locations",
    "name": "Тюрьма Азкабан (Azkaban)",
    "icon": "⚓",
    "tag": "Тюрьма строгого режима",
    "lead": "Зловещая треугольная цитадель на крошечном островке в штормовых водах Северного моря.",
    "desc": "Изначально крепость темного мага Экриздиса. Десятилетиями служила тюрьмой для самых опасных волшебников. Охранялась сотнями дементоров, доводящих узников до безумия и истощения за считанные недели. Лишь единицам (Сириусу Блэку в форме пса и Барти Краучу-младшему) удавалось сбежать из ее ледяных стен."
  },
  "st_mungos": {
    "sec": "locations",
    "name": "Больница Святого Мунго (St Mungo's)",
    "icon": "🏥",
    "tag": "Магическая медицина",
    "lead": "Главный госпиталь магических травм и недугов Великобритании.",
    "desc": "Основана целителем Мунго Бонхэмом в начале XVII века. Расположена в центре Лондона, замаскирована под полуразрушенный магазин «Чисто и светло» (вход через стекло витрины с манекеном). Целители в лаймово-зеленых мантиях борются с последствиями магических катастроф. Шесть этажей разделены по типам травм: от отравлений ядовитыми растениями до неизлечимых ментальных повреждений (палата на 4 этаже, где лежат сошедшие с ума от пыток Беллатрисы Лестрейндж родители Невилла — Фрэнк и Алиса Долгопупс)."
  },
  "godrics_hollow": {
    "sec": "locations",
    "name": "Годрикова Впадина (Godric's Hollow)",
    "icon": "⛪",
    "tag": "Священная земля",
    "lead": "Историческая деревня, где веками бок о бок жили великие волшебники и маглы.",
    "desc": "Названа в честь родившегося здесь основателя школы Годрика Гриффиндора. Здесь изобретатель Боумен Райт выковал первый золотой снитч. В конце XIX века сюда переехала семья Дамблдоров; здесь в юности подружились и замышляли переворот «Ради высшего блага» Альбус Дамблдор и Геллерт Грин-де-Вальд, пока трагическая дуэль не унесла жизнь юной Арианы. В этой же деревне в ночь на Хэллоуин 1981 года пали Джеймс и Лили Поттер, защитив маленького Гарри, а разрушенный коттедж стал памятником несокрушимой победы любви над смертью."
  },
  "forbidden_forest": {
    "sec": "locations",
    "name": "Запретный лес (Forbidden Forest)",
    "icon": "🌲",
    "tag": "Дикая глушь",
    "lead": "Первозданный реликтовый массив на границе школьных земель, куда студентам вход строго воспрещен.",
    "desc": "Огромный непроходимый лес с гигантскими вековыми вязами и дубами, куда не проникает дневной свет. Земля наполнена древней магией и опасными обитателями: табуны кентавров-астрономов, колония гигантских акромантулов в глубоком овраге, белоснежные дикие единороги, стадо фестралов, трехглавый пес Пушок, дикий великан Грохх и одичавший летающий автомобиль Форд «Англия» Артура Уизли, охотящийся на пауков."
  },
  "room_of_requirement": {
    "sec": "locations",
    "name": "Выручай-комната («Комната Так-и-Сяк»)",
    "icon": "🗝️",
    "tag": "Обитель чудес",
    "lead": "Тайное помещение замка, появляющееся лишь тогда, когда человек испытывает истинную нужду.",
    "desc": "Расположена на седьмом этаже напротив гобелена с танцующими троллями Варнавы Вздрюченного. Чтобы войти, нужно трижды пройти мимо пустой стены, сосредоточенно думая о том, что тебе необходимо. Комната способна стать тренировочной ареной Отряда Дамблдора, убежищем для студентов во время диктатуры Кэрроу или циклопическим складом забытых и спрятанных вещей размером с собор, где поколения учеников прятали сломанные метлы, книги по темной магии и где Волан-де-Морт укрыл Диадему Когтевран."
  },
  "quidditch_rules": {
    "sec": "quidditch",
    "name": "Правила Квиддича и Позиции",
    "icon": "🏆",
    "tag": "Спорт магов",
    "lead": "Самая захватывающая и опасная игра магического мира, проводящаяся на мётлах.",
    "desc": "В каждой команде 7 игроков:\n• 1 Ловец: охотится за неуловимым золотым снитчем.\n• 3 Охотника: пасуют кожаный квоффл и забивают его в три кольца ворот соперника (10 очков).\n• 2 Загонщика: вооружены битами, отбивают тяжелые бладжеры от своих и направляют во врагов.\n• 1 Вратарь: защищает три кольца от бросков квоффла."
  },
  "quidditch_balls": {
    "sec": "quidditch",
    "name": "Мячи: Снитч, Квоффл и Бладжеры",
    "icon": "⚽",
    "tag": "Мячи",
    "lead": "Четыре зачарованных мяча для трехмерной схватки в воздухе.",
    "desc": "• Золотой Снитч: Крошечный мячик размером с грецкий орех с серебряными трепещущими крыльями. Обладает тактильной памятью — помнит первое прикосновение поймавшего его ловца. Поимка снитча приносит 150 очков и немедленно завершает матч.\n• Квоффл: Алый кожаный мяч диаметром двенадцать дюймов без швов для точных пасов.\n• Бладжеры (2 шт.): Зачарованные шары из литого чугуна, бешено летающие по полю и стремящиеся сбить игроков с метел."
  },
  "racing_brooms": {
    "sec": "quidditch",
    "name": "Скоростные мётлы: «Молния» и «Нимбус»",
    "icon": "🧹",
    "tag": "Мётлы",
    "lead": "Шедевры магического аэродинамического искусства.",
    "desc": "• «Молния» (Firebolt): Метла международного профессионального класса. Разгон до 150 миль в час за десять секунд. Рукоять из отборного ясеня, прутья из березы, безупречный баланс и нерушимые чары торможения.\n• «Нимбус-2000» и «2001»: Быстрые и надежные спортивные мётлы с гладкими лакированными древками из красного дерева, долгое время доминировавшие в школьных турнирах Хогвартса.\n• «Комета-260» и «Чистомёт»: Народные надежные модели для начинающих игроков и полетов над двором Норы."
  },
  "quidditch_world_cup": {
    "sec": "quidditch",
    "name": "Чемпионат мира по квиддичу и Турниры",
    "icon": "🌍",
    "tag": "Мировое первенство",
    "lead": "Грандиозный праздник международного масштаба, собирающий магов всех континентов.",
    "desc": "Проводится раз в четыре года с 1473 года. Для сокрытия игр от маглов возводятся колоссальные стадионы на 100 000 зрителей с трибунами, уходящими в облака, и мощнейшими маглоотталкивающими чарами. Знаменитый 422-й Чемпионат мира 1994 года между Ирландией и Болгарией вошел в историю благодаря невероятному финту Вронского в исполнении болгарского ловца Виктора Крама, поймавшего снитч, несмотря на поражение своей команды по очкам."
  },
  "wizard_currency": {
    "sec": "society",
    "name": "Монетная система волшебников",
    "icon": "🪙",
    "tag": "Экономика магов",
    "lead": "Золотые Галлеоны, серебряные Сикли и бронзовые Кнаты.",
    "desc": "Денежная система британских волшебников имеет строгий исторический курс:\n• 1 Золотой Галлеон = 17 серебряным Сиклям.\n• 1 Серебряный Сикль = 29 бронзовым Кнатам.\n• Соответственно, 1 Галлеон равен 493 Кнатам.\nВсе монеты чеканятся гоблинами банка Гринготтс из драгоценных металлов с защитной гоблинской магией от подделок и чар лепреконского золота (исчезающего через несколько часов). Согласно Первому закону Гэмпа об элементарных транфигурациях, настоящее золото и пищу невозможно создать из ничего — именно поэтому магическая валюта обладает реальной абсолютной ценностью."
  },
  "daily_prophet": {
    "sec": "society",
    "name": "«Ежедневный пророк» и Магическая пресса",
    "icon": "📰",
    "tag": "Печатное слово",
    "lead": "Главный информационный рупор Министерства магии с живыми движущимися колдографиями.",
    "desc": "«Ежедневный пророк» (Daily Prophet) выходит утренними и вечерними выпусками, доставляясь подписчикам совиной почтой. Фотографии в газетах живые — персонажи подмигивают, машут руками, а при возмущении могут уйти за край газетной полосы. Газета часто подвержена цензуре и давлению Министерства, очерняя неугодных магов. Скандальную славу изданию принесли разоблачительные статьи журналистки Риты Скитер, пользовавшейся зачарованным Прытко Пишущим Пером (Quick-Quotes Quill). Альтернативой официозу служит независимый журнал «Придира» (The Quibbler) под редакцией Ксенофилиуса Лавгуда."
  },
  "owl_post": {
    "sec": "society",
    "name": "Совиная почта и Магическая доставка",
    "icon": "🦉",
    "tag": "Связь сквозь бури",
    "lead": "Древнейшая и надежнейшая курьерская служба волшебного мира.",
    "desc": "Совы обладают сверхъестественным врожденным даром навигации: волшебнику достаточно привязать письмо к лапке птицы и назвать имя адресата. Сова найдет человека в любой точке планеты, даже если отправитель не знает города и адреса, если только получатель не скрыт специальными древними чарами ненаходимости. В Великобритании действуют почтовые отделения в Хогсмиде (сотни сов на жердочках от крошечных сычиков для быстрой переписки до массивных сипух для тяжелых посылок) и школьная Совятня на вершине Западной башни замка."
  },
  "wizard_cards": {
    "sec": "society",
    "name": "Шоколадные лягушки и Коллекционные карточки",
    "icon": "🐸",
    "tag": "Магическая культура",
    "lead": "Любимое лакомство школьников с прыгающим шоколадом и живыми портретами великих волшебников.",
    "desc": "В каждой пятиугольной сине-золотой коробочке находится заколдованная лягушка из молочного шоколада (содержит сок крокодила, позволяющий ей сделать один-два резвых прыжка) и карточка знаменитого мага с движущимся портретом и краткой биографией. Коллекционирование карточек — всеобщее увлечение от первокурсников до пожилых магов. Среди карточек: великие волшебники древности (Мерлин, Цирцея, Клиодна, Парацельс), основатели Хогвартса, алхимик Николас Фламель и сам Альбус Дамблдор (который признавался, что его не волнует лишение постов в Визенгамоте, лишь бы его не убирали с карточек шоколадных лягушек)."
  }
};

  var DEFAULT_WZ_SPELLS = [];

  /* ============================================================
     БАЗОВЫЙ НАБОР ДУЭЛЬНЫХ ПРИЁМОВ (DEFAULT_WZ_DUELS)
     ============================================================ */

  var DEFAULT_WZ_DUELS = [];

  /* ============================================================
     ЛОКАЦИИ КАРТЫ МАРОДЁРОВ: ХОГВАРТС (ИНТЕРЬЕР) И МИР ВОКРУГ
     Координаты на полотне 2800 x 2400
     ============================================================ */

  // 1. Внутренние залы, башни, подземелья и тайные ходы замка Хогвартс
  var WZ_HOGWARTS_LOCATIONS = [
    {
      id: 'great_hall',
      name: 'Большой Зал Хогвартса',
      region: '1 этаж / Главный дворец',
      x: 1480, y: 1150,
      icon: '🕯️',
      climate: 'Заколдованное небо',
      ruler: 'Профессор Макгонагалл',
      danger: 'Безопасно',
      desc: 'Величественный каменный зал: четыре факультетских стола, стол преподавателей на помосте, парящие тысячи свечей и зачарованный потолок, отражающий погоду за окном.'
    },
    {
      id: 'entrance_hall',
      name: 'Вестибюль и Парадный вход',
      region: '1 этаж / Входная группа',
      x: 1280, y: 1150,
      icon: '🚪',
      climate: 'Каменный холл',
      ruler: 'Аргус Филч (вахта)',
      danger: 'Песочные часы очков факультетов',
      desc: 'Грандиозный вестибюль с коваными дубовыми дверями. Отсюда ведут арки в Большой Зал, спуск в Подземелья Слизерина и проход к Движущейся Лестнице.'
    },
    {
      id: 'grand_staircase',
      name: 'Парадная Движущаяся Лестница',
      region: 'Центральная башня (1-7 этажи)',
      x: 1080, y: 1150,
      icon: '🪜',
      climate: 'Постоянно меняющаяся магия',
      ruler: 'Живые портреты предков',
      danger: 'Обманчивые ступеньки и внезапные повороты',
      desc: '142 заколдованные лестницы Хогвартса, которые непрерывно поворачиваются в воздухе. Стены от фундамента до шпилей увешаны сотнями говорящих портретов.'
    },
    {
      id: 'dumbledore_office',
      name: 'Кабинет Директора Дамблдора',
      region: 'Высокая круглая башня',
      x: 1080, y: 650,
      icon: '🧙‍♂️',
      climate: 'Древнейшая магия',
      ruler: 'Альбус Дамблдор',
      danger: 'Омут Памяти и серебряные приборы',
      desc: 'Светлый круглый кабинет за каменной горгульей («Лимонный шербет»). Здесь дремлют на стенах портреты прошлых директоров, сидит феникс Фоукс и хранится Распределяющая Шляпа.'
    },
    {
      id: 'gryffindor_tower',
      name: 'Башня Гриффиндора и Гостиная',
      region: '7 этаж / Восточное крыло',
      x: 680, y: 920,
      icon: '🦁',
      climate: 'Теплый огонь камина',
      ruler: 'Портрет Полной Дамы',
      danger: 'Безопасно для львов («Драконье брюхо»)',
      desc: 'Уютная круглая гостиная в ало-золотых тонах с ревущим пламенем в очаге, мягкими бархатными креслами и винтовыми лестницами в спальни мальчиков и девочек.'
    },
    {
      id: 'slytherin_dungeon',
      name: 'Подземелья и Гостиная Слизерина',
      region: 'Дно Чёрного Озера',
      x: 920, y: 1650,
      icon: '🐍',
      climate: 'Сырость и изумрудный полумрак',
      ruler: 'Профессор Северус Снейп',
      danger: 'Холод глубин и древние проклятия',
      desc: 'Низкая каменная зала под дном озера. Сквозь толстые зачарованные витражи льется зеленый свет воды, слышен плеск гигантского кальмара, горят резные черепа.'
    },
    {
      id: 'ravenclaw_tower',
      name: 'Башня Когтеврана',
      region: 'Западная высокая башня (7 этаж)',
      x: 1480, y: 550,
      icon: '🦅',
      climate: 'Горный бриз и звезды',
      ruler: 'Бронзовый молоточек-орел',
      danger: 'Философские логические загадки',
      desc: 'Изящный круглый зал с шелковыми лазурными шторами, мраморной статуей Кандиды Когтевран, звездным расписным куполом и богатейшей библиотекой поэзии.'
    },
    {
      id: 'hufflepuff_basement',
      name: 'Цоколь и Гостиная Пуффендуя',
      region: 'Рядом с кухнями (коридор бочек)',
      x: 1720, y: 1550,
      icon: '🦡',
      climate: 'Теплота, травы и выпечка',
      ruler: 'Профессор Помона Стебль',
      danger: 'Уксусная ловушка при неверном стуке',
      desc: 'Круглая, пронизанная солнцем комната с круглыми дубовыми дверями, похожими на крышки бочек. Повсюду кашпо с редкими цветущими суккулентами и медные чайники.'
    },
    {
      id: 'potions_class',
      name: 'Класс Зельеварения Снейпа',
      region: 'Подземелья Хогвартса',
      x: 1220, y: 1600,
      icon: '🧪',
      climate: 'Ледяной сквозняк и пар котлов',
      ruler: 'Профессор Снейп',
      danger: 'Ядовитые испарения и строжайший допрос',
      desc: 'Мрачный каменный подвал, уставленный стеклянными банками с маринованными ингредиентами, пучками трав и кипящими медными и оловянными котлами.'
    },
    {
      id: 'hogwarts_kitchens',
      name: 'Кухни Хогвартса (Эльфы-домовики)',
      region: 'Под Большим Залом',
      x: 1480, y: 1600,
      icon: '🥧',
      climate: 'Аромат жареного мяса и пирогов',
      ruler: 'Домовики (Добби, Винки)',
      danger: 'Риск переедания тыквенных пирожков',
      desc: 'Огромный зал точь-в-точь под Большим Залом. Чтобы войти, нужно пощекотать нарисованную грушу на натюрморте. Сотня эльфов готовит пиры на огромных очагах.'
    },
    {
      id: 'library_restricted',
      name: 'Библиотека и Запретная секция',
      region: '2 этаж / Восточное крыло',
      x: 1680, y: 850,
      icon: '📚',
      climate: 'Шелест пергамента и пыль веков',
      ruler: 'Мадам Ирма Пинс',
      danger: 'Кричащие книги черной магии на цепях',
      desc: 'Лабиринт высоких стеллажей до потолка. За железной решеткой скрыта Запретная Секция с гримуарами по темнейшим искусствам, требующая письменного разрешения преподавателя.'
    },
    {
      id: 'room_of_requirement',
      name: 'Выручай-комната («Так-и-сяк»)',
      region: '7 этаж, напротив гобелена Варнавы',
      x: 880, y: 780,
      icon: '🚪',
      climate: 'Волшебная адаптация под любую нужду',
      ruler: 'Магия замка Хогвартс',
      danger: 'Непредсказуемость содержимого',
      desc: 'Потайная комната, проявляющаяся на голой стене, если трижды пройти мимо с сильной нуждой в сердце. Штаб-квартира Отряда Дамблдора и хранилище забытых вещей.'
    },
    {
      id: 'hospital_wing',
      name: 'Больничное крыло мадам Помфри',
      region: '2 этаж / Башня',
      x: 1180, y: 880,
      icon: '🩹',
      climate: 'Запах Костероста и чистоты',
      ruler: 'Мадам Поппи Помфри',
      danger: 'Строжайший постельный режим',
      desc: 'Светлые палаты с белоснежными занавесками и ширмами. Место исцеления от укусов драконов, переломов после квиддича и проклятий шальной магии.'
    },
    {
      id: 'astronomy_tower_int',
      name: 'Астрономическая Башня (Шпиль)',
      region: 'Самая высокая точка Хогвартса',
      x: 720, y: 620,
      icon: '🔭',
      climate: 'Ледяной ночной ветер',
      ruler: 'Профессор Аврора Синистра',
      danger: 'Опасность падения с высоты парапета',
      desc: 'Самый высокий шпиль замка. Верхняя открытая терраса с бронзовыми телескопами и небесными глобусами для полуночных наблюдений за движением планет и комет.'
    },
    {
      id: 'dada_classroom',
      name: 'Класс Защиты от Темных Искусств',
      region: '3 этаж / Башня ЗОТИ',
      x: 1080, y: 1380,
      icon: '🛡️',
      climate: 'Запах пороха и сухих трав',
      ruler: 'Профессор Люпин / Грозный Глаз',
      danger: 'Боггарты, корнуэльские пикси и дуэли',
      desc: 'Просторная аудитория со скелетом виверны под стропилами, кованой винтовой лестницей в кабинет профессора и шкафом, в котором частенько стучит взаперти боггарт.'
    },
    {
      id: 'charms_classroom',
      name: 'Класс Заклинаний (Флитвик)',
      region: '3 этаж / Северный коридор',
      x: 1320, y: 1380,
      icon: '🪄',
      climate: 'Парящие перья и искры',
      ruler: 'Профессор Филиус Флитвик',
      danger: 'Шальные лучи и случайная левитация',
      desc: 'Ярусная аудитория со старинными деревянными скамьями. Крошечный профессор Флитвик ведет урок, стоя на кипе энциклопедий, обучая жестам палочки.'
    },
    {
      id: 'transfiguration_class',
      name: 'Класс Трансфигурации',
      region: 'Внутренний двор / 1 этаж',
      x: 1540, y: 1380,
      icon: '🐈',
      climate: 'Строгий порядок и тишина',
      ruler: 'Профессор Макгонагалл',
      danger: 'Превращение спичек в иголки и мышей в табакерки',
      desc: 'Строгая аудитория с высокими готическими окнами, выходящими в монастырский дворик. Клетки с птицами и крысами, на доске — формулы превращения живой материи.'
    },
    {
      id: 'divination_tower',
      name: 'Башня Прорицаний (Трелони)',
      region: 'Чердак Северной башни (люк)',
      x: 1780, y: 650,
      icon: '🔮',
      climate: 'Душный пар хереса и благовоний',
      ruler: 'Профессор Сивилла Трелони',
      danger: 'Регулярные предсказания смерти («Грим!»)',
      desc: 'Круглая теплая чердачная комната, куда поднимаются по висячей серебряной лестнице через люк. Заставлена ситцевыми пуфами, чаинками и хрустальными шарами.'
    },
    {
      id: 'owlery_tower',
      name: 'Совятня Хогвартса',
      region: 'Западная отдельно стоящая башня',
      x: 550, y: 1200,
      icon: '🦉',
      climate: 'Холодные сквозняки и шорох перьев',
      ruler: 'Школьные почтовые совы',
      danger: 'Скользкий каменный пол и совиный помет',
      desc: 'Круглая высокая каменная башня без оконных стекол. Вверх уходят ряды деревянных насестов для сотен почтовых сов всех мастей — от крошечных сычей до полярных сов.'
    },
    {
      id: 'trophy_room',
      name: 'Комната Наград и Доспехов',
      region: '3 этаж / Галерея славы',
      x: 920, y: 1020,
      icon: '🏆',
      climate: 'Блеск начищенного серебра и золота',
      ruler: 'Аргус Филч (надзиратель за отработками)',
      danger: 'Скрипящие рыцарские доспехи',
      desc: 'Стеклянные витрины с кубками школы, щитами старост и наградами по квиддичу за столетия. Место, где Малфой назначил Гарри Поттеру полночную дуэль.'
    },
    {
      id: 'myrtle_bathroom',
      name: 'Туалет Плаксы Миртл (Тайная Комната)',
      region: '2 этаж / Заброшенное крыло',
      x: 1120, y: 1780,
      icon: '🐍',
      climate: 'Вечно капающая вода и сырость',
      ruler: 'Призрак Плаксы Миртл',
      danger: 'Смертоносный взгляд Василиска Слизерина',
      desc: 'Заброшенный затопленный туалет. На медном кране одной из раковин выгравирована незаметная змейка — вход в тоннель к Тайной Комнате, открываемый Парселтангом.'
    },
    {
      id: 'secret_honeydukes',
      name: 'Ход за Одноглазой Ведьмой → Сладкое Королевство',
      region: '3 этаж / Секретный лаз Мародёров',
      x: 1360, y: 1850,
      icon: '🍬',
      climate: 'Узкий каменный желоб',
      ruler: 'Статуя Гунхильды из Горсмура',
      danger: 'Пароль «Диссендиум»',
      desc: 'Потайной лаз за горбом каменной ведьмы. Спуск по каменной горке ведет через километровый тоннель прямиком в подвал кондитерской лавки Хогсмида.'
    },
    {
      id: 'secret_willow_passage',
      name: 'Тайный лаз под Ивой → Воющая Хижина',
      region: 'Корни Гремучей Ивы',
      x: 1600, y: 1850,
      icon: '🏚️',
      climate: 'Темный подземный лаз',
      ruler: 'Сучок на стволе дерева',
      danger: 'Удары ветвей яростного дерева',
      desc: 'Подземный ход, вырытый Дамблдором для Римуса Люпина. Начинается под корнями смертоносной Гремучей Ивы и заканчивается в заколоченной спальне Воющей Хижины.'
    },
    {
      id: 'secret_room_passage',
      name: 'Ход из Выручай-комнаты → «Кабанья Голова»',
      region: '7 этаж / Тайный путь сопротивления',
      x: 880, y: 640,
      icon: '🍻',
      climate: 'Свежий горный воздух свободы',
      ruler: 'Аберфорт Дамблдор / Портрет Арианы',
      danger: 'Безопасный путь при осаде замка',
      desc: 'Тайный проход за волшебным портретом сестры Дамблдора Арианы в пабе Хогсмида. Единственный тайный ход, не нанесенный на старую Карту Мародёров.'
    }
  ];

  // 2. Внешний мир: окрестности Хогвартса, Шотландское нагорье, Хогсмид, Лондон и Азкабан
  var WZ_WORLD_LOCATIONS = [
    {
      id: 'hogwarts_castle',
      name: 'Замок Хогвартс (Внешний контур)',
      region: 'Шотландия / Высокогорье',
      x: 1400, y: 1100,
      icon: '🏰',
      climate: 'Магическая цитадель',
      ruler: 'Альбус Дамблдор',
      danger: 'Безопасно (Древние защитные чары)',
      desc: 'Величественный тысячелетний замок над горной долиной. Главные ворота с крылатыми вепрями, башни и неприступные скалы.'
    },
    {
      id: 'quidditch_pitch',
      name: 'Стадион для Квиддича',
      region: 'Территория Хогвартса',
      x: 1720, y: 1120,
      icon: '🏟️',
      climate: 'Открытое поле и трибуны',
      ruler: 'Мадам Трюк',
      danger: 'Падения с высоты и дикие бладжеры',
      desc: 'Овальный стадион с высокими трибунами в цветах четырех факультетов и золотыми кольцами ворот высотой пятьдесят футов.'
    },
    {
      id: 'hagrid_hut',
      name: 'Хижина Хагрида',
      region: 'Опушка Запретного Леса',
      x: 1260, y: 1280,
      icon: '🛖',
      climate: 'Опушка леса / Тыквенная грядка',
      ruler: 'Рубеус Хагрид',
      danger: 'Низкая (волкодав Клык)',
      desc: 'Уютная каменная хижина лесничего. Вокруг раскинулась тыквенная грядка, сушатся шкуры, а в очаге греется медный чайник.'
    },
    {
      id: 'whomping_willow',
      name: 'Гремучая Ива',
      region: 'Территория школы',
      x: 1510, y: 1260,
      icon: '🌳',
      climate: 'Опасное заколдованное растение',
      ruler: 'Охраняет тайный ход',
      danger: 'Крайне агрессивное дерево',
      desc: 'Яростное магическое дерево, крушащее ветвями все живое. В корнях спрятан тайный лаз, ведущий прямо в Воющую Хижину Хогсмида.'
    },
    {
      id: 'black_lake',
      name: 'Чёрное Озеро (Great Lake)',
      region: 'Шотландия',
      x: 1540, y: 1520,
      icon: '🌊',
      climate: 'Ледяные озерные глубины',
      ruler: 'Гигантский Кальмар и Русалки',
      danger: 'Гриндилоу и русалочий народ',
      desc: 'Глубокое холодное горное озеро. В темных водах обитают русалки, гриндилоу и добродушный Гигантский Кальмар, любящий тосты.'
    },
    {
      id: 'boathouse',
      name: 'Лодочный сарай и причал',
      region: 'Озерная пристань',
      x: 1390, y: 1290,
      icon: '⛵',
      climate: 'Водная гладь и туман',
      ruler: 'Хагрид (встреча первокурсников)',
      danger: 'Низкая',
      desc: 'Старинная лодочная станция у подножия замковых скал, куда каждый сентябрь приплывают заколдованные лодки с первокурсниками.'
    },
    {
      id: 'forbidden_forest',
      name: 'Запретный Лес (Forbidden Forest)',
      region: 'Дикие границы школы',
      x: 1040, y: 1400,
      icon: '🌲',
      climate: 'Дремучая древняя чаща',
      ruler: 'Кентавры (Магориан, Бейн)',
      danger: 'Высокая (Хищники, акромантулы)',
      desc: 'Дремучий вековой лес, вход в который строжайше запрещен ученикам. Здесь живут табуны кентавров, единороги и дикий Фордик «Англия».'
    },
    {
      id: 'aragog_lair',
      name: 'Логово Арагога',
      region: 'Сердце Запретного Леса',
      x: 840, y: 1560,
      icon: '🕷️',
      climate: 'Паучья паутина и мгла',
      ruler: 'Арагог и Мосаг',
      danger: 'Смертельная (Акромантулы)',
      desc: 'Глубокая впадина посреди леса, полностью затянутая белой паутиной. Дом гигантских плотоядных пауков-акромантулов.'
    },
    {
      id: 'hogsmeade_station',
      name: 'Станция Хогсмид',
      region: 'Горная ветка железной дороги',
      x: 1880, y: 1360,
      icon: '🚂',
      climate: 'Перрон / Горный пар',
      ruler: 'Кондуктор Хогвартс-экспресса',
      danger: 'Безопасно',
      desc: 'Станция, куда прибывает алый Хогвартс-экспресс из Лондона. Отсюда первокурсники садятся в лодки, а старшие — в кареты с фестралами.'
    },
    {
      id: 'hogsmeade_village',
      name: 'Деревня Хогсмид',
      region: 'Единственная маг-деревня Британии',
      x: 2120, y: 1220,
      icon: '🍺',
      climate: 'Уютная заснеженная деревня',
      ruler: 'Мадам Розмерта / Совет магов',
      danger: 'Безопасно',
      desc: 'Паб «Три Метлы» с теплым сливочным пивом, кондитерская «Сладкое Королевство», лавка приколов «Зонко» и почтовая станция сотен сов.'
    },
    {
      id: 'shrieking_shack',
      name: 'Воющая Хижина',
      region: 'Окраина Хогсмида на холме',
      x: 2040, y: 1040,
      icon: '🏚️',
      climate: 'Заколоченные окна и скрип полов',
      ruler: 'Убежище Римуса Люпина',
      danger: 'Привидения и старые проклятия',
      desc: 'Самое пугающее здание в Британии. Построено Дамблдором для безопасных превращений оборотня Римуса Люпина в полнолуние.'
    },
    {
      id: 'kings_cross',
      name: 'Вокзал Кингс-Кросс (Платформа 9¾)',
      region: 'Лондон',
      x: 2520, y: 1960,
      icon: '🧱',
      climate: 'Городской викторианский вокзал',
      ruler: 'Министерство магии',
      danger: 'Маглы (требуется скрытность)',
      desc: 'Знаменитый кирпичный барьер между платформами 9 и 10, через который волшебники проходят к алому паровозу Хогвартс-экспресс.'
    },
    {
      id: 'diagon_alley_loc',
      name: 'Косой Переулок и Гринготтс',
      region: 'Лондон (Магический сектор)',
      x: 2440, y: 2180,
      icon: '🪙',
      climate: 'Булыжная мостовая и витрины',
      ruler: 'Гоблины банка Гринготтс',
      danger: 'Низкая (карманники Лютьего переулка)',
      desc: 'Главная торговая улица магов Великобритании. Банк Гринготтс с подземными рельсами, лавка Олливандера и аптеки ингредиентов.'
    },
    {
      id: 'ministry_magic_loc',
      name: 'Министерство Магии',
      region: 'Лондон (Подземный комплекс)',
      x: 2320, y: 2320,
      icon: '⚖️',
      climate: 'Атриум с золотыми фонтанами',
      ruler: 'Министр магии',
      danger: 'Охрана мракоборцев',
      desc: 'Подземный правительственный дворец. Атриум с зеленым каминным пламенем, залы Визенгамота и сверхсекретный Отдел Тайн.'
    },
    {
      id: 'azkaban_loc',
      name: 'Крепость Азкабан',
      region: 'Северное море',
      x: 620, y: 520,
      icon: '⚓',
      climate: 'Штормовые ледяные скалы',
      ruler: 'Дементоры / Министерство',
      danger: 'Чрезвычайная (Дементоры и отчаяние)',
      desc: 'Одинокая треугольная крепость посреди свирепого Северного моря. Тюрьма строгого режима для самых опасных темных магов.'
    }
  ];

  // Активный список локаций в зависимости от режима карты
  function getActiveLocations(){
    var sc = (WZ.map && WZ.map.scope) || 'hogwarts';
    return sc === 'hogwarts' ? WZ_HOGWARTS_LOCATIONS : WZ_WORLD_LOCATIONS;
  }

  // Для обратной совместимости
  var WZ_MAP_LOCATIONS = WZ_HOGWARTS_LOCATIONS;

  /* Методы загрузки и сохранения заклинаний и приёмов */
  WZ.loadSpells = function(){
    try {
      var raw = localStorage.getItem(WZ_SPELLS_KEY);
      if(raw){
        var arr = JSON.parse(raw);
        if(Array.isArray(arr)){
          var hadMana = false;
          var userArr = arr.filter(function(s){
            if(!s || !s.id) return false;
            if(s.id.match(/^sp_(expelliarmus|protego|stupefy|lumos|wingardium|avada|incendio|accio|sectumsempra|patronum|expecto|alohomora|petrificus)/i)) return false;
            if(!s.id.match(/\d{6,}/) && !s.id.startsWith('wz_sp_')) return false;
            return true;
          }).map(function(s){
            if(s && typeof s.cost === 'string' && /ман/i.test(s.cost)){
              var cleaned = s.cost.replace(/\b\d*\s*ман[а-яё]*/gi, '').trim();
              s.cost = cleaned || 'Мгновенно';
              hadMana = true;
            }
            return s;
          });
          WZ.spells = userArr;
          if(userArr.length !== arr.length || hadMana){
            WZ.saveSpells();
          }
          return userArr;
        }
      }
    } catch(e){}
    WZ.spells = [];
    WZ.saveSpells();
    return WZ.spells;
  };

  WZ.saveSpells = function(){
    try {
      localStorage.setItem(WZ_SPELLS_KEY, JSON.stringify(WZ.spells || []));
    } catch(e){}
  };

  WZ.getSpellById = function(id){
    if(!WZ.spells) WZ.loadSpells();
    return (WZ.spells || []).find(function(s){ return s.id === id; });
  };

  WZ.loadDuels = function(){
    try {
      var raw = localStorage.getItem(WZ_DUELS_KEY);
      if(raw){
        var arr = JSON.parse(raw);
        if(Array.isArray(arr)){
          var userArr = arr.filter(function(d){
            if(!d || !d.id) return false;
            if(d.id.match(/^duel_(protego_reflect|nonverbal_snap|stupefy_disarm|transfig_shield|combat_apparate|wand_feint)/i)) return false;
            if(!d.id.match(/\d{6,}/) && !d.id.startsWith('wz_duel_')) return false;
            return true;
          });
          WZ.duels = userArr;
          if(userArr.length !== arr.length){
            WZ.saveDuels();
          }
          return userArr;
        }
      }
    } catch(e){}
    WZ.duels = [];
    WZ.saveDuels();
    return WZ.duels;
  };

  WZ.saveDuels = function(){
    try {
      localStorage.setItem(WZ_DUELS_KEY, JSON.stringify(WZ.duels || []));
    } catch(e){}
  };

  WZ.getDuelById = function(id){
    if(!WZ.duels) WZ.loadDuels();
    return (WZ.duels || []).find(function(d){ return d.id === id; });
  };

  /* Методы загрузки и сохранения магических навыков */
  var WZ_SKILL_KINDS = [
    'Академические дисциплины',
    'Практическое мастерство',
    'Высшие магические искусства',
    'Артефакторика и ремесло',
    'Быт и знание мира'
  ];

  var WZ_SKILL_LEVELS = [
    'Начатки',
    'Ученик',
    'Практик',
    'Мастер'
  ];

  var WZ_SKILL_ABILS = [
    'Интеллект',
    'Мудрость',
    'Харизма',
    'Ловкость',
    'Сила',
    'Телосложение'
  ];

  function getWzSkillLevelSlug(lvl){
    if(!lvl) return 'nachatki';
    var s = String(lvl).toLowerCase();
    if(s.indexOf('начат') >= 0) return 'nachatki';
    if(s.indexOf('учен') >= 0) return 'uchenik';
    if(s.indexOf('практ') >= 0) return 'praktik';
    if(s.indexOf('маст') >= 0) return 'master';
    return 'nachatki';
  }

  function newWzSkill(){
    return {
      id: 'wz_sk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: '',
      kind: 'Академические дисциплины',
      level: 'Ученик',
      abil: 'Интеллект',
      mod: '',
      source: '',
      gives: '',
      desc: ''
    };
  }

  WZ.loadSkills = function(){
    try {
      var raw = localStorage.getItem(WZ_SKILLS_KEY);
      if(raw){
        var arr = JSON.parse(raw);
        if(Array.isArray(arr)){
          WZ.skills = arr;
          return arr;
        }
      }
    } catch(e){}
    WZ.skills = [];
    WZ.saveSkills();
    return WZ.skills;
  };

  WZ.saveSkills = function(){
    try {
      localStorage.setItem(WZ_SKILLS_KEY, JSON.stringify(WZ.skills || []));
    } catch(e){}
  };

  WZ.getSkillById = function(id){
    if(!WZ.skills) WZ.loadSkills();
    return (WZ.skills || []).find(function(s){ return s.id === id; });
  };

  WZ.loadRoute = function(){
    try {
      var raw = localStorage.getItem(WZ_ROUTE_KEY);
      if(raw){
        var data = JSON.parse(raw);
        if(data){
          if(data.scope) WZ.map.scope = data.scope;
          if(data.routes && typeof data.routes === 'object') WZ.map.routes = data.routes;
          var sc = WZ.map.scope || 'hogwarts';
          if(WZ.map.routes && WZ.map.routes[sc]){
            WZ.map.routePoints = WZ.map.routes[sc].points || [];
            WZ.map.travelMode = WZ.map.routes[sc].travelMode || (sc === 'hogwarts' ? 'walk' : 'broom');
            WZ.map.travelPace = WZ.map.routes[sc].travelPace || 'normal';
          } else if(Array.isArray(data.points)){
            WZ.map.routePoints = data.points;
            WZ.map.travelMode = data.travelMode || (sc === 'hogwarts' ? 'walk' : 'broom');
            WZ.map.travelPace = data.travelPace || 'normal';
          }
          return data;
        }
      }
    } catch(e){}
    var scDef = WZ.map.scope || 'hogwarts';
    WZ.map.routePoints = [];
    WZ.map.travelMode = (scDef === 'hogwarts' ? 'walk' : 'broom');
    WZ.map.travelPace = 'normal';
    return { points: [], travelMode: WZ.map.travelMode, travelPace: 'normal' };
  };

  WZ.saveRoute = function(){
    try {
      var sc = WZ.map.scope || 'hogwarts';
      if(!WZ.map.routes) WZ.map.routes = {};
      WZ.map.routes[sc] = {
        points: WZ.map.routePoints || [],
        travelMode: WZ.map.travelMode || (sc === 'hogwarts' ? 'walk' : 'broom'),
        travelPace: WZ.map.travelPace || 'normal'
      };
      var data = {
        scope: sc,
        routes: WZ.map.routes,
        points: WZ.map.routePoints || [],
        travelMode: WZ.map.travelMode || (sc === 'hogwarts' ? 'walk' : 'broom'),
        travelPace: WZ.map.travelPace || 'normal'
      };
      localStorage.setItem(WZ_ROUTE_KEY, JSON.stringify(data));
    } catch(e){}
  };

  WZ.loadUserMarkers = function(){
    try {
      var raw = localStorage.getItem(WZ_MARKERS_KEY);
      if(raw){
        var arr = JSON.parse(raw);
        if(Array.isArray(arr)){
          WZ.map.userMarkers = arr;
          return arr;
        }
      }
    } catch(e){}
    WZ.map.userMarkers = [];
    return [];
  };

  WZ.saveUserMarkers = function(){
    try {
      localStorage.setItem(WZ_MARKERS_KEY, JSON.stringify(WZ.map.userMarkers || []));
    } catch(e){}
  };

  /* Логистика перемещения по волшебному миру и Хогвартсу */
  function getWzTerrainAt(x, y){
    var sc = (WZ.map && WZ.map.scope) || 'hogwarts';
    if(sc === 'hogwarts'){
      if(y > 1520) return { type: 'dungeon', name: 'Подземелья и Зельеварение', icon: '🧪', mult: 1.2 };
      if(x < 850 && y < 1050) return { type: 'tower', name: 'Башня Гриффиндора', icon: '🦁', mult: 1.3 };
      if(x > 1400 && y < 750) return { type: 'tower', name: 'Башня Когтеврана', icon: '🦅', mult: 1.3 };
      if(y < 780 && x < 1250) return { type: 'tower', name: 'Башня Директора / Астрономия', icon: '🔭', mult: 1.4 };
      if(x > 950 && x < 1200 && y > 980 && y < 1300) return { type: 'stairs', name: 'Движущиеся Лестницы', icon: '🪜', mult: 1.5 };
      if(x > 1250 && x < 1650 && y > 980 && y < 1300) return { type: 'hall', name: 'Большой Зал и Вестибюль', icon: '🕯️', mult: 1.0 };
      if(x > 1550 && y > 750 && y < 1050) return { type: 'library', name: 'Библиотека Хогвартса', icon: '📚', mult: 1.1 };
      if(y > 1750 || (x < 920 && y > 1700)) return { type: 'secret', name: 'Тайный ход Мародёров', icon: '🗝️', mult: 0.8 };
      return { type: 'corridor', name: 'Замковый коридор', icon: '🏰', mult: 1.0 };
    }

    // Мир вокруг: нагорье, озеро, лес, Хогсмид, Лондон
    if(x < 1150 && y > 1300) return { type: 'forest', name: 'Запретный Лес', icon: '🌲', mult: 1.6 };
    if(x > 1400 && y > 1380 && y < 1700) return { type: 'lake', name: 'Чёрное Озеро', icon: '🌊', mult: 1.4 };
    if(x > 1850 && y < 1350) return { type: 'hogsmeade', name: 'Окрестности Хогсмида', icon: '🏘️', mult: 1.0 };
    if(y > 1850) return { type: 'london', name: 'Магический Лондон', icon: '🏛️', mult: 1.0 };
    if(x < 800 && y < 800) return { type: 'sea', name: 'Северное Море', icon: '⚓', mult: 1.8 };
    if(x > 1200 && x < 1650 && y > 900 && y < 1300) return { type: 'hogwarts', name: 'Земли Хогвартса', icon: '🏰', mult: 1.0 };
    return { type: 'highlands', name: 'Шотландское Нагорье', icon: '⛰️', mult: 1.3 };
  }

  function calcWzRoute(points, mode, pace){
    var sc = (WZ.map && WZ.map.scope) || 'hogwarts';
    pace = pace || 'normal';

    if(sc === 'hogwarts'){
      mode = mode || 'walk';
      // Внутренние скорости Хогвартса (ярдов в минуту):
      var speedMapH = { walk: 60, sprint: 120, cloak: 40, secret: 90 };
      var baseSpeedH = speedMapH[mode] || 60;
      var paceMultH = (pace === 'fast' ? 1.3 : (pace === 'stealth' ? 0.75 : 1.0));
      var yardsPerMin = baseSpeedH * paceMultH;

      if(!points || points.length < 2){
        return {
          scope: 'hogwarts',
          totalDist: 0,
          totalMinutes: 0,
          totalSeconds: 0,
          dominantTerrain: { name: 'Замковые коридоры', icon: '🏰' },
          segments: [],
          mode: mode,
          pace: pace,
          warnings: []
        };
      }

      var totalYards = 0;
      var totalWeightedYards = 0;
      var segmentsH = [];
      var terCountsH = {};
      var warningsH = [];

      for(var h = 0; h < points.length - 1; h++){
        var hp1 = points[h];
        var hp2 = points[h + 1];
        var pDistH = Math.hypot(hp2.x - hp1.x, hp2.y - hp1.y);

        // Масштаб внутри Хогвартса: 100px ~ 40 ярдов
        var yards = Math.max(5, Math.round(pDistH * 0.4));
        totalYards += yards;

        var mXh = Math.round((hp1.x + hp2.x) / 2);
        var mYh = Math.round((hp1.y + hp2.y) / 2);
        var terH = getWzTerrainAt(mXh, mYh);

        terCountsH[terH.name] = (terCountsH[terH.name] || 0) + yards;

        var effMultH = terH.mult || 1.0;
        if(mode === 'secret' && terH.type === 'secret') effMultH = 0.6;
        if(mode === 'cloak') effMultH = Math.min(effMultH, 1.05);

        var wDistH = yards * effMultH;
        totalWeightedYards += wDistH;

        var segMinsFloat = (wDistH / yardsPerMin);
        var segMins = Math.floor(segMinsFloat);
        var segSecs = Math.round((segMinsFloat - segMins) * 60);

        segmentsH.push({
          from: hp1.name || ('Точка ' + (h + 1)),
          to: hp2.name || ('Точка ' + (h + 2)),
          dist: yards,
          terrain: terH,
          timeStr: segMins > 0 ? (segMins + ' мин. ' + segSecs + ' с.') : (segSecs + ' с.')
        });
      }

      var topTerNameH = 'Замковые коридоры';
      var topTerYards = 0;
      for(var kh in terCountsH){
        if(terCountsH[kh] > topTerYards){
          topTerYards = terCountsH[kh];
          topTerNameH = kh;
        }
      }
      var sampleTerH = getWzTerrainAt(points[0].x, points[0].y);
      var dominantTerH = { name: topTerNameH, icon: sampleTerH.icon };

      var totalTimeMinsRaw = totalWeightedYards / yardsPerMin;
      var totalMinutes = Math.floor(totalTimeMinsRaw);
      var totalSeconds = Math.round((totalTimeMinsRaw - totalMinutes) * 60);
      if(totalSeconds >= 60){
        totalMinutes += 1;
        totalSeconds = 0;
      }

      if(mode === 'sprint'){
        warningsH.push('⚠️ Бег по коридорам: риск столкнуться с завхозом Филчем или привлечь внимание старост!');
      }
      if(totalYards > 600 && mode !== 'secret'){
        warningsH.push('💡 Маршрут длинный: можно срезать через потайной лаз или обойти лестницы через Выручай-комнату.');
      }

      return {
        scope: 'hogwarts',
        totalDist: totalYards,
        totalMinutes: totalMinutes,
        totalSeconds: totalSeconds,
        dominantTerrain: dominantTerH,
        segments: segmentsH,
        mode: mode,
        pace: pace,
        warnings: warningsH
      };
    }

    // World scope
    mode = mode || 'broom';
    var speedMap = { broom: 90, thestral: 110, foot: 20, express: 160 };
    var baseSpeed = speedMap[mode] || 90;

    var paceMult = (pace === 'fast' ? 1.3 : (pace === 'stealth' ? 0.75 : 1.0));
    var dailyMiles = baseSpeed * paceMult;

    if(!points || points.length < 2){
      return {
        scope: 'world',
        totalDist: 0,
        wholeDays: 0,
        remHours: 0,
        rations: 0,
        dominantTerrain: { name: 'Шотландское Нагорье', icon: '⛰️' },
        segments: [],
        mode: mode,
        pace: pace,
        warnings: []
      };
    }

    var totalDist = 0;
    var totalWeightedDist = 0;
    var segments = [];
    var terCounts = {};
    var warnings = [];

    for(var i = 0; i < points.length - 1; i++){
      var p1 = points[i];
      var p2 = points[i + 1];
      var pixelDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      // Масштаб: 100px ~ 12 миль
      var miles = Math.max(1, Math.round(pixelDist * 0.12));
      totalDist += miles;

      var midX = Math.round((p1.x + p2.x) / 2);
      var midY = Math.round((p1.y + p2.y) / 2);
      var ter = getWzTerrainAt(midX, midY);

      terCounts[ter.name] = (terCounts[ter.name] || 0) + miles;

      // Метла и Фестрал игнорируют наземный штраф леса
      var effMult = (mode === 'broom' || mode === 'thestral') ? 1.0 : ter.mult;
      if(mode === 'express' && ter.type !== 'hogsmeade' && ter.type !== 'london') effMult = 1.3;

      var wDist = miles * effMult;
      totalWeightedDist += wDist;

      var segDays = (wDist / dailyMiles).toFixed(1);
      segments.push({
        from: p1.name || ('Точка ' + (i + 1)),
        to: p2.name || ('Точка ' + (i + 2)),
        dist: miles,
        terrain: ter,
        days: segDays
      });
    }

    var topTerName = 'Шотландское Нагорье';
    var topTerMiles = 0;
    for(var k in terCounts){
      if(terCounts[k] > topTerMiles){
        topTerMiles = terCounts[k];
        topTerName = k;
      }
    }
    var sampleTer = getWzTerrainAt(points[0].x, points[0].y);
    var dominantTer = { name: topTerName, icon: sampleTer.icon };

    var totalDaysRaw = totalWeightedDist / dailyMiles;
    var wholeDays = Math.floor(totalDaysRaw);
    var remHours = Math.round((totalDaysRaw - wholeDays) * 8);

    if(remHours >= 8){
      wholeDays += 1;
      remHours = 0;
    }

    var rations = Math.max(1, Math.ceil(totalDaysRaw * 2));

    if(mode === 'foot' && totalDist > 40){
      warnings.push('⚠️ Пеший переход через горы Шотландии утомителен. Рекомендуется использовать метлу «Молния» или Хогвартс-экспресс.');
    }
    if(topTerName.indexOf('Запретный Лес') !== -1){
      warnings.push('🕷️ Маршрут пролегает через Запретный Лес. Велик риск столкновения с акромантулами или кентаврами!');
    }
    if(topTerName.indexOf('Северное Море') !== -1){
      warnings.push('⚓ Морской перелет в сторону Азкабана. Возможен сильный леденящий туман дементоров.');
    }

    return {
      scope: 'world',
      totalDist: totalDist,
      wholeDays: wholeDays,
      remHours: remHours,
      rations: rations,
      dominantTerrain: dominantTer,
      segments: segments,
      mode: mode,
      pace: pace,
      warnings: warnings
    };
  }

  /* ============================================================
     НАВИГАЦИОННЫЙ ОБРАБОТЧИК (wireWzNav)
     ============================================================ */

  function wireWzNav(){
    document.querySelectorAll('[data-nav], [data-go="dice"]').forEach(function(el){
      if(el.__wzNavBound) return;
      el.__wzNavBound = true;
      el.addEventListener('click', function(e){
        var nav = el.getAttribute('data-nav') || (el.getAttribute('data-go') === 'dice' ? 'dice' : null);
        if(nav && typeof window.navigate === 'function'){
          e.preventDefault();
          window.navigate(nav);
        }
      });
    });
  }

  /* ============================================================
     ГЛАВНЫЙ ЭКРАН ВОЛШЕБНИКА (wzHome)
     ============================================================ */

  function wzHome(){
    var p = WZ.getProfile();
    var hIcon = getHouseIcon(p.house);
    var houseClass = p.house ? ('wz-house-' + getHouseSlug(p.house)) : 'wz-house-neutral';

    var houseBadge = '';
    if(p.house && p.house !== 'Без факультета' && p.house !== 'Не распределен'){
      houseBadge = '<span class="wz-house-badge ' + getHouseSlug(p.house) + '">' + hIcon + ' ' + esc(p.house) + '</span>';
    } else {
      houseBadge = '<span class="wz-house-badge none" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#cbd5e1;">👤 ' + esc(p.house || 'Не распределен') + '</span>';
    }

    var charDisplayName = (p.firstName || p.lastName) ? [p.firstName, p.lastName].filter(Boolean).join(' ') : (p.name || 'Новый персонаж');
    var charDisplayTitle = p.title ? esc(p.title) : (p.house ? (esc(p.house) + ' • Маг') : 'Волшебник');

    var hpVal = p.maxHp != null ? p.maxHp : (p.hp != null ? p.hp : 20);
    var yearVal = p.year || p.course || p.profession || '1 курс';

    // HUD карточка волшебника
    var hud = '<div class="wz-hud ' + houseClass + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">' +
        '<div>' +
          '<div class="wz-title">' + (p.house ? hIcon : '🪄') + ' ' + esc(charDisplayName) + '</div>' +
          '<div style="font-family:\'EB Garamond\',serif;font-style:italic;color:var(--wz-gold-light);font-size:14.5px;margin-top:2px;">' +
            charDisplayTitle +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
          houseBadge +
          '<span class="wz-stat-badge year" title="Курс Хогвартса или профессия">🎓 ' + esc(yearVal) + '</span>' +
          '<span class="wz-stat-badge hp">❤️ ' + hpVal + ' HP</span>' +
          '<span class="wz-stat-badge ac">🛡️ КБ ' + (p.ac || 10) + '</span>' +
          '<button class="wz-hud-edit-btn" data-nav="wzData" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzData\');" title="Перейти к анкете и списку персонажей">⚙️ Ростер</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    var rule = '<div class="wz-rule"></div>';

    // 1. Бросок кубиков (кликабельный Hero Dice блок точно как в Ведьмаке!)
    var heroDice = '<div class="wz-hero-dice" data-go="dice" onclick="if(typeof window.navigate===\'function\') window.navigate(\'dice\');" role="button" tabindex="0" title="Открыть бросок костей">' +
      '<div class="wz-hero-dice-icon">' +
        (typeof dieShapeSvg === 'function' ? dieShapeSvg(20, 'wzHeroDie', 20) : '🎲') +
      '</div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="wz-hero-dice-title">Бросок костей</div>' +
        '<div class="wz-hero-dice-desc">Кубики d4–d100, проверки магических навыков, попадания заклятий и расчет урона чар</div>' +
      '</div>' +
      '<div class="wz-hero-dice-arrow">→</div>' +
    '</div>';

    // 2. Заголовок разделов
    var label = '<div class="section-label">СИСТЕМНЫЕ РАЗДЕЛЫ // ВОЛШЕБНИК</div>';

    // 3. Список разделов в сетке menu-list grid-2 (как в Ведьмаке и Шиноби!)
    var sectionsList = '<div class="menu-list grid-2">' +
      '<div class="wz-card wz-card-clickable" data-nav="wzSpells" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSpells\');" role="button" tabindex="0" title="Открыть Заклинания">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wz-card-title"><span>✨</span> Заклинания</div>' +
          '<div class="wz-card-desc">Книга заклинаний Хогвартса, боевые чары, инкантации и AI Генератор заклинаний</div>' +
        '</div>' +
        '<div class="wz-card-arrow">›</div>' +
      '</div>' +
      '<div class="wz-card wz-card-clickable" data-nav="wzDuels" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzDuels\');" role="button" tabindex="0" title="Открыть Дуэльные приёмы">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wz-card-title"><span>⚔️</span> Дуэльные приёмы</div>' +
          '<div class="wz-card-desc">Палочковые дуэли, парирование Протего, боевая аппарация, финты и AI Генератор</div>' +
        '</div>' +
        '<div class="wz-card-arrow">›</div>' +
      '</div>' +
      '<div class="wz-card wz-card-clickable" data-nav="wzSkills" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSkills\');" role="button" tabindex="0" title="Открыть Навыки">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wz-card-title"><span>🧠</span> Навыки</div>' +
          '<div class="wz-card-desc">Магические дисциплины, окклюменция, древние руны, зельеварение, ремесло и AI Генератор</div>' +
        '</div>' +
        '<div class="wz-card-arrow">›</div>' +
      '</div>' +
      '<div class="wz-card wz-card-clickable" data-nav="wzWand" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzWand\');" role="button" tabindex="0" title="Открыть Палочка">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wz-card-title"><span>🪄</span> Палочка</div>' +
          '<div class="wz-card-desc">Параметры волшебной палочки: древесина, сердцевина, длина, упругость и свойства</div>' +
        '</div>' +
        '<div class="wz-card-arrow">›</div>' +
      '</div>' +
      '<div class="wz-card wz-card-clickable" data-nav="wzRef" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzRef\');" role="button" tabindex="0" title="Открыть Справочник">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wz-card-title"><span>📚</span> Справочник Волшебного мира</div>' +
          '<div class="wz-card-desc">14 разделов энциклопедии: Школы магии мира, Ордена, Крестражи, Таланты, Зелья, Травология, Бестиарий и Артефакты</div>' +
        '</div>' +
        '<div class="wz-card-arrow">›</div>' +
      '</div>' +
      '<div class="wz-card wz-card-clickable" data-nav="wzData" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzData\');" role="button" tabindex="0" title="Открыть Данные">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="wz-card-title"><span>💾</span> Данные</div>' +
          '<div class="wz-card-desc">Анкета волшебника, характеристики, факультет и управление персонажами</div>' +
        '</div>' +
        '<div class="wz-card-arrow">›</div>' +
      '</div>' +
    '</div>';

    return hud + rule + heroDice + label + sectionsList;
  }

  function wireWzHome(){
    wireWzNav();
  }

  /* ============================================================
     ЭКРАН АНКЕТЫ ВОЛШЕБНИКА (wzData)
     ============================================================ */

  function wzData(){
    var profList = WZ.profiles || [];
    if(!profList.length){
      WZ.loadProfiles();
      profList = WZ.profiles || [];
    }
    var p = WZ.getActiveProfile();
    var meta = (typeof WZ.getMeta === 'function') ? WZ.getMeta() : (WZ.meta || {});

    var houseList = [
      { id: '', label: 'Без факультета (Не распределен / Свободный маг)', icon: '👤' },
      { id: 'Гриффиндор', label: 'Гриффиндор (Храбрость и благородство)', icon: '🦁' },
      { id: 'Слизерин', label: 'Слизерин (Амбиции и хитрость)', icon: '🐍' },
      { id: 'Когтевран', label: 'Когтевран (Мудрость и острый ум)', icon: '🦅' },
      { id: 'Пуффендуй', label: 'Пуффендуй (Верность и трудолюбие)', icon: '🦡' },
      { id: 'Мракоборец / Орден Феникса', label: 'Мракоборец / Орден Феникса', icon: '⚔️' },
      { id: 'Министерство Магии', label: 'Служащий Министерства Магии', icon: '🏛️' },
      { id: 'Пожиратель Смерти', label: 'Пожиратель Смерти (Тёмные искусства)', icon: '💀' }
    ];

    var profOptions = profList.map(function(item){
      var hIcon = getHouseIcon(item.house);
      var hLabel = item.house ? (' • ' + item.house) : ' • Без факультета';
      var itName = (item.firstName || item.lastName) ? [item.firstName, item.lastName].filter(Boolean).join(' ') : (item.name || 'Безымянный маг');
      var itYear = item.year || item.course || item.profession || '1 курс';
      var pTitle = hIcon + ' ' + itName + hLabel + ' (' + itYear + ')';
      return '<option value="' + escA(item.id) + '" ' + (item.id === WZ.activeProfileId ? 'selected' : '') + '>' + esc(pTitle) + '</option>';
    }).join('');

    var houseOptions = houseList.map(function(h){
      return '<option value="' + escA(h.id) + '" ' + ((p.house || '') === h.id ? 'selected' : '') + '>' + h.icon + ' ' + esc(h.label) + '</option>';
    }).join('');
    if(p.house && !houseList.some(function(h){ return h.id === p.house; })){
      houseOptions = '<option value="' + escA(p.house) + '" selected>🪄 ' + esc(p.house) + '</option>' + houseOptions;
    }

    var houseIcon = getHouseIcon(p.house);

    var fullName = (p.firstName || p.lastName) ? [p.firstName, p.lastName].filter(Boolean).join(' ') : (p.name || 'Новый волшебник');
    var fName = p.firstName != null ? p.firstName : (p.name ? p.name.split(' ')[0] : '');
    var lName = p.lastName != null ? p.lastName : (p.name ? p.name.split(' ').slice(1).join(' ') : '');

    var hpVal = p.maxHp != null ? p.maxHp : (p.hp != null ? p.hp : 20);
    var yearVal = p.year || p.course || p.profession || '1 курс';

    var isCollapsed = false;
    try { isCollapsed = localStorage.getItem('ttc_wz_char_collapsed') === '1'; } catch(e){}
    if(typeof WZ.charSheetCollapsed === 'boolean') isCollapsed = WZ.charSheetCollapsed;

    var houseBadgeHtml = p.house
      ? ('<span class="wz-house-badge ' + getHouseSlug(p.house) + '" style="font-size:11px;">' + houseIcon + ' ' + esc(p.house) + '</span>')
      : '<span class="wz-house-badge none" style="font-size:11px;">👤 Без факультета</span>';

    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Данные' }]) +
      '<button class="back" data-nav="wzHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzHome\');">← На главную</button>' +
      '<h1>Данные</h1>' +

      '<div class="sheet-section wz-data-section">' +
        '<div class="section-label" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
          '<span>👥 Выбор и управление персонажами</span>' +
          '<span style="font-size:12px;color:var(--wz-text-muted);">Всего профилей: ' + profList.length + '</span>' +
        '</div>' +
        '<div class="desc">' +
          'Выберите активного волшебника или создайте нового. Характеристики и параметры сохраняются индивидуально для каждого персонажа.' +
        '</div>' +

        '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin:14px 0 12px 0;">' +
          '<div style="flex:1;min-width:240px;">' +
            '<label style="display:block;font-size:12px;color:var(--wz-text-muted);margin-bottom:4px;font-weight:600;">Активный персонаж (переключение на лету):</label>' +
            '<select id="wzDataProfileSelect" class="wz-input" style="width:100%;font-size:14px;padding:9px 12px;border-radius:4px;">' +
              profOptions +
            '</select>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" id="wzDataNewProfileBtn" title="Создать нового волшебника">➕ Новый персонаж</button>' +
            '<button class="btn" id="wzDataCloneProfileBtn" title="Клонировать текущего волшебника">📋 Дублировать</button>' +
          '</div>' +
        '</div>' +

        '<div class="wz-char-sheet-card" id="wzCharSheetCard">' +
          '<div class="wz-char-header" id="wzCharHeaderToggle" style="cursor:pointer;user-select:none;display:flex;justify-content:space-between;align-items:center;gap:10px;" title="Нажмите, чтобы свернуть или развернуть анкету">' +
            '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
              '<span>Анкета волшебника: <b style="color:var(--wz-gold, #d4af37);">' + houseIcon + ' ' + esc(fullName) + '</b></span>' +
              houseBadgeHtml +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:6px;">' +
              '<span id="wzCharToggleLabel" style="font-size:11.5px;color:var(--wz-text-muted);font-weight:normal;">' + (isCollapsed ? 'Развернуть' : 'Свернуть') + '</span>' +
              '<span id="wzCharToggleIcon" style="font-size:12px;color:var(--wz-gold);transition:transform 0.2s ease;' + (isCollapsed ? 'transform:rotate(-90deg);' : '') + '">▼</span>' +
            '</div>' +
          '</div>' +

          '<div id="wzCharSheetContent" style="' + (isCollapsed ? 'display:none;' : '') + 'margin-top:14px;">' +
            '<div class="wz-edit-grid">' +
              '<div class="wz-edit-item">' +
                '<label>Имя</label>' +
                '<input type="text" id="wzDataInFirstName" class="wz-input" value="' + escA(fName) + '" placeholder="Имя">' +
              '</div>' +
              '<div class="wz-edit-item">' +
                '<label>Фамилия</label>' +
                '<input type="text" id="wzDataInLastName" class="wz-input" value="' + escA(lName) + '" placeholder="Фамилия">' +
              '</div>' +
              '<div class="wz-edit-item">' +
                '<label>Факультет / Принадлежность</label>' +
                '<select id="wzDataInHouse" class="wz-input">' + houseOptions + '</select>' +
              '</div>' +
              '<div class="wz-edit-item">' +
                '<label>Курс Хогвартса или профессия</label>' +
                '<input type="text" id="wzDataInYear" class="wz-input" list="wzDataYearList" value="' + escA(yearVal) + '" placeholder="1-7 курс или введите профессию...">' +
                '<datalist id="wzDataYearList">' +
                  '<option value="1 курс">1 курс (Первокурсник)</option>' +
                  '<option value="2 курс">2 курс</option>' +
                  '<option value="3 курс">3 курс (Выбор факультативов)</option>' +
                  '<option value="4 курс">4 курс</option>' +
                  '<option value="5 курс (С.О.В.)">5 курс (С.О.В.)</option>' +
                  '<option value="6 курс">6 курс (Углублённая магия)</option>' +
                  '<option value="7 курс (Ж.А.Б.А.)">7 курс (Ж.А.Б.А. / Выпускной)</option>' +
                  '<option value="Выпускник Хогвартса">Выпускник Хогвартса</option>' +
                  '<option value="Мракоборец (Аврор)">Мракоборец (Аврор)</option>' +
                  '<option value="Преподаватель Хогвартса">Преподаватель Хогвартса</option>' +
                  '<option value="Мастер зелий">Мастер зелий (Зельевавар)</option>' +
                  '<option value="Магозоолог">Магозоолог (Исследователь существ)</option>' +
                  '<option value="Сотрудник Министерства">Сотрудник Министерства Магии</option>' +
                  '<option value="Невыразимец">Невыразимец (Отдел Тайн)</option>' +
                  '<option value="Целитель больницы Св. Мунго">Целитель больницы Св. Мунго</option>' +
                  '<option value="Мастер волшебных палочек">Мастер волшебных палочек</option>' +
                  '<option value="Игрок в Квиддич">Игрок в Квиддич</option>' +
                  '<option value="Пожиратель Смерти">Пожиратель Смерти</option>' +
                  '<option value="Торговец Косого переулка">Торговец Косого переулка</option>' +
                '</datalist>' +
              '</div>' +
              '<div class="wz-edit-item">' +
                '<label>Титул / Прозвище / Роль</label>' +
                '<input type="text" id="wzDataInTitle" class="wz-input" value="' + escA(p.title || '') + '" placeholder="Например: Ловец сборной, Мракоборец">' +
              '</div>' +
              '<div class="wz-edit-item">' +
                '<label>Очки здоровья (HP)</label>' +
                '<input type="number" min="1" id="wzDataInHp" class="wz-input" value="' + escA(hpVal) + '" placeholder="20">' +
              '</div>' +
              '<div class="wz-edit-item">' +
                '<label>Класс брони (КБ / Защитные чары)</label>' +
                '<input type="number" id="wzDataInAc" class="wz-input" value="' + escA(p.ac != null ? p.ac : '10') + '" placeholder="10">' +
              '</div>' +
            '</div>' +

            '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:16px;">' +
              '<button class="btn btn-primary" id="wzDataSaveCharBtn">✓ Сохранить анкету</button>' +
              '<button class="btn" id="wzDataResetProfileBtn" title="Восстановить HP персонажа">🔄 Восстановить HP</button>' +
              '<button class="btn" id="wzDataDelProfileBtn" style="color:#ff7675;border-color:rgba(231,76,60,0.4);margin-left:auto;" title="Удалить текущий профиль">🗑️ Удалить профиль</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="sheet-section wz-data-section">' +
        '<div class="section-label">Параметры мира и кампании</div>' +
        fldWz('Название хроник / Кампании', '<input id="wzWName" class="wz-input" type="text" value="' + escA(meta.name || '') + '">') +
        fldWz('Заметки хроник Хогвартса и Магического Мира', '<textarea id="wzWNote" class="wz-input" rows="3">' + esc(meta.note || '') + '</textarea>') +
        '<div class="sheet-actions"><button class="btn-primary" id="wzWSave">Сохранить мир</button></div>' +
      '</div>' +

      (typeof GHSync !== 'undefined' ? GHSync.renderUI() : '') +

      '<div class="gh-sync-card" id="wzGeminiApiSection" style="margin-top:20px; margin-bottom:20px;">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">' +
          '<span style="font-size:20px;">🤖</span>' +
          '<div>' +
            '<div style="font-weight:700;font-size:14px;color:var(--wz-gold, #d4af37);">Google Gemini AI (Интеграция ИИ)</div>' +
            '<div style="font-size:12px;color:var(--wz-text-muted);">Генерация уникальных заклинаний, дуэльных приёмов и магических тайн</div>' +
          '</div>' +
        '</div>' +
        '<p style="font-size:12px;color:var(--wz-text-muted);margin:0 0 12px 0;">Ключ безопасно хранится <b style="color:var(--wz-gold, #d4af37);">только в браузере этого устройства</b>. Получить бесплатный API-ключ можно за пару минут в <a href="https://aistudio.google.com/" target="_blank" style="color:var(--wz-gold-light, #fef08a);text-decoration:underline;">Google AI Studio</a>.</p>' +
        '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">' +
          '<input type="password" id="wzDataGeminiKey" value="' + escA(typeof window.getGeminiApiKey === 'function' ? window.getGeminiApiKey() : '') + '" placeholder="Вставьте ключ AIzaSy..." style="flex:1; min-width:200px; background:rgba(0,0,0,0.5); border:1px solid rgba(212,175,55,0.3); color:#fff; padding:8px 12px; border-radius:4px; font-family:monospace; font-size:13px;">' +
          '<button class="btn-primary" id="wzDataSaveGeminiKey" style="background:linear-gradient(135deg, #78350f, #d4af37); border:none; padding:8px 16px; border-radius:4px; color:#fff; font-weight:bold; cursor:pointer;">💾 Сохранить API Ключ</button>' +
        '</div>' +
      '</div>' +

      (typeof AppStorage !== 'undefined' ? AppStorage.renderWidget('wz') : '') +

      '<div class="sheet-section wz-data-section">' +
        '<div class="section-label">Экспорт и импорт</div>' +
        '<div class="desc">Единый файл на весь режим «Волшебник»: все профили волшебников, заклинания, дуэли и хроники Хогвартса. Импорт заменяет текущее содержимое.</div>' +
        '<div class="sheet-actions">' +
          '<button class="btn-primary" id="wzExport">Экспорт в файл</button>' +
          '<button class="btn-ghost" id="wzImportBtn">Импорт из файла</button>' +
          '<input type="file" id="wzImportFile" accept="application/json,.json" style="display:none">' +
        '</div>' +
      '</div>';
  }

  function wireWzData(){
    if(typeof HB === 'undefined' || HB.mode !== 'wz') return;
    if(typeof GHSync !== 'undefined' && GHSync.wireUI) GHSync.wireUI();
    if(typeof AppStorage !== 'undefined' && AppStorage.wireWidget) AppStorage.wireWidget('wz');

    var g = function(id){ return document.getElementById(id); };
    var v = function(id){ var e = g(id); return e ? e.value : ''; };

    // Сворачивание / разворачивание анкеты
    var toggleHeader = g('wzCharHeaderToggle');
    if(toggleHeader && !toggleHeader.__wired){
      toggleHeader.__wired = true;
      toggleHeader.addEventListener('click', function(){
        var content = g('wzCharSheetContent');
        var icon = g('wzCharToggleIcon');
        var lbl = g('wzCharToggleLabel');
        if(!content) return;
        var isHidden = content.style.display === 'none';
        if(isHidden){
          content.style.display = 'block';
          if(icon) icon.style.transform = '';
          if(lbl) lbl.textContent = 'Свернуть';
          WZ.charSheetCollapsed = false;
          try{ localStorage.setItem('ttc_wz_char_collapsed', '0'); }catch(e){}
        } else {
          content.style.display = 'none';
          if(icon) icon.style.transform = 'rotate(-90deg)';
          if(lbl) lbl.textContent = 'Развернуть';
          WZ.charSheetCollapsed = true;
          try{ localStorage.setItem('ttc_wz_char_collapsed', '1'); }catch(e){}
        }
      });
    }

    // Выбор активного профиля
    var sel = g('wzDataProfileSelect');
    if(sel){
      sel.addEventListener('change', function(){
        WZ.switchProfile(this.value);
      });
    }

    // Создание нового профиля
    var newBtn = g('wzDataNewProfileBtn');
    if(newBtn){
      newBtn.addEventListener('click', function(){
        var fullName = prompt('Введите имя и фамилию нового волшебника (или оставьте пустым):', '');
        if(fullName !== null){
          fullName = fullName.trim();
          var parts = fullName ? fullName.split(/\s+/) : [];
          var fName = parts[0] || '';
          var lName = parts.slice(1).join(' ') || '';
          WZ.createProfile({
            name: fullName,
            firstName: fName,
            lastName: lName
          });
          WZ.toast('✓ Создана новая анкета: ' + (fullName || 'Новый волшебник'), 'success');
        }
      });
    }

    // Дублирование профиля
    var cloneBtn = g('wzDataCloneProfileBtn');
    if(cloneBtn){
      cloneBtn.addEventListener('click', function(){
        WZ.cloneProfile(WZ.activeProfileId);
        WZ.toast('✓ Анкета скопирована', 'success');
      });
    }

    // Сброс статов (восстановление HP)
    var resetBtn = g('wzDataResetProfileBtn');
    if(resetBtn){
      resetBtn.addEventListener('click', function(){
        var p = WZ.getActiveProfile();
        var fName = p ? ((p.firstName || p.lastName) ? [p.firstName, p.lastName].filter(Boolean).join(' ') : (p.name || '')) : '';
        var name = fName ? ('«' + fName + '»') : 'текущего волшебника';
        if(confirm('Восстановить HP персонажа ' + name + ' до максимума?')){
          WZ.resetProfile(WZ.activeProfileId);
          WZ.toast('🔄 HP персонажа восстановлено', 'success');
        }
      });
    }

    // Удаление профиля
    var delBtn = g('wzDataDelProfileBtn');
    if(delBtn){
      delBtn.addEventListener('click', function(){
        var p = WZ.getActiveProfile();
        var fName = p ? ((p.firstName || p.lastName) ? [p.firstName, p.lastName].filter(Boolean).join(' ') : (p.name || '')) : '';
        var name = fName ? ('«' + fName + '»') : 'этого волшебника';
        if(!confirm('Удалить анкету ' + name + '? Это действие необратимо.')) return;
        WZ.deleteProfile(WZ.activeProfileId);
        WZ.toast('🗑️ Анкета удалена', 'info');
      });
    }

    // Сохранение анкеты
    var saveCharBtn = g('wzDataSaveCharBtn');
    if(saveCharBtn){
      saveCharBtn.addEventListener('click', function(){
        var p = WZ.getActiveProfile();
        p.firstName = (v('wzDataInFirstName') || '').trim();
        p.lastName = (v('wzDataInLastName') || '').trim();
        p.name = [p.firstName, p.lastName].filter(Boolean).join(' ') || p.firstName || p.lastName || 'Новый волшебник';
        p.house = (v('wzDataInHouse') || '').trim();
        p.year = (v('wzDataInYear') || '').trim() || '1 курс';
        p.title = (v('wzDataInTitle') || '').trim();

        var hpVal = parseInt(v('wzDataInHp'), 10) || 20;
        p.maxHp = hpVal;
        p.hp = hpVal;

        p.ac = parseInt(v('wzDataInAc'), 10) || 10;

        delete p.level;
        delete p.mana;
        delete p.maxMana;

        WZ.saveProfiles();
        WZ.toast('✓ Анкета успешно сохранена!', 'success');
        if(typeof render === 'function') render();
      });
    }

    // Сохранение параметров мира
    var saveWorldBtn = g('wzWSave');
    if(saveWorldBtn){
      saveWorldBtn.addEventListener('click', function(){
        var meta = WZ.getMeta();
        meta.name = (v('wzWName') || '').trim();
        meta.note = (v('wzWNote') || '').trim();
        WZ.saveMeta(meta);
        WZ.toast('✓ Параметры магического мира сохранены!', 'success');
      });
    }

    // Сохранение Gemini API ключа
    var saveGeminiBtn = g('wzDataSaveGeminiKey');
    if(saveGeminiBtn){
      saveGeminiBtn.addEventListener('click', function(){
        var inp = g('wzDataGeminiKey');
        var k = inp ? inp.value.trim() : '';
        if(typeof window.setGeminiApiKey === 'function'){
          window.setGeminiApiKey(k);
        } else {
          try{ localStorage.setItem('gemini_api_key', k); }catch(e){}
        }
        WZ.toast(k ? '✓ API-ключ Gemini успешно сохранён!' : 'API-ключ удалён', 'success');
      });
    }

    // Экспорт в файл (JSON)
    var ex = g('wzExport');
    if(ex){
      ex.addEventListener('click', function(){
        var payload = {
          kind: 'wizard',
          version: 1,
          meta: WZ.meta,
          profiles: WZ.profiles,
          activeProfileId: WZ.activeProfileId,
          spells: WZ.spells || [],
          duels: WZ.duels || [],
          skills: WZ.skills || [],
          routes: WZ.map ? WZ.map.routes : null
        };
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = ((WZ.meta && WZ.meta.name) || 'wizard_chronicles').replace(/[^\wа-яА-ЯёЁ\- ]/g, '') + '.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function(){ URL.revokeObjectURL(a.href); }, 600);
      });
    }

    // Импорт из файла
    var ib = g('wzImportBtn'), ifl = g('wzImportFile');
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
            if(!confirm('Заменить текущие данные режима «Волшебник» данными из файла?')) return;
            if(Array.isArray(data.profiles) && data.profiles.length > 0){
              WZ.profiles = data.profiles;
              WZ.activeProfileId = data.activeProfileId || data.profiles[0].id;
              WZ.saveProfiles();
            }
            if(Array.isArray(data.spells)){
              WZ.spells = data.spells;
              WZ.saveSpells();
            }
            if(Array.isArray(data.duels)){
              WZ.duels = data.duels;
              WZ.saveDuels();
            }
            if(Array.isArray(data.skills)){
              WZ.skills = data.skills;
              WZ.saveSkills();
            }
            if(data.meta){
              WZ.meta = data.meta;
              WZ.saveMeta(data.meta);
            }
            if(typeof paintShBar === 'function') paintShBar();
            if(typeof render === 'function') render();
            WZ.toast('✓ Данные успешно импортированы!', 'success');
          } catch(e){
            alert('Не удалось прочитать файл резервной копии.');
          }
        };
        fr.readAsText(f);
      });
    }

    wireWzNav();
  }

  /* ============================================================
     ЭКРАН ВОЛШЕБНОЙ ПАЛОЧКИ (wzWand)
     ============================================================ */

  function wzWand(){
    var profList = WZ.profiles || [];
    if(!profList.length){
      WZ.loadProfiles();
      profList = WZ.profiles || [];
    }
    var p = WZ.getActiveProfile();
    var w = getProfileWand(p);
    var hasSaved = !!(w.saved || w.name || w.wood || w.core || w.length || w.flexibility || w.features);
    var isEditorOpen = (WZ.wandEditOpen === true) || (!hasSaved && WZ.wandEditOpen !== false);

    var charDisplayName = (p.firstName || p.lastName) ? [p.firstName, p.lastName].filter(Boolean).join(' ') : (p.name || 'Безымянный маг');
    var hIcon = getHouseIcon(p.house);

    var profOptions = profList.map(function(item){
      var hi = getHouseIcon(item.house);
      var itName = (item.firstName || item.lastName) ? [item.firstName, item.lastName].filter(Boolean).join(' ') : (item.name || 'Безымянный маг');
      return '<option value="' + escA(item.id) + '" ' + (item.id === WZ.activeProfileId ? 'selected' : '') + '>' + hi + ' ' + esc(itName) + (item.house ? (' (' + esc(item.house) + ')') : '') + '</option>';
    }).join('');

    var wandTitle = w.name || (w.wood ? ('Палочка: ' + w.wood + (w.core ? (' и ' + w.core) : '')) : 'Волшебная палочка');
    var wandSub = [w.wood, w.core].filter(Boolean).join(' • ') || (hasSaved ? 'Параметры палочки сохранены' : 'Параметры палочки не заполнены');

    var emptyPrompt = !hasSaved ? (
      '<div style="font-size:13.5px;color:var(--wz-text-muted);font-style:italic;margin-top:10px;padding:8px 12px;background:rgba(212,175,55,0.08);border-left:3px solid var(--wz-gold);border-radius:4px;">' +
        'Параметры волшебной палочки ещё не сохранены. Заполните форму ниже и сохраните. После первого сохранения эта форма скроется, и её можно будет вызвать кнопкой.' +
      '</div>'
    ) : '';

    var showcaseActions = hasSaved ? (
      '<div id="wzWandOpenRow" style="display:' + (isEditorOpen ? 'none' : 'flex') + ';gap:10px;align-items:center;flex-wrap:wrap;margin-top:14px;padding-top:14px;border-top:1px solid rgba(212,175,55,0.2);">' +
        '<button class="btn btn-primary" id="wzWandOpenEditBtn" title="Открыть форму параметров палочки">✏️ Изменить параметры палочки</button>' +
        '<button class="btn btn-ghost" data-nav="wzRefView:wands" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzRefView:wands\');">📚 Справочник: Палочки Олливандера</button>' +
      '</div>'
    ) : '';

    var showcaseHtml = 
      '<div class="wz-wand-showcase-card" id="wzWandShowcase">' +
        '<div class="wz-wand-title-row">' +
          '<span class="wz-wand-symbol">🪄</span>' +
          '<div style="flex:1;min-width:0;">' +
            '<div class="wz-wand-display-name">' + esc(wandTitle) + '</div>' +
            '<div class="wz-wand-display-sub">' + esc(wandSub) + '</div>' +
          '</div>' +
          (p.house ? ('<span class="wz-house-badge ' + getHouseSlug(p.house) + '">' + hIcon + ' ' + esc(p.house) + '</span>') : '') +
        '</div>' +
        '<div class="wz-wand-chips-row">' +
          '<span class="wz-stat-badge">🌲 Древесина: <b style="color:var(--wz-gold-light);">' + esc(w.wood || 'Не указана') + '</b></span>' +
          '<span class="wz-stat-badge">✨ Сердцевина: <b style="color:var(--wz-gold-light);">' + esc(w.core || 'Не указана') + '</b></span>' +
          '<span class="wz-stat-badge">📏 Длина: <b style="color:var(--wz-gold-light);">' + esc(w.length || 'Не указана') + '</b></span>' +
          '<span class="wz-stat-badge">🌀 Упругость: <b style="color:var(--wz-gold-light);">' + esc(w.flexibility || 'Не указана') + '</b></span>' +
        '</div>' +
        (w.features ? ('<div class="wz-wand-features-box"><b>Особенности:</b> ' + esc(w.features) + '</div>') : '') +
        emptyPrompt +
        showcaseActions +
      '</div>';

    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Палочка' }]) +
      '<button class="back" data-nav="wzHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzHome\');">← Назад</button>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">' +
        '<div>' +
          '<h1 style="margin-bottom:4px;">🪄 Палочка</h1>' +
          '<div class="desc" style="margin-bottom:0;">Параметры волшебной палочки: древесина, сердцевина, длина, упругость и особенности.</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<label style="font-size:12px;color:var(--wz-text-muted);font-weight:600;">Маг:</label>' +
          '<select id="wzWandProfileSelect" class="wz-input" style="width:auto;min-width:180px;padding:6px 10px;font-size:13px;">' +
            profOptions +
          '</select>' +
        '</div>' +
      '</div>' +

      showcaseHtml +

      '<div class="wz-char-sheet-card" id="wzWandEditorCard" style="display:' + (isEditorOpen ? 'block' : 'none') + ';margin-top:16px;">' +
        '<div class="wz-char-header" style="display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
          '<span>Параметры палочки: <b style="color:var(--wz-gold);">' + esc(charDisplayName) + '</b></span>' +
          (hasSaved ? '<button class="btn btn-ghost" id="wzWandCloseEditBtn" style="padding:4px 10px;font-size:12px;" title="Скрыть форму параметров">✕ Скрыть</button>' : '') +
        '</div>' +

        '<div class="wz-edit-grid">' +
          '<div class="wz-edit-item" style="grid-column: 1 / -1;">' +
            '<label>Название</label>' +
            '<input type="text" id="wzWandInName" class="wz-input" value="' + escA(w.name) + '" placeholder="Например: Палочка из остролиста, Бузинная палочка, Палочка Поттера">' +
          '</div>' +

          '<div class="wz-edit-item">' +
            '<label>Древесина</label>' +
            '<input type="text" id="wzWandInWood" class="wz-input" list="wzWoodList" value="' + escA(w.wood) + '" placeholder="Например: Остролист, Тис, Бузина, Дуб...">' +
            '<datalist id="wzWoodList">' +
              '<option value="Остролист"><option value="Тис"><option value="Бузина"><option value="Дуб"><option value="Ива">' +
              '<option value="Ясень"><option value="Виноградная лоза"><option value="Черное дерево"><option value="Терновник">' +
              '<option value="Вишня"><option value="Боярышник"><option value="Орех"><option value="Кедр"><option value="Клен">' +
              '<option value="Вяз"><option value="Граб"><option value="Ольха"><option value="Кипарис"><option value="Липа">' +
              '<option value="Красное дерево"><option value="Рябина"><option value="Каштан">' +
            '</datalist>' +
          '</div>' +

          '<div class="wz-edit-item">' +
            '<label>Сердцевина</label>' +
            '<input type="text" id="wzWandInCore" class="wz-input" list="wzCoreList" value="' + escA(w.core) + '" placeholder="Например: Перо феникса, Сердечная жила дракона...">' +
            '<datalist id="wzCoreList">' +
              '<option value="Перо феникса"><option value="Сердечная жила дракона"><option value="Волос единорога">' +
              '<option value="Волос вейлы"><option value="Волос фестрала"><option value="Рог рогатого змея">' +
              '<option value="Ус вампуса"><option value="Перо птицы-гром"><option value="Чешуя василиска">' +
            '</datalist>' +
          '</div>' +

          '<div class="wz-edit-item">' +
            '<label>Длина</label>' +
            '<input type="text" id="wzWandInLength" class="wz-input" value="' + escA(w.length) + '" placeholder="Например: 11 дюймов (28 см)">' +
          '</div>' +

          '<div class="wz-edit-item">' +
            '<label>Упругость</label>' +
            '<input type="text" id="wzWandInFlex" class="wz-input" list="wzFlexList" value="' + escA(w.flexibility) + '" placeholder="Например: Умеренно упругая, Непреклонная...">' +
            '<datalist id="wzFlexList">' +
              '<option value="Умеренно упругая"><option value="Гибкая"><option value="Упругая"><option value="Очень гибкая">' +
              '<option value="Слегка пружинистая"><option value="Твердая"><option value="Непреклонная"><option value="Жесткая">' +
              '<option value="Хрупкая"><option value="Податливая">' +
            '</datalist>' +
          '</div>' +

          '<div class="wz-edit-item" style="grid-column: 1 / -1;">' +
            '<label>Особенности</label>' +
            '<textarea id="wzWandInFeatures" class="wz-input" rows="4" placeholder="Особые свойства, совместимость с заклинаниями, история приобретения в лавке мистера Олливандера, привязанность к владельцу...">' + esc(w.features) + '</textarea>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:16px;">' +
          '<button class="btn btn-primary" id="wzWandSaveBtn">✓ Сохранить палочку</button>' +
          '<button class="btn" id="wzWandRandomBtn" title="Сгенерировать случайную гармоничную комбинацию Олливандера">🎲 Случайная палочка</button>' +
          (hasSaved ? '<button class="btn btn-ghost" id="wzWandCancelEditBtn">✕ Скрыть</button>' : '') +
          '<button class="btn btn-ghost" data-nav="wzRefView:wands" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzRefView:wands\');" style="margin-left:auto;">📚 Справочник: Палочки Олливандера</button>' +
        '</div>' +
      '</div>';
  }

  function wireWzWand(){
    wireWzNav();
    var g = function(id){ return document.getElementById(id); };
    var v = function(id){ var e = g(id); return e ? e.value : ''; };

    // Переключение профиля прямо на экране палочки
    var sel = g('wzWandProfileSelect');
    if(sel && !sel.__wired){
      sel.__wired = true;
      sel.addEventListener('change', function(){
        WZ.wandEditOpen = undefined;
        WZ.switchProfile(this.value);
        if(typeof render === 'function') render();
      });
    }

    // Вызов/открытие формы редактирования по кнопке
    var openEditBtn = g('wzWandOpenEditBtn');
    if(openEditBtn && !openEditBtn.__wired){
      openEditBtn.__wired = true;
      openEditBtn.addEventListener('click', function(){
        WZ.wandEditOpen = true;
        var box = g('wzWandEditorCard');
        var openRow = g('wzWandOpenRow');
        if(box){
          box.style.display = 'block';
          try { box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch(e){}
          var inName = g('wzWandInName');
          if(inName) inName.focus();
        }
        if(openRow){
          openRow.style.display = 'none';
        }
      });
    }

    // Закрытие/скрытие бокса параметров
    var closeFn = function(){
      WZ.wandEditOpen = false;
      var box = g('wzWandEditorCard');
      var openRow = g('wzWandOpenRow');
      if(box) box.style.display = 'none';
      if(openRow){
        openRow.style.display = 'flex';
        try { openRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch(e){}
      }
    };

    var closeBtn = g('wzWandCloseEditBtn');
    if(closeBtn && !closeBtn.__wired){
      closeBtn.__wired = true;
      closeBtn.addEventListener('click', closeFn);
    }

    var cancelBtn = g('wzWandCancelEditBtn');
    if(cancelBtn && !cancelBtn.__wired){
      cancelBtn.__wired = true;
      cancelBtn.addEventListener('click', closeFn);
    }

    // Сохранение параметров палочки (после первого сохранения бокс скрывается)
    var saveBtn = g('wzWandSaveBtn');
    if(saveBtn && !saveBtn.__wired){
      saveBtn.__wired = true;
      saveBtn.addEventListener('click', function(){
        var p = WZ.getActiveProfile();
        if(!p.wand || typeof p.wand !== 'object'){
          p.wand = {};
        }
        p.wand.name = (v('wzWandInName') || '').trim();
        p.wand.wood = (v('wzWandInWood') || '').trim();
        p.wand.core = (v('wzWandInCore') || '').trim();
        p.wand.length = (v('wzWandInLength') || '').trim();
        p.wand.flexibility = (v('wzWandInFlex') || '').trim();
        p.wand.features = (v('wzWandInFeatures') || '').trim();
        p.wand.saved = true;

        WZ.wandEditOpen = false; // Скрываем бокс параметров после сохранения
        WZ.saveProfiles();
        WZ.toast('✓ Параметры палочки успешно сохранены!', 'success');
        if(typeof render === 'function') render();
      });
    }

    // Генерация случайной каноничной палочки
    var randBtn = g('wzWandRandomBtn');
    if(randBtn && !randBtn.__wired){
      randBtn.__wired = true;
      randBtn.addEventListener('click', function(){
        var woods = ['Остролист', 'Тис', 'Бузина', 'Дуб', 'Ива', 'Ясень', 'Виноградная лоза', 'Черное дерево', 'Терновник', 'Вишня', 'Боярышник', 'Орех', 'Кедр', 'Клен', 'Вяз', 'Граб', 'Ольха', 'Кипарис', 'Липа'];
        var cores = ['Перо феникса', 'Сердечная жила дракона', 'Волос единорога', 'Волос вейлы', 'Волос фестрала', 'Рог рогатого змея'];
        var flexes = ['Умеренно упругая', 'Гибкая', 'Упругая', 'Слегка пружинистая', 'Твердая', 'Непреклонная', 'Жесткая', 'Податливая'];
        var lengths = ['9½ дюймов (24 см)', '10 дюймов (25.4 см)', '10¾ дюймов (27.3 см)', '11 дюймов (28 см)', '11½ дюймов (29.2 см)', '12 дюймов (30.5 см)', '12¼ дюйма (31.1 см)', '13 дюймов (33 см)'];
        var feats = [
          'Палочка обладает сильным характером, особенно искусна в дуэльных чарах и защитной магии.',
          'Приобретена в лавке мистера Олливандера в Косом переулке. Отличается редкой преданностью владельцу.',
          'Превосходно проводит чары трансфигурации и бытовой магии, отзывается мягким золотистым свечением.',
          'Склонна к мощным боевым заклинаниям, требует от мага непоколебимой воли и уверенности.',
          'Чутко реагирует на душевное состояние мага, усиливает защитные чары и заклятие Патронуса.'
        ];

        var rWood = woods[Math.floor(Math.random() * woods.length)];
        var rCore = cores[Math.floor(Math.random() * cores.length)];
        var rFlex = flexes[Math.floor(Math.random() * flexes.length)];
        var rLen = lengths[Math.floor(Math.random() * lengths.length)];
        var rFeat = feats[Math.floor(Math.random() * feats.length)];

        var inName = g('wzWandInName');
        var inWood = g('wzWandInWood');
        var inCore = g('wzWandInCore');
        var inLen = g('wzWandInLength');
        var inFlex = g('wzWandInFlex');
        var inFeat = g('wzWandInFeatures');

        if(inWood) inWood.value = rWood;
        if(inCore) inCore.value = rCore;
        if(inLen) inLen.value = rLen;
        if(inFlex) inFlex.value = rFlex;
        if(inFeat) inFeat.value = rFeat;
        if(inName && (!inName.value || inName.value.startsWith('Палочка из '))){
          inName.value = 'Палочка из ' + rWood.toLowerCase();
        }

        WZ.toast('🎲 Подобрана палочка: ' + rWood + ' и ' + rCore + '! Нажмите «Сохранить», чтобы зафиксировать.', 'info');
      });
    }
  }

  /* Общий переключатель вкладок Заклинания / Дуэли / Навыки */
  function renderWzAbilitiesTabBar(activeTab){
    return '<div class="wz-nav-tabs">' +
      '<button class="wz-nav-tab ' + (activeTab === 'spells' ? 'active' : '') + '" data-nav="wzSpells" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSpells\');">✨ Заклинания</button>' +
      '<button class="wz-nav-tab ' + (activeTab === 'duels' ? 'active' : '') + '" data-nav="wzDuels" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzDuels\');">⚔️ Дуэльные приёмы</button>' +
      '<button class="wz-nav-tab ' + (activeTab === 'skills' ? 'active' : '') + '" data-nav="wzSkills" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSkills\');">🧠 Навыки</button>' +
    '</div>';
  }

  /* Экран СПРАВОЧНИК (wzRef) */
  function wzRef(){
    var sectionsHtml = WZ_REF_SECTIONS.map(function(sec){
      var items = Object.keys(WZ_REF).filter(function(k){ return WZ_REF[k].sec === sec.id; });
      var itemsHtml = items.map(function(k){
        var it = WZ_REF[k];
        return '<div class="wz-ref-card" data-nav="wzRefView:' + k + '" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzRefView:' + k + '\');" style="cursor:pointer;">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;">' +
            '<div class="wz-ref-card-k">' + (it.icon || '📜') + ' ' + esc(it.name) + '</div>' +
            '<span class="wz-stat-badge" style="font-size:11px;">' + esc(it.tag) + '</span>' +
          '</div>' +
          '<div class="wz-ref-card-v" style="font-size:12.5px;color:var(--wz-text-muted);">' + esc(it.lead) + '</div>' +
        '</div>';
      }).join('');

      return '<div class="wz-char-sheet-card" style="margin-bottom:20px;">' +
        '<div class="wz-char-header">' +
          '<span>' + sec.icon + ' ' + esc(sec.title) + '</span>' +
          '<span style="font-size:12px;color:var(--wz-gold);">' + items.length + ' тем</span>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:10px;margin-top:12px;">' +
          itemsHtml +
        '</div>' +
      '</div>';
    }).join('');

    var totalTopics = Object.keys(WZ_REF).length;

    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Справочник' }]) +
      '<button class="back" data-nav="wzHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzHome\');">← Назад</button>' +
      '<div style="margin-bottom:14px;">' +
        '<h1 style="margin-bottom:4px;">📚 Справочник Волшебного мира</h1>' +
        '<div class="desc" style="margin-bottom:0;">Подробная иллюстрированная энциклопедия: 14 тематических разделов (' + totalTopics + ' статей) — Факультеты и Основатели Хогвартса, Школы магии мира (Шармбатон, Дурмстранг, Ильверморни и др.), Палочковое право, Ордена и Фракции, Тёмные искусства и Крестражи, Редкие таланты, Зельеварение, Травология, Бестиарий, Легендарные артефакты, Магический транспорт, Локации, Квиддич и Культура.</div>' +
      '</div>' +
      '<div class="wi-ref-search-wrap" style="margin-bottom:16px;">' +
        '<span class="wi-ref-search-icon">🔍</span>' +
        '<input type="text" id="wzRefSearch" class="wi-ref-search-input" placeholder="Поиск по всему справочнику (факультеты, школы, палочки, крестражи, зелья, существа)..." autocomplete="off">' +
      '</div>' +
      '<div id="wzRefSearchResults" style="display:none;margin-bottom:20px;"></div>' +
      '<div id="wzRefDefaultContainer">' +
        sectionsHtml +
      '</div>';
  }

  /* Просмотр статьи справочника (wzRefView) */
  function wzRefView(refKey){
    var item = WZ_REF[refKey];
    if(!item) return wzRef();

    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Справочник', nav: 'wzRef' }, { label: item.name }]) +
      '<button class="back" data-nav="wzRef" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzRef\');">← К справочнику</button>' +
      '<div class="wz-char-sheet-card" style="margin-top:12px;">' +
        '<div class="wz-char-header" style="font-size:20px;">' +
          '<span>' + (item.icon || '📖') + ' ' + esc(item.name) + '</span>' +
          '<span class="wz-stat-badge" style="font-size:12px;">' + esc(item.tag) + '</span>' +
        '</div>' +
        '<div style="font-size:15px;line-height:1.6;color:var(--wz-gold-light);font-style:italic;margin-top:12px;margin-bottom:14px;border-left:3px solid var(--wz-gold);padding-left:12px;">' +
          esc(item.lead) +
        '</div>' +
        '<div style="font-size:14.5px;line-height:1.7;color:#e2e8f0;white-space:pre-line;">' +
          esc(item.desc) +
        '</div>' +
      '</div>';
  }

  /* Экран ЗАКЛИНАНИЯ (wzSpells) */
  function wzSpells(){
    if(!WZ.spells) WZ.loadSpells();
    var list = WZ.spells || [];

    var curFilter = WZ.spellFilter || 'all';
    var curSearch = (WZ.spellSearch || '').toLowerCase().trim();

    var categories = ['Все', 'Боевые заклятия', 'Защитные чары', 'Высшие чары', 'Чары левитации', 'Манящие чары', 'Бытовые чары', 'Тёмные искусства', 'Непростительные заклятия'];

    var filterPills = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:12px 0;">' +
      categories.map(function(cat){
        var key = (cat === 'Все' ? 'all' : cat);
        var active = curFilter === key;
        return '<button class="wz-pill ' + (active ? 'active' : '') + '" data-wz-spell-filter="' + escA(key) + '">' + esc(cat) + '</button>';
      }).join('') +
    '</div>';

    var filtered = list.filter(function(s){
      if(curFilter !== 'all' && s.cat !== curFilter) return false;
      if(curSearch){
        var str = (s.name + ' ' + (s.incantation || '') + ' ' + (s.desc || '') + ' ' + (s.cat || '')).toLowerCase();
        if(str.indexOf(curSearch) === -1) return false;
      }
      return true;
    });

    var cards = filtered.map(function(s){
      var dmgStr = (s.dmgN ? (s.dmgN + s.dmgD + (s.dmgMod ? ('+' + s.dmgMod) : '')) : (s.dmgMod ? ('+' + s.dmgMod) : ''));
      return '<div class="wz-ref-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">' +
        '<div>' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;">' +
            '<div class="wz-ref-card-k" style="margin-bottom:0;">' + (s.icon || '✨') + ' ' + esc(s.name) + '</div>' +
            '<span class="wz-stat-badge" style="font-size:10px;">' + esc(s.cat || 'Заклинание') + '</span>' +
          '</div>' +
          (s.incantation ? ('<div class="wz-spell-incantation">🗣️ «' + esc(s.incantation) + '»</div>') : '') +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:11.5px;color:var(--wz-text-muted);margin-bottom:6px;">' +
            (s.cost ? '<span style="background:rgba(212,175,55,0.12);padding:2px 6px;border-radius:3px;color:#fde047;">⚡ ' + esc(s.cost) + '</span>' : '') +
            (s.req ? '<span style="background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:3px;">📜 ' + esc(s.req) + '</span>' : '') +
            (dmgStr ? '<span style="background:rgba(239,68,68,0.15);padding:2px 6px;border-radius:3px;color:#fca5a5;">💥 ' + esc(dmgStr) + '</span>' : '') +
          '</div>' +
          '<div class="wz-ref-card-v" style="font-size:12.5px;line-height:1.45;">' + esc(s.desc || '') + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);">' +
          '<button class="btn btn-ghost" data-nav="wzSpellView:' + escA(s.id) + '" style="font-size:11px;padding:3px 8px;">Подробнее</button>' +
          '<button class="btn btn-ghost" data-nav="wzSpellEdit:' + escA(s.id) + '" style="font-size:11px;padding:3px 8px;">✏️</button>' +
        '</div>' +
      '</div>';
    }).join('');

    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Заклинания' }]) +
      '<button class="back" data-nav="wzHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzHome\');">← Назад</button>' +
      renderWzAbilitiesTabBar('spells') +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
        '<div>' +
          '<h1 style="margin-bottom:4px;">✨ Заклинания</h1>' +
          '<div class="desc" style="margin-bottom:0;">Боевые дуэльные чары, трансфигурация, бытовая магия и патронус. Создавайте свои или генерируйте через ИИ!</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button class="btn btn-primary" data-nav="wzSpellEdit:new" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSpellEdit:new\');">➕ Новое заклинание</button>' +
          '<button class="btn btn-ghost" data-nav="wzSpellGen" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSpellGen\');" style="color:var(--wz-gold);border-color:var(--wz-border-strong);">✨ AI Генератор заклинаний</button>' +
        '</div>' +
      '</div>' +
      '<div class="wi-ref-search-wrap" style="margin-top:10px;">' +
        '<span class="wi-ref-search-icon">🔍</span>' +
        '<input type="text" id="wzSpellSearch" class="wi-ref-search-input" placeholder="Поиск заклинания по названию, инкантации или эффекту..." value="' + escA(WZ.spellSearch || '') + '">' +
      '</div>' +
      filterPills +
      '<div class="wi-ref-cards-grid" style="margin-top:14px;">' +
        (cards || ('<div class="char-empty" style="grid-column:1/-1;text-align:center;padding:44px 16px;border:1px dashed var(--wz-border);border-radius:12px;background:rgba(255,255,255,0.02);">' +
          '<div style="font-size:40px;margin-bottom:8px;">✨ 📜</div>' +
          '<div style="font-family:Cinzel,serif;font-size:17px;color:var(--wz-gold-light);margin-bottom:6px;">Гримуар заклинаний пуст</div>' +
          '<div style="color:var(--wz-text-muted);font-size:13px;max-width:440px;margin:0 auto 16px;">Создайте заклинание вручную или воспользуйтесь AI Генератором для создания уникальных чар Хогвартса.</div>' +
          '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" data-nav="wzSpellEdit:new" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSpellEdit:new\');">➕ Создать заклинание</button>' +
            '<button class="btn btn-ghost" data-nav="wzSpellGen" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSpellGen\');" style="color:var(--wz-gold);border-color:var(--wz-border-strong);">✨ AI Генератор заклинаний</button>' +
          '</div>' +
        '</div>')) +
      '</div>';
  }

  /* Просмотр заклинания (wzSpellView) */
  function wzSpellView(id){
    var s = WZ.getSpellById(id);
    if(!s) return wzSpells();

    var dmgStr = (s.dmgN ? (s.dmgN + s.dmgD + (s.dmgMod ? ('+' + s.dmgMod) : '')) : (s.dmgMod ? ('+' + s.dmgMod) : '—'));

    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Заклинания', nav: 'wzSpells' }, { label: s.name }]) +
      '<button class="back" data-nav="wzSpells" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSpells\');">← К заклинаниям</button>' +
      '<div class="wz-char-sheet-card" style="margin-top:12px;">' +
        '<div class="wz-char-header">' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<span style="font-size:24px;">' + (s.icon || '✨') + '</span>' +
            '<div>' +
              '<div style="font-size:20px;color:var(--wz-gold-light);">' + esc(s.name) + '</div>' +
              (s.incantation ? ('<div class="wz-spell-incantation">Формула: «' + esc(s.incantation) + '»</div>') : '') +
            '</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;">' +
            '<button class="btn btn-primary" data-nav="wzSpellEdit:' + escA(s.id) + '" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSpellEdit:' + escA(s.id) + '\');">✏️ Изменить</button>' +
            '<button class="btn btn-ghost" id="wzSpellDeleteBtn" data-spell-id="' + escA(s.id) + '" style="color:#ef4444;">🗑️ Удалить</button>' +
          '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;margin-top:14px;margin-bottom:14px;">' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:6px;padding:8px 12px;">' +
            '<span style="color:var(--wz-text-muted);font-size:11px;display:block;">КАТЕГОРИЯ:</span>' +
            '<b>' + esc(s.cat || 'Заклинание') + '</b>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:6px;padding:8px 12px;">' +
            '<span style="color:var(--wz-text-muted);font-size:11px;display:block;">ДЕЙСТВИЕ:</span>' +
            '<b>' + esc(s.action || 'Основное действие') + '</b>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:6px;padding:8px 12px;">' +
            '<span style="color:var(--wz-text-muted);font-size:11px;display:block;">ФОКУСИРОВКА:</span>' +
            '<b style="color:#fde047;">' + esc(s.cost || 'Мгновенно') + '</b>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:6px;padding:8px 12px;">' +
            '<span style="color:var(--wz-text-muted);font-size:11px;display:block;">УРОН / ЭФФЕКТ:</span>' +
            '<b style="color:#fca5a5;">' + esc(dmgStr) + '</b>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:14px;line-height:1.6;color:#e2e8f0;background:rgba(0,0,0,0.3);padding:14px;border-radius:6px;border:1px solid rgba(255,255,255,0.05);">' +
          esc(s.desc || '').replace(/\n/g, '<br>') +
        '</div>' +
      '</div>';
  }

  /* Редактор заклинания (wzSpellEdit) */
  function wzSpellEdit(id){
    var isNew = (id === 'new' || !id);
    var s = isNew ? {
      id: 'wz_sp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: '',
      icon: '✨',
      cat: 'Боевые заклятия',
      incantation: '',
      action: 'Основное действие',
      cost: 'Мгновенно',
      req: '1 курс',
      dmgN: 2, dmgD: 'd6', dmgMod: 0,
      desc: ''
    } : (WZ.getSpellById(id) || { id: id });

    var catOpts = ['Боевые заклятия', 'Защитные чары', 'Высшие чары', 'Чары левитации', 'Манящие чары', 'Бытовые чары', 'Трансфигурация', 'Тёмные искусства', 'Непростительные заклятия'].map(function(c){
      return '<option value="' + escA(c) + '" ' + (s.cat === c ? 'selected' : '') + '>' + esc(c) + '</option>';
    }).join('');

    var diceOpts = ['d0', 'd4', 'd6', 'd8', 'd10', 'd12', 'd20'].map(function(d){
      return '<option value="' + d + '" ' + (s.dmgD === d ? 'selected' : '') + '>' + d + '</option>';
    }).join('');

    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Заклинания', nav: 'wzSpells' }, { label: isNew ? 'Новое заклинание' : 'Редактирование' }]) +
      '<button class="back" data-nav="wzSpells" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSpells\');">← К заклинаниям</button>' +
      '<div class="wz-char-sheet-card" style="margin-top:12px;">' +
        '<div class="wz-char-header">' +
          '<span>' + (isNew ? '✨ Создание нового заклинания' : '✏️ Редактирование: ' + esc(s.name)) + '</span>' +
        '</div>' +
        '<div class="wz-edit-grid">' +
          '<div class="wz-edit-item">' +
            '<label>Название заклинания</label>' +
            '<input type="text" id="wzEdSpellName" class="wz-input" value="' + escA(s.name || '') + '" placeholder="Экспеллиармус / Люмос">' +
          '</div>' +
          '<div class="wz-edit-item">' +
            '<label>Словесная формула (Инкантация)</label>' +
            '<input type="text" id="wzEdSpellIncant" class="wz-input" value="' + escA(s.incantation || '') + '" placeholder="Expelliarmus / Lumos">' +
          '</div>' +
          '<div class="wz-edit-item">' +
            '<label>Иконка (эмодзи)</label>' +
            '<input type="text" id="wzEdSpellIcon" class="wz-input" value="' + escA(s.icon || '✨') + '" placeholder="⚡, 🛡️, 🔥, 🦌">' +
          '</div>' +
          '<div class="wz-edit-item">' +
            '<label>Категория</label>' +
            '<select id="wzEdSpellCat" class="wz-input">' + catOpts + '</select>' +
          '</div>' +
          '<div class="wz-edit-item">' +
            '<label>Тип действия</label>' +
            '<input type="text" id="wzEdSpellAction" class="wz-input" value="' + escA(s.action || 'Основное действие') + '" placeholder="Основное действие / Бонусное / Реакция">' +
          '</div>' +
          '<div class="wz-edit-item">' +
            '<label>Фокусировка / Концентрация</label>' +
            '<input type="text" id="wzEdSpellCost" class="wz-input" value="' + escA(s.cost || 'Мгновенно') + '" placeholder="Мгновенно / Концентрация / Ритуал / Пассивно">' +
          '</div>' +
          '<div class="wz-edit-item">' +
            '<label>Требования (курс / факультет)</label>' +
            '<input type="text" id="wzEdSpellReq" class="wz-input" value="' + escA(s.req || '1 курс') + '" placeholder="1-7 курс / Мракоборец">' +
          '</div>' +
          '<div class="wz-edit-item">' +
            '<label>Урон (Кубы + Тип + Бонус)</label>' +
            '<div style="display:flex;gap:6px;">' +
              '<input type="number" id="wzEdSpellDmgN" class="wz-input" style="width:70px;" value="' + (s.dmgN || 0) + '" min="0" placeholder="Кол-во">' +
              '<select id="wzEdSpellDmgD" class="wz-input" style="width:85px;">' + diceOpts + '</select>' +
              '<input type="number" id="wzEdSpellDmgMod" class="wz-input" style="width:70px;" value="' + (s.dmgMod || 0) + '" placeholder="+Бонус">' +
            '</div>' +
          '</div>' +
          '<div class="wz-edit-item" style="grid-column:1/-1;">' +
            '<label>Описание эффекта, движения палочки и механики</label>' +
            '<textarea id="wzEdSpellDesc" class="wz-input" rows="4" placeholder="Подробное описание визуального луча, звука и действия чар...">' + esc(s.desc || '') + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">' +
          '<button class="btn btn-ghost" data-nav="wzSpells" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSpells\');">Отмена</button>' +
          '<button class="btn btn-primary" id="wzEdSpellSaveBtn" data-spell-id="' + escA(s.id) + '">💾 Сохранить заклинание</button>' +
        '</div>' +
      '</div>';
  }

  /* Экран ДУЭЛЬНЫЙ КЛУБ И ПРИЁМЫ (wzDuels) */
  function wzDuels(){
    if(!WZ.duels) WZ.loadDuels();
    var list = WZ.duels || [];

    var curFilter = WZ.duelFilter || 'all';
    var curSearch = (WZ.duelSearch || '').toLowerCase().trim();

    var kinds = ['Все', 'Защитный рипост', 'Атакующий финт', 'Комбо-атака', 'Тактическая защита', 'Перемещение', 'Тактический обман'];

    var filterPills = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:12px 0;">' +
      kinds.map(function(k){
        var key = (k === 'Все' ? 'all' : k);
        var active = curFilter === key;
        return '<button class="wz-pill ' + (active ? 'active' : '') + '" data-wz-duel-filter="' + escA(key) + '">' + esc(k) + '</button>';
      }).join('') +
    '</div>';

    var filtered = list.filter(function(d){
      if(curFilter !== 'all' && d.kind !== curFilter) return false;
      if(curSearch){
        var str = (d.name + ' ' + (d.desc || '') + ' ' + (d.kind || '') + ' ' + (d.trigger || '')).toLowerCase();
        if(str.indexOf(curSearch) === -1) return false;
      }
      return true;
    });

    var cards = filtered.map(function(d){
      return '<div class="wz-ref-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">' +
        '<div>' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;">' +
            '<div class="wz-ref-card-k" style="margin-bottom:0;">' + (d.icon || '⚔️') + ' ' + esc(d.name) + '</div>' +
            '<span class="wz-stat-badge" style="font-size:10px;">' + esc(d.kind || 'Приём') + '</span>' +
          '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:11.5px;color:var(--wz-text-muted);margin-bottom:6px;">' +
            (d.action ? '<span style="background:rgba(212,175,55,0.12);padding:2px 6px;border-radius:3px;color:#fde047;">⚡ ' + esc(d.action) + '</span>' : '') +
            (d.trigger ? '<span style="background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:3px;">🎯 ' + esc(d.trigger) + '</span>' : '') +
          '</div>' +
          '<div class="wz-ref-card-v" style="font-size:12.5px;line-height:1.45;">' + esc(d.desc || '') + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);">' +
          '<button class="btn btn-ghost" data-nav="wzDuelView:' + escA(d.id) + '" style="font-size:11px;padding:3px 8px;">Подробнее</button>' +
          '<button class="btn btn-ghost" data-nav="wzDuelEdit:' + escA(d.id) + '" style="font-size:11px;padding:3px 8px;">✏️</button>' +
        '</div>' +
      '</div>';
    }).join('');

    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Дуэльные приёмы' }]) +
      '<button class="back" data-nav="wzHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzHome\');">← Назад</button>' +
      renderWzAbilitiesTabBar('duels') +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
        '<div>' +
          '<h1 style="margin-bottom:4px;">⚔️ Дуэльные приёмы</h1>' +
          '<div class="desc" style="margin-bottom:0;">Тактические взмахи палочкой, парирование, боевая аппарация, невербальные броски и финты.</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button class="btn btn-primary" data-nav="wzDuelEdit:new" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzDuelEdit:new\');">➕ Новый приём</button>' +
          '<button class="btn btn-ghost" data-nav="wzDuelGen" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzDuelGen\');" style="color:var(--wz-gold);border-color:var(--wz-border-strong);">⚔️ AI Генератор приёмов</button>' +
        '</div>' +
      '</div>' +
      '<div class="wi-ref-search-wrap" style="margin-top:10px;">' +
        '<span class="wi-ref-search-icon">🔍</span>' +
        '<input type="text" id="wzDuelSearch" class="wi-ref-search-input" placeholder="Поиск дуэльного приёма..." value="' + escA(WZ.duelSearch || '') + '">' +
      '</div>' +
      filterPills +
      '<div class="wi-ref-cards-grid" style="margin-top:14px;">' +
        (cards || ('<div class="char-empty" style="grid-column:1/-1;text-align:center;padding:44px 16px;border:1px dashed var(--wz-border);border-radius:12px;background:rgba(255,255,255,0.02);">' +
          '<div style="font-size:40px;margin-bottom:8px;">⚔️ 🪄</div>' +
          '<div style="font-family:Cinzel,serif;font-size:17px;color:var(--wz-gold-light);margin-bottom:6px;">Список дуэльных приёмов пуст</div>' +
          '<div style="color:var(--wz-text-muted);font-size:13px;max-width:440px;margin:0 auto 16px;">Добавьте боевой приём вручную или воспользуйтесь AI Генератором для создания дуэльных финтов и связок.</div>' +
          '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" data-nav="wzDuelEdit:new" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzDuelEdit:new\');">➕ Создать приём</button>' +
            '<button class="btn btn-ghost" data-nav="wzDuelGen" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzDuelGen\');" style="color:var(--wz-gold);border-color:var(--wz-border-strong);">⚔️ AI Генератор приёмов</button>' +
          '</div>' +
        '</div>')) +
      '</div>';
  }

  /* Просмотр дуэльного приёма (wzDuelView) */
  function wzDuelView(id){
    var d = WZ.getDuelById(id);
    if(!d) return wzDuels();

    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Дуэльные приёмы', nav: 'wzDuels' }, { label: d.name }]) +
      '<button class="back" data-nav="wzDuels" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzDuels\');">← К приёмам</button>' +
      '<div class="wz-char-sheet-card" style="margin-top:12px;">' +
        '<div class="wz-char-header">' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<span style="font-size:24px;">' + (d.icon || '⚔️') + '</span>' +
            '<div style="font-size:20px;color:var(--wz-gold-light);">' + esc(d.name) + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;">' +
            '<button class="btn btn-primary" data-nav="wzDuelEdit:' + escA(d.id) + '" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzDuelEdit:' + escA(d.id) + '\');">✏️ Изменить</button>' +
            '<button class="btn btn-ghost" id="wzDuelDeleteBtn" data-duel-id="' + escA(d.id) + '" style="color:#ef4444;">🗑️ Удалить</button>' +
          '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:10px;margin-top:14px;margin-bottom:14px;">' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:6px;padding:8px 12px;">' +
            '<span style="color:var(--wz-text-muted);font-size:11px;display:block;">КАТЕГОРИЯ / СТИЛЬ:</span>' +
            '<b>' + esc(d.kind || 'Приём') + '</b>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:6px;padding:8px 12px;">' +
            '<span style="color:var(--wz-text-muted);font-size:11px;display:block;">ДЕЙСТВИЕ:</span>' +
            '<b style="color:#fde047;">' + esc(d.action || 'Основное действие') + '</b>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:6px;padding:8px 12px;">' +
            '<span style="color:var(--wz-text-muted);font-size:11px;display:block;">УСЛОВИЕ / ТРИГГЕР:</span>' +
            '<b>' + esc(d.trigger || 'По желанию дуэлянта') + '</b>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:14px;line-height:1.6;color:#e2e8f0;background:rgba(0,0,0,0.3);padding:14px;border-radius:6px;border:1px solid rgba(255,255,255,0.05);">' +
          esc(d.desc || '').replace(/\n/g, '<br>') +
        '</div>' +
      '</div>';
  }

  /* Редактор дуэльного приёма (wzDuelEdit) */
  function wzDuelEdit(id){
    var isNew = (id === 'new' || !id);
    var d = isNew ? {
      id: 'wz_duel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: '',
      icon: '⚔️',
      kind: 'Атакующий финт',
      action: 'Основное действие',
      trigger: '',
      desc: ''
    } : (WZ.getDuelById(id) || { id: id });

    var kindOpts = ['Защитный рипост', 'Атакующий финт', 'Комбо-атака', 'Тактическая защита', 'Перемещение', 'Тактический обман'].map(function(k){
      return '<option value="' + escA(k) + '" ' + (d.kind === k ? 'selected' : '') + '>' + esc(k) + '</option>';
    }).join('');

    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Дуэльные приёмы', nav: 'wzDuels' }, { label: isNew ? 'Новый приём' : 'Редактирование' }]) +
      '<button class="back" data-nav="wzDuels" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzDuels\');">← К приёмам</button>' +
      '<div class="wz-char-sheet-card" style="margin-top:12px;">' +
        '<div class="wz-char-header">' +
          '<span>' + (isNew ? '⚔️ Новый дуэльный приём' : '✏️ Редактирование: ' + esc(d.name)) + '</span>' +
        '</div>' +
        '<div class="wz-edit-grid">' +
          '<div class="wz-edit-item">' +
            '<label>Название приёма</label>' +
            '<input type="text" id="wzEdDuelName" class="wz-input" value="' + escA(d.name || '') + '" placeholder="Отражение Протего / Боевая аппарация">' +
          '</div>' +
          '<div class="wz-edit-item">' +
            '<label>Иконка (эмодзи)</label>' +
            '<input type="text" id="wzEdDuelIcon" class="wz-input" value="' + escA(d.icon || '⚔️') + '" placeholder="⚔️, 🛡️, 🌀, 🪄">' +
          '</div>' +
          '<div class="wz-edit-item">' +
            '<label>Категория / Стиль</label>' +
            '<select id="wzEdDuelKind" class="wz-input">' + kindOpts + '</select>' +
          '</div>' +
          '<div class="wz-edit-item">' +
            '<label>Тип действия</label>' +
            '<input type="text" id="wzEdDuelAction" class="wz-input" value="' + escA(d.action || 'Основное действие') + '" placeholder="Основное действие / Бонусное / Реакция">' +
          '</div>' +
          '<div class="wz-edit-item" style="grid-column:1/-1;">' +
            '<label>Триггер / Условие применения</label>' +
            '<input type="text" id="wzEdDuelTrigger" class="wz-input" value="' + escA(d.trigger || '') + '" placeholder="После отражения удара / При критическом попадании">' +
          '</div>' +
          '<div class="wz-edit-item" style="grid-column:1/-1;">' +
            '<label>Описание приёма и тактический эффект</label>' +
            '<textarea id="wzEdDuelDesc" class="wz-input" rows="4" placeholder="Подробное описание движения кисти, жеста палочки и результата...">' + esc(d.desc || '') + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">' +
          '<button class="btn btn-ghost" data-nav="wzDuels" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzDuels\');">Отмена</button>' +
          '<button class="btn btn-primary" id="wzEdDuelSaveBtn" data-duel-id="' + escA(d.id) + '">💾 Сохранить приём</button>' +
        '</div>' +
      '</div>';
  }

  /* ============================================================
     ЭКРАН НАВЫКИ И МАГИЧЕСКИЕ ДИСЦИПЛИНЫ (wzSkills)
     ============================================================ */
  function wzSkills(){
    if(!WZ.skills) WZ.loadSkills();
    var list = WZ.skills || [];

    var curFilter = WZ.skillFilter || 'all';
    var curSearch = (WZ.skillSearch || '').toLowerCase().trim();

    var filterCategories = ['Все'].concat(WZ_SKILL_KINDS);

    var filterPills = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:12px 0;">' +
      filterCategories.map(function(cat){
        var key = (cat === 'Все' ? 'all' : cat);
        var active = curFilter === key;
        return '<button class="wz-pill ' + (active ? 'active' : '') + '" data-wz-skill-filter="' + escA(key) + '">' + esc(cat) + '</button>';
      }).join('') +
    '</div>';

    var filtered = list.filter(function(s){
      if(curFilter !== 'all' && s.kind !== curFilter) return false;
      if(curSearch){
        var str = ((s.name || '') + ' ' + (s.kind || '') + ' ' + (s.level || '') + ' ' + (s.abil || '') + ' ' + (s.source || '') + ' ' + (s.gives || '') + ' ' + (s.desc || '')).toLowerCase();
        if(str.indexOf(curSearch) === -1) return false;
      }
      return true;
    });

    // Группировка по дисциплинам
    var groups = {};
    filtered.forEach(function(s){
      var k = s.kind || 'Академические дисциплины';
      if(!groups[k]) groups[k] = [];
      groups[k].push(s);
    });

    var cards = filtered.length ? WZ_SKILL_KINDS.filter(function(k){ return groups[k] && groups[k].length; }).map(function(k){
      var groupItems = groups[k];
      return '<div style="grid-column:1/-1;margin-top:10px;margin-bottom:2px;"><div class="section-label" style="font-size:11px;color:var(--wz-gold-light);">' + esc(k) + ' (' + groupItems.length + ')</div></div>' +
        groupItems.map(function(s){
          var lvlSlug = getWzSkillLevelSlug(s.level);
          var line = [(s.abil ? ('🧠 ' + s.abil) : ''), (s.mod ? ('модификатор ' + s.mod) : ''), (s.source ? ('🏛️ ' + s.source) : '')].filter(Boolean).join(' · ');
          return '<div class="wz-ref-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:8px;">' +
            '<div>' +
              '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;">' +
                '<div class="wz-ref-card-k" style="margin-bottom:0;font-size:15px;">🧠 ' + esc(s.name || 'Безымянный навык') + '</div>' +
                '<span class="wz-skill-badge lvl-' + escA(lvlSlug) + '">' + esc(s.level || 'Начатки') + '</span>' +
              '</div>' +
              '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:11.5px;color:var(--wz-text-muted);margin-bottom:6px;">' +
                (line ? '<span style="background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:3px;">' + esc(line) + '</span>' : '') +
              '</div>' +
              (s.gives ? ('<div class="wz-ref-card-v" style="font-size:12.5px;line-height:1.45;color:#e2e8f0;margin-bottom:4px;"><b>Что даёт:</b> ' + esc(s.gives) + '</div>') : '') +
              (s.desc ? ('<div class="wz-ref-card-v" style="font-size:12px;line-height:1.4;color:var(--wz-text-muted);">' + esc(s.desc) + '</div>') : '') +
            '</div>' +
            '<div style="display:flex;gap:6px;justify-content:flex-end;margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);">' +
              '<button class="btn btn-ghost" data-nav="wzSkillView:' + escA(s.id) + '" style="font-size:11px;padding:3px 8px;">Подробнее</button>' +
              '<button class="btn btn-ghost" data-nav="wzSkillEdit:' + escA(s.id) + '" style="font-size:11px;padding:3px 8px;">✏️</button>' +
            '</div>' +
          '</div>';
        }).join('');
    }).join('') : '';

    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Навыки' }]) +
      '<button class="back" data-nav="wzHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzHome\');">← Назад</button>' +
      renderWzAbilitiesTabBar('skills') +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
        '<div>' +
          '<h1 style="margin-bottom:4px;">🧠 Навыки и магические дисциплины</h1>' +
          '<div class="desc" style="margin-bottom:0;">Окклюменция, древние руны, зельеварение, полёты на метле, ремесло и языки магов.</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button class="btn btn-primary" data-nav="wzSkillEdit:new" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSkillEdit:new\');">➕ Добавить навык</button>' +
          '<button class="btn btn-ghost" data-nav="wzSkillGen" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSkillGen\');" style="color:var(--wz-gold);border-color:var(--wz-border-strong);">✨ AI Генератор навыков</button>' +
        '</div>' +
      '</div>' +
      '<div class="wi-ref-search-wrap" style="margin-top:10px;">' +
        '<span class="wi-ref-search-icon">🔍</span>' +
        '<input type="text" id="wzSkillSearch" class="wi-ref-search-input" placeholder="Поиск навыка по названию, дисциплине или характеристике..." value="' + escA(WZ.skillSearch || '') + '">' +
      '</div>' +
      filterPills +
      '<div class="wi-ref-cards-grid" style="margin-top:14px;">' +
        (cards || ('<div class="char-empty" style="grid-column:1/-1;text-align:center;padding:44px 16px;border:1px dashed var(--wz-border);border-radius:12px;background:rgba(255,255,255,0.02);">' +
          '<div style="font-size:40px;margin-bottom:8px;">🧠 📜</div>' +
          '<div style="font-family:Cinzel,serif;font-size:17px;color:var(--wz-gold-light);margin-bottom:6px;">Список навыков волшебника пуст</div>' +
          '<div style="color:var(--wz-text-muted);font-size:13px;max-width:440px;margin:0 auto 16px;">Добавьте магическую дисциплину, ремесло или знание, либо воспользуйтесь AI Генератором.</div>' +
          '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" data-nav="wzSkillEdit:new" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSkillEdit:new\');">➕ Создать навык</button>' +
            '<button class="btn btn-ghost" data-nav="wzSkillGen" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSkillGen\');" style="color:var(--wz-gold);border-color:var(--wz-border-strong);">✨ AI Генератор навыков</button>' +
          '</div>' +
        '</div>')) +
      '</div>';
  }

  /* Просмотр навыка (wzSkillView) */
  function wzSkillView(id){
    var s = WZ.getSkillById(id);
    if(!s) return wzSkills();

    var lvlSlug = getWzSkillLevelSlug(s.level);

    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Навыки', nav: 'wzSkills' }, { label: s.name || 'Навык' }]) +
      '<button class="back" data-nav="wzSkills" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSkills\');">← К навыкам</button>' +
      '<div class="wz-char-sheet-card" style="margin-top:12px;">' +
        '<div class="wz-char-header">' +
          '<div style="display:flex;align-items:center;gap:10px;">' +
            '<span style="font-size:24px;">🧠</span>' +
            '<div style="font-size:20px;color:var(--wz-gold-light);">' + esc(s.name || 'Навык') + '</div>' +
            '<span class="wz-skill-badge lvl-' + escA(lvlSlug) + '">' + esc(s.level || 'Начатки') + '</span>' +
          '</div>' +
          '<div style="display:flex;gap:8px;">' +
            '<button class="btn btn-primary" data-nav="wzSkillEdit:' + escA(s.id) + '" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSkillEdit:' + escA(s.id) + '\');">✏️ Изменить</button>' +
            '<button class="btn btn-ghost" id="wzSkillDeleteBtn" data-skill-id="' + escA(s.id) + '" style="color:#ef4444;">🗑️ Удалить</button>' +
          '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:10px;margin-top:14px;margin-bottom:14px;">' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:6px;padding:8px 12px;">' +
            '<span style="color:var(--wz-text-muted);font-size:11px;display:block;">ДИСЦИПЛИНА / КАТЕГОРИЯ:</span>' +
            '<b>' + esc(s.kind || 'Академические дисциплины') + '</b>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:6px;padding:8px 12px;">' +
            '<span style="color:var(--wz-text-muted);font-size:11px;display:block;">ХАРАКТЕРИСТИКА:</span>' +
            '<b style="color:#fde047;">' + esc(s.abil || 'Интеллект') + (s.mod ? (' (мод: ' + esc(s.mod) + ')') : '') + '</b>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:6px;padding:8px 12px;">' +
            '<span style="color:var(--wz-text-muted);font-size:11px;display:block;">ИСТОЧНИК / НАСТАВНИК:</span>' +
            '<b>' + esc(s.source || 'Личный опыт') + '</b>' +
          '</div>' +
        '</div>' +
        (s.gives ? (
          '<div style="margin-bottom:12px;">' +
            '<div style="font-size:12px;color:var(--wz-gold-light);font-weight:700;margin-bottom:4px;">ЧТО ДАЁТ ПЕРСОНАЖУ:</div>' +
            '<div style="font-size:14px;line-height:1.6;color:#e2e8f0;background:rgba(0,0,0,0.3);padding:14px;border-radius:6px;border:1px solid rgba(255,255,255,0.05);">' +
              esc(s.gives).replace(/\n/g, '<br>') +
            '</div>' +
          '</div>'
        ) : '') +
        (s.desc ? (
          '<div>' +
            '<div style="font-size:12px;color:var(--wz-text-muted);font-weight:700;margin-bottom:4px;">ЗАМЕТКИ И НЮАНСЫ:</div>' +
            '<div style="font-size:13.5px;line-height:1.55;color:#cbd5e1;background:rgba(0,0,0,0.2);padding:12px;border-radius:6px;border:1px solid rgba(255,255,255,0.03);">' +
              esc(s.desc).replace(/\n/g, '<br>') +
            '</div>' +
          '</div>'
        ) : '') +
      '</div>';
  }

  /* Редактор навыка (wzSkillEdit) */
  function wzSkillEdit(id){
    var isNew = (id === 'new' || !id);
    var s = isNew ? newWzSkill() : (WZ.getSkillById(id) || newWzSkill());

    var kindOpts = WZ_SKILL_KINDS.map(function(k){
      return '<option value="' + escA(k) + '" ' + (s.kind === k ? 'selected' : '') + '>' + esc(k) + '</option>';
    }).join('');

    var levelOpts = WZ_SKILL_LEVELS.map(function(lvl){
      return '<option value="' + escA(lvl) + '" ' + (s.level === lvl ? 'selected' : '') + '>' + esc(lvl) + '</option>';
    }).join('');

    var abilOpts = WZ_SKILL_ABILS.map(function(ab){
      return '<option value="' + escA(ab) + '" ' + (s.abil === ab ? 'selected' : '') + '>' + esc(ab) + '</option>';
    }).join('');

    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Навыки', nav: 'wzSkills' }, { label: isNew ? 'Новый навык' : 'Редактирование' }]) +
      '<button class="back" data-nav="wzSkills" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSkills\');">← К навыкам</button>' +
      '<div class="wz-char-sheet-card" style="margin-top:12px;">' +
        '<div class="wz-char-header">' +
          '<span>' + (isNew ? '🧠 Новый навык' : '✏️ Редактирование: ' + esc(s.name || '')) + '</span>' +
        '</div>' +
        '<div class="wz-edit-grid">' +
          '<div class="wz-edit-item" style="grid-column:1/-1;">' +
            '<label>Название дисциплины / навыка</label>' +
            '<input type="text" id="wzEdSkillName" class="wz-input" value="' + escA(s.name || '') + '" placeholder="Например: Окклюменция, Зельеварение, Древние руны">' +
          '</div>' +
          '<div class="wz-edit-item">' +
            '<label>Категория дисциплины</label>' +
            '<select id="wzEdSkillKind" class="wz-input">' + kindOpts + '</select>' +
          '</div>' +
          '<div class="wz-edit-item">' +
            '<label>Ступень мастерства</label>' +
            '<select id="wzEdSkillLevel" class="wz-input">' + levelOpts + '</select>' +
          '</div>' +
          '<div class="wz-edit-item">' +
            '<label>Характеристика</label>' +
            '<select id="wzEdSkillAbil" class="wz-input">' + abilOpts + '</select>' +
          '</div>' +
          '<div class="wz-edit-item">' +
            '<label>Модификатор броска (если требуется)</label>' +
            '<input type="text" id="wzEdSkillMod" class="wz-input" value="' + escA(s.mod || '') + '" placeholder="Например: +2 или оставьте пустым">' +
          '</div>' +
          '<div class="wz-edit-item" style="grid-column:1/-1;">' +
            '<label>Источник / Где и у кого обучен</label>' +
            '<input type="text" id="wzEdSkillSource" class="wz-input" value="' + escA(s.source || '') + '" placeholder="Например: Запретная секция библиотеки, Уроки у профессора Снейпа">' +
          '</div>' +
          '<div class="wz-edit-item" style="grid-column:1/-1;">' +
            '<label>Что даёт навык (конкретно и сюжетно)</label>' +
            '<textarea id="wzEdSkillGives" class="wz-input" rows="3" placeholder="Что персонаж может делать благодаря этому навыку, чего не могут другие...">' + esc(s.gives || '') + '</textarea>' +
          '</div>' +
          '<div class="wz-edit-item" style="grid-column:1/-1;">' +
            '<label>Заметки и особенности применения</label>' +
            '<textarea id="wzEdSkillDesc" class="wz-input" rows="3" placeholder="Нюансы, ограничения и личные заметки...">' + esc(s.desc || '') + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;">' +
          '<button class="btn btn-ghost" data-nav="wzSkills" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSkills\');">Отмена</button>' +
          (!isNew ? '<button class="btn btn-ghost" id="wzEdSkillDelBtn" data-skill-id="' + escA(s.id) + '" style="color:#ef4444;border-color:rgba(239,68,68,0.4);">🗑️ Удалить</button>' : '') +
          '<button class="btn btn-primary" id="wzEdSkillSaveBtn" data-skill-id="' + escA(s.id) + '">💾 Сохранить навык</button>' +
        '</div>' +
      '</div>';
  }

  /* ============================================================
     ИНТЕРАКТИВНАЯ КАРТА МАРОДЁРОВ (wzMap)
     ============================================================ */

  function renderWizardMapSvg(){
    var m = WZ.map;
    var z = Math.max(0.4, Math.min(5.0, m.zoom || 1.0));
    var cx = m.cx != null ? m.cx : (m.scope === 'hogwarts' ? 1200 : 1400);
    var cy = m.cy != null ? m.cy : (m.scope === 'hogwarts' ? 1150 : 1300);

    var vp = (typeof document !== 'undefined') ? document.getElementById('wzMapViewport') : null;
    var vw = (vp && vp.clientWidth) || 800;
    var vh = (vp && vp.clientHeight) || 540;
    var ar = vw / vh;

    var baseW = 2400;
    var baseH = baseW / ar;
    var vbW = baseW / z;
    var vbH = baseH / z;
    var minX = cx - vbW / 2;
    var minY = cy - vbH / 2;

    var defsSvg = '<defs>' +
      '<filter id="wzPinGlow" x="-50%" y="-50%" width="200%" height="200%">' +
        '<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>' +
        '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '<filter id="wzTextShadow" x="-30%" y="-30%" width="160%" height="160%">' +
        '<feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.95"/>' +
      '</filter>' +
      '<linearGradient id="wzParchmentBg" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%" stop-color="#181410"/>' +
        '<stop offset="50%" stop-color="#241e16"/>' +
        '<stop offset="100%" stop-color="#14100c"/>' +
      '</linearGradient>' +
      '<pattern id="wzGrid" width="100" height="100" patternUnits="userSpaceOnUse">' +
        '<path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(212,175,55,0.06)" stroke-width="1"/>' +
      '</pattern>' +
    '</defs>';

    // 1. Внутренняя архитектурная карта замка Хогвартс
    var bgSvgHogwarts = 
      '<rect x="0" y="0" width="2800" height="2400" fill="url(#wzParchmentBg)" />' +
      '<rect x="0" y="0" width="2800" height="2400" fill="url(#wzGrid)" />' +

      // Внешние крепостные стены замка с контрфорсами и парапетами
      '<path d="M 500 1280 L 500 1140 L 600 920 L 560 800 L 700 580 L 1000 580 L 1080 480 L 1160 580 L 1400 480 L 1560 520 L 1760 600 L 1860 680 L 1880 1020 L 1840 1480 L 1860 1820 L 1400 1840 L 780 1820 L 680 1520 L 500 1280 Z" fill="rgba(30, 24, 18, 0.75)" stroke="#d4af37" stroke-width="4.5" stroke-linejoin="round" />' +
      '<path d="M 520 1260 L 520 1160 L 615 935 L 580 820 L 715 600 L 985 600 L 1080 510 L 1145 600 L 1390 505 L 1545 540 L 1740 615 L 1840 690 L 1860 1010 L 1820 1470 L 1840 1800 L 1410 1820 L 800 1800 L 700 1510 L 520 1260 Z" fill="none" stroke="rgba(212,175,55,0.35)" stroke-width="1.5" stroke-dasharray="8,4" />' +

      // Башни замка
      // Астрономический шпиль (Северо-запад)
      '<circle cx="720" cy="620" r="52" fill="rgba(15,23,42,0.85)" stroke="#d4af37" stroke-width="2.5" />' +
      '<circle cx="720" cy="620" r="38" fill="none" stroke="#d4af37" stroke-width="1.2" stroke-dasharray="4,2" />' +
      '<path d="M 695 620 L 745 620 M 720 595 L 720 645" stroke="#fde047" stroke-width="1.5" />' +
      '<text x="720" y="690" fill="#fde047" font-size="12" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">Астрономический Шпиль</text>' +

      // Башня Директора (Север)
      '<circle cx="1080" cy="650" r="56" fill="rgba(32,24,18,0.9)" stroke="#d4af37" stroke-width="3" />' +
      '<circle cx="1080" cy="650" r="42" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="5,3" />' +
      '<path d="M 1055 650 A 25 25 0 0 1 1105 650 A 25 25 0 0 1 1080 675" fill="none" stroke="#d4af37" stroke-width="2" />' +
      '<text x="1080" y="722" fill="#fde047" font-size="12" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">Кабинет Директора</text>' +

      // Башня Когтеврана (Северо-восток)
      '<circle cx="1480" cy="550" r="52" fill="rgba(30,58,138,0.3)" stroke="#38bdf8" stroke-width="2.5" />' +
      '<circle cx="1480" cy="550" r="38" fill="none" stroke="#93c5fd" stroke-width="1.2" stroke-dasharray="4,2" />' +
      '<text x="1480" y="618" fill="#93c5fd" font-size="12" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">Башня Когтеврана</text>' +

      // Башня Гриффиндора (Запад)
      '<circle cx="680" cy="920" r="62" fill="rgba(185,28,28,0.25)" stroke="#ef4444" stroke-width="3" />' +
      '<circle cx="680" cy="920" r="46" fill="none" stroke="#fca5a5" stroke-width="1.5" stroke-dasharray="6,3" />' +
      '<text x="680" y="998" fill="#fca5a5" font-size="12" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">Башня Гриффиндора</text>' +

      // Совятня (Отдельная башня)
      '<circle cx="550" cy="1200" r="46" fill="rgba(15,23,42,0.85)" stroke="#cbd5e1" stroke-width="2" />' +
      '<text x="550" y="1262" fill="#cbd5e1" font-size="11" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">Совятня</text>' +

      // Часовая башня и Крытый Мост
      '<circle cx="850" cy="1400" r="52" fill="rgba(32,24,18,0.9)" stroke="#d4af37" stroke-width="2.5" />' +
      '<path d="M 850 1370 L 850 1430 M 820 1400 L 880 1400" stroke="#d4af37" stroke-width="1.5" />' +
      '<path d="M 810 1430 L 680 1470 L 670 1440 L 800 1400 Z" fill="rgba(120,53,15,0.45)" stroke="#92400e" stroke-width="2" />' +
      '<text x="735" y="1475" fill="#fbbf24" font-size="10.5" font-family="Cinzel, serif" font-weight="700">Крытый Мост</text>' +

      // Парадная Движущаяся Лестница (Grand Staircase)
      '<rect x="970" y="1040" width="220" height="220" rx="16" fill="rgba(24,18,12,0.95)" stroke="#d4af37" stroke-width="3" />' +
      '<rect x="990" y="1060" width="180" height="180" rx="10" fill="none" stroke="rgba(212,175,55,0.3)" stroke-width="1.5" stroke-dasharray="6,3" />' +
      '<path d="M 1010 1080 L 1060 1080 M 1010 1100 L 1060 1100 M 1010 1120 L 1060 1120" stroke="#fde047" stroke-width="2" />' +
      '<path d="M 1110 1180 L 1160 1180 M 1110 1200 L 1160 1200 M 1110 1220 L 1160 1220" stroke="#fde047" stroke-width="2" />' +
      '<g transform="translate(1080, 1150)">' +
        '<path d="M -40 -8 L 40 -8 L 40 8 L -40 8 Z" fill="#d4af37" stroke="#fff" stroke-width="1.5" opacity="0.9">' +
          '<animateTransform attributeName="transform" type="rotate" values="0; 60; 0; -60; 0" dur="16s" repeatCount="indefinite" />' +
        '</path>' +
      '</g>' +
      '<text x="1080" y="1154" fill="#0f172a" font-size="9" font-weight="900" font-family="monospace" text-anchor="middle" pointer-events="none">142 ЛЕСТНИЦЫ</text>' +
      '<text x="1080" y="1030" fill="#fde047" font-size="13" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">Парадная Лестница</text>' +

      // Вестибюль (Entrance Hall)
      '<rect x="1200" y="1050" width="150" height="200" fill="rgba(28,22,16,0.9)" stroke="#d4af37" stroke-width="2.5" />' +
      '<path d="M 1240 1250 L 1310 1250" stroke="#fde047" stroke-width="6" stroke-linecap="round" />' +
      '<text x="1275" y="1270" fill="#fde047" font-size="10" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">Главные Дубовые Ворота</text>' +
      '<text x="1275" y="1145" fill="#f8fafc" font-size="12" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">Вестибюль</text>' +

      // Большой Зал (Great Hall)
      '<rect x="1360" y="1050" width="280" height="200" fill="rgba(35,26,16,0.95)" stroke="#d4af37" stroke-width="3" />' +
      '<rect x="1390" y="1080" width="180" height="12" rx="3" fill="#7f1d1d" stroke="#f87171" stroke-width="1" />' +
      '<text x="1480" y="1090" fill="#fecaca" font-size="8.5" font-family="sans-serif" font-weight="bold" text-anchor="middle">СТОЛ ГРИФФИНДОРА</text>' +
      '<rect x="1390" y="1115" width="180" height="12" rx="3" fill="#14532d" stroke="#4ade80" stroke-width="1" />' +
      '<text x="1480" y="1125" fill="#bbf7d0" font-size="8.5" font-family="sans-serif" font-weight="bold" text-anchor="middle">СТОЛ СЛИЗЕРИНА</text>' +
      '<rect x="1390" y="1150" width="180" height="12" rx="3" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1" />' +
      '<text x="1480" y="1160" fill="#bfdbfe" font-size="8.5" font-family="sans-serif" font-weight="bold" text-anchor="middle">СТОЛ КОГТЕВРАНА</text>' +
      '<rect x="1390" y="1185" width="180" height="12" rx="3" fill="#78350f" stroke="#fbbf24" stroke-width="1" />' +
      '<text x="1480" y="1195" fill="#fef08a" font-size="8.5" font-family="sans-serif" font-weight="bold" text-anchor="middle">СТОЛ ПУФФЕНДУЯ</text>' +
      '<rect x="1590" y="1075" width="16" height="125" rx="3" fill="#451a03" stroke="#fde047" stroke-width="1.5" />' +
      '<text x="1500" y="1040" fill="#fde047" font-size="15" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">Большой Зал</text>' +

      // Внутренний двор и Клуатр (Middle Courtyard / Cloister)
      '<rect x="1240" y="740" width="310" height="240" fill="rgba(18,22,30,0.85)" stroke="#d4af37" stroke-width="2.5" />' +
      '<rect x="1270" y="770" width="250" height="180" fill="none" stroke="rgba(212,175,55,0.4)" stroke-width="1.5" stroke-dasharray="6,3" />' +
      '<circle cx="1395" cy="860" r="28" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" stroke-width="2" />' +
      '<circle cx="1395" cy="860" r="14" fill="rgba(56,189,248,0.4)" stroke="#fff" stroke-width="1" />' +
      '<text x="1395" y="864" fill="#e0f2fe" font-size="8" font-weight="bold" text-anchor="middle">ФОНТАН</text>' +
      '<text x="1395" y="730" fill="#e2e8f0" font-size="13" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">Внутренний Двор и Колоннада</text>' +

      // Библиотека и Запретная Секция
      '<rect x="1560" y="740" width="260" height="240" fill="rgba(25,20,15,0.9)" stroke="#d4af37" stroke-width="2.5" />' +
      '<path d="M 1590 770 L 1790 770 M 1590 800 L 1790 800 M 1590 830 L 1790 830 M 1590 860 L 1790 860" stroke="#a16207" stroke-width="4" stroke-dasharray="14,8" />' +
      '<rect x="1590" y="890" width="200" height="60" fill="rgba(127,29,29,0.3)" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,2" />' +
      '<text x="1690" y="925" fill="#fca5a5" font-size="10" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">🔒 Запретная Секция</text>' +
      '<text x="1690" y="730" fill="#fde047" font-size="13" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">Библиотека Хогвартса</text>' +

      // Больничное крыло
      '<rect x="1080" y="780" width="150" height="180" fill="rgba(20,24,32,0.9)" stroke="#94a3b8" stroke-width="2" />' +
      '<rect x="1100" y="810" width="30" height="16" fill="#f1f5f9" stroke="#94a3b8" rx="2" />' +
      '<rect x="1100" y="845" width="30" height="16" fill="#f1f5f9" stroke="#94a3b8" rx="2" />' +
      '<rect x="1100" y="880" width="30" height="16" fill="#f1f5f9" stroke="#94a3b8" rx="2" />' +
      '<text x="1155" y="770" fill="#e2e8f0" font-size="12" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">Больничное Крыло</text>' +

      // Подземелья и Зельеварение (Нижний уровень)
      '<rect x="800" y="1500" width="600" height="240" fill="rgba(10,14,20,0.95)" stroke="#10b981" stroke-width="2.5" />' +
      '<text x="1100" y="1490" fill="#86efac" font-size="14" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">Подземелья и Класс Зельеварения</text>' +
      // Окно Слизерина в озеро
      '<rect x="830" y="1600" width="130" height="90" rx="6" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="2" stroke-dasharray="5,3" />' +
      '<text x="895" y="1645" fill="#a7f3d0" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle">ОКНО В ОЗЕРО</text>' +

      // Кухни Хогвартса и Пуффендуй (Нижний уровень)
      '<rect x="1410" y="1500" width="390" height="240" fill="rgba(24,18,12,0.95)" stroke="#eab308" stroke-width="2.5" />' +
      '<text x="1605" y="1490" fill="#fde047" font-size="14" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">Кухни Хогвартса и Цоколь Пуффендуя</text>' +

      // Тайные ходы (Dotted trails)
      '<path d="M 1360 1850 L 1360 1740 L 1280 1740" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6,4" />' +
      '<text x="1360" y="1875" fill="#fbbf24" font-size="10.5" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">🗝️ Ход в «Сладкое Королевство»</text>' +
      '<path d="M 1600 1850 L 1600 1740" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6,4" />' +
      '<text x="1600" y="1875" fill="#fbbf24" font-size="10.5" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">🗝️ Лаз под Гремучую Иву</text>' +
      '<path d="M 880 780 L 880 660" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6,4" />' +
      '<text x="880" y="630" fill="#fbbf24" font-size="10.5" font-family="Cinzel, serif" font-weight="700" text-anchor="middle">🗝️ В «Кабанью Голову»</text>' +

      // АНИМИРОВАННЫЕ СЛЕДЫ МАРОДЁРОВ (MARAUDER FOOTPRINTS)
      // 1: Гарри Поттер & Рон Уизли (Вестибюль -> Большой Зал)
      '<g class="wz-marauder-footsteps" transform="translate(1220, 1140)">' +
        '<path d="M 0 0 C 2 -3, 5 -3, 7 0 C 9 4, 8 10, 6 12 C 4 14, 2 13, 1 12 C 0 10, -1 4, 0 0 Z" fill="#d4af37">' +
          '<animate attributeName="opacity" values="0.2;1;0.4;0.2" dur="3s" repeatCount="indefinite" />' +
        '</path>' +
        '<path d="M 14 6 C 16 3, 19 3, 21 6 C 23 10, 22 16, 20 18 C 18 20, 16 19, 15 18 C 14 16, 13 10, 14 6 Z" fill="#d4af37">' +
          '<animate attributeName="opacity" values="0.2;0.3;1;0.3" dur="3s" repeatCount="indefinite" />' +
        '</path>' +
        '<path d="M 32 0 C 34 -3, 37 -3, 39 0 C 41 4, 40 10, 38 12 C 36 14, 34 13, 33 12 C 32 10, 31 4, 32 0 Z" fill="#d4af37">' +
          '<animate attributeName="opacity" values="0.3;0.2;0.4;1" dur="3s" repeatCount="indefinite" />' +
        '</path>' +
        '<path d="M 46 6 C 48 3, 51 3, 53 6 C 55 10, 54 16, 52 18 C 50 20, 48 19, 47 18 C 46 16, 45 10, 46 6 Z" fill="#d4af37">' +
          '<animate attributeName="opacity" values="1;0.2;0.3;0.5" dur="3s" repeatCount="indefinite" />' +
        '</path>' +
        '<text x="25" y="-12" fill="#fbbf24" font-family="\'EB Garamond\', serif" font-size="12.5" font-style="italic" font-weight="bold" filter="url(#wzTextShadow)">Гарри Поттер &amp; Рон Уизли</text>' +
      '</g>' +

      // 2: Гермиона Грейнджер (Библиотека)
      '<g class="wz-marauder-footsteps" transform="translate(1620, 810)">' +
        '<path d="M 0 0 C 2 -3, 4 -3, 6 0 C 8 3, 7 8, 5 10 C 3 11, 2 11, 1 10 C 0 8, -1 3, 0 0 Z" fill="#d4af37">' +
          '<animate attributeName="opacity" values="0.3;1;0.3;0.3" dur="2.5s" repeatCount="indefinite" />' +
        '</path>' +
        '<path d="M 12 5 C 14 2, 16 2, 18 5 C 20 8, 19 13, 17 15 C 15 16, 14 16, 13 15 C 12 13, 11 8, 12 5 Z" fill="#d4af37">' +
          '<animate attributeName="opacity" values="0.3;0.3;1;0.3" dur="2.5s" repeatCount="indefinite" />' +
        '</path>' +
        '<text x="10" y="-10" fill="#fbbf24" font-family="\'EB Garamond\', serif" font-size="12" font-style="italic" font-weight="bold" filter="url(#wzTextShadow)">Гермиона Грейнджер</text>' +
      '</g>' +

      // 3: Северус Снейп (Подземелья)
      '<g class="wz-marauder-footsteps" transform="translate(1020, 1620)">' +
        '<path d="M 0 0 C 2 -4, 6 -4, 8 0 C 10 5, 9 12, 7 14 C 5 16, 3 15, 2 14 C 0 12, -1 5, 0 0 Z" fill="#a7f3d0">' +
          '<animate attributeName="opacity" values="0.2;0.8;0.2;0.2" dur="3.5s" repeatCount="indefinite" />' +
        '</path>' +
        '<path d="M 18 8 C 20 4, 24 4, 26 8 C 28 13, 27 20, 25 22 C 23 24, 21 23, 20 22 C 18 20, 17 13, 18 8 Z" fill="#a7f3d0">' +
          '<animate attributeName="opacity" values="0.2;0.2;0.8;0.2" dur="3.5s" repeatCount="indefinite" />' +
        '</path>' +
        '<text x="12" y="-12" fill="#86efac" font-family="\'EB Garamond\', serif" font-size="12" font-style="italic" font-weight="bold" filter="url(#wzTextShadow)">Северус Снейп</text>' +
      '</g>' +

      // 4: Альбус Дамблдор (Кабинет директора)
      '<g class="wz-marauder-footsteps" transform="translate(1060, 640)">' +
        '<circle cx="0" cy="0" r="4" fill="#fbbf24">' +
          '<animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />' +
        '</circle>' +
        '<text x="12" y="4" fill="#fde047" font-family="\'EB Garamond\', serif" font-size="12" font-style="italic" font-weight="bold" filter="url(#wzTextShadow)">Альбус Дамблдор</text>' +
      '</g>' +

      // 5: Аргус Филч & Миссис Норрис (Коридор 3 этажа)
      '<g class="wz-marauder-footsteps" transform="translate(940, 1370)">' +
        '<path d="M 0 0 C 2 -3, 5 -3, 7 0 C 9 4, 8 10, 6 12 C 4 14, 2 13, 1 12 C 0 10, -1 4, 0 0 Z" fill="#fca5a5">' +
          '<animate attributeName="opacity" values="0.3;1;0.4;0.3" dur="2.8s" repeatCount="indefinite" />' +
        '</path>' +
        '<circle cx="16" cy="6" r="2.5" fill="#fca5a5" />' +
        '<circle cx="14" cy="2" r="1.2" fill="#fca5a5" />' +
        '<circle cx="16" cy="1" r="1.2" fill="#fca5a5" />' +
        '<circle cx="18" cy="2" r="1.2" fill="#fca5a5" />' +
        '<text x="5" y="-10" fill="#fca5a5" font-family="\'EB Garamond\', serif" font-size="11.5" font-style="italic" font-weight="bold" filter="url(#wzTextShadow)">Аргус Филч &amp; Миссис Норрис</text>' +
      '</g>';

    // 2. Внешняя карта окрестностей Хогвартса и Шотландии
    var bgSvgWorld = 
      '<rect x="0" y="0" width="2800" height="2400" fill="url(#wzParchmentBg)" />' +
      '<rect x="0" y="0" width="2800" height="2400" fill="url(#wzGrid)" />' +
      // Контуры Чёрного Озера
      '<path d="M 1350 1420 C 1450 1380, 1680 1400, 1750 1520 C 1820 1640, 1650 1780, 1500 1720 C 1380 1670, 1280 1500, 1350 1420 Z" fill="rgba(30, 58, 138, 0.25)" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,4" />' +
      '<text x="1540" y="1570" fill="#93c5fd" font-size="20" font-family="Cinzel, serif" font-weight="700" text-anchor="middle" opacity="0.6">Чёрное Озеро (Great Lake)</text>' +
      // Контуры Запретного Леса
      '<path d="M 750 1200 C 950 1150, 1150 1250, 1120 1550 C 1100 1750, 850 1800, 720 1680 C 620 1560, 600 1300, 750 1200 Z" fill="rgba(20, 83, 45, 0.2)" stroke="#22c55e" stroke-width="3" stroke-dasharray="8,5" />' +
      '<text x="900" y="1460" fill="#86efac" font-size="22" font-family="Cinzel, serif" font-weight="700" text-anchor="middle" opacity="0.6">Запретный Лес (Forbidden Forest)</text>' +
      // Контуры Хогвартса
      '<circle cx="1400" cy="1100" r="160" fill="rgba(212,175,55,0.06)" stroke="#d4af37" stroke-width="2" stroke-dasharray="5,3" />' +
      '<text x="1400" y="1170" fill="#fde047" font-size="16" font-family="Cinzel, serif" font-weight="700" text-anchor="middle" opacity="0.5">Земли Школы Чародейства и Волшебства</text>' +
      // Железная дорога к Хогсмиду
      '<path d="M 2520 1960 Q 2200 1600 1880 1360" fill="none" stroke="#e2e8f0" stroke-width="3" stroke-dasharray="8,6" opacity="0.4" />' +
      '<text x="2180" y="1620" fill="#cbd5e1" font-size="11" font-family="Cinzel, serif" opacity="0.5" transform="rotate(-35, 2180, 1620)">Хогвартс-экспресс</text>' +
      // Декоративный герб Карты Мародёров в углу
      '<g transform="translate(180, 200)">' +
        '<circle r="90" fill="rgba(0,0,0,0.5)" stroke="#d4af37" stroke-width="2" />' +
        '<text y="-25" text-anchor="middle" fill="#d4af37" font-family="Cinzel, serif" font-size="13" font-weight="700">MARAUDER\'S MAP</text>' +
        '<text y="0" text-anchor="middle" fill="#f4ecd8" font-family="Cinzel, serif" font-size="10">MOONY • WORMTAIL</text>' +
        '<text y="16" text-anchor="middle" fill="#f4ecd8" font-family="Cinzel, serif" font-size="10">PADFOOT &amp; PRONGS</text>' +
        '<text y="40" text-anchor="middle" fill="#fbbf24" font-family="EB Garamond, serif" font-style="italic" font-size="11">«Шалость удалась»</text>' +
      '</g>';

    var bgSvg = (m.scope === 'hogwarts' ? bgSvgHogwarts : bgSvgWorld);

    // Маршрут (route)
    var routeSvg = '';
    if(m.mode === 'route' && m.routePoints && m.routePoints.length >= 1){
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
        linesSvg = '<path class="wz-route-path-bg" d="' + pathData + '" fill="none" style="fill:none !important;" stroke="rgba(0,0,0,0.8)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path class="wz-route-path-fg" d="' + pathData + '" fill="none" style="fill:none !important;" stroke="#facc15" stroke-width="4.5" stroke-dasharray="14,10" stroke-linecap="round" stroke-linejoin="round" filter="url(#wzPinGlow)">' +
            '<animate attributeName="stroke-dashoffset" values="48;0" dur="1.5s" repeatCount="indefinite"/>' +
          '</path>';
      }

      var waypointsSvg = rpts.map(function(pt, idx){
        var isStart = (idx === 0);
        var isEnd = (idx === rpts.length - 1 && rpts.length > 1);
        var pinColor = isStart ? '#22c55e' : (isEnd ? '#ef4444' : '#eab308');
        var badgeLabel = (idx + 1);
        var ter = getWzTerrainAt(pt.x, pt.y);
        var hint = (isStart ? 'Старт: ' : (isEnd ? 'Цель: ' : 'Точка ' + (idx + 1) + ': ')) + (pt.name || '') + ' (' + ter.name + ') — Клик ЛКМ: удалить, Зажать: переместить';

        return '<g class="wz-route-point" data-route-pt-id="' + pt.id + '" transform="translate(' + pt.x + ',' + pt.y + ')" style="cursor:grab;touch-action:none;">' +
          '<title>' + escA(hint) + '</title>' +
          '<circle r="18" fill="rgba(0,0,0,0.4)" stroke="' + pinColor + '" stroke-width="2" stroke-dasharray="4,2"/>' +
          '<circle r="13" fill="' + pinColor + '" stroke="#ffffff" stroke-width="2.2" filter="url(#wzPinGlow)"/>' +
          '<text y="4" text-anchor="middle" font-size="10.5" font-weight="900" font-family="\'JetBrains Mono\',monospace" fill="#0f172a" pointer-events="none">' + badgeLabel + '</text>' +
          (m.showLabels !== false ? ('<text y="27" fill="' + (isStart ? '#86efac' : (isEnd ? '#fca5a5' : '#fde047')) + '" font-size="11.5" font-family="Cinzel, serif" font-weight="700" text-anchor="middle" filter="url(#wzTextShadow)">' + esc(pt.name || ('Точка ' + (idx + 1))) + '</text>') : '') +
        '</g>';
      }).join('');

      routeSvg = '<g id="wzRouteLayer">' + linesSvg + waypointsSvg + '</g>';
    }

    // Метки локаций (активный срез: Хогвартс либо Мир вокруг)
    var locs = getActiveLocations();
    var pinsSvg = locs.map(function(loc){
      var isSel = m.selectedLocId === loc.id;
      var radius = isSel ? 16 : 11;
      return '<g class="wz-map-pin ' + (isSel ? 'selected' : '') + '" data-loc-id="' + loc.id + '" transform="translate(' + loc.x + ',' + loc.y + ')" style="cursor:pointer;">' +
        (isSel ? ('<circle r="25" fill="rgba(212,175,55,0.2)" stroke="#d4af37" stroke-width="2" stroke-dasharray="5,3">' +
          '<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite"/>' +
        '</circle>') : '') +
        '<circle r="' + radius + '" fill="' + (isSel ? '#d4af37' : 'rgba(16,18,29,0.9)') + '" stroke="' + (isSel ? '#fff' : '#d4af37') + '" stroke-width="' + (isSel ? '2.5' : '2') + '" filter="url(#wzPinGlow)"/>' +
        '<text y="4" text-anchor="middle" font-size="' + (isSel ? '13' : '10') + '" pointer-events="none">' + (loc.icon || '📍') + '</text>' +
        (m.showLabels !== false ? ('<text y="' + (radius + 16) + '" fill="' + (isSel ? '#fde047' : '#f8fafc') + '" font-size="' + (isSel ? '13.5' : '11.5') + '" font-family="Cinzel, serif" font-weight="700" text-anchor="middle" filter="url(#wzTextShadow)">' + esc(loc.name) + '</text>') : '') +
      '</g>';
    }).join('');

    // Пользовательские метки
    var userPinsSvg = (m.showUserMarkers !== false ? (m.userMarkers || []).map(function(um){
      return '<g class="wz-user-marker" data-user-marker-id="' + um.id + '" transform="translate(' + um.x + ',' + um.y + ')" style="cursor:pointer;">' +
        '<circle r="12" fill="rgba(239,68,68,0.8)" stroke="#fff" stroke-width="2" filter="url(#wzPinGlow)"/>' +
        '<text y="4" text-anchor="middle" font-size="11" pointer-events="none">' + (um.icon || '📍') + '</text>' +
        (m.showLabels !== false ? ('<text y="24" fill="#fca5a5" font-size="11.5" font-family="Cinzel, serif" text-anchor="middle" font-weight="700" filter="url(#wzTextShadow)">' + esc(um.title || 'Метка') + '</text>') : '') +
      '</g>';
    }).join('') : '');

    return '<svg id="wzMapSvg" viewBox="' + minX + ' ' + minY + ' ' + vbW + ' ' + vbH + '" width="100%" height="100%" style="display:block;touch-action:none;user-select:none;">' +
      defsSvg + bgSvg + routeSvg + pinsSvg + userPinsSvg +
    '</svg>';
  }

  /* Экран КАРТА МАРОДЁРОВ (wzMap) - временно заблокирован по запросу */
  function wzMap(){
    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Карта Мародёров' }]) +
      '<button class="back" data-nav="wzHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzHome\');">← Назад</button>' +
      '<div class="wz-char-sheet-card" style="text-align:center;padding:50px 20px;margin-top:20px;border-style:dashed;">' +
        '<div style="font-size:52px;margin-bottom:14px;filter:drop-shadow(0 0 16px rgba(212,175,55,0.3));">🔒 🗺️</div>' +
        '<h2 style="font-family:Cinzel,serif;color:var(--wz-gold);margin-bottom:10px;font-size:22px;">Карта Мародёров временно заблокирована</h2>' +
        '<p style="color:var(--wz-text-muted);max-width:520px;margin:0 auto 24px;font-size:14px;line-height:1.6;">' +
          '«Торжественно клянусь, что замышляю шалость, и только шалость...»<br>' +
          'Раздел интерактивной карты Хогвартса и окрестностей временно закрыт маскировочными чарами на период реконструкции.' +
        '</p>' +
        '<button class="btn btn-primary" data-nav="wzHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzHome\');">← Вернуться на главную Волшебника</button>' +
      '</div>';
  }

  function wireWzMap(){
    wireWzNav();
  }

  /* Полная интерактивная карта (сохранена для последующей разблокировки) */
  function wzMapContent(){
    var m = WZ.map;
    if(!m.scope) m.scope = 'hogwarts';
    if(!m.userMarkers || !m.userMarkers.length) WZ.loadUserMarkers();

    var markersCount = (m.userMarkers || []).length;
    var locs = getActiveLocations();
    var curLoc = locs.find(function(l){ return l.id === m.selectedLocId; }) || locs[0];
    m.selectedLocId = curLoc.id;

    var inspectorHtml = '';

    if(m.mode === 'inspect'){
      inspectorHtml = '<div class="wz-char-sheet-card" style="margin-top:14px;">' +
        '<div class="wz-char-header">' +
          '<span>' + (curLoc.icon || '🏰') + ' <b>' + esc(curLoc.name) + '</b></span>' +
          '<span class="wz-stat-badge">' + esc(curLoc.region) + '</span>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:8px;margin-top:10px;margin-bottom:10px;font-size:12.5px;">' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:4px;padding:8px 10px;">' +
            '<span style="color:var(--wz-text-muted);font-size:11px;display:block;">ХРАНИТЕЛЬ / ВЛАСТЬ:</span>' +
            '<b style="color:#f1f5f9;">' + esc(curLoc.ruler || '—') + '</b>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:4px;padding:8px 10px;">' +
            '<span style="color:var(--wz-text-muted);font-size:11px;display:block;">ОБЛАСТЬ / ТИП:</span>' +
            '<b style="color:#f1f5f9;">' + esc(curLoc.climate || '—') + '</b>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:4px;padding:8px 10px;">' +
            '<span style="color:var(--wz-text-muted);font-size:11px;display:block;">УРОВЕНЬ ОПАСНОСТИ:</span>' +
            '<b style="color:#fca5a5;">' + esc(curLoc.danger || '—') + '</b>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:13.5px;line-height:1.6;color:var(--wz-parchment);font-style:italic;">' +
          esc(curLoc.desc) +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">' +
          '<button class="btn btn-primary" id="wzMapSetRouteDestBtn" data-loc-id="' + curLoc.id + '">🧭 Проложить путь сюда</button>' +
          '<button class="btn btn-ghost" id="wzMapSetRouteOriginBtn" data-loc-id="' + curLoc.id + '">🏁 Начать маршрут отсюда</button>' +
          '<button class="btn btn-ghost" id="wzMapCenterOnLocBtn" data-loc-id="' + curLoc.id + '">🎯 Сфокусировать камеру</button>' +
        '</div>' +
      '</div>';
    } else if(m.mode === 'route'){
      if(!m.routeLoaded){
        WZ.loadRoute();
        m.routeLoaded = true;
      }
      var rCalc = calcWzRoute(m.routePoints || [], m.travelMode || (m.scope === 'hogwarts' ? 'walk' : 'broom'), m.travelPace || 'normal');

      var warningsHtml = (rCalc.warnings && rCalc.warnings.length) ? ('<div style="margin-top:10px;display:flex;flex-direction:column;gap:6px;">' +
        rCalc.warnings.map(function(w){
          return '<div style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.35);border-radius:4px;padding:8px 12px;font-size:12.5px;color:#fca5a5;">' + esc(w) + '</div>';
        }).join('') +
      '</div>') : '';

      var pointsTableRows = (m.routePoints && m.routePoints.length) ? m.routePoints.map(function(pt, idx){
        var isStart = (idx === 0);
        var isEnd = (idx === m.routePoints.length - 1 && m.routePoints.length > 1);
        var badgeColor = isStart ? '#22c55e' : (isEnd ? '#ef4444' : '#eab308');
        var badgeText = isStart ? '1 (Старт)' : (isEnd ? (idx + 1) + ' (Цель)' : (idx + 1) + ' (Точка)');
        var ter = getWzTerrainAt(pt.x, pt.y);

        var segInfo = rCalc.segments[idx];
        var distToNext = '';
        if(m.scope === 'hogwarts'){
          distToNext = segInfo ? ('<span style="color:#fde047;font-weight:700;">' + segInfo.dist + ' ярдов</span> <span style="color:var(--wz-text-muted);font-size:11px;">(~' + segInfo.timeStr + ')</span>') : '<span style="color:var(--wz-text-muted);">Финиш</span>';
        } else {
          distToNext = segInfo ? ('<span style="color:#fde047;font-weight:700;">' + segInfo.dist + ' миль</span> <span style="color:var(--wz-text-muted);font-size:11px;">(~' + segInfo.days + ' дн.)</span>') : '<span style="color:var(--wz-text-muted);">Финиш</span>';
        }

        return '<tr class="wz-route-row" data-wz-route-row-id="' + pt.id + '" style="border-bottom:1px solid rgba(255,255,255,0.06);">' +
          '<td style="padding:8px 6px;text-align:center;"><span style="background:' + badgeColor + ';color:#0f172a;padding:2px 7px;border-radius:10px;font-size:11px;font-weight:900;font-family:\'JetBrains Mono\',monospace;">' + badgeText + '</span></td>' +
          '<td style="padding:8px 6px;">' +
            '<div style="font-weight:700;color:#fff;cursor:pointer;" class="wz-pt-name-edit" data-wz-pt-id="' + pt.id + '" title="Кликните, чтобы переименовать">' + esc(pt.name || ('Точка ' + (idx + 1))) + ' ✏️</div>' +
            '<div style="font-size:11px;color:var(--wz-text-muted);font-family:\'JetBrains Mono\',monospace;">[' + pt.x + ', ' + pt.y + ']</div>' +
          '</td>' +
          '<td style="padding:8px 6px;font-size:12px;">' + ter.icon + ' ' + esc(ter.name) + '</td>' +
          '<td style="padding:8px 6px;font-size:12px;">' + distToNext + '</td>' +
          '<td style="padding:8px 6px;text-align:right;white-space:nowrap;">' +
            '<button class="btn btn-ghost" data-wz-pt-focus="' + pt.id + '" style="padding:3px 7px;font-size:11px;margin-right:4px;" title="Сфокусировать карту">🎯</button>' +
            '<button class="btn btn-ghost" data-wz-pt-del="' + pt.id + '" style="padding:3px 7px;font-size:11px;color:#ef4444;" title="Удалить точку">🗑️</button>' +
          '</td>' +
        '</tr>';
      }).join('') : '<tr><td colspan="5" class="char-empty" style="text-align:center;padding:16px;">Маршрут пуст. Кликните по карте в любом месте, чтобы поставить первую путевую точку!</td></tr>';

      var distBadge = (m.scope === 'hogwarts') ? 
        ('<span class="wz-stat-badge" style="color:#fde047;">📏 ' + rCalc.totalDist + ' ярдов</span>' +
         '<span class="wz-stat-badge" style="color:#93c5fd;">⏳ ' + (rCalc.totalMinutes > 0 ? (rCalc.totalMinutes + ' мин. ' + rCalc.totalSeconds + ' с.') : (rCalc.totalSeconds + ' с.')) + '</span>') :
        ('<span class="wz-stat-badge" style="color:#fde047;">📏 ' + rCalc.totalDist + ' миль</span>' +
         '<span class="wz-stat-badge" style="color:#93c5fd;">⏳ ' + rCalc.wholeDays + ' дн. ' + rCalc.remHours + ' ч.</span>');

      var travelModeButtons = (m.scope === 'hogwarts') ? (
        '<button class="wz-pill ' + (rCalc.mode === 'walk' ? 'active' : '') + '" data-wz-route-mode="walk">🚶 Шаг ученика (60 ярд/мин)</button>' +
        '<button class="wz-pill ' + (rCalc.mode === 'sprint' ? 'active' : '') + '" data-wz-route-mode="sprint">🏃 Бег на урок (120 ярд/мин)</button>' +
        '<button class="wz-pill ' + (rCalc.mode === 'cloak' ? 'active' : '') + '" data-wz-route-mode="cloak">🕵️ Под Мантией (40 ярд/мин)</button>' +
        '<button class="wz-pill ' + (rCalc.mode === 'secret' ? 'active' : '') + '" data-wz-route-mode="secret">🗝️ Тайный лаз (90 ярд/мин)</button>'
      ) : (
        '<button class="wz-pill ' + (rCalc.mode === 'broom' ? 'active' : '') + '" data-wz-route-mode="broom">🧹 Скоростная метла (90 миль/день)</button>' +
        '<button class="wz-pill ' + (rCalc.mode === 'thestral' ? 'active' : '') + '" data-wz-route-mode="thestral">🐴 Полет на Фестрале (110 миль/день)</button>' +
        '<button class="wz-pill ' + (rCalc.mode === 'express' ? 'active' : '') + '" data-wz-route-mode="express">🚂 Хогвартс-экспресс (160 миль/день)</button>' +
        '<button class="wz-pill ' + (rCalc.mode === 'foot' ? 'active' : '') + '" data-wz-route-mode="foot">🥾 Пешком (20 миль/день)</button>'
      );

      inspectorHtml = '<div class="wz-char-sheet-card" style="margin-top:14px;">' +
        '<div class="wz-char-header">' +
          '<span>🧭 Планировщик маршрутов: ' + (m.scope === 'hogwarts' ? 'Коридоры Хогвартса' : 'Окрестности и Британия') + '</span>' +
          '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' +
            distBadge +
          '</div>' +
        '</div>' +
        '<div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.25);border-radius:6px;padding:8px 12px;margin-top:10px;font-size:12.5px;color:#e2e8f0;line-height:1.45;">' +
          '💡 <b>Управление маршрутом:</b> Кликайте по карте или локациям для добавления точек. <span style="color:#fde047;font-weight:700;">Клик ЛКМ по точке — удалить</span>, <span style="color:#86efac;font-weight:700;">Зажать ЛКМ и тянуть — переместить</span>.' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;margin-top:12px;">' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:6px;padding:10px;">' +
            '<div style="font-size:11px;font-weight:700;color:var(--wz-text-muted);text-transform:uppercase;margin-bottom:6px;">Способ перемещения:</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
              travelModeButtons +
            '</div>' +
          '</div>' +
          '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:6px;padding:10px;">' +
            '<div style="font-size:11px;font-weight:700;color:var(--wz-text-muted);text-transform:uppercase;margin-bottom:6px;">Темп движения:</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
              '<button class="wz-pill ' + (rCalc.pace === 'normal' ? 'active' : '') + '" data-wz-route-pace="normal">⚖️ Обычный</button>' +
              '<button class="wz-pill ' + (rCalc.pace === 'fast' ? 'active' : '') + '" data-wz-route-pace="fast">⚡ Форсированный (+30%)</button>' +
              '<button class="wz-pill ' + (rCalc.pace === 'stealth' ? 'active' : '') + '" data-wz-route-pace="stealth">🕵️ Скрытный / Под Мантией (-25%)</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        warningsHtml +
        '<div style="margin-top:16px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">' +
            '<div style="font-weight:700;font-size:13.5px;color:#fff;font-family:\'Cinzel\',serif;">Маршрутный лист волшебника (' + (m.routePoints || []).length + ')</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
              '<button class="btn btn-ghost" id="wzRouteAddCenterBtn" style="font-size:11px;padding:3px 8px;">➕ Точка в центр</button>' +
              '<button class="btn btn-ghost" id="wzRouteClearBtn" style="font-size:11px;padding:3px 8px;color:#ef4444;">🧹 Очистить</button>' +
            '</div>' +
          '</div>' +
          '<div style="overflow-x:auto;background:rgba(10,14,20,0.6);border:1px solid var(--wz-border);border-radius:6px;">' +
            '<table style="width:100%;border-collapse:collapse;font-size:12.5px;">' +
              '<thead>' +
                '<tr style="background:rgba(255,255,255,0.04);border-bottom:1px solid var(--wz-border);color:var(--wz-text-muted);font-size:11px;text-transform:uppercase;">' +
                  '<th style="padding:6px 8px;text-align:center;">#</th>' +
                  '<th style="padding:6px 8px;text-align:left;">Название</th>' +
                  '<th style="padding:6px 8px;text-align:left;">Локация / Рельеф</th>' +
                  '<th style="padding:6px 8px;text-align:left;">До следующей</th>' +
                  '<th style="padding:6px 8px;text-align:right;">Действия</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' + pointsTableRows + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
      '</div>';
    } else if(m.mode === 'markers'){
      inspectorHtml = '<div class="wz-char-sheet-card" style="margin-top:14px;">' +
        '<div class="wz-char-header">' +
          '<span>📍 Тактические метки и тайники (' + markersCount + ')</span>' +
          '<button class="btn btn-primary" id="wzMapAddMarkerOpenBtn" style="font-size:11px;padding:4px 10px;">➕ Метка в центр</button>' +
        '</div>' +
        '<div style="font-size:12px;color:var(--wz-text-muted);margin-top:4px;margin-bottom:10px;">💡 <b>Совет:</b> В режиме «Метки» кликайте по карте, чтобы отметить тайные проходы, убежища или схроны ингредиентов.</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:8px;">' +
          (m.userMarkers && m.userMarkers.length ? m.userMarkers.map(function(um){
            return '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--wz-border);border-radius:4px;padding:8px;display:flex;justify-content:space-between;align-items:center;gap:6px;">' +
              '<div style="flex:1;min-width:0;cursor:pointer;" class="wz-user-marker-row" data-marker-id="' + um.id + '">' +
                '<div style="font-weight:700;font-size:12.5px;color:#fff;">' + (um.icon || '📍') + ' ' + esc(um.title || 'Метка') + ' <span style="font-size:10px;color:var(--wz-text-muted);font-weight:normal;">[' + um.x + ', ' + um.y + ']</span></div>' +
                (um.desc ? ('<div style="font-size:11px;color:var(--wz-text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(um.desc) + '</div>') : '') +
              '</div>' +
              '<button class="btn btn-ghost" data-wz-del-marker="' + um.id + '" style="font-size:11px;padding:2px 6px;color:#ef4444;" title="Удалить метку">🗑️</button>' +
            '</div>';
          }).join('') : '<div class="char-empty" style="grid-column:1/-1;">Нет меток. Кликните по карте, чтобы поставить метку тайника или секрета.</div>') +
        '</div>' +
      '</div>';
    }

    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Карта Мародёров' }]) +
      '<button class="back" data-nav="wzHome" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzHome\');">← Назад</button>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">' +
        '<div>' +
          '<h1 style="margin-bottom:4px;">🗺️ Карта Мародёров: ' + (m.scope === 'hogwarts' ? 'Хогвартс (Интерьер замка)' : 'Мир вокруг (Окрестности и Шотландия)') + '</h1>' +
          '<div class="desc" style="margin-bottom:0;">«Торжественно клянусь, что замышляю шалость, и только шалость!» ' +
            (m.scope === 'hogwarts' ? 'Внутренний архитектурный план залов, лестниц, башен, подземелий и тайных лазов Хогвартса.' : 'План окрестностей замка: Чёрное Озеро, Запретный Лес, Хогсмид и нагорье.') +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">' +
          '<div class="wz-realm-switch">' +
            '<button class="wz-realm-btn ' + (m.scope === 'hogwarts' ? 'active' : '') + '" id="wzScopeHogwarts" type="button">🏰 Хогвартс</button>' +
            '<button class="wz-realm-btn ' + (m.scope === 'world' ? 'active' : '') + '" id="wzScopeWorld" type="button">🌍 Мир вокруг</button>' +
          '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
            '<button class="wz-pill ' + (m.mode === 'inspect' ? 'active' : '') + '" id="wzMapModeInspect">🗺️ Атлас</button>' +
            '<button class="wz-pill ' + (m.mode === 'route' ? 'active' : '') + '" id="wzMapModeRoute">🧭 Маршруты</button>' +
            '<button class="wz-pill ' + (m.mode === 'markers' ? 'active' : '') + '" id="wzMapModeMarkers">📍 Метки (' + markersCount + ')</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="wz-map-container">' +
        '<div class="wi-map-toolbar" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(14,18,24,0.95);border-bottom:1px solid var(--wz-border);flex-wrap:wrap;gap:8px;">' +
          '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:220px;">' +
            '<span style="color:var(--wz-gold);font-size:13px;">🔍</span>' +
            '<input type="text" id="wzMapSearch" class="wz-input" style="padding:5px 10px;font-size:12.5px;max-width:320px;" placeholder="' + (m.scope === 'hogwarts' ? 'Поиск зала, башни или тайного хода...' : 'Поиск локации в окрестностях...') + '" value="' + escA(m.search || '') + '">' +
          '</div>' +
          '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' +
            '<button class="btn btn-ghost" id="wzMapToggleLabels" title="Показать/скрыть подписи" style="padding:4px 9px;font-size:12px;">' + (m.showLabels !== false ? '🏷️ Текст' : '🏷️ Без текста') + '</button>' +
            '<button class="btn btn-ghost" id="wzMapZoomIn" title="Приблизить" style="padding:4px 10px;font-size:12px;">➕</button>' +
            '<button class="btn btn-ghost" id="wzMapZoomOut" title="Отдалить" style="padding:4px 10px;font-size:12px;">➖</button>' +
            '<button class="btn btn-ghost" id="wzMapZoomReset" title="Сбросить масштаб" style="padding:4px 10px;font-size:12px;">⟲ 100%</button>' +
          '</div>' +
        '</div>' +
        '<div class="wz-map-viewport" id="wzMapViewport">' +
          renderWizardMapSvg() +
        '</div>' +
      '</div>' +
      inspectorHtml;
  }

  /* Привязка событий карты Мародёров (сохранена для разблокировки) */
  function wireWzMapContent(){
    var m = WZ.map;

    var modeInspect = document.getElementById('wzMapModeInspect');
    if(modeInspect){
      modeInspect.addEventListener('click', function(){
        m.mode = 'inspect';
        if(typeof render === 'function') render();
      });
    }

    var modeRoute = document.getElementById('wzMapModeRoute');
    if(modeRoute){
      modeRoute.addEventListener('click', function(){
        m.mode = 'route';
        if(typeof render === 'function') render();
      });
    }

    var modeMarkers = document.getElementById('wzMapModeMarkers');
    if(modeMarkers){
      modeMarkers.addEventListener('click', function(){
        m.mode = 'markers';
        if(typeof render === 'function') render();
      });
    }

    function updateMapTransform(){
      var svg = document.getElementById('wzMapSvg');
      var vp = document.getElementById('wzMapViewport');
      if(!svg || !vp) return;
      var vw = vp.clientWidth || 800;
      var vh = vp.clientHeight || 540;
      var ar = vw / vh;
      var z = Math.max(0.4, Math.min(5.0, m.zoom || 1.0));
      var baseW = 2400;
      var baseH = baseW / ar;
      var vbW = baseW / z;
      var vbH = baseH / z;
      var defCx = (m.scope === 'hogwarts' ? 1200 : 1400);
      var defCy = (m.scope === 'hogwarts' ? 1150 : 1300);
      var minX = (m.cx != null ? m.cx : defCx) - vbW / 2;
      var minY = (m.cy != null ? m.cy : defCy) - vbH / 2;
      svg.setAttribute('viewBox', minX + ' ' + minY + ' ' + vbW + ' ' + vbH);
    }

    function focusOn(x, y, zoom){
      m.cx = x;
      m.cy = y;
      if(zoom != null) m.zoom = zoom;
      updateMapTransform();
    }

    var toggleLabelsBtn = document.getElementById('wzMapToggleLabels');
    if(toggleLabelsBtn){
      toggleLabelsBtn.addEventListener('click', function(){
        m.showLabels = (m.showLabels === false ? true : false);
        if(typeof render === 'function') render();
      });
    }

    var btnIn = document.getElementById('wzMapZoomIn');
    if(btnIn){
      btnIn.addEventListener('click', function(){
        m.zoom = Math.min((m.zoom || 1.0) * 1.3, 5.0);
        updateMapTransform();
      });
    }

    var btnOut = document.getElementById('wzMapZoomOut');
    if(btnOut){
      btnOut.addEventListener('click', function(){
        m.zoom = Math.max((m.zoom || 1.0) / 1.3, 0.4);
        updateMapTransform();
      });
    }

    var btnReset = document.getElementById('wzMapZoomReset');
    if(btnReset){
      btnReset.addEventListener('click', function(){
        m.zoom = 1.0;
        m.cx = (m.scope === 'hogwarts' ? 1200 : 1400);
        m.cy = (m.scope === 'hogwarts' ? 1150 : 1300);
        updateMapTransform();
      });
    }

    function switchMapScope(newScope){
      if(m.scope === newScope) return;
      if(!m.routes) m.routes = { hogwarts: {}, world: {} };
      m.routes[m.scope] = {
        points: (m.routePoints || []).slice(),
        mode: m.travelMode,
        pace: m.travelPace
      };
      m.scope = newScope;
      WZ.loadRoute();
      if(newScope === 'hogwarts'){
        m.cx = 1200;
        m.cy = 1150;
        m.zoom = 1.0;
        m.selectedLocId = 'great_hall';
      } else {
        m.cx = 1400;
        m.cy = 1300;
        m.zoom = 1.0;
        m.selectedLocId = 'hogwarts_castle';
      }
      if(typeof render === 'function') render();
    }

    var btnHogwarts = document.getElementById('wzScopeHogwarts');
    if(btnHogwarts){
      btnHogwarts.addEventListener('click', function(){
        switchMapScope('hogwarts');
      });
    }

    var btnWorld = document.getElementById('wzScopeWorld');
    if(btnWorld){
      btnWorld.addEventListener('click', function(){
        switchMapScope('world');
      });
    }

    var searchInput = document.getElementById('wzMapSearch');
    if(searchInput){
      searchInput.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){
          var query = (searchInput.value || '').trim().toLowerCase();
          if(!query) return;
          var locs = getActiveLocations();
          var found = locs.find(function(l){
            return l.name.toLowerCase().indexOf(query) !== -1 ||
                   (l.desc && l.desc.toLowerCase().indexOf(query) !== -1) ||
                   (l.region && l.region.toLowerCase().indexOf(query) !== -1);
          });
          if(found){
            m.selectedLocId = found.id;
            focusOn(found.x, found.y, Math.max(m.zoom || 1.0, 2.0));
            WZ.toast('🔍 Найдено: ' + found.name, 'success');
            if(typeof render === 'function') render();
          } else {
            WZ.toast('Ничего не найдено по запросу «' + query + '»', 'warning');
          }
        }
      });
    }

    // Клик по метке локации
    document.querySelectorAll('.wz-map-pin').forEach(function(pin){
      pin.addEventListener('click', function(e){
        e.stopPropagation();
        var lid = pin.getAttribute('data-loc-id');
        if(!lid) return;
        var loc = getActiveLocations().find(function(l){ return l.id === lid; });
        if(!loc) return;

        if(m.mode === 'route'){
          m.routePoints = m.routePoints || [];
          m.routePoints.push({
            id: 'wp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: loc.name,
            x: loc.x,
            y: loc.y
          });
          WZ.saveRoute();
          WZ.toast('✓ «' + loc.name + '» добавлен в маршрут', 'success');
          if(typeof render === 'function') render();
          return;
        }

        m.selectedLocId = lid;
        if(typeof render === 'function') render();
      });
    });

    // Удаление точки маршрута
    function removeRoutePoint(ptId){
      m.routePoints = m.routePoints || [];
      var idx = m.routePoints.findIndex(function(p){ return p.id === ptId; });
      if(idx !== -1){
        var removed = m.routePoints.splice(idx, 1)[0];
        WZ.saveRoute();
        WZ.toast('🗑️ Точка «' + (removed.name || ('#' + (idx + 1))) + '» удалена', 'info');
        if(typeof render === 'function') render();
      }
    }

    // Удаление точки из таблицы
    document.querySelectorAll('[data-wz-pt-del]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var ptId = btn.getAttribute('data-wz-pt-del');
        removeRoutePoint(ptId);
      });
    });

    // Фокус на точке
    document.querySelectorAll('[data-wz-pt-focus]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var ptId = btn.getAttribute('data-wz-pt-focus');
        var pt = (m.routePoints || []).find(function(p){ return p.id === ptId; });
        if(pt){
          focusOn(pt.x, pt.y, Math.max(m.zoom || 1.0, 2.2));
          WZ.toast('🎯 Фокус на: ' + pt.name, 'info');
        }
      });
    });

    // Переименование точки
    document.querySelectorAll('.wz-pt-name-edit').forEach(function(el){
      el.addEventListener('click', function(){
        var ptId = el.getAttribute('data-wz-pt-id');
        var pt = (m.routePoints || []).find(function(p){ return p.id === ptId; });
        if(!pt) return;
        var newName = prompt('Новое название точки маршрута:', pt.name);
        if(newName && newName.trim()){
          pt.name = newName.trim();
          WZ.saveRoute();
          if(typeof render === 'function') render();
        }
      });
    });

    // Кнопка очистки маршрута
    var clearBtn = document.getElementById('wzRouteClearBtn');
    if(clearBtn){
      clearBtn.addEventListener('click', function(){
        if(!m.routePoints || !m.routePoints.length) return;
        if(!confirm('Очистить все точки текущего маршрута?')) return;
        m.routePoints = [];
        WZ.saveRoute();
        WZ.toast('🧹 Маршрут очищен', 'info');
        if(typeof render === 'function') render();
      });
    }

    // Добавить точку в центр
    var addCenterBtn = document.getElementById('wzRouteAddCenterBtn');
    if(addCenterBtn){
      addCenterBtn.addEventListener('click', function(){
        var cx = Math.round(m.cx || 1400);
        var cy = Math.round(m.cy || 1100);
        var ter = getWzTerrainAt(cx, cy);
        m.routePoints = m.routePoints || [];
        var count = m.routePoints.length;
        m.routePoints.push({
          id: 'wp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: (count === 0 ? 'Старт: ' : 'Точка ' + (count + 1) + ': ') + ter.name,
          x: cx,
          y: cy
        });
        WZ.saveRoute();
        WZ.toast('✓ Добавлена точка #' + (count + 1) + ' в центре', 'success');
        if(typeof render === 'function') render();
      });
    }

    // Переключение способа передвижения
    document.querySelectorAll('[data-wz-route-mode]').forEach(function(btn){
      btn.addEventListener('click', function(){
        m.travelMode = btn.getAttribute('data-wz-route-mode');
        WZ.saveRoute();
        if(typeof render === 'function') render();
      });
    });

    // Переключение темпа
    document.querySelectorAll('[data-wz-route-pace]').forEach(function(btn){
      btn.addEventListener('click', function(){
        m.travelPace = btn.getAttribute('data-wz-route-pace');
        WZ.saveRoute();
        if(typeof render === 'function') render();
      });
    });

    // Кнопки из карточки инспектора
    var setRouteDestBtn = document.getElementById('wzMapSetRouteDestBtn');
    if(setRouteDestBtn){
      setRouteDestBtn.addEventListener('click', function(){
        var id = setRouteDestBtn.getAttribute('data-loc-id');
        var loc = getActiveLocations().find(function(l){ return l.id === id; });
        if(loc){
          m.routePoints = m.routePoints || [];
          m.routePoints.push({
            id: 'wp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: loc.name,
            x: loc.x,
            y: loc.y
          });
          m.mode = 'route';
          WZ.saveRoute();
          if(typeof render === 'function') render();
        }
      });
    }

    var setRouteOrigBtn = document.getElementById('wzMapSetRouteOriginBtn');
    if(setRouteOrigBtn){
      setRouteOrigBtn.addEventListener('click', function(){
        var id = setRouteOrigBtn.getAttribute('data-loc-id');
        var loc = getActiveLocations().find(function(l){ return l.id === id; });
        if(loc){
          m.routePoints = [{
            id: 'wp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: 'Старт: ' + loc.name,
            x: loc.x,
            y: loc.y
          }];
          m.mode = 'route';
          WZ.saveRoute();
          if(typeof render === 'function') render();
        }
      });
    }

    var centerOnLocBtn = document.getElementById('wzMapCenterOnLocBtn');
    if(centerOnLocBtn){
      centerOnLocBtn.addEventListener('click', function(){
        var id = centerOnLocBtn.getAttribute('data-loc-id');
        var loc = getActiveLocations().find(function(l){ return l.id === id; });
        if(loc){
          focusOn(loc.x, loc.y, Math.max(m.zoom || 1.0, 2.0));
          WZ.toast('🎯 Камера сфокусирована на: ' + loc.name, 'info');
        }
      });
    }

    // Метки
    var addMarkerBtn = document.getElementById('wzMapAddMarkerOpenBtn');
    if(addMarkerBtn){
      addMarkerBtn.addEventListener('click', function(){
        var title = prompt('Название метки (например: Тайник Когтеврана, Вход в подземелья):');
        if(!title) return;
        var icon = prompt('Иконка-эмодзи (🪄, 📜, 🗝️, 🍺, ⚡, 💎, 🐍, 🦁):', '🗝️') || '📍';
        var desc = prompt('Заметка к тайнику:') || '';
        m.userMarkers.push({
          id: 'um_' + Date.now(),
          title: title,
          icon: icon,
          desc: desc,
          x: Math.round(m.cx || 1400),
          y: Math.round(m.cy || 1100)
        });
        WZ.saveUserMarkers();
        WZ.toast('✓ Метка добавлена', 'success');
        if(typeof render === 'function') render();
      });
    }

    document.querySelectorAll('[data-wz-del-marker]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var id = btn.getAttribute('data-wz-del-marker');
        m.userMarkers = (m.userMarkers || []).filter(function(x){ return x.id !== id; });
        WZ.saveUserMarkers();
        if(typeof render === 'function') render();
      });
    });

    // Drag, Wheel, Pinch-Zoom и перемещение точек (drag-and-drop)
    var vport = document.getElementById('wzMapViewport');
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

      // Правая кнопка мыши полностью заблокирована
      vport.addEventListener('contextmenu', function(e){
        e.preventDefault();
        e.stopPropagation();
      });

      vport.addEventListener('mousedown', function(e){
        if(e.button !== 0) return;

        // Проверяем нажатие на путевую точку
        var ptEl = e.target.closest && e.target.closest('.wz-route-point');
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

        isDown = true;
        hasDragged = false;
        startX = e.clientX;
        startY = e.clientY;
        vport.style.cursor = 'grabbing';
      });

      if(window.__wzMapOnMouseMove) window.removeEventListener('mousemove', window.__wzMapOnMouseMove);
      if(window.__wzMapOnMouseUp) window.removeEventListener('mouseup', window.__wzMapOnMouseUp);

      window.__wzMapOnMouseMove = function(e){
        if(isDraggingPoint && dragPtObj){
          var dxPt = e.clientX - dragStartClientX;
          var dyPt = e.clientY - dragStartClientY;
          if(Math.hypot(dxPt, dyPt) > 4){
            dragPtHasMoved = true;
          }

          if(dragPtHasMoved){
            var vwP = vport.clientWidth || 800;
            var vhP = vport.clientHeight || 540;
            var arP = vwP / vhP;
            var zP = Math.max(0.4, Math.min(5.0, m.zoom || 1.0));
            var baseWP = 2400;
            var baseHP = baseWP / arP;
            var vbWP = baseWP / zP;
            var vbHP = baseHP / zP;
            var minXP = (m.cx != null ? m.cx : 1400) - vbWP / 2;
            var minYP = (m.cy != null ? m.cy : 1100) - vbHP / 2;
            var rectP = vport.getBoundingClientRect();
            var mouseXP = e.clientX - rectP.left;
            var mouseYP = e.clientY - rectP.top;

            var newPtX = Math.round(minXP + (mouseXP / vwP) * vbWP);
            var newPtY = Math.round(minYP + (mouseYP / vhP) * vbHP);
            newPtX = Math.max(20, Math.min(2780, newPtX));
            newPtY = Math.max(20, Math.min(2380, newPtY));

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
              var pathBg = vport.querySelector('.wz-route-path-bg');
              var pathFg = vport.querySelector('.wz-route-path-fg');
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
        var vh = vport.clientHeight || 540;
        var ar = vw / vh;
        var z = Math.max(0.4, Math.min(5.0, m.zoom || 1.0));
        var baseW = 2400;
        var scale = (baseW / z) / vw;

        m.cx = Math.max(200, Math.min(2600, (m.cx || 1400) - dx * scale));
        m.cy = Math.max(200, Math.min(2200, (m.cy || 1100) - dy * scale));
        updateMapTransform();
      };

      window.__wzMapOnMouseUp = function(){
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
              var ter = getWzTerrainAt(pt.x, pt.y);
              if(pt.name && (pt.name.indexOf('Точка') === 0 || pt.name.indexOf('Старт:') === 0)){
                var isFirst = (m.routePoints && m.routePoints[0] && m.routePoints[0].id === pt.id);
                var idx = (m.routePoints || []).findIndex(function(p){ return p.id === pt.id; });
                pt.name = (isFirst ? 'Старт: ' : ('Точка ' + (idx + 1) + ' (')) + ter.name + (isFirst ? '' : ')');
              }
            }
            WZ.saveRoute();
            WZ.toast('✓ Точка перемещена', 'success');
            if(typeof render === 'function') render();
          } else {
            removeRoutePoint(handledPtId);
          }
          return;
        }

        if(isDown){
          isDown = false;
          if(vport) vport.style.cursor = 'grab';
        }
      };

      window.addEventListener('mousemove', window.__wzMapOnMouseMove);
      window.addEventListener('mouseup', window.__wzMapOnMouseUp);

      // Зум колесиком
      vport.addEventListener('wheel', function(e){
        e.preventDefault();
        var vw = vport.clientWidth || 800;
        var vh = vport.clientHeight || 540;
        var ar = vw / vh;
        var rect = vport.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;
        var mouseY = e.clientY - rect.top;

        var curZoom = Math.max(0.4, Math.min(5.0, m.zoom || 1.0));
        var curVbW = 2400 / curZoom;
        var curVbH = (2400 / ar) / curZoom;
        var curMinX = (m.cx != null ? m.cx : 1400) - curVbW / 2;
        var curMinY = (m.cy != null ? m.cy : 1100) - curVbH / 2;

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

      // Клик по карте для установки точки
      vport.addEventListener('click', function(e){
        if(hasDragged) return;
        if(justHandledPointAction) return;
        if(e.button !== 0) return;

        var rect = vport.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;
        var mouseY = e.clientY - rect.top;
        var vw = vport.clientWidth || 800;
        var vh = vport.clientHeight || 540;
        var ar = vw / vh;
        var z = Math.max(0.4, Math.min(5.0, m.zoom || 1.0));
        var baseW = 2400;
        var baseH = baseW / ar;
        var vbW = baseW / z;
        var vbH = baseH / z;
        var minX = (m.cx != null ? m.cx : 1400) - vbW / 2;
        var minY = (m.cy != null ? m.cy : 1100) - vbH / 2;

        var clickX = Math.round(minX + (mouseX / vw) * vbW);
        var clickY = Math.round(minY + (mouseY / vh) * vbH);
        clickX = Math.max(20, Math.min(2780, clickX));
        clickY = Math.max(20, Math.min(2380, clickY));

        if(m.mode === 'route'){
          if(e.target.closest && (e.target.closest('.wz-route-point') || e.target.closest('.wz-map-pin') || e.target.closest('.wz-user-marker') || e.target.closest('.wz-char-sheet-card'))) return;

          m.routePoints = m.routePoints || [];
          var ter = getWzTerrainAt(clickX, clickY);
          var count = m.routePoints.length;
          var isFirst = count === 0;
          var defaultName = isFirst ? ('Старт: ' + ter.name) : ('Точка ' + (count + 1) + ' (' + ter.name + ')');

          m.routePoints.push({
            id: 'wp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            name: defaultName,
            x: clickX,
            y: clickY
          });
          WZ.saveRoute();
          WZ.toast('✓ Добавлена точка #' + (count + 1) + ' (' + ter.icon + ' ' + ter.name + ')', 'success');
          if(typeof render === 'function') render();
          return;
        }

        if(m.mode === 'markers'){
          if(e.target.closest && (e.target.closest('.wz-map-pin') || e.target.closest('.wz-user-marker') || e.target.closest('.wz-char-sheet-card'))) return;
          var title = prompt('Название новой метки тайника:');
          if(!title) return;
          var icon = prompt('Иконка (🪄, 📜, 🗝️, 🍺, ⚡, 💎, 🐍, 🦁):', '🗝️') || '📍';
          var desc = prompt('Заметка к тайнику:') || '';
          m.userMarkers.push({
            id: 'um_' + Date.now(),
            title: title,
            icon: icon,
            desc: desc,
            x: clickX,
            y: clickY
          });
          WZ.saveUserMarkers();
          WZ.toast('✓ Метка поставлена: ' + title, 'success');
          if(typeof render === 'function') render();
          return;
        }
      });
    }

    wireWzNav();
  }

  /* ============================================================
     AI ГЕНЕРАТОРЫ ЗАКЛИНАНИЙ И ПРИЁМОВ (GEMINI API)
     ============================================================ */

  function renderWzSpellCardPreview(s){
    var dmgStr = (s.dmgN ? (s.dmgN + s.dmgD + (s.dmgMod ? ('+' + s.dmgMod) : '')) : (s.dmgMod ? ('+' + s.dmgMod) : ''));
    return '<div class="wz-ref-card" style="border-color:var(--wz-gold);box-shadow:0 0 16px var(--wz-gold-glow);">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
        '<div class="wz-ref-card-k" style="margin-bottom:0;font-size:16px;">' + (s.icon || '✨') + ' ' + esc(s.name) + '</div>' +
        '<span class="wz-stat-badge">' + esc(s.cat || 'Заклинание') + '</span>' +
      '</div>' +
      (s.incantation ? ('<div class="wz-spell-incantation">🗣️ «' + esc(s.incantation) + '»</div>') : '') +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:12px;color:var(--wz-text-muted);margin-bottom:8px;">' +
        (s.cost ? '<span style="background:rgba(212,175,55,0.15);padding:2px 8px;border-radius:3px;color:#fde047;">⚡ ' + esc(s.cost) + '</span>' : '') +
        (s.req ? '<span style="background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:3px;">📜 ' + esc(s.req) + '</span>' : '') +
        (dmgStr ? '<span style="background:rgba(239,68,68,0.15);padding:2px 8px;border-radius:3px;color:#fca5a5;">💥 ' + esc(dmgStr) + '</span>' : '') +
      '</div>' +
      '<div class="wz-ref-card-v" style="font-size:13px;line-height:1.55;">' + esc(s.desc || '').replace(/\n/g, '<br>') + '</div>' +
    '</div>';
  }

  function renderWzDuelCardPreview(d){
    return '<div class="wz-ref-card" style="border-color:var(--wz-gold);box-shadow:0 0 16px var(--wz-gold-glow);">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
        '<div class="wz-ref-card-k" style="margin-bottom:0;font-size:16px;">' + (d.icon || '⚔️') + ' ' + esc(d.name) + '</div>' +
        '<span class="wz-stat-badge">' + esc(d.kind || 'Приём') + '</span>' +
      '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:12px;color:var(--wz-text-muted);margin-bottom:8px;">' +
        (d.action ? '<span style="background:rgba(212,175,55,0.15);padding:2px 8px;border-radius:3px;color:#fde047;">⚡ ' + esc(d.action) + '</span>' : '') +
        (d.trigger ? '<span style="background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:3px;">🎯 ' + esc(d.trigger) + '</span>' : '') +
      '</div>' +
      '<div class="wz-ref-card-v" style="font-size:13px;line-height:1.55;">' + esc(d.desc || '').replace(/\n/g, '<br>') + '</div>' +
    '</div>';
  }

  function renderWzSkillCardPreview(s){
    var lvlSlug = getWzSkillLevelSlug(s.level);
    var line = [(s.abil ? ('🧠 ' + s.abil) : ''), (s.mod ? ('модификатор ' + s.mod) : ''), (s.source ? ('🏛️ ' + s.source) : '')].filter(Boolean).join(' · ');
    return '<div class="wz-ref-card" style="border-color:var(--wz-gold);box-shadow:0 0 16px var(--wz-gold-glow);">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
        '<div class="wz-ref-card-k" style="margin-bottom:0;font-size:16px;">🧠 ' + esc(s.name || 'Безымянный навык') + '</div>' +
        '<span class="wz-skill-badge lvl-' + escA(lvlSlug) + '">' + esc(s.level || 'Начатки') + '</span>' +
      '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;font-size:12px;color:var(--wz-text-muted);margin-bottom:8px;">' +
        '<span style="background:rgba(212,175,55,0.15);padding:2px 8px;border-radius:3px;color:#fde047;">📚 ' + esc(s.kind || 'Дисциплина') + '</span>' +
        (line ? '<span style="background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:3px;">' + esc(line) + '</span>' : '') +
      '</div>' +
      (s.gives ? ('<div class="wz-ref-card-v" style="font-size:13px;line-height:1.55;color:#f1f5f9;margin-bottom:6px;"><b>Что даёт:</b> ' + esc(s.gives).replace(/\n/g, '<br>') + '</div>') : '') +
      (s.desc ? ('<div class="wz-ref-card-v" style="font-size:12.5px;line-height:1.45;color:var(--wz-text-muted);">' + esc(s.desc).replace(/\n/g, '<br>') + '</div>') : '') +
    '</div>';
  }

  function wzRequestGemini(prompt, apiKey, callback){
    var reqFn = window.requestGeminiGenerateContent;
    if(typeof reqFn === 'function'){
      reqFn(prompt, apiKey, callback);
      return;
    }
    if(!apiKey){
      callback(new Error('API ключ Google Gemini не указан'), null);
      return;
    }
    var model = 'gemini-3.8-flash';
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + encodeURIComponent(apiKey);
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, responseMimeType: 'application/json' }
      })
    }).then(function(res){
      if(!res.ok) throw new Error('HTTP ' + res.status);
      return res.json().then(function(data){
        callback(null, data);
      });
    }).catch(function(err){
      callback(err, null);
    });
  }

  function callGeminiWzSpellGenerator(opts, apiKey, callback){
    if(!apiKey){
      callback('API ключ Google Gemini не указан', null);
      return;
    }
    var prompt = 'Ты профессор магии в Школе Чародейства и Волшебства Хогвартс (вселенная Гарри Поттера / Wizarding World). ' +
      'Придумай каноничное, атмосферное заклинание, чары или тёмное проклятие. ' +
      'Тема/Идея: ' + (opts.theme || 'Случайное заклинание Хогвартса') + '. ' +
      'Категория: ' + (opts.cat || 'Боевые заклятия / Защитные чары / Трансфигурация / Бытовые чары / Тёмные искусства') + '. ' +
      'Требования: ' + (opts.req || '1-7 курс Хогвартса') + '. ' +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без форматирования markdown (без ```json), с полями:\n' +
      '{\n' +
      '  "name": "Название на русском и латыни (например: Экспеллиармус (Expelliarmus))",\n' +
      '  "incantation": "Латинская словесная формула (например: Expelliarmus)",\n' +
      '  "icon": "Один подходящий эмодзи (например: ⚡, ✨, 🔥, 🛡️, 🦌, 💥, 🌀, 🗡️)",\n' +
      '  "cat": "Категория (строго одно из: Боевые заклятия, Защитные чары, Высшие чары, Чары левитации, Манящие чары, Бытовые чары, Трансфигурация, Тёмные искусства, Непростительные заклятия)",\n' +
      '  "action": "Основное действие / Бонусное действие / Реакция",\n' +
      '  "cost": "Фокусировка и концентрация (строго одно из: Мгновенно, Концентрация (до 1 мин), Поддержание, Ритуал, Пассивно)",\n' +
      '  "req": "Требования (например: 3 курс Хогвартса, или Староста)",\n' +
      '  "dmgN": "Количество кубов урона (целое число, например 2. Если урона нет, то 0)",\n' +
      '  "dmgD": "Тип куба (строго одно из: d0, d4, d6, d8, d10, d12)",\n' +
      '  "dmgMod": "Бонус к урону (целое число, например 3, или 0)",\n' +
      '  "desc": "Атмосферное описание луча, жеста волшебной палочки, звука и магического эффекта (3-4 предложения)"\n' +
      '}';

    wzRequestGemini(prompt, apiKey, function(err, data){
      if(err || !data){
        callback(err ? (err.message || String(err)) : 'Пустой ответ от AI', null);
        return;
      }
      try {
        var extractFn = window.extractJsonFromAi || function(d){
          var raw = (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts && d.candidates[0].content.parts[0].text) || d;
          return JSON.parse(String(raw).replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim());
        };
        var parsed = extractFn(data);
        callback(null, parsed);
      } catch(e){
        callback('Ошибка разбора ответа ИИ: ' + e.message, null);
      }
    });
  }

  function callGeminiWzDuelGenerator(opts, apiKey, callback){
    if(!apiKey){
      callback('API ключ Google Gemini не указан', null);
      return;
    }
    var prompt = 'Ты мастер Дуэльного клуба Хогвартса (как профессор Флитвик или Северус Снейп). ' +
      'Придумай тактический дуэльный приём или боевую связку волшебной палочки во вселенной Гарри Поттера. ' +
      'Тема/Идея: ' + (opts.theme || 'Случайный дуэльный маневр') + '. ' +
      'Стиль: ' + (opts.kind || 'Защитный рипост / Атакующий финт / Комбо-атака / Боевая аппарация') + '. ' +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), с полями:\n' +
      '{\n' +
      '  "name": "Название приёма (например: Идеальное отражение Протего)",\n' +
      '  "icon": "Один подходящий эмодзи (например: ⚔️, 🛡️, 🪄, 🤫, 🧱, 🌀)",\n' +
      '  "kind": "Категория (строго одно из: Защитный рипост, Атакующий финт, Комбо-атака, Тактическая защита, Перемещение, Тактический обман)",\n' +
      '  "action": "Основное действие / Бонусное действие / Реакция",\n' +
      '  "trigger": "Условие применения (например: После парирования щитом / При вражеской атаке)",\n' +
      '  "desc": "Детальное тактическое описание движения кисти, траектории палочки и боевого преимущества (3-4 предложения)"\n' +
      '}';

    wzRequestGemini(prompt, apiKey, function(err, data){
      if(err || !data){
        callback(err ? (err.message || String(err)) : 'Пустой ответ от AI', null);
        return;
      }
      try {
        var extractFn = window.extractJsonFromAi || function(d){
          var raw = (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts && d.candidates[0].content.parts[0].text) || d;
          return JSON.parse(String(raw).replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim());
        };
        var parsed = extractFn(data);
        callback(null, parsed);
      } catch(e){
        callback('Ошибка разбора ответа ИИ: ' + e.message, null);
      }
    });
  }

  function callGeminiWzSkillGenerator(opts, apiKey, callback){
    if(!apiKey){
      // Автономные пресеты волшебного мира при отсутствии API-ключа
      var presets = [
        {
          name: 'Окклюменция высшего круга',
          kind: 'Высшие магические искусства',
          level: 'Практик',
          abil: 'Интеллект',
          mod: '+3',
          source: 'Тайные рукописи библиотеки рода Блэк',
          gives: 'Персонаж закрывает свой разум непроницаемой ментальной стеной. Попытки Легилименции требуют преодоления КС 16, а ментальные внушения и сыворотка правды распознаются немедленно.',
          desc: 'Требует полного эмоционального контроля и очищения сознания от ярких воспоминаний в стрессовых ситуациях.'
        },
        {
          name: 'Полёты на скоростной метле',
          kind: 'Практическое мастерство',
          level: 'Практик',
          abil: 'Ловкость',
          mod: '+2',
          source: 'Тренировки в школьной сборной по Квиддичу',
          gives: 'Возможность выполнять сложнейшие воздушные маневры (бочка, штопор, финт Вронского) без риска сорваться с метлы даже во время бури или под обстрелом бладжеров.',
          desc: 'Даёт преимущество на проверки равновесия в воздухе и уклонение от летящих снарядов на метле.'
        },
        {
          name: 'Знание древнегерманских и кельтских рун',
          kind: 'Академические дисциплины',
          level: 'Ученик',
          abil: 'Интеллект',
          mod: '+2',
          source: 'Углубленный курс Древних Рун профессора Бабблинг',
          gives: 'Чтение и перевод защитных глифов на старинных гробницах, сундуках и порталах. Способность распознать тип активирующей ловушки до прикосновения.',
          desc: 'Для сложных составных рунических цепочек требуется сверка со словарем или несколько минут сосредоточенного анализа.'
        },
        {
          name: 'Травология и ядовитые флорокультуры',
          kind: 'Практическое мастерство',
          level: 'Практик',
          abil: 'Мудрость',
          mod: '+2',
          source: 'Практика в теплицах профессора Стебль',
          gives: 'Безопасный сбор кричащей мандрагоры, бубонтюбера, ядовитой тентакулы и дьявольских силков. Персонаж безошибочно определяет свойства соков растений на ощупь и запах.',
          desc: 'Позволяет избегать урона кислотой и ядами от растительных существ при наличии драконьих перчаток.'
        },
        {
          name: 'Палочковая экспертиза',
          kind: 'Артефакторика и ремесло',
          level: 'Ученик',
          abil: 'Мудрость',
          mod: '+1',
          source: 'Наблюдения за работой мастера Олливандера в Косом переулке',
          gives: 'Взяв чужую палочку в руки, персонаж за несколько секунд определяет породу дерева, сердцевину, характер и степень её сопротивления новому владельцу.',
          desc: 'Позволяет точнее подбирать трофейные палочки в дуэлях и понимать чужие боевые предрасположенности.'
        },
        {
          name: 'Этикет и родословные чистокровных',
          kind: 'Быт и знание мира',
          level: 'Практик',
          abil: 'Харизма',
          mod: '+2',
          source: 'Воспитание в аристократическом волшебном семействе',
          gives: 'Безукоризненная манера держаться на официальных раутах Министерства Магии, знание родовых связей «Священных двадцати восьми» и скрытых альянсов.',
          desc: 'Облегчает дипломатические переговоры с консервативными волшебниками и сотрудниками Визенгамота.'
        },
        {
          name: 'Невербальная концентрация',
          kind: 'Высшие магические искусства',
          level: 'Ученик',
          abil: 'Интеллект',
          mod: '+1',
          source: 'Самостоятельная практика на 6 курсе',
          gives: 'Позволяет применять базовые заклинания (Люмос, Алохомора, Протего, Экспеллиармус) совершенно беззвучно, застав противника врасплох.',
          desc: 'Противник получает помеху на реакцию парирования, если не следит за кончиком палочки.'
        },
        {
          name: 'Уход за редкими тварями',
          kind: 'Практическое мастерство',
          level: 'Практик',
          abil: 'Мудрость',
          mod: '+2',
          source: 'Уроки Хагрида на опушке Запретного Леса',
          gives: 'Умение завоевать доверие фестралов, гиппогрифов, книзлов и нюхлеров. Знание их любимой пищи, слабых зон и привычек.',
          desc: 'Предотвращает внезапную агрессию диких магических существ при первом контакте.'
        }
      ];

      var filteredPresets = presets.filter(function(p){
        if(opts.kind && p.kind !== opts.kind) return false;
        if(opts.level && p.level !== opts.level) return false;
        return true;
      });
      var pool = filteredPresets.length ? filteredPresets : presets;
      var match = pool[Math.floor(Math.random() * pool.length)];
      var res = JSON.parse(JSON.stringify(match));
      if(opts.theme && opts.theme.trim()){
        res.name = opts.theme.trim();
      }
      setTimeout(function(){ callback(null, res); }, 300);
      return;
    }

    var prompt = 'Ты профессор и наставник в Школе Чародейства и Волшебства Хогвартс (вселенная Гарри Поттера / Wizarding World). ' +
      'Придумай каноничный, глубокий небоевой навык, магическую дисциплину, ремесло или знание волшебника. ' +
      'Тема/Идея: ' + (opts.theme || 'Случайный магический навык') + '. ' +
      'Категория: ' + (opts.kind || 'Академические дисциплины / Практическое мастерство / Высшие магические искусства / Артефакторика и ремесло / Быт и знание мира') + '. ' +
      'Ступень мастерства: ' + (opts.level || 'Ученик / Практик / Мастер') + '. ' +
      'Характеристика: ' + (opts.abil || 'Интеллект / Мудрость / Харизма / Ловкость') + '. ' +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), с полями:\n' +
      '{\n' +
      '  "name": "Название навыка (например: Окклюменция, Травология ядовитых растений, Древние руны, Зачарование часовых механизмов)",\n' +
      '  "kind": "Категория (строго одно из: Академические дисциплины, Практическое мастерство, Высшие магические искусства, Артефакторика и ремесло, Быт и знание мира)",\n' +
      '  "level": "Ступень мастерства (строго одно из: Начатки, Ученик, Практик, Мастер)",\n' +
      '  "abil": "Связанная характеристика (строго одно из: Интеллект, Мудрость, Харизма, Ловкость, Сила, Телосложение)",\n' +
      '  "mod": "Модификатор броска если нужен (например: +2, +3 или пусто если без броска)",\n' +
      '  "source": "Где и как получен навык (например: Индивидуальные уроки у Снейпа, Библиотека Блэков, Годы службы в Отделе Тайн)",\n' +
      '  "gives": "Сюжетно и практически: что конкретно персонаж благодаря навыку умеет делать, чего не умеют другие (2-3 предложения)",\n' +
      '  "desc": "Тонкости, ограничения и правила применения (2-3 предложения)"\n' +
      '}';

    wzRequestGemini(prompt, apiKey, function(err, data){
      if(err || !data){
        callback(err ? (err.message || String(err)) : 'Пустой ответ от AI', null);
        return;
      }
      try {
        var extractFn = window.extractJsonFromAi || function(d){
          var raw = (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts && d.candidates[0].content.parts[0].text) || d;
          return JSON.parse(String(raw).replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim());
        };
        var parsed = extractFn(data);
        callback(null, parsed);
      } catch(e){
        callback('Ошибка разбора ответа ИИ: ' + e.message, null);
      }
    });
  }

  /* Экраны AI Генераторов */
  function wzSpellGen(){
    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Заклинания', nav: 'wzSpells' }, { label: 'AI Генератор' }]) +
      '<button class="back" data-nav="wzSpells" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSpells\');">← К заклинаниям</button>' +
      '<div class="wz-char-sheet-card" style="margin-top:12px;">' +
        '<div class="wz-char-header">' +
          '<span>✨ AI Генератор заклинаний Хогвартса</span>' +
          '<button class="btn btn-ghost" id="wzSgChangeKeyBtn" style="font-size:11px;padding:3px 8px;">🔑 API Ключ</button>' +
        '</div>' +
        '<div id="wzSgFormSection" style="margin-top:14px;">' +
          '<div class="wz-edit-grid">' +
            '<div class="wz-edit-item" style="grid-column:1/-1;">' +
              '<label>Тема или идея заклинания</label>' +
              '<input type="text" id="wzSgTheme" class="wz-input" placeholder="Например: Взрывное заклятие, Создание щита из серебристого льда, Призыв воронов">' +
            '</div>' +
            '<div class="wz-edit-item">' +
              '<label>Категория</label>' +
              '<select id="wzSgCat" class="wz-input">' +
                '<option value="Боевые заклятия">Боевые заклятия</option>' +
                '<option value="Защитные чары">Защитные чары</option>' +
                '<option value="Высшие чары">Высшие чары</option>' +
                '<option value="Чары левитации">Чары левитации</option>' +
                '<option value="Бытовые чары">Бытовые чары</option>' +
                '<option value="Трансфигурация">Трансфигурация</option>' +
                '<option value="Тёмные искусства">Тёмные искусства</option>' +
              '</select>' +
            '</div>' +
            '<div class="wz-edit-item">' +
              '<label>Требуемый курс</label>' +
              '<input type="text" id="wzSgReq" class="wz-input" value="3 курс Хогвартса" placeholder="1-7 курс / Мракоборец">' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;justify-content:flex-end;margin-top:16px;">' +
            '<button class="btn btn-primary" id="btnWzSpellGen" style="padding:8px 20px;">✨ Сгенерировать заклинание через AI</button>' +
          '</div>' +
        '</div>' +
        '<div id="wzSgResult" style="display:none;margin-top:16px;">' +
          '<div id="wzSgPreview"></div>' +
          '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;">' +
            '<button class="btn btn-ghost" id="btnWzSpellBack">← Изменить запрос</button>' +
            '<button class="btn btn-ghost" id="btnWzSpellRegen">🔄 Перегенерировать</button>' +
            '<button class="btn btn-primary" id="btnWzSpellSave">💾 Добавить в книгу заклинаний</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function wzDuelGen(){
    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Дуэльные приёмы', nav: 'wzDuels' }, { label: 'AI Генератор' }]) +
      '<button class="back" data-nav="wzDuels" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzDuels\');">← К приёмам</button>' +
      '<div class="wz-char-sheet-card" style="margin-top:12px;">' +
        '<div class="wz-char-header">' +
          '<span>⚔️ AI Генератор дуэльных приёмов</span>' +
          '<button class="btn btn-ghost" id="wzDgChangeKeyBtn" style="font-size:11px;padding:3px 8px;">🔑 API Ключ</button>' +
        '</div>' +
        '<div id="wzDgFormSection" style="margin-top:14px;">' +
          '<div class="wz-edit-grid">' +
            '<div class="wz-edit-item" style="grid-column:1/-1;">' +
              '<label>Тема или задумка дуэльного приёма</label>' +
              '<input type="text" id="wzDgTheme" class="wz-input" placeholder="Например: Обманное приседание с подсекающим Экспеллиармусом, Защита каменной змеей">' +
            '</div>' +
            '<div class="wz-edit-item">' +
              '<label>Стиль приёма</label>' +
              '<select id="wzDgKind" class="wz-input">' +
                '<option value="Защитный рипост">Защитный рипост</option>' +
                '<option value="Атакующий финт">Атакующий финт</option>' +
                '<option value="Комбо-атака">Комбо-атака</option>' +
                '<option value="Тактическая защита">Тактическая защита</option>' +
                '<option value="Перемещение">Перемещение</option>' +
                '<option value="Тактический обман">Тактический обман</option>' +
              '</select>' +
            '</div>' +
            '<div class="wz-edit-item">' +
              '<label>Действие</label>' +
              '<input type="text" id="wzDgAction" class="wz-input" value="Основное действие" placeholder="Основное / Бонусное / Реакция">' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;justify-content:flex-end;margin-top:16px;">' +
            '<button class="btn btn-primary" id="btnWzDuelGen" style="padding:8px 20px;">⚔️ Сгенерировать дуэльный приём</button>' +
          '</div>' +
        '</div>' +
        '<div id="wzDgResult" style="display:none;margin-top:16px;">' +
          '<div id="wzDgPreview"></div>' +
          '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;">' +
            '<button class="btn btn-ghost" id="btnWzDuelBack">← Изменить запрос</button>' +
            '<button class="btn btn-ghost" id="btnWzDuelRegen">🔄 Перегенерировать</button>' +
            '<button class="btn btn-primary" id="btnWzDuelSave">💾 Добавить в список приёмов</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function wzSkillGen(){
    var kindOpts = '<option value="">Любая (на усмотрение AI)</option>' +
      WZ_SKILL_KINDS.map(function(k){
        return '<option value="' + escA(k) + '">' + esc(k) + '</option>';
      }).join('');

    var levelOpts = '<option value="">Авто (по контексту)</option>' +
      WZ_SKILL_LEVELS.map(function(lvl){
        return '<option value="' + escA(lvl) + '">' + esc(lvl) + '</option>';
      }).join('');

    var abilOpts = '<option value="">Авто (по контексту)</option>' +
      WZ_SKILL_ABILS.map(function(ab){
        return '<option value="' + escA(ab) + '">' + esc(ab) + '</option>';
      }).join('');

    return crumbWz([{ label: 'Волшебник', nav: 'wzHome' }, { label: 'Навыки', nav: 'wzSkills' }, { label: 'AI Генератор' }]) +
      '<button class="back" data-nav="wzSkills" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzSkills\');">← К навыкам</button>' +
      '<div class="wz-char-sheet-card" style="margin-top:12px;">' +
        '<div class="wz-char-header">' +
          '<span>✨ AI Генератор навыков и дисциплин Хогвартса</span>' +
          '<button class="btn btn-ghost" id="wzSkgChangeKeyBtn" style="font-size:11px;padding:3px 8px;">🔑 API Ключ</button>' +
        '</div>' +
        '<div id="wzSkgFormSection" style="margin-top:14px;">' +
          '<div class="wz-edit-grid">' +
            '<div class="wz-edit-item" style="grid-column:1/-1;">' +
              '<label>Тема или идея магического навыка</label>' +
              '<input type="text" id="wzSkgTheme" class="wz-input" placeholder="Например: Окклюменция, Зачарование артефактов, Парселтанг, Полёты на метле">' +
            '</div>' +
            '<div class="wz-edit-item">' +
              '<label>Категория дисциплины</label>' +
              '<select id="wzSkgKind" class="wz-input">' + kindOpts + '</select>' +
            '</div>' +
            '<div class="wz-edit-item">' +
              '<label>Ступень мастерства</label>' +
              '<select id="wzSkgLevel" class="wz-input">' + levelOpts + '</select>' +
            '</div>' +
            '<div class="wz-edit-item" style="grid-column:1/-1;">' +
              '<label>Характеристика</label>' +
              '<select id="wzSkgAbil" class="wz-input">' + abilOpts + '</select>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;justify-content:flex-end;margin-top:16px;">' +
            '<button class="btn btn-primary" id="btnWzSkillGen" style="padding:8px 20px;">🧠 Сгенерировать магический навык</button>' +
          '</div>' +
        '</div>' +
        '<div id="wzSkgResult" style="display:none;margin-top:16px;">' +
          '<div id="wzSkgPreview"></div>' +
          '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;">' +
            '<button class="btn btn-ghost" id="btnWzSkillBack">← Изменить запрос</button>' +
            '<button class="btn btn-ghost" id="btnWzSkillRegen">🔄 Перегенерировать</button>' +
            '<button class="btn btn-primary" id="btnWzSkillSave">💾 Добавить в список навыков</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* Привязки событий заклинаний, навыков и приёмов */
  function wireWzSpells(){
    var search = document.getElementById('wzSpellSearch');
    if(search){
      search.addEventListener('input', function(){
        WZ.spellSearch = search.value;
        if(typeof render === 'function') render();
      });
    }

    document.querySelectorAll('[data-wz-spell-filter]').forEach(function(btn){
      btn.addEventListener('click', function(){
        WZ.spellFilter = btn.getAttribute('data-wz-spell-filter');
        if(typeof render === 'function') render();
      });
    });

    wireWzNav();
  }

  function wireWzSpellView(){
    var delBtn = document.getElementById('wzSpellDeleteBtn');
    if(delBtn){
      delBtn.addEventListener('click', function(){
        var id = delBtn.getAttribute('data-spell-id');
        if(!confirm('Удалить это заклинание из книги?')) return;
        WZ.spells = (WZ.spells || []).filter(function(s){ return s.id !== id; });
        WZ.saveSpells();
        WZ.toast('✓ Заклинание удалено', 'info');
        if(typeof window.navigate === 'function') window.navigate('wzSpells');
      });
    }
    wireWzNav();
  }

  function wireWzSpellEdit(){
    var saveBtn = document.getElementById('wzEdSpellSaveBtn');
    if(saveBtn){
      saveBtn.addEventListener('click', function(){
        var id = saveBtn.getAttribute('data-spell-id');
        var name = (document.getElementById('wzEdSpellName').value || '').trim();
        if(!name){
          alert('Введите название заклинания');
          return;
        }

        var s = WZ.getSpellById(id) || { id: id };
        s.name = name;
        s.incantation = (document.getElementById('wzEdSpellIncant').value || '').trim();
        s.icon = (document.getElementById('wzEdSpellIcon').value || '✨').trim();
        s.cat = document.getElementById('wzEdSpellCat').value;
        s.action = (document.getElementById('wzEdSpellAction').value || 'Основное действие').trim();
        s.cost = (document.getElementById('wzEdSpellCost').value || '').trim();
        s.req = (document.getElementById('wzEdSpellReq').value || '').trim();
        s.dmgN = parseInt(document.getElementById('wzEdSpellDmgN').value, 10) || 0;
        s.dmgD = document.getElementById('wzEdSpellDmgD').value;
        s.dmgMod = parseInt(document.getElementById('wzEdSpellDmgMod').value, 10) || 0;
        s.desc = (document.getElementById('wzEdSpellDesc').value || '').trim();

        var idx = (WZ.spells || []).findIndex(function(x){ return x.id === id; });
        if(idx !== -1){
          WZ.spells[idx] = s;
        } else {
          WZ.spells.push(s);
        }
        WZ.saveSpells();
        WZ.toast('✓ Заклинание сохранено в книгу!', 'success');
        if(typeof window.navigate === 'function') window.navigate('wzSpellView:' + id);
      });
    }
    wireWzNav();
  }

  function wireWzDuels(){
    var search = document.getElementById('wzDuelSearch');
    if(search){
      search.addEventListener('input', function(){
        WZ.duelSearch = search.value;
        if(typeof render === 'function') render();
      });
    }

    document.querySelectorAll('[data-wz-duel-filter]').forEach(function(btn){
      btn.addEventListener('click', function(){
        WZ.duelFilter = btn.getAttribute('data-wz-duel-filter');
        if(typeof render === 'function') render();
      });
    });

    wireWzNav();
  }

  function wireWzDuelView(){
    var delBtn = document.getElementById('wzDuelDeleteBtn');
    if(delBtn){
      delBtn.addEventListener('click', function(){
        var id = delBtn.getAttribute('data-duel-id');
        if(!confirm('Удалить этот дуэльный приём?')) return;
        WZ.duels = (WZ.duels || []).filter(function(d){ return d.id !== id; });
        WZ.saveDuels();
        WZ.toast('✓ Приём удален', 'info');
        if(typeof window.navigate === 'function') window.navigate('wzDuels');
      });
    }
    wireWzNav();
  }

  function wireWzDuelEdit(){
    var saveBtn = document.getElementById('wzEdDuelSaveBtn');
    if(saveBtn){
      saveBtn.addEventListener('click', function(){
        var id = saveBtn.getAttribute('data-duel-id');
        var name = (document.getElementById('wzEdDuelName').value || '').trim();
        if(!name){
          alert('Введите название приёма');
          return;
        }

        var d = WZ.getDuelById(id) || { id: id };
        d.name = name;
        d.icon = (document.getElementById('wzEdDuelIcon').value || '⚔️').trim();
        d.kind = document.getElementById('wzEdDuelKind').value;
        d.action = (document.getElementById('wzEdDuelAction').value || 'Основное действие').trim();
        d.trigger = (document.getElementById('wzEdDuelTrigger').value || '').trim();
        d.desc = (document.getElementById('wzEdDuelDesc').value || '').trim();

        var idx = (WZ.duels || []).findIndex(function(x){ return x.id === id; });
        if(idx !== -1){
          WZ.duels[idx] = d;
        } else {
          WZ.duels.push(d);
        }
        WZ.saveDuels();
        WZ.toast('✓ Дуэльный приём сохранен!', 'success');
        if(typeof window.navigate === 'function') window.navigate('wzDuelView:' + id);
      });
    }
    wireWzNav();
  }

  function wireWzSpellGen(){
    var keyBtn = document.getElementById('wzSgChangeKeyBtn');
    if(keyBtn){
      keyBtn.addEventListener('click', function(){
        var curKey = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
        var input = prompt('Введите Google Gemini API ключ:', curKey || '');
        if(input !== null && typeof window.saveGeminiApiKey === 'function'){
          window.saveGeminiApiKey(input.trim());
          if(typeof render === 'function') render();
        }
      });
    }

    var btnGen = document.getElementById('btnWzSpellGen');
    if(btnGen){
      btnGen.addEventListener('click', function(){
        var k = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
        if(!k){
          var input = prompt('Введите Google Gemini API ключ для генерации заклинания:');
          if(input && input.trim()){
            k = input.trim();
            if(typeof window.saveGeminiApiKey === 'function') window.saveGeminiApiKey(k);
          } else {
            return;
          }
        }

        var theme = (document.getElementById('wzSgTheme').value || '').trim();
        var cat = document.getElementById('wzSgCat').value;
        var req = (document.getElementById('wzSgReq').value || '').trim();

        btnGen.disabled = true;
        btnGen.textContent = '✨ Наложение чар (генерация)...';

        callGeminiWzSpellGenerator({ theme: theme, cat: cat, req: req }, k, function(err, result){
          btnGen.disabled = false;
          btnGen.textContent = '✨ Сгенерировать заклинание через AI';

          if(err || !result){
            alert('Ошибка генерации: ' + (err || 'Пустой ответ от ИИ'));
            return;
          }

          window._lastGenWzSpell = result;

          var form = document.getElementById('wzSgFormSection');
          var resDiv = document.getElementById('wzSgResult');
          var preview = document.getElementById('wzSgPreview');

          if(form) form.style.display = 'none';
          if(resDiv) resDiv.style.display = 'block';
          if(preview) preview.innerHTML = renderWzSpellCardPreview(result);
          if(resDiv) resDiv.scrollIntoView({ behavior: 'smooth' });
        });
      });
    }

    var btnBack = document.getElementById('btnWzSpellBack');
    if(btnBack){
      btnBack.addEventListener('click', function(){
        var form = document.getElementById('wzSgFormSection');
        var resDiv = document.getElementById('wzSgResult');
        if(resDiv) resDiv.style.display = 'none';
        if(form) form.style.display = 'block';
      });
    }

    var btnRegen = document.getElementById('btnWzSpellRegen');
    if(btnRegen){
      btnRegen.addEventListener('click', function(){
        var btnG = document.getElementById('btnWzSpellGen');
        var form = document.getElementById('wzSgFormSection');
        var resDiv = document.getElementById('wzSgResult');
        if(resDiv) resDiv.style.display = 'none';
        if(form) form.style.display = 'block';
        if(btnG) btnG.click();
      });
    }

    var btnSave = document.getElementById('btnWzSpellSave');
    if(btnSave){
      btnSave.addEventListener('click', function(){
        var s = window._lastGenWzSpell;
        if(!s) return;
        var item = {
          id: 'wz_sp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: s.name || 'Сгенерированное заклинание',
          incantation: s.incantation || '',
          icon: s.icon || '✨',
          cat: s.cat || 'Боевые заклятия',
          action: s.action || 'Основное действие',
          cost: s.cost || 'Мгновенно',
          req: s.req || '',
          dmgN: parseInt(s.dmgN, 10) || 0,
          dmgD: s.dmgD || 'd6',
          dmgMod: parseInt(s.dmgMod, 10) || 0,
          desc: s.desc || ''
        };

        if(!WZ.spells) WZ.spells = [];
        WZ.spells.unshift(item);
        WZ.saveSpells();
        WZ.toast('✓ Заклинание добавлено в книгу!', 'success');
        if(typeof window.navigate === 'function') window.navigate('wzSpellView:' + item.id);
      });
    }

    wireWzNav();
  }

  function wireWzDuelGen(){
    var keyBtn = document.getElementById('wzDgChangeKeyBtn');
    if(keyBtn){
      keyBtn.addEventListener('click', function(){
        var curKey = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
        var input = prompt('Введите Google Gemini API ключ:', curKey || '');
        if(input !== null && typeof window.saveGeminiApiKey === 'function'){
          window.saveGeminiApiKey(input.trim());
          if(typeof render === 'function') render();
        }
      });
    }

    var btnGen = document.getElementById('btnWzDuelGen');
    if(btnGen){
      btnGen.addEventListener('click', function(){
        var k = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
        if(!k){
          var input = prompt('Введите Google Gemini API ключ:');
          if(input && input.trim()){
            k = input.trim();
            if(typeof window.saveGeminiApiKey === 'function') window.saveGeminiApiKey(k);
          } else {
            return;
          }
        }

        var theme = (document.getElementById('wzDgTheme').value || '').trim();
        var kind = document.getElementById('wzDgKind').value;
        var action = document.getElementById('wzDgAction').value;

        btnGen.disabled = true;
        btnGen.textContent = '⚔️ Создание дуэльной тактики...';

        callGeminiWzDuelGenerator({ theme: theme, kind: kind, action: action }, k, function(err, result){
          btnGen.disabled = false;
          btnGen.textContent = '⚔️ Сгенерировать дуэльный приём';

          if(err || !result){
            alert('Ошибка генерации: ' + (err || 'Пустой ответ от ИИ'));
            return;
          }

          window._lastGenWzDuel = result;

          var form = document.getElementById('wzDgFormSection');
          var resDiv = document.getElementById('wzDgResult');
          var preview = document.getElementById('wzDgPreview');

          if(form) form.style.display = 'none';
          if(resDiv) resDiv.style.display = 'block';
          if(preview) preview.innerHTML = renderWzDuelCardPreview(result);
          if(resDiv) resDiv.scrollIntoView({ behavior: 'smooth' });
        });
      });
    }

    var btnBack = document.getElementById('btnWzDuelBack');
    if(btnBack){
      btnBack.addEventListener('click', function(){
        var form = document.getElementById('wzDgFormSection');
        var resDiv = document.getElementById('wzDgResult');
        if(resDiv) resDiv.style.display = 'none';
        if(form) form.style.display = 'block';
      });
    }

    var btnRegen = document.getElementById('btnWzDuelRegen');
    if(btnRegen){
      btnRegen.addEventListener('click', function(){
        var btnG = document.getElementById('btnWzDuelGen');
        var form = document.getElementById('wzDgFormSection');
        var resDiv = document.getElementById('wzDgResult');
        if(resDiv) resDiv.style.display = 'none';
        if(form) form.style.display = 'block';
        if(btnG) btnG.click();
      });
    }

    var btnSave = document.getElementById('btnWzDuelSave');
    if(btnSave){
      btnSave.addEventListener('click', function(){
        var d = window._lastGenWzDuel;
        if(!d) return;
        var item = {
          id: 'wz_duel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: d.name || 'Дуэльный приём',
          icon: d.icon || '⚔️',
          kind: d.kind || 'Атакующий финт',
          action: d.action || 'Основное действие',
          trigger: d.trigger || '',
          desc: d.desc || ''
        };

        if(!WZ.duels) WZ.duels = [];
        WZ.duels.unshift(item);
        WZ.saveDuels();
        WZ.toast('✓ Приём сохранен в список!', 'success');
        if(typeof window.navigate === 'function') window.navigate('wzDuelView:' + item.id);
      });
    }

    wireWzNav();
  }

  function wireWzRef(){
    var inp = document.getElementById('wzRefSearch');
    var resBox = document.getElementById('wzRefSearchResults');
    var defGrid = document.getElementById('wzRefDefaultContainer');
    if(inp && resBox && defGrid){
      inp.addEventListener('input', function(){
        var q = (inp.value || '').trim().toLowerCase();
        if(q.length < 2){
          resBox.style.display = 'none';
          resBox.innerHTML = '';
          defGrid.style.display = 'block';
          return;
        }
        var keys = Object.keys(WZ_REF);
        var matches = [];
        for(var i = 0; i < keys.length; i++){
          var k = keys[i];
          var it = WZ_REF[k];
          var name = (it.name || '').toLowerCase();
          var tag = (it.tag || '').toLowerCase();
          var lead = (it.lead || '').toLowerCase();
          var desc = (it.desc || '').toLowerCase();
          if(name.indexOf(q) !== -1 || tag.indexOf(q) !== -1 || lead.indexOf(q) !== -1 || desc.indexOf(q) !== -1){
            matches.push({ k: k, it: it });
          }
        }
        defGrid.style.display = 'none';
        resBox.style.display = 'block';
        if(matches.length === 0){
          resBox.innerHTML = '<div class="wz-char-sheet-card" style="text-align:center;padding:24px;color:var(--wz-text-muted);">Ничего не найдено по запросу «' + esc(inp.value) + '».</div>';
          return;
        }
        var html = '<div class="wz-char-sheet-card" style="margin-bottom:20px;">' +
          '<div class="wz-char-header"><span>🔍 Результаты поиска (' + matches.length + ')</span></div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:10px;margin-top:12px;">' +
          matches.map(function(m){
            return '<div class="wz-ref-card" data-nav="wzRefView:' + m.k + '" onclick="if(typeof window.navigate===\'function\') window.navigate(\'wzRefView:' + m.k + '\');" style="cursor:pointer;">' +
              '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;">' +
                '<div class="wz-ref-card-k">' + (m.it.icon || '📜') + ' ' + esc(m.it.name) + '</div>' +
                '<span class="wz-stat-badge" style="font-size:11px;">' + esc(m.it.tag) + '</span>' +
              '</div>' +
              '<div class="wz-ref-card-v" style="font-size:12.5px;color:var(--wz-text-muted);">' + esc(m.it.lead) + '</div>' +
            '</div>';
          }).join('') +
          '</div></div>';
        resBox.innerHTML = html;
        wireWzNav();
      });
    }
    wireWzNav();
  }

  function wireWzRefView(){
    wireWzNav();
  }

  function wireWzSkills(){
    var search = document.getElementById('wzSkillSearch');
    if(search){
      search.addEventListener('input', function(){
        WZ.skillSearch = search.value;
        if(typeof render === 'function') render();
      });
    }

    document.querySelectorAll('[data-wz-skill-filter]').forEach(function(btn){
      btn.addEventListener('click', function(){
        WZ.skillFilter = btn.getAttribute('data-wz-skill-filter');
        if(typeof render === 'function') render();
      });
    });

    wireWzNav();
  }

  function wireWzSkillView(){
    var delBtn = document.getElementById('wzSkillDeleteBtn');
    if(delBtn){
      delBtn.addEventListener('click', function(){
        var id = delBtn.getAttribute('data-skill-id');
        if(!confirm('Удалить этот магический навык?')) return;
        WZ.skills = (WZ.skills || []).filter(function(s){ return s.id !== id; });
        WZ.saveSkills();
        WZ.toast('✓ Навык удален', 'info');
        if(typeof window.navigate === 'function') window.navigate('wzSkills');
      });
    }
    wireWzNav();
  }

  function wireWzSkillEdit(){
    var delBtn = document.getElementById('wzEdSkillDelBtn');
    if(delBtn){
      delBtn.addEventListener('click', function(){
        var id = delBtn.getAttribute('data-skill-id');
        if(!confirm('Удалить этот магический навык?')) return;
        WZ.skills = (WZ.skills || []).filter(function(s){ return s.id !== id; });
        WZ.saveSkills();
        WZ.toast('✓ Навык удален', 'info');
        if(typeof window.navigate === 'function') window.navigate('wzSkills');
      });
    }

    var saveBtn = document.getElementById('wzEdSkillSaveBtn');
    if(saveBtn){
      saveBtn.addEventListener('click', function(){
        var id = saveBtn.getAttribute('data-skill-id');
        var name = (document.getElementById('wzEdSkillName').value || '').trim();
        if(!name){
          alert('Введите название дисциплины / навыка');
          return;
        }

        var s = WZ.getSkillById(id) || { id: id };
        s.name = name;
        s.kind = document.getElementById('wzEdSkillKind').value;
        s.level = document.getElementById('wzEdSkillLevel').value;
        s.abil = document.getElementById('wzEdSkillAbil').value;
        s.mod = (document.getElementById('wzEdSkillMod').value || '').trim();
        s.source = (document.getElementById('wzEdSkillSource').value || '').trim();
        s.gives = (document.getElementById('wzEdSkillGives').value || '').trim();
        s.desc = (document.getElementById('wzEdSkillDesc').value || '').trim();

        var idx = (WZ.skills || []).findIndex(function(x){ return x.id === id; });
        if(idx !== -1){
          WZ.skills[idx] = s;
        } else {
          WZ.skills.push(s);
        }
        WZ.saveSkills();
        WZ.toast('✓ Навык успешно сохранен!', 'success');
        if(typeof window.navigate === 'function') window.navigate('wzSkillView:' + id);
      });
    }
    wireWzNav();
  }

  function wireWzSkillGen(){
    var keyBtn = document.getElementById('wzSkgChangeKeyBtn');
    if(keyBtn){
      keyBtn.addEventListener('click', function(){
        var curKey = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
        var input = prompt('Введите Google Gemini API ключ (или оставьте пустым для каноничных пресетов Хогвартса):', curKey || '');
        if(input !== null && typeof window.saveGeminiApiKey === 'function'){
          window.saveGeminiApiKey(input.trim());
          if(typeof render === 'function') render();
        }
      });
    }

    var btnGen = document.getElementById('btnWzSkillGen');
    if(btnGen){
      btnGen.addEventListener('click', function(){
        var k = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
        var theme = (document.getElementById('wzSkgTheme').value || '').trim();
        var kind = document.getElementById('wzSkgKind').value;
        var level = document.getElementById('wzSkgLevel').value;
        var abil = document.getElementById('wzSkgAbil').value;

        btnGen.disabled = true;
        btnGen.textContent = '🧠 Постижение дисциплины (генерация)...';

        callGeminiWzSkillGenerator({ theme: theme, kind: kind, level: level, abil: abil }, k, function(err, result){
          btnGen.disabled = false;
          btnGen.textContent = '🧠 Сгенерировать магический навык';

          if(err || !result){
            alert('Ошибка генерации: ' + (err || 'Пустой ответ'));
            return;
          }

          window._lastGenWzSkill = result;

          var form = document.getElementById('wzSkgFormSection');
          var resDiv = document.getElementById('wzSkgResult');
          var preview = document.getElementById('wzSkgPreview');

          if(form) form.style.display = 'none';
          if(resDiv) resDiv.style.display = 'block';
          if(preview) preview.innerHTML = renderWzSkillCardPreview(result);
          if(resDiv) resDiv.scrollIntoView({ behavior: 'smooth' });
        });
      });
    }

    var btnBack = document.getElementById('btnWzSkillBack');
    if(btnBack){
      btnBack.addEventListener('click', function(){
        var form = document.getElementById('wzSkgFormSection');
        var resDiv = document.getElementById('wzSkgResult');
        if(resDiv) resDiv.style.display = 'none';
        if(form) form.style.display = 'block';
      });
    }

    var btnRegen = document.getElementById('btnWzSkillRegen');
    if(btnRegen){
      btnRegen.addEventListener('click', function(){
        var form = document.getElementById('wzSkgFormSection');
        var resDiv = document.getElementById('wzSkgResult');
        if(resDiv) resDiv.style.display = 'none';
        if(form) form.style.display = 'block';
        var btnG = document.getElementById('btnWzSkillGen');
        if(btnG) btnG.click();
      });
    }

    var btnSave = document.getElementById('btnWzSkillSave');
    if(btnSave){
      btnSave.addEventListener('click', function(){
        var s = window._lastGenWzSkill;
        if(!s) return;
        var item = {
          id: 'wz_sk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          name: s.name || 'Магический навык',
          kind: s.kind || 'Академические дисциплины',
          level: s.level || 'Ученик',
          abil: s.abil || 'Интеллект',
          mod: s.mod || '',
          source: s.source || '',
          gives: s.gives || '',
          desc: s.desc || ''
        };

        if(!WZ.skills) WZ.skills = [];
        WZ.skills.unshift(item);
        WZ.saveSkills();
        WZ.toast('✓ Навык добавлен в список!', 'success');
        if(typeof window.navigate === 'function') window.navigate('wzSkillView:' + item.id);
      });
    }

    wireWzNav();
  }

  /* Экспорт в глобальный scope */
  window.wzHome = wzHome;
  window.wzData = wzData;
  window.wzWand = wzWand;
  window.wzRef = wzRef;
  window.wzRefView = wzRefView;
  window.wzSpells = wzSpells;
  window.wzSpellView = wzSpellView;
  window.wzSpellEdit = wzSpellEdit;
  window.wzSpellGen = wzSpellGen;
  window.wzDuels = wzDuels;
  window.wzDuelView = wzDuelView;
  window.wzDuelEdit = wzDuelEdit;
  window.wzDuelGen = wzDuelGen;
  window.wzSkills = wzSkills;
  window.wzSkillView = wzSkillView;
  window.wzSkillEdit = wzSkillEdit;
  window.wzSkillGen = wzSkillGen;
  window.wzMap = wzMap;

  window.wireWzHome = wireWzHome;
  window.wireWzData = wireWzData;
  window.wireWzWand = wireWzWand;
  window.wireWzRef = wireWzRef;
  window.wireWzRefView = wireWzRefView;
  window.wireWzSpells = wireWzSpells;
  window.wireWzSpellView = wireWzSpellView;
  window.wireWzSpellEdit = wireWzSpellEdit;
  window.wireWzSpellGen = wireWzSpellGen;
  window.wireWzDuels = wireWzDuels;
  window.wireWzDuelView = wireWzDuelView;
  window.wireWzDuelEdit = wireWzDuelEdit;
  window.wireWzDuelGen = wireWzDuelGen;
  window.wireWzSkills = wireWzSkills;
  window.wireWzSkillView = wireWzSkillView;
  window.wireWzSkillEdit = wireWzSkillEdit;
  window.wireWzSkillGen = wireWzSkillGen;
  window.wireWzMap = wireWzMap;
  window.wireWzNav = wireWzNav;
  window.applyWizardTheme = WZ.applyTheme;
  window.wzTriggerModeSwitchEffect = WZ.triggerModeSwitchEffect;
  window.wzTriggerCardFlourish = WZ.triggerCardFlourish;

  WZ.wzHome = wzHome;
  WZ.wzData = wzData;
  WZ.wzWand = wzWand;
  WZ.wzRef = wzRef;
  WZ.wzRefView = wzRefView;
  WZ.wzSpells = wzSpells;
  WZ.wzSpellView = wzSpellView;
  WZ.wzSpellEdit = wzSpellEdit;
  WZ.wzSpellGen = wzSpellGen;
  WZ.wzDuels = wzDuels;
  WZ.wzDuelView = wzDuelView;
  WZ.wzDuelEdit = wzDuelEdit;
  WZ.wzDuelGen = wzDuelGen;
  WZ.wzSkills = wzSkills;
  WZ.wzSkillView = wzSkillView;
  WZ.wzSkillEdit = wzSkillEdit;
  WZ.wzSkillGen = wzSkillGen;
  WZ.wzMap = wzMap;
  WZ.wzMapContent = wzMapContent;
  WZ.wireWzHome = wireWzHome;
  WZ.wireWzData = wireWzData;
  WZ.wireWzWand = wireWzWand;
  WZ.wireWzRef = wireWzRef;
  WZ.wireWzRefView = wireWzRefView;
  WZ.wireWzSpells = wireWzSpells;
  WZ.wireWzSpellView = wireWzSpellView;
  WZ.wireWzSpellEdit = wireWzSpellEdit;
  WZ.wireWzSpellGen = wireWzSpellGen;
  WZ.wireWzDuels = wireWzDuels;
  WZ.wireWzDuelView = wireWzDuelView;
  WZ.wireWzDuelEdit = wireWzDuelEdit;
  WZ.wireWzDuelGen = wireWzDuelGen;
  WZ.wireWzSkills = wireWzSkills;
  WZ.wireWzSkillView = wireWzSkillView;
  WZ.wireWzSkillEdit = wireWzSkillEdit;
  WZ.wireWzSkillGen = wireWzSkillGen;
  WZ.wireWzMap = wireWzMap;
  WZ.wireWzMapContent = wireWzMapContent;
  WZ.wireWzNav = wireWzNav;

})();
