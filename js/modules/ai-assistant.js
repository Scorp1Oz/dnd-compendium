/* ==========================================================================
   КОНТЕКСТНЫЙ ИИ-АССИСТЕНТ И АГЕНТ ЗАДАЧ С ОСМОТРОМ КОДА И DOM (ВСЕ 8 РАЗДЕЛОВ)
   Кружок справа внизу (FAB) + летающий чат с универсальным исполнителем
   ========================================================================== */
(function(){
  'use strict';

  var CHAT_STORAGE_PREFIX = 'ttc_ai_assistant_chat_v2_';
  var isOpen = false;
  var isBusy = false;
  var busyStatusText = '⚙️ Анализирую запрос и выполняю задачи...';
  var taskRegistry = {};

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

  /* ---------- 1. СИНХРОНИЗАЦИЯ НЕСОХРАНЁННЫХ ПОЛЕЙ DOM ПЕРЕД ИЗМЕНЕНИЯМИ ---------- */
  function syncDomInputsToState(mode){
    var m = mode || getActiveMode();
    var g = function(id){ return document.getElementById(id); };
    try {
      if(m === 'wi' && window.WI && typeof window.WI.getActiveProfile === 'function'){
        var wp = window.WI.getActiveProfile();
        if(wp && g('wiDataInName')){
          wp.name = g('wiDataInName').value.trim();
          if(g('wiDataInSchool')) wp.school = g('wiDataInSchool').value.trim();
          if(g('wiDataInTitle')) wp.title = g('wiDataInTitle').value.trim();
          if(g('wiDataInLevel')) wp.level = parseInt(g('wiDataInLevel').value, 10) || 1;
          if(g('wiDataInHp')){ wp.hp = parseInt(g('wiDataInHp').value, 10) || 0; wp.maxHp = wp.hp; }
          if(g('wiDataInAc')) wp.ac = parseInt(g('wiDataInAc').value, 10) || 10;
          if(g('wiDataInEnergy')){ wp.energy = parseInt(g('wiDataInEnergy').value, 10) || 50; wp.maxEnergy = wp.energy; }
          if(g('wiDataInSilverSword')) wp.silverSword = g('wiDataInSilverSword').value.trim();
          if(g('wiDataInSteelSword')) wp.steelSword = g('wiDataInSteelSword').value.trim();
          if(g('wiDataInArmor')) wp.armor = g('wiDataInArmor').value.trim();
          if(g('wiDataInNotes')) wp.notes = g('wiDataInNotes').value.trim();
          window.WI.saveProfile(wp);
        }
      } else if(m === 'sh' && window.SH){
        var sp = (typeof window.SH.getActiveProfile === 'function') ? window.SH.getActiveProfile() : null;
        if(g('shDataInName')){
          var fields = [
            ['shDataInName', 'charName'],
            ['shDataInClan', 'clan'],
            ['shDataInVillage', 'village'],
            ['shDataInRank', 'rank'],
            ['shDataInLevel', 'level'],
            ['shDataInNature', 'nature'],
            ['shDataInChakra', 'chakra'],
            ['shDataInHp', 'hp'],
            ['shDataInAc', 'ac']
          ];
          fields.forEach(function(pair){
            var el = g(pair[0]);
            if(el){
              window.SH.meta[pair[1]] = el.value;
              if(sp) sp[pair[1]] = el.value;
            }
          });
          if(typeof window.SH.saveMeta === 'function') window.SH.saveMeta();
          if(typeof window.SH.saveProfilesList === 'function') window.SH.saveProfilesList(window.SH.profiles);
        }
      } else if(m === 'wz' && window.WZ && typeof window.WZ.getActiveProfile === 'function'){
        var zp = window.WZ.getActiveProfile();
        if(zp && g('wzDataInFirstName')){
          zp.firstName = g('wzDataInFirstName').value.trim();
          if(g('wzDataInLastName')) zp.lastName = g('wzDataInLastName').value.trim();
          zp.name = [zp.firstName, zp.lastName].filter(Boolean).join(' ') || zp.name || '';
          if(g('wzDataInHouse')) zp.house = g('wzDataInHouse').value.trim();
          if(g('wzDataInYear')) zp.year = g('wzDataInYear').value.trim();
          if(g('wzDataInTitle')) zp.title = g('wzDataInTitle').value.trim();
          if(g('wzDataInHp')){ zp.hp = parseInt(g('wzDataInHp').value, 10) || 20; zp.maxHp = zp.hp; }
          if(g('wzDataInAc')) zp.ac = parseInt(g('wzDataInAc').value, 10) || 10;
          if(!zp.wand || typeof zp.wand !== 'object') zp.wand = {};
          if(g('wzDataInWandName')) zp.wand.name = g('wzDataInWandName').value.trim();
          if(g('wzDataInWandWood')) zp.wand.wood = g('wzDataInWandWood').value.trim();
          if(g('wzDataInWandCore')) zp.wand.core = g('wzDataInWandCore').value.trim();
          if(g('wzDataInWandLength')) zp.wand.length = g('wzDataInWandLength').value.trim();
          if(g('wzDataInWandFlex')) zp.wand.flexibility = g('wzDataInWandFlex').value.trim();
          if(g('wzDataInWandFeatures')) zp.wand.features = g('wzDataInWandFeatures').value.trim();
          window.WZ.saveProfiles();
        }
      } else if(m === 'el' && window.EL && typeof window.EL.getProfile === 'function'){
        var ep = window.EL.getProfile();
        if(ep && g('elProfFirstName')){
          ep.firstName = g('elProfFirstName').value.trim();
          if(g('elProfLastName')) ep.lastName = g('elProfLastName').value.trim();
          if(g('elProfElement')) ep.element = g('elProfElement').value;
          if(g('elProfLevel')) ep.level = parseInt(g('elProfLevel').value, 10) || 1;
          if(g('elProfHp')) ep.hp = parseInt(g('elProfHp').value, 10) || 12;
          if(g('elProfAc')) ep.ac = parseInt(g('elProfAc').value, 10) || 10;
          if(g('elProfNote')) ep.note = g('elProfNote').value;
          window.EL.saveProfile(ep);
        }
      } else if(m === 'me' && window.ME && typeof window.ME.getChar === 'function'){
        var mc = window.ME.getChar();
        if(mc && g('meEditName')){
          mc.name = g('meEditName').value;
          if(g('meEditCallsign')) mc.callsign = g('meEditCallsign').value;
          if(g('meEditRace')) mc.race = g('meEditRace').value;
          if(g('meEditRole')) mc.role = g('meEditRole').value;
          if(g('meEditOrigin')) mc.origin = g('meEditOrigin').value;
          if(g('meEditBio')) mc.biochemistry = g('meEditBio').value;
          if(g('meEditLevel')) mc.level = parseInt(g('meEditLevel').value, 10) || 1;
          if(g('meEditDevPoints')) mc.devPoints = parseInt(g('meEditDevPoints').value, 10) || 0;
          if(g('meEditProf')) mc.profBonus = parseInt(g('meEditProf').value, 10) || 2;
          if(g('meEditAc')) mc.baseAc = parseInt(g('meEditAc').value, 10) || 10;
          if(g('meEditShield')) mc.baseShield = parseInt(g('meEditShield').value, 10) || 0;
          if(g('meEditArmor')) mc.baseArmorPoints = parseInt(g('meEditArmor').value, 10) || 0;
          if(g('meEditDt')) mc.damageThreshold = parseInt(g('meEditDt').value, 10) || 0;
          if(g('meEditBarrier')) mc.baseBarrier = parseInt(g('meEditBarrier').value, 10) || 0;
          if(g('meEditHp')) mc.maxHp = parseInt(g('meEditHp').value, 10) || 10;
          if(g('meEditLoadout')) mc.loadout = g('meEditLoadout').value;
          if(g('meEditOmni')) mc.omniTool = g('meEditOmni').value;
          if(g('meEditBioAmp')) mc.bioAmp = g('meEditBioAmp').value;
          if(g('meEditBg')) mc.background = g('meEditBg').value;
          window.ME.saveChar(mc);
        }
      }
    } catch(e){}
  }

  /* ---------- 2. ОСМОТР DOM ТЕКУЩЕГО ЭКРАНА И КОДА ПРИЛОЖЕНИЯ ---------- */
  function inspectLiveDom(){
    var app = document.getElementById('app');
    if(!app) return 'DOM #app не найден';
    var items = [];
    var controls = app.querySelectorAll('input, select, textarea');
    controls.forEach(function(el, i){
      if(i >= 60) return;
      if(el.type === 'file' || el.type === 'password') return;
      var id = el.id ? ('#' + el.id) : '';
      var df = el.getAttribute('data-field') ? ('[data-field="' + el.getAttribute('data-field') + '"]') : '';
      var da = el.getAttribute('data-ability') ? ('[data-ability="' + el.getAttribute('data-ability') + '"]') : '';
      var ds = el.getAttribute('data-stat') ? ('[data-stat="' + el.getAttribute('data-stat') + '"]') : '';
      var dsl = el.getAttribute('data-slot-level') ? ('[data-slot-level="' + el.getAttribute('data-slot-level') + '"]') : '';
      var sel = id || df || da || ds || dsl;
      if(!sel) return;
      var lbl = '';
      var parentField = el.closest('.field, .combat-box, .ability-box, .sh-hud-edit-item, div');
      if(parentField){
        var lEl = parentField.querySelector('label, .cb-label, .ab-name, .sb-label');
        if(lEl) lbl = lEl.textContent.trim();
      }
      var val = (el.type === 'checkbox') ? String(el.checked) : String(el.value || '').slice(0, 80);
      items.push(sel + (lbl ? (' (' + lbl + ')') : '') + ' = ' + JSON.stringify(val));
    });
    return items.length ? items.join('\n') : 'На текущем экране нет открытых полей ввода';
  }

  function inspectCodeSymbols(symbols){
    if(!Array.isArray(symbols) || !symbols.length) return '';
    var out = [];
    symbols.slice(0, 6).forEach(function(sym){
      var name = String(sym || '').trim();
      if(!name) return;
      try {
        var parts = name.split('.');
        var ref = window;
        for(var i = 0; i < parts.length; i++){
          if(ref == null) break;
          ref = ref[parts[i]];
        }
        if(typeof ref === 'function'){
          out.push('=== FUNCTION ' + name + ' ===\n' + ref.toString().slice(0, 3500));
        } else if(ref && typeof ref === 'object'){
          var keys = Object.keys(ref);
          var preview = {};
          keys.slice(0, 40).forEach(function(k){
            var v = ref[k];
            preview[k] = typeof v === 'function' ? '[Function]' : (Array.isArray(v) ? ('[Array(' + v.length + ')]') : v);
          });
          out.push('=== OBJECT ' + name + ' ===\n' + JSON.stringify(preview, null, 2).slice(0, 3000));
        } else {
          out.push('=== ' + name + ' ===\nЗначение: ' + String(ref));
        }
      } catch(e){
        out.push('=== ' + name + ' ===\nОшибка осмотра: ' + e.message);
      }
    });
    return out.join('\n\n');
  }

  /* ---------- 3. ПОЛНЫЙ СЛЕПОК СОСТОЯНИЯ АКТИВНОГО РАЗДЕЛА ---------- */
  function getModeContext(mode){
    var m = mode || getActiveMode();
    syncDomInputsToState(m);

    if(m === 'wi'){
      var wiP = (window.WI && typeof window.WI.getActiveProfile === 'function') ? window.WI.getActiveProfile() : {};
      if(window.WI && typeof window.WI.loadTechs === 'function') window.WI.loadTechs();
      if(window.WI && typeof window.WI.loadMoves === 'function') window.WI.loadMoves();
      var wiTechs = (window.WI && Array.isArray(window.WI.techs)) ? window.WI.techs : [];
      var wiMoves = (window.WI && Array.isArray(window.WI.moves)) ? window.WI.moves : [];
      var cloneWi = Object.assign({}, wiP);
      delete cloneWi.techs;
      delete cloneWi.moves;
      return {
        mode: 'wi',
        icon: '🐺',
        title: 'Хронист Континента',
        worldName: 'Ведьмак (Неверлэнд)',
        heroName: (wiP && wiP.name) ? wiP.name : 'Безымянный ведьмак',
        heroSub: [wiP && wiP.school, wiP && wiP.title, wiP && wiP.level ? (wiP.level + ' ур.') : ''].filter(Boolean).join(' • ') || 'Ведьмак',
        fullStateJson: JSON.stringify({
          profile: cloneWi,
          worldMeta: window.WI ? window.WI.meta : {},
          availableThemes: ['wolf', 'wildhunt', 'north', 'nilfgaard', 'scoiatael', 'skellige', 'syndicate', 'dragon'],
          techs: wiTechs.map(function(t){ return { id: t.id, name: t.name, cat: t.cat, cost: t.cost, dmg: (t.dmgN ? (t.dmgN + t.dmgD) : '') }; }),
          moves: wiMoves.map(function(x){ return { id: x.id, name: x.name, kind: x.kind, action: x.action }; })
        }, null, 2)
      };
    }

    if(m === 'sh'){
      var shP = (window.SH && typeof window.SH.getActiveProfile === 'function') ? window.SH.getActiveProfile() : {};
      var shMeta = (window.SH && window.SH.meta) ? window.SH.meta : {};
      var shTechs = (window.SH && Array.isArray(window.SH.techs)) ? window.SH.techs : [];
      var shMoves = (window.SH && Array.isArray(window.SH.moves)) ? window.SH.moves : [];
      var shSkills = (window.SH && Array.isArray(window.SH.skills)) ? window.SH.skills : [];
      return {
        mode: 'sh',
        icon: '🌀',
        title: 'Тактический советник Шиноби',
        worldName: 'Мир Шиноби',
        heroName: shMeta.charName || shP.charName || 'Шиноби',
        heroSub: [shMeta.clan, shMeta.rank, shMeta.level ? (shMeta.level + ' ур.') : ''].filter(Boolean).join(' • ') || 'Ниндзя',
        fullStateJson: JSON.stringify({
          profile: {
            charName: shMeta.charName || shP.charName || '',
            clan: shMeta.clan || shP.clan || '',
            village: shMeta.village || shP.village || 'Коноха',
            rank: shMeta.rank || shP.rank || 'Генин',
            level: shMeta.level || shP.level || '1',
            nature: shMeta.nature || shP.nature || '',
            chakra: shMeta.chakra || shP.chakra || '30',
            hp: shMeta.hp || shP.hp || '28',
            ac: shMeta.ac || shP.ac || '14',
            notes: shP.notes || '',
            worldName: shMeta.name || '',
            worldNote: shMeta.note || ''
          },
          techs: shTechs.map(function(t){ return { id: t.id, name: t.name, rank: t.rank, cat: t.cat, nature: t.nature, cost: t.cost }; }),
          moves: shMoves.map(function(x){ return { id: x.id, name: x.name, kind: x.kind, dmg: x.dmg }; }),
          skills: shSkills.map(function(s){ return { id: s.id, name: s.name }; })
        }, null, 2)
      };
    }

    if(m === 'me'){
      var meC = (window.ME && typeof window.ME.getChar === 'function') ? window.ME.getChar() : {};
      var mePow = (window.ME && typeof window.ME.getPowers === 'function') ? window.ME.getPowers() : [];
      var meArs = (window.ME && typeof window.ME.getArsenal === 'function') ? window.ME.getArsenal() : [];
      return {
        mode: 'me',
        icon: '🚀',
        title: 'Тактический ВИ «Омни-Узел»',
        worldName: 'Mass Effect',
        heroName: (meC && meC.name) ? meC.name : 'Оперативник N7',
        heroSub: [meC && meC.role, meC && meC.level ? (meC.level + ' ур.') : ''].filter(Boolean).join(' • ') || 'Спектр',
        fullStateJson: JSON.stringify({
          character: meC,
          powers: mePow.map(function(p){ return { id: p.id, name: p.name, branch: p.branch, cd: p.cd }; }),
          arsenal: meArs.map(function(w){ return { id: w.id, name: w.name, type: w.type, dmg: w.dmg }; })
        }, null, 2)
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
        fullStateJson: JSON.stringify({
          profile: elP,
          allowedElements: ['Земля', 'Огонь', 'Вода', 'Ветер', 'Тьма', 'Аватар', 'Без стихии'],
          techs: elT.map(function(t){ return { id: t.id, name: t.name, element: t.element, damage: t.damage }; }),
          moves: elM.map(function(x){ return { id: x.id, name: x.name, kind: x.kind, effect: x.effect }; })
        }, null, 2)
      };
    }

    if(m === 'wz'){
      var wzP = (window.WZ && typeof window.WZ.getActiveProfile === 'function') ? window.WZ.getActiveProfile() : {};
      var wzSp = (window.WZ && Array.isArray(window.WZ.spells)) ? window.WZ.spells : [];
      var wzDu = (window.WZ && Array.isArray(window.WZ.duels)) ? window.WZ.duels : [];
      var wzSk = (window.WZ && Array.isArray(window.WZ.skills)) ? window.WZ.skills : [];
      var wzPot = (window.WZ && Array.isArray(window.WZ.potions)) ? window.WZ.potions : [];
      return {
        mode: 'wz',
        icon: '🪄',
        title: 'Архивариус Хогвартса',
        worldName: 'Волшебный мир',
        heroName: (wzP && wzP.name) ? wzP.name : 'Волшебник',
        heroSub: [wzP && wzP.house, wzP && wzP.year].filter(Boolean).join(' • ') || 'Хогвартс',
        fullStateJson: JSON.stringify({
          profile: wzP,
          spells: wzSp.map(function(s){ return { id: s.id, name: s.name, incantation: s.incantation, cat: s.cat }; }),
          duels: wzDu.map(function(d){ return { id: d.id, name: d.name, kind: d.kind }; }),
          skills: wzSk.map(function(s){ return { id: s.id, name: s.name, kind: s.kind }; }),
          potions: wzPot.map(function(p){ return { id: p.id, name: p.name, tier: p.tier }; })
        }, null, 2)
      };
    }

    if(m === 'sw'){
      var swP = (window.SW && typeof window.SW.getActiveProfile === 'function') ? window.SW.getActiveProfile() : {};
      var swT = (window.SW && Array.isArray(window.SW.techs)) ? window.SW.techs : [];
      var swM = (window.SW && Array.isArray(window.SW.moves)) ? window.SW.moves : [];
      var swS = (window.SW && Array.isArray(window.SW.skills)) ? window.SW.skills : [];
      var cloneSw = Object.assign({}, swP);
      delete cloneSw.techs; delete cloneSw.moves; delete cloneSw.skills;
      return {
        mode: 'sw',
        icon: '⚔️',
        title: 'Голокрон Архивов',
        worldName: 'Звёздные войны',
        heroName: (swP && swP.name) ? swP.name : 'Адепт Силы',
        heroSub: [swP && swP.path, swP && swP.level ? (swP.level + ' ур.') : ''].filter(Boolean).join(' • ') || 'Джедай / Ситх',
        fullStateJson: JSON.stringify({
          profile: cloneSw,
          theme: (window.SW && typeof window.SW.getTheme === 'function') ? window.SW.getTheme() : 'jedi',
          techs: swT.map(function(t){ return { id: t.id, name: t.name, side: t.side, rank: t.rank }; }),
          moves: swM.map(function(x){ return { id: x.id, name: x.name, category: x.category }; }),
          skills: swS.map(function(s){ return { id: s.id, name: s.name, rank: s.rank }; })
        }, null, 2)
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
        heroSub: (hbChar && hbChar.f && hbChar.f.job) ? hbChar.f.job : ('Записей: ' + hbRecs.length),
        fullStateJson: JSON.stringify({
          world: window.HB ? window.HB.world : {},
          activeCharacter: hbChar || null,
          recordsSummary: hbRecs.map(function(r){ return { id: r.id, type: r.type, name: r.name, subtitle: r.subtitle }; })
        }, null, 2)
      };
    }

    // По умолчанию: Фаэрун (D&D 2024)
    var faeC = (typeof window.getActiveFaerunCharacter === 'function') ? window.getActiveFaerunCharacter() : null;
    var faeTechs = (faeC && Array.isArray(faeC.techs)) ? faeC.techs : [];
    var faeMoves = (faeC && Array.isArray(faeC.moves)) ? faeC.moves : [];
    var faeRecipes = (typeof window.RECIPES !== 'undefined' && Array.isArray(window.RECIPES)) ? window.RECIPES : [];
    var cloneFae = Object.assign({}, faeC || {});
    delete cloneFae.techs;
    delete cloneFae.moves;
    return {
      mode: 'faerun',
      icon: '🐉',
      title: 'Советник Кэндлкипа',
      worldName: 'Фаэрун (D&D 2024)',
      heroName: (faeC && faeC.name) ? faeC.name : 'Искатель приключений',
      heroSub: [faeC && faeC.species, faeC && faeC.className ? (faeC.className + ' ' + (faeC.level || 1) + ' ур.') : '', faeC && faeC.subclass].filter(Boolean).join(' • ') || 'Герой D&D 5e',
      fullStateJson: JSON.stringify({
        character: cloneFae,
        techs: faeTechs.map(function(t){ return { id: t.id, name: t.name, category: t.category, actionCost: t.actionCost }; }),
        moves: faeMoves.map(function(x){ return { id: x.id, name: x.name, category: x.category, damageOrSave: x.damageOrSave }; }),
        recipes: faeRecipes.map(function(r){ return { id: r.id, name: r.name, category: r.category, rarity: r.rarity }; })
      }, null, 2)
    };
  }

  /* ---------- 4. УНИВЕРСАЛЬНЫЙ ПАТЧЕР ПЕРСОНАЖА ДЛЯ ВСЕХ 8 РАЗДЕЛОВ ---------- */
  function applyCharacterPatch(d, mode){
    var m = mode || getActiveMode();
    var changes = [];
    if(!d || typeof d !== 'object') return changes;

    // Режим 1: ВЕДЬМАК (wi)
    if(m === 'wi' && window.WI && typeof window.WI.getActiveProfile === 'function'){
      var wp = window.WI.getActiveProfile();
      if(wp){
        if(d.name != null){ wp.name = String(d.name); changes.push('Имя: ' + wp.name); }
        if(d.school != null || d.className != null){ wp.school = String(d.school != null ? d.school : d.className); changes.push('Школа: ' + wp.school); }
        if(d.title != null || d.subclass != null || d.role != null){
          wp.title = String(d.title != null ? d.title : (d.subclass != null ? d.subclass : d.role));
          changes.push('Титул/Роль: ' + wp.title);
        }
        if(d.level != null){ wp.level = parseInt(d.level, 10) || 1; changes.push('Уровень: ' + wp.level); }
        var newHp = d.hp != null ? d.hp : (d.hpMax != null ? d.hpMax : d.maxHp);
        if(newHp != null){ wp.hp = parseInt(newHp, 10) || 0; wp.maxHp = wp.hp; changes.push('HP: ' + wp.hp); }
        if(d.ac != null || d.armorClass != null){ wp.ac = parseInt(d.ac != null ? d.ac : d.armorClass, 10) || 10; changes.push('КБ: ' + wp.ac); }
        var newEn = d.energy != null ? d.energy : (d.maxEnergy != null ? d.maxEnergy : (d.vigor != null ? d.vigor : d.stamina));
        if(newEn != null){ wp.energy = parseInt(newEn, 10) || 50; wp.maxEnergy = wp.energy; changes.push('Энергия: ' + wp.energy); }
        if(d.silverSword != null){ wp.silverSword = String(d.silverSword); changes.push('Серебряный меч: ' + wp.silverSword); }
        if(d.steelSword != null || d.weapon != null){ wp.steelSword = String(d.steelSword != null ? d.steelSword : d.weapon); changes.push('Стальной меч: ' + wp.steelSword); }
        if(d.armor != null || d.equipment != null){ wp.armor = String(d.armor != null ? d.armor : d.equipment); changes.push('Доспех: ' + wp.armor); }
        if(d.notes != null || d.backstory != null){ wp.notes = String(d.notes != null ? d.notes : d.backstory); changes.push('Заметки обновлены'); }
        if(d.notesAppend){ wp.notes = wp.notes ? (wp.notes + '\n' + d.notesAppend) : String(d.notesAppend); changes.push('+ Заметка'); }
        window.WI.saveProfile(wp);
      }
      if(d.worldName != null && window.WI.meta){ window.WI.meta.name = String(d.worldName); window.WI.saveMeta(); changes.push('Мир: ' + d.worldName); }
      if(d.worldNote != null && window.WI.meta){ window.WI.meta.note = String(d.worldNote); window.WI.saveMeta(); changes.push('Заметка мира обновлена'); }
      if(d.theme && typeof window.WI.setTheme === 'function'){ window.WI.setTheme(String(d.theme)); changes.push('Тема: ' + d.theme); }
      return changes;
    }

    // Режим 2: ШИНОБИ (sh)
    if(m === 'sh' && window.SH){
      var sp = (typeof window.SH.getActiveProfile === 'function') ? window.SH.getActiveProfile() : null;
      var sm = window.SH.meta || {};
      var setSh = function(key, val, label){
        sm[key] = String(val);
        if(sp) sp[key] = String(val);
        changes.push(label + ': ' + val);
      };
      if(d.charName != null || d.name != null) setSh('charName', d.charName != null ? d.charName : d.name, 'Имя');
      if(d.clan != null || d.species != null || d.className != null) setSh('clan', d.clan != null ? d.clan : (d.species != null ? d.species : d.className), 'Клан');
      if(d.village != null || d.background != null) setSh('village', d.village != null ? d.village : d.background, 'Деревня');
      if(d.rank != null || d.title != null || d.subclass != null) setSh('rank', d.rank != null ? d.rank : (d.title != null ? d.title : d.subclass), 'Ранг');
      if(d.level != null) setSh('level', d.level, 'Уровень');
      if(d.nature != null || d.element != null) setSh('nature', d.nature != null ? d.nature : d.element, 'Стихия чакры');
      if(d.chakra != null || d.energy != null) setSh('chakra', d.chakra != null ? d.chakra : d.energy, 'Чакра');
      var shHp = d.hp != null ? d.hp : (d.hpMax != null ? d.hpMax : d.maxHp);
      if(shHp != null) setSh('hp', shHp, 'HP');
      if(d.ac != null) setSh('ac', d.ac, 'КБ');
      if(d.notes != null && sp){ sp.notes = String(d.notes); changes.push('Заметки обновлены'); }
      if(d.worldName != null){ sm.name = String(d.worldName); changes.push('Мир: ' + sm.name); }
      if(d.worldNote != null){ sm.note = String(d.worldNote); changes.push('Заметка мира обновлена'); }
      if(typeof window.SH.saveMeta === 'function') window.SH.saveMeta();
      if(typeof window.SH.saveProfilesList === 'function') window.SH.saveProfilesList(window.SH.profiles);
      if(typeof window.updateShinobiTheme === 'function') window.updateShinobiTheme();
      return changes;
    }

    // Режим 3: MASS EFFECT (me)
    if(m === 'me' && window.ME && typeof window.ME.getChar === 'function'){
      var mc = window.ME.getChar();
      if(mc){
        if(d.name != null){ mc.name = String(d.name); changes.push('Имя: ' + mc.name); }
        if(d.callsign != null || d.title != null){ mc.callsign = String(d.callsign != null ? d.callsign : d.title); changes.push('Позывной: ' + mc.callsign); }
        if(d.race != null || d.species != null){ mc.race = String(d.race != null ? d.race : d.species); changes.push('Раса: ' + mc.race); }
        if(d.role != null || d.className != null){ mc.role = String(d.role != null ? d.role : d.className); changes.push('Класс: ' + mc.role); }
        if(d.origin != null || d.background != null){ mc.origin = String(d.origin != null ? d.origin : d.background); changes.push('Происхождение: ' + mc.origin); }
        if(d.biochemistry != null){ mc.biochemistry = String(d.biochemistry); changes.push('Биохимия: ' + mc.biochemistry); }
        if(d.level != null){ mc.level = parseInt(d.level, 10) || 1; changes.push('Уровень: ' + mc.level); }
        if(d.devPoints != null){ mc.devPoints = parseInt(d.devPoints, 10) || 0; changes.push('Очки развития: ' + mc.devPoints); }
        if(d.profBonus != null){ mc.profBonus = parseInt(d.profBonus, 10) || 2; changes.push('БМ: +' + mc.profBonus); }
        if(d.baseAc != null || d.ac != null){ mc.baseAc = parseInt(d.baseAc != null ? d.baseAc : d.ac, 10) || 10; changes.push('КБ: ' + mc.baseAc); }
        if(d.baseShield != null || d.shield != null){ mc.baseShield = parseInt(d.baseShield != null ? d.baseShield : d.shield, 10) || 0; changes.push('Щиты: ' + mc.baseShield); }
        if(d.baseArmorPoints != null || d.armorPoints != null){ mc.baseArmorPoints = parseInt(d.baseArmorPoints != null ? d.baseArmorPoints : d.armorPoints, 10) || 0; changes.push('Броня: ' + mc.baseArmorPoints); }
        if(d.damageThreshold != null || d.dt != null){ mc.damageThreshold = parseInt(d.damageThreshold != null ? d.damageThreshold : d.dt, 10) || 0; changes.push('ПБ (DT): ' + mc.damageThreshold); }
        if(d.baseBarrier != null || d.barrier != null){ mc.baseBarrier = parseInt(d.baseBarrier != null ? d.baseBarrier : d.barrier, 10) || 0; changes.push('Барьер: ' + mc.baseBarrier); }
        var meHp = d.maxHp != null ? d.maxHp : (d.hpMax != null ? d.hpMax : d.hp);
        if(meHp != null){ mc.maxHp = parseInt(meHp, 10) || 10; changes.push('HP: ' + mc.maxHp); }
        if(d.omniTool != null){ mc.omniTool = String(d.omniTool); changes.push('Омни-инструмент: ' + mc.omniTool); }
        if(d.bioAmp != null){ mc.bioAmp = String(d.bioAmp); changes.push('Био-усилитель: ' + mc.bioAmp); }
        if(d.loadout != null || d.equipment != null){ mc.loadout = String(d.loadout != null ? d.loadout : d.equipment); changes.push('Снаряжение обновлено'); }
        if(d.backstory != null || d.notes != null){ mc.background = String(d.backstory != null ? d.backstory : d.notes); changes.push('Досье обновлено'); }
        var stObj = d.stats || d.abilities || d;
        if(!mc.stats) mc.stats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
        ['str','dex','con','int','wis','cha'].forEach(function(k){
          if(stObj[k] != null){
            mc.stats[k] = parseInt(stObj[k], 10) || 10;
            changes.push(k.toUpperCase() + ': ' + mc.stats[k]);
          }
        });
        window.ME.saveChar(mc);
      }
      return changes;
    }

    // Режим 4: СТИХИЯ / АВАТАР (el)
    if(m === 'el' && window.EL && typeof window.EL.getProfile === 'function'){
      var ep = window.EL.getProfile();
      if(ep){
        if(d.name != null && d.firstName == null){
          var nParts = String(d.name).trim().split(/\s+/);
          ep.firstName = nParts[0] || ep.firstName;
          ep.lastName = nParts.slice(1).join(' ');
          changes.push('Имя: ' + [ep.firstName, ep.lastName].filter(Boolean).join(' '));
        }
        if(d.firstName != null){ ep.firstName = String(d.firstName); changes.push('Имя: ' + ep.firstName); }
        if(d.lastName != null){ ep.lastName = String(d.lastName); changes.push('Фамилия: ' + ep.lastName); }
        if(d.element != null || d.className != null){ ep.element = String(d.element != null ? d.element : d.className); changes.push('Стихия: ' + ep.element); }
        if(d.level != null){ ep.level = parseInt(d.level, 10) || 1; changes.push('Уровень: ' + ep.level); }
        var elHp = d.hp != null ? d.hp : (d.hpMax != null ? d.hpMax : d.maxHp);
        if(elHp != null){ ep.hp = parseInt(elHp, 10) || 12; changes.push('HP: ' + ep.hp); }
        if(d.ac != null){ ep.ac = parseInt(d.ac, 10) || 10; changes.push('КБ: ' + ep.ac); }
        if(d.note != null || d.notes != null || d.backstory != null){
          ep.note = String(d.note != null ? d.note : (d.notes != null ? d.notes : d.backstory));
          changes.push('Заметки обновлены');
        }
        window.EL.saveProfile(ep);
        if(typeof window.EL.applyTheme === 'function') window.EL.applyTheme();
      }
      return changes;
    }

    // Режим 5: ВОЛШЕБНИК (wz)
    if(m === 'wz' && window.WZ && typeof window.WZ.getActiveProfile === 'function'){
      var zp = window.WZ.getActiveProfile();
      if(zp){
        if(d.name != null && d.firstName == null){
          var wParts = String(d.name).trim().split(/\s+/);
          zp.firstName = wParts[0] || '';
          zp.lastName = wParts.slice(1).join(' ');
          zp.name = String(d.name).trim();
          changes.push('Имя: ' + zp.name);
        }
        if(d.firstName != null){ zp.firstName = String(d.firstName); zp.name = [zp.firstName, zp.lastName].filter(Boolean).join(' '); changes.push('Имя: ' + zp.firstName); }
        if(d.lastName != null){ zp.lastName = String(d.lastName); zp.name = [zp.firstName, zp.lastName].filter(Boolean).join(' '); changes.push('Фамилия: ' + zp.lastName); }
        if(d.house != null || d.className != null){ zp.house = String(d.house != null ? d.house : d.className); changes.push('Факультет: ' + zp.house); }
        if(d.year != null || d.level != null){ zp.year = String(d.year != null ? d.year : (d.level + ' курс')); changes.push('Курс/Статус: ' + zp.year); }
        if(d.title != null || d.subclass != null){ zp.title = String(d.title != null ? d.title : d.subclass); changes.push('Титул: ' + zp.title); }
        var wzHp = d.hp != null ? d.hp : (d.hpMax != null ? d.hpMax : d.maxHp);
        if(wzHp != null){ zp.hp = parseInt(wzHp, 10) || 20; zp.maxHp = zp.hp; changes.push('HP: ' + zp.hp); }
        if(d.ac != null){ zp.ac = parseInt(d.ac, 10) || 10; changes.push('КБ: ' + zp.ac); }
        if(d.patronus != null){ zp.patronus = String(d.patronus); changes.push('Патронус: ' + zp.patronus); }
        if(d.wand && typeof d.wand === 'object'){
          if(!zp.wand || typeof zp.wand !== 'object') zp.wand = {};
          Object.assign(zp.wand, d.wand);
          zp.wand.saved = true;
          changes.push('Палочка обновлена');
        }
        if(d.wandWood != null){ if(!zp.wand) zp.wand = {}; zp.wand.wood = String(d.wandWood); zp.wand.saved = true; changes.push('Древесина палочки: ' + d.wandWood); }
        if(d.wandCore != null){ if(!zp.wand) zp.wand = {}; zp.wand.core = String(d.wandCore); zp.wand.saved = true; changes.push('Сердцевина палочки: ' + d.wandCore); }
        if(d.wandLength != null){ if(!zp.wand) zp.wand = {}; zp.wand.length = String(d.wandLength); zp.wand.saved = true; changes.push('Длина палочки: ' + d.wandLength); }
        if(d.wandFlex != null || d.wandFlexibility != null){ if(!zp.wand) zp.wand = {}; zp.wand.flexibility = String(d.wandFlex || d.wandFlexibility); zp.wand.saved = true; changes.push('Гибкость палочки: ' + zp.wand.flexibility); }
        window.WZ.saveProfiles();
      }
      return changes;
    }

    // Режим 6: ЗВЁЗДНЫЕ ВОЙНЫ (sw)
    if(m === 'sw' && window.SW && typeof window.SW.getActiveProfile === 'function'){
      var swP = window.SW.getActiveProfile();
      if(swP){
        if(d.name != null){ swP.name = String(d.name); changes.push('Имя: ' + swP.name); }
        if(d.race != null || d.species != null){ swP.race = String(d.race != null ? d.race : d.species); changes.push('Раса: ' + swP.race); }
        if(d.path != null || d.className != null){ swP.path = String(d.path != null ? d.path : d.className); changes.push('Путь: ' + swP.path); }
        if(d.title != null || d.subclass != null){ swP.title = String(d.title != null ? d.title : d.subclass); changes.push('Титул/Ранг: ' + swP.title); }
        if(d.level != null){ swP.level = parseInt(d.level, 10) || 1; changes.push('Уровень: ' + swP.level); }
        var swHp = d.hp != null ? d.hp : (d.hpMax != null ? d.hpMax : d.maxHp);
        if(swHp != null){ swP.hp = parseInt(swHp, 10) || 20; changes.push('HP: ' + swP.hp); }
        if(d.ac != null){ swP.ac = parseInt(d.ac, 10) || 10; changes.push('КБ: ' + swP.ac); }
        if(d.force != null || d.energy != null || d.forcePoints != null){
          swP.force = parseInt(d.force != null ? d.force : (d.forcePoints != null ? d.forcePoints : d.energy), 10) || 0;
          changes.push('Очки Силы: ' + swP.force);
        }
        if(d.weapon != null){ swP.weapon = String(d.weapon); changes.push('Оружие: ' + swP.weapon); }
        if(d.armor != null){ swP.armor = String(d.armor); changes.push('Броня: ' + swP.armor); }
        if(d.ship != null){ swP.ship = String(d.ship); changes.push('Корабль: ' + swP.ship); }
        if(d.notes != null || d.backstory != null){ swP.notes = String(d.notes != null ? d.notes : d.backstory); changes.push('Заметки обновлены'); }
        window.SW.saveProfiles();
      }
      if(d.theme && typeof window.SW.setTheme === 'function'){ window.SW.setTheme(String(d.theme)); changes.push('Тема: ' + d.theme); }
      return changes;
    }

    // Режим 7: ТЕХНОЛОГИИ (hb)
    if(m === 'hb' && window.HB){
      var hbRecs = Array.isArray(window.HB.records) ? window.HB.records : [];
      var hbChar = window.HB.activeChar ? hbRecs.find(function(r){ return r.id === window.HB.activeChar; }) : hbRecs.find(function(r){ return r.type === 'char'; });
      if(hbChar){
        if(!hbChar.f) hbChar.f = {};
        if(d.name != null){ hbChar.name = String(d.name); changes.push('Имя: ' + hbChar.name); }
        ['age','race','mut','magic','job','level','hp','money','rep','oblig','bio'].forEach(function(k){
          if(d[k] != null){ hbChar.f[k] = String(d[k]); changes.push(k + ': ' + d[k]); }
        });
        try { localStorage.setItem('ttc_hb_records', JSON.stringify(window.HB.records)); } catch(e){}
      }
      if(d.worldName != null && window.HB.world){
        window.HB.world.name = String(d.worldName);
        try { localStorage.setItem('ttc_hb_world', JSON.stringify(window.HB.world)); } catch(e){}
        changes.push('Мир: ' + d.worldName);
      }
      return changes;
    }

    // Режим 8 (По умолчанию): ФАЭРУН D&D 2024 (faerun)
    if(typeof window.getActiveFaerunCharacter === 'function'){
      var ch = window.getActiveFaerunCharacter();
      if(ch){
        var simpleStrings = [
          ['name', 'Имя'], ['playerName', 'Игрок'], ['species', 'Вид'], ['className', 'Класс'],
          ['subclass', 'Подкласс'], ['background', 'Предыстория'], ['alignment', 'Мировоззрение'],
          ['hitDiceTotal', 'Кости хитов'], ['hitDiceType', 'Тип кости хитов'], ['activeCondition', 'Состояние'],
          ['profArmor', 'Доспехи'], ['profWeapons', 'Оружие'], ['profTools', 'Инструменты'],
          ['languages', 'Языки'], ['features', 'Умения и черты'], ['equipment', 'Снаряжение'],
          ['traits', 'Черты характера'], ['ideals', 'Идеалы'], ['bonds', 'Привязанности'],
          ['flaws', 'Слабости'], ['age', 'Возраст'], ['height', 'Рост'], ['weight', 'Вес'],
          ['eyes', 'Глаза'], ['skin', 'Кожа'], ['hair', 'Волосы'], ['backstory', 'История'],
          ['spellNotes', 'Заклинания'], ['spellAbility', 'Базовая хар-ка заклинаний']
        ];
        // Синонимы полей
        if(d.race != null && d.species == null) d.species = d.race;
        if(d.class != null && d.className == null) d.className = d.class;
        if(d.hp != null && d.hpMax == null) d.hpMax = d.hp;
        if(d.maxHp != null && d.hpMax == null) d.hpMax = d.maxHp;
        if(d.armorClass != null && d.ac == null) d.ac = d.armorClass;

        simpleStrings.forEach(function(pair){
          var k = pair[0], label = pair[1];
          if(d[k] != null){
            ch[k] = String(d[k]);
            changes.push(label + ': ' + String(d[k]).slice(0, 40));
          }
        });

        var simpleNums = [
          ['level', 'Уровень'], ['xp', 'Опыт'], ['ac', 'КД'], ['initMisc', 'Бонус Иниц.'],
          ['hpMax', 'Хиты (HP)'], ['hpCurrent', 'Тек. Хиты'], ['hpTemp', 'Врем. Хиты'],
          ['exhaustion', 'Истощение']
        ];
        simpleNums.forEach(function(pair){
          var k = pair[0], label = pair[1];
          if(d[k] != null && !isNaN(Number(d[k]))){
            ch[k] = Number(d[k]);
            changes.push(label + ': ' + ch[k]);
          }
        });

        if(d.inspiration != null){ ch.inspiration = !!d.inspiration; changes.push('Героическое вдохновение: ' + (ch.inspiration ? 'Да' : 'Нет')); }
        if(d.spellEnabled != null){ ch.spellEnabled = !!d.spellEnabled; changes.push('Книга заклинаний: ' + (ch.spellEnabled ? 'Вкл' : 'Выкл')); }

        // Характеристики (abilities / stats / плоские ключи str, dex, con, int, wis, cha)
        var abSource = d.abilities || d.stats || d;
        if(!ch.abilities) ch.abilities = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
        ['str','dex','con','int','wis','cha'].forEach(function(k){
          if(abSource[k] != null && !isNaN(Number(abSource[k]))){
            ch.abilities[k] = Math.max(1, Math.min(30, Number(abSource[k])));
            changes.push(k.toUpperCase() + ': ' + ch.abilities[k]);
          }
        });

        // Спасброски
        if(d.saveProf && typeof d.saveProf === 'object'){
          if(!ch.saveProf) ch.saveProf = {};
          Object.keys(d.saveProf).forEach(function(k){
            ch.saveProf[k] = !!d.saveProf[k];
          });
          changes.push('Обновлены спасброски');
        }

        // Навыки (0 = нет, 1 = владение, 2 = экспертиза)
        if(d.skillProf && typeof d.skillProf === 'object'){
          if(!ch.skillProf) ch.skillProf = {};
          Object.keys(d.skillProf).forEach(function(k){
            ch.skillProf[k] = Number(d.skillProf[k]) || 0;
          });
          changes.push('Обновлены владения навыками');
        }

        // Ячейки заклинаний (1..9)
        if(d.slots && typeof d.slots === 'object'){
          if(!ch.slots) ch.slots = {};
          Object.keys(d.slots).forEach(function(lvl){
            ch.slots[lvl] = Number(d.slots[lvl]) || 0;
          });
          changes.push('Обновлены ячейки заклинаний');
        }

        // Оружие и атаки (attacks)
        if(Array.isArray(d.attacks)){
          ch.attacks = d.attacks.map(function(a){
            return {
              name: a.name || 'Оружие',
              bonus: a.bonus || '+5',
              damage: a.damage || '1d8+3',
              type: a.type || 'рубящий',
              mastery: a.mastery || ''
            };
          });
          changes.push('Обновлен список оружия (' + ch.attacks.length + ')');
        }
        if(d.addAttack && typeof d.addAttack === 'object'){
          if(!Array.isArray(ch.attacks)) ch.attacks = [];
          ch.attacks.push({
            name: d.addAttack.name || 'Оружие',
            bonus: d.addAttack.bonus || '+5',
            damage: d.addAttack.damage || '1d8+3',
            type: d.addAttack.type || 'рубящий',
            mastery: d.addAttack.mastery || ''
          });
          changes.push('+ Оружие: ' + (d.addAttack.name || 'Оружие'));
        }

        if(d.equipmentAppend){
          ch.equipment = ch.equipment ? (ch.equipment + '\n' + d.equipmentAppend) : String(d.equipmentAppend);
          changes.push('+ Снаряжение');
        }
        if(d.featuresAppend){
          ch.features = ch.features ? (ch.features + '\n' + d.featuresAppend) : String(d.featuresAppend);
          changes.push('+ Умение/черта');
        }

        if(typeof window.saveCharactersToStorage === 'function') window.saveCharactersToStorage();
      }
    }

    return changes;
  }

  /* ---------- 5. ВЫПОЛНЕНИЕ ЗАДАЧ (Task Execution Engine) ---------- */
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
    var d = t.item || t.data || t.fields || t.patch || t;
    var reportId = 'task_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 4);

    // A. УНИВЕРСАЛЬНОЕ ИЗМЕНЕНИЕ ПАРАМЕТРОВ ПЕРСОНАЖА / ДОСЬЕ / ДАННЫХ
    if(action === 'update_character' || action === 'patch_character' || action === 'set_stats' || action === 'edit_character' || action === 'update_profile' || action === 'update_data'){
      var changes = applyCharacterPatch(d, mode);
      if(changes.length){
        return {
          reportId: reportId,
          badge: '✓ Параметры обновлены',
          name: 'Досье персонажа (' + getModeContext(mode).heroName + ')',
          meta: changes.join(' • '),
          canUndo: false,
          canOpen: false
        };
      }
    }

    // B. ПРЯМАЯ УСТАНОВКА ПОЛЕЙ DOM НА ОТКРЫТОМ ЭКРАНЕ
    if(action === 'set_dom_fields' || action === 'fill_form'){
      var map = d.fields || d;
      var domChanged = [];
      Object.keys(map).forEach(function(sel){
        if(sel === 'action') return;
        var val = map[sel];
        var el = document.querySelector(sel) || document.getElementById(sel.replace(/^#/, '')) || document.querySelector('[data-field="' + sel + '"]');
        if(el){
          if(el.type === 'checkbox') el.checked = !!val;
          else el.value = String(val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          domChanged.push(sel + ' → ' + val);
        }
      });
      syncDomInputsToState(mode);
      if(domChanged.length){
        return {
          reportId: reportId,
          badge: '✓ Поля экрана обновлены',
          name: 'Изменено полей: ' + domChanged.length,
          meta: domChanged.slice(0, 6).join(' • '),
          canUndo: false,
          canOpen: false
        };
      }
    }

    // C. ПРЯМОЕ ВЫПОЛНЕНИЕ JS-КОДА НАД СОСТОЯНИЕМ ПРИЛОЖЕНИЯ (ДЛЯ ЛЮБЫХ НЕСТАНДАРТНЫХ ЗАДАЧ)
    if(action === 'run_js' || action === 'exec_js'){
      var codeStr = d.code || t.code || '';
      if(codeStr){
        try {
          syncDomInputsToState(mode);
          var fn = new Function('mode', codeStr);
          var jsResult = fn(mode);
          return {
            reportId: reportId,
            badge: '⚡ Выполнена операция в коде',
            name: d.title || t.title || 'Модификация данных',
            meta: jsResult ? String(jsResult) : (d.desc || 'Изменения успешно применены и сохранены'),
            canUndo: false,
            canOpen: false
          };
        } catch(err){
          return {
            reportId: reportId,
            badge: '⚠️ Ошибка операции',
            name: d.title || 'Выполнение кода',
            meta: err.message,
            canUndo: false,
            canOpen: false
          };
        }
      }
    }

    // D. ПЕРЕКЛЮЧЕНИЕ ТЕМЫ / ЭКРАНА / РЕЖИМА
    if(action === 'switch_theme' || action === 'set_theme'){
      var th = String(d.theme || d.name || '').trim();
      if(mode === 'wi' && window.WI && typeof window.WI.setTheme === 'function'){
        window.WI.setTheme(th);
      } else if(mode === 'sw' && window.SW && typeof window.SW.setTheme === 'function'){
        window.SW.setTheme(th);
      } else if(mode === 'el' && window.EL && typeof window.EL.setTheme === 'function'){
        window.EL.setTheme(th);
      }
      return {
        reportId: reportId,
        badge: '🎨 Тема оформления изменена',
        name: 'Тема: ' + th,
        meta: 'Визуальное оформление раздела обновлено',
        canUndo: false,
        canOpen: false
      };
    }

    if(action === 'navigate' || action === 'open_screen'){
      var targetScreen = String(d.screen || d.target || '').trim();
      if(targetScreen && typeof window.navigate === 'function'){
        setTimeout(function(){ window.navigate(targetScreen); }, 50);
        return {
          reportId: reportId,
          badge: '🧭 Переход выполнен',
          name: 'Экран: ' + targetScreen,
          meta: 'Открыт запрошенный экран',
          canUndo: false,
          canOpen: false
        };
      }
    }

    // 1. ДОБАВЛЕНИЕ СПОСОБНОСТИ / ТЕХНИКИ / ЗАКЛИНАНИЯ
    if(action === 'add_ability' || action === 'add_tech' || action === 'add_power'){
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
      return executeSingleTask({ action: 'add_ability', item: d }, mode, idx);
    }

    // 5. УДАЛЕНИЕ ПО НАЗВАНИЮ ИЛИ ID ВО ВСЕХ РАЗДЕЛАХ
    if(action === 'delete_item' || action === 'remove_item'){
      var targetName = String(d.name || d.id || '').trim().toLowerCase();
      if(!targetName) return null;
      var removedNames = [];
      var matchFn = function(x){
        if(!x) return false;
        var n = String(x.name || '').toLowerCase();
        var xId = String(x.id || '').toLowerCase();
        var hit = (targetName === 'all' || targetName === '*' || n.indexOf(targetName) !== -1 || xId === targetName);
        if(hit) removedNames.push(x.name || x.id);
        return !hit;
      };

      if(mode === 'faerun'){
        var h = (typeof window.getActiveFaerunCharacter === 'function') ? window.getActiveFaerunCharacter() : null;
        if(h){
          if(Array.isArray(h.techs)) h.techs = h.techs.filter(matchFn);
          if(Array.isArray(h.moves)) h.moves = h.moves.filter(matchFn);
          if(typeof window.saveCharactersToStorage === 'function') window.saveCharactersToStorage();
        }
        if(Array.isArray(window.RECIPES)){
          window.RECIPES = window.RECIPES.filter(matchFn);
          if(typeof window.saveRecipesToStorage === 'function') window.saveRecipesToStorage();
        }
      } else if(mode === 'wi' && window.WI){
        window.WI.loadTechs(); window.WI.loadMoves();
        window.WI.techs = (window.WI.techs || []).filter(matchFn);
        window.WI.moves = (window.WI.moves || []).filter(matchFn);
        window.WI.saveTechs(); window.WI.saveMoves();
      } else if(mode === 'sh' && window.SH){
        window.SH.techs = (window.SH.techs || []).filter(matchFn);
        window.SH.moves = (window.SH.moves || []).filter(matchFn);
        if(typeof window.SH.saveT === 'function') window.SH.saveT();
        if(typeof window.SH.saveM === 'function') window.SH.saveM();
      } else if(mode === 'el' && window.EL){
        window.EL.saveTechs((window.EL.getTechs() || []).filter(matchFn));
        window.EL.saveMoves((window.EL.getMoves() || []).filter(matchFn));
      } else if(mode === 'wz' && window.WZ){
        window.WZ.spells = (window.WZ.spells || []).filter(matchFn);
        window.WZ.duels = (window.WZ.duels || []).filter(matchFn);
        window.WZ.potions = (window.WZ.potions || []).filter(matchFn);
        window.WZ.saveSpells(); window.WZ.saveDuels(); window.WZ.savePotions();
      } else if(mode === 'sw' && window.SW){
        window.SW.techs = (window.SW.techs || []).filter(matchFn);
        window.SW.moves = (window.SW.moves || []).filter(matchFn);
        window.SW.saveTechs(); window.SW.saveMoves();
      } else if(mode === 'me' && window.ME){
        var pList = (window.ME.getPowers() || []).filter(matchFn);
        window.ME.savePowers(pList);
      }

      if(removedNames.length){
        return {
          reportId: reportId,
          badge: '🗑️ Удалено (' + removedNames.length + ')',
          name: removedNames.join(', '),
          meta: 'Записи успешно удалены',
          canUndo: false,
          canOpen: false
        };
      }
    }

    // 6. БРОСОК КУБИКОВ
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

  /* ---------- 6. ЗАПРОС К GEMINI С АВТОМАТИЧЕСКИМ ОСМОТРОМ КОДА И DOM ---------- */
  function buildAgentPrompt(userText, mode, extraCodeInspection){
    var ctx = getModeContext(mode);
    var history = loadChatHistory(mode);
    var curScreen = (window.view && window.view.screen) ? window.view.screen : 'home';
    var domSnapshot = inspectLiveDom();

    var recentTurns = history.slice(-8).map(function(m){
      return (m.role === 'user' ? 'Игрок: ' : 'Ассистент: ') + m.text;
    }).join('\n');

    return (
      'Ты — встроенный ИИ-Ассистент и автономный агент управления приложением «Тактический компендиум».\n' +
      'Ты обязан понимать и ВЫПОЛНЯТЬ ЛЮБОЙ запрос пользователя по факту его написания!\n\n' +
      '=== ТЕКУЩИЙ КОНТЕКСТ ПРИЛОЖЕНИЯ ===\n' +
      '• Активный раздел (mode): "' + mode + '" (' + ctx.worldName + ')\n' +
      '• Открытый сейчас экран (view.screen): "' + curScreen + '"\n' +
      '• Полный JSON-слепок данных активного персонажа и списков раздела:\n' + ctx.fullStateJson + '\n\n' +
      '=== ОСМОТР DOM ОТКРЫТОГО ЭКРАНА (полей ввода на странице) ===\n' + domSnapshot + '\n\n' +
      (extraCodeInspection ? ('=== РЕЗУЛЬТАТ ОСМОТРА КОДА ФУНКЦИЙ И ОБЪЕКТОВ ===\n' + extraCodeInspection + '\n\n') : '') +
      '=== ИНСТРУМЕНТЫ И ЗАДАЧИ (массив "tasks") ===\n' +
      'Когда пользователь просит изменить любые параметры персонажа/анкеты/мира (на экране «Данные» или с любого другого экрана), добавить/удалить/изменить способности, приёмы, рецепты, заклинания, оружие, поменять тему, перейти на экран или выполнить нестандартное действие — ты ОБЯЗАН вернуть соответствующие задачи в массиве "tasks":\n\n' +
      '1. "update_character" — универсальное изменение любых параметров персонажа, анкеты или мира в текущем разделе ("' + mode + '").\n' +
      '   Передай внутри "item" объект с любыми полями, которые нужно изменить (смотри точные ключи в JSON-слепке выше!).\n' +
      '   Примеры полей для разных разделов:\n' +
      '   - Фаэрун (faerun): { "name": "...", "species": "...", "className": "...", "subclass": "...", "background": "...", "alignment": "...", "level": 5, "xp": 6500, "ac": 18, "hpMax": 45, "initMisc": 2, "hitDiceTotal": "5", "hitDiceType": "d10", "abilities": {"str":18,"dex":14,"con":16,"int":10,"wis":12,"cha":10}, "profArmor": "...", "profWeapons": "...", "languages": "...", "equipment": "...", "features": "...", "backstory": "...", "slots": {"1":4,"2":3} }\n' +
      '   - Ведьмак (wi): { "name": "...", "school": "...", "title": "...", "level": 10, "hp": 80, "ac": 17, "energy": 100, "silverSword": "...", "steelSword": "...", "armor": "...", "notes": "...", "worldName": "...", "worldNote": "...", "theme": "wolf|wildhunt|north|nilfgaard|scoiatael|skellige|syndicate|dragon" }\n' +
      '   - Шиноби (sh): { "charName": "...", "clan": "...", "village": "...", "rank": "Джонин", "level": "10", "nature": "Молния", "chakra": "120", "hp": "95", "ac": "17", "notes": "...", "worldName": "...", "worldNote": "..." }\n' +
      '   - Mass Effect (me): { "name": "...", "callsign": "...", "race": "...", "role": "...", "origin": "...", "level": 8, "baseAc": 17, "baseShield": 40, "baseArmorPoints": 25, "damageThreshold": 3, "baseBarrier": 20, "maxHp": 65, "stats": {"str":16,"dex":16,"con":14,"int":14,"wis":12,"cha":14}, "omniTool": "...", "bioAmp": "...", "loadout": "...", "backstory": "..." }\n' +
      '   - Стихия (el): { "firstName": "...", "lastName": "...", "element": "Огонь|Вода|Земля|Ветер|Тьма|Аватар|Без стихии", "level": 7, "hp": 55, "ac": 16, "note": "..." }\n' +
      '   - Волшебник (wz): { "firstName": "...", "lastName": "...", "house": "Слизерин|Гриффиндор|Когтевран|Пуффендуй", "year": "5 курс", "title": "...", "hp": 45, "ac": 15, "wand": {"name":"...","wood":"Тис","core":"Перо феникса","length":"11 дюймов","flexibility":"Упругая","features":"..."} }\n' +
      '   - Звёздные войны (sw): { "name": "...", "race": "...", "path": "...", "title": "...", "level": 8, "hp": 70, "ac": 17, "force": 35, "weapon": "...", "armor": "...", "ship": "...", "notes": "...", "theme": "jedi|sith" }\n\n' +
      '2. "add_ability" — добавить способность / технику / знак / биотику / заклинание.\n' +
      '   "item": { "name": "...", "icon": "⚡", "category": "...", "actionCost": "1 действие", "cooldown": "...", "checkOrSave": "...", "dmgN": 3, "dmgD": "d8", "dmgMod": 0, "desc": "Подробное описание..." }\n\n' +
      '3. "add_move" — добавить боевой приём / приём фехтования / дуэльный приём.\n' +
      '   "item": { "name": "...", "icon": "⚔️", "category": "...", "weaponOrStyle": "...", "attackBonus": "+6", "damageOrSave": "2d8+4", "mastery": "...", "actionCost": "...", "trigger": "...", "desc": "..." }\n\n' +
      '4. "add_recipe" — добавить рецепт алхимии / зелье ("item": { "name": "...", "category": "potions|bombs|oils|poisons", "rarity": "Редкий", "cost": 150, "dc": 15, "time": "4 часа", "ingredients": [{"name":"...","qty":1}], "appearance": "...", "effect": "..." }).\n\n' +
      '5. "add_spell" — добавить заклинание ("item": { "name": "...", "level": 3, "school": "evocation", "effect": "..." }).\n\n' +
      '6. "delete_item" — удалить способность, приём или рецепт по названию или ID ("item": { "name": "..." }).\n\n' +
      '7. "set_dom_fields" — напрямую заполнить поля ввода на текущем открытом экране по их селектору из раздела ОСМОТР DOM ("item": { "#id_или_data_field": "значение" }).\n\n' +
      '8. "run_js" — выполнить произвольный JS-код в браузере, если задача нестандартная (например: массовое редактирование карточек, создание нового профиля, сложная модификация состояния). Доступны глобальные объекты window.CHARACTERS, window.saveCharactersToStorage, window.WI, window.SH, window.ME, window.EL, window.WZ, window.SW, window.HB, window.RECIPES, window.SPELLS, localStorage.\n' +
      '   "item": { "title": "Краткое название операции", "code": "...валидный JS код..." }\n\n' +
      '9. "roll_dice" — бросить кубики ("item": { "label": "...", "formula": "2d6+4" }).\n\n' +
      '10. ОСМОТР ИСХОДНОГО КОДА ("inspect_code"):\n' +
      '    Если для точного выполнения задачи тебе нужно сначала заглянуть в исходный код какой-либо функции или глобального объекта приложения (например: ["WI", "wireWiData", "renderFaeData", "SH", "ME", "EL", "WZ", "SW", "HB"]), укажи их имена в корневом массиве "inspect_code": ["имяФункцииИлиОбъекта"]. Система мгновенно прочитает их код и передаст тебе для финального выполнения!\n\n' +
      'Ответь СТРОГО валидным JSON-объектом:\n' +
      '{\n' +
      '  "inspect_code": [],\n' +
      '  "reply": "Твой ответ и отчёт о выполненных действиях на русском языке",\n' +
      '  "tasks": [ ... список задач для выполнения ... ],\n' +
      '  "suggestedRolls": []\n' +
      '}\n\n' +
      'История диалога:\n' + recentTurns + '\n\n' +
      'Запрос игрока: ' + userText
    );
  }

  function callGeminiJson(promptText, apiKey){
    return fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-4-argon:generateContent?key=' + encodeURIComponent(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.4,
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
      return parsed;
    });
  }

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
    var history = loadChatHistory(mode);

    history.push({
      role: 'user',
      text: trimmed,
      ts: Date.now()
    });
    saveChatHistory(mode, history);

    isBusy = true;
    busyStatusText = '🔍 Осматриваю экран и состояние раздела...';
    updateBusyState();
    renderMessages();

    var prompt1 = buildAgentPrompt(trimmed, mode, '');

    callGeminiJson(prompt1, apiKey)
      .then(function(parsed){
        // Если ИИ запросил дополнительный осмотр исходного кода функций/объектов
        if(Array.isArray(parsed.inspect_code) && parsed.inspect_code.length > 0 && (!parsed.tasks || parsed.tasks.length === 0)){
          busyStatusText = '🔍 Осматриваю код: ' + parsed.inspect_code.join(', ') + '...';
          renderMessages();
          var codeDump = inspectCodeSymbols(parsed.inspect_code);
          var prompt2 = buildAgentPrompt(trimmed, mode, codeDump);
          return callGeminiJson(prompt2, apiKey);
        }
        return parsed;
      })
      .then(function(finalParsed){
        var reports = executeTasksBatch(finalParsed.tasks || [], mode);
        var botMsg = {
          role: 'bot',
          text: finalParsed.reply || (reports.length ? 'Все задачи успешно выполнены!' : 'Готово.'),
          reports: reports,
          suggestedRolls: Array.isArray(finalParsed.suggestedRolls) ? finalParsed.suggestedRolls.slice(0, 4) : [],
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
          text: '⚠️ Не удалось выполнить запрос к Gemini API (' + (err && err.message ? err.message : 'ошибка сети') + '). Проверьте ключ API кнопкой 🔑 в шапке чата.',
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
        '<button type="button" class="ttc-ai-chip" data-ai-prefill="Измени параметры персонажа: ">✏️ Изменить статы...</button>' +
        '<button type="button" class="ttc-ai-chip" data-ai-prefill="Добавь в способности: ">➕ В способности...</button>' +
        '<button type="button" class="ttc-ai-chip" data-ai-prefill="Добавь в боевые приёмы: ">⚔️ В приёмы...</button>' +
        '<button type="button" class="ttc-ai-chip" data-ai-send="Подскажи лучшую боевую комбинацию из моих способностей и приёмов.">🎯 Комбо героя</button>' +
      '</div>' +
      '<div class="ttc-ai-messages" id="ttcAiMessages"></div>' +
      '<div class="ttc-ai-footer">' +
        '<textarea id="ttcAiInput" class="ttc-ai-input" rows="1" placeholder="Любая задача: измени статы, добавь способности, приёмы..."></textarea>' +
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
            '<p>Я напрямую подключён к коду и данным твоего персонажа (<b>' + escHtml(ctx.heroName) + '</b>) во всех разделах.</p>' +
            '<p style="color:#94a3b8;font-size:12px;">Примеры любых задач:<br>' +
            '• <i>«Поставь мне 7 уровень, 65 хитов, КД 18 и Силу 18»</i><br>' +
            '• <i>«Заполни анкету под ведьмака Школы Змеи 12 уровня»</i><br>' +
            '• <i>«Добавь в способности атаку молнией и фаерболл»</i></p>' +
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
          '<div class="ttc-ai-msg-text" style="color:var(--ai-accent-bright);">' + escHtml(busyStatusText) + '</div>' +
        '</div>';
    }

    box.innerHTML = html;
    box.scrollTop = box.scrollHeight;

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
