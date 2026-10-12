"use strict"

var ability_dict = {
	clear: {
		name: "Clear Weather",
		description: "Removes all Weather Cards (Biting Frost, Impenetrable Fog and Torrential Rain) effects. ",
		audio: "clear"
	},
	frost: {
		name: "Biting Frost",
		description: "Sets the strength of all Close Combat cards to 1 for both players. ",
		audio: "cold"
	},
	fog: {
		name: "Impenetrable Fog",
		description: "Sets the strength of all Ranged Combat cards to 1 for both players. ",
		audio: "fog"
	},
	rain: {
		name: "Torrential Rain",
		description: "Sets the strength of all Siege Combat cards to 1 for both players. ",
		audio: "rain"
	},
	storm: {
		name: "Skellige Storm",
		description: "Reduces the Strength of all Range and Siege Units to 1. ",
		audio: "rain"
	},
	hero: {
		name: "hero",
		description: "Not affected by any Special Cards or abilities. "
	},
	decoy: {
		name: "Decoy",
		audio: "decoy",
		description: "Swap with a card on the battlefield to return it to your hand. "
	},
	horn: {
		name: "Commander's Horn",
		description: "Doubles the strength of all unit cards in that row. Limited to 1 per row. ",
		audio: "horn",
		placed: async card => {
			await card.animate("horn");
		}
	},
	mardroeme: {
		name: "Mardroeme",
		description: "Triggers transformation of all Berserker cards on the same row. ",
		placed: async (card, row) => {
			const berserkers = row.findCards(c => c.abilities.includes("berserker"));
			await Promise.all(berserkers.map(async c => await ability_dict["berserker"].placed(c, row)));
		}
	},
	berserker: {
		name: "Berserker",
		description: "Transforms into a bear when a Mardroeme card is on its row. ",
		placed: async (card, row) => {
			if (row.effects.mardroeme === 0)
				return;
			row.removeCard(card);
			const cardId = card.name.indexOf("Young") === -1 ? 206 : 207;
			await row.addCard(new Card(card_dict[cardId], card.holder));
		}
	},
	vildkarrl: {
		placed: async (card, row) => {
			if (card.abilities.includes('vildkarrl'))
			{
				card.abilities.remove('vildkarrl');
				await AudioManager.playSFX("mardroeme", 1000);
				setTimeout(()=>card.placed.remove(ability_dict['vildkarrl'].placed), 5000);
			}
		}
	},
	scorch: {
		name: "Scorch",
		description: "Discard after playing. Kills the strongest card(s) on the battlefield. ",
		activated: async card => {	
			await ability_dict["scorch"].placed(card);
			await board.toGrave(card, card.holder.hand);
		},
		placed: async (card, row) => {
			if (row !== undefined)
				row.cards.splice( row.cards.indexOf(card), 1);
			let maxUnits = board.row.map( r => [r,r.maxUnits()] ).filter( p => p[1].length > 0);
			if (row !== undefined)
				row.cards.push(card);
			let maxPower = maxUnits.reduce( (a,p) => Math.max(a, p[1][0].power), 0 );
			let scorched = maxUnits.filter( p => p[1][0].power === maxPower);
			let cards = scorched.reduce( (a,p) => a.concat( p[1].map(u => [p[0], u])), []);
			
			if (cards.length)
			{
				await Promise.all(cards.map( async u => await u[1].animate("scorch", true, false)) );
				await Promise.all(cards.map( async u => await board.toGrave(u[1], u[0])) );
			}
		}
	},
	scorch_c: {
		name: "Scorch - Close Combat",
		description: "Destroy your enemy's strongest Close Combat unit(s) if the combined strength of all his or her Close Combat units is 10 or more. ",
		placed: async (card) => await board.getRow(card, "close", card.holder.opponent()).scorch()
	},
	scorch_r: {
		name: "Scorch - Ranged",
		description: "Destroy your enemy's strongest Ranged Combat unit(s) if the combined strength of all his or her Ranged Combat units is 10 or more. ",
		placed: async (card) => await board.getRow(card, "ranged", card.holder.opponent()).scorch()
	},
	scorch_s: {
		name: "Scorch - Siege",
		description: "Destroys your enemy's strongest Siege Combat unit(s) if the combined strength of all his or her Siege Combat units is 10 or more. ",
		placed: async (card) => await board.getRow(card, "siege", card.holder.opponent()).scorch()
	},
	agile: {
		name:"agile", 
		description: "Can be placed in either the Close Combat or the Ranged Combat row. Cannot be moved once placed. "
	},
	muster: {
		name:"muster", 
		description: "Find any cards with the same name in your deck and play them instantly. ",
		placed: async (card) => {
			let i = card.name.indexOf('-');
			let cardName = i === -1 ?  card.name : card.name.substring(0, i);
			if (card['muster'])
			{
				cardName = card['muster'];
			}
			let pred = c => c.name.startsWith(cardName);
			let units = card.holder.hand.getCards(pred).map(x => [card.holder.hand, x])
			.concat(card.holder.deck.getCards(pred).map( x => [card.holder.deck, x] ) );
			if (units.length === 0)
				return;
			await card.animate("muster");
			await Promise.all( units.map( async p =>  await board.addCardToRow(p[1], p[1].row, p[1].holder, p[0])));
		}
	},
	spy: {
		name: "spy",
		description: "Place on your opponent's battlefield (counts towards your opponent's total) and draw 2 cards from your deck. ",
		audio: "spy",
		placed: async (card) => {
			await card.animate("spy");
			for (let i=0;i<2;i++) {
				if (card.holder.deck.cards.length > 0)
					await card.holder.deck.draw(card.holder.hand);
			}
			card.holder = card.holder.opponent();
			AudioManager.playSFX('draw');
		}
	},
	medic: {
		name: "medic",
		description: "Choose one card from your discard pile and play it instantly (no Heroes or Special Cards). ",
		audio: "medic",
		placed: async (card) => {
			let grave = board.getRow(card, "grave", card.holder);
			let units = card.holder.grave.findCards(c => c.isUnit());
			if (units.length <= 0)
				return;
			let wrapper = {card : null};
			if (game.randomRespawn) {
				const cards = grave.findCardsRandom(c => c.isUnit());
				if (cards.length > 0)
					wrapper.card = cards[0];
			} else if (card.holder.controller instanceof ControllerAI)
				wrapper.card =  card.holder.controller.medic(card, grave);
			else
				await ui.queueCarousel(card.holder.grave, 1, (c, i) => wrapper.card=c.cards[i], c => c.isUnit(), true);
			if (wrapper.card)
			{
				// move card visual to top of grave
				const res = wrapper.card;
				grave.removeCard(res);
				grave.addCard(res);
				let selectedRow = null;
				const isAgile = wrapper.card.row === "agile";
				if (isAgile)
				{
					if (card.holder.controller instanceof ControllerAI)
					{
						const close = board.getRow(res, "close", player_op);
						const ranged = board.getRow(res, "ranged", player_op);
						const closeVirtual = close.getVirtualCopy();
						const rangedVirtual = ranged.getVirtualCopy();

						closeVirtual.cards.push(res);
						closeVirtual.updateState(res, true);
						rangedVirtual.cards.push(res);
						rangedVirtual.updateState(res, true);

						const closeDif = closeVirtual.calcScore() - close.calcScore();
						const rangedDif = rangedVirtual.calcScore() - ranged.calcScore();
						const rowName = closeDif > rangedDif ? "close" 
							: closeDif < rangedDif ? "ranged"
							: Math.random() < 0.5 ? "close" : "ranged";
						selectedRow = board.getRow(res, rowName, player_op);
					}
					else
					{
						selectedRow = await ui.waitForRowSelection(wrapper.card);
						if (!selectedRow)
						{
							return;
						}
					}

				}
				await res.animate("medic");
				if (isAgile)
				{
					await board.moveTo(res, selectedRow, grave);
				}
				else
				{
					await res.autoplay(grave);
				}
			}
		}
	},
	morale: {
		name: "Morale",
		description: "Adds +1 to all units in the row (excluding itself). ",
		audio: "morale",
		placed: async card => {
			await card.animate("morale");
		}
	},
	bond: {
		name: "Tight Bond",
		description: "Place next to a card with the same name to double the strength of both cards. ",
		audio: "bond",
		placed: async card => {
			let bonds = board.getRow(card, card.row, card.holder).findCards(c => c.name === card.name);
			if (bonds.length > 1)
				await Promise.all( bonds.map(c => c.animate("bond")) );
		}
	},
	avenger: {
		name: "Avenger",
		description: "When this card is removed from the battlefield, it summons a powerful new Unit Card to take its place. ",
		removed: async (card) => {
			let bdf = new Card(card_dict[21], card.holder);
			bdf.removed.push( () => setTimeout( () => {
				if (game.isPlaying())
					bdf.holder.grave.removeCard(bdf);
			}, 1001) );
			await board.addCardToRow(bdf, "close", card.holder);
		},
		weight: () => 50
	},
	avenger_kambi: {
		name: "Avenger",
		description: "When this card is removed from the battlefield, it summons a powerful new Unit Card to take its place. ",
		removed: async card => {
			let bdf = new Card(card_dict[196], card.holder);
			bdf.removed.push( () => setTimeout( () => {
				if (game.isPlaying())
					bdf.holder.grave.removeCard(bdf); 
			}, 1001) );
			await board.addCardToRow(bdf, "close", card.holder);
		},
		weight: () => 50
	},
	avenger_darian: {
		name: "Avenger - Dragon Blood",
		description: "Transforms into the dragon Alduirn if destroyed by Scorch, or at the start of the next round if this round is lost. Returning with Decoy cancels transformation. ",
		audio: "avenger",
		placed: async (card) => {
			card._isDecoyed = false;
		},
		removed: async (card) => {
			if (card._isDecoyed) {
				return;
			}
			const dragonCardData = card_dict.find(c => c.filename === "darian_dragon" || c.name === "Alduirn");
			if (!dragonCardData) return;

			if (game && game.isClearingRound) {
				const lastVerdict = game.roundHistory && game.roundHistory.length > 0 
					? game.roundHistory[game.roundHistory.length - 1] 
					: null;
				const isLost = lastVerdict && lastVerdict.winner !== card.holder;
				if (isLost) {
					const holder = card.holder;
					game.roundStart.push(async () => {
						if (!game || game.state !== GameState.PLAYING) return true;
						const alduirn = new Card(dragonCardData, holder);
						await board.addCardToRow(alduirn, "close", holder);
						await AudioManager.playSFX("mardroeme");
						await alduirn.animate("hero");
						return true;
					});
				}
			} else {
				if (game && game.isPlaying()) {
					const holder = card.holder;
					const alduirn = new Card(dragonCardData, holder);
					await board.addCardToRow(alduirn, "close", holder);
					await AudioManager.playSFX("mardroeme");
					await alduirn.animate("hero");
				}
			}
		},
		weight: () => 50
	},
	foltest_king: {
		description: "Pick an Impenetrable Fog card from your deck and play it instantly.",
		activated: async card => {
			let out = card.holder.deck.findCard(c => c.name === "Impenetrable Fog");
			if (out)
				await out.autoplay(card.holder.deck);
		},
		weight: (card, ai) => ai.weightWeatherFromDeck(card, "fog")
	},
	foltest_lord: {
		description: "Clear any weather effects (resulting from Biting Frost, Torrential Rain or Impenetrable Fog cards) in play.",
		activated: async () => await weather.clearWeather(),
		weight: (card, ai) =>  ai.weightCard( {row:"weather", name:"Clear Weather"} )
	},
	foltest_siegemaster: {
		description: "Doubles the strength of all your Siege units (unless a Commander's Horn is also present on that row).",
		activated: async card => await board.getRow(card, "siege", card.holder).leaderHorn(),
		weight: (card, ai) => ai.weightHornRow(card, board.getRow(card, "siege", card.holder))
	},
	foltest_steelforged: {
		description: "Destroy your enemy's strongest Siege unit(s) if the combined strength of all his or her Siege units is 10 or more.",
		activated: async card => await ability_dict["scorch_s"].placed(card),
		weight: (card, ai, max) => ai.weightScorchRow(card, max, "siege")
	},
	foltest_son: {
		description: "Destroy your enemy's strongest Ranged Combat unit(s) if the combined strength of all his or her Ranged Combat units is 10 or more.",
		activated: async card => await ability_dict["scorch_r"].placed(card),
		weight: (card, ai, max) => ai.weightScorchRow(card, max, "ranged")
	},
	emhyr_imperial: {
		description: "Pick a Torrential Rain card from your deck and play it instantly.",
		activated: async card => {
			let out = card.holder.deck.findCard(c => c.name === "Torrential Rain");
			if (out)
				await out.autoplay(card.holder.deck);
		},
		weight: (card, ai) => ai.weightWeatherFromDeck(card, "rain")
	},
	emhyr_emperor: {
		description: "Look at 3 random cards from your opponent's hand.",
		activated: async card => {
			if (card.holder.controller instanceof ControllerAI)
				return;
			let container = new CardContainer();
			container.cards = card.holder.opponent().hand.findCardsRandom(() => true, 3);
			Carousel.curr.cancel();
			await ui.viewCardsInContainer(container);
		},
		weight: card => {
			let count = card.holder.opponent().hand.cards.length;
			return count === 0 ? 0 : Math.max(10, 10 * (8 - count));
		}
	},
	emhyr_whiteflame: {
		description: "Cancel your opponent's Leader Ability."
	},
	emhyr_relentless: {
		description: "Draw a card from your opponent's discard pile.",
		activated: async card => {
			let grave = board.getRow(card, "grave", card.holder.opponent());
			if (grave.findCards(c => c.isUnit()).length === 0)
				return;
			if (card.holder.controller instanceof ControllerAI) {
				let newCard = card.holder.controller.medic(card, grave);
				newCard.holder = card.holder;
				await board.toHand(newCard, grave);
				return;
			}
			Carousel.curr.cancel();
			await ui.queueCarousel(grave, 1, async (c,i) => {
				let newCard = c.cards[i];
				newCard.holder = card.holder;
				await board.toHand(newCard, grave);
			}, c => c.isUnit(), true);
		},
		weight: (card, ai, max, data) => ai.weightMedic(data, 0, card.holder.opponent())
	},
	emhyr_invader: {
		description: "Abilities that restore a unit to the battlefield restore a randomly-chosen unit. Affects both players.",
		gameStart: () => game.randomRespawn = true
	},
	usurper_coronation: {
		name: "Кровавая коронация",
		description: "Кровавая коронация: уничтожьте свой самый слабый отряд на поле (не героя), затем выставьте самый сильный отряд (не героя и не шпиона) из своей колоды.",
		usurperTargets: card => {
			const rows = ["close", "ranged", "siege"].map(r => board.getRow(card, r, card.holder));
			let weakest = null, weakestRow = null;
			for (const row of rows) {
				for (const c of row.cards) {
					if (!c.isUnit() || c.noRemove) continue;
					if (!weakest || c.power < weakest.power) { weakest = c; weakestRow = row; }
				}
			}
			const pool = card.holder.deck.findCards(c => c.isUnit() && !c.abilities.includes("spy"));
			let best = null;
			if (pool.length) {
				const maxP = Math.max(...pool.map(c => c.basePower));
				const top = pool.filter(c => c.basePower === maxP);
				best = top[randomInt(top.length)];
			}
			return { weakest, weakestRow, best };
		},
		activated: async card => {
			const t = ability_dict["usurper_coronation"].usurperTargets(card);
			if (t.weakest) {
				await t.weakest.animate("scorch", true, false);
				await board.toGrave(t.weakest, t.weakestRow);
			}
			if (t.best)
				await t.best.autoplay(card.holder.deck);
		},
		weight: card => {
			const t = ability_dict["usurper_coronation"].usurperTargets(card);
			if (!t.best) return 0;
			const loss = t.weakest ? t.weakest.power : 0;
			return Math.max(0, t.best.basePower - loss);
		}
	},
	eredin_commander: {
		description: "Double the strength of all your Close Combat units (unless a Commander's horn is 	also present on that row).",
		activated: async card => await board.getRow(card, "close", card.holder).leaderHorn(),
		weight: (card, ai) => ai.weightHornRow(card, board.getRow(card, "close", card.holder))
	},
	eredin_bringer_of_death: {
		name: "Eredin : Bringer of Death",
		description: "Restore a card from your discard pile to your hand.",
		activated: async card => {
			let newCard;
			if (card.holder.controller instanceof ControllerAI) {
				newCard = card.holder.controller.medic(card, card.holder.grave)
			} else {
				Carousel.curr.exit();
				await ui.queueCarousel(card.holder.grave, 1, (c,i) => newCard = c.cards[i], c => c.isUnit(), false, false);
			}
			if (newCard)
				await board.toHand(newCard, card.holder.grave);
		},
		weight: (card, ai, max, data) => ai.weightMedic(data, 0, card.holder)
	},
	eredin_destroyer: {
		description: "Discard 2 card and draw 1 card of your choice from your deck.",
		activated: async (card) => {
			let hand = board.getRow(card, "hand", card.holder);
			let deck = board.getRow(card, "deck", card.holder);
			if (card.holder.controller instanceof ControllerAI) {
				let cards = card.holder.controller.discardOrder(card).splice(0,2).filter(c => c.basePower < 7);
				await Promise.all(cards.map(async c => await board.toGrave(c, card.holder.hand)));
				card.holder.deck.draw(card.holder.hand);
				return;
			} else
				Carousel.curr.exit();
			await ui.queueCarousel(hand, 2, (c,i) => board.toGrave(c.cards[i], c), () => true);
			await ui.queueCarousel(deck, 1, (c,i) => board.toHand(c.cards[i], deck), () => true, true);
		},
		weight: (card, ai) => {
			let cards = ai.discardOrder(card).splice(0,2).filter(c => c.basePower < 7);
			if (cards.length < 2)
				return 0;
			return cards[0].abilities.includes("muster") ? 50 : 25;
		}
	},
	eredin_king: {
		description: "Pick any weather card from your deck and play it instantly.",
		activated: async card => {
			let deck = board.getRow(card, "deck", card.holder);
			if (card.holder.controller instanceof ControllerAI) {
				await ability_dict["eredin_king"].helper(card).card.autoplay(card.holder.deck);
			} else {
				Carousel.curr.cancel();
				await ui.queueCarousel(deck, 1, (c,i) => board.toWeather(c.cards[i], deck), c => c.faction === "weather", true);
			}
		},
		weight: (card, ai, max) => ability_dict["eredin_king"].helper(card).weight,
		helper: card => {
			let weather = card.holder.deck.cards.filter(c => c.row === "weather").reduce((a,c) =>a.map(c => c.name).includes(c.name) ? a : a.concat([c]), [] );
			
			let out, weight = -1;
			weather.forEach( c => {
				let w = card.holder.controller.weightWeatherFromDeck(c, c.abilities[0]);
				if (w > weight) {
					weight = w;
					out = c;
				}
			});
			return {card: out, weight: weight};
		}			
	},
	eredin_treacherous: {
		description: "Doubles the strength of all spy cards (affects both players).",
		gameStart: () => game.doubleSpyPower = true
	},
	francesca_queen: {
		description: "Destroy your enemy's strongest Close Combat unit(s) if the combined strength of all his or her Close Combat units is 10 or more.",
		activated: async card => await ability_dict["scorch_c"].placed(card),
		weight: (card, ai, max) => ai.weightScorchRow(card, max, "close")
	},
	francesca_beautiful: {
		description: "Doubles the strength of all your Ranged Combat units (unless a Commander's Horn is also present on that row).",
		activated: async card => await board.getRow(card, "ranged", card.holder).leaderHorn(),
		weight: (card, ai) => ai.weightHornRow(card, board.getRow(card, "ranged", card.holder))
	},
	francesca_daisy: {
		description: "Draw an extra card at the beginning of the battle.",
		placed: card => game.gameStart.push( () => {
			let draw = card.holder.deck.removeCard(0);
			card.holder.hand.addCard( draw );
			return true;
		})
	},
	francesca_pureblood: {
		description: "Pick a Biting Frost card from your deck and play it instantly.",
		activated: async card => {
			let out = card.holder.deck.findCard(c => c.name === "Biting Frost");
			if (out)
				await out.autoplay(card.holder.deck);
		},
		weight: (card, ai) => ai.weightWeatherFromDeck(card, "frost")
	},
	francesca_hope: {
		description: "Move agile units to whichever valid row maximizes their strength (don't move units already in optimal row).",
		activated: async card => {
			const close = board.getRow(card, "close");
			const ranged =  board.getRow(card, "ranged");
			const solution = ability_dict["francesca_hope"].helper(card);
			await Promise.all(solution.cards.map(async p => await board.moveTo(p.card, p.row === close ? ranged : close, p.row) ) );
		},
		weight: card => {
			const {score, cards} = ability_dict["francesca_hope"].helper(card);
			return score;
		},
		helper: card => {
			const close = board.getRow(card, "close");
			const ranged = board.getRow(card, "ranged");
			const agileCards = close.cards.filter(c => c.row === "agile").concat(ranged.cards.filter(c => c.row === "agile"));
			const notAgilePred = c => c.row !== "agile";
			const closeNorm = close.getVirtualCopy(notAgilePred);
			const rangedNorm = ranged.getVirtualCopy(notAgilePred);
			const {score, pattern} = findBest(closeNorm, rangedNorm, agileCards);
			// filter for only cards that need to change row and return
			return {
				score: score,
				cards: agileCards.map((c)=> { return {card: c, row: close.cards.includes(c) ? close : ranged}; })
				.filter((pair, i) => (pair.row === close) !== (pattern[i]===0))
			};

			function findBest(close, ranged, agile, depth = 0, pattern=null)
			{
				if (agile.length === 0)
					return {score: -1, pattern: []};
				else if (agile.length === depth)
				{
					const closeCopy = close.getVirtualCopy();
					const rangedCopy = ranged.getVirtualCopy();
					for (let i=0; i <agile.length; ++i)
					{
						const row = pattern[i] === 0 ? closeCopy : rangedCopy;
						row.cards.push(agile[i]);
						row.updateState(agile[i], true);
					}
					return {score: closeCopy.calcScore() + rangedCopy.calcScore() - (close.calcScore() + ranged.calcScore()), pattern: pattern};
				}
				if (depth === 0)
				{
					pattern = Array(agile.length).fill(0);
				}
				const left = findBest(close, ranged, agile, depth + 1, pattern)
				const modPattern = pattern.slice();
				modPattern[depth] = 1;
				const right = findBest(close, ranged, agile, depth + 1, modPattern);
				return left.score >= right.score ? left : right;
			}
		}
	},
	crach_an_craite: {
		description: "Shuffle all cards from each player's graveyard back into their decks.",
		activated: async card => {
			AudioManager.playSFX('redraw');
			Promise.all(card.holder.grave.cards.map(c => board.toDeck(c, card.holder.grave)));
			await Promise.all(card.holder.opponent().grave.cards.map(c => board.toDeck(c, card.holder.opponent().grave)));
		},
		weight: (card, ai, max, data) => {
			if( game.roundCount < 2)
				return 0;
			let medics = card.holder.hand.findCard(c => c.abilities.includes("medic"));
			if (medics !== undefined)
				return 0;
			let spies = card.holder.hand.findCard(c => c.abilities.includes("spy"));
			if (spies !== undefined)
				return 0;
			if (card.holder.hand.findCard(c => c.abilities.includes("decoy")) !== undefined && (data.medic.length || data.spy.length && card.holder.deck.findCard(c => c.abilities.includes("medic")) !== undefined) )
				return 0;
			return 15;
		}
	},
	king_bran: {
		description: "Units only lose half their Strength in bad weather conditions.",
		placed: card => board.row.filter((c,i) => card.holder === player_me ^ i<3).forEach(r => r.effects.halfWeather = true)
	},

	// ================= Gwent standalone leaders (adapted to Witcher 3 rules) =================

	// ---------- Nilfgaard ----------
	calveit_foresight: {
		description: "Предвидение: посмотрите 3 верхние карты своей колоды и возьмите одну из них в руку.",
		activated: async card => {
			const top = card.holder.deck.cards.slice(0, 3);
			const pick = await LeaderUtil.pick(card, top, "Предвидение: возьмите карту", cs => LeaderUtil.strongest(cs));
			if (pick) await board.toHand(pick, card.holder.deck);
		},
		weight: card => card.holder.deck.cards.length ? 14 : 0
	},
	voorhis_intel: {
		description: "Разведка: раскройте 4 случайные карты из руки соперника. Он сбрасывает самый сильный отряд (не героя) среди них.",
		activated: async card => {
			const op = card.holder.opponent();
			const revealed = op.hand.findCardsRandom(() => true, 4);
			if (!revealed.length) return;
			if (!LeaderUtil.isAI(card)) {
				LeaderUtil.closeCarousel();
				const c = new CardContainer(); c.cards = revealed.slice();
				await ui.viewCardsInContainer(c);
			}
			const units = revealed.filter(c => c.isUnit());
			if (units.length) await board.toGrave(LeaderUtil.strongest(units), op.hand);
		},
		weight: card => card.holder.opponent().hand.cards.length ? 16 : 0
	},

	// ---------- Northern Realms ----------
	radovid_stern: {
		description: "Хладнокровие: уничтожьте 2 самых слабых отряда соперника на поле (не героев).",
		activated: async card => {
			const t = LeaderUtil.units(LeaderUtil.opRows(card)).sort((a, b) => a.c.power - b.c.power).slice(0, 2);
			await LeaderUtil.destroy(t);
		},
		weight: card => LeaderUtil.units(LeaderUtil.opRows(card)).sort((a, b) => a.c.power - b.c.power).slice(0, 2).reduce((s, p) => s + p.c.power, 0)
	},
	henselt_mobilize: {
		description: "Кэдвенская мобилизация: выставьте из колоды все копии отряда осадного ряда с наибольшей общей силой.",
		helper: card => {
			const groups = {};
			card.holder.deck.cards.filter(c => c.isUnit() && c.row === "siege" && !c.abilities.includes("spy"))
				.forEach(c => { (groups[c.name] = groups[c.name] || []).push(c); });
			let best = [], bestSum = 0;
			for (const g of Object.values(groups)) {
				const s = g.reduce((a, c) => a + c.basePower, 0);
				if (s > bestSum) { best = g; bestSum = s; }
			}
			return { cards: best, sum: bestSum };
		},
		activated: async card => {
			const { cards } = ability_dict["henselt_mobilize"].helper(card);
			for (const c of cards) await c.autoplay(card.holder.deck);
		},
		weight: card => ability_dict["henselt_mobilize"].helper(card).sum
	},
	demavend_dignity: {
		description: "Королевское достоинство: возьмите 2 карты из колоды, затем сбросьте 1 карту из руки на выбор.",
		activated: async card => {
			for (let i = 0; i < 2 && card.holder.deck.cards.length; i++)
				await card.holder.deck.draw(card.holder.hand);
			const hand = card.holder.hand.cards.slice();
			if (!hand.length) return;
			const pick = await LeaderUtil.pick(card, hand, "Сбросьте 1 карту",
				() => card.holder.controller.discardOrder(card)[0] || hand[0]);
			if (pick) await board.toGrave(pick, card.holder.hand);
		},
		weight: card => card.holder.deck.cards.length >= 2 ? 15 : 0
	},
	meve_inspiration: {
		description: "Лирийский клич: все ваши отряды на поле (не герои) получают +1 к силе до конца раунда.",
		activated: async card => {
			const rows = LeaderUtil.myRows(card);
			rows.forEach(r => { r.effects.morale += 1; r.updateScore(); });
			await Promise.all(LeaderUtil.units(rows).map(p => p.c.animate("morale")));
			game.roundEnd.push(() => { rows.forEach(r => { r.effects.morale = Math.max(0, r.effects.morale - 1); }); return true; });
		},
		weight: card => LeaderUtil.units(LeaderUtil.myRows(card)).length
	},

	// ---------- Scoia'tael ----------
	eithne_wrath: {
		description: "Гнев Брокилона: возьмите в руку из колоды особую карту или карту погоды на выбор.",
		pool: card => LeaderUtil.uniqueByName(card.holder.deck.cards.filter(c => c.faction === "special" || c.faction === "weather")),
		activated: async card => {
			const pool = ability_dict["eithne_wrath"].pool(card);
			const prio = ["Scorch", "Commander's Horn", "Decoy", "Mardroeme"];
			const pick = await LeaderUtil.pick(card, pool, "Гнев Брокилона: возьмите карту",
				cs => cs.slice().sort((a, b) => (prio.indexOf(a.name) + 1 || 99) - (prio.indexOf(b.name) + 1 || 99))[0]);
			if (pick) await board.toHand(pick, card.holder.deck);
		},
		weight: card => ability_dict["eithne_wrath"].pool(card).length ? 13 : 0
	},
	filavandrel_gift: {
		description: "Дар Старшего народа: выберите 1 из 3 случайных отрядов (сила 4–8, не герои) вашей фракции или нейтральных — он создаётся у вас в руке.",
		activated: async card => {
			const opts = LeaderUtil.sample(LeaderUtil.createPool([card.holder.deck.faction, "neutral"], 4, 8), 3)
				.map(d => new Card(d, card.holder));
			const pick = await LeaderUtil.pick(card, opts, "Дар Старшего народа", cs => LeaderUtil.strongest(cs));
			if (pick) card.holder.hand.addCard(pick);
		},
		weight: () => 14
	},
	brouver_mahakam: {
		description: "Махакамский вождь: выставьте из колоды самого сильного краснолюда (не героя).",
		helper: card => LeaderUtil.strongest(card.holder.deck.cards.filter(c => c.isUnit() && !c.abilities.includes("spy") && LeaderUtil.DWARF.test(c.name))),
		activated: async card => {
			const c = ability_dict["brouver_mahakam"].helper(card);
			if (c) await c.autoplay(card.holder.deck);
		},
		weight: card => { const c = ability_dict["brouver_mahakam"].helper(card); return c ? c.basePower + 2 : 0; }
	},

	// ---------- Monsters ----------
	unseen_elder_thirst: {
		description: "Жажда крови: уничтожьте 2 своих самых слабых отряда на поле (не героев) и возьмите 3 карты из колоды.",
		activated: async card => {
			const t = LeaderUtil.units(LeaderUtil.myRows(card)).sort((a, b) => a.c.power - b.c.power).slice(0, 2);
			await LeaderUtil.destroy(t);
			for (let i = 0; i < 3 && card.holder.deck.cards.length; i++)
				await card.holder.deck.draw(card.holder.hand);
		},
		weight: card => {
			if (card.holder.deck.cards.length < 2) return 0;
			const lost = LeaderUtil.units(LeaderUtil.myRows(card)).sort((a, b) => a.c.power - b.c.power).slice(0, 2).reduce((s, p) => s + p.c.power, 0);
			return Math.max(0, 18 - lost * 2);
		}
	},
	dagon_depths: {
		description: "Зов глубин: призовите Непроглядный туман или Проливной дождь на выбор (карта создаётся, а не берётся из колоды).",
		activated: async card => {
			const opts = ["Impenetrable Fog", "Torrential Rain"].map(n => new Card(card_dict.find(d => d.name === n), card.holder));
			const pick = await LeaderUtil.pick(card, opts, "Зов глубин: выберите погоду",
				cs => cs.slice().sort((a, b) => card.holder.controller.weightWeather(b) - card.holder.controller.weightWeather(a))[0]);
			if (pick) await board.toWeather(pick, null);
		},
		weight: (card, ai) => Math.max(0, ...["fog", "rain"].map(w => ai.weightWeather({ name: w, abilities: [w] })))
	},
	woodland_spirit_force: {
		description: "Сила природы: призовите 3 «Волчьи стаи» в ряд ближнего боя и Непроглядный туман.",
		activated: async card => {
			const wolf = card_dict.find(d => d.name === "Wolf Pack");
			const fog = card_dict.find(d => d.name === "Impenetrable Fog");
			for (let i = 0; i < 3; i++)
				await board.addCardToRow(new Card(wolf, card.holder), "close", card.holder);
			if (fog) await board.toWeather(new Card(fog, card.holder), null);
		},
		weight: (card, ai) => 3 + Math.max(-3, ai.weightWeather({ name: "fog", abilities: ["fog"] }))
	},
	arachas_queen_brood: {
		description: "Королева роя: выставьте из колоды всех главоглазов (Arachas, не героев).",
		helper: card => card.holder.deck.cards.filter(c => c.isUnit() && c.name.startsWith("Arachas")),
		activated: async card => {
			for (const c of ability_dict["arachas_queen_brood"].helper(card))
				if (card.holder.deck.cards.includes(c)) await c.autoplay(card.holder.deck);
		},
		weight: card => ability_dict["arachas_queen_brood"].helper(card).reduce((s, c) => s + c.basePower, 0)
	},

	// ---------- Skellige ----------
	eist_clan: {
		description: "Зов кланов: создайте и выставьте на поле случайный отряд Скеллиге (сила 4–8, не герой).",
		activated: async card => {
			const d = LeaderUtil.sample(LeaderUtil.createPool(["skellige"], 4, 8), 1)[0];
			if (!d) return;
			const c = new Card(d, card.holder);
			await board.addCardToRow(c, c.row === "agile" ? "close" : c.row, card.holder);
		},
		weight: () => 6
	},
	harald_fury: {
		description: "Ярость Хромого: уничтожьте в одном ряду соперника случайные отряды (не героев) общей силой не больше 9.",
		helper: card => {
			let best = [], bestSum = 0;
			for (const row of LeaderUtil.opRows(card)) {
				const pool = LeaderUtil.sample(LeaderUtil.units([row]), 99);
				let sum = 0; const chosen = [];
				for (const p of pool) if (sum + p.c.power <= 9) { chosen.push(p); sum += p.c.power; }
				if (sum > bestSum) { best = chosen; bestSum = sum; }
			}
			return { targets: best, sum: bestSum };
		},
		activated: async card => await LeaderUtil.destroy(ability_dict["harald_fury"].helper(card).targets),
		weight: card => ability_dict["harald_fury"].helper(card).sum
	},

	// ---------- Syndicate ----------
	gudrun_plunder: {
		description: "Пиратский налёт: заберите случайный отряд (не героя) из колоды соперника себе в руку.",
		activated: async card => {
			const op = card.holder.opponent();
			const c = op.deck.findCardsRandom(c => c.isUnit(), 1)[0];
			if (!c) return;
			c.holder = card.holder;
			await board.toHand(c, op.deck);
		},
		weight: card => card.holder.opponent().deck.findCards(c => c.isUnit()).length ? 13 : 0
	},
	cleaver_cudgel: {
		description: "Дубина Тесака: уничтожьте самый сильный отряд соперника (не героя) с силой не больше 7.",
		helper: card => {
			const t = LeaderUtil.units(LeaderUtil.opRows(card)).filter(p => p.c.power <= 7).sort((a, b) => b.c.power - a.c.power);
			return t.length ? [t[0]] : [];
		},
		activated: async card => await LeaderUtil.destroy(ability_dict["cleaver_cudgel"].helper(card)),
		weight: card => { const t = ability_dict["cleaver_cudgel"].helper(card); return t.length ? t[0].c.power : 0; }
	},
	sigi_mastermind: {
		description: "Теневой кукловод: возьмите в руку до 2 карт-шпионов из своей колоды.",
		helper: card => card.holder.deck.cards.filter(c => c.abilities.includes("spy")).slice(0, 2),
		activated: async card => {
			for (const c of ability_dict["sigi_mastermind"].helper(card))
				await board.toHand(c, card.holder.deck);
		},
		weight: card => ability_dict["sigi_mastermind"].helper(card).length * 12
	}
};

// Shared helpers for leader abilities
var LeaderUtil = {
	DWARF: /Dwarv|Dwarf|Mahakam|Barclay|Dennis Cranmer|Paulie|Havekar|Yarpen|Zoltan|Harald Gord/i,
	isAI: card => card.holder.controller instanceof ControllerAI,
	closeCarousel: () => { if (Carousel.curr) Carousel.curr.exit(); },
	myRows: card => ["close", "ranged", "siege"].map(r => board.getRow(card, r, card.holder)),
	opRows: card => ["close", "ranged", "siege"].map(r => board.getRow(card, r, card.holder.opponent())),
	// non-hero units on given rows as {c, row}
	units: rows => rows.flatMap(row => row.cards.filter(c => c.isUnit() && !c.noRemove).map(c => ({ c, row }))),
	strongest: cards => cards.length ? cards.reduce((a, c) => (c.basePower > a.basePower ? c : a), cards[0]) : null,
	uniqueByName: cards => cards.filter((c, i) => cards.findIndex(x => x.name === c.name) === i),
	sample: (arr, n) => {
		const a = arr.slice();
		for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
		return a.slice(0, n);
	},
	createPool: (decks, min, max) => card_dict.filter(d => decks.includes(d.deck)
		&& ["close", "ranged", "siege", "agile"].includes(d.row)
		&& !/\b(hero|spy)\b/.test(d.ability) && !/avenger|berserker/.test(d.ability)
		&& Number(d.strength) >= min && Number(d.strength) <= max),
	destroy: async pairs => {
		if (!pairs.length) return;
		await Promise.all(pairs.map(p => p.c.animate("scorch", true, false)));
		await Promise.all(pairs.map(p => board.toGrave(p.c, p.row)));
	},
	// Human: forced carousel choice. AI: aiPick(cards).
	pick: async (card, cards, title, aiPick) => {
		if (!cards.length) return null;
		if (LeaderUtil.isAI(card)) return aiPick(cards);
		LeaderUtil.closeCarousel();
		const cont = new CardContainer();
		cont.cards = cards.slice();
		let chosen = null;
		await ui.queueCarousel(cont, 1, (c, i) => { chosen = c.cards[i]; }, () => true, false, false, title);
		return chosen;
	}
};