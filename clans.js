const clanDataFile = DATA_DIR + 'clans.json';
const warLogDataFile = DATA_DIR + 'warlog.json';

var fs = require('fs');
var elo = require('./elo.js')();

if (!fs.existsSync(clanDataFile))
	fs.writeFileSync(clanDataFile, '{}');

if (!fs.existsSync(warLogDataFile))
	fs.writeFileSync(warLogDataFile, '{}');

var clans = JSON.parse(fs.readFileSync(clanDataFile).toString());
var warLog = JSON.parse(fs.readFileSync(warLogDataFile).toString());
var closedRooms = {};

exports.clans = clans;
exports.warLog = warLog;
exports.closedRooms = closedRooms;

function writeClanData() {
	fs.writeFileSync(clanDataFile, JSON.stringify(clans));
}

function writeWarLogData() {
	fs.writeFileSync(warLogDataFile, JSON.stringify(warLog));
}

function getAvaliableFormats() {
	var formats = {};
	formats[0] = "ou";
	return formats;
}

exports.getWarFormatName = function (format) {
	switch (toId(format)) {
		case 'ou': return 'OU';
		case 'ubers': return 'Ubers';
		case 'uu': return 'UU';
		case 'ru': return 'RU';
		case 'nu': return 'NU';
		case 'lc': return 'LC';
		case 'vgc2017': return 'VGC 2017';
		case 'smogondoubles': return 'Smogon Doubles';
		case 'gen5ou': return '[Gen 5] OU';
		case 'gen4ou': return '[Gen 4] OU';
		case 'gen3ou': return '[Gen 3] OU';
		case 'gen2ou': return '[Gen 2] OU';
		case 'gen1ou': return '[Gen 1] OU';
	}
	return false;
};

exports.getClans = function () {
	return Object.keys(clans).map(function (c) { return clans[c].name; });
};

exports.resetClansRank = function () {
	for (var i in clans) {
		clans[i].rating = 1000;
	}
	writeClanData();
};

exports.getClansList = function (order) {
	var clanIds = {};
	var returnData = {};
	var clansList =  Object.keys(clans).sort().join(",");
	clanIds = clansList.split(',');
	if (toId(order) === 'puntos' || toId(order) === 'rank') {
		var actualRank = -1;
		var actualclanId = false;
		for (var j in clanIds) {
			for (var f in clanIds) {
				if (clans[clanIds[f]].rating > actualRank && !returnData[clanIds[f]]) {
					actualRank = clans[clanIds[f]].rating;
					actualclanId = clanIds[f];
				}
			}
			if (actualclanId) {
				returnData[actualclanId] = 1;
				actualclanId = false;
				actualRank = -1;
			}
		}
		return returnData;
	} else if (toId(order) === 'members' || toId(order) === 'miembros') {
		var actualMembers = -1;
		var actualclanId = false;
		for (var j in clanIds) {
			for (var f in clanIds) {
				if (exports.getMembers(clanIds[f]).length > actualMembers && !returnData[clanIds[f]]) {
					actualMembers = exports.getMembers(clanIds[f]).length;
					actualclanId = clanIds[f];
				}
			}
			if (actualclanId) {
				returnData[actualclanId] = 1;
				actualclanId = false;
				actualMembers = -1;
			}
		}
		return returnData;
	} else {
		for (var g in clanIds) {
			returnData[clanIds[g]] = 1;
		}
		return returnData;
	}
};

exports.getClanName = function (clan) {
	var clanId = toId(clan);
	return clans[clanId] ? clans[clanId].name : "";
};

exports.getRating = function (clan) {
	var clanId = toId(clan);
	if (!clans[clanId])
		return false;
	var gxeClan;
	if (clans[clanId].wins > 10) {
		gxeClan = clans[clanId].wins * 100 / (clans[clanId].wins + clans[clanId].losses);
	} else {
		gxeClan = 0;
	}
	return {
		wins: clans[clanId].wins,
		losses: clans[clanId].losses,
		draws: clans[clanId].draws,
		rating: clans[clanId].rating,
		gxe: gxeClan,
		gxeint: Math.floor(gxeClan),
		ratingName: exports.ratingToName(clans[clanId].rating),
	};
};

exports.getProfile = function (clan) {
	var clanId = toId(clan);
	if (!clans[clanId])
		return false;
	var gxeClan;
	if (clans[clanId].wins > 10) {
		gxeClan = clans[clanId].wins * 100 / (clans[clanId].wins + clans[clanId].losses);
	} else {
		gxeClan = 0;
	}
	return {
		wins: clans[clanId].wins,
		losses: clans[clanId].losses,
		draws: clans[clanId].draws,
		rating: clans[clanId].rating,
		gxe: gxeClan,
		gxeint: Math.floor(gxeClan),
		ratingName: exports.ratingToName(clans[clanId].rating),
		compname: clans[clanId].compname,
		logo: clans[clanId].logo,
		lema: clans[clanId].lema,
		sala: clans[clanId].sala,
		medals: clans[clanId].medals,
	};
};

exports.getElementalData = function (clan) {
	var clanId = toId(clan);
	if (!clans[clanId])
		return false;
	var gxeClan;
	if (clans[clanId].wins > 10) {
		gxeClan = clans[clanId].wins * 100 / (clans[clanId].wins + clans[clanId].losses);
	} else {
		gxeClan = 0;
	}
	return {
		wins: clans[clanId].wins,
		losses: clans[clanId].losses,
		draws: clans[clanId].draws,
		rating: clans[clanId].rating,
		gxe: gxeClan,
		gxeint: Math.floor(gxeClan),
		compname: clans[clanId].compname,
		ratingName: exports.ratingToName(clans[clanId].rating),
		sala: clans[clanId].sala
	};
};

exports.ratingToName = function (rating) {
	if (rating > 1500)
		return "Gold";
	else if (rating > 1200)
		return "Silver";
	else
		return "Bronze";
};

exports.createClan = function (name) {
	var id = toId(name);
	if (clans[id])
		return false;

	clans[id] = {
		name: name,
		members: {},
		wins: 0,
		losses: 0,
		draws: 0,
		rating: 1000,
		//otros datos de clanes
		compname: name,
		leaders: {},
		oficials: {},
		invitations: {},
		logo: "",
		lema: "Lema del clan",
		sala: "none",
		medals: {},
	};
	writeClanData();

	return true;
};

exports.deleteClan = function (name) {
	var id = toId(name);
	if (!clans[id] || War.findClan(id))
		return false;

	delete clans[id];
	if (warLog[id]) delete warLog[id];
	writeClanData();

	return true;
};

exports.getMembers = function (clan) {
	var clanId = toId(clan);
	if (!clans[clanId])
		return false;

	return Object.keys(clans[clanId].members);
};

exports.getInvitations = function (clan) {
	var clanId = toId(clan);
	if (!clans[clanId])
		return false;

	return Object.keys(clans[clanId].invitations);
};

//colors
function MD5(e) {
	function t(e, t) {
		var n, r, i, s, o;
		i = e & 2147483648;
		s = t & 2147483648;
		n = e & 1073741824;
		r = t & 1073741824;
		o = (e & 1073741823) + (t & 1073741823);
		return n & r ? o ^ 2147483648 ^ i ^ s : n | r ? o & 1073741824 ? o ^ 3221225472 ^ i ^ s : o ^ 1073741824 ^ i ^ s : o ^ i ^ s;
	}

	function n(e, n, r, i, s, o, u) {
		e = t(e, t(t(n & r | ~n & i, s), u));
		return t(e << o | e >>> 32 - o, n);
	}

	function r(e, n, r, i, s, o, u) {
		e = t(e, t(t(n & i | r & ~i, s), u));
		return t(e << o | e >>> 32 - o, n);
	}

	function i(e, n, r, i, s, o, u) {
		e = t(e, t(t(n ^ r ^ i, s), u));
		return t(e << o | e >>> 32 - o, n);
	}

	function s(e, n, r, i, s, o, u) {
		e = t(e, t(t(r ^ (n | ~i), s), u));
		return t(e << o | e >>> 32 - o, n);
	}

	function o(e) {
		var t = "",
			n = "",
			r;
		for (r = 0; r <= 3; r++) n = e >>> r * 8 & 255, n = "0" + n.toString(16), t += n.substr(n.length - 2, 2);
		return t
	}
	var u = [],
		a, f, l, c, h, p, d, v, e = function(e) {
			for (var e = e.replace(/\r\n/g, "\n"), t = "", n = 0; n < e.length; n++) {
				var r = e.charCodeAt(n);
				r < 128 ? t += String.fromCharCode(r) : (r > 127 && r < 2048 ? t += String.fromCharCode(r >> 6 | 192) : (t += String.fromCharCode(r >> 12 | 224), t += String.fromCharCode(r >> 6 & 63 | 128)), t += String.fromCharCode(r & 63 | 128));
			}
			return t;
		}(e),
		u = function(e) {
			var t, n = e.length;
			t = n + 8;
			for (var r = ((t - t % 64) / 64 + 1) * 16, i = Array(r - 1), s = 0, o = 0; o < n;) t = (o - o % 4) / 4, s = o % 4 * 8, i[t] |= e.charCodeAt(o) << s, o++;
			i[(o - o % 4) / 4] |= 128 << o % 4 * 8;
			i[r - 2] = n << 3;
			i[r - 1] = n >>> 29;
			return i;
		}(e);
	h = 1732584193;
	p = 4023233417;
	d = 2562383102;
	v = 271733878;
	for (e = 0; e < u.length; e += 16) a = h, f = p, l = d, c = v, h = n(h, p, d, v, u[e + 0], 7, 3614090360), v = n(v, h, p, d, u[e + 1], 12, 3905402710), d = n(d, v, h, p, u[e + 2], 17, 606105819), p = n(p, d, v, h, u[e + 3], 22, 3250441966), h = n(h, p, d, v, u[e + 4], 7, 4118548399), v = n(v, h, p, d, u[e + 5], 12, 1200080426), d = n(d, v, h, p, u[e + 6], 17, 2821735955), p = n(p, d, v, h, u[e + 7], 22, 4249261313), h = n(h, p, d, v, u[e + 8], 7, 1770035416), v = n(v, h, p, d, u[e + 9], 12, 2336552879), d = n(d, v, h, p, u[e + 10], 17, 4294925233), p = n(p, d, v, h, u[e + 11], 22, 2304563134), h = n(h, p, d, v, u[e + 12], 7, 1804603682), v = n(v, h, p, d, u[e + 13], 12, 4254626195), d = n(d, v, h, p, u[e + 14], 17, 2792965006), p = n(p, d, v, h, u[e + 15], 22, 1236535329), h = r(h, p, d, v, u[e + 1], 5, 4129170786), v = r(v, h, p, d, u[e + 6], 9, 3225465664), d = r(d, v, h, p, u[e + 11], 14, 643717713), p = r(p, d, v, h, u[e + 0], 20, 3921069994), h = r(h, p, d, v, u[e + 5], 5, 3593408605), v = r(v, h, p, d, u[e + 10], 9, 38016083), d = r(d, v, h, p, u[e + 15], 14, 3634488961), p = r(p, d, v, h, u[e + 4], 20, 3889429448), h = r(h, p, d, v, u[e + 9], 5, 568446438), v = r(v, h, p, d, u[e + 14], 9, 3275163606), d = r(d, v, h, p, u[e + 3], 14, 4107603335), p = r(p, d, v, h, u[e + 8], 20, 1163531501), h = r(h, p, d, v, u[e + 13], 5, 2850285829), v = r(v, h, p, d, u[e + 2], 9, 4243563512), d = r(d, v, h, p, u[e + 7], 14, 1735328473), p = r(p, d, v, h, u[e + 12], 20, 2368359562), h = i(h, p, d, v, u[e + 5], 4, 4294588738), v = i(v, h, p, d, u[e + 8], 11, 2272392833), d = i(d, v, h, p, u[e + 11], 16, 1839030562), p = i(p, d, v, h, u[e + 14], 23, 4259657740), h = i(h, p, d, v, u[e + 1], 4, 2763975236), v = i(v, h, p, d, u[e + 4], 11, 1272893353), d = i(d, v, h, p, u[e + 7], 16, 4139469664), p = i(p, d, v, h, u[e + 10], 23, 3200236656), h = i(h, p, d, v, u[e + 13], 4, 681279174), v = i(v, h, p, d, u[e + 0], 11, 3936430074), d = i(d, v, h, p, u[e + 3], 16, 3572445317), p = i(p, d, v, h, u[e + 6], 23, 76029189), h = i(h, p, d, v, u[e + 9], 4, 3654602809), v = i(v, h, p, d, u[e + 12], 11, 3873151461), d = i(d, v, h, p, u[e + 15], 16, 530742520), p = i(p, d, v, h, u[e + 2], 23, 3299628645), h = s(h, p, d, v, u[e + 0], 6, 4096336452), v = s(v, h, p, d, u[e + 7], 10, 1126891415), d = s(d, v, h, p, u[e + 14], 15, 2878612391), p = s(p, d, v, h, u[e + 5], 21, 4237533241), h = s(h, p, d, v, u[e + 12], 6, 1700485571), v = s(v, h, p, d, u[e + 3], 10, 2399980690), d = s(d, v, h, p, u[e + 10], 15, 4293915773), p = s(p, d, v, h, u[e + 1], 21, 2240044497), h = s(h, p, d, v, u[e + 8], 6, 1873313359), v = s(v, h, p, d, u[e + 15], 10, 4264355552), d = s(d, v, h, p, u[e + 6], 15, 2734768916), p = s(p, d, v, h, u[e + 13], 21, 1309151649), h = s(h, p, d, v, u[e + 4], 6, 4149444226), v = s(v, h, p, d, u[e + 11], 10, 3174756917), d = s(d, v, h, p, u[e + 2], 15, 718787259), p = s(p, d, v, h, u[e + 9], 21, 3951481745), h = t(h, a), p = t(p, f), d = t(d, l), v = t(v, c);
	return (o(h) + o(p) + o(d) + o(v)).toLowerCase();
}

function hslToRgb(e, t, n) {
	var r, i, s, o, u, a;
	if (!isFinite(e)) e = 0;
	if (!isFinite(t)) t = 0;
	if (!isFinite(n)) n = 0;
	e /= 60;
	if (e < 0) e = 6 - -e % 6;
	e %= 6;
	t = Math.max(0, Math.min(1, t / 100));
	n = Math.max(0, Math.min(1, n / 100));
	u = (1 - Math.abs(2 * n - 1)) * t;
	a = u * (1 - Math.abs(e % 2 - 1));
	if (e < 1) {
		r = u;
		i = a;
		s = 0;
	} else if (e < 2) {
		r = a;
		i = u;
		s = 0;
	} else if (e < 3) {
		r = 0;
		i = u;
		s = a;
	} else if (e < 4) {
		r = 0;
		i = a;
		s = u;
	} else if (e < 5) {
		r = a;
		i = 0;
		s = u;
	} else {
		r = u;
		i = 0;
		s = a;
	}
	o = n - u / 2;
	r = Math.round((r + o) * 255);
	i = Math.round((i + o) * 255);
	s = Math.round((s + o) * 255);
	return {
		r: r,
		g: i,
		b: s
	};
}

function rgbToHex(e, t, n) {
	return toHex(e) + toHex(t) + toHex(n);
}

function toHex(e) {
	if (e == null) return "00";
	e = parseInt(e);
	if (e == 0 || isNaN(e)) return "00";
	e = Math.max(0, e);
	e = Math.min(e, 255);
	e = Math.round(e);
	return "0123456789ABCDEF".charAt((e - e % 16) / 16) + "0123456789ABCDEF".charAt(e % 16);
}

var colorCache = {};

function hashColor(name) {
	name = toId(name);
	if (colorCache[name]) return colorCache[name];
	var hash = MD5(name);
	var H = parseInt(hash.substr(4, 4), 16) % 360; // 0 to 360
	var S = parseInt(hash.substr(0, 4), 16) % 50 + 40; // 40 to 89
	var L = Math.floor(parseInt(hash.substr(8, 4), 16) % 20 + 30); // 30 to 49
	var C = (100 - Math.abs(2 * L - 100)) * S / 100 / 100;
	var X = C * (1 - Math.abs((H / 60) % 2 - 1));
	var m = L / 100 - C / 2;

	var R1, G1, B1;
	switch (Math.floor(H / 60)) {
		case 1: R1 = X; G1 = C; B1 = 0; break;
		case 2: R1 = 0; G1 = C; B1 = X; break;
		case 3: R1 = 0; G1 = X; B1 = C; break;
		case 4: R1 = X; G1 = 0; B1 = C; break;
		case 5: R1 = C; G1 = 0; B1 = X; break;
		case 0: default: R1 = C; G1 = X; B1 = 0; break;
	}
	var lum = (R1 + m) * 0.2126 + (G1 + m) * 0.7152 + (B1 + m) * 0.0722; // 0.05 (dark blue) to 0.93 (yellow)
	var HLmod = (lum - 0.5) * -100; // -43 (yellow) to 45 (dark blue)
	if (HLmod > 12) HLmod -= 12;
	else if (HLmod < -10) HLmod = (HLmod + 10) * 2 / 3;
	else HLmod = 0;

	L += HLmod;
	var Smod = 10 - Math.abs(50 - L);
	if (HLmod > 15) Smod += (HLmod - 15) / 2;
	S -= Smod;

	var rgb = hslToRgb(H, S, L);
	colorCache[name] = "#" + rgbToHex(rgb.r, rgb.g, rgb.b);
	return colorCache[name];
}
//end colors
exports.getUserDiv = function (user) {
	var userId = toId(user);
	var userk = Users.getExact(userId);
	if (!userk) {
		return '<font color="' + EM.Color(userId) + '"><strong>' + userId + '</strong></font>';
	} else {
		return '<font color="' + EM.Color(userId) + '"><strong>' + userk.name + '</strong></font>';
	}
};

exports.getAuthMembers = function (clan, authLevel) {
	var clanId = toId(clan);
	if (!clans[clanId])
		return false;
	var returnMembers = {};
	var returnCode = "";
	var totalMembers = 0;
	var auxVar = 0;
    for (var c in clans[clanId].members) {
		if (Clans.authMember(clanId, c) === authLevel || authLevel === "all") {
			returnMembers[c] = 1;
			totalMembers += 1;
		}
	}
	for (var m in returnMembers) {
		auxVar += 1;
		returnCode += exports.getUserDiv(m);
		if (auxVar < totalMembers) {
			returnCode += ", ";
		}
	}
	return returnCode;
};

exports.authMember = function (clan, member) {
	var clanId = toId(clan);
	if (!clans[clanId])
		return 0;
	var userid = toId(member);
	if (clans[clanId].leaders[userid]) return 3;
	if (clans[clanId].oficials[userid] && clans[clanId].oficials[userid] === 2) return 2;
	if (clans[clanId].oficials[userid]) return 1;
	return 0;
};

exports.getOficials = function (clan) {
	var clanId = toId(clan);
	if (!clans[clanId])
		return false;

	return Object.keys(clans[clanId].oficials);
};

exports.getLeaders = function (clan) {
	var clanId = toId(clan);
	if (!clans[clanId])
		return false;

	return Object.keys(clans[clanId].leaders);
};

exports.findClanFromMember = function (user) {
	var userId = toId(user);
	for (var c in clans)
		if (clans[c].members[userId])
			return clans[c].name;
	return false;
};

exports.findClanFromRoom = function (room) {
	var roomId = toId(room);
	for (var c in clans)
		if (toId(clans[c].sala) === roomId)
			return clans[c].name;
	return false;
};

exports.setRanking = function (clan, dato) {
	dato = parseInt(dato);
	var clanId = toId(clan);
	if (!clans[clanId])
		return false;
	if (dato > 0) {
		clans[clanId].rating = dato;
	} else {
		clans[clanId].rating = 0;
	}
	writeClanData();
	return true;
};

exports.setGxe = function (clan, wx, lx, tx) {
	var clanId = toId(clan);
	if (!clans[clanId])
		return false;
	if (wx > 0) {
		clans[clanId].wins = parseInt(wx);
	} else {
		clans[clanId].wins = 0;
	}
	if (lx > 0) {
		clans[clanId].losses = parseInt(lx);
	} else {
		clans[clanId].losses = 0;
	}
	if (tx > 0) {
		clans[clanId].draws = parseInt(tx);
	} else {
		clans[clanId].draws = 0;
	}
	writeClanData();
	return true;
};

exports.setCompname = function (clan, clanTitle) {
	var clanId = toId(clan);
	if (!clans[clanId])
		return false;
	if (clanTitle.length > 80) return false;
	clans[clanId].compname = clanTitle;
	writeClanData();
	return true;
};

exports.setLema = function (clan, text) {
	var clanId = toId(clan);
	if (!clans[clanId])
		return false;
	if (text.length > 80) return false;
	clans[clanId].lema = text;
	writeClanData();
	return true;
};

exports.setLogo = function (clan, text) {
	var clanId = toId(clan);
	if (!clans[clanId])
		return false;
	if (text.length > 200) return false;
	clans[clanId].logo = text;
	writeClanData();
	return true;
};

exports.setSala = function (clan, text) {
	var clanId = toId(clan);
	if (!clans[clanId])
		return false;
	if (text.length > 80) return false;
	clans[clanId].sala = text;
	writeClanData();
	return true;
};

exports.clearInvitations = function (clan) {
	var clanId = toId(clan);
	if (!clans[clanId])
		return false;
	clans[clanId].invitations = {};
	writeClanData();
	return true;
};

exports.addMedal = function (clan, medalName, medalImage, desc) {
	var clanId = toId(clan);
	var medalId = toId(medalName);
	if (medalName.length > 80) return false;
	if (desc.length > 80) return false;
	if (!clans[clanId])
		return false;
	if (!clans[clanId].medals[medalId]) {
		clans[clanId].medals[medalId] = {
			name: medalName,
			logo: medalImage,
			desc: desc
		};
	} else {
		return false;
	}
	writeClanData();

	return true;
};

exports.deleteMedal = function (clan, medalName) {
	var clanId = toId(clan);
	var medalId = toId(medalName);
	if (!clans[clanId])
		return false;
	if (!clans[clanId].medals[medalId]) return false;
	delete clans[clanId].medals[medalId];
	writeClanData();

	return true;
};

exports.addMember = function (clan, user) {
	var clanId = toId(clan);
	var userId = toId(user);
	if (!clans[clanId] || exports.findClanFromMember(user))
		return false;

	clans[clanId].members[userId] = 1;
	writeClanData();

	return true;
};

exports.addLeader = function (user) {
	var userId = toId(user);
	var clanUser = exports.findClanFromMember(user);
	if (!clanUser)
		return false;
	var clanId = toId(clanUser);
	if (clans[clanId].leaders[userId]) return false;
	if (clans[clanId].oficials[userId]) {
		delete clans[clanId].oficials[userId];
	}
	clans[clanId].leaders[userId] = 1;
	writeClanData();

	return true;
};

exports.deleteLeader = function (user) {
	var userId = toId(user);
	var clanUser = exports.findClanFromMember(user);
	if (!clanUser)
		return false;
	var clanId = toId(clanUser);
	if (!clans[clanId].leaders[userId]) return false;
	delete clans[clanId].leaders[userId];
	writeClanData();

	return true;
};

exports.addOficial = function (user) {
	var userId = toId(user);
	var clanUser = exports.findClanFromMember(user);
	if (!clanUser)
		return false;
	var clanId = toId(clanUser);
	if (clans[clanId].oficials[userId]) return false;
	if (clans[clanId].leaders[userId]) {
		delete clans[clanId].leaders[userId];
	}
	clans[clanId].oficials[userId] = 1;
	writeClanData();

	return true;
};

exports.addSubLeader = function (user) {
	var userId = toId(user);
	var clanUser = exports.findClanFromMember(user);
	if (!clanUser)
		return false;
	var clanId = toId(clanUser);
	if (clans[clanId].oficials[userId] && clans[clanId].oficials[userId] === 2) return false;
	if (clans[clanId].leaders[userId]) {
		delete clans[clanId].leaders[userId];
	}
	clans[clanId].oficials[userId] = 2;
	writeClanData();

	return true;
};

exports.deleteOficial = function (user) {
	var userId = toId(user);
	var clanUser = exports.findClanFromMember(user);
	if (!clanUser)
		return false;
	var clanId = toId(clanUser);
	if (!clans[clanId].oficials[userId]) return false;
	delete clans[clanId].oficials[userId];
	writeClanData();

	return true;
};

exports.addInvite = function (clan, user) {
	var clanId = toId(clan);
	var userId = toId(user);
	if (!clans[clanId] || exports.findClanFromMember(user))
		return false;
	if (clans[clanId].invitations[userId]) return false;

	clans[clanId].invitations[userId] = 1;
	writeClanData();

	return true;
};

exports.aceptInvite = function (clan, user) {
	var clanId = toId(clan);
	var userId = toId(user);
	if (!clans[clanId] || exports.findClanFromMember(user))
		return false;
	if (!clans[clanId].invitations[userId]) return false;
	clans[clanId].members[userId] = 1;
	delete clans[clanId].invitations[userId];
	writeClanData();

	return true;
};

exports.removeMember = function (clan, user) {
	var clanId = toId(clan);
	var userId = toId(user);
	if (!clans[clanId] || !clans[clanId].members[userId])
		return false;
	if (clans[clanId].oficials[userId]) {
		delete clans[clanId].oficials[userId];
	}
	if (clans[clanId].leaders[userId]) {
		delete clans[clanId].leaders[userId];
	}
	delete clans[clanId].members[userId];
	writeClanData();

	return true;
};
//warsystem

exports.getWarLogTable = function (clan) {
	var exportsTable = '<table border="1" cellspacing="0" cellpadding="3" target="_blank"><tbody><tr target="_blank"><th target="_blank">Fecha</th><th target="_blank">Tier</th><th target="_blank">Rival</th><th target="_blank">Tipo</th><th target="_blank">Resultado</th><th target="_blank">Matchups</th><th target="_blank">Puntos</th><th target="_blank">Rondas</th></tr>';
	var warLogId = toId(clan);
	if (!warLog[warLogId]) return '<b>A&uacute;n no se ha registrado ninguna War.</b>';
	var nWars = warLog[warLogId].nWarsRegistered;
	var resultName = '';
	var styleName = '';
	for (var t = 0; t < nWars; ++t) {
		exportsTable += '<tr>';
		resultName = '<font color="green">Victoria</font>';
		if (warLog[warLogId].warData[nWars - t - 1].scoreB > warLog[warLogId].warData[nWars - t - 1].scoreA) resultName = '<font color="red">Derrota</font>';
		if (warLog[warLogId].warData[nWars - t - 1].scoreB === warLog[warLogId].warData[nWars - t - 1].scoreA) resultName = '<font color="orange">Empate</font>';
		styleName = toId(warLog[warLogId].warData[nWars - t - 1].warStyle);
		if (styleName === "standard") styleName = "Standard";
		if (styleName === "total") styleName = "Total";
		if (styleName === "lineups") styleName = "Cl&aacute;sica";
		exportsTable += '<td align="center">' + warLog[warLogId].warData[nWars - t - 1].dateWar + '</td><td align="center">' +
		exports.getWarFormatName(warLog[warLogId].warData[nWars - t - 1].warFormat) + '</td><td align="center">' +
		exports.getClanName(warLog[warLogId].warData[nWars - t - 1].against) + '</td><td align="center">' + styleName + '</td>' +
		'<td align="center">' + resultName + '</td><td align="center">' + warLog[warLogId].warData[nWars - t - 1].scoreA + ' - ' +
		warLog[warLogId].warData[nWars - t - 1].scoreB + '</td><td align="center">' + warLog[warLogId].warData[nWars - t - 1].addPoints +
		'</td><td align="center">Ronda ' + warLog[warLogId].warData[nWars - t - 1].warRound + '</td>';
		
		exportsTable += '</tr>';
	}
	exportsTable += '</tbody></table>';
	return exportsTable;
};

exports.logWarData = function (clanA, clanB, scoreA, scoreB, warStyle, warFormat, addPoints, warRound) {
	var warId = toId(clanA);
	var f = new Date();
	var dateWar = f.getDate() + '-' + f.getMonth() + ' ' + f.getHours() + 'h';
	if (!warLog[warId]) {
		warLog[warId] = {
			nWarsRegistered: 0,
			warData: {}
		}
	}
	if (warLog[warId].nWarsRegistered < 10) {
		warLog[warId].warData[warLog[warId].nWarsRegistered] = {
			dateWar: dateWar,
			against: clanB,
			scoreA: scoreA,
			scoreB: scoreB,
			warStyle: warStyle,
			warFormat: warFormat,
			warRound: warRound,
			addPoints: addPoints
		};
		++warLog[warId].nWarsRegistered;
	} else {
		var warDataAux = {};
		for (var t = 1; t < 10; ++t) {
			warDataAux[t - 1] = warLog[warId].warData[t];
		}
		warDataAux[9] = {
			dateWar: dateWar,
			against: clanB,
			scoreA: scoreA,
			scoreB: scoreB,
			warStyle: warStyle,
			warFormat: warFormat,
			warRound: warRound,
			addPoints: addPoints
		};
		warLog[warId].warData = warDataAux;
	}
	writeWarLogData();
	return true;
};

exports.setWarResult = function (clanA, clanB, scoreA, scoreB, warStyle, warSize) {
	var clanAId = toId(clanA);
	var clanBId = toId(clanB);
	var result = 0;
	if (!clans[clanAId] || !clans[clanBId])
		return false;
	var multip = 128;
	var addPoints = {};
	if (toId(warStyle) === "total") multip = 256;
	if (toId(warStyle) === "lineups") multip = 180;
	multip = Math.abs(multip * (Math.floor(scoreB - scoreA)));
	var oldScoreA = clans[clanAId].rating;
	var oldScoreB = clans[clanBId].rating;
	clans[clanAId].rating = parseInt(clans[clanAId].rating);
	clans[clanBId].rating = parseInt(clans[clanBId].rating); // no decimal ratings
	var clanAExpectedResult;
	var clanBExpectedResult;
	elo.setKFactor(multip);
	if (scoreA > scoreB) {
		++clans[clanAId].wins;
		++clans[clanBId].losses;
		result = 1;
		clanAExpectedResult = elo.getExpected(clans[clanAId].rating, clans[clanBId].rating);
		clans[clanAId].rating = elo.updateRating(clanAExpectedResult, result, clans[clanAId].rating);
		clanBExpectedResult = elo.getExpected(clans[clanBId].rating, clans[clanAId].rating);
		clans[clanBId].rating = elo.updateRating(clanBExpectedResult, 1 - result, clans[clanBId].rating);
	} else if (scoreB > scoreA) {
		++clans[clanAId].losses;
		++clans[clanBId].wins;
		result = 0;
		clanAExpectedResult = elo.getExpected(clans[clanAId].rating, clans[clanBId].rating);
		clans[clanAId].rating = elo.updateRating(clanAExpectedResult, result, clans[clanAId].rating);
		clanBExpectedResult = elo.getExpected(clans[clanBId].rating, clans[clanAId].rating);
		clans[clanBId].rating = elo.updateRating(clanBExpectedResult, 1 - result, clans[clanBId].rating);
	} else {
		addPoints['A'] = 0;
		addPoints['B'] = 0;
		++clans[clanAId].draws;
		++clans[clanBId].draws;
		multip = 0;
	}
	if (clans[clanAId].rating < 1000)
		clans[clanAId].rating = 1000;
	if (clans[clanBId].rating < 1000)
		clans[clanBId].rating = 1000;
	writeClanData();
	addPoints['A'] = clans[clanAId].rating - oldScoreA;
	addPoints['B'] = clans[clanBId].rating - oldScoreB;
	return addPoints;
};

exports.isRoomClosed = function (room, user) {
	var roomId = toId(room);
	if (!closedRooms[roomId]) return false;
	var clan = exports.findClanFromMember(user);
	if (!clan) return true;
	var clanId = toId(clan);
	if (!clans[clanId]) return true;
	if (closedRooms[roomId] === clanId) return false;
	return true;
};

exports.closeRoom = function (room, clan) {
	var clanId = toId(clan);
	var roomId = toId(room);
	if (!clans[clanId]) return false;
	if (toId(clans[clanId].sala) !== roomId) return false;
	if (closedRooms[roomId]) return false;
	closedRooms[roomId] = clanId;
	return true;
};

exports.openRoom = function (room, clan) {
	var clanId = toId(clan);
	var roomId = toId(room);
	if (!clans[clanId]) return false;
	if (toId(clans[clanId].sala) !== roomId) return false;
	if (!closedRooms[roomId]) return false;
	delete closedRooms[roomId];
	return true;
};

exports.resetWarLog = function () {
	warLog = {};
	exports.warLog = warLog;
	writeWarLogData();
};
