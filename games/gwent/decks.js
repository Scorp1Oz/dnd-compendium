let premade_deck = [
	 '{"faction":"realms","leader":24,"cards":[[5,1],[1,3],[2,1],[3,1],[8,1],[33,1],[34,1],[39,1],[51,1],[29,2],[12,1],[14,1],[15,1],[27,1],[17,1],[45,1],[54,1],[55,1],[30,3],[32,1],[41,1],[28,3],[19,3],[47,1],[6,1],[18,1],[49,1],[0,1],[214,1]]}'
	,'{"faction":"realms","leader":24,"cards":[[5,1],[1,3],[2,1],[4,1],[9,1],[11,1],[3,1],[8,1],[33,1],[34,1],[39,1],[51,1],[29,2],[12,1],[14,1],[15,1],[27,1],[17,1],[45,1],[54,1],[55,1],[30,3],[32,1],[41,1],[28,3],[19,3],[47,1],[6,1],[18,1],[49,1],[0,1],[214,1]]}'
	,'{"faction":"nilfgaard","leader":59,"cards":[[5,1],[1,3],[10,1],[2,1],[4,1],[9,1],[11,1],[3,1],[8,1],[63,1],[64,1],[70,1],[73,1],[75,1],[84,1],[81,1],[14,1],[15,1],[17,1],[90,1],[91,1],[19,3],[88,1],[71,4],[6,1],[18,1],[67,1],[68,1],[0,1],[83,1],[214,1]]}'
	,'{"faction":"nilfgaard","leader":58,"cards":[[5,1],[1,3],[10,2],[4,1],[9,1],[11,1],[3,1],[8,1],[63,1],[64,1],[70,1],[73,1],[75,1],[14,1],[15,1],[62,1],[65,1],[69,1],[17,1],[13,1],[90,1],[91,1],[88,1],[71,4],[6,1],[67,1],[68,1],[20,1],[0,1],[83,1],[214,1]]}'
	,'{"faction":"monsters","leader":93,"cards":[[5,1],[1,3],[10,1],[4,1],[9,1],[11,1],[3,1],[8,1],[124,1],[125,1],[138,1],[14,1],[15,1],[101,1],[105,1],[106,1],[107,1],[17,1],[135,1],[98,1],[99,1],[100,1],[102,1],[19,3],[131,1],[132,1],[133,1],[134,1],[6,1],[18,1],[127,1],[128,1],[129,1],[0,1]]}'
	,'{"faction":"monsters","leader":94,"cards":[[5,1],[1,1],[10,3],[4,1],[9,1],[11,1],[3,1],[8,1],[125,1],[14,1],[15,1],[101,1],[105,1],[106,1],[107,1],[17,1],[135,1],[98,1],[99,1],[100,1],[19,3],[131,1],[132,1],[133,1],[134,1],[0,1]]}'
	,'{"faction":"scoiatael","leader":141,"cards":[[5,1],[1,3],[10,1],[2,1],[4,1],[9,1],[11,1],[3,1],[8,1],[167,1],[173,1],[213,1],[14,1],[15,1],[148,1],[17,1],[162,1],[163,1],[164,1],[19,3],[144,1],[151,1],[152,1],[153,1],[6,1],[18,1],[159,1],[160,1],[0,1]]}'
	,'{"faction":"scoiatael","leader":143,"cards":[[5,1],[1,3],[10,1],[2,1],[4,1],[9,1],[11,1],[3,1],[8,1],[167,1],[173,1],[213,1],[14,1],[15,1],[148,1],[149,1],[150,1],[158,1],[17,1],[162,1],[163,1],[164,1],[19,3],[6,1],[18,1],[20,1],[159,1],[160,1],[0,1]]}'
	,'{"faction":"skellige","leader":211,"cards":[[5,1],[202,1],[10,1],[2,1],[204,1],[11,1],[3,1],[8,1],[203,1],[184,1],[195,1],[14,1],[15,1],[192,3],[186,1],[17,1],[187,1],[188,1],[189,1],[200,3],[182,1],[6,1],[210,3],[199,1],[0,1]]}'
	,'{"faction":"skellige","leader":211,"cards":[[5,1],[1,2],[3,1],[8,1],[203,1],[184,1],[14,1],[192,3],[186,1],[17,1],[209,3],[187,1],[188,1],[189,1],[19,3],[200,3],[182,1],[0,1]]}'
	,'{"faction":"syndicate","leader":216,"cards":[[219,3],[220,2],[221,3],[222,2],[223,2],[224,1],[225,1],[226,1],[227,1],[228,1],[229,1],[230,1],[231,1],[232,1],[233,1],[234,1],[0,1],[8,1],[3,1],[1,2],[5,1],[10,2],[2,1]]}'
	,'{"faction":"syndicate","leader":217,"cards":[[219,3],[220,2],[221,3],[222,2],[223,2],[224,1],[225,1],[226,1],[228,1],[229,1],[230,1],[231,1],[232,1],[234,1],[257,1],[259,1],[0,1],[8,1],[15,1],[1,2],[5,2],[10,2]]}'
];

function draftOpponentDeck(factionChoice = "random") {
    const allFactions = ['realms', 'nilfgaard', 'monsters', 'scoiatael', 'skellige', 'syndicate'];
    let faction = factionChoice;
    if (!allFactions.includes(faction)) {
        faction = allFactions[Math.floor(Math.random() * allFactions.length)];
    }

    const leaders = card_dict.filter(c => c.deck === faction && c.row === 'leader');
    const leader = leaders.length > 0 ? leaders[Math.floor(Math.random() * leaders.length)] : null;

    const indexed = card_dict.map((c, i) => ({...c, index: i}));
    const factionUnits = indexed.filter(c => c.deck === faction && c.row !== 'leader' && c.strength !== '');
    
    const musters = factionUnits.filter(c => c.ability && c.ability.includes('muster'));
    const spies = factionUnits.filter(c => c.ability && c.ability.includes('spy'));
    const medics = factionUnits.filter(c => c.ability && c.ability.includes('medic'));
    const bonds = factionUnits.filter(c => c.ability && c.ability.includes('bond'));
    const heroes = factionUnits.filter(c => c.ability && c.ability.includes('hero'));
    const others = factionUnits.filter(c => 
        !musters.includes(c) && !spies.includes(c) && !medics.includes(c) && !bonds.includes(c) && !heroes.includes(c)
    );

    const deckCardsMap = new Map();

    function addCard(cardObj, maxQty) {
        if (!cardObj) return;
        const idx = cardObj.index;
        const available = parseInt(cardObj.count) || 1;
        const current = deckCardsMap.get(idx) || 0;
        const toAdd = Math.min(maxQty || available, available - current);
        if (toAdd > 0) {
            deckCardsMap.set(idx, current + toAdd);
        }
    }

    // Always include spies and medics
    spies.forEach(s => addCard(s));
    medics.forEach(m => addCard(m));

    // Muster synergy sets (keep packs intact)
    if (musters.length > 0) {
        const musterGroups = {};
        musters.forEach(m => {
            const key = m.name.split('-')[0].trim();
            if (!musterGroups[key]) musterGroups[key] = [];
            musterGroups[key].push(m);
        });
        const groupKeys = Object.keys(musterGroups);
        groupKeys.sort(() => Math.random() - 0.5);
        const pickedGroups = groupKeys.slice(0, Math.min(2, groupKeys.length));
        pickedGroups.forEach(gKey => {
            musterGroups[gKey].forEach(card => addCard(card, parseInt(card.count) || 1));
        });
    }

    // Tight bond synergy sets (keep pairs/triplets together)
    if (bonds.length > 0) {
        const bondGroups = {};
        bonds.forEach(b => {
            const key = b.name.split('-')[0].trim();
            if (!bondGroups[key]) bondGroups[key] = [];
            bondGroups[key].push(b);
        });
        const groupKeys = Object.keys(bondGroups);
        groupKeys.sort(() => Math.random() - 0.5);
        const pickedBonds = groupKeys.slice(0, Math.min(2, groupKeys.length));
        pickedBonds.forEach(bKey => {
            bondGroups[bKey].forEach(card => addCard(card, parseInt(card.count) || 1));
        });
    }

    // Hero cards (3 to 6 per match)
    const shuffledHeroes = [...heroes].sort(() => Math.random() - 0.5);
    const heroCountToPick = Math.min(shuffledHeroes.length, 3 + Math.floor(Math.random() * 4));
    shuffledHeroes.slice(0, heroCountToPick).forEach(h => addCard(h, 1));

    // Frontline infantry and soldier units (1-2 soldier units for authentic army ranks)
    const lowPowerUnits = others.filter(c => (parseInt(c.strength) || 0) <= 4);
    if (lowPowerUnits.length > 0) {
        const shuffledSoldiers = [...lowPowerUnits].sort(() => Math.random() - 0.5);
        const soldierPicks = shuffledSoldiers.slice(0, Math.min(2, shuffledSoldiers.length));
        soldierPicks.forEach(sc => addCard(sc, parseInt(sc.count) || 1));
    }

    // Other high power / synergistic faction units
    const shuffledOthers = [...others].sort((a, b) => (parseInt(b.strength) || 0) - (parseInt(a.strength) || 0));
    for (let c of shuffledOthers) {
        if (deckCardsMap.size >= 20) break;
        if (Math.random() < 0.8) {
            addCard(c, parseInt(c.count) || 1);
        }
    }

    // Neutral Legends & Custom Darian Cards
    const neutralUnits = indexed.filter(c => c.deck === 'neutral' && c.row !== 'leader' && c.strength !== '' && parseInt(c.count) > 0);
    const darianAllowed = typeof isDarianUnlocked === 'function' && isDarianUnlocked();
    const darianCards = darianAllowed ? neutralUnits.filter(c => c.filename && c.filename.includes('darian')) : [];
    const legendNeutrals = neutralUnits.filter(c => !c.filename || !c.filename.includes('darian'));

    // Inject Darian cards with 5-10% chance (~8% probability) only when Darian character is active
    if (darianAllowed && Math.random() < 0.08 && darianCards.length > 0) {
        const shuffledDarian = [...darianCards].sort(() => Math.random() - 0.5);
        addCard(shuffledDarian[0], 1);
        if (Math.random() < 0.1 && shuffledDarian.length > 1) {
            addCard(shuffledDarian[1], 1);
        }
    }

    // Inject 2-4 neutral legends
    const shuffledNeutrals = [...legendNeutrals].sort(() => Math.random() - 0.5);
    const numNeutrals = 2 + Math.floor(Math.random() * 3);
    shuffledNeutrals.slice(0, numNeutrals).forEach(nc => addCard(nc, 1));

    // Ensure minimum 22 unit cards
    let currentUnitCount = 0;
    deckCardsMap.forEach((qty, idx) => {
        if (card_dict[idx].strength !== '') currentUnitCount += qty;
    });

    if (currentUnitCount < 22) {
        for (let u of factionUnits) {
            if (currentUnitCount >= 24) break;
            if (!deckCardsMap.has(u.index)) {
                addCard(u, 1);
                currentUnitCount++;
            }
        }
    }

    // Special and Weather cards
    const specialCards = indexed.filter(c => c.deck === 'special' || c.row === 'weather' || c.deck === 'weather');
    const horn = specialCards.find(c => c.name === "Commander's Horn");
    const scorch = specialCards.find(c => c.name === 'Scorch');
    const decoy = specialCards.find(c => c.name === 'Decoy');
    const clearWeather = specialCards.find(c => c.name === 'Clear Weather');
    const frost = specialCards.find(c => c.name === 'Biting Frost');
    const mardroeme = specialCards.find(c => c.name === 'Mardroeme');

    if (horn) addCard(horn, 1 + (Math.random() < 0.5 ? 1 : 0));
    if (decoy) addCard(decoy, 1 + (Math.random() < 0.5 ? 1 : 0));
    if (scorch) addCard(scorch, 1);
    if (faction === 'monsters' && frost) addCard(frost, 1 + (Math.random() < 0.5 ? 1 : 0));
    else if (faction === 'skellige' && mardroeme && Math.random() < 0.6) addCard(mardroeme, 1 + (Math.random() < 0.5 ? 1 : 0));
    else if (clearWeather && Math.random() < 0.7) addCard(clearWeather, 1);

    const finalCards = [];
    deckCardsMap.forEach((count, index) => {
        if (count > 0) finalCards.push({ index: index, count: count });
    });

    return {
        faction: faction,
        leader: leader,
        cards: finalCards
    };
}