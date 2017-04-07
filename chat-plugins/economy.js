'use strict';

let fs = require('fs');
let path = require('path');

let shop = [
	['Simbolo', 'Buys a custom symbol to go infront of name and puts you at top of userlist. (Temporary until restart, certain symbols are blocked)', 1000],
	['custom color', 'Buys an custom avatar to be applied to your name (You supply. Images larger than 80x80 may not show correctly)',1200 ],
	['mover avatar', 'Buys an custom avatar to be applied to your name (You supply. Images larger than 80x80 may not show correctly)',1500 ],
	['custom avatar', 'Buys a trainer card which shows information through a command. (You supply, can be refused)', 1000],
	['trainercard', 'Buys a trainer card which shows information through a command. (You supply, can be refused)', 1000],
	['emoticon', 'Buys a trainer card which shows information through a command. (You supply, can be refused)', 300],
	['Frase de Entrada', 'Buys a trainer card which shows information through a command. (You supply, can be refused)', 1200],
	['Arreglo', 'Staff member will help set up roomintros and anything else needed in a room. Response may not be immediate.', 500],
	['Icon', 'Buy a custom icon that can be applied to the rooms you want. You must take into account that the provided image should be 32 x 32', 1000],
	['Sala', 'Buys a chatroom for you to own. (within reason, can be refused)', 4000],
];

let shopDisplay = getShopDisplay(shop);

/**
 * Gets an amount and returns the amount with the name of the currency.
 *
 * @examples
 * currencyName(0); // 0 bucks
 * currencyName(1); // 1 buck
 * currencyName(5); // 5 bucks
 *
 * @param {Number} amount
 * @returns {String}
 */
function currencyName(amount) {
	let name = " PD";
	return amount === 1 ? name : name + "s";
}

/**
 * Checks if the money input is actually money.
 *
 * @param {String} money
 * @return {String|Number}
 */
function isMoney(money) {
	let numMoney = Number(money);
	if (isNaN(money)) return "Must be a number.";
	if (String(money).includes('.')) return "Cannot contain a decimal.";
	if (numMoney < 1) return "Cannot be less than one buck.";
	return numMoney;
}

/**
 * Log money to logs/money.txt file.
 *
 * @param {String} message
 */
function logMoney(message) {
	if (!message) return;
	let file = path.join(LOGS_DIR + 'money.txt');
	let date = "[" + new Date().toUTCString() + "] ";
	let msg = message + "\n";
	fs.appendFile(file, date + msg);
}
function logShop(message) {
	if (!message) return;
	let file = path.join(LOGS_DIR + 'shop.txt');
	let date = "[" + new Date().toUTCString() + "] ";
	let msg = message + "\n";
	fs.appendFile(file, date + msg);
}

/**
 * Displays the shop
 *
 * @param {Array} shop
 * @return {String} display
 */
function getShopDisplay(shop) {
	let display = "<table border='1' cellspacing='0' cellpadding='5' width='100%'>" +
					"<tbody><tr><th>Command</th><th>Description</th><th>Cost</th></tr>";
	let start = 0;
	while (start < shop.length) {
		display += "<tr>" +
						"<td align='center'><button name='send' value='/buy " + shop[start][0] + "'><b>" + shop[start][0] + "</b></button>" + "</td>" +
						"<td align='center'>" + shop[start][1] + "</td>" +
						"<td align='center'>" + shop[start][2] + "</td>" +
					"</tr>";
		start++;
	}
	display += "</tbody></table><center>To buy an item from the shop, use /buy <em>command</em>.</center>";
	return display;
}


/**
 * Find the item in the shop.
 *
 * @param {String} item
 * @param {Number} money
 * @return {Object}
 */
function findItem(item, money) {
	let len = shop.length;
	let price = 0;
	let amount = 0;
	while (len--) {
		if (item.toLowerCase() !== shop[len][0].toLowerCase()) continue;
		price = shop[len][2];
		if (price > money) {
			amount = price - money;
			this.errorReply("No se tiene suficiente dinero para esto. Necesitas " + amount + currencyName(amount) + " más para comprar " + item + ".");
			return false;
		}
		return price;
	}
	this.errorReply(item + " No disponible.");
}

/**
 * Handling the bought item from the shop.
 *
 * @param {String} item
 * @param {Object} user
 * @param {Number} cost - for lottery
 */
function handleBoughtItem(item, user, cost) {
	if (item === 'simbolo') {
		user.canCustomSymbol = true;
		this.sendReply("Usted ha adquirido un símbolo personalizado. Por favor contactar a un admin para user tu simbolo.");
		this.sendReply("Tendrá esto hasta que cierre la sesión durante más de una hora.");
		this.sendReply("Si no desea que su símbolo personalizado más, puede usar /resetsymbol para volver a su antiguo símbolo.");
	} else if (item === 'declare') {
        user.canShopDeclare = true;
        this.sendReply('Usted a comprdo un declare. Usted lo pude usar con /shopdeclare.');
       } else {
		let mensaje = '<strong class="username"><font color="' + EM.Color(user.name) + '">' + user.name + '</font></strong> compro ' + item;
    	Rooms('staff').add('|raw|<b><font color="' + EM.Color('~Shopalert:') + '">' + '~Shopalert:' + '</font></b>' +  mensaje).update();
	}
}

exports.commands = {
hide: 'hideauth',
	hideauth: function (target, room, user) {
		if (!user.can('lock')) return this.errorReply("/hideauth - access denied.");
		let tar = Config.groupsranking[0];
		if (target) {
			target = target.trim();
			if (Config.groupsranking.indexOf(target) > -1 && target !== '}') {
				if (Config.groupsranking.indexOf(target) <= Config.groupsranking.indexOf(user.group)) {
					tar = target;
				} else {
					this.sendReply('The group symbol you have tried to use is of a higher authority than you have access to or is otherwise not allowed to be hidden as. Defaulting to \' \' instead.');
				}
			} else {
				this.sendReply(`You have tried to use an invalid character as your auth symbol. Defaulting to '${tar}' instead.`);
			}
		}
		user.getIdentity = function (roomid) {
			if (this.locked) {
				return '‽' + this.name;
			}
			if (roomid) {
				let room = Rooms(roomid);
				if (room.isMuted(this)) {
					return '!' + this.name;
				}
				if (room && room.auth) {
					if (room.auth[this.userid]) {
						return room.auth[this.userid] + this.name;
					}
					if (room.isPrivate === true) return ' ' + this.name;
				}
			}
			return tar + this.name;
		};
		user.updateIdentity();
		this.sendReply('You are now hiding your auth symbol as \'' + tar + '\'.');
		user.isHiding = true;
	},
	show: 'showauth',
	showauth: function (target, room, user) {
		if (!user.can('lock')) return this.errorReply("/showauth - access denied.");
		delete user.getIdentity;
		user.updateIdentity();
		user.isHiding = false;
		this.sendReply("You have now revealed your auth symbol.");
	},
	customsymbol: function (target, room, user) {
		if (!user.canCustomSymbol && user.id !== user.userid) return this.errorReply("You need to buy this item from the shop.");
		if (!target || target.length > 1) return this.parse('/help customsymbol');
		if (target.match(/[A-Za-z\d]+/g) || '|?!+$%@*\u2605&~#\u03c4\u00a3\u03dd\u03b2\u039e\u03a9\u0398\u03a3\u00a9'.indexOf(target) >= 0) {
			return this.errorReply("Sorry, but you cannot change your symbol to this for safety/stability reasons.");
		}
		user.customSymbol = target;
		user.getIdentity = function (roomid) {
			return target + this.name;
		};
		user.updateIdentity();
		user.canCustomSymbol = false;
		user.hasCustomSymbol = true;
	},
	customsymbolhelp: ["/customsymbol [symbol] - Get a custom symbol."],

	resetcustomsymbol: 'resetsymbol',
	resetsymbol: function (target, room, user) {
		if (!user.hasCustomSymbol) return this.errorReply("You don't have a custom symbol.");
		user.customSymbol = null;
		user.getIdentity = function (roomid) {
			return this.group + this.name;
		};
		user.updateIdentity();
		user.hasCustomSymbol = false;
		this.sendReply("Your symbol has been reset.");
	},
	resetsymbolhelp: ["/resetsymbol - Resets your custom symbol."],
				
	pd: 'wallet',
	purse: 'wallet',
	wallet: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) target = user.name;
		let targetUser = Users.get(target);
		let userid = (targetUser ? targetUser.userid : toId(target));
		let userSymbol = (Users.usergroups[userid] ? Users.usergroups[userid].substr(0, 1) : "");
		const amount = Db('money').get(toId(target), 0);
		this.sendReply("|raw|<font color=#948A88>" + userSymbol +  "</font><b><font color=\"" + EM.Color(Chat.escapeHTML(target)) + '">'+ target + "</b></font> tiene " + amount + currencyName(amount) + ".");
	},
	wallethelp: ["/pd [usuario] - Ver la cantidad de dinero que tenga un user"],

	givebuck: 'givemoney',
	givebucks: 'givemoney',
	givemoney: function (target, room, user) {
		if (!this.can('forcewin')) return false;
		if (!target || target.indexOf(',') < 0) return this.parse('/help givemoney');

		let parts = target.split(',');
		let username = parts[0];
		let amount = isMoney(parts[1]);

		if (typeof amount === 'string') return this.errorReply(amount);

		let total = Db('money').set(toId(username), Db('money').get(toId(username), 0) + amount).get(toId(username));
		amount = amount + currencyName(amount);
		total = total + currencyName(total);
		this.sendReply(username + "  ha recibido " + amount + ". " + username + " ahora tiene " + total + ".");
		if (Users.get(username)) Users(username).popup(user.name + " te ha dado " + amount + ". Ahora tienes " + total + ".");
		logMoney(username + " te ha dado " + amount + " por " + user.name + ". " + username + " ahora tienes " + total);
	},
	givemoneyhelp: ["/givemoney [usuario], [cantidad] - Dar a un usuario una cierta cantidad de dinero."],

		takebuck: 'takemoney',
	takebucks: 'takemoney',
	takemoney: function (target, room, user) {
		if (!this.can('forcewin')) return false;
		if (!target || target.indexOf(',') < 0) return this.parse('/help takemoney');

		let parts = target.split(',');
		let username = parts[0];
		let amount = isMoney(parts[1]);

		if (typeof amount === 'string') return this.errorReply(amount);

		let total = Db('money').set(toId(username), Db('money').get(toId(username), 0) - amount).get(toId(username));
		amount = amount + currencyName(amount);
		total = total + currencyName(total);
		this.sendReply(username + " perdió " + amount + ". " + username + " ahora tiene " + total + ".");
		if (Users.get(username)) Users(username).popup(user.name + " Ha retirado " + amount + " de ti. Tu ahora tienes " + total + ".");
		logMoney(username + " perdio " + amount + "  por " + user.name + ". " + username + " ahora tiene " + total);
	},
	takemoneyhelp: ["/takemoney [usuario], [cantidad] - Quita una cierta cantidad de dinero a un usuario ."],

	resetbuck: 'resetmoney',
	resetbucks: 'resetmoney',
	resetmoney: function (target, room, user) {
		if (!this.can('forcewin')) return false;
		Db('money').set(toId(target), 0);
		this.sendReply(target + " ahora tiene 0 PD");
		logMoney(user.name + " restablecer el dinero de " + target + ".");
	},
	resetmoneyhelp: ["/resetmoney [usuario] - Reinicia el dinero de un usuario ."],
	
	donar: 'transfermoney',
	transfer: 'transfermoney',
	transferbuck: 'transfermoney',
	transferbucks: 'transfermoney',
	transfermoney: function (target, room, user) {
		if (!target || target.indexOf(',') < 0) return this.parse('/help transfermoney');

		let parts = target.split(',');
		let username = parts[0];
		let uid = toId(username);
		let amount = isMoney(parts[1]);

		if (toId(username) === user.userid) return this.errorReply("No puedes transferirte dinero a ti mismo .");
		if (username.length > 19) return this.errorReply("El nombre del usuario no puede ser más largo que 19 caracteres .");
		if (typeof amount === 'string') return this.errorReply(amount);
		if (amount > Db('money').get(user.userid, 0)) return this.errorReply("No puedes transferir más dinero del que tienes.");

		Db('money')
			.set(user.userid, Db('money').get(user.userid) - amount)
			.set(uid, Db('money').get(uid, 0) + amount);

		let userTotal = Db('money').get(user.userid) + currencyName(Db('money').get(user.userid));
		let targetTotal = Db('money').get(uid) + currencyName(Db('money').get(uid));
		amount = amount + currencyName(amount);

		this.sendReply("Usted ha transferido con éxito " + amount + ". Usted ahora tiene " + userTotal + ".");
		if (Users.get(username)) Users(username).popup(user.name + " has transferred " + amount + ". You now have " + targetTotal + ".");
		logMoney(user.name + " transferred " + amount + " to " + username + ". " + user.name + " now has " + userTotal + " and " + username + " now has " + targetTotal + ".");
	},
	transfermoneyhelp: ["/transfer [usuario], [cantidad] - Transfiere una cantidad de dinero a otro usuario."],
	shop: function(target, room, user) {
		if (!this.runBroadcast()) return;
		if (room.id === '' && this.broadcasting) {
			return true;
		} else {
			var buttonStyle = 'border-radius:5px; border: 2px inset black; background: #E6FF33; color:black; padding: 3px';
			var topStyle = 'background: url(http://i.imgur.com/FD2q9yD.jpg) ; border: 1px solid black; padding: 2px; border-radius: 5px;';
			var descStyle = 'border-radius: 5px; border: 1px solid black ; background: #33A9FF; color: #000; border-collapse: collapse;';
			var top = '<td><center><table style="' + topStyle + '" border="5" cellspacing ="5" cellpadding="5"><tr><th>Objeto</th><th>Descripcion del objeto</th><th>Precio</th></tr>';
			var bottom = '<table><td style="' + descStyle + '">Para comprar un item de la tienda  use /buy comando. <b>NO</b> nos hacemos responsables por objetos comprados erroneamente.</td>';
			function table(item, desc, price) {
				return '<tr><center><td style="' + descStyle + '"><center><button title="Da click para comprar un ' + item + ' de la tienda" style="' + buttonStyle + '" name="send" value="/checkbuy ' + item + '">' + item + '</button><center></td><td style="' + descStyle + '">' + desc + '</center></td><td style="' + descStyle + '">' + price + '</td></tr>';
			}
			return this.sendReply('|raw|<table><th style="background: #33A9FF;border: 1px solid #222222; border-bottom-width: 10px; color: #222222; padding: 10px; font-size: 13pt;"><center>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tienda de Lightning&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</center></th></table>' +
			'<div style="max-height: 310px; overflow-y: scroll;">' +
				top +
				table("Simbolo","Compra el acceso al comado /customsymbol que permite elegir un símbolo (excepto staff) para aparecer en lo alto de la lista de usuarios.",1000) +
				table("Arreglo", "Compra el derecho de cambiar algo que anteriormente ya compraste (customcolor, customavatar, etc)", 500) +
				table("Mover Avatar", "Cambia tu avatar personalizado a otro de tus alts.", 1000) +
				table("Tarjeta de Entrenador", "Compra una tarjeta de entrenador, requiere el html de tu tarjeta.", 1000) +      
				table("Icon", "Compra un icono personalizado. De medida (32x32) y acorde a las reglas del servidor. Contactar con un Admin para obtener este artículo.	", 1000) +
				table("Custom Avatar", "Compra un avatar personalizado. Preferiblemente debe ser una imagen de pequeñas dimensiones y acorde a las reglas del servidor. Debe de ser de medida 80x80 Contactar con un Admin para obtener este artículo.	", 1500) +
				table("Custom Color", "Compra un cambio de color para tu nick", 1200) +
				table("Emoticon", "Compra un emoticon nuevo para el server", 300) +
				table("Frase de Entrada", "Compra una frase para cuando entras al server", 1200) +
				table("Sala", "Compra una Sala de chat. Será pública o privada en función del motivo de su compra. Si se detecta spam de comandos / saturación del modlog será borrada. (Una por persona)", 4000) +
				'</div>' +
				bottom

			);
		}
	},

	checkbuy: function (target, room, user, connection) {
	connection.popup(
	'|html|' +
	'<center>Esta usted seguro que desea comprar ' + target + '</center><br>' +
	'<center><button title="Da click para comprar un ' + target + ' de la tienda" style="border-radius: 5px ; border: 2px inset black ; background: #fff0f5 ; color: black ; padding: 3px" name="send" value="/buy ' + target + '">Sí</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button style="border-radius: 5px ; border: 2px inset black ; background: #fff0f5 ; color: black ; padding: 3px" name="close" class="autofocus"><strong>No</strong></button></center>' + 
	'<br><small>Nota: Solo darle click una sola vez a el boton que elijas</small>'
	);	
	},
	buy: function (target, room, user) {
		if (!target) return this.parse('/help buy');
		let amount = Db('money').get(user.userid, 0);
		let cost = findItem.call(this, target, amount);
		if (!cost) return;
		let total = Db('money').set(user.userid, amount - cost).get(user.userid);
		this.sendReply("You have bought " + target + " for " + cost + currencyName(cost) + ". ahora tienes " + total + currencyName(total) + " left.");
		room.addRaw(user.name + " ha comprado <b>" + target + "</b> de la tienda");
		logShop(user.name + " ha comprado " + target + " de la tienda. Este usuario ahora tiene " + total + currencyName(total) + ".");
		handleBoughtItem.call(this, target.toLowerCase(), user, cost);
	},
	buyhelp: ["/buy [Item] - Compra un item de la tienda."],
	'!shoplog':true,
	shoplog: function (target, room, user, connection) {
		if (!this.can('modlog')) return;
		target = toId(target);
		let numLines = 15;
		let matching = true;
		if (target.match(/\d/g) && !isNaN(target)) {
			numLines = Number(target);
			matching = false;
		}
		let topMsg = "Displaying the last " + numLines + " lines of transactions:\n";
		let file = path.join(LOGS_DIR + 'shop.txt');
		fs.exists(file, function (exists) {
			if (!exists) return connection.popup("No transactions.");
			fs.readFile(file, 'utf8', function (err, data) {
				data = data.split('\n');
				if (target && matching) {
					data = data.filter(function (line) {
						return line.toLowerCase().indexOf(target.toLowerCase()) >= 0;
					});
				}
				connection.popup('|wide|' + topMsg + data.slice(-(numLines + 1)).join('\n'));
			});
		});
	},
	'!moneylog':true,
	moneylog: function (target, room, user, connection) {
		if (!this.can('modlog')) return;
		target = toId(target);
		let numLines = 15;
		let matching = true;
		if (target.match(/\d/g) && !isNaN(target)) {
			numLines = Number(target);
			matching = false;
		}
		let topMsg = "Displaying the last " + numLines + " lines of transactions:\n";
		let file = path.join(LOGS_DIR + 'money.txt');
		fs.exists(file, function (exists) {
			if (!exists) return connection.popup("No transactions.");
			fs.readFile(file, 'utf8', function (err, data) {
				data = data.split('\n');
				if (target && matching) {
					data = data.filter(function (line) {
						return line.toLowerCase().indexOf(target.toLowerCase()) >= 0;
					});
				}
				connection.popup('|wide|' + topMsg + data.slice(-(numLines + 1)).join('\n'));
			});
		});
	},
	moneyladder: 'richestuser',
	richladder: 'richestuser',
	richestusers: 'richestuser',
	richestuser: function (target, room, user) {
		if (!this.runBroadcast()) return;
		let display = '<center><u><b>Usuarios con mas dinero</b></u></center><br><table border="1" cellspacing="0" cellpadding="5" width="100%"><tbody><tr><th>Top</th><th>Usuario</th><th>Dinero</th></tr>';
		let keys = Object.keys(Db('money').object()).map(function (name) {
			return {name: name, money: Db('money').get(name)};
		});
		if (!keys.length) return this.sendReplyBox("Money ladder is empty.");
		keys.sort(function (a, b) {
			return b.money - a.money;
		});
		keys.slice(0, 10).forEach(function (user, index) {
			display += "<tr><td>" + (index + 1) + "</td><td><b><font color=\"" + EM.Color(user.name) +  "\">" + user.name + "</font></b></td><td>" + user.money + "</td></tr>";
		});
		display += "</tbody></table>";
		this.sendReply("|raw|" + display);
	},
};
