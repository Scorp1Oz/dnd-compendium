/* ============================================================
   РЕЖИМ «НОВЫЙ МИР» (homebrew) — дополнительный модуль.
   Ничего из существующего кода не меняет: перехватывает
   render()/navigate() и добавляет свои экраны.
   Хранилище отдельное: ttc_hb_*  (данные Фаэруна не трогаются)
   ============================================================ */
(function(){

/* ---------- утилиты ---------- */
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escA(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }
function uid(p){ return (p||'hb')+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function nl2br(s){ return esc(s).replace(/\n/g,'<br>'); }

/* ---------- состояние ---------- */
var HB = {
  mode: 'faerun',
  records: [],
  world: {name:'', note:''},
  activeChar: null,
  draft: null
};
window.HB = HB;

function load(){
  try{ HB.mode = localStorage.getItem('ttc_mode') || 'faerun'; }catch(e){}
  try{ var r = JSON.parse(localStorage.getItem('ttc_hb_records')||'[]'); HB.records = Array.isArray(r)?r:[]; }catch(e){ HB.records=[]; }
  try{ var w = JSON.parse(localStorage.getItem('ttc_hb_world')||'null'); if(w) HB.world = w; }catch(e){}
  try{ HB.activeChar = localStorage.getItem('ttc_hb_active') || null; }catch(e){}
}
function saveRecords(){ try{ localStorage.setItem('ttc_hb_records', JSON.stringify(HB.records)); }catch(e){} }
function saveWorld(){ try{ localStorage.setItem('ttc_hb_world', JSON.stringify(HB.world)); }catch(e){} }
function saveMode(){ try{ localStorage.setItem('ttc_mode', HB.mode); }catch(e){} }
function saveActive(){ try{ HB.activeChar? localStorage.setItem('ttc_hb_active', HB.activeChar) : localStorage.removeItem('ttc_hb_active'); }catch(e){} }

/* ---------- типы записных книжек ----------
   Ничего не предзаписано: все списки пустые, наполняются игроком.
   fields — специализированные поля типа; плюс всегда доступны
   произвольные поля (custom) и мягкие связи (links).            */
var T = {
  char: { label:'Персонажи', icon:'🧍', desc:'Твои персонажи: характеристики, дар, мутации, связи',
    fields:[
      {k:'age',   l:'Возраст',            t:'text'},
      {k:'race',  l:'Раса',               t:'text'},
      {k:'mut',   l:'Мутационные черты',  t:'area', hint:'Что именно и что это даёт / чем мешает'},
      {k:'magic', l:'Дар / магия',        t:'area', hint:'Врождённый, выученный или его нет'},
      {k:'job',   l:'Занятие / статус',   t:'text'},
      {k:'level', l:'Уровень',            t:'num'},
      {k:'hp',    l:'HP (тек./макс.)',    t:'text'},
      {k:'money', l:'Деньги',             t:'text'},
      {k:'rep',   l:'Репутация (4 слоя)', t:'area', hint:'Профессиональная / институциональная / общественная / криминальная'},
      {k:'oblig', l:'Обязательства и сроки', t:'area'},
      {k:'bio',   l:'Биография',          t:'area'}
    ],
    abilities:true, owner:true },
  npc:   { label:'NPC', icon:'👤', desc:'Люди мира: кто это, где, чего хочет',
    fields:[
      {k:'role', l:'Кто это / роль', t:'text'},
      {k:'race', l:'Раса и внешность', t:'text'},
      {k:'goal', l:'Своя цель', t:'area'},
      {k:'limit',l:'Личная граница / принцип', t:'area'},
      {k:'voice',l:'Манера речи, приметы', t:'area'}
    ],
    links:['city','faction'] },
  city:  { label:'Города и локации', icon:'🏙', desc:'Страны, города, районы, конкретные места',
    fields:[
      {k:'kind',  l:'Тип места', t:'text', hint:'Мегаполис, провинция, вольный город, район…'},
      {k:'power', l:'Власть и законы', t:'area'},
      {k:'demo',  l:'Кто здесь живёт', t:'area'},
      {k:'stakes',l:'Ставки и опасности', t:'area'}
    ],
    links:['city'] },
  faction:{ label:'Фракции и структуры', icon:'⚔', desc:'Компании, банды, ведомства, гильдии',
    fields:[
      {k:'kind', l:'Тип', t:'text'},
      {k:'goal', l:'Чего добивается', t:'area'},
      {k:'power',l:'Влияние и ресурсы', t:'area'}
    ],
    links:['city'] },
  race:  { label:'Расы и мутации', icon:'🧬', desc:'Расы мира и мутационные линии',
    fields:[
      {k:'look', l:'Внешность и признаки', t:'area'},
      {k:'trait',l:'Особенности / что даёт', t:'area'},
      {k:'life', l:'Долголетие', t:'text'},
      {k:'soc',  l:'Положение в обществе', t:'area'}
    ] },
  magic: { label:'Магия', icon:'✨', desc:'Школы, дары, заклинания, ограничения',
    fields:[
      {k:'kind', l:'Тип / школа', t:'text'},
      {k:'cost', l:'Цена и истощение', t:'area'},
      {k:'legal',l:'Легальность и допуск', t:'area'},
      {k:'cast', l:'Как выглядит применение', t:'area', hint:'Жесты и слова / шёпот / мыслью'},
      {k:'eff',  l:'Эффект и механика', t:'area'}
    ] },
  god:   { label:'Боги и религии', icon:'🕯', desc:'Пантеон мира, культы, храмы',
    fields:[
      {k:'domain', l:'Сфера', t:'text'},
      {k:'align',  l:'Светлый / тёмный / иное', t:'text'},
      {k:'legal',  l:'Отношение закона и общества', t:'area'},
      {k:'cult',   l:'Культ, храмы, служители', t:'area'}
    ],
    links:['city'] },
  beast: { label:'Бестиарий', icon:'🐾', desc:'Твари, прорывы плетения, опасная фауна',
    fields:[
      {k:'stat', l:'HP / КД / скорость', t:'text'},
      {k:'atk',  l:'Атаки и урон', t:'area'},
      {k:'bleed',l:'Действует ли кровотечение', t:'text'},
      {k:'behav',l:'Поведение и тактика', t:'area'},
      {k:'where',l:'Где встречается', t:'text'}
    ],
    links:['city'] },
  gear:  { label:'Оружие и снаряжение', icon:'🔫', desc:'Оружие, броня, боеприпасы',
    fields:[
      {k:'kind',  l:'Категория', t:'text'},
      {k:'dmg',   l:'Урон', t:'text'},
      {k:'bleed', l:'Кровотечение', t:'text'},
      {k:'ammo',  l:'Боеприпас / перезарядка', t:'text'},
      {k:'legal', l:'Легальность', t:'text'},
      {k:'price', l:'Цена', t:'text'},
      {k:'note',  l:'Особенности', t:'area'}
    ] },
  item:  { label:'Предметы', icon:'🎒', desc:'Вещи, документы, техника, расходники',
    fields:[
      {k:'kind', l:'Тип', t:'text'},
      {k:'price',l:'Цена', t:'text'},
      {k:'note', l:'Свойства', t:'area'}
    ] },
  lore:  { label:'События и лор', icon:'📜', desc:'История мира, произошедшее в игре, хроника',
    fields:[
      {k:'date', l:'Дата', t:'text'},
      {k:'who',  l:'Кто знает', t:'area'},
      {k:'cons', l:'Последствия', t:'area'}
    ],
    links:['city','faction','npc'] },
  lang:  { label:'Языки', icon:'🗣', desc:'Общий и местные языки',
    fields:[
      {k:'where', l:'Где используется', t:'text'},
      {k:'note',  l:'Особенности', t:'area'}
    ] },
  note:  { label:'Заметки', icon:'📝', desc:'Всё остальное: идеи, правила, что угодно', fields:[] }
};
var ORDER = ['char','npc','city','faction','race','magic','god','beast','gear','item','lore','lang','note'];

/* ---------- доступ к записям ---------- */
function byType(t){ return HB.records.filter(function(r){ return r.type===t; }); }
function byId(id){ for(var i=0;i<HB.records.length;i++) if(HB.records[i].id===id) return HB.records[i]; return null; }
function chars(){ return byType('char'); }
function relsOf(cid){ return HB.records.filter(function(r){ return r.type==='rel' && r.ownerId===cid; }); }

/* ---------- мягкие связи ----------
   Всегда храним и id, и имя строкой. Если запись удалена —
   имя остаётся текстом, ошибки не возникает.                  */
function linkLabel(l){
  if(!l) return '';
  var rec = l.id ? byId(l.id) : null;
  if(rec) return '<span class="hb-link" data-go="hbView:'+rec.id+'">'+esc(rec.name||'Без названия')+'</span>';
  return '<span class="hb-link dead">'+esc(l.name||'—')+' <em>(запись удалена)</em></span>';
}
function linkPicker(name, types, cur){
  var opts = ['<option value="">— не выбрано —</option>'];
  (types||[]).forEach(function(t){
    var list = byType(t);
    if(!list.length) return;
    opts.push('<optgroup label="'+escA(T[t].label)+'">');
    list.forEach(function(r){
      var sel = (cur && cur.id===r.id) ? ' selected' : '';
      opts.push('<option value="'+escA(r.id)+'"'+sel+'>'+esc(r.name||'Без названия')+'</option>');
    });
    opts.push('</optgroup>');
  });
  var deadNote = (cur && cur.id && !byId(cur.id))
    ? '<div class="hb-dead-note">Прежняя связь: '+esc(cur.name||'—')+' (запись удалена, значение сохранено как текст)</div>' : '';
  return '<select data-hblink="'+escA(name)+'">'+opts.join('')+'</select>'+deadNote;
}

/* ---------- переключатель режима со скользящим индикатором ---------- */
function updateHbSegIndicator(immediate){
  var bar = document.getElementById('hbModeBar');
  if(!bar) return;
  var seg = bar.querySelector('.hb-seg');
  if(!seg) return;
  var curMode = (typeof HB !== 'undefined' && HB.mode) ? HB.mode : 'faerun';
  var activeBtn = seg.querySelector('.hb-seg-btn[data-hbmode="' + curMode + '"]') || seg.querySelector('.hb-seg-btn.on');
  if(!activeBtn) return;

  var ind = seg.querySelector('.hb-seg-indicator');
  if(!ind){
    ind = document.createElement('div');
    ind.className = 'hb-seg-indicator';
    ind.id = 'hbSegIndicator';
    seg.insertBefore(ind, seg.firstChild);
  }
  if(!seg.classList.contains('has-indicator')){
    seg.classList.add('has-indicator');
  }

  var left = activeBtn.offsetLeft;
  var top = activeBtn.offsetTop;
  var width = activeBtn.offsetWidth;
  var height = activeBtn.offsetHeight;

  if(width === 0 || height === 0){
    if(!window._hbSegRaf){
      window._hbSegRaf = requestAnimationFrame(function(){
        window._hbSegRaf = null;
        updateHbSegIndicator(immediate);
      });
    }
    return;
  }

  if(immediate){
    ind.style.transition = 'none';
  } else {
    ind.style.transition = '';
  }

  ind.setAttribute('data-mode', curMode);
  ind.style.transform = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
  ind.style.width = width + 'px';
  ind.style.height = height + 'px';
  ind.style.opacity = '1';

  if(immediate){
    void ind.offsetHeight;
    ind.style.transition = '';
  }
}
window.updateHbSegIndicator = updateHbSegIndicator;

if(typeof window !== 'undefined'){
  window.addEventListener('resize', function(){ updateHbSegIndicator(true); });
  window.addEventListener('orientationchange', function(){
    setTimeout(function(){ updateHbSegIndicator(true); }, 120);
  });
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){ updateHbSegIndicator(true); });
  }
}

function bindBarButtons(bar){
  bar.querySelectorAll('[data-hbmode]').forEach(function(b){
    if(b.__hbBound) return;
    b.__hbBound = true;
    b.addEventListener('click', function(e){
      var m = b.getAttribute('data-hbmode');
      if(HB.mode === m) return;
      HB.mode = m;
      saveMode();
      try{ localStorage.setItem('ttc_mode', m); }catch(e){}

      var seg = bar.querySelector('.hb-seg');
      if(seg){
        seg.querySelectorAll('.hb-seg-btn').forEach(function(btn){
          btn.classList.toggle('on', btn.getAttribute('data-hbmode') === m);
        });
      }
      updateHbSegIndicator(false);

      if(m === 'sh'){
        if(typeof window.navigate === 'function') window.navigate('shHome');
        else { view = {screen:'shHome'}; if(typeof SH !== 'undefined') SH.draft=null; render(); }
      } else if(m === 'me'){
        if(typeof window.navigate === 'function') window.navigate('meHome');
        else { view = {screen:'meHome'}; render(); }
      } else if(m === 'el'){
        if(typeof window.navigate === 'function') window.navigate('elHome');
        else { view = {screen:'elHome'}; render(); }
      } else if(m === 'wi'){
        if(typeof window.navigate === 'function') window.navigate('wiHome');
        else { view = {screen:'wiHome'}; render(); }
      } else if(m === 'wz'){
        if(typeof window.navigate === 'function') window.navigate('wzHome');
        else { view = {screen:'wzHome'}; render(); }
      } else if(m === 'hb'){
        if(typeof window.navigate === 'function') window.navigate('hbHome');
        else { view = {screen:'hbHome'}; render(); }
      } else {
        if(typeof window.navigate === 'function') window.navigate('home');
        else { view = {screen:'home'}; render(); }
      }
      paintBar();
      if(typeof paintShBar === 'function') paintShBar();
      window.scrollTo(0,0);
    });
  });
}

function mountBar(){
  if(document.getElementById('hbModeBar')) return;
  var bar = document.createElement('div');
  bar.id = 'hbModeBar';
  document.body.appendChild(bar);
  paintBar();
  setTimeout(function(){
    updateHbSegIndicator(true);
  }, 10);
}
window.paintBar = paintBar;

function paintBar(){
  var bar = document.getElementById('hbModeBar');
  if(!bar) return;
  var curMode = HB.mode || 'faerun';
  document.body.classList.toggle('hb-theme', curMode === 'hb');
  document.body.classList.toggle('sh-theme', curMode === 'sh');
  document.body.classList.toggle('me-theme', curMode === 'me');
  document.body.classList.toggle('el-theme', curMode === 'el');
  document.body.classList.toggle('wi-theme', curMode === 'wi');
  document.body.classList.toggle('wz-theme', curMode === 'wz');

  var worldLabel = '';
  if(curMode === 'hb'){
    var hbChar = HB.activeChar ? byId(HB.activeChar) : null;
    var hbCharName = hbChar && hbChar.name ? (' • ' + hbChar.name + (hbChar.f && hbChar.f.job ? (' (' + hbChar.f.job + ')') : '')) : '';
    worldLabel = esc((HB.world && HB.world.name ? HB.world.name : 'Технологии') + hbCharName);
  } else if(curMode === 'faerun'){
    var faeChar = (typeof getActiveFaerunCharacter === 'function') ? getActiveFaerunCharacter() : null;
    var faeCharName = faeChar && faeChar.name ? (' • ' + faeChar.name + (faeChar.className ? (' (' + faeChar.className + ' ' + (faeChar.level||1) + ' ур.)') : '')) : '';
    worldLabel = esc('Фаэрун' + faeCharName);
  } else if(curMode === 'sh'){
    var charInfo = (typeof SH !== 'undefined' && SH.meta && SH.meta.charName) ? (' • ' + SH.meta.charName) : '';
    worldLabel = (typeof SH !== 'undefined' && SH.meta && SH.meta.name ? esc(SH.meta.name) : 'Шиноби') + charInfo;
  } else if(curMode === 'me'){
    var meC = (typeof ME !== 'undefined' && ME.getChar) ? ME.getChar() : null;
    var meName = meC ? (' • ' + (meC.callsign ? ('[' + meC.callsign + '] ') : '') + meC.name) : '';
    var meShieldHp = meC ? (' • 🛡️ ' + (meC.currentShield!=null?meC.currentShield:meC.baseShield) + ' | ❤️ ' + (meC.currentHp!=null?meC.currentHp:meC.maxHp)) : '';
    worldLabel = 'Космос' + meName + meShieldHp;
  } else if(curMode === 'el'){
    worldLabel = 'Стихия';
  } else if(curMode === 'wi'){
    var wiP = (typeof WI !== 'undefined' && WI.getProfile) ? WI.getProfile() : null;
    var wiName = wiP ? (' • ' + wiP.name + ' (' + (wiP.school || 'Школа Волка') + ')') : '';
    worldLabel = 'Ведьмак' + wiName;
  } else if(curMode === 'wz'){
    var wzP = (typeof WZ !== 'undefined' && WZ.getProfile) ? WZ.getProfile() : null;
    var wzYear = wzP ? (wzP.year || wzP.course || wzP.profession || '') : '';
    var wzHouseOrYear = wzP ? [wzP.house, wzYear].filter(Boolean).join(' • ') : '';
    var wzName = (wzP && wzP.name) ? (' • ' + wzP.name + (wzHouseOrYear ? (' (' + wzHouseOrYear + ')') : '')) : '';
    worldLabel = 'Волшебник' + wzName;
  }

  var seg = bar.querySelector('.hb-seg');
  if(!seg){
    bar.innerHTML =
      '<div class="hb-bar-inner">'+
        '<div class="hb-seg has-indicator">'+
          '<div class="hb-seg-indicator" id="hbSegIndicator"></div>'+
          '<button class="hb-seg-btn ' + (curMode==='faerun'?'on':'') + '" data-hbmode="faerun">Фаэрун</button>'+
          '<button class="hb-seg-btn ' + (curMode==='hb'?'on':'') + '" data-hbmode="hb">Технологии</button>'+
          '<button class="hb-seg-btn ' + (curMode==='sh'?'on':'') + '" data-hbmode="sh">Шиноби</button>'+
          '<button class="hb-seg-btn ' + (curMode==='me'?'on':'') + '" data-hbmode="me">Космос</button>'+
          '<button class="hb-seg-btn ' + (curMode==='el'?'on':'') + '" data-hbmode="el">Стихия</button>'+
          '<button class="hb-seg-btn ' + (curMode==='wi'?'on':'') + '" data-hbmode="wi">Ведьмак</button>'+
          '<button class="hb-seg-btn ' + (curMode==='wz'?'on':'') + '" data-hbmode="wz">Волшебник</button>'+
        '</div>'+
        (worldLabel ? '<div class="hb-bar-world">' + worldLabel + '</div>' : '')+
      '</div>';
  } else {
    seg.classList.add('has-indicator');
    if(!seg.querySelector('.hb-seg-indicator')){
      var ind = document.createElement('div');
      ind.className = 'hb-seg-indicator';
      ind.id = 'hbSegIndicator';
      seg.insertBefore(ind, seg.firstChild);
    }
    seg.querySelectorAll('.hb-seg-btn').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-hbmode') === curMode);
    });

    var lab = bar.querySelector('.hb-bar-world');
    if(worldLabel){
      if(!lab){
        lab = document.createElement('div');
        lab.className = 'hb-bar-world';
        var inner = bar.querySelector('.hb-bar-inner');
        if(inner) inner.appendChild(lab);
      }
      lab.innerHTML = worldLabel;
    } else if(lab && lab.parentNode){
      lab.parentNode.removeChild(lab);
    }
  }

  bindBarButtons(bar);

  if(typeof updateShinobiTheme === 'function') updateShinobiTheme();
  if(typeof applyMeTheme === 'function') applyMeTheme();
  if(typeof applyWitcherTheme === 'function') applyWitcherTheme();
  if(typeof applyWizardTheme === 'function') applyWizardTheme();

  updateHbSegIndicator(false);
}

/* ---------- экраны ---------- */
function crumb(parts){
  return '<div class="crumb">'+parts.map(function(p,i){
    var last = i===parts.length-1;
    return (i>0?'<span class="sep">/</span>':'')+
      '<span class="seg '+(last?'current':'')+'" data-nav="'+(p.nav||'')+'">'+esc(p.label)+'</span>';
  }).join('')+'</div>';
}

function hbHome(){
  var ac = HB.activeChar ? byId(HB.activeChar) : null;
  if(HB.activeChar && !ac){ HB.activeChar=null; saveActive(); }
  var cs = chars();

  var charName = ac && ac.name ? esc(ac.name) : 'Оператор / Новый исследователь';
  var charSub = ac ? ([ac.f && ac.f.race, ac.f && ac.f.job ? (ac.f.job + (ac.f.level ? (' ' + ac.f.level + ' ур.') : '')) : null, ac.f && ac.f.age ? (ac.f.age + ' лет') : null].filter(Boolean).join(' • ') || 'Персонаж Технологий') : 'Техно-вселенная • Кибернетика & Псионика';
  var hpCur = (ac && ac.f && ac.f.hp) ? esc(ac.f.hp) : '20/20';
  var creds = (ac && ac.f && ac.f.money) ? esc(ac.f.money) : '1 000 кр.';
  var lvlVal = (ac && ac.f && ac.f.level) ? ac.f.level : 1;
  var jobTitle = (ac && ac.f && ac.f.job) ? esc(ac.f.job) : 'Технологии';

  var hudHtml = '<div class="hb-hud">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">' +
      '<div>' +
        '<div class="hb-title">🤖 ' + charName + '</div>' +
        '<div style="font-family:\'Space Grotesk\',\'Segoe UI\',sans-serif;color:#a5f3fc;font-size:13.5px;margin-top:2px;">' +
          charSub +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
        '<span class="hb-stat-badge role">⚡ ' + jobTitle + '</span>' +
        '<span class="hb-stat-badge">Ур. ' + lvlVal + '</span>' +
        '<span class="hb-stat-badge hp">❤️ ' + hpCur + ' HP</span>' +
        '<span class="hb-stat-badge cred">💳 ' + creds + '</span>' +
        (ac ? '<button class="hb-hud-edit-btn" data-go="hbView:' + ac.id + '" title="Открыть досье персонажа">👤 Профиль</button>' : '<button class="hb-hud-edit-btn" data-go="hbList:char" title="Открыть список персонажей">⚙️ Ростер</button>') +
      '</div>' +
    '</div>' +
  '</div>';

  var heroDiceHtml = '<div class="hb-hero-dice" data-go="dice" role="button" tabindex="0" title="Открыть виртуальные кости">' +
    '<div class="hb-hero-dice-icon">' +
      (typeof dieShapeSvg==='function' ? dieShapeSvg(20,'hbHeroDie',20) : '🎲') +
    '</div>' +
    '<div style="flex:1;min-width:0;">' +
      '<div class="hb-hero-dice-title">Бросок костей & Проверки</div>' +
      '<div class="hb-hero-dice-desc">Виртуальный дайс: d4–d20, d100, монеты W/L, модификаторы, история бросков и копирование результата</div>' +
    '</div>' +
    '<div class="hb-hero-dice-arrow">→</div>' +
  '</div>';

  var categoryCards = ORDER.map(function(t){
    var count = byType(t).length;
    var countBadge = count > 0 ? ('<span class="hb-card-count">' + count + '</span>') : '';
    return '<div class="hb-card hb-card-clickable" data-go="hbList:' + t + '" role="button" tabindex="0">' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="hb-card-title"><span>' + T[t].icon + '</span> ' + esc(T[t].label) + ' ' + countBadge + '</div>' +
        '<div class="hb-card-desc">' + esc(T[t].desc) + '</div>' +
      '</div>' +
      '<div class="hb-card-arrow">→</div>' +
    '</div>';
  }).join('');

  var aiCard = '<div class="hb-card hb-card-clickable" data-go="hbGen" role="button" tabindex="0">' +
    '<div style="flex:1;min-width:0;">' +
      '<div class="hb-card-title"><span>🤖</span> AI Генератор Технологий</div>' +
      '<div class="hb-card-desc">Генерация киберимплантов, высокотехнологичного оружия, псионики и боевых дронов на базе Gemini 3.8 Flash!</div>' +
    '</div>' +
    '<div class="hb-card-arrow">→</div>' +
  '</div>';

  var worldCard = '<div class="hb-card hb-card-clickable" data-go="hbWorld" role="button" tabindex="0">' +
    '<div style="flex:1;min-width:0;">' +
      '<div class="hb-card-title"><span>🌐</span> Мир & Синхронизация данных</div>' +
      '<div class="hb-card-desc">Конфигурация сеттинга "' + esc(HB.world && HB.world.name ? HB.world.name : 'Технологии') + '", экспорт в JSON и импорт резервной копии</div>' +
    '</div>' +
    '<div class="hb-card-arrow">→</div>' +
  '</div>';

  var switcherHtml = '';
  if(cs.length > 1){
    var sel = '<select id="hbActiveSel" style="background:#0f172a;border:1px solid #38bdf8;color:#f8fafc;padding:4px 10px;border-radius:6px;font-size:13px;">' +
      '<option value="">— сменить активного персонажа —</option>' +
      cs.map(function(c){
        return '<option value="' + escA(c.id) + '"' + (HB.activeChar===c.id?' selected':'') + '>' + esc(c.name||'Без имени') + '</option>';
      }).join('') +
    '</select>';
    switcherHtml = '<div style="display:flex;align-items:center;gap:10px;margin-top:10px;padding:8px 14px;background:rgba(15,23,42,0.6);border:1px solid rgba(56,189,248,0.2);border-radius:8px;">' +
      '<span style="font-size:12px;color:#94a3b8;font-family:\'Space Grotesk\',sans-serif;">🔄 Быстрый выбор героя:</span>' +
      sel +
    '</div>';
  }

  return crumb([{label:'Технологии'}]) +
    hudHtml +
    switcherHtml +
    '<div class="hb-rule"></div>' +
    heroDiceHtml +
    '<div class="section-label">СИСТЕМНЫЕ РАЗДЕЛЫ // ТЕХНОЛОГИИ & КИБЕРНЕТИКА</div>' +
    '<div class="menu-list grid-2">' +
      categoryCards +
      aiCard +
      worldCard +
    '</div>';
}

/* ---------- AI Генератор Технологий ---------- */
function callGeminiHbGenerator(opts, apiKey, callback){
  if(!apiKey){
    callback('API ключ Google Gemini не указан', null);
    return;
  }
  var cat = opts.cat || 'implant';
  var theme = opts.theme || 'Кибернетическая разработка';
  var prompt = '';

  if(cat === 'implant'){
    prompt = 'Ты ведущий кибер-инженер и геймдизайнер научно-фантастической/киберпанк НРИ. ' +
      'Придумай высокотехнологичный киберимплант или биоаугментацию. ' +
      'Тема / Название / Идея: ' + theme + '. ' +
      'Слот установки / Локация: ' + (opts.slot || 'Нервная система') + '. ' +
      'Класс качества: ' + (opts.grade || 'Военный') + '. ' +
      (opts.req ? ('Пожелания: ' + opts.req + '. ') : '') +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название импланта на русском",\n' +
      '  "kind": "Слот (Нервная система, Оптика, Череп/Мозг, Торс, Конечности, Дермальная броня)",\n' +
      '  "grade": "Класс (Гражданский, Промышленный, Военный, Черный рынок, Корпоративный прототип)",\n' +
      '  "price": "Примерная цена (например: 12 500 кр.)",\n' +
      '  "note": "Детальное описание: принцип работы, пассивные бонусы к броскам/характеристикам, активная функция, расход энергии и побочные эффекты (3-5 предложений)"\n' +
      '}';
  } else if(cat === 'weapon'){
    prompt = 'Ты главный оружейник корпораций будущего в киберпанк/sci-fi НРИ. ' +
      'Придумай высокотехнологичное стрелковое, энергетическое или мономолекулярное холодное оружие. ' +
      'Тема / Концепт: ' + theme + '. ' +
      'Категория: ' + (opts.weaponKind || 'Штурмовое оружие') + '. ' +
      (opts.req ? ('Пожелания: ' + opts.req + '. ') : '') +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название оружия на русском",\n' +
      '  "kind": "Категория (Пистолет, Штурмовая винтовка, Дробовик, Снайперский рельсотрон, Мономолекулярный клинок, Тяжелое энергооружие)",\n' +
      '  "dmg": "Урон (например: 2к10+3 плазмой, 3к6 кинетический, 2к8 бронебойный)",\n' +
      '  "bleed": "Кровотечение / Доп. эффект (например: Кровотечение 1к4/ход, ЭМИ-шок, Ожог 2-й степени, Нет)",\n' +
      '  "ammo": "Боезапас и тип питания (например: Энергоячейка 30 зарядов, Барабан 12 патронов)",\n' +
      '  "legal": "Легальность (Свободный оборот, Лицензия класса А, Запрещено/Военное)",\n' +
      '  "price": "Цена (например: 8 000 кр.)",\n' +
      '  "note": "Тактические особенности, режимы стрельбы (одиночный/очередь), смарт-наведение, модули модификации (3-4 предложения)"\n' +
      '}';
  } else if(cat === 'protocol'){
    prompt = 'Ты легендарный нетраннер и псионик будущего. ' +
      'Придумай боевой сетевой скрипт, вирус взлома ICE или псионический протокол. ' +
      'Тема / Идея: ' + theme + '. ' +
      'Тип: ' + (opts.protocolKind || 'Боевой взлом ICE') + '. ' +
      (opts.req ? ('Пожелания: ' + opts.req + '. ') : '') +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название протокола или демона",\n' +
      '  "kind": "Тип (ICE-пробойник, Нейрошок, Сенсорный саботаж, Контроль имплантов, Псионика)",\n' +
      '  "cost": "Затраты памяти / Силы (например: 3 RAM / 2 очка псионики)",\n' +
      '  "legal": "Легальность (Боевой кибервирус, Корпоративный софт, Черный лед)",\n' +
      '  "cast": "Время загрузки и дистанция (например: 1 действие, через прямой кабель или оптический контакт до 30 метров)",\n' +
      '  "eff": "Механика воздействия: проверка защиты, урон мозгу/системам цели, ослепление оптики, перегрузка киберконечностей"\n' +
      '}';
  } else {
    prompt = 'Ты ведущий робототехник и специалист по автоматизированным боевым системам. ' +
      'Придумай автономного боевого дрона, кибернетического монстра или охранного андроида. ' +
      'Тема / Идея: ' + theme + '. ' +
      'Роль: ' + (opts.droneRole || 'Штурмовой охранный дрон') + '. ' +
      (opts.req ? ('Пожелания: ' + opts.req + '. ') : '') +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название модели / тип дрона",\n' +
      '  "stat": "HP / Броня / Скорость (например: 35 HP, Броня КД 16, Скорость полёта 60 фт)",\n' +
      '  "atk": "Вооружение и урон (например: Спаренный смарт-пулемёт: +6 к атаке, 2к8+2 урона)",\n' +
      '  "bleed": "Уязвимости и сопротивления (например: Иммунитет к яду/кровотечению, уязвимость к ЭМИ)",\n' +
      '  "behav": "Поведение в бою: алгоритм охраны, патрулирование, приоритеты целей, сенсорные протоколы (3-4 предложения)",\n' +
      '  "where": "Где производится / охраняемые зоны (например: Корпоративные лаборатории, заброшенные мегаполисы)"\n' +
      '}';
  }

  function handleData(data){
    try{
      var raw = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) || data;
      var cleanStr = String(raw).replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      var parsed = JSON.parse(cleanStr);
      callback(null, parsed);
    }catch(e){
      callback('Ошибка разбора JSON: ' + e.message, null);
    }
  }

  if(typeof window.requestGeminiGenerateContent === 'function'){
    window.requestGeminiGenerateContent(prompt, apiKey, function(err, data){
      if(err || !data) return callback(err ? (err.message || String(err)) : 'Пустой ответ от AI', null);
      handleData(data);
    });
  } else {
    fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=' + encodeURIComponent(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })
    .then(function(res){
      if(!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function(json){ handleData(json); })
    .catch(function(err){ callback(err.message, null); });
  }
}

function renderHbGenExtraFields(cat){
  if(cat === 'implant'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Слот установки</label>' +
        '<select class="ai-gen-select" id="hbGenSlot">' +
          '<option value="Нервная система" selected>🧠 Нервная система / Спинной мозг</option>' +
          '<option value="Оптика">👁️ Кибероптика / Датчики</option>' +
          '<option value="Череп / Мозг">💀 Черепная коробка / Нейропроцессор</option>' +
          '<option value="Торс / Органы">🫀 Торс / Биомониторы / Внутренние органы</option>' +
          '<option value="Конечности">🦾 Кибернетические руки / Ноги</option>' +
          '<option value="Дермальная броня">🛡️ Подкожная дермальная броня</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Класс качества</label>' +
        '<select class="ai-gen-select" id="hbGenGrade">' +
          '<option value="Гражданский">Гражданский (Стандартный)</option>' +
          '<option value="Промышленный">Промышленный (Усиленный)</option>' +
          '<option value="Военный" selected>Военный (Спецподразделения)</option>' +
          '<option value="Черный рынок">Черный рынок (Кустарный/Нелегальный)</option>' +
          '<option value="Корпоративный прототип">Корпоративный прототип (Уникальный)</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'weapon'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Категория оружия</label>' +
        '<select class="ai-gen-select" id="hbGenWeaponKind">' +
          '<option value="Пистолет / Смарт-оружие" selected>🔫 Пистолет / Смарт-пистолет</option>' +
          '<option value="Штурмовая винтовка">🎯 Штурмовая винтовка / Автомат</option>' +
          '<option value="Дробовик / Дротик">💥 Дробовик / Тактический разрядник</option>' +
          '<option value="Снайперский рельсотрон">🔭 Рельсотрон / Снайперская винтовка</option>' +
          '<option value="Мономолекулярный клинок">🗡️ Моно-клинок / Термомеч</option>' +
          '<option value="Тяжелое энергооружие">⚡ Плазмомет / Тяжелый пулемет</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Тип урона</label>' +
        '<select class="ai-gen-select" id="hbGenDmgType">' +
          '<option value="Плазменный / Энергетический">⚡ Плазма / Энергия</option>' +
          '<option value="Кинетический / Огнестрельный" selected>💥 Кинетический / Пулевой</option>' +
          '<option value="ЭМИ / Системный шок">🔌 ЭМИ / Деактивация кибернетики</option>' +
          '<option value="Термический / Огненный">🔥 Термический / Лазерный</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'protocol'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Тип протокола</label>' +
        '<select class="ai-gen-select" id="hbGenProtoKind">' +
          '<option value="Боевой взлом ICE" selected>⚡ Боевой взлом ICE</option>' +
          '<option value="Нейрошок и перегрузка">🧠 Нейрошок и перегрузка синапсов</option>' +
          '<option value="Сенсорный саботаж">👁️ Саботаж оптики и сенсоров</option>' +
          '<option value="Контроль чужих имплантов">🦾 Захват управления кибернетикой</option>' +
          '<option value="Псионический импульс">🔮 Псионический кинетический импульс</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Направленность</label>' +
        '<select class="ai-gen-select" id="hbGenProtoFocus">' +
          '<option value="Скрытный взлом / Шпионаж">🕵️ Скрытный взлом / Шпионаж</option>' +
          '<option value="Штурмовой киберудар">💥 Мгновенный штурмовой урон</option>' +
          '<option value="Защита и контр-взлом">🛡️ Защита союзников и контр-скрипты</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else {
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Роль дрона</label>' +
        '<select class="ai-gen-select" id="hbGenDroneRole">' +
          '<option value="Разведывательный квадрокоптер">🔍 Разведывательный квадрокоптер</option>' +
          '<option value="Охранный стационарный дрон" selected>🛡️ Охранный боевой дрон</option>' +
          '<option value="Штурмовой шагоход / Мех">🤖 Штурмовой шагоход / Кибермех</option>' +
          '<option value="Снайперская турель">🎯 Автономная турель-снайпер</option>' +
          '<option value="Кибернетический боевой зверь">🐾 Модифицированный кибер-зверь</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Уровень бронирования</label>' +
        '<select class="ai-gen-select" id="hbGenDroneArmor">' +
          '<option value="Легкий (высокая скорость)">Легкий (высокая маневренность)</option>' +
          '<option value="Средний (сбалансированный)" selected>Средний (стандарт)</option>' +
          '<option value="Тяжелый (титановая броня)">Тяжелый (титановая броня)</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  }
}

function renderHbGenCardPreview(data, cat){
  var headerBadge = '';
  var bodyContent = '';
  var saveButtonText = '';

  if(cat === 'implant'){
    headerBadge = '<span class="hb-stat-badge role">🦾 ' + esc(data.kind || 'Имплант') + ' • ' + esc(data.grade || 'Военный') + '</span>' +
      (data.price ? ('<span class="hb-stat-badge cred" style="margin-left:6px;">💳 ' + esc(data.price) + '</span>') : '');
    bodyContent =
      '<div style="font-size:18px;font-weight:700;color:#f8fafc;margin-bottom:8px;font-family:\'Space Grotesk\',sans-serif;">' + esc(data.name || 'Киберимплант') + '</div>' +
      '<div style="font-size:14px;color:#cbd5e1;line-height:1.6;white-space:pre-line;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;">' +
        esc(data.note || '') +
      '</div>';
    saveButtonText = '💾 Сохранить в «Предметы»';
  } else if(cat === 'weapon'){
    headerBadge = '<span class="hb-stat-badge role">⚡ ' + esc(data.kind || 'Оружие') + '</span>' +
      (data.price ? ('<span class="hb-stat-badge cred" style="margin-left:6px;">💳 ' + esc(data.price) + '</span>') : '');
    bodyContent =
      '<div style="font-size:18px;font-weight:700;color:#f8fafc;margin-bottom:8px;font-family:\'Space Grotesk\',sans-serif;">' + esc(data.name || 'Оружие') + '</div>' +
      '<div style="font-size:13px;color:#94a3b8;margin-bottom:12px;line-height:1.6;">' +
        '💥 <b>Урон:</b> ' + esc(data.dmg || '2к8') + ' &nbsp;|&nbsp; ' +
        '🩸 <b>Кровотечение/Эффект:</b> ' + esc(data.bleed || 'Нет') + '<br>' +
        '🔋 <b>Боезапас:</b> ' + esc(data.ammo || '20 зар.') + ' &nbsp;|&nbsp; ' +
        '📜 <b>Статус:</b> ' + esc(data.legal || 'Разрешено') +
      '</div>' +
      '<div style="font-size:14px;color:#cbd5e1;line-height:1.6;white-space:pre-line;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;">' +
        esc(data.note || '') +
      '</div>';
    saveButtonText = '💾 Сохранить в «Снаряжение»';
  } else if(cat === 'protocol'){
    headerBadge = '<span class="hb-stat-badge role">🧠 ' + esc(data.kind || 'Протокол') + '</span>' +
      (data.cost ? ('<span class="hb-stat-badge" style="margin-left:6px;">⚡ ' + esc(data.cost) + '</span>') : '');
    bodyContent =
      '<div style="font-size:18px;font-weight:700;color:#f8fafc;margin-bottom:8px;font-family:\'Space Grotesk\',sans-serif;">' + esc(data.name || 'Протокол') + '</div>' +
      '<div style="font-size:13px;color:#94a3b8;margin-bottom:12px;line-height:1.6;">' +
        '⏱ <b>Исполнение:</b> ' + esc(data.cast || '1 действие') + ' &nbsp;|&nbsp; ' +
        '📜 <b>Легальность:</b> ' + esc(data.legal || 'Серый софт') +
      '</div>' +
      '<div style="font-size:14px;color:#cbd5e1;line-height:1.6;white-space:pre-line;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;">' +
        esc(data.eff || '') +
      '</div>';
    saveButtonText = '💾 Сохранить в «Магия/Протоколы»';
  } else {
    headerBadge = '<span class="hb-stat-badge role">🤖 ' + esc(data.stat || 'Дрон') + '</span>';
    bodyContent =
      '<div style="font-size:18px;font-weight:700;color:#f8fafc;margin-bottom:8px;font-family:\'Space Grotesk\',sans-serif;">' + esc(data.name || 'Боевой дрон') + '</div>' +
      '<div style="font-size:13px;color:#94a3b8;margin-bottom:12px;line-height:1.6;">' +
        '🎯 <b>Вооружение:</b> ' + esc(data.atk || 'Лазерная турель') + '<br>' +
        '🛡️ <b>Уязвимости/Иммунитеты:</b> ' + esc(data.bleed || 'Иммунитет к яду') + '<br>' +
        '📍 <b>Производство/Локации:</b> ' + esc(data.where || 'Лаборатории') +
      '</div>' +
      '<div style="font-size:14px;color:#cbd5e1;line-height:1.6;white-space:pre-line;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;">' +
        esc(data.behav || '') +
      '</div>';
    saveButtonText = '💾 Сохранить в «Бестиарий»';
  }

  return '<div class="ai-gen-result-card">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">' +
      headerBadge +
      '<button class="btn-ghost" id="btnHbCopyResult" style="font-size:12px;">📋 Копировать текст</button>' +
    '</div>' +
    bodyContent +
    '<div class="rule" style="margin:16px 0;"></div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">' +
      '<button class="btn-primary" id="btnHbSaveResult">' + saveButtonText + '</button>' +
      '<button class="btn-ghost" id="btnHbRegen">🔄 Сгенерировать снова</button>' +
      '<button class="btn-ghost" id="btnHbBackForm">← Назад к параметрам</button>' +
    '</div>' +
  '</div>';
}

function hbGen(){
  var curKey = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
  var hasKey = !!(curKey && curKey.trim());

  return crumb([{label:'Технологии', nav:'home'}, {label:'AI Генератор'}]) +
    '<button class="back" data-go="home">← В меню Технологий</button>' +
    '<h1><span class="h1-icon">🤖</span> AI Генератор Технологий</h1>' +
    '<p class="subtitle">Генерация киберимплантов, оружия будущего, псионики и боевых дронов на базе Gemini 3.8 Flash.</p>' +
    '<div class="hb-rule"></div>' +

    '<div id="hbGenFormSection" class="ai-gen-card">' +
      '<div class="ai-gen-grid">' +
        '<div class="ai-gen-field">' +
          '<label class="ai-gen-label">Категория разработки</label>' +
          '<select class="ai-gen-select" id="hbGenCat">' +
            '<option value="implant" selected>🦾 Киберимплант / Аугментация</option>' +
            '<option value="weapon">⚡ Кибероружие & Снаряжение</option>' +
            '<option value="protocol">🧠 Псионика & Сетевые протоколы</option>' +
            '<option value="drone">🤖 Дроны, Киборги & Боевые единицы</option>' +
          '</select>' +
        '</div>' +
        '<div class="ai-gen-field">' +
          '<label class="ai-gen-label" id="hbGenThemeLabel">Название или концепт импланта</label>' +
          '<input type="text" class="ai-gen-input" id="hbGenTheme" placeholder="Например: Нейрошунт \'Цербер\', Моно-лезвие, ICE-вирус...">' +
        '</div>' +
      '</div>' +

      '<div id="hbGenExtraFields" style="margin-top:12px;">' +
        renderHbGenExtraFields('implant') +
      '</div>' +

      '<div class="ai-gen-field" style="margin-top:12px;">' +
        '<label class="ai-gen-label">Особые требования или контекст применения</label>' +
        '<textarea class="ai-gen-textarea" id="hbGenReq" rows="3" placeholder="Например: Военная аугментация корпорации, ускорение реакции, встроенный тепловизор..."></textarea>' +
      '</div>' +

      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:16px;">' +
        '<button type="button" class="btn-ghost" id="hbGenKeyBtn" style="font-size:12.5px;">🔑 API ключ: ' + (hasKey ? '<span style="color:#4ade80;">✓ Установлен</span>' : '<span style="color:#fbbf24;">⚠️ Не задан</span>') + '</button>' +
        '<button type="button" class="ai-gen-btn" id="btnHbGen">⚡ Сгенерировать через AI</button>' +
      '</div>' +
    '</div>' +

    '<div id="hbGenResult" style="display:none;margin-top:20px;">' +
      '<div id="hbGenPreview"></div>' +
    '</div>';
}

function wireHbGen(){
  var catSel = document.getElementById('hbGenCat');
  var themeLbl = document.getElementById('hbGenThemeLabel');
  var themeInp = document.getElementById('hbGenTheme');
  var extraWrap = document.getElementById('hbGenExtraFields');

  if(catSel && extraWrap){
    catSel.addEventListener('change', function(){
      var cat = catSel.value;
      if(cat === 'implant'){
        if(themeLbl) themeLbl.textContent = 'Название или концепт импланта';
        if(themeInp) themeInp.placeholder = 'Например: Нейрошунт \'Цербер\', Дермальная броня...';
      } else if(cat === 'weapon'){
        if(themeLbl) themeLbl.textContent = 'Название или концепт оружия';
        if(themeInp) themeInp.placeholder = 'Например: Плазменная винтовка Титан, Моно-катана...';
      } else if(cat === 'protocol'){
        if(themeLbl) themeLbl.textContent = 'Название программы или протокола';
        if(themeInp) themeInp.placeholder = 'Например: ICE-пробойник Цербер, Нейрошок...';
      } else {
        if(themeLbl) themeLbl.textContent = 'Название модели или тип дрона';
        if(themeInp) themeInp.placeholder = 'Например: Охранный дрон Цербер, Штурмовой мех...';
      }
      extraWrap.innerHTML = renderHbGenExtraFields(cat);
    });
  }

  var keyBtn = document.getElementById('hbGenKeyBtn');
  if(keyBtn){
    keyBtn.addEventListener('click', function(){
      var curKey = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
      var input = prompt('Введите Google Gemini API ключ (gemini-3.8-flash):', curKey || '');
      if(input !== null && typeof window.saveGeminiApiKey === 'function'){
        window.saveGeminiApiKey(input.trim());
        if(typeof render === 'function') render();
      }
    });
  }

  var btnGen = document.getElementById('btnHbGen');
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

      var cat = catSel ? catSel.value : 'implant';
      var theme = (themeInp ? themeInp.value : '').trim();
      var req = (document.getElementById('hbGenReq') ? document.getElementById('hbGenReq').value : '').trim();

      var opts = { cat: cat, theme: theme, req: req };
      if(cat === 'implant'){
        var slEl = document.getElementById('hbGenSlot');
        var grEl = document.getElementById('hbGenGrade');
        opts.slot = slEl ? slEl.value : 'Нервная система';
        opts.grade = grEl ? grEl.value : 'Военный';
      } else if(cat === 'weapon'){
        var wkEl = document.getElementById('hbGenWeaponKind');
        var dtEl = document.getElementById('hbGenDmgType');
        opts.weaponKind = wkEl ? wkEl.value : 'Штурмовая винтовка';
        opts.dmgType = dtEl ? dtEl.value : 'Кинетический';
      } else if(cat === 'protocol'){
        var pkEl = document.getElementById('hbGenProtoKind');
        opts.protocolKind = pkEl ? pkEl.value : 'Боевой взлом ICE';
      } else {
        var drEl = document.getElementById('hbGenDroneRole');
        opts.droneRole = drEl ? drEl.value : 'Охранный дрон';
      }

      btnGen.disabled = true;
      btnGen.textContent = '⚡ Синтез данных в сети...';

      callGeminiHbGenerator(opts, k, function(err, result){
        btnGen.disabled = false;
        btnGen.textContent = '⚡ Сгенерировать через AI';

        if(err || !result){
          alert('Ошибка генерации: ' + (err || 'Пустой ответ от ИИ'));
          return;
        }

        window._lastHbGenData = { data: result, cat: cat };

        var form = document.getElementById('hbGenFormSection');
        var resDiv = document.getElementById('hbGenResult');
        var preview = document.getElementById('hbGenPreview');

        if(form) form.style.display = 'none';
        if(resDiv) resDiv.style.display = 'block';
        if(preview) preview.innerHTML = renderHbGenCardPreview(result, cat);
        wireHbGenResultActions();
        if(resDiv) resDiv.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }
}

function wireHbGenResultActions(){
  var bundle = window._lastHbGenData;
  if(!bundle) return;
  var data = bundle.data;
  var cat = bundle.cat;

  var btnCopy = document.getElementById('btnHbCopyResult');
  if(btnCopy){
    btnCopy.addEventListener('click', function(){
      var text = '';
      if(cat === 'implant'){
        text = (data.name||'Имплант') + ' (' + data.kind + ' • ' + data.grade + (data.price ? (' • ' + data.price) : '') + ')\n\n' + data.note;
      } else if(cat === 'weapon'){
        text = (data.name||'Оружие') + ' (' + data.kind + (data.price ? (' • ' + data.price) : '') + ')\n' +
          'Урон: ' + data.dmg + ' | Эффект: ' + data.bleed + ' | Боезапас: ' + data.ammo + '\n\n' + data.note;
      } else if(cat === 'protocol'){
        text = (data.name||'Протокол') + ' (' + data.kind + (data.cost ? (' • ' + data.cost) : '') + ')\n' +
          'Исполнение: ' + data.cast + ' | Легальность: ' + data.legal + '\n\n' + data.eff;
      } else {
        text = (data.name||'Дрон') + ' (' + data.stat + ')\n' +
          'Вооружение: ' + data.atk + ' | Уязвимости: ' + data.bleed + '\n\n' + data.behav;
      }
      copyText(text);
      btnCopy.textContent = 'Скопировано ✓';
      setTimeout(function(){ btnCopy.textContent = '📋 Копировать текст'; }, 1200);
    });
  }

  var btnSave = document.getElementById('btnHbSaveResult');
  if(btnSave){
    btnSave.addEventListener('click', function(){
      var rec = null;
      if(cat === 'implant'){
        rec = {
          id: uid('item'),
          type: 'item',
          name: data.name || 'Киберимплант',
          subtitle: data.kind || 'Имплант',
          desc: data.note || '',
          f: { kind: data.kind || '', price: data.price || '', note: data.note || '' },
          custom: [],
          links: {}
        };
      } else if(cat === 'weapon'){
        rec = {
          id: uid('gear'),
          type: 'gear',
          name: data.name || 'Оружие',
          subtitle: (data.kind || '') + (data.dmg ? (' • ' + data.dmg) : ''),
          desc: data.note || '',
          f: { kind: data.kind||'', dmg: data.dmg||'', bleed: data.bleed||'', ammo: data.ammo||'', legal: data.legal||'', price: data.price||'', note: data.note||'' },
          custom: [],
          links: {}
        };
      } else if(cat === 'protocol'){
        rec = {
          id: uid('magic'),
          type: 'magic',
          name: data.name || 'Протокол',
          subtitle: (data.kind || '') + (data.cost ? (' • ' + data.cost) : ''),
          desc: data.eff || '',
          f: { kind: data.kind||'', cost: data.cost||'', legal: data.legal||'', cast: data.cast||'', eff: data.eff||'' },
          custom: [],
          links: {}
        };
      } else {
        rec = {
          id: uid('beast'),
          type: 'beast',
          name: data.name || 'Боевой дрон',
          subtitle: data.stat || 'Автономный дрон',
          desc: data.behav || '',
          f: { stat: data.stat||'', atk: data.atk||'', bleed: data.bleed||'', behav: data.behav||'', where: data.where||'' },
          custom: [],
          links: {}
        };
      }

      if(rec){
        if(!Array.isArray(HB.records)) HB.records = [];
        HB.records.push(rec);
        saveRecords();
        btnSave.disabled = true;
        btnSave.textContent = '✓ Сохранено в базу данных!';
        alert('✓ Запись «' + rec.name + '» успешно добавлена в базу данных режима «Технологии»!');
      }
    });
  }

  var btnRegen = document.getElementById('btnHbRegen');
  if(btnRegen){
    btnRegen.addEventListener('click', function(){
      var btnG = document.getElementById('btnHbGen');
      var form = document.getElementById('hbGenFormSection');
      var resDiv = document.getElementById('hbGenResult');
      if(resDiv) resDiv.style.display = 'none';
      if(form) form.style.display = 'block';
      if(btnG) btnG.click();
    });
  }

  var btnBack = document.getElementById('btnHbBackForm');
  if(btnBack){
    btnBack.addEventListener('click', function(){
      var form = document.getElementById('hbGenFormSection');
      var resDiv = document.getElementById('hbGenResult');
      if(resDiv) resDiv.style.display = 'none';
      if(form) form.style.display = 'block';
    });
  }
}

function hbWorld(){
  return crumb([{label:'Технологии', nav:'home'},{label:'Мир'}])+
    '<button class="back" data-go="home">← Назад</button>'+
    '<h1>Мир</h1><div class="rule"></div>'+
    '<div class="sheet-section">'+
      '<div class="field"><label>Название мира / планеты</label>'+
        '<input type="text" id="hbWorldName" value="'+escA(HB.world.name)+'"></div>'+
      '<div class="field"><label>Общие заметки о мире</label>'+
        '<textarea id="hbWorldNote" rows="10">'+esc(HB.world.note)+'</textarea></div>'+
      '<button class="btn-primary" id="hbWorldSave">💾 Сохранить</button>'+
    '</div>';
}

function hbList(){
  var t = view.hbType, cfg = T[t];
  if(!cfg) return hbHome();
  var list = byType(t).slice().sort(function(a,b){ return (a.name||'').localeCompare(b.name||''); });
  var items = list.map(function(r){
    return '<div class="char-list-item" data-go="hbView:'+r.id+'">'+
      '<div><div class="name">'+esc(r.name||'Без названия')+'</div>'+
      '<div class="desc">'+esc(r.subtitle||'—')+'</div></div><div class="arrow">→</div></div>';
  }).join('');
  return crumb([{label:'Технологии', nav:'home'},{label:cfg.label}])+
    '<button class="back" data-go="home">← Назад</button>'+
    '<h1>'+cfg.icon+' '+esc(cfg.label)+'</h1>'+
    '<p class="subtitle">'+esc(cfg.desc)+'</p><div class="rule"></div>'+
    '<button class="new-char-btn" data-go="hbEdit:'+t+':new">+ Добавить запись</button>'+
    (items || '<div class="char-empty">Пусто. Здесь появится то, что ты создашь.</div>');
}

function fieldHtml(f, val){
  var v = val==null?'':val;
  var hint = f.hint ? '<div class="hb-hint-sm">'+esc(f.hint)+'</div>' : '';
  if(f.t==='area') return '<div class="field"><label>'+esc(f.l)+'</label>'+hint+
    '<textarea data-hbf="'+escA(f.k)+'" rows="3">'+esc(v)+'</textarea></div>';
  if(f.t==='num') return '<div class="field"><label>'+esc(f.l)+'</label>'+hint+
    '<input type="number" data-hbf="'+escA(f.k)+'" value="'+escA(v)+'"></div>';
  return '<div class="field"><label>'+esc(f.l)+'</label>'+hint+
    '<input type="text" data-hbf="'+escA(f.k)+'" value="'+escA(v)+'"></div>';
}

var ABIL = [['str','Сила'],['dex','Ловкость'],['con','Телосложение'],['int','Интеллект'],['wis','Мудрость'],['cha','Харизма']];

function hbEdit(){
  var t = view.hbType, cfg = T[t];
  if(!cfg) return hbHome();
  var isNew = view.hbId==='new';
  var d = HB.draft;
  if(!d || d.__t!==t || d.__id!==view.hbId){
    var src = isNew ? null : byId(view.hbId);
    d = src ? JSON.parse(JSON.stringify(src)) : {id:null, type:t, name:'', subtitle:'', desc:'', f:{}, custom:[], links:{}, abil:{}};
    d.f = d.f||{}; d.custom = d.custom||[]; d.links = d.links||{}; d.abil = d.abil||{};
    d.__t=t; d.__id=view.hbId; HB.draft=d;
  }

  var fields = (cfg.fields||[]).map(function(f){ return fieldHtml(f, d.f[f.k]); }).join('');

  var abilHtml = '';
  if(cfg.abilities){
    abilHtml = '<div class="sheet-section"><div class="section-label">Характеристики</div><div class="hb-abil">'+
      ABIL.map(function(a){
        var v = d.abil[a[0]]==null?10:d.abil[a[0]];
        var m = Math.floor((Number(v)-10)/2);
        return '<div class="hb-abil-box"><label>'+a[1]+'</label>'+
          '<input type="number" data-hbabil="'+a[0]+'" value="'+escA(v)+'">'+
          '<div class="hb-abil-mod">'+(m>=0?'+':'')+m+'</div></div>';
      }).join('')+'</div></div>';
  }

  var linksHtml = '';
  if(cfg.links && cfg.links.length){
    linksHtml = '<div class="sheet-section"><div class="section-label">Связи</div>'+
      cfg.links.map(function(lt){
        return '<div class="field"><label>'+esc(T[lt].label)+'</label>'+linkPicker(lt, [lt], d.links[lt])+'</div>';
      }).join('')+
      '<div class="hb-hint-sm">Связи мягкие: если связанная запись будет удалена, здесь останется её название текстом.</div>'+
      '</div>';
  }

  var customHtml = d.custom.map(function(c,i){
    return '<div class="hb-custom-row" data-ci="'+i+'">'+
      '<input type="text" class="hb-cust-k" placeholder="Название поля" value="'+escA(c.k)+'">'+
      '<textarea class="hb-cust-v" rows="2" placeholder="Значение">'+esc(c.v)+'</textarea>'+
      '<button class="hb-x" data-hbdelcust="'+i+'">✕</button></div>';
  }).join('');

  return crumb([{label:'Технологии', nav:'home'},{label:cfg.label, nav:'hbList:'+t},{label:isNew?'Новая запись':(d.name||'Запись')}])+
    '<button class="back" data-go="'+(isNew?('hbList:'+t):('hbView:'+d.id))+'">← Назад</button>'+
    '<h1>'+(isNew?'Новая запись':esc(d.name||'Запись'))+'</h1>'+
    '<p class="subtitle">Изменения сохраняются только по кнопке.</p><div class="rule"></div>'+
    '<div class="sheet-actions">'+
      '<button class="btn-primary" id="hbSaveBtn">💾 Сохранить</button>'+
      (isNew?'':'<button class="btn-ghost" id="hbDelBtn" style="color:var(--crimson-bright);border-color:var(--crimson-bright);">🗑 Удалить</button>')+
    '</div>'+
    '<div class="sheet-section"><div class="section-label">Основное</div>'+
      '<div class="field"><label>Название / имя</label><input type="text" data-hbmain="name" value="'+escA(d.name)+'"></div>'+
      '<div class="field"><label>Краткая подпись</label><input type="text" data-hbmain="subtitle" value="'+escA(d.subtitle)+'"></div>'+
      '<div class="field"><label>Описание</label><textarea data-hbmain="desc" rows="4">'+esc(d.desc)+'</textarea></div>'+
    '</div>'+
    (fields? '<div class="sheet-section"><div class="section-label">Поля типа</div>'+fields+'</div>' : '')+
    abilHtml+
    linksHtml+
    '<div class="sheet-section"><div class="section-label">Произвольные поля</div>'+
      (customHtml||'<div class="hb-hint-sm">Пока нет. Добавь любое поле, какое нужно именно этому миру.</div>')+
      '<button class="btn-ghost" id="hbAddCustom">+ Добавить поле</button>'+
    '</div>';
}

function hbView(){
  var r = byId(view.hbId);
  if(!r) return hbHome();
  var cfg = T[r.type] || T.note;
  var rows = (cfg.fields||[]).filter(function(f){ return r.f && r.f[f.k]; }).map(function(f){
    return '<div class="hb-row"><div class="hb-row-k">'+esc(f.l)+'</div><div class="hb-row-v">'+nl2br(r.f[f.k])+'</div></div>';
  }).join('');

  var abil='';
  if(cfg.abilities && r.abil){
    abil = '<div class="section-label">Характеристики</div><div class="hb-abil view">'+
      ABIL.map(function(a){
        var v = r.abil[a[0]]==null?10:r.abil[a[0]];
        var m = Math.floor((Number(v)-10)/2);
        return '<div class="hb-abil-box"><label>'+a[1]+'</label><div class="hb-abil-val">'+esc(v)+'</div>'+
          '<div class="hb-abil-mod">'+(m>=0?'+':'')+m+'</div></div>';
      }).join('')+'</div>';
  }

  var links='';
  if(cfg.links && r.links){
    var ls = cfg.links.filter(function(lt){ return r.links[lt]; }).map(function(lt){
      return '<div class="hb-row"><div class="hb-row-k">'+esc(T[lt].label)+'</div><div class="hb-row-v">'+linkLabel(r.links[lt])+'</div></div>';
    }).join('');
    if(ls) links = '<div class="section-label">Связи</div>'+ls;
  }

  var cust = (r.custom||[]).filter(function(c){ return c.k||c.v; }).map(function(c){
    return '<div class="hb-row"><div class="hb-row-k">'+esc(c.k||'—')+'</div><div class="hb-row-v">'+nl2br(c.v)+'</div></div>';
  }).join('');

  var owner = cfg.owner
    ? '<div class="sheet-actions"><button class="btn-ghost" data-go="hbRels:'+r.id+'">🔗 Отношения ('+relsOf(r.id).length+')</button>'+
      '<button class="btn-ghost" id="hbMakeActive">⭐ Сделать активным</button></div>'
    : '';

  return crumb([{label:'Технологии', nav:'home'},{label:cfg.label, nav:'hbList:'+r.type},{label:r.name||'Запись'}])+
    '<button class="back" data-go="hbList:'+r.type+'">← Назад</button>'+
    '<h1>'+esc(r.name||'Без названия')+'</h1>'+
    (r.subtitle?'<p class="subtitle">'+esc(r.subtitle)+'</p>':'')+
    '<div class="rule"></div>'+
    '<div class="sheet-actions"><button class="btn-primary" data-go="hbEdit:'+r.type+':'+r.id+'">✏️ Редактировать</button></div>'+
    owner+
    (r.desc?'<div class="hb-desc">'+nl2br(r.desc)+'</div>':'')+
    (rows?'<div class="section-label">Подробности</div>'+rows:'')+
    abil+links+
    (cust?'<div class="section-label">Произвольные поля</div>'+cust:'');
}

/* ---------- отношения (привязаны к персонажу) ---------- */
var STAGES = ['незнакомец','знакомый','приятель','доверие','близость','вражда'];

function hbRels(){
  var c = byId(view.hbId);
  if(!c) return hbHome();
  var list = relsOf(c.id);
  var rows = list.map(function(r){
    return '<div class="hb-rel">'+
      '<div class="hb-rel-head"><div class="name">'+linkLabel(r.target)+'</div>'+
        '<div class="hb-stage">'+esc(r.stage||'—')+'</div>'+
        '<button class="hb-x" data-hbdelrel="'+r.id+'">✕</button></div>'+
      (r.debt?'<div class="hb-row"><div class="hb-row-k">Счёт</div><div class="hb-row-v">'+nl2br(r.debt)+'</div></div>':'')+
      (r.knows?'<div class="hb-row"><div class="hb-row-k">Знает</div><div class="hb-row-v">'+nl2br(r.knows)+'</div></div>':'')+
      (r.hides?'<div class="hb-row"><div class="hb-row-k">Скрывается</div><div class="hb-row-v">'+nl2br(r.hides)+'</div></div>':'')+
      (r.note?'<div class="hb-row"><div class="hb-row-k">Примечание</div><div class="hb-row-v">'+nl2br(r.note)+'</div></div>':'')+
      '<button class="btn-ghost sm" data-go="hbRelEdit:'+c.id+':'+r.id+'">Изменить</button>'+
    '</div>';
  }).join('');

  return crumb([{label:'Технологии', nav:'home'},{label:'Персонажи', nav:'hbList:char'},{label:c.name||'Персонаж', nav:'hbView:'+c.id},{label:'Отношения'}])+
    '<button class="back" data-go="hbView:'+c.id+'">← Назад</button>'+
    '<h1>Отношения: '+esc(c.name||'Персонаж')+'</h1>'+
    '<p class="subtitle">Связи именно этого персонажа. У другого персонажа — свой список.</p>'+
    '<div class="rule"></div>'+
    '<button class="new-char-btn" data-go="hbRelEdit:'+c.id+':new">+ Добавить связь</button>'+
    (rows||'<div class="char-empty">Связей пока нет.</div>');
}

function hbRelEdit(){
  var c = byId(view.hbOwner);
  if(!c) return hbHome();
  var isNew = view.hbId==='new';
  var r = isNew ? {id:null, type:'rel', ownerId:c.id, target:null, stage:'знакомый', debt:'', knows:'', hides:'', note:''} : byId(view.hbId);
  if(!r) return hbRels();
  HB.draft = JSON.parse(JSON.stringify(r)); HB.draft.__rel = true;
  var d = HB.draft;

  return crumb([{label:'Технологии', nav:'home'},{label:c.name||'Персонаж', nav:'hbView:'+c.id},{label:'Связь'}])+
    '<button class="back" data-go="hbRels:'+c.id+'">← Назад</button>'+
    '<h1>'+(isNew?'Новая связь':'Связь')+'</h1><div class="rule"></div>'+
    '<div class="sheet-actions"><button class="btn-primary" id="hbRelSave">💾 Сохранить</button>'+
      (isNew?'':'<button class="btn-ghost" id="hbRelDel" style="color:var(--crimson-bright);border-color:var(--crimson-bright);">🗑 Удалить</button>')+
    '</div>'+
    '<div class="sheet-section">'+
      '<div class="field"><label>С кем</label>'+linkPicker('target', ['npc','char','faction'], d.target)+
        '<div class="hb-hint-sm">Если нужной записи ещё нет — создай её в соответствующей книжке, либо впиши имя вручную ниже.</div></div>'+
      '<div class="field"><label>Имя вручную (если записи нет)</label><input type="text" id="hbRelManual" value="'+escA(d.target&&!d.target.id?d.target.name:'')+'"></div>'+
      '<div class="field"><label>Стадия</label><select id="hbRelStage">'+
        STAGES.map(function(s){ return '<option'+(d.stage===s?' selected':'')+'>'+esc(s)+'</option>'; }).join('')+
      '</select></div>'+
      '<div class="field"><label>Счёт (кто кому должен)</label><textarea id="hbRelDebt" rows="2">'+esc(d.debt)+'</textarea></div>'+
      '<div class="field"><label>Что этот человек знает</label><textarea id="hbRelKnows" rows="2">'+esc(d.knows)+'</textarea></div>'+
      '<div class="field"><label>Что от него скрывается</label><textarea id="hbRelHides" rows="2">'+esc(d.hides)+'</textarea></div>'+
      '<div class="field"><label>Примечание</label><textarea id="hbRelNote" rows="3">'+esc(d.note)+'</textarea></div>'+
    '</div>';
}

/* ---------- сохранение форм ---------- */
function collectDraft(){
  var d = HB.draft; if(!d) return;
  document.querySelectorAll('[data-hbmain]').forEach(function(el){ d[el.getAttribute('data-hbmain')] = el.value; });
  document.querySelectorAll('[data-hbf]').forEach(function(el){ d.f[el.getAttribute('data-hbf')] = el.value; });
  document.querySelectorAll('[data-hbabil]').forEach(function(el){ d.abil[el.getAttribute('data-hbabil')] = el.value; });
  document.querySelectorAll('[data-hblink]').forEach(function(el){
    var key = el.getAttribute('data-hblink'), id = el.value;
    if(!id){ d.links[key] = null; return; }
    var rec = byId(id);
    d.links[key] = rec ? {id:rec.id, name:rec.name} : null;
  });
  var cust=[];
  document.querySelectorAll('.hb-custom-row').forEach(function(row){
    cust.push({k:row.querySelector('.hb-cust-k').value, v:row.querySelector('.hb-cust-v').value});
  });
  d.custom = cust;
}

function wire(){
  if(HB.mode!=='hb') return;

  var sel = document.getElementById('hbActiveSel');
  if(sel) sel.addEventListener('change', function(){ HB.activeChar = sel.value||null; saveActive(); paintBar(); if(typeof paintShBar==='function') paintShBar(); render(); });

  var wn = document.getElementById('hbWorldSave');
  if(wn) wn.addEventListener('click', function(){
    HB.world.name = document.getElementById('hbWorldName').value;
    HB.world.note = document.getElementById('hbWorldNote').value;
    saveWorld(); paintBar(); navigate('home');
  });

  var addC = document.getElementById('hbAddCustom');
  if(addC) addC.addEventListener('click', function(){ collectDraft(); HB.draft.custom.push({k:'',v:''}); render(); });
  document.querySelectorAll('[data-hbdelcust]').forEach(function(b){
    b.addEventListener('click', function(){
      collectDraft();
      HB.draft.custom.splice(Number(b.getAttribute('data-hbdelcust')),1);
      render();
    });
  });

  var save = document.getElementById('hbSaveBtn');
  if(save) save.addEventListener('click', function(){
    collectDraft();
    var d = HB.draft;
    if(!d.name || !d.name.trim()){ alert('Укажи название или имя.'); return; }
    var clean = {id:d.id||uid(d.type), type:d.type, name:d.name, subtitle:d.subtitle, desc:d.desc,
                 f:d.f, custom:d.custom, links:d.links, abil:d.abil};
    var ex = d.id ? byId(d.id) : null;
    if(ex){ for(var k in clean) ex[k]=clean[k]; }
    else HB.records.push(clean);
    saveRecords(); HB.draft=null; navigate('hbView:'+clean.id);
  });

  var del = document.getElementById('hbDelBtn');
  if(del) del.addEventListener('click', function(){
    var d = HB.draft;
    if(!confirm('Удалить запись? Связи в других записях останутся как текст.')) return;
    HB.records = HB.records.filter(function(r){ return r.id!==d.id; });
    HB.records = HB.records.filter(function(r){ return !(r.type==='rel' && r.ownerId===d.id); });
    if(HB.activeChar===d.id){ HB.activeChar=null; saveActive(); }
    saveRecords(); HB.draft=null; navigate('hbList:'+d.type);
  });

  var mk = document.getElementById('hbMakeActive');
  if(mk) mk.addEventListener('click', function(){
    HB.activeChar = view.hbId;
    saveActive();
    paintBar();
    if(typeof paintShBar==='function') paintShBar();
    alert('Активный персонаж выбран.');
    render();
  });

  var rs = document.getElementById('hbRelSave');
  if(rs) rs.addEventListener('click', function(){
    var d = HB.draft;
    var selEl = document.querySelector('[data-hblink="target"]');
    var manual = document.getElementById('hbRelManual').value.trim();
    var target = null;
    if(selEl && selEl.value){ var rec = byId(selEl.value); if(rec) target = {id:rec.id, name:rec.name}; }
    if(!target && manual) target = {id:null, name:manual};
    if(!target){ alert('Выбери запись или впиши имя вручную.'); return; }
    var obj = {id:d.id||uid('rel'), type:'rel', ownerId:d.ownerId, target:target,
      stage:document.getElementById('hbRelStage').value,
      debt:document.getElementById('hbRelDebt').value,
      knows:document.getElementById('hbRelKnows').value,
      hides:document.getElementById('hbRelHides').value,
      note:document.getElementById('hbRelNote').value};
    var ex = d.id ? byId(d.id) : null;
    if(ex){ for(var k in obj) ex[k]=obj[k]; } else HB.records.push(obj);
    saveRecords(); HB.draft=null; navigate('hbRels:'+obj.ownerId);
  });

  var rd = document.getElementById('hbRelDel');
  if(rd) rd.addEventListener('click', function(){
    var d = HB.draft;
    if(!confirm('Удалить связь?')) return;
    HB.records = HB.records.filter(function(r){ return r.id!==d.id; });
    saveRecords(); HB.draft=null; navigate('hbRels:'+d.ownerId);
  });
  document.querySelectorAll('[data-hbdelrel]').forEach(function(b){
    b.addEventListener('click', function(){
      if(!confirm('Удалить связь?')) return;
      var id = b.getAttribute('data-hbdelrel');
      HB.records = HB.records.filter(function(r){ return r.id!==id; });
      saveRecords(); render();
    });
  });

  var ex = document.getElementById('hbExportBtn');
  if(ex) ex.addEventListener('click', function(){
    var blob = new Blob([JSON.stringify({world:HB.world, records:HB.records, activeChar:HB.activeChar}, null, 2)], {type:'application/json'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (HB.world.name||'world').replace(/[^\wа-яА-ЯёЁ\- ]/g,'')+'.json';
    a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); }, 500);
  });
  var imb = document.getElementById('hbImportBtn'), imf = document.getElementById('hbImportFile');
  if(imb && imf){
    imb.addEventListener('click', function(){ imf.click(); });
    imf.addEventListener('change', function(){
      var f = imf.files && imf.files[0]; if(!f) return;
      var fr = new FileReader();
      fr.onload = function(){
        try{
          var data = JSON.parse(fr.result);
          if(!data || !Array.isArray(data.records)) throw 0;
          if(!confirm('Заменить текущий мир содержимым файла?')) return;
          HB.records = data.records; HB.world = data.world||{name:'',note:''}; HB.activeChar = data.activeChar||null;
          saveRecords(); saveWorld(); saveActive(); paintBar(); render();
        }catch(e){ alert('Не удалось прочитать файл.'); }
      };
      fr.readAsText(f);
    });
  }

  if(view.screen==='hbGen') wireHbGen();
}

/* ---------- перехват render / navigate ---------- */
var _render = window.render, _navigate = window.navigate, _wire = window.wireEvents;

window.render = function(){
  mountBar();
  var s = view.screen || '';
  if(HB.mode==='hb' && s.indexOf('hb')===0){
    var app = document.getElementById('app');
    app.classList.remove('wide'); app.classList.toggle('home-wide', s==='hbHome');
    var html = '';
    if(s==='hbHome') html = hbHome();
    else if(s==='hbList') html = hbList();
    else if(s==='hbEdit') html = hbEdit();
    else if(s==='hbView') html = hbView();
    else if(s==='hbRels') html = hbRels();
    else if(s==='hbRelEdit') html = hbRelEdit();
    else if(s==='hbWorld') html = hbWorld();
    else if(s==='hbGen') html = hbGen();
    app.innerHTML = html;
    _wire(); wire();
    return;
  }
  _render();
};

window.navigate=function(val){
  var p=String(val||'').split(':');
  if (window.view && window.view.screen !== p[0]) window._prevScreen = window.view.screen;
  if(HB.mode==='hb'){
    if(p[0]==='home'){ view={screen:'hbHome'}; HB.draft=null; render(); window.scrollTo(0,0); return; }
    if(p[0]==='hbList'){ view={screen:'hbList', hbType:p[1]}; HB.draft=null; render(); window.scrollTo(0,0); return; }
    if(p[0]==='hbEdit'){ view={screen:'hbEdit', hbType:p[1], hbId:p[2]}; HB.draft=null; render(); window.scrollTo(0,0); return; }
    if(p[0]==='hbView'){ view={screen:'hbView', hbId:p[1]}; HB.draft=null; render(); window.scrollTo(0,0); return; }
    if(p[0]==='hbRels'){ view={screen:'hbRels', hbId:p[1]}; HB.draft=null; render(); window.scrollTo(0,0); return; }
    if(p[0]==='hbRelEdit'){ view={screen:'hbRelEdit', hbOwner:p[1], hbId:p[2]}; HB.draft=null; render(); window.scrollTo(0,0); return; }
    if(p[0]==='hbWorld'){ view={screen:'hbWorld'}; HB.draft=null; render(); window.scrollTo(0,0); return; }
    if(p[0]==='hbGen'){ view={screen:'hbGen'}; HB.draft=null; render(); window.scrollTo(0,0); return; }
  }
  _navigate(val);
};

/* ---------- запуск ---------- */
load();
mountBar();
if(HB.mode==='hb' && (view.screen==='home' || !view.screen)) view = {screen:'hbHome'};
render();

})();