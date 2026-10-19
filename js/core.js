/* ---------- dice roller state & logic ---------- */
const DICE_TYPES = ['coin',4,6,8,10,12,20];
const DICE_COLORS = {
  2:    {light:'#4fa1d8',dark:'#1b4d75'},
  4:    {light:'#58a86a',dark:'#2c5837'},
  6:    {light:'#43a3b3',dark:'#205761'},
  8:    {light:'#8a67c4',dark:'#4a3470'},
  10:   {light:'#c45a90',dark:'#6e2c4d'},
  12:   {light:'#cc5560',dark:'#772930'},
  20:   {light:'#e09a45',dark:'#8a561d'},
  coin: {light:'#fae078',dark:'#995810'}
};
const DICE_LABEL_Y = {2:60,4:76,6:62,8:60,10:54,12:64,20:60};
let diceState = {dice:[], modifier:0, counter:0, customSides:7, labelCat:'', label:'', customLabel:'', history:[]};
const DICE_HISTORY_MAX = 16;

function generateCoinSvg(uid, label){
  const gid = 'grad_'+uid;
  const dispLabel = (label!==undefined && label!==null) ? label : 'C';
  const text = dispLabel
    ? `<text x="50" y="60" text-anchor="middle" font-family="'Cinzel', serif" font-weight="700" font-size="30" fill="#fff8d6" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))">${dispLabel}</text>`
    : '';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fae078"/>
        <stop offset="50%" stop-color="#e29b2b"/>
        <stop offset="100%" stop-color="#995810"/>
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#${gid})" stroke="#6b3a04" stroke-width="2"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.3" stroke-dasharray="3.5,2.5"/>
    <circle cx="50" cy="50" r="33" fill="rgba(0,0,0,0.12)" stroke="rgba(255,215,0,0.3)" stroke-width="1"/>
    ${text}
  </svg>`;
}

function renderCustomFacetShape(sides, uid, label){
  if(sides === 'coin') return generateCoinSvg(uid, label);
  if(sides === 2) return dieShapeSvg(2, uid, label);
  const s = Math.max(3, Math.min(100, parseInt(sides,10) || 7));
  const gid = 'grad_'+uid;

  if(s === 3){
    const pTop = [50, 7], pRight = [93, 89], pLeft = [7, 89];
    const c = [50, 61];
    const ipTop = [50, 34], ipRight = [71.5, 75], ipLeft = [28.5, 75];
    const outerPoints = `${pTop.join(',')} ${pRight.join(',')} ${pLeft.join(',')}`;
    const innerPoints = `${ipTop.join(',')} ${ipRight.join(',')} ${ipLeft.join(',')}`;
    const facetPolys = `
      <polygon points="${ipTop[0]},${ipTop[1]} ${pTop[0]},${pTop[1]} ${pRight[0]},${pRight[1]} ${ipRight[0]},${ipRight[1]}" fill="rgba(255,255,255,0.15)" stroke="rgba(0,0,0,0.28)" stroke-width="0.8"/>
      <polygon points="${c[0]},${c[1]} ${ipTop[0]},${ipTop[1]} ${ipRight[0]},${ipRight[1]}" fill="rgba(0,0,0,0.12)" stroke="rgba(0,0,0,0.22)" stroke-width="0.7"/>
      <polygon points="${ipRight[0]},${ipRight[1]} ${pRight[0]},${pRight[1]} ${pLeft[0]},${pLeft[1]} ${ipLeft[0]},${ipLeft[1]}" fill="rgba(0,0,0,0.2)" stroke="rgba(0,0,0,0.28)" stroke-width="0.8"/>
      <polygon points="${c[0]},${c[1]} ${ipRight[0]},${ipRight[1]} ${ipLeft[0]},${ipLeft[1]}" fill="rgba(255,255,255,0.08)" stroke="rgba(0,0,0,0.22)" stroke-width="0.7"/>
      <polygon points="${ipLeft[0]},${ipLeft[1]} ${pLeft[0]},${pLeft[1]} ${pTop[0]},${pTop[1]} ${ipTop[0]},${ipTop[1]}" fill="rgba(255,255,255,0.15)" stroke="rgba(0,0,0,0.28)" stroke-width="0.8"/>
      <polygon points="${c[0]},${c[1]} ${ipLeft[0]},${ipLeft[1]} ${pTop[0]},${pTop[1]}" fill="rgba(0,0,0,0.12)" stroke="rgba(0,0,0,0.22)" stroke-width="0.7"/>
    `;
    const text = (label!==undefined && label!==null)
      ? `<text x="50" y="67" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="28" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))">${label}</text>`
      : '';
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#8c52ff"/>
          <stop offset="100%" stop-color="#3d1475"/>
        </linearGradient>
      </defs>
      <polygon points="${outerPoints}" fill="url(#${gid})" stroke="rgba(0,0,0,0.4)" stroke-width="1.5"/>
      ${facetPolys}
      <polygon points="${innerPoints}" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>
      ${text}
    </svg>`;
  }

  const cx = 50, cy = 50, r = 44;
  const pts = [];
  for(let i=0; i<s; i++){
    const ang = -Math.PI/2 + (2 * Math.PI * i / s);
    pts.push([+(cx + r * Math.cos(ang)).toFixed(1), +(cy + r * Math.sin(ang)).toFixed(1)]);
  }
  const outerPoints = pts.map(p=>p.join(',')).join(' ');

  const innerR = r * 0.48;
  const innerPts = [];
  for(let i=0; i<s; i++){
    const ang = -Math.PI/2 + (2 * Math.PI * i / s);
    innerPts.push([+(cx + innerR * Math.cos(ang)).toFixed(1), +(cy + innerR * Math.sin(ang)).toFixed(1)]);
  }
  const innerPoints = innerPts.map(p=>p.join(',')).join(' ');

  let facetPolys = '';
  for(let i=0; i<s; i++){
    const p1 = pts[i];
    const p2 = pts[(i+1)%s];
    const ip1 = innerPts[i];
    const ip2 = innerPts[(i+1)%s];
    const shadeA = (i % 2 === 0) ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)';
    const shadeB = ((i + 1) % 2 === 0) ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
    facetPolys += `<polygon points="${ip1[0]},${ip1[1]} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${ip2[0]},${ip2[1]}" fill="${shadeA}" stroke="rgba(0,0,0,0.28)" stroke-width="0.8"/>`;
    facetPolys += `<polygon points="50,50 ${ip1[0]},${ip1[1]} ${ip2[0]},${ip2[1]}" fill="${shadeB}" stroke="rgba(0,0,0,0.22)" stroke-width="0.7"/>`;
  }

  const fontSize = s > 99 ? 20 : (s > 20 ? 24 : 28);
  const text = (label!==undefined && label!==null)
    ? `<text x="50" y="58" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="${fontSize}" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))">${label}</text>`
    : '';

  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8c52ff"/>
        <stop offset="100%" stop-color="#3d1475"/>
      </linearGradient>
    </defs>
    <polygon points="${outerPoints}" fill="url(#${gid})" stroke="rgba(0,0,0,0.4)" stroke-width="1.5"/>
    ${facetPolys}
    <polygon points="${innerPoints}" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>
    ${text}
  </svg>`;
}

const CUST_THEMES = {
  2:  { color:'#4fa1d8', glow:'rgba(79,161,216,0.7)', bg:'rgba(79,161,216,0.12)', border:'rgba(79,161,216,0.45)' },
  4:  { color:'#58a86a', glow:'rgba(88,168,106,0.7)',  bg:'rgba(88,168,106,0.12)',  border:'rgba(88,168,106,0.45)' },
  6:  { color:'#43a3b3', glow:'rgba(67,163,179,0.7)',  bg:'rgba(67,163,179,0.12)',  border:'rgba(67,163,179,0.45)' },
  8:  { color:'#8a67c4', glow:'rgba(138,103,196,0.7)', bg:'rgba(138,103,196,0.12)', border:'rgba(138,103,196,0.45)' },
  10: { color:'#c45a90', glow:'rgba(196,90,144,0.7)', bg:'rgba(196,90,144,0.12)', border:'rgba(196,90,144,0.45)' },
  12: { color:'#cc5560', glow:'rgba(204,85,96,0.7)',  bg:'rgba(204,85,96,0.12)',  border:'rgba(204,85,96,0.45)' },
  20: { color:'#e09a45', glow:'rgba(224,154,69,0.7)', bg:'rgba(224,154,69,0.12)', border:'rgba(224,154,69,0.45)' },
  default: { color:'#b78aff', glow:'rgba(140,82,255,0.55)', bg:'rgba(140,82,255,0.09)', border:'rgba(140,82,255,0.35)' }
};

function getCustomPreviewSvg(n, uid){
  if(n === 'coin') return generateCoinSvg(uid, '🪙');
  if(n === 2) return dieShapeSvg(2, uid, 'd2');
  if(DICE_COLORS[n]) return dieShapeSvg(n, uid, n);
  return renderCustomFacetShape(n, uid, 'd' + n);
}

function dieShapeSvg(sides, uid, label){
  if(sides==='coin') return generateCoinSvg(uid, label);
  if(sides===2){
    const gid = 'grad_'+uid;
    const c = DICE_COLORS[2];
    const text = (label!==undefined && label!==null)
      ? `<text x="50" y="61" text-anchor="middle" font-family="'Cinzel', serif" font-weight="700" font-size="28" fill="#ffffff" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.85))">${label}</text>`
      : '';
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${c.light}"/>
          <stop offset="100%" stop-color="${c.dark}"/>
        </linearGradient>
      </defs>
      <path d="M 50,7 C 84,26 84,74 50,93 C 16,74 16,26 50,7 Z" fill="url(#${gid})" stroke="rgba(0,0,0,0.35)" stroke-width="1.8"/>
      <path d="M 50,7 C 22,26 22,74 50,93 Z" fill="rgba(255,255,255,0.18)" stroke="rgba(0,0,0,0.2)" stroke-width="0.8"/>
      <path d="M 50,7 C 78,26 78,74 50,93 Z" fill="rgba(0,0,0,0.18)" stroke="rgba(0,0,0,0.2)" stroke-width="0.8"/>
      <line x1="50" y1="7" x2="50" y2="93" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/>
      ${text}
    </svg>`;
  }
  if(!DICE_COLORS[sides]) return renderCustomFacetShape(sides, uid, label);
  const c = DICE_COLORS[sides];
  const gid = 'grad_'+uid;
  let shape='';
  if(sides===4) shape = `<polygon points="50,6 96,90 4,90" fill="url(#${gid})" stroke="rgba(0,0,0,.25)"/>`;
  else if(sides===6) shape = `<rect x="9" y="9" width="82" height="82" rx="14" fill="url(#${gid})" stroke="rgba(0,0,0,.25)"/>`;
  else if(sides===8) shape = `<polygon points="50,4 96,50 50,96 4,50" fill="url(#${gid})" stroke="rgba(0,0,0,.25)"/><line x1="50" y1="4" x2="50" y2="96" stroke="rgba(0,0,0,.14)"/>`;
  else if(sides===10) shape = `<polygon points="50,4 93,42 50,96 7,42" fill="url(#${gid})" stroke="rgba(0,0,0,.25)"/><polyline points="7,42 50,58 93,42" fill="none" stroke="rgba(0,0,0,.14)"/><line x1="50" y1="58" x2="50" y2="96" stroke="rgba(0,0,0,.14)"/>`;
  else if(sides===12) shape = `<polygon points="50,4 95,38 78,94 22,94 5,38" fill="url(#${gid})" stroke="rgba(0,0,0,.25)"/>`;
  else {
    const strokeColor = 'rgba(0,0,0,0.28)';
    const facetFill = 'rgba(255,255,255,0.12)';
    shape = `<polygon points="50,3 91,26 91,74 50,97 9,74 9,26" fill="url(#${gid})" stroke="${strokeColor}" stroke-width="1.6"/>
    <polygon points="50,24 75,63 25,63" fill="${facetFill}" stroke="${strokeColor}" stroke-width="1.2"/>
    <line x1="50" y1="24" x2="50" y2="3" stroke="${strokeColor}" stroke-width="1.2"/>
    <line x1="50" y1="24" x2="91" y2="26" stroke="${strokeColor}" stroke-width="1.2"/>
    <line x1="50" y1="24" x2="9" y2="26" stroke="${strokeColor}" stroke-width="1.2"/>
    <line x1="75" y1="63" x2="91" y2="26" stroke="${strokeColor}" stroke-width="1.2"/>
    <line x1="75" y1="63" x2="91" y2="74" stroke="${strokeColor}" stroke-width="1.2"/>
    <line x1="75" y1="63" x2="50" y2="97" stroke="${strokeColor}" stroke-width="1.2"/>
    <line x1="25" y1="63" x2="50" y2="97" stroke="${strokeColor}" stroke-width="1.2"/>
    <line x1="25" y1="63" x2="9" y2="74" stroke="${strokeColor}" stroke-width="1.2"/>
    <line x1="25" y1="63" x2="9" y2="26" stroke="${strokeColor}" stroke-width="1.2"/>`;
  }
  const text = (label!==undefined && label!==null)
    ? `<text x="50" y="${DICE_LABEL_Y[sides]}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="32" fill="#fff">${label}</text>`
    : '';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c.light}"/><stop offset="1" stop-color="${c.dark}"/></linearGradient></defs>${shape}${text}</svg>`;
}

function trayDieHtml(d){
  const isCoin = (d.sides === 'coin');
  const valText = isCoin ? (d.value === 2 ? 'W' : 'L') : d.value;
  return `<div class="die s${d.sides}" data-id="${d.id}" title="Убрать ${isCoin?'монету':'кость'}">
    ${dieShapeSvg(d.sides, d.id, isCoin ? '' : null)}
    <div class="val">${valText}</div>
  </div>`;
}

function currentDiceTotal(){
  if(!diceState.dice.length) return 0;
  const numDice = diceState.dice.filter(d => d.sides !== 'coin');
  const coinDice = diceState.dice.filter(d => d.sides === 'coin');

  if(!numDice.length && coinDice.length){
    return coinDice.map(c => c.value === 2 ? 'W' : 'L').join(', ');
  }

  const numSum = numDice.reduce((s,d)=>s+d.value,0) + diceState.modifier;
  if(coinDice.length){
    const coinStr = coinDice.map(c => c.value === 2 ? 'W' : 'L').join(', ');
    return `${numSum} · ${coinStr}`;
  }
  return numSum;
}

function diceNotation(compact){
  const groups={};
  diceState.dice.forEach(d=>{groups[d.sides]=(groups[d.sides]||0)+1;});
  const parts=[];
  Object.keys(groups).filter(s => s !== 'coin').map(Number).sort((a,b)=>b-a).forEach(s=>{
    parts.push(`${groups[s]}d${s}`);
  });
  if(groups['coin']){
    parts.push(`${groups['coin']}C`);
  }
  let n=parts.join(compact?'+':' + ');
  const m=diceState.modifier;
  if(m>0) n+=(compact?'+':' + ')+m;
  else if(m<0) n+=(compact? String(m) : ' − '+Math.abs(m));
  return n;
}

function animateDie(el, sides, finalValue, dur){
  const valEl = el.querySelector('.val');
  if(!valEl) return;
  if(el._diceIv) clearInterval(el._diceIv);
  el.classList.add('rolling');
  const isCoin = (sides === 'coin');
  const start = performance.now();
  el._diceIv = setInterval(()=>{
    if(isCoin){
      valEl.textContent = Math.random() < 0.5 ? 'W' : 'L';
    } else {
      valEl.textContent = 1+Math.floor(Math.random()*sides);
    }
    if(performance.now()-start>=dur){
      clearInterval(el._diceIv); el._diceIv=null;
      el.classList.remove('rolling');
      valEl.textContent = isCoin ? (finalValue === 2 ? 'W' : 'L') : finalValue;
    }
  },70);
}

function updateLabelPreview(){
  const el = document.getElementById('labelPreview');
  if(!el) return;
  if(!diceState.dice.length){
    const label = currentDiceLabel();
    const m = diceState.modifier;
    const modStr = m ? (m > 0 ? (' + ' + m) : (' − ' + Math.abs(m))) : '';
    el.textContent = `*[Результат броска ${label?label+' ':''}1d20: … ]*${modStr}`;
    return;
  }
  el.textContent = buildDiceResultLines().join('\n');
}

function updateDiceReadout(){
  const totalEl=document.getElementById('diceTotal');
  const notEl=document.getElementById('diceNotation');
  if(totalEl) totalEl.textContent = diceState.dice.length ? currentDiceTotal() : '—';
  if(notEl) notEl.textContent = diceState.dice.length ? diceNotation(false) : '';
  updateLabelPreview();
}

function updateDiceControls(){
  const has = diceState.dice.length>0;
  ['rollAllBtn','clearDiceBtn','copyResultBtn'].forEach(id=>{
    const b=document.getElementById(id);
    if(b) b.disabled = !has;
  });
}

function currentLabelEmojiFor(sides){
  if(!diceState.labelCat) return '';
  if(diceState.labelCat==='custom') return (diceState.customLabel||'').trim() ? '✎' : '';
  const cats = (typeof getAvailableDiceCategories === 'function') ? getAvailableDiceCategories() : (typeof DICE_LABEL_CATEGORIES !== 'undefined' ? DICE_LABEL_CATEGORIES : []);
  const cat = cats.find(c=>c.key===diceState.labelCat);
  if(!cat) return '';
  const item = cat.items.find(i=>i.ru===diceState.label);
  if(!item) return '';
  const applies = item.std===null || sides===item.std;
  return applies ? item.icon : '';
}

function currentLabelAppliedTo(sides){
  const label = currentDiceLabel();
  if(!label) return '';
  if(diceState.labelCat==='custom') return label;
  const std = currentLabelStd();
  return (std===null || sides===std) ? label : '';
}

function pushDiceHistory(entries){
  entries.forEach(e=>diceState.history.push(e));
  if(diceState.history.length > DICE_HISTORY_MAX){
    diceState.history = diceState.history.slice(-DICE_HISTORY_MAX);
  }
  updateDiceHistory();
}

function histDieHtml(h, isNew){
  const isCoin = (h.sides === 'coin');
  const valText = isCoin ? (h.value === 2 ? 'W' : 'L') : h.value;
  const tip = isCoin
    ? `${h.emoji?h.emoji+' ':''}${h.label ? h.label+' · ' : ''}Монета C = ${valText}`
    : `${h.emoji?h.emoji+' ':''}${h.label ? h.label+' · ' : ''}d${h.sides} = ${h.value}`;
  return `<div class="hist-die${isNew?' hist-new':''}" data-tip="${escapeAttr(tip)}">
    ${dieShapeSvg(h.sides, 'h'+h.uid, isCoin ? '' : null)}
    <div class="hv" style="${isCoin?'font-size:14px;font-family:Cinzel,serif;font-weight:700;color:#fff8d6;':''}">${valText}</div>
    ${h.emoji?`<div class="he">${h.emoji}</div>`:''}
  </div>`;
}

function updateDiceHistory(){
  const box = document.getElementById('diceHistory');
  if(!box) return;
  const n = diceState.history.length;
  box.innerHTML = diceState.history.map((h,i)=>histDieHtml(h, i===n-1)).join('');
  const clearBtn = document.getElementById('clearHistBtn');
  if(clearBtn) clearBtn.disabled = !n;
}

let histUid = 0;

window.addDie = addDie;
window.removeDie = removeDie;
window.rollAllDice = rollAllDice;
window.diceState = diceState;
function addDie(sides){
  const tray = document.querySelector('.dice-tray');
  if(!tray){ render(); return; } // подстраховка, если экран ещё не отрисован

  const id='die'+(++diceState.counter);
  const isCoin = (sides === 'coin');
  const value = isCoin ? (Math.random() < 0.5 ? 1 : 2) : (1+Math.floor(Math.random()*sides));
  diceState.dice.push({id,sides,value});

  const hint = tray.querySelector('.empty-hint');
  if(hint) hint.remove();

  const holder = document.createElement('div');
  holder.innerHTML = trayDieHtml({id,sides,value});
  const el = holder.firstElementChild || holder;
  tray.appendChild(el);
  el.addEventListener('click', ()=>removeDie(id));

  updateDiceControls();
  const totalEl=document.getElementById('diceTotal');
  if(totalEl) totalEl.textContent='…';

  const dur=520+Math.random()*300;
  animateDie(el,sides,value,dur);
  setTimeout(()=>{
    updateDiceReadout();
    pushDiceHistory([{sides, value, uid:++histUid, emoji:currentLabelEmojiFor(sides), label:currentLabelAppliedTo(sides)}]);
  }, dur+90);
}

function removeDie(id){
  diceState.dice = diceState.dice.filter(d=>d.id!==id);
  const el=document.querySelector(`.die[data-id="${id}"]`);
  if(el){
    if(el._diceIv) clearInterval(el._diceIv);
    el.remove();
  }
  const tray = document.querySelector('.dice-tray');
  if(tray && !diceState.dice.length){
    tray.innerHTML = `<div class="empty-hint">Нажмите на кость внизу — она появится здесь и сразу будет брошена.<br>Клик по кости на поле убирает её.</div>`;
  }
  updateDiceControls();
  updateDiceReadout();
}

function rollAllDice(){
  if(!diceState.dice.length) return;
  let maxDur=0;
  const totalEl=document.getElementById('diceTotal');
  if(totalEl) totalEl.textContent='…';
  diceState.dice.forEach(d=>{
    const isCoin = (d.sides === 'coin');
    d.value = isCoin ? (Math.random() < 0.5 ? 1 : 2) : (1+Math.floor(Math.random()*d.sides));
    const el=document.querySelector(`.die[data-id="${d.id}"]`);
    if(!el) return;
    const dur=520+Math.random()*300;
    maxDur=Math.max(maxDur,dur);
    animateDie(el,d.sides,d.value,dur);
  });
  setTimeout(()=>{
    updateDiceReadout();
    pushDiceHistory(diceState.dice.map(d=>({
      sides:d.sides, value:d.value, uid:++histUid,
      emoji:currentLabelEmojiFor(d.sides), label:currentLabelAppliedTo(d.sides)
    })));
  }, maxDur+90);
}

function currentDiceLabel(){
  if(diceState.labelCat==='custom') return (diceState.customLabel||'').trim();
  if(!diceState.labelCat) return '';
  return diceState.label || '';
}

function buildDiceResultLines(){
  if(!diceState.dice.length) return [];

  const label = currentDiceLabel();
  const isCustom = diceState.labelCat==='custom';
  const std = currentLabelStd();

  const groups = {};
  diceState.dice.forEach(d=>{
    if(!groups[d.sides]) groups[d.sides] = [];
    groups[d.sides].push(d.value);
  });

  const lines = [];

  const sidesDesc = Object.keys(groups).filter(s => s !== 'coin').map(Number).sort((a,b)=>b-a);
  const appliesTo = (sides)=> !!label && (isCustom || std===null || sides===std);

  sidesDesc.forEach(sides=>{
    const vals = groups[sides];
    const prefix = appliesTo(sides) ? (label+' ') : '';
    const dieName = `${vals.length}d${sides}`;
    lines.push(`*[Результат броска ${prefix}${dieName}: ${vals.join(' | ')} ]*`);
  });

  if(groups['coin']){
    const coinVals = groups['coin'].map(v => v === 2 ? 'W' : 'L');
    const prefix = appliesTo('coin') ? (label+' ') : '';
    const coinName = `${groups['coin'].length}C`;
    lines.push(`*[Результат броска ${prefix}${coinName}: ${coinVals.join(' | ')} ]*`);
  }

  if(diceState.modifier && lines.length && sidesDesc.length){
    const m = diceState.modifier;
    const modStr = m > 0 ? (' + ' + m) : (' − ' + Math.abs(m));
    const targetIdx = (std !== null && sidesDesc.includes(std)) ? sidesDesc.indexOf(std) : (lines.length - (groups['coin'] ? 2 : 1));
    if(lines[targetIdx]) lines[targetIdx] += modStr;
  }

  return lines;
}

function copyDiceResult(){
  if(!diceState.dice.length) return;

  copyText(buildDiceResultLines().join('\n'));

  const btn=document.getElementById('copyResultBtn');
  if(btn){
    const old=btn.textContent;
    btn.textContent='Скопировано ✓';
    setTimeout(()=>{btn.textContent=old;},900);
  }
}

let genRollCounter = 0;

function rollSpecValue(count, sides, mode){
  const rolls=[];
  for(let i=0;i<count;i++) rolls.push(1+Math.floor(Math.random()*sides));
  let value;
  if(mode==='max') value=Math.max(...rolls);
  else if(mode==='min') value=Math.min(...rolls);
  else value=rolls.reduce((a,b)=>a+b,0);
  return value;
}

function handleGenerateClick(btn){
  const template = btn.getAttribute('data-template');
  const count = parseInt(btn.getAttribute('data-count'),10);
  const sides = parseInt(btn.getAttribute('data-sides'),10);
  const mode = btn.getAttribute('data-mode');
  const value = rollSpecValue(count, sides, mode);
  const finalText = template.replace(': ]*', ': '+value+' ]*');
  copyText(finalText);

  const card = btn.closest('.card');
  if(!card) return;
  const overlay = card.querySelector('.gen-stamp');
  const holder = overlay ? overlay.querySelector('.gen-die') : null;
  if(!overlay || !holder) return;

  const uid = 'gen'+(++genRollCounter);
  holder.innerHTML = dieShapeSvg(sides, uid) + `<div class="val"></div>`;
  const valEl = holder.querySelector('.val');

  overlay.classList.add('active');
  holder.classList.add('rolling');
  const dur = 480;
  const start = performance.now();
  const iv = setInterval(()=>{
    valEl.textContent = 1+Math.floor(Math.random()*sides);
    if(performance.now()-start>=dur){
      clearInterval(iv);
      holder.classList.remove('rolling');
      valEl.textContent = value;
    }
  },70);

  clearTimeout(overlay._genT);
  overlay._genT = setTimeout(()=>{ overlay.classList.remove('active'); }, dur+950);
}

const DICE_LABEL_CATEGORIES = window.DICE_LABEL_CATEGORIES = [
  {key:'shinobi', mode:'sh', icon:'🌀', ru:'Шиноби', items:[
    {icon:'🌀', ru:'Контроль чакры', std:20},
    {icon:'🛡️', ru:'Активная защита', std:20},
    {icon:'🎯', ru:'Атака ниндзюцу', std:20},
    {icon:'👊', ru:'Приём тайдзюцу', std:20},
    {icon:'👁️', ru:'Развеять гендзюцу (Кай)', std:20},
    {icon:'🥷', ru:'Скрытность шиноби', std:20},
    {icon:'📡', ru:'Сенсорика и поиск', std:20},
    {icon:'💥', ru:'Урон техники / приёма', std:null}
  ]},
  {key:'space', mode:'me', icon:'🪐', ru:'Эффект Массы (Mass Effect)', items:[
    {icon:'🎯', ru:'Атака стрелковым оружием (по AC)', std:20},
    {icon:'🛡️', ru:'Активная защита (перекат / укрытие)', std:20},
    {icon:'💥', ru:'Урон оружия / боеприпаса', std:null},
    {icon:'⚡', ru:'Биотика: проверка контроля (МУД/ХАР)', std:20},
    {icon:'💻', ru:'Техника: взлом и дешифровка (ИНТ)', std:20},
    {icon:'🪙', ru:'Монетка шанса W / L (50/50)', std:'coin'},
    {icon:'🩺', ru:'Медицина и медгель (ИНТ/МУД)', std:20},
    {icon:'🔥', ru:'Спасбросок: перегрузка / напряжение (ТЕЛ)', std:20},
    {icon:'👁️', ru:'Омни-скан: оценка защиты цели', std:20},
    {icon:'🎲', ru:'d100: Таблица крит. попадания', std:100},
    {icon:'🌌', ru:'d100: Событие космического перелёта', std:100},
    {icon:'⚠️', ru:'d100: Осложнение взлома терминала', std:100}
  ]},
  {key:'starwars', mode:'sw', icon:'⚔️', ru:'Звездные войны', items:[
    {icon:'⚔️', ru:'Атака световым мечом', std:20},
    {icon:'🔫', ru:'Атака бластером', std:20},
    {icon:'✨', ru:'Проверка Силы (Светлая / Тёмная)', std:20},
    {icon:'🛡️', ru:'Отражение бластерного выстрела (Соресу / Шиен)', std:20},
    {icon:'💥', ru:'Урон светового меча / Силы', std:null},
    {icon:'🚀', ru:'Пилотирование и манёвр уклонения', std:20},
    {icon:'💻', ru:'Слайсинг терминала / ремонт дроида', std:20}
  ]},
    {key:'element', mode:'el', icon:'🔥', ru:'Стихия', items:[
      {icon:'🌀', ru:'Исполнение стихии', std:20},
      {icon:'⚔️', ru:'Атака стихией', std:20},
      {icon:'🛡️', ru:'Активная защита стихией', std:20}
    ]},
  {key:'witcher', mode:'wi', icon:'🐺', ru:'Ведьмак', items:[
    {icon:'🐺', ru:'Знак Аард (Телекинетический толчок)', std:20},
    {icon:'🔥', ru:'Знак Игни (Выброс пламени)', std:20},
    {icon:'🛡️', ru:'Знак Квен (Магический щит)', std:20},
    {icon:'👁️', ru:'Знак Аксий (Контроль разума / Гипноз)', std:20},
    {icon:'🕸️', ru:'Знак Ирден (Магическая ловушка)', std:20},
    {icon:'⚔️', ru:'Атака: Стальной меч (люди/звери)', std:20},
    {icon:'🗡️', ru:'Атака: Серебряный меч (чудовища)', std:20},
    {icon:'💥', ru:'Урон оружия / Знака', std:null},
    {icon:'🎯', ru:'Парирование и контратака', std:20},
    {icon:'⚡', ru:'Ведьмачье чутьё (Внимание / Следы)', std:20},
    {icon:'🧪', ru:'Спасбросок: Интоксикация от зелий (ТЕЛ)', std:20},
    {icon:'💣', ru:'Урон бомбы (Картечь / Самум / Сев. Ветер)', std:null}
  ]},
  {key:'core', icon:'⚔️', ru:'Основное', items:[
    {icon:'🎯', ru:'Попадание', std:20},
    {icon:'💥', ru:'Урон', std:null},
    {icon:'⚡', ru:'Инициатива', std:20},
    {icon:'⭐', ru:'Кость превосходства', std:8},
    {icon:'💀', ru:'Спасбросок от смерти', std:20},
    {icon:'⬆️', ru:'Преимущество', std:20},
    {icon:'⬇️', ru:'Помеха', std:20},
    {icon:'🎲', ru:'Проверка концентрации', std:20}
  ]},
  {key:'ability', icon:'💪', ru:'Характеристики', items:
    Object.keys(ABILITY_ABBR).map(a=>({icon:ABILITY_ICONS[a], ru:'Проверка '+ABILITY_GENITIVE[a], std:20}))
  },
  {key:'skill', icon:'🎯', ru:'Навыки', items:
    SKILLS.map(s=>({icon:SKILL_ICONS[s.ru]||'▫️', ru:s.ru, std:20}))
  },
  {key:'save', icon:'🛡️', ru:'Спасброски', items:
    Object.keys(ABILITY_ABBR).map(a=>({icon:ABILITY_ICONS[a], ru:'Спасбросок '+ABILITY_GENITIVE[a], std:20}))
  },
  {key:'custom', icon:'✎', ru:'Своя подпись', items:[]}
];

function getAvailableDiceCategories(){
  const curMode = (typeof HB !== 'undefined' && HB.mode) ? HB.mode : 'core';
  const baseCats = DICE_LABEL_CATEGORIES.filter(c => {
    if(c.mode){
      return c.mode === curMode;
    }
    return true;
  });
  if(curMode === 'core' || curMode === 'faerun'){
    try {
      const hero = (typeof getActiveFaerunCharacter === 'function') ? getActiveFaerunCharacter() : null;
      const extraCats = [];
      if(hero && Array.isArray(hero.techs) && hero.techs.length > 0){
        extraCats.push({
          key: 'fae_techs',
          icon: '✨',
          ru: 'Способности героя',
          items: hero.techs.map(function(t){
            var dNum = parseInt(String(t.dmgD || '').replace(/\D+/g, ''), 10);
            return {
              icon: t.icon || '✨',
              ru: t.name || 'Способность',
              std: (!isNaN(dNum) && dNum >= 2) ? dNum : 20
            };
          })
        });
      }
      const moveItems = [];
      if(hero && Array.isArray(hero.moves)){
        hero.moves.forEach(function(m){
          if(m && m.name){
            moveItems.push({ icon: m.icon || '⚔️', ru: m.name, std: 20 });
          }
        });
      }
      if(hero && Array.isArray(hero.attacks)){
        hero.attacks.forEach(function(a){
          if(a && a.name && a.name.trim()){
            moveItems.push({ icon: '🗡️', ru: 'Атака: ' + a.name.trim() + (a.bonus ? (' (' + a.bonus + ')') : ''), std: 20 });
          }
        });
      }
      if(moveItems.length > 0){
        extraCats.push({
          key: 'fae_moves',
          icon: '⚔️',
          ru: 'Приёмы и Атаки героя',
          items: moveItems
        });
      }
      if(extraCats.length > 0){
        return extraCats.concat(baseCats);
      }
    } catch(e){}
  }
  return baseCats;
}
window.getAvailableDiceCategories = getAvailableDiceCategories;

function currentLabelStd(){
  if(diceState.labelCat==='custom' || !diceState.labelCat) return null;
  const cats = (typeof getAvailableDiceCategories === 'function') ? getAvailableDiceCategories() : DICE_LABEL_CATEGORIES;
  const cat = cats.find(c=>c.key===diceState.labelCat);
  if(!cat) return null;
  const item = cat.items.find(i=>i.ru===diceState.label);
  return item ? item.std : null;
}

function diceCategoryOptionsHtml(){
  const cats = getAvailableDiceCategories();
  if(diceState.labelCat && diceState.labelCat !== 'custom' && !cats.some(c=>c.key===diceState.labelCat)){
    diceState.labelCat = '';
    diceState.label = '';
  }
  const cur = diceState.labelCat || '';
  const opt = (val, text)=>`<option value="${escapeAttr(val)}" ${cur===val?'selected':''}>${escapeHtml(text)}</option>`;
  return opt('', '— без подписи —') +
    cats.map(c=>opt(c.key, c.icon+'  '+c.ru)).join('');
}

function diceItemOptionsHtml(){
  const cats = getAvailableDiceCategories();
  const cat = cats.find(c=>c.key===diceState.labelCat);
  if(!cat || !cat.items.length) return '';
  const cur = diceState.label || '';
  return `<option value="">— выберите —</option>` +
    cat.items.map(it=>`<option value="${escapeAttr(it.ru)}" ${cur===it.ru?'selected':''}>${escapeHtml(it.icon+'  '+it.ru)}</option>`).join('');
}

function renderDice(){
  const hasDice = diceState.dice.length>0;
  const trayContent = hasDice
    ? diceState.dice.map(trayDieHtml).join('')
    : `<div class="empty-hint">Нажмите на кость внизу — она появится здесь и сразу будет брошена.<br>Клик по кости на поле убирает её.</div>`;
  const pick = DICE_TYPES.map(s=>
    `<button class="die-btn ${s==='coin'?'die-coin-btn':''}" data-sides="${s}" title="${s==='coin'?'Бросить монету (C)':'Добавить d'+s}">${dieShapeSvg(s,'pick'+s,s==='coin'?'C':s)}</button>`
  ).join('');
  const m = diceState.modifier;
  const label = currentDiceLabel();
  const modPreviewStr = m ? (m > 0 ? (' + ' + m) : (' − ' + Math.abs(m))) : '';
  const custTheme = CUST_THEMES[diceState.customSides] || CUST_THEMES.default;
  const custThemeStyles = `--cust-color:${custTheme.color};--cust-glow:${custTheme.glow};--cust-bg-tint:${custTheme.bg};--cust-border-tint:${custTheme.border};`;

  return `
    ${(function(){
      if(HB.mode==='me'){
        return renderCrumb([{label:'Эффект Массы', nav:'meHome'},{label:'Бросок костей'}]) +
          '<button class="back" data-go="meHome">← Назад в Терминал</button>' +
          '<h1>Бросок костей</h1>' +
          '<p class="subtitle">СИСТЕМЫ АЛЬЯНСА // СИМУЛЯТОР БРОСКОВ MASS EFFECT</p>';
      } else if(HB.mode==='el'){
        return renderCrumb([{label:'Стихия', nav:'elHome'},{label:'Бросок костей'}]) +
          '<button class="back" data-go="elHome">← Назад в Стихию</button>' +
          '<h1>Бросок костей</h1>' +
          '<p class="subtitle">ЭНЕРГИЯ СТИХИЙ // БРОСКИ И МОДИФИКАТОРЫ</p>';
      } else if(HB.mode==='sh'){
        return renderCrumb([{label:'Шиноби', nav:'shHome'},{label:'Бросок костей'}]) +
          '<button class="back" data-go="shHome">← Назад в Свитки</button>' +
          '<h1>Бросок костей</h1>' +
          '<p class="subtitle">Кости судьбы шиноби — чакра, техники и проверки характеристик.</p>';
      } else if(HB.mode==='wi'){
        return renderCrumb([{label:'Ведьмак', nav:'wiHome'},{label:'Бросок костей'}]) +
          '<button class="back" data-go="wiHome">← Назад на большак</button>' +
          '<h1>Кости Судьбы</h1>' +
          '<p class="subtitle">ВЕДЬМАЧЬЬИ ЗНАКИ // СТАЛЬ И СЕРЕБРО // БРОСОК КОСТЕЙ</p>';
      } else if(HB.mode==='hb'){
        return renderCrumb([{label:'Технологии', nav:'hbHome'},{label:'Бросок костей'}]) +
          '<button class="back" data-go="hbHome">← Назад</button>' +
          '<h1>Бросок костей</h1>' +
          '<p class="subtitle">ТЕХНО-ДАЙСЫ // КИБЕРНЕТИКА & ПСИОНИКА</p>';
      } else if(HB.mode==='wz'){
        return renderCrumb([{label:'Волшебник', nav:'wzHome'},{label:'Бросок костей'}]) +
          '<button class="back" data-go="wzHome">← Назад в гостиную</button>' +
          '<h1>Бросок костей</h1>' +
          '<p class="subtitle">МАГИЧЕСКИЕ ДАЙСЫ // ХОГВАРТС & ДУЭЛИ</p>';
      } else if(HB.mode==='sw'){
        return renderCrumb([{label:'Звездные войны', nav:'swHome'},{label:'Бросок костей'}]) +
          '<button class="back" data-go="swHome">← Назад в Голокрон</button>' +
          '<h1>Бросок костей</h1>' +
          '<p class="subtitle">ГОЛОКРОН СУДЬБЫ // СИЛА И СВЕТОВЫЕ МЕЧИ</p>';
      }
      return renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Бросок костей'}]) +
        '<button class="back" data-go="home">← Назад</button>' +
        '<h1>Бросок костей</h1>' +
        '<p class="subtitle">КОСТИ ФАЭРУНА // D&D 5E БРОСОК КОСТЕЙ</p>';
    })()}
    <div class="rule"></div>
    <div class="dice-tray">${trayContent}</div>
    <div class="dice-total-row">
      <div class="hist-tip" id="histTip"></div>
      <div class="dice-history" id="diceHistory">${diceState.history.map((h,i)=>histDieHtml(h,false)).join('')}</div>
      <span class="cap">Итого</span><span class="sum" id="diceTotal">${hasDice?currentDiceTotal():'—'}</span>
    </div>
    <div class="dice-notation" id="diceNotation">${hasDice?diceNotation(false):''}</div>

    <div class="die-pick">
      ${pick}
      <div class="mod-ctrl">
        <span class="cap">Модификатор</span>
        <button class="mod-btn" id="modMinus">−</button>
        <span class="mod-val">${m>0?'+':''}${m}</span>
        <button class="mod-btn" id="modPlus">+</button>
      </div>
    </div>

    <div class="custom-die-box" style="${custThemeStyles}">
      <div class="custom-die-preview-wrap">
        <div class="custom-die-glow-aura"></div>
        <button class="die-btn" id="addCustomDieBtn" title="Бросить кастомный кубик d${diceState.customSides}">
          <span id="customDieSvgWrap">${getCustomPreviewSvg(diceState.customSides, 'custPick')}</span>
        </button>
      </div>
      <div class="custom-die-ctrls">
        <div class="custom-die-title">Кастомный кубик: <span class="custom-highlight" id="customSidesDisplay">1d${diceState.customSides}</span></div>
        <div class="custom-ctrl-row">
          <button class="mod-btn custom-step-btn" id="customDieMinus" title="Убрать грань (−1)">−</button>
          <input type="number" id="customDieInput" min="2" max="100" value="${diceState.customSides}" class="custom-input" title="Количество граней">
          <button class="mod-btn custom-step-btn" id="customDiePlus" title="Добавить грань (+1)">+</button>
          <button class="btn-ghost custom-add-btn" id="customAddDirectBtn">Бросить <span id="customAddSidesNum">d${diceState.customSides}</span></button>
        </div>
        <div class="custom-pills">
          <span class="custom-pills-cap">Быстрый выбор:</span>
          ${[2,3,4,6,7,8,10,12,14,20,100].map(n=>`<button class="custom-pill${diceState.customSides===n?' active':''}" data-sides="${n}">d${n}</button>`).join('')}
        </div>
      </div>
    </div>

    <div class="label-picker">
      <div class="field" style="flex:1;min-width:180px;">
        <label>Категория подписи</label>
        <select id="diceCatSelect">${diceCategoryOptionsHtml()}</select>
      </div>
      <div class="field" id="labelItemField" style="flex:1;min-width:200px;${(diceState.labelCat && diceState.labelCat!=='custom')?'':'display:none;'}">
        <label>Что бросаем</label>
        <select id="diceLabelSelect">${diceItemOptionsHtml()}</select>
      </div>
      <div class="field" id="customLabelField" style="flex:1;min-width:200px;${diceState.labelCat==='custom'?'':'display:none;'}">
        <label>Своя подпись</label>
        <input type="text" id="diceCustomLabel" value="${escapeAttr(diceState.customLabel||'')}" placeholder="напр. Взлом замка">
      </div>
    </div>
    <div class="label-preview" id="labelPreview">${escapeHtml(hasDice ? buildDiceResultLines().join('\n') : `*[Результат броска ${label?label+' ':''}1d20: … ]*${modPreviewStr}`)}</div>

    <div class="dice-actions">
      <button class="btn-primary" id="rollAllBtn" ${hasDice?'':'disabled'}>Кинуть кубики</button>
      <button class="btn-ghost" id="clearDiceBtn" ${hasDice?'':'disabled'}>Очистить</button>
      <button class="btn-ghost" id="copyResultBtn" ${hasDice?'':'disabled'}>Скопировать результат</button>
      <button class="btn-ghost" id="clearHistBtn" ${diceState.history.length?'':'disabled'} title="Очистить ленту истории бросков">🕘 Очистить историю</button>
    </div>
  `;
}

/* ---------- character tracker: data model ---------- */
const ABILITY_KEYS = ['str','dex','con','int','wis','cha'];
const ABILITY_RU = {str:'Сила',dex:'Ловкость',con:'Телосложение',int:'Интеллект',wis:'Мудрость',cha:'Харизма'};

const SKILL_DEFS = [
  {key:'athletics', ru:'Атлетика', ability:'str'},
  {key:'acrobatics', ru:'Акробатика', ability:'dex'},
  {key:'sleight', ru:'Ловкость рук', ability:'dex'},
  {key:'stealth', ru:'Скрытность', ability:'dex'},
  {key:'arcana', ru:'Магия', ability:'int'},
  {key:'history', ru:'История', ability:'int'},
  {key:'investigation', ru:'Расследование', ability:'int'},
  {key:'nature', ru:'Природа', ability:'int'},
  {key:'religion', ru:'Религия', ability:'int'},
  {key:'animal', ru:'Уход за животными', ability:'wis'},
  {key:'insight', ru:'Проницательность', ability:'wis'},
  {key:'medicine', ru:'Медицина', ability:'wis'},
  {key:'perception', ru:'Восприятие', ability:'wis'},
  {key:'survival', ru:'Выживание', ability:'wis'},
  {key:'deception', ru:'Обман', ability:'cha'},
  {key:'intimidation', ru:'Запугивание', ability:'cha'},
  {key:'performance', ru:'Выступление', ability:'cha'},
  {key:'persuasion', ru:'Убеждение', ability:'cha'}
];

function abilityMod(score){ return Math.floor((Number(score||10)-10)/2); }
function fmtMod(n){ return (n>=0?'+':'')+n; }
function profBonus(level){ return Math.floor((Number(level||1)-1)/4)+2; }

const FAE_CLASS_DEFAULTS = {
  'Воин':       { hd:'d10', saves:['str','con'], spell:false, spellAb:'int', armor:'Все доспехи, щиты', weapons:'Простое и воинское оружие' },
  'Варвар':     { hd:'d12', saves:['str','con'], spell:false, spellAb:'wis', armor:'Лёгкие, средние доспехи, щиты', weapons:'Простое и воинское оружие' },
  'Плут':       { hd:'d8',  saves:['dex','int'], spell:false, spellAb:'int', armor:'Лёгкие доспехи', weapons:'Простое оружие, боевые рапиры, короткие мечи, ручные арбалеты' },
  'Монах':      { hd:'d8',  saves:['str','dex'], spell:false, spellAb:'wis', armor:'Без доспехов', weapons:'Простое оружие и воинское лёгкое оружие' },
  'Паладин':    { hd:'d10', saves:['wis','cha'], spell:true,  spellAb:'cha', armor:'Все доспехи, щиты', weapons:'Простое и воинское оружие' },
  'Следопыт':   { hd:'d10', saves:['str','dex'], spell:true,  spellAb:'wis', armor:'Лёгкие, средние доспехи, щиты', weapons:'Простое и воинское оружие' },
  'Жрец':       { hd:'d8',  saves:['wis','cha'], spell:true,  spellAb:'wis', armor:'Лёгкие, средние доспехи, щиты', weapons:'Простое оружие' },
  'Друид':      { hd:'d8',  saves:['int','wis'], spell:true,  spellAb:'wis', armor:'Лёгкие доспехи, щиты', weapons:'Простое оружие' },
  'Бард':       { hd:'d8',  saves:['dex','cha'], spell:true,  spellAb:'cha', armor:'Лёгкие доспехи', weapons:'Простое оружие' },
  'Чародей':    { hd:'d6',  saves:['con','cha'], spell:true,  spellAb:'cha', armor:'Без доспехов', weapons:'Простое оружие' },
  'Колдун':     { hd:'d8',  saves:['wis','cha'], spell:true,  spellAb:'cha', armor:'Лёгкие доспехи', weapons:'Простое оружие' },
  'Волшебник':  { hd:'d6',  saves:['int','wis'], spell:true,  spellAb:'int', armor:'Без доспехов', weapons:'Простое оружие' },
  'Изобретатель':{ hd:'d8', saves:['con','int'], spell:true,  spellAb:'int', armor:'Лёгкие, средние доспехи, щиты', weapons:'Простое оружие, огнестрельное' }
};

function newCharacter(overrides){
  const skillProf={}; SKILL_DEFS.forEach(s=>skillProf[s.key]=0);
  const saveProf={}; ABILITY_KEYS.forEach(a=>saveProf[a]=false);
  saveProf.str = true; saveProf.con = true;
  const slots={}, slotsUsed={};
  for(let i=1;i<=9;i++){ slots[i]=0; slotsUsed[i]=0; }
  const base = {
    id: genId(),
    name:'Искатель приключений', playerName:'', className:'Воин', subclass:'', level:1,
    background:'Солдат', species:'Человек', alignment:'Нейтрально-добрый', xp:0,
    inspiration:false, exhaustion:0, activeCondition:'',
    abilities:{str:15,dex:13,con:14,int:10,wis:12,cha:10},
    saveProf, skillProf,
    ac:16, initMisc:0, speed:30, hpMax:12, hpCurrent:12, hpTemp:0, hitDiceTotal:1, hitDiceType:'d10',
    deathSuccess:0, deathFail:0,
    attacks:[{name:'Длинный меч',bonus:'+5',damage:'1d8+3',type:'рубящий',mastery:'Подрыв (Sap)'}],
    techs:[], moves:[],
    cp:0,sp:0,ep:0,gp:15,pp:0,
    equipment:'Кольчуга, щит, длинный меч, набор путешественника, 15 зм',
    features:'Второе дыхание (1d10 + ур. бонусным действием)\nМастерство оружия (3 вида оружия)',
    profArmor:'Все доспехи, щиты', profWeapons:'Простое и воинское оружие', profTools:'', languages:'Общий',
    traits:'', ideals:'', bonds:'', flaws:'',
    age:'', height:'', weight:'', eyes:'', skin:'', hair:'', backstory:'',
    spellEnabled:false, spellAbility:'int', spellNotes:'', slots, slotsUsed
  };
  if(overrides && typeof overrides === 'object'){
    Object.assign(base, overrides);
  }
  return normalizeFaerunCharacter(base);
}

function normalizeFaerunCharacter(c){
  if(!c || typeof c !== 'object') return newCharacter();
  if(!c.id) c.id = genId();
  if(!c.name) c.name = 'Искатель приключений';
  if(!c.className) c.className = 'Воин';
  if(!c.species) c.species = 'Человек';
  c.level = Math.max(1, Math.min(20, Number(c.level) || 1));
  c.xp = Math.max(0, Number(c.xp) || 0);
  c.inspiration = !!c.inspiration;
  c.exhaustion = Math.max(0, Math.min(6, Number(c.exhaustion) || 0));
  if(!c.abilities || typeof c.abilities !== 'object'){
    c.abilities = {str:10,dex:10,con:10,int:10,wis:10,cha:10};
  }
  ABILITY_KEYS.forEach(k=>{
    if(c.abilities[k] == null || isNaN(Number(c.abilities[k]))) c.abilities[k] = 10;
    else c.abilities[k] = Number(c.abilities[k]);
  });
  if(!c.saveProf || typeof c.saveProf !== 'object') c.saveProf = {};
  ABILITY_KEYS.forEach(k=>{ c.saveProf[k] = !!c.saveProf[k]; });
  if(!c.skillProf || typeof c.skillProf !== 'object') c.skillProf = {};
  SKILL_DEFS.forEach(s=>{ c.skillProf[s.key] = Number(c.skillProf[s.key]) || 0; });
  c.ac = c.ac != null ? Number(c.ac) : 10;
  c.initMisc = Number(c.initMisc) || 0;
  c.speed = c.speed != null ? Number(c.speed) : 30;
  if(!c.hpMax && c.maxHp) c.hpMax = Number(c.maxHp);
  if(c.hpMax == null || c.hpMax <= 0) c.hpMax = 10;
  if(c.hpCurrent == null) c.hpCurrent = (c.hp != null ? Number(c.hp) : c.hpMax);
  c.hpTemp = Number(c.hpTemp) || 0;
  if(!c.hitDiceTotal) c.hitDiceTotal = c.level;
  if(!c.hitDiceType) c.hitDiceType = 'd10';
  c.deathSuccess = Math.max(0, Math.min(3, Number(c.deathSuccess) || 0));
  c.deathFail = Math.max(0, Math.min(3, Number(c.deathFail) || 0));
  if(!Array.isArray(c.attacks) || c.attacks.length === 0){
    c.attacks = [{name:'',bonus:'',damage:'',type:'',mastery:''}];
  } else {
    c.attacks = c.attacks.map(a=>({
      name: (a && a.name) || '',
      bonus: (a && a.bonus) || '',
      damage: (a && a.damage) || '',
      type: (a && a.type) || '',
      mastery: (a && a.mastery) || ''
    }));
  }
  if(!Array.isArray(c.techs)){
    c.techs = [];
  } else {
    c.techs = c.techs.filter(Boolean).map(function(t, idx){
      return {
        id: t.id || ('fae_tech_' + Date.now() + '_' + idx),
        name: t.name || 'Способность',
        icon: t.icon || '✨',
        category: t.category || t.cat || 'Классовые умения',
        cat: t.category || t.cat || 'Классовые умения',
        source: t.source || t.req || '',
        actionCost: t.actionCost || t.cost || '1 действие',
        cooldown: t.cooldown || '',
        checkOrSave: t.checkOrSave || '',
        cost: t.cost || '',
        req: t.req || '',
        dmgN: Number(t.dmgN) || 0,
        dmgD: t.dmgD || 'd0',
        dmgMod: Number(t.dmgMod) || 0,
        desc: t.desc || ''
      };
    });
  }
  if(!Array.isArray(c.moves)){
    c.moves = [];
  } else {
    c.moves = c.moves.filter(Boolean).map(function(m, idx){
      return {
        id: m.id || ('fae_move_' + Date.now() + '_' + idx),
        name: m.name || 'Боевой приём',
        icon: m.icon || '⚔️',
        category: m.category || m.kind || 'Оружейные атаки и Мастерство (2024)',
        kind: m.category || m.kind || 'Оружейные атаки и Мастерство (2024)',
        weaponOrStyle: m.weaponOrStyle || '',
        attackBonus: m.attackBonus || '',
        damageOrSave: m.damageOrSave || '',
        mastery: m.mastery || '',
        actionCost: m.actionCost || m.action || 'Часть действия Атаки',
        action: m.actionCost || m.action || 'Часть действия Атаки',
        trigger: m.trigger || '',
        cost: m.cost || '',
        desc: m.desc || ''
      };
    });
  }
  ['cp','sp','ep','gp','pp'].forEach(k=>{ c[k] = Number(c[k]) || 0; });
  ['playerName','subclass','background','alignment','equipment','features','profArmor','profWeapons','profTools','languages','traits','ideals','bonds','flaws','age','height','weight','eyes','skin','hair','backstory','spellNotes','activeCondition'].forEach(k=>{
    if(c[k] == null) c[k] = '';
  });
  c.spellEnabled = !!c.spellEnabled;
  if(!c.spellAbility || ABILITY_KEYS.indexOf(c.spellAbility) === -1) c.spellAbility = 'int';
  if(!c.slots || typeof c.slots !== 'object') c.slots = {};
  if(!c.slotsUsed || typeof c.slotsUsed !== 'object') c.slotsUsed = {};
  for(let i=1;i<=9;i++){
    c.slots[i] = Number(c.slots[i]) || 0;
    c.slotsUsed[i] = Number(c.slotsUsed[i]) || 0;
  }
  return c;
}

function loadCharacters(){
  try{
    const raw = localStorage.getItem('ttc_characters');
    if(raw){
      const arr = JSON.parse(raw);
      if(Array.isArray(arr) && arr.length > 0){
        return arr.map(normalizeFaerunCharacter);
      }
    }
  }catch(e){}
  const def = newCharacter();
  try{
    localStorage.setItem('ttc_characters', JSON.stringify([def]));
    localStorage.setItem('ttc_faerun_active_id', def.id);
  }catch(e){}
  return [def];
}
function saveCharactersToStorage(){
  try{ localStorage.setItem('ttc_characters', JSON.stringify(CHARACTERS)); }catch(e){}
}
function getActiveFaerunCharacter(){
  if(!Array.isArray(CHARACTERS) || CHARACTERS.length === 0){
    const def = newCharacter();
    CHARACTERS = [def];
    saveCharactersToStorage();
    try{ localStorage.setItem('ttc_faerun_active_id', def.id); }catch(e){}
    return def;
  }
  try{
    var activeId = localStorage.getItem('ttc_faerun_active_id');
    if(activeId){
      var found = CHARACTERS.find(function(c){ return c.id === activeId; });
      if(found) return normalizeFaerunCharacter(found);
    }
  }catch(e){}
  var first = normalizeFaerunCharacter(CHARACTERS[0]);
  try{ localStorage.setItem('ttc_faerun_active_id', first.id); }catch(e){}
  return first;
}
window.getActiveFaerunCharacter = getActiveFaerunCharacter;

function setActiveFaerunCharacter(id){
  try{
    if(id) localStorage.setItem('ttc_faerun_active_id', id);
    else localStorage.removeItem('ttc_faerun_active_id');
  }catch(e){}
  if(typeof paintShBar === 'function') paintShBar();
  if(typeof updateHbSegIndicator === 'function') updateHbSegIndicator(false);
}
window.setActiveFaerunCharacter = setActiveFaerunCharacter;

function genId(){
  return 'char_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
}
function setPath(obj, path, value){
  const parts = path.split('.');
  let cur = obj;
  for(let i=0;i<parts.length-1;i++){
    if(cur[parts[i]] == null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length-1]] = value;
}
function getPath(obj, path){
  return path.split('.').reduce((o,k)=>(o==null?o:o[k]), obj);
}

/* ---------- Rules 2024 reference data ---------- */
const WEAPON_MASTERY = [
  {ru:"Рассечение", orig:"Cleave", desc:"При попадании рукопашной атакой можно тут же атаковать второе существо в 5 футах от первого и в пределах вашей досягаемости; урон второй атаки без модификатора характеристики (если он не отрицательный)."},
  {ru:"Царапина", orig:"Graze", desc:"При промахе всё равно наносите цели урон, равный модификатору характеристики, использованному для атаки."},
  {ru:"Засечка", orig:"Nick", desc:"Атакуя двумя лёгким оружием, можно сделать дополнительную атаку лёгким оружием как часть действия Атака, а не бонусным действием — лишь раз за ход."},
  {ru:"Толчок", orig:"Push", desc:"При попадании можно оттолкнуть цель (не крупнее Большого размера) на 10 футов от себя."},
  {ru:"Подрыв", orig:"Sap", desc:"При попадании цель получает помеху на свою следующую атаку до начала вашего следующего хода."},
  {ru:"Замедление", orig:"Slow", desc:"При попадании и нанесении урона скорость цели уменьшается на 10 футов до начала вашего следующего хода."},
  {ru:"Опрокидывание", orig:"Topple", desc:"При попадании цель проходит спасбросок Телосложения (СЛ 8 + модификатор + бонус мастерства) или падает и получает состояние «Лежит»."},
  {ru:"Раздражение", orig:"Vex", desc:"При попадании и нанесении урона получаете преимущество на следующую атаку по этой же цели до конца вашего следующего хода."}
];

const CONDITIONS_2024 = [
  {ru:"Ослеплён", orig:"Blinded", desc:"Не видит и автоматически проваливает проверки, требующие зрения; атаки по нему — с преимуществом, его атаки — с помехой."},
  {ru:"Очарован", orig:"Charmed", desc:"Не может атаковать очаровавшего или использовать против него вредные способности; у очаровавшего преимущество на социальные проверки к нему."},
  {ru:"Оглохший", orig:"Deafened", desc:"Не слышит и автоматически проваливает проверки, требующие слуха."},
  {ru:"Испуган", orig:"Frightened", desc:"Помеха на проверки характеристик и броски атаки, пока источник страха в поле зрения; не может по своей воле приближаться к нему."},
  {ru:"Схвачен", orig:"Grappled", desc:"Скорость становится 0. Заканчивается, если схвативший недееспособен или существо покидает его досягаемость."},
  {ru:"Недееспособен", orig:"Incapacitated", desc:"Не может совершать действия, бонусные действия или реакции."},
  {ru:"Невидим", orig:"Invisible", desc:"Не виден без особых средств; атаки по нему — с помехой, его атаки — с преимуществом."},
  {ru:"Парализован", orig:"Paralyzed", desc:"Недееспособен, не может двигаться и говорить; автоматически проваливает спасброски Силы и Ловкости; атаки по нему — с преимуществом, попадания в упор — критические."},
  {ru:"Окаменел", orig:"Petrified", desc:"Превращён в твёрдое вещество, недееспособен, не осознаёт окружение; автопровал спасбросков Силы/Ловкости; сопротивление всему урону, иммунитет к яду и болезням."},
  {ru:"Отравлен", orig:"Poisoned", desc:"Помеха на броски атаки и проверки характеристик."},
  {ru:"Лежит", orig:"Prone", desc:"Может только ползти (или встать, потратив половину скорости); помеха на броски атаки; рукопашные атаки по нему — с преимуществом, дальнобойные — с помехой."},
  {ru:"Опутан", orig:"Restrained", desc:"Скорость 0; помеха на броски атаки и спасброски Ловкости; атаки по нему — с преимуществом."},
  {ru:"Ошеломлён", orig:"Stunned", desc:"Недееспособен, не может двигаться, говорит с запинками; автопровал спасбросков Силы/Ловкости; атаки по нему — с преимуществом."},
  {ru:"Без сознания", orig:"Unconscious", desc:"Недееспособен, не может двигаться и говорить, роняет предметы, падает и лежит; автопровал спасбросков Силы/Ловкости; атаки по нему — с преимуществом, попадания в упор — критические."}
];

const EXHAUSTION_LEVELS = Array.from({length:6},(_,i)=>{
  const lvl = i+1;
  const penalty = lvl*2;
  const speed = lvl*5;
  return {
    ru: `Истощение ${lvl}`,
    desc: lvl<6
      ? `−${penalty} ко всем проверкам d20, скорость −${speed} фт.`
      : `−${penalty} ко всем проверкам d20, скорость −${speed} фт. Персонаж умирает.`
  };
});

const COVER_RULES = [
  {ru:"Половинное укрытие", desc:"+2 к КД и спасброскам Ловкости."},
  {ru:"Укрытие на три четверти", desc:"+5 к КД и спасброскам Ловкости."},
  {ru:"Полное укрытие", desc:"Нельзя быть целью прямой атаки или заклинания."}
];

const MISC_RULES_2024 = [
  {ru:"Героическое вдохновение", desc:"Замена преимуществу: потратьте, чтобы перебросить любой один кубик после броска (не только d20) и оставить новый результат. Можно подарить другому игроку."}
];

/* ---------- Алхимия, Травничество и Яды D&D 5e / 2024 ---------- */
const FAE_ALCHEMY_COMPENDIUM = [
  /* 1. Зелья и Эликсиры */
  {
    id: 'alch_ref_heal_common',
    name: 'Зелье лечения (Potion of Healing)',
    icon: '❤️',
    cat: 'Зелья и Эликсиры',
    rarity: 'Обычный',
    kit: 'herbalism',
    cost: 25,
    marketPrice: '50 зм',
    time: '1 рабочий день (8 ч)',
    dc: 10,
    ingredients: [{ name: 'Королевский лист (Лургас)', qty: 2 }, { name: 'Чистая родниковая вода', qty: 1 }],
    effect: 'Густая рубиновая жидкость, мерцающая при встряхивании. В редакции D&D 2024 выпивается или вливается союзнику Бонусным действием: мгновенно восстанавливает 2d4 + 2 хитов.'
  },
  {
    id: 'alch_ref_heal_greater',
    name: 'Большое зелье лечения (Greater Healing)',
    icon: '❤️‍🔥',
    cat: 'Зелья и Эликсиры',
    rarity: 'Необычный',
    kit: 'herbalism',
    cost: 100,
    marketPrice: '150–200 зм',
    time: '5 дней',
    dc: 13,
    ingredients: [{ name: 'Королевский лист (Лургас)', qty: 3 }, { name: 'Концентрат сока алоэ', qty: 1 }, { name: 'Пыльца солнечника', qty: 1 }],
    effect: 'Насыщенный алый эликсир. При употреблении Бонусным действием восстанавливает 4d4 + 4 хитов.'
  },
  {
    id: 'alch_ref_heal_superior',
    name: 'Превосходное зелье лечения (Superior Healing)',
    icon: '💖',
    cat: 'Зелья и Эликсиры',
    rarity: 'Редкий',
    kit: 'herbalism',
    cost: 1000,
    marketPrice: '500–2000 зм',
    time: '15 дней',
    dc: 16,
    ingredients: [{ name: 'Слёзы Селунэ', qty: 2 }, { name: 'Очищенная кровь тролля', qty: 1 }, { name: 'Сон-трава Латандера', qty: 2 }],
    effect: 'Сияющий карминный состав высшей очистки. Бонусным действием восстанавливает 8d4 + 8 хитов и затягивает глубокие раны.'
  },
  {
    id: 'alch_ref_heal_supreme',
    name: 'Высшее зелье лечения (Supreme Healing)',
    icon: '🌟',
    cat: 'Зелья и Эликсиры',
    rarity: 'Очень редкий',
    kit: 'herbalism',
    cost: 5000,
    marketPrice: '5000–10000 зм',
    time: '30 дней',
    dc: 18,
    ingredients: [{ name: 'Эссенция пера феникса', qty: 1 }, { name: 'Золотой лотос', qty: 2 }, { name: 'Слёзы Селунэ', qty: 2 }],
    effect: 'Вершина искусства травников Фаэруна. Бонусным действием восстанавливает 10d4 + 20 хитов.'
  },
  {
    id: 'alch_ref_antitoxin',
    name: 'Противоядие (Antitoxin)',
    icon: '🧪',
    cat: 'Зелья и Эликсиры',
    rarity: 'Обычный',
    kit: 'herbalism',
    cost: 25,
    marketPrice: '50 зм',
    time: '4 часа',
    dc: 11,
    ingredients: [{ name: 'Змеиный корень', qty: 1 }, { name: 'Активированный древесный уголь', qty: 1 }],
    effect: 'Горькая изумрудная микстура. Существо, выпившее этот фиал Бонусным действием, получает Преимущество на спасброски против яда на 1 час.'
  },
  {
    id: 'alch_ref_heroism',
    name: 'Зелье героизма (Potion of Heroism)',
    icon: '🦁',
    cat: 'Зелья и Эликсиры',
    rarity: 'Редкий',
    kit: 'herbalism',
    cost: 500,
    marketPrice: '1000 зм',
    time: '10 дней',
    dc: 15,
    ingredients: [{ name: 'Сердцевина дуба Сильвануса', qty: 1 }, { name: 'Рубиновая пыль', qty: 1 }],
    effect: 'Пенящийся синий отвар. На 1 час вы получаете 10 временных хитов и находитесь под действием заклинания «Благословение» (+1d4 ко всем броскам атаки и спасброскам, концентрация не требуется).'
  },
  {
    id: 'alch_ref_speed',
    name: 'Зелье скорости (Potion of Speed)',
    icon: '⚡',
    cat: 'Зелья и Эликсиры',
    rarity: 'Очень редкий',
    kit: 'alchemist',
    cost: 4000,
    marketPrice: '8000 зм',
    time: '25 дней',
    dc: 18,
    ingredients: [{ name: 'Перо стремительного грифона', qty: 1 }, { name: 'Ртутный дистиллят', qty: 1 }, { name: 'Электрический кварц', qty: 1 }],
    effect: 'Жёлтое зелье с чёрными прожилками. На 1 минуту даёт эффект заклинания «Ускорение» (без концентрации и без волны вялости по окончании): скорость удваивается, +2 к КД, преимущество на спасброски Ловкости и 1 дополнительное действие в каждый ход.'
  },
  {
    id: 'alch_ref_invisibility',
    name: 'Зелье невидимости (Potion of Invisibility)',
    icon: '👻',
    cat: 'Зелья и Эликсиры',
    rarity: 'Очень редкий',
    kit: 'alchemist',
    cost: 2500,
    marketPrice: '5000 зм',
    time: '20 дней',
    dc: 17,
    ingredients: [{ name: 'Пыльца пикси', qty: 1 }, { name: 'Светящийся мох Подземья', qty: 2 }],
    effect: 'Флакон кажется совершенно пустым, но ощущается тяжёлым. Выпив его, вы и всё ваше снаряжение получаете состояние «Невидим» на 1 час. Эффект прекращается досрочно, если вы атакуете или сотворите заклинание.'
  },
  {
    id: 'alch_ref_flying',
    name: 'Зелье полёта (Potion of Flying)',
    icon: '🦅',
    cat: 'Зелья и Эликсиры',
    rarity: 'Очень редкий',
    kit: 'alchemist',
    cost: 2500,
    marketPrice: '5000 зм',
    time: '20 дней',
    dc: 17,
    ingredients: [{ name: 'Перо воздушного элементаля', qty: 1 }, { name: 'Эфирный конденсат облаков', qty: 1 }],
    effect: 'Прозрачная жидкость с плавающими белыми облачками. На 1 час даёт вам скорость полёта, равную вашей скорости ходьбы, а также возможность зависать в воздухе.'
  },
  {
    id: 'alch_ref_giant_hill',
    name: 'Зелье силы холмового великана (Hill Giant Strength)',
    icon: '💪',
    cat: 'Зелья и Эликсиры',
    rarity: 'Необычный',
    kit: 'alchemist',
    cost: 200,
    marketPrice: '400 зм',
    time: '5 дней',
    dc: 13,
    ingredients: [{ name: 'Ноготь холмового великана', qty: 1 }, { name: 'Железный купорос', qty: 1 }],
    effect: 'Внутри прозрачного геля плавает осколок великанского ногтя. На 1 час ваша характеристика Силы становится равной 21 (+5).'
  },
  {
    id: 'alch_ref_giant_fire',
    name: 'Зелье силы огненного великана (Fire Giant Strength)',
    icon: '🔥',
    cat: 'Зелья и Эликсиры',
    rarity: 'Редкий',
    kit: 'alchemist',
    cost: 1000,
    marketPrice: '2000 зм',
    time: '15 дней',
    dc: 16,
    ingredients: [{ name: 'Кровь огненного великана', qty: 1 }, { name: 'Пепельник Невервинтера', qty: 2 }],
    effect: 'Горячее оранжево-багровое зелье. На 1 час ваша характеристика Силы становится равной 25 (+7).'
  },
  {
    id: 'alch_ref_giant_storm',
    name: 'Зелье силы штормового великана (Storm Giant Strength)',
    icon: '🌩️',
    cat: 'Зелья и Эликсиры',
    rarity: 'Легендарный',
    kit: 'alchemist',
    cost: 10000,
    marketPrice: '20000 зм',
    time: '50 дней',
    dc: 20,
    ingredients: [{ name: 'Осколок грозового кристалла великана', qty: 1 }, { name: 'Эссенция первородной бури', qty: 1 }],
    effect: 'Фиолетовая жидкость, в которой проскакивают настоящие молнии. На 1 час ваша характеристика Силы становится равной 29 (+9).'
  },
  {
    id: 'alch_ref_resistance',
    name: 'Зелье сопротивления стихиям (Potion of Resistance)',
    icon: '🛡️',
    cat: 'Зелья и Эликсиры',
    rarity: 'Необычный',
    kit: 'alchemist',
    cost: 150,
    marketPrice: '300 зм',
    time: '5 дней',
    dc: 13,
    ingredients: [{ name: 'Драконья чешуйка / Элементальная соль', qty: 1 }, { name: 'Базовый эликсир стойкости', qty: 1 }],
    effect: 'На 1 час даёт Сопротивление одному типу урона (определяется при варке): огонь, холод, электричество, кислота, яд, звук, излучение, некротическая энергия или силовое поле.'
  },
  {
    id: 'alch_ref_water_breath',
    name: 'Зелье подводного дыхания (Water Breathing)',
    icon: '🫧',
    cat: 'Зелья и Эликсиры',
    rarity: 'Необычный',
    kit: 'herbalism',
    cost: 100,
    marketPrice: '200 зм',
    time: '4 дня',
    dc: 12,
    ingredients: [{ name: 'Жаберная водоросль Моря Мечей', qty: 2 }, { name: 'Перламутровая пыль', qty: 1 }],
    effect: 'Мутновато-зелёное зелье с запахом морского бриза. Позволяет дышать под водой в течение 24 часов (D&D 2024), сохраняя обычное дыхание на суше.'
  },
  {
    id: 'alch_ref_mind_reading',
    name: 'Зелье чтения мыслей (Potion of Mind Reading)',
    icon: '👁️',
    cat: 'Зелья и Эликсиры',
    rarity: 'Редкий',
    kit: 'alchemist',
    cost: 750,
    marketPrice: '1500 зм',
    time: '12 дней',
    dc: 15,
    ingredients: [{ name: 'Светящийся мох Подземья', qty: 2 }, { name: 'Спинномозговой ликвор иллитида / краниальной крысы', qty: 1 }],
    effect: 'Густая пурпурная жидкость с розовым облачком. На 10 минут даёт эффект заклинания «Обнаружение мыслей» (СЛ спасброска Мудрости 13).'
  },
  {
    id: 'alch_ref_elixir_health',
    name: 'Эликсир здоровья (Elixir of Health)',
    icon: '✨',
    cat: 'Зелья и Эликсиры',
    rarity: 'Редкий',
    kit: 'herbalism',
    cost: 600,
    marketPrice: '1200 зм',
    time: '10 дней',
    dc: 15,
    ingredients: [{ name: 'Сон-трава Латандера', qty: 2 }, { name: 'Слёзы Селунэ', qty: 1 }],
    effect: 'Прозрачная голубоватая вода с крошечными пузырьками света. Излечивает все болезни и мгновенно снимает состояния: Ослеплён, Оглохший, Парализован и Отравлен.'
  },
  {
    id: 'alch_ref_vitality',
    name: 'Зелье живучести (Potion of Vitality)',
    icon: '🩸',
    cat: 'Зелья и Эликсиры',
    rarity: 'Очень редкий',
    kit: 'herbalism',
    cost: 2000,
    marketPrice: '4000 зм',
    time: '15 дней',
    dc: 17,
    ingredients: [{ name: 'Очищенная кровь тролля', qty: 2 }, { name: 'Сердцевина древня', qty: 1 }],
    effect: 'Пульсирующий багровый эликсир. Снимает все уровни Истощения, исцеляет от любых ядов и болезней. В течение следующих 24 часов вы восстанавливаете максимум возможных хитов при любой трате Костей Хитов.'
  },

  /* 2. Алхимические смеси и Бомбы */
  {
    id: 'alch_ref_fire',
    name: 'Алхимический огонь (Alchemist\'s Fire)',
    icon: '🔥',
    cat: 'Алхимические смеси и Бомбы',
    rarity: 'Обычный',
    kit: 'alchemist',
    cost: 25,
    marketPrice: '50 зм',
    time: '1 рабочий день',
    dc: 12,
    ingredients: [{ name: 'Горючая смола', qty: 2 }, { name: 'Пепельник Невервинтера / Белый фосфор', qty: 1 }, { name: 'Стеклянная колба', qty: 1 }],
    effect: 'Липкая воспламеняющаяся на воздухе жидкость. Действием метните колбу на дистанцию до 20 фт (спасбросок Ловкости в 2024: СЛ 8 + Лов + БМ). При провале цель получает 1d4 урона огнём и загорается (1d4 урона огнём в конце каждого её хода, пока пламя не сбито).'
  },
  {
    id: 'alch_ref_acid',
    name: 'Колба с кислотой (Acid Vial)',
    icon: '🧪',
    cat: 'Алхимические смеси и Бомбы',
    rarity: 'Обычный',
    kit: 'alchemist',
    cost: 12,
    marketPrice: '25 зм',
    time: '4 часа',
    dc: 11,
    ingredients: [{ name: 'Едкий купорос', qty: 1 }, { name: 'Желудочный сок слизи / кислоты', qty: 1 }, { name: 'Стеклянный фиал', qty: 1 }],
    effect: 'Шипящая зелёная кислота. Действием выплесните на 5 фт или метните на 20 фт. Цель проходит спасбросок Ловкости (СЛ 8 + Лов + БМ) или получает 2d6 урона кислотой.'
  },
  {
    id: 'alch_ref_holy_water',
    name: 'Святая вода (Holy Water)',
    icon: '⛲',
    cat: 'Алхимические смеси и Бомбы',
    rarity: 'Обычный',
    kit: 'herbalism',
    cost: 25,
    marketPrice: '25 зм',
    time: '1 час',
    dc: 10,
    ingredients: [{ name: 'Толчёное серебро (на 25 зм)', qty: 1 }, { name: 'Родниковая вода', qty: 1 }],
    effect: 'При попадании по Исчадию (Fiend) или Нежити (Undead) на дистанции до 20 фт наносит 2d6 урона излучением.'
  },
  {
    id: 'alch_ref_smoke_bomb',
    name: 'Дымовая шашка Лантана (Alchemical Smoke Bomb)',
    icon: '💨',
    cat: 'Алхимические смеси и Бомбы',
    rarity: 'Необычный',
    kit: 'alchemist',
    cost: 40,
    marketPrice: '80 зм',
    time: '1 день',
    dc: 13,
    ingredients: [{ name: 'Дымный порох Лантана', qty: 1 }, { name: 'Селитра и смола', qty: 1 }],
    effect: 'При броске в точку в пределах 30 футов мгновенно выпускает густое облако сизого дыма радиусом 15 футов на 1 минуту. Область внутри считается Сильно заслонённой (существа внутри ослеплены для внешних наблюдателей). Сильный ветер рассеивает дым за 1 раунд.'
  },
  {
    id: 'alch_ref_tanglefoot',
    name: 'Сумка с путами (Tanglefoot Bag)',
    icon: '🕸️',
    cat: 'Алхимические смеси и Бомбы',
    rarity: 'Необычный',
    kit: 'alchemist',
    cost: 50,
    marketPrice: '100 зм',
    time: '1 день',
    dc: 13,
    ingredients: [{ name: 'Паучий шёлк Подземья', qty: 1 }, { name: 'Липкая болотная смола', qty: 2 }],
    effect: 'Кожаный мешочек с быстротвердеющей алхимической патокой. Метните в существо в пределах 20 фт: цель проходит спасбросок Ловкости СЛ 13 или получает состояние «Опутан» (Restrained, скорость 0) на 1 минуту. Существо может вырваться действием, пройдя проверку Силы (Атлетика) СЛ 13.'
  },
  {
    id: 'alch_ref_thunderstone',
    name: 'Громовой камень (Thunderstone)',
    icon: '💥',
    cat: 'Алхимические смеси и Бомбы',
    rarity: 'Необычный',
    kit: 'alchemist',
    cost: 75,
    marketPrice: '150 зм',
    time: '2 дня',
    dc: 14,
    ingredients: [{ name: 'Кварцевая жеода', qty: 1 }, { name: 'Гремучая ртуть', qty: 1 }],
    effect: 'Кристаллический снаряд, детонирующий при ударе о твёрдую поверхность (дистанция 30 фт). Каждое существо в радиусе 10 футов проходит спасбросок Телосложения СЛ 13: при провале получает 2d6 урона звуком, отбрасывается на 10 футов и становится «Оглохшим» на 1 минуту.'
  },
  {
    id: 'alch_ref_solvent',
    name: 'Универсальный растворитель (Universal Solvent)',
    icon: '💧',
    cat: 'Алхимические смеси и Бомбы',
    rarity: 'Легендарный',
    kit: 'alchemist',
    cost: 5000,
    marketPrice: '10000 зм',
    time: '30 дней',
    dc: 20,
    ingredients: [{ name: 'Эфирный спирт', qty: 2 }, { name: 'Слеза алхимического гомункула', qty: 1 }],
    effect: 'Молочно-белая жидкость с резким спиртовым запахом. Действием вы можете вылить содержимое тюбика на поверхность в пределах досягаемости: мгновенно растворяет до 1 квадратного фута любого клея или смолы (включая Суверенный клей и паутину).'
  },
  {
    id: 'alch_ref_glue',
    name: 'Суверенный клей (Sovereign Glue)',
    icon: '🏺',
    cat: 'Алхимические смеси и Бомбы',
    rarity: 'Легендарный',
    kit: 'alchemist',
    cost: 5000,
    marketPrice: '10000 зм',
    time: '30 дней',
    dc: 20,
    ingredients: [{ name: 'Железа мимика', qty: 2 }, { name: 'Алмазная пыль', qty: 1 }],
    effect: 'Вязкая янтарная субстанция, хранящаяся только во флаконе, обработанном Маслом скольжения. За 1 минуту намертво соединяет любые два предмета (площадью до 1 кв. фт). Соединение можно разрушить только Универсальным растворителем, Маслом эфирности или заклинанием «Желание».'
  },

  /* 3. Боевые масла и Покрытия */
  {
    id: 'alch_ref_oil_sharpness',
    name: 'Масло остроты (Oil of Sharpness)',
    icon: '🗡️',
    cat: 'Боевые масла и Покрытия',
    rarity: 'Очень редкий',
    kit: 'alchemist',
    cost: 1600,
    marketPrice: '3200 зм',
    time: '20 дней',
    dc: 18,
    ingredients: [{ name: 'Алмазный абразив', qty: 2 }, { name: 'Ртутное масло', qty: 1 }],
    effect: 'Прозрачное желе с крошечными серебряными осколками. Наносится на одно рубящее или колющее оружие (или до 5 боеприпасов) за 1 минуту. На 1 час покрытый предмет становится магическим и получает бонус +3 к броскам атаки и урона.'
  },
  {
    id: 'alch_ref_oil_slipperiness',
    name: 'Масло скольжения (Oil of Slipperiness)',
    icon: '🌊',
    cat: 'Боевые масла и Покрытия',
    rarity: 'Необычный',
    kit: 'alchemist',
    cost: 200,
    marketPrice: '400 зм',
    time: '5 дней',
    dc: 13,
    ingredients: [{ name: 'Слизь пещерного червя', qty: 1 }, { name: 'Очищенный рыбий жир', qty: 1 }],
    effect: 'Густая чёрная мазь. При нанесении на существо (10 минут) даёт эффект заклинания «Свобода перемещения» на 8 часов. Либо действием выливается на пол (квадрат 10×10 фт), создавая эффект заклинания «Скольжение» (Grease) на 8 часов.'
  },
  {
    id: 'alch_ref_oil_etherealness',
    name: 'Масло эфирности (Oil of Etherealness)',
    icon: '🌫️',
    cat: 'Боевые масла и Покрытия',
    rarity: 'Редкий',
    kit: 'alchemist',
    cost: 800,
    marketPrice: '1600 зм',
    time: '12 дней',
    dc: 16,
    ingredients: [{ name: 'Шёлковая железа фазового паука', qty: 1 }, { name: 'Светящийся мох Подземья', qty: 2 }],
    effect: 'Серая клубящаяся мазь. После втирания в кожу и снаряжение (10 минут) существо переходит на Пограничный Эфирный План (эффект заклинания «Эфирность») на 1 час.'
  },
  {
    id: 'alch_ref_silver_paste',
    name: 'Алхимическая серебряная паста (Silvercoat Paste)',
    icon: '🪙',
    cat: 'Боевые масла и Покрытия',
    rarity: 'Обычный',
    kit: 'alchemist',
    cost: 35,
    marketPrice: '70 зм',
    time: '2 часа',
    dc: 11,
    ingredients: [{ name: 'Серебряный порошок', qty: 1 }, { name: 'Восковая основа', qty: 1 }],
    effect: 'Наносится действием на 1 оружие ближнего боя или 10 стрел/болтов. В течение 24 часов оружие считается посеребрённым для преодоления сопротивления и иммунитета оборотней (Ликантропов), Дьяволов и Нежити.'
  },
  {
    id: 'alch_ref_flame_resin',
    name: 'Пламенная смола Коссута (Flameblade Resin)',
    icon: '🔥',
    cat: 'Боевые масла и Покрытия',
    rarity: 'Необычный',
    kit: 'alchemist',
    cost: 100,
    marketPrice: '200 зм',
    time: '1 день',
    dc: 13,
    ingredients: [{ name: 'Пепельник Невервинтера', qty: 1 }, { name: 'Железа огненного жука', qty: 2 }],
    effect: 'Бонусным действием наносится на оружие ближнего боя: клинок вспыхивает пламенем на 1 минуту, излучая яркий свет в радиусе 20 футов и нанося дополнительно +1d6 урона огнём при каждом попадании.'
  },
  {
    id: 'alch_ref_frost_oil',
    name: 'Хладный закал Ориль (Frostbite Coating)',
    icon: '❄️',
    cat: 'Боевые масла и Покрытия',
    rarity: 'Необычный',
    kit: 'alchemist',
    cost: 100,
    marketPrice: '200 зм',
    time: '1 день',
    dc: 13,
    ingredients: [{ name: 'Ледяной вереск Долины', qty: 2 }, { name: 'Эфирный спирт', qty: 1 }],
    effect: 'Бонусным действием покрывает оружие морозной изморозью на 1 минуту. При попадании наносит дополнительно +1d4 урона холодом и снижает скорость цели на 10 футов до начала вашего следующего хода.'
  },

  /* 4. Яды и Токсины (DMG / 2024) */
  {
    id: 'alch_ref_poison_basic',
    name: 'Базовый яд (Basic Poison)',
    icon: '☠️',
    cat: 'Яды и Токсины',
    rarity: 'Обычный',
    kit: 'poisoner',
    cost: 50,
    marketPrice: '100 зм',
    time: '4 часа',
    dc: 10,
    ingredients: [{ name: 'Вытяжка болиголова', qty: 1 }, { name: 'Змеиная желчь', qty: 1 }],
    effect: 'Оружейный яд. В редакции 2024 наносится Бонусным действием на одно оружие или 3 боеприпаса (сохраняет силу 1 минуту). При попадании цель получает дополнительно 1d4 урона ядом.'
  },
  {
    id: 'alch_ref_poison_drow',
    name: 'Снотворный яд дроу (Drow Poison)',
    icon: '🕷️',
    cat: 'Яды и Токсины',
    rarity: 'Необычный',
    kit: 'poisoner',
    cost: 100,
    marketPrice: '200 зм',
    time: '3 дня',
    dc: 13,
    ingredients: [{ name: 'Чёрная поганка Мензоберранзана', qty: 2 }, { name: 'Паучий нейротоксин', qty: 1 }],
    effect: 'Оружейный яд темных эльфов Подземья. Поражённая цель проходит спасбросок Телосложения СЛ 13: при провале получает состояние «Отравлен» на 1 час. Если спасбросок провален на 5 или более единиц, цель также теряет сознание («Без сознания»), пока не получит урон или кто-либо не потратит действие, чтобы растолкать её.'
  },
  {
    id: 'alch_ref_poison_crawler',
    name: 'Слизь падальщика (Crawler Mucus)',
    icon: '🐛',
    cat: 'Яды и Токсины',
    rarity: 'Необычный',
    kit: 'poisoner',
    cost: 100,
    marketPrice: '200 зм',
    time: '3 дня',
    dc: 13,
    ingredients: [{ name: 'Парализующая слизь усиков падальщика', qty: 1 }],
    effect: 'Контактный яд. Существо, коснувшееся смазанного предмета, проходит спасбросок Телосложения СЛ 13: при провале получает состояние «Отравлен» и «Парализован» на 1 минуту. Цель повторяет спасбросок в конце каждого своего хода.'
  },
  {
    id: 'alch_ref_poison_malice',
    name: 'Злоба (Malice)',
    icon: '👁️‍🗨️',
    cat: 'Яды и Токсины',
    rarity: 'Необычный',
    kit: 'poisoner',
    cost: 125,
    marketPrice: '250 зм',
    time: '4 дня',
    dc: 15,
    ingredients: [{ name: 'Споры слепящего трутовика', qty: 2 }, { name: 'Серный порошок', qty: 1 }],
    effect: 'Вдыхаемый яд (куб 5 фт). Существо проходит спасбросок Телосложения СЛ 15 или становится «Отравлено» на 1 час. Пока действует это отравление, существо также имеет состояние «Ослеплён».'
  },
  {
    id: 'alch_ref_poison_truth',
    name: 'Сыворотка правды (Truth Serum)',
    icon: '🗣️',
    cat: 'Яды и Токсины',
    rarity: 'Необычный',
    kit: 'poisoner',
    cost: 75,
    marketPrice: '150 зм',
    time: '2 дня',
    dc: 11,
    ingredients: [{ name: 'Корень сонного лотоса', qty: 1 }, { name: 'Серебряный дистиллят', qty: 1 }],
    effect: 'Поглощаемый состав (подмешивается в напиток или еду). Цель проходит спасбросок Телосложения СЛ 11: при провале в течение 1 часа не может намеренно произнести ложь, как если бы находилась под действием заклинания «Область истины».'
  },
  {
    id: 'alch_ref_poison_assassin',
    name: 'Кровь ассасина (Assassin\'s Blood)',
    icon: '🩸',
    cat: 'Яды и Токсины',
    rarity: 'Необычный',
    kit: 'poisoner',
    cost: 75,
    marketPrice: '150 зм',
    time: '2 дня',
    dc: 12,
    ingredients: [{ name: 'Ягоды белладонны', qty: 2 }, { name: 'Кристаллический мышьяк', qty: 1 }],
    effect: 'Поглощаемый яд. Существо проходит спасбросок Телосложения СЛ 10: при провале получает 1d12 урона ядом и состояние «Отравлен» на 24 часа. При успехе получает половину урона и не отравляется.'
  },
  {
    id: 'alch_ref_poison_pale',
    name: 'Бледная настойка (Pale Tincture)',
    icon: '💀',
    cat: 'Яды и Токсины',
    rarity: 'Редкий',
    kit: 'poisoner',
    cost: 125,
    marketPrice: '250 зм',
    time: '4 дня',
    dc: 16,
    ingredients: [{ name: 'Белый болиголов', qty: 2 }, { name: 'Прах умертвия', qty: 1 }],
    effect: 'Поглощаемый яд без вкуса и запаха. Спасбросок Телосложения СЛ 16: при провале 1d6 урона ядом и состояние «Отравлен». Каждые 24 часа цель повторяет спасбросок, получая 1d6 урона ядом при провале (этот урон снижает максимум хитов цели и не лечится магией, пока яд не выведен семью успешными спасбросками).'
  },
  {
    id: 'alch_ref_poison_wyvern',
    name: 'Яд виверны (Wyvern Poison)',
    icon: '🐉',
    cat: 'Яды и Токсины',
    rarity: 'Редкий',
    kit: 'poisoner',
    cost: 600,
    marketPrice: '1200 зм',
    time: '10 дней',
    dc: 15,
    ingredients: [{ name: 'Хвостовая ядовитая железа виверны', qty: 1 }],
    effect: 'Оружейный яд. Поражённая атакой цель проходит спасбросок Телосложения СЛ 15: получает 7d6 (24) урона ядом при провале или половину этого урона при успехе.'
  },
  {
    id: 'alch_ref_poison_midnight',
    name: 'Полуночные слёзы (Midnight Tears)',
    icon: '🌙',
    cat: 'Яды и Токсины',
    rarity: 'Очень редкий',
    kit: 'poisoner',
    cost: 750,
    marketPrice: '1500 зм',
    time: '12 дней',
    dc: 17,
    ingredients: [{ name: 'Чёрный лотос Чулта', qty: 1 }, { name: 'Ночная роса святилища Шар', qty: 1 }],
    effect: 'Поглощаемый яд идеального убийства. Не оказывает абсолютно никакого эффекта до наступления полуночи. Ровно в полночь жертва проходит спасбросок Телосложения СЛ 17: получает 9d6 (31) урона ядом при провале или половину при успехе.'
  },
  {
    id: 'alch_ref_poison_worm',
    name: 'Яд пурпурного червя (Purple Worm Poison)',
    icon: '🪱',
    cat: 'Яды и Токсины',
    rarity: 'Очень редкий',
    kit: 'poisoner',
    cost: 1000,
    marketPrice: '2000 зм',
    time: '15 дней',
    dc: 19,
    ingredients: [{ name: 'Ядовитое жало пурпурного червя', qty: 1 }],
    effect: 'Смертоносный оружейный яд из глубин Подземья. При попадании цель проходит спасбросок Телосложения СЛ 19: получает 12d6 (42) урона ядом при провале или половину урона при успехе.'
  },

  /* 5. Травы и Реагенты Фаэруна */
  {
    id: 'alch_ref_herb_kingsfoil',
    name: 'Королевский лист / Лургас (Kingsfoil)',
    icon: '🌿',
    cat: 'Травы и Реагенты Фаэруна',
    rarity: 'Обычный',
    kit: 'herbalism',
    cost: 10,
    marketPrice: '10 зм',
    time: 'Сбор в лесах (1 час)',
    dc: 10,
    ingredients: [{ name: 'Среда обитания: Леса и предгорья Побережья Мечей', qty: 1 }],
    effect: 'Душистая серебристо-зелёная трава — главный базовый компонент всех Зелий лечения и припарок. Если разжевать свежий лист во время Короткого отдыха, персонаж дополнительно восстанавливает +1d4 хитов.'
  },
  {
    id: 'alch_ref_herb_lathander',
    name: 'Сон-трава Латандера (Dawnflower Petal)',
    icon: '🌻',
    cat: 'Травы и Реагенты Фаэруна',
    rarity: 'Необычный',
    kit: 'herbalism',
    cost: 35,
    marketPrice: '35 зм',
    time: 'Сбор на рассвете',
    dc: 13,
    ingredients: [{ name: 'Среда обитания: Солнечные луга и холмы Дессарина', qty: 1 }],
    effect: 'Золотистый цветок, раскрывающий бутоны ровно на 15 минут с первыми лучами рассвета. Очищает кровь от некротических проклятий и используется для создания Эликсира здоровья и Превосходных зелий лечения.'
  },
  {
    id: 'alch_ref_herb_cinderbloom',
    name: 'Пепельник Невервинтера (Neverwinter Cinderbloom)',
    icon: '🌺',
    cat: 'Травы и Реагенты Фаэруна',
    rarity: 'Необычный',
    kit: 'alchemist',
    cost: 40,
    marketPrice: '40 зм',
    time: 'Сбор у геотермальных источников',
    dc: 14,
    ingredients: [{ name: 'Среда обитания: Склоны горы Хотеноу и Лес Невервинтера', qty: 1 }],
    effect: 'Огненно-рыжий цветок, лепестки которого всегда тёплые на ощупь и тлеют в темноте. Незаменимый реагент для Алхимического огня, Пламенной смолы и Зелий сопротивления огню.'
  },
  {
    id: 'alch_ref_herb_underdark',
    name: 'Светящийся мох Подземья (Faerzress Glow-Moss)',
    icon: '🍄',
    cat: 'Травы и Реагенты Фаэруна',
    rarity: 'Необычный',
    kit: 'alchemist',
    cost: 30,
    marketPrice: '30 зм',
    time: 'Сбор в пещерах Подземья',
    dc: 12,
    ingredients: [{ name: 'Среда обитания: Пещеры Подземья с излучением Фаэрзрес', qty: 1 }],
    effect: 'Биолюминесцентный сине-фиолетовый мох, впитавший дикую радиацию Подземья. Служит катализатором для Зелий невидимости, Зелий чтения мыслей и Масла эфирности.'
  },
  {
    id: 'alch_ref_herb_frostheather',
    name: 'Ледяной вереск Долины (Icewind Frost-Heather)',
    icon: '❄️',
    cat: 'Травы и Реагенты Фаэруна',
    rarity: 'Необычный',
    kit: 'herbalism',
    cost: 35,
    marketPrice: '35 зм',
    time: 'Сбор в тундре',
    dc: 13,
    ingredients: [{ name: 'Среда обитания: Долина Ледяного Ветра и Хребет Мира', qty: 1 }],
    effect: 'Хрустально-голубой вереск, звенящий на ледяном ветру. Используется в Хладном закале клинка, криогенных бомбах и зельях защиты от стужи.'
  },
  {
    id: 'alch_ref_herb_lotus',
    name: 'Чёрный лотос Чулта (Chultan Black Lotus)',
    icon: '🥀',
    cat: 'Травы и Реагенты Фаэруна',
    rarity: 'Очень редкий',
    kit: 'poisoner',
    cost: 400,
    marketPrice: '400 зм',
    time: 'Сбор в джунглях',
    dc: 18,
    ingredients: [{ name: 'Среда обитания: Глубокие болота полуострова Чулт', qty: 1 }],
    effect: 'Редчайший бархатно-чёрный цветок, растущий на костях погибших хищников. Пыльца вызывает мгновенный паралич дыхания; основа яда «Полуночные слёзы».'
  },

  /* 6. Правила крафта и СЛ (D&D 2024 / DMG) */
  {
    id: 'alch_ref_rule_herbalism',
    name: 'Набор травника (Herbalism Kit — Правила 2024)',
    icon: '🌿',
    cat: 'Правила крафта и СЛ',
    rarity: 'Правило',
    kit: 'herbalism',
    cost: 5,
    marketPrice: '5 зм',
    time: 'Инструмент',
    dc: 10,
    ingredients: [{ name: 'Секатор, ступка с пестиком, стеклянные флаконы, мешочки для трав', qty: 1 }],
    effect: 'Хар-ка: Интеллект или Мудрость. Владение набором позволяет опознавать растения (СЛ 10) и варить Зелья лечения, Противоядия и свечи. В D&D 2024 создание обычного Зелья лечения требует 1 дня работы (8 часов) и сырья на 25 зм.'
  },
  {
    id: 'alch_ref_rule_alchemist',
    name: 'Инструменты алхимика (Alchemist\'s Supplies — Правила 2024)',
    icon: '⚗️',
    cat: 'Правила крафта и СЛ',
    rarity: 'Правило',
    kit: 'alchemist',
    cost: 50,
    marketPrice: '50 зм',
    time: 'Инструмент',
    dc: 15,
    ingredients: [{ name: 'Две реторты, спиртовая горелка, штатив, стеклянная трубка, химикаты', qty: 1 }],
    effect: 'Хар-ка: Интеллект. Позволяет опознавать зелья и кислоты (СЛ 15), разводить огонь (СЛ 15) и нейтрализовать кислоту (СЛ 10). Во время Долгого отдыха вы можете потратить реагенты, чтобы быстро создать 1 фиал Кислоты, Алхимического огня, Масла, Духов или Мыла.'
  },
  {
    id: 'alch_ref_rule_poisoner',
    name: 'Инструменты отравителя (Poisoner\'s Kit — Правила 2024)',
    icon: '☠️',
    cat: 'Правила крафта и СЛ',
    rarity: 'Правило',
    kit: 'poisoner',
    cost: 50,
    marketPrice: '50 зм',
    time: 'Инструмент',
    dc: 15,
    ingredients: [{ name: 'Тёмные склянки, пипетки, защитные перчатки, скальпель для желёз', qty: 1 }],
    effect: 'Хар-ка: Интеллект или Ловкость. Позволяет безопасно наносить яды без риска отравить себя, опознавать отравленную пищу/оружие (СЛ 10) и сцеживать яд с убитых ядовитых чудовищ (проверка Природы или Медицины СЛ 15–20 за 1d6 минут; при провале на 5+ отравитель сам получает урон ядом).'
  },
  {
    id: 'alch_ref_rule_table',
    name: 'Таблица стоимости и сроков варки по редкости',
    icon: '📊',
    cat: 'Правила крафта и СЛ',
    rarity: 'Правило',
    kit: 'alchemist',
    cost: 0,
    marketPrice: 'Таблица DMG / XGE',
    time: '1–50 дней',
    dc: 15,
    ingredients: [{ name: 'Расходники требуют в 2 раза меньше времени и золота, чем постоянные артефакты', qty: 1 }],
    effect: '• Обычный (Common): 1–5 дней · 25–50 зм сырья · СЛ 10\n• Необычный (Uncommon): 5 дней · 100–200 зм сырья · СЛ 13\n• Редкий (Rare): 10–15 дней · 500–1 000 зм сырья · СЛ 15\n• Очень редкий (Very Rare): 20–25 дней · 2 500–5 000 зм сырья · СЛ 18\n• Легендарный (Legendary): 50 дней · 10 000–25 000 зм сырья · СЛ 20'
  }
];

var FAE_ALCHEMY_CATEGORIES = [
  { key: 'all', label: 'Все разделы', icon: '🧪' },
  { key: 'potions', label: 'Зелья и Эликсиры', icon: '❤️' },
  { key: 'bombs', label: 'Алхимические смеси и Бомбы', icon: '💣' },
  { key: 'oils', label: 'Боевые масла и Покрытия', icon: '🗡️' },
  { key: 'poisons', label: 'Яды и Токсины', icon: '☠️' },
  { key: 'herbs', label: 'Травы и Реагенты Фаэруна', icon: '🌿' },
  { key: 'rules', label: 'Правила крафта и СЛ', icon: '📜' }
];

function normalizeAlchemyCategory(val){
  var v = String(val || '').trim();
  if(v === 'potions' || v === 'bombs' || v === 'oils' || v === 'poisons' || v === 'herbs' || v === 'rules') return v;
  var low = v.toLowerCase();
  if(low.indexOf('бомб') !== -1 || low.indexOf('смес') !== -1) return 'bombs';
  if(low.indexOf('масл') !== -1 || low.indexOf('покрыт') !== -1) return 'oils';
  if(low.indexOf('яд') !== -1 || low.indexOf('токс') !== -1) return 'poisons';
  if(low.indexOf('трав') !== -1 || low.indexOf('реагент') !== -1) return 'herbs';
  if(low.indexOf('правил') !== -1 || low.indexOf('таблиц') !== -1 || low.indexOf('крафт') !== -1) return 'rules';
  return 'potions';
}

FAE_ALCHEMY_COMPENDIUM.forEach(function(item){
  if(!item.category) item.category = normalizeAlchemyCategory(item.cat);
  if(!item.kitLabel){
    item.kitLabel = item.kit === 'herbalism'
      ? 'Набор травника'
      : (item.kit === 'poisoner' ? 'Набор отравителя' : 'Алхимический набор');
  }
});

function newRecipe(overrides){
  var base = {
    id: (overrides && overrides.id) ? overrides.id : genId(),
    name: '',
    icon: '🧪',
    category: 'potions',
    cat: 'Зелья и Эликсиры',
    rarity: 'Необычный',
    kit: 'alchemist',
    cost: 50,
    time: '4 часа',
    dc: 13,
    ingredients: [{ name: '', qty: 1 }],
    appearance: '',
    effect: '',
    isCustom: true
  };
  if(overrides && typeof overrides === 'object'){
    Object.assign(base, overrides);
    if(!base.id) base.id = genId();
    base.category = normalizeAlchemyCategory(base.category || base.cat);
  }
  return base;
}

function loadRecipes(){
  try{
    const raw = localStorage.getItem('ttc_recipes');
    if(!raw) return [];
    const arr = JSON.parse(raw);
    if(!Array.isArray(arr)) return [];
    const oldSeedNames = ['Зелье лечения', 'Противоядие', 'Алхимический огонь', 'Кислота'];
    return arr.filter(function(r){
      if(!r) return false;
      if(r.isCustom === false && oldSeedNames.indexOf(r.name) !== -1) return false;
      return true;
    }).map(function(r){
      var normCat = normalizeAlchemyCategory(r.category || r.cat || (r.kit === 'poisoner' ? 'poisons' : 'potions'));
      return {
        id: r.id || genId(),
        name: r.name || 'Алхимический рецепт',
        icon: r.icon || (r.kit === 'poisoner' ? '☠️' : (r.kit === 'herbalism' ? '🌿' : '🧪')),
        category: normCat,
        cat: r.cat || (r.kit === 'poisoner' ? 'Яды и Токсины' : 'Зелья и Эликсиры'),
        rarity: r.rarity || 'Необычный',
        kit: r.kit || 'alchemist',
        cost: Number(r.cost) || 0,
        time: r.time || '4 часа',
        dc: r.dc != null ? r.dc : 13,
        ingredients: Array.isArray(r.ingredients) && r.ingredients.length ? r.ingredients : [{ name: '', qty: 1 }],
        appearance: r.appearance || '',
        effect: r.effect || '',
        isCustom: true
      };
    });
  }catch(e){ return []; }
}
function saveRecipesToStorage(){
  try{ localStorage.setItem('ttc_recipes', JSON.stringify(RECIPES)); }catch(e){}
}

function loadIngredients(){ return []; }
function saveIngredientsToStorage(){}
function findIngredient(){ return null; }

function hashColor(str){
  let h=0;
  for(let i=0;i<str.length;i++){ h = (h*31 + str.charCodeAt(i)) & 0xffffffff; }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue},62%,48%)`;
}

let RECIPES = loadRecipes();
let INGREDIENTS = [];
let recipeDraft = null;

/* ---------- magic ---------- */
const MAGIC_SCHOOLS = [
  {key:'abjuration', ru:'Ограждение'},
  {key:'conjuration', ru:'Вызов'},
  {key:'divination', ru:'Прорицание'},
  {key:'enchantment', ru:'Очарование'},
  {key:'illusion', ru:'Иллюзия'},
  {key:'necromancy', ru:'Некромантия'},
  {key:'transmutation', ru:'Преобразование'},
  {key:'evocation', ru:'Воплощение'}
];
function schoolName(key){
  const s = MAGIC_SCHOOLS.find(x=>x.key===key);
  return s ? s.ru : key;
}
const SCHOOL_ICON_PATHS = {
  abjuration: `<path d="M12 2.5 L20 5.5 L20 11.5 C20 16.5 16.5 20.5 12 22 C7.5 20.5 4 16.5 4 11.5 L4 5.5 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
  conjuration: `<circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/>`,
  divination: `<path d="M2 12 C5 6 9 4 12 4 C15 4 19 6 22 12 C19 18 15 20 12 20 C9 20 5 18 2 12 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
  enchantment: `<path d="M18 12 A6 6 0 1 1 12 6 A3.6 3.6 0 1 1 8.4 9.6 A1.8 1.8 0 1 1 10.2 7.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  illusion: `<path d="M4 8.5 C4 5.5 7.2 3 12 3 C16.8 3 20 5.5 20 8.5 C20 14.5 16.5 20.5 12 20.5 C7.5 20.5 4 14.5 4 8.5 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="9" cy="9.5" r="1.15" fill="currentColor"/><circle cx="15" cy="9.5" r="1.15" fill="currentColor"/><path d="M8 14.5 Q12 17.3 16 14.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`,
  necromancy: `<path d="M12 3 C7.2 3 4.2 6.6 4.2 11 C4.2 14 5.8 16 7.2 17.2 V20 H9.8 V18.2 H14.2 V20 H16.8 V17.2 C18.2 16 19.8 14 19.8 11 C19.8 6.6 16.8 3 12 3 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><circle cx="9.2" cy="11" r="1.3" fill="currentColor"/><circle cx="14.8" cy="11" r="1.3" fill="currentColor"/>`,
  transmutation: `<path d="M12 3 L21 19.5 H3 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 9 L12 16 M8.8 12.5 L15.2 12.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`,
  evocation: `<path d="M12 2.2 C9.8 6.4 6.8 8.6 6.8 12.6 C6.8 16.6 9.4 19.4 12 21.5 C14.6 19.4 17.2 16.6 17.2 12.6 C17.2 8.6 14.2 6.4 12 2.2 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 9.5 C11 11.3 10.1 12.4 10.1 14.2 C10.1 16 11 17.3 12 18.3 C13 17.3 13.9 16 13.9 14.2 C13.9 12.4 13 11.3 12 9.5 Z" fill="currentColor" opacity="0.55"/>`
};
function schoolIconSvg(key){
  const path = SCHOOL_ICON_PATHS[key] || SCHOOL_ICON_PATHS.evocation;
  return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${path}</svg>`;
}
function levelLabel(lvl){
  return lvl===0 ? 'Заговор' : ('Ур. '+lvl);
}
function newSpell(schoolKey){
  return { id:null, name:'', school:schoolKey||'evocation', level:1, effect:'', isCustom:true };
}
function seedSpells(){
  const s = [
    ['Щит','abjuration',1,'Реакция на попадание или Волшебную стрелу: +5 к КД до начала следующего хода, отменяет попадание Волшебной стрелы.'],
    ['Контрзаклинание','abjuration',3,'Реакцией прерываете каст заклинания существом в 60 футах, если оно видит или слышит вас.'],
    ['Свобода передвижения','abjuration',4,'Цель игнорирует опутывание и обездвиживание, а сложная местность не замедляет её передвижение.'],
    ['Туманное облако','conjuration',1,'Создаёт сферу густого тумана радиусом 20 футов, сильно ограничивающую обзор внутри себя.'],
    ['Паутина','conjuration',2,'Заполняет область липкой паутиной, опутывающей существ и затрудняющей передвижение.'],
    ['Телепортация','conjuration',7,'Мгновенно переносит вас и спутников в знакомое место, даже на другом плане бытия.'],
    ['Обнаружение магии','divination',1,'10 минут ощущаете присутствие магии в 30 футах от себя и видите её слабую ауру.'],
    ['Ясновидение','divination',3,'Создаёт невидимый сенсор зрения или слуха в знакомом месте на 10 минут.'],
    ['Гадание','divination',5,'Позволяет видеть и слышать выбранное существо на расстоянии, если оно провалит спасбросок.'],
    ['Очарование личности','enchantment',1,'Гуманоид, проваливший спасбросок Мудрости, считает вас другом в течение часа.'],
    ['Удержание личности','enchantment',2,'Гуманоид, проваливший спасбросок Мудрости, получает состояние «Парализован» до конца заклинания.'],
    ['Доминирование над личностью','enchantment',5,'Берёте под ментальный контроль гуманоида, провалившего спасбросок Мудрости.'],
    ['Малая иллюзия','illusion',0,'Создаёт небольшой беззвучный образ или звук без образа в пределах 30 футов.'],
    ['Незримость','illusion',2,'Существо становится невидимым на час или пока не атакует либо не скастует заклинание.'],
    ['Большая иллюзия','illusion',3,'Создаёт реалистичный образ со звуком, запахом и движением, живущий до 10 минут.'],
    ['Ложная жизнь','necromancy',1,'Даёт 1к4+4 временных хитов в дополнение к обычным.'],
    ['Оживление мертвецов','necromancy',3,'Поднимает скелет или зомби из останков, подчиняющегося вашим приказам.'],
    ['Перст смерти','necromancy',7,'Наносит тяжёлый некротический урон; убитый им гуманоид восстаёт зомби на вашей стороне.'],
    ['Полёт','transmutation',3,'Даёт цели скорость полёта 60 футов на 10 минут.'],
    ['Ускорение','transmutation',3,'Удваивает скорость цели, +2 к КД, преимущество на спасброски Ловкости, доп. действие.'],
    ['Полиморф','transmutation',4,'Превращает цель в выбранное животное; её игровые характеристики заменяются характеристиками зверя.'],
    ['Волшебная стрела','evocation',1,'Три силовых снаряда наносят по 1к4+1 урона каждый и попадают автоматически.'],
    ['Обжигающие руки','evocation',1,'Конус пламени наносит урон огнём существам в области и поджигает горючие предметы.'],
    ['Огненный шар','evocation',3,'Взрыв пламени в области радиусом 20 футов наносит крупный урон огнём всем внутри.']
  ];
  return s.map(([name,school,level,effect])=>({id:genId(), name, school, level, effect, isCustom:false}));
}
function loadSpells(){
  try{
    const raw = localStorage.getItem('ttc_spells');
    if(!raw) return seedSpells();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.length ? arr : seedSpells();
  }catch(e){ return seedSpells(); }
}
function saveSpellsToStorage(){
  try{ localStorage.setItem('ttc_spells', JSON.stringify(SPELLS)); }catch(e){}
}
let SPELLS = loadSpells();
let spellDraft = null;

let CHARACTERS = loadCharacters();
let charDraft = null;

var view = window.view = {screen:'home'};

function isHomeScreen(screenName){
  var s = screenName;
  if(s === undefined || s === null){
    s = (window.view && window.view.screen) || '';
  }
  s = String(s);
  return !s || s === 'home' || s === 'shHome' || s === 'meHome' || s === 'elHome' || s === 'wiHome' || s === 'wzHome' || s === 'hbHome';
}

function updateHomeScreenLock(screenName){
  try {
    var isHome = isHomeScreen(screenName);
    var docEl = document.documentElement;
    var body = document.body;
    if(docEl) docEl.classList.toggle('is-home-screen', isHome);
    if(body) body.classList.toggle('is-home-screen', isHome);
    if(isHome){
      window.scrollTo(0,0);
      if(body) body.scrollTop = 0;
      if(docEl) docEl.scrollTop = 0;
    }
  } catch(e){}
}
window.isHomeScreen = isHomeScreen;
window.updateHomeScreenLock = updateHomeScreenLock;

(function initHomeScreenScrollGuard(){
  if(window.__homeScrollGuardActive) return;
  window.__homeScrollGuardActive = true;

  function shouldLockHomeScroll(){
    if(!window.isHomeScreen || !window.isHomeScreen()) return false;
    if(window.innerWidth <= 768) return false;
    var docEl = document.documentElement;
    if(docEl && docEl.scrollHeight > window.innerHeight + 4) return false;
    return true;
  }

  window.addEventListener('wheel', function(e){
    if(shouldLockHomeScroll()){
      var el = e.target;
      while(el && el !== document.body && el !== document.documentElement){
        var style = window.getComputedStyle(el);
        if((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight){
          return;
        }
        el = el.parentElement;
      }
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('touchmove', function(e){
    if(shouldLockHomeScroll()){
      var el = e.target;
      while(el && el !== document.body && el !== document.documentElement){
        var style = window.getComputedStyle(el);
        if((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight){
          return;
        }
        el = el.parentElement;
      }
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('keydown', function(e){
    if(shouldLockHomeScroll()){
      var tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      if(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)){
        return;
      }
      var scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar'];
      if(scrollKeys.indexOf(e.key) !== -1){
        e.preventDefault();
      }
    }
  }, { passive: false });

  document.addEventListener('visibilitychange', function(){
    if(document.body){
      document.body.classList.toggle('tab-paused', document.hidden);
    }
  });
})();

function render(){
  if(view.screen === 'characters' || view.screen === 'charview' || view.screen === 'sheet'){
    view.screen = 'faeData';
  }
  if(view.screen === 'commands'){
    view.screen = 'dice';
  }
  if(view.screen === 'stock'){
    view.screen = 'alchemy';
  }
  if(view.screen === 'alchemyDC'){
    view.screen = 'alchemyRef';
  }
  updateHomeScreenLock(view.screen);
  const app = document.getElementById('app');
  app.classList.toggle('wide', view.screen === 'map');
  app.classList.toggle('home-wide', view.screen === 'home');
  if(view.screen === 'home') app.innerHTML = renderHome();
  else if(view.screen === 'rules2024') app.innerHTML = renderRules2024();
  else if(view.screen === 'alchemy') app.innerHTML = renderAlchemyHub();
  else if(view.screen === 'alchemyRef') app.innerHTML = renderAlchemyRef();
  else if(view.screen === 'recipes') app.innerHTML = renderRecipes();
  else if(view.screen === 'recipeView') app.innerHTML = renderRecipeView();
  else if(view.screen === 'recipeForm') app.innerHTML = renderRecipeForm();
  else if(view.screen === 'alchemyAiGen') app.innerHTML = renderAlchemyAiGen();
  else if(view.screen === 'faeTechs') app.innerHTML = renderFaeTechs();
  else if(view.screen === 'faeTechView') app.innerHTML = renderFaeTechView();
  else if(view.screen === 'faeTechEdit') app.innerHTML = renderFaeTechEdit();
  else if(view.screen === 'faeTechGen') app.innerHTML = renderFaeTechGen();
  else if(view.screen === 'faeMoves') app.innerHTML = renderFaeMoves();
  else if(view.screen === 'faeMoveView') app.innerHTML = renderFaeMoveView();
  else if(view.screen === 'faeMoveEdit') app.innerHTML = renderFaeMoveEdit();
  else if(view.screen === 'faeMoveGen') app.innerHTML = renderFaeMoveGen();
  else if(view.screen === 'subclass') app.innerHTML = renderSubclassFeatures();
  else if(view.screen === 'magic') app.innerHTML = renderMagicHub();
  else if(view.screen === 'schoolSpells') app.innerHTML = renderSchoolSpells();
  else if(view.screen === 'spellForm') app.innerHTML = renderSpellForm();
  else if(view.screen === 'class') app.innerHTML = renderClass();
  else if(view.screen === 'glossary') app.innerHTML = renderGlossaryHub();
  else if(view.screen === 'weapons') app.innerHTML = renderWeapons();
  else if(view.screen === 'dice') app.innerHTML = renderDice();
  else if(view.screen === 'map') app.innerHTML = renderMap();
  else if(view.screen === 'sub') app.innerHTML = renderSub();
  else if(view.screen === 'faeGen') app.innerHTML = renderFaeGen();
  else if(view.screen === 'faeRef' || view.screen === 'ref') app.innerHTML = renderFaeRef();
  else if(view.screen === 'faeData' || view.screen === 'data') app.innerHTML = renderFaeData();
  wireEvents();
}

function renderCrumb(parts){
  return `<div class="crumb">${parts.map((p,i)=>{
    const isLast = i===parts.length-1;
    return (i>0?'<span class="sep">/</span>':'') +
      `<span class="seg ${isLast?'current':''}" data-nav="${p.nav||''}">${p.label}</span>`;
  }).join('')}</div>`;
}

function getFaerunClassIcon(className){
  var c = String(className||'').toLowerCase();
  if(c.indexOf('воин')!==-1 || c.indexOf('fighter')!==-1) return '⚔️';
  if(c.indexOf('варвар')!==-1 || c.indexOf('barbarian')!==-1) return '🪓';
  if(c.indexOf('плут')!==-1 || c.indexOf('вор')!==-1 || c.indexOf('rogue')!==-1) return '🗡️';
  if(c.indexOf('маг')!==-1 || c.indexOf('волшебник')!==-1 || c.indexOf('wizard')!==-1) return '🪄';
  if(c.indexOf('чародей')!==-1 || c.indexOf('sorcerer')!==-1) return '🔮';
  if(c.indexOf('жрец')!==-1 || c.indexOf('cleric')!==-1) return '✨';
  if(c.indexOf('паладин')!==-1 || c.indexOf('paladin')!==-1) return '🛡️';
  if(c.indexOf('следопыт')!==-1 || c.indexOf('рейнджер')!==-1 || c.indexOf('ranger')!==-1) return '🏹';
  if(c.indexOf('друид')!==-1 || c.indexOf('druid')!==-1) return '🌿';
  if(c.indexOf('бард')!==-1 || c.indexOf('bard')!==-1) return '🪕';
  if(c.indexOf('монах')!==-1 || c.indexOf('monk')!==-1) return '🥋';
  if(c.indexOf('колдун')!==-1 || c.indexOf('warlock')!==-1) return '👁️';
  if(c.indexOf('изобретатель')!==-1 || c.indexOf('artificer')!==-1) return '⚙️';
  return '🐉';
}

function renderHome(){
  var c = getActiveFaerunCharacter();
  var clsIcon = c ? getFaerunClassIcon(c.className) : '🐉';
  var heroName = c && c.name ? escapeHtml(c.name) : 'Новый искатель приключений';
  var heroSubtitle = c ? ([c.species, c.className ? (c.className + ' ' + (c.level||1) + ' ур.') : null, c.subclass, c.background].filter(Boolean).map(escapeHtml).join(' • ') || 'Герой Фаэруна') : 'Забытые Королевства • D&D 5e';
  var hpMax = c ? (c.hpMax != null ? c.hpMax : (c.maxHp != null ? c.maxHp : 20)) : 20;
  var acVal = c ? (c.ac != null ? c.ac : 10) : 10;
  var lvlVal = c ? (c.level || 1) : 1;
  var spdVal = c ? (c.speed != null ? c.speed : 30) : 30;
  var pbVal = fmtMod(profBonus(lvlVal));
  var techsCount = (c && Array.isArray(c.techs)) ? c.techs.length : 0;
  var movesCount = (c && Array.isArray(c.moves)) ? c.moves.length : 0;

  var hudHtml = '<div class="fae-hud" data-go="faeData" role="button" tabindex="0" title="Открыть лист персонажа и ростер отряда в разделе Данные" style="cursor:pointer;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">' +
      '<div>' +
        '<div class="fae-title">' + clsIcon + ' ' + heroName + '</div>' +
        '<div style="font-family:\'EB Garamond\',serif;font-style:italic;color:#cbd5e1;font-size:14.5px;margin-top:2px;">' +
          heroSubtitle +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
        '<span class="fae-class-badge">' + clsIcon + ' ' + (c && c.className ? escapeHtml(c.className) : 'D&D 5e') + '</span>' +
        '<span class="fae-stat-badge">Ур. ' + lvlVal + ' (БМ ' + pbVal + ')</span>' +
        '<span class="fae-stat-badge hp">❤️ ' + hpMax + ' HP</span>' +
        '<span class="fae-stat-badge ac">🛡️ КБ ' + acVal + '</span>' +
        '<span class="fae-stat-badge" title="Скорость передвижения">⚡ ' + spdVal + ' фт</span>' +
      '</div>' +
    '</div>' +
  '</div>';

  var heroDiceHtml = '<div class="fae-hero-dice" data-go="dice" role="button" tabindex="0" title="Открыть бросок костей">' +
    '<div class="fae-hero-dice-icon">' +
      (typeof dieShapeSvg==='function' ? dieShapeSvg(20,'faeHeroDie',20) : '🎲') +
    '</div>' +
    '<div style="flex:1;min-width:0;">' +
      '<div class="fae-hero-dice-title">Бросок костей</div>' +
      '<div class="fae-hero-dice-desc">Кости d4–d100, модификатор, выбор проверки из списка (характеристики, навыки, спасброски, способности, приёмы)</div>' +
    '</div>' +
    '<div class="fae-hero-dice-arrow">→</div>' +
  '</div>';

  var cardsHtml = '<div class="menu-list grid-2">' +
    '<div class="fae-card fae-card-clickable" data-go="faeTechs" role="button" tabindex="0">' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="fae-card-title"><span>✨</span> Способности ' + (techsCount ? '<span class="fae-ref-header-badge" style="margin-left:6px;padding:1px 8px;font-size:11px;">' + techsCount + '</span>' : '') + '</div>' +
        '<div class="fae-card-desc">Классовые умения, особенности вида, черты (Feats), магические дары и AI-конструктор способностей героя</div>' +
      '</div>' +
      '<div class="fae-card-arrow">›</div>' +
    '</div>' +
    '<div class="fae-card fae-card-clickable" data-go="faeMoves" role="button" tabindex="0">' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="fae-card-title"><span>⚔️</span> Боевые приёмы ' + (movesCount ? '<span class="fae-ref-header-badge" style="margin-left:6px;padding:1px 8px;font-size:11px;">' + movesCount + '</span>' : '') + '</div>' +
        '<div class="fae-card-desc">Оружейные техники, Мастерство оружия D&D 2024, манёвры Боевого Мастера, стойки и AI-генератор приёмов</div>' +
      '</div>' +
      '<div class="fae-card-arrow">›</div>' +
    '</div>' +
    '<div class="fae-card fae-card-clickable" data-go="map" role="button" tabindex="0">' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="fae-card-title"><span>🗺️</span> Карта Фаэруна</div>' +
        '<div class="fae-card-desc">Интерактивная карта Королевств, масштаб, Побережье Мечей, Врата Балдура и Невервинтер</div>' +
      '</div>' +
      '<div class="fae-card-arrow">›</div>' +
    '</div>' +
    '<div class="fae-card fae-card-clickable" data-go="faeGen" role="button" tabindex="0">' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="fae-card-title"><span>🤖</span> AI Генератор D&D</div>' +
        '<div class="fae-card-desc">Генерация квестов, НПС, оружия, брони, заклинаний, монстров, локаций, зелий и черт на базе Gemini AI!</div>' +
      '</div>' +
      '<div class="fae-card-arrow">›</div>' +
    '</div>' +
    '<div class="fae-card fae-card-clickable" data-go="faeRef" role="button" tabindex="0">' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="fae-card-title"><span>📚</span> Справочник Фаэруна</div>' +
        '<div class="fae-card-desc">Классы D&D, Книга заклинаний, Правила 2024, Алхимия и зелья, Оружие и Глоссарий терминов</div>' +
      '</div>' +
      '<div class="fae-card-arrow">›</div>' +
    '</div>' +
    '<div class="fae-card fae-card-clickable" data-go="faeData" role="button" tabindex="0">' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="fae-card-title"><span>💾</span> Данные & Кампания</div>' +
        '<div class="fae-card-desc">Полный лист героя D&D 5e/2024, управление ростером отряда, хроники приключения, Gemini API и резервные копии</div>' +
      '</div>' +
      '<div class="fae-card-arrow">›</div>' +
    '</div>' +
  '</div>';

  return hudHtml +
    '<div class="fae-rule"></div>' +
    heroDiceHtml +
    '<div class="section-label">СИСТЕМНЫЕ РАЗДЕЛЫ // ФАЭРУН</div>' +
    cardsHtml;
}

function renderGlossaryHub(){
  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Глоссарий терминов'}])}
    <button class="back" data-go="faeRef">← В справочник</button>
    <h1>Справочник терминов</h1>
    <p class="subtitle">Понятия и техники, разложенные по темам.</p>
    <div class="rule"></div>
    <div class="menu-list">
      <div class="menu-item" data-go="weapons">
        <div>
          <div class="name">Бой оружием</div>
          <div class="desc">Стойки, атаки и термины — отдельно под каждое оружие</div>
        </div>
        <div class="arrow">→</div>
      </div>
      <div class="menu-item disabled">
        <div>
          <div class="name">Снаряжение и доспехи</div>
          <div class="desc">Термины брони, ношения и обвеса</div>
        </div>
        <div class="tag-soon">скоро</div>
      </div>
    </div>
  `;
}

function termCard(item){
  return `
    <div class="card term" data-copy="${escapeAttr(item.ru)}">
      <div class="name">${item.ru}</div>
      ${item.orig ? `<div class="eng">${item.orig}</div>` : ''}
      <div class="desc">${item.desc}</div>
      <div class="stamp"><span>Скопировано</span></div>
    </div>`;
}

function stanceBlock(stance){
  return `
    <div class="stance-block">
      ${termCard(stance)}
      ${stance.attacks && stance.attacks.length ? `
        <div class="stance-attacks-label">↳ Атаки из этой стойки</div>
        <div class="grid attacks-grid">${stance.attacks.map(termCard).join('')}</div>
      ` : ''}
    </div>
  `;
}

function termSection(title, items){
  if(!items || !items.length) return '';
  return `
    <div class="section-label">${title}</div>
    <div class="grid">${items.map(termCard).join('')}</div>
  `;
}

function renderWeapons(){
  if(!view.weapon) view.weapon = 'longsword';
  const data = GLOSSARY[view.weapon] || {};
  const pills = WEAPONS.map(w=>
    `<button class="pill ${w.id===view.weapon?'active':''}" data-weapon="${w.id}">${w.ru}</button>`
  ).join('');

  const stancesHtml = (data.stances && data.stances.length)
    ? `<div class="section-label">Стойки и атаки</div>${data.stances.map(stanceBlock).join('')}`
    : '';

  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Глоссарий', nav:'glossary'},{label:'Бой оружием'}])}
    <button class="back" data-go="glossary">← В глоссарий</button>
    <h1>Бой оружием</h1>
    <p class="subtitle">Выберите оружие — набор стоек, атак и терминов изменится под него.</p>
    <div class="rule"></div>
    <div class="pill-row">${pills}</div>
    ${stancesHtml}
    ${termSection('Термины', data.terms)}
  `;
}

const MAP_SOURCES = [
  {id:'loremaps', label:'LoreMaps', url:'https://loremaps.azurewebsites.net/Maps/Faerun'},
  {id:'frwiki', label:'Forgotten Realms Wiki', url:'https://forgottenrealms.fandom.com/wiki/Map:Faer%C3%BBn_%E2%80%93_Full_Map'}
];

function renderMap(){
  if(!view.mapId) view.mapId = 'loremaps';
  const current = MAP_SOURCES.find(m=>m.id===view.mapId) || MAP_SOURCES[0];
  const pills = MAP_SOURCES.map(m=>
    `<button class="pill map-source-pill ${m.id===view.mapId?'active':''}" data-map-src="${m.id}">${m.label}</button>`
  ).join('');
  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Карта Фаэруна'}])}
    <button class="back" data-go="home">← Назад</button>
    <h1>Карта Фаэруна</h1>
    <p class="subtitle">Выбери источник карты — встроена прямо на странице.</p>
    <div class="rule"></div>
    <div class="pill-row" style="margin-bottom:14px;">${pills}</div>
    <div class="map-controls-row">
      <button class="map-toggle" id="mapDarkToggle">🌙 Тёмные цвета карты</button>
      <span style="font-size:12.5px;color:var(--ink-dim);">Инвертирует всю карту целиком — включай, когда просто нужно не слепнуть от белого фона.</span>
    </div>
    <div class="map-frame-wrap" id="mapFrameWrap">
      <iframe id="mapIframe" src="${current.url}" title="Карта Фаэруна" loading="lazy"
        referrerpolicy="no-referrer-when-downgrade" allowfullscreen allow="fullscreen"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"></iframe>
    </div>
    <div class="map-fallback-row">
      <span>Карта не загрузилась? Некоторые сайты (особенно Fandom) запрещают показывать себя внутри других страниц.</span>
      <a id="mapFallbackLink" href="${current.url}" target="_blank" rel="noopener noreferrer">Открыть в новой вкладке ↗</a>
    </div>
  `;
}

const FAE_SPECIES_LIST = [
  'Человек', 'Эльф (Высший)', 'Эльф (Лесной)', 'Эльф (Дроу)', 'Дварф (Холмовой)', 'Дварф (Горный)',
  'Полурослик', 'Гном', 'Драконорождённый', 'Тифлинг', 'Полуэльф', 'Орк / Полуорк', 'Аасимар', 'Голиаф'
];
const FAE_CLASSES_LIST = [
  'Воин', 'Варвар', 'Плут', 'Монах', 'Паладин', 'Следопыт',
  'Жрец', 'Друид', 'Бард', 'Чародей', 'Колдун', 'Волшебник', 'Изобретатель'
];
const FAE_BACKGROUNDS_LIST = [
  'Аколит', 'Артист', 'Благородный', 'Гильдейский ремесленник', 'Моряк', 'Мудрец',
  'Народный герой', 'Отшельник', 'Пират', 'Преступник', 'Солдат', 'Стражник', 'Чужеземец', 'Шарлатан'
];
const FAE_ALIGNMENTS_LIST = [
  'Законно-добрый', 'Нейтрально-добрый', 'Хаотично-добрый',
  'Законно-нейтральный', 'Истинно нейтральный', 'Хаотично-нейтральный',
  'Законно-злой', 'Нейтрально-злой', 'Хаотично-злой'
];

function faeAbilityBoxHtml(key, d){
  const score = d.abilities[key] != null ? d.abilities[key] : 10;
  const mod = abilityMod(score);
  return `
    <div class="ability-box fae-ability-card">
      <label>${ABILITY_RU[key]}</label>
      <input type="number" min="1" max="30" data-field="abilities.${key}" value="${score}">
      <div class="mod" id="am-${key}">${fmtMod(mod)}</div>
    </div>`;
}

function faeSaveRowHtml(key, d, pb){
  const prof = !!d.saveProf[key];
  const mod = abilityMod(d.abilities[key]) + (prof ? pb : 0);
  return `
    <div class="save-row">
      <input type="checkbox" data-field="saveProf.${key}" ${prof?'checked':''} title="Владение спасброском">
      <div class="ab-name">${ABILITY_RU[key]}</div>
      <div class="bonus-val" id="saveBonus-${key}">${fmtMod(mod)}</div>
    </div>`;
}

function faeSkillRowHtml(def, d, pb){
  const state = Number(d.skillProf[def.key]) || 0;
  const mod = abilityMod(d.abilities[def.ability]) + state * pb;
  const pass = 10 + mod;
  const abAbbr = ABILITY_ABBR[ABILITY_RU[def.ability]] || '';
  const stateTitle = state === 2 ? 'Экспертиза (+2×БМ)' : (state === 1 ? 'Владение (+БМ)' : 'Нет владения');
  return `
    <div class="skill-row">
      <button type="button" class="prof-toggle" data-skill-toggle="${def.key}" data-state="${state}" title="${stateTitle} (клик для переключения)"></button>
      <div class="sk-name">${def.ru}</div>
      <div class="sk-ab">${abAbbr}</div>
      <div class="sk-pass" id="skillPass-${def.key}" title="Пассивное значение навыка" style="font-size:11px;color:#64748b;font-family:'JetBrains Mono',monospace;min-width:44px;text-align:right;">П:${pass}</div>
      <div class="bonus-val" id="skillBonus-${def.key}">${fmtMod(mod)}</div>
    </div>`;
}

function faeAttackRowHtml(a, idx){
  return `
    <div class="attack-row fae-attack-row-2024" data-attack-row="${idx}">
      <input type="text" placeholder="Оружие / Заговор" data-attack-idx="${idx}" data-attack-field="name" value="${escapeAttr(a.name||'')}" title="Название оружия или заклинания">
      <input type="text" placeholder="+5" data-attack-idx="${idx}" data-attack-field="bonus" value="${escapeAttr(a.bonus||'')}" title="Бонус атаки (напр. +5)">
      <input type="text" placeholder="1d8+3" data-attack-idx="${idx}" data-attack-field="damage" value="${escapeAttr(a.damage||'')}" title="Формула урона (напр. 1d8+3)">
      <input type="text" placeholder="рубящий" data-attack-idx="${idx}" data-attack-field="type" value="${escapeAttr(a.type||'')}" title="Тип урона">
      <input type="text" list="faeMasteryDatalist" placeholder="Мастерство (2024)" data-attack-idx="${idx}" data-attack-field="mastery" value="${escapeAttr(a.mastery||'')}" title="Свойство Мастерства оружия D&D 2024">
      <button type="button" class="row-remove" data-remove-attack="${idx}" title="Удалить строку атаки">✕</button>
    </div>`;
}

function faeSlotBoxHtml(lvl, d){
  const max = Number(d.slots && d.slots[lvl]) || 0;
  return `
    <div class="slot-box">
      <span class="sb-label">Круг ${lvl}</span>
      <div class="sb-inputs">
        <input type="number" min="0" max="9" data-slot-level="${lvl}" data-slot-kind="max" value="${max}" title="Количество ячеек ${lvl} круга">
      </div>
    </div>`;
}

function recomputeDerived(){
  const d = getActiveFaerunCharacter();
  if(!d) return;
  const pb = profBonus(d.level);

  ABILITY_KEYS.forEach(k=>{
    const el = document.getElementById('am-'+k);
    if(el) el.textContent = fmtMod(abilityMod(d.abilities[k]));
    const sEl = document.getElementById('saveBonus-'+k);
    if(sEl) sEl.textContent = fmtMod(abilityMod(d.abilities[k]) + (d.saveProf[k]?pb:0));
  });
  SKILL_DEFS.forEach(def=>{
    const state = Number(d.skillProf[def.key]) || 0;
    const mod = abilityMod(d.abilities[def.ability]) + state * pb;
    const el = document.getElementById('skillBonus-'+def.key);
    if(el) el.textContent = fmtMod(mod);
    const pEl = document.getElementById('skillPass-'+def.key);
    if(pEl) pEl.textContent = 'П:' + (10 + mod);
  });

  const pbVal = document.getElementById('pbVal');
  if(pbVal) pbVal.textContent = fmtMod(pb);

  const ppVal = 10 + abilityMod(d.abilities.wis) + (Number(d.skillProf.perception)||0)*pb;
  const piVal = 10 + abilityMod(d.abilities.int) + (Number(d.skillProf.investigation)||0)*pb;
  const pinsVal = 10 + abilityMod(d.abilities.wis) + (Number(d.skillProf.insight)||0)*pb;

  const pp = document.getElementById('passivePerception');
  if(pp) pp.textContent = ppVal;
  const pi = document.getElementById('passiveInvestigation');
  if(pi) pi.textContent = piVal;
  const pins = document.getElementById('passiveInsight');
  if(pins) pins.textContent = pinsVal;

  const initTotal = abilityMod(d.abilities.dex) + Number(d.initMisc||0);
  const initEl = document.getElementById('initTotal');
  if(initEl) initEl.textContent = fmtMod(initTotal);

  const dcEl = document.getElementById('spellDC');
  if(dcEl) dcEl.textContent = 8 + pb + abilityMod(d.abilities[d.spellAbility]);
  const atkEl = document.getElementById('spellAtk');
  if(atkEl) atkEl.textContent = fmtMod(pb + abilityMod(d.abilities[d.spellAbility]));

  const goldTotalEl = document.getElementById('faeGoldTotal');
  if(goldTotalEl){
    const totalGp = (Number(d.pp)||0)*10 + (Number(d.gp)||0) + (Number(d.ep)||0)*0.5 + (Number(d.sp)||0)*0.1 + (Number(d.cp)||0)*0.01;
    goldTotalEl.textContent = totalGp.toFixed(2).replace(/\.00$/, '') + ' ЗМ';
  }

  const hdrTitle = document.getElementById('faeSheetHeroTitle');
  if(hdrTitle){
    hdrTitle.textContent = getFaerunClassIcon(d.className) + ' ' + (d.name || 'Безымянный герой') + ' — ' + (d.className || 'Герой') + ' ' + d.level + ' ур.';
  }
  const hdrBadges = document.getElementById('faeSheetHeaderBadges');
  if(hdrBadges){
    hdrBadges.innerHTML =
      '<span class="fae-stat-badge">БМ ' + fmtMod(pb) + '</span>' +
      '<span class="fae-stat-badge hp">❤️ ' + d.hpMax + ' HP</span>' +
      '<span class="fae-stat-badge ac">🛡️ КД ' + d.ac + '</span>' +
      '<span class="fae-stat-badge">⚡ Иниц. ' + fmtMod(initTotal) + '</span>';
  }
}

function addAttackRow(){
  const d = getActiveFaerunCharacter();
  if(!d) return;
  d.attacks.push({name:'',bonus:'',damage:'',type:'',mastery:''});
  saveCharactersToStorage();
  const list = document.getElementById('attacksList');
  if(list){
    const idx = d.attacks.length-1;
    list.insertAdjacentHTML('beforeend', faeAttackRowHtml(d.attacks[idx], idx));
  }
}
function removeAttackRow(idx){
  const d = getActiveFaerunCharacter();
  if(!d) return;
  d.attacks.splice(idx,1);
  if(d.attacks.length === 0) d.attacks.push({name:'',bonus:'',damage:'',type:'',mastery:''});
  saveCharactersToStorage();
  const list = document.getElementById('attacksList');
  if(list) list.innerHTML = d.attacks.map((a,i)=>faeAttackRowHtml(a,i)).join('');
}

function exportCharacterJson(){
  const d = getActiveFaerunCharacter();
  if(!d) return;
  const blob = new Blob([JSON.stringify(d, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (d.name||'персонаж').toLowerCase().replace(/[^a-zа-я0-9]+/gi,'_').replace(/^_+|_+$/g,'') || 'персонаж';
  a.href = url; a.download = safeName+'.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

function importCharacterFromFile(file){
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(reader.result);
      const merged = normalizeFaerunCharacter(Object.assign(newCharacter(), data, {id: genId()}));
      CHARACTERS.push(merged);
      saveCharactersToStorage();
      setActiveFaerunCharacter(merged.id);
      render();
    }catch(e){
      alert('Не удалось прочитать файл — это не корректный JSON карточки персонажа.');
    }
  };
  reader.readAsText(file);
}

function copyCharacterAsText(){
  const d = getActiveFaerunCharacter();
  if(!d) return;
  const pb = profBonus(d.level);
  const abLine = ABILITY_KEYS.map(k=>`${ABILITY_RU[k]} ${d.abilities[k]} (${fmtMod(abilityMod(d.abilities[k]))})`).join(', ');
  const savesProf = ABILITY_KEYS.filter(k=>d.saveProf[k])
    .map(k=>`${ABILITY_RU[k]} ${fmtMod(abilityMod(d.abilities[k])+pb)}`).join(', ') || '—';
  const skillsProf = SKILL_DEFS.filter(s=>(d.skillProf[s.key]||0)>0)
    .map(s=>`${s.ru} ${fmtMod(abilityMod(d.abilities[s.ability])+(d.skillProf[s.key])*pb)}${d.skillProf[s.key]===2?' (эксперт.)':''}`)
    .join(', ') || '—';
  const attacksText = d.attacks.filter(a=>a.name).map(a=>`  • ${a.name}: ${a.bonus||'—'} попадание, ${a.damage||'—'} ${a.type||''}${a.mastery?(' ['+a.mastery+']'):''}`).join('\n') || '  —';
  const lines = [
    `${d.name||'Без имени'} — ${d.className||'?'}${d.subclass?(' ('+d.subclass+')'):''}, уровень ${d.level}`,
    `${d.species||''} ${d.background?('· '+d.background):''} ${d.alignment?('· '+d.alignment):''}`.trim(),
    `Бонус мастерства: ${fmtMod(pb)}`,
    `Характеристики: ${abLine}`,
    `Спасброски (владение): ${savesProf}`,
    `КД ${d.ac} · Инициатива ${fmtMod(abilityMod(d.abilities.dex)+Number(d.initMisc||0))} · Скорость ${d.speed} фт.`,
    `Хиты (HP): ${d.hpMax} · Кости хитов: ${d.hitDiceTotal}${d.hitDiceType}`,
    `Владение навыками: ${skillsProf}`,
    `Атаки:\n${attacksText}`
  ];
  if(d.spellEnabled){
    lines.push(`Заклинания (${ABILITY_RU[d.spellAbility]}): СЛ ${8+pb+abilityMod(d.abilities[d.spellAbility])}, атака ${fmtMod(pb+abilityMod(d.abilities[d.spellAbility]))}`);
    if(d.spellNotes) lines.push(d.spellNotes);
  }
  if(d.equipment) lines.push(`Инвентарь: ${d.equipment}`);
  if(d.features) lines.push(`Умения и черты: ${d.features}`);
  if(d.backstory) lines.push(`История: ${d.backstory}`);
  copyText(lines.join('\n'));
}

function renderRules2024(){
  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Правила 2024'}])}
    <button class="back" data-go="faeRef">← В справочник</button>
    <h1>Правила 2024</h1>
    <p class="subtitle">Ключевые механики редакции 2024 года. Клик по карточке копирует название в буфер.</p>
    <div class="rule"></div>

    <div class="section-label">Мастерство оружия</div>
    <div class="grid">${WEAPON_MASTERY.map(termCard).join('')}</div>

    <div class="section-label">Состояния</div>
    <div class="grid">${CONDITIONS_2024.map(termCard).join('')}</div>

    <div class="section-label">Истощение</div>
    <div class="grid">${EXHAUSTION_LEVELS.map(termCard).join('')}</div>

    <div class="section-label">Укрытие</div>
    <div class="grid">${COVER_RULES.map(termCard).join('')}</div>

    <div class="section-label">Прочее</div>
    <div class="grid">${MISC_RULES_2024.map(termCard).join('')}</div>
  `;
}

/* ============================================================
   НОВАЯ СИСТЕМА АЛХИМИИ, ТРАВНИЧЕСТВА И ЯДОВ ФАЭРУНА
   (2 основных раздела: Справочник D&D + Мои Рецепты и Лаборатория ИИ)
   ============================================================ */

function renderAlchemyTabBar(activeTab){
  var refCount = Array.isArray(FAE_ALCHEMY_COMPENDIUM) ? FAE_ALCHEMY_COMPENDIUM.length : 0;
  var myCount = Array.isArray(RECIPES) ? RECIPES.length : 0;
  return '<div class="fae-nav-tabs">' +
    '<button type="button" class="fae-nav-tab ' + (activeTab==='ref'?'active':'') + '" data-go="alchemyRef">' +
      '📖 Справочник Алхимии D&D (' + refCount + ')' +
    '</button>' +
    '<button type="button" class="fae-nav-tab ' + (activeTab==='my'?'active':'') + '" data-go="recipes">' +
      '⚗️ Мои Рецепты и Лаборатория ИИ (' + myCount + ')' +
    '</button>' +
  '</div>';
}

function getAlchemyCatMeta(catKey){
  var found = (FAE_ALCHEMY_CATEGORIES || []).find(function(c){ return c.key === catKey; });
  return found || { key: catKey || 'potions', label: 'Зелья и Эликсиры', icon: '🧪' };
}

function renderAlchemyHub(){
  var refCount = Array.isArray(FAE_ALCHEMY_COMPENDIUM) ? FAE_ALCHEMY_COMPENDIUM.length : 0;
  var myCount = Array.isArray(RECIPES) ? RECIPES.length : 0;

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Справочник', nav:'faeRef'}, {label:'Алхимия, Травничество и Яды'}]) +
    '<button class="back" data-go="faeRef">← В справочник</button>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
      '<div>' +
        '<h1>🧪 Алхимия, Травничество и Яды</h1>' +
        '<p class="subtitle">Канонический компендиум D&D 5e / 2024 и персональная лаборатория с AI-генератором рецептов.</p>' +
      '</div>' +
      '<span class="fae-ref-header-badge">⚗️ D&D 5e / 2024</span>' +
    '</div>' +
    '<div class="fae-rule"></div>' +

    '<div class="fae-ref-lead">' +
      'Вся алхимия Забытых Королевств разделена на <b>два ключевых направления</b>: полный <b>Справочник существующих в D&D зелий, эликсиров, бомб, масел, ядов, трав и правил крафта</b> и раздел <b>Мои созданные рецепты</b> с ручным конструктором и встроенной Лабораторией ИИ.' +
    '</div>' +

    '<div class="menu-list grid-2" style="margin-top:18px;">' +
      '<div class="fae-card fae-card-clickable" data-go="alchemyRef" role="button" tabindex="0" style="padding:20px;border-color:rgba(201,164,92,0.45);">' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">' +
            '<span class="fae-ref-item-tag">КАНОН D&D 5E / 2024</span>' +
            '<span style="font-size:12px;color:#c9a45c;font-family:\'Cinzel\',serif;font-weight:700;">' + refCount + ' записей</span>' +
          '</div>' +
          '<div class="fae-card-title" style="font-size:18px;margin-bottom:6px;"><span>📖</span> Справочник Алхимии, Трав и Ядов D&D</div>' +
          '<div class="fae-card-desc" style="font-size:13.5px;line-height:1.55;">' +
            'Все официальные зелья исцеления, эликсиры силы великанов, невидимости, скорости и полёта, алхимический огонь и бомбы, оружейные масла, яды DMG (от «Злобы» до «Слёз полуночи»), травы Фаэруна и таблицы СЛ крафта.' +
          '</div>' +
        '</div>' +
        '<div class="fae-card-arrow">→</div>' +
      '</div>' +

      '<div class="fae-card fae-card-clickable" data-go="recipes" role="button" tabindex="0" style="padding:20px;border-color:rgba(201,164,92,0.45);">' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">' +
            '<span class="fae-ref-item-tag">ЛИЧНАЯ ЛАБОРАТОРИЯ + AI</span>' +
            '<span style="font-size:12px;color:#c9a45c;font-family:\'Cinzel\',serif;font-weight:700;">' + myCount + ' в списке</span>' +
          '</div>' +
          '<div class="fae-card-title" style="font-size:18px;margin-bottom:6px;"><span>⚗️</span> Мои Рецепты и Лаборатория ИИ</div>' +
          '<div class="fae-card-desc" style="font-size:13.5px;line-height:1.55;">' +
            'Список ваших собственных открытых или созданных зелий, ядов и составов. Ручная запись рецептов, редактирование ингредиентов и встроенный ИИ-генератор авторской алхимии внутри раздела.' +
          '</div>' +
        '</div>' +
        '<div class="fae-card-arrow">→</div>' +
      '</div>' +
    '</div>';
}

function alchemyCompendiumCardHtml(item){
  var catMeta = getAlchemyCatMeta(item.category);
  var ingStr = (item.ingredients || []).map(function(i){
    return escapeHtml(i.name) + (i.qty > 1 ? (' ×' + i.qty) : '');
  }).join(', ') || 'Стандартные реагенты';
  var copyPayload = item.name + (item.orig ? (' (' + item.orig + ')') : '') + ' [' + (item.rarity || 'Обычный') + ', СЛ ' + (item.dc || 10) + ', ' + (item.cost || 0) + ' ЗМ]: ' + (item.effect || '');

  return '<div class="fae-ref-card" data-alch-ref-id="' + escapeAttr(item.id) + '" style="display:flex;flex-direction:column;justify-content:space-between;">' +
    '<div>' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
        '<div class="fae-ref-card-k" style="margin-bottom:0;">' + catMeta.icon + ' ' + escapeHtml(item.name) + '</div>' +
        '<span class="fae-ref-item-tag">' + escapeHtml(item.rarity || 'Обычный') + '</span>' +
      '</div>' +
      (item.orig ? '<div style="font-size:11.5px;color:#94a3b8;font-style:italic;margin-bottom:8px;">' + escapeHtml(item.orig) + '</div>' : '') +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;font-size:11.5px;color:#cbd5e1;font-family:\'JetBrains Mono\',monospace;">' +
        '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;">🧰 ' + escapeHtml(item.kitLabel || 'Алхимический набор') + '</span>' +
        (item.dc ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;color:#fde68a;">🎲 СЛ ' + escapeHtml(String(item.dc)) + '</span>' : '') +
        (item.cost ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;color:#fbbf24;">🪙 ' + escapeHtml(String(item.cost)) + ' ЗМ</span>' : '') +
        (item.time ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;">⏳ ' + escapeHtml(item.time) + '</span>' : '') +
      '</div>' +
      (item.appearance ? '<div style="font-size:12.5px;color:#94a3b8;font-style:italic;margin-bottom:8px;line-height:1.45;">«' + escapeHtml(item.appearance) + '»</div>' : '') +
      '<div class="fae-ref-card-v" style="margin-bottom:10px;">' + escapeHtml(item.effect || '') + '</div>' +
      '<div style="font-size:12px;color:#cbd5e1;padding:7px 10px;background:rgba(10,14,22,0.65);border-left:2px solid #c9a45c;border-radius:4px;margin-bottom:12px;">' +
        '<b style="color:#c9a45c;">Реагенты:</b> ' + ingStr +
      '</div>' +
    '</div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;padding-top:8px;border-top:1px solid rgba(201,164,92,0.18);">' +
      '<button type="button" class="rc-btn" data-alch-copy="' + escapeAttr(copyPayload) + '" title="Скопировать описание в буфер">📋 Копировать</button>' +
      '<button type="button" class="rc-btn" data-alch-clone="' + escapeAttr(item.id) + '" title="Сохранить копию в Мои Рецепты для модификации">+ В мои рецепты</button>' +
      '<button type="button" class="rc-btn" data-alch-equip="' + escapeAttr(item.id) + '" title="Добавить предмет в инвентарь активного героя">🎒 В снаряжение</button>' +
    '</div>' +
  '</div>';
}

function renderAlchemyRef(){
  var activeCat = window._faeAlchRefCat || 'all';
  var searchQ = (window._faeAlchRefSearch || '').trim().toLowerCase();

  var pillsHtml = (FAE_ALCHEMY_CATEGORIES || []).map(function(c){
    var count = c.key === 'all'
      ? FAE_ALCHEMY_COMPENDIUM.length
      : FAE_ALCHEMY_COMPENDIUM.filter(function(x){ return x.category === c.key; }).length;
    return '<button type="button" class="fae-pill ' + (activeCat === c.key ? 'active' : '') + '" data-alch-ref-cat="' + escapeAttr(c.key) + '">' +
      c.icon + ' ' + escapeHtml(c.label) + ' <span style="opacity:0.75;font-size:11px;">(' + count + ')</span>' +
    '</button>';
  }).join('');

  var filtered = (FAE_ALCHEMY_COMPENDIUM || []).filter(function(item){
    if(activeCat !== 'all' && item.category !== activeCat) return false;
    if(searchQ){
      var hay = [item.name, item.orig, item.rarity, item.kitLabel, item.effect, item.appearance]
        .concat((item.ingredients || []).map(function(i){ return i.name; }))
        .join(' ').toLowerCase();
      if(hay.indexOf(searchQ) === -1) return false;
    }
    return true;
  });

  var cardsHtml = filtered.length
    ? '<div class="fae-ref-cards-grid">' + filtered.map(alchemyCompendiumCardHtml).join('') + '</div>'
    : '<div class="char-empty">По выбранному фильтру ничего не найдено. Попробуйте сбросить категорию или изменить запрос.</div>';

  return renderCrumb([
      {label:'Фаэрун', nav:'home'},
      {label:'Справочник', nav:'faeRef'},
      {label:'Алхимия', nav:'alchemy'},
      {label:'Справочник Алхимии D&D'}
    ]) +
    '<button class="back" data-go="alchemy">← К выбору раздела Алхимии</button>' +
    renderAlchemyTabBar('ref') +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">' +
      '<div>' +
        '<h1>📖 Справочник Алхимии, Травничества и Ядов D&D</h1>' +
        '<p class="subtitle">Каноническая база зелий, эликсиров, алхимических бомб, масел, ядов DMG, трав Фаэруна и правил крафта.</p>' +
      '</div>' +
      '<span class="fae-ref-header-badge">Показано: ' + filtered.length + ' из ' + FAE_ALCHEMY_COMPENDIUM.length + '</span>' +
    '</div>' +
    '<div class="fae-rule"></div>' +

    '<div class="fae-ref-search-wrap" style="margin-bottom:14px;">' +
      '<span class="fae-ref-search-icon">🔍</span>' +
      '<input type="text" id="faeAlchRefSearch" class="fae-ref-search-input" value="' + escapeAttr(window._faeAlchRefSearch || '') + '" placeholder="Поиск по названию, эффекту, типу яда, траве или реагенту..." autocomplete="off">' +
    '</div>' +

    '<div class="pill-row" style="margin-bottom:18px;">' + pillsHtml + '</div>' +

    '<div id="faeAlchRefGridWrap">' + cardsHtml + '</div>';
}

function wireAlchemyRef(){
  document.querySelectorAll('[data-alch-ref-cat]').forEach(function(btn){
    btn.addEventListener('click', function(){
      window._faeAlchRefCat = btn.getAttribute('data-alch-ref-cat') || 'all';
      render();
    });
  });

  var sInp = document.getElementById('faeAlchRefSearch');
  if(sInp){
    sInp.addEventListener('input', function(){
      window._faeAlchRefSearch = this.value;
      var pos = this.selectionStart;
      render();
      var nextInp = document.getElementById('faeAlchRefSearch');
      if(nextInp){
        nextInp.focus();
        try{ nextInp.setSelectionRange(pos, pos); }catch(e){}
      }
    });
  }

  document.querySelectorAll('[data-alch-copy]').forEach(function(btn){
    btn.addEventListener('click', function(){
      copyText(btn.getAttribute('data-alch-copy') || '');
      var old = btn.textContent;
      btn.textContent = '✓ Скопировано';
      setTimeout(function(){ btn.textContent = old; }, 1100);
    });
  });

  document.querySelectorAll('[data-alch-clone]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var id = btn.getAttribute('data-alch-clone');
      var src = (FAE_ALCHEMY_COMPENDIUM || []).find(function(x){ return x.id === id; });
      if(!src) return;
      var cloned = newRecipe({
        name: src.name,
        category: src.category === 'rules' ? 'potions' : (src.category || 'potions'),
        rarity: src.rarity || 'Необычный',
        kit: src.kit || 'alchemist',
        cost: Number(src.cost) || 50,
        time: src.time || '1 рабочий день',
        dc: Number(src.dc) || 13,
        ingredients: Array.isArray(src.ingredients) && src.ingredients.length
          ? JSON.parse(JSON.stringify(src.ingredients))
          : [{name:'Алхимический реагент', qty:1}],
        appearance: src.appearance || '',
        effect: src.effect || '',
        source: 'compendium'
      });
      RECIPES.unshift(cloned);
      saveRecipesToStorage();
      btn.textContent = '✓ В моих рецептах!';
      btn.disabled = true;
    });
  });

  document.querySelectorAll('[data-alch-equip]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var id = btn.getAttribute('data-alch-equip');
      var src = (FAE_ALCHEMY_COMPENDIUM || []).find(function(x){ return x.id === id; });
      var hero = getActiveFaerunCharacter();
      if(!src || !hero) return;
      var line = '• 🧪 ' + src.name + ' (' + (src.rarity || 'Обычный') + '): ' + (src.effect || '');
      hero.equipment = hero.equipment ? (hero.equipment + '\n\n' + line) : line;
      saveCharactersToStorage();
      btn.textContent = '✓ Добавлено (' + (hero.name || 'Герой') + ')';
      btn.disabled = true;
    });
  });
}

function customRecipeCardHtml(r){
  var catMeta = getAlchemyCatMeta(r.category || 'potions');
  var kitLabel = r.kit === 'herbalism' ? 'Набор травника' : (r.kit === 'poisoner' ? 'Набор отравителя' : 'Алхимический набор');
  var ingStr = (r.ingredients || []).filter(function(i){ return i && i.name; }).map(function(i){
    return escapeHtml(i.name) + (i.qty > 1 ? (' ×' + i.qty) : '');
  }).join(', ') || 'По рецепту мастера';

  var copyPayload = (r.name || 'Рецепт') + ' [' + (r.rarity || 'Необычный') + ', ' + kitLabel + ', СЛ ' + (r.dc || 10) + ', ' + (r.cost || 0) + ' ЗМ]: ' + (r.effect || '');

  return '<div class="fae-ref-card" data-recipe-card="' + escapeAttr(r.id) + '" style="display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;">' +
    '<div>' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
        '<div class="fae-ref-card-k" style="margin-bottom:0;">' + catMeta.icon + ' ' + escapeHtml(r.name || 'Без названия') + '</div>' +
        '<span class="fae-ref-item-tag">' + escapeHtml(r.rarity || 'Необычный') + '</span>' +
      '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;font-size:11.5px;color:#cbd5e1;font-family:\'JetBrains Mono\',monospace;">' +
        '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;">🧰 ' + escapeHtml(kitLabel) + '</span>' +
        (r.dc ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;color:#fde68a;">🎲 СЛ ' + escapeHtml(String(r.dc)) + '</span>' : '') +
        (r.cost ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;color:#fbbf24;">🪙 ' + escapeHtml(String(r.cost)) + ' ЗМ</span>' : '') +
        (r.time ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;">⏳ ' + escapeHtml(r.time) + '</span>' : '') +
      '</div>' +
      (r.appearance ? '<div style="font-size:12.5px;color:#94a3b8;font-style:italic;margin-bottom:8px;">«' + escapeHtml(r.appearance) + '»</div>' : '') +
      '<div class="fae-ref-card-v" style="margin-bottom:10px;">' + escapeHtml(r.effect || 'Описание эффекта не указано.') + '</div>' +
      '<div style="font-size:12px;color:#cbd5e1;padding:7px 10px;background:rgba(10,14,22,0.65);border-left:2px solid #c9a45c;border-radius:4px;margin-bottom:12px;">' +
        '<b style="color:#c9a45c;">Ингредиенты:</b> ' + ingStr +
      '</div>' +
    '</div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;padding-top:8px;border-top:1px solid rgba(201,164,92,0.18);">' +
      '<button type="button" class="rc-btn" data-my-alch-copy="' + escapeAttr(copyPayload) + '">📋 Копировать</button>' +
      '<button type="button" class="rc-btn" data-my-alch-equip="' + escapeAttr(r.id) + '">🎒 В снаряжение</button>' +
      '<button type="button" class="rc-btn" data-go="recipeForm:' + escapeAttr(r.id) + '">✏️ Изменить</button>' +
      '<button type="button" class="rc-btn" data-delete-recipe="' + escapeAttr(r.id) + '" style="color:#f87171;">🗑️</button>' +
    '</div>' +
  '</div>';
}

function renderRecipes(){
  var activeCat = window._faeMyAlchCat || 'all';
  var searchQ = (window._faeMyAlchSearch || '').trim().toLowerCase();

  var customCats = (FAE_ALCHEMY_CATEGORIES || []).filter(function(c){ return c.key !== 'rules'; });
  var pillsHtml = customCats.map(function(c){
    var count = c.key === 'all'
      ? RECIPES.length
      : RECIPES.filter(function(x){ return (x.category || 'potions') === c.key; }).length;
    return '<button type="button" class="fae-pill ' + (activeCat === c.key ? 'active' : '') + '" data-my-alch-cat="' + escapeAttr(c.key) + '">' +
      c.icon + ' ' + escapeHtml(c.label) + ' <span style="opacity:0.75;font-size:11px;">(' + count + ')</span>' +
    '</button>';
  }).join('');

  var filtered = (RECIPES || []).filter(function(r){
    var rCat = r.category || 'potions';
    if(activeCat !== 'all' && rCat !== activeCat) return false;
    if(searchQ){
      var hay = [r.name, r.rarity, r.effect, r.appearance]
        .concat((r.ingredients || []).map(function(i){ return i.name; }))
        .join(' ').toLowerCase();
      if(hay.indexOf(searchQ) === -1) return false;
    }
    return true;
  });

  var cardsHtml = filtered.length
    ? '<div class="fae-ref-cards-grid">' + filtered.map(customRecipeCardHtml).join('') + '</div>'
    : '<div class="char-empty">В вашей личной книге рецептов пока нет записей в этой категории. Создайте рецепт вручную или сгенерируйте его с помощью ИИ!</div>';

  return renderCrumb([
      {label:'Фаэрун', nav:'home'},
      {label:'Справочник', nav:'faeRef'},
      {label:'Алхимия', nav:'alchemy'},
      {label:'Мои Рецепты и Лаборатория ИИ'}
    ]) +
    '<button class="back" data-go="alchemy">← К выбору раздела Алхимии</button>' +
    renderAlchemyTabBar('my') +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
      '<div>' +
        '<h1>⚗️ Мои Рецепты и Лаборатория ИИ</h1>' +
        '<p class="subtitle">Ваши собственные зелья, эликсиры, бомбы, масла и яды — созданные вручную или сгенерированные через Gemini AI.</p>' +
      '</div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
        '<button type="button" class="btn btn-primary" data-go="recipeForm:new">+ Записать свой рецепт</button>' +
        '<button type="button" class="ai-gen-btn" data-go="alchemyAiGen" style="padding:9px 16px;font-size:13px;">🤖 Создать рецепт с ИИ</button>' +
      '</div>' +
    '</div>' +
    '<div class="fae-rule"></div>' +

    '<div class="fae-ref-search-wrap" style="margin-bottom:14px;">' +
      '<span class="fae-ref-search-icon">🔍</span>' +
      '<input type="text" id="faeMyRecipesSearch" class="fae-ref-search-input" value="' + escapeAttr(window._faeMyAlchSearch || '') + '" placeholder="Поиск по вашим рецептам, ингредиентам и эффектам..." autocomplete="off">' +
    '</div>' +

    '<div class="pill-row" style="margin-bottom:18px;">' + pillsHtml + '</div>' +

    cardsHtml;
}

function renderRecipeView(){
  var r = (RECIPES || []).find(function(x){ return x.id === view.recipeId; });
  if(!r) return renderRecipes();
  var catMeta = getAlchemyCatMeta(r.category || 'potions');
  var kitLabel = r.kit === 'herbalism' ? 'Набор травника (Herbalism Kit)' : (r.kit === 'poisoner' ? 'Набор отравителя (Poisoner\'s Kit)' : 'Алхимический набор (Alchemist\'s Supplies)');
  var ingRows = (r.ingredients || []).filter(function(i){ return i && i.name; }).map(function(i){
    return '<li style="margin-bottom:4px;"><b>' + escapeHtml(i.name) + '</b> — ' + (i.qty || 1) + ' шт.</li>';
  }).join('') || '<li>Базовые реагенты лаборатории</li>';

  return renderCrumb([
      {label:'Фаэрун', nav:'home'},
      {label:'Справочник', nav:'faeRef'},
      {label:'Алхимия', nav:'alchemy'},
      {label:'Мои Рецепты', nav:'recipes'},
      {label:r.name || 'Рецепт'}
    ]) +
    '<button class="back" data-go="recipes">← К списку моих рецептов</button>' +
    renderAlchemyTabBar('my') +
    '<div class="fae-ref-card" style="padding:22px;border-color:rgba(201,164,92,0.45);">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:10px;">' +
        '<div>' +
          '<span class="fae-ref-item-tag" style="margin-bottom:6px;">' + catMeta.icon + ' ' + escapeHtml(catMeta.label) + ' • ' + escapeHtml(r.rarity || 'Необычный') + '</span>' +
          '<h1 style="margin:6px 0 0 0;font-size:24px;">' + escapeHtml(r.name || 'Без названия') + '</h1>' +
        '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button type="button" class="btn btn-primary" data-go="recipeForm:' + escapeAttr(r.id) + '">✏️ Редактировать</button>' +
          '<button type="button" class="btn btn-ghost" data-my-alch-equip="' + escapeAttr(r.id) + '">🎒 В снаряжение героя</button>' +
        '</div>' +
      '</div>' +
      '<div class="fae-rule"></div>' +
      '<div class="fae-gen-stat-grid" style="margin-bottom:14px;">' +
        '<div class="fae-gen-stat-box"><span class="lbl">🧰 Инструменты</span><span class="val">' + escapeHtml(kitLabel) + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">🎲 СЛ Крафта</span><span class="val">СЛ ' + escapeHtml(String(r.dc || 13)) + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">🪙 Стоимость</span><span class="val">' + escapeHtml(String(r.cost || 0)) + ' ЗМ</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">⏳ Время варки</span><span class="val">' + escapeHtml(r.time || '4 часа') + '</span></div>' +
      '</div>' +
      (r.appearance ? '<div class="fae-gen-block" style="border-left-color:#38bdf8;"><b>🧪 Внешний вид, цвет и аромат:</b><br><i>' + escapeHtml(r.appearance) + '</i></div>' : '') +
      '<div class="fae-gen-block"><b>✨ Игровой эффект и механика:</b><br><span style="white-space:pre-line;">' + escapeHtml(r.effect || '') + '</span></div>' +
      '<div style="margin-top:14px;padding:12px 16px;background:rgba(10,14,22,0.75);border:1px solid rgba(201,164,92,0.28);border-radius:6px;">' +
        '<div style="font-size:12px;color:#c9a45c;font-family:\'Cinzel\',serif;font-weight:700;margin-bottom:6px;">🌿 НЕОБХОДИМЫЕ ИНГРЕДИЕНТЫ И РЕАГЕНТЫ:</div>' +
        '<ul style="margin:0 0 0 18px;padding:0;color:#e2e8f0;font-size:14px;line-height:1.5;">' + ingRows + '</ul>' +
      '</div>' +
    '</div>';
}

function initRecipeDraft(){
  if(view.recipeId && view.recipeId !== 'new'){
    const existing = RECIPES.find(r=>r.id===view.recipeId);
    recipeDraft = existing ? JSON.parse(JSON.stringify(existing)) : newRecipe();
  } else {
    recipeDraft = newRecipe();
  }
}

function ingredientFormRowHtml(ing, idx){
  return `
    <div class="attack-row" data-ing-row="${idx}" style="grid-template-columns:2fr 1fr auto;">
      <input type="text" placeholder="Название ингредиента (напр. Пепел феникса, Слизь гуля)" data-ing-idx="${idx}" data-ing-field="name" value="${escapeAttr(ing.name||'')}">
      <input type="number" min="1" placeholder="Кол-во" data-ing-idx="${idx}" data-ing-field="qty" value="${ing.qty||1}">
      <button type="button" class="row-remove" data-remove-ing="${idx}" title="Убрать">✕</button>
    </div>`;
}

function renderRecipeForm(){
  initRecipeDraft();
  const r = recipeDraft;
  const isExisting = !!(view.recipeId && view.recipeId!=='new' && RECIPES.find(x=>x.id===view.recipeId));
  const ingRows = (r.ingredients || [{name:'',qty:1}]).map(ingredientFormRowHtml).join('');

  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Алхимия', nav:'alchemy'},{label:'Мои Рецепты', nav:'recipes'},{label:r.name||'Новый рецепт'}])}
    <button class="back" data-go="recipes">← К списку моих рецептов</button>
    ${renderAlchemyTabBar('my')}
    <h1>${escapeHtml(r.name || 'Запись нового рецепта')}</h1>
    <p class="subtitle">Создайте собственное зелье, эликсир, бомбу, оружейное масло или боевой яд — он сохранится в разделе «Мои Рецепты».</p>
    <div class="fae-rule"></div>

    <div class="sheet-actions" style="margin-bottom:18px;">
      <button class="btn-primary" id="saveRecipeBtn">💾 Сохранить в Мои Рецепты</button>
      ${isExisting ? '<button class="btn-ghost" id="deleteRecipeBtn" style="color:var(--crimson-bright);border-color:var(--crimson-bright);">🗑 Удалить рецепт</button>' : ''}
    </div>

    <div id="recipeFormRoot" class="fae-ref-card" style="padding:20px;">
      <div class="fae-edit-grid">
        <div class="fae-edit-item" style="grid-column:1 / -1;">
          <label>Название зелья / состава / яда</label>
          <input type="text" class="fae-input" data-rfield="name" value="${escapeAttr(r.name||'')}" placeholder="Напр. Эликсир Багрового Заката" style="font-size:17px;">
        </div>
        <div class="fae-edit-item">
          <label>Категория состава</label>
          <select class="fae-input" data-rfield="category">
            <option value="potions" ${(r.category||'potions')==='potions'?'selected':''}>❤️ Зелья и Эликсиры</option>
            <option value="bombs" ${r.category==='bombs'?'selected':''}>💣 Алхимические смеси и Бомбы</option>
            <option value="oils" ${r.category==='oils'?'selected':''}>🗡️ Масла и Покрытия для оружия</option>
            <option value="poisons" ${r.category==='poisons'?'selected':''}>☠️ Яды и Токсины</option>
            <option value="herbs" ${r.category==='herbs'?'selected':''}>🌿 Травы и Особые реагенты</option>
          </select>
        </div>
        <div class="fae-edit-item">
          <label>Редкость</label>
          <select class="fae-input" data-rfield="rarity">
            <option value="Обычный" ${r.rarity==='Обычный'?'selected':''}>Обычный (Common)</option>
            <option value="Необычный" ${(r.rarity||'Необычный')==='Необычный'?'selected':''}>Необычный (Uncommon)</option>
            <option value="Редкий" ${r.rarity==='Редкий'?'selected':''}>Редкий (Rare)</option>
            <option value="Очень редкий" ${r.rarity==='Очень редкий'?'selected':''}>Очень редкий (Very Rare)</option>
            <option value="Легендарный" ${r.rarity==='Легендарный'?'selected':''}>Легендарный (Legendary)</option>
          </select>
        </div>
        <div class="fae-edit-item">
          <label>Набор инструментов</label>
          <select class="fae-input" data-rfield="kit">
            <option value="alchemist" ${(r.kit||'alchemist')==='alchemist'?'selected':''}>⚗️ Алхимический набор</option>
            <option value="herbalism" ${r.kit==='herbalism'?'selected':''}>🌿 Набор травника</option>
            <option value="poisoner" ${r.kit==='poisoner'?'selected':''}>☠️ Набор отравителя</option>
          </select>
        </div>
        <div class="fae-edit-item">
          <label>СЛ проверки (DC)</label>
          <input type="text" class="fae-input" data-rfield="dc" value="${escapeAttr(String(r.dc||13))}" placeholder="напр. 15">
        </div>
        <div class="fae-edit-item">
          <label>Стоимость создания (ЗМ)</label>
          <input type="number" min="0" class="fae-input" data-rfield="cost" value="${r.cost||50}">
        </div>
        <div class="fae-edit-item">
          <label>Время изготовления</label>
          <input type="text" class="fae-input" data-rfield="time" value="${escapeAttr(r.time||'4 часа')}" placeholder="напр. 4 часа / 1 рабочий день">
        </div>
        <div class="fae-edit-item" style="grid-column:1 / -1;">
          <label>Внешний вид, цвет, свечение и запах (необязательно)</label>
          <input type="text" class="fae-input" data-rfield="appearance" value="${escapeAttr(r.appearance||'')}" placeholder="Густая рубиновая жидкость с золотистыми искрами и запахом шалфея...">
        </div>
      </div>

      <div class="field" style="margin:18px 0 8px;"><label style="color:#c9a45c;font-family:'Cinzel',serif;font-size:12px;">🌿 Ингредиенты и реагенты рецепта</label></div>
      <div id="ingList">${ingRows}</div>
      <button type="button" class="add-row-btn" id="addIngRowBtn">+ Добавить ингредиент</button>

      <div class="field" style="margin-top:20px;">
        <label style="color:#c9a45c;font-family:'Cinzel',serif;font-size:12px;">✨ Игровой эффект и механика применения</label>
        <textarea class="fae-input" data-rfield="effect" style="min-height:110px;">${escapeHtml(r.effect||'')}</textarea>
      </div>
    </div>
  `;
}

function loadAlchLabHistory(){
  try{
    var raw = localStorage.getItem('fae_ai_hist_alchemy');
    if(raw){
      var arr = JSON.parse(raw);
      if(Array.isArray(arr)) return arr;
    }
  }catch(e){}
  return [];
}

function saveAlchLabHistory(arr){
  try{
    localStorage.setItem('fae_ai_hist_alchemy', JSON.stringify((arr || []).slice(0, 20)));
  }catch(e){}
}

function renderAlchemyAiGen(){
  var hasKey = !!((typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '');
  var hist = loadAlchLabHistory();
  var histHtml = hist.length ? (
    '<div style="margin-top:24px;">' +
      '<div class="section-label">📜 НЕДАВНО СОЗДАННЫЕ ИИ РЕЦЕПТЫ (' + hist.length + ')</div>' +
      '<div class="fae-ref-cards-grid">' +
        hist.map(function(h, idx){
          return '<div class="fae-ref-card" data-alch-ai-hist-idx="' + idx + '" style="cursor:pointer;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:4px;">' +
              '<div class="fae-ref-card-k" style="margin-bottom:0;">🧪 ' + escapeHtml(h.name || 'Рецепт ИИ') + '</div>' +
              '<span class="fae-ref-item-tag">' + escapeHtml(h.rarity || 'Редкий') + '</span>' +
            '</div>' +
            '<div class="fae-ref-card-v">' + escapeHtml((h.effect || '').slice(0, 140)) + '...</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>'
  ) : '';

  var presets = [
    { label: 'Эликсир драконьего дыхания', theme: 'Эликсир, дающий способность выдыхать конус стихийного пламени', cat: 'potions' },
    { label: 'Теневое масло ассасинов Ам-на', theme: 'Оружейное масло, которое глушит звук удара и наносит некротический урон из скрытности', cat: 'oils' },
    { label: 'Громовая граната Гонда', theme: 'Алхимическая бомба изобретателей Врат Балдура, оглушающая и отбрасывающая врагов', cat: 'bombs' },
    { label: 'Нейротоксин дроу Мензоберранзана', theme: 'Оружейный яд глубинных пауков, лишающий жертву реакции и концентрации', cat: 'poisons' },
    { label: 'Бальзам Серебряного Плетения', theme: 'Отвар редких лунных трав, восстанавливающий ячейку заклинаний и снимающий истощение', cat: 'potions' }
  ];

  return renderCrumb([
      {label:'Фаэрун', nav:'home'},
      {label:'Справочник', nav:'faeRef'},
      {label:'Алхимия', nav:'alchemy'},
      {label:'Мои Рецепты', nav:'recipes'},
      {label:'Лаборатория ИИ'}
    ]) +
    '<button class="back" data-go="recipes">← К списку моих рецептов</button>' +
    renderAlchemyTabBar('my') +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">' +
      '<div>' +
        '<h1>🤖 Алхимическая Лаборатория ИИ</h1>' +
        '<p class="subtitle">Создайте уникальный рецепт зелья, эликсира, бомбы, оружейного масла или яда D&D 5e / 2024 и сохраните его в «Мои Рецепты».</p>' +
      '</div>' +
      '<span class="fae-ref-header-badge">GEMINI-4-ARGON</span>' +
    '</div>' +
    '<div class="fae-rule"></div>' +

    '<div class="ai-gen-box" id="faeAlchAiFormBox">' +
      '<div class="fae-gen-preset-wrap" style="margin-bottom:14px;">' +
        '<div style="font-size:11.5px;color:#c9a45c;font-family:\'Cinzel\',serif;font-weight:700;margin-bottom:6px;">⚡ БЫСТРЫЕ ИДЕИ ДЛЯ ЛАБОРАТОРИИ:</div>' +
        '<div class="fae-gen-preset-row">' +
          presets.map(function(p, i){
            return '<button type="button" class="fae-gen-preset-chip" data-alch-lab-preset="' + i + '" data-theme="' + escapeAttr(p.theme) + '" data-cat="' + escapeAttr(p.cat) + '">💡 ' + escapeHtml(p.label) + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +

      '<div class="fae-edit-grid">' +
        '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
          '<label>Название или идея алхимического состава</label>' +
          '<input type="text" class="fae-input" id="alchLabTheme" placeholder="Напр. Зелье призрачного шага, Кислотная бомба алхимика, Масло против демонов...">' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Категория рецепта</label>' +
          '<select class="fae-input" id="alchLabCat">' +
            '<option value="potions" selected>❤️ Зелья и Эликсиры</option>' +
            '<option value="bombs">💣 Алхимические смеси и Бомбы</option>' +
            '<option value="oils">🗡️ Масла и Покрытия для оружия</option>' +
            '<option value="poisons">☠️ Яды и Токсины</option>' +
            '<option value="herbs">🌿 Травы и Редкие реагенты</option>' +
          '</select>' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Редкость и СЛ крафта</label>' +
          '<select class="fae-input" id="alchLabRarity">' +
            '<option value="Обычный (СЛ 10, ~25 ЗМ)">Обычный (СЛ 10, ~25 ЗМ)</option>' +
            '<option value="Необычный (СЛ 13, ~100 ЗМ)">Необычный (СЛ 13, ~100 ЗМ)</option>' +
            '<option value="Редкий (СЛ 15, ~350 ЗМ)" selected>Редкий (СЛ 15, ~350 ЗМ)</option>' +
            '<option value="Очень редкий (СЛ 18, ~1200 ЗМ)">Очень редкий (СЛ 18, ~1200 ЗМ)</option>' +
            '<option value="Легендарный (СЛ 20, ~3500 ЗМ)">Легендарный (СЛ 20, ~3500 ЗМ)</option>' +
          '</select>' +
        '</div>' +
        '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
          '<label>Инструменты изготовления</label>' +
          '<select class="fae-input" id="alchLabKit">' +
            '<option value="alchemist" selected>⚗️ Алхимический набор (Alchemist\'s Supplies)</option>' +
            '<option value="herbalism">🌿 Набор травника (Herbalism Kit)</option>' +
            '<option value="poisoner">☠️ Набор отравителя (Poisoner\'s Kit)</option>' +
          '</select>' +
        '</div>' +
        '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
          '<label>Желаемая механика, ингредиенты или побочный эффект (необязательно)</label>' +
          '<textarea class="fae-input" id="alchLabReq" rows="3" placeholder="Напр. Пусть требует пепел горгульи, даёт +2 к КД на 10 минут и светится бирюзовым..."></textarea>' +
        '</div>' +
      '</div>' +

      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:16px;">' +
        '<button type="button" class="btn-ghost" id="alchLabKeyBtn" style="font-size:12.5px;">🔑 API ключ: ' + (hasKey ? '<span style="color:#4ade80;">✓ Установлен</span>' : '<span style="color:#fbbf24;">⚠️ Не задан</span>') + '</button>' +
        '<button type="button" class="ai-gen-btn" id="btnAlchLabGenerate">⚗️ Синтезировать рецепт через AI</button>' +
      '</div>' +
    '</div>' +

    '<div id="alchLabResultWrap" style="display:none;margin-top:20px;"></div>' +
    histHtml;
}

function wireAlchemyCustom(){
  document.querySelectorAll('[data-my-alch-cat]').forEach(function(btn){
    btn.addEventListener('click', function(){
      window._faeMyAlchCat = btn.getAttribute('data-my-alch-cat') || 'all';
      render();
    });
  });

  var sInp = document.getElementById('faeMyRecipesSearch');
  if(sInp){
    sInp.addEventListener('input', function(){
      window._faeMyAlchSearch = this.value;
      var pos = this.selectionStart;
      render();
      var nextInp = document.getElementById('faeMyRecipesSearch');
      if(nextInp){
        nextInp.focus();
        try{ nextInp.setSelectionRange(pos, pos); }catch(e){}
      }
    });
  }

  document.querySelectorAll('[data-recipe-card]').forEach(function(card){
    card.addEventListener('click', function(e){
      if(e.target.closest('button') || e.target.closest('[data-go]')) return;
      var id = card.getAttribute('data-recipe-card');
      navigate('recipeView:' + id);
    });
  });

  document.querySelectorAll('[data-my-alch-copy]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      copyText(btn.getAttribute('data-my-alch-copy') || '');
      var old = btn.textContent;
      btn.textContent = '✓ Скопировано';
      setTimeout(function(){ btn.textContent = old; }, 1100);
    });
  });

  document.querySelectorAll('[data-my-alch-equip]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var id = btn.getAttribute('data-my-alch-equip');
      var rec = (RECIPES || []).find(function(x){ return x.id === id; });
      var hero = getActiveFaerunCharacter();
      if(!rec || !hero) return;
      var line = '• 🧪 ' + (rec.name || 'Зелье') + ' (' + (rec.rarity || 'Необычный') + '): ' + (rec.effect || '');
      hero.equipment = hero.equipment ? (hero.equipment + '\n\n' + line) : line;
      saveCharactersToStorage();
      btn.textContent = '✓ В снаряжении (' + (hero.name || 'Герой') + ')';
      btn.disabled = true;
    });
  });

  /* Лаборатория ИИ */
  document.querySelectorAll('[data-alch-lab-preset]').forEach(function(chip){
    chip.addEventListener('click', function(){
      var tInp = document.getElementById('alchLabTheme');
      var cSel = document.getElementById('alchLabCat');
      if(tInp) tInp.value = chip.getAttribute('data-theme') || '';
      if(cSel) cSel.value = chip.getAttribute('data-cat') || 'potions';
    });
  });

  var keyBtn = document.getElementById('alchLabKeyBtn');
  if(keyBtn){
    keyBtn.addEventListener('click', function(){
      var cur = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
      var inp = prompt('Введите Google Gemini API ключ (gemini-4-argon):', cur || '');
      if(inp !== null && typeof window.saveGeminiApiKey === 'function'){
        window.saveGeminiApiKey(inp.trim());
        render();
      }
    });
  }

  function showAlchLabPreview(res, catKey){
    var wrap = document.getElementById('alchLabResultWrap');
    if(!wrap) return;
    wrap.style.display = 'block';
    var ingList = Array.isArray(res.ingredients) ? res.ingredients.map(function(i){ return escapeHtml(i.name) + ' ×' + (i.qty||1); }).join(', ') : '—';
    wrap.innerHTML =
      '<div class="fae-ref-card" style="padding:20px;border-color:#c9a45c;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">' +
          '<div class="fae-ref-card-k" style="font-size:20px;margin:0;">🧪 ' + escapeHtml(res.name || 'Алхимический состав') + '</div>' +
          '<span class="fae-ref-item-tag">' + escapeHtml(res.rarity || 'Редкий') + ' • СЛ ' + escapeHtml(String(res.dc || 15)) + '</span>' +
        '</div>' +
        '<div style="font-size:12.5px;color:#cbd5e1;margin-bottom:10px;">' +
          '<b>Стоимость:</b> ' + escapeHtml(String(res.cost || 150)) + ' ЗМ &nbsp;|&nbsp; <b>Время:</b> ' + escapeHtml(res.time || '4 часа') + ' &nbsp;|&nbsp; <b>Ингредиенты:</b> ' + ingList +
        '</div>' +
        (res.appearance ? '<div style="font-size:13px;color:#94a3b8;font-style:italic;margin-bottom:10px;">«' + escapeHtml(res.appearance) + '»</div>' : '') +
        '<div class="fae-ref-card-v" style="margin-bottom:14px;">' + escapeHtml(res.effect || '') + '</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
          '<button type="button" class="btn btn-primary" id="btnAlchLabSaveMy">💾 Сохранить в Мои Рецепты</button>' +
          '<button type="button" class="btn btn-ghost" id="btnAlchLabSaveHero">🎒 В снаряжение героя</button>' +
        '</div>' +
      '</div>';

    var saveMyBtn = document.getElementById('btnAlchLabSaveMy');
    if(saveMyBtn){
      saveMyBtn.addEventListener('click', function(){
        var rec = newRecipe({
          name: res.name || 'Алхимический состав',
          category: catKey || 'potions',
          rarity: res.rarity || 'Редкий',
          kit: res.kit === 'herbalism' ? 'herbalism' : (res.kit === 'poisoner' ? 'poisoner' : 'alchemist'),
          cost: Number(res.cost) || 150,
          time: res.time || '4 часа',
          dc: Number(res.dc) || 15,
          ingredients: Array.isArray(res.ingredients) && res.ingredients.length ? res.ingredients : [{name:'Редкий реагент', qty:1}],
          appearance: res.appearance || '',
          effect: res.effect || '',
          source: 'ai'
        });
        RECIPES.unshift(rec);
        saveRecipesToStorage();
        navigate('recipes');
      });
    }

    var saveHeroBtn = document.getElementById('btnAlchLabSaveHero');
    if(saveHeroBtn){
      saveHeroBtn.addEventListener('click', function(){
        var hero = getActiveFaerunCharacter();
        if(!hero) return;
        var line = '• 🧪 ' + (res.name || 'Зелье') + ' (' + (res.rarity || 'Редкий') + '): ' + (res.effect || '');
        hero.equipment = hero.equipment ? (hero.equipment + '\n\n' + line) : line;
        saveCharactersToStorage();
        saveHeroBtn.textContent = '✓ В снаряжении (' + (hero.name || 'Герой') + ')!';
        saveHeroBtn.disabled = true;
      });
    }
  }

  document.querySelectorAll('[data-alch-ai-hist-idx]').forEach(function(card){
    card.addEventListener('click', function(){
      var idx = Number(card.getAttribute('data-alch-ai-hist-idx'));
      var hist = loadAlchLabHistory();
      if(hist[idx]) showAlchLabPreview(hist[idx], hist[idx].category || 'potions');
    });
  });

  var genBtn = document.getElementById('btnAlchLabGenerate');
  if(genBtn){
    genBtn.addEventListener('click', function(){
      var k = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
      if(!k){
        var inp = prompt('Введите Google Gemini API ключ для генерации:');
        if(inp && inp.trim()){
          k = inp.trim();
          if(typeof window.saveGeminiApiKey === 'function') window.saveGeminiApiKey(k);
        } else return;
      }
      var theme = (document.getElementById('alchLabTheme')?.value || '').trim() || 'Уникальный алхимический эликсир Фаэруна';
      var catKey = document.getElementById('alchLabCat')?.value || 'potions';
      var catMeta = getAlchemyCatMeta(catKey);
      var rarity = document.getElementById('alchLabRarity')?.value || 'Редкий (СЛ 15)';
      var kit = document.getElementById('alchLabKit')?.value || 'alchemist';
      var req = (document.getElementById('alchLabReq')?.value || '').trim();

      genBtn.disabled = true;
      genBtn.textContent = '⚗️ Дистилляция реагентов в Плетении...';

      callGeminiFaeGenerator({
        cat: 'alchemy',
        theme: theme,
        alchType: catMeta.label,
        alchRarity: rarity,
        alchKit: kit,
        req: req
      }, k, function(err, result){
        genBtn.disabled = false;
        genBtn.textContent = '⚗️ Синтезировать рецепт через AI';
        if(err || !result){
          alert('Ошибка генерации рецепта: ' + (err || 'Пустой ответ'));
          return;
        }
        result.category = catKey;
        var hist = loadAlchLabHistory();
        hist.unshift(result);
        saveAlchLabHistory(hist);
        showAlchLabPreview(result, catKey);
      });
    });
  }
}

/* ============================================================
   СПОСОБНОСТИ ГЕРОЯ (faeTechs) И БОЕВЫЕ ПРИЁМЫ (faeMoves) ФАЭРУНА
   (по образцу разделов Ведьмака wiTechs / wiMoves)
   ============================================================ */

var FAE_TECH_CATEGORIES = [
  { key: 'all', label: 'Все способности', icon: '✨' },
  { key: 'Классовые умения', label: 'Классовые умения', icon: '⚔️' },
  { key: 'Вид и Происхождение', label: 'Вид и Происхождение', icon: '🧬' },
  { key: 'Черты (Feats)', label: 'Черты (Feats)', icon: '⭐' },
  { key: 'Магические и Сверхъестественные дары', label: 'Магические дары', icon: '🔮' },
  { key: 'Защитные и Пассивные особенности', label: 'Защита и Пассивные', icon: '🛡️' }
];

var FAE_MOVE_CATEGORIES = [
  { key: 'all', label: 'Все приёмы', icon: '⚔️' },
  { key: 'Оружейные атаки и Мастерство (2024)', label: 'Оружие и Мастерство 2024', icon: '🗡️' },
  { key: 'Приёмы Боевого Мастера (Maneuvers)', label: 'Манёвры Боевого Мастера', icon: '🎯' },
  { key: 'Особые удары, Захваты и Толчки', label: 'Особые удары и Захваты', icon: '💥' },
  { key: 'Защитные стойки и Реакции', label: 'Стойки и Реакции', icon: '🛡️' },
  { key: 'Дистанционные и Стрелковые приёмы', label: 'Стрелковые приёмы', icon: '🏹' }
];

function renderFaeAbilitiesTabBar(activeTab){
  var c = getActiveFaerunCharacter();
  var chars = Array.isArray(CHARACTERS) ? CHARACTERS : [c];
  var tCount = (c && Array.isArray(c.techs)) ? c.techs.length : 0;
  var mCount = (c && Array.isArray(c.moves)) ? c.moves.length : 0;

  var charOpts = chars.map(function(ch){
    var isSel = c && ch.id === c.id;
    return '<option value="' + escapeAttr(ch.id) + '" ' + (isSel ? 'selected' : '') + '>' +
      getFaerunClassIcon(ch.className) + ' ' + escapeHtml(ch.name || 'Герой') + ' (' + escapeHtml(ch.className || 'D&D') + ' ' + (ch.level||1) + ' ур.)' +
    '</option>';
  }).join('');

  return '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;">' +
    '<div class="fae-nav-tabs" style="margin-bottom:0;flex:1;min-width:280px;">' +
      '<button type="button" class="fae-nav-tab ' + (activeTab==='techs'?'active':'') + '" data-go="faeTechs">' +
        '✨ Способности и Умения (' + tCount + ')' +
      '</button>' +
      '<button type="button" class="fae-nav-tab ' + (activeTab==='moves'?'active':'') + '" data-go="faeMoves">' +
        '⚔️ Боевые приёмы (' + mCount + ')' +
      '</button>' +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:8px;">' +
      '<span style="font-size:11.5px;color:#c9a45c;font-family:\'Cinzel\',serif;font-weight:700;">Герой:</span>' +
      '<select id="faeAbilHeroSelect" class="fae-input" style="padding:7px 12px;font-size:13px;min-width:210px;">' + charOpts + '</select>' +
    '</div>' +
  '</div>';
}

function wireFaeAbilitiesHeroSelect(){
  var sel = document.getElementById('faeAbilHeroSelect');
  if(sel){
    sel.addEventListener('change', function(){
      setActiveFaerunCharacter(this.value);
      render();
    });
  }
}

function renderFaeTechs(){
  var c = getActiveFaerunCharacter();
  var techs = (c && Array.isArray(c.techs)) ? c.techs : [];
  var activeCat = window._faeTechCat || 'all';
  var searchQ = (window._faeTechSearch || '').trim().toLowerCase();

  var pillsHtml = FAE_TECH_CATEGORIES.map(function(cat){
    var cnt = cat.key === 'all' ? techs.length : techs.filter(function(t){ return t.category === cat.key; }).length;
    return '<button type="button" class="fae-pill ' + (activeCat === cat.key ? 'active' : '') + '" data-fae-tech-cat="' + escapeAttr(cat.key) + '">' +
      cat.icon + ' ' + escapeHtml(cat.label) + ' <span style="opacity:0.75;font-size:11px;">(' + cnt + ')</span>' +
    '</button>';
  }).join('');

  var filtered = techs.filter(function(t){
    if(activeCat !== 'all' && t.category !== activeCat) return false;
    if(searchQ){
      var hay = [t.name, t.category, t.source, t.actionCost, t.cooldown, t.checkOrSave, t.desc].join(' ').toLowerCase();
      if(hay.indexOf(searchQ) === -1) return false;
    }
    return true;
  });

  var cardsHtml = filtered.length ? (
    '<div class="fae-ref-cards-grid">' +
      filtered.map(function(t){
        var copyStr = '✨ ' + (t.name || 'Способность') + ' [' + (t.category || 'Умение') + ', ' + (t.actionCost || 'Пассивно') + (t.cooldown ? (', ' + t.cooldown) : '') + ']: ' + (t.desc || '');
        return '<div class="fae-ref-card" data-fae-tech-open="' + escapeAttr(t.id) + '" style="display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;">' +
          '<div>' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
              '<div class="fae-ref-card-k" style="margin-bottom:0;">✨ ' + escapeHtml(t.name || 'Без названия') + '</div>' +
              '<span class="fae-ref-item-tag">' + escapeHtml(t.actionCost || '1 действие') + '</span>' +
            '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;font-size:11.5px;color:#cbd5e1;font-family:\'JetBrains Mono\',monospace;">' +
              '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;">📂 ' + escapeHtml(t.category || 'Классовые умения') + '</span>' +
              (t.source ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;color:#fde68a;">🎓 ' + escapeHtml(t.source) + '</span>' : '') +
              (t.cooldown ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;">🔄 ' + escapeHtml(t.cooldown) + '</span>' : '') +
              (t.checkOrSave ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;color:#fca5a5;">🎲 ' + escapeHtml(t.checkOrSave) + '</span>' : '') +
            '</div>' +
            '<div class="fae-ref-card-v" style="margin-bottom:12px;">' + escapeHtml(t.desc || '') + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;padding-top:8px;border-top:1px solid rgba(201,164,92,0.18);">' +
            '<button type="button" class="rc-btn" data-fae-tech-copy="' + escapeAttr(copyStr) + '">📋 Копировать</button>' +
            '<button type="button" class="rc-btn" data-go="faeTechEdit:' + escapeAttr(t.id) + '">✏️ Изменить</button>' +
            '<button type="button" class="rc-btn" data-fae-tech-del="' + escapeAttr(t.id) + '" style="color:#f87171;">🗑️</button>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>'
  ) : '<div class="char-empty">У героя пока нет способностей в этой категории. Нажмите «+ Добавить способность» или «🤖 Создать с ИИ»!</div>';

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Способности героя'}]) +
    '<button class="back" data-go="home">← На главную</button>' +
    renderFaeAbilitiesTabBar('techs') +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
      '<div>' +
        '<h1>✨ Способности и Умения Героя</h1>' +
        '<p class="subtitle">Классовые умения, особенности вида, черты (Feats) и сверхъестественные таланты персонажа. Доступны для выбора при броске костей.</p>' +
      '</div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
        '<button type="button" class="btn btn-primary" data-go="faeTechEdit:new">+ Добавить способность</button>' +
        '<button type="button" class="ai-gen-btn" data-go="faeTechGen" style="padding:9px 16px;font-size:13px;">🤖 Создать с ИИ</button>' +
      '</div>' +
    '</div>' +
    '<div class="fae-rule"></div>' +

    '<div class="fae-ref-search-wrap" style="margin-bottom:14px;">' +
      '<span class="fae-ref-search-icon">🔍</span>' +
      '<input type="text" id="faeTechSearchInp" class="fae-ref-search-input" value="' + escapeAttr(window._faeTechSearch || '') + '" placeholder="Поиск по названию способности, классу, черте или эффекту..." autocomplete="off">' +
    '</div>' +

    '<div class="pill-row" style="margin-bottom:18px;">' + pillsHtml + '</div>' +
    cardsHtml;
}

function renderFaeTechView(){
  var c = getActiveFaerunCharacter();
  var t = (c && Array.isArray(c.techs)) ? c.techs.find(function(x){ return x.id === view.techId; }) : null;
  if(!t) return renderFaeTechs();

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Способности', nav:'faeTechs'}, {label:t.name || 'Способность'}]) +
    '<button class="back" data-go="faeTechs">← К списку способностей</button>' +
    renderFaeAbilitiesTabBar('techs') +
    '<div class="fae-ref-card" style="padding:22px;border-color:rgba(201,164,92,0.45);">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">' +
        '<div>' +
          '<span class="fae-ref-item-tag">✨ ' + escapeHtml(t.category || 'Классовые умения') + '</span>' +
          '<h1 style="margin:8px 0 0 0;font-size:24px;">' + escapeHtml(t.name || 'Способность') + '</h1>' +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
          '<button type="button" class="btn btn-primary" data-go="faeTechEdit:' + escapeAttr(t.id) + '">✏️ Редактировать</button>' +
        '</div>' +
      '</div>' +
      '<div class="fae-rule"></div>' +
      '<div class="fae-gen-stat-grid" style="margin-bottom:14px;">' +
        '<div class="fae-gen-stat-box"><span class="lbl">🎓 Источник / Уровень</span><span class="val">' + escapeHtml(t.source || 'Умение героя') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">⚡ Тип действия</span><span class="val">' + escapeHtml(t.actionCost || '1 действие') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">🔄 Перезарядка</span><span class="val">' + escapeHtml(t.cooldown || 'Короткий / Долгий отдых') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">🎲 Бросок / СЛ</span><span class="val">' + escapeHtml(t.checkOrSave || '—') + '</span></div>' +
      '</div>' +
      '<div class="fae-gen-block"><b>📜 Описание и игровая механика:</b><br><span style="white-space:pre-line;">' + escapeHtml(t.desc || '') + '</span></div>' +
    '</div>';
}

function renderFaeTechEdit(){
  var c = getActiveFaerunCharacter();
  var existing = (c && Array.isArray(c.techs) && view.techId && view.techId !== 'new')
    ? c.techs.find(function(x){ return x.id === view.techId; })
    : null;
  var d = existing ? JSON.parse(JSON.stringify(existing)) : {
    id: '',
    name: '',
    category: 'Классовые умения',
    source: (c && c.className ? (c.className + ' ' + (c.level||1) + ' ур.') : 'Уровень 1'),
    actionCost: '1 бонусное действие',
    cooldown: '1 раз за короткий или долгий отдых',
    checkOrSave: '',
    desc: ''
  };

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Способности', nav:'faeTechs'}, {label:existing ? d.name : 'Новая способность'}]) +
    '<button class="back" data-go="faeTechs">← К списку способностей</button>' +
    renderFaeAbilitiesTabBar('techs') +
    '<h1>' + escapeHtml(existing ? ('Редактирование: ' + d.name) : 'Новая способность героя') + '</h1>' +
    '<div class="fae-rule"></div>' +
    '<div class="fae-ref-card" style="padding:20px;">' +
      '<input type="hidden" id="faeTechEditId" value="' + escapeAttr(d.id || '') + '">' +
      '<div class="fae-edit-grid">' +
        '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
          '<label>Название способности / черты / дара</label>' +
          '<input type="text" class="fae-input" id="faeTechName" value="' + escapeAttr(d.name) + '" placeholder="Напр. Всплеск действий (Action Surge), Божественная кара, Черта: Бдительный">' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Категория</label>' +
          '<select class="fae-input" id="faeTechCat">' +
            FAE_TECH_CATEGORIES.filter(function(x){ return x.key !== 'all'; }).map(function(cat){
              return '<option value="' + escapeAttr(cat.key) + '" ' + (d.category === cat.key ? 'selected' : '') + '>' + cat.icon + ' ' + escapeHtml(cat.label) + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Источник / Требование / Уровень</label>' +
          '<input type="text" class="fae-input" id="faeTechSource" value="' + escapeAttr(d.source) + '" placeholder="Напр. Воин 2 ур. / Эльф / Черта 4 ур.">' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Затраты времени (Action Economy)</label>' +
          '<select class="fae-input" id="faeTechAction">' +
            ['Пассивно (Постоянно)', '1 действие', '1 бонусное действие', '1 реакция', 'Часть действия Атаки', 'Свободное действие', '1 минута (Ритуал)'].map(function(act){
              return '<option value="' + escapeAttr(act) + '" ' + (d.actionCost === act ? 'selected' : '') + '>' + escapeHtml(act) + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Перезарядка / Заряды</label>' +
          '<input type="text" class="fae-input" id="faeTechCooldown" value="' + escapeAttr(d.cooldown) + '" placeholder="Напр. Постоянно / Короткий отдых / БМ раз в день">' +
        '</div>' +
        '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
          '<label>Формула броска, исцеления или СЛ спасброска (необязательно)</label>' +
          '<input type="text" class="fae-input" id="faeTechSave" value="' + escapeAttr(d.checkOrSave) + '" placeholder="Напр. 1d10 + уровень хитов / СЛ 8 + БМ + Мод">' +
        '</div>' +
        '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
          '<label>Полное описание и игровая механика</label>' +
          '<textarea class="fae-input" id="faeTechDesc" rows="5" placeholder="Опишите точные правила работы способности по D&D 5e / 2024...">' + escapeHtml(d.desc) + '</textarea>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-top:18px;">' +
        '<button type="button" class="btn btn-primary" id="btnFaeSaveTech">💾 Сохранить способность</button>' +
        '<button type="button" class="btn btn-ghost" data-go="faeTechs">Отмена</button>' +
      '</div>' +
    '</div>';
}

function renderFaeTechGen(){
  var c = getActiveFaerunCharacter();
  var hasKey = !!((typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '');
  var heroCtx = c ? (c.name + ' (' + (c.species || 'Человек') + ', ' + (c.className || 'Воин') + ' ' + (c.level || 1) + ' ур.' + (c.subclass ? (', ' + c.subclass) : '') + ')') : 'Герой Фаэруна';

  var presets = [
    { label: 'Клятва Рассветного Пламени', theme: 'Классовое умение паладина или воина, окутывающее клинок солнечным светом и защищающее союзников', cat: 'Классовые умения' },
    { label: 'Наследие Теневого Плетения', theme: 'Видовая или магическая способность телепортации сквозь тени с преимуществом на следующую атаку', cat: 'Магические и Сверхъестественные дары' },
    { label: 'Черта: Тактик Побережья Мечей', theme: 'Боевая черта D&D 2024 (+1 к характеристике и командный тактический манёвр для союзника)', cat: 'Черты (Feats)' },
    { label: 'Несокрушимость Стального Бастиона', theme: 'Пассивно-реактивная защитная особенность, снижающая входящий урон и дающая иммунитет к опрокидыванию', cat: 'Защитные и Пассивные особенности' }
  ];

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Способности', nav:'faeTechs'}, {label:'AI Конструктор способностей'}]) +
    '<button class="back" data-go="faeTechs">← К списку способностей</button>' +
    renderFaeAbilitiesTabBar('techs') +
    '<h1>🤖 AI Генератор Способностей D&D</h1>' +
    '<p class="subtitle">Создание сбалансированных классовых умений, черт (Feats) и мистических даров для героя: <b style="color:#c9a45c;">' + escapeHtml(heroCtx) + '</b></p>' +
    '<div class="fae-rule"></div>' +

    '<div class="ai-gen-box">' +
      '<div class="fae-gen-preset-wrap" style="margin-bottom:14px;">' +
        '<div style="font-size:11.5px;color:#c9a45c;font-family:\'Cinzel\',serif;font-weight:700;margin-bottom:6px;">⚡ БЫСТРЫЕ ИДЕИ СПОСОБНОСТЕЙ:</div>' +
        '<div class="fae-gen-preset-row">' +
          presets.map(function(p){
            return '<button type="button" class="fae-gen-preset-chip" data-fae-tech-preset="' + escapeAttr(p.theme) + '" data-cat="' + escapeAttr(p.cat) + '">💡 ' + escapeHtml(p.label) + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="fae-edit-grid">' +
        '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
          '<label>Идея или название способности</label>' +
          '<input type="text" class="fae-input" id="faeTechGenTheme" placeholder="Напр. Глаз дракона, Печать Мистры, Ярость северного медведя...">' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Категория способности</label>' +
          '<select class="fae-input" id="faeTechGenCat">' +
            FAE_TECH_CATEGORIES.filter(function(x){ return x.key !== 'all'; }).map(function(cat){
              return '<option value="' + escapeAttr(cat.key) + '">' + cat.icon + ' ' + escapeHtml(cat.label) + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Тип активации в бою</label>' +
          '<select class="fae-input" id="faeTechGenAction">' +
            '<option value="1 бонусное действие" selected>🏃 1 бонусное действие</option>' +
            '<option value="1 действие">⚡ 1 действие</option>' +
            '<option value="1 реакция">🛡️ 1 реакция</option>' +
            '<option value="Пассивно (Постоянно)">♾️ Пассивно (Постоянно)</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:16px;">' +
        '<button type="button" class="btn-ghost" id="faeTechGenKeyBtn" style="font-size:12.5px;">🔑 API ключ: ' + (hasKey ? '<span style="color:#4ade80;">✓ Установлен</span>' : '<span style="color:#fbbf24;">⚠️ Не задан</span>') + '</button>' +
        '<button type="button" class="ai-gen-btn" id="btnFaeTechAiRun">✨ Сгенерировать способность</button>' +
      '</div>' +
    '</div>' +
    '<div id="faeTechGenPreviewWrap" style="display:none;margin-top:20px;"></div>';
}

function wireFaeTechs(){
  wireFaeAbilitiesHeroSelect();

  document.querySelectorAll('[data-fae-tech-cat]').forEach(function(btn){
    btn.addEventListener('click', function(){
      window._faeTechCat = btn.getAttribute('data-fae-tech-cat') || 'all';
      render();
    });
  });

  var sInp = document.getElementById('faeTechSearchInp');
  if(sInp){
    sInp.addEventListener('input', function(){
      window._faeTechSearch = this.value;
      var pos = this.selectionStart;
      render();
      var next = document.getElementById('faeTechSearchInp');
      if(next){ next.focus(); try{ next.setSelectionRange(pos, pos); }catch(e){} }
    });
  }

  document.querySelectorAll('[data-fae-tech-open]').forEach(function(card){
    card.addEventListener('click', function(e){
      if(e.target.closest('button') || e.target.closest('[data-go]')) return;
      navigate('faeTechView:' + card.getAttribute('data-fae-tech-open'));
    });
  });

  document.querySelectorAll('[data-fae-tech-copy]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      copyText(btn.getAttribute('data-fae-tech-copy') || '');
      var old = btn.textContent;
      btn.textContent = '✓ Скопировано';
      setTimeout(function(){ btn.textContent = old; }, 1100);
    });
  });

  document.querySelectorAll('[data-fae-tech-del]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var id = btn.getAttribute('data-fae-tech-del');
      var c = getActiveFaerunCharacter();
      if(!c || !Array.isArray(c.techs)) return;
      var found = c.techs.find(function(x){ return x.id === id; });
      if(!confirm('Удалить способность «' + (found ? found.name : '') + '»?')) return;
      c.techs = c.techs.filter(function(x){ return x.id !== id; });
      saveCharactersToStorage();
      render();
    });
  });

  var saveBtn = document.getElementById('btnFaeSaveTech');
  if(saveBtn){
    saveBtn.addEventListener('click', function(){
      var c = getActiveFaerunCharacter();
      if(!c) return;
      if(!Array.isArray(c.techs)) c.techs = [];
      var id = document.getElementById('faeTechEditId')?.value || genId();
      var item = {
        id: id,
        name: (document.getElementById('faeTechName')?.value || '').trim() || 'Новая способность',
        category: document.getElementById('faeTechCat')?.value || 'Классовые умения',
        source: (document.getElementById('faeTechSource')?.value || '').trim() || 'Умение героя',
        actionCost: document.getElementById('faeTechAction')?.value || '1 действие',
        cooldown: (document.getElementById('faeTechCooldown')?.value || '').trim() || 'Короткий отдых',
        checkOrSave: (document.getElementById('faeTechSave')?.value || '').trim(),
        desc: (document.getElementById('faeTechDesc')?.value || '').trim()
      };
      var idx = c.techs.findIndex(function(x){ return x.id === id; });
      if(idx >= 0) c.techs[idx] = item;
      else c.techs.unshift(item);
      saveCharactersToStorage();
      navigate('faeTechs');
    });
  }

  document.querySelectorAll('[data-fae-tech-preset]').forEach(function(chip){
    chip.addEventListener('click', function(){
      var tInp = document.getElementById('faeTechGenTheme');
      var cSel = document.getElementById('faeTechGenCat');
      if(tInp) tInp.value = chip.getAttribute('data-fae-tech-preset') || '';
      if(cSel) cSel.value = chip.getAttribute('data-cat') || 'Классовые умения';
    });
  });

  var keyBtn = document.getElementById('faeTechGenKeyBtn');
  if(keyBtn){
    keyBtn.addEventListener('click', function(){
      var cur = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
      var inp = prompt('Введите Google Gemini API ключ (gemini-4-argon):', cur || '');
      if(inp !== null && typeof window.saveGeminiApiKey === 'function'){
        window.saveGeminiApiKey(inp.trim());
        render();
      }
    });
  }

  var runAiBtn = document.getElementById('btnFaeTechAiRun');
  if(runAiBtn){
    runAiBtn.addEventListener('click', function(){
      var k = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
      if(!k){
        var inp = prompt('Введите Google Gemini API ключ:');
        if(inp && inp.trim()){ k = inp.trim(); if(typeof window.saveGeminiApiKey === 'function') window.saveGeminiApiKey(k); }
        else return;
      }
      var c = getActiveFaerunCharacter();
      var theme = (document.getElementById('faeTechGenTheme')?.value || '').trim() || 'Уникальная способность героя Фаэруна';
      var cat = document.getElementById('faeTechGenCat')?.value || 'Классовые умения';
      var act = document.getElementById('faeTechGenAction')?.value || '1 бонусное действие';

      runAiBtn.disabled = true;
      runAiBtn.textContent = '🔮 Формирование способности...';

      callGeminiFaeGenerator({
        cat: 'feat',
        theme: theme + ' (Активация: ' + act + ')',
        featCat: cat,
        featFocus: act,
        contextInfo: c ? (c.name + ', ' + c.species + ', ' + c.className + ' ' + c.level + ' ур.') : ''
      }, k, function(err, res){
        runAiBtn.disabled = false;
        runAiBtn.textContent = '✨ Сгенерировать способность';
        if(err || !res){
          alert('Ошибка генерации: ' + (err || 'Пустой ответ'));
          return;
        }
        var fullDesc = (res.desc || '') + (Array.isArray(res.features) && res.features.length ? ('\n• ' + res.features.join('\n• ')) : '');
        var wrap = document.getElementById('faeTechGenPreviewWrap');
        if(wrap){
          wrap.style.display = 'block';
          wrap.innerHTML =
            '<div class="fae-ref-card" style="padding:20px;border-color:#c9a45c;">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;">' +
                '<div class="fae-ref-card-k" style="font-size:19px;margin:0;">✨ ' + escapeHtml(res.name || 'Новая способность') + '</div>' +
                '<span class="fae-ref-item-tag">' + escapeHtml(cat) + ' • ' + escapeHtml(act) + '</span>' +
              '</div>' +
              '<div class="fae-ref-card-v" style="white-space:pre-line;margin-bottom:14px;">' + escapeHtml(fullDesc) + '</div>' +
              '<button type="button" class="btn btn-primary" id="btnFaeTechAiSave">💾 Добавить способность герою</button>' +
            '</div>';
          var sv = document.getElementById('btnFaeTechAiSave');
          if(sv){
            sv.addEventListener('click', function(){
              var hero = getActiveFaerunCharacter();
              if(!hero) return;
              if(!Array.isArray(hero.techs)) hero.techs = [];
              hero.techs.unshift({
                id: genId(),
                name: res.name || 'Способность',
                category: cat,
                source: res.prereq || (hero.className + ' ' + hero.level + ' ур.'),
                actionCost: act,
                cooldown: 'Короткий или долгий отдых',
                checkOrSave: res.statBonus || '',
                desc: fullDesc
              });
              saveCharactersToStorage();
              navigate('faeTechs');
            });
          }
        }
      });
    });
  }
}

/* ---------- БОЕВЫЕ ПРИЁМЫ ФАЭРУНА (faeMoves) ---------- */

function renderFaeMoves(){
  var c = getActiveFaerunCharacter();
  var moves = (c && Array.isArray(c.moves)) ? c.moves : [];
  var activeCat = window._faeMoveCat || 'all';
  var searchQ = (window._faeMoveSearch || '').trim().toLowerCase();

  var pillsHtml = FAE_MOVE_CATEGORIES.map(function(cat){
    var cnt = cat.key === 'all' ? moves.length : moves.filter(function(m){ return m.category === cat.key; }).length;
    return '<button type="button" class="fae-pill ' + (activeCat === cat.key ? 'active' : '') + '" data-fae-move-cat="' + escapeAttr(cat.key) + '">' +
      cat.icon + ' ' + escapeHtml(cat.label) + ' <span style="opacity:0.75;font-size:11px;">(' + cnt + ')</span>' +
    '</button>';
  }).join('');

  var filtered = moves.filter(function(m){
    if(activeCat !== 'all' && m.category !== activeCat) return false;
    if(searchQ){
      var hay = [m.name, m.category, m.weaponOrStyle, m.attackBonus, m.damageOrSave, m.mastery, m.actionCost, m.desc].join(' ').toLowerCase();
      if(hay.indexOf(searchQ) === -1) return false;
    }
    return true;
  });

  var cardsHtml = filtered.length ? (
    '<div class="fae-ref-cards-grid">' +
      filtered.map(function(m){
        var copyStr = '⚔️ ' + (m.name || 'Приём') + ' [' + (m.weaponOrStyle || 'Оружие') + (m.attackBonus ? (', атака ' + m.attackBonus) : '') + (m.damageOrSave ? (', ' + m.damageOrSave) : '') + (m.mastery ? (', Мастерство: ' + m.mastery) : '') + ']: ' + (m.desc || '');
        return '<div class="fae-ref-card" data-fae-move-open="' + escapeAttr(m.id) + '" style="display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;">' +
          '<div>' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
              '<div class="fae-ref-card-k" style="margin-bottom:0;">⚔️ ' + escapeHtml(m.name || 'Без названия') + '</div>' +
              '<span class="fae-ref-item-tag">' + escapeHtml(m.actionCost || 'Атака') + '</span>' +
            '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;font-size:11.5px;color:#cbd5e1;font-family:\'JetBrains Mono\',monospace;">' +
              (m.weaponOrStyle ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;">🗡️ ' + escapeHtml(m.weaponOrStyle) + '</span>' : '') +
              (m.attackBonus ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;color:#4ade80;">🎯 ' + escapeHtml(m.attackBonus) + '</span>' : '') +
              (m.damageOrSave ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;color:#fca5a5;">💥 ' + escapeHtml(m.damageOrSave) + '</span>' : '') +
              (m.mastery ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;color:#fde68a;">⚡ ' + escapeHtml(m.mastery) + '</span>' : '') +
            '</div>' +
            '<div class="fae-ref-card-v" style="margin-bottom:12px;">' + escapeHtml(m.desc || '') + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;padding-top:8px;border-top:1px solid rgba(201,164,92,0.18);">' +
            '<button type="button" class="rc-btn" data-fae-move-copy="' + escapeAttr(copyStr) + '">📋 Копировать</button>' +
            '<button type="button" class="rc-btn" data-go="faeMoveEdit:' + escapeAttr(m.id) + '">✏️ Изменить</button>' +
            '<button type="button" class="rc-btn" data-fae-move-del="' + escapeAttr(m.id) + '" style="color:#f87171;">🗑️</button>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>'
  ) : '<div class="char-empty">У героя пока нет боевых приёмов в этой категории. Нажмите «+ Добавить приём» или «🤖 Создать приём с ИИ»!</div>';

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Боевые приёмы'}]) +
    '<button class="back" data-go="home">← На главную</button>' +
    renderFaeAbilitiesTabBar('moves') +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
      '<div>' +
        '<h1>⚔️ Боевые Приёмы и Оружейные Техники</h1>' +
        '<p class="subtitle">Удары оружием, свойства Мастерства D&D 2024, манёвры Боевого Мастера и защитные стойки. Доступны в экране броска костей.</p>' +
      '</div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
        '<button type="button" class="btn btn-primary" data-go="faeMoveEdit:new">+ Добавить приём</button>' +
        '<button type="button" class="ai-gen-btn" data-go="faeMoveGen" style="padding:9px 16px;font-size:13px;">🤖 Создать приём с ИИ</button>' +
      '</div>' +
    '</div>' +
    '<div class="fae-rule"></div>' +

    '<div class="fae-ref-search-wrap" style="margin-bottom:14px;">' +
      '<span class="fae-ref-search-icon">🔍</span>' +
      '<input type="text" id="faeMoveSearchInp" class="fae-ref-search-input" value="' + escapeAttr(window._faeMoveSearch || '') + '" placeholder="Поиск по названию приёма, оружию, Мастерству 2024 или урону..." autocomplete="off">' +
    '</div>' +

    '<div class="pill-row" style="margin-bottom:18px;">' + pillsHtml + '</div>' +
    cardsHtml;
}

function renderFaeMoveView(){
  var c = getActiveFaerunCharacter();
  var m = (c && Array.isArray(c.moves)) ? c.moves.find(function(x){ return x.id === view.moveId; }) : null;
  if(!m) return renderFaeMoves();

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Боевые приёмы', nav:'faeMoves'}, {label:m.name || 'Боевой приём'}]) +
    '<button class="back" data-go="faeMoves">← К списку боевых приёмов</button>' +
    renderFaeAbilitiesTabBar('moves') +
    '<div class="fae-ref-card" style="padding:22px;border-color:rgba(201,164,92,0.45);">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">' +
        '<div>' +
          '<span class="fae-ref-item-tag">⚔️ ' + escapeHtml(m.category || 'Боевой приём') + '</span>' +
          '<h1 style="margin:8px 0 0 0;font-size:24px;">' + escapeHtml(m.name || 'Приём') + '</h1>' +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
          '<button type="button" class="btn btn-primary" data-go="faeMoveEdit:' + escapeAttr(m.id) + '">✏️ Редактировать</button>' +
        '</div>' +
      '</div>' +
      '<div class="fae-rule"></div>' +
      '<div class="fae-gen-stat-grid" style="margin-bottom:14px;">' +
        '<div class="fae-gen-stat-box"><span class="lbl">🗡️ Оружие / Стойка</span><span class="val">' + escapeHtml(m.weaponOrStyle || 'Любое оружие') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">🎯 Бонус атаки</span><span class="val">' + escapeHtml(m.attackBonus || '—') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">💥 Урон / Спасбросок</span><span class="val">' + escapeHtml(m.damageOrSave || '—') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">⚡ Мастерство 2024</span><span class="val">' + escapeHtml(m.mastery || '—') + '</span></div>' +
      '</div>' +
      '<div class="fae-gen-block"><b>📜 Тактика и боевой эффект:</b><br><span style="white-space:pre-line;">' + escapeHtml(m.desc || '') + '</span></div>' +
    '</div>';
}

function renderFaeMoveEdit(){
  var c = getActiveFaerunCharacter();
  var existing = (c && Array.isArray(c.moves) && view.moveId && view.moveId !== 'new')
    ? c.moves.find(function(x){ return x.id === view.moveId; })
    : null;
  var d = existing ? JSON.parse(JSON.stringify(existing)) : {
    id: '',
    name: '',
    category: 'Оружейные атаки и Мастерство (2024)',
    weaponOrStyle: 'Длинный меч / Рукопашный бой',
    attackBonus: '+6',
    damageOrSave: '1d8+4 рубящий',
    mastery: 'Подрыв / Sap (Помеха следующей атаке врага)',
    actionCost: 'Часть действия Атаки',
    desc: ''
  };

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Боевые приёмы', nav:'faeMoves'}, {label:existing ? d.name : 'Новый приём'}]) +
    '<button class="back" data-go="faeMoves">← К списку боевых приёмов</button>' +
    renderFaeAbilitiesTabBar('moves') +
    '<h1>' + escapeHtml(existing ? ('Редактирование: ' + d.name) : 'Новый боевой приём') + '</h1>' +
    '<div class="fae-rule"></div>' +
    '<div class="fae-ref-card" style="padding:20px;">' +
      '<input type="hidden" id="faeMoveEditId" value="' + escapeAttr(d.id || '') + '">' +
      '<div class="fae-edit-grid">' +
        '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
          '<label>Название боевого приёма / манёвра</label>' +
          '<input type="text" class="fae-input" id="faeMoveName" value="' + escapeAttr(d.name) + '" placeholder="Напр. Парирование и Рипост, Рассекающий вихрь, Опрокидывающий удар">' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Категория приёма</label>' +
          '<select class="fae-input" id="faeMoveCat">' +
            FAE_MOVE_CATEGORIES.filter(function(x){ return x.key !== 'all'; }).map(function(cat){
              return '<option value="' + escapeAttr(cat.key) + '" ' + (d.category === cat.key ? 'selected' : '') + '>' + cat.icon + ' ' + escapeHtml(cat.label) + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Оружие / Боевой стиль</label>' +
          '<input type="text" class="fae-input" id="faeMoveWeapon" value="' + escapeAttr(d.weaponOrStyle) + '" placeholder="Напр. Двуручный меч, Парные кинжалы, Длинный лук">' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Бонус попадания / Затраты кости превосходства</label>' +
          '<input type="text" class="fae-input" id="faeMoveBonus" value="' + escapeAttr(d.attackBonus) + '" placeholder="Напр. +7 к попаданию / 1 кость превосходства d8">' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Формула урона или СЛ спасброска</label>' +
          '<input type="text" class="fae-input" id="faeMoveDamage" value="' + escapeAttr(d.damageOrSave) + '" placeholder="Напр. 2d6+4 + 1d8 (СЛ Силы 15)">' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Мастерство оружия D&D 2024 (если применимо)</label>' +
          '<input type="text" class="fae-input" id="faeMoveMastery" value="' + escapeAttr(d.mastery) + '" placeholder="Напр. Поваливание (Topple), Прорубание (Cleave), Досада (Vex)">' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Затраты действия</label>' +
          '<select class="fae-input" id="faeMoveAction">' +
            ['Часть действия Атаки', '1 действие', '1 бонусное действие', '1 реакция', 'Особая стойка'].map(function(act){
              return '<option value="' + escapeAttr(act) + '" ' + (d.actionCost === act ? 'selected' : '') + '>' + escapeHtml(act) + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
          '<label>Описание техники, условия и тактический эффект</label>' +
          '<textarea class="fae-input" id="faeMoveDesc" rows="5" placeholder="Опишите механику удара, дистанцию, спасбросок врага и тактический эффект...">' + escapeHtml(d.desc) + '</textarea>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-top:18px;">' +
        '<button type="button" class="btn btn-primary" id="btnFaeSaveMove">💾 Сохранить приём</button>' +
        '<button type="button" class="btn btn-ghost" data-go="faeMoves">Отмена</button>' +
      '</div>' +
    '</div>';
}

function renderFaeMoveGen(){
  var c = getActiveFaerunCharacter();
  var hasKey = !!((typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '');
  var heroCtx = c ? (c.name + ' (' + (c.species || 'Человек') + ', ' + (c.className || 'Воин') + ' ' + (c.level || 1) + ' ур.)') : 'Герой Фаэруна';

  var presets = [
    { label: 'Вихрь Стали Вотердипа', theme: 'Фехтовальный приём с прорубанием двоих противников и шагом из-под удара без провоцированной атаки', cat: 'Оружейные атаки и Мастерство (2024)' },
    { label: 'Сокрушающий Гарпун Боевого Мастера', theme: 'Манёвр с костью превосходства, пробивающий щит врага и сбивающий его с ног (Topple)', cat: 'Приёмы Боевого Мастера (Maneuvers)' },
    { label: 'Железный Заслон Стража', theme: 'Реактивная стойка со щитом или клинком, перехватывающая удар по соседнему союзнику с контратакой', cat: 'Защитные стойки и Реакции' },
    { label: 'Стрела Громового Пронзания', theme: 'Стрелковый приём следопыта или воина, пригвождающий цель к месту и снижающий её скорость до 0', cat: 'Дистанционные и Стрелковые приёмы' }
  ];

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Боевые приёмы', nav:'faeMoves'}, {label:'AI Конструктор приёмов'}]) +
    '<button class="back" data-go="faeMoves">← К списку боевых приёмов</button>' +
    renderFaeAbilitiesTabBar('moves') +
    '<h1>🤖 AI Генератор Боевых Приёмов D&D</h1>' +
    '<p class="subtitle">Создание оружейных техник, манёвров превосходства и приёмов Мастерства D&D 2024 для героя: <b style="color:#c9a45c;">' + escapeHtml(heroCtx) + '</b></p>' +
    '<div class="fae-rule"></div>' +

    '<div class="ai-gen-box">' +
      '<div class="fae-gen-preset-wrap" style="margin-bottom:14px;">' +
        '<div style="font-size:11.5px;color:#c9a45c;font-family:\'Cinzel\',serif;font-weight:700;margin-bottom:6px;">⚡ БЫСТРЫЕ ИДЕИ БОЕВЫХ ПРИЁМОВ:</div>' +
        '<div class="fae-gen-preset-row">' +
          presets.map(function(p){
            return '<button type="button" class="fae-gen-preset-chip" data-fae-move-preset="' + escapeAttr(p.theme) + '" data-cat="' + escapeAttr(p.cat) + '">💡 ' + escapeHtml(p.label) + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="fae-edit-grid">' +
        '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
          '<label>Идея или название боевого приёма</label>' +
          '<input type="text" class="fae-input" id="faeMoveGenTheme" placeholder="Напр. Рассекающий полумесяц, Контратака сквозь гарду, Выстрел по сухожилиям...">' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Категория приёма</label>' +
          '<select class="fae-input" id="faeMoveGenCat">' +
            FAE_MOVE_CATEGORIES.filter(function(x){ return x.key !== 'all'; }).map(function(cat){
              return '<option value="' + escapeAttr(cat.key) + '">' + cat.icon + ' ' + escapeHtml(cat.label) + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Оружие исполнения</label>' +
          '<input type="text" class="fae-input" id="faeMoveGenWeapon" value="Длинный меч / Универсальное оружие" placeholder="Напр. Двуручный меч, Рапира, Лук, Парные клинки">' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:16px;">' +
        '<button type="button" class="btn-ghost" id="faeMoveGenKeyBtn" style="font-size:12.5px;">🔑 API ключ: ' + (hasKey ? '<span style="color:#4ade80;">✓ Установлен</span>' : '<span style="color:#fbbf24;">⚠️ Не задан</span>') + '</button>' +
        '<button type="button" class="ai-gen-btn" id="btnFaeMoveAiRun">⚔️ Сгенерировать боевой приём</button>' +
      '</div>' +
    '</div>' +
    '<div id="faeMoveGenPreviewWrap" style="display:none;margin-top:20px;"></div>';
}

function wireFaeMoves(){
  wireFaeAbilitiesHeroSelect();

  document.querySelectorAll('[data-fae-move-cat]').forEach(function(btn){
    btn.addEventListener('click', function(){
      window._faeMoveCat = btn.getAttribute('data-fae-move-cat') || 'all';
      render();
    });
  });

  var sInp = document.getElementById('faeMoveSearchInp');
  if(sInp){
    sInp.addEventListener('input', function(){
      window._faeMoveSearch = this.value;
      var pos = this.selectionStart;
      render();
      var next = document.getElementById('faeMoveSearchInp');
      if(next){ next.focus(); try{ next.setSelectionRange(pos, pos); }catch(e){} }
    });
  }

  document.querySelectorAll('[data-fae-move-open]').forEach(function(card){
    card.addEventListener('click', function(e){
      if(e.target.closest('button') || e.target.closest('[data-go]')) return;
      navigate('faeMoveView:' + card.getAttribute('data-fae-move-open'));
    });
  });

  document.querySelectorAll('[data-fae-move-copy]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      copyText(btn.getAttribute('data-fae-move-copy') || '');
      var old = btn.textContent;
      btn.textContent = '✓ Скопировано';
      setTimeout(function(){ btn.textContent = old; }, 1100);
    });
  });

  document.querySelectorAll('[data-fae-move-del]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var id = btn.getAttribute('data-fae-move-del');
      var c = getActiveFaerunCharacter();
      if(!c || !Array.isArray(c.moves)) return;
      var found = c.moves.find(function(x){ return x.id === id; });
      if(!confirm('Удалить боевой приём «' + (found ? found.name : '') + '»?')) return;
      c.moves = c.moves.filter(function(x){ return x.id !== id; });
      saveCharactersToStorage();
      render();
    });
  });

  var saveBtn = document.getElementById('btnFaeSaveMove');
  if(saveBtn){
    saveBtn.addEventListener('click', function(){
      var c = getActiveFaerunCharacter();
      if(!c) return;
      if(!Array.isArray(c.moves)) c.moves = [];
      var id = document.getElementById('faeMoveEditId')?.value || genId();
      var item = {
        id: id,
        name: (document.getElementById('faeMoveName')?.value || '').trim() || 'Новый боевой приём',
        category: document.getElementById('faeMoveCat')?.value || 'Оружейные атаки и Мастерство (2024)',
        weaponOrStyle: (document.getElementById('faeMoveWeapon')?.value || '').trim() || 'Оружие ближнего боя',
        attackBonus: (document.getElementById('faeMoveBonus')?.value || '').trim() || '+5',
        damageOrSave: (document.getElementById('faeMoveDamage')?.value || '').trim() || '1d8+3',
        mastery: (document.getElementById('faeMoveMastery')?.value || '').trim(),
        actionCost: document.getElementById('faeMoveAction')?.value || 'Часть действия Атаки',
        desc: (document.getElementById('faeMoveDesc')?.value || '').trim()
      };
      var idx = c.moves.findIndex(function(x){ return x.id === id; });
      if(idx >= 0) c.moves[idx] = item;
      else c.moves.unshift(item);
      saveCharactersToStorage();
      navigate('faeMoves');
    });
  }

  document.querySelectorAll('[data-fae-move-preset]').forEach(function(chip){
    chip.addEventListener('click', function(){
      var tInp = document.getElementById('faeMoveGenTheme');
      var cSel = document.getElementById('faeMoveGenCat');
      if(tInp) tInp.value = chip.getAttribute('data-fae-move-preset') || '';
      if(cSel) cSel.value = chip.getAttribute('data-cat') || 'Оружейные атаки и Мастерство (2024)';
    });
  });

  var keyBtn = document.getElementById('faeMoveGenKeyBtn');
  if(keyBtn){
    keyBtn.addEventListener('click', function(){
      var cur = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
      var inp = prompt('Введите Google Gemini API ключ (gemini-4-argon):', cur || '');
      if(inp !== null && typeof window.saveGeminiApiKey === 'function'){
        window.saveGeminiApiKey(inp.trim());
        render();
      }
    });
  }

  var runAiBtn = document.getElementById('btnFaeMoveAiRun');
  if(runAiBtn){
    runAiBtn.addEventListener('click', function(){
      var k = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
      if(!k){
        var inp = prompt('Введите Google Gemini API ключ:');
        if(inp && inp.trim()){ k = inp.trim(); if(typeof window.saveGeminiApiKey === 'function') window.saveGeminiApiKey(k); }
        else return;
      }
      var c = getActiveFaerunCharacter();
      var theme = (document.getElementById('faeMoveGenTheme')?.value || '').trim() || 'Мастерский оружейный приём Фаэруна';
      var cat = document.getElementById('faeMoveGenCat')?.value || 'Оружейные атаки и Мастерство (2024)';
      var wpn = (document.getElementById('faeMoveGenWeapon')?.value || '').trim() || 'Длинный меч';

      runAiBtn.disabled = true;
      runAiBtn.textContent = '⚔️ Ковка боевого приёма...';

      callGeminiFaeGenerator({
        cat: 'weapon',
        theme: 'Боевой приём / техника фехтования: ' + theme,
        weaponBase: wpn,
        weaponRarity: cat,
        weaponElement: 'Боевое мастерство и тактика D&D 2024',
        weaponMastery: 'Автоматически под тип оружия',
        contextInfo: c ? (c.name + ', ' + c.className + ' ' + c.level + ' ур.') : ''
      }, k, function(err, res){
        runAiBtn.disabled = false;
        runAiBtn.textContent = '⚔️ Сгенерировать боевой приём';
        if(err || !res){
          alert('Ошибка генерации: ' + (err || 'Пустой ответ'));
          return;
        }
        var fullDesc = (res.lore ? (res.lore + '\n\n') : '') + (res.mechanics || '');
        var wrap = document.getElementById('faeMoveGenPreviewWrap');
        if(wrap){
          wrap.style.display = 'block';
          wrap.innerHTML =
            '<div class="fae-ref-card" style="padding:20px;border-color:#c9a45c;">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;">' +
                '<div class="fae-ref-card-k" style="font-size:19px;margin:0;">⚔️ ' + escapeHtml(res.name || 'Боевой приём') + '</div>' +
                '<span class="fae-ref-item-tag">' + escapeHtml(wpn) + ' • ' + escapeHtml(res.mastery || 'Мастерство 2024') + '</span>' +
              '</div>' +
              '<div style="font-size:12.5px;color:#cbd5e1;margin-bottom:10px;">' +
                '<b>Бонус:</b> ' + escapeHtml(res.attackBonus || '+6') + ' &nbsp;|&nbsp; <b>Урон / Эффект:</b> ' + escapeHtml((res.damage || '1d8+4') + ' ' + (res.damageType || '')) +
              '</div>' +
              '<div class="fae-ref-card-v" style="white-space:pre-line;margin-bottom:14px;">' + escapeHtml(fullDesc) + '</div>' +
              '<button type="button" class="btn btn-primary" id="btnFaeMoveAiSave">💾 Добавить приём герою</button>' +
            '</div>';
          var sv = document.getElementById('btnFaeMoveAiSave');
          if(sv){
            sv.addEventListener('click', function(){
              var hero = getActiveFaerunCharacter();
              if(!hero) return;
              if(!Array.isArray(hero.moves)) hero.moves = [];
              hero.moves.unshift({
                id: genId(),
                name: res.name || 'Боевой приём',
                category: cat,
                weaponOrStyle: res.baseWeapon || wpn,
                attackBonus: res.attackBonus || '+6',
                damageOrSave: ((res.damage || '1d8+4') + ' ' + (res.damageType || '')).trim(),
                mastery: res.mastery || 'Подрыв (Sap)',
                actionCost: 'Часть действия Атаки',
                desc: fullDesc
              });
              saveCharactersToStorage();
              navigate('faeMoves');
            });
          }
        }
      });
    });
  }
}


function subclassFeatureCard(f){
  if(f.isLink){
    return `
      <div class="card" data-go="${f.linkTo}">
        <div class="top-row">
          <div class="name">${f.ru}</div>
          <div class="die-badge">Ур. ${f.level}</div>
        </div>
        <div class="desc">${f.desc}</div>
      </div>`;
  }
  const genBtn = f.roll ? `<button class="gen-btn" data-template="${escapeAttr('*[Результат броска '+f.ru+' 1d'+f.roll.sides+': ]*')}" data-count="1" data-sides="${f.roll.sides}" data-mode="sum">Сгенерировать и скопировать результат</button>` : '';
  const genOverlay = f.roll ? `<div class="gen-stamp"><div class="gen-die"></div></div>` : '';
  return `
    <div class="card" data-copy="${escapeAttr(f.ru)}">
      <div class="top-row">
        <div class="name">${f.ru}</div>
        <div class="die-badge">Ур. ${f.level}</div>
      </div>
      <div class="desc">${f.desc}</div>
      ${genBtn}
      <div class="stamp"><span>Скопировано</span></div>
      ${genOverlay}
    </div>`;
}

function renderSubclassFeatures(){
  const clsKey = view.clsKey, subKey = view.subKey;
  const cls = DATA[clsKey];
  const sub = cls ? cls.subclasses[subKey] : null;
  if(!sub){
    view = {screen:'class', cls:clsKey};
    return renderClass();
  }
  const features = [...sub.features].sort((a,b)=>a.level-b.level);
  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:cls.name, nav:'class:'+clsKey},{label:sub.name}])}
    <button class="back" data-go="class:${clsKey}">← Назад</button>
    <h1>${sub.name}</h1>
    <p class="subtitle">Умения архетипа по уровням получения.</p>
    <div class="rule"></div>
    <div class="grid">${features.map(subclassFeatureCard).join('')}</div>
  `;
}

/* ---------- magic screens ---------- */
function spellCardHtml(s){
  return `
    <div class="card" data-copy="${escapeAttr(s.name)}">
      <div class="top-row with-icon">
        <div class="spell-icon">${schoolIconSvg(s.school)}</div>
        <div class="name">${escapeHtml(s.name)}</div>
        <div class="die-badge">${levelLabel(s.level)}</div>
      </div>
      <div class="desc">${escapeHtml(s.effect)}</div>
      <div style="display:flex;gap:8px;margin-top:10px;">
        <button type="button" class="rc-btn spell-edit-btn" data-spell-edit="${s.id}" data-spell-school="${s.school}">Изменить</button>
        <button type="button" class="rc-btn spell-delete-btn" data-spell-delete="${s.id}" style="color:var(--crimson-bright);">Удалить</button>
      </div>
      <div class="stamp"><span>Скопировано</span></div>
    </div>`;
}

function renderMagicHub(){
  const items = MAGIC_SCHOOLS.map(sc=>{
    const count = SPELLS.filter(s=>s.school===sc.key).length;
    return `
      <div class="menu-item" data-go="schoolSpells:${sc.key}">
        <div class="school-icon">${schoolIconSvg(sc.key)}</div>
        <div style="flex:1;">
          <div class="name">${sc.ru}</div>
          <div class="desc">${count} заклинани${count===1?'е':(count>=2&&count<=4?'я':'й')} в списке</div>
        </div>
        <div class="arrow">→</div>
      </div>`;
  }).join('');
  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Книга заклинаний'}])}
    <button class="back" data-go="faeRef">← В справочник</button>
    <h1>Книга заклинаний</h1>
    <p class="subtitle">Общая база заклинаний по школам — сюда ссылаются все заклинатели компендиума.</p>
    <div class="rule"></div>
    <div class="menu-list grid-2">${items}</div>
  `;
}

function renderSchoolSpells(){
  const key = view.schoolKey;
  const school = MAGIC_SCHOOLS.find(s=>s.key===key);
  if(!school){ view = {screen:'magic'}; return renderMagicHub(); }
  const spells = SPELLS.filter(s=>s.school===key).sort((a,b)=>a.level-b.level || a.name.localeCompare(b.name,'ru'));
  const cards = spells.map(spellCardHtml).join('') || '<div class="char-empty">Пока нет заклинаний этой школы.</div>';
  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Книга заклинаний', nav:'magic'},{label:school.ru}])}
    <button class="back" data-go="magic">← Назад</button>
    <h1><span class="h1-icon">${schoolIconSvg(key)}</span>${school.ru}</h1>
    <p class="subtitle">Клик по карточке копирует название заклинания в буфер.</p>
    <div class="rule"></div>
    <button class="new-char-btn" data-go="spellForm:new:${key}">+ Добавить заклинание</button>
    ${cards}
  `;
}

function initSpellDraft(){
  if(view.spellId && view.spellId!=='new'){
    const existing = SPELLS.find(s=>s.id===view.spellId);
    spellDraft = existing ? JSON.parse(JSON.stringify(existing)) : newSpell(view.schoolKey);
  } else {
    spellDraft = newSpell(view.schoolKey);
  }
}

function renderSpellForm(){
  initSpellDraft();
  const s = spellDraft;
  const isExisting = !!(view.spellId && view.spellId!=='new' && SPELLS.find(x=>x.id===view.spellId));
  const schoolOptions = MAGIC_SCHOOLS.map(sc=>`<option value="${sc.key}" ${s.school===sc.key?'selected':''}>${sc.ru}</option>`).join('');
  const levelOptions = Array.from({length:10},(_,i)=>i).map(l=>`<option value="${l}" ${s.level===l?'selected':''}>${levelLabel(l)}</option>`).join('');

  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Книга заклинаний', nav:'magic'},{label:schoolName(s.school), nav:'schoolSpells:'+s.school},{label:s.name||'Новое заклинание'}])}
    <button class="back" data-go="schoolSpells:${s.school}">← Назад</button>
    <h1>${escapeHtml(s.name || 'Новое заклинание')}</h1>
    <p class="subtitle">Впиши заклинание, которое открылось в игре — сохранится в общей базе.</p>
    <div class="rule"></div>
    <div class="sheet-actions">
      <button class="btn-primary" id="saveSpellBtn">💾 Сохранить</button>
      ${isExisting ? '<button class="btn-ghost" id="deleteSpellBtn" style="color:var(--crimson-bright);border-color:var(--crimson-bright);">🗑 Удалить</button>' : ''}
    </div>
    <div id="spellFormRoot">
      <div class="field" style="margin-bottom:16px;">
        <label>Название</label>
        <input type="text" data-sfield="name" value="${escapeAttr(s.name)}" style="font-size:19px;padding:12px 14px;">
      </div>
      <div class="sheet-grid" style="margin-bottom:20px;">
        <div class="field">
          <label>Школа</label>
          <select data-sfield="school">${schoolOptions}</select>
        </div>
        <div class="field">
          <label>Уровень</label>
          <select data-sfield="level">${levelOptions}</select>
        </div>
      </div>
      <div class="field"><label>Эффект / описание</label><textarea data-sfield="effect" style="min-height:100px;">${escapeHtml(s.effect)}</textarea></div>
    </div>
  `;
}

function renderClass(){
  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Классы и Архетипы'}])}
    <button class="back" data-go="faeRef">← В справочник</button>
    <h1>Классы и Архетипы</h1>
    <p class="subtitle">Выберите боевой архетип.</p>
    <div class="rule"></div>
    <div class="menu-list grid-2">
      <div class="menu-item" data-go="sub:fighter:battlemaster">
        <div>
          <div class="name">Мастер боя</div>
          <div class="desc">20 приёмов, питаемых костями превосходства</div>
        </div>
        <div class="arrow">→</div>
      </div>
      <div class="menu-item" data-go="subclass:fighter:champion">
        <div>
          <div class="name">Чемпион</div>
          <div class="desc">Расширенные критические попадания, простота и надёжность</div>
        </div>
        <div class="arrow">→</div>
      </div>
      <div class="menu-item" data-go="subclass:fighter:psiwarrior">
        <div>
          <div class="name">Псионический воин</div>
          <div class="desc">Телекинез и силовые поля на костях психической энергии</div>
        </div>
        <div class="arrow">→</div>
      </div>
      <div class="menu-item" data-go="subclass:fighter:eldritchknight">
        <div>
          <div class="name">Мистический рыцарь</div>
          <div class="desc">Боец с заклинаниями Волшебника и боевой магией</div>
        </div>
        <div class="arrow">→</div>
      </div>
    </div>
    <div class="section-label">Справочники</div>
    <div class="menu-list">
      <div class="menu-item util" data-go="glossary">
        <div>
          <div class="name">Справочник терминов</div>
          <div class="desc">Стойки, атаки и понятия боя разным оружием</div>
        </div>
        <div class="arrow">→</div>
      </div>
    </div>
  `;
}

function renderSub(){
  const sub = DATA.fighter.subclasses.battlemaster;
  const maneuverCard = (m)=>{
    const genTemplate = `*[Результат броска ${m.ru} 1d8: ]*`;
    return `
    <div class="card" data-copy="${escapeAttr(m.ru)}">
      <div class="top-row">
        <div class="name">${m.ru}</div>
        <div class="die-badge">${m.die}</div>
      </div>
      <div class="eng">${m.en}</div>
      <div class="desc">${m.desc}</div>
      <button class="gen-btn" data-template="${escapeAttr(genTemplate)}" data-count="1" data-sides="8" data-mode="sum">Сгенерировать и скопировать результат</button>
      <div class="stamp"><span>Скопировано</span></div>
      <div class="gen-stamp"><div class="gen-die"></div></div>
    </div>
  `;};
  const groupSection = (title, cat, list)=>{
    const items = list.filter(m=>m.cat===cat);
    if(!items.length) return '';
    return `
      <div class="section-label">${title}</div>
      <div class="grid">${items.map(maneuverCard).join('')}</div>
    `;
  };

  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Воин', nav:'class:fighter'},{label:'Мастер боя'}])}
    <button class="back" data-go="class:fighter">← Назад</button>
    <h1>Мастер боя</h1>
    <p class="subtitle">Клик по карточке копирует название приёма; кнопка ниже — сразу бросает кость превосходства и копирует готовый результат.</p>
    <div class="rule"></div>
    ${groupSection('Атакующие', 'offense', sub.maneuvers)}
    ${groupSection('Защитные', 'defense', sub.maneuvers)}
    ${groupSection('Тактические', 'tactics', sub.maneuvers)}
    <div class="section-label">Дополнительно (Tasha's Cauldron of Everything)</div>
    <p style="font-size:13px;color:var(--ink-dim);font-style:italic;margin:-6px 0 14px;">Эти три приёма не входят в базовые 20 из PHB 2024 — они были вырезаны при обновлении правил. Многие столы всё равно разрешают их по договорённости с мастером.</p>
    ${groupSection('Атакующие', 'offense', sub.extraManeuvers)}
    ${groupSection('Защитные', 'defense', sub.extraManeuvers)}
    <div class="footnote">Правила 2024 г. · Player's Handbook · Combat Superiority</div>
  `;
}

function escapeAttr(s){
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;');
}

function escapeHtml(s){
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ---------- Кастомные стилизованные селекты (Custom Themed Selects) ---------- */
function enhanceCustomSelect(sel){
  if(!sel || sel.__cSelectEnhanced || sel.classList.contains('no-custom-select')) return;
  sel.__cSelectEnhanced = true;

  var wrap = document.createElement('div');
  wrap.className = 'ttc-select-wrap';
  if(sel.id) wrap.id = sel.id + '_wrap';
  if(sel.className) {
    if(sel.classList.contains('el-select')) wrap.classList.add('el-select-wrap');
    if(sel.classList.contains('me-input')) wrap.classList.add('me-select-wrap');
    if(sel.classList.contains('sh-route-preset-sel')) wrap.classList.add('sh-route-preset-wrap');
  }

  sel.classList.add('ttc-select-native');

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ttc-select-btn';
  var valSpan = document.createElement('span');
  valSpan.className = 'ttc-select-val';
  var arrowSpan = document.createElement('span');
  arrowSpan.className = 'ttc-select-arrow';
  arrowSpan.textContent = '▼';
  btn.appendChild(valSpan);
  btn.appendChild(arrowSpan);

  var menu = document.createElement('div');
  menu.className = 'ttc-select-menu';
  menu.style.display = 'none';

  function syncTrigger(){
    var opt = sel.options && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex] : null;
    valSpan.textContent = opt ? opt.textContent : (sel.getAttribute('placeholder') || '— выберите —');
  }
  sel._syncCustomSelect = syncTrigger;

  function rebuildMenu(){
    menu.innerHTML = '';
    var opts = Array.from(sel.options || []);
    if(opts.length === 0){
      var empty = document.createElement('div');
      empty.className = 'ttc-select-item';
      empty.style.color = '#64748b';
      empty.style.fontStyle = 'italic';
      empty.textContent = '— нет вариантов —';
      menu.appendChild(empty);
      return;
    }
    opts.forEach(function(opt, idx){
      var item = document.createElement('div');
      item.className = 'ttc-select-item' + (opt.selected ? ' selected' : '');
      item.setAttribute('data-val', opt.value);
      
      var textSpan = document.createElement('span');
      textSpan.textContent = opt.textContent;
      
      var checkSpan = document.createElement('span');
      checkSpan.className = 'ttc-select-check';
      checkSpan.textContent = '✓';

      item.appendChild(textSpan);
      item.appendChild(checkSpan);

      item.addEventListener('click', function(e){
        e.stopPropagation();
        sel.selectedIndex = idx;
        sel.value = opt.value;
        syncTrigger();
        closeMenu();
        if(typeof sel.onchange === 'function') {
          try { sel.onchange.call(sel, new Event('change')); } catch(err){}
        }
        sel.dispatchEvent(new Event('input', { bubbles: true }));
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      });
      menu.appendChild(item);
    });
  }
  sel._rebuildCustomMenu = rebuildMenu;

  function openMenu(){
    document.querySelectorAll('.ttc-select-menu.open').forEach(function(m){
      m.classList.remove('open');
      m.style.display = 'none';
    });
    document.querySelectorAll('.ttc-select-btn.open').forEach(function(b){
      b.classList.remove('open');
    });

    var rect = btn.getBoundingClientRect();
    var spaceBelow = window.innerHeight - rect.bottom;
    var spaceAbove = rect.top;
    var estHeight = Math.min(285, (sel.options ? sel.options.length : 1) * 42 + 16);
    
    if(spaceBelow < estHeight && spaceAbove > spaceBelow){
      menu.classList.add('flip-up');
    } else {
      menu.classList.remove('flip-up');
    }

    rebuildMenu();
    btn.classList.add('open');
    menu.classList.add('open');
    menu.style.display = 'block';

    var curSelected = menu.querySelector('.ttc-select-item.selected');
    if(curSelected){
      curSelected.scrollIntoView({ block: 'nearest' });
    }
  }

  function closeMenu(){
    btn.classList.remove('open');
    menu.classList.remove('open');
    menu.style.display = 'none';
  }

  btn.addEventListener('click', function(e){
    e.stopPropagation();
    if(menu.classList.contains('open')){
      closeMenu();
    } else {
      openMenu();
    }
  });

  var observer = new MutationObserver(function(){
    syncTrigger();
    if(menu.classList.contains('open')){
      rebuildMenu();
    }
  });
  observer.observe(sel, { childList: true, subtree: true, attributes: true });

  sel.addEventListener('change', syncTrigger);
  syncTrigger();

  if(sel.parentNode){
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(btn);
    wrap.appendChild(menu);
    wrap.appendChild(sel);
  }
}

function enhanceAllCustomSelects(){
  document.querySelectorAll('select:not(.no-custom-select)').forEach(enhanceCustomSelect);
}
window.enhanceAllCustomSelects = enhanceAllCustomSelects;

if(typeof window !== 'undefined' && !window.__ttcSelectGlobalBound){
  window.__ttcSelectGlobalBound = true;
  document.addEventListener('click', function(e){
    if(!e.target.closest('.ttc-select-wrap')){
      document.querySelectorAll('.ttc-select-menu.open').forEach(function(m){
        m.classList.remove('open');
        m.style.display = 'none';
      });
      document.querySelectorAll('.ttc-select-btn.open').forEach(function(b){
        b.classList.remove('open');
      });
    }
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      document.querySelectorAll('.ttc-select-menu.open').forEach(function(m){
        m.classList.remove('open');
        m.style.display = 'none';
      });
      document.querySelectorAll('.ttc-select-btn.open').forEach(function(b){
        b.classList.remove('open');
      });
    }
  });
}

/* ---------- AI Генератор Фаэруна (D&D 5e / 2024) ---------- */
var FAE_GEN_CATEGORIES = [
  {
    key: 'quest',
    icon: '📜',
    title: 'Квест и Сюжет',
    sub: 'Заказы, приключения, тайны и награды',
    themeLabel: 'Название или завязка приключения',
    themePlaceholder: 'Напр.: Пропавший караван у Врат Балдура, Тайна склепа Нетерила...',
    reqPlaceholder: 'Напр.: Заказчик скрывает истинную цель, в финале моральный выбор и засада культистов...',
    presets: [
      { label: 'Пропавший караван Арфистов', theme: 'Пропавший караван Арфистов на Побережье Мечей', req: 'Следы ведут в заброшенный форт, где обосновались наёмники Жентарима и древний мимик.' },
      { label: 'Тайный аукцион в Уотердипе', theme: 'Ночной подпольный аукцион запретных реликвий в Глубоководье', req: 'Нужно проникнуть под видом аристократов или перехватить лот до полуночи без кровопролития.' },
      { label: 'Проклятие курганов Севера', theme: 'Пробуждение ледяной нежити в курганах Долины Ледяного Ветра', req: 'Морозная буря усиливается с каждым часом, староста деревни одержим духом древнего ярла.' },
      { label: 'Охота на теневого дракона', theme: 'Логово молодого теневого дракона в руинах Кормантора', req: 'Дракон похитил редкий звёздный сапфир и подчинил племя кобольдов-ловушечников.' },
      { label: 'Заговор культа Баала', theme: 'Серия ритуальных исчезновений в Нижнем Городе Врат Балдура', req: 'Детективное расследование с уликами, допросами свидетелей и тайным святилищем в коллекторах.' }
    ]
  },
  {
    key: 'npc',
    icon: '🎭',
    title: 'НПС и Персонаж',
    sub: 'Союзники, торговцы, злодеи и покровители',
    themeLabel: 'Имя, титул или образ НПС',
    themePlaceholder: 'Напр.: Контрабандист-тифлинг, Старый дварф-рунокузнец, Архимаг...',
    reqPlaceholder: 'Напр.: Ироничная манера речи, шрам от когтей мантикоры, продаёт редкие яды и хранит секрет...',
    presets: [
      { label: 'Контрабандист-тифлинг', theme: 'Вэлериус «Пепельный Рог» — обаятельный контрабандист из Врат Балдура', req: 'Знает все тайные тропы порта, говорит с бархатной усмешкой, задолжал крупную сумму гильдии.' },
      { label: 'Дварф-рунокузнец', theme: 'Торгрим Железный Уголь — старый мастер-оружейник клана Щита', req: 'Ворчливый, но честный ветеран, ищет метеоритную руду для ковки шедевра всей жизни.' },
      { label: 'Шпионка Арфистов', theme: 'Лираэль Серебряная Струна — полуэльфийка-бард и агент Арфистов', req: 'Собирает компромат на продажных лордов, мастер перевоплощений и тонких намёков.' },
      { label: 'Инквизитор Ордена Перчатки', theme: 'Сэр Кассиан Светлый Клинок — фанатичный паладин Тира', req: 'Непримирим к любой сделке с тьмой, но скрывает сомнения после гибели своего отряда.' },
      { label: 'Алхимик с говорящим вороном', theme: 'Физзлбим — эксцентричный скальный гном-алхимик и изобретатель', req: 'Его лавка вечно дымит разноцветным паром, а ворон подсказывает рецепты и подшучивает над гостями.' }
    ]
  },
  {
    key: 'weapon',
    icon: '⚔️',
    title: 'Оружие (2024)',
    sub: 'Мечи, луки, топоры и Мастерство оружия',
    themeLabel: 'Название или концепт оружия',
    themePlaceholder: 'Напр.: Клинок Серебряного Пламени, Молот Громовержца, Лук Звёзд...',
    reqPlaceholder: 'Напр.: Светится лунным светом рядом с нежитью, при критическом ударе вызывает вспышку...',
    presets: [
      { label: 'Клинок Лунного Света', theme: 'Клинок Серебряного Полумесяца Селунэ', req: 'Изящный полуторный меч из звёздного серебра, наносит дополнительный урон излучением оборотням и нежити.' },
      { label: 'Двуручник Чёрного Льда', theme: 'Левиафан Вечной Мерзлоты — двуручный меч из чёрного льда', req: 'Замедляет врагов морозным инеем при попадании и позволяет раз в день выпустить конус стужи.' },
      { label: 'Рапира Теневого Шага', theme: 'Шёпот Ночи — дуэльная рапира ассасинов Теневых Воров', req: 'Дарует бонус к скрытности в полумраке и позволяет телепортироваться к поражённой цели бонусным действием.' },
      { label: 'Молот Кузни Морадина', theme: 'Глас Наковальни — рунный боевой молот дварфийских королей', req: 'При броске возвращается в ладонь владельца, сотрясает землю ударной волной грома.' },
      { label: 'Звёздный Лук Кормантора', theme: 'Песнь Звёздной Тетивы — длинный лук древних эльфов', req: 'Не требует обычных стрел, формируя стрелы из чистого астрального света.' }
    ]
  },
  {
    key: 'armor',
    icon: '🛡️',
    title: 'Броня и Щиты',
    sub: 'Латы, кольчуги, мантии и защитные руны',
    themeLabel: 'Название или образ доспеха / щита',
    themePlaceholder: 'Напр.: Адамантиновые латы Рассвета, Мифраловая кольчуга Теней...',
    reqPlaceholder: 'Напр.: Не даёт помехи к скрытности, поглощает критические удары и даёт сопротивление огню...',
    presets: [
      { label: 'Латы Несокрушимого Стража', theme: 'Бастион Золотого Льва — полные латы из адамантина', req: 'Превращают любое критическое попадание в обычное и позволяют реакцией защитить союзника рядом.' },
      { label: 'Мифраловая кираса Теней', theme: 'Шепчущая Чешуя — мифраловая кираса ночного разведчика', req: 'Невесома под одеждой, не создаёт помехи на Скрытность и позволяет сливаться с тенями.' },
      { label: 'Щит Эгиды Грома', theme: 'Эгида Буревестника — кованый рыцарский щит с ликом бури', req: 'При успешном блоке атаки в ближнем бою отбрасывает атакующего разрядом молнии.' },
      { label: 'Мантия Звёздного Плетения', theme: 'Одеяние Высшего Магистра Плетения Мистры', req: 'Усиливает защиту мага без доспехов, повышает СЛ спасбросков заклинаний и хранит резерв магической энергии.' },
      { label: 'Доспех Чешуи Дракона', theme: 'Кираса из чешуи древнего багрового дракона', req: 'Дарует иммунитет к испугу от драконов, сопротивление огню и чутье на сокровища.' }
    ]
  },
  {
    key: 'spell',
    icon: '✨',
    title: 'Заклинание',
    sub: 'Новые чары Плетения 0–9 круга',
    themeLabel: 'Название или идея заклинания',
    themePlaceholder: 'Напр.: Пылающий клинок рассвета, Астральный разлом, Эгида льда...',
    reqPlaceholder: 'Напр.: Заклинание для жреца или паладина, урон излучением и ослепление врагов в радиусе...',
    presets: [
      { label: 'Копьё Астрального Грома', theme: 'Копьё Астрального Грома', req: 'Стремительный бросок молнии, пронзающий линию врагов и оставляющий ионизированный след.' },
      { label: 'Зеркальный Шаг Тени', theme: 'Зеркальный Шаг сквозь Тени', req: 'Создаёт иллюзорного двойника и мгновенно меняет заклинателя с ним местами.' },
      { label: 'Приговор Пепла', theme: 'Приговор Багрового Пепла Тэя', req: 'Иссушает жизненную силу цели некротическим пламенем, исцеляя заклинателя на половину урона.' },
      { label: 'Корона Северного Сияния', theme: 'Корона Северного Сияния', req: 'Окружает голову сияющим венцом, защищающим от ментального контроля и ослепляющим атакующих.' },
      { label: 'Призыв Стража Наковальни', theme: 'Призыв Духа Раскалённой Кузни', req: 'Призывает огненно-металлического духа-защитника, кующего временную броню союзникам.' }
    ]
  },
  {
    key: 'item',
    icon: '💍',
    title: 'Артефакт и Вещь',
    sub: 'Кольца, амулеты, плащи, посохи и реликвии',
    themeLabel: 'Название или концепт предмета',
    themePlaceholder: 'Напр.: Кольцо Хрономанта, Плащ Вороньей Королевы, Фонарь душ...',
    reqPlaceholder: 'Напр.: Имеет 3 заряда в день, дарует пассивный бонус и необычное свойство вне боя...',
    presets: [
      { label: 'Кольцо Украденных Секунд', theme: 'Перстень Хрономанта Нетерила', req: 'Позволяет раз в день перемотать на мгновение неудачный бросок кубика или получить дополнительную реакцию.' },
      { label: 'Плащ Вороньего Крыла', theme: 'Плащ Посланника Королевы Воронов', req: 'Позволяет парить при падении и раз в день обращаться в стаю чёрных воронов.' },
      { label: 'Фонарь Истинного Зрения', theme: 'Хрустальный Фонарь Разоблачения Иллюзий', req: 'Его синее пламя высвечивает невидимых существ, тайные руны и истинный облик перевёртышей.' },
      { label: 'Посох Дикого Плетения', theme: 'Посох Первозданного Вихря Стихий', req: 'Хранит заряды для усиления стихийных чар и изменения типа урона заклинаний.' },
      { label: 'Проклятый Медальон Бессмертия', theme: 'Рубиновый Амулет Кровавого Договора', req: 'Спасает владельца от падения в 0 хитов, но требует плату жизненной силой или золотом.' }
    ]
  },
  {
    key: 'monster',
    icon: '👹',
    title: 'Монстр и Босс',
    sub: 'Полный статблок чудовища или босса',
    themeLabel: 'Название чудовища или босса',
    themePlaceholder: 'Напр.: Рыцарь Пепла, Пожиратель Плетения, Архидруид Гнили...',
    reqPlaceholder: 'Напр.: Босс для отряда 6 уровня, имеет мультиатаку, ауру страха и легендарные действия...',
    presets: [
      { label: 'Рыцарь Чёрного Пепла', theme: 'Сэр Малакор — Павший Рыцарь Чёрного Пепла', req: 'Нежить-полководец в раскалённых латах, вооружён двуручным мечом пламени и призывает тени павших.' },
      { label: 'Пожиратель Плетения', theme: 'Астральный Пожиратель Плетения Магии', req: 'Аберрация с антимагическим панцирем, питающаяся поглощёнными заклинаниями героев.' },
      { label: 'Гончая Авернуса', theme: 'Кровожадная Адская Гончая Железного Легиона', req: 'Стремительный хищник с раскалёнными челюстями, выдыхающий серный огонь и преследующий по запаху крови.' },
      { label: 'Часовой Бронзовый Колосс', theme: 'Древний Механический Страж Гонда', req: 'Неудержимый конструкт с вращающимися клинками, гарпунной цепью и паровым залпом.' },
      { label: 'Хозяйка Проклятой Топи', theme: 'Матушка Моргана — Архиведьма Гниющего Сердца', req: 'Коварный босс с иллюзиями, проклятиями и эффектами логова в туманном болоте.' }
    ]
  },
  {
    key: 'location',
    icon: '🏰',
    title: 'Локация и Данж',
    sub: 'Таверны, лавки, башни и подземелья',
    themeLabel: 'Название локации, таверны или подземелья',
    themePlaceholder: 'Напр.: Таверна «Пьяный Грифон», Затопленный храм, Лавка редкостей...',
    reqPlaceholder: 'Напр.: Уютная атмосфера сверху, но в подвале скрыт вход в контрабандный туннель с ловушками...',
    presets: [
      { label: 'Таверна «Спящий Мантикор»', theme: 'Постоялый двор и таверна «Спящий Мантикор» на перекрёстке трактов', req: 'Колоритное меню, барды, подозрительные постояльцы и тайный погреб контрабандистов.' },
      { label: 'Затопленный Храм Умберли', theme: 'Расколотое Святилище Морской Королевы в прибрежных скалах', req: 'Уровень воды прибывает во время прилива, залы полны коралловых ловушек и древних сокровищ.' },
      { label: 'Лавка «Диковинки Астрала»', theme: 'Магическая лавка «Диковинки Астрала и Планов» в Уотердипе', req: 'Пространство внутри больше чем снаружи, витрины с живыми артефактами и строгая защита от воров.' },
      { label: 'Парящая Обсерватория', theme: 'Обрушившаяся Обсерватория Нетерийского Звездочёта', req: 'Гравитационные аномалии, вращающиеся астролябии и загадка звёздных созвездий.' },
      { label: 'Подпольная Арена «Яма»', theme: 'Тайный бойцовский клуб и тотализатор под портовыми складами', req: 'Ставки на золото, нечестные приёмы и клетки с экзотическими чудовищами.' }
    ]
  },
  {
    key: 'alchemy',
    icon: '🧪',
    title: 'Алхимия и Зелья',
    sub: 'Рецепты зелий, эликсиров, масел и ядов',
    themeLabel: 'Название зелья, эликсира или яда',
    themePlaceholder: 'Напр.: Эликсир Драконьей Ярости, Масло Серебряного Блеска, Яд Дроу...',
    reqPlaceholder: 'Напр.: Варится из редких трав Подземья, даёт мощный боевой бонус на 1 минуту...',
    presets: [
      { label: 'Эликсир Драконьего Дыхания', theme: 'Огненный Эликсир Драконьей Гоiss', req: 'Дарует выпившему способность выдыхать пламя и устойчивость к жару.' },
      { label: 'Масло Призрачного Серебра', theme: 'Оружейное Масло Лунного Серебра', req: 'Наносится на клинок, позволяя поражать бесплотных призраков и нежить с дополнительным уроном.' },
      { label: 'Яд Сонного Лотоса Дроу', theme: 'Контактный и оружейный яд Чёрного Лотоса Мензоберранзана', req: 'Лишает цель реакции и погружает в магическое оцепенение при провале спасброска Телосложения.' },
      { label: 'Бальзам Крови Тролля', theme: 'Изумрудный Регенерационный Отвар', req: 'Мгновенно восстанавливает хиты и даёт регенерацию в начале каждого хода на 3 раунда.' },
      { label: 'Бомба Громового Кварца', theme: 'Алхимическая Сфера Громового Раскола', req: 'Взрывается при броске, оглушая врагов и разрушая хрупкие преграды.' }
    ]
  },
  {
    key: 'feat',
    icon: '⭐',
    title: 'Черта и Талант',
    sub: 'Черты D&D 2024, боевые стили и дары',
    themeLabel: 'Название или стиль боевой черты',
    themePlaceholder: 'Напр.: Мастер клинкового парирования, Проводник бури, Бастион...',
    reqPlaceholder: 'Напр.: Черта 4+ уровня с +1 к Ловкости или Силе, дающая активную реакцию в ближнем бою...',
    presets: [
      { label: 'Мастер Рипоста и Парирования', theme: 'Мастер Дуэльного Парирования и Контратаки', req: 'Позволяет реакцией прибавить бонус мастерства к КД и при промахе врага нанести мгновенный ответный укол.' },
      { label: 'Проводник Штормового Плетения', theme: 'Проводник Первозданной Бури', req: 'Усиливает заклинания молнии и грома, позволяя взлетать на 10 футов без провоцированных атак.' },
      { label: 'Несокрушимый Авангард', theme: 'Железный Бастион Авангарда', req: 'Боевая черта для воина или паладина со щитом: прикрытие союзников и таранный натиск.' },
      { label: 'Снайпер Сумеречного Выстрела', theme: 'Меткий Охотник Сумерек', req: 'Убирает помеху на дальнюю дистанцию и позволяет игнорировать укрытия при стрельбе из засады.' },
      { label: 'Эпический Дар Бессмертной Воли', theme: 'Эпический Дар Неугасимой Воли', req: 'Эпический дар 19+ уровня, дарующий легендарное сопротивление и всплеск сил в критический момент.' }
    ]
  }
];

function getFaeGenCatDef(catKey){
  return FAE_GEN_CATEGORIES.find(function(c){ return c.key === catKey; }) || FAE_GEN_CATEGORIES[0];
}

function loadFaeAiHistory(){
  try{
    var raw = JSON.parse(localStorage.getItem('fae_ai_history') || '[]');
    return Array.isArray(raw) ? raw : [];
  }catch(e){
    return [];
  }
}

function saveFaeAiHistory(list){
  try{
    localStorage.setItem('fae_ai_history', JSON.stringify((list || []).slice(0, 40)));
  }catch(e){}
}

function pushFaeAiHistory(cat, data){
  if(!data) return;
  var list = loadFaeAiHistory();
  var def = getFaeGenCatDef(cat);
  var title = data.name || data.title || 'Без названия';
  var sub = '';
  if(cat === 'quest') sub = [data.type, data.levelRange, data.region].filter(Boolean).join(' • ');
  else if(cat === 'npc') sub = [data.species, data.role, data.faction].filter(Boolean).join(' • ');
  else if(cat === 'weapon') sub = [data.rarity, data.baseWeapon, data.damage].filter(Boolean).join(' • ');
  else if(cat === 'armor') sub = [data.rarity, data.armorType, data.baseAc].filter(Boolean).join(' • ');
  else if(cat === 'spell') sub = [data.schoolRu || data.school, data.level === 0 ? 'Заговор' : (data.level + ' круг')].filter(Boolean).join(' • ');
  else if(cat === 'item') sub = [data.rarity, data.type].filter(Boolean).join(' • ');
  else if(cat === 'monster') sub = [data.cr, data.sizeAndType].filter(Boolean).join(' • ');
  else if(cat === 'location') sub = [data.type, data.region].filter(Boolean).join(' • ');
  else if(cat === 'alchemy') sub = [data.rarity, data.type, data.dc ? ('СЛ ' + data.dc) : ''].filter(Boolean).join(' • ');
  else sub = [data.category, data.prereq].filter(Boolean).join(' • ');

  var entry = {
    id: 'fae_ai_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    cat: cat,
    icon: def.icon,
    catTitle: def.title,
    title: title,
    sub: sub || def.title,
    createdAt: new Date().toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }),
    data: data
  };
  list.unshift(entry);
  saveFaeAiHistory(list);
  return entry;
}

function callGeminiFaeGenerator(opts, apiKey, callback){
  if(!apiKey){
    callback('API ключ Google Gemini не указан', null);
    return;
  }
  var cat = opts.cat || 'quest';
  var theme = opts.theme || 'Героическое приключение в Забытых Королевствах';
  var ctxStr = opts.contextInfo ? ('Контекст партии и кампании: ' + opts.contextInfo + '. ') : '';
  var reqStr = opts.req ? ('Дополнительные пожелания: ' + opts.req + '. ') : '';
  var prompt = '';

  if(cat === 'quest'){
    prompt = 'Ты ведущий мастер подземелий (Dungeon Master) и сценарист приключений Dungeons & Dragons 5e / 2024 по миру Забытых Королевств (Faerûn). ' +
      'Разработай продуманный, увлекательный и готовый к проведению квест (приключение). ' +
      'Тема / Название / Завязка: ' + theme + '. ' +
      'Тип приключения: ' + (opts.questType || 'Расследование и боевой поход') + '. ' +
      'Уровень отряда: ' + (opts.questLevel || '5–10 уровень') + '. ' +
      'Регион Фаэруна: ' + (opts.questRegion || 'Побережье Мечей') + '. ' +
      'Тон и атмосфера: ' + (opts.questTone || 'Героическое фэнтези') + '. ' +
      ctxStr + reqStr +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "title": "Яркое название квеста на русском",\n' +
      '  "type": "Тип квеста",\n' +
      '  "levelRange": "Рекомендуемый уровень (напр. 4–6 уровень)",\n' +
      '  "region": "Регион и точное место действия",\n' +
      '  "patron": "Заказчик или источник задания (имя, кто он, почему обратился к героям)",\n' +
      '  "hook": "Завязка: как именно герои оказываются втянуты в историю (2-3 предложения)",\n' +
      '  "stages": [\n' +
      '    "Акт 1 (Разведка / Расследование): описание сцены, ключевых улик и проверок навыков со СЛ (напр. Расследование СЛ 14, Убеждение СЛ 15)",\n' +
      '    "Акт 2 (Препятствие / Путь / Осложнение): описание опасностей, ловушек или засады",\n' +
      '    "Акт 3 (Логово / Развязка): ключевой выбор и выход на финал"\n' +
      '  ],\n' +
      '  "twist": "Скрытая правда или неожиданный сюжетный поворот, меняющий взгляд на ситуацию",\n' +
      '  "climax": "Финальное столкновение: описание босса/врагов, особенностей поля боя и альтернативного мирного/хитрого решения",\n' +
      '  "rewards": "Награда: золото в ЗМ, благосклонность фракции и особый магический трофей"\n' +
      '}';
  } else if(cat === 'npc'){
    prompt = 'Ты ведущий сценарист и мастер Dungeons & Dragons 5e / 2024 в сеттинге Забытых Королевств (Faerûn). ' +
      'Создай живого, харизматичного и запоминающегося неигрового персонажа (НПС) с глубоким характером и игровой пользой. ' +
      'Концепт / Имя: ' + theme + '. ' +
      'Роль в истории: ' + (opts.npcRole || 'Квестодатель / Союзник') + '. ' +
      'Вид (Раса): ' + (opts.npcSpecies || 'На выбор ИИ') + '. ' +
      'Фракция: ' + (opts.npcFaction || 'Независимый') + '. ' +
      'Боевой потенциал: ' + (opts.npcPower || 'Опытный ветеран') + '. ' +
      ctxStr + reqStr +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Имя, прозвище и титул НПС",\n' +
      '  "species": "Вид (раса) и возраст",\n' +
      '  "role": "Роль / Занятие / Класс",\n' +
      '  "faction": "Принадлежность к фракции или гильдии",\n' +
      '  "alignment": "Мировоззрение",\n' +
      '  "appearance": "Яркое описание внешности, одежды, оружия и особых примет (2-3 предложения)",\n' +
      '  "voiceAndManner": "Тембр голоса, жесты, манера речи и характерная цитата от первого лица для отыгрыша Мастером",\n' +
      '  "personality": "Черты характера, идеал и слабость",\n' +
      '  "motivation": "Чего этот НПС страстно добивается прямо сейчас и чем может помочь/помешать героям",\n' +
      '  "secret": "Личная тайна или скелет в шкафу (и СЛ Проницательности/Расследования, чтобы её заметить)",\n' +
      '  "combatStats": "Боевая сводка D&D 5e (КД, Хиты, Скорость, ключевые характеристики, основная атака или заклинания)",\n' +
      '  "inventory": "Ценности в карманах, редкие товары на продажу или трофеи"\n' +
      '}';
  } else if(cat === 'weapon'){
    prompt = 'Ты легендарный кузнец-артефактор и дизайнер правил Dungeons & Dragons 2024 (Player\'s Handbook 2024) в мире Фаэруна. ' +
      'Создай сбалансированное, атмосферное и механически интересное именное оружие. ' +
      'Название / Концепт: ' + theme + '. ' +
      'Базовый тип оружия: ' + (opts.weaponBase || 'Длинный меч') + '. ' +
      'Редкость: ' + (opts.weaponRarity || 'Редкое (+2)') + '. ' +
      'Стихия / Природа чар: ' + (opts.weaponElement || 'Пламя и Огонь') + '. ' +
      'Свойство Мастерства оружия 2024: ' + (opts.weaponMastery || 'На выбор ИИ') + '. ' +
      ctxStr + reqStr +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название оружия на русском",\n' +
      '  "baseWeapon": "Базовый тип оружия (напр. Длинный меч, Двуручный меч, Длинный лук)",\n' +
      '  "rarity": "Редкость (Обычное, Необычное, Редкое, Очень редкое, Легендарное, Артефакт)",\n' +
      '  "attackBonus": "Бонус к броскам атаки и урона (напр. +1, +2, +3)",\n' +
      '  "damage": "Кость урона с бонусом и доп. стихийным уроном (напр. 1d8+2 + 1d6 огнём)",\n' +
      '  "damageType": "Тип урона (напр. рубящий + огонь)",\n' +
      '  "properties": "Свойства оружия (напр. Универсальное (1d10), Фехтовальное, Лёгкое, Тяжёлое, Досягаемость)",\n' +
      '  "mastery": "Свойство Мастерства D&D 2024 (напр. Подрыв (Sap), Поваливание (Topple), Прорубание (Cleave), Досада (Vex), Зазубрина (Nick), Задевание (Graze), Толчок (Push), Замедление (Slow))",\n' +
      '  "attunement": "Требования к настройке (напр. Требуется настройка / Не требуется)",\n' +
      '  "price": "Примерная стоимость в золотых монетах (напр. 4 500 ЗМ)",\n' +
      '  "lore": "Внешний вид клинка/оружия, гравировки и история его создания (2-3 предложения)",\n' +
      '  "mechanics": "Детальное описание пассивных бонусов, активных способностей (заряды, спасброски, криты) по правилам D&D 5e/2024"\n' +
      '}';
  } else if(cat === 'armor'){
    prompt = 'Ты великий мастер бронников и чародей Фаэруна в Dungeons & Dragons 5e / 2024. ' +
      'Создай уникальный магический доспех, щит или защитное одеяние. ' +
      'Название / Концепт: ' + theme + '. ' +
      'Тип брони / щита: ' + (opts.armorType || 'Средний доспех (Кираса)') + '. ' +
      'Редкость: ' + (opts.armorRarity || 'Редкий (+2)') + '. ' +
      'Защитный профиль: ' + (opts.armorFocus || 'Стихийное сопротивление и защита') + '. ' +
      'Материал: ' + (opts.armorMaterial || 'Мифрал и рунная сталь') + '. ' +
      ctxStr + reqStr +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название доспеха, щита или мантии на русском",\n' +
      '  "armorType": "Категория и базовый доспех (напр. Тяжёлый доспех (Латы), Средний доспех (Кираса), Щит, Мантия)",\n' +
      '  "rarity": "Редкость (Необычный, Редкий, Очень редкий, Легендарный, Артефакт)",\n' +
      '  "baseAc": "Итоговая формула КД (напр. КД 18 + 2 = 20, или КД 14 + Мод. Лов (макс. 2) + 1, или +3 к КД для щита)",\n' +
      '  "numericAc": 18,\n' +
      '  "strReq": "Требование к Силе (напр. Сила 15 или Нет требований)",\n' +
      '  "stealth": "Влияние на Скрытность (напр. Без помехи, Преимущество, Помеха)",\n' +
      '  "resistances": "Даруемые сопротивления или иммунитеты (напр. Сопротивление урону огнём и критическим ударам)",\n' +
      '  "attunement": "Настройка (Требуется настройка / Не требуется)",\n' +
      '  "price": "Примерная стоимость в ЗМ (напр. 6 000 ЗМ)",\n' +
      '  "lore": "Внешний вид, чеканка, материал и легенда происхождения доспеха (2-3 предложения)",\n' +
      '  "mechanics": "Детальное описание пассивных защитных свойств, аур и реактивных умений доспеха в бою"\n' +
      '}';
  } else if(cat === 'spell'){
    prompt = 'Ты ведущий мастер и дизайнер правил Dungeons & Dragons 5e / 2024. ' +
      'Придумай сбалансированное, захватывающее и детализированное заклинание для Забытых Королевств (Faerûn). ' +
      'Тема / Идея: ' + theme + '. ' +
      'Школа магии: ' + (opts.school || 'evocation') + '. ' +
      'Уровень (круг): ' + (opts.level !== undefined ? opts.level : '1') + '. ' +
      'Классы: ' + (opts.spellClass || 'Волшебник, Чародей') + '. ' +
      'Время сотворения: ' + (opts.spellAction || '1 действие') + '. ' +
      ctxStr + reqStr +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название заклинания на русском",\n' +
      '  "school": "Ключ школы на английском (строго одно из: abjuration, conjuration, divination, enchantment, evocation, illusion, necromancy, transmutation)",\n' +
      '  "schoolRu": "Название школы на русском",\n' +
      '  "level": 1,\n' +
      '  "classes": "Доступно классам (напр. Волшебник, Чародей, Паладин)",\n' +
      '  "castingTime": "Время наложения (например: 1 действие, 1 бонусное действие, 1 реакция)",\n' +
      '  "range": "Дистанция (например: На себя, 60 футов, Касание)",\n' +
      '  "components": "Компоненты (В, С, М и описание материала)",\n' +
      '  "duration": "Длительность (например: Мгновенная, Концентрация, до 1 минуты, 1 час)",\n' +
      '  "effect": "Детальное игровое описание механики заклинания (урон, спасбросок, область, воздействие)",\n' +
      '  "higherLevels": "Эффект при сотворении ячейкой более высокого уровня (или улучшение заговора на 5, 11, 17 уровнях)"\n' +
      '}';
  } else if(cat === 'item'){
    prompt = 'Ты легендарный артефактор Фаэруна в Dungeons & Dragons 5e / 2024. ' +
      'Придумай уникальный чудесный предмет, кольцо, амулет, плащ, посох или реликвию Забытых Королевств. ' +
      'Тема / Название / Идея: ' + theme + '. ' +
      'Редкость: ' + (opts.rarity || 'Редкий') + '. ' +
      'Тип: ' + (opts.itemType || 'Чудесный предмет') + '. ' +
      'Механика активации: ' + (opts.itemCharges || 'Пассивный эффект + заряды') + '. ' +
      ctxStr + reqStr +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название предмета на русском",\n' +
      '  "type": "Тип предмета (Амулет, Кольцо, Плащ, Посох, Жезл, Гримуар, Чудесный предмет)",\n' +
      '  "rarity": "Редкость (Обычный, Необычный, Редкий, Очень редкий, Легендарный, Артефакт)",\n' +
      '  "attunement": "Настройка (например: Требуется настройка / Требуется настройка заклинателем / Не требуется)",\n' +
      '  "price": "Оценочная стоимость (напр. 3 500 ЗМ)",\n' +
      '  "desc": "Полное описание предмета: внешний вид, история происхождения, активные и пассивные магические свойства, механика бросков или заряды (4-6 предложений)"\n' +
      '}';
  } else if(cat === 'monster'){
    prompt = 'Ты ведущий дизайнер бестиария Dungeons & Dragons 5e / 2024 (Monster Manual 2024). ' +
      'Создай полный, готовый к бою статблок чудовища, врага или босса для мира Фаэруна. ' +
      'Название / Образ: ' + theme + '. ' +
      'Тип существа: ' + (opts.monsterType || 'Монструозность') + '. ' +
      'Показатель опасности (КО): ' + (opts.monsterCr || 'КО 6–10 (Босс)') + '. ' +
      'Боевая роль: ' + (opts.monsterRole || 'Сокрушитель / Босс') + '. ' +
      ctxStr + reqStr +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название чудовища или имя босса",\n' +
      '  "sizeAndType": "Размер, тип существа и мировоззрение (напр. Большая нежить, законно-злая)",\n' +
      '  "cr": "КО и опыт (напр. КО 7 (2 900 XP), БМ +3)",\n' +
      '  "ac": "КД и тип брони (напр. 17 (природный доспех))",\n' +
      '  "hp": "Хиты и формула костей (напр. 136 (16d10 + 48))",\n' +
      '  "speed": "Скорость перемещения (напр. 40 фт., полёт 60 фт.)",\n' +
      '  "stats": "СИЛ 18 (+4) | ЛОВ 14 (+2) | ТЕЛ 16 (+3) | ИНТ 12 (+1) | МДР 14 (+2) | ХАР 15 (+2)",\n' +
      '  "defenses": "Спасброски, навыки, сопротивления, иммунитеты, чувства и языки",\n' +
      '  "traits": ["Пассивная особенность 1 (название и механика)", "Пассивная особенность 2"],\n' +
      '  "actions": ["Мультиатака: описание серии ударов", "Атака 1: +X к попаданию, досягаемость, урон и эффект", "Особая способность (Перезарядка 5–6): описание"],\n' +
      '  "legendaryOrReactions": "Реакции, Бонусные действия и Легендарные действия / Эффекты логова",\n' +
      '  "tacticsAndLoot": "Тактика поведения в бою и ценные трофеи/алхимические реагенты после победы"\n' +
      '}';
  } else if(cat === 'location'){
    prompt = 'Ты ведущий архитектор мира и картограф приключений Забытых Королевств (D&D 5e / 2024). ' +
      'Создай детализированную, атмосферную локацию (таверну, лавку, башню или подземелье), готовую для игры. ' +
      'Название / Идея: ' + theme + '. ' +
      'Тип локации: ' + (opts.locType || 'Таверна / Постоялый двор') + '. ' +
      'Статус и опасность: ' + (opts.locDanger || 'Скрытая интрига') + '. ' +
      ctxStr + reqStr +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название локации",\n' +
      '  "type": "Тип места",\n' +
      '  "region": "Где находится (город, тракт или регион Фаэруна)",\n' +
      '  "atmosphere": "Художественное описание для зачитывания игрокам: архитектура, освещение, запахи, звуки и атмосфера (3-4 предложения)",\n' +
      '  "keyZones": ["Зона / Зал 1: описание и интерактивные объекты", "Зона / Зал 2: описание", "Зона / Зал 3: описание"],\n' +
      '  "inhabitants": "Ключевые обитатели, хозяева, посетители или стражи",\n' +
      '  "secretsAndTraps": "Тайники, скрытые проходы и ловушки с точными СЛ проверок Восприятия / Расследования / Ловкости рук",\n' +
      '  "hooksAndRumors": "Услуги/цены (если мирная локация) или сюжетные зацепки и слухи, которые можно здесь узнать"\n' +
      '}';
  } else if(cat === 'alchemy'){
    prompt = 'Ты верховный алхимик, травник и отравитель Фаэруна в Dungeons & Dragons 5e / 2024. ' +
      'Создай рецепт и описание алхимического зелья, эликсира, оружейного масла или боевого яда. ' +
      'Название / Идея: ' + theme + '. ' +
      'Категория: ' + (opts.alchType || 'Боевой эликсир') + '. ' +
      'Инструменты крафта: ' + (opts.alchKit || 'herbalism') + '. ' +
      'Редкость и сложность: ' + (opts.alchRarity || 'Редкий (СЛ 15)') + '. ' +
      ctxStr + reqStr +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название зелья, масла или яда",\n' +
      '  "type": "Тип (Эликсир, Целебное зелье, Оружейное масло, Боевой яд, Алхимическая бомба)",\n' +
      '  "rarity": "Редкость",\n' +
      '  "kit": "herbalism или alchemy",\n' +
      '  "dc": 15,\n' +
      '  "cost": 150,\n' +
      '  "time": "Время варки (напр. 4 часа / 1 долгий отдых)",\n' +
      '  "ingredients": [{"name": "Название редкого ингредиента 1", "qty": 1}, {"name": "Название ингредиента 2", "qty": 2}],\n' +
      '  "appearance": "Цвет жидкости, свечение, запах и вкус",\n' +
      '  "effect": "Точная игровая механика при применении: длительность, бонусы, урон или спасбросок"\n' +
      '}';
  } else {
    prompt = 'Ты ведущий геймдизайнер D&D 2024 (Player\'s Handbook 2024). ' +
      'Придумай сбалансированную черту (Feat) для персонажа Фаэруна. ' +
      'Тема / Идея: ' + theme + '. ' +
      'Категория черты: ' + (opts.featCat || 'Общая черта (General Feat 4+)') + '. ' +
      'Направленность: ' + (opts.featFocus || 'Боевая тактика и урон') + '. ' +
      ctxStr + reqStr +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название черты на русском",\n' +
      '  "category": "Категория (Черта происхождения, Общая черта, Боевой стиль, Эпический дар)",\n' +
      '  "prereq": "Требования (например: Уровень 4+, Сила или Ловкость 13+ или Без требований)",\n' +
      '  "statBonus": "Увеличение характеристик (например: Увеличьте Силу или Ловкость на 1, максимум до 20)",\n' +
      '  "desc": "Общее художественное и тактическое описание черты",\n' +
      '  "features": ["Пункт 1 боевого бонуса или механики", "Пункт 2 активной или реактивной способности", "Пункт 3"]\n' +
      '}';
  }

  function handleData(data){
    try{
      var raw = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) || data;
      var cleanStr = String(raw).replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      var firstBrace = cleanStr.indexOf('{');
      var lastBrace = cleanStr.lastIndexOf('}');
      if(firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace){
        cleanStr = cleanStr.slice(firstBrace, lastBrace + 1);
      }
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
    fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-4-argon:generateContent?key=' + encodeURIComponent(apiKey), {
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

function renderFaeGenPresets(cat){
  var def = getFaeGenCatDef(cat);
  var presets = def.presets || [];
  var chips = presets.map(function(p, idx){
    return '<button type="button" class="fae-gen-preset-chip" data-fae-preset-idx="' + idx + '" title="Подставить идею: ' + escapeAttr(p.theme) + '">💡 ' + escapeHtml(p.label) + '</button>';
  }).join('');
  return '<div class="fae-gen-preset-wrap">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">' +
      '<span style="font-size:11.5px;color:#c9a45c;font-family:\'Cinzel\',serif;font-weight:700;">⚡ БЫСТРЫЕ ИДЕИ И ШАБЛОНЫ ВДОХНОВЕНИЯ:</span>' +
      '<button type="button" class="btn-ghost" id="btnFaeRandomIdea" style="font-size:11.5px;padding:3px 10px;">🎲 Случайная идея</button>' +
    '</div>' +
    '<div class="fae-gen-preset-row">' + chips + '</div>' +
  '</div>';
}

function renderFaeGenExtraFields(cat){
  if(cat === 'quest'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Тип приключения</label>' +
        '<select class="ai-gen-select" id="faeGenQuestType">' +
          '<option value="Детективное расследование и заговор">🕵️ Детективное расследование и заговор</option>' +
          '<option value="Охота на чудовище / Зачистка логова" selected>🐉 Охота на чудовище / Зачистка логова</option>' +
          '<option value="Исследование древних руин и подземелья">🏛️ Исследование древних руин и подземелья</option>' +
          '<option value="Городская интрига и дерзкое ограбление">🎭 Городская интрига и дерзкое ограбление</option>' +
          '<option value="Сопровождение каравана / Оборона крепости">🛡️ Сопровождение / Оборона рубежа</option>' +
          '<option value="Снятие проклятия и мистическая тайна">🔮 Снятие проклятия и мистическая тайна</option>' +
          '<option value="Дипломатическая миссия и спасение">👑 Дипломатическая миссия и спасение</option>' +
          '<option value="Эпический планарный поход">🌌 Эпический планарный поход</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Уровень отряда</label>' +
        '<select class="ai-gen-select" id="faeGenQuestLevel">' +
          '<option value="1–4 уровень (Местные герои)">1–4 уровень (Местные герои)</option>' +
          '<option value="5–10 уровень (Герои Королевства)" selected>5–10 уровень (Герои Королевства)</option>' +
          '<option value="11–16 уровень (Владыки Фаэруна)">11–16 уровень (Владыки Фаэруна)</option>' +
          '<option value="17–20 уровень (Легенды Мультивселенной)">17–20 уровень (Легенды Мультивселенной)</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Регион Фаэруна</label>' +
        '<select class="ai-gen-select" id="faeGenQuestRegion">' +
          '<option value="Побережье Мечей (Врата Балдура / Невервинтер)" selected>🌊 Побережье Мечей (Врата Балдура / Невервинтер)</option>' +
          '<option value="Глубоководье (Уотердип) и Подгорье">🏰 Глубоководье (Уотердип) и Подгорье</option>' +
          '<option value="Долина Ледяного Ветра (Десять Городов)">❄️ Долина Ледяного Ветра (Десять Городов)</option>' +
          '<option value="Подземье (Мензоберранзан и Глубины)">🕷️ Подземье (Мензоберранзан и Глубины)</option>' +
          '<option value="Серебряные Пределы и Лускан">🌲 Серебряные Пределы и Лускан</option>' +
          '<option value="Джунгли Чульта и Порт Ньянзару">🦖 Джунгли Чульта и Порт Ньянзару</option>' +
          '<option value="Кормир, Сембия и Внутреннее Море">👑 Кормир, Сембия и Внутреннее Море</option>' +
          '<option value="Калимшан, Тэй и Восток">☀️ Калимшан, Тэй и Восток</option>' +
          '<option value="Авернус / Астральный план / Царство Фей">🔥 Авернус / Планы Бытия</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Тон и атмосфера</label>' +
        '<select class="ai-gen-select" id="faeGenQuestTone">' +
          '<option value="Классическое героическое фэнтези" selected>⚔️ Классическое героическое фэнтези</option>' +
          '<option value="Мрачный готический хоррор и мистика">🕯️ Мрачный готический хоррор и мистика</option>' +
          '<option value="Политический триллер и шпионаж">🗡️ Политический триллер и шпионаж</option>' +
          '<option value="Древние загадки и исследование">📜 Древние загадки и исследование</option>' +
          '<option value="Лихая авантюра с иронией">🍺 Лихая авантюра с иронией</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'npc'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Роль НПС в кампании</label>' +
        '<select class="ai-gen-select" id="faeGenNpcRole">' +
          '<option value="Квестодатель / Покровитель отряда" selected>👑 Квестодатель / Покровитель</option>' +
          '<option value="Торговец редкостями / Кузнец / Алхимик">⚖️ Торговец редкостями / Мастер</option>' +
          '<option value="Союзник / Спутник / Наёмник в отряд">⚔️ Союзник / Спутник в отряд</option>' +
          '<option value="Информатор / Контрабандист / Вор">🗝️ Информатор / Тень криминала</option>' +
          '<option value="Антагонист / Харизматичный злодей">💀 Антагонист / Харизматичный злодей</option>' +
          '<option value="Мудрец / Архимаг / Жрец храма">🔮 Мудрец / Архимаг / Хранитель знаний</option>' +
          '<option value="Трактирщик / Капитан стражи / Горожанин">🍺 Трактирщик / Капитан стражи</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Вид (Раса)</label>' +
        '<select class="ai-gen-select" id="faeGenNpcSpecies">' +
          '<option value="На выбор ИИ (подходящая образу)" selected>🎲 На выбор ИИ</option>' +
          '<option value="Человек">Человек</option>' +
          '<option value="Эльф (Высший / Лесной)">Эльф (Высший / Лесной)</option>' +
          '<option value="Эльф (Дроу)">Эльф (Дроу)</option>' +
          '<option value="Дварф (Щитовой / Золотой)">Дварф</option>' +
          '<option value="Тифлинг">Тифлинг</option>' +
          '<option value="Драконорождённый">Драконорождённый</option>' +
          '<option value="Полурослик / Гном">Полурослик / Гном</option>' +
          '<option value="Орк / Полуорк / Голиаф">Орк / Полуорк / Голиаф</option>' +
          '<option value="Аасимар">Аасимар</option>' +
          '<option value="Разумная Нежить / Вампир / Лич">Вампир / Лич / Нежить</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Фракция Фаэруна</label>' +
        '<select class="ai-gen-select" id="faeGenNpcFaction">' +
          '<option value="Независимый / Своя гильдия" selected>Независимый / Своя гильдия</option>' +
          '<option value="Арфисты (Harpers)">🎵 Арфисты (Harpers)</option>' +
          '<option value="Жентарим (Чёрная Сеть)">🐍 Жентарим (Чёрная Сеть)</option>' +
          '<option value="Альянс Лордов">👑 Альянс Лордов</option>' +
          '<option value="Орден Перчатки">🛡️ Орден Перчатки</option>' +
          '<option value="Изумрудный Анклав">🍃 Изумрудный Анклав</option>' +
          '<option value="Бреган Д\'Эрт">🕷️ Бреган Д\'Эрт</option>' +
          '<option value="Красные Волшебники Тэя / Культ Дракона">🔥 Красные Волшебники Тэя / Культ</option>' +
          '<option value="Пламенный Кулак / Городская Стража">⚔️ Пламенный Кулак / Стража</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Боевой ранг</label>' +
        '<select class="ai-gen-select" id="faeGenNpcPower">' +
          '<option value="Мирный специалист (КО 1/2 – 1)">Мирный специалист (КО 1/2 – 1)</option>' +
          '<option value="Опытный авантюрист (КО 2–4)" selected>Опытный авантюрист (КО 2–4)</option>' +
          '<option value="Мастер / Ветеран (КО 5–9)">Мастер / Ветеран (КО 5–9)</option>' +
          '<option value="Легендарный грандмастер (КО 10+)">Легендарный грандмастер (КО 10+)</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'weapon'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Базовый тип оружия</label>' +
        '<select class="ai-gen-select" id="faeGenWeaponBase">' +
          '<option value="Длинный меч (Longsword)" selected>⚔️ Длинный меч (1d8/1d10)</option>' +
          '<option value="Двуручный меч (Greatsword)">🗡️ Двуручный меч (2d6)</option>' +
          '<option value="Рапира (Rapier)">🤺 Рапира (1d8 фехт.)</option>' +
          '<option value="Короткий меч / Скимитар (Парные клинки)">⚔️ Короткий меч / Скимитар (1d6)</option>' +
          '<option value="Боевой топор / Секира (Greataxe)">🪓 Боевой топор / Секира (1d8 / 1d12)</option>' +
          '<option value="Боевой молот / Кувалда (Maul)">🔨 Боевой молот / Кувалда (1d8 / 2d6)</option>' +
          '<option value="Алебарда / Глефа / Копьё">🔱 Алебарда / Глефа / Копьё (досяг.)</option>' +
          '<option value="Кинжал / Метательный клинок">🗡️ Кинжал (1d4 лёгкое)</option>' +
          '<option value="Длинный лук / Короткий лук">🏹 Длинный лук / Короткий лук</option>' +
          '<option value="Арбалет (Ручной / Тяжёлый) / Мушкет">🎯 Арбалет / Огнестрельное</option>' +
          '<option value="Боевой посох / Булава / Цеп">🪄 Боевой посох / Булава</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Редкость и бонус</label>' +
        '<select class="ai-gen-select" id="faeGenWeaponRarity">' +
          '<option value="Необычное (+1)">Необычное (+1)</option>' +
          '<option value="Редкое (+2)" selected>Редкое (+2)</option>' +
          '<option value="Очень редкое (+3)">Очень редкое (+3)</option>' +
          '<option value="Легендарное (+3, особые свойства)">Легендарное (+3)</option>' +
          '<option value="Артефакт (+3, божественная реликвия)">Артефакт богов (+3)</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Стихия / Природа чар</label>' +
        '<select class="ai-gen-select" id="faeGenWeaponElement">' +
          '<option value="Огонь и Пламя">🔥 Огонь и Пламя</option>' +
          '<option value="Холод и Вечная мерзлота">❄️ Холод и Мороз</option>' +
          '<option value="Молния и Гром Бури">⚡ Молния и Гром</option>' +
          '<option value="Святое Излучение и Рассвет" selected>☀️ Святое Излучение</option>' +
          '<option value="Некротика, Тень и Вампиризм">🌑 Некротика и Тень</option>' +
          '<option value="Астральная Сила и Псионика">🔮 Силовое поле и Псионика</option>' +
          '<option value="Кислота и Змеиный Яд">🧪 Кислота и Яд</option>' +
          '<option value="Безупречная физическая острота и кровотечение">🩸 Чистая острота и сокрушение</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Мастерство оружия (D&D 2024)</label>' +
        '<select class="ai-gen-select" id="faeGenWeaponMastery">' +
          '<option value="Автоматически под тип оружия" selected>🎲 Автоподбор по правилам 2024</option>' +
          '<option value="Подрыв / Досаждение (Sap)">Подрыв / Sap (Помеха врагу)</option>' +
          '<option value="Поваливание (Topple)">Поваливание / Topple (Сбивание с ног)</option>' +
          '<option value="Прорубание (Cleave)">Прорубание / Cleave (Удар по второму врагу)</option>' +
          '<option value="Досада (Vex)">Досада / Vex (Преимущество на след. удар)</option>' +
          '<option value="Зазубрина (Nick)">Зазубрина / Nick (Доп. атака лёгким оружием)</option>' +
          '<option value="Задевание (Graze)">Задевание / Graze (Урон при промахе)</option>' +
          '<option value="Толчок (Push)">Толчок / Push (Отбрасывание на 10 фт)</option>' +
          '<option value="Замедление (Slow)">Замедление / Slow (-10 фт скорости)</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'armor'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Категория доспеха / щита</label>' +
        '<select class="ai-gen-select" id="faeGenArmorType">' +
          '<option value="Лёгкий доспех (Проклёпанная кожа)">Лёгкий доспех (КД 12 + Лов)</option>' +
          '<option value="Средний доспех (Кираса / Полулаты)" selected>Средний доспех (Кираса / Полулаты)</option>' +
          '<option value="Тяжёлый доспех (Полные латы)">Тяжёлый доспех (Полные латы, КД 18)</option>' +
          '<option value="Щит / Башенный щит">🛡️ Щит (+2 к КД и выше)</option>' +
          '<option value="Магическая мантия / Одеяние архимага">👘 Магическая мантия / Одеяние</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Редкость защиты</label>' +
        '<select class="ai-gen-select" id="faeGenArmorRarity">' +
          '<option value="Необычный (+1)">Необычный (+1)</option>' +
          '<option value="Редкий (+2)" selected>Редкий (+2)</option>' +
          '<option value="Очень редкий (+3)">Очень редкий (+3)</option>' +
          '<option value="Легендарный (+3)">Легендарный (+3)</option>' +
          '<option value="Артефакт">Артефакт</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Защитная специализация</label>' +
        '<select class="ai-gen-select" id="faeGenArmorFocus">' +
          '<option value="Несокрушимость и иммунитет к критическим ударам" selected>🛡️ Несокрушимость и анти-крит</option>' +
          '<option value="Сопротивление стихиям и защитная аура">🔥 Сопротивление стихиям и аура</option>' +
          '<option value="Бесшумность, скрытность и слияние с тенью">🌑 Скрытность и теневой шаг</option>' +
          '<option value="Отражение магии и бонус к спасброскам">✨ Защита от чар и спасброски</option>' +
          '<option value="Мобильность, рывки и левитация">🦅 Мобильность и крылья</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Материал исполнения</label>' +
        '<select class="ai-gen-select" id="faeGenArmorMaterial">' +
          '<option value="Мифрал (серебряная сталь без помехи скрытности)" selected>Мифрал (легковесный металл)</option>' +
          '<option value="Адамантин (сверхпрочный метеоритный сплав)">Адамантин (гасит криты)</option>' +
          '<option value="Чешуя и кость древнего дракона">Чешуя древнего дракона</option>' +
          '<option value="Закалённая рунная сталь дварфов">Рунная сталь дварфов</option>' +
          '<option value="Астральный шёлк и нити Плетения">Астральный шёлк / Железное дерево</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'spell'){
    var schoolOpts = MAGIC_SCHOOLS.map(function(sc){
      return '<option value="' + sc.key + '">' + sc.ru + '</option>';
    }).join('');
    var lvlOpts = Array.from({length:10}, function(_,i){
      return '<option value="' + i + '"' + (i===3?' selected':'') + '>' + (i === 0 ? 'Заговор (0 круг)' : (i + ' круг')) + '</option>';
    }).join('');
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Школа магии</label>' +
        '<select class="ai-gen-select" id="faeGenSchool">' + schoolOpts + '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Круг заклинания</label>' +
        '<select class="ai-gen-select" id="faeGenLevel">' + lvlOpts + '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Традиция / Классы</label>' +
        '<select class="ai-gen-select" id="faeGenSpellClass">' +
          '<option value="Волшебник, Чародей, Колдун" selected>🔮 Тайная магия (Волшебник, Чародей, Колдун)</option>' +
          '<option value="Жрец, Паладин">☀️ Божественная магия (Жрец, Паладин)</option>' +
          '<option value="Друид, Следопыт">🍃 Первородная магия (Друид, Следопыт)</option>' +
          '<option value="Бард, Изобретатель">🎵 Искусство и руны (Бард, Изобретатель)</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Время наложения</label>' +
        '<select class="ai-gen-select" id="faeGenSpellAction">' +
          '<option value="1 действие" selected>⚡ 1 действие (Основное)</option>' +
          '<option value="1 бонусное действие">🏃 1 бонусное действие</option>' +
          '<option value="1 реакция">🛡️ 1 реакция</option>' +
          '<option value="1 минута (Ритуал)">🕯️ Ритуал / Длительное</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'item'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Тип артефакта</label>' +
        '<select class="ai-gen-select" id="faeGenItemType">' +
          '<option value="Амулет / Медальон / Талисман" selected>📿 Амулет / Талисман</option>' +
          '<option value="Кольцо / Перстень">💍 Кольцо / Перстень</option>' +
          '<option value="Плащ / Сапоги / Перчатки">🧥 Плащ / Сапоги / Перчатки</option>' +
          '<option value="Посох / Жезл / Волшебная палочка">🪄 Посох / Жезл / Фокусировка</option>' +
          '<option value="Гримуар / Магический фолиант">📕 Гримуар / Фолиант</option>' +
          '<option value="Чудесный инструмент / Механизм">🧭 Чудесный предмет / Механизм</option>' +
          '<option value="Проклятая реликвия древности">💀 Проклятая реликвия</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Редкость предмета</label>' +
        '<select class="ai-gen-select" id="faeGenRarity">' +
          '<option value="Обычный">Обычный (Common)</option>' +
          '<option value="Необычный">Необычный (Uncommon)</option>' +
          '<option value="Редкий" selected>Редкий (Rare)</option>' +
          '<option value="Очень редкий">Очень редкий (Very Rare)</option>' +
          '<option value="Легендарный">Легендарный (Legendary)</option>' +
          '<option value="Артефакт">Артефакт (Artifact)</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'monster'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Тип существа</label>' +
        '<select class="ai-gen-select" id="faeGenMonsterType">' +
          '<option value="Нежить (Рыцарь смерти / Вампир / Лич)">💀 Нежить (Рыцарь смерти / Вампир / Лич)</option>' +
          '<option value="Дракон / Драконид">🐉 Дракон / Драконид</option>' +
          '<option value="Исчадие (Демон Бездны / Дьявол Баатора)">🔥 Исчадие (Демон / Дьявол)</option>' +
          '<option value="Аберрация (Порождение Дальнего Предела)">👁️ Аберрация</option>' +
          '<option value="Монструозность / Первобытный хищник" selected>👹 Монструозность / Хищник</option>' +
          '<option value="Великан / Тролль / Огр">🏔️ Великан / Тролль</option>' +
          '<option value="Фея / Элементаль">✨ Фея / Элементаль</option>' +
          '<option value="Конструкт / Голем">⚙️ Конструкт / Голем</option>' +
          '<option value="Гуманоид-босс (Военачальник / Архимаг / Ассасин)">🗡️ Гуманоид-босс</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Показатель опасности (КО / CR)</label>' +
        '<select class="ai-gen-select" id="faeGenMonsterCr">' +
          '<option value="КО 1–2 (Опасный противник)">КО 1–2 (Опасный противник)</option>' +
          '<option value="КО 3–5 (Элитный вожак)">КО 3–5 (Элитный вожак)</option>' +
          '<option value="КО 6–10 (Босс подземелья)" selected>КО 6–10 (Босс подземелья)</option>' +
          '<option value="КО 11–16 (Легендарный босс с логовом)">КО 11–16 (Легендарный босс)</option>' +
          '<option value="КО 17+ (Эпическое бедствие Фаэруна)">КО 17+ (Эпический катаклизм)</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field" style="grid-column:1 / -1;">' +
        '<label class="ai-gen-label">Тактическая роль в бою</label>' +
        '<select class="ai-gen-select" id="faeGenMonsterRole">' +
          '<option value="Соло-босс с мультиатакой и легендарными действиями" selected>👑 Соло-босс с легендарными действиями</option>' +
          '<option value="Сокрушитель первой линии (высокий урон и пролом)">🪓 Сокрушитель первой линии</option>' +
          '<option value="Заклинатель, контроль поля боя и призыв">🔮 Заклинатель и контроль поля боя</option>' +
          '<option value="Скрытный охотник, яды и засады из тени">🕸️ Скрытный охотник / Засадник</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'location'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Тип локации</label>' +
        '<select class="ai-gen-select" id="faeGenLocType">' +
          '<option value="Таверна / Постоялый двор / Трактир" selected>🍺 Таверна / Постоялый двор</option>' +
          '<option value="Подземелье / Древний склеп / Руины">🗝️ Подземелье / Руины / Склеп</option>' +
          '<option value="Магическая лавка / Кузница артефактов">⚗️ Магическая лавка / Кузница</option>' +
          '<option value="Башня архимага / Цитадель / Замок">🏰 Башня мага / Крепость</option>' +
          '<option value="Городской квартал / Подпольное убежище гильдии">🏙️ Городской квартал / Убежище</option>' +
          '<option value="Святилище / Природная аномалия Плетения">🌲 Святилище / Аномалия Плетения</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Уровень опасности и статус</label>' +
        '<select class="ai-gen-select" id="faeGenLocDanger">' +
          '<option value="Мирный хаб с тайнами и слухами" selected>🕯️ Мирный хаб с тайнами и слухами</option>' +
          '<option value="Зона интриг, шпионов и скрытой угрозы">🗡️ Зона интриг и скрытой угрозы</option>' +
          '<option value="Опасное место с ловушками и стражами">⚠️ Опасная зона с ловушками</option>' +
          '<option value="Смертельное логово врага">💀 Смертельное логово врага</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'alchemy'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Тип алхимического состава</label>' +
        '<select class="ai-gen-select" id="faeGenAlchType">' +
          '<option value="Боевой эликсир / Зелье усиления" selected>🧪 Боевой эликсир / Усиление</option>' +
          '<option value="Целебный отвар / Восстановление">❤️ Целебный отвар / Регенерация</option>' +
          '<option value="Оружейное масло / Смазка для клинка">⚔️ Оружейное масло для клинка</option>' +
          '<option value="Боевой яд / Токсин">🐍 Боевой яд / Токсин</option>' +
          '<option value="Алхимическая бомба / Смесь">💣 Алхимическая бомба / Граната</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Редкость и СЛ варки</label>' +
        '<select class="ai-gen-select" id="faeGenAlchRarity">' +
          '<option value="Обычный (СЛ 10, ~25 зм)">Обычный (СЛ 10, ~25 зм)</option>' +
          '<option value="Необычный (СЛ 13, ~100 зм)">Необычный (СЛ 13, ~100 зм)</option>' +
          '<option value="Редкий (СЛ 15, ~300 зм)" selected>Редкий (СЛ 15, ~300 зм)</option>' +
          '<option value="Очень редкий (СЛ 18, ~1000 зм)">Очень редкий (СЛ 18, ~1000 зм)</option>' +
          '<option value="Легендарный (СЛ 20, ~2500 зм)">Легендарный (СЛ 20, ~2500 зм)</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field" style="grid-column:1 / -1;">' +
        '<label class="ai-gen-label">Инструменты создания</label>' +
        '<select class="ai-gen-select" id="faeGenAlchKit">' +
          '<option value="alchemy" selected>⚗️ Алхимический набор (Alchemist\'s Supplies)</option>' +
          '<option value="herbalism">🌿 Набор травника (Herbalism Kit)</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else {
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Категория черты (D&D 2024)</label>' +
        '<select class="ai-gen-select" id="faeGenFeatCat">' +
          '<option value="Черта происхождения (Origin Feat)">Черта происхождения (Origin Feat)</option>' +
          '<option value="Общая черта (General Feat)" selected>Общая черта (General Feat 4+)</option>' +
          '<option value="Боевой стиль (Fighting Style)">Боевой стиль (Fighting Style)</option>' +
          '<option value="Эпический дар (Epic Boon)">Эпический дар (Epic Boon 19+)</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Направленность</label>' +
        '<select class="ai-gen-select" id="faeGenFeatFocus">' +
          '<option value="Боевая тактика и урон">⚔️ Боевая тактика и урон</option>' +
          '<option value="Магия и сотворение чар">🪄 Магия и сотворение чар</option>' +
          '<option value="Защита и выживание">🛡️ Защита и выживание</option>' +
          '<option value="Мобильность и скрытность">🏹 Мобильность и скрытность</option>' +
          '<option value="Социальное взаимодействие">🎭 Общение и харизма</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  }
}

function formatFaeGenPlainText(data, cat){
  if(!data) return '';
  if(cat === 'quest'){
    return '📜 КВЕСТ: ' + (data.title || 'Приключение') + '\n' +
      'Тип: ' + (data.type || '—') + ' | Уровень: ' + (data.levelRange || '—') + ' | Регион: ' + (data.region || '—') + '\n' +
      'Заказчик: ' + (data.patron || '—') + '\n\n' +
      'Завязка:\n' + (data.hook || '') + '\n\n' +
      'Ключевые этапы:\n• ' + (Array.isArray(data.stages) ? data.stages.join('\n• ') : '') + '\n\n' +
      'Сюжетный поворот:\n' + (data.twist || '') + '\n\n' +
      'Кульминация и финал:\n' + (data.climax || '') + '\n\n' +
      'Награда:\n' + (data.rewards || '');
  } else if(cat === 'npc'){
    return '🎭 НПС: ' + (data.name || 'Персонаж') + '\n' +
      (data.species || '') + ' • ' + (data.role || '') + ' • ' + (data.faction || '') + ' (' + (data.alignment || '') + ')\n\n' +
      'Внешность: ' + (data.appearance || '') + '\n' +
      'Манера речи и голос: ' + (data.voiceAndManner || '') + '\n' +
      'Характер: ' + (data.personality || '') + '\n' +
      'Цель и мотивация: ' + (data.motivation || '') + '\n' +
      'Тайна: ' + (data.secret || '') + '\n' +
      'Боевая сводка: ' + (data.combatStats || '') + '\n' +
      'Инвентарь / Товары: ' + (data.inventory || '');
  } else if(cat === 'weapon'){
    return '⚔️ ОРУЖИЕ: ' + (data.name || 'Оружие') + ' (' + (data.rarity || 'Редкое') + ', ' + (data.baseWeapon || '') + ')\n' +
      'Бонус атаки: ' + (data.attackBonus || '+1') + ' | Урон: ' + (data.damage || '1d8') + ' (' + (data.damageType || '') + ')\n' +
      'Свойства: ' + (data.properties || '—') + ' | Мастерство 2024: ' + (data.mastery || '—') + '\n' +
      'Настройка: ' + (data.attunement || '—') + ' | Цена: ' + (data.price || '—') + '\n\n' +
      (data.lore ? (data.lore + '\n\n') : '') +
      'Боевые свойства:\n' + (data.mechanics || '');
  } else if(cat === 'armor'){
    return '🛡️ ДОСПЕХ / ЩИТ: ' + (data.name || 'Броня') + ' (' + (data.rarity || 'Редкий') + ', ' + (data.armorType || '') + ')\n' +
      'Класс Доспеха: ' + (data.baseAc || '—') + ' | Требование Силы: ' + (data.strReq || 'Нет') + ' | Скрытность: ' + (data.stealth || '—') + '\n' +
      'Сопротивления: ' + (data.resistances || '—') + ' | Настройка: ' + (data.attunement || '—') + ' | Цена: ' + (data.price || '—') + '\n\n' +
      (data.lore ? (data.lore + '\n\n') : '') +
      'Защитные свойства:\n' + (data.mechanics || '');
  } else if(cat === 'spell'){
    return '✨ ЗАКЛИНАНИЕ: ' + (data.name || 'Заклинание') + ' (' + (data.schoolRu || data.school) + ', ' + (data.level === 0 ? 'Заговор' : (data.level + ' круг')) + ')\n' +
      (data.classes ? ('Классы: ' + data.classes + '\n') : '') +
      'Время: ' + data.castingTime + ' | Дистанция: ' + data.range + ' | Длительность: ' + data.duration + '\n' +
      'Компоненты: ' + data.components + '\n\n' +
      data.effect + (data.higherLevels ? ('\n\nНа больших уровнях: ' + data.higherLevels) : '');
  } else if(cat === 'item'){
    return '💍 АРТЕФАКТ: ' + (data.name || 'Предмет') + ' (' + (data.rarity || 'Редкий') + ' ' + (data.type || '') + ')\n' +
      (data.attunement ? (data.attunement + (data.price ? (' | Цена: ' + data.price) : '') + '\n\n') : '\n') +
      (data.desc || '');
  } else if(cat === 'monster'){
    return '👹 БЕСТИАРИЙ: ' + (data.name || 'Чудовище') + ' (' + (data.sizeAndType || '') + ')\n' +
      'КО: ' + (data.cr || '—') + ' | КД: ' + (data.ac || '—') + ' | Хиты: ' + (data.hp || '—') + ' | Скорость: ' + (data.speed || '—') + '\n' +
      (data.stats || '') + '\n' +
      'Защита и чувства: ' + (data.defenses || '—') + '\n\n' +
      'Особенности:\n• ' + (Array.isArray(data.traits) ? data.traits.join('\n• ') : '') + '\n\n' +
      'Действия:\n• ' + (Array.isArray(data.actions) ? data.actions.join('\n• ') : '') + '\n\n' +
      (data.legendaryOrReactions ? ('Реакции / Легендарные действия:\n' + data.legendaryOrReactions + '\n\n') : '') +
      'Тактика и трофеи:\n' + (data.tacticsAndLoot || '');
  } else if(cat === 'location'){
    return '🏰 ЛОКАЦИЯ: ' + (data.name || 'Локация') + ' (' + (data.type || '') + ' • ' + (data.region || '') + ')\n\n' +
      'Атмосфера:\n' + (data.atmosphere || '') + '\n\n' +
      'Ключевые зоны:\n• ' + (Array.isArray(data.keyZones) ? data.keyZones.join('\n• ') : '') + '\n\n' +
      'Обитатели: ' + (data.inhabitants || '') + '\n' +
      'Тайники и ловушки: ' + (data.secretsAndTraps || '') + '\n' +
      'Слухи и зацепки: ' + (data.hooksAndRumors || '');
  } else if(cat === 'alchemy'){
    var ingStr = Array.isArray(data.ingredients) ? data.ingredients.map(function(i){ return i.name + ' x' + (i.qty||1); }).join(', ') : '';
    return '🧪 АЛХИМИЯ: ' + (data.name || 'Зелье') + ' (' + (data.rarity || 'Редкий') + ' • ' + (data.type || '') + ')\n' +
      'СЛ крафта: ' + (data.dc || 15) + ' | Стоимость: ' + (data.cost || 100) + ' ЗМ | Время: ' + (data.time || '—') + '\n' +
      'Ингредиенты: ' + (ingStr || '—') + '\n\n' +
      (data.appearance ? ('Внешний вид: ' + data.appearance + '\n\n') : '') +
      'Эффект:\n' + (data.effect || '');
  } else {
    return '⭐ ЧЕРТА: ' + (data.name || 'Черта') + ' (' + (data.category || '') + ')\n' +
      'Требования: ' + (data.prereq || 'Без требований') + '\n' +
      (data.statBonus ? ('Бонус характеристик: ' + data.statBonus + '\n\n') : '\n') +
      (data.desc || '') + (Array.isArray(data.features) ? ('\n\n• ' + data.features.join('\n• ')) : '');
  }
}

function renderFaeGenCardPreview(data, cat){
  var hero = getActiveFaerunCharacter();
  var heroName = hero && hero.name ? escapeHtml(hero.name) : 'активного героя';

  var headerBadge = '';
  var bodyContent = '';
  var actionButtons = '';

  if(cat === 'quest'){
    var stagesHtml = Array.isArray(data.stages) ? data.stages.map(function(s){
      return '<li style="margin-bottom:6px;">' + escapeHtml(s) + '</li>';
    }).join('') : '';
    headerBadge = '<span class="fae-class-badge">📜 ' + escapeHtml(data.type || 'Приключение') + ' • ' + escapeHtml(data.levelRange || '5–10 ур.') + '</span>';
    bodyContent =
      '<div style="font-size:20px;font-weight:700;color:#fde68a;margin-bottom:8px;font-family:\'Cinzel\',serif;">' + escapeHtml(data.title || 'Квест') + '</div>' +
      '<div class="fae-gen-stat-grid">' +
        '<div class="fae-gen-stat-box"><span class="lbl">🗺️ Регион</span><span class="val">' + escapeHtml(data.region || 'Фаэрун') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">👑 Заказчик</span><span class="val">' + escapeHtml(data.patron || 'Неизвестный покровитель') + '</span></div>' +
      '</div>' +
      '<div class="fae-gen-block"><b>🪝 Завязка приключения:</b><br>' + escapeHtml(data.hook || '') + '</div>' +
      (stagesHtml ? ('<div style="margin-top:12px;"><div style="font-size:12.5px;color:#c9a45c;font-weight:700;font-family:\'Cinzel\',serif;margin-bottom:6px;">🧭 КЛЮЧЕВЫЕ ЭТАПЫ И ПРОВЕРКИ:</div><ul style="margin:0 0 0 18px;padding:0;color:#e2e8f0;font-size:13.5px;line-height:1.55;">' + stagesHtml + '</ul></div>') : '') +
      (data.twist ? ('<div class="fae-gen-block" style="border-left-color:#f59e0b;"><b>🎭 Скрытая тайна / Поворот сюжета:</b><br>' + escapeHtml(data.twist) + '</div>') : '') +
      (data.climax ? ('<div class="fae-gen-block" style="border-left-color:#ef4444;"><b>⚔️ Кульминация и Финал:</b><br>' + escapeHtml(data.climax) + '</div>') : '') +
      (data.rewards ? ('<div class="fae-gen-block" style="border-left-color:#4ade80;"><b>💰 Награда и Трофеи:</b><br>' + escapeHtml(data.rewards) + '</div>') : '');
    actionButtons = '<button class="btn-primary" id="btnFaeSaveCampaignNote">📜 Записать квест в Хроники кампании</button>';

  } else if(cat === 'npc'){
    headerBadge = '<span class="fae-class-badge">🎭 ' + escapeHtml(data.species || 'НПС') + ' • ' + escapeHtml(data.role || 'Персонаж') + '</span>';
    bodyContent =
      '<div style="font-size:20px;font-weight:700;color:#fde68a;margin-bottom:8px;font-family:\'Cinzel\',serif;">' + escapeHtml(data.name || 'НПС') + '</div>' +
      '<div class="fae-gen-stat-grid">' +
        '<div class="fae-gen-stat-box"><span class="lbl">🚩 Фракция</span><span class="val">' + escapeHtml(data.faction || 'Независимый') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">⚖️ Мировоззрение</span><span class="val">' + escapeHtml(data.alignment || 'Нейтральное') + '</span></div>' +
      '</div>' +
      '<div class="fae-gen-block"><b>👤 Внешность и приметы:</b><br>' + escapeHtml(data.appearance || '') + '</div>' +
      (data.voiceAndManner ? ('<div class="fae-gen-block" style="border-left-color:#38bdf8;"><b>🗣️ Манера речи и фраза для отыгрыша:</b><br><i>' + escapeHtml(data.voiceAndManner) + '</i></div>') : '') +
      '<div style="margin-top:10px;font-size:13.5px;color:#cbd5e1;line-height:1.55;">' +
        '<b>Характер:</b> ' + escapeHtml(data.personality || '—') + '<br>' +
        '<b>Мотивация и цель:</b> ' + escapeHtml(data.motivation || '—') +
      '</div>' +
      (data.secret ? ('<div class="fae-gen-block" style="border-left-color:#f43f5e;"><b>🤫 Личная тайна:</b><br>' + escapeHtml(data.secret) + '</div>') : '') +
      (data.combatStats ? ('<div class="fae-gen-block" style="border-left-color:#fbbf24;"><b>⚔️ Боевые параметры (D&D 5e):</b><br>' + escapeHtml(data.combatStats) + '</div>') : '') +
      (data.inventory ? ('<div style="margin-top:10px;font-size:13px;color:#94a3b8;"><b>🎒 Инвентарь / Товары:</b> ' + escapeHtml(data.inventory) + '</div>') : '');
    actionButtons =
      '<button class="btn-primary" id="btnFaeSaveCampaignNote">📜 В Хроники кампании</button>' +
      '<button class="btn-ghost" id="btnFaeSaveNpcAsHero">👤 Создать в Ростере героев</button>';

  } else if(cat === 'weapon'){
    headerBadge = '<span class="fae-class-badge">⚔️ ' + escapeHtml(data.rarity || 'Редкое') + ' • ' + escapeHtml(data.baseWeapon || 'Оружие') + '</span>';
    bodyContent =
      '<div style="font-size:20px;font-weight:700;color:#fde68a;margin-bottom:8px;font-family:\'Cinzel\',serif;">' + escapeHtml(data.name || 'Магическое оружие') + '</div>' +
      '<div class="fae-gen-stat-grid">' +
        '<div class="fae-gen-stat-box"><span class="lbl">🎯 Бонус атаки</span><span class="val">' + escapeHtml(data.attackBonus || '+2') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">💥 Урон</span><span class="val">' + escapeHtml(data.damage || '1d8+2') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">🔥 Тип урона</span><span class="val">' + escapeHtml(data.damageType || 'рубящий') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">⚡ Мастерство 2024</span><span class="val">' + escapeHtml(data.mastery || 'Подрыв (Sap)') + '</span></div>' +
      '</div>' +
      '<div style="font-size:13px;color:#94a3b8;margin-bottom:10px;">' +
        '<b>Свойства:</b> ' + escapeHtml(data.properties || '—') + ' &nbsp;|&nbsp; ' +
        '<b>Настройка:</b> ' + escapeHtml(data.attunement || 'Требуется настройка') +
        (data.price ? (' &nbsp;|&nbsp; <b>Цена:</b> <span style="color:#fbbf24;">' + escapeHtml(data.price) + '</span>') : '') +
      '</div>' +
      (data.lore ? ('<div style="font-size:13.5px;color:#cbd5e1;font-style:italic;margin-bottom:10px;">' + escapeHtml(data.lore) + '</div>') : '') +
      '<div class="fae-gen-block"><b>✨ Магические и боевые свойства:</b><br><span style="white-space:pre-line;">' + escapeHtml(data.mechanics || '') + '</span></div>';
    actionButtons = hero ? (
      '<button class="btn-primary" id="btnFaeSaveWeaponAttack">⚔️ В таблицу атак (' + heroName + ')</button>' +
      '<button class="btn-ghost" id="btnFaeSaveWeaponEquip">🎒 В снаряжение (' + heroName + ')</button>'
    ) : '';

  } else if(cat === 'armor'){
    headerBadge = '<span class="fae-class-badge">🛡️ ' + escapeHtml(data.rarity || 'Редкий') + ' • ' + escapeHtml(data.armorType || 'Доспех') + '</span>';
    bodyContent =
      '<div style="font-size:20px;font-weight:700;color:#fde68a;margin-bottom:8px;font-family:\'Cinzel\',serif;">' + escapeHtml(data.name || 'Магический доспех') + '</div>' +
      '<div class="fae-gen-stat-grid">' +
        '<div class="fae-gen-stat-box"><span class="lbl">🛡️ Класс Доспеха</span><span class="val">' + escapeHtml(data.baseAc || 'КД 18') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">💪 Требование</span><span class="val">' + escapeHtml(data.strReq || 'Нет') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">🌑 Скрытность</span><span class="val">' + escapeHtml(data.stealth || 'Без помехи') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">💰 Стоимость</span><span class="val">' + escapeHtml(data.price || '—') + '</span></div>' +
      '</div>' +
      '<div style="font-size:13px;color:#38bdf8;margin-bottom:8px;">' +
        '<b>Сопротивления / Защита:</b> ' + escapeHtml(data.resistances || '—') + ' &nbsp;|&nbsp; ' +
        '<span style="color:#f59e0b;">' + escapeHtml(data.attunement || 'Требуется настройка') + '</span>' +
      '</div>' +
      (data.lore ? ('<div style="font-size:13.5px;color:#cbd5e1;font-style:italic;margin-bottom:10px;">' + escapeHtml(data.lore) + '</div>') : '') +
      '<div class="fae-gen-block"><b>🛡️ Защитные чары и механика:</b><br><span style="white-space:pre-line;">' + escapeHtml(data.mechanics || '') + '</span></div>';
    actionButtons = hero ? (
      '<button class="btn-primary" id="btnFaeSaveArmorEquip">🛡️ Добавить в снаряжение (' + heroName + ')</button>' +
      (data.numericAc ? ('<button class="btn-ghost" id="btnFaeApplyArmorAc">🛡️ Установить КД ' + escapeHtml(String(data.numericAc)) + ' герою</button>') : '')
    ) : '';

  } else if(cat === 'spell'){
    headerBadge = '<span class="fae-class-badge">✨ ' + escapeHtml(data.schoolRu || data.school || 'Воплощение') + ' • ' + (data.level === 0 ? 'Заговор' : (data.level + ' круг')) + '</span>';
    bodyContent =
      '<div style="font-size:20px;font-weight:700;color:#fde68a;margin-bottom:8px;font-family:\'Cinzel\',serif;">' + escapeHtml(data.name || 'Заклинание') + '</div>' +
      '<div class="fae-gen-stat-grid">' +
        '<div class="fae-gen-stat-box"><span class="lbl">⏱ Время</span><span class="val">' + escapeHtml(data.castingTime || '1 действие') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">🎯 Дистанция</span><span class="val">' + escapeHtml(data.range || '60 футов') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">⏳ Длительность</span><span class="val">' + escapeHtml(data.duration || 'Мгновенная') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">🔮 Компоненты</span><span class="val">' + escapeHtml(data.components || 'В, С') + '</span></div>' +
      '</div>' +
      (data.classes ? ('<div style="font-size:12.5px;color:#94a3b8;margin-bottom:10px;"><b>Доступно классам:</b> ' + escapeHtml(data.classes) + '</div>') : '') +
      '<div class="fae-gen-block"><span style="white-space:pre-line;">' + escapeHtml(data.effect || '') + '</span>' +
        (data.higherLevels ? ('<br><br><b>На больших уровнях:</b> ' + escapeHtml(data.higherLevels)) : '') +
      '</div>';
    actionButtons =
      '<button class="btn-primary" id="btnFaeSaveSpell">📖 В общую Книгу заклинаний</button>' +
      (hero ? ('<button class="btn-ghost" id="btnFaeSaveSpellHero">✨ В лист заклинаний (' + heroName + ')</button>') : '');

  } else if(cat === 'item'){
    headerBadge = '<span class="fae-class-badge">💍 ' + escapeHtml(data.rarity || 'Редкий') + ' • ' + escapeHtml(data.type || 'Предмет') + '</span>';
    bodyContent =
      '<div style="font-size:20px;font-weight:700;color:#fde68a;margin-bottom:8px;font-family:\'Cinzel\',serif;">' + escapeHtml(data.name || 'Артефакт') + '</div>' +
      '<div style="font-size:13px;color:#f59e0b;margin-bottom:12px;font-style:italic;">' +
        escapeHtml(data.attunement || 'Настройка не требуется') +
        (data.price ? (' &nbsp;•&nbsp; <span style="color:#fde68a;font-style:normal;">Стоимость: <b>' + escapeHtml(data.price) + '</b></span>') : '') +
      '</div>' +
      '<div class="fae-gen-block"><span style="white-space:pre-line;">' + escapeHtml(data.desc || '') + '</span></div>';
    actionButtons = hero ? ('<button class="btn-primary" id="btnFaeSaveItem">🎒 Добавить в снаряжение (' + heroName + ')</button>') : '';

  } else if(cat === 'monster'){
    var traitsList = Array.isArray(data.traits) ? data.traits.map(function(t){ return '<li style="margin-bottom:5px;">' + escapeHtml(t) + '</li>'; }).join('') : '';
    var actionsList = Array.isArray(data.actions) ? data.actions.map(function(a){ return '<li style="margin-bottom:5px;">' + escapeHtml(a) + '</li>'; }).join('') : '';
    headerBadge = '<span class="fae-class-badge">👹 ' + escapeHtml(data.cr || 'КО 6') + ' • ' + escapeHtml(data.sizeAndType || 'Чудовище') + '</span>';
    bodyContent =
      '<div style="font-size:20px;font-weight:700;color:#fde68a;margin-bottom:8px;font-family:\'Cinzel\',serif;">' + escapeHtml(data.name || 'Монстр') + '</div>' +
      '<div class="fae-gen-stat-grid">' +
        '<div class="fae-gen-stat-box"><span class="lbl">🛡️ Класс Доспеха</span><span class="val">' + escapeHtml(data.ac || '16') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">❤️ Хиты (HP)</span><span class="val">' + escapeHtml(data.hp || '110') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">⚡ Скорость</span><span class="val">' + escapeHtml(data.speed || '30 фт.') + '</span></div>' +
      '</div>' +
      (data.stats ? ('<div style="background:rgba(120,53,15,0.28);border:1px solid rgba(251,191,36,0.3);border-radius:6px;padding:8px 12px;font-family:\'JetBrains Mono\',monospace;font-size:12.5px;color:#fde68a;text-align:center;margin:10px 0;">' + escapeHtml(data.stats) + '</div>') : '') +
      (data.defenses ? ('<div style="font-size:12.5px;color:#94a3b8;margin-bottom:10px;"><b>Защита, спасброски и чувства:</b> ' + escapeHtml(data.defenses) + '</div>') : '') +
      (traitsList ? ('<div style="margin-top:10px;"><div style="font-size:12.5px;color:#c9a45c;font-weight:700;font-family:\'Cinzel\',serif;margin-bottom:4px;">ОСОБЕННОСТИ:</div><ul style="margin:0 0 0 18px;padding:0;color:#cbd5e1;font-size:13.5px;">' + traitsList + '</ul></div>') : '') +
      (actionsList ? ('<div style="margin-top:12px;"><div style="font-size:12.5px;color:#f87171;font-weight:700;font-family:\'Cinzel\',serif;margin-bottom:4px;">⚔️ ДЕЙСТВИЯ В БОЮ:</div><ul style="margin:0 0 0 18px;padding:0;color:#e2e8f0;font-size:13.5px;">' + actionsList + '</ul></div>') : '') +
      (data.legendaryOrReactions ? ('<div class="fae-gen-block" style="border-left-color:#a855f7;"><b>👑 Реакции и Легендарные действия:</b><br>' + escapeHtml(data.legendaryOrReactions) + '</div>') : '') +
      (data.tacticsAndLoot ? ('<div class="fae-gen-block" style="border-left-color:#4ade80;"><b>💎 Тактика и Трофеи:</b><br>' + escapeHtml(data.tacticsAndLoot) + '</div>') : '');
    actionButtons = '<button class="btn-primary" id="btnFaeSaveCampaignNote">📜 Сохранить статблок в Хроники кампании</button>';

  } else if(cat === 'location'){
    var zonesHtml = Array.isArray(data.keyZones) ? data.keyZones.map(function(z){ return '<li style="margin-bottom:5px;">' + escapeHtml(z) + '</li>'; }).join('') : '';
    headerBadge = '<span class="fae-class-badge">🏰 ' + escapeHtml(data.type || 'Локация') + ' • ' + escapeHtml(data.region || 'Фаэрун') + '</span>';
    bodyContent =
      '<div style="font-size:20px;font-weight:700;color:#fde68a;margin-bottom:8px;font-family:\'Cinzel\',serif;">' + escapeHtml(data.name || 'Локация') + '</div>' +
      '<div class="fae-gen-block"><b>🕯️ Атмосфера и первое впечатление:</b><br>' + escapeHtml(data.atmosphere || '') + '</div>' +
      (zonesHtml ? ('<div style="margin-top:12px;"><div style="font-size:12.5px;color:#c9a45c;font-weight:700;font-family:\'Cinzel\',serif;margin-bottom:5px;">🗺️ КЛЮЧЕВЫЕ ЗАЛЫ И ЗОНЫ:</div><ul style="margin:0 0 0 18px;padding:0;color:#e2e8f0;font-size:13.5px;">' + zonesHtml + '</ul></div>') : '') +
      (data.inhabitants ? ('<div class="fae-gen-block" style="border-left-color:#38bdf8;"><b>👥 Обитатели и стражи:</b><br>' + escapeHtml(data.inhabitants) + '</div>') : '') +
      (data.secretsAndTraps ? ('<div class="fae-gen-block" style="border-left-color:#f43f5e;"><b>🗝️ Тайники и Ловушки (СЛ):</b><br>' + escapeHtml(data.secretsAndTraps) + '</div>') : '') +
      (data.hooksAndRumors ? ('<div class="fae-gen-block" style="border-left-color:#4ade80;"><b>💬 Слухи, товары и зацепки:</b><br>' + escapeHtml(data.hooksAndRumors) + '</div>') : '');
    actionButtons = '<button class="btn-primary" id="btnFaeSaveCampaignNote">📜 Сохранить локацию в Хроники кампании</button>';

  } else if(cat === 'alchemy'){
    var ingBadges = Array.isArray(data.ingredients) ? data.ingredients.map(function(i){
      return '<span style="background:rgba(30,41,59,0.85);border:1px solid rgba(201,164,92,0.35);border-radius:5px;padding:3px 9px;font-size:12px;color:#fde68a;">🌿 ' + escapeHtml(i.name) + ' ×' + (i.qty||1) + '</span>';
    }).join(' ') : '';
    headerBadge = '<span class="fae-class-badge">🧪 ' + escapeHtml(data.rarity || 'Редкий') + ' • ' + escapeHtml(data.type || 'Эликсир') + '</span>';
    bodyContent =
      '<div style="font-size:20px;font-weight:700;color:#fde68a;margin-bottom:8px;font-family:\'Cinzel\',serif;">' + escapeHtml(data.name || 'Алхимический рецепт') + '</div>' +
      '<div class="fae-gen-stat-grid">' +
        '<div class="fae-gen-stat-box"><span class="lbl">🎲 СЛ Крафта</span><span class="val">СЛ ' + escapeHtml(String(data.dc || 15)) + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">💰 Стоимость</span><span class="val">' + escapeHtml(String(data.cost || 100)) + ' ЗМ</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">⏳ Время варки</span><span class="val">' + escapeHtml(data.time || '4 часа') + '</span></div>' +
        '<div class="fae-gen-stat-box"><span class="lbl">⚗️ Инструмент</span><span class="val">' + (data.kit === 'herbalism' ? 'Набор травника' : 'Алхимический набор') + '</span></div>' +
      '</div>' +
      (ingBadges ? ('<div style="margin:10px 0;"><div style="font-size:11.5px;color:#94a3b8;margin-bottom:5px;">ТРЕБУЕМЫЕ ИНГРЕДИЕНТЫ:</div><div style="display:flex;flex-wrap:wrap;gap:6px;">' + ingBadges + '</div></div>') : '') +
      (data.appearance ? ('<div style="font-size:13px;color:#cbd5e1;font-style:italic;margin-bottom:8px;">' + escapeHtml(data.appearance) + '</div>') : '') +
      '<div class="fae-gen-block"><b>🧪 Игровой эффект:</b><br><span style="white-space:pre-line;">' + escapeHtml(data.effect || '') + '</span></div>';
    actionButtons =
      '<button class="btn-primary" id="btnFaeSaveAlchRecipe">⚗️ Сохранить в Рецепты Алхимии</button>' +
      (hero ? ('<button class="btn-ghost" id="btnFaeSaveAlchEquip">🎒 В снаряжение (' + heroName + ')</button>') : '');

  } else {
    headerBadge = '<span class="fae-class-badge">⭐ ' + escapeHtml(data.category || 'Черта') + '</span>';
    var featsList = Array.isArray(data.features) ? data.features.map(function(f){ return '<li style="margin-bottom:5px;">' + escapeHtml(f) + '</li>'; }).join('') : '';
    bodyContent =
      '<div style="font-size:20px;font-weight:700;color:#fde68a;margin-bottom:8px;font-family:\'Cinzel\',serif;">' + escapeHtml(data.name || 'Черта') + '</div>' +
      '<div style="font-size:13px;color:#94a3b8;margin-bottom:8px;">' +
        '<b>Требования:</b> ' + escapeHtml(data.prereq || 'Без требований') +
        (data.statBonus ? ('<br><span style="color:#38bdf8;"><b>Бонус характеристик:</b> ' + escapeHtml(data.statBonus) + '</span>') : '') +
      '</div>' +
      '<div class="fae-gen-block">' + escapeHtml(data.desc || '') + '</div>' +
      (featsList ? ('<ul style="margin:10px 0 0 18px;padding:0;color:#e2e8f0;font-size:13.5px;line-height:1.6;">' + featsList + '</ul>') : '');
    actionButtons = hero ? ('<button class="btn-primary" id="btnFaeSaveFeat">⭐ Добавить в черты (' + heroName + ')</button>') : '';
  }

  return '<div class="ai-gen-result-card">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">' +
      headerBadge +
      '<button class="btn-ghost" id="btnFaeCopyResult" style="font-size:12px;">📋 Копировать текст</button>' +
    '</div>' +
    bodyContent +
    '<div class="rule" style="margin:16px 0;"></div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">' +
      actionButtons +
      '<button class="btn-ghost" id="btnFaeRegen">🔄 Сгенерировать снова</button>' +
      '<button class="btn-ghost" id="btnFaeBackForm">← Назад к параметрам</button>' +
    '</div>' +
  '</div>';
}

function renderFaeAiHistorySection(activeFilter){
  var list = loadFaeAiHistory();
  var filter = activeFilter || window._faeAiHistFilter || 'all';
  var filtered = filter === 'all' ? list : list.filter(function(item){ return item.cat === filter; });

  var filterPills = '<button type="button" class="pill ' + (filter === 'all' ? 'active' : '') + '" data-fae-hist-filter="all">Все (' + list.length + ')</button>' +
    FAE_GEN_CATEGORIES.map(function(c){
      var cnt = list.filter(function(x){ return x.cat === c.key; }).length;
      if(!cnt) return '';
      return '<button type="button" class="pill ' + (filter === c.key ? 'active' : '') + '" data-fae-hist-filter="' + c.key + '">' + c.icon + ' ' + escapeHtml(c.title) + ' (' + cnt + ')</button>';
    }).join('');

  var cardsHtml = '';
  if(!filtered.length){
    cardsHtml = '<div style="padding:18px;text-align:center;color:#64748b;font-style:italic;border:1px dashed rgba(201,164,92,0.2);border-radius:8px;margin-top:10px;">Архив пуст — сгенерируйте любой квест, НПС, оружие, доспех или заклинание, и они автоматически сохранятся здесь.</div>';
  } else {
    cardsHtml = '<div class="fae-ai-hist-grid">' +
      filtered.map(function(item){
        return '<div class="fae-ai-hist-card" data-fae-hist-open="' + escapeAttr(item.id) + '" title="Открыть карточку">' +
          '<div>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:4px;">' +
              '<span style="font-size:11px;color:#c9a45c;font-family:\'JetBrains Mono\',monospace;">' + (item.icon || '✨') + ' ' + escapeHtml(item.catTitle || '') + '</span>' +
              '<span style="font-size:10.5px;color:#64748b;">' + escapeHtml(item.createdAt || '') + '</span>' +
            '</div>' +
            '<div style="font-family:\'Cinzel\',serif;font-size:14.5px;font-weight:700;color:#f8fafc;line-height:1.3;">' + escapeHtml(item.title || 'Без названия') + '</div>' +
            '<div style="font-size:12px;color:#94a3b8;margin-top:3px;">' + escapeHtml(item.sub || '') + '</div>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;align-items:center;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);">' +
            '<span style="font-size:11.5px;color:#fbbf24;">Открыть карточку →</span>' +
            '<button type="button" class="btn-ghost" data-fae-hist-del="' + escapeAttr(item.id) + '" style="padding:2px 7px;font-size:11px;color:#f87171;border-color:rgba(248,113,113,0.3);" title="Удалить из архива">✕</button>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  return '<div class="sheet-section fae-data-section" id="faeAiHistoryWrap" style="margin-top:22px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">' +
      '<div class="section-label" style="margin:0;">🗂️ АРХИВ СГЕНЕРИРОВАННОГО (ИСТОРИЯ AI ФАЭРУНА)</div>' +
      (list.length ? '<button type="button" class="btn-ghost" id="btnFaeClearAiHist" style="font-size:11.5px;padding:4px 10px;color:#f87171;">🗑️ Очистить архив</button>' : '') +
    '</div>' +
    (list.length ? ('<div class="pill-row" style="margin-bottom:10px;">' + filterPills + '</div>') : '') +
    cardsHtml +
  '</div>';
}

function renderFaeGen(){
  var curKey = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
  var hasKey = !!(curKey && curKey.trim());
  var curCat = window._faeGenActiveCat || 'quest';
  var def = getFaeGenCatDef(curCat);

  var hero = getActiveFaerunCharacter();
  var camp = loadFaerunCampaign();
  var ctxSummary = [];
  if(hero && hero.name) ctxSummary.push(hero.name + ' (' + (hero.species || 'Герой') + ', ' + (hero.className || 'Воин') + ' ' + (hero.level || 1) + ' ур.)');
  if(camp && camp.location) ctxSummary.push('Локация: ' + camp.location);
  var ctxLabel = ctxSummary.length ? ctxSummary.join(' • ') : 'Активный герой и текущая кампания';

  var catCardsHtml = FAE_GEN_CATEGORIES.map(function(c){
    var isAct = c.key === curCat;
    return '<button type="button" class="fae-gen-cat-card' + (isAct ? ' active' : '') + '" data-fae-gen-cat="' + c.key + '">' +
      '<div class="fae-gen-cat-top"><span>' + c.icon + '</span><span>' + escapeHtml(c.title) + '</span></div>' +
      '<div class="fae-gen-cat-sub">' + escapeHtml(c.sub) + '</div>' +
    '</button>';
  }).join('');

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'AI Генератор D&D'}]) +
    '<button class="back" data-go="home">← В меню Фаэруна</button>' +
    '<h1><span class="h1-icon">🤖</span> AI Генератор D&D 5e / 2024</h1>' +
    '<p class="subtitle">Кузница приключений Фаэруна: генерация квестов, НПС, оружия с Мастерством 2024, брони, заклинаний, артефактов, монстров, локаций, алхимии и черт.</p>' +
    '<div class="fae-rule"></div>' +

    '<div id="faeGenFormSection" class="ai-gen-card">' +
      '<div class="section-label" style="margin-top:0;margin-bottom:10px;">1. ВЫБЕРИТЕ КАТЕГОРИЮ ГЕНЕРАЦИИ</div>' +
      '<div class="fae-gen-cat-grid" id="faeGenCatGrid">' +
        catCardsHtml +
      '</div>' +
      '<input type="hidden" id="faeGenCat" value="' + escapeAttr(curCat) + '">' +

      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label" id="faeGenThemeLabel">' + escapeHtml(def.themeLabel) + '</label>' +
        '<input type="text" class="ai-gen-input" id="faeGenTheme" placeholder="' + escapeAttr(def.themePlaceholder) + '">' +
      '</div>' +

      '<div id="faeGenPresetsBox">' +
        renderFaeGenPresets(curCat) +
      '</div>' +

      '<div id="faeGenExtraFields" style="margin-top:12px;">' +
        renderFaeGenExtraFields(curCat) +
      '</div>' +

      '<div class="ai-gen-field" style="margin-top:14px;">' +
        '<label class="ai-gen-label">Особые пожелания, детали или механики</label>' +
        '<textarea class="ai-gen-textarea" id="faeGenReq" rows="3" placeholder="' + escapeAttr(def.reqPlaceholder) + '"></textarea>' +
      '</div>' +

      '<div style="margin-top:12px;padding:9px 12px;background:rgba(15,23,42,0.65);border:1px solid rgba(201,164,92,0.25);border-radius:6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
        '<input type="checkbox" id="faeGenUseContext" checked style="width:16px;height:16px;accent-color:#c9a45c;cursor:pointer;">' +
        '<label for="faeGenUseContext" style="font-size:13px;color:#e2e8f0;cursor:pointer;flex:1;">' +
          '🎯 <b>Адаптировать под активного героя и кампанию:</b> <span style="color:#c9a45c;">' + escapeHtml(ctxLabel) + '</span>' +
        '</label>' +
      '</div>' +

      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:16px;">' +
        '<button type="button" class="btn-ghost" id="faeGenKeyBtn" style="font-size:12.5px;">🔑 API ключ: ' + (hasKey ? '<span style="color:#4ade80;">✓ Установлен</span>' : '<span style="color:#fbbf24;">⚠️ Не задан</span>') + '</button>' +
        '<button type="button" class="ai-gen-btn" id="btnFaeGen">✨ Сгенерировать через AI</button>' +
      '</div>' +
    '</div>' +

    '<div id="faeGenResult" style="display:none;margin-top:20px;">' +
      '<div id="faeGenPreview"></div>' +
    '</div>' +

    '<div id="faeAiHistoryOuter">' +
      renderFaeAiHistorySection(window._faeAiHistFilter || 'all') +
    '</div>';
}

function wireFaeGenPresetsAndHistory(){
  var catInp = document.getElementById('faeGenCat');
  var themeInp = document.getElementById('faeGenTheme');
  var reqInp = document.getElementById('faeGenReq');
  var curCat = catInp ? catInp.value : (window._faeGenActiveCat || 'quest');
  var def = getFaeGenCatDef(curCat);

  document.querySelectorAll('[data-fae-preset-idx]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var idx = parseInt(btn.getAttribute('data-fae-preset-idx'), 10);
      var p = def.presets && def.presets[idx];
      if(!p) return;
      if(themeInp) themeInp.value = p.theme || '';
      if(reqInp) reqInp.value = p.req || '';
    });
  });

  var rndBtn = document.getElementById('btnFaeRandomIdea');
  if(rndBtn){
    rndBtn.addEventListener('click', function(){
      var presets = def.presets || [];
      if(!presets.length) return;
      var pick = presets[Math.floor(Math.random() * presets.length)];
      if(themeInp) themeInp.value = pick.theme || '';
      if(reqInp) reqInp.value = pick.req || '';
    });
  }

  document.querySelectorAll('[data-fae-hist-filter]').forEach(function(pill){
    pill.addEventListener('click', function(){
      window._faeAiHistFilter = pill.getAttribute('data-fae-hist-filter') || 'all';
      var outer = document.getElementById('faeAiHistoryOuter');
      if(outer){
        outer.innerHTML = renderFaeAiHistorySection(window._faeAiHistFilter);
        wireFaeGenPresetsAndHistory();
      }
    });
  });

  document.querySelectorAll('[data-fae-hist-open]').forEach(function(card){
    card.addEventListener('click', function(e){
      if(e.target.closest('[data-fae-hist-del]')) return;
      var id = card.getAttribute('data-fae-hist-open');
      var list = loadFaeAiHistory();
      var found = list.find(function(x){ return x.id === id; });
      if(!found) return;
      window._lastFaeGenData = { data: found.data, cat: found.cat };
      var form = document.getElementById('faeGenFormSection');
      var resDiv = document.getElementById('faeGenResult');
      var preview = document.getElementById('faeGenPreview');
      if(form) form.style.display = 'none';
      if(resDiv) resDiv.style.display = 'block';
      if(preview) preview.innerHTML = renderFaeGenCardPreview(found.data, found.cat);
      wireFaeGenResultActions();
      if(resDiv) resDiv.scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.querySelectorAll('[data-fae-hist-del]').forEach(function(delBtn){
    delBtn.addEventListener('click', function(e){
      e.stopPropagation();
      var id = delBtn.getAttribute('data-fae-hist-del');
      var list = loadFaeAiHistory().filter(function(x){ return x.id !== id; });
      saveFaeAiHistory(list);
      var outer = document.getElementById('faeAiHistoryOuter');
      if(outer){
        outer.innerHTML = renderFaeAiHistorySection(window._faeAiHistFilter || 'all');
        wireFaeGenPresetsAndHistory();
      }
    });
  });

  var clearBtn = document.getElementById('btnFaeClearAiHist');
  if(clearBtn){
    clearBtn.addEventListener('click', function(){
      if(!confirm('Очистить весь архив AI-генераций Фаэруна?')) return;
      saveFaeAiHistory([]);
      var outer = document.getElementById('faeAiHistoryOuter');
      if(outer){
        outer.innerHTML = renderFaeAiHistorySection('all');
        wireFaeGenPresetsAndHistory();
      }
    });
  }
}

function wireFaeGen(){
  var catInp = document.getElementById('faeGenCat');
  var themeLbl = document.getElementById('faeGenThemeLabel');
  var themeInp = document.getElementById('faeGenTheme');
  var reqInp = document.getElementById('faeGenReq');
  var extraWrap = document.getElementById('faeGenExtraFields');
  var presetsBox = document.getElementById('faeGenPresetsBox');

  document.querySelectorAll('[data-fae-gen-cat]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var cat = btn.getAttribute('data-fae-gen-cat');
      window._faeGenActiveCat = cat;
      if(catInp) catInp.value = cat;
      document.querySelectorAll('[data-fae-gen-cat]').forEach(function(b){
        b.classList.toggle('active', b === btn);
      });
      var def = getFaeGenCatDef(cat);
      if(themeLbl) themeLbl.textContent = def.themeLabel;
      if(themeInp) themeInp.placeholder = def.themePlaceholder;
      if(reqInp) reqInp.placeholder = def.reqPlaceholder;
      if(presetsBox) presetsBox.innerHTML = renderFaeGenPresets(cat);
      if(extraWrap) extraWrap.innerHTML = renderFaeGenExtraFields(cat);
      if(typeof enhanceAllCustomSelects === 'function') enhanceAllCustomSelects();
      wireFaeGenPresetsAndHistory();
    });
  });

  wireFaeGenPresetsAndHistory();

  var keyBtn = document.getElementById('faeGenKeyBtn');
  if(keyBtn){
    keyBtn.addEventListener('click', function(){
      var curKey = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
      var input = prompt('Введите Google Gemini API ключ (gemini-4-argon):', curKey || '');
      if(input !== null && typeof window.saveGeminiApiKey === 'function'){
        window.saveGeminiApiKey(input.trim());
        if(typeof render === 'function') render();
      }
    });
  }

  var btnGen = document.getElementById('btnFaeGen');
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

      var cat = catInp ? catInp.value : (window._faeGenActiveCat || 'quest');
      var theme = (themeInp ? themeInp.value : '').trim();
      var req = (reqInp ? reqInp.value : '').trim();
      var useCtx = document.getElementById('faeGenUseContext') && document.getElementById('faeGenUseContext').checked;

      var contextInfo = '';
      if(useCtx){
        var hero = getActiveFaerunCharacter();
        var camp = loadFaerunCampaign();
        var parts = [];
        if(hero && hero.name) parts.push('Герой ' + hero.name + ' (' + (hero.species || 'Человек') + ', ' + (hero.className || 'Воин') + ' ' + (hero.level || 1) + ' ур.' + (hero.subclass ? (', ' + hero.subclass) : '') + ')');
        if(camp && camp.title) parts.push('Кампания «' + camp.title + '»');
        if(camp && camp.location) parts.push('Текущая локация: ' + camp.location);
        contextInfo = parts.join('; ');
      }

      var v = function(id){ var el = document.getElementById(id); return el ? el.value : ''; };
      var opts = { cat: cat, theme: theme, req: req, contextInfo: contextInfo };

      if(cat === 'quest'){
        opts.questType = v('faeGenQuestType');
        opts.questLevel = v('faeGenQuestLevel');
        opts.questRegion = v('faeGenQuestRegion');
        opts.questTone = v('faeGenQuestTone');
      } else if(cat === 'npc'){
        opts.npcRole = v('faeGenNpcRole');
        opts.npcSpecies = v('faeGenNpcSpecies');
        opts.npcFaction = v('faeGenNpcFaction');
        opts.npcPower = v('faeGenNpcPower');
      } else if(cat === 'weapon'){
        opts.weaponBase = v('faeGenWeaponBase');
        opts.weaponRarity = v('faeGenWeaponRarity');
        opts.weaponElement = v('faeGenWeaponElement');
        opts.weaponMastery = v('faeGenWeaponMastery');
      } else if(cat === 'armor'){
        opts.armorType = v('faeGenArmorType');
        opts.armorRarity = v('faeGenArmorRarity');
        opts.armorFocus = v('faeGenArmorFocus');
        opts.armorMaterial = v('faeGenArmorMaterial');
      } else if(cat === 'spell'){
        opts.school = v('faeGenSchool') || 'evocation';
        opts.level = parseInt(v('faeGenLevel') || '1', 10);
        opts.spellClass = v('faeGenSpellClass');
        opts.spellAction = v('faeGenSpellAction');
      } else if(cat === 'item'){
        opts.rarity = v('faeGenRarity') || 'Редкий';
        opts.itemType = v('faeGenItemType') || 'Чудесный предмет';
      } else if(cat === 'monster'){
        opts.monsterType = v('faeGenMonsterType');
        opts.monsterCr = v('faeGenMonsterCr');
        opts.monsterRole = v('faeGenMonsterRole');
      } else if(cat === 'location'){
        opts.locType = v('faeGenLocType');
        opts.locDanger = v('faeGenLocDanger');
      } else if(cat === 'alchemy'){
        opts.alchType = v('faeGenAlchType');
        opts.alchRarity = v('faeGenAlchRarity');
        opts.alchKit = v('faeGenAlchKit') || 'alchemy';
      } else {
        opts.featCat = v('faeGenFeatCat') || 'Общая черта';
        opts.featFocus = v('faeGenFeatFocus');
      }

      btnGen.disabled = true;
      btnGen.textContent = '🔮 Сотворение в Плетении магии...';

      callGeminiFaeGenerator(opts, k, function(err, result){
        btnGen.disabled = false;
        btnGen.textContent = '✨ Сгенерировать через AI';

        if(err || !result){
          alert('Ошибка генерации: ' + (err || 'Пустой ответ от ИИ'));
          return;
        }

        window._lastFaeGenData = { data: result, cat: cat };
        pushFaeAiHistory(cat, result);

        var outer = document.getElementById('faeAiHistoryOuter');
        if(outer){
          outer.innerHTML = renderFaeAiHistorySection(window._faeAiHistFilter || 'all');
          wireFaeGenPresetsAndHistory();
        }

        var form = document.getElementById('faeGenFormSection');
        var resDiv = document.getElementById('faeGenResult');
        var preview = document.getElementById('faeGenPreview');

        if(form) form.style.display = 'none';
        if(resDiv) resDiv.style.display = 'block';
        if(preview) preview.innerHTML = renderFaeGenCardPreview(result, cat);
        wireFaeGenResultActions();
        if(resDiv) resDiv.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }
}

function wireFaeGenResultActions(){
  var bundle = window._lastFaeGenData;
  if(!bundle) return;
  var data = bundle.data;
  var cat = bundle.cat;

  var btnCopy = document.getElementById('btnFaeCopyResult');
  if(btnCopy){
    btnCopy.addEventListener('click', function(){
      var text = formatFaeGenPlainText(data, cat);
      copyText(text);
      btnCopy.textContent = 'Скопировано ✓';
      setTimeout(function(){ btnCopy.textContent = '📋 Копировать текст'; }, 1200);
    });
  }

  /* Сохранение квеста / НПС / монстра / локации в Хроники кампании */
  var btnSaveCamp = document.getElementById('btnFaeSaveCampaignNote');
  if(btnSaveCamp){
    btnSaveCamp.addEventListener('click', function(){
      var camp = loadFaerunCampaign();
      var blockText = formatFaeGenPlainText(data, cat);
      camp.notes = camp.notes ? (camp.notes + '\n\n══════════════════════════════\n' + blockText) : blockText;
      if(cat === 'quest' && !camp.title && data.title) camp.title = data.title;
      if((cat === 'quest' || cat === 'location') && !camp.location && data.region) camp.location = data.region;
      saveFaerunCampaign(camp);
      btnSaveCamp.disabled = true;
      btnSaveCamp.textContent = '✓ Записано в Хроники кампании!';
    });
  }

  /* Создание НПС как персонажа в Ростере героев */
  var btnSaveNpcHero = document.getElementById('btnFaeSaveNpcAsHero');
  if(btnSaveNpcHero){
    btnSaveNpcHero.addEventListener('click', function(){
      var created = newCharacter({
        name: data.name || 'Новый НПС',
        species: data.species || 'Человек',
        className: data.role || 'Воин',
        alignment: data.alignment || 'Нейтральный',
        traits: data.personality || '',
        ideals: data.motivation || '',
        flaws: data.secret || '',
        equipment: data.inventory || '',
        features: data.combatStats || '',
        backstory: [data.appearance, data.voiceAndManner, data.faction ? ('Фракция: ' + data.faction) : ''].filter(Boolean).join('\n\n')
      });
      CHARACTERS.push(created);
      saveCharactersToStorage();
      btnSaveNpcHero.disabled = true;
      btnSaveNpcHero.textContent = '✓ Добавлен в Ростер героев!';
    });
  }

  /* Добавление сгенерированного оружия в таблицу атак и снаряжение */
  var btnSaveWpnAtk = document.getElementById('btnFaeSaveWeaponAttack');
  if(btnSaveWpnAtk){
    btnSaveWpnAtk.addEventListener('click', function(){
      var hero = getActiveFaerunCharacter();
      if(!hero) return;
      if(!Array.isArray(hero.attacks)) hero.attacks = [];
      hero.attacks.push({
        name: data.name || data.baseWeapon || 'Магическое оружие',
        bonus: data.attackBonus || '+5',
        damage: data.damage || '1d8+3',
        type: data.damageType || 'рубящий',
        mastery: data.mastery || ''
      });
      var equipLine = '• ⚔️ ' + (data.name || 'Оружие') + ' (' + (data.rarity || 'Редкое') + ', ' + (data.damage || '') + ', Мастерство: ' + (data.mastery || '—') + '): ' + (data.mechanics || '');
      hero.equipment = hero.equipment ? (hero.equipment + '\n\n' + equipLine) : equipLine;
      saveCharactersToStorage();
      btnSaveWpnAtk.disabled = true;
      btnSaveWpnAtk.textContent = '✓ Добавлено в атаки и снаряжение!';
    });
  }

  var btnSaveWpnEq = document.getElementById('btnFaeSaveWeaponEquip');
  if(btnSaveWpnEq){
    btnSaveWpnEq.addEventListener('click', function(){
      var hero = getActiveFaerunCharacter();
      if(!hero) return;
      var equipLine = '• ⚔️ ' + (data.name || 'Оружие') + ' (' + (data.rarity || 'Редкое') + ', ' + (data.baseWeapon || '') + ', ' + (data.damage || '') + '): ' + (data.mechanics || '');
      hero.equipment = hero.equipment ? (hero.equipment + '\n\n' + equipLine) : equipLine;
      saveCharactersToStorage();
      btnSaveWpnEq.disabled = true;
      btnSaveWpnEq.textContent = '✓ Добавлено в снаряжение!';
    });
  }

  /* Добавление брони в снаряжение и обновление КД */
  var btnSaveArmorEq = document.getElementById('btnFaeSaveArmorEquip');
  if(btnSaveArmorEq){
    btnSaveArmorEq.addEventListener('click', function(){
      var hero = getActiveFaerunCharacter();
      if(!hero) return;
      var armorLine = '• 🛡️ ' + (data.name || 'Броня') + ' (' + (data.rarity || 'Редкий') + ', ' + (data.armorType || '') + ', ' + (data.baseAc || '') + '): ' + (data.mechanics || '');
      hero.equipment = hero.equipment ? (hero.equipment + '\n\n' + armorLine) : armorLine;
      saveCharactersToStorage();
      btnSaveArmorEq.disabled = true;
      btnSaveArmorEq.textContent = '✓ Добавлено в снаряжение!';
    });
  }

  var btnApplyArmorAc = document.getElementById('btnFaeApplyArmorAc');
  if(btnApplyArmorAc){
    btnApplyArmorAc.addEventListener('click', function(){
      var hero = getActiveFaerunCharacter();
      if(!hero) return;
      var numAc = parseInt(data.numericAc, 10);
      if(!isNaN(numAc) && numAc > 0){
        hero.ac = numAc;
        saveCharactersToStorage();
        if(typeof paintBar === 'function') paintBar();
        btnApplyArmorAc.disabled = true;
        btnApplyArmorAc.textContent = '✓ КД обновлён до ' + numAc + '!';
      }
    });
  }

  /* Сохранение заклинания */
  var btnSaveSpell = document.getElementById('btnFaeSaveSpell');
  if(btnSaveSpell){
    btnSaveSpell.addEventListener('click', function(){
      var sp = {
        id: 'spell_' + Date.now().toString(36),
        name: data.name || 'Новое заклинание',
        school: data.school || 'evocation',
        level: parseInt(data.level, 10) || 0,
        effect: (data.castingTime ? ('Время: ' + data.castingTime + ' | Дистанция: ' + data.range + ' | Длительность: ' + data.duration + '\n') : '') +
                (data.components ? ('Компоненты: ' + data.components + '\n\n') : '') +
                (data.effect || '') +
                (data.higherLevels ? ('\n\nНа больших уровнях: ' + data.higherLevels) : ''),
        isCustom: true
      };
      if(!Array.isArray(SPELLS)) SPELLS = [];
      SPELLS.push(sp);
      saveSpellsToStorage();
      btnSaveSpell.disabled = true;
      btnSaveSpell.textContent = '✓ В общей Книге заклинаний!';
    });
  }

  var btnSaveSpellHero = document.getElementById('btnFaeSaveSpellHero');
  if(btnSaveSpellHero){
    btnSaveSpellHero.addEventListener('click', function(){
      var hero = getActiveFaerunCharacter();
      if(!hero) return;
      var spLine = '• ' + (data.name || 'Заклинание') + ' (' + (data.level === 0 ? 'Заговор' : (data.level + ' круг')) + ', ' + (data.schoolRu || data.school || '') + '): ' + (data.effect || '');
      hero.spellNotes = hero.spellNotes ? (hero.spellNotes + '\n\n' + spLine) : spLine;
      hero.spellEnabled = true;
      saveCharactersToStorage();
      btnSaveSpellHero.disabled = true;
      btnSaveSpellHero.textContent = '✓ Записано в лист героя!';
    });
  }

  /* Сохранение артефакта */
  var btnSaveItem = document.getElementById('btnFaeSaveItem');
  if(btnSaveItem){
    btnSaveItem.addEventListener('click', function(){
      var hero = getActiveFaerunCharacter();
      if(!hero) return;
      var itemLine = '• 💍 ' + (data.name || 'Предмет') + ' (' + (data.rarity || 'Редкий') + ' ' + (data.type || 'Чудесный предмет') + '): ' + (data.desc || '');
      hero.equipment = hero.equipment ? (hero.equipment + '\n\n' + itemLine) : itemLine;
      saveCharactersToStorage();
      btnSaveItem.disabled = true;
      btnSaveItem.textContent = '✓ Добавлено в снаряжение!';
    });
  }

  /* Сохранение рецепта алхимии */
  var btnSaveAlchRecipe = document.getElementById('btnFaeSaveAlchRecipe');
  if(btnSaveAlchRecipe){
    btnSaveAlchRecipe.addEventListener('click', function(){
      var rec = {
        id: genId(),
        name: data.name || 'Алхимический состав',
        kit: data.kit === 'herbalism' ? 'herbalism' : 'alchemy',
        cost: Number(data.cost) || 100,
        time: data.time || '4 часа',
        dc: Number(data.dc) || 15,
        ingredients: Array.isArray(data.ingredients) && data.ingredients.length ? data.ingredients.map(function(i){ return { name: i.name || 'Реагент', qty: Number(i.qty) || 1 }; }) : [{ name: 'Редкая трава Фаэруна', qty: 1 }],
        effect: (data.appearance ? (data.appearance + ' ') : '') + (data.effect || '')
      };
      if(!Array.isArray(RECIPES)) RECIPES = [];
      RECIPES.push(rec);
      saveRecipesToStorage();
      btnSaveAlchRecipe.disabled = true;
      btnSaveAlchRecipe.textContent = '✓ Добавлено в Рецепты Алхимии!';
    });
  }

  var btnSaveAlchEquip = document.getElementById('btnFaeSaveAlchEquip');
  if(btnSaveAlchEquip){
    btnSaveAlchEquip.addEventListener('click', function(){
      var hero = getActiveFaerunCharacter();
      if(!hero) return;
      var line = '• 🧪 ' + (data.name || 'Зелье') + ' (' + (data.rarity || 'Редкий') + '): ' + (data.effect || '');
      hero.equipment = hero.equipment ? (hero.equipment + '\n\n' + line) : line;
      saveCharactersToStorage();
      btnSaveAlchEquip.disabled = true;
      btnSaveAlchEquip.textContent = '✓ Добавлено в снаряжение!';
    });
  }

  /* Сохранение черты */
  var btnSaveFeat = document.getElementById('btnFaeSaveFeat');
  if(btnSaveFeat){
    btnSaveFeat.addEventListener('click', function(){
      var hero = getActiveFaerunCharacter();
      if(!hero) return;
      var featLine = '• ⭐ Черта «' + (data.name || 'Черта') + '» (' + (data.category || 'Черта') + '): ' + (data.desc || '') +
        (Array.isArray(data.features) ? (' (' + data.features.join('; ') + ')') : '');
      hero.features = hero.features ? (hero.features + '\n\n' + featLine) : featLine;
      saveCharactersToStorage();
      btnSaveFeat.disabled = true;
      btnSaveFeat.textContent = '✓ Добавлено в черты!';
    });
  }

  var btnRegen = document.getElementById('btnFaeRegen');
  if(btnRegen){
    btnRegen.addEventListener('click', function(){
      var btnG = document.getElementById('btnFaeGen');
      var form = document.getElementById('faeGenFormSection');
      var resDiv = document.getElementById('faeGenResult');
      if(resDiv) resDiv.style.display = 'none';
      if(form) form.style.display = 'block';
      if(btnG) btnG.click();
    });
  }

  var btnBack = document.getElementById('btnFaeBackForm');
  if(btnBack){
    btnBack.addEventListener('click', function(){
      var form = document.getElementById('faeGenFormSection');
      var resDiv = document.getElementById('faeGenResult');
      if(resDiv) resDiv.style.display = 'none';
      if(form) form.style.display = 'block';
    });
  }
}

/* ============================================================
   ФАЭРУН: СПРАВОЧНИК И ДАННЫЕ (FAERUN REF & DATA)
   ============================================================ */

if(typeof window.getGeminiApiKey !== 'function'){
  window.getGeminiApiKey = function(){
    try{
      return localStorage.getItem('ttc_gemini_api_key') || localStorage.getItem('gemini_api_key') || '';
    }catch(e){ return ''; }
  };
}

if(typeof window.saveGeminiApiKey !== 'function'){
  window.saveGeminiApiKey = function(key){
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
  };
}

function loadFaerunCampaign(){
  try{
    var raw = localStorage.getItem('ttc_faerun_campaign');
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return {
    title: 'Хроники Побережья Мечей',
    location: 'Врата Балдура',
    notes: 'Приключения в Забытых Королевствах. Заметки мастера и отряда.'
  };
}

function saveFaerunCampaign(camp){
  try{
    localStorage.setItem('ttc_faerun_campaign', JSON.stringify(camp));
  }catch(e){}
}

function renderFaeRef(){
  var crumbHtml = renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Справочник'}]);
  return crumbHtml +
    '<button class="back" data-go="home">← На главную</button>' +
    '<h1>📚 Справочник Фаэруна</h1>' +
    '<p class="subtitle">Единый компендиум D&D 5e: Классы и архетипы, Книга заклинаний по школам, Правила 2024, Алхимия, Оружие и Глоссарий терминов.</p>' +
    '<div class="fae-rule"></div>' +

    '<div class="fae-ref-search-wrap">' +
      '<span class="fae-ref-search-icon">🔍</span>' +
      '<input type="text" id="faeRefSearch" class="fae-ref-search-input" placeholder="Быстрый поиск по справочнику (классы, школы магии, заклинания, состояния, оружие, алхимия)..." autocomplete="off">' +
    '</div>' +

    '<div id="faeRefSearchResults" style="display:none;margin-bottom:20px;"></div>' +

    '<div class="menu-list grid-2" id="faeRefDefaultCards">' +
      '<div class="fae-card fae-card-clickable" data-go="class:fighter" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="fae-card-title"><span>⚔️</span> Классы и Архетипы</div>' +
          '<div class="fae-card-desc">Воин, стили боя, тактики превосходства, владение оружием и подклассы (Чемпион, Мастер, Пси-воин, Мистический рыцарь)</div>' +
        '</div>' +
        '<div class="fae-card-arrow">→</div>' +
      '</div>' +

      '<div class="fae-card fae-card-clickable" data-go="magic" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="fae-card-title"><span>✨</span> Книга заклинаний</div>' +
          '<div class="fae-card-desc">База заклинаний по 8 школам магии: заговоры, круги 1–9, ритуалы, концентрация и сотворение чар</div>' +
        '</div>' +
        '<div class="fae-card-arrow">→</div>' +
      '</div>' +

      '<div class="fae-card fae-card-clickable" data-go="rules2024" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="fae-card-title"><span>📜</span> Правила D&D 2024</div>' +
          '<div class="fae-card-desc">Мастерство оружия (Cleave, Graze, Vex...), 14 состояний, уровни истощения 1–6, укрытие и отдых</div>' +
        '</div>' +
        '<div class="fae-card-arrow">→</div>' +
      '</div>' +

      '<div class="fae-card fae-card-clickable" data-go="alchemy" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="fae-card-title"><span>🧪</span> Алхимия, Травничество и Яды</div>' +
          '<div class="fae-card-desc">Справочник зелий, эликсиров, бомб, масел, ядов DMG и трав D&D + Личная книга рецептов с Лабораторией ИИ</div>' +
        '</div>' +
        '<div class="fae-card-arrow">→</div>' +
      '</div>' +

      '<div class="fae-card fae-card-clickable" data-go="weapons" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="fae-card-title"><span>🗡️</span> Оружие и Свойства</div>' +
          '<div class="fae-card-desc">Таблица оружия: урон, свойства (фехтовальное, тяжелое, универсальное) и свойства мастерства оружия</div>' +
        '</div>' +
        '<div class="fae-card-arrow">→</div>' +
      '</div>' +

      '<div class="fae-card fae-card-clickable" data-go="glossary" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="fae-card-title"><span>📖</span> Глоссарий терминов</div>' +
          '<div class="fae-card-desc">Справочник терминов: Преимущество, Спасброски от смерти, Инициатива, Бонус мастерства и Действия в бою</div>' +
        '</div>' +
        '<div class="fae-card-arrow">→</div>' +
      '</div>' +
    '</div>';
}

function wireFaeRef(){
  var searchInput = document.getElementById('faeRefSearch');
  var resultsContainer = document.getElementById('faeRefSearchResults');
  var defaultCards = document.getElementById('faeRefDefaultCards');

  if(searchInput && resultsContainer && defaultCards){
    searchInput.addEventListener('input', function(){
      var q = this.value.trim().toLowerCase();
      if(q.length < 2){
        resultsContainer.style.display = 'none';
        resultsContainer.innerHTML = '';
        defaultCards.style.display = 'grid';
        return;
      }

      var matches = [];

      // 1. Spells
      if(Array.isArray(SPELLS)){
        SPELLS.forEach(function(sp){
          var n = (sp.name || '').toLowerCase();
          var sc = (sp.school || '').toLowerCase();
          var d = (sp.desc || '').toLowerCase();
          if(n.indexOf(q) !== -1 || sc.indexOf(q) !== -1 || d.indexOf(q) !== -1){
            matches.push({
              badge: '✨ Заклинание',
              title: sp.name + (sp.level ? (' (' + sp.level + ' круг)') : ' (Заговор)'),
              desc: (sp.school ? ('Школа: ' + sp.school + ' • ') : '') + (sp.desc ? sp.desc.slice(0, 140) + '...' : ''),
              go: 'schoolSpells:' + (sp.school || 'evocation')
            });
          }
        });
      }

      // 2. Weapon Mastery
      if(typeof WEAPON_MASTERY !== 'undefined' && Array.isArray(WEAPON_MASTERY)){
        WEAPON_MASTERY.forEach(function(wm){
          var ru = (wm.ru || '').toLowerCase();
          var orig = (wm.orig || '').toLowerCase();
          var desc = (wm.desc || '').toLowerCase();
          if(ru.indexOf(q) !== -1 || orig.indexOf(q) !== -1 || desc.indexOf(q) !== -1){
            matches.push({
              badge: '⚔️ Мастерство оружия',
              title: wm.ru + (wm.orig ? (' (' + wm.orig + ')') : ''),
              desc: wm.desc,
              go: 'rules2024'
            });
          }
        });
      }

      // 3. Conditions
      if(typeof CONDITIONS_2024 !== 'undefined' && Array.isArray(CONDITIONS_2024)){
        CONDITIONS_2024.forEach(function(c){
          var ru = (c.ru || '').toLowerCase();
          var orig = (c.orig || '').toLowerCase();
          var desc = (c.desc || '').toLowerCase();
          if(ru.indexOf(q) !== -1 || orig.indexOf(q) !== -1 || desc.indexOf(q) !== -1){
            matches.push({
              badge: '⚠️ Состояние',
              title: c.ru + (c.orig ? (' (' + c.orig + ')') : ''),
              desc: c.desc,
              go: 'rules2024'
            });
          }
        });
      }

      // 4. Canonical Alchemy Compendium & Custom Recipes
      if(typeof FAE_ALCHEMY_COMPENDIUM !== 'undefined' && Array.isArray(FAE_ALCHEMY_COMPENDIUM)){
        FAE_ALCHEMY_COMPENDIUM.forEach(function(ac){
          var an = (ac.name || '').toLowerCase();
          var ao = (ac.orig || '').toLowerCase();
          var ae = (ac.effect || '').toLowerCase();
          if(an.indexOf(q) !== -1 || ao.indexOf(q) !== -1 || ae.indexOf(q) !== -1){
            matches.push({
              badge: '📖 Справочник Алхимии D&D',
              title: ac.name + (ac.orig ? (' (' + ac.orig + ')') : ''),
              desc: ac.effect || 'Канонический алхимический предмет D&D',
              go: 'alchemyRef'
            });
          }
        });
      }
      if(Array.isArray(RECIPES)){
        RECIPES.forEach(function(rc){
          var rn = (rc.name || '').toLowerCase();
          var eff = (rc.effect || '').toLowerCase();
          if(rn.indexOf(q) !== -1 || eff.indexOf(q) !== -1){
            matches.push({
              badge: '⚗️ Мой рецепт алхимии',
              title: rc.name,
              desc: rc.effect || 'Пользовательский рецепт алхимии',
              go: 'recipes'
            });
          }
        });
      }

      // 5. Cover & Exhaustion
      if(typeof COVER_RULES !== 'undefined' && Array.isArray(COVER_RULES)){
        COVER_RULES.forEach(function(cr){
          if((cr.ru || '').toLowerCase().indexOf(q) !== -1 || (cr.desc || '').toLowerCase().indexOf(q) !== -1){
            matches.push({
              badge: '🛡️ Правило укрытия',
              title: cr.ru,
              desc: cr.desc,
              go: 'rules2024'
            });
          }
        });
      }

      // 6. Glossary
      if(typeof GLOSSARY !== 'undefined' && Array.isArray(GLOSSARY)){
        GLOSSARY.forEach(function(gl){
          var gru = (gl.ru || '').toLowerCase();
          var gorig = (gl.orig || '').toLowerCase();
          var gdesc = (gl.desc || '').toLowerCase();
          if(gru.indexOf(q) !== -1 || gorig.indexOf(q) !== -1 || gdesc.indexOf(q) !== -1){
            matches.push({
              badge: '📖 Глоссарий',
              title: gl.ru + (gl.orig ? (' (' + gl.orig + ')') : ''),
              desc: gl.desc,
              go: 'glossary'
            });
          }
        });
      }

      defaultCards.style.display = 'none';
      resultsContainer.style.display = 'block';

      if(matches.length === 0){
        resultsContainer.innerHTML = '<div style="background:rgba(22,26,32,0.8);border:1px solid rgba(201,164,92,0.25);border-radius:8px;padding:18px;text-align:center;color:#94a3b8;">' +
          'Ничего не найдено по запросу «' + escapeHtml(q) + '». Попробуйте изменить поисковое слово.' +
        '</div>';
      } else {
        var resHtml = '<div style="margin-bottom:10px;font-size:12px;color:#c9a45c;font-family:\'Cinzel\',serif;">' +
          'Найдено результатов: <b>' + matches.length + '</b>' +
        '</div><div class="menu-list">';
        matches.slice(0, 30).forEach(function(m){
          resHtml += '<div class="fae-ref-card fae-card-clickable" data-go="' + escapeAttr(m.go) + '" role="button" tabindex="0">' +
            '<div style="flex:1;min-width:0;">' +
              '<div style="font-size:11px;color:#c9a45c;font-weight:700;margin-bottom:2px;letter-spacing:0.05em;">' + escapeHtml(m.badge) + '</div>' +
              '<div class="fae-card-title" style="margin-bottom:3px;">' + escapeHtml(m.title) + '</div>' +
              '<div class="fae-card-desc">' + escapeHtml(m.desc) + '</div>' +
            '</div>' +
            '<div class="fae-card-arrow">→</div>' +
          '</div>';
        });
        resHtml += '</div>';
        resultsContainer.innerHTML = resHtml;

        resultsContainer.querySelectorAll('[data-go]').forEach(function(el){
          el.addEventListener('click', function(){
            navigate(this.getAttribute('data-go'));
          });
        });
      }
    });
  }
}

function renderFaeData(){
  var d = getActiveFaerunCharacter();
  var chars = Array.isArray(CHARACTERS) ? CHARACTERS : [d];
  var camp = loadFaerunCampaign();

  var isCollapsed = false;
  var activeTab = 'main';
  try{
    isCollapsed = localStorage.getItem('fae_sheet_collapsed') === '1';
    activeTab = localStorage.getItem('fae_sheet_tab') || 'main';
  }catch(e){}

  var charOptions = chars.map(function(c){
    var isSel = d && d.id === c.id;
    var sub = [c.species, c.className ? (c.className + ' ' + (c.level||1) + ' ур.') : null, c.subclass].filter(Boolean).join(' • ');
    return '<option value="' + escapeAttr(c.id) + '" ' + (isSel ? 'selected' : '') + '>' +
      getFaerunClassIcon(c.className) + ' ' + escapeHtml(c.name || 'Безымянный герой') + ' (' + escapeHtml(sub || 'Герой') + ')' +
    '</option>';
  }).join('');

  var pb = profBonus(d.level);
  var passivePerception = 10 + abilityMod(d.abilities.wis) + (Number(d.skillProf.perception)||0)*pb;
  var passiveInvestigation = 10 + abilityMod(d.abilities.int) + (Number(d.skillProf.investigation)||0)*pb;
  var passiveInsight = 10 + abilityMod(d.abilities.wis) + (Number(d.skillProf.insight)||0)*pb;
  var initTotal = abilityMod(d.abilities.dex) + Number(d.initMisc||0);
  var totalGp = ((Number(d.pp)||0)*10 + (Number(d.gp)||0) + (Number(d.ep)||0)*0.5 + (Number(d.sp)||0)*0.1 + (Number(d.cp)||0)*0.01).toFixed(2).replace(/\.00$/, '');

  var abilityBoxes = ABILITY_KEYS.map(function(k){ return faeAbilityBoxHtml(k, d); }).join('');
  var saveRows = ABILITY_KEYS.map(function(k){ return faeSaveRowHtml(k, d, pb); }).join('');
  var skillRows = SKILL_DEFS.map(function(def){ return faeSkillRowHtml(def, d, pb); }).join('');
  var attackRows = d.attacks.map(function(a, i){ return faeAttackRowHtml(a, i); }).join('');
  var slotBoxes = Array.from({length:9}, function(_, i){ return faeSlotBoxHtml(i+1, d); }).join('');

  var datalistsHtml =
    '<datalist id="faeSpeciesDatalist">' + FAE_SPECIES_LIST.map(function(s){ return '<option value="' + escapeAttr(s) + '">'; }).join('') + '</datalist>' +
    '<datalist id="faeClassesDatalist">' + FAE_CLASSES_LIST.map(function(s){ return '<option value="' + escapeAttr(s) + '">'; }).join('') + '</datalist>' +
    '<datalist id="faeBackgroundsDatalist">' + FAE_BACKGROUNDS_LIST.map(function(s){ return '<option value="' + escapeAttr(s) + '">'; }).join('') + '</datalist>' +
    '<datalist id="faeAlignmentsDatalist">' + FAE_ALIGNMENTS_LIST.map(function(s){ return '<option value="' + escapeAttr(s) + '">'; }).join('') + '</datalist>' +
    '<datalist id="faeMasteryDatalist">' + WEAPON_MASTERY.map(function(m){ return '<option value="' + escapeAttr(m.ru + ' (' + m.orig + ')') + '">'; }).join('') + '</datalist>';

  var showTab = function(tabName){
    return (activeTab === 'all' || activeTab === tabName) ? '' : 'display:none;';
  };

  var heroSectionHtml =
    datalistsHtml +
    '<div class="sheet-section fae-data-section">' +
      '<div class="section-label" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
        '<span>👤 РОСТЕР ОТРЯДА & ЛИСТ ПЕРСОНАЖА D&D 5E / 2024</span>' +
        '<span style="font-size:12px;color:var(--ink-dim);">Героев в ростере: <b>' + chars.length + '</b></span>' +
      '</div>' +
      '<p class="desc">Все персонажи Фаэруна создаются, редактируются и хранятся здесь. Выбранный герой автоматически отображается в главном HUD раздела, а все изменения в листе сохраняются мгновенно.</p>' +

      '<div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin:14px 0 14px 0;">' +
        '<div style="flex:1;min-width:250px;">' +
          '<label style="display:block;font-size:12px;color:#c9a45c;margin-bottom:4px;font-weight:600;font-family:\'Cinzel\',serif;">Активный искатель приключений:</label>' +
          '<select id="faeDataProfileSelect" style="width:100%;font-size:14px;padding:9px 12px;border-radius:4px;background:#0f172a;color:#f8fafc;border:1px solid rgba(201,164,92,0.45);">' +
            charOptions +
          '</select>' +
        '</div>' +
        '<div style="display:flex;gap:7px;flex-wrap:wrap;">' +
          '<button type="button" class="btn btn-primary" id="faeDataNewCharBtn" title="Создать нового персонажа в ростере">➕ Новый герой</button>' +
          '<button type="button" class="btn btn-ghost" id="faeDataCloneCharBtn" title="Дублировать текущего героя">📋 Дублировать</button>' +
          '<button type="button" class="btn btn-ghost" id="faeDataResetCharBtn" title="Сбросить характеристики текущего героя по умолчанию">🔄 Сбросить</button>' +
          '<button type="button" class="btn btn-ghost" id="faeDataCopyTextBtn" title="Скопировать текстовую анкету героя в буфер">📋 Текст</button>' +
          '<button type="button" class="btn btn-ghost" id="faeDataExportCharBtn" title="Скачать JSON только этого героя">⬇️ JSON героя</button>' +
          '<button type="button" class="btn btn-ghost" id="faeDataImportCharBtn" title="Импортировать карточку героя из JSON">⬆️ Импорт героя</button>' +
          '<input type="file" id="faeDataImportCharFile" accept="application/json,.json" style="display:none;">' +
          '<button type="button" class="btn btn-ghost" id="faeDataDelCharBtn" style="color:#f87171;border-color:rgba(239,68,68,0.4);" title="Удалить текущего героя из ростера">🗑️ Удалить</button>' +
        '</div>' +
      '</div>' +

      /* Складываемая карточка полного листа персонажа */
      '<div class="fae-data-card" id="faeCharSheetCard">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding-bottom:12px;border-bottom:1px solid rgba(201,164,92,0.25);">' +
          '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
            '<div id="faeSheetHeroTitle" style="font-size:15px;font-weight:700;color:#c9a45c;letter-spacing:0.06em;font-family:\'Cinzel\',serif;">' +
              getFaerunClassIcon(d.className) + ' ' + escapeHtml(d.name || 'Безымянный герой') + ' — ' + escapeHtml(d.className || 'Герой') + ' ' + d.level + ' ур.' +
            '</div>' +
            '<div id="faeSheetHeaderBadges" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">' +
              '<span class="fae-stat-badge">БМ ' + fmtMod(pb) + '</span>' +
              '<span class="fae-stat-badge hp">❤️ ' + d.hpMax + ' HP</span>' +
              '<span class="fae-stat-badge ac">🛡️ КД ' + d.ac + '</span>' +
              '<span class="fae-stat-badge">⚡ Иниц. ' + fmtMod(initTotal) + '</span>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="btn btn-ghost" id="faeCharSheetCollapseBtn" style="font-size:12px;padding:5px 12px;">' +
            (isCollapsed ? '▶ Развернуть лист героя' : '▼ Свернуть лист героя') +
          '</button>' +
        '</div>' +

        '<div id="faeCharSheetBody" style="' + (isCollapsed ? 'display:none;' : '') + 'padding-top:14px;">' +
          /* Вкладки листа персонажа */
          '<div class="fae-sheet-tabs" id="faeSheetTabs">' +
            '<button type="button" class="fae-sheet-tab ' + (activeTab==='main'?'active':'') + '" data-fae-tab="main">⚔️ Основное и Бой</button>' +
            '<button type="button" class="fae-sheet-tab ' + (activeTab==='stats'?'active':'') + '" data-fae-tab="stats">🎲 Характеристики и Навыки</button>' +
            '<button type="button" class="fae-sheet-tab ' + (activeTab==='spells'?'active':'') + '" data-fae-tab="spells">✨ Книга Заклинаний</button>' +
            '<button type="button" class="fae-sheet-tab ' + (activeTab==='gear'?'active':'') + '" data-fae-tab="gear">🎒 Снаряжение и Умения</button>' +
            '<button type="button" class="fae-sheet-tab ' + (activeTab==='bio'?'active':'') + '" data-fae-tab="bio">📜 Личность и Биография</button>' +
            '<button type="button" class="fae-sheet-tab ' + (activeTab==='all'?'active':'') + '" data-fae-tab="all">👁️ Весь лист сразу</button>' +
          '</div>' +

          /* ВКЛАДКА 1: ОСНОВНОЕ И БОЙ */
          '<div class="fae-sheet-pane" data-fae-pane="main" style="' + showTab('main') + 'padding-top:12px;">' +
            '<div class="section-label" style="margin-top:4px;">📋 Личность и Происхождение (D&D 2024)</div>' +
            '<div class="sheet-grid">' +
              '<div class="field"><label>Имя персонажа</label><input type="text" data-field="name" value="' + escapeAttr(d.name) + '" placeholder="Напр. Дзирт До\'Урден"></div>' +
              '<div class="field"><label>Имя игрока</label><input type="text" data-field="playerName" value="' + escapeAttr(d.playerName) + '" placeholder="Необязательно"></div>' +
              '<div class="field"><label>Вид (Раса / Наследие)</label><input type="text" list="faeSpeciesDatalist" data-field="species" value="' + escapeAttr(d.species) + '" placeholder="Человек, Эльф, Тифлинг..."></div>' +
              '<div class="field">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                  '<label>Класс</label>' +
                  '<button type="button" id="faeApplyClassDefaultsBtn" style="background:none;border:none;color:#c9a45c;font-size:10.5px;cursor:pointer;padding:0;text-decoration:underline;" title="Автоматически выставить кость хитов, спасброски и владения выбранного класса">⚡ Авто-владения</button>' +
                '</div>' +
                '<input type="text" list="faeClassesDatalist" data-field="className" value="' + escapeAttr(d.className) + '" placeholder="Воин, Волшебник, Паладин...">' +
              '</div>' +
              '<div class="field"><label>Подкласс / Архетип</label><input type="text" data-field="subclass" value="' + escapeAttr(d.subclass) + '" placeholder="Напр. Мастер боевых искусств"></div>' +
              '<div class="field"><label>Предыстория</label><input type="text" list="faeBackgroundsDatalist" data-field="background" value="' + escapeAttr(d.background) + '" placeholder="Солдат, Мудрец, Преступник..."></div>' +
              '<div class="field"><label>Мировоззрение</label><input type="text" list="faeAlignmentsDatalist" data-field="alignment" value="' + escapeAttr(d.alignment) + '" placeholder="Нейтрально-добрый"></div>' +
              '<div class="field"><label>Уровень (1–20)</label><input type="number" min="1" max="20" data-field="level" value="' + d.level + '"></div>' +
              '<div class="field"><label>Опыт (XP)</label><input type="number" min="0" data-field="xp" value="' + d.xp + '"></div>' +
              '<div class="field"><label>Бонус мастерства</label><div class="readonly-val" id="pbVal" style="padding-top:8px;font-family:\'Cinzel\',serif;font-size:18px;color:#c9a45c;font-weight:700;">' + fmtMod(pb) + '</div></div>' +
            '</div>' +

            '<div class="section-label" style="margin-top:20px;">🛡️ Боевые параметры и Здоровье</div>' +
            '<div class="combat-strip">' +
              '<div class="combat-box"><span class="cb-label">КД (Броня)</span><input type="number" data-field="ac" value="' + d.ac + '"></div>' +
              '<div class="combat-box"><span class="cb-label">Инициатива</span><div class="readonly-val" id="initTotal">' + fmtMod(initTotal) + '</div></div>' +
              '<div class="combat-box"><span class="cb-label">Бонус Иниц.</span><input type="number" data-field="initMisc" value="' + (d.initMisc||0) + '" title="Дополнительный бонус к инициативе (напр. от черты Бдительный)"></div>' +
              '<div class="combat-box"><span class="cb-label">Скорость (фт)</span><input type="number" data-field="speed" value="' + d.speed + '"></div>' +
              '<div class="combat-box"><span class="cb-label">Хиты (HP)</span><input type="number" id="faeSheetHpMax" data-field="hpMax" value="' + d.hpMax + '" style="color:#fca5a5;font-weight:700;"></div>' +
              '<div class="combat-box"><span class="cb-label">Кости хитов</span><input type="text" data-field="hitDiceTotal" value="' + escapeAttr(String(d.hitDiceTotal)) + '"></div>' +
              '<div class="combat-box"><span class="cb-label">Тип кости</span><input type="text" data-field="hitDiceType" value="' + escapeAttr(d.hitDiceType) + '" placeholder="d10"></div>' +
              '<div class="combat-box"><span class="cb-label">Пасс. Воспр.</span><div class="readonly-val" id="passivePerception">' + passivePerception + '</div></div>' +
              '<div class="combat-box"><span class="cb-label">Пасс. Рассл.</span><div class="readonly-val" id="passiveInvestigation">' + passiveInvestigation + '</div></div>' +
              '<div class="combat-box"><span class="cb-label">Пасс. Прониц.</span><div class="readonly-val" id="passiveInsight">' + passiveInsight + '</div></div>' +
            '</div>' +

            /* Оружие и атаки в бою */
            '<div class="section-label" style="margin-top:20px;">⚔️ Оружие, Заговоры и Атаки (с Мастерством оружия 2024)</div>' +
            '<div id="attacksList">' + attackRows + '</div>' +
            '<button type="button" class="add-row-btn" id="addAttackBtn">+ Добавить оружие или атаку</button>' +
          '</div>' +

          /* ВКЛАДКА 2: ХАРАКТЕРИСТИКИ, СПАСБРОСКИ И НАВЫКИ */
          '<div class="fae-sheet-pane" data-fae-pane="stats" style="' + showTab('stats') + 'padding-top:12px;">' +
            '<div class="section-label" style="margin-top:4px;">🎲 6 Основных Характеристик</div>' +
            '<div class="ability-row">' + abilityBoxes + '</div>' +

            '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:20px;margin-top:20px;">' +
              '<div>' +
                '<div class="section-label" style="margin-top:0;">🛡️ Спасброски</div>' +
                '<div style="background:rgba(15,23,42,0.5);border:1px solid rgba(201,164,92,0.2);border-radius:6px;padding:8px 12px;">' +
                  saveRows +
                '</div>' +
              '</div>' +
              '<div>' +
                '<div class="section-label" style="margin-top:0;">🎯 Навыки (Клик по кружку: Нет → Владение → Экспертиза)</div>' +
                '<div style="background:rgba(15,23,42,0.5);border:1px solid rgba(201,164,92,0.2);border-radius:6px;padding:8px 12px;">' +
                  skillRows +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          /* ВКЛАДКА 3: КНИГА ЗАКЛИНАНИЙ И ЯЧЕЙКИ */
          '<div class="fae-sheet-pane" data-fae-pane="spells" style="' + showTab('spells') + 'padding-top:12px;">' +
            '<div class="section-label" style="margin-top:4px;">✨ Магия, СЛ Спасброска и Ячейки Заклинаний</div>' +
            '<div class="spell-toggle-row" style="margin-bottom:14px;">' +
              '<input type="checkbox" id="spellEnabledCk" data-field="spellEnabled" ' + (d.spellEnabled ? 'checked' : '') + '>' +
              '<label for="spellEnabledCk" style="font-size:14.5px;color:#f8fafc;cursor:pointer;">Персонаж использует заклинания (Заклинатель / Пакт / Полузаклинатель)</label>' +
            '</div>' +
            '<div id="spellBlock" style="' + (d.spellEnabled ? '' : 'opacity:0.85;') + '">' +
              '<div class="sheet-grid" style="margin-bottom:16px;">' +
                '<div class="field">' +
                  '<label>Базовая магическая характеристика</label>' +
                  '<select data-field="spellAbility">' +
                    ABILITY_KEYS.map(function(k){ return '<option value="' + k + '" ' + (d.spellAbility===k?'selected':'') + '>' + ABILITY_RU[k] + '</option>'; }).join('') +
                  '</select>' +
                '</div>' +
                '<div class="field"><label>СЛ спасброска (8 + БМ + Мод)</label><div class="readonly-val" id="spellDC" style="padding-top:8px;font-family:\'Cinzel\',serif;font-size:19px;color:#c9a45c;font-weight:700;">' + (8+pb+abilityMod(d.abilities[d.spellAbility])) + '</div></div>' +
                '<div class="field"><label>Бонус атаки заклинанием</label><div class="readonly-val" id="spellAtk" style="padding-top:8px;font-family:\'Cinzel\',serif;font-size:19px;color:#c9a45c;font-weight:700;">' + fmtMod(pb+abilityMod(d.abilities[d.spellAbility])) + '</div></div>' +
              '</div>' +
              '<div style="margin-bottom:8px;">' +
                '<span style="font-size:11.5px;color:#94a3b8;font-family:\'JetBrains Mono\',monospace;">ЯЧЕЙКИ ЗАКЛИНАНИЙ ПО КРУГАМ (1–9 КРУГ):</span>' +
              '</div>' +
              '<div class="slot-grid">' + slotBoxes + '</div>' +
              '<div class="field"><label>Заговоры и подготовленные / известные заклинания</label><textarea data-field="spellNotes" style="min-height:130px;" placeholder="Заговоры: Огненный снаряд, Малая иллюзия...\n1 круг: Щит, Волшебная стрела...">' + escapeHtml(d.spellNotes) + '</textarea></div>' +
            '</div>' +
          '</div>' +

          /* ВКЛАДКА 4: СНАРЯЖЕНИЕ, МОНЕТЫ И УМЕНИЯ */
          '<div class="fae-sheet-pane" data-fae-pane="gear" style="' + showTab('gear') + 'padding-top:12px;">' +
            '<div class="section-label" style="margin-top:4px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;">' +
              '<span>🪙 Кошелёк и Монеты Фаэруна</span>' +
              '<span style="font-size:12px;color:#fbbf24;">Всего в пересчёте на золото: <b id="faeGoldTotal">' + totalGp + ' ЗМ</b></span>' +
            '</div>' +
            '<div class="currency-row">' +
              '<div class="field"><label>ММ (Медь)</label><input type="number" min="0" data-field="cp" value="' + d.cp + '"></div>' +
              '<div class="field"><label>СМ (Серебро)</label><input type="number" min="0" data-field="sp" value="' + d.sp + '"></div>' +
              '<div class="field"><label>ЭМ (Электрум)</label><input type="number" min="0" data-field="ep" value="' + d.ep + '"></div>' +
              '<div class="field"><label>ЗМ (Золото)</label><input type="number" min="0" data-field="gp" value="' + d.gp + '"></div>' +
              '<div class="field"><label>ПМ (Платина)</label><input type="number" min="0" data-field="pp" value="' + d.pp + '"></div>' +
            '</div>' +

            '<div class="section-label" style="margin-top:20px;">🛡️ Владения и Языки</div>' +
            '<div class="sheet-grid">' +
              '<div class="field"><label>Доспехи и щиты</label><input type="text" data-field="profArmor" value="' + escapeAttr(d.profArmor) + '"></div>' +
              '<div class="field"><label>Оружие</label><input type="text" data-field="profWeapons" value="' + escapeAttr(d.profWeapons) + '"></div>' +
              '<div class="field"><label>Инструменты</label><input type="text" data-field="profTools" value="' + escapeAttr(d.profTools) + '"></div>' +
              '<div class="field"><label>Языки</label><input type="text" data-field="languages" value="' + escapeAttr(d.languages) + '"></div>' +
            '</div>' +

            '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;margin-top:20px;">' +
              '<div class="field"><label>⚡ Классовые умения, черты (Feats) и особенности вида</label><textarea data-field="features" style="min-height:140px;" placeholder="Особенности класса, черты происхождения, боевые стили...">' + escapeHtml(d.features) + '</textarea></div>' +
              '<div class="field"><label>🎒 Снаряжение, магические предметы и зелья</label><textarea data-field="equipment" style="min-height:140px;" placeholder="Доспехи, рюкзак, зелья лечения, магические реликвии...">' + escapeHtml(d.equipment) + '</textarea></div>' +
            '</div>' +
          '</div>' +

          /* ВКЛАДКА 5: ЛИЧНОСТЬ, ВНЕШНОСТЬ И ИСТОРИЯ */
          '<div class="fae-sheet-pane" data-fae-pane="bio" style="' + showTab('bio') + 'padding-top:12px;">' +
            '<div class="section-label" style="margin-top:4px;">🎭 Характер и Мировоззрение</div>' +
            '<div class="sheet-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr));">' +
              '<div class="field"><label>Черты характера</label><textarea data-field="traits">' + escapeHtml(d.traits) + '</textarea></div>' +
              '<div class="field"><label>Идеалы</label><textarea data-field="ideals">' + escapeHtml(d.ideals) + '</textarea></div>' +
              '<div class="field"><label>Привязанности</label><textarea data-field="bonds">' + escapeHtml(d.bonds) + '</textarea></div>' +
              '<div class="field"><label>Слабости</label><textarea data-field="flaws">' + escapeHtml(d.flaws) + '</textarea></div>' +
            '</div>' +

            '<div class="section-label" style="margin-top:20px;">👤 Внешность и Биография</div>' +
            '<div class="sheet-grid">' +
              '<div class="field"><label>Возраст</label><input type="text" data-field="age" value="' + escapeAttr(d.age) + '"></div>' +
              '<div class="field"><label>Рост</label><input type="text" data-field="height" value="' + escapeAttr(d.height) + '"></div>' +
              '<div class="field"><label>Вес</label><input type="text" data-field="weight" value="' + escapeAttr(d.weight) + '"></div>' +
              '<div class="field"><label>Глаза</label><input type="text" data-field="eyes" value="' + escapeAttr(d.eyes) + '"></div>' +
              '<div class="field"><label>Кожа</label><input type="text" data-field="skin" value="' + escapeAttr(d.skin) + '"></div>' +
              '<div class="field"><label>Волосы</label><input type="text" data-field="hair" value="' + escapeAttr(d.hair) + '"></div>' +
            '</div>' +
            '<div class="field" style="margin-top:12px;"><label>📜 История персонажа и квента</label><textarea data-field="backstory" style="min-height:130px;">' + escapeHtml(d.backstory) + '</textarea></div>' +
          '</div>' +

          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-top:18px;padding-top:14px;border-top:1px solid rgba(201,164,92,0.25);">' +
            '<button type="button" class="btn btn-primary" id="faeDataSaveCharBtn">💾 Сохранить лист героя</button>' +
            '<span style="font-size:12px;color:#94a3b8;font-style:italic;">Автосохранение включено — все правки сразу записываются в профиль</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  var curKey = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Данные & Кампания'}]) +
    '<button class="back" data-go="home">← На главную</button>' +
    '<h1>💾 Данные & Кампания</h1>' +
    '<p class="subtitle">Ростер и полный лист персонажа D&D 5e / 2024, хроники приключения, интеграция Gemini AI, квота памяти и резервные копии.</p>' +
    '<div class="fae-rule"></div>' +

    heroSectionHtml +

    '<div class="sheet-section fae-data-section">' +
      '<div class="section-label">📜 ХРОНИКИ КАМПАНИИ & ЗАМЕТКИ МАСТЕРА</div>' +
      '<div class="desc">Сюжетные события, цели партии, открытые квесты, слухи в тавернах и памятки для ведущего.</div>' +
      '<div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:10px;">' +
        '<div>' +
          '<label style="display:block;font-size:11.5px;color:#c9a45c;margin-bottom:4px;font-family:\'Cinzel\',serif;">Название приключения / модуля:</label>' +
          '<input type="text" id="faeCampaignTitle" value="' + escapeAttr(camp.title || '') + '" style="width:100%;box-sizing:border-box;padding:9px 12px;background:#0b0f17;border:1px solid rgba(201,164,92,0.3);color:#fff;border-radius:4px;">' +
        '</div>' +
        '<div>' +
          '<label style="display:block;font-size:11.5px;color:#c9a45c;margin-bottom:4px;font-family:\'Cinzel\',serif;">Текущая локация / город:</label>' +
          '<input type="text" id="faeCampaignLocation" value="' + escapeAttr(camp.location || '') + '" style="width:100%;box-sizing:border-box;padding:9px 12px;background:#0b0f17;border:1px solid rgba(201,164,92,0.3);color:#fff;border-radius:4px;">' +
        '</div>' +
      '</div>' +
      '<div style="margin-top:10px;">' +
        '<label style="display:block;font-size:11.5px;color:#c9a45c;margin-bottom:4px;font-family:\'Cinzel\',serif;">Заметки партии и журнал событий:</label>' +
        '<textarea id="faeCampaignNotes" rows="5" style="width:100%;box-sizing:border-box;padding:10px 12px;background:#0b0f17;border:1px solid rgba(201,164,92,0.3);color:#cbd5e1;border-radius:4px;font-family:\'EB Garamond\',serif;font-size:14px;line-height:1.5;">' + escapeHtml(camp.notes || '') + '</textarea>' +
      '</div>' +
      '<div style="margin-top:12px;">' +
        '<button class="btn btn-primary" id="faeSaveCampaignBtn">💾 Сохранить заметки кампании</button>' +
      '</div>' +
    '</div>' +

    '<div class="sheet-section fae-data-section" id="faeGeminiSection">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
        '<span style="font-size:22px;">🤖</span>' +
        '<div>' +
          '<div style="font-weight:700;font-size:13.5px;color:#c9a45c;font-family:\'Cinzel\',serif;">GOOGLE GEMINI AI // СТАНДАРТ GEMINI-4-ARGON</div>' +
          '<div style="font-size:12px;color:#94a3b8;">Генератор квестов, НПС, оружия, брони, бестиария, локаций, алхимии, заклинаний, артефактов и черт Фаэруна</div>' +
        '</div>' +
      '</div>' +
      '<p style="font-size:12px;color:#cbd5e1;line-height:1.45;margin:0 0 12px 0;">' +
        'Ключ хранится исключительно локально в браузере. Бесплатный ключ создаётся в <a href="https://aistudio.google.com/" target="_blank" style="color:#f59e0b;text-decoration:underline;">Google AI Studio</a>.' +
      '</p>' +
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">' +
        '<input type="password" id="faeDataGeminiKey" value="' + escapeAttr(curKey) + '" placeholder="Вставьте ключ AIzaSy..." style="flex:1;min-width:220px;box-sizing:border-box;background:#0b0f17;border:1px solid rgba(201,164,92,0.35);color:#fff;padding:9px 12px;border-radius:4px;font-family:monospace;font-size:13px;">' +
        '<button class="btn btn-primary" id="faeSaveGeminiKeyBtn">💾 Сохранить API Ключ</button>' +
      '</div>' +
    '</div>' +

    (typeof AppStorage !== 'undefined' ? AppStorage.renderWidget('fae') : '') +

    '<div class="sheet-section fae-data-section">' +
      '<div class="section-label">📦 ПОЛНЫЙ ЭКСПОРТ И ИМПОРТ D&D 5E</div>' +
      '<div class="desc">' +
        'Резервная копия сохраняет весь мир Фаэруна: карточки всех героев ростера, базу заклинаний, рецепты алхимии, склад трав, архив ИИ-генераций и журнал кампании в один JSON-файл.' +
      '</div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">' +
        '<button class="btn btn-primary" id="faeExportAllBtn">📥 Экспорт в файл JSON</button>' +
        '<button class="btn btn-ghost" id="faeImportBtn">📤 Импорт из файла JSON</button>' +
        '<input type="file" id="faeImportFile" accept="application/json,.json" style="display:none;">' +
      '</div>' +
    '</div>' +

    (typeof GHSync !== 'undefined' && typeof GHSync.renderUI === 'function' ? GHSync.renderUI() : '');
}

function exportAllFaerunData(){
  try{
    var payload = {
      kind: 'faerun',
      version: 2,
      exportedAt: new Date().toISOString(),
      activeCharId: localStorage.getItem('ttc_faerun_active_id') || '',
      campaign: loadFaerunCampaign(),
      characters: Array.isArray(CHARACTERS) ? CHARACTERS : [],
      spells: Array.isArray(SPELLS) ? SPELLS : [],
      recipes: Array.isArray(RECIPES) ? RECIPES : [],
      ingredients: Array.isArray(INGREDIENTS) ? INGREDIENTS : [],
      aiHistory: loadFaeAiHistory()
    };
    var jsonStr = JSON.stringify(payload, null, 2);
    var blob = new Blob([jsonStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var dateStr = new Date().toISOString().slice(0,10);
    a.href = url;
    a.download = 'faerun_dnd_backup_' + dateStr + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }catch(e){
    alert('Ошибка экспорта: ' + e.message);
  }
}

function importAllFaerunData(file){
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(e){
    try{
      var data = JSON.parse(e.target.result);
      if(!data || typeof data !== 'object'){
        alert('Ошибка: файл не является корректным JSON.');
        return;
      }
      var countChars = 0, countSpells = 0, countRecipes = 0;
      if(Array.isArray(data.characters)){
        CHARACTERS = data.characters.map(normalizeFaerunCharacter);
        saveCharactersToStorage();
        countChars = CHARACTERS.length;
      }
      if(Array.isArray(data.spells)){
        SPELLS = data.spells;
        saveSpellsToStorage();
        countSpells = SPELLS.length;
      }
      if(Array.isArray(data.recipes)){
        RECIPES = data.recipes;
        saveRecipesToStorage();
        countRecipes = RECIPES.length;
      }
      if(Array.isArray(data.ingredients)){
        INGREDIENTS = data.ingredients;
        saveIngredientsToStorage();
      }
      if(Array.isArray(data.aiHistory)){
        saveFaeAiHistory(data.aiHistory);
      }
      if(data.campaign && typeof data.campaign === 'object'){
        saveFaerunCampaign(data.campaign);
      }
      if(data.activeCharId){
        setActiveFaerunCharacter(data.activeCharId);
      } else if(CHARACTERS.length > 0){
        setActiveFaerunCharacter(CHARACTERS[0].id);
      }
      alert('✓ Данные Фаэруна успешно импортированы!\n' +
        '• Персонажей: ' + countChars + '\n' +
        '• Заклинаний: ' + countSpells + '\n' +
        '• Рецептов: ' + countRecipes);
      render();
    }catch(err){
      alert('Ошибка чтения файла резервной копии: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function wireFaeData(){
  var g = function(id){ return document.getElementById(id); };

  if(typeof AppStorage !== 'undefined' && AppStorage.wireWidget) AppStorage.wireWidget('fae');
  if(typeof GHSync !== 'undefined' && typeof GHSync.wireUI === 'function') GHSync.wireUI();

  var sel = g('faeDataProfileSelect');
  if(sel){
    sel.addEventListener('change', function(){
      setActiveFaerunCharacter(this.value);
      render();
    });
  }

  var newBtn = g('faeDataNewCharBtn');
  if(newBtn){
    newBtn.addEventListener('click', function(){
      var rawName = prompt('Введите имя нового искателя приключений:', 'Герой ' + (CHARACTERS.length + 1));
      if(rawName === null) return;
      var created = newCharacter({ name: rawName.trim() || ('Герой ' + (CHARACTERS.length + 1)) });
      CHARACTERS.push(created);
      saveCharactersToStorage();
      setActiveFaerunCharacter(created.id);
      try{ localStorage.setItem('fae_sheet_collapsed', '0'); }catch(e){}
      render();
    });
  }

  var cloneBtn = g('faeDataCloneCharBtn');
  if(cloneBtn){
    cloneBtn.addEventListener('click', function(){
      var active = getActiveFaerunCharacter();
      if(!active) return;
      var copy = normalizeFaerunCharacter(JSON.parse(JSON.stringify(active)));
      copy.id = genId();
      copy.name = (copy.name || 'Герой') + ' (Копия)';
      CHARACTERS.push(copy);
      saveCharactersToStorage();
      setActiveFaerunCharacter(copy.id);
      render();
    });
  }

  var resetBtn = g('faeDataResetCharBtn');
  if(resetBtn){
    resetBtn.addEventListener('click', function(){
      var active = getActiveFaerunCharacter();
      if(!active) return;
      if(!confirm('Сбросить все параметры персонажа «' + (active.name || 'Герой') + '» к начальным значениям 1 уровня?')) return;
      var fresh = newCharacter({ id: active.id, name: active.name });
      var idx = CHARACTERS.findIndex(function(c){ return c.id === active.id; });
      if(idx >= 0) CHARACTERS[idx] = fresh;
      saveCharactersToStorage();
      render();
    });
  }

  var copyTextBtn = g('faeDataCopyTextBtn');
  if(copyTextBtn){
    copyTextBtn.addEventListener('click', function(){
      copyCharacterAsText();
      var old = copyTextBtn.textContent;
      copyTextBtn.textContent = '✓ Скопировано';
      setTimeout(function(){ copyTextBtn.textContent = old; }, 1200);
    });
  }

  var expCharBtn = g('faeDataExportCharBtn');
  if(expCharBtn){
    expCharBtn.addEventListener('click', exportCharacterJson);
  }

  var impCharBtn = g('faeDataImportCharBtn');
  var impCharFile = g('faeDataImportCharFile');
  if(impCharBtn && impCharFile){
    impCharBtn.addEventListener('click', function(){ impCharFile.click(); });
    impCharFile.addEventListener('change', function(){
      if(this.files && this.files[0]){
        importCharacterFromFile(this.files[0]);
        this.value = '';
      }
    });
  }

  var delBtn = g('faeDataDelCharBtn');
  if(delBtn){
    delBtn.addEventListener('click', function(){
      var active = getActiveFaerunCharacter();
      if(!active) return;
      if(!confirm('Удалить персонажа «' + (active.name || 'Безымянный') + '» из ростера? Это действие необратимо.')) return;
      CHARACTERS = CHARACTERS.filter(function(c){ return c.id !== active.id; });
      if(CHARACTERS.length === 0){
        CHARACTERS = [newCharacter()];
      }
      saveCharactersToStorage();
      setActiveFaerunCharacter(CHARACTERS[0].id);
      render();
    });
  }

  var collapseBtn = g('faeCharSheetCollapseBtn');
  var sheetBody = g('faeCharSheetBody');
  if(collapseBtn && sheetBody){
    collapseBtn.addEventListener('click', function(){
      var isHidden = sheetBody.style.display === 'none';
      sheetBody.style.display = isHidden ? '' : 'none';
      collapseBtn.textContent = isHidden ? '▼ Свернуть лист героя' : '▶ Развернуть лист героя';
      try{ localStorage.setItem('fae_sheet_collapsed', isHidden ? '0' : '1'); }catch(e){}
    });
  }

  /* Переключение вкладок внутри листа персонажа */
  var tabsWrap = g('faeSheetTabs');
  if(tabsWrap){
    tabsWrap.querySelectorAll('[data-fae-tab]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var tab = this.getAttribute('data-fae-tab');
        try{ localStorage.setItem('fae_sheet_tab', tab); }catch(e){}
        tabsWrap.querySelectorAll('[data-fae-tab]').forEach(function(b){
          b.classList.toggle('active', b.getAttribute('data-fae-tab') === tab);
        });
        document.querySelectorAll('.fae-sheet-pane').forEach(function(pane){
          var pName = pane.getAttribute('data-fae-pane');
          pane.style.display = (tab === 'all' || tab === pName) ? '' : 'none';
        });
      });
    });
  }

  /* Авто-владения выбранного класса */
  var applyClsBtn = g('faeApplyClassDefaultsBtn');
  if(applyClsBtn){
    applyClsBtn.addEventListener('click', function(){
      var d = getActiveFaerunCharacter();
      if(!d) return;
      var clsName = (d.className || '').trim();
      var def = FAE_CLASS_DEFAULTS[clsName];
      if(!def){
        var foundKey = Object.keys(FAE_CLASS_DEFAULTS).find(function(k){ return clsName.toLowerCase().indexOf(k.toLowerCase()) !== -1; });
        if(foundKey) def = FAE_CLASS_DEFAULTS[foundKey];
      }
      if(!def){
        alert('Выберите один из 13 классов D&D в поле «Класс» (Воин, Варвар, Плут, Монах, Паладин, Следопыт, Жрец, Друид, Бард, Чародей, Колдун, Волшебник, Изобретатель), чтобы применить его базовые владения.');
        return;
      }
      d.hitDiceType = def.hd;
      d.hitDiceTotal = d.level;
      ABILITY_KEYS.forEach(function(k){ d.saveProf[k] = def.saves.indexOf(k) !== -1; });
      d.profArmor = def.armor;
      d.profWeapons = def.weapons;
      d.spellEnabled = def.spell;
      d.spellAbility = def.spellAb;
      saveCharactersToStorage();
      render();
    });
  }

  /* Реактивное редактирование всех полей листа персонажа */
  var sheetCard = g('faeCharSheetCard');
  if(sheetCard){
    sheetCard.addEventListener('input', function(e){
      var d = getActiveFaerunCharacter();
      if(!d) return;
      var t = e.target;
      var field = t.getAttribute('data-field');
      if(field){
        var val = t.type === 'number' ? Number(t.value) : t.value;
        setPath(d, field, val);
        if(field === 'hpMax') d.hpCurrent = val;
        saveCharactersToStorage();
        recomputeDerived();
        if(field === 'name' || field === 'className' || field === 'level' || field === 'species'){
          var opt = sel ? sel.querySelector('option[value="' + d.id + '"]') : null;
          if(opt){
            var sub = [d.species, d.className ? (d.className + ' ' + (d.level||1) + ' ур.') : null, d.subclass].filter(Boolean).join(' • ');
            opt.textContent = getFaerunClassIcon(d.className) + ' ' + (d.name || 'Безымянный герой') + ' (' + (sub || 'Герой') + ')';
          }
          if(typeof paintShBar === 'function') paintShBar();
        }
        return;
      }
      var aIdx = t.getAttribute('data-attack-idx');
      if(aIdx !== null){
        var f = t.getAttribute('data-attack-field');
        if(d.attacks[Number(aIdx)]){
          d.attacks[Number(aIdx)][f] = t.value;
          saveCharactersToStorage();
        }
        return;
      }
      var slotLvl = t.getAttribute('data-slot-level');
      if(slotLvl !== null){
        d.slots[slotLvl] = Number(t.value) || 0;
        saveCharactersToStorage();
        return;
      }
    });

    sheetCard.addEventListener('change', function(e){
      var d = getActiveFaerunCharacter();
      if(!d) return;
      var t = e.target;
      var field = t.getAttribute('data-field');
      if(field && t.type === 'checkbox'){
        setPath(d, field, t.checked);
        saveCharactersToStorage();
        recomputeDerived();
        if(field === 'spellEnabled'){
          var block = g('spellBlock');
          if(block) block.style.opacity = t.checked ? '1' : '0.85';
        }
      } else if(field && t.tagName === 'SELECT'){
        setPath(d, field, t.value);
        saveCharactersToStorage();
        recomputeDerived();
      }
    });

    sheetCard.addEventListener('click', function(e){
      var d = getActiveFaerunCharacter();
      if(!d) return;

      var profBtn = e.target.closest('.prof-toggle');
      if(profBtn){
        var key = profBtn.getAttribute('data-skill-toggle');
        var cur = Number(d.skillProf[key]) || 0;
        var next = (cur + 1) % 3;
        d.skillProf[key] = next;
        profBtn.setAttribute('data-state', next);
        saveCharactersToStorage();
        recomputeDerived();
        return;
      }

      var rmAtk = e.target.closest('[data-remove-attack]');
      if(rmAtk){
        removeAttackRow(Number(rmAtk.getAttribute('data-remove-attack')));
        return;
      }
    });

    var addAtkBtn = g('addAttackBtn');
    if(addAtkBtn) addAtkBtn.addEventListener('click', addAttackRow);
  }

  var saveCharBtn = g('faeDataSaveCharBtn');
  if(saveCharBtn){
    saveCharBtn.addEventListener('click', function(){
      saveCharactersToStorage();
      if(typeof paintShBar === 'function') paintShBar();
      var old = saveCharBtn.textContent;
      saveCharBtn.textContent = '✓ Изменения сохранены!';
      setTimeout(function(){ saveCharBtn.textContent = old; }, 1400);
    });
  }

  var saveCampBtn = g('faeSaveCampaignBtn');
  if(saveCampBtn){
    saveCampBtn.addEventListener('click', function(){
      var titleEl = g('faeCampaignTitle');
      var locEl = g('faeCampaignLocation');
      var notesEl = g('faeCampaignNotes');
      var camp = {
        title: titleEl ? titleEl.value.trim() : '',
        location: locEl ? locEl.value.trim() : '',
        notes: notesEl ? notesEl.value.trim() : ''
      };
      saveFaerunCampaign(camp);
      alert('✓ Заметки кампании сохранены!');
    });
  }

  var saveKeyBtn = g('faeSaveGeminiKeyBtn');
  if(saveKeyBtn){
    saveKeyBtn.addEventListener('click', function(){
      var inp = g('faeDataGeminiKey');
      var key = inp ? inp.value.trim() : '';
      if(typeof window.saveGeminiApiKey === 'function'){
        window.saveGeminiApiKey(key);
      } else {
        try{
          if(key){
            localStorage.setItem('ttc_gemini_api_key', key);
            localStorage.setItem('gemini_api_key', key);
          } else {
            localStorage.removeItem('ttc_gemini_api_key');
            localStorage.removeItem('gemini_api_key');
          }
        }catch(e){}
      }
      alert(key ? '✓ API-ключ Gemini успешно сохранён!' : 'API-ключ удалён.');
    });
  }

  var expBtn = g('faeExportAllBtn');
  if(expBtn){
    expBtn.addEventListener('click', function(){
      exportAllFaerunData();
    });
  }

  var impBtn = g('faeImportBtn');
  var impFile = g('faeImportFile');
  if(impBtn && impFile){
    impBtn.addEventListener('click', function(){
      impFile.click();
    });
    impFile.addEventListener('change', function(){
      if(this.files && this.files[0]){
        importAllFaerunData(this.files[0]);
        this.value = '';
      }
    });
  }
}

function wireEvents(){
  document.querySelectorAll('[data-go]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const val = el.getAttribute('data-go');
      navigate(val);
    });
  });
  document.querySelectorAll('[data-nav]').forEach(el=>{
    const val = el.getAttribute('data-nav');
    if(val) el.addEventListener('click', ()=>navigate(val));
  });
  document.querySelectorAll('.card').forEach(el=>{
    el.addEventListener('click', ()=>{
      const text = el.getAttribute('data-copy');
      if(text===null) return; // карточка-ссылка (data-go) обрабатывается отдельно
      copyText(text);
      el.classList.remove('stamped');
      void el.offsetWidth; // restart animation
      el.classList.add('stamped');
      clearTimeout(el._t);
      el._t = setTimeout(()=>el.classList.remove('stamped'), 850);
    });
  });
  document.querySelectorAll('.gen-btn').forEach(el=>{
    el.addEventListener('click', (e)=>{
      e.stopPropagation();
      handleGenerateClick(el);
    });
  });
  document.querySelectorAll('.pill[data-weapon]').forEach(el=>{
    el.addEventListener('click', ()=>{
      view.weapon = el.getAttribute('data-weapon');
      render();
    });
  });
  document.querySelectorAll('.map-source-pill').forEach(el=>{
    el.addEventListener('click', ()=>{
      const id = el.getAttribute('data-map-src');
      view.mapId = id;
      const src = MAP_SOURCES.find(m=>m.id===id);
      if(!src) return;
      document.querySelectorAll('.map-source-pill').forEach(p=>p.classList.toggle('active', p===el));
      const iframe = document.getElementById('mapIframe');
      if(iframe) iframe.src = src.url;
      const fallback = document.getElementById('mapFallbackLink');
      if(fallback) fallback.href = src.url;
      const wrap = document.getElementById('mapFrameWrap');
      if(wrap) wrap.classList.remove('inverted');
      const darkBtn = document.getElementById('mapDarkToggle');
      if(darkBtn){ darkBtn.classList.remove('active'); darkBtn.textContent = '🌙 Тёмные цвета карты'; }
    });
  });
  const mapToggle = document.getElementById('mapDarkToggle');
  if(mapToggle){
    mapToggle.addEventListener('click', ()=>{
      const wrap = document.getElementById('mapFrameWrap');
      if(!wrap) return;
      const on = wrap.classList.toggle('inverted');
      mapToggle.classList.toggle('active', on);
      mapToggle.textContent = on ? '☀️ Вернуть обычные цвета' : '🌙 Тёмные цвета карты';
    });
  }
  document.querySelectorAll('.die-btn[data-sides]').forEach(el=>{
    if(el._wiredSides) return;
    el._wiredSides = true;
    el.addEventListener('click', ()=>{
      const raw = el.getAttribute('data-sides');
      addDie(raw === 'coin' ? 'coin' : parseInt(raw, 10));
    });
  });
  document.querySelectorAll('.dice-tray .die').forEach(el=>{
    el.addEventListener('click', ()=>removeDie(el.getAttribute('data-id')));
  });
  const rollBtn=document.getElementById('rollAllBtn');
  if(rollBtn && !rollBtn._wired){
    rollBtn._wired = true;
    rollBtn.addEventListener('click', rollAllDice);
  }
  const clearBtn=document.getElementById('clearDiceBtn');
  if(clearBtn) clearBtn.addEventListener('click', ()=>{
    document.querySelectorAll('.dice-tray .die').forEach(el=>{ if(el._diceIv) clearInterval(el._diceIv); });
    diceState.dice=[];
    render();
  });
  const copyBtn=document.getElementById('copyResultBtn');
  if(copyBtn) copyBtn.addEventListener('click', copyDiceResult);
  const clearHistBtn=document.getElementById('clearHistBtn');
  if(clearHistBtn) clearHistBtn.addEventListener('click', ()=>{
    diceState.history = [];
    updateDiceHistory();
  });
  const histBox = document.getElementById('diceHistory');
  const histTip = document.getElementById('histTip');
  if(histBox && histTip){
    const showTip = (die)=>{
      const text = die.getAttribute('data-tip');
      if(!text) return;
      histTip.textContent = text;
      const row = histBox.parentElement;
      const rowRect = row.getBoundingClientRect();
      const dieRect = die.getBoundingClientRect();
      histTip.style.left = (dieRect.left - rowRect.left + dieRect.width/2) + 'px';
      histTip.classList.add('show');
    };
    const hideTip = ()=>histTip.classList.remove('show');
    histBox.addEventListener('mouseover', (e)=>{
      const die = e.target.closest('.hist-die');
      if(die) showTip(die);
    });
    histBox.addEventListener('mouseout', (e)=>{
      const die = e.target.closest('.hist-die');
      if(die && !histBox.contains(e.relatedTarget)) hideTip();
      else if(die && !e.relatedTarget?.closest?.('.hist-die')) hideTip();
    });
    histBox.addEventListener('click', (e)=>{
      const die = e.target.closest('.hist-die');
      if(die) showTip(die); // на телефоне — по тапу
    });
    histBox.addEventListener('mouseleave', hideTip);
  }
  const modMinus=document.getElementById('modMinus');
  if(modMinus) modMinus.addEventListener('click', ()=>{
    diceState.modifier--;
    const mv=document.querySelector('.mod-val');
    if(mv) mv.textContent=(diceState.modifier>0?'+':'')+diceState.modifier;
    updateDiceReadout();
  });
  const modPlus=document.getElementById('modPlus');
  if(modPlus) modPlus.addEventListener('click', ()=>{
    diceState.modifier++;
    const mv=document.querySelector('.mod-val');
    if(mv) mv.textContent=(diceState.modifier>0?'+':'')+diceState.modifier;
    updateDiceReadout();
  });

  function setCustomSides(val){
    let n = parseInt(val, 10);
    if(isNaN(n)) n = 7;
    n = Math.max(2, Math.min(100, n));
    diceState.customSides = n;

    const svgWrap = document.getElementById('customDieSvgWrap');
    if(svgWrap) svgWrap.innerHTML = getCustomPreviewSvg(n, 'custPick');

    const theme = CUST_THEMES[n] || CUST_THEMES.default;
    const box = document.querySelector('.custom-die-box');
    if(box){
      box.style.setProperty('--cust-color', theme.color);
      box.style.setProperty('--cust-glow', theme.glow);
      box.style.setProperty('--cust-bg-tint', theme.bg);
      box.style.setProperty('--cust-border-tint', theme.border);
    }

    const disp = document.getElementById('customSidesDisplay');
    if(disp) disp.textContent = '1d' + n;

    const inp = document.getElementById('customDieInput');
    if(inp && parseInt(inp.value,10) !== n) inp.value = n;

    const addNum = document.getElementById('customAddSidesNum');
    if(addNum) addNum.textContent = 'd' + n;

    const addBtn = document.getElementById('addCustomDieBtn');
    if(addBtn) addBtn.title = 'Бросить кастомный кубик d' + n;

    document.querySelectorAll('.custom-pill').forEach(pill=>{
      const s = parseInt(pill.getAttribute('data-sides'), 10);
      pill.classList.toggle('active', s === n);
    });
  }

  const customMinus = document.getElementById('customDieMinus');
  if(customMinus) customMinus.addEventListener('click', ()=>setCustomSides(diceState.customSides - 1));

  const customPlus = document.getElementById('customDiePlus');
  if(customPlus) customPlus.addEventListener('click', ()=>setCustomSides(diceState.customSides + 1));

  const customInput = document.getElementById('customDieInput');
  if(customInput){
    customInput.addEventListener('input', ()=>setCustomSides(customInput.value));
    customInput.addEventListener('change', ()=>setCustomSides(customInput.value));
  }

  document.querySelectorAll('.custom-pill').forEach(pill=>{
    pill.addEventListener('click', ()=>{
      const s = parseInt(pill.getAttribute('data-sides'), 10);
      setCustomSides(s);
    });
  });

  const addCustomBtn = document.getElementById('addCustomDieBtn');
  if(addCustomBtn && !addCustomBtn._wired){
    addCustomBtn._wired = true;
    addCustomBtn.addEventListener('click', ()=>addDie(diceState.customSides));
  }

  const customAddDirect = document.getElementById('customAddDirectBtn');
  if(customAddDirect && !customAddDirect._wired){
    customAddDirect._wired = true;
    customAddDirect.addEventListener('click', ()=>addDie(diceState.customSides));
  }

  const diceCatSelect = document.getElementById('diceCatSelect');
  if(diceCatSelect) diceCatSelect.addEventListener('change', ()=>{
    diceState.labelCat = diceCatSelect.value;
    diceState.label = '';
    const itemField = document.getElementById('labelItemField');
    const itemSelect = document.getElementById('diceLabelSelect');
    const customField = document.getElementById('customLabelField');
    const isCustom = diceState.labelCat==='custom';
    const hasItems = !!(diceState.labelCat && !isCustom);
    if(itemSelect) itemSelect.innerHTML = diceItemOptionsHtml();
    if(itemField) itemField.style.display = hasItems ? '' : 'none';
    if(customField) customField.style.display = isCustom ? '' : 'none';
    if(isCustom){
      const inp = document.getElementById('diceCustomLabel');
      if(inp) inp.focus();
    } else if(hasItems && itemSelect){
      itemSelect.focus();
    }
    updateLabelPreview();
  });
  const diceLabelSelect = document.getElementById('diceLabelSelect');
  if(diceLabelSelect) diceLabelSelect.addEventListener('change', ()=>{
    diceState.label = diceLabelSelect.value;
    updateLabelPreview();
  });
  const diceCustomLabel = document.getElementById('diceCustomLabel');
  if(diceCustomLabel) diceCustomLabel.addEventListener('input', ()=>{
    diceState.customLabel = diceCustomLabel.value;
    updateLabelPreview();
  });

  /* ---------- alchemy events ---------- */
  document.querySelectorAll('[data-delete-recipe]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const id = btn.getAttribute('data-delete-recipe');
      const rec = RECIPES.find(r=>r.id===id);
      if(confirm('Удалить рецепт «'+(rec?rec.name:'')+'»?')){
        RECIPES = RECIPES.filter(r=>r.id!==id);
        saveRecipesToStorage();
        render();
      }
    });
  });

  const recipeFormRoot = document.getElementById('recipeFormRoot');
  if(recipeFormRoot){
    recipeFormRoot.addEventListener('input', (e)=>{
      const t = e.target;
      const rfield = t.getAttribute('data-rfield');
      if(rfield){
        recipeDraft[rfield] = t.type==='number' ? Number(t.value) : t.value;
        return;
      }
      const ingIdx = t.getAttribute('data-ing-idx');
      if(ingIdx!==null){
        const f = t.getAttribute('data-ing-field');
        recipeDraft.ingredients[Number(ingIdx)][f] = f==='qty' ? Number(t.value) : t.value;
      }
    });
    recipeFormRoot.addEventListener('change', (e)=>{
      const t = e.target;
      const rfield = t.getAttribute('data-rfield');
      if(rfield && t.tagName==='SELECT') recipeDraft[rfield] = t.value;
    });
    recipeFormRoot.addEventListener('click', (e)=>{
      const rm = e.target.closest('[data-remove-ing]');
      if(rm){
        const idx = Number(rm.getAttribute('data-remove-ing'));
        recipeDraft.ingredients.splice(idx,1);
        const list = document.getElementById('ingList');
        if(list) list.innerHTML = recipeDraft.ingredients.map(ingredientFormRowHtml).join('');
      }
    });
  }
  const addIngRowBtn = document.getElementById('addIngRowBtn');
  if(addIngRowBtn) addIngRowBtn.addEventListener('click', ()=>{
    recipeDraft.ingredients.push({name:'',qty:1});
    const list = document.getElementById('ingList');
    if(list) list.innerHTML = recipeDraft.ingredients.map(ingredientFormRowHtml).join('');
  });
  const saveRecipeBtn = document.getElementById('saveRecipeBtn');
  if(saveRecipeBtn) saveRecipeBtn.addEventListener('click', ()=>{
    if(!recipeDraft.id) recipeDraft.id = genId();
    recipeDraft.ingredients = recipeDraft.ingredients.filter(i=>i.name && i.name.trim());
    if(!recipeDraft.ingredients.length) recipeDraft.ingredients.push({name:'',qty:1});
    const i = RECIPES.findIndex(x=>x.id===recipeDraft.id);
    const copy = JSON.parse(JSON.stringify(recipeDraft));
    if(i>=0) RECIPES[i]=copy; else RECIPES.unshift(copy);
    saveRecipesToStorage();
    navigate('recipes');
  });
  const deleteRecipeBtn = document.getElementById('deleteRecipeBtn');
  if(deleteRecipeBtn) deleteRecipeBtn.addEventListener('click', ()=>{
    if(confirm('Удалить рецепт «'+(recipeDraft.name||'без имени')+'»?')){
      RECIPES = RECIPES.filter(x=>x.id!==recipeDraft.id);
      saveRecipesToStorage();
      navigate('recipes');
    }
  });

  /* ---------- magic events ---------- */
  document.querySelectorAll('.spell-edit-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      navigate('spellForm:'+btn.getAttribute('data-spell-edit')+':'+btn.getAttribute('data-spell-school'));
    });
  });
  document.querySelectorAll('.spell-delete-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const id = btn.getAttribute('data-spell-delete');
      const sp = SPELLS.find(s=>s.id===id);
      if(confirm('Удалить заклинание «'+(sp?sp.name:'')+'»?')){
        SPELLS = SPELLS.filter(s=>s.id!==id);
        saveSpellsToStorage();
        render();
      }
    });
  });
  const spellFormRoot = document.getElementById('spellFormRoot');
  if(spellFormRoot){
    spellFormRoot.addEventListener('input', (e)=>{
      const t = e.target;
      const sfield = t.getAttribute('data-sfield');
      if(sfield) spellDraft[sfield] = sfield==='level' ? Number(t.value) : t.value;
    });
    spellFormRoot.addEventListener('change', (e)=>{
      const t = e.target;
      const sfield = t.getAttribute('data-sfield');
      if(sfield && t.tagName==='SELECT') spellDraft[sfield] = sfield==='level' ? Number(t.value) : t.value;
    });
  }
  const saveSpellBtn = document.getElementById('saveSpellBtn');
  if(saveSpellBtn) saveSpellBtn.addEventListener('click', ()=>{
    if(!spellDraft.id) spellDraft.id = genId();
    const i = SPELLS.findIndex(x=>x.id===spellDraft.id);
    const copy = JSON.parse(JSON.stringify(spellDraft));
    if(i>=0) SPELLS[i]=copy; else SPELLS.push(copy);
    saveSpellsToStorage();
    navigate('schoolSpells:'+spellDraft.school);
  });
  const deleteSpellBtn = document.getElementById('deleteSpellBtn');
  if(deleteSpellBtn) deleteSpellBtn.addEventListener('click', ()=>{
    if(confirm('Удалить заклинание «'+(spellDraft.name||'без имени')+'»?')){
      const school = spellDraft.school;
      SPELLS = SPELLS.filter(x=>x.id!==spellDraft.id);
      saveSpellsToStorage();
      navigate('schoolSpells:'+school);
    }
  });

  if(view.screen === 'alchemyRef') wireAlchemyRef();
  if(view.screen === 'recipes' || view.screen === 'recipeView' || view.screen === 'alchemyAiGen') wireAlchemyCustom();
  if(view.screen === 'faeTechs' || view.screen === 'faeTechView' || view.screen === 'faeTechEdit' || view.screen === 'faeTechGen') wireFaeTechs();
  if(view.screen === 'faeMoves' || view.screen === 'faeMoveView' || view.screen === 'faeMoveEdit' || view.screen === 'faeMoveGen') wireFaeMoves();
  if(view.screen === 'faeGen') wireFaeGen();
  if(view.screen === 'faeRef' || view.screen === 'ref') wireFaeRef();
  if(view.screen === 'faeData' || view.screen === 'data') wireFaeData();
  enhanceAllCustomSelects();
}

function navigate(val){
  const parts = val.split(':');
  if(parts[0]==='home') view = {screen:'home'};
  else if(parts[0]==='commands') view = {screen:'dice'};
  else if(parts[0]==='rules2024') view = {screen:'rules2024'};
  else if(parts[0]==='alchemy') view = {screen:'alchemy'};
  else if(parts[0]==='alchemyRef' || parts[0]==='alchemyDC') view = {screen:'alchemyRef'};
  else if(parts[0]==='recipes') view = {screen:'recipes'};
  else if(parts[0]==='recipeView') view = {screen:'recipeView', recipeId: parts[1]};
  else if(parts[0]==='recipeForm') view = {screen:'recipeForm', recipeId: parts[1]};
  else if(parts[0]==='alchemyAiGen') view = {screen:'alchemyAiGen'};
  else if(parts[0]==='stock') view = {screen:'alchemy'};
  else if(parts[0]==='faeTechs') view = {screen:'faeTechs'};
  else if(parts[0]==='faeTechView') view = {screen:'faeTechView', techId: parts[1]};
  else if(parts[0]==='faeTechEdit') view = {screen:'faeTechEdit', techId: parts[1]};
  else if(parts[0]==='faeTechGen') view = {screen:'faeTechGen'};
  else if(parts[0]==='faeMoves') view = {screen:'faeMoves'};
  else if(parts[0]==='faeMoveView') view = {screen:'faeMoveView', moveId: parts[1]};
  else if(parts[0]==='faeMoveEdit') view = {screen:'faeMoveEdit', moveId: parts[1]};
  else if(parts[0]==='faeMoveGen') view = {screen:'faeMoveGen'};
  else if(parts[0]==='subclass') view = {screen:'subclass', clsKey:parts[1], subKey:parts[2]};
  else if(parts[0]==='magic') view = {screen:'magic'};
  else if(parts[0]==='schoolSpells') view = {screen:'schoolSpells', schoolKey:parts[1]};
  else if(parts[0]==='spellForm') view = {screen:'spellForm', spellId:parts[1], schoolKey:parts[2]};
  else if(parts[0]==='dice') view = {screen:'dice'};
  else if(parts[0]==='map') view = {screen:'map'};
  else if(parts[0]==='characters' || parts[0]==='charview' || parts[0]==='sheet'){
    if(parts[1] === 'new'){
      var created = newCharacter({ name: 'Новый герой ' + (CHARACTERS.length + 1) });
      CHARACTERS.push(created);
      saveCharactersToStorage();
      setActiveFaerunCharacter(created.id);
    } else if(parts[1]){
      setActiveFaerunCharacter(parts[1]);
    }
    view = {screen:'faeData'};
  }
  else if(parts[0]==='glossary') view = {screen:'glossary'};
  else if(parts[0]==='weapons') view = {screen:'weapons', weapon: view.weapon || 'longsword'};
  else if(parts[0]==='class') view = {screen:'class', cls:parts[1]};
  else if(parts[0]==='sub') view = {screen:'sub', cls:parts[1], sub:parts[2]};
  else if(parts[0]==='faeGen') view = {screen:'faeGen'};
  else if(parts[0]==='faeRef' || (HB.mode==='faerun' && parts[0]==='ref')) view = {screen:'faeRef'};
  else if(parts[0]==='faeData' || (HB.mode==='faerun' && parts[0]==='data')) view = {screen:'faeData'};
  else if(parts[0]==='hbHome') view = {screen:'hbHome'};
  else if(parts[0]==='hbWorld' || parts[0]==='hbData' || (HB.mode==='hb' && parts[0]==='data')) view = {screen:'hbWorld'};
  else if(parts[0]==='hbGen') view = {screen:'hbGen'};
  else if(parts[0]==='hbRef' || (HB.mode==='hb' && parts[0]==='ref')) view = {screen:'hbRef'};
  render();
  updateHomeScreenLock(view.screen);
  window.scrollTo(0,0);
}

function copyText(text){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).catch(()=>fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}
function fallbackCopy(text){
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position='fixed';
  ta.style.opacity='0';
  document.body.appendChild(ta);
  ta.select();
  try{ document.execCommand('copy'); }catch(e){}
  document.body.removeChild(ta);
}

/* ============================================================
   APP STORAGE MONITOR & LOCALSTORAGE QUOTA PROTECTION SYSTEM
   ============================================================ */
var AppStorage = window.AppStorage = {
  MAX_QUOTA: 5 * 1024 * 1024, // 5,242,880 bytes (5 MB standard browser quota)

  formatBytes: function(bytes){
    if(bytes == null || isNaN(bytes)) return '0 Б';
    if(bytes < 1024) return bytes + ' Б';
    if(bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / (1024 * 1024)).toFixed(2) + ' МБ';
  },

  getInfo: function(){
    var totalBytes = 0;
    var cats = {
      ai: { title: 'История генераций ИИ', bytes: 0, count: 0, keys: [] },
      profiles: { title: 'Профили и ростер', bytes: 0, count: 0, keys: [] },
      powers: { title: 'Способности и база', bytes: 0, count: 0, keys: [] },
      maps: { title: 'Карты и метки', bytes: 0, count: 0, keys: [] },
      system: { title: 'Служебное и синхронизация', bytes: 0, count: 0, keys: [] }
    };

    try {
      for(var i = 0; i < localStorage.length; i++){
        var k = localStorage.key(i);
        if(!k) continue;
        var val = localStorage.getItem(k) || '';
        var size = k.length + val.length;
        totalBytes += size;

        if(k.indexOf('_ai_hist_') !== -1 || k.indexOf('ai_hist') !== -1 || k.indexOf('fae_ai_') !== -1 || k.indexOf('hb_ai_') !== -1){
          cats.ai.bytes += size; cats.ai.count++; cats.ai.keys.push(k);
        } else if(k.indexOf('profile') !== -1 || k === 'sh_meta' || k === 'me_character' || k.indexOf('active_profile') !== -1 || k === 'ttc_characters' || k === 'ttc_sh_meta'){
          cats.profiles.bytes += size; cats.profiles.count++; cats.profiles.keys.push(k);
        } else if(k.indexOf('tech') !== -1 || k.indexOf('power') !== -1 || k.indexOf('arsenal') !== -1 || k.indexOf('move') !== -1 || k.indexOf('skill') !== -1 || k.indexOf('spell') !== -1 || k.indexOf('recipe') !== -1 || k.indexOf('ingredient') !== -1 || k.indexOf('ship') !== -1 || k.indexOf('hb_records') !== -1){
          cats.powers.bytes += size; cats.powers.count++; cats.powers.keys.push(k);
        } else if(k.indexOf('marker') !== -1 || k.indexOf('map') !== -1 || k.indexOf('war_paths') !== -1){
          cats.maps.bytes += size; cats.maps.count++; cats.maps.keys.push(k);
        } else {
          cats.system.bytes += size; cats.system.count++; cats.system.keys.push(k);
        }
      }
    } catch(e){
      console.warn('[AppStorage] Failed reading localStorage keys:', e);
    }

    var percent = Math.min(100, Math.round((totalBytes / AppStorage.MAX_QUOTA) * 1000) / 10);
    var status = percent >= 85 ? 'danger' : (percent >= 70 ? 'warning' : 'normal');

    return {
      totalBytes: totalBytes,
      maxQuota: AppStorage.MAX_QUOTA,
      totalFormatted: AppStorage.formatBytes(totalBytes),
      maxFormatted: AppStorage.formatBytes(AppStorage.MAX_QUOTA),
      percent: percent,
      status: status,
      categories: cats
    };
  },

  clearAiCache: function(mode){
    var freedBytes = 0;
    var freedCount = 0;
    var keysToRemove = [];

    try {
      for(var i = 0; i < localStorage.length; i++){
        var k = localStorage.key(i);
        if(!k) continue;
        var isAi = (k.indexOf('_ai_hist_') !== -1 || k.indexOf('ai_hist') !== -1 || k.indexOf('fae_ai_') !== -1 || k.indexOf('hb_ai_') !== -1);
        if(!isAi) continue;

        if(mode === 'sh' && k.indexOf('sh_ai_hist_') === 0) keysToRemove.push(k);
        else if(mode === 'el' && k.indexOf('el_ai_hist_') === 0) keysToRemove.push(k);
        else if(mode === 'me' && k.indexOf('me_ai_hist_') === 0) keysToRemove.push(k);
        else if(mode === 'wi' && k.indexOf('wi_ai_hist_') === 0) keysToRemove.push(k);
        else if(mode === 'wz' && k.indexOf('wz_ai_hist_') === 0) keysToRemove.push(k);
        else if((mode === 'fae' || mode === 'faerun') && (k.indexOf('fae_ai_') === 0 || k.indexOf('ttc_fae_') === 0)) keysToRemove.push(k);
        else if((mode === 'hb' || mode === 'homebrew') && (k.indexOf('hb_ai_') === 0 || k.indexOf('ttc_hb_ai_') === 0)) keysToRemove.push(k);
        else if(!mode || mode === 'all') keysToRemove.push(k);
      }

      keysToRemove.forEach(function(k){
        var val = localStorage.getItem(k) || '';
        freedBytes += k.length + val.length;
        freedCount++;
        localStorage.removeItem(k);
      });
    } catch(e){
      console.error('[AppStorage] Error clearing AI cache:', e);
    }

    return {
      freedBytes: freedBytes,
      freedCount: freedCount,
      freedFormatted: AppStorage.formatBytes(freedBytes)
    };
  },

  checkIntegrity: function(){
    var checked = 0;
    var corrupted = [];
    try {
      for(var i = 0; i < localStorage.length; i++){
        var k = localStorage.key(i);
        if(!k) continue;
        var val = localStorage.getItem(k);
        if(!val) continue;
        var first = val.trim().charAt(0);
        if(first === '{' || first === '['){
          checked++;
          try {
            JSON.parse(val);
          } catch(err){
            corrupted.push(k);
          }
        }
      }
    } catch(e){
      console.error('[AppStorage] Error checking integrity:', e);
    }
    return {
      valid: corrupted.length === 0,
      checkedCount: checked,
      corruptedKeys: corrupted
    };
  },

  safeSet: function(key, val){
    try {
      localStorage.setItem(key, val);
      return true;
    } catch(e){
      if(e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014 || e.number === -2147024882)){
        AppStorage.showQuotaModal(key);
        return false;
      }
      console.error('[AppStorage] Error saving ' + key + ':', e);
      return false;
    }
  },

  showQuotaModal: function(blockedKey){
    var old = document.getElementById('storageQuotaModalOverlay');
    if(old && old.parentNode) old.parentNode.removeChild(old);

    var overlay = document.createElement('div');
    overlay.id = 'storageQuotaModalOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(4px);';
    
    var info = AppStorage.getInfo();
    var keyDisplay = blockedKey ? ('<div style="font-size:11px;color:#94a3b8;margin-top:4px;">Блокированная запись: <code style="color:#fca5a5;">' + (blockedKey.replace(/[<>&]/g,'')) + '</code></div>') : '';

    overlay.innerHTML = 
      '<div style="background:#161922;border:2px solid #ef4444;box-shadow:0 0 35px rgba(239,68,68,0.5);border-radius:8px;max-width:520px;width:100%;padding:22px;color:#fff;font-family:system-ui,-apple-system,sans-serif;">' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">' +
          '<span style="font-size:32px;">⚠️</span>' +
          '<div>' +
            '<div style="font-size:18px;font-weight:700;color:#fca5a5;">Память браузера переполнена!</div>' +
            '<div style="font-size:12px;color:#94a3b8;">Лимит LocalStorage (~5 МБ) исчерпан (' + info.totalFormatted + ' / ' + info.maxFormatted + ')</div>' +
            keyDisplay +
          '</div>' +
        '</div>' +
        '<p style="font-size:13px;line-height:1.55;color:#e2e8f0;margin:12px 0 16px;">' +
          'Браузер заблокировал сохранение новых данных, так как выделенная память заполнена. ' +
          'Чтобы не потерять персонажей и техники, очистите кэш генераций ИИ (освободит место мгновенно без потери профилей).' +
        '</p>' +
        '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">' +
          '<button id="storageModalCleanBtn" style="background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border:none;padding:9px 16px;border-radius:4px;font-weight:700;cursor:pointer;font-size:13px;">🧹 Очистить кэш ИИ сейчас (' + AppStorage.formatBytes(info.categories.ai.bytes) + ')</button>' +
          '<button id="storageModalCloseBtn" style="background:rgba(255,255,255,0.08);color:#cbd5e1;border:1px solid rgba(255,255,255,0.2);padding:9px 16px;border-radius:4px;cursor:pointer;font-size:13px;">Закрыть</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    var closeBtn = document.getElementById('storageModalCloseBtn');
    if(closeBtn){
      closeBtn.onclick = function(){
        if(overlay.parentNode) overlay.parentNode.removeChild(overlay);
      };
    }
    var cleanBtn = document.getElementById('storageModalCleanBtn');
    if(cleanBtn){
      cleanBtn.onclick = function(){
        var res = AppStorage.clearAiCache('all');
        alert('✓ Кэш ИИ очищен!\nОсвобождено: ' + res.freedFormatted + ' памяти.\nТеперь можно продолжить сохранение.');
        if(overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if(typeof render === 'function') render();
      };
    }
  },

  renderWidget: function(mode){
    var info = AppStorage.getInfo();
    var barColor = info.status === 'danger' ? '#ef4444' : (info.status === 'warning' ? '#f59e0b' : '#10b981');
    var statusBadge = '';
    if(info.status === 'danger'){
      statusBadge = '<span style="background:rgba(239,68,68,0.2);color:#fca5a5;border:1px solid #ef4444;padding:3px 9px;border-radius:12px;font-size:11px;font-weight:700;">🔴 КРИТИЧЕСКИЙ УРОВЕНЬ (>85%)</span>';
    } else if(info.status === 'warning'){
      statusBadge = '<span style="background:rgba(245,158,11,0.2);color:#fde68a;border:1px solid #f59e0b;padding:3px 9px;border-radius:12px;font-size:11px;font-weight:700;">🟡 ВНИМАНИЕ (>70%)</span>';
    } else {
      statusBadge = '<span style="background:rgba(16,185,129,0.15);color:#6ee7b7;border:1px solid rgba(16,185,129,0.3);padding:3px 9px;border-radius:12px;font-size:11px;font-weight:600;">🟢 В НОРМЕ</span>';
    }

    var warningNotice = '';
    if(info.status === 'danger'){
      warningNotice = 
        '<div style="margin:10px 0;padding:10px 14px;background:rgba(239,68,68,0.15);border:1px solid #ef4444;border-radius:6px;font-size:12.5px;color:#fca5a5;display:flex;align-items:center;gap:10px;">' +
          '<span style="font-size:22px;">⚠️</span>' +
          '<div><b>Хранилище почти заполнено!</b> Риск ошибки записи данных. Рекомендуется очистить кэш ИИ ниже или экспортировать резервную копию.</div>' +
        '</div>';
    } else if(info.status === 'warning'){
      warningNotice = 
        '<div style="margin:10px 0;padding:10px 14px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.4);border-radius:6px;font-size:12px;color:#fde68a;display:flex;align-items:center;gap:8px;">' +
          '<span style="font-size:18px;">ℹ️</span>' +
          '<div>Память браузера заполнена более чем на 70%. Следите за объёмом кэша генераций ИИ.</div>' +
        '</div>';
    }

    // Universe-specific styling
    if(mode === 'me'){
      // Mass Effect Sci-Fi HUD
      return '<div class="me-panel" id="meStorageSection" style="margin-top:16px;">' +
        '<div class="section-label" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
          '<span>💾 СИСТЕМНОЕ ХРАНИЛИЩЕ // ДАТА-БАНК И ЗАЩИТА ПАМЯТИ</span>' +
          statusBadge +
        '</div>' +
        '<div style="font-size:12px;color:var(--ink-dim);margin:6px 0 10px;">' +
          'МОНИТОРИНГ БУФЕРА ДАННЫХ BROWSER LOCALSTORAGE • КВОТА 5.0 MB • ЗАЩИТА ОТ ПЕРЕПОЛНЕНИЯ' +
        '</div>' +
        warningNotice +
        '<div style="margin:12px 0 6px;">' +
          '<div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--ink-dim);margin-bottom:5px;font-family:monospace;">' +
            '<span>ЗАНЯТО: <b style="color:#00d2ff;">' + info.totalFormatted + '</b> / ' + info.maxFormatted + '</span>' +
            '<span style="font-weight:700;color:' + barColor + ';">' + info.percent + '%</span>' +
          '</div>' +
          '<div style="width:100%;height:14px;background:rgba(0,0,0,0.6);border:1px solid rgba(0,210,255,0.3);border-radius:3px;overflow:hidden;padding:1px;box-sizing:border-box;">' +
            '<div style="height:100%;width:' + info.percent + '%;background:linear-gradient(90deg, #00d2ff, ' + barColor + ');border-radius:2px;transition:width 0.4s ease;box-shadow:0 0 8px ' + barColor + ';"></div>' +
          '</div>' +
        '</div>' +

        '<div class="grid-2" style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:8px;">' +
          '<div class="me-card" style="padding:8px 10px;">' +
            '<div style="font-size:11px;color:var(--ink-dim);">🤖 Буфер ИИ:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#fca5a5;">' + AppStorage.formatBytes(info.categories.ai.bytes) + '</div>' +
          '</div>' +
          '<div class="me-card" style="padding:8px 10px;">' +
            '<div style="font-size:11px;color:var(--ink-dim);">👥 Досье и ростер:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#7dd3fc;">' + AppStorage.formatBytes(info.categories.profiles.bytes) + '</div>' +
          '</div>' +
          '<div class="me-card" style="padding:8px 10px;">' +
            '<div style="font-size:11px;color:var(--ink-dim);">🔫 Арсенал и силы:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#c084fc;">' + AppStorage.formatBytes(info.categories.powers.bytes) + '</div>' +
          '</div>' +
          '<div class="me-card" style="padding:8px 10px;">' +
            '<div style="font-size:11px;color:var(--ink-dim);">⚙️ Служебное:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#94a3b8;">' + AppStorage.formatBytes(info.categories.system.bytes) + '</div>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid rgba(0,210,255,0.15);">' +
          '<button class="btn-primary" id="meStorageCleanAiBtn" style="font-size:12px;">🧹 Очистить буфер ИИ (' + AppStorage.formatBytes(info.categories.ai.bytes) + ')</button>' +
          '<button class="btn-ghost" id="meStorageIntegrityBtn" style="font-size:12px;">🛡️ Диагностика дата-банка</button>' +
        '</div>' +
      '</div>';
    }

    if(mode === 'el'){
      // Avatar / Elements Card
      return '<div class="sheet-section" id="elStorageSection" style="background:var(--el-card-bg);border:1px solid var(--el-accent-border);border-left:4px solid var(--el-accent);border-radius:4px;padding:16px 20px;margin-bottom:20px;">' +
        '<div class="section-label" style="font-size:11px;letter-spacing:0.15em;color:var(--el-accent);font-weight:700;margin-bottom:12px;font-family:\'JetBrains Mono\',monospace;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
          '<span>💾 ХРАНИЛИЩЕ СВИТКОВ И ЗАЩИТА ДАННЫХ</span>' +
          statusBadge +
        '</div>' +
        '<div style="font-size:12.5px;color:#94a3b8;margin-bottom:12px;line-height:1.45;">' +
          'Мониторинг памяти устройства (лимит 5.0 МБ). Все свитки техник, боевые приёмы и метки карты защищены от сбоев переполнения.' +
        '</div>' +
        warningNotice +
        '<div style="margin:12px 0 6px;">' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-dim);margin-bottom:5px;font-family:\'JetBrains Mono\',monospace;">' +
            '<span>Занято: <b style="color:var(--el-tag-text);">' + info.totalFormatted + '</b> / ' + info.maxFormatted + '</span>' +
            '<span style="font-weight:700;color:' + barColor + ';">' + info.percent + '%</span>' +
          '</div>' +
          '<div style="width:100%;height:14px;background:rgba(0,0,0,0.5);border:1px solid var(--el-accent-border);border-radius:4px;overflow:hidden;padding:1px;box-sizing:border-box;">' +
            '<div style="height:100%;width:' + info.percent + '%;background:var(--el-gradient);border-radius:2px;transition:width 0.4s ease;box-shadow:0 0 8px var(--el-accent-glow);"></div>' +
          '</div>' +
        '</div>' +

        '<div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:8px;">' +
          '<div style="background:rgba(0,0,0,0.3);border:1px solid var(--el-accent-border);border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">🤖 Архив ИИ:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#fca5a5;">' + AppStorage.formatBytes(info.categories.ai.bytes) + '</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.3);border:1px solid var(--el-accent-border);border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">👤 Профиль мага:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#7dd3fc;">' + AppStorage.formatBytes(info.categories.profiles.bytes) + '</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.3);border:1px solid var(--el-accent-border);border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">⚡ Формы и приёмы:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#c084fc;">' + AppStorage.formatBytes(info.categories.powers.bytes) + '</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.3);border:1px solid var(--el-accent-border);border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">🗺️ Метки и пути:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#86efac;">' + AppStorage.formatBytes(info.categories.maps.bytes) + '</div>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid var(--el-accent-border);">' +
          '<button class="btn btn-primary" id="elStorageCleanAiBtn" style="background:var(--el-gradient);border:none;color:#fff;padding:8px 16px;border-radius:4px;font-weight:700;cursor:pointer;">🧹 Очистить архив свитков ИИ (' + AppStorage.formatBytes(info.categories.ai.bytes) + ')</button>' +
          '<button class="btn btn-ghost" id="elStorageIntegrityBtn" style="border:1px solid var(--el-accent-border);color:var(--el-tag-text);padding:8px 16px;border-radius:4px;cursor:pointer;">🛡️ Проверить свитки</button>' +
        '</div>' +
      '</div>';
    }

    if(mode === 'wi'){
      // Witcher Continental Card
      return '<div class="sheet-section" id="wiStorageSection" style="background:var(--wi-bg-surface, rgba(14, 18, 24, 0.88));border:1px solid var(--wi-border, rgba(180, 150, 100, 0.25));border-left:4px solid var(--wi-amber, #f59e0b);border-radius:6px;padding:16px 20px;margin-bottom:20px;box-shadow:0 4px 18px rgba(0,0,0,0.4);">' +
        '<div class="section-label" style="font-size:11px;letter-spacing:0.15em;color:var(--wi-amber, #f59e0b);font-weight:700;margin-bottom:12px;font-family:\'JetBrains Mono\',monospace;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
          '<span>💾 ПАМЯТЬ КОНТИНЕНТА // ЗАЩИТА ДАННЫХ ВЕДЬМАКОВ</span>' +
          statusBadge +
        '</div>' +
        '<div style="font-size:12.5px;color:#94a3b8;margin-bottom:12px;line-height:1.45;font-family:\'EB Garamond\',serif;font-style:italic;">' +
          'Мониторинг хранилища браузера (лимит 5.0 МБ). Все профили ведьмаков, снаряжение, стальной и серебряный клинки и хроники Континента надёжно защищены.' +
        '</div>' +
        warningNotice +
        '<div style="margin:12px 0 6px;">' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-dim);margin-bottom:5px;font-family:\'JetBrains Mono\',monospace;">' +
            '<span>Занято: <b style="color:var(--wi-amber, #f59e0b);">' + info.totalFormatted + '</b> / ' + info.maxFormatted + '</span>' +
            '<span style="font-weight:700;color:' + barColor + ';">' + info.percent + '%</span>' +
          '</div>' +
          '<div style="width:100%;height:14px;background:rgba(0,0,0,0.5);border:1px solid var(--wi-border, rgba(180, 150, 100, 0.25));border-radius:4px;overflow:hidden;padding:1px;box-sizing:border-box;">' +
            '<div style="height:100%;width:' + info.percent + '%;background:linear-gradient(90deg, #f59e0b, #ef4444);border-radius:2px;transition:width 0.4s ease;box-shadow:0 0 8px ' + barColor + ';"></div>' +
          '</div>' +
        '</div>' +

        '<div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:8px;">' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid var(--wi-border, rgba(180, 150, 100, 0.25));border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">🤖 Архив ИИ:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#fca5a5;">' + AppStorage.formatBytes(info.categories.ai.bytes) + '</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid var(--wi-border, rgba(180, 150, 100, 0.25));border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">🐺 Ростер ведьмаков:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#7dd3fc;">' + AppStorage.formatBytes(info.categories.profiles.bytes) + '</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid var(--wi-border, rgba(180, 150, 100, 0.25));border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">⚔️ Снаряжение и мечи:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#c084fc;">' + AppStorage.formatBytes(info.categories.powers.bytes) + '</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid var(--wi-border, rgba(180, 150, 100, 0.25));border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">📜 Хроники Континента:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#86efac;">' + AppStorage.formatBytes(info.categories.maps.bytes) + '</div>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid var(--wi-border, rgba(180, 150, 100, 0.25));">' +
          '<button class="btn btn-primary" id="wiStorageCleanAiBtn" style="font-size:12px;">🧹 Очистить архив ИИ (' + AppStorage.formatBytes(info.categories.ai.bytes) + ')</button>' +
          '<button class="btn btn-ghost" id="wiStorageIntegrityBtn" style="font-size:12px;border:1px solid var(--wi-border, rgba(180, 150, 100, 0.35));color:#e2e8f0;">🛡️ Проверить целостность</button>' +
        '</div>' +
      '</div>';
    }

    if(mode === 'wz'){
      // Wizard Hogwarts Storage Card
      return '<div class="sheet-section" id="wzStorageSection" style="background:var(--wz-surface, rgba(14, 18, 32, 0.92));border:1px solid var(--wz-border, rgba(212, 175, 55, 0.28));border-left:4px solid var(--wz-gold, #d4af37);border-radius:6px;padding:16px 20px;margin-bottom:20px;box-shadow:0 4px 18px rgba(0,0,0,0.4);">' +
        '<div class="section-label" style="font-size:11px;letter-spacing:0.15em;color:var(--wz-gold, #d4af37);font-weight:700;margin-bottom:12px;font-family:\'Cinzel\',serif;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
          '<span>💾 ХРАНИЛИЩЕ ХОГВАРТСА // ЗАЩИТА МАГИЧЕСКИХ ДАННЫХ</span>' +
          statusBadge +
        '</div>' +
        '<div style="font-size:12.5px;color:#94a3b8;margin-bottom:12px;line-height:1.45;font-family:\'EB Garamond\',serif;font-style:italic;">' +
          'Мониторинг хранилища браузера (лимит 5.0 МБ). Все анкеты волшебников, заклинания, дуэли, инвентарь и хроники магии надёжно защищены.' +
        '</div>' +
        warningNotice +
        '<div style="margin:12px 0 6px;">' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-dim);margin-bottom:5px;font-family:\'Cinzel\',serif;">' +
            '<span>Занято: <b style="color:var(--wz-gold, #d4af37);">' + info.totalFormatted + '</b> / ' + info.maxFormatted + '</span>' +
            '<span style="font-weight:700;color:' + barColor + ';">' + info.percent + '%</span>' +
          '</div>' +
          '<div style="width:100%;height:14px;background:rgba(0,0,0,0.5);border:1px solid var(--wz-border, rgba(212, 175, 55, 0.28));border-radius:4px;overflow:hidden;padding:1px;box-sizing:border-box;">' +
            '<div style="height:100%;width:' + info.percent + '%;background:linear-gradient(90deg, #d4af37, #f59e0b);border-radius:2px;transition:width 0.4s ease;box-shadow:0 0 8px ' + barColor + ';"></div>' +
          '</div>' +
        '</div>' +

        '<div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:8px;">' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid var(--wz-border, rgba(212, 175, 55, 0.25));border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">🤖 Архив ИИ:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#fca5a5;">' + AppStorage.formatBytes(info.categories.ai.bytes) + '</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid var(--wz-border, rgba(212, 175, 55, 0.25));border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">🧙 Ростер волшебников:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#7dd3fc;">' + AppStorage.formatBytes(info.categories.profiles.bytes) + '</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid var(--wz-border, rgba(212, 175, 55, 0.25));border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">✨ Заклинания и дуэли:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#c084fc;">' + AppStorage.formatBytes(info.categories.powers.bytes) + '</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid var(--wz-border, rgba(212, 175, 55, 0.25));border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">📜 Хроники магии:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#86efac;">' + AppStorage.formatBytes(info.categories.maps.bytes) + '</div>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid var(--wz-border, rgba(212, 175, 55, 0.25));">' +
          '<button class="btn btn-primary" id="wzStorageCleanAiBtn" style="font-size:12px;">🧹 Очистить архив ИИ (' + AppStorage.formatBytes(info.categories.ai.bytes) + ')</button>' +
          '<button class="btn btn-ghost" id="wzStorageIntegrityBtn" style="font-size:12px;border:1px solid var(--wz-border, rgba(212, 175, 55, 0.35));color:#e2e8f0;">🛡️ Проверить целостность</button>' +
        '</div>' +
      '</div>';
    }

    if(mode === 'sw'){
      return '<div class="sheet-section sw-data-section" id="swStorageSection" style="background:rgba(10, 20, 38, 0.94);border:1px solid rgba(56, 189, 248, 0.35);border-left:4px solid #38bdf8;border-radius:10px;padding:16px 20px;margin-bottom:16px;box-shadow:0 4px 18px rgba(0,0,0,0.5);">' +
        '<div class="section-label" style="font-size:11px;letter-spacing:0.15em;color:#38bdf8;font-weight:700;margin-bottom:12px;font-family:\'Cinzel\',serif;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
          '<span>💾 АРХИВ ГОЛОКРОНА // ПАМЯТЬ УСТРОЙСТВА</span>' +
          statusBadge +
        '</div>' +
        '<div style="font-size:12.5px;color:#bae6fd;margin-bottom:12px;line-height:1.45;">' +
          'Мониторинг квоты браузера (лимит 5.0 МБ). Профили персонажей Галактики, способности Силы, формы фехтования и навыки защищены.' +
        '</div>' +
        warningNotice +
        '<div style="margin:12px 0 6px;">' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;color:#93c5fd;margin-bottom:5px;font-family:\'Cinzel\',serif;">' +
            '<span>Занято: <b style="color:#38bdf8;">' + info.totalFormatted + '</b> / ' + info.maxFormatted + '</span>' +
            '<span style="font-weight:700;color:' + barColor + ';">' + info.percent + '%</span>' +
          '</div>' +
          '<div style="width:100%;height:14px;background:rgba(0,0,0,0.5);border:1px solid rgba(56, 189, 248, 0.35);border-radius:4px;overflow:hidden;padding:1px;box-sizing:border-box;">' +
            '<div style="height:100%;width:' + info.percent + '%;background:linear-gradient(90deg, #0284c7, #38bdf8);border-radius:2px;transition:width 0.4s ease;box-shadow:0 0 8px ' + barColor + ';"></div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid rgba(56, 189, 248, 0.25);">' +
          '<button class="btn primary small" id="swStorageCleanAiBtn">🧹 Очистить архив ИИ (' + AppStorage.formatBytes(info.categories.ai.bytes) + ')</button>' +
          '<button class="btn small" id="swStorageIntegrityBtn">🛡️ Проверить целостность</button>' +
        '</div>' +
      '</div>';
    }

    if(mode === 'fae' || mode === 'faerun'){
      return '<div class="sheet-section fae-data-section" id="faeStorageSection" style="background:rgba(22, 26, 32, 0.95);border:1px solid rgba(201, 164, 92, 0.35);border-left:4px solid #c9a45c;border-radius:6px;padding:16px 20px;margin-bottom:20px;box-shadow:0 4px 18px rgba(0,0,0,0.4);">' +
        '<div class="section-label" style="font-size:11px;letter-spacing:0.15em;color:#c9a45c;font-weight:700;margin-bottom:12px;font-family:\'Cinzel\',serif;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
          '<span>💾 ХРАНИЛИЩЕ ФАЭРУНА // ЗАЩИТА ДАННЫХ D&D</span>' +
          statusBadge +
        '</div>' +
        '<div style="font-size:12.5px;color:#cbd5e1;margin-bottom:12px;line-height:1.45;font-family:\'EB Garamond\',serif;font-style:italic;">' +
          'Мониторинг квоты браузера (лимит 5.0 МБ). Все листы персонажей, заклинания, рецепты алхимии и журнал кампании защищены от переполнения.' +
        '</div>' +
        warningNotice +
        '<div style="margin:12px 0 6px;">' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-dim);margin-bottom:5px;font-family:\'Cinzel\',serif;">' +
            '<span>Занято: <b style="color:#c9a45c;">' + info.totalFormatted + '</b> / ' + info.maxFormatted + '</span>' +
            '<span style="font-weight:700;color:' + barColor + ';">' + info.percent + '%</span>' +
          '</div>' +
          '<div style="width:100%;height:14px;background:rgba(0,0,0,0.5);border:1px solid rgba(201, 164, 92, 0.35);border-radius:4px;overflow:hidden;padding:1px;box-sizing:border-box;">' +
            '<div style="height:100%;width:' + info.percent + '%;background:linear-gradient(90deg, #c9a45c, #f59e0b);border-radius:2px;transition:width 0.4s ease;box-shadow:0 0 8px ' + barColor + ';"></div>' +
          '</div>' +
        '</div>' +

        '<div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:8px;">' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid rgba(201, 164, 92, 0.25);border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">🤖 Буфер ИИ:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#fca5a5;">' + AppStorage.formatBytes(info.categories.ai.bytes) + '</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid rgba(201, 164, 92, 0.25);border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">👤 Ростер героев:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#7dd3fc;">' + AppStorage.formatBytes(info.categories.profiles.bytes) + '</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid rgba(201, 164, 92, 0.25);border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">✨ Книга заклинаний:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#c084fc;">' + AppStorage.formatBytes(info.categories.powers.bytes) + '</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid rgba(201, 164, 92, 0.25);border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">🧪 Алхимия и рецепты:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#86efac;">' + AppStorage.formatBytes(info.categories.maps.bytes) + '</div>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid rgba(201, 164, 92, 0.25);">' +
          '<button class="btn btn-primary" id="faeStorageCleanAiBtn" style="font-size:12px;">🧹 Очистить архив ИИ (' + AppStorage.formatBytes(info.categories.ai.bytes) + ')</button>' +
          '<button class="btn btn-ghost" id="faeStorageIntegrityBtn" style="font-size:12px;border:1px solid rgba(201, 164, 92, 0.35);color:#e2e8f0;">🛡️ Проверить целостность</button>' +
        '</div>' +
      '</div>';
    }

    if(mode === 'hb' || mode === 'homebrew'){
      return '<div class="sheet-section" id="hbStorageSection" style="background:rgba(15, 23, 42, 0.95);border:1px solid rgba(56, 189, 248, 0.35);border-left:4px solid #38bdf8;border-radius:6px;padding:16px 20px;margin-bottom:20px;box-shadow:0 4px 18px rgba(0,0,0,0.4);">' +
        '<div class="section-label" style="font-size:11px;letter-spacing:0.15em;color:#38bdf8;font-weight:700;margin-bottom:12px;font-family:monospace;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
          '<span>💾 ХРАНИЛИЩЕ ТЕХНОЛОГИЙ // КВОТА LOCALSTORAGE</span>' +
          statusBadge +
        '</div>' +
        '<div style="font-size:12.5px;color:#94a3b8;margin-bottom:12px;line-height:1.45;">' +
          'Мониторинг квоты браузера (лимит 5.0 МБ). Все киберимпланты, оружие, боевые дроны, досье персонажей и заметки мира защищены.' +
        '</div>' +
        warningNotice +
        '<div style="margin:12px 0 6px;">' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-dim);margin-bottom:5px;font-family:monospace;">' +
            '<span>Занято: <b style="color:#38bdf8;">' + info.totalFormatted + '</b> / ' + info.maxFormatted + '</span>' +
            '<span style="font-weight:700;color:' + barColor + ';">' + info.percent + '%</span>' +
          '</div>' +
          '<div style="width:100%;height:14px;background:rgba(0,0,0,0.5);border:1px solid rgba(56, 189, 248, 0.35);border-radius:4px;overflow:hidden;padding:1px;box-sizing:border-box;">' +
            '<div style="height:100%;width:' + info.percent + '%;background:linear-gradient(90deg, #38bdf8, #0ea5e9);border-radius:2px;transition:width 0.4s ease;box-shadow:0 0 8px ' + barColor + ';"></div>' +
          '</div>' +
        '</div>' +

        '<div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:8px;">' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid rgba(56, 189, 248, 0.25);border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">🤖 Буфер ИИ:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#fca5a5;">' + AppStorage.formatBytes(info.categories.ai.bytes) + '</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid rgba(56, 189, 248, 0.25);border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">👤 Досье персонажей:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#7dd3fc;">' + AppStorage.formatBytes(info.categories.profiles.bytes) + '</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid rgba(56, 189, 248, 0.25);border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">⚙️ Технологии & Записи:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#c084fc;">' + AppStorage.formatBytes(info.categories.powers.bytes) + '</div>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.35);border:1px solid rgba(56, 189, 248, 0.25);border-radius:4px;padding:8px 10px;">' +
            '<div style="font-size:11px;color:#94a3b8;">🌐 Сеттинг и заметки:</div>' +
            '<div style="font-size:13px;font-weight:bold;color:#86efac;">' + AppStorage.formatBytes(info.categories.maps.bytes) + '</div>' +
          '</div>' +
        '</div>' +

        '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid rgba(56, 189, 248, 0.25);">' +
          '<button class="btn btn-primary" id="hbStorageCleanAiBtn" style="font-size:12px;">🧹 Очистить архив ИИ (' + AppStorage.formatBytes(info.categories.ai.bytes) + ')</button>' +
          '<button class="btn btn-ghost" id="hbStorageIntegrityBtn" style="font-size:12px;border:1px solid rgba(56, 189, 248, 0.35);color:#e2e8f0;">🛡️ Проверить целостность</button>' +
        '</div>' +
      '</div>';
    }

    // Default: Shinobi mode
    return '<div class="sheet-section" id="shStorageSection">' +
      '<div class="section-label" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
        '<span>💾 Память устройства и Защита данных</span>' +
        statusBadge +
      '</div>' +
      '<div class="desc">' +
        'Мониторинг объема локальной памяти браузера (квота ~5.0 МБ). Все созданные профили шиноби, техники и дзюцу защищены от потери.' +
      '</div>' +
      warningNotice +
      '<div style="margin:12px 0 6px;">' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-dim);margin-bottom:5px;font-family:Cinzel,serif;">' +
          '<span>Занято: <b style="color:var(--brass);">' + info.totalFormatted + '</b> / ' + info.maxFormatted + '</span>' +
          '<span style="font-weight:700;color:' + barColor + ';">' + info.percent + '%</span>' +
        '</div>' +
        '<div style="width:100%;height:14px;background:rgba(0,0,0,0.5);border:1px solid var(--line);border-radius:4px;overflow:hidden;padding:1px;box-sizing:border-box;">' +
          '<div style="height:100%;width:' + info.percent + '%;background:' + barColor + ';border-radius:2px;transition:width 0.4s ease;box-shadow:0 0 8px ' + barColor + ';"></div>' +
        '</div>' +
      '</div>' +

      '<div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:8px;">' +
        '<div style="background:var(--steel-1);border:1px solid var(--line);border-radius:4px;padding:8px 10px;">' +
          '<div style="font-size:11px;color:var(--ink-dim);">🤖 Архив ИИ:</div>' +
          '<div style="font-size:13px;font-weight:bold;color:#fca5a5;">' + AppStorage.formatBytes(info.categories.ai.bytes) + '</div>' +
        '</div>' +
        '<div style="background:var(--steel-1);border:1px solid var(--line);border-radius:4px;padding:8px 10px;">' +
          '<div style="font-size:11px;color:var(--ink-dim);">👥 Ростер шиноби:</div>' +
          '<div style="font-size:13px;font-weight:bold;color:#7dd3fc;">' + AppStorage.formatBytes(info.categories.profiles.bytes) + '</div>' +
        '</div>' +
        '<div style="background:var(--steel-1);border:1px solid var(--line);border-radius:4px;padding:8px 10px;">' +
          '<div style="font-size:11px;color:var(--ink-dim);">📜 Дзюцу и приёмы:</div>' +
          '<div style="font-size:13px;font-weight:bold;color:#c084fc;">' + AppStorage.formatBytes(info.categories.powers.bytes) + '</div>' +
        '</div>' +
        '<div style="background:var(--steel-1);border:1px solid var(--line);border-radius:4px;padding:8px 10px;">' +
          '<div style="font-size:11px;color:var(--ink-dim);">🗺️ Метки карты:</div>' +
          '<div style="font-size:13px;font-weight:bold;color:#86efac;">' + AppStorage.formatBytes(info.categories.maps.bytes) + '</div>' +
        '</div>' +
      '</div>' +

      '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid var(--line);">' +
        '<button class="btn btn-primary" id="shStorageCleanAiBtn">🧹 Очистить архив ИИ (' + AppStorage.formatBytes(info.categories.ai.bytes) + ')</button>' +
        '<button class="btn" id="shStorageIntegrityBtn">🛡️ Проверить целостность</button>' +
      '</div>' +
    '</div>';
  },

  bindEvents: function(mode, onUpdate){
    return AppStorage.wireWidget(mode, onUpdate);
  },

  wireWidget: function(mode, onUpdate){
    var cleanBtn = document.getElementById(mode + 'StorageCleanAiBtn');
    if(cleanBtn && !cleanBtn.__wired){
      cleanBtn.__wired = true;
      cleanBtn.onclick = function(){
        var info = AppStorage.getInfo();
        var aiBytes = info.categories.ai.bytes;
        if(aiBytes === 0){
          alert('Кэш генераций ИИ уже пуст. Лишних записей не обнаружено.');
          return;
        }
        var confirmMsg = 'Очистить историю генераций ИИ (' + AppStorage.formatBytes(aiBytes) + ')?\n\n' +
          'Ваши персонажи, созданные техники, приёмы и метки на карте НЕ пострадают. Будут удалены только временные запросы к ИИ.';
        if(!confirm(confirmMsg)) return;

        var res = AppStorage.clearAiCache(mode);
        alert('✓ Хранилище очищено!\nОсвобождено: ' + res.freedFormatted + ' (' + res.freedCount + ' записей).');
        
        var sec = document.getElementById(mode + 'StorageSection');
        if(sec){
          var temp = document.createElement('div');
          temp.innerHTML = AppStorage.renderWidget(mode);
          if(temp.firstElementChild){
            sec.parentNode.replaceChild(temp.firstElementChild, sec);
            AppStorage.wireWidget(mode, onUpdate);
          }
        }
        if(typeof onUpdate === 'function') onUpdate();
      };
    }

    var integBtn = document.getElementById(mode + 'StorageIntegrityBtn');
    if(integBtn && !integBtn.__wired){
      integBtn.__wired = true;
      integBtn.onclick = function(){
        var res = AppStorage.checkIntegrity();
        if(res.valid){
          alert('🛡️ Целостность базы данных подтверждена!\n\nПроверено ключей: ' + res.checkedCount + '\nПовреждённых или оборванных JSON-записей не обнаружено.');
        } else {
          alert('⚠️ Обнаружены повреждённые ключи (' + res.corruptedKeys.length + '):\n' + res.corruptedKeys.join(', ') + '\nРекомендуется сделать экспорт и восстановить данные.');
        }
      };
    }
  }
};

// Global interceptor for Storage.prototype.setItem
(function(){
  if(typeof window === 'undefined' || !window.Storage) return;
  var origSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, val){
    try {
      origSetItem.apply(this, arguments);
    } catch(e){
      if(e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014 || e.number === -2147024882)){
        console.warn('[AppStorage] Storage quota exceeded while saving: ' + key, e);
        if(window.AppStorage && typeof window.AppStorage.showQuotaModal === 'function'){
          window.AppStorage.showQuotaModal(key);
        }
      }
      throw e;
    }
  };
})();

render();