/*
- * Custom-Avatar Plugin
- * 
*/

'use strict';

let fs = require('fs');
let path = require('path');

const AVATAR_DIR = DATA_DIR + "avatars/";

function hasAvatar (user) {
	if (Config.customavatars[toId(user)] && fs.existsSync(AVATAR_DIR + Config.customavatars[toId(user)])) 
		return Config.customavatars[toId(user)];
	return false;
}

function reloadAvatars() {
	let formatList = ['.png', '.gif', '.jpeg', '.jpg'];
	fs.readdirSync(AVATAR_DIR)
	.forEach(function (avatar) {
		let name = path.basename(avatar, path.extname(avatar));
		if (formatList.indexOf(path.extname(avatar)) > -1) Config.customavatars[name] = avatar;
	});
}

reloadAvatars();


if (Config.watchconfig) {
	fs.watchFile(path.resolve('./config/config.js'), function (curr, prev) {
		if (curr.mtime <= prev.mtime) return;
		reloadAvatars();
	});
}

exports.commands = {
    
    customavatar: {
        
        help: '',
        '': function (target, room, user) {
          if (!this.can('forcewin')) return false;
          if (!this.runBroadcast()) return;
            return this.sendReplyBox(
                '<em><small>(All commands require <strong>~</strong>)</small></em><br />' +
                '<li>/customavatar set <em>User</em>, <em>URL</em> - Sets a user\'s custom avatar to the specified image URL.' +
			    '<li>/customavatar delete <em>User</em> - Deletes a user\'s custom avatar.' +
			    '<li>/customavatar move <em>User 1</em>, <em>User 2</em> - Moves User 1\'s custom avatar to User 2.'
            );
        },
        
        set: function(target, room, user, connection, cmd) {
            if (!this.can('forcewin')) return false;
            if (!target) return this.sendReply('/customavatar set User, URL');
		    if (target.length < 2)  return this.sendReply('/customavatar set User, URL');
		    target = target.split(',');
		    
		    let targetUser = Users.getExact(target[0]) ? Users.getExact(target[0]).name : target[0];
		    let link = target[1].trim();
		    if (!link.match(/^https?:\/\//i)) link = 'http://' + link;
		    
		    let allowedFormats = ['png', 'jpg', 'jpeg', 'gif'];
		    new Promise (function (resolve, reject) {
    			require("request").get(link)
    				.on('error', function (err) {
    					console.log(err);
    					reject("Avatar unavailable. Try choosing a different one.");
    				})
    				.on('response', function (response) {
    					if (response.statusCode !== 200) reject('Avatar unavailable. Try choosing a different one.');
    					let type = response.headers['content-type'].split('/');
    					if (type[0] !== 'image') reject('Link is not an image link.');
    					if (!~allowedFormats.indexOf(type[1])) reject('Format not supported. The supported formats are ' + allowedFormats.join(', '));
    
    					if (hasAvatar(targetUser)) fs.unlinkSync(AVATAR_DIR + Config.customavatars[toId(targetUser)]);
    					let file = toId(targetUser) + '.' + type[1];
    					response.pipe(fs.createWriteStream(AVATAR_DIR + file));
    					resolve(file);
    				});
    		})
    		.then(function (file) {
    			Config.customavatars[toId(targetUser)] = file;
    			let getUser = Users.getExact(targetUser);
    			if (getUser) getUser.avatar = file;

    			let desc = 'custom avatar has been set to <br><div style = "width: 80px; height: 80px; display: block"><img src = "' + link + '" style = "max-height: 100%; max-width: 100%"></div>';
    			this.sendReply('|html|' + targetUser + '\'s ' + desc);
    			if (getUser) {
    				getUser.send('|html|' + user.name + ' set your custom avatar. Refresh your page if you don\'t see it.');
    				getUser.popup('|html|<center>Your ' + desc + '<br>Refresh your page if you don\'t see it under your username.</center>');
    			}
    		}.bind(this))
    		.catch (function (err) {
    			this.errorReply('Error setting ' + targetUser + '\'s avatar: ' + err);
    		}.bind(this));
        },
        
        delete: function(target, room, user, connection, cmd) {
            if (!this.can('forcewin')) return false;
            if (!target || !target.trim()) return this.sendReply('/customavatar delete User');
		    target = Users.getExact(target) ? Users.getExact(target).name : target;
		    
		    let avatars = Config.customavatars;
		    if (!hasAvatar(target)) return this.errorReply(target + ' does not have a custom avatar.');
		    
		    fs.unlinkSync(AVATAR_DIR + avatars[toId(target)]);
        		delete avatars[toId(target)];
            	this.sendReply(target + '\'s custom avatar has been successfully removed.');
        		if (Users.getExact(target)) {
        			Users.getExact(target).send('Your custom avatar has been removed.');
        			Users.getExact(target).avatar = 1;
		    }
        },
        
        move: function(target, room, user, connection, cmd) {
            if (!this.can('forcewin')) return false;
    		if (!target || !target.trim()) return this.sendReply('/customavatar move User 1, User 2.');
    		target = target.split(',');
    		if (target.length < 2) return this.sendReply('/customavatar move User 1, User 2.');
            
            let user1 = (Users.getExact(target[0]) ? Users.getExact(target[0]).name : target[0]);
    		let user2 = (Users.getExact(target[1]) ? Users.getExact(target[1]).name : target[1]);
    		if (!toId(user1) || !toId(user2)) return this.sendReply('/customavatar move User 1, User 2.');
            let user1Av = hasAvatar(user1);
		    let user2Av = hasAvatar(user2);
		    if (!user1Av) return this.errorReply(user1 + ' does not have a custom avatar.');
        
            let avatars = Config.customavatars;
    		if (hasAvatar(user2)) fs.unlinkSync(AVATAR_DIR + user2Av);
    		let newAv = toId(user2) + path.extname(user1Av);
    		fs.renameSync(AVATAR_DIR + user1Av, AVATAR_DIR + newAv);
    		delete avatars[toId(user1)];
    		avatars[toId(user2)] = newAv;
    		if (Users.getExact(user1)) Users.getExact(user1).avatar = 1;
    		if (Users.getExact(user2)) {
    			Users.getExact(user2).avatar = newAv;
    			Users.getExact(user2).send(user.name + ' has moved ' + user1 + '\'s custom avatar to you. Refresh your page if you don\'t see it under your username.');
    		}
    		return this.sendReply('Successfully moved ' + user1 + '\'s custom avatar to ' + user2 + '.');
        }
    }
};
