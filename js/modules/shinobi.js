/* ============================================================
   РЕЖИМ «ШИНОБИ» — мир скрытых деревень.
   Отдельный модуль: перехватывает render()/navigate() поверх
   хоумбрю-модуля. Хранилище своё: ttc_sh_*  
   ============================================================ */

function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escA(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }
function uid(p){ return (p||'sh')+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function nl2br(s){ return esc(s).replace(/\n/g,'<br>'); }

var DEFAULT_META = {
  name: '',
  note: '',
  charName: '',
  clan: '',
  village: 'Коноха',
  rank: 'Генин',
  level: '1',
  nature: '',
  chakra: '30',
  hp: '28',
  ac: '14'
};

var SH_PROFILES_STORAGE_KEY = 'ttc_sh_profiles';
var SH_ACTIVE_PROFILE_STORAGE_KEY = 'ttc_sh_active_profile';

function newShinobiProfile(opts){
  opts = opts || {};
  return {
    id: opts.id || ('sh_prof_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
    charName: opts.charName != null ? opts.charName : '',
    clan: opts.clan != null ? opts.clan : '',
    village: opts.village != null ? opts.village : 'Коноха',
    rank: opts.rank != null ? opts.rank : 'Генин',
    level: opts.level != null ? opts.level : '1',
    nature: opts.nature != null ? opts.nature : '',
    chakra: opts.chakra != null ? opts.chakra : '30',
    hp: opts.hp != null ? opts.hp : '28',
    ac: opts.ac != null ? opts.ac : '14',
    notes: opts.notes != null ? opts.notes : '',
    techs: Array.isArray(opts.techs) ? opts.techs : [],
    moves: Array.isArray(opts.moves) ? opts.moves : [],
    skills: Array.isArray(opts.skills) ? opts.skills : [],
    createdAt: opts.createdAt || new Date().toISOString()
  };
}

function loadProfiles(){
  try{
    var raw = localStorage.getItem(SH_PROFILES_STORAGE_KEY);
    if(raw){
      var list = JSON.parse(raw);
      if(Array.isArray(list) && list.length > 0) return list;
    }
  }catch(e){}

  var legMeta = null;
  var legT = [], legM = [], legS = [];
  try{ legMeta = JSON.parse(localStorage.getItem('ttc_sh_meta') || 'null'); }catch(e){}
  try{ legT = JSON.parse(localStorage.getItem('ttc_sh_techs') || '[]'); }catch(e){}
  try{ legM = JSON.parse(localStorage.getItem('ttc_sh_moves') || '[]'); }catch(e){}
  try{ legS = JSON.parse(localStorage.getItem('ttc_sh_skills') || '[]'); }catch(e){}

  var defaultProfile = newShinobiProfile({
    id: 'sh_prof_primary',
    charName: (legMeta && legMeta.charName) || 'Наруто Узумаки',
    clan: (legMeta && legMeta.clan) || 'Узумаки',
    village: (legMeta && legMeta.village) || 'Коноха',
    rank: (legMeta && legMeta.rank) || 'Генин',
    level: (legMeta && legMeta.level) || '1',
    nature: (legMeta && legMeta.nature) || 'fuuton',
    chakra: (legMeta && legMeta.chakra) || '30',
    hp: (legMeta && legMeta.hp) || '28',
    ac: (legMeta && legMeta.ac) || '14',
    notes: (legMeta && legMeta.note) || '',
    techs: Array.isArray(legT) ? legT : [],
    moves: Array.isArray(legM) ? legM : [],
    skills: Array.isArray(legS) ? legS : []
  });
  var res = [defaultProfile];
  saveProfilesList(res);
  return res;
}

function saveProfilesList(list){
  try{ localStorage.setItem(SH_PROFILES_STORAGE_KEY, JSON.stringify(list || [])); }catch(e){}
}

function saveActiveProfileId(id){
  try{
    if(id) localStorage.setItem(SH_ACTIVE_PROFILE_STORAGE_KEY, id);
    else localStorage.removeItem(SH_ACTIVE_PROFILE_STORAGE_KEY);
  }catch(e){}
}

function getActiveProfile(){
  if(!Array.isArray(SH.profiles) || !SH.profiles.length){
    SH.profiles = loadProfiles();
  }
  var act = null;
  if(SH.activeProfileId){
    act = SH.profiles.find(function(p){ return p.id === SH.activeProfileId; });
  }
  if(!act){
    act = SH.profiles[0] || newShinobiProfile();
    SH.activeProfileId = act.id;
    saveActiveProfileId(act.id);
  }
  return act;
}

function syncActiveProfileFromState(){
  var act = getActiveProfile();
  if(!act) return;
  act.charName = SH.meta.charName || '';
  act.clan = SH.meta.clan || '';
  act.village = SH.meta.village || 'Коноха';
  act.rank = SH.meta.rank || 'Генин';
  act.level = SH.meta.level || '1';
  act.nature = SH.meta.nature || '';
  act.chakra = SH.meta.chakra || '30';
  act.hp = SH.meta.hp || '28';
  act.ac = SH.meta.ac || '14';
  act.notes = SH.meta.notes || '';
  act.techs = Array.isArray(SH.techs) ? SH.techs : [];
  act.moves = Array.isArray(SH.moves) ? SH.moves : [];
  act.skills = Array.isArray(SH.skills) ? SH.skills : [];
  saveProfilesList(SH.profiles);
}

function applyProfileToState(prof){
  if(!prof) return;
  SH.activeProfileId = prof.id;
  SH.meta.charName = prof.charName || '';
  SH.meta.clan = prof.clan || '';
  SH.meta.village = prof.village || 'Коноха';
  SH.meta.rank = prof.rank || 'Генин';
  SH.meta.level = prof.level || '1';
  SH.meta.nature = prof.nature || '';
  SH.meta.chakra = prof.chakra || '30';
  SH.meta.hp = prof.hp || '28';
  SH.meta.ac = prof.ac || '14';
  SH.meta.notes = prof.notes || '';

  SH.techs = Array.isArray(prof.techs) ? prof.techs : [];
  SH.moves = Array.isArray(prof.moves) ? prof.moves : [];
  SH.skills = Array.isArray(prof.skills) ? prof.skills : [];

  saveT();
  saveM();
  saveS();
  saveMeta();
  saveActiveProfileId(prof.id);
  if(typeof updateShinobiTheme === 'function') updateShinobiTheme();
  if(typeof paintShBar === 'function') paintShBar();
}

function switchShinobiProfile(newId){
  if(!newId || newId === SH.activeProfileId) return;
  syncActiveProfileFromState();
  var next = (SH.profiles || []).find(function(p){ return p.id === newId; });
  if(!next) return;
  applyProfileToState(next);
  if(typeof render === 'function') render();
}

function createShinobiProfile(opts){
  syncActiveProfileFromState();
  var p = newShinobiProfile(opts || { charName: 'Новый шиноби', village: 'Коноха', rank: 'Генин' });
  if(!Array.isArray(SH.profiles)) SH.profiles = [];
  SH.profiles.push(p);
  saveProfilesList(SH.profiles);
  applyProfileToState(p);
  if(typeof render === 'function') render();
  return p;
}

function cloneShinobiProfile(id){
  id = id || SH.activeProfileId;
  syncActiveProfileFromState();
  var src = (SH.profiles || []).find(function(p){ return p.id === id; }) || getActiveProfile();
  if(!src) return null;
  var copy = JSON.parse(JSON.stringify(src));
  copy.id = 'sh_prof_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  copy.charName = (copy.charName || 'Шиноби') + ' (Копия)';
  copy.createdAt = new Date().toISOString();
  SH.profiles.push(copy);
  saveProfilesList(SH.profiles);
  applyProfileToState(copy);
  if(typeof render === 'function') render();
  return copy;
}

function deleteShinobiProfile(id){
  id = id || SH.activeProfileId;
  if(!Array.isArray(SH.profiles)) return;
  if(SH.profiles.length <= 1){
    resetShinobiProfile(id);
    return;
  }
  var idx = SH.profiles.findIndex(function(p){ return p.id === id; });
  if(idx === -1) return;
  SH.profiles.splice(idx, 1);
  saveProfilesList(SH.profiles);

  if(SH.activeProfileId === id){
    var next = SH.profiles[Math.max(0, idx - 1)] || SH.profiles[0];
    applyProfileToState(next);
  }
  if(typeof render === 'function') render();
}

function resetShinobiProfile(id){
  id = id || SH.activeProfileId;
  var p = (SH.profiles || []).find(function(item){ return item.id === id; });
  if(!p) return;
  p.charName = '';
  p.clan = '';
  p.village = 'Коноха';
  p.rank = 'Генин';
  p.level = '1';
  p.nature = '';
  p.chakra = '30';
  p.hp = '28';
  p.ac = '14';
  p.notes = '';
  saveProfilesList(SH.profiles);
  if(SH.activeProfileId === id){
    applyProfileToState(p);
  }
  if(typeof render === 'function') render();
}

function getShinobiClanTheme(prof){
  var p = prof || (typeof getActiveProfile === 'function' ? getActiveProfile() : null);
  var name = (p && p.charName ? p.charName : (typeof SH !== 'undefined' && SH.meta && SH.meta.charName ? SH.meta.charName : '')).toLowerCase();
  var clan = (p && p.clan ? p.clan : (typeof SH !== 'undefined' && SH.meta && SH.meta.clan ? SH.meta.clan : '')).toLowerCase();
  var text = (name + ' ' + clan).trim();
  if(/(кураями|kurayami)/i.test(text)) return 'kurayami';
  if(/(учиха|uchiha)/i.test(text)) return 'uchiha';
  if(/(гоман|goman)/i.test(text)) return 'goman';
  if(/(дзанку|занку|dzanku|zanku|хаято|hayato)/i.test(text)) return 'dzanku';
  return 'default';
}

function initUchihaParticles(){
  if(typeof document === 'undefined' || !document.body) return null;
  var cont = document.getElementById('shUchihaParticles');
  if(!cont){
    cont = document.createElement('div');
    cont.id = 'shUchihaParticles';
    cont.className = 'sh-uchiha-particles';
    cont.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(cont, document.body.firstChild);
  }
  if(!cont.children || cont.children.length === 0){
    var particleCount = 20;
    for(var i = 0; i < particleCount; i++){
      var p = document.createElement('div');
      p.className = 'sh-uchiha-fan-particle';
      var size = Math.floor(12 + ((i * 7 + 3) % 17)); // 12px to 28px
      var left = Math.floor((i * 17 + (i % 4) * 6) % 92 + 3); // 3% to 95%
      var top = Math.floor((i * 23 + (i % 3) * 9) % 90 + 4); // 4% to 94%
      var duration = (13 + ((i * 3 + 4) % 12)).toFixed(1); // 13s to 24s slow ambient drift
      var delay = (-1 * ((i * 3.7 + 1.5) % 20)).toFixed(1); // staggered negative delay so they fade in/out continuously
      var animIndex = (i % 5) + 1;
      var maxOp = (0.07 + ((i % 5) * 0.02)).toFixed(2);
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = left + '%';
      p.style.top = top + '%';
      p.style.setProperty('--p-op', maxOp);
      p.style.animation = 'uchihaDrift' + animIndex + ' ' + duration + 's ease-in-out ' + delay + 's infinite';
      cont.appendChild(p);
    }
  }
  return cont;
}

function initKurayamiParticles(){
  if(typeof document === 'undefined' || !document.body) return null;
  var cont = document.getElementById('shKurayamiParticles');
  if(!cont){
    cont = document.createElement('div');
    cont.id = 'shKurayamiParticles';
    cont.className = 'sh-kurayami-particles';
    cont.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(cont, document.body.firstChild);
  }
  if(!cont.children || cont.children.length === 0){
    var particleCount = 28;
    var colors = ['#cfcfcf', '#9e9e9e', '#b8b8b8', '#787878', '#e5e5e5'];
    for(var i = 0; i < particleCount; i++){
      var p = document.createElement('div');
      p.className = 'sh-kurayami-plus-particle';
      var size = Math.floor(7 + ((i * 5 + 3) % 9)); // 7px to 15px
      var left = Math.floor((i * 13 + (i % 5) * 7) % 94 + 2); // 2% to 96%
      var top = Math.floor((i * 19 + (i % 4) * 8) % 92 + 3); // 3% to 95%
      var duration = (9 + ((i * 3 + 2) % 11)).toFixed(1); // 9s to 19s
      var delay = (-1 * ((i * 2.9 + 1.1) % 16)).toFixed(1);
      var animIndex = (i % 5) + 1;
      var maxOp = (0.12 + ((i % 5) * 0.03)).toFixed(2);
      var col = colors[i % colors.length];
      var thickness = (size > 11 ? '1.5px' : '1.2px');
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = left + '%';
      p.style.top = top + '%';
      p.style.setProperty('--p-op', maxOp);
      p.style.setProperty('--p-col', col);
      p.style.setProperty('--p-th', thickness);
      p.style.animation = 'kurayamiDrift' + animIndex + ' ' + duration + 's ease-in-out ' + delay + 's infinite';
      cont.appendChild(p);
    }
  }
  return cont;
}


function initGomanParticles(){
  if(typeof document === 'undefined' || !document.body) return null;
  var cont = document.getElementById('shGomanParticles');
  if(!cont){
    cont = document.createElement('div');
    cont.id = 'shGomanParticles';
    cont.className = 'sh-goman-particles';
    cont.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(cont, document.body.firstChild);
  }
  if(!cont.children || cont.children.length === 0){
    // Solar embers
    for(var i = 0; i < 45; i++){
      var p = document.createElement('div');
      p.className = 'sh-goman-spark-particle';
      var size = Math.floor(Math.random() * 3 + 1); // 1-3px
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.floor(Math.random() * 100) + '%';
      p.style.bottom = '-10px';
      var duration = (5 + Math.random() * 15).toFixed(1);
      var delay = (-Math.random() * 20).toFixed(1);
      var maxOp = (0.2 + Math.random() * 0.4).toFixed(2);
      p.style.setProperty('--p-op', maxOp);
      p.style.animation = 'gomanRise ' + duration + 's ease-in ' + delay + 's infinite';
      cont.appendChild(p);
    }
    // Shishi crests
    for(var j = 0; j < 5; j++){
      var c = document.createElement('div');
      c.className = 'sh-goman-crest-particle';
      c.style.backgroundImage = "url('symbols/clans/" + (Math.random() > 0.5 ? 'sun.png' : 'sun2.webp') + "')";
      var csize = Math.floor(40 + Math.random() * 60); // 40-100px
      c.style.width = csize + 'px';
      c.style.height = csize + 'px';
      c.style.left = Math.floor(Math.random() * 90) + '%';
      c.style.top = Math.floor(Math.random() * 90) + '%';
      var cdur = (20 + Math.random() * 20).toFixed(1);
      var cdelay = (-Math.random() * 40).toFixed(1);
      var cop = (0.08 + Math.random() * 0.04).toFixed(2);
      c.style.setProperty('--p-op', cop);
      c.style.animation = 'gomanDrift ' + cdur + 's ease-in-out ' + cdelay + 's infinite';
      cont.appendChild(c);
    }
  }
  return cont;
}


function initDzankuParticles(){
  if(typeof document === 'undefined' || !document.body) return null;
  var cont = document.getElementById('shDzankuParticles');
  if(!cont){
    cont = document.createElement('div');
    cont.id = 'shDzankuParticles';
    cont.className = 'sh-dzanku-particles';
    cont.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(cont, document.body.firstChild);
  }
  if(!cont.children || cont.children.length === 0){
    // Quantum frames
    for(var i = 0; i < 35; i++){
      var p = document.createElement('div');
      p.className = 'sh-dzanku-spark-particle';
      // tiny geometric micro-frames 4-8px
      var width = Math.floor(4 + Math.random() * 5); 
      var height = Math.floor(4 + Math.random() * 5);
      // Make some of them distinctly rectangular like film frames
      if(Math.random() > 0.5) width = Math.floor(width * 1.5);
      else height = Math.floor(height * 1.5);
      
      p.style.width = width + 'px';
      p.style.height = height + 'px';
      p.style.left = Math.floor(Math.random() * 100) + '%';
      p.style.top = Math.floor(Math.random() * 100) + '%';
      
      var duration = (4 + Math.random() * 3).toFixed(1); // 4-7s
      var delay = (-Math.random() * 10).toFixed(1);
      var maxOp = (0.2 + Math.random() * 0.5).toFixed(2);
      
      // Sometimes ivory color instead of amber
      if(Math.random() > 0.8) p.style.setProperty('--spark-bg', '#f4f0e6');
      
      p.style.setProperty('--p-op', maxOp);
      p.style.animation = 'dzankuQuantum ' + duration + 's steps(1, end) ' + delay + 's infinite';
      cont.appendChild(p);
    }
    // Layer 2: Dzanku crests
    for(var j = 0; j < 18; j++){
      var c = document.createElement('div');
      c.className = 'sh-dzanku-crest-particle';
      var csize = Math.floor(30 + Math.random() * 40); // 30-70px
      c.style.width = csize + 'px';
      c.style.height = csize + 'px';
      c.style.left = Math.floor(Math.random() * 95) + '%';
      c.style.top = Math.floor(Math.random() * 95) + '%';
      var cdur = (20 + Math.random() * 25).toFixed(1);
      var cdelay = (-Math.random() * 40).toFixed(1);
      var cop = (0.06 + Math.random() * 0.06).toFixed(2);
      c.style.setProperty('--p-op', cop);
      c.style.animation = 'dzankuDrift ' + cdur + 's ease-in-out ' + cdelay + 's infinite';
      cont.appendChild(c);
    }
  }
  return cont;
}

function updateShinobiTheme(){
  if(typeof document === 'undefined' || !document.body) return;
  if(typeof HB === 'undefined' || HB.mode !== 'sh'){
    document.body.classList.remove('sh-theme-kurayami', 'sh-theme-uchiha', 'sh-theme-goman', 'sh-theme-dzanku');
    var pKur = document.getElementById('shKurayamiParticles');
    if(pKur) pKur.style.display = 'none';
    var pUch = document.getElementById('shUchihaParticles');
    if(pUch) pUch.style.display = 'none';
    var pGom = document.getElementById('shGomanParticles');
    if(pGom) pGom.style.display = 'none';
    var pDza = document.getElementById('shDzankuParticles');
    if(pDza) pDza.style.display = 'none';
    return;
  }
  var theme = getShinobiClanTheme();
  var isKurayami = (theme === 'kurayami');
  var isUchiha = (theme === 'uchiha');
  var isGoman = (theme === 'goman');
  var isDzanku = (theme === 'dzanku');
  
  document.body.classList.toggle('sh-theme-kurayami', isKurayami);
  document.body.classList.toggle('sh-theme-uchiha', isUchiha);
  document.body.classList.toggle('sh-theme-goman', isGoman);
  document.body.classList.toggle('sh-theme-dzanku', isDzanku);

  if(isKurayami){
    var pKur = initKurayamiParticles();
    if(pKur) pKur.style.display = 'block';
  } else {
    var pKur = document.getElementById('shKurayamiParticles');
    if(pKur) pKur.style.display = 'none';
  }

  if(isUchiha){
    var pUch = initUchihaParticles();
    if(pUch) pUch.style.display = 'block';
  } else {
    var pUch = document.getElementById('shUchihaParticles');
    if(pUch) pUch.style.display = 'none';
  }

  if(isGoman){
    var pGom = initGomanParticles();
    if(pGom) pGom.style.display = 'block';
  } else {
    var pGom = document.getElementById('shGomanParticles');
    if(pGom) pGom.style.display = 'none';
  }

  if(isDzanku){
    var pDza = initDzankuParticles();
    if(pDza) pDza.style.display = 'block';
  } else {
    var pDza = document.getElementById('shDzankuParticles');
    if(pDza) pDza.style.display = 'none';
  }
}

var SH = {
  profiles: [],
  activeProfileId: null,
  techs:[], moves:[], skills:[], meta: Object.assign({}, DEFAULT_META), draft:null,
  techFilter:'all', moveFilter:'all', hudEditing:false,
  launcher:{ techId:'', isExp:false, isOpen:false, mods:{ exp:0, atk:0, dmg:0 }, selectedTarget:'atk', rolledValues:null, lastResult:'', lastResultCopied:false },
  newShinobiProfile: newShinobiProfile,
  loadProfiles: loadProfiles,
  saveProfilesList: saveProfilesList,
  getActiveProfile: getActiveProfile,
  syncActiveProfileFromState: syncActiveProfileFromState,
  applyProfileToState: applyProfileToState,
  switchShinobiProfile: switchShinobiProfile,
  createShinobiProfile: createShinobiProfile,
  cloneShinobiProfile: cloneShinobiProfile,
  deleteShinobiProfile: deleteShinobiProfile,
  resetShinobiProfile: resetShinobiProfile,
  getShinobiClanTheme: getShinobiClanTheme,
  updateShinobiTheme: updateShinobiTheme,
  initKurayamiParticles: initKurayamiParticles,
  initUchihaParticles: initUchihaParticles,
  saveT: saveT,
  saveM: saveM,
  saveS: saveS,
  saveMeta: saveMeta
};
window.SH = SH;

function load(){
  SH.profiles = loadProfiles();
  try{ SH.activeProfileId = localStorage.getItem(SH_ACTIVE_PROFILE_STORAGE_KEY) || null; }catch(e){}
  var act = getActiveProfile();
  SH.activeProfileId = act.id;

  try{ var w=JSON.parse(localStorage.getItem('ttc_sh_meta')||'null'); if(w) SH.meta=Object.assign({}, DEFAULT_META, w); else SH.meta=Object.assign({}, DEFAULT_META); }catch(e){ SH.meta=Object.assign({}, DEFAULT_META); }

  SH.meta.charName = act.charName || SH.meta.charName || '';
  SH.meta.clan = act.clan || SH.meta.clan || '';
  SH.meta.village = act.village || SH.meta.village || 'Коноха';
  SH.meta.rank = act.rank || SH.meta.rank || 'Генин';
  SH.meta.level = act.level || SH.meta.level || '1';
  SH.meta.nature = act.nature || SH.meta.nature || '';
  SH.meta.chakra = act.chakra || SH.meta.chakra || '30';
  SH.meta.hp = act.hp || SH.meta.hp || '28';
  SH.meta.ac = act.ac || SH.meta.ac || '14';

  SH.techs = Array.isArray(act.techs) ? act.techs : [];
  SH.moves = Array.isArray(act.moves) ? act.moves : [];
  SH.skills = Array.isArray(act.skills) ? act.skills : [];
  if(typeof updateShinobiTheme === 'function') updateShinobiTheme();
}

function saveT(){
  try{ localStorage.setItem('ttc_sh_techs', JSON.stringify(SH.techs)); }catch(e){}
  var act = (SH.profiles || []).find(function(p){ return p.id === SH.activeProfileId; });
  if(act){ act.techs = SH.techs; saveProfilesList(SH.profiles); }
}

function saveM(){
  try{ localStorage.setItem('ttc_sh_moves', JSON.stringify(SH.moves)); }catch(e){}
  var act = (SH.profiles || []).find(function(p){ return p.id === SH.activeProfileId; });
  if(act){ act.moves = SH.moves; saveProfilesList(SH.profiles); }
}

function saveS(){
  try{ localStorage.setItem('ttc_sh_skills', JSON.stringify(SH.skills)); }catch(e){}
  var act = (SH.profiles || []).find(function(p){ return p.id === SH.activeProfileId; });
  if(act){ act.skills = SH.skills; saveProfilesList(SH.profiles); }
}

function saveMeta(){
  try{ localStorage.setItem('ttc_sh_meta', JSON.stringify(SH.meta)); }catch(e){}
  var act = (SH.profiles || []).find(function(p){ return p.id === SH.activeProfileId; });
  if(act){
    act.charName = SH.meta.charName || '';
    act.clan = SH.meta.clan || '';
    act.village = SH.meta.village || 'Коноха';
    act.rank = SH.meta.rank || 'Генин';
    act.level = SH.meta.level || '1';
    act.nature = SH.meta.nature || '';
    act.chakra = SH.meta.chakra || '30';
    act.hp = SH.meta.hp || '28';
    act.ac = SH.meta.ac || '14';
    saveProfilesList(SH.profiles);
  }
  if(typeof updateShinobiTheme === 'function') updateShinobiTheme();
}

/* ---------- справочные данные (только чтение) ---------- */
var RANKS   = ['E','D','C','B','A','S'];
var WINDOWS = [
  {k:'svyazan',   ru:'СВЯЗАН',     desc:'Противник занят боем с кем-то ещё — клоном, союзником, призванным зверем.'},
  {k:'obezdv',    ru:'ОБЕЗДВИЖЕН', desc:'Схвачен, спутан, придавлен, в ловушке, в удерживающей технике.'},
  {k:'oslep',     ru:'ОСЛЕПЛЁН',   desc:'Дым, песок, темнота, вспышка, гендзюцу.'},
  {k:'sbit',      ru:'СБИТ',       desc:'Потерял равновесие, отброшен, промахнулся крупной атакой, восстанавливается после своего приёма.'},
  {k:'distanciya',ru:'ДИСТАНЦИЯ',  desc:'Не может дотянуться до персонажа в этом раунде.'},
  {k:'nezamechen',ru:'НЕЗАМЕЧЕН',  desc:'Не знает, где персонаж, или принимает за него клона либо подмену.'}
];
var EFFECTS = [
  {k:'uron',   ru:'Разовый урон',   desc:'Платится один раз, цена растёт с величиной урона.'},
  {k:'sost',   ru:'Состояние',      desc:'Связать, ослепить, сбить, обездвижить. Заметно дешевле урона: только открывает окно.'},
  {k:'util',   ru:'Утилита',        desc:'Перемещение, маскировка, разведка, отвлечение, связь. Дёшево — бой не решает.'},
  {k:'usil',   ru:'Усиление',       desc:'Себя или союзника. Активация плюс поддержание за раунд.'},
  {k:'pole',   ru:'Поле или режим', desc:'Меняет условия боя. Активация плюс поддержание; вправе менять стоимость других техник внутри себя.'}
];
var STATES = [
  {ru:'СБИТ',       desc:'Потерял равновесие. Открывает окно на один ход — до конца следующего хода цели.'},
  {ru:'ОБЕЗДВИЖЕН', desc:'Скорость ноль, не может сместиться. Держится, пока держат, либо по длительности техники.'},
  {ru:'ОСЛЕПЛЁН',   desc:'Не видит цель: атаки с помехой, по нему — с преимуществом. Сенсоры и додзюцу могут не подчиняться.'},
  {ru:'КРОВОТЕЧЕНИЕ',desc:'Открытая рана от режущего или колющего. Урон каждый раунд без броска, пока рану не зажали, не прижгли или не залечили. Окна НЕ открывает: раненый дерётся, просто дороже. Накапливается — два кровотечения текут независимо.'},
  {ru:'ИСТОЩЕНИЕ',  desc:'Накапливается от долга чакры, превышения счётчиков техник и тяжёлых нагрузок. Снимается только отдыхом.'},
  {ru:'ДОЛГ ЧАКРЫ', desc:'Черпание при нулевом пуле: хит за единицу, уровень истощения за каждые 10% пула. Предел долга 30% — дальше обморок.'},
  {ru:'СЛОМ',       desc:'Три трещины подряд на допросе. Персонаж отвечает на вопросы, пока не восстановится. Факт слома остаётся навсегда.'}
];

var REF = {
  okna: {t:'Окна', icon:'🎯', lead:'Тяжёлая техника требует, чтобы противник был ЗАНЯТ. Не таймер, а условие применения. Окна нет — техника проходит, но противник получает бесплатную реакцию, и козырь тратится.',
    rows: WINDOWS.map(function(w){ return {k:w.ru, v:w.desc}; }).concat([
      {k:'Длительность', v:'Один ход — до конца следующего хода цели. Дольше держится только специальной техникой удержания или продолжением действия: связать уже сбитого вместо того, чтобы бить.'},
      {k:'Окно тратится', v:'Вложил технику — окно закрылось, независимо от заявленной длительности.'},
      {k:'Повтор дорожает', v:'Каждое следующее наложение того же состояния на ту же цель в этом бою — сложность выше на 2.'},
      {k:'Не складывается', v:'Сбитый не может быть сбит сильнее. Состояние не суммируется само с собой.'},
      {k:'Пассивное сопротивление', v:'Цель может выстоять против состояния соответствующей пассивной характеристикой, даже получив урон. Урон и эффект разводятся.'}
    ])},

  rangi: {t:'Ранги техник', icon:'📶', lead:'Ранг — это ВОРОТА ДОСТУПА: насколько трудно освоить, насколько опасна, насколько закрыта. Ранг не определяет цену применения.',
    rows:[
      {k:'E', v:'Академический уровень. Хенге, Буншин, Каварими. Осваивает любой ученик.'},
      {k:'D', v:'Рабочие техники генина. Простое ниндзюцу одной природы, базовые ловушки.'},
      {k:'C', v:'Уровень чунина. Полноценные боевые техники, требуют устойчивого контроля.'},
      {k:'B', v:'Уровень джонина. Часто требуют цепочки печатей и заметного пула.'},
      {k:'A', v:'Редкие и опасные. Обычно родовые, штучные или запретные.'},
      {k:'S', v:'Вершинные. Недостижимы без ИСТОЧНИКА: родового свитка, наставника соответствующего уровня, кеккей генкая или уникального обстоятельства.'},
      {k:'Изучение', v:'Ограничено ТРЕБОВАНИЯМИ техники — пулом, контролем, природой, физическими данными, иногда кровью, — а не рангом. Отвечаешь требованиям и есть теория — техника доступна, каким бы ни был ранг.'},
      {k:'Разработка', v:'Ограничена ЦЕПОЧКОЙ РАНГОВ: B требует уверенного C того же семейства, A требует B, S требует цепочку плюс источник. Провал при разработке обязателен.'},
      {k:'Запретные (кинзюцу)', v:'Отдельная метка, а не ранг: техника запрещена деревней из-за цены для носителя или для мира. Может быть любого ранга.'}
    ]},

  teoriya: {t:'Как осваиваются техники', icon:'📖', lead:'Любая техника = ТЕОРИЯ + ПРАКТИКА. Нужны оба; одного недостаточно никогда. Скорость определяется полнотой теории, соответствием техники носителю и вложенным временем — не рангом.',
    rows:[
      {k:'Учитель', v:'Самая полная и быстрая теория: объясняет, показывает, поправляет ошибки. Цена — доступ, согласие, время, социальный долг.'},
      {k:'Свиток или запись', v:'Цена — деньги, наследство, находка или кража, плюс разбор. Может быть неполным, повреждённым, зашифрованным или неверным, и это выясняется на практике.'},
      {k:'Наблюдение', v:'Одного раза не хватает никогда. Теория выходит неполной, техника — приблизительной и ослабленной. Додзюцу — исключение: полная теория с одного показа.'},
      {k:'Собственная работа', v:'Без учителя, свитка и показа. Требует ПОСТОЯННОГО ФОКУСА — одно направление одновременно, недели и месяцы. Вывести можно только то, что следует из уже освоенного. Результат часто получается личным вариантом техники. Тем же фокусом оплачивается разработка новой.'},
      {k:'Практика', v:'Контроль чакры, отработка формы, преобразование природы, повторение до устойчивого результата. Без неё теория остаётся знанием о технике, а не техникой.'}
    ]},

  priroda: {t:'Природы чакры', icon:'🌿', lead:'Пять базовых природ. Круг превосходства: огонь бьёт ветер, ветер бьёт молнию, молния бьёт землю, земля бьёт воду, вода бьёт огонь. Слияния двух природ дают кеккей генкай и передаются только по крови.',
    rows:[
      {k:'Огонь (Катон)',  v:'Сильнее ветра, слабее воды. Прямой урон, поджоги, широкие волны.'},
      {k:'Ветер (Фуутон)', v:'Сильнее молнии, слабее огня. Режущее, дальнобойное, усиливает оружие.'},
      {k:'Молния (Райтон)',v:'Сильнее земли, слабее ветра. Пробивание, скорость, паралич.'},
      {k:'Земля (Дотон)',  v:'Сильнее воды, слабее молнии. Стены, ловушки, перемещение под поверхностью.'},
      {k:'Вода (Суйтон)',  v:'Сильнее огня, слабее земли. Гибкость, объём, требует источника или большого пула.'},
      {k:'Инь и Ян',       v:'Не боевые природы: Инь — воображение и форма (основа гендзюцу), Ян — жизненная сила и телесность. Их слияние даёт создание из ничего.'}
    ]},

  navyki: {t:'Навыки и знания', icon:'🛠️', lead:'Всё, что персонаж умеет помимо боя. Шиноби — не только оружие: деревня живёт ремеслом, торговлей и хозяйством, и половина заданий низкого ранга — это работа руками. Навык берётся от того, что персонаж этим занимался, и ни от чего больше.',
    rows:[
      {k:'ОТКУДА БЕРУТСЯ', v:'Из биографии и из игры. Кто-то рос при кузне, кто-то месяц таскал мешки у торговца, кого-то научила соседка. Навык не начисляется за уровень и не покупается: его дают время, наставник и повторение. Появление нового навыка — это событие в игре, а не строчка в листе.'},
      {k:'УРОВНИ', v:'Начатки — видел и повторит под присмотром, результат кривой.\nУченик — делает сам простое, портит материал.\nПодмастерье — делает надёжно, знает, где ошибётся.\nУмелец — работает быстро и на продажу.\nМастер — учит других и делает то, чего не умеют прочие.'},
      {k:'КОГДА НУЖЕН БРОСОК', v:'Только когда исход под вопросом и цена ошибки существенна. Подмастерье не бросает на обычный узел и обычный суп — он их просто делает. Бросают на срок, на редкий материал, на чужую технологию, на работу в плохих условиях.'},
      {k:'ЧТО НАВЫК ДАЁТ ПОМИМО БРОСКА', v:'Право знать. Кузнец видит по кромке, чем рубили; повар отличает свежее от порченого; ткач узнаёт, из какой страны ткань. Это не проверка, а сведения, которые ДМ обязан выдать носителю навыка и не выдавать остальным.'},
      {k:'ДЕНЬГИ И БЫТ', v:'Ремесло кормит. Навык уровня подмастерья и выше — законный способ заработать между заданиями, чинить своё снаряжение и не платить за то, что делаешь сам. Это же повод для знакомств: у ремесла всегда есть заказчик.'},
      {k:'СВЯЗЬ С ТЕХНИКАМИ', v:'Навык не заменяет технику и не даёт скидки на чакру. Но он определяет, что персонаж вообще способен задумать: не зная кузнечного дела, техникой металл не выкуешь — форма будет, качества не будет.'},
      {k:'ЯЗЫКИ И ГРАМОТА', v:'Считаются навыками знания. Грамота у шиноби предполагается — отчёты пишут все. Чужой язык, шифр, чтение карт, счёт больших чисел — отдельные навыки, и их отсутствие ДМ обязан отыгрывать честно.'},
      {k:'ПОТЕРЯ', v:'Навыки не ржавеют сами по себе. Но руки помнят хуже головы: после долгого перерыва первый раз идёт на уровень ниже, пока персонаж не разомнётся.'}
    ]},

  kategorii: {t:'Категории и происхождение', icon:'🗂️', lead:'Категория говорит, ЧТО это за техника. Происхождение — откуда у носителя право ею владеть. Одна техника принадлежит ровно одной категории происхождения; не путай их между собой.',
    rows:[
      {k:'Ниндзюцу',      v:'Техники чакры: природы, формы, призывы, барьеры. Основная масса.'},
      {k:'Тайдзюцу',      v:'Рукопашное и оружейное: скорость, сила, приёмы. Чакрой усиливается, но не требует её обязательно.'},
      {k:'Гендзюцу',      v:'Иллюзии: вмешательство в поток чакры чужого сознания. Защита — своя техника развеивания или сорванная концентрация.'},
      {k:'Додзюцу',       v:'Техники глаз и зрительного восприятия (Шаринган, Бьякуган, Риннеган). Чтение потоков чакры, предвидение движений, гендзюцу взгляда, пространственные техники и особые способности додзюцу.'},
      {k:'Фуиндзюцу',     v:'Печати: запечатывание, хранение, барьеры, метки. Медленное в бою, мощное в подготовке.'},
      {k:'Кендзюцу',      v:'Оружейное искусство как отдельная школа.'},
      {k:'Ирьениндзюцу',  v:'Медицинские техники: лечение, диагностика, точное вмешательство. Требуют высочайшего контроля.'},
      {k:'Кучиёсэ',       v:'Призыв. Требует контракта, крови и согласия призываемого.'},
      {k:'Сендзюцу',      v:'Природная энергия. Крайне опасно без наставника: перебор превращает носителя в камень.'},
      {k:'ПРОИСХОЖДЕНИЕ — Общая', v:'Базовая техника без привязки. Не требует ни сродства к стихии, ни крови, ни принадлежности к роду. Осваивается любым, кто способен управлять чакрой; этому учат в Академии. Поле «Природа / род» у таких техник пустое.'},
      {k:'ПРОИСХОЖДЕНИЕ — Природа чакры', v:'Предрасположенность. Осваивается кем угодно с нужным сродством.'},
      {k:'ПРОИСХОЖДЕНИЕ — Кеккей генкай', v:'КРОВЬ. Слияние двух природ или додзюцу. Либо есть с рождения, либо нет никогда, за уровни не покупается.'},
      {k:'ПРОИСХОЖДЕНИЕ — Хиден',         v:'СЕКРЕТ. Клановая тайная техника, передаётся обучением внутри рода, а не рождением. Посторонний способен освоить — потому род и держит её в тайне. Конечный родовой каталог; пополнение — событие масштаба поколения. Утечка наружу равна потере.'}
    ]},

  chakra: {t:'Чакра: расход и восстановление', icon:'🔵', lead:'Чакра не ячейки заклинаний: она не ждёт длинного отдыха. Восстановление завязано на НАГРУЗКУ — носитель наполняется, как только перестаёт тратить.',
    rows:[
      {k:'В бою',   v:'Полное действие на концентрацию возвращает 10% максимума пула, округляя вверх. Действие тратится целиком.'},
      {k:'Вне боя', v:'10% максимума за минуту полного покоя, 5% за минуту лёгкой активности. Полный пул — за десять-двадцать минут.'},
      {k:'Сон',     v:'Полный пул за 7–9 часов. Половина за короткий сон в 3–4 часа.'},
      {k:'Не идёт', v:'При беге, под нагрузкой, в бою без потраченного на это действия и при активной поддерживаемой технике.'},
      {k:'Уход в долг', v:'Черпать можно и при нуле. Хит за каждую единицу, уровень истощения за каждые 10% максимума. Предел долга 30% пула — дальше обморок независимо от хитов.'},
      {k:'Погашение долга', v:'Сперва отдаётся долг и только потом наполняется пул. Уровни истощения снимаются отдыхом отдельно.'},
      {k:'Пилюли', v:'Возвращают заметную часть мгновенно, но берут её из резерва тела: после окончания — истощение и повышенный расход в ближайшие сутки. Механизм «заплачу потом».'}
    ]},

  scetchik: {t:'Дневной лимит техники', icon:'⏳', lead:'Часть техник ограничена не запасом чакры, а ТЕЛОМ. Признак: носитель может применить ещё раз по запасу, но не может по состоянию — рвутся мышцы, горят каналы, садится зрение.',
    rows:[
      {k:'Величина', v:'Два применения в сутки базово, плюс одно за каждые полные четыре уровня. Предел — шесть. Целенаправленная тренировка добавляет ещё одно, один раз на технику.'},
      {k:'Персональность', v:'Счётчик привязан к конкретной технике конкретного носителя. Исчерпав его, он свободно применяет все остальные свои техники.'},
      {k:'Восстановление', v:'Только полный отдых. Ни концентрация в бою, ни привал счётчик не возвращают: порванные связки не заживают от того, что перестал тратить чакру.'},
      {k:'Превышение — первое', v:'Урон в четверть максимума хитов и один уровень истощения.'},
      {k:'Превышение — второе', v:'Урон в половину максимума хитов и два уровня истощения.'},
      {k:'Превышение — третье и дальше', v:'То же плюс НЕОБРАТИМОЕ: порванные мышцы, сожжённая рука, повреждение системы циркуляции, испорченное зрение. Обморок сразу после применения.'},
      {k:'Правила превышения', v:'Урон проходит мимо любой защиты — это износ, а не рана. Цена объявляется ДО броска и не смягчается после.'},
      {k:'Взаимозачёт', v:'Счётчик — это ограничение, поэтому покупает послабления: техника со счётчиком дешевле в чакре и мягче по окну. Редко, зато решает.'}
    ]}
};

REF.klony = {t:'Клоны', icon:'👥', lead:'Опасность клонов не в силе, а в ЭКОНОМИКЕ ДЕЙСТВИЙ: десять тел дают десять бросков против одной реакции. Поэтому клоны делятся на два класса с разным разрешением.',
  rows:[
    {k:'КЛАСС 1 — массовые', v:'Всегда ОДИН участник боя, независимо от количества: одна инициатива, одно действие, один бросок на всю группу. Урон общий, скалируется числом. ОЗ группы равны числу клонов, каждый гибнет от одного попадания, и урон по группе уничтожает столько, сколько выпало на кости.'},
    {k:'Численность 2–4',   v:'+1 к броску, без помехи.'},
    {k:'Численность 5–9',   v:'+2, без помехи.'},
    {k:'Численность 10–19', v:'+3, с помехой — мешают друг другу.'},
    {k:'Численность 20+',   v:'+4, с помехой.'},
    {k:'Контр',             v:'Площадные атаки выкашивают группу целиком. Это обязательная часть правила, а не усмотрение мастера.'},
    {k:'КЛАСС 2 — продвинутые', v:'Берут у оригинала заметно больше чакры, жёсткий лимит числа. Полноценные участники хода: своя инициатива, действие, броски. Пониженные ОЗ, чакра и характеристики — уничтожаются легко. Их ценность в том, что они ТРАТЯТ ДЕЙСТВИЕ ВРАГА, а это окно СВЯЗАН для оригинала.'},
    {k:'Иллюзорный клон',   v:'Ранг E, академический. Физически не может ничего: не бьёт, не поднимает предметы, развеивается от касания. Только отвлечь взгляд.'},
    {k:'Теневой клон',      v:'Ранг B, запретный. Материален, гибнет от одного попадания, делит чакру поровну, ВОЗВРАЩАЕТ ПАМЯТЬ оригиналу при развеивании. Развеивание многих разом даёт перегруз.'},
    {k:'Водяной клон',      v:'Ранг C. Держит одно-два попадания, около трети силы оригинала, нужна вода поблизости.'},
    {k:'Земляной клон',     v:'Ранг C–B. Собственные ОЗ, держит несколько ударов, медленный, нужна земля или камень.'},
    {k:'Клановые клоны',    v:'Параметры задаёт хиден рода, обычно жёсткий лимит числа.'},
    {k:'Общее',             v:'Сенсоры и додзюцу отличают оригинала от любых клонов. Клон, требующий материала, не создаётся там, где материала нет.'}
  ]};

REF.dopros = {t:'Давление, допрос и плен', icon:'🔒', lead:'Заявление намерения не равно результату. Молчит ли персонаж, решает процедура. СПОСОБ выбирает игрок — по сцене или по броску; оба равноправны и оба могут кончиться трещиной.',
  rows:[
    {k:'Уговоры, обещания, торг', v:'Мудрость. Или Харизма, если давят на тщеславие.'},
    {k:'Угроза близким, шантаж',  v:'Мудрость.'},
    {k:'Лишение сна, голод, холод', v:'Телосложение.'},
    {k:'Боль и увечье',           v:'Телосложение.'},
    {k:'Гендзюцу, чтение памяти', v:'Мудрость или спасбросок против самой техники.'},
    {k:'Препараты, яд правды',    v:'Телосложение.'},
    {k:'Рост сложности', v:'Первый заход — базовая. Каждый следующий за тот же период — на 2 выше, пока персонаж не отдохнёт, не поест и не поспит. Профессиональный дознаватель добавляет ещё. Измотанный или раненый бросает с помехой.'},
    {k:'ТРЕЩИНА', v:'При провале мастер называет ДВА конкретных факта из того, что персонаж действительно знает, и игрок выбирает, какой ушёл. Отказаться от выбора нельзя.'},
    {k:'СЛОМ', v:'Три трещины подряд. Персонаж отвечает на вопросы, пока не восстановится: время, сон, безопасность. Факт слома остаётся в нём навсегда.'},
    {k:'Что даёт удержанный заход', v:'Проходит время, приближая всё, что приближается. Дознаватель теряет терпение или репутацию перед начальством. И главное — САМИ ВОПРОСЫ ВЫДАЮТ, ЧЕГО ОН НЕ ЗНАЕТ.'},
    {k:'Ложь', v:'Законный ход: проверка обмана против внимания дознавателя. Согласованная с их сведениями — работает; противоречащая — стоит трещины сразу.'},
    {k:'Эскалация', v:'Дознаватель поднимает ставки ровно настолько, насколько требует его цель. Нужен для обмена — калечить невыгодно. Нужны сведения к сроку — выгодно. Мстит — сведения не нужны вовсе.'}
  ]};

REF.porazhenie = {t:'Поражение', icon:'🩸', lead:'Сюжетной брони нет. Ноль хитов — это ВЫБЫВАНИЕ, а не смерть: что дальше, читается из цели противника. Смерть наступает, когда над телом стоит тот, кому нужен труп, и ему никто не мешает.',
  rows:[
    {k:'Цель противника', v:'Записывается ДО первого броска, ровно одна из четырёх: нужен труп / всё равно / нужен живой / нежелательно (приказ, шум, внимание, цена, свидетели). Отсюда и читается исход.'},
    {k:'Читаемость', v:'Цель показывается поведением: куда бьют, что говорят, чего избегают, кого прикрывают. Тот, кому нужен труп, дерётся иначе, чем тот, кому нужен пленный. Отступление — законный и часто верный ход.'},
    {k:'Состояние чакры врага', v:'Ведётся лестницей: свежий → тратил → на исходе → выжат. Числа именным противникам не назначаются. Состояние читается из дыхания, отказа от техник, перехода на сталь.'},
    {k:'ЦЕНА — тело',      v:'Ссадины, сломанные рёбра, шрамы, ожоги, разорванные мышцы, повреждение системы циркуляции, потеря глаза или конечности. Шрамы — обычная часть жизни шиноби.'},
    {k:'ЦЕНА — время',     v:'Недели и месяцы восстановления, пока мир идёт дальше.'},
    {k:'ЦЕНА — вещь',      v:'Утраченная техника, забранный свиток, сломанное оружие.'},
    {k:'ЦЕНА — положение', v:'Отстранение, разжалование, потеря допуска, запись в личное дело.'},
    {k:'ЦЕНА — свобода',   v:'Плен как играемое состояние: содержание, допросы, побег, выкуп, обмен, вербовка.'},
    {k:'ЦЕНА — люди',      v:'Платит не персонаж, а тот, кого он защищал, вёл или подставил.'},
    {k:'ЦЕНА — тайна',     v:'Поражение раскрывает скрытое: лицо, имя, хиден, принадлежность, связь. Для того, кто живёт на секретах, это тяжелее физического урона и работает месяцами.'},
    {k:'Без соломки',      v:'Спасение, не установленное в сцене ДО броска, задним числом не вводится. Никогда.'}
  ]};

REF.sluzhba = {t:'Служба и ранги', icon:'🎖️', lead:'Состав отряда определяется службой и задачей, а не жанром: он есть, потом его нет, потом собирается другой.',
  rows:[
    {k:'Ученик Академии', v:'Не шиноби. Учится, сдаёт выпускной экзамен, жетона не имеет.'},
    {k:'Генин',   v:'Низший служебный ранг. Обычно закреплённая тройка с джонином-наставником, держащаяся годами. Миссии D и C.'},
    {k:'Чунин',   v:'Право командовать малой группой, вести отчётность, принимать решения в поле. Сводные отряды под задачу. Миссии C и B.'},
    {k:'Токубецу-джонин', v:'Специалист узкого профиля уровня джонина: разведка, допрос, яды, засады, сенсорика. Полномочия джонина в своей области, ниже — вне её.'},
    {k:'Джонин',  v:'Полная самостоятельность, право вести отряд и обучать генинов. Миссии A.'},
    {k:'АНБУ',    v:'Отдельная структура прямого подчинения Каге. Маска, кодовое имя, безымянность. Миссии A и S.'},
    {k:'Каге',    v:'Глава деревни. Назначается и утверждается, а не наследуется.'},
    {k:'Нукенин', v:'Отступник. Вне закона, в Бинго-книге, за голову назначена цена. Возврат почти невозможен.'},
    {k:'Отряды',  v:'У генина — постоянная тройка. Выше — сводные группы, одиночные выходы, работа в паре, прикомандирование к чужой группе. Всё это нормальные режимы.'}
  ]};

REF.missii = {t:'Ранги миссий', icon:'📜', lead:'Ранг миссии определяет опасность, оплату и минимальный состав. Оформляется карточкой: заказчик, задача, место и срок, оплата (доля деревни удержана), состав отряда, примечания.',
  rows:[
    {k:'D', v:'Бытовые поручения внутри деревни и рядом: прополка, поиск животного, помощь в лавке, сопровождение по улице. Риска почти нет, оплата символическая. Основной хлеб генинов.'},
    {k:'C', v:'Выход за периметр, охрана, сопровождение, разведка местности. Возможна встреча с бандитами и зверьём. Первый реальный риск.'},
    {k:'B', v:'Противник — шиноби. Разведка чужой территории, диверсия, охрана значимого лица, зачистка. Минимум чунин в составе.'},
    {k:'A', v:'Прямое столкновение с сильным противником, политически чувствительные задачи, работа на чужой территории. Джонин обязателен.'},
    {k:'S', v:'Уникальные задачи высшей опасности и секретности. Устранение, перехват, работа против отступников уровня Бинго-книги. АНБУ или джонины высшего звена.'},
    {k:'Оплата', v:'Деревня удерживает свою долю до выдачи. Провал, срыв срока и нарушение условий бьют по институциональной репутации, а не только по кошельку.'}
  ]};

REF.akademiya = {t:'Академия', icon:'🎓', lead:'Академия даёт всем выпускникам одинаковый фиксированный набор — это общий знаменатель мира. Любой генин умеет ровно это и ничего сверх, если у него нет клана, наставника или свитка.',
  rows:[
    {k:'Хенге но Дзюцу',   v:'Превращение, ранг E. Внешняя иллюзия облика.'},
    {k:'Буншин но Дзюцу',  v:'Иллюзорный клон, ранг E. Физически не может ничего.'},
    {k:'Каварими но Дзюцу',v:'Подмена, ранг E. Каноническая реакция этого мира: превращает попадание в смену позиции. Требует, чем подменяться, и даёт окно НЕЗАМЕЧЕН на один ход.'},
    {k:'Базовые навыки',   v:'Метательное оружие, базовое тайдзюцу, начальный контроль чакры (лазание по деревьям), чтение печатей, устав и субординация, основы полевой медицины.'},
    {k:'Старт выпускника', v:'Первый уровень, малый пул чакры, костей тайдзюцу нет, приёмов нет или один.'},
    {k:'Выпускной экзамен',v:'Проверка именно этого пула, а не абстрактная сцена: каждая техника проверяется поимённо, с броском. Провал по одной означает провал экзамена целиком. Пересдача возможна и имеет репутационную цену.'}
  ]};

REF.taidzu = {t:'Приёмы: кости и виды', icon:'👊', lead:'Приём — это объявленное боевое действие без чакры: рукопашное или оружейное. Приёмы и инструменты — то, ЧЕМ СОЗДАЮТСЯ ОКНА, без них тяжёлую технику некуда вложить. Но не каждый приём навязывает состояние: часть просто наносит урон, часть тратится в чужой ход, часть меняет позицию.',
  rows:[
    {k:'ПЯТЬ ВИДОВ ПРИЁМОВ', v:'УРОН — просто способ ударить сильнее или точнее, окна не даёт.\nСОСТОЯНИЕ — навязывает окно: сбивает, валит, ослепляет, обезоруживает.\nРЕАКЦИЯ — тратится в чужой ход: перехват, контратака, уход с линии.\nМАНЁВР — перемещение и позиция: разрыв дистанции, заход за спину, смена высоты.\nЗАЩИТА — снижает или отменяет входящее.\nВид определяет, чем приём платится и когда применяется; ранга у приёмов нет вообще.'},
    {k:'Рукопашные и оружейные', v:'Одна механика, разные проявления. Оружейный приём требует, чтобы нужное оружие было В РУКАХ, и теряется вместе с ним; рукопашный отобрать нельзя. Оружие даёт длину, режущий урон и кровотечение; кулак и захват дают контроль тела — свалить, выкрутить, обезоружить.'},
    {k:'Два источника состояний', v:'Приёмы тратят КОСТЬ ТАЙДЗЮЦУ — и рукопашные, и оружейные. Инструменты тратят сами себя: дымовая шашка не стоит кости, но шашки кончаются.'},
    {k:'Кости — не чакра', v:'Отдельный ресурс принципиально: иначе тайдзюцу конкурирует с ниндзюцу за один пул, а сталь должна работать именно тогда, когда чакра кончилась.'},
    {k:'Пул костей', v:'Одна при освоении первого приёма, плюс одна за каждые полные три уровня, предел шесть. Без единого приёма костей нет вовсе. 1–2 ур. — 1; 3–5 — 2; 6–8 — 3; 9–11 — 4; 12–14 — 5; 15+ — 6.'},
    {k:'Восстановление костей', v:'Полное действие в бою (отдышаться, поправить стойку) возвращает одну. Минута покоя вне боя — все. Сон — все.'},
    {k:'Изучение приёмов', v:'Поштучно, как техники: у мастера, физическими тренировками, спаррингами, собственной работой. Академия даёт один-два или ни одного.'},
    {k:'Черта «мастер тайдзюцу»', v:'+2 к пулу костей сверх предела и преимущество при изучении приёмов. Цена: ниндзюцу и гендзюцу такому носителю недоступны или почти недоступны.'},
    {k:'Рост', v:'Идёт через КОНТРОЛЬ ЧАКРЫ, а не через увеличение кости урона. Голый кулак остаётся слабым всегда; чакра-усиленный удар масштабируется.'},
    {k:'Оружие против кулака', v:'Наносят одинаково мало, различаются эффектом. Клинок режет, оставляет кровотечение, бросается, держит проволоку, втыкается меткой. Кулак сбивает, валит, захватывает, выкручивает, обезоруживает.'},
    {k:'Школы оружия', v:'Кендзюцу — отдельная категория и отдельная линия обучения: приёмы чокуто, танто, цепи или веера учатся у носителя этой школы, а не осваиваются попутно. Приём одной школы не переносится на другое оружие сам собой.'}
  ]};

REF.zashita = {t:'Защита и уклонение', icon:'🛡️', lead:'Брони в этом мире почти нет — есть уклонение, реакция и подмена. Поэтому защита не сводится к одному числу: атакующий бросает атаку, защищающийся бросает защиту.',
  rows:[
    {k:'Глухой блок',        v:'Телосложение.'},
    {k:'Уворот',             v:'Ловкость.'},
    {k:'Парирование оружием',v:'Ловкость или Сила, по приёму.'},
    {k:'Защитная техника',   v:'По самой технике, стоит чакры.'},
    {k:'Атака гендзюцу',     v:'Мудрость.'},
    {k:'Бросок защиты',      v:'d20 + модификатор характеристики + бонус мастерства, если владеет подходящим навыком. Равный результат — в пользу атакующего.'},
    {k:'Реакция',            v:'Активная защита тратит реакцию. Реакция израсходована — против последующих атак работает ПАССИВНОЕ УКЛОНЕНИЕ: 10 + модификатор Ловкости + бонус мастерства. Тяжёлое снаряжение, раны, связанность и истощение его снижают.'},
    {k:'Каварими',           v:'2 чакры и реакция. Превращает попадание в смену позиции, требует, чем подменяться, даёт окно НЕЗАМЕЧЕН на ход. Ограничитель здесь реакция, а не цена: подмениться можно раз за раунд, каким бы большим ни был запас. Сенсоры и додзюцу видят подмену.'},
    {k:'Гендзюцу — развеивание', v:'Знание техники развеивания даёт ПРЕИМУЩЕСТВО на спасбросок, но стоит чакры. Продвинутые гендзюцу дают ПОМЕХУ. Особые высшего порядка — помеху И лишают техники развеивания преимущества.'}
  ]};

REF.mir = {t:'Страны и деревни', icon:'🗺️', lead:'Пять великих стран со скрытыми деревнями, между ними — малые страны без собственных шиноби или с малыми деревнями. Деревня — военная организация внутри страны, подчинённая даймё, но живущая своей властью.',
  rows:[
    {k:'Страна Огня — Коноха',   v:'Скрытая в Листе. Умеренный климат, густые леса. Крупнейшая и самая многоклановая. Символ — лист.'},
    {k:'Страна Ветра — Суна',    v:'Скрытая в Песке. Пустыня, скудный бюджет, зависимость от даймё. Марионеточники, ветер, яды.'},
    {k:'Страна Молнии — Кумо',   v:'Скрытая в Облаках. Горы и грозы. Молния, сила, дисциплина, культ мощи.'},
    {k:'Страна Воды — Кири',     v:'Скрытая в Тумане. Острова и туманы. Мечники, водные техники, тяжёлое прошлое с кеккей генкаями.'},
    {k:'Страна Земли — Ива',     v:'Скрытая в Камне. Скалы и рудники. Земля, взрывное, замкнутость.'},
    {k:'Малые деревни',          v:'Скрытые в Звуке, Дожде, Траве, Водопаде, Песке северных пределов и другие. Слабее великих, часто буферные, часто наёмные.'},
    {k:'Даймё',                  v:'Светская власть страны. Оплачивает деревню и формально стоит выше Каге, но не командует ею в поле.'},
    {k:'Летоисчисление',         v:'В этой кампании счёт лет ведётся от Нападения Девятихвостого на Коноху. Формат даты: год от Нападения, месяц, число, день недели.'},
    {k:'Деньги',                 v:'Рё. Порядки величин задаются на старте кампании и держатся всю игру.'}
  ]};

REF.otnosheniya = {t:'Отношения', icon:'🤝', lead:'Отношения — ветвь механики, а не персональный квест. Нет скрытого счётчика симпатии, нет «правильного» партнёра, нет развязки, к которой линия обязана прийти, и нет состояния «недоделано».',
  rows:[
    {k:'Лестница стадий', v:'незнакомец → знакомый → приятель или рабочий контакт → доверие → близость. Скорость индивидуальна; кто-то не поднимается выше рабочего контакта ни с кем.'},
    {k:'Угасание',        v:'Связь, которую не поддерживают, слабеет сама и тихо, без объявления. Близость угасает медленнее приятельства, но угасает тоже.'},
    {k:'Несформированность', v:'Отношения могут годами стоять на месте. Это устойчивое состояние, а не пауза перед развитием.'},
    {k:'Неоднозначность', v:'NPC может сам не понимать, что чувствует; чувствовать одно, а говорить другое; менять мнение о себе задним числом.'},
    {k:'Слова не истина', v:'NPC врёт, недоговаривает, ошибается в себе, говорит из вежливости, страха или расчёта. Сказанное вслух не становится фактом отношений.'},
    {k:'Взаимности может не быть', v:'Вложенные усилия в неё не конвертируются. Отказ может быть окончательным: не всякое «нет» — этап на пути к «да».'},
    {k:'Своя жизнь',      v:'NPC женится, уезжает, меняет работу, гибнет — независимо от того, на каком этапе с ним персонаж.'},
    {k:'Невыбор',         v:'Сознательный отказ связывать себя — законная устойчивая позиция и характер, а не незакрытая задача. Мир отвечает последствиями, но не додавливает.'},
    {k:'Четыре слоя репутации', v:'Профессиональная (как работника), институциональная (со структурами), общественная (как человека), криминальная и правовая. Слои живут отдельно и расходятся между собой.'}
  ]};

/* ---------- кнопки промпта ---------- */
var CMDS = [
  {
    id: 'k1',
    tag: '(к1)',
    ru: 'Населённость сцены',
    icon: '👥',
    featured: true,
    template: '(к1)',
    defaultTemplate: '(к1)',
    hasParam: false,
    short: 'Наполняет сцену конкретными людьми по демографии места (район, время суток, род занятий). Непривычные кланы и редкая кровь появляются строго в рамках вероятности или могут не появиться вовсе — пустой результат нормален.',
    full: '((к1) — НАСЕЛЁННОСТЬ СЦЕНЫ. Наполни сцену конкретными людьми по A2: сначала определи, кто вообще бывает в этом месте — район, заведение, время суток, род занятий, — и только потом распределяй расы по демографии этого места. Непривычные кланы, редкая кровь и неоднозначная внешность появляются ровно настолько, насколько их туда пускает демография, и МОГУТ НЕ ПОЯВИТЬСЯ ВООБЩЕ — пустой результат здесь нормален и не считается невыполнением кнопки. В провинции, замкнутой общине или отраслевом анклаве их чаще всего и не будет. Описывай толпу целиком, а не выборочно необычных: клан, особенность или манера держаться упоминаются с тем же весом, что одежда, возраст, усталость или акцент, и не выносятся в центр описания. Правило A85 применяется только тогда, когда сцена действительно касается ориентации или обращения, а не вместе с каждым вызовом этой кнопки.)'
  },
  {
    id: 'k2',
    tag: '(к2)',
    ru: 'Случайное событие',
    icon: '🎲',
    featured: true,
    template: '(к2)',
    defaultTemplate: '(к2)',
    hasParam: false,
    short: 'Создаёт органичное случайное событие, способное открыть новую сюжетную ветку или привести к новым персонажам и существам. Событие может проявиться не сразу, а плавно разворачиваться в течение нескольких ходов.',
    full: '((к2) — СЛУЧАЙНОЕ СОБЫТИЕ. Создай случайное событие, которое может привести к новой ветке или к новым существам. Событие должно появиться органично и может проявиться не в следующем ходу, а разворачиваться несколько ходов.)'
  },
  {
    id: 'k3',
    tag: '(к3)',
    ru: 'Админ-кнопка',
    icon: '🔧',
    template: '(к3: {param})',
    defaultTemplate: '(к3)',
    hasParam: true,
    paramPh: 'опишите чит или прямое указание для Мастера',
    short: 'Универсальная служебная команда для применения читов или прямых режиссёрских правок. Суть желаемого чита или действия указывается в скобках вместе с кнопкой.',
    full: '((к3) — АДМИН-КНОПКА. Универсальная. Я хочу использовать чит, о котором пишу в скобках вместе с кнопкой.)'
  },
  {
    id: 'k4',
    tag: '(к4)',
    ru: 'Пояснение',
    icon: '❓',
    template: '(к4: {param})',
    defaultTemplate: '(к4)',
    hasParam: true,
    paramPh: 'что именно должен пояснить Мастер',
    short: 'Запрашивает у Мастера разъяснение логики мира, ситуации или игровой механики вне художественного текста. Конкретный вопрос или тема указывается в скобках.',
    full: '((к4) — ПОЯСНЕНИЕ. Поясни мне то, что я напишу в скобках вместе с кнопкой.)'
  },
  {
    id: 'k5',
    tag: '(к5)',
    ru: 'Пошаговый темп',
    icon: '🐢',
    featured: true,
    template: '(к5)',
    defaultTemplate: '(к5)',
    hasParam: true,
    paramPh: 'на чём сфокусироваться (необязательно)',
    short: 'Переключает игру на мелкий шаг: ход Мастера заканчивается на ближайшей точке, где персонаж мог бы действовать или ответить. Запрещены монтажи, авто-решения за героя и резюме сцены (действует до вызова к5-).',
    full: '((к5) — ПОШАГОВЫЙ ТЕМП. Повествование переключается на мелкий шаг: история продолжает двигаться, события развиваются и могут переходить одно в другое — но проходятся они ХОДАМИ ИГРОКА, а не внутри одного твоего хода.\n\nЭто переключение режима, а НЕ оценка предыдущих ходов и не указание на ошибку. Не извиняйся, не комментируй переход и не объясняй его — просто веди сцену дальше.\n\nГЛАВНОЕ ПРАВИЛО: ХОД ЗАКАНЧИВАЕТСЯ НА БЛИЖАЙШЕЙ ТОЧКЕ, ГДЕ ПЕРСОНАЖ МОГ БЫ ДЕЙСТВОВАТЬ ИЛИ ЗАГОВОРИТЬ. Дошёл до двери — ход кончается у двери, а не после разговора за ней. NPC задал вопрос — ход кончается сразу после вопроса, а не после ответа.\n\n• НЕ ЗАКРЫВАЙ ЭПИЗОД САМ. Никаких итоговых формулировок: «в итоге», «в конце концов», «разговор закончился тем, что», «они договорились», «вечер прошёл спокойно». Чем закончился эпизод — определяется игрой, а не твоим резюме.\n• НЕ СЖИМАЙ ПРОМЕЖУТОК, В КОТОРОМ ИГРОК МОГ БЫ ВЫБИРАТЬ. Если между текущим моментом и тем, куда ты собираешься перейти, есть хотя бы одна точка, где персонаж мог бы что-то сказать, сделать или решить, — остановись на ней.\n• НИКАКИХ МОНТАЖЕЙ И ПРОПУСКОВ в этом режиме, даже коротких, даже если ничего важного не планировалось.\n• КНОПКА МЕНЯЕТ ТЕМП ТОЛЬКО ВПЕРЁД. Она НИКОГДА не отматывает время назад: уже сыгранные события остаются сыгранными.\n• НЕ РЕШАЙ ЗА ПЕРСОНАЖА, что он понял, почувствовал, заметил и к чему пришёл.\n• СОБЫТИЯ МОГУТ РАЗВИВАТЬСЯ, осложняться и переходить в другие — просто каждый следующий шаг требует хода игрока.\n• ДЕТАЛИЗАЦИЯ: раз шаг мелкий, показывай его подробно (звуки, запахи, взгляды, руки NPC). Главное — ГДЕ ТЫ ОСТАНАВЛИВАЕШЬСЯ.\n• Ход может быть коротким по времени и почти пустым по итогам. Это правильный результат.\n\nЕсли в скобках вместе с кнопкой указано, на чём сфокусироваться, — веди пошаговый темп именно там.\n\nРежим действует, пока игрок не напишет (к5-) или «обычный темп», либо пока сам не попросит скип. Пока режим включён, он ОБЯЗАН выводиться отдельной строкой в «Активные состояния» System Log.)'
  },
  {
    id: 'k5_off',
    tag: '(к5-)',
    ru: 'Снять пошаговый темп',
    icon: '🐇',
    template: '(к5-)',
    defaultTemplate: '(к5-)',
    hasParam: false,
    short: 'Отключает пошаговый режим и возвращает повествование к обычному темпу игры. Строка пошагового темпа снимается из активных состояний System Log.',
    full: '((к5-) — СНЯТИЕ ПОШАГОВОГО ТЕМПА. Возвращает повествование к обычному темпу игры. Строка режима снимается из «Активных состояний» System Log.)'
  },
  {
    id: 'k6',
    tag: '(к6)',
    ru: 'Монтаж',
    icon: '⏩',
    featured: true,
    template: '(к6: {param})',
    defaultTemplate: '(к6)',
    hasParam: true,
    paramPh: 'рамка времени (до вечера, сутки, три дня, неделя, до экзамена...)',
    short: 'Разово ускоряет время в заданных игроком рамках, выдавая свёртку, одну развёрнутую сцену, монтажный лог и остаток. Любые развилки с важным выбором прерывают монтаж и возвращают ход игроку.',
    full: '((к6) — МОНТАЖ. Разовое действие, а не режим. Зеркало к5: та замедляет темп, эта ускоряет.\n\nРАМКИ ЗАДАЁТ ИГРОК: до вечера, сутки, три дня, неделя, «пока идём до Суны», «до экзамена». Если рамка не названа — спроси.\n\nОТКУДА БЕРЁТСЯ СОДЕРЖАНИЕ:\n— Игрок описал, что делал бы персонаж, — строишь монтаж по этому описанию.\n— Игрок ничего не написал — спроси, чем он хочет заняться, и предложи конкретные варианты.\n— Игрок сказал «придумай сам» — выдумай занятие целиком, исходя из открытых нитей, обязательств и обстановки.\n\nСТРУКТУРА ХОДА:\n1. СВЁРТКА: 5-10 строк сплошным текстом (без списков и диалогов). Последняя строка подводит к развёрнутой сцене.\n2. ОДНА РАЗВЁРНУТАЯ СЦЕНА на всю рамку. Ровно один эпизод играется полностью с прямой речью и деталями. Внутри проставляются точные внутриигровые даты (день недели, месяц, число).\n3. МОНТАЖНЫЙ ЛОГ: только РАЗНИЦА за отрезок (деньги, расходники, состояния, сроки).\n4. ОСТАТОК: 1-3 строки, что отрезок оставил после себя (ПРИВЫЧКА, ЧЕЛОВЕК, МИР, ДОЛГ, СЛУХ, ТРЕЩИНА, ЖЕЛАНИЕ, ШУТКА). Пустой остаток запрещён.\n\nПОДАЧА: Монтаж пишется без швов. Служебными блоками остаются только лог и остаток.\n\nРАЗВИЛКИ: События, требующие ВЫБОРА персонажа, останавливают монтаж. Ты доводишь до момента выбора и останавливаешься. Фоновые события не останавливают монтаж.)'
  },
  {
    id: 'k7',
    tag: '(к7)',
    ru: 'Меню',
    icon: '📋',
    featured: true,
    template: '(к7)',
    defaultTemplate: '(к7)',
    hasParam: false,
    short: 'Полный вывод служебного System Log без художественного текста (инвентарь, деньги, люди, техники, репутация, сроки). Время не движется, а любые последующие уточнения и правки игрока становятся каноном без споров.',
    full: '((к7) — МЕНЮ. Полный System Log без наратива.\n\nТы полностью пропускаешь повествование и выводишь System Log целиком, во всех подробностях: Б1 со всеми деньгами и местами хранения, Б4 по ВСЕМ известным людям, Б5 с поштучным боезапасом и расходниками, Б6, Б7 с обязательствами и сроками, Б8 по репутации, лист персонажа, освоенные техники с рангами, затратами и окнами, приёмы тайдзюцу, весь инвентарь. Ничего не сокращается.\n\nЭТО НЕ ХОД. Время не движется, ничего в мире не происходит, персонаж ничего не делает. Это служебный экран.\n\nПОСЛЕ ВЫВОДА игрок вправе указать на ошибки. Его правки становятся каноном немедленно и без спора (A8). Следующий ход после (к7) продолжает сцену ровно с того места, где она была прервана.)'
  },
  {
    id: 'routine',
    tag: '[Рутина]',
    ru: 'Оператор рутины',
    icon: '☕',
    featured: true,
    template: '[Рутина: {param}]',
    defaultTemplate: '[Рутина: ]',
    hasParam: true,
    paramPh: 'что делаю (сон, отдых, дорога по знакомому маршруту, еда, гигиена...)',
    short: 'Мгновенно выполняет названное бытовое дело без бросков, развилок и описания (время и ресурсы списываются в лог). Действует до конца кампании, исход дела должен быть гарантирован.',
    full: '([Рутина: <что делаю>] — ОПЕРАТОР РУТИНЫ. Действует до конца кампании. Содержимое произвольное, игрок пишет его сам.\n\nЧТО ЭТО ЗНАЧИТ: персонаж выполнил названное бытовое дело целиком и успешно. Ты не разыгрываешь его, не переспрашиваешь и не уточняешь детали. Время, необходимое на это дело, прошло.\n\nПРАВИЛА:\n1. Внутри рутины НИЧЕГО не происходит. Ни событий, ни встреч, ни развилок, ни бросков.\n2. Ты не пересказываешь детально рутину. Максимум пара строк об обстановке и сразу дальше.\n3. Расход припасов, денег и времени идёт в лог как обычно.\n4. Что можно свернуть: гигиена, одежда, еда, сборы, уборка, дорога по знакомому маршруту, обычные покупки по известным ценам, отдых, сон.\n5. Что НЕЛЬЗЯ свернуть: всё, что требует проверки, диалога, обучения или существенных трат.\n6. ЕДИНСТВЕННОЕ ИСКЛЮЧЕНИЕ: если дело физически невозможно — говоришь об этом ОДНОЙ строкой и возвращаешь ход.\n7. При любых сомнениях — дело попадает под рутину.)'
  },
  {
    id: 'k8',
    tag: '(к8)',
    ru: 'Сверка с правилами',
    icon: '⚖️',
    featured: true,
    template: '(к8{param})',
    defaultTemplate: '(к8)',
    hasParam: true,
    paramPh: ': тема (узкий режим: бой, темп, чакра, отношения, формат...)',
    short: 'Принудительно возвращает ИИ-Мастера к своду правил, если он начинает вести по инерции. Ответ состоит строго из трёх частей: Якорь правил (до 60 строк), Самопроверка нарушений и Что исправляю.',
    full: '((к8) — СВЕРКА С ПРАВИЛАМИ. Перечитай свод и проверь по нему себя.\n\nЗАЧЕМ ЭТА КНОПКА: Принудительное возвращение к источнику, когда игра ушла в инерцию прошлых ходов. Нажимается, когда чувствуешь, что Мастера понесло.\n\nЭТО НЕ ХОД. Время не движется, наратива нет вообще, System Log не выводится.\n\nОТВЕТ СОСТОИТ ИЗ ТРЁХ ЧАСТЕЙ И НИЧЕГО БОЛЬШЕ:\nЧАСТЬ 1 — ЯКОРЬ: Сжатый свод, по одной строке на правило, только суть (потолок 60 строк). Порядок: рамка хода, темп, канон, бой, чакра, отношения, формат вывода.\nЧАСТЬ 2 — САМОПРОВЕРКА: Пройди по СВОИМ последним 10 ходам и назови, где отступил от свода. Пиши конкретно и против себя. Не извиняйся.\nЧАСТЬ 3 — ЧТО ИСПРАВЛЯЮ: По строке на каждый пункт части 2: как именно будешь вести со следующего хода.\n\nОбщий потолок ответа — около 100 строк.\n\nУЗКИЙ РЕЖИМ: `(к8: <что именно>)` — сверка идёт ТОЛЬКО по названной теме (якорь до 15 строк, проверка по 20 ходам).\n\nПравки игрока на результат сверки становятся каноном немедленно и без спора (A8).)'
  }
];

function cmdById(id){
  if(!id) return CMDS[0];
  return CMDS.filter(function(c){ return c.id === id; })[0] || CMDS[0];
}

/* ---------- бейджи и печати (ранги, стихии, уровни) ---------- */
function rankSeal(r){
  var rk = String(r||'D').trim().toUpperCase();
  return '<span class="sh-rank-seal rank-'+escA(rk)+'">'+esc(rk)+'</span>';
}

function natureBadge(n){
  if(!n) return '';
  var s = String(n).toLowerCase();
  var cls = '', kanji = '', label = n;
  if(s.indexOf('огонь')>=0 || s.indexOf('катон')>=0 || s.indexOf('fire')>=0){
    cls = 'elem-fire'; kanji = '火';
  } else if(s.indexOf('ветер')>=0 || s.indexOf('фуутон')>=0 || s.indexOf('футон')>=0 || s.indexOf('wind')>=0){
    cls = 'elem-wind'; kanji = '風';
  } else if(s.indexOf('молни')>=0 || s.indexOf('райтон')>=0 || s.indexOf('lightning')>=0){
    cls = 'elem-lightning'; kanji = '雷';
  } else if(s.indexOf('земл')>=0 || s.indexOf('дотон')>=0 || s.indexOf('earth')>=0){
    cls = 'elem-earth'; kanji = '土';
  } else if(s.indexOf('вод')>=0 || s.indexOf('суйтон')>=0 || s.indexOf('water')>=0){
    cls = 'elem-water'; kanji = '水';
  } else if(s.indexOf('инь')>=0 || s.indexOf('yin')>=0){
    cls = 'elem-yin'; kanji = '陰';
  } else if(s.indexOf('ян')>=0 || s.indexOf('yang')>=0){
    cls = 'elem-yang'; kanji = '陽';
  } else {
    cls = 'elem-hiden'; kanji = '秘';
  }
  return '<span class="sh-elem-badge '+cls+'"><span class="kanji">'+kanji+'</span> '+esc(label)+'</span>';
}

/* ---------- вспомогательное ---------- */
function techById(id){ for(var i=0;i<SH.techs.length;i++) if(SH.techs[i].id===id) return SH.techs[i]; return null; }
function moveById(id){ for(var i=0;i<SH.moves.length;i++) if(SH.moves[i].id===id) return SH.moves[i]; return null; }
function skillById(id){ var a=SH.skills||[]; for(var i=0;i<a.length;i++) if(a[i].id===id) return a[i]; return null; }
var SKILL_KINDS=['Ремесло','Быт','Знание','Искусство','Выживание','Общение','Другое'];
var SKILL_LEVELS=['Начатки','Ученик','Подмастерье','Умелец','Мастер'];
function newSkill(){ return {id:null,name:'',kind:'Ремесло',level:'Начатки',abil:'',mod:'',src:'',gives:'',desc:''}; }
var DICE_N = ['1','2','3','4','5','6','7','8','9','10','12'];
var DICE_D = ['d4','d6','d8','d10','d12','d20'];
function dmgText(t){
  if(!t || t.effect!=='uron') return '';
  var n=t.dmgN||'', d=(t.dmgD||'').toString().trim(), m=(t.dmgMod||'').trim();
  if(!n||!d) return '';
  if(!d.startsWith('d')) d = 'd' + d;
  if(m && m.charAt(0)!=='+' && m.charAt(0)!=='-') m='+'+m;
  return n+d+m;
}
var TECH_CATS = ['Додзюцу', 'Ниндзюцу', 'Тайдзюцу', 'Гендзюцу', 'Фуиндзюцу', 'Кендзюцу', 'Ирьениндзюцу', 'Кучиёсэ', 'Сендзюцу'];
var TECH_CAT_ICONS = {
  'Додзюцу': '👁️',
  'Додзютцу': '👁️',
  'Ниндзюцу': '🌀',
  'Тайдзюцу': '👊',
  'Гендзюцу': '🎭',
  'Фуиндзюцу': '📜',
  'Кендзюцу': '⚔️',
  'Ирьениндзюцу': '💚',
  'Кучиёсэ': '🐸',
  'Сендзюцу': '⛰️'
};

function isDojutsu(cat){
  if(!cat) return false;
  var c = String(cat).toLowerCase().trim();
  return c === 'додзюцу' || c === 'додзютцу' || c === 'dojutsu' || c.indexOf('додзюцу') !== -1 || c.indexOf('додзютцу') !== -1;
}

function newTech(){ return {id:null,name:'',rank:'D',cat:'Ниндзюцу',origin:'Общая',nature:'',effect:'uron',cost:'',upkeep:'',windows:[],counter:'',req:'',desc:'',dmgN:'1',dmgD:'d6',dmgMod:'',isExp:false}; }

function formatLauncherMod(m){
  var n = parseInt(m, 10) || 0;
  if(!n) return '';
  return n > 0 ? '+ ' + n : '− ' + Math.abs(n);
}

function buildComboText(t, isExp, rolledValues, mods){
  var costStr = t.cost ? (t.cost + (t.cost.toLowerCase().indexOf('чакр')>=0 ? '' : ' чакры')) : 'без затрат';
  if(t.upkeep) costStr += ' +' + t.upkeep + '/рнд';
  var header = '*[Техника: '+(t.name||'Без названия')+' | Ранг: '+(t.rank||'D')+' | Затраты: '+costStr+']*';
  var lines = [header];

  // 1. Контроль чакры идёт первым!
  if(isExp && rolledValues && rolledValues.exp){
    var eMod = parseInt(mods.exp, 10) || 0;
    var eModStr = eMod > 0 ? ' + '+eMod : (eMod < 0 ? ' − '+Math.abs(eMod) : '');
    lines.push('*[Результат броска Контроль чакры 1d20: '+rolledValues.exp+' ]*'+eModStr);
  }

  // 2. Попадание
  if(rolledValues && rolledValues.atk){
    var aMod = parseInt(mods.atk, 10) || 0;
    var aModStr = aMod > 0 ? ' + '+aMod : (aMod < 0 ? ' − '+Math.abs(aMod) : '');
    lines.push('*[Результат броска Попадание 1d20: '+rolledValues.atk+' ]*'+aModStr);
  }

  // 3. Урон
  if(t.effect === 'uron' && rolledValues && rolledValues.dmgRolls && rolledValues.dmgRolls.length){
    var n = rolledValues.dmgRolls.length;
    var dSides = rolledValues.dmgSides || 6;
    var dMod = parseInt(mods.dmg, 10) || 0;
    var dModStr = dMod > 0 ? ' + '+dMod : (dMod < 0 ? ' − '+Math.abs(dMod) : '');
    lines.push('*[Результат броска Урон '+n+'d'+dSides+': '+rolledValues.dmgRolls.join(' | ')+' ]*'+dModStr);
  }

  return lines.join('\n');
}

function renderLauncherDiceHtml(tech, isExp, selTarget, mods, rolledValues){
  if(!tech) return '<div class="sh-scr-no-dmg">Выберите технику для расчёта</div>';
  mods = mods || { exp: 0, atk: 0, dmg: 0 };
  rolledValues = rolledValues || {};

  // 1. Контроль чакры (если экспериментальная) - ИДЁТ ПЕРВЫМ!
  var expDieHtml = '';
  if(isExp){
    var eModStr = formatLauncherMod(mods.exp);
    expDieHtml = 
      '<div class="sh-scr-col '+(selTarget==='exp'?'selected':'')+'" data-select-roll="exp" title="Кликните для выбора кубика и настройки модификатора">'+
        '<div class="sh-scr-label" style="color:#ff9085;">Контроль</div>'+
        '<div class="sh-scr-die die s20" id="shScrDieExp">'+
          (typeof dieShapeSvg==='function' ? dieShapeSvg(20, 'screxp', null) : '')+
          '<div class="val">'+(rolledValues.exp || 20)+'</div>'+
        '</div>'+
        '<div class="sh-scr-sub" id="shScrSub_exp">1d20'+(eModStr ? ' ' + eModStr : '')+'</div>'+
      '</div>';
  }

  // 2. Попадание
  var aModStr = formatLauncherMod(mods.atk);
  var atkDieHtml = 
    '<div class="sh-scr-col '+(selTarget==='atk'?'selected':'')+'" data-select-roll="atk" title="Кликните для выбора кубика и настройки модификатора">'+
      '<div class="sh-scr-label">Попадание</div>'+
      '<div class="sh-scr-die die s20" id="shScrDieAtk">'+
        (typeof dieShapeSvg==='function' ? dieShapeSvg(20, 'scratk', null) : '')+
        '<div class="val">'+(rolledValues.atk || 20)+'</div>'+
      '</div>'+
      '<div class="sh-scr-sub" id="shScrSub_atk">1d20'+(aModStr ? ' ' + aModStr : '')+'</div>'+
    '</div>';

  // 3. Урон
  var dmgBlockHtml = '';
  if(tech.effect === 'uron'){
    var dModStr = formatLauncherMod(mods.dmg);
    var n = Math.max(1, Math.min(12, parseInt(tech.dmgN, 10) || 1));
    var dStr = (tech.dmgD || 'd6').replace('d','');
    var dSides = parseInt(dStr, 10) || 6;
    var dmgDiceList = [];
    var rolls = rolledValues.dmgRolls || [];
    for(var i=0; i<n; i++){
      var curVal = rolls[i] || dSides;
      dmgDiceList.push(
        '<div class="sh-scr-die die s'+dSides+'" id="shScrDieDmg_'+i+'">'+
          (typeof dieShapeSvg==='function' ? dieShapeSvg(dSides, 'scrdmg'+i, null) : '')+
          '<div class="val">'+curVal+'</div>'+
        '</div>'
      );
    }
    dmgBlockHtml = 
      '<div class="sh-scr-dmg-group '+(selTarget==='dmg'?'selected':'')+'" data-select-roll="dmg" title="Кликните для выбора кубика и настройки модификатора">'+
        '<div class="sh-scr-label">Урон ('+n+'d'+dSides+')</div>'+
        '<div class="sh-scr-dmg-dice">'+dmgDiceList.join('')+'</div>'+
        '<div class="sh-scr-sub" id="shScrSub_dmg">'+n+'d'+dSides+(dModStr ? ' ' + dModStr : '')+'</div>'+
      '</div>';
  } else {
    var efObj = EFFECTS.filter(function(e){return e.k===tech.effect;})[0];
    var efName = efObj ? efObj.ru : tech.effect;
    dmgBlockHtml = '<div class="sh-scr-no-dmg">Эффект: <b>'+esc(efName)+'</b> (без броска урона)</div>';
  }

  return '<div class="sh-screen-dice-tray">'+expDieHtml + atkDieHtml + dmgBlockHtml + '</div>';
}

function renderTechLauncher(){
  if(!SH.techs || !SH.techs.length){
    return '<div class="sh-launcher">'+
      '<div class="sh-launcher-title">⚔️ Боевой расчёт техники <span class="sh-badge-tag">AI Studio</span></div>'+
      '<div class="char-empty" style="margin:10px 0 0;padding:12px;">Техники ещё не добавлены. Добавьте первую технику кнопкой ниже, чтобы использовать боевой расчёт.</div>'+
    '</div>';
  }

  if(!SH.launcher) SH.launcher = {};
  if(SH.launcher.isOpen === undefined) SH.launcher.isOpen = false;
  var isOpen = !!SH.launcher.isOpen;
  if(!SH.launcher.mods) SH.launcher.mods = { exp: 0, atk: 0, dmg: 0 };
  if(!SH.launcher.selectedTarget) SH.launcher.selectedTarget = 'atk';

  var selTech = techById(SH.launcher.techId) || SH.techs[0];
  if(!SH.launcher.techId && selTech){
    SH.launcher.techId = selTech.id;
    if(selTech.dmgMod) SH.launcher.mods.dmg = parseInt(selTech.dmgMod, 10) || 0;
  }
  var isExp = (SH.launcher.isExp !== undefined) ? SH.launcher.isExp : !!selTech.isExp;
  SH.launcher.isExp = isExp;

  var selTarget = SH.launcher.selectedTarget;
  if(selTarget === 'exp' && !isExp) selTarget = 'atk';

  var targetNames = { exp: '🌀 Контроль чакры', atk: '🎯 Попадание', dmg: '💥 Урон' };
  var targetTitle = targetNames[selTarget] || '🎯 Попадание';
  var curModVal = SH.launcher.mods[selTarget] || 0;

  var techOpts = SH.techs.map(function(t){
    var cStr = t.cost ? t.cost+'ч' : '0ч';
    var nStr = t.nature ? ' ['+t.nature+']' : '';
    var expStr = t.isExp ? ' [🧪]' : '';
    return '<option value="'+t.id+'" '+(t.id===selTech.id?'selected':'')+'>'+
      esc(t.rank)+' · '+esc(t.name||'Без названия')+' ('+cStr+')'+nStr+expStr+
    '</option>';
  }).join('');

  var screenHtml = renderLauncherDiceHtml(selTech, isExp, selTarget, SH.launcher.mods, SH.launcher.rolledValues);

  var modBarHtml = 
    '<div class="sh-mod-bar">'+
      '<div class="sh-mod-target-info">'+
        '<span>Выбран кубик:</span>'+
        '<span class="sh-mod-target-tag" id="shModTargetName">'+targetTitle+'</span>'+
      '</div>'+
      '<div class="sh-mod-controls">'+
        '<button class="sh-mod-step" data-mod-delta="-5" title="Уменьшить на 5">−5</button>'+
        '<button class="sh-mod-step" data-mod-delta="-1" title="Уменьшить на 1">−</button>'+
        '<input type="number" id="shActiveModInput" class="sh-active-mod-input" value="'+curModVal+'">'+
        '<button class="sh-mod-step" data-mod-delta="1" title="Увеличить на 1">+</button>'+
        '<button class="sh-mod-step" data-mod-delta="5" title="Увеличить на 5">+5</button>'+
        '<button class="sh-mod-reset" id="shModResetBtn" title="Сбросить модификатор в 0">Сброс</button>'+
      '</div>'+
      '<label class="sh-exp-check">'+
        '<input type="checkbox" id="shLauncherExp"'+(isExp?' checked':'')+'> 🧪 Экспериментальная'+
      '</label>'+
    '</div>';

  var actionsHtml = 
    '<div class="sh-launcher-actions">'+
      '<button class="sh-btn-launch" id="shLaunchComboBtn" title="Бросить все кости техники и зафиксировать результат">⚔️ Применить технику</button>'+
      '<button class="sh-btn-copy-all" id="shCopyAllBtn" title="Скопировать готовый блок в буфер обмена для AI Studio">📋 Скопировать всё</button>'+
      '<button class="sh-micro-btn" id="shLaunchAtkBtn" title="Бросить и скопировать только попадание">🎯 Попадание</button>'+
      (selTech.effect === 'uron' ? '<button class="sh-micro-btn" id="shLaunchDmgBtn" title="Бросить и скопировать только урон">💥 Урон</button>' : '')+
      '<button class="sh-micro-btn" id="shLaunchExpBtn" title="Бросить и скопировать Контроль чакры">🌀 Контроль</button>'+
      '<button class="sh-micro-btn" id="shLaunchClaimBtn" title="Скопировать только заголовок заявки">📜 Только заявка</button>'+
    '</div>';

  var hasRes = !!(SH.launcher.lastResult);
  var resultBoxHtml = 
    '<div class="sh-launcher-result '+(hasRes?'has-result':'')+'" id="shLauncherResultBox">'+
      '<div class="sh-launcher-result-text" id="shLauncherResultText">'+esc(SH.launcher.lastResult||'')+'</div>'+
      '<div class="sh-copy-badge" id="shLauncherCopyBadge" style="display:'+(hasRes?'inline-flex':'none')+';">'+
        '<span>'+(SH.launcher.lastResultCopied ? '✓ Скопировано в буфер обмена для AI Studio' : '🎲 Бросок зафиксирован. Нажмите «📋 Скопировать всё»')+'</span>'+
      '</div>'+
    '</div>';

  var toggleHeadHtml = 
    '<div class="sh-launcher-toggle-head" id="shLauncherToggle" role="button" tabindex="0" title="Нажмите, чтобы развернуть или свернуть боевой расчёт техники">'+
      '<div class="sh-launcher-title">'+
        '<span>⚔️ Боевой расчёт техники</span>'+
        '<span class="sh-badge-tag">AI Studio</span>'+
      '</div>'+
      '<div class="sh-launcher-toggle-btn">'+
        '<span class="sh-launcher-toggle-text">'+(isOpen ? 'Свернуть' : 'Развернуть')+'</span>'+
        '<span class="sh-launcher-toggle-arrow">'+(isOpen ? '▲' : '▼')+'</span>'+
      '</div>'+
    '</div>';

  var bodyHtml = 
    '<div class="sh-launcher-body" id="shLauncherBody">'+
      '<div class="sh-launcher-head">'+
        '<div class="sh-launcher-sel-wrap">'+
          '<div class="sh-launcher-sel-label">Техника для броска:</div>'+
          '<select class="sh-launcher-sel" id="shLauncherSelect">'+techOpts+'</select>'+
        '</div>'+
      '</div>'+
      '<div class="sh-launcher-screen" id="shLauncherScreen">'+screenHtml+'</div>'+
      modBarHtml+
      actionsHtml+
      resultBoxHtml+
    '</div>';

  return '<div class="sh-launcher '+(isOpen ? '' : 'collapsed')+'" id="shLauncherContainer">'+
    toggleHeadHtml+
    bodyHtml+
  '</div>';
}
SH.formatLauncherMod = formatLauncherMod;
SH.buildComboText = buildComboText;
SH.renderLauncherDiceHtml = renderLauncherDiceHtml;
SH.renderTechLauncher = renderTechLauncher;
SH.shHome = shHome;
SH.shRef = shRef;
SH.shRefView = shRefView;
SH.REF = REF;
SH.shCmds = shCmds;
SH.CMDS = CMDS;
SH.cmdById = cmdById;
SH.renderCmdInspectorHtml = renderCmdInspectorHtml;

function parseMoveDmg(str){
  if(!str || typeof str !== 'string') return null;
  var s = str.trim().replace(/\s+/g, '');
  if(!s) return null;
  var m = s.match(/(\d*)d(\d+)([+-]\d+)?/i);
  if(m){
    var n = Math.max(1, Math.min(12, parseInt(m[1], 10) || 1));
    var sides = parseInt(m[2], 10) || 6;
    var mod = m[3] ? parseInt(m[3], 10) : 0;
    return { n: n, sides: sides, mod: mod };
  }
  return null;
}

function buildMoveComboText(m, rolledValues, mods){
  var wpStr = m.weapon ? (' (' + m.weapon + ')') : '';
  var payStr = m.pay ? (' | Оплата: ' + m.pay) : '';
  var header = '*[Приём: ' + (m.name || 'Без названия') + ' | Вид: ' + (m.kind || 'Рукопашный') + wpStr + ' | Тип: ' + (m.mtype || 'Урон') + payStr + ']*';
  var lines = [header];

  // 1. Бросок приёма / атака
  if(rolledValues && rolledValues.atk){
    var aMod = parseInt(mods.atk, 10) || 0;
    var aModStr = aMod > 0 ? ' + ' + aMod : (aMod < 0 ? ' − ' + Math.abs(aMod) : '');
    var abilStr = m.atk ? (' (' + m.atk + ')') : '';
    lines.push('*[Результат броска Приём' + abilStr + ' 1d20: ' + rolledValues.atk + ' ]*' + aModStr);
  }

  // 2. Урон
  var pDmg = parseMoveDmg(m.dmg);
  if(pDmg && rolledValues && rolledValues.dmgRolls && rolledValues.dmgRolls.length){
    var n = rolledValues.dmgRolls.length;
    var dSides = rolledValues.dmgSides || pDmg.sides;
    var dMod = (parseInt(mods.dmg, 10) || 0) + (pDmg.mod || 0);
    var dModStr = dMod > 0 ? ' + ' + dMod : (dMod < 0 ? ' − ' + Math.abs(dMod) : '');
    lines.push('*[Результат броска Урон ' + n + 'd' + dSides + ': ' + rolledValues.dmgRolls.join(' | ') + ' ]*' + dModStr);
  }

  // 3. Эффект / Состояние / Манёвр / Реакция
  if(m.mtype === 'Состояние' || (m.state && m.state !== 'не навязывает' && m.state !== 'другое')){
    var defStr = m.def ? (' | Спасбросок цели: ' + m.def) : '';
    lines.push('*[Эффект: Навязывает состояние ' + (m.state || 'СБИТ') + ' (' + (m.dur || 'один ход') + ')' + defStr + ']*');
  } else if(m.mtype === 'Манёвр'){
    var reachStr = m.reach ? (' (' + m.reach + ')') : '';
    lines.push('*[Эффект: Манёвр перемещения' + reachStr + ']*');
  } else if(m.mtype === 'Реакция'){
    var trigStr = m.trigger ? ('Триггер: ' + m.trigger) : 'Реакция в чужой ход';
    lines.push('*[Условие: ' + trigStr + ']*');
  } else if(m.mtype === 'Защита'){
    var trigStr = m.trigger ? ('Срабатывает на: ' + m.trigger) : 'Защитное действие';
    lines.push('*[Защита: ' + trigStr + ']*');
  }

  return lines.join('\n');
}

function renderMoveLauncherDiceHtml(move, selTarget, mods, rolledValues){
  if(!move) return '<div class="sh-scr-no-dmg">Выберите приём для расчёта</div>';
  mods = mods || { atk: 0, dmg: 0 };
  rolledValues = rolledValues || {};

  // 1. Атака / Бросок приёма
  var aModStr = formatLauncherMod(mods.atk);
  var atkLabel = move.atk ? ('Бросок (' + esc(move.atk) + ')') : 'Бросок приёма';
  var atkDieHtml = 
    '<div class="sh-scr-col ' + (selTarget === 'atk' ? 'selected' : '') + '" data-select-move-roll="atk" title="Кликните для выбора кубика и настройки модификатора">' +
      '<div class="sh-scr-label">' + atkLabel + '</div>' +
      '<div class="sh-scr-die die s20" id="shScrDieMoveAtk">' +
        (typeof dieShapeSvg === 'function' ? dieShapeSvg(20, 'scrmvatk', null) : '') +
        '<div class="val">' + (rolledValues.atk || 20) + '</div>' +
      '</div>' +
      '<div class="sh-scr-sub" id="shScrSub_moveAtk">1d20' + (aModStr ? ' ' + aModStr : '') + '</div>' +
    '</div>';

  // 2. Урон или Эффект
  var pDmg = parseMoveDmg(move.dmg);
  var dmgBlockHtml = '';
  if(pDmg){
    var n = pDmg.n;
    var dSides = pDmg.sides;
    var totalDmgMod = (parseInt(mods.dmg, 10) || 0) + (pDmg.mod || 0);
    var dModStr = formatLauncherMod(totalDmgMod);
    var dmgDiceList = [];
    var rolls = rolledValues.dmgRolls || [];
    for(var i = 0; i < n; i++){
      var curVal = rolls[i] || dSides;
      dmgDiceList.push(
        '<div class="sh-scr-die die s' + dSides + '" id="shScrDieMoveDmg_' + i + '">' +
          (typeof dieShapeSvg === 'function' ? dieShapeSvg(dSides, 'scrmvdmg' + i, null) : '') +
          '<div class="val">' + curVal + '</div>' +
        '</div>'
      );
    }
    var baseDmgFormula = n + 'd' + dSides + (pDmg.mod ? (pDmg.mod > 0 ? '+' + pDmg.mod : pDmg.mod) : '');
    dmgBlockHtml = 
      '<div class="sh-scr-dmg-group ' + (selTarget === 'dmg' ? 'selected' : '') + '" data-select-move-roll="dmg" title="Кликните для выбора кубика и настройки модификатора">' +
        '<div class="sh-scr-label">Урон (' + baseDmgFormula + ')</div>' +
        '<div class="sh-scr-dmg-dice">' + dmgDiceList.join('') + '</div>' +
        '<div class="sh-scr-sub" id="shScrSub_moveDmg">' + n + 'd' + dSides + (dModStr ? ' ' + dModStr : '') + '</div>' +
      '</div>';
  } else {
    var stateInfo = '';
    if(move.mtype === 'Состояние' || (move.state && move.state !== 'не навязывает')){
      stateInfo = 'Навязывает: <b>' + esc(move.state || 'СБИТ') + '</b> (' + esc(move.dur || 'один ход') + ')' +
        (move.def ? ' · спасбросок: <b>' + esc(move.def) + '</b>' : '');
    } else if(move.mtype === 'Манёвр'){
      stateInfo = 'Манёвр: <b>' + esc(move.reach || 'перемещение/дистанция') + '</b>';
    } else if(move.mtype === 'Реакция' || move.mtype === 'Защита'){
      stateInfo = (move.mtype === 'Защита' ? 'Защита: ' : 'Реакция: ') + '<b>' + esc(move.trigger || 'в чужой ход') + '</b>';
    } else {
      stateInfo = 'Приём типа <b>' + esc(move.mtype || 'Особый') + '</b> (без броска урона)';
    }
    dmgBlockHtml = '<div class="sh-scr-no-dmg">' + stateInfo + '</div>';
  }

  return '<div class="sh-screen-dice-tray">' + atkDieHtml + dmgBlockHtml + '</div>';
}

function renderMoveLauncher(){
  if(!SH.moveLauncher) SH.moveLauncher = {};
  if(SH.moveLauncher.isOpen === undefined) SH.moveLauncher.isOpen = false;
  if(!SH.moveLauncher.rolledValues) SH.moveLauncher.rolledValues = {};
  if(!SH.moveLauncher.mods) SH.moveLauncher.mods = { atk: 0, dmg: 0 };
  if(!SH.moveLauncher.selectedTarget) SH.moveLauncher.selectedTarget = 'atk';

  if(!SH.moves || !SH.moves.length){
    return '<div class="sh-launcher">' +
      '<div class="sh-launcher-title">🥋 Боевой расчёт приёма <span class="sh-badge-tag">AI Studio</span></div>' +
      '<div class="char-empty" style="margin:10px 0 0;padding:12px;">Приёмы ещё не добавлены. Добавьте первый приём кнопкой ниже, чтобы использовать боевой расчёт.</div>' +
    '</div>';
  }

  var isOpen = !!SH.moveLauncher.isOpen;

  var selMove = moveById(SH.moveLauncher.moveId) || SH.moves[0];
  if(!SH.moveLauncher.moveId && selMove){
    SH.moveLauncher.moveId = selMove.id;
  }
  var pDmg = parseMoveDmg(selMove ? selMove.dmg : '');
  var selTarget = SH.moveLauncher.selectedTarget;
  if(selTarget === 'dmg' && !pDmg) selTarget = 'atk';
  SH.moveLauncher.selectedTarget = selTarget;

  var targetNames = { atk: '🎯 Бросок приёма', dmg: '💥 Урон' };
  var targetTitle = targetNames[selTarget] || '🎯 Бросок приёма';
  var curModVal = SH.moveLauncher.mods[selTarget] || 0;

  var moveOpts = SH.moves.map(function(m){
    var wpStr = m.weapon ? ' [' + m.weapon + ']' : '';
    var stStr = (m.mtype === 'Состояние' && m.state && m.state !== 'не навязывает') ? ' → ' + m.state : '';
    var dmgStr = m.dmg ? ' (' + m.dmg + ')' : '';
    return '<option value="' + m.id + '" ' + (m.id === selMove.id ? 'selected' : '') + '>' +
      esc(m.kind || 'Рукопашный') + wpStr + ' · ' + esc(m.name || 'Без названия') + dmgStr + stStr +
    '</option>';
  }).join('');

  var screenHtml = renderMoveLauncherDiceHtml(selMove, selTarget, SH.moveLauncher.mods, SH.moveLauncher.rolledValues);

  var modBarHtml = 
    '<div class="sh-mod-bar">' +
      '<div class="sh-mod-target-info">' +
        '<span>Выбран кубик:</span>' +
        '<span class="sh-mod-target-tag" id="shMoveModTargetName">' + targetTitle + '</span>' +
      '</div>' +
      '<div class="sh-mod-controls">' +
        '<button class="sh-mod-step" data-move-mod-delta="-5" title="Уменьшить на 5">−5</button>' +
        '<button class="sh-mod-step" data-move-mod-delta="-1" title="Уменьшить на 1">−</button>' +
        '<input type="number" id="shMoveActiveModInput" class="sh-active-mod-input" value="' + curModVal + '">' +
        '<button class="sh-mod-step" data-move-mod-delta="1" title="Увеличить на 1">+</button>' +
        '<button class="sh-mod-step" data-move-mod-delta="5" title="Увеличить на 5">+5</button>' +
        '<button class="sh-mod-reset" id="shMoveModResetBtn" title="Сбросить модификатор в 0">Сброс</button>' +
      '</div>' +
    '</div>';

  var actionsHtml = 
    '<div class="sh-launcher-actions">' +
      '<button class="sh-btn-launch" id="shLaunchMoveComboBtn" title="Бросить все кости приёма и зафиксировать результат">⚔️ Применить приём</button>' +
      '<button class="sh-btn-copy-all" id="shCopyAllMoveBtn" title="Скопировать готовый блок в буфер обмена для AI Studio">📋 Скопировать всё</button>' +
      '<button class="sh-micro-btn" id="shLaunchMoveAtkBtn" title="Бросить и скопировать только бросок атаки/проверки">🎯 Бросок</button>' +
      (pDmg ? '<button class="sh-micro-btn" id="shLaunchMoveDmgBtn" title="Бросить и скопировать только урон">💥 Урон</button>' : '') +
      '<button class="sh-micro-btn" id="shLaunchMoveClaimBtn" title="Скопировать только заголовок заявки">📜 Только заявка</button>' +
    '</div>';

  var hasRes = !!(SH.moveLauncher.lastResult);
  var resultBoxHtml = 
    '<div class="sh-launcher-result ' + (hasRes ? 'has-result' : '') + '" id="shMoveLauncherResultBox">' +
      '<div class="sh-launcher-result-text" id="shMoveLauncherResultText">' + esc(SH.moveLauncher.lastResult || '') + '</div>' +
      '<div class="sh-copy-badge" id="shMoveLauncherCopyBadge" style="display:' + (hasRes ? 'inline-flex' : 'none') + ';">' +
        '<span>' + (SH.moveLauncher.lastResultCopied ? '✓ Скопировано в буфер обмена для AI Studio' : '🎲 Бросок зафиксирован. Нажмите «📋 Скопировать всё»') + '</span>' +
      '</div>' +
    '</div>';

  var toggleHeadHtml = 
    '<div class="sh-launcher-toggle-head" id="shMoveLauncherToggle" role="button" tabindex="0" title="Нажмите, чтобы развернуть или свернуть боевой расчёт приёма">' +
      '<div class="sh-launcher-title">' +
        '<span>🥋 Боевой расчёт приёма</span>' +
        '<span class="sh-badge-tag">AI Studio</span>' +
      '</div>' +
      '<div class="sh-launcher-toggle-btn">' +
        '<span class="sh-launcher-toggle-text">' + (isOpen ? 'Свернуть' : 'Развернуть') + '</span>' +
        '<span class="sh-launcher-toggle-arrow">' + (isOpen ? '▲' : '▼') + '</span>' +
      '</div>' +
    '</div>';

  var bodyHtml = 
    '<div class="sh-launcher-body" id="shMoveLauncherBody">' +
      '<div class="sh-launcher-head">' +
        '<div class="sh-launcher-sel-wrap">' +
          '<div class="sh-launcher-sel-label">Приём для броска:</div>' +
          '<select class="sh-launcher-sel" id="shMoveLauncherSelect">' + moveOpts + '</select>' +
        '</div>' +
      '</div>' +
      '<div class="sh-launcher-screen" id="shMoveLauncherScreen">' + screenHtml + '</div>' +
      modBarHtml +
      actionsHtml +
      resultBoxHtml +
    '</div>';

  return '<div class="sh-launcher ' + (isOpen ? '' : 'collapsed') + '" id="shMoveLauncherContainer">' +
    toggleHeadHtml +
    bodyHtml +
  '</div>';
}

SH.parseMoveDmg = parseMoveDmg;
SH.buildMoveComboText = buildMoveComboText;
SH.renderMoveLauncherDiceHtml = renderMoveLauncherDiceHtml;
SH.renderMoveLauncher = renderMoveLauncher;

var MOVE_KINDS = ['Рукопашный','Оружейный','Смешанный','Передвижение'];
var MOVE_TYPES = ['Урон','Состояние','Реакция','Манёвр','Защита'];
var ABILS = ['Сила','Ловкость','Телосложение','Интеллект','Мудрость','Харизма'];
var DURS  = ['мгновенно','один ход','до конца следующего хода цели','пока держу','до конца боя','пока не снимут','пока не остановят'];
var MOVE_STATES = ['СБИТ','ОБЕЗДВИЖЕН','ОСЛЕПЛЁН','ДИСТАНЦИЯ','НЕЗАМЕЧЕН','СВЯЗАН','КРОВОТЕЧЕНИЕ','обезоруживание','другое'];
/* какие поля показывать для каждого вида приёма */
var MOVE_FIELDS = {
  'Урон':      ['atk','dmg'],
  'Состояние': ['atk','def','state','dur'],
  'Реакция':   ['trigger','atk','dmg'],
  'Манёвр':    ['atk','reach'],
  'Защита':    ['trigger','atk']
};
function newMove(){ return {id:null,name:'',kind:'Рукопашный',weapon:'',mtype:'Состояние',state:'СБИТ',atk:'',dmg:'',def:'',dur:'один ход',trigger:'',reach:'',pay:'кость',req:'',desc:''}; }
function crumbSh(parts){
  return '<div class="crumb">'+parts.map(function(p,i){
    var last=i===parts.length-1;
    return (i>0?'<span class="sep">/</span>':'')+'<span class="seg '+(last?'current':'')+'" data-nav="'+escA(p.nav||'')+'">'+esc(p.label)+'</span>';
  }).join('')+'</div>';
}

/* ---------- Shinobi HUD & Arsenal Summary ---------- */
function renderShinobiHudHtml(){
  var m = SH.meta || {};
  var clanTheme = typeof getShinobiClanTheme === 'function' ? getShinobiClanTheme(m) : 'default';
  var specialClanBadge = '';
  if(clanTheme === 'kurayami'){
    specialClanBadge = '<span class="sh-clan-special-badge sh-clan-kurayami" title="Тёмная эстетика Клана Кураями">🌑 Кураями</span>';
  } else if(clanTheme === 'uchiha'){
    specialClanBadge = '<span class="sh-clan-special-badge sh-clan-uchiha" title="Эстетика Пламени и Шарингана Клана Учиха">🪭 Учиха</span>';
  }

  var nameDisplay = m.charName ? esc(m.charName) : 'Безымянный шиноби';
  var clanHtml = m.clan ? '<span class="sh-hud-clan">Клан ' + esc(m.clan) + '</span> · ' : '';
  var villageHtml = '<span>' + esc(m.village || 'Коноха') + '</span>';
  var levelBadgeHtml = '<span class="sh-hud-level">Ур. ' + esc(m.level!=null&&m.level!==''?m.level:'1') + '</span>';
  var rankBadgeHtml = m.rank ? '<span class="sh-hud-rank">' + esc(m.rank) + '</span>' : '';
  var natureBadgeHtml = m.nature ? natureBadge(m.nature) : '';

  return '<div class="sh-hud" id="shHud">'+
    '<div class="sh-hud-top">'+
      '<div class="sh-hud-identity">'+
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">'+
          '<div class="sh-hud-name">' + nameDisplay + '</div>'+
          specialClanBadge +
        '</div>'+
        '<div class="sh-hud-meta">' + clanHtml + villageHtml + '</div>'+
      '</div>'+
      '<div class="sh-hud-badges">'+
        levelBadgeHtml +
        rankBadgeHtml +
        natureBadgeHtml +
      '</div>'+
    '</div>'+
    '<div class="sh-hud-stats">'+
      '<div class="sh-hud-stat-pill">'+
        '<span class="stat-icon">🌀</span>'+
        '<span class="stat-label">Чакра</span>'+
        '<span class="stat-val">' + esc(m.chakra!=null&&m.chakra!==''?m.chakra:'30') + '</span>'+
      '</div>'+
      '<div class="sh-hud-stat-pill">'+
        '<span class="stat-icon">❤️</span>'+
        '<span class="stat-label">ОЗ</span>'+
        '<span class="stat-val">' + esc(m.hp!=null&&m.hp!==''?m.hp:'28') + '</span>'+
      '</div>'+
      '<div class="sh-hud-stat-pill">'+
        '<span class="stat-icon">🛡️</span>'+
        '<span class="stat-label">КБ</span>'+
        '<span class="stat-val">' + esc(m.ac!=null&&m.ac!==''?m.ac:'14') + '</span>'+
      '</div>'+
    '</div>'+
  '</div>';
}
SH.renderShinobiHudHtml = renderShinobiHudHtml;

function renderArsenalSummaryHtml(){
  var techs = SH.techs || [];
  var moves = SH.moves || [];
  var skills = SH.skills || [];

  var totalTechs = techs.length;
  var totalMoves = moves.length;
  var totalSkills = skills.length;

  var rankCounts = {};
  techs.forEach(function(t){
    var r = (t.rank || '').toUpperCase().trim();
    if(r) rankCounts[r] = (rankCounts[r] || 0) + 1;
  });

  var moveCounts = {};
  moves.forEach(function(m){
    var k = (m.kind || '').trim();
    if(k) moveCounts[k] = (moveCounts[k] || 0) + 1;
  });

  var skillCounts = {};
  skills.forEach(function(s){
    var l = (s.level || '').trim();
    if(l) skillCounts[l] = (skillCounts[l] || 0) + 1;
  });

  var rankPills = [];
  RANKS.forEach(function(r){
    if(rankCounts[r]){
      rankPills.push('<span class="sh-arsenal-pill"><b>' + r + '</b>: ' + rankCounts[r] + '</span>');
    }
  });

  var movePills = [];
  MOVE_KINDS.forEach(function(k){
    if(moveCounts[k]){
      movePills.push('<span class="sh-arsenal-pill">' + esc(k) + ': ' + moveCounts[k] + '</span>');
    }
  });

  var skillPills = [];
  SKILL_LEVELS.forEach(function(l){
    if(skillCounts[l]){
      skillPills.push('<span class="sh-arsenal-pill">' + esc(l) + ': ' + skillCounts[l] + '</span>');
    }
  });

  return '<div class="sh-arsenal-card">'+
    '<div class="sh-arsenal-head">'+
      '<div class="sh-arsenal-title">📜 Арсенал и мастерство</div>'+
      '<div class="sh-arsenal-counts"><b>' + totalTechs + '</b> техн. · <b>' + totalMoves + '</b> приём. · <b>' + totalSkills + '</b> навык.</div>'+
    '</div>'+
    '<div class="sh-arsenal-grid">'+
      '<div class="sh-arsenal-col">'+
        '<div class="sh-arsenal-sub">Техники по рангам</div>'+
        '<div class="sh-arsenal-tags">'+
          (rankPills.length ? rankPills.join('') : '<span class="sh-arsenal-empty">нет записей</span>')+
        '</div>'+
      '</div>'+
      '<div class="sh-arsenal-col">'+
        '<div class="sh-arsenal-sub">Виды приёмов</div>'+
        '<div class="sh-arsenal-tags">'+
          (movePills.length ? movePills.join('') : '<span class="sh-arsenal-empty">нет записей</span>')+
        '</div>'+
      '</div>'+
      '<div class="sh-arsenal-col">'+
        '<div class="sh-arsenal-sub">Ступени навыков</div>'+
        '<div class="sh-arsenal-tags">'+
          (skillPills.length ? skillPills.join('') : '<span class="sh-arsenal-empty">нет записей</span>')+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>';
}

SH.renderShinobiHudHtml = renderShinobiHudHtml;
SH.renderArsenalSummaryHtml = renderArsenalSummaryHtml;

/* ---------- экраны ---------- */
function shHome(){
  var hudHtml = renderShinobiHudHtml();
  var hero = '<div class="hero-dice" data-go="dice">'+
    '<div class="hero-dice-icon">'+(typeof dieShapeSvg==='function'? dieShapeSvg(20,'shHeroDie',20) : '🎲')+'</div>'+
    '<div class="hero-dice-text">'+
      '<div class="hero-dice-name">Бросок костей</div>'+
      '<div class="hero-dice-desc">Кости d4–d20, модификатор, подпись броска и копирование готового результата</div>'+
    '</div><div class="hero-dice-arrow">→</div></div>';
  var items = [
    {nav:'shTechs', icon:'🌀', t:'Техники',   d:SH.techs.length ? SH.techs.length+' в списке' : 'Ранг, стихия, чакра, окна, счётчики'},
    {nav:'shMoves', icon:'👊', t:'Приёмы', d:SH.moves.length ? SH.moves.length+' в списке' : 'Рукопашные и оружейные: эффекты и цена приёма'},
    {nav:'shSkills', icon:'🛠️', t:'Навыки и знания', d:(SH.skills&&SH.skills.length) ? SH.skills.length+' в списке' : 'Ремёсла, ступени мастерства, быт, языки'},
    {nav:'shMap',   icon:'🗺️', t:'Карта мира', d:'Векторный атлас: 46 государств, скрытые деревни, лор'},
    {nav:'shRef',   icon:'📚', t:'Справочник', d:'Колесо стихий, кнопки к1–к8, правила, чакра, окна'},
    {nav:'shData',  icon:'💾', t:'Данные',    d:'Экспорт и импорт всего мира одним файлом'}
  ];
  return ''+
    hudHtml +
    '<div class="rule"></div>'+ hero +
    '<div class="section-label">Свитки и разделы</div>'+
    '<div class="menu-list grid-2">'+items.map(function(i){
      return '<div class="menu-item" data-nav="'+i.nav+'"><div class="name">'+i.icon+' '+esc(i.t)+'</div><div class="desc">'+esc(i.d)+'</div><div class="arrow">›</div></div>';
    }).join('')+'</div>';
}

function renderTechCard(t){
  var isDoj = isDojutsu(t.cat);
  var w = (t.windows && t.windows.length) 
    ? t.windows.map(function(win){ return '<span class="sh-win-badge needed">🎯 '+esc(win)+'</span>'; }).join(' ')
    : '<span class="sh-win-badge">окно не требуется</span>';
  var nat = t.nature ? ' ' + natureBadge(t.nature) : '';
  var c = t.counter ? ' · <span style="color:var(--brass)">счётчик '+esc(t.counter)+'/сут</span>' : '';
  var costStr = t.cost ? '<b>'+esc(t.cost)+'</b>' : '—';
  if(t.upkeep) costStr += ' +' + esc(t.upkeep) + '/рнд';
  var dmgStr = dmgText(t) ? ' · урон: <b>'+esc(dmgText(t))+'</b>' : '';
  
  var catBadge = isDoj
    ? '<span class="sh-cat-badge is-dojutsu">👁️ Додзюцу</span>'
    : '<span class="sh-cat-badge">' + (TECH_CAT_ICONS[t.cat] || '🌀') + ' ' + esc(t.cat || 'Ниндзюцу') + '</span>';

  var dojutsuNotice = isDoj ? '<span class="sh-dojutsu-tag">Кеккей Генкай Глаз</span>' : '';

  return '<div class="card sh-tech-card ' + (isDoj ? 'is-dojutsu' : '') + '" data-nav="shTechView:'+t.id+'">'+
    '<div class="top-row">'+
      '<div class="name" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'+
        rankSeal(t.rank) + ' ' + esc(t.name || 'Без названия') +
        dojutsuNotice +
      '</div>'+
      nat+
    '</div>'+
    '<div class="desc" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:4px 0;">'+
      catBadge + ' · затраты: ' + costStr + dmgStr + c +
    '</div>'+
    (t.desc ? '<div style="font-size:12px;color:var(--ink-dim);margin:4px 0 6px;line-height:1.4;">' + esc(t.desc) + '</div>' : '') +
    '<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:5px;align-items:center;">' + w + '</div>'+
  '</div>';
}

function shTechs(){
  var launcherWidget = renderTechLauncher();

  // 1. Подсчет категорий и стихий
  var catCounts = {};
  var natures = {};
  SH.techs.forEach(function(t){
    var c = (t.cat || 'Ниндзюцу').trim();
    if(isDojutsu(c)) c = 'Додзюцу';
    catCounts[c] = (catCounts[c] || 0) + 1;

    var n = (t.nature || '').trim();
    if(n) natures[n] = (natures[n] || 0) + 1;
  });

  var curCatF = SH.techCatFilter || 'all';
  var curNatF = SH.techFilter || 'all';
  var curSort = SH.techSort || (function(){
    try { return localStorage.getItem('sh_tech_sort') || 'category'; } catch(e){ return 'category'; }
  })();
  SH.techSort = curSort;

  // 2. Фильтр по категориям (Додзюцу выделено во главе)
  var catFilterBar = '';
  if(SH.techs.length > 0){
    var catPills = [
      '<div class="sh-filter-pill '+(curCatF==='all'?'active':'')+'" data-tech-cat-filter="all">Все категории <span class="sh-pill-count">'+SH.techs.length+'</span></div>'
    ];

    var catKeysToDisplay = [];
    if(catCounts['Додзюцу']) catKeysToDisplay.push('Додзюцу');
    TECH_CATS.forEach(function(k){
      if(k !== 'Додзюцу' && catCounts[k] && catKeysToDisplay.indexOf(k) === -1){
        catKeysToDisplay.push(k);
      }
    });
    Object.keys(catCounts).forEach(function(k){
      if(catKeysToDisplay.indexOf(k) === -1) catKeysToDisplay.push(k);
    });

    catKeysToDisplay.forEach(function(k){
      var isDoj = isDojutsu(k);
      var icon = TECH_CAT_ICONS[k] || '🌀';
      var isAct = (curCatF === k) || (isDoj && isDojutsu(curCatF));
      var extraCls = isDoj ? ' dojutsu-pill' : '';
      catPills.push('<div class="sh-filter-pill'+extraCls+' '+(isAct?'active':'')+'" data-tech-cat-filter="'+escA(k)+'">'+icon+' '+esc(k)+' <span class="sh-pill-count">'+catCounts[k]+'</span></div>');
    });

    catFilterBar = '<div class="sh-filter-bar" style="margin-bottom:6px;">'+catPills.join('')+'</div>';
  }

  // 3. Фильтр по стихиям чакры
  var natKeys = Object.keys(natures);
  var hasNoNat = SH.techs.some(function(t){ return !(t.nature||'').trim(); });
  var natFilterBar = '';
  if(SH.techs.length > 0 && natKeys.length > 0){
    var natPills = [
      '<div class="sh-filter-pill '+(curNatF==='all'?'active':'')+'" data-tech-filter="all">Все стихии <span class="sh-pill-count">'+SH.techs.length+'</span></div>'
    ];
    natKeys.forEach(function(k){
      natPills.push('<div class="sh-filter-pill '+(curNatF===k?'active':'')+'" data-tech-filter="'+escA(k)+'">'+natureBadge(k)+' <span class="sh-pill-count">'+natures[k]+'</span></div>');
    });
    if(hasNoNat){
      var noNatCount = SH.techs.filter(function(t){ return !(t.nature||'').trim(); }).length;
      natPills.push('<div class="sh-filter-pill '+(curNatF==='none'?'active':'')+'" data-tech-filter="none">Без стихии <span class="sh-pill-count">'+noNatCount+'</span></div>');
    }
    natFilterBar = '<div class="sh-filter-bar" style="margin-bottom:10px;">'+natPills.join('')+'</div>';
  }

  // 4. Фильтрация списка
  var filteredTechs = SH.techs.filter(function(t){
    if(curCatF !== 'all'){
      if(isDojutsu(curCatF)){
        if(!isDojutsu(t.cat)) return false;
      } else {
        if(String(t.cat||'').trim() !== curCatF) return false;
      }
    }
    if(curNatF !== 'all'){
      if(curNatF === 'none'){
        if((t.nature||'').trim()) return false;
      } else {
        if((t.nature||'').trim() !== curNatF) return false;
      }
    }
    return true;
  });

  // 5. Панель сортировки
  var sortToolbar = '';
  if(SH.techs.length > 0){
    sortToolbar = '<div style="display:flex;justify-content:space-between;align-items:center;margin:10px 0 8px;flex-wrap:wrap;gap:8px;background:var(--steel-1);padding:8px 12px;border:1px solid var(--line);border-radius:6px;">' +
      '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
        '<span style="font-size:12px;color:var(--ink-dim);font-weight:600;">Сортировка:</span>' +
        '<select id="shTechSortSelect" class="sh-route-preset-sel" style="font-size:12px;padding:4px 10px;border-radius:4px;">' +
          '<option value="category" '+(curSort==='category'?'selected':'')+'>👁️ По категориям (Додзюцу во главе)</option>' +
          '<option value="rank_desc" '+(curSort==='rank_desc'?'selected':'')+'>⭐ По рангу (S ➔ D)</option>' +
          '<option value="rank_asc" '+(curSort==='rank_asc'?'selected':'')+'>⭐ По рангу (D ➔ S)</option>' +
          '<option value="name" '+(curSort==='name'?'selected':'')+'>🔤 По алфавиту (А–Я)</option>' +
          '<option value="cost" '+(curSort==='cost'?'selected':'')+'>🌀 По затратам чакры</option>' +
        '</select>' +
      '</div>' +
      '<div style="font-size:11.5px;color:var(--ink-dim);">' +
        'Показано: <b>' + filteredTechs.length + '</b> из <b>' + SH.techs.length + '</b> техник' +
      '</div>' +
    '</div>';
  }

  // 6. Отрисовка списка с выделением Додзюцу
  var body = '';
  if(!SH.techs.length){
    body = '<div class="char-empty">Пусто. Техники добавляются по мере изучения — теория плюс практика, ничего не начисляется само.</div>';
  } else if(!filteredTechs.length){
    body = '<div class="char-empty">В выбранной категории или стихии нет техник.</div>';
  } else {
    var RANK_WEIGHTS = { 'S': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 };
    var sortRankDesc = function(a, b){
      var wa = RANK_WEIGHTS[a.rank] || 0;
      var wb = RANK_WEIGHTS[b.rank] || 0;
      if(wb !== wa) return wb - wa;
      return (a.name || '').localeCompare(b.name || '');
    };

    if(curSort === 'category'){
      var dojutsuList = [];
      var otherGroups = {};
      filteredTechs.forEach(function(t){
        if(isDojutsu(t.cat)){
          dojutsuList.push(t);
        } else {
          var cName = (t.cat || 'Ниндзюцу').trim();
          if(!otherGroups[cName]) otherGroups[cName] = [];
          otherGroups[cName].push(t);
        }
      });
      dojutsuList.sort(sortRankDesc);

      var sectionsHtml = [];

      // 1. Додзюцу выделены в отдельную премьер-секцию во главе
      if(dojutsuList.length > 0){
        sectionsHtml.push(
          '<div class="sh-tech-section-head is-dojutsu">' +
            '<div class="sh-tech-section-title">' +
              '<span style="font-size:18px;">👁️</span>' +
              '<span>Додзюцу (Техники глаз / Зрительные дзюцу)</span>' +
              '<span class="sh-section-eye-badge">Особый тип техники</span>' +
              '<span style="font-size:11px;font-weight:normal;color:#ffbe76;margin-left:auto;">' + dojutsuList.length + ' техн.</span>' +
            '</div>' +
            '<div class="sh-tech-section-sub">Кеккей Генкай Шарингана, Бьякугана, Риннегана и родовые зрительные техники</div>' +
          '</div>' +
          dojutsuList.map(renderTechCard).join('')
        );
      }

      // 2. Остальные категории по каноничному порядку
      var remainingCats = TECH_CATS.filter(function(c){ return c !== 'Додзюцу' && otherGroups[c]; });
      Object.keys(otherGroups).forEach(function(c){
        if(remainingCats.indexOf(c) === -1) remainingCats.push(c);
      });

      remainingCats.forEach(function(cName){
        var list = otherGroups[cName];
        if(!list || !list.length) return;
        list.sort(sortRankDesc);
        var icon = TECH_CAT_ICONS[cName] || '🌀';
        sectionsHtml.push(
          '<div class="section-label" style="display:flex;align-items:center;gap:6px;margin-top:16px;">' +
            '<span>' + icon + '</span> <span>' + esc(cName) + '</span>' +
            '<span style="font-size:11px;font-weight:normal;color:var(--ink-dim);margin-left:auto;">' + list.length + ' техн.</span>' +
          '</div>' +
          list.map(renderTechCard).join('')
        );
      });

      body = sectionsHtml.join('');
    } else {
      var sorted = filteredTechs.slice();
      if(curSort === 'rank_desc'){
        sorted.sort(sortRankDesc);
      } else if(curSort === 'rank_asc'){
        sorted.sort(function(a, b){
          var wa = RANK_WEIGHTS[a.rank] || 0;
          var wb = RANK_WEIGHTS[b.rank] || 0;
          if(wa !== wb) return wa - wb;
          return (a.name || '').localeCompare(b.name || '');
        });
      } else if(curSort === 'name'){
        sorted.sort(function(a, b){ return (a.name||'').localeCompare(b.name||''); });
      } else if(curSort === 'cost'){
        sorted.sort(function(a, b){
          var ca = parseInt(a.cost, 10) || 0;
          var cb = parseInt(b.cost, 10) || 0;
          if(cb !== ca) return cb - ca;
          return (a.name||'').localeCompare(b.name||'');
        });
      }
      body = sorted.map(renderTechCard).join('');
    }
  }

  return crumbSh([{label:'Шиноби',nav:'home'},{label:'Техники'}])+
    '<button class="back" data-nav="home">← Назад</button>'+
    '<h1>Техники</h1><div class="sheet-actions"><button class="btn-primary" data-nav="shTechEdit:new">Добавить технику</button><button class="btn-ghost" style="color:#d29bfa;border-color:rgba(155,89,182,0.4); margin-left:10px;" data-nav="shJutsuGen">✨ AI Генератор Дзюцу</button></div>'+
    launcherWidget +
    catFilterBar +
    natFilterBar +
    sortToolbar +
    body;
}

function shMoves(){
  var arr = SH.moves;
  var groups = {};
  arr.forEach(function(m){ var k=m.kind||'Рукопашный'; (groups[k]=groups[k]||[]).push(m); });

  var moveFilterBar = '';
  if(arr.length > 0){
    var curMF = SH.moveFilter || 'all';
    var pills = [
      '<div class="sh-filter-pill '+(curMF==='all'?'active':'')+'" data-move-filter="all">Все <span class="sh-pill-count">'+arr.length+'</span></div>'
    ];
    MOVE_KINDS.forEach(function(k){
      var cnt = arr.filter(function(m){ return (m.kind||'Рукопашный')===k; }).length;
      if(cnt > 0){
        pills.push('<div class="sh-filter-pill '+(curMF===k?'active':'')+'" data-move-filter="'+escA(k)+'">'+esc(k)+' <span class="sh-pill-count">'+cnt+'</span></div>');
      }
    });
    moveFilterBar = '<div class="sh-filter-bar">'+pills.join('')+'</div>';
  }

  var curMF = SH.moveFilter || 'all';
  var kindsToRender = (curMF === 'all')
    ? MOVE_KINDS.filter(function(k){ return groups[k]; })
    : [curMF].filter(function(k){ return groups[k]; });

  var body = arr.length ? (kindsToRender.length ? kindsToRender.map(function(k){
    return '<div class="section-label">'+esc(k)+'</div>'+groups[k].map(function(m){
      var st = (m.mtype==='Состояние' && m.state && m.state!=='не навязывает') ? ' → <span style="color:var(--brass);font-weight:600;">'+esc(m.state)+'</span>' : '';
      var payStr = m.pay ? ('оплата: <b>'+esc(m.pay)+'</b>') : '';
      var line = [ (m.mtype||'—'), (m.weapon||''), (m.atk||''), payStr ]
                 .filter(function(x){return x;}).join(' · ');
      return '<div class="card" data-nav="shMoveView:'+m.id+'">'+
        '<div class="name">'+esc(m.name||'Без названия')+st+'</div>'+
        '<div class="desc">'+line+'</div></div>';
    }).join('');
  }).join('') : '<div class="char-empty">В выбранной категории нет приёмов.</div>')
  : '<div class="char-empty">Пусто. Приёмы изучаются поштучно — у мастера, тренировками, спаррингами. Сюда идут и рукопашные, и оружейные: всё, что не требует чакры.</div>';

  var moveLauncherWidget = renderMoveLauncher();
  return crumbSh([{label:'Шиноби',nav:'home'},{label:'Приёмы'}])+
    '<button class="back" data-nav="home">← Назад</button>'+
    '<h1>Приёмы</h1><div class="sheet-actions"><button class="btn-primary" data-nav="shMoveEdit:new">Добавить приём</button>'+'<button class="btn-ghost" style="color:#d29bfa;border-color:rgba(155,89,182,0.4); margin-left:10px;" data-nav="shMoveGen">✨ AI Генератор приёмов</button></div>'+
    moveLauncherWidget +
    moveFilterBar +
    body;
}

function shSkills(){
  var arr = SH.skills||[];
  var groups = {};
  arr.forEach(function(s){ var k=s.kind||'Другое'; (groups[k]=groups[k]||[]).push(s); });
  var body = arr.length ? SKILL_KINDS.filter(function(k){return groups[k];}).map(function(k){
    return '<div class="section-label">'+esc(k)+'</div>'+groups[k].map(function(s){
      var lvlBadge = '<span class="sh-lvl-badge lvl-'+escA(s.level)+'">'+esc(s.level)+'</span>';
      var line = [(s.abil||''), (s.mod?('модификатор '+s.mod):'')].filter(function(x){return x;}).join(' · ');
      return '<div class="card" data-nav="shSkillView:'+s.id+'">'+
        '<div class="top-row">'+
          '<div class="name">'+esc(s.name||'Без названия')+'</div>'+
          lvlBadge+
        '</div>'+
        '<div class="desc">'+(line||'без характеристик')+'</div></div>';
    }).join('');
  }).join('') : '<div class="char-empty">Пусто. Сюда идёт всё, что персонаж умеет помимо боя: ремесло, быт, языки, счёт, готовка, уход за животными. Навык появляется от того, что персонаж этим занимался, а не от уровня.</div>';
  return crumbSh([{label:'Шиноби',nav:'home'},{label:'Навыки'}])+
    '<button class="back" data-nav="home">← Назад</button>'+
    '<h1>Навыки и знания</h1><div class="sheet-actions"><button class="btn-primary" data-nav="shSkillEdit:new">Добавить навык</button>'+'<button class="btn-ghost" style="color:#d29bfa;border-color:rgba(155,89,182,0.4); margin-left:10px;" data-nav="shSkillGen">✨ AI Генератор навыков</button></div>'+body;
}

function shSkillEdit(){
  var isNew = view.shId==='new';
  var d = SH.draft || (SH.draft = isNew ? newSkill() : JSON.parse(JSON.stringify(skillById(view.shId)||newSkill())));
  return crumbSh([{label:'Шиноби',nav:'home'},{label:'Навыки',nav:'shSkills'},{label:isNew?'Новый':'Правка'}])+
    '<button class="back" data-nav="'+(isNew?'shSkills':('shSkillView:'+d.id))+'">← Назад</button>'+
    '<h1>'+esc(d.name||'Новый навык')+'</h1><div class="sheet-section">'+
    fld('Название','<input id="shSName" type="text" value="'+escA(d.name)+'">','Ковка, ткачество, готовка, счёт, язык страны Волн, уход за собаками.')+
    fld('Тип', sel('shSKind',SKILL_KINDS,d.kind))+
    fld('Уровень', sel('shSLvl',SKILL_LEVELS,d.level),'Начатки — видел и повторит под присмотром. Мастер — учит других и делает то, чего не умеют прочие.')+
    fld('Характеристика','<input id="shSAbil" type="text" value="'+escA(d.abil)+'">','На чём держится: Ловкость, Сила, Интеллект, Мудрость, Харизма.')+
    fld('Модификатор','<input id="shSMod" type="text" value="'+escA(d.mod)+'">','Что прибавляется к броску, если ДМ его требует. Пусто — навык работает без броска.')+
    fld('Откуда','<input id="shSSrc" type="text" value="'+escA(d.src)+'">','Кто научил, где и когда. Это же зацепка для ДМа.')+
    fld('Что даёт','<textarea id="shSGives" rows="3">'+esc(d.gives)+'</textarea>','Конкретно: что персонаж благодаря этому МОЖЕТ сделать и чего не сможет без навыка.')+
    fld('Заметки','<textarea id="shSDesc" rows="3">'+esc(d.desc)+'</textarea>')+
    '<div class="sheet-actions"><button class="btn-primary" id="shSkillSave">Сохранить</button>'+
    (isNew?'':'<button class="btn-ghost" id="shSkillDel">Удалить</button>')+
    '<button class="btn-ghost" data-nav="shSkills">Отмена</button></div></div>';
}

function shSkillView(){
  var s = skillById(view.shId); if(!s) return shSkills();
  var rows = [
    {k:'Тип', v:s.kind},
    {k:'Уровень', v:'<span class="sh-lvl-badge lvl-'+escA(s.level)+'">'+esc(s.level)+'</span>', raw:true},
    {k:'Характеристика', v:s.abil||'—'},
    {k:'Модификатор', v:s.mod||'без броска'},
    {k:'Откуда', v:s.src||'—'},
    {k:'Что даёт', v:s.gives||'—'},
    {k:'Заметки', v:s.desc||'—'}
  ];
  return crumbSh([{label:'Шиноби',nav:'home'},{label:'Навыки',nav:'shSkills'},{label:s.name||'Навык'}])+
    '<button class="back" data-nav="shSkills">← Назад</button>'+
    '<h1>'+esc(s.name||'Навык')+'</h1>'+
    rows.map(function(x){ return '<div class="hb-row"><div class="hb-row-k">'+esc(x.k)+'</div><div class="hb-row-v">'+(x.raw?x.v:nl2br(x.v))+'</div></div>'; }).join('')+
    '<div class="sheet-actions"><button class="btn-ghost" data-nav="shSkillEdit:'+s.id+'">Править</button>'+
    '<button class="btn-ghost" id="shSkillDelV">Удалить</button></div>';
}

function renderCmdInspectorHtml(c){
  if(!c) c = CMDS[0];
  var curParam = SH.cmdParam || '';
  var previewText = '';
  if(c.hasParam && curParam.trim()){
    if(c.id === 'k8'){
      previewText = curParam.trim().charAt(0) === ':' ? '(к8' + curParam.trim() + ')' : '(к8: ' + curParam.trim() + ')';
    } else {
      previewText = c.template.replace('{param}', curParam.trim());
    }
  } else {
    previewText = c.defaultTemplate || c.template.replace('{param}', '').replace(': }', '}').replace(': ]', ']');
  }

  var paramInputHtml = '';
  if(c.hasParam){
    paramInputHtml = 
      '<div class="sh-cmd-param-box">'+
        '<div class="sh-cmd-param-label">Параметр команды (необязательно):</div>'+
        '<input type="text" class="sh-cmd-param-input" id="shCmdParamInput" value="'+escA(curParam)+'" placeholder="'+escA(c.paramPh || 'введите параметр...')+'">'+
      '</div>';
  }

  return '<div class="sh-cmd-inspector" id="shCmdInspector">'+
    '<div class="sh-cmd-inspector-header">'+
      '<div class="sh-cmd-inspector-title">'+
        '<span>'+c.icon+' '+esc(c.ru)+'</span>'+
        '<span class="sh-cmd-tag-badge">'+esc(c.tag)+'</span>'+
      '</div>'+
      '<div class="sh-badge-tag" style="font-size:11px;padding:2px 8px;border:1px solid var(--brass);color:var(--brass);border-radius:3px;background:rgba(201,168,76,0.08);">Команда ИИ</div>'+
    '</div>'+
    '<div class="sh-cmd-inspector-short">'+esc(c.short)+'</div>'+
    paramInputHtml+
    '<div class="sh-cmd-preview-box">'+
      '<div class="sh-cmd-preview-label">Шаблон для отправки:</div>'+
      '<div class="sh-cmd-preview-code" id="shCmdPreviewText">'+esc(previewText)+'</div>'+
    '</div>'+
    '<div class="sh-cmd-inspector-actions">'+
      '<button class="sh-cmd-btn-copy" id="shCmdCopyBtn" title="Скопировать шаблон в буфер обмена">📋 Скопировать команду</button>'+
      '<button class="sh-cmd-btn-rules" id="shCmdRulesToggleBtn">📖 Подробный свод правил ▼</button>'+
    '</div>'+
    '<div class="sh-copy-badge" id="shCmdCopyBadge" style="display:none;margin-top:10px;"></div>'+
    '<div class="sh-cmd-rules-full" id="shCmdRulesBlock">'+nl2br(c.full)+'</div>'+
  '</div>';
}

function shCmds(){
  if(!SH.selectedCmdId) SH.selectedCmdId = 'k1';
  var selCmd = cmdById(SH.selectedCmdId);

  var inspectorHtml = renderCmdInspectorHtml(selCmd);

  var gridHtml = '<div class="sh-cmd-grid">' + CMDS.map(function(c){
    var isSel = (c.id === selCmd.id);
    return '<div class="sh-cmd-card '+(isSel?'active':'')+'" data-cmd-select="'+c.id+'" title="Кликните, чтобы узнать назначение и выбрать">'+
      '<div class="sh-cmd-card-head">'+
        '<div class="sh-cmd-card-name">'+c.icon+' '+esc(c.ru)+'</div>'+
        '<span class="sh-cmd-tag-badge">'+esc(c.tag)+'</span>'+
      '</div>'+
      '<div class="sh-cmd-card-desc">'+esc(c.short)+'</div>'+
      '<div class="sh-cmd-card-status">'+(isSel ? '● Выбрано' : '')+'</div>'+
    '</div>';
  }).join('') + '</div>';

  return crumbSh([{label:'Шиноби',nav:'home'},{label:'Справочник',nav:'shRef'},{label:'Кнопки мастера'}])+
    '<button class="back" data-nav="'+((window._prevScreen === 'shHome') ? 'home' : 'shRef')+'">← '+((window._prevScreen === 'shHome') ? 'На главную' : 'Назад в Справочник')+'</button>'+
    '<h1>⌨️ Кнопки мастера</h1>'+
    '<div class="subtitle">Интерактивный пульт команд для ИИ-Мастера. Кликните по карточке любой кнопки, чтобы узнать её назначение, задать параметр и скопировать шаблон.</div>'+
    '<div id="shCmdInspectorWrap">' + inspectorHtml + '</div>'+
    '<div class="section-label" style="margin:24px 0 12px;">Все команды пульта ('+CMDS.length+')</div>'+
    gridHtml;
}


/* ---------- МАНДАЛА ЧАКРЫ: БАЗОВЫЕ СТИХИИ, КЕККЕЙ ГЕНКАЙ, ТОТА И ИНЬ-ЯН ---------- */
var CHAKRA_DATA = {
  katon: {
    k: 'katon', name: 'Огонь (Катон)', kanji: '火', color: '#e04838', cat: 'base', catLabel: 'Базовая природа',
    formula: 'Чистая тепловая природа чакры',
    beats: 'fuuton', beatsName: 'Ветер (Фуутон)', beatsDesc: 'Пламя раздувается и поглощает воздушные вихри, увеличивая площадь и жар горения.',
    weak: 'suiton', weakName: 'Вода (Суйтон)', weakDesc: 'Водные массы поглощают жар, охлаждают пар и гасят очаг пламени.',
    role: 'Прямой концентрированный урон, поджоги, фронтальные взрывные волны, площадной контроль.',
    physics: 'Конвертация чакры в высокотемпературное пламя и раскалённые газы. Формируется в виде огненных шаров, струй, лавин пепла и драконьих пастей.',
    counter: 'Гидро-барьеры достаточного объёма (Суйтон), вакуумная изоляция, техники поглощения тепла.'
  },
  fuuton: {
    k: 'fuuton', name: 'Ветер (Фуутон)', kanji: '風', color: '#2ed573', cat: 'base', catLabel: 'Базовая природа',
    formula: 'Чистая компрессионная природа чакры',
    beats: 'raiton', beatsName: 'Молния (Райтон)', beatsDesc: 'Плотные потоки ветра рассеивают электрический заряд и отклоняют направленные разряды.',
    weak: 'katon', weakName: 'Огонь (Катон)', weakDesc: 'Кислород в воздушных вихрях лишь подпитывает огонь и увеличивает мощь пожара.',
    role: 'Режущий урон, дальнобойные снаряды, рассечение брони, усиление холодного оружия.',
    physics: 'Тончайшее сжатие чакры до лезвия толщиной в долю миллиметра. Способно разрезать твёрдый камень, рассекать металл и лететь на огромные дистанции с ураганной скоростью.',
    counter: 'Огненные стены и купола (Катон), плотная земляная броня повышенной толщины.'
  },
  raiton: {
    k: 'raiton', name: 'Молния (Райтон)', kanji: '雷', color: '#eccc68', cat: 'base', catLabel: 'Базовая природа',
    formula: 'Чистая высокочастотная природа чакры',
    beats: 'doton', beatsName: 'Земля (Дотон)', beatsDesc: 'Сверхвысокая частота колебания электрического заряда с лёгкостью пробивает и раскалывает земляную породу.',
    weak: 'fuuton', weakName: 'Ветер (Фуутон)', weakDesc: 'Рассекающие вихри ветра сбивают дугу разряда и заземляют электрический поток.',
    role: 'Максимальное бронепробитие, экстремальная скорость перемещения, мышечный и нервный паралич цели.',
    physics: 'Сверхвысокочастотная вибрация чакры, порождающая электрический ток колоссального напряжения. Увеличивает синаптическую реакцию нервной системы пользователя.',
    counter: 'Непроводящие изоляторы (резина, плотный ветер), рассеивающие техники ветра.'
  },
  doton: {
    k: 'doton', name: 'Земля (Дотон)', kanji: '土', color: '#c49156', cat: 'base', catLabel: 'Базовая природа',
    formula: 'Чистая минеральная природа чакры',
    beats: 'suiton', beatsName: 'Вода (Суйтон)', beatsDesc: 'Земляные насыпи, каменные стены и рвы впитывают и сдерживают колоссальные массы воды.',
    weak: 'raiton', weakName: 'Молния (Райтон)', weakDesc: 'Вибрационные разряды молнии раскалывают камень в щебень и пробивают каменные плиты.',
    role: 'Фортификация, создание стен и барьеров, подземное скрытное перемещение, изменение массы и плотности.',
    physics: 'Изменение молекулярной плотности грунта и камня. Позволяет мгновенно возводить каменные стены, затягивать врагов в зыбучие пески или делать тело твердым как алмаз.',
    counter: 'Высокочастотные разряды молнии (Райтон), мощные кинетические удары тайдзюцу.'
  },
  suiton: {
    k: 'suiton', name: 'Вода (Суйтон)', kanji: '水', color: '#3b9ee6', cat: 'base', catLabel: 'Базовая природа',
    formula: 'Чистая гидравлическая природа чакры',
    beats: 'katon', beatsName: 'Огонь (Катон)', beatsDesc: 'Водный поток охлаждает, заливает и мгновенно подавляет тепловую энергию пламени.',
    weak: 'doton', weakName: 'Земля (Дотон)', weakDesc: 'Земляные преграды гасят кинетическую силу волн и отводят потоки воды.',
    role: 'Гибкость, водяные тюрьмы, гидравлические снаряды и волны, создание клонов.',
    physics: 'Манипуляция существующими водоёмами или генерация гидромасс напрямую из чакры. Обеспечивает колоссальную массу удара и возможность полного обездвиживания цели в водяной сфере.',
    counter: 'Земляные дамбы (Дотон), поглощение чакры, электризация через воду (Райтон проводит ток по воде).'
  },

  // --- 8 КЕККЕЙ ГЕНКАЙ ---
  hyoton: {
    k: 'hyoton', name: 'Стихия Льда (Хьётон)', symbol: '❄️', color: '#70a1ff', cat: 'kekkei', catLabel: 'Кеккей Генкай (2 природы)',
    formula: '💧 Вода (Суйтон) + 🍃 Ветер (Фуутон)', parents: ['suiton', 'fuuton'],
    role: 'Криогенные барьеры, заморозка влаги, ледяные отражающие зеркала, режущие осколки.',
    physics: 'Мгновенное понижение температуры окружающей влаги до глубокого минуса. Создаваемый лёд не тает от обычного огня и обладает идеальной зеркальной гладкостью, позволяющей преломлять свет и перемещаться между отражениями.',
    counter: 'Сверхвысокая концентрация огня (Катон ранга A/S), непрерывное кинетическое раскалывание тяжелым оружием.'
  },
  mokuton: {
    k: 'mokuton', name: 'Стихия Дерева (Мокутон)', symbol: '🌳', color: '#2ed573', cat: 'kekkei', catLabel: 'Кеккей Генкай (2 природы)',
    formula: '🪨 Земля (Дотон) + 💧 Вода (Суйтон)', parents: ['doton', 'suiton'],
    role: 'Подавление и сдерживание чакры, возведение неприступных куполов, оживление флоры, захват поля боя.',
    physics: 'Слияние минералов земли с питающей водой порождает взрывной рост прочнейшей живой древесины. Особенность стихии — способность веток и корней непрерывно выкачивать и подавлять чакру жертвы, включая чакру Биджу.',
    counter: 'Массированный режущий урон высокой частоты, токсичные разрушительные кислоты, экстремальный всепожирающий огонь.'
  },
  yoton: {
    k: 'yoton', name: 'Стихия Лавы (Йотон)', symbol: '🌋', color: '#ff4757', cat: 'kekkei', catLabel: 'Кеккей Генкай (2 природы)',
    formula: '🔥 Огонь (Катон) + 🪨 Земля (Дотон)', parents: ['katon', 'doton'],
    role: 'Плавление любой твёрдой защиты, площадное магматическое разрушение, едкая известь и цементирующая смола.',
    physics: 'Нагрев минеральных пород до жидкого расплавленного состояния. Выделяется в виде потоков лавы, раскалённых вулканических булыжников или быстро затвердевающей извести, сковывающей врага намертво.',
    counter: 'Огромный объём холодной воды (Суйтон), мгновенно остужающий магму в твёрдый остывший камень.'
  },
  futton: {
    k: 'futton', name: 'Стихия Пара / Кипения (Футтон)', symbol: '♨️', color: '#ff7f50', cat: 'kekkei', catLabel: 'Кеккей Генкай (2 природы)',
    formula: '🔥 Огонь (Катон) + 💧 Вода (Суйтон)', parents: ['katon', 'suiton'],
    role: 'Кислотная коррозия, тепловой импульс, силовое паровое ускорение ударов.',
    physics: 'Генерация газообразного пара высокой температуры и регулируемой кислотности. Пар способен за секунды растворять органику и чакру абсолютной защиты, а также нагнетать внутреннее давление для катапультирующих ударов.',
    counter: 'Рассеивание ураганным ветром (Фуутон) на открытом пространстве, барьеры полного вакуума.'
  },
  shakuton: {
    k: 'shakuton', name: 'Стихия Жара (Шакутон)', symbol: '☀️', color: '#ffa502', cat: 'kekkei', catLabel: 'Кеккей Генкай (2 природы)',
    formula: '🔥 Огонь (Катон) + 🍃 Ветер (Фуутон)', parents: ['katon', 'fuuton'],
    role: 'Мгновенное иссушение, бесконтактное тепловое испепеление, летальные сферы жара.',
    physics: 'Сверхконцентрация раскалённого вихревого воздуха. При приближении к биологическому телу вызывает мгновенное закипание и испарение всей клеточной влаги, превращая противника в иссушенную мумию без прямого контакта.',
    counter: 'Сплошные минеральные преграды (Дотон), лишённые влаги, дальний бой вне теплового радиуса сфер.'
  },
  jiton: {
    k: 'jiton', name: 'Стихия Магнетизма (Джитон)', symbol: '🧲', color: '#eccc68', cat: 'kekkei', catLabel: 'Кеккей Генкай (2 природы)',
    formula: '🍃 Ветер (Фуутон) + ⚡ Молния (Райтон)', parents: ['fuuton', 'raiton'],
    role: 'Поляризация металлов, манипуляция минеральным и железным песком, намагничивание оружия.',
    physics: 'Генерация мощнейших электромагнитных полей. Позволяет двигать в воздухе тонны металлического песка, формировать из него гигантские монолиты или намагничивать тело врага, притягивая к нему все клинки в округе.',
    counter: 'Оружие и щиты из непроводящих диэлектриков (камень, дерево, кость), нейтрализация немагнитным ниндзюцу.'
  },
  ranton: {
    k: 'ranton', name: 'Стихия Шторма / Бури (Рантон)', symbol: '⚡', color: '#5352ed', cat: 'kekkei', catLabel: 'Кеккей Генкай (2 природы)',
    formula: '💧 Вода (Суйтон) + ⚡ Молния (Райтон)', parents: ['suiton', 'raiton'],
    role: 'Управляемые лазерные лучи, гибкая траектория, безошибочный дальнобойный снайперский урон.',
    physics: 'Слияние текучей проводимости воды и разрушительной энергии молнии рождает светящиеся лучи чистой энергии. Они способны изгибаться в воздухе под любым углом, огибая любые преграды и наводясь точно в уязвимые точки цели.',
    counter: 'Зеркальные отражающие барьеры, барьеры полного поглощения чакры, многослойная светонепроницаемая защита.'
  },
  bakuton: {
    k: 'bakuton', name: 'Стихия Взрыва (Бакутон)', symbol: '💥', color: '#ff6348', cat: 'kekkei', catLabel: 'Кеккей Генкай (2 природы)',
    formula: '🪨 Земля (Дотон) + ⚡ Молния (Райтон)', parents: ['doton', 'raiton'],
    role: 'Взрывная детонация при ударе, дистанционный подрыв минералов, снос фортификаций.',
    physics: 'Насыщение минеральных сред детонационной нестабильной чакрой. При кинетическом ударе или команде пользователя заряд взрывается с разрушительной ударной волной, дробящей металл и кости.',
    counter: 'Электрические разряды Райтона (нейтрализуют химическую детонацию), вязкие гидро-среды, гасящие взрывную волну.'
  },

  // --- КЕККЕЙ ТОТА ---
  jinton: {
    k: 'jinton', name: 'Стихия Пыли / Расщепления (Джинтон)', symbol: '💠', color: '#a55eea', cat: 'tota', catLabel: 'Кеккей Тота (3 природы)',
    formula: '🔥 Огонь (Катон) + 🪨 Земля (Дотон) + 🍃 Ветер (Фуутон)', parents: ['katon', 'doton', 'fuuton'],
    role: 'Субатомное расщепление материи, абсолютное игнорирование прочности, уничтожение армий и колоссов.',
    physics: 'Высшее трёхстихийное слияние. Формирует трёхмерную геометрическую фигуру (конус, куб, цилиндр) из белого сияния. При расширении всё находящееся внутри расщепляется на молекулярном и атомарном уровне в невидимую пыль.',
    counter: 'Поглощение чакры (Печать небытия), техники мгновенного пространственного перемещения (Хирайшин), атака до завершения формирования фигуры.'
  },

  // --- ИНЬ, ЯН И ОНМЁТОН ---
  inton: {
    k: 'inton', name: 'Стихия Инь (Интон — Духовная энергия)', symbol: '🌑', color: '#57606f', cat: 'yin_yang', catLabel: 'Духовная энергия (Инь)',
    formula: 'Мысль, воображение и духовная энергия чакры', children: ['kage', 'shinten', 'genjutsu'],
    role: 'Придание формы небытию, иллюзии, ментальный контроль, манипуляция тенью.',
    physics: 'Работает с ментальной составляющей чакры. Позволяет создавать материальные структуры из мысли и света, изменять восприятие времени врагом и воздействовать на нервную систему без физического урона.',
    counter: 'Непоколебимая концентрация, высокий порог ментального сопротивления, внешнее физическое прерывание потока чакры.'
  },
  kage: {
    k: 'kage', name: 'Техники Тени (Каге)', symbol: '👥', color: '#2f3542', cat: 'yin_yang', catLabel: 'Ответвление Инь',
    formula: 'Манипуляция плотностью тени через Стихию Инь', parent: 'inton',
    role: 'Принудительный контроль движений, связывание силуэта, теневые материальные иглы и удушение.',
    physics: 'Плотное проецирование духовной чакры в собственную тень с приданием ей физической массы. При слиянии с тенью противника нервная система жертвы принудительно повторяет каждое движение хозяина техники.',
    counter: 'Полная абсолютная тьма (отсутствие источника теней) или ослепляющие вспышки со всех направлений.'
  },
  shinten: {
    k: 'shinten', name: 'Техники Разума и Сознания (Шинтен)', symbol: '🧠', color: '#747d8c', cat: 'yin_yang', catLabel: 'Ответвление Инь',
    formula: 'Проекция сознания и воли через Стихию Инь', parent: 'inton',
    role: 'Ментальный захват тела, телепатия, духовная сенсорика, подавление воли.',
    physics: 'Направленный выстрел духовной энергией напрямую в разум цели. Сознание пользователя вытесняет разум жертвы и берёт полный контроль над её моторикой, речью и действиями.',
    counter: 'Сокрушительная сила воли внутри разума, физическая уязвимость исходного тела пользователя во время полёта духа.'
  },
  genjutsu: {
    k: 'genjutsu', name: 'Иллюзии (Гендзюцу)', symbol: '👁️', color: '#a4b0be', cat: 'yin_yang', catLabel: 'Ответвление Инь',
    formula: 'Искажение нервных импульсов через Стихию Инь', parent: 'inton',
    role: 'Паралич чувств, искажение времени и пространства, ложные фантомы, ментальное истощение.',
    physics: 'Внедрение микропорций чужеродной чакры в черепные нервные узлы противника. Блокирует реальные сигналы от глаз, ушей и кожи, подменяя их созданными образами любой степени реалистичности.',
    counter: 'Техника рассеивания (Кай), резкий болевой импульс, всплеск чакры от внешнего союзника.'
  },
  yanton: {
    k: 'yanton', name: 'Стихия Ян (Янтон — Физическая энергия)', symbol: '☀️', color: '#ffa502', cat: 'yin_yang', catLabel: 'Физическая энергия (Ян)',
    formula: 'Жизненная сила, тело и витальная энергия чакры', children: ['baika', 'iryo', 'vitality'],
    role: 'Вдыхание жизни в форму, мышечный рост, заживление тканей, стимуляция деления клеток.',
    physics: 'Опирается на телесную составляющую чакры. Питает клетки, ускоряет регенерацию ран, регулирует массу тела и придаёт плоти колоссальную физическую силу и жизнеспособность.',
    counter: 'Истощение энергетического запаса калорий, поражение внутренних органов ядами, блокировка очагов чакры (Тенкецу).'
  },
  baika: {
    k: 'baika', name: 'Техники Массы и Размера (Байка)', symbol: '🍖', color: '#e67e22', cat: 'yin_yang', catLabel: 'Ответвление Ян',
    formula: 'Конвертация калорий и чакры Ян в мышечную массу', parent: 'yanton',
    role: 'Гигантизм, частичное увеличение конечностей, сокрушительные катящиеся атаки, живая броня.',
    physics: 'Мгновенное перераспределение и умножение массы плоти и скелета. Позволяет наносить удары руками размером с дом или превращаться в неостановимый разрушительный шар.',
    counter: 'Высокая инерция, уязвимость к скоростным пробивающим атакам (Райтон), истощение запасов тела.'
  },
  iryo: {
    k: 'iryo', name: 'Медицинское Ниндзюцу (Ирьё)', symbol: '💚', color: '#2ed573', cat: 'yin_yang', catLabel: 'Ответвление Ян',
    formula: 'Стимуляция клеточного митоза через Стихию Ян', parent: 'yanton',
    role: 'Заживление смертельных ран, восстановление органов, нейтрализация ядов, скальпель чакры.',
    physics: 'Сверхточный контроль чакры Ян, вводимой в поражённые ткани. Заставляет клетки делиться в сотни раз быстрее нормы, закрывая ранения и восстанавливая повреждённые сосуды.',
    counter: 'Превышение биологического лимита деления клеток (сокращает жизнь), блокировка каналов чакры.'
  },
  vitality: {
    k: 'vitality', name: 'Жизненная Сила (Витальность)', symbol: '⚡', color: '#f1c40f', cat: 'yin_yang', catLabel: 'Ответвление Ян',
    formula: 'Аномальная плотность природной витальности Ян', parent: 'yanton',
    role: 'Колоссальный резерв чакры, выживание при смертельных ранениях, удержание духовных сущностей.',
    physics: 'Особое физиологическое состояние тела с аномально мощным ядром Ян. Позволяет шиноби выдерживать извлечение хвостатых зверей, колотые раны сердца и сражаться сутками без отдыха.',
    counter: 'Полное отсечение головы, техники запечатывания души (Шики Фуджин).'
  },
  onmyoton: {
    k: 'onmyoton', name: 'Стихия Инь-Ян (Онмётон — Созидание)', symbol: '☯️', color: '#f5f6fa', cat: 'yin_yang', catLabel: 'Высшее слияние Инь и Ян',
    formula: '🌑 Стихия Инь (Форма) + ☀️ Стихия Ян (Жизнь)', parents: ['inton', 'yanton'],
    role: 'Созидание всего сущего из небытия, Сферы Истины (Гудодама), абсолютное обнуление ниндзюцу.',
    physics: 'Инь создаёт форму из пустоты мыслью, а Ян вдыхает в неё физическую жизнь и материальность. Вершина управления чакрой, способная материализовать любые объекты и аннулировать любое враждебное ниндзюцу при контакте.',
    counter: 'Природная энергия Сендзюцу (не подчиняется чакре шиноби и не аннулируется) и чистое физическое тайдзюцу.'
  }
};
var ELEM_DATA = CHAKRA_DATA; // backwards compatibility
var activeElemKey = 'katon';
var activeChakraFilter = 'all';

var CHAKRA_NODE_DEFS = {
  katon:    { x: 270, y: 42,  r: 22, type: 'base' },
  fuuton:   { x: 418, y: 148, r: 22, type: 'base' },
  raiton:   { x: 362, y: 318, r: 22, type: 'base' },
  doton:    { x: 178, y: 318, r: 22, type: 'base' },
  suiton:   { x: 122, y: 148, r: 22, type: 'base' },

  shakuton: { x: 344, y: 95,  r: 16, type: 'kekkei' },
  jiton:    { x: 390, y: 233, r: 16, type: 'kekkei' },
  bakuton:  { x: 270, y: 318, r: 16, type: 'kekkei' },
  mokuton:  { x: 150, y: 233, r: 16, type: 'kekkei' },
  futton:   { x: 196, y: 95,  r: 16, type: 'kekkei' },
  hyoton:   { x: 270, y: 148, r: 16, type: 'kekkei' },
  yoton:    { x: 224, y: 180, r: 16, type: 'kekkei' },
  ranton:   { x: 316, y: 180, r: 16, type: 'kekkei' },

  jinton:   { x: 270, y: 222, r: 22, type: 'tota' },

  inton:    { x: 170, y: 450, r: 22, type: 'yin' },
  kage:     { x: 75,  y: 420, r: 15, type: 'yin_sub' },
  shinten:  { x: 70,  y: 480, r: 15, type: 'yin_sub' },
  genjutsu: { x: 115, y: 535, r: 15, type: 'yin_sub' },

  yanton:   { x: 370, y: 450, r: 22, type: 'yang' },
  baika:    { x: 465, y: 420, r: 15, type: 'yang_sub' },
  iryo:     { x: 470, y: 480, r: 15, type: 'yang_sub' },
  vitality: { x: 425, y: 535, r: 15, type: 'yang_sub' },

  onmyoton: { x: 270, y: 480, r: 22, type: 'onmyo' }
};

function renderChakraMandalaSvg(activeKey, activeFilter){
  var cur = CHAKRA_DATA[activeKey] || CHAKRA_DATA.katon;

  var out = '<svg viewBox="0 0 540 600" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;">';
  out += '<defs>';
  out += '<filter id="shChakraGlow" x="-50" y="-50" width="640" height="700" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="5" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>';
  out += '<marker id="sh-arr-norm" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.25)" /></marker>';
  out += '<marker id="sh-arr-adv" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#7be0a6" /></marker>';
  out += '<marker id="sh-arr-weak" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#ff8577" /></marker>';
  out += '</defs>';

  // Base 5 Pentagon cycle lines (Superiority cycle)
  var cycle = ['katon', 'fuuton', 'raiton', 'doton', 'suiton'];
  for(var i=0; i<cycle.length; i++){
    var fromK = cycle[i];
    var toK = cycle[(i+1)%cycle.length];
    var c1 = CHAKRA_NODE_DEFS[fromK], c2 = CHAKRA_NODE_DEFS[toK];
    var isAdv = (cur.k === fromK);
    var isWeakRel = (cur.k === toK);
    var strokeCol = isAdv ? '#7be0a6' : (isWeakRel ? '#ff8577' : 'rgba(255,255,255,0.18)');
    var sWidth = (isAdv || isWeakRel) ? '3' : '1.5';
    var dash = (isAdv || isWeakRel) ? '' : 'stroke-dasharray="4,4"';
    var marker = isAdv ? 'url(#sh-arr-adv)' : (isWeakRel ? 'url(#sh-arr-weak)' : 'url(#sh-arr-norm)');

    var dx = c2.x - c1.x, dy = c2.y - c1.y;
    var dist = Math.sqrt(dx*dx + dy*dy);
    var p1 = 26, p2 = 30;
    var x1 = c1.x + (dx/dist)*p1, y1 = c1.y + (dy/dist)*p1;
    var x2 = c2.x - (dx/dist)*p2, y2 = c2.y - (dy/dist)*p2;
    out += '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="'+strokeCol+'" stroke-width="'+sWidth+'" '+dash+' marker-end="'+marker+'" />';
  }

  // Chords between base elements (interior star of pentagram)
  var chords = [
    ['suiton', 'fuuton'], // passes hyoton
    ['katon', 'doton'],   // passes yoton
    ['suiton', 'raiton'], // passes ranton
    ['katon', 'raiton'],
    ['doton', 'fuuton']
  ];
  chords.forEach(function(pair){
    var pA = CHAKRA_NODE_DEFS[pair[0]], pB = CHAKRA_NODE_DEFS[pair[1]];
    var isHighlight = (cur.parents && cur.parents.indexOf(pair[0]) !== -1 && cur.parents.indexOf(pair[1]) !== -1) ||
                      (cur.k === pair[0] || cur.k === pair[1]);
    var cCol = isHighlight ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.06)';
    var cWidth = isHighlight ? '2' : '1';
    out += '<line x1="'+pA.x+'" y1="'+pA.y+'" x2="'+pB.x+'" y2="'+pB.y+'" stroke="'+cCol+'" stroke-width="'+cWidth+'" />';
  });

  // Kekkei Genkai parent connection highlights
  if(cur.cat === 'kekkei' && cur.parents){
    var kgPos = CHAKRA_NODE_DEFS[cur.k];
    cur.parents.forEach(function(pk){
      var parPos = CHAKRA_NODE_DEFS[pk];
      out += '<line x1="'+parPos.x+'" y1="'+parPos.y+'" x2="'+kgPos.x+'" y2="'+kgPos.y+'" stroke="'+cur.color+'" stroke-width="3" stroke-dasharray="3,3" filter="url(#shChakraGlow)" />';
    });
  }

  // Kekkei Tota (Jinton) 3 rays
  var jtPos = CHAKRA_NODE_DEFS['jinton'];
  var isJtActive = (cur.k === 'jinton');
  ['katon', 'doton', 'fuuton'].forEach(function(pk){
    var parPos = CHAKRA_NODE_DEFS[pk];
    var rayCol = isJtActive ? '#a55eea' : 'rgba(165,94,234,0.25)';
    var rayWidth = isJtActive ? '3.5' : '1.5';
    var rayFilter = isJtActive ? 'filter="url(#shChakraGlow)"' : '';
    out += '<line x1="'+parPos.x+'" y1="'+parPos.y+'" x2="'+(pk === 'katon' ? (jtPos.x + 0.01) : jtPos.x)+'" y2="'+jtPos.y+'" stroke="'+rayCol+'" stroke-width="'+rayWidth+'" stroke-dasharray="4,2" '+rayFilter+' />';
  });

  // Section divider: Yin-Yang
  out += '<g opacity="0.75">';
  out += '<line x1="40" y1="380" x2="500" y2="380" stroke="rgba(197,160,89,0.3)" stroke-dasharray="6,6" stroke-width="1" />';
  out += '<rect x="175" y="368" width="190" height="24" rx="12" fill="#13100c" stroke="rgba(197,160,89,0.4)" stroke-width="1" />';
  out += '<text x="270" y="384" text-anchor="middle" font-family="Cinzel, serif" font-size="11" font-weight="700" fill="#f6e58d" letter-spacing="1">БАЛАНС ИНЬ И ЯН</text>';
  out += '</g>';

  // Yin-Yang connections
  var intonPos = CHAKRA_NODE_DEFS['inton'];
  var yantonPos = CHAKRA_NODE_DEFS['yanton'];
  var onmyoPos = CHAKRA_NODE_DEFS['onmyoton'];

  // Curves to Onmyoton
  var isOmAct = (cur.k === 'onmyoton' || cur.k === 'inton' || cur.k === 'yanton');
  out += '<path d="M '+intonPos.x+' '+intonPos.y+' Q 220 480 '+onmyoPos.x+' '+onmyoPos.y+'" fill="none" stroke="'+(isOmAct?'#747d8c':'rgba(255,255,255,0.15)')+'" stroke-width="'+(isOmAct?'2.5':'1.5')+'" stroke-dasharray="3,3" />';
  out += '<path d="M '+yantonPos.x+' '+yantonPos.y+' Q 320 480 '+onmyoPos.x+' '+onmyoPos.y+'" fill="none" stroke="'+(isOmAct?'#ffa502':'rgba(255,255,255,0.15)')+'" stroke-width="'+(isOmAct?'2.5':'1.5')+'" stroke-dasharray="3,3" />';

  // Yin sub-nodes connections
  ['kage', 'shinten', 'genjutsu'].forEach(function(sk){
    var sp = CHAKRA_NODE_DEFS[sk];
    var isSkAct = (cur.k === sk || cur.k === 'inton');
    out += '<line x1="'+intonPos.x+'" y1="'+intonPos.y+'" x2="'+sp.x+'" y2="'+sp.y+'" stroke="'+(isSkAct?'#a4b0be':'rgba(255,255,255,0.12)')+'" stroke-width="'+(isSkAct?'2.5':'1')+'" />';
  });

  // Yang sub-nodes connections
  ['baika', 'iryo', 'vitality'].forEach(function(sk){
    var sp = CHAKRA_NODE_DEFS[sk];
    var isSkAct = (cur.k === sk || cur.k === 'yanton');
    out += '<line x1="'+yantonPos.x+'" y1="'+yantonPos.y+'" x2="'+sp.x+'" y2="'+sp.y+'" stroke="'+(isSkAct?'#ffa502':'rgba(255,255,255,0.12)')+'" stroke-width="'+(isSkAct?'2.5':'1')+'" />';
  });

  // Render All 23 Nodes
  for(var k in CHAKRA_NODE_DEFS){
    var d = CHAKRA_NODE_DEFS[k];
    var cd = CHAKRA_DATA[k];
    if(!cd) continue;
    var isAct = (k === cur.k);
    var isParentOfActive = (cur.parents && cur.parents.indexOf(k) !== -1) || (cur.parent === k);
    var isChildOfActive = (cur.children && cur.children.indexOf(k) !== -1);

    // Filter check
    var isDimmed = false;
    if(activeFilter === 'base' && d.type !== 'base') isDimmed = true;
    if(activeFilter === 'kekkei' && d.type !== 'kekkei') isDimmed = true;
    if(activeFilter === 'tota' && d.type !== 'tota') isDimmed = true;
    if(activeFilter === 'yin_yang' && d.type.indexOf('yin') === -1 && d.type.indexOf('yang') === -1 && d.type !== 'onmyo') isDimmed = true;

    var glowRing = isAct ? '#ffffff' : (isParentOfActive ? (cur.color || cd.color) : (isChildOfActive ? '#7be0a6' : cd.color));
    var ringW = isAct ? '3.5' : (isParentOfActive ? '3' : '1.8');
    var pulseClass = isAct ? 'node-bg active' : 'node-bg';
    var dropFilter = isAct ? 'filter="url(#shChakraGlow)"' : '';
    var opacityStyle = isDimmed ? 'opacity:0.2;' : '';

    out += '<g class="sh-node '+(isAct?'active':'')+'" data-elem="'+k+'" style="cursor:pointer;'+opacityStyle+'" '+dropFilter+'>';
    out += '<circle class="'+pulseClass+'" cx="'+d.x+'" cy="'+d.y+'" r="'+d.r+'" fill="#15120e" stroke="'+glowRing+'" stroke-width="'+ringW+'" />';
    out += '<circle cx="'+d.x+'" cy="'+d.y+'" r="'+(d.r-4)+'" fill="'+cd.color+'" fill-opacity="'+(isAct?'0.45':'0.22')+'" />';

    if(cd.kanji){
      out += '<text x="'+d.x+'" y="'+(d.y+7)+'" text-anchor="middle" fill="#ffffff" font-size="'+(d.r>18?18:14)+'" font-family="Cinzel, serif" font-weight="bold" pointer-events="none">'+cd.kanji+'</text>';
    } else if(cd.symbol){
      out += '<text x="'+d.x+'" y="'+(d.y+6)+'" text-anchor="middle" font-size="'+(d.r>18?16:13)+'" pointer-events="none">'+cd.symbol+'</text>';
    }

    // Label below/above node
    var labelY = d.y + d.r + 13;
    var labelColor = isAct ? '#ffffff' : (isParentOfActive ? cd.color : '#b0a696');
    var shortLabel = cd.name.split(' ')[0].replace(/[()]/g, '');
    if(cd.name.indexOf('Стихия ') === 0) shortLabel = cd.name.split(' ')[1].replace(/[()]/g, '');
    out += '<text x="'+d.x+'" y="'+labelY+'" text-anchor="middle" fill="'+labelColor+'" font-size="10.5" font-family="JetBrains Mono, monospace" font-weight="'+(isAct?'bold':'normal')+'" pointer-events="none">'+esc(shortLabel)+'</text>';

    out += '</g>';
  }

  out += '</svg>';
  return out;
}

function renderChakraInfoCard(cur){
  if(!cur) cur = CHAKRA_DATA.katon;

  var relationHtml = '';
  if(cur.cat === 'base'){
    relationHtml = '<div class="sh-chakra-rel-row" style="margin-bottom:10px;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:4px;border:1px solid rgba(255,255,255,0.06);">' +
      '<div style="margin-bottom:6px;"><span class="sh-wheel-adv">▲ Превосходит:</span> <span style="color:#ffffff;font-weight:600;">'+esc(cur.beatsName)+'</span> — '+esc(cur.beatsDesc)+'</div>' +
      '<div><span class="sh-wheel-dis">▼ Уступает:</span> <span style="color:#ffffff;font-weight:600;">'+esc(cur.weakName)+'</span> — '+esc(cur.weakDesc)+'</div>' +
    '</div>';
  } else if(cur.parents && cur.parents.length){
    var pNames = cur.parents.map(function(pk){ return CHAKRA_DATA[pk] ? (CHAKRA_DATA[pk].kanji ? CHAKRA_DATA[pk].kanji + ' ' + CHAKRA_DATA[pk].name : CHAKRA_DATA[pk].symbol + ' ' + CHAKRA_DATA[pk].name) : pk; }).join(' + ');
    relationHtml = '<div style="margin-bottom:10px;padding:8px 12px;background:rgba(255,255,255,0.04);border-radius:4px;border-left:3px solid '+cur.color+'">'+
      '<span style="color:var(--ink-dim);font-size:12px;">Слияние элементов (Кеккей Генкай / Тота):</span> '+
      '<div style="color:#ffffff;font-weight:600;font-size:13.5px;margin-top:2px;">'+esc(pNames)+'</div>'+
    '</div>';
  } else if(cur.parent){
    var par = CHAKRA_DATA[cur.parent];
    relationHtml = '<div style="margin-bottom:10px;padding:8px 12px;background:rgba(255,255,255,0.04);border-radius:4px;border-left:3px solid '+cur.color+'">'+
      '<span style="color:var(--ink-dim);font-size:12px;">Базовая энергия:</span> '+
      '<div style="color:#ffffff;font-weight:600;font-size:13.5px;margin-top:2px;">'+esc(par ? par.name : cur.parent)+'</div>'+
    '</div>';
  }

  return '<div class="sh-wheel-info" id="shWheelInfo">'+
    '<div class="sh-wheel-info-head">'+
      '<div style="display:flex;align-items:center;gap:12px;">'+
        '<span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:'+cur.color+'22;border:2px solid '+cur.color+';font-size:18px;box-shadow:0 0 12px '+cur.color+'55;">'+(cur.kanji||cur.symbol||'🌀')+'</span>'+
        '<div>'+
          '<div style="font-size:18px;font-weight:700;color:'+cur.color+';letter-spacing:.02em;">'+esc(cur.name)+'</div>'+
          '<div style="font-size:12.5px;color:var(--ink-dim)">'+esc(cur.catLabel)+'</div>'+
        '</div>'+
      '</div>'+
      '<span class="sh-map-inspector-badge" style="background:'+cur.color+'22;color:'+cur.color+';border:1px solid '+cur.color+'44;font-size:11.5px;padding:4px 10px;">'+(cur.symbol ? cur.symbol + ' ' : '')+esc(cur.catLabel)+'</span>'+
    '</div>'+
    relationHtml +
    '<div style="display:grid;grid-template-columns:1fr;gap:8px;margin:10px 0;padding:10px 12px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:4px;">'+
      '<div><span style="color:var(--brass);font-weight:600;">⚔️ Боевая роль и свойства:</span> '+esc(cur.role)+'</div>'+
      (cur.counter ? '<div><span style="color:#ff8577;font-weight:600;">🛡️ Слабости и контрмеры:</span> '+esc(cur.counter)+'</div>' : '')+
    '</div>'+
    '<div style="font-size:13.5px;color:var(--ink);line-height:1.55;margin-bottom:14px;background:rgba(20,18,14,0.45);padding:11px 13px;border-radius:4px;border-left:2px solid rgba(197,160,89,0.35);">'+
      esc(cur.physics)+
    '</div>'+
    '<div style="display:flex;justify-content:flex-end;">'+
      '<button class="sh-elem-btn" id="shBtnCopyChakraLore" data-chakra="'+escA(cur.k)+'" style="padding:8px 16px;font-size:13px;border-color:var(--brass);color:#f6e58d;">📋 Скопировать свойства в технику для AI Studio</button>'+
    '</div>'+
  '</div>';
}

function renderElementWheel(){
  var cur = CHAKRA_DATA[activeElemKey] || CHAKRA_DATA.katon;

  var filterTabs = [
    { k: 'all', l: 'Все элементы (23)' },
    { k: 'base', l: '5 Базовых стихий' },
    { k: 'kekkei', l: 'Кеккей Генкай (8)' },
    { k: 'tota', l: 'Кеккей Тота (Пыль)' },
    { k: 'yin_yang', l: 'Инь, Ян и Онмётон' }
  ];

  var filterHtml = '<div class="sh-chakra-filter-bar">' +
    filterTabs.map(function(t){
      return '<div class="sh-chakra-pill '+(activeChakraFilter===t.k?'active':'')+'" data-chakra-filter="'+t.k+'">'+esc(t.l)+'</div>';
    }).join('') +
  '</div>';

  var svg = renderChakraMandalaSvg(activeElemKey, activeChakraFilter);
  var infoHtml = renderChakraInfoCard(cur);

  return '<div class="sh-wheel-box">'+
    '<div class="sh-wheel-title">Великая Мандала Чакры и Слияний</div>'+
    '<div class="sh-wheel-sub">Интерактивная геометрия 5 стихий, 8 Кеккей Генкай, Кеккей Тота и баланса Инь-Ян</div>'+
    filterHtml +
    '<div class="sh-wheel-svg-wrap">'+svg+'</div>'+
    infoHtml +
  '</div>';
}

SH.CHAKRA_DATA = CHAKRA_DATA;
SH.renderChakraMandalaSvg = renderChakraMandalaSvg;
SH.renderChakraInfoCard = renderChakraInfoCard;
SH.renderElementWheel = renderElementWheel;
SH.activeElemKey = activeElemKey;
SH.activeChakraFilter = activeChakraFilter;


// Comprehensive implementation of rich visual renderers for Shinobi Handbook screens

function renderRefHeader(r, key, badgeText){
  return '<div class="sh-ref-header">'+
    '<div class="sh-ref-header-top">'+
      '<div class="sh-ref-title-wrap">'+
        '<h1 style="margin-bottom:4px;">'+(r.icon||'📖')+' '+esc(r.t)+'</h1>'+
        (badgeText ? '<span class="sh-ref-header-badge">'+esc(badgeText)+'</span>' : '')+
      '</div>'+
      '<button class="sh-elem-btn sh-ref-copy-btn" id="shCopyRefLoreBtn" data-ref-key="'+escA(key)+'" title="Скопировать выжимку правил в буфер">'+
        '📋 Скопировать правила для AI Studio'+
      '</button>'+
    '</div>'+
    (r.lead ? '<div class="sh-ref-lead">'+esc(r.lead)+'</div>' : '')+
  '</div>';
}

function renderRefGeneric(r, key){
  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Справочник')+
    '<div class="sh-ref-cards-grid">'+
      r.rows.map(function(x){
        return '<div class="sh-ref-card">'+
          '<div class="sh-ref-card-k">'+esc(x.k)+'</div>'+
          '<div class="sh-ref-card-v">'+nl2br(x.v)+'</div>'+
        '</div>';
      }).join('')+
    '</div>'+
  '</div>';
}

// 1. Ранги техник (rangi)
function renderRefRangi(r, key){
  var rankColors = {
    'E': { bg: 'rgba(160, 174, 192, 0.12)', border: '#718096', text: '#cbd5e0', label: 'Академия' },
    'D': { bg: 'rgba(46, 204, 113, 0.12)',  border: '#27ae60', text: '#2ecc71', label: 'Генин' },
    'C': { bg: 'rgba(52, 152, 219, 0.12)',  border: '#2980b9', text: '#3498db', label: 'Чунин' },
    'B': { bg: 'rgba(155, 89, 182, 0.12)',  border: '#8e44ad', text: '#9b59b6', label: 'Джонин' },
    'A': { bg: 'rgba(230, 126, 34, 0.14)',  border: '#d35400', text: '#e67e22', label: 'Секретная / Род' },
    'S': { bg: 'rgba(231, 76, 60, 0.18)',   border: '#c0392b', text: '#e74c3c', label: 'Вершинная / Легенда' }
  };

  var rankRows = [];
  var ruleRows = [];
  (r.rows || []).forEach(function(row){
    if(rankColors[row.k]) rankRows.push(row);
    else ruleRows.push(row);
  });

  var ladderHtml = '<div class="sh-ladder-wrap">'+
    rankRows.map(function(rk){
      var c = rankColors[rk.k];
      return '<div class="sh-ladder-step" style="background:'+c.bg+';border-color:'+c.border+';">'+
        '<div class="sh-ladder-badge" style="color:'+c.text+';border-color:'+c.border+';">'+
          '<span class="sh-ladder-letter">'+rk.k+'</span>'+
          '<span class="sh-ladder-tag">'+c.label+'</span>'+
        '</div>'+
        '<div class="sh-ladder-desc">'+esc(rk.v)+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  var rulesHtml = '<div class="sh-ref-cards-grid" style="margin-top:20px;">'+
    ruleRows.map(function(rw){
      var isKinjutsu = rw.k.indexOf('Запретные') !== -1;
      var cardBorder = isKinjutsu ? 'var(--crimson-bright)' : 'var(--brass)';
      var cardBg = isKinjutsu ? 'rgba(192, 57, 43, 0.12)' : 'rgba(201, 164, 92, 0.08)';
      return '<div class="sh-ref-card" style="border-color:'+cardBorder+';background:'+cardBg+';">'+
        '<div class="sh-ref-card-k" style="color:'+(isKinjutsu?'#ff7675':'#f6e58d')+';">'+
          (isKinjutsu ? '☠️ ' : '📜 ') + esc(rw.k) +
        '</div>'+
        '<div class="sh-ref-card-v">'+nl2br(rw.v)+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Шкала E–S')+
    '<div class="sh-section-tag">Стела рангов и уровни доступа</div>'+
    ladderHtml +
    '<div class="sh-section-tag" style="margin-top:24px;">Правила разработки, изучения и запретов</div>'+
    rulesHtml +
  '</div>';
}

// 2. Окна возможностей (okna)
function renderRefOkna(r, key){
  var condRows = [];
  var ruleRows = [];
  var condIcons = {
    'СВЯЗАН': '⛓️',
    'ОБЕЗДВИЖЕН': '🪢',
    'ОСЛЕПЛЁН': '👁️‍🗨️',
    'СБИТ': '💥',
    'ДИСТАНЦИЯ': '🏹',
    'НЕЗАМЕЧЕН': '👤'
  };

  (r.rows || []).forEach(function(row){
    if(condIcons[row.k]) condRows.push(row);
    else ruleRows.push(row);
  });

  var condsHtml = '<div class="sh-condition-grid">'+
    condRows.map(function(cr){
      var icon = condIcons[cr.k] || '🎯';
      return '<div class="sh-condition-card">'+
        '<div class="sh-condition-top">'+
          '<span class="sh-condition-icon">'+icon+'</span>'+
          '<span class="sh-condition-name">'+esc(cr.k)+'</span>'+
          '<span class="sh-condition-badge">Окно</span>'+
        '</div>'+
        '<div class="sh-condition-desc">'+esc(cr.v)+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  var rulesIcons = {
    'Длительность': '⏳',
    'Окно тратится': '🎯',
    'Повтор дорожает': '📈',
    'Не складывается': '⛔',
    'Пассивное сопротивление': '🛡️'
  };

  var rulesHtml = '<div class="sh-ref-cards-grid" style="margin-top:16px;">'+
    ruleRows.map(function(rw){
      var ic = rulesIcons[rw.k] || '⚖️';
      return '<div class="sh-ref-card" style="border-left:3px solid var(--brass);">'+
        '<div class="sh-ref-card-k" style="color:#f6e58d;">'+ic+' '+esc(rw.k)+'</div>'+
        '<div class="sh-ref-card-v">'+nl2br(rw.v)+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Тактические состояния')+
    '<div class="sh-section-tag">6 Тактических окон боя</div>'+
    condsHtml +
    '<div class="sh-section-tag" style="margin-top:24px;">5 Законов тайминга и расхода окон</div>'+
    rulesHtml +
  '</div>';
}

// 3. Чакра: расход и восстановление (chakra)
function renderRefChakra(r, key){
  var modes = [];
  var debtRules = [];
  (r.rows || []).forEach(function(rw){
    if(['В бою','Вне боя','Сон','Не идёт'].indexOf(rw.k) !== -1) modes.push(rw);
    else debtRules.push(rw);
  });

  var modeIcons = {
    'В бою': { icon: '⚔️', rate: '+10% / действие', color: '#e67e22' },
    'Вне боя': { icon: '🍃', rate: '+10% / мин', color: '#2ecc71' },
    'Сон': { icon: '💤', rate: '100% за 8ч', color: '#3498db' },
    'Не идёт': { icon: '🚫', rate: '0% (нагрузка)', color: '#e74c3c' }
  };

  var modesHtml = '<div class="sh-chakra-flow-grid">'+
    modes.map(function(m){
      var meta = modeIcons[m.k] || { icon: '🔵', rate: '', color: 'var(--brass)' };
      return '<div class="sh-chakra-flow-card">'+
        '<div class="sh-chakra-flow-top">'+
          '<span class="sh-chakra-flow-icon">'+meta.icon+'</span>'+
          '<div style="flex:1;"><div class="sh-chakra-flow-title">'+esc(m.k)+'</div><div class="sh-chakra-flow-rate" style="color:'+meta.color+';">'+meta.rate+'</div></div>'+
        '</div>'+
        '<div class="sh-chakra-flow-desc">'+esc(m.v)+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  var debtHtml = '<div class="sh-debt-zone-box">'+
    '<div class="sh-debt-zone-head">'+
      '<span style="font-size:20px;">⚠️</span>'+
      '<div>'+
        '<div class="sh-debt-zone-title">Опасная зона: Уход в долг (до -30% пула)</div>'+
        '<div class="sh-debt-zone-sub">Каждая единица долга = -1 хит · Каждые 10% долга = +1 истощение · Превышение -30% = обморок</div>'+
      '</div>'+
    '</div>'+
    '<div class="sh-ref-cards-grid" style="margin-top:16px;">'+
      debtRules.map(function(rw){
        var isPill = rw.k.indexOf('Пилюли') !== -1;
        return '<div class="sh-ref-card" style="border-color:'+(isPill?'#e67e22':'var(--crimson-bright)')+';background:rgba(20,15,15,0.7);">'+
          '<div class="sh-ref-card-k" style="color:'+(isPill?'#f39c12':'#ff7675')+';">'+(isPill?'💊 ':'🩸 ')+esc(rw.k)+'</div>'+
          '<div class="sh-ref-card-v">'+nl2br(rw.v)+'</div>'+
        '</div>';
      }).join('')+
    '</div>'+
  '</div>';

  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Потоки и резервы')+
    '<div class="sh-section-tag">Режимы восстановления пула</div>'+
    modesHtml +
    '<div class="sh-section-tag" style="margin-top:24px;">Предел истощения и цена заёма</div>'+
    debtHtml +
  '</div>';
}

// 4. Дневной лимит техники (scetchik)
function renderRefScetchik(r, key){
  var formulaHtml = '<div class="sh-meter-calc-card">'+
    '<div class="sh-meter-calc-top">'+
      '<span class="sh-meter-calc-icon">⏳</span>'+
      '<div>'+
        '<div class="sh-meter-calc-title">Формула предела тела: 2 базово + 1 за каждые 4 уровня (макс. 6/сут)</div>'+
        '<div class="sh-meter-calc-desc">Счётчик индивидуален для техники. Ограничен не чакрой, а телом: связки, каналы циркуляции, зрение.</div>'+
      '</div>'+
    '</div>'+
  '</div>';

  var stages = [
    { title: '1-е превышение', dmg: '−25% макс. HP', debuff: '+1 уровень истощения', color: '#f39c12', icon: '⚠️' },
    { title: '2-е превышение', dmg: '−50% макс. HP', debuff: '+2 уровня истощения', color: '#e67e22', icon: '🔥' },
    { title: '3-е+ превышение', dmg: '−50% HP + обморок', debuff: 'НЕОБРАТИМЫЕ УВЕЧЬЯ КАНАЛОВ', color: '#e74c3c', icon: '☠️' }
  ];

  var stagesHtml = '<div class="sh-stages-grid">'+
    stages.map(function(st){
      return '<div class="sh-stage-card" style="border-color:'+st.color+';">'+
        '<div class="sh-stage-head" style="color:'+st.color+';">'+
          '<span>'+st.icon+' '+st.title+'</span>'+
        '</div>'+
        '<div class="sh-stage-dmg">'+st.dmg+'</div>'+
        '<div class="sh-stage-debuff">'+st.debuff+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  var otherRules = (r.rows || []).filter(function(rw){
    return rw.k.indexOf('Превышение') === -1;
  });

  var otherHtml = '<div class="sh-ref-cards-grid" style="margin-top:20px;">'+
    otherRules.map(function(rw){
      return '<div class="sh-ref-card">'+
        '<div class="sh-ref-card-k" style="color:var(--brass);">📌 '+esc(rw.k)+'</div>'+
        '<div class="sh-ref-card-v">'+nl2br(rw.v)+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Предел тела')+
    formulaHtml +
    '<div class="sh-section-tag" style="margin-top:20px;">Шкала последствий перегрузки</div>'+
    stagesHtml +
    '<div class="sh-section-tag" style="margin-top:24px;">Правила износа и взаимозачёта</div>'+
    otherHtml +
  '</div>';
}

// 5. Как осваиваются техники (teoriya)
function renderRefTeoriya(r, key){
  var formulaCard = '<div class="sh-formula-banner">'+
    '<div class="sh-formula-equation">'+
      '<span class="sh-form-part">📖 ТЕОРИЯ</span>'+
      '<span class="sh-form-plus">+</span>'+
      '<span class="sh-form-part">🥋 ПРАКТИКА</span>'+
      '<span class="sh-form-eq">=</span>'+
      '<span class="sh-form-res">🌀 ТЕХНИКА</span>'+
    '</div>'+
    '<div class="sh-formula-sub">Нужны оба компонента. Одного недостаточно никогда. Скорость зависит от точности теории и упорства, а не от ранга.</div>'+
  '</div>';

  var pathIcons = {
    'Учитель': { icon: '👨‍🏫', tag: 'Быстрейший путь', speed: 'Высокая', cost: 'Доступ и долг' },
    'Свиток или запись': { icon: '📜', tag: 'Автономия', speed: 'Средняя', cost: 'Деньги / Риск ошибок' },
    'Наблюдение': { icon: '👁️', tag: 'Ослабленная копия', speed: 'Низкая (Додзюцу: мгновенно)', cost: 'Неполнота' },
    'Собственная работа': { icon: '🧠', tag: 'Оригинальный стиль', speed: 'Месяцы фокуса', cost: 'Постоянный фокус' },
    'Практика': { icon: '🥋', tag: 'Фиксация формы', speed: 'Ежедневная', cost: 'Чакра и пот' }
  };

  var cardsHtml = '<div class="sh-paths-grid">'+
    (r.rows || []).map(function(rw){
      var meta = pathIcons[rw.k] || { icon: '💡', tag: 'Метод', speed: '—', cost: '—' };
      return '<div class="sh-path-card">'+
        '<div class="sh-path-head">'+
          '<span class="sh-path-icon">'+meta.icon+'</span>'+
          '<div style="flex:1;"><div class="sh-path-title">'+esc(rw.k)+'</div><div class="sh-path-tag">'+meta.tag+'</div></div>'+
        '</div>'+
        '<div class="sh-path-meta-row">'+
          '<span>Скорость: <b>'+meta.speed+'</b></span>'+
          '<span>Цена: <b>'+meta.cost+'</b></span>'+
        '</div>'+
        '<div class="sh-path-desc">'+nl2br(rw.v)+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Пути познания')+
    formulaCard +
    '<div class="sh-section-tag" style="margin-top:24px;">Источники теории и отработка формы</div>'+
    cardsHtml +
  '</div>';
}

// 6. Категории и происхождение (kategorii)
function renderRefKategorii(r, key){
  var disciplines = [];
  var origins = [];
  (r.rows || []).forEach(function(rw){
    if(rw.k.indexOf('ПРОИСХОЖДЕНИЕ') !== -1) origins.push(rw);
    else disciplines.push(rw);
  });

  var discIcons = {
    'Ниндзюцу': '🌀',
    'Тайдзюцу': '👊',
    'Гендзюцу': '🎭',
    'Додзюцу': '👁️',
    'Додзютцу': '👁️',
    'Фуиндзюцу': '📜',
    'Кендзюцу': '⚔️',
    'Ирьениндзюцу': '💚',
    'Кучиёсэ': '🐸',
    'Сендзюцу': '⛰️'
  };

  var discHtml = '<div class="sh-disc-grid">'+
    disciplines.map(function(rw){
      var ic = discIcons[rw.k] || '✨';
      return '<div class="sh-disc-card">'+
        '<div class="sh-disc-head">'+
          '<span class="sh-disc-icon">'+ic+'</span>'+
          '<span class="sh-disc-name">'+esc(rw.k)+'</span>'+
        '</div>'+
        '<div class="sh-disc-desc">'+esc(rw.v)+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  var originMeta = {
    'ПРОИСХОЖДЕНИЕ — Общая': { title: 'Общая (Базовая)', icon: '⚪', badge: 'Академия' },
    'ПРОИСХОЖДЕНИЕ — Природа чакры': { title: 'Природа чакры', icon: '🌿', badge: 'Сродство' },
    'ПРОИСХОЖДЕНИЕ — Кеккей генкай': { title: 'Кеккей Генкай', icon: '🧬', badge: 'Кровь' },
    'ПРОИСХОЖДЕНИЕ — Хиден': { title: 'Хиден (Клановый секрет)', icon: '🗃️', badge: 'Секретный свиток' }
  };

  var originHtml = '<div class="sh-origin-grid">'+
    origins.map(function(rw){
      var meta = originMeta[rw.k] || { title: rw.k, icon: '📜', badge: 'Происхождение' };
      return '<div class="sh-origin-card">'+
        '<div class="sh-origin-head">'+
          '<span class="sh-origin-icon">'+meta.icon+'</span>'+
          '<div><div class="sh-origin-title">'+esc(meta.title)+'</div><span class="sh-origin-badge">'+meta.badge+'</span></div>'+
        '</div>'+
        '<div class="sh-origin-desc">'+nl2br(rw.v)+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Таксономия дзюцу')+
    '<div class="sh-section-tag">8 Боевых дисциплин мира шиноби</div>'+
    discHtml +
    '<div class="sh-section-tag" style="margin-top:24px;">4 Истока происхождения права на технику</div>'+
    originHtml +
  '</div>';
}

// 7. Клоны (klony)
function renderRefKlony(r, key){
  var massRows = [];
  var advancedRows = [];
  var isAdv = false;
  (r.rows || []).forEach(function(rw){
    if(rw.k.indexOf('КЛАСС 2') !== -1) isAdv = true;
    if(isAdv) advancedRows.push(rw);
    else massRows.push(rw);
  });

  var massHtml = '<div class="sh-clone-class-card" style="border-left:4px solid #3498db;">'+
    '<div class="sh-clone-class-title">👥 КЛАСС 1 — Массовые рои</div>'+
    '<div class="sh-clone-class-sub">Всегда ОДИН участник боя. Единая инициатива, единое действие, общий скалируемый урон. Гибнут от любого удара.</div>'+
    '<div class="sh-ref-cards-grid" style="margin-top:14px;">'+
      massRows.slice(1).map(function(rw){
        var isNum = rw.k.indexOf('Численность') !== -1;
        return '<div class="sh-ref-card" style="background:rgba(255,255,255,0.02);">'+
          '<div class="sh-ref-card-k" style="color:'+(isNum?'#68d391':'#cbd5e0')+';">'+esc(rw.k)+'</div>'+
          '<div class="sh-ref-card-v">'+nl2br(rw.v)+'</div>'+
        '</div>';
      }).join('')+
    '</div>'+
  '</div>';

  var advHtml = '<div class="sh-clone-class-card" style="border-left:4px solid #9b59b6;margin-top:20px;">'+
    '<div class="sh-clone-class-title">👤 КЛАСС 2 — Продвинутые автономные дубли</div>'+
    '<div class="sh-clone-class-sub">Полноценные отдельные бойцы со своими действиями. Теневые возвращают память и опыт, стихийные взрываются или связывают.</div>'+
    '<div class="sh-ref-cards-grid" style="margin-top:14px;">'+
      advancedRows.slice(1).map(function(rw){
        return '<div class="sh-ref-card" style="background:rgba(255,255,255,0.02);">'+
          '<div class="sh-ref-card-k" style="color:#d6bcfa;">'+esc(rw.k)+'</div>'+
          '<div class="sh-ref-card-v">'+nl2br(rw.v)+'</div>'+
        '</div>';
      }).join('')+
    '</div>'+
  '</div>';

  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Экономика тел')+
    massHtml +
    advHtml +
  '</div>';
}

// 8. Ранги миссий (missii)
function renderRefMissii(r, key){
  var missionColors = {
    'D': { color: '#2ecc71', bg: 'rgba(46,204,113,0.1)', req: 'Генины', risk: 'Быт и охрана в деревне' },
    'C': { color: '#3498db', bg: 'rgba(52,152,219,0.1)', req: 'Генины / Чунины', risk: 'Разбойники, звери, вне деревни' },
    'B': { color: '#9b59b6', bg: 'rgba(155,89,182,0.1)', req: 'Чунины / Джонины', risk: 'Вражеские шиноби, шпионаж' },
    'A': { color: '#e67e22', bg: 'rgba(230,126,34,0.1)', req: 'Джонины / АНБУ', risk: 'Ликвидация джонинов, межгосударственные' },
    'S': { color: '#e74c3c', bg: 'rgba(231,76,60,0.15)', req: 'Элита / Каге', risk: 'Угроза деревне, нукенины S-ранга' }
  };

  var mCards = [];
  var payRow = null;
  (r.rows || []).forEach(function(rw){
    if(missionColors[rw.k]) mCards.push(rw);
    else payRow = rw;
  });

  var boardHtml = '<div class="sh-mission-board">'+
    mCards.map(function(mc){
      var c = missionColors[mc.k];
      return '<div class="sh-mission-card" style="border-color:'+c.color+';background:'+c.bg+';">'+
        '<div class="sh-mission-head">'+
          '<span class="sh-mission-rank" style="background:'+c.color+';">'+mc.k+'</span>'+
          '<div style="flex:1;">'+
            '<div class="sh-mission-req">Допуск: <b>'+c.req+'</b></div>'+
            '<div class="sh-mission-risk" style="color:'+c.color+';">'+c.risk+'</div>'+
          '</div>'+
        '</div>'+
        '<div class="sh-mission-desc">'+nl2br(mc.v)+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  var payHtml = payRow ? ('<div class="sh-ref-card" style="margin-top:20px;border-color:var(--brass);background:rgba(201,164,92,0.08);">'+
    '<div class="sh-ref-card-k" style="color:#f6e58d;">💰 '+esc(payRow.k)+'</div>'+
    '<div class="sh-ref-card-v">'+nl2br(payRow.v)+'</div>'+
  '</div>') : '';

  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Доска заказов')+
    '<div class="sh-section-tag">Классификация миссий деревни</div>'+
    boardHtml +
    payHtml +
  '</div>';
}

// 9. Служба и ранги (sluzhba) & Академия (akademiya)
function renderRefSluzhba(r, key){
  var rankIcons = {
    'Ученик Академии': '🎓',
    'Генин': '🔰',
    'Чунин': '🛡️',
    'Токубецу-джонин': '⚔️',
    'Джонин': '👑',
    'АНБУ': '🎭',
    'Каге': '🌟',
    'Нукенин': '🩸',
    'Отряды': '👥'
  };

  var listHtml = '<div class="sh-service-ladder">'+
    (r.rows || []).map(function(rw, idx){
      var ic = rankIcons[rw.k] || '🥷';
      var isNuke = rw.k === 'Нукенин';
      var isKage = rw.k === 'Каге';
      var border = isNuke ? '#e74c3c' : (isKage ? 'var(--brass)' : 'rgba(255,255,255,0.12)');
      return '<div class="sh-service-card" style="border-left:4px solid '+border+';">'+
        '<div class="sh-service-top">'+
          '<span class="sh-service-icon">'+ic+'</span>'+
          '<span class="sh-service-title">'+esc(rw.k)+'</span>'+
          '<span class="sh-service-step">Ступень '+(idx+1)+'</span>'+
        '</div>'+
        '<div class="sh-service-desc">'+nl2br(rw.v)+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Иерархия скрытой деревни')+
    listHtml +
  '</div>';
}

// 10. Академия (akademiya)
function renderRefAkademiya(r, key){
  var baseJutsu = [];
  var rules = [];
  (r.rows || []).forEach(function(rw){
    if(rw.k.indexOf('но Дзюцу') !== -1) baseJutsu.push(rw);
    else rules.push(rw);
  });

  var jutsuHtml = '<div class="sh-condition-grid">'+
    baseJutsu.map(function(bj){
      return '<div class="sh-condition-card" style="border-color:var(--brass);">'+
        '<div class="sh-condition-top">'+
          '<span class="sh-condition-icon">📜</span>'+
          '<span class="sh-condition-name" style="font-size:13px;">'+esc(bj.k)+'</span>'+
        '</div>'+
        '<div class="sh-condition-desc">'+nl2br(bj.v)+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  var rulesHtml = '<div class="sh-ref-cards-grid" style="margin-top:16px;">'+
    rules.map(function(rw){
      return '<div class="sh-ref-card">'+
        '<div class="sh-ref-card-k" style="color:var(--brass);">🎓 '+esc(rw.k)+'</div>'+
        '<div class="sh-ref-card-v">'+nl2br(rw.v)+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Школа ниндзя')+
    '<div class="sh-section-tag">Три обязательных академических дзюцу</div>'+
    jutsuHtml +
    '<div class="sh-section-tag" style="margin-top:24px;">Стандарты выпуска и распределение</div>'+
    rulesHtml +
  '</div>';
}

// 11. Приёмы (taidzu) & Защита (zashita)
function renderRefTaidzu(r, key){
  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Боевые искусства')+
    '<div class="sh-ref-cards-grid">'+
      (r.rows || []).map(function(rw){
        var isFive = rw.k.indexOf('ПЯТЬ ВИДОВ') !== -1;
        return '<div class="sh-ref-card" style="'+(isFive?'border-color:var(--brass);grid-column:1/-1;':'')+'">'+
          '<div class="sh-ref-card-k" style="color:'+(isFive?'#f6e58d':'var(--accent)')+';">👊 '+esc(rw.k)+'</div>'+
          '<div class="sh-ref-card-v">'+nl2br(rw.v)+'</div>'+
        '</div>';
      }).join('')+
    '</div>'+
  '</div>';
}

function renderRefZashita(r, key){
  var reactIcons = {
    'Глухой блок': '🛡️',
    'Уворот': '💨',
    'Парирование оружием': '⚔️',
    'Защитная техника': '🌀',
    'Атака гендзюцу': '👁️',
    'Бросок защиты': '🎲',
    'Реакция': '⚡',
    'Каварими': '🪵',
    'Гендзюцу — развеивание': '✨'
  };

  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Реакции и выживание')+
    '<div class="sh-condition-grid">'+
      (r.rows || []).map(function(rw){
        var ic = reactIcons[rw.k] || '🛡️';
        return '<div class="sh-condition-card">'+
          '<div class="sh-condition-top">'+
            '<span class="sh-condition-icon">'+ic+'</span>'+
            '<span class="sh-condition-name">'+esc(rw.k)+'</span>'+
          '</div>'+
          '<div class="sh-condition-desc">'+nl2br(rw.v)+'</div>'+
        '</div>';
      }).join('')+
    '</div>'+
  '</div>';
}

// 12. Поражение (porazhenie) & Допрос (dopros)
function renderRefPorazhenie(r, key){
  var prices = [];
  var tactics = [];
  (r.rows || []).forEach(function(rw){
    if(rw.k.indexOf('ЦЕНА') !== -1) prices.push(rw);
    else tactics.push(rw);
  });

  var tacticsHtml = '<div class="sh-ref-cards-grid">'+
    tactics.map(function(rw){
      return '<div class="sh-ref-card" style="border-left:3px solid var(--crimson-bright);">'+
        '<div class="sh-ref-card-k" style="color:#ff7675;">🩸 '+esc(rw.k)+'</div>'+
        '<div class="sh-ref-card-v">'+nl2br(rw.v)+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  var pricesHtml = '<div class="sh-condition-grid" style="margin-top:16px;">'+
    prices.map(function(rw){
      return '<div class="sh-condition-card" style="border-color:#e67e22;">'+
        '<div class="sh-condition-top">'+
          '<span class="sh-condition-icon">⚖️</span>'+
          '<span class="sh-condition-name">'+esc(rw.k)+'</span>'+
        '</div>'+
        '<div class="sh-condition-desc">'+nl2br(rw.v)+'</div>'+
      '</div>';
    }).join('')+
  '</div>';

  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Травмы и цена поражения')+
    '<div class="sh-section-tag">Тактический расклад при 0 HP</div>'+
    tacticsHtml +
    '<div class="sh-section-tag" style="margin-top:24px;">7 Видов цены за жизнь</div>'+
    pricesHtml +
  '</div>';
}

function renderRefDopros(r, key){
  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Протоколы допроса АНБУ')+
    '<div class="sh-ref-cards-grid">'+
      (r.rows || []).map(function(rw){
        var isBreak = rw.k.indexOf('СЛОМ') !== -1 || rw.k.indexOf('ТРЕЩИНА') !== -1;
        return '<div class="sh-ref-card" style="border-color:'+(isBreak?'var(--crimson-bright)':'var(--line)')+';">'+
          '<div class="sh-ref-card-k" style="color:'+(isBreak?'#ff7675':'#f6e58d')+';">🔒 '+esc(rw.k)+'</div>'+
          '<div class="sh-ref-card-v">'+nl2br(rw.v)+'</div>'+
        '</div>';
      }).join('')+
    '</div>'+
  '</div>';
}

// 13. Навыки и знания (navyki)
function renderRefNavyki(r, key){
  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Ремёсла и быт')+
    '<div class="sh-ref-cards-grid">'+
      (r.rows || []).map(function(rw){
        var isLvl = rw.k.indexOf('УРОВНИ') !== -1;
        return '<div class="sh-ref-card" style="'+(isLvl?'grid-column:1/-1;border-color:var(--brass);background:rgba(201,164,92,0.06);':'')+'">'+
          '<div class="sh-ref-card-k" style="color:'+(isLvl?'#f6e58d':'var(--accent)')+';">🛠️ '+esc(rw.k)+'</div>'+
          '<div class="sh-ref-card-v">'+nl2br(rw.v)+'</div>'+
        '</div>';
      }).join('')+
    '</div>'+
  '</div>';
}

// 14. Страны (mir) & Отношения (otnosheniya)
function renderRefMir(r, key){
  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Геополитика')+
    '<div class="sh-ref-cards-grid">'+
      (r.rows || []).map(function(rw){
        return '<div class="sh-ref-card">'+
          '<div class="sh-ref-card-k" style="color:#68d391;">🗺️ '+esc(rw.k)+'</div>'+
          '<div class="sh-ref-card-v">'+nl2br(rw.v)+'</div>'+
        '</div>';
      }).join('')+
    '</div>'+
  '</div>';
}

function renderRefOtnosheniya(r, key){
  return '<div class="sh-ref-box">'+
    renderRefHeader(r, key, 'Узы и репутация')+
    '<div class="sh-ref-cards-grid">'+
      (r.rows || []).map(function(rw){
        return '<div class="sh-ref-card">'+
          '<div class="sh-ref-card-k" style="color:#f687b3;">🤝 '+esc(rw.k)+'</div>'+
          '<div class="sh-ref-card-v">'+nl2br(rw.v)+'</div>'+
        '</div>';
      }).join('')+
    '</div>'+
  '</div>';
}




function shRef(){
  var searchVal = (typeof SH !== 'undefined' && SH.refSearch) ? SH.refSearch.toLowerCase().trim() : '';

  var sections = [
    {
      group: '🌀 Чакра и техники',
      color: 'var(--brass)',
      items: [
        { nav: 'shRefView:priroda', icon: '🌿', t: 'Природы чакры', tag: 'Мандала', d: 'Интерактивная диаграмма 5 стихий, 8 слияний, Тота и Инь-Ян' },
        { nav: 'shRefView:rangi', icon: '📶', t: 'Ранги техник', tag: 'Шкала E–S', d: 'Стела рангов от Академии до Вершинных, требования и цепочки разработки' },
        { nav: 'shRefView:kategorii', icon: '🗂️', t: 'Категории и истоки', tag: '9 дисциплин', d: 'Ниндзюцу, тайдзюцу, гендзюцу, додзюцу, печати + 4 истока права на технику' },
        { nav: 'shRefView:teoriya', icon: '📖', t: 'Как осваиваются техники', tag: 'Пути познания', d: 'Теория + практика, 4 пути изучения (учитель, свиток, наблюдение, опыт)' },
        { nav: 'shRefView:chakra', icon: '🔵', t: 'Чакра: расход и восстановление', tag: 'Потоки чакры', d: 'Восстановление в бою, покое и во сне. Опасная зона долга до −30% и пилюли' },
        { nav: 'shRefView:scetchik', icon: '⏳', t: 'Дневной лимит техники', tag: 'Предел тела', d: 'Формула предела тела (2+1/4 ур.) и 3 стадии физической перегрузки' }
      ]
    },
    {
      group: '⚔️ Бой и тактика',
      color: 'var(--crimson-bright)',
      items: [
        { nav: 'shRefView:okna', icon: '🎯', t: 'Окна возможностей', tag: '6 состояний', d: 'Тактические окна боя (связан, сбит, ослеплён) и 5 правил их расхода' },
        { nav: 'shRefView:taidzu', icon: '👊', t: 'Приёмы: кости и виды', tag: 'Тайдзюцу', d: '5 видов приёмов, пул костей мастерства и рукопашное превосходство' },
        { nav: 'shRefView:zashita', icon: '🛡️', t: 'Защита и уклонение', tag: 'Реакции', d: 'Блок, парирование клинком, уворот, каварими и развеивание гендзюцу' },
        { nav: 'shRefView:klony', icon: '👥', t: 'Клоны', tag: 'Экономика тел', d: 'Массовые рои с бонусами численности против автономных теневых дублей' }
      ]
    },
    {
      group: '🥷 Мир шиноби и служба',
      color: '#68d391',
      items: [
        { nav: 'shMap', icon: '🗺️', t: 'Интерактивная карта мира', tag: 'Векторный атлас', d: '46 государств, скрытые деревни, подсветка и тактический лор' },
        { nav: 'shRefView:sluzhba', icon: '🎖️', t: 'Служба и ранги', tag: 'Иерархия', d: 'Лестница званий: Академик → Генин → Чунин → Джонин → АНБУ → Каге' },
        { nav: 'shRefView:missii', icon: '📜', t: 'Ранги миссий', tag: 'Доска заказов', d: 'Градация заданий от D до S, распределение оплаты и зоны опасности' },
        { nav: 'shRefView:akademiya', icon: '🎓', t: 'Академия', tag: 'Основа', d: '3 выпускных дзюцу (Хенге, Буншин, Каварими) и экзаменационные нормативы' },
        { nav: 'shRefView:porazhenie', icon: '🩸', t: 'Поражение и травмы', tag: '0 HP', d: 'Спасброски, тактический расклад при 0 хитов и 7 видов цены за жизнь' },
        { nav: 'shRefView:dopros', icon: '🔒', t: 'Давление, допрос и плен', tag: 'Протоколы АНБУ', d: '6 методов допроса, трещина воли, слом и защита от утечки секретов' },
        { nav: 'shRefView:mir', icon: '🏯', t: 'Страны и деревни', tag: 'Геополитика', d: 'Великая Пятёрка, баланс даймё, малые буферные страны и денежная система' },
        { nav: 'shRefView:otnosheniya', icon: '🤝', t: 'Отношения и репутация', tag: 'Узы', d: 'Стадии уз, угасание, взаимность и 4 слоя репутации шиноби' }
      ]
    },
    {
      group: '🛠️ Мастерство и ремесло',
      color: '#f6ad55',
      items: [
        { nav: 'shRefView:navyki', icon: '🛠️', t: 'Навыки и знания', tag: '5 ступеней', d: 'Ступени мастерства (начатки → мастер), право знать без броска и ремесло' }
      ]
    },
    {
      group: '⌨️ Инструменты мастера',
      color: '#b794f4',
      items: [
        { nav: 'shCmds', icon: '⌨️', t: 'Кнопки мастера (к1–к8)', tag: 'Пульт команд', d: 'Интерактивный пульт команд: темп, монтаж, сверка, рутина, допрос' }
      ]
    }
  ];

  var html = crumbSh([{label:'Шиноби',nav:'home'},{label:'Справочник'}])+
    '<button class="back" data-nav="home">← Назад</button>'+
    '<div class="sh-ref-header">'+
      '<h1 style="margin-bottom:6px;">📚 Справочник шиноби</h1>'+
      '<div class="sh-ref-lead">Тактический свод правил, рангов, чакры, законов мира и боевой механики скрытых деревень.</div>'+
      '<div class="sh-ref-search-wrap">'+
        '<span class="sh-ref-search-icon">🔍</span>'+
        '<input type="text" id="shRefSearch" class="sh-ref-search-input" placeholder="Быстрый поиск по справочнику (ранги, чакра, клоны, миссии, окна...)" value="'+escA(searchVal)+'">'+
      '</div>'+
    '</div>';

  var totalFound = 0;

  sections.forEach(function(sec){
    var filteredItems = sec.items.filter(function(it){
      if(!searchVal) return true;
      var haystack = (it.t + ' ' + it.d + ' ' + (it.tag||'')).toLowerCase();
      return haystack.indexOf(searchVal) !== -1;
    });

    if(filteredItems.length === 0) return;
    totalFound += filteredItems.length;

    html += '<div class="sh-ref-group-block">'+
      '<div class="sh-ref-group-title" style="border-left:3px solid '+sec.color+';">'+
        '<span>'+sec.group+'</span>'+
        '<span class="sh-ref-group-count">'+filteredItems.length+'</span>'+
      '</div>'+
      '<div class="menu-list grid-2">'+
        filteredItems.map(function(it){
          return '<div class="menu-item" data-nav="'+it.nav+'" style="position:relative;">'+
            '<div>'+
              '<div class="name" style="display:flex;align-items:center;gap:8px;">'+
                it.icon + ' ' + esc(it.t) +
                (it.tag ? '<span class="sh-ref-item-tag">'+esc(it.tag)+'</span>' : '')+
              '</div>'+
              '<div class="desc">'+esc(it.d)+'</div>'+
            '</div>'+
            '<div class="arrow">›</div>'+
          '</div>';
        }).join('')+
      '</div>'+
    '</div>';
  });

  if(totalFound === 0 && searchVal){
    html += '<div class="char-empty" style="margin-top:24px;">По запросу «' + esc(searchVal) + '» ничего не найдено. Попробуйте другой термин.</div>';
  }

  return html;
}

function shRefView(){
  var r = REF[view.shKey]; if(!r) return shRef();
  var crumb = crumbSh([{label:'Шиноби',nav:'home'},{label:'Справочник',nav:'shRef'},{label:r.t}])+
    '<button class="back" data-nav="shRef">← Назад</button>';

  if(view.shKey === 'priroda'){
    return crumb + renderElementWheel();
  }

  var rendererMap = {
    'rangi': renderRefRangi,
    'okna': renderRefOkna,
    'chakra': renderRefChakra,
    'scetchik': renderRefScetchik,
    'teoriya': renderRefTeoriya,
    'kategorii': renderRefKategorii,
    'klony': renderRefKlony,
    'missii': renderRefMissii,
    'sluzhba': renderRefSluzhba,
    'akademiya': renderRefAkademiya,
    'taidzu': renderRefTaidzu,
    'zashita': renderRefZashita,
    'porazhenie': renderRefPorazhenie,
    'dopros': renderRefDopros,
    'navyki': renderRefNavyki,
    'mir': renderRefMir,
    'otnosheniya': renderRefOtnosheniya
  };

  var fn = rendererMap[view.shKey] || renderRefGeneric;
  return crumb + fn(r, view.shKey);
}

/* ---------- Интерактивная карта мира шиноби ---------- */
var SH_NEUTRAL_REGIONS = [[[254.0, 112.6], [252.2, 111.8], [240.3, 112.1], [233.2, 115.1], [229.1, 115.3], [227.0, 116.3], [223.3, 120.8], [221.6, 121.6], [214.7, 122.6], [211.3, 119.8], [207.2, 119.8], [204.4, 121.1], [200.2, 121.4], [196.3, 124.3], [188.2, 126.8], [190.4, 130.3], [189.0, 134.3], [190.8, 135.7], [190.4, 138.6], [189.4, 139.2], [189.8, 140.3], [188.8, 140.8], [188.9, 146.1], [194.7, 150.8], [196.3, 151.0], [205.8, 147.2], [210.8, 143.9], [223.2, 138.9], [229.0, 135.1], [242.7, 131.1], [246.4, 126.7], [246.1, 123.7], [247.7, 119.9], [249.4, 117.8], [254.0, 115.0], [254.0, 112.6]], [[183.2, 125.8], [179.0, 128.0], [172.1, 135.2], [175.0, 138.8], [175.4, 142.6], [177.3, 144.2], [178.9, 149.2], [176.9, 156.4], [172.9, 162.3], [172.9, 163.4], [174.7, 164.3], [178.3, 163.4], [183.1, 158.3], [195.1, 151.2], [189.0, 145.6], [189.2, 141.7], [188.6, 141.1], [189.7, 140.6], [189.2, 139.3], [190.1, 139.0], [191.1, 136.1], [189.3, 134.2], [189.3, 133.0], [190.8, 130.2], [188.4, 127.4], [183.2, 125.8]], [[242.4, 131.2], [238.6, 131.6], [228.6, 135.0], [226.2, 137.1], [210.7, 143.7], [205.8, 146.8], [205.7, 151.9], [212.3, 155.7], [211.2, 156.8], [205.6, 157.8], [207.9, 164.9], [209.4, 165.9], [219.8, 162.1], [220.8, 158.7], [234.1, 151.2], [236.6, 149.0], [242.3, 140.9], [240.3, 136.1], [242.6, 133.2], [242.4, 131.2]], [[273.1, 144.0], [270.8, 147.0], [271.2, 148.6], [268.6, 148.7], [268.0, 149.9], [270.2, 164.3], [272.1, 165.4], [278.9, 161.9], [281.4, 163.4], [285.2, 170.3], [288.9, 170.8], [293.9, 168.0], [293.6, 165.4], [289.3, 160.3], [288.6, 157.1], [286.0, 153.4], [283.8, 152.1], [282.4, 148.2], [275.7, 142.9], [273.1, 144.0]], [[894.6, 159.6], [893.7, 163.1], [895.1, 165.0], [895.4, 167.4], [900.2, 167.8], [902.9, 166.9], [905.3, 168.2], [908.0, 167.8], [914.4, 171.2], [916.3, 169.7], [915.6, 167.9], [915.9, 165.3], [911.8, 160.1], [909.2, 160.9], [908.0, 159.2], [905.0, 159.0], [901.0, 160.0], [898.6, 157.7], [894.6, 159.6]], [[118.6, 162.9], [114.3, 165.6], [111.1, 166.0], [106.3, 173.3], [106.0, 177.6], [106.8, 181.3], [102.1, 181.8], [96.6, 186.9], [95.0, 190.8], [93.4, 191.9], [93.4, 194.4], [91.7, 197.4], [91.7, 200.7], [97.2, 207.6], [97.2, 211.0], [101.4, 215.7], [102.2, 219.4], [103.7, 221.0], [107.0, 222.7], [112.4, 223.7], [118.2, 226.7], [121.7, 230.1], [122.1, 232.0], [123.4, 232.2], [123.9, 234.3], [123.1, 235.4], [124.9, 236.8], [125.7, 239.4], [127.4, 239.3], [129.6, 241.6], [131.8, 240.9], [136.1, 241.2], [137.1, 243.8], [140.7, 246.2], [140.7, 243.9], [138.1, 241.7], [138.6, 240.4], [139.9, 240.8], [140.4, 237.4], [138.9, 237.0], [140.1, 236.0], [141.2, 237.6], [143.4, 238.3], [144.7, 237.3], [146.7, 238.0], [147.0, 237.1], [144.2, 235.3], [142.4, 232.2], [140.8, 231.4], [140.2, 232.4], [139.1, 232.3], [141.2, 230.2], [140.6, 229.0], [144.1, 230.0], [145.2, 227.0], [150.1, 228.1], [150.2, 229.0], [153.9, 231.0], [154.9, 228.9], [154.3, 227.4], [155.7, 225.6], [157.1, 225.3], [157.2, 224.3], [160.0, 224.3], [161.1, 222.1], [164.2, 223.3], [164.0, 221.4], [159.4, 218.8], [161.2, 218.1], [162.0, 216.3], [163.0, 216.3], [165.1, 213.6], [166.8, 213.4], [166.7, 215.0], [167.9, 215.3], [169.7, 213.9], [168.8, 212.4], [170.2, 213.0], [171.8, 211.8], [171.9, 207.9], [169.8, 205.8], [172.7, 204.6], [176.9, 195.8], [177.1, 193.0], [181.4, 190.7], [181.6, 189.9], [175.3, 184.0], [169.1, 190.9], [166.0, 190.9], [161.9, 186.6], [155.4, 185.2], [153.4, 183.7], [149.2, 182.6], [147.0, 179.9], [145.4, 176.1], [136.6, 170.2], [134.7, 161.4], [124.9, 163.9], [118.6, 162.9]], [[891.9, 166.2], [886.0, 170.2], [880.7, 179.3], [881.3, 181.0], [878.1, 183.1], [889.6, 188.9], [891.1, 188.4], [891.3, 185.6], [893.1, 182.1], [891.7, 169.7], [892.6, 166.7], [891.9, 166.2]], [[893.9, 168.9], [893.3, 170.3], [894.4, 183.6], [893.0, 186.1], [892.7, 189.0], [891.2, 190.3], [887.6, 190.2], [887.2, 191.4], [891.0, 193.8], [890.7, 207.4], [892.0, 214.9], [893.7, 217.6], [894.0, 220.0], [897.4, 219.9], [900.3, 217.9], [903.9, 217.8], [906.6, 220.2], [908.1, 223.1], [913.6, 224.6], [915.6, 226.2], [921.0, 226.3], [922.1, 227.4], [921.9, 234.0], [924.0, 238.8], [924.2, 242.3], [925.4, 244.9], [926.3, 245.0], [926.6, 241.6], [929.9, 237.8], [930.9, 233.9], [931.3, 226.1], [930.0, 224.3], [930.0, 220.3], [934.3, 215.4], [933.7, 211.0], [937.3, 201.3], [936.0, 199.2], [935.7, 192.7], [931.6, 188.7], [931.6, 184.8], [930.1, 184.3], [924.1, 178.2], [921.4, 177.3], [918.7, 178.8], [915.8, 178.7], [914.3, 176.9], [914.6, 172.9], [907.3, 169.7], [893.9, 168.9]], [[917.1, 171.1], [915.8, 175.3], [916.2, 177.0], [917.9, 177.2], [921.1, 175.2], [925.2, 176.4], [927.1, 179.6], [931.8, 183.1], [932.8, 182.6], [932.9, 180.9], [930.6, 177.1], [928.9, 172.1], [923.1, 169.3], [917.1, 171.1]], [[230.2, 185.6], [230.1, 196.2], [237.1, 202.4], [238.4, 204.9], [258.8, 195.6], [258.6, 194.8], [255.1, 193.9], [248.8, 190.1], [246.0, 192.1], [243.8, 192.9], [242.7, 192.4], [239.0, 188.7], [236.7, 187.6], [237.4, 182.0], [236.8, 179.9], [234.3, 179.9], [230.2, 185.6]], [[875.4, 187.9], [866.7, 198.8], [861.0, 208.4], [856.2, 220.1], [853.9, 234.8], [856.9, 236.6], [861.8, 237.2], [868.2, 242.1], [875.3, 244.2], [884.2, 248.9], [887.7, 243.3], [888.4, 237.2], [891.0, 234.3], [891.7, 229.4], [893.8, 223.4], [890.3, 215.8], [888.6, 202.6], [889.6, 200.1], [888.3, 197.8], [889.1, 194.4], [886.3, 193.7], [885.7, 195.9], [883.3, 197.2], [882.6, 195.7], [883.8, 192.9], [882.7, 190.9], [885.2, 190.9], [885.4, 189.8], [882.4, 188.2], [876.8, 188.6], [875.4, 187.9]], [[268.2, 191.4], [265.6, 192.8], [263.6, 195.6], [270.0, 206.4], [267.3, 210.4], [267.1, 217.0], [268.0, 220.1], [270.2, 223.2], [271.8, 220.0], [273.4, 220.1], [274.2, 215.3], [275.9, 215.9], [277.8, 208.3], [284.0, 210.1], [284.9, 209.1], [283.7, 208.1], [288.9, 208.7], [289.4, 207.4], [287.8, 206.6], [292.7, 206.9], [293.0, 206.0], [290.9, 203.7], [285.0, 201.6], [278.9, 202.7], [277.3, 199.7], [277.1, 196.4], [273.3, 193.3], [268.2, 191.4]], [[279.0, 197.6], [280.0, 200.7], [286.2, 199.9], [291.4, 201.8], [295.2, 205.9], [294.8, 209.1], [295.4, 209.6], [297.8, 208.2], [301.3, 200.2], [301.0, 197.0], [292.8, 195.9], [290.2, 193.8], [283.0, 193.6], [279.0, 197.6]], [[901.4, 219.7], [898.8, 221.8], [896.6, 221.7], [893.6, 223.4], [891.3, 229.4], [890.7, 234.3], [887.8, 238.4], [887.3, 243.3], [884.4, 249.1], [888.2, 252.8], [892.7, 259.9], [894.6, 265.6], [893.2, 268.1], [894.4, 270.8], [900.3, 275.9], [904.0, 278.0], [907.0, 278.6], [913.8, 286.7], [916.1, 288.3], [919.4, 286.7], [921.0, 277.0], [922.4, 274.7], [922.6, 272.1], [921.1, 269.0], [921.8, 261.2], [925.2, 249.3], [923.7, 247.8], [923.7, 245.1], [922.0, 242.0], [922.3, 239.7], [920.6, 238.4], [921.1, 236.0], [919.8, 235.0], [920.1, 229.0], [917.8, 227.9], [916.3, 228.2], [916.0, 233.1], [913.0, 230.7], [913.1, 226.6], [908.9, 225.4], [908.1, 227.4], [909.8, 229.6], [908.4, 229.1], [906.7, 227.0], [906.6, 224.2], [903.6, 219.7], [901.4, 219.7]], [[853.8, 235.1], [852.6, 240.9], [852.1, 249.9], [855.1, 251.1], [856.9, 250.9], [858.0, 252.1], [862.0, 252.2], [863.1, 255.3], [869.0, 258.0], [871.7, 258.0], [873.3, 259.4], [880.9, 260.3], [884.6, 262.2], [887.9, 265.4], [892.9, 268.0], [893.9, 267.8], [894.9, 265.6], [893.0, 259.8], [888.7, 252.8], [885.6, 249.6], [875.8, 244.1], [868.7, 242.0], [862.0, 237.0], [853.8, 235.1]], [[826.7, 236.9], [825.3, 241.9], [830.4, 247.7], [833.2, 249.2], [834.9, 248.4], [834.9, 245.2], [836.4, 243.6], [840.8, 247.2], [839.0, 249.3], [840.6, 253.8], [843.2, 253.3], [850.0, 256.3], [854.4, 254.8], [854.8, 250.7], [850.3, 249.3], [842.4, 245.2], [840.6, 243.1], [835.8, 241.3], [833.1, 238.7], [826.7, 236.9]], [[919.3, 287.1], [913.0, 289.6], [910.7, 291.8], [906.3, 293.8], [902.6, 298.6], [897.2, 302.0], [895.3, 305.7], [887.2, 308.1], [879.8, 312.8], [874.9, 318.1], [874.3, 325.9], [879.1, 326.4], [884.8, 329.0], [888.7, 328.6], [890.9, 330.3], [895.9, 328.1], [898.1, 329.7], [906.1, 327.1], [909.6, 324.9], [911.1, 322.6], [915.7, 322.4], [919.2, 319.6], [921.4, 319.3], [924.6, 313.0], [921.6, 301.4], [921.2, 296.2], [919.3, 292.9], [919.3, 287.1]]];

var SH_MAP_DATA = [{"id": "fire", "name": "Страна Огня", "shortName": "Огонь", "kanji": "火の国", "color": "#c0392b", "accent": "#e74c3c", "type": "great", "village": {"name": "Конохагакуре", "title": "Деревня Скрытого Листа (Хокаге)", "symbol": "🍃", "x": 599.0, "y": 306.0, "symbolImg": "symbols/village/Konohagakure_Symbol.webp"}, "kage": "Хокаге", "nature": "Стихия Огня (火遁)", "clans": "Учиха, Сенджу, Сарутоби, Хьюга, Нара, Акимачи, Яманака, Абураме, Инузука", "terrain": "Бескрайние леса, умеренный тёплый климат, плодородные долины и полноводные реки.", "military": "АНБУ Конохи, 12 Ниндзя-Защитников Даймё, Военная полиция.", "danger": "Умеренная (пограничные заставы, регулярные патрули на главных трактах).", "lore": "Центральная и наиболее влиятельная держава континента. Обладает мощнейшей скрытой деревней и богатыми ресурсами, из-за чего исторически становилась главным полем битвы в мировых войнах шиноби.", "labelPoint": {"x": 580.1, "y": 290.6}, "points": [[548.3, 256.1], [544.4, 260.3], [542.2, 261.2], [538.2, 266.8], [540.0, 269.7], [540.1, 275.7], [541.8, 277.9], [540.8, 284.2], [544.7, 288.6], [544.0, 292.3], [541.0, 295.8], [540.6, 301.8], [543.9, 305.9], [543.6, 310.3], [546.7, 312.0], [548.9, 314.9], [553.6, 314.6], [557.8, 318.9], [564.8, 321.3], [567.2, 324.8], [568.9, 329.9], [575.3, 337.6], [576.9, 341.3], [578.7, 363.2], [577.0, 367.1], [575.1, 377.0], [582.7, 374.9], [588.7, 372.0], [590.0, 366.2], [594.1, 362.9], [595.4, 359.4], [598.0, 357.9], [598.4, 356.0], [600.8, 354.6], [610.0, 356.1], [613.9, 355.8], [616.4, 356.8], [621.2, 355.1], [624.6, 355.8], [632.6, 355.1], [635.4, 353.9], [639.2, 354.8], [644.2, 354.1], [647.6, 355.4], [651.4, 358.6], [654.9, 358.8], [656.1, 359.9], [656.2, 362.7], [653.7, 367.1], [649.7, 368.8], [647.2, 372.0], [644.0, 372.6], [641.1, 374.2], [638.2, 377.8], [635.0, 379.3], [634.3, 382.6], [631.1, 386.1], [631.2, 388.2], [630.1, 390.4], [630.1, 392.1], [631.4, 393.9], [630.8, 396.6], [625.7, 400.2], [623.3, 400.7], [620.1, 404.2], [617.1, 405.1], [614.9, 408.0], [610.4, 410.1], [609.7, 413.3], [611.4, 420.4], [613.1, 422.2], [617.6, 422.7], [623.4, 421.8], [627.8, 422.9], [633.8, 421.8], [635.1, 419.0], [639.7, 414.2], [642.0, 413.0], [645.2, 413.0], [649.2, 410.1], [650.2, 408.7], [651.3, 402.1], [655.9, 398.9], [657.4, 396.7], [659.9, 396.0], [661.8, 394.0], [661.8, 388.6], [664.9, 387.3], [668.6, 384.0], [668.7, 381.9], [671.4, 377.1], [673.9, 375.6], [676.4, 371.3], [678.3, 370.2], [680.3, 367.3], [683.3, 366.7], [685.2, 365.0], [687.2, 361.3], [692.8, 359.6], [697.8, 354.6], [707.1, 354.8], [710.1, 353.7], [714.9, 354.2], [717.8, 352.9], [719.9, 350.2], [722.0, 349.2], [722.6, 347.1], [720.2, 342.6], [720.6, 339.4], [719.6, 338.2], [715.9, 337.0], [711.9, 337.0], [702.7, 339.7], [697.7, 339.0], [689.0, 345.3], [686.6, 344.2], [678.4, 347.7], [674.8, 346.9], [673.0, 348.0], [668.0, 348.6], [663.8, 345.7], [662.6, 342.7], [665.3, 338.6], [665.4, 333.9], [666.6, 332.9], [668.6, 333.0], [671.6, 329.2], [669.1, 327.1], [668.6, 324.7], [672.9, 318.9], [673.3, 314.4], [674.9, 311.3], [673.8, 307.9], [669.6, 301.8], [665.4, 299.4], [664.9, 294.9], [662.8, 290.3], [662.3, 287.2], [656.8, 282.2], [655.2, 279.2], [651.3, 275.1], [649.6, 274.7], [647.0, 272.2], [644.7, 273.1], [638.8, 272.6], [636.8, 271.6], [636.1, 268.3], [633.7, 265.2], [633.2, 260.0], [627.4, 260.8], [624.4, 259.9], [621.9, 260.4], [614.7, 257.0], [609.2, 259.0], [601.9, 259.8], [598.1, 258.7], [593.2, 255.0], [591.0, 254.3], [588.6, 254.7], [585.4, 256.9], [574.6, 256.1], [571.2, 257.3], [564.7, 257.1], [562.9, 258.1], [559.1, 255.6], [548.3, 256.1]], "polygons": [[[548.3, 256.1], [544.4, 260.3], [542.2, 261.2], [538.2, 266.8], [540.0, 269.7], [540.1, 275.7], [541.8, 277.9], [540.8, 284.2], [544.7, 288.6], [544.0, 292.3], [541.0, 295.8], [540.6, 301.8], [543.9, 305.9], [543.6, 310.3], [546.7, 312.0], [548.9, 314.9], [553.6, 314.6], [557.8, 318.9], [564.8, 321.3], [567.2, 324.8], [568.9, 329.9], [575.3, 337.6], [576.9, 341.3], [578.7, 363.2], [577.0, 367.1], [575.1, 377.0], [582.7, 374.9], [588.7, 372.0], [590.0, 366.2], [594.1, 362.9], [595.4, 359.4], [598.0, 357.9], [598.4, 356.0], [600.8, 354.6], [610.0, 356.1], [613.9, 355.8], [616.4, 356.8], [621.2, 355.1], [624.6, 355.8], [632.6, 355.1], [635.4, 353.9], [639.2, 354.8], [644.2, 354.1], [647.6, 355.4], [651.4, 358.6], [654.9, 358.8], [656.1, 359.9], [656.2, 362.7], [653.7, 367.1], [649.7, 368.8], [647.2, 372.0], [644.0, 372.6], [641.1, 374.2], [638.2, 377.8], [635.0, 379.3], [634.3, 382.6], [631.1, 386.1], [631.2, 388.2], [630.1, 390.4], [630.1, 392.1], [631.4, 393.9], [630.8, 396.6], [625.7, 400.2], [623.3, 400.7], [620.1, 404.2], [617.1, 405.1], [614.9, 408.0], [610.4, 410.1], [609.7, 413.3], [611.4, 420.4], [613.1, 422.2], [617.6, 422.7], [623.4, 421.8], [627.8, 422.9], [633.8, 421.8], [635.1, 419.0], [639.7, 414.2], [642.0, 413.0], [645.2, 413.0], [649.2, 410.1], [650.2, 408.7], [651.3, 402.1], [655.9, 398.9], [657.4, 396.7], [659.9, 396.0], [661.8, 394.0], [661.8, 388.6], [664.9, 387.3], [668.6, 384.0], [668.7, 381.9], [671.4, 377.1], [673.9, 375.6], [676.4, 371.3], [678.3, 370.2], [680.3, 367.3], [683.3, 366.7], [685.2, 365.0], [687.2, 361.3], [692.8, 359.6], [697.8, 354.6], [707.1, 354.8], [710.1, 353.7], [714.9, 354.2], [717.8, 352.9], [719.9, 350.2], [722.0, 349.2], [722.6, 347.1], [720.2, 342.6], [720.6, 339.4], [719.6, 338.2], [715.9, 337.0], [711.9, 337.0], [702.7, 339.7], [697.7, 339.0], [689.0, 345.3], [686.6, 344.2], [678.4, 347.7], [674.8, 346.9], [673.0, 348.0], [668.0, 348.6], [663.8, 345.7], [662.6, 342.7], [665.3, 338.6], [665.4, 333.9], [666.6, 332.9], [668.6, 333.0], [671.6, 329.2], [669.1, 327.1], [668.6, 324.7], [672.9, 318.9], [673.3, 314.4], [674.9, 311.3], [673.8, 307.9], [669.6, 301.8], [665.4, 299.4], [664.9, 294.9], [662.8, 290.3], [662.3, 287.2], [656.8, 282.2], [655.2, 279.2], [651.3, 275.1], [649.6, 274.7], [647.0, 272.2], [644.7, 273.1], [638.8, 272.6], [636.8, 271.6], [636.1, 268.3], [633.7, 265.2], [633.2, 260.0], [627.4, 260.8], [624.4, 259.9], [621.9, 260.4], [614.7, 257.0], [609.2, 259.0], [601.9, 259.8], [598.1, 258.7], [593.2, 255.0], [591.0, 254.3], [588.6, 254.7], [585.4, 256.9], [574.6, 256.1], [571.2, 257.3], [564.7, 257.1], [562.9, 258.1], [559.1, 255.6], [548.3, 256.1]]], "symbolImg": "symbols/country/Fire.webp"}, {"id": "wind", "name": "Страна Ветра", "shortName": "Ветер", "kanji": "風の国", "color": "#d4a373", "accent": "#e9c46a", "type": "great", "village": {"name": "Сунагакуре", "title": "Деревня Скрытого Песка (Казекаге)", "symbol": "⏳", "x": 445, "y": 385, "symbolImg": "symbols/village/Sunagakure_Symbol.webp"}, "kage": "Казекаге", "nature": "Стихия Ветра (風遁)", "clans": "Казекаге, Широгане, Хоки", "terrain": "Суровые пустыни, каменистые каньоны, песчаные бури, редкие оазисы.", "military": "Корпус марионеточников Суны, отряды дальнего боя вееров, штурмовые отряды песка.", "danger": "Высокая (экстремальный климат, дефицит воды, песчаные бури).", "lore": "Обширная, но засушливая держава на юго-западе. Из-за скудости почв исторически вела ожесточённую борьбу за плодородные земли и водные ресурсы.", "labelPoint": {"x": 436.6, "y": 320.3}, "points": [[443.0, 266.7], [439.2, 269.7], [434.1, 271.8], [430.4, 271.2], [426.9, 272.0], [425.0, 273.4], [420.9, 273.6], [412.4, 277.3], [409.6, 280.4], [407.6, 280.9], [401.6, 286.4], [399.7, 287.0], [397.9, 285.6], [396.0, 286.1], [392.0, 289.9], [390.3, 290.1], [386.6, 293.0], [384.0, 295.9], [382.1, 296.4], [378.7, 293.7], [374.9, 293.1], [371.2, 296.7], [368.3, 298.0], [366.9, 300.0], [367.1, 308.1], [366.4, 309.4], [372.6, 313.0], [374.0, 314.9], [374.6, 322.1], [373.4, 324.7], [373.4, 328.8], [370.7, 334.7], [367.8, 336.9], [366.8, 340.1], [362.6, 343.2], [351.3, 358.9], [348.3, 361.8], [346.4, 365.8], [344.0, 375.7], [339.7, 378.9], [335.6, 383.6], [329.2, 384.3], [321.8, 388.0], [316.0, 388.9], [309.6, 391.4], [306.3, 393.9], [303.7, 398.6], [296.0, 402.8], [294.9, 404.9], [298.3, 410.2], [304.3, 414.3], [305.0, 422.2], [307.0, 423.7], [307.2, 424.8], [309.8, 425.8], [315.9, 432.8], [325.7, 438.6], [334.9, 440.0], [345.4, 443.8], [352.9, 443.0], [366.6, 443.3], [370.9, 447.2], [376.1, 449.6], [379.6, 454.6], [384.0, 455.8], [393.6, 455.6], [406.2, 450.4], [413.9, 449.2], [421.7, 445.7], [428.1, 446.3], [430.8, 450.3], [438.6, 455.0], [447.9, 464.4], [452.9, 473.2], [453.3, 479.6], [457.0, 484.2], [462.1, 485.9], [466.3, 486.0], [470.9, 484.1], [483.0, 472.8], [488.9, 473.4], [497.7, 471.0], [501.9, 466.6], [510.0, 462.9], [511.9, 459.0], [511.1, 455.7], [513.1, 453.0], [513.4, 450.4], [512.1, 447.2], [510.2, 445.2], [510.4, 443.2], [507.1, 436.4], [506.2, 430.7], [505.2, 429.1], [504.7, 420.8], [507.4, 413.1], [509.4, 410.6], [511.8, 409.2], [510.2, 415.8], [510.1, 420.7], [513.4, 428.1], [515.0, 429.7], [519.0, 430.7], [520.9, 429.2], [524.4, 428.4], [532.6, 422.8], [537.3, 412.4], [542.7, 406.2], [544.0, 400.7], [544.1, 395.8], [546.1, 391.7], [544.6, 387.6], [544.9, 382.4], [543.8, 377.2], [540.4, 373.1], [535.6, 370.0], [534.2, 367.6], [537.0, 358.2], [536.4, 355.4], [538.6, 352.3], [538.9, 345.0], [537.9, 342.6], [538.4, 339.1], [536.0, 334.8], [536.6, 331.9], [530.8, 325.0], [528.9, 316.4], [527.3, 313.4], [527.1, 307.8], [520.2, 305.1], [518.8, 301.9], [515.6, 299.7], [511.6, 298.9], [509.4, 297.2], [504.7, 296.7], [499.4, 294.2], [496.8, 294.3], [492.3, 291.7], [483.9, 290.7], [478.3, 286.3], [476.0, 286.1], [475.2, 284.9], [469.1, 284.0], [463.0, 279.8], [462.0, 276.7], [456.0, 272.7], [453.8, 272.3], [449.0, 267.2], [443.0, 266.7]], "polygons": [[[443.0, 266.7], [439.2, 269.7], [434.1, 271.8], [430.4, 271.2], [426.9, 272.0], [425.0, 273.4], [420.9, 273.6], [412.4, 277.3], [409.6, 280.4], [407.6, 280.9], [401.6, 286.4], [399.7, 287.0], [397.9, 285.6], [396.0, 286.1], [392.0, 289.9], [390.3, 290.1], [386.6, 293.0], [384.0, 295.9], [382.1, 296.4], [378.7, 293.7], [374.9, 293.1], [371.2, 296.7], [368.3, 298.0], [366.9, 300.0], [367.1, 308.1], [366.4, 309.4], [372.6, 313.0], [374.0, 314.9], [374.6, 322.1], [373.4, 324.7], [373.4, 328.8], [370.7, 334.7], [367.8, 336.9], [366.8, 340.1], [362.6, 343.2], [351.3, 358.9], [348.3, 361.8], [346.4, 365.8], [344.0, 375.7], [339.7, 378.9], [335.6, 383.6], [329.2, 384.3], [321.8, 388.0], [316.0, 388.9], [309.6, 391.4], [306.3, 393.9], [303.7, 398.6], [296.0, 402.8], [294.9, 404.9], [298.3, 410.2], [304.3, 414.3], [305.0, 422.2], [307.0, 423.7], [307.2, 424.8], [309.8, 425.8], [315.9, 432.8], [325.7, 438.6], [334.9, 440.0], [345.4, 443.8], [352.9, 443.0], [366.6, 443.3], [370.9, 447.2], [376.1, 449.6], [379.6, 454.6], [384.0, 455.8], [393.6, 455.6], [406.2, 450.4], [413.9, 449.2], [421.7, 445.7], [428.1, 446.3], [430.8, 450.3], [438.6, 455.0], [447.9, 464.4], [452.9, 473.2], [453.3, 479.6], [457.0, 484.2], [462.1, 485.9], [466.3, 486.0], [470.9, 484.1], [483.0, 472.8], [488.9, 473.4], [497.7, 471.0], [501.9, 466.6], [510.0, 462.9], [511.9, 459.0], [511.1, 455.7], [513.1, 453.0], [513.4, 450.4], [512.1, 447.2], [510.2, 445.2], [510.4, 443.2], [507.1, 436.4], [506.2, 430.7], [505.2, 429.1], [504.7, 420.8], [507.4, 413.1], [509.4, 410.6], [511.8, 409.2], [510.2, 415.8], [510.1, 420.7], [513.4, 428.1], [515.0, 429.7], [519.0, 430.7], [520.9, 429.2], [524.4, 428.4], [532.6, 422.8], [537.3, 412.4], [542.7, 406.2], [544.0, 400.7], [544.1, 395.8], [546.1, 391.7], [544.6, 387.6], [544.9, 382.4], [543.8, 377.2], [540.4, 373.1], [535.6, 370.0], [534.2, 367.6], [537.0, 358.2], [536.4, 355.4], [538.6, 352.3], [538.9, 345.0], [537.9, 342.6], [538.4, 339.1], [536.0, 334.8], [536.6, 331.9], [530.8, 325.0], [528.9, 316.4], [527.3, 313.4], [527.1, 307.8], [520.2, 305.1], [518.8, 301.9], [515.6, 299.7], [511.6, 298.9], [509.4, 297.2], [504.7, 296.7], [499.4, 294.2], [496.8, 294.3], [492.3, 291.7], [483.9, 290.7], [478.3, 286.3], [476.0, 286.1], [475.2, 284.9], [469.1, 284.0], [463.0, 279.8], [462.0, 276.7], [456.0, 272.7], [453.8, 272.3], [449.0, 267.2], [443.0, 266.7]]], "symbolImg": "symbols/country/wind.png"}, {"id": "earth", "name": "Страна Земли", "shortName": "Земля", "kanji": "土の国", "color": "#8c6d62", "accent": "#a1887f", "type": "great", "village": {"name": "Ивагакуре", "title": "Деревня Скрытого Камня (Цучикаге)", "symbol": "⛰️", "x": 435, "y": 165, "symbolImg": "symbols/village/Iwagakure_Symbol.webp"}, "kage": "Цучикаге", "nature": "Стихия Земли (土遁)", "clans": "Камизуру, взрывной корпус Ива", "terrain": "Неприступные скалистые хребты, глубокие ущелья, высокогорные плато.", "military": "Корпус подрывников (Бакутон), тяжёлая каменная пехота, диверсионные группы.", "danger": "Высокая (камнепады, сложная горная навигация, жёсткая граница).", "lore": "Северная континентальная крепость. Скалистый рельеф делает её естественной неприступной твердыней с мощнейшим военным духом.", "labelPoint": {"x": 497.3, "y": 226.8}, "points": [[564.8, 193.9], [562.9, 192.0], [559.6, 192.1], [557.4, 189.7], [553.1, 191.8], [551.3, 190.1], [548.8, 189.7], [545.7, 191.7], [543.7, 194.3], [540.3, 195.1], [538.3, 193.0], [536.4, 193.3], [534.6, 190.6], [532.0, 190.2], [531.8, 188.7], [530.6, 187.8], [530.2, 183.8], [528.4, 182.3], [528.2, 179.4], [531.2, 175.6], [531.1, 173.6], [532.1, 172.9], [532.4, 170.6], [535.6, 166.8], [533.3, 163.9], [535.9, 158.2], [535.3, 155.4], [536.7, 152.6], [535.2, 146.3], [533.7, 145.3], [532.2, 139.1], [530.2, 136.6], [529.0, 130.8], [528.1, 129.6], [525.0, 128.2], [519.3, 127.8], [513.6, 124.4], [504.6, 123.6], [500.1, 121.0], [491.6, 120.4], [487.9, 116.8], [484.9, 115.4], [478.9, 115.3], [475.4, 117.1], [470.4, 117.1], [467.3, 118.7], [456.1, 118.9], [447.9, 120.7], [439.6, 120.3], [437.3, 119.3], [432.7, 121.2], [424.3, 123.0], [420.1, 126.7], [409.6, 129.4], [404.4, 135.6], [401.9, 140.8], [393.0, 146.9], [378.2, 146.3], [373.0, 144.6], [368.6, 140.7], [366.3, 143.2], [358.0, 143.4], [356.9, 144.1], [357.0, 148.2], [355.6, 151.1], [355.7, 152.8], [352.4, 157.3], [339.8, 163.8], [337.0, 168.2], [338.2, 170.7], [342.8, 173.0], [344.9, 173.1], [347.6, 171.8], [350.3, 172.7], [353.8, 177.2], [364.8, 185.1], [365.2, 187.8], [363.2, 194.0], [365.7, 197.3], [365.0, 200.9], [366.3, 202.9], [367.0, 212.6], [368.2, 214.3], [368.3, 218.6], [369.8, 220.4], [368.9, 224.6], [365.2, 223.6], [363.0, 226.1], [363.4, 229.3], [362.0, 236.6], [363.2, 239.6], [363.1, 244.7], [364.9, 247.8], [368.6, 246.2], [370.3, 247.1], [370.8, 246.2], [376.6, 245.9], [382.4, 244.1], [385.1, 244.4], [388.8, 246.3], [391.3, 246.3], [394.0, 244.1], [402.2, 246.0], [405.0, 245.1], [408.9, 247.4], [414.2, 247.9], [416.3, 250.0], [421.7, 251.0], [427.2, 250.8], [431.1, 249.4], [433.4, 250.2], [443.8, 250.2], [446.3, 249.2], [454.7, 249.1], [456.0, 250.3], [458.6, 256.9], [462.0, 258.2], [465.3, 264.2], [467.9, 265.6], [470.6, 268.6], [476.9, 270.6], [485.3, 269.9], [489.9, 271.1], [493.0, 270.0], [498.6, 270.1], [511.4, 266.7], [517.9, 266.4], [522.0, 264.9], [528.4, 260.4], [531.8, 256.1], [543.0, 247.4], [544.7, 243.8], [544.2, 231.8], [545.9, 228.3], [549.6, 224.4], [549.0, 218.1], [551.2, 213.8], [552.9, 212.8], [557.1, 203.4], [559.1, 202.8], [564.4, 196.9], [564.8, 193.9]], "polygons": [[[564.8, 193.9], [562.9, 192.0], [559.6, 192.1], [557.4, 189.7], [553.1, 191.8], [551.3, 190.1], [548.8, 189.7], [545.7, 191.7], [543.7, 194.3], [540.3, 195.1], [538.3, 193.0], [536.4, 193.3], [534.6, 190.6], [532.0, 190.2], [531.8, 188.7], [530.6, 187.8], [530.2, 183.8], [528.4, 182.3], [528.2, 179.4], [531.2, 175.6], [531.1, 173.6], [532.1, 172.9], [532.4, 170.6], [535.6, 166.8], [533.3, 163.9], [535.9, 158.2], [535.3, 155.4], [536.7, 152.6], [535.2, 146.3], [533.7, 145.3], [532.2, 139.1], [530.2, 136.6], [529.0, 130.8], [528.1, 129.6], [525.0, 128.2], [519.3, 127.8], [513.6, 124.4], [504.6, 123.6], [500.1, 121.0], [491.6, 120.4], [487.9, 116.8], [484.9, 115.4], [478.9, 115.3], [475.4, 117.1], [470.4, 117.1], [467.3, 118.7], [456.1, 118.9], [447.9, 120.7], [439.6, 120.3], [437.3, 119.3], [432.7, 121.2], [424.3, 123.0], [420.1, 126.7], [409.6, 129.4], [404.4, 135.6], [401.9, 140.8], [393.0, 146.9], [378.2, 146.3], [373.0, 144.6], [368.6, 140.7], [366.3, 143.2], [358.0, 143.4], [356.9, 144.1], [357.0, 148.2], [355.6, 151.1], [355.7, 152.8], [352.4, 157.3], [339.8, 163.8], [337.0, 168.2], [338.2, 170.7], [342.8, 173.0], [344.9, 173.1], [347.6, 171.8], [350.3, 172.7], [353.8, 177.2], [364.8, 185.1], [365.2, 187.8], [363.2, 194.0], [365.7, 197.3], [365.0, 200.9], [366.3, 202.9], [367.0, 212.6], [368.2, 214.3], [368.3, 218.6], [369.8, 220.4], [368.9, 224.6], [365.2, 223.6], [363.0, 226.1], [363.4, 229.3], [362.0, 236.6], [363.2, 239.6], [363.1, 244.7], [364.9, 247.8], [368.6, 246.2], [370.3, 247.1], [370.8, 246.2], [376.6, 245.9], [382.4, 244.1], [385.1, 244.4], [388.8, 246.3], [391.3, 246.3], [394.0, 244.1], [402.2, 246.0], [405.0, 245.1], [408.9, 247.4], [414.2, 247.9], [416.3, 250.0], [421.7, 251.0], [427.2, 250.8], [431.1, 249.4], [433.4, 250.2], [443.8, 250.2], [446.3, 249.2], [454.7, 249.1], [456.0, 250.3], [458.6, 256.9], [462.0, 258.2], [465.3, 264.2], [467.9, 265.6], [470.6, 268.6], [476.9, 270.6], [485.3, 269.9], [489.9, 271.1], [493.0, 270.0], [498.6, 270.1], [511.4, 266.7], [517.9, 266.4], [522.0, 264.9], [528.4, 260.4], [531.8, 256.1], [543.0, 247.4], [544.7, 243.8], [544.2, 231.8], [545.9, 228.3], [549.6, 224.4], [549.0, 218.1], [551.2, 213.8], [552.9, 212.8], [557.1, 203.4], [559.1, 202.8], [564.4, 196.9], [564.8, 193.9]]], "symbolImg": "symbols/country/ground.webp"}, {"id": "lightning", "name": "Страна Молнии", "shortName": "Молния", "kanji": "雷の国", "color": "#f1c40f", "accent": "#f39c12", "type": "great", "village": {"name": "Кумогакуре", "title": "Деревня Скрытого Облака (Райкаге)", "symbol": "⚡", "x": 743, "y": 141, "symbolImg": "symbols/village/Kumogakure_Symbol.webp"}, "kage": "Райкаге", "nature": "Стихия Молнии (雷遁)", "clans": "Йоцуки, Чиноике", "terrain": "Высокогорные хребты, уходящие в облака, морские заливы, грозовые фронты.", "military": "Штурмовики Молниевого Тайдзюцу, мечники Кумо, передовые оружейные лаборатории.", "danger": "Высокая (высокогорье, грозы, милитаризованные патрули).", "lore": "Северо-восточный полуостров с серповидным рогом. Гордая милитаризованная держава с непреклонной дисциплиной и жаждой технологического превосходства.", "labelPoint": {"x": 742.6, "y": 141.0}, "points": [[594.2, 4.6], [592.7, 6.9], [592.0, 10.6], [596.8, 16.4], [599.1, 17.1], [601.4, 21.4], [603.1, 21.3], [604.6, 23.6], [609.4, 25.0], [612.2, 27.8], [615.1, 28.2], [616.7, 30.2], [632.2, 37.6], [633.8, 37.4], [636.8, 39.6], [639.2, 39.6], [644.2, 42.9], [647.0, 43.4], [647.8, 45.1], [651.6, 46.7], [653.8, 51.6], [657.9, 55.3], [657.9, 56.6], [660.2, 58.6], [660.2, 59.9], [665.0, 64.3], [673.3, 67.4], [681.8, 72.6], [681.4, 73.4], [685.0, 76.0], [686.0, 78.1], [685.6, 80.0], [688.6, 83.0], [688.7, 84.1], [694.3, 88.4], [697.2, 88.9], [697.2, 91.3], [698.3, 93.2], [701.2, 95.6], [700.8, 99.6], [704.4, 107.3], [710.8, 116.1], [712.6, 126.0], [711.6, 126.7], [711.6, 131.2], [708.9, 135.6], [710.2, 143.9], [709.9, 148.9], [707.8, 152.6], [706.3, 153.4], [706.7, 156.1], [705.3, 160.1], [702.7, 163.0], [702.8, 166.7], [703.6, 167.8], [702.8, 168.4], [703.4, 170.6], [702.7, 171.3], [703.7, 172.7], [701.9, 174.2], [701.4, 176.2], [698.7, 176.1], [696.9, 178.2], [696.9, 179.4], [695.0, 180.3], [694.6, 181.8], [693.0, 182.8], [693.6, 185.6], [696.1, 186.7], [691.6, 189.6], [694.4, 196.2], [691.6, 196.7], [687.6, 200.3], [685.9, 200.1], [684.6, 202.0], [682.4, 202.3], [681.6, 201.7], [681.1, 203.3], [678.3, 203.1], [677.7, 204.1], [678.9, 205.3], [678.8, 208.6], [675.1, 209.8], [673.0, 209.2], [671.3, 209.9], [668.7, 214.8], [665.1, 215.0], [664.3, 217.2], [660.8, 221.7], [661.3, 229.1], [662.8, 232.2], [670.1, 236.4], [669.9, 240.9], [671.7, 243.8], [677.2, 244.6], [677.8, 243.3], [683.8, 243.7], [685.4, 245.1], [689.2, 245.2], [693.3, 243.7], [694.8, 242.1], [701.0, 242.3], [701.6, 243.2], [700.7, 244.4], [702.4, 246.6], [706.7, 248.2], [709.3, 247.3], [711.4, 244.3], [717.4, 244.7], [723.4, 240.0], [724.4, 237.4], [731.0, 236.7], [733.4, 234.4], [744.8, 234.4], [746.8, 233.7], [749.6, 230.2], [753.3, 228.7], [754.0, 229.1], [753.7, 233.8], [759.2, 235.3], [760.8, 234.9], [762.3, 232.4], [764.8, 231.7], [768.3, 232.0], [769.8, 230.6], [769.8, 229.3], [773.2, 228.3], [776.4, 224.7], [778.9, 215.6], [782.2, 212.3], [782.3, 210.2], [782.2, 206.6], [781.2, 205.0], [781.9, 203.2], [780.7, 199.7], [780.7, 192.3], [778.9, 188.4], [779.4, 182.9], [776.6, 179.1], [774.9, 174.6], [772.7, 172.2], [770.4, 165.6], [771.9, 162.3], [771.2, 160.9], [772.1, 159.0], [773.8, 158.2], [772.8, 157.9], [774.2, 155.8], [773.7, 151.8], [775.1, 151.4], [775.8, 148.6], [775.1, 147.7], [776.6, 145.0], [776.0, 144.3], [774.9, 144.8], [776.3, 142.6], [775.2, 138.6], [777.6, 135.7], [777.1, 131.8], [778.4, 130.6], [778.8, 129.2], [778.1, 128.9], [779.2, 127.0], [778.4, 126.3], [778.6, 121.3], [777.4, 121.4], [777.2, 120.0], [776.4, 119.9], [777.7, 115.2], [775.9, 114.8], [776.2, 113.2], [774.3, 111.6], [774.8, 110.9], [773.4, 109.1], [774.1, 108.8], [775.2, 110.0], [778.2, 107.9], [777.3, 106.8], [776.7, 108.2], [775.7, 108.0], [774.9, 106.8], [775.4, 105.6], [774.2, 103.9], [771.9, 103.4], [772.0, 101.6], [773.9, 100.6], [770.4, 97.4], [770.1, 93.8], [769.1, 93.4], [767.9, 89.8], [764.9, 89.3], [766.4, 86.7], [765.8, 86.6], [766.0, 85.0], [764.8, 82.0], [763.2, 81.7], [764.3, 80.7], [763.3, 79.8], [762.8, 80.8], [761.8, 79.2], [760.6, 79.2], [760.8, 78.1], [758.2, 74.2], [756.7, 75.0], [755.1, 72.6], [756.3, 70.9], [755.6, 70.6], [755.4, 69.0], [754.2, 70.3], [753.7, 70.0], [753.6, 68.2], [752.6, 67.9], [751.4, 64.6], [750.1, 66.4], [750.0, 68.1], [751.2, 69.1], [750.3, 70.3], [749.6, 64.9], [748.8, 64.8], [749.3, 63.4], [750.9, 63.3], [750.2, 62.2], [746.8, 60.8], [746.2, 59.0], [744.1, 59.4], [742.9, 55.2], [741.9, 56.2], [739.8, 55.2], [739.8, 54.1], [737.0, 52.0], [735.7, 52.1], [733.6, 50.8], [732.0, 47.8], [730.3, 47.7], [727.6, 45.4], [727.4, 43.8], [726.6, 43.7], [726.6, 44.7], [725.2, 44.0], [723.2, 41.3], [724.1, 40.6], [720.6, 40.2], [721.2, 39.3], [719.1, 37.3], [717.3, 38.3], [716.3, 36.4], [717.2, 35.3], [716.2, 35.8], [712.6, 33.3], [710.6, 35.4], [709.8, 34.0], [710.7, 32.8], [706.7, 31.8], [708.9, 31.4], [708.7, 29.9], [707.4, 30.3], [704.8, 28.0], [703.2, 29.4], [702.1, 28.2], [700.6, 28.4], [700.4, 26.2], [698.8, 25.3], [697.6, 25.4], [698.4, 27.3], [696.7, 27.4], [694.7, 24.9], [694.9, 22.9], [693.6, 23.3], [690.6, 21.1], [690.7, 19.1], [688.8, 18.2], [686.6, 19.0], [685.0, 17.9], [683.2, 18.4], [682.9, 17.7], [683.6, 18.0], [684.0, 17.2], [682.2, 16.7], [680.4, 18.0], [680.3, 16.7], [678.9, 16.6], [678.7, 15.7], [677.6, 16.0], [676.3, 14.3], [671.9, 13.9], [670.9, 12.2], [669.9, 12.8], [665.3, 10.3], [664.1, 11.0], [662.4, 10.2], [658.2, 10.3], [657.8, 9.3], [654.6, 9.6], [653.8, 11.4], [653.6, 9.7], [651.7, 8.1], [650.7, 8.4], [650.8, 7.3], [649.6, 7.8], [649.9, 8.9], [647.1, 8.2], [646.7, 9.4], [644.3, 7.4], [645.0, 9.0], [644.4, 9.3], [643.3, 7.9], [640.8, 7.1], [640.3, 8.0], [638.8, 8.0], [636.0, 6.6], [631.9, 6.0], [631.1, 5.1], [632.2, 4.4], [631.1, 3.2], [630.8, 4.4], [627.9, 6.7], [627.1, 5.4], [623.2, 6.7], [621.8, 6.1], [621.6, 5.1], [620.7, 6.0], [618.7, 5.4], [615.4, 6.0], [613.0, 5.1], [611.9, 5.8], [611.2, 4.7], [602.0, 5.8], [596.9, 4.1], [595.3, 5.1], [594.2, 4.6]], "polygons": [[[594.2, 4.6], [592.7, 6.9], [592.0, 10.6], [596.8, 16.4], [599.1, 17.1], [601.4, 21.4], [603.1, 21.3], [604.6, 23.6], [609.4, 25.0], [612.2, 27.8], [615.1, 28.2], [616.7, 30.2], [632.2, 37.6], [633.8, 37.4], [636.8, 39.6], [639.2, 39.6], [644.2, 42.9], [647.0, 43.4], [647.8, 45.1], [651.6, 46.7], [653.8, 51.6], [657.9, 55.3], [657.9, 56.6], [660.2, 58.6], [660.2, 59.9], [665.0, 64.3], [673.3, 67.4], [681.8, 72.6], [681.4, 73.4], [685.0, 76.0], [686.0, 78.1], [685.6, 80.0], [688.6, 83.0], [688.7, 84.1], [694.3, 88.4], [697.2, 88.9], [697.2, 91.3], [698.3, 93.2], [701.2, 95.6], [700.8, 99.6], [704.4, 107.3], [710.8, 116.1], [712.6, 126.0], [711.6, 126.7], [711.6, 131.2], [708.9, 135.6], [710.2, 143.9], [709.9, 148.9], [707.8, 152.6], [706.3, 153.4], [706.7, 156.1], [705.3, 160.1], [702.7, 163.0], [702.8, 166.7], [703.6, 167.8], [702.8, 168.4], [703.4, 170.6], [702.7, 171.3], [703.7, 172.7], [701.9, 174.2], [701.4, 176.2], [698.7, 176.1], [696.9, 178.2], [696.9, 179.4], [695.0, 180.3], [694.6, 181.8], [693.0, 182.8], [693.6, 185.6], [696.1, 186.7], [691.6, 189.6], [694.4, 196.2], [691.6, 196.7], [687.6, 200.3], [685.9, 200.1], [684.6, 202.0], [682.4, 202.3], [681.6, 201.7], [681.1, 203.3], [678.3, 203.1], [677.7, 204.1], [678.9, 205.3], [678.8, 208.6], [675.1, 209.8], [673.0, 209.2], [671.3, 209.9], [668.7, 214.8], [665.1, 215.0], [664.3, 217.2], [660.8, 221.7], [661.3, 229.1], [662.8, 232.2], [670.1, 236.4], [669.9, 240.9], [671.7, 243.8], [677.2, 244.6], [677.8, 243.3], [683.8, 243.7], [685.4, 245.1], [689.2, 245.2], [693.3, 243.7], [694.8, 242.1], [701.0, 242.3], [701.6, 243.2], [700.7, 244.4], [702.4, 246.6], [706.7, 248.2], [709.3, 247.3], [711.4, 244.3], [717.4, 244.7], [723.4, 240.0], [724.4, 237.4], [731.0, 236.7], [733.4, 234.4], [744.8, 234.4], [746.8, 233.7], [749.6, 230.2], [753.3, 228.7], [754.0, 229.1], [753.7, 233.8], [759.2, 235.3], [760.8, 234.9], [762.3, 232.4], [764.8, 231.7], [768.3, 232.0], [769.8, 230.6], [769.8, 229.3], [773.2, 228.3], [776.4, 224.7], [778.9, 215.6], [782.2, 212.3], [782.3, 210.2], [782.2, 206.6], [781.2, 205.0], [781.9, 203.2], [780.7, 199.7], [780.7, 192.3], [778.9, 188.4], [779.4, 182.9], [776.6, 179.1], [774.9, 174.6], [772.7, 172.2], [770.4, 165.6], [771.9, 162.3], [771.2, 160.9], [772.1, 159.0], [773.8, 158.2], [772.8, 157.9], [774.2, 155.8], [773.7, 151.8], [775.1, 151.4], [775.8, 148.6], [775.1, 147.7], [776.6, 145.0], [776.0, 144.3], [774.9, 144.8], [776.3, 142.6], [775.2, 138.6], [777.6, 135.7], [777.1, 131.8], [778.4, 130.6], [778.8, 129.2], [778.1, 128.9], [779.2, 127.0], [778.4, 126.3], [778.6, 121.3], [777.4, 121.4], [777.2, 120.0], [776.4, 119.9], [777.7, 115.2], [775.9, 114.8], [776.2, 113.2], [774.3, 111.6], [774.8, 110.9], [773.4, 109.1], [774.1, 108.8], [775.2, 110.0], [778.2, 107.9], [777.3, 106.8], [776.7, 108.2], [775.7, 108.0], [774.9, 106.8], [775.4, 105.6], [774.2, 103.9], [771.9, 103.4], [772.0, 101.6], [773.9, 100.6], [770.4, 97.4], [770.1, 93.8], [769.1, 93.4], [767.9, 89.8], [764.9, 89.3], [766.4, 86.7], [765.8, 86.6], [766.0, 85.0], [764.8, 82.0], [763.2, 81.7], [764.3, 80.7], [763.3, 79.8], [762.8, 80.8], [761.8, 79.2], [760.6, 79.2], [760.8, 78.1], [758.2, 74.2], [756.7, 75.0], [755.1, 72.6], [756.3, 70.9], [755.6, 70.6], [755.4, 69.0], [754.2, 70.3], [753.7, 70.0], [753.6, 68.2], [752.6, 67.9], [751.4, 64.6], [750.1, 66.4], [750.0, 68.1], [751.2, 69.1], [750.3, 70.3], [749.6, 64.9], [748.8, 64.8], [749.3, 63.4], [750.9, 63.3], [750.2, 62.2], [746.8, 60.8], [746.2, 59.0], [744.1, 59.4], [742.9, 55.2], [741.9, 56.2], [739.8, 55.2], [739.8, 54.1], [737.0, 52.0], [735.7, 52.1], [733.6, 50.8], [732.0, 47.8], [730.3, 47.7], [727.6, 45.4], [727.4, 43.8], [726.6, 43.7], [726.6, 44.7], [725.2, 44.0], [723.2, 41.3], [724.1, 40.6], [720.6, 40.2], [721.2, 39.3], [719.1, 37.3], [717.3, 38.3], [716.3, 36.4], [717.2, 35.3], [716.2, 35.8], [712.6, 33.3], [710.6, 35.4], [709.8, 34.0], [710.7, 32.8], [706.7, 31.8], [708.9, 31.4], [708.7, 29.9], [707.4, 30.3], [704.8, 28.0], [703.2, 29.4], [702.1, 28.2], [700.6, 28.4], [700.4, 26.2], [698.8, 25.3], [697.6, 25.4], [698.4, 27.3], [696.7, 27.4], [694.7, 24.9], [694.9, 22.9], [693.6, 23.3], [690.6, 21.1], [690.7, 19.1], [688.8, 18.2], [686.6, 19.0], [685.0, 17.9], [683.2, 18.4], [682.9, 17.7], [683.6, 18.0], [684.0, 17.2], [682.2, 16.7], [680.4, 18.0], [680.3, 16.7], [678.9, 16.6], [678.7, 15.7], [677.6, 16.0], [676.3, 14.3], [671.9, 13.9], [670.9, 12.2], [669.9, 12.8], [665.3, 10.3], [664.1, 11.0], [662.4, 10.2], [658.2, 10.3], [657.8, 9.3], [654.6, 9.6], [653.8, 11.4], [653.6, 9.7], [651.7, 8.1], [650.7, 8.4], [650.8, 7.3], [649.6, 7.8], [649.9, 8.9], [647.1, 8.2], [646.7, 9.4], [644.3, 7.4], [645.0, 9.0], [644.4, 9.3], [643.3, 7.9], [640.8, 7.1], [640.3, 8.0], [638.8, 8.0], [636.0, 6.6], [631.9, 6.0], [631.1, 5.1], [632.2, 4.4], [631.1, 3.2], [630.8, 4.4], [627.9, 6.7], [627.1, 5.4], [623.2, 6.7], [621.8, 6.1], [621.6, 5.1], [620.7, 6.0], [618.7, 5.4], [615.4, 6.0], [613.0, 5.1], [611.9, 5.8], [611.2, 4.7], [602.0, 5.8], [596.9, 4.1], [595.3, 5.1], [594.2, 4.6]], [[743.0, 21.7], [749.6, 29.7], [752.9, 32.0], [756.4, 32.9], [756.4, 34.6], [764.9, 42.4], [768.7, 44.1], [772.4, 48.3], [775.1, 48.9], [778.2, 51.0], [778.4, 52.6], [781.3, 55.4], [791.2, 61.1], [791.9, 62.6], [795.1, 64.8], [795.2, 66.7], [799.6, 70.0], [805.1, 78.7], [805.8, 83.2], [807.1, 86.3], [809.2, 87.9], [810.0, 91.3], [812.3, 88.6], [814.8, 87.1], [818.0, 87.1], [822.3, 83.0], [821.7, 78.8], [819.0, 76.4], [817.7, 72.4], [814.2, 68.6], [811.9, 63.3], [807.2, 57.8], [800.1, 53.1], [796.8, 51.9], [794.4, 48.2], [784.1, 43.6], [780.9, 40.4], [776.3, 38.9], [770.8, 34.4], [761.7, 30.1], [759.8, 28.2], [757.7, 28.0], [745.2, 21.8], [743.0, 21.7]]], "symbolImg": "symbols/country/lightning.webp"}, {"id": "water", "name": "Страна Воды", "shortName": "Вода", "kanji": "水の国", "color": "#2980b9", "accent": "#3498db", "type": "great", "village": {"name": "Киригакуре", "title": "Деревня Скрытого Тумана (Мизукаге)", "symbol": "🌊", "x": 787.7, "y": 327.2, "symbolImg": "symbols/village/Kirigakure_Symbol.webp"}, "kage": "Мизукаге", "nature": "Стихия Воды (水遁)", "clans": "Хозуки, Юки, Кагуя", "terrain": "Островной архипелаг, вечный плотный туман, скалистые берега и влажные мангровые заросли.", "military": "Семь Мечников Тумана, Охотники АНБУ (Ойнин), мастера бесшумного убийства.", "danger": "Критическая (густые туманы, пираты, скрытные патрули мечников).", "lore": "Изолированное островное государство на востоке континента. Долгое время было известно как «Кровавый Туман» из-за жестоких экзаменов и внутренних чисток кланов.", "labelPoint": {"x": 791.3, "y": 327.6}, "points": [[767.8, 439.7], [767.0, 440.8], [765.3, 440.4], [764.2, 444.1], [764.4, 446.4], [763.2, 448.0], [765.8, 453.6], [772.7, 457.6], [773.8, 461.4], [776.3, 465.8], [779.1, 467.3], [780.9, 471.4], [779.9, 478.7], [777.4, 480.9], [777.0, 486.6], [778.9, 488.4], [781.2, 493.1], [778.2, 505.4], [778.6, 509.8], [780.6, 511.9], [781.0, 516.1], [783.3, 521.3], [781.7, 524.4], [781.9, 526.1], [784.9, 528.3], [786.8, 528.3], [788.3, 527.3], [790.8, 523.1], [794.4, 522.8], [797.4, 518.0], [800.9, 518.1], [802.2, 515.7], [806.4, 511.9], [806.4, 507.0], [808.1, 505.1], [808.6, 502.7], [806.7, 501.3], [805.4, 499.0], [804.1, 491.2], [805.8, 482.9], [808.1, 479.2], [806.8, 469.3], [807.2, 464.0], [805.1, 459.6], [802.8, 457.9], [800.1, 451.4], [796.1, 447.8], [791.1, 445.1], [789.9, 443.1], [775.2, 442.3], [772.3, 440.3], [767.8, 439.7]], "polygons": [[[767.8, 439.7], [767.0, 440.8], [765.3, 440.4], [764.2, 444.1], [764.4, 446.4], [763.2, 448.0], [765.8, 453.6], [772.7, 457.6], [773.8, 461.4], [776.3, 465.8], [779.1, 467.3], [780.9, 471.4], [779.9, 478.7], [777.4, 480.9], [777.0, 486.6], [778.9, 488.4], [781.2, 493.1], [778.2, 505.4], [778.6, 509.8], [780.6, 511.9], [781.0, 516.1], [783.3, 521.3], [781.7, 524.4], [781.9, 526.1], [784.9, 528.3], [786.8, 528.3], [788.3, 527.3], [790.8, 523.1], [794.4, 522.8], [797.4, 518.0], [800.9, 518.1], [802.2, 515.7], [806.4, 511.9], [806.4, 507.0], [808.1, 505.1], [808.6, 502.7], [806.7, 501.3], [805.4, 499.0], [804.1, 491.2], [805.8, 482.9], [808.1, 479.2], [806.8, 469.3], [807.2, 464.0], [805.1, 459.6], [802.8, 457.9], [800.1, 451.4], [796.1, 447.8], [791.1, 445.1], [789.9, 443.1], [775.2, 442.3], [772.3, 440.3], [767.8, 439.7]], [[703.0, 432.1], [705.9, 435.6], [711.9, 437.8], [714.8, 442.1], [717.7, 442.4], [720.4, 439.8], [721.8, 439.4], [723.7, 440.3], [729.3, 438.4], [730.8, 441.1], [733.3, 441.1], [739.3, 445.9], [743.2, 446.2], [744.8, 447.6], [752.6, 444.8], [754.7, 449.7], [756.4, 449.2], [759.1, 444.1], [764.4, 439.1], [764.0, 437.2], [765.9, 434.4], [761.9, 428.8], [762.7, 426.4], [762.0, 424.8], [757.1, 423.7], [752.9, 420.6], [748.9, 419.9], [738.6, 422.9], [737.3, 421.9], [737.3, 418.3], [731.9, 416.2], [726.9, 411.7], [722.4, 414.6], [716.0, 414.0], [713.3, 415.8], [711.4, 418.1], [710.8, 422.1], [707.4, 425.3], [705.3, 430.8], [703.0, 432.1]], [[760.8, 321.7], [760.4, 324.4], [765.8, 327.0], [763.8, 329.0], [765.6, 330.6], [765.6, 333.4], [766.7, 335.6], [769.6, 336.2], [775.4, 339.9], [779.2, 339.7], [780.3, 340.9], [780.9, 344.9], [783.1, 346.2], [785.2, 345.8], [787.2, 347.1], [790.3, 347.4], [791.4, 345.8], [794.4, 345.0], [794.7, 347.3], [795.9, 348.7], [799.1, 346.4], [803.4, 340.4], [806.4, 339.6], [806.3, 337.6], [808.6, 335.8], [811.0, 330.0], [808.0, 326.0], [810.0, 321.4], [805.8, 317.0], [804.2, 312.2], [804.9, 311.1], [800.6, 309.6], [796.7, 310.8], [792.9, 310.8], [788.0, 309.2], [779.2, 308.8], [777.0, 310.8], [774.9, 315.0], [772.8, 315.9], [769.1, 315.8], [767.2, 317.7], [764.2, 318.1], [760.8, 321.7]], [[863.6, 328.1], [856.9, 323.9], [848.8, 320.9], [848.0, 317.0], [843.6, 318.9], [840.2, 318.4], [839.9, 320.3], [835.2, 322.6], [834.7, 323.6], [832.2, 324.1], [830.9, 326.7], [828.4, 326.2], [831.6, 328.7], [827.8, 330.8], [828.2, 332.8], [825.0, 335.4], [824.1, 337.2], [828.0, 340.3], [827.6, 342.0], [824.6, 344.2], [827.9, 345.7], [829.9, 348.1], [831.0, 348.1], [833.4, 345.8], [833.2, 342.4], [835.2, 341.9], [836.2, 339.3], [835.2, 336.1], [837.7, 335.0], [834.4, 333.3], [833.7, 332.3], [834.1, 331.4], [837.0, 333.1], [838.1, 331.3], [840.2, 330.6], [846.0, 334.0], [848.0, 331.9], [850.3, 331.9], [850.3, 330.1], [851.7, 329.3], [858.8, 328.3], [860.9, 329.0], [863.6, 328.1]], [[808.0, 276.2], [805.1, 279.4], [805.6, 282.2], [808.4, 284.6], [807.2, 287.1], [808.0, 291.4], [804.7, 292.8], [804.6, 294.1], [805.6, 295.2], [808.2, 295.8], [806.2, 296.4], [806.3, 297.7], [803.1, 303.0], [804.8, 307.2], [808.7, 306.1], [811.7, 309.8], [813.7, 307.3], [815.2, 302.6], [819.6, 300.6], [819.4, 296.9], [822.3, 294.7], [822.7, 291.1], [821.7, 288.6], [820.1, 287.4], [819.7, 284.1], [816.6, 279.3], [812.0, 276.9], [808.0, 276.2]], [[760.4, 291.0], [756.0, 291.7], [748.0, 295.7], [747.2, 300.8], [742.6, 304.9], [742.1, 309.1], [744.1, 312.6], [742.1, 316.4], [742.3, 317.9], [746.2, 318.1], [748.1, 315.2], [749.3, 314.6], [751.0, 315.1], [754.2, 313.7], [757.9, 310.9], [759.3, 308.7], [762.7, 307.4], [763.4, 301.7], [763.0, 300.7], [759.9, 299.1], [760.4, 291.0]], [[833.9, 361.0], [830.1, 360.6], [825.3, 357.4], [823.6, 360.4], [822.0, 360.7], [822.0, 363.2], [815.0, 367.1], [814.0, 368.8], [816.1, 371.8], [815.0, 373.9], [815.3, 376.2], [817.6, 377.7], [817.7, 378.8], [819.2, 379.2], [822.6, 376.8], [829.8, 375.6], [832.9, 372.7], [831.9, 371.1], [835.0, 367.7], [835.2, 362.9], [833.9, 361.0]], [[767.1, 285.2], [767.8, 291.2], [766.0, 294.3], [766.9, 295.9], [768.9, 295.1], [776.7, 295.2], [779.0, 298.0], [782.4, 295.6], [784.1, 291.4], [783.9, 290.0], [778.2, 288.3], [776.9, 283.2], [773.6, 282.9], [767.1, 285.2]], [[928.2, 324.3], [925.2, 327.8], [923.2, 334.0], [919.3, 341.2], [918.9, 345.7], [919.8, 348.0], [924.7, 350.3], [926.8, 347.9], [928.1, 339.4], [929.9, 339.8], [928.8, 336.6], [929.8, 327.7], [928.2, 324.3]], [[763.6, 339.9], [764.3, 345.1], [766.3, 347.2], [766.3, 348.3], [770.7, 350.6], [771.0, 353.4], [774.0, 354.1], [778.8, 350.8], [779.8, 347.9], [777.3, 343.8], [773.1, 344.1], [768.1, 340.3], [763.6, 339.9]], [[760.0, 407.0], [757.3, 411.6], [757.4, 414.6], [761.8, 415.9], [762.4, 419.3], [763.6, 420.1], [768.3, 420.0], [770.4, 416.9], [769.4, 410.4], [766.6, 407.4], [762.4, 406.4], [760.0, 407.0]], [[820.2, 348.1], [817.3, 347.1], [817.0, 345.8], [814.1, 343.3], [811.7, 342.8], [811.9, 345.8], [811.2, 346.8], [808.2, 347.9], [804.4, 347.0], [803.0, 348.8], [802.9, 351.3], [805.3, 352.1], [807.6, 355.7], [812.8, 355.2], [820.2, 348.1]], [[814.8, 308.3], [812.7, 311.7], [812.3, 314.7], [813.4, 314.9], [813.2, 316.1], [815.1, 317.2], [815.4, 319.3], [816.6, 319.8], [816.2, 322.2], [818.8, 322.8], [821.0, 319.6], [823.6, 317.9], [824.2, 313.6], [821.2, 310.0], [818.8, 310.6], [816.9, 308.7], [814.8, 308.3]], [[852.1, 355.2], [850.2, 358.4], [848.2, 358.6], [847.2, 360.3], [847.8, 363.8], [846.4, 368.6], [847.2, 369.3], [850.9, 368.8], [855.8, 363.0], [856.2, 360.6], [854.4, 359.8], [852.1, 355.2]], [[789.0, 428.2], [786.6, 426.7], [783.0, 429.1], [780.6, 427.7], [778.2, 429.1], [777.8, 434.2], [779.6, 435.3], [785.3, 436.4], [787.2, 435.1], [789.3, 430.7], [789.0, 428.2]], [[713.0, 267.7], [710.4, 269.7], [707.8, 274.6], [708.9, 279.3], [712.4, 277.8], [712.6, 276.3], [714.9, 274.2], [714.1, 270.1], [714.7, 269.3], [713.0, 267.7]], [[731.4, 451.0], [733.4, 455.1], [738.3, 455.7], [740.6, 455.0], [742.3, 453.1], [740.4, 450.6], [738.2, 450.7], [734.9, 448.6], [731.4, 451.0]], [[786.3, 351.1], [784.9, 351.3], [784.3, 354.2], [782.6, 356.2], [784.6, 358.9], [789.0, 354.7], [788.2, 352.1], [786.3, 351.1]], [[784.2, 361.6], [783.0, 361.9], [782.1, 363.7], [782.2, 370.0], [785.0, 368.9], [786.6, 364.7], [784.2, 361.6]], [[748.3, 260.2], [749.7, 261.9], [751.7, 262.4], [754.1, 260.7], [756.0, 260.8], [757.8, 258.8], [751.2, 258.0], [748.3, 260.2]], [[720.1, 255.3], [719.4, 257.2], [721.4, 259.8], [722.9, 259.9], [721.8, 258.2], [723.1, 257.1], [722.7, 255.6], [720.1, 255.3]], [[859.4, 323.4], [862.9, 326.3], [864.7, 326.0], [862.8, 323.8], [859.4, 323.4]], [[856.0, 330.9], [851.9, 331.0], [851.3, 333.6], [856.0, 330.9]], [[842.6, 264.8], [844.1, 265.2], [846.6, 263.1], [843.6, 262.8], [842.6, 264.8]], [[851.3, 260.1], [848.8, 260.3], [847.6, 262.2], [849.6, 262.7], [851.3, 260.1]], [[849.1, 264.8], [848.0, 265.0], [846.0, 267.4], [849.2, 267.0], [849.1, 264.8]], [[720.1, 263.1], [718.2, 264.2], [718.3, 265.3], [719.3, 265.8], [720.4, 265.0], [720.1, 263.1]], [[806.8, 345.6], [807.6, 347.0], [809.1, 346.0], [808.6, 345.3], [806.8, 345.6]], [[718.4, 258.7], [718.2, 259.8], [719.2, 260.8], [720.1, 259.3], [718.4, 258.7]]], "islands": [[[762.9, 338.9], [762.9, 347.1], [764.9, 349.8], [768.9, 352.4], [769.6, 355.3], [776.7, 355.3], [780.4, 352.2], [780.7, 344.4], [779.3, 342.2], [774.7, 342.2], [771.1, 339.1], [762.9, 338.9]]], "symbolImg": "symbols/country/water.png"}, {"id": "rain", "name": "Страна Дождя", "shortName": "Дождь", "kanji": "雨の国", "color": "#576574", "accent": "#8395a7", "type": "buffer", "village": {"name": "Амегакуре", "title": "Деревня Скрытого Дождя (Пейн)", "symbol": "🌧️", "x": 520, "y": 291, "symbolImg": "symbols/village/Amegakure_Symbol.webp"}, "kage": "Лидер Аме", "nature": "Стихия Воды, Дождь", "clans": "Группа Ханзо, фракция Пейна", "terrain": "Высокотехнологичные индустриальные башни, непрекращающийся дождь, озёра.", "military": "Скрытные ассасины Аме, сенсорные дождевые барьеры.", "danger": "Высокая (строжайший пропускной режим, тотальный сенсорный контроль).", "lore": "Буферная зона между Огнем, Ветром и Землей. Пережила бесчисленные опустошительные войны великих держав.", "labelPoint": {"x": 519.7, "y": 290.8}, "points": [[503.2, 269.7], [502.7, 272.7], [504.7, 274.8], [505.9, 282.0], [508.9, 283.3], [510.9, 287.2], [510.7, 290.2], [509.3, 291.8], [509.4, 296.6], [512.1, 298.4], [517.3, 299.9], [519.9, 302.4], [520.7, 304.7], [526.8, 306.9], [529.7, 303.6], [534.0, 304.0], [536.0, 302.9], [538.3, 303.6], [540.3, 302.8], [540.4, 295.6], [541.1, 294.0], [543.7, 292.0], [544.0, 288.3], [540.3, 284.8], [537.8, 285.3], [536.0, 286.8], [533.0, 286.3], [531.0, 287.9], [528.9, 287.1], [521.6, 278.2], [521.0, 273.9], [522.3, 269.2], [521.7, 265.8], [514.7, 267.6], [511.8, 267.2], [503.2, 269.7]], "polygons": [[[503.2, 269.7], [502.7, 272.7], [504.7, 274.8], [505.9, 282.0], [508.9, 283.3], [510.9, 287.2], [510.7, 290.2], [509.3, 291.8], [509.4, 296.6], [512.1, 298.4], [517.3, 299.9], [519.9, 302.4], [520.7, 304.7], [526.8, 306.9], [529.7, 303.6], [534.0, 304.0], [536.0, 302.9], [538.3, 303.6], [540.3, 302.8], [540.4, 295.6], [541.1, 294.0], [543.7, 292.0], [544.0, 288.3], [540.3, 284.8], [537.8, 285.3], [536.0, 286.8], [533.0, 286.3], [531.0, 287.9], [528.9, 287.1], [521.6, 278.2], [521.0, 273.9], [522.3, 269.2], [521.7, 265.8], [514.7, 267.6], [511.8, 267.2], [503.2, 269.7]]]}, {"id": "grass", "name": "Страна Травы", "shortName": "Трава", "kanji": "草の国", "color": "#27ae60", "accent": "#2ecc71", "type": "buffer", "village": {"name": "Кусагакуре", "title": "Деревня Скрытой Травы", "symbol": "🌾", "x": 531, "y": 274, "symbolImg": "symbols/village/Kusagakure_Symbol.webp"}, "kage": "Старейшины Куса", "nature": "Стихия Земли и Воды", "clans": "Клан Травы", "terrain": "Густые заросли бамбука, пологие луга, гигантские грибные леса.", "military": "Шпионы, мастера адаптации чужих техник, тюремная крепость Хозуки.", "danger": "Средняя (ловушки в траве, слежка).", "lore": "Малое государство, известное своей дипломатической гибкостью и знаменитой тюрьмой Кровавой Тюрьмы (Хозукидзё).", "labelPoint": {"x": 530.9, "y": 274.4}, "points": [[543.2, 248.2], [532.0, 256.7], [528.6, 261.1], [522.4, 265.2], [522.8, 271.4], [521.6, 274.1], [522.1, 278.0], [524.1, 281.2], [525.9, 282.1], [526.3, 283.7], [530.1, 287.3], [532.8, 285.8], [535.7, 286.2], [540.2, 284.1], [541.0, 282.3], [541.3, 277.8], [539.6, 275.9], [539.7, 269.8], [537.9, 268.2], [537.7, 266.6], [541.0, 262.9], [541.8, 260.8], [544.2, 259.8], [548.1, 255.6], [546.1, 251.2], [543.2, 248.2]], "polygons": [[[543.2, 248.2], [532.0, 256.7], [528.6, 261.1], [522.4, 265.2], [522.8, 271.4], [521.6, 274.1], [522.1, 278.0], [524.1, 281.2], [525.9, 282.1], [526.3, 283.7], [530.1, 287.3], [532.8, 285.8], [535.7, 286.2], [540.2, 284.1], [541.0, 282.3], [541.3, 277.8], [539.6, 275.9], [539.7, 269.8], [537.9, 268.2], [537.7, 266.6], [541.0, 262.9], [541.8, 260.8], [544.2, 259.8], [548.1, 255.6], [546.1, 251.2], [543.2, 248.2]]]}, {"id": "waterfall", "name": "Страна Водопада", "shortName": "Водопад", "kanji": "滝の国", "color": "#16a085", "accent": "#1abc9c", "type": "buffer", "village": {"name": "Такигакуре", "title": "Деревня Скрытого Водопада", "symbol": "💦", "x": 559, "y": 240, "symbolImg": "symbols/village/Takigakure_Symbol.webp"}, "kage": "Глава Таки", "nature": "Стихия Воды", "clans": "Хранители Воды Героя", "terrain": "Могучие водопады, карстовые пещеры, гигантское древо деревни.", "military": "Единственная малая деревня, которой доверяли хвостатого зверя (Семихвостый Чоумей).", "danger": "Умеренная (секретный вход за гигантским водопадом).", "lore": "Скрытая жемчужина среди скал. Хранит реликвию «Вода Героя», многократно умножающую чакру ценой жизненных сил.", "labelPoint": {"x": 559.2, "y": 240.3}, "points": [[574.0, 208.4], [571.1, 208.7], [570.0, 207.0], [566.2, 208.4], [563.8, 207.1], [556.9, 208.1], [556.0, 207.3], [553.4, 213.0], [551.8, 214.0], [549.6, 218.3], [550.1, 224.7], [546.4, 228.6], [544.8, 232.0], [545.2, 244.0], [543.6, 247.2], [548.1, 253.2], [548.7, 255.3], [559.3, 255.0], [562.8, 257.8], [564.4, 256.6], [571.1, 256.8], [576.4, 255.4], [576.1, 250.2], [574.3, 244.9], [576.1, 243.6], [575.6, 237.6], [572.4, 234.4], [572.4, 232.3], [574.9, 227.8], [576.7, 220.8], [575.4, 210.2], [574.2, 209.7], [574.0, 208.4]], "polygons": [[[574.0, 208.4], [571.1, 208.7], [570.0, 207.0], [566.2, 208.4], [563.8, 207.1], [556.9, 208.1], [556.0, 207.3], [553.4, 213.0], [551.8, 214.0], [549.6, 218.3], [550.1, 224.7], [546.4, 228.6], [544.8, 232.0], [545.2, 244.0], [543.6, 247.2], [548.1, 253.2], [548.7, 255.3], [559.3, 255.0], [562.8, 257.8], [564.4, 256.6], [571.1, 256.8], [576.4, 255.4], [576.1, 250.2], [574.3, 244.9], [576.1, 243.6], [575.6, 237.6], [572.4, 234.4], [572.4, 232.3], [574.9, 227.8], [576.7, 220.8], [575.4, 210.2], [574.2, 209.7], [574.0, 208.4]]]}, {"id": "iron", "name": "Страна Железа", "shortName": "Железо", "kanji": "鉄の国", "color": "#4b6584", "accent": "#778ca3", "type": "buffer", "village": {"name": "Цитадель Самураев", "title": "Оплот Самураев", "symbol": "⚔️", "x": 591, "y": 222}, "kage": "Генерал Мифуне", "nature": "Кендзюцу, чакра клинка", "clans": "Самурайские ордена трёх волков", "terrain": "Заснеженные скалы Трёх Волков, вечный холод, ледяные перевалы.", "military": "Бронированные легионы самураев, мастера Иайдо и чакровых катан.", "danger": "Нейтралитет (законы чести, беспощадное пресечение вторжений шиноби).", "lore": "Единственное нейтральное государство, не использующее шиноби. Защищено самураями и международным договором всех наций.", "labelPoint": {"x": 612.8, "y": 197.0}, "points": [[619.9, 174.1], [614.9, 173.0], [611.6, 173.7], [608.9, 177.9], [604.8, 180.1], [604.3, 183.2], [599.4, 186.2], [599.0, 187.6], [595.4, 190.4], [593.3, 190.9], [591.7, 192.4], [592.1, 201.4], [588.6, 202.1], [586.3, 205.1], [585.4, 208.8], [579.4, 210.2], [576.1, 209.7], [577.2, 221.0], [573.0, 234.2], [576.1, 237.3], [576.7, 243.9], [574.9, 245.7], [576.7, 250.0], [577.1, 255.4], [585.9, 256.7], [587.4, 254.6], [590.7, 253.7], [592.8, 246.0], [596.7, 244.0], [597.0, 242.6], [598.7, 241.7], [603.7, 235.8], [602.4, 232.3], [602.4, 230.1], [603.6, 228.1], [605.1, 226.9], [609.2, 226.2], [608.0, 224.4], [612.2, 217.7], [613.2, 214.3], [616.6, 212.3], [623.9, 212.8], [625.1, 207.9], [630.1, 209.1], [631.6, 208.4], [632.6, 205.1], [632.0, 201.1], [633.0, 199.9], [632.6, 198.1], [630.9, 197.4], [630.2, 194.1], [631.3, 191.3], [632.9, 190.8], [633.2, 189.1], [631.4, 186.8], [627.7, 184.7], [628.3, 183.1], [626.9, 182.6], [625.6, 180.6], [625.9, 177.9], [619.9, 174.1]], "polygons": [[[619.9, 174.1], [614.9, 173.0], [611.6, 173.7], [608.9, 177.9], [604.8, 180.1], [604.3, 183.2], [599.4, 186.2], [599.0, 187.6], [595.4, 190.4], [593.3, 190.9], [591.7, 192.4], [592.1, 201.4], [588.6, 202.1], [586.3, 205.1], [585.4, 208.8], [579.4, 210.2], [576.1, 209.7], [577.2, 221.0], [573.0, 234.2], [576.1, 237.3], [576.7, 243.9], [574.9, 245.7], [576.7, 250.0], [577.1, 255.4], [585.9, 256.7], [587.4, 254.6], [590.7, 253.7], [592.8, 246.0], [596.7, 244.0], [597.0, 242.6], [598.7, 241.7], [603.7, 235.8], [602.4, 232.3], [602.4, 230.1], [603.6, 228.1], [605.1, 226.9], [609.2, 226.2], [608.0, 224.4], [612.2, 217.7], [613.2, 214.3], [616.6, 212.3], [623.9, 212.8], [625.1, 207.9], [630.1, 209.1], [631.6, 208.4], [632.6, 205.1], [632.0, 201.1], [633.0, 199.9], [632.6, 198.1], [630.9, 197.4], [630.2, 194.1], [631.3, 191.3], [632.9, 190.8], [633.2, 189.1], [631.4, 186.8], [627.7, 184.7], [628.3, 183.1], [626.9, 182.6], [625.6, 180.6], [625.9, 177.9], [619.9, 174.1]]]}, {"id": "sound", "name": "Страна Рисовых Полей (Звук)", "shortName": "Звук", "kanji": "音の国", "color": "#8854d0", "accent": "#a55eea", "type": "buffer", "village": {"name": "Отогакуре", "title": "Деревня Скрытого Звука (Орочимару)", "symbol": "🎶", "x": 607, "y": 248, "symbolImg": "symbols/village/Otogakure_Symbol.webp"}, "kage": "Орочимару", "nature": "Звуковые волны, модификации тела", "clans": "Четвёрка Звука, эксперименты проклятой печати", "terrain": "Рисовые террасы, тихие речные долины, секретные подземные бункеры.", "military": "Экспериментальные ударные отряды, носители Джуина, кибернетические импланты.", "danger": "Очень высокая (замаскированные лаборатории, опасные эксперименты).", "lore": "Ранее мирная Страна Рисовых Полей, захваченная Орочимару и превращённая в его личный плацдарм Отогакуре.", "labelPoint": {"x": 607.0, "y": 248.2}, "points": [[618.2, 231.1], [617.3, 230.4], [612.6, 230.9], [609.4, 236.3], [604.0, 236.2], [599.2, 241.9], [597.6, 242.8], [596.9, 244.6], [593.3, 246.2], [591.4, 253.9], [593.7, 254.6], [597.6, 257.8], [600.2, 258.0], [601.8, 259.2], [608.7, 258.6], [613.8, 256.4], [618.1, 257.7], [616.6, 252.0], [617.4, 248.9], [616.4, 242.2], [618.4, 237.4], [618.2, 231.1]], "polygons": [[[618.2, 231.1], [617.3, 230.4], [612.6, 230.9], [609.4, 236.3], [604.0, 236.2], [599.2, 241.9], [597.6, 242.8], [596.9, 244.6], [593.3, 246.2], [591.4, 253.9], [593.7, 254.6], [597.6, 257.8], [600.2, 258.0], [601.8, 259.2], [608.7, 258.6], [613.8, 256.4], [618.1, 257.7], [616.6, 252.0], [617.4, 248.9], [616.4, 242.2], [618.4, 237.4], [618.2, 231.1]]], "symbolImg": "symbols/country/sound.webp"}, {"id": "hot_water", "name": "Страна Горячих Источников", "shortName": "Источники", "kanji": "湯の国", "color": "#20bf6b", "accent": "#26de81", "type": "small", "village": {"name": "Югакуре", "title": "Деревня Скрытого Горячего Источника", "symbol": "♨️", "x": 627.8, "y": 245.7, "symbolImg": "symbols/village/Yugakure_Symbol.webp"}, "kage": "Глава Ю", "nature": "Стихия Огня и Воды (Пар)", "clans": "Культ Джашина (Хидан)", "terrain": "Геотермальные долины, горячие источники, курортные городки.", "military": "Пацифистские дружины, демилитаризованная курортная зона.", "danger": "Низкая (курортная зона, но скрытые сектанты вроде Джашина).", "lore": "Государство, отказавшееся от милитаризма ради туризма и отдыха, став мирным уголком между Молнией и Огнем.", "labelPoint": {"x": 629.0, "y": 248.6}, "points": [[619.2, 230.9], [618.4, 232.8], [618.9, 237.8], [617.0, 242.4], [618.0, 248.8], [617.1, 251.8], [618.7, 258.0], [622.1, 259.9], [633.3, 259.7], [634.1, 260.8], [634.3, 265.3], [636.4, 267.7], [637.6, 271.6], [644.3, 272.6], [647.0, 271.7], [648.2, 272.1], [649.8, 274.2], [651.7, 274.8], [654.6, 277.6], [657.3, 282.0], [662.9, 287.0], [663.2, 290.7], [665.3, 294.6], [665.6, 298.2], [666.6, 299.8], [669.8, 301.2], [671.9, 300.6], [674.3, 303.3], [676.3, 303.0], [678.8, 301.0], [682.3, 294.4], [686.0, 291.0], [685.7, 287.4], [688.2, 286.0], [691.1, 281.9], [688.1, 276.0], [684.9, 273.3], [682.1, 274.6], [677.1, 273.8], [676.6, 275.2], [674.2, 276.9], [670.8, 275.8], [670.0, 272.9], [665.4, 271.9], [663.2, 270.3], [660.2, 265.7], [660.2, 262.3], [655.1, 260.0], [654.3, 257.8], [655.0, 252.3], [647.9, 247.9], [643.7, 248.4], [642.3, 245.1], [635.0, 238.7], [629.2, 229.6], [624.8, 230.3], [621.4, 229.8], [619.2, 230.9]], "polygons": [[[619.2, 230.9], [618.4, 232.8], [618.9, 237.8], [617.0, 242.4], [618.0, 248.8], [617.1, 251.8], [618.7, 258.0], [622.1, 259.9], [633.3, 259.7], [634.1, 260.8], [634.3, 265.3], [636.4, 267.7], [637.6, 271.6], [644.3, 272.6], [647.0, 271.7], [648.2, 272.1], [649.8, 274.2], [651.7, 274.8], [654.6, 277.6], [657.3, 282.0], [662.9, 287.0], [663.2, 290.7], [665.3, 294.6], [665.6, 298.2], [666.6, 299.8], [669.8, 301.2], [671.9, 300.6], [674.3, 303.3], [676.3, 303.0], [678.8, 301.0], [682.3, 294.4], [686.0, 291.0], [685.7, 287.4], [688.2, 286.0], [691.1, 281.9], [688.1, 276.0], [684.9, 273.3], [682.1, 274.6], [677.1, 273.8], [676.6, 275.2], [674.2, 276.9], [670.8, 275.8], [670.0, 272.9], [665.4, 271.9], [663.2, 270.3], [660.2, 265.7], [660.2, 262.3], [655.1, 260.0], [654.3, 257.8], [655.0, 252.3], [647.9, 247.9], [643.7, 248.4], [642.3, 245.1], [635.0, 238.7], [629.2, 229.6], [624.8, 230.3], [621.4, 229.8], [619.2, 230.9]]], "symbolImg": "symbols/country/hotsprings.webp"}, {"id": "frost", "name": "Страна Мороза", "shortName": "Мороз", "kanji": "霜の国", "color": "#778ca3", "accent": "#a5b1c2", "type": "small", "village": {"name": "Шимогакуре", "title": "Деревня Скрытого Мороза", "symbol": "❄️", "x": 649.3, "y": 234.1, "symbolImg": "symbols/village/Shimogakure_Symbol.webp"}, "kage": "Глава Шимо", "nature": "Стихия Ветра и Воды", "clans": "Следопыты Шимо", "terrain": "Холодные тундры, сосновые леса, обледенелые предгорья.", "military": "Пограничные стражи, разведчики глубокого снега.", "danger": "Умеренная (холод, близость к Кумо).", "lore": "Буфер между Страной Молнии и Землями Огня. Служит транзитным торговым и пограничным узлом.", "labelPoint": {"x": 649.0, "y": 234.4}, "points": [[630.6, 224.4], [629.9, 229.7], [635.7, 238.7], [637.0, 239.0], [637.9, 241.2], [640.1, 241.9], [640.9, 243.6], [642.9, 244.9], [644.2, 248.7], [648.1, 247.3], [652.9, 249.8], [654.7, 249.2], [655.7, 247.6], [655.1, 246.1], [656.3, 245.2], [657.0, 243.0], [659.4, 244.3], [660.4, 244.0], [664.2, 246.4], [670.9, 244.0], [670.9, 242.8], [669.3, 241.1], [669.4, 236.6], [665.8, 235.2], [662.2, 232.4], [660.8, 229.3], [660.3, 221.3], [659.2, 220.3], [655.9, 221.9], [654.1, 221.3], [651.7, 223.0], [649.1, 223.0], [647.8, 220.9], [640.0, 222.9], [639.2, 222.1], [640.0, 220.8], [634.6, 219.1], [630.6, 224.4]], "polygons": [[[630.6, 224.4], [629.9, 229.7], [635.7, 238.7], [637.0, 239.0], [637.9, 241.2], [640.1, 241.9], [640.9, 243.6], [642.9, 244.9], [644.2, 248.7], [648.1, 247.3], [652.9, 249.8], [654.7, 249.2], [655.7, 247.6], [655.1, 246.1], [656.3, 245.2], [657.0, 243.0], [659.4, 244.3], [660.4, 244.0], [664.2, 246.4], [670.9, 244.0], [670.9, 242.8], [669.3, 241.1], [669.4, 236.6], [665.8, 235.2], [662.2, 232.4], [660.8, 229.3], [660.3, 221.3], [659.2, 220.3], [655.9, 221.9], [654.1, 221.3], [651.7, 223.0], [649.1, 223.0], [647.8, 220.9], [640.0, 222.9], [639.2, 222.1], [640.0, 220.8], [634.6, 219.1], [630.6, 224.4]]], "symbolImg": "symbols/country/winter.webp"}, {"id": "rivers", "name": "Страна Рек", "shortName": "Реки", "kanji": "川の国", "color": "#3867d6", "accent": "#4b7bec", "type": "buffer", "village": {"name": "Тани", "title": "Речные фактории", "symbol": "🛶", "x": 558.0, "y": 354.0}, "kage": "Даймё Рек", "nature": "Стихия Воды", "clans": "Речные торговцы и лодочники", "terrain": "Разветвлённые дельты рек, глубокие каньоны, пещеры Акацуки.", "military": "Наёмные отряды ронинов, пограничная речная стража.", "danger": "Средняя (базы контрабандистов, тайные убежища отступников).", "lore": "Буфер между Огнем и Ветром. Пронизана полноводными реками, связывающими внутренние моря с континентом.", "labelPoint": {"x": 557.8, "y": 357.9}, "points": [[530.0, 304.1], [527.6, 306.6], [527.9, 313.2], [529.4, 316.2], [531.3, 324.8], [536.9, 331.4], [536.6, 334.6], [538.9, 339.1], [538.4, 342.3], [539.4, 344.8], [539.1, 352.6], [537.0, 355.7], [537.4, 358.3], [536.6, 363.3], [534.8, 367.3], [537.1, 370.7], [540.7, 372.6], [544.0, 376.4], [545.4, 382.3], [545.6, 389.8], [547.3, 391.4], [552.2, 386.8], [553.0, 384.9], [555.6, 384.8], [557.0, 383.6], [561.1, 377.2], [563.3, 376.8], [566.3, 378.3], [568.1, 377.7], [571.4, 378.2], [574.6, 377.1], [576.4, 367.0], [578.1, 363.0], [576.3, 341.2], [572.8, 334.6], [568.3, 330.0], [566.7, 324.8], [564.8, 322.0], [557.2, 319.2], [553.4, 315.1], [548.6, 315.2], [543.4, 310.6], [543.3, 306.1], [540.8, 303.4], [538.6, 304.1], [536.2, 303.4], [533.7, 304.7], [530.0, 304.1]], "polygons": [[[530.0, 304.1], [527.6, 306.6], [527.9, 313.2], [529.4, 316.2], [531.3, 324.8], [536.9, 331.4], [536.6, 334.6], [538.9, 339.1], [538.4, 342.3], [539.4, 344.8], [539.1, 352.6], [537.0, 355.7], [537.4, 358.3], [536.6, 363.3], [534.8, 367.3], [537.1, 370.7], [540.7, 372.6], [544.0, 376.4], [545.4, 382.3], [545.6, 389.8], [547.3, 391.4], [552.2, 386.8], [553.0, 384.9], [555.6, 384.8], [557.0, 383.6], [561.1, 377.2], [563.3, 376.8], [566.3, 378.3], [568.1, 377.7], [571.4, 378.2], [574.6, 377.1], [576.4, 367.0], [578.1, 363.0], [576.3, 341.2], [572.8, 334.6], [568.3, 330.0], [566.7, 324.8], [564.8, 322.0], [557.2, 319.2], [553.4, 315.1], [548.6, 315.2], [543.4, 310.6], [543.3, 306.1], [540.8, 303.4], [538.6, 304.1], [536.2, 303.4], [533.7, 304.7], [530.0, 304.1]]], "symbolImg": "symbols/country/rivers.webp"}, {"id": "stone", "name": "Страна Камня", "shortName": "Камень", "kanji": "石の国", "color": "#57606f", "accent": "#747d8c", "type": "buffer", "village": {"name": "Ишигакуре", "title": "Деревня Скрытого Камня", "symbol": "🪨", "x": 419.0, "y": 267.8, "symbolImg": "symbols/village/Ishigakure_Symbol.webp"}, "kage": "Старейшина Иши", "nature": "Стихия Земли (土遁)", "clans": "Каменотёсы Иши", "terrain": "Каменистые плато, глубокие ущелья, каменоломни на стыке границ Земли и Ветра.", "military": "Гвардия каменотёсов, отряды охраны караванных перевалов.", "danger": "Средняя (сложный горный рельеф, пограничные заставы).", "lore": "Буферное государство между Страной Земли и южными регионами. Славится богатыми залежами прочнейшего строительного гранита и кремния.", "labelPoint": {"x": 431.8, "y": 260.6}, "points": [[468.0, 266.6], [464.4, 264.1], [461.3, 258.3], [458.0, 257.1], [456.6, 254.8], [456.2, 252.1], [454.3, 249.7], [446.6, 249.8], [443.3, 250.9], [433.2, 250.8], [431.3, 250.0], [424.9, 251.3], [421.2, 258.9], [419.6, 260.0], [417.0, 259.9], [414.9, 262.6], [413.0, 267.1], [411.4, 268.4], [406.1, 270.4], [404.2, 270.3], [401.9, 272.1], [399.6, 271.9], [394.3, 274.8], [389.9, 275.4], [385.0, 277.6], [380.6, 284.1], [377.3, 292.7], [381.9, 295.6], [383.2, 295.6], [395.8, 285.6], [398.1, 284.9], [399.8, 286.2], [401.9, 285.6], [403.9, 283.0], [407.8, 280.0], [409.3, 279.9], [412.8, 276.4], [420.7, 273.0], [424.7, 272.9], [426.7, 271.4], [430.0, 270.7], [433.6, 271.3], [434.8, 270.2], [439.1, 269.0], [442.8, 266.1], [449.2, 266.6], [451.2, 268.6], [451.1, 269.4], [452.9, 270.1], [454.0, 271.7], [456.2, 272.0], [462.1, 276.0], [468.0, 266.6]], "polygons": [[[468.0, 266.6], [464.4, 264.1], [461.3, 258.3], [458.0, 257.1], [456.6, 254.8], [456.2, 252.1], [454.3, 249.7], [446.6, 249.8], [443.3, 250.9], [433.2, 250.8], [431.3, 250.0], [424.9, 251.3], [421.2, 258.9], [419.6, 260.0], [417.0, 259.9], [414.9, 262.6], [413.0, 267.1], [411.4, 268.4], [406.1, 270.4], [404.2, 270.3], [401.9, 272.1], [399.6, 271.9], [394.3, 274.8], [389.9, 275.4], [385.0, 277.6], [380.6, 284.1], [377.3, 292.7], [381.9, 295.6], [383.2, 295.6], [395.8, 285.6], [398.1, 284.9], [399.8, 286.2], [401.9, 285.6], [403.9, 283.0], [407.8, 280.0], [409.3, 279.9], [412.8, 276.4], [420.7, 273.0], [424.7, 272.9], [426.7, 271.4], [430.0, 270.7], [433.6, 271.3], [434.8, 270.2], [439.1, 269.0], [442.8, 266.1], [449.2, 266.6], [451.2, 268.6], [451.1, 269.4], [452.9, 270.1], [454.0, 271.7], [456.2, 272.0], [462.1, 276.0], [468.0, 266.6]]], "symbolImg": "symbols/country/rock.webp"}, {"id": "tea", "name": "Страна Чая", "shortName": "Чай", "kanji": "茶の国", "color": "#2ed573", "accent": "#7bed9f", "type": "small", "village": {"name": "Дегуши", "title": "Торговый порт Чая", "symbol": "🍵", "x": 620, "y": 520}, "kage": "Даймё Чая", "nature": "Стихия Ветра", "clans": "Кланы Васаби и Дзирочо", "terrain": "Чайные холмистые плантации, живописный морской залив, архипелаг.", "military": "Не имеет скрытой деревни, нанимает шиноби Конохи для защиты.", "danger": "Низкая (мирные плантации, спортивные забеги Тодороки).", "lore": "Богатый южный полуостров, славящийся лучшими чайными сортами во всем мире шиноби.", "labelPoint": {"x": 600.7, "y": 459.9}, "points": [[608.7, 414.8], [607.4, 417.7], [604.8, 420.6], [598.7, 422.4], [598.2, 424.8], [594.7, 427.0], [593.1, 429.0], [591.8, 433.3], [591.8, 440.0], [590.1, 441.8], [589.4, 444.7], [587.3, 445.9], [585.0, 448.9], [584.7, 453.9], [583.3, 456.8], [582.7, 462.1], [584.2, 465.0], [584.3, 467.9], [586.4, 471.4], [588.9, 472.8], [589.8, 475.3], [588.4, 488.3], [589.2, 492.4], [591.6, 494.2], [593.1, 498.4], [592.3, 505.1], [594.8, 510.8], [601.4, 518.9], [607.7, 521.7], [610.0, 521.8], [614.6, 527.8], [619.1, 531.0], [620.3, 533.8], [628.1, 538.9], [630.2, 539.3], [632.1, 541.0], [636.3, 540.0], [643.0, 542.3], [649.0, 541.0], [655.7, 541.8], [656.0, 541.2], [649.8, 534.2], [648.4, 529.6], [649.0, 527.8], [645.3, 522.0], [644.9, 519.4], [635.1, 514.8], [628.3, 509.3], [627.9, 507.0], [625.6, 503.9], [626.9, 496.3], [625.0, 491.2], [626.7, 489.8], [627.2, 487.9], [626.2, 485.9], [620.6, 483.2], [619.1, 481.2], [620.0, 473.2], [617.4, 467.0], [618.4, 459.8], [617.1, 453.9], [619.1, 450.7], [625.2, 446.4], [626.3, 439.0], [632.4, 436.9], [631.3, 428.6], [633.1, 422.8], [628.0, 423.6], [623.3, 422.4], [613.3, 423.1], [610.9, 420.9], [608.7, 414.8]], "polygons": [[[608.7, 414.8], [607.4, 417.7], [604.8, 420.6], [598.7, 422.4], [598.2, 424.8], [594.7, 427.0], [593.1, 429.0], [591.8, 433.3], [591.8, 440.0], [590.1, 441.8], [589.4, 444.7], [587.3, 445.9], [585.0, 448.9], [584.7, 453.9], [583.3, 456.8], [582.7, 462.1], [584.2, 465.0], [584.3, 467.9], [586.4, 471.4], [588.9, 472.8], [589.8, 475.3], [588.4, 488.3], [589.2, 492.4], [591.6, 494.2], [593.1, 498.4], [592.3, 505.1], [594.8, 510.8], [601.4, 518.9], [607.7, 521.7], [610.0, 521.8], [614.6, 527.8], [619.1, 531.0], [620.3, 533.8], [628.1, 538.9], [630.2, 539.3], [632.1, 541.0], [636.3, 540.0], [643.0, 542.3], [649.0, 541.0], [655.7, 541.8], [656.0, 541.2], [649.8, 534.2], [648.4, 529.6], [649.0, 527.8], [645.3, 522.0], [644.9, 519.4], [635.1, 514.8], [628.3, 509.3], [627.9, 507.0], [625.6, 503.9], [626.9, 496.3], [625.0, 491.2], [626.7, 489.8], [627.2, 487.9], [626.2, 485.9], [620.6, 483.2], [619.1, 481.2], [620.0, 473.2], [617.4, 467.0], [618.4, 459.8], [617.1, 453.9], [619.1, 450.7], [625.2, 446.4], [626.3, 439.0], [632.4, 436.9], [631.3, 428.6], [633.1, 422.8], [628.0, 423.6], [623.3, 422.4], [613.3, 423.1], [610.9, 420.9], [608.7, 414.8]]], "symbolImg": "symbols/country/tea.webp"}, {"id": "snow", "name": "Страна Снега", "shortName": "Снег", "kanji": "雪の国", "color": "#dff9fb", "accent": "#c7ecee", "type": "small", "village": {"name": "Юкигакуре", "title": "Деревня Скрытого Снега", "symbol": "⛄", "x": 545, "y": 32, "symbolImg": "symbols/village/Yukigakure_Symbol.webp"}, "kage": "Даймё Казахана", "nature": "Стихия Льда (Хьётон), Чакра-броня", "clans": "Семья Казахана", "terrain": "Вечные ледники, айсберги, тепловые генераторы.", "military": "Шиноби в чакра-броне, ледяные поезда, передовые технологии.", "danger": "Высокая (арктический мороз, технологичное оружие).", "lore": "Северное царство вечных снегов. Разработало уникальную чакро-броню и систему тепловых генераторов.", "labelPoint": {"x": 551.8, "y": 24.0}, "points": [[606.7, 41.2], [604.9, 35.4], [602.2, 33.4], [601.0, 30.2], [596.2, 25.9], [595.2, 20.6], [594.0, 19.3], [591.0, 10.4], [592.6, 4.8], [591.1, 4.8], [590.6, 6.0], [587.9, 5.8], [585.8, 7.3], [581.1, 6.2], [577.8, 7.2], [574.7, 6.7], [573.3, 7.6], [568.2, 6.7], [560.4, 9.3], [560.2, 10.6], [558.3, 11.0], [554.9, 10.6], [556.6, 9.4], [553.4, 7.6], [550.4, 8.8], [550.4, 10.3], [547.7, 9.3], [546.1, 7.3], [545.1, 8.0], [543.8, 7.6], [543.7, 8.9], [539.3, 9.6], [538.4, 11.2], [533.0, 10.7], [532.6, 12.7], [530.0, 12.0], [525.4, 13.3], [517.4, 17.6], [510.4, 18.9], [510.7, 20.6], [509.0, 22.6], [509.2, 24.8], [508.1, 25.7], [505.7, 25.9], [503.7, 23.7], [504.4, 25.2], [503.9, 26.9], [505.2, 29.0], [507.6, 27.8], [508.8, 28.8], [506.4, 31.7], [506.8, 32.6], [508.7, 32.2], [505.6, 37.8], [506.9, 38.4], [510.6, 37.2], [514.4, 38.1], [520.0, 44.7], [521.4, 44.7], [525.2, 41.8], [525.7, 38.0], [528.8, 38.1], [532.6, 35.8], [532.7, 33.6], [529.4, 31.1], [532.0, 27.1], [532.3, 24.8], [530.8, 22.1], [527.8, 21.1], [526.3, 19.0], [526.7, 17.2], [529.9, 15.0], [528.2, 16.8], [528.3, 19.4], [531.7, 20.6], [534.1, 24.4], [535.9, 25.2], [534.3, 30.4], [537.6, 33.9], [540.0, 31.8], [541.1, 35.0], [537.7, 39.1], [536.7, 43.7], [532.1, 41.8], [528.8, 47.4], [529.0, 50.6], [532.4, 50.0], [535.7, 54.8], [537.4, 55.0], [538.4, 54.1], [538.6, 51.8], [540.7, 49.8], [541.9, 51.1], [541.2, 53.3], [543.0, 54.4], [542.3, 57.2], [546.6, 58.6], [548.0, 58.1], [548.3, 55.8], [551.9, 57.6], [552.7, 56.7], [550.8, 55.0], [551.2, 54.4], [554.0, 54.9], [556.0, 53.8], [553.6, 51.1], [553.2, 49.0], [551.3, 48.3], [554.2, 45.3], [553.0, 42.3], [556.2, 40.8], [555.8, 38.0], [557.2, 36.9], [563.3, 36.2], [561.2, 37.8], [558.4, 41.8], [559.8, 44.3], [559.8, 47.8], [561.9, 49.3], [564.4, 47.8], [568.7, 41.4], [566.4, 45.8], [566.8, 48.6], [565.8, 51.1], [567.4, 53.0], [569.8, 53.8], [570.7, 56.0], [572.7, 56.9], [574.2, 54.2], [571.4, 50.7], [574.6, 49.9], [576.3, 51.0], [581.0, 42.3], [583.1, 41.6], [590.7, 45.6], [592.4, 44.7], [595.7, 46.7], [597.0, 48.6], [599.1, 49.1], [603.9, 47.4], [606.7, 41.2]], "polygons": [[[606.7, 41.2], [604.9, 35.4], [602.2, 33.4], [601.0, 30.2], [596.2, 25.9], [595.2, 20.6], [594.0, 19.3], [591.0, 10.4], [592.6, 4.8], [591.1, 4.8], [590.6, 6.0], [587.9, 5.8], [585.8, 7.3], [581.1, 6.2], [577.8, 7.2], [574.7, 6.7], [573.3, 7.6], [568.2, 6.7], [560.4, 9.3], [560.2, 10.6], [558.3, 11.0], [554.9, 10.6], [556.6, 9.4], [553.4, 7.6], [550.4, 8.8], [550.4, 10.3], [547.7, 9.3], [546.1, 7.3], [545.1, 8.0], [543.8, 7.6], [543.7, 8.9], [539.3, 9.6], [538.4, 11.2], [533.0, 10.7], [532.6, 12.7], [530.0, 12.0], [525.4, 13.3], [517.4, 17.6], [510.4, 18.9], [510.7, 20.6], [509.0, 22.6], [509.2, 24.8], [508.1, 25.7], [505.7, 25.9], [503.7, 23.7], [504.4, 25.2], [503.9, 26.9], [505.2, 29.0], [507.6, 27.8], [508.8, 28.8], [506.4, 31.7], [506.8, 32.6], [508.7, 32.2], [505.6, 37.8], [506.9, 38.4], [510.6, 37.2], [514.4, 38.1], [520.0, 44.7], [521.4, 44.7], [525.2, 41.8], [525.7, 38.0], [528.8, 38.1], [532.6, 35.8], [532.7, 33.6], [529.4, 31.1], [532.0, 27.1], [532.3, 24.8], [530.8, 22.1], [527.8, 21.1], [526.3, 19.0], [526.7, 17.2], [529.9, 15.0], [528.2, 16.8], [528.3, 19.4], [531.7, 20.6], [534.1, 24.4], [535.9, 25.2], [534.3, 30.4], [537.6, 33.9], [540.0, 31.8], [541.1, 35.0], [537.7, 39.1], [536.7, 43.7], [532.1, 41.8], [528.8, 47.4], [529.0, 50.6], [532.4, 50.0], [535.7, 54.8], [537.4, 55.0], [538.4, 54.1], [538.6, 51.8], [540.7, 49.8], [541.9, 51.1], [541.2, 53.3], [543.0, 54.4], [542.3, 57.2], [546.6, 58.6], [548.0, 58.1], [548.3, 55.8], [551.9, 57.6], [552.7, 56.7], [550.8, 55.0], [551.2, 54.4], [554.0, 54.9], [556.0, 53.8], [553.6, 51.1], [553.2, 49.0], [551.3, 48.3], [554.2, 45.3], [553.0, 42.3], [556.2, 40.8], [555.8, 38.0], [557.2, 36.9], [563.3, 36.2], [561.2, 37.8], [558.4, 41.8], [559.8, 44.3], [559.8, 47.8], [561.9, 49.3], [564.4, 47.8], [568.7, 41.4], [566.4, 45.8], [566.8, 48.6], [565.8, 51.1], [567.4, 53.0], [569.8, 53.8], [570.7, 56.0], [572.7, 56.9], [574.2, 54.2], [571.4, 50.7], [574.6, 49.9], [576.3, 51.0], [581.0, 42.3], [583.1, 41.6], [590.7, 45.6], [592.4, 44.7], [595.7, 46.7], [597.0, 48.6], [599.1, 49.1], [603.9, 47.4], [606.7, 41.2]]], "symbolImg": "symbols/country/snow.webp"}, {"id": "sand", "name": "Страна Песка", "shortName": "Песок", "kanji": "砂の地", "color": "#e58e26", "accent": "#f39c12", "type": "small", "village": {"name": "Песчаные Врата", "title": "Караван-сарай Песков", "symbol": "🏜️", "x": 260, "y": 360}, "kage": "Шейх Песков", "nature": "Стихия Земли и Ветра", "clans": "Пустынные кочевники", "terrain": "Великие золотые дюны, зыбучие пески, древние руины.", "military": "Караванные стражи, пустынные наездники.", "danger": "Высокая (зыбучие пески, гигантские скорпионы).", "lore": "Северная часть Великого Пустынного Пояса, отделяющая Ветряную равнину от диких западных земель.", "labelPoint": {"x": 253.7, "y": 371.9}, "points": [[373.9, 316.8], [372.3, 313.6], [365.9, 309.7], [366.6, 307.9], [366.1, 300.0], [359.2, 299.7], [353.6, 302.8], [347.6, 304.7], [333.3, 303.0], [317.4, 302.9], [314.4, 302.3], [305.7, 293.7], [300.6, 296.8], [286.6, 296.3], [278.2, 300.1], [266.6, 299.1], [260.9, 299.6], [258.3, 301.9], [256.4, 305.6], [252.8, 308.3], [248.9, 308.2], [246.3, 305.2], [241.8, 305.2], [239.1, 307.2], [232.7, 317.1], [217.6, 318.9], [206.3, 327.0], [202.2, 328.0], [190.8, 327.1], [181.9, 323.3], [168.2, 325.0], [161.9, 322.6], [159.6, 316.9], [155.0, 313.4], [140.7, 312.1], [138.2, 315.0], [135.1, 327.4], [132.9, 330.8], [137.8, 338.0], [141.9, 339.8], [148.2, 339.8], [165.1, 342.9], [174.7, 346.9], [181.2, 348.6], [184.9, 358.9], [191.4, 363.1], [201.1, 365.3], [208.6, 372.9], [214.9, 374.9], [218.0, 382.9], [219.6, 391.6], [226.7, 403.7], [232.7, 405.3], [245.6, 412.6], [251.7, 412.9], [256.0, 411.2], [257.7, 409.0], [259.1, 408.7], [282.9, 409.0], [289.8, 405.4], [294.3, 404.2], [295.8, 402.2], [299.7, 399.6], [303.4, 398.0], [305.8, 393.7], [311.4, 389.8], [321.6, 387.4], [329.0, 383.8], [335.7, 382.8], [339.4, 378.3], [343.4, 375.4], [345.9, 365.6], [347.8, 361.6], [355.8, 352.1], [358.6, 347.1], [363.0, 341.9], [366.1, 340.0], [367.4, 336.3], [370.1, 334.4], [373.2, 327.2], [373.9, 316.8]], "polygons": [[[373.9, 316.8], [372.3, 313.6], [365.9, 309.7], [366.6, 307.9], [366.1, 300.0], [359.2, 299.7], [353.6, 302.8], [347.6, 304.7], [333.3, 303.0], [317.4, 302.9], [314.4, 302.3], [305.7, 293.7], [300.6, 296.8], [286.6, 296.3], [278.2, 300.1], [266.6, 299.1], [260.9, 299.6], [258.3, 301.9], [256.4, 305.6], [252.8, 308.3], [248.9, 308.2], [246.3, 305.2], [241.8, 305.2], [239.1, 307.2], [232.7, 317.1], [217.6, 318.9], [206.3, 327.0], [202.2, 328.0], [190.8, 327.1], [181.9, 323.3], [168.2, 325.0], [161.9, 322.6], [159.6, 316.9], [155.0, 313.4], [140.7, 312.1], [138.2, 315.0], [135.1, 327.4], [132.9, 330.8], [137.8, 338.0], [141.9, 339.8], [148.2, 339.8], [165.1, 342.9], [174.7, 346.9], [181.2, 348.6], [184.9, 358.9], [191.4, 363.1], [201.1, 365.3], [208.6, 372.9], [214.9, 374.9], [218.0, 382.9], [219.6, 391.6], [226.7, 403.7], [232.7, 405.3], [245.6, 412.6], [251.7, 412.9], [256.0, 411.2], [257.7, 409.0], [259.1, 408.7], [282.9, 409.0], [289.8, 405.4], [294.3, 404.2], [295.8, 402.2], [299.7, 399.6], [303.4, 398.0], [305.8, 393.7], [311.4, 389.8], [321.6, 387.4], [329.0, 383.8], [335.7, 382.8], [339.4, 378.3], [343.4, 375.4], [345.9, 365.6], [347.8, 361.6], [355.8, 352.1], [358.6, 347.1], [363.0, 341.9], [366.1, 340.0], [367.4, 336.3], [370.1, 334.4], [373.2, 327.2], [373.9, 316.8]]]}, {"id": "bears", "name": "Страна Медведей", "shortName": "Медведи", "kanji": "熊の国", "color": "#795548", "accent": "#8d6e63", "type": "small", "village": {"name": "Хошигакуре", "title": "Деревня Скрытой Звезды", "symbol": "⭐", "x": 320.0, "y": 220.0, "symbolImg": "symbols/village/Hoshigakure_Symbol.webp"}, "kage": "Хошикаге", "nature": "Чакра Звезды (павлиний метод)", "clans": "Адепты метеорита Звезды", "terrain": "Плотные хвойные чащи, глубокий каньон с ядовитыми испарениями.", "military": "Пользователи чакры павлина, летающие ниндзя Звезды.", "danger": "Высокая (ядовитый барьер каньона, радиация метеорита).", "lore": "Таинственное государство, где упал древний метеорит, дарующий шиноби колоссальную пурпурную чакру ценой здоровья.", "labelPoint": {"x": 315.1, "y": 245.6}, "points": [[348.3, 172.3], [345.1, 173.7], [342.6, 173.6], [338.1, 171.3], [336.2, 168.7], [321.9, 169.6], [322.3, 170.1], [321.4, 171.2], [322.9, 171.9], [322.1, 172.7], [324.4, 173.3], [324.3, 175.8], [322.0, 177.4], [321.4, 177.0], [322.3, 176.3], [322.1, 173.9], [320.1, 174.4], [319.4, 176.1], [318.1, 174.6], [316.9, 174.6], [316.7, 173.3], [314.1, 174.1], [313.9, 173.4], [315.3, 172.3], [314.8, 171.4], [308.0, 176.8], [306.8, 179.7], [295.3, 183.7], [290.6, 183.6], [284.1, 178.0], [283.0, 179.1], [282.3, 178.2], [281.1, 179.0], [283.7, 179.9], [282.6, 181.4], [282.7, 182.9], [284.4, 185.2], [283.3, 187.1], [281.3, 186.6], [280.1, 188.2], [281.8, 191.1], [288.9, 191.8], [289.4, 191.3], [288.7, 190.9], [290.9, 189.0], [293.3, 191.2], [292.6, 192.3], [293.0, 193.3], [294.8, 193.8], [295.2, 192.6], [298.1, 191.7], [299.7, 189.6], [302.2, 191.1], [306.7, 187.8], [307.9, 188.1], [307.6, 189.2], [306.7, 188.7], [305.4, 189.4], [306.6, 189.2], [308.7, 191.0], [307.7, 192.0], [308.8, 192.4], [308.3, 194.2], [305.9, 195.9], [305.9, 197.7], [306.7, 198.2], [305.2, 198.7], [305.4, 199.6], [303.4, 200.0], [303.8, 202.4], [303.0, 203.9], [303.8, 204.4], [303.0, 206.2], [304.3, 207.3], [304.3, 208.8], [300.3, 209.3], [298.8, 211.0], [294.8, 212.1], [291.6, 216.4], [288.2, 217.9], [289.8, 221.1], [288.6, 223.8], [288.2, 230.9], [291.4, 229.7], [291.7, 230.9], [288.9, 232.4], [289.9, 234.8], [289.2, 240.9], [291.3, 246.0], [289.1, 253.8], [290.7, 255.2], [291.6, 257.8], [295.8, 256.8], [295.8, 258.3], [293.3, 261.1], [293.2, 263.4], [298.6, 266.4], [298.9, 268.1], [301.7, 271.0], [305.4, 271.0], [309.1, 272.2], [312.7, 273.9], [316.4, 276.1], [320.1, 275.6], [323.8, 273.4], [327.5, 271.8], [331.2, 270.2], [334.9, 268.7], [338.6, 266.9], [342.3, 264.8], [346.0, 261.3], [349.7, 257.6], [353.4, 255.1], [357.1, 254.8], [360.8, 254.7], [364.4, 249.8], [362.6, 244.9], [362.7, 239.8], [361.4, 236.8], [362.9, 229.1], [362.4, 225.9], [364.6, 223.1], [368.8, 223.8], [369.2, 221.4], [367.8, 218.8], [367.7, 214.6], [366.4, 212.8], [365.8, 203.1], [364.3, 201.0], [365.1, 197.6], [362.7, 194.2], [364.6, 186.4], [364.0, 185.1], [359.7, 182.8], [353.6, 177.8], [351.2, 174.3], [348.3, 172.3]], "polygons": [[[348.3, 172.3], [345.1, 173.7], [342.6, 173.6], [338.1, 171.3], [336.2, 168.7], [321.9, 169.6], [322.3, 170.1], [321.4, 171.2], [322.9, 171.9], [322.1, 172.7], [324.4, 173.3], [324.3, 175.8], [322.0, 177.4], [321.4, 177.0], [322.3, 176.3], [322.1, 173.9], [320.1, 174.4], [319.4, 176.1], [318.1, 174.6], [316.9, 174.6], [316.7, 173.3], [314.1, 174.1], [313.9, 173.4], [315.3, 172.3], [314.8, 171.4], [308.0, 176.8], [306.8, 179.7], [295.3, 183.7], [290.6, 183.6], [284.1, 178.0], [283.0, 179.1], [282.3, 178.2], [281.1, 179.0], [283.7, 179.9], [282.6, 181.4], [282.7, 182.9], [284.4, 185.2], [283.3, 187.1], [281.3, 186.6], [280.1, 188.2], [281.8, 191.1], [288.9, 191.8], [289.4, 191.3], [288.7, 190.9], [290.9, 189.0], [293.3, 191.2], [292.6, 192.3], [293.0, 193.3], [294.8, 193.8], [295.2, 192.6], [298.1, 191.7], [299.7, 189.6], [302.2, 191.1], [306.7, 187.8], [307.9, 188.1], [307.6, 189.2], [306.7, 188.7], [305.4, 189.4], [306.6, 189.2], [308.7, 191.0], [307.7, 192.0], [308.8, 192.4], [308.3, 194.2], [305.9, 195.9], [305.9, 197.7], [306.7, 198.2], [305.2, 198.7], [305.4, 199.6], [303.4, 200.0], [303.8, 202.4], [303.0, 203.9], [303.8, 204.4], [303.0, 206.2], [304.3, 207.3], [304.3, 208.8], [300.3, 209.3], [298.8, 211.0], [294.8, 212.1], [291.6, 216.4], [288.2, 217.9], [289.8, 221.1], [288.6, 223.8], [288.2, 230.9], [291.4, 229.7], [291.7, 230.9], [288.9, 232.4], [289.9, 234.8], [289.2, 240.9], [291.3, 246.0], [289.1, 253.8], [290.7, 255.2], [291.6, 257.8], [295.8, 256.8], [295.8, 258.3], [293.3, 261.1], [293.2, 263.4], [298.6, 266.4], [298.9, 268.1], [301.7, 271.0], [305.4, 271.0], [309.1, 272.2], [312.7, 273.9], [316.4, 276.1], [320.1, 275.6], [323.8, 273.4], [327.5, 271.8], [331.2, 270.2], [334.9, 268.7], [338.6, 266.9], [342.3, 264.8], [346.0, 261.3], [349.7, 257.6], [353.4, 255.1], [357.1, 254.8], [360.8, 254.7], [364.4, 249.8], [362.6, 244.9], [362.7, 239.8], [361.4, 236.8], [362.9, 229.1], [362.4, 225.9], [364.6, 223.1], [368.8, 223.8], [369.2, 221.4], [367.8, 218.8], [367.7, 214.6], [366.4, 212.8], [365.8, 203.1], [364.3, 201.0], [365.1, 197.6], [362.7, 194.2], [364.6, 186.4], [364.0, 185.1], [359.7, 182.8], [353.6, 177.8], [351.2, 174.3], [348.3, 172.3]]], "symbolImg": "symbols/country/bear.webp"}, {"id": "terra_incognita", "name": "Непознанные Земли", "shortName": "Terra Incognita", "kanji": "未知の地", "color": "#a4b0be", "accent": "#ced6e0", "type": "neutral", "village": {"name": "Западные Руины", "title": "Забытые Цитадели", "symbol": "🧭", "x": 96, "y": 404}, "kage": "Неизвестно", "nature": "Древняя природная энергия", "clans": "Древние племена до эпохи шиноби", "terrain": "Бескрайние неизведанные плато, реликтовые леса, первозданные каньоны.", "military": "Дикие звери, гигантские призывные существа, древние автоматоны.", "danger": "Критическая (неисследованный континент, отсутствие карт).", "lore": "Огромный западный материк за границами Пяти Великих Держав, скрывающий истоки древних цивилизаций.", "labelPoint": {"x": 90.1, "y": 402.4}, "points": [[23.8, 382.9], [23.4, 389.8], [26.4, 395.9], [27.3, 406.2], [29.8, 411.8], [31.7, 424.2], [35.1, 430.8], [38.8, 433.0], [40.4, 435.7], [46.4, 439.3], [48.6, 441.8], [50.0, 445.3], [50.7, 454.1], [53.0, 459.4], [53.6, 464.6], [56.2, 468.8], [58.4, 470.9], [59.6, 473.4], [65.6, 477.6], [70.2, 484.7], [77.9, 491.3], [84.0, 489.8], [87.9, 487.7], [90.3, 484.6], [94.0, 483.9], [94.8, 482.7], [97.6, 482.2], [100.6, 480.4], [104.7, 476.2], [106.7, 470.2], [115.4, 462.2], [121.6, 457.8], [131.8, 458.8], [133.2, 460.2], [134.3, 463.8], [134.2, 467.8], [132.3, 471.4], [132.6, 474.2], [135.0, 478.1], [139.7, 482.2], [140.1, 487.4], [144.1, 497.6], [146.1, 505.4], [150.2, 508.7], [152.0, 511.6], [154.3, 511.4], [156.6, 510.1], [159.9, 511.4], [164.9, 511.6], [168.3, 509.2], [169.3, 497.9], [169.0, 494.7], [167.0, 490.0], [167.2, 482.4], [168.9, 479.8], [176.9, 478.1], [181.8, 475.0], [184.7, 472.0], [192.7, 473.3], [199.6, 476.8], [206.7, 477.6], [211.1, 479.2], [216.1, 485.7], [216.2, 488.6], [222.7, 495.6], [229.4, 488.0], [236.8, 482.2], [244.7, 479.7], [250.3, 488.8], [254.3, 491.6], [279.2, 496.7], [288.4, 500.1], [295.6, 499.2], [304.0, 494.1], [307.9, 493.9], [313.0, 496.4], [317.4, 495.6], [320.0, 497.4], [322.3, 497.8], [327.2, 504.0], [331.6, 506.7], [335.7, 505.9], [340.8, 500.1], [339.1, 492.1], [339.4, 487.6], [336.3, 478.8], [336.7, 474.3], [333.9, 470.9], [335.9, 465.7], [335.4, 462.7], [336.9, 460.2], [331.8, 451.1], [331.1, 445.7], [329.4, 444.0], [328.0, 439.4], [325.1, 438.9], [316.9, 434.1], [311.4, 429.2], [309.6, 426.2], [307.0, 425.2], [306.6, 423.9], [304.7, 422.7], [303.9, 414.6], [297.9, 410.4], [294.3, 404.9], [290.0, 405.9], [281.0, 409.9], [271.7, 409.0], [259.3, 409.1], [253.3, 413.1], [247.1, 413.3], [240.0, 410.6], [232.1, 405.7], [226.9, 404.3], [219.1, 391.8], [217.6, 383.1], [214.4, 375.1], [208.1, 373.2], [200.9, 365.8], [191.2, 363.6], [184.7, 359.3], [180.9, 349.0], [174.4, 347.3], [164.9, 343.3], [148.0, 340.2], [141.7, 340.2], [137.8, 338.7], [132.3, 331.1], [130.9, 331.9], [124.8, 330.6], [110.9, 331.1], [105.4, 333.3], [101.6, 339.6], [97.1, 342.4], [91.8, 342.8], [71.9, 347.0], [70.6, 348.6], [63.9, 350.9], [61.1, 353.0], [52.6, 355.7], [39.7, 364.8], [33.3, 367.7], [29.6, 374.2], [26.8, 376.2], [23.8, 382.9]], "polygons": [[[23.8, 382.9], [23.4, 389.8], [26.4, 395.9], [27.3, 406.2], [29.8, 411.8], [31.7, 424.2], [35.1, 430.8], [38.8, 433.0], [40.4, 435.7], [46.4, 439.3], [48.6, 441.8], [50.0, 445.3], [50.7, 454.1], [53.0, 459.4], [53.6, 464.6], [56.2, 468.8], [58.4, 470.9], [59.6, 473.4], [65.6, 477.6], [70.2, 484.7], [77.9, 491.3], [84.0, 489.8], [87.9, 487.7], [90.3, 484.6], [94.0, 483.9], [94.8, 482.7], [97.6, 482.2], [100.6, 480.4], [104.7, 476.2], [106.7, 470.2], [115.4, 462.2], [121.6, 457.8], [131.8, 458.8], [133.2, 460.2], [134.3, 463.8], [134.2, 467.8], [132.3, 471.4], [132.6, 474.2], [135.0, 478.1], [139.7, 482.2], [140.1, 487.4], [144.1, 497.6], [146.1, 505.4], [150.2, 508.7], [152.0, 511.6], [154.3, 511.4], [156.6, 510.1], [159.9, 511.4], [164.9, 511.6], [168.3, 509.2], [169.3, 497.9], [169.0, 494.7], [167.0, 490.0], [167.2, 482.4], [168.9, 479.8], [176.9, 478.1], [181.8, 475.0], [184.7, 472.0], [192.7, 473.3], [199.6, 476.8], [206.7, 477.6], [211.1, 479.2], [216.1, 485.7], [216.2, 488.6], [222.7, 495.6], [229.4, 488.0], [236.8, 482.2], [244.7, 479.7], [250.3, 488.8], [254.3, 491.6], [279.2, 496.7], [288.4, 500.1], [295.6, 499.2], [304.0, 494.1], [307.9, 493.9], [313.0, 496.4], [317.4, 495.6], [320.0, 497.4], [322.3, 497.8], [327.2, 504.0], [331.6, 506.7], [335.7, 505.9], [340.8, 500.1], [339.1, 492.1], [339.4, 487.6], [336.3, 478.8], [336.7, 474.3], [333.9, 470.9], [335.9, 465.7], [335.4, 462.7], [336.9, 460.2], [331.8, 451.1], [331.1, 445.7], [329.4, 444.0], [328.0, 439.4], [325.1, 438.9], [316.9, 434.1], [311.4, 429.2], [309.6, 426.2], [307.0, 425.2], [306.6, 423.9], [304.7, 422.7], [303.9, 414.6], [297.9, 410.4], [294.3, 404.9], [290.0, 405.9], [281.0, 409.9], [271.7, 409.0], [259.3, 409.1], [253.3, 413.1], [247.1, 413.3], [240.0, 410.6], [232.1, 405.7], [226.9, 404.3], [219.1, 391.8], [217.6, 383.1], [214.4, 375.1], [208.1, 373.2], [200.9, 365.8], [191.2, 363.6], [184.7, 359.3], [180.9, 349.0], [174.4, 347.3], [164.9, 343.3], [148.0, 340.2], [141.7, 340.2], [137.8, 338.7], [132.3, 331.1], [130.9, 331.9], [124.8, 330.6], [110.9, 331.1], [105.4, 333.3], [101.6, 339.6], [97.1, 342.4], [91.8, 342.8], [71.9, 347.0], [70.6, 348.6], [63.9, 350.9], [61.1, 353.0], [52.6, 355.7], [39.7, 364.8], [33.3, 367.7], [29.6, 374.2], [26.8, 376.2], [23.8, 382.9]]]}, {"id": "mount_koryu", "name": "Гора Корю", "shortName": "Корю", "kanji": "黄龍山", "color": "#3c40c6", "accent": "#575fcf", "type": "neutral", "village": {"name": "Цитадель Корю", "title": "Священная Твердыня Жёлтого Дракона", "symbol": "🐉", "x": 378, "y": 505}, "kage": "Великий Жаб-Мудрец", "nature": "Дотон / Катон (Земля и Огонь)", "clans": "Клан Кагеро (Ниндзя Стрекозы)", "terrain": "Горные твердыни, лабиринты тоннелей, глубокие ущелья и древние форпосты", "military": "Элитные мастера скрытых ловушек, подземных ходов и обороны цитадели", "danger": "Высокая (сеть смертоносных древних ловушек и заминированных скал)", "lore": "Священная Гора Корю (黃龍山) — неприступный горный оплот, где переплетаются легенды о ниндзя деревни Стрекозы (Кагеро) и мастере ловушек Генно. Подземные ходы горы хранят древние арсеналы и тайны ниндзюцу земли.", "labelPoint": {"x": 377.9, "y": 511.2}, "points": [[328.7, 439.3], [329.7, 443.3], [331.3, 445.0], [332.4, 448.3], [332.2, 450.9], [337.6, 460.2], [335.9, 462.9], [336.3, 465.9], [334.4, 470.7], [337.2, 474.2], [336.8, 478.6], [339.9, 487.3], [339.8, 493.7], [341.3, 499.6], [340.7, 501.6], [344.9, 503.3], [349.7, 507.3], [355.4, 515.2], [362.7, 527.4], [362.6, 530.2], [360.0, 533.9], [354.2, 538.2], [358.4, 538.1], [364.9, 535.2], [370.0, 539.3], [376.1, 540.0], [381.3, 536.3], [383.7, 536.2], [388.9, 539.2], [395.7, 546.6], [397.7, 547.0], [398.8, 537.7], [402.6, 532.1], [396.8, 531.2], [397.7, 527.7], [400.1, 523.4], [398.9, 516.8], [399.1, 506.6], [401.3, 501.6], [406.7, 495.4], [409.8, 490.3], [409.9, 485.6], [409.1, 484.0], [409.7, 479.9], [416.0, 475.2], [423.4, 472.8], [428.2, 469.8], [439.7, 465.3], [443.1, 460.6], [437.8, 455.1], [430.6, 450.9], [427.9, 447.0], [424.2, 446.2], [421.0, 446.4], [413.1, 450.1], [406.4, 451.0], [393.8, 456.1], [383.8, 456.3], [379.3, 455.1], [375.9, 450.1], [370.7, 447.8], [366.3, 443.9], [353.1, 443.6], [345.2, 444.3], [328.7, 439.3]], "polygons": [[[328.7, 439.3], [329.7, 443.3], [331.3, 445.0], [332.4, 448.3], [332.2, 450.9], [337.6, 460.2], [335.9, 462.9], [336.3, 465.9], [334.4, 470.7], [337.2, 474.2], [336.8, 478.6], [339.9, 487.3], [339.8, 493.7], [341.3, 499.6], [340.7, 501.6], [344.9, 503.3], [349.7, 507.3], [355.4, 515.2], [362.7, 527.4], [362.6, 530.2], [360.0, 533.9], [354.2, 538.2], [358.4, 538.1], [364.9, 535.2], [370.0, 539.3], [376.1, 540.0], [381.3, 536.3], [383.7, 536.2], [388.9, 539.2], [395.7, 546.6], [397.7, 547.0], [398.8, 537.7], [402.6, 532.1], [396.8, 531.2], [397.7, 527.7], [400.1, 523.4], [398.9, 516.8], [399.1, 506.6], [401.3, 501.6], [406.7, 495.4], [409.8, 490.3], [409.9, 485.6], [409.1, 484.0], [409.7, 479.9], [416.0, 475.2], [423.4, 472.8], [428.2, 469.8], [439.7, 465.3], [443.1, 460.6], [437.8, 455.1], [430.6, 450.9], [427.9, 447.0], [424.2, 446.2], [421.0, 446.4], [413.1, 450.1], [406.4, 451.0], [393.8, 456.1], [383.8, 456.3], [379.3, 455.1], [375.9, 450.1], [370.7, 447.8], [366.3, 443.9], [353.1, 443.6], [345.2, 444.3], [328.7, 439.3]]]}, {"id": "mountains", "name": "Страна Гор", "shortName": "Горы", "kanji": "山の国", "color": "#2f3542", "accent": "#747d8c", "type": "small", "village": {"name": "Кагеро", "title": "Деревня Стрекоз", "symbol": "🪨", "x": 440, "y": 510}, "kage": "Глава Кагеро", "nature": "Стихия Земли", "clans": "Генно и мастера ловушек", "terrain": "Острые как бритва горные хребты, глубокие шахты, пещеры.", "military": "Мастера подрывных ловушек и засад.", "danger": "Высокая (минные поля, горные обвалы).", "lore": "Историческое горное государство, долгое время воевавшее с Конохой и уничтоженное в давнем конфликте.", "labelPoint": {"x": 434.7, "y": 493.8}, "points": [[510.4, 464.2], [507.7, 464.2], [502.7, 466.7], [497.9, 471.4], [489.1, 473.9], [483.2, 473.2], [471.1, 484.6], [466.6, 486.4], [461.9, 486.3], [456.4, 484.3], [452.9, 479.8], [452.9, 475.2], [451.1, 470.4], [447.4, 464.7], [443.7, 461.6], [439.9, 465.8], [412.8, 477.6], [409.9, 480.7], [410.4, 489.8], [409.8, 491.7], [401.8, 501.8], [399.8, 505.7], [399.3, 516.6], [400.6, 523.7], [398.1, 527.9], [397.3, 531.2], [401.7, 531.1], [403.2, 532.1], [399.2, 537.9], [398.1, 547.4], [409.8, 554.8], [416.7, 563.3], [423.8, 565.3], [426.3, 563.9], [431.8, 564.6], [435.4, 561.7], [435.8, 560.6], [437.8, 559.9], [439.1, 557.8], [440.6, 558.1], [443.0, 556.9], [444.9, 558.0], [453.2, 557.0], [461.1, 554.0], [475.3, 551.8], [479.9, 549.4], [490.3, 538.3], [494.8, 535.7], [499.4, 534.8], [500.0, 533.6], [501.7, 533.2], [503.2, 531.3], [501.9, 529.7], [504.3, 528.9], [505.1, 527.1], [504.6, 526.1], [506.1, 525.7], [508.3, 515.8], [505.3, 510.8], [505.2, 506.3], [504.1, 502.7], [504.1, 495.6], [506.7, 489.2], [511.0, 484.0], [511.3, 480.0], [509.3, 473.6], [510.9, 467.1], [510.4, 464.2]], "polygons": [[[510.4, 464.2], [507.7, 464.2], [502.7, 466.7], [497.9, 471.4], [489.1, 473.9], [483.2, 473.2], [471.1, 484.6], [466.6, 486.4], [461.9, 486.3], [456.4, 484.3], [452.9, 479.8], [452.9, 475.2], [451.1, 470.4], [447.4, 464.7], [443.7, 461.6], [439.9, 465.8], [412.8, 477.6], [409.9, 480.7], [410.4, 489.8], [409.8, 491.7], [401.8, 501.8], [399.8, 505.7], [399.3, 516.6], [400.6, 523.7], [398.1, 527.9], [397.3, 531.2], [401.7, 531.1], [403.2, 532.1], [399.2, 537.9], [398.1, 547.4], [409.8, 554.8], [416.7, 563.3], [423.8, 565.3], [426.3, 563.9], [431.8, 564.6], [435.4, 561.7], [435.8, 560.6], [437.8, 559.9], [439.1, 557.8], [440.6, 558.1], [443.0, 556.9], [444.9, 558.0], [453.2, 557.0], [461.1, 554.0], [475.3, 551.8], [479.9, 549.4], [490.3, 538.3], [494.8, 535.7], [499.4, 534.8], [500.0, 533.6], [501.7, 533.2], [503.2, 531.3], [501.9, 529.7], [504.3, 528.9], [505.1, 527.1], [504.6, 526.1], [506.1, 525.7], [508.3, 515.8], [505.3, 510.8], [505.2, 506.3], [504.1, 502.7], [504.1, 495.6], [506.7, 489.2], [511.0, 484.0], [511.3, 480.0], [509.3, 473.6], [510.9, 467.1], [510.4, 464.2]]]}, {"id": "noodles", "name": "Страна Лапши", "shortName": "Лапша", "kanji": "うどんの国", "color": "#b71540", "accent": "#e55039", "type": "small", "village": {"name": "Меня", "title": "Лапшичные артели", "symbol": "🍜", "x": 380, "y": 562}, "kage": "Даймё Лапши", "nature": "Стихия Воды и Огня", "clans": "Кулинарные гильдии", "terrain": "Плодородные пшеничные поля, речные мельницы.", "military": "Наёмная охрана торговых гильдий.", "danger": "Низкая (мирная аграрная страна).", "lore": "Житница юга, поставляющая муку и знаменитую лапшу ко дворам всех даймё.", "labelPoint": {"x": 325.2, "y": 542.8}, "points": [[298.9, 497.8], [299.8, 503.3], [297.1, 510.4], [299.2, 519.9], [300.1, 521.0], [299.4, 522.9], [299.9, 525.4], [299.0, 529.9], [297.4, 530.8], [296.6, 539.2], [293.9, 542.0], [293.7, 543.6], [295.1, 546.4], [293.2, 551.3], [292.6, 558.3], [298.6, 561.0], [301.0, 564.3], [310.4, 570.0], [316.7, 569.9], [316.1, 572.7], [321.1, 572.7], [329.1, 575.4], [335.2, 575.2], [341.7, 577.2], [344.2, 581.9], [348.7, 585.3], [358.0, 589.7], [369.8, 602.7], [374.0, 605.6], [381.6, 601.9], [385.2, 599.0], [387.3, 598.7], [388.6, 599.6], [391.1, 596.4], [394.8, 595.8], [399.3, 589.0], [403.1, 586.1], [406.3, 586.0], [409.6, 582.6], [416.2, 578.1], [418.9, 570.8], [423.1, 567.4], [423.6, 565.8], [416.4, 563.8], [409.6, 555.2], [401.8, 549.8], [395.6, 547.2], [388.7, 539.8], [383.8, 536.9], [381.3, 537.0], [376.4, 540.6], [369.2, 539.7], [364.7, 535.8], [358.7, 538.7], [353.4, 538.8], [353.8, 537.6], [359.4, 533.7], [362.0, 530.0], [362.1, 527.7], [350.1, 508.8], [343.9, 503.4], [340.4, 502.1], [335.9, 506.3], [331.3, 507.1], [327.0, 504.4], [321.9, 498.1], [319.7, 497.9], [317.2, 496.0], [312.8, 496.9], [307.6, 494.3], [304.6, 494.4], [298.9, 497.8]], "polygons": [[[298.9, 497.8], [299.8, 503.3], [297.1, 510.4], [299.2, 519.9], [300.1, 521.0], [299.4, 522.9], [299.9, 525.4], [299.0, 529.9], [297.4, 530.8], [296.6, 539.2], [293.9, 542.0], [293.7, 543.6], [295.1, 546.4], [293.2, 551.3], [292.6, 558.3], [298.6, 561.0], [301.0, 564.3], [310.4, 570.0], [316.7, 569.9], [316.1, 572.7], [321.1, 572.7], [329.1, 575.4], [335.2, 575.2], [341.7, 577.2], [344.2, 581.9], [348.7, 585.3], [358.0, 589.7], [369.8, 602.7], [374.0, 605.6], [381.6, 601.9], [385.2, 599.0], [387.3, 598.7], [388.6, 599.6], [391.1, 596.4], [394.8, 595.8], [399.3, 589.0], [403.1, 586.1], [406.3, 586.0], [409.6, 582.6], [416.2, 578.1], [418.9, 570.8], [423.1, 567.4], [423.6, 565.8], [416.4, 563.8], [409.6, 555.2], [401.8, 549.8], [395.6, 547.2], [388.7, 539.8], [383.8, 536.9], [381.3, 537.0], [376.4, 540.6], [369.2, 539.7], [364.7, 535.8], [358.7, 538.7], [353.4, 538.8], [353.8, 537.6], [359.4, 533.7], [362.0, 530.0], [362.1, 527.7], [350.1, 508.8], [343.9, 503.4], [340.4, 502.1], [335.9, 506.3], [331.3, 507.1], [327.0, 504.4], [321.9, 498.1], [319.7, 497.9], [317.2, 496.0], [312.8, 496.9], [307.6, 494.3], [304.6, 494.4], [298.9, 497.8]]], "symbolImg": "symbols/country/noodle.webp"}, {"id": "honey", "name": "Страна Мёда", "shortName": "Мёд", "kanji": "蜜の国", "color": "#e67e22", "accent": "#f39c12", "type": "small", "village": {"name": "Хачимицу", "title": "Пасеки Мёда", "symbol": "🍯", "x": 310, "y": 595}, "kage": "Даймё Мёда", "nature": "Стихия Земли", "clans": "Пчеловоды клана Камизуру (ветвь)", "terrain": "Цветущие медоносные луга, пасечные холмы.", "military": "Боевые пчёлы, наёмники.", "danger": "Низкая.", "lore": "Мирное южное государство, известное производством целебного горного мёда и маточного молочка для ирьенинов.", "labelPoint": {"x": 316.2, "y": 600.9}, "points": [[267.8, 584.3], [268.1, 588.1], [274.8, 592.1], [281.7, 601.2], [293.0, 606.8], [308.9, 620.7], [316.4, 620.8], [318.4, 619.4], [322.2, 619.0], [330.6, 613.4], [335.0, 608.1], [336.7, 608.3], [338.7, 610.1], [346.4, 610.9], [348.1, 612.2], [351.4, 611.9], [362.4, 613.3], [368.3, 610.8], [373.3, 606.1], [368.8, 602.4], [357.8, 590.2], [347.0, 584.9], [343.2, 581.6], [341.4, 577.8], [335.0, 575.8], [329.6, 576.1], [320.9, 573.2], [315.7, 573.1], [314.9, 576.4], [309.3, 583.2], [306.3, 585.2], [304.0, 585.1], [301.2, 586.4], [294.1, 586.2], [290.0, 584.7], [279.8, 585.4], [267.8, 584.3]], "polygons": [[[267.8, 584.3], [268.1, 588.1], [274.8, 592.1], [281.7, 601.2], [293.0, 606.8], [308.9, 620.7], [316.4, 620.8], [318.4, 619.4], [322.2, 619.0], [330.6, 613.4], [335.0, 608.1], [336.7, 608.3], [338.7, 610.1], [346.4, 610.9], [348.1, 612.2], [351.4, 611.9], [362.4, 613.3], [368.3, 610.8], [373.3, 606.1], [368.8, 602.4], [357.8, 590.2], [347.0, 584.9], [343.2, 581.6], [341.4, 577.8], [335.0, 575.8], [329.6, 576.1], [320.9, 573.2], [315.7, 573.1], [314.9, 576.4], [309.3, 583.2], [306.3, 585.2], [304.0, 585.1], [301.2, 586.4], [294.1, 586.2], [290.0, 584.7], [279.8, 585.4], [267.8, 584.3]]]}, {"id": "bean_jam", "name": "Страна Бобовой Пасты", "shortName": "Анко", "kanji": "餡の国", "color": "#6ab04c", "accent": "#badc58", "type": "small", "village": {"name": "Адзуки", "title": "Бобовые угодья", "symbol": "🫘", "x": 250, "y": 540}, "kage": "Даймё Анко", "nature": "Стихия Воды и Земли", "clans": "Торговцы сладостями", "terrain": "Поля бобов адзуки, террасы, сады.", "military": "Караванная стража.", "danger": "Низкая.", "lore": "Традиционный поставщик красной сладкой бобовой пасты для кондитерских Конохи и Суны.", "labelPoint": {"x": 259.9, "y": 525.4}, "points": [[229.7, 488.4], [223.0, 496.6], [223.1, 499.1], [224.7, 502.0], [224.1, 509.8], [225.2, 510.9], [224.6, 518.6], [225.7, 525.3], [225.1, 533.0], [228.3, 538.7], [233.1, 543.3], [236.1, 548.1], [238.2, 553.7], [241.6, 556.1], [242.0, 558.2], [251.4, 556.6], [270.8, 557.8], [276.4, 556.2], [284.8, 555.8], [291.9, 558.1], [292.7, 551.1], [294.6, 546.2], [293.1, 543.8], [293.2, 541.8], [296.0, 539.0], [296.8, 530.8], [298.3, 529.8], [299.3, 525.2], [298.9, 522.7], [299.6, 521.2], [298.7, 520.1], [296.6, 510.7], [299.0, 504.4], [298.4, 498.4], [292.6, 500.6], [288.2, 500.6], [279.0, 497.1], [255.7, 492.6], [249.9, 489.0], [244.4, 480.1], [237.0, 482.8], [229.7, 488.4]], "polygons": [[[229.7, 488.4], [223.0, 496.6], [223.1, 499.1], [224.7, 502.0], [224.1, 509.8], [225.2, 510.9], [224.6, 518.6], [225.7, 525.3], [225.1, 533.0], [228.3, 538.7], [233.1, 543.3], [236.1, 548.1], [238.2, 553.7], [241.6, 556.1], [242.0, 558.2], [251.4, 556.6], [270.8, 557.8], [276.4, 556.2], [284.8, 555.8], [291.9, 558.1], [292.7, 551.1], [294.6, 546.2], [293.1, 543.8], [293.2, 541.8], [296.0, 539.0], [296.8, 530.8], [298.3, 529.8], [299.3, 525.2], [298.9, 522.7], [299.6, 521.2], [298.7, 520.1], [296.6, 510.7], [299.0, 504.4], [298.4, 498.4], [292.6, 500.6], [288.2, 500.6], [279.0, 497.1], [255.7, 492.6], [249.9, 489.0], [244.4, 480.1], [237.0, 482.8], [229.7, 488.4]]]}, {"id": "neck", "name": "Страна Шеи", "shortName": "Шея", "kanji": "首の国", "color": "#f0932b", "accent": "#ffbe76", "type": "small", "village": {"name": "Куби", "title": "Крепость Перешейка", "symbol": "🏰", "x": 270, "y": 570}, "kage": "Даймё Шеи", "nature": "Стихия Земли", "clans": "Хранители перешейка", "terrain": "Узкий скалистый перешеек между заливами.", "military": "Крепостная гарнизонная стража.", "danger": "Средняя (таможенные посты).", "lore": "Стратегический перешеек, контролирующий сухопутные караванные пути к южным океанским портам.", "labelPoint": {"x": 280.4, "y": 570.7}, "points": [[316.1, 570.9], [309.3, 570.2], [300.8, 564.9], [298.3, 561.6], [295.9, 560.0], [285.4, 556.3], [276.7, 556.8], [271.0, 558.3], [251.3, 557.2], [242.3, 559.2], [243.3, 561.1], [248.3, 564.0], [249.4, 569.2], [253.4, 573.0], [256.6, 578.1], [261.0, 578.9], [265.3, 581.2], [267.7, 583.8], [280.0, 584.9], [290.2, 584.1], [295.9, 585.9], [301.0, 585.9], [303.8, 584.6], [306.1, 584.7], [309.8, 582.0], [310.7, 579.9], [314.3, 576.2], [316.1, 570.9]], "polygons": [[[316.1, 570.9], [309.3, 570.2], [300.8, 564.9], [298.3, 561.6], [295.9, 560.0], [285.4, 556.3], [276.7, 556.8], [271.0, 558.3], [251.3, 557.2], [242.3, 559.2], [243.3, 561.1], [248.3, 564.0], [249.4, 569.2], [253.4, 573.0], [256.6, 578.1], [261.0, 578.9], [265.3, 581.2], [267.7, 583.8], [280.0, 584.9], [290.2, 584.1], [295.9, 585.9], [301.0, 585.9], [303.8, 584.6], [306.1, 584.7], [309.8, 582.0], [310.7, 579.9], [314.3, 576.2], [316.1, 570.9]]], "symbolImg": "symbols/country/neck.webp"}, {"id": "wastelands", "name": "Необитаемые Пустоши", "shortName": "Пустоши", "kanji": "荒地", "color": "#eb4d4b", "accent": "#ff7979", "type": "neutral", "village": {"name": "Заброшенный порт", "title": "Руины пиратов", "symbol": "☠️", "x": 180, "y": 630}, "kage": "Нет", "nature": "Стихия Земли", "clans": "Отверженные", "terrain": "Мёртвая земля, солончаки, радиоактивные пустоши.", "military": "Банды беглых нукенинов.", "danger": "Очень высокая (отсутствие закона, засады).", "lore": "Изолированный остров на крайнем юго-западе, служащий пристанищем для преступников и изгоев.", "labelPoint": {"x": 178.0, "y": 630.8}, "points": [[195.2, 542.7], [187.7, 543.0], [183.4, 545.1], [172.7, 560.8], [166.9, 570.9], [166.6, 581.7], [169.8, 587.2], [170.4, 596.6], [167.6, 601.0], [159.7, 605.8], [156.0, 609.0], [146.1, 624.7], [145.3, 628.7], [146.4, 639.7], [148.8, 640.7], [152.9, 640.7], [155.2, 642.4], [159.9, 653.2], [160.3, 659.9], [158.0, 674.8], [164.3, 676.3], [171.8, 672.3], [177.1, 672.1], [179.0, 677.0], [180.2, 677.9], [190.4, 680.7], [192.6, 680.1], [193.7, 678.6], [193.9, 671.8], [191.1, 663.7], [187.1, 658.7], [186.4, 654.2], [187.4, 652.6], [192.7, 648.7], [199.4, 647.0], [202.9, 651.0], [205.2, 655.3], [211.7, 655.1], [215.6, 650.7], [220.4, 640.3], [221.3, 636.0], [219.8, 627.7], [211.4, 613.7], [207.4, 612.9], [201.6, 615.2], [194.9, 614.8], [192.0, 612.4], [192.8, 608.2], [191.9, 600.4], [190.0, 596.3], [190.3, 592.8], [187.1, 588.9], [187.3, 585.0], [190.3, 579.3], [199.0, 579.3], [203.8, 580.7], [205.8, 579.0], [207.8, 579.1], [209.7, 582.6], [212.3, 584.0], [212.8, 586.6], [212.0, 587.7], [213.3, 587.8], [215.7, 590.0], [220.3, 582.9], [219.9, 576.6], [215.8, 572.7], [214.1, 568.6], [210.3, 565.6], [206.9, 559.7], [200.3, 552.4], [198.9, 545.7], [195.2, 542.7]], "polygons": [[[195.2, 542.7], [187.7, 543.0], [183.4, 545.1], [172.7, 560.8], [166.9, 570.9], [166.6, 581.7], [169.8, 587.2], [170.4, 596.6], [167.6, 601.0], [159.7, 605.8], [156.0, 609.0], [146.1, 624.7], [145.3, 628.7], [146.4, 639.7], [148.8, 640.7], [152.9, 640.7], [155.2, 642.4], [159.9, 653.2], [160.3, 659.9], [158.0, 674.8], [164.3, 676.3], [171.8, 672.3], [177.1, 672.1], [179.0, 677.0], [180.2, 677.9], [190.4, 680.7], [192.6, 680.1], [193.7, 678.6], [193.9, 671.8], [191.1, 663.7], [187.1, 658.7], [186.4, 654.2], [187.4, 652.6], [192.7, 648.7], [199.4, 647.0], [202.9, 651.0], [205.2, 655.3], [211.7, 655.1], [215.6, 650.7], [220.4, 640.3], [221.3, 636.0], [219.8, 627.7], [211.4, 613.7], [207.4, 612.9], [201.6, 615.2], [194.9, 614.8], [192.0, 612.4], [192.8, 608.2], [191.9, 600.4], [190.0, 596.3], [190.3, 592.8], [187.1, 588.9], [187.3, 585.0], [190.3, 579.3], [199.0, 579.3], [203.8, 580.7], [205.8, 579.0], [207.8, 579.1], [209.7, 582.6], [212.3, 584.0], [212.8, 586.6], [212.0, 587.7], [213.3, 587.8], [215.7, 590.0], [220.3, 582.9], [219.9, 576.6], [215.8, 572.7], [214.1, 568.6], [210.3, 565.6], [206.9, 559.7], [200.3, 552.4], [198.9, 545.7], [195.2, 542.7]]]}, {"id": "valleys", "name": "Страна Долин", "shortName": "Долины", "kanji": "谷の国", "color": "#0097e6", "accent": "#00a8ff", "type": "small", "village": {"name": "Танигакуре", "title": "Деревня Скрытой Долины", "symbol": "🏞️", "x": 305, "y": 145, "symbolImg": "symbols/village/Tanigakure_Symbol.webp"}, "kage": "Глава Тани", "nature": "Стихия Ветра и Воды", "clans": "Учёные лабораторий Долин", "terrain": "Глубокие речные каньоны, мосты, ветряные мельницы.", "military": "Биомодифицированные ниндзя (эксперименты с ДНК Дерева).", "danger": "Высокая (секретные биологические разработки).", "lore": "Расположена к северо-западу от Земли. Известна попытками возродить клетки Первого Хокаге.", "labelPoint": {"x": 318.8, "y": 151.2}, "points": [[356.6, 144.6], [351.2, 145.6], [348.2, 147.4], [342.1, 147.6], [337.2, 142.8], [334.0, 141.6], [333.8, 139.1], [331.2, 133.3], [324.7, 127.1], [320.1, 125.6], [314.8, 129.8], [311.3, 134.7], [307.7, 136.2], [305.0, 136.3], [301.1, 130.7], [300.6, 126.7], [306.9, 124.4], [310.2, 121.6], [314.9, 119.8], [315.6, 117.6], [309.0, 115.8], [305.3, 116.6], [299.7, 115.3], [293.6, 116.8], [290.4, 119.3], [287.8, 123.1], [287.7, 135.7], [284.0, 144.3], [280.8, 147.0], [282.8, 149.3], [283.6, 152.4], [285.3, 153.3], [288.2, 157.1], [289.2, 160.8], [290.7, 161.8], [293.9, 167.4], [289.0, 170.4], [284.8, 170.4], [283.6, 177.0], [290.4, 183.3], [296.0, 183.4], [306.8, 179.4], [307.8, 176.9], [310.3, 175.4], [316.3, 169.0], [319.3, 169.9], [336.6, 168.4], [339.9, 163.6], [344.7, 160.6], [352.2, 157.4], [355.6, 152.7], [355.4, 151.0], [356.9, 148.1], [356.6, 144.6]], "polygons": [[[356.6, 144.6], [351.2, 145.6], [348.2, 147.4], [342.1, 147.6], [337.2, 142.8], [334.0, 141.6], [333.8, 139.1], [331.2, 133.3], [324.7, 127.1], [320.1, 125.6], [314.8, 129.8], [311.3, 134.7], [307.7, 136.2], [305.0, 136.3], [301.1, 130.7], [300.6, 126.7], [306.9, 124.4], [310.2, 121.6], [314.9, 119.8], [315.6, 117.6], [309.0, 115.8], [305.3, 116.6], [299.7, 115.3], [293.6, 116.8], [290.4, 119.3], [287.8, 123.1], [287.7, 135.7], [284.0, 144.3], [280.8, 147.0], [282.8, 149.3], [283.6, 152.4], [285.3, 153.3], [288.2, 157.1], [289.2, 160.8], [290.7, 161.8], [293.9, 167.4], [289.0, 170.4], [284.8, 170.4], [283.6, 177.0], [290.4, 183.3], [296.0, 183.4], [306.8, 179.4], [307.8, 176.9], [310.3, 175.4], [316.3, 169.0], [319.3, 169.9], [336.6, 168.4], [339.9, 163.6], [344.7, 160.6], [352.2, 157.4], [355.6, 152.7], [355.4, 151.0], [356.9, 148.1], [356.6, 144.6]]]}, {"id": "silence", "name": "Страна Безмолвия", "shortName": "Безмолвие", "kanji": "黙の国", "color": "#353b48", "accent": "#718093", "type": "small", "village": {"name": "Шидзима", "title": "Обитель Безмолвия", "symbol": "🤫", "x": 373, "y": 90}, "kage": "Генго", "nature": "Гендзюцу голоса", "clans": "Слушатели Генго", "terrain": "Тёмные ущелья, глухие туманы, тихие замки.", "military": "Фанатичные ронины, зомбированные гендзюцу речевого внушения.", "danger": "Критическая (промывка мозгов, фанатики).", "lore": "Государство-секта под предводительством Генго, использовавшего силу звука для подчинения шиноби.", "labelPoint": {"x": 378.1, "y": 95.2}, "points": [[412.2, 77.2], [410.6, 75.2], [404.6, 73.0], [398.9, 77.4], [396.3, 78.4], [393.3, 81.6], [385.1, 80.4], [382.4, 78.8], [376.0, 78.6], [368.4, 81.7], [362.8, 86.3], [354.1, 86.8], [346.8, 89.2], [335.7, 96.7], [332.9, 100.4], [331.7, 104.3], [324.8, 110.3], [322.8, 114.3], [325.6, 116.4], [326.3, 119.4], [335.7, 123.1], [339.7, 126.0], [348.0, 125.0], [352.3, 122.0], [359.1, 119.4], [359.6, 117.7], [362.9, 115.0], [364.2, 110.8], [379.8, 111.3], [387.0, 109.4], [390.3, 106.4], [404.0, 99.4], [404.8, 95.6], [406.3, 92.3], [408.2, 90.9], [408.6, 89.2], [406.8, 85.1], [409.6, 84.0], [410.4, 82.4], [412.7, 81.2], [412.2, 77.2]], "polygons": [[[412.2, 77.2], [410.6, 75.2], [404.6, 73.0], [398.9, 77.4], [396.3, 78.4], [393.3, 81.6], [385.1, 80.4], [382.4, 78.8], [376.0, 78.6], [368.4, 81.7], [362.8, 86.3], [354.1, 86.8], [346.8, 89.2], [335.7, 96.7], [332.9, 100.4], [331.7, 104.3], [324.8, 110.3], [322.8, 114.3], [325.6, 116.4], [326.3, 119.4], [335.7, 123.1], [339.7, 126.0], [348.0, 125.0], [352.3, 122.0], [359.1, 119.4], [359.6, 117.7], [362.9, 115.0], [364.2, 110.8], [379.8, 111.3], [387.0, 109.4], [390.3, 106.4], [404.0, 99.4], [404.8, 95.6], [406.3, 92.3], [408.2, 90.9], [408.6, 89.2], [406.8, 85.1], [409.6, 84.0], [410.4, 82.4], [412.7, 81.2], [412.2, 77.2]]]}, {"id": "haze", "name": "Страна Мглы", "shortName": "Мгла", "kanji": "霞の国", "color": "#74b9ff", "accent": "#a29bfe", "type": "small", "village": {"name": "Касуми", "title": "Посёлок Мглы", "symbol": "🌫️", "x": 380, "y": 135}, "kage": "Старейшина Касуми", "nature": "Стихия Ветра и Воды", "clans": "Ниндзя тумана Касуми", "terrain": "Холодные низины с постоянной дымкой.", "military": "Следопыты дымовых завес.", "danger": "Средняя.", "lore": "Буферная зона на северной границе Страны Земли, скрытая в густой утренней дымке.", "labelPoint": {"x": 387.7, "y": 129.2}, "points": [[437.2, 116.2], [436.0, 114.9], [430.9, 115.8], [426.9, 114.6], [422.8, 115.1], [419.1, 114.4], [417.9, 113.0], [417.9, 109.7], [420.8, 101.1], [406.9, 102.6], [404.2, 100.0], [390.6, 107.0], [387.4, 109.9], [380.6, 111.9], [379.4, 114.1], [366.7, 121.2], [360.9, 127.7], [359.2, 133.4], [361.7, 135.7], [367.3, 138.6], [373.8, 144.2], [379.0, 145.9], [391.4, 146.6], [394.3, 145.8], [401.3, 140.6], [403.9, 135.3], [409.3, 128.9], [419.9, 126.1], [423.8, 122.6], [435.8, 119.6], [437.2, 118.8], [437.2, 116.2]], "polygons": [[[437.2, 116.2], [436.0, 114.9], [430.9, 115.8], [426.9, 114.6], [422.8, 115.1], [419.1, 114.4], [417.9, 113.0], [417.9, 109.7], [420.8, 101.1], [406.9, 102.6], [404.2, 100.0], [390.6, 107.0], [387.4, 109.9], [380.6, 111.9], [379.4, 114.1], [366.7, 121.2], [360.9, 127.7], [359.2, 133.4], [361.7, 135.7], [367.3, 138.6], [373.8, 144.2], [379.0, 145.9], [391.4, 146.6], [394.3, 145.8], [401.3, 140.6], [403.9, 135.3], [409.3, 128.9], [419.9, 126.1], [423.8, 122.6], [435.8, 119.6], [437.2, 118.8], [437.2, 116.2]]]}, {"id": "vegetables", "name": "Страна Овощей", "shortName": "Овощи", "kanji": "菜の国", "color": "#2ed573", "accent": "#7bed9f", "type": "small", "village": {"name": "Ясай", "title": "Земледельческие общины", "symbol": "🥬", "x": 450, "y": 95}, "kage": "Даймё Харуна", "nature": "Стихия Земли", "clans": "Род Харуны", "terrain": "Плодородные холмы, теплицы, овощные террасы.", "military": "Наёмные отряды шиноби (Рука Дзянина).", "danger": "Низкая (мирные фермерские угодья).", "lore": "Маленькое мирное царство на севере, известное богатыми урожаями и караванами зелени.", "labelPoint": {"x": 464.4, "y": 95.6}, "points": [[421.4, 74.1], [420.1, 77.1], [421.4, 83.4], [428.3, 83.9], [431.2, 82.4], [431.9, 85.8], [430.3, 88.0], [429.7, 91.7], [430.7, 94.1], [432.3, 94.3], [431.6, 95.7], [439.1, 96.7], [441.6, 96.0], [441.9, 98.9], [439.4, 101.1], [438.8, 104.1], [442.6, 105.4], [441.4, 107.3], [441.9, 109.1], [440.0, 109.1], [438.7, 107.8], [437.3, 108.3], [434.6, 107.8], [432.1, 109.3], [433.2, 111.2], [437.0, 110.7], [439.8, 113.3], [442.7, 114.2], [442.4, 115.3], [441.2, 115.2], [442.1, 118.3], [447.7, 120.1], [455.9, 118.3], [467.1, 118.1], [470.2, 116.6], [475.2, 116.6], [478.7, 114.8], [484.6, 114.9], [483.6, 113.3], [483.4, 110.4], [490.4, 101.2], [488.9, 96.2], [486.4, 93.2], [486.1, 88.1], [492.2, 76.3], [492.1, 74.4], [485.1, 68.9], [482.0, 67.9], [473.3, 67.7], [461.2, 74.0], [455.1, 74.7], [450.6, 73.8], [445.4, 75.2], [441.0, 72.8], [440.3, 69.1], [442.0, 65.3], [438.9, 64.0], [430.0, 67.2], [421.4, 74.1]], "polygons": [[[421.4, 74.1], [420.1, 77.1], [421.4, 83.4], [428.3, 83.9], [431.2, 82.4], [431.9, 85.8], [430.3, 88.0], [429.7, 91.7], [430.7, 94.1], [432.3, 94.3], [431.6, 95.7], [439.1, 96.7], [441.6, 96.0], [441.9, 98.9], [439.4, 101.1], [438.8, 104.1], [442.6, 105.4], [441.4, 107.3], [441.9, 109.1], [440.0, 109.1], [438.7, 107.8], [437.3, 108.3], [434.6, 107.8], [432.1, 109.3], [433.2, 111.2], [437.0, 110.7], [439.8, 113.3], [442.7, 114.2], [442.4, 115.3], [441.2, 115.2], [442.1, 118.3], [447.7, 120.1], [455.9, 118.3], [467.1, 118.1], [470.2, 116.6], [475.2, 116.6], [478.7, 114.8], [484.6, 114.9], [483.6, 113.3], [483.4, 110.4], [490.4, 101.2], [488.9, 96.2], [486.4, 93.2], [486.1, 88.1], [492.2, 76.3], [492.1, 74.4], [485.1, 68.9], [482.0, 67.9], [473.3, 67.7], [461.2, 74.0], [455.1, 74.7], [450.6, 73.8], [445.4, 75.2], [441.0, 72.8], [440.3, 69.1], [442.0, 65.3], [438.9, 64.0], [430.0, 67.2], [421.4, 74.1]]]}, {"id": "flowers", "name": "Страна Цветов", "shortName": "Цветы", "kanji": "花の国", "color": "#fd79a8", "accent": "#e84393", "type": "small", "village": {"name": "Хана", "title": "Цветочный Сад", "symbol": "🌸", "x": 490, "y": 115}, "kage": "Принцесса Лилия", "nature": "Стихия Земли и Воды", "clans": "Цветочные ирьенины", "terrain": "Цветущие долины, оранжереи, медовые луга.", "military": "Садовники-ирьенины, ядовитые споры.", "danger": "Низкая (красота природы, целебные травы).", "lore": "Живописная страна на северном побережье, поставляющая редчайшие целебные цветы и экстракты для ядов.", "labelPoint": {"x": 501.7, "y": 108.4}, "points": [[492.6, 71.1], [491.7, 72.4], [492.8, 76.6], [486.7, 88.3], [487.1, 93.1], [490.6, 98.6], [490.9, 102.2], [484.1, 110.4], [484.2, 113.3], [485.7, 115.3], [488.2, 116.2], [491.8, 119.9], [500.9, 120.6], [504.8, 123.0], [513.8, 123.9], [519.9, 127.3], [524.7, 127.6], [519.6, 114.0], [513.8, 107.1], [512.6, 99.4], [514.2, 96.4], [512.7, 91.8], [510.6, 90.7], [509.8, 89.1], [510.7, 84.3], [511.4, 89.1], [512.4, 89.8], [512.9, 89.2], [511.4, 79.2], [509.3, 76.6], [504.9, 75.2], [501.8, 77.2], [499.0, 76.8], [495.0, 71.7], [492.6, 71.1]], "polygons": [[[492.6, 71.1], [491.7, 72.4], [492.8, 76.6], [486.7, 88.3], [487.1, 93.1], [490.6, 98.6], [490.9, 102.2], [484.1, 110.4], [484.2, 113.3], [485.7, 115.3], [488.2, 116.2], [491.8, 119.9], [500.9, 120.6], [504.8, 123.0], [513.8, 123.9], [519.9, 127.3], [524.7, 127.6], [519.6, 114.0], [513.8, 107.1], [512.6, 99.4], [514.2, 96.4], [512.7, 91.8], [510.6, 90.7], [509.8, 89.1], [510.7, 84.3], [511.4, 89.1], [512.4, 89.8], [512.9, 89.2], [511.4, 79.2], [509.3, 76.6], [504.9, 75.2], [501.8, 77.2], [499.0, 76.8], [495.0, 71.7], [492.6, 71.1]]]}, {"id": "birds", "name": "Страна Птиц", "shortName": "Птицы", "kanji": "鳥の国", "color": "#81ecec", "accent": "#00cec9", "type": "small", "village": {"name": "Тори", "title": "Деревня Птичьего Крыла", "symbol": "🦅", "x": 488.4, "y": 280.9}, "kage": "Даймё Токи", "nature": "Стихия Ветра", "clans": "Род Саги и Токи", "terrain": "Озёра, скалы гнездования перелётных птиц, чистые небеса.", "military": "Воздушные разведчики на дельтапланах и птицах.", "danger": "Умеренная (интриги при дворе Норои Муши).", "lore": "Северо-западное побережье, где останавливаются миллионы перелётных птиц со всего мира.", "labelPoint": {"x": 494.7, "y": 281.1}, "points": [[462.7, 276.3], [463.6, 279.6], [469.3, 283.4], [475.6, 284.3], [476.6, 285.7], [478.4, 285.7], [484.1, 290.1], [492.6, 291.1], [497.0, 293.8], [499.7, 293.7], [505.2, 296.2], [508.9, 296.7], [508.8, 291.6], [510.1, 289.9], [510.3, 287.4], [508.7, 284.0], [505.3, 282.2], [504.1, 275.0], [502.1, 272.9], [502.3, 269.6], [498.1, 270.8], [493.2, 270.6], [490.1, 271.7], [485.1, 270.4], [476.7, 271.1], [468.3, 267.9], [462.7, 276.3]], "polygons": [[[462.7, 276.3], [463.6, 279.6], [469.3, 283.4], [475.6, 284.3], [476.6, 285.7], [478.4, 285.7], [484.1, 290.1], [492.6, 291.1], [497.0, 293.8], [499.7, 293.7], [505.2, 296.2], [508.9, 296.7], [508.8, 291.6], [510.1, 289.9], [510.3, 287.4], [508.7, 284.0], [505.3, 282.2], [504.1, 275.0], [502.1, 272.9], [502.3, 269.6], [498.1, 270.8], [493.2, 270.6], [490.1, 271.7], [485.1, 270.4], [476.7, 271.1], [468.3, 267.9], [462.7, 276.3]]], "symbolImg": "symbols/country/bird.webp"}, {"id": "demons", "name": "Страна Демонов", "shortName": "Демоны", "kanji": "鬼の国", "color": "#6c5ce7", "accent": "#a29bfe", "type": "small", "village": {"name": "Они", "title": "Храм Жрицы Мироку", "symbol": "👹", "x": 254, "y": 171}, "kage": "Жрица Шион", "nature": "Запечатывающие печати Фуиндзюцу", "clans": "Орден Жрицы Света", "terrain": "Храмовые горы, вулканические расщелины, древние святилища Моурьё.", "military": "Армия терракотовых воинов (в прошлом), храмовая стража печати.", "danger": "Высокая (древние демонические печати, духи подземного мира).", "lore": "Священная земля жриц, охраняющих мир от пробуждения древнего демона Моурьё.", "labelPoint": {"x": 255.9, "y": 174.1}, "points": [[266.3, 140.3], [257.2, 140.9], [248.1, 147.8], [246.1, 152.6], [244.0, 149.9], [239.3, 149.9], [239.6, 159.0], [240.3, 161.1], [237.8, 163.7], [236.2, 167.9], [236.0, 173.0], [238.6, 175.7], [236.8, 180.3], [237.0, 185.3], [236.2, 187.4], [243.2, 193.1], [246.2, 192.3], [248.9, 190.4], [254.9, 194.1], [261.8, 196.1], [270.2, 190.0], [272.7, 185.7], [275.6, 182.7], [277.3, 168.3], [276.2, 167.3], [275.8, 164.0], [272.0, 165.1], [270.3, 163.8], [270.1, 158.6], [268.2, 150.4], [268.6, 148.4], [266.7, 146.1], [266.3, 140.3]], "polygons": [[[266.3, 140.3], [257.2, 140.9], [248.1, 147.8], [246.1, 152.6], [244.0, 149.9], [239.3, 149.9], [239.6, 159.0], [240.3, 161.1], [237.8, 163.7], [236.2, 167.9], [236.0, 173.0], [238.6, 175.7], [236.8, 180.3], [237.0, 185.3], [236.2, 187.4], [243.2, 193.1], [246.2, 192.3], [248.9, 190.4], [254.9, 194.1], [261.8, 196.1], [270.2, 190.0], [272.7, 185.7], [275.6, 182.7], [277.3, 168.3], [276.2, 167.3], [275.8, 164.0], [272.0, 165.1], [270.3, 163.8], [270.1, 158.6], [268.2, 150.4], [268.6, 148.4], [266.7, 146.1], [266.3, 140.3]]]}, {"id": "swamps", "name": "Страна Болот", "shortName": "Болота", "kanji": "沼の国", "color": "#00b894", "accent": "#55efc4", "type": "small", "village": {"name": "Нума", "title": "Трясины Нума", "symbol": "🐊", "x": 193, "y": 168}, "kage": "Даймё Болот", "nature": "Стихия Воды и Земли (Грязь)", "clans": "Болотные следопыты", "terrain": "Торфяные болота, трясины, туманные заросли папоротника.", "military": "Партизанские отряды трясины, ядовитые дротики.", "danger": "Высокая (зыбучие топи, ядовитые газы).", "lore": "Дикий болотистый край к западу от Медведей, почти непроходимый для чужеземцев.", "labelPoint": {"x": 192.7, "y": 168.3}, "points": [[137.7, 154.4], [136.4, 158.8], [134.6, 161.2], [134.8, 165.9], [136.3, 170.7], [145.0, 176.3], [148.4, 182.6], [151.2, 184.0], [153.2, 184.0], [155.7, 185.7], [161.4, 186.8], [166.1, 191.3], [169.6, 191.1], [175.3, 184.3], [181.3, 190.1], [188.4, 188.4], [192.9, 191.7], [194.6, 191.4], [200.6, 186.0], [202.6, 185.3], [204.7, 174.4], [206.4, 171.6], [207.2, 168.1], [209.0, 166.2], [205.8, 158.1], [203.1, 158.2], [196.6, 155.2], [194.3, 151.9], [182.7, 158.2], [177.9, 163.3], [174.4, 164.0], [172.9, 163.1], [177.2, 156.6], [179.2, 149.2], [177.7, 144.1], [175.8, 142.4], [175.2, 138.4], [172.0, 135.6], [170.7, 136.2], [168.4, 140.1], [158.6, 149.2], [153.9, 150.1], [149.6, 149.3], [145.3, 151.3], [143.1, 151.4], [137.7, 154.4]], "polygons": [[[137.7, 154.4], [136.4, 158.8], [134.6, 161.2], [134.8, 165.9], [136.3, 170.7], [145.0, 176.3], [148.4, 182.6], [151.2, 184.0], [153.2, 184.0], [155.7, 185.7], [161.4, 186.8], [166.1, 191.3], [169.6, 191.1], [175.3, 184.3], [181.3, 190.1], [188.4, 188.4], [192.9, 191.7], [194.6, 191.4], [200.6, 186.0], [202.6, 185.3], [204.7, 174.4], [206.4, 171.6], [207.2, 168.1], [209.0, 166.2], [205.8, 158.1], [203.1, 158.2], [196.6, 155.2], [194.3, 151.9], [182.7, 158.2], [177.9, 163.3], [174.4, 164.0], [172.9, 163.1], [177.2, 156.6], [179.2, 149.2], [177.7, 144.1], [175.8, 142.4], [175.2, 138.4], [172.0, 135.6], [170.7, 136.2], [168.4, 140.1], [158.6, 149.2], [153.9, 150.1], [149.6, 149.3], [145.3, 151.3], [143.1, 151.4], [137.7, 154.4]]]}, {"id": "claws", "name": "Страна Когтей", "shortName": "Когти", "kanji": "爪の国", "color": "#fdcb6e", "accent": "#ffeaa7", "type": "small", "village": {"name": "Цуме", "title": "Крепость Когтя", "symbol": "🐾", "x": 213, "y": 176}, "kage": "Лорд Когтя", "nature": "Тайдзюцу звериного стиля", "clans": "Звериные мастера", "terrain": "Каменистые клыковидные хребты, ущелья.", "military": "Следопыты с боевыми псами и гепардами.", "danger": "Средняя.", "lore": "Исторический соперник Страны Клыков, славящийся звериным стилем рукопашного боя.", "labelPoint": {"x": 213.4, "y": 176.1}, "points": [[219.2, 162.3], [210.7, 164.8], [207.1, 167.7], [204.3, 174.4], [202.6, 185.1], [211.6, 184.3], [211.2, 186.8], [212.2, 187.2], [217.2, 185.2], [219.0, 185.4], [223.3, 182.0], [221.4, 171.7], [220.0, 167.7], [218.3, 166.3], [219.2, 162.3]], "polygons": [[[219.2, 162.3], [210.7, 164.8], [207.1, 167.7], [204.3, 174.4], [202.6, 185.1], [211.6, 184.3], [211.2, 186.8], [212.2, 187.2], [217.2, 185.2], [219.0, 185.4], [223.3, 182.0], [221.4, 171.7], [220.0, 167.7], [218.3, 166.3], [219.2, 162.3]]]}, {"id": "fangs_nw", "name": "Страна Клыков", "shortName": "Клыки", "kanji": "牙の国", "color": "#e17055", "accent": "#fab1a0", "type": "small", "village": {"name": "Киба", "title": "Ущелье Клыка", "symbol": "🦷", "x": 228, "y": 165}, "kage": "Лорд Клыка", "nature": "Стихия Земли", "clans": "Охотники за головами Клыка", "terrain": "Острые скалы, сухие предгорья.", "military": "Наёмники, пограничные кавалерийские отряды.", "danger": "Средняя.", "lore": "Милитаризованное феодальное княжество, расположенное на перевале к Стране Медведей.", "labelPoint": {"x": 228.2, "y": 164.8}, "points": [[237.2, 148.4], [220.8, 158.2], [218.0, 165.4], [221.2, 171.9], [221.7, 177.0], [222.8, 177.9], [223.2, 182.0], [227.2, 182.2], [231.0, 184.4], [234.9, 179.9], [237.4, 179.9], [238.8, 176.1], [236.0, 171.4], [237.9, 164.1], [240.3, 162.4], [240.7, 160.7], [239.9, 158.9], [239.7, 149.8], [237.2, 148.4]], "polygons": [[[237.2, 148.4], [220.8, 158.2], [218.0, 165.4], [221.2, 171.9], [221.7, 177.0], [222.8, 177.9], [223.2, 182.0], [227.2, 182.2], [231.0, 184.4], [234.9, 179.9], [237.4, 179.9], [238.8, 176.1], [236.0, 171.4], [237.9, 164.1], [240.3, 162.4], [240.7, 160.7], [239.9, 158.9], [239.7, 149.8], [237.2, 148.4]]]}, {"id": "moon", "name": "Остров Луны", "shortName": "Луна", "kanji": "月の国", "color": "#f9ca24", "accent": "#f6e58d", "type": "island", "village": {"name": "Гецугакуре", "title": "Деревня Скрытой Луны", "symbol": "🌙", "x": 885, "y": 565, "symbolImg": "symbols/village/Getsugakure_Symbol.webp"}, "kage": "Даймё Цуки", "nature": "Стихия Воды и Лунного Света", "clans": "Династия Лунного Серпа", "terrain": "Изолированный остров в форме идеального полумесяца, тропический рай.", "military": "Дворцовая гвардия, цирковые укротители зверей.", "danger": "Низкая (курортное тропическое королевство).", "lore": "Сказочно богатое островное государство в форме полумесяца на крайнем юго-востоке океана.", "labelPoint": {"x": 923.6, "y": 536.0}, "points": [[864.9, 580.4], [861.7, 581.0], [860.2, 589.3], [857.8, 592.4], [852.3, 595.0], [850.3, 598.3], [850.1, 601.7], [851.9, 603.9], [851.9, 606.7], [854.2, 608.6], [856.2, 608.6], [860.7, 606.0], [862.9, 603.7], [865.4, 603.0], [868.2, 599.9], [869.2, 596.1], [870.9, 594.3], [870.7, 590.2], [871.4, 588.4], [870.9, 585.7], [869.0, 583.0], [866.3, 582.0], [864.9, 580.4]], "polygons": [[[864.9, 580.4], [861.7, 581.0], [860.2, 589.3], [857.8, 592.4], [852.3, 595.0], [850.3, 598.3], [850.1, 601.7], [851.9, 603.9], [851.9, 606.7], [854.2, 608.6], [856.2, 608.6], [860.7, 606.0], [862.9, 603.7], [865.4, 603.0], [868.2, 599.9], [869.2, 596.1], [870.9, 594.3], [870.7, 590.2], [871.4, 588.4], [870.9, 585.7], [869.0, 583.0], [866.3, 582.0], [864.9, 580.4]], [[884.3, 558.8], [882.3, 565.3], [883.2, 572.0], [885.4, 566.9], [888.4, 563.3], [893.8, 560.4], [899.0, 559.9], [903.9, 561.2], [908.3, 564.7], [910.4, 568.2], [911.7, 574.6], [912.2, 574.4], [914.1, 568.9], [913.8, 562.7], [910.9, 556.8], [906.1, 552.7], [900.6, 550.8], [894.3, 551.1], [888.4, 554.0], [884.3, 558.8]], [[930.1, 522.0], [927.6, 521.8], [923.6, 523.1], [917.2, 532.8], [913.3, 535.7], [913.3, 543.0], [916.0, 543.6], [920.2, 542.2], [927.2, 545.2], [931.4, 544.2], [932.4, 539.9], [930.1, 534.2], [930.9, 523.6], [930.1, 522.0]]], "symbolImg": "symbols/country/moon.webp"}, {"id": "sea_land", "name": "Страна Моря", "shortName": "Море", "kanji": "海の国", "color": "#10ac84", "accent": "#1dd1a1", "type": "island", "village": {"name": "Орочимару-Бэй", "title": "Морские лаборатории", "symbol": "🏝️", "x": 701.4, "y": 601.2}, "kage": "Морской совет", "nature": "Стихия Воды, Морские мутации", "clans": "Амачи и ихтиандры", "terrain": "Тропические коралловые атоллы, лагуны, подводные гроты.", "military": "Подводные диверсанты, генномодифицированные ихтио-воины.", "danger": "Высокая (морские монстры, тайные подводные лаборатории).", "lore": "Тропический архипелаг к югу от Страны Чая, где Орочимару проводил опыты по созданию идеального подводного бойца.", "labelPoint": {"x": 720.0, "y": 599.1}, "points": [[655.9, 615.7], [657.4, 618.1], [662.4, 618.6], [664.6, 619.9], [668.0, 619.2], [669.3, 617.8], [671.2, 618.1], [676.3, 616.1], [686.2, 616.1], [691.2, 617.8], [699.8, 623.7], [703.7, 625.0], [708.1, 624.8], [714.9, 621.9], [718.7, 621.7], [719.8, 619.2], [724.6, 618.4], [725.0, 616.3], [726.8, 614.4], [731.3, 613.1], [734.7, 608.0], [735.8, 601.9], [737.4, 598.3], [738.8, 596.9], [746.0, 595.7], [748.2, 593.6], [750.2, 588.9], [750.2, 586.6], [746.8, 586.1], [744.8, 584.1], [742.4, 585.2], [737.1, 584.8], [736.2, 582.9], [734.0, 583.1], [731.3, 581.1], [724.8, 581.7], [723.6, 582.7], [720.6, 582.2], [719.6, 583.1], [715.9, 582.8], [713.9, 584.1], [712.3, 583.2], [703.8, 584.1], [700.8, 582.2], [698.7, 582.1], [695.7, 579.4], [690.1, 578.4], [684.2, 584.9], [681.6, 585.4], [679.4, 589.0], [674.1, 591.6], [666.6, 592.7], [660.2, 597.4], [656.2, 604.7], [657.4, 607.9], [655.9, 610.2], [655.9, 615.7]], "polygons": [[[655.9, 615.7], [657.4, 618.1], [662.4, 618.6], [664.6, 619.9], [668.0, 619.2], [669.3, 617.8], [671.2, 618.1], [676.3, 616.1], [686.2, 616.1], [691.2, 617.8], [699.8, 623.7], [703.7, 625.0], [708.1, 624.8], [714.9, 621.9], [718.7, 621.7], [719.8, 619.2], [724.6, 618.4], [725.0, 616.3], [726.8, 614.4], [731.3, 613.1], [734.7, 608.0], [735.8, 601.9], [737.4, 598.3], [738.8, 596.9], [746.0, 595.7], [748.2, 593.6], [750.2, 588.9], [750.2, 586.6], [746.8, 586.1], [744.8, 584.1], [742.4, 585.2], [737.1, 584.8], [736.2, 582.9], [734.0, 583.1], [731.3, 581.1], [724.8, 581.7], [723.6, 582.7], [720.6, 582.2], [719.6, 583.1], [715.9, 582.8], [713.9, 584.1], [712.3, 583.2], [703.8, 584.1], [700.8, 582.2], [698.7, 582.1], [695.7, 579.4], [690.1, 578.4], [684.2, 584.9], [681.6, 585.4], [679.4, 589.0], [674.1, 591.6], [666.6, 592.7], [660.2, 597.4], [656.2, 604.7], [657.4, 607.9], [655.9, 610.2], [655.9, 615.7]], [[635.7, 582.7], [632.2, 579.4], [631.2, 576.4], [628.4, 575.7], [623.8, 577.9], [618.4, 582.6], [615.2, 582.2], [609.7, 584.6], [608.0, 586.2], [607.8, 590.4], [612.4, 595.8], [614.8, 595.1], [620.7, 598.2], [624.8, 598.9], [635.4, 598.9], [637.4, 596.6], [634.7, 586.4], [635.7, 582.7]], [[772.0, 601.2], [769.2, 599.1], [766.7, 599.0], [765.9, 603.3], [758.2, 607.7], [756.4, 609.4], [756.0, 612.2], [758.4, 614.1], [770.2, 615.3], [774.4, 610.2], [772.0, 601.2]], [[632.0, 630.3], [624.4, 628.8], [620.1, 630.7], [617.2, 633.6], [616.9, 635.2], [613.0, 638.7], [612.7, 641.2], [614.3, 643.2], [620.1, 642.0], [627.0, 638.0], [631.8, 637.3], [632.7, 633.6], [632.0, 630.3]], [[740.2, 568.7], [740.1, 567.3], [735.4, 566.1], [731.1, 563.4], [719.9, 566.1], [717.2, 567.9], [720.9, 571.2], [725.8, 571.3], [731.0, 572.9], [736.0, 572.8], [740.2, 568.7]], [[671.0, 639.3], [670.3, 641.4], [673.1, 644.9], [678.2, 647.2], [681.9, 647.0], [680.6, 641.7], [678.2, 638.3], [676.0, 637.9], [671.0, 639.3]], [[765.6, 572.4], [762.0, 572.0], [759.6, 574.0], [758.4, 576.2], [760.9, 579.3], [762.6, 579.6], [767.2, 577.2], [767.7, 575.7], [765.6, 572.4]]], "symbolImg": "symbols/country/lake.webp"}, {"id": "waves", "name": "Страна Волн", "shortName": "Волны", "kanji": "波の国", "color": "#48dbfb", "accent": "#0abde3", "type": "island", "village": {"name": "Мост Наруто", "title": "Великий Мост Наруто", "symbol": "🌉", "x": 684, "y": 322}, "kage": "Тазуна (главный архитектор)", "nature": "Стихия Воды", "clans": "Корабелы и мостостроители", "terrain": "Островной прибрежный архипелаг, мангры, мост через пролив к Стране Огня.", "military": "Не имеет шиноби, находится под постоянным протекторатом Конохи.", "danger": "Низкая (после свержения корпорации Гато мирное судоходство).", "lore": "Островное государство, освобождённое Командой №7 от тирании магната Гато. Соединено с материком Великим Мостом Наруто.", "labelPoint": {"x": 685.1, "y": 322.3}, "points": [[686.3, 320.3], [683.9, 321.1], [682.4, 323.2], [682.4, 325.7], [684.1, 324.1], [687.1, 323.6], [686.3, 320.3]], "polygons": [[[686.3, 320.3], [683.9, 321.1], [682.4, 323.2], [682.4, 325.7], [684.1, 324.1], [687.1, 323.6], [686.3, 320.3]]], "symbolImg": "symbols/country/Waves.webp"}, {"id": "whirlpool", "name": "Остров Водоворота (Узушио)", "shortName": "Узушио", "kanji": "渦潮の国", "color": "#ee5253", "accent": "#ff6b6b", "type": "island", "village": {"name": "Узушиогакуре", "title": "Деревня Водоворота (Клан Узумаки)", "symbol": "🌀", "x": 726.7, "y": 273.3, "symbolImg": "symbols/village/Uzushiogakure_Symbol.webp"}, "kage": "Лидер Узумаки", "nature": "Фуиндзюцу (Запечатывание)", "clans": "Клан Узумаки (Алое Пламя)", "terrain": "Руины древней цитадели, гигантские водовороты в проливах.", "military": "Мастера запечатывающих цепей и фуиндзюцу, колоссальный жизненный резерв.", "danger": "Очень высокая (руины, нестабильные печати, яростные водовороты).", "lore": "Родина клана Узумаки и матери Наруто, Кушины. Была разрушена коалицией наций, устрашённых могуществом печатей Узушио.", "labelPoint": {"x": 728.4, "y": 271.0}, "points": [[744.2, 254.6], [743.0, 254.7], [740.8, 256.8], [738.3, 257.0], [734.9, 259.7], [730.8, 259.0], [723.0, 263.0], [722.3, 266.6], [719.8, 269.6], [720.1, 277.6], [714.6, 282.7], [714.6, 283.8], [711.9, 285.4], [711.4, 286.9], [708.8, 287.6], [707.3, 290.9], [705.3, 291.9], [704.6, 294.3], [705.3, 298.2], [709.1, 296.9], [715.7, 291.4], [716.7, 287.7], [724.4, 280.9], [725.9, 281.6], [728.1, 280.6], [730.1, 278.2], [732.0, 279.1], [734.0, 278.0], [735.9, 275.0], [736.6, 269.1], [738.7, 268.9], [742.6, 266.1], [742.9, 262.9], [746.3, 259.7], [746.3, 257.0], [744.2, 254.6]], "polygons": [[[744.2, 254.6], [743.0, 254.7], [740.8, 256.8], [738.3, 257.0], [734.9, 259.7], [730.8, 259.0], [723.0, 263.0], [722.3, 266.6], [719.8, 269.6], [720.1, 277.6], [714.6, 282.7], [714.6, 283.8], [711.9, 285.4], [711.4, 286.9], [708.8, 287.6], [707.3, 290.9], [705.3, 291.9], [704.6, 294.3], [705.3, 298.2], [709.1, 296.9], [715.7, 291.4], [716.7, 287.7], [724.4, 280.9], [725.9, 281.6], [728.1, 280.6], [730.1, 278.2], [732.0, 279.1], [734.0, 278.0], [735.9, 275.0], [736.6, 269.1], [738.7, 268.9], [742.6, 266.1], [742.9, 262.9], [746.3, 259.7], [746.3, 257.0], [744.2, 254.6]]], "symbolImg": "symbols/country/whirlpool.webp"}, {"id": "woods", "name": "Страна Деревьев (Лесов)", "shortName": "Деревья", "kanji": "林の国", "color": "#6c5ce7", "accent": "#a29bfe", "type": "island", "village": {"name": "Юмегакуре", "title": "Деревня Скрытого Сна", "symbol": "🌲", "x": 735.8, "y": 364.6, "symbolImg": "symbols/village/Yumegakure_Symbol.webp"}, "kage": "Лидер Ханнья", "nature": "Стихия Дерева и Земли", "clans": "Группа Ханнья (Мастера Масок)", "terrain": "Древние кедровые и реликтовые леса, островные утёсы, скрытые святилища.", "military": "Отряды Ханнья-шю в рогатых масках демонов, мастера засад в лесу.", "danger": "Высокая (фанатичные защитники границ, маскированные ассасины).", "lore": "Островное лесное государство к востоку от Страны Огня. Знаменито своими элитными воинами Ханнья, скрывающими лица под традиционными масками.", "labelPoint": {"x": 740.4, "y": 379.9}, "points": [[734.2, 360.4], [729.0, 362.7], [725.6, 365.7], [727.6, 368.4], [726.7, 371.0], [729.1, 373.2], [729.4, 375.4], [726.7, 378.2], [726.8, 381.2], [725.4, 382.7], [731.4, 387.7], [735.2, 393.8], [736.1, 397.1], [739.1, 399.0], [742.1, 397.3], [744.8, 397.2], [747.2, 394.2], [750.1, 393.1], [749.7, 389.4], [751.0, 388.2], [750.8, 386.8], [752.0, 385.2], [751.8, 383.7], [753.4, 380.1], [753.0, 377.7], [751.4, 375.8], [750.3, 368.1], [745.2, 368.3], [741.4, 367.3], [736.8, 361.1], [734.2, 360.4]], "polygons": [[[734.2, 360.4], [729.0, 362.7], [725.6, 365.7], [727.6, 368.4], [726.7, 371.0], [729.1, 373.2], [729.4, 375.4], [726.7, 378.2], [726.8, 381.2], [725.4, 382.7], [731.4, 387.7], [735.2, 393.8], [736.1, 397.1], [739.1, 399.0], [742.1, 397.3], [744.8, 397.2], [747.2, 394.2], [750.1, 393.1], [749.7, 389.4], [751.0, 388.2], [750.8, 386.8], [752.0, 385.2], [751.8, 383.7], [753.4, 380.1], [753.0, 377.7], [751.4, 375.8], [750.3, 368.1], [745.2, 368.3], [741.4, 367.3], [736.8, 361.1], [734.2, 360.4]], [[757.3, 334.0], [751.2, 331.3], [749.1, 332.8], [742.0, 331.9], [739.3, 334.6], [740.1, 337.7], [737.9, 339.9], [737.4, 342.2], [741.0, 342.7], [743.2, 341.0], [746.2, 343.0], [748.6, 343.4], [750.2, 341.2], [754.4, 340.4], [754.9, 339.0], [753.3, 337.4], [753.6, 336.3], [756.6, 335.4], [757.3, 334.0]], [[756.2, 346.1], [749.7, 344.1], [745.3, 347.0], [744.7, 348.6], [743.2, 348.6], [741.1, 350.3], [737.7, 350.8], [736.2, 352.8], [741.9, 355.6], [744.0, 355.3], [745.1, 357.1], [747.2, 357.8], [749.6, 356.3], [749.4, 352.3], [751.6, 351.0], [753.9, 351.0], [756.2, 346.1]], [[738.4, 345.4], [733.7, 343.1], [731.7, 344.4], [729.0, 343.8], [725.8, 345.1], [725.0, 347.8], [728.1, 349.7], [732.7, 350.7], [736.7, 348.0], [738.1, 347.9], [738.4, 345.4]], [[743.9, 344.7], [740.9, 345.1], [740.9, 346.9], [743.9, 344.7]], [[760.0, 368.2], [759.1, 369.6], [760.7, 370.6], [761.4, 369.3], [760.0, 368.2]]], "symbolImg": "symbols/country/woods.webp"}, {"id": "fang_east", "name": "Восточные Земли Клыка", "shortName": "Восток-Клык", "kanji": "東牙", "color": "#1abc9c", "accent": "#16a085", "type": "small", "village": {"name": "Восточный Редут", "title": "Форпост Востока", "symbol": "🗡️", "x": 884, "y": 292}, "kage": "Восточный Даймё", "nature": "Стихия Воды и Ветра", "clans": "Островные самураи", "terrain": "Скалистый материковый берег, глубокие фьорды.", "military": "Береговая охрана, арбалетчики.", "danger": "Средняя.", "lore": "Земли восточного материка, отделённые от Кири широким океанским проливом.", "labelPoint": {"x": 883.6, "y": 291.7}, "points": [[915.3, 288.1], [906.9, 278.7], [903.8, 278.1], [900.4, 276.1], [893.8, 270.1], [888.1, 269.9], [886.2, 271.2], [879.8, 272.3], [876.7, 274.3], [875.6, 276.4], [870.2, 279.8], [868.9, 279.4], [864.8, 282.1], [860.3, 283.6], [858.3, 288.3], [856.1, 289.2], [853.9, 293.1], [855.2, 294.3], [855.4, 295.9], [853.2, 301.2], [855.1, 306.1], [849.1, 313.4], [849.3, 319.0], [851.6, 320.7], [862.9, 322.1], [867.2, 326.1], [871.9, 326.3], [873.7, 325.6], [874.8, 318.0], [878.3, 315.0], [879.9, 312.4], [887.3, 307.9], [895.3, 305.4], [897.0, 302.1], [902.3, 298.6], [906.4, 293.6], [910.8, 291.6], [915.3, 288.1]], "polygons": [[[915.3, 288.1], [906.9, 278.7], [903.8, 278.1], [900.4, 276.1], [893.8, 270.1], [888.1, 269.9], [886.2, 271.2], [879.8, 272.3], [876.7, 274.3], [875.6, 276.4], [870.2, 279.8], [868.9, 279.4], [864.8, 282.1], [860.3, 283.6], [858.3, 288.3], [856.1, 289.2], [853.9, 293.1], [855.2, 294.3], [855.4, 295.9], [853.2, 301.2], [855.1, 306.1], [849.1, 313.4], [849.3, 319.0], [851.6, 320.7], [862.9, 322.1], [867.2, 326.1], [871.9, 326.3], [873.7, 325.6], [874.8, 318.0], [878.3, 315.0], [879.9, 312.4], [887.3, 307.9], [895.3, 305.4], [897.0, 302.1], [902.3, 298.6], [906.4, 293.6], [910.8, 291.6], [915.3, 288.1]]]}, {"id": "claws_east", "name": "Восточные Земли Когтя", "shortName": "Восток-Коготь", "kanji": "東爪", "color": "#9b59b6", "accent": "#8e44ad", "type": "small", "village": {"name": "Дзёмаэ", "title": "Деревня Скрытого Замка", "symbol": "🐾", "x": 850, "y": 215, "symbolImg": "symbols/village/Jomae_Village_Symbol.webp"}, "kage": "Лорд Востока", "nature": "Стихия Молнии", "clans": "Горные кланы", "terrain": "Горные хребты, уходящие на восток.", "military": "Горные стрелки.", "danger": "Средняя.", "lore": "Северный сосед восточных земель Клыка, граничащий с дальним восточным материком.", "labelPoint": {"x": 842.0, "y": 229.8}, "points": [[867.6, 197.3], [865.7, 196.8], [862.7, 198.7], [858.9, 199.0], [857.2, 200.4], [854.7, 206.2], [852.6, 207.7], [850.4, 206.3], [843.8, 209.4], [840.2, 215.6], [837.2, 216.2], [833.0, 220.6], [831.2, 220.9], [829.0, 223.7], [827.9, 223.9], [824.4, 228.2], [825.6, 232.9], [825.2, 236.0], [832.9, 238.9], [835.3, 241.4], [839.2, 242.7], [841.7, 245.1], [848.8, 248.9], [852.1, 249.6], [856.6, 220.2], [861.3, 208.4], [867.6, 197.3]], "polygons": [[[867.6, 197.3], [865.7, 196.8], [862.7, 198.7], [858.9, 199.0], [857.2, 200.4], [854.7, 206.2], [852.6, 207.7], [850.4, 206.3], [843.8, 209.4], [840.2, 215.6], [837.2, 216.2], [833.0, 220.6], [831.2, 220.9], [829.0, 223.7], [827.9, 223.9], [824.4, 228.2], [825.6, 232.9], [825.2, 236.0], [832.9, 238.9], [835.3, 241.4], [839.2, 242.7], [841.7, 245.1], [848.8, 248.9], [852.1, 249.6], [856.6, 220.2], [861.3, 208.4], [867.6, 197.3]]]}, {"id": "eastern_mainland", "name": "Дальний Восточный Континент", "shortName": "Восток", "kanji": "東の大陸", "color": "#e056fd", "accent": "#be2edd", "type": "neutral", "village": {"name": "Восточный Порт", "title": "Заморские гавани", "symbol": "🏯", "x": 950, "y": 265}, "kage": "Император Востока", "nature": "Древняя магия и чакра", "clans": "Заморские династии", "terrain": "Огромный восточный континент, горные цепи, океанские фьорды.", "military": "Имперские легионы, морской флот.", "danger": "Неизведанная (заморские земли).", "lore": "Малоизученный континент далеко на востоке за пределами Страны Воды.", "labelPoint": {"x": 956.9, "y": 290.4}, "points": [[971.7, 175.0], [962.9, 178.8], [963.8, 182.7], [963.0, 192.1], [960.6, 196.4], [955.3, 200.6], [954.3, 200.7], [951.8, 197.7], [948.6, 195.6], [947.9, 192.8], [946.3, 191.6], [945.1, 188.6], [942.8, 186.8], [941.6, 183.9], [936.2, 184.1], [933.6, 185.7], [933.4, 187.8], [936.6, 190.1], [938.3, 193.3], [937.9, 198.0], [939.7, 200.2], [935.6, 211.9], [936.6, 216.2], [931.9, 221.2], [931.9, 223.4], [933.6, 225.8], [932.4, 231.2], [933.3, 233.7], [932.0, 236.3], [932.1, 239.0], [929.4, 240.6], [928.6, 242.7], [930.4, 244.2], [928.3, 245.9], [927.3, 249.4], [926.3, 248.9], [925.2, 249.6], [924.2, 254.7], [922.2, 257.9], [921.8, 264.0], [922.9, 264.4], [924.6, 261.6], [925.3, 263.8], [926.9, 262.9], [928.3, 268.3], [930.1, 267.7], [930.8, 268.6], [928.1, 268.8], [930.3, 269.9], [929.8, 270.7], [928.9, 269.7], [928.2, 270.0], [928.3, 271.3], [929.8, 271.0], [930.4, 272.4], [928.7, 272.1], [929.0, 273.8], [927.6, 269.1], [925.6, 271.9], [924.4, 268.2], [921.4, 270.2], [924.0, 272.8], [923.2, 273.2], [923.7, 274.8], [921.7, 275.3], [919.4, 286.0], [919.4, 293.1], [920.2, 294.0], [922.0, 293.3], [920.4, 294.7], [921.7, 295.0], [922.4, 296.6], [924.6, 295.2], [926.0, 298.6], [926.9, 296.3], [928.0, 295.8], [927.4, 295.1], [926.1, 295.6], [924.9, 290.7], [922.0, 293.3], [922.3, 292.4], [921.0, 292.8], [920.9, 292.1], [922.9, 292.1], [924.6, 289.2], [925.3, 291.4], [926.9, 290.6], [928.3, 296.0], [930.1, 295.3], [930.8, 296.2], [928.1, 296.4], [930.2, 297.2], [929.8, 298.3], [928.9, 297.3], [928.2, 297.7], [928.2, 298.8], [930.0, 298.9], [930.2, 300.1], [929.8, 299.4], [928.7, 300.0], [929.1, 301.3], [930.6, 301.0], [930.8, 302.4], [930.1, 301.4], [928.9, 301.9], [927.6, 296.8], [925.6, 299.6], [924.4, 295.9], [921.2, 298.1], [923.7, 311.3], [925.8, 314.6], [929.9, 314.1], [934.0, 317.7], [935.2, 320.9], [934.6, 323.9], [936.0, 327.0], [937.2, 327.2], [942.4, 332.4], [947.1, 333.9], [953.3, 334.2], [957.3, 331.8], [964.6, 329.6], [970.1, 321.8], [975.2, 317.0], [983.0, 301.2], [982.3, 297.4], [984.2, 292.9], [984.1, 288.6], [983.2, 286.9], [982.6, 279.1], [980.9, 276.6], [980.2, 268.1], [977.6, 261.1], [974.9, 248.3], [975.3, 238.7], [976.2, 238.7], [978.7, 235.8], [980.0, 231.4], [981.9, 229.2], [987.9, 226.4], [989.8, 227.2], [991.4, 229.4], [988.0, 232.9], [984.4, 239.6], [985.2, 242.4], [989.2, 242.7], [992.1, 240.6], [996.3, 239.4], [1002.0, 234.1], [1003.7, 228.2], [1005.1, 226.1], [1004.3, 221.2], [1000.6, 217.4], [999.3, 214.2], [996.8, 212.2], [996.1, 209.3], [993.2, 206.7], [992.1, 203.2], [982.6, 201.0], [980.1, 195.0], [980.3, 190.4], [976.3, 187.6], [976.4, 184.7], [972.9, 179.6], [971.7, 175.0]], "polygons": [[[971.7, 175.0], [962.9, 178.8], [963.8, 182.7], [963.0, 192.1], [960.6, 196.4], [955.3, 200.6], [954.3, 200.7], [951.8, 197.7], [948.6, 195.6], [947.9, 192.8], [946.3, 191.6], [945.1, 188.6], [942.8, 186.8], [941.6, 183.9], [936.2, 184.1], [933.6, 185.7], [933.4, 187.8], [936.6, 190.1], [938.3, 193.3], [937.9, 198.0], [939.7, 200.2], [935.6, 211.9], [936.6, 216.2], [931.9, 221.2], [931.9, 223.4], [933.6, 225.8], [932.4, 231.2], [933.3, 233.7], [932.0, 236.3], [932.1, 239.0], [929.4, 240.6], [928.6, 242.7], [930.4, 244.2], [928.3, 245.9], [927.3, 249.4], [926.3, 248.9], [925.2, 249.6], [924.2, 254.7], [922.2, 257.9], [921.8, 264.0], [922.9, 264.4], [924.6, 261.6], [925.3, 263.8], [926.9, 262.9], [928.3, 268.3], [930.1, 267.7], [930.8, 268.6], [928.1, 268.8], [930.3, 269.9], [929.8, 270.7], [928.9, 269.7], [928.2, 270.0], [928.3, 271.3], [929.8, 271.0], [930.4, 272.4], [928.7, 272.1], [929.0, 273.8], [927.6, 269.1], [925.6, 271.9], [924.4, 268.2], [921.4, 270.2], [924.0, 272.8], [923.2, 273.2], [923.7, 274.8], [921.7, 275.3], [919.4, 286.0], [919.4, 293.1], [920.2, 294.0], [922.0, 293.3], [920.4, 294.7], [921.7, 295.0], [922.4, 296.6], [924.6, 295.2], [926.0, 298.6], [926.9, 296.3], [928.0, 295.8], [927.4, 295.1], [926.1, 295.6], [924.9, 290.7], [922.0, 293.3], [922.3, 292.4], [921.0, 292.8], [920.9, 292.1], [922.9, 292.1], [924.6, 289.2], [925.3, 291.4], [926.9, 290.6], [928.3, 296.0], [930.1, 295.3], [930.8, 296.2], [928.1, 296.4], [930.2, 297.2], [929.8, 298.3], [928.9, 297.3], [928.2, 297.7], [928.2, 298.8], [930.0, 298.9], [930.2, 300.1], [929.8, 299.4], [928.7, 300.0], [929.1, 301.3], [930.6, 301.0], [930.8, 302.4], [930.1, 301.4], [928.9, 301.9], [927.6, 296.8], [925.6, 299.6], [924.4, 295.9], [921.2, 298.1], [923.7, 311.3], [925.8, 314.6], [929.9, 314.1], [934.0, 317.7], [935.2, 320.9], [934.6, 323.9], [936.0, 327.0], [937.2, 327.2], [942.4, 332.4], [947.1, 333.9], [953.3, 334.2], [957.3, 331.8], [964.6, 329.6], [970.1, 321.8], [975.2, 317.0], [983.0, 301.2], [982.3, 297.4], [984.2, 292.9], [984.1, 288.6], [983.2, 286.9], [982.6, 279.1], [980.9, 276.6], [980.2, 268.1], [977.6, 261.1], [974.9, 248.3], [975.3, 238.7], [976.2, 238.7], [978.7, 235.8], [980.0, 231.4], [981.9, 229.2], [987.9, 226.4], [989.8, 227.2], [991.4, 229.4], [988.0, 232.9], [984.4, 239.6], [985.2, 242.4], [989.2, 242.7], [992.1, 240.6], [996.3, 239.4], [1002.0, 234.1], [1003.7, 228.2], [1005.1, 226.1], [1004.3, 221.2], [1000.6, 217.4], [999.3, 214.2], [996.8, 212.2], [996.1, 209.3], [993.2, 206.7], [992.1, 203.2], [982.6, 201.0], [980.1, 195.0], [980.3, 190.4], [976.3, 187.6], [976.4, 184.7], [972.9, 179.6], [971.7, 175.0]]]}, {"id": "mountain_streams", "name": "Страна Горных Ручьёв", "shortName": "Ручьи", "kanji": "山流の国", "color": "#dfe6e9", "accent": "#b2bec3", "type": "small", "village": {"name": "Яманагаре", "title": "Перевал Ручьёв", "symbol": "🏞️", "x": 355, "y": 265}, "kage": "Старейшина Ручьёв", "nature": "Стихия Земли и Воды", "clans": "Горные проводники", "terrain": "Быстрые горные потоки, каскады, кристальные озёра.", "military": "Горные дозорные, альпинисты.", "danger": "Средняя.", "lore": "Буферная зона между Землей, Медведями и Песками. Контролирует высокогорные перевалы и источники питьевой воды.", "labelPoint": {"x": 360.2, "y": 277.0}, "points": [[424.2, 251.1], [421.4, 251.6], [416.2, 250.7], [414.0, 248.4], [408.7, 248.0], [404.8, 245.7], [401.9, 246.6], [393.7, 244.7], [391.7, 246.9], [388.4, 246.9], [382.7, 244.7], [376.9, 246.4], [371.6, 246.7], [370.4, 247.8], [367.9, 247.1], [364.4, 249.8], [360.8, 254.7], [357.1, 254.8], [353.4, 255.1], [349.7, 257.6], [346.0, 261.3], [342.3, 264.8], [338.6, 266.9], [334.9, 268.7], [331.2, 270.2], [327.5, 271.8], [323.8, 273.4], [320.1, 275.6], [316.4, 276.1], [312.7, 273.9], [309.1, 272.2], [305.4, 271.0], [301.7, 271.0], [304.9, 276.9], [308.9, 278.9], [309.2, 281.8], [310.6, 283.2], [310.6, 286.8], [306.3, 293.3], [307.7, 295.6], [310.8, 297.3], [314.7, 301.8], [317.7, 302.3], [333.6, 302.4], [347.3, 304.1], [353.3, 302.2], [359.4, 299.0], [366.4, 299.4], [368.1, 297.4], [372.1, 295.2], [374.0, 292.7], [376.8, 292.3], [380.0, 283.9], [384.8, 277.0], [389.7, 274.9], [394.1, 274.2], [399.3, 271.3], [401.7, 271.6], [404.0, 269.8], [405.9, 269.9], [411.2, 267.9], [416.9, 259.2], [419.3, 259.4], [420.7, 258.7], [424.2, 251.1]], "polygons": [[[424.2, 251.1], [421.4, 251.6], [416.2, 250.7], [414.0, 248.4], [408.7, 248.0], [404.8, 245.7], [401.9, 246.6], [393.7, 244.7], [391.7, 246.9], [388.4, 246.9], [382.7, 244.7], [376.9, 246.4], [371.6, 246.7], [370.4, 247.8], [367.9, 247.1], [364.4, 249.8], [360.8, 254.7], [357.1, 254.8], [353.4, 255.1], [349.7, 257.6], [346.0, 261.3], [342.3, 264.8], [338.6, 266.9], [334.9, 268.7], [331.2, 270.2], [327.5, 271.8], [323.8, 273.4], [320.1, 275.6], [316.4, 276.1], [312.7, 273.9], [309.1, 272.2], [305.4, 271.0], [301.7, 271.0], [304.9, 276.9], [308.9, 278.9], [309.2, 281.8], [310.6, 283.2], [310.6, 286.8], [306.3, 293.3], [307.7, 295.6], [310.8, 297.3], [314.7, 301.8], [317.7, 302.3], [333.6, 302.4], [347.3, 304.1], [353.3, 302.2], [359.4, 299.0], [366.4, 299.4], [368.1, 297.4], [372.1, 295.2], [374.0, 292.7], [376.8, 292.3], [380.0, 283.9], [384.8, 277.0], [389.7, 274.9], [394.1, 274.2], [399.3, 271.3], [401.7, 271.6], [404.0, 269.8], [405.9, 269.9], [411.2, 267.9], [416.9, 259.2], [419.3, 259.4], [420.7, 258.7], [424.2, 251.1]]]}, {"id": "myoboku", "name": "Гора Мьёбоку", "shortName": "Мьёбоку", "kanji": "妙木山", "color": "#1b4d3e", "accent": "#2ecc71", "type": "minor", "village": {"name": "Обитель Жаб", "title": "Священная Земля Сендзюцу (Мьёбоку)", "symbol": "🐸", "x": 208, "y": 529, "symbolImg": "symbols/village/Toad_Symbol.webp"}, "kage": "Великий Жабий Мудрец (Огама-сеннин)", "leader": "Великий Жабий Мудрец (Огама-сеннин)", "nature": "Сендзюцу (Природная Энергия)", "clans": "Клан Жаб (Гамабунта, Фукасаку, Шима, Гамакичи)", "terrain": "Тайная священная долина, водопады жабьего масла, исполинские грибы и каменные статуи мудрецов", "military": "Могущественные призывные жабы и мастера Режима Мудреца Сеннин Модо", "danger": "Экстремальная для непосвященных (риск окаменения при поглощении природной чакры)", "lore": "Легендарная Гора Мьёбоку (妙木山) — священная обитель жаб и одно из трёх великих неисследованных священных мест мира шиноби (наряду с пещерой Рючи и лесом Шиккоцу). Здесь бьют священные источники жабьего масла и постигается Сендзюцу.", "labelPoint": {"x": 211, "y": 529}, "points": [[224.2, 520.1], [223.4, 520.4], [222.4, 522.2], [218.8, 526.3], [217.6, 527.0], [214.2, 527.3], [211.9, 528.2], [209.3, 527.9], [206.4, 525.7], [205.6, 525.4], [203.7, 523.1], [201.2, 522.2], [200.6, 522.6], [199.9, 523.9], [199.4, 526.7], [197.0, 529.1], [196.8, 530.6], [198.7, 532.1], [198.9, 532.8], [200.7, 533.8], [202.6, 533.1], [205.1, 531.2], [207.7, 531.3], [211.6, 533.7], [213.4, 533.7], [216.1, 531.6], [219.0, 530.9], [221.6, 530.9], [224.3, 532.6], [225.1, 528.8], [225.1, 525.6], [224.2, 520.1]], "polygons": [[[224.2, 520.1], [223.4, 520.4], [222.4, 522.2], [218.8, 526.3], [217.6, 527.0], [214.2, 527.3], [211.9, 528.2], [209.3, 527.9], [206.4, 525.7], [205.6, 525.4], [203.7, 523.1], [201.2, 522.2], [200.6, 522.6], [199.9, 523.9], [199.4, 526.7], [197.0, 529.1], [196.8, 530.6], [198.7, 532.1], [198.9, 532.8], [200.7, 533.8], [202.6, 533.1], [205.1, 531.2], [207.7, 531.3], [211.6, 533.7], [213.4, 533.7], [216.1, 531.6], [219.0, 530.9], [221.6, 530.9], [224.3, 532.6], [225.1, 528.8], [225.1, 525.6], [224.2, 520.1]]]}];

function mapCountryById(id){
  if(!SH_MAP_DATA) return null;
  for(var i=0; i<SH_MAP_DATA.length; i++){
    if(SH_MAP_DATA[i].id === id) return SH_MAP_DATA[i];
  }
  return null;
}

function renderShinobiMapSvg(countries, activeId, showVillages, showLabels){
  var z = Math.min(4.0, Math.max(1.0, (typeof SH !== 'undefined' && SH.map && SH.map.zoom) || 1));
  var vbW = 1024 / z;
  var vbH = 682 / z;
  var cx = (typeof SH !== 'undefined' && SH.map && typeof SH.map.cx === 'number') ? SH.map.cx : 512;
  var cy = (typeof SH !== 'undefined' && SH.map && typeof SH.map.cy === 'number') ? SH.map.cy : 341;
  var minX = Math.max(0, Math.min(1024 - vbW, cx - vbW / 2));
  var minY = Math.max(0, Math.min(682 - vbH, cy - vbH / 2));
  var vbStr = (z <= 1.001) ? '0 0 1024 682' : (minX.toFixed(2) + ' ' + minY.toFixed(2) + ' ' + vbW.toFixed(2) + ' ' + vbH.toFixed(2));
  var isRouteMode = (typeof SH !== 'undefined' && SH.map && SH.map.mode === 'route');
  var isMarkersMode = (typeof SH !== 'undefined' && SH.map && SH.map.mode === 'markers');
  var isPlacing = (typeof SH !== 'undefined' && SH.map && SH.map.isPlacingMarker);
  var svgClasses = 'sh-map-svg' + (isRouteMode ? ' route-mode' : '') + (isMarkersMode ? ' markers-mode' : '') + (isPlacing ? ' placing-marker' : '');
  var out = '<svg id="shMapSvg" class="' + svgClasses + '" viewBox="' + vbStr + '" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">';
  out += '<defs>';
  out += '<filter id="shMapGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>';
  out += '<pattern id="shMapGrid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(197,160,89,0.06)" stroke-width="1"/></pattern>';
  out += '</defs>';

  // Ocean background
  out += '<rect width="1024" height="682" fill="#141c17" class="sh-map-ocean"/>';
  out += '<rect width="1024" height="682" fill="url(#shMapGrid)"/>';

  // Neutral / Unnamed Territories (non-selectable gray regions)
  if(typeof SH_NEUTRAL_REGIONS !== 'undefined' && Array.isArray(SH_NEUTRAL_REGIONS)){
    SH_NEUTRAL_REGIONS.forEach(function(poly){
      var pts = poly.map(function(p){ return p.join(','); }).join(' ');
      out += '<polygon class="sh-neutral-poly" points="'+pts+'" fill="#2d3436" fill-opacity="0.55" stroke="rgba(20, 15, 10, 0.85)" stroke-width="1.8" pointer-events="none" />';
    });
  }

  // Country Polygons
  countries.forEach(function(c){
    var isSel = (c.id === activeId);
    var fillColor = isSel ? c.accent : c.color;
    var fillOp = isSel ? '0.88' : '0.45';
    var strokeColor = isSel ? '#f6e58d' : 'rgba(25, 18, 12, 0.9)';
    var strokeWidth = isSel ? '3.5' : '1.8';
    var polyList = (c.polygons && c.polygons.length) ? c.polygons : (c.points ? [c.points] : []);
    polyList.forEach(function(poly){
      var pts = poly.map(function(p){ return p.join(','); }).join(' ');
      out += '<polygon class="sh-country-poly '+(isSel?'selected':'')+'" data-country="'+escA(c.id)+'" points="'+pts+'" fill="'+fillColor+'" fill-opacity="'+fillOp+'" stroke="'+strokeColor+'" stroke-width="'+strokeWidth+'" />';
    });
  });

  // Country Labels (clean typography, no floating crest collision)
  if(showLabels){
    countries.forEach(function(c){
      var isSel = (c.id === activeId);
      var isGreat = (c.type === 'great');
      var lp = c.labelPoint || (c.village ? {x: c.village.x, y: c.village.y} : {x: c.points[0][0], y: c.points[0][1]});
      out += '<g class="sh-country-label-grp" pointer-events="none">';
      if(isGreat){
        var fSize = isSel ? 13 : 11.5;
        out += '<text x="'+lp.x+'" y="'+lp.y+'" text-anchor="middle" font-size="'+fSize+'" font-weight="700" fill="#ffffff" stroke="#110d08" stroke-width="2.2" paint-order="stroke fill" font-family="Cinzel, serif">'+esc(c.name)+'</text>';
        if(c.kanji){
          out += '<text x="'+lp.x+'" y="'+(lp.y+12)+'" text-anchor="middle" font-size="9.5" font-weight="600" fill="'+c.accent+'" stroke="#110d08" stroke-width="1.8" paint-order="stroke fill">'+esc(c.kanji)+'</text>';
        }
      } else {
        var displayName = c.shortName || c.name;
        var fSize = isSel ? 9.5 : 7.8;
        out += '<text x="'+lp.x+'" y="'+lp.y+'" text-anchor="middle" font-size="'+fSize+'" font-weight="600" fill="#e0e0e0" stroke="#110d08" stroke-width="1.5" paint-order="stroke fill">'+esc(displayName)+'</text>';
      }
      out += '</g>';
    });
  }

  // Village markers (sleek pins, crest badge for great nations & on hover/select)
  if(showVillages){
    countries.forEach(function(c){
      if(!c.village) return;
      var v = c.village;
      var isSel = (c.id === activeId);
      var isGreat = (c.type === 'great');
      var symImg = v.symbolImg || (typeof SH_VILLAGE_SYMBOLS !== 'undefined' && SH_VILLAGE_SYMBOLS[c.id]);
      out += '<g class="sh-village-marker '+(isSel?'active':'')+' '+(isGreat?'great-village':'')+'" data-village="'+escA(c.id)+'" transform="translate('+v.x+', '+v.y+')">';
      out += '<circle r="7" fill="'+c.accent+'" fill-opacity="0.22" class="sh-village-pulse"/>';
      out += '<circle r="3.8" fill="#ffffff" stroke="#110d08" stroke-width="1.3" class="sh-village-dot"/>';
      out += '<circle r="2.2" fill="'+(isSel?'#ffffff':c.accent)+'" class="sh-village-core"/>';
      if(symImg){
        out += '<g class="sh-village-crest" transform="translate(0, -14)">';
        out += '<circle r="8" fill="#ffffff" stroke="#110d08" stroke-width="1.4"/>';
        out += '<image href="'+escA(symImg)+'" x="-5.5" y="-5.5" width="11" height="11"/>';
        out += '</g>';
      }
      out += '</g>';
    });
  }

  // Route polyline & Waypoints (if in route mode or if route points exist)
  if(typeof SH !== 'undefined' && SH.map && SH.map.routePoints && SH.map.routePoints.length){
    var rPts = SH.map.routePoints;
    if(rPts.length >= 2){
      var dStr = 'M ' + rPts.map(function(p){ return p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' L ');
      out += '<path class="sh-route-line-bg" d="' + dStr + '" fill="none" />';
      out += '<path class="sh-route-line" d="' + dStr + '" fill="none" />';
    }
    rPts.forEach(function(pt, idx){
      var isStart = (idx === 0);
      var isEnd = (idx === rPts.length - 1 && rPts.length > 1);
      var col = isStart ? '#2ecc71' : (isEnd ? '#e74c3c' : '#f39c12');
      var lbl = isStart ? 'A' : (isEnd ? 'B' : String(idx + 1));
      out += '<g class="sh-route-pt" transform="translate(' + pt.x + ', ' + pt.y + ')" pointer-events="none">';
      out += '<circle r="14" fill="' + col + '" fill-opacity="0.25" class="sh-route-pt-pulse" />';
      out += '<circle r="8.5" fill="' + col + '" stroke="#110d08" stroke-width="2" />';
      out += '<text y="3.5" text-anchor="middle" font-size="10" font-weight="900" fill="#ffffff" font-family="Cinzel, sans-serif">' + lbl + '</text>';
      out += '<text y="-12" text-anchor="middle" font-size="9" font-weight="bold" fill="#ffffff" stroke="#110d08" stroke-width="2" paint-order="stroke fill">' + esc(pt.name) + '</text>';
      out += '</g>';
    });
  }

  // Custom User Markers Layer
  var showUserMarkers = (typeof SH !== 'undefined' && SH.map && SH.map.showUserMarkers !== false);
  if(showUserMarkers){
    var uMarkers = (typeof SH !== 'undefined' && SH.map && SH.map.userMarkers) ? SH.map.userMarkers : (typeof SH !== 'undefined' && typeof SH.loadUserMarkers === 'function' ? SH.loadUserMarkers() : []);
    var activeMarkerId = (typeof SH !== 'undefined' && SH.map && SH.map.selectedMarkerId);
    uMarkers.forEach(function(m){
      var isMActive = (m.id === activeMarkerId);
      var mCol = m.color || '#e74c3c';
      var mIcon = m.icon || '📍';
      var mx = Number(m.x) || 0;
      var my = Number(m.y) || 0;
      out += '<g class="sh-user-marker ' + (isMActive ? 'active' : '') + '" data-user-marker="' + escA(m.id) + '" transform="translate(' + mx.toFixed(1) + ', ' + my.toFixed(1) + ')">';
      out += '<circle r="9" fill="' + mCol + '" fill-opacity="0.22" class="sh-user-marker-pulse"/>';
      out += '<circle r="6.5" fill="' + mCol + '" stroke="#110d08" stroke-width="1.4" class="sh-user-marker-bg"/>';
      out += '<text y="2.8" text-anchor="middle" font-size="7.5">' + esc(mIcon) + '</text>';
      out += '<text y="-9" text-anchor="middle" font-size="7.5" font-weight="700" fill="#ffffff" stroke="#110d08" stroke-width="2" paint-order="stroke fill">' + esc(m.name) + '</text>';
      out += '</g>';
    });
  }

  // Temporary placing marker (cursor feedback)
  if(typeof SH !== 'undefined' && SH.map && SH.map.placingCoords){
    var pc = SH.map.placingCoords;
    var px = Number(pc.x) || 0;
    var py = Number(pc.y) || 0;
    out += '<g class="sh-user-marker-placing" transform="translate(' + px.toFixed(1) + ', ' + py.toFixed(1) + ')" pointer-events="none">';
    out += '<circle r="11" fill="#f1c40f" fill-opacity="0.3" class="sh-user-marker-pulse"/>';
    out += '<circle r="7.5" fill="#f1c40f" stroke="#ffffff" stroke-width="1.8" stroke-dasharray="3,2"/>';
    out += '<text y="3" text-anchor="middle" font-size="8">📍</text>';
    out += '</g>';
  }

  // Scale Bar (100 px = 400 km / 250 miles)
  out += '<g class="sh-map-scale-bar" transform="translate(805, 642)" pointer-events="none">';
  out += '<rect x="-8" y="-18" width="130" height="34" rx="6" fill="#120f0c" fill-opacity="0.85" stroke="rgba(197,160,89,0.35)" stroke-width="1"/>';
  out += '<line x1="0" y1="0" x2="100" y2="0" stroke="#f6e58d" stroke-width="2.5"/>';
  out += '<line x1="0" y1="-5" x2="0" y2="5" stroke="#f6e58d" stroke-width="2.5"/>';
  out += '<line x1="50" y1="-3.5" x2="50" y2="3.5" stroke="#f6e58d" stroke-width="1.8"/>';
  out += '<line x1="100" y1="-5" x2="100" y2="5" stroke="#f6e58d" stroke-width="2.5"/>';
  out += '<text x="0" y="-8" text-anchor="middle" font-size="8.5" fill="#f5f6fa" font-weight="bold" font-family="Cinzel, serif">0</text>';
  out += '<text x="50" y="-8" text-anchor="middle" font-size="8.5" fill="#f5f6fa" font-weight="bold" font-family="Cinzel, serif">200</text>';
  out += '<text x="100" y="-8" text-anchor="middle" font-size="8.5" fill="#f5f6fa" font-weight="bold" font-family="Cinzel, serif">400 км</text>';
  out += '<text x="50" y="11" text-anchor="middle" font-size="7.5" fill="#c5a059" font-weight="600">1 px = 4.0 км (2.5 миль)</text>';
  out += '</g>';

  // Compass Rose (bottom-right)
  out += '<g transform="translate(940, 610) scale(0.55)" opacity="0.65" pointer-events="none">';
  out += '<circle r="50" fill="none" stroke="rgba(197,160,89,0.3)" stroke-width="1"/>';
  out += '<polygon points="0,-60 12,-15 0,0 -12,-15" fill="#e74c3c"/>';
  out += '<polygon points="0,60 12,15 0,0 -12,15" fill="#95a5a6"/>';
  out += '<polygon points="60,0 15,12 0,0 15,-12" fill="#bdc3c7"/>';
  out += '<polygon points="-60,0 -15,12 0,0 -15,-12" fill="#7f8c8d"/>';
  out += '<text y="-68" text-anchor="middle" fill="#f6e58d" font-size="14" font-weight="bold">N</text>';
  out += '</g>';

  out += '</svg>';
  return out;
}

var SH_COUNTRY_CREST_KANJI = {
  fire: '火',
  wind: '風',
  earth: '土',
  lightning: '雷',
  water: '水',
  rain: '雨',
  grass: '草',
  waterfall: '滝',
  iron: '鉄',
  sound: '音',
  hot_water: '湯',
  frost: '霜',
  rivers: '川',
  stone: '石',
  tea: '茶',
  snow: '雪',
  sand: '砂',
  bears: '熊',
  noodles: '麺',
  honey: '蜜',
  bean_jam: '餡',
  neck: '首',
  valleys: '谷',
  silence: '黙',
  haze: '霞',
  vegetables: '菜',
  flowers: '花',
  birds: '鳥',
  demons: '鬼',
  swamps: '沼',
  claws: '爪',
  fangs_nw: '牙',
  moon: '月',
  sea_land: '海',
  waves: '波',
  whirlpool: '渦',
  woods: '森',
  fang_east: '牙',
  claws_east: '爪',
  eastern_mainland: '東',
  mountain_streams: '流',
  mountains: '山',
  mount_koryu: '竜',
  myoboku: '油',
  terra_incognita: '未',
  wastelands: '荒'
};

var SH_GREAT_CREST_COLORS = {
  fire: '#c0392b',
  wind: '#10ac84',
  earth: '#d35400',
  lightning: '#f1c40f',
  water: '#0984e3'
};

function getCountryCrestSvg(c, size){
  if(!c) return '';
  var sz = size || 44;
  
  // If country has an authentic symbol file, use it directly (flat, authentic, no fake gloss)
  if(c.symbolImg){
    return '<img src="'+escA(c.symbolImg)+'" class="sh-country-crest-icon" alt="'+escA(c.name)+'" style="width:'+sz+'px;height:'+sz+'px;border-radius:50%;object-fit:contain;flex-shrink:0;cursor:pointer;" title="'+escA(c.name)+'">';
  }

  // Otherwise, render a clean flat black border + solid white circle + black kanji (NO gloss, NO gradient shine)
  var cid = c.id;
  var kanji = (typeof SH_COUNTRY_CREST_KANJI !== 'undefined' && SH_COUNTRY_CREST_KANJI[cid]) || (c.kanji ? c.kanji.charAt(0) : '?');

  return '<svg class="sh-country-crest-icon" width="'+sz+'" height="'+sz+'" viewBox="0 0 100 100" style="border-radius:50%;flex-shrink:0;cursor:pointer;" title="'+escA(c.name)+' ('+escA(kanji)+')">'+
    '<circle cx="50" cy="50" r="46.5" fill="#ffffff" stroke="#110d08" stroke-width="7"/>'+
    '<text x="50" y="68" text-anchor="middle" font-family="Noto Serif JP, Yu Mincho, MS Mincho, serif" font-size="54" font-weight="900" fill="#110d08">'+esc(kanji)+'</text>'+
  '</svg>';
}

function getCountryCrestSvgGroup(c, cx, cy, size){
  if(!c) return '';
  var sz = size || 24;
  if(c.symbolImg){
    return '<image class="sh-map-crest-node" href="'+escA(c.symbolImg)+'" x="'+(cx - sz/2)+'" y="'+(cy - sz/2)+'" width="'+sz+'" height="'+sz+'"/>';
  }
  var cid = c.id;
  var kanji = (typeof SH_COUNTRY_CREST_KANJI !== 'undefined' && SH_COUNTRY_CREST_KANJI[cid]) || (c.kanji ? c.kanji.charAt(0) : '?');
  var r = sz / 2;
  return '<g class="sh-map-crest-node" transform="translate('+cx+', '+cy+')">'+
    '<circle cx="0" cy="0" r="'+r+'" fill="#ffffff" stroke="#110d08" stroke-width="'+(r*0.14)+'"/>'+
    '<text x="0" y="'+(r*0.36)+'" text-anchor="middle" font-family="Noto Serif JP, Yu Mincho, MS Mincho, serif" font-size="'+(sz*0.54)+'" font-weight="900" fill="#110d08">'+esc(kanji)+'</text>'+
  '</g>';
}

var SH_VILLAGE_SYMBOLS = {
  "fire": "symbols/village/Konohagakure_Symbol.webp",
  "wind": "symbols/village/Sunagakure_Symbol.webp",
  "earth": "symbols/village/Iwagakure_Symbol.webp",
  "lightning": "symbols/village/Kumogakure_Symbol.webp",
  "water": "symbols/village/Kirigakure_Symbol.webp",
  "rain": "symbols/village/Amegakure_Symbol.webp",
  "grass": "symbols/village/Kusagakure_Symbol.webp",
  "waterfall": "symbols/village/Takigakure_Symbol.webp",
  "sound": "symbols/village/Otogakure_Symbol.webp",
  "hot_water": "symbols/village/Yugakure_Symbol.webp",
  "frost": "symbols/village/Shimogakure_Symbol.webp",
  "snow": "symbols/village/Yukigakure_Symbol.webp",
  "bears": "symbols/village/Hoshigakure_Symbol.webp",
  "moon": "symbols/village/Getsugakure_Symbol.webp",
  "whirlpool": "symbols/village/Uzushiogakure_Symbol.webp",
  "stone": "symbols/village/Ishigakure_Symbol.webp",
  "valleys": "symbols/village/Tanigakure_Symbol.webp",
  "myoboku": "symbols/village/Toad_Symbol.webp",
  "woods": "symbols/village/Yumegakure_Symbol.webp",
  "claws_east": "symbols/village/Jomae_Village_Symbol.webp"
};

function getVillageSymbolHtml(c, sz){
  var size = sz || 40;
  var symImg = (c.village && c.village.symbolImg) || (typeof SH_VILLAGE_SYMBOLS !== 'undefined' && SH_VILLAGE_SYMBOLS[c.id]);
  if(symImg){
    return '<div class="sh-map-village-badge" style="width:'+size+'px;height:'+size+'px;" title="Символ скрытой деревни">'+
      '<img src="'+escA(symImg)+'" alt="'+escA(c.village.name)+'" style="width:'+Math.round(size*0.65)+'px;height:'+Math.round(size*0.65)+'px;" />'+
    '</div>';
  }
  var sym = (c.village && c.village.symbol) || '📍';
  return '<div class="sh-map-village-icon" style="font-size:'+Math.round(size*0.6)+'px;">'+sym+'</div>';
}

function renderMapInspector(c){
  if(!c) return '<div class="sh-map-inspector" id="shMapInspector"><div class="char-empty">Выберите страну на карте или в списке ниже для просмотра тактических данных.</div></div>';

  var typeLabels = { great: 'Великая держава', buffer: 'Буферная страна', island: 'Островное государство', east: 'Восточные земли' };
  var typeColors = { great: '#e74c3c', buffer: '#3498db', island: '#1abc9c', east: '#9b59b6' };
  var tLabel = typeLabels[c.type] || 'Территория';
  var tCol = typeColors[c.type] || 'var(--brass)';

  var vCard = '';
  if(c.village){
    var vIconHtml = getVillageSymbolHtml(c, 42);
    vCard = '<div class="sh-map-village-card">'+
      vIconHtml +
      '<div style="flex:1">'+
        '<div class="sh-map-village-name">'+esc(c.village.name)+'</div>'+
        '<div class="sh-map-village-sub">'+esc(c.village.title||'')+'</div>'+
      '</div>'+
      '<button class="sh-map-btn" id="shBtnFocusVillage" data-focus-x="'+c.village.x+'" data-focus-y="'+c.village.y+'" title="Приблизить камеру к скрытой деревне">🎯 Центрировать</button>'+
    '</div>';
  }

  var crestHtml = getCountryCrestSvg(c, 44);

  return '<div class="sh-map-inspector" id="shMapInspector">'+
    '<div class="sh-map-inspector-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">'+
      '<div class="sh-map-inspector-title" style="display:flex;align-items:center;gap:12px;">'+
        crestHtml +
        '<div>'+
          '<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;">'+
            '<span style="font-size:1.25rem;font-weight:700;font-family:Cinzel,serif;color:#f5f6fa;">'+esc(c.name)+'</span>'+
            (c.kanji ? '<span class="sh-map-inspector-kanji" style="font-size:1.15rem;color:'+c.accent+';font-weight:700;">'+esc(c.kanji)+'</span>' : '')+
          '</div>'+
          (c.shortName && c.shortName !== c.name ? '<div style="font-size:12px;color:var(--ink-dim);margin-top:1px;">'+esc(c.shortName)+'</div>' : '')+
        '</div>'+
      '</div>'+
      '<span class="sh-map-inspector-badge" style="background:'+tCol+'22;color:'+tCol+';border:1px solid '+tCol+'44;align-self:flex-start;">'+esc(tLabel)+'</span>'+
    '</div>'+
    vCard +
    '<div class="sh-map-grid-info">'+
      (c.kage ? '<div class="sh-map-info-item"><div class="sh-map-info-k">👑 Правитель / Лидер</div><div class="sh-map-info-v">'+esc(c.kage)+'</div></div>' : '')+
      (c.nature ? '<div class="sh-map-info-item"><div class="sh-map-info-k">🌀 Родная стихия / Особенности</div><div class="sh-map-info-v">'+esc(c.nature)+'</div></div>' : '')+
      (c.clans ? '<div class="sh-map-info-item"><div class="sh-map-info-k">🛡️ Известные кланы</div><div class="sh-map-info-v">'+esc(c.clans)+'</div></div>' : '')+
      (c.danger ? '<div class="sh-map-info-item"><div class="sh-map-info-k">⚠️ Режим границы и опасность</div><div class="sh-map-info-v">'+esc(c.danger)+'</div></div>' : '')+
      (c.terrain ? '<div class="sh-map-info-item" style="grid-column:1/-1"><div class="sh-map-info-k">🌲 Рельеф и местность</div><div class="sh-map-info-v">'+esc(c.terrain)+'</div></div>' : '')+
      (c.military ? '<div class="sh-map-info-item" style="grid-column:1/-1"><div class="sh-map-info-k">⚔️ Военная организация</div><div class="sh-map-info-v">'+esc(c.military)+'</div></div>' : '')+
    '</div>'+
    (c.lore ? '<div class="sh-map-lore-text">'+esc(c.lore)+'</div>' : '')+
    '<div class="sh-map-inspector-actions">'+
      '<button class="btn-primary" id="shBtnCopyMapLore" data-country="'+escA(c.id)+'">📋 Скопировать лор в заявку AI Studio</button>'+'\n      <button class="sh-map-btn" id="shBtnCountryMissionBase" data-country="'+escA(c.id)+'" style="color:#d29bfa;border-color:rgba(155,89,182,0.4);" title="Открыть доску миссий для этого государства">📜 Миссии отсюда</button>'+
      (c.village ? '<button class="btn-ghost" id="shBtnFocusVillage2" data-focus-x="'+c.village.x+'" data-focus-y="'+c.village.y+'">🎯 Найти на карте</button>' : '')+
    '</div>'+
  '</div>';
}

function pointInPoly(pt, poly) {
  var inside = false;
  var x = pt[0], y = pt[1];
  for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    var xi = poly[i][0], yi = poly[i][1];
    var xj = poly[j][0], yj = poly[j][1];
    var intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function calcRouteDistance(points){
  if(!points || points.length < 2) return { px: 0, km: 0, miles: 0 };
  var px = 0;
  for(var i = 0; i < points.length - 1; i++){
    px += Math.hypot(points[i+1].x - points[i].x, points[i+1].y - points[i].y);
  }
  var km = Math.round(px * 4.0);
  var miles = Math.round(km * 0.621371);
  return { px: px, km: km, miles: miles };
}

function findCountryAtPoint(pt, mapData){
  if(!pt || !mapData) return null;
  for(var i = 0; i < mapData.length; i++){
    var c = mapData[i];
    var polyList = (c.polygons && c.polygons.length) ? c.polygons : (c.points ? [c.points] : []);
    for(var j = 0; j < polyList.length; j++){
      if(pointInPoly([pt.x, pt.y], polyList[j])){
        return c;
      }
    }
  }
  return null;
}

function snapToVillage(pt, mapData, threshold){
  var th = threshold || 18;
  var best = null;
  var bestDist = th;
  for(var i = 0; i < mapData.length; i++){
    var c = mapData[i];
    if(!c.village) continue;
    var d = Math.hypot(pt.x - c.village.x, pt.y - c.village.y);
    if(d < bestDist){
      bestDist = d;
      best = c;
    }
  }
  if(best){
    return {
      x: best.village.x,
      y: best.village.y,
      name: best.village.name,
      countryId: best.id
    };
  }
  return null;
}

function getCrossedCountries(points, mapData){
  if(!points || points.length < 2) return [];
  var visited = [];
  var lastId = null;

  for(var i = 0; i < points.length - 1; i++){
    var p1 = points[i];
    var p2 = points[i+1];
    var dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    var steps = Math.max(2, Math.ceil(dist / 4));
    for(var s = 0; s <= steps; s++){
      var t = s / steps;
      var curX = p1.x + (p2.x - p1.x) * t;
      var curY = p1.y + (p2.y - p1.y) * t;
      var foundCountry = findCountryAtPoint({ x: curX, y: curY }, mapData);
      if(foundCountry && foundCountry.id !== lastId){
        lastId = foundCountry.id;
        if(visited.indexOf(foundCountry) === -1){
          visited.push(foundCountry);
        }
      }
    }
  }
  return visited;
}

var SH_TERRAIN_CONFIG = {
  plains_forest: {
    id: 'plains_forest',
    name: 'Леса и равнины',
    icon: '🌲',
    color: '#27ae60',
    mult: { shinobi: 1.0, walk: 1.0, horse: 1.0, bird: 1.0 },
    desc: 'Лесной тракт, равнины. Идеальные кроны деревьев для чакро-спринта.'
  },
  desert: {
    id: 'desert',
    name: 'Пустыни и барханы',
    icon: '🏜️',
    color: '#e58e26',
    mult: { shinobi: 1.35, walk: 1.8, horse: 2.0, bird: 1.1 },
    desc: 'Зыбучие пески, палящий зной. Нет ветвей для прыжков.'
  },
  mountains: {
    id: 'mountains',
    name: 'Горы и скалы',
    icon: '⛰️',
    color: '#795548',
    mult: { shinobi: 1.4, walk: 2.2, horse: 3.5, bird: 1.15 },
    desc: 'Отвесные скалы, каньоны и перевалы. Скалолазание (Кинобори).'
  },
  water: {
    id: 'water',
    name: 'Море и водные просторы',
    icon: '🌊',
    color: '#2980b9',
    mult: { shinobi: 1.2, walk: 0.25, horse: 0.25, bird: 0.9 },
    desc: 'Морской переход. Бег по воде (Суймен Хоко) или парусное судно (140 км/д).'
  },
  swamp: {
    id: 'swamp',
    name: 'Болота и дельты рек',
    icon: '🌧️',
    color: '#16a085',
    mult: { shinobi: 1.25, walk: 2.0, horse: 2.5, bird: 1.0 },
    desc: 'Трясины, разливы рек и вечные дожди.'
  }
};

function getTerrainAtPoint(pt, mapData){
  if(!pt) return 'water';
  var c = findCountryAtPoint(pt, mapData);
  if(!c) return 'water';

  var cid = c.id;
  if(cid === 'fire' || cid === 'grass' || cid === 'tea' || cid === 'woods' || cid === 'leaf' || cid === 'bamboo' || cid === 'noodles' || cid === 'vegetables') return 'plains_forest';
  if(cid === 'wind' || cid === 'sand' || cid === 'red_desert') return 'desert';
  if(cid === 'earth' || cid === 'iron' || cid === 'mountains' || cid === 'mount_koryu' || cid === 'frost' || cid === 'fangs' || cid === 'snow' || cid === 'sound') return 'mountains';
  if(cid === 'water' || cid === 'sea_land' || cid === 'island' || cid === 'waves') return 'water';
  if(cid === 'rain' || cid === 'rivers' || cid === 'swamp') return 'swamp';

  var tStr = (c.terrain || '').toLowerCase();
  if(tStr.indexOf('пустын') !== -1 || tStr.indexOf('бархан') !== -1 || tStr.indexOf('песк') !== -1) return 'desert';
  if(tStr.indexOf('гор') !== -1 || tStr.indexOf('скал') !== -1 || tStr.indexOf('хреб') !== -1 || tStr.indexOf('каньон') !== -1) return 'mountains';
  if(tStr.indexOf('болот') !== -1 || tStr.indexOf('топ') !== -1 || tStr.indexOf('дожд') !== -1) return 'swamp';
  if(tStr.indexOf('море') !== -1 || tStr.indexOf('остров') !== -1 || tStr.indexOf('океан') !== -1 || tStr.indexOf('морск') !== -1 || tStr.indexOf('пролив') !== -1 || tStr.indexOf('архипелаг') !== -1) return 'water';
  if(tStr.indexOf('лес') !== -1 || tStr.indexOf('равнин') !== -1 || tStr.indexOf('долин') !== -1) return 'plains_forest';

  return 'plains_forest';
}

function calcRouteTerrainProfile(points, mapData){
  var res = {
    totalKm: 0,
    totalMiles: 0,
    breakdown: {
      plains_forest: { km: 0, pct: 0 },
      desert: { km: 0, pct: 0 },
      mountains: { km: 0, pct: 0 },
      water: { km: 0, pct: 0 },
      swamp: { km: 0, pct: 0 }
    },
    times: {
      shinobi: { days: 0, hours: 0, str: '' },
      walk: { days: 0, hours: 0, str: '' },
      horse: { days: 0, hours: 0, str: '' },
      bird: { days: 0, hours: 0, str: '' }
    },
    warnings: []
  };

  if(!points || points.length < 2) return res;

  var totalRawPx = 0;
  var terrainPx = {
    plains_forest: 0,
    desert: 0,
    mountains: 0,
    water: 0,
    swamp: 0
  };

  for(var i = 0; i < points.length - 1; i++){
    var p1 = points[i];
    var p2 = points[i+1];
    var segDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    totalRawPx += segDist;

    var steps = Math.max(2, Math.ceil(segDist / 2.5));
    var stepPx = segDist / steps;

    for(var s = 0; s < steps; s++){
      var t = (s + 0.5) / steps;
      var curPt = { x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t };
      var terr = getTerrainAtPoint(curPt, mapData);
      terrainPx[terr] = (terrainPx[terr] || 0) + stepPx;
    }
  }

  var totalKm = Math.round(totalRawPx * 4.0);
  res.totalKm = totalKm;
  res.totalMiles = Math.round(totalKm * 0.621371);

  var sumPcts = 0;
  for(var k in terrainPx){
    var km = Math.round(terrainPx[k] * 4.0);
    var pct = totalKm > 0 ? Math.round((km / totalKm) * 100) : 0;
    res.breakdown[k] = { km: km, pct: pct };
    sumPcts += pct;
  }
  if(totalKm > 0 && sumPcts !== 100){
    var maxKey = 'plains_forest';
    var maxVal = 0;
    for(var mk in res.breakdown){
      if(res.breakdown[mk].km > maxVal){
        maxVal = res.breakdown[mk].km;
        maxKey = mk;
      }
    }
    res.breakdown[maxKey].pct += (100 - sumPcts);
  }

  var effShinobiHours = 0;
  var effWalkDays = 0;
  var effHorseDays = 0;
  var effBirdHours = 0;

  for(var tKey in terrainPx){
    var tKm = terrainPx[tKey] * 4.0;
    if(tKm <= 0) continue;
    var cfg = SH_TERRAIN_CONFIG[tKey];
    var m = cfg ? cfg.mult : { shinobi: 1.0, walk: 1.0, horse: 1.0, bird: 1.0 };

    effShinobiHours += (tKm / 40.0) * m.shinobi;

    if(tKey === 'water'){
      effWalkDays += (tKm / 140.0);
      effHorseDays += (tKm / 140.0);
    } else {
      effWalkDays += (tKm / 35.0) * m.walk;
      effHorseDays += (tKm / 75.0) * m.horse;
    }

    effBirdHours += (tKm / 90.0) * m.bird;
  }

  var shDays = effShinobiHours / 8.0;
  res.times.shinobi = {
    hours: Math.round(effShinobiHours * 10) / 10,
    days: Math.round(shDays * 10) / 10,
    str: '~' + (shDays >= 1 ? (shDays.toFixed(1) + ' дн.') : (Math.round(effShinobiHours) + ' ч')) + ' (' + Math.round(effShinobiHours) + ' ч бега)'
  };

  res.times.walk = {
    days: Math.round(effWalkDays * 10) / 10,
    str: '~' + effWalkDays.toFixed(1) + ' дн.'
  };

  res.times.horse = {
    days: Math.round(effHorseDays * 10) / 10,
    str: '~' + effHorseDays.toFixed(1) + ' дн.'
  };

  res.times.bird = {
    hours: Math.round(effBirdHours * 10) / 10,
    str: '~' + effBirdHours.toFixed(1) + ' ч'
  };

  if(res.breakdown.water.km >= 15){
    res.warnings.push({
      icon: '🌊',
      title: 'Морской переход (' + res.breakdown.water.km + ' км, ' + res.breakdown.water.pct + '%)',
      desc: 'Шиноби бегут по воде (Суймен Хоко): расход 1 чакры за каждые 2 ч бега. При шторме: DC 12 Контроль чакры. Гражданские и повозки требуют наёма корабля или парома (от 300 рё/чел).'
    });
  }

  if(res.breakdown.desert.km >= 25){
    res.warnings.push({
      icon: '🏜️',
      title: 'Пустынные барханы (' + res.breakdown.desert.km + ' км, ' + res.breakdown.desert.pct + '%)',
      desc: 'Зыбучие пески и зной. Дневной марш опасен (DC 13 Спасбросок Телосложения против истощения), переход рекомендуется в сумерках и ночью. Запас воды: х2.'
    });
  }

  if(res.breakdown.mountains.km >= 25){
    res.warnings.push({
      icon: '⛰️',
      title: 'Горные хребты и каньоны (' + res.breakdown.mountains.km + ' км, ' + res.breakdown.mountains.pct + '%)',
      desc: 'Отвесные скалы и перевалы. Шиноби используют Кинобори (ходьба по скалам). Повозки и вьючные лошади не пройдут без подготовленного караванного тракта (задержка до х3.5).'
    });
  }

  if(res.breakdown.swamp.km >= 20){
    res.warnings.push({
      icon: '🌧️',
      title: 'Болота и речные топи (' + res.breakdown.swamp.km + ' км, ' + res.breakdown.swamp.pct + '%)',
      desc: 'Трясины, разливы рек, ядовитые испарения и пиявки. Проверка DC 11 Внимательность для защиты от внезапных засад в камышах.'
    });
  }

  return res;
}

var SH_TRAVEL_ENCOUNTERS = [
  {
    roll: 1,
    icon: "💀",
    title: "Критическая засада нукенинов",
    type: "Боевое столкновение",
    dc: "DC 16 Внимательность / Инициатива",
    desc: "Отряд беглых ниндзя ранга B-A подготовил ловушку с взрывными печатями на узкой горной тропе. Враги атакуют первыми с выгодной позиции.",
    effect: "Внезапное нападение. Провал проверки: отряд получает 3d10 урона от взрывов в первом раунде."
  },
  {
    roll: 2,
    icon: "🌪️",
    title: "Стихийная буря чакры",
    type: "Опасность окружения",
    dc: "DC 14 Телосложение",
    desc: "Внезапная яростная песчаная буря или токсичный грозовой фронт ослепляет и сбивает ориентиры.",
    effect: "Скорость перемещения падает вдвое (+1 день пути). При провале спасброска: 1 степень истощения."
  },
  {
    roll: 3,
    icon: "🛑",
    title: "Усиленный кордон АНБУ",
    type: "Пограничный досмотр",
    dc: "DC 14 Убеждение / DC 15 Скрытность",
    desc: "Пограничная застава проводит тотальный досмотр с сенсорными барьерами и допросными печатями.",
    effect: "Успех: беспрепятственный проход. Провал: задержание на 6 часов для допроса или конфликт."
  },
  {
    roll: 4,
    icon: "🦅",
    title: "Вражеский дозорный сокол",
    type: "Разведка",
    dc: "DC 13 Дальнобойная атака / DC 14 Скрытность",
    desc: "В небе кружит дрессированная птица-шпион чужой Скрытой Деревни, передающая координаты.",
    effect: "Если сокол не сбит за 1 раунд, вражеский гарнизон в следующей точке будет готов к перехвату."
  },
  {
    roll: 5,
    icon: "🕸️",
    title: "Минное поле древней войны",
    type: "Ловушка",
    dc: "DC 13 Внимательность / DC 14 Ловкость",
    desc: "Забытые проволочные растяжки, ядовитые колья и замаскированные свитки взрыва.",
    effect: "Провал: 2d8 режущего урона и отравление на 1d4 часа."
  },
  {
    roll: 6,
    icon: "🐗",
    title: "Атака гигантского зверя чакры",
    type: "Бой с дикой фауной",
    dc: "DC 12 Уход за животными / Бой",
    desc: "Агрессивный гигантский вепрь или хищная многоножка, прикормленная дикими чакро-озерами.",
    effect: "Победа дает ценные алхимические ингредиенты и сытное мясо для пайков (+2 дня еды)."
  },
  {
    roll: 7,
    icon: "🌫️",
    title: "Иллюзорный туман / Гендзюцу местности",
    type: "Навигация",
    dc: "DC 13 Выживание / Анализ чакры",
    desc: "Густой туман или остаточное гендзюцу местности сбивает компас и заставляет ходить кругами.",
    effect: "Провал: потеря 4 часов пути и лишний бросок на ориентирование."
  },
  {
    roll: 8,
    icon: "🗡️",
    title: "Следы боя и раненый курьер",
    type: "Случайная дилемма",
    dc: "DC 12 Медицина",
    desc: "На обочине найден раненый ниндзя-вестник с запечатанным свитком чужой деревни.",
    effect: "Спасение приносит благодарность деревни, 50 рё или секретные сведения о заставах на тракте."
  },
  {
    roll: 9,
    icon: "⛺",
    title: "Караван купцов под охраной ронинов",
    type: "Торговля и отдых",
    dc: "Мирное взаимодействие",
    desc: "Купцы охотно делятся горячей похлебкой и продают снаряжение (кунаи, свитки, пайки) со скидкой 10%.",
    effect: "Безопасный короткий привал, возможность восполнить припасы."
  },
  {
    roll: 10,
    icon: "🍵",
    title: "Придорожный чайный домик",
    type: "Отдых",
    dc: "Без проверок",
    desc: "Уютная чайная у ручья. Хозяин угощает данго и охотно делится свежими слухами о ситуации на трактах.",
    effect: "Полноценный короткий отдых. +1d4 к следующей проверке Выживания."
  },
  {
    roll: 11,
    icon: "⛩️",
    title: "Заброшенное святилище Мудреца",
    type: "Священное место",
    dc: "DC 14 Религия / Анализ чакры",
    desc: "Древний алтарь, насыщенный природной энергией. Идеальное место для медитации.",
    effect: "Медитация (1 час) восстанавливает 1 ячейку дзюцу / кость хитов и дает +1 к броскам чакры."
  },
  {
    roll: 12,
    icon: "🤝",
    title: "Встречный союзный патруль",
    type: "Союзники",
    dc: "DC 11 Этикет шиноби",
    desc: "Отряд чунинов союзной деревни, патрулирующий сектор по совместному договору безопасности.",
    effect: "Обмен кодами и предупреждение о засадах впереди (преимущество на следующую инициативу)."
  },
  {
    roll: 13,
    icon: "🌧️",
    title: "Затяжной ливень / Размытый тракт",
    type: "Погода",
    dc: "DC 11 Выносливость",
    desc: "Размытые тропы и скользкие кроны деревьев требуют предельной концентрации при спринте по ветвям.",
    effect: "Провал: падение с веток, 1d6 дробящего урона, расход 1 дополнительного пайка."
  },
  {
    roll: 14,
    icon: "🎣",
    title: "Обильный оазис / Рыбная река",
    type: "Ресурсы",
    dc: "DC 10 Выживание",
    desc: "Кристально чистый водоем, изобилующий рыбой и целебными дикорастущими травами.",
    effect: "Пополнение запасов провизии на 3 дня пути без траты денег."
  },
  {
    roll: 15,
    icon: "📦",
    title: "Тайник шиноби времен Второй Войны",
    type: "Находка",
    dc: "DC 14 Внимательность / Расследование",
    desc: "Спрятанный в полом стволе дерева водонепроницаемый свиток с неиспользованным снаряжением.",
    effect: "Трофеи: 1d6 метательного оружия со взрывными печатями и первоклассная дымовая шашка."
  },
  {
    roll: 16,
    icon: "📜",
    title: "Бродячий монах / Мастер печатей",
    type: "Встреча",
    dc: "DC 12 Мудрость",
    desc: "Странствующий практик фуиндзюцу предлагает нанести защитный оберег на оружие или свитки.",
    effect: "Защита от одного эффекта страха или гендзюцу в течение следующих 24 часов."
  },
  {
    roll: 17,
    icon: "🦊",
    title: "Следы редкого призывного духа",
    type: "Исследование",
    dc: "DC 15 Уход за животными / Магия",
    desc: "Маленький зверек-вестник клана призывов оставляет мерцающие следы природной чакры.",
    effect: "Успех позволяет наладить контакт и получить помощь зверька в разведке ближайшего сектора."
  },
  {
    roll: 18,
    icon: "💎",
    title: "Скрытая целебная горячая купель",
    type: "Восстановление",
    dc: "Без проверок",
    desc: "Минеральный источник, насыщенный природными солями и целительной чакрой земли.",
    effect: "Купание снимает все степени истощения и полностью восстанавливает максимум хитов."
  },
  {
    roll: 19,
    icon: "💨",
    title: "Попутный чакра-ветер",
    type: "Благоприятный фактор",
    dc: "DC 11 Контроль чакры",
    desc: "Идеальные воздушные потоки в кронах деревьев позволяют легко и стремительно скользить по ветвям.",
    effect: "Скорость перемещения увеличивается на 25%, время перехода сокращается на четверть!"
  },
  {
    roll: 20,
    icon: "🌟",
    title: "Триумфальный беспрепятственный путь!",
    type: "Критическая удача",
    dc: "Критический успех",
    desc: "Идеальная ясная погода, полное отсутствие вражеских сенсоров, легкий бег и единение с природной чакрой.",
    effect: "Время перехода сокращается на 30%. Весь отряд получает вдохновение шиноби (+1d8 к любому броску)!"
  }
];

var SH_ROUTE_PRESETS = {
  konoha_suna: [
    { x: 599, y: 306, name: 'Конохагакуре', countryId: 'fire' },
    { x: 550, y: 375, name: 'Южный тракт Огня', countryId: 'fire' },
    { x: 500, y: 440, name: 'Перевал Страны Реки', countryId: 'rivers' },
    { x: 445, y: 385, name: 'Сунагакуре (Каньон)', countryId: 'wind' }
  ],
  konoha_waves: [
    { x: 599, y: 306, name: 'Конохагакуре', countryId: 'fire' },
    { x: 673, y: 345, name: 'Побережье Огня', countryId: 'fire' },
    { x: 667, y: 368, name: 'Великий мост Наруто (Волны)', countryId: 'waves' }
  ],
  konoha_rain: [
    { x: 599, y: 306, name: 'Конохагакуре', countryId: 'fire' },
    { x: 540, y: 300, name: 'Пограничье Огня', countryId: 'fire' },
    { x: 520, y: 291, name: 'Амегакуре', countryId: 'rain' }
  ],
  konoha_kumo: [
    { x: 599, y: 306, name: 'Конохагакуре', countryId: 'fire' },
    { x: 670, y: 215, name: 'Тракт Горячих Источников', countryId: 'hot_water' },
    { x: 743, y: 141, name: 'Кумогакуре', countryId: 'lightning' }
  ],
  konoha_iwa: [
    { x: 599, y: 306, name: 'Конохагакуре', countryId: 'fire' },
    { x: 531, y: 274, name: 'Мост Каннаби (Трава)', countryId: 'grass' },
    { x: 435, y: 165, name: 'Ивагакуре', countryId: 'earth' }
  ],
  kumo_iwa: [
    { x: 743, y: 141, name: 'Кумогакуре', countryId: 'lightning' },
    { x: 610, y: 100, name: 'Северный хребет', countryId: 'lightning' },
    { x: 520, y: 130, name: 'Граница Страны Земли', countryId: 'earth' },
    { x: 435, y: 165, name: 'Ивагакуре', countryId: 'earth' }
  ],
  suna_rain: [
    { x: 445, y: 385, name: 'Сунагакуре', countryId: 'wind' },
    { x: 490, y: 320, name: 'Каньон Ветра', countryId: 'wind' },
    { x: 520, y: 291, name: 'Амегакуре', countryId: 'rain' }
  ]
};

function renderRouteInspector(points, mapData, encounter){
  var hasPoints = points && points.length >= 2;
  var dist = calcRouteDistance(points);
  var crossed = hasPoints ? getCrossedCountries(points, mapData) : [];
  var profile = hasPoints ? calcRouteTerrainProfile(points, mapData) : null;

  var headHtml = '<div class="sh-map-inspector-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">'+
    '<div class="sh-map-inspector-title" style="display:flex;align-items:center;gap:12px;">'+
      '<div style="font-size:28px;">🧭</div>'+
      '<div>'+
        '<div style="font-size:1.25rem;font-weight:700;font-family:Cinzel,serif;color:#f5f6fa;">Навигатор и маршруты шиноби</div>'+
        '<div style="font-size:12px;color:var(--ink-dim);margin-top:2px;">Тактический расчет дистанций, темпа передвижения и дорожных событий</div>'+
      '</div>'+
    '</div>'+
    '<span class="sh-map-inspector-badge" style="background:rgba(246,229,141,0.15);color:#f6e58d;border:1px solid rgba(246,229,141,0.4);">Калибровка 1 px = 4.0 км</span>'+
  '</div>';

  if(!points || points.length === 0){
    return '<div class="sh-map-inspector" id="shMapInspector">'+
      headHtml +
      '<div style="background:rgba(20,16,12,0.6);border:1px dashed rgba(197,160,89,0.3);border-radius:10px;padding:24px;text-align:center;margin-bottom:14px;">'+
        '<div style="font-size:32px;margin-bottom:8px;">🗺️</div>'+
        '<div style="font-size:16px;font-weight:700;color:var(--brass,#c5a059);margin-bottom:6px;">Задайте маршрут на карте</div>'+
        '<div style="font-size:13px;color:var(--ink-dim,#a89f91);max-width:560px;margin:0 auto 16px;line-height:1.5;">'+
          'Кликните в любую точку карты или на Скрытую Деревню, чтобы установить начальную точку <b>A (Старт)</b>, затем выберите точку назначения <b>B (Финиш)</b>.<br>'+
          'Или выберите готовый каноничный маршрут из списка в верхней панели.'+
        '</div>'+
        '<div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">'+
          '<button class="sh-map-btn" onclick="var s=document.getElementById(\'shRoutePreset\');if(s){s.value=\'konoha_suna\';s.dispatchEvent(new Event(\'change\'));}">📍 Коноха ➔ Суна</button>'+
          '<button class="sh-map-btn" onclick="var s=document.getElementById(\'shRoutePreset\');if(s){s.value=\'konoha_waves\';s.dispatchEvent(new Event(\'change\'));}">🌊 Коноха ➔ Волны</button>'+
          '<button class="sh-map-btn" onclick="var s=document.getElementById(\'shRoutePreset\');if(s){s.value=\'konoha_rain\';s.dispatchEvent(new Event(\'change\'));}">🌧️ Коноха ➔ Дождь</button>'+
        '</div>'+
      '</div>'+
    '</div>';
  }

  if(points.length === 1){
    return '<div class="sh-map-inspector" id="shMapInspector">'+
      headHtml +
      '<div style="background:rgba(20,16,12,0.6);border:1px solid rgba(46,204,113,0.3);border-radius:10px;padding:20px;text-align:center;margin-bottom:14px;">'+
        '<div style="font-size:24px;margin-bottom:6px;">🟢</div>'+
        '<div style="font-size:16px;font-weight:700;color:#2ecc71;margin-bottom:6px;">Точка A (Старт) установлена: '+esc(points[0].name)+'</div>'+
        '<div style="font-size:13px;color:var(--ink-dim,#a89f91);line-height:1.5;">'+
          'Теперь кликните на карте или деревне, чтобы задать точку назначения <b>B (Финиш)</b>.'+
        '</div>'+
        '<button class="sh-map-btn" id="shBtnClearRoute" style="margin-top:12px;">✕ Сбросить точку</button>'+
      '</div>'+
    '</div>';
  }

  var startName = points[0].name;
  var endName = points[points.length - 1].name;
  var ptsListHtml = points.map(function(p, idx){
    var isStart = (idx === 0);
    var isEnd = (idx === points.length - 1);
    var tag = isStart ? '🟢 Старт' : (isEnd ? '🔴 Финиш' : ('🟠 Точка ' + (idx + 1)));
    return '<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(20,16,12,0.6);padding:3px 8px;border-radius:6px;border:1px solid rgba(197,160,89,0.2);font-size:11px;">'+
      '<b>'+tag+':</b> '+esc(p.name)+
    '</span>';
  }).join(' <span style="color:var(--brass);">➔</span> ');

  var km = profile ? profile.totalKm : dist.km;
  var mi = profile ? profile.totalMiles : dist.miles;

  var shinobiStr = profile ? profile.times.shinobi.str : ((km < 100) ? ((km / 35).toFixed(1) + ' ч') : ((km / 320).toFixed(1) + ' дн (' + (km / 35).toFixed(1) + ' ч пути)'));
  var walkStr = profile ? profile.times.walk.str : ((km < 35) ? ((km / 4.4).toFixed(1) + ' ч') : ((km / 35).toFixed(1) + ' дн (' + (km / 4.4).toFixed(1) + ' ч)'));
  var horseStr = profile ? profile.times.horse.str : ((km < 50) ? ((km / 10).toFixed(1) + ' ч') : ((km / 75).toFixed(1) + ' дн'));
  var birdStr = profile ? profile.times.bird.str : ((km < 900) ? ((km / 90).toFixed(1) + ' ч') : ((km / 900).toFixed(1) + ' дн (' + (km / 90).toFixed(1) + ' ч)'));

  var hasSpecialTerrain = profile && (profile.breakdown.desert.pct > 0 || profile.breakdown.mountains.pct > 0 || profile.breakdown.water.pct > 0 || profile.breakdown.swamp.pct > 0);
  var shinobiSub = hasSpecialTerrain ? 'С поправкой на рельеф (база: 320 км/д)' : '320 км/день (по ветвям, 40 км/ч)';
  var walkSub = '35 км/день • Караван / Эскорт';
  var horseSub = profile && profile.breakdown.mountains.km >= 25 ? '⚠️ Сильная задержка в горах (до х3.5)' : (profile && profile.breakdown.water.km >= 15 ? '⚓ Требуется паром/судно' : '75 км/день • Ниндзя-почта');
  var birdSub = '90 км/ч (экстренная депеша)';

  var terrainBarHtml = '';
  if(profile && profile.totalKm > 0){
    var segs = [];
    var pills = [];
    for(var tId in SH_TERRAIN_CONFIG){
      var tInfo = SH_TERRAIN_CONFIG[tId];
      var b = profile.breakdown[tId];
      if(b && b.pct > 0){
        segs.push('<div class="sh-terrain-seg" style="width:'+b.pct+'%;background:'+tInfo.color+';" title="'+escA(tInfo.name)+': '+b.km+' км ('+b.pct+'%)"></div>');
        pills.push('<div class="sh-terrain-pill"><span class="sh-terrain-pill-dot" style="background:'+tInfo.color+';"></span><span>'+tInfo.icon+' '+esc(tInfo.name)+': <b>'+b.km+' км</b> ('+b.pct+'%)</span></div>');
      }
    }
    terrainBarHtml = '<div style="margin:12px 0 10px;">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--ink-dim,#a89f91);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">'+
        '<span>Рельеф и типы местности маршрута</span>'+
        '<span>'+profile.totalKm+' км</span>'+
      '</div>'+
      '<div class="sh-terrain-bar">'+segs.join('')+'</div>'+
      '<div class="sh-terrain-pills">'+pills.join('')+'</div>'+
    '</div>';
  }

  var crossedHtml = '';
  if(crossed && crossed.length){
    crossedHtml = '<div style="margin-top:14px;margin-bottom:14px;">'+
      '<div class="sh-map-info-k" style="margin-bottom:6px;">🚩 Пересекаемые государства и границы ('+crossed.length+')</div>'+
      '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">'+
        crossed.map(function(c){
          var symImg = (c.village && c.village.symbolImg) || (typeof SH_VILLAGE_SYMBOLS !== 'undefined' && SH_VILLAGE_SYMBOLS[c.id]);
          var iconHtml = symImg ?
            ('<img src="'+escA(symImg)+'" style="width:16px;height:16px;object-fit:contain;background:#fff;border-radius:50%;padding:1px;vertical-align:middle;" />') :
            ('<span style="color:'+c.accent+';font-weight:bold;">'+(c.kanji ? c.kanji.charAt(0) : '📍')+'</span>');
          return '<div class="sh-route-transit-pill" title="'+escA(c.name)+': '+(c.danger||'Умеренный режим')+'">'+
            iconHtml +
            '<span>'+esc(c.name)+'</span>'+
            (c.danger ? '<span style="font-size:10px;opacity:0.75;margin-left:2px;">('+esc(c.danger.split(' ')[0])+')</span>' : '')+
          '</div>';
        }).join('<span style="color:var(--brass);font-weight:bold;">➔</span>')+
      '</div>'+
    '</div>';
  }

  var logisticsHtml = '';
  if(profile && profile.warnings && profile.warnings.length){
    logisticsHtml = '<div class="sh-logistics-box">'+
      '<div style="font-size:12px;font-weight:700;color:var(--brass,#c5a059);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;display:flex;align-items:center;gap:6px;">'+
        '<span>🎒</span><span>Логистика и опасности ландшафта (D&D 2024 / DM Guide)</span>'+
      '</div>'+
      profile.warnings.map(function(w){
        return '<div class="sh-logistics-item">'+
          '<span style="font-size:15px;flex-shrink:0;">'+w.icon+'</span>'+
          '<div><b>'+esc(w.title)+':</b> '+esc(w.desc)+'</div>'+
        '</div>';
      }).join('')+
    '</div>';
  }

  var encHtml = '';
  if(encounter){
    encHtml = '<div class="sh-encounter-box">'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:6px;">'+
        '<div style="display:flex;align-items:center;gap:8px;">'+
          '<span style="font-size:24px;">'+(encounter.icon||'🎲')+'</span>'+
          '<div>'+
            '<div style="font-weight:700;font-size:15px;color:#f5f6fa;">'+esc(encounter.title)+'</div>'+
            '<div style="font-size:11px;color:#e74c3c;font-weight:600;text-transform:uppercase;">Бросок D20: '+encounter.roll+' • '+esc(encounter.type)+'</div>'+
          '</div>'+
        '</div>'+
        '<span style="background:rgba(231,76,60,0.2);color:#ff7675;border:1px solid rgba(231,76,60,0.4);border-radius:4px;padding:2px 6px;font-size:11px;font-weight:bold;">'+esc(encounter.dc||'Проверка')+'</span>'+
      '</div>'+
      '<div style="font-size:12.5px;color:#e0d8cb;line-height:1.5;margin-bottom:8px;">'+esc(encounter.desc)+'</div>'+
      '<div style="font-size:12px;color:var(--brass,#c5a059);background:rgba(20,16,12,0.6);padding:6px 10px;border-radius:6px;border-left:2px solid var(--brass);"><b>Механика:</b> '+esc(encounter.effect)+'</div>'+
    '</div>';
  }

  return '<div class="sh-map-inspector" id="shMapInspector">'+
    headHtml +
    '<div style="background:rgba(35,28,20,0.6);border:1px solid rgba(197,160,89,0.3);border-radius:8px;padding:12px 14px;margin-bottom:14px;">'+
      '<div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px;margin-bottom:8px;">'+
        '<div style="font-size:17px;font-weight:700;color:var(--brass,#c5a059);font-family:Cinzel,serif;">'+
          esc(startName)+' <span style="color:#ffffff;">➔</span> '+esc(endName)+
        '</div>'+
        '<div style="font-size:18px;font-weight:700;color:#f6e58d;">'+
          km+' <span style="font-size:13px;font-weight:normal;color:var(--ink-dim);">км ('+mi+' миль)</span>'+
        '</div>'+
      '</div>'+
      '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">'+
        ptsListHtml +
      '</div>'+
      terrainBarHtml +
    '</div>'+
    '<div class="sh-map-grid-info" style="grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));gap:10px;">'+
      '<div class="sh-map-info-item" style="border-color:rgba(46,204,113,0.3);">'+
        '<div class="sh-map-info-k" style="color:#2ecc71;">🏃‍♂️ Бег шиноби (Чакро-спринт)</div>'+
        '<div class="sh-map-info-v" style="font-size:15px;font-weight:700;color:#ffffff;">'+shinobiStr+'</div>'+
        '<div style="font-size:11px;color:var(--ink-dim);margin-top:2px;">'+shinobiSub+'</div>'+
      '</div>'+
      '<div class="sh-map-info-item">'+
        '<div class="sh-map-info-k">🚶 Пеший шаг (Караван / Эскорт)</div>'+
        '<div class="sh-map-info-v" style="font-size:15px;font-weight:700;color:#ffffff;">'+walkStr+'</div>'+
        '<div style="font-size:11px;color:var(--ink-dim);margin-top:2px;">'+walkSub+'</div>'+
      '</div>'+
      '<div class="sh-map-info-item">'+
        '<div class="sh-map-info-k">🐎 Верховая езда / Курьер</div>'+
        '<div class="sh-map-info-v" style="font-size:15px;font-weight:700;color:#ffffff;">'+horseStr+'</div>'+
        '<div style="font-size:11px;color:var(--ink-dim);margin-top:2px;">'+horseSub+'</div>'+
      '</div>'+
      '<div class="sh-map-info-item" style="border-color:rgba(241,196,15,0.3);">'+
        '<div class="sh-map-info-k" style="color:#f1c40f;">🦅 Почтовый сокол / Птица</div>'+
        '<div class="sh-map-info-v" style="font-size:15px;font-weight:700;color:#ffffff;">'+birdStr+'</div>'+
        '<div style="font-size:11px;color:var(--ink-dim);margin-top:2px;">'+birdSub+'</div>'+
      '</div>'+
    '</div>'+
    logisticsHtml +
    crossedHtml +
    encHtml +
    '<div class="sh-map-inspector-actions" style="margin-top:14px;">'+
      '<button class="btn-primary" id="shBtnRollEncounter">🎲 Бросить D20 события в пути</button>'+
      '<button class="btn-ghost" id="shBtnCopyRoute">📋 Скопировать маршрут в AI Studio</button>'+
      '<button class="sh-map-btn" id="shBtnClearRoute">🗑️ Очистить путь</button>'+
    '</div>'+
  '</div>';
}

var SH_USER_MARKERS_STORAGE_KEY = 'ttc_sh_user_markers';
var SH_MARKER_ICONS = ['📍', '⚔️', '🏯', '⛺', '📦', '💀', '💎', '⛩️', '📜', '⚠️', '🌿', '🌊', '🔥', '⚡', '🎯'];
var SH_MARKER_COLORS = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#d35400', '#1abc9c', '#95a5a6'];

function loadUserMarkers(){
  try{
    var raw = localStorage.getItem(SH_USER_MARKERS_STORAGE_KEY);
    if(raw){
      var list = JSON.parse(raw);
      if(Array.isArray(list)) return list;
    }
  }catch(e){}
  return [];
}

function saveUserMarkers(list){
  try{
    localStorage.setItem(SH_USER_MARKERS_STORAGE_KEY, JSON.stringify(list || []));
  }catch(e){}
  if(typeof SH !== 'undefined' && SH.map){
    SH.map.userMarkers = list || [];
  }
}

function addUserMarker(m){
  var list = loadUserMarkers();
  var newM = {
    id: m.id || ('m_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
    name: (m.name || '').trim() || 'Тактическая метка',
    icon: m.icon || '📍',
    color: m.color || '#e74c3c',
    x: Math.round(Number(m.x) || 0),
    y: Math.round(Number(m.y) || 0),
    notes: (m.notes || '').trim(),
    countryId: m.countryId || null,
    createdAt: m.createdAt || new Date().toISOString()
  };
  list.push(newM);
  saveUserMarkers(list);
  return newM;
}

function updateUserMarker(id, patch){
  var list = loadUserMarkers();
  var found = null;
  for(var i = 0; i < list.length; i++){
    if(list[i].id === id){
      for(var k in patch){
        if(patch.hasOwnProperty(k)) list[i][k] = patch[k];
      }
      found = list[i];
      break;
    }
  }
  if(found) saveUserMarkers(list);
  return found;
}

function deleteUserMarker(id){
  var list = loadUserMarkers();
  var filtered = list.filter(function(m){ return m.id !== id; });
  saveUserMarkers(filtered);
  return filtered;
}

function clearAllUserMarkers(){
  saveUserMarkers([]);
}

function getMarkerById(id){
  var list = (typeof SH !== 'undefined' && SH.map && SH.map.userMarkers) ? SH.map.userMarkers : loadUserMarkers();
  for(var i = 0; i < list.length; i++){
    if(list[i].id === id) return list[i];
  }
  return null;
}

function renderMarkerInspector(marker, markersList, isEditing, placingCoords){
  markersList = markersList || loadUserMarkers();

  // Case 1: Form (Editing or Creating)
  if(isEditing || placingCoords){
    var isNew = !marker || !!placingCoords;
    var mx = isNew ? (placingCoords ? placingCoords.x : 512) : marker.x;
    var my = isNew ? (placingCoords ? placingCoords.y : 341) : marker.y;
    var curC = findCountryAtPoint({ x: mx, y: my }, SH_MAP_DATA);
    var defName = isNew ? (curC ? ('Метка: ' + curC.name) : 'Новая точка') : marker.name;
    var defIcon = isNew ? '📍' : (marker.icon || '📍');
    var defCol = isNew ? '#e74c3c' : (marker.color || '#e74c3c');
    var defNotes = isNew ? '' : (marker.notes || '');
    var mId = isNew ? '' : marker.id;

    var iconPills = SH_MARKER_ICONS.map(function(ic){
      var isAct = (ic === defIcon);
      return '<button type="button" class="sh-marker-icon-btn ' + (isAct ? 'active' : '') + '" data-icon="' + escA(ic) + '" style="font-size:18px;padding:6px 10px;background:rgba(20,16,12,0.8);border:1px solid ' + (isAct ? 'var(--brass,#c5a059)' : 'rgba(197,160,89,0.25)') + ';border-radius:6px;">' + esc(ic) + '</button>';
    }).join(' ');

    var colorPills = SH_MARKER_COLORS.map(function(cl){
      var isAct = (cl === defCol);
      return '<button type="button" class="sh-marker-color-btn ' + (isAct ? 'active' : '') + '" data-color="' + escA(cl) + '" style="width:24px;height:24px;background:' + cl + ';border:2px solid ' + (isAct ? '#ffffff' : 'rgba(0,0,0,0.4)') + ';border-radius:50%;cursor:pointer;" title="' + cl + '"></button>';
    }).join(' ');

    return '<div class="sh-map-inspector" id="shMapInspector">' +
      '<div class="sh-map-inspector-head">' +
        '<div>' +
          '<div class="sh-map-inspector-title">' + (isNew ? '➕ Новая тактическая метка' : '✏️ Редактирование метки') + '</div>' +
          '<div class="sh-map-inspector-sub">Координаты: X ' + mx + ', Y ' + my + (curC ? (' • ' + curC.name) : '') + '</div>' +
        '</div>' +
        '<button class="sh-map-btn" id="shBtnCancelMarker">✕ Отмена</button>' +
      '</div>' +
      '<form id="shMarkerForm" onsubmit="return false;" style="margin-top:12px;display:flex;flex-direction:column;gap:12px;">' +
        '<input type="hidden" id="shMarkerId" value="' + escA(mId) + '">' +
        '<input type="hidden" id="shMarkerX" value="' + mx + '">' +
        '<input type="hidden" id="shMarkerY" value="' + my + '">' +
        '<input type="hidden" id="shMarkerCountry" value="' + escA(curC ? curC.id : '') + '">' +
        '<input type="hidden" id="shMarkerActiveIcon" value="' + escA(defIcon) + '">' +
        '<input type="hidden" id="shMarkerActiveColor" value="' + escA(defCol) + '">' +
        '<div>' +
          '<div class="section-label" style="font-size:12px;margin-bottom:4px;">Название метки:</div>' +
          '<input type="text" id="shMarkerName" class="sh-map-search-input" style="width:100%;font-size:14px;" value="' + escA(defName) + '" placeholder="Например: Застава нукенинов, Скрытый схрон, Стоянка отряда..." required>' +
        '</div>' +
        '<div>' +
          '<div class="section-label" style="font-size:12px;margin-bottom:4px;">Иконка / Тип объекта:</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">' + iconPills + '</div>' +
        '</div>' +
        '<div>' +
          '<div class="section-label" style="font-size:12px;margin-bottom:4px;">Цвет маркера на карте:</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">' + colorPills + '</div>' +
        '</div>' +
        '<div>' +
          '<div class="section-label" style="font-size:12px;margin-bottom:4px;">Заметки Мастера / Сюжет / Детали встречи:</div>' +
          '<textarea id="shMarkerNotes" class="sh-map-search-input" style="width:100%;height:80px;resize:vertical;font-size:13px;line-height:1.5;font-family:inherit;" placeholder="Опишите тайник, стражей, требования к проверкам DC или сюжетную зацепку...">' + esc(defNotes) + '</textarea>' +
        '</div>' +
        '<div class="sh-map-inspector-actions" style="margin-top:4px;">' +
          '<button class="btn-primary" id="shBtnSaveMarker">💾 Сохранить метку</button>' +
          '<button class="btn-ghost" id="shBtnCancelMarker2">Отмена</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  }

  // Case 2: Selected Marker Detail View
  if(marker){
    var curC = marker.countryId ? mapCountryById(marker.countryId) : findCountryAtPoint({ x: marker.x, y: marker.y }, SH_MAP_DATA);
    var dateStr = '';
    try{
      if(marker.createdAt) dateStr = new Date(marker.createdAt).toLocaleDateString('ru-RU');
    }catch(e){}

    return '<div class="sh-map-inspector" id="shMapInspector">' +
      '<div class="sh-map-inspector-head">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<div style="font-size:30px;background:' + (marker.color || '#e74c3c') + ';color:#fff;width:46px;height:46px;border-radius:10px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.5);flex-shrink:0;">' + esc(marker.icon || '📍') + '</div>' +
          '<div>' +
            '<div class="sh-map-inspector-title">' + esc(marker.name) + '</div>' +
            '<div class="sh-map-inspector-sub">' + (curC ? ('Регион: ' + curC.name) : 'Нейтральные земли') + (dateStr ? (' • ' + dateStr) : '') + '</div>' +
          '</div>' +
        '</div>' +
        '<button class="sh-map-btn" id="shBtnBackToMarkersList" title="К общему списку меток">↩️ Все метки</button>' +
      '</div>' +
      '<div class="sh-map-grid-info" style="margin-top:12px;">' +
        '<div class="sh-map-info-item">' +
          '<div class="sh-map-info-k">Координаты на карте</div>' +
          '<div class="sh-map-info-v">X ' + marker.x + ', Y ' + marker.y + '</div>' +
        '</div>' +
        '<div class="sh-map-info-item">' +
          '<div class="sh-map-info-k">Государство / Владения</div>' +
          '<div class="sh-map-info-v" style="color:var(--brass);">' + (curC ? (curC.name + (curC.kanji ? ' (' + curC.kanji + ')' : '')) : 'Нейтральные воды / земли') + '</div>' +
        '</div>' +
      '</div>' +
      (marker.notes ? (
        '<div style="background:rgba(20,16,12,0.8);border:1px solid rgba(197,160,89,0.25);border-radius:8px;padding:12px 14px;margin-top:12px;border-left:3px solid ' + (marker.color || 'var(--brass)') + ';">' +
          '<div class="sh-map-info-k" style="margin-bottom:4px;color:var(--brass);">Заметки и тактический лор:</div>' +
          '<div style="font-size:13px;color:#f5f6fa;line-height:1.6;white-space:pre-wrap;">' + esc(marker.notes) + '</div>' +
        '</div>'
      ) : (
        '<div style="background:rgba(20,16,12,0.4);border:1px dashed rgba(197,160,89,0.2);border-radius:8px;padding:10px 14px;margin-top:12px;font-size:12px;color:var(--ink-dim);">' +
          'Нет заметок. Нажмите «Редактировать», чтобы добавить описание тайника, DC проверок или сюжетную зацепку.' +
        '</div>'
      )) +
      '<div class="sh-map-inspector-actions" style="margin-top:14px;">' +
        '<button class="btn-primary" id="shBtnFocusMarker" data-x="' + marker.x + '" data-y="' + marker.y + '">🎯 Центрировать камеру</button>' +
        '<button class="btn-ghost" id="shBtnRouteToMarker" data-marker-id="' + escA(marker.id) + '">🧭 Проложить маршрут сюда</button>' +
        '<button class="sh-map-btn" id="shBtnEditMarker" data-marker-id="' + escA(marker.id) + '">✏️ Изменить</button>' +
        '<button class="btn-ghost" id="shBtnCopyMarker" data-marker-id="' + escA(marker.id) + '">📋 В AI Studio</button>' +
        '<button class="sh-map-btn" id="shBtnDeleteMarker" data-marker-id="' + escA(marker.id) + '" style="color:#ff7675;">🗑️ Удалить</button>' +
      '</div>' +
    '</div>';
  }

  // Case 3: All Markers Overview List
  var count = markersList.length;
  var cardsHtml = '';
  if(count === 0){
    cardsHtml = '<div style="background:rgba(20,16,12,0.6);border:1px dashed rgba(197,160,89,0.3);border-radius:8px;padding:24px;text-align:center;margin-top:14px;">' +
      '<div style="font-size:32px;margin-bottom:8px;">📍</div>' +
      '<div style="font-size:15px;font-weight:700;color:var(--brass,#c5a059);margin-bottom:6px;">У вас пока нет тактических меток</div>' +
      '<div style="font-size:12.5px;color:var(--ink-dim);max-width:480px;margin:0 auto 14px;">' +
        'Создавайте собственные ориентиры: временные лагеря, тайники с оружием, засады нукенинов, зоны поиска или места выполнения миссий ранга S.' +
      '</div>' +
      '<button class="btn-primary" id="shBtnStartPlacingMarker">➕ Поставить первую метку</button>' +
    '</div>';
  } else {
    cardsHtml = '<div class="sh-marker-list-grid">' +
      markersList.map(function(m){
        var c = m.countryId ? mapCountryById(m.countryId) : findCountryAtPoint({ x: m.x, y: m.y }, SH_MAP_DATA);
        var notesSnippet = m.notes ? (m.notes.length > 55 ? (m.notes.substr(0, 55) + '…') : m.notes) : '';
        return '<div class="sh-marker-item-card" data-inspect-marker="' + escA(m.id) + '">' +
          '<div style="font-size:20px;background:' + (m.color || '#e74c3c') + ';color:#fff;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + esc(m.icon || '📍') + '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:13.5px;font-weight:700;color:#f5f6fa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(m.name) + '</div>' +
            '<div style="font-size:11px;color:var(--brass,#c5a059);">' + (c ? esc(c.name) : ('X ' + m.x + ', Y ' + m.y)) + '</div>' +
            (notesSnippet ? ('<div style="font-size:11px;color:var(--ink-dim);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(notesSnippet) + '</div>') : '') +
          '</div>' +
          '<button type="button" class="sh-map-btn" data-delete-marker-quick="' + escA(m.id) + '" style="font-size:11px;padding:3px 6px;color:#ff7675;" title="Удалить метку">✕</button>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  return '<div class="sh-map-inspector" id="shMapInspector">' +
    '<div class="sh-map-inspector-head">' +
      '<div>' +
        '<div class="sh-map-inspector-title">📍 Пользовательские метки и тайники (' + count + ')</div>' +
        '<div class="sh-map-inspector-sub">Индивидуальные маркеры, базы, засады и артефакты шиноби (сохраняются локально)</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px;">' +
        '<button class="btn-primary" id="shBtnStartPlacingMarker">➕ Поставить метку</button>' +
        (count > 0 ? '<button class="sh-map-btn" id="shBtnClearAllMarkers" style="color:#ff7675;">🗑️ Очистить все</button>' : '') +
      '</div>' +
    '</div>' +
    cardsHtml +
  '</div>';
}

/* =========================================================================
   SHINOBI MISSION BOARD ENGINE & PROCEDURAL GENERATOR
   ========================================================================= */

var SH_MISSIONS_STORAGE_KEY = 'ttc_sh_missions';
var SH_GEMINI_API_KEY_STORAGE = 'ttc_gemini_api_key';

var SH_MISSION_RANKS = {
  D: { label: 'D-ранг', name: 'Генины', level: '1–4 ур.', ryoMin: 5000, ryoMax: 50000, color: '#2ecc71', dcMin: 10, dcMax: 12, scope: 'local' },
  C: { label: 'C-ранг', name: 'Тюнины', level: '3–6 ур.', ryoMin: 30000, ryoMax: 100000, color: '#3498db', dcMin: 12, dcMax: 14, scope: 'neighbor' },
  B: { label: 'B-ранг', name: 'Тюнины / Дзёнины', level: '7–10 ур.', ryoMin: 80000, ryoMax: 200000, color: '#f1c40f', dcMin: 14, dcMax: 16, scope: 'buffer' },
  A: { label: 'A-ранг', name: 'Элитные дзёнины / АНБУ', level: '11–15 ур.', ryoMin: 150000, ryoMax: 1000000, color: '#e67e22', dcMin: 16, dcMax: 18, scope: 'hostile' },
  S: { label: 'S-ранг', name: 'Каге / Легенды', level: '16–20 ур.', ryoMin: 1000000, ryoMax: 5000000, color: '#e74c3c', dcMin: 18, dcMax: 22, scope: 'global' }
};

var SH_MISSION_CLIENTS = [
  { name: 'Тадзуна', title: 'Главный мостостроитель и плотник', role: 'civilian' },
  { name: 'Мадам Сидзими', title: 'Супруга феодала Страны Огня', role: 'noble' },
  { name: 'Старейшина монастыря Хи но Тера', title: 'Хранитель реликвий Монахов Огня', role: 'monk' },
  { name: 'Гильдия купцов Шелкового Тракта', title: 'Караванный синдикат Фукуро', role: 'merchant' },
  { name: 'Шифровальный отдел АНБУ', title: 'Секретная служба резиденции Каге', role: 'anbu' },
  { name: 'Главный лекарь госпиталя', title: 'Отдел боевой полевой медицины', role: 'medic' },
  { name: 'Комендант пограничного форпоста', title: 'Оборонительный гарнизон границы', role: 'military' },
  { name: 'Оружейный мастер Тен-Тен', title: 'Кузница свитков и ниндзюцу-снаряжения', role: 'smith' },
  { name: 'Даймё Страны Чая', title: 'Организационный комитет гонок Тодороки', role: 'noble' },
  { name: 'Горнодобывающий синдикат', title: 'Артель плавильщиков чакро-стали', role: 'worker' },
  { name: 'Беглый исследователь лабораторий', title: 'Бывший ассистент Орочимару', role: 'rogue' },
  { name: 'Семья рыбаков прибрежного залива', title: 'Союз лодочников Страны Моря', role: 'civilian' },
  { name: 'Странствующий театр марионеток', title: 'Труппа иллюзионистов и кукловодов', role: 'artist' },
  { name: 'Посольство Альянса Шиноби', title: 'Комитет мирного урегулирования', role: 'diplomat' },
  { name: 'Хранитель архивов Запретных Свитков', title: 'Совет старейшин Деревни', role: 'elder' },
  { name: 'Министр финансов Даймё', title: 'Казначейство верховного двора феодала', role: 'noble' },
  { name: 'Главный управляющий горячих источников', title: 'Курортный синдикат пара Югакуре', role: 'merchant' },
  { name: 'Настоятель Храма Трех Лун', title: 'Орден странствующих монахов-аскетов', role: 'monk' },
  { name: 'Подпольный брокер черного рынка', title: 'Информатор теневой биржи наемников', role: 'rogue' },
  { name: 'Глава исследовательского корпуса трав', title: 'Академия редких ядов и антидотов', role: 'medic' },
  { name: 'Мастер оружейной гильдии Железа', title: 'Кузница чакропроводящих клинков', role: 'smith' },
  { name: 'Капитан речного дозора', title: 'Флотилия внутренних водных трактов', role: 'military' },
  { name: 'Смотритель спецхранилища АНБУ Не', title: 'Бывший архивариус Корня', role: 'anbu' },
  { name: 'Старейшина гильдии охотников за головами', title: 'Регистратор Книги Бинго', role: 'elder' },
  { name: 'Главный инженер акведуков', title: 'Департамент ирригации и плотин', role: 'worker' },
  { name: 'Придворный астролог и картограф', title: 'Обсерватория небесных аномалий чакры', role: 'scholar' }
];

var SH_MISSION_OBJECTIVES = [
  // --- Ранг D (Минимум 11 каноничных заданий) ---
  { title: 'Поиск и поимка сбежавшего элитного ниндзя-питомца (кота Торы)', ranks: ['D'], type: 'fetch' },
  { title: 'Сбор редких целебных трав и минералов чакры в ущелье', ranks: ['D'], type: 'gather' },
  { title: 'Охрана и инвентаризация склада учебного снаряжения и печатей', ranks: ['D'], type: 'guard' },
  { title: 'Прополка лекарственных плантаций клана Нара и отлов вредителей', ranks: ['D'], type: 'labor' },
  { title: 'Очистка речных каналов деревни от подводных завалов и мусора', ranks: ['D'], type: 'labor' },
  { title: 'Помощь Академии ниндзя в подготовке учебного полигона и мишеней', ranks: ['D'], type: 'assist' },
  { title: 'Поиск пропавшего фамильного свитка в катакомбах под библиотекой', ranks: ['D'], type: 'search' },
  { title: 'Сопровождение детей зажиточного купца до школы через оживленный рынок', ranks: ['D'], type: 'escort' },
  { title: 'Доставка срочной депеши в отдаленный дозорный пост без использования ниндзюцу', ranks: ['D'], type: 'courier' },
  { title: 'Уборка и укрепление тренировочных манекенов на полигоне №44 (Лес Смерти)', ranks: ['D'], type: 'labor' },
  { title: 'Помощь дежурным шиноби в сортировке почтовых птиц и проверка печатей связи', ranks: ['D'], type: 'assist' },

  // --- Ранг C (Минимум 11 каноничных заданий) ---
  { title: 'Эскорт каравана торговцев с ценным сырьем через опасные тракты', ranks: ['C'], type: 'escort' },
  { title: 'Ликвидация банды разбойников и ронинов в приграничной зоне', ranks: ['C'], type: 'combat' },
  { title: 'Перехват секретного запечатанного курьерского свитка на переправе', ranks: ['C'], type: 'intercept' },
  { title: 'Расследование искажений чакры и ядовитых испарений в низинах', ranks: ['C'], type: 'investigate' },
  { title: 'Охрана главного мостостроителя на возведении стратегической переправы', ranks: ['C'], type: 'guard' },
  { title: 'Уничтожение гнезда гигантских диких кабанов-мутантов на фермерских угодьях', ranks: ['C'], type: 'hunt' },
  { title: 'Обезвреживание скрытых растяжек и взрывных ловушек на тропе контрабандистов', ranks: ['C'], type: 'defuse' },
  { title: 'Эскорт высокопоставленного чиновника на ежегодный дипломатический фестиваль', ranks: ['C'], type: 'escort' },
  { title: 'Патрулирование торгового тракта и защита постоялых дворов от вымогателей', ranks: ['C'], type: 'patrol' },
  { title: 'Возврат похищенных торговых векселей из укрепленного лагеря наемников', ranks: ['C'], type: 'recovery' },
  { title: 'Поиск и эвакуация заблудившейся группы геологов в туманном каньоне', ranks: ['C'], type: 'rescue' },

  // --- Ранг B (Минимум 11 каноничных заданий) ---
  { title: 'Охота на опасного нукенина ранга B и возврат похищенной печати', ranks: ['B'], type: 'hunt' },
  { title: 'Шпионаж и разведка укреплений вражеской тайной заставы', ranks: ['B'], type: 'recon' },
  { title: 'Спасение похищенного сенсора деревни до применения гендзюцу допроса', ranks: ['B'], type: 'rescue' },
  { title: 'Нейтрализация банды дезертиров-шиноби, использующих краденое чакро-оружие', ranks: ['B'], type: 'combat' },
  { title: 'Защита дипломатической делегации от засады отряда заказных наемников', ranks: ['B'], type: 'guard' },
  { title: 'Уничтожение подпольного цеха по производству боевых стимуляторов чакры', ranks: ['B'], type: 'sabotage' },
  { title: 'Перехват речного военного конвоя с нелегальными свитками взрывных печатей', ranks: ['B'], type: 'intercept' },
  { title: 'Проникновение на закрытый аукцион черного рынка и изъятие реликвии клана', ranks: ['B'], type: 'infiltration' },
  { title: 'Устранение группы мятежных самураев-изгнанников, блокирующих горный перевал', ranks: ['B'], type: 'combat' },
  { title: 'Охрана ключевого свидетеля перед военным трибуналом скрытых деревень', ranks: ['B'], type: 'protection' },
  { title: 'Подавление взбунтовавшегося отряда боевых марионеточников в катакомбах', ranks: ['B'], type: 'combat' },

  // --- Ранг A (Минимум 11 каноничных заданий) ---
  { title: 'Обезвреживание барьера фуиндзюцу ранга A и предотвращение взрыва', ranks: ['A'], type: 'defuse' },
  { title: 'Ликвидация логова гигантского древнего призывного зверя-людоеда', ranks: ['A'], type: 'boss' },
  { title: 'Контрразведка и нейтрализация диверсионного отряда АНБУ соперников', ranks: ['A'], type: 'stealth' },
  { title: 'Предотвращение саботажа на главной акведук-дамбе великой державы', ranks: ['A'], type: 'crisis' },
  { title: 'Охота на элитного джонина-отступника ранга A из Книги Бинго', ranks: ['A'], type: 'hunt' },
  { title: 'Штурм замаскированного полевого исследовательского бункера Орочимару', ranks: ['A'], type: 'assault' },
  { title: 'Спасение захваченного советника Даймё из охраняемой цитадели мятежников', ranks: ['A'], type: 'rescue' },
  { title: 'Охрана джинчурики во время тайного ритуала стабилизации печати хвостатого', ranks: ['A'], type: 'ritual_guard' },
  { title: 'Уничтожение арсенала запретного химико-биологического оружия в рудниках', ranks: ['A'], type: 'sabotage' },
  { title: 'Пресечение государственного переворота во влиятельном вассальном клане', ranks: ['A'], type: 'crisis' },
  { title: 'Глубокая диверсия в тылу врага: уничтожение стратегического склада снабжения', ranks: ['A'], type: 'covert' },

  // --- Ранг S (Минимум 11 каноничных заданий) ---
  { title: 'Расследование следов члена Акацуки и сбор образцов запретной чакры', ranks: ['S'], type: 'legendary' },
  { title: 'Охота на легендарного нукенина S-ранга из Книги Бинго и изъятие украденного додзюцу', ranks: ['S'], type: 'hunt' },
  { title: 'Предотвращение пробуждения древнего запечатанного бедствия-биджу в катакомбах', ranks: ['S'], type: 'seal' },
  { title: 'Нейтрализация запретного ритуала Нечестивого Воскрешения (Эдо Тенсей)', ranks: ['S'], type: 'exorcism' },
  { title: 'Спасение Каге или его законного наследника при внезапном покушении', ranks: ['S'], type: 'vip_defense' },
  { title: 'Уничтожение тайной базы по созданию искусственных псевдо-джинчурики', ranks: ['S'], type: 'destruction' },
  { title: 'Возврат похищенного Свитка Запретных Печатей Первого Хокаге', ranks: ['S'], type: 'recovery' },
  { title: 'Предотвращение тотальной войны между Великими Деревнями, спровоцированной шпионами', ranks: ['S'], type: 'diplomatic_crisis' },
  { title: 'Отражение скрытого вторжения отряда бессмертных шиноби в сердце резиденции', ranks: ['S'], type: 'defense' },
  { title: 'Ликвидация пространственно-временного разрыва барьера печатей древней эры', ranks: ['S'], type: 'anomaly' },
  { title: 'Раскрытие и ликвидация теневой ложи заговорщиков в высшем совете Альянса', ranks: ['S'], type: 'conspiracy' }
];

var SH_MISSION_TWISTS = [
  'Заказчик скрыл, что в грузе находится живой образец запретного эксперимента с ДНК Первого Хокаге.',
  'В отряде сопровождения скрывается шпион под техникой Хенге (DC 14 Проницательность для раскрытия).',
  'На обратном пути главный мост будет разрушен засадой мечников с техниками Водного Стиля.',
  'Цель миссии является ложной приманкой: настоящий противник следит за партией из крон деревьев.',
  'В точке назначения активируется запечатывающий барьер, временно блокирующий техники связи и призыва.',
  'Заказчик не сможет выплатить всю сумму монетами, но предложит древний свиток запретного тайдзюцу.',
  'У объекта уже действует отряд конкурирующей скрытой деревни с диаметрально противоположным приказом.',
  'Сбежавший нукенин в действительности является глубоко законспирированным агентом нашей деревни.',
  'Стихийная аномалия: буря чакры удваивает дистанцию и урон любых техник Стихии Ветра.',
  'Вражеский командир использует токсичные сенбоны с ядом саламандры (DC 14 Спасбросок Телосложения).',
  'Подземные туннели заминированы серией из 30 взрывных печатей замедленного действия.',
  'Заказчик оказался двойным агентом, проверяющим боевую слаженность и бдительность отряда.',
  'Внезапное появление неопознанного силуэта в черном плаще с красными облаками, наблюдающего издали.',
  'Реликвия проклята печатью: несущий её шиноби расходует на 1 единицу чакры больше за каждую технику.',
  'Похитители на самом деле спасали заложника от тирании заказчика (моральная дилемма для партии).',
  'Один из ключевых врагов владеет редким улучшенным геномом (Кеккей Генкай) Стихии Лавы или Льда.',
  'Местность затянута чакро-подавляющим туманом Киригакуре (помеха на проверки Внимательности и дистанционные атаки).',
  'Заказчик находится под скрытым воздействием марионеточного гендзюцу и не контролирует свои указания.',
  'Один из охраняемых союзников внезапно проявляет признаки пробуждения проклятой печати Джуина.',
  'Во время миссии начинается солнечное затмение, многократно усиливающее техники Тьмы (клан Кураями) и Инь.',
  'В свитке запечатан не текст, а взрывная глина отступников Ивы с часовым детонатором.',
  'Вражеский отряд оснащен прототипами поглотителей чакры, снижающими урон от ниндзюцу.',
  'На поле боя случайно вскрывается запечатанная гробница эпохи Воюющих Кланов со скрижалью Учиха или Сенджу.',
  'Отряд перехватывает элитный патруль Самураев Страны Железа, требующий немедленно покинуть нейтральную землю.',
  'Награда за голову вражеского лидера в Книге Бинго была тайно удвоена другим синдикатом.',
  'Один из союзников на самом деле является теневым клоном (Каге Буншин), чакра которого вот-вот развеется.'
];

function getGeminiApiKey(){
  try{
    return localStorage.getItem('ttc_gemini_api_key') || localStorage.getItem('gemini_api_key') || '';
  }catch(e){}
  return '';
}
window.getGeminiApiKey = getGeminiApiKey;

function saveGeminiApiKey(key){
  try{
    var trimmed = (key || '').trim();
    if(trimmed){
      localStorage.setItem('ttc_gemini_api_key', trimmed);
      localStorage.setItem('gemini_api_key', trimmed);
    } else {
      localStorage.removeItem('ttc_gemini_api_key');
      localStorage.removeItem('gemini_api_key');
    }
  }catch(e){}
}
window.saveGeminiApiKey = saveGeminiApiKey;

function requestGeminiGenerateContent(prompt, apiKey, callback){
  if(!apiKey){
    callback(new Error("API ключ не указан"), null);
    return;
  }
  var model = 'gemini-3.8-flash';
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + encodeURIComponent(apiKey);
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, responseMimeType: "application/json" }
    })
  }).then(function(res){
    if(!res.ok){
      throw new Error('HTTP ' + res.status);
    }
    return res.json().then(function(data){
      callback(null, data);
    });
  }).catch(function(err){
    callback(err, null);
  });
}
window.requestGeminiGenerateContent = requestGeminiGenerateContent;

function extractJsonFromAi(data){
  if(!data) throw new Error("Пустой ответ от AI");
  var rawTxt = '';
  if(data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]){
    rawTxt = data.candidates[0].content.parts[0].text || '';
  } else if(typeof data === 'string'){
    rawTxt = data;
  }
  var clean = rawTxt.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  try{
    return JSON.parse(clean);
  }catch(e){
    var firstOpen = clean.indexOf('{');
    var lastClose = clean.lastIndexOf('}');
    if(firstOpen !== -1 && lastClose > firstOpen){
      return JSON.parse(clean.substring(firstOpen, lastClose + 1));
    }
    throw e;
  }
}
window.extractJsonFromAi = extractJsonFromAi;

function loadMissions(){
  try{
    var raw = localStorage.getItem(SH_MISSIONS_STORAGE_KEY);
    if(raw){
      var list = JSON.parse(raw);
      if(Array.isArray(list) && list.length > 0) return list;
    }
  }catch(e){}
  return seedDefaultMissions();
}

function saveMissions(list){
  try{
    localStorage.setItem(SH_MISSIONS_STORAGE_KEY, JSON.stringify(list || []));
  }catch(e){}
  if(typeof SH !== 'undefined' && SH.map){
    SH.map.missions = list || [];
  }
}

function seedDefaultMissions(){
  var defaults = [
    {
      id: 'mis_init_1',
      rank: 'D',
      title: 'Поимка сбежавшего питомца Торы',
      client: { name: 'Мадам Сидзими', title: 'Супруга феодала Страны Огня' },
      originCountryId: 'fire',
      originVillage: 'Конохагакуре',
      targetCountryId: 'fire',
      targetName: 'Поместье Даймё (Страна Огня)',
      targetCoords: { x: 575, y: 350 },
      desc: 'Коричневый кот с ленточкой на правом ухе сбежал из покоев и скрывается в лесных зарослях. Действовать осторожно, не повредив шерсть животного.',
      objectives: ['Найти следы кота в кленовой роще', 'DC 11 Ловкость рук: поймать зверя без когтей'],
      checks: ['DC 11 Внимательность', 'DC 11 Ловкость (Акробатика)'],
      rewardRyo: 15000,
      partyLevel: '1–4 уровень',
      dmSpoiler: 'Кот невероятно проворен и прыгает по веткам не хуже генина. Если партия задержится, кот разбудит дикого кабана.',
      status: 'available',
      aiGenerated: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'mis_init_2',
      rank: 'C',
      title: 'Эскорт строителей моста в Страну Волн',
      client: { name: 'Тадзуна', title: 'Главный мостостроитель' },
      originCountryId: 'fire',
      originVillage: 'Конохагакуре',
      targetCountryId: 'waves',
      targetName: 'Великий мост Наруто (Страна Волн)',
      targetCoords: { x: 667, y: 368 },
      desc: 'Охрана престарелого инженера на обратном пути в Страну Волн. Заказчик заявляет, что опасность исходит только от обычных карманников.',
      objectives: ['Безопасный переход через границу Огня и побережье', 'Охрана строительной площадки на острове'],
      checks: ['DC 13 Внимательность (засада)', 'DC 12 Проницательность (ложь клиента)'],
      rewardRyo: 65000,
      partyLevel: '3–6 уровень',
      dmSpoiler: 'Тадзуна скрыл преследование со стороны монополии Гато и наемных шиноби Тумана (братья-демоны). Истинный ранг миссии — B.',
      status: 'available',
      aiGenerated: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'mis_init_3',
      rank: 'B',
      title: 'Перехват связных в Стране Дождя',
      client: { name: 'Шифровальный отдел АНБУ', title: 'Секретная служба Листа' },
      originCountryId: 'fire',
      originVillage: 'Конохагакуре',
      targetCountryId: 'rain',
      targetName: 'Амегакуре (Скрытый Дождь)',
      targetCoords: { x: 520, y: 291 },
      desc: 'Курьер отступников несет зашифрованный свиток через речные границы Амегакуре. Требуется скрытное проникновение и перехват без развязывания открытой войны.',
      objectives: ['Скрытное форсирование болот в вечном ливне', 'Нейтрализация курьера и изъятие свитка до передачи связному'],
      checks: ['DC 15 Скрытность', 'DC 14 Анализ (дешифровка свитка)'],
      rewardRyo: 160000,
      partyLevel: '7–10 уровень',
      dmSpoiler: 'Дождь падает с примесью чужой сенсорной чакры (техника Укодзайхо но Дзюцу). Любая масштабная техника раскрывает позицию отряда.',
      status: 'available',
      aiGenerated: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'mis_init_4',
      rank: 'A',
      title: 'Ликвидация подпольной лаборатории Звука',
      client: { name: 'Комендант пограничного форпоста', title: 'Гарнизон границы' },
      originCountryId: 'fire',
      originVillage: 'Конохагакуре',
      targetCountryId: 'sound',
      targetName: 'Северное убежище Звука (Ото)',
      targetCoords: { x: 580, y: 250 },
      desc: 'Обнаружен замаскированный бункер, где проводятся запретные эксперименты с Джуином (Проклятой Печатью). Зачистить охрану и спасти пленников.',
      objectives: ['Взлом барьера запечатывания лаборатории', 'Устранение коменданта с Проклятой Печатью 2-й стадии'],
      checks: ['DC 16 Магия/Фуиндзюцу (снятие барьера)', 'DC 17 Спасбросок Телосложения против звуковых волн'],
      rewardRyo: 420000,
      partyLevel: '11–15 уровень',
      dmSpoiler: 'Лаборатория снабжена механизмом самоуничтожения (таймер на 3 раунда боя после поражения босса).',
      status: 'available',
      aiGenerated: false,
      createdAt: new Date().toISOString()
    }
  ];
  saveMissions(defaults);
  return defaults;
}

function getVillagePoint(cid){
  var c = mapCountryById(cid) || mapCountryById('fire') || SH_MAP_DATA[0];
  if(c && c.village && typeof c.village.x === 'number'){
    return { name: c.village.name || c.name, x: c.village.x, y: c.village.y, countryId: c.id };
  }
  if(c && c.labelPoint && typeof c.labelPoint.x === 'number'){
    return { name: c.name, x: c.labelPoint.x, y: c.labelPoint.y, countryId: c.id };
  }
  return { name: 'Конохагакуре', x: 599, y: 306, countryId: 'fire' };
}

function pickMissionTargetCountry(rank, originCid){
  originCid = optsOriginId(originCid);
  if(rank === 'D'){
    return originCid;
  }
  var originPt = getVillagePoint(originCid);
  var list = (typeof SH_MAP_DATA !== 'undefined' && Array.isArray(SH_MAP_DATA)) ? SH_MAP_DATA : [];
  if(!list.length) return (originCid === 'fire' ? 'wind' : 'fire');

  var withDist = list.filter(function(c){ return c.id !== originCid; }).map(function(c){
    var pt = (c.village && typeof c.village.x === 'number') ? c.village : (c.labelPoint || {x:512,y:341});
    var d = Math.hypot(pt.x - originPt.x, pt.y - originPt.y);
    return { id: c.id, dist: d, danger: c.danger || '', type: c.type };
  }).sort(function(a,b){ return a.dist - b.dist; });

  var candidates = [];
  if(rank === 'C'){
    candidates = withDist.slice(0, 7);
  } else if(rank === 'B'){
    candidates = withDist.slice(3, 16);
  } else if(rank === 'A'){
    var far = withDist.slice(8, 28);
    var dangerous = withDist.filter(function(c){ return c.danger && (c.danger.indexOf('Высок') !== -1 || c.danger.indexOf('Критич') !== -1); });
    candidates = far.concat(dangerous);
  } else if(rank === 'S'){
    var dangerousOrFar = withDist.filter(function(c){
      return c.dist > 250 || (c.danger && (c.danger.indexOf('Критич') !== -1 || c.danger.indexOf('Высок') !== -1)) || c.id === 'myoboku' || c.id === 'mount_koryu' || c.id === 'sound' || c.id === 'rain' || c.id === 'terra_incognita';
    });
    candidates = dangerousOrFar.length ? dangerousOrFar : withDist.slice(15);
  }
  if(!candidates.length) candidates = withDist;
  var chosen = candidates[Math.floor(Math.random() * candidates.length)];
  return chosen ? chosen.id : (originCid === 'fire' ? 'wind' : 'fire');
}

function optsOriginId(optsOrCid){
  if(!optsOrCid) return 'fire';
  if(typeof optsOrCid === 'string') return optsOrCid;
  return optsOrCid.originCountryId || optsOrCid.originCid || 'fire';
}

function generateProceduralMission(opts){
  opts = opts || {};
  var ranks = ['D', 'C', 'B', 'A', 'S'];
  var rank = (opts.rank && SH_MISSION_RANKS[opts.rank]) ? opts.rank : ranks[Math.floor(Math.random() * ranks.length)];
  var rConf = SH_MISSION_RANKS[rank];

  var originCid = optsOriginId(opts);
  var originVillageObj = getVillagePoint(originCid);
  var originCountry = mapCountryById(originCid);
  var originName = originVillageObj.name || (originCountry ? originCountry.name : 'Резиденция');
  var originCountryName = originCountry ? originCountry.name : '';

  var targetCid = pickMissionTargetCountry(rank, originCid);
  var targetC = mapCountryById(targetCid) || mapCountryById(originCid);
  var targetPointObj = getVillagePoint(targetCid);

  var client = SH_MISSION_CLIENTS[Math.floor(Math.random() * SH_MISSION_CLIENTS.length)];

  var eligibleObjs = SH_MISSION_OBJECTIVES.filter(function(o){ return o.ranks.indexOf(rank) !== -1; });
  if(!eligibleObjs.length) eligibleObjs = SH_MISSION_OBJECTIVES;
  var objTemplate = eligibleObjs[Math.floor(Math.random() * eligibleObjs.length)];

  var twist = SH_MISSION_TWISTS[Math.floor(Math.random() * SH_MISSION_TWISTS.length)];

  var ryoSpread = rConf.ryoMax - rConf.ryoMin;
  var ryo = rConf.ryoMin + Math.round((Math.random() * ryoSpread) / 5000) * 5000;

  var checkDc1 = rConf.dcMin + Math.floor(Math.random() * (rConf.dcMax - rConf.dcMin + 1));
  var checkDc2 = rConf.dcMin + Math.floor(Math.random() * (rConf.dcMax - rConf.dcMin + 1));
  var skills = [
    'Внимательность', 'Выживание', 'Проницательность', 'Скрытность',
    'Атлетика', 'Контроль чакры', 'Расследование', 'Акробатика',
    'Обман', 'Медицина', 'Магия/Фуиндзюцу', 'История шиноби',
    'Запугивание', 'Ловкость рук', 'Природоведение'
  ];
  var s1 = skills[Math.floor(Math.random() * skills.length)];
  var s2 = skills[Math.floor(Math.random() * skills.length)];
  if(s1 === s2) s2 = 'Контроль чакры';

  var title = '';
  var desc = '';
  var objectives = [];

  if(rank === 'D'){
    title = objTemplate.title + ' (' + originName + ')';
    desc = 'Внутренний контракт ранга D выдан в селении ' + originName + ' (' + originCountryName + '). ' +
      'Заказчик: ' + client.name + ' (' + client.title + '). ' +
      'Партии поручено локальное задание без выезда за пределы границ.';
    objectives = [
      'Выполнение поручения в черте ' + originName,
      'DC ' + checkDc1 + ' ' + s1 + ': проверка навыков и внимательности',
      'Сдача отчёта заказчику в ' + originName
    ];
  } else {
    title = objTemplate.title + ' (' + targetC.name + ')';
    desc = 'Миссия ранга ' + rank + ' выдана в резиденции ' + originName + ' (' + originCountryName + '). ' +
      'Заказчик: ' + client.name + ' (' + client.title + '). ' +
      'Партии необходимо выдвинуться из ' + originName + ' в сектор [' + targetC.name + '] и обеспечить выполнение директивы шиноби.';
    objectives = [
      'Переход из ' + originName + ' в ' + targetC.name + ' и разведка ориентиров на месте',
      'DC ' + checkDc1 + ' ' + s1 + ': обнаружение зацепок или уклонение от засады',
      'Завершение директивы и доклад в резиденцию (' + originName + ')'
    ];
  }

  return {
    id: 'mis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    rank: rank,
    title: title,
    client: client,
    originCountryId: originCid,
    originVillage: originName,
    targetCountryId: targetC.id,
    targetName: (targetC.village ? targetC.village.name : targetC.name) + ' (' + targetC.name + ')',
    targetCoords: { x: targetPointObj.x, y: targetPointObj.y },
    desc: desc,
    objectives: objectives,
    checks: ['DC ' + checkDc1 + ' ' + s1, 'DC ' + checkDc2 + ' ' + s2],
    rewardRyo: ryo,
    partyLevel: rConf.level,
    dmSpoiler: twist,
    status: 'available',
    aiGenerated: false,
    createdAt: new Date().toISOString()
  };
}

function callGeminiMissionGenerator(opts, apiKey, callback){
  opts = opts || {};
  var originCid = optsOriginId(opts);
  var fallback = generateProceduralMission(opts);
  if(!apiKey){
    callback(null, fallback);
    return;
  }

  var originObj = getVillagePoint(originCid);
  var originCountry = mapCountryById(originCid);
  var originName = originObj.name || (originCountry ? originCountry.name : 'Резиденция');
  var originCountryName = originCountry ? originCountry.name : '';
  var targetC = mapCountryById(fallback.targetCountryId) || originCountry || { name: 'Земли шиноби' };
  var targetName = targetC.village ? (targetC.village.name + ' [' + targetC.name + ']') : targetC.name;

  var rank = opts.rank || 'C';
  var prompt = "Ты профессиональный Dungeon Master по настольной ролевой игре D&D 2024 в сеттинге Naruto / Мир шиноби.\n" +
    "Сгенерируй авторскую миссию ранга " + rank + " для отряда шиноби.\n" +
    "- Точка старта / резиденция найма: " + originName + " (" + originCountryName + "). Заказчик находится именно здесь.\n" +
    (rank === 'D' 
      ? "- Место действия: Локально в пределах " + originName + " (" + originCountryName + "). Это небоевое бытовое или патрульное поручение.\n" 
      : "- Целевой регион назначения: " + targetName + ". Партия должна отправиться в путь из " + originName + ".\n") +
    "- Специфика задания, личность заказчика, атмосфера и опасности должны строго соответствовать культуре, климату и геополитике " + originCountryName + " и маршруту.\n" +
    "Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без каких-либо вводных слов или markdown обрамления, со следующими полями:\n" +
    "{\n" +
    '  "title": "Краткое эпичное название миссии",\n' +
    '  "clientName": "Имя заказчика",\n' +
    '  "clientTitle": "Титул/профессия заказчика",\n' +
    '  "desc": "Художественное описание ситуации и вводной задачи (2-3 предложения)",\n' +
    '  "objectives": ["Пункт 1", "Пункт 2", "Пункт 3"],\n' +
    '  "checks": ["DC 13 Внимательность", "DC 14 Контроль чакры"],\n' +
    '  "rewardRyo": ' + fallback.rewardRyo + ',\n' +
    '  "twist": "Неожиданный поворот событий и скрытый секрет для Мастера",\n' +
    '  "dialogue": "Короткая прямая речь заказчика при выдаче миссии в резиденции ' + originName + '",\n' +
    '  "combat": "Кто оппонент партии и его главная тактическая уловка"\n' +
    "}";

  requestGeminiGenerateContent(prompt, apiKey, function(err, data){
    if(err || !data){
      callback(err, fallback);
      return;
    }
    try{
      var parsed = extractJsonFromAi(data);
      fallback.title = parsed.title || fallback.title;
      if(parsed.clientName) fallback.client = { name: parsed.clientName, title: parsed.clientTitle || 'Заказчик' };
      if(parsed.desc) fallback.desc = parsed.desc;
      if(Array.isArray(parsed.objectives)) fallback.objectives = parsed.objectives;
      if(Array.isArray(parsed.checks)) fallback.checks = parsed.checks;
      if(parsed.rewardRyo) fallback.rewardRyo = Number(parsed.rewardRyo) || fallback.rewardRyo;
      if(parsed.twist) fallback.dmSpoiler = parsed.twist;
      if(parsed.dialogue) fallback.aiDialogue = parsed.dialogue;
      if(parsed.combat) fallback.aiCombat = parsed.combat;
      fallback.aiGenerated = true;
      callback(null, fallback);
    }catch(err2){
      callback(null, fallback);
    }
  });
}

function renderMissionBoard(missionsList, activeFilter, originCid, showApiBox){
  missionsList = missionsList || loadMissions();
  activeFilter = activeFilter || 'all';
  originCid = originCid || 'fire';

  var originC = mapCountryById(originCid) || SH_MAP_DATA[0];
  var originVillageName = (originC && originC.village) ? originC.village.name : (originC ? originC.name : 'Конохагакуре');

  var filtered = missionsList.filter(function(m){
    if(activeFilter !== 'all' && m.rank !== activeFilter) return false;
    return true;
  });

  var apiKey = getGeminiApiKey();
  var hasKey = !!apiKey;

  var rankTabs = [
    { k: 'all', l: 'Все (' + missionsList.length + ')' },
    { k: 'D', l: 'D-ранг' },
    { k: 'C', l: 'C-ранг' },
    { k: 'B', l: 'B-ранг' },
    { k: 'A', l: 'A-ранг' },
    { k: 'S', l: 'S-ранг' }
  ];

  var tabsHtml = '<div class="sh-filter-bar" style="margin:8px 0 12px;">' +
    rankTabs.map(function(t){
      var isAct = (t.k === activeFilter);
      return '<div class="sh-filter-pill ' + (isAct ? 'active' : '') + '" data-mission-filter="' + t.k + '">' + esc(t.l) + '</div>';
    }).join('') +
  '</div>';

  var apiBoxHtml = '';

  var missionsCardsHtml = '';
  if(!filtered.length){
    missionsCardsHtml = '<div style="background:rgba(20,16,12,0.6);border:1px dashed rgba(197,160,89,0.3);border-radius:8px;padding:28px;text-align:center;grid-column:1/-1;">' +
      '<div style="font-size:32px;margin-bottom:8px;">📜</div>' +
      '<div style="font-size:15px;font-weight:700;color:var(--brass,#c5a059);margin-bottom:4px;">Нет доступных миссий для ранга ' + esc(activeFilter) + '</div>' +
      '<div style="font-size:12.5px;color:var(--ink-dim);margin-bottom:12px;">Нажмите кнопку генерации, чтобы совет старейшин сформировал новое задание.</div>' +
      '<button class="btn-primary" id="shBtnGenerateMissionEmpty">🎲 Сгенерировать миссию</button>' +
    '</div>';
  } else {
    missionsCardsHtml = filtered.map(function(m){
      var rConf = SH_MISSION_RANKS[m.rank] || SH_MISSION_RANKS.C;
      var targetC = mapCountryById(m.targetCountryId);
      var symImg = (targetC && targetC.village && targetC.village.symbolImg) || (typeof SH_VILLAGE_SYMBOLS !== 'undefined' && targetC && SH_VILLAGE_SYMBOLS[targetC.id]);
      var iconHtml = symImg ?
        ('<img src="' + escA(symImg) + '" style="width:14px;height:14px;object-fit:contain;background:#fff;border-radius:50%;padding:1px;vertical-align:middle;margin-right:4px;" />') :
        '📍 ';

      var objListHtml = (m.objectives || []).map(function(ob){
        return '<li>' + esc(ob) + '</li>';
      }).join('');

      var checksHtml = (m.checks || []).map(function(ch){
        return '<span class="sh-mission-check-pill">🎲 ' + esc(ch) + '</span>';
      }).join(' ');

      var dialogueHtml = m.aiDialogue ? (
        '<div style="font-style:italic;font-size:12px;color:#f6e58d;background:rgba(20,16,12,0.6);padding:6px 10px;border-radius:4px;border-left:2px solid #f6e58d;">' +
          '«' + esc(m.aiDialogue) + '»' +
        '</div>'
      ) : '';

      var combatHtml = m.aiCombat ? (
        '<div style="font-size:11.5px;color:#ff7675;background:rgba(40,15,15,0.6);padding:4px 8px;border-radius:4px;">' +
          '⚔️ <b>Оппонент:</b> ' + esc(m.aiCombat) +
        '</div>'
      ) : '';

      return '<div class="sh-mission-card ' + (m.status === 'active' ? 'active-mission' : '') + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">' +
          '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' +
            '<span class="sh-rank-badge rank-' + m.rank.toLowerCase() + '">' + esc(rConf.label) + '</span>' +
            '<span style="font-size:11px;color:var(--ink-dim);">' + esc(rConf.level) + '</span>' +
            (m.aiGenerated ? '<span style="font-size:10px;background:rgba(155,89,182,0.2);color:#d29bfa;border:1px solid rgba(155,89,182,0.4);border-radius:3px;padding:1px 4px;">✨ Gemini AI</span>' : '') +
          '</div>' +
          '<div style="font-size:14px;font-weight:700;color:#f6e58d;white-space:nowrap;">' +
            m.rewardRyo.toLocaleString('ru-RU') + ' <span style="font-size:11px;color:var(--ink-dim);">рё</span>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div style="font-size:14.5px;font-weight:700;color:#f5f6fa;margin-bottom:3px;font-family:Cinzel,serif;">' + esc(m.title) + '</div>' +
          '<div style="font-size:11.5px;color:var(--brass,#c5a059);">' +
            'Заказчик: <b>' + esc(m.client ? m.client.name : 'Неизвестный') + '</b> (' + esc(m.client ? m.client.title : '') + ')' +
          '</div>' +
          '<div style="font-size:11px;color:var(--ink-dim);margin-top:2px;">' +
            'Маршрут: ' + esc(m.originVillage) + ' ➔ ' + iconHtml + esc(m.targetName) +
          '</div>' +
        '</div>' +
        dialogueHtml +
        '<div style="font-size:12.5px;color:#e0d8cb;line-height:1.45;">' + esc(m.desc) + '</div>' +
        '<ul class="sh-mission-obj-list">' + objListHtml + '</ul>' +
        '<div class="sh-mission-checks">' + checksHtml + '</div>' +
        combatHtml +
        '<details class="sh-mission-spoiler">' +
          '<summary>🎭 Секретный твист для Мастера (DM Spoiler)</summary>' +
          '<div style="margin-top:5px;line-height:1.4;">' + esc(m.dmSpoiler) + '</div>' +
        '</details>' +
        '<div style="display:flex;gap:6px;align-items:center;margin-top:auto;padding-top:6px;flex-wrap:wrap;">' +
          '<button class="btn-primary" data-accept-mission="' + escA(m.id) + '" style="font-size:11.5px;padding:5px 10px;">🧭 Принять и проложить маршрут</button>' +
          '<button class="btn-ghost" data-copy-mission-ai="' + escA(m.id) + '" style="font-size:11.5px;padding:5px 10px;" title="Скопировать подробный промпт для Google AI Studio">📋 В AI Studio</button>' +
          '<button class="sh-map-btn" data-delete-mission="' + escA(m.id) + '" style="font-size:11.5px;padding:5px 8px;color:#ff7675;" title="Удалить миссию с доски">🗑️</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  var originOptions = '';
  if(typeof SH_MAP_DATA !== 'undefined' && Array.isArray(SH_MAP_DATA)){
    var great = SH_MAP_DATA.filter(function(c){ return c.type === 'great'; });
    var buffer = SH_MAP_DATA.filter(function(c){ return c.type === 'buffer'; });
    var islands = SH_MAP_DATA.filter(function(c){ return c.type === 'island'; });
    var east = SH_MAP_DATA.filter(function(c){ return c.type === 'east'; });

    var formatOpt = function(c){
      var vName = c.village ? c.village.name : c.name;
      return '<option value="' + escA(c.id) + '" ' + (c.id === originCid ? 'selected' : '') + '>' + esc(vName + ' (' + c.name + ')') + '</option>';
    };

    originOptions = '<optgroup label="Великие Скрытые Селения">' + great.map(formatOpt).join('') + '</optgroup>' +
      '<optgroup label="Малые Страны и Селения">' + buffer.map(formatOpt).join('') + '</optgroup>' +
      '<optgroup label="Островные Государства">' + islands.map(formatOpt).join('') + '</optgroup>' +
      '<optgroup label="Восточные Земли и Особые">' + east.map(formatOpt).join('') + '</optgroup>';
  }

  return '<div class="sh-map-inspector" id="shMapInspector">' +
    '<div class="sh-map-inspector-head" style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px;flex-wrap:wrap;">' +
      '<div>' +
        '<div class="sh-map-inspector-title" style="display:flex;align-items:center;gap:8px;">' +
          '<span style="font-size:24px;">📜</span>' +
          '<span>Доска миссий резиденции Каге</span>' +
        '</div>' +
        '<div class="sh-map-inspector-sub">Каноничные контракты шиноби D/C/B/A/S, расчет наград в Рё и прокладка маршрутов экспедиций</div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
        '<div style="font-size:12px;color:var(--ink-dim);">Резиденция:</div>' +
        '<select id="shMissionOriginSelect" class="sh-route-preset-sel" style="max-width:240px;font-size:12px;">' +
          originOptions +
        '</select>' +
      '</div>' +
    '</div>' +
    tabsHtml +
    apiBoxHtml +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button class="btn-primary" id="shBtnGenerateMission" style="font-size:12px;padding:6px 12px;">🎲 Сгенерировать контракт</button>' +
        '<button class="btn-ghost" id="shBtnGenerateAiMission" style="font-size:12px;padding:6px 12px;color:#d29bfa;border-color:rgba(155,89,182,0.4);" title="Генерация через Google Gemini API">' +
          (hasKey ? '✨ Сюжет через Gemini AI' : '✨ Gemini AI (Настроить)') +
        '</button>' +
        '<button class="sh-map-btn" id="shBtnToggleApiKeyBox" style="font-size:12px;padding:6px 10px;" title="Управление API-ключом">' +
          '🔑 ' + (hasKey ? 'Ключ активен' : 'Ввести ключ') +
        '</button>' +
      '</div>' +
      '<div style="font-size:11.5px;color:var(--ink-dim);">' +
        'Показано контрактов: <b>' + filtered.length + '</b> из <b>' + missionsList.length + '</b>' +
      '</div>' +
    '</div>' +
    '<div class="sh-missions-grid">' +
      missionsCardsHtml +
    '</div>' +
  '</div>';
}

function shMap(){
  if(!SH.map) SH.map = {
    mode: 'inspect',
    selectedId: 'fire',
    filter: 'all',
    search: '',
    showVillages: true,
    showLabels: true,
    showUserMarkers: true,
    userMarkers: [],
    selectedMarkerId: null,
    isPlacingMarker: false,
    placingCoords: null,
    isEditingMarker: false,
    routePoints: [],
    encounter: null,
    zoom: 1,
    panX: 0,
    panY: 0,
    cx: 512,
    cy: 341
  };
  if(!SH.map.mode) SH.map.mode = 'inspect';
  if(!Array.isArray(SH.map.routePoints)) SH.map.routePoints = [];
  if(!Array.isArray(SH.map.userMarkers)) SH.map.userMarkers = loadUserMarkers();
  if(!Array.isArray(SH.map.missions)) SH.map.missions = loadMissions();
  if(!SH.map.missionsFilter) SH.map.missionsFilter = 'all';
  if(!SH.map.missionOrigin) SH.map.missionOrigin = 'fire';

  var isRoute = (SH.map.mode === 'route');
  var isMarkers = (SH.map.mode === 'markers');
  var isMissions = (SH.map.mode === 'missions');
  var curC = mapCountryById(SH.map.selectedId) || SH_MAP_DATA[0];
  var svgHtml = renderShinobiMapSvg(SH_MAP_DATA, SH.map.selectedId, SH.map.showVillages, SH.map.showLabels);

  var inspectorHtml = '';
  if(isRoute){
    inspectorHtml = renderRouteInspector(SH.map.routePoints, SH_MAP_DATA, SH.map.encounter);
  } else if(isMissions){
    inspectorHtml = renderMissionBoard(SH.map.missions, SH.map.missionsFilter, SH.map.missionOrigin, SH.map.showApiBox);
  } else if(isMarkers || SH.map.selectedMarkerId || SH.map.placingCoords || SH.map.isEditingMarker){
    var selMarker = SH.map.selectedMarkerId ? getMarkerById(SH.map.selectedMarkerId) : null;
    inspectorHtml = renderMarkerInspector(selMarker, SH.map.userMarkers, SH.map.isEditingMarker, SH.map.placingCoords);
  } else {
    inspectorHtml = renderMapInspector(curC);
  }

  var filterTabs = [
    { k: 'all', l: 'Все (' + SH_MAP_DATA.length + ')' },
    { k: 'great', l: 'Пять Великих' },
    { k: 'buffer', l: 'Буферные зоны' },
    { k: 'small', l: 'Малые страны' },
    { k: 'island', l: 'Острова' },
    { k: 'neutral', l: 'Нейтральные и неизведанные' }
  ];

  var filterHtml = (isRoute || isMarkers || isMissions) ? '' : ('<div class="sh-filter-bar" style="max-width:920px;margin:10px auto;">' +
    filterTabs.map(function(t){
      return '<div class="sh-filter-pill '+(SH.map.filter===t.k?'active':'')+'" data-map-filter="'+t.k+'">'+esc(t.l)+'</div>';
    }).join('') +
  '</div>');

  var modeHintBar = isRoute ? (
    '<div style="max-width:920px;margin:10px auto;display:flex;align-items:center;justify-content:space-between;gap:10px;background:rgba(20,16,12,0.85);border:1px solid rgba(246,229,141,0.3);border-radius:8px;padding:8px 14px;font-size:12.5px;color:#f5f6fa;flex-wrap:wrap;">' +
      '<div>🧭 <b>Режим навигации шиноби:</b> кликайте по скрытым деревням, меткам или карте, чтобы задать точки маршрута (A ➔ B).</div>' +
      '<div style="color:#f6e58d;font-weight:bold;">1 px = 4.0 км</div>' +
    '</div>'
  ) : (isMarkers ? (
    '<div style="max-width:920px;margin:10px auto;display:flex;align-items:center;justify-content:space-between;gap:10px;background:rgba(20,16,12,0.85);border:1px solid rgba(231,76,60,0.4);border-radius:8px;padding:8px 14px;font-size:12.5px;color:#f5f6fa;flex-wrap:wrap;">' +
      '<div>📍 <b>Режим тактических меток:</b> кликните в любое место на карте мира, чтобы установить собственный маркер (лагерь, тайник, засада, артефакт).</div>' +
      '<div style="color:var(--brass,#c5a059);font-weight:bold;">Всего меток: ' + SH.map.userMarkers.length + '</div>' +
    '</div>'
  ) : (isMissions ? (
    '<div style="max-width:920px;margin:10px auto;display:flex;align-items:center;justify-content:space-between;gap:10px;background:rgba(20,16,12,0.85);border:1px solid rgba(241,196,15,0.35);border-radius:8px;padding:8px 14px;font-size:12.5px;color:#f5f6fa;flex-wrap:wrap;">' +
      '<div>📜 <b>Доска миссий резиденции Каге:</b> процедурные задания рангов D/C/B/A/S для D&D 2024, награды в Рё, автоматическая прокладка маршрутов и генерация через Gemini AI.</div>' +
      '<div style="color:#f1c40f;font-weight:bold;">Миссий: ' + (SH.map.missions ? SH.map.missions.length : 0) + '</div>' +
    '</div>'
  ) : ''));

  var markersCount = (SH.map.userMarkers && SH.map.userMarkers.length) || 0;
  var missionsCount = (SH.map.missions && SH.map.missions.length) || 0;

  return crumbSh([{label:'Шиноби',nav:'home'},{label:'Справочник',nav:'shRef'},{label:'Карта мира'}])+
    '<button class="back" data-nav="'+((window._prevScreen === 'shHome') ? 'home' : 'shRef')+'">← '+((window._prevScreen === 'shHome') ? 'На главную' : 'Назад в Справочник')+'</button>'+
    '<h1>🗺️ Карта мира шиноби</h1>'+
    '<div class="subtitle">Интерактивный тактический атлас 46 государств, калькулятор переходов, тактические метки и доска миссий (AI Studio)</div>'+
    '<div class="sh-map-container">'+
      '<div class="sh-map-toolbar">'+
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">'+
          '<div class="sh-map-mode-seg">'+
            '<button class="sh-mode-btn '+(SH.map.mode==='inspect'?'active':'')+'" id="shMapModeInspect" title="Обычный режим атласа и карточек стран">🗺️ Атлас</button>'+
            '<button class="sh-mode-btn '+(SH.map.mode==='route'?'active':'')+'" id="shMapModeRoute" title="Режим навигатора и расчета переходов">🧭 Маршруты</button>'+
            '<button class="sh-mode-btn '+(SH.map.mode==='markers'?'active':'')+'" id="shMapModeMarkers" title="Пользовательские метки, тайники и засады">📍 Метки ('+markersCount+')</button>'+
            '<button class="sh-mode-btn '+(SH.map.mode==='missions'?'active':'')+'" id="shMapModeMissions" title="Доска миссий и генератор заданий">📜 Миссии ('+missionsCount+')</button>'+
          '</div>'+
          (isMarkers ? (
            '<button class="btn-primary" id="shBtnToolbarAddMarker" style="font-size:12px;padding:4px 10px;">➕ Добавить метку</button>'+
            (markersCount > 0 ? '<button class="sh-map-btn" id="shBtnToolbarClearMarkers" style="font-size:12px;color:#ff7675;">🗑️ Очистить</button>' : '')
          ) : isRoute ? (
            '<select class="sh-route-preset-sel" id="shRoutePreset">'+
              '<option value="">⚡ Выберите каноничный маршрут...</option>'+
              '<option value="konoha_suna">Коноха ➔ Суна (Каноничный 3-дневный тракт)</option>'+
              '<option value="konoha_waves">Коноха ➔ Великий мост Наруто (Волны)</option>'+
              '<option value="konoha_rain">Коноха ➔ Амегакуре (Скрытый Дождь)</option>'+
              '<option value="konoha_kumo">Коноха ➔ Кумогакуре (Скрытое Облако)</option>'+
              '<option value="konoha_iwa">Коноха ➔ Ивагакуре (Мост Каннаби)</option>'+
              '<option value="kumo_iwa">Кумогакуре ➔ Ивагакуре (Северный фронт)</option>'+
              '<option value="suna_rain">Сунагакуре ➔ Амегакуре (Западный переход)</option>'+
            '</select>'+
            '<button class="sh-map-btn" id="shBtnClearRouteTop" title="Очистить точки маршрута">🗑️ Сбросить</button>'
          ) : isMissions ? (
            '<button class="btn-primary" id="shBtnToolbarGenMission" style="font-size:12px;padding:4px 10px;">🎲 Сгенерировать миссию</button>'
          ) : (
            '<div class="sh-map-search-wrap">'+
              '<span class="sh-map-search-icon">🔍</span>'+
              '<input type="text" class="sh-map-search-input" id="shMapSearch" placeholder="Поиск страны, деревни или клана..." value="'+escA(SH.map.search||'')+'">'+
            '</div>'
          ))+
        '</div>'+
        '<div class="sh-map-controls">'+
          '<label class="sh-map-chk"><input type="checkbox" id="shMapToggleVillages" '+(SH.map.showVillages?'checked':'')+'> Деревни</label>'+
          '<label class="sh-map-chk"><input type="checkbox" id="shMapToggleLabels" '+(SH.map.showLabels?'checked':'')+'> Названия</label>'+
          '<label class="sh-map-chk"><input type="checkbox" id="shMapToggleUserMarkers" '+(SH.map.showUserMarkers!==false?'checked':'')+'> Метки ('+markersCount+')</label>'+
          '<button class="sh-map-btn" id="shMapZoomIn" title="Приблизить внутри бокса">➕</button>'+
          '<button class="sh-map-btn" id="shMapZoomOut" title="Отдалить внутри бокса">➖</button>'+
          '<button class="sh-map-btn" id="shMapZoomReset" title="Сбросить масштаб">⟲ 100%</button>'+
        '</div>'+
      '</div>'+
      '<div class="sh-map-viewport" id="shMapViewport" title="Зажмите левую кнопку мыши для перемещения карты внутри бокса, колесико для зума">'+
        '<div class="sh-map-corner sh-map-corner-tl"></div>'+
        '<div class="sh-map-corner sh-map-corner-tr"></div>'+
        '<div class="sh-map-corner sh-map-corner-bl"></div>'+
        '<div class="sh-map-corner sh-map-corner-br"></div>'+
        '<div class="sh-map-svg-wrap" id="shMapSvgWrap">'+
          svgHtml +
        '</div>'+
      '</div>'+
    '</div>'+
    modeHintBar +
    filterHtml +
    inspectorHtml;
}

SH.mapData = SH_MAP_DATA;
SH.neutralRegions = (typeof SH_NEUTRAL_REGIONS !== 'undefined') ? SH_NEUTRAL_REGIONS : [];
SH.renderShinobiMapSvg = renderShinobiMapSvg;
SH.renderMapInspector = renderMapInspector;
SH.renderRouteInspector = renderRouteInspector;
SH.renderMarkerInspector = renderMarkerInspector;
SH.loadUserMarkers = loadUserMarkers;
SH.saveUserMarkers = saveUserMarkers;
SH.addUserMarker = addUserMarker;
SH.updateUserMarker = updateUserMarker;
SH.deleteUserMarker = deleteUserMarker;
SH.clearAllUserMarkers = clearAllUserMarkers;
SH.getMarkerById = getMarkerById;
SH.calcRouteDistance = calcRouteDistance;
SH.getCrossedCountries = getCrossedCountries;
SH.findCountryAtPoint = findCountryAtPoint;
SH.snapToVillage = snapToVillage;
SH.travelEncounters = SH_TRAVEL_ENCOUNTERS;
SH.routePresets = SH_ROUTE_PRESETS;
SH.mapCountryById = mapCountryById;
SH.terrainConfig = SH_TERRAIN_CONFIG;
SH.getTerrainAtPoint = getTerrainAtPoint;
SH.calcRouteTerrainProfile = calcRouteTerrainProfile;
SH.missionRanks = SH_MISSION_RANKS;
SH.missionClients = SH_MISSION_CLIENTS;
SH.missionObjectives = SH_MISSION_OBJECTIVES;
SH.missionTwists = SH_MISSION_TWISTS;
SH.getGeminiApiKey = getGeminiApiKey;
SH.saveGeminiApiKey = saveGeminiApiKey;
SH.loadMissions = loadMissions;
SH.saveMissions = saveMissions;
SH.generateProceduralMission = generateProceduralMission;
SH.callGeminiMissionGenerator = callGeminiMissionGenerator;
SH.renderMissionBoard = renderMissionBoard;
SH.shMap = shMap;
SH.techCats = TECH_CATS;
SH.isDojutsu = isDojutsu;
SH.renderTechCard = renderTechCard;
SH.shTechs = shTechs;
SH.shTechEdit = shTechEdit;
SH.shTechView = shTechView;



function sel(id,list,cur,fmt){
  return '<select id="'+id+'">'+list.map(function(o){
    var v = (typeof o==='object')? (o.k||o.v) : o;
    var l = (typeof o==='object')? (o.ru||o.l||o.k) : o;
    return '<option value="'+escA(v)+'"'+(String(v)===String(cur)?' selected':'')+'>'+esc(l)+'</option>';
  }).join('')+'</select>';
}
function fldx(fid,l,inner,hint){
  return '<div class="field" id="'+fid+'"><div class="section-label">'+esc(l)+'</div>'+inner+(hint?'<div class="desc">'+esc(hint)+'</div>':'')+'</div>';
}
function inpList(id,list,cur,ph){
  var lid=id+'_dl';
  return '<input id="'+id+'" list="'+lid+'" type="text" value="'+escA(cur||'')+'"'+(ph?' placeholder="'+escA(ph)+'"':'')+'>'+
    '<datalist id="'+lid+'">'+list.map(function(o){ return '<option value="'+escA(o)+'">'; }).join('')+'</datalist>';
}
function fld(l,inner,hint){
  return '<div class="field"><div class="section-label">'+esc(l)+'</div>'+inner+(hint?'<div class="desc">'+esc(hint)+'</div>':'')+'</div>';
}


function callGeminiJutsuGenerator(opts, apiKey, callback){
  if(!apiKey){
    callback("API ключ не указан", null);
    return;
  }
  var prompt = "Ты Dungeon Master в сеттинге Naruto. Сгенерируй лорную технику (Дзюцу) для игрока. " +
    "Тема: " + (opts.theme || "Случайная техника") + ". " +
    "Категория: " + (opts.cat || "Случайная") + ". " +
    "Ранг: " + (opts.rank || "Случайный") + ". " +
    "Стихия: " + (opts.nature || "Случайная") + ". " +
    "Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown и комментариев, со следующими полями:\n" +
    "{\n" +
    '  "name": "Эпичное название техники",\n' +
    '  "rank": "Ранг (E, D, C, B, A, S)",\n' +
    '  "cat": "Ниндзюцу / Гендзюцу / Тайдзюцу / Фуиндзюцу",\n' +
    '  "nature": "Стихия (Огонь, Вода, Ветер, Земля, Молния, Инь, Ян или пусто)",\n' +
    '  "cost": "Стоимость чакры (число, например 3)",\n' +
    '  "req": "Требования (если есть)",\n' +
    '  "desc": "Печати: [Перечисление печатей СТРОГО через стрелочку, если требуются: Крыса → Тигр → Дракон]. Подробное художественное и механическое описание.",\n' +
    '  "dmgN": "Количество кубов урона (только число, например 2. Если урона нет, то 0)",\n' +
    '  "dmgD": "Тип куба (d4, d6, d8, d10, d12. Если урона нет, то d0)",\n' +
    '  "dmgMod": "Статичный бонус к урону (только число)"\n' +
    "}";

  requestGeminiGenerateContent(prompt, apiKey, function(err, data){
    if(err || !data){
      callback(err ? (err.message || String(err)) : "Пустой ответ от AI", null);
      return;
    }
    try{
      var parsed = extractJsonFromAi(data);
      callback(null, parsed);
    }catch(err2){
      callback("Ошибка разбора JSON: " + err2.message, null);
    }
  });
}


function callGeminiMoveGenerator(opts, apiKey, callback){
  if(!apiKey){
    callback("API ключ не указан", null);
    return;
  }
  var prompt = "Ты Dungeon Master в сеттинге Naruto / DnD. Придумай боевой приём (тайдзюцу, кендзюцу, маневр). " +
    "Идея: " + (opts.theme || "Случайный приём") + ". " +
    "Категория (вид): " + (opts.kind || "Случайный") + ". " +
    "Тип механики: " + (opts.mtype || "Случайная") + ". " +
    "Оружие: " + (opts.weapon || "Любое/Без оружия") + ". " +
    "Отвечай строго JSON-объектом без markdown форматирования, с полями:\n" +
    "{\n" +
    '  "name": "Название приёма",\n' +
    '  "kind": "Категория (строго одно из: Рукопашный, Оружейный, Смешанный, Передвижение)",\n' +
    '  "mtype": "Тип (строго одно из: Урон, Состояние, Реакция, Манёвр, Защита)",\n' +
    '  "weapon": "Используемое оружие (или пусто)",\n' +
    '  "atk": "Модификатор атаки (строго одно из: Сила, Ловкость, Телосложение, Интеллект, Мудрость, Харизма) или пусто",\n' +
    '  "dmg": "Формула урона (например 1d8+3 или 2d6) или пусто",\n' +
    '  "def": "Спасбросок (Сила, Ловкость, Телосложение, Интеллект, Мудрость, Харизма) или пусто",\n' +
    '  "state": "Состояние (СБИТ, ОБЕЗДВИЖЕН, ОСЛЕПЛЁН, КРОВОТЕЧЕНИЕ, другое) или пусто",\n' +
    '  "dur": "Длительность (мгновенно, один ход, до конца боя) или пусто",\n' +
    '  "trigger": "Условие активации (если Реакция, например \'при атаке врага\') или пусто",\n' +
    '  "reach": "Дистанция (Ближний бой, 10 метров) или пусто",\n' +
    '  "pay": "Цена (ОД, ОДД, Свободное, Реакция)",\n' +
    '  "req": "Требования (например \'владение мечом\') или пусто",\n' +
    '  "desc": "Художественное и механическое описание того, как выглядит и работает приём."\n' +
    "}";

  requestGeminiGenerateContent(prompt, apiKey, function(err, data){
    if(err || !data){
      callback(err ? (err.message || String(err)) : "Пустой ответ от AI", null);
      return;
    }
    try{
      var parsed = extractJsonFromAi(data);
      callback(null, parsed);
    }catch(err2){
      callback("Ошибка разбора JSON: " + err2.message, null);
    }
  });
}

function shJutsuGen(){
  var key = getGeminiApiKey();
  
  var html = crumbSh([{label:'Шиноби',nav:'home'},{label:'Техники',nav:'shTechs'},{label:'AI Генератор'}])+
    '<button class="back" data-nav="shTechs">← Назад</button>'+
    '<h1>✨ AI Генератор Дзюцу</h1>'+
    
    '<div class="sheet-section" id="jgFormSection">'+
      '<p>Введите пожелания к технике. AI создаст её механику и описание, правильно расставив печати.</p>'+
      fld('Тема / Идея (например: "Огненный дракон" или "Защита от гендзюцу")', '<textarea id="jgTheme" rows="4" placeholder="Что должна делать техника? Опиши идею подробно, вставь лор или механические пожелания..."></textarea>') +
      fld('Категория', '<select id="jgCat">'+
          '<option value="">Авто (на усмотрение AI)</option>'+
          '<option value="Ниндзюцу">Ниндзюцу</option>'+
          '<option value="Гендзюцу">Гендзюцу</option>'+
          '<option value="Тайдзюцу">Тайдзюцу</option>'+
          '<option value="ФУИНДЗЮЦУ">ФУИНДЗЮЦУ</option>'+
        '</select>') +
      fld('Ранг', '<select id="jgRank">'+
          '<option value="">Авто (на усмотрение AI)</option>'+
          '<option value="E">E (Академик)</option>'+
          '<option value="D">D (Генин)</option>'+
          '<option value="C">C (Чунин)</option>'+
          '<option value="B">B (Джонин)</option>'+
          '<option value="A">A (Элита)</option>'+
          '<option value="S">S (Каге / Легенда)</option>'+
        '</select>') +
      fld('Стихия / Природа', '<input type="text" id="jgNature" placeholder="Например: Огонь, Кровь, Дерево">') +
      '<div class="sheet-actions" style="margin-top:20px;">' +
        '<button class="btn-ghost" id="btnJutsuGen" style="width:100%; color:#d29bfa; border-color:rgba(155,89,182,0.4); font-weight:700;">✨ Сгенерировать технику</button>' +
      '</div>'+
    '</div>'+
    
    '<div id="jgResult" style="display:none;">'+
      '<div id="jgPreview" style="margin-bottom:15px;"></div>'+
      '<div style="display:flex; flex-direction:column; gap:10px;">' +
        '<button class="btn-primary" id="btnJutsuSave" style="width:100%; background:#27ae60;">💾 Сохранить в Мои Техники</button>' +
        '<div style="display:flex; gap:10px;">' +
          '<button class="btn-ghost" id="btnJutsuRegen" style="flex:1;">🔄 Ещё раз (Те же настройки)</button>' +
          '<button class="btn-ghost" id="btnJutsuBack" style="flex:1;">✏️ Изменить настройки</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div id="jgHistoryWrap" style="margin-top:30px; border-top:1px solid var(--line); padding-top:15px; display:none;">'+
      '<div class="section-label">📜 История генераций (локально)</div>'+
      '<div id="jgHistoryList" style="display:flex; flex-direction:column; gap:8px;"></div>'+
    '</div>';

  return html;
}



function shMoveGen(){
  var key = getGeminiApiKey();
  
  var html = crumbSh([{label:'Шиноби',nav:'home'},{label:'Приёмы',nav:'shMoves'},{label:'AI Генератор'}])+
    '<button class="back" data-nav="shMoves">← Назад</button>'+
    '<h1>✨ AI Генератор Приёмов</h1>'+
    
    '<div class="sheet-section" id="mgFormSection">'+
      '<p>Создайте новый боевой приём (тайдзюцу, кендзюцу, маневр). AI подберет эффекты, урон и условия.</p>'+
      fld('Идея / Название (например: "Удар лотоса" или "Бросок с тенью")', '<textarea id="mgTheme" rows="4" placeholder="Что должен делать приём? Опиши идею подробно, вставь лор или механические пожелания..."></textarea>') +
      fld('Категория', '<select id="mgKind">'+
          '<option value="">Любая (на усмотрение AI)</option>'+
          '<option value="Рукопашный">Рукопашный</option>'+
          '<option value="Оружейный">Оружейный</option>'+
          '<option value="Смешанный">Смешанный</option>'+
          '<option value="Передвижение">Передвижение</option>'+
        '</select>') +
      fld('Тип механики', '<select id="mgType">'+
          '<option value="">Любая (на усмотрение AI)</option>'+
          '<option value="Урон">Урон (Основная атака)</option>'+
          '<option value="Состояние">Наложение состояния</option>'+
          '<option value="Манёвр">Манёвр (Толчок, Бросок)</option>'+
          '<option value="Реакция">Реакция / Парирование</option>'+
          '<option value="Защита">Защита / Стойка</option>'+
        '</select>') +
      fld('Оружие (необязательно)', '<input type="text" id="mgWeapon" placeholder="Например: Катана, Кунаи, Тяжелый молот">') +
      '<div class="sheet-actions" style="margin-top:20px;">' +
        '<button class="btn-ghost" id="btnMoveGen" style="width:100%; color:#d29bfa; border-color:rgba(155,89,182,0.4); font-weight:700;">✨ Сгенерировать приём</button>' +
      '</div>'+
    '</div>'+
    
    '<div id="mgResult" style="display:none;">'+
      '<div id="mgPreview" style="margin-bottom:15px;"></div>'+
      '<div style="display:flex; flex-direction:column; gap:10px;">' +
        '<button class="btn-primary" id="btnMoveSave" style="width:100%; background:#27ae60;">💾 Сохранить этот приём</button>' +
        '<div style="display:flex; gap:10px;">' +
          '<button class="btn-ghost" id="btnMoveRegen" style="flex:1;">🔄 Ещё раз (Те же настройки)</button>' +
          '<button class="btn-ghost" id="btnMoveBack" style="flex:1;">✏️ Изменить настройки</button>' +
        '</div>' +
      '</div>' +
    '</div>'+
    '<div id="mgHistoryWrap" style="margin-top:30px; border-top:1px solid var(--line); padding-top:15px; display:none;">'+
      '<div class="section-label">📜 История генераций (локально)</div>'+
      '<div id="mgHistoryList" style="display:flex; flex-direction:column; gap:8px;"></div>'+
    '</div>';

  return html;
}

function callGeminiSkillGenerator(opts, apiKey, callback){
  if(!apiKey){ callback("API ключ не указан", null); return; }
  var prompt = "Ты Dungeon Master в сеттинге Naruto / DnD. Придумай небоевой навык, ремесло или знание. " +
    "Идея: " + (opts.theme || "Случайный навык") + ". " +
    "Категория: " + (opts.kind || "Случайная") + ". " +
    "Уровень мастерства: " + (opts.level || "Автоматически по контексту") + ". " +
    "Отвечай строго JSON-объектом без markdown форматирования, с полями:\n" +
    "{\n" +
    '  "name": "Название навыка (например: Выживание в пустыне, Кузнечное дело, Знание истории)",\n' +
    '  "kind": "Категория (строго одно из: Ремесло, Быт, Знание, Искусство, Выживание, Общение, Другое)",\n' +
    '  "level": "Ступень мастерства (строго одно из: Начатки, Ученик, Подмастерье, Умелец, Мастер)",\n' +
    '  "abil": "Связанная характеристика (Сила, Ловкость, Телосложение, Интеллект, Мудрость, Харизма)",\n' +
    '  "src": "Где или как мог быть получен этот навык (например: Годы службы в АНБУ)",\n' +
    '  "gives": "Сюжетно: что конкретно персонаж может делать благодаря навыку, чего не могут другие (без броска или с преимуществом)",\n' +
    '  "desc": "Детали, нюансы и ограничения применения."\n' +
    "}";
  requestGeminiGenerateContent(prompt, apiKey, function(err, data){
    if(err || !data){
      callback(err ? (err.message || String(err)) : "Пустой ответ от AI", null);
      return;
    }
    try{
      var parsed = extractJsonFromAi(data);
      callback(null, parsed);
    }catch(err2){
      callback("Ошибка разбора JSON: " + err2.message, null);
    }
  });
}

function shSkillGen(){
  var key = getGeminiApiKey();
  var html = crumbSh([{label:'Шиноби',nav:'home'},{label:'Навыки',nav:'shSkills'},{label:'AI Генератор'}])+
    '<button class="back" data-nav="shSkills">← Назад</button>'+
    '<h1>✨ AI Генератор Навыков</h1>'+
    
    '<div class="sheet-section" id="sgFormSection">'+
      '<p>Создайте небоевой навык, ремесло или уникальное знание.</p>'+
      fld('Идея / Название (например: "Знание запретных техник" или "Кузнец из страны Железа")', '<textarea id="sgTheme" rows="4" placeholder="Что должен уметь персонаж?"></textarea>') +
      fld('Категория', '<select id="sgKind">'+
          '<option value="">Любая (на усмотрение AI)</option>'+
          '<option value="Ремесло">Ремесло (Ковка, шитье, готовка)</option>'+
          '<option value="Быт">Быт (Охота, торговля, медицина)</option>'+
          '<option value="Знание">Знание (История, печати, кланы)</option>'+
          '<option value="Искусство">Искусство (Рисование, музыка)</option>'+
          '<option value="Выживание">Выживание (Лес, пустыня, ориентирование)</option>'+
          '<option value="Общение">Общение (Убеждение, допрос)</option>'+
        '</select>') +
      fld('Уровень мастерства', '<select id="sgLevel">'+
          '<option value="">Авто (на усмотрение AI)</option>'+
          '<option value="Начатки">Начатки (Базовые попытки, хобби)</option>'+
          '<option value="Ученик">Ученик (Обученный новичок)</option>'+
          '<option value="Подмастерье">Подмастерье (Опытный работяга)</option>'+
          '<option value="Умелец">Умелец (Профи, делает без ошибок)</option>'+
          '<option value="Мастер">Мастер (Лучший в своем деле, легенда)</option>'+
        '</select>') +
      '<div class="sheet-actions" style="margin-top:20px;">' +
        '<button class="btn-ghost" id="btnSkillGen" style="width:100%; color:#d29bfa; border-color:rgba(155,89,182,0.4); font-weight:700;">✨ Сгенерировать навык</button>' +
      '</div>'+
    '</div>'+
    
    '<div id="sgResult" style="display:none;">'+
      '<div id="sgPreview" style="margin-bottom:15px;"></div>'+
      '<div style="display:flex; flex-direction:column; gap:10px;">' +
        '<button class="btn-primary" id="btnSkillSave" style="width:100%; background:#27ae60;">💾 Сохранить навык</button>' +
        '<div style="display:flex; gap:10px;">' +
          '<button class="btn-ghost" id="btnSkillRegen" style="flex:1;">🔄 Ещё раз (Те же настройки)</button>' +
          '<button class="btn-ghost" id="btnSkillBack" style="flex:1;">✏️ Изменить настройки</button>' +
        '</div>' +
      '</div>' +
    '</div>'+
    '<div id="sgHistoryWrap" style="margin-top:30px; border-top:1px solid var(--line); padding-top:15px; display:none;">'+
      '<div class="section-label">📜 История генераций (локально)</div>'+
      '<div id="sgHistoryList" style="display:flex; flex-direction:column; gap:8px;"></div>'+
    '</div>';
  return html;
}

function shTechEdit(){
  var isNew = view.shId==='new';
  var d = SH.draft || (SH.draft = isNew ? newTech() : JSON.parse(JSON.stringify(techById(view.shId)||newTech())));
  var wch = WINDOWS.map(function(w){
    var on = d.windows && d.windows.indexOf(w.ru)>=0;
    return '<label class="combat-box"><input type="checkbox" class="shWin" value="'+escA(w.ru)+'"'+(on?' checked':'')+'> <span class="cb-label">'+esc(w.ru)+'</span></label>';
  }).join('');
  var curSides = (d.dmgD || '6').toString().replace(/\D/g, '') || '6';
  return crumbSh([{label:'Шиноби',nav:'home'},{label:'Техники',nav:'shTechs'},{label:isNew?'Новая':'Правка'}])+
    '<button class="back" data-nav="'+(isNew?'shTechs':('shTechView:'+d.id))+'">← Назад</button>'+
    '<h1>'+esc(d.name||'Новая техника')+'</h1><div class="sheet-section">'+
    fld('Название','<input id="shName" type="text" value="'+escA(d.name)+'">')+
    fld('Ранг', sel('shRank',RANKS,d.rank), 'Ранг — ворота доступа, а не цена применения.')+
    fld('Категория', sel('shCat', TECH_CATS, isDojutsu(d.cat) ? 'Додзюцу' : d.cat))+
    fld('Происхождение', sel('shOrig',['Общая','Природа чакры','Кеккей генкай','Хиден'],d.origin))+
    fld('Природа / род','<input id="shNature" type="text" value="'+escA(d.nature)+'">','Огонь, ветер, молния, земля, вода — либо название рода для хидена. Для общих техник оставь пустым.')+
    fld('Тип эффекта', sel('shEff',EFFECTS,d.effect), 'Именно эффект определяет цену.')+
    fldx('fTDmg','Урон',
      '<div class="dmg-row">'+
        sel('shDmgN',DICE_N,d.dmgN||'1')+
        '<div class="dmg-die-wrap" title="Грань кости: 2, 4, 6, 8, 10, 12, 20 или любая кастомная">'+
          '<span class="dmg-d-prefix">d</span>'+
          '<input id="shDmgD" type="number" min="2" max="1000" step="1" value="'+escA(curSides)+'" placeholder="6" list="shDmgSidesList">'+
          '<datalist id="shDmgSidesList">'+
            '<option value="2">'+
            '<option value="3">'+
            '<option value="4">'+
            '<option value="6">'+
            '<option value="8">'+
            '<option value="10">'+
            '<option value="12">'+
            '<option value="20">'+
            '<option value="100">'+
          '</datalist>'+
        '</div>'+
        '<input id="shDmgMod" type="text" value="'+escA(d.dmgMod||'')+'" placeholder="+4">'+
      '</div>',
      'Количество костей, грань кости (d...) и модификатор. Например: 1d6, 2d8+3 или кастомные d2, d7.')+
    fld('Экспериментальная', '<label class="combat-box"><input type="checkbox" id="shExp"'+(d.isExp?' checked':'')+'> <span class="cb-label">🧪 Требует проверки Контроля чакры (d20) при применении</span></label>', 'Отметь, если техника нестабильна, не доведена до мастерства или несёт риск срыва.')+
    fld('Стоимость активации','<input id="shCost" type="text" value="'+escA(d.cost)+'">')+
    fld('Поддержание за раунд','<input id="shUp" type="text" value="'+escA(d.upkeep)+'">','Заполняется только для длящегося: полей, режимов, усилений.')+
    fld('Окно','<div class="grid">'+wch+'</div>','Ничего не отмечено — окно не требуется. Два и больше — вершинная техника.')+
    fld('Дневной счётчик','<input id="shCnt" type="text" value="'+escA(d.counter)+'">','Только если ограничитель телесный, а не запас чакры. Пусто — счётчика нет.')+
    fld('Требования','<textarea id="shReq" rows="2">'+esc(d.req)+'</textarea>','Пул, контроль, природа, физические данные, кровь или принадлежность к роду.')+
    fld('Описание','<textarea id="shDesc" rows="4">'+esc(d.desc)+'</textarea>')+
    '<div class="sheet-actions"><button class="btn-primary" id="shTechSave">Сохранить</button>'+
    (isNew?'':'<button class="btn-ghost" id="shTechDel">Удалить</button>')+
    '<button class="btn-ghost" data-nav="shTechs">Отмена</button></div></div>';
}

function shTechView(){
  var t = techById(view.shId); if(!t) return shTechs();
  var w = (t.windows&&t.windows.length)
    ? t.windows.map(function(win){ return '<span class="sh-win-badge needed">🎯 '+esc(win)+'</span>'; }).join(' ')
    : '<span class="sh-win-badge">окно не требуется</span>';
  var ef = EFFECTS.filter(function(e){return e.k===t.effect;})[0];
  var catBadgeHtml = isDojutsu(t.cat)
    ? '<span class="sh-cat-badge is-dojutsu">👁️ Додзюцу</span>'
    : ('<span class="sh-cat-badge">' + (TECH_CAT_ICONS[t.cat] || '🌀') + ' ' + esc(t.cat || 'Ниндзюцу') + '</span>');
  var rows = [
    {k:'Ранг', v:rankSeal(t.rank)+' <span style="margin-left:8px;font-size:13px;color:var(--ink-dim)">ворота доступа к технике</span>', raw:true},
    {k:'Категория', v:catBadgeHtml, raw:true},
    {k:'Происхождение', v:t.origin},
    {k:'Природа / род', v:t.nature ? natureBadge(t.nature) : '—', raw:!!t.nature},
    {k:'Тип эффекта', v:ef?ef.ru:'—'}
  ];
  if(dmgText(t)) rows.push({k:'Урон', v:'<b>'+esc(dmgText(t))+'</b>', raw:true});
  if(t.isExp) rows.push({k:'Статус', v:'<span style="color:#ff9085;font-weight:600;">🧪 Экспериментальная техника (требует Контроля чакры)</span>', raw:true});
  rows = rows.concat([
    {k:'Стоимость', v:(t.cost?('<b>'+esc(t.cost)+'</b>'):'—')+(t.upkeep?' + <b>'+esc(t.upkeep)+'</b> за раунд':''), raw:true},
    {k:'Окно применения', v:w, raw:true},
    {k:'Дневной счётчик', v:t.counter? t.counter+' применений в сутки' : 'нет'},
    {k:'Требования', v:t.req||'—'},
    {k:'Описание', v:t.desc||'—'}
  ]);
  return crumbSh([{label:'Шиноби',nav:'home'},{label:'Техники',nav:'shTechs'},{label:t.name||'Техника'}])+
    '<button class="back" data-nav="shTechs">← Назад</button>'+
    '<h1>'+esc(t.name||'Техника')+'</h1>'+
    rows.map(function(x){ return '<div class="hb-row"><div class="hb-row-k">'+esc(x.k)+'</div><div class="hb-row-v">'+(x.raw?x.v:nl2br(x.v))+'</div></div>'; }).join('')+
    '<div class="sheet-actions"><button class="btn-ghost" data-nav="shTechEdit:'+t.id+'">Править</button>'+
    '<button class="btn-ghost" id="shTechDelV">Удалить</button></div>';
}

function shMoveView(){
  var m = moveById(view.shId); if(!m) return shMoves();
  var want = MOVE_FIELDS[m.mtype] || ['atk'];
  var opt = {
    trigger:{k:'На что срабатывает', v:m.trigger},
    atk:    {k:'Бросок приёма',      v:m.atk},
    dmg:    {k:'Урон',               v:m.dmg},
    def:    {k:'Сопротивление цели', v:m.def},
    state:  {k:'Навязывает состояние', v:'<span style="color:var(--brass);font-weight:600;">'+esc(m.state)+'</span>', raw:true},
    dur:    {k:'Длительность',       v:m.dur},
    reach:  {k:'Дальность и результат', v:m.reach}
  };
  var rows = [
    {k:'Вид', v:m.kind||'Рукопашный'},
    {k:'Оружие', v:m.weapon||'без оружия'},
    {k:'Что делает', v:m.mtype||'—'}
  ];
  ['trigger','atk','dmg','def','state','dur','reach'].forEach(function(k){
    if(want.indexOf(k)>=0 && opt[k].v) rows.push(opt[k]);
  });
  rows.push({k:'Чем оплачивается', v:m.pay ? '<b>'+esc(m.pay)+'</b>' : '—', raw:true});
  if(m.req) rows.push({k:'Требования', v:m.req});
  rows.push({k:'Описание', v:m.desc||'—'});
  return crumbSh([{label:'Шиноби',nav:'home'},{label:'Приёмы',nav:'shMoves'},{label:m.name||'Приём'}])+
    '<button class="back" data-nav="shMoves">← Назад</button>'+
    '<h1>'+esc(m.name||'Приём')+'</h1>'+
    rows.map(function(x){ return '<div class="hb-row"><div class="hb-row-k">'+esc(x.k)+'</div><div class="hb-row-v">'+(x.raw?x.v:nl2br(x.v))+'</div></div>'; }).join('')+
    '<div class="sheet-actions"><button class="btn-ghost" data-nav="shMoveEdit:'+m.id+'">Править</button>'+
    '<button class="btn-ghost" id="shMoveDelV">Удалить</button></div>';
}

function shMoveEdit(){
  var isNew = view.shId==='new';
  var d = SH.draft || (SH.draft = isNew ? newMove() : JSON.parse(JSON.stringify(moveById(view.shId)||newMove())));
  return crumbSh([{label:'Шиноби',nav:'home'},{label:'Приёмы',nav:'shMoves'},{label:isNew?'Новый':'Правка'}])+
    '<button class="back" data-nav="'+(isNew?'shMoves':('shMoveView:'+d.id))+'">← Назад</button>'+
    '<h1>'+esc(d.name||'Новый приём')+'</h1><div class="sheet-section">'+
    fld('Название','<input id="shMName" type="text" value="'+escA(d.name)+'">')+
    fld('Вид', sel('shMKind',MOVE_KINDS,d.kind))+
    fldx('fMWeapon','Оружие','<input id="shMWeapon" type="text" value="'+escA(d.weapon||'')+'">','Чокуто, танто, кунай, цепь, веер.')+
    fld('Что делает', sel('shMType',MOVE_TYPES,d.mtype||'Состояние'),'Урон — просто способ ударить. Состояние — навязывает окно. Реакция — тратится в чужой ход. Манёвр — перемещение или позиция. Защита — снижает или отменяет входящее.')+
    fldx('fMTrigger','На что срабатывает','<input id="shMTrig" type="text" value="'+escA(d.trigger||'')+'">','Что должен сделать противник, чтобы приём сработал: замах, выстрел, рывок в упор, техника.')+
    fldx('fMAtk','Бросок приёма', inpList('shMAtk',ABILS,d.atk,'Ловкость'),'Характеристика из списка или свой вариант.')+
    fldx('fMDmg','Урон','<input id="shMDmg" type="text" value="'+escA(d.dmg||'')+'">','Кость и модификатор: 1d8, 2d6+3. Пусто — приём не наносит урона сам по себе.')+
    fldx('fMDef','Сопротивление цели', inpList('shMDef',ABILS,d.def,'Сила'),'Чем цель отбивается. Пусто — не сопротивляется броском.')+
    fldx('fMState','Навязывает состояние', sel('shMState',MOVE_STATES,d.state))+
    fldx('fMDur','Длительность', inpList('shMDur',DURS,d.dur,'один ход'))+
    fldx('fMReach','Дальность и результат','<input id="shMReach" type="text" value="'+escA(d.reach||'')+'">','Насколько смещает и куда: 10 футов назад, заход за спину, на крышу, разрыв дистанции.')+
    fld('Чем оплачивается', sel('shMPay',['кость','предмет','ничем'],d.pay),'Рукопашные приёмы тратят кость тайдзюцу, инструменты тратят сами себя.')+
    fld('Требования','<input id="shMReq" type="text" value="'+escA(d.req||'')+'">','Кто научил, что нужно уметь, какое оружие в руках.')+
    fld('Описание','<textarea id="shMDesc" rows="3">'+esc(d.desc)+'</textarea>')+
    '<div class="sheet-actions"><button class="btn-primary" id="shMoveSave">Сохранить</button>'+
    (isNew?'':'<button class="btn-ghost" id="shMoveDel">Удалить</button>')+
    '<button class="btn-ghost" data-nav="shMoves">Отмена</button></div></div>';
}



function shData(){
  var m = SH.meta || {};
  var profList = SH.profiles || [];
  if(!profList.length && typeof getActiveProfile === 'function'){
    getActiveProfile();
    profList = SH.profiles || [];
  }
  var profOptions = profList.map(function(p){
    var pName = (p.charName || 'Безымянный шиноби') + (p.clan ? ' (' + p.clan + ')' : '') + ' • ' + (p.village || 'Коноха');
    return '<option value="' + escA(p.id) + '" ' + (p.id === SH.activeProfileId ? 'selected' : '') + '>' + esc(pName) + '</option>';
  }).join('');

  var ranks = ['Академик','Генин','Чунин','Спец. джонин','Джонин','Нукенин'];
  var curRank = m.rank || 'Генин';
  var rankOptions = ranks.map(function(r){
    return '<option value="'+escA(r)+'" '+(curRank===r?'selected':'')+'>'+esc(r)+'</option>';
  }).join('');
  if(ranks.indexOf(curRank) === -1 && curRank){
    rankOptions = '<option value="'+escA(curRank)+'" selected>'+esc(curRank)+'</option>' + rankOptions;
  }

  var curNat = m.nature || '';
  var natList = [
    {k:'', t:'Без стихии'},
    {k:'Огонь', t:'Огонь (Катон)'},
    {k:'Ветер', t:'Ветер (Фуутон)'},
    {k:'Молния', t:'Молния (Райтон)'},
    {k:'Земля', t:'Земля (Дотон)'},
    {k:'Вода', t:'Вода (Суйтон)'},
    {k:'Инь', t:'Инь'},
    {k:'Ян', t:'Ян'}
  ];
  var natOptions = natList.map(function(item){
    return '<option value="'+escA(item.k)+'" '+(curNat===item.k?'selected':'')+'>'+esc(item.t)+'</option>';
  }).join('');

  var clanTheme = typeof getShinobiClanTheme === 'function' ? getShinobiClanTheme(m) : 'default';
  var themeNotice = '';
  if(clanTheme === 'kurayami'){
    themeNotice = '<div style="margin:10px 0;padding:10px 14px;background:rgba(30,30,30,0.6);border:1px solid #666666;border-radius:6px;font-size:13px;color:#e5e5e5;display:flex;align-items:center;gap:8px;box-shadow:0 0 12px rgba(0,0,0,0.85);">'+
      '<span style="font-size:18px;">🌑</span> <span>Активирована персональная тёмная тема <b>Клана Кураями</b> (глубокие оттенки чёрного, антрацита и серого, монохромный нуар).</span>'+
    '</div>';
  } else if(clanTheme === 'uchiha'){
    themeNotice = '<div style="margin:10px 0;padding:10px 14px;background:rgba(20,29,51,0.6);border:1px solid #6366f1;border-radius:6px;font-size:13px;color:#e0e7ff;display:flex;align-items:center;gap:8px;box-shadow:0 0 12px rgba(99,102,241,0.25);">'+
      '<span style="font-size:18px;">🪭</span> <span>Активирована персональная тема <b>Клана Учиха</b> (ночной индиго, алые акценты и парящие частицы вееров).</span>'+
    '</div>';
  }

  var activeCharDisplay = (m.charName || 'Безымянный шиноби') + (m.clan ? (' (Клан ' + m.clan + ')') : '');

  return crumbSh([{label:'Шиноби',nav:'home'},{label:'Данные'}])+
    '<button class="back" data-nav="home">← Назад</button>'+
    '<h1>Данные и Ростер Персонажей</h1>'+

    '<div class="sheet-section">'+
      '<div class="section-label" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">'+
        '<span>👥 Выбор и управление шиноби</span>'+
        '<span style="font-size:12px;color:var(--ink-dim);">Всего профилей: ' + profList.length + '</span>'+
      '</div>'+
      '<div class="desc">'+
        'Выберите активного персонажа для игры или создайте нового. Все техники, дзюцу, приёмы и боевые параметры изолированы и сохраняются индивидуально для каждого шиноби.'+
      '</div>'+

      themeNotice +

      '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin:14px 0 12px 0;">'+
        '<div style="flex:1;min-width:240px;">'+
          '<label style="display:block;font-size:12px;color:var(--ink-dim);margin-bottom:4px;font-weight:600;">Активный персонаж (переключение на лету):</label>'+
          '<select id="shDataProfileSelect" class="sh-hud-profile-sel" style="width:100%;font-size:14px;padding:9px 12px;border-radius:4px;">'+
            profOptions +
          '</select>'+
        '</div>'+
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">'+
          '<button class="btn btn-primary" id="shDataNewProfileBtn" title="Создать нового персонажа">➕ Новый шиноби</button>'+
          '<button class="btn" id="shDataCloneProfileBtn" title="Клонировать активного шиноби со всеми техниками">📋 Дублировать</button>'+
        '</div>'+
      '</div>'+

      '<div style="background:var(--steel-1);border:1px solid var(--line);border-radius:6px;padding:16px;margin-top:14px;">'+
        '<div style="font-weight:700;margin-bottom:12px;color:var(--ink);font-family:Cinzel,serif;font-size:14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(201,164,92,0.2);padding-bottom:6px;">'+
          '<span>Анкета шиноби: <b style="color:var(--brass);">' + esc(activeCharDisplay) + '</b></span>'+
          '<span style="font-size:11px;color:var(--ink-dim);">' + esc(m.village || 'Коноха') + '</span>'+
        '</div>'+

        '<div class="sh-hud-edit-grid">'+
          '<div class="sh-hud-edit-item">'+
            '<label>Имя шиноби</label>'+
            '<input type="text" id="shDataInCharName" value="'+escA(m.charName||'')+'" placeholder="Например: Саске / Кураями">'+
          '</div>'+
          '<div class="sh-hud-edit-item">'+
            '<label>Клан</label>'+
            '<input type="text" id="shDataInClan" value="'+escA(m.clan||'')+'" placeholder="Например: Учиха / Кураями">'+
          '</div>'+
          '<div class="sh-hud-edit-item">'+
            '<label>Деревня</label>'+
            '<input type="text" id="shDataInVillage" value="'+escA(m.village||'Коноха')+'" placeholder="Коноха">'+
          '</div>'+
          '<div class="sh-hud-edit-item">'+
            '<label>Ранг</label>'+
            '<select id="shDataInRank">'+rankOptions+'</select>'+
          '</div>'+
          '<div class="sh-hud-edit-item">'+
            '<label>Уровень</label>'+
            '<input type="number" min="1" max="100" id="shDataInLevel" value="'+escA(m.level!=null&&m.level!==''?m.level:'1')+'" placeholder="1">'+
          '</div>'+
          '<div class="sh-hud-edit-item">'+
            '<label>Стихия</label>'+
            '<select id="shDataInNature">'+natOptions+'</select>'+
          '</div>'+
          '<div class="sh-hud-edit-item">'+
            '<label>Чакра</label>'+
            '<input type="text" id="shDataInChakra" value="'+escA(m.chakra!=null?m.chakra:'30')+'" placeholder="30">'+
          '</div>'+
          '<div class="sh-hud-edit-item">'+
            '<label>Очки здоровья (ОЗ)</label>'+
            '<input type="text" id="shDataInHp" value="'+escA(m.hp!=null?m.hp:'28')+'" placeholder="28">'+
          '</div>'+
          '<div class="sh-hud-edit-item">'+
            '<label>Класс брони (КБ)</label>'+
            '<input type="text" id="shDataInAc" value="'+escA(m.ac!=null?m.ac:'14')+'" placeholder="14">'+
          '</div>'+
        '</div>'+

        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px;">'+
          '<button class="btn btn-primary" id="shDataSaveCharBtn">✓ Сохранить анкету</button>'+
          '<button class="btn" id="shDataResetProfileBtn" title="Очистить поля текущего профиля">🔄 Сбросить статы</button>'+
          '<button class="btn" id="shDataDelProfileBtn" style="color:#ff7675;border-color:rgba(231,76,60,0.4);margin-left:auto;" title="Удалить текущий профиль">🗑️ Удалить профиль</button>'+
        '</div>'+
      '</div>'+
    '</div>'+

    '<div class="sheet-section">'+
      '<div class="section-label">Параметры мира и кампании</div>'+
      fld('Название мира','<input id="shWName" type="text" value="'+escA(SH.meta.name)+'">')+
      fld('Заметка мира','<textarea id="shWNote" rows="3">'+esc(SH.meta.note)+'</textarea>')+
      '<div class="sheet-actions"><button class="btn-primary" id="shWSave">Сохранить мир</button></div>'+
    '</div>'+
    (typeof GHSync !== 'undefined' ? GHSync.renderUI() : '') +

    
'<div class="gh-sync-card" id="shGeminiApiSection" style="margin-top:20px; margin-bottom:20px;">'+
  '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">'+
    '<span style="font-size:20px;">🤖</span>'+
    '<div>'+
      '<div style="font-weight:700;font-size:14px;color:var(--ink, #fff);">Google Gemini AI (Интеграция ИИ)</div>'+
      '<div style="font-size:12px;color:var(--ink-dim, #8bb1d6);">Генерация уникальных миссий и дзюцу</div>'+
    '</div>'+
  '</div>'+
  '<p style="font-size:12px;color:var(--ink-dim, #8bb1d6);margin:0 0 12px 0;">Ключ безопасно хранится <b style="color:var(--brass, #c5a059);">только в браузере этого устройства</b>. Получить бесплатный API-ключ можно за пару минут в <a href="https://aistudio.google.com/" target="_blank" style="color:#f6e58d;text-decoration:underline;">Google AI Studio</a>.</p>'+
  '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">'+
    '<input type="password" id="shDataGeminiKey" value="'+escA(getGeminiApiKey())+'" placeholder="Вставьте ключ AIzaSy..." style="flex:1; min-width:200px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:8px 12px; border-radius:4px; font-family:monospace; font-size:13px;">'+
    '<button class="btn-primary" id="shDataSaveGeminiKey" style="background:linear-gradient(135deg, #c0392b, #8e44ad); border:none; padding:8px 16px; border-radius:4px; color:#fff; font-weight:bold; cursor:pointer;">💾 Сохранить API Ключ</button>'+
  '</div>'+
'</div>'+
  (typeof AppStorage !== 'undefined' ? AppStorage.renderWidget('sh') : '') +
'<div class="sheet-section">'+
      '<div class="section-label">Экспорт и импорт</div>'+
      '<div class="desc">Единый файл на весь режим «Шиноби»: все профили, техники, приёмы, навыки и заметка мира. Импорт заменяет текущее содержимое.</div>'+
      '<div class="sheet-actions">'+
        '<button class="btn-primary" id="shExport">Экспорт в файл</button>'+
        '<button class="btn-ghost" id="shImportBtn">Импорт из файла</button>'+
        '<input type="file" id="shImportFile" accept="application/json,.json" style="display:none">'+
      '</div>'+
    '</div>';
}
SH.shData = shData;

/* ---------- обработчики ---------- */
function wireSh(){
  

  if(HB.mode!=='sh') return;
  if(typeof GHSync !== 'undefined' && GHSync.wireUI) GHSync.wireUI();
  var g=function(id){ return document.getElementById(id); };
  var v=function(id){ var e=g(id); return e?e.value:''; };

  
  function showFade(el){
    if(!el) return;
    el.style.display = 'block';
    el.classList.remove('fade-zoom');
    void el.offsetWidth; // trigger reflow
    el.classList.add('fade-zoom');
  }

  var btnJutsuGen = g('btnJutsuGen');
  if(btnJutsuGen) btnJutsuGen.addEventListener('click', function(){
    var btn = this;
    var k = getGeminiApiKey();
    if(!k) {
      alert("Сначала укажите Gemini API ключ в разделе 'Технологии'");
      return;
    }
    
    var theme = v('jgTheme').trim();
    var cat = v('jgCat');
    var rank = v('jgRank');
    var nature = v('jgNature').trim();
    
    btn.disabled = true;
    btn.textContent = 'Генерация (ждите)...';
    
    callGeminiJutsuGenerator({theme: theme, cat: cat, rank: rank, nature: nature}, k, function(err, result){
      btn.disabled = false;
      btn.textContent = '✨ Сгенерировать технику';
      
      if(err || !result){
        alert('Ошибка генерации: ' + (err || 'Пустой ответ от AI'));
        return;
      }
      
      window._lastGenJutsu = result;
      
      // Save to local history
      try {
        var h = JSON.parse(localStorage.getItem('sh_ai_hist_jutsu')||'[]');
        h.unshift(result);
        if(h.length > 20) h.length = 20;
        localStorage.setItem('sh_ai_hist_jutsu', JSON.stringify(h));
      } catch(e){}
      
      var form = g('jgFormSection');
      var resDiv = g('jgResult');
      var preview = g('jgPreview');
      
      if(form) form.style.display = 'none';
      showFade(resDiv);
      
      if(preview) {
        var dummy = JSON.parse(JSON.stringify(result));
        dummy.id = 'dummy';
        if(dummy.cost && !String(dummy.cost).includes('ОД')) dummy.cost += ' Чакры';
        var cardHtml = renderTechCard(dummy).replace(/data-nav="[^"]+"/, 'style="pointer-events:none;"').replace('class="card', 'class="card preview-card');
        preview.innerHTML = cardHtml;
      }
        
      renderJutsuHistory();
      if(resDiv) resDiv.scrollIntoView({behavior: "smooth"});
    });
  });

  var btnJutsuBack = g('btnJutsuBack');
  if(btnJutsuBack) btnJutsuBack.addEventListener('click', function(){
    var form = g('jgFormSection');
    var resDiv = g('jgResult');
    if(resDiv) resDiv.style.display = 'none';
    showFade(form);
  });

  var btnJutsuRegen = g('btnJutsuRegen');
  if(btnJutsuRegen) btnJutsuRegen.addEventListener('click', function(){
    var btnGen = g('btnJutsuGen');
    var form = g('jgFormSection');
    var resDiv = g('jgResult');
    if(resDiv) resDiv.style.display = 'none';
    showFade(form);
    if(btnGen) btnGen.click();
  });

  var btnJutsuSave = g('btnJutsuSave');
  if(btnJutsuSave) btnJutsuSave.addEventListener('click', function(){
    var jutsu = window._lastGenJutsu;
    if(!jutsu) return;
    var d = newTech();
    d.id = Date.now().toString(36) + Math.random().toString(36).substr(2,5);
    d.name = jutsu.name || '';
    d.rank = jutsu.rank || 'D';
    d.cat = jutsu.cat || 'Ниндзюцу';
    d.nature = jutsu.nature || '';
    d.cost = String(jutsu.cost || '');
    d.req = jutsu.req || '';
    d.desc = jutsu.desc || '';
    d.dmgN = String(jutsu.dmgN || '0');
    if(d.dmgN === '0') d.dmgN = '';
    d.dmgD = jutsu.dmgD || 'd6';
    if(d.dmgD === 'd0') d.dmgD = 'd6';
    d.dmgMod = String(jutsu.dmgMod || '');
    if(d.dmgMod === '0') d.dmgMod = '';
    
    SH.techs.unshift(d);
    saveShinobi();
    nav('shTechView:'+d.id);
  });

  function renderJutsuHistory(){
    var wrap = g('jgHistoryWrap');
    var list = g('jgHistoryList');
    if(!wrap || !list) return;
    try {
      var h = JSON.parse(localStorage.getItem('sh_ai_hist_jutsu')||'[]');
      if(h.length === 0){ wrap.style.display='none'; return; }
      wrap.style.display='block';
      list.innerHTML = h.map(function(item, i){
        return '<div class="card" style="cursor:pointer; margin-bottom:0; display:flex; align-items:center; justify-content:space-between; padding:12px 16px;" onclick="window._loadJutsuHist('+i+')">'+
          '<div style="flex:1;">'+
            '<div class="name" style="font-size:15px; margin-bottom:2px;"><span class="sh-cat-badge">'+esc(item.rank)+'</span> '+esc(item.name)+'</div>'+
            '<div style="font-size:12px; color:var(--ink-dim);">'+esc(item.cat)+' | '+esc(item.nature)+'</div>'+
          '</div>'+
          '<button class="btn-ghost" style="padding:6px 10px; color:var(--ink-dim); border-color:transparent; flex-shrink:0;" onclick="event.stopPropagation(); window._delJutsuHist('+i+')" title="Удалить">🗑️</button>'+
        '</div>';
      }).join('');
    } catch(e){}
  }
  window._loadJutsuHist = function(i){
    try {
      var h = JSON.parse(localStorage.getItem('sh_ai_hist_jutsu')||'[]');
      var item = h[i];
      if(!item) return;
      window._lastGenJutsu = item;
      var form = g('jgFormSection');
      var resDiv = g('jgResult');
      var preview = g('jgPreview');
      if(form) form.style.display = 'none';
      showFade(resDiv);
      if(preview) {
        var dummy = JSON.parse(JSON.stringify(item));
        dummy.id = 'dummy';
        if(dummy.cost && !String(dummy.cost).includes('ОД')) dummy.cost += ' Чакры';
        preview.innerHTML = renderTechCard(dummy).replace(/data-nav="[^"]+"/, 'style="pointer-events:none;"').replace('class="card', 'class="card preview-card');
      }
      window.scrollTo(0,0);
    } catch(e){}
  };

  if(g('btnJutsuGen')) renderJutsuHistory();


  var btnMoveGen = g('btnMoveGen');
  if(btnMoveGen) btnMoveGen.addEventListener('click', function(){
    var btn = this;
    var k = getGeminiApiKey();
    if(!k) {
      alert("Сначала укажите Gemini API ключ в разделе 'Технологии'");
      return;
    }
    
    var theme = v('mgTheme').trim();
    var kind = v('mgKind');
    var mtype = v('mgType');
    var weapon = v('mgWeapon').trim();
    
    btn.disabled = true;
    btn.textContent = 'Генерация (ждите)...';
    
    callGeminiMoveGenerator({theme: theme, kind: kind, mtype: mtype, weapon: weapon}, k, function(err, result){
      btn.disabled = false;
      btn.textContent = '✨ Сгенерировать приём';
      
      if(err || !result){
        alert('Ошибка генерации: ' + (err || 'Пустой ответ от AI'));
        return;
      }
      
      window._lastGenMove = result;
      
      // Save to local history
      try {
        var h = JSON.parse(localStorage.getItem('sh_ai_hist_move')||'[]');
        h.unshift(result);
        if(h.length > 20) h.length = 20;
        localStorage.setItem('sh_ai_hist_move', JSON.stringify(h));
      } catch(e){}
      
      var form = g('mgFormSection');
      var resDiv = g('mgResult');
      var preview = g('mgPreview');
      
      if(form) form.style.display = 'none';
      showFade(resDiv);
      
      if(preview) {
        var st = (result.mtype==='Состояние' && result.state && result.state!=='другое') ? ' • <span style="color:var(--brass);font-weight:600;">'+esc(result.state)+'</span>' : '';
        var payStr = result.pay ? ('Цена: <b>'+esc(result.pay)+'</b>') : '';
        var line = [ (result.mtype||'Урон'), (result.weapon||'Без оружия'), (result.atk||''), payStr ]
                 .filter(function(x){return x;}).join(' • ');
        var details = [];
        if(result.req) details.push('<b>Требования:</b> ' + esc(result.req));
        if(result.dmg) details.push('<b>Урон:</b> ' + esc(result.dmg));
        if(result.def) details.push('<b>Спасбросок:</b> ' + esc(result.def));
        if(result.state) details.push('<b>Эффект:</b> ' + esc(result.state) + (result.dur ? ' (' + esc(result.dur) + ')' : ''));
        if(result.trigger) details.push('<b>Триггер:</b> ' + esc(result.trigger));
        if(result.reach) details.push('<b>Дистанция:</b> ' + esc(result.reach));
        
        var cardHtml = '<div class="card preview-card" style="pointer-events:none;">'+
          '<div class="name" style="font-size:16px; margin-bottom:4px;"><span class="sh-cat-badge">' + esc(result.kind) + '</span> ' + esc(result.name||'Без названия')+st+'</div>'+
          '<div class="desc" style="margin-bottom:8px;">'+line+'</div>'+
          (details.length ? '<div style="font-size:12px; color:var(--ink-dim); margin-bottom:8px; line-height:1.4;">' + details.join('<br>') + '</div>' : '') +
          (result.desc ? '<div style="font-size:13px; color:var(--ink); line-height:1.4; border-top:1px solid var(--line); padding-top:6px; margin-top:6px;">' + esc(result.desc) + '</div>' : '') +
          '</div>';
        preview.innerHTML = cardHtml;
      }
      renderMoveHistory();
      if(resDiv) resDiv.scrollIntoView({behavior: "smooth"});
    });
  });

  var btnMoveBack = g('btnMoveBack');
  if(btnMoveBack) btnMoveBack.addEventListener('click', function(){
    var form = g('mgFormSection');
    var resDiv = g('mgResult');
    if(resDiv) resDiv.style.display = 'none';
    showFade(form);
  });

  var btnMoveRegen = g('btnMoveRegen');
  if(btnMoveRegen) btnMoveRegen.addEventListener('click', function(){
    var btnGen = g('btnMoveGen');
    var form = g('mgFormSection');
    var resDiv = g('mgResult');
    if(resDiv) resDiv.style.display = 'none';
    showFade(form);
    if(btnGen) btnGen.click();
  });

  var btnMoveSave = g('btnMoveSave');
  if(btnMoveSave) btnMoveSave.addEventListener('click', function(){
    var move = window._lastGenMove;
    if(!move) return;
    
    var d = newMove();
    d.id = Date.now().toString(36) + Math.random().toString(36).substr(2,5);
    d.name = move.name || '';
    d.kind = move.kind || 'Рукопашный';
    d.mtype = move.mtype || 'Урон';
    d.weapon = move.weapon || '';
    d.atk = move.atk || '';
    d.dmg = move.dmg || '';
    d.def = move.def || '';
    d.state = move.state || '';
    d.dur = move.dur || '';
    d.trigger = move.trigger || '';
    d.reach = move.reach || '';
    d.pay = move.pay || 'ОД';
    d.req = move.req || '';
    d.desc = move.desc || '';
    
    SH.moves.push(d);
    saveShinobi();
    nav('shMoveView:'+d.id);
  });

  function renderMoveHistory(){
    var wrap = g('mgHistoryWrap');
    var list = g('mgHistoryList');
    if(!wrap || !list) return;
    try {
      var h = JSON.parse(localStorage.getItem('sh_ai_hist_move')||'[]');
      if(h.length === 0){ wrap.style.display='none'; return; }
      wrap.style.display='block';
      list.innerHTML = h.map(function(item, i){
        return '<div class="card" style="cursor:pointer; margin-bottom:0; display:flex; align-items:center; justify-content:space-between; padding:12px 16px;" onclick="window._loadMoveHist('+i+')">'+
          '<div style="flex:1;">'+
            '<div class="name" style="font-size:15px; margin-bottom:2px;"><span class="sh-cat-badge">'+esc(item.kind)+'</span> '+esc(item.name)+'</div>'+
            '<div style="font-size:12px; color:var(--ink-dim);">'+esc(item.mtype||'Урон')+' | '+esc(item.weapon||'Без оружия')+'</div>'+
          '</div>'+
          '<button class="btn-ghost" style="padding:6px 10px; color:var(--ink-dim); border-color:transparent; flex-shrink:0;" onclick="event.stopPropagation(); window._delMoveHist('+i+')" title="Удалить">🗑️</button>'+
        '</div>';
      }).join('');
    } catch(e){}
  }
  window._loadMoveHist = function(i){
    try {
      var h = JSON.parse(localStorage.getItem('sh_ai_hist_move')||'[]');
      var result = h[i];
      if(!result) return;
      window._lastGenMove = result;
      var form = g('mgFormSection');
      var resDiv = g('mgResult');
      var preview = g('mgPreview');
      if(form) form.style.display = 'none';
      showFade(resDiv);
      if(preview) {
        var st = (result.mtype==='Состояние' && result.state && result.state!=='другое') ? ' • <span style="color:var(--brass);font-weight:600;">'+esc(result.state)+'</span>' : '';
        var payStr = result.pay ? ('Цена: <b>'+esc(result.pay)+'</b>') : '';
        var line = [ (result.mtype||'Урон'), (result.weapon||'Без оружия'), (result.atk||''), payStr ]
                 .filter(function(x){return x;}).join(' • ');
        var details = [];
        if(result.req) details.push('<b>Требования:</b> ' + esc(result.req));
        if(result.dmg) details.push('<b>Урон:</b> ' + esc(result.dmg));
        if(result.def) details.push('<b>Спасбросок:</b> ' + esc(result.def));
        if(result.state) details.push('<b>Эффект:</b> ' + esc(result.state) + (result.dur ? ' (' + esc(result.dur) + ')' : ''));
        if(result.trigger) details.push('<b>Триггер:</b> ' + esc(result.trigger));
        if(result.reach) details.push('<b>Дистанция:</b> ' + esc(result.reach));
        
        var cardHtml = '<div class="card preview-card" style="pointer-events:none;">'+
          '<div class="name" style="font-size:16px; margin-bottom:4px;"><span class="sh-cat-badge">' + esc(result.kind) + '</span> ' + esc(result.name||'Без названия')+st+'</div>'+
          '<div class="desc" style="margin-bottom:8px;">'+line+'</div>'+
          (details.length ? '<div style="font-size:12px; color:var(--ink-dim); margin-bottom:8px; line-height:1.4;">' + details.join('<br>') + '</div>' : '') +
          (result.desc ? '<div style="font-size:13px; color:var(--ink); line-height:1.4; border-top:1px solid var(--line); padding-top:6px; margin-top:6px;">' + esc(result.desc) + '</div>' : '') +
          '</div>';
        preview.innerHTML = cardHtml;
      }
      window.scrollTo(0,0);
    } catch(e){}
  };

  if(g('btnMoveGen')) renderMoveHistory();


  // --- SKILLS AI ---
  var btnSkillGen = g('btnSkillGen');
  if(btnSkillGen) btnSkillGen.addEventListener('click', function(){
    var btn = this;
    var k = getGeminiApiKey();
    if(!k) { alert("Сначала укажите Gemini API ключ в разделе 'Технологии'"); return; }
    var theme = v('sgTheme').trim();
    var kind = v('sgKind');
    var level = v('sgLevel');
    btn.disabled = true; btn.textContent = 'Генерация (ждите)...';
    callGeminiSkillGenerator({theme: theme, kind: kind, level: level}, k, function(err, result){
      btn.disabled = false; btn.textContent = '✨ Сгенерировать навык';
      if(err || !result){ alert('Ошибка генерации: ' + (err || 'Пустой ответ от AI')); return; }
      window._lastGenSkill = result;
      try {
        var h = JSON.parse(localStorage.getItem('sh_ai_hist_skill')||'[]');
        h.unshift(result);
        if(h.length > 20) h.length = 20;
        localStorage.setItem('sh_ai_hist_skill', JSON.stringify(h));
      } catch(e){}
      
      var form = g('sgFormSection'), resDiv = g('sgResult'), preview = g('sgPreview');
      if(form) form.style.display = 'none';
      showFade(resDiv);
      if(preview) {
        var cardHtml = '<div class="card preview-card" style="pointer-events:none;">'+
          '<div class="name" style="font-size:16px; margin-bottom:4px;"><span class="sh-cat-badge">' + esc(result.kind) + '</span> ' + esc(result.name||'Без названия')+' <span style="font-weight:normal; font-size:14px; color:var(--brass);">['+esc(result.level)+']</span></div>'+
          '<div class="desc" style="margin-bottom:8px;">Связанная хар-ка: <b>'+esc(result.abil)+'</b></div>'+
          '<div style="font-size:12px; color:var(--ink-dim); margin-bottom:8px; line-height:1.4;">' + 
            (result.src ? '<b>Источник:</b> ' + esc(result.src) + '<br>' : '') +
            (result.gives ? '<b>Сюжетно даёт:</b> ' + esc(result.gives) : '') +
          '</div>' +
          (result.desc ? '<div style="font-size:13px; color:var(--ink); line-height:1.4; border-top:1px solid var(--line); padding-top:6px; margin-top:6px;">' + esc(result.desc) + '</div>' : '') +
          '</div>';
        preview.innerHTML = cardHtml;
      }
      renderSkillHistory();
      if(resDiv) resDiv.scrollIntoView({behavior: "smooth"});
    });
  });

  var btnSkillBack = g('btnSkillBack');
  if(btnSkillBack) btnSkillBack.addEventListener('click', function(){
    if(g('sgFormSection')) showFade(g('sgFormSection'));
    if(g('sgResult')) g('sgResult').style.display = 'none';
  });

  var btnSkillRegen = g('btnSkillRegen');
  if(btnSkillRegen) btnSkillRegen.addEventListener('click', function(){
    if(g('sgFormSection')) showFade(g('sgFormSection'));
    if(g('sgResult')) g('sgResult').style.display = 'none';
    if(g('btnSkillGen')) g('btnSkillGen').click();
  });

  var btnSkillSave = g('btnSkillSave');
  if(btnSkillSave) btnSkillSave.addEventListener('click', function(){
    var skill = window._lastGenSkill;
    if(!skill) return;
    var d = newSkill();
    d.id = Date.now().toString(36) + Math.random().toString(36).substr(2,5);
    d.name = skill.name || '';
    d.kind = skill.kind || 'Ремесло';
    d.level = skill.level || 'Начатки';
    d.abil = skill.abil || '';
    d.src = skill.src || '';
    d.gives = skill.gives || '';
    d.desc = skill.desc || '';
    
    SH.skills = SH.skills || [];
    SH.skills.push(d);
    saveShinobi();
    nav('shSkillView:'+d.id);
  });

  function renderSkillHistory(){
    var wrap = g('sgHistoryWrap'), list = g('sgHistoryList');
    if(!wrap || !list) return;
    try {
      var h = JSON.parse(localStorage.getItem('sh_ai_hist_skill')||'[]');
      if(h.length === 0){ wrap.style.display='none'; return; }
      wrap.style.display='block';
      list.innerHTML = h.map(function(item, i){
        return '<div class="card" style="cursor:pointer; margin-bottom:0; display:flex; align-items:center; justify-content:space-between; padding:12px 16px;" onclick="window._loadSkillHist('+i+')">'+
          '<div style="flex:1;">'+
            '<div class="name" style="font-size:15px; margin-bottom:2px;"><span class="sh-cat-badge">'+esc(item.kind)+'</span> '+esc(item.name)+'</div>'+
            '<div style="font-size:12px; color:var(--ink-dim);">Уровень: '+esc(item.level)+'</div>'+
          '</div>'+
          '<button class="btn-ghost" style="padding:6px 10px; color:var(--ink-dim); border-color:transparent; flex-shrink:0;" onclick="event.stopPropagation(); window._delSkillHist('+i+')" title="Удалить">🗑️</button>'+
        '</div>';
      }).join('');
    } catch(e){}
  }
  
  window._loadSkillHist = function(i){
    try {
      var h = JSON.parse(localStorage.getItem('sh_ai_hist_skill')||'[]');
      var result = h[i];
      if(!result) return;
      window._lastGenSkill = result;
      var form = g('sgFormSection'), resDiv = g('sgResult'), preview = g('sgPreview');
      if(form) form.style.display = 'none';
      showFade(resDiv);
      if(preview) {
        var cardHtml = '<div class="card preview-card" style="pointer-events:none;">'+
          '<div class="name" style="font-size:16px; margin-bottom:4px;"><span class="sh-cat-badge">' + esc(result.kind) + '</span> ' + esc(result.name||'Без названия')+' <span style="font-weight:normal; font-size:14px; color:var(--brass);">['+esc(result.level)+']</span></div>'+
          '<div class="desc" style="margin-bottom:8px;">Связанная хар-ка: <b>'+esc(result.abil)+'</b></div>'+
          '<div style="font-size:12px; color:var(--ink-dim); margin-bottom:8px; line-height:1.4;">' + 
            (result.src ? '<b>Источник:</b> ' + esc(result.src) + '<br>' : '') +
            (result.gives ? '<b>Сюжетно даёт:</b> ' + esc(result.gives) : '') +
          '</div>' +
          (result.desc ? '<div style="font-size:13px; color:var(--ink); line-height:1.4; border-top:1px solid var(--line); padding-top:6px; margin-top:6px;">' + esc(result.desc) + '</div>' : '') +
          '</div>';
        preview.innerHTML = cardHtml;
      }
      window.scrollTo(0,0);
    } catch(e){}
  };

  window._delJutsuHist = function(i){
    var h = JSON.parse(localStorage.getItem('sh_ai_hist_jutsu')||'[]');
    h.splice(i, 1);
    localStorage.setItem('sh_ai_hist_jutsu', JSON.stringify(h));
    renderJutsuHistory();
  };
  window._delMoveHist = function(i){
    var h = JSON.parse(localStorage.getItem('sh_ai_hist_move')||'[]');
    h.splice(i, 1);
    localStorage.setItem('sh_ai_hist_move', JSON.stringify(h));
    renderMoveHistory();
  };
  window._delSkillHist = function(i){
    var h = JSON.parse(localStorage.getItem('sh_ai_hist_skill')||'[]');
    h.splice(i, 1);
    localStorage.setItem('sh_ai_hist_skill', JSON.stringify(h));
    renderSkillHistory();
  };

  if(g('btnSkillGen')) renderSkillHistory();

  var ef=g('shEff');
  if(ef){
    var paintDmg=function(){ var b=g('fTDmg'); if(b) b.hidden = ef.value!=='uron'; };
    ef.addEventListener('change', paintDmg); paintDmg();
  }

  var ts=g('shTechSave');
  if(ts) ts.addEventListener('click', function(){
    var d=SH.draft||newTech();
    d.name=v('shName'); d.rank=v('shRank'); d.cat=v('shCat'); d.origin=v('shOrig');
    d.nature=v('shNature'); d.effect=v('shEff'); d.cost=v('shCost'); d.upkeep=v('shUp');
    d.counter=v('shCnt'); d.req=v('shReq'); d.desc=v('shDesc');
    d.dmgN=v('shDmgN');
    var rawSides = parseInt(String(v('shDmgD')).replace(/\D/g, ''), 10);
    if(isNaN(rawSides) || rawSides < 2) rawSides = 6;
    d.dmgD = 'd' + rawSides;
    d.dmgMod=v('shDmgMod');
    d.isExp=!!(g('shExp') && g('shExp').checked);
    d.windows=[]; document.querySelectorAll('.shWin').forEach(function(c){ if(c.checked) d.windows.push(c.value); });
    if(!d.id){ d.id=uid('t'); SH.techs.push(d); } else { var i=SH.techs.findIndex(function(x){return x.id===d.id;}); if(i>=0) SH.techs[i]=d; }
    saveT(); SH.draft=null; navigate('shTechs');
  });
  var td=g('shTechDel');
  if(td) td.addEventListener('click', function(){
    if(!confirm('Удалить технику?')) return;
    SH.techs=SH.techs.filter(function(x){return x.id!==view.shId;}); saveT(); SH.draft=null; navigate('shTechs');
  });

  var mt=g('shMType');
  if(mt){
    var MAP={atk:'fMAtk',dmg:'fMDmg',def:'fMDef',state:'fMState',dur:'fMDur',trigger:'fMTrigger',reach:'fMReach'};
    var paintMoveFields=function(){
      var want=MOVE_FIELDS[mt.value]||[];
      Object.keys(MAP).forEach(function(k){
        var el=g(MAP[k]); if(el) el.hidden = want.indexOf(k)<0;
      });
    };
    var mk=g('shMKind');
    var paintKind=function(){
      var w=g('fMWeapon');
      if(w) w.hidden = !mk || mk.value==='Рукопашный';
    };
    if(mk) mk.addEventListener('change', paintKind);
    mt.addEventListener('change', paintMoveFields);
    paintMoveFields(); paintKind();
  }

  var ms=g('shMoveSave');
  if(ms) ms.addEventListener('click', function(){
    var d=SH.draft||newMove();
    d.name=v('shMName'); d.kind=v('shMKind'); d.weapon=v('shMWeapon'); d.mtype=v('shMType');
    d.state=v('shMState'); d.atk=v('shMAtk'); d.def=v('shMDef'); d.dmg=v('shMDmg');
    d.trigger=v('shMTrig'); d.reach=v('shMReach');
    d.dur=v('shMDur'); d.pay=v('shMPay'); d.req=v('shMReq'); d.desc=v('shMDesc');
    if(!d.id){ d.id=uid('m'); SH.moves.push(d); } else { var i=SH.moves.findIndex(function(x){return x.id===d.id;}); if(i>=0) SH.moves[i]=d; }
    saveM(); SH.draft=null; navigate('shMoves');
  });
  var delMove=function(){
    if(!confirm('Удалить приём?')) return;
    SH.moves=SH.moves.filter(function(x){return x.id!==view.shId;}); saveM(); SH.draft=null; navigate('shMoves');
  };
  var md=g('shMoveDel'); if(md) md.addEventListener('click', delMove);
  var mdv=g('shMoveDelV'); if(mdv) mdv.addEventListener('click', delMove);

  var ss=g('shSkillSave');
  if(ss) ss.addEventListener('click', function(){
    var d=SH.draft||newSkill();
    d.name=v('shSName'); d.kind=v('shSKind'); d.level=v('shSLvl'); d.abil=v('shSAbil');
    d.mod=v('shSMod'); d.src=v('shSSrc'); d.gives=v('shSGives'); d.desc=v('shSDesc');
    if(!SH.skills) SH.skills=[];
    if(!d.id){ d.id=uid('s'); SH.skills.push(d); } else { var i=SH.skills.findIndex(function(x){return x.id===d.id;}); if(i>=0) SH.skills[i]=d; }
    saveS(); SH.draft=null; navigate('shSkills');
  });
  var delSkill=function(){
    if(!confirm('Удалить навык?')) return;
    SH.skills=(SH.skills||[]).filter(function(x){return x.id!==view.shId;}); saveS(); SH.draft=null; navigate('shSkills');
  };
  var sd=g('shSkillDel'); if(sd) sd.addEventListener('click', delSkill);
  var sdv=g('shSkillDelV'); if(sdv) sdv.addEventListener('click', delSkill);

  var tdv=g('shTechDelV');
  if(tdv) tdv.addEventListener('click', function(){
    if(!confirm('Удалить технику?')) return;
    SH.techs=SH.techs.filter(function(x){return x.id!==view.shId;}); saveT(); SH.draft=null; navigate('shTechs');
  });

  /* фильтры техник и приёмов */
  document.querySelectorAll('[data-tech-cat-filter]').forEach(function(el){
    el.addEventListener('click', function(){
      SH.techCatFilter = el.getAttribute('data-tech-cat-filter');
      navigate('shTechs');
    });
  });
  document.querySelectorAll('[data-tech-filter]').forEach(function(el){
    el.addEventListener('click', function(){
      SH.techFilter = el.getAttribute('data-tech-filter');
      navigate('shTechs');
    });
  });
  var sTechSort = g('shTechSortSelect');
  if(sTechSort){
    sTechSort.addEventListener('change', function(){
      SH.techSort = sTechSort.value;
      try{ localStorage.setItem('sh_tech_sort', SH.techSort); }catch(e){}
      navigate('shTechs');
    });
  }
  document.querySelectorAll('[data-move-filter]').forEach(function(el){
    el.addEventListener('click', function(){
      SH.moveFilter = el.getAttribute('data-move-filter');
      navigate('shMoves');
    });
  });

  /* тактический лаунчер техник */
  var tHead = g('shLauncherToggle');
  if(tHead){
    var toggleLauncher = function(){
      SH.launcher.isOpen = !SH.launcher.isOpen;
      var c = g('shLauncherContainer');
      if(c){
        c.classList.toggle('collapsed', !SH.launcher.isOpen);
        var txt = c.querySelector('.sh-launcher-toggle-text');
        var arr = c.querySelector('.sh-launcher-toggle-arrow');
        if(txt) txt.textContent = SH.launcher.isOpen ? 'Свернуть' : 'Развернуть';
        if(arr) arr.textContent = SH.launcher.isOpen ? '▲' : '▼';
      }
    };
    tHead.addEventListener('click', toggleLauncher);
    tHead.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        toggleLauncher();
      }
    });
  }

  var updateLauncherScreen = function(){
    var scr = g('shLauncherScreen');
    if(!scr) return;
    var t = techById(SH.launcher.techId) || (SH.techs && SH.techs[0]);
    if(!t) return;
    scr.innerHTML = renderLauncherDiceHtml(t, SH.launcher.isExp, SH.launcher.selectedTarget, SH.launcher.mods, SH.launcher.rolledValues);
    wireScreenDiceClicks();
  };

  var updateLauncherModUI = function(){
    var targetNames = { exp: '🌀 Контроль чакры', atk: '🎯 Попадание', dmg: '💥 Урон' };
    var nameEl = g('shModTargetName');
    if(nameEl) nameEl.textContent = targetNames[SH.launcher.selectedTarget] || '🎯 Попадание';

    var valInput = g('shActiveModInput');
    if(valInput){
      var curVal = (SH.launcher.mods && SH.launcher.mods[SH.launcher.selectedTarget]) || 0;
      valInput.value = curVal;
    }
  };

  var wireScreenDiceClicks = function(){
    var scr = g('shLauncherScreen');
    if(!scr) return;
    var selectables = scr.querySelectorAll('[data-select-roll]');
    selectables.forEach(function(el){
      el.addEventListener('click', function(){
        var target = el.getAttribute('data-select-roll');
        if(!target) return;
        SH.launcher.selectedTarget = target;
        selectables.forEach(function(s){ s.classList.remove('selected'); });
        el.classList.add('selected');
        updateLauncherModUI();
      });
    });
  };
  wireScreenDiceClicks();

  var setTargetMod = function(newVal){
    var target = SH.launcher.selectedTarget || 'atk';
    if(!SH.launcher.mods) SH.launcher.mods = { exp: 0, atk: 0, dmg: 0 };
    SH.launcher.mods[target] = newVal;
    updateLauncherModUI();

    var t = techById(SH.launcher.techId) || (SH.techs && SH.techs[0]);
    if(target === 'exp'){
      var sub = g('shScrSub_exp');
      if(sub) sub.textContent = '1d20' + (formatLauncherMod(newVal) ? ' ' + formatLauncherMod(newVal) : '');
    } else if(target === 'atk'){
      var sub = g('shScrSub_atk');
      if(sub) sub.textContent = '1d20' + (formatLauncherMod(newVal) ? ' ' + formatLauncherMod(newVal) : '');
    } else if(target === 'dmg' && t){
      var sub = g('shScrSub_dmg');
      var n = Math.max(1, Math.min(12, parseInt(t.dmgN, 10) || 1));
      var dStr = (t.dmgD || 'd6').replace('d','');
      var dSides = parseInt(dStr, 10) || 6;
      if(sub) sub.textContent = n + 'd' + dSides + (formatLauncherMod(newVal) ? ' ' + formatLauncherMod(newVal) : '');
    }
  };

  document.querySelectorAll('.sh-mod-step').forEach(function(btn){
    btn.addEventListener('click', function(){
      var delta = parseInt(btn.getAttribute('data-mod-delta'), 10) || 0;
      var target = SH.launcher.selectedTarget || 'atk';
      if(!SH.launcher.mods) SH.launcher.mods = { exp: 0, atk: 0, dmg: 0 };
      var cur = parseInt(SH.launcher.mods[target], 10) || 0;
      setTargetMod(cur + delta);
    });
  });

  var modResetBtn = g('shModResetBtn');
  if(modResetBtn){
    modResetBtn.addEventListener('click', function(){
      setTargetMod(0);
    });
  }

  var activeModIn = g('shActiveModInput');
  if(activeModIn){
    activeModIn.addEventListener('input', function(){
      var val = parseInt(activeModIn.value, 10);
      if(isNaN(val)) val = 0;
      var target = SH.launcher.selectedTarget || 'atk';
      if(!SH.launcher.mods) SH.launcher.mods = { exp: 0, atk: 0, dmg: 0 };
      SH.launcher.mods[target] = val;

      var t = techById(SH.launcher.techId) || (SH.techs && SH.techs[0]);
      if(target === 'exp'){
        var sub = g('shScrSub_exp');
        if(sub) sub.textContent = '1d20' + (formatLauncherMod(val) ? ' ' + formatLauncherMod(val) : '');
      } else if(target === 'atk'){
        var sub = g('shScrSub_atk');
        if(sub) sub.textContent = '1d20' + (formatLauncherMod(val) ? ' ' + formatLauncherMod(val) : '');
      } else if(target === 'dmg' && t){
        var sub = g('shScrSub_dmg');
        var n = Math.max(1, Math.min(12, parseInt(t.dmgN, 10) || 1));
        var dStr = (t.dmgD || 'd6').replace('d','');
        var dSides = parseInt(dStr, 10) || 6;
        if(sub) sub.textContent = n + 'd' + dSides + (formatLauncherMod(val) ? ' ' + formatLauncherMod(val) : '');
      }
    });
  }

  var lSel = g('shLauncherSelect');
  if(lSel){
    lSel.addEventListener('change', function(){
      SH.launcher.techId = lSel.value;
      var t = techById(lSel.value);
      if(t){
        SH.launcher.isExp = !!t.isExp;
        var expCb = g('shLauncherExp');
        if(expCb) expCb.checked = SH.launcher.isExp;
        if(t.dmgMod !== undefined){
          if(!SH.launcher.mods) SH.launcher.mods = { exp: 0, atk: 0, dmg: 0 };
          SH.launcher.mods.dmg = parseInt(t.dmgMod, 10) || 0;
        }
      }
      SH.launcher.rolledValues = null;
      SH.launcher.lastResult = '';
      SH.launcher.lastResultCopied = false;
      var rBox = g('shLauncherResultBox');
      if(rBox) rBox.classList.remove('has-result');
      var rTxt = g('shLauncherResultText');
      if(rTxt) rTxt.textContent = '';
      var rBdg = g('shLauncherCopyBadge');
      if(rBdg) rBdg.style.display = 'none';
      updateLauncherScreen();
      updateLauncherModUI();
    });
  }

  var lExp = g('shLauncherExp');
  if(lExp){
    lExp.addEventListener('change', function(){
      SH.launcher.isExp = lExp.checked;
      if(!lExp.checked && SH.launcher.selectedTarget === 'exp'){
        SH.launcher.selectedTarget = 'atk';
      }
      updateLauncherScreen();
      updateLauncherModUI();
    });
  }

  var finishLaunch = function(t, mode, autoCopy){
    var costStr = t.cost ? (t.cost + (t.cost.toLowerCase().indexOf('чакр')>=0 ? '' : ' чакры')) : 'без затрат';
    if(t.upkeep) costStr += ' +' + t.upkeep + '/рнд';
    var header = '*[Техника: '+(t.name||'Без названия')+' | Ранг: '+(t.rank||'D')+' | Затраты: '+costStr+']*';
    var lines = [];

    if(!SH.launcher.rolledValues) SH.launcher.rolledValues = {};
    var isExp = !!SH.launcher.isExp;
    var mods = SH.launcher.mods || { exp: 0, atk: 0, dmg: 0 };

    if(mode === 'claim'){
      lines.push(header);
    } else if(mode === 'atk'){
      var atkVal = 1 + Math.floor(Math.random() * 20);
      SH.launcher.rolledValues.atk = atkVal;
      var atDie = g('shScrDieAtk');
      if(atDie){ var vEl = atDie.querySelector('.val'); if(vEl) vEl.textContent = atkVal; }
      var aMod = parseInt(mods.atk, 10) || 0;
      var aModStr = aMod > 0 ? ' + '+aMod : (aMod < 0 ? ' − '+Math.abs(aMod) : '');
      lines.push(header);
      lines.push('*[Результат броска Попадание 1d20: '+atkVal+' ]*'+aModStr);
    } else if(mode === 'dmg' && t.effect === 'uron'){
      var n = Math.max(1, Math.min(12, parseInt(t.dmgN, 10) || 1));
      var dSides = parseInt((t.dmgD || 'd6').replace('d', ''), 10) || 6;
      var rolls = [];
      for(var i = 0; i < n; i++){
        var r = 1 + Math.floor(Math.random() * dSides);
        rolls.push(r);
        var dmDie = g('shScrDieDmg_'+i);
        if(dmDie){ var vEl = dmDie.querySelector('.val'); if(vEl) vEl.textContent = r; }
      }
      SH.launcher.rolledValues.dmgRolls = rolls;
      SH.launcher.rolledValues.dmgSides = dSides;
      var dMod = parseInt(mods.dmg, 10) || 0;
      var dModStr = dMod > 0 ? ' + '+dMod : (dMod < 0 ? ' − '+Math.abs(dMod) : '');
      lines.push(header);
      lines.push('*[Результат броска Урон '+n+'d'+dSides+': '+rolls.join(' | ')+' ]*'+dModStr);
    } else if(mode === 'exp'){
      var expVal = 1 + Math.floor(Math.random() * 20);
      SH.launcher.rolledValues.exp = expVal;
      var exDie = g('shScrDieExp');
      if(exDie){ var vEl = exDie.querySelector('.val'); if(vEl) vEl.textContent = expVal; }
      var eMod = parseInt(mods.exp, 10) || 0;
      var eModStr = eMod > 0 ? ' + '+eMod : (eMod < 0 ? ' − '+Math.abs(eMod) : '');
      lines.push(header);
      lines.push('*[Результат броска Контроль чакры 1d20: '+expVal+' ]*'+eModStr);
    } else {
      // mode === 'all'
      // 1. Контроль чакры (если эксп.)
      if(isExp){
        var expVal = 1 + Math.floor(Math.random() * 20);
        SH.launcher.rolledValues.exp = expVal;
        var exDie = g('shScrDieExp');
        if(exDie){ var vEl = exDie.querySelector('.val'); if(vEl) vEl.textContent = expVal; }
      }

      // 2. Попадание
      var atkVal = 1 + Math.floor(Math.random() * 20);
      SH.launcher.rolledValues.atk = atkVal;
      var atDie = g('shScrDieAtk');
      if(atDie){ var vEl = atDie.querySelector('.val'); if(vEl) vEl.textContent = atkVal; }

      // 3. Урон
      if(t.effect === 'uron'){
        var n = Math.max(1, Math.min(12, parseInt(t.dmgN, 10) || 1));
        var dSides = parseInt((t.dmgD || 'd6').replace('d', ''), 10) || 6;
        var rolls = [];
        for(var i = 0; i < n; i++){
          var r = 1 + Math.floor(Math.random() * dSides);
          rolls.push(r);
          var dmDie = g('shScrDieDmg_'+i);
          if(dmDie){ var vEl = dmDie.querySelector('.val'); if(vEl) vEl.textContent = r; }
        }
        SH.launcher.rolledValues.dmgRolls = rolls;
        SH.launcher.rolledValues.dmgSides = dSides;
      }

      // buildComboText guarantees: Header -> Chakra Control -> Hit -> Damage
      lines = buildComboText(t, isExp, SH.launcher.rolledValues, mods).split('\n');
    }

    var output = lines.join('\n');
    SH.launcher.lastResult = output;

    var rBox = g('shLauncherResultBox');
    var rTxt = g('shLauncherResultText');
    var rBdg = g('shLauncherCopyBadge');

    if(autoCopy){
      if(typeof copyText === 'function') copyText(output);
      SH.launcher.lastResultCopied = true;
      if(rBdg){
        rBdg.innerHTML = '<span>✓ Скопировано в буфер обмена для AI Studio ('+lines.length+' стр.)</span>';
        rBdg.style.display = 'inline-flex';
      }
    } else {
      SH.launcher.lastResultCopied = false;
      if(rBdg){
        rBdg.innerHTML = '<span>🎲 Бросок зафиксирован. Нажмите «📋 Скопировать всё»</span>';
        rBdg.style.display = 'inline-flex';
      }
    }

    if(rBox && rTxt){
      rBox.classList.add('has-result');
      rTxt.textContent = output;
    }
  };

  var executeLaunch = function(mode, autoCopy){
    var t = techById(SH.launcher.techId) || (SH.techs && SH.techs[0]);
    if(!t) return;
    var isExp = !!SH.launcher.isExp;

    var scr = g('shLauncherScreen');
    if(scr && mode !== 'claim'){
      var diceToRoll = [];
      if(mode==='all' || mode==='atk'){
        var atDie = g('shScrDieAtk'); if(atDie) diceToRoll.push(atDie);
      }
      if((mode==='all' || mode==='dmg') && t.effect==='uron'){
        var n = Math.max(1, Math.min(12, parseInt(t.dmgN, 10) || 1));
        for(var i=0; i<n; i++){
          var dmDie = g('shScrDieDmg_'+i); if(dmDie) diceToRoll.push(dmDie);
        }
      }
      if((mode==='all' || mode==='exp') && isExp){
        var exDie = g('shScrDieExp'); if(exDie) diceToRoll.push(exDie);
      }
      diceToRoll.forEach(function(el){ el.classList.add('rolling'); });

      var rollInterval = setInterval(function(){
        diceToRoll.forEach(function(el){
          var vEl = el.querySelector('.val');
          if(vEl) vEl.textContent = Math.floor(Math.random()*20)+1;
        });
      }, 50);

      setTimeout(function(){
        clearInterval(rollInterval);
        diceToRoll.forEach(function(el){ el.classList.remove('rolling'); });
        finishLaunch(t, mode, autoCopy);
      }, 350);
    } else {
      finishLaunch(t, mode, autoCopy);
    }
  };

  var btnCombo = g('shLaunchComboBtn');
  if(btnCombo) btnCombo.addEventListener('click', function(){ executeLaunch('all', false); });

  var btnCopyAll = g('shCopyAllBtn');
  if(btnCopyAll){
    btnCopyAll.addEventListener('click', function(){
      var t = techById(SH.launcher.techId) || (SH.techs && SH.techs[0]);
      if(!t) return;
      if(!SH.launcher.lastResult){
        executeLaunch('all', true);
      } else {
        if(typeof copyText === 'function') copyText(SH.launcher.lastResult);
        SH.launcher.lastResultCopied = true;
        var rBdg = g('shLauncherCopyBadge');
        if(rBdg){
          var lineCount = SH.launcher.lastResult.split('\n').length;
          rBdg.innerHTML = '<span>✓ Скопировано в буфер обмена для AI Studio ('+lineCount+' стр.)</span>';
          rBdg.style.display = 'inline-flex';
        }
      }
    });
  }

  var btnAtk = g('shLaunchAtkBtn'); if(btnAtk) btnAtk.addEventListener('click', function(){ executeLaunch('atk', true); });
  var btnDmg = g('shLaunchDmgBtn'); if(btnDmg) btnDmg.addEventListener('click', function(){ executeLaunch('dmg', true); });
  var btnExp = g('shLaunchExpBtn'); if(btnExp) btnExp.addEventListener('click', function(){ executeLaunch('exp', true); });
  var btnClaim = g('shLaunchClaimBtn'); if(btnClaim) btnClaim.addEventListener('click', function(){ executeLaunch('claim', true); });

  /* тактический лаунчер приёмов */
  var tMoveHead = g('shMoveLauncherToggle');
  if(tMoveHead){
    var toggleMoveLauncher = function(){
      SH.moveLauncher.isOpen = !SH.moveLauncher.isOpen;
      var c = g('shMoveLauncherContainer');
      if(c){
        c.classList.toggle('collapsed', !SH.moveLauncher.isOpen);
        var txt = c.querySelector('.sh-launcher-toggle-text');
        var arr = c.querySelector('.sh-launcher-toggle-arrow');
        if(txt) txt.textContent = SH.moveLauncher.isOpen ? 'Свернуть' : 'Развернуть';
        if(arr) arr.textContent = SH.moveLauncher.isOpen ? '▲' : '▼';
      }
    };
    tMoveHead.addEventListener('click', toggleMoveLauncher);
    tMoveHead.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        toggleMoveLauncher();
      }
    });
  }

  var updateMoveLauncherScreen = function(){
    var scr = g('shMoveLauncherScreen');
    if(!scr) return;
    var m = moveById(SH.moveLauncher.moveId) || (SH.moves && SH.moves[0]);
    if(!m) return;
    scr.innerHTML = renderMoveLauncherDiceHtml(m, SH.moveLauncher.selectedTarget, SH.moveLauncher.mods, SH.moveLauncher.rolledValues);
    wireMoveScreenDiceClicks();
  };

  var updateMoveLauncherModUI = function(){
    var targetNames = { atk: '🎯 Бросок приёма', dmg: '💥 Урон' };
    var nameEl = g('shMoveModTargetName');
    if(nameEl) nameEl.textContent = targetNames[SH.moveLauncher.selectedTarget] || '🎯 Бросок приёма';

    var valInput = g('shMoveActiveModInput');
    if(valInput){
      var curVal = (SH.moveLauncher.mods && SH.moveLauncher.mods[SH.moveLauncher.selectedTarget]) || 0;
      valInput.value = curVal;
    }
  };

  var wireMoveScreenDiceClicks = function(){
    var scr = g('shMoveLauncherScreen');
    if(!scr) return;
    var selectables = scr.querySelectorAll('[data-select-move-roll]');
    selectables.forEach(function(el){
      el.addEventListener('click', function(){
        var target = el.getAttribute('data-select-move-roll');
        if(!target) return;
        SH.moveLauncher.selectedTarget = target;
        selectables.forEach(function(s){ s.classList.remove('selected'); });
        el.classList.add('selected');
        updateMoveLauncherModUI();
      });
    });
  };
  wireMoveScreenDiceClicks();

  var setMoveTargetMod = function(newVal){
    var target = SH.moveLauncher.selectedTarget || 'atk';
    if(!SH.moveLauncher.mods) SH.moveLauncher.mods = { atk: 0, dmg: 0 };
    SH.moveLauncher.mods[target] = newVal;
    updateMoveLauncherModUI();

    var m = moveById(SH.moveLauncher.moveId) || (SH.moves && SH.moves[0]);
    if(target === 'atk'){
      var sub = g('shScrSub_moveAtk');
      if(sub) sub.textContent = '1d20' + (formatLauncherMod(newVal) ? ' ' + formatLauncherMod(newVal) : '');
    } else if(target === 'dmg' && m){
      var pDmg = parseMoveDmg(m.dmg);
      if(pDmg){
        var sub = g('shScrSub_moveDmg');
        var totMod = newVal + (pDmg.mod || 0);
        if(sub) sub.textContent = pDmg.n + 'd' + pDmg.sides + (formatLauncherMod(totMod) ? ' ' + formatLauncherMod(totMod) : '');
      }
    }
    if(SH.moveLauncher.lastResult && SH.moveLauncher.rolledValues && SH.moveLauncher.rolledValues.atk && m){
      SH.moveLauncher.lastResult = buildMoveComboText(m, SH.moveLauncher.rolledValues, SH.moveLauncher.mods);
      var rTxt = g('shMoveLauncherResultText');
      if(rTxt) rTxt.textContent = SH.moveLauncher.lastResult;
    }
  };

  document.querySelectorAll('[data-move-mod-delta]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var delta = parseInt(btn.getAttribute('data-move-mod-delta'), 10) || 0;
      var cur = (SH.moveLauncher.mods && SH.moveLauncher.mods[SH.moveLauncher.selectedTarget]) || 0;
      setMoveTargetMod(cur + delta);
    });
  });

  var moveModInput = g('shMoveActiveModInput');
  if(moveModInput){
    moveModInput.addEventListener('input', function(){
      var val = parseInt(moveModInput.value, 10);
      if(isNaN(val)) val = 0;
      var target = SH.moveLauncher.selectedTarget || 'atk';
      if(!SH.moveLauncher.mods) SH.moveLauncher.mods = { atk: 0, dmg: 0 };
      SH.moveLauncher.mods[target] = val;

      var m = moveById(SH.moveLauncher.moveId) || (SH.moves && SH.moves[0]);
      if(target === 'atk'){
        var sub = g('shScrSub_moveAtk');
        if(sub) sub.textContent = '1d20' + (formatLauncherMod(val) ? ' ' + formatLauncherMod(val) : '');
      } else if(target === 'dmg' && m){
        var pDmg = parseMoveDmg(m.dmg);
        if(pDmg){
          var sub = g('shScrSub_moveDmg');
          var totMod = val + (pDmg.mod || 0);
          if(sub) sub.textContent = pDmg.n + 'd' + pDmg.sides + (formatLauncherMod(totMod) ? ' ' + formatLauncherMod(totMod) : '');
        }
      }
      if(SH.moveLauncher.lastResult && SH.moveLauncher.rolledValues && SH.moveLauncher.rolledValues.atk && m){
        SH.moveLauncher.lastResult = buildMoveComboText(m, SH.moveLauncher.rolledValues, SH.moveLauncher.mods);
        var rTxt = g('shMoveLauncherResultText');
        if(rTxt) rTxt.textContent = SH.moveLauncher.lastResult;
      }
    });
  }

  var moveResetBtn = g('shMoveModResetBtn');
  if(moveResetBtn){
    moveResetBtn.addEventListener('click', function(){
      setMoveTargetMod(0);
    });
  }

  var moveSel = g('shMoveLauncherSelect');
  if(moveSel){
    moveSel.addEventListener('change', function(){
      SH.moveLauncher.moveId = this.value;
      var m = moveById(this.value);
      var pDmg = parseMoveDmg(m ? m.dmg : '');
      if(pDmg){
        SH.moveLauncher.mods.dmg = pDmg.mod || 0;
      } else {
        SH.moveLauncher.mods.dmg = 0;
        if(SH.moveLauncher.selectedTarget === 'dmg') SH.moveLauncher.selectedTarget = 'atk';
      }
      SH.moveLauncher.rolledValues = {};
      SH.moveLauncher.lastResult = '';
      SH.moveLauncher.lastResultCopied = false;
      var rBox = g('shMoveLauncherResultBox');
      if(rBox) rBox.classList.remove('has-result');
      var rBdg = g('shMoveLauncherCopyBadge');
      if(rBdg) rBdg.style.display = 'none';
      updateMoveLauncherScreen();
      updateMoveLauncherModUI();
    });
  }

  var finishMoveLaunch = function(m, mode, autoCopy){
    if(!SH.moveLauncher) SH.moveLauncher = {};
    if(!SH.moveLauncher.rolledValues) SH.moveLauncher.rolledValues = {};
    if(!SH.moveLauncher.mods) SH.moveLauncher.mods = { atk: 0, dmg: 0 };
    var mods = SH.moveLauncher.mods;
    var wpStr = m.weapon ? (' (' + m.weapon + ')') : '';
    var payStr = m.pay ? (' | Оплата: ' + m.pay) : '';
    var header = '*[Приём: ' + (m.name || 'Без названия') + ' | Вид: ' + (m.kind || 'Рукопашный') + wpStr + ' | Тип: ' + (m.mtype || 'Урон') + payStr + ']*';
    var lines = [];

    if(mode === 'claim'){
      lines.push(header);
    } else if(mode === 'atk'){
      var atkVal = 1 + Math.floor(Math.random() * 20);
      SH.moveLauncher.rolledValues.atk = atkVal;
      var atDie = g('shScrDieMoveAtk');
      if(atDie){ var vEl = atDie.querySelector('.val'); if(vEl) vEl.textContent = atkVal; }
      var aMod = parseInt(mods.atk, 10) || 0;
      var aModStr = aMod > 0 ? ' + ' + aMod : (aMod < 0 ? ' − ' + Math.abs(aMod) : '');
      var abilStr = m.atk ? (' (' + m.atk + ')') : '';
      lines.push(header);
      lines.push('*[Результат броска Приём' + abilStr + ' 1d20: ' + atkVal + ' ]*' + aModStr);
    } else if(mode === 'dmg'){
      var pDmg = parseMoveDmg(m.dmg);
      if(pDmg){
        var n = pDmg.n;
        var dSides = pDmg.sides;
        var rolls = [];
        for(var i = 0; i < n; i++){
          var r = 1 + Math.floor(Math.random() * dSides);
          rolls.push(r);
          var dmDie = g('shScrDieMoveDmg_' + i);
          if(dmDie){ var vEl = dmDie.querySelector('.val'); if(vEl) vEl.textContent = r; }
        }
        SH.moveLauncher.rolledValues.dmgRolls = rolls;
        SH.moveLauncher.rolledValues.dmgSides = dSides;
        var dMod = (parseInt(mods.dmg, 10) || 0) + (pDmg.mod || 0);
        var dModStr = dMod > 0 ? ' + ' + dMod : (dMod < 0 ? ' − ' + Math.abs(dMod) : '');
        lines.push(header);
        lines.push('*[Результат броска Урон ' + n + 'd' + dSides + ': ' + rolls.join(' | ') + ' ]*' + dModStr);
      }
    } else { // mode === 'all'
      var atkVal = 1 + Math.floor(Math.random() * 20);
      SH.moveLauncher.rolledValues.atk = atkVal;
      var atDie = g('shScrDieMoveAtk');
      if(atDie){ var vEl = atDie.querySelector('.val'); if(vEl) vEl.textContent = atkVal; }

      var pDmg = parseMoveDmg(m.dmg);
      if(pDmg){
        var n = pDmg.n;
        var dSides = pDmg.sides;
        var rolls = [];
        for(var i = 0; i < n; i++){
          var r = 1 + Math.floor(Math.random() * dSides);
          rolls.push(r);
          var dmDie = g('shScrDieMoveDmg_' + i);
          if(dmDie){ var vEl = dmDie.querySelector('.val'); if(vEl) vEl.textContent = r; }
        }
        SH.moveLauncher.rolledValues.dmgRolls = rolls;
        SH.moveLauncher.rolledValues.dmgSides = dSides;
      }

      lines = buildMoveComboText(m, SH.moveLauncher.rolledValues, mods).split('\n');
    }

    var output = lines.join('\n');
    SH.moveLauncher.lastResult = output;

    var rBox = g('shMoveLauncherResultBox');
    var rTxt = g('shMoveLauncherResultText');
    var rBdg = g('shMoveLauncherCopyBadge');
    if(rTxt) rTxt.textContent = output;
    if(rBox) rBox.classList.add('has-result');

    if(autoCopy){
      if(typeof copyText === 'function') copyText(output);
      SH.moveLauncher.lastResultCopied = true;
      if(rBdg){
        var lineCount = lines.length;
        rBdg.innerHTML = '<span>✓ Скопировано в буфер обмена для AI Studio (' + lineCount + ' стр.)</span>';
        rBdg.style.display = 'inline-flex';
      }
    } else {
      SH.moveLauncher.lastResultCopied = false;
      if(rBdg){
        rBdg.innerHTML = '<span>🎲 Бросок зафиксирован. Нажмите «📋 Скопировать всё»</span>';
        rBdg.style.display = 'inline-flex';
      }
    }
  };

  var executeMoveLaunch = function(mode, autoCopy){
    if(!SH.moveLauncher) SH.moveLauncher = {};
    if(!SH.moveLauncher.rolledValues) SH.moveLauncher.rolledValues = {};
    if(!SH.moveLauncher.mods) SH.moveLauncher.mods = { atk: 0, dmg: 0 };
    var m = moveById(SH.moveLauncher.moveId) || (SH.moves && SH.moves[0]);
    if(!m) return;

    if(mode !== 'claim'){
      var diceToRoll = [];
      if(mode === 'all' || mode === 'atk'){
        var atDie = g('shScrDieMoveAtk'); if(atDie) diceToRoll.push(atDie);
      }
      var pDmg = parseMoveDmg(m.dmg);
      if((mode === 'all' || mode === 'dmg') && pDmg){
        for(var i = 0; i < pDmg.n; i++){
          var dmDie = g('shScrDieMoveDmg_' + i); if(dmDie) diceToRoll.push(dmDie);
        }
      }
      diceToRoll.forEach(function(el){ el.classList.add('rolling'); });

      var rollInterval = setInterval(function(){
        diceToRoll.forEach(function(el){
          var vEl = el.querySelector('.val');
          if(vEl) vEl.textContent = Math.floor(Math.random() * 20) + 1;
        });
      }, 50);

      setTimeout(function(){
        clearInterval(rollInterval);
        diceToRoll.forEach(function(el){ el.classList.remove('rolling'); });
        finishMoveLaunch(m, mode, autoCopy);
      }, 350);
    } else {
      finishMoveLaunch(m, mode, autoCopy);
    }
  };

  var btnMoveCombo = g('shLaunchMoveComboBtn');
  if(btnMoveCombo) btnMoveCombo.addEventListener('click', function(){ executeMoveLaunch('all', false); });

  var btnMoveCopyAll = g('shCopyAllMoveBtn');
  if(btnMoveCopyAll){
    btnMoveCopyAll.addEventListener('click', function(){
      var m = moveById(SH.moveLauncher.moveId) || (SH.moves && SH.moves[0]);
      if(!m) return;
      if(!SH.moveLauncher.lastResult){
        executeMoveLaunch('all', true);
      } else {
        if(typeof copyText === 'function') copyText(SH.moveLauncher.lastResult);
        SH.moveLauncher.lastResultCopied = true;
        var rBdg = g('shMoveLauncherCopyBadge');
        if(rBdg){
          var lineCount = SH.moveLauncher.lastResult.split('\n').length;
          rBdg.innerHTML = '<span>✓ Скопировано в буфер обмена для AI Studio (' + lineCount + ' стр.)</span>';
          rBdg.style.display = 'inline-flex';
        }
      }
    });
  }

  var btnMoveAtk = g('shLaunchMoveAtkBtn'); if(btnMoveAtk) btnMoveAtk.addEventListener('click', function(){ executeMoveLaunch('atk', true); });
  var btnMoveDmg = g('shLaunchMoveDmgBtn'); if(btnMoveDmg) btnMoveDmg.addEventListener('click', function(){ executeMoveLaunch('dmg', true); });
  var btnMoveClaim = g('shLaunchMoveClaimBtn'); if(btnMoveClaim) btnMoveClaim.addEventListener('click', function(){ executeMoveLaunch('claim', true); });


  /* экран кнопок мастера */
  var wireCmdInspector = function(){
    var c = cmdById(SH.selectedCmdId || 'k1');
    var pIn = g('shCmdParamInput');
    var cpBtn = g('shCmdCopyBtn');
    var cpBdg = g('shCmdCopyBadge');
    var pvTxt = g('shCmdPreviewText');
    var rlBtn = g('shCmdRulesToggleBtn');
    var rlBlk = g('shCmdRulesBlock');

    var calcCopyText = function(){
      var param = (pIn ? pIn.value.trim() : '');
      if(c.hasParam && param){
        if(c.id === 'k8'){
          return param.charAt(0) === ':' ? '(к8' + param + ')' : '(к8: ' + param + ')';
        }
        return c.template.replace('{param}', param);
      }
      return c.defaultTemplate || c.template.replace('{param}', '').replace(': }', '}').replace(': ]', ']');
    };

    if(pIn){
      pIn.addEventListener('input', function(){
        SH.cmdParam = pIn.value;
        if(pvTxt) pvTxt.textContent = calcCopyText();
        if(cpBdg) cpBdg.style.display = 'none';
      });
    }

    if(cpBtn){
      cpBtn.addEventListener('click', function(){
        var text = calcCopyText();
        if(typeof copyText === 'function') copyText(text);
        if(cpBdg){
          cpBdg.textContent = '✓ Скопировано в буфер: ' + text;
          cpBdg.style.display = 'inline-flex';
        }
      });
    }

    if(rlBtn && rlBlk){
      rlBtn.addEventListener('click', function(){
        SH.cmdShowRules = !SH.cmdShowRules;
        rlBlk.style.display = SH.cmdShowRules ? 'block' : 'none';
        rlBtn.textContent = SH.cmdShowRules ? '📖 Скрыть подробные правила ▲' : '📖 Подробный свод правил ▼';
      });
    }
  };
  wireCmdInspector();

  document.querySelectorAll('[data-cmd-select]').forEach(function(card){
    card.addEventListener('click', function(){
      var id = card.getAttribute('data-cmd-select');
      if(!id) return;
      SH.selectedCmdId = id;
      SH.cmdParam = '';
      SH.cmdShowRules = false;
      var inspWrap = g('shCmdInspectorWrap');
      if(inspWrap){
        var c = cmdById(id);
        inspWrap.innerHTML = renderCmdInspectorHtml(c);
        wireCmdInspector();
        document.querySelectorAll('[data-cmd-select]').forEach(function(cd){
          var isAct = (cd.getAttribute('data-cmd-select') === id);
          cd.classList.toggle('active', isAct);
          var st = cd.querySelector('.sh-cmd-card-status');
          if(st) st.textContent = isAct ? '● Выбрано' : '';
        });
        inspWrap.scrollIntoView({ behavior:'smooth', block:'nearest' });
      }
    });
  });

  /* Клик по элементу в Мандале Чакры */
  document.querySelectorAll('[data-elem]').forEach(function(el){
    el.addEventListener('click', function(e){
      if(e && e.stopPropagation) e.stopPropagation();
      var ek = (this && this.getAttribute ? this.getAttribute('data-elem') : '') || (e && e.currentTarget && e.currentTarget.getAttribute ? e.currentTarget.getAttribute('data-elem') : '');
      if(ek && CHAKRA_DATA[ek]){
        activeElemKey = ek;
        SH.activeElemKey = ek;
        render();
      }
    });
  });

  /* Фильтры Мандалы Чакры */
  document.querySelectorAll('[data-chakra-filter]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      if(e && e.stopPropagation) e.stopPropagation();
      var f = btn.getAttribute('data-chakra-filter');
      if(f){
        activeChakraFilter = f;
        SH.activeChakraFilter = f;
        render();
      }
    });
  });

  /* Скопировать свойства стихии/слияния в буфер */
  
  /* Быстрый поиск в Справочнике шиноби */
  var refSearchInput = g('shRefSearch');
  if(refSearchInput){
    refSearchInput.addEventListener('input', function(){
      if(typeof SH !== 'undefined') SH.refSearch = refSearchInput.value;
      var query = refSearchInput.value.toLowerCase().trim();
      var blocks = document.querySelectorAll('.sh-ref-group-block');
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
        var cntBadge = block.querySelector('.sh-ref-group-count');
        if(cntBadge) cntBadge.textContent = visibleInBlock;
      });
    });
  }

  /* Скопировать правила раздела справочника */
  var copyRefBtn = g('shCopyRefLoreBtn');
  if(copyRefBtn){
    copyRefBtn.addEventListener('click', function(){
      var rk = copyRefBtn.getAttribute('data-ref-key');
      var r = (typeof REF !== 'undefined' ? REF[rk] : null);
      if(!r) return;
      var lines = ['*[' + (r.icon ? r.icon + ' ' : '') + r.t + ']*'];
      if(r.lead) lines.push(r.lead);
      lines.push('');
      (r.rows || []).forEach(function(rw){
        lines.push('• ' + rw.k + ': ' + rw.v.replace(/\n/g, ' '));
      });
      var text = lines.join('\n');
      if(typeof copyText === 'function') copyText(text);
      copyRefBtn.textContent = '✓ Скопировано в буфер!';
      copyRefBtn.style.background = 'var(--accent-green, #2ecc71)';
      copyRefBtn.style.borderColor = 'var(--accent-green, #2ecc71)';
      setTimeout(function(){
        copyRefBtn.textContent = '📋 Скопировать правила для AI Studio';
        copyRefBtn.style.background = '';
        copyRefBtn.style.borderColor = '';
      }, 2000);
    });
  }

  var copyChakraBtn = g('shBtnCopyChakraLore');
  if(copyChakraBtn){
    copyChakraBtn.addEventListener('click', function(){
      var ck = copyChakraBtn.getAttribute('data-chakra');
      var cur = (typeof CHAKRA_DATA !== 'undefined' ? CHAKRA_DATA[ck] : null);
      if(!cur) return;
      var text = '*[' + cur.name + ']*\n' +
        (cur.formula ? '• Формула: ' + cur.formula + '\n' : '') +
        (cur.role ? '• Боевая роль: ' + cur.role + '\n' : '') +
        (cur.physics ? '• Механика чакры: ' + cur.physics + '\n' : '') +
        (cur.counter ? '• Слабости и контрмеры: ' + cur.counter + '\n' : '') +
        (cur.beatsName ? '• Превосходит: ' + cur.beatsName + ' (' + cur.beatsDesc + ')\n' : '') +
        (cur.weakName ? '• Уступает: ' + cur.weakName + ' (' + cur.weakDesc + ')\n' : '');
      if(typeof copyText === 'function') copyText(text);
      copyChakraBtn.textContent = '✓ Скопировано в буфер!';
      copyChakraBtn.style.background = 'var(--accent-green, #2ecc71)';
      copyChakraBtn.style.borderColor = 'var(--accent-green, #2ecc71)';
      setTimeout(function(){
        copyChakraBtn.textContent = '📋 Скопировать свойства в технику для AI Studio';
        copyChakraBtn.style.background = '';
        copyChakraBtn.style.borderColor = '';
      }, 2000);
    });
  }
  /* Shinobi Data Screen: Character Selection and Management */
  var dataProfSel = g('shDataProfileSelect');
  if(dataProfSel){
    dataProfSel.addEventListener('change', function(){
      if(this.value && this.value !== SH.activeProfileId){
        switchShinobiProfile(this.value);
      }
    });
  }

  var dataNewProfBtn = g('shDataNewProfileBtn');
  if(dataNewProfBtn){
    dataNewProfBtn.addEventListener('click', function(){
      var name = prompt('Введите имя нового шиноби:', 'Новый шиноби');
      if(name === null) return;
      name = name.trim() || 'Новый шиноби';
      createShinobiProfile({ charName: name });
    });
  }

  var dataCloneBtn = g('shDataCloneProfileBtn');
  if(dataCloneBtn){
    dataCloneBtn.addEventListener('click', function(){
      cloneShinobiProfile(SH.activeProfileId);
    });
  }

  var dataResetBtn = g('shDataResetProfileBtn');
  if(dataResetBtn){
    dataResetBtn.addEventListener('click', function(){
      var prof = getActiveProfile();
      var name = (prof && prof.charName) ? ('«' + prof.charName + '»') : 'текущего персонажа';
      if(confirm('Сбросить боевые параметры шиноби ' + name + ' к начальным значениям? Техники и приёмы сохранятся.')){
        resetShinobiProfile(SH.activeProfileId);
      }
    });
  }

  var dataDelBtn = g('shDataDelProfileBtn');
  if(dataDelBtn){
    dataDelBtn.addEventListener('click', function(){
      var prof = getActiveProfile();
      var name = (prof && prof.charName) ? ('«' + prof.charName + '»') : 'текущего персонажа';
      var isLast = (SH.profiles || []).length <= 1;
      var msg = isLast
        ? 'У вас остался единственный профиль. Удаление сбросит его к пустому шаблону. Продолжить?'
        : ('Удалить профиль ' + name + ' со всеми персональными техниками и приёмами?');
      if(confirm(msg)){
        deleteShinobiProfile(SH.activeProfileId);
      }
    });
  }

  var dataSaveCharBtn = g('shDataSaveCharBtn');
  if(dataSaveCharBtn){
    dataSaveCharBtn.addEventListener('click', function(){
      SH.meta.charName = (v('shDataInCharName') || '').trim();
      SH.meta.clan = (v('shDataInClan') || '').trim();
      SH.meta.village = (v('shDataInVillage') || '').trim();
      SH.meta.rank = (v('shDataInRank') || '').trim();
      SH.meta.level = (v('shDataInLevel') || '1').trim();
      SH.meta.nature = (v('shDataInNature') || '').trim();
      SH.meta.chakra = (v('shDataInChakra') || '').trim();
      SH.meta.hp = (v('shDataInHp') || '').trim();
      SH.meta.ac = (v('shDataInAc') || '').trim();

      saveMeta();
      if(typeof updateShinobiTheme === 'function') updateShinobiTheme();
      paintShBar();
      render();
    });
  }

  var ws=g('shWSave');
  if(ws) ws.addEventListener('click', function(){ SH.meta.name=v('shWName'); SH.meta.note=v('shWNote'); saveMeta(); paintShBar(); navigate('home'); });

  if(typeof AppStorage !== 'undefined' && AppStorage.wireWidget){
    AppStorage.wireWidget('sh');
  }

  var saveGeminiBtn = g('shDataSaveGeminiKey');
  if(saveGeminiBtn && !saveGeminiBtn.__wired){
    saveGeminiBtn.__wired = true;
    saveGeminiBtn.addEventListener('click', function(){
      var inp = g('shDataGeminiKey');
      var k = inp ? inp.value.trim() : '';
      saveGeminiApiKey(k);
      alert(k ? '✓ API-ключ Gemini успешно сохранён!' : 'API-ключ удалён.');
    });
  }

  var ex=g('shExport');
  if(ex) ex.addEventListener('click', function(){
    syncActiveProfileFromState();
    var exportPayload = {
      kind: 'shinobi',
      version: 2,
      meta: SH.meta,
      profiles: SH.profiles,
      activeProfileId: SH.activeProfileId,
      techs: SH.techs,
      moves: SH.moves,
      skills: SH.skills || []
    };
    var blob=new Blob([JSON.stringify(exportPayload,null,2)],{type:'application/json'});
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=(SH.meta.name||'shinobi').replace(/[^\wа-яА-ЯёЁ\- ]/g,'')+'.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(a.href); },600);
  });
  var ib=g('shImportBtn'), ifl=g('shImportFile');
  if(ib&&ifl){
    ib.addEventListener('click', function(){ ifl.click(); });
    ifl.addEventListener('change', function(){
      var f=ifl.files&&ifl.files[0]; if(!f) return;
      var fr=new FileReader();
      fr.onload=function(){
        try{
          var data=JSON.parse(fr.result);
          if(!data || (!Array.isArray(data.techs) && !Array.isArray(data.moves) && !Array.isArray(data.skills) && !Array.isArray(data.profiles))) throw 0;
          if(!confirm('Заменить содержимое режима «Шиноби» содержимым файла?')) return;
          if(Array.isArray(data.profiles) && data.profiles.length > 0){
            SH.profiles = data.profiles;
            SH.activeProfileId = data.activeProfileId || data.profiles[0].id;
            saveProfilesList(SH.profiles);
            saveActiveProfileId(SH.activeProfileId);
            var actP = getActiveProfile();
            applyProfileToState(actP);
          } else {
            SH.techs=Array.isArray(data.techs)?data.techs:[];
            SH.moves=Array.isArray(data.moves)?data.moves:[];
            SH.skills=Array.isArray(data.skills)?data.skills:[];
            SH.meta=Object.assign({}, DEFAULT_META, data.meta||{});
            saveT(); saveM(); saveS(); saveMeta();
          }
          paintShBar(); render();
        }catch(e){ alert('Не удалось прочитать файл.'); }
      };
      fr.readAsText(f);
    });
  }
  // Map pan, zoom, selection & inspector interactions
  var vp = g('shMapViewport');
  var svg = g('shMapSvg');
  if(vp && svg){
    if(!SH.map) SH.map = { zoom: 1, cx: 512, cy: 341, panX: 0, panY: 0, selectedId: 'fire', filter: 'all', search: '', showVillages: true, showLabels: true,  overlayOpacity: 0.45 };
    var isDragging = false;
    var hasMoved = false;
    var startX = 0, startY = 0;
    var startCx = 512, startCy = 341;

    var updateViewBox = function(){
      var s = g('shMapSvg');
      if(!s) return;
      var z = Math.min(4.0, Math.max(1.0, SH.map.zoom || 1));
      var vbW = 1024 / z;
      var vbH = 682 / z;
      if(z <= 1.001){
        SH.map.cx = 512;
        SH.map.cy = 341;
      }
      var minX = (SH.map.cx || 512) - vbW / 2;
      var minY = (SH.map.cy || 341) - vbH / 2;
      minX = Math.max(0, Math.min(1024 - vbW, minX));
      minY = Math.max(0, Math.min(682 - vbH, minY));
      SH.map.cx = minX + vbW / 2;
      SH.map.cy = minY + vbH / 2;
      s.setAttribute('viewBox', minX.toFixed(2) + ' ' + minY.toFixed(2) + ' ' + vbW.toFixed(2) + ' ' + vbH.toFixed(2));
    };

    updateViewBox();

    vp.onmousedown = function(e){
      if(e.button !== 0 && e.button !== 1 && e.button !== 2) return;
      isDragging = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      startCx = SH.map.cx || 512;
      startCy = SH.map.cy || 341;
      vp.classList.add('grabbing');
    };

    var onMouseMove = function(e){
      if(!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if(Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved = true;
      var z = Math.min(4.0, Math.max(1.0, SH.map.zoom || 1));
      if(z <= 1.001) return;

      var rect = vp.getBoundingClientRect();
      var vw = rect.width || 800;
      var vh = rect.height || 440;
      var vbW = 1024 / z;
      var vbH = 682 / z;
      var scale = Math.max(vbW / vw, vbH / vh);

      SH.map.cx = startCx - dx * scale;
      SH.map.cy = startCy - dy * scale;
      updateViewBox();
    };

    var onMouseUp = function(){
      if(isDragging){
        isDragging = false;
        vp.classList.remove('grabbing');
      }
    };

    vp.oncontextmenu = function(e){
      if(hasMoved) e.preventDefault();
    };

    if(typeof window.removeEventListener === 'function' && typeof window.addEventListener === 'function'){
      window.removeEventListener('mousemove', window.__shMapMouseMove);
      window.removeEventListener('mouseup', window.__shMapMouseUp);
      window.__shMapMouseMove = onMouseMove;
      window.__shMapMouseUp = onMouseUp;
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    var zoomTo = function(targetZoom, pivotX, pivotY){
      var oldZoom = SH.map.zoom || 1;
      var newZoom = Math.min(4.0, Math.max(1.0, targetZoom));
      if(Math.abs(newZoom - oldZoom) < 0.001) return;

      if(typeof pivotX === 'number' && typeof pivotY === 'number'){
        var oldCx = SH.map.cx || 512;
        var oldCy = SH.map.cy || 341;
        SH.map.cx = pivotX - (pivotX - oldCx) * (oldZoom / newZoom);
        SH.map.cy = pivotY - (pivotY - oldCy) * (oldZoom / newZoom);
      }
      SH.map.zoom = newZoom;
      if(newZoom <= 1.001){
        SH.map.cx = 512;
        SH.map.cy = 341;
      }
      updateViewBox();
    };

    // Wheel zoom inside box
    vp.onwheel = function(e){
      e.preventDefault();
      var rect = vp.getBoundingClientRect();
      var mouseX = e.clientX - rect.left;
      var mouseY = e.clientY - rect.top;
      var z = SH.map.zoom || 1;
      var vbW = 1024 / z;
      var vbH = 682 / z;
      var vw = rect.width || 800;
      var vh = rect.height || 440;
      var scale = Math.max(vbW / vw, vbH / vh);
      var minX = (SH.map.cx || 512) - vbW / 2;
      var minY = (SH.map.cy || 341) - vbH / 2;
      var svgX = minX + mouseX * scale;
      var svgY = minY + mouseY * scale;

      var factor = e.deltaY < 0 ? 1.2 : 0.83;
      zoomTo((SH.map.zoom || 1) * factor, svgX, svgY);
    };

    // Touch support (PWA / Mobile gestures)
    var touchStartDist = 0;
    var touchStartZoom = 1;
    vp.ontouchstart = function(e){
      if(e.touches.length === 1){
        isDragging = true;
        hasMoved = false;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startCx = SH.map.cx || 512;
        startCy = SH.map.cy || 341;
      } else if(e.touches.length === 2){
        isDragging = false;
        touchStartDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        touchStartZoom = SH.map.zoom || 1;
      }
    };

    vp.ontouchmove = function(e){
      if(e.touches.length === 1 && isDragging){
        var dx = e.touches[0].clientX - startX;
        var dy = e.touches[0].clientY - startY;
        if(Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
        var z = Math.min(4.0, Math.max(1.0, SH.map.zoom || 1));
        if(z <= 1.001) return;
        var rect = vp.getBoundingClientRect();
        var scale = Math.max((1024 / z) / (rect.width || 800), (682 / z) / (rect.height || 440));
        SH.map.cx = startCx - dx * scale;
        SH.map.cy = startCy - dy * scale;
        updateViewBox();
      } else if(e.touches.length === 2 && touchStartDist > 0){
        var dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        var scale = dist / touchStartDist;
        zoomTo(touchStartZoom * scale);
      }
    };

    vp.ontouchend = function(e){
      if(e.touches.length === 0){
        isDragging = false;
        touchStartDist = 0;
      }
    };

    // Zoom Buttons
    var btnIn = g('shMapZoomIn');
    var btnOut = g('shMapZoomOut');
    var btnReset = g('shMapZoomReset');
    if(btnIn) btnIn.onclick = function(){
      zoomTo((SH.map.zoom || 1) * 1.25);
    };
    if(btnOut) btnOut.onclick = function(){
      zoomTo((SH.map.zoom || 1) / 1.25);
    };
    if(btnReset) btnReset.onclick = function(){
      SH.map.zoom = 1;
      SH.map.cx = 512;
      SH.map.cy = 341;
      SH.map.panX = 0;
      SH.map.panY = 0;
      updateViewBox();
    };

    var doFocus = function(fx, fy){
      if(isNaN(fx) || isNaN(fy)) return;
      SH.map.zoom = 2.4;
      SH.map.cx = fx;
      SH.map.cy = fy;
      updateViewBox();
    };

    var wireMapInspector = function(){
      var btnMissionsFromHere = g('shBtnCountryMissionBase');
      if(btnMissionsFromHere){
        btnMissionsFromHere.onclick = function(){
          var cid = btnMissionsFromHere.getAttribute('data-country');
          if(cid){
            SH.map.missionOrigin = cid;
            SH.map.mode = 'missions';
            if(typeof render === 'function') render();
            else refreshMapAndInspector();
          }
        };
      }
      var btnCopy = g('shBtnCopyMapLore');
      if(btnCopy){
        btnCopy.onclick = function(){
          var cid = btnCopy.getAttribute('data-country');
          var c = mapCountryById(cid);
          if(!c) return;
          var vStr = c.village ? (' | Скрытая Деревня: ' + c.village.name + ' ' + (c.village.symbol||'')) : '';
          var kgStr = c.kage ? (' | Лидер: ' + c.kage) : '';
          var natStr = c.nature ? (' | Стихия: ' + c.nature) : '';
          var text = '*[География: ' + c.name + (c.kanji ? ' (' + c.kanji + ')' : '') + vStr + kgStr + natStr + ']*\n' +
            (c.clans ? '• Кланы: ' + c.clans + '\n' : '') +
            (c.terrain ? '• Рельеф: ' + c.terrain + '\n' : '') +
            (c.military ? '• Военная организация: ' + c.military + '\n' : '') +
            (c.danger ? '• Режим границы: ' + c.danger + '\n' : '') +
            (c.lore ? '\n' + c.lore : '');
          copyText(text);
          btnCopy.textContent = '✓ Скопировано в буфер!';
          btnCopy.style.background = 'var(--accent-green, #2ecc71)';
          btnCopy.style.borderColor = 'var(--accent-green, #2ecc71)';
          setTimeout(function(){
            btnCopy.textContent = '📋 Скопировать лор в заявку AI Studio';
            btnCopy.style.background = '';
            btnCopy.style.borderColor = '';
          }, 2000);
        };
      }
      var btnFocus = g('shBtnFocusVillage');
      if(btnFocus){
        btnFocus.onclick = function(){
          doFocus(parseFloat(btnFocus.getAttribute('data-focus-x')), parseFloat(btnFocus.getAttribute('data-focus-y')));
        };
      }
      var btnFocus2 = g('shBtnFocusVillage2');
      if(btnFocus2){
        btnFocus2.onclick = function(){
          doFocus(parseFloat(btnFocus2.getAttribute('data-focus-x')), parseFloat(btnFocus2.getAttribute('data-focus-y')));
        };
      }
    };

    var selectCountry = function(cid){
      if(!cid) return;
      SH.map.selectedId = cid;
      var cObj = mapCountryById(cid);
      if(!cObj) return;

      document.querySelectorAll('.sh-country-poly').forEach(function(p){
        var isS = (p.getAttribute('data-country') === cid);
        p.classList.toggle('selected', isS);
        var cur = mapCountryById(p.getAttribute('data-country'));
        if(cur){
          p.setAttribute('fill', isS ? cur.accent : cur.color);
          p.setAttribute('fill-opacity', isS ? '0.95' : '0.45');
          p.setAttribute('stroke', isS ? '#f6e58d' : 'rgba(25, 18, 12, 0.9)');
          p.setAttribute('stroke-width', isS ? '4' : '2');
        }
      });

      document.querySelectorAll('.sh-village-marker').forEach(function(vm){
        var isV = (vm.getAttribute('data-village') === cid);
        vm.classList.toggle('active', isV);
        var dot = vm.querySelector('.sh-village-dot');
        if(dot){
          dot.setAttribute('fill', isV ? '#ffffff' : (cObj.accent || '#e74c3c'));
        }
      });

      var insp = g('shMapInspector');
      if(insp){
        insp.outerHTML = renderMapInspector(cObj);
        wireMapInspector();
      }
    };

    var wireMarkerInspector = function(){
      // Form: Icon selection buttons
      document.querySelectorAll('.sh-marker-icon-btn').forEach(function(btn){
        btn.onclick = function(){
          document.querySelectorAll('.sh-marker-icon-btn').forEach(function(b){
            b.classList.remove('active');
            b.style.borderColor = 'rgba(197,160,89,0.25)';
          });
          btn.classList.add('active');
          btn.style.borderColor = 'var(--brass,#c5a059)';
          var hInp = g('shMarkerActiveIcon');
          if(hInp) hInp.value = btn.getAttribute('data-icon');
        };
      });

      // Form: Color selection buttons
      document.querySelectorAll('.sh-marker-color-btn').forEach(function(btn){
        btn.onclick = function(){
          document.querySelectorAll('.sh-marker-color-btn').forEach(function(b){
            b.classList.remove('active');
            b.style.borderColor = 'rgba(0,0,0,0.4)';
          });
          btn.classList.add('active');
          btn.style.borderColor = '#ffffff';
          var hCol = g('shMarkerActiveColor');
          if(hCol) hCol.value = btn.getAttribute('data-color');
        };
      });

      // Form: Save marker
      var btnSave = g('shBtnSaveMarker');
      if(btnSave){
        btnSave.onclick = function(e){
          e.preventDefault();
          var nameInp = g('shMarkerName');
          var name = nameInp ? nameInp.value.trim() : '';
          if(!name){
            if(nameInp) nameInp.focus();
            return;
          }
          var mId = (g('shMarkerId') && g('shMarkerId').value) || '';
          var icon = (g('shMarkerActiveIcon') && g('shMarkerActiveIcon').value) || '📍';
          var color = (g('shMarkerActiveColor') && g('shMarkerActiveColor').value) || '#e74c3c';
          var notes = (g('shMarkerNotes') && g('shMarkerNotes').value) || '';
          var x = parseFloat((g('shMarkerX') && g('shMarkerX').value) || 512);
          var y = parseFloat((g('shMarkerY') && g('shMarkerY').value) || 341);
          var countryId = (g('shMarkerCountry') && g('shMarkerCountry').value) || null;

          if(mId){
            updateUserMarker(mId, { name: name, icon: icon, color: color, notes: notes });
            SH.map.selectedMarkerId = mId;
          } else {
            var created = addUserMarker({ name: name, icon: icon, color: color, notes: notes, x: x, y: y, countryId: countryId });
            SH.map.selectedMarkerId = created.id;
          }
          SH.map.placingCoords = null;
          SH.map.isEditingMarker = false;
          SH.map.isPlacingMarker = false;
          if(typeof render === 'function') render();
          else refreshMapAndInspector();
        };
      }

      // Form: Cancel
      var cancelFn = function(){
        SH.map.placingCoords = null;
        SH.map.isEditingMarker = false;
        SH.map.isPlacingMarker = false;
        refreshMapAndInspector();
      };
      var btnCancel1 = g('shBtnCancelMarker');
      var btnCancel2 = g('shBtnCancelMarker2');
      if(btnCancel1) btnCancel1.onclick = cancelFn;
      if(btnCancel2) btnCancel2.onclick = cancelFn;

      // Detail: Back to all markers
      var btnBack = g('shBtnBackToMarkersList');
      if(btnBack){
        btnBack.onclick = function(){
          SH.map.selectedMarkerId = null;
          SH.map.isEditingMarker = false;
          SH.map.placingCoords = null;
          refreshMapAndInspector();
        };
      }

      // Detail: Focus marker
      var btnFocus = g('shBtnFocusMarker');
      if(btnFocus){
        btnFocus.onclick = function(){
          doFocus(parseFloat(btnFocus.getAttribute('data-x')), parseFloat(btnFocus.getAttribute('data-y')));
        };
      }

      // Detail: Route to marker
      var btnRoute = g('shBtnRouteToMarker');
      if(btnRoute){
        btnRoute.onclick = function(){
          var mId = btnRoute.getAttribute('data-marker-id');
          var m = getMarkerById(mId);
          if(!m) return;
          SH.map.mode = 'route';
          SH.map.selectedMarkerId = null;
          if(!SH.map.routePoints) SH.map.routePoints = [];
          if(SH.map.routePoints.length >= 6) SH.map.routePoints = [];
          SH.map.routePoints.push({ x: m.x, y: m.y, name: (m.icon || '📍') + ' ' + m.name, type: 'marker' });
          if(typeof render === 'function') render();
          else refreshMapAndInspector();
        };
      }

      // Detail: Edit marker
      var btnEdit = g('shBtnEditMarker');
      if(btnEdit){
        btnEdit.onclick = function(){
          SH.map.isEditingMarker = true;
          refreshMapAndInspector();
        };
      }

      // Detail: Copy marker to AI Studio
      var btnCopyM = g('shBtnCopyMarker');
      if(btnCopyM){
        btnCopyM.onclick = function(){
          var mId = btnCopyM.getAttribute('data-marker-id');
          var m = getMarkerById(mId);
          if(!m) return;
          var curC = m.countryId ? mapCountryById(m.countryId) : findCountryAtPoint({ x: m.x, y: m.y }, SH_MAP_DATA);
          var text = '*[Тактическая метка шиноби: ' + (m.icon || '📍') + ' ' + m.name + ']*\n' +
            '• Координаты на карте: X ' + m.x + ', Y ' + m.y + '\n' +
            '• Регион / Владения: ' + (curC ? (curC.name + (curC.kanji ? ' (' + curC.kanji + ')' : '')) : 'Нейтральные территории') + '\n' +
            (m.notes ? ('• Заметки и тактический лор:\n' + m.notes) : '');
          copyText(text);
          btnCopyM.textContent = '✓ Скопировано!';
          btnCopyM.style.background = 'var(--accent-green, #2ecc71)';
          btnCopyM.style.borderColor = 'var(--accent-green, #2ecc71)';
          setTimeout(function(){
            btnCopyM.textContent = '📋 В AI Studio';
            btnCopyM.style.background = '';
            btnCopyM.style.borderColor = '';
          }, 2000);
        };
      }

      // Detail: Delete marker
      var btnDel = g('shBtnDeleteMarker');
      if(btnDel){
        btnDel.onclick = function(){
          var mId = btnDel.getAttribute('data-marker-id');
          deleteUserMarker(mId);
          SH.map.selectedMarkerId = null;
          SH.map.isEditingMarker = false;
          if(typeof render === 'function') render();
          else refreshMapAndInspector();
        };
      }

      // List Overview: Start placing marker
      var btnStartPlacing = g('shBtnStartPlacingMarker');
      if(btnStartPlacing){
        btnStartPlacing.onclick = function(){
          SH.map.isPlacingMarker = true;
          SH.map.selectedMarkerId = null;
          SH.map.placingCoords = null;
          SH.map.isEditingMarker = false;
          refreshMapAndInspector();
        };
      }

      // List Overview: Clear all markers
      var btnClearAll = g('shBtnClearAllMarkers');
      if(btnClearAll){
        btnClearAll.onclick = function(){
          clearAllUserMarkers();
          SH.map.selectedMarkerId = null;
          SH.map.placingCoords = null;
          SH.map.isEditingMarker = false;
          if(typeof render === 'function') render();
          else refreshMapAndInspector();
        };
      }

      // List Overview: Card click (inspect)
      document.querySelectorAll('[data-inspect-marker]').forEach(function(card){
        card.onclick = function(e){
          if(e.target && e.target.closest('[data-delete-marker-quick]')) return;
          var mId = card.getAttribute('data-inspect-marker');
          SH.map.selectedMarkerId = mId;
          SH.map.isEditingMarker = false;
          SH.map.placingCoords = null;
          refreshMapAndInspector();
        };
      });

      // List Overview: Quick delete
      document.querySelectorAll('[data-delete-marker-quick]').forEach(function(btn){
        btn.onclick = function(e){
          e.stopPropagation();
          var mId = btn.getAttribute('data-delete-marker-quick');
          deleteUserMarker(mId);
          if(SH.map.selectedMarkerId === mId) SH.map.selectedMarkerId = null;
          if(typeof render === 'function') render();
          else refreshMapAndInspector();
        };
      });
    };

    var wireMissionBoard = function(){
      // Filter tabs by rank
      document.querySelectorAll('[data-mission-filter]').forEach(function(pill){
        pill.onclick = function(){
          SH.map.missionsFilter = pill.getAttribute('data-mission-filter');
          if(typeof render === 'function') render();
          else refreshMapAndInspector();
        };
      });

      // Origin village selector
      var selOrigin = g('shMissionOriginSelect');
      if(selOrigin){
        selOrigin.onchange = function(){
          SH.map.missionOrigin = selOrigin.value;
          if(typeof render === 'function') render();
          else refreshMapAndInspector();
        };
      }

      // Generate procedural contract button
      var btnGen = g('shBtnGenerateMission');
      var btnGenEmpty = g('shBtnGenerateMissionEmpty');
      var onGenMission = function(){
        var rank = (SH.map.missionsFilter && SH.map.missionsFilter !== 'all') ? SH.map.missionsFilter : undefined;
        var origin = SH.map.missionOrigin || 'fire';
        var newM = generateProceduralMission({ rank: rank, originCid: origin });
        if(!Array.isArray(SH.map.missions)) SH.map.missions = [];
        SH.map.missions.unshift(newM);
        saveMissions(SH.map.missions);
        if(typeof render === 'function') render();
        else refreshMapAndInspector();
      };
      if(btnGen) btnGen.onclick = onGenMission;
      if(btnGenEmpty) btnGenEmpty.onclick = onGenMission;

      // Toggle API Key box
      var btnToggleApi = g('shBtnToggleApiKeyBox');
      if(btnToggleApi){
        btnToggleApi.onclick = function(){
          SH.map.showApiBox = !SH.map.showApiBox;
          refreshMapAndInspector();
        };
      }

      // Save API key
      var btnSaveKey = g('shBtnSaveApiKey');
      if(btnSaveKey){
        btnSaveKey.onclick = function(){
          var inp = g('shGeminiApiKeyInput');
          if(inp){
            saveGeminiApiKey(inp.value.trim());
            SH.map.showApiBox = false;
            if(typeof render === 'function') render();
            else refreshMapAndInspector();
          }
        };
      }

      // Clear API key
      var btnClearKey = g('shBtnClearApiKey');
      if(btnClearKey){
        btnClearKey.onclick = function(){
          saveGeminiApiKey('');
          if(typeof render === 'function') render();
          else refreshMapAndInspector();
        };
      }

      // Generate with Gemini AI
      var btnGenAi = g('shBtnGenerateAiMission');
      if(btnGenAi){
        btnGenAi.onclick = function(){
          var key = getGeminiApiKey();
          if(!key){
            SH.map.showApiBox = true;
            refreshMapAndInspector();
            var inp = g('shGeminiApiKeyInput');
            if(inp) inp.focus();
            return;
          }
          var rank = (SH.map.missionsFilter && SH.map.missionsFilter !== 'all') ? SH.map.missionsFilter : undefined;
          var origin = SH.map.missionOrigin || 'fire';
          btnGenAi.textContent = '⏳ Генерация сюжета...';
          btnGenAi.disabled = true;
          callGeminiMissionGenerator({ rank: rank, originCid: origin }, key, function(err, mission){
            btnGenAi.disabled = false;
            btnGenAi.textContent = '✨ Сюжет через Gemini AI';
            if(err || !mission){
              alert('Ошибка генерации Gemini AI: ' + (err || 'Не удалось получить ответ') + '\n\nПроверьте API-ключ или используйте кнопку "В AI Studio" для ручной вставки.');
              return;
            }
            if(!Array.isArray(SH.map.missions)) SH.map.missions = [];
            SH.map.missions.unshift(mission);
            saveMissions(SH.map.missions);
            if(typeof render === 'function') render();
            else refreshMapAndInspector();
          });
        };
      }

      // Accept mission (plot route & add tactical marker)
      document.querySelectorAll('[data-accept-mission]').forEach(function(btn){
        btn.onclick = function(){
          var mId = btn.getAttribute('data-accept-mission');
          var m = (SH.map.missions || []).find(function(item){ return item.id === mId; });
          if(!m) return;

          var tCid = m.targetCountryId || m.targetCid || 'fire';
          var oCid = m.originCountryId || m.originCid || SH.map.missionOrigin || 'fire';
          var tPt = m.targetCoords || m.targetPoint || getVillagePoint(tCid);
          var oPt = getVillagePoint(oCid);

          var rankPrefix = '[' + m.rank + '-ранг] ';
          var markerName = rankPrefix + m.title;
          var existingM = (SH.map.userMarkers || []).find(function(u){ return u.name === markerName; });
          if(!existingM){
            addUserMarker({
              name: markerName,
              icon: '🎯',
              desc: m.desc + '\n\nЗаказчик: ' + (m.client ? m.client.name : 'Неизвестный') + '\nНаграда: ' + m.rewardRyo.toLocaleString('ru-RU') + ' рё\nЦели:\n' + (m.objectives || []).map(function(o){ return '• ' + o; }).join('\n'),
              x: tPt.x,
              y: tPt.y,
              countryId: tCid,
              color: '#f1c40f'
            });
          }

          SH.map.routePoints = [
            { x: oPt.x, y: oPt.y, name: m.originVillage || 'Деревня дислокации', countryId: oCid },
            { x: tPt.x, y: tPt.y, name: m.targetName, countryId: tCid }
          ];
          SH.map.encounter = null;
          SH.map.activeMissionId = m.id;
          SH.map.mode = 'route';

          doFocus(tPt.x, tPt.y);
          if(typeof render === 'function') render();
          else refreshMapAndInspector();
        };
      });

      // Copy AI Studio prompt
      document.querySelectorAll('[data-copy-mission-ai]').forEach(function(btn){
        btn.onclick = function(){
          var mId = btn.getAttribute('data-copy-mission-ai');
          var m = (SH.map.missions || []).find(function(item){ return item.id === mId; });
          if(!m) return;

          var rConf = SH_MISSION_RANKS[m.rank] || SH_MISSION_RANKS.C;
          var objStr = (m.objectives || []).map(function(o){ return '  • ' + o; }).join('\n');
          var checksList = (m.checks && m.checks.length) ? m.checks : ((m.skillChecks || []).map(function(c){ return (typeof c === 'string') ? c : (c.skill + ' (DC ' + c.dc + '): ' + c.purpose); }));
          var checksStr = checksList.map(function(c){ return '  • ' + c; }).join('\n');
          var quoteStr = m.aiDialogue || m.dialogue || '';
          var combatStr = m.aiCombat || m.combatRating || '';

          var text = '*[Заявка на миссию шиноби для Google AI Studio / Gemini]*\n' +
            '• Ранг: ' + m.rank + ' (' + (m.rankTitle || rConf.name) + ', Рекомендуемый уровень: ' + (m.partyLevel || m.recommendedLevel || rConf.level) + ')\n' +
            '• Название: ' + m.title + '\n' +
            '• Заказчик: ' + (m.client ? (m.client.name + ' [' + m.client.title + ']') : 'Неизвестный') + '\n' +
            '• Дислокация: ' + m.originVillage + ' ➔ ' + m.targetName + '\n' +
            '• Награда: ' + m.rewardRyo.toLocaleString('ru-RU') + ' рё\n' +
            '• Брифинг: ' + m.desc + '\n' +
            (quoteStr ? ('• Прямая речь: "' + quoteStr + '"\n') : '') +
            '• Задачи миссии:\n' + objStr + '\n' +
            (checksStr ? ('• Проверки характеристик (D&D 2024):\n' + checksStr + '\n') : '') +
            (combatStr ? ('• Угроза столкновения: ' + combatStr + '\n') : '') +
            '• Секретный твист для Мастера (DM Twist): ' + m.dmSpoiler + '\n\n' +
            'ИНСТРУКЦИЯ ДЛЯ МОДЕЛИ:\n' +
            'Выступи в роли ведущего D&D 2024 по сеттингу Наруто. Подробно распиши сценарий миссии из 3 сцен (Выход из деревни и дорога, кульминация у цели, возвращение/неожиданный поворот). Укажи диалоги NPC, тактику врагов и награду свитками.';

          copyText(text);
          btn.textContent = '✓ Скопировано!';
          btn.style.background = 'var(--accent-green, #2ecc71)';
          btn.style.borderColor = 'var(--accent-green, #2ecc71)';
          setTimeout(function(){
            btn.textContent = '📋 В AI Studio';
            btn.style.background = '';
            btn.style.borderColor = '';
          }, 2000);
        };
      });

      // Delete mission
      document.querySelectorAll('[data-delete-mission]').forEach(function(btn){
        btn.onclick = function(){
          var mId = btn.getAttribute('data-delete-mission');
          if(!mId) return;
          SH.map.missions = (SH.map.missions || []).filter(function(item){ return item.id !== mId; });
          saveMissions(SH.map.missions);
          if(typeof render === 'function') render();
          else refreshMapAndInspector();
        };
      });
    };

    var refreshMapAndInspector = function(){
      var s = g('shMapSvgWrap');
      if(s){
        s.innerHTML = renderShinobiMapSvg(SH_MAP_DATA, SH.map.selectedId, SH.map.showVillages, SH.map.showLabels);
        bindMapSvgElements();
      }
      var insp = g('shMapInspector');
      if(insp){
        if(SH.map.mode === 'route'){
          insp.outerHTML = renderRouteInspector(SH.map.routePoints, SH_MAP_DATA, SH.map.encounter);
          wireRouteInspector();
        } else if(SH.map.mode === 'missions'){
          insp.outerHTML = renderMissionBoard(SH.map.missions, SH.map.missionsFilter, SH.map.missionOrigin, SH.map.showApiBox);
          wireMissionBoard();
        } else if(SH.map.mode === 'markers' || SH.map.selectedMarkerId || SH.map.placingCoords || SH.map.isEditingMarker){
          var selMarker = SH.map.selectedMarkerId ? getMarkerById(SH.map.selectedMarkerId) : null;
          insp.outerHTML = renderMarkerInspector(selMarker, SH.map.userMarkers, SH.map.isEditingMarker, SH.map.placingCoords);
          wireMarkerInspector();
        } else {
          var curC = mapCountryById(SH.map.selectedId) || SH_MAP_DATA[0];
          insp.outerHTML = renderMapInspector(curC);
          wireMapInspector();
        }
      }
    };

    var getSvgPoint = function(e, svgEl){
      if(svgEl && typeof svgEl.createSVGPoint === 'function' && typeof svgEl.getScreenCTM === 'function'){
        try{
          var pt = svgEl.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          var ctm = svgEl.getScreenCTM();
          if(ctm){
            var inv = ctm.inverse();
            var sp = pt.matrixTransform(inv);
            if(!isNaN(sp.x) && !isNaN(sp.y)) return { x: sp.x, y: sp.y };
          }
        }catch(err){}
      }
      var vport = g('shMapViewport');
      var rect = (svgEl || vport || document.body).getBoundingClientRect();
      var z = Math.min(4.0, Math.max(1.0, (SH.map && SH.map.zoom) || 1));
      var vbW = 1024 / z;
      var vbH = 682 / z;
      var minX = Math.max(0, Math.min(1024 - vbW, ((SH.map && SH.map.cx) || 512) - vbW / 2));
      var minY = Math.max(0, Math.min(682 - vbH, ((SH.map && SH.map.cy) || 341) - vbH / 2));
      var rx = rect.width ? ((e.clientX - rect.left) / rect.width) : 0.5;
      var ry = rect.height ? ((e.clientY - rect.top) / rect.height) : 0.5;
      return {
        x: Math.max(0, Math.min(1024, minX + rx * vbW)),
        y: Math.max(0, Math.min(682, minY + ry * vbH))
      };
    };

    var addRoutePoint = function(pt){
      if(!SH.map.routePoints) SH.map.routePoints = [];
      if(SH.map.routePoints.length >= 6){
        SH.map.routePoints = [pt];
      } else {
        SH.map.routePoints.push(pt);
      }
      refreshMapAndInspector();
    };

    var bindMapSvgElements = function(){
      var isRoute = (SH.map && SH.map.mode === 'route');
      var isMarkers = (SH.map && SH.map.mode === 'markers');
      var isPlacing = (SH.map && SH.map.isPlacingMarker);

      document.querySelectorAll('.sh-country-poly[data-country]').forEach(function(poly){
        var cid = poly.getAttribute('data-country');
        if(isRoute || isMarkers || isPlacing){
          poly.style.pointerEvents = 'none';
          poly.onmouseenter = null;
          poly.onmouseleave = null;
          poly.onclick = null;
        } else {
          poly.style.pointerEvents = '';
          poly.onmouseenter = function(){
            document.querySelectorAll('.sh-country-poly[data-country="'+cid+'"]').forEach(function(p){
              p.classList.add('hover');
            });
          };
          poly.onmouseleave = function(){
            document.querySelectorAll('.sh-country-poly[data-country="'+cid+'"]').forEach(function(p){
              p.classList.remove('hover');
            });
          };
          poly.onclick = function(e){
            if(hasMoved) return;
            selectCountry(cid);
          };
        }
      });

      document.querySelectorAll('[data-village]').forEach(function(el){
        el.onclick = function(e){
          e.stopPropagation();
          if(hasMoved) return;
          var cid = el.getAttribute('data-village');
          var c = mapCountryById(cid);
          if(!c || !c.village) return;
          if(SH.map && SH.map.mode === 'route'){
            addRoutePoint({ x: c.village.x, y: c.village.y, name: c.village.name, countryId: c.id });
          } else if(SH.map && (SH.map.mode === 'markers' || SH.map.isPlacingMarker)){
            SH.map.placingCoords = { x: c.village.x, y: c.village.y, countryId: c.id };
            SH.map.selectedMarkerId = null;
            SH.map.isEditingMarker = true;
            SH.map.isPlacingMarker = false;
            refreshMapAndInspector();
          } else {
            selectCountry(cid);
          }
        };
      });

      document.querySelectorAll('[data-user-marker]').forEach(function(el){
        el.onclick = function(e){
          e.stopPropagation();
          if(hasMoved) return;
          var mId = el.getAttribute('data-user-marker');
          var m = getMarkerById(mId);
          if(!m) return;
          if(SH.map && SH.map.mode === 'route'){
            addRoutePoint({ x: m.x, y: m.y, name: (m.icon || '📍') + ' ' + m.name, type: 'marker' });
          } else {
            SH.map.selectedMarkerId = mId;
            SH.map.mode = 'markers';
            SH.map.isPlacingMarker = false;
            SH.map.placingCoords = null;
            SH.map.isEditingMarker = false;
            refreshMapAndInspector();
          }
        };
      });

      var sSvg = g('shMapSvg');
      if(sSvg){
        sSvg.onclick = function(e){
          if(hasMoved) return;
          if(!SH.map) return;
          if(e.target && (e.target.closest('[data-village]') || e.target.closest('[data-user-marker]') || e.target.classList.contains('sh-route-pt') || e.target.closest('.sh-user-marker'))) return;
          var pt = getSvgPoint(e, sSvg);

          if(SH.map.mode === 'route'){
            var snapped = snapToVillage(pt, SH_MAP_DATA, 18);
            if(snapped){
              addRoutePoint(snapped);
            } else {
              var c = findCountryAtPoint(pt, SH_MAP_DATA);
              var name = c ? (c.name + ' (Тракт)') : ('Точка (' + Math.round(pt.x) + ', ' + Math.round(pt.y) + ')');
              addRoutePoint({ x: Math.round(pt.x), y: Math.round(pt.y), name: name, countryId: c ? c.id : null });
            }
          } else if(SH.map.mode === 'markers' || SH.map.isPlacingMarker){
            var c = findCountryAtPoint(pt, SH_MAP_DATA);
            SH.map.placingCoords = { x: Math.round(pt.x), y: Math.round(pt.y), countryId: c ? c.id : null };
            SH.map.selectedMarkerId = null;
            SH.map.isEditingMarker = true;
            SH.map.isPlacingMarker = false;
            refreshMapAndInspector();
          }
        };
      }
    };

    var wireRouteInspector = function(){
      var btnClear = g('shBtnClearRoute');
      if(btnClear){
        btnClear.onclick = function(){
          SH.map.routePoints = [];
          SH.map.encounter = null;
          var sel = g('shRoutePreset');
          if(sel) sel.value = '';
          refreshMapAndInspector();
        };
      }
      var btnRoll = g('shBtnRollEncounter');
      if(btnRoll){
        btnRoll.onclick = function(){
          var d = Math.floor(Math.random() * 20) + 1;
          SH.map.encounter = SH_TRAVEL_ENCOUNTERS[d - 1] || SH_TRAVEL_ENCOUNTERS[0];
          refreshMapAndInspector();
        };
      }
      var btnCopy = g('shBtnCopyRoute');
      if(btnCopy){
        btnCopy.onclick = function(){
          if(!SH.map.routePoints || SH.map.routePoints.length < 2) return;
          var prof = calcRouteTerrainProfile(SH.map.routePoints, SH_MAP_DATA);
          var crossed = getCrossedCountries(SH.map.routePoints, SH_MAP_DATA);
          var startP = SH.map.routePoints[0];
          var endP = SH.map.routePoints[SH.map.routePoints.length - 1];
          var crossedNames = crossed.map(function(c){ return c.name; }).join(' ➔ ');

          var terrainLines = [];
          for(var tKey in prof.breakdown){
            var b = prof.breakdown[tKey];
            if(b.pct > 0){
              var tCfg = SH_TERRAIN_CONFIG[tKey];
              terrainLines.push(tCfg.icon + ' ' + tCfg.name + ': ' + b.km + ' км (' + b.pct + '%)');
            }
          }

          var warnLines = prof.warnings.map(function(w){
            return '  ⚠️ ' + w.title + ': ' + w.desc;
          }).join('\n');

          var encStr = SH.map.encounter ? ('• Дорожное событие (D20 = ' + SH.map.encounter.roll + '): [' + SH.map.encounter.title + '] - ' + SH.map.encounter.desc + ' (' + SH.map.encounter.effect + ')\n') : '';

          var text = '*[Тактический переход шиноби: ' + startP.name + ' ➔ ' + endP.name + ']*\n' +
            '• Дистанция: ' + prof.totalKm + ' км (' + prof.totalMiles + ' миль, калибровка 1 px = 4.0 км)\n' +
            '• Ландшафтный профиль: ' + terrainLines.join(', ') + '\n' +
            '• Темп шиноби (чакро-спринт с поправкой на рельеф): ' + prof.times.shinobi.str + '\n' +
            '• Пеший шаг (караван / эскорт / повозки): ' + prof.times.walk.str + '\n' +
            '• Верховая езда / Ниндзя-курьер: ' + prof.times.horse.str + '\n' +
            '• Почтовый сокол / экстренная депеша: ' + prof.times.bird.str + '\n' +
            (crossedNames ? ('• Транзитные территории: ' + crossedNames + '\n') : '') +
            (warnLines ? ('• Факторы ландшафта и логистика партии:\n' + warnLines + '\n') : '') +
            encStr;
          copyText(text);
          btnCopy.textContent = '✓ Скопировано в буфер!';
          btnCopy.style.background = 'var(--accent-green, #2ecc71)';
          btnCopy.style.borderColor = 'var(--accent-green, #2ecc71)';
          setTimeout(function(){
            btnCopy.textContent = '📋 Скопировать маршрут в AI Studio';
            btnCopy.style.background = '';
            btnCopy.style.borderColor = '';
          }, 2000);
        };
      }
    };

    bindMapSvgElements();
    if(SH.map && SH.map.mode === 'route') wireRouteInspector();
    else if(SH.map && SH.map.mode === 'missions') wireMissionBoard();
    else if(SH.map && (SH.map.mode === 'markers' || SH.map.selectedMarkerId || SH.map.placingCoords || SH.map.isEditingMarker)) wireMarkerInspector();
    else wireMapInspector();

    // Mode Switcher buttons
    var btnModeInspect = g('shMapModeInspect');
    var btnModeRoute = g('shMapModeRoute');
    var btnModeMarkers = g('shMapModeMarkers');
    var btnModeMissions = g('shMapModeMissions');
    if(btnModeInspect){
      btnModeInspect.onclick = function(){
        if(SH.map.mode === 'inspect') return;
        SH.map.mode = 'inspect';
        SH.map.selectedMarkerId = null;
        SH.map.placingCoords = null;
        SH.map.isEditingMarker = false;
        SH.map.isPlacingMarker = false;
        if(typeof render === 'function') render();
        else refreshMapAndInspector();
      };
    }
    if(btnModeRoute){
      btnModeRoute.onclick = function(){
        if(SH.map.mode === 'route') return;
        SH.map.mode = 'route';
        SH.map.selectedMarkerId = null;
        SH.map.placingCoords = null;
        SH.map.isEditingMarker = false;
        SH.map.isPlacingMarker = false;
        if(typeof render === 'function') render();
        else refreshMapAndInspector();
      };
    }
    if(btnModeMarkers){
      btnModeMarkers.onclick = function(){
        if(SH.map.mode === 'markers' && !SH.map.selectedMarkerId && !SH.map.placingCoords && !SH.map.isEditingMarker) return;
        SH.map.mode = 'markers';
        SH.map.placingCoords = null;
        SH.map.isEditingMarker = false;
        SH.map.isPlacingMarker = false;
        if(typeof render === 'function') render();
        else refreshMapAndInspector();
      };
    }
    if(btnModeMissions){
      btnModeMissions.onclick = function(){
        if(SH.map.mode === 'missions') return;
        SH.map.mode = 'missions';
        SH.map.selectedMarkerId = null;
        SH.map.placingCoords = null;
        SH.map.isEditingMarker = false;
        SH.map.isPlacingMarker = false;
        if(typeof render === 'function') render();
        else refreshMapAndInspector();
      };
    }

    // Missions Toolbar button
    var btnTbGenMission = g('shBtnToolbarGenMission');
    if(btnTbGenMission){
      btnTbGenMission.onclick = function(){
        var rank = (SH.map.missionsFilter && SH.map.missionsFilter !== 'all') ? SH.map.missionsFilter : undefined;
        var origin = SH.map.missionOrigin || 'fire';
        var newM = generateProceduralMission({ rank: rank, originCid: origin });
        if(!Array.isArray(SH.map.missions)) SH.map.missions = [];
        SH.map.missions.unshift(newM);
        saveMissions(SH.map.missions);
        if(typeof render === 'function') render();
        else refreshMapAndInspector();
      };
    }

    // Markers Toolbar buttons
    var btnTbAdd = g('shBtnToolbarAddMarker');
    if(btnTbAdd){
      btnTbAdd.onclick = function(){
        SH.map.mode = 'markers';
        SH.map.isPlacingMarker = true;
        SH.map.selectedMarkerId = null;
        SH.map.placingCoords = null;
        SH.map.isEditingMarker = false;
        refreshMapAndInspector();
      };
    }
    var btnTbClear = g('shBtnToolbarClearMarkers');
    if(btnTbClear){
      btnTbClear.onclick = function(){
        clearAllUserMarkers();
        SH.map.selectedMarkerId = null;
        SH.map.placingCoords = null;
        SH.map.isEditingMarker = false;
        if(typeof render === 'function') render();
        else refreshMapAndInspector();
      };
    }

    // Route preset selector
    var selPreset = g('shRoutePreset');
    if(selPreset){
      selPreset.onchange = function(){
        var val = selPreset.value;
        if(val && SH_ROUTE_PRESETS[val]){
          SH.map.routePoints = JSON.parse(JSON.stringify(SH_ROUTE_PRESETS[val]));
          SH.map.encounter = null;
          refreshMapAndInspector();
        }
      };
    }

    // Clear route top button
    var btnClearTop = g('shBtnClearRouteTop');
    if(btnClearTop){
      btnClearTop.onclick = function(){
        SH.map.routePoints = [];
        SH.map.encounter = null;
        if(selPreset) selPreset.value = '';
        refreshMapAndInspector();
      };
    }

    // Layer toggles
    var tVillages = g('shMapToggleVillages');
    if(tVillages){
      tVillages.onchange = function(){
        SH.map.showVillages = !!tVillages.checked;
        var s = g('shMapSvgWrap');
        if(s){
          s.innerHTML = renderShinobiMapSvg(SH_MAP_DATA, SH.map.selectedId, SH.map.showVillages, SH.map.showLabels);
          bindMapSvgElements();
        }
      };
    }

    var tLabels = g('shMapToggleLabels');
    if(tLabels){
      tLabels.onchange = function(){
        SH.map.showLabels = !!tLabels.checked;
        var s = g('shMapSvgWrap');
        if(s){
          s.innerHTML = renderShinobiMapSvg(SH_MAP_DATA, SH.map.selectedId, SH.map.showVillages, SH.map.showLabels);
          bindMapSvgElements();
        }
      };
    }

    var tUserMarkers = g('shMapToggleUserMarkers');
    if(tUserMarkers){
      tUserMarkers.onchange = function(){
        SH.map.showUserMarkers = !!tUserMarkers.checked;
        var s = g('shMapSvgWrap');
        if(s){
          s.innerHTML = renderShinobiMapSvg(SH_MAP_DATA, SH.map.selectedId, SH.map.showVillages, SH.map.showLabels);
          bindMapSvgElements();
        }
      };
    }

    // Filter pills
    document.querySelectorAll('[data-map-filter]').forEach(function(btn){
      btn.onclick = function(){
        var f = btn.getAttribute('data-map-filter');
        SH.map.filter = f;
        document.querySelectorAll('.sh-country-poly').forEach(function(poly){
          var cid = poly.getAttribute('data-country');
          var cObj = mapCountryById(cid);
          var match = (f === 'all' || (cObj && cObj.type === f));
          poly.classList.toggle('dimmed', !match);
        });
        document.querySelectorAll('[data-map-filter]').forEach(function(b){
          b.classList.toggle('active', b === btn);
        });
      };
    });

    // Search input
    var sInp = g('shMapSearch');
    if(sInp){
      sInp.oninput = function(){
        var q = (sInp.value || '').trim().toLowerCase();
        SH.map.search = q;
        document.querySelectorAll('.sh-country-poly').forEach(function(poly){
          var cid = poly.getAttribute('data-country');
          var cObj = mapCountryById(cid);
          if(!cObj) return;
          var match = !q ||
            cObj.name.toLowerCase().indexOf(q) !== -1 ||
            (cObj.shortName && cObj.shortName.toLowerCase().indexOf(q) !== -1) ||
            (cObj.kanji && cObj.kanji.indexOf(q) !== -1) ||
            (cObj.village && cObj.village.name.toLowerCase().indexOf(q) !== -1) ||
            (cObj.clans && cObj.clans.toLowerCase().indexOf(q) !== -1);
          poly.classList.toggle('dimmed', !match);
        });
      };
    }
  }

}
SH.wireSh = wireSh;