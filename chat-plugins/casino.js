const casinoAuthDataFile = DATA_DIR + 'authcasino.json';
const SALA_GAMES = 'Casino';
var fs = require('fs');

if (!fs.existsSync(casinoAuthDataFile))
	fs.writeFileSync(casinoAuthDataFile, '{}');

var casinoOwners = JSON.parse(fs.readFileSync(casinoAuthDataFile).toString());
var defaultPermission = 'ban';

var tourBets = {};
var tourPrize = 0;

var wheelStatus = false;
var wheelOptions = [];
var wheelBets = {};
var prize = 0;

var bingoStatus = false;
var bingoNumbers = [];
var bingoSaidNumbers = {};
var actualValue = 0;
var tables = {};
var bingoPrize = 0;

function writeCasinoData() {
	fs.writeFileSync(casinoAuthDataFile, JSON.stringify(casinoOwners));
}

function getUserName (user) {
	var targetUser = Users.get (user);
	if (!targetUser) return toId(user);
	return targetUser.name;
}

const getBingoNumbers = ["1", "2","3", 
"4","5","6","7",
"8","9","10",
"11","12","13",
"14","15","16",
"17","18","19",
"20","21","22",
"23","24","25",
"26","27","28",
"29","30","31",
"32","33","34",
"35","36","37",
"38","39","40",
"41","42","43",
"44","45","46",
"47","48","49",
"50"];

function checkBingo(room) {
	var winners = [];
	var endGame = false;
	var targetTable;
	var tableComplete;
	for (var i in tables) {
		targetTable = tables[i];
		tableComplete = 0
		for (var j = 0; j < targetTable.length; ++j) {
			if (!bingoSaidNumbers[targetTable[j]]) break;
			++tableComplete;
		}
		if (tableComplete === targetTable.length) {
			endGame = true;
			winners.push(i);
		}
	}
	if (endGame) {
	var winData = '';
		for (var n = 0; n < (winners.length - 1); ++n) {
    Db('money').set(winners[n], Db('money').get((winners[n]), 0) + bingoPrize).get(winners[n]);
			if (n === 0) {
				winData += getUserName(winners[n]);
			} else {
				winData += ', ' + getUserName(winners[n]);
			}
		}

    Db('money').set(winners[winners.length - 1], Db('money').get((winners[winners.length - 1]), 0) + bingoPrize).get(winners[winners.length - 1]);
		if (winners.length > 1) winData += ' y ';
		winData += getUserName(winners[winners.length - 1]);
		room.addRaw("<div class=\"broadcast-blue\"><b>Han cantado Bingo!</b><br />Felicidades a " + winData + " por ganar. Premio: " + bingoPrize + " pd</div>");
		room.update();
		bingoStatus = false;
	}
}

function forceEndTourBets() {
	for (var i in tourBets) {
		Shop.giveMoney(i, tourBets[i].pd);
		tourPrize += (- tourBets[i].pd);
	}
	tourBets = {};
	tourPrize = 0;
}

exports.commands = {
	
	nuevobingo: 'newbingo',
	newbingo: function (target, room, user) {
		if (room.id !== 'casino') return this.sendReply("Este comando solo puede ser usado en una sala de " + SALA_GAMES);
		if (!casinoOwners[user.userid] && !this.can(defaultPermission, room)) return false;
		if (bingoStatus) return this.sendReply("Ya hay un bingo en marcha.");
		bingoStatus = true;
		bingoNumbers = Tools.shuffle(getBingoNumbers.slice(0));
		bingoSaidNumbers = {};
		actualValue = 0;
		tables = {};
		bingoPrize = 0;
		this.privateModCommand('(' + user.name + ' ha iniciado un juego de Bingo)');
		room.addRaw("<div class=\"broadcast-blue\"><b>Se ha iniciado un nuevo juego de Bingo!</b><br />Puedes participar por 10 pd con /buytable.</div>");
		room.update();
		var loop = function () {
			setTimeout(function () {
				if (!bingoStatus) return;
				if (actualValue >= bingoNumbers.length) {
					bingoStatus = false;
					room.addRaw("<div class=\"broadcast-blue\"><b>El juego de Bingo ha terminado!</b><br />Lamentablemente nadie se había apuntado, así que no hay ganador!</div>");
					room.update();
					return;
				}
				room.add('|c|' + Bot.config.group + Bot.config.name + '|**Juego de Bingo:** Sale el número **' + bingoNumbers[actualValue] + '**');
				bingoSaidNumbers[bingoNumbers[actualValue]] = 1;
				++actualValue;
				room.update();
				checkBingo(room);
				loop();
			}, 1000 * 3);
		};
		loop();
	},
	
	comprartablilla: 'buytable',
	comprartabla: 'buytable',
	buytable: function (target, room, user) {
		if (room.id !== 'casino') return this.sendReply("Este comando solo puede ser usado en la sala casino.");
		let amount = Db('money').get(user.userid, 0);
		if (!bingoStatus) return this.sendReply("No hay ningún bingo en marcha.");
		if (tables[user.userid]) return this.sendReply("Ya habías comprado una tablilla.");
 		if (Db('money').get(toId(user.name), 0) < 10) return this.sendReply("No tienes suficiente dinero");
			Db('money').set(toId(user.name), Db('money').get(toId(user.name), 0) - 10).get(toId(user.name));
       Db('money').set('casino', Db('money').get('casino', 0) + 5).get('casino');
		var numbers = Tools.shuffle(getBingoNumbers.slice(0));
		var cells = [];
		for (var i = 0; i < 5; ++i) {
			cells.push(numbers[i]);
		}
		tables[user.userid] = cells;
		bingoPrize += 15;
		this.sendReply("Has Comprado una tablilla. Para ver su estado usa /bingo");
		this.parse('/bingo');
		checkBingo(room);
	},
	
	vertablilla: 'bingo',
	tablilla: 'bingo',
	bingo: function (target, room, user) {
		if (room.id !== 'casino') return this.sendReply("Este comando solo puede ser usado en la sala casino.");
		if (!this.runBroadcast()) return;
		if (!bingoStatus) return this.sendReply("No hay ningún bingo en marcha.");
		var targetUserId = user.userid;
		if (tables[toId(target)]) targetUserId = toId(target);
		if (tables[targetUserId]) {
			var html = '<b>Juego de bingo:</b> Tablilla de ' + getUserName(targetUserId) + '<br /><br />';
			html += '<table border="1" cellspacing="0" cellpadding="3" target="_blank"><tbody><tr>';
			for (var n = 0; n < tables[targetUserId].length; ++n) {
				if (!bingoSaidNumbers[tables[targetUserId][n]]) {
					html += '<td><center><b>' + tables[targetUserId][n] + '</b></center></td>';
				} else {
					html += '<td><center><font color="red"><b>' + tables[targetUserId][n] + '</b></font></center></td>';
				}
			}
			html += '</tr></tbody></table><br />';
		} else {
			var html = '<b>Juego de bingo:</b> No estás apuntado, puedes hacerlo con /buytable<br /><br />';
		}
		html += '<b>Actual premio: </b>' + bingoPrize + ' pd.';
		this.sendReplyBox(html);
	},
	nr: 'newwheel',
	nuevaruleta: 'newwheel',
	newwheel: function (target, room, user) {
		if (room.id !== 'casino') return this.sendReply("Este comando solo puede ser usado en la sala casino.");
		if (!casinoOwners[user.userid] && !this.can(defaultPermission, room)) return false;
		if (wheelStatus) return this.sendReply("Ya hay una ruleta en marcha.");
		var params = target.split(',');
		if (!params || params.length !== 2) return this.sendReply("Usage: /nuevaruleta [initprize], [size]");
		var initPrize = parseInt(params[0]);
		var wheelSize = parseInt(params[1]);
		if (initPrize && initPrize > 1000 && !casinoOwners[user.userid] && user.can('casino')) return this.sendReply("No tienes autoridad para apostar más de 1000 pd en una sola ruleta.");
		if (!wheelSize || wheelSize < 8 || wheelSize > 20) return this.sendReply("El tamaño debe ser de 8 a 20 casillas");
		if (initPrize && initPrize >= 10 && initPrize <= Db('money').get(toId('casino'), 0)) {
			prize = initPrize;

	 Db('money').set('casino', Db('money').get('casino', 0) - initPrize).get('casino');
		} else {
			return this.sendReply("Debes establecer un premio inicial superior a 10 pd pero inferior al total de beneficios del casino.");
		}
		var keys = [];
		var pokemonLeft = 0;
		var pokemon = [];
		wheelOptions = [];
		wheelStatus = true;
		for (var i in Tools.data.FormatsData) {
			if (Tools.data.FormatsData[i].randomBattleMoves) {
				keys.push(i);
			}
		} 
		keys = Tools.shuffle(keys);
		for (var i = 0; i < keys.length && pokemonLeft < wheelSize; i++) {
			var template = Tools.getTemplate(keys[i]);
			if (template.species.indexOf('-') > -1) continue;
			if (template.species === 'Pichu-Spiky-eared') continue;
			if (template.tier !== 'LC') continue;
			wheelOptions.push(template.species);
			++pokemonLeft;
		}
		var htmlDeclare = '';
		for (var j = 0; j < wheelOptions.length; j++) {
			htmlDeclare += '<img src="http://play.pokemonshowdown.com/sprites/xyani/' + toId(wheelOptions[j]) + '.gif" title="' + wheelOptions[j] +'" />&nbsp;';
		}
		htmlDeclare += '<br /><br /><b>Usa /apostar [pokemon] para jugar a la ruleta. Cuesta 10 pds.</b><br /><b>El ganador o ganadores se llevan un premio de ' + prize + ' pd + 20 pd por participante.</b></center></div>';
		this.privateModCommand('(' + user.name + ' ha iniciado un juego de ruleta. Premio inicial: ' + initPrize + ' pd ; Casillas: ' + wheelSize + ')');
		room.addRaw('<div class="broadcast-blue"><center><h1>Juego de Ruleta</h1><b>' + htmlDeclare);
		room.update();
	},
	
	finruleta: 'endwheel',
	endwheel: function (target, room, user) {
		if (room.id !== 'casino') return this.sendReply("Este comando solo puede ser usado en la sala casino.");
		if (!casinoOwners[user.userid] && !this.can(defaultPermission, room)) return false;
		if (!wheelStatus) return this.sendReply("No hay ninguna ruleta en marcha.");
		var pkm = wheelOptions[Math.floor(Math.random() * wheelOptions.length)];
		var htmlDeclare = '<div class="broadcast-green"><center><h1>Juego de Ruleta Finalizado</h1><h3>La ruleta ha girado y el Pokemon elegido es ' + pkm + '</h3><img src="http://play.pokemonshowdown.com/sprites/xyani/' + toId(pkm) + '.gif" title="' + pkm + '" /> <br /><br /><b>';
		var winners = [];
		for (var i in wheelBets) {
			if (toId(wheelBets[i]) === toId(pkm)) winners.push(i);
		}
		if (!winners || winners.length < 1) {
			htmlDeclare += 'Lamentablemente nadie había apostado por este Pokemon.</b>';
	 Db('money').set('casino', Db('money').get('casino', 0) + prize).get('casino');
		} else if (winners.length === 1) {
			htmlDeclare += '&iexcl;Felicidades a ' + getUserName(winners[0]) + ' por ganar en la ruleta!<b /> Premio entregado al ganador: ' + prize + ' pd.</b>';
	 Db('money').set(toId(winners[0]), Db('money').get(toId(winners[0]), 0) + prize).get(toId(winners[0]));
		} else {
			htmlDeclare += '&iexcl;Felicidades a ';
			for (var n = 0; n < (winners.length - 1); ++n) {
	 Db('money').set(toId(winners[n]), Db('money').get(toId(winners[n]), 0) + prize).get(toId(winners[n]));
				if (n === 0) {
					htmlDeclare += getUserName(winners[n]);
				} else {
					htmlDeclare += ', ' + getUserName(winners[n]);
				}
			}

	Db('money').set(toId(winners[winners.length - 1]), Db('money').get(toId(winners[winners.length - 1]), 0) + prize).get(toId(winners[winners.length - 1]));
			htmlDeclare += ' y ' + getUserName(winners[winners.length - 1]) + ' por ganar en la ruleta!<b /> Premio entregado a los ganadores: ' + prize + ' pd.</b>';
		}
		htmlDeclare += '</center></div>';
		wheelStatus = false;
		wheelOptions = [];
		wheelBets = {};
		prize = 0;
		this.privateModCommand('(' + user.name + ' ha finalizado el juego de ruleta)');
		room.addRaw(htmlDeclare);
		room.update();
	},
	
	ruleta: 'wheel',
	wheel: function (target, room, user) {
		if (room.id !== 'casino') return this.sendReply("Este comando solo puede ser usado en la sala casino.");
		if (!wheelStatus) return this.sendReply("No hay ninguna ruleta en marcha.");
		if (!this.runBroadcast()) return;
		var optionsList = '';
		for (var j = 0; j < wheelOptions.length; j++) {
			optionsList += wheelOptions[j] + ", ";
		}
		return this.sendReplyBox("<b>Opciones de la ruleta:</b> " + optionsList + '<br /><b>Premio: </b>' + (prize) + ' pd.');
	},
	
	apostar: 'betwheel',
	betwheel: function (target, room, user) {
		if (room.id !== 'casino') return this.sendReply("Este comando solo puede ser usado en la sala casino.");
		if (!wheelStatus) return this.sendReply("No hay ninguna ruleta en marcha.");
		var pokemonId = toId(target);
		var validPkm = false;
		for (var j = 0; j < wheelOptions.length; j++) {
			if (pokemonId === toId(wheelOptions[j])) validPkm = true;
		}
		if (!validPkm) return this.sendReply(pokemonId + " no es una opción de la ruleta. Para ver las opciones escribe /ruleta");
		if (wheelBets[user.userid]) {
			wheelBets[user.userid] = pokemonId;
			return this.sendReply("Has cambiado tu apuesta a " + pokemonId);
		} else {
 		if (Db('money').get(toId(user.name), 0) < 10) return this.sendReply("No tienes suficiente dinero");
			wheelBets[user.userid] = pokemonId;
			Db('money').set(toId(user.name), Db('money').get(toId(user.name), 0) - 10).get(toId(user.name));
			prize += 20;
			return this.sendReply("Has apostado por " + pokemonId + ". Puedes cambiar tu apuesta tantas veces como quieras (sin coste) hasta que termine el juego de ruleta.");
		}
	},
	
	beneficios: 'casinomoney',
	casinomoney: function (target, room, user) {
		if (room.id !== 'casino') return this.sendReply("Este comando solo puede ser usado en la sala casino.");
		if (!this.canBroadcast()) return;
		var money = Db('money').get(toId('casino'), 0);
		if (money < 1) return this.sendReply("No había beneficios en el casino.");
		return this.sendReply("Beneficios del Casino: " + money + ' Pds');
	},
	
	darfondos: 'addcasinomoney',
	addcasinomoney: function (target, room, user) {
		if (room.id !== 'casino') return this.sendReply("Este comando solo puede ser usado en la sala casino.");
		if (!casinoOwners[user.userid] && !this.can('givemoney')) return false;
		var money = Db('money').get(toId(user.name), 0)
		var targetMoney = parseInt(target);
		if (!targetMoney || targetMoney < 1) return this.sendReply("La cantidad especificada no es válida.");
		if (money < targetMoney) return this.sendReply("No tenías suficiente dinero.");
	Db('money').set(toId('casino'), Db('money').get(toId('casino'), 0) + targetMoney).get(toId('casino'));
	Db('money').set(toId(user.name), Db('money').get(toId(user.name), 0) - targetMoney).get(toId(user.name));this.privateModCommand('(' + user.name + ' ha aportado fondos al casino: ' + targetMoney + ' Pds)');
	},
	slot: 'tragaperras',
	slotmachine: 'tragaperras',
	tragaperras: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (room.id !== 'casino') return this.sendReply("Este comando solo puede ser usado en la sala casino.");
		var money = parseInt(target);
		var now = Date.now();
		if (!money || money < 1 || money > 50) return this.sendReply("Solo se puede apostar de 1 a 50 pd");
		if (!user.lastSlotCmd) user.lastSlotCmd = 0;
		if ((now - user.lastSlotCmd) * 0.001 < 2) return this.sendReply("Por favor espera " + Math.floor(2 - (now - user.lastSlotCmd) * 0.001) + " segundos antes de volver a usar la tragaperras.");
		user.lastSlotCmd = now;
		if (Db('money').get(toId(user.name), 0) < money) return this.sendReply("No tienes suficiente dinero");
		Db('money').set(toId(user.name), Db('money').get(toId(user.name), 0) - money).get(toId(user.name));
		var slotSymbols = ["\u2605", "\u2665", "@", "%", "$", "&", "#", "+", "~"];
		var symbolA = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
		var symbolB = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
		var symbolC = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
		if (symbolA === symbolB && symbolB === symbolC && symbolA === '\u2605') {
		Db('money').set(toId(user.name), Db('money').get(toId(user.name), 0) + money * 5).get(toId(user.name));
			return this.sendReply("|html| <b>" + symbolA + symbolB + symbolC + "</b> - Felicidades! Tu apuesta se multiplica por 5!");
		} else if (symbolA === symbolB && symbolB === symbolC) {
		Db('money').set(toId(user.name), Db('money').get(toId(user.name), 0) + money * 4).get(toId(user.name));
			return this.sendReply("|html| <b>" + symbolA + symbolB + symbolC + "</b> - Felicidades! Tu apuesta se multiplica por 4!");
		} else if ((symbolA === symbolB && symbolA === '\u2605') || (symbolA === symbolC && symbolA === '\u2605') || (symbolB === symbolC && symbolB === '\u2605')) {
		Db('money').set(toId(user.name), Db('money').get(toId(user.name), 0) + money * 3).get(toId(user.name));
			return this.sendReply("|html| <b>" + symbolA + symbolB + symbolC + "</b> - Felicidades! Tu apuesta se multiplica por 3!");
		} else if ((symbolA === symbolB || symbolA === symbolC || symbolB === symbolC) && (symbolA === '\u2605' || symbolB === '\u2605' || symbolC === '\u2605')) {
		Db('money').set(toId(user.name), Db('money').get(toId(user.name), 0) + money * 3).get(toId(user.name));
			return this.sendReply("|html| <b>" + symbolA + symbolB + symbolC + "</b> - Felicidades! Tu apuesta se multiplica por 3!");
		} else if (symbolA === symbolB || symbolB === symbolC || symbolA === symbolC) {
		Db('money').set(toId(user.name), Db('money').get(toId(user.name), 0) + money * 2).get(toId(user.name));
			return this.sendReply("|html| <b>" + symbolA + symbolB + symbolC + "</b> - Felicidades! Tu apuesta se multiplica por 2!");
		} else if (symbolA === '\u2605' || symbolB === '\u2605' || symbolC === '\u2605') {
		Db('money').set(toId(user.name), Db('money').get(toId(user.name), 0) + money).get(toId(user.name));
			return this.sendReply("|html| <b>" + symbolA + symbolB + symbolC + "</b> - Recuperas lo apostado!");
		} else {
		Db('money').set(toId('casino'), Db('money').get(toId('casino'), 0) + money).get(toId('casino'));
			return this.sendReply("|html| <b>" + symbolA + symbolB + symbolC + "</b> - Has perdido! Intentalo de nuevo.");
		}
	},
	
	casino: function (target, room, user) {
		if (room.id !== 'casino' && Rooms.rooms['casino'] && !Rooms.rooms['casino'].users[user.userid]) {
			user.joinRoom('casino');
			return;
		}
		var casinoInfo = 'Bienvenido al Casino: En esta sala puedes apostar tus PokeDolares en diversos juegos de azar y ganar dinero fácil si tienes suerte. Los actuales juegos de azar son los siguientes:<br>-Tragaperras: Usa /slot [1-50] | Puedes perder los Pd o que tu apuesta de multiplique hasta x5. <br> -Ruleta: El staff del casino debe iniciarla con /nuevaruleta y hacerla girar con /finruleta. Nota: el premio inicial viene de los fondos del casino alimentados de las tragaperras y de las ruletas sin ganador. Para los usuarios se apuesta por un Pokemon con /apostar [pokemon] y para ver las opciones /ruleta <br> -Bingo: Se inicia con /nuevobingo y se participa con /buytable. Se van diciendo números aleatorios y quien antes tenga una tablilla con todos sus números dichos gana. <br><br>';
		var owners = Object.keys(casinoOwners);
		if (!owners || owners.length < 1) {
			casinoInfo += 'No hay dueños del ' + SALA_GAMES + ' aún.';
		} else if (owners.length === 1) {
			casinoInfo += 'Actual dueño del ' + SALA_GAMES + ' (con acceso a los fondos): ' + EM.nameColor(getUserName(owners[0]));
		} else {
			casinoInfo += 'Actuales dueños del ' + SALA_GAMES  + ' (con acceso a los fondos): ' + EM.nameColor(getUserName(owners[0]));
			for (var n = 1; n < (owners.length - 1); ++n) {
				casinoInfo += ', ' + EM.nameColor(getUserName(owners[n]));
			}
			casinoInfo += ' y ' + EM.nameColor(getUserName(owners[owners.length - 1]));
		}
		user.popup('|html|' + casinoInfo);
	},
	
	casinoowner: function (target, room, user) {
		if (room.id !== 'casino') return this.sendReply("Este comando solo puede ser usado en la sala casino.");
		if (!this.can('hotpatch')) return;
		if (!target) return this.sendReply("No has especificado ningún usuario.");
		var targetUser = Users.get(target);
		if (!targetUser) return this.sendReply("El usuario no existe o no está disponible.");
		casinoOwners[targetUser.userid] = 1;
		this.addModCommand(targetUser.name + " ha sido nombrado dueño del " + SALA_GAMES + " por " + user.name + '.');
		writeCasinoData();
	},
	
	casinodeowner: function (target, room, user) {
		if (room.id !== 'casino') return this.sendReply("Este comando solo puede ser usado en la sala casino.");
		if (!this.can('hotpatch')) return;
		if (!target) return this.sendReply("No has especificado ningún usuario.");
		var targetUser = Users.get(target);
		var userName;
		if (!targetUser) {
			userName = toId(target);
		} else {
			userName = targetUser.name;
		}
		if (!casinoOwners[toId(target)]) return this.sendReply("El usuario especificado no era dueño del "+  SALA_GAMES + ".");
		delete casinoOwners[toId(target)];
		this.privateModCommand("(" + userName + " ha sido degradado del puesto de dueño del" +  SALA_GAMES + ' por ' + user.name + '.)');
		if (targetUser && targetUser.connected) targetUser.popup(user.name + " te ha degradado del puesto de dueño del" +  SALA_GAMES +  ".");
		writeCasinoData();
	},
};
