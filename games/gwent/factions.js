"use strict"

var factions = {
	realms: {
		name: "Королевства Севера",
		factionAbility: player => game.roundStart.push( async () => {
			if (game.roundCount > 1 && game.roundHistory[game.roundCount-2].winner === player) {
				player.deck.draw(player.hand);
				await ui.notification("north", 1200);
			}
			return false;
		}),
		description: "Дар Севера: вы берёте дополнительную карту из колоды после каждого выигранного раунда."
	},
	nilfgaard: {
		name: "Империя Нильфгаард",
		description: "Имперская мощь: Нильфгаард побеждает в любом раунде, завершившемся вничью."
	},
	monsters: {
		name: "Чудовища",
		factionAbility: player => game.roundEnd.push(() => {
			const units = board.row.filter( (r,i) => player === player_me ^ i < 3)
				.reduce((a,r) => r.cards.filter(c => c.isUnit()).concat(a), []);
			if (units.length === 0)
				return;
			const card = units[randomInt(units.length)];
			card.noRemove = true;
			game.roundStart.push( async () => {
				const row = board.row.find(r => r.cards.includes(card));
				if (typeof card.silence === "function") card.silence(row);
				await ui.notification("monsters", 1200);
				delete card.noRemove;
				return true; 
			});
			return false;
		}),
		description: "Свирепость Чудовищ: в конце каждого раунда на поле боя остаётся один случайный отряд (не герой), но его способность в новом раунде не действует."
	},
	scoiatael: {
		name: "Скоя'таэли",
		factionAbility: player => game.gameStart.push( async () => {
			let notif = "";
			if (player === player_me) {
				await ui.popup("Ходить первым", () => game.firstPlayer = player, "Уступить ход", () => game.firstPlayer = player.opponent(), "Право первого хода", "Способность фракции Скоя'таэлей позволяет вам выбрать, кто начнёт партию первым.", 0.55);
				notif = game.firstPlayer.tag + "-first";
			} else if (player.hand instanceof HandAI) {
				if (Math.random() < 0.5) {
					game.firstPlayer = player;
					notif = "scoiatael";
				} else {
					game.firstPlayer = player.opponent();
					notif = game.firstPlayer.tag + "-first";
				}
			} else {
				//sleepUntil(game.firstPlayer); //TODO online
			}
			await ui.notification(notif,1200);
			return true;
		}),
		description: "Партизанская засада: вы сами выбираете, кто будет ходить первым в начале партии."
	},
	skellige: {
		name: "Скеллиге",
		factionAbility: player => game.roundStart.push( async () => {
			if (game.roundCount != 3)
				return false;
			const currPlayer = game.currPlayer;
			game.currPlayer = player;
			await ui.notification("skellige-" + player.tag, 1200);
			if (player.controller instanceof ControllerAI)
			{
				await Promise.all(player.grave.findCardsRandom(c => c.isUnit(), 2).map(c => {
					c.holder = player;
					if (typeof c.silence === "function") c.silence();
					return board.toRow(c, player.grave);
				}));
			}
			else
			{
				await factions['skellige'].helper(player);
				await factions['skellige'].helper(player);
			}
			game.currPlayer = currPlayer;
			return true;
		}),
		helper: async player => {
			const units = player.grave.findCardsRandom(c => c.isUnit(), 1);
			if (units.length === 0)
				return;
			const card = units[0];
			card.holder = player;
			if (typeof card.silence === "function") card.silence();
			if (card.row === 'agile')
			{
				const selectedRow = await ui.waitForRowSelection(card);
				if (selectedRow)
				{
					await board.moveTo(card, selectedRow, player.grave);
				}
			}
			else
			{
				await board.toRow(card, player.grave);
			}
		},
		description: "Ярость Скеллиге: в начале третьего раунда 2 случайных отряда из вашего сброса возвращаются на поле боя (без срабатывания их способностей)."
	},
	syndicate: {
		name: "Синдикат",
		factionAbility: player => game.roundStart.push( async () => {
			if (game.roundCount === 2) {
				player.deck.draw(player.hand);
				await ui.notification("syndicate", 1200);
			}
			return false;
		}),
		description: "Теневая казна: в начале второго раунда вы берёте 1 дополнительную карту из своей колоды."
	}
}