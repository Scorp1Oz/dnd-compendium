/**
 * Witcher 5d6 Dice Poker System
 * Direct integration with DnD Compendium SVG dice generator & styling.
 * 
 * Features:
 * 1. Clean Neutral Dice Poker (Player vs Opponent / Dealer, no cartoon caricatures)
 * 2. Opponent Wealth Levels: Бедный (5 orens), Средний (20 orens), Богатый (50 orens)
 * 3. AI Difficulty Levels: Низкий (Easy), Средний (Medium), Сложный (Hard)
 * 4. Realistic tactical rerolls and table-evaluating betting
 * 5. Authentic DnD Compendium SVG shapes, gradient textures & roll animations
 */

/* ============================================================
   DnD Compendium Core Dice SVG Engine & Constants
   ============================================================ */
const DICE_COLORS = {
  6: { light: '#43a3b3', dark: '#205761' }
};

function dieShapeSvg(sides = 6, uid = 'die', label = null) {
  const c = DICE_COLORS[6];
  const gid = 'grad_' + uid;
  const shape = `<rect x="9" y="9" width="82" height="82" rx="14" fill="url(#${gid})" stroke="rgba(0,0,0,.25)"/>`;
  const text = (label !== undefined && label !== null)
    ? `<text x="50" y="62" text-anchor="middle" font-family="'Cinzel', serif" font-weight="700" font-size="32" fill="#fff">${label}</text>`
    : '';
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c.light}"/>
        <stop offset="100%" stop-color="${c.dark}"/>
      </linearGradient>
    </defs>
    ${shape}${text}
  </svg>`;
}

function animateDie(el, sides, finalValue, dur) {
  const valEl = el.querySelector('.val');
  if (!valEl) return Promise.resolve();
  if (el._diceIv) clearInterval(el._diceIv);
  el.classList.add('rolling');
  const start = performance.now();

  return new Promise(resolve => {
    el._diceIv = setInterval(() => {
      valEl.textContent = 1 + Math.floor(Math.random() * 6);
      if (performance.now() - start >= dur) {
        clearInterval(el._diceIv);
        el._diceIv = null;
        el.classList.remove('rolling');
        valEl.textContent = finalValue;
        resolve();
      }
    }, 70);
  });
}

/* ============================================================
   Dice Poker Hand Evaluator (Strict & Complete)
   ============================================================ */
const POKER_RANKS = {
  FIVE_OF_A_KIND: 8,
  FOUR_OF_A_KIND: 7,
  FULL_HOUSE: 6,
  HIGH_STRAIGHT: 5,
  LOW_STRAIGHT: 4,
  THREE_OF_A_KIND: 3,
  TWO_PAIRS: 2,
  ONE_PAIR: 1,
  HIGH_DIE: 0
};

class PokerEvaluator {
  static evaluate(dice) {
    if (!dice || dice.length !== 5) return { rank: 0, title: "—", scoreValues: [] };
    const counts = {};
    for (let d of dice) counts[d] = (counts[d] || 0) + 1;
    const sorted = [...dice].sort((a, b) => b - a);
    const unique = Object.keys(counts).map(Number).sort((a, b) => b - a);

    // Five of a kind
    if (unique.length === 1) {
      return { rank: POKER_RANKS.FIVE_OF_A_KIND, title: `Покер (${unique[0]})`, scoreValues: [unique[0]] };
    }
    // Four of a kind
    for (let u of unique) {
      if (counts[u] === 4) {
        const kicker = unique.find(x => x !== u);
        return { rank: POKER_RANKS.FOUR_OF_A_KIND, title: `Каре (${u})`, scoreValues: [u, kicker] };
      }
    }
    // Full House
    const triplet = unique.find(u => counts[u] === 3);
    const pair = unique.find(u => counts[u] === 2);
    if (triplet && pair) {
      return { rank: POKER_RANKS.FULL_HOUSE, title: `Фулл-Хаус (${triplet} и ${pair})`, scoreValues: [triplet, pair] };
    }
    // Straights
    const str = [...unique].sort((a, b) => a - b).join('');
    if (str === "23456") return { rank: POKER_RANKS.HIGH_STRAIGHT, title: "Большой стрит (2-6)", scoreValues: [6] };
    if (str === "12345") return { rank: POKER_RANKS.LOW_STRAIGHT, title: "Малый стрит (1-5)", scoreValues: [5] };

    // Three of a kind
    if (triplet) {
      const kickers = unique.filter(u => u !== triplet).sort((a, b) => b - a);
      return { rank: POKER_RANKS.THREE_OF_A_KIND, title: `Тройка (${triplet})`, scoreValues: [triplet, ...kickers] };
    }
    // Two pairs
    const pairs = unique.filter(u => counts[u] === 2).sort((a, b) => b - a);
    if (pairs.length === 2) {
      const kicker = unique.find(u => counts[u] === 1);
      return { rank: POKER_RANKS.TWO_PAIRS, title: `Две пары (${pairs[0]} и ${pairs[1]})`, scoreValues: [...pairs, kicker] };
    }
    // One pair
    if (pairs.length === 1) {
      const kickers = unique.filter(u => u !== pairs[0]).sort((a, b) => b - a);
      return { rank: POKER_RANKS.ONE_PAIR, title: `Пара (${pairs[0]})`, scoreValues: [pairs[0], ...kickers] };
    }
    // High die
    return { rank: POKER_RANKS.HIGH_DIE, title: `Старшая кость (${sorted[0]})`, scoreValues: sorted };
  }

  static compare(a, b) {
    if (a.rank !== b.rank) return a.rank - b.rank;
    const len = Math.min(a.scoreValues.length, b.scoreValues.length);
    for (let i = 0; i < len; i++) {
      if (a.scoreValues[i] !== b.scoreValues[i]) {
        return a.scoreValues[i] - b.scoreValues[i];
      }
    }
    return 0;
  }
}

/* ============================================================
   Configuration Presets: Wealth & Difficulty
   ============================================================ */
const WEALTH_CONFIG = {
  poor: {
    name: "Бедный игрок",
    badge: "Медные ставки (5 🪙)",
    baseStake: 5,
    raiseStep: 5
  },
  medium: {
    name: "Горожанин",
    badge: "Серебряные ставки (20 🪙)",
    baseStake: 20,
    raiseStep: 20
  },
  rich: {
    name: "Богатый купец",
    badge: "Золотые ставки (50 🪙)",
    baseStake: 50,
    raiseStep: 50
  }
};

const DIFFICULTY_CONFIG = {
  low: {
    name: "Низкая",
    badge: "Низкая сложность"
  },
  medium: {
    name: "Средняя",
    badge: "Средняя сложность"
  },
  hard: {
    name: "Сложная",
    badge: "Сложная сложность"
  }
};

/* ============================================================
   Application Controller
   ============================================================ */
class UnifiedDiceApp {
  constructor() {
    this.wealthKey = "medium";
    this.diffKey = "medium";

    // Poker State
    this.poker = {
      playerDice: [1, 2, 3, 4, 5],
      opDice: [1, 2, 3, 4, 5],
      playerSelected: [false, false, false, false, false],
      opSelected: [false, false, false, false, false],
      pot: 0,
      playerGems: 0,
      opGems: 0,
      state: "START_ROLL", // 'START_ROLL', 'BET1', 'REROLL', 'BET2', 'SHOWDOWN', 'ROUND_OVER', 'MATCH_OVER'
      isRolling: false,
      aiRaised: false
    };

    this.initDom();
    this.applySettingsUI();
    this.startPokerMatch();
  }

  get wealth() {
    return WEALTH_CONFIG[this.wealthKey] || WEALTH_CONFIG.medium;
  }

  get diff() {
    return DIFFICULTY_CONFIG[this.diffKey] || DIFFICULTY_CONFIG.medium;
  }

  initDom() {
    // Wealth selector pills
    document.querySelectorAll("#wealth-selector .config-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        const w = btn.dataset.wealth;
        if (w && WEALTH_CONFIG[w]) {
          this.wealthKey = w;
          document.querySelectorAll("#wealth-selector .config-pill").forEach(b => b.classList.toggle("active", b === btn));
          this.applySettingsUI();
          if (this.poker.state === "START_ROLL" || this.poker.state === "MATCH_OVER") {
            this.startPokerMatch();
          } else {
            document.getElementById("poker-status").innerText = `Уровень соперника изменён на: ${this.wealth.name}. Новые ставки вступят со следующего раунда.`;
          }
        }
      });
    });

    // Difficulty selector pills
    document.querySelectorAll("#diff-selector .config-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        const d = btn.dataset.diff;
        if (d && DIFFICULTY_CONFIG[d]) {
          this.diffKey = d;
          document.querySelectorAll("#diff-selector .config-pill").forEach(b => b.classList.toggle("active", b === btn));
          this.applySettingsUI();
          document.getElementById("poker-status").innerText = `Сложность ИИ изменена на: ${this.diff.name}.`;
        }
      });
    });

    // Sound toggle
    document.getElementById("btn-sound").addEventListener("click", () => {
      if (window.diceAudio) {
        const m = window.diceAudio.toggleMute();
        document.getElementById("btn-sound").classList.toggle("active", !m);
        document.getElementById("btn-sound").innerText = m ? "🔇 Без звука" : "🔊 Звук";
      }
    });

    // Rules modal
    document.getElementById("btn-rules-open").addEventListener("click", () => {
      document.getElementById("rules-modal").classList.add("visible");
    });
    document.getElementById("btn-rules-close").addEventListener("click", () => {
      document.getElementById("rules-modal").classList.remove("visible");
    });

    // Poker Action buttons
    this.btnRoll = document.getElementById("poker-btn-roll");
    this.btnRaise = document.getElementById("poker-btn-raise");
    this.btnCall = document.getElementById("poker-btn-call");
    this.btnFold = document.getElementById("poker-btn-fold");

    this.btnRoll.addEventListener("click", () => this.handlePokerRoll());
    this.btnRaise.addEventListener("click", () => this.handlePokerRaise());
    this.btnCall.addEventListener("click", () => this.handlePokerCall());
    this.btnFold.addEventListener("click", () => this.handlePokerFold());
  }

  applySettingsUI() {
    const opName = document.getElementById("op-name-label");
    const opBadge = document.getElementById("op-tier-badge");
    const stakeInfo = document.getElementById("stake-info");

    if (opName) opName.innerText = `Соперник (${this.wealth.name})`;
    if (opBadge) opBadge.innerHTML = `${this.wealth.badge} &bull; ${this.diff.badge}`;
    if (stakeInfo) stakeInfo.innerText = `Ставка: ${this.wealth.baseStake} оренов • До 2 побед`;

    if (this.btnRaise) {
      this.btnRaise.innerText = `Поднять ставку (+${this.wealth.raiseStep})`;
    }
  }

  /* ============================================================
     POKER MATCH & ROUND FLOW
     ============================================================ */
  startPokerMatch() {
    this.poker.playerGems = 0;
    this.poker.opGems = 0;
    this.updatePokerGems();
    this.startPokerRound();
  }

  startPokerRound() {
    this.poker.pot = this.wealth.baseStake * 2;
    this.poker.aiRaised = false;
    document.getElementById("pot-display").innerText = this.poker.pot;

    this.poker.playerSelected = [false, false, false, false, false];
    this.poker.opSelected = [false, false, false, false, false];

    this.poker.state = "START_ROLL";
    document.getElementById("player-comb-tag").innerText = "Ожидание первого броска...";
    document.getElementById("op-comb-tag").innerText = "Ожидание первого броска...";
    document.getElementById("poker-status").innerText = "Раунд начался. Нажмите «Бросить кости» для первого броска.";

    this.renderPokerDice(true);
    this.updatePokerButtons({
      rollText: "Бросить кости",
      canRoll: true,
      canRaise: false,
      canCall: false,
      canFold: false
    });
  }

  async handlePokerRoll() {
    if (this.poker.isRolling) return;

    if (this.poker.state === "START_ROLL") {
      await this.executePokerFirstRoll();
    } else if (this.poker.state === "REROLL") {
      await this.executePokerReroll();
    } else if (this.poker.state === "SHOWDOWN" || this.poker.state === "ROUND_OVER") {
      this.startPokerRound();
    } else if (this.poker.state === "MATCH_OVER") {
      this.startPokerMatch();
    }
  }

  async executePokerFirstRoll() {
    this.poker.isRolling = true;
    this.updatePokerButtons({ canRoll: false, canRaise: false, canCall: false, canFold: false });
    if (window.diceAudio) window.diceAudio.playDiceRoll();

    const pTray = document.getElementById("player-poker-tray");
    const oTray = document.getElementById("op-poker-tray");

    // Assign random initial 5d6 values
    this.poker.playerDice = Array.from({ length: 5 }, () => 1 + Math.floor(Math.random() * 6));
    this.poker.opDice = Array.from({ length: 5 }, () => 1 + Math.floor(Math.random() * 6));

    this.renderPokerDice();

    const pDiceEls = Array.from(pTray.querySelectorAll(".die"));
    const oDiceEls = Array.from(oTray.querySelectorAll(".die"));

    const anims = [
      ...pDiceEls.map((el, i) => animateDie(el, 6, this.poker.playerDice[i], 600)),
      ...oDiceEls.map((el, i) => animateDie(el, 6, this.poker.opDice[i], 600))
    ];
    await Promise.all(anims);

    const pEval = PokerEvaluator.evaluate(this.poker.playerDice);
    const oEval = PokerEvaluator.evaluate(this.poker.opDice);

    document.getElementById("player-comb-tag").innerText = pEval.title;
    document.getElementById("op-comb-tag").innerText = oEval.title;

    this.poker.isRolling = false;
    this.poker.state = "BET1";

    // Check if Hard AI wants to proactively raise
    if (this.diffKey === "hard" && !this.poker.aiRaised) {
      const cmp = PokerEvaluator.compare(oEval, pEval);
      if (cmp > 0 || oEval.rank >= POKER_RANKS.THREE_OF_A_KIND) {
        this.poker.aiRaised = true;
        this.poker.pot += this.wealth.raiseStep;
        document.getElementById("pot-display").innerText = this.poker.pot;
        document.getElementById("poker-status").innerText = `Соперник уверен в комбинации (${oEval.title}) и поднял ставку (+${this.wealth.raiseStep} 🪙)! Уравняйте ставку или сдайтесь.`;
        this.updatePokerButtons({
          rollText: "К перебросу костей",
          canRoll: false,
          canRaise: true,
          canCall: true,
          canFold: true
        });
        return;
      }
    }

    document.getElementById("poker-status").innerText = "Первый раунд торгов. Вы можете повысить ставку, уравнять (чек) или перейти к перебросу.";
    this.updatePokerButtons({
      rollText: "К перебросу костей",
      canRoll: true,
      canRaise: true,
      canCall: true,
      canFold: true
    });
  }

  handlePokerRaise() {
    if (this.poker.isRolling) return;
    const raiseVal = this.wealth.raiseStep;
    if (window.diceAudio) window.diceAudio.playCoin();

    // AI evaluates response to player raise
    const pEval = PokerEvaluator.evaluate(this.poker.playerDice);
    const oEval = PokerEvaluator.evaluate(this.poker.opDice);
    const shouldCall = this.aiShouldCallRaise(pEval, oEval);

    if (shouldCall) {
      // Both match the raise: pot grows by 2 * raiseVal
      this.poker.pot += raiseVal * 2;
      document.getElementById("pot-display").innerText = this.poker.pot;
      document.getElementById("poker-status").innerText = `Соперник уравнял ваше повышение (+${raiseVal * 2} 🪙 в банк). Переход к перебросу.`;
      this.proceedToReroll();
    } else {
      // AI Folds
      document.getElementById("poker-status").innerText = "Соперник сбросил кости! Вы забираете банк раунда.";
      this.playerWinsRound();
    }
  }

  aiShouldCallRaise(pEval, oEval) {
    if (this.diffKey === "low") {
      // Low AI folds often (60% chance to fold on raise)
      return Math.random() < 0.40;
    }
    if (this.diffKey === "medium") {
      // Medium AI calls if has at least a pair or high card 6, otherwise folds ~40%
      return oEval.rank >= POKER_RANKS.ONE_PAIR || Math.random() < 0.65;
    }
    // Hard AI evaluates open table
    const cmp = PokerEvaluator.compare(oEval, pEval);
    if (cmp >= 0) return true; // Equal or stronger
    if (oEval.rank >= POKER_RANKS.ONE_PAIR) return true; // Has pairs to build upon
    if (this.hasStraightDraw(this.poker.opDice)) return true; // High potential draw
    return false; // Behind with trash hand, folds smartly
  }

  handlePokerCall() {
    if (this.poker.isRolling) return;
    if (window.diceAudio) window.diceAudio.playClick();
    this.proceedToReroll();
  }

  handlePokerFold() {
    if (this.poker.isRolling) return;
    if (window.diceAudio) window.diceAudio.playLose();
    document.getElementById("poker-status").innerText = "Вы сбросили кости. Раунд достаётся сопернику.";
    this.opWinsRound();
  }

  proceedToReroll() {
    if (this.poker.state === "BET2") {
      this.showdown();
      return;
    }
    this.poker.state = "REROLL";
    document.getElementById("poker-status").innerText = "Кликните по костям, которые хотите перебросить (0–5), затем нажмите «Перебросить выбранные».";
    this.updatePokerButtons({
      rollText: "Перебросить выбранные",
      canRoll: true,
      canRaise: false,
      canCall: false,
      canFold: false
    });
  }

  hasStraightDraw(dice) {
    const uniq = Array.from(new Set(dice)).sort((a, b) => a - b);
    if (uniq.length < 4) return false;
    const str = uniq.join('');
    return str.includes("1234") || str.includes("2345") || str.includes("3456");
  }

  chooseOpponentRerolls() {
    const dice = this.poker.opDice;
    const oEval = PokerEvaluator.evaluate(dice);

    // Keep perfect hands
    if (oEval.rank === POKER_RANKS.FIVE_OF_A_KIND ||
        oEval.rank === POKER_RANKS.FULL_HOUSE ||
        oEval.rank === POKER_RANKS.HIGH_STRAIGHT ||
        oEval.rank === POKER_RANKS.LOW_STRAIGHT) {
      return [false, false, false, false, false];
    }

    // LOW DIFFICULTY: can make silly mistakes
    if (this.diffKey === "low") {
      if (Math.random() < 0.35) {
        // Blunder: reroll random dice
        return Array.from({ length: 5 }, () => Math.random() < 0.5);
      }
    }

    // HARD DIFFICULTY: check 4-in-a-row straight draws
    if (this.diffKey === "hard") {
      const uniq = Array.from(new Set(dice)).sort((a, b) => a - b);
      if (uniq.length >= 4) {
        const uStr = uniq.join('');
        let targetSeq = null;
        if (uStr.includes("2345")) targetSeq = [2, 3, 4, 5];
        else if (uStr.includes("1234")) targetSeq = [1, 2, 3, 4];
        else if (uStr.includes("3456")) targetSeq = [3, 4, 5, 6];

        if (targetSeq) {
          // Keep one of each from targetSeq, reroll the odd 5th die
          const keptMap = {};
          return dice.map(d => {
            if (targetSeq.includes(d) && !keptMap[d]) {
              keptMap[d] = true;
              return false; // keep
            }
            return true; // reroll the duplicate / odd die
          });
        }
      }
    }

    // STANDARD / ADVANCED LOGIC:
    if (oEval.rank === POKER_RANKS.FOUR_OF_A_KIND) {
      const fourVal = oEval.scoreValues[0];
      return dice.map(d => d !== fourVal);
    }
    if (oEval.rank === POKER_RANKS.THREE_OF_A_KIND) {
      const triVal = oEval.scoreValues[0];
      return dice.map(d => d !== triVal);
    }
    if (oEval.rank === POKER_RANKS.TWO_PAIRS) {
      const p1 = oEval.scoreValues[0];
      const p2 = oEval.scoreValues[1];
      return dice.map(d => d !== p1 && d !== p2);
    }
    if (oEval.rank === POKER_RANKS.ONE_PAIR) {
      const pVal = oEval.scoreValues[0];
      return dice.map(d => d !== pVal);
    }

    // High die:
    if (this.diffKey === "hard") {
      // If has two high dice (e.g. 5, 6), keep both
      const sorted = [...dice].sort((a, b) => b - a);
      if (sorted[0] >= 5 && sorted[1] >= 4) {
        let kept1 = false, kept2 = false;
        return dice.map(d => {
          if (d === sorted[0] && !kept1) { kept1 = true; return false; }
          if (d === sorted[1] && !kept2) { kept2 = true; return false; }
          return true;
        });
      }
    }

    // Keep highest die, reroll others
    const maxVal = Math.max(...dice);
    let kept = false;
    return dice.map(d => {
      if (d === maxVal && !kept) {
        kept = true;
        return false;
      }
      return true;
    });
  }

  async executePokerReroll() {
    this.poker.isRolling = true;
    this.updatePokerButtons({ canRoll: false, canRaise: false, canCall: false, canFold: false });

    this.poker.opSelected = this.chooseOpponentRerolls();

    const pRerollIndices = [];
    const oRerollIndices = [];
    for (let i = 0; i < 5; i++) {
      if (this.poker.playerSelected[i]) {
        pRerollIndices.push(i);
        this.poker.playerDice[i] = 1 + Math.floor(Math.random() * 6);
      }
      if (this.poker.opSelected[i]) {
        oRerollIndices.push(i);
        this.poker.opDice[i] = 1 + Math.floor(Math.random() * 6);
      }
    }

    if (pRerollIndices.length > 0 || oRerollIndices.length > 0) {
      if (window.diceAudio) window.diceAudio.playDiceRoll();
      const pDiceEls = Array.from(document.getElementById("player-poker-tray").querySelectorAll(".die"));
      const oDiceEls = Array.from(document.getElementById("op-poker-tray").querySelectorAll(".die"));

      const anims = [
        ...pRerollIndices.map(i => animateDie(pDiceEls[i], 6, this.poker.playerDice[i], 600)),
        ...oRerollIndices.map(i => animateDie(oDiceEls[i], 6, this.poker.opDice[i], 600))
      ];
      await Promise.all(anims);
    }

    this.poker.playerSelected = [false, false, false, false, false];
    this.poker.opSelected = [false, false, false, false, false];
    this.renderPokerDice();

    const pEval = PokerEvaluator.evaluate(this.poker.playerDice);
    const oEval = PokerEvaluator.evaluate(this.poker.opDice);

    document.getElementById("player-comb-tag").innerText = pEval.title;
    document.getElementById("op-comb-tag").innerText = oEval.title;

    this.poker.isRolling = false;
    this.poker.state = "BET2";

    // Hard AI check in BET2
    if (this.diffKey === "hard") {
      const cmp = PokerEvaluator.compare(oEval, pEval);
      if (cmp > 0 && oEval.rank >= POKER_RANKS.TWO_PAIRS) {
        this.poker.pot += this.wealth.raiseStep;
        document.getElementById("pot-display").innerText = this.poker.pot;
        document.getElementById("poker-status").innerText = `Соперник видит стол, уверен в перевесе и поднимает ставку (+${this.wealth.raiseStep} 🪙)! Вскрыть кости или сдаться?`;
        this.updatePokerButtons({
          rollText: "Вскрыть кости",
          canRoll: true,
          canRaise: false,
          canCall: true,
          canFold: true
        });
        return;
      }
    }

    document.getElementById("poker-status").innerText = "Финальный раунд торгов перед вскрытием комбинаций.";
    this.updatePokerButtons({
      rollText: "Вскрыть кости",
      canRoll: true,
      canRaise: true,
      canCall: true,
      canFold: true
    });
  }

  showdown() {
    this.poker.state = "SHOWDOWN";
    const pEval = PokerEvaluator.evaluate(this.poker.playerDice);
    const oEval = PokerEvaluator.evaluate(this.poker.opDice);
    const cmp = PokerEvaluator.compare(pEval, oEval);

    if (cmp > 0) {
      if (window.diceAudio) window.diceAudio.playWin();
      document.getElementById("poker-status").innerText = `Победа в раунде! Ваш ${pEval.title} побеждает ${oEval.title}. Банк раунда ваш!`;
      this.playerWinsRound();
    } else if (cmp < 0) {
      if (window.diceAudio) window.diceAudio.playLose();
      document.getElementById("poker-status").innerText = `Поражение в раунде. ${oEval.title} соперника сильнее вашего ${pEval.title}. Банк уходит сопернику.`;
      this.opWinsRound();
    } else {
      if (window.diceAudio) window.diceAudio.playCoin();
      document.getElementById("poker-status").innerText = `Ничья! Комбинации равны (${pEval.title}). Банк поделён.`;
      this.poker.pot = 0;
      document.getElementById("pot-display").innerText = 0;
      this.checkRoundEnd();
    }
  }

  playerWinsRound() {
    this.poker.playerGems++;
    this.poker.pot = 0;
    document.getElementById("pot-display").innerText = 0;
    this.updatePokerGems();
    this.checkMatchStatus();
  }

  opWinsRound() {
    this.poker.opGems++;
    this.poker.pot = 0;
    document.getElementById("pot-display").innerText = 0;
    this.updatePokerGems();
    this.checkMatchStatus();
  }

  checkMatchStatus() {
    if (this.poker.playerGems >= 2) {
      if (window.diceAudio) window.diceAudio.playWin();
      document.getElementById("poker-status").innerText = "🏆 ПОБЕДА В ПАРТИИ! Вы выиграли со счётом 2 победы. Поздравляем!";
      this.poker.state = "MATCH_OVER";
      this.updatePokerButtons({ rollText: "Начать новую партию", canRoll: true });
    } else if (this.poker.opGems >= 2) {
      if (window.diceAudio) window.diceAudio.playLose();
      document.getElementById("poker-status").innerText = "💀 ПОРАЖЕНИЕ В ПАРТИИ. Соперник одержал 2 победы.";
      this.poker.state = "MATCH_OVER";
      this.updatePokerButtons({ rollText: "Сыграть реванш", canRoll: true });
    } else {
      this.checkRoundEnd();
    }
  }

  checkRoundEnd() {
    this.poker.state = "ROUND_OVER";
    this.updatePokerButtons({ rollText: "Следующий раунд", canRoll: true });
  }

  updatePokerGems() {
    const pGems = document.querySelectorAll("#player-gems .gem-dot");
    const oGems = document.querySelectorAll("#op-gems .gem-dot");
    pGems.forEach((g, i) => g.classList.toggle("active", i < this.poker.playerGems));
    oGems.forEach((g, i) => g.classList.toggle("active", i < this.poker.opGems));
  }

  updatePokerButtons({ rollText, canRoll, canRaise, canCall, canFold }) {
    if (rollText) this.btnRoll.innerText = rollText;
    if (canRoll !== undefined) this.btnRoll.disabled = !canRoll;
    if (canRaise !== undefined) this.btnRaise.disabled = !canRaise;
    if (canCall !== undefined) this.btnCall.disabled = !canCall;
    if (canFold !== undefined) this.btnFold.disabled = !canFold;
  }

  togglePokerDie(index) {
    if (this.poker.state !== "REROLL" || this.poker.isRolling) return;
    this.poker.playerSelected[index] = !this.poker.playerSelected[index];
    if (window.diceAudio) window.diceAudio.playDieSelect();
    this.renderPokerDice();
  }

  renderPokerDice(blank = false) {
    const pTray = document.getElementById("player-poker-tray");
    const oTray = document.getElementById("op-poker-tray");

    pTray.innerHTML = "";
    oTray.innerHTML = "";

    this.poker.playerDice.forEach((val, i) => {
      const isSelected = this.poker.playerSelected[i];
      const dieEl = document.createElement("div");
      dieEl.className = `die s6 ${isSelected ? 'reroll-selected' : ''}`;
      dieEl.innerHTML = dieShapeSvg(6, `p_${i}`) +
        `<div class="val">${blank ? '?' : val}</div>` +
        (isSelected ? `<div class="reroll-badge">ПЕРЕБРОС</div>` : '');
      dieEl.addEventListener("click", () => this.togglePokerDie(i));
      pTray.appendChild(dieEl);
    });

    this.poker.opDice.forEach((val, i) => {
      const dieEl = document.createElement("div");
      dieEl.className = "die s6";
      dieEl.innerHTML = dieShapeSvg(6, `o_${i}`) + `<div class="val">${blank ? '?' : val}</div>`;
      oTray.appendChild(dieEl);
    });
  }
}

// 16:9 Auto-fit responsive calculation
function fitDiceStage() {
  if (typeof window === "undefined" || !document || !document.documentElement) return;
  const W = window.innerWidth;
  const H = window.innerHeight;
  if (!W || !H) return;
  const baseH = W * 1080 / 1920;
  const scale = Math.min(1, H / baseH);
  document.documentElement.style.setProperty('--game-scale', scale);
}

window.addEventListener('resize', fitDiceStage);
window.addEventListener('DOMContentLoaded', () => {
  fitDiceStage();
  window.diceApp = new UnifiedDiceApp();
});
