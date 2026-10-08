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
  {key:'space', mode:'me', icon:'🪐', ru:'Космос (Mass Effect)', items:[
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
  return DICE_LABEL_CATEGORIES.filter(c => {
    if(c.mode){
      return c.mode === curMode;
    }
    return true;
  });
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
        return renderCrumb([{label:'Космос', nav:'meHome'},{label:'Бросок костей'}]) +
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
          '<p class="subtitle">ВЕДЬМАЧЬИ ЗНАКИ // СТАЛЬ И СЕРЕБРО // БРОСОК КОСТЕЙ</p>';
      } else if(HB.mode==='hb'){
        return renderCrumb([{label:'Технологии', nav:'hbHome'},{label:'Бросок костей'}]) +
          '<button class="back" data-go="hbHome">← Назад</button>' +
          '<h1>Бросок костей</h1>' +
          '<p class="subtitle">Виртуальные кости — как за столом, только d4 не теряется под диваном.</p>';
      }
      return renderCrumb([{label:'Компендиум', nav:'home'},{label:'Бросок костей'}]) +
        '<button class="back" data-go="home">← Назад</button>' +
        '<h1>Бросок костей</h1>' +
        '<p class="subtitle">Виртуальные кости — как за столом, только d4 не теряется под диваном.</p>';
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

function newCharacter(){
  const skillProf={}; SKILL_DEFS.forEach(s=>skillProf[s.key]=0);
  const saveProf={}; ABILITY_KEYS.forEach(a=>saveProf[a]=false);
  const slots={}, slotsUsed={};
  for(let i=1;i<=9;i++){ slots[i]=0; slotsUsed[i]=0; }
  return {
    id: null,
    name:'', playerName:'', className:'', subclass:'', level:1, background:'', species:'', alignment:'', xp:0,
    abilities:{str:10,dex:10,con:10,int:10,wis:10,cha:10},
    saveProf, skillProf,
    ac:10, initMisc:0, speed:30, hpMax:0, hpCurrent:0, hpTemp:0, hitDiceTotal:1, hitDiceType:'d10',
    deathSuccess:0, deathFail:0,
    attacks:[{name:'',bonus:'',damage:'',type:''}],
    cp:0,sp:0,ep:0,gp:0,pp:0,
    equipment:'', features:'', profArmor:'', profWeapons:'', profTools:'', languages:'',
    traits:'', ideals:'', bonds:'', flaws:'',
    age:'', height:'', weight:'', eyes:'', skin:'', hair:'', backstory:'',
    spellEnabled:false, spellAbility:'int', spellNotes:'', slots, slotsUsed
  };
}

function loadCharacters(){
  try{
    const raw = localStorage.getItem('ttc_characters');
    if(!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  }catch(e){ return []; }
}
function saveCharactersToStorage(){
  try{ localStorage.setItem('ttc_characters', JSON.stringify(CHARACTERS)); }catch(e){}
}
function genId(){
  return 'char_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
}
function setPath(obj, path, value){
  const parts = path.split('.');
  let cur = obj;
  for(let i=0;i<parts.length-1;i++) cur = cur[parts[i]];
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

/* ---------- alchemy ---------- */
const ALCHEMY_DC = [
  {ru:"Определить вещество", desc:"Проверка Интеллекта (Природа/Магия) или мудрости (Медицина) СЛ 10–15 в зависимости от редкости, чтобы опознать неизвестный ингредиент или зелье."},
  {ru:"Сварить по известному рецепту", desc:"Проверка не требуется, если есть все ингредиенты, время и владение нужным набором — только затраты времени и денег."},
  {ru:"Сварить без полного рецепта", desc:"Проверка Интеллекта (использование набора) СЛ 15–20 на усмотрение мастера — риск испортить ингредиенты при провале."},
  {ru:"Стоимость и время (ориентир DMG)", desc:"1 рабочий день (8 часов) на каждые 25 зм рыночной цены предмета; расходуется материалов на половину его цены."},
  {ru:"Импровизированный яд/кислота в бою", desc:"Проверка Интеллекта (Алхимический набор) СЛ 10–15, чтобы наспех собрать простой эффект из подручных ингредиентов."}
];

function newRecipe(){
  return {
    id:null, name:'', kit:'alchemist', cost:0, time:'', dc:'',
    ingredients:[{name:'', qty:1}], effect:'', isCustom:true
  };
}
function seedRecipes(){
  return [
    {id:genId(), name:'Зелье лечения', kit:'herbalism', cost:25, time:'4 часа', dc:'',
      ingredients:[{name:'Лечебные травы',qty:2}], effect:'Восстанавливает 2к4+2 хитов при использовании.', isCustom:false},
    {id:genId(), name:'Противоядие', kit:'herbalism', cost:50, time:'4 часа', dc:'',
      ingredients:[{name:'Змеиный корень',qty:1},{name:'Дистиллированная вода',qty:1}], effect:'Даёт преимущество на спасброски против яда в течение 1 часа.', isCustom:false},
    {id:genId(), name:'Алхимический огонь', kit:'alchemist', cost:50, time:'1 рабочий день', dc:'',
      ingredients:[{name:'Горючая смола',qty:2},{name:'Стеклянная колба',qty:1}], effect:'Бросаемое оружие: 1к4 урона огнём в начале каждого хода цели, пока не потушат (действие).', isCustom:false},
    {id:genId(), name:'Кислота', kit:'alchemist', cost:25, time:'4 часа', dc:'',
      ingredients:[{name:'Едкий реагент',qty:1},{name:'Стеклянная колба',qty:1}], effect:'Бросаемое оружие: 2к6 урона кислотой при попадании.', isCustom:false}
  ];
}
function loadRecipes(){
  try{
    const raw = localStorage.getItem('ttc_recipes');
    if(!raw) return seedRecipes();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.length ? arr : seedRecipes();
  }catch(e){ return seedRecipes(); }
}
function saveRecipesToStorage(){
  try{ localStorage.setItem('ttc_recipes', JSON.stringify(RECIPES)); }catch(e){}
}

function loadIngredients(){
  try{
    const raw = localStorage.getItem('ttc_ingredients');
    if(!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  }catch(e){ return []; }
}
function saveIngredientsToStorage(){
  try{ localStorage.setItem('ttc_ingredients', JSON.stringify(INGREDIENTS)); }catch(e){}
}
function findIngredient(name){
  const norm = name.trim().toLowerCase();
  return INGREDIENTS.find(i=>i.name.trim().toLowerCase()===norm);
}

function hashColor(str){
  let h=0;
  for(let i=0;i<str.length;i++){ h = (h*31 + str.charCodeAt(i)) & 0xffffffff; }
  const hue = Math.abs(h) % 360;
  return `hsl(${hue},62%,48%)`;
}

let RECIPES = loadRecipes();
let INGREDIENTS = loadIngredients();
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

function render(){
  const app = document.getElementById('app');
  app.classList.toggle('wide', view.screen === 'map');
  app.classList.toggle('home-wide', view.screen === 'home');
  if(view.screen === 'home') app.innerHTML = renderHome();
  else if(view.screen === 'commands') app.innerHTML = renderCommands();
  else if(view.screen === 'rules2024') app.innerHTML = renderRules2024();
  else if(view.screen === 'alchemy') app.innerHTML = renderAlchemyHub();
  else if(view.screen === 'recipes') app.innerHTML = renderRecipes();
  else if(view.screen === 'recipeForm') app.innerHTML = renderRecipeForm();
  else if(view.screen === 'stock') app.innerHTML = renderStock();
  else if(view.screen === 'alchemyDC') app.innerHTML = renderAlchemyDC();
  else if(view.screen === 'subclass') app.innerHTML = renderSubclassFeatures();
  else if(view.screen === 'magic') app.innerHTML = renderMagicHub();
  else if(view.screen === 'schoolSpells') app.innerHTML = renderSchoolSpells();
  else if(view.screen === 'spellForm') app.innerHTML = renderSpellForm();
  else if(view.screen === 'class') app.innerHTML = renderClass();
  else if(view.screen === 'glossary') app.innerHTML = renderGlossaryHub();
  else if(view.screen === 'weapons') app.innerHTML = renderWeapons();
  else if(view.screen === 'dice') app.innerHTML = renderDice();
  else if(view.screen === 'map') app.innerHTML = renderMap();
  else if(view.screen === 'characters') app.innerHTML = renderCharacters();
  else if(view.screen === 'charview') app.innerHTML = renderCharacterView();
  else if(view.screen === 'sheet') app.innerHTML = renderSheet();
  else if(view.screen === 'sub') app.innerHTML = renderSub();
  wireEvents();
}

function renderCrumb(parts){
  return `<div class="crumb">${parts.map((p,i)=>{
    const isLast = i===parts.length-1;
    return (i>0?'<span class="sep">/</span>':'') +
      `<span class="seg ${isLast?'current':''}" data-nav="${p.nav||''}">${p.label}</span>`;
  }).join('')}</div>`;
}

function renderHome(){
  return `
    ${renderCrumb([{label:'Компендиум'}])}
    
    <div class="hero-dice" data-go="dice">
      <div class="hero-dice-icon">${dieShapeSvg(20,'heroDie',20)}</div>
      <div class="hero-dice-text">
        <div class="hero-dice-name">Бросок костей</div>
        <div class="hero-dice-desc">Кости d4–d20, модификатор, подпись броска и копирование готового результата</div>
      </div>
      <div class="hero-dice-arrow">→</div>
    </div>
    <div class="section-label">Инструменты</div>
    <div class="menu-list grid-2">
      <div class="menu-item util" data-go="characters">
        <div>
          <div class="name">Персонажи</div>
          <div class="desc">Карточки персонажей: создание, просмотр, экспорт</div>
        </div>
        <div class="arrow">→</div>
      </div>
      <div class="menu-item util" data-go="commands">
        <div>
          <div class="name">Общие команды</div>
          <div class="desc">Шаблоны бросков: проверки, спасброски, атака, урон</div>
        </div>
        <div class="arrow">→</div>
      </div>
      <div class="menu-item util" data-go="rules2024">
        <div>
          <div class="name">Правила 2024</div>
          <div class="desc">Мастерство оружия, состояния, истощение, укрытие</div>
        </div>
        <div class="arrow">→</div>
      </div>
      <div class="menu-item util" data-go="alchemy">
        <div>
          <div class="name">Алхимия</div>
          <div class="desc">Рецепты, запасы ингредиентов, варение зелий</div>
        </div>
        <div class="arrow">→</div>
      </div>
      <div class="menu-item util" data-go="magic">
        <div>
          <div class="name">Магия</div>
          <div class="desc">Заклинания по школам — общая база для всех заклинателей</div>
        </div>
        <div class="arrow">→</div>
      </div>
      <div class="menu-item util" data-go="map">
        <div>
          <div class="name">Карта Фаэруна</div>
          <div class="desc">Интерактивная карта мира прямо на странице</div>
        </div>
        <div class="arrow">→</div>
      </div>
    </div>
    <div class="section-label">Классы</div>
    <div class="menu-list grid-2">
      <div class="menu-item" data-go="class:fighter">
        <div>
          <div class="name">Воин</div>
          <div class="desc">Мастер клинка, дисциплины и превосходства в бою</div>
        </div>
        <div class="arrow">→</div>
      </div>
      <div class="menu-item disabled">
        <div>
          <div class="name">Другие классы</div>
          <div class="desc">Варвар, Плут, Чародей и остальные</div>
        </div>
        <div class="tag-soon">скоро</div>
      </div>
    </div>
  `;
}

function cardHtml(c){
  const genBtn = c.roll ? `<button class="gen-btn" data-template="${escapeAttr(c.template)}" data-count="${c.roll.count}" data-sides="${c.roll.sides}" data-mode="${c.roll.mode||'sum'}">Сгенерировать и скопировать результат</button>` : '';
  const genOverlay = c.roll ? `<div class="gen-stamp"><div class="gen-die"></div></div>` : '';
  const icon = c.icon ? `<span class="card-emoji">${c.icon}</span>` : '';
  return `
    <div class="card ${c.featured?'featured':''}" data-copy="${escapeAttr(c.template)}">
      <div class="top-row">
        <div class="name">${icon}${c.ru}</div>
        <div class="die-badge">${c.die}</div>
      </div>
      <div class="tmpl">${escapeHtml(c.template)}</div>
      <div class="desc">${c.desc}</div>
      ${genBtn}
      <div class="stamp"><span>Скопировано</span></div>
      ${genOverlay}
    </div>`;
}

function renderCommands(){
  const featured = CORE_COMMANDS.find(c=>c.featured);
  const rest = CORE_COMMANDS.filter(c=>!c.featured);

  return `
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Общие команды'}])}
    <button class="back" data-go="home">← Назад</button>
    <h1>Общие команды</h1>
    <p class="subtitle">Клик копирует заготовку в буфер — вставьте и впишите итоговое число.</p>
    <div class="rule"></div>
    ${cardHtml(featured)}
    <div class="grid" style="margin-top:14px;">${rest.map(cardHtml).join('')}</div>

    <div class="section-label">Характеристики</div>
    <p style="font-size:13px;color:var(--ink-dim);font-style:italic;margin:-6px 0 14px;">Когда мастер просит просто «проверку Харизмы» или «проверку Мудрости», без конкретного навыка.</p>
    <div class="grid">${ABILITY_CHECKS.map(cardHtml).join('')}</div>

    <div class="section-label">Навыки</div>
    <div class="grid">${SKILLS.map(cardHtml).join('')}</div>

    <div class="section-label">Спасброски</div>
    <div class="grid">${SAVES.map(cardHtml).join('')}</div>
  `;
}

function renderGlossaryHub(){
  return `
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Воин', nav:'class:fighter'},{label:'Справочник терминов'}])}
    <button class="back" data-go="class:fighter">← Назад</button>
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
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Воин', nav:'class:fighter'},{label:'Справочник терминов', nav:'glossary'},{label:'Бой оружием'}])}
    <button class="back" data-go="glossary">← Назад</button>
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
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Карта Фаэруна'}])}
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

function renderCharacters(){
  const items = CHARACTERS.map(c=>{
    const bits = [c.className||'Без класса', c.level?('ур. '+c.level):null, c.species||null].filter(Boolean).join(' · ');
    return `
      <div class="char-list-item" data-go="charview:${c.id}">
        <div>
          <div class="name">${escapeHtml(c.name||'Без имени')}</div>
          <div class="desc">${escapeHtml(bits||'Черновик')}</div>
        </div>
        <div class="arrow">→</div>
      </div>`;
  }).join('');

  return `
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Персонажи'}])}
    <button class="back" data-go="home">← Назад</button>
    <h1>Персонажи</h1>
    <p class="subtitle">Выбери сохранённую карточку или создай новую.</p>
    <div class="rule"></div>
    <button class="new-char-btn" data-go="sheet:new">+ Создать нового персонажа</button>
    ${items || '<div class="char-empty">Пока нет сохранённых персонажей.</div>'}
    <div class="import-row">
      <input type="file" id="importFile" accept="application/json,.json" style="display:none;">
      <button class="btn-ghost" id="importBtn">⬆️ Импортировать из файла</button>
    </div>
  `;
}

function initDraftForView(){
  if(view.charId && view.charId!=='new'){
    const existing = CHARACTERS.find(c=>c.id===view.charId);
    charDraft = existing ? JSON.parse(JSON.stringify(existing)) : newCharacter();
  } else {
    charDraft = newCharacter();
  }
}

function abilityBoxHtml(key){
  const d=charDraft;
  return `
    <div class="ability-box">
      <label>${ABILITY_RU[key]}</label>
      <input type="number" min="1" max="30" data-field="abilities.${key}" value="${d.abilities[key]}">
      <div class="mod" id="am-${key}">${fmtMod(abilityMod(d.abilities[key]))}</div>
    </div>`;
}
function saveRowHtml(key){
  const d=charDraft;
  const prof = d.saveProf[key];
  const mod = abilityMod(d.abilities[key]) + (prof?profBonus(d.level):0);
  return `
    <div class="save-row">
      <input type="checkbox" data-field="saveProf.${key}" ${prof?'checked':''}>
      <div class="ab-name">${ABILITY_RU[key]}</div>
      <div class="bonus-val" id="saveBonus-${key}">${fmtMod(mod)}</div>
    </div>`;
}
function skillRowHtml(def){
  const d=charDraft;
  const state = d.skillProf[def.key]||0;
  const mod = abilityMod(d.abilities[def.ability]) + state*profBonus(d.level);
  const abAbbr = ABILITY_ABBR[ABILITY_RU[def.ability]]||'';
  return `
    <div class="skill-row">
      <button type="button" class="prof-toggle" data-skill-toggle="${def.key}" data-state="${state}" title="Клик — владение / экспертиза / сброс"></button>
      <div class="sk-name">${def.ru}</div>
      <div class="sk-ab">${abAbbr}</div>
      <div class="bonus-val" id="skillBonus-${def.key}">${fmtMod(mod)}</div>
    </div>`;
}
function attackRowHtml(a, idx){
  return `
    <div class="attack-row" data-attack-row="${idx}">
      <input type="text" placeholder="Название" data-attack-idx="${idx}" data-attack-field="name" value="${escapeAttr(a.name||'')}">
      <input type="text" placeholder="Бонус" data-attack-idx="${idx}" data-attack-field="bonus" value="${escapeAttr(a.bonus||'')}">
      <input type="text" placeholder="Урон" data-attack-idx="${idx}" data-attack-field="damage" value="${escapeAttr(a.damage||'')}">
      <input type="text" placeholder="Тип" data-attack-idx="${idx}" data-attack-field="type" value="${escapeAttr(a.type||'')}">
      <button type="button" class="row-remove" data-remove-attack="${idx}" title="Убрать">✕</button>
    </div>`;
}
function slotBoxHtml(lvl){
  const d=charDraft;
  return `
    <div class="slot-box">
      <span class="sb-label">Ур. ${lvl}</span>
      <div class="sb-inputs">
        <input type="number" min="0" data-slot-level="${lvl}" data-slot-kind="used" value="${d.slotsUsed[lvl]||0}">
        <span class="sb-sep">/</span>
        <input type="number" min="0" data-slot-level="${lvl}" data-slot-kind="max" value="${d.slots[lvl]||0}">
      </div>
    </div>`;
}

function renderSheet(){
  initDraftForView();
  const d = charDraft;
  const isExisting = !!(view.charId && view.charId!=='new' && CHARACTERS.find(c=>c.id===view.charId));
  const pb = profBonus(d.level);
  const passivePerception = 10 + abilityMod(d.abilities.wis) + (d.skillProf.perception||0)*pb;
  const initTotal = abilityMod(d.abilities.dex) + Number(d.initMisc||0);

  const abilityBoxes = ABILITY_KEYS.map(abilityBoxHtml).join('');
  const saveRows = ABILITY_KEYS.map(saveRowHtml).join('');
  const skillRows = SKILL_DEFS.map(skillRowHtml).join('');
  const attackRows = d.attacks.map((a,i)=>attackRowHtml(a,i)).join('');
  const slotBoxes = Array.from({length:9},(_,i)=>i+1).map(slotBoxHtml).join('');

  return `
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Персонажи', nav:'characters'},{label: d.name || 'Новый персонаж'}])}
    <button class="back" data-go="${isExisting ? ('charview:'+d.id) : 'characters'}">← Назад</button>
    <h1>${escapeHtml(d.name || 'Новый персонаж')}</h1>
    <p class="subtitle">Изменения применяются сразу, но сохраняются только по кнопке «Сохранить».</p>
    <div class="rule"></div>

    <div class="sheet-actions">
      <button class="btn-primary" id="saveCharBtn">💾 Сохранить</button>
      <button class="btn-ghost" id="exportCharBtn">⬇️ Экспорт JSON</button>
      <button class="btn-ghost" id="copyCharBtn">📋 Скопировать как текст</button>
      ${isExisting ? '<button class="btn-ghost" id="deleteCharBtn" style="color:var(--crimson-bright);border-color:var(--crimson-bright);">🗑 Удалить</button>' : ''}
    </div>

    <div id="sheetRoot">

    <div class="sheet-section">
      <div class="section-label">Основное</div>
      <div class="sheet-grid">
        <div class="field"><label>Имя персонажа</label><input type="text" data-field="name" value="${escapeAttr(d.name)}"></div>
        <div class="field"><label>Игрок</label><input type="text" data-field="playerName" value="${escapeAttr(d.playerName)}"></div>
        <div class="field"><label>Класс</label><input type="text" data-field="className" value="${escapeAttr(d.className)}"></div>
        <div class="field"><label>Архетип</label><input type="text" data-field="subclass" value="${escapeAttr(d.subclass)}"></div>
        <div class="field"><label>Уровень</label><input type="number" min="1" max="20" data-field="level" value="${d.level}"></div>
        <div class="field"><label>Предыстория</label><input type="text" data-field="background" value="${escapeAttr(d.background)}"></div>
        <div class="field"><label>Вид</label><input type="text" data-field="species" value="${escapeAttr(d.species)}"></div>
        <div class="field"><label>Мировоззрение</label><input type="text" data-field="alignment" value="${escapeAttr(d.alignment)}"></div>
        <div class="field"><label>Опыт</label><input type="number" min="0" data-field="xp" value="${d.xp}"></div>
        <div class="field"><label>Бонус мастерства</label><div class="readonly-val" id="pbVal" style="padding-top:9px;">${fmtMod(pb)}</div></div>
      </div>
    </div>

    <div class="sheet-section">
      <div class="section-label">Характеристики</div>
      <div class="ability-row">${abilityBoxes}</div>
    </div>

    <div class="sheet-section">
      <div class="section-label">Спасброски</div>
      ${saveRows}
    </div>

    <div class="sheet-section">
      <div class="section-label">Навыки</div>
      ${skillRows}
    </div>

    <div class="sheet-section">
      <div class="section-label">Боевые параметры</div>
      <div class="combat-strip">
        <div class="combat-box"><span class="cb-label">КД</span><input type="number" data-field="ac" value="${d.ac}"></div>
        <div class="combat-box"><span class="cb-label">Инициатива</span><div class="readonly-val" id="initTotal">${fmtMod(initTotal)}</div></div>
        <div class="combat-box"><span class="cb-label">Скорость</span><input type="number" data-field="speed" value="${d.speed}"></div>
        <div class="combat-box"><span class="cb-label">Хиты (макс)</span><input type="number" data-field="hpMax" value="${d.hpMax}"></div>
        <div class="combat-box"><span class="cb-label">Хиты (тек.)</span><input type="number" data-field="hpCurrent" value="${d.hpCurrent}"></div>
        <div class="combat-box"><span class="cb-label">Врем. хиты</span><input type="number" data-field="hpTemp" value="${d.hpTemp}"></div>
        <div class="combat-box"><span class="cb-label">Кости хитов</span><input type="text" data-field="hitDiceTotal" value="${escapeAttr(String(d.hitDiceTotal))}" style="text-align:center;"></div>
        <div class="combat-box"><span class="cb-label">Тип кости</span><input type="text" data-field="hitDiceType" value="${escapeAttr(d.hitDiceType)}" style="text-align:center;"></div>
        <div class="combat-box"><span class="cb-label">Пасс. восприятие</span><div class="readonly-val" id="passivePerception">${passivePerception}</div></div>
      </div>
      <div class="death-row">
        <span class="dr-cap">Спасброски от смерти — успехи</span>
        ${[1,2,3].map(i=>`<button type="button" class="death-dot ${d.deathSuccess>=i?'on-success':''}" data-death="success:${i}"></button>`).join('')}
        <span class="dr-cap" style="margin-left:16px;">провалы</span>
        ${[1,2,3].map(i=>`<button type="button" class="death-dot ${d.deathFail>=i?'on-fail':''}" data-death="fail:${i}"></button>`).join('')}
      </div>
    </div>

    <div class="sheet-section">
      <div class="section-label">Атаки и заклинания в бою</div>
      <div id="attacksList">${attackRows}</div>
      <button type="button" class="add-row-btn" id="addAttackBtn">+ Добавить атаку</button>
    </div>

    <div class="sheet-section">
      <div class="section-label">Снаряжение</div>
      <div class="currency-row">
        <div class="field"><label>ММ</label><input type="number" data-field="cp" value="${d.cp}"></div>
        <div class="field"><label>СМ</label><input type="number" data-field="sp" value="${d.sp}"></div>
        <div class="field"><label>ЭМ</label><input type="number" data-field="ep" value="${d.ep}"></div>
        <div class="field"><label>ЗМ</label><input type="number" data-field="gp" value="${d.gp}"></div>
        <div class="field"><label>ПМ</label><input type="number" data-field="pp" value="${d.pp}"></div>
      </div>
      <div class="field" style="margin-top:12px;"><label>Инвентарь</label><textarea data-field="equipment">${escapeHtml(d.equipment)}</textarea></div>
    </div>

    <div class="sheet-section">
      <div class="section-label">Умения и черты</div>
      <div class="field"><textarea data-field="features" placeholder="Особенности класса, вида, черты...">${escapeHtml(d.features)}</textarea></div>
    </div>

    <div class="sheet-section">
      <div class="section-label">Владения и языки</div>
      <div class="sheet-grid">
        <div class="field"><label>Доспехи</label><input type="text" data-field="profArmor" value="${escapeAttr(d.profArmor)}"></div>
        <div class="field"><label>Оружие</label><input type="text" data-field="profWeapons" value="${escapeAttr(d.profWeapons)}"></div>
        <div class="field"><label>Инструменты</label><input type="text" data-field="profTools" value="${escapeAttr(d.profTools)}"></div>
        <div class="field"><label>Языки</label><input type="text" data-field="languages" value="${escapeAttr(d.languages)}"></div>
      </div>
    </div>

    <div class="sheet-section">
      <div class="section-label">Личность</div>
      <div class="sheet-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr));">
        <div class="field"><label>Черты характера</label><textarea data-field="traits">${escapeHtml(d.traits)}</textarea></div>
        <div class="field"><label>Идеалы</label><textarea data-field="ideals">${escapeHtml(d.ideals)}</textarea></div>
        <div class="field"><label>Привязанности</label><textarea data-field="bonds">${escapeHtml(d.bonds)}</textarea></div>
        <div class="field"><label>Слабости</label><textarea data-field="flaws">${escapeHtml(d.flaws)}</textarea></div>
      </div>
    </div>

    <div class="sheet-section">
      <div class="section-label">Внешность и предыстория</div>
      <div class="sheet-grid">
        <div class="field"><label>Возраст</label><input type="text" data-field="age" value="${escapeAttr(d.age)}"></div>
        <div class="field"><label>Рост</label><input type="text" data-field="height" value="${escapeAttr(d.height)}"></div>
        <div class="field"><label>Вес</label><input type="text" data-field="weight" value="${escapeAttr(d.weight)}"></div>
        <div class="field"><label>Глаза</label><input type="text" data-field="eyes" value="${escapeAttr(d.eyes)}"></div>
        <div class="field"><label>Кожа</label><input type="text" data-field="skin" value="${escapeAttr(d.skin)}"></div>
        <div class="field"><label>Волосы</label><input type="text" data-field="hair" value="${escapeAttr(d.hair)}"></div>
      </div>
      <div class="field" style="margin-top:12px;"><label>История персонажа</label><textarea data-field="backstory" style="min-height:120px;">${escapeHtml(d.backstory)}</textarea></div>
    </div>

    <div class="sheet-section">
      <div class="section-label">Заклинания</div>
      <div class="spell-toggle-row">
        <input type="checkbox" id="spellEnabledCk" data-field="spellEnabled" ${d.spellEnabled?'checked':''}>
        <label for="spellEnabledCk" style="font-size:14.5px;color:var(--ink-dim);">Персонаж — заклинатель</label>
      </div>
      <div id="spellBlock" style="${d.spellEnabled?'':'display:none;'}">
        <div class="sheet-grid" style="margin-bottom:16px;">
          <div class="field">
            <label>Базовая характеристика</label>
            <select data-field="spellAbility">
              ${ABILITY_KEYS.map(k=>`<option value="${k}" ${d.spellAbility===k?'selected':''}>${ABILITY_RU[k]}</option>`).join('')}
            </select>
          </div>
          <div class="field"><label>Сложность спасброска</label><div class="readonly-val" id="spellDC" style="padding-top:9px;">${8+pb+abilityMod(d.abilities[d.spellAbility])}</div></div>
          <div class="field"><label>Бонус атаки заклинанием</label><div class="readonly-val" id="spellAtk" style="padding-top:9px;">${fmtMod(pb+abilityMod(d.abilities[d.spellAbility]))}</div></div>
        </div>
        <div class="slot-grid">${slotBoxes}</div>
        <div class="field"><label>Известные / подготовленные заклинания</label><textarea data-field="spellNotes" style="min-height:110px;">${escapeHtml(d.spellNotes)}</textarea></div>
      </div>
    </div>

    </div>
  `;
}

function recomputeDerived(){
  const d = charDraft;
  const pb = profBonus(d.level);
  ABILITY_KEYS.forEach(k=>{
    const el = document.getElementById('am-'+k);
    if(el) el.textContent = fmtMod(abilityMod(d.abilities[k]));
    const sEl = document.getElementById('saveBonus-'+k);
    if(sEl) sEl.textContent = fmtMod(abilityMod(d.abilities[k]) + (d.saveProf[k]?pb:0));
  });
  SKILL_DEFS.forEach(def=>{
    const el = document.getElementById('skillBonus-'+def.key);
    if(el){
      const state = d.skillProf[def.key]||0;
      el.textContent = fmtMod(abilityMod(d.abilities[def.ability]) + state*pb);
    }
  });
  const pbVal = document.getElementById('pbVal');
  if(pbVal) pbVal.textContent = fmtMod(pb);
  const pp = document.getElementById('passivePerception');
  if(pp) pp.textContent = 10 + abilityMod(d.abilities.wis) + (d.skillProf.perception||0)*pb;
  const initEl = document.getElementById('initTotal');
  if(initEl) initEl.textContent = fmtMod(abilityMod(d.abilities.dex) + Number(d.initMisc||0));
  const dcEl = document.getElementById('spellDC');
  if(dcEl) dcEl.textContent = 8 + pb + abilityMod(d.abilities[d.spellAbility]);
  const atkEl = document.getElementById('spellAtk');
  if(atkEl) atkEl.textContent = fmtMod(pb + abilityMod(d.abilities[d.spellAbility]));
}

function addAttackRow(){
  charDraft.attacks.push({name:'',bonus:'',damage:'',type:''});
  const list = document.getElementById('attacksList');
  if(list){
    const idx = charDraft.attacks.length-1;
    list.insertAdjacentHTML('beforeend', attackRowHtml(charDraft.attacks[idx], idx));
  }
}
function removeAttackRow(idx){
  charDraft.attacks.splice(idx,1);
  const list = document.getElementById('attacksList');
  if(list) list.innerHTML = charDraft.attacks.map((a,i)=>attackRowHtml(a,i)).join('');
}

function upsertCharacter(){
  const d = charDraft;
  if(!d.id) d.id = genId();
  const i = CHARACTERS.findIndex(c=>c.id===d.id);
  const copy = JSON.parse(JSON.stringify(d));
  if(i>=0) CHARACTERS[i]=copy; else CHARACTERS.push(copy);
  saveCharactersToStorage();
  view.charId = d.id;
}

function deleteCharacter(id){
  CHARACTERS = CHARACTERS.filter(c=>c.id!==id);
  saveCharactersToStorage();
}

function exportCharacterJson(){
  const d = charDraft;
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
      const base = newCharacter();
      const merged = Object.assign(base, data, {id:null});
      merged.id = genId();
      CHARACTERS.push(merged);
      saveCharactersToStorage();
      render();
    }catch(e){
      alert('Не удалось прочитать файл — это не корректный JSON карточки персонажа.');
    }
  };
  reader.readAsText(file);
}

function copyCharacterAsText(){
  const d = charDraft;
  const pb = profBonus(d.level);
  const abLine = ABILITY_KEYS.map(k=>`${ABILITY_RU[k]} ${d.abilities[k]} (${fmtMod(abilityMod(d.abilities[k]))})`).join(', ');
  const skillsProf = SKILL_DEFS.filter(s=>(d.skillProf[s.key]||0)>0)
    .map(s=>`${s.ru} ${fmtMod(abilityMod(d.abilities[s.ability])+(d.skillProf[s.key])*pb)}${d.skillProf[s.key]===2?' (эксперт.)':''}`)
    .join(', ') || '—';
  const attacksText = d.attacks.filter(a=>a.name).map(a=>`  ${a.name}: ${a.bonus||'—'} попадание, ${a.damage||'—'} ${a.type||''}`).join('\n') || '  —';
  const lines = [
    `${d.name||'Без имени'} — ${d.className||'?'}${d.subclass?(' ('+d.subclass+')'):''}, уровень ${d.level}`,
    `${d.species||''} ${d.background?('· '+d.background):''} ${d.alignment?('· '+d.alignment):''}`.trim(),
    `Бонус мастерства: ${fmtMod(pb)}`,
    `Характеристики: ${abLine}`,
    `КД ${d.ac} · Инициатива ${fmtMod(abilityMod(d.abilities.dex)+Number(d.initMisc||0))} · Скорость ${d.speed} фт.`,
    `Хиты: ${d.hpCurrent}/${d.hpMax}${d.hpTemp?(' (+'+d.hpTemp+' врем.)'):''} · Кости хитов: ${d.hitDiceTotal}${d.hitDiceType}`,
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

function abilityViewBoxHtml(key, d){
  return `
    <div class="ability-box">
      <label>${ABILITY_RU[key]}</label>
      <div style="font-family:'Cinzel',serif;font-size:19px;color:var(--ink);padding:6px 0;">${d.abilities[key]}</div>
      <div class="mod">${fmtMod(abilityMod(d.abilities[key]))}</div>
    </div>`;
}
function saveViewRowHtml(key, d, pb){
  const prof = d.saveProf[key];
  const mod = abilityMod(d.abilities[key]) + (prof?pb:0);
  return `
    <div class="save-row">
      <span class="prof-dot ${prof?'state1':''}"></span>
      <div class="ab-name">${ABILITY_RU[key]}</div>
      <div class="bonus-val">${fmtMod(mod)}</div>
    </div>`;
}
function skillViewRowHtml(def, d, pb){
  const state = d.skillProf[def.key]||0;
  const mod = abilityMod(d.abilities[def.ability]) + state*pb;
  const abAbbr = ABILITY_ABBR[ABILITY_RU[def.ability]]||'';
  return `
    <div class="skill-row">
      <span class="prof-dot ${state===1?'state1':(state===2?'state2':'')}"></span>
      <div class="sk-name">${def.ru}</div>
      <div class="sk-ab">${abAbbr}</div>
      <div class="bonus-val">${fmtMod(mod)}</div>
    </div>`;
}
function attackViewRowHtml(a){
  return `
    <div class="attack-view-row">
      <span>${escapeHtml(a.name)}</span>
      <span class="av-bonus">${escapeHtml(a.bonus||'—')}</span>
      <span>${escapeHtml(a.damage||'—')}${a.type?(' '+escapeHtml(a.type)):''}</span>
    </div>`;
}
function viewTextBlock(label, value){
  if(!value) return '';
  return `
    <div class="view-text-block">
      ${label ? `<div class="vtb-label">${label}</div>` : ''}
      <div class="vtb-body">${escapeHtml(value)}</div>
    </div>`;
}

function renderCharacterView(){
  const d = CHARACTERS.find(c=>c.id===view.charId);
  if(!d){
    view = {screen:'characters'};
    return renderCharacters();
  }
  charDraft = JSON.parse(JSON.stringify(d)); // чтобы экспорт/копирование текста работали с этого экрана тоже

  const pb = profBonus(d.level);
  const passivePerception = 10 + abilityMod(d.abilities.wis) + (d.skillProf.perception||0)*pb;
  const initTotal = abilityMod(d.abilities.dex) + Number(d.initMisc||0);

  const abilityBoxes = ABILITY_KEYS.map(k=>abilityViewBoxHtml(k,d)).join('');
  const saveRows = ABILITY_KEYS.map(k=>saveViewRowHtml(k,d,pb)).join('');
  const skillRows = SKILL_DEFS.map(def=>skillViewRowHtml(def,d,pb)).join('');
  const attackRows = d.attacks.filter(a=>a.name).map(attackViewRowHtml).join('') || '<div class="char-empty" style="padding:10px 0;">Нет записанных атак</div>';

  const headerLine1 = [d.className||'Без класса', d.subclass, d.level?('уровень '+d.level):null].filter(Boolean).join(' · ');
  const headerLine2 = [d.species, d.background, d.alignment].filter(Boolean).join(' · ');

  const currencyBits = [['pp','ПМ'],['gp','ЗМ'],['ep','ЭМ'],['sp','СМ'],['cp','ММ']]
    .filter(([k])=>Number(d[k])>0).map(([k,label])=>`<span><b>${d[k]}</b> ${label}</span>`).join('');

  const spellBlock = d.spellEnabled ? `
    <div class="sheet-section">
      <div class="section-label">Заклинания</div>
      <div class="combat-strip">
        <div class="combat-box"><span class="cb-label">Характеристика</span><div class="readonly-val">${ABILITY_RU[d.spellAbility]}</div></div>
        <div class="combat-box"><span class="cb-label">Сложность спасброска</span><div class="readonly-val">${8+pb+abilityMod(d.abilities[d.spellAbility])}</div></div>
        <div class="combat-box"><span class="cb-label">Атака заклинанием</span><div class="readonly-val">${fmtMod(pb+abilityMod(d.abilities[d.spellAbility]))}</div></div>
      </div>
      <div class="slot-grid">${Array.from({length:9},(_,i)=>i+1).map(lvl=>`
        <div class="slot-box"><span class="sb-label">Ур. ${lvl}</span><div>${d.slotsUsed[lvl]||0} / ${d.slots[lvl]||0}</div></div>
      `).join('')}</div>
      ${viewTextBlock('Известные / подготовленные заклинания', d.spellNotes)}
    </div>` : '';

  return `
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Персонажи', nav:'characters'},{label: d.name || 'Без имени'}])}
    <button class="back" data-go="characters">← Назад</button>

    <div class="char-view-header">
      <div class="cv-name">${escapeHtml(d.name||'Без имени')}</div>
      <div class="cv-line">${escapeHtml(headerLine1)}</div>
      ${headerLine2?`<div class="cv-line">${escapeHtml(headerLine2)}</div>`:''}
    </div>

    <div class="sheet-actions">
      <button class="btn-primary" id="editCharBtn" data-go="sheet:${d.id}">✏️ Редактировать</button>
      <button class="btn-ghost" id="exportCharBtn">⬇️ Экспорт JSON</button>
      <button class="btn-ghost" id="copyCharBtn">📋 Скопировать как текст</button>
      <button class="btn-ghost" id="deleteCharBtn" style="color:var(--crimson-bright);border-color:var(--crimson-bright);">🗑 Удалить</button>
    </div>

    <div class="sheet-section">
      <div class="section-label">Характеристики</div>
      <div class="ability-row">${abilityBoxes}</div>
    </div>

    <div class="sheet-section">
      <div class="section-label">Боевые параметры</div>
      <div class="combat-strip">
        <div class="combat-box"><span class="cb-label">КД</span><div class="readonly-val">${d.ac}</div></div>
        <div class="combat-box"><span class="cb-label">Инициатива</span><div class="readonly-val">${fmtMod(initTotal)}</div></div>
        <div class="combat-box"><span class="cb-label">Скорость</span><div class="readonly-val">${d.speed}</div></div>
        <div class="combat-box"><span class="cb-label">Хиты</span><div class="readonly-val">${d.hpCurrent}/${d.hpMax}${d.hpTemp?(' +'+d.hpTemp):''}</div></div>
        <div class="combat-box"><span class="cb-label">Кости хитов</span><div class="readonly-val" style="font-size:15px;">${escapeHtml(String(d.hitDiceTotal))}${escapeHtml(d.hitDiceType)}</div></div>
        <div class="combat-box"><span class="cb-label">Бонус мастерства</span><div class="readonly-val">${fmtMod(pb)}</div></div>
        <div class="combat-box"><span class="cb-label">Пасс. восприятие</span><div class="readonly-val">${passivePerception}</div></div>
      </div>
    </div>

    <div class="sheet-section">
      <div class="section-label">Спасброски</div>
      ${saveRows}
    </div>

    <div class="sheet-section">
      <div class="section-label">Навыки</div>
      ${skillRows}
    </div>

    <div class="sheet-section">
      <div class="section-label">Атаки</div>
      ${attackRows}
    </div>

    <div class="sheet-section">
      <div class="section-label">Снаряжение</div>
      ${currencyBits ? `<div class="currency-view-strip">${currencyBits}</div>` : ''}
      ${viewTextBlock('Инвентарь', d.equipment)}
    </div>

    ${d.features ? `<div class="sheet-section"><div class="section-label">Умения и черты</div>${viewTextBlock('', d.features)}</div>` : ''}

    <div class="sheet-section">
      <div class="section-label">Владения и языки</div>
      <div class="sheet-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));">
        ${viewTextBlock('Доспехи', d.profArmor)}
        ${viewTextBlock('Оружие', d.profWeapons)}
        ${viewTextBlock('Инструменты', d.profTools)}
        ${viewTextBlock('Языки', d.languages)}
      </div>
    </div>

    <div class="sheet-section">
      <div class="section-label">Личность</div>
      <div class="sheet-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr));">
        ${viewTextBlock('Черты характера', d.traits)}
        ${viewTextBlock('Идеалы', d.ideals)}
        ${viewTextBlock('Привязанности', d.bonds)}
        ${viewTextBlock('Слабости', d.flaws)}
      </div>
    </div>

    <div class="sheet-section">
      <div class="section-label">Внешность и история</div>
      <div class="sheet-grid" style="margin-bottom:12px;">
        ${viewTextBlock('Возраст', d.age)}
        ${viewTextBlock('Рост', d.height)}
        ${viewTextBlock('Вес', d.weight)}
        ${viewTextBlock('Глаза', d.eyes)}
        ${viewTextBlock('Кожа', d.skin)}
        ${viewTextBlock('Волосы', d.hair)}
      </div>
      ${viewTextBlock('История персонажа', d.backstory)}
    </div>

    ${spellBlock}
  `;
}

function renderRules2024(){
  return `
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Правила 2024'}])}
    <button class="back" data-go="home">← Назад</button>
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

function flaskSvg(uid, color){
  const clipId = 'flaskClip_'+uid;
  const shape = 'M38,8 L38,42 L18,118 Q18,132 33,132 L67,132 Q82,132 82,118 L62,42 L62,8 Z';
  return `<svg class="flask" viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="${clipId}"><path d="${shape}"/></clipPath></defs>
    <g clip-path="url(#${clipId})">
      <rect class="flask-liquid" x="10" y="135" width="80" height="0" fill="${color}"></rect>
    </g>
    <path d="${shape}" fill="none" stroke="var(--ink-dim)" stroke-width="3"/>
    <line x1="30" y1="8" x2="70" y2="8" stroke="var(--ink-dim)" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}

function recipeCardHtml(r){
  const kitLabel = r.kit==='herbalism' ? 'Набор травника' : 'Алхимический набор';
  const ingRows = (r.ingredients||[]).filter(i=>i.name).map(ing=>{
    const stock = findIngredient(ing.name);
    const have = stock ? stock.qty : 0;
    const cls = have>=ing.qty ? 'have' : 'short';
    return `<div class="rc-ing-row"><span>${escapeHtml(ing.name)}</span><span class="${cls}">${have}/${ing.qty}</span></div>`;
  }).join('') || '<div class="rc-ing-row"><span>Без ингредиентов</span></div>';
  const uid = 'flask'+Math.random().toString(36).slice(2,8);
  return `
    <div class="recipe-card" data-recipe-id="${r.id}">
      <div class="rc-top">
        <div>
          <div class="rc-name">${escapeHtml(r.name||'Без названия')}</div>
          <div class="rc-meta">${r.cost||0} зм · ${escapeHtml(r.time||'—')}${r.dc?(' · СЛ '+escapeHtml(String(r.dc))):''}</div>
        </div>
        <span class="kit-badge">${kitLabel}</span>
      </div>
      <div class="rc-ingredients">${ingRows}</div>
      ${r.effect?`<div class="rc-effect">${escapeHtml(r.effect)}</div>`:''}
      <div class="rc-actions">
        <button type="button" class="rc-btn brew" data-brew="${r.id}">⚗️ Сварить</button>
        <button type="button" class="rc-btn" data-go="recipeForm:${r.id}">Изменить</button>
        <button type="button" class="rc-btn" data-delete-recipe="${r.id}" style="color:var(--crimson-bright);">Удалить</button>
      </div>
      <div class="rc-missing-note" style="display:none;"></div>
      <div class="brew-overlay">
        ${flaskSvg(uid, hashColor(r.name||uid))}
        <div class="brew-label"></div>
      </div>
    </div>`;
}

function attemptBrew(recipeId){
  const recipe = RECIPES.find(r=>r.id===recipeId);
  if(!recipe) return;
  const missing = [];
  (recipe.ingredients||[]).forEach(ing=>{
    if(!ing.name) return;
    const stock = findIngredient(ing.name);
    const have = stock ? stock.qty : 0;
    if(have < ing.qty) missing.push(`${ing.name} (нужно ${ing.qty}, есть ${have})`);
  });
  const card = document.querySelector(`.recipe-card[data-recipe-id="${recipeId}"]`);
  if(missing.length){
    const note = card ? card.querySelector('.rc-missing-note') : null;
    if(note){ note.textContent = 'Не хватает: '+missing.join(', '); note.style.display='block'; }
    return;
  }
  const note = card ? card.querySelector('.rc-missing-note') : null;
  if(note) note.style.display='none';

  (recipe.ingredients||[]).forEach(ing=>{
    if(!ing.name) return;
    const stock = findIngredient(ing.name);
    if(stock) stock.qty -= ing.qty;
  });
  INGREDIENTS = INGREDIENTS.filter(i=>i.qty>0);
  saveIngredientsToStorage();
  copyText(`*[Сварено: ${recipe.name}]*`);

  if(card){
    const overlay = card.querySelector('.brew-overlay');
    const label = card.querySelector('.brew-label');
    const liquid = card.querySelector('.flask-liquid');
    if(label) label.textContent = 'Сварено: '+recipe.name;
    if(overlay) overlay.classList.add('active');
    if(liquid){
      liquid.setAttribute('y','135'); liquid.setAttribute('height','0');
      const raf = typeof requestAnimationFrame==='function' ? requestAnimationFrame : (fn)=>setTimeout(fn,16);
      raf(()=>{ raf(()=>{
        liquid.setAttribute('y','48'); liquid.setAttribute('height','87');
      });});
    }
    setTimeout(()=>{ if(overlay) overlay.classList.remove('active'); render(); }, 1900);
  } else {
    render();
  }
}

function renderAlchemyHub(){
  return `
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Алхимия'}])}
    <button class="back" data-go="home">← Назад</button>
    <h1>Алхимия</h1>
    <p class="subtitle">Рецепты, запасы ингредиентов и справочник по крафту.</p>
    <div class="rule"></div>
    <div class="menu-list">
      <div class="menu-item" data-go="recipes">
        <div>
          <div class="name">Рецепты</div>
          <div class="desc">Известные и открытые в игре рецепты, варение зелий</div>
        </div>
        <div class="arrow">→</div>
      </div>
      <div class="menu-item" data-go="stock">
        <div>
          <div class="name">Запасы ингредиентов</div>
          <div class="desc">Что реально лежит в рюкзаке — чтобы не полагаться на память</div>
        </div>
        <div class="arrow">→</div>
      </div>
      <div class="menu-item" data-go="alchemyDC">
        <div>
          <div class="name">Справочник СЛ и крафта</div>
          <div class="desc">Сложности проверок, время и стоимость изготовления</div>
        </div>
        <div class="arrow">→</div>
      </div>
    </div>
  `;
}

function renderRecipes(){
  const cards = RECIPES.map(recipeCardHtml).join('') || '<div class="char-empty">Пока нет рецептов.</div>';
  return `
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Алхимия', nav:'alchemy'},{label:'Рецепты'}])}
    <button class="back" data-go="alchemy">← Назад</button>
    <h1>Рецепты</h1>
    <p class="subtitle">«Сварить» списывает ингредиенты из запасов, если их хватает. Добавляй новые по мере открытия в игре.</p>
    <div class="rule"></div>
    <button class="new-char-btn" data-go="recipeForm:new">+ Добавить рецепт</button>
    ${cards}
  `;
}

function renderAlchemyDC(){
  return `
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Алхимия', nav:'alchemy'},{label:'Справочник СЛ'}])}
    <button class="back" data-go="alchemy">← Назад</button>
    <h1>Справочник СЛ и крафта</h1>
    <p class="subtitle">Ориентировочные сложности и правила изготовления — по DMG, на усмотрение мастера.</p>
    <div class="rule"></div>
    <div class="grid">${ALCHEMY_DC.map(termCard).join('')}</div>
  `;
}

function ingredientRowHtml(item){
  return `
    <div class="stock-row" data-ingredient-id="${item.id}">
      <div class="stock-name">${escapeHtml(item.name)}</div>
      <div class="stock-qty-ctrl">
        <button type="button" data-stock-dec="${item.id}">−</button>
        <span class="stock-qty-val">${item.qty}</span>
        <button type="button" data-stock-inc="${item.id}">+</button>
      </div>
      <button type="button" class="stock-remove" data-stock-remove="${item.id}" title="Убрать">✕</button>
    </div>`;
}

function renderStock(){
  const rows = INGREDIENTS.map(ingredientRowHtml).join('') || '<div class="char-empty">Пока пусто — добавь то, что реально лежит в рюкзаке.</div>';
  return `
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Алхимия', nav:'alchemy'},{label:'Запасы'}])}
    <button class="back" data-go="alchemy">← Назад</button>
    <h1>Запасы ингредиентов</h1>
    <p class="subtitle">То, что реально при себе — чтобы не полагаться на память.</p>
    <div class="rule"></div>
    <div class="add-ingredient-row">
      <input type="text" id="newIngName" placeholder="Название ингредиента">
      <input type="number" id="newIngQty" placeholder="Кол-во" value="1" min="1">
      <button class="btn-primary" id="addIngredientBtn">+ Добавить</button>
    </div>
    <div id="stockList">${rows}</div>
  `;
}

function initRecipeDraft(){
  if(view.recipeId && view.recipeId!=='new'){
    const existing = RECIPES.find(r=>r.id===view.recipeId);
    recipeDraft = existing ? JSON.parse(JSON.stringify(existing)) : newRecipe();
  } else {
    recipeDraft = newRecipe();
  }
}
function ingredientFormRowHtml(ing, idx){
  return `
    <div class="attack-row" data-ing-row="${idx}" style="grid-template-columns:2fr 1fr auto;">
      <input type="text" placeholder="Название ингредиента" data-ing-idx="${idx}" data-ing-field="name" value="${escapeAttr(ing.name||'')}">
      <input type="number" min="1" placeholder="Кол-во" data-ing-idx="${idx}" data-ing-field="qty" value="${ing.qty||1}">
      <button type="button" class="row-remove" data-remove-ing="${idx}" title="Убрать">✕</button>
    </div>`;
}

function renderRecipeForm(){
  initRecipeDraft();
  const r = recipeDraft;
  const isExisting = !!(view.recipeId && view.recipeId!=='new' && RECIPES.find(x=>x.id===view.recipeId));
  const ingRows = r.ingredients.map(ingredientFormRowHtml).join('');

  return `
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Алхимия', nav:'alchemy'},{label:'Рецепты', nav:'recipes'},{label:r.name||'Новый рецепт'}])}
    <button class="back" data-go="recipes">← Назад</button>
    <h1>${escapeHtml(r.name || 'Новый рецепт')}</h1>
    <p class="subtitle">Впиши, что узнал в игре — сохранится в общем списке рецептов.</p>
    <div class="rule"></div>

    <div class="sheet-actions">
      <button class="btn-primary" id="saveRecipeBtn">💾 Сохранить</button>
      ${isExisting ? '<button class="btn-ghost" id="deleteRecipeBtn" style="color:var(--crimson-bright);border-color:var(--crimson-bright);">🗑 Удалить</button>' : ''}
    </div>

    <div id="recipeFormRoot">
      <div class="field" style="margin-bottom:16px;">
        <label>Название</label>
        <input type="text" data-rfield="name" value="${escapeAttr(r.name)}" style="font-size:19px;padding:12px 14px;">
      </div>
      <div class="sheet-grid" style="margin-bottom:20px;">
        <div class="field">
          <label>Набор инструментов</label>
          <select data-rfield="kit">
            <option value="alchemist" ${r.kit==='alchemist'?'selected':''}>Алхимический набор</option>
            <option value="herbalism" ${r.kit==='herbalism'?'selected':''}>Набор травника</option>
          </select>
        </div>
        <div class="field"><label>Цена (зм)</label><input type="number" min="0" data-rfield="cost" value="${r.cost}"></div>
        <div class="field"><label>Время</label><input type="text" data-rfield="time" value="${escapeAttr(r.time)}" placeholder="напр. 4 часа"></div>
        <div class="field"><label>СЛ проверки (если есть)</label><input type="text" data-rfield="dc" value="${escapeAttr(String(r.dc||''))}"></div>
      </div>

      <div class="field" style="margin-bottom:8px;"><label>Ингредиенты</label></div>
      <div id="ingList">${ingRows}</div>
      <button type="button" class="add-row-btn" id="addIngRowBtn">+ Добавить ингредиент</button>

      <div class="field" style="margin-top:20px;"><label>Эффект / описание</label><textarea data-rfield="effect" style="min-height:100px;">${escapeHtml(r.effect)}</textarea></div>
    </div>
  `;
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
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:cls.name, nav:'class:'+clsKey},{label:sub.name}])}
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
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Магия'}])}
    <button class="back" data-go="home">← Назад</button>
    <h1>Магия</h1>
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
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Магия', nav:'magic'},{label:school.ru}])}
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
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Магия', nav:'magic'},{label:schoolName(s.school), nav:'schoolSpells:'+s.school},{label:s.name||'Новое заклинание'}])}
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
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Воин'}])}
    <button class="back" data-go="home">← Назад</button>
    <h1>Воин</h1>
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
    ${renderCrumb([{label:'Компендиум', nav:'home'},{label:'Воин', nav:'class:fighter'},{label:'Мастер боя'}])}
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

  /* ---------- character tracker events ---------- */
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  if(importBtn && importFile){
    importBtn.addEventListener('click', ()=>importFile.click());
    importFile.addEventListener('change', ()=>{
      if(importFile.files && importFile.files[0]) importCharacterFromFile(importFile.files[0]);
    });
  }

  const sheetRoot = document.getElementById('sheetRoot');
  if(sheetRoot){
    sheetRoot.addEventListener('input', (e)=>{
      const t = e.target;
      const field = t.getAttribute('data-field');
      if(field){
        let val = t.type==='number' ? Number(t.value) : t.value;
        setPath(charDraft, field, val);
        recomputeDerived();
        return;
      }
      const aIdx = t.getAttribute('data-attack-idx');
      if(aIdx!==null){
        const f = t.getAttribute('data-attack-field');
        charDraft.attacks[Number(aIdx)][f] = t.value;
        return;
      }
      const slotLvl = t.getAttribute('data-slot-level');
      if(slotLvl!==null){
        const kind = t.getAttribute('data-slot-kind');
        const key = kind==='used' ? 'slotsUsed' : 'slots';
        charDraft[key][slotLvl] = Number(t.value)||0;
        return;
      }
    });
    sheetRoot.addEventListener('change', (e)=>{
      const t = e.target;
      const field = t.getAttribute('data-field');
      if(field && t.type==='checkbox'){
        setPath(charDraft, field, t.checked);
        recomputeDerived();
        if(field==='spellEnabled'){
          const block = document.getElementById('spellBlock');
          if(block) block.style.display = t.checked ? '' : 'none';
        }
      }
    });
    sheetRoot.querySelectorAll('.prof-toggle').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const key = btn.getAttribute('data-skill-toggle');
        const cur = charDraft.skillProf[key]||0;
        const next = (cur+1)%3;
        charDraft.skillProf[key]=next;
        btn.setAttribute('data-state', next);
        recomputeDerived();
      });
    });
    sheetRoot.querySelectorAll('.death-dot').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const [kind, numStr] = btn.getAttribute('data-death').split(':');
        const num = Number(numStr);
        const field = kind==='success' ? 'deathSuccess' : 'deathFail';
        charDraft[field] = (charDraft[field]===num) ? num-1 : num;
        const cls = kind==='success' ? 'on-success' : 'on-fail';
        const group = btn.parentElement.querySelectorAll(`[data-death^="${kind}:"]`);
        group.forEach(b=>{
          const n = Number(b.getAttribute('data-death').split(':')[1]);
          b.classList.toggle(cls, n<=charDraft[field]);
        });
      });
    });
    const addAttackBtn = document.getElementById('addAttackBtn');
    if(addAttackBtn) addAttackBtn.addEventListener('click', addAttackRow);
    sheetRoot.addEventListener('click', (e)=>{
      const rm = e.target.closest('[data-remove-attack]');
      if(rm){ removeAttackRow(Number(rm.getAttribute('data-remove-attack'))); }
    });
  }

  const saveCharBtn = document.getElementById('saveCharBtn');
  if(saveCharBtn) saveCharBtn.addEventListener('click', ()=>{
    upsertCharacter();
    navigate('charview:'+charDraft.id);
  });
  const exportCharBtn = document.getElementById('exportCharBtn');
  if(exportCharBtn) exportCharBtn.addEventListener('click', exportCharacterJson);
  const copyCharBtn = document.getElementById('copyCharBtn');
  if(copyCharBtn) copyCharBtn.addEventListener('click', ()=>{
    copyCharacterAsText();
    const old = copyCharBtn.textContent;
    copyCharBtn.textContent = 'Скопировано ✓';
    setTimeout(()=>{ copyCharBtn.textContent = old; }, 1000);
  });
  const deleteCharBtn = document.getElementById('deleteCharBtn');
  if(deleteCharBtn) deleteCharBtn.addEventListener('click', ()=>{
    if(confirm('Удалить персонажа «'+(charDraft.name||'без имени')+'» без возможности восстановления?')){
      deleteCharacter(charDraft.id);
      navigate('characters');
    }
  });

  /* ---------- alchemy events ---------- */
  document.querySelectorAll('[data-brew]').forEach(btn=>{
    btn.addEventListener('click', ()=>attemptBrew(btn.getAttribute('data-brew')));
  });
  document.querySelectorAll('[data-delete-recipe]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
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
    if(i>=0) RECIPES[i]=copy; else RECIPES.push(copy);
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

  const addIngredientBtn = document.getElementById('addIngredientBtn');
  if(addIngredientBtn) addIngredientBtn.addEventListener('click', ()=>{
    const nameEl = document.getElementById('newIngName');
    const qtyEl = document.getElementById('newIngQty');
    const name = nameEl.value.trim();
    const qty = Math.max(1, Number(qtyEl.value)||1);
    if(!name) return;
    const existing = findIngredient(name);
    if(existing) existing.qty += qty;
    else INGREDIENTS.push({id:genId(), name, qty});
    saveIngredientsToStorage();
    render();
  });
  document.querySelectorAll('[data-stock-inc]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const item = INGREDIENTS.find(i=>i.id===btn.getAttribute('data-stock-inc'));
      if(item){
        item.qty++;
        saveIngredientsToStorage();
        const row = btn.closest('.stock-row');
        const val = row ? row.querySelector('.stock-qty-val') : null;
        if(val) val.textContent = item.qty;
      }
    });
  });
  document.querySelectorAll('[data-stock-dec]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const item = INGREDIENTS.find(i=>i.id===btn.getAttribute('data-stock-dec'));
      if(item){
        item.qty = Math.max(0, item.qty-1);
        saveIngredientsToStorage();
        const row = btn.closest('.stock-row');
        const val = row ? row.querySelector('.stock-qty-val') : null;
        if(val) val.textContent = item.qty;
      }
    });
  });
  document.querySelectorAll('[data-stock-remove]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      INGREDIENTS = INGREDIENTS.filter(i=>i.id!==btn.getAttribute('data-stock-remove'));
      saveIngredientsToStorage();
      render();
    });
  });
  enhanceAllCustomSelects();
}

function navigate(val){
  const parts = val.split(':');
  if(parts[0]==='home') view = {screen:'home'};
  else if(parts[0]==='commands') view = {screen:'commands'};
  else if(parts[0]==='rules2024') view = {screen:'rules2024'};
  else if(parts[0]==='alchemy') view = {screen:'alchemy'};
  else if(parts[0]==='recipes') view = {screen:'recipes'};
  else if(parts[0]==='recipeForm') view = {screen:'recipeForm', recipeId: parts[1]};
  else if(parts[0]==='stock') view = {screen:'stock'};
  else if(parts[0]==='alchemyDC') view = {screen:'alchemyDC'};
  else if(parts[0]==='subclass') view = {screen:'subclass', clsKey:parts[1], subKey:parts[2]};
  else if(parts[0]==='magic') view = {screen:'magic'};
  else if(parts[0]==='schoolSpells') view = {screen:'schoolSpells', schoolKey:parts[1]};
  else if(parts[0]==='spellForm') view = {screen:'spellForm', spellId:parts[1], schoolKey:parts[2]};
  else if(parts[0]==='dice') view = {screen:'dice'};
  else if(parts[0]==='map') view = {screen:'map'};
  else if(parts[0]==='characters') view = {screen:'characters'};
  else if(parts[0]==='charview') view = {screen:'charview', charId: parts[1]};
  else if(parts[0]==='sheet') view = {screen:'sheet', charId: parts[1]};
  else if(parts[0]==='glossary') view = {screen:'glossary'};
  else if(parts[0]==='weapons') view = {screen:'weapons', weapon: view.weapon || 'longsword'};
  else if(parts[0]==='class') view = {screen:'class', cls:parts[1]};
  else if(parts[0]==='sub') view = {screen:'sub', cls:parts[1], sub:parts[2]};
  render();
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

        if(k.indexOf('_ai_hist_') !== -1 || k.indexOf('ai_hist') !== -1){
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
        var isAi = (k.indexOf('_ai_hist_') !== -1 || k.indexOf('ai_hist') !== -1);
        if(!isAi) continue;

        if(mode === 'sh' && k.indexOf('sh_ai_hist_') === 0) keysToRemove.push(k);
        else if(mode === 'el' && k.indexOf('el_ai_hist_') === 0) keysToRemove.push(k);
        else if(mode === 'me' && k.indexOf('me_ai_hist_') === 0) keysToRemove.push(k);
        else if(mode === 'wi' && k.indexOf('wi_ai_hist_') === 0) keysToRemove.push(k);
        else if(mode === 'wz' && k.indexOf('wz_ai_hist_') === 0) keysToRemove.push(k);
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