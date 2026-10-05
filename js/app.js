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

  seg.querySelectorAll('.hb-seg-btn').forEach(function(b){
    b.classList.toggle('on', b.getAttribute('data-hbmode')===HB.mode);
  });

  var shBtn = seg.querySelector('[data-hbmode="sh"]');
  if(shBtn && !shBtn.__shBound){
    shBtn.__shBound = true;
    shBtn.addEventListener('click', function(){
      HB.mode='sh';
      try{ localStorage.setItem('ttc_mode','sh'); }catch(e){}
      view={screen:'shHome'}; SH.draft=null; render(); window.scrollTo(0,0);
    });
  }

  var meBtn = seg.querySelector('[data-hbmode="me"]');
  if(meBtn && !meBtn.__meBound){
    meBtn.__meBound = true;
    meBtn.addEventListener('click', function(){
      HB.mode='me';
      try{ localStorage.setItem('ttc_mode','me'); }catch(e){}
      view={screen:'meHome'}; render(); window.scrollTo(0,0);
    });
  }

  var elBtn = seg.querySelector('[data-hbmode="el"]');
  if(elBtn && !elBtn.__elBound){
    elBtn.__elBound = true;
    elBtn.addEventListener('click', function(){
      HB.mode='el';
      try{ localStorage.setItem('ttc_mode','el'); }catch(e){}
      view={screen:'elHome'}; render(); window.scrollTo(0,0);
    });
  }

  document.body.classList.toggle('sh-theme', HB.mode==='sh');
  document.body.classList.toggle('me-theme', HB.mode==='me');
  document.body.classList.toggle('el-theme', HB.mode==='el');
  if(HB.mode==='sh' || HB.mode==='me' || HB.mode==='el') document.body.classList.remove('hb-theme');
  if(typeof updateShinobiTheme === 'function') updateShinobiTheme();
  if(typeof EL !== 'undefined' && typeof EL.applyTheme === 'function') EL.applyTheme();

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
  if(HB.mode==='el'){
    document.body.classList.remove('sh-theme', 'me-theme', 'hb-theme');
    document.body.classList.add('el-theme');
    if(typeof EL !== 'undefined' && typeof EL.applyTheme === 'function') EL.applyTheme();
    var pCit = document.getElementById("meCitadelParticles"); if(pCit) pCit.style.display = "none";
    var pOmni = document.getElementById("meOmniProjections"); if(pOmni) pOmni.style.display = "none";
    var pN7 = document.getElementById("meN7Background"); if(pN7) pN7.style.display = "none";
    var pCerb = document.getElementById("meCerberusBackground"); if(pCerb) pCerb.style.display = "none";
    var oldCrt = document.getElementById("meCerberusCrtOverlay"); if(oldCrt && oldCrt.parentNode) oldCrt.parentNode.removeChild(oldCrt);

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
    document.body.classList.remove('sh-theme');
    document.body.classList.remove('hb-theme');
    document.body.classList.add('me-theme');
    if(typeof applyMeTheme === 'function') applyMeTheme();
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
    else if(s==='meArsenal') html = meArsenal();
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
      meArsenal: 'meArsenal',
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
}
render();
  if(typeof GHSync !== "undefined") GHSync.checkStartupSync();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}