/* ==========================================================================
   КОНТЕКСТНЫЙ ИИ-АССИСТЕНТ И АГЕНТ ЗАДАЧ (ВСЕ 8 РАЗДЕЛОВ)
   Кружок справа внизу (FAB) + летающий чат с автовыполнением набора задач
   ========================================================================== */
(function(){
  'use strict';

  var CHAT_STORAGE_PREFIX = 'ttc_ai_assistant_chat_v1_';
  var isOpen = false;
  var isBusy = false;
  var taskRegistry = {}; // хранит созданные элементы для быстрого перехода и отмены (Undo)

  function getActiveMode(){
    if(window.HB && window.HB.mode) return window.HB.mode;
    try { return localStorage.getItem('ttc_mode') || 'faerun'; } catch(e){ return 'faerun'; }
  }

  function getApiKey(){
    if(typeof window.getGeminiApiKey === 'function'){
      var k = window.getGeminiApiKey();
      if(k) return k;
    }
    try {
      return localStorage.getItem('ttc_gemini_api_key') || localStorage.getItem('gemini_api_key') || '';
    } catch(e){ return ''; }
  }

  function promptApiKey(){
    var cur = getApiKey();
    var inp = prompt('Введите Google Gemini API ключ (gemini-4-argon):', cur || '');
    if(inp === null) return false;
    var trimmed = inp.trim();
    if(typeof window.setGeminiApiKey === 'function'){
      window.setGeminiApiKey(trimmed);
    } else {
      try {
        if(trimmed){
          localStorage.setItem('ttc_gemini_api_key', trimmed);
          localStorage.setItem('gemini_api_key', trimmed);
        } else {
          localStorage.removeItem('ttc_gemini_api_key');
          localStorage.removeItem('gemini_api_key');
        }
      } catch(e){}
    }
    renderChatHeader();
    return !!trimmed;
  }

  function escHtml(s){
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatBotText(text){
    var safe = escHtml(text || '');
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    safe = safe.replace(/\*([^*\n]+)\*/g, '<i>$1</i>');
    safe = safe.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:4px;color:var(--ai-accent-bright);">$1</code>');
    var paragraphs = safe.split(/\n{2,}/).map(function(p){
      return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
    });
    return paragraphs.join('');
  }

  /* ---------- Информация о текущем разделе и активном герое ---------- */
  function getModeContext(mode){
    var m = mode || getActiveMode();
    if(m === 'wi'){
      var wiP = (window.WI && typeof window.WI.getProfile === 'function') ? window.WI.getProfile() : {};
      if(window.WI && typeof window.WI.loadTechs === 'function') window.WI.loadTechs();
      if(window.WI && typeof window.WI.loadMoves === 'function') window.WI.loadMoves();
      var wiTechs = (window.WI && Array.isArray(window.WI.techs)) ? window.WI.techs : [];
      var wiMoves = (window.WI && Array.isArray(window.WI.moves)) ? window.WI.moves : [];
      return {
        mode: 'wi',
        icon: '🐺',
        title: 'Хронист Континента',
        worldName: 'Ведьмак (Неверлэнд)',
        heroName: (wiP && wiP.name) ? wiP.name : 'Безымянный ведьмак',
        heroSub: [wiP && (wiP.school || wiP.role), wiP && wiP.level ? (wiP.level + ' ур.') : ''].filter(Boolean).join(' • ') || 'Ведьмак',
        summary: 'Персонаж: ' + ((wiP && wiP.name) || 'Ведьмак') + ', Школа/Роль: ' + ((wiP && (wiP.school || wiP.role)) || 'Школа Волка') +
          ', Уровень: ' + ((wiP && wiP.level) || 1) + ', HP: ' + ((wiP && wiP.hp) || 30) + ', КБ: ' + ((wiP && wiP.ac) || 15) +
          '. Способности (' + wiTechs.length + '): ' + (wiTechs.map(function(t){ return t.name; }).slice(0, 20).join(', ') || 'нет') +
          '. Боевые приёмы (' + wiMoves.length + '): ' + (wiMoves.map(function(x){ return x.name; }).slice(0, 20).join(', ') || 'нет')
      };
    }
    if(m === 'sh'){
      var shMeta = (window.SH && window.SH.meta) ? window.SH.meta : {};
      var shTechs = (window.SH && Array.isArray(window.SH.techs)) ? window.SH.techs : [];
      var shMoves = (window.SH && Array.isArray(window.SH.moves)) ? window.SH.moves : [];
      return {
        mode: 'sh',
        icon: '🌀',
        title: 'Тактический советник Шиноби',
        worldName: 'Мир Шиноби',
        heroName: shMeta.charName || 'Шиноби',
        heroSub: [shMeta.clan, shMeta.rank, shMeta.level ? (shMeta.level + ' ур.') : ''].filter(Boolean).join(' • ') || 'Ниндзя',
        summary: 'Персонаж: ' + (shMeta.charName || 'Шиноби') + ', Клан: ' + (shMeta.clan || '—') + ', Ранг: ' + (shMeta.rank || 'Генин') +
          ', Уровень: ' + (shMeta.level || 1) + ', Стихия: ' + (shMeta.nature || '—') + ', HP: ' + (shMeta.hp || 28) + ', Чакра: ' + (shMeta.chakra || 30) +
          '. Техники (' + shTechs.length + '): ' + (shTechs.map(function(t){ return t.name; }).slice(0, 20).join(', ') || 'нет') +
          '. Приёмы (' + shMoves.length + '): ' + (shMoves.map(function(x){ return x.name; }).slice(0, 20).join(', ') || 'нет')
      };
    }
    if(m === 'me'){
      var meC = (window.ME && typeof window.ME.getChar === 'function') ? window.ME.getChar() : {};
      var mePow = (window.ME && typeof window.ME.getPowers === 'function') ? window.ME.getPowers() : [];
      return {
        mode: 'me',
        icon: '🚀',
        title: 'Тактический ВИ «Омни-Узел»',
        worldName: 'Mass Effect',
        heroName: (meC && meC.name) ? meC.name : 'Оперативник N7',
        heroSub: [meC && meC.className, meC && meC.level ? (meC.level + ' ур.') : ''].filter(Boolean).join(' • ') || 'Спектр',
        summary: 'Оперативник: ' + ((meC && meC.name) || 'Шепард') + ', Раса: ' + ((meC && meC.race) || 'Человек') +
          ', Класс: ' + ((meC && meC.className) || 'Штурмовик') + ', Уровень: ' + ((meC && meC.level) || 1) +
          '. Умения (' + mePow.length + '): ' + (mePow.map(function(p){ return p.name; }).slice(0, 20).join(', ') || 'нет')
      };
    }
    if(m === 'el'){
      var elP = (window.EL && typeof window.EL.getProfile === 'function') ? window.EL.getProfile() : {};
      var elT = (window.EL && typeof window.EL.getTechs === 'function') ? window.EL.getTechs() : [];
      var elM = (window.EL && typeof window.EL.getMoves === 'function') ? window.EL.getMoves() : [];
      var fullName = ((elP.firstName || '') + ' ' + (elP.lastName || '')).trim() || 'Покоритель стихий';
      return {
        mode: 'el',
        icon: '🌊',
        title: 'Мудрец Белого Лотоса',
        worldName: 'Стихия (Аватар)',
        heroName: fullName,
        heroSub: (elP.element || 'Земля') + ' • ' + (elP.level || 1) + ' ур.',
        summary: 'Персонаж: ' + fullName + ', Стихия: ' + (elP.element || 'Земля') + ', Уровень: ' + (elP.level || 1) +
          ', HP: ' + (elP.hp || 12) + ', КБ: ' + (elP.ac || 10) +
          '. Способности (' + elT.length + '): ' + (elT.map(function(t){ return t.name; }).slice(0, 20).join(', ') || 'нет') +
          '. Приёмы (' + elM.length + '): ' + (elM.map(function(x){ return x.name; }).slice(0, 20).join(', ') || 'нет')
      };
    }
    if(m === 'wz'){
      var wzP = (window.WZ && typeof window.WZ.getProfile === 'function') ? window.WZ.getProfile() : {};
      var wzSp = (window.WZ && Array.isArray(window.WZ.spells)) ? window.WZ.spells : [];
      var wzDu = (window.WZ && Array.isArray(window.WZ.duels)) ? window.WZ.duels : [];
      var wzPot = (window.WZ && Array.isArray(window.WZ.potions)) ? window.WZ.potions : [];
      return {
        mode: 'wz',
        icon: '🪄',
        title: 'Архивариус Хогвартса',
        worldName: 'Волшебный мир',
        heroName: (wzP && wzP.name) ? wzP.name : 'Волшебник',
        heroSub: [wzP && wzP.house, wzP && (wzP.year || wzP.profession)].filter(Boolean).join(' • ') || 'Хогвартс',
        summary: 'Волшебник: ' + ((wzP && wzP.name) || 'Маг') + ', Факультет: ' + ((wzP && wzP.house) || '—') +
          ', Статус/Курс: ' + ((wzP && (wzP.year || wzP.profession)) || '—') +
          '. Заклинания (' + wzSp.length + '): ' + (wzSp.map(function(s){ return s.name; }).slice(0, 20).join(', ') || 'нет') +
          '. Дуэльные приёмы (' + wzDu.length + '): ' + (wzDu.map(function(d){ return d.name; }).slice(0, 20).join(', ') || 'нет') +
          '. Зелья (' + wzPot.length + '): ' + (wzPot.map(function(p){ return p.name; }).slice(0, 15).join(', ') || 'нет')
      };
    }
    if(m === 'sw'){
      var swP = (window.SW && typeof window.SW.getActiveProfile === 'function') ? window.SW.getActiveProfile() : {};
      var swT = (window.SW && Array.isArray(window.SW.techs)) ? window.SW.techs : [];
      var swM = (window.SW && Array.isArray(window.SW.moves)) ? window.SW.moves : [];
      return {
        mode: 'sw',
        icon: '⚔️',
        title: 'Голокрон Архивов',
        worldName: 'Звёздные войны',
        heroName: (swP && swP.name) ? swP.name : 'Адепт Силы',
        heroSub: [swP && swP.path, swP && swP.level ? (swP.level + ' ур.') : ''].filter(Boolean).join(' • ') || 'Джедай / Ситх',
        summary: 'Персонаж: ' + ((swP && swP.name) || 'Герой') + ', Раса: ' + ((swP && swP.race) || 'Человек') +
          ', Путь: ' + ((swP && swP.path) || 'Джедай') + ', Уровень: ' + ((swP && swP.level) || 1) +
          '. Способности Силы (' + swT.length + '): ' + (swT.map(function(t){ return t.name; }).slice(0, 20).join(', ') || 'нет') +
          '. Боевые приёмы (' + swM.length + '): ' + (swM.map(function(x){ return x.name; }).slice(0, 20).join(', ') || 'нет')
      };
    }
    if(m === 'hb'){
      var hbRecs = (window.HB && Array.isArray(window.HB.records)) ? window.HB.records : [];
      var hbChar = (window.HB && window.HB.activeChar) ? hbRecs.find(function(r){ return r.id === window.HB.activeChar; }) : null;
      return {
        mode: 'hb',
        icon: '🦾',
        title: 'Нейро-Ассистент',
        worldName: (window.HB && window.HB.world && window.HB.world.name) ? window.HB.world.name : 'Технологии',
        heroName: (hbChar && hbChar.name) ? hbChar.name : 'Оператор сети',
        heroSub: (hbChar && hbChar.f && hbChar.f.job) ? hbChar.f.job : ('Записей в базе: ' + hbRecs.length),
        summary: 'Сеттинг: Технологии. Активный персонаж: ' + ((hbChar && hbChar.name) || 'не выбран') +
          '. Всего записей в базе: ' + hbRecs.length
      };
    }

    // По умолчанию: Фаэрун (D&D 2024)
    var faeC = (typeof window.getActiveFaerunCharacter === 'function') ? window.getActiveFaerunCharacter() : null;
    var faeTechs = (faeC && Array.isArray(faeC.techs)) ? faeC.techs : [];
    var faeMoves = (faeC && Array.isArray(faeC.moves)) ? faeC.moves : [];
    var faeRecipes = (typeof window.RECIPES !== 'undefined' && Array.isArray(window.RECIPES)) ? window.RECIPES : [];
    return {
      mode: 'faerun',
      icon: '🐉',
      title: 'Советник Кэндлкипа',
      worldName: 'Фаэрун (D&D 2024)',
      heroName: (faeC && faeC.name) ? faeC.name : 'Искатель приключений',
      heroSub: [faeC && faeC.species, faeC && faeC.className ? (faeC.className + ' ' + (faeC.level || 1) + ' ур.') : '', faeC && faeC.subclass].filter(Boolean).join(' • ') || 'Герой D&D 5e',
      summary: 'Герой: ' + ((faeC && faeC.name) || 'Безымянный') +
        ', Вид: ' + ((faeC && faeC.species) || 'Человек') +
        ', Класс: ' + ((faeC && faeC.className) || 'Воин') + ' (' + ((faeC && faeC.subclass) || 'без подкласса') + ')' +
        ', Уровень: ' + ((faeC && faeC.level) || 1) +
        ', КД: ' + ((faeC && faeC.ac) || 16) + ', Хиты: ' + ((faeC && faeC.hpMax) || 12) +
        '. Способности героя (' + faeTechs.length + '): ' + (faeTechs.map(function(t){ return t.name; }).slice(0, 25).join(', ') || 'нет') +
        '. Боевые приёмы героя (' + faeMoves.length + '): ' + (faeMoves.map(function(x){ return x.name; }).slice(0, 25).join(', ') || 'нет') +
        '. Свои рецепты алхимии (' + faeRecipes.length + '): ' + (faeRecipes.map(function(r){ return r.name; }).slice(0, 15).join(', ') || 'нет')
    };
  }

  /* ---------- Хранение истории чата по разделам ---------- */
  function loadChatHistory(mode){
    try {
      var raw = localStorage.getItem(CHAT_STORAGE_PREFIX + (mode || getActiveMode()));
      if(raw){
        var parsed = JSON.parse(raw);
        if(Array.isArray(parsed)) return parsed;
      }
    } catch(e){}
    return [];
  }

  function saveChatHistory(mode, list){
    try {
      var trimmed = (list || []).slice(-30);
      localStorage.setItem(CHAT_STORAGE_PREFIX + (mode || getActiveMode()), JSON.stringify(trimmed));
    } catch(e){}
  }

  /* ---------- Выполнение задач (Task Execution Engine) ---------- */
  function rollDiceFormula(formula){
    var str = String(formula || '1d20').trim().toLowerCase().replace(/\s+/g, '');
    var m = str.match(/^(\d*)d(\d+)([+-]\d+)?$/);
    if(!m){
      var d20 = Math.floor(Math.random() * 20) + 1;
      return { formula: '1d20', rolls: [d20], mod: 0, total: d20 };
    }
    var count = Math.min(Math.max(parseInt(m[1] || '1', 10), 1), 30);
    var sides = Math.min(Math.max(parseInt(m[2] || '20', 10), 2), 1000);
    var mod = m[3] ? parseInt(m[3], 10) : 0;
    var rolls = [];
    var sum = 0;
    for(var i = 0; i < count; i++){
      var r = Math.floor(Math.random() * sides) + 1;
      rolls.push(r);
      sum += r;
    }
    return {
      formula: count + 'd' + sides + (mod > 0 ? ('+' + mod) : (mod < 0 ? String(mod) : '')),
      rolls: rolls,
      mod: mod,
      total: sum + mod
    };
  }

  function executeSingleTask(t, mode, idx){
    if(!t || !t.action) return null;
    var action = String(t.action).toLowerCase().trim();
    var d = t.item || t.data || t;
    var reportId = 'task_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 4);

    // 1. ДОБАВЛЕНИЕ СПОСОБНОСТИ / ТЕХНИКИ / ЗАКЛИНАНИЯ
    if(action === 'add_ability' || action === 'add_tech'){
      var id = 'ai_ab_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 4);
      var name = d.name || 'Новая способность';
      var icon = d.icon || '✨';
      var desc = d.desc || d.effect || 'Магическая или классовая способность.';
      var dmgN = parseInt(d.dmgN, 10) || 0;
      var dmgD = d.dmgD || 'd6';
      var dmgMod = parseInt(d.dmgMod, 10) || 0;
      var cost = d.actionCost || d.cost || '1 действие';
      var cooldown = d.cooldown || 'Короткий или долгий отдых';
      var cat = d.category || d.cat || 'Классовые умения';
      var checkOrSave = d.checkOrSave || d.save || '';

      if(mode === 'wi' && window.WI){
        window.WI.loadTechs();
        if(!Array.isArray(window.WI.techs)) window.WI.techs = [];
        var wiItem = {
          id: id,
          name: name,
          icon: icon,
          cat: d.cat || d.category || 'Знаки ведьмака',
          cost: d.cost || cost,
          req: d.req || d.source || 'Ведьмак',
          dmgN: dmgN,
          dmgD: dmgD,
          dmgMod: dmgMod,
          desc: desc
        };
        window.WI.techs.unshift(wiItem);
        window.WI.saveTechs();
        taskRegistry[reportId] = {
          mode: 'wi', type: 'ability', id: id,
          open: function(){ if(typeof window.navigate === 'function') window.navigate('wiTechView:' + id); },
          undo: function(){
            window.WI.techs = (window.WI.techs || []).filter(function(x){ return x.id !== id; });
            window.WI.saveTechs();
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Способности (Ведьмак)',
          name: icon + ' ' + name,
          meta: wiItem.cat + (dmgN > 0 ? (' • Урон: ' + dmgN + dmgD + (dmgMod ? ('+' + dmgMod) : '')) : '') + (wiItem.cost ? (' • ' + wiItem.cost) : ''),
          canUndo: true,
          canOpen: true
        };
      }

      if(mode === 'sh' && window.SH){
        if(!Array.isArray(window.SH.techs)) window.SH.techs = [];
        var shItem = {
          id: id,
          name: name,
          rank: d.rank || 'B',
          cat: d.cat || d.category || 'Ниндзюцу',
          nature: d.nature || 'Молния / Огонь',
          cost: String(d.cost || '5 ед. чакры'),
          req: d.req || d.source || '',
          dmgN: dmgN > 0 ? String(dmgN) : '',
          dmgD: dmgD || 'd6',
          dmgMod: dmgMod > 0 ? String(dmgMod) : '',
          desc: desc
        };
        window.SH.techs.unshift(shItem);
        if(typeof window.SH.saveT === 'function') window.SH.saveT();
        taskRegistry[reportId] = {
          mode: 'sh', type: 'ability', id: id,
          open: function(){ if(typeof window.navigate === 'function') window.navigate('shTechView:' + id); },
          undo: function(){
            window.SH.techs = (window.SH.techs || []).filter(function(x){ return x.id !== id; });
            if(typeof window.SH.saveT === 'function') window.SH.saveT();
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Техники (Шиноби)',
          name: icon + ' ' + name,
          meta: shItem.cat + ' (Ранг ' + shItem.rank + ') • ' + shItem.cost,
          canUndo: true,
          canOpen: true
        };
      }

      if(mode === 'me' && window.ME && typeof window.ME.addPower === 'function'){
        var mePow = window.ME.addPower({
          id: id,
          name: name,
          branch: d.branch || d.category || 'Биотика',
          icon: icon,
          cd: parseInt(d.cd, 10) || 4,
          req: d.req || 'Омни-инструмент / Имплант',
          cost: 1,
          r1: desc
        });
        taskRegistry[reportId] = {
          mode: 'me', type: 'ability', id: mePow.id,
          open: function(){ if(typeof window.navigate === 'function') window.navigate('mePowers'); },
          undo: function(){ if(typeof window.ME.deletePower === 'function') window.ME.deletePower(mePow.id); }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Умения (Mass Effect)',
          name: icon + ' ' + name,
          meta: mePow.branch + ' • Перезарядка: ' + mePow.cd + ' с',
          canUndo: true,
          canOpen: true
        };
      }

      if(mode === 'el' && window.EL && typeof window.EL.getTechs === 'function'){
        var elList = window.EL.getTechs();
        var elItem = {
          id: id,
          name: name,
          element: d.element || d.category || 'Огонь',
          subArt: d.subArt || '',
          scale: d.scale || 'Средний',
          cost: d.cost || '1 Очко Ци',
          benefit: d.benefit || '',
          reqWindow: d.reqWindow || '',
          range: d.range || '30 фт',
          damage: d.damage || (dmgN > 0 ? (dmgN + dmgD) : '2d8'),
          desc: desc
        };
        elList.unshift(elItem);
        window.EL.saveTechs(elList);
        taskRegistry[reportId] = {
          mode: 'el', type: 'ability', id: id,
          open: function(){ if(typeof window.navigate === 'function') window.navigate('elTechView:' + id); },
          undo: function(){
            var cur = window.EL.getTechs().filter(function(x){ return x.id !== id; });
            window.EL.saveTechs(cur);
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Способности (Стихия)',
          name: icon + ' ' + name,
          meta: elItem.element + ' • ' + elItem.damage + ' • ' + elItem.range,
          canUndo: true,
          canOpen: true
        };
      }

      if(mode === 'wz' && window.WZ){
        if(!Array.isArray(window.WZ.spells)) window.WZ.spells = [];
        var wzItem = {
          id: id,
          name: name,
          incantation: d.incantation || d.source || '',
          icon: icon,
          cat: d.cat || d.category || 'Боевые заклятия',
          action: cost,
          cost: cooldown,
          req: d.req || '',
          dmgN: dmgN,
          dmgD: dmgD,
          dmgMod: dmgMod,
          desc: desc
        };
        window.WZ.spells.unshift(wzItem);
        window.WZ.saveSpells();
        taskRegistry[reportId] = {
          mode: 'wz', type: 'ability', id: id,
          open: function(){ if(typeof window.navigate === 'function') window.navigate('wzSpellView:' + id); },
          undo: function(){
            window.WZ.spells = (window.WZ.spells || []).filter(function(x){ return x.id !== id; });
            window.WZ.saveSpells();
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Заклинания (Волшебник)',
          name: icon + ' ' + name,
          meta: wzItem.cat + (wzItem.incantation ? (' • «' + wzItem.incantation + '»') : ''),
          canUndo: true,
          canOpen: true
        };
      }

      if(mode === 'sw' && window.SW){
        if(!Array.isArray(window.SW.techs)) window.SW.techs = [];
        var swItem = {
          id: id,
          name: name,
          side: d.side || d.category || 'Универсальная',
          rank: d.rank || 'Адепт',
          cost: d.cost || '1 Очко Силы',
          actionType: cost,
          range: d.range || '9 м',
          duration: d.duration || 'Мгновенно',
          tags: [],
          desc: desc
        };
        window.SW.techs.unshift(swItem);
        window.SW.saveTechs();
        taskRegistry[reportId] = {
          mode: 'sw', type: 'ability', id: id,
          open: function(){
            window.view = { screen: 'swTechView', id: id };
            if(typeof window.render === 'function') window.render();
          },
          undo: function(){
            window.SW.techs = (window.SW.techs || []).filter(function(x){ return x.id !== id; });
            window.SW.saveTechs();
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Способности Силы',
          name: icon + ' ' + name,
          meta: swItem.side + ' (' + swItem.rank + ') • ' + swItem.cost,
          canUndo: true,
          canOpen: true
        };
      }

      if(mode === 'hb' && window.HB){
        if(!Array.isArray(window.HB.records)) window.HB.records = [];
        var hbItem = {
          id: id,
          type: 'magic',
          name: name,
          subtitle: cat + ' • ' + cost,
          desc: desc,
          f: { kind: cat, cost: cost, legal: 'Свободный допуск', cast: cooldown, eff: desc },
          custom: [],
          links: {}
        };
        window.HB.records.unshift(hbItem);
        try { localStorage.setItem('ttc_hb_records', JSON.stringify(window.HB.records)); } catch(e){}
        taskRegistry[reportId] = {
          mode: 'hb', type: 'ability', id: id,
          open: function(){ if(typeof window.navigate === 'function') window.navigate('hbView:' + id); },
          undo: function(){
            window.HB.records = (window.HB.records || []).filter(function(x){ return x.id !== id; });
            try { localStorage.setItem('ttc_hb_records', JSON.stringify(window.HB.records)); } catch(e){}
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Базу (Технологии)',
          name: icon + ' ' + name,
          meta: hbItem.subtitle,
          canUndo: true,
          canOpen: true
        };
      }

      // По умолчанию: Фаэрун (D&D 2024)
      var hero = (typeof window.getActiveFaerunCharacter === 'function') ? window.getActiveFaerunCharacter() : null;
      if(hero){
        if(!Array.isArray(hero.techs)) hero.techs = [];
        var faeItem = {
          id: id,
          name: name,
          icon: icon,
          category: cat,
          cat: cat,
          source: d.source || d.req || ((hero.className || 'Герой') + ' ' + (hero.level || 1) + ' ур.'),
          actionCost: cost,
          cooldown: cooldown,
          checkOrSave: checkOrSave,
          cost: cost,
          req: d.source || '',
          dmgN: dmgN,
          dmgD: dmgD,
          dmgMod: dmgMod,
          desc: desc
        };
        hero.techs.unshift(faeItem);
        if(typeof window.saveCharactersToStorage === 'function') window.saveCharactersToStorage();
        taskRegistry[reportId] = {
          mode: 'faerun', type: 'ability', id: id,
          open: function(){
            if(typeof window.navigate === 'function') window.navigate('faeTechView', { id: id });
          },
          undo: function(){
            var h = window.getActiveFaerunCharacter();
            if(h && Array.isArray(h.techs)){
              h.techs = h.techs.filter(function(x){ return x.id !== id; });
              if(typeof window.saveCharactersToStorage === 'function') window.saveCharactersToStorage();
            }
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Способности (' + (hero.name || 'Герой') + ')',
          name: icon + ' ' + name,
          meta: cat + ' • ' + cost + (checkOrSave ? (' • ' + checkOrSave) : ''),
          canUndo: true,
          canOpen: true
        };
      }
    }

    // 2. ДОБАВЛЕНИЕ БОЕВОГО ПРИЁМА / ФЕХТОВАНИЯ / ДУЭЛЬНОГО ПРИЁМА
    if(action === 'add_move' || action === 'add_duel'){
      var mId = 'ai_mv_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 4);
      var mName = d.name || 'Новый боевой приём';
      var mIcon = d.icon || '⚔️';
      var mDesc = d.desc || d.effect || 'Тактический боевой приём.';
      var mAction = d.actionCost || d.action || 'Часть действия Атаки';
      var mCat = d.category || d.kind || 'Оружейные атаки и Мастерство (2024)';

      if(mode === 'wi' && window.WI){
        window.WI.loadMoves();
        if(!Array.isArray(window.WI.moves)) window.WI.moves = [];
        var wiMove = {
          id: mId,
          name: mName,
          icon: mIcon,
          kind: d.kind || d.category || 'Фехтование',
          action: mAction,
          trigger: d.trigger || '',
          desc: mDesc
        };
        window.WI.moves.unshift(wiMove);
        window.WI.saveMoves();
        taskRegistry[reportId] = {
          mode: 'wi', type: 'move', id: mId,
          open: function(){ if(typeof window.navigate === 'function') window.navigate('wiMoveView:' + mId); },
          undo: function(){
            window.WI.moves = (window.WI.moves || []).filter(function(x){ return x.id !== mId; });
            window.WI.saveMoves();
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Приёмы (Ведьмак)',
          name: mIcon + ' ' + mName,
          meta: wiMove.kind + ' • ' + wiMove.action,
          canUndo: true,
          canOpen: true
        };
      }

      if(mode === 'sh' && window.SH){
        if(!Array.isArray(window.SH.moves)) window.SH.moves = [];
        var shMove = {
          id: mId,
          name: mName,
          kind: d.kind || d.category || 'Тайдзюцу',
          mtype: d.mtype || 'Урон',
          weapon: d.weapon || d.weaponOrStyle || '',
          atk: d.attackBonus || d.atk || '+6',
          dmg: d.damageOrSave || d.dmg || '1d8+4',
          def: d.def || '',
          state: d.state || '',
          dur: d.dur || 'Мгновенно',
          trigger: d.trigger || '',
          reach: d.reach || '5 фт',
          pay: mAction,
          req: d.req || '',
          desc: mDesc
        };
        window.SH.moves.unshift(shMove);
        if(typeof window.SH.saveM === 'function') window.SH.saveM();
        taskRegistry[reportId] = {
          mode: 'sh', type: 'move', id: mId,
          open: function(){ if(typeof window.navigate === 'function') window.navigate('shMoveView:' + mId); },
          undo: function(){
            window.SH.moves = (window.SH.moves || []).filter(function(x){ return x.id !== mId; });
            if(typeof window.SH.saveM === 'function') window.SH.saveM();
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Приёмы (Шиноби)',
          name: mIcon + ' ' + mName,
          meta: shMove.kind + ' • ' + shMove.dmg,
          canUndo: true,
          canOpen: true
        };
      }

      if(mode === 'el' && window.EL && typeof window.EL.getMoves === 'function'){
        var elMoves = window.EL.getMoves();
        var elMv = {
          id: mId,
          name: mName,
          kind: d.kind || d.category || 'Атака в окно',
          cost: mAction,
          opensWindow: d.opensWindow || 'Ошеломлён',
          trigger: d.trigger || '',
          effect: d.damageOrSave || d.effect || '2d6 урона',
          desc: mDesc
        };
        elMoves.unshift(elMv);
        window.EL.saveMoves(elMoves);
        taskRegistry[reportId] = {
          mode: 'el', type: 'move', id: mId,
          open: function(){ if(typeof window.navigate === 'function') window.navigate('elMoveView:' + mId); },
          undo: function(){
            var cur = window.EL.getMoves().filter(function(x){ return x.id !== mId; });
            window.EL.saveMoves(cur);
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Приёмы (Стихия)',
          name: mIcon + ' ' + mName,
          meta: elMv.kind + ' • ' + elMv.effect,
          canUndo: true,
          canOpen: true
        };
      }

      if(mode === 'wz' && window.WZ){
        if(!Array.isArray(window.WZ.duels)) window.WZ.duels = [];
        var wzDuel = {
          id: mId,
          name: mName,
          icon: mIcon,
          kind: d.kind || d.category || 'Атакующий финт',
          action: mAction,
          trigger: d.trigger || '',
          desc: mDesc
        };
        window.WZ.duels.unshift(wzDuel);
        window.WZ.saveDuels();
        taskRegistry[reportId] = {
          mode: 'wz', type: 'move', id: mId,
          open: function(){ if(typeof window.navigate === 'function') window.navigate('wzDuelView:' + mId); },
          undo: function(){
            window.WZ.duels = (window.WZ.duels || []).filter(function(x){ return x.id !== mId; });
            window.WZ.saveDuels();
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Дуэльные приёмы',
          name: mIcon + ' ' + mName,
          meta: wzDuel.kind + ' • ' + wzDuel.action,
          canUndo: true,
          canOpen: true
        };
      }

      if(mode === 'sw' && window.SW){
        if(!Array.isArray(window.SW.moves)) window.SW.moves = [];
        var swMv = {
          id: mId,
          name: mName,
          category: d.category || d.kind || 'Форма светового меча',
          actionType: mAction,
          cost: d.cost || '1 Очко Силы',
          damage: d.damageOrSave || d.damage || '+1d8 урона',
          tags: [],
          desc: mDesc
        };
        window.SW.moves.unshift(swMv);
        window.SW.saveMoves();
        taskRegistry[reportId] = {
          mode: 'sw', type: 'move', id: mId,
          open: function(){
            window.view = { screen: 'swMoveView', id: mId };
            if(typeof window.render === 'function') window.render();
          },
          undo: function(){
            window.SW.moves = (window.SW.moves || []).filter(function(x){ return x.id !== mId; });
            window.SW.saveMoves();
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Приёмы (Звёздные войны)',
          name: mIcon + ' ' + mName,
          meta: swMv.category + ' • ' + swMv.damage,
          canUndo: true,
          canOpen: true
        };
      }

      // По умолчанию: Фаэрун (D&D 2024)
      var fHero = (typeof window.getActiveFaerunCharacter === 'function') ? window.getActiveFaerunCharacter() : null;
      if(fHero){
        if(!Array.isArray(fHero.moves)) fHero.moves = [];
        var faeMove = {
          id: mId,
          name: mName,
          icon: mIcon,
          category: mCat,
          kind: mCat,
          weaponOrStyle: d.weaponOrStyle || d.weapon || 'Любое оружие ближнего боя',
          attackBonus: d.attackBonus || '+6',
          damageOrSave: d.damageOrSave || d.damage || '1d8+4',
          mastery: d.mastery || 'Подрыв (Sap)',
          actionCost: mAction,
          action: mAction,
          trigger: d.trigger || '',
          cost: d.cost || '',
          desc: mDesc
        };
        fHero.moves.unshift(faeMove);
        if(typeof window.saveCharactersToStorage === 'function') window.saveCharactersToStorage();
        taskRegistry[reportId] = {
          mode: 'faerun', type: 'move', id: mId,
          open: function(){
            if(typeof window.navigate === 'function') window.navigate('faeMoveView', { id: mId });
          },
          undo: function(){
            var h = window.getActiveFaerunCharacter();
            if(h && Array.isArray(h.moves)){
              h.moves = h.moves.filter(function(x){ return x.id !== mId; });
              if(typeof window.saveCharactersToStorage === 'function') window.saveCharactersToStorage();
            }
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Боевые приёмы (' + (fHero.name || 'Герой') + ')',
          name: mIcon + ' ' + mName,
          meta: faeMove.weaponOrStyle + ' • ' + faeMove.damageOrSave + ' • ' + faeMove.actionCost,
          canUndo: true,
          canOpen: true
        };
      }
    }

    // 3. ДОБАВЛЕНИЕ РЕЦЕПТА АЛХИМИИ / ЗЕЛЬЯ
    if(action === 'add_recipe' || action === 'add_potion'){
      var rName = d.name || 'Алхимический эликсир';
      if(mode === 'wz' && window.WZ){
        if(!Array.isArray(window.WZ.potions)) window.WZ.potions = [];
        var wzPotId = 'wz_pot_' + Date.now() + '_' + idx;
        var wzPot = {
          id: wzPotId,
          name: rName,
          icon: '🧪',
          tier: d.rarity || d.tier || 'Сложное (Ж.А.Б.А.)',
          difficulty: 'СЛ ' + (d.dc || 15),
          time: d.time || '2 часа',
          cauldron: 'Оловянный котёл №2',
          ingredients: Array.isArray(d.ingredients) ? d.ingredients.map(function(x){ return typeof x === 'string' ? x : (x.name + ' x' + (x.qty || 1)); }).join(', ') : (d.ingredients || 'Редкие травы'),
          recipe: d.appearance || '',
          effect: d.effect || d.desc || '',
          notes: ''
        };
        window.WZ.potions.unshift(wzPot);
        window.WZ.savePotions();
        taskRegistry[reportId] = {
          mode: 'wz', type: 'recipe', id: wzPotId,
          open: function(){ if(typeof window.navigate === 'function') window.navigate('wzPotionView:' + wzPotId); },
          undo: function(){
            window.WZ.potions = (window.WZ.potions || []).filter(function(x){ return x.id !== wzPotId; });
            window.WZ.savePotions();
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Зелья (Волшебник)',
          name: '🧪 ' + rName,
          meta: wzPot.tier + ' • ' + wzPot.difficulty,
          canUndo: true,
          canOpen: true
        };
      }

      if(typeof window.newRecipe === 'function' && Array.isArray(window.RECIPES)){
        var rec = window.newRecipe({
          name: rName,
          category: d.category || 'potions',
          rarity: d.rarity || 'Редкий',
          kit: d.kit || 'alchemist',
          cost: Number(d.cost) || 150,
          time: d.time || '4 часа',
          dc: Number(d.dc) || 15,
          ingredients: Array.isArray(d.ingredients) && d.ingredients.length
            ? d.ingredients.map(function(ing){ return typeof ing === 'string' ? { name: ing, qty: 1 } : { name: ing.name || 'Реагент', qty: Number(ing.qty) || 1 }; })
            : [{ name: 'Редкий реагент Фаэруна', qty: 1 }],
          appearance: d.appearance || 'Мерцающая эссенция в хрустальном флаконе.',
          effect: d.effect || d.desc || 'Магический эффект зелья.',
          source: 'ai'
        });
        window.RECIPES.unshift(rec);
        if(typeof window.saveRecipesToStorage === 'function') window.saveRecipesToStorage();
        taskRegistry[reportId] = {
          mode: 'faerun', type: 'recipe', id: rec.id,
          open: function(){
            if(typeof window.navigate === 'function') window.navigate('recipeView', { recipeId: rec.id });
          },
          undo: function(){
            var idxR = window.RECIPES.findIndex(function(x){ return x.id === rec.id; });
            if(idxR !== -1){
              window.RECIPES.splice(idxR, 1);
              if(typeof window.saveRecipesToStorage === 'function') window.saveRecipesToStorage();
            }
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Мои Рецепты',
          name: '🧪 ' + rName,
          meta: rec.rarity + ' • СЛ ' + rec.dc + ' • ' + rec.cost + ' ЗМ',
          canUndo: true,
          canOpen: true
        };
      }
    }

    // 4. ДОБАВЛЕНИЕ ЗАКЛИНАНИЯ В КНИГУ ЗАКЛИНАНИЙ
    if(action === 'add_spell'){
      if(mode === 'faerun' && typeof window.SPELLS !== 'undefined'){
        var spId = 'spell_' + Date.now() + '_' + idx;
        var spObj = {
          id: spId,
          name: d.name || 'Новое заклинание',
          school: d.school || 'evocation',
          level: parseInt(d.level, 10) || 1,
          effect: d.effect || d.desc || '',
          isCustom: true
        };
        window.SPELLS.push(spObj);
        if(typeof window.saveSpellsToStorage === 'function') window.saveSpellsToStorage();
        var spHero = (typeof window.getActiveFaerunCharacter === 'function') ? window.getActiveFaerunCharacter() : null;
        if(spHero){
          var line = '• ' + spObj.name + ' (' + (spObj.level === 0 ? 'Заговор' : (spObj.level + ' круг')) + '): ' + spObj.effect;
          spHero.spellNotes = spHero.spellNotes ? (spHero.spellNotes + '\n\n' + line) : line;
          spHero.spellEnabled = true;
          if(typeof window.saveCharactersToStorage === 'function') window.saveCharactersToStorage();
        }
        taskRegistry[reportId] = {
          mode: 'faerun', type: 'spell', id: spId,
          open: function(){ if(typeof window.navigate === 'function') window.navigate('magic'); },
          undo: function(){
            var idxS = window.SPELLS.findIndex(function(x){ return x.id === spId; });
            if(idxS !== -1){
              window.SPELLS.splice(idxS, 1);
              if(typeof window.saveSpellsToStorage === 'function') window.saveSpellsToStorage();
            }
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Добавлено в Книгу заклинаний',
          name: '✨ ' + spObj.name,
          meta: (spObj.level === 0 ? 'Заговор' : (spObj.level + ' круг')) + ' • ' + spObj.school,
          canUndo: true,
          canOpen: true
        };
      }
      // Для других режимов делегируем в add_ability
      return executeSingleTask({ action: 'add_ability', item: d }, mode, idx);
    }

    // 5. УДАЛЕНИЕ ПО НАЗВАНИЮ
    if(action === 'delete_item'){
      var targetName = String(d.name || '').trim().toLowerCase();
      if(!targetName) return null;
      var removedName = '';
      if(mode === 'faerun'){
        var h = (typeof window.getActiveFaerunCharacter === 'function') ? window.getActiveFaerunCharacter() : null;
        if(h){
          var bT = (h.techs || []).length;
          h.techs = (h.techs || []).filter(function(x){
            var match = String(x.name || '').toLowerCase().indexOf(targetName) !== -1;
            if(match && !removedName) removedName = x.name;
            return !match;
          });
          if(h.techs.length === bT){
            h.moves = (h.moves || []).filter(function(x){
              var match = String(x.name || '').toLowerCase().indexOf(targetName) !== -1;
              if(match && !removedName) removedName = x.name;
              return !match;
            });
          }
          if(typeof window.saveCharactersToStorage === 'function') window.saveCharactersToStorage();
        }
      } else if(mode === 'wi' && window.WI){
        window.WI.loadTechs(); window.WI.loadMoves();
        window.WI.techs = (window.WI.techs || []).filter(function(x){
          var match = String(x.name || '').toLowerCase().indexOf(targetName) !== -1;
          if(match && !removedName) removedName = x.name;
          return !match;
        });
        window.WI.moves = (window.WI.moves || []).filter(function(x){
          var match = String(x.name || '').toLowerCase().indexOf(targetName) !== -1;
          if(match && !removedName) removedName = x.name;
          return !match;
        });
        window.WI.saveTechs(); window.WI.saveMoves();
      }
      if(removedName){
        return {
          reportId: reportId,
          badge: '🗑️ Удалено из списка',
          name: removedName,
          meta: 'Запись успешно удалена по вашему запросу',
          canUndo: false,
          canOpen: false
        };
      }
    }

    // 6. ОБНОВЛЕНИЕ ДОСЬЕ ГЕРОЯ
    if(action === 'update_character'){
      if(mode === 'faerun' && typeof window.getActiveFaerunCharacter === 'function'){
        var ch = window.getActiveFaerunCharacter();
        if(ch){
          var changes = [];
          if(d.level != null){ ch.level = Number(d.level) || ch.level; changes.push('Уровень: ' + ch.level); }
          if(d.hpMax != null){ ch.hpMax = Number(d.hpMax) || ch.hpMax; changes.push('Хиты: ' + ch.hpMax); }
          if(d.ac != null){ ch.ac = Number(d.ac) || ch.ac; changes.push('КД: ' + ch.ac); }
          if(d.className){ ch.className = d.className; changes.push('Класс: ' + ch.className); }
          if(d.subclass){ ch.subclass = d.subclass; changes.push('Подкласс: ' + ch.subclass); }
          if(d.name){ ch.name = d.name; changes.push('Имя: ' + ch.name); }
          if(d.equipmentAppend){
            ch.equipment = ch.equipment ? (ch.equipment + '\n' + d.equipmentAppend) : d.equipmentAppend;
            changes.push('+ Снаряжение');
          }
          if(typeof window.saveCharactersToStorage === 'function') window.saveCharactersToStorage();
          if(changes.length){
            return {
              reportId: reportId,
              badge: '✓ Обновлено досье героя',
              name: ch.name || 'Герой',
              meta: changes.join(' • '),
              canUndo: false,
              canOpen: false
            };
          }
        }
      }
    }

    // 7. БРОСОК КУБИКОВ
    if(action === 'roll_dice'){
      var rollRes = rollDiceFormula(d.formula || d.dice || '1d20');
      return {
        reportId: reportId,
        badge: '🎲 Результат броска: ' + rollRes.total,
        name: (d.label || 'Бросок') + ' (' + rollRes.formula + ')',
        meta: 'Кости: [' + rollRes.rolls.join(', ') + ']' + (rollRes.mod ? (' ' + (rollRes.mod > 0 ? '+' : '') + rollRes.mod) : '') + ' = ' + rollRes.total,
        canUndo: false,
        canOpen: false
      };
    }

    return null;
  }

  function executeTasksBatch(tasks, mode){
    if(!Array.isArray(tasks) || tasks.length === 0) return [];
    var reports = [];
    tasks.forEach(function(t, idx){
      try {
        var rep = executeSingleTask(t, mode, idx);
        if(rep) reports.push(rep);
      } catch(e){
        console.warn('[AiAssistant] Ошибка выполнения задачи:', e);
      }
    });
    if(reports.length > 0){
      try {
        if(typeof window.render === 'function') window.render();
        if(typeof window.paintShBar === 'function') window.paintShBar();
      } catch(e){}
    }
    return reports;
  }

  /* ---------- Запрос к Gemini с поддержкой набора задач ---------- */
  function sendPromptToGemini(userText){
    if(isBusy) return;
    var trimmed = String(userText || '').trim();
    if(!trimmed) return;

    var apiKey = getApiKey();
    if(!apiKey){
      var ok = promptApiKey();
      if(!ok) return;
      apiKey = getApiKey();
    }

    var mode = getActiveMode();
    var ctx = getModeContext(mode);
    var history = loadChatHistory(mode);

    // Добавляем сообщение пользователя
    history.push({
      role: 'user',
      text: trimmed,
      ts: Date.now()
    });
    saveChatHistory(mode, history);
    renderMessages();

    isBusy = true;
    updateBusyState();

    var recentTurns = history.slice(-8).map(function(m){
      return (m.role === 'user' ? 'Игрок: ' : 'Ассистент: ') + m.text;
    }).join('\n');

    var systemPrompt =
      'Ты — встроенный ИИ-Ассистент и исполнитель задач в приложении «Тактический компендиум».\n' +
      'Текущий активный раздел: ' + ctx.worldName + ' (код режима: "' + mode + '").\n' +
      'Твоя роль: ' + ctx.title + '.\n' +
      'Контекст активного персонажа игрока: ' + ctx.summary + '\n\n' +
      'ВАЖНЕЙШАЯ ИНСТРУКЦИЯ ПО ВЫПОЛНЕНИЮ ЗАДАЧ:\n' +
      'Если пользователь просит ДОБАВИТЬ, СОЗДАТЬ или СГЕНЕРИРОВАТЬ одну или несколько способностей, техник, заклинаний, боевых приёмов, рецептов/зелий, изменить статы героя, удалить запись или бросить кости — ты ОБЯЗАН заполнить массив "tasks", чтобы приложение автоматически создало и сохранило их!\n' +
      'Например, если пользователь пишет: "Добавь в способности атаку молнией и фаерболл" — ты создаёшь в массиве "tasks" ДВА объекта с "action": "add_ability" (первый — детально проработанная Атака молнией, второй — детально проработанный Огненный шар / Фаерболл), а в "reply" кратко отчитываешься о выполнении обоих заданий!\n\n' +
      'Допустимые значения "action" внутри элемента "tasks":\n' +
      '1. "add_ability" — добавить способность / классовое умение / знак ведьмака / технику шиноби / биотику / способность Силы.\n' +
      '   Поля внутри "item": {\n' +
      '     "name": "Название способности на русском",\n' +
      '     "icon": "Подходящий эмодзи (⚡, 🔥, ✨, 🛡️, 🩸 и т.д.)",\n' +
      '     "category": "Категория (для Фаэруна одно из: Классовые умения | Особенности вида | Черты (Feats) | Мистические и Божественные дары; для Ведьмака: Знаки ведьмака | Мутации и Испытание Травами | Высшая магия и Истоки; для Шиноби: Ниндзюцу | Гендзюцу | Кеккей Генкай)",\n' +
      '     "actionCost": "1 действие / 1 бонусное действие / 1 реакция / Пассивно",\n' +
      '     "cooldown": "Короткий или долгий отдых / На неограниченной основе / 3 ед. энергии",\n' +
      '     "checkOrSave": "Спасбросок Ловкости СЛ 15 / Бросок атаки заклинанием / —",\n' +
      '     "dmgN": число кубов урона (например 3 для 3d8, или 0 если без урона),\n' +
      '     "dmgD": "d6" | "d8" | "d10" | "d12",\n' +
      '     "dmgMod": числовой бонус к урону (например 0 или 4),\n' +
      '     "desc": "Подробное, атмосферное и механически точное описание способности (2-4 предложения с правилами урона, дистанции, спасброска и эффектов)"\n' +
      '   }\n' +
      '2. "add_move" — добавить боевой приём / приём фехтования / дуэльный приём.\n' +
      '   Поля внутри "item": {\n' +
      '     "name": "Название приёма",\n' +
      '     "icon": "⚔️",\n' +
      '     "category": "Оружейные атаки и Мастерство (2024) | Приёмы Мастера боевых искусств | Защитные и ответные стойки | Мобильность и тактика",\n' +
      '     "weaponOrStyle": "Оружие или боевой стиль",\n' +
      '     "attackBonus": "+6",\n' +
      '     "damageOrSave": "2d8+4 рубящего / Спасбросок Силы СЛ 15",\n' +
      '     "mastery": "Повалить (Topple) / Подрыв (Sap) / Прорубание (Cleave) / Выпад (Nick)",\n' +
      '     "actionCost": "Часть действия Атаки / 1 бонусное действие / 1 реакция",\n' +
      '     "trigger": "При попадании оружием ближнего боя",\n' +
      '     "desc": "Подробное описание техники удара и тактического эффекта"\n' +
      '   }\n' +
      '3. "add_recipe" — добавить алхимический рецепт / зелье / эликсир / бомбу / масло / яд.\n' +
      '   Поля внутри "item": {\n' +
      '     "name": "Название состава",\n' +
      '     "category": "potions" | "bombs" | "oils" | "poisons",\n' +
      '     "rarity": "Обычный" | "Необычный" | "Редкий" | "Очень редкий",\n' +
      '     "cost": число в ЗМ (например 150),\n' +
      '     "dc": число СЛ крафта (например 15),\n' +
      '     "time": "4 часа",\n' +
      '     "ingredients": [{"name": "Ингредиент 1", "qty": 1}, {"name": "Ингредиент 2", "qty": 2}],\n' +
      '     "appearance": "Внешний вид, цвет и запах",\n' +
      '     "effect": "Точный игровой эффект при применении"\n' +
      '   }\n' +
      '4. "add_spell" — добавить заклинание в Книгу заклинаний (item: { "name": "...", "level": 3, "school": "evocation", "effect": "..." }).\n' +
      '5. "delete_item" — удалить способность или приём по имени (item: { "name": "..." }).\n' +
      '6. "update_character" — обновить параметры героя (item: { "level": 5, "hpMax": 45, "ac": 18, "equipmentAppend": "..." }).\n' +
      '7. "roll_dice" — выполнить бросок костей (item: { "label": "Атака молнией", "formula": "3d8" }).\n\n' +
      'Ответь СТРОГО валидным JSON-объектом без markdown-обёрток:\n' +
      '{\n' +
      '  "reply": "Твой ответ игроку на русском языке (с отчётом о выполненных задачах или ответом на вопрос)",\n' +
      '  "tasks": [ ... список задач, если игрок просил что-то добавить/изменить/бросить, иначе [] ... ],\n' +
      '  "suggestedRolls": [ { "label": "Название броска", "formula": "1d20+6" } ]\n' +
      '}\n\n' +
      'История недавнего диалога:\n' + recentTurns + '\n\n' +
      'Текущий запрос игрока: ' + trimmed;

    fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-4-argon:generateContent?key=' + encodeURIComponent(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.75,
          responseMimeType: 'application/json'
        }
      })
    })
    .then(function(r){
      if(!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function(data){
      var rawText = '';
      try { rawText = data.candidates[0].content.parts[0].text || ''; } catch(e){}
      var cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      var parsed = null;
      try {
        parsed = JSON.parse(cleaned);
      } catch(e){
        var firstBrace = cleaned.indexOf('{');
        var lastBrace = cleaned.lastIndexOf('}');
        if(firstBrace !== -1 && lastBrace > firstBrace){
          try { parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)); } catch(e2){}
        }
      }
      if(!parsed || typeof parsed !== 'object'){
        parsed = { reply: rawText || 'Задача обработана.', tasks: [], suggestedRolls: [] };
      }

      var reports = executeTasksBatch(parsed.tasks || [], mode);
      var botMsg = {
        role: 'bot',
        text: parsed.reply || (reports.length ? 'Готово! Все задачи успешно выполнены.' : 'Готово.'),
        reports: reports,
        suggestedRolls: Array.isArray(parsed.suggestedRolls) ? parsed.suggestedRolls.slice(0, 4) : [],
        ts: Date.now()
      };

      var curHist = loadChatHistory(mode);
      curHist.push(botMsg);
      saveChatHistory(mode, curHist);
    })
    .catch(function(err){
      var curHist = loadChatHistory(mode);
      curHist.push({
        role: 'bot',
        text: '⚠️ Не удалось связаться с Gemini API (' + (err && err.message ? err.message : 'ошибка сети') + '). Проверьте ключ API кнопкой 🔑 в шапке чата.',
        reports: [],
        suggestedRolls: [],
        ts: Date.now()
      });
      saveChatHistory(mode, curHist);
    })
    .finally(function(){
      isBusy = false;
      updateBusyState();
      renderChatHeader();
      renderMessages();
    });
  }

  /* ---------- Отрисовка и управление DOM ---------- */
  function ensureDom(){
    if(document.getElementById('ttcAiFab')) return;

    var fab = document.createElement('button');
    fab.id = 'ttcAiFab';
    fab.type = 'button';
    fab.className = 'ttc-ai-fab';
    fab.title = 'Открыть ИИ-Ассистента и Агента задач';
    fab.innerHTML =
      '<span class="ttc-ai-fab-icon" id="ttcAiFabIcon">🐉</span>' +
      '<span class="ttc-ai-fab-badge">ИИ</span>';

    var chat = document.createElement('div');
    chat.id = 'ttcAiChat';
    chat.className = 'ttc-ai-chat';
    chat.innerHTML =
      '<div class="ttc-ai-header">' +
        '<div class="ttc-ai-header-left">' +
          '<div class="ttc-ai-avatar" id="ttcAiHdrIcon">🐉</div>' +
          '<div class="ttc-ai-title-wrap">' +
            '<div class="ttc-ai-title" id="ttcAiHdrTitle">ИИ-Ассистент</div>' +
            '<div class="ttc-ai-subtitle" id="ttcAiHdrSub">Фаэрун</div>' +
          '</div>' +
        '</div>' +
        '<div class="ttc-ai-header-actions">' +
          '<button type="button" class="ttc-ai-hdr-btn" id="ttcAiKeyBtn" title="Настроить ключ Google Gemini API">🔑</button>' +
          '<button type="button" class="ttc-ai-hdr-btn" id="ttcAiClearBtn" title="Очистить историю чата">🗑️</button>' +
          '<button type="button" class="ttc-ai-hdr-btn" id="ttcAiCloseBtn" title="Свернуть чат">✕</button>' +
        '</div>' +
      '</div>' +
      '<div class="ttc-ai-quick-bar">' +
        '<button type="button" class="ttc-ai-chip" data-ai-prefill="Добавь в способности: ">➕ В способности...</button>' +
        '<button type="button" class="ttc-ai-chip" data-ai-prefill="Добавь в боевые приёмы: ">⚔️ В приёмы...</button>' +
        '<button type="button" class="ttc-ai-chip" data-ai-prefill="Добавь в рецепты: ">🧪 В рецепты...</button>' +
        '<button type="button" class="ttc-ai-chip" data-ai-send="Подскажи лучшую боевую комбинацию из моих способностей и приёмов.">🎯 Комбо героя</button>' +
      '</div>' +
      '<div class="ttc-ai-messages" id="ttcAiMessages"></div>' +
      '<div class="ttc-ai-footer">' +
        '<textarea id="ttcAiInput" class="ttc-ai-input" rows="1" placeholder="Напр.: Добавь в способности атаку молнией и фаерболл..."></textarea>' +
        '<button type="button" id="ttcAiSendBtn" class="ttc-ai-send-btn">➤</button>' +
      '</div>';

    document.body.appendChild(fab);
    document.body.appendChild(chat);

    fab.addEventListener('click', function(){
      isOpen = !isOpen;
      chat.classList.toggle('open', isOpen);
      if(isOpen){
        renderChatHeader();
        renderMessages();
        var inp = document.getElementById('ttcAiInput');
        if(inp) setTimeout(function(){ inp.focus(); }, 80);
      }
    });

    document.getElementById('ttcAiCloseBtn').addEventListener('click', function(){
      isOpen = false;
      chat.classList.remove('open');
    });

    document.getElementById('ttcAiKeyBtn').addEventListener('click', function(){
      promptApiKey();
    });

    document.getElementById('ttcAiClearBtn').addEventListener('click', function(){
      var mode = getActiveMode();
      saveChatHistory(mode, []);
      renderMessages();
    });

    var inputEl = document.getElementById('ttcAiInput');
    var sendBtn = document.getElementById('ttcAiSendBtn');

    function triggerSend(){
      var val = inputEl.value;
      if(!val || !val.trim() || isBusy) return;
      inputEl.value = '';
      inputEl.style.height = '38px';
      sendPromptToGemini(val);
    }

    sendBtn.addEventListener('click', triggerSend);
    inputEl.addEventListener('keydown', function(e){
      if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        triggerSend();
      }
    });
    inputEl.addEventListener('input', function(){
      inputEl.style.height = '38px';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 110) + 'px';
    });

    chat.querySelectorAll('[data-ai-prefill]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var pref = btn.getAttribute('data-ai-prefill') || '';
        inputEl.value = pref;
        inputEl.focus();
      });
    });

    chat.querySelectorAll('[data-ai-send]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var msg = btn.getAttribute('data-ai-send') || '';
        if(msg) sendPromptToGemini(msg);
      });
    });

    renderChatHeader();
    renderMessages();
  }

  function updateBusyState(){
    var fab = document.getElementById('ttcAiFab');
    var sendBtn = document.getElementById('ttcAiSendBtn');
    if(fab) fab.classList.toggle('is-busy', isBusy);
    if(sendBtn){
      sendBtn.disabled = isBusy;
      sendBtn.textContent = isBusy ? '⏳' : '➤';
    }
  }

  function renderChatHeader(){
    var ctx = getModeContext(getActiveMode());
    var fabIcon = document.getElementById('ttcAiFabIcon');
    var hdrIcon = document.getElementById('ttcAiHdrIcon');
    var hdrTitle = document.getElementById('ttcAiHdrTitle');
    var hdrSub = document.getElementById('ttcAiHdrSub');
    if(fabIcon) fabIcon.textContent = ctx.icon;
    if(hdrIcon) hdrIcon.textContent = ctx.icon;
    if(hdrTitle) hdrTitle.textContent = ctx.title;
    if(hdrSub) hdrSub.textContent = ctx.heroName + ' • ' + ctx.heroSub;
  }

  function renderMessages(){
    var box = document.getElementById('ttcAiMessages');
    if(!box) return;
    var mode = getActiveMode();
    var ctx = getModeContext(mode);
    var history = loadChatHistory(mode);

    var html = '';
    if(history.length === 0){
      html +=
        '<div class="ttc-ai-msg bot">' +
          '<div class="ttc-ai-msg-text">' +
            '<p>Приветствую! Я <b>' + escHtml(ctx.title) + '</b> (' + escHtml(ctx.worldName) + ').</p>' +
            '<p>Я вижу досье твоего персонажа (<b>' + escHtml(ctx.heroName) + '</b>) и умею <b>выполнять пакетные задачи</b>.</p>' +
            '<p style="color:#94a3b8;font-size:12px;">Примеры команд:<br>' +
            '• <i>«Добавь в способности атаку молнией и фаерболл»</i><br>' +
            '• <i>«Создай боевой приём вихрь стали и зелье ночного зрения»</i><br>' +
            '• <i>«Какую связку моих приёмов лучше применить в бою?»</i></p>' +
          '</div>' +
        '</div>';
    } else {
      history.forEach(function(m){
        if(m.role === 'user'){
          html += '<div class="ttc-ai-msg user">' + escHtml(m.text) + '</div>';
        } else {
          var reportsHtml = '';
          if(Array.isArray(m.reports) && m.reports.length > 0){
            reportsHtml =
              '<div class="ttc-ai-task-report">' +
                '<div class="ttc-ai-task-report-hdr">📋 Отчёт выполнения задач (' + m.reports.length + ')</div>' +
                m.reports.map(function(r){
                  var isUndone = !!r.undone;
                  var hasReg = !!(r.reportId && taskRegistry[r.reportId]);
                  return '<div class="ttc-ai-task-card ' + (isUndone ? 'undone' : '') + '" data-report-card="' + escHtml(r.reportId || '') + '">' +
                    '<div class="ttc-ai-task-top">' +
                      '<span class="ttc-ai-task-badge">' + escHtml(isUndone ? 'Отменено' : r.badge) + '</span>' +
                    '</div>' +
                    '<div class="ttc-ai-task-name">' + escHtml(r.name) + '</div>' +
                    (r.meta ? '<div class="ttc-ai-task-meta">' + escHtml(r.meta) + '</div>' : '') +
                    (!isUndone && hasReg ? (
                      '<div class="ttc-ai-task-actions">' +
                        (r.canOpen ? '<button type="button" class="ttc-ai-task-btn" data-ai-task-open="' + escHtml(r.reportId) + '">Открыть →</button>' : '') +
                        (r.canUndo ? '<button type="button" class="ttc-ai-task-btn undo" data-ai-task-undo="' + escHtml(r.reportId) + '">Отменить</button>' : '') +
                      '</div>'
                    ) : '') +
                  '</div>';
                }).join('') +
              '</div>';
          }

          var rollsHtml = '';
          if(Array.isArray(m.suggestedRolls) && m.suggestedRolls.length > 0){
            rollsHtml =
              '<div class="ttc-ai-roll-bar">' +
                m.suggestedRolls.map(function(sr){
                  return '<button type="button" class="ttc-ai-roll-btn" data-ai-roll-formula="' + escHtml(sr.formula || '1d20') + '" data-ai-roll-label="' + escHtml(sr.label || 'Бросок') + '">' +
                    '🎲 ' + escHtml(sr.label || 'Бросить') + ' (' + escHtml(sr.formula || '1d20') + ')' +
                  '</button>';
                }).join('') +
              '</div>';
          }

          html +=
            '<div class="ttc-ai-msg bot">' +
              '<div class="ttc-ai-msg-text">' + formatBotText(m.text) + '</div>' +
              reportsHtml +
              rollsHtml +
            '</div>';
        }
      });
    }

    if(isBusy){
      html +=
        '<div class="ttc-ai-msg bot">' +
          '<div class="ttc-ai-msg-text" style="color:var(--ai-accent-bright);">⚙️ Выполняю задачи и генерирую ответ через ИИ...</div>' +
        '</div>';
    }

    box.innerHTML = html;
    box.scrollTop = box.scrollHeight;

    // Привязка кнопок Открыть / Отменить в карточках задач
    box.querySelectorAll('[data-ai-task-open]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var rId = btn.getAttribute('data-ai-task-open');
        var reg = taskRegistry[rId];
        if(reg && typeof reg.open === 'function'){
          reg.open();
        }
      });
    });

    box.querySelectorAll('[data-ai-task-undo]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var rId = btn.getAttribute('data-ai-task-undo');
        var reg = taskRegistry[rId];
        if(reg && typeof reg.undo === 'function'){
          reg.undo();
          delete taskRegistry[rId];
          var hist = loadChatHistory(mode);
          hist.forEach(function(msg){
            if(Array.isArray(msg.reports)){
              msg.reports.forEach(function(rep){
                if(rep.reportId === rId) rep.undone = true;
              });
            }
          });
          saveChatHistory(mode, hist);
          if(typeof window.render === 'function') window.render();
          renderMessages();
        }
      });
    });

    // Привязка кнопок быстрого броска кубиков из чата
    box.querySelectorAll('[data-ai-roll-formula]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var f = btn.getAttribute('data-ai-roll-formula') || '1d20';
        var lbl = btn.getAttribute('data-ai-roll-label') || 'Бросок';
        var rep = executeSingleTask({ action: 'roll_dice', item: { formula: f, label: lbl } }, mode, 0);
        if(rep){
          var hist = loadChatHistory(mode);
          hist.push({
            role: 'bot',
            text: 'Выполнен бросок <b>' + escHtml(lbl) + '</b>:',
            reports: [rep],
            suggestedRolls: [],
            ts: Date.now()
          });
          saveChatHistory(mode, hist);
          renderMessages();
        }
      });
    });
  }

  function initAiAssistant(){
    ensureDom();
    // Подписываемся на переключения режимов через paintShBar
    if(typeof window.paintShBar === 'function' && !window.paintShBar.__aiWrapped){
      var origPaint = window.paintShBar;
      var wrapped = function(){
        var res = origPaint.apply(this, arguments);
        renderChatHeader();
        if(isOpen) renderMessages();
        return res;
      };
      wrapped.__aiWrapped = true;
      window.paintShBar = wrapped;
      if(window.SH) window.SH.paintShBar = wrapped;
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAiAssistant);
  } else {
    initAiAssistant();
  }

  window.AiAssistant = {
    open: function(){ ensureDom(); isOpen = true; document.getElementById('ttcAiChat').classList.add('open'); renderChatHeader(); renderMessages(); },
    close: function(){ isOpen = false; var c = document.getElementById('ttcAiChat'); if(c) c.classList.remove('open'); },
    refresh: function(){ renderChatHeader(); if(isOpen) renderMessages(); },
    send: sendPromptToGemini
  };
})();
