/* ---------- третья и четвертая кнопки режима ---------- */
function paintShBar(){
  var bar=document.getElementById('hbModeBar'); if(!bar) return;
  var seg=bar.querySelector('.hb-seg'); if(!seg) return;
  
  if(!seg.querySelector('[data-hbmode="sh"]')){
    var b=document.createElement('button');
    b.className='hb-seg-btn'; b.setAttribute('data-hbmode','sh'); b.textContent='Шиноби';
    seg.appendChild(b);
  }
  if(!seg.querySelector('[data-hbmode="me"]')){
    var bMe=document.createElement('button');
    bMe.className='hb-seg-btn'; bMe.setAttribute('data-hbmode','me'); bMe.textContent='Космос';
    seg.appendChild(bMe);
  }

  if(!seg.querySelector('[data-hbmode="el"]')){
    var bEl=document.createElement('button');
    bEl.className='hb-seg-btn'; bEl.setAttribute('data-hbmode','el'); bEl.textContent='Стихия';
    seg.appendChild(bEl);
  }
  if(!seg.querySelector('[data-hbmode="wi"]')){
    var bWi=document.createElement('button');
    bWi.className='hb-seg-btn'; bWi.setAttribute('data-hbmode','wi'); bWi.textContent='Ведьмак';
    seg.appendChild(bWi);
  }
  if(!seg.querySelector('[data-hbmode="wz"]')){
    var bWz=document.createElement('button');
    bWz.className='hb-seg-btn'; bWz.setAttribute('data-hbmode','wz'); bWz.textContent='Волшебник';
    seg.appendChild(bWz);
  }

  if(!seg.querySelector('.hb-seg-indicator')){
    var ind = document.createElement('div');
    ind.className = 'hb-seg-indicator';
    ind.id = 'hbSegIndicator';
    seg.insertBefore(ind, seg.firstChild);
  }
  seg.classList.add('has-indicator');

  seg.querySelectorAll('.hb-seg-btn').forEach(function(b){
    b.classList.toggle('on', b.getAttribute('data-hbmode')===HB.mode);
  });
  if(typeof updateHbSegIndicator === 'function') updateHbSegIndicator(false);

  var shBtn = seg.querySelector('[data-hbmode="sh"]');
  if(shBtn && !shBtn.__shBound){
    shBtn.__shBound = true;
    shBtn.addEventListener('click', function(){
      HB.mode='sh';
      try{ localStorage.setItem('ttc_mode','sh'); }catch(e){}
      if(typeof updateHbSegIndicator === 'function') updateHbSegIndicator(false);
      view={screen:'shHome'}; SH.draft=null; render(); window.scrollTo(0,0);
    });
  }

  var meBtn = seg.querySelector('[data-hbmode="me"]');
  if(meBtn && !meBtn.__meBound){
    meBtn.__meBound = true;
    meBtn.addEventListener('click', function(){
      HB.mode='me';
      try{ localStorage.setItem('ttc_mode','me'); }catch(e){}
      if(typeof updateHbSegIndicator === 'function') updateHbSegIndicator(false);
      view={screen:'meHome'}; render(); window.scrollTo(0,0);
    });
  }

  var elBtn = seg.querySelector('[data-hbmode="el"]');
  if(elBtn && !elBtn.__elBound){
    elBtn.__elBound = true;
    elBtn.addEventListener('click', function(){
      HB.mode='el';
      try{ localStorage.setItem('ttc_mode','el'); }catch(e){}
      if(typeof updateHbSegIndicator === 'function') updateHbSegIndicator(false);
      view={screen:'elHome'}; render(); window.scrollTo(0,0);
    });
  }

  var wiBtn = seg.querySelector('[data-hbmode="wi"]');
  if(wiBtn && !wiBtn.__wiBound){
    wiBtn.__wiBound = true;
    wiBtn.addEventListener('click', function(){
      HB.mode='wi';
      try{ localStorage.setItem('ttc_mode','wi'); }catch(e){}
      if(typeof updateHbSegIndicator === 'function') updateHbSegIndicator(false);
      view={screen:'wiHome'}; render(); window.scrollTo(0,0);
    });
  }

  var wzBtn = seg.querySelector('[data-hbmode="wz"]');
  if(wzBtn && !wzBtn.__wzBound){
    wzBtn.__wzBound = true;
    wzBtn.addEventListener('click', function(e){
      HB.mode='wz';
      try{ localStorage.setItem('ttc_mode','wz'); }catch(e){}
      if(typeof updateHbSegIndicator === 'function') updateHbSegIndicator(false);
      view={screen:'wzHome'}; render(); window.scrollTo(0,0);
    });
  }

  document.body.classList.toggle('sh-theme', HB.mode==='sh');
  document.body.classList.toggle('me-theme', HB.mode==='me');
  document.body.classList.toggle('el-theme', HB.mode==='el');
  document.body.classList.toggle('wi-theme', HB.mode==='wi');
  document.body.classList.toggle('wz-theme', HB.mode==='wz');
  if(HB.mode==='sh' || HB.mode==='me' || HB.mode==='el' || HB.mode==='wi' || HB.mode==='wz') document.body.classList.remove('hb-theme');
  if(typeof updateShinobiTheme === 'function') updateShinobiTheme();
  if(typeof EL !== 'undefined' && typeof EL.applyTheme === 'function') EL.applyTheme();
  if(typeof applyWitcherTheme === 'function') applyWitcherTheme();
  if(typeof applyWizardTheme === 'function') applyWizardTheme();
  if(typeof updateHbSegIndicator === 'function') updateHbSegIndicator(false);

  var lab=bar.querySelector('.hb-bar-world');
  if(HB.mode==='sh'){
    if(!lab){ lab=document.createElement('div'); lab.className='hb-bar-world'; bar.querySelector('.hb-bar-inner').appendChild(lab); }
    var charInfo = (SH.meta && SH.meta.charName) ? (' • ' + SH.meta.charName) : '';
    lab.textContent = (SH.meta && SH.meta.name ? SH.meta.name : 'Шиноби') + charInfo;
  } else if(HB.mode==='me'){
    if(!lab){ lab=document.createElement('div'); lab.className='hb-bar-world'; bar.querySelector('.hb-bar-inner').appendChild(lab); }
    var meC = (typeof ME !== 'undefined' && ME.getChar) ? ME.getChar() : null;
    var meName = meC ? (' • ' + (meC.callsign ? ('[' + meC.callsign + '] ') : '') + meC.name) : '';
    var meShieldHp = meC ? (' • 🛡️ ' + (meC.currentShield!=null?meC.currentShield:meC.baseShield) + ' | ❤️ ' + (meC.currentHp!=null?meC.currentHp:meC.maxHp)) : '';
    lab.textContent = 'Космос' + meName + meShieldHp;
  } else if(HB.mode==='el'){
    if(!lab){ lab=document.createElement('div'); lab.className='hb-bar-world'; bar.querySelector('.hb-bar-inner').appendChild(lab); }
    var elP = (typeof EL !== 'undefined' && EL.getProfile) ? EL.getProfile() : null;
    var elFullName = elP ? (elP.firstName + (elP.lastName ? (' ' + elP.lastName) : '')).trim() : '';
    var elInfo = elFullName ? (' • ' + elFullName + ' (' + (elP.element || 'Стихия') + ')') : '';
    lab.textContent = 'Стихия' + elInfo;
  } else if(HB.mode==='wi'){
    if(!lab){ lab=document.createElement('div'); lab.className='hb-bar-world'; bar.querySelector('.hb-bar-inner').appendChild(lab); }
    var wiP = (typeof WI !== 'undefined' && WI.getProfile) ? WI.getProfile() : null;
    var wiSchoolOrRole = wiP ? (wiP.school || wiP.role || '') : '';
    var wiName = (wiP && wiP.name) ? (' • ' + wiP.name + (wiSchoolOrRole ? (' (' + wiSchoolOrRole + ')') : '')) : '';
    lab.textContent = 'Ведьмак' + wiName;
  } else if(HB.mode==='wz'){
    if(!lab){ lab=document.createElement('div'); lab.className='hb-bar-world'; bar.querySelector('.hb-bar-inner').appendChild(lab); }
    var wzP = (typeof WZ !== 'undefined' && WZ.getProfile) ? WZ.getProfile() : null;
    var wzYear = wzP ? (wzP.year || wzP.course || wzP.profession || '') : '';
    var wzHouseOrYear = wzP ? [wzP.house, wzYear].filter(Boolean).join(' • ') : '';
    var wzName = (wzP && wzP.name) ? (' • ' + wzP.name + (wzHouseOrYear ? (' (' + wzHouseOrYear + ')') : '')) : '';
    lab.textContent = 'Волшебник' + wzName;
  } else if(HB.mode==='hb'){
    if(!lab){ lab=document.createElement('div'); lab.className='hb-bar-world'; bar.querySelector('.hb-bar-inner').appendChild(lab); }
    lab.textContent = (HB.world && HB.world.name ? HB.world.name : 'Технологии');
  } else {
    if(lab && lab.parentNode) lab.parentNode.removeChild(lab);
  }
}
SH.paintShBar = paintShBar;
window.paintShBar = paintShBar;


/* ---------- перехват ---------- */
var _r=window.render, _n=window.navigate, _w=window.wireEvents;

window.render=function(){
  window.view = view;
  if(HB.mode==='wz'){
    document.body.classList.remove('sh-theme', 'me-theme', 'el-theme', 'wi-theme', 'hb-theme');
    document.body.classList.add('wz-theme');
    if(typeof applyWizardTheme === 'function') applyWizardTheme();
    var pCit = document.getElementById("meCitadelParticles"); if(pCit) pCit.style.display = "none";
    var pOmni = document.getElementById("meOmniProjections"); if(pOmni) pOmni.style.display = "none";
    var pN7 = document.getElementById("meN7Background"); if(pN7) pN7.style.display = "none";
    var pCerb = document.getElementById("meCerberusBackground"); if(pCerb) pCerb.style.display = "none";
    var oldCrt = document.getElementById("meCerberusCrtOverlay"); if(oldCrt && oldCrt.parentNode) oldCrt.parentNode.removeChild(oldCrt);
    var elFx = document.getElementById('elThemeFx'); if(elFx) elFx.style.display = 'none';
    var wiFx = document.getElementById('wiThemeFx'); if(wiFx) wiFx.style.display = 'none';

    var s = view.screen || '';
    if(s === 'dice'){
      _r();
      paintShBar();
      return;
    }
    if(s === 'wzWand'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wzWand === 'function') ? wzWand() : '<div>Палочка</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzWand === 'function') wireWzWand();
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzData'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wzData === 'function') ? wzData() : '<div>Данные волшебника</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzData === 'function') wireWzData();
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzRef'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wzRef === 'function') ? wzRef() : '<div>Справочник Магии</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzRef === 'function') wireWzRef();
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzRefView'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var refKey = view.refKey || view.wzKey || '';
      var html = (typeof wzRefView === 'function') ? wzRefView(refKey) : '<div>Статья Справочника</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzRefView === 'function') wireWzRefView(refKey);
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzSpells'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wzSpells === 'function') ? wzSpells() : '<div>Заклинания</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzSpells === 'function') wireWzSpells();
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzSpellView'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var spellId = view.spellId || view.shId || '';
      var html = (typeof wzSpellView === 'function') ? wzSpellView(spellId) : '<div>Заклинание</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzSpellView === 'function') wireWzSpellView(spellId);
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzSpellEdit'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var spellId = view.spellId || view.shId || '';
      var html = (typeof wzSpellEdit === 'function') ? wzSpellEdit(spellId) : '<div>Редактор заклинания</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzSpellEdit === 'function') wireWzSpellEdit(spellId);
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzSpellGen'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wzSpellGen === 'function') ? wzSpellGen() : '<div>AI Генератор заклинаний</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzSpellGen === 'function') wireWzSpellGen();
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzDuels'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wzDuels === 'function') ? wzDuels() : '<div>Дуэльные приёмы</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzDuels === 'function') wireWzDuels();
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzDuelView'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var duelId = view.duelId || view.shId || '';
      var html = (typeof wzDuelView === 'function') ? wzDuelView(duelId) : '<div>Дуэльный приём</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzDuelView === 'function') wireWzDuelView(duelId);
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzDuelEdit'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var duelId = view.duelId || view.shId || '';
      var html = (typeof wzDuelEdit === 'function') ? wzDuelEdit(duelId) : '<div>Редактор приёма</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzDuelEdit === 'function') wireWzDuelEdit(duelId);
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzDuelGen'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wzDuelGen === 'function') ? wzDuelGen() : '<div>AI Генератор приёмов</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzDuelGen === 'function') wireWzDuelGen();
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzSkills'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wzSkills === 'function') ? wzSkills() : '<div>Навыки</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzSkills === 'function') wireWzSkills();
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzSkillView'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var skillId = view.skillId || view.shId || '';
      var html = (typeof wzSkillView === 'function') ? wzSkillView(skillId) : '<div>Навык</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzSkillView === 'function') wireWzSkillView(skillId);
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzSkillEdit'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var skillId = view.skillId || view.shId || '';
      var html = (typeof wzSkillEdit === 'function') ? wzSkillEdit(skillId) : '<div>Редактор навыка</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzSkillEdit === 'function') wireWzSkillEdit(skillId);
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzSkillGen'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wzSkillGen === 'function') ? wzSkillGen() : '<div>AI Генератор навыков</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzSkillGen === 'function') wireWzSkillGen();
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    if(s === 'wzMap'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wzMap === 'function') ? wzMap() : '<div>Карта Мародёров</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWzMap === 'function') wireWzMap();
      if(typeof wireWzNav === 'function') wireWzNav();
      paintShBar();
      return;
    }
    var app = document.getElementById('app');
    app.classList.remove('wide');
    app.classList.add('home-wide');
    var html = (typeof wzHome === 'function') ? wzHome() : '<div>Волшебник</div>';
    app.innerHTML = html;
    _w();
    if(typeof wireWzHome === 'function') wireWzHome();
    if(typeof wireWzNav === 'function') wireWzNav();
    paintShBar();
    return;
  }

  if(HB.mode==='wi'){
    document.body.classList.remove('sh-theme', 'me-theme', 'el-theme', 'hb-theme', 'wz-theme');
    document.body.classList.add('wi-theme');
    if(typeof applyWitcherTheme === 'function') applyWitcherTheme();
    var pCit = document.getElementById("meCitadelParticles"); if(pCit) pCit.style.display = "none";
    var pOmni = document.getElementById("meOmniProjections"); if(pOmni) pOmni.style.display = "none";
    var pN7 = document.getElementById("meN7Background"); if(pN7) pN7.style.display = "none";
    var pCerb = document.getElementById("meCerberusBackground"); if(pCerb) pCerb.style.display = "none";
    var oldCrt = document.getElementById("meCerberusCrtOverlay"); if(oldCrt && oldCrt.parentNode) oldCrt.parentNode.removeChild(oldCrt);
    var elFx = document.getElementById('elThemeFx'); if(elFx) elFx.style.display = 'none';
    var wzFx = document.getElementById('wzThemeFx'); if(wzFx) wzFx.style.display = 'none';

    var s = view.screen || '';
    if(s === 'dice'){
      _r();
      paintShBar();
      return;
    }
    if(s === 'wiData'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wiData === 'function') ? wiData() : '<div>Данные ведьмака</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWiData === 'function') wireWiData();
      if(typeof wireWiNav === 'function') wireWiNav();
      paintShBar();
      return;
    }
    if(s === 'wiRef'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wiRef === 'function') ? wiRef() : '<div>Справочник Континента</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWiRef === 'function') wireWiRef();
      if(typeof wireWiNav === 'function') wireWiNav();
      paintShBar();
      return;
    }
    if(s === 'wiRefView'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var refKey = view.refKey || view.wiKey || '';
      var html = (typeof wiRefView === 'function') ? wiRefView(refKey) : '<div>Статья Справочника</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWiRefView === 'function') wireWiRefView(refKey);
      if(typeof wireWiNav === 'function') wireWiNav();
      paintShBar();
      return;
    }
    if(s === 'wiTechs'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wiTechs === 'function') ? wiTechs() : '<div>Способности</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWiTechs === 'function') wireWiTechs();
      if(typeof wireWiNav === 'function') wireWiNav();
      paintShBar();
      return;
    }
    if(s === 'wiTechView'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var techId = view.techId || view.shId || '';
      var html = (typeof wiTechView === 'function') ? wiTechView(techId) : '<div>Способность</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWiTechView === 'function') wireWiTechView(techId);
      if(typeof wireWiNav === 'function') wireWiNav();
      paintShBar();
      return;
    }
    if(s === 'wiTechEdit'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var techId = view.techId || view.shId || '';
      var html = (typeof wiTechEdit === 'function') ? wiTechEdit(techId) : '<div>Редактор способности</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWiTechEdit === 'function') wireWiTechEdit(techId);
      if(typeof wireWiNav === 'function') wireWiNav();
      paintShBar();
      return;
    }
    if(s === 'wiTechGen'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wiTechGen === 'function') ? wiTechGen() : '<div>AI Генератор способностей</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWiTechGen === 'function') wireWiTechGen();
      if(typeof wireWiNav === 'function') wireWiNav();
      paintShBar();
      return;
    }
    if(s === 'wiMoves'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wiMoves === 'function') ? wiMoves() : '<div>Боевые приёмы</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWiMoves === 'function') wireWiMoves();
      if(typeof wireWiNav === 'function') wireWiNav();
      paintShBar();
      return;
    }
    if(s === 'wiMoveView'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var moveId = view.moveId || view.shId || '';
      var html = (typeof wiMoveView === 'function') ? wiMoveView(moveId) : '<div>Боевой приём</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWiMoveView === 'function') wireWiMoveView(moveId);
      if(typeof wireWiNav === 'function') wireWiNav();
      paintShBar();
      return;
    }
    if(s === 'wiMoveEdit'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var moveId = view.moveId || view.shId || '';
      var html = (typeof wiMoveEdit === 'function') ? wiMoveEdit(moveId) : '<div>Редактор приёма</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWiMoveEdit === 'function') wireWiMoveEdit(moveId);
      if(typeof wireWiNav === 'function') wireWiNav();
      paintShBar();
      return;
    }
    if(s === 'wiMoveGen'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wiMoveGen === 'function') ? wiMoveGen() : '<div>AI Генератор приёмов</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWiMoveGen === 'function') wireWiMoveGen();
      if(typeof wireWiNav === 'function') wireWiNav();
      paintShBar();
      return;
    }
    if(s === 'wiMap'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      var html = (typeof wiMap === 'function') ? wiMap() : '<div>Карта Континента</div>';
      app.innerHTML = html;
      _w();
      if(typeof wireWiMap === 'function') wireWiMap();
      if(typeof wireWiNav === 'function') wireWiNav();
      paintShBar();
      return;
    }
    var app = document.getElementById('app');
    app.classList.remove('wide');
    app.classList.add('home-wide');
    var html = (typeof wiHome === 'function') ? wiHome() : '<div>Ведьмак</div>';
    app.innerHTML = html;
    _w();
    if(typeof wireWiHome === 'function') wireWiHome();
    if(typeof wireWiNav === 'function') wireWiNav();
    paintShBar();
    return;
  }

  if(typeof applyWitcherTheme === 'function') applyWitcherTheme();

  if(HB.mode==='el'){
    document.body.classList.remove('sh-theme', 'me-theme', 'hb-theme', 'wi-theme', 'wz-theme');
    document.body.classList.add('el-theme');
    if(typeof EL !== 'undefined' && typeof EL.applyTheme === 'function') EL.applyTheme();
    var pCit = document.getElementById("meCitadelParticles"); if(pCit) pCit.style.display = "none";
    var pOmni = document.getElementById("meOmniProjections"); if(pOmni) pOmni.style.display = "none";
    var pN7 = document.getElementById("meN7Background"); if(pN7) pN7.style.display = "none";
    var pCerb = document.getElementById("meCerberusBackground"); if(pCerb) pCerb.style.display = "none";
    var oldCrt = document.getElementById("meCerberusCrtOverlay"); if(oldCrt && oldCrt.parentNode) oldCrt.parentNode.removeChild(oldCrt);
    var wiFx = document.getElementById('wiThemeFx'); if(wiFx) wiFx.style.display = 'none';
    var wzFx = document.getElementById('wzThemeFx'); if(wzFx) wzFx.style.display = 'none';

    var s = view.screen || '';
    if(s === 'dice'){
      _r();
      paintShBar();
      return;
    }
    if(s === 'elData'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      app.innerHTML = elData();
      _w();
      if(typeof wireElData === 'function') wireElData();
      paintShBar();
      return;
    }
    if(s === 'elRef'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      app.innerHTML = elRef();
      _w();
      if(typeof wireElRef === 'function') wireElRef();
      paintShBar();
      return;
    }
    if(s === 'elRefView'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      app.innerHTML = elRefView(view.refKey);
      _w();
      if(typeof wireElRefView === 'function') wireElRefView();
      paintShBar();
      return;
    }
    if(s === 'elTechs'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      app.innerHTML = elTechs();
      _w();
      if(typeof wireElTechs === 'function') wireElTechs();
      paintShBar();
      return;
    }
    if(s === 'elTechGen'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      app.innerHTML = elTechGen();
      _w();
      if(typeof wireElTechGen === 'function') wireElTechGen();
      paintShBar();
      return;
    }
    if(s === 'elTechView'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      app.innerHTML = elTechView(view.shId || view.techId);
      _w();
      if(typeof wireElTechView === 'function') wireElTechView();
      paintShBar();
      return;
    }
    if(s === 'elTechEdit'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      app.innerHTML = elTechEdit(view.shId || view.techId);
      _w();
      if(typeof wireElTechEdit === 'function') wireElTechEdit();
      paintShBar();
      return;
    }
    if(s === 'elMoves'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      app.innerHTML = elMoves();
      _w();
      if(typeof wireElMoves === 'function') wireElMoves();
      paintShBar();
      return;
    }
    if(s === 'elMoveGen'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      app.innerHTML = elMoveGen();
      _w();
      if(typeof wireElMoveGen === 'function') wireElMoveGen();
      paintShBar();
      return;
    }
    if(s === 'elMoveView'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      app.innerHTML = elMoveView(view.shId || view.moveId);
      _w();
      if(typeof wireElMoveView === 'function') wireElMoveView();
      paintShBar();
      return;
    }
    if(s === 'elMoveEdit'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      app.innerHTML = elMoveEdit(view.shId || view.moveId);
      _w();
      if(typeof wireElMoveEdit === 'function') wireElMoveEdit();
      paintShBar();
      return;
    }
    if(s === 'elMap'){
      var app = document.getElementById('app');
      app.classList.remove('wide');
      app.classList.add('home-wide');
      app.innerHTML = elMap();
      _w();
      if(typeof wireElMap === 'function') wireElMap();
      paintShBar();
      return;
    }
    var app = document.getElementById('app');
    app.classList.remove('wide');
    app.classList.add('home-wide');
    var html = elHome();
    app.innerHTML = html;
    _w();
    paintShBar();
    return;
  }

  if(typeof EL !== 'undefined' && typeof EL.applyTheme === 'function') EL.applyTheme();

  if(HB.mode==='me'){
    document.body.classList.remove('sh-theme', 'hb-theme', 'wi-theme', 'el-theme', 'wz-theme');
    document.body.classList.add('me-theme');
    if(typeof applyMeTheme === 'function') applyMeTheme();
    var wiFx = document.getElementById('wiThemeFx'); if(wiFx) wiFx.style.display = 'none';
    var wzFx = document.getElementById('wzThemeFx'); if(wzFx) wzFx.style.display = 'none';
    var s=view.screen||'';
    if(s==='dice'){
      _r();
      paintShBar();
      return;
    }
    var app=document.getElementById('app');
    app.classList.remove('wide');
    app.classList.add('home-wide');
    var html = '';
    if(s==='meHome'||!s) html = meHome();
    else if(s==='meChar') html = meData();
    else if(s==='mePowers') html = mePowers();
    else if(s==='mePowerGen') html = mePowerGen();
    else if(s==='meArsenal') html = meArsenal();
    else if(s==='meArsenalGen') html = meArsenalGen();
    else if(s==='meShip') html = meShip();
    else if(s==='meCodex') html = meCodex();
    else if(s==='meCodexView') html = meCodexView();
    else if(s==='meMissions' || s==='meMap') html = meMap();
    else if(s==='meMap') html = meMap();
    else if(s==='meData') html = meData();
    else if(s==='mePowerEdit') { html = mePowerEdit(view.meId); }
    else if(s==='meArsenalEdit') { html = meArsenalEdit(view.meId); }
    else html = meHome();
    app.innerHTML = html;
    _w();
    if(typeof wireMe === 'function') wireMe();
    if(s==='mePowerEdit' && typeof wireMePowerEdit === 'function') wireMePowerEdit();
    if(s==='meArsenalEdit' && typeof wireMeArsenalEdit === 'function') wireMeArsenalEdit();
    if(s==='mePowerGen' && typeof wireMePowerGen === 'function') wireMePowerGen();
    if(s==='meArsenalGen' && typeof wireMeArsenalGen === 'function') wireMeArsenalGen();
    paintShBar();
    return;
  }

  if(HB.mode!=='sh'){
    document.body.classList.remove('me-theme');
    _r();
    paintShBar();
    return;
  }

  _r();
  var s=view.screen||'';
  if(s.indexOf('sh')!==0){ paintShBar(); return; }
  var app=document.getElementById('app');
  app.classList.remove('wide'); app.classList.toggle('home-wide', s==='shHome' || s==='shMap');
  var html='';
  if(s==='shHome') html=shHome();
  else if(s==='shTechs') html=shTechs();
  else if(s==='shJutsuGen') html=shJutsuGen();
  else if(s==='shTechEdit') html=shTechEdit();
  else if(s==='shTechView') html=shTechView();
  else if(s==='shMoves') html=shMoves();
  else if(s==='shSkillGen') html=shSkillGen();
  else if(s==='shMoveGen') html=shMoveGen();
  else if(s==='shMoveEdit') html=shMoveEdit();
  else if(s==='shMoveView') html=shMoveView();
  else if(s==='shSkills') html=shSkills();
  else if(s==='shSkillEdit') html=shSkillEdit();
  else if(s==='shSkillView') html=shSkillView();
  else if(s==='shCmds') html=shCmds();
  else if(s==='shRef') html=shRef();
  else if(s==='shRefView') html=shRefView();
  else if(s==='shMap') html=shMap();
  else if(s==='shData') html=shData();
  else html=shHome();
  app.innerHTML=html;
  document.body.classList.add('sh-theme');
  _w(); wireSh(); paintShBar();
};

window.navigate=function(val){
  var p=String(val||'').split(':');
  if (window.view && window.view.screen !== p[0]) window._prevScreen = window.view.screen;
  if(HB.mode==='me'){
    var meScreens = {
      home: 'meHome',
      meHome: 'meHome',
      meChar: 'meData',
      mePowers: 'mePowers',
      mePowerGen: 'mePowerGen',
      meArsenal: 'meArsenal',
      meArsenalGen: 'meArsenalGen',
      meShip: 'meShip',
      meCodex: 'meCodex',
      meMissions: 'meMap',
      meMap: 'meMap',
      meData: 'meData',
      dice: 'dice'
    };
    if(meScreens[p[0]]){
      window.view = view = { screen: meScreens[p[0]] };
      render();
      window.scrollTo(0,0);
      return;
    }
    if(p[0] === 'mePowerEdit' || p[0] === 'meArsenalEdit'){
      window.view = view = { screen: p[0], meId: p[1] };
      render();
      window.scrollTo(0,0);
      return;
    }
    if(p[0] === 'meCodexView'){
      window.view = view = { screen: 'meCodexView', codexKey: p[1] };
      render();
      window.scrollTo(0,0);
      return;
    }
  }
  if(HB.mode==='el'){
    var elScreens = {
      home: 'elHome',
      elHome: 'elHome',
      elData: 'elData',
      elRef: 'elRef',
      elTechs: 'elTechs',
      elTechGen: 'elTechGen',
      elMoves: 'elMoves',
      elMoveGen: 'elMoveGen',
      elMap: 'elMap',
      dice: 'dice'
    };
    if(elScreens[p[0]]){
      window.view = view = { screen: elScreens[p[0]] };
      render();
      window.scrollTo(0,0);
      return;
    }
    if(p[0] === 'elRefView'){
      window.view = view = { screen: 'elRefView', refKey: p[1] };
      render();
      window.scrollTo(0,0);
      return;
    }
    if(p[0] === 'elTechView' || p[0] === 'elTechEdit' || p[0] === 'elMoveView' || p[0] === 'elMoveEdit'){
      window.view = view = { screen: p[0], shId: p[1], techId: p[1], moveId: p[1] };
      render();
      window.scrollTo(0,0);
      return;
    }
  }
  if(HB.mode==='wz'){
    var wzScreens = {
      home: 'wzHome',
      wzHome: 'wzHome',
      wzData: 'wzData',
      data: 'wzData',
      wzWand: 'wzWand',
      wand: 'wzWand',
      wzRef: 'wzRef',
      ref: 'wzRef',
      wzSpells: 'wzSpells',
      spells: 'wzSpells',
      wzDuels: 'wzDuels',
      duels: 'wzDuels',
      wzSkills: 'wzSkills',
      skills: 'wzSkills',
      wzSkillGen: 'wzSkillGen',
      wzSpellGen: 'wzSpellGen',
      wzDuelGen: 'wzDuelGen',
      wzMap: 'wzMap',
      map: 'wzMap',
      dice: 'dice'
    };
    if(wzScreens[p[0]]){
      window.view = view = { screen: wzScreens[p[0]] };
      render();
      window.scrollTo(0,0);
      return;
    }
    if(p[0] === 'wzRefView'){
      window.view = view = { screen: 'wzRefView', refKey: p[1], wzKey: p[1] };
      render();
      window.scrollTo(0,0);
      return;
    }
    if(p[0] === 'wzSpellView' || p[0] === 'wzSpellEdit'){
      window.view = view = { screen: p[0], spellId: p[1], shId: p[1] };
      render();
      window.scrollTo(0,0);
      return;
    }
    if(p[0] === 'wzDuelView' || p[0] === 'wzDuelEdit'){
      window.view = view = { screen: p[0], duelId: p[1], shId: p[1] };
      render();
      window.scrollTo(0,0);
      return;
    }
    if(p[0] === 'wzSkillView' || p[0] === 'wzSkillEdit'){
      window.view = view = { screen: p[0], skillId: p[1], shId: p[1] };
      render();
      window.scrollTo(0,0);
      return;
    }
  }
  if(HB.mode==='wi'){
    var wiScreens = {
      home: 'wiHome',
      wiHome: 'wiHome',
      wiData: 'wiData',
      data: 'wiData',
      wiRef: 'wiRef',
      ref: 'wiRef',
      wiTechs: 'wiTechs',
      techs: 'wiTechs',
      wiAbilities: 'wiTechs',
      abilities: 'wiTechs',
      wiMoves: 'wiMoves',
      moves: 'wiMoves',
      wiTechGen: 'wiTechGen',
      wiMoveGen: 'wiMoveGen',
      wiMap: 'wiMap',
      map: 'wiMap',
      dice: 'dice'
    };
    if(wiScreens[p[0]]){
      window.view = view = { screen: wiScreens[p[0]] };
      render();
      window.scrollTo(0,0);
      return;
    }
    if(p[0] === 'wiRefView'){
      window.view = view = { screen: 'wiRefView', refKey: p[1], wiKey: p[1] };
      render();
      window.scrollTo(0,0);
      return;
    }
    if(p[0] === 'wiTechView' || p[0] === 'wiTechEdit'){
      window.view = view = { screen: p[0], techId: p[1], shId: p[1] };
      render();
      window.scrollTo(0,0);
      return;
    }
    if(p[0] === 'wiMoveView' || p[0] === 'wiMoveEdit'){
      window.view = view = { screen: p[0], moveId: p[1], shId: p[1] };
      render();
      window.scrollTo(0,0);
      return;
    }
  }
  if(HB.mode==='sh'){
    var map={home:'shHome',shHome:'shHome',shTechs:'shTechs',shJutsuGen:'shJutsuGen',shMoveGen:'shMoveGen',shMoves:'shMoves',shSkillGen:'shSkillGen',shSkills:'shSkills',shCmds:'shCmds',shRef:'shRef',shMap:'shMap',shData:'shData',dice:'dice'};
    if(map[p[0]]){ window.view = view = {screen:map[p[0]]}; SH.draft=null; render(); window.scrollTo(0,0); return; }
    if(p[0]==='shTechEdit'||p[0]==='shTechView'||p[0]==='shMoveEdit'||p[0]==='shMoveView'||p[0]==='shSkillEdit'||p[0]==='shSkillView'||p[0]==='shRefView'){
      window.view = view = {screen:p[0], shId:p[1], shKey:p[1]}; SH.draft=null; render(); window.scrollTo(0,0); return;
    }
  }
  _n(val);
};

/* ---------- запуск ---------- */
load();
if(HB.mode==='sh'){
  document.body.classList.add('sh-theme');
  if(!view.screen || (view.screen!=='dice' && String(view.screen).indexOf('sh')!==0)) view={screen:'shHome'};
} else if(HB.mode==='me'){
  document.body.classList.add('me-theme');
  if(!view.screen || (view.screen!=='dice' && String(view.screen).indexOf('me')!==0)) view={screen:'meHome'};
} else if(HB.mode==='el'){
  document.body.classList.add('el-theme');
  if(!view.screen || (view.screen!=='dice' && String(view.screen).indexOf('el')!==0)) view={screen:'elHome'};
  if(typeof EL !== 'undefined' && typeof EL.applyTheme === 'function') EL.applyTheme();
} else if(HB.mode==='wi'){
  document.body.classList.add('wi-theme');
  if(!view.screen || (view.screen!=='dice' && String(view.screen).indexOf('wi')!==0)) view={screen:'wiHome'};
  if(typeof applyWitcherTheme === 'function') applyWitcherTheme();
} else if(HB.mode==='wz'){
  document.body.classList.add('wz-theme');
  if(!view.screen || (view.screen!=='dice' && String(view.screen).indexOf('wz')!==0)) view={screen:'wzHome'};
  if(typeof applyWizardTheme === 'function') applyWizardTheme();
}
render();
  if(typeof GHSync !== "undefined") GHSync.checkStartupSync();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}