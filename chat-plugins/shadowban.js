const ROOM_NAME = "Shadow Ban Room";
var room = Rooms.get(toId(ROOM_NAME));
if (!room) {
	Rooms.global.addChatRoom(ROOM_NAME);
	room = Rooms.get(toId(ROOM_NAME));

	room.isPrivate = true;
	room.staffRoom = true;
	room.staffAutojoin = false;
	room.addedUsers = {};

	if (room.chatRoomData) {
		room.chatRoomData.isPrivate = true;
		room.chatRoomData.staffRoom = true;
		room.chatRoomData.staffAutojoin = false;
		room.chatRoomData.addedUsers = room.addedUsers;

		Rooms.global.writeChatRoomData();
	}
}
if (Object.keys(room.addedUsers) > 0) {
	setImmediate(function () {
		room.add("||Users added to the Shadow Ban Room: " + Object.keys(room.addedUsers).sort().join(", "));
		room.update();
	});
}
exports.room = room;

function getLinkId (msg) {
	msg = msg.split(' ');
	for (var i = 0; i < msg.length; i++) {
		if ((/youtu\.be/i).test(msg[i])) {
			var temp = msg[i].split('/');
			return temp[temp.length - 1];
		} else if ((/youtube\.com/i).test(msg[i])) {
			return msg[i].substring(msg[i].indexOf("=") + 1).replace(".", "");
		}
	}
}

function getAllAlts(user) {
	var targets = {};
	if (typeof user === 'string') {
		targets[toId(user)] = 1;
	} else {
		user.getAlts().concat(user.name).forEach(function (altName) {
			var alt = Users.get(altName);
			if (!alt.named) return;

			targets[toId(alt)] = 1;
			Object.keys(alt.prevNames).forEach(function (name) {
				targets[toId(name)] = 1;
			});
		});
	}
	return targets;
}

function intersectAndExclude(a, b) {
	var intersection = [];
	var exclusionA = [];
	var exclusionB = [];

	var ai = 0;
	var bi = 0;
	while (ai < a.length && bi < b.length) {
		var difference = a[ai].localeCompare(b[bi]);
		if (difference < 0) {
			exclusionA.push(a[ai]);
			++ai;
		} else if (difference > 0) {
			exclusionB.push(b[bi]);
			++bi;
		} else {
			intersection.push(a[ai]);
			++ai;
			++bi;
		}
	}

	Array.prototype.push.apply(exclusionA, a.slice(ai));
	Array.prototype.push.apply(exclusionB, b.slice(bi));
	return {intersection: intersection, exclusionA: exclusionA, exclusionB: exclusionB};
}

var checkBannedCache = {};
var checkBanned = exports.checkBanned = function (user) {
	var userId = toId(user);
	if (userId in checkBannedCache) return checkBannedCache[userId];
	//console.log("Shadow ban cache miss:", userId);

	var targets = Object.keys(getAllAlts(user)).sort();
	var bannedUsers = Object.keys(room.addedUsers).sort();

	var matches = intersectAndExclude(targets, bannedUsers);
	var isBanned = matches.intersection.length !== 0;
	for (var t = 0; t < targets.length; ++t) {
		if (isBanned) room.addedUsers[targets[t]] = 1;
		checkBannedCache[targets[t]] = isBanned;
	}
	if (!isBanned) return false;

	if (matches.exclusionA.length > 0) {
		Rooms.global.writeChatRoomData();
		room.addRaw("The alts of <b>" + EM.nameColor(matches.intersection[0]) + "</b> were automatically added: " + matches.exclusionA.join(", "));
		room.update();
	}

	return true;
};

var addUser = exports.addUser = function (user) {
	var targets = getAllAlts(user);
	for (var u in targets) {
		if (room.addedUsers[u]) {
			delete targets[u];
		} else {
			room.addedUsers[u] = 1;
		}
		checkBannedCache[u] = true;
	}
	targets = Object.keys(targets).sort();

	if (targets.length > 0) {
		Rooms.global.writeChatRoomData();
	}

	return targets;
};
var removeUser = exports.removeUser = function (user) {
	var targets = getAllAlts(user);
	for (var u in targets) {
		if (!room.addedUsers[u]) {
			delete targets[u];
		} else {
			delete room.addedUsers[u];
		}
		checkBannedCache[u] = false;
	}
	targets = Object.keys(targets).sort();

	if (targets.length > 0) {
		Rooms.global.writeChatRoomData();
		room.update();
	}

	return targets;
};

var addMessage = exports.addMessage = function (user, tag, message) {
	room.add('|c|' + user.getIdentity() + '|__(' + tag + ')__ ' + message);
	room.update();
};
var addEmoticonMessage = exports.addEmoticonMessage = function (user, message) {
	room.add(message);
	room.update();
};

exports.commands = {
	spam: function (target, room, user) {
		if (!this.can('lock')) return false;
		var params = this.splitTarget(target).split(',');
		var action = params[0].trim().toLowerCase();
		var reason = params.slice(1).join(',').trim();
		if (!(action in Chat.commands)) {
			action = 'mute';
			reason = params.join(',').trim();
		}

		if (!this.targetUser) return this.sendReply("User '" + this.targetUsername + "' not found.");
		if (!this.can('lock', this.targetUser)) return;
		var targets = addUser(this.targetUser);
		if (targets.length === 0) {
			return this.sendReply('||' + this.targetUsername + " was already in the spamroom");
		}
		this.privateModCommand("(" + user.name + " has shadow banned: " + targets.join(", ") + (reason ? " (" + reason + ")" : "") + ")");

		//return this.parse('/' + action + ' ' + toId(this.targetUser) + ',' + reason);
	},

	unspam: function (target, room, user) {
		if (!this.can('lock')) return false;
		this.splitTarget(target);
		var Equestria = Rooms('Shadow Ban Room') ? Rooms('Shadown Ban Room') : false;
		var targets = removeUser(this.targetUser || this.targetUsername);
		if (targets.length === 0) {
			return this.sendReply('||' + this.targetUsername + " is not in the spamroom.");
		}
		this.privateModCommand("(" + user.name + " has shadow unbanned: " + targets.join(", ") + ")");
	},
	
	spamlist: function (target, room, user) {
		if (!this.can('lock')) return false;
		if ((user.locked || room.isMuted(user)) && !user.can('bypassall')) return this.sendReply("You cannot do this while unable to talk.");
		let result = [];
		let data = Rooms(toId(ROOM_NAME)).chatRoomData.addedUsers;
		for (let key in data) {
			result.push(key);
		}
		this.sendReply('|raw|<div class="infobox">Users in the Spam Room:<br><b>' + result.join(', ') + '</b></div>');
	},
	    yt: function(target, room, user) {
       	if (!this.runBroadcast()) return false;
       	if (!this.canTalk())
        if (!target) return false;
        var params_spl = target.split(' ');
        var g = '';

        for (var i = 0; i < params_spl.length; i++) {
            g += '+' + params_spl[i];
        }
        g = g.substr(1);

        var reqOpts = {
            hostname: "www.googleapis.com",
            method: "GET",
            path: '/youtube/v3/search?part=snippet&q=' + g + '&type=video&key=AIzaSyA4fgl5OuqrgLE1B7v8IWYr3rdpTGkTmns',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        var self = this;
        var data = '';
        var req = require('https').request(reqOpts, function(res) {
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function(chunk) {
                var d = JSON.parse(data);
                if (d.pageInfo.totalResults == 0) {
                    room.add('No videos found');
                    room.update();
                    return false;
                } 
        var id = getLinkId(target);
        const image = '<button style="background: none; border: none;"><img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg?custom=true&w=168&h=94&stc=true&jpg444=true&jpgq=90&sp=68&sigh=tbq7TDTjFXD_0RtlFUMGz-k3JiQ" height="180" width="180"></button>';
              self.sendReplyBox('<center>' + image + '<br><a href="https://www.youtube.com/watch?v=' + d.items[0].id.videoId +'"><b> '+ d.items[0].snippet.title +'</b></center>');
            	room.update();
            });
        });
        req.end();
    },
};

Users.ShadowBan = exports;
