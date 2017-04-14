'use strict';

const fs = require('fs');
const nani = require('nani').init("niisama1-uvake", "llbgsBx3inTdyGizCPMgExBVmQ5fU");
let request = require('request');

let amCache = {
	anime: {},
	manga: {},
};

function isDev(user) {
	if (!user) return;
	if (typeof user === 'object') user = user.userid;
	let dev = Db('devs').get(toId(user));
	if (dev === 1) return true;
	return false;
}

exports.commands = {
	anime: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) return this.errorReply("No target.");
		let targetAnime = Chat.escapeHTML(target.trim());
		let id = targetAnime.toLowerCase().replace(/ /g, '');
		if (amCache.anime[id]) return this.sendReply('|raw|' + amCache.anime[id]);

		nani.get('anime/search/' + targetAnime)
			.then(data => {
				if (data[0].adult) {
					return this.errorReply('Nsfw content is not allowed.');
				}
				nani.get('anime/' + data[0].id)
					.then(data => {
						let css = 'text-shadow: 1px 1px 1px #CCC; padding: 3px 8px;';
						let output = '<div class="infobox"><table width="100%"><tr>';
						let description = data.description.replace(/(\r\n|\n|\r)/gm, "").split('<br><br>').join('<br>');
						if (description.indexOf('&lt;br&gt;&lt;br&gt;') >= 0) description = description.substr(0, description.indexOf('&lt;br&gt;&lt;br&gt;'));
						if (description.indexOf('<br>') >= 0) description = description.substr(0, description.indexOf('<br>'));
						output += '<td style="' + css + ' background: rgba(170, 165, 215, 0.5); box-shadow: 2px 2px 5px rgba(170, 165, 215, 0.8); border: 1px solid rgba(170, 165, 215, 1); border-radius: 5px; color: #2D2B40; text-align: center; font-size: 15pt;"><b>' + data.title_romaji + '</b></td>';
						output += '<td rowspan="6"><img src="' + data.image_url_lge + '" height="320" width="225" alt="' + data.title_romaji + '" title="' + data.title_romaji + '" style="float: right; border-radius: 10px; box-shadow: 4px 4px 3px rgba(0, 0, 0, 0.5), 1px 1px 2px rgba(255, 255, 255, 0.5) inset;" /></td></tr>';
						output += '<tr><td style="' + css + '"><b>Genre(s): </b>' + data.genres + '</td></tr>';
						output += '<tr><td style="' + css + '"><b>Air Date: </b>' + data.start_date.substr(0, 10) + '</td></tr><tr>';
						output += '<tr><td style="' + css + '"><b>Status: </b>' + data.airing_status + '</td></tr>';
						output += '<tr><td style="' + css + '"><b>Episode Count: </b>' + data.total_episodes + '</td></tr>';
						output += '<tr><td style="' + css + '"><b>Rating: </b> ' + data.average_score + '/100</td></tr>';
						output += '<tr><td colspan="2" style="' + css + '"><b>Description: </b>' + description + '</td></tr>';
						output += '</table></div>';
						amCache.anime[id] = output;
						this.sendReply('|raw|' + output);
						room.update();
					});
			})
			.catch(error => {
				return this.errorReply("Anime not found.");
			});
	},
	manga: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) return this.errorReply("No target.");
		let targetAnime = Chat.escapeHTML(target.trim());
		let id = targetAnime.toLowerCase().replace(/ /g, '');
		if (amCache.anime[id]) return this.sendReply('|raw|' + amCache.anime[id]);

		nani.get('manga/search/' + targetAnime)
			.then(data => {
				nani.get('manga/' + data[0].id)
					.then(data => {
						let css = 'text-shadow: 1px 1px 1px #CCC; padding: 3px 8px;';
						let output = '<div class="infobox"><table width="100%"><tr>';
						for (let i = 0; i < data.genres.length; i++) {
							if (/(Hentai|Yaoi|Ecchi)/.test(data.genres[i])) return this.errorReply('Nsfw content is not allowed.');
						}
						let description = data.description.replace(/(\r\n|\n|\r)/gm, " ").split('<br><br>').join('<br>');
						if (description.indexOf('&lt;br&gt;&lt;br&gt;') >= 0) description = description.substr(0, description.indexOf('&lt;br&gt;&lt;br&gt;'));
						if (description.indexOf('<br>') >= 0) description = description.substr(0, description.indexOf('<br>'));
						output += '<td style="' + css + ' background: rgba(170, 165, 215, 0.5); box-shadow: 2px 2px 5px rgba(170, 165, 215, 0.8); border: 1px solid rgba(170, 165, 215, 1); border-radius: 5px; color: #2D2B40; text-align: center; font-size: 15pt;"><b>' + data.title_romaji + '</b></td>';
						output += '<td rowspan="6"><img src="' + data.image_url_lge + '" height="320" width="225" alt="' + data.title_romaji + '" title="' + data.title_romaji + '" style="float: right; border-radius: 10px; box-shadow: 4px 4px 3px rgba(0, 0, 0, 0.5), 1px 1px 2px rgba(255, 255, 255, 0.5) inset;" /></td></tr>';
						output += '<tr><td style="' + css + '"><b>Genre(s): </b>' + data.genres + '</td></tr>';
						output += '<tr><td style="' + css + '"><b>Release Date: </b>' + data.start_date.substr(0, 10) + '</td></tr><tr>';
						output += '<tr><td style="' + css + '"><b>Status: </b>' + data.publishing_status + '</td></tr>';
						output += '<tr><td style="' + css + '"><b>Chapter Count: </b>' + data.total_chapters + '</td></tr>';
						output += '<tr><td style="' + css + '"><b>Rating: </b> ' + data.average_score + '/100</td></tr>';
						output += '<tr><td colspan="2" style="' + css + '"><b>Description: </b>' + description + '</td></tr>';
						output += '</table></div>';
						amCache.manga[id] = output;
						this.sendReply('|raw|' + output);
						room.update();
					});
			})
		.catch(error => {
			return this.errorReply("Anime not found.");
		});
	},
	dev: {
		give: function (target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.parse('/help', true);
			let devUsername = toId(target);
			if (devUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (isDev(devUsername)) return this.errorReply(devUsername + " is already a DEV user.");
			Db('devs').set(devUsername, 1);
			this.sendReply('|html|' + EM.nameColor(devUsername, true) + " has been given DEV status.");
			if (Users.get(devUsername)) Users(devUsername).popup("|html|You have been given DEV status by " + EM.nameColor(user.name, true) + ".");
		},
		take: function (target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.parse('/help', true);
			let devUsername = toId(target);
			if (devUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (!isDev(devUsername)) return this.errorReply(devUsername + " isn't a DEV user.");
			Db('devs').delete(devUsername);
			this.sendReply("|html|" + EM.nameColor(devUsername, true) + " has been demoted from DEV status.");
			if (Users.get(devUsername)) Users(devUsername).popup("|html|You have been demoted from DEV status by " + EM.nameColor(user.name, true) + ".");
		},
		users: 'list',
		list: function (target, room, user) {
			if (!Db('devs').keys().length) return this.errorReply('There seems to be no user with DEV status.');
			let display = [];
			Db('devs').keys().forEach(devUser => {
				display.push(EM.nameColor(devUser, (Users(devUser) && Users(devUser).connected)));
			});
			this.popupReply('|html|<b><u><font size="3"><center>DEV Users:</center></font></u></b>' + display.join(','));
		},
		'': 'help',
		help: function (target, room, user) {
			this.sendReplyBox(
				'<div style="padding: 3px 5px;"><center>' +
				'<code>/dev</code> commands.<br />These commands are nestled under the namespace <code>dev</code>.</center>' +
				'<hr width="100%">' +
				'<code>give [username]</code>: Gives <code>username</code> DEV status. Requires: & ~' +
				'<br />' +
				'<code>take [username]</code>: Takes <code>username</code>\'s DEV status. Requires: & ~' +
				'<br />' +
				'<code>list</code>: Shows list of users with DEV Status' +
				'</div>'
			);
		},
	},
};
