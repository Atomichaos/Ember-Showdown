/**
Ember Plugins
 */
EM.nameColor = function (name, bold) {
        return (bold ? "<b>" : "") + "<font color=" + EM.Color(name) + ">" + (Users(name) && Users(name).connected && Users.getExact(name) ? Chat.escapeHTML(Users.getExact(name).name) : Chat.escapeHTML(name)) + "</font>" + (bold ? "</b>" : "");
};
const path = require('path');
const fs = require('fs');
const moment = require('moment');

EM.tells = {};
try {
	EM.tells = JSON.parse(fs.readFileSync(DATA_DIR + 'tells.json', 'utf*'));
} catch (e) {}

const MAX_TELLS = 4;
const MAX_TELL_LENGTH = 500;
function isHoster(user) {
	if (!user) return;
	if (typeof user === 'Object') user = user.userid;
	let hoster = Db('hoster').get(toId(user));
	if (hoster === 1) return true;
	return false;
}
function generateNews () {
			let lobby = Rooms('lobby');
			if (!lobby) return false;
			if (!lobby.news || Object.keys(lobby.news).length < 0) return false;
			if (!lobby.news) lobby.news = {};
			let news = lobby.news, newsDisplay = [];
			Object.keys(news).forEach(announcement => {
				newsDisplay.push(`<h4>${announcement}</h4>${news[announcement].desc}<br /><br /><strong>—<font color="${EM.Color(news[announcement].by)}">${news[announcement].by}</font></strong> on ${moment(news[announcement].posted).format("MMM D, YYYY")}`);
			});
			return newsDisplay;
		}
function newsDisplay(user) {
			if (!Users(user)) return false;
			let newsDis = this.generateNews();
			if (newsDis.length === 0) return false;

			if (newsDis.length > 0) {
				newsDis = newsDis.join('<hr>');
				return Users(user).send(`|pm| News|${Users(user).getIdentity()}|/raw ${newsDis}`);
			}
}
EM.getTells = function(target, room, user, connection) {
		target = Users.get(target);
		let tell = EM.tells[target.userid];
		if (!tell) return;
		for (let i in tell) {
			tell[i].forEach(msg => target.send('|pm| Unread Messages|' + target.getIdentity() + '|/raw ' + msg));
		}
		delete EM.tells[target.userid];
		fs.writeFileSync(DATA_DIR + 'tells.json', JSON.stringify(EM.tells));
	};
const messages = [
    "has used explosion!",
    "was swallowed up by the earth!",
    "was abducted by aliens.",
    "has left the building.",
    "got lost in the woods!",
    "went to praise a Magikarp",
    "was killed by a Magikarp",
    "magically disappeared",
    "was put to sleep by a jigglypuff",
    "entered zen mode",
    "kicked his modem in error",
];
 exports.commands = {
    	news: 'serverannouncements',
	announcements: 'serverannouncements',
	serverannouncements: {
		'': 'view',
		display: 'view',
		view: function (target, room, user) {
			if (!Rooms('lobby') || !Rooms('lobby').news) return this.errorReply("Strange, there are no server announcements...");
			if (!Rooms('lobby').news && Rooms('lobby')) Rooms('lobby').news = {};
			let news = Rooms('lobby').news;
			if (Object.keys(news).length === 0) return this.sendReply("There are currently no new server announcements at this time.");
			return user.send('|popup||wide||html|' +
				"<center><strong>Ember Server News:</strong></center>" +
					generateNews().join('<hr>')
			);
		},
		delete: function (target, room, user) {
			if (!this.can('ban')) return false;
			if (!target) return this.parse('/help serverannouncements');
			if (!Rooms('lobby').news) Rooms('lobby').news = {};
			let news = Rooms('lobby').news;
			if (!news[target]) return this.errorReply("This announcement doesn't seem to exist...");
			delete news[target];
			Rooms('lobby').news = news;
			Rooms('lobby').chatRoomData.news = Rooms('lobby').news;
			Rooms.global.writeChatRoomData();
			this.privateModCommand(`(${user.name} deleted server announcement titled: ${target}.)`);
		},
		add: function (target, room, user) {
			if (!this.can('ban')) return false;
			if (!target) return this.parse('/help serverannouncements');
			target = target.split('|');
			for (let u in target) target[u] = target[u].trim();
			if (!target[1]) return this.errorReply("Usage: /news add [title]| [desc]");
			if (!Rooms('lobby').news) Rooms('lobby').news = {};
			let news = Rooms('lobby').news;
			news[target[0]] = {
				desc: target[1],
				posted: Date.now(),
				by: user.name,
			};
			Rooms('lobby').news = news;
			Rooms('lobby').chatRoomData.news = Rooms('lobby').news;
			Rooms.global.writeChatRoomData();
			this.privateModCommand(`(${user.name} added server announcement: ${target[1]})`);
		},
	},
	serverannouncementshelp: ["/announcements view - Views current server announcements.",
		"/announcements delete [announcement title] - Deletes announcement with the [title]. Requires @, &, ~",
		"/announcements add [announcement title]| [announcement desc] - Adds announcement [announcement]. Requires @, &, ~"],
		        hoster: {
        	add: function (target, room, user, userid) {
			if (!this.userid == 'deltaskiez') return this.errorReply('This command can only be used by DeltaSkiez');
			let hoster = toId(target);
			if (!hoster) return this.parse('/hoster');
			if (isHoster(hoster)) return this.errorReply(hoster + ' is already a vip.');
			Db('hoster').set(hoster, 1);
			this.sendReply(hoster + ' has been granted with vip status.');
		},
	       	remove: function (target, room, user) {
			var userid = user.userid;    	
			if (!isHoster(userid)) return false;
			let hoster = toId(target);
			if (!hoster) return this.parse('/hoster');
			if (!isHoster(hoster)) return this.errorReply(hoster + ' is not a vip.');
			Db('hoster').delete(hoster);
			this.sendReply(hoster + '\'s vip status has been taken.');
		},
			list: function (target, room, user) {
			var userid = user.userid;    	
			if (!isHoster(userid)) return false;
			if (!Object.keys(Db('hoster').object()).length) return this.errorReply('There seems to be no user with vip status.');
			user.popup('|html|<center><b><u>Super Administrators.</u></b></center>' + '<br /><br />' + Object.keys(Db('hoster').object()).join('</strong><br />'));
		},
		    '': function(target,room,user) {
		  	if (!this.can('hotpatch')) return false;
		  	this.sendReplyBox('<strong>Hoster Commands:</strong><br>' +
		  	'<li><em>&mdash; add</em> - Adds a user to the list of server hosters.</li>' +
		  	'<li><em>&mdash; remove</em> - Removes a user from the list of hosters.</li>' +
		  	'<li><em>&mdash; list</em> - Shows the list of server hosters.</li>'
		  	);
		    },
	},
	
  	d: 'poof',
	cpoof: 'poof',
	poof: function (target, room, user) {
		if (Config.poofOff) return this.sendReply("Poof is currently disabled.");
		if (target && !this.can('broadcast')) return false;
		if (room.id !== 'lobby') return false;
		var message = target || messages[Math.floor(Math.random() * messages.length)];
		if (message.indexOf('{{user}}') < 0) {
			message = '{{user}} ' + message;
		}
		message = message.replace(/{{user}}/g, user.name);
		if (!this.canTalk(message)) return false;

		var colour = '#' + [1, 1, 1].map(function () {
			var part = Math.floor(Math.random() * 0xaa);
			return (part < 0x10 ? '0' : '') + part.toString(16);
		}).join('');

		room.addRaw('<center><strong><font color="' + colour + '">~~ ' + Chat.escapeHTML(message) + ' ~~</font></strong></center>');
		user.disconnectAll();
	},

	poofoff: 'nopoof',
	nopoof: function () {
		if (!this.can('poofoff')) return false;
		Config.poofOff = true;
		return this.sendReply("Poof is now disabled.");
	},

	poofon: function () {
		if (!this.can('poofoff')) return false;
		Config.poofOff = false;
		return this.sendReply("Poof is now enabled.");
	},
	    
		credit: 'credits',
	credits: function (target, room, user) {
		this.popupReply("|html|" + "<font size=5>Ember Server Credits</font><br />" +
					"<u>Major Contributors:</u><br />" +
					"- " + EM.nameColor('DeltaSkiez', true) + " (Owner, Sysadmin, Server CSS)<br />" +
                 			"- " + EM.nameColor('HurriKaine', true) + " (Owner, Sysadmin, Lead Policy)<br />" +
					"<br />" +
					"<u>Staff Contributions:</u><br />" +
					"- " + EM.nameColor('Blooded Kitten', true) + " (Server Website Manager)<br />" +
					"- " + EM.nameColor('Fleur Fee', true) + " (Server Management)<br />" +
					"<br />" +
					"<u>Special Thanks:</u><br />" +
					"- Current staff team<br />" +
					"- Our regular users<br />");
	},
			'!tell': true,
		tell: function (target, room, user, connection, cmd) {
		if (!target) return this.parse('/help tell');
		if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
		if (Users.ShadowBan.checkBanned(user)) return;
		target = this.splitTarget(target);
		if (this.targetUsername === 'embernews') return this.errorReply("These are the server news.");
		if (this.targetUsername === 'unreadmessages') return this.errorReply("These are the servers news system.");
		let targetUser = this.targetUsername;
		let id = toId(targetUser);
		if (id === user.userid || (Users(id) && Users(id).userid === user.userid)) return this.sendReply('You can\'t send a message to yourself!');
		if (Users(id) && Users(id).connected) return this.sendReply('User ' + Users(id).name + ' is currently online. PM them instead.');
		if (!id || !target) return this.parse('/help tell');
		if (target.length > MAX_TELL_LENGTH) return this.errorReply("You may not send a tell longer than " + MAX_TELL_LENGTH + " characters.");

		if (EM.tells[id]) {
			if (!user.can('hotpatch')) {
				let names = Object.keys(user.prevNames).concat(user.userid);
				for (let i in names) {
					let name = names[i];
					if (EM.tells[id][name] && EM.tells[id][name].length >= MAX_TELLS) return this.sendReply('You may only leave ' + MAX_TELLS + ' messages for a user at a time. Please wait until ' + targetUser + ' comes online and views them before sending more.');
				}
			}
		} else {
			EM.tells[id] = {};
		}

		let tell = EM.tells[id][user.userid];
		let userSymbol = (Users.usergroups[user.userid] ? Users.usergroups[user.userid].substr(0, 1) : "");
		let msg = '<small>[' + moment().format("HH:mm:ss") + ']</small> ' + userSymbol + '<strong class="username"><span style = "color:' + EM.Color(user.userid) + '">' + user.name + ':</span></strong> ' + Chat.escapeHTML(target);
		if (tell) {
			EM.tells[id][user.userid].push(msg);
		} else {
			EM.tells[id][user.userid] = [msg];
		}

		fs.writeFileSync(DATA_DIR + 'tells.json', JSON.stringify(EM.tells));
				if (this.message.startsWith(`/tell`)) {
		user.send('|pm| ' + this.targetUsername + '|' + this.user.getIdentity() + '|/raw ' + '<small>[' + moment().format("HH:mm:ss") + ']</small>' + userSymbol + '<strong class="username"><span style = "color:' + EM.Color(user.userid) + '">' + user.name + ':</span></strong> ' + Chat.escapeHTML(target));
		
			return;
		}
	},
	tellhelp: ['/tell [user], [message] - Leaves a message for an offline user for them to see when they log on next.'],
	
	'!authlist': true,
staff: 'authlist',
	stafflist: 'authlist',
	auth: 'authlist',
	authlist: function(target, room, user, connection) {
		var ignoreUsers = ['kimpossible25'];
		fs.readFile(DATA_DIR + 'usergroups.csv', 'utf8', function(err, data) {
			var staff = {
				"admins": [],
				"leaders": [],
				"bots": [],
				"mods": [],
				"drivers": [],
				"operators": [],
				"voices": [],
			};
			var row = ('' + data).split('\n');
			for (var i = row.length; i > -1; i--) {
				if (!row[i]) continue;
				var rank = row[i].split(',')[1].replace("\r", '');
				var person = row[i].split(',')[0];
				function formatName (name) {
					if (Users.getExact(name) && Users(name).connected) {
						return '<i><b><font style="color:' + EM.Color(Users.getExact(name).name) + '">' + (Users.getExact(name).name) + '</font><b></i>';
					} else {
						return '<font style="color:' + EM.Color(name) + '">' + (name) + '</font>';
					}
				}
				var personId = toId(person);
				switch (rank) {
					case '~':
						if (~ignoreUsers.indexOf(personId)) break;
						staff['admins'].push(formatName(person));
						break;
					case '&':
						if (~ignoreUsers.indexOf(personId)) break;
						staff['leaders'].push(formatName(person));
						break;	
					case '*':
						if (~ignoreUsers.indexOf(personId)) break;
						staff['bots'].push(formatName(person));
						break;
					case '@':
						if (~ignoreUsers.indexOf(personId)) break;
						staff['mods'].push(formatName(person));
						break;
					case '%':
						if (~ignoreUsers.indexOf(personId)) break;
						staff['drivers'].push(formatName(person));
						break;
					case '$':
						if (~ignoreUsers.indexOf(personId)) break;
						staff['operators'].push(formatName(person));
						break;
					case '+':
						if (~ignoreUsers.indexOf(personId)) break;
						staff['voices'].push(formatName(person));
						break;
					default:
						continue;
				}
			}
			connection.popup('|html|' +
				'<h3><center>Ember Server Authority</center></h3>' +
				'<b><u>~Administrators' +  ' (' + staff['admins'].length + ')</u></b>:<br />' + staff['admins'].join(', ') +
				'<br /><b><u>&Leaders' +  ' (' + staff['leaders'].length + ')</u></b>:<br />' + staff['leaders'].join(', ') +
				'<br /><b><u>*Bots (' + staff['bots'].length + ')</u></b>:<br />' + staff['bots'].join(', ') +
				'<br /><b><u>@Moderators (' + staff['mods'].length + ')</u></b>:<br />' + staff['mods'].join(', ') +
				'<br /><b><u>%Drivers (' + staff['drivers'].length + ')</u></b>:<br />' + staff['drivers'].join(', ') +
				'<br /><b><u>$Operators (' + staff['operators'].length + ')</u></b>:<br />' + staff['operators'].join(', ') +
				'<br /><b><u>+Voices (' + staff['voices'].length + ')</u></b>:<br />' + staff['voices'].join(', ') +
				'<br /><br />(<b>Bold</b> / <i>italic</i> = currently online)'
			);
		});
	},
    roomfounder: function (target, room, user) {
        if (!room.chatRoomData) {
            return this.sendReply("/roomfounder - This room isn\'t designed for per-room moderation to be added.");
        }
        target = this.splitTarget(target, true);
        var targetUser = this.targetUser;
        if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' is not online.");
        if (!this.can('declare')) return false;
        if (!room.auth) room.auth = room.chatRoomData.auth = {};
        if (!room.leagueauth) room.leagueauth = room.chatRoomData.leagueauth = {};
        var name = targetUser.name;
        room.auth[targetUser.userid] = '#';
        room.founder = targetUser.userid;
        this.addModCommand(name + ' was appointed to Room Founder by ' + user.name + '.');
        room.onUpdateIdentity(targetUser);
        room.chatRoomData.founder = room.founder;
        Rooms.global.writeChatRoomData();
    },

    roomdefounder: 'deroomfounder',
    deroomfounder: function (target, room, user) {
        if (!room.auth) {
            return this.sendReply("/roomdeowner - This room isn't designed for per-room moderation");
        }
        target = this.splitTarget(target, true);
        var targetUser = this.targetUser;
        var name = this.targetUsername;
        var userid = toId(name);
        if (!userid || userid === '') return this.sendReply("User '" + name + "' does not exist.");

        if (room.auth[userid] !== '#') return this.sendReply("User '" + name + "' is not a room founder.");
        if (!this.can('declare', null, room)) return false;

        delete room.auth[userid];
        delete room.founder;
        this.sendReply("(" + name + " is no longer Room Founder.)");
        if (targetUser) targetUser.updateIdentity();
        if (room.chatRoomData) {
            Rooms.global.writeChatRoomData();
        }
    },
	roomleader: function (target, room, user) {
		if (!room.chatRoomData) {
			return this.sendReply("/roomowner - This room isn't designed for per-room moderation to be added");
		}
		target = this.splitTarget(target, true);
		var targetUser = this.targetUser;

		if (!targetUser) return this.sendReply("User '" + this.targetUsername + "' is not online.");

		if (!room.founder) return this.sendReply('The room needs a room founder before it can have a room owner.');
		if (room.founder !== user.userid && !this.can('declare')) return this.sendReply('/roomowner - Access denied.');

		if (!room.auth) room.auth = room.chatRoomData.auth = {};

		var name = targetUser.name;

		room.auth[targetUser.userid] = '&';
		this.addModCommand("" + name + " was appointed Room Leader by " + user.name + ".");
		room.onUpdateIdentity(targetUser);
		Rooms.global.writeChatRoomData();
	},
	roomdeleader: 'deroomowner',
	deroomleader: function (target, room, user) {
		if (!room.auth) {
			return this.sendReply("/roomdeowner - This room isn't designed for per-room moderation");
		}
		target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		var name = this.targetUsername;
		var userid = toId(name);
		if (!userid || userid === '') return this.sendReply("User '" + name + "' does not exist.");

		if (room.auth[userid] !== '&') return this.sendReply("User '"+name+"' is not a room leader.");
		if (!room.founder || user.userid !== room.founder && !this.can('declare', null, room)) return false;

		delete room.auth[userid];
		this.sendReply("(" + name + " is no longer Room Leader.)");
		if (targetUser) targetUser.updateIdentity();
		if (room.chatRoomData) {
			Rooms.global.writeChatRoomData();
		}
	},
	'!errorlog': true,
	errorlog: function (target, room, user, connection) {
		if (!this.can('hotpatch')) return;
		target = toId(target);
		let numLines = 1000;
		let matching = true;
		if (target.match(/\d/g) && !isNaN(target)) {
			numLines = Number(target);
			matching = false;
		}
		let topMsg = "Displaying the last " + numLines + " lines of transactions:\n";
		let file = path.join(LOGS_DIR + 'errors.txt');
		fs.exists(file, function (exists) {
			if (!exists) return connection.popup("There are no errors.");
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
	image: 'showimage',
	showimage: function (target, room, user) {
		if (!target) return this.errorReply('Usa: /image link, size');
		if (!this.can('mute', room)) return false;

		let targets = target.split(',');
		if (targets.length !== 2) {
			room.add('|raw|<center><img src="' + Chat.escapeHTML(targets[0]) + '" alt="" width="50%"/><br /><small><em>(Image showed by: <b><font color="' + EM.Color(user.name) + '">' + user.name +  '</font></em></b>)</small>');
		} else {
			room.add('|raw|<center><img src="' + Chat.escapeHTML(targets[0]) + '" alt="" width="' + toId(targets[1]) + '%"/><br /><small><em>(Image showed by: <b><font color="' + EM.Color(user.name) + '">' + user.name +  '</font></em></b>)</small>');
		}
	},
	
		cssedit: function (target, room, user, connection) {
		if (!user.hasConsoleAccess(connection)) {return this.sendReply("/cssedit - Access denied.");}
		var fsscript = require('fs');
		if (!target) {
			if (!fsscript.existsSync(DATA_DIR + "custom.css")) return this.sendReply("custom.css does not exist.");
			return this.sendReplyBox(fsscript.readFileSync(DATA_DIR + "custom.css").toString());
		}
		fsscript.writeFileSync(DATA_DIR + "custom.css", target.toString());
		this.sendReply("custom.css successfully edited.");
	},
	
	destroymodlog: function (target, room, user, connection) {
		if (!user.hasConsoleAccess(connection)) {return this.sendReply("/destroymodlog - Access denied.");}
		let logPath = LOGS_DIR + 'modlog/';
		if (Chat.modlog && Chat.modlog[room.id]) {
			Chat.modlog[room.id].close();
			delete Chat.modlog[room.id];
		}
		try {
			fs.unlinkSync(logPath + "modlog_" + room.id + ".txt");
			this.addModCommand(user.name + " has destroyed the modlog for this room." + (target ? ('(' + target + ')') : ''));
		} catch (e) {
			this.sendReply("The modlog for this room cannot be destroyed.");
		}
	},

	clearall: function (target, room, user, connection) {
		if (!this.can('clearall')) return;
		var len = room.log.length,
			users = [];
		while (len--) {
			room.log[len] = '';
		}
		for (var user in room.users) {
			users.push(user);
			Users.get(user).leaveRoom(room, Users.get(user).connections[0]);
		}
		len = users.length;
		setTimeout(function() {
			while (len--) {
				Users.get(users[len]).joinRoom(room, Users.get(users[len]).connections[0]);
			}
		}, 1000);
	},
	rk: 'kick',
	roomkick: 'kick',
	kick: function (target, room, user) {
		if (!target) return;
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.sendReply("User " + this.targetUsername + " not found.");
		}
		if (!room.users[targetUser.userid]) {
			return this.sendReply("User " + this.targetUsername + " is not in the room " + room.id + ".");
		}
		if (!this.can('kick', targetUser, room)) return false;
		var msg = "kicked from room " + room.id + " by " + user.name + (target ? " (" + target + ")" : "") + ".";
		this.addModCommand("" + targetUser.name + " was " + msg);
		targetUser.popup("You have been " + msg);
		targetUser.leaveRoom(room);
	},
	roomlist: function (target, room, user) {
		let header = ['<b><font color="#1aff1a" size="2">Total users connected: ' + Rooms.global.userCount + '</font></b><br />'],
			official = ['<b><font color="#ff9900" size="2"><u>Official Rooms:</u></font></b><br />'],
			nonOfficial = ['<hr><b><u><font color="#005ce6" size="2">Public Rooms:</font></u></b><br />'],
			privateRoom = ['<hr><b><u><font color="#ff0066" size="2">Private Rooms:</font></u></b><br />'],
			groupChats = ['<hr><b><u><font color="#00b386" size="2">Group Chats:</font></u></b><br />'],
			battleRooms = ['<hr><b><u><font color="#cc0000" size="2">Battle Rooms:</font></u></b><br />'];

		let rooms = [];

		Rooms.rooms.forEach(curRoom => {
			if (curRoom.id !== 'global') rooms.push(curRoom.id);
		});

		rooms.sort();

		for (let u in rooms) {
			let curRoom = Rooms(rooms[u]);
			if (curRoom.type === 'battle') {
				battleRooms.push('<a href="/' + curRoom.id + '" class="ilink">' + Chat.escapeHTML(curRoom.title) + '</a> (' + curRoom.userCount + ')');
			}
			if (curRoom.type === 'chat') {
				if (curRoom.isPersonal) {
					groupChats.push('<a href="/' + curRoom.id + '" class="ilink">' + curRoom.id + '</a> (' + curRoom.userCount + ')');
					continue;
				}
				if (curRoom.isOfficial) {
					official.push('<a href="/' + toId(curRoom.title) + '" class="ilink">' + Chat.escapeHTML(curRoom.title) + '</a> (' + curRoom.userCount + ')');
					continue;
				}
				if (curRoom.isPrivate) {
					privateRoom.push('<a href="/' + toId(curRoom.title) + '" class="ilink">' + Chat.escapeHTML(curRoom.title) + '</a> (' + curRoom.userCount + ')');
					continue;
				}
			}
			if (curRoom.type !== 'battle') nonOfficial.push('<a href="/' + toId(curRoom.title) + '" class="ilink">' + curRoom.title + '</a> (' + curRoom.userCount + ')');
		}

		if (!user.can('roomowner')) return this.sendReplyBox(header + official.join(' ') + nonOfficial.join(' '));
		this.sendReplyBox(header + official.join(' ') + nonOfficial.join(' ') + privateRoom.join(' ') + (groupChats.length > 1 ? groupChats.join(' ') : '') + (battleRooms.length > 1 ? battleRooms.join(' ') : ''));
	},
        };
