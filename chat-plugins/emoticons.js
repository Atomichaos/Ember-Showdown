/*
Emoticon plugin
This plugin allows you to use emoticons in both chat rooms (as long as they are enabled in the room) and private messages.
*/
'use strict';
const EM = {};
const fs = require('fs');
let emoticons = {'feelsbd': 'http://i.imgur.com/TZvJ1lI.png'};
let emoteRegex = new RegExp('feelsbd', 'g');
EM.ignoreEmotes = {};
try {
	EM.ignoreEmotes = JSON.parse(fs.readFileSync(DATA_DIR + 'ignoreemotes.json', 'utf8'));
} catch (e) {}
exports.ignoreEmotes = EM.ignoreEmotes;
EM.ignoreEmotes = EM.ignoreEmotes;
function loadEmoticons() {
	try {
		emoticons = JSON.parse(fs.readFileSync(DATA_DIR + 'emoticons.json', 'utf8'));
		emoteRegex = [];
		for (let emote in emoticons) {
			emoteRegex.push(escapeRegExp(emote));
		}
		emoteRegex = new RegExp('(' + emoteRegex.join('|') + ')', 'g');
	} catch (e) {}
}
loadEmoticons();

function saveEmoticons() {
	fs.writeFileSync(DATA_DIR + 'emoticons.json', JSON.stringify(emoticons));
	emoteRegex = [];
	for (let emote in emoticons) {
		emoteRegex.push(emote);
	}
	emoteRegex = new RegExp('(' + emoteRegex.join('|') + ')', 'g');
}

function parseEmoticons(message, room) {
	if (emoteRegex.test(message)) {
		message = (message).replace(emoteRegex, function (match) {
			return '<img src="' + emoticons[match] + '" title="' + match + '" height="50" width="50">';
		});
		return message;
	}
	return false;
}
exports.parseEmoticons = parseEmoticons;
EM.parseEmoticons = parseEmoticons;

exports.commands = {
	emoticons: 'emoticon',
	emote: 'emoticon',
	emotes: 'emoticon',
	emoticon: function (target, room, user) {
		if (!target) target = 'help';
		let parts = target.split(',');
		for (let u in parts) parts[u] = parts[u].trim();

		switch (parts[0]) {
		case 'add':
			if (!this.can('forcewin')) return false;
			if (!parts[2]) return this.sendReply("Usage: /emoticon add, [name], [url] - Remember to resize the image first! (recommended 30x30)");
			if (emoticons[parts[1]]) return this.sendReply("\"" + parts[1] + "\" is already an emoticon.");
			emoticons[parts[1]] = parts[2];
			saveEmoticons();
			this.sendReply('|raw|The emoticon "' + Chat.escapeHTML(parts[1]) + '" has been added: <img src="' + parts[2] + '">');
			Rooms('staff').add('|raw|' + (user.name) + ' has added the emote "' + Chat.escapeHTML(parts[1]) +
				'": <img width="40" height="40" src="' + parts[2] + '">').update();
			break;

		case 'delete':
		case 'remove':
		case 'rem':
		case 'del':
			if (!this.can('forcewin')) return false;
			if (!parts[1]) return this.sendReply("Usage: /emoticon del, [name]");
			if (!emoticons[parts[1]]) return this.sendReply("The emoticon \"" + parts[1] + "\" does not exist.");
			delete emoticons[parts[1]];
			saveEmoticons();
			this.sendReply("The emoticon \"" + parts[1] + "\" has been removed.");
			break;
		case 'view':
		case 'list':
			if (!this.runBroadcast()) return;
			let reply = "<b><u>Emoticons (" + Object.keys(emoticons).length + ")</u></b><br />";
			for (let emote in emoticons) reply += "(" + emote + " <img src=\"" + emoticons[emote] + "\" height=\"40\" width=\"40\">) ";
			this.sendReply('|raw|<div class="infobox infobox-limited">' + reply + '</div>');
			break;

		default:
		case 'help':
			if (!this.runBroadcast()) return;
			this.sendReplyBox(
				"Emoticon Commands:<br />" +
				"<small>/emoticon may be substituted with /emoticons, /emotes, or /emote</small><br />" +
				"/emoticon add, [name], [url] - Adds an emoticon.<br />" +
				"/emoticon del/delete/remove/rem, [name] - Removes an emoticon.<br />" +
				"/emoticon view/list - Displays the list of emoticons.<br />" +
				"/emoticon help - Displays this help command.<br />"
				);
			break;
		}
	},
};

function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
