'use strict';

let fs = require('fs');
let http = require('http');
const Autolinker = require('autolinker');

let regdateCache = {};

EM.regdate = function (target, callback) {
	target = toId(target);
	if (regdateCache[target]) return callback(regdateCache[target]);
	let options = {
		host: 'pokemonshowdown.com',
		port: 80,
		path: '/users/' + target + '.json',
		method: 'GET',
	};
	http.get(options, function (res) {
		let data = '';
		res.on('data', function (chunk) {
			data += chunk;
		}).on('end', function () {
			data = JSON.parse(data);
			let date = data['registertime'];
			if (date !== 0 && date.toString().length < 13) {
				while (date.toString().length < 13) {
					date = Number(date.toString() + '0');
				}
			}
			if (date !== 0) {
				regdateCache[target] = date;
				saveRegdateCache();
			}
			callback((date === 0 ? false : date));
		});
	});
};

// last two functions needed to make sure EM.regdate() fully works
function loadRegdateCache() {
	try {
		regdateCache = JSON.parse(fs.readFileSync('config/regdate.json', 'utf8'));
	} catch (e) {}
}
loadRegdateCache();

function saveRegdateCache() {
	fs.writeFileSync('config/regdate.json', JSON.stringify(regdateCache));
}
