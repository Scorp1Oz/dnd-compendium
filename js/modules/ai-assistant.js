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
        if(g('shDataInCharName') || g('shDataInName')){
          var fields = [
            ['shDataInCharName', 'charName'],
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
          if(g('shDataInNotes') && sp) sp.notes = g('shDataInNotes').value;
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
        if(mc){
          if(g('meEditName')){
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
          } else if(g('meInpName')){
            mc.name = g('meInpName').value.trim();
            if(g('meInpCallsign')) mc.callsign = g('meInpCallsign').value.trim();
            if(g('meSelRace')) mc.race = g('meSelRace').value;
            if(g('meInpRole')) mc.role = g('meInpRole').value.trim();
            if(g('meInpLevel')) mc.level = parseInt(g('meInpLevel').value, 10) || 1;
            if(g('meInpShield')) mc.baseShield = parseInt(g('meInpShield').value, 10) || 0;
            if(g('meInpHp')) mc.maxHp = parseInt(g('meInpHp').value, 10) || 10;
            if(g('meInpAc')) mc.baseAc = parseInt(g('meInpAc').value, 10) || 10;
            window.ME.saveChar(mc);
          }
        }
      } else if(m === 'sw' && window.SW && typeof window.SW.getActiveProfile === 'function'){
        var swP = window.SW.getActiveProfile();
        if(swP && g('swInpName')){
          swP.name = g('swInpName').value.trim();
          if(g('swInpRace')) swP.race = g('swInpRace').value.trim();
          if(g('swInpPath')) swP.path = g('swInpPath').value.trim();
          if(g('swInpTitle')) swP.title = g('swInpTitle').value.trim();
          if(g('swInpLevel')) swP.level = parseInt(g('swInpLevel').value, 10) || 1;
          if(g('swInpHp')) swP.hp = parseInt(g('swInpHp').value, 10) || 20;
          if(g('swInpAc')) swP.ac = parseInt(g('swInpAc').value, 10) || 10;
          if(g('swInpForce')) swP.force = parseInt(g('swInpForce').value, 10) || 0;
          if(g('swInpSpeed')) swP.speed = g('swInpSpeed').value.trim();
          if(g('swInpWeapon')) swP.weapon = g('swInpWeapon').value.trim();
          if(g('swInpArmor')) swP.armor = g('swInpArmor').value.trim();
          if(g('swInpShip')) swP.ship = g('swInpShip').value.trim();
          if(g('swInpNotes')) swP.notes = g('swInpNotes').value.trim();
          window.SW.saveProfiles();
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

  function getAutoCodeInspection(mode, userText){
    var m = mode || getActiveMode();
    var symbols = [];
    if(m === 'wi') symbols = ['WI.THEMES', 'WI.setTheme', 'WI.saveProfile'];
    else if(m === 'sh') symbols = ['SH.meta', 'updateShinobiTheme'];
    else if(m === 'me') symbols = ['ME', 'setMeTheme', 'applyMeTheme'];
    else if(m === 'el') symbols = ['EL.setTheme', 'EL.saveProfile'];
    else if(m === 'wz') symbols = ['WZ.applyTheme', 'WZ.saveProfiles'];
    else if(m === 'sw') symbols = ['SW.setTheme', 'SW.saveProfiles'];
    else if(m === 'faerun') symbols = ['saveCharactersToStorage'];
    return inspectCodeSymbols(symbols);
  }

  function applyThemeForMode(rawTheme, mode){
    var m = mode || getActiveMode();
    var raw = String(rawTheme || '').trim();
    var low = raw.toLowerCase();
    if(!low) return null;

    if(m === 'wi' && window.WI && typeof window.WI.setTheme === 'function'){
      var wiId = window.WI.setTheme(raw);
      var wiMeta = (Array.isArray(window.WI.THEMES) ? window.WI.THEMES.find(function(x){ return x.id === wiId; }) : null) || { id: wiId, title: raw };
      return { id: wiId, title: wiMeta.title || wiId };
    }

    if(m === 'me'){
      var meId = 'alliance';
      if(low.indexOf('цербер') !== -1 || low.indexOf('cerb') !== -1 || low.indexOf('призрак') !== -1) meId = 'cerberus';
      else if(low.indexOf('жнец') !== -1 || low.indexOf('reap') !== -1 || low.indexOf('предвестник') !== -1) meId = 'reaper';
      else if(low.indexOf('азари') !== -1 || low.indexOf('asar') !== -1 || low.indexOf('тесси') !== -1) meId = 'asari';
      else if(low.indexOf('квари') !== -1 || low.indexOf('quar') !== -1 || low.indexOf('флот') !== -1) meId = 'quarian';
      else if(low.indexOf('кроган') !== -1 || low.indexOf('krog') !== -1 || low.indexOf('тучанк') !== -1) meId = 'krogan';
      else if(low.indexOf('тури') !== -1 || low.indexOf('turi') !== -1 || low.indexOf('палавен') !== -1) meId = 'turian';
      else if(low.indexOf('салар') !== -1 || low.indexOf('salar') !== -1 || low.indexOf('гОР') !== -1) meId = 'salarian';
      else if(low.indexOf('гет') !== -1 || low.indexOf('geth') !== -1 || low.indexOf('консенсус') !== -1) meId = 'geth';
      else if(low.indexOf('омег') !== -1 || low.indexOf('ари') !== -1 || low.indexOf('aria') !== -1 || low.indexOf('omeg') !== -1) meId = 'aria';
      else if(low.indexOf('альянс') !== -1 || low.indexOf('allian') !== -1 || low.indexOf('n7') !== -1) meId = 'alliance';
      else if(['alliance','cerberus','reaper','asari','quarian','krogan','turian','salarian','geth','aria'].indexOf(low) !== -1) meId = low;

      try { localStorage.setItem('ttc_me_theme_v1', meId); } catch(e){}
      if(typeof window.setMeTheme === 'function') window.setMeTheme(meId);
      if(typeof window.applyMeTheme === 'function') window.applyMeTheme(meId);
      return { id: meId, title: raw };
    }

    if(m === 'sw' && window.SW && typeof window.SW.setTheme === 'function'){
      var swId = (low.indexOf('сит') !== -1 || low.indexOf('sith') !== -1 || low.indexOf('тьм') !== -1 || low.indexOf('темн') !== -1 || low.indexOf('тёмн') !== -1 || low.indexOf('импер') !== -1) ? 'sith' : 'jedi';
      window.SW.setTheme(swId);
      return { id: swId, title: swId === 'sith' ? 'Тёмная сторона (Ситх)' : 'Светлая сторона (Джедай)' };
    }

    if(m === 'el' && window.EL){
      var elMap = [
        ['огон', 'Огонь'], ['fire', 'Огонь'],
        ['вод', 'Вода'], ['water', 'Вода'],
        ['земл', 'Земля'], ['earth', 'Земля'],
        ['ветер', 'Ветер'], ['воздух', 'Ветер'], ['air', 'Ветер'],
        ['тьм', 'Тьма'], ['dark', 'Тьма'],
        ['аватар', 'Аватар'], ['avatar', 'Аватар'],
        ['без', 'Без стихии'], ['none', 'Без стихии']
      ];
      var chosenEl = raw;
      for(var i = 0; i < elMap.length; i++){
        if(low.indexOf(elMap[i][0]) !== -1){ chosenEl = elMap[i][1]; break; }
      }
      if(typeof window.EL.getProfile === 'function'){
        var ep = window.EL.getProfile();
        if(ep){ ep.element = chosenEl; window.EL.saveProfile(ep); }
      }
      if(typeof window.EL.setTheme === 'function') window.EL.setTheme(chosenEl);
      if(typeof window.EL.applyTheme === 'function') window.EL.applyTheme();
      return { id: chosenEl, title: chosenEl };
    }

    if(m === 'wz' && window.WZ && typeof window.WZ.getActiveProfile === 'function'){
      var zp = window.WZ.getActiveProfile();
      var wzHouse = raw;
      if(low.indexOf('слизерин') !== -1 || low.indexOf('slyth') !== -1) wzHouse = 'Слизерин';
      else if(low.indexOf('гриффиндор') !== -1 || low.indexOf('gryff') !== -1) wzHouse = 'Гриффиндор';
      else if(low.indexOf('когтевран') !== -1 || low.indexOf('рейвенкло') !== -1 || low.indexOf('raven') !== -1) wzHouse = 'Когтевран';
      else if(low.indexOf('пуффендуй') !== -1 || low.indexOf('хаффлпафф') !== -1 || low.indexOf('huffl') !== -1) wzHouse = 'Пуффендуй';
      else if(low.indexOf('хогвартс') !== -1 || low.indexOf('hogw') !== -1) wzHouse = '';
      if(zp){
        zp.house = wzHouse;
        window.WZ.saveProfiles();
      }
      if(typeof window.WZ.applyTheme === 'function') window.WZ.applyTheme();
      return { id: wzHouse || 'hogwarts', title: wzHouse || 'Хогвартс' };
    }

    if(m === 'sh' && window.SH){
      if(window.SH.meta) window.SH.meta.clan = raw;
      var sp = (typeof window.SH.getActiveProfile === 'function') ? window.SH.getActiveProfile() : null;
      if(sp) sp.clan = raw;
      if(typeof window.SH.saveMeta === 'function') window.SH.saveMeta();
      if(typeof window.SH.saveProfilesList === 'function') window.SH.saveProfilesList(window.SH.profiles);
      if(typeof window.updateShinobiTheme === 'function') window.updateShinobiTheme();
      return { id: raw, title: raw };
    }

    return null;
  }

  /* ---------- 3. ПОЛНЫЙ СЛЕПОК СОСТОЯНИЯ АКТИВНОГО РАЗДЕЛА ---------- */
  function getModeContext(mode){
    var m = mode || getActiveMode();

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
        title: 'Орбис',
        worldName: 'Ведьмак (Неверлэнд)',
        heroName: (wiP && wiP.name) ? wiP.name : 'Безымянный ведьмак',
        heroSub: [wiP && wiP.school, wiP && wiP.title, wiP && wiP.level ? (wiP.level + ' ур.') : ''].filter(Boolean).join(' • ') || 'Ведьмак',
        fullStateJson: JSON.stringify({
          profile: cloneWi,
          worldMeta: window.WI ? window.WI.meta : {},
          currentTheme: (window.WI && typeof window.WI.getTheme === 'function') ? window.WI.getTheme() : 'wolf',
          availableThemes: [
            { id: 'wolf', title: 'Школа Волка и Пламя Игни' },
            { id: 'hunt', title: 'Дикая Охота (Белый Хлад)' },
            { id: 'north', title: 'Королевства Севера (Темерия)' },
            { id: 'nilfgaard', title: 'Империя Нильфгаард' },
            { id: 'scoiatael', title: 'Эльфы и Скоя\'таэли' },
            { id: 'skellige', title: 'Острова Скеллиге' },
            { id: 'syndicate', title: 'Синдикат и Бандиты (Новиград)' },
            { id: 'dragon', title: 'Ониксовый Дракон' }
          ],
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
        title: 'Орбис',
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
        title: 'Орбис',
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
        title: 'Орбис',
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
        title: 'Орбис',
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
        title: 'Орбис',
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
        title: 'Орбис',
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
    var faeCustomSkills = (faeC && Array.isArray(faeC.customSkills)) ? faeC.customSkills : [];
    var faeRecipes = (typeof window.RECIPES !== 'undefined' && Array.isArray(window.RECIPES)) ? window.RECIPES : [];
    var cloneFae = Object.assign({}, faeC || {});
    delete cloneFae.techs;
    delete cloneFae.moves;
    delete cloneFae.customSkills;
    return {
      mode: 'faerun',
      icon: '🐉',
      title: 'Орбис',
      worldName: 'Фаэрун (D&D 2024)',
      heroName: (faeC && faeC.name) ? faeC.name : 'Искатель приключений',
      heroSub: [faeC && faeC.species, faeC && faeC.className ? (faeC.className + ' ' + (faeC.level || 1) + ' ур.') : '', faeC && faeC.subclass].filter(Boolean).join(' • ') || 'Герой D&D 5e',
      fullStateJson: JSON.stringify({
        character: cloneFae,
        techs: faeTechs.map(function(t){ return { id: t.id, name: t.name, category: t.category, actionCost: t.actionCost }; }),
        moves: faeMoves.map(function(x){ return { id: x.id, name: x.name, category: x.category, damageOrSave: x.damageOrSave }; }),
        customSkills: faeCustomSkills.map(function(s){ return { id: s.id, name: s.name, kind: s.kind, level: s.level, abil: s.abil, mod: s.mod }; }),
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
      if(d.theme){
        var wiTh = applyThemeForMode(d.theme, 'wi');
        changes.push('Тема: ' + (wiTh ? wiTh.title : d.theme));
      }
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
      if(d.theme){
        var meTh = applyThemeForMode(d.theme, 'me');
        changes.push('Тема: ' + (meTh ? meTh.title : d.theme));
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
        if(d.element != null || d.className != null || d.theme != null){
          var elVal = String(d.element != null ? d.element : (d.className != null ? d.className : d.theme));
          var elRes = applyThemeForMode(elVal, 'el');
          ep.element = elRes ? elRes.id : elVal;
          changes.push('Стихия/Тема: ' + ep.element);
        }
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
        if(d.house != null || d.className != null || d.theme != null){
          var wzVal = String(d.house != null ? d.house : (d.className != null ? d.className : d.theme));
          var wzRes = applyThemeForMode(wzVal, 'wz');
          zp.house = wzRes ? (wzRes.id === 'hogwarts' ? '' : wzRes.id) : wzVal;
          changes.push('Факультет/Тема: ' + (zp.house || 'Хогвартс'));
        }
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
        if(typeof window.WZ.applyTheme === 'function') window.WZ.applyTheme();
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
      if(d.theme){
        var swTh = applyThemeForMode(d.theme, 'sw');
        changes.push('Тема: ' + (swTh ? swTh.title : d.theme));
      }
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
  var liveDiceRolledInBatch = false;

  function getScreenMapForMode(mode){
    var m = mode || getActiveMode();
    return {
      home: m === 'wi' ? 'wiHome' : m === 'sh' ? 'shHome' : m === 'me' ? 'meHome' : m === 'el' ? 'elHome' : m === 'wz' ? 'wzHome' : m === 'sw' ? 'swHome' : m === 'hb' ? 'hbHome' : 'home',
      data: m === 'wi' ? 'wiData' : m === 'sh' ? 'shData' : m === 'me' ? 'meData' : m === 'el' ? 'elData' : m === 'wz' ? 'wzData' : m === 'sw' ? 'swData' : m === 'hb' ? 'hbData' : 'characters',
      techs: m === 'wi' ? 'wiTechs' : m === 'sh' ? 'shTechs' : m === 'me' ? 'mePowers' : m === 'el' ? 'elTechs' : m === 'wz' ? 'wzSpells' : m === 'sw' ? 'swTechs' : m === 'hb' ? 'hbTechs' : 'abilities',
      moves: m === 'wi' ? 'wiMoves' : m === 'sh' ? 'shMoves' : m === 'me' ? 'meArsenal' : m === 'el' ? 'elMoves' : m === 'wz' ? 'wzDuels' : m === 'sw' ? 'swMoves' : m === 'hb' ? 'hbMoves' : 'combatMoves',
      skills: m === 'wi' ? 'wiSkills' : m === 'sh' ? 'shSkills' : m === 'me' ? 'meSkills' : m === 'el' ? 'elSkills' : m === 'wz' ? 'wzSkills' : m === 'sw' ? 'swSkills' : m === 'hb' ? 'hbSkills' : 'faeSkills',
      recipes: m === 'wz' ? 'wzPotions' : 'myRecipes',
      magic: m === 'wz' ? 'wzSpells' : 'magic',
      ref: m === 'wi' ? 'wiRef' : m === 'sh' ? 'shRef' : m === 'me' ? 'meCodex' : m === 'el' ? 'elRef' : m === 'wz' ? 'wzRef' : m === 'sw' ? 'swRef' : m === 'hb' ? 'hbRef' : 'faeRef',
      map: m === 'wi' ? 'wiMap' : m === 'sh' ? 'shMap' : m === 'me' ? 'meMap' : m === 'el' ? 'elMap' : m === 'wz' ? 'wzMap' : m === 'sw' ? 'swMap' : m === 'hb' ? 'hbMap' : 'map',
      games: 'wiGames',
      ship: 'swShip',
      dice: 'dice'
    };
  }

  function resolveAndNavigateScreen(rawTarget, mode){
    var raw = String(rawTarget || '').trim();
    if(!raw) return null;
    var low = raw.toLowerCase();
    var m = mode || getActiveMode();
    var sm = getScreenMapForMode(m);

    // Если передан точный ID экрана с параметром (например wiTechView:...)
    if(raw.indexOf(':') !== -1 && typeof window.navigate === 'function'){
      window.navigate(raw);
      return { screen: raw, title: raw };
    }

    var target = '';
    var title = '';

    // 1. Проверка на экран бросков костей
    if(
      low === 'dice' || low === 'widice' || low === 'shdice' || low === 'medice' ||
      low === 'eldice' || low === 'wzdice' || low === 'swdice' || low === 'hbdice' || low === 'faedice' ||
      low.indexOf('кост') !== -1 || low.indexOf('кубик') !== -1 || low.indexOf('кубов') !== -1 ||
      low.indexOf('броск') !== -1 || low.indexOf('бросок') !== -1 || low.indexOf('dice') !== -1
    ){
      target = 'dice';
      title = 'Бросок костей';
    }
    // 2. Экран Данные / Досье / Персонаж
    else if(
      low === 'data' || low === 'widata' || low === 'shdata' || low === 'medata' ||
      low === 'eldata' || low === 'wzdata' || low === 'swdata' || low === 'hbdata' || low === 'characters' ||
      low.indexOf('данн') !== -1 || low.indexOf('досье') !== -1 || low.indexOf('анкет') !== -1 ||
      low.indexOf('профил') !== -1 || low.indexOf('квент') !== -1 || low.indexOf('персонаж') !== -1 || low.indexOf('стат') !== -1
    ){
      target = sm.data;
      title = 'Данные персонажа';
    }
    // 3. Экран Способности / Техники / Умения / Заклинания
    else if(
      low === 'techs' || low === 'abilities' || low === 'powers' || low === 'spells' ||
      low === 'witechs' || low === 'shtechs' || low === 'mepowers' || low === 'eltechs' ||
      low === 'wzspells' || low === 'swtechs' || low === 'hbtechs' ||
      low.indexOf('способност') !== -1 || low.indexOf('техник') !== -1 || low.indexOf('умения') !== -1 ||
      low.indexOf('биотик') !== -1 || low.indexOf('знак') !== -1
    ){
      target = sm.techs;
      title = 'Способности и техники';
    }
    // 4. Экран Приёмы / Дуэли / Арсенал
    else if(
      low === 'moves' || low === 'combatmoves' || low === 'arsenal' || low === 'duels' ||
      low === 'wimoves' || low === 'shmoves' || low === 'mearsenal' || low === 'elmoves' ||
      low === 'wzduels' || low === 'swmoves' || low === 'hbmoves' ||
      low.indexOf('приём') !== -1 || low.indexOf('прием') !== -1 || low.indexOf('арсенал') !== -1 ||
      low.indexOf('фехтован') !== -1 || low.indexOf('дуэл') !== -1 || low.indexOf('оружи') !== -1
    ){
      target = sm.moves;
      title = 'Боевые приёмы и арсенал';
    }
    // 5. Экран Навыки
    else if(
      low === 'skills' || low === 'skillsscreen' || low === 'faeskills' || low === 'wiskills' || low === 'shskills' ||
      low === 'meskills' || low === 'elskills' || low === 'wzskills' || low === 'swskills' || low === 'hbskills' ||
      low.indexOf('навык') !== -1 || low.indexOf('знани') !== -1
    ){
      target = sm.skills;
      title = 'Навыки и знания';
    }
    // 6. Экран Алхимия / Рецепты / Зелья
    else if(
      low === 'recipes' || low === 'myrecipes' || low === 'potions' || low === 'wzpotions' || low === 'alchemy' ||
      low.indexOf('алхим') !== -1 || low.indexOf('рецепт') !== -1 || low.indexOf('зель') !== -1 || low.indexOf('эликсир') !== -1
    ){
      target = sm.recipes;
      title = 'Алхимия и рецепты';
    }
    // 7. Экран Магия / Книга заклинаний
    else if(
      low === 'magic' || low.indexOf('маги') !== -1 || low.indexOf('заклинан') !== -1
    ){
      target = sm.magic;
      title = 'Магия и заклинания';
    }
    // 7b. Экран Классы и Архетипы (Фаэрун)
    else if(
      low === 'classes' || low.indexOf('классы') !== -1 || low.indexOf('архетип') !== -1 || low.indexOf('подкласс') !== -1
    ){
      target = 'classes';
      title = 'Классы и Архетипы D&D';
    }
    // 8. Экран Карта
    else if(
      low === 'map' || low === 'wimap' || low === 'shmap' || low === 'memap' ||
      low === 'elmap' || low === 'wzmap' || low === 'swmap' || low === 'hbmap' ||
      low.indexOf('карт') !== -1 || low.indexOf('атлас') !== -1
    ){
      target = sm.map;
      title = 'Карта мира';
    }
    // 9. Экран Справка / Кодекс / Глоссарий
    else if(
      low === 'ref' || low === 'faeref' || low === 'codex' || low === 'glossary' || low === 'wiref' || low === 'shref' ||
      low === 'mecodex' || low === 'elref' || low === 'wzref' || low === 'swref' || low === 'hbref' ||
      low.indexOf('справк') !== -1 || low.indexOf('справочник') !== -1 || low.indexOf('кодекс') !== -1 || low.indexOf('глоссар') !== -1 || low.indexOf('бестиар') !== -1
    ){
      target = sm.ref;
      title = 'Справка и Кодекс';
    }
    // 10. Гвинт и кости / Таверна (Ведьмак)
    else if(
      low === 'games' || low === 'wigames' || low.indexOf('гвинт') !== -1 || low.indexOf('покер') !== -1 || low.indexOf('таверн') !== -1 || low.indexOf('игр') !== -1
    ){
      target = 'wiGames';
      title = 'Гвинт и кости';
    }
    // 11. Корабль (Звёздные войны)
    else if(
      low === 'ship' || low === 'swship' || low.indexOf('корабл') !== -1 || low.indexOf('звездолёт') !== -1 || low.indexOf('звездолет') !== -1
    ){
      target = 'swShip';
      title = 'Корабль';
    }
    // 12. Главный экран
    else if(
      low === 'home' || low === 'wihome' || low === 'shhome' || low === 'mehome' ||
      low === 'elhome' || low === 'wzhome' || low === 'swhome' || low === 'hbhome' ||
      low.indexOf('главн') !== -1 || low.indexOf('меню') !== -1 || low.indexOf('домой') !== -1
    ){
      target = sm.home;
      title = 'Главный экран';
    } else {
      target = raw;
      title = raw;
    }

    if(target === 'dice' && liveDiceRolledInBatch && window.view && window.view.screen === 'dice'){
      return { screen: 'dice', title: title || 'Бросок костей' };
    }

    if(typeof window.navigate === 'function'){
      window.navigate(target);
    } else if(window.view){
      window.view.screen = target;
      if(typeof window.render === 'function') window.render();
    }
    return { screen: target, title: title };
  }

  function parseDiceFormulaSpecs(formula){
    var clean = String(formula || '1d20').trim().toLowerCase().replace(/[кk]/g, 'd').replace(/\s+/g, '');
    var diceSpecs = [];
    var mod = 0;
    var re = /([+-]?\d*)d(\d+)|([+-]\d+)/g;
    var m;
    var matchedAny = false;
    while((m = re.exec(clean)) !== null){
      matchedAny = true;
      if(m[2]){
        var rawCnt = m[1];
        var sign = 1;
        if(rawCnt === '-') sign = -1;
        var cnt = 1;
        if(rawCnt && rawCnt !== '+' && rawCnt !== '-'){
          cnt = Math.abs(parseInt(rawCnt, 10)) || 1;
        }
        cnt = Math.min(Math.max(cnt, 1), 30);
        var sides = Math.min(Math.max(parseInt(m[2], 10) || 20, 2), 1000);
        diceSpecs.push({ count: cnt, sides: sides, sign: sign });
      } else if(m[3]){
        mod += parseInt(m[3], 10) || 0;
      }
    }
    if(!matchedAny || diceSpecs.length === 0){
      var singleSides = clean.match(/^d(\d+)$/);
      if(singleSides){
        diceSpecs.push({ count: 1, sides: Math.min(Math.max(parseInt(singleSides[1], 10) || 20, 2), 1000), sign: 1 });
      } else {
        diceSpecs.push({ count: 1, sides: 20, sign: 1 });
      }
    }
    var notationParts = diceSpecs.map(function(ds){ return ds.count + 'd' + ds.sides; });
    var notation = notationParts.join('+') + (mod > 0 ? ('+' + mod) : (mod < 0 ? String(mod) : ''));
    return { diceSpecs: diceSpecs, mod: mod, formula: notation };
  }

  function rollDiceFormula(formula){
    var parsed = parseDiceFormulaSpecs(formula);
    var rolls = [];
    var sum = 0;
    parsed.diceSpecs.forEach(function(ds){
      for(var i = 0; i < ds.count; i++){
        var r = Math.floor(Math.random() * ds.sides) + 1;
        rolls.push(r);
        sum += r * ds.sign;
      }
    });
    return {
      formula: parsed.formula,
      rolls: rolls,
      mod: parsed.mod,
      total: sum + parsed.mod
    };
  }

  function executeLiveDiceRoll(formula, label, mode){
    var parsed = parseDiceFormulaSpecs(formula);
    // 1. Вживую открываем экран броска костей
    resolveAndNavigateScreen('dice', mode);

    // 2. Если доступен глобальный стол костей (window.diceState + window.addDie), бросаем кубики вживую на экране!
    if(window.diceState && typeof window.addDie === 'function'){
      window.diceState.dice = [];
      window.diceState.modifier = parsed.mod || 0;
      window.diceState.labelCat = '';
      window.diceState.label = '';
      window.diceState.customLabel = label ? String(label) : '';

      // Отрисовываем чистый стол костей с установленным модификатором и подписью
      if(typeof window.render === 'function'){
        window.render();
      }

      // Поочерёдно бросаем каждый кубик вживую на стол (.dice-tray) через штатный window.addDie(sides)
      parsed.diceSpecs.forEach(function(ds){
        if([4, 6, 8, 10, 12, 20, 100].indexOf(ds.sides) === -1){
          window.diceState.customSides = ds.sides;
        }
        for(var i = 0; i < ds.count; i++){
          window.addDie(ds.sides);
        }
      });

      liveDiceRolledInBatch = true;

      var liveRolls = (window.diceState.dice || []).map(function(dObj){ return dObj.value; });
      if(liveRolls.length > 0){
        var liveSum = liveRolls.reduce(function(acc, v){ return acc + v; }, 0);
        return {
          formula: parsed.formula,
          rolls: liveRolls,
          mod: parsed.mod,
          total: liveSum + parsed.mod,
          live: true
        };
      }
    }

    return rollDiceFormula(formula);
  }

  function captureCharacterSnapshot(mode){
    var m = mode || getActiveMode();
    try {
      if(m === 'wi' && window.WI && typeof window.WI.getActiveProfile === 'function'){
        return JSON.parse(JSON.stringify(window.WI.getActiveProfile()));
      }
      if(m === 'sh' && window.SH){
        return JSON.parse(JSON.stringify({
          meta: window.SH.meta || {},
          prof: (typeof window.SH.getActiveProfile === 'function') ? window.SH.getActiveProfile() : null
        }));
      }
      if(m === 'me' && window.ME && typeof window.ME.getChar === 'function'){
        return JSON.parse(JSON.stringify(window.ME.getChar()));
      }
      if(m === 'el' && window.EL && typeof window.EL.getProfile === 'function'){
        return JSON.parse(JSON.stringify(window.EL.getProfile()));
      }
      if(m === 'wz' && window.WZ && typeof window.WZ.getActiveProfile === 'function'){
        return JSON.parse(JSON.stringify(window.WZ.getActiveProfile()));
      }
      if(m === 'sw' && window.SW && typeof window.SW.getActiveProfile === 'function'){
        return JSON.parse(JSON.stringify(window.SW.getActiveProfile()));
      }
      if(typeof window.getActiveFaerunCharacter === 'function'){
        return JSON.parse(JSON.stringify(window.getActiveFaerunCharacter()));
      }
    } catch(e){}
    return null;
  }

  function restoreCharacterSnapshot(mode, snap){
    if(!snap) return;
    var m = mode || getActiveMode();
    try {
      if(m === 'wi' && window.WI && typeof window.WI.getActiveProfile === 'function'){
        var wp = window.WI.getActiveProfile();
        if(wp){ Object.assign(wp, snap); window.WI.saveProfile(wp); }
        return;
      }
      if(m === 'sh' && window.SH){
        if(snap.meta && window.SH.meta) Object.assign(window.SH.meta, snap.meta);
        var sp = (typeof window.SH.getActiveProfile === 'function') ? window.SH.getActiveProfile() : null;
        if(sp && snap.prof) Object.assign(sp, snap.prof);
        if(typeof window.SH.saveMeta === 'function') window.SH.saveMeta();
        if(typeof window.SH.saveProfilesList === 'function') window.SH.saveProfilesList(window.SH.profiles);
        return;
      }
      if(m === 'me' && window.ME && typeof window.ME.saveChar === 'function'){
        window.ME.saveChar(snap);
        return;
      }
      if(m === 'el' && window.EL && typeof window.EL.saveProfile === 'function'){
        window.EL.saveProfile(snap);
        if(typeof window.EL.applyTheme === 'function') window.EL.applyTheme();
        return;
      }
      if(m === 'wz' && window.WZ && typeof window.WZ.getActiveProfile === 'function'){
        var zp = window.WZ.getActiveProfile();
        if(zp){ Object.assign(zp, snap); window.WZ.saveProfiles(); }
        return;
      }
      if(m === 'sw' && window.SW && typeof window.SW.getActiveProfile === 'function'){
        var swP = window.SW.getActiveProfile();
        if(swP){ Object.assign(swP, snap); window.SW.saveProfiles(); }
        return;
      }
      if(typeof window.getActiveFaerunCharacter === 'function'){
        var ch = window.getActiveFaerunCharacter();
        if(ch){
          Object.assign(ch, snap);
          if(typeof window.saveCharactersToStorage === 'function') window.saveCharactersToStorage();
        }
      }
    } catch(e){}
  }

  function executeSingleTask(t, mode, idx){
    if(!t || typeof t !== 'object') return null;
    var rawAction = t.action || t.type || t.tool || t.command || '';
    if(!rawAction && t.theme) rawAction = 'switch_theme';
    if(!rawAction && (t.screen || t.target || (t.item && (t.item.screen || t.item.target)))) rawAction = 'navigate';
    if(!rawAction && (t.formula || t.dice || (t.item && (t.item.formula || t.item.dice)))) rawAction = 'roll_dice';
    if(!rawAction && (t.code || (t.item && t.item.code))) rawAction = 'run_js';
    if(!rawAction && (t.level != null || t.hp != null || t.ac != null || t.name != null || t.school != null || t.clan != null || t.house != null)) rawAction = 'update_character';
    if(!rawAction) return null;

    var action = String(rawAction).toLowerCase().trim();
    var d = t.item || t.data || t.fields || t.patch || t.params || t;
    var reportId = 'task_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 4);

    // D. ПЕРЕКЛЮЧЕНИЕ ТЕМЫ / ЭКРАНА / РЕЖИМА (проверяем также если action содержит theme)
    if(action === 'switch_theme' || action === 'set_theme' || action === 'change_theme' || action === 'update_theme' || action === 'theme' || (action.indexOf('theme') !== -1 && (d.theme || d.name || d.id || t.theme))){
      var th = String(d.theme || d.name || d.id || d.value || t.theme || '').trim();
      var applied = applyThemeForMode(th, mode);
      var displayTh = (applied && applied.title) ? (applied.title + ' (' + applied.id + ')') : th;
      return {
        reportId: reportId,
        badge: '🎨 Тема оформления изменена',
        name: 'Тема: ' + displayTh,
        meta: 'Визуальное оформление раздела обновлено',
        canUndo: false,
        canOpen: false
      };
    }

    // A. УНИВЕРСАЛЬНОЕ ИЗМЕНЕНИЕ ПАРАМЕТРОВ ПЕРСОНАЖА / ДОСЬЕ / ДАННЫХ
    if(
      action === 'update_character' || action === 'patch_character' || action === 'set_stats' ||
      action === 'edit_character' || action === 'update_profile' || action === 'update_data' ||
      action === 'modify_character' || action === 'change_character' || action === 'set_character' ||
      action === 'change_stats' || action === 'update_stats' || action === 'patch_profile'
    ){
      var prevSnap = captureCharacterSnapshot(mode);
      var changes = applyCharacterPatch(d, mode);
      if(changes.length){
        taskRegistry[reportId] = {
          mode: mode,
          type: 'character',
          open: function(){
            resolveAndNavigateScreen('data', mode);
          },
          undo: function(){
            restoreCharacterSnapshot(mode, prevSnap);
          }
        };
        return {
          reportId: reportId,
          badge: '✓ Параметры обновлены',
          name: 'Досье персонажа (' + getModeContext(mode).heroName + ')',
          meta: changes.join(' • '),
          canUndo: !!prevSnap,
          canOpen: true
        };
      }
    }

    // B. ПРЯМАЯ УСТАНОВКА ПОЛЕЙ DOM НА ОТКРЫТОМ ЭКРАНЕ
    if(action === 'set_dom_fields' || action === 'fill_form' || action === 'set_fields'){
      var map = d.fields || d;
      var domChanged = [];
      Object.keys(map).forEach(function(sel){
        if(sel === 'action' || sel === 'type' || sel === 'tool') return;
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
    if(action === 'run_js' || action === 'exec_js' || action === 'execute_js' || action === 'js'){
      var codeStr = d.code || t.code || '';
      var titleStr = String(d.title || t.title || '');
      if(codeStr){
        try {
          // Если ИИ попытался через run_js сделать переход на экран — перехватываем и дополнительно гарантируем живой переход
          var combinedNavHint = (titleStr + ' ' + codeStr).toLowerCase();
          var fn = new Function('mode', codeStr);
          var jsResult = fn(mode);
          if(combinedNavHint.indexOf('переход') !== -1 || combinedNavHint.indexOf('откр') !== -1 || combinedNavHint.indexOf('navigate') !== -1 || combinedNavHint.indexOf('экран') !== -1){
            resolveAndNavigateScreen(titleStr + ' ' + codeStr, mode);
          }
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

    // E. ЖИВОЙ ПЕРЕХОД НА ЭКРАН
    if(
      action === 'navigate' || action === 'open_screen' || action === 'go_to' ||
      action === 'switch_screen' || action === 'change_screen' || action === 'screen' || action === 'open'
    ){
      var targetScreen = String(d.screen || d.target || d.name || d.id || t.screen || t.target || '').trim();
      if(targetScreen){
        var navRes = resolveAndNavigateScreen(targetScreen, mode);
        if(navRes){
          return {
            reportId: reportId,
            badge: '🧭 Переход выполнен вживую',
            name: 'Экран: ' + (navRes.title || navRes.screen),
            meta: 'Открыт экран «' + (navRes.title || navRes.screen) + '»',
            canUndo: false,
            canOpen: false
          };
        }
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
          if(Array.isArray(h.customSkills)) h.customSkills = h.customSkills.filter(matchFn);
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

    // 6. ЖИВОЙ БРОСОК КУБИКОВ НА ЭКРАНЕ КОСТЕЙ
    if(action === 'roll_dice' || action === 'roll' || action === 'dice_roll' || action === 'dice'){
      var rawFormula = d.formula || d.dice || d.notation || t.formula || t.dice || '1d20';
      var rawLabel = d.label || d.name || d.title || t.label || 'Бросок';
      var rollRes = executeLiveDiceRoll(rawFormula, rawLabel, mode);
      return {
        reportId: reportId,
        badge: '🎲 Бросок вживую: ' + rollRes.total,
        name: rawLabel + ' (' + rollRes.formula + ')',
        meta: 'Кости на столе: [' + rollRes.rolls.join(', ') + ']' + (rollRes.mod ? (' ' + (rollRes.mod > 0 ? '+' : '') + rollRes.mod) : '') + ' = ' + rollRes.total,
        canUndo: false,
        canOpen: false
      };
    }

    return null;
  }

  function normalizeTasksFromParsed(parsed){
    if(!parsed || typeof parsed !== 'object') return [];
    var rawList = [];
    if(Array.isArray(parsed.tasks)) rawList = parsed.tasks.slice();
    else if(Array.isArray(parsed.actions)) rawList = parsed.actions.slice();
    else if(parsed.task && typeof parsed.task === 'object') rawList = [parsed.task];

    if(rawList.length === 0){
      if(parsed.action || parsed.type || parsed.tool){
        rawList.push({
          action: parsed.action || parsed.type || parsed.tool,
          item: parsed.item || parsed.data || parsed.fields || parsed.patch || parsed
        });
      } else if(parsed.theme){
        rawList.push({ action: 'switch_theme', item: { theme: parsed.theme } });
      } else if(parsed.screen || parsed.target){
        rawList.push({ action: 'navigate', item: { screen: parsed.screen || parsed.target } });
      } else if(parsed.formula || parsed.dice){
        rawList.push({ action: 'roll_dice', item: { formula: parsed.formula || parsed.dice, label: parsed.label || 'Бросок' } });
      } else if(parsed.patch && typeof parsed.patch === 'object'){
        rawList.push({ action: 'update_character', item: parsed.patch });
      } else if(parsed.character && typeof parsed.character === 'object'){
        rawList.push({ action: 'update_character', item: parsed.character });
      }
    }
    return rawList;
  }

  function getHeroAbilityMod(statKey, mode){
    var m = mode || getActiveMode();
    var score = 10;
    try {
      if(m === 'me' && window.ME && typeof window.ME.getChar === 'function'){
        var mc = window.ME.getChar();
        if(mc && mc.stats && mc.stats[statKey] != null) score = Number(mc.stats[statKey]) || 10;
      } else if(typeof window.getActiveFaerunCharacter === 'function'){
        var ch = window.getActiveFaerunCharacter();
        if(ch && ch.abilities && ch.abilities[statKey] != null) score = Number(ch.abilities[statKey]) || 10;
      }
    } catch(e){}
    return Math.floor((score - 10) / 2);
  }

  function detectScreenAndDiceIntent(userText, mode){
    var u = String(userText || '').trim();
    var low = u.toLowerCase();
    var result = { navTarget: '', diceFormula: '', diceLabel: '', advMode: '' };

    // 1. Чистая формула броска (например: "1d20", "d20", "2d6+3", "3к8-1", "к20")
    var mPureDice = u.match(/^\s*(\d{0,2}\s*[dкk]\s*\d{1,4}(?:\s*[+-]\s*\d{1,3})?)\s*$/i);
    var mDice = mPureDice || u.match(/(?:^|[\s,(])(\d{0,2}\s*[dкk]\s*\d{1,4}(?:\s*[+-]\s*\d{1,3})?)(?=$|[\s,.!)])/i);
    var hasRollVerb = /(?:кинь|кин[ьте]*|брось|брос[ить]*|выбрось|ролл|roll|прокинь)/i.test(low);

    if(low.indexOf('преимуществ') !== -1 && (hasRollVerb || low.indexOf('бросок') !== -1 || low.indexOf('d20') !== -1 || low.indexOf('д20') !== -1 || low.length < 32)){
      result.diceFormula = '2d20';
      result.diceLabel = 'Бросок с преимуществом (2d20)';
      result.advMode = 'adv';
    } else if(low.indexOf('помех') !== -1 && (hasRollVerb || low.indexOf('бросок') !== -1 || low.indexOf('d20') !== -1 || low.indexOf('д20') !== -1 || low.length < 32)){
      result.diceFormula = '2d20';
      result.diceLabel = 'Бросок с помехой (2d20)';
      result.advMode = 'dis';
    } else if(mPureDice){
      var fPure = mPureDice[1].replace(/\s+/g, '').replace(/[кk]/gi, 'd');
      if(/^d\d+/i.test(fPure)) fPure = '1' + fPure;
      result.diceFormula = fPure;
      result.diceLabel = 'Бросок ' + result.diceFormula;
    } else if(mDice && (hasRollVerb || low.indexOf('кост') !== -1 || low.indexOf('кубик') !== -1 || low.indexOf('кубов') !== -1 || low.indexOf('бросок') !== -1 || low.indexOf('на ') !== -1)){
      var fMatch = mDice[1].replace(/\s+/g, '').replace(/[кk]/gi, 'd');
      if(/^d\d+/i.test(fMatch)) fMatch = '1' + fMatch;
      result.diceFormula = fMatch;
      result.diceLabel = 'Бросок ' + result.diceFormula;
    } else if(hasRollVerb && (low.indexOf('кост') !== -1 || low.indexOf('кубик') !== -1 || low.indexOf('д20') !== -1 || low.indexOf('d20') !== -1 || low.indexOf('двадцатк') !== -1 || low === 'брось' || low === 'кинь')){
      result.diceFormula = '1d20';
      result.diceLabel = 'Бросок 1d20';
    } else if(/(?:проверк[ау]|спасбросок|спас|бросок)\s+(?:на\s+)?(?:сил[ыу]|ловкост[иь]|телосложени[яе]|интеллект[ау]?|мудрост[иь]|харизм[ыу]|инициатив[ыу])/i.test(low) || /^инициатив[ау]$/i.test(low)){
      var statMap = [
        ['str', /сил[ыу]/i, 'Проверка Силы'],
        ['dex', /ловкост[иь]|инициатив/i, low.indexOf('инициатив') !== -1 ? 'Инициатива' : 'Проверка Ловкости'],
        ['con', /телосложени[яе]/i, 'Проверка Телосложения'],
        ['int', /интеллект/i, 'Проверка Интеллекта'],
        ['wis', /мудрост[иь]/i, 'Проверка Мудрости'],
        ['cha', /харизм[ыу]/i, 'Проверка Харизмы']
      ];
      for(var si = 0; si < statMap.length; si++){
        if(statMap[si][1].test(low)){
          var modVal = getHeroAbilityMod(statMap[si][0], mode);
          result.diceFormula = '1d20' + (modVal > 0 ? ('+' + modVal) : (modVal < 0 ? String(modVal) : ''));
          result.diceLabel = statMap[si][2] + ' (' + result.diceFormula + ')';
          break;
        }
      }
    }

    // 2. Проверка запроса на переход / открытие экрана (с глаголом или короткой прямой командой)
    var hasNavVerb = /(?:открой|открыть|перейди|перейти|переключи|зайди|покажи|включи\s+экран|на\s+экран)/i.test(low);
    var isShortScreenCmd = /^(?:карт[ау]|атлас|кост[ией]|кубик[иов]?|данн[ыех]|досье|анкет[ау]|способност[ией]|техник[иу]|умени[яй]|приём[ыов]|прием[ыов]|арсенал|навык[иов]|алхими[яю]|рецепт[ыов]|зель[яй]|маги[яю]|заклинани[яй]|класс[ыов]|архетип[ыов]|справк[ау]|кодекс|бестиари[йя]|гвинт|таверн[ау]|корабл[ья]|главн[аяую]|домой|меню)$/i.test(low);

    if((hasNavVerb || isShortScreenCmd) && !result.diceFormula){
      if(low.indexOf('кост') !== -1 || low.indexOf('кубик') !== -1 || low.indexOf('броск') !== -1 || low.indexOf('бросок') !== -1 || low.indexOf('dice') !== -1){
        result.navTarget = 'dice';
      } else if(low.indexOf('данн') !== -1 || low.indexOf('досье') !== -1 || low.indexOf('анкет') !== -1 || low.indexOf('профил') !== -1 || low.indexOf('квент') !== -1){
        result.navTarget = 'data';
      } else if(low.indexOf('способност') !== -1 || low.indexOf('техник') !== -1 || low.indexOf('умения') !== -1 || low.indexOf('биотик') !== -1 || low.indexOf('знак') !== -1){
        result.navTarget = 'techs';
      } else if(low.indexOf('приём') !== -1 || low.indexOf('прием') !== -1 || low.indexOf('арсенал') !== -1 || low.indexOf('фехтован') !== -1 || low.indexOf('дуэл') !== -1){
        result.navTarget = 'moves';
      } else if(low.indexOf('навык') !== -1){
        result.navTarget = 'skills';
      } else if(low.indexOf('алхим') !== -1 || low.indexOf('рецепт') !== -1 || low.indexOf('зель') !== -1 || low.indexOf('эликсир') !== -1){
        result.navTarget = 'recipes';
      } else if(low.indexOf('карт') !== -1 || low.indexOf('атлас') !== -1){
        result.navTarget = 'map';
      } else if(low.indexOf('класс') !== -1 || low.indexOf('архетип') !== -1){
        result.navTarget = 'classes';
      } else if(low.indexOf('справк') !== -1 || low.indexOf('кодекс') !== -1 || low.indexOf('глоссар') !== -1 || low.indexOf('бестиар') !== -1){
        result.navTarget = 'ref';
      } else if(low.indexOf('гвинт') !== -1 || low.indexOf('покер') !== -1 || low.indexOf('таверн') !== -1 || low.indexOf('игр') !== -1){
        result.navTarget = 'games';
      } else if(low.indexOf('корабл') !== -1 || low.indexOf('звездолёт') !== -1 || low.indexOf('звездолет') !== -1){
        result.navTarget = 'ship';
      } else if(low.indexOf('маги') !== -1 || low.indexOf('заклинан') !== -1){
        result.navTarget = 'magic';
      } else if(low.indexOf('главн') !== -1 || low.indexOf('меню') !== -1 || low.indexOf('домой') !== -1){
        result.navTarget = 'home';
      }
    }

    return result;
  }

  function applyRelativeHpDeltaOrRest(userText, mode){
    var u = String(userText || '').trim();
    var low = u.toLowerCase();
    var m = mode || getActiveMode();

    // Проверка на урон ("урон 15", "получил 12 урона", "-15 хп", "минус 10 хп")
    var mDmg = u.match(/(?:урон[ау]?|потерял|минус)\s*(?:на|=|:)?\s*(\d{1,4})/i) ||
               u.match(/(\d{1,4})\s*(?:ед\.\s*)?урон[ау]?/i) ||
               u.match(/(?:^|\s)-\s*(\d{1,4})\s*(?:хп|hp|хит[а-я]*|здоров[ьяю])/i);

    // Проверка на лечение ("лечение 20", "исцели 15", "+20 хп", "восстанови 15 хп")
    var mHeal = u.match(/(?:лечени[ея]|исцел[иять]*|вылеч[иь]|восстанов[ить]*|плюс)\s*(?:на|=|:)?\s*(\d{1,4})/i) ||
                u.match(/(?:^|\s)\+\s*(\d{1,4})\s*(?:хп|hp|хит[а-я]*|здоров[ьяю])/i);

    var isRest = /(?:долгий\s+отдых|короткий\s+отдых|полный\s+отдых|полное\s+лечение|восстанови\s+всё|привал)/i.test(low);

    if(!mDmg && !mHeal && !isRest) return null;

    var curHp = null;
    if(m === 'wi' && window.WI && typeof window.WI.getActiveProfile === 'function'){
      var wp = window.WI.getActiveProfile();
      if(wp) curHp = Number(wp.hp) || 50;
    } else if(m === 'sh' && window.SH && window.SH.meta){
      curHp = Number(window.SH.meta.hp) || 50;
    } else if(m === 'me' && window.ME && typeof window.ME.getChar === 'function'){
      var mc = window.ME.getChar();
      if(mc) curHp = Number(mc.maxHp) || 50;
    } else if(m === 'el' && window.EL && typeof window.EL.getProfile === 'function'){
      var ep = window.EL.getProfile();
      if(ep) curHp = Number(ep.hp) || 40;
    } else if(m === 'wz' && window.WZ && typeof window.WZ.getActiveProfile === 'function'){
      var zp = window.WZ.getActiveProfile();
      if(zp) curHp = Number(zp.hp) || 40;
    } else if(m === 'sw' && window.SW && typeof window.SW.getActiveProfile === 'function'){
      var swP = window.SW.getActiveProfile();
      if(swP) curHp = Number(swP.hp) || 50;
    } else if(typeof window.getActiveFaerunCharacter === 'function'){
      var ch = window.getActiveFaerunCharacter();
      if(ch) curHp = Number(ch.hpCurrent != null ? ch.hpCurrent : ch.hpMax) || 30;
    }

    if(mDmg && curHp != null){
      var dmgVal = parseInt(mDmg[1], 10) || 0;
      var nextHp = Math.max(0, curHp - dmgVal);
      if(m === 'faerun' && typeof window.getActiveFaerunCharacter === 'function'){
        var fCh = window.getActiveFaerunCharacter();
        if(fCh && fCh.hpCurrent != null) return { hpCurrent: nextHp, hpMax: nextHp };
      }
      return { hp: nextHp, hpMax: nextHp, maxHp: nextHp };
    }
    if(mHeal && curHp != null){
      var healVal = parseInt(mHeal[1], 10) || 0;
      var healedHp = curHp + healVal;
      if(m === 'faerun' && typeof window.getActiveFaerunCharacter === 'function'){
        var fCh2 = window.getActiveFaerunCharacter();
        if(fCh2 && fCh2.hpCurrent != null) return { hpCurrent: healedHp, hpMax: healedHp };
      }
      return { hp: healedHp, hpMax: healedHp, maxHp: healedHp };
    }
    if(isRest){
      if(m === 'faerun' && typeof window.getActiveFaerunCharacter === 'function'){
        var fCh3 = window.getActiveFaerunCharacter();
        if(fCh3){
          return { hpCurrent: fCh3.hpMax || 40, exhaustion: 0 };
        }
      }
      if(curHp != null) return { hp: curHp };
    }
    return null;
  }

  function ensureLiveActionsCompleted(userText, reports, mode){
    var intent = detectScreenAndDiceIntent(userText, mode);
    var outReports = Array.isArray(reports) ? reports.slice() : [];

    // Если пользователь просил открыть экран (и это не перекрывается живым броском кубиков, который сам открывает dice)
    if(intent.navTarget && (!intent.diceFormula || intent.navTarget !== 'dice')){
      var expectedScreen = getScreenMapForMode(mode)[intent.navTarget] || intent.navTarget;
      var curScreen = (window.view && window.view.screen) ? window.view.screen : '';
      if(curScreen !== expectedScreen){
        var navRep = executeSingleTask({ action: 'navigate', item: { screen: intent.navTarget } }, mode, outReports.length);
        if(navRep) outReports.push(navRep);
      }
    }

    // Если пользователь просил бросить кубики, проверяем, были ли реально брошены кубики вживую на экране dice
    if(intent.diceFormula && !liveDiceRolledInBatch){
      var diceRep = executeSingleTask({
        action: 'roll_dice',
        item: { formula: intent.diceFormula, label: intent.diceLabel || 'Бросок' }
      }, mode, outReports.length);
      if(diceRep) outReports.push(diceRep);
    }

    return outReports;
  }

  function tryDeterministicFallback(userText, replyText, mode){
    var u = String(userText || '').trim();
    var lowU = u.toLowerCase();
    var combined = (u + ' ' + String(replyText || '')).toLowerCase();
    var fallbackTasks = [];

    // 0. Детерминированное распознавание перехода на экран и живого броска костей
    var navDice = detectScreenAndDiceIntent(u, mode);
    if(navDice.navTarget && (!navDice.diceFormula || navDice.navTarget !== 'dice')){
      fallbackTasks.push({ action: 'navigate', item: { screen: navDice.navTarget } });
    }
    if(navDice.diceFormula){
      fallbackTasks.push({ action: 'roll_dice', item: { formula: navDice.diceFormula, label: navDice.diceLabel || 'Бросок' } });
    }

    // 1. Детерминированное распознавание смены темы оформления
    if(lowU.indexOf('тем') !== -1 || lowU.indexOf('оформлен') !== -1 || lowU.indexOf('theme') !== -1){
      var themeCand = '';
      if(mode === 'wi'){
        if(combined.indexOf('синдикат') !== -1 || combined.indexOf('бандит') !== -1 || combined.indexOf('новиград') !== -1 || combined.indexOf('syndicate') !== -1) themeCand = 'syndicate';
        else if(combined.indexOf('дракон') !== -1 || combined.indexOf('оникс') !== -1 || combined.indexOf('dragon') !== -1) themeCand = 'dragon';
        else if(combined.indexOf('охот') !== -1 || combined.indexOf('хлад') !== -1 || combined.indexOf('wildhunt') !== -1 || combined.indexOf('hunt') !== -1) themeCand = 'hunt';
        else if(combined.indexOf('скеллиг') !== -1 || combined.indexOf('skellige') !== -1) themeCand = 'skellige';
        else if(combined.indexOf('скоя') !== -1 || combined.indexOf('эльф') !== -1 || combined.indexOf('scoiatael') !== -1) themeCand = 'scoiatael';
        else if(combined.indexOf('нильф') !== -1 || combined.indexOf('солнц') !== -1 || combined.indexOf('nilfgaard') !== -1) themeCand = 'nilfgaard';
        else if(combined.indexOf('север') !== -1 || combined.indexOf('темери') !== -1 || combined.indexOf('north') !== -1) themeCand = 'north';
        else if(combined.indexOf('волк') !== -1 || combined.indexOf('игни') !== -1 || combined.indexOf('wolf') !== -1) themeCand = 'wolf';
      } else if(mode === 'me'){
        if(combined.indexOf('цербер') !== -1 || combined.indexOf('cerberus') !== -1) themeCand = 'cerberus';
        else if(combined.indexOf('жнец') !== -1 || combined.indexOf('reaper') !== -1) themeCand = 'reaper';
        else if(combined.indexOf('азари') !== -1 || combined.indexOf('asari') !== -1) themeCand = 'asari';
        else if(combined.indexOf('квари') !== -1 || combined.indexOf('quarian') !== -1) themeCand = 'quarian';
        else if(combined.indexOf('кроган') !== -1 || combined.indexOf('krogan') !== -1) themeCand = 'krogan';
        else if(combined.indexOf('тури') !== -1 || combined.indexOf('turian') !== -1) themeCand = 'turian';
        else if(combined.indexOf('салар') !== -1 || combined.indexOf('salarian') !== -1) themeCand = 'salarian';
        else if(combined.indexOf('гет') !== -1 || combined.indexOf('geth') !== -1) themeCand = 'geth';
        else if(combined.indexOf('омег') !== -1 || combined.indexOf('ари') !== -1 || combined.indexOf('aria') !== -1) themeCand = 'aria';
        else if(combined.indexOf('альянс') !== -1 || combined.indexOf('alliance') !== -1) themeCand = 'alliance';
      } else if(mode === 'sw'){
        if(combined.indexOf('сит') !== -1 || combined.indexOf('sith') !== -1 || combined.indexOf('тьм') !== -1 || combined.indexOf('тёмн') !== -1 || combined.indexOf('темн') !== -1) themeCand = 'sith';
        else if(combined.indexOf('джед') !== -1 || combined.indexOf('jedi') !== -1 || combined.indexOf('свет') !== -1) themeCand = 'jedi';
      } else if(mode === 'el'){
        if(combined.indexOf('огон') !== -1) themeCand = 'Огонь';
        else if(combined.indexOf('вод') !== -1) themeCand = 'Вода';
        else if(combined.indexOf('земл') !== -1) themeCand = 'Земля';
        else if(combined.indexOf('ветер') !== -1 || combined.indexOf('воздух') !== -1) themeCand = 'Ветер';
        else if(combined.indexOf('тьм') !== -1) themeCand = 'Тьма';
        else if(combined.indexOf('аватар') !== -1) themeCand = 'Аватар';
      } else if(mode === 'wz'){
        if(combined.indexOf('слизерин') !== -1) themeCand = 'Слизерин';
        else if(combined.indexOf('гриффиндор') !== -1) themeCand = 'Гриффиндор';
        else if(combined.indexOf('когтевран') !== -1 || combined.indexOf('рейвенкло') !== -1) themeCand = 'Когтевран';
        else if(combined.indexOf('пуффендуй') !== -1 || combined.indexOf('хаффлпафф') !== -1) themeCand = 'Пуффендуй';
      }
      if(themeCand){
        fallbackTasks.push({ action: 'switch_theme', item: { theme: themeCand } });
      }
    }

    // 2. Детерминированное распознавание изменения базовых параметров персонажа
    var patch = {};
    var hasPatch = false;

    var relHp = applyRelativeHpDeltaOrRest(u, mode);
    if(relHp){
      Object.assign(patch, relHp);
      hasPatch = true;
    }

    var mLvl = u.match(/(?:уровен[ьяюем]*|ур\.?|level|lvl)\s*(?:на|=|:|-)?\s*(\d{1,2})(?!\d)/i) || u.match(/(?:^|\s)(\d{1,2})\s*(?:уровен[ьяюем]*|ур\.?|ого\s+уровня|-го\s+уровня|курс[ау]?|lvl|level)/i);
    if(mLvl){ patch.level = parseInt(mLvl[1], 10); hasPatch = true; }

    if(!relHp){
      var mHp = u.match(/(?:хит[а-я]*|здоров[ьяюем]*|хп|hp)\s*(?:на|=|:|-)?\s*(\d{1,4})(?!\d)/i) || u.match(/(?:^|\s)(\d{1,4})\s*(?:хит[а-я]*|хп|hp|ед\.\s*здоровья)/i);
      if(mHp){ patch.hp = parseInt(mHp[1], 10); patch.hpMax = patch.hp; patch.maxHp = patch.hp; hasPatch = true; }
    }

    var mAc = u.match(/(?:кд|кб|ac|класс\s*(?:доспеха|брони))\s*(?:на|=|:|-)?\s*(\d{1,2})(?!\d)/i) || u.match(/(?:^|\s)(\d{1,2})\s*(?:кд|кб|ac)(?=\s|$|[,.!])/i);
    if(mAc){ patch.ac = parseInt(mAc[1], 10); patch.baseAc = patch.ac; hasPatch = true; }

    var mEn = u.match(/(?:энерги[яюией]|выносливост[ьию]|vigor|energy)\s*(?:на|=|:|-)?\s*(\d{1,4})(?!\d)/i) || u.match(/(?:^|\s)(\d{1,4})\s*(?:энерги[яюи]|выносливост[ьи])/i);
    if(mEn){ patch.energy = parseInt(mEn[1], 10); hasPatch = true; }

    var mCh = u.match(/(?:чакр[ауыеой]|chakra)\s*(?:на|=|:|-)?\s*(\d{1,4})(?!\d)/i) || u.match(/(?:^|\s)(\d{1,4})\s*(?:чакр[ауые]|ед\.\s*чакры)/i);
    if(mCh){ patch.chakra = String(mCh[1]); hasPatch = true; }

    var mSh = u.match(/(?:щит[ыаов]*|shield)\s*(?:на|=|:|-)?\s*(\d{1,4})(?!\d)/i) || u.match(/(?:^|\s)(\d{1,4})\s*(?:щит[ыаов]*)/i);
    if(mSh){ patch.baseShield = parseInt(mSh[1], 10); hasPatch = true; }

    var mName = u.match(/(?:имя(?:\s+персонажа)?|назови(?:\s+его|\s+меня)?|зовут)\s+(?:на\s+)?[«"']?([А-ЯЁA-Z][а-яёa-zА-ЯЁA-Z0-9\s\-]{1,28})[»"']?/);
    if(mName){ patch.name = mName[1].trim(); hasPatch = true; }

    var mSchool = u.match(/(?:школ[ауые]\s+ведьмака|школ[ауые])\s+[«"']?([А-ЯЁA-Zа-яёa-z\-]{3,20})[»"']?/i);
    if(mSchool && mode === 'wi'){
      var sRaw = mSchool[1].trim();
      patch.school = 'Школа ' + sRaw.charAt(0).toUpperCase() + sRaw.slice(1);
      hasPatch = true;
    }

    var mClan = u.match(/(?:клан[ауе]?)\s+[«"']?([А-ЯЁA-Zа-яёa-z\-]{2,20})[»"']?/i);
    if(mClan && mode === 'sh'){
      var cRaw = mClan[1].trim();
      patch.clan = cRaw.charAt(0).toUpperCase() + cRaw.slice(1);
      hasPatch = true;
    }

    var statPatterns = [
      ['str', /(?:сил[ауыеой]|str)\s*(?:на|=|:|-)?\s*(\d{1,2})(?!\d)/i],
      ['dex', /(?:ловкост[ьию]|dex)\s*(?:на|=|:|-)?\s*(\d{1,2})(?!\d)/i],
      ['con', /(?:телосложени[еяю]|con)\s*(?:на|=|:|-)?\s*(\d{1,2})(?!\d)/i],
      ['int', /(?:интеллект[ауе]?|int)\s*(?:на|=|:|-)?\s*(\d{1,2})(?!\d)/i],
      ['wis', /(?:мудрост[ьию]|wis)\s*(?:на|=|:|-)?\s*(\d{1,2})(?!\d)/i],
      ['cha', /(?:харизм[ауыеой]|cha)\s*(?:на|=|:|-)?\s*(\d{1,2})(?!\d)/i]
    ];
    statPatterns.forEach(function(sp){
      var mSt = u.match(sp[1]);
      if(mSt){
        patch[sp[0]] = parseInt(mSt[1], 10);
        hasPatch = true;
      }
    });

    if(hasPatch){
      fallbackTasks.push({ action: 'update_character', item: patch });
    }

    // 3. Детерминированное удаление по названию ("удали способность Огненный шар")
    var mDel = u.match(/^(?:удали|убрать|убери|стереть|сотри)\s+(?:способност[ьи]|приём|прием|техник[уи]|заклинани[ея]|рецепт|зелье)?\s*[«"']?(.+?)[»"']?$/i);
    if(mDel && mDel[1]){
      fallbackTasks.push({ action: 'delete_item', item: { name: mDel[1].trim() } });
    }

    if(fallbackTasks.length > 0){
      return executeTasksBatch(fallbackTasks, mode);
    }
    return [];
  }

  /* ---------- МГНОВЕННЫЙ ЛОКАЛЬНЫЙ ИСПОЛНИТЕЛЬ ЧАТ-КОМАНД (БЕЗ ЗАПРОСА К GEMINI API) ---------- */
  function requiresAiReasoning(userText){
    var low = String(userText || '').trim().toLowerCase();
    if(/^(?:помощь|команды|что\s+ты\s+умеешь|справка\s+по\s+командам|help|\?)$/i.test(low)) return false;
    // Запросы на генерацию новых способностей, приёмов, рецептов, заклинаний, лора, тактики или полное заполнение анкеты требуют ИИ
    return /(?:придума|сочин|сгенер|создай|добав[ьи]|напиш|расскаж|объясн|подскаж|посовет|почему|зачем|как\s+мне|кто\s+так|что\s+так|заполни\s+анкет|проанализир|комбо|комбинац|тактик|истори|квент|описан|перевед|перепиш)/i.test(low);
  }

  function tryInstantLocalCommand(userText, mode){
    var u = String(userText || '').trim();
    var low = u.toLowerCase();
    if(!u) return null;

    // Если запрос просит ИИ что-то придумать/создать/добавить/объяснить — передаём в Gemini API
    if(requiresAiReasoning(u)) return null;

    // 1. Справка по быстрым чат-командам ("помощь", "команды", "что ты умеешь")
    if(/^(?:помощь|команды|что\s+ты\s+умеешь|справка\s+по\s+командам|help|\?)$/i.test(low)){
      return {
        reply:
          '✨ <b>Мгновенные чат-команды (выполняются без запроса к ИИ):</b>\n' +
          '• <b>Броски костей:</b> «брось 1d20», «2d6+3», «кинь с преимуществом», «проверка ловкости», «инициатива»\n' +
          '• <b>Экраны:</b> «открой карту», «кости», «способности», «приёмы», «навыки», «алхимия», «досье», «кодекс», «домой»\n' +
          '• <b>Параметры и бой:</b> «уровень 7, хп 65, кд 18», «сила 18», «урон 12», «лечение 20», «долгий отдых»\n' +
          '• <b>Темы:</b> «тема синдикат», «тема дикая охота», «тема ониксовый дракон», «тема цербер», «тема ситх»\n' +
          '• <b>Фамильяр Орбис:</b> «вылетай», «в сферу», «сальто», «вальс», «спи», «проснись», «медитация», «вари зелье», «костёр», «щит», «космос», «колдуй», «бард», «бой», «читай», «сканируй», «жонглируй», «стелс», «авто режим»',
        reports: []
      };
    }

    // 2. Прямые команды управления фамильяром Орбисом и его анимациями через чат
    if(/^(?:вылета[йть]|выпусти(?:\s+на\s+экран)?|гуля[йть]|лета[йть]|свободный\s+пол[её]т|выйди\s+из\s+сферы|на\s+прогулку)$/i.test(low)){
      startRoaming(true);
      return {
        reply: '✨ Вылетаю из сферы в свободный полёт по экрану! Чтобы вернуть меня, напиши <b>«в сферу»</b>.',
        reports: []
      };
    }
    if(/^(?:в\s+сферу|вернись(?:\s+в\s+сферу)?|вернуть\s+в\s+сферу|домой\s+в\s+сферу|спрячься\s+в\s+сферу)$/i.test(low)){
      stopRoaming(false);
      return {
        reply: '↩ Возвращаюсь обратно в своё эфирное гнездо-сферу!',
        reports: []
      };
    }
    if(/^(?:автовылет|авто-вылет)\s+(?:вкл|выкл|on|off)$/i.test(low)){
      var turnOn = /(?:вкл|on)$/i.test(low);
      autoRoamEnabled = turnOn;
      try { localStorage.setItem(AUTO_ROAM_STORAGE_KEY, autoRoamEnabled ? '1' : '0'); } catch(e){}
      if(!autoRoamEnabled && isRoaming && !manualRoam) stopRoaming(false);
      updateMascotControlBar();
      return {
        reply: turnOn ? '🦋 Автоматический вылет фамильяра <b>включён</b>.' : '🦋 Автоматический вылет фамильяра <b>выключен</b>.',
        reports: []
      };
    }
    if(/^(?:сальто|кувырок|бочка|сделай\s+сальто|сделай\s+бочку|трюк)$/i.test(low)){
      triggerBarrelRoll('🤸 Воздушное сальто на 360°! +10 к Акробатике!');
      return {
        reply: '🤸 Вжух! Исполнил воздушное сальто на 360 градусов!',
        reports: []
      };
    }
    if(/^(?:вальс|танец|станцуй|восьм[её]рка|покружись|кружись)$/i.test(low)){
      triggerWaltzSpin('✨ Эфирный пируэт в невесомости!');
      return {
        reply: '✨ Исполняю плавный эфирный вальс в воздухе!',
        reports: []
      };
    }
    if(/^(?:потянись|разминка|проснуться|проснись|подъ[её]м|не\s+спи)$/i.test(low)){
      triggerStretchWake('🌅 Ух, хорошо потянулся! Готов к приключениям!');
      return {
        reply: '🌅 Потянулся и полностью готов к новым приключениям!',
        reports: []
      };
    }
    if(/^(?:спи|усни|уснуть|спать|режим\s+сна)$/i.test(low)){
      lockedShowMode = 'auto';
      setMascotMood('sleep');
      return {
        reply: '💤 Устраиваюсь поудобнее и засыпаю... Напиши <b>«проснись»</b> или проведи курсором рядом, когда понадоблюсь.',
        reports: []
      };
    }
    if(/^(?:авто\s*режим|обычный\s+режим|сбрось\s+режим|режим\s+авто)$/i.test(low)){
      lockedShowMode = 'auto';
      setMascotMood('idle');
      return {
        reply: '🎭 Включён спокойный автономный режим жизни фамильяра.',
        reports: []
      };
    }

    var mascotModeCommands = [
      { mode: 'meditate', re: /^(?:режим\s+)?(?:медитаци[яи]|медитируй|дзен|zen)$/i, reply: '🧘 Погружаюсь в астральную медитацию и вращаю сферы равновесия...' },
      { mode: 'alchemy',  re: /^(?:режим\s+)?(?:алхимик|вари\s+зелье|зельеварени[ея]|варить\s+эликсир)$/i, reply: '🧪 Достал алхимическую колбу — эликсир уже булькает!' },
      { mode: 'campfire', re: /^(?:режим\s+)?(?:кост[её]р|у\s+костра|погрейся)$/i, reply: '🔥 Развёл тёплый эфирный костёр для уютного привала.' },
      { mode: 'shield',   re: /^(?:режим\s+)?(?:щит|эфирный\s+щит|барьер|защита)$/i, reply: '🛡️ Развернул гексагональный защитный барьер вокруг ядра!' },
      { mode: 'cosmos',   re: /^(?:режим\s+)?(?:космос|астрал|невесомость|левитаци[яи]|зв[её]зды)$/i, reply: '🪐 Парим в звёздной невесомости посреди астрального кольца!' },
      { mode: 'curious',  re: /^(?:режим\s+)?(?:любопытств[оа]|изучи|присмотрись)$/i, reply: '🧐 С любопытством наклонил голову и изучаю твой лист персонажа...' },
      { mode: 'mage',     re: /^(?:режим\s+)?(?:маг|архимаг|колдуй|плетение)$/i, reply: '🔮 Активировал печать Архимага и концентрирую плетение!' },
      { mode: 'combat',   re: /^(?:режим\s+)?(?:бой|дуэл[ья]|дуэлянт|боевая\s+стойка|клинки)$/i, reply: '⚔️ Эфирные клинки наготове! Боевая стойка принята!' },
      { mode: 'bard',     re: /^(?:режим\s+)?(?:бард|музыка|сыграй|песня|насвистывай)$/i, reply: '🎵 Насвистываю тавернную балладу для вдохновения (+1d8)!' },
      { mode: 'reading',  re: /^(?:режим\s+)?(?:чтени[ея]|читай|гримуар|книга)$/i, reply: '📖 Открыл древний гримуар и внимательно сверяю правила...' },
      { mode: 'scanner',  re: /^(?:режим\s+)?(?:сканер|сканируй|сыщик|анализ)$/i, reply: '🔍 Включил тактический визор — сканирую параметры!' },
      { mode: 'juggle',   re: /^(?:режим\s+)?(?:жонгл[её]р|жонглируй)$/i, reply: '🎲 Жонглирую двадцатигранниками на удачу!' },
      { mode: 'stealth',  re: /^(?:режим\s+)?(?:стелс|скрытность|тень|спрячься)$/i, reply: '🕵️ Надел повязку тени. Проверка Скрытности: 28!' },
      { mode: 'glitch',   re: /^(?:режим\s+)?(?:глитч|перегрузка)$/i, reply: '⚡ ВЖЖ-БЗЗТ! Кратковременный всплеск эфирного ядра!' }
    ];
    for(var mi = 0; mi < mascotModeCommands.length; mi++){
      if(mascotModeCommands[mi].re.test(low)){
        var pickedM = mascotModeCommands[mi].mode;
        setMascotMood(pickedM, 14000);
        showMascotBubble(pickQuip(pickedM), 3400);
        return {
          reply: mascotModeCommands[mi].reply,
          reports: []
        };
      }
    }

    // 3. Детерминированные задачи приложения (броски костей, переходы на экран, статы, урон/лечение/отдых, смена темы, удаление)
    var intent = detectScreenAndDiceIntent(u, mode);
    var reports = tryDeterministicFallback(u, '', mode);

    if(reports.length > 0){
      var replyParts = [];
      reports.forEach(function(r){
        if(r.badge && r.badge.indexOf('🎲') !== -1){
          // Реакция Орбиса на живой бросок
          var rollMatch = r.meta && r.meta.match(/\[([\d,\s]+)\]/);
          var nums = rollMatch ? rollMatch[1].split(',').map(function(x){ return parseInt(x.trim(), 10); }) : [];
          if(intent.advMode === 'adv' && nums.length >= 2){
            var best = Math.max(nums[0], nums[1]);
            replyParts.push('🎲 <b>Бросок с преимуществом:</b> выпало [' + nums[0] + ', ' + nums[1] + '] → выбираем лучший: <b>' + best + '</b>!');
          } else if(intent.advMode === 'dis' && nums.length >= 2){
            var worst = Math.min(nums[0], nums[1]);
            replyParts.push('🎲 <b>Бросок с помехой:</b> выпало [' + nums[0] + ', ' + nums[1] + '] → выбираем меньший: <b>' + worst + '</b>.');
          } else {
            replyParts.push('🎲 Выполнен живой бросок <b>' + escHtml(r.name) + '</b>! ' + escHtml(r.meta) + '.');
          }
          if(nums.length === 1 && r.name.indexOf('d20') !== -1){
            if(nums[0] === 20){
              triggerBarrelRoll();
              triggerHappyReaction(pickQuip('crit20'));
            } else if(nums[0] === 1){
              triggerStartleWake(pickQuip('crit1'));
            } else {
              setMascotMood('juggle', 4200);
            }
          } else {
            setMascotMood('juggle', 4200);
          }
        } else if(r.badge && r.badge.indexOf('🧭') !== -1){
          replyParts.push('🧭 Открыл <b>' + escHtml(r.name) + '</b>.');
          setMascotMood('curious', 3800);
        } else if(r.badge && r.badge.indexOf('🎨') !== -1){
          replyParts.push('🎨 Переключил оформление: <b>' + escHtml(r.name) + '</b>.');
          triggerWaltzSpin();
        } else if(r.badge && r.badge.indexOf('🗑️') !== -1){
          replyParts.push('🗑️ Удалено: <b>' + escHtml(r.name) + '</b>.');
        } else {
          replyParts.push('✓ <b>' + escHtml(r.name) + ':</b> ' + escHtml(r.meta) + '.');
          if(/(?:привал|отдых)/i.test(low)){
            setMascotMood('campfire', 9000);
          } else {
            triggerHappyReaction();
          }
        }
      });

      return {
        reply: replyParts.join('\n'),
        reports: reports
      };
    }

    return null;
  }

  function isActionIntent(text){
    var low = String(text || '').toLowerCase();
    return /(измен|помен|смен|постав|установ|сдела|добав|созда|удал|убер|заполн|переключ|обнов|прокач|брось|кинь|открой|перейд)/i.test(low);
  }

  function executeTasksBatch(tasks, mode){
    if(!Array.isArray(tasks) || tasks.length === 0) return [];
    liveDiceRolledInBatch = false;
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
        // Не перерисовываем экран поверх живой анимации кубиков на столе (.dice-tray)
        if(!liveDiceRolledInBatch && typeof window.render === 'function'){
          window.render();
        }
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
    var autoCode = getAutoCodeInspection(mode, userText);
    var combinedCodeInspection = [autoCode, extraCodeInspection].filter(Boolean).join('\n\n');

    var recentTurns = history.slice(-8).map(function(m){
      return (m.role === 'user' ? 'Игрок: ' : 'Ассистент: ') + m.text;
    }).join('\n');

    return (
      'Ты — встроенный ИИ-Ассистент и автономный агент управления приложением «Тактический компендиум».\n' +
      'Ты обязан понимать и ВЫПОЛНЯТЬ ЛЮБОЙ запрос пользователя по факту его написания!\n' +
      'ВАЖНЕЙШЕЕ ПРАВИЛО: Никогда не пиши в "reply", что ты что-то изменил, добавил, открыл или бросил, если ты НЕ передал соответствующую задачу в массиве "tasks"! Любое действие в приложении происходит ТОЛЬКО через массив "tasks".\n\n' +
      '=== ТЕКУЩИЙ КОНТЕКСТ ПРИЛОЖЕНИЯ ===\n' +
      '• Активный раздел (mode): "' + mode + '" (' + ctx.worldName + ')\n' +
      '• Открытый сейчас экран (view.screen): "' + curScreen + '"\n' +
      '• Полный JSON-слепок данных активного персонажа и списков раздела:\n' + ctx.fullStateJson + '\n\n' +
      '=== ОСМОТР DOM ОТКРЫТОГО ЭКРАНА (полей ввода на странице) ===\n' + domSnapshot + '\n\n' +
      (combinedCodeInspection ? ('=== РЕЗУЛЬТАТ АВТОМАТИЧЕСКОГО ОСМОТРА ИСХОДНОГО КОДА РАЗДЕЛА ===\n' + combinedCodeInspection + '\n\n') : '') +
      '=== ИНСТРУМЕНТЫ И ЗАДАЧИ (массив "tasks") ===\n' +
      'Когда пользователь просит изменить любые параметры персонажа/анкеты/мира (на экране «Данные» или с любого другого экрана), добавить/удалить/изменить способности, приёмы, рецепты, заклинания, оружие, поменять тему оформления, перейти на экран или бросить кубики — ты ОБЯЗАН вернуть соответствующие задачи в массиве "tasks":\n\n' +
      '1. "update_character" — универсальное изменение любых параметров персонажа, анкеты или мира в текущем разделе ("' + mode + '").\n' +
      '   Передай внутри "item" объект с любыми полями, которые нужно изменить (смотри точные ключи в JSON-слепке выше!).\n' +
      '   Примеры полей для разных разделов:\n' +
      '   - Фаэрун (faerun): { "name": "...", "species": "...", "className": "...", "subclass": "...", "background": "...", "alignment": "...", "level": 5, "xp": 6500, "ac": 18, "hpMax": 45, "initMisc": 2, "hitDiceTotal": "5", "hitDiceType": "d10", "abilities": {"str":18,"dex":14,"con":16,"int":10,"wis":12,"cha":10}, "profArmor": "...", "profWeapons": "...", "languages": "...", "equipment": "...", "features": "...", "backstory": "...", "slots": {"1":4,"2":3} }\n' +
      '   - Ведьмак (wi): { "name": "...", "school": "...", "title": "...", "level": 10, "hp": 80, "ac": 17, "energy": 100, "silverSword": "...", "steelSword": "...", "armor": "...", "notes": "...", "worldName": "...", "worldNote": "...", "theme": "wolf|hunt|north|nilfgaard|scoiatael|skellige|syndicate|dragon" }\n' +
      '   - Шиноби (sh): { "charName": "...", "clan": "...", "village": "...", "rank": "Джонин", "level": "10", "nature": "Молния", "chakra": "120", "hp": "95", "ac": "17", "notes": "...", "worldName": "...", "worldNote": "..." }\n' +
      '   - Mass Effect (me): { "name": "...", "callsign": "...", "race": "...", "role": "...", "origin": "...", "level": 8, "baseAc": 17, "baseShield": 40, "baseArmorPoints": 25, "damageThreshold": 3, "baseBarrier": 20, "maxHp": 65, "stats": {"str":16,"dex":16,"con":14,"int":14,"wis":12,"cha":14}, "omniTool": "...", "bioAmp": "...", "loadout": "...", "backstory": "...", "theme": "alliance|cerberus|reaper|asari|quarian|krogan|turian|salarian|geth|aria" }\n' +
      '   - Стихия (el): { "firstName": "...", "lastName": "...", "element": "Огонь|Вода|Земля|Ветер|Тьма|Аватар|Без стихии", "level": 7, "hp": 55, "ac": 16, "note": "..." }\n' +
      '   - Волшебник (wz): { "firstName": "...", "lastName": "...", "house": "Слизерин|Гриффиндор|Когтевран|Пуффендуй", "year": "5 курс", "title": "...", "hp": 45, "ac": 15, "wand": {"name":"...","wood":"Тис","core":"Перо феникса","length":"11 дюймов","flexibility":"Упругая","features":"..."} }\n' +
      '   - Звёздные войны (sw): { "name": "...", "race": "...", "path": "...", "title": "...", "level": 8, "hp": 70, "ac": 17, "force": 35, "weapon": "...", "armor": "...", "ship": "...", "notes": "...", "theme": "jedi|sith" }\n\n' +
      '2. "switch_theme" — изменить тему оформления раздела.\n' +
      '   "item": { "theme": "syndicate" } (для Ведьмака: wolf, hunt, north, nilfgaard, scoiatael, skellige, syndicate, dragon; для Mass Effect: alliance, cerberus, reaper, asari, quarian, krogan, turian, salarian, geth, aria; для Звёздных войн: jedi, sith; для Стихии: Огонь, Вода, Земля, Ветер, Тьма, Аватар; для Волшебника: Слизерин, Гриффиндор, Когтевран, Пуффендуй).\n\n' +
      '3. "navigate" — вживую открыть нужный экран приложения.\n' +
      '   "item": { "screen": "dice|data|techs|moves|skills|recipes|magic|map|ref|games|ship|home" }\n' +
      '   (где "dice" — экран бросков костей, "data" — экран Данные/Досье, "techs" — Способности/Техники/Умения, "moves" — Боевые приёмы/Арсенал/Дуэли, "skills" — Навыки, "recipes" — Алхимия/Рецепты/Зелья, "map" — Карта, "ref" — Справка/Кодекс, "games" — Гвинт и кости, "ship" — Корабль, "home" — Главная).\n' +
      '   ВАЖНО: Никогда не используй "run_js" для навигации по экранам — всегда используй "navigate"!\n\n' +
      '4. "roll_dice" — вживую открыть экран бросков костей и физически бросить кубики на игровом столе.\n' +
      '   "item": { "label": "Бросок 2d20", "formula": "2d20" } (поддерживаются любые формулы: "1d20", "2d20", "3d6+4", "1d8+1d6+2").\n' +
      '   ВАЖНО: Задача "roll_dice" сама автоматически открывает экран костей и бросает их вживую на стол!\n\n' +
      '5. "add_ability" — добавить способность / технику / знак / биотику / заклинание.\n' +
      '   "item": { "name": "...", "icon": "⚡", "category": "...", "actionCost": "1 действие", "cooldown": "...", "checkOrSave": "...", "dmgN": 3, "dmgD": "d8", "dmgMod": 0, "desc": "Подробное описание..." }\n\n' +
      '6. "add_move" — добавить боевой приём / приём фехтования / дуэльный приём.\n' +
      '   "item": { "name": "...", "icon": "⚔️", "category": "...", "weaponOrStyle": "...", "attackBonus": "+6", "damageOrSave": "2d8+4", "mastery": "...", "actionCost": "...", "trigger": "...", "desc": "..." }\n\n' +
      '7. "add_recipe" — добавить рецепт алхимии / зелье ("item": { "name": "...", "category": "potions|bombs|oils|poisons", "rarity": "Редкий", "cost": 150, "dc": 15, "time": "4 часа", "ingredients": [{"name":"...","qty":1}], "appearance": "...", "effect": "..." }).\n\n' +
      '8. "add_spell" — добавить заклинание ("item": { "name": "...", "level": 3, "school": "evocation", "effect": "..." }).\n\n' +
      '9. "delete_item" — удалить способность, приём или рецепт по названию или ID ("item": { "name": "..." }).\n\n' +
      '10. "set_dom_fields" — напрямую заполнить поля ввода на текущем открытом экране по их селектору из раздела ОСМОТР DOM ("item": { "#id_или_data_field": "значение" }).\n\n' +
      '11. "run_js" — выполнить произвольный JS-код в браузере, если задача нестандартная (например: массовое редактирование карточек, создание нового профиля, сложная модификация состояния). Доступны глобальные объекты window.CHARACTERS, window.saveCharactersToStorage, window.WI, window.SH, window.ME, window.EL, window.WZ, window.SW, window.HB, window.RECIPES, window.SPELLS, localStorage.\n' +
      '   "item": { "title": "Краткое название операции", "code": "...валидный JS код..." }\n\n' +
      '12. ДОПОЛНИТЕЛЬНЫЙ ОСМОТР ИСХОДНОГО КОДА ("inspect_code"):\n' +
      '    Если для точного выполнения задачи тебе нужно заглянуть в исходный код ещё какой-либо функции или глобального объекта приложения, укажи их имена в корневом массиве "inspect_code": ["имяФункцииИлиОбъекта"].\n\n' +
      'Ответь СТРОГО валидным JSON-объектом:\n' +
      '{\n' +
      '  "inspect_code": [],\n' +
      '  "reply": "Твой ответ и отчёт о выполненных действиях на русском языке",\n' +
      '  "tasks": [ { "action": "...", "item": { ... } } ],\n' +
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
          temperature: 0.25,
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

    var mode = getActiveMode();
    // Синхронизируем несохранённые пользовательские поля DOM один раз ПЕРЕД чтением контекста
    syncDomInputsToState(mode);

    // 1. СНАЧАЛА проверяем мгновенный локальный движок команд (кубики, экраны, статы, темы, трюки маскота) БЕЗ запроса к Gemini API!
    var instantOutcome = tryInstantLocalCommand(trimmed, mode);
    if(instantOutcome){
      var locHistory = loadChatHistory(mode);
      locHistory.push({
        role: 'user',
        text: trimmed,
        ts: Date.now()
      });
      locHistory.push({
        role: 'bot',
        text: instantOutcome.reply,
        reports: instantOutcome.reports || [],
        suggestedRolls: [],
        ts: Date.now()
      });
      saveChatHistory(mode, locHistory);
      renderChatHeader();
      renderMessages();
      return;
    }

    // 2. Если запрос требует генерации/ответа ИИ — проверяем ключ Gemini API
    var apiKey = getApiKey();
    if(!apiKey){
      var ok = promptApiKey();
      if(!ok) return;
      apiKey = getApiKey();
    }

    var history = loadChatHistory(mode);

    history.push({
      role: 'user',
      text: trimmed,
      ts: Date.now()
    });
    saveChatHistory(mode, history);

    isBusy = true;
    busyStatusText = '🔍 Осматриваю экран, код и состояние раздела...';
    updateBusyState();
    renderMessages();

    var prompt1 = buildAgentPrompt(trimmed, mode, '');

    callGeminiJson(prompt1, apiKey)
      .then(function(parsed){
        var normTasks = normalizeTasksFromParsed(parsed);
        // Если ИИ запросил дополнительный осмотр исходного кода функций/объектов
        if(Array.isArray(parsed.inspect_code) && parsed.inspect_code.length > 0 && normTasks.length === 0){
          busyStatusText = '🔍 Осматриваю код: ' + parsed.inspect_code.join(', ') + '...';
          renderMessages();
          var codeDump = inspectCodeSymbols(parsed.inspect_code);
          var prompt2 = buildAgentPrompt(trimmed, mode, codeDump);
          return callGeminiJson(prompt2, apiKey);
        }
        return parsed;
      })
      .then(function(finalParsed){
        var normTasks = normalizeTasksFromParsed(finalParsed);
        var reports = executeTasksBatch(normTasks, mode);

        // Если ИИ не вернул tasks (или они не сработали), запускаем детерминированный перехватчик
        if(reports.length === 0){
          reports = tryDeterministicFallback(trimmed, finalParsed.reply || '', mode);
        }

        // Гарантируем, что живой переход на экран и живой бросок костей на столе действительно выполнены
        reports = ensureLiveActionsCompleted(trimmed, reports, mode);

        // Если запрос явно содержит команду на изменение/добавление/удаление, а reports всё ещё пуст — принудительный повтор с требованием вернуть непустой tasks
        if(reports.length === 0 && isActionIntent(trimmed)){
          busyStatusText = '⚙️ Формирую команды изменения состояния...';
          renderMessages();
          var forcePrompt = buildAgentPrompt(
            trimmed + '\n\n[СИСТЕМНОЕ ТРЕБОВАНИЕ]: В предыдущем ответе ты вернул пустой массив "tasks": [], поэтому изменения НЕ применились! Верни НЕПУСТОЙ массив "tasks" с конкретными действиями ("update_character", "switch_theme", "navigate", "roll_dice", "add_ability", "add_move", "add_recipe", "delete_item", "set_dom_fields" или "run_js"), чтобы реально выполнить запрос пользователя в коде приложения!',
            mode,
            ''
          );
          return callGeminiJson(forcePrompt, apiKey).then(function(retryParsed){
            var retryTasks = normalizeTasksFromParsed(retryParsed);
            var retryReports = executeTasksBatch(retryTasks, mode);
            if(retryReports.length === 0){
              retryReports = tryDeterministicFallback(trimmed, retryParsed.reply || finalParsed.reply || '', mode);
            }
            retryReports = ensureLiveActionsCompleted(trimmed, retryReports, mode);
            return {
              parsed: retryParsed.reply ? retryParsed : finalParsed,
              reports: retryReports
            };
          });
        }

        return {
          parsed: finalParsed,
          reports: reports
        };
      })
      .then(function(outcome){
        var finalParsed = outcome.parsed || {};
        var reports = outcome.reports || [];
        var botMsg = {
          role: 'bot',
          text: finalParsed.reply || (reports.length ? 'Все задачи успешно выполнены!' : 'Готово.'),
          reports: reports,
          suggestedRolls: [],
          ts: Date.now()
        };
        var curHist = loadChatHistory(mode);
        curHist.push(botMsg);
        saveChatHistory(mode, curHist);
      })
      .catch(function(err){
        // Даже если сеть/API вернули ошибку, проверяем локальный детерминированный исполнитель
        var localReports = tryDeterministicFallback(trimmed, '', mode);
        var curHist = loadChatHistory(mode);
        if(localReports.length > 0){
          curHist.push({
            role: 'bot',
            text: 'Задача выполнена напрямую автономным модулем!',
            reports: localReports,
            suggestedRolls: [],
            ts: Date.now()
          });
        } else {
          curHist.push({
            role: 'bot',
            text: '⚠️ Не удалось выполнить запрос к Gemini API (' + (err && err.message ? err.message : 'ошибка сети') + '). Проверьте ключ API кнопкой 🔑 в шапке чата.',
            reports: [],
            suggestedRolls: [],
            ts: Date.now()
          });
        }
        saveChatHistory(mode, curHist);
      })
      .finally(function(){
        isBusy = false;
        updateBusyState();
        renderChatHeader();
        renderMessages();
      });
  }

  /* ==========================================================================
     МАСКОТ-ФАМИЛЬЯР «ОРБИС» (МНОГОРЕЖИМНЫЙ SVG-ДВИЖОК, 20+ АНИМАЦИЙ, ПЛАВНАЯ ФИЗИКА)
     ========================================================================== */
  var AUTO_ROAM_STORAGE_KEY = 'ttc_ai_mascot_autoroam';
  var fabCustomPos = null;
  var isDraggingFab = false;
  var fabSuppressNextClick = false;
  try { localStorage.removeItem('ttc_ai_fab_pos_v1'); } catch(e){}

  function getDefaultFabPos(){
    var isMob = (window.innerWidth || 800) <= 600;
    return { right: isMob ? 14 : 22, bottom: isMob ? 16 : 22 };
  }

  function getFabCenter(){
    var fab = document.getElementById('ttcAiFab');
    if(fab){
      var r = fab.getBoundingClientRect();
      if(r.width > 0 && r.height > 0){
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
    }
    var vw = window.innerWidth || 800;
    var vh = window.innerHeight || 600;
    var defPos = getDefaultFabPos();
    var rOff = (fabCustomPos && typeof fabCustomPos.right === 'number') ? fabCustomPos.right : defPos.right;
    var bOff = (fabCustomPos && typeof fabCustomPos.bottom === 'number') ? fabCustomPos.bottom : defPos.bottom;
    return { x: vw - rOff - 32, y: vh - bOff - 32 };
  }

  function applyFabPosition(){
    var fab = document.getElementById('ttcAiFab');
    if(!fab) return;
    if(!fabCustomPos){
      fab.style.right = '';
      fab.style.bottom = '';
      fab.style.left = '';
      fab.style.top = '';
      fab.classList.remove('bubble-right', 'bubble-below');
      return;
    }
    var vw = window.innerWidth || 800;
    var vh = window.innerHeight || 600;
    var fabW = fab.offsetWidth || 64;
    var fabH = fab.offsetHeight || 64;
    var defPos = getDefaultFabPos();
    var clampedRight = Math.max(8, Math.min(vw - fabW - 8, Number(fabCustomPos.right) || defPos.right));
    var clampedBottom = Math.max(8, Math.min(vh - fabH - 8, Number(fabCustomPos.bottom) || defPos.bottom));
    fabCustomPos.right = clampedRight;
    fabCustomPos.bottom = clampedBottom;
    fab.style.right = clampedRight.toFixed(2) + 'px';
    fab.style.bottom = clampedBottom.toFixed(2) + 'px';
    fab.style.left = 'auto';
    fab.style.top = 'auto';

    var centerX = vw - clampedRight - (fabW / 2);
    var centerY = vh - clampedBottom - (fabH / 2);
    fab.classList.toggle('bubble-right', centerX < 230);
    fab.classList.toggle('bubble-below', centerY < 110);
  }
  var mascotState = 'idle';
  // Режимы: 'idle' | 'yawn' | 'sleep' | 'startle' | 'stretch' | 'happy' | 'petted' | 'thinking' |
  //         'mage' | 'combat' | 'bard' | 'scanner' | 'reading' | 'juggle' | 'stealth' |
  //         'glitch' | 'dizzy' | 'meditate' | 'alchemy' | 'campfire' | 'shield' | 'curious' | 'cosmos'
  var lockedShowMode = 'auto';
  var isRoaming = false;
  var manualRoam = false;
  var autoRoamEnabled = true;
  try {
    var savedRoam = localStorage.getItem(AUTO_ROAM_STORAGE_KEY);
    if(savedRoam === '0' || savedRoam === 'false') autoRoamEnabled = false;
  } catch(e){}

  var mouseX = window.innerWidth ? window.innerWidth - 60 : 800;
  var mouseY = window.innerHeight ? window.innerHeight - 60 : 600;
  var lastMouseMoveTs = Date.now();
  var lastNearMascotTs = Date.now();
  var lastShowModeTs = Date.now() - 10000;
  var sleepStartedTs = 0;
  var lastFrameTs = 0;
  var lookX = 0, lookY = 0;
  var targetLookX = 0, targetLookY = 0;
  var isBlinking = false;
  var currentMouth = 'smile';
  var currentEyes = 'open';
  var currentBrows = 'neutral'; // 'neutral' | 'angry' | 'curious' | 'sad' | 'surprised' | 'smug'
  var showBlush = false;

  // Детектор поглаживания курсором и тряски при перетаскивании
  var petStrokeCount = 0;
  var lastPetDirX = 0;
  var lastPetStrokeTs = 0;
  var dragShakeScore = 0;
  var lastDragDX = 0;

  // Координаты и плавная физика полёта по экрану
  var roamX = 0, roamY = 0;
  var roamTargetX = 0, roamTargetY = 0;
  var roamVX = 0, roamVY = 0;
  var roamTilt = 0;
  var isDraggingRoamer = false;
  var dragOffsetX = 0, dragOffsetY = 0;
  var roamStartedTs = Date.now();
  var roamWaypointWaitUntil = 0;
  var bubbleTimeout = null;
  var modeExpireTs = 0;

  var MASCOT_QUIPS = {
    wake: [
      'Я не спал! Я перебирал заклинания в уме...',
      'О! Курсор! Что колдуем сегодня?',
      'Моргнул на секунду — уже приключения!'
    ],
    stretch: [
      'Ммм, хорошо потянулся! Эфирное ядро в тонусе ✨',
      'Потягиваюсь после дрёмы... Готов к броскам!'
    ],
    startle: [
      'Ух! Приснилась натуральная единица!',
      'А?! Клянусь Плетением, показалось — мимик!',
      'Тревога?! Инициативу уже кидали?!'
    ],
    poke: [
      'Эй, щекотно же! Я эфирный фамильяр!',
      'Пиу-пиу! Мои руны заряжены на 100%!',
      'Слежу за твоим листом в оба глаза 👀',
      'Погладь меня курсором — я замурчу!'
    ],
    petted: [
      'Мррр... То есть, вжух-вжух! Приятно же! ✨',
      'О да, почеши за эфирным ушком! ^‿^',
      'Бафф «Любимый фамильяр»: +1d4 к удаче!'
    ],
    dizzy: [
      'Ой-ой-ой... Сейчас все заклинания в голове перемешаются! 🌀',
      'Полегче! У меня гироскоп заклинило! @_@'
    ],
    drag: [
      'Уииии! Ручной полёт!',
      'Лечу куда прикажешь, капитан!'
    ],
    roamStart: [
      'Телепортируюсь размять эфирные крылышки! ✨',
      'Полечу спокойно осмотрю экран!'
    ],
    roamReturn: [
      'Пойду подзаряжу ядро в своей сфере ↩',
      'Патруль окончен, возвращаюсь в гнездо!'
    ],
    roamIdle: [
      'Хм, интересные тут у тебя записи...',
      'Парить над страницей куда приятнее!',
      'Двойной клик по мне откроет чат!'
    ],
    mage: [
      '🔮 Плету нити магии... Чувствуешь резонанс?',
      '✨ Концентрирую арканический импульс!'
    ],
    combat: [
      '⚔️ Ан-гард! Мои эфирные клинки наготове!',
      '🛡️ Защищаю твой лист от проклятых бросков!'
    ],
    bard: [
      '🎵 Насвистываю балладу о двадцатигранной судьбе~ ♫',
      '🎶 Вдохновение барда (+1d8) этому господину!'
    ],
    reading: [
      '📖 Так-так, что тут написано мелким шрифтом в правилах...',
      '📖 Листаю древний гримуар...'
    ],
    scanner: [
      '🔍 Сканирую сектор... Уровень эпичности в норме!',
      '🔍 Анализ экипировки и характеристик: всё чётко!'
    ],
    juggle: [
      '🎲 Смотри без рук! Жонглирую судьбой!',
      '🎲 Главное — уронить кубик двадцаткой вверх!'
    ],
    stealth: [
      '🕵️ Спасбросок Скрытности: 28. Меня тут нет...',
      '🕵️ Сливаюсь с тенями интерфейса...'
    ],
    glitch: [
      '⚡ ВЖЖ-БЗЗТ! Перегрузка магического ядра!',
      '⚡ Слишком много эпических идей одновременно!'
    ],
    meditate: [
      '🧘 Дзен и гармония Плетения... Восстанавливаю ячейки...',
      '🧘 Вращаю сферы стихий в полном покое...'
    ],
    alchemy: [
      '🧪 Капля росы, щепотка звёздной пыли... Зелье удачи готово!',
      '🧪 Буль-буль! Главное — не перепутать колбы!'
    ],
    campfire: [
      '🔥 Ничто так не бодрит искателя, как тёплый привал у костра...',
      '🔥 Погреем лапки перед следующим боем!'
    ],
    shield: [
      '🛡️ Эфирный эгис активен! Ни один крит врага не пройдёт!',
      '🛡️ Держу защитный купол вокруг твоих хитов!'
    ],
    curious: [
      '🧐 Хм-м, любопытный билд у тебя получается...',
      '🧐 Дай-ка присмотрюсь поближе к этой строчке!'
    ],
    cosmos: [
      '🪐 Парим в астральной невесомости среди созвездий...',
      '🪐 Шепчусь со звёздами о твоём следующем крите!'
    ],
    crit20: [
      '🔥 НАТУРАЛЬНАЯ 20! Легендарный бросок!',
      '✨ КРИТ! Даже боги аплодируют!'
    ],
    crit1: [
      '💀 Ой-ой... Натуральная единица! Держись!',
      '😱 Кубик явно проклят! Надо его переплавить!'
    ]
  };

  function pickQuip(cat){
    var arr = MASCOT_QUIPS[cat] || MASCOT_QUIPS.poke;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function spawnMascotSparkles(x, y, count){
    var n = count || 4;
    for(var i = 0; i < n; i++){
      var sp = document.createElement('div');
      sp.className = 'ttc-mascot-spark-trail';
      var ox = (Math.random() - 0.5) * 36;
      var oy = (Math.random() - 0.5) * 36;
      sp.style.left = (x + ox) + 'px';
      sp.style.top = (y + oy) + 'px';
      document.body.appendChild(sp);
      (function(el){
        setTimeout(function(){
          if(el && el.parentNode) el.parentNode.removeChild(el);
        }, 760);
      })(sp);
    }
  }

  function triggerBarrelRoll(customQuip){
    var fab = document.getElementById('ttcAiFab');
    var roamer = document.getElementById('ttcAiRoamer');
    var targetEl = isRoaming ? roamer : fab;
    if(targetEl){
      targetEl.classList.remove('barrel-roll');
      void targetEl.offsetWidth;
      targetEl.classList.add('barrel-roll');
      setTimeout(function(){ targetEl.classList.remove('barrel-roll'); }, 840);
    }
    var sx = isRoaming ? (roamX + 39) : ((window.innerWidth || 800) - 54);
    var sy = isRoaming ? (roamY + 45) : ((window.innerHeight || 600) - 54);
    spawnMascotSparkles(sx, sy, 6);
    if(customQuip) showMascotBubble(customQuip, 3000);
  }

  function triggerWaltzSpin(customQuip){
    var fab = document.getElementById('ttcAiFab');
    var roamer = document.getElementById('ttcAiRoamer');
    var targetEl = isRoaming ? roamer : fab;
    if(targetEl){
      targetEl.classList.remove('waltz-spin');
      void targetEl.offsetWidth;
      targetEl.classList.add('waltz-spin');
      setTimeout(function(){ targetEl.classList.remove('waltz-spin'); }, 1680);
    }
    var sx = isRoaming ? (roamX + 39) : ((window.innerWidth || 800) - 54);
    var sy = isRoaming ? (roamY + 45) : ((window.innerHeight || 600) - 54);
    spawnMascotSparkles(sx, sy, 5);
    if(customQuip) showMascotBubble(customQuip, 3000);
  }

  function showMascotBubble(text, durationMs){
    if(!text) return;
    var dur = durationMs || 3400;
    var dockBub = document.getElementById('ttcMascotDockBubble');
    var roamBub = document.getElementById('ttcRoamerBubble');
    if(bubbleTimeout) clearTimeout(bubbleTimeout);

    if(isRoaming && roamBub){
      roamBub.textContent = text;
      roamBub.classList.add('visible');
      if(dockBub) dockBub.classList.remove('visible');
    } else if(dockBub && !isOpen){
      dockBub.textContent = text;
      dockBub.classList.add('visible');
      if(roamBub) roamBub.classList.remove('visible');
    }

    bubbleTimeout = setTimeout(function(){
      if(dockBub) dockBub.classList.remove('visible');
      if(roamBub) roamBub.classList.remove('visible');
    }, dur);
  }

  function buildMascotPropsSvg(prefix){
    return '' +
      /* 🔮 Печать Архимага */
      '<g id="' + prefix + 'PropMage" style="display:none;">' +
        '<g class="ttc-prop-sigil">' +
          '<polygon points="32,5 55,45 9,45" fill="none" stroke="var(--ai-accent-bright)" stroke-width="1.1" opacity="0.55"/>' +
          '<polygon points="32,59 55,19 9,19" fill="none" stroke="var(--ai-accent-bright)" stroke-width="1.1" opacity="0.55"/>' +
        '</g>' +
        '<polygon points="32,14 35,19 32,23 29,19" fill="#ffffff" stroke="var(--ai-accent-bright)" stroke-width="1"/>' +
      '</g>' +
      /* 🔍 Сканер Сыщика */
      '<g id="' + prefix + 'PropScanner" style="display:none;">' +
        '<polygon class="ttc-prop-scanbeam" points="20,28 44,28 58,62 6,62" fill="var(--ai-accent-bright)" opacity="0.22"/>' +
        '<rect x="11" y="22" width="42" height="11" rx="4" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="5 2"/>' +
      '</g>' +
      /* 📖 Открытый Гримуар */
      '<g id="' + prefix + 'PropReading" style="display:none;" transform="translate(0, 2)">' +
        '<path d="M16,46 Q24,43 32,47 Q40,43 48,46 L48,57 Q40,54 32,58 Q24,54 16,57 Z" fill="#1e293b" stroke="var(--ai-accent-bright)" stroke-width="1.5"/>' +
        '<line x1="32" y1="47" x2="32" y2="58" stroke="var(--ai-accent-bright)" stroke-width="1.4"/>' +
        '<line x1="20" y1="49" x2="29" y2="50" stroke="#94a3b8" stroke-width="1"/>' +
        '<line x1="20" y1="52" x2="29" y2="53" stroke="#94a3b8" stroke-width="1"/>' +
        '<line x1="35" y1="50" x2="44" y2="49" stroke="#94a3b8" stroke-width="1"/>' +
        '<line x1="35" y1="53" x2="44" y2="52" stroke="#94a3b8" stroke-width="1"/>' +
      '</g>' +
      /* ⚔️ Боевые Эфирные Клинки */
      '<g id="' + prefix + 'PropCombat" style="display:none;">' +
        '<path d="M6,44 L18,22 L21,25 L9,47 Z" fill="#ffffff" stroke="var(--ai-accent-bright)" stroke-width="1.3"/>' +
        '<path d="M58,44 L46,22 L43,25 L55,47 Z" fill="#ffffff" stroke="var(--ai-accent-bright)" stroke-width="1.3"/>' +
      '</g>' +
      /* 🎲 Жонглирование Кубами d20 */
      '<g id="' + prefix + 'PropJuggle" style="display:none;">' +
        '<g class="ttc-prop-d20-a" transform="translate(32, 16)">' +
          '<polygon points="0,-6 5.5,-2 3.5,5 -3.5,5 -5.5,-2" fill="var(--ai-accent-bright)" stroke="#ffffff" stroke-width="1"/>' +
        '</g>' +
        '<g class="ttc-prop-d20-b" transform="translate(32, 16)">' +
          '<polygon points="0,-6 5.5,-2 3.5,5 -3.5,5 -5.5,-2" fill="#38bdf8" stroke="#ffffff" stroke-width="1"/>' +
        '</g>' +
      '</g>' +
      /* 🕵️ Повязка Стелса (Плут/Шиноби) */
      '<g id="' + prefix + 'PropStealth" style="display:none;">' +
        '<path d="M9,22 Q32,19 55,22 L54,34 Q32,31 10,34 Z" fill="#020617" opacity="0.88" stroke="var(--ai-accent)" stroke-width="1"/>' +
        '<path d="M54,25 L63,20 L61,28 L64,32 L54,31 Z" fill="var(--ai-accent)"/>' +
      '</g>' +
      /* 🌀 Звёздочки Головокружения */
      '<g id="' + prefix + 'PropDizzy" class="ttc-prop-dizzy-stars" style="display:none;">' +
        '<polygon points="18,6 20,10 24,10 21,12 22,16 18,13 14,16 15,12 12,10 16,10" fill="#fde047"/>' +
        '<polygon points="46,6 48,10 52,10 49,12 50,16 46,13 42,16 43,12 40,10 44,10" fill="#fde047"/>' +
        '<ellipse cx="32" cy="11" rx="18" ry="4" fill="none" stroke="#fde047" stroke-width="1" stroke-dasharray="3 3"/>' +
      '</g>' +
      /* 🧘 Медитация / Сферы Дзен */
      '<g id="' + prefix + 'PropMeditate" style="display:none;">' +
        '<polygon points="32,11 34.5,15 32,19 29.5,15" fill="#38bdf8" opacity="0.9"/>' +
        '<g class="ttc-prop-zen-orbs">' +
          '<circle cx="32" cy="4" r="3" fill="#38bdf8" stroke="#ffffff" stroke-width="0.8"/>' +
          '<circle cx="56" cy="44" r="3" fill="var(--ai-accent-bright)" stroke="#ffffff" stroke-width="0.8"/>' +
          '<circle cx="8" cy="44" r="3" fill="#a855f7" stroke="#ffffff" stroke-width="0.8"/>' +
          '<circle cx="32" cy="30" r="25" fill="none" stroke="#38bdf8" stroke-width="0.8" stroke-dasharray="4 6" opacity="0.45"/>' +
        '</g>' +
      '</g>' +
      /* 🧪 Алхимическая колба с пузырьками */
      '<g id="' + prefix + 'PropAlchemy" style="display:none;">' +
        '<path d="M46,39 L46,43 L41,53 Q40,56 43,56 L53,56 Q56,56 55,53 L50,43 L50,39 Z" fill="rgba(16, 185, 129, 0.28)" stroke="#34d399" stroke-width="1.4"/>' +
        '<path d="M42.5,51 L53.5,51 L54.5,54.5 L41.5,54.5 Z" fill="#34d399" opacity="0.85"/>' +
        '<circle class="ttc-prop-bubble-1" cx="46" cy="36" r="1.8" fill="#6ee7b7"/>' +
        '<circle class="ttc-prop-bubble-2" cx="50" cy="34" r="2.2" fill="#34d399"/>' +
        '<circle class="ttc-prop-bubble-3" cx="47.5" cy="31" r="1.5" fill="#a7f3d0"/>' +
      '</g>' +
      /* 🔥 Уютный костёр на привале */
      '<g id="' + prefix + 'PropCampfire" style="display:none;">' +
        '<line x1="22" y1="58" x2="42" y2="53" stroke="#92400e" stroke-width="2.6" stroke-linecap="round"/>' +
        '<line x1="42" y1="58" x2="22" y2="53" stroke="#b45309" stroke-width="2.6" stroke-linecap="round"/>' +
        '<g class="ttc-prop-flame">' +
          '<path d="M32,41 C37,46 39,51 36,55 C34,57 30,57 28,55 C25,51 27,46 32,41 Z" fill="#f97316" opacity="0.92"/>' +
          '<path d="M32,45 C35,48 36,52 34,55 C33,56 31,56 30,55 C28,52 29,48 32,45 Z" fill="#fde047"/>' +
        '</g>' +
      '</g>' +
      /* 🛡️ Эфирный гексагональный щит */
      '<g id="' + prefix + 'PropShield" style="display:none;">' +
        '<g class="ttc-prop-aegis">' +
          '<polygon points="32,6 53,17 53,43 32,54 11,43 11,17" fill="rgba(56, 189, 248, 0.12)" stroke="#38bdf8" stroke-width="1.5"/>' +
          '<polygon points="32,11 48,20 48,40 32,49 16,40 16,20" fill="none" stroke="var(--ai-accent-bright)" stroke-width="0.9" stroke-dasharray="4 3"/>' +
        '</g>' +
      '</g>' +
      /* 🧐 Знак любопытства */
      '<g id="' + prefix + 'PropCurious" style="display:none;">' +
        '<text x="50" y="14" fill="var(--ai-accent-bright)" font-family="Cinzel, serif" font-size="14" font-weight="800">?</text>' +
      '</g>' +
      /* 🪐 Астральное кольцо и созвездия */
      '<g id="' + prefix + 'PropCosmos" style="display:none;">' +
        '<ellipse cx="32" cy="31" rx="28" ry="7.5" transform="rotate(-18 32 31)" fill="none" stroke="var(--ai-accent-bright)" stroke-width="1.2" stroke-dasharray="6 3" opacity="0.72"/>' +
        '<g class="ttc-prop-star-twinkle">' +
          '<polygon points="10,12 11.5,15 15,16.5 11.5,18 10,21 8.5,18 5,16.5 8.5,15" fill="#ffffff"/>' +
          '<polygon points="54,10 55,12.5 57.5,13.5 55,14.5 54,17 53,14.5 50.5,13.5 53,12.5" fill="#fde047"/>' +
        '</g>' +
      '</g>';
  }

  function buildMascotFaceSvgInner(prefix){
    return '' +
      buildMascotPropsSvg(prefix) +
      '<g id="' + prefix + 'FaceGroup" class="ttc-mascot-face-group" transform="translate(0,0)">' +
        '<ellipse id="' + prefix + 'BlushL" class="ttc-mascot-blush" cx="13.5" cy="34.5" rx="4.2" ry="2.2"/>' +
        '<ellipse id="' + prefix + 'BlushR" class="ttc-mascot-blush" cx="50.5" cy="34.5" rx="4.2" ry="2.2"/>' +
        '<path id="' + prefix + 'BrowL" class="ttc-mascot-brow" d="M14,20 Q20,18 26,20"/>' +
        '<path id="' + prefix + 'BrowR" class="ttc-mascot-brow" d="M38,20 Q44,18 50,20"/>' +
        '<path id="' + prefix + 'EyeL" class="ttc-mascot-eye-glow" d="M15,28 C15,22 25,22 25,28 C25,34 15,34 15,28 Z"/>' +
        '<path id="' + prefix + 'EyeR" class="ttc-mascot-eye-glow" d="M39,28 C39,22 49,22 49,28 C49,34 39,34 39,28 Z"/>' +
        '<circle id="' + prefix + 'PupilL" class="ttc-mascot-pupil" cx="20" cy="28" r="2.2"/>' +
        '<circle id="' + prefix + 'PupilR" class="ttc-mascot-pupil" cx="44" cy="28" r="2.2"/>' +
        '<path id="' + prefix + 'Mouth" class="ttc-mascot-mouth" d="M25,41 Q32,46 39,41"/>' +
      '</g>';
  }

  function renderMascotDockSvg(prefix){
    var p = prefix || 'dock';
    return '' +
      '<svg class="ttc-mascot-dock-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
        '<circle class="ttc-mascot-ring" cx="32" cy="32" r="28" fill="none" stroke-width="1.3" stroke-dasharray="7 4 2 4"/>' +
        '<path class="ttc-mascot-ear" d="M17,12 L11,2 L23,9 Z"/>' +
        '<path class="ttc-mascot-ear" d="M47,12 L53,2 L41,9 Z"/>' +
        '<g id="' + p + 'PortalNest" style="display:none;" opacity="0.78">' +
          '<circle cx="32" cy="32" r="14" fill="none" stroke="var(--ai-accent-bright)" stroke-width="1.5" stroke-dasharray="4 4"/>' +
          '<text x="32" y="37" text-anchor="middle" fill="var(--ai-accent-bright)" font-size="15" font-weight="bold">↩</text>' +
        '</g>' +
        '<g id="' + p + 'LiveCore">' +
          buildMascotFaceSvgInner(p) +
        '</g>' +
      '</svg>';
  }

  function renderMascotRoamerSvg(){
    return '' +
      '<svg class="ttc-roamer-svg" viewBox="0 0 78 90" xmlns="http://www.w3.org/2000/svg">' +
        '<ellipse cx="39" cy="84" rx="15" ry="3.2" fill="var(--ai-accent)" opacity="0.26"/>' +
        '<g class="ttc-roamer-tail">' +
          '<path d="M26,45 C24,58 30,69 39,78 C48,69 54,58 52,45 Z" fill="#090d16" stroke="var(--ai-accent)" stroke-width="1.6"/>' +
          '<polygon points="39,51 43.5,57 39,63 34.5,57" fill="var(--ai-accent-bright)" opacity="0.9"/>' +
        '</g>' +
        '<g class="ttc-roamer-hand-l">' +
          '<circle cx="11" cy="54" r="5.2" fill="#090d16" stroke="var(--ai-accent-bright)" stroke-width="1.6"/>' +
          '<circle cx="11" cy="54" r="2" fill="var(--ai-accent-bright)"/>' +
        '</g>' +
        '<g class="ttc-roamer-hand-r">' +
          '<circle cx="67" cy="54" r="5.2" fill="#090d16" stroke="var(--ai-accent-bright)" stroke-width="1.6"/>' +
          '<circle cx="67" cy="54" r="2" fill="var(--ai-accent-bright)"/>' +
        '</g>' +
        '<g transform="translate(7, 2)">' +
          '<path class="ttc-mascot-ear" d="M16,11 L9,0 L23,8 Z"/>' +
          '<path class="ttc-mascot-ear" d="M48,11 L55,0 L41,8 Z"/>' +
          '<circle cx="32" cy="28" r="21" fill="#080b12" stroke="var(--ai-accent)" stroke-width="2"/>' +
          '<circle cx="32" cy="28" r="18.5" fill="none" stroke="var(--ai-accent-bright)" stroke-opacity="0.22" stroke-width="1"/>' +
          buildMascotFaceSvgInner('roam') +
        '</g>' +
      '</svg>';
  }

  function getBrowPaths(browMode){
    if(browMode === 'angry'){
      return { l: 'M13,18 L26,23', r: 'M51,18 L38,23', show: true };
    }
    if(browMode === 'curious'){
      return { l: 'M14,21 Q20,21 26,21', r: 'M38,16 Q44,12 50,16', show: true };
    }
    if(browMode === 'sad'){
      return { l: 'M13,23 Q20,19 26,18', r: 'M38,18 Q44,19 51,23', show: true };
    }
    if(browMode === 'surprised'){
      return { l: 'M14,16 Q20,12 26,16', r: 'M38,16 Q44,12 50,16', show: true };
    }
    if(browMode === 'smug'){
      return { l: 'M14,19 L26,21', r: 'M38,18 Q44,15 50,18', show: true };
    }
    return { l: 'M14,20 Q20,18 26,20', r: 'M38,20 Q44,18 50,20', show: false };
  }

  function getEyePaths(eyeMode){
    if(eyeMode === 'closed'){
      return {
        l: 'M14,29 Q20,32 26,29 Q20,30.5 14,29 Z',
        r: 'M38,29 Q44,32 50,29 Q44,30.5 38,29 Z',
        showPupils: false
      };
    }
    if(eyeMode === 'happy'){
      return {
        l: 'M14,30 Q20,20 26,30 Q20,24.5 14,30 Z',
        r: 'M38,30 Q44,20 50,30 Q44,24.5 38,30 Z',
        showPupils: false
      };
    }
    if(eyeMode === 'squint'){
      return {
        l: 'M14,26.5 L26,27.5 C26,32.5 14,32.5 14,26.5 Z',
        r: 'M38,27.5 L50,26.5 C50,32.5 38,32.5 38,27.5 Z',
        showPupils: true
      };
    }
    if(eyeMode === 'angry'){
      return {
        l: 'M14,24 L26,28 C26,33.5 14,33.5 14,24 Z',
        r: 'M38,28 L50,24 C50,33.5 38,33.5 38,28 Z',
        showPupils: true
      };
    }
    if(eyeMode === 'star'){
      return {
        l: 'M20,20 L22,26 L28,28 L22,30 L20,36 L18,30 L12,28 L18,26 Z',
        r: 'M44,20 L46,26 L52,28 L46,30 L44,36 L42,30 L36,28 L42,26 Z',
        showPupils: false
      };
    }
    if(eyeMode === 'dizzy'){
      return {
        l: 'M14,24 L25,28 L14,32 L16,28 Z',
        r: 'M50,24 L39,28 L50,32 L48,28 Z',
        showPupils: false
      };
    }
    if(eyeMode === 'visor'){
      return {
        l: 'M13,25.5 L27,25.5 L27,30 L13,30 Z',
        r: 'M37,25.5 L51,25.5 L51,30 L37,30 Z',
        showPupils: true
      };
    }
    if(eyeMode === 'startle'){
      return {
        l: 'M13.5,28 C13.5,20 26.5,20 26.5,28 C26.5,36 13.5,36 13.5,28 Z',
        r: 'M37.5,28 C37.5,20 50.5,20 50.5,28 C50.5,36 37.5,36 37.5,28 Z',
        showPupils: true
      };
    }
    if(eyeMode === 'asym'){
      return {
        l: 'M13.5,28 C13.5,20 26.5,20 26.5,28 C26.5,36 13.5,36 13.5,28 Z',
        r: 'M38,26.5 L50,26.5 C50,32 38,32 38,26.5 Z',
        showPupils: true
      };
    }
    return {
      l: 'M15,28 C15,22 25,22 25,28 C25,34 15,34 15,28 Z',
      r: 'M39,28 C39,22 49,22 49,28 C49,34 39,34 39,28 Z',
      showPupils: true
    };
  }

  function getMouthPath(mouthMode){
    if(mouthMode === 'neutral') return { d: 'M27,42 Q32,43 37,42', filled: false };
    if(mouthMode === 'happy')   return { d: 'M24,40 Q32,49 40,40 Z', filled: true };
    if(mouthMode === 'smirk')   return { d: 'M25,42 Q28.5,45.5 32,41.5 Q35.5,45.5 39,42', filled: false };
    if(mouthMode === 'sleep')   return { d: 'M30.2,42.5 A1.8,1.8 0 1,0 33.8,42.5 A1.8,1.8 0 1,0 30.2,42.5 Z', filled: true };
    if(mouthMode === 'yawn')    return { d: 'M28,40.5 A4,5 0 1,0 36,40.5 A4,5 0 1,0 28,40.5 Z', filled: true };
    if(mouthMode === 'whistle') return { d: 'M33,42 A2.2,2.4 0 1,0 37.4,42 A2.2,2.4 0 1,0 33,42 Z', filled: true };
    if(mouthMode === 'angry')   return { d: 'M25,44 L29,41 L32,43.5 L35,41 L39,44', filled: false };
    if(mouthMode === 'dizzy')   return { d: 'M24,42 Q27,39 30,42 Q33,45 36,42 Q38,40 40,42', filled: false };
    if(mouthMode === 'startle') return { d: 'M26,43 Q29,39.5 32,43 Q35,46.5 38,43', filled: false };
    if(mouthMode === 'talk1')   return { d: 'M25,40.5 Q32,47.5 39,40.5 Z', filled: true };
    if(mouthMode === 'talk2')   return { d: 'M27,41.5 Q32,44.5 37,41.5', filled: false };
    return { d: 'M25,41 Q32,46 39,41', filled: false }; // 'smile'
  }

  var prefixDomCache = {};
  var PROP_STATE_MAP = {
    PropMage:     'mage',
    PropScanner:  'scanner',
    PropReading:  'reading',
    PropCombat:   'combat',
    PropJuggle:   'juggle',
    PropStealth:  'stealth',
    PropDizzy:    'dizzy',
    PropMeditate: 'meditate',
    PropAlchemy:  'alchemy',
    PropCampfire: 'campfire',
    PropShield:   'shield',
    PropCurious:  'curious',
    PropCosmos:   'cosmos'
  };
  var PROP_KEYS = Object.keys(PROP_STATE_MAP);

  function getPrefixCache(prefix){
    var c = prefixDomCache[prefix];
    if(c && c.fg && c.fg.isConnected) return c;
    var fg = document.getElementById(prefix + 'FaceGroup');
    var eyeL = document.getElementById(prefix + 'EyeL');
    var eyeR = document.getElementById(prefix + 'EyeR');
    var mouth = document.getElementById(prefix + 'Mouth');
    if(!fg || !eyeL || !eyeR || !mouth) return null;
    var props = {};
    for(var i = 0; i < PROP_KEYS.length; i++){
      var pk = PROP_KEYS[i];
      props[pk] = document.getElementById(prefix + pk);
    }
    c = {
      fg: fg,
      eyeL: eyeL,
      eyeR: eyeR,
      browL: document.getElementById(prefix + 'BrowL'),
      browR: document.getElementById(prefix + 'BrowR'),
      blushL: document.getElementById(prefix + 'BlushL'),
      blushR: document.getElementById(prefix + 'BlushR'),
      pupL: document.getElementById(prefix + 'PupilL'),
      pupR: document.getElementById(prefix + 'PupilR'),
      mouth: mouth,
      props: props,
      lastState: null,
      lastEyes: null,
      lastBrows: null,
      lastMouth: null,
      lastBlush: null,
      lastLx: -999,
      lastLy: -999
    };
    prefixDomCache[prefix] = c;
    return c;
  }

  function applyPropsVisibility(prefix){
    var c = getPrefixCache(prefix);
    if(!c) return;
    if(c.lastState === mascotState) return;
    c.lastState = mascotState;
    for(var i = 0; i < PROP_KEYS.length; i++){
      var pk = PROP_KEYS[i];
      var el = c.props[pk];
      if(el) el.style.display = (mascotState === PROP_STATE_MAP[pk]) ? 'block' : 'none';
    }
  }

  function applyFaceToPrefix(prefix, lx, ly){
    var c = getPrefixCache(prefix);
    if(!c) return;

    applyPropsVisibility(prefix);

    var effEyes = isBlinking ? 'closed' : currentEyes;
    if(c.lastEyes !== effEyes){
      c.lastEyes = effEyes;
      var ep = getEyePaths(effEyes);
      c.eyeL.setAttribute('d', ep.l);
      c.eyeR.setAttribute('d', ep.r);
      if(c.pupL && c.pupR){
        var pupOp = ep.showPupils ? '1' : '0';
        c.pupL.style.opacity = pupOp;
        c.pupR.style.opacity = pupOp;
      }
    }

    if(c.lastBrows !== currentBrows){
      c.lastBrows = currentBrows;
      if(c.browL && c.browR){
        var bp = getBrowPaths(currentBrows);
        c.browL.setAttribute('d', bp.l);
        c.browR.setAttribute('d', bp.r);
        var brOp = bp.show ? '1' : '0';
        c.browL.style.opacity = brOp;
        c.browR.style.opacity = brOp;
      }
    }

    var blushBool = !!showBlush;
    if(c.lastBlush !== blushBool){
      c.lastBlush = blushBool;
      if(c.blushL && c.blushR){
        c.blushL.classList.toggle('visible', blushBool);
        c.blushR.classList.toggle('visible', blushBool);
      }
    }

    if(c.lastMouth !== currentMouth){
      c.lastMouth = currentMouth;
      var mp = getMouthPath(currentMouth);
      c.mouth.setAttribute('d', mp.d);
      c.mouth.classList.toggle('filled', !!mp.filled);
    }

    if(Math.abs(lx - c.lastLx) >= 0.015 || Math.abs(ly - c.lastLy) >= 0.015){
      c.lastLx = lx;
      c.lastLy = ly;
      c.fg.setAttribute('transform', 'translate(' + lx.toFixed(2) + ',' + ly.toFixed(2) + ')');
      if(c.pupL && c.pupR){
        var px = (lx * 0.48);
        var py = (28 + ly * 0.48).toFixed(2);
        c.pupL.setAttribute('cx', (20 + px).toFixed(2));
        c.pupL.setAttribute('cy', py);
        c.pupR.setAttribute('cx', (44 + px).toFixed(2));
        c.pupR.setAttribute('cy', py);
      }
    }
  }

  function syncMascotDomClasses(){
    var fab = document.getElementById('ttcAiFab');
    var roamer = document.getElementById('ttcAiRoamer');
    var dockPortal = document.getElementById('dockPortalNest');
    var dockCore = document.getElementById('dockLiveCore');
    var dockNotes = document.getElementById('ttcDockNotesWrap');
    var roamNotes = document.getElementById('ttcRoamNotesWrap');

    var modeClasses = [
      'mode-stealth', 'mode-mage', 'mode-bard', 'mode-combat', 'mode-dizzy', 'mode-glitch',
      'mode-meditate', 'mode-alchemy', 'mode-campfire', 'mode-shield', 'mode-curious', 'mode-stretch', 'mode-cosmos'
    ];

    [fab, roamer].forEach(function(el){
      if(!el) return;
      modeClasses.forEach(function(mc){ el.classList.remove(mc); });
      if(mascotState && modeClasses.indexOf('mode-' + mascotState) !== -1){
        el.classList.add('mode-' + mascotState);
      }
    });

    if(fab){
      fab.classList.toggle('state-sleep', !isRoaming && mascotState === 'sleep');
      fab.classList.toggle('state-startle', !isRoaming && mascotState === 'startle');
      fab.classList.toggle('state-happy', !isRoaming && (mascotState === 'happy' || mascotState === 'petted'));
      fab.classList.toggle('state-roaming', isRoaming);
    }
    if(dockPortal && dockCore){
      dockPortal.style.display = isRoaming ? 'block' : 'none';
      dockCore.style.display = isRoaming ? 'none' : 'block';
    }
    if(roamer){
      roamer.classList.toggle('active', isRoaming);
      roamer.classList.toggle('state-sleep', isRoaming && mascotState === 'sleep');
      roamer.classList.toggle('state-startle', isRoaming && mascotState === 'startle');
      roamer.classList.toggle('state-happy', isRoaming && (mascotState === 'happy' || mascotState === 'petted'));
    }
    if(dockNotes) dockNotes.style.display = (!isRoaming && mascotState === 'bard') ? 'block' : 'none';
    if(roamNotes) roamNotes.style.display = (isRoaming && mascotState === 'bard') ? 'block' : 'none';

    updateMascotControlBar();
  }

  function setMascotMood(state, durationMs){
    if(state === 'sleep' && mascotState !== 'sleep'){
      sleepStartedTs = Date.now();
    }
    mascotState = state;
    showBlush = false;
    currentBrows = 'neutral';

    if(durationMs){
      modeExpireTs = Date.now() + durationMs;
    } else if(lockedShowMode === 'auto'){
      modeExpireTs = 0;
    }

    if(state === 'sleep'){
      currentEyes = 'closed';
      currentMouth = 'sleep';
    } else if(state === 'yawn'){
      currentEyes = 'squint';
      currentMouth = 'yawn';
    } else if(state === 'stretch'){
      currentEyes = 'happy';
      currentMouth = 'smile';
      showBlush = true;
    } else if(state === 'startle'){
      currentEyes = 'startle';
      currentMouth = 'startle';
      currentBrows = 'surprised';
    } else if(state === 'happy'){
      currentEyes = 'star';
      currentMouth = 'happy';
      showBlush = true;
    } else if(state === 'petted'){
      currentEyes = 'happy';
      currentMouth = 'smirk';
      showBlush = true;
    } else if(state === 'thinking'){
      currentEyes = 'squint';
      currentMouth = 'talk1';
      currentBrows = 'curious';
    } else if(state === 'mage'){
      currentEyes = 'star';
      currentMouth = 'smirk';
      currentBrows = 'smug';
    } else if(state === 'combat'){
      currentEyes = 'angry';
      currentMouth = 'angry';
      currentBrows = 'angry';
    } else if(state === 'bard'){
      currentEyes = 'happy';
      currentMouth = 'whistle';
      showBlush = true;
    } else if(state === 'scanner'){
      currentEyes = 'visor';
      currentMouth = 'neutral';
      currentBrows = 'curious';
    } else if(state === 'reading'){
      currentEyes = 'open';
      currentMouth = 'neutral';
      currentBrows = 'curious';
    } else if(state === 'juggle'){
      currentEyes = 'star';
      currentMouth = 'happy';
      currentBrows = 'surprised';
    } else if(state === 'stealth'){
      currentEyes = 'squint';
      currentMouth = 'neutral';
      currentBrows = 'angry';
    } else if(state === 'glitch'){
      currentEyes = 'visor';
      currentMouth = 'dizzy';
      currentBrows = 'surprised';
    } else if(state === 'dizzy'){
      currentEyes = 'dizzy';
      currentMouth = 'dizzy';
      currentBrows = 'sad';
    } else if(state === 'meditate'){
      currentEyes = 'closed';
      currentMouth = 'smile';
      currentBrows = 'neutral';
    } else if(state === 'alchemy'){
      currentEyes = 'asym';
      currentMouth = 'smirk';
      currentBrows = 'curious';
    } else if(state === 'campfire'){
      currentEyes = 'happy';
      currentMouth = 'smile';
      showBlush = true;
    } else if(state === 'shield'){
      currentEyes = 'squint';
      currentMouth = 'smirk';
      currentBrows = 'smug';
    } else if(state === 'curious'){
      currentEyes = 'asym';
      currentMouth = 'neutral';
      currentBrows = 'curious';
    } else if(state === 'cosmos'){
      currentEyes = 'star';
      currentMouth = 'smile';
      showBlush = true;
    } else {
      currentEyes = 'open';
      currentMouth = (Math.random() < 0.3) ? 'smirk' : 'smile';
      currentBrows = (Math.random() < 0.2) ? 'smug' : 'neutral';
    }
    syncMascotDomClasses();
    applyFaceToPrefix(isRoaming ? 'roam' : 'dock', lookX, lookY);
    if(isOpen) applyFaceToPrefix('hdr', lookX * 0.65, lookY * 0.65);
  }

  function triggerStretchWake(customQuip){
    lastNearMascotTs = Date.now();
    setMascotMood('stretch', 1700);
    if(customQuip) showMascotBubble(customQuip, 3200);
    targetLookX = 0;
    targetLookY = -2.2;
    setTimeout(function(){
      targetLookY = 0;
      if(mascotState === 'stretch'){
        setMascotMood(lockedShowMode !== 'auto' ? lockedShowMode : 'idle');
      }
    }, 1700);
  }

  function triggerStartleWake(customQuip){
    setMascotMood('startle', 850);
    showMascotBubble(customQuip || pickQuip('startle'), 3200);
    targetLookX = -5.0;
    targetLookY = -2.0;
    setTimeout(function(){ targetLookX = 5.0; targetLookY = 1.0; }, 180);
    setTimeout(function(){ targetLookX = 0; targetLookY = 0; }, 380);
    setTimeout(function(){
      if(mascotState === 'startle'){
        lastNearMascotTs = Date.now();
        setMascotMood(lockedShowMode !== 'auto' ? lockedShowMode : 'idle');
      }
    }, 820);
  }

  function triggerHappyReaction(customQuip){
    lastNearMascotTs = Date.now();
    setMascotMood('happy', 2100);
    if(customQuip) showMascotBubble(customQuip, 3400);
    setTimeout(function(){
      if(mascotState === 'happy'){
        setMascotMood(lockedShowMode !== 'auto' ? lockedShowMode : 'idle');
      }
    }, 2100);
  }

  function triggerRandomAutonomousShowMode(withBubble){
    var showModes = [
      'mage', 'combat', 'bard', 'reading', 'scanner', 'juggle',
      'stealth', 'meditate', 'alchemy', 'campfire', 'shield', 'curious', 'cosmos'
    ];
    var picked = showModes[Math.floor(Math.random() * showModes.length)];
    lastShowModeTs = Date.now();
    setMascotMood(picked, 8800);
    if(!isOpen && (withBubble || Math.random() < 0.22)){
      showMascotBubble(pickQuip(picked), 3400);
    }
    if(picked === 'juggle' || picked === 'mage' || picked === 'cosmos'){
      var sx = isRoaming ? (roamX + 39) : ((window.innerWidth || 800) - 54);
      var sy = isRoaming ? (roamY + 45) : ((window.innerHeight || 600) - 54);
      spawnMascotSparkles(sx, sy, 4);
    }
  }

  function pickNewRoamWaypoint(){
    var vw = Math.max(window.innerWidth || 800, 360);
    var vh = Math.max(window.innerHeight || 600, 400);

    if(Math.random() < 0.45){
      var candidates = document.querySelectorAll('#app h1, #app .section-label, #app .fae-card, #app .wi-card, #app .me-card, #app .sh-card, #app .ai-gen-card');
      if(candidates && candidates.length > 0){
        var el = candidates[Math.floor(Math.random() * candidates.length)];
        var rect = el.getBoundingClientRect();
        if(rect.top > 60 && rect.bottom < vh - 80 && rect.left > 40 && rect.right < vw - 60){
          roamTargetX = Math.max(45, Math.min(vw - 95, rect.right - 65));
          roamTargetY = Math.max(55, Math.min(vh - 105, rect.top - 32));
          return;
        }
      }
    }

    var padX = 55;
    var padTop = 70;
    var padBot = 110;
    roamTargetX = padX + Math.random() * Math.max(120, vw - padX * 2 - 80);
    roamTargetY = padTop + Math.random() * Math.max(120, vh - padTop - padBot - 80);
  }

  function playTeleportFlash(el){
    if(!el) return;
    el.classList.remove('teleport-flash');
    void el.offsetWidth;
    el.classList.add('teleport-flash');
    setTimeout(function(){
      el.classList.remove('teleport-flash');
    }, 460);
  }

  function startRoaming(isManual){
    var fab = document.getElementById('ttcAiFab');
    var roamer = document.getElementById('ttcAiRoamer');
    if(!roamer) return;

    var fc = getFabCenter();
    spawnMascotSparkles(fc.x, fc.y, 7);

    pickNewRoamWaypoint();
    roamX = roamTargetX;
    roamY = roamTargetY;
    roamVX = 0;
    roamVY = 0;
    roamTilt = 0;
    roamer.style.transform = 'translate3d(' + roamX.toFixed(1) + 'px,' + roamY.toFixed(1) + 'px,0) rotate(0deg)';

    roamWaypointWaitUntil = Date.now() + 2600;
    pickNewRoamWaypoint();

    spawnMascotSparkles(roamX + 39, roamY + 45, 8);

    isRoaming = true;
    manualRoam = !!isManual;
    roamStartedTs = Date.now();
    lastNearMascotTs = Date.now();
    setMascotMood(lockedShowMode !== 'auto' ? lockedShowMode : 'idle');

    playTeleportFlash(fab);
    playTeleportFlash(roamer);

    syncMascotDomClasses();
    showMascotBubble(pickQuip('roamStart'), 3200);
  }

  function stopRoaming(silent){
    if(!isRoaming) return;
    var fc = getFabCenter();
    spawnMascotSparkles(roamX + 39, roamY + 45, 6);
    spawnMascotSparkles(fc.x, fc.y, 6);
    isRoaming = false;
    manualRoam = false;
    roamStartedTs = Date.now();
    lastNearMascotTs = Date.now();
    var fab = document.getElementById('ttcAiFab');
    playTeleportFlash(fab);
    setMascotMood(lockedShowMode !== 'auto' ? lockedShowMode : 'idle');
    if(!silent) showMascotBubble(pickQuip('roamReturn'), 2600);
  }

  function updateMascotControlBar(){
    var chk = document.getElementById('ttcAiAutoRoamChk');
    var statusSpan = document.getElementById('ttcAiMascotStateBadge');
    if(chk) chk.checked = !!autoRoamEnabled;
    if(statusSpan){
      var modeLabels = {
        idle: 'Бодрствует ✨',
        sleep: 'Спит 💤',
        yawn: 'Зевает 🥱',
        stretch: 'Потягивается 🌅',
        startle: 'Вздрогнул! ⚡',
        happy: 'В восторге ✨',
        petted: 'Мурчит ^‿^',
        thinking: 'Колдует ответ ⚡',
        mage: 'Архимаг 🔮',
        combat: 'Дуэлянт ⚔️',
        bard: 'Мелодия барда 🎵',
        reading: 'Читает гримуар 📖',
        scanner: 'Сканирует 🔍',
        juggle: 'Жонглирует d20 🎲',
        stealth: 'В скрытности 🕵️',
        glitch: 'Перегрузка ⚡',
        dizzy: 'Укачало 🌀',
        meditate: 'Медитация 🧘',
        alchemy: 'Зельеварение 🧪',
        campfire: 'У костра 🔥',
        shield: 'Эфирный щит 🛡️',
        curious: 'Любопытство 🧐',
        cosmos: 'В астрале 🪐'
      };
      var stText = modeLabels[mascotState] || 'Бодрствует ✨';
      if(isRoaming && mascotState === 'idle') stText = 'Парит по экрану 🦋';
      statusSpan.textContent = stText;
    }
  }

  function startMascotLoops(){
    if(window.__ttcMascotLoopsStarted) return;
    window.__ttcMascotLoopsStarted = true;

    window.addEventListener('mousemove', function(e){
      var dx = e.clientX - mouseX;
      var dy = e.clientY - mouseY;
      var speed = Math.hypot(dx, dy);
      mouseX = e.clientX;
      mouseY = e.clientY;
      lastMouseMoveTs = Date.now();

      var fc = isRoaming ? null : getFabCenter();
      var refX = isRoaming ? (roamX + 39) : fc.x;
      var refY = isRoaming ? (roamY + 45) : fc.y;
      var distToMascot = Math.hypot(mouseX - refX, mouseY - refY);

      if(distToMascot < 130){
        lastNearMascotTs = Date.now();
        if(mascotState === 'sleep' || mascotState === 'yawn'){
          if(speed > 38){
            triggerStartleWake();
          } else if(speed > 8){
            triggerStretchWake();
          }
        }
      }

      // Распознавание поглаживания курсором прямо по маскоту (влево-вправо)
      if(distToMascot < 44 && !isDraggingRoamer && !isDraggingFab && Math.abs(dx) > 3){
        var dir = dx > 0 ? 1 : -1;
        var now = Date.now();
        if(dir !== lastPetDirX && (now - lastPetStrokeTs < 650)){
          petStrokeCount++;
          lastPetDirX = dir;
          lastPetStrokeTs = now;
          if(petStrokeCount >= 4 && mascotState !== 'petted'){
            petStrokeCount = 0;
            setMascotMood('petted', 4500);
            showMascotBubble(pickQuip('petted'), 3600);
            spawnMascotSparkles(refX, refY, 5);
          }
        } else if(now - lastPetStrokeTs >= 650){
          petStrokeCount = 1;
          lastPetDirX = dir;
          lastPetStrokeTs = now;
        }
      }
    }, { passive: true });

    var roamerDomEl = null;

    // Плавный цикл физики взгляда, спец-режимов и полёта на базе requestAnimationFrame (60 FPS с delta-time)
    function tickMascotFrame(perfNow){
      requestAnimationFrame(tickMascotFrame);
      if(document.body && document.body.classList.contains('tab-paused')){
        lastFrameTs = perfNow;
        return;
      }

      var dt = lastFrameTs ? Math.min(0.06, Math.max(0.004, (perfNow - lastFrameTs) / 1000)) : 0.016;
      lastFrameTs = perfNow;

      var now = Date.now();
      var fc = isRoaming ? null : getFabCenter();
      var refX = isRoaming ? (roamX + 39) : fc.x;
      var refY = isRoaming ? (roamY + 45) : fc.y;

      // Возврат из временного шоу-режима в обычный
      if(modeExpireTs > 0 && now >= modeExpireTs && lockedShowMode === 'auto' && !isBusy){
        modeExpireTs = 0;
        setMascotMood('idle');
      }

      if(mascotState === 'sleep'){
        targetLookX = 0;
        targetLookY = 1.5;
      } else if(isBusy){
        var t = now / 280;
        targetLookX = Math.cos(t) * 3.2;
        targetLookY = Math.sin(t * 1.2) * 2.2;
        currentMouth = (Math.floor(now / 280) % 2 === 0) ? 'talk1' : 'talk2';
      } else if(mascotState === 'reading'){
        // Глаза плавно бегают по строчкам открытого гримуара слева направо
        targetLookX = Math.sin(now / 420) * 3.8;
        targetLookY = 3.0;
      } else if(mascotState === 'juggle'){
        // Следит взглядом за подбрасываемыми кубиками d20
        targetLookX = Math.sin(now / 240) * 4.0;
        targetLookY = -3.4 + Math.abs(Math.cos(now / 240)) * 2.2;
      } else if(mascotState === 'scanner'){
        targetLookX = Math.sin(now / 480) * 4.4;
        targetLookY = 1.8;
      } else if(mascotState === 'stealth'){
        targetLookX = (Math.floor(now / 1400) % 2 === 0) ? -4.2 : 4.2;
        targetLookY = 0;
      } else if(mascotState === 'meditate'){
        targetLookX = 0;
        targetLookY = 1.0;
      } else if(mascotState === 'alchemy'){
        targetLookX = Math.sin(now / 360) * 1.8;
        targetLookY = 3.2;
      } else if(mascotState === 'campfire'){
        targetLookX = Math.sin(now / 520) * 1.4;
        targetLookY = 3.4;
      } else if(mascotState === 'shield'){
        targetLookX = Math.sin(now / 600) * 2.2;
        targetLookY = 0;
      } else if(mascotState === 'curious'){
        targetLookX = 2.6 + Math.sin(now / 500) * 1.2;
        targetLookY = -1.2;
      } else if(mascotState === 'cosmos'){
        targetLookX = Math.cos(now / 700) * 3.4;
        targetLookY = -2.6 + Math.sin(now / 550) * 1.6;
      } else if(now - lastMouseMoveTs < 7500){
        var ang = Math.atan2(mouseY - refY, mouseX - refX);
        var dist = Math.min(Math.hypot(mouseX - refX, mouseY - refY), 280) / 280;
        targetLookX = Math.cos(ang) * dist * 4.8;
        targetLookY = Math.sin(ang) * dist * 4.0;
      }

      // Экспоненциальное сглаживание взгляда (плавное и не зависит от герцовки монитора)
      if(Math.abs(targetLookX - lookX) < 0.005 && Math.abs(targetLookY - lookY) < 0.005){
        lookX = targetLookX;
        lookY = targetLookY;
      } else {
        var lerpFactor = 1 - Math.exp(-dt * 6.5);
        lookX += (targetLookX - lookX) * lerpFactor;
        lookY += (targetLookY - lookY) * lerpFactor;
      }

      if(!isRoaming){
        applyFaceToPrefix('dock', lookX, lookY);
      } else {
        applyFaceToPrefix('roam', lookX, lookY);
      }
      if(isOpen){
        applyFaceToPrefix('hdr', lookX * 0.65, lookY * 0.65);
      }

      // Плавное перемещение парящего маскота по экрану с инерцией и мягким торможением
      if(isRoaming && !isDraggingRoamer && mascotState !== 'sleep'){
        if(!roamerDomEl) roamerDomEl = document.getElementById('ttcAiRoamer');
        if(now >= roamWaypointWaitUntil){
          var dx = roamTargetX - roamX;
          var dy = roamTargetY - roamY;
          var d = Math.hypot(dx, dy);
          if(d < 12){
            // Спокойная пауза на точке (6–11 секунд)
            roamWaypointWaitUntil = now + 6000 + Math.random() * 5000;
            roamVX *= 0.2;
            roamVY *= 0.2;
            pickNewRoamWaypoint();
            // Включает шоу-режим на остановке (не чаще чем раз в 18 сек)
            if(lockedShowMode === 'auto' && mascotState === 'idle' && (now - lastShowModeTs > 18000) && Math.random() < 0.45){
              triggerRandomAutonomousShowMode();
            } else if(Math.random() < 0.18 && !isOpen){
              showMascotBubble(pickQuip('roamIdle'), 3200);
            }
          } else {
            var maxSpeed = 68; // пикселей в секунду — спокойный плавный полёт
            var arrivalFactor = Math.min(1, d / 95);
            var desiredSpeed = Math.max(14, maxSpeed * arrivalFactor);
            var desiredVX = (dx / d) * desiredSpeed;
            var desiredVY = (dy / d) * desiredSpeed;

            var steer = 1 - Math.exp(-dt * 3.2);
            roamVX += (desiredVX - roamVX) * steer;
            roamVY += (desiredVY - roamVY) * steer;

            roamX += roamVX * dt;
            roamY += roamVY * dt;

            // Мягкое синусоидальное покачивание в полёте
            var hoverBob = Math.sin(perfNow / 620) * 0.35;
            var targetTilt = Math.max(-9, Math.min(9, roamVX * 0.11));
            roamTilt += (targetTilt - roamTilt) * (1 - Math.exp(-dt * 5.0));

            if(roamerDomEl){
              roamerDomEl.style.transform = 'translate3d(' + roamX.toFixed(2) + 'px,' + (roamY + hoverBob).toFixed(2) + 'px,0) rotate(' + roamTilt.toFixed(2) + 'deg)';
            }
            if(Math.random() < 0.018){
              spawnMascotSparkles(roamX + 39, roamY + 72, 1);
            }
          }
        } else {
          // Плавное выравнивание наклона во время отдыха на точке
          if(Math.abs(roamTilt) > 0.05){
            roamTilt *= Math.exp(-dt * 4.5);
            if(roamerDomEl){
              roamerDomEl.style.transform = 'translate3d(' + roamX.toFixed(2) + 'px,' + roamY.toFixed(2) + 'px,0) rotate(' + roamTilt.toFixed(2) + 'deg)';
            }
          }
        }
      }

      // Плавное возвращение сферы-дока (#ttcAiFab) на позицию по умолчанию после перетаскивания
      if(!isDraggingFab && fabCustomPos){
        var defFab = getDefaultFabPos();
        var diffR = defFab.right - fabCustomPos.right;
        var diffB = defFab.bottom - fabCustomPos.bottom;
        var fabDist = Math.hypot(diffR, diffB);
        if(fabDist <= 0.6){
          fabCustomPos = null;
          applyFabPosition();
        } else {
          // Если чат открыт — сфера быстро и анимировано возвращается на место по умолчанию;
          // если чат закрыт — медленно и плавно плывёт обратно в угол
          var stepSpeed = isOpen
            ? (240 + fabDist * 8.5)
            : (36 + fabDist * 0.45);
          var moveStep = Math.min(fabDist, stepSpeed * dt);
          fabCustomPos.right += (diffR / fabDist) * moveStep;
          fabCustomPos.bottom += (diffB / fabDist) * moveStep;
          applyFabPosition();
        }
      }
    }
    requestAnimationFrame(tickMascotFrame);

    // Размеренный цикл моргания, шоу-режимов, сна и авто-вылетов (каждые 3.8 сек)
    setInterval(function(){
      if(document.body && document.body.classList.contains('tab-paused')) return;
      var now = Date.now();

      // Моргание (спокойное и естественное)
      var canBlink = (mascotState === 'idle' || mascotState === 'reading' || mascotState === 'mage' || mascotState === 'alchemy' || mascotState === 'campfire' || mascotState === 'shield' || mascotState === 'cosmos');
      if(canBlink && !isBlinking && Math.random() < 0.5){
        isBlinking = true;
        setTimeout(function(){ isBlinking = false; }, 165);
      }

      // Плавное движение глазами и лёгкая смена мимики в покое (когда мышь не двигается > 5 сек)
      if(mascotState === 'idle' && now - lastMouseMoveTs >= 5000){
        targetLookX = (Math.random() - 0.5) * 5.2;
        targetLookY = (Math.random() - 0.5) * 3.6;
        if(Math.random() < 0.3){
          currentMouth = ['smile', 'neutral', 'smirk'][Math.floor(Math.random() * 3)];
          currentBrows = ['neutral', 'curious', 'smug'][Math.floor(Math.random() * 3)];
        }
      }

      // Спонтанное включение шоу-режима (раз в ~18–28 секунд, без блокировки по расстоянию курсора)
      if(lockedShowMode === 'auto' && mascotState === 'idle' && !isBusy && (now - lastShowModeTs > 18000) && Math.random() < 0.38){
        var rollTrick = Math.random();
        if(rollTrick < 0.14){
          lastShowModeTs = now;
          triggerBarrelRoll();
        } else if(rollTrick < 0.28){
          lastShowModeTs = now;
          triggerWaltzSpin();
        } else {
          triggerRandomAutonomousShowMode();
        }
        return;
      }

      // Переход в сон (через 50 секунд тишины рядом с маскотом, если не идёт шоу-режим)
      if(lockedShowMode === 'auto' && mascotState === 'idle' && !isBusy && !isOpen && !isDraggingRoamer && (now - lastNearMascotTs > 50000) && (now - lastShowModeTs > 14000)){
        setMascotMood('yawn');
        setTimeout(function(){
          if(mascotState === 'yawn') setMascotMood('sleep');
        }, 1500);
        return;
      }

      // Во время сна: спит ~35 секунд, после чего периодически просыпается (потягиваясь или вздрагивая)
      if(mascotState === 'sleep' && lockedShowMode === 'auto' && !isBusy && (now - sleepStartedTs > 35000)){
        if(Math.random() < 0.18){
          if(Math.random() < 0.7){
            triggerStretchWake();
          } else {
            triggerStartleWake();
          }
          return;
        }
      }

      // Автономный вылет из иконки на экран и возврат обратно
      if(autoRoamEnabled && !isBusy && !isOpen){
        if(!isRoaming && mascotState === 'idle' && (now - roamStartedTs > 55000) && Math.random() < 0.16){
          startRoaming(false);
        } else if(isRoaming && !manualRoam && (now - roamStartedTs > 50000) && Math.random() < 0.22){
          stopRoaming(false);
        }
      }
    }, 3800);
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
    fab.title = 'Орбис: клик — открыть чат, зажми ЛКМ и тяни — переместить сферу!';
    fab.innerHTML =
      '<div class="ttc-mascot-bubble" id="ttcMascotDockBubble"></div>' +
      '<div class="ttc-mascot-zzz-wrap">' +
        '<span class="ttc-mascot-z">z</span>' +
        '<span class="ttc-mascot-z">Z</span>' +
        '<span class="ttc-mascot-z">Z</span>' +
      '</div>' +
      '<div class="ttc-mascot-fx-wrap" id="ttcDockNotesWrap" style="display:none;">' +
        '<span class="ttc-mascot-note">♪</span>' +
        '<span class="ttc-mascot-note">♫</span>' +
        '<span class="ttc-mascot-note">♬</span>' +
      '</div>' +
      renderMascotDockSvg('dock');

    var roamer = document.createElement('div');
    roamer.id = 'ttcAiRoamer';
    roamer.className = 'ttc-ai-roamer';
    roamer.title = 'Клик — трюк, двойной клик — чат, перетащи — полёт';
    roamer.innerHTML =
      '<div class="ttc-mascot-bubble" id="ttcRoamerBubble"></div>' +
      '<div class="ttc-mascot-zzz-wrap" style="right:10px;top:-10px;">' +
        '<span class="ttc-mascot-z">z</span>' +
        '<span class="ttc-mascot-z">Z</span>' +
        '<span class="ttc-mascot-z">Z</span>' +
      '</div>' +
      '<div class="ttc-mascot-fx-wrap" id="ttcRoamNotesWrap" style="display:none;top:-20px;">' +
        '<span class="ttc-mascot-note">♪</span>' +
        '<span class="ttc-mascot-note">♫</span>' +
        '<span class="ttc-mascot-note">♬</span>' +
      '</div>' +
      '<div class="ttc-roamer-body-wrap">' +
        renderMascotRoamerSvg() +
      '</div>';

    var chat = document.createElement('div');
    chat.id = 'ttcAiChat';
    chat.className = 'ttc-ai-chat';
    chat.innerHTML =
      '<div class="ttc-ai-header">' +
        '<div class="ttc-ai-header-left">' +
          '<div class="ttc-ai-avatar" id="ttcAiHdrIcon">' + renderMascotDockSvg('hdr') + '</div>' +
          '<div class="ttc-ai-title-wrap">' +
            '<div class="ttc-ai-title" id="ttcAiHdrTitle">Орбис</div>' +
            '<div class="ttc-ai-subtitle" id="ttcAiHdrSub">Фаэрун</div>' +
          '</div>' +
        '</div>' +
        '<div class="ttc-ai-header-actions">' +
          '<button type="button" class="ttc-ai-hdr-btn" id="ttcAiKeyBtn" title="Настроить ключ Google Gemini API">🔑</button>' +
          '<button type="button" class="ttc-ai-hdr-btn" id="ttcAiClearBtn" title="Очистить историю чата">🗑️</button>' +
          '<button type="button" class="ttc-ai-hdr-btn" id="ttcAiCloseBtn" title="Свернуть чат">✕</button>' +
        '</div>' +
      '</div>' +
      '<div class="ttc-ai-mascot-bar">' +
        '<label class="ttc-ai-mascot-toggle-lbl" title="Разрешить фамильяру самому периодически вылетать из сферы и парить по экрану">' +
          '<input type="checkbox" id="ttcAiAutoRoamChk" ' + (autoRoamEnabled ? 'checked' : '') + '>' +
          '<span>🦋 Авто-вылет фамильяра</span>' +
        '</label>' +
        '<span id="ttcAiMascotStateBadge" style="color:var(--ai-accent-bright);font-weight:600;font-size:11px;">Бодрствует ✨</span>' +
      '</div>' +
      '<div class="ttc-ai-messages" id="ttcAiMessages"></div>' +
      '<div class="ttc-ai-footer">' +
        '<textarea id="ttcAiInput" class="ttc-ai-input" rows="1" placeholder="Команда или вопрос: «брось 1d20», «открой карту», «уровень 7, хп 65», «вылетай», «команды»..."></textarea>' +
        '<button type="button" id="ttcAiSendBtn" class="ttc-ai-send-btn">➤</button>' +
      '</div>';

    document.body.appendChild(fab);
    document.body.appendChild(roamer);
    document.body.appendChild(chat);

    applyFabPosition();
    window.addEventListener('resize', applyFabPosition, { passive: true });

    // Перетаскивание сферы Орбиса зажатием левой кнопки мыши (или тачем)
    var fabDragMoved = false;
    var fabStartClientX = 0;
    var fabStartClientY = 0;
    var fabStartRight = 22;
    var fabStartBottom = 22;
    var fabPrevClientX = 0;
    var fabShakeScore = 0;
    var fabLastShakeDir = 0;

    fab.addEventListener('pointerdown', function(e){
      if(e.pointerType === 'mouse' && e.button !== 0) return;
      isDraggingFab = true;
      fabDragMoved = false;
      fabShakeScore = 0;
      fabLastShakeDir = 0;
      fabStartClientX = e.clientX;
      fabStartClientY = e.clientY;
      fabPrevClientX = e.clientX;
      var vw = window.innerWidth || 800;
      var vh = window.innerHeight || 600;
      var rect = fab.getBoundingClientRect();
      fabStartRight = vw - rect.right;
      fabStartBottom = vh - rect.bottom;
      try { fab.setPointerCapture(e.pointerId); } catch(err){}
    });

    fab.addEventListener('pointermove', function(e){
      if(!isDraggingFab) return;
      var dx = e.clientX - fabStartClientX;
      var dy = e.clientY - fabStartClientY;
      if(!fabDragMoved && Math.hypot(dx, dy) > 5){
        fabDragMoved = true;
        fab.classList.add('dragging');
        lastNearMascotTs = Date.now();
        currentEyes = 'asym';
        currentMouth = 'startle';
        currentBrows = 'surprised';
      }
      if(!fabDragMoved) return;

      var stepDX = e.clientX - fabPrevClientX;
      fabPrevClientX = e.clientX;
      if(Math.abs(stepDX) > 8){
        var sDir = stepDX > 0 ? 1 : -1;
        if(sDir !== fabLastShakeDir){
          fabShakeScore++;
          fabLastShakeDir = sDir;
        }
      }

      var vw = window.innerWidth || 800;
      var vh = window.innerHeight || 600;
      var fabW = fab.offsetWidth || 64;
      var fabH = fab.offsetHeight || 64;
      var nextRight = Math.round(Math.max(8, Math.min(vw - fabW - 8, fabStartRight - dx)));
      var nextBottom = Math.round(Math.max(8, Math.min(vh - fabH - 8, fabStartBottom - dy)));
      fabCustomPos = { right: nextRight, bottom: nextBottom };
      applyFabPosition();
    });

    function endFabDrag(e){
      if(!isDraggingFab) return;
      isDraggingFab = false;
      fab.classList.remove('dragging');
      try { if(e && e.pointerId != null) fab.releasePointerCapture(e.pointerId); } catch(err){}
      if(fabDragMoved){
        fabSuppressNextClick = true;
        setTimeout(function(){ fabSuppressNextClick = false; }, 260);
        if(fabShakeScore >= 6){
          setMascotMood('dizzy', 5000);
          showMascotBubble(pickQuip('dizzy'), 3800);
        } else {
          setMascotMood(lockedShowMode !== 'auto' ? lockedShowMode : 'idle');
        }
      }
    }
    fab.addEventListener('pointerup', endFabDrag);
    fab.addEventListener('pointercancel', endFabDrag);

    // События сферы-дока (клик без перетаскивания открывает/закрывает чат)
    fab.addEventListener('click', function(e){
      if(fabSuppressNextClick){
        fabSuppressNextClick = false;
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      lastNearMascotTs = Date.now();
      if(mascotState === 'sleep' || mascotState === 'yawn'){
        setMascotMood(lockedShowMode !== 'auto' ? lockedShowMode : 'idle');
      }
      isOpen = !isOpen;
      applyFabPosition();
      chat.classList.toggle('open', isOpen);
      if(isOpen){
        renderChatHeader();
        renderMessages();
        updateMascotControlBar();
        var inp = document.getElementById('ttcAiInput');
        if(inp) setTimeout(function(){ inp.focus(); }, 80);
      }
    });

    // Управление авто-вылетом маскота из шапки чата
    var autoRoamChk = document.getElementById('ttcAiAutoRoamChk');
    if(autoRoamChk){
      autoRoamChk.addEventListener('change', function(){
        autoRoamEnabled = !!autoRoamChk.checked;
        try { localStorage.setItem(AUTO_ROAM_STORAGE_KEY, autoRoamEnabled ? '1' : '0'); } catch(e){}
        if(!autoRoamEnabled && isRoaming && !manualRoam){
          stopRoaming(false);
        }
        updateMascotControlBar();
      });
    }

    // Drag & Drop, распознавание тряски и клики по парящему на экране маскоту
    var dragMoved = false;
    roamer.addEventListener('pointerdown', function(e){
      isDraggingRoamer = true;
      dragMoved = false;
      dragShakeScore = 0;
      lastDragDX = 0;
      roamer.classList.add('dragging');
      roamer.setPointerCapture(e.pointerId);
      dragOffsetX = e.clientX - roamX;
      dragOffsetY = e.clientY - roamY;
      lastNearMascotTs = Date.now();
      currentEyes = 'asym';
      currentMouth = 'startle';
      currentBrows = 'surprised';
      showMascotBubble(pickQuip('drag'), 2400);
    });

    roamer.addEventListener('pointermove', function(e){
      if(!isDraggingRoamer) return;
      var nx = e.clientX - dragOffsetX;
      var ny = e.clientY - dragOffsetY;
      var ddx = nx - roamX;
      if(Math.hypot(ddx, ny - roamY) > 5) dragMoved = true;

      // Проверяем резкую тряску из стороны в сторону во время перетаскивания
      if(Math.abs(ddx) > 8){
        var sDir = ddx > 0 ? 1 : -1;
        if(sDir !== lastDragDX){
          dragShakeScore++;
          lastDragDX = sDir;
        }
      }

      var vw = window.innerWidth || 800;
      var vh = window.innerHeight || 600;
      roamX = Math.max(8, Math.min(vw - 84, nx));
      roamY = Math.max(8, Math.min(vh - 96, ny));
      roamTargetX = roamX;
      roamTargetY = roamY;
      roamWaypointWaitUntil = Date.now() + 5500;
      roamer.style.transform = 'translate3d(' + roamX.toFixed(1) + 'px,' + roamY.toFixed(1) + 'px,0)';
    });

    function endRoamerDrag(){
      if(!isDraggingRoamer) return;
      isDraggingRoamer = false;
      roamer.classList.remove('dragging');
      if(dragShakeScore >= 6){
        // Если сильно потрясли — кружится голова!
        setMascotMood('dizzy', 5000);
        showMascotBubble(pickQuip('dizzy'), 3800);
      } else if(!dragMoved){
        // Одиночный клик по парящему маскоту — случайный трюк или эмоция!
        var r = Math.random();
        if(r < 0.22){
          triggerBarrelRoll(pickQuip('poke'));
        } else if(r < 0.42){
          triggerWaltzSpin();
        } else {
          triggerRandomAutonomousShowMode();
        }
      } else {
        setMascotMood(lockedShowMode !== 'auto' ? lockedShowMode : 'idle');
      }
    }
    roamer.addEventListener('pointerup', endRoamerDrag);
    roamer.addEventListener('pointercancel', endRoamerDrag);

    roamer.addEventListener('dblclick', function(){
      isOpen = true;
      chat.classList.add('open');
      renderChatHeader();
      renderMessages();
      updateMascotControlBar();
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

    startMascotLoops();
    renderChatHeader();
    renderMessages();
    syncMascotDomClasses();
  }

  function updateBusyState(){
    var fab = document.getElementById('ttcAiFab');
    var sendBtn = document.getElementById('ttcAiSendBtn');
    if(fab) fab.classList.toggle('is-busy', isBusy);
    if(isBusy){
      setMascotMood('mage');
    } else {
      triggerHappyReaction();
    }
    if(sendBtn){
      sendBtn.disabled = isBusy;
      sendBtn.textContent = isBusy ? '⏳' : '➤';
    }
    updateMascotControlBar();
  }

  function renderChatHeader(){
    var ctx = getModeContext(getActiveMode());
    var hdrTitle = document.getElementById('ttcAiHdrTitle');
    var hdrSub = document.getElementById('ttcAiHdrSub');
    if(hdrTitle) hdrTitle.textContent = 'Орбис';
    if(hdrSub) hdrSub.textContent = ctx.heroName + ' • ' + ctx.heroSub;
    updateMascotControlBar();
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
            '<p>Приветствую! Я <b>Орбис</b>.</p>' +
            '<p>Быстрые команды выполняются <b>мгновенно прямо из чата</b> (без обращения к ИИ), а сложные задачи и генерацию билдов я решаю через нейросеть.</p>' +
            '<p style="color:#94a3b8;font-size:12px;">Примеры команд в чате:<br>' +
            '• 🎲 <i>«брось 1d20+5»</i>, <i>«2d6+3»</i>, <i>«инициатива»</i>, <i>«спасбросок мудрости»</i><br>' +
            '• 🧙 <i>«уровень 7, хп 65, кд 18»</i>, <i>«урон 12»</i>, <i>«лечение 20»</i>, <i>«долгий отдых»</i><br>' +
            '• 🗺️ <i>«открой карту»</i>, <i>«открой бестиарий»</i>, <i>«тема ведьмак»</i><br>' +
            '• 🦋 <i>«вылетай»</i>, <i>«в сферу»</i>, <i>«сальто»</i>, <i>«медитация»</i>, <i>«костёр»</i>, <i>«команды»</i></p>' +
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

          html +=
            '<div class="ttc-ai-msg bot">' +
              '<div class="ttc-ai-msg-text">' + formatBotText(m.text) + '</div>' +
              reportsHtml +
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
    if(typeof window.addDie === 'function' && !window.addDie.__aiWrapped){
      var origAddDie = window.addDie;
      var wrappedAddDie = function(sides){
        var res = origAddDie.apply(this, arguments);
        try {
          if(Number(sides) === 20 && Array.isArray(window.dicePool) && window.dicePool.length > 0){
            var last = window.dicePool[window.dicePool.length - 1];
            if(last && last.val === 20) triggerHappyReaction(pickQuip('crit20'));
            else if(last && last.val === 1) triggerStartleWake(pickQuip('crit1'));
          }
        } catch(e){}
        return res;
      };
      wrappedAddDie.__aiWrapped = true;
      window.addDie = wrappedAddDie;
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
    roam: function(){ ensureDom(); startRoaming(true); },
    dock: function(){ stopRoaming(false); },
    reactDice: function(val){
      if(val === 20) triggerHappyReaction(pickQuip('crit20'));
      else if(val === 1) triggerStartleWake(pickQuip('crit1'));
      else triggerHappyReaction();
    },
    send: sendPromptToGemini
  };
})();
