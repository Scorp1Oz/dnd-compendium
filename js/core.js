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
const FAE_DICE_SKIN_KEY = 'ttc_fae_dice_skin';
const FAE_DICE_SKIN_COLLAPSED_KEY = 'ttc_fae_dice_skin_collapsed';

const FAE_DICE_SKINS = [
  {
    id: 'classic',
    title: 'Классика',
    sub: 'Стандартные цвета',
    accent: '#e09a45',
    glow: 'rgba(224,154,69,0.55)',
    bg: 'rgba(224,154,69,0.10)',
    border: 'rgba(224,154,69,0.40)',
    valColor: '#ffffff',
    coinValColor: '#fff8db'
  },
  {
    id: 'onyx',
    title: 'Чёрный Оникс',
    sub: 'Обсидиан и серебро',
    accent: '#e4e4e7',
    glow: 'rgba(228,228,231,0.55)',
    bg: 'rgba(161,161,170,0.12)',
    border: 'rgba(212,212,216,0.45)',
    g0: '#3f3f46',
    g1: '#18181b',
    g2: '#09090b',
    outerStroke: '#d4d4d8',
    innerStroke: 'rgba(228,228,231,0.52)',
    facetLight: 'rgba(255,255,255,0.14)',
    facetDark: 'rgba(0,0,0,0.45)',
    textFill: '#f4f4f5',
    valColor: '#f4f4f5',
    coinValColor: '#f4f4f5'
  },
  {
    id: 'ruby',
    title: 'Кровавый Рубин',
    sub: 'Багрянец и золото',
    accent: '#fbbf24',
    glow: 'rgba(245,158,11,0.6)',
    bg: 'rgba(185,28,28,0.16)',
    border: 'rgba(251,191,36,0.5)',
    g0: '#dc2626',
    g1: '#881337',
    g2: '#3b0410',
    outerStroke: '#f5c451',
    innerStroke: 'rgba(251,191,36,0.62)',
    facetLight: 'rgba(254,202,202,0.20)',
    facetDark: 'rgba(28,2,7,0.48)',
    textFill: '#fef3c7',
    valColor: '#fef3c7',
    coinValColor: '#fef08a'
  },
  {
    id: 'amethyst',
    title: 'Астральный Аметист',
    sub: 'Плетение и звёзды',
    accent: '#e879f9',
    glow: 'rgba(217,70,239,0.6)',
    bg: 'rgba(147,51,234,0.16)',
    border: 'rgba(232,121,249,0.48)',
    g0: '#a855f7',
    g1: '#581c87',
    g2: '#1e0936',
    outerStroke: '#e879f9',
    innerStroke: 'rgba(240,171,252,0.58)',
    facetLight: 'rgba(245,208,254,0.22)',
    facetDark: 'rgba(15,4,28,0.50)',
    textFill: '#fae8ff',
    valColor: '#fae8ff',
    coinValColor: '#fae8ff'
  },
  {
    id: 'bone',
    title: 'Древняя Кость',
    sub: 'Резная слоновая кость',
    accent: '#d6c19a',
    glow: 'rgba(214,193,154,0.5)',
    bg: 'rgba(214,193,154,0.12)',
    border: 'rgba(180,153,108,0.5)',
    g0: '#f5ebd6',
    g1: '#d2be99',
    g2: '#8c734b',
    outerStroke: '#3e2b17',
    innerStroke: 'rgba(62,43,23,0.55)',
    facetLight: 'rgba(255,252,240,0.32)',
    facetDark: 'rgba(62,43,23,0.22)',
    textFill: '#291a0c',
    valColor: '#291a0c',
    valShadow: '0 1px 0 rgba(255,248,225,0.85), 0 2px 4px rgba(0,0,0,0.35)',
    coinValColor: '#291a0c'
  },
  {
    id: 'frost',
    title: 'Ледяной Кристалл',
    sub: 'Долина Ледяного Ветра',
    accent: '#7dd3fc',
    glow: 'rgba(56,189,248,0.65)',
    bg: 'rgba(56,189,248,0.14)',
    border: 'rgba(125,211,252,0.52)',
    g0: '#bae6fd',
    g1: '#0284c7',
    g2: '#082f49',
    outerStroke: '#e0f2fe',
    innerStroke: 'rgba(224,242,254,0.68)',
    facetLight: 'rgba(255,255,255,0.30)',
    facetDark: 'rgba(8,47,73,0.42)',
    textFill: '#f0f9ff',
    valColor: '#f0f9ff',
    coinValColor: '#f0f9ff'
  },
  {
    id: 'holo',
    title: 'Рунический Эфир',
    sub: 'Неоновая геометрия',
    accent: '#2dd4bf',
    glow: 'rgba(45,212,191,0.65)',
    bg: 'rgba(20,184,166,0.14)',
    border: 'rgba(45,212,191,0.52)',
    g0: '#134e4a',
    g1: '#092226',
    g2: '#030b0e',
    outerStroke: '#2dd4bf',
    innerStroke: 'rgba(94,234,212,0.75)',
    facetLight: 'rgba(45,212,191,0.18)',
    facetDark: 'rgba(0,0,0,0.55)',
    textFill: '#5eead4',
    valColor: '#5eead4',
    coinValColor: '#5eead4',
    monoFont: true
  },
  {
    id: 'jade',
    title: 'Изумрудный Нефрит',
    sub: 'Нефрит и бронза',
    accent: '#34d399',
    glow: 'rgba(16,185,129,0.58)',
    bg: 'rgba(16,185,129,0.14)',
    border: 'rgba(52,211,153,0.48)',
    g0: '#10b981',
    g1: '#065f46',
    g2: '#022c22',
    outerStroke: '#d97706',
    innerStroke: 'rgba(251,191,36,0.58)',
    facetLight: 'rgba(167,243,208,0.22)',
    facetDark: 'rgba(2,44,34,0.50)',
    textFill: '#fef3c7',
    valColor: '#fef3c7',
    coinValColor: '#fef3c7'
  }
];

function getSavedFaerunDiceSkin(){
  try {
    const s = localStorage.getItem(FAE_DICE_SKIN_KEY);
    if(s && FAE_DICE_SKINS.some(k => k.id === s)) return s;
  } catch(e){}
  return 'classic';
}

function getSavedFaerunSkinCollapsed(){
  try {
    return localStorage.getItem(FAE_DICE_SKIN_COLLAPSED_KEY) === '1';
  } catch(e){}
  return false;
}

let diceState = {dice:[], modifier:0, unknownMod:false, skin:getSavedFaerunDiceSkin(), skinCollapsed:getSavedFaerunSkinCollapsed(), counter:0, customSides:7, labelCat:'', label:'', customLabel:'', history:[]};

function isFaerunDiceSkinMode(){
  return (typeof HB === 'undefined' || !HB.mode || HB.mode === 'faerun' || HB.mode === 'core');
}

function getActiveDiceSkin(){
  if(!isFaerunDiceSkinMode()) return FAE_DICE_SKINS[0];
  const id = diceState.skin || getSavedFaerunDiceSkin();
  return FAE_DICE_SKINS.find(s => s.id === id) || FAE_DICE_SKINS[0];
}

function setFaerunDiceSkin(skinId){
  const found = FAE_DICE_SKINS.find(s => s.id === skinId) || FAE_DICE_SKINS[0];
  diceState.skin = found.id;
  try { localStorage.setItem(FAE_DICE_SKIN_KEY, found.id); } catch(e){}
  if(typeof render === 'function') render();
}
window.setFaerunDiceSkin = setFaerunDiceSkin;

function toggleFaerunSkinDock(forceCollapsed){
  const next = (typeof forceCollapsed === 'boolean') ? forceCollapsed : !diceState.skinCollapsed;
  diceState.skinCollapsed = next;
  try { localStorage.setItem(FAE_DICE_SKIN_COLLAPSED_KEY, next ? '1' : '0'); } catch(e){}
  const dock = document.getElementById('faeDiceSkinDock');
  if(dock){
    dock.classList.toggle('collapsed', next);
  }
}
window.toggleFaerunSkinDock = toggleFaerunSkinDock;

function formatDiceModSuffix(m, unknownMod){
  let s = '';
  if(m > 0) s += ' + ' + m;
  else if(m < 0) s += ' − ' + Math.abs(m);
  if(unknownMod) s += ' + мод.';
  return s;
}
const DICE_HISTORY_MAX = 16;

function generateCoinSvg(uid, label, skinOverride){
  const gid = 'grad_'+uid;
  const skin = skinOverride
    ? (FAE_DICE_SKINS.find(s => s.id === skinOverride) || FAE_DICE_SKINS[0])
    : getActiveDiceSkin();
  const dispLabel = (label!==undefined && label!==null) ? label : 'C';

  if(skin.id !== 'classic'){
    const textFill = skin.textFill || '#fff8d6';
    const textShadow = (skin.id === 'bone')
      ? 'drop-shadow(0 1px 0 rgba(255,255,255,0.7))'
      : 'drop-shadow(0 2px 4px rgba(0,0,0,0.75))';
    const text = dispLabel
      ? `<text x="50" y="60" text-anchor="middle" font-family="${skin.monoFont ? "'JetBrains Mono', monospace" : "'Cinzel', serif"}" font-weight="700" font-size="30" fill="${textFill}" filter="${textShadow}">${dispLabel}</text>`
      : '';
    let innerOrnament = '';
    if(skin.id === 'onyx'){
      innerOrnament = `<polygon points="50,11 61,39 89,50 61,61 50,89 39,61 11,50 39,39" fill="none" stroke="${skin.innerStroke}" stroke-width="1.3"/>
        <circle cx="50" cy="50" r="32" fill="rgba(0,0,0,0.35)" stroke="${skin.outerStroke}" stroke-width="1.2"/>`;
    } else if(skin.id === 'ruby'){
      innerOrnament = `<polygon points="50,12 77,23 88,50 77,77 50,88 23,77 12,50 23,23" fill="rgba(0,0,0,0.22)" stroke="${skin.outerStroke}" stroke-width="1.5"/>
        <circle cx="50" cy="50" r="30" fill="none" stroke="${skin.innerStroke}" stroke-width="1.2" stroke-dasharray="4,2"/>`;
    } else if(skin.id === 'amethyst'){
      innerOrnament = `<polygon points="50,12 83,31 83,69 50,88 17,69 17,31" fill="rgba(255,255,255,0.06)" stroke="${skin.innerStroke}" stroke-width="1.3"/>
        <polygon points="50,88 83,31 17,31" fill="none" stroke="rgba(232,121,249,0.28)" stroke-width="1"/>
        <circle cx="50" cy="50" r="28" fill="rgba(15,4,28,0.45)" stroke="${skin.outerStroke}" stroke-width="1.1"/>`;
    } else if(skin.id === 'bone'){
      innerOrnament = `<circle cx="50" cy="50" r="39" fill="none" stroke="${skin.outerStroke}" stroke-width="2" stroke-dasharray="2,4.5"/>
        <circle cx="50" cy="50" r="32" fill="rgba(62,43,23,0.10)" stroke="${skin.outerStroke}" stroke-width="1.2"/>`;
    } else if(skin.id === 'frost'){
      innerOrnament = `<polygon points="50,11 58,36 83,27 65,50 83,73 58,64 50,89 42,64 17,73 35,50 17,27 42,36" fill="rgba(255,255,255,0.16)" stroke="${skin.outerStroke}" stroke-width="1.1"/>
        <circle cx="50" cy="50" r="27" fill="rgba(8,47,73,0.42)" stroke="${skin.innerStroke}" stroke-width="1.2"/>`;
    } else if(skin.id === 'holo'){
      innerOrnament = `<circle cx="50" cy="50" r="39" fill="none" stroke="${skin.innerStroke}" stroke-width="1.4" stroke-dasharray="8,4"/>
        <polygon points="50,16 79,33 79,67 50,84 21,67 21,33" fill="rgba(45,212,191,0.08)" stroke="${skin.outerStroke}" stroke-width="1.3"/>`;
    } else if(skin.id === 'jade'){
      innerOrnament = `<circle cx="50" cy="50" r="38" fill="none" stroke="${skin.innerStroke}" stroke-width="1.2"/>
        <rect x="29" y="29" width="42" height="42" rx="4" fill="rgba(2,44,34,0.38)" stroke="${skin.outerStroke}" stroke-width="1.8"/>`;
    }
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${skin.g0}"/>
          <stop offset="52%" stop-color="${skin.g1}"/>
          <stop offset="100%" stop-color="${skin.g2}"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#${gid})" stroke="${skin.outerStroke}" stroke-width="2.4"/>
      ${innerOrnament}
      ${text}
    </svg>`;
  }

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

function renderCustomFacetShape(sides, uid, label, skinOverride){
  if(sides === 'coin') return generateCoinSvg(uid, label, skinOverride);
  if(sides === 2) return dieShapeSvg(2, uid, label, skinOverride);
  const s = Math.max(3, Math.min(100, parseInt(sides,10) || 7));
  const gid = 'grad_'+uid;
  const skin = skinOverride
    ? (FAE_DICE_SKINS.find(k => k.id === skinOverride) || FAE_DICE_SKINS[0])
    : getActiveDiceSkin();
  const useSkin = skin.id !== 'classic';
  const gStart = useSkin ? skin.g0 : '#8c52ff';
  const gMid = useSkin ? skin.g1 : '#622bd9';
  const gEnd = useSkin ? skin.g2 : '#3d1475';
  const outStroke = useSkin ? skin.outerStroke : 'rgba(0,0,0,0.4)';
  const inStroke = useSkin ? skin.innerStroke : 'rgba(255,255,255,0.22)';
  const fLight = useSkin ? skin.facetLight : 'rgba(255,255,255,0.15)';
  const fDark = useSkin ? skin.facetDark : 'rgba(0,0,0,0.2)';
  const tFill = useSkin ? skin.textFill : '#ffffff';

  if(s === 3){
    const pTop = [50, 7], pRight = [93, 89], pLeft = [7, 89];
    const c = [50, 61];
    const ipTop = [50, 34], ipRight = [71.5, 75], ipLeft = [28.5, 75];
    const outerPoints = `${pTop.join(',')} ${pRight.join(',')} ${pLeft.join(',')}`;
    const innerPoints = `${ipTop.join(',')} ${ipRight.join(',')} ${ipLeft.join(',')}`;
    const facetPolys = `
      <polygon points="${ipTop[0]},${ipTop[1]} ${pTop[0]},${pTop[1]} ${pRight[0]},${pRight[1]} ${ipRight[0]},${ipRight[1]}" fill="${fLight}" stroke="${inStroke}" stroke-width="0.8"/>
      <polygon points="${c[0]},${c[1]} ${ipTop[0]},${ipTop[1]} ${ipRight[0]},${ipRight[1]}" fill="${fDark}" stroke="${inStroke}" stroke-width="0.7"/>
      <polygon points="${ipRight[0]},${ipRight[1]} ${pRight[0]},${pRight[1]} ${pLeft[0]},${pLeft[1]} ${ipLeft[0]},${ipLeft[1]}" fill="${fDark}" stroke="${inStroke}" stroke-width="0.8"/>
      <polygon points="${c[0]},${c[1]} ${ipRight[0]},${ipRight[1]} ${ipLeft[0]},${ipLeft[1]}" fill="${fLight}" stroke="${inStroke}" stroke-width="0.7"/>
      <polygon points="${ipLeft[0]},${ipLeft[1]} ${pLeft[0]},${pLeft[1]} ${pTop[0]},${pTop[1]} ${ipTop[0]},${ipTop[1]}" fill="${fLight}" stroke="${inStroke}" stroke-width="0.8"/>
      <polygon points="${c[0]},${c[1]} ${ipLeft[0]},${ipLeft[1]} ${pTop[0]},${pTop[1]}" fill="${fDark}" stroke="${inStroke}" stroke-width="0.7"/>
    `;
    const text = (label!==undefined && label!==null)
      ? `<text x="50" y="67" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="28" fill="${tFill}" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))">${label}</text>`
      : '';
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${gStart}"/>
          <stop offset="50%" stop-color="${gMid}"/>
          <stop offset="100%" stop-color="${gEnd}"/>
        </linearGradient>
      </defs>
      <polygon points="${outerPoints}" fill="url(#${gid})" stroke="${outStroke}" stroke-width="1.8"/>
      ${facetPolys}
      <polygon points="${innerPoints}" fill="none" stroke="${inStroke}" stroke-width="1.1"/>
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
    const shadeA = (i % 2 === 0) ? fLight : fDark;
    const shadeB = ((i + 1) % 2 === 0) ? fLight : fDark;
    facetPolys += `<polygon points="${ip1[0]},${ip1[1]} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${ip2[0]},${ip2[1]}" fill="${shadeA}" stroke="${inStroke}" stroke-width="0.8"/>`;
    facetPolys += `<polygon points="50,50 ${ip1[0]},${ip1[1]} ${ip2[0]},${ip2[1]}" fill="${shadeB}" stroke="${inStroke}" stroke-width="0.7"/>`;
  }

  const fontSize = s > 99 ? 20 : (s > 20 ? 24 : 28);
  const text = (label!==undefined && label!==null)
    ? `<text x="50" y="58" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="${fontSize}" fill="${tFill}" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))">${label}</text>`
    : '';

  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${gStart}"/>
        <stop offset="52%" stop-color="${gMid}"/>
        <stop offset="100%" stop-color="${gEnd}"/>
      </linearGradient>
    </defs>
    <polygon points="${outerPoints}" fill="url(#${gid})" stroke="${outStroke}" stroke-width="1.8"/>
    ${facetPolys}
    <polygon points="${innerPoints}" fill="none" stroke="${inStroke}" stroke-width="1.1"/>
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

function getCustomDieThemeFor(n){
  const skin = getActiveDiceSkin();
  if(skin && skin.id !== 'classic'){
    return { color: skin.accent, glow: skin.glow, bg: skin.bg, border: skin.border };
  }
  return CUST_THEMES[n] || CUST_THEMES.default;
}

function getCustomPreviewSvg(n, uid){
  if(n === 'coin') return generateCoinSvg(uid, '🪙');
  if(n === 2) return dieShapeSvg(2, uid, 'd2');
  if(DICE_COLORS[n]) return dieShapeSvg(n, uid, n);
  return renderCustomFacetShape(n, uid, 'd' + n);
}

function dieShapeSvg(sides, uid, label, skinOverride){
  if(sides==='coin') return generateCoinSvg(uid, label, skinOverride);
  const skin = skinOverride
    ? (FAE_DICE_SKINS.find(k => k.id === skinOverride) || FAE_DICE_SKINS[0])
    : getActiveDiceSkin();
  const useSkin = skin.id !== 'classic';

  if(sides===2){
    const gid = 'grad_'+uid;
    const c = DICE_COLORS[2];
    const g0 = useSkin ? skin.g0 : c.light;
    const g1 = useSkin ? skin.g1 : c.light;
    const g2 = useSkin ? skin.g2 : c.dark;
    const outStroke = useSkin ? skin.outerStroke : 'rgba(0,0,0,0.35)';
    const inStroke = useSkin ? skin.innerStroke : 'rgba(255,255,255,0.4)';
    const tFill = useSkin ? skin.textFill : '#ffffff';
    const text = (label!==undefined && label!==null)
      ? `<text x="50" y="61" text-anchor="middle" font-family="'Cinzel', serif" font-weight="700" font-size="28" fill="${tFill}" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.85))">${label}</text>`
      : '';
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${g0}"/>
          <stop offset="50%" stop-color="${g1}"/>
          <stop offset="100%" stop-color="${g2}"/>
        </linearGradient>
      </defs>
      <path d="M 50,7 C 84,26 84,74 50,93 C 16,74 16,26 50,7 Z" fill="url(#${gid})" stroke="${outStroke}" stroke-width="2"/>
      <path d="M 50,7 C 22,26 22,74 50,93 Z" fill="${useSkin ? skin.facetLight : 'rgba(255,255,255,0.18)'}" stroke="${inStroke}" stroke-width="0.9"/>
      <path d="M 50,7 C 78,26 78,74 50,93 Z" fill="${useSkin ? skin.facetDark : 'rgba(0,0,0,0.18)'}" stroke="${inStroke}" stroke-width="0.9"/>
      <line x1="50" y1="7" x2="50" y2="93" stroke="${inStroke}" stroke-width="1.3"/>
      ${text}
    </svg>`;
  }
  if(!DICE_COLORS[sides]) return renderCustomFacetShape(sides, uid, label, skinOverride);
  const c = DICE_COLORS[sides];
  const gid = 'grad_'+uid;
  const outStroke = useSkin ? skin.outerStroke : 'rgba(0,0,0,0.28)';
  const inStroke = useSkin ? skin.innerStroke : 'rgba(0,0,0,0.22)';
  const fLight = useSkin ? skin.facetLight : 'rgba(255,255,255,0.12)';
  const fDark = useSkin ? skin.facetDark : 'rgba(0,0,0,0.14)';

  let shape='';
  if(sides===4){
    shape = `<polygon points="50,6 96,90 4,90" fill="url(#${gid})" stroke="${outStroke}" stroke-width="${useSkin?2.1:1.2}"/>`;
    if(useSkin){
      shape += `<polygon points="50,6 96,90 50,64" fill="${fDark}" stroke="${inStroke}" stroke-width="1.1"/>
        <polygon points="50,6 4,90 50,64" fill="${fLight}" stroke="${inStroke}" stroke-width="1.1"/>
        <line x1="50" y1="64" x2="96" y2="90" stroke="${inStroke}" stroke-width="1.1"/>
        <line x1="50" y1="64" x2="4" y2="90" stroke="${inStroke}" stroke-width="1.1"/>`;
    }
  } else if(sides===6){
    shape = `<rect x="9" y="9" width="82" height="82" rx="14" fill="url(#${gid})" stroke="${outStroke}" stroke-width="${useSkin?2.1:1.2}"/>`;
    if(useSkin){
      shape += `<rect x="22" y="22" width="56" height="56" rx="7" fill="${fLight}" stroke="${inStroke}" stroke-width="1.2"/>
        <line x1="13" y1="13" x2="24" y2="24" stroke="${inStroke}" stroke-width="1.1"/>
        <line x1="87" y1="13" x2="76" y2="24" stroke="${inStroke}" stroke-width="1.1"/>
        <line x1="87" y1="87" x2="76" y2="76" stroke="${inStroke}" stroke-width="1.1"/>
        <line x1="13" y1="87" x2="24" y2="76" stroke="${inStroke}" stroke-width="1.1"/>`;
    }
  } else if(sides===8){
    shape = `<polygon points="50,4 96,50 50,96 4,50" fill="url(#${gid})" stroke="${outStroke}" stroke-width="${useSkin?2.1:1.2}"/>`;
    if(useSkin){
      shape += `<polygon points="50,4 96,50 50,50" fill="${fLight}" stroke="${inStroke}" stroke-width="1.1"/>
        <polygon points="96,50 50,96 50,50" fill="${fDark}" stroke="${inStroke}" stroke-width="1.1"/>
        <line x1="4" y1="50" x2="96" y2="50" stroke="${inStroke}" stroke-width="1.2"/>
        <line x1="50" y1="4" x2="50" y2="96" stroke="${inStroke}" stroke-width="1.2"/>`;
    } else {
      shape += `<line x1="50" y1="4" x2="50" y2="96" stroke="rgba(0,0,0,.14)"/>`;
    }
  } else if(sides===10){
    shape = `<polygon points="50,4 93,42 50,96 7,42" fill="url(#${gid})" stroke="${outStroke}" stroke-width="${useSkin?2.1:1.2}"/>`;
    if(useSkin){
      shape += `<polygon points="50,4 93,42 50,58" fill="${fDark}" stroke="${inStroke}" stroke-width="1.1"/>
        <polygon points="50,4 7,42 50,58" fill="${fLight}" stroke="${inStroke}" stroke-width="1.1"/>
        <polyline points="7,42 50,58 93,42" fill="none" stroke="${inStroke}" stroke-width="1.3"/>
        <line x1="50" y1="58" x2="50" y2="96" stroke="${inStroke}" stroke-width="1.3"/>`;
    } else {
      shape += `<polyline points="7,42 50,58 93,42" fill="none" stroke="rgba(0,0,0,.14)"/><line x1="50" y1="58" x2="50" y2="96" stroke="rgba(0,0,0,.14)"/>`;
    }
  } else if(sides===12){
    shape = `<polygon points="50,4 95,38 78,94 22,94 5,38" fill="url(#${gid})" stroke="${outStroke}" stroke-width="${useSkin?2.1:1.2}"/>`;
    if(useSkin){
      shape += `<polygon points="50,23 76,42 66,74 34,74 24,42" fill="${fLight}" stroke="${inStroke}" stroke-width="1.2"/>
        <line x1="50" y1="4" x2="50" y2="23" stroke="${inStroke}" stroke-width="1.1"/>
        <line x1="95" y1="38" x2="76" y2="42" stroke="${inStroke}" stroke-width="1.1"/>
        <line x1="78" y1="94" x2="66" y2="74" stroke="${inStroke}" stroke-width="1.1"/>
        <line x1="22" y1="94" x2="34" y2="74" stroke="${inStroke}" stroke-width="1.1"/>
        <line x1="5" y1="38" x2="24" y2="42" stroke="${inStroke}" stroke-width="1.1"/>`;
    }
  } else {
    const strokeColor = useSkin ? inStroke : 'rgba(0,0,0,0.28)';
    const facetFill = fLight;
    shape = `<polygon points="50,3 91,26 91,74 50,97 9,74 9,26" fill="url(#${gid})" stroke="${outStroke}" stroke-width="${useSkin?2.2:1.6}"/>
    <polygon points="50,3 91,26 50,24" fill="${fDark}"/>
    <polygon points="91,26 91,74 75,63" fill="${fDark}"/>
    <polygon points="9,74 50,97 25,63" fill="${fDark}"/>
    <polygon points="50,24 75,63 25,63" fill="${facetFill}" stroke="${strokeColor}" stroke-width="1.3"/>
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
  const tFill = useSkin ? skin.textFill : '#fff';
  const tFont = useSkin ? (skin.monoFont ? "'JetBrains Mono', monospace" : "'Cinzel', serif") : 'Arial, sans-serif';
  const tFilter = (useSkin && skin.id === 'bone')
    ? ' filter="drop-shadow(0 1px 0 rgba(255,255,255,0.65))"'
    : (useSkin ? ' filter="drop-shadow(0 2px 3px rgba(0,0,0,0.85))"' : '');
  const text = (label!==undefined && label!==null)
    ? `<text x="50" y="${DICE_LABEL_Y[sides]}" text-anchor="middle" font-family="${tFont}" font-weight="700" font-size="${useSkin?30:32}" fill="${tFill}"${tFilter}>${label}</text>`
    : '';
  const gradStops = useSkin
    ? `<stop offset="0%" stop-color="${skin.g0}"/><stop offset="52%" stop-color="${skin.g1}"/><stop offset="100%" stop-color="${skin.g2}"/>`
    : `<stop offset="0%" stop-color="${c.light}"/><stop offset="1" stop-color="${c.dark}"/>`;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">${gradStops}</linearGradient></defs>${shape}${text}</svg>`;
}

function getDieCritState(sides, value){
  if(!isFaerunDiceSkinMode() || sides !== 20) return '';
  if(value === 20) return 'crit';
  if(value === 1) return 'fumble';
  return '';
}

function applyDieCritFumbleDom(el, sides, value){
  if(!el) return;
  el.classList.remove('is-crit', 'is-fumble');
  const oldBadge = el.querySelector('.die-crit-badge');
  if(oldBadge) oldBadge.remove();
  const state = getDieCritState(sides, value);
  if(state === 'crit'){
    el.classList.add('is-crit');
    const b = document.createElement('div');
    b.className = 'die-crit-badge crit';
    b.textContent = '★ КРИТ';
    el.appendChild(b);
  } else if(state === 'fumble'){
    el.classList.add('is-fumble');
    const b = document.createElement('div');
    b.className = 'die-crit-badge fumble';
    b.textContent = '💀 ПРОВАЛ';
    el.appendChild(b);
  }
}

function trayDieHtml(d, hideCritNow){
  const isCoin = (d.sides === 'coin');
  const valText = isCoin ? (d.value === 2 ? 'W' : 'L') : d.value;
  const skin = getActiveDiceSkin();
  const critState = hideCritNow ? '' : getDieCritState(d.sides, d.value);
  const critCls = critState === 'crit' ? ' is-crit' : (critState === 'fumble' ? ' is-fumble' : '');
  const badgeHtml = critState === 'crit'
    ? `<div class="die-crit-badge crit">★ КРИТ</div>`
    : (critState === 'fumble' ? `<div class="die-crit-badge fumble">💀 ПРОВАЛ</div>` : '');
  const valColor = isCoin ? (skin.coinValColor || '#fff8db') : (skin.valColor || '#ffffff');
  const valShadow = skin.valShadow || '0 2px 4px rgba(0,0,0,.65)';
  const valFont = skin.monoFont ? "'JetBrains Mono',monospace" : "'Cinzel',serif";
  return `<div class="die s${d.sides} skin-${skin.id}${critCls}" data-id="${d.id}" title="Убрать ${isCoin?'монету':'кость'}">
    ${dieShapeSvg(d.sides, d.id, isCoin ? '' : null)}
    <div class="val" style="color:${valColor};text-shadow:${valShadow};font-family:${valFont};">${valText}</div>
    ${badgeHtml}
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
  const sumDisp = diceState.unknownMod ? `${numSum} + мод.` : numSum;
  if(coinDice.length){
    const coinStr = coinDice.map(c => c.value === 2 ? 'W' : 'L').join(', ');
    return `${sumDisp} · ${coinStr}`;
  }
  return sumDisp;
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
  if(diceState.unknownMod) n+=(compact?'+мод.':' + мод.');
  return n;
}

function animateDie(el, sides, finalValue, dur){
  const valEl = el.querySelector('.val');
  if(!valEl) return;
  if(el._diceIv) clearInterval(el._diceIv);
  el.classList.remove('is-crit', 'is-fumble');
  const oldBadge = el.querySelector('.die-crit-badge');
  if(oldBadge) oldBadge.remove();
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
      applyDieCritFumbleDom(el, sides, finalValue);
    }
  },70);
}

function updateLabelPreview(){
  const el = document.getElementById('labelPreview');
  if(!el) return;
  if(!diceState.dice.length){
    const label = currentDiceLabel();
    const modStr = formatDiceModSuffix(diceState.modifier, diceState.unknownMod);
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
  const skin = getActiveDiceSkin();
  const critState = getDieCritState(h.sides, h.value);
  const critCls = critState === 'crit' ? ' is-crit' : (critState === 'fumble' ? ' is-fumble' : '');
  const critTag = critState === 'crit' ? ' · ★ КРИТ!' : (critState === 'fumble' ? ' · 💀 ПРОВАЛ!' : '');
  const tip = isCoin
    ? `${h.emoji?h.emoji+' ':''}${h.label ? h.label+' · ' : ''}Монета C = ${valText}`
    : `${h.emoji?h.emoji+' ':''}${h.label ? h.label+' · ' : ''}d${h.sides} = ${h.value}${critTag}`;
  const hvColor = isCoin ? (skin.coinValColor || '#fff8d6') : (skin.valColor || '#ffffff');
  const hvShadow = skin.valShadow || '0 1px 2px rgba(0,0,0,.6)';
  return `<div class="hist-die${isNew?' hist-new':''}${critCls}" data-tip="${escapeAttr(tip)}">
    ${dieShapeSvg(h.sides, 'h'+h.uid, isCoin ? '' : null)}
    <div class="hv" style="color:${hvColor};text-shadow:${hvShadow};${isCoin?'font-size:14px;font-family:Cinzel,serif;font-weight:700;':''}">${valText}</div>
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
  holder.innerHTML = trayDieHtml({id,sides,value}, true);
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

  if((diceState.modifier || diceState.unknownMod) && lines.length && sidesDesc.length){
    const modStr = formatDiceModSuffix(diceState.modifier, diceState.unknownMod);
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
      if(hero && Array.isArray(hero.customSkills) && hero.customSkills.length > 0){
        extraCats.push({
          key: 'fae_custom_skills',
          icon: '🛠️',
          ru: 'Навыки и знания героя',
          items: hero.customSkills.map(function(sk){
            return {
              icon: '🛠️',
              ru: (sk.name || 'Навык') + (sk.mod ? (' (' + sk.mod + ')') : ''),
              std: 20
            };
          })
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
  const isFaeSkinMode = isFaerunDiceSkinMode();
  const activeSkin = getActiveDiceSkin();
  const trayContent = hasDice
    ? diceState.dice.map(d => trayDieHtml(d, false)).join('')
    : `<div class="empty-hint">Нажмите на кость внизу — она появится здесь и сразу будет брошена.<br>Клик по кости на поле убирает её.</div>`;
  const pick = DICE_TYPES.map(s=>
    `<button class="die-btn ${s==='coin'?'die-coin-btn':''}" data-sides="${s}" title="${s==='coin'?'Бросить монету (C)':'Добавить d'+s}">${dieShapeSvg(s,'pick'+s,s==='coin'?'C':s)}</button>`
  ).join('');
  const m = diceState.modifier;
  const label = currentDiceLabel();
  const modPreviewStr = formatDiceModSuffix(m, diceState.unknownMod);
  const custTheme = getCustomDieThemeFor(diceState.customSides);
  const custThemeStyles = `--cust-color:${custTheme.color};--cust-glow:${custTheme.glow};--cust-bg-tint:${custTheme.bg};--cust-border-tint:${custTheme.border};`;

  const faeSkinBarHtml = isFaeSkinMode ? `
    <aside class="fae-dice-skin-dock${diceState.skinCollapsed ? ' collapsed' : ''}" id="faeDiceSkinDock" style="--sk-active-accent:${activeSkin.accent};--sk-active-glow:${activeSkin.glow};">
      <div class="fae-dice-skin-panel">
        <div class="fae-dice-skin-head">
          <div class="fae-dice-skin-head-info">
            <span class="fae-dice-skin-label">🎨 Скины костей</span>
            <span class="fae-dice-skin-active-name" style="color:${activeSkin.accent};">${escapeHtml(activeSkin.title)}</span>
          </div>
          <button type="button" class="fae-dice-skin-collapse-btn" id="faeDiceSkinCollapseBtn" title="Свернуть панель скинов влево">‹ Свернуть</button>
        </div>
        <div class="fae-dice-skin-grid">
          ${FAE_DICE_SKINS.map(sk => {
            const isAct = sk.id === activeSkin.id;
            return `<button type="button" class="fae-dice-skin-chip${isAct ? ' active' : ''}" data-fae-dice-skin="${sk.id}" style="--sk-accent:${sk.accent};--sk-glow:${sk.glow};--sk-bg:${sk.bg};--sk-border:${sk.border};" title="${escapeAttr(sk.title + ' — ' + sk.sub)}">
              <span class="fae-dice-skin-icons">
                <span class="fae-dice-skin-mini">${dieShapeSvg(20, 'skp20_' + sk.id, 20, sk.id)}</span>
                <span class="fae-dice-skin-mini coin">${generateCoinSvg('skpc_' + sk.id, 'C', sk.id)}</span>
              </span>
              <span class="fae-dice-skin-text">
                <span class="fae-dice-skin-title">${escapeHtml(sk.title)}</span>
                <span class="fae-dice-skin-sub">${escapeHtml(sk.sub)}</span>
              </span>
            </button>`;
          }).join('')}
        </div>
      </div>
      <button type="button" class="fae-dice-skin-tab" id="faeDiceSkinTabBtn" title="Развернуть / свернуть скины костей">
        <span class="fae-dice-skin-tab-die">${dieShapeSvg(20, 'sktab20_' + activeSkin.id, 20, activeSkin.id)}</span>
        <span class="fae-dice-skin-tab-label">Скины</span>
        <span class="fae-dice-skin-tab-arrow">›</span>
      </button>
    </aside>
  ` : '';

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
    ${faeSkinBarHtml}
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
        <label class="mod-unknown-chk${diceState.unknownMod ? ' active' : ''}" title="Добавить приписку « + мод.», если точный модификатор неизвестен">
          <input type="checkbox" id="modUnknownChk" ${diceState.unknownMod ? 'checked' : ''}>
          <span>+ мод.</span>
        </label>
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
  'Изобретатель':{ hd:'d8', saves:['con','int'], spell:true,  spellAb:'int', armor:'Лёгкие, средние доспехи, щиты', weapons:'Простое оружие, огнестрельное' },
  'Кровавый охотник':{ hd:'d10', saves:['dex','int'], spell:false, spellAb:'int', armor:'Лёгкие, средние доспехи, щиты', weapons:'Простое и воинское оружие' }
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
    techs:[], moves:[], customSkills:[],
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
  if(!Array.isArray(c.customSkills)){
    c.customSkills = Array.isArray(c.skills) ? c.skills : [];
  }
  c.customSkills = c.customSkills.filter(Boolean).map(function(s, idx){
    return {
      id: s.id || ('fae_skill_' + Date.now() + '_' + idx),
      name: s.name || 'Навык',
      kind: s.kind || 'Ремесло',
      level: s.level || 'Начатки',
      abil: s.abil || '',
      mod: s.mod != null ? String(s.mod) : '',
      src: s.src || '',
      gives: s.gives || '',
      desc: s.desc || ''
    };
  });
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
  return Number(lvl)===0 ? 'Заговор' : (lvl + ' круг');
}
function newSpell(schoolKey){
  return {
    id: null,
    name: '',
    en: '',
    school: schoolKey || 'evocation',
    level: 1,
    classes: 'Волшебник, Чародей',
    meta: '1 действие • 60 фт • Мгновенно',
    effect: '',
    isCustom: true
  };
}
function seedSpells(){
  if(typeof DND_SPELLS_DB !== 'undefined' && Array.isArray(DND_SPELLS_DB) && DND_SPELLS_DB.length){
    return DND_SPELLS_DB.map(function(row, idx){
      return {
        id: 'std_spell_' + idx,
        name: row[0] || '',
        en: row[1] || '',
        school: row[2] || 'evocation',
        level: Number(row[3]) || 0,
        classes: row[4] || '',
        meta: row[5] || '',
        effect: row[6] || '',
        isCustom: false
      };
    });
  }
  return [];
}
function loadSpells(){
  const canonical = seedSpells();
  try{
    const raw = localStorage.getItem('ttc_spells');
    if(!raw) return canonical;
    const arr = JSON.parse(raw);
    if(!Array.isArray(arr) || !arr.length) return canonical;
    // Сохраняем пользовательские (isCustom) и изменённые заклинания, объединяя их с полной базой DND_SPELLS_DB
    const canonicalByName = new Map();
    canonical.forEach(function(sp){
      canonicalByName.set((sp.name || '').toLowerCase(), sp);
    });
    const customList = [];
    arr.forEach(function(saved){
      if(!saved || !saved.name) return;
      const key = saved.name.toLowerCase();
      if(saved.isCustom && !canonicalByName.has(key)){
        customList.push(saved);
      }
    });
    return customList.concat(canonical);
  }catch(e){ return canonical; }
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
  if(typeof applyFaerunTheme === 'function') applyFaerunTheme();
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
  else if(view.screen === 'faeSkills') app.innerHTML = renderFaeSkills();
  else if(view.screen === 'faeSkillView') app.innerHTML = renderFaeSkillView();
  else if(view.screen === 'faeSkillEdit') app.innerHTML = renderFaeSkillEdit();
  else if(view.screen === 'faeSkillGen') app.innerHTML = renderFaeSkillGen();
  else if(view.screen === 'subclass') app.innerHTML = renderSubclassFeatures();
  else if(view.screen === 'magic') app.innerHTML = renderMagicHub();
  else if(view.screen === 'schoolSpells') app.innerHTML = renderSchoolSpells();
  else if(view.screen === 'spellForm') app.innerHTML = renderSpellForm();
  else if(view.screen === 'classes') app.innerHTML = renderClassesHub();
  else if(view.screen === 'class') app.innerHTML = renderClass();
  else if(view.screen === 'glossary') app.innerHTML = renderGlossaryHub();
  else if(view.screen === 'weaveLore') app.innerHTML = renderWeaveLore();
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
  if(c.indexOf('кровав')!==-1 || c.indexOf('blood')!==-1) return '🩸';
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
  var pbVal = fmtMod(profBonus(lvlVal));
  var techsCount = (c && Array.isArray(c.techs)) ? c.techs.length : 0;
  var movesCount = (c && Array.isArray(c.moves)) ? c.moves.length : 0;
  var skillsCount = (c && Array.isArray(c.customSkills)) ? c.customSkills.length : 0;
  var profSkillsCount = (c && c.skillProf) ? Object.keys(c.skillProf).filter(function(k){ return Number(c.skillProf[k]) > 0; }).length : 0;
  var totalSkillsBadge = skillsCount + profSkillsCount;

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
    '<div class="fae-card fae-card-clickable" data-go="faeSkills" role="button" tabindex="0">' +
      '<div style="flex:1;min-width:0;">' +
        '<div class="fae-card-title"><span>🛠️</span> Навыки и знания ' + (totalSkillsBadge ? '<span class="fae-ref-header-badge" style="margin-left:6px;padding:1px 8px;font-size:11px;">' + totalSkillsBadge + '</span>' : '') + '</div>' +
        '<div class="fae-card-desc">Ремёсла, инструменты, ступени мастерства, языки, лор, быт и 18 базовых навыков D&D 5e / 2024 + AI-генератор</div>' +
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
        '<div class="fae-card-desc">Классы D&D, Книга заклинаний, Карта Фаэруна, Правила 2024, Алхимия и зелья, Оружие и Глоссарий терминов</div>' +
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
    <p class="subtitle">Понятия, каноничная метафизика Плетения Мистры и боевые техники, разложенные по темам.</p>
    <div class="rule"></div>
    <div class="menu-list">
      <div class="menu-item" data-go="weaveLore">
        <div>
          <div class="name">✨ Плетение и Искусство Магии (The Weave)</div>
          <div class="desc">Канон Забытых Королевств: как устроено Плетение Мистры, как работают компоненты (V, S, M), различия классов и примеры отыгрыша за мага</div>
        </div>
        <div class="arrow">→</div>
      </div>
      <div class="menu-item" data-go="weapons">
        <div>
          <div class="name">🗡️ Бой оружием</div>
          <div class="desc">Стойки, атаки и термины — отдельно под каждое оружие</div>
        </div>
        <div class="arrow">→</div>
      </div>
      <div class="menu-item disabled">
        <div>
          <div class="name">🛡️ Снаряжение и доспехи</div>
          <div class="desc">Термины брони, ношения и обвеса</div>
        </div>
        <div class="tag-soon">скоро</div>
      </div>
    </div>
  `;
}

const WEAVE_LORE_FUNDAMENTALS = [
  {
    ru: "Сырая Магия (Raw Magic) и Плетение (The Weave)",
    orig: "Raw Magic & The Weave of Mystra",
    desc: "В космологии Забытых Королевств чистая («сырая») магия пронизывает всё мироздание, но для смертного разума прямое прикосновение к ней губительно — оно сжигает рассудок и разрывает плоть. Чтобы упорядочить этот первозданный хаос, богиня магии Мистра (Леди Тайн) поддерживает Плетение — невидимую эфирную ткань, окутывающую весь Торил. Плетение является одновременно и «божественным телом» Мистры, и безопасным интерфейсом: смертные заклинатели не создают энергию из пустоты, а вплетают нити Плетения в нужный узор."
  },
  {
    ru: "4 фазы сотворения заклинания",
    orig: "Plucking, Shaping, Vibrating & Release",
    desc: "Каноничное сотворение любого заклинания в D&D проходит четыре этапа взаимодействия с Плетением: (1) Захват нитей (Plucking) — заклинатель ментально нащупывает и вытягивает нужные струны Плетения вокруг себя; (2) Геометрия и Узлы (Pinning & Shaping) — пальцами или фокусировкой нити сгибаются в многомерную руническую матрицу и закрепляются эфирными узлами; (3) Резонанс (Vibrating) — голосом и волей матрица приводится в точную частоту вибрации; (4) Высвобождение (Release) — последний узел размыкается, узор вспыхивает физическим эффектом (огнём, молнией, исцелением), после чего нити расправляются обратно в ткань Плетения."
  },
  {
    ru: "Ячейки заклинаний и подготовка (Вансианская магия)",
    orig: "Spell Slots & Vancian Preparation",
    desc: "Почему заклинание расходует ячейку? Сложнейшее заклинание невозможно сплести с нуля за 6 секунд боя. Поэтому во время утренней подготовки Волшебник заранее (по чертежам из своего гримуара) сплетает 95% узора и укладывает эти «незамкнутые эфирные матрицы» в чертоги своего разума — это и есть Ячейки Заклинаний (Spell Slots). В бою магу остаётся лишь подать импульс в подготовленную матрицу, произнести финальную формулу и замкнуть последний узел. В этот миг структура разряжается, оставляя ячейку разума пустой до следующего продолжительного отдыха."
  },
  {
    ru: "Безумие Карсуса и Запрет Мистры (10+ круг)",
    orig: "Karsus's Folly & Mystra's Ban",
    desc: "В эпоху древней империи Нетерил архимаги творили заклинания 10-го, 11-го и 12-го кругов, сдвигая горы и поднимая в небо летающие города-анклавы. В −339 году ДЛ архимаг Карсус сотворил единственное в истории заклинание 12-го круга («Аватар Карсуса»), попытавшись временно занять место богини магии Мистрил. Плетение не выдержало перегрузки: Мистрил пожертвовала собой, чтобы спасти мир, Плетение отключилось на несколько минут, и все летающие города Нетерила рухнули на землю. Возродившаяся богиня Мистра наложила вечный Запрет (Mystra's Ban): отныне ни один смертный не может в одиночку сплести заклинание выше 9-го круга."
  },
  {
    ru: "Тёмное Плетение (Shadow Weave) богини Шар",
    orig: "The Shadow Weave of Shar",
    desc: "Тёмная сестра Селунэ, богиня ночи и утраты Шар, создала собственную искажённую сеть в промежутках между нитями Плетения Мистры — Тёмное Плетение. Маги, присягнувшие Шар или черпающие силу из Царства Теней (Shadowfell), плетут не сияющие лазурные струны, а холодные угольно-чёрные нити пустоты. Такое колдовство усиливает школы Иллюзии, Очарования и Некромантии, приглушает свет вокруг заклинателя, но постепенно иссушает память и эмоции самого мага."
  },
  {
    ru: "Зоны Мёртвой и Дикой Магии",
    orig: "Dead-Magic & Wild-Magic Zones",
    desc: "Там, где ткань Плетения была разорвана древними катаклизмами (Магической Чумой, Смутным Временем или гибелью артефактов), возникают аномалии. В Зоне Мёртвой Магии (Dead-Magic Zone) нитей Плетения нет вовсе — когда маг пытается потянуть за струну, его пальцы хватают лишь пустоту, и даже архимаг не способен зажечь свечу заговором. В Зоне Дикой Магии (Wild-Magic Zone) нити спутаны в кровоточащие узлы: любое заклинание задевает соседние струны, вызывая непредсказуемые всплески."
  }
];

const WEAVE_LORE_COMPONENTS = [
  {
    ru: "🔤 Вербальный компонент (Verbal / V)",
    orig: "Акустический резонанс и тональный ключ",
    desc: "В лоре Забытых Королевств слова заклинания — это не молитва и не просто название чар. Это точная звуковая частота, высота тона и гортанная вибрация (чаще всего на архаичном Драконьем, древнем Торассе, Нетерильском или языке Первичных стихий), которые заставляют невидимые струны Плетения резонировать, как камертон заставляет звучать струну арфы. Именно поэтому в сфере заклинания «Тишина» (Silence) или с кляпом во рту маг не может создать акустическую волну и физически не способен заставить нити Плетения откликнуться."
  },
  {
    ru: "✋ Соматический компонент (Somatic / S)",
    orig: "Ткацкий станок и эфирная геометрия",
    desc: "Точные пассы руками, сложные переплетения пальцев (мудры) и резкие росчерки кистью служат физическим «ткацким станком». Пальцы заклинателя буквально поддевают невидимые нити Плетения, натягивают их между фалангами, вычерчивают в воздухе светящиеся геометрические сигилы и завязывают в эфирные узлы. Если руки мага скованы, связаны или заняты щитом/оружием (без черты «Боевой заклинатель»), он не может выстроить геометрию узора, и нити выскальзывают."
  },
  {
    ru: "💎 Материальный компонент и Фокусировка (Material / M)",
    orig: "Симпатический якорь, катализатор и линза",
    desc: "Эфирное Плетение абстрактно, а материальный мир инертен. Чтобы перевести чистую концепцию в физическую реальность, нужен «симпатический якорь» — вещество с природным сродством к эффекту (щепотка серы и гуано летучей мыши для взрыва «Огненного шара», медная проволока для «Сообщения», кокон гусеницы для «Полиморфа»). Волшебная фокусировка (посох, жезл, кристалл, сфера) работает как настроенный резонатор, заменяющий простые реагенты. Но для высших чар (например, бриллиант за 300–1000 зм для «Возрождения» или «Воскрешения») требуется идеальная кристаллическая решётка, способная выдержать чудовищное напряжение Плетения — при разряде такой камень рассыпается в звёздную пыль."
  }
];

const WEAVE_LORE_CLASSES = [
  {
    ru: "📖 Волшебник (Wizard) — Архитектор и Геометр",
    orig: "«Искусство» (The Art) • Научный расчёт",
    desc: "Волшебник видит Плетение как грандиозное математическое уравнение и многомерный чертёж. Он не вымаливает магию и не полагается на инстинкт — он берёт струны Плетения холодным разумом, выверенным ритмом латыни/драконьего наречия и идеальной геометрией пальцев. Его гримуар — это сборник инженерных схем эфирных узлов."
  },
  {
    ru: "🔥 Чародей (Sorcerer) — Живой Проводник",
    orig: "«Искусство» (The Art) • Кровь и Инстинкт",
    desc: "Если Волшебник играет на Плетении по нотам, то Чародей сам является частью этой музыки. Из-за драконьей крови, прикосновения планов или бури Дикой Магии нити Плетения прорастают сквозь само его сердце. Он не чертит сложных формул — он сжимает кулак на пике ярости или вдохновения, силой воли сгибает эфир вокруг себя, а Метамагия позволяет ему буквально скручивать, удваивать или беззвучно рвать струны одной лишь мыслью."
  },
  {
    ru: "👁️ Колдун (Warlock) — Обходной Ключ Покровителя",
    orig: "Тайный пакт • Чужеродные врезки в Плетение",
    desc: "Покровитель (Архифея, Исчадие, Великий Древний) выжигает в душе Колдуна мистическое клеймо — «чёрный ход» к Плетению. Колдун использует древние, грубые и пугающе эффективные клинья: вместо тонкого кружева Волшебника он вбивает в ткань реальности багровые или изумрудные руны договора, выкачивая концентрированные сгустки силы («Мистический заряд»)."
  },
  {
    ru: "🪕 Бард (Bard) — Эхо Песни Творения",
    orig: "Words of Creation • Гармонический резонанс",
    desc: "По преданию, мир Торила был рождён первородной мелодией богов — Песнью Творения. Бард настраивает струны лютни, флейту или собственный голос в унисон с этим древним эхом. Его аккорды, насмешки и баллады пускают по Плетению мягкие или сокрушительные звуковые волны, которые сами сплетаются в чары очарования, исцеления и иллюзий."
  },
  {
    ru: "☀️ Жрец и Паладин (Cleric / Paladin) — Рука Божества",
    orig: "«Сила» (The Power) • Священный канал",
    desc: "Божественные заклинатели используют не «Искусство» (The Art), а «Силу» (The Power). Жрец или Паладин не плетёт сложные эфирные узлы сам — он возносит молитву и поднимает священный символ, а его божество (по согласию с законами Мистры) напрямую вливает уже готовую, ослепительную матрицу чуда через нити Плетения в руки своего избранника."
  },
  {
    ru: "🌿 Друид и Следопыт (Druid / Ranger) — Дыхание Торила",
    orig: "Первородная связь • Нити корней и ветров",
    desc: "Друиды обращаются к самым древним, прикорневым слоям Плетения, которые переплелись с реками, лесами, грозами и духами природы самого Торила. Их магия пахнет озоном, влажным мхом и древесной смолой: они не ломают Плетение, а просят саму живую землю расступиться или ударить молнией."
  }
];

const WEAVE_LORE_SCHOOLS = [
  {
    ru: "💥 Воплощение (Evocation)",
    orig: "Натяжение до разрыва • Запах озона и серы",
    desc: "Самая грубая и яркая работа с Плетением: маг с силой натягивает несколько силовых струн и резко сталкивает их лбами, высекая из трения эфира чистый огонь, дугу молнии, трескучий мороз или слепящее сияние. Волосы вокруг встают дыбом от статики."
  },
  {
    ru: "🛡️ Ограждение (Abjuration)",
    orig: "Плотная кольчуга из эфира • Звон хрусталя",
    desc: "Маг переплетает нити Плетения крест-накрест в сверхплотную кристаллическую решётку или многогранный купол. При ударе меча или вражеского заклинания по такому барьеру раздаётся гулкий звон натянутой тетивы или раскалывающегося сапфирового стекла."
  },
  {
    ru: "🌀 Вызов (Conjuration)",
    orig: "Игла и пространственный шов • Холодный сквозняк",
    desc: "Заклинатель использует сжатую в остриё нить Плетения как портновскую иглу: он прокалывает ткань пространства в двух точках и стягивает их вместе («Туманный шаг», «Дверь измерений») либо распахивает разрыв, вытягивая сквозь него материю или существо с другого плана."
  },
  {
    ru: "🎭 Иллюзия (Illusion)",
    orig: "Оптическая вуаль и мираж • Шёпот и блики",
    desc: "Тончайшая ювелирная работа: маг расщепляет одну нить Плетения на сотни невесомых паутинок и набрасывает их на световые лучи и звуковые волны (или прямо на зрительные нервы жертвы), заставляя пустоту переливаться фантомными красками и голосами."
  },
  {
    ru: "💜 Очарование (Enchantment)",
    orig: "Шёлковые поводья разума • Сладковатый дурман",
    desc: "Невидимые, мягкие нити Плетения протягиваются от губ и пальцев заклинателя прямо к вискам и сердцу цели, мягко вплетаясь в её мысли, приглушая ярость или нашептывая непреодолимый приказ."
  },
  {
    ru: "👁️ Прорицание (Divination)",
    orig: "Паутина чуткости • Вибрация натянутой струны",
    desc: "Маг не меняет мир, а касается Плетения кончиками пальцев, как паук касается своей паутины, считывая малейшие колебания струн сквозь стены, время и расстояния. Зрачки заклинателя при этом часто подергиваются серебристой поволокой."
  },
  {
    ru: "⚗️ Преобразование (Transmutation)",
    orig: "Перекройка узлов материи • Вкус меди на языке",
    desc: "Любой камень, клинок или живое тело имеет свой внутренний узор в Плетении. Маг-преобразователь временно распускает старые швы предмета и перевязывает их заново — превращая свинец в дерево, ускоряя течение времени вокруг союзника («Ускорение») или меняя плоть («Полиморф»)."
  },
  {
    ru: "💀 Некромантия (Necromancy)",
    orig: "Чёрные струны энтропии • Могильный холод и пепел",
    desc: "Обращение к самым холодным, изнаночным нитям Плетения, граничащим с Тёмным Плетением и Планом Негативной Энергии. Воздух вокруг рук некроманта мгновенно стынет, иней покрывает манжеты, а трава под сапогами жухнет, когда он сшивает кости мертвецов марионеточными нитями."
  }
];

const WEAVE_ROLEPLAY_EXAMPLES = [
  {
    title: "🔥 Боевое заклинание: Огненный шар (Fireball — 3 круг, V, S, M)",
    tag: "Воплощение • Полная цепочка V + S + M",
    text: "Большим и указательным пальцами левой руки я ныряю в поясной мешочек с компонентами и растираю в щепотке крупицы жёлтой серы с сухим гуано [М]. Правой ладонью я резко очерчиваю в воздухе перед собой треугольную руну Воплощения — в том месте, где проходят мои пальцы, воздух идёт маслянистой сизой рябью, словно я натягиваю невидимые струны арфы до предела [S]. Глубоко вдохнув, я гортанно выкрикиваю на древнем Драконьем: «Игнис Валькор!» [V]. От этого звука натянутые нити Плетения входят в резонанс, сжимают серную пыль на кончике моего указательного пальца в ослепительную оранжевую бусину — и я срывающим жестом отправляю её в центр строя врагов, размыкая узел у них под ногами!"
  },
  {
    title: "🛡️ Реакция: Щит (Shield — 1 круг, V, S)",
    tag: "Ограждение • Мгновенная защита за долю секунды",
    text: "Когда лезвие вражеской секиры уже рассекает воздух в дюйме от моего плеча, у меня нет времени на длинные расчёты. Я коротко выдыхаю резкий слог-ключ «Кхал!» [V] и выбрасываю раскрытую ладонь навстречу удару, растопырив пальцы веером и с силой проворачивая кисть по часовой стрелке [S]. Мои пальцы в единый миг захватывают ближайший пучок нитей Плетения и стягивают их в шестигранную сапфировую решётку подготовленной с утра матрицы Первого круга. Клинок с оглушительным хрустальным звоном высекает сноп голубых искр из полупрозрачного барьера и бессильно соскальзывает в сторону."
  },
  {
    title: "⚡ Реакция: Контрзаклинание (Counterspell — 3 круг, S)",
    tag: "Ограждение • Разрыв чужого узора Плетения",
    text: "Заметив, как вражеский культист начинает вычерчивать в воздухе багровые круги и набирать в грудь воздух для заклинания, я сужаю глаза — моё магическое зрение улавливает, как вокруг его кистей сплетается ещё не замкнутый каркас чар. Не произнося ни звука, я делаю резкий выпад двумя сложенными пальцами вперёд и рассекаю воздух крест-накрест, словно ножницами [S], посылая вдоль струн Плетения встречный диссонансный импульс. Главный несущий узел в руках врага лопается с глухим хлопком озона, и его заклинание рассыпается безвредным сизым дымом прямо у него на пальцах."
  },
  {
    title: "⛓️ Поддержание Концентрации: Удержание личности (Hold Person — 2 круг, V, S, M)",
    tag: "Очарование • Физическое удержание натянутых струн",
    text: "Зажав между пальцами тонкую полоску холодного железа [M], я произношу звенящую, тягучую формулу подчинения [V] и делаю движение кистью, будто беру на поводок невидимую марионетку [S]. Золотистые нити Плетения опутывают суставы и позвоночник главаря бандитов, превращая его мышцы в камень. Но заклинание не отпущено в свободный полёт: чтобы удерживать Концентрацию, я оставляю пальцы левой руки полусогнутыми в напряжённом жесте — я буквально ощущаю кожей, как пленник бьётся внутри эфирного кокона, и каждое его усилие отдаётся тупой вибрацией в моих висках."
  },
  {
    title: "📖 Утренняя подготовка заклинаний по Гримуару (Spell Preparation)",
    tag: "Отдых и Быт • Как Волшебник заряжает ячейки",
    text: "На рассвете, пока отряд собирает лагерь у догорающего костра, я раскрываю на коленях свой окованный латунью гримуар. Перелистывая пергаментные страницы, исписанные геометрическими диаграммами и заметками на Высоком Торассе, я вхожу в лёгкий транс. В течение часа я медленно вожу пальцами над чертежами, вытягивая из утреннего воздуха тонкие серебристые нити Плетения. Я сплетаю их в сложные многогранные каркасы «Туманного шага», «Волшебной стрелы» и «Огненного шара», доводя каждый узор почти до самого конца — но оставляю финальный узел разомкнутым и бережно укладываю эти спящие матрицы в ячейки своей памяти, шепча короткую благодарность Леди Тайн Мистре."
  },
  {
    title: "🎭 Контраст классов: одно заклинание тремя разными стилями",
    tag: "Волшебник vs Чародей vs Колдун",
    text: "• ВОЛШЕБНИК (Инженер Плетения): «Выверив угол и дистанцию, я касаюсь кристаллического навершия посоха, отчётливо чеканю три слога на языке древнего Нетерила и точным росчерком безымянного пальца замыкаю подготовленную с утра руническую матрицу — три лазурных дротика света срываются с идеальной симметрией».\n• ЧАРОДЕЙ (Кровь и Эмоция): «Кровь драконьих предков закипает в моих венах; не вспоминая никаких книжных чертежей, я просто сжимаю искрящийся кулак и на выдохе рву струны Плетения прямо на себя — воздух вокруг моих плеч вспыхивает алым маревом, и поток первородного пламени вырывается из самой моей груди».\n• КОЛДУН (Печать Договора): «Мой зрачок на миг вертикально сужается, а шрам-клеймо Покровителя на запястье обжигает ледяным холодом. Я шепчу запретное имя из глубин Бездны и резким движением когтей распарываю ткань Плетения, выпуская из багровой трещины шипящий сгусток потусторонней энергии»."
  }
];

function renderWeaveLore(){
  const fundCards = WEAVE_LORE_FUNDAMENTALS.map(item => `
    <div class="card term" data-copy="${escapeAttr(item.ru + ' (' + item.orig + '): ' + item.desc)}">
      <div class="name">${escapeHtml(item.ru)}</div>
      <div class="eng">${escapeHtml(item.orig)}</div>
      <div class="desc">${escapeHtml(item.desc)}</div>
      <div class="stamp"><span>Скопировано</span></div>
    </div>
  `).join('');

  const compCards = WEAVE_LORE_COMPONENTS.map(item => `
    <div class="card term" data-copy="${escapeAttr(item.ru + ': ' + item.desc)}">
      <div class="name">${escapeHtml(item.ru)}</div>
      <div class="eng">${escapeHtml(item.orig)}</div>
      <div class="desc">${escapeHtml(item.desc)}</div>
      <div class="stamp"><span>Скопировано</span></div>
    </div>
  `).join('');

  const clsCards = WEAVE_LORE_CLASSES.map(item => `
    <div class="card term" data-copy="${escapeAttr(item.ru + ' — ' + item.desc)}">
      <div class="name">${escapeHtml(item.ru)}</div>
      <div class="eng">${escapeHtml(item.orig)}</div>
      <div class="desc">${escapeHtml(item.desc)}</div>
      <div class="stamp"><span>Скопировано</span></div>
    </div>
  `).join('');

  const schoolCards = WEAVE_LORE_SCHOOLS.map(item => `
    <div class="card term" data-copy="${escapeAttr(item.ru + ': ' + item.desc)}">
      <div class="name">${escapeHtml(item.ru)}</div>
      <div class="eng">${escapeHtml(item.orig)}</div>
      <div class="desc">${escapeHtml(item.desc)}</div>
      <div class="stamp"><span>Скопировано</span></div>
    </div>
  `).join('');

  const rpCards = WEAVE_ROLEPLAY_EXAMPLES.map(ex => `
    <div class="card term" data-copy="${escapeAttr(ex.text)}" style="grid-column: 1 / -1;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:4px;">
        <div class="name" style="margin:0;">${escapeHtml(ex.title)}</div>
        <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--brass);border:1px solid var(--brass-dim);padding:2px 8px;border-radius:3px;">${escapeHtml(ex.tag)}</span>
      </div>
      <div class="desc" style="white-space:pre-line;line-height:1.62;color:var(--ink);font-size:16.5px;margin-top:6px;">${escapeHtml(ex.text)}</div>
      <div style="margin-top:8px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--ink-dim);">📋 Нажмите на карточку, чтобы скопировать пример отыгрыша в буфер обмена</div>
      <div class="stamp"><span>Скопировано</span></div>
    </div>
  `).join('');

  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Глоссарий', nav:'glossary'},{label:'Плетение и Искусство Магии'}])}
    <button class="back" data-go="glossary">← В глоссарий</button>
    <h1>✨ Плетение Мистры и Искусство Магии</h1>
    <p class="subtitle">Каноническое устройство магии Забытых Королевств (Forgotten Realms): как заклинатели взаимодействуют с Плетением (The Weave), физический смысл компонентов V / S / M и готовые примеры литературного отыгрыша.</p>
    <div class="rule"></div>

    <div class="section-label">🌌 1. Метафизика Плетения: как работает магия в Фаэруне</div>
    <div class="grid">${fundCards}</div>

    <div class="section-label" style="margin-top:28px;">🔑 2. Компоненты заклинаний (V, S, M) в лоре Плетения</div>
    <div class="grid">${compCards}</div>

    <div class="section-label" style="margin-top:28px;">⚖️ 3. «Искусство» (The Art) и «Сила» (The Power): как колдуют разные классы</div>
    <div class="grid">${clsCards}</div>

    <div class="section-label" style="margin-top:28px;">🔮 4. Сенсорные признаки 8 Школ Магии («Швы Плетения»)</div>
    <div class="grid">${schoolCards}</div>

    <div class="section-label" style="margin-top:28px;">🎭 5. Примеры каноничного отыгрыша за мага (клик — скопировать)</div>
    <div class="grid">${rpCards}</div>
  `;
}

function isItemInHeroTechsByName(hero, nameStr){
  if(!hero || !Array.isArray(hero.techs) || !nameStr) return false;
  var low = String(nameStr).trim().toLowerCase();
  return hero.techs.some(function(t){
    if(!t || !t.name) return false;
    var tn = String(t.name).trim().toLowerCase();
    return tn === low || tn === ('✨ ' + low) || tn.indexOf(low + ' (') === 0 || tn.indexOf('✨ ' + low + ' (') === 0;
  });
}

function isItemInHeroMovesByName(hero, nameStr){
  if(!hero || !Array.isArray(hero.moves) || !nameStr) return false;
  var low = String(nameStr).trim().toLowerCase();
  return hero.moves.some(function(m){
    if(!m || !m.name) return false;
    var mn = String(m.name).trim().toLowerCase();
    return mn === low || mn === ('⚔️ ' + low) || mn.indexOf(low + ' (') === 0 || mn.indexOf('⚔️ ' + low + ' (') === 0;
  });
}

function renderAddTechAndMoveBtns(opts){
  var hero = getActiveFaerunCharacter();
  var heroName = (hero && hero.name) ? hero.name : 'Герой';
  var titleFull = opts.title + (opts.en ? (' (' + opts.en + ')') : '');
  var inTech = isItemInHeroTechsByName(hero, opts.title) || isItemInHeroTechsByName(hero, titleFull);
  var inMove = isItemInHeroMovesByName(hero, opts.title) || isItemInHeroMovesByName(hero, titleFull);

  var techBtn = inTech
    ? `<button type="button" class="rc-btn" disabled style="background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.45);color:#6ee7b7;font-weight:600;">✓ В способностях (${escapeHtml(heroName)})</button>`
    : `<button type="button" class="rc-btn" data-add-class-tech-name="${escapeAttr(titleFull)}" data-add-class-tech-cat="${escapeAttr(opts.techCat || 'Классовые умения')}" data-add-class-tech-src="${escapeAttr(opts.source || 'Справочник D&D')}" data-add-class-tech-desc="${escapeAttr(opts.desc || '')}" data-add-class-tech-roll="${escapeAttr(opts.roll || '')}" style="background:rgba(201,164,92,0.14);border-color:rgba(201,164,92,0.5);color:#f3e5ab;font-weight:600;">✨ + В способности (${escapeHtml(heroName)})</button>`;

  var moveBtn = inMove
    ? `<button type="button" class="rc-btn" disabled style="background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.45);color:#6ee7b7;font-weight:600;">✓ В приёмах (${escapeHtml(heroName)})</button>`
    : `<button type="button" class="rc-btn" data-add-class-move-name="${escapeAttr(titleFull)}" data-add-class-move-cat="${escapeAttr(opts.moveCat || 'Особые удары, Захваты и Толчки')}" data-add-class-move-weapon="${escapeAttr(opts.weapon || 'Любое оружие')}" data-add-class-move-bonus="${escapeAttr(opts.bonus || '')}" data-add-class-move-mastery="${escapeAttr(opts.mastery || '')}" data-add-class-move-desc="${escapeAttr(opts.desc || '')}" style="background:rgba(56,189,248,0.12);border-color:rgba(56,189,248,0.45);color:#bae6fd;font-weight:600;">⚔️ + В приёмы (${escapeHtml(heroName)})</button>`;

  if(opts.moveFirst) return moveBtn + techBtn;
  return techBtn + moveBtn;
}

function termCard(item, opts){
  var buttonsHtml = '';
  if(opts && opts.withActions){
    buttonsHtml = `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px;padding-top:8px;border-top:1px solid rgba(201,164,92,0.14);">` +
      renderAddTechAndMoveBtns({
        title: item.ru,
        en: item.orig || item.en || '',
        desc: item.desc || '',
        source: opts.source || 'Бой оружием',
        weapon: opts.weapon || 'Оружие ближнего боя',
        mastery: opts.mastery || '',
        techCat: opts.techCat || 'Классовые умения',
        moveCat: opts.moveCat || 'Оружейные атаки и Мастерство (2024)',
        moveFirst: true
      }) +
    `</div>`;
  }
  return `
    <div class="card term" data-copy="${escapeAttr(item.ru)}">
      <div class="name">${item.ru}</div>
      ${item.orig ? `<div class="eng">${item.orig}</div>` : ''}
      <div class="desc">${item.desc}</div>
      ${buttonsHtml}
      <div class="stamp"><span>Скопировано</span></div>
    </div>`;
}

function stanceBlock(stance, wpnRu){
  return `
    <div class="stance-block">
      ${termCard(stance, {withActions:true, source:'Стойка (' + (wpnRu||'Оружие') + ')', weapon:wpnRu||'Оружие', moveCat:'Защитные стойки и Реакции'})}
      ${stance.attacks && stance.attacks.length ? `
        <div class="stance-attacks-label">↳ Атаки из этой стойки</div>
        <div class="grid attacks-grid">${stance.attacks.map(a => termCard(a, {withActions:true, source:'Атака из стойки «' + stance.ru + '»', weapon:wpnRu||'Оружие', moveCat:'Оружейные атаки и Мастерство (2024)'})).join('')}</div>
      ` : ''}
    </div>
  `;
}

function termSection(title, items, opts){
  if(!items || !items.length) return '';
  return `
    <div class="section-label">${title}</div>
    <div class="grid">${items.map(it => termCard(it, opts)).join('')}</div>
  `;
}

function renderWeapons(){
  if(!view.weapon) view.weapon = 'longsword';
  const data = GLOSSARY[view.weapon] || {};
  const wpnObj = WEAPONS.find(w=>w.id===view.weapon) || WEAPONS[0];
  const wpnRu = wpnObj ? wpnObj.ru : 'Оружие';
  const pills = WEAPONS.map(w=>
    `<button class="pill ${w.id===view.weapon?'active':''}" data-weapon="${w.id}">${w.ru}</button>`
  ).join('');

  const stancesHtml = (data.stances && data.stances.length)
    ? `<div class="section-label">Стойки и атаки (${escapeHtml(wpnRu)})</div>${data.stances.map(s=>stanceBlock(s, wpnRu)).join('')}`
    : '';

  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Глоссарий', nav:'glossary'},{label:'Бой оружием'}])}
    <button class="back" data-go="glossary">← В глоссарий</button>
    <h1>🗡️ Бой оружием и Фехтовальные стойки</h1>
    <p class="subtitle">Выберите оружие — любую стойку или удар можно сразу добавить в «Боевые приёмы» или «Способности» вашего героя.</p>
    <div class="rule"></div>
    ${renderSpellHeroTargetBar()}
    <div class="pill-row">${pills}</div>
    ${stancesHtml}
    ${termSection('Фехтовальные приёмы и термины (' + wpnRu + ')', data.terms, {withActions:true, source:'Фехтование (' + wpnRu + ')', weapon:wpnRu, moveCat:'Оружейные атаки и Мастерство (2024)'})}
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
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Карта Фаэруна'}])}
    <button class="back" data-go="faeRef">← В справочник</button>
    <h1>🗺️ Карта Фаэруна</h1>
    <p class="subtitle">Выбери источник интерактивной карты Забытых Королевств — встроена прямо на странице.</p>
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
  'Жрец', 'Друид', 'Бард', 'Чародей', 'Колдун', 'Волшебник', 'Изобретатель', 'Кровавый охотник'
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
    `КД ${d.ac} · Инициатива ${fmtMod(abilityMod(d.abilities.dex)+Number(d.initMisc||0))}`,
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
    <p class="subtitle">Ключевые механики редакции 2024 года. Свойства Мастерства оружия можно сразу добавить в приёмы или способности героя.</p>
    <div class="rule"></div>
    ${renderSpellHeroTargetBar()}

    <div class="section-label">Мастерство оружия (Weapon Mastery 2024)</div>
    <div class="grid">${WEAPON_MASTERY.map(wm => termCard(wm, {withActions:true, source:'Мастерство оружия D&D 2024', weapon:'Оружие со свойством «' + wm.ru + '»', mastery:wm.ru + (wm.orig ? (' ('+wm.orig+')') : ''), moveCat:'Оружейные атаки и Мастерство (2024)'})).join('')}</div>

    <div class="section-label">Состояния</div>
    <div class="grid">${CONDITIONS_2024.map(c => termCard(c)).join('')}</div>

    <div class="section-label">Истощение</div>
    <div class="grid">${EXHAUSTION_LEVELS.map(c => termCard(c)).join('')}</div>

    <div class="section-label">Укрытие</div>
    <div class="grid">${COVER_RULES.map(c => termCard(c)).join('')}</div>

    <div class="section-label">Прочее</div>
    <div class="grid">${MISC_RULES_2024.map(c => termCard(c)).join('')}</div>
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
  var sCount = (c && Array.isArray(c.customSkills)) ? c.customSkills.length : 0;
  var pCount = (c && c.skillProf) ? Object.keys(c.skillProf).filter(function(k){ return Number(c.skillProf[k]) > 0; }).length : 0;
  var totSkills = sCount + pCount;

  var charOpts = chars.map(function(ch){
    var isSel = c && ch.id === c.id;
    return '<option value="' + escapeAttr(ch.id) + '" ' + (isSel ? 'selected' : '') + '>' +
      getFaerunClassIcon(ch.className) + ' ' + escapeHtml(ch.name || 'Герой') + ' (' + escapeHtml(ch.className || 'D&D') + ' ' + (ch.level||1) + ' ур.)' +
    '</option>';
  }).join('');

  return '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;">' +
    '<div class="fae-nav-tabs" style="margin-bottom:0;flex:1;min-width:280px;">' +
      '<button type="button" class="fae-nav-tab ' + (activeTab==='techs'?'active':'') + '" data-go="faeTechs">' +
        '✨ Способности (' + tCount + ')' +
      '</button>' +
      '<button type="button" class="fae-nav-tab ' + (activeTab==='moves'?'active':'') + '" data-go="faeMoves">' +
        '⚔️ Боевые приёмы (' + mCount + ')' +
      '</button>' +
      '<button type="button" class="fae-nav-tab ' + (activeTab==='skills'?'active':'') + '" data-go="faeSkills">' +
        '🛠️ Навыки и знания (' + totSkills + ')' +
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
      if(window._faeTechLauncher) window._faeTechLauncher.techId = '';
      if(window._faeMoveLauncher) window._faeMoveLauncher.moveId = '';
      if(window._faeSkillLauncher) window._faeSkillLauncher.skillRef = '';
      render();
    });
  }
}

/* ---------- БОЕВОЙ РАСЧЁТ СПОСОБНОСТЕЙ, ПРИЁМОВ И НАВЫКОВ ФАЭРУНА (по образцу раздела Шиноби) ---------- */

function formatFaeLauncherMod(m){
  var n = parseInt(m, 10) || 0;
  if(!n) return '';
  return n > 0 ? '+ ' + n : '− ' + Math.abs(n);
}

function parseFaeDiceFormula(str){
  if(!str || typeof str !== 'string') return null;
  var clean = str.replace(/\s+/g, '');
  var m = clean.match(/(\d*)[dдкk](\d+)([+-]\d+)?/i);
  if(m){
    var n = Math.max(1, Math.min(12, parseInt(m[1], 10) || 1));
    var sides = parseInt(m[2], 10) || 6;
    if([4, 6, 8, 10, 12, 20, 100].indexOf(sides) === -1) sides = 6;
    var mod = m[3] ? parseInt(m[3], 10) : 0;
    return { n: n, sides: sides, mod: mod };
  }
  return null;
}

function parseFaeSignedMod(str){
  if(!str || typeof str !== 'string') return 0;
  var withoutDice = str.replace(/\d*[dдкk]\d+([+-]\d+)?/gi, '');
  var m = withoutDice.match(/([+-]\s*\d+)/);
  if(m) return parseInt(m[1].replace(/\s+/g, ''), 10) || 0;
  var nOnly = str.trim().match(/^(\d+)$/);
  if(nOnly) return parseInt(nOnly[1], 10) || 0;
  return 0;
}

/* --- 1. БОЕВОЙ РАСЧЁТ СПОСОБНОСТИ (faeTechs) --- */
function buildFaeTechComboText(t, isConc, rolledValues, mods){
  var catStr = t.category || 'Классовые умения';
  var actStr = t.actionCost || '1 действие';
  var cdStr = t.cooldown ? (' | Перезарядка: ' + t.cooldown) : '';
  var header = '*[Способность: ' + (t.name || 'Без названия') + ' | Категория: ' + catStr + ' | Действие: ' + actStr + cdStr + ']*';
  var lines = [header];

  if(isConc && rolledValues && rolledValues.conc){
    var cMod = parseInt(mods.conc, 10) || 0;
    var cModStr = cMod > 0 ? ' + ' + cMod : (cMod < 0 ? ' − ' + Math.abs(cMod) : '');
    lines.push('*[Результат броска Концентрация / Спасбросок 1d20: ' + rolledValues.conc + ' ]*' + cModStr);
  }

  if(rolledValues && rolledValues.atk){
    var aMod = parseInt(mods.atk, 10) || 0;
    var aModStr = aMod > 0 ? ' + ' + aMod : (aMod < 0 ? ' − ' + Math.abs(aMod) : '');
    lines.push('*[Результат броска Попадание / Проверка 1d20: ' + rolledValues.atk + ' ]*' + aModStr);
  }

  var pDmg = parseFaeDiceFormula(t.checkOrSave || t.desc || '');
  if(pDmg && rolledValues && rolledValues.dmgRolls && rolledValues.dmgRolls.length){
    var n = rolledValues.dmgRolls.length;
    var dSides = rolledValues.dmgSides || pDmg.sides;
    var dMod = parseInt(mods.dmg, 10) || 0;
    var dModStr = dMod > 0 ? ' + ' + dMod : (dMod < 0 ? ' − ' + Math.abs(dMod) : '');
    lines.push('*[Результат броска Эффект / Урон ' + n + 'd' + dSides + ': ' + rolledValues.dmgRolls.join(' | ') + ' ]*' + dModStr);
  } else if(t.checkOrSave){
    lines.push('*[Параметр / СЛ: ' + t.checkOrSave + ']*');
  }

  return lines.join('\n');
}

function renderFaeTechLauncherDiceHtml(tech, isConc, selTarget, mods, rolledValues){
  if(!tech) return '<div class="sh-scr-no-dmg">Выберите способность для расчёта</div>';
  mods = mods || { conc: 0, atk: 0, dmg: 0 };
  rolledValues = rolledValues || {};

  var concDieHtml = '';
  if(isConc){
    var cModStr = formatFaeLauncherMod(mods.conc);
    concDieHtml =
      '<div class="sh-scr-col ' + (selTarget === 'conc' ? 'selected' : '') + '" data-select-fae-tech-roll="conc" title="Кликните для выбора кубика и настройки модификатора">' +
        '<div class="sh-scr-label" style="color:#ff9085;">Концентрация</div>' +
        '<div class="sh-scr-die die s20" id="faeScrDieTechConc">' +
          (typeof dieShapeSvg === 'function' ? dieShapeSvg(20, 'faetconc', null) : '') +
          '<div class="val">' + (rolledValues.conc || 20) + '</div>' +
        '</div>' +
        '<div class="sh-scr-sub" id="faeScrSub_techConc">1d20' + (cModStr ? ' ' + cModStr : '') + '</div>' +
      '</div>';
  }

  var aModStr = formatFaeLauncherMod(mods.atk);
  var atkDieHtml =
    '<div class="sh-scr-col ' + (selTarget === 'atk' ? 'selected' : '') + '" data-select-fae-tech-roll="atk" title="Кликните для выбора кубика и настройки модификатора">' +
      '<div class="sh-scr-label">Попадание / Проверка</div>' +
      '<div class="sh-scr-die die s20" id="faeScrDieTechAtk">' +
        (typeof dieShapeSvg === 'function' ? dieShapeSvg(20, 'faetatk', null) : '') +
        '<div class="val">' + (rolledValues.atk || 20) + '</div>' +
      '</div>' +
      '<div class="sh-scr-sub" id="faeScrSub_techAtk">1d20' + (aModStr ? ' ' + aModStr : '') + '</div>' +
    '</div>';

  var pDmg = parseFaeDiceFormula(tech.checkOrSave || tech.desc || '');
  var dmgBlockHtml = '';
  if(pDmg){
    var n = pDmg.n;
    var dSides = pDmg.sides;
    var dModStr = formatFaeLauncherMod(mods.dmg);
    var dmgDiceList = [];
    var rolls = rolledValues.dmgRolls || [];
    for(var i = 0; i < n; i++){
      var curVal = rolls[i] || dSides;
      dmgDiceList.push(
        '<div class="sh-scr-die die s' + dSides + '" id="faeScrDieTechDmg_' + i + '">' +
          (typeof dieShapeSvg === 'function' ? dieShapeSvg(dSides, 'faetdmg' + i, null) : '') +
          '<div class="val">' + curVal + '</div>' +
        '</div>'
      );
    }
    var baseFormula = n + 'd' + dSides + (pDmg.mod ? (pDmg.mod > 0 ? '+' + pDmg.mod : pDmg.mod) : '');
    dmgBlockHtml =
      '<div class="sh-scr-dmg-group ' + (selTarget === 'dmg' ? 'selected' : '') + '" data-select-fae-tech-roll="dmg" title="Кликните для выбора кубиков и настройки модификатора">' +
        '<div class="sh-scr-label">Урон / Исцеление (' + baseFormula + ')</div>' +
        '<div class="sh-scr-dmg-dice">' + dmgDiceList.join('') + '</div>' +
        '<div class="sh-scr-sub" id="faeScrSub_techDmg">' + n + 'd' + dSides + (dModStr ? ' ' + dModStr : '') + '</div>' +
      '</div>';
  } else {
    var efNote = tech.checkOrSave ? ('Параметр / СЛ: <b>' + escapeHtml(tech.checkOrSave) + '</b>') : ('Действие: <b>' + escapeHtml(tech.actionCost || '1 действие') + '</b> (без броска костей урона)');
    dmgBlockHtml = '<div class="sh-scr-no-dmg">' + efNote + '</div>';
  }

  return '<div class="sh-screen-dice-tray">' + concDieHtml + atkDieHtml + dmgBlockHtml + '</div>';
}

function renderFaeTechLauncher(c){
  var techs = (c && Array.isArray(c.techs)) ? c.techs : [];
  if(!techs.length){
    return '<div class="sh-launcher" style="margin-bottom:16px;">' +
      '<div class="sh-launcher-title">⚔️ Боевой расчёт способности <span class="sh-badge-tag">AI Studio</span></div>' +
      '<div class="char-empty" style="margin:10px 0 0;padding:12px;">Способности ещё не добавлены. Добавьте способность кнопкой выше или из Книги заклинаний / Классов, чтобы использовать боевой расчёт.</div>' +
    '</div>';
  }

  if(!window._faeTechLauncher) window._faeTechLauncher = {};
  var L = window._faeTechLauncher;
  if(L.isOpen === undefined) L.isOpen = false;
  if(!L.mods) L.mods = { conc: 0, atk: 0, dmg: 0 };
  if(!L.rolledValues) L.rolledValues = {};
  if(!L.selectedTarget) L.selectedTarget = 'atk';

  var selTech = techs.find(function(x){ return x.id === L.techId; }) || techs[0];
  if(L.techId !== selTech.id){
    L.techId = selTech.id;
    var initDmg = parseFaeDiceFormula(selTech.checkOrSave || selTech.desc || '');
    L.mods.dmg = initDmg ? (initDmg.mod || 0) : 0;
    L.mods.atk = parseFaeSignedMod(selTech.checkOrSave);
  }

  var isConc = !!L.isConc;
  var pDmg = parseFaeDiceFormula(selTech.checkOrSave || selTech.desc || '');
  var selTarget = L.selectedTarget;
  if(selTarget === 'conc' && !isConc) selTarget = 'atk';
  if(selTarget === 'dmg' && !pDmg) selTarget = 'atk';
  L.selectedTarget = selTarget;

  var targetNames = { conc: '🔮 Концентрация / Спасбросок', atk: '🎯 Попадание / Проверка', dmg: '💥 Урон / Исцеление' };
  var targetTitle = targetNames[selTarget] || '🎯 Попадание / Проверка';
  var curModVal = L.mods[selTarget] || 0;

  var techOpts = techs.map(function(t){
    var act = t.actionCost ? (' (' + t.actionCost + ')') : '';
    var sav = t.checkOrSave ? (' [' + t.checkOrSave + ']') : '';
    return '<option value="' + escapeAttr(t.id) + '" ' + (t.id === selTech.id ? 'selected' : '') + '>' +
      escapeHtml(t.category || 'Умение') + ' · ' + escapeHtml(t.name || 'Без названия') + act + sav +
    '</option>';
  }).join('');

  var screenHtml = renderFaeTechLauncherDiceHtml(selTech, isConc, selTarget, L.mods, L.rolledValues);

  var modBarHtml =
    '<div class="sh-mod-bar">' +
      '<div class="sh-mod-target-info">' +
        '<span>Выбран кубик:</span>' +
        '<span class="sh-mod-target-tag" id="faeTechModTargetName">' + targetTitle + '</span>' +
      '</div>' +
      '<div class="sh-mod-controls">' +
        '<button type="button" class="sh-mod-step" data-fae-tech-mod-delta="-5" title="Уменьшить на 5">−5</button>' +
        '<button type="button" class="sh-mod-step" data-fae-tech-mod-delta="-1" title="Уменьшить на 1">−</button>' +
        '<input type="number" id="faeTechActiveModInput" class="sh-active-mod-input" value="' + curModVal + '">' +
        '<button type="button" class="sh-mod-step" data-fae-tech-mod-delta="1" title="Увеличить на 1">+</button>' +
        '<button type="button" class="sh-mod-step" data-fae-tech-mod-delta="5" title="Увеличить на 5">+5</button>' +
        '<button type="button" class="sh-mod-reset" id="faeTechModResetBtn" title="Сбросить модификатор в 0">Сброс</button>' +
      '</div>' +
      '<label class="sh-exp-check">' +
        '<input type="checkbox" id="faeTechLauncherConc"' + (isConc ? ' checked' : '') + '> 🔮 Концентрация / Спасбросок' +
      '</label>' +
    '</div>';

  var actionsHtml =
    '<div class="sh-launcher-actions">' +
      '<button type="button" class="sh-btn-launch" id="faeLaunchTechComboBtn" title="Бросить все кости способности и зафиксировать результат">⚔️ Применить способность</button>' +
      '<button type="button" class="sh-btn-copy-all" id="faeCopyAllTechBtn" title="Скопировать готовый блок в буфер обмена для AI Studio">📋 Скопировать всё</button>' +
      '<button type="button" class="sh-micro-btn" id="faeLaunchTechAtkBtn" title="Бросить и скопировать только попадание/проверку">🎯 Попадание</button>' +
      (pDmg ? '<button type="button" class="sh-micro-btn" id="faeLaunchTechDmgBtn" title="Бросить и скопировать только урон/исцеление">💥 Урон / Эффект</button>' : '') +
      (isConc ? '<button type="button" class="sh-micro-btn" id="faeLaunchTechConcBtn" title="Бросить и скопировать Концентрацию">🔮 Концентрация</button>' : '') +
      '<button type="button" class="sh-micro-btn" id="faeLaunchTechClaimBtn" title="Скопировать только заголовок заявки">📜 Только заявка</button>' +
    '</div>';

  var hasRes = !!(L.lastResult);
  var resultBoxHtml =
    '<div class="sh-launcher-result ' + (hasRes ? 'has-result' : '') + '" id="faeTechLauncherResultBox">' +
      '<div class="sh-launcher-result-text" id="faeTechLauncherResultText">' + escapeHtml(L.lastResult || '') + '</div>' +
      '<div class="sh-copy-badge" id="faeTechLauncherCopyBadge" style="display:' + (hasRes ? 'inline-flex' : 'none') + ';">' +
        '<span>' + (L.lastResultCopied ? '✓ Скопировано в буфер обмена для AI Studio' : '🎲 Бросок зафиксирован. Нажмите «📋 Скопировать всё»') + '</span>' +
      '</div>' +
    '</div>';

  var isOpen = !!L.isOpen;
  var toggleHeadHtml =
    '<div class="sh-launcher-toggle-head" id="faeTechLauncherToggle" role="button" tabindex="0" title="Нажмите, чтобы развернуть или свернуть боевой расчёт способности">' +
      '<div class="sh-launcher-title">' +
        '<span>⚔️ Боевой расчёт способности</span>' +
        '<span class="sh-badge-tag">AI Studio</span>' +
      '</div>' +
      '<div class="sh-launcher-toggle-btn">' +
        '<span class="sh-launcher-toggle-text">' + (isOpen ? 'Свернуть' : 'Развернуть') + '</span>' +
        '<span class="sh-launcher-toggle-arrow">' + (isOpen ? '▲' : '▼') + '</span>' +
      '</div>' +
    '</div>';

  var bodyHtml =
    '<div class="sh-launcher-body" id="faeTechLauncherBody">' +
      '<div class="sh-launcher-head">' +
        '<div class="sh-launcher-sel-wrap">' +
          '<div class="sh-launcher-sel-label">Способность для броска:</div>' +
          '<select class="sh-launcher-sel" id="faeTechLauncherSelect">' + techOpts + '</select>' +
        '</div>' +
      '</div>' +
      '<div class="sh-launcher-screen" id="faeTechLauncherScreen">' + screenHtml + '</div>' +
      modBarHtml +
      actionsHtml +
      resultBoxHtml +
    '</div>';

  return '<div class="sh-launcher ' + (isOpen ? '' : 'collapsed') + '" id="faeTechLauncherContainer">' +
    toggleHeadHtml +
    bodyHtml +
  '</div>';
}

function wireFaeTechLauncher(){
  var c = getActiveFaerunCharacter();
  var techs = (c && Array.isArray(c.techs)) ? c.techs : [];
  if(!window._faeTechLauncher) window._faeTechLauncher = { isOpen: false, mods: { conc: 0, atk: 0, dmg: 0 }, rolledValues: {}, selectedTarget: 'atk' };
  var L = window._faeTechLauncher;

  var tHead = document.getElementById('faeTechLauncherToggle');
  if(tHead){
    var toggleFn = function(){
      L.isOpen = !L.isOpen;
      var cont = document.getElementById('faeTechLauncherContainer');
      if(cont){
        cont.classList.toggle('collapsed', !L.isOpen);
        var txt = cont.querySelector('.sh-launcher-toggle-text');
        var arr = cont.querySelector('.sh-launcher-toggle-arrow');
        if(txt) txt.textContent = L.isOpen ? 'Свернуть' : 'Развернуть';
        if(arr) arr.textContent = L.isOpen ? '▲' : '▼';
      }
    };
    tHead.addEventListener('click', toggleFn);
  }

  var getSelTech = function(){
    return techs.find(function(x){ return x.id === L.techId; }) || techs[0] || null;
  };

  var updateModUI = function(){
    var targetNames = { conc: '🔮 Концентрация / Спасбросок', atk: '🎯 Попадание / Проверка', dmg: '💥 Урон / Исцеление' };
    var nameEl = document.getElementById('faeTechModTargetName');
    if(nameEl) nameEl.textContent = targetNames[L.selectedTarget] || '🎯 Попадание / Проверка';
    var inp = document.getElementById('faeTechActiveModInput');
    if(inp) inp.value = (L.mods && L.mods[L.selectedTarget]) || 0;
  };

  var wireDiceClicks = function(){
    var scr = document.getElementById('faeTechLauncherScreen');
    if(!scr) return;
    var els = scr.querySelectorAll('[data-select-fae-tech-roll]');
    els.forEach(function(el){
      el.addEventListener('click', function(){
        var target = el.getAttribute('data-select-fae-tech-roll');
        if(!target) return;
        L.selectedTarget = target;
        els.forEach(function(s){ s.classList.remove('selected'); });
        el.classList.add('selected');
        updateModUI();
      });
    });
  };
  wireDiceClicks();

  var setTargetMod = function(newVal){
    var target = L.selectedTarget || 'atk';
    L.mods[target] = newVal;
    updateModUI();
    var t = getSelTech();
    if(target === 'conc'){
      var subC = document.getElementById('faeScrSub_techConc');
      if(subC) subC.textContent = '1d20' + (formatFaeLauncherMod(newVal) ? ' ' + formatFaeLauncherMod(newVal) : '');
    } else if(target === 'atk'){
      var subA = document.getElementById('faeScrSub_techAtk');
      if(subA) subA.textContent = '1d20' + (formatFaeLauncherMod(newVal) ? ' ' + formatFaeLauncherMod(newVal) : '');
    } else if(target === 'dmg' && t){
      var pDmg = parseFaeDiceFormula(t.checkOrSave || t.desc || '');
      if(pDmg){
        var subD = document.getElementById('faeScrSub_techDmg');
        if(subD) subD.textContent = pDmg.n + 'd' + pDmg.sides + (formatFaeLauncherMod(newVal) ? ' ' + formatFaeLauncherMod(newVal) : '');
      }
    }
    if(L.lastResult && t){
      L.lastResult = buildFaeTechComboText(t, !!L.isConc, L.rolledValues, L.mods);
      var rTxt = document.getElementById('faeTechLauncherResultText');
      if(rTxt) rTxt.textContent = L.lastResult;
    }
  };

  document.querySelectorAll('[data-fae-tech-mod-delta]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var delta = parseInt(btn.getAttribute('data-fae-tech-mod-delta'), 10) || 0;
      var cur = parseInt(L.mods[L.selectedTarget], 10) || 0;
      setTargetMod(cur + delta);
    });
  });

  var resetBtn = document.getElementById('faeTechModResetBtn');
  if(resetBtn) resetBtn.addEventListener('click', function(){ setTargetMod(0); });

  var modInp = document.getElementById('faeTechActiveModInput');
  if(modInp){
    modInp.addEventListener('input', function(){
      var v = parseInt(this.value, 10);
      if(isNaN(v)) v = 0;
      setTargetMod(v);
    });
  }

  var selEl = document.getElementById('faeTechLauncherSelect');
  if(selEl){
    selEl.addEventListener('change', function(){
      L.techId = this.value;
      var t = getSelTech();
      if(t){
        var pDmg = parseFaeDiceFormula(t.checkOrSave || t.desc || '');
        L.mods.dmg = pDmg ? (pDmg.mod || 0) : 0;
        L.mods.atk = parseFaeSignedMod(t.checkOrSave);
      }
      L.rolledValues = {};
      L.lastResult = '';
      L.lastResultCopied = false;
      render();
    });
  }

  var concCb = document.getElementById('faeTechLauncherConc');
  if(concCb){
    concCb.addEventListener('change', function(){
      L.isConc = !!this.checked;
      if(!L.isConc && L.selectedTarget === 'conc') L.selectedTarget = 'atk';
      render();
    });
  }

  var finishTechLaunch = function(t, mode, autoCopy){
    var catStr = t.category || 'Классовые умения';
    var actStr = t.actionCost || '1 действие';
    var cdStr = t.cooldown ? (' | Перезарядка: ' + t.cooldown) : '';
    var header = '*[Способность: ' + (t.name || 'Без названия') + ' | Категория: ' + catStr + ' | Действие: ' + actStr + cdStr + ']*';
    var lines = [];
    var mods = L.mods || { conc: 0, atk: 0, dmg: 0 };
    var pDmg = parseFaeDiceFormula(t.checkOrSave || t.desc || '');

    if(mode === 'claim'){
      lines.push(header);
      if(t.checkOrSave) lines.push('*[Параметр / СЛ: ' + t.checkOrSave + ']*');
    } else if(mode === 'atk'){
      var atkVal = 1 + Math.floor(Math.random() * 20);
      L.rolledValues.atk = atkVal;
      var atDie = document.getElementById('faeScrDieTechAtk');
      if(atDie){ var vEl = atDie.querySelector('.val'); if(vEl) vEl.textContent = atkVal; }
      var aMod = parseInt(mods.atk, 10) || 0;
      var aModStr = aMod > 0 ? ' + ' + aMod : (aMod < 0 ? ' − ' + Math.abs(aMod) : '');
      lines.push(header);
      lines.push('*[Результат броска Попадание / Проверка 1d20: ' + atkVal + ' ]*' + aModStr);
    } else if(mode === 'conc'){
      var cVal = 1 + Math.floor(Math.random() * 20);
      L.rolledValues.conc = cVal;
      var cDie = document.getElementById('faeScrDieTechConc');
      if(cDie){ var vEl = cDie.querySelector('.val'); if(vEl) vEl.textContent = cVal; }
      var cMod = parseInt(mods.conc, 10) || 0;
      var cModStr = cMod > 0 ? ' + ' + cMod : (cMod < 0 ? ' − ' + Math.abs(cMod) : '');
      lines.push(header);
      lines.push('*[Результат броска Концентрация / Спасбросок 1d20: ' + cVal + ' ]*' + cModStr);
    } else if(mode === 'dmg' && pDmg){
      var rolls = [];
      for(var i = 0; i < pDmg.n; i++){
        var r = 1 + Math.floor(Math.random() * pDmg.sides);
        rolls.push(r);
        var dmDie = document.getElementById('faeScrDieTechDmg_' + i);
        if(dmDie){ var vEl = dmDie.querySelector('.val'); if(vEl) vEl.textContent = r; }
      }
      L.rolledValues.dmgRolls = rolls;
      L.rolledValues.dmgSides = pDmg.sides;
      var dMod = parseInt(mods.dmg, 10) || 0;
      var dModStr = dMod > 0 ? ' + ' + dMod : (dMod < 0 ? ' − ' + Math.abs(dMod) : '');
      lines.push(header);
      lines.push('*[Результат броска Эффект / Урон ' + pDmg.n + 'd' + pDmg.sides + ': ' + rolls.join(' | ') + ' ]*' + dModStr);
    } else {
      if(L.isConc){
        var cValAll = 1 + Math.floor(Math.random() * 20);
        L.rolledValues.conc = cValAll;
        var cDieAll = document.getElementById('faeScrDieTechConc');
        if(cDieAll){ var vEl = cDieAll.querySelector('.val'); if(vEl) vEl.textContent = cValAll; }
      }
      var atkValAll = 1 + Math.floor(Math.random() * 20);
      L.rolledValues.atk = atkValAll;
      var atDieAll = document.getElementById('faeScrDieTechAtk');
      if(atDieAll){ var vEl = atDieAll.querySelector('.val'); if(vEl) vEl.textContent = atkValAll; }
      if(pDmg){
        var rollsAll = [];
        for(var j = 0; j < pDmg.n; j++){
          var rAll = 1 + Math.floor(Math.random() * pDmg.sides);
          rollsAll.push(rAll);
          var dmDieAll = document.getElementById('faeScrDieTechDmg_' + j);
          if(dmDieAll){ var vEl = dmDieAll.querySelector('.val'); if(vEl) vEl.textContent = rAll; }
        }
        L.rolledValues.dmgRolls = rollsAll;
        L.rolledValues.dmgSides = pDmg.sides;
      }
      lines = buildFaeTechComboText(t, !!L.isConc, L.rolledValues, mods).split('\n');
    }

    var output = lines.join('\n');
    L.lastResult = output;
    var rBox = document.getElementById('faeTechLauncherResultBox');
    var rTxt = document.getElementById('faeTechLauncherResultText');
    var rBdg = document.getElementById('faeTechLauncherCopyBadge');
    if(rTxt) rTxt.textContent = output;
    if(rBox) rBox.classList.add('has-result');
    if(autoCopy){
      copyText(output);
      L.lastResultCopied = true;
      if(rBdg){
        rBdg.innerHTML = '<span>✓ Скопировано в буфер обмена для AI Studio (' + lines.length + ' стр.)</span>';
        rBdg.style.display = 'inline-flex';
      }
    } else {
      L.lastResultCopied = false;
      if(rBdg){
        rBdg.innerHTML = '<span>🎲 Бросок зафиксирован. Нажмите «📋 Скопировать всё»</span>';
        rBdg.style.display = 'inline-flex';
      }
    }
  };

  var executeTechLaunch = function(mode, autoCopy){
    var t = getSelTech();
    if(!t) return;
    var pDmg = parseFaeDiceFormula(t.checkOrSave || t.desc || '');
    if(mode !== 'claim'){
      var diceToRoll = [];
      if(mode === 'all' || mode === 'atk'){
        var atDie = document.getElementById('faeScrDieTechAtk'); if(atDie) diceToRoll.push(atDie);
      }
      if((mode === 'all' || mode === 'conc') && L.isConc){
        var cDie = document.getElementById('faeScrDieTechConc'); if(cDie) diceToRoll.push(cDie);
      }
      if((mode === 'all' || mode === 'dmg') && pDmg){
        for(var i = 0; i < pDmg.n; i++){
          var dmDie = document.getElementById('faeScrDieTechDmg_' + i); if(dmDie) diceToRoll.push(dmDie);
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
        finishTechLaunch(t, mode, autoCopy);
      }, 350);
    } else {
      finishTechLaunch(t, mode, autoCopy);
    }
  };

  var bCombo = document.getElementById('faeLaunchTechComboBtn');
  if(bCombo) bCombo.addEventListener('click', function(){ executeTechLaunch('all', false); });

  var bCopyAll = document.getElementById('faeCopyAllTechBtn');
  if(bCopyAll){
    bCopyAll.addEventListener('click', function(){
      if(!L.lastResult) executeTechLaunch('all', true);
      else {
        copyText(L.lastResult);
        L.lastResultCopied = true;
        var rBdg = document.getElementById('faeTechLauncherCopyBadge');
        if(rBdg){
          rBdg.innerHTML = '<span>✓ Скопировано в буфер обмена для AI Studio (' + L.lastResult.split('\n').length + ' стр.)</span>';
          rBdg.style.display = 'inline-flex';
        }
      }
    });
  }

  var bAtk = document.getElementById('faeLaunchTechAtkBtn'); if(bAtk) bAtk.addEventListener('click', function(){ executeTechLaunch('atk', true); });
  var bDmg = document.getElementById('faeLaunchTechDmgBtn'); if(bDmg) bDmg.addEventListener('click', function(){ executeTechLaunch('dmg', true); });
  var bConc = document.getElementById('faeLaunchTechConcBtn'); if(bConc) bConc.addEventListener('click', function(){ executeTechLaunch('conc', true); });
  var bClaim = document.getElementById('faeLaunchTechClaimBtn'); if(bClaim) bClaim.addEventListener('click', function(){ executeTechLaunch('claim', true); });

  document.querySelectorAll('[data-fae-tech-to-calc]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var id = btn.getAttribute('data-fae-tech-to-calc');
      if(!id) return;
      L.isOpen = true;
      L.techId = id;
      var t = techs.find(function(x){ return x.id === id; });
      if(t){
        var pDmg = parseFaeDiceFormula(t.checkOrSave || t.desc || '');
        L.mods.dmg = pDmg ? (pDmg.mod || 0) : 0;
        L.mods.atk = parseFaeSignedMod(t.checkOrSave);
      }
      L.rolledValues = {};
      L.lastResult = '';
      if(view.screen !== 'faeTechs') navigate('faeTechs');
      else render();
      setTimeout(function(){
        var cont = document.getElementById('faeTechLauncherContainer');
        if(cont) cont.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    });
  });
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
            '<button type="button" class="rc-btn" data-fae-tech-to-calc="' + escapeAttr(t.id) + '" style="border-color:rgba(200,67,55,0.5);color:#ff9085;">⚔️ В расчёт</button>' +
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
        '<button type="button" class="btn btn-ghost" data-go="classes" style="border-color:rgba(201,164,92,0.5);color:#f3e5ab;">🏛️ Из Классов и Подклассов</button>' +
        '<button type="button" class="btn btn-ghost" data-go="magic" style="border-color:rgba(201,164,92,0.5);color:#f3e5ab;">📖 Из Книги заклинаний</button>' +
        '<button type="button" class="ai-gen-btn" data-go="faeTechGen" style="padding:9px 16px;font-size:13px;">🤖 Создать с ИИ</button>' +
      '</div>' +
    '</div>' +
    '<div class="fae-rule"></div>' +

    renderFaeTechLauncher(c) +

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
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button type="button" class="btn btn-ghost" data-fae-tech-to-calc="' + escapeAttr(t.id) + '" style="border-color:rgba(200,67,55,0.6);color:#ff9085;">⚔️ В боевой расчёт</button>' +
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
  wireFaeTechLauncher();

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

function buildFaeMoveComboText(m, isSup, rolledValues, mods){
  var wpStr = m.weaponOrStyle ? (' | Оружие: ' + m.weaponOrStyle) : '';
  var actStr = m.actionCost ? (' | Действие: ' + m.actionCost) : '';
  var mastStr = m.mastery ? (' | Мастерство: ' + m.mastery) : '';
  var header = '*[Приём: ' + (m.name || 'Без названия') + wpStr + actStr + mastStr + ']*';
  var lines = [header];

  if(rolledValues && rolledValues.atk){
    var aMod = parseInt(mods.atk, 10) || 0;
    var aModStr = aMod > 0 ? ' + ' + aMod : (aMod < 0 ? ' − ' + Math.abs(aMod) : '');
    lines.push('*[Результат броска Попадание 1d20: ' + rolledValues.atk + ' ]*' + aModStr);
  }

  var pDmg = parseFaeDiceFormula(m.damageOrSave || '');
  if(pDmg && rolledValues && rolledValues.dmgRolls && rolledValues.dmgRolls.length){
    var n = rolledValues.dmgRolls.length;
    var dSides = rolledValues.dmgSides || pDmg.sides;
    var dMod = parseInt(mods.dmg, 10) || 0;
    var dModStr = dMod > 0 ? ' + ' + dMod : (dMod < 0 ? ' − ' + Math.abs(dMod) : '');
    lines.push('*[Результат броска Урон ' + n + 'd' + dSides + ': ' + rolledValues.dmgRolls.join(' | ') + ' ]*' + dModStr);
  }

  if(isSup && rolledValues && rolledValues.sup){
    var sMod = parseInt(mods.sup, 10) || 0;
    var sModStr = sMod > 0 ? ' + ' + sMod : (sMod < 0 ? ' − ' + Math.abs(sMod) : '');
    lines.push('*[Результат броска Кость превосходства 1d8: ' + rolledValues.sup + ' ]*' + sModStr);
  }

  if(m.mastery){
    lines.push('*[Эффект Мастерства 2024: ' + m.mastery + ']*');
  }

  return lines.join('\n');
}

function renderFaeMoveLauncherDiceHtml(move, isSup, selTarget, mods, rolledValues){
  if(!move) return '<div class="sh-scr-no-dmg">Выберите приём для расчёта</div>';
  mods = mods || { atk: 0, dmg: 0, sup: 0 };
  rolledValues = rolledValues || {};

  var aModStr = formatFaeLauncherMod(mods.atk);
  var atkDieHtml =
    '<div class="sh-scr-col ' + (selTarget === 'atk' ? 'selected' : '') + '" data-select-fae-move-roll="atk" title="Кликните для выбора кубика и настройки модификатора">' +
      '<div class="sh-scr-label">Попадание</div>' +
      '<div class="sh-scr-die die s20" id="faeScrDieMoveAtk">' +
        (typeof dieShapeSvg === 'function' ? dieShapeSvg(20, 'faemvatk', null) : '') +
        '<div class="val">' + (rolledValues.atk || 20) + '</div>' +
      '</div>' +
      '<div class="sh-scr-sub" id="faeScrSub_moveAtk">1d20' + (aModStr ? ' ' + aModStr : '') + '</div>' +
    '</div>';

  var pDmg = parseFaeDiceFormula(move.damageOrSave || '');
  var dmgBlockHtml = '';
  if(pDmg){
    var n = pDmg.n;
    var dSides = pDmg.sides;
    var dModStr = formatFaeLauncherMod(mods.dmg);
    var dmgDiceList = [];
    var rolls = rolledValues.dmgRolls || [];
    for(var i = 0; i < n; i++){
      var curVal = rolls[i] || dSides;
      dmgDiceList.push(
        '<div class="sh-scr-die die s' + dSides + '" id="faeScrDieMoveDmg_' + i + '">' +
          (typeof dieShapeSvg === 'function' ? dieShapeSvg(dSides, 'faemvdmg' + i, null) : '') +
          '<div class="val">' + curVal + '</div>' +
        '</div>'
      );
    }
    var baseDmgFormula = n + 'd' + dSides + (pDmg.mod ? (pDmg.mod > 0 ? '+' + pDmg.mod : pDmg.mod) : '');
    dmgBlockHtml =
      '<div class="sh-scr-dmg-group ' + (selTarget === 'dmg' ? 'selected' : '') + '" data-select-fae-move-roll="dmg" title="Кликните для выбора кубиков и настройки модификатора">' +
        '<div class="sh-scr-label">Урон (' + baseDmgFormula + ')</div>' +
        '<div class="sh-scr-dmg-dice">' + dmgDiceList.join('') + '</div>' +
        '<div class="sh-scr-sub" id="faeScrSub_moveDmg">' + n + 'd' + dSides + (dModStr ? ' ' + dModStr : '') + '</div>' +
      '</div>';
  } else {
    var stText = move.damageOrSave ? ('Эффект / СЛ: <b>' + escapeHtml(move.damageOrSave) + '</b>') : ('Мастерство: <b>' + escapeHtml(move.mastery || 'Тактический манёвр') + '</b>');
    dmgBlockHtml = '<div class="sh-scr-no-dmg">' + stText + '</div>';
  }

  var supDieHtml = '';
  if(isSup){
    var sModStr = formatFaeLauncherMod(mods.sup);
    supDieHtml =
      '<div class="sh-scr-col ' + (selTarget === 'sup' ? 'selected' : '') + '" data-select-fae-move-roll="sup" title="Кликните для выбора кости превосходства">' +
        '<div class="sh-scr-label" style="color:#fde68a;">Кость манёвра</div>' +
        '<div class="sh-scr-die die s8" id="faeScrDieMoveSup">' +
          (typeof dieShapeSvg === 'function' ? dieShapeSvg(8, 'faemvsup', null) : '') +
          '<div class="val">' + (rolledValues.sup || 8) + '</div>' +
        '</div>' +
        '<div class="sh-scr-sub" id="faeScrSub_moveSup">1d8' + (sModStr ? ' ' + sModStr : '') + '</div>' +
      '</div>';
  }

  return '<div class="sh-screen-dice-tray">' + atkDieHtml + dmgBlockHtml + supDieHtml + '</div>';
}

function renderFaeMoveLauncher(c){
  var moves = (c && Array.isArray(c.moves)) ? c.moves : [];
  if(!moves.length){
    return '<div class="sh-launcher" style="margin-bottom:16px;">' +
      '<div class="sh-launcher-title">🥋 Боевой расчёт приёма <span class="sh-badge-tag">AI Studio</span></div>' +
      '<div class="char-empty" style="margin:10px 0 0;padding:12px;">Приёмы ещё не добавлены. Добавьте первый приём кнопкой выше или из Стоек и Мастерства 2024, чтобы использовать боевой расчёт.</div>' +
    '</div>';
  }

  if(!window._faeMoveLauncher) window._faeMoveLauncher = {};
  var L = window._faeMoveLauncher;
  if(L.isOpen === undefined) L.isOpen = false;
  if(!L.mods) L.mods = { atk: 0, dmg: 0, sup: 0 };
  if(!L.rolledValues) L.rolledValues = {};
  if(!L.selectedTarget) L.selectedTarget = 'atk';

  var selMove = moves.find(function(x){ return x.id === L.moveId; }) || moves[0];
  if(L.moveId !== selMove.id){
    L.moveId = selMove.id;
    L.mods.atk = parseFaeSignedMod(selMove.attackBonus);
    var initDmg = parseFaeDiceFormula(selMove.damageOrSave || '');
    L.mods.dmg = initDmg ? (initDmg.mod || 0) : 0;
    L.isSup = (selMove.category || '').indexOf('Боевого Мастера') !== -1 || (selMove.attackBonus || '').toLowerCase().indexOf('превосходств') !== -1;
  }

  var isSup = !!L.isSup;
  var pDmg = parseFaeDiceFormula(selMove.damageOrSave || '');
  var selTarget = L.selectedTarget;
  if(selTarget === 'dmg' && !pDmg) selTarget = 'atk';
  if(selTarget === 'sup' && !isSup) selTarget = 'atk';
  L.selectedTarget = selTarget;

  var targetNames = { atk: '🎯 Попадание', dmg: '💥 Урон', sup: '🎲 Кость превосходства' };
  var targetTitle = targetNames[selTarget] || '🎯 Попадание';
  var curModVal = L.mods[selTarget] || 0;

  var moveOpts = moves.map(function(m){
    var wp = m.weaponOrStyle ? (' [' + m.weaponOrStyle + ']') : '';
    var dm = m.damageOrSave ? (' (' + m.damageOrSave + ')') : '';
    var ms = m.mastery ? (' · ' + m.mastery) : '';
    return '<option value="' + escapeAttr(m.id) + '" ' + (m.id === selMove.id ? 'selected' : '') + '>' +
      escapeHtml(m.name || 'Без названия') + wp + dm + ms +
    '</option>';
  }).join('');

  var screenHtml = renderFaeMoveLauncherDiceHtml(selMove, isSup, selTarget, L.mods, L.rolledValues);

  var modBarHtml =
    '<div class="sh-mod-bar">' +
      '<div class="sh-mod-target-info">' +
        '<span>Выбран кубик:</span>' +
        '<span class="sh-mod-target-tag" id="faeMoveModTargetName">' + targetTitle + '</span>' +
      '</div>' +
      '<div class="sh-mod-controls">' +
        '<button type="button" class="sh-mod-step" data-fae-move-mod-delta="-5" title="Уменьшить на 5">−5</button>' +
        '<button type="button" class="sh-mod-step" data-fae-move-mod-delta="-1" title="Уменьшить на 1">−</button>' +
        '<input type="number" id="faeMoveActiveModInput" class="sh-active-mod-input" value="' + curModVal + '">' +
        '<button type="button" class="sh-mod-step" data-fae-move-mod-delta="1" title="Увеличить на 1">+</button>' +
        '<button type="button" class="sh-mod-step" data-fae-move-mod-delta="5" title="Увеличить на 5">+5</button>' +
        '<button type="button" class="sh-mod-reset" id="faeMoveModResetBtn" title="Сбросить модификатор в 0">Сброс</button>' +
      '</div>' +
      '<label class="sh-exp-check">' +
        '<input type="checkbox" id="faeMoveLauncherSup"' + (isSup ? ' checked' : '') + '> 🎲 Кость манёвра (1d8)' +
      '</label>' +
    '</div>';

  var actionsHtml =
    '<div class="sh-launcher-actions">' +
      '<button type="button" class="sh-btn-launch" id="faeLaunchMoveComboBtn" title="Бросить все кости приёма и зафиксировать результат">⚔️ Применить приём</button>' +
      '<button type="button" class="sh-btn-copy-all" id="faeCopyAllMoveBtn" title="Скопировать готовый блок в буфер обмена для AI Studio">📋 Скопировать всё</button>' +
      '<button type="button" class="sh-micro-btn" id="faeLaunchMoveAtkBtn" title="Бросить и скопировать только попадание">🎯 Попадание</button>' +
      (pDmg ? '<button type="button" class="sh-micro-btn" id="faeLaunchMoveDmgBtn" title="Бросить и скопировать только урон">💥 Урон</button>' : '') +
      (isSup ? '<button type="button" class="sh-micro-btn" id="faeLaunchMoveSupBtn" title="Бросить и скопировать кость превосходства">🎲 Кость 1d8</button>' : '') +
      '<button type="button" class="sh-micro-btn" id="faeLaunchMoveClaimBtn" title="Скопировать только заголовок заявки">📜 Только заявка</button>' +
    '</div>';

  var hasRes = !!(L.lastResult);
  var resultBoxHtml =
    '<div class="sh-launcher-result ' + (hasRes ? 'has-result' : '') + '" id="faeMoveLauncherResultBox">' +
      '<div class="sh-launcher-result-text" id="faeMoveLauncherResultText">' + escapeHtml(L.lastResult || '') + '</div>' +
      '<div class="sh-copy-badge" id="faeMoveLauncherCopyBadge" style="display:' + (hasRes ? 'inline-flex' : 'none') + ';">' +
        '<span>' + (L.lastResultCopied ? '✓ Скопировано в буфер обмена для AI Studio' : '🎲 Бросок зафиксирован. Нажмите «📋 Скопировать всё»') + '</span>' +
      '</div>' +
    '</div>';

  var isOpen = !!L.isOpen;
  var toggleHeadHtml =
    '<div class="sh-launcher-toggle-head" id="faeMoveLauncherToggle" role="button" tabindex="0" title="Нажмите, чтобы развернуть или свернуть боевой расчёт приёма">' +
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
    '<div class="sh-launcher-body" id="faeMoveLauncherBody">' +
      '<div class="sh-launcher-head">' +
        '<div class="sh-launcher-sel-wrap">' +
          '<div class="sh-launcher-sel-label">Приём для броска:</div>' +
          '<select class="sh-launcher-sel" id="faeMoveLauncherSelect">' + moveOpts + '</select>' +
        '</div>' +
      '</div>' +
      '<div class="sh-launcher-screen" id="faeMoveLauncherScreen">' + screenHtml + '</div>' +
      modBarHtml +
      actionsHtml +
      resultBoxHtml +
    '</div>';

  return '<div class="sh-launcher ' + (isOpen ? '' : 'collapsed') + '" id="faeMoveLauncherContainer">' +
    toggleHeadHtml +
    bodyHtml +
  '</div>';
}

function wireFaeMoveLauncher(){
  var c = getActiveFaerunCharacter();
  var moves = (c && Array.isArray(c.moves)) ? c.moves : [];
  if(!window._faeMoveLauncher) window._faeMoveLauncher = { isOpen: false, mods: { atk: 0, dmg: 0, sup: 0 }, rolledValues: {}, selectedTarget: 'atk' };
  var L = window._faeMoveLauncher;

  var tHead = document.getElementById('faeMoveLauncherToggle');
  if(tHead){
    tHead.addEventListener('click', function(){
      L.isOpen = !L.isOpen;
      var cont = document.getElementById('faeMoveLauncherContainer');
      if(cont){
        cont.classList.toggle('collapsed', !L.isOpen);
        var txt = cont.querySelector('.sh-launcher-toggle-text');
        var arr = cont.querySelector('.sh-launcher-toggle-arrow');
        if(txt) txt.textContent = L.isOpen ? 'Свернуть' : 'Развернуть';
        if(arr) arr.textContent = L.isOpen ? '▲' : '▼';
      }
    });
  }

  var getSelMove = function(){
    return moves.find(function(x){ return x.id === L.moveId; }) || moves[0] || null;
  };

  var updateModUI = function(){
    var targetNames = { atk: '🎯 Попадание', dmg: '💥 Урон', sup: '🎲 Кость превосходства' };
    var nameEl = document.getElementById('faeMoveModTargetName');
    if(nameEl) nameEl.textContent = targetNames[L.selectedTarget] || '🎯 Попадание';
    var inp = document.getElementById('faeMoveActiveModInput');
    if(inp) inp.value = (L.mods && L.mods[L.selectedTarget]) || 0;
  };

  var wireDiceClicks = function(){
    var scr = document.getElementById('faeMoveLauncherScreen');
    if(!scr) return;
    var els = scr.querySelectorAll('[data-select-fae-move-roll]');
    els.forEach(function(el){
      el.addEventListener('click', function(){
        var target = el.getAttribute('data-select-fae-move-roll');
        if(!target) return;
        L.selectedTarget = target;
        els.forEach(function(s){ s.classList.remove('selected'); });
        el.classList.add('selected');
        updateModUI();
      });
    });
  };
  wireDiceClicks();

  var setTargetMod = function(newVal){
    var target = L.selectedTarget || 'atk';
    L.mods[target] = newVal;
    updateModUI();
    var m = getSelMove();
    if(target === 'atk'){
      var subA = document.getElementById('faeScrSub_moveAtk');
      if(subA) subA.textContent = '1d20' + (formatFaeLauncherMod(newVal) ? ' ' + formatFaeLauncherMod(newVal) : '');
    } else if(target === 'sup'){
      var subS = document.getElementById('faeScrSub_moveSup');
      if(subS) subS.textContent = '1d8' + (formatFaeLauncherMod(newVal) ? ' ' + formatFaeLauncherMod(newVal) : '');
    } else if(target === 'dmg' && m){
      var pDmg = parseFaeDiceFormula(m.damageOrSave || '');
      if(pDmg){
        var subD = document.getElementById('faeScrSub_moveDmg');
        if(subD) subD.textContent = pDmg.n + 'd' + pDmg.sides + (formatFaeLauncherMod(newVal) ? ' ' + formatFaeLauncherMod(newVal) : '');
      }
    }
    if(L.lastResult && m){
      L.lastResult = buildFaeMoveComboText(m, !!L.isSup, L.rolledValues, L.mods);
      var rTxt = document.getElementById('faeMoveLauncherResultText');
      if(rTxt) rTxt.textContent = L.lastResult;
    }
  };

  document.querySelectorAll('[data-fae-move-mod-delta]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var delta = parseInt(btn.getAttribute('data-fae-move-mod-delta'), 10) || 0;
      var cur = parseInt(L.mods[L.selectedTarget], 10) || 0;
      setTargetMod(cur + delta);
    });
  });

  var resetBtn = document.getElementById('faeMoveModResetBtn');
  if(resetBtn) resetBtn.addEventListener('click', function(){ setTargetMod(0); });

  var modInp = document.getElementById('faeMoveActiveModInput');
  if(modInp){
    modInp.addEventListener('input', function(){
      var v = parseInt(this.value, 10);
      if(isNaN(v)) v = 0;
      setTargetMod(v);
    });
  }

  var selEl = document.getElementById('faeMoveLauncherSelect');
  if(selEl){
    selEl.addEventListener('change', function(){
      L.moveId = this.value;
      var m = getSelMove();
      if(m){
        L.mods.atk = parseFaeSignedMod(m.attackBonus);
        var pDmg = parseFaeDiceFormula(m.damageOrSave || '');
        L.mods.dmg = pDmg ? (pDmg.mod || 0) : 0;
        L.isSup = (m.category || '').indexOf('Боевого Мастера') !== -1 || (m.attackBonus || '').toLowerCase().indexOf('превосходств') !== -1;
      }
      L.rolledValues = {};
      L.lastResult = '';
      L.lastResultCopied = false;
      render();
    });
  }

  var supCb = document.getElementById('faeMoveLauncherSup');
  if(supCb){
    supCb.addEventListener('change', function(){
      L.isSup = !!this.checked;
      if(!L.isSup && L.selectedTarget === 'sup') L.selectedTarget = 'atk';
      render();
    });
  }

  var finishMoveLaunch = function(m, mode, autoCopy){
    var wpStr = m.weaponOrStyle ? (' | Оружие: ' + m.weaponOrStyle) : '';
    var actStr = m.actionCost ? (' | Действие: ' + m.actionCost) : '';
    var mastStr = m.mastery ? (' | Мастерство: ' + m.mastery) : '';
    var header = '*[Приём: ' + (m.name || 'Без названия') + wpStr + actStr + mastStr + ']*';
    var lines = [];
    var mods = L.mods || { atk: 0, dmg: 0, sup: 0 };
    var pDmg = parseFaeDiceFormula(m.damageOrSave || '');

    if(mode === 'claim'){
      lines.push(header);
      if(m.mastery) lines.push('*[Эффект Мастерства 2024: ' + m.mastery + ']*');
    } else if(mode === 'atk'){
      var atkVal = 1 + Math.floor(Math.random() * 20);
      L.rolledValues.atk = atkVal;
      var atDie = document.getElementById('faeScrDieMoveAtk');
      if(atDie){ var vEl = atDie.querySelector('.val'); if(vEl) vEl.textContent = atkVal; }
      var aMod = parseInt(mods.atk, 10) || 0;
      var aModStr = aMod > 0 ? ' + ' + aMod : (aMod < 0 ? ' − ' + Math.abs(aMod) : '');
      lines.push(header);
      lines.push('*[Результат броска Попадание 1d20: ' + atkVal + ' ]*' + aModStr);
    } else if(mode === 'sup'){
      var supVal = 1 + Math.floor(Math.random() * 8);
      L.rolledValues.sup = supVal;
      var sDie = document.getElementById('faeScrDieMoveSup');
      if(sDie){ var vEl = sDie.querySelector('.val'); if(vEl) vEl.textContent = supVal; }
      var sMod = parseInt(mods.sup, 10) || 0;
      var sModStr = sMod > 0 ? ' + ' + sMod : (sMod < 0 ? ' − ' + Math.abs(sMod) : '');
      lines.push(header);
      lines.push('*[Результат броска Кость превосходства 1d8: ' + supVal + ' ]*' + sModStr);
    } else if(mode === 'dmg' && pDmg){
      var rolls = [];
      for(var i = 0; i < pDmg.n; i++){
        var r = 1 + Math.floor(Math.random() * pDmg.sides);
        rolls.push(r);
        var dmDie = document.getElementById('faeScrDieMoveDmg_' + i);
        if(dmDie){ var vEl = dmDie.querySelector('.val'); if(vEl) vEl.textContent = r; }
      }
      L.rolledValues.dmgRolls = rolls;
      L.rolledValues.dmgSides = pDmg.sides;
      var dMod = parseInt(mods.dmg, 10) || 0;
      var dModStr = dMod > 0 ? ' + ' + dMod : (dMod < 0 ? ' − ' + Math.abs(dMod) : '');
      lines.push(header);
      lines.push('*[Результат броска Урон ' + pDmg.n + 'd' + pDmg.sides + ': ' + rolls.join(' | ') + ' ]*' + dModStr);
    } else {
      var atkValAll = 1 + Math.floor(Math.random() * 20);
      L.rolledValues.atk = atkValAll;
      var atDieAll = document.getElementById('faeScrDieMoveAtk');
      if(atDieAll){ var vEl = atDieAll.querySelector('.val'); if(vEl) vEl.textContent = atkValAll; }
      if(pDmg){
        var rollsAll = [];
        for(var j = 0; j < pDmg.n; j++){
          var rAll = 1 + Math.floor(Math.random() * pDmg.sides);
          rollsAll.push(rAll);
          var dmDieAll = document.getElementById('faeScrDieMoveDmg_' + j);
          if(dmDieAll){ var vEl = dmDieAll.querySelector('.val'); if(vEl) vEl.textContent = rAll; }
        }
        L.rolledValues.dmgRolls = rollsAll;
        L.rolledValues.dmgSides = pDmg.sides;
      }
      if(L.isSup){
        var supValAll = 1 + Math.floor(Math.random() * 8);
        L.rolledValues.sup = supValAll;
        var sDieAll = document.getElementById('faeScrDieMoveSup');
        if(sDieAll){ var vEl = sDieAll.querySelector('.val'); if(vEl) vEl.textContent = supValAll; }
      }
      lines = buildFaeMoveComboText(m, !!L.isSup, L.rolledValues, mods).split('\n');
    }

    var output = lines.join('\n');
    L.lastResult = output;
    var rBox = document.getElementById('faeMoveLauncherResultBox');
    var rTxt = document.getElementById('faeMoveLauncherResultText');
    var rBdg = document.getElementById('faeMoveLauncherCopyBadge');
    if(rTxt) rTxt.textContent = output;
    if(rBox) rBox.classList.add('has-result');
    if(autoCopy){
      copyText(output);
      L.lastResultCopied = true;
      if(rBdg){
        rBdg.innerHTML = '<span>✓ Скопировано в буфер обмена для AI Studio (' + lines.length + ' стр.)</span>';
        rBdg.style.display = 'inline-flex';
      }
    } else {
      L.lastResultCopied = false;
      if(rBdg){
        rBdg.innerHTML = '<span>🎲 Бросок зафиксирован. Нажмите «📋 Скопировать всё»</span>';
        rBdg.style.display = 'inline-flex';
      }
    }
  };

  var executeMoveLaunch = function(mode, autoCopy){
    var m = getSelMove();
    if(!m) return;
    var pDmg = parseFaeDiceFormula(m.damageOrSave || '');
    if(mode !== 'claim'){
      var diceToRoll = [];
      if(mode === 'all' || mode === 'atk'){
        var atDie = document.getElementById('faeScrDieMoveAtk'); if(atDie) diceToRoll.push(atDie);
      }
      if((mode === 'all' || mode === 'dmg') && pDmg){
        for(var i = 0; i < pDmg.n; i++){
          var dmDie = document.getElementById('faeScrDieMoveDmg_' + i); if(dmDie) diceToRoll.push(dmDie);
        }
      }
      if((mode === 'all' || mode === 'sup') && L.isSup){
        var sDie = document.getElementById('faeScrDieMoveSup'); if(sDie) diceToRoll.push(sDie);
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

  var bCombo = document.getElementById('faeLaunchMoveComboBtn');
  if(bCombo) bCombo.addEventListener('click', function(){ executeMoveLaunch('all', false); });

  var bCopyAll = document.getElementById('faeCopyAllMoveBtn');
  if(bCopyAll){
    bCopyAll.addEventListener('click', function(){
      if(!L.lastResult) executeMoveLaunch('all', true);
      else {
        copyText(L.lastResult);
        L.lastResultCopied = true;
        var rBdg = document.getElementById('faeMoveLauncherCopyBadge');
        if(rBdg){
          rBdg.innerHTML = '<span>✓ Скопировано в буфер обмена для AI Studio (' + L.lastResult.split('\n').length + ' стр.)</span>';
          rBdg.style.display = 'inline-flex';
        }
      }
    });
  }

  var bAtk = document.getElementById('faeLaunchMoveAtkBtn'); if(bAtk) bAtk.addEventListener('click', function(){ executeMoveLaunch('atk', true); });
  var bDmg = document.getElementById('faeLaunchMoveDmgBtn'); if(bDmg) bDmg.addEventListener('click', function(){ executeMoveLaunch('dmg', true); });
  var bSup = document.getElementById('faeLaunchMoveSupBtn'); if(bSup) bSup.addEventListener('click', function(){ executeMoveLaunch('sup', true); });
  var bClaim = document.getElementById('faeLaunchMoveClaimBtn'); if(bClaim) bClaim.addEventListener('click', function(){ executeMoveLaunch('claim', true); });

  document.querySelectorAll('[data-fae-move-to-calc]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var id = btn.getAttribute('data-fae-move-to-calc');
      if(!id) return;
      L.isOpen = true;
      L.moveId = id;
      var m = moves.find(function(x){ return x.id === id; });
      if(m){
        L.mods.atk = parseFaeSignedMod(m.attackBonus);
        var pDmg = parseFaeDiceFormula(m.damageOrSave || '');
        L.mods.dmg = pDmg ? (pDmg.mod || 0) : 0;
        L.isSup = (m.category || '').indexOf('Боевого Мастера') !== -1 || (m.attackBonus || '').toLowerCase().indexOf('превосходств') !== -1;
      }
      L.rolledValues = {};
      L.lastResult = '';
      if(view.screen !== 'faeMoves') navigate('faeMoves');
      else render();
      setTimeout(function(){
        var cont = document.getElementById('faeMoveLauncherContainer');
        if(cont) cont.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    });
  });
}

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
            '<button type="button" class="rc-btn" data-fae-move-to-calc="' + escapeAttr(m.id) + '" style="border-color:rgba(200,67,55,0.5);color:#ff9085;">⚔️ В расчёт</button>' +
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
        '<button type="button" class="btn btn-ghost" data-go="classes" style="border-color:rgba(201,164,92,0.5);color:#f3e5ab;">🏛️ Из Классов и Подклассов</button>' +
        '<button type="button" class="btn btn-ghost" data-go="weapons" style="border-color:rgba(56,189,248,0.45);color:#bae6fd;">🗡️ Из Стоек и Оружия</button>' +
        '<button type="button" class="btn btn-ghost" data-go="rules2024" style="border-color:rgba(201,164,92,0.45);color:#fde68a;">📜 Из Мастерства 2024</button>' +
        '<button type="button" class="ai-gen-btn" data-go="faeMoveGen" style="padding:9px 16px;font-size:13px;">🤖 Создать приём с ИИ</button>' +
      '</div>' +
    '</div>' +
    '<div class="fae-rule"></div>' +

    renderFaeMoveLauncher(c) +

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
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button type="button" class="btn btn-ghost" data-fae-move-to-calc="' + escapeAttr(m.id) + '" style="border-color:rgba(200,67,55,0.6);color:#ff9085;">⚔️ В боевой расчёт</button>' +
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
  wireFaeMoveLauncher();

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

/* ============================================================
   НАВЫКИ И ЗНАНИЯ ГЕРОЯ (faeSkills) ФАЭРУНА
   (по образцу экрана Навыков раздела Шиноби shSkills / shSkillView / shSkillEdit / shSkillGen + 18 навыков D&D 5e / 2024)
   ============================================================ */

var FAE_SKILL_KINDS = [
  'Ремесло',
  'Инструменты',
  'Знание',
  'Языки',
  'Выживание',
  'Быт',
  'Искусство',
  'Общение',
  'Другое'
];

var FAE_SKILL_KIND_ICONS = {
  'Ремесло': '🔨',
  'Инструменты': '🧰',
  'Знание': '📜',
  'Языки': '🗣️',
  'Выживание': '🏕️',
  'Быт': '🍲',
  'Искусство': '🪕',
  'Общение': '👑',
  'Другое': '✨'
};

var FAE_SKILL_LEVELS = [
  'Начатки',
  'Ученик',
  'Подмастерье',
  'Умелец',
  'Мастер'
];

var FAE_SKILL_TEMPLATES = [
  {
    name: 'Воровские инструменты и тайники',
    kind: 'Инструменты',
    level: 'Подмастерье',
    abil: 'Ловкость / Интеллект',
    mod: '+5',
    src: 'Уличная школа гильдии воров Врат Балдура',
    gives: 'Взлом замков (СЛ 15), обезвреживание механических ловушек, обнаружение двойного дна в сундуках и тайных знаков Воровского жаргона без броска.',
    desc: 'Набор отмычек, зеркальце на рукояти, узкие щипцы и флакон машинного масла для бесшумных петель.'
  },
  {
    name: 'Кузнечное и оружейное дело',
    kind: 'Ремесло',
    level: 'Подмастерье',
    abil: 'Сила / Телосложение',
    mod: '+4',
    src: 'Кузница дварфийского мастера в Невервинтере',
    gives: 'Починка повреждённых доспехов и клинков на коротком отдыхе, оценка качества стали и клейма мастера на глаз, ковка оружия и подков.',
    desc: 'Требуются Инструменты кузнеца и доступ к горну или походной наковальне.'
  },
  {
    name: 'Травничество и полевая алхимия',
    kind: 'Ремесло',
    level: 'Умелец',
    abil: 'Интеллект / Мудрость',
    mod: '+5',
    src: 'Обучение у друидов Изумрудного Анклава',
    gives: 'Безошибочное распознавание целебных и ядовитых трав Фаэруна без броска, варка Зелий лечения (2d4+2) и Противоядий за 1 рабочий день.',
    desc: 'Набор травника: секатор, ступка с пестиком, стеклянные фиалы и справочник флоры Побережья Мечей.'
  },
  {
    name: 'География и лор Побережья Мечей',
    kind: 'Знание',
    level: 'Подмастерье',
    abil: 'Интеллект',
    mod: '+4',
    src: 'Странствия с караванами и изучение хроник Кэндлкипа',
    gives: 'Знание основных торговых трактов, гербов благородных домов, законов городов Альянса Лордов и безопасных постоялых дворов без броска.',
    desc: 'Помогает избегать пошлинных засад и находить нужных информаторов в крупных портах.'
  },
  {
    name: 'Эльфийский и Дварфийский языки (Чтение рун)',
    kind: 'Языки',
    level: 'Умелец',
    abil: 'Интеллект',
    mod: '+4',
    src: 'Древние манускрипты и общение со старейшинами кланов',
    gives: 'Свободная речь, чтение эльфийской вязи (Эспруар) и дварфийских клинописных рун (Детhek), понимание древних эпитафий на гробницах.',
    desc: 'Позволяет читать предупреждения на вратах заброшенных твердынь без магического перевода.'
  },
  {
    name: 'Следопытство и походный лагерь',
    kind: 'Выживание',
    level: 'Подмастерье',
    abil: 'Мудрость',
    mod: '+5',
    src: 'Годы жизни в диких землях Долины Ледяного Ветра',
    gives: 'Чтение следов зверя и гуманоидов, обустройство защищённого от ветра и хищников ночлега, ориентирование по звёздам и мху без броска.',
    desc: 'Отряд в походе не блуждает в тумане и находит пресную воду даже в засушливых пустошах.'
  }
];

function faeSkillById(c, id){
  if(!c || !Array.isArray(c.customSkills)) return null;
  for(var i = 0; i < c.customSkills.length; i++){
    if(c.customSkills[i].id === id) return c.customSkills[i];
  }
  return null;
}

/* --- 3. РАСЧЁТ ПРОВЕРКИ НАВЫКА И ЗНАНИЯ (faeSkills) --- */
function getFaeLauncherSkillItems(c){
  var list = [];
  var arr = (c && Array.isArray(c.customSkills)) ? c.customSkills : [];
  arr.forEach(function(s){
    list.push({
      ref: 'custom:' + s.id,
      group: 'custom',
      name: s.name || 'Навык',
      kind: s.kind || 'Ремесло',
      level: s.level || 'Начатки',
      abil: s.abil || '',
      modStr: s.mod || '',
      modNum: parseFaeSignedMod(s.mod || ''),
      gives: s.gives || s.desc || ''
    });
  });

  var pb = profBonus(c ? c.level : 1);
  SKILL_DEFS.forEach(function(def){
    var state = Number(c && c.skillProf ? c.skillProf[def.key] : 0) || 0;
    var mod = abilityMod(c && c.abilities ? c.abilities[def.ability] : 10) + state * pb;
    var abRu = ABILITY_RU[def.ability] || '';
    var stLvl = state === 2 ? 'Экспертиза' : (state === 1 ? 'Владение' : 'Начатки');
    list.push({
      ref: 'dnd18:' + def.key,
      group: 'dnd18',
      name: def.ru,
      kind: 'Базовый навык D&D',
      level: stLvl,
      abil: abRu,
      modStr: fmtMod(mod),
      modNum: mod,
      gives: 'Пассивное значение: ' + (10 + mod)
    });
  });
  return list;
}

function buildFaeSkillComboText(sk, isGuidance, rolledValues, mods){
  var abStr = sk.abil ? (' | Хар-ка: ' + sk.abil) : '';
  var header = '*[Навык: ' + (sk.name || 'Навык') + ' | Тип: ' + (sk.kind || 'Ремесло') + ' | Ступень: ' + (sk.level || 'Начатки') + abStr + ']*';
  var lines = [header];

  if(rolledValues && rolledValues.chk){
    var cMod = parseInt(mods.chk, 10) || 0;
    var cModStr = cMod > 0 ? ' + ' + cMod : (cMod < 0 ? ' − ' + Math.abs(cMod) : '');
    lines.push('*[Результат броска Проверка навыка 1d20: ' + rolledValues.chk + ' ]*' + cModStr);
  }

  if(isGuidance && rolledValues && rolledValues.gui){
    var gMod = parseInt(mods.gui, 10) || 0;
    var gModStr = gMod > 0 ? ' + ' + gMod : (gMod < 0 ? ' − ' + Math.abs(gMod) : '');
    lines.push('*[Результат броска Бонус Указания / Мастерства 1d4: ' + rolledValues.gui + ' ]*' + gModStr);
  }

  if(sk.gives){
    lines.push('*[Что даёт: ' + sk.gives + ']*');
  }

  return lines.join('\n');
}

function renderFaeSkillLauncherDiceHtml(sk, isGuidance, selTarget, mods, rolledValues){
  if(!sk) return '<div class="sh-scr-no-dmg">Выберите навык для расчёта</div>';
  mods = mods || { chk: 0, gui: 0 };
  rolledValues = rolledValues || {};

  var cModStr = formatFaeLauncherMod(mods.chk);
  var chkDieHtml =
    '<div class="sh-scr-col ' + (selTarget === 'chk' ? 'selected' : '') + '" data-select-fae-skill-roll="chk" title="Кликните для выбора кубика проверки и настройки модификатора">' +
      '<div class="sh-scr-label">Проверка (' + escapeHtml(sk.abil || 'd20') + ')</div>' +
      '<div class="sh-scr-die die s20" id="faeScrDieSkillChk">' +
        (typeof dieShapeSvg === 'function' ? dieShapeSvg(20, 'faeskchk', null) : '') +
        '<div class="val">' + (rolledValues.chk || 20) + '</div>' +
      '</div>' +
      '<div class="sh-scr-sub" id="faeScrSub_skillChk">1d20' + (cModStr ? ' ' + cModStr : '') + '</div>' +
    '</div>';

  var guiDieHtml = '';
  if(isGuidance){
    var gModStr = formatFaeLauncherMod(mods.gui);
    guiDieHtml =
      '<div class="sh-scr-col ' + (selTarget === 'gui' ? 'selected' : '') + '" data-select-fae-skill-roll="gui" title="Кликните для выбора бонусной кости Указания / Помощи">' +
        '<div class="sh-scr-label" style="color:#fde68a;">Указание / Бонус</div>' +
        '<div class="sh-scr-die die s4" id="faeScrDieSkillGui">' +
          (typeof dieShapeSvg === 'function' ? dieShapeSvg(4, 'faeskgui', null) : '') +
          '<div class="val">' + (rolledValues.gui || 4) + '</div>' +
        '</div>' +
        '<div class="sh-scr-sub" id="faeScrSub_skillGui">1d4' + (gModStr ? ' ' + gModStr : '') + '</div>' +
      '</div>';
  }

  var infoHtml =
    '<div class="sh-scr-no-dmg" style="max-width:340px;text-align:left;font-style:normal;">' +
      '<div style="margin-bottom:4px;">Ступень: <b>' + escapeHtml(sk.level || 'Начатки') + '</b>' + (sk.modStr ? (' · Мод: <b>' + escapeHtml(sk.modStr) + '</b>') : ' · <b>без обязательного броска</b>') + '</div>' +
      (sk.gives ? '<div style="font-size:12px;color:var(--ink-dim);line-height:1.4;">' + escapeHtml(sk.gives.length > 120 ? (sk.gives.slice(0, 120) + '…') : sk.gives) + '</div>' : '') +
    '</div>';

  return '<div class="sh-screen-dice-tray">' + chkDieHtml + guiDieHtml + infoHtml + '</div>';
}

function renderFaeSkillLauncher(c){
  var allItems = getFaeLauncherSkillItems(c);
  if(!window._faeSkillLauncher) window._faeSkillLauncher = {};
  var L = window._faeSkillLauncher;
  if(L.isOpen === undefined) L.isOpen = false;
  if(!L.mods) L.mods = { chk: 0, gui: 0 };
  if(!L.rolledValues) L.rolledValues = {};
  if(!L.selectedTarget) L.selectedTarget = 'chk';

  var selSk = allItems.find(function(x){ return x.ref === L.skillRef; }) || allItems[0];
  if(selSk && L.skillRef !== selSk.ref){
    L.skillRef = selSk.ref;
    L.mods.chk = selSk.modNum || 0;
  }

  var isGuidance = !!L.isGuidance;
  var selTarget = L.selectedTarget;
  if(selTarget === 'gui' && !isGuidance) selTarget = 'chk';
  L.selectedTarget = selTarget;

  var targetNames = { chk: '🎯 Проверка навыка (1d20)', gui: '✨ Бонус Указания (1d4)' };
  var targetTitle = targetNames[selTarget] || '🎯 Проверка навыка (1d20)';
  var curModVal = L.mods[selTarget] || 0;

  var customGroup = allItems.filter(function(x){ return x.group === 'custom'; });
  var dnd18Group = allItems.filter(function(x){ return x.group === 'dnd18'; });

  var selectOptsHtml = '';
  if(customGroup.length){
    selectOptsHtml += '<optgroup label="🛠️ Особые навыки, ремёсла и знания героя">' +
      customGroup.map(function(x){
        var mStr = x.modStr ? (' (' + x.modStr + ')') : ' (без броска)';
        return '<option value="' + escapeAttr(x.ref) + '" ' + (selSk && x.ref === selSk.ref ? 'selected' : '') + '>' +
          escapeHtml(x.level) + ' · ' + escapeHtml(x.name) + mStr +
        '</option>';
      }).join('') +
    '</optgroup>';
  }
  selectOptsHtml += '<optgroup label="🎯 18 базовых навыков D&D 5e / 2024">' +
    dnd18Group.map(function(x){
      return '<option value="' + escapeAttr(x.ref) + '" ' + (selSk && x.ref === selSk.ref ? 'selected' : '') + '>' +
        escapeHtml(x.name) + ' [' + escapeHtml(x.abil) + ' ' + escapeHtml(x.modStr) + ' · ' + escapeHtml(x.level) + ']' +
      '</option>';
    }).join('') +
  '</optgroup>';

  var screenHtml = renderFaeSkillLauncherDiceHtml(selSk, isGuidance, selTarget, L.mods, L.rolledValues);

  var modBarHtml =
    '<div class="sh-mod-bar">' +
      '<div class="sh-mod-target-info">' +
        '<span>Выбран кубик:</span>' +
        '<span class="sh-mod-target-tag" id="faeSkillModTargetName">' + targetTitle + '</span>' +
      '</div>' +
      '<div class="sh-mod-controls">' +
        '<button type="button" class="sh-mod-step" data-fae-skill-mod-delta="-5" title="Уменьшить на 5">−5</button>' +
        '<button type="button" class="sh-mod-step" data-fae-skill-mod-delta="-1" title="Уменьшить на 1">−</button>' +
        '<input type="number" id="faeSkillActiveModInput" class="sh-active-mod-input" value="' + curModVal + '">' +
        '<button type="button" class="sh-mod-step" data-fae-skill-mod-delta="1" title="Увеличить на 1">+</button>' +
        '<button type="button" class="sh-mod-step" data-fae-skill-mod-delta="5" title="Увеличить на 5">+5</button>' +
        '<button type="button" class="sh-mod-reset" id="faeSkillModResetBtn" title="Сбросить модификатор в 0">Сброс</button>' +
      '</div>' +
      '<label class="sh-exp-check">' +
        '<input type="checkbox" id="faeSkillLauncherGui"' + (isGuidance ? ' checked' : '') + '> ✨ Указание / Помощь (+1d4)' +
      '</label>' +
    '</div>';

  var actionsHtml =
    '<div class="sh-launcher-actions">' +
      '<button type="button" class="sh-btn-launch" id="faeLaunchSkillComboBtn" title="Бросить проверку навыка и зафиксировать результат">🎲 Проверить навык</button>' +
      '<button type="button" class="sh-btn-copy-all" id="faeCopyAllSkillBtn" title="Скопировать готовый блок в буфер обмена для AI Studio">📋 Скопировать всё</button>' +
      '<button type="button" class="sh-micro-btn" id="faeLaunchSkillChkBtn" title="Бросить и скопировать только 1d20">🎯 Бросок 1d20</button>' +
      (isGuidance ? '<button type="button" class="sh-micro-btn" id="faeLaunchSkillGuiBtn" title="Бросить и скопировать бонус 1d4">✨ Бонус 1d4</button>' : '') +
      '<button type="button" class="sh-micro-btn" id="faeLaunchSkillClaimBtn" title="Скопировать заявку применения навыка без броска костей">📜 Только заявка (без броска)</button>' +
    '</div>';

  var hasRes = !!(L.lastResult);
  var resultBoxHtml =
    '<div class="sh-launcher-result ' + (hasRes ? 'has-result' : '') + '" id="faeSkillLauncherResultBox">' +
      '<div class="sh-launcher-result-text" id="faeSkillLauncherResultText">' + escapeHtml(L.lastResult || '') + '</div>' +
      '<div class="sh-copy-badge" id="faeSkillLauncherCopyBadge" style="display:' + (hasRes ? 'inline-flex' : 'none') + ';">' +
        '<span>' + (L.lastResultCopied ? '✓ Скопировано в буфер обмена для AI Studio' : '🎲 Бросок зафиксирован. Нажмите «📋 Скопировать всё»') + '</span>' +
      '</div>' +
    '</div>';

  var isOpen = !!L.isOpen;
  var toggleHeadHtml =
    '<div class="sh-launcher-toggle-head" id="faeSkillLauncherToggle" role="button" tabindex="0" title="Нажмите, чтобы развернуть или свернуть расчёт проверки навыка">' +
      '<div class="sh-launcher-title">' +
        '<span>🎲 Расчёт проверки навыка и ремесла</span>' +
        '<span class="sh-badge-tag">AI Studio</span>' +
      '</div>' +
      '<div class="sh-launcher-toggle-btn">' +
        '<span class="sh-launcher-toggle-text">' + (isOpen ? 'Свернуть' : 'Развернуть') + '</span>' +
        '<span class="sh-launcher-toggle-arrow">' + (isOpen ? '▲' : '▼') + '</span>' +
      '</div>' +
    '</div>';

  var bodyHtml =
    '<div class="sh-launcher-body" id="faeSkillLauncherBody">' +
      '<div class="sh-launcher-head">' +
        '<div class="sh-launcher-sel-wrap">' +
          '<div class="sh-launcher-sel-label">Навык или знание для расчёта:</div>' +
          '<select class="sh-launcher-sel" id="faeSkillLauncherSelect">' + selectOptsHtml + '</select>' +
        '</div>' +
      '</div>' +
      '<div class="sh-launcher-screen" id="faeSkillLauncherScreen">' + screenHtml + '</div>' +
      modBarHtml +
      actionsHtml +
      resultBoxHtml +
    '</div>';

  return '<div class="sh-launcher ' + (isOpen ? '' : 'collapsed') + '" id="faeSkillLauncherContainer">' +
    toggleHeadHtml +
    bodyHtml +
  '</div>';
}

function wireFaeSkillLauncher(){
  var c = getActiveFaerunCharacter();
  var allItems = getFaeLauncherSkillItems(c);
  if(!window._faeSkillLauncher) window._faeSkillLauncher = { isOpen: false, mods: { chk: 0, gui: 0 }, rolledValues: {}, selectedTarget: 'chk' };
  var L = window._faeSkillLauncher;

  var tHead = document.getElementById('faeSkillLauncherToggle');
  if(tHead){
    tHead.addEventListener('click', function(){
      L.isOpen = !L.isOpen;
      var cont = document.getElementById('faeSkillLauncherContainer');
      if(cont){
        cont.classList.toggle('collapsed', !L.isOpen);
        var txt = cont.querySelector('.sh-launcher-toggle-text');
        var arr = cont.querySelector('.sh-launcher-toggle-arrow');
        if(txt) txt.textContent = L.isOpen ? 'Свернуть' : 'Развернуть';
        if(arr) arr.textContent = L.isOpen ? '▲' : '▼';
      }
    });
  }

  var getSelSkill = function(){
    return allItems.find(function(x){ return x.ref === L.skillRef; }) || allItems[0] || null;
  };

  var updateModUI = function(){
    var targetNames = { chk: '🎯 Проверка навыка (1d20)', gui: '✨ Бонус Указания (1d4)' };
    var nameEl = document.getElementById('faeSkillModTargetName');
    if(nameEl) nameEl.textContent = targetNames[L.selectedTarget] || '🎯 Проверка навыка (1d20)';
    var inp = document.getElementById('faeSkillActiveModInput');
    if(inp) inp.value = (L.mods && L.mods[L.selectedTarget]) || 0;
  };

  var wireDiceClicks = function(){
    var scr = document.getElementById('faeSkillLauncherScreen');
    if(!scr) return;
    var els = scr.querySelectorAll('[data-select-fae-skill-roll]');
    els.forEach(function(el){
      el.addEventListener('click', function(){
        var target = el.getAttribute('data-select-fae-skill-roll');
        if(!target) return;
        L.selectedTarget = target;
        els.forEach(function(s){ s.classList.remove('selected'); });
        el.classList.add('selected');
        updateModUI();
      });
    });
  };
  wireDiceClicks();

  var setTargetMod = function(newVal){
    var target = L.selectedTarget || 'chk';
    L.mods[target] = newVal;
    updateModUI();
    var sk = getSelSkill();
    if(target === 'chk'){
      var subC = document.getElementById('faeScrSub_skillChk');
      if(subC) subC.textContent = '1d20' + (formatFaeLauncherMod(newVal) ? ' ' + formatFaeLauncherMod(newVal) : '');
    } else if(target === 'gui'){
      var subG = document.getElementById('faeScrSub_skillGui');
      if(subG) subG.textContent = '1d4' + (formatFaeLauncherMod(newVal) ? ' ' + formatFaeLauncherMod(newVal) : '');
    }
    if(L.lastResult && sk){
      L.lastResult = buildFaeSkillComboText(sk, !!L.isGuidance, L.rolledValues, L.mods);
      var rTxt = document.getElementById('faeSkillLauncherResultText');
      if(rTxt) rTxt.textContent = L.lastResult;
    }
  };

  document.querySelectorAll('[data-fae-skill-mod-delta]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var delta = parseInt(btn.getAttribute('data-fae-skill-mod-delta'), 10) || 0;
      var cur = parseInt(L.mods[L.selectedTarget], 10) || 0;
      setTargetMod(cur + delta);
    });
  });

  var resetBtn = document.getElementById('faeSkillModResetBtn');
  if(resetBtn) resetBtn.addEventListener('click', function(){ setTargetMod(0); });

  var modInp = document.getElementById('faeSkillActiveModInput');
  if(modInp){
    modInp.addEventListener('input', function(){
      var v = parseInt(this.value, 10);
      if(isNaN(v)) v = 0;
      setTargetMod(v);
    });
  }

  var selEl = document.getElementById('faeSkillLauncherSelect');
  if(selEl){
    selEl.addEventListener('change', function(){
      L.skillRef = this.value;
      var sk = getSelSkill();
      if(sk) L.mods.chk = sk.modNum || 0;
      L.rolledValues = {};
      L.lastResult = '';
      L.lastResultCopied = false;
      render();
    });
  }

  var guiCb = document.getElementById('faeSkillLauncherGui');
  if(guiCb){
    guiCb.addEventListener('change', function(){
      L.isGuidance = !!this.checked;
      if(!L.isGuidance && L.selectedTarget === 'gui') L.selectedTarget = 'chk';
      render();
    });
  }

  var finishSkillLaunch = function(sk, mode, autoCopy){
    var abStr = sk.abil ? (' | Хар-ка: ' + sk.abil) : '';
    var header = '*[Навык: ' + (sk.name || 'Навык') + ' | Тип: ' + (sk.kind || 'Ремесло') + ' | Ступень: ' + (sk.level || 'Начатки') + abStr + ']*';
    var lines = [];
    var mods = L.mods || { chk: 0, gui: 0 };

    if(mode === 'claim'){
      lines.push(header);
      if(sk.gives) lines.push('*[Применение без броска / Что даёт: ' + sk.gives + ']*');
    } else if(mode === 'chk'){
      var chkVal = 1 + Math.floor(Math.random() * 20);
      L.rolledValues.chk = chkVal;
      var cDie = document.getElementById('faeScrDieSkillChk');
      if(cDie){ var vEl = cDie.querySelector('.val'); if(vEl) vEl.textContent = chkVal; }
      var cMod = parseInt(mods.chk, 10) || 0;
      var cModStr = cMod > 0 ? ' + ' + cMod : (cMod < 0 ? ' − ' + Math.abs(cMod) : '');
      lines.push(header);
      lines.push('*[Результат броска Проверка навыка 1d20: ' + chkVal + ' ]*' + cModStr);
    } else if(mode === 'gui'){
      var guiVal = 1 + Math.floor(Math.random() * 4);
      L.rolledValues.gui = guiVal;
      var gDie = document.getElementById('faeScrDieSkillGui');
      if(gDie){ var vEl = gDie.querySelector('.val'); if(vEl) vEl.textContent = guiVal; }
      var gMod = parseInt(mods.gui, 10) || 0;
      var gModStr = gMod > 0 ? ' + ' + gMod : (gMod < 0 ? ' − ' + Math.abs(gMod) : '');
      lines.push(header);
      lines.push('*[Результат броска Бонус Указания / Мастерства 1d4: ' + guiVal + ' ]*' + gModStr);
    } else {
      var chkValAll = 1 + Math.floor(Math.random() * 20);
      L.rolledValues.chk = chkValAll;
      var cDieAll = document.getElementById('faeScrDieSkillChk');
      if(cDieAll){ var vEl = cDieAll.querySelector('.val'); if(vEl) vEl.textContent = chkValAll; }
      if(L.isGuidance){
        var guiValAll = 1 + Math.floor(Math.random() * 4);
        L.rolledValues.gui = guiValAll;
        var gDieAll = document.getElementById('faeScrDieSkillGui');
        if(gDieAll){ var vEl = gDieAll.querySelector('.val'); if(vEl) vEl.textContent = guiValAll; }
      }
      lines = buildFaeSkillComboText(sk, !!L.isGuidance, L.rolledValues, mods).split('\n');
    }

    var output = lines.join('\n');
    L.lastResult = output;
    var rBox = document.getElementById('faeSkillLauncherResultBox');
    var rTxt = document.getElementById('faeSkillLauncherResultText');
    var rBdg = document.getElementById('faeSkillLauncherCopyBadge');
    if(rTxt) rTxt.textContent = output;
    if(rBox) rBox.classList.add('has-result');
    if(autoCopy){
      copyText(output);
      L.lastResultCopied = true;
      if(rBdg){
        rBdg.innerHTML = '<span>✓ Скопировано в буфер обмена для AI Studio (' + lines.length + ' стр.)</span>';
        rBdg.style.display = 'inline-flex';
      }
    } else {
      L.lastResultCopied = false;
      if(rBdg){
        rBdg.innerHTML = '<span>🎲 Бросок зафиксирован. Нажмите «📋 Скопировать всё»</span>';
        rBdg.style.display = 'inline-flex';
      }
    }
  };

  var executeSkillLaunch = function(mode, autoCopy){
    var sk = getSelSkill();
    if(!sk) return;
    if(mode !== 'claim'){
      var diceToRoll = [];
      if(mode === 'all' || mode === 'chk'){
        var cDie = document.getElementById('faeScrDieSkillChk'); if(cDie) diceToRoll.push(cDie);
      }
      if((mode === 'all' || mode === 'gui') && L.isGuidance){
        var gDie = document.getElementById('faeScrDieSkillGui'); if(gDie) diceToRoll.push(gDie);
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
        finishSkillLaunch(sk, mode, autoCopy);
      }, 350);
    } else {
      finishSkillLaunch(sk, mode, autoCopy);
    }
  };

  var bCombo = document.getElementById('faeLaunchSkillComboBtn');
  if(bCombo) bCombo.addEventListener('click', function(){ executeSkillLaunch('all', false); });

  var bCopyAll = document.getElementById('faeCopyAllSkillBtn');
  if(bCopyAll){
    bCopyAll.addEventListener('click', function(){
      if(!L.lastResult) executeSkillLaunch('all', true);
      else {
        copyText(L.lastResult);
        L.lastResultCopied = true;
        var rBdg = document.getElementById('faeSkillLauncherCopyBadge');
        if(rBdg){
          rBdg.innerHTML = '<span>✓ Скопировано в буфер обмена для AI Studio (' + L.lastResult.split('\n').length + ' стр.)</span>';
          rBdg.style.display = 'inline-flex';
        }
      }
    });
  }

  var bChk = document.getElementById('faeLaunchSkillChkBtn'); if(bChk) bChk.addEventListener('click', function(){ executeSkillLaunch('chk', true); });
  var bGui = document.getElementById('faeLaunchSkillGuiBtn'); if(bGui) bGui.addEventListener('click', function(){ executeSkillLaunch('gui', true); });
  var bClaim = document.getElementById('faeLaunchSkillClaimBtn'); if(bClaim) bClaim.addEventListener('click', function(){ executeSkillLaunch('claim', true); });

  document.querySelectorAll('[data-fae-skill-to-calc]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var ref = btn.getAttribute('data-fae-skill-to-calc');
      if(!ref) return;
      L.isOpen = true;
      L.skillRef = ref;
      var sk = allItems.find(function(x){ return x.ref === ref; });
      if(sk) L.mods.chk = sk.modNum || 0;
      L.rolledValues = {};
      L.lastResult = '';
      if(view.screen !== 'faeSkills') navigate('faeSkills');
      else render();
      setTimeout(function(){
        var cont = document.getElementById('faeSkillLauncherContainer');
        if(cont) cont.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    });
  });
}

function renderFaeSkills(){
  var c = getActiveFaerunCharacter();
  var arr = (c && Array.isArray(c.customSkills)) ? c.customSkills : [];
  var activeKind = window._faeSkillKindFilter || 'all';
  var searchQ = (window._faeSkillSearch || '').trim().toLowerCase();
  var showDnd18 = window._faeShowDnd18Skills !== false;

  var pb = profBonus(c ? c.level : 1);
  var profCount = 0;
  var expCount = 0;
  SKILL_DEFS.forEach(function(def){
    var st = Number(c && c.skillProf ? c.skillProf[def.key] : 0) || 0;
    if(st === 1) profCount++;
    else if(st === 2) expCount++;
  });

  var kindPillsHtml = '<button type="button" class="fae-pill ' + (activeKind === 'all' ? 'active' : '') + '" data-fae-skill-kind="all">🛠️ Все навыки <span style="opacity:0.75;font-size:11px;">(' + arr.length + ')</span></button>' +
    FAE_SKILL_KINDS.map(function(k){
      var cnt = arr.filter(function(s){ return (s.kind || 'Другое') === k; }).length;
      var ic = FAE_SKILL_KIND_ICONS[k] || '🛠️';
      return '<button type="button" class="fae-pill ' + (activeKind === k ? 'active' : '') + '" data-fae-skill-kind="' + escapeAttr(k) + '">' +
        ic + ' ' + escapeHtml(k) + ' <span style="opacity:0.75;font-size:11px;">(' + cnt + ')</span>' +
      '</button>';
    }).join('');

  var filtered = arr.filter(function(s){
    var k = s.kind || 'Другое';
    if(activeKind !== 'all' && k !== activeKind) return false;
    if(searchQ){
      var hay = [s.name, s.kind, s.level, s.abil, s.mod, s.src, s.gives, s.desc].join(' ').toLowerCase();
      if(hay.indexOf(searchQ) === -1) return false;
    }
    return true;
  });

  var groups = {};
  filtered.forEach(function(s){
    var k = s.kind || 'Другое';
    if(!groups[k]) groups[k] = [];
    groups[k].push(s);
  });

  var orderedKinds = FAE_SKILL_KINDS.slice();
  Object.keys(groups).forEach(function(k){
    if(orderedKinds.indexOf(k) === -1) orderedKinds.push(k);
  });

  var bodyHtml = filtered.length ? orderedKinds.filter(function(k){ return groups[k] && groups[k].length; }).map(function(k){
    var ic = FAE_SKILL_KIND_ICONS[k] || '🛠️';
    return '<div class="section-label">' + ic + ' ' + escapeHtml(k) + ' (' + groups[k].length + ')</div>' +
      '<div class="fae-ref-cards-grid" style="margin-bottom:18px;">' +
      groups[k].map(function(s){
        var lvlBadge = '<span class="sh-lvl-badge lvl-' + escapeAttr(s.level || 'Начатки') + '">' + escapeHtml(s.level || 'Начатки') + '</span>';
        var metaLine = [(s.abil || ''), (s.mod ? ('модификатор ' + s.mod) : 'без броска')].filter(Boolean).join(' · ');
        var copyStr = '🛠️ ' + (s.name || 'Навык') + ' [' + (s.kind || 'Ремесло') + ' · ' + (s.level || 'Начатки') + (s.abil ? (', ' + s.abil) : '') + (s.mod ? (' ' + s.mod) : '') + ']: ' + (s.gives || s.desc || '');
        return '<div class="card fae-ref-card" data-fae-skill-open="' + escapeAttr(s.id) + '" style="display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;margin-bottom:0;">' +
          '<div>' +
            '<div class="top-row" style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
              '<div class="name fae-ref-card-k" style="margin-bottom:0;">' + ic + ' ' + escapeHtml(s.name || 'Без названия') + '</div>' +
              lvlBadge +
            '</div>' +
            '<div class="desc" style="font-size:12px;color:#c9a45c;font-family:\'JetBrains Mono\',monospace;margin-bottom:8px;">' + escapeHtml(metaLine) + '</div>' +
            (s.src ? '<div style="font-size:12px;color:#cbd5e1;margin-bottom:6px;"><b>🎓 Откуда:</b> ' + escapeHtml(s.src) + '</div>' : '') +
            (s.gives ? '<div class="fae-ref-card-v" style="margin-bottom:8px;"><b>✨ Что даёт:</b> ' + escapeHtml(s.gives) + '</div>' : '') +
            (s.desc ? '<div style="font-size:12.5px;color:#94a3b8;margin-bottom:10px;font-style:italic;">' + escapeHtml(s.desc) + '</div>' : '') +
          '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;padding-top:8px;border-top:1px solid rgba(201,164,92,0.18);">' +
            '<button type="button" class="rc-btn" data-fae-skill-to-calc="custom:' + escapeAttr(s.id) + '" style="border-color:rgba(200,67,55,0.5);color:#ff9085;">🎲 В расчёт</button>' +
            '<button type="button" class="rc-btn" data-fae-skill-copy="' + escapeAttr(copyStr) + '">📋 Копировать</button>' +
            '<button type="button" class="rc-btn" data-go="faeSkillEdit:' + escapeAttr(s.id) + '">✏️ Править</button>' +
            '<button type="button" class="rc-btn" data-fae-skill-del="' + escapeAttr(s.id) + '" style="color:#f87171;">🗑️</button>' +
          '</div>' +
        '</div>';
      }).join('') +
      '</div>';
  }).join('') : (
    '<div class="char-empty" style="margin-bottom:18px;">' +
      'Пусто. Сюда идёт всё, что персонаж умеет помимо боя: ремесло, кузнечное и травническое дело, воровские инструменты, быт, языки, руны, счёт, навигация и лор Фаэруна. Навык появляется от того, что персонаж этим занимался в предыстории или кампании!<br><br>' +
      '<span style="color:#c9a45c;">Нажмите «+ Добавить навык», выберите быстрый шаблон ниже или откройте «✨ AI Генератор навыков».</span>' +
    '</div>'
  );

  var templatesBarHtml =
    '<div class="fae-ref-card" style="padding:14px 16px;margin-bottom:18px;border-color:rgba(201,164,92,0.28);">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px;">' +
        '<span style="font-size:12px;color:#c9a45c;font-family:\'Cinzel\',serif;font-weight:700;">⚡ БЫСТРЫЕ ШАБЛОНЫ НАВЫКОВ И РЕМЁСЕЛ ФАЭРУНА (В 1 КЛИК):</span>' +
        '<span style="font-size:11.5px;color:#94a3b8;">Нажмите на шаблон, чтобы сразу добавить его герою</span>' +
      '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:7px;">' +
        FAE_SKILL_TEMPLATES.map(function(tpl, idx){
          var exists = arr.some(function(x){ return (x.name || '').toLowerCase() === tpl.name.toLowerCase(); });
          return '<button type="button" class="rc-btn" data-fae-skill-tpl="' + idx + '" ' + (exists ? 'disabled' : '') + ' style="' + (exists ? 'opacity:0.55;color:#6ee7b7;border-color:rgba(16,185,129,0.4);' : 'border-color:rgba(201,164,92,0.4);color:#f3e5ab;') + '">' +
            (exists ? '✓ ' : '+ ') + escapeHtml(tpl.name) + ' <span style="opacity:0.75;font-size:10.5px;">[' + escapeHtml(tpl.level) + ']</span>' +
          '</button>';
        }).join('') +
      '</div>' +
    '</div>';

  var dnd18GridHtml = SKILL_DEFS.map(function(def){
    var state = Number(c && c.skillProf ? c.skillProf[def.key] : 0) || 0;
    var mod = abilityMod(c && c.abilities ? c.abilities[def.ability] : 10) + state * pb;
    var pass = 10 + mod;
    var abRu = ABILITY_RU[def.ability] || '';
    var stateLabel = state === 2 ? 'Экспертиза' : (state === 1 ? 'Владение' : 'Начатки');
    var stateBadgeColor = state === 2
      ? 'background:rgba(245,158,11,0.2);border:1px solid rgba(245,158,11,0.55);color:#fde68a;'
      : (state === 1 ? 'background:rgba(16,185,129,0.18);border:1px solid rgba(16,185,129,0.45);color:#6ee7b7;' : 'background:rgba(15,23,42,0.6);border:1px solid rgba(148,163,184,0.25);color:#94a3b8;');
    return '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 10px;background:rgba(15,23,42,0.65);border:1px solid ' + (state > 0 ? 'rgba(201,164,92,0.38)' : 'rgba(255,255,255,0.07)') + ';border-radius:6px;">' +
      '<div style="display:flex;align-items:center;gap:8px;min-width:0;">' +
        '<button type="button" class="prof-toggle" data-fae-sk18-toggle="' + escapeAttr(def.key) + '" data-state="' + state + '" title="Клик: Нет владения → Владение (+БМ) → Экспертиза (+2×БМ)"></button>' +
        '<div style="min-width:0;cursor:pointer;" data-fae-skill-to-calc="dnd18:' + escapeAttr(def.key) + '" title="Нажмите, чтобы выбрать в расчёте проверки навыка">' +
          '<div style="font-size:13px;font-weight:' + (state > 0 ? '700' : '500') + ';color:' + (state > 0 ? '#f8fafc' : '#cbd5e1') + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(def.ru) + '</div>' +
          '<div style="font-size:10.5px;color:#94a3b8;">' + escapeHtml(abRu) + ' · Пасс. ' + pass + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">' +
        '<span style="font-size:10px;padding:1px 6px;border-radius:4px;' + stateBadgeColor + '">' + stateLabel + '</span>' +
        '<button type="button" class="rc-btn" data-fae-skill-to-calc="dnd18:' + escapeAttr(def.key) + '" style="padding:2px 7px;font-family:\'JetBrains Mono\',monospace;font-size:12.5px;font-weight:700;color:#c9a45c;" title="Рассчитать бросок ' + escapeAttr(def.ru) + '">🎲 ' + fmtMod(mod) + '</button>' +
      '</div>' +
    '</div>';
  }).join('');

  var dnd18SectionHtml =
    '<div class="fae-ref-card" style="padding:14px 16px;margin-bottom:20px;border-color:rgba(201,164,92,0.35);">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;cursor:pointer;" id="faeToggleDnd18Btn">' +
        '<div>' +
          '<div style="font-family:\'Cinzel\',serif;font-weight:700;font-size:14.5px;color:#f3e5ab;">🎯 18 базовых навыков D&D 5e / 2024 (Бонус мастерства ' + fmtMod(pb) + ')</div>' +
          '<div style="font-size:12px;color:#94a3b8;">Владение: <b style="color:#6ee7b7;">' + profCount + '</b> · Экспертиза: <b style="color:#fde68a;">' + expCount + '</b> · Клик по кружку меняет владение, клик по бонусу 🎲 открывает расчёт</div>' +
        '</div>' +
        '<button type="button" class="rc-btn" style="pointer-events:none;">' + (showDnd18 ? '▼ Свернуть 18 навыков' : '▶ Развернуть 18 навыков') + '</button>' +
      '</div>' +
      (showDnd18 ? (
        '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(255px, 1fr));gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(201,164,92,0.2);">' +
          dnd18GridHtml +
        '</div>'
      ) : '') +
    '</div>';

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Навыки и знания'}]) +
    '<button class="back" data-go="home">← На главную</button>' +
    renderFaeAbilitiesTabBar('skills') +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
      '<div>' +
        '<h1>🛠️ Навыки и знания</h1>' +
        '<p class="subtitle">Ремёсла, ступени мастерства (Начатки → Мастер), владение инструментами, языки, быт, лор и 18 базовых навыков D&D.</p>' +
      '</div>' +
      '<div class="sheet-actions" style="margin:0;display:flex;gap:10px;flex-wrap:wrap;">' +
        '<button type="button" class="btn btn-primary" data-go="faeSkillEdit:new">+ Добавить навык</button>' +
        '<button type="button" class="ai-gen-btn" data-go="faeSkillGen" style="padding:9px 16px;font-size:13px;">✨ AI Генератор навыков</button>' +
      '</div>' +
    '</div>' +
    '<div class="fae-rule"></div>' +

    renderFaeSkillLauncher(c) +
    dnd18SectionHtml +
    templatesBarHtml +

    '<div class="fae-ref-search-wrap" style="margin-bottom:14px;">' +
      '<span class="fae-ref-search-icon">🔍</span>' +
      '<input type="text" id="faeSkillSearchInp" class="fae-ref-search-input" value="' + escapeAttr(window._faeSkillSearch || '') + '" placeholder="Поиск по названию навыка, ремеслу, инструменту, языку или источнику..." autocomplete="off">' +
    '</div>' +

    '<div class="pill-row" style="margin-bottom:18px;">' + kindPillsHtml + '</div>' +
    bodyHtml;
}

function renderFaeSkillView(){
  var c = getActiveFaerunCharacter();
  var s = faeSkillById(c, view.skillId);
  if(!s) return renderFaeSkills();
  var ic = FAE_SKILL_KIND_ICONS[s.kind] || '🛠️';
  var rows = [
    { k: 'Тип', v: ic + ' ' + (s.kind || 'Ремесло') },
    { k: 'Уровень', v: '<span class="sh-lvl-badge lvl-' + escapeAttr(s.level || 'Начатки') + '">' + escapeHtml(s.level || 'Начатки') + '</span>', raw: true },
    { k: 'Характеристика', v: s.abil || '—' },
    { k: 'Модификатор', v: s.mod || 'без броска' },
    { k: 'Откуда', v: s.src || '—' },
    { k: 'Что даёт', v: s.gives || '—' },
    { k: 'Заметки', v: s.desc || '—' }
  ];
  var copyStr = '🛠️ ' + (s.name || 'Навык') + ' [' + (s.kind || 'Ремесло') + ' · ' + (s.level || 'Начатки') + (s.abil ? (', ' + s.abil) : '') + (s.mod ? (' ' + s.mod) : '') + ']\n' +
    (s.src ? ('• Откуда: ' + s.src + '\n') : '') +
    (s.gives ? ('• Что даёт: ' + s.gives + '\n') : '') +
    (s.desc ? ('• Заметки: ' + s.desc) : '');

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Навыки и знания', nav:'faeSkills'}, {label:s.name || 'Навык'}]) +
    '<button class="back" data-go="faeSkills">← К списку навыков</button>' +
    renderFaeAbilitiesTabBar('skills') +
    '<h1>' + ic + ' ' + escapeHtml(s.name || 'Навык') + '</h1>' +
    '<div class="fae-ref-card" style="padding:18px 22px;margin-bottom:16px;">' +
      rows.map(function(x){
        return '<div class="hb-row"><div class="hb-row-k">' + escapeHtml(x.k) + '</div><div class="hb-row-v">' + (x.raw ? x.v : escapeHtml(x.v).replace(/\n/g, '<br>')) + '</div></div>';
      }).join('') +
    '</div>' +
    '<div class="sheet-actions" style="display:flex;gap:10px;flex-wrap:wrap;">' +
      '<button type="button" class="btn btn-ghost" data-fae-skill-to-calc="custom:' + escapeAttr(s.id) + '" style="border-color:rgba(200,67,55,0.6);color:#ff9085;">🎲 В расчёт проверки</button>' +
      '<button type="button" class="btn btn-primary" data-go="faeSkillEdit:' + escapeAttr(s.id) + '">✏️ Править</button>' +
      '<button type="button" class="btn btn-ghost" data-fae-skill-copy="' + escapeAttr(copyStr) + '">📋 Скопировать</button>' +
      '<button type="button" class="btn btn-ghost" id="faeSkillDelV" data-fae-skill-del="' + escapeAttr(s.id) + '" style="color:#f87171;">🗑️ Удалить</button>' +
    '</div>';
}

function renderFaeSkillEdit(){
  var c = getActiveFaerunCharacter();
  var isNew = !view.skillId || view.skillId === 'new';
  var existing = (!isNew && c) ? faeSkillById(c, view.skillId) : null;
  var d = existing ? JSON.parse(JSON.stringify(existing)) : {
    id: '',
    name: '',
    kind: 'Ремесло',
    level: 'Начатки',
    abil: 'Интеллект',
    mod: '+4',
    src: '',
    gives: '',
    desc: ''
  };

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Навыки и знания', nav:'faeSkills'}, {label:isNew ? 'Новый навык' : (d.name || 'Правка')}]) +
    '<button class="back" data-go="' + (isNew ? 'faeSkills' : ('faeSkillView:' + d.id)) + '">← Назад</button>' +
    renderFaeAbilitiesTabBar('skills') +
    '<h1>' + escapeHtml(isNew ? 'Новый навык или знание' : ('Редактирование: ' + d.name)) + '</h1>' +
    '<div class="fae-rule"></div>' +
    '<div class="fae-ref-card" style="padding:20px;">' +
      '<input type="hidden" id="faeSkillEditId" value="' + escapeAttr(d.id || '') + '">' +
      '<div class="fae-edit-grid">' +
        '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
          '<label>Название навыка, ремесла, инструмента или языка</label>' +
          '<input type="text" class="fae-input" id="faeSName" value="' + escapeAttr(d.name) + '" placeholder="Ковка, травничество, воровские инструменты, эльфийский язык, навигация, знание Подземья...">' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Тип (Категория)</label>' +
          '<select class="fae-input" id="faeSKind">' +
            FAE_SKILL_KINDS.map(function(k){
              var ic = FAE_SKILL_KIND_ICONS[k] || '🛠️';
              return '<option value="' + escapeAttr(k) + '" ' + (d.kind === k ? 'selected' : '') + '>' + ic + ' ' + escapeHtml(k) + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Уровень (Ступень мастерства)</label>' +
          '<select class="fae-input" id="faeSLvl">' +
            FAE_SKILL_LEVELS.map(function(lvl){
              return '<option value="' + escapeAttr(lvl) + '" ' + (d.level === lvl ? 'selected' : '') + '>' + escapeHtml(lvl) + '</option>';
            }).join('') +
          '</select>' +
          '<div style="font-size:11px;color:#94a3b8;margin-top:4px;">Начатки — видел и повторит под присмотром. Мастер — учит других и делает то, чего не умеют прочие.</div>' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Характеристика</label>' +
          '<input type="text" class="fae-input" id="faeSAbil" value="' + escapeAttr(d.abil) + '" placeholder="На чём держится: Ловкость, Сила, Интеллект, Мудрость, Харизма">' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Модификатор</label>' +
          '<input type="text" class="fae-input" id="faeSMod" value="' + escapeAttr(d.mod) + '" placeholder="Напр. +5 (или оставьте пустым, если работает без броска)">' +
        '</div>' +
        '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
          '<label>Откуда (Кто научил, где и когда — зацепка для Мастера)</label>' +
          '<input type="text" class="fae-input" id="faeSSrc" value="' + escapeAttr(d.src) + '" placeholder="Напр. Обучение в кузнице клана Боевого Молота / Предыстория Гильдейского ремесленника">' +
        '</div>' +
        '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
          '<label>Что даёт (Что персонаж благодаря этому МОЖЕТ сделать и что узнаёт без броска)</label>' +
          '<textarea class="fae-input" id="faeSGives" rows="3" placeholder="Конкретные возможности, рецепты, преимущества и автоматические знания...">' + escapeHtml(d.gives) + '</textarea>' +
        '</div>' +
        '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
          '<label>Заметки и необходимые инструменты</label>' +
          '<textarea class="fae-input" id="faeSDesc" rows="3" placeholder="Дополнительные детали, необходимые наборы инструментов и особенности применения...">' + escapeHtml(d.desc) + '</textarea>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap;">' +
        '<button type="button" class="btn btn-primary" id="faeSkillSave">💾 Сохранить</button>' +
        (isNew ? '' : '<button type="button" class="btn btn-ghost" data-fae-skill-del="' + escapeAttr(d.id) + '" style="color:#f87171;">🗑️ Удалить</button>') +
        '<button type="button" class="btn btn-ghost" data-go="faeSkills">Отмена</button>' +
      '</div>' +
    '</div>';
}

function renderFaeSkillGen(){
  var c = getActiveFaerunCharacter();
  var hasKey = !!((typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '');
  var heroCtx = c ? (c.name + ' (' + (c.species || 'Человек') + ', ' + (c.className || 'Воин') + ' ' + (c.level || 1) + ' ур.' + (c.background ? (', ' + c.background) : '') + ')') : 'Герой Фаэруна';

  var presets = [
    { label: 'Рунная кузница дварфов', theme: 'Ковка и гравировка защитных дварфийских рун на оружии и доспехах', kind: 'Ремесло', level: 'Умелец' },
    { label: 'Шифры и тайнопись Арфистов', theme: 'Чтение тайных меток, взлом дипломатических шифров и подделка печатей', kind: 'Языки', level: 'Подмастерье' },
    { label: 'Анатомия чудовищ и трофеи', theme: 'Сцеживание ядов, снятие драконьей чешуи и знание уязвимостей бестиария Фаэруна', kind: 'Знание', level: 'Умелец' },
    { label: 'Ювелирное и чародейское огранение', theme: 'Огранка драгоценных камней для магических фокусировок и оценка реликвий', kind: 'Инструменты', level: 'Мастер' },
    { label: 'Полевая хирургия и травы', theme: 'Сшивание тяжёлых ран, прижигание и приготовление целебных припарок на привале', kind: 'Быт', level: 'Подмастерье' }
  ];

  var hist = [];
  try { hist = JSON.parse(localStorage.getItem('fae_ai_hist_skill') || '[]'); } catch(e){}
  var histHtml = hist.length ? (
    '<div style="margin-top:22px;">' +
      '<div class="section-label">🕘 ИСТОРИЯ СГЕНЕРИРОВАННЫХ НАВЫКОВ (' + hist.length + ')</div>' +
      '<div class="menu-list">' +
        hist.map(function(item, i){
          return '<div class="card fae-ref-card" data-fae-skill-hist-load="' + i + '" style="cursor:pointer;margin-bottom:0;display:flex;align-items:center;justify-content:space-between;padding:12px 16px;">' +
            '<div style="flex:1;">' +
              '<div class="name" style="font-size:15px;margin-bottom:2px;"><span class="sh-lvl-badge lvl-' + escapeAttr(item.level || 'Подмастерье') + '" style="margin-right:6px;">' + escapeHtml(item.level || 'Подмастерье') + '</span> ' + escapeHtml(item.name || 'Навык') + '</div>' +
              '<div style="font-size:12px;color:#94a3b8;">' + escapeHtml(item.kind || 'Ремесло') + ' · ' + escapeHtml(item.abil || 'Интеллект') + (item.mod ? (' (' + escapeHtml(item.mod) + ')') : '') + '</div>' +
            '</div>' +
            '<button type="button" class="btn-ghost" data-fae-skill-hist-del="' + i + '" style="padding:6px 10px;color:#f87171;border-color:transparent;flex-shrink:0;" title="Удалить из истории">🗑️</button>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>'
  ) : '';

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Навыки и знания', nav:'faeSkills'}, {label:'AI Генератор навыков'}]) +
    '<button class="back" data-go="faeSkills">← К списку навыков</button>' +
    renderFaeAbilitiesTabBar('skills') +
    '<h1>✨ AI Генератор Навыков и Ремёсел</h1>' +
    '<p class="subtitle">Создание ремёсел, мирных профессий, инструментальных владений, языков и тайных знаний для героя: <b style="color:#c9a45c;">' + escapeHtml(heroCtx) + '</b></p>' +
    '<div class="fae-rule"></div>' +

    '<div class="ai-gen-box" id="faeSgFormSection">' +
      '<div class="fae-gen-preset-wrap" style="margin-bottom:14px;">' +
        '<div style="font-size:11.5px;color:#c9a45c;font-family:\'Cinzel\',serif;font-weight:700;margin-bottom:6px;">⚡ БЫСТРЫЕ ИДЕИ НАВЫКОВ И ЗНАНИЙ:</div>' +
        '<div class="fae-gen-preset-row">' +
          presets.map(function(p){
            return '<button type="button" class="fae-gen-preset-chip" data-fae-skill-preset="' + escapeAttr(p.theme) + '" data-kind="' + escapeAttr(p.kind) + '" data-lvl="' + escapeAttr(p.level) + '">💡 ' + escapeHtml(p.label) + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="fae-edit-grid">' +
        '<div class="fae-edit-item" style="grid-column:1 / -1;">' +
          '<label>Тема или идея навыка / профессии / знания</label>' +
          '<input type="text" class="fae-input" id="faeSgTheme" placeholder="Напр. Картография Подземья, Оружейная ковка, Древний нетерийский язык, Полевая кулинария...">' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Тип навыка</label>' +
          '<select class="fae-input" id="faeSgKind">' +
            FAE_SKILL_KINDS.map(function(k){
              var ic = FAE_SKILL_KIND_ICONS[k] || '🛠️';
              return '<option value="' + escapeAttr(k) + '">' + ic + ' ' + escapeHtml(k) + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
        '<div class="fae-edit-item">' +
          '<label>Ступень мастерства</label>' +
          '<select class="fae-input" id="faeSgLevel">' +
            FAE_SKILL_LEVELS.map(function(lvl){
              return '<option value="' + escapeAttr(lvl) + '" ' + (lvl === 'Подмастерье' ? 'selected' : '') + '>' + escapeHtml(lvl) + '</option>';
            }).join('') +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:16px;">' +
        '<button type="button" class="btn-ghost" id="faeSkillGenKeyBtn" style="font-size:12.5px;">🔑 API ключ: ' + (hasKey ? '<span style="color:#4ade80;">✓ Установлен</span>' : '<span style="color:#fbbf24;">⚠️ Не задан</span>') + '</button>' +
        '<button type="button" class="ai-gen-btn" id="btnFaeSkillAiRun">✨ Сгенерировать навык</button>' +
      '</div>' +
    '</div>' +
    '<div id="faeSgResultWrap" style="display:none;margin-top:20px;"></div>' +
    histHtml;
}

function wireFaeSkills(){
  wireFaeAbilitiesHeroSelect();
  wireFaeSkillLauncher();

  var toggle18 = document.getElementById('faeToggleDnd18Btn');
  if(toggle18){
    toggle18.addEventListener('click', function(){
      window._faeShowDnd18Skills = (window._faeShowDnd18Skills === false) ? true : false;
      render();
    });
  }

  document.querySelectorAll('[data-fae-sk18-toggle]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var key = btn.getAttribute('data-fae-sk18-toggle');
      var c = getActiveFaerunCharacter();
      if(!c || !key) return;
      if(!c.skillProf) c.skillProf = {};
      var cur = Number(c.skillProf[key]) || 0;
      c.skillProf[key] = (cur + 1) % 3;
      saveCharactersToStorage();
      render();
    });
  });

  document.querySelectorAll('[data-fae-skill-tpl]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var idx = parseInt(btn.getAttribute('data-fae-skill-tpl'), 10);
      var tpl = FAE_SKILL_TEMPLATES[idx];
      var c = getActiveFaerunCharacter();
      if(!tpl || !c) return;
      if(!Array.isArray(c.customSkills)) c.customSkills = [];
      c.customSkills.unshift({
        id: 'fae_skill_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,6),
        name: tpl.name,
        kind: tpl.kind,
        level: tpl.level,
        abil: tpl.abil,
        mod: tpl.mod,
        src: tpl.src,
        gives: tpl.gives,
        desc: tpl.desc
      });
      saveCharactersToStorage();
      render();
    });
  });

  document.querySelectorAll('[data-fae-skill-kind]').forEach(function(btn){
    btn.addEventListener('click', function(){
      window._faeSkillKindFilter = btn.getAttribute('data-fae-skill-kind') || 'all';
      render();
    });
  });

  var sInp = document.getElementById('faeSkillSearchInp');
  if(sInp){
    sInp.addEventListener('input', function(){
      window._faeSkillSearch = this.value;
      var pos = this.selectionStart;
      render();
      var next = document.getElementById('faeSkillSearchInp');
      if(next){ next.focus(); try{ next.setSelectionRange(pos, pos); }catch(e){} }
    });
  }

  document.querySelectorAll('[data-fae-skill-open]').forEach(function(card){
    card.addEventListener('click', function(e){
      if(e.target.closest('button') || e.target.closest('[data-go]')) return;
      navigate('faeSkillView:' + card.getAttribute('data-fae-skill-open'));
    });
  });

  document.querySelectorAll('[data-fae-skill-copy]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      copyText(btn.getAttribute('data-fae-skill-copy') || '');
      var old = btn.textContent;
      btn.textContent = '✓ Скопировано';
      setTimeout(function(){ btn.textContent = old; }, 1100);
    });
  });

  document.querySelectorAll('[data-fae-skill-del]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var id = btn.getAttribute('data-fae-skill-del');
      var c = getActiveFaerunCharacter();
      if(!c || !Array.isArray(c.customSkills)) return;
      var found = faeSkillById(c, id);
      if(!confirm('Удалить навык «' + (found ? found.name : '') + '»?')) return;
      c.customSkills = c.customSkills.filter(function(x){ return x.id !== id; });
      saveCharactersToStorage();
      navigate('faeSkills');
    });
  });

  var saveBtn = document.getElementById('faeSkillSave');
  if(saveBtn){
    saveBtn.addEventListener('click', function(){
      var c = getActiveFaerunCharacter();
      if(!c) return;
      if(!Array.isArray(c.customSkills)) c.customSkills = [];
      var existingId = (document.getElementById('faeSkillEditId')?.value || '').trim();
      var id = existingId || ('fae_skill_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,6));
      var item = {
        id: id,
        name: (document.getElementById('faeSName')?.value || '').trim() || 'Новый навык',
        kind: document.getElementById('faeSKind')?.value || 'Ремесло',
        level: document.getElementById('faeSLvl')?.value || 'Начатки',
        abil: (document.getElementById('faeSAbil')?.value || '').trim(),
        mod: (document.getElementById('faeSMod')?.value || '').trim(),
        src: (document.getElementById('faeSSrc')?.value || '').trim(),
        gives: (document.getElementById('faeSGives')?.value || '').trim(),
        desc: (document.getElementById('faeSDesc')?.value || '').trim()
      };
      var idx = c.customSkills.findIndex(function(x){ return x.id === id; });
      if(idx >= 0) c.customSkills[idx] = item;
      else c.customSkills.unshift(item);
      saveCharactersToStorage();
      navigate('faeSkillView:' + id);
    });
  }

  document.querySelectorAll('[data-fae-skill-preset]').forEach(function(chip){
    chip.addEventListener('click', function(){
      var tInp = document.getElementById('faeSgTheme');
      var kSel = document.getElementById('faeSgKind');
      var lSel = document.getElementById('faeSgLevel');
      if(tInp) tInp.value = chip.getAttribute('data-fae-skill-preset') || '';
      if(kSel && chip.getAttribute('data-kind')) kSel.value = chip.getAttribute('data-kind');
      if(lSel && chip.getAttribute('data-lvl')) lSel.value = chip.getAttribute('data-lvl');
    });
  });

  var keyBtn = document.getElementById('faeSkillGenKeyBtn');
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

  function showFaeSkillAiPreview(res){
    window._lastFaeGenSkill = res;
    var wrap = document.getElementById('faeSgResultWrap');
    if(!wrap) return;
    wrap.style.display = 'block';
    var ic = FAE_SKILL_KIND_ICONS[res.kind] || '🛠️';
    wrap.innerHTML =
      '<div class="fae-ref-card" style="padding:20px;border-color:#c9a45c;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;">' +
          '<div class="fae-ref-card-k" style="font-size:19px;margin:0;">' + ic + ' ' + escapeHtml(res.name || 'Навык') + '</div>' +
          '<span class="sh-lvl-badge lvl-' + escapeAttr(res.level || 'Подмастерье') + '">' + escapeHtml(res.level || 'Подмастерье') + '</span>' +
        '</div>' +
        '<div style="font-size:12.5px;color:#c9a45c;font-family:\'JetBrains Mono\',monospace;margin-bottom:10px;">' +
          'Тип: <b>' + escapeHtml(res.kind || 'Ремесло') + '</b> · Характеристика: <b>' + escapeHtml(res.abil || 'Интеллект') + '</b>' + (res.mod ? (' · Модификатор: <b>' + escapeHtml(res.mod) + '</b>') : '') +
        '</div>' +
        (res.src ? '<div style="font-size:13px;color:#cbd5e1;margin-bottom:8px;"><b>🎓 Откуда:</b> ' + escapeHtml(res.src) + '</div>' : '') +
        (res.gives ? '<div class="fae-ref-card-v" style="white-space:pre-line;margin-bottom:10px;"><b>✨ Что даёт:</b> ' + escapeHtml(res.gives) + '</div>' : '') +
        (res.desc ? '<div style="font-size:13px;color:#94a3b8;white-space:pre-line;margin-bottom:14px;"><b>📝 Заметки:</b> ' + escapeHtml(res.desc) + '</div>' : '') +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
          '<button type="button" class="btn btn-primary" id="btnFaeSkillAiSave">💾 Добавить навык герою</button>' +
        '</div>' +
      '</div>';

    var sv = document.getElementById('btnFaeSkillAiSave');
    if(sv){
      sv.addEventListener('click', function(){
        var hero = getActiveFaerunCharacter();
        if(!hero) return;
        if(!Array.isArray(hero.customSkills)) hero.customSkills = [];
        var newId = 'fae_skill_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,6);
        hero.customSkills.unshift({
          id: newId,
          name: res.name || 'Навык',
          kind: res.kind || 'Ремесло',
          level: res.level || 'Подмастерье',
          abil: res.abil || 'Интеллект',
          mod: res.mod != null ? String(res.mod) : '+4',
          src: res.src || '',
          gives: res.gives || '',
          desc: res.desc || ''
        });
        saveCharactersToStorage();
        navigate('faeSkillView:' + newId);
      });
    }
  }

  document.querySelectorAll('[data-fae-skill-hist-load]').forEach(function(card){
    card.addEventListener('click', function(e){
      if(e.target.closest('[data-fae-skill-hist-del]')) return;
      var idx = parseInt(card.getAttribute('data-fae-skill-hist-load'), 10);
      try {
        var h = JSON.parse(localStorage.getItem('fae_ai_hist_skill') || '[]');
        if(h[idx]){
          showFaeSkillAiPreview(h[idx]);
          var wrap = document.getElementById('faeSgResultWrap');
          if(wrap) wrap.scrollIntoView({ behavior: 'smooth' });
        }
      } catch(err){}
    });
  });

  document.querySelectorAll('[data-fae-skill-hist-del]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var idx = parseInt(btn.getAttribute('data-fae-skill-hist-del'), 10);
      try {
        var h = JSON.parse(localStorage.getItem('fae_ai_hist_skill') || '[]');
        h.splice(idx, 1);
        localStorage.setItem('fae_ai_hist_skill', JSON.stringify(h));
        render();
      } catch(err){}
    });
  });

  var runAiBtn = document.getElementById('btnFaeSkillAiRun');
  if(runAiBtn){
    runAiBtn.addEventListener('click', function(){
      var k = (typeof window.getGeminiApiKey === 'function') ? window.getGeminiApiKey() : '';
      if(!k){
        var inp = prompt('Введите Google Gemini API ключ:');
        if(inp && inp.trim()){ k = inp.trim(); if(typeof window.saveGeminiApiKey === 'function') window.saveGeminiApiKey(k); }
        else return;
      }
      var c = getActiveFaerunCharacter();
      var theme = (document.getElementById('faeSgTheme')?.value || '').trim() || 'Полезное ремесло или знание искателя приключений Фаэруна';
      var kind = document.getElementById('faeSgKind')?.value || 'Ремесло';
      var level = document.getElementById('faeSgLevel')?.value || 'Подмастерье';

      runAiBtn.disabled = true;
      runAiBtn.textContent = '✨ Сотворение навыка...';

      callGeminiFaeGenerator({
        cat: 'skill',
        theme: theme,
        skillKind: kind,
        skillLevel: level,
        contextInfo: c ? (c.name + ', ' + (c.species || 'Человек') + ', ' + (c.className || 'Воин') + ' ' + (c.level || 1) + ' ур.') : ''
      }, k, function(err, res){
        runAiBtn.disabled = false;
        runAiBtn.textContent = '✨ Сгенерировать навык';
        if(err || !res){
          alert('Ошибка генерации: ' + (err || 'Пустой ответ'));
          return;
        }
        try {
          var h = JSON.parse(localStorage.getItem('fae_ai_hist_skill') || '[]');
          h.unshift(res);
          if(h.length > 20) h.length = 20;
          localStorage.setItem('fae_ai_hist_skill', JSON.stringify(h));
        } catch(e){}
        showFaeSkillAiPreview(res);
      });
    });
  }
}


/* ---------- magic screens ---------- */
var FAE_SPELL_CLASSES = [
  'Все классы',
  'Бард',
  'Волшебник',
  'Друид',
  'Жрец',
  'Изобретатель',
  'Колдун',
  'Паладин',
  'Следопыт',
  'Чародей'
];

var FAE_SCHOOL_DESCRIPTIONS = {
  abjuration: 'Защитные барьеры, обереги, контрзаклинания, изгнание потусторонних сущностей и снятие проклятий.',
  conjuration: 'Призыв существ и духов из иных планов, телепортация сквозь пространство и сотворение материи.',
  divination: 'Предвидение будущего, чтение мыслей, поиск скрытых тайн, истинное зрение и связь с божествами.',
  enchantment: 'Власть над разумом и эмоциями: очарование, внушение, паралич, ментальное доминирование и слова силы.',
  evocation: 'Управление чистой разрушительной энергией стихий (огонь, молния, холод, сила) и божественное исцеление.',
  illusion: 'Обман чувств и разума: невидимость, зеркальные двойники, фантомы, гипнотические узоры и живые миражи.',
  necromancy: 'Магия жизни, смерти и души: поднятие нежити, вытягивание жизненных сил, проклятия и воскрешение павших.',
  transmutation: 'Изменение материи, времени и живых тел: ускорение, полёт, полиморф, телекинез, дезинтеграция и остановка времени.'
};

function extractSpellRoll(effectText){
  if(!effectText) return null;
  var m = String(effectText).match(/(\d{1,2})[dк](\d{1,3})/i);
  if(!m) return null;
  var cnt = parseInt(m[1], 10);
  var sides = parseInt(m[2], 10);
  if(!cnt || !sides || cnt > 40 || [4,6,8,10,12,20,100].indexOf(sides) === -1) return null;
  return { count: cnt, sides: sides, formula: cnt + 'd' + sides };
}

function renderSpellHeroTargetBar(){
  var c = getActiveFaerunCharacter();
  var chars = Array.isArray(CHARACTERS) && CHARACTERS.length ? CHARACTERS : (c ? [c] : []);
  var tCount = (c && Array.isArray(c.techs)) ? c.techs.length : 0;
  var mCount = (c && Array.isArray(c.moves)) ? c.moves.length : 0;
  var sCount = (c && Array.isArray(c.customSkills)) ? c.customSkills.length : 0;
  var pCount = (c && c.skillProf) ? Object.keys(c.skillProf).filter(function(k){ return Number(c.skillProf[k]) > 0; }).length : 0;
  var totSkills = sCount + pCount;

  var charOpts = chars.map(function(ch){
    var isSel = c && ch.id === c.id;
    return '<option value="' + escapeAttr(ch.id) + '" ' + (isSel ? 'selected' : '') + '>' +
      getFaerunClassIcon(ch.className) + ' ' + escapeHtml(ch.name || 'Герой') + ' (' + escapeHtml(ch.className || 'D&D') + ' ' + (ch.level||1) + ' ур.)' +
    '</option>';
  }).join('');

  return '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding:10px 14px;margin-bottom:14px;background:rgba(22,26,34,0.85);border:1px solid rgba(201,164,92,0.32);border-radius:8px;">' +
    '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
      '<span style="font-size:12px;color:#c9a45c;font-family:\'Cinzel\',serif;font-weight:700;">🧙 АКТИВНЫЙ ГЕРОЙ:</span>' +
      '<select id="faeSpellHeroSelect" class="fae-input" style="padding:6px 12px;font-size:13px;min-width:220px;">' + charOpts + '</select>' +
    '</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
      '<button type="button" class="rc-btn" data-go="faeTechs" style="border-color:rgba(201,164,92,0.45);color:#f3e5ab;">✨ Способности (' + tCount + ') →</button>' +
      '<button type="button" class="rc-btn" data-go="faeMoves" style="border-color:rgba(56,189,248,0.45);color:#bae6fd;">⚔️ Приёмы (' + mCount + ') →</button>' +
      '<button type="button" class="rc-btn" data-go="faeSkills" style="border-color:rgba(16,185,129,0.45);color:#6ee7b7;">🛠️ Навыки (' + totSkills + ') →</button>' +
    '</div>' +
  '</div>';
}

function isSpellInHeroTechs(hero, spell){
  if(!hero || !Array.isArray(hero.techs) || !spell) return false;
  var targetName = ('✨ ' + spell.name).toLowerCase();
  var rawName = (spell.name || '').toLowerCase();
  return hero.techs.some(function(t){
    if(!t) return false;
    if(t.spellId && t.spellId === spell.id) return true;
    var tn = (t.name || '').toLowerCase();
    return tn === targetName || tn === rawName || tn.indexOf('✨ ' + rawName + ' (') === 0;
  });
}

function spellCardHtml(s, showSchoolBadge){
  var eff = s.effect || s.desc || '';
  var isConc = (s.meta || '').toLowerCase().indexOf('концентрация') !== -1 && (s.meta || '').toLowerCase().indexOf('без концентрации') === -1;
  var isRitual = (s.meta || '').toLowerCase().indexOf('ритуал') !== -1;
  var scName = schoolName(s.school);
  var hero = getActiveFaerunCharacter();
  var heroName = (hero && hero.name) ? hero.name : 'Герой';
  var alreadyAdded = isSpellInHeroTechs(hero, s);

  var addBtnHtml = alreadyAdded
    ? `<button type="button" class="rc-btn spell-add-hero-btn" data-spell-hero-id="${escapeAttr(s.id)}" disabled style="background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.45);color:#6ee7b7;font-weight:600;">✓ В способностях (${escapeHtml(heroName)})</button>`
    : `<button type="button" class="rc-btn spell-add-hero-btn" data-spell-hero-id="${escapeAttr(s.id)}" style="background:rgba(201,164,92,0.16);border-color:rgba(201,164,92,0.55);color:#f3e5ab;font-weight:600;">✨ + В способности (${escapeHtml(heroName)})</button>`;

  return `
    <div class="card" data-copy="${escapeAttr(s.name + (s.en ? (' (' + s.en + ')') : ''))}">
      <div class="top-row with-icon" style="align-items:flex-start;">
        <div class="spell-icon">${schoolIconSvg(s.school)}</div>
        <div style="flex:1;min-width:0;">
          <div class="name">${escapeHtml(s.name)}</div>
          ${s.en ? `<div class="eng" style="margin-top:2px;">${escapeHtml(s.en)}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
          ${showSchoolBadge ? `<span class="fae-ref-item-tag" style="font-size:11px;">${escapeHtml(scName)}</span>` : ''}
          ${isRitual ? `<span class="fae-ref-item-tag" style="font-size:11px;border-color:rgba(96,165,250,0.45);color:#93c5fd;">🕯️ Ритуал</span>` : ''}
          ${isConc ? `<span class="fae-ref-item-tag" style="font-size:11px;border-color:rgba(251,191,36,0.45);color:#fde68a;">🧠 Концентрация</span>` : ''}
          <div class="die-badge">${levelLabel(s.level)}</div>
        </div>
      </div>
      ${(s.classes || s.meta) ? `
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 10px 0;font-size:11.5px;color:#cbd5e1;font-family:'JetBrains Mono',monospace;">
        ${s.classes ? `<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.28);padding:2px 8px;border-radius:4px;color:#fde68a;">🧙 ${escapeHtml(s.classes)}</span>` : ''}
        ${s.meta ? `<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(148,163,184,0.25);padding:2px 8px;border-radius:4px;color:#cbd5e1;">⏱️ ${escapeHtml(s.meta)}</span>` : ''}
      </div>` : ''}
      <div class="desc">${escapeHtml(eff)}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px;padding-top:8px;border-top:1px solid rgba(201,164,92,0.14);">
        ${addBtnHtml}
        <button type="button" class="rc-btn spell-edit-btn" data-spell-edit="${escapeAttr(s.id)}" data-spell-school="${escapeAttr(s.school)}">✏️ Изменить</button>
        ${s.isCustom ? `<button type="button" class="rc-btn spell-delete-btn" data-spell-delete="${escapeAttr(s.id)}" style="color:var(--crimson-bright);">🗑 Удалить</button>` : ''}
      </div>
      <div class="stamp"><span>Скопировано</span></div>
    </div>`;
}

function renderSpellsGroupedByLevel(spellsList, showSchoolBadge){
  if(!spellsList || !spellsList.length){
    return '<div class="char-empty">По выбранному фильтру заклинаний не найдено. Попробуйте сбросить фильтр круга, класса или поисковый запрос.</div>';
  }
  var byLvl = {};
  spellsList.forEach(function(sp){
    var l = Number(sp.level) || 0;
    if(!byLvl[l]) byLvl[l] = [];
    byLvl[l].push(sp);
  });
  var html = '';
  Object.keys(byLvl).map(Number).sort(function(a,b){ return a-b; }).forEach(function(lvl){
    var group = byLvl[lvl].sort(function(a,b){ return (a.name||'').localeCompare(b.name||'','ru'); });
    var title = lvl === 0 ? '✨ Заговоры (0 круг — неограниченное сотворение)' : ('🔮 ' + lvl + '-й круг магии');
    html += `
      <div style="margin:20px 0 10px 0;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(201,164,92,0.28);padding-bottom:6px;">
        <h2 style="margin:0;font-size:17px;color:#f3e5ab;font-family:'Cinzel',serif;">${title}</h2>
        <span class="fae-ref-item-tag">${group.length} закл.</span>
      </div>
      <div>${group.map(function(sp){ return spellCardHtml(sp, showSchoolBadge); }).join('')}</div>
    `;
  });
  return html;
}

function renderMagicHub(){
  var searchQ = (window._faeMagicSearchQ || '').trim().toLowerCase();
  var lvlFilter = (window._faeMagicLvlFilter !== undefined && window._faeMagicLvlFilter !== null) ? window._faeMagicLvlFilter : 'all';
  var clsFilter = window._faeMagicClsFilter || 'Все классы';

  var cantripsTotal = SPELLS.filter(function(s){ return Number(s.level) === 0; }).length;
  var leveledTotal = SPELLS.length - cantripsTotal;

  const items = MAGIC_SCHOOLS.map(sc=>{
    const scSpells = SPELLS.filter(s=>s.school===sc.key);
    const count = scSpells.length;
    const c0 = scSpells.filter(s=>Number(s.level)===0).length;
    const desc = FAE_SCHOOL_DESCRIPTIONS[sc.key] || '';
    return `
      <div class="fae-ref-card fae-card-clickable" data-go="schoolSpells:${sc.key}" role="button" tabindex="0" style="display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="school-icon" style="width:36px;height:36px;flex-shrink:0;">${schoolIconSvg(sc.key)}</div>
              <div>
                <div class="fae-ref-card-k" style="margin:0;font-size:17px;">${escapeHtml(sc.ru)}</div>
                <div style="font-size:11.5px;color:#94a3b8;font-style:italic;">Школа ${escapeHtml(sc.ru.toLowerCase())}</div>
              </div>
            </div>
            <span class="fae-ref-item-tag">${count} закл.</span>
          </div>
          <div class="fae-ref-card-v" style="margin-bottom:10px;font-size:13px;color:#cbd5e1;">${escapeHtml(desc)}</div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid rgba(201,164,92,0.18);font-size:12px;color:#c9a45c;">
          <span>Заговоров: <b>${c0}</b> • Круги 1–9: <b>${count - c0}</b></span>
          <span style="font-weight:700;">Открыть гримуар →</span>
        </div>
      </div>`;
  }).join('');

  var levelPills = [{k:'all', l:'Все круги (' + SPELLS.length + ')'}, {k:'0', l:'Заговоры (' + cantripsTotal + ')'}];
  for(var lv=1; lv<=9; lv++){
    var lCnt = SPELLS.filter(function(s){ return Number(s.level) === lv; }).length;
    levelPills.push({k:String(lv), l:lv + ' круг (' + lCnt + ')'});
  }
  var levelPillsHtml = levelPills.map(function(p){
    return `<button type="button" class="fae-pill ${String(lvlFilter)===p.k?'active':''}" data-magic-lvl="${p.k}">${p.l}</button>`;
  }).join('');

  var classPillsHtml = FAE_SPELL_CLASSES.map(function(cl){
    return `<button type="button" class="fae-pill ${clsFilter===cl?'active':''}" data-magic-cls="${escapeAttr(cl)}">${cl === 'Все классы' ? '🧙 Все классы' : escapeHtml(cl)}</button>`;
  }).join('');

  var isFiltering = !!(searchQ || lvlFilter !== 'all' || clsFilter !== 'Все классы');
  var filteredSpells = [];
  if(isFiltering){
    filteredSpells = SPELLS.filter(function(sp){
      if(lvlFilter !== 'all' && String(sp.level) !== String(lvlFilter)) return false;
      if(clsFilter !== 'Все классы' && (sp.classes || '').toLowerCase().indexOf(clsFilter.toLowerCase()) === -1) return false;
      if(searchQ){
        var hay = [sp.name, sp.en, sp.classes, sp.meta, sp.effect, schoolName(sp.school)].join(' ').toLowerCase();
        if(hay.indexOf(searchQ) === -1) return false;
      }
      return true;
    });
  }

  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Книга заклинаний'}])}
    <button class="back" data-go="faeRef">← В справочник</button>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
      <div>
        <h1>✨ Книга заклинаний D&D 5e / 2024</h1>
        <p class="subtitle">Полная энциклопедия заклинаний по всем 8 школам магии — от заговоров (0 круг) до легендарных чар 9-го круга.</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <span class="fae-ref-header-badge">📖 8 школ • ${SPELLS.length} заклинаний (${cantripsTotal} заговоров + ${leveledTotal} кругов 1–9)</span>
        <button type="button" class="btn btn-primary" data-go="spellForm:new:evocation" style="padding:7px 13px;font-size:12.5px;">+ Своё заклинание</button>
      </div>
    </div>
    <div class="fae-rule"></div>
    ${renderSpellHeroTargetBar()}

    <div class="fae-ref-search-wrap" style="margin-bottom:12px;">
      <span class="fae-ref-search-icon">🔍</span>
      <input type="text" id="faeMagicHubSearch" class="fae-ref-search-input" value="${escapeAttr(window._faeMagicSearchQ || '')}" placeholder="Быстрый поиск любого заклинания по русскому или английскому названию (Fireball, Огненный шар, Wish, Туманный шаг), классу или урону..." autocomplete="off">
    </div>

    <div style="margin-bottom:8px;font-size:11.5px;color:#c9a45c;font-family:'Cinzel',serif;font-weight:700;">ФИЛЬТР ПО КРУГУ МАГИИ:</div>
    <div class="pill-row" style="margin-bottom:12px;">${levelPillsHtml}</div>

    <div style="margin-bottom:8px;font-size:11.5px;color:#c9a45c;font-family:'Cinzel',serif;font-weight:700;">ФИЛЬТР ПО КЛАССУ ЗАКЛИНАТЕЛЯ:</div>
    <div class="pill-row" style="margin-bottom:18px;">${classPillsHtml}</div>

    ${isFiltering ? `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
        <div style="font-size:13px;color:#c9a45c;font-family:'Cinzel',serif;">Найдено заклинаний: <b>${filteredSpells.length}</b></div>
        <button type="button" class="rc-btn" id="faeMagicResetFilters">✕ Сбросить фильтры и показать 8 школ</button>
      </div>
      ${renderSpellsGroupedByLevel(filteredSpells, true)}
    ` : `
      <div class="fae-ref-cards-grid">${items}</div>
    `}
  `;
}

function renderSchoolSpells(){
  const key = view.schoolKey;
  const school = MAGIC_SCHOOLS.find(s=>s.key===key);
  if(!school){ view = {screen:'magic'}; return renderMagicHub(); }

  var searchQ = (window._faeSchoolSearchQ || '').trim().toLowerCase();
  var lvlFilter = (window._faeSchoolLvlFilter !== undefined && window._faeSchoolLvlFilter !== null) ? window._faeSchoolLvlFilter : 'all';
  var clsFilter = window._faeSchoolClsFilter || 'Все классы';

  const allSchoolSpells = SPELLS.filter(s=>s.school===key);
  const filtered = allSchoolSpells.filter(function(sp){
    if(lvlFilter !== 'all' && String(sp.level) !== String(lvlFilter)) return false;
    if(clsFilter !== 'Все классы' && (sp.classes || '').toLowerCase().indexOf(clsFilter.toLowerCase()) === -1) return false;
    if(searchQ){
      var hay = [sp.name, sp.en, sp.classes, sp.meta, sp.effect].join(' ').toLowerCase();
      if(hay.indexOf(searchQ) === -1) return false;
    }
    return true;
  });

  var levelPills = [{k:'all', l:'Все (' + allSchoolSpells.length + ')'}];
  for(var lv=0; lv<=9; lv++){
    var cnt = allSchoolSpells.filter(function(s){ return Number(s.level) === lv; }).length;
    if(cnt > 0){
      levelPills.push({k:String(lv), l:(lv===0 ? 'Заговоры' : (lv + ' круг')) + ' (' + cnt + ')'});
    }
  }
  var levelPillsHtml = levelPills.map(function(p){
    return `<button type="button" class="fae-pill ${String(lvlFilter)===p.k?'active':''}" data-school-lvl="${p.k}">${p.l}</button>`;
  }).join('');

  var classPillsHtml = FAE_SPELL_CLASSES.map(function(cl){
    return `<button type="button" class="fae-pill ${clsFilter===cl?'active':''}" data-school-cls="${escapeAttr(cl)}">${cl === 'Все классы' ? '🧙 Все классы' : escapeHtml(cl)}</button>`;
  }).join('');

  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Книга заклинаний', nav:'magic'},{label:school.ru}])}
    <button class="back" data-go="magic">← Ко всем школам магии</button>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
      <div>
        <h1><span class="h1-icon">${schoolIconSvg(key)}</span>Школа: ${school.ru}</h1>
        <p class="subtitle">${escapeHtml(FAE_SCHOOL_DESCRIPTIONS[key] || 'Клик по карточке копирует название заклинания в буфер.')}</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <span class="fae-ref-header-badge">Показано: ${filtered.length} из ${allSchoolSpells.length}</span>
        <button class="btn btn-primary" data-go="spellForm:new:${key}" style="padding:7px 14px;font-size:12.5px;">+ Добавить заклинание</button>
      </div>
    </div>
    <div class="fae-rule"></div>
    ${renderSpellHeroTargetBar()}

    <div class="fae-ref-search-wrap" style="margin-bottom:12px;">
      <span class="fae-ref-search-icon">🔍</span>
      <input type="text" id="faeSchoolSpellSearch" class="fae-ref-search-input" value="${escapeAttr(window._faeSchoolSearchQ || '')}" placeholder="Поиск внутри школы «${escapeAttr(school.ru)}» по названию, английскому оригиналу, классу или эффекту..." autocomplete="off">
    </div>

    <div class="pill-row" style="margin-bottom:10px;">${levelPillsHtml}</div>
    <div class="pill-row" style="margin-bottom:18px;">${classPillsHtml}</div>

    ${renderSpellsGroupedByLevel(filtered, false)}
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
  const levelOptions = Array.from({length:10},(_,i)=>i).map(l=>`<option value="${l}" ${Number(s.level)===l?'selected':''}>${levelLabel(l)}</option>`).join('');

  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Книга заклинаний', nav:'magic'},{label:schoolName(s.school), nav:'schoolSpells:'+s.school},{label:s.name||'Новое заклинание'}])}
    <button class="back" data-go="schoolSpells:${s.school}">← Назад</button>
    <h1>${escapeHtml(s.name || 'Новое заклинание')}</h1>
    <p class="subtitle">Впишите или отредактируйте заклинание — оно сохранится в общей Книге заклинаний.</p>
    <div class="rule"></div>
    <div class="sheet-actions">
      <button class="btn-primary" id="saveSpellBtn">💾 Сохранить</button>
      ${isExisting ? '<button class="btn-ghost" id="deleteSpellBtn" style="color:var(--crimson-bright);border-color:var(--crimson-bright);">🗑 Удалить</button>' : ''}
    </div>
    <div id="spellFormRoot">
      <div class="sheet-grid" style="margin-bottom:16px;">
        <div class="field">
          <label>Название (RU)</label>
          <input type="text" data-sfield="name" value="${escapeAttr(s.name || '')}" placeholder="Напр. Огненный шар" style="font-size:17px;padding:10px 12px;">
        </div>
        <div class="field">
          <label>Оригинальное название (EN)</label>
          <input type="text" data-sfield="en" value="${escapeAttr(s.en || '')}" placeholder="Напр. Fireball" style="font-size:17px;padding:10px 12px;">
        </div>
      </div>
      <div class="sheet-grid" style="margin-bottom:16px;">
        <div class="field">
          <label>Школа магии</label>
          <select data-sfield="school">${schoolOptions}</select>
        </div>
        <div class="field">
          <label>Круг (Уровень)</label>
          <select data-sfield="level">${levelOptions}</select>
        </div>
      </div>
      <div class="sheet-grid" style="margin-bottom:16px;">
        <div class="field">
          <label>Доступно классам</label>
          <input type="text" data-sfield="classes" value="${escapeAttr(s.classes || '')}" placeholder="Напр. Волшебник, Чародей">
        </div>
        <div class="field">
          <label>Время • Дистанция • Длительность</label>
          <input type="text" data-sfield="meta" value="${escapeAttr(s.meta || '')}" placeholder="Напр. 1 действие • 150 фт • Мгновенно">
        </div>
      </div>
      <div class="field"><label>Эффект и полное описание</label><textarea data-sfield="effect" style="min-height:110px;">${escapeHtml(s.effect || '')}</textarea></div>
    </div>
  `;
}

function wireMagicScreens(){
  var heroSel = document.getElementById('faeSpellHeroSelect');
  if(heroSel){
    heroSel.addEventListener('change', function(){
      setActiveFaerunCharacter(this.value);
      render();
    });
  }

  var hubSearch = document.getElementById('faeMagicHubSearch');
  if(hubSearch){
    hubSearch.addEventListener('input', function(){
      window._faeMagicSearchQ = this.value;
      var pos = this.selectionStart;
      render();
      var next = document.getElementById('faeMagicHubSearch');
      if(next){
        next.focus();
        try{ next.setSelectionRange(pos, pos); }catch(e){}
      }
    });
  }

  document.querySelectorAll('[data-magic-lvl]').forEach(function(btn){
    btn.addEventListener('click', function(){
      window._faeMagicLvlFilter = btn.getAttribute('data-magic-lvl') || 'all';
      render();
    });
  });

  document.querySelectorAll('[data-magic-cls]').forEach(function(btn){
    btn.addEventListener('click', function(){
      window._faeMagicClsFilter = btn.getAttribute('data-magic-cls') || 'Все классы';
      render();
    });
  });

  var resetBtn = document.getElementById('faeMagicResetFilters');
  if(resetBtn){
    resetBtn.addEventListener('click', function(){
      window._faeMagicSearchQ = '';
      window._faeMagicLvlFilter = 'all';
      window._faeMagicClsFilter = 'Все классы';
      render();
    });
  }

  var schoolSearch = document.getElementById('faeSchoolSpellSearch');
  if(schoolSearch){
    schoolSearch.addEventListener('input', function(){
      window._faeSchoolSearchQ = this.value;
      var pos = this.selectionStart;
      render();
      var next = document.getElementById('faeSchoolSpellSearch');
      if(next){
        next.focus();
        try{ next.setSelectionRange(pos, pos); }catch(e){}
      }
    });
  }

  document.querySelectorAll('[data-school-lvl]').forEach(function(btn){
    btn.addEventListener('click', function(){
      window._faeSchoolLvlFilter = btn.getAttribute('data-school-lvl') || 'all';
      render();
    });
  });

  document.querySelectorAll('[data-school-cls]').forEach(function(btn){
    btn.addEventListener('click', function(){
      window._faeSchoolClsFilter = btn.getAttribute('data-school-cls') || 'Все классы';
      render();
    });
  });

  document.querySelectorAll('.spell-add-hero-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var spId = btn.getAttribute('data-spell-hero-id');
      var sp = SPELLS.find(function(x){ return x.id === spId; });
      var hero = getActiveFaerunCharacter();
      if(!sp || !hero) return;
      if(!Array.isArray(hero.techs)) hero.techs = [];
      if(isSpellInHeroTechs(hero, sp)) return;
      var rollInfo = extractSpellRoll(sp.effect || '');
      hero.techs.unshift({
        id: genId(),
        spellId: sp.id,
        name: '✨ ' + sp.name + (sp.en ? (' (' + sp.en + ')') : ''),
        category: 'Магические и Сверхъестественные дары',
        source: schoolName(sp.school) + ' • ' + levelLabel(sp.level) + (sp.classes ? (' (' + sp.classes + ')') : ''),
        actionCost: (sp.meta || '').split('•')[0]?.trim() || '1 действие',
        cooldown: Number(sp.level) === 0 ? 'Заговор (Неограниченно)' : ('Ячейка ' + sp.level + '-го круга'),
        checkOrSave: rollInfo ? rollInfo.formula : '',
        desc: (sp.meta ? ('[' + sp.meta + ']\n') : '') + (sp.effect || '')
      });
      saveCharactersToStorage();
      btn.textContent = '✓ В способностях (' + (hero.name || 'Герой') + ')';
      btn.style.background = 'rgba(16,185,129,0.15)';
      btn.style.borderColor = 'rgba(16,185,129,0.45)';
      btn.style.color = '#6ee7b7';
      btn.disabled = true;
    });
  });
}

var FAE_CLASS_ROLES = [
  { key: 'all', label: 'Все классы', icon: '⚔️' },
  { key: 'martial', label: 'Воинские классы', icon: '🗡️' },
  { key: 'caster', label: 'Полные заклинатели', icon: '✨' },
  { key: 'halfcaster', label: 'Полузаклинатели и Пакт', icon: '🛡️' }
];

function subclassFeatureCard(f, sourceLabel){
  if(f.isLink){
    return `
      <div class="card" data-go="${f.linkTo}" style="border-color:rgba(201,164,92,0.5);cursor:pointer;">
        <div class="top-row">
          <div class="name">✨ ${f.ru}</div>
          <div class="die-badge">Ур. ${f.level}</div>
        </div>
        ${f.en ? `<div class="eng">${escapeHtml(f.en)}</div>` : ''}
        <div class="desc">${f.desc}</div>
      </div>`;
  }
  const srcText = (sourceLabel ? (sourceLabel + ' • ') : '') + 'Ур. ' + f.level;
  const rollFormula = f.roll ? ('1d' + f.roll.sides) : '';
  return `
    <div class="card" data-copy="${escapeAttr(f.ru)}">
      <div class="top-row">
        <div class="name">${f.ru}</div>
        <div class="die-badge">Ур. ${f.level}</div>
      </div>
      ${f.en ? `<div class="eng">${escapeHtml(f.en)}</div>` : ''}
      <div class="desc">${f.desc}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px;padding-top:8px;border-top:1px solid rgba(201,164,92,0.14);">
        ${renderAddTechAndMoveBtns({
          title: f.ru,
          en: f.en || '',
          desc: f.desc || '',
          source: srcText,
          roll: rollFormula,
          bonus: rollFormula || 'По правилам класса',
          weapon: sourceLabel || 'Классовая техника',
          mastery: f.en || '',
          techCat: 'Классовые умения',
          moveCat: 'Особые удары, Захваты и Толчки',
          moveFirst: false
        })}
      </div>
      <div class="stamp"><span>Скопировано</span></div>
    </div>`;
}

function renderClassesHub(){
  var classKeys = Object.keys(DATA || {});
  var activeRole = window._faeClassRoleFilter || 'all';
  var searchQ = (window._faeClassSearchQ || '').trim().toLowerCase();

  var totalSubs = 0;
  classKeys.forEach(function(k){
    var c = DATA[k];
    if(c && c.subclasses) totalSubs += Object.keys(c.subclasses).length;
  });

  var pillsHtml = FAE_CLASS_ROLES.map(function(r){
    var cnt = r.key === 'all'
      ? classKeys.length
      : classKeys.filter(function(k){ return DATA[k] && DATA[k].role === r.key; }).length;
    return '<button type="button" class="fae-pill ' + (activeRole === r.key ? 'active' : '') + '" data-fae-cls-role="' + escapeAttr(r.key) + '">' +
      r.icon + ' ' + escapeHtml(r.label) + ' <span style="opacity:0.75;font-size:11px;">(' + cnt + ')</span>' +
    '</button>';
  }).join('');

  var filteredKeys = classKeys.filter(function(k){
    var cls = DATA[k];
    if(!cls) return false;
    if(activeRole !== 'all' && cls.role !== activeRole) return false;
    if(searchQ){
      var subText = Object.keys(cls.subclasses || {}).map(function(sk){
        var sb = cls.subclasses[sk];
        return [sb.name, sb.en, sb.shortDesc, sb.lore].join(' ');
      }).join(' ');
      var featText = (cls.baseFeatures || []).map(function(bf){ return bf.ru + ' ' + (bf.en || ''); }).join(' ');
      var hay = [cls.name, cls.en, cls.roleLabel, cls.primaryAbility, cls.saves, cls.summary, subText, featText].join(' ').toLowerCase();
      if(hay.indexOf(searchQ) === -1) return false;
    }
    return true;
  });

  var cardsHtml = filteredKeys.length ? (
    '<div class="fae-ref-cards-grid">' +
      filteredKeys.map(function(k){
        var cls = DATA[k];
        var subKeys = Object.keys(cls.subclasses || {});
        var subPills = subKeys.map(function(sk){
          var sb = cls.subclasses[sk];
          return '<button type="button" class="rc-btn" data-go="subclass:' + escapeAttr(k) + ':' + escapeAttr(sk) + '" style="font-size:11.5px;padding:4px 9px;background:rgba(15,23,42,0.85);border-color:rgba(201,164,92,0.32);" title="' + escapeAttr(sb.shortDesc || sb.name) + '">' +
            (sb.icon ? (sb.icon + ' ') : '') + escapeHtml(sb.name) +
          '</button>';
        }).join('');

        return '<div class="fae-ref-card" data-cls-card-open="' + escapeAttr(k) + '" style="display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;border-color:rgba(201,164,92,0.35);">' +
          '<div>' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;">' +
              '<div class="fae-ref-card-k" style="font-size:20px;margin:0;">' + (cls.icon || '⚔️') + ' ' + escapeHtml(cls.name) + ' <span style="font-size:13px;color:#94a3b8;font-weight:400;">(' + escapeHtml(cls.en || k) + ')</span></div>' +
              '<span class="fae-ref-item-tag">🎲 ' + escapeHtml(cls.hitDie || '1d8') + '</span>' +
            '</div>' +
            '<div style="font-size:11.5px;color:#c9a45c;font-family:\'Cinzel\',serif;font-weight:700;margin-bottom:10px;letter-spacing:0.04em;">' +
              escapeHtml(cls.roleLabel || 'Класс D&D 5e / 2024') +
            '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;font-size:11.5px;color:#cbd5e1;font-family:\'JetBrains Mono\',monospace;">' +
              '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;">⚡ Хар-ка: ' + escapeHtml(cls.primaryAbility || '—') + '</span>' +
              '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;color:#fde68a;">🛡️ Спас: ' + escapeHtml(cls.saves || '—') + '</span>' +
              (cls.spellcasting && cls.spellcasting.enabled ? '<span style="background:rgba(15,23,42,0.75);border:1px solid rgba(201,164,92,0.25);padding:2px 7px;border-radius:4px;color:#7dd3fc;">✨ Заклинатель</span>' : '') +
            '</div>' +
            '<div class="fae-ref-card-v" style="margin-bottom:12px;">' + escapeHtml(cls.summary || '') + '</div>' +
            '<div style="margin-bottom:12px;padding:10px 12px;background:rgba(10,14,22,0.65);border:1px solid rgba(201,164,92,0.2);border-radius:6px;">' +
              '<div style="font-size:11px;color:#c9a45c;font-family:\'Cinzel\',serif;font-weight:700;margin-bottom:6px;letter-spacing:0.05em;">🏛️ ПОДКЛАССЫ И АРХЕТИПЫ (' + subKeys.length + '):</div>' +
              '<div style="display:flex;flex-wrap:wrap;gap:6px;">' + subPills + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid rgba(201,164,92,0.18);">' +
            '<span style="font-size:12px;color:#94a3b8;">📜 Базовых умений: <b style="color:#e2e8f0;">' + ((cls.baseFeatures || []).length) + '</b> (1–20 ур.)</span>' +
            '<button type="button" class="btn btn-primary" data-go="class:' + escapeAttr(k) + '" style="padding:6px 14px;font-size:12.5px;">Открыть класс →</button>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>'
  ) : '<div class="char-empty">По вашему запросу классы не найдены. Попробуйте сбросить фильтр или изменить поисковый запрос.</div>';

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Справочник', nav:'faeRef'}, {label:'Классы и Архетипы D&D'}]) +
    '<button class="back" data-go="faeRef">← В справочник Фаэруна</button>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
      '<div>' +
        '<h1>⚔️ Классы и Подклассы D&D 5e / 2024</h1>' +
        '<p class="subtitle">Полная энциклопедия всех ' + classKeys.length + ' классов и ' + totalSubs + ' архетипов: хиты, владения, базовые умения 1–20 уровня и способности каждого подкласса.</p>' +
      '</div>' +
      '<span class="fae-ref-header-badge">📚 ' + classKeys.length + ' классов • ' + totalSubs + ' подклассов</span>' +
    '</div>' +
    '<div class="fae-rule"></div>' +

    '<div class="fae-ref-search-wrap" style="margin-bottom:14px;">' +
      '<span class="fae-ref-search-icon">🔍</span>' +
      '<input type="text" id="faeClassesSearchInp" class="fae-ref-search-input" value="' + escapeAttr(window._faeClassSearchQ || '') + '" placeholder="Поиск по названию класса, подкласса (напр. Паладин, Певец клинка, Домен Сумерек, Берсерк) или умению..." autocomplete="off">' +
    '</div>' +

    '<div class="pill-row" style="margin-bottom:18px;">' + pillsHtml + '</div>' +
    cardsHtml;
}

function renderClass(){
  const clsKey = view.cls;
  if(!clsKey || !DATA[clsKey]){
    return renderClassesHub();
  }
  const cls = DATA[clsKey];
  const allClassKeys = Object.keys(DATA);
  const subKeys = Object.keys(cls.subclasses || {});
  const baseFeatures = [...(cls.baseFeatures || [])].sort((a,b)=>a.level-b.level);

  const classSwitchPills = allClassKeys.map(k=>{
    const c = DATA[k];
    return `<button type="button" class="fae-pill ${k===clsKey?'active':''}" data-go="class:${k}">${c.icon||'⚔️'} ${escapeHtml(c.name)}</button>`;
  }).join('');

  const subclassCards = subKeys.map(sk=>{
    const sb = cls.subclasses[sk];
    const fCount = (sb.features || []).length;
    const extraManBtn = (clsKey === 'fighter' && sk === 'battlemaster')
      ? `<button type="button" class="rc-btn" data-go="sub:fighter:battlemaster" style="margin-top:8px;border-color:#c9a45c;color:#fde68a;">🎯 Открыть все 23 манёвра Мастера боя →</button>`
      : '';
    return `
      <div class="fae-ref-card" data-sub-card-open="subclass:${clsKey}:${sk}" style="display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;border-color:rgba(201,164,92,0.4);">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px;">
            <div class="fae-ref-card-k" style="font-size:18px;margin:0;">${sb.icon || cls.icon || '⚔️'} ${escapeHtml(sb.name)}</div>
            <span class="fae-ref-item-tag">${fCount} умений</span>
          </div>
          ${sb.en ? `<div style="font-size:12px;color:#94a3b8;font-style:italic;margin-bottom:8px;">${escapeHtml(sb.en)}</div>` : ''}
          <div class="fae-ref-card-v" style="margin-bottom:8px;color:#f8fafc;font-weight:600;">${escapeHtml(sb.shortDesc || '')}</div>
          ${sb.lore ? `<div style="font-size:13px;color:#cbd5e1;line-height:1.5;margin-bottom:10px;">${escapeHtml(sb.lore)}</div>` : ''}
          ${extraManBtn}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;margin-top:6px;border-top:1px solid rgba(201,164,92,0.18);">
          <span style="font-size:11.5px;color:#c9a45c;font-family:'Cinzel',serif;font-weight:700;">Архетип класса ${escapeHtml(cls.name)}</span>
          <button type="button" class="btn btn-primary" data-go="subclass:${clsKey}:${sk}" style="padding:5px 12px;font-size:12px;">Умения подкласса →</button>
        </div>
      </div>`;
  }).join('');

  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Классы D&D', nav:'classes'},{label:cls.name}])}
    <button class="back" data-go="classes">← Ко всем классам D&D</button>
    ${renderSpellHeroTargetBar()}

    <div class="pill-row" style="margin-bottom:16px;">${classSwitchPills}</div>

    <div class="fae-ref-card" style="padding:22px;border-color:rgba(201,164,92,0.5);margin-bottom:22px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
        <div>
          <span class="fae-ref-item-tag">${escapeHtml(cls.roleLabel || 'Класс D&D 5e / 2024')}</span>
          <h1 style="margin:8px 0 2px 0;font-size:28px;">${cls.icon || '⚔️'} ${escapeHtml(cls.name)} <span style="font-size:17px;color:#94a3b8;font-weight:400;">(${escapeHtml(cls.en || clsKey)})</span></h1>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="btn btn-primary" id="btnApplyClassToHero" data-apply-cls="${escapeAttr(cls.name)}" title="Установить этот класс, кость хитов, спасброски и владения активному герою">⚡ Выбрать класс для героя</button>
        </div>
      </div>

      <p style="font-size:15px;color:#e2e8f0;line-height:1.6;margin:10px 0 16px 0;">${escapeHtml(cls.summary || '')}</p>

      <div class="fae-gen-stat-grid" style="margin-bottom:14px;">
        <div class="fae-gen-stat-box"><span class="lbl">🎲 Кость хитов</span><span class="val">${escapeHtml(cls.hitDie || '1d8')} за уровень</span></div>
        <div class="fae-gen-stat-box"><span class="lbl">⚡ Осн. характеристика</span><span class="val">${escapeHtml(cls.primaryAbility || '—')}</span></div>
        <div class="fae-gen-stat-box"><span class="lbl">🛡️ Спасброски</span><span class="val">${escapeHtml(cls.saves || '—')}</span></div>
        <div class="fae-gen-stat-box"><span class="lbl">🥋 Владение бронёй</span><span class="val">${escapeHtml(cls.armorProf || '—')}</span></div>
        <div class="fae-gen-stat-box"><span class="lbl">🗡️ Владение оружием</span><span class="val">${escapeHtml(cls.weaponProf || '—')}</span></div>
        <div class="fae-gen-stat-box"><span class="lbl">✨ Колдовство / Магия</span><span class="val">${escapeHtml((cls.spellcasting && cls.spellcasting.label) || 'Нет')}</span></div>
      </div>

      <div style="font-size:13px;color:#cbd5e1;padding:10px 14px;background:rgba(10,14,22,0.7);border-left:3px solid #c9a45c;border-radius:4px;">
        <b style="color:#c9a45c;">🎯 Навыки класса на 1 уровне:</b> ${escapeHtml(cls.skillsInfo || '—')}
        ${cls.toolProf && cls.toolProf !== 'Нет' ? `<br><b style="color:#c9a45c;">🧰 Инструменты:</b> ${escapeHtml(cls.toolProf)}` : ''}
      </div>
    </div>

    <div class="section-label">🏛️ Подклассы и Архетипы класса «${escapeHtml(cls.name)}» (${subKeys.length})</div>
    <p style="font-size:13.5px;color:var(--ink-dim);margin:-6px 0 14px;">Нажмите на карточку любого подкласса, чтобы открыть все его уникальные умения по уровням.</p>
    <div class="fae-ref-cards-grid" style="margin-bottom:28px;">
      ${subclassCards}
    </div>

    <div class="section-label">📜 Базовые классовые умения: ${escapeHtml(cls.name)} (1–20 уровень)</div>
    <p style="font-size:13.5px;color:var(--ink-dim);margin:-6px 0 14px;">Клик по карточке копирует название умения; кнопка «+ В способности героя» сразу сохраняет умение в профиль вашего персонажа.</p>
    <div class="grid" style="margin-bottom:24px;">
      ${baseFeatures.map(f=>subclassFeatureCard(f, cls.name)).join('')}
    </div>

    <div class="section-label">Справочники</div>
    <div class="menu-list">
      <div class="menu-item util" data-go="glossary">
        <div>
          <div class="name">Справочник фехтовальных терминов и оружия</div>
          <div class="desc">Стойки, атаки и понятия боя разным оружием</div>
        </div>
        <div class="arrow">→</div>
      </div>
    </div>
  `;
}

function renderSubclassFeatures(){
  const clsKey = view.clsKey, subKey = view.subKey;
  const cls = DATA[clsKey];
  const sub = cls && cls.subclasses ? cls.subclasses[subKey] : null;
  if(!sub){
    view = {screen:'class', cls:clsKey};
    return renderClass();
  }
  const features = [...(sub.features || [])].sort((a,b)=>a.level-b.level);
  const siblingPills = Object.keys(cls.subclasses || {}).map(sk=>{
    const sb = cls.subclasses[sk];
    return `<button type="button" class="fae-pill ${sk===subKey?'active':''}" data-go="subclass:${clsKey}:${sk}">${sb.icon||cls.icon||'⚔️'} ${escapeHtml(sb.name)}</button>`;
  }).join('');

  let extraManeuversHtml = '';
  if(clsKey === 'fighter' && subKey === 'battlemaster' && Array.isArray(sub.maneuvers)){
    const maneuverCard = (m)=>{
      return `
      <div class="card" data-copy="${escapeAttr(m.ru)}">
        <div class="top-row">
          <div class="name">${m.ru}</div>
          <div class="die-badge">${m.die}</div>
        </div>
        <div class="eng">${m.en}</div>
        <div class="desc">${m.desc}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;padding-top:8px;border-top:1px solid rgba(201,164,92,0.14);">
          ${renderAddTechAndMoveBtns({
            title: m.ru,
            en: m.en || '',
            desc: m.desc || '',
            source: 'Воин (Мастер боя) • Кость ' + m.die,
            roll: m.die,
            bonus: '1 кость превосходства ' + m.die,
            weapon: 'Любое оружие',
            mastery: 'Боевое превосходство (' + m.die + ')',
            techCat: 'Классовые умения',
            moveCat: 'Приёмы Боевого Мастера (Maneuvers)',
            moveFirst: true
          })}
        </div>
        <div class="stamp"><span>Скопировано</span></div>
      </div>`;
    };
    const groupSection = (title, cat, list)=>{
      const items = (list || []).filter(m=>m.cat===cat);
      if(!items.length) return '';
      return `<div class="section-label">${title}</div><div class="grid">${items.map(maneuverCard).join('')}</div>`;
    };
    extraManeuversHtml = `
      <div class="fae-rule" style="margin-top:26px;"></div>
      <h2>🎯 Все 23 Боевых Приёма (Манёвры Мастера Боя)</h2>
      <p class="subtitle">Клик по карточке копирует название приёма; кнопки ниже позволяют сразу добавить любой манёвр в «Боевые приёмы» или «Способности» активного героя.</p>
      ${groupSection('Атакующие манёвры', 'offense', sub.maneuvers)}
      ${groupSection('Защитные манёвры', 'defense', sub.maneuvers)}
      ${groupSection('Тактические и социальные манёвры', 'tactics', sub.maneuvers)}
      <div class="section-label">Дополнительно (Tasha's Cauldron of Everything)</div>
      ${groupSection('Атакующие (Tasha)', 'offense', sub.extraManeuvers)}
      ${groupSection('Защитные (Tasha)', 'defense', sub.extraManeuvers)}
    `;
  }

  return `
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Классы D&D', nav:'classes'},{label:cls.name, nav:'class:'+clsKey},{label:sub.name}])}
    <button class="back" data-go="class:${clsKey}">← Назад к классу «${escapeHtml(cls.name)}»</button>
    ${renderSpellHeroTargetBar()}

    <div class="pill-row" style="margin-bottom:16px;">${siblingPills}</div>

    <div class="fae-ref-card" style="padding:22px;border-color:rgba(201,164,92,0.5);margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
        <div>
          <span class="fae-ref-item-tag">${cls.icon || '⚔️'} Подкласс класса «${escapeHtml(cls.name)}»</span>
          <h1 style="margin:8px 0 2px 0;font-size:26px;">${sub.icon || cls.icon || '⚔️'} ${escapeHtml(sub.name)} ${sub.en ? `<span style="font-size:16px;color:#94a3b8;font-weight:400;">(${escapeHtml(sub.en)})</span>` : ''}</h1>
        </div>
        <button type="button" class="btn btn-primary" id="btnApplySubclassToHero" data-apply-cls="${escapeAttr(cls.name)}" data-apply-sub="${escapeAttr(sub.name)}">⚡ Выбрать этот подкласс герою</button>
      </div>
      ${sub.shortDesc ? `<div style="font-size:14.5px;color:#fde68a;font-weight:600;margin-top:8px;">${escapeHtml(sub.shortDesc)}</div>` : ''}
      ${sub.lore ? `<p style="font-size:14.5px;color:#cbd5e1;line-height:1.55;margin:8px 0 0 0;">${escapeHtml(sub.lore)}</p>` : ''}
    </div>

    <div class="section-label">✨ Умения архетипа «${escapeHtml(sub.name)}» по уровням</div>
    <div class="grid">${features.map(f=>subclassFeatureCard(f, cls.name + ' (' + sub.name + ')')).join('')}</div>
    ${extraManeuversHtml}
  `;
}

function renderSub(){
  const sub = DATA.fighter.subclasses.battlemaster;
  const maneuverCard = (m)=>{
    return `
    <div class="card" data-copy="${escapeAttr(m.ru)}">
      <div class="top-row">
        <div class="name">${m.ru}</div>
        <div class="die-badge">${m.die}</div>
      </div>
      <div class="eng">${m.en}</div>
      <div class="desc">${m.desc}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;padding-top:8px;border-top:1px solid rgba(201,164,92,0.14);">
        ${renderAddTechAndMoveBtns({
          title: m.ru,
          en: m.en || '',
          desc: m.desc || '',
          source: 'Воин (Мастер боя) • Кость ' + m.die,
          roll: m.die,
          bonus: '1 кость превосходства ' + m.die,
          weapon: 'Любое оружие',
          mastery: 'Боевое превосходство (' + m.die + ')',
          techCat: 'Классовые умения',
          moveCat: 'Приёмы Боевого Мастера (Maneuvers)',
          moveFirst: true
        })}
      </div>
      <div class="stamp"><span>Скопировано</span></div>
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
    ${renderCrumb([{label:'Фаэрун', nav:'home'},{label:'Справочник', nav:'faeRef'},{label:'Классы D&D', nav:'classes'},{label:'Воин', nav:'class:fighter'},{label:'Мастер боя'}])}
    <button class="back" data-go="subclass:fighter:battlemaster">← К описанию подкласса «Мастер боя»</button>
    <h1>🎯 Приёмы Мастера боя (23 манёвра)</h1>
    <p class="subtitle">Клик по карточке копирует название приёма; кнопки ниже позволяют сразу добавить манёвр в «Боевые приёмы» или «Способности» активного героя.</p>
    <div class="rule"></div>
    ${renderSpellHeroTargetBar()}
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

function wireFaeClasses(){
  var heroSel = document.getElementById('faeSpellHeroSelect');
  if(heroSel){
    heroSel.addEventListener('change', function(){
      setActiveFaerunCharacter(this.value);
      render();
    });
  }

  document.querySelectorAll('[data-fae-cls-role]').forEach(function(btn){
    btn.addEventListener('click', function(){
      window._faeClassRoleFilter = btn.getAttribute('data-fae-cls-role') || 'all';
      render();
    });
  });

  var sInp = document.getElementById('faeClassesSearchInp');
  if(sInp){
    sInp.addEventListener('input', function(){
      window._faeClassSearchQ = this.value;
      var pos = this.selectionStart;
      render();
      var nextInp = document.getElementById('faeClassesSearchInp');
      if(nextInp){
        nextInp.focus();
        try{ nextInp.setSelectionRange(pos, pos); }catch(e){}
      }
    });
  }

  document.querySelectorAll('[data-cls-card-open]').forEach(function(card){
    card.addEventListener('click', function(e){
      if(e.target.closest('button') || e.target.closest('[data-go]')) return;
      navigate('class:' + card.getAttribute('data-cls-card-open'));
    });
  });

  document.querySelectorAll('[data-sub-card-open]').forEach(function(card){
    card.addEventListener('click', function(e){
      if(e.target.closest('button') || e.target.closest('[data-go]')) return;
      navigate(card.getAttribute('data-sub-card-open'));
    });
  });

  var applyClsBtn = document.getElementById('btnApplyClassToHero');
  if(applyClsBtn){
    applyClsBtn.addEventListener('click', function(){
      var d = getActiveFaerunCharacter();
      if(!d) return;
      var clsName = applyClsBtn.getAttribute('data-apply-cls') || 'Воин';
      d.className = clsName;
      var def = FAE_CLASS_DEFAULTS[clsName];
      if(def){
        d.hitDiceType = def.hd;
        d.hitDiceTotal = d.level || 1;
        ABILITY_KEYS.forEach(function(k){ d.saveProf[k] = def.saves.indexOf(k) !== -1; });
        d.profArmor = def.armor;
        d.profWeapons = def.weapons;
        d.spellEnabled = def.spell;
        d.spellAbility = def.spellAb;
      }
      saveCharactersToStorage();
      if(typeof paintShBar === 'function') paintShBar();
      applyClsBtn.textContent = '✓ Класс «' + clsName + '» применён (' + (d.name || 'Герой') + ')!';
    });
  }

  var applySubBtn = document.getElementById('btnApplySubclassToHero');
  if(applySubBtn){
    applySubBtn.addEventListener('click', function(){
      var d = getActiveFaerunCharacter();
      if(!d) return;
      var clsName = applySubBtn.getAttribute('data-apply-cls') || d.className || 'Воин';
      var subName = applySubBtn.getAttribute('data-apply-sub') || '';
      d.className = clsName;
      d.subclass = subName;
      var def = FAE_CLASS_DEFAULTS[clsName];
      if(def){
        d.hitDiceType = def.hd;
        d.hitDiceTotal = d.level || 1;
        ABILITY_KEYS.forEach(function(k){ d.saveProf[k] = def.saves.indexOf(k) !== -1; });
        d.profArmor = def.armor;
        d.profWeapons = def.weapons;
        d.spellEnabled = def.spell;
        d.spellAbility = def.spellAb;
      }
      saveCharactersToStorage();
      if(typeof paintShBar === 'function') paintShBar();
      applySubBtn.textContent = '✓ Назначено: ' + clsName + ' — ' + subName + '!';
    });
  }

  document.querySelectorAll('[data-add-class-tech-name]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var hero = getActiveFaerunCharacter();
      if(!hero) return;
      if(!Array.isArray(hero.techs)) hero.techs = [];
      var name = btn.getAttribute('data-add-class-tech-name') || 'Классовое умение';
      if(isItemInHeroTechsByName(hero, name)) return;
      var cat = btn.getAttribute('data-add-class-tech-cat') || 'Классовые умения';
      var src = btn.getAttribute('data-add-class-tech-src') || 'Класс D&D';
      var desc = btn.getAttribute('data-add-class-tech-desc') || '';
      var roll = btn.getAttribute('data-add-class-tech-roll') || '';
      hero.techs.unshift({
        id: genId(),
        name: name,
        category: cat,
        source: src,
        actionCost: 'По описанию умения',
        cooldown: 'По правилам класса',
        checkOrSave: roll,
        desc: desc
      });
      saveCharactersToStorage();
      btn.textContent = '✓ В способностях (' + (hero.name || 'Герой') + ')';
      btn.style.background = 'rgba(16,185,129,0.15)';
      btn.style.borderColor = 'rgba(16,185,129,0.45)';
      btn.style.color = '#6ee7b7';
      btn.disabled = true;
    });
  });

  document.querySelectorAll('[data-add-class-move-name]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var hero = getActiveFaerunCharacter();
      if(!hero) return;
      if(!Array.isArray(hero.moves)) hero.moves = [];
      var name = btn.getAttribute('data-add-class-move-name') || 'Боевой приём';
      if(isItemInHeroMovesByName(hero, name)) return;
      var cat = btn.getAttribute('data-add-class-move-cat') || 'Особые удары, Захваты и Толчки';
      var wpn = btn.getAttribute('data-add-class-move-weapon') || 'Любое оружие';
      var bonus = btn.getAttribute('data-add-class-move-bonus') || '';
      var mastery = btn.getAttribute('data-add-class-move-mastery') || '';
      hero.moves.unshift({
        id: genId(),
        name: name,
        category: cat,
        weaponOrStyle: wpn,
        attackBonus: bonus || 'По характеристике',
        damageOrSave: bonus || 'По описанию приёма',
        mastery: mastery,
        actionCost: 'При атаке / Бонусное / Реакция',
        desc: btn.getAttribute('data-add-class-move-desc') || ''
      });
      saveCharactersToStorage();
      btn.textContent = '✓ В приёмах (' + (hero.name || 'Герой') + ')';
      btn.style.background = 'rgba(16,185,129,0.15)';
      btn.style.borderColor = 'rgba(16,185,129,0.45)';
      btn.style.color = '#6ee7b7';
      btn.disabled = true;
    });
  });
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
var FAE_GEN_HINTS_COLLAPSED_KEY = 'ttc_fae_gen_hints_collapsed';

function getSavedFaeGenHintsCollapsed(){
  try{
    return localStorage.getItem(FAE_GEN_HINTS_COLLAPSED_KEY) === '1';
  }catch(e){ return false; }
}

function toggleFaeGenHintsDock(forceState){
  var dock = document.getElementById('faeGenHintsDock');
  var isCol = typeof forceState === 'boolean' ? forceState : !(dock && dock.classList.contains('collapsed'));
  try{
    localStorage.setItem(FAE_GEN_HINTS_COLLAPSED_KEY, isCol ? '1' : '0');
  }catch(e){}
  if(dock){
    dock.classList.toggle('collapsed', isCol);
  }
}

var FAE_GEN_THINKING_MODES = [
  {
    key: 'deep_lore',
    icon: '🧠',
    title: 'Глубокий канон и синтез',
    desc: 'ИИ сам достраивает лор Фаэруна, Плетение и недостающие детали под ваш замысел',
    prompt: 'РЕЖИМ МЫШЛЕНИЯ ИИ — «Глубокий канон и творческий синтез»: Не ограничивайся буквальным пересказом запроса. Самостоятельно продумай причинно-следственные связи, лор Забытых Королевств (божества, фракции, историю Нетерила/Кормантора/Побережья Мечей, работу Плетения Мистры) и сбалансируй все не указанные пользователем параметры так, чтобы результат ощущался как часть официальной книги D&D 2024.'
  },
  {
    key: 'creative_unleashed',
    icon: '🔥',
    title: 'Свободный полёт фантазии',
    desc: 'Нестандартные авторские механики, уникальные синергии и смелые решения вне шаблонов',
    prompt: 'РЕЖИМ МЫШЛЕНИЯ ИИ — «Свободный полёт фантазии»: Выйди за рамки скучных стандартных бонусов (+1/+2). Придумай по-настоящему уникальную, запоминающуюся механику, кинематографичное взаимодействие со средой, необычные триггеры, фазы или синергии со способностями героя.'
  },
  {
    key: 'raw_strict',
    icon: '⚖️',
    title: 'Строгий стандарт RAW 2024',
    desc: 'Выверенная математика правил PHB / DMG / MM 2024, точные формулировки и баланс',
    prompt: 'РЕЖИМ МЫШЛЕНИЯ ИИ — «Строгий стандарт правил D&D 2024 (RAW)»: Строго соблюдай терминологию, экономику действий (Action, Bonus Action, Reaction), формулы СЛ спасбросков, Мастерство оружия (Weapon Mastery) и баланс урона по стандартам Player\'s Handbook 2024 и Dungeon Master\'s Guide 2024.'
  },
  {
    key: 'dark_twist',
    icon: '🕯️',
    title: 'Тёмное фэнтези и цена силы',
    desc: 'Драматизм, проклятия, моральные дилеммы, риск и двойное дно у каждого дара',
    prompt: 'РЕЖИМ МЫШЛЕНИЯ ИИ — «Тёмное фэнтези и цена силы»: Добавь густую мрачную атмосферу, драматическую неоднозначность, скрытую цену могущества, искушение, шрамы Сумеречного Плетения или тяжёлый моральный выбор без простых ответов.'
  }
];

var FAE_GEN_CATEGORIES = [
  {
    key: 'quest',
    icon: '📜',
    title: 'Квест и Сюжет',
    sub: 'Заказы, приключения, тайны и награды',
    themeLabel: 'Свободное описание вашей идеи, завязки или сцены приключения',
    themePlaceholder: 'Опишите задумку своими словами в любом объёме — от одной фразы до целого абзаца...\nНапример: «В Нижнем Городе Врат Балдура один за другим пропадают кузнецы, работавшие с метеоритным железом. На месте исчезновений остаются оплавленные руны Гонда и перья механических птиц...»',
    reqPlaceholder: 'Любые точечные пожелания по механикам, СЛ проверок, конкретным боссам или награде (необязательно)...',
    guideQuestions: [
      'Какое странное событие или беда вынуждает героев вмешаться прямо сейчас?',
      'В чём скрытый мотив заказчика — говорит ли он всю правду?',
      'Какой сложный моральный выбор или поворот ждёт отряд в финале?'
    ],
    hintHooks: [
      { label: 'Двойное дно заказчика', text: 'Заказчик скрывает свою истинную вину в происходящем и пытается руками героев замести следы.' },
      { label: 'Таймер катастрофы', text: 'События развиваются по часам: если отряд медлит, ритуал завершится и обстановка в регионе необратимо изменится.' },
      { label: 'Аномалия Плетения', text: 'В зоне приключения повреждено Плетение Мистры — заклинания вызывают необычные побочные проявления.' },
      { label: 'Мирный или хитрый исход', text: 'Финального столкновения можно избежать через расследование улик, шантаж или знание древнего обычая.' }
    ]
  },
  {
    key: 'npc',
    icon: '🎭',
    title: 'НПС и Персонаж',
    sub: 'Союзники, торговцы, злодеи и покровители',
    themeLabel: 'Свободное описание образа, характера или роли НПС',
    themePlaceholder: 'Опишите, кто этот персонаж, как он выглядит, говорит или какую роль играет в вашей истории...\nНапример: «Уставший эльф-архивариус из Свечецитадели, который тайно скупает проклятые фолианты Нетерила, чтобы спасти душу своей сестры...»',
    reqPlaceholder: 'Точечные детали: конкретный класс, заклинания, инвентарь на продажу или отношение к герою (необязательно)...',
    guideQuestions: [
      'Какая деталь внешности, голоса или привычка сразу врезается в память игрокам?',
      'Чего этот персонаж отчаянно хочет добиться и чего больше всего боится?',
      'Какую тайну он скрывает за дружелюбной или грозной маской?'
    ],
    hintHooks: [
      { label: 'Харизматичная манера речи', text: 'Имеет яркую речевую особенность, необычные поговорки Фаэруна и запоминающийся тембр голоса.' },
      { label: 'Должник опасной гильдии', text: 'Тайно связан кабальным договором с Жентаримом или дьяволом Баатора и ищет способ освободиться.' },
      { label: 'Хранитель редких услуг', text: 'Может предложить отряду уникальные услуги, редкие товары, слухи или доступ в закрытые круги города.' },
      { label: 'Скрытая боевая мощь', text: 'Выглядит мирно и неприметно, но в прошлом был ветераном громкой кампании со своими шрамами и трофеями.' }
    ]
  },
  {
    key: 'weapon',
    icon: '⚔️',
    title: 'Оружие (2024)',
    sub: 'Мечи, луки, топоры и Мастерство оружия',
    themeLabel: 'Свободное описание концепта, внешнего вида и чар оружия',
    themePlaceholder: 'Опишите образ оружия, его историю или желаемый стиль боя — ИИ сам подберёт подходящий тип, редкость и баланс D&D 2024...\nНапример: «Парный клинок из вороненого серебра, который принадлежал охотнику на магов: поглощает часть энергии вражеских чар и вспыхивает холодным синим пламенем при критическом ударе...»',
    reqPlaceholder: 'Точечные пожелания по костям урона, зарядам, спасброскам или привязке к классу героя (необязательно)...',
    guideQuestions: [
      'Кто и для какой цели выковал это оружие (дварфы, эльфы Кормантора, кузни Авернуса)?',
      'Как оружие выглядит и звучит в момент удара или пробуждения магии?',
      'Какой тактический приём оно поощряет (криты, защита, мобильность, контроль)?'
    ],
    hintHooks: [
      { label: 'Пробуждающееся оружие', text: 'Оружие раскрывает новые свойства по мере совершения подвигов или при падении здоровья владельца ниже половины.' },
      { label: 'Реакция и парирование', text: 'Даёт особую боевую Реакцию при промахе врага или при попадании по союзнику рядом.' },
      { label: 'Поглощение стихии / чар', text: 'Способно накапливать заряды от полученного магического урона и высвобождать их при следующей атаке.' },
      { label: 'Разумный отголосок', text: 'В клинке дремлет частица древнего сознания со своим характером и отношением к бою.' }
    ]
  },
  {
    key: 'armor',
    icon: '🛡️',
    title: 'Броня и Щиты',
    sub: 'Латы, кольчуги, мантии и защитные руны',
    themeLabel: 'Свободное описание образа, материала и защитных чар доспеха / щита',
    themePlaceholder: 'Опишите задуманный доспех, щит или мантию — от внешнего вида до того, как он спасает владельца в бою...\nНапример: «Мантия из звёздного шёлка и чешуи серебряного дракона, которая сгущает вокруг владельца морозную дымку и позволяет выскользнуть из захвата...»',
    reqPlaceholder: 'Точечные пожелания по формуле КД, сопротивлениям или требованиям к Силе/Скрытности (необязательно)...',
    guideQuestions: [
      'Из какого необычного материала создан доспех и как он ощущается на теле?',
      'Что происходит в момент, когда по владельцу наносят тяжёлый или критический удар?',
      'Помогает ли эта защита только в бою или даёт преимущества в исследовании и скрытности?'
    ],
    hintHooks: [
      { label: 'Контрудар при блоке', text: 'Когда враг промахивается атакой ближнего боя по владельцу, броня или щит позволяет провести мгновенный ответный эффект.' },
      { label: 'Спасение на грани гибели', text: 'Один раз за долгий отдых срабатывает защитный барьер, когда хиты владельца опускаются до опасного порога.' },
      { label: 'Аура прикрытия отряда', text: 'Создаёт защитную зону для союзников в пределах 10 футов или позволяет перехватить удар за товарища.' },
      { label: 'Невесомость и тень', text: 'Доспех адаптируется под одежду, не шумит при движении и усиливает манёвренность владельца.' }
    ]
  },
  {
    key: 'spell',
    icon: '✨',
    title: 'Заклинание',
    sub: 'Новые чары Плетения 0–9 круга',
    themeLabel: 'Свободное описание идеи, визуального образа и эффекта заклинания',
    themePlaceholder: 'Опишите, как выглядит сотворение заклинания и что оно делает в бою или вне его — ИИ сам определит подходящий круг и школу магии...\nНапример: «Заклинатель рассекает воздух клинком или ладонью, оставляя за собой трещину астрального серебра, которая притягивает врагов и глушит их речь...»',
    reqPlaceholder: 'Точечные пожелания по спасброску, дистанции, концентрации или скейлингу от ячеек (необязательно)...',
    guideQuestions: [
      'Как именно заклинатель переплетает нити Плетения (жест, слова, редкий материальный компонент)?',
      'В чём тактическая изюминка чар (перемещение, изменение поля боя, комбо с атакой)?',
      'Как заклинание усиливается при вложении ячейки более высокого круга?'
    ],
    hintHooks: [
      { label: 'Боевая магия клинка (Gish)', text: 'Заклинание органично сочетается с рукопашной атакой оружием или накладывается бонусным действием / реакцией.' },
      { label: 'Контроль пространства', text: 'Меняет рельеф или создаёт опасную/защитную зону на поле боя, влияющую на перемещение врагов.' },
      { label: 'Двойной режим применения', text: 'При сотворении заклинатель может выбрать один из двух эффектов (например, защита союзника или кара врага).' },
      { label: 'Именное заклинание архимага', text: 'Носит имя легендарного мага Фаэруна и несёт фирменный визуальный почерк его школы.' }
    ]
  },
  {
    key: 'item',
    icon: '💍',
    title: 'Артефакт и Вещь',
    sub: 'Кольца, амулеты, плащи, посохи и реликвии',
    themeLabel: 'Свободное описание чудесного предмета, реликвии или диковинки',
    themePlaceholder: 'Опишите задуманный предмет, его историю или необычное свойство...\nНапример: «Старинные карманные часы из латуни и лунного камня, найденные в руинах Нетерила: их стрелки идут назад, когда рядом творится иллюзия или обман...»',
    reqPlaceholder: 'Точечные пожелания по количеству зарядов, настройке или стоимости в золоте (необязательно)...',
    guideQuestions: [
      'Как этот предмет выглядит в руках и по каким признакам видно его древнее происхождение?',
      'Какую нестандартную возможность он открывает для смекалки игрока вне обычного боя?',
      'Есть ли у предмета особое условие перезарядки (при свете луны, после отдыха, у огня)?'
    ],
    hintHooks: [
      { label: 'Инструмент для смекалки', text: 'Предмет даёт необычное свойство для шпионажа, перемещения, переговоров или манипуляции окружением.' },
      { label: 'Заряды и рискованный овердрайв', text: 'Имеет заряды с безопасным использованием и мощным режимом при трате последнего заряда с риском.' },
      { label: 'Связь с божеством или планом', text: 'Реликвия несёт печать одного из богов Фаэруна или частицу энергии Астрала / Царства Фей / Долины Теней.' },
      { label: 'Соблазнительное проклятие', text: 'Дарует огромную выгоду, но постепенно накладывает мистическое испытание или причуду на владельца.' }
    ]
  },
  {
    key: 'monster',
    icon: '👹',
    title: 'Монстр и Босс',
    sub: 'Полный статблок чудовища или босса',
    themeLabel: 'Свободное описание образа чудовища, босса, его повадок и способностей',
    themePlaceholder: 'Опишите внешний вид врага, его происхождение и то, каким должен ощущаться бой с ним...\nНапример: «Павший командор Серебряных Рыцарей, чьи доспехи срослись с корнями проклятого древа Гултиаса: управляет шипами на поле боя и вытягивает свет из факелов...»',
    reqPlaceholder: 'Точечные пожелания по КО (CR), хитам, легендарным действиям или трофеям (необязательно)...',
    guideQuestions: [
      'Чем бой с этим противником отличается от простого обмена ударами на месте?',
      'Есть ли у монстра уязвимость, механика фаз или интерактивная особенность логова?',
      'Какие ценные трофеи или алхимические реагенты останутся после победы?'
    ],
    hintHooks: [
      { label: 'Смена фазы в разгар боя', text: 'При падении хитов ниже половины (Окровавлен / Bloodied) босс меняет тактику и открывает новую яростную способность.' },
      { label: 'Эффекты логова и окружения', text: 'Само поле боя активно помогает чудовищу на инициативе 20, заставляя героев двигаться и искать укрытия.' },
      { label: 'Тактическая уязвимость', text: 'У монстра есть грозная защита, которую можно ослабить умным действием, стихией или разрушением якоря.' },
      { label: 'Уникальный трофей для крафта', text: 'После победы можно добыть редкий орган или осколок для ковки оружия или варки эликсира.' }
    ]
  },
  {
    key: 'location',
    icon: '🏰',
    title: 'Локация и Данж',
    sub: 'Таверны, лавки, башни и подземелья',
    themeLabel: 'Свободное описание места, его атмосферы, архитектуры и секретов',
    themePlaceholder: 'Опишите задуманную локацию — от уютной таверны до древнего склепа или магической обсерватории...\nНапример: «Маяк на утёсе к северу от Лускана, чей зелёный огонь виден только кораблям-призракам. На верхнем ярусе живёт слепой смотритель, а под фундаментом затоплен грот...»',
    reqPlaceholder: 'Точечные пожелания по количеству залов, СЛ ловушек, ценам в меню или слухам (необязательно)...',
    guideQuestions: [
      'Какие звуки, запахи, свет и детали встречают героев в первые секунды?',
      'Какие интерактивные объекты в залах можно изучить, сломать или активировать?',
      'Какой секрет скрыт от беглого взгляда за тайной дверью или среди обитателей?'
    ],
    hintHooks: [
      { label: 'Живые детали и интерактивность', text: 'В каждой зоне есть необычные предметы интерьера, механизмы или алтари, с которыми игроки могут взаимодействовать.' },
      { label: 'Тайный проход и ловушка', text: 'Содержит продуманный секретный ход и нетривиальную ловушку с подсказками для внимательных героев.' },
      { label: 'Колоритные завсегдатаи и слухи', text: 'Место наполнено характерными обитателями и 3 свежими слухами, ведущими к новым приключениям.' },
      { label: 'Динамическое изменение места', text: 'Локация меняется со временем (прилив, смена фазы луны, пробуждение древнего механизма).' }
    ]
  },
  {
    key: 'alchemy',
    icon: '🧪',
    title: 'Алхимия и Зелья',
    sub: 'Рецепты зелий, эликсиров, масел и ядов',
    themeLabel: 'Свободное описание эффекта, вида или ингредиентов зелья / масла / яда',
    themePlaceholder: 'Опишите, какой состав вы хотите сварить или найти...\nНапример: «Густое серебристо-ртутное масло для клинка из грибов Подземья и пепла призрака, которое позволяет оружию рассекать бесплотных существ и оставляет светящийся след...»',
    reqPlaceholder: 'Точечные пожелания по СЛ крафта, стоимости, длительности или побочным эффектам (необязательно)...',
    guideQuestions: [
      'Как состав выглядит во флаконе, чем пахнет и как ощущается при применении?',
      'Из каких редких трав, минералов Фаэруна или трофеев монстров он создаётся?',
      'Даёт ли он чистый бонус или мощный эффект с интересным побочным свойством?'
    ],
    hintHooks: [
      { label: 'Редкие реагенты Фаэруна', text: 'В рецепте используются аутентичные травы и трофеи Забытых Королевств с подсказкой, где их добыть.' },
      { label: 'Оружейный состав на бой', text: 'Наносится на оружие или боеприпасы перед боем, добавляя стихийный или тактический эффект при попадании.' },
      { label: 'Ведьмачий мутаген / овердрайв', text: 'Даёт мощное боевое усиление чувств и рефлексов, но требует выдержки организма.' },
      { label: 'Тактическая бомба / смесь', text: 'Можно метнуть в точку на поле боя для создания облака, вспышки, кислоты или липкой ловушки.' }
    ]
  },
  {
    key: 'feat',
    icon: '⭐',
    title: 'Черта и Талант',
    sub: 'Черты D&D 2024, боевые стили и дары',
    themeLabel: 'Свободное описание боевого стиля, таланта или особой черты героя',
    themePlaceholder: 'Опишите, чему именно научился персонаж или какую уникальную грань мастерства вы хотите отразить в черте...\nНапример: «Боевая черта для фехтовальщика с плащом или парным клинком: искусство ложного выпада, позволяющее уходить с линии атаки и сбивать ритм врага...»',
    reqPlaceholder: 'Точечные пожелания по прибавке к характеристике (+1), уровню или требованиям (необязательно)...',
    guideQuestions: [
      'Какую фантазию персонажа или боевой почерк раскрывает эта черта?',
      'Даёт ли она полу-прибавку к характеристике (+1) по стандарту черт D&D 2024?',
      'Как часто можно применять её активную часть (каждый ход, реакцией, за БМ раз в отдых)?'
    ],
    hintHooks: [
      { label: 'Полу-черта D&D 2024 (+1 стат)', text: 'Включает повышение подходящей характеристики на +1 (макс. 20) и два сбалансированных тактических умения.' },
      { label: 'Активная реакция в бою', text: 'Даёт герою новое полезное применение Реакции или Бонусного действия в напряжённые моменты схватки.' },
      { label: 'Мастерство Плетения и стихий', text: 'Связывает боевые приёмы персонажа со школой магии, стихией или сверхъестественным чутьём.' },
      { label: 'Ролевой и исследовательский бонус', text: 'Помимо боевой пользы даёт яркое преимущество в социальных сценах, разведке или ремесле.' }
    ]
  }
];

function getFaeGenCatDef(catKey){
  return FAE_GEN_CATEGORIES.find(function(c){ return c.key === catKey; }) || FAE_GEN_CATEGORIES[0];
}

function getFaeGenThinkingDef(modeKey){
  return FAE_GEN_THINKING_MODES.find(function(m){ return m.key === modeKey; }) || FAE_GEN_THINKING_MODES[0];
}

function renderFaeGenHintsDockContent(cat){
  var def = getFaeGenCatDef(cat);
  var questionsHtml = (def.guideQuestions || []).map(function(q){
    return '<li>' + escapeHtml(q) + '</li>';
  }).join('');
  var hooksHtml = (def.hintHooks || []).map(function(h, idx){
    return '<button type="button" class="fae-gen-hint-chip" data-fae-hint-idx="' + idx + '" title="Кликните, чтобы добавить зацепку в поле идеи">' +
      '<b>➕ ' + escapeHtml(h.label) + '</b>' +
      '<span>' + escapeHtml(h.text) + '</span>' +
    '</button>';
  }).join('');

  return '<div class="fae-gen-hints-head">' +
      '<span class="fae-gen-hints-title">💡 Подсказки • ' + def.icon + ' ' + escapeHtml(def.title) + '</span>' +
      '<button type="button" class="fae-gen-hints-collapse-btn" id="faeGenHintsCollapseBtn" title="Свернуть панель подсказок">‹ Свернуть</button>' +
    '</div>' +
    '<div style="font-size:11.5px;color:#94a3b8;line-height:1.42;margin-bottom:8px;">' +
      'Пишите идею свободно — от короткого образа до подробного сценария. Все выпадающие списки справа <b>опциональны</b>.' +
    '</div>' +
    '<div class="fae-gen-hints-sec-title">🧭 О чём можно упомянуть</div>' +
    '<ul class="fae-gen-hints-qlist">' + questionsHtml + '</ul>' +
    '<div class="fae-gen-hints-sec-title" style="margin-top:12px;">✨ Зацепки (клик добавит в идею)</div>' +
    '<div>' + hooksHtml + '</div>';
}

function renderFaeGenHintsDock(cat){
  var isCol = getSavedFaeGenHintsCollapsed();
  return '<aside class="fae-gen-hints-dock' + (isCol ? ' collapsed' : '') + '" id="faeGenHintsDock">' +
    '<div class="fae-gen-hints-panel" id="faeGenHintsPanel">' +
      renderFaeGenHintsDockContent(cat) +
    '</div>' +
    '<button type="button" class="fae-gen-hints-tab" id="faeGenHintsTab" title="Развернуть подсказки и зацепки для ИИ">' +
      '<span class="fae-gen-hints-tab-icon">💡</span>' +
      '<span class="fae-gen-hints-tab-text">Подсказки</span>' +
      '<span style="font-size:11px;color:var(--brass);">▸</span>' +
    '</button>' +
  '</aside>';
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

function buildFaeOptionalParamsPrompt(pairs){
  var fixed = [];
  var auto = [];
  (pairs || []).forEach(function(p){
    var val = (p.val !== undefined && p.val !== null) ? String(p.val).trim() : '';
    if(val && val !== 'auto'){
      fixed.push(p.label + ': ' + val);
    } else {
      auto.push(p.label);
    }
  });
  var out = '';
  if(fixed.length){
    out += 'Заданные пользователем параметры: ' + fixed.join('; ') + '. ';
  }
  if(auto.length){
    out += 'Параметры на полное творческое усмотрение ИИ (' + auto.join(', ') + '): определи их самостоятельно и максимально органично исходя из идеи пользователя, лора Фаэруна и контекста героя. ';
  }
  return out;
}

function callGeminiFaeGenerator(opts, apiKey, callback){
  if(!apiKey){
    callback('API ключ Google Gemini не указан', null);
    return;
  }
  var cat = opts.cat || 'quest';
  var theme = (opts.theme || '').trim() || 'Свободная генерация по усмотрению ИИ (создай яркий, самобытный концепт для мира Забытых Королевств, опираясь на контекст героя и кампании)';
  var thinkingDef = getFaeGenThinkingDef(opts.thinkingMode || 'deep_lore');
  var thinkingStr = thinkingDef.prompt + ' ';
  var ctxStr = opts.contextInfo ? ('Контекст партии и кампании: ' + opts.contextInfo + '. ') : '';
  var reqStr = opts.req ? ('Дополнительные пожелания и детали: ' + opts.req + '. ') : '';
  var prompt = '';

  if(cat === 'quest'){
    prompt = 'Ты ведущий мастер подземелий (Dungeon Master) и сценарист приключений Dungeons & Dragons 5e / 2024 по миру Забытых Королевств (Faerûn). ' +
      'Разработай продуманный, увлекательный и готовый к проведению квест (приключение). ' +
      thinkingStr +
      'Идея / Замысел пользователя: «' + theme + '». ' +
      buildFaeOptionalParamsPrompt([
        { label: 'Тип приключения', val: opts.questType },
        { label: 'Уровень отряда', val: opts.questLevel },
        { label: 'Регион Фаэруна', val: opts.questRegion },
        { label: 'Тон и атмосфера', val: opts.questTone }
      ]) +
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
      '  "rewards": "Награда: золото в ЗМ, благосклонность фракции и особый магический трофей",\n' +
      '  "aiReasoning": "Ход мыслей ИИ и советы Мастеру: почему выбрана такая структура, как связать квест с героем и как лучше обыграть ключевую сцену"\n' +
      '}';
  } else if(cat === 'npc'){
    prompt = 'Ты ведущий сценарист и мастер Dungeons & Dragons 5e / 2024 в сеттинге Забытых Королевств (Faerûn). ' +
      'Создай живого, харизматичного и запоминающегося неигрового персонажа (НПС) с глубоким характером и игровой пользой. ' +
      thinkingStr +
      'Идея / Образ от пользователя: «' + theme + '». ' +
      buildFaeOptionalParamsPrompt([
        { label: 'Роль в истории', val: opts.npcRole },
        { label: 'Вид (Раса)', val: opts.npcSpecies },
        { label: 'Фракция Фаэруна', val: opts.npcFaction },
        { label: 'Боевой ранг', val: opts.npcPower }
      ]) +
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
      '  "inventory": "Ценности в карманах, редкие товары на продажу или трофеи",\n' +
      '  "aiReasoning": "Ход мыслей ИИ и советы по отыгрышу: почему выбран такой образ и как ввести этого НПС в партию максимально ярко"\n' +
      '}';
  } else if(cat === 'weapon'){
    prompt = 'Ты легендарный кузнец-артефактор и дизайнер правил Dungeons & Dragons 2024 (Player\'s Handbook 2024) в мире Фаэруна. ' +
      'Создай сбалансированное, атмосферное и механически интересное именное оружие. ' +
      thinkingStr +
      'Идея / Концепт оружия от пользователя: «' + theme + '». ' +
      buildFaeOptionalParamsPrompt([
        { label: 'Базовый тип оружия', val: opts.weaponBase },
        { label: 'Редкость', val: opts.weaponRarity },
        { label: 'Стихия / Природа чар', val: opts.weaponElement },
        { label: 'Свойство Мастерства оружия 2024', val: opts.weaponMastery }
      ]) +
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
      '  "mechanics": "Детальное описание пассивных бонусов, активных способностей (заряды, спасброски, криты) по правилам D&D 5e/2024",\n' +
      '  "aiReasoning": "Ход мыслей ИИ: почему выбраны именно такой тип оружия, редкость и механика, и с какими умениями героя это создаёт лучшую синергию"\n' +
      '}';
  } else if(cat === 'armor'){
    prompt = 'Ты великий мастер бронников и чародей Фаэруна в Dungeons & Dragons 5e / 2024. ' +
      'Создай уникальный магический доспех, щит или защитное одеяние. ' +
      thinkingStr +
      'Идея / Концепт от пользователя: «' + theme + '». ' +
      buildFaeOptionalParamsPrompt([
        { label: 'Тип брони / щита', val: opts.armorType },
        { label: 'Редкость', val: opts.armorRarity },
        { label: 'Защитный профиль', val: opts.armorFocus },
        { label: 'Материал изготовления', val: opts.armorMaterial }
      ]) +
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
      '  "mechanics": "Детальное описание пассивных защитных свойств, аур и реактивных умений доспеха в бою",\n' +
      '  "aiReasoning": "Ход мыслей ИИ: обоснование баланса КД, защитных чар и тактической роли владельца"\n' +
      '}';
  } else if(cat === 'spell'){
    prompt = 'Ты ведущий мастер и дизайнер правил Dungeons & Dragons 5e / 2024. ' +
      'Придумай сбалансированное, захватывающее и детализированное заклинание для Забытых Королевств (Faerûn). ' +
      thinkingStr +
      'Идея / Замысел заклинания от пользователя: «' + theme + '». ' +
      buildFaeOptionalParamsPrompt([
        { label: 'Школа магии', val: opts.school },
        { label: 'Круг заклинания (0 = заговор, 1–9 = круг)', val: (opts.level !== undefined && opts.level !== null && opts.level !== 'auto' && opts.level !== '') ? String(opts.level) : 'auto' },
        { label: 'Доступно классам / Традиция', val: opts.spellClass },
        { label: 'Время наложения', val: opts.spellAction }
      ]) +
      ctxStr + reqStr +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название заклинания на русском",\n' +
      '  "school": "Ключ школы на английском (строго одно из: abjuration, conjuration, divination, enchantment, evocation, illusion, necromancy, transmutation)",\n' +
      '  "schoolRu": "Название школы на русском",\n' +
      '  "level": 3,\n' +
      '  "classes": "Доступно классам (напр. Волшебник, Чародей, Паладин)",\n' +
      '  "castingTime": "Время наложения (например: 1 действие, 1 бонусное действие, 1 реакция)",\n' +
      '  "range": "Дистанция (например: На себя, 60 футов, Касание)",\n' +
      '  "components": "Компоненты (В, С, М и описание материала)",\n' +
      '  "duration": "Длительность (например: Мгновенная, Концентрация, до 1 минуты, 1 час)",\n' +
      '  "effect": "Детальное игровое описание механики заклинания (урон, спасбросок, область, воздействие)",\n' +
      '  "higherLevels": "Эффект при сотворении ячейкой более высокого уровня (или улучшение заговора на 5, 11, 17 уровнях)",\n' +
      '  "aiReasoning": "Ход мыслей ИИ: почему выбран именно этот круг и школа, как заклинание работает с Плетением Мистры и как его красиво отыграть"\n' +
      '}';
  } else if(cat === 'item'){
    prompt = 'Ты легендарный артефактор Фаэруна в Dungeons & Dragons 5e / 2024. ' +
      'Придумай уникальный чудесный предмет, кольцо, амулет, плащ, посох или реликвию Забытых Королевств. ' +
      thinkingStr +
      'Идея / Концепт предмета от пользователя: «' + theme + '». ' +
      buildFaeOptionalParamsPrompt([
        { label: 'Тип предмета', val: opts.itemType },
        { label: 'Редкость', val: opts.rarity }
      ]) +
      ctxStr + reqStr +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название предмета на русском",\n' +
      '  "type": "Тип предмета (Амулет, Кольцо, Плащ, Посох, Жезл, Гримуар, Чудесный предмет)",\n' +
      '  "rarity": "Редкость (Обычный, Необычный, Редкий, Очень редкий, Легендарный, Артефакт)",\n' +
      '  "attunement": "Настройка (например: Требуется настройка / Требуется настройка заклинателем / Не требуется)",\n' +
      '  "price": "Оценочная стоимость (напр. 3 500 ЗМ)",\n' +
      '  "desc": "Полное описание предмета: внешний вид, история происхождения, активные и пассивные магические свойства, механика бросков или заряды (4-6 предложений)",\n' +
      '  "aiReasoning": "Ход мыслей ИИ: в чём главная изюминка артефакта и как нестандартно применить его в кампании"\n' +
      '}';
  } else if(cat === 'monster'){
    prompt = 'Ты ведущий дизайнер бестиария Dungeons & Dragons 5e / 2024 (Monster Manual 2024). ' +
      'Создай полный, готовый к бою статблок чудовища, врага или босса для мира Фаэруна. ' +
      thinkingStr +
      'Идея / Образ чудовища от пользователя: «' + theme + '». ' +
      buildFaeOptionalParamsPrompt([
        { label: 'Тип существа', val: opts.monsterType },
        { label: 'Показатель опасности (КО / CR)', val: opts.monsterCr },
        { label: 'Тактическая роль в бою', val: opts.monsterRole }
      ]) +
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
      '  "tacticsAndLoot": "Тактика поведения в бою и ценные трофеи/алхимические реагенты после победы",\n' +
      '  "aiReasoning": "Ход мыслей ИИ и советы ДМу: как сделать бой с этим существом динамичным и какие слабости могут нащупать игроки"\n' +
      '}';
  } else if(cat === 'location'){
    prompt = 'Ты ведущий архитектор мира и картограф приключений Забытых Королевств (D&D 5e / 2024). ' +
      'Создай детализированную, атмосферную локацию (таверну, лавку, башню или подземелье), готовую для игры. ' +
      thinkingStr +
      'Идея / Описание локации от пользователя: «' + theme + '». ' +
      buildFaeOptionalParamsPrompt([
        { label: 'Тип локации', val: opts.locType },
        { label: 'Статус и уровень опасности', val: opts.locDanger }
      ]) +
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
      '  "hooksAndRumors": "Услуги/цены (если мирная локация) или сюжетные зацепки и слухи, которые можно здесь узнать",\n' +
      '  "aiReasoning": "Ход мыслей ИИ: как использовать эту локацию в качестве яркой сцены и какие интерактивные элементы предложить игрокам"\n' +
      '}';
  } else if(cat === 'alchemy'){
    prompt = 'Ты верховный алхимик, травник и отравитель Фаэруна в Dungeons & Dragons 5e / 2024. ' +
      'Создай рецепт и описание алхимического зелья, эликсира, оружейного масла или боевого яда. ' +
      thinkingStr +
      'Идея / Концепт состава от пользователя: «' + theme + '». ' +
      buildFaeOptionalParamsPrompt([
        { label: 'Категория состава', val: opts.alchType },
        { label: 'Редкость и сложность варки', val: opts.alchRarity },
        { label: 'Инструменты крафта (alchemy или herbalism)', val: opts.alchKit }
      ]) +
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
      '  "effect": "Точная игровая механика при применении: длительность, бонусы, урон или спасбросок",\n' +
      '  "aiReasoning": "Ход мыслей ИИ: почему выбраны такие ингредиенты и СЛ, и в каких тактических ситуациях этот состав раскроется лучше всего"\n' +
      '}';
  } else if(cat === 'skill'){
    prompt = 'Ты ведущий мастер подземелий Забытых Королевств (D&D 5e / 2024). ' +
      'Создай прикладной навык, ремесло, владение инструментами, язык или лор-знание для персонажа Фаэруна (по образцу ступеней мастерства Начатки / Ученик / Подмастерье / Умелец / Мастер). ' +
      thinkingStr +
      'Тема / Идея: ' + theme + '. ' +
      buildFaeOptionalParamsPrompt([
        { label: 'Тип навыка', val: opts.skillKind },
        { label: 'Ступень мастерства', val: opts.skillLevel }
      ]) +
      ctxStr + reqStr +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название навыка, ремесла или знания",\n' +
      '  "kind": "' + (opts.skillKind || 'Ремесло') + '",\n' +
      '  "level": "' + (opts.skillLevel || 'Подмастерье') + '",\n' +
      '  "abil": "Связанная характеристика (например: Интеллект, Ловкость, Мудрость, Сила или Харизма)",\n' +
      '  "mod": "Модификатор к броску (например: +5, +6 или пусто, если работает без броска)",\n' +
      '  "src": "Откуда навык: кто научил, в какой гильдии или регионе Фаэруна освоен (сюжетная зацепка для ДМа)",\n' +
      '  "gives": "Что конкретно даёт: что персонаж благодаря этому МОЖЕТ сделать, скрафтить или узнать без броска костей",\n' +
      '  "desc": "Заметки, необходимые инструменты и особенности применения в приключении",\n' +
      '  "aiReasoning": "Ход мыслей ИИ: как этот навык обогатит ролевой отыгрыш героя"\n' +
      '}';
  } else {
    prompt = 'Ты ведущий геймдизайнер D&D 2024 (Player\'s Handbook 2024). ' +
      'Придумай сбалансированную черту (Feat) для персонажа Фаэруна. ' +
      thinkingStr +
      'Идея / Концепт черты от пользователя: «' + theme + '». ' +
      buildFaeOptionalParamsPrompt([
        { label: 'Категория черты (D&D 2024)', val: opts.featCat },
        { label: 'Направленность', val: opts.featFocus }
      ]) +
      ctxStr + reqStr +
      'Ответь ИСКЛЮЧИТЕЛЬНО валидным JSON-объектом без markdown форматирования (без ```json), со следующими полями:\n' +
      '{\n' +
      '  "name": "Название черты на русском",\n' +
      '  "category": "Категория (Черта происхождения, Общая черта, Боевой стиль, Эпический дар)",\n' +
      '  "prereq": "Требования (например: Уровень 4+, Сила или Ловкость 13+ или Без требований)",\n' +
      '  "statBonus": "Увеличение характеристик (например: Увеличьте Силу или Ловкость на 1, максимум до 20)",\n' +
      '  "desc": "Общее художественное и тактическое описание черты",\n' +
      '  "features": ["Пункт 1 боевого бонуса или механики", "Пункт 2 активной или реактивной способности", "Пункт 3"],\n' +
      '  "aiReasoning": "Ход мыслей ИИ: как сбалансирована эта черта по стандарту 2024 года и каким билдам она подойдёт лучше всего"\n' +
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

function renderFaeGenExtraFields(cat){
  var autoOpt = '<option value="" selected>🎲 На усмотрение ИИ (по замыслу и идее)</option>';
  if(cat === 'quest'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Тип приключения (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenQuestType">' +
          autoOpt +
          '<option value="Детективное расследование и заговор">🕵️ Детективное расследование и заговор</option>' +
          '<option value="Охота на чудовище / Зачистка логова">🐉 Охота на чудовище / Зачистка логова</option>' +
          '<option value="Исследование древних руин и подземелья">🏛️ Исследование древних руин и подземелья</option>' +
          '<option value="Городская интрига и дерзкое ограбление">🎭 Городская интрига и дерзкое ограбление</option>' +
          '<option value="Сопровождение каравана / Оборона крепости">🛡️ Сопровождение / Оборона рубежа</option>' +
          '<option value="Снятие проклятия и мистическая тайна">🔮 Снятие проклятия и мистическая тайна</option>' +
          '<option value="Дипломатическая миссия и спасение">👑 Дипломатическая миссия и спасение</option>' +
          '<option value="Эпический планарный поход">🌌 Эпический планарный поход</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Уровень отряда (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenQuestLevel">' +
          autoOpt +
          '<option value="1–4 уровень (Местные герои)">1–4 уровень (Местные герои)</option>' +
          '<option value="5–10 уровень (Герои Королевства)">5–10 уровень (Герои Королевства)</option>' +
          '<option value="11–16 уровень (Владыки Фаэруна)">11–16 уровень (Владыки Фаэруна)</option>' +
          '<option value="17–20 уровень (Легенды Мультивселенной)">17–20 уровень (Легенды Мультивселенной)</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Регион Фаэруна (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenQuestRegion">' +
          autoOpt +
          '<option value="Побережье Мечей (Врата Балдура / Невервинтер)">🌊 Побережье Мечей (Врата Балдура / Невервинтер)</option>' +
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
        '<label class="ai-gen-label">Тон и атмосфера (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenQuestTone">' +
          autoOpt +
          '<option value="Классическое героическое фэнтези">⚔️ Классическое героическое фэнтези</option>' +
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
        '<label class="ai-gen-label">Роль НПС в кампании (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenNpcRole">' +
          autoOpt +
          '<option value="Квестодатель / Покровитель отряда">👑 Квестодатель / Покровитель</option>' +
          '<option value="Торговец редкостями / Кузнец / Алхимик">⚖️ Торговец редкостями / Мастер</option>' +
          '<option value="Союзник / Спутник / Наёмник в отряд">⚔️ Союзник / Спутник в отряд</option>' +
          '<option value="Информатор / Контрабандист / Вор">🗝️ Информатор / Тень криминала</option>' +
          '<option value="Антагонист / Харизматичный злодей">💀 Антагонист / Харизматичный злодей</option>' +
          '<option value="Мудрец / Архимаг / Жрец храма">🔮 Мудрец / Архимаг / Хранитель знаний</option>' +
          '<option value="Трактирщик / Капитан стражи / Горожанин">🍺 Трактирщик / Капитан стражи</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Вид / Раса (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenNpcSpecies">' +
          autoOpt +
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
        '<label class="ai-gen-label">Фракция Фаэруна (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenNpcFaction">' +
          autoOpt +
          '<option value="Независимый / Своя гильдия">Независимый / Своя гильдия</option>' +
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
        '<label class="ai-gen-label">Боевой ранг (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenNpcPower">' +
          autoOpt +
          '<option value="Мирный специалист (КО 1/2 – 1)">Мирный специалист (КО 1/2 – 1)</option>' +
          '<option value="Опытный авантюрист (КО 2–4)">Опытный авантюрист (КО 2–4)</option>' +
          '<option value="Мастер / Ветеран (КО 5–9)">Мастер / Ветеран (КО 5–9)</option>' +
          '<option value="Легендарный грандмастер (КО 10+)">Легендарный грандмастер (КО 10+)</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'weapon'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Базовый тип оружия (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenWeaponBase">' +
          autoOpt +
          '<option value="Длинный меч (Longsword)">⚔️ Длинный меч (1d8/1d10)</option>' +
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
        '<label class="ai-gen-label">Редкость и бонус (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenWeaponRarity">' +
          autoOpt +
          '<option value="Необычное (+1)">Необычное (+1)</option>' +
          '<option value="Редкое (+2)">Редкое (+2)</option>' +
          '<option value="Очень редкое (+3)">Очень редкое (+3)</option>' +
          '<option value="Легендарное (+3, особые свойства)">Легендарное (+3)</option>' +
          '<option value="Артефакт (+3, божественная реликвия)">Артефакт богов (+3)</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Стихия / Природа чар (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenWeaponElement">' +
          autoOpt +
          '<option value="Огонь и Пламя">🔥 Огонь и Пламя</option>' +
          '<option value="Холод и Вечная мерзлота">❄️ Холод и Мороз</option>' +
          '<option value="Молния и Гром Бури">⚡ Молния и Гром</option>' +
          '<option value="Святое Излучение и Рассвет">☀️ Святое Излучение</option>' +
          '<option value="Некротика, Тень и Вампиризм">🌑 Некротика и Тень</option>' +
          '<option value="Астральная Сила и Псионика">🔮 Силовое поле и Псионика</option>' +
          '<option value="Кислота и Змеиный Яд">🧪 Кислота и Яд</option>' +
          '<option value="Безупречная физическая острота и кровотечение">🩸 Чистая острота и сокрушение</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Мастерство оружия 2024 (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenWeaponMastery">' +
          autoOpt +
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
        '<label class="ai-gen-label">Категория доспеха / щита (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenArmorType">' +
          autoOpt +
          '<option value="Лёгкий доспех (Проклёпанная кожа)">Лёгкий доспех (КД 12 + Лов)</option>' +
          '<option value="Средний доспех (Кираса / Полулаты)">Средний доспех (Кираса / Полулаты)</option>' +
          '<option value="Тяжёлый доспех (Полные латы)">Тяжёлый доспех (Полные латы, КД 18)</option>' +
          '<option value="Щит / Башенный щит">🛡️ Щит (+2 к КД и выше)</option>' +
          '<option value="Магическая мантия / Одеяние архимага">👘 Магическая мантия / Одеяние</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Редкость защиты (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenArmorRarity">' +
          autoOpt +
          '<option value="Необычный (+1)">Необычный (+1)</option>' +
          '<option value="Редкий (+2)">Редкий (+2)</option>' +
          '<option value="Очень редкий (+3)">Очень редкий (+3)</option>' +
          '<option value="Легендарный (+3)">Легендарный (+3)</option>' +
          '<option value="Артефакт">Артефакт</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Защитная специализация (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenArmorFocus">' +
          autoOpt +
          '<option value="Несокрушимость и иммунитет к критическим ударам">🛡️ Несокрушимость и анти-крит</option>' +
          '<option value="Сопротивление стихиям и защитная аура">🔥 Сопротивление стихиям и аура</option>' +
          '<option value="Бесшумность, скрытность и слияние с тенью">🌑 Скрытность и теневой шаг</option>' +
          '<option value="Отражение магии и бонус к спасброскам">✨ Защита от чар и спасброски</option>' +
          '<option value="Мобильность, рывки и левитация">🦅 Мобильность и крылья</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Материал исполнения (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenArmorMaterial">' +
          autoOpt +
          '<option value="Мифрал (серебряная сталь без помехи скрытности)">Мифрал (легковесный металл)</option>' +
          '<option value="Адамантин (сверхпрочный метеоритный сплав)">Адамантин (гасит криты)</option>' +
          '<option value="Чешуя и кость древнего дракона">Чешуя древнего дракона</option>' +
          '<option value="Закалённая рунная сталь дварфов">Рунная сталь дварфов</option>' +
          '<option value="Астральный шёлк и нити Плетения">Астральный шёлк / Железное дерево</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'spell'){
    var schoolOpts = autoOpt + MAGIC_SCHOOLS.map(function(sc){
      return '<option value="' + sc.key + '">' + sc.ru + '</option>';
    }).join('');
    var lvlOpts = '<option value="auto" selected>🎲 На усмотрение ИИ (под мощь идеи)</option>' + Array.from({length:10}, function(_,i){
      return '<option value="' + i + '">' + (i === 0 ? 'Заговор (0 круг)' : (i + ' круг')) + '</option>';
    }).join('');
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Школа магии (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenSchool">' + schoolOpts + '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Круг заклинания (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenLevel">' + lvlOpts + '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Традиция / Классы (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenSpellClass">' +
          autoOpt +
          '<option value="Волшебник, Чародей, Колдун">🔮 Тайная магия (Волшебник, Чародей, Колдун)</option>' +
          '<option value="Жрец, Паладин">☀️ Божественная магия (Жрец, Паладин)</option>' +
          '<option value="Друид, Следопыт">🍃 Первородная магия (Друид, Следопыт)</option>' +
          '<option value="Бард, Изобретатель">🎵 Искусство и руны (Бард, Изобретатель)</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Время наложения (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenSpellAction">' +
          autoOpt +
          '<option value="1 действие">⚡ 1 действие (Основное)</option>' +
          '<option value="1 бонусное действие">🏃 1 бонусное действие</option>' +
          '<option value="1 реакция">🛡️ 1 реакция</option>' +
          '<option value="1 минута (Ритуал)">🕯️ Ритуал / Длительное</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'item'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Тип артефакта (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenItemType">' +
          autoOpt +
          '<option value="Амулет / Медальон / Талисман">📿 Амулет / Талисман</option>' +
          '<option value="Кольцо / Перстень">💍 Кольцо / Перстень</option>' +
          '<option value="Плащ / Сапоги / Перчатки">🧥 Плащ / Сапоги / Перчатки</option>' +
          '<option value="Посох / Жезл / Волшебная палочка">🪄 Посох / Жезл / Фокусировка</option>' +
          '<option value="Гримуар / Магический фолиант">📕 Гримуар / Фолиант</option>' +
          '<option value="Чудесный инструмент / Механизм">🧭 Чудесный предмет / Механизм</option>' +
          '<option value="Проклятая реликвия древности">💀 Проклятая реликвия</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Редкость предмета (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenRarity">' +
          autoOpt +
          '<option value="Обычный">Обычный (Common)</option>' +
          '<option value="Необычный">Необычный (Uncommon)</option>' +
          '<option value="Редкий">Редкий (Rare)</option>' +
          '<option value="Очень редкий">Очень редкий (Very Rare)</option>' +
          '<option value="Легендарный">Легендарный (Legendary)</option>' +
          '<option value="Артефакт">Артефакт (Artifact)</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'monster'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Тип существа (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenMonsterType">' +
          autoOpt +
          '<option value="Нежить (Рыцарь смерти / Вампир / Лич)">💀 Нежить (Рыцарь смерти / Вампир / Лич)</option>' +
          '<option value="Дракон / Драконид">🐉 Дракон / Драконид</option>' +
          '<option value="Исчадие (Демон Бездны / Дьявол Баатора)">🔥 Исчадие (Демон / Дьявол)</option>' +
          '<option value="Аберрация (Порождение Дальнего Предела)">👁️ Аберрация</option>' +
          '<option value="Монструозность / Первобытный хищник">👹 Монструозность / Хищник</option>' +
          '<option value="Великан / Тролль / Огр">🏔️ Великан / Тролль</option>' +
          '<option value="Фея / Элементаль">✨ Фея / Элементаль</option>' +
          '<option value="Конструкт / Голем">⚙️ Конструкт / Голем</option>' +
          '<option value="Гуманоид-босс (Военачальник / Архимаг / Ассасин)">🗡️ Гуманоид-босс</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Показатель опасности (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenMonsterCr">' +
          autoOpt +
          '<option value="КО 1–2 (Опасный противник)">КО 1–2 (Опасный противник)</option>' +
          '<option value="КО 3–5 (Элитный вожак)">КО 3–5 (Элитный вожак)</option>' +
          '<option value="КО 6–10 (Босс подземелья)">КО 6–10 (Босс подземелья)</option>' +
          '<option value="КО 11–16 (Легендарный босс с логовом)">КО 11–16 (Легендарный босс)</option>' +
          '<option value="КО 17+ (Эпическое бедствие Фаэруна)">КО 17+ (Эпический катаклизм)</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field" style="grid-column:1 / -1;">' +
        '<label class="ai-gen-label">Тактическая роль в бою (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenMonsterRole">' +
          autoOpt +
          '<option value="Соло-босс с мультиатакой и легендарными действиями">👑 Соло-босс с легендарными действиями</option>' +
          '<option value="Сокрушитель первой линии (высокий урон и пролом)">🪓 Сокрушитель первой линии</option>' +
          '<option value="Заклинатель, контроль поля боя и призыв">🔮 Заклинатель и контроль поля боя</option>' +
          '<option value="Скрытный охотник, яды и засады из тени">🕸️ Скрытный охотник / Засадник</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'location'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Тип локации (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenLocType">' +
          autoOpt +
          '<option value="Таверна / Постоялый двор / Трактир">🍺 Таверна / Постоялый двор</option>' +
          '<option value="Подземелье / Древний склеп / Руины">🗝️ Подземелье / Руины / Склеп</option>' +
          '<option value="Магическая лавка / Кузница артефактов">⚗️ Магическая лавка / Кузница</option>' +
          '<option value="Башня архимага / Цитадель / Замок">🏰 Башня мага / Крепость</option>' +
          '<option value="Городской квартал / Подпольное убежище гильдии">🏙️ Городской квартал / Убежище</option>' +
          '<option value="Святилище / Природная аномалия Плетения">🌲 Святилище / Аномалия Плетения</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Уровень опасности и статус (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenLocDanger">' +
          autoOpt +
          '<option value="Мирный хаб с тайнами и слухами">🕯️ Мирный хаб с тайнами и слухами</option>' +
          '<option value="Зона интриг, шпионов и скрытой угрозы">🗡️ Зона интриг и скрытой угрозы</option>' +
          '<option value="Опасное место с ловушками и стражами">⚠️ Опасная зона с ловушками</option>' +
          '<option value="Смертельное логово врага">💀 Смертельное логово врага</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else if(cat === 'alchemy'){
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Тип алхимического состава (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenAlchType">' +
          autoOpt +
          '<option value="Боевой эликсир / Зелье усиления">🧪 Боевой эликсир / Усиление</option>' +
          '<option value="Целебный отвар / Восстановление">❤️ Целебный отвар / Регенерация</option>' +
          '<option value="Оружейное масло / Смазка для клинка">⚔️ Оружейное масло для клинка</option>' +
          '<option value="Боевой яд / Токсин">🐍 Боевой яд / Токсин</option>' +
          '<option value="Алхимическая бомба / Смесь">💣 Алхимическая бомба / Граната</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Редкость и СЛ варки (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenAlchRarity">' +
          autoOpt +
          '<option value="Обычный (СЛ 10, ~25 зм)">Обычный (СЛ 10, ~25 зм)</option>' +
          '<option value="Необычный (СЛ 13, ~100 зм)">Необычный (СЛ 13, ~100 зм)</option>' +
          '<option value="Редкий (СЛ 15, ~300 зм)">Редкий (СЛ 15, ~300 зм)</option>' +
          '<option value="Очень редкий (СЛ 18, ~1000 зм)">Очень редкий (СЛ 18, ~1000 зм)</option>' +
          '<option value="Легендарный (СЛ 20, ~2500 зм)">Легендарный (СЛ 20, ~2500 зм)</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field" style="grid-column:1 / -1;">' +
        '<label class="ai-gen-label">Инструменты создания (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenAlchKit">' +
          '<option value="auto" selected>🎲 На усмотрение ИИ (Алхимия или Травничество)</option>' +
          '<option value="alchemy">⚗️ Алхимический набор (Alchemist\'s Supplies)</option>' +
          '<option value="herbalism">🌿 Набор травника (Herbalism Kit)</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  } else {
    return '<div class="ai-gen-grid">' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Категория черты D&D 2024 (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenFeatCat">' +
          autoOpt +
          '<option value="Черта происхождения (Origin Feat)">Черта происхождения (Origin Feat)</option>' +
          '<option value="Общая черта (General Feat)">Общая черта (General Feat 4+)</option>' +
          '<option value="Боевой стиль (Fighting Style)">Боевой стиль (Fighting Style)</option>' +
          '<option value="Эпический дар (Epic Boon)">Эпический дар (Epic Boon 19+)</option>' +
        '</select>' +
      '</div>' +
      '<div class="ai-gen-field">' +
        '<label class="ai-gen-label">Направленность (опционально)</label>' +
        '<select class="ai-gen-select" id="faeGenFeatFocus">' +
          autoOpt +
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
  var reasonTail = data.aiReasoning ? ('\n\n💭 Замысел ИИ и советы:\n' + data.aiReasoning) : '';
  if(cat === 'quest'){
    return '📜 КВЕСТ: ' + (data.title || 'Приключение') + '\n' +
      'Тип: ' + (data.type || '—') + ' | Уровень: ' + (data.levelRange || '—') + ' | Регион: ' + (data.region || '—') + '\n' +
      'Заказчик: ' + (data.patron || '—') + '\n\n' +
      'Завязка:\n' + (data.hook || '') + '\n\n' +
      'Ключевые этапы:\n• ' + (Array.isArray(data.stages) ? data.stages.join('\n• ') : '') + '\n\n' +
      'Сюжетный поворот:\n' + (data.twist || '') + '\n\n' +
      'Кульминация и финал:\n' + (data.climax || '') + '\n\n' +
      'Награда:\n' + (data.rewards || '') + reasonTail;
  } else if(cat === 'npc'){
    return '🎭 НПС: ' + (data.name || 'Персонаж') + '\n' +
      (data.species || '') + ' • ' + (data.role || '') + ' • ' + (data.faction || '') + ' (' + (data.alignment || '') + ')\n\n' +
      'Внешность: ' + (data.appearance || '') + '\n' +
      'Манера речи и голос: ' + (data.voiceAndManner || '') + '\n' +
      'Характер: ' + (data.personality || '') + '\n' +
      'Цель и мотивация: ' + (data.motivation || '') + '\n' +
      'Тайна: ' + (data.secret || '') + '\n' +
      'Боевая сводка: ' + (data.combatStats || '') + '\n' +
      'Инвентарь / Товары: ' + (data.inventory || '') + reasonTail;
  } else if(cat === 'weapon'){
    return '⚔️ ОРУЖИЕ: ' + (data.name || 'Оружие') + ' (' + (data.rarity || 'Редкое') + ', ' + (data.baseWeapon || '') + ')\n' +
      'Бонус атаки: ' + (data.attackBonus || '+1') + ' | Урон: ' + (data.damage || '1d8') + ' (' + (data.damageType || '') + ')\n' +
      'Свойства: ' + (data.properties || '—') + ' | Мастерство 2024: ' + (data.mastery || '—') + '\n' +
      'Настройка: ' + (data.attunement || '—') + ' | Цена: ' + (data.price || '—') + '\n\n' +
      (data.lore ? (data.lore + '\n\n') : '') +
      'Боевые свойства:\n' + (data.mechanics || '') + reasonTail;
  } else if(cat === 'armor'){
    return '🛡️ ДОСПЕХ / ЩИТ: ' + (data.name || 'Броня') + ' (' + (data.rarity || 'Редкий') + ', ' + (data.armorType || '') + ')\n' +
      'Класс Доспеха: ' + (data.baseAc || '—') + ' | Требование Силы: ' + (data.strReq || 'Нет') + ' | Скрытность: ' + (data.stealth || '—') + '\n' +
      'Сопротивления: ' + (data.resistances || '—') + ' | Настройка: ' + (data.attunement || '—') + ' | Цена: ' + (data.price || '—') + '\n\n' +
      (data.lore ? (data.lore + '\n\n') : '') +
      'Защитные свойства:\n' + (data.mechanics || '') + reasonTail;
  } else if(cat === 'spell'){
    return '✨ ЗАКЛИНАНИЕ: ' + (data.name || 'Заклинание') + ' (' + (data.schoolRu || data.school) + ', ' + (data.level === 0 ? 'Заговор' : (data.level + ' круг')) + ')\n' +
      (data.classes ? ('Классы: ' + data.classes + '\n') : '') +
      'Время: ' + data.castingTime + ' | Дистанция: ' + data.range + ' | Длительность: ' + data.duration + '\n' +
      'Компоненты: ' + data.components + '\n\n' +
      data.effect + (data.higherLevels ? ('\n\nНа больших уровнях: ' + data.higherLevels) : '') + reasonTail;
  } else if(cat === 'item'){
    return '💍 АРТЕФАКТ: ' + (data.name || 'Предмет') + ' (' + (data.rarity || 'Редкий') + ' ' + (data.type || '') + ')\n' +
      (data.attunement ? (data.attunement + (data.price ? (' | Цена: ' + data.price) : '') + '\n\n') : '\n') +
      (data.desc || '') + reasonTail;
  } else if(cat === 'monster'){
    return '👹 БЕСТИАРИЙ: ' + (data.name || 'Чудовище') + ' (' + (data.sizeAndType || '') + ')\n' +
      'КО: ' + (data.cr || '—') + ' | КД: ' + (data.ac || '—') + ' | Хиты: ' + (data.hp || '—') + ' | Скорость: ' + (data.speed || '—') + '\n' +
      (data.stats || '') + '\n' +
      'Защита и чувства: ' + (data.defenses || '—') + '\n\n' +
      'Особенности:\n• ' + (Array.isArray(data.traits) ? data.traits.join('\n• ') : '') + '\n\n' +
      'Действия:\n• ' + (Array.isArray(data.actions) ? data.actions.join('\n• ') : '') + '\n\n' +
      (data.legendaryOrReactions ? ('Реакции / Легендарные действия:\n' + data.legendaryOrReactions + '\n\n') : '') +
      'Тактика и трофеи:\n' + (data.tacticsAndLoot || '') + reasonTail;
  } else if(cat === 'location'){
    return '🏰 ЛОКАЦИЯ: ' + (data.name || 'Локация') + ' (' + (data.type || '') + ' • ' + (data.region || '') + ')\n\n' +
      'Атмосфера:\n' + (data.atmosphere || '') + '\n\n' +
      'Ключевые зоны:\n• ' + (Array.isArray(data.keyZones) ? data.keyZones.join('\n• ') : '') + '\n\n' +
      'Обитатели: ' + (data.inhabitants || '') + '\n' +
      'Тайники и ловушки: ' + (data.secretsAndTraps || '') + '\n' +
      'Слухи и зацепки: ' + (data.hooksAndRumors || '') + reasonTail;
  } else if(cat === 'alchemy'){
    var ingStr = Array.isArray(data.ingredients) ? data.ingredients.map(function(i){ return i.name + ' x' + (i.qty||1); }).join(', ') : '';
    return '🧪 АЛХИМИЯ: ' + (data.name || 'Зелье') + ' (' + (data.rarity || 'Редкий') + ' • ' + (data.type || '') + ')\n' +
      'СЛ крафта: ' + (data.dc || 15) + ' | Стоимость: ' + (data.cost || 100) + ' ЗМ | Время: ' + (data.time || '—') + '\n' +
      'Ингредиенты: ' + (ingStr || '—') + '\n\n' +
      (data.appearance ? ('Внешний вид: ' + data.appearance + '\n\n') : '') +
      'Эффект:\n' + (data.effect || '') + reasonTail;
  } else {
    return '⭐ ЧЕРТА: ' + (data.name || 'Черта') + ' (' + (data.category || '') + ')\n' +
      'Требования: ' + (data.prereq || 'Без требований') + '\n' +
      (data.statBonus ? ('Бонус характеристик: ' + data.statBonus + '\n\n') : '\n') +
      (data.desc || '') + (Array.isArray(data.features) ? ('\n\n• ' + data.features.join('\n• ')) : '') +
      reasonTail;
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

  var reasoningHtml = data.aiReasoning
    ? '<div class="fae-gen-block" style="border-left-color:#38bdf8;background:rgba(14,30,48,0.52);margin-top:14px;">' +
        '<b style="color:#7dd3fc;">💭 Замысел ИИ, баланс и советы по отыгрышу:</b><br>' +
        '<span style="color:#cbd5e1;font-size:13.2px;white-space:pre-line;">' + escapeHtml(data.aiReasoning) + '</span>' +
      '</div>'
    : '';

  return '<div class="ai-gen-result-card">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">' +
      headerBadge +
      '<button class="btn-ghost" id="btnFaeCopyResult" style="font-size:12px;">📋 Копировать текст</button>' +
    '</div>' +
    bodyContent +
    reasoningHtml +
    '<div class="rule" style="margin:16px 0;"></div>' +
    '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">' +
      actionButtons +
      '<button class="btn-ghost" id="btnFaeRegen">🔄 Сгенерировать снова</button>' +
      '<button class="btn-ghost" id="btnFaeBackForm">← Назад к идее и параметрам</button>' +
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
  var curThinking = window._faeGenThinkingMode || 'deep_lore';
  var def = getFaeGenCatDef(curCat);

  var hero = getActiveFaerunCharacter();
  var ctxSummary = [];
  if(hero && hero.name){
    var heroMeta = [
      hero.species || 'Герой',
      (hero.className || 'Воин') + (hero.subclass ? ' — ' + hero.subclass : '') + ' ' + (hero.level || 1) + ' ур.'
    ];
    if(hero.background) heroMeta.push(hero.background);
    ctxSummary.push(hero.name + ' (' + heroMeta.join(', ') + ')');
  }
  var ctxLabel = ctxSummary.length ? ctxSummary.join(' • ') : 'Активный герой из листа персонажа';

  var catCardsHtml = FAE_GEN_CATEGORIES.map(function(c){
    var isAct = c.key === curCat;
    return '<button type="button" class="fae-gen-cat-card' + (isAct ? ' active' : '') + '" data-fae-gen-cat="' + c.key + '">' +
      '<div class="fae-gen-cat-top"><span>' + c.icon + '</span><span>' + escapeHtml(c.title) + '</span></div>' +
      '<div class="fae-gen-cat-sub">' + escapeHtml(c.sub) + '</div>' +
    '</button>';
  }).join('');

  var thinkingCardsHtml = FAE_GEN_THINKING_MODES.map(function(m){
    var isAct = m.key === curThinking;
    return '<button type="button" class="fae-gen-thinking-card' + (isAct ? ' active' : '') + '" data-fae-thinking-mode="' + m.key + '">' +
      '<div class="fae-gen-thinking-title"><span>' + m.icon + '</span><span>' + escapeHtml(m.title) + '</span></div>' +
      '<div class="fae-gen-thinking-desc">' + escapeHtml(m.desc) + '</div>' +
    '</button>';
  }).join('');

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'AI Генератор D&D'}]) +
    renderFaeGenHintsDock(curCat) +
    '<button class="back" data-go="home">← В меню Фаэруна</button>' +
    '<h1><span class="h1-icon">🤖</span> AI Генератор D&D 5e / 2024</h1>' +
    '<p class="subtitle">Творческая кузница Забытых Королевств: пишите идею в свободной форме — ИИ сам продумает лор, баланс 2024 и все недостающие параметры.</p>' +
    '<div class="fae-rule"></div>' +

    '<div id="faeGenFormSection" class="ai-gen-card">' +
      '<div class="section-label" style="margin-top:0;margin-bottom:10px;">1. КАТЕГОРИЯ СОТВОРЕНИЯ</div>' +
      '<div class="fae-gen-cat-grid" id="faeGenCatGrid">' +
        catCardsHtml +
      '</div>' +
      '<input type="hidden" id="faeGenCat" value="' + escapeAttr(curCat) + '">' +

      '<div class="ai-gen-field" style="margin-top:6px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
          '<label class="ai-gen-label" id="faeGenThemeLabel" style="color:#fde68a;font-size:13px;">' + escapeHtml(def.themeLabel) + '</label>' +
          '<button type="button" class="btn-ghost" id="btnFaeClearTheme" style="font-size:11px;padding:3px 9px;">✕ Очистить текст</button>' +
        '</div>' +
        '<textarea class="ai-gen-textarea fae-gen-idea-textarea" id="faeGenTheme" rows="6" placeholder="' + escapeAttr(def.themePlaceholder) + '"></textarea>' +
      '</div>' +

      '<div style="margin-top:16px;">' +
        '<div class="section-label" style="margin:0 0 4px;">2. РЕЖИМ МЫШЛЕНИЯ И ТВОРЧЕСКОЙ СВОБОДЫ ИИ</div>' +
        '<div class="fae-gen-thinking-grid" id="faeGenThinkingGrid">' +
          thinkingCardsHtml +
        '</div>' +
        '<input type="hidden" id="faeGenThinkingMode" value="' + escapeAttr(curThinking) + '">' +
      '</div>' +

      '<div class="fae-gen-opt-box">' +
        '<div class="fae-gen-opt-header">' +
          '<div>' +
            '<div class="section-label" style="margin:0;">3. ТОЧЕЧНЫЕ РАМКИ И ПАРАМЕТРЫ (ОПЦИОНАЛЬНО)</div>' +
            '<div style="font-size:12px;color:#94a3b8;margin-top:2px;">Оставьте «🎲 На усмотрение ИИ», чтобы не ограничивать фантазию генератора жёсткими рамками.</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
            '<span class="fae-gen-opt-badge" id="faeGenOptCountBadge">🎲 Все параметры: ИИ решает сам</span>' +
            '<button type="button" class="btn-ghost" id="btnFaeResetOptional" style="font-size:11.5px;padding:4px 10px;">↺ Сбросить всё на выбор ИИ</button>' +
          '</div>' +
        '</div>' +

        '<div id="faeGenExtraFields" style="margin-top:10px;">' +
          renderFaeGenExtraFields(curCat) +
        '</div>' +

        '<div class="ai-gen-field" style="margin-top:14px;">' +
          '<label class="ai-gen-label">Дополнительные механические условия или детали (опционально)</label>' +
          '<textarea class="ai-gen-textarea" id="faeGenReq" rows="2" placeholder="' + escapeAttr(def.reqPlaceholder) + '"></textarea>' +
        '</div>' +
      '</div>' +

      '<div style="margin-top:14px;padding:9px 12px;background:rgba(15,23,42,0.65);border:1px solid rgba(201,164,92,0.25);border-radius:6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
        '<input type="checkbox" id="faeGenUseContext" checked style="width:16px;height:16px;accent-color:#c9a45c;cursor:pointer;">' +
        '<label for="faeGenUseContext" style="font-size:13px;color:#e2e8f0;cursor:pointer;flex:1;">' +
          '🎯 <b>Учитывать активного героя из листа персонажа:</b> <span style="color:#c9a45c;">' + escapeHtml(ctxLabel) + '</span>' +
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

function updateFaeGenOptBadge(){
  var badge = document.getElementById('faeGenOptCountBadge');
  var wrap = document.getElementById('faeGenExtraFields');
  if(!badge || !wrap) return;
  var selects = wrap.querySelectorAll('select');
  var fixedCount = 0;
  selects.forEach(function(s){
    if(s.value && s.value !== 'auto') fixedCount++;
  });
  var reqInp = document.getElementById('faeGenReq');
  if(reqInp && reqInp.value.trim()) fixedCount++;
  if(fixedCount === 0){
    badge.textContent = '🎲 Все параметры: ИИ решает сам';
    badge.style.borderColor = 'rgba(201, 164, 92, 0.35)';
    badge.style.color = '#fde68a';
  } else {
    badge.textContent = '🎯 Задано вручную: ' + fixedCount + ' (остальное — ИИ)';
    badge.style.borderColor = '#38bdf8';
    badge.style.color = '#7dd3fc';
  }
}

function wireFaeGenHintsDockEvents(){
  var collapseBtn = document.getElementById('faeGenHintsCollapseBtn');
  var expandTab = document.getElementById('faeGenHintsTab');
  if(collapseBtn){
    collapseBtn.onclick = function(){
      toggleFaeGenHintsDock(true);
    };
  }
  if(expandTab){
    expandTab.onclick = function(){
      toggleFaeGenHintsDock(false);
    };
  }
  var catInp = document.getElementById('faeGenCat');
  var curCat = catInp ? catInp.value : (window._faeGenActiveCat || 'quest');
  var def = getFaeGenCatDef(curCat);
  var themeInp = document.getElementById('faeGenTheme');

  document.querySelectorAll('[data-fae-hint-idx]').forEach(function(chip){
    chip.onclick = function(){
      var idx = parseInt(chip.getAttribute('data-fae-hint-idx'), 10);
      var hook = def.hintHooks && def.hintHooks[idx];
      if(!hook || !themeInp) return;
      var cur = themeInp.value.trim();
      themeInp.value = cur ? (cur + '\n• ' + hook.text) : hook.text;
      themeInp.focus();
    };
  });
}

function wireFaeGenPresetsAndHistory(){
  wireFaeGenHintsDockEvents();

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
  var hintsPanel = document.getElementById('faeGenHintsPanel');
  var thinkingInp = document.getElementById('faeGenThinkingMode');

  function bindExtraSelectListeners(){
    if(!extraWrap) return;
    extraWrap.querySelectorAll('select').forEach(function(sel){
      sel.addEventListener('change', updateFaeGenOptBadge);
    });
    updateFaeGenOptBadge();
  }

  if(reqInp){
    reqInp.addEventListener('input', updateFaeGenOptBadge);
  }
  bindExtraSelectListeners();

  var clearThemeBtn = document.getElementById('btnFaeClearTheme');
  if(clearThemeBtn && themeInp){
    clearThemeBtn.addEventListener('click', function(){
      themeInp.value = '';
      themeInp.focus();
    });
  }

  var resetOptBtn = document.getElementById('btnFaeResetOptional');
  if(resetOptBtn){
    resetOptBtn.addEventListener('click', function(){
      var curCat = catInp ? catInp.value : (window._faeGenActiveCat || 'quest');
      if(extraWrap) extraWrap.innerHTML = renderFaeGenExtraFields(curCat);
      if(reqInp) reqInp.value = '';
      if(typeof enhanceAllCustomSelects === 'function') enhanceAllCustomSelects();
      bindExtraSelectListeners();
    });
  }

  document.querySelectorAll('[data-fae-thinking-mode]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var mode = btn.getAttribute('data-fae-thinking-mode') || 'deep_lore';
      window._faeGenThinkingMode = mode;
      if(thinkingInp) thinkingInp.value = mode;
      document.querySelectorAll('[data-fae-thinking-mode]').forEach(function(b){
        b.classList.toggle('active', b === btn);
      });
    });
  });

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
      if(extraWrap) extraWrap.innerHTML = renderFaeGenExtraFields(cat);
      if(hintsPanel) hintsPanel.innerHTML = renderFaeGenHintsDockContent(cat);
      if(typeof enhanceAllCustomSelects === 'function') enhanceAllCustomSelects();
      bindExtraSelectListeners();
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
      var thinkingMode = thinkingInp ? thinkingInp.value : (window._faeGenThinkingMode || 'deep_lore');
      var useCtx = document.getElementById('faeGenUseContext') && document.getElementById('faeGenUseContext').checked;

      var contextInfo = '';
      if(useCtx){
        var hero = getActiveFaerunCharacter();
        var parts = [];
        if(hero && hero.name){
          parts.push('Активный герой: ' + hero.name + ' (' + (hero.species || 'Человек') + ', ' + (hero.className || 'Воин') + ' ' + (hero.level || 1) + ' ур.' + (hero.subclass ? (', подкласс: ' + hero.subclass) : '') + (hero.background ? (', предыстория: ' + hero.background) : '') + ')');
        }
        contextInfo = parts.join('; ');
      }

      var v = function(id){ var el = document.getElementById(id); return el ? el.value : ''; };
      var opts = { cat: cat, theme: theme, req: req, thinkingMode: thinkingMode, contextInfo: contextInfo };

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
        opts.school = v('faeGenSchool');
        var rawLvl = v('faeGenLevel');
        opts.level = (rawLvl === '' || rawLvl === 'auto') ? 'auto' : parseInt(rawLvl, 10);
        opts.spellClass = v('faeGenSpellClass');
        opts.spellAction = v('faeGenSpellAction');
      } else if(cat === 'item'){
        opts.rarity = v('faeGenRarity');
        opts.itemType = v('faeGenItemType');
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
        opts.alchKit = v('faeGenAlchKit');
      } else {
        opts.featCat = v('faeGenFeatCat');
        opts.featFocus = v('faeGenFeatFocus');
      }

      btnGen.disabled = true;
      btnGen.textContent = '🔮 ИИ обдумывает замысел в Плетении магии...';

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
    title: 'Хроники Забытых Королевств',
    location: '',
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
    '<p class="subtitle">Единый компендиум D&D 5e: Классы и архетипы, Книга заклинаний по школам, Карта Фаэруна, Правила 2024, Алхимия, Оружие и Глоссарий терминов.</p>' +
    '<div class="fae-rule"></div>' +

    '<div class="fae-ref-search-wrap">' +
      '<span class="fae-ref-search-icon">🔍</span>' +
      '<input type="text" id="faeRefSearch" class="fae-ref-search-input" placeholder="Быстрый поиск по справочнику (классы, школы магии, заклинания, карта, состояния, оружие, алхимия)..." autocomplete="off">' +
    '</div>' +

    '<div id="faeRefSearchResults" style="display:none;margin-bottom:20px;"></div>' +

    '<div class="menu-list grid-2" id="faeRefDefaultCards">' +
      '<div class="fae-card fae-card-clickable" data-go="classes" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="fae-card-title"><span>⚔️</span> Классы и Архетипы (14 классов • 140 подклассов)</div>' +
          '<div class="fae-card-desc">Полный справочник всех 14 классов D&D 5e / 2024: умения 1–20 уровня, хиты, владения и все 140 существующих подклассов (архетипов)</div>' +
        '</div>' +
        '<div class="fae-card-arrow">→</div>' +
      '</div>' +

      '<div class="fae-card fae-card-clickable" data-go="magic" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="fae-card-title"><span>✨</span> Книга заклинаний (8 школ • ' + (Array.isArray(SPELLS) ? SPELLS.length : 0) + ' заклинаний)</div>' +
          '<div class="fae-card-desc">Полная энциклопедия заклинаний D&D 5e / 2024 по 8 школам магии: заговоры, круги 1–9, ритуалы, концентрация и фильтр по классам</div>' +
        '</div>' +
        '<div class="fae-card-arrow">→</div>' +
      '</div>' +

      '<div class="fae-card fae-card-clickable" data-go="map" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="fae-card-title"><span>🗺️</span> Карта Фаэруна</div>' +
          '<div class="fae-card-desc">Интерактивная карта Забытых Королевств: Побережье Мечей, Врата Балдура, Уотердип, Невервинтер и регионы</div>' +
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

      '<div class="fae-card fae-card-clickable" data-go="glossary" role="button" tabindex="0">' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="fae-card-title"><span>📖</span> Глоссарий терминов</div>' +
          '<div class="fae-card-desc">Плетение Мистры (The Weave) и каноничный отыгрыш магии, бой оружием, фехтовальные стойки, атаки и термины</div>' +
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

      if('карта фаэруна побережье мечей врата балдура невервинтер уотердип забытые королевства map faerun'.indexOf(q) !== -1){
        matches.push({
          badge: '🗺️ География',
          title: 'Карта Фаэруна (Interactive Map)',
          desc: 'Интерактивная карта Забытых Королевств: Побережье Мечей, Врата Балдура, Уотердип, Невервинтер и регионы.',
          go: 'map'
        });
      }

      // 0. Classes, Base Features & Subclasses
      if(typeof DATA !== 'undefined'){
        Object.keys(DATA).forEach(function(clsKey){
          var cls = DATA[clsKey];
          if(!cls) return;
          var cn = (cls.name || '').toLowerCase();
          var ce = (cls.en || '').toLowerCase();
          var cd = (cls.summary || '').toLowerCase();
          if(cn.indexOf(q) !== -1 || ce.indexOf(q) !== -1 || cd.indexOf(q) !== -1){
            matches.push({
              badge: (cls.icon || '⚔️') + ' Класс',
              title: cls.name + (cls.en ? (' (' + cls.en + ')') : ''),
              desc: (cls.hitDie ? ('Кость хитов: ' + cls.hitDie + ' • ') : '') + (cls.summary ? cls.summary.slice(0, 140) : ''),
              go: 'class:' + clsKey
            });
          }
          if(Array.isArray(cls.baseFeatures)){
            cls.baseFeatures.forEach(function(ft){
              var fTitle = ft.ru || ft.name || '';
              var fn = fTitle.toLowerCase();
              var fe = (ft.en || '').toLowerCase();
              var fd = (ft.desc || '').toLowerCase();
              if(fn.indexOf(q) !== -1 || fe.indexOf(q) !== -1 || fd.indexOf(q) !== -1){
                matches.push({
                  badge: (cls.icon || '⚔️') + ' ' + cls.name + ' (Ур. ' + (ft.level || 1) + ')',
                  title: fTitle + (ft.en ? (' (' + ft.en + ')') : ''),
                  desc: ft.desc ? ft.desc.slice(0, 140) + '...' : '',
                  go: 'class:' + clsKey
                });
              }
            });
          }
          if(cls.subclasses){
            Object.keys(cls.subclasses).forEach(function(sk){
              var sub = cls.subclasses[sk];
              if(!sub) return;
              var sn = (sub.name || '').toLowerCase();
              var se = (sub.en || '').toLowerCase();
              var sd = ((sub.shortDesc || '') + ' ' + (sub.lore || '')).toLowerCase();
              if(sn.indexOf(q) !== -1 || se.indexOf(q) !== -1 || sd.indexOf(q) !== -1){
                matches.push({
                  badge: (sub.icon || cls.icon || '🎖️') + ' Подкласс (' + cls.name + ')',
                  title: sub.name + (sub.en ? (' (' + sub.en + ')') : ''),
                  desc: (sub.shortDesc || sub.lore || '').slice(0, 140),
                  go: 'subclass:' + clsKey + ':' + sk
                });
              }
              if(Array.isArray(sub.features)){
                sub.features.forEach(function(sft){
                  var sfTitle = sft.ru || sft.name || '';
                  var sfn = sfTitle.toLowerCase();
                  var sfe = (sft.en || '').toLowerCase();
                  var sfd = (sft.desc || '').toLowerCase();
                  if(sfn.indexOf(q) !== -1 || sfe.indexOf(q) !== -1 || sfd.indexOf(q) !== -1){
                    matches.push({
                      badge: '🎖️ ' + sub.name + ' (Ур. ' + (sft.level || 3) + ')',
                      title: sfTitle + (sft.en ? (' (' + sft.en + ')') : ''),
                      desc: sft.desc ? sft.desc.slice(0, 140) + '...' : '',
                      go: 'subclass:' + clsKey + ':' + sk
                    });
                  }
                });
              }
            });
          }
        });
      }

      // 1. Spells
      if(Array.isArray(SPELLS)){
        SPELLS.forEach(function(sp){
          var n = (sp.name || '').toLowerCase();
          var en = (sp.en || '').toLowerCase();
          var sc = (schoolName(sp.school) + ' ' + (sp.school || '')).toLowerCase();
          var cls = (sp.classes || '').toLowerCase();
          var effText = sp.effect || sp.desc || '';
          var d = effText.toLowerCase();
          if(n.indexOf(q) !== -1 || en.indexOf(q) !== -1 || sc.indexOf(q) !== -1 || cls.indexOf(q) !== -1 || d.indexOf(q) !== -1){
            matches.push({
              badge: '✨ Заклинание (' + schoolName(sp.school) + ')',
              title: sp.name + (sp.en ? (' / ' + sp.en) : '') + ' — ' + (sp.level ? (sp.level + ' круг') : 'Заговор'),
              desc: (sp.classes ? ('[' + sp.classes + '] ') : '') + (effText ? effText.slice(0, 140) + '...' : ''),
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

      // 6. Glossary & Weave Lore
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

      var weaveLists = [
        typeof WEAVE_LORE_FUNDAMENTALS !== 'undefined' ? WEAVE_LORE_FUNDAMENTALS : [],
        typeof WEAVE_LORE_COMPONENTS !== 'undefined' ? WEAVE_LORE_COMPONENTS : [],
        typeof WEAVE_LORE_CLASSES !== 'undefined' ? WEAVE_LORE_CLASSES : [],
        typeof WEAVE_LORE_SCHOOLS !== 'undefined' ? WEAVE_LORE_SCHOOLS : []
      ];
      weaveLists.forEach(function(arr){
        if(!Array.isArray(arr)) return;
        arr.forEach(function(item){
          var iru = (item.ru || '').toLowerCase();
          var iorig = (item.orig || '').toLowerCase();
          var idesc = (item.desc || '').toLowerCase();
          if(iru.indexOf(q) !== -1 || iorig.indexOf(q) !== -1 || idesc.indexOf(q) !== -1){
            matches.push({
              badge: '✨ Плетение Мистры (Глоссарий)',
              title: item.ru + (item.orig ? (' — ' + item.orig) : ''),
              desc: item.desc ? item.desc.slice(0, 150) + '...' : '',
              go: 'weaveLore'
            });
          }
        });
      });

      if(typeof WEAVE_ROLEPLAY_EXAMPLES !== 'undefined' && Array.isArray(WEAVE_ROLEPLAY_EXAMPLES)){
        WEAVE_ROLEPLAY_EXAMPLES.forEach(function(ex){
          var et = (ex.title || '').toLowerCase();
          var eg = (ex.tag || '').toLowerCase();
          var exText = (ex.text || '').toLowerCase();
          if(et.indexOf(q) !== -1 || eg.indexOf(q) !== -1 || exText.indexOf(q) !== -1 || 'отыгрыш плетение магия'.indexOf(q) !== -1){
            matches.push({
              badge: '🎭 Отыгрыш Плетения (' + (ex.tag || 'Магия') + ')',
              title: ex.title,
              desc: ex.text ? ex.text.slice(0, 150) + '...' : '',
              go: 'weaveLore'
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

/* ============================================================
   ТЕМЫ КЛАССОВ ФАЭРУНА (14 КЛАССОВ D&D + КЛАССИКА)
   ============================================================ */
var FAE_THEME_STORAGE_KEY = 'ttc_fae_theme';

var FAE_THEMES = [
  {
    id: 'faerun',
    title: 'Побережье Мечей',
    sub: 'Классическое золото и латунь Фаэруна',
    icon: '🐉',
    accent: '#c9a45c',
    accentBright: '#fbbf24',
    accentDim: 'rgba(201,164,92,0.40)',
    accentSoft: 'rgba(201,164,92,0.14)',
    glow: 'rgba(201,164,92,0.45)',
    secondary: '#b8404c',
    secondaryGlow: 'rgba(184,64,76,0.35)',
    bg0: '#0c0f14',
    bg1: 'rgba(20,24,32,0.90)',
    bg2: 'rgba(28,34,45,0.95)',
    radialTop: 'rgba(201,164,92,0.15)',
    radialBot: 'rgba(184,64,76,0.10)',
    ember1: '#fbbf24',
    ember2: '#f87171',
    spin: true,
    toast: '🐉 Тема Фаэруна: Побережье Мечей • Классика D&D'
  },
  {
    id: 'barbarian',
    title: 'Варвар',
    sub: 'Первобытная Ярость • Багровый уголь и секиры',
    icon: '🪓',
    accent: '#ef4444',
    accentBright: '#f97316',
    accentDim: 'rgba(239,68,68,0.42)',
    accentSoft: 'rgba(239,68,68,0.15)',
    glow: 'rgba(239,68,68,0.48)',
    secondary: '#ea580c',
    secondaryGlow: 'rgba(249,115,22,0.40)',
    bg0: '#120808',
    bg1: 'rgba(28,13,13,0.92)',
    bg2: 'rgba(40,18,16,0.96)',
    radialTop: 'rgba(239,68,68,0.20)',
    radialBot: 'rgba(249,115,22,0.14)',
    ember1: '#f97316',
    ember2: '#ef4444',
    spin: false,
    toast: '🪓 Тема класса: Варвар • Первобытная Ярость'
  },
  {
    id: 'bard',
    title: 'Бард',
    sub: 'Коллегия Вдохновения • Пурпурный бархат и ноты',
    icon: '🎻',
    accent: '#c084fc',
    accentBright: '#f472b6',
    accentDim: 'rgba(192,132,252,0.42)',
    accentSoft: 'rgba(192,132,252,0.15)',
    glow: 'rgba(192,132,252,0.48)',
    secondary: '#fbbf24',
    secondaryGlow: 'rgba(251,191,36,0.38)',
    bg0: '#100a19',
    bg1: 'rgba(25,16,38,0.91)',
    bg2: 'rgba(36,22,54,0.96)',
    radialTop: 'rgba(192,132,252,0.18)',
    radialBot: 'rgba(244,114,182,0.13)',
    ember1: '#f472b6',
    ember2: '#fde047',
    spin: false,
    toast: '🎻 Тема класса: Бард • Симфония Вдохновения'
  },
  {
    id: 'cleric',
    title: 'Жрец',
    sub: 'Божественное Сияние • Храмовое золото и перья света',
    icon: '☀️',
    accent: '#eab308',
    accentBright: '#fef08a',
    accentDim: 'rgba(234,179,8,0.44)',
    accentSoft: 'rgba(250,204,21,0.15)',
    glow: 'rgba(250,204,21,0.50)',
    secondary: '#38bdf8',
    secondaryGlow: 'rgba(56,189,248,0.35)',
    bg0: '#111009',
    bg1: 'rgba(27,24,14,0.91)',
    bg2: 'rgba(38,34,19,0.96)',
    radialTop: 'rgba(250,204,21,0.20)',
    radialBot: 'rgba(254,240,138,0.12)',
    ember1: '#fef08a',
    ember2: '#fbbf24',
    spin: true,
    toast: '☀️ Тема класса: Жрец • Священный Свет Небожителей'
  },
  {
    id: 'druid',
    title: 'Друид',
    sub: 'Круг Дикой Природы • Изумрудная чаща и листва',
    icon: '🌿',
    accent: '#10b981',
    accentBright: '#4ade80',
    accentDim: 'rgba(16,185,129,0.42)',
    accentSoft: 'rgba(16,185,129,0.15)',
    glow: 'rgba(16,185,129,0.48)',
    secondary: '#a3e635',
    secondaryGlow: 'rgba(163,230,53,0.36)',
    bg0: '#07120d',
    bg1: 'rgba(12,28,20,0.91)',
    bg2: 'rgba(17,39,28,0.96)',
    radialTop: 'rgba(16,185,129,0.18)',
    radialBot: 'rgba(132,204,22,0.12)',
    ember1: '#4ade80',
    ember2: '#bef264',
    spin: false,
    toast: '🌿 Тема класса: Друид • Дыхание Древней Рощи'
  },
  {
    id: 'fighter',
    title: 'Воин',
    sub: 'Мастер Боя • Воронёная сталь, бронза и клинки',
    icon: '⚔️',
    accent: '#94a3b8',
    accentBright: '#e2e8f0',
    accentDim: 'rgba(148,163,184,0.42)',
    accentSoft: 'rgba(148,163,184,0.14)',
    glow: 'rgba(226,232,240,0.42)',
    secondary: '#dc2626',
    secondaryGlow: 'rgba(220,38,38,0.38)',
    bg0: '#0b0e13',
    bg1: 'rgba(19,24,32,0.92)',
    bg2: 'rgba(28,35,46,0.96)',
    radialTop: 'rgba(148,163,184,0.17)',
    radialBot: 'rgba(220,38,38,0.13)',
    ember1: '#e2e8f0',
    ember2: '#f87171',
    spin: false,
    toast: '⚔️ Тема класса: Воин • Сталь и Превосходство'
  },
  {
    id: 'monk',
    title: 'Монах',
    sub: 'Путь Энергии Ци • Нефритовый лотос и потоки ветра',
    icon: '👊',
    accent: '#06b6d4',
    accentBright: '#67e8f9',
    accentDim: 'rgba(6,182,212,0.42)',
    accentSoft: 'rgba(6,182,212,0.15)',
    glow: 'rgba(34,211,238,0.48)',
    secondary: '#2dd4bf',
    secondaryGlow: 'rgba(45,212,191,0.38)',
    bg0: '#061116',
    bg1: 'rgba(11,26,34,0.91)',
    bg2: 'rgba(16,37,48,0.96)',
    radialTop: 'rgba(6,182,212,0.19)',
    radialBot: 'rgba(45,212,191,0.13)',
    ember1: '#67e8f9',
    ember2: '#5eead4',
    spin: true,
    toast: '👊 Тема класса: Монах • Гармония Потоков Ци'
  },
  {
    id: 'paladin',
    title: 'Паладин',
    sub: 'Священная Клятва • Платиновый щит и Божественная Кара',
    icon: '🛡️',
    accent: '#f59e0b',
    accentBright: '#fde047',
    accentDim: 'rgba(245,158,11,0.44)',
    accentSoft: 'rgba(253,224,71,0.15)',
    glow: 'rgba(253,224,71,0.50)',
    secondary: '#60a5fa',
    secondaryGlow: 'rgba(96,165,250,0.40)',
    bg0: '#0a0f18',
    bg1: 'rgba(16,24,38,0.92)',
    bg2: 'rgba(24,34,52,0.96)',
    radialTop: 'rgba(253,224,71,0.18)',
    radialBot: 'rgba(96,165,250,0.15)',
    ember1: '#fde047',
    ember2: '#93c5fd',
    spin: false,
    toast: '🛡️ Тема класса: Паладин • Сияние Священной Клятвы'
  },
  {
    id: 'ranger',
    title: 'Следопыт',
    sub: 'Охотник Пограничья • Хвойный туман и стрелы',
    icon: '🏹',
    accent: '#22c55e',
    accentBright: '#86efac',
    accentDim: 'rgba(34,197,94,0.40)',
    accentSoft: 'rgba(34,197,94,0.14)',
    glow: 'rgba(34,197,94,0.45)',
    secondary: '#d97706',
    secondaryGlow: 'rgba(217,119,6,0.38)',
    bg0: '#08110a',
    bg1: 'rgba(14,26,17,0.92)',
    bg2: 'rgba(21,37,25,0.96)',
    radialTop: 'rgba(34,197,94,0.17)',
    radialBot: 'rgba(217,119,6,0.13)',
    ember1: '#86efac',
    ember2: '#fbbf24',
    spin: false,
    toast: '🏹 Тема класса: Следопыт • Тропа Дикого Охотника'
  },
  {
    id: 'rogue',
    title: 'Плут',
    sub: 'Тень Гильдии • Полуночный клинок, яд и золото',
    icon: '🗡️',
    accent: '#a855f7',
    accentBright: '#d8b4fe',
    accentDim: 'rgba(168,85,247,0.42)',
    accentSoft: 'rgba(168,85,247,0.14)',
    glow: 'rgba(168,85,247,0.46)',
    secondary: '#f43f5e',
    secondaryGlow: 'rgba(244,63,94,0.38)',
    bg0: '#09070f',
    bg1: 'rgba(17,13,26,0.93)',
    bg2: 'rgba(26,20,38,0.97)',
    radialTop: 'rgba(168,85,247,0.17)',
    radialBot: 'rgba(244,63,94,0.12)',
    ember1: '#d8b4fe',
    ember2: '#fb7185',
    spin: false,
    toast: '🗡️ Тема класса: Плут • Шёпот Ночных Теней'
  },
  {
    id: 'sorcerer',
    title: 'Чародей',
    sub: 'Первородная Искра • Буря Дикой Магии и астрал',
    icon: '🔥',
    accent: '#ec4899',
    accentBright: '#f472b6',
    accentDim: 'rgba(236,72,153,0.44)',
    accentSoft: 'rgba(236,72,153,0.15)',
    glow: 'rgba(236,72,153,0.50)',
    secondary: '#8b5cf6',
    secondaryGlow: 'rgba(139,92,246,0.42)',
    bg0: '#120714',
    bg1: 'rgba(28,12,32,0.92)',
    bg2: 'rgba(40,17,46,0.96)',
    radialTop: 'rgba(236,72,153,0.20)',
    radialBot: 'rgba(139,92,246,0.16)',
    ember1: '#f472b6',
    ember2: '#a78bfa',
    spin: true,
    toast: '🔥 Тема класса: Чародей • Всплеск Первородной Магии'
  },
  {
    id: 'warlock',
    title: 'Колдун',
    sub: 'Договор Покровителя • Око Бездны и мистический огонь',
    icon: '👁️',
    accent: '#9333ea',
    accentBright: '#c084fc',
    accentDim: 'rgba(147,51,234,0.44)',
    accentSoft: 'rgba(147,51,234,0.16)',
    glow: 'rgba(168,85,247,0.50)',
    secondary: '#10b981',
    secondaryGlow: 'rgba(16,185,129,0.42)',
    bg0: '#090612',
    bg1: 'rgba(18,11,31,0.93)',
    bg2: 'rgba(27,16,45,0.97)',
    radialTop: 'rgba(147,51,234,0.20)',
    radialBot: 'rgba(16,185,129,0.15)',
    ember1: '#c084fc',
    ember2: '#34d399',
    spin: true,
    toast: '👁️ Тема класса: Колдун • Тайный Пакт Покровителя'
  },
  {
    id: 'wizard',
    title: 'Волшебник',
    sub: 'Плетение Мистры • Арканный сапфир, гримуар и руны',
    icon: '📖',
    accent: '#3b82f6',
    accentBright: '#60a5fa',
    accentDim: 'rgba(59,130,246,0.44)',
    accentSoft: 'rgba(59,130,246,0.15)',
    glow: 'rgba(59,130,246,0.50)',
    secondary: '#818cf8',
    secondaryGlow: 'rgba(129,140,248,0.40)',
    bg0: '#070b16',
    bg1: 'rgba(13,20,38,0.92)',
    bg2: 'rgba(19,30,54,0.96)',
    radialTop: 'rgba(59,130,246,0.20)',
    radialBot: 'rgba(129,140,248,0.14)',
    ember1: '#60a5fa',
    ember2: '#a5b4fc',
    spin: true,
    toast: '📖 Тема класса: Волшебник • Высшее Плетение Мистры'
  },
  {
    id: 'artificer',
    title: 'Изобретатель',
    sub: 'Эфирная Кузня • Медные шестерни и разряды инфузий',
    icon: '⚙️',
    accent: '#f59e0b',
    accentBright: '#38bdf8',
    accentDim: 'rgba(245,158,11,0.42)',
    accentSoft: 'rgba(56,189,248,0.14)',
    glow: 'rgba(56,189,248,0.48)',
    secondary: '#06b6d4',
    secondaryGlow: 'rgba(6,182,212,0.42)',
    bg0: '#0a0f14',
    bg1: 'rgba(17,24,33,0.92)',
    bg2: 'rgba(25,35,47,0.96)',
    radialTop: 'rgba(245,158,11,0.17)',
    radialBot: 'rgba(6,182,212,0.16)',
    ember1: '#38bdf8',
    ember2: '#fbbf24',
    spin: true,
    toast: '⚙️ Тема класса: Изобретатель • Техномагия и Шестерни'
  },
  {
    id: 'bloodhunter',
    title: 'Кровавый охотник',
    sub: 'Орден Гемокрафтии • Алый обряд, рубин и пепел',
    icon: '🩸',
    accent: '#e11d48',
    accentBright: '#fb7185',
    accentDim: 'rgba(225,29,72,0.44)',
    accentSoft: 'rgba(225,29,72,0.16)',
    glow: 'rgba(225,29,72,0.52)',
    secondary: '#9f1239',
    secondaryGlow: 'rgba(159,18,57,0.42)',
    bg0: '#100609',
    bg1: 'rgba(26,10,16,0.93)',
    bg2: 'rgba(38,14,23,0.97)',
    radialTop: 'rgba(225,29,72,0.21)',
    radialBot: 'rgba(159,18,57,0.15)',
    ember1: '#fb7185',
    ember2: '#e11d48',
    spin: false,
    toast: '🩸 Тема класса: Кровавый охотник • Печать Алого Обряда'
  }
];

function getFaerunTheme(){
  try {
    var saved = localStorage.getItem(FAE_THEME_STORAGE_KEY);
    if(saved && FAE_THEMES.some(function(t){ return t.id === saved; })) return saved;
  } catch(e){}
  return 'faerun';
}

function resolveFaerunThemeId(raw){
  var s = String(raw || '').trim().toLowerCase();
  if(!s) return 'faerun';
  var exact = FAE_THEMES.find(function(t){ return t.id === s; });
  if(exact) return exact.id;
  if(s.indexOf('варвар') !== -1 || s.indexOf('barbarian') !== -1) return 'barbarian';
  if(s.indexOf('бард') !== -1 || s.indexOf('bard') !== -1) return 'bard';
  if(s.indexOf('жрец') !== -1 || s.indexOf('клирик') !== -1 || s.indexOf('cleric') !== -1) return 'cleric';
  if(s.indexOf('друид') !== -1 || s.indexOf('druid') !== -1) return 'druid';
  if(s.indexOf('воин') !== -1 || s.indexOf('fighter') !== -1) return 'fighter';
  if(s.indexOf('монах') !== -1 || s.indexOf('monk') !== -1) return 'monk';
  if(s.indexOf('паладин') !== -1 || s.indexOf('paladin') !== -1) return 'paladin';
  if(s.indexOf('следопыт') !== -1 || s.indexOf('рейнджер') !== -1 || s.indexOf('ranger') !== -1) return 'ranger';
  if(s.indexOf('плут') !== -1 || s.indexOf('вор') !== -1 || s.indexOf('разбойник') !== -1 || s.indexOf('rogue') !== -1) return 'rogue';
  if(s.indexOf('чародей') !== -1 || s.indexOf('sorcerer') !== -1) return 'sorcerer';
  if(s.indexOf('колдун') !== -1 || s.indexOf('чернокнижник') !== -1 || s.indexOf('warlock') !== -1) return 'warlock';
  if(s.indexOf('волшебник') !== -1 || s.indexOf('маг') !== -1 || s.indexOf('wizard') !== -1) return 'wizard';
  if(s.indexOf('изобретатель') !== -1 || s.indexOf('артифисер') !== -1 || s.indexOf('artificer') !== -1) return 'artificer';
  if(s.indexOf('кровав') !== -1 || s.indexOf('blood') !== -1) return 'bloodhunter';
  return 'faerun';
}

function setFaerunTheme(themeName){
  var id = resolveFaerunThemeId(themeName);
  try {
    localStorage.setItem(FAE_THEME_STORAGE_KEY, id);
  } catch(e){}
  applyFaerunTheme();
  return id;
}
window.getFaerunTheme = getFaerunTheme;
window.setFaerunTheme = setFaerunTheme;
window.FAE_THEMES = FAE_THEMES;

function buildFaerunClassCrestSvg(themeId){
  switch(themeId){
    case 'barbarian':
      /* Двулезвийная боевая секира Варвара, руны Ярости и тотемное кольцо */
      return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="100" cy="100" r="86" stroke-dasharray="10 6" opacity="0.45"/>' +
        '<polygon points="100,12 122,40 160,30 146,68 184,86 152,112 170,152 130,148 116,186 100,156 84,186 70,148 30,152 48,112 16,86 54,68 40,30 78,40" opacity="0.28" fill="currentColor" fill-opacity="0.05"/>' +
        '<line x1="42" y1="158" x2="158" y2="42" stroke-width="5"/>' +
        '<line x1="158" y1="158" x2="42" y2="42" stroke-width="5"/>' +
        '<path d="M126 36 C152 20, 178 46, 164 74 C148 60, 138 50, 126 36 Z" fill="currentColor" fill-opacity="0.18" stroke-width="3"/>' +
        '<path d="M74 36 C48 20, 22 46, 36 74 C52 60, 62 50, 74 36 Z" fill="currentColor" fill-opacity="0.18" stroke-width="3"/>' +
        '<path d="M164 74 C180 60, 186 92, 152 104 C146 88, 152 80, 164 74 Z" fill="currentColor" fill-opacity="0.14"/>' +
        '<path d="M36 74 C20 60, 14 92, 48 104 C54 88, 48 80, 36 74 Z" fill="currentColor" fill-opacity="0.14"/>' +
        '<circle cx="100" cy="100" r="22" fill="currentColor" fill-opacity="0.16" stroke-width="3"/>' +
        '<path d="M90 96 L96 102 M110 96 L104 102 M92 110 Q100 104 108 110" stroke-width="2.6"/>' +
      '</svg>';
    case 'bard':
      /* Королевская Лира Арфистов, созвездия и скрипичный ключ */
      return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="100" cy="100" r="88" stroke-opacity="0.35" stroke-dasharray="4 6"/>' +
        '<circle cx="100" cy="100" r="74" stroke-opacity="0.25"/>' +
        '<path d="M62 152 L138 152 L128 166 L72 166 Z" fill="currentColor" fill-opacity="0.16"/>' +
        '<path d="M68 152 C42 118, 46 62, 76 42 C64 70, 68 108, 84 152" stroke-width="3.2" fill="currentColor" fill-opacity="0.12"/>' +
        '<path d="M132 152 C158 118, 154 62, 124 42 C136 70, 132 108, 116 152" stroke-width="3.2" fill="currentColor" fill-opacity="0.12"/>' +
        '<path d="M66 56 Q100 40 134 56" stroke-width="3"/>' +
        '<line x1="88" y1="52" x2="88" y2="152" stroke-opacity="0.65"/>' +
        '<line x1="96" y1="50" x2="96" y2="152" stroke-opacity="0.65"/>' +
        '<line x1="104" y1="50" x2="104" y2="152" stroke-opacity="0.65"/>' +
        '<line x1="112" y1="52" x2="112" y2="152" stroke-opacity="0.65"/>' +
        '<path d="M100 22 L104 32 L114 36 L104 40 L100 50 L96 40 L86 36 L96 32 Z" fill="currentColor" fill-opacity="0.25"/>' +
      '</svg>';
    case 'cleric':
      /* Сияющий солнечный нимб и крылья небожителя */
      return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<g class="fae-spin-ring">' +
          '<circle cx="100" cy="100" r="86" stroke-dasharray="6 6" opacity="0.45"/>' +
          '<polygon points="100,8 112,38 146,20 136,54 172,54 148,82 184,100 148,118 172,146 136,146 146,180 112,162 100,192 88,162 54,180 64,146 28,146 52,118 16,100 52,82 28,54 64,54 54,20 88,38" opacity="0.24" fill="currentColor" fill-opacity="0.06"/>' +
        '</g>' +
        '<path d="M82 106 C50 96, 26 70, 22 40 C44 54, 66 64, 86 78 C56 76, 34 62, 26 48" stroke-width="2.6" fill="currentColor" fill-opacity="0.14"/>' +
        '<path d="M118 106 C150 96, 174 70, 178 40 C156 54, 134 64, 114 78 C144 76, 166 62, 174 48" stroke-width="2.6" fill="currentColor" fill-opacity="0.14"/>' +
        '<circle cx="100" cy="100" r="30" fill="currentColor" fill-opacity="0.18" stroke-width="3"/>' +
        '<path d="M100 46 L100 154 M54 100 L146 100" stroke-width="3.8"/>' +
        '<circle cx="100" cy="100" r="10" fill="currentColor" fill-opacity="0.35"/>' +
      '</svg>';
    case 'druid':
      /* Мировое Древо, полумесяц и круг природы */
      return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="100" cy="100" r="84" opacity="0.45"/>' +
        '<circle cx="100" cy="100" r="76" stroke-dasharray="8 5" opacity="0.35"/>' +
        '<path d="M100 166 L100 86" stroke-width="5"/>' +
        '<path d="M100 144 C82 154, 64 166, 54 176 M100 144 C118 154, 136 166, 146 176 M100 156 C88 166, 78 176, 72 182 M100 156 C112 166, 122 176, 128 182" stroke-width="2.5"/>' +
        '<path d="M100 96 C78 82, 58 64, 52 44 M100 96 C122 82, 142 64, 148 44 M100 80 C84 62, 76 44, 78 28 M100 80 C116 62, 124 44, 122 28" stroke-width="2.8"/>' +
        '<circle cx="100" cy="68" r="44" fill="currentColor" fill-opacity="0.12" stroke-dasharray="5 4"/>' +
        '<path d="M74 34 A34 34 0 1 0 126 34 A26 26 0 1 1 74 34 Z" fill="currentColor" fill-opacity="0.22"/>' +
      '</svg>';
    case 'fighter':
      /* Рыцарский щит и скрещённые двуручные мечи Мастера Боя */
      return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="100" cy="100" r="86" stroke-opacity="0.3" stroke-dasharray="12 6"/>' +
        '<line x1="34" y1="166" x2="166" y2="34" stroke-width="4.2"/>' +
        '<line x1="166" y1="166" x2="34" y2="34" stroke-width="4.2"/>' +
        '<line x1="42" y1="138" x2="62" y2="158" stroke-width="3.5"/>' +
        '<line x1="158" y1="138" x2="138" y2="158" stroke-width="3.5"/>' +
        '<path d="M56 46 L100 30 L144 46 L144 104 C144 138, 100 164, 100 172 C100 164, 56 138, 56 104 Z" fill="currentColor" fill-opacity="0.15" stroke-width="3"/>' +
        '<path d="M68 56 L100 44 L132 56 L132 102 C132 128, 100 148, 100 154 C100 148, 68 128, 68 102 Z" stroke-opacity="0.55"/>' +
        '<polygon points="100,62 110,92 130,92 114,108 120,134 100,118 80,134 86,108 70,92 90,92" fill="currentColor" fill-opacity="0.22"/>' +
      '</svg>';
    case 'monk':
      /* Восьмиугольник Багуа, священный лотос и символ Ци */
      return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<g class="fae-spin-ring">' +
          '<polygon points="100,10 164,36 190,100 164,164 100,190 36,164 10,100 36,36" stroke-width="2.2" opacity="0.45"/>' +
          '<circle cx="100" cy="100" r="76" stroke-dasharray="6 6" opacity="0.4"/>' +
        '</g>' +
        '<path d="M100 34 C116 58, 116 82, 100 100 C84 82, 84 58, 100 34 Z" fill="currentColor" fill-opacity="0.14"/>' +
        '<path d="M100 166 C116 142, 116 118, 100 100 C84 118, 84 142, 100 166 Z" fill="currentColor" fill-opacity="0.14"/>' +
        '<path d="M34 100 C58 84, 82 84, 100 100 C82 116, 58 116, 34 100 Z" fill="currentColor" fill-opacity="0.14"/>' +
        '<path d="M166 100 C142 84, 118 84, 100 100 C118 116, 142 116, 166 100 Z" fill="currentColor" fill-opacity="0.14"/>' +
        '<circle cx="100" cy="100" r="32" stroke-width="2.6" fill="currentColor" fill-opacity="0.10"/>' +
        '<path d="M100 68 A16 16 0 0 1 100 100 A16 16 0 0 0 100 132 A32 32 0 0 0 100 68 Z" fill="currentColor" fill-opacity="0.26"/>' +
        '<circle cx="100" cy="84" r="4" fill="currentColor"/>' +
        '<circle cx="100" cy="116" r="4" stroke="currentColor" stroke-width="2"/>' +
      '</svg>';
    case 'paladin':
      /* Крылатый щит Клятвы и меч Божественной Кары */
      return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="100" cy="100" r="88" stroke-dasharray="10 5" opacity="0.38"/>' +
        '<path d="M62 96 C36 86, 18 60, 16 32 C38 46, 54 60, 66 74 Z" fill="currentColor" fill-opacity="0.15"/>' +
        '<path d="M138 96 C164 86, 182 60, 184 32 C162 46, 146 60, 134 74 Z" fill="currentColor" fill-opacity="0.15"/>' +
        '<path d="M60 54 L100 38 L140 54 L140 106 C140 138, 100 162, 100 168 C100 162, 60 138, 60 106 Z" fill="currentColor" fill-opacity="0.16" stroke-width="3"/>' +
        '<line x1="100" y1="14" x2="100" y2="186" stroke-width="4.5"/>' +
        '<path d="M70 54 L130 54" stroke-width="4"/>' +
        '<polygon points="100,72 110,96 134,104 110,112 100,136 90,112 66,104 90,96" fill="currentColor" fill-opacity="0.28"/>' +
      '</svg>';
    case 'ranger':
      /* Эльфийский длинный лук, стрела и компас следопыта */
      return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="100" cy="100" r="84" stroke-dasharray="8 6" opacity="0.35"/>' +
        '<path d="M58 26 C132 54, 132 146, 58 174" stroke-width="3.6" fill="none"/>' +
        '<line x1="58" y1="26" x2="58" y2="174" stroke-width="1.8" opacity="0.75"/>' +
        '<line x1="26" y1="100" x2="172" y2="100" stroke-width="3.2"/>' +
        '<polyline points="148,86 174,100 148,114" fill="currentColor" fill-opacity="0.25" stroke-width="3"/>' +
        '<polyline points="42,90 26,100 42,110"/>' +
        '<polyline points="52,90 36,100 52,110"/>' +
        '<polygon points="100,48 108,92 152,100 108,108 100,152 92,108 48,100 92,92" fill="currentColor" fill-opacity="0.12"/>' +
      '</svg>';
    case 'rogue':
      /* Скрещённые кривые кинжалы Гильдии Воров и теневая метка */
      return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<polygon points="100,12 188,100 100,188 12,100" stroke-dasharray="8 5" opacity="0.38"/>' +
        '<polygon points="100,28 172,100 100,172 28,100" fill="currentColor" fill-opacity="0.08"/>' +
        '<path d="M40 160 C72 120, 110 82, 158 38 C134 78, 96 122, 52 166 Z" fill="currentColor" fill-opacity="0.20" stroke-width="2.6"/>' +
        '<path d="M160 160 C128 120, 90 82, 42 38 C66 78, 104 122, 148 166 Z" fill="currentColor" fill-opacity="0.20" stroke-width="2.6"/>' +
        '<circle cx="100" cy="100" r="18" fill="currentColor" fill-opacity="0.22" stroke-width="2.8"/>' +
        '<polygon points="100,86 108,100 100,114 92,100" fill="currentColor"/>' +
      '</svg>';
    case 'sorcerer':
      /* Восьмилучевая Звезда Хаоса и вихрь Дикой Магии */
      return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<g class="fae-spin-ring">' +
          '<circle cx="100" cy="100" r="86" stroke-dasharray="5 7" opacity="0.45"/>' +
          '<polygon points="100,10 116,72 164,36 128,84 190,100 128,116 164,164 116,128 100,190 84,128 36,164 72,116 10,100 72,84 36,36 84,72" fill="currentColor" fill-opacity="0.15" stroke-width="2.4"/>' +
        '</g>' +
        '<circle cx="100" cy="100" r="32" fill="currentColor" fill-opacity="0.18" stroke-width="3"/>' +
        '<path d="M100 74 C108 88, 108 112, 100 126 C92 112, 92 88, 100 74 Z" fill="currentColor" fill-opacity="0.45"/>' +
      '</svg>';
    case 'warlock':
      /* Всевидящее Око Покровителя и оккультная пентаграмма Пакта */
      return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<g class="fae-spin-ring">' +
          '<circle cx="100" cy="100" r="86" stroke-width="2.6" opacity="0.48"/>' +
          '<circle cx="100" cy="100" r="78" stroke-dasharray="4 6" opacity="0.38"/>' +
          '<polygon points="100,16 150,168 20,74 180,74 50,168" fill="currentColor" fill-opacity="0.08" stroke-width="2"/>' +
        '</g>' +
        '<path d="M28 100 Q100 46 172 100 Q100 154 28 100 Z" fill="currentColor" fill-opacity="0.18" stroke-width="3.2"/>' +
        '<circle cx="100" cy="100" r="24" fill="currentColor" fill-opacity="0.25" stroke-width="2.8"/>' +
        '<path d="M100 80 C106 92, 106 108, 100 120 C94 108, 94 92, 100 80 Z" fill="currentColor"/>' +
      '</svg>';
    case 'wizard':
      /* Геомантический круг Восьми Школ Магии Плетения Мистры */
      return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<g class="fae-spin-ring">' +
          '<circle cx="100" cy="100" r="88" stroke-width="2.4" opacity="0.5"/>' +
          '<circle cx="100" cy="100" r="76" stroke-dasharray="6 4" opacity="0.4"/>' +
          '<rect x="38" y="38" width="124" height="124" fill="currentColor" fill-opacity="0.06"/>' +
          '<rect x="38" y="38" width="124" height="124" transform="rotate(45 100 100)" fill="currentColor" fill-opacity="0.06"/>' +
        '</g>' +
        '<g class="fae-spin-ring-rev">' +
          '<circle cx="100" cy="100" r="52" stroke-dasharray="10 5" opacity="0.45"/>' +
        '</g>' +
        '<path d="M64 126 L100 116 L136 126 L136 78 L100 68 L64 78 Z" fill="currentColor" fill-opacity="0.20" stroke-width="2.6"/>' +
        '<line x1="100" y1="68" x2="100" y2="116" stroke-width="2.6"/>' +
      '</svg>';
    case 'artificer':
      /* Часовой механизм из шестерён, колба и молния эфира */
      return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<g class="fae-spin-ring">' +
          '<circle cx="100" cy="100" r="72" stroke-width="10" stroke-dasharray="14 10" opacity="0.42"/>' +
          '<circle cx="100" cy="100" r="62" stroke-width="2.4" opacity="0.5"/>' +
        '</g>' +
        '<g class="fae-spin-ring-rev">' +
          '<circle cx="100" cy="100" r="42" stroke-width="6" stroke-dasharray="10 8" opacity="0.38"/>' +
        '</g>' +
        '<polygon points="108,44 74,104 102,104 90,156 128,94 100,94" fill="currentColor" fill-opacity="0.26" stroke-width="2.8"/>' +
      '</svg>';
    case 'bloodhunter':
      /* Клеймо Ордена Гемокрафтии и багровый кристалл крови */
      return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="100" cy="100" r="86" stroke-dasharray="8 6" opacity="0.38"/>' +
        '<polygon points="100,14 148,100 100,186 52,100" fill="currentColor" fill-opacity="0.14" stroke-width="3"/>' +
        '<polygon points="100,36 132,100 100,164 68,100" stroke-opacity="0.6"/>' +
        '<line x1="28" y1="100" x2="172" y2="100" stroke-width="3"/>' +
        '<line x1="100" y1="14" x2="100" y2="186" stroke-width="3"/>' +
        '<path d="M100 66 C118 90, 122 108, 100 128 C78 108, 82 90, 100 66 Z" fill="currentColor" fill-opacity="0.35"/>' +
      '</svg>';
    default:
      /* Классический Фаэрун: Двадцатигранник D20 в кольце рун */
      return '<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<g class="fae-spin-ring">' +
          '<circle cx="100" cy="100" r="88" stroke-dasharray="8 6" opacity="0.42"/>' +
          '<circle cx="100" cy="100" r="78" opacity="0.3"/>' +
        '</g>' +
        '<polygon points="100,18 172,58 172,142 100,182 28,142 28,58" fill="currentColor" fill-opacity="0.12" stroke-width="3"/>' +
        '<polygon points="100,18 172,58 100,66 28,58" opacity="0.6"/>' +
        '<polygon points="100,66 172,58 144,132 56,132 28,58" opacity="0.6"/>' +
        '<polygon points="100,66 144,132 56,132" fill="currentColor" fill-opacity="0.18" stroke-width="2.6"/>' +
        '<line x1="100" y1="182" x2="56" y2="132"/><line x1="100" y1="182" x2="144" y2="132"/>' +
        '<line x1="28" y1="142" x2="56" y2="132"/><line x1="172" y1="142" x2="144" y2="132"/>' +
      '</svg>';
  }
}

function getFaerunFlyingSymbolSvg(themeId, idx){
  var v = idx % 3;
  switch(themeId){
    case 'barbarian':
      if(v === 0) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="6" y1="30" x2="30" y2="6"/><path d="M18 6 C26 2, 34 10, 30 18 C24 14, 22 12, 18 6 Z" fill="currentColor" fill-opacity="0.3"/></svg>';
      if(v === 1) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 4 C26 14, 30 22, 18 32 C6 22, 10 14, 18 4 Z" fill="currentColor" fill-opacity="0.28"/><path d="M18 12 C22 18, 23 23, 18 28 C13 23, 14 18, 18 12 Z" fill="currentColor"/></svg>';
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="18,3 24,14 19,16 26,33 11,19 17,17"/></svg>';
    case 'bard':
      if(v === 0) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><ellipse cx="12" cy="26" rx="5" ry="3.8" fill="currentColor" fill-opacity="0.35"/><line x1="17" y1="26" x2="17" y2="7"/><path d="M17 7 C24 9, 27 14, 24 19"/></svg>';
      if(v === 1) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><ellipse cx="9" cy="27" rx="4" ry="3" fill="currentColor" fill-opacity="0.35"/><ellipse cx="25" cy="24" rx="4" ry="3" fill="currentColor" fill-opacity="0.35"/><polyline points="13,27 13,9 29,6 29,24"/></svg>';
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><polygon points="18,4 21,14 32,18 21,22 18,32 15,22 4,18 15,14" fill="currentColor" fill-opacity="0.28"/></svg>';
    case 'cleric':
      if(v === 0) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 4 L18 32 M6 18 L30 18"/><circle cx="18" cy="18" r="7" fill="currentColor" fill-opacity="0.25"/></svg>';
      if(v === 1) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><path d="M28 6 C16 8, 8 18, 6 30 C16 26, 26 18, 28 6 Z" fill="currentColor" fill-opacity="0.25"/><line x1="6" y1="30" x2="24" y2="12"/></svg>';
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="6" fill="currentColor" fill-opacity="0.35"/><line x1="18" y1="3" x2="18" y2="8"/><line x1="18" y1="28" x2="18" y2="33"/><line x1="3" y1="18" x2="8" y2="18"/><line x1="28" y1="18" x2="33" y2="18"/></svg>';
    case 'druid':
      if(v === 0) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><path d="M28 6 C12 6, 6 18, 8 28 C18 30, 30 24, 28 6 Z" fill="currentColor" fill-opacity="0.28"/><path d="M8 28 L24 12"/></svg>';
      if(v === 1) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M24 7 A12 12 0 1 0 24 29 A9 9 0 1 1 24 7 Z" fill="currentColor" fill-opacity="0.3"/></svg>';
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 30 L18 10 M18 18 L11 12 M18 14 L25 9"/><circle cx="18" cy="8" r="3" fill="currentColor"/></svg>';
    case 'fighter':
      if(v === 0) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="6" y1="30" x2="30" y2="6"/><line x1="9" y1="21" x2="15" y2="27"/><circle cx="6" cy="30" r="2" fill="currentColor"/></svg>';
      if(v === 1) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8 7 L18 4 L28 7 L28 18 C28 25, 18 31, 18 32 C18 31, 8 25, 8 18 Z" fill="currentColor" fill-opacity="0.25"/></svg>';
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><polygon points="18,4 32,18 18,32 4,18" fill="currentColor" fill-opacity="0.22"/><line x1="4" y1="18" x2="32" y2="18"/></svg>';
    case 'monk':
      if(v === 0) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 C23 14, 23 22, 18 28 C13 22, 13 14, 18 6 Z" fill="currentColor" fill-opacity="0.28"/><path d="M18 28 C25 24, 30 18, 28 12 C22 14, 19 20, 18 28 Z" fill="currentColor" fill-opacity="0.18"/><path d="M18 28 C11 24, 6 18, 8 12 C14 14, 17 20, 18 28 Z" fill="currentColor" fill-opacity="0.18"/></svg>';
      if(v === 1) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="12"/><path d="M18 6 A6 6 0 0 1 18 18 A6 6 0 0 0 18 30 A12 12 0 0 0 18 6 Z" fill="currentColor" fill-opacity="0.3"/></svg>';
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="9" stroke-dasharray="4 3"/><circle cx="18" cy="18" r="3" fill="currentColor"/></svg>';
    case 'paladin':
      if(v === 0) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="4" x2="18" y2="32"/><line x1="10" y1="12" x2="26" y2="12"/><polygon points="18,4 21,10 15,10" fill="currentColor"/></svg>';
      if(v === 1) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 8 L18 4 L28 8 L28 19 C28 26, 18 32, 18 32 C18 32, 8 26, 8 19 Z" fill="currentColor" fill-opacity="0.25"/><line x1="18" y1="9" x2="18" y2="27"/><line x1="12" y1="16" x2="24" y2="16"/></svg>';
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><polygon points="18,3 22,14 33,18 22,22 18,33 14,22 3,18 14,14" fill="currentColor" fill-opacity="0.3"/></svg>';
    case 'ranger':
      if(v === 0) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="6" y1="30" x2="30" y2="6"/><polyline points="20,6 30,6 30,16"/><line x1="6" y1="24" x2="12" y2="30"/></svg>';
      if(v === 1) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><path d="M26 6 C12 8, 8 18, 8 28 C18 28, 28 22, 26 6 Z" fill="currentColor" fill-opacity="0.25"/></svg>';
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="18" cy="22" rx="5" ry="6" fill="currentColor" fill-opacity="0.28"/><circle cx="11" cy="13" r="2.2" fill="currentColor"/><circle cx="16" cy="10" r="2.2" fill="currentColor"/><circle cx="21" cy="10" r="2.2" fill="currentColor"/><circle cx="26" cy="13" r="2.2" fill="currentColor"/></svg>';
    case 'rogue':
      if(v === 0) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 29 C14 20, 22 12, 30 6 C24 14, 16 22, 9 31 Z" fill="currentColor" fill-opacity="0.32"/><line x1="9" y1="21" x2="15" y2="27"/></svg>';
      if(v === 1) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="10" fill="currentColor" fill-opacity="0.25"/><polygon points="18,12 22,18 18,24 14,18" fill="currentColor"/></svg>';
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><polygon points="18,4 30,18 18,32 6,18" fill="currentColor" fill-opacity="0.22"/><circle cx="18" cy="18" r="3" fill="currentColor"/></svg>';
    case 'sorcerer':
      if(v === 0) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><polygon points="18,3 21,13 31,9 23,18 31,27 21,23 18,33 15,23 5,27 13,18 5,9 15,13" fill="currentColor" fill-opacity="0.28"/></svg>';
      if(v === 1) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 4 C26 14, 28 22, 18 32 C8 22, 10 14, 18 4 Z" fill="currentColor" fill-opacity="0.28"/></svg>';
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20,4 10,19 18,19 14,32 26,16 18,16"/></svg>';
    case 'warlock':
      if(v === 0) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 18 Q18 7 32 18 Q18 29 4 18 Z" fill="currentColor" fill-opacity="0.26"/><circle cx="18" cy="18" r="4.5" fill="currentColor"/></svg>';
      if(v === 1) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="18" cy="18" r="13"/><polygon points="18,5 26,28 7,14 29,14 10,28" fill="currentColor" fill-opacity="0.2"/></svg>';
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10 28 C12 18, 24 18, 26 8"/><circle cx="26" cy="8" r="3" fill="currentColor"/></svg>';
    case 'wizard':
      if(v === 0) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="18" cy="18" r="13"/><rect x="9" y="9" width="18" height="18" transform="rotate(45 18 18)"/><circle cx="18" cy="18" r="3" fill="currentColor"/></svg>';
      if(v === 1) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 26 L18 22 L30 26 L30 10 L18 6 L6 10 Z" fill="currentColor" fill-opacity="0.22"/><line x1="18" y1="6" x2="18" y2="22"/></svg>';
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="12,6 24,12 12,18 24,24 12,30"/><line x1="18" y1="4" x2="18" y2="32"/></svg>';
    case 'artificer':
      if(v === 0) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="18" cy="18" r="9" stroke-dasharray="4 3"/><circle cx="18" cy="18" r="4" fill="currentColor" fill-opacity="0.3"/></svg>';
      if(v === 1) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 6 L22 6 M16 6 L16 14 L8 28 L28 28 L20 14 L20 6" fill="currentColor" fill-opacity="0.24"/></svg>';
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="20,4 9,19 18,19 15,32 27,16 18,16" fill="currentColor" fill-opacity="0.28"/></svg>';
    case 'bloodhunter':
      if(v === 0) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 5 C25 16, 27 22, 18 31 C9 22, 11 16, 18 5 Z" fill="currentColor" fill-opacity="0.38"/></svg>';
      if(v === 1) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="18,4 28,18 18,32 8,18" fill="currentColor" fill-opacity="0.22"/><line x1="18" y1="4" x2="18" y2="32"/><line x1="6" y1="18" x2="30" y2="18"/></svg>';
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="6" y1="30" x2="30" y2="6"/><path d="M14 22 L22 14"/></svg>';
    default:
      if(v === 0) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><polygon points="18,4 30,11 30,25 18,32 6,25 6,11" fill="currentColor" fill-opacity="0.22"/><polygon points="18,10 25,23 11,23"/></svg>';
      if(v === 1) return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2"><polygon points="18,4 22,14 32,18 22,22 18,32 14,22 4,18 14,14" fill="currentColor" fill-opacity="0.25"/></svg>';
      return '<svg viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="7" y1="29" x2="29" y2="7"/><line x1="10" y1="20" x2="16" y2="26"/></svg>';
  }
}

function buildFaerunThemeFx(cont, themeObj){
  if(!cont || !themeObj) return;
  cont.innerHTML = '';
  cont.setAttribute('data-fae-theme', themeObj.id);

  var aura = document.createElement('div');
  aura.className = 'fae-fx-aura';
  cont.appendChild(aura);

  var mist = document.createElement('div');
  mist.className = 'fae-fx-mist';
  cont.appendChild(mist);

  /* 1. Крупный декоративный герб класса на заднем фоне + угловой водяной знак */
  var crestWrap = document.createElement('div');
  crestWrap.className = 'fae-bg-crest-wrap';
  var crestSvg = buildFaerunClassCrestSvg(themeObj.id);
  crestWrap.innerHTML =
    '<div class="fae-bg-crest-main' + (themeObj.spin ? ' spin-slow' : '') + '">' + crestSvg + '</div>' +
    '<div class="fae-bg-crest-corner">' + crestSvg + '</div>';
  cont.appendChild(crestWrap);

  /* 2. Летающие классовые элементы (ноты, клинки, листья, стрелы, руны, шестерни, капли крови и т.д.) */
  var signsWrap = document.createElement('div');
  signsWrap.className = 'fae-bg-signs';
  var spots = [
    { top: 74, left: 10, dir: 'up-right', dur: 22, delay: -4, size: 28 },
    { top: 18, left: 84, dir: 'down-left', dur: 25, delay: -12, size: 26 },
    { top: 78, left: 80, dir: 'up-left', dur: 21, delay: -7, size: 30 },
    { top: 22, left: 14, dir: 'down-right', dur: 24, delay: -16, size: 25 },
    { top: 48, left: 76, dir: 'wave', dur: 23, delay: -10, size: 27 },
    { top: 68, left: 28, dir: 'cross', dur: 22, delay: -18, size: 24 },
    { top: 14, left: 46, dir: 'down-right', dur: 26, delay: -5, size: 28 },
    { top: 82, left: 54, dir: 'up-left', dur: 23, delay: -14, size: 26 },
    { top: -5, left: 22, dir: 'fall-right', dur: 21, delay: -8, size: 24 },
    { top: -5, left: 68, dir: 'fall-left', dur: 24, delay: -15, size: 25 },
    { top: 58, left: 8, dir: 'up-right', dur: 27, delay: -20, size: 29 },
    { top: 34, left: 90, dir: 'up-left', dur: 25, delay: -9, size: 26 }
  ];

  for(var i = 0; i < spots.length; i++){
    var sp = spots[i];
    var sym = document.createElement('div');
    sym.className = 'fae-flying-symbol fae-dir-' + sp.dir + (i % 3 === 2 ? ' alt-color' : '');
    sym.style.width = sp.size + 'px';
    sym.style.height = sp.size + 'px';
    sym.style.top = sp.top + '%';
    sym.style.left = sp.left + '%';
    sym.style.animationDuration = sp.dur + 's';
    sym.style.animationDelay = sp.delay + 's';
    sym.innerHTML = getFaerunFlyingSymbolSvg(themeObj.id, i);
    signsWrap.appendChild(sym);
  }
  cont.appendChild(signsWrap);

  /* 3. Парящие искры / частицы энергии класса */
  var emberCount = 24;
  for(var e = 0; e < emberCount; e++){
    var ember = document.createElement('div');
    ember.className = 'fae-ember';
    var sz = (Math.random() * 3.4 + 2.0).toFixed(1);
    var left = (Math.random() * 98 + 1).toFixed(1);
    var dur = (Math.random() * 8 + 7).toFixed(1);
    var delay = (-Math.random() * 16).toFixed(1);
    ember.style.width = sz + 'px';
    ember.style.height = sz + 'px';
    ember.style.left = left + '%';
    ember.style.animationDuration = dur + 's';
    ember.style.animationDelay = delay + 's';
    var cHex = (e % 2 === 0) ? (themeObj.ember1 || themeObj.accentBright) : (themeObj.ember2 || themeObj.accent);
    ember.style.background = cHex;
    ember.style.boxShadow = '0 0 8px ' + cHex + ', 0 0 16px ' + (themeObj.glow || cHex);
    cont.appendChild(ember);
  }
}

function applyFaerunTheme(){
  if(typeof document === 'undefined' || !document.body) return;
  var fx = document.getElementById('faeThemeFx');
  var isFaerunMode = (typeof HB === 'undefined' || !HB.mode || HB.mode === 'faerun');
  if(!isFaerunMode){
    document.body.classList.remove('fae-theme');
    FAE_THEMES.forEach(function(t){
      document.body.classList.remove('fae-theme-' + t.id);
    });
    if(fx) fx.style.display = 'none';
    return;
  }

  var curId = getFaerunTheme();
  var tObj = FAE_THEMES.find(function(t){ return t.id === curId; }) || FAE_THEMES[0];

  document.body.classList.add('fae-theme');
  FAE_THEMES.forEach(function(t){
    document.body.classList.toggle('fae-theme-' + t.id, t.id === tObj.id);
  });

  var st = document.body.style;
  st.setProperty('--fae-accent', tObj.accent);
  st.setProperty('--fae-accent-bright', tObj.accentBright);
  st.setProperty('--fae-accent-dim', tObj.accentDim);
  st.setProperty('--fae-accent-soft', tObj.accentSoft);
  st.setProperty('--fae-accent-glow', tObj.glow);
  st.setProperty('--fae-secondary', tObj.secondary);
  st.setProperty('--fae-secondary-glow', tObj.secondaryGlow);
  st.setProperty('--fae-bg-0', tObj.bg0);
  st.setProperty('--fae-bg-1', tObj.bg1);
  st.setProperty('--fae-bg-2', tObj.bg2);
  st.setProperty('--fae-radial-top', tObj.radialTop);
  st.setProperty('--fae-radial-bot', tObj.radialBot);

  if(!fx){
    fx = document.createElement('div');
    fx.id = 'faeThemeFx';
    fx.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(fx, document.body.firstChild);
  }
  if(fx.getAttribute('data-fae-theme') !== tObj.id || fx.children.length === 0){
    buildFaerunThemeFx(fx, tObj);
  }
  fx.style.display = 'block';
}
window.applyFaerunTheme = applyFaerunTheme;

function showFaerunToast(msg){
  if(typeof GHSync !== 'undefined' && typeof GHSync.toast === 'function'){
    GHSync.toast(msg, 'success');
    return;
  }
  var t = document.createElement('div');
  t.className = 'gh-sync-toast success show';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function(){
    t.classList.remove('show');
    setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 300);
  }, 2800);
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

          /* ВКЛАДКА 4: СНАРЯЖЕНИЕ И УМЕНИЯ */
          '<div class="fae-sheet-pane" data-fae-pane="gear" style="' + showTab('gear') + 'padding-top:12px;">' +
            '<div class="section-label" style="margin-top:4px;">🛡️ Владения и Языки</div>' +
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
  var curThemeId = getFaerunTheme();
  var activeThemeObj = FAE_THEMES.find(function(t){ return t.id === curThemeId; }) || FAE_THEMES[0];
  var isThemeCollapsed = false;
  try {
    isThemeCollapsed = localStorage.getItem('fae_theme_collapsed') === '1';
  } catch(e){}

  var themeCardsHtml = FAE_THEMES.map(function(t){
    var isAct = (t.id === curThemeId);
    return '<button type="button" class="fae-theme-option-card' + (isAct ? ' active' : '') + '" data-fae-theme-pick="' + escapeAttr(t.id) + '" style="--fae-chip-accent:' + escapeAttr(t.accentBright) + ';--fae-chip-glow:' + escapeAttr(t.glow) + ';">' +
      '<span class="fae-theme-card-icon">' + t.icon + '</span>' +
      '<span class="fae-theme-card-info">' +
        '<span class="fae-theme-card-title">' + escapeHtml(t.title) + '</span>' +
        '<span class="fae-theme-card-sub">' + escapeHtml(t.sub) + '</span>' +
      '</span>' +
      '<span class="fae-theme-card-dot">' + (isAct ? '●' : '') + '</span>' +
    '</button>';
  }).join('');

  var themeSectionHtml =
    '<div class="sheet-section fae-data-section">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">' +
        '<div>' +
          '<div class="section-label" style="margin:0;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
            '<span>🎨 ТЕМА ОФОРМЛЕНИЯ ФАЭРУНА (КЛАССЫ D&D)</span>' +
            '<span class="fae-class-badge" style="font-size:11px;padding:2px 10px;">' + activeThemeObj.icon + ' ' + escapeHtml(activeThemeObj.title) + '</span>' +
          '</div>' +
          '<div class="desc" style="margin-top:4px;">Ручной выбор визуальной атмосферы раздела Фаэрун: цветовая палитра интерфейса, фоновый герб класса и парящие тематические элементы (независимо от выбранного героя).</div>' +
        '</div>' +
        '<button type="button" class="btn btn-ghost" id="faeThemeGridToggleBtn" style="font-size:12px;padding:5px 12px;">' +
          (isThemeCollapsed ? '▼ Развернуть темы (15)' : '▲ Свернуть темы') +
        '</button>' +
      '</div>' +
      '<div id="faeThemeGridBody" style="' + (isThemeCollapsed ? 'display:none;' : '') + '">' +
        '<div class="fae-theme-grid">' + themeCardsHtml + '</div>' +
      '</div>' +
    '</div>';

  return renderCrumb([{label:'Фаэрун', nav:'home'}, {label:'Данные & Кампания'}]) +
    '<button class="back" data-go="home">← На главную</button>' +
    '<h1>💾 Данные & Кампания</h1>' +
    '<p class="subtitle">Ростер и полный лист персонажа D&D 5e / 2024, классовые темы оформления, хроники приключения, интеграция Gemini AI и резервные копии.</p>' +
    '<div class="fae-rule"></div>' +

    themeSectionHtml +

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
      theme: getFaerunTheme(),
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
      if(data.theme){
        setFaerunTheme(data.theme);
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

  var themeToggleBtn = g('faeThemeGridToggleBtn');
  var themeGridBody = g('faeThemeGridBody');
  if(themeToggleBtn && themeGridBody){
    themeToggleBtn.addEventListener('click', function(){
      var hidden = themeGridBody.style.display === 'none';
      themeGridBody.style.display = hidden ? '' : 'none';
      themeToggleBtn.textContent = hidden ? '▲ Свернуть темы' : '▼ Развернуть темы (15)';
      try { localStorage.setItem('fae_theme_collapsed', hidden ? '0' : '1'); } catch(e){}
    });
  }

  document.querySelectorAll('[data-fae-theme-pick]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var chosen = btn.getAttribute('data-fae-theme-pick') || 'faerun';
      if(getFaerunTheme() === chosen) return;
      var appliedId = setFaerunTheme(chosen);
      render();
      var tObj = FAE_THEMES.find(function(t){ return t.id === appliedId; });
      showFaerunToast(tObj && tObj.toast ? tObj.toast : ('🎨 Включена тема: ' + appliedId));
    });
  });

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
    el.addEventListener('click', (e)=>{
      if(e && e.target && e.target.closest && e.target.closest('button')) return;
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
  const modUnknownChk=document.getElementById('modUnknownChk');
  if(modUnknownChk) modUnknownChk.addEventListener('change', ()=>{
    diceState.unknownMod = !!modUnknownChk.checked;
    const lbl = modUnknownChk.closest('.mod-unknown-chk');
    if(lbl) lbl.classList.toggle('active', diceState.unknownMod);
    updateDiceReadout();
  });

  document.querySelectorAll('[data-fae-dice-skin]').forEach(btn=>{
    if(btn._wiredSkin) return;
    btn._wiredSkin = true;
    btn.addEventListener('click', ()=>{
      const skId = btn.getAttribute('data-fae-dice-skin') || 'classic';
      if(getActiveDiceSkin().id === skId) return;
      setFaerunDiceSkin(skId);
    });
  });

  const skinCollapseBtn = document.getElementById('faeDiceSkinCollapseBtn');
  if(skinCollapseBtn && !skinCollapseBtn._wired){
    skinCollapseBtn._wired = true;
    skinCollapseBtn.addEventListener('click', ()=>toggleFaerunSkinDock(true));
  }
  const skinTabBtn = document.getElementById('faeDiceSkinTabBtn');
  if(skinTabBtn && !skinTabBtn._wired){
    skinTabBtn._wired = true;
    skinTabBtn.addEventListener('click', ()=>toggleFaerunSkinDock());
  }

  function setCustomSides(val){
    let n = parseInt(val, 10);
    if(isNaN(n)) n = 7;
    n = Math.max(2, Math.min(100, n));
    diceState.customSides = n;

    const svgWrap = document.getElementById('customDieSvgWrap');
    if(svgWrap) svgWrap.innerHTML = getCustomPreviewSvg(n, 'custPick');

    const theme = getCustomDieThemeFor(n);
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
  if(view.screen === 'magic' || view.screen === 'schoolSpells') wireMagicScreens();
  if(view.screen === 'faeTechs' || view.screen === 'faeTechView' || view.screen === 'faeTechEdit' || view.screen === 'faeTechGen') wireFaeTechs();
  if(view.screen === 'faeMoves' || view.screen === 'faeMoveView' || view.screen === 'faeMoveEdit' || view.screen === 'faeMoveGen') wireFaeMoves();
  if(view.screen === 'faeSkills' || view.screen === 'faeSkillView' || view.screen === 'faeSkillEdit' || view.screen === 'faeSkillGen') wireFaeSkills();
  if(view.screen === 'faeGen') wireFaeGen();
  if(view.screen === 'faeRef' || view.screen === 'ref') wireFaeRef();
  if(view.screen === 'classes' || view.screen === 'class' || view.screen === 'subclass' || view.screen === 'sub' || view.screen === 'weapons' || view.screen === 'rules2024') wireFaeClasses();
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
  else if(parts[0]==='faeSkills') view = {screen:'faeSkills'};
  else if(parts[0]==='faeSkillView') view = {screen:'faeSkillView', skillId: parts[1]};
  else if(parts[0]==='faeSkillEdit') view = {screen:'faeSkillEdit', skillId: parts[1]};
  else if(parts[0]==='faeSkillGen') view = {screen:'faeSkillGen'};
  else if(parts[0]==='classes') view = {screen:'classes'};
  else if(parts[0]==='subclass') view = {screen:'subclass', clsKey:parts[1], subKey:parts[2]};
  else if(parts[0]==='magic') view = {screen:'magic'};
  else if(parts[0]==='schoolSpells'){
    if(view.schoolKey !== parts[1]){
      window._faeSchoolSearchQ = '';
      window._faeSchoolLvlFilter = 'all';
    }
    view = {screen:'schoolSpells', schoolKey:parts[1]};
  }
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
  else if(parts[0]==='weaveLore') view = {screen:'weaveLore'};
  else if(parts[0]==='weapons') view = {screen:'weapons', weapon: view.weapon || 'longsword'};
  else if(parts[0]==='class') view = parts[1] ? {screen:'class', cls:parts[1]} : {screen:'classes'};
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