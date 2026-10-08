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

/* ---------- переключатель режима ---------- */
function mountBar(){
  if(document.getElementById('hbModeBar')) return;
  var bar = document.createElement('div');
  bar.id = 'hbModeBar';
  document.body.appendChild(bar);
  paintBar();
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
    worldLabel = esc(HB.world && HB.world.name ? HB.world.name : 'Технологии');
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

  bar.innerHTML =
    '<div class="hb-bar-inner">'+
      '<div class="hb-seg">'+
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

  bar.querySelectorAll('[data-hbmode]').forEach(function(b){
    b.addEventListener('click', function(e){
      var m = b.getAttribute('data-hbmode');
      HB.mode = m;
      saveMode();
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
        if(typeof wzTriggerModeSwitchEffect === 'function') wzTriggerModeSwitchEffect(b, e);
        if(typeof window.navigate === 'function') window.navigate('wzHome');
        else { view = {screen:'wzHome'}; render(); }
      } else if(m === 'hb'){
        view = {screen:'hbHome'};
        render();
      } else {
        view = {screen:'home'};
        render();
      }
      paintBar();
      if(typeof paintShBar === 'function') paintShBar();
      window.scrollTo(0,0);
    });
  });
  if(typeof updateShinobiTheme === 'function') updateShinobiTheme();
  if(typeof applyMeTheme === 'function') applyMeTheme();
  if(typeof applyWitcherTheme === 'function') applyWitcherTheme();
  if(typeof applyWizardTheme === 'function') applyWizardTheme();
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
  var sel = cs.length
    ? '<select id="hbActiveSel"><option value="">— не выбран —</option>'+cs.map(function(c){
        return '<option value="'+escA(c.id)+'"'+(HB.activeChar===c.id?' selected':'')+'>'+esc(c.name||'Без имени')+'</option>';
      }).join('')+'</select>'
    : '<div class="hb-hint">Персонажей ещё нет — создай первого в разделе «Персонажи».</div>';

  var cards = ORDER.map(function(t){
    var n = byType(t).length;
    return '<div class="menu-item util" data-go="hbList:'+t+'">'+
      '<div><div class="name">'+T[t].icon+' '+esc(T[t].label)+'</div>'+
      '<div class="desc">'+esc(T[t].desc)+'</div></div>'+
      '<div class="hb-count">'+(n?n:'—')+'</div></div>';
  }).join('');

  return crumb([{label:'Технологии'}])+
    
    '<div class="hero-dice" data-go="dice">'+
      '<div class="hero-dice-icon">'+(typeof dieShapeSvg==='function'? dieShapeSvg(20,'hbHeroDie',20) : '🎲')+'</div>'+
      '<div class="hero-dice-text">'+
        '<div class="hero-dice-name">Бросок костей</div>'+
        '<div class="hero-dice-desc">Виртуальные кости: d4–d20, d100, подсчёт суммы, модификаторы, история бросков</div>'+
      '</div>'+
      '<div class="hero-dice-arrow">→</div>'+
    '</div>'+
    '<div class="section-label">Активный персонаж</div>'+
    '<div class="hb-active-box">'+sel+
      (ac?'<button class="btn-ghost" data-go="hbView:'+ac.id+'">Открыть карточку</button>':'')+
      (ac?'<button class="btn-ghost" data-go="hbRels:'+ac.id+'">Отношения</button>':'')+
    '</div>'+
    '<div class="section-label">Записные книжки</div>'+
    '<div class="menu-list grid-2">'+cards+'</div>'+
    '<div class="section-label">Мир</div>'+
    '<div class="hb-active-box">'+
      '<button class="btn-ghost" data-go="hbWorld">⚙️ Название и заметки мира</button>'+
      '<button class="btn-ghost" id="hbExportBtn">⬇️ Экспорт мира</button>'+
      '<button class="btn-ghost" id="hbImportBtn">⬆️ Импорт мира</button>'+
      '<input type="file" id="hbImportFile" accept="application/json,.json" style="display:none">'+
    '</div>'+
    '<div class="footnote">Данные режима «Технологии» хранятся отдельно от Фаэруна. Делай экспорт — это единственная резервная копия.</div>';
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
  if(sel) sel.addEventListener('change', function(){ HB.activeChar = sel.value||null; saveActive(); render(); });

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
  if(mk) mk.addEventListener('click', function(){ HB.activeChar = view.hbId; saveActive(); alert('Активный персонаж выбран.'); });

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
  }
  _navigate(val);
};

/* ---------- запуск ---------- */
load();
mountBar();
if(HB.mode==='hb' && (view.screen==='home' || !view.screen)) view = {screen:'hbHome'};
render();

})();