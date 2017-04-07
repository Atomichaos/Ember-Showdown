/*
- * Customicon Plugin
- * 
*/

'use strict';

let icons = {};
const fs = require('fs');
const path = require('path');

function logMoney(message) {
       if (!message) return;
       let file = path.join(LOGS_DIR + 'money.txt');
       let date = '[' + new Date().toUTCString() + '] ';
       let msg = message + '\n';
       fs.appendFile(file, date + msg);
}

function load() {
	fs.readFile(DATA_DIR + 'icons.json', 'utf8', function (err, file) {
		if (err) return;
		icons = JSON.parse(file);
	});
}
load();

function updateIcons() {
	fs.writeFileSync(DATA_DIR + 'icons.json', JSON.stringify(icons));
	//Marca de actualizado
	let newCss = '\n/*. New Icons (Delete Previous) .*/';

	for (let name in icons) {
		newCss += generateCSS(name, icons[name]);
	}
	newCss += '';

	let file = fs.readFileSync(DATA_DIR + 'custom.css', 'utf8').split('');
	if (~file.indexOf('')) file.splice(file.indexOf(''), (file.indexOf('') - file.indexOf('')) + 1);
	fs.writeFileSync(DATA_DIR + 'custom.css', file.join('') + newCss);
}
updateIcons = updateIcons;

function generateCSS(name, icon) {
	let css = '';
	let rooms = [];
	name = toId(name);
	Rooms.rooms.forEach((curRoom, id) => {
		if (id === 'global' || curRoom.type !== 'chat' || curRoom.isPersonal) return;
		if (!isNaN(Number(id.charAt(0)))) return;
		rooms.push('#' + id + '-userlist-user-' + name);
	});
	css = rooms.join(', ');
	css += '{background: url("' + icon + '") no-repeat right}';
	return css;
}

exports.commands = {
	customicon: {
	'! ':true,
	'': function (target, room, user) {
			if (!this.runBroadcast()) return;
            if (!this.can('forcewin')) return false;
			this.sendReplyBox(
				'<small><em>(Only Administrators(~) and Leaders(&) can use these commands)</em></small><br />' +
				'/customicon set <em>‹user›</em>, <em>‹img›</em><br />' +
				'/customicon delete <em>‹user›</em><br />' +
				'/customicon move <em>‹user1›</em>, <em>‹user2›</em>, <em>‹img›</em><br />' +
				'<hr /><b>Note:</b> The image must strictly be <b>32x32</b><br>' +
				'When moving an icon you have to put the link that the user wants whether they want the same or another icon'
				);
		},
		   move: function(target, room, user, connection, cmd) {
            if (!this.can('forcewin')) return false;
    		if (!target || !target.trim()) return this.sendReply('/custom color move User 1, User 2, hex.');
    		target = target.split(',');
    		if (target.length < 3) return this.sendReply('/custom color move User 1, User 2, hex.');
            
            let user1 = (Users.getExact(target[0]) ? Users.getExact(target[0]).name : target[0]);
    		let user2 = (Users.getExact(target[1]) ? Users.getExact(target[1]).name : target[1]);
    		if (!toId(user1) || !toId(user2)) return this.sendReply('/custom color move User 1, User 2, hex.');
	 	 Rooms.rooms.get('staff').add('|raw|<small>[CUSTOMICON] <b><font style="color:' + EM.Color(user.name) + '">' + user.name + '</font></b> has moved the customicon of ' + target[0] + ' to '  + target[1] + ' <a href="' + target[2] + '">(IMG)</a></small>');
		   Rooms.rooms.get('staff').update();
		   delete icons[toId(target[0])];
    	 icons[toId(target[1])] = target[2];
       updateIcons();
		   },
		
		set: function (target, room, user, connection) {
			if (!this.can('forcewin')) return false;
			target = target.split(',');
			
			if (!target[1]) return this.parse('/icon');
			if (toId(target[0]).length > 19) return this.errorReply('The username is too long.');
			this.sendReply('|raw|The customicon of <b><font color="' + EM.Color(toId(target[1])) + '">' + Chat.escapeHTML(target[0]) + '</font></b> has been successfully established.');
			this.privateModCommand('(' + target[0] + ' has received a customicon from ' + user.name + '.)');
			if (Users(target) && Users(target).connected) Users(target).popup('|modal||html|' + user.name + ' has given you a customicon.');
			logMoney(user.name + ' has established a customicon for ' + target[0] + '.');
			Rooms.rooms.get('staff').add('|raw|<small>[ICONS] <b><font style="color:' + EM.Color(toId(user.name)) + '">' + user.name + '</font></b> has established a customicon for ' + target[0] + ' <a href="' + target[1] + '">(IMG)</a></small>');
			Rooms.rooms.get('staff').update();
			icons[toId(target[0])] = target[1];
			updateIcons();
		}, 
		
		delete: function (target, room, user) {
			if (!this.can('forcewin')) return false;
			
			if (!icons[toId(target)]) return this.errorReply('The user: ' + target + ' does not have a customicon set.');
			delete icons[toId(target)];
			updateIcons();
			this.sendReply('Has removed the customicon of ' + target + '.');
			this.privateModCommand('(The customicon of ' + target + ' has been removed by ' + user.name + '.)');
			logMoney(user.name + ' has removed the customicon of ' + target + '.');
			if (Users(target) && Users(target).connected) Users(target).popup('|modal||html|' + user.name + ' has removed your customicon.');
		},
	},
};
