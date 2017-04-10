"use strict";

exports.BattleMovedex = {
	// Crystal Gray
	hydrosmash: {
		category: "Status",
		id: "hydrosmash",
		isNonstandard: true,
		name: "Hydro Smash",
		pp: 10,
		priority: 0,
		self: {
			boosts: {
				spa: 2,
			},
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Hydro Pump", source);
			this.add('-anim', source, "Haze", source);
		},
		secondary: false,
		target: "Normal",
		type: "Water",
	},
	// DeltaSkiez
	grassstorm: {
		category: "Status",
		id: "grassstorm",
		isNonstandard: true,
		name: "Grass Storm",
		pp: 10,
		secondary: {
			chance: 100,
			volatileStatus: 'confusion',
		},
		priority: 0,
		self: {
			boosts: {
				spa: 2,
				spd: 1,
			},
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('', '>>> let p=p2.pokemon.find(p => p.speciesid===\'ludicolo\'); battle.boost({spa:1,spe:1},p); battle.setWeather(\'raindance\', p); for(let i in p1.pokemon) if(p1.pokemon[i].isActive) { p1.pokemon[i].setStatus(\'confusion\'); break;}');
			this.add('-anim', source, "Calm Mind", target);
			this.add('-anim', source, "Geomancy", target);
		},
		weather: 'raindance',
		target: "Normal",
		type: "Psychic",
	},
	// Revival Viosmic
	papercut: {
		category: "Status",
		id: "papercut",
		isNonstandard: true,
		name: "Paper Cut",
		pp: 10,
		secondary: {
			chance: 100,
			volatileStatus: 'confusion',
		},
		priority: 0,
		self: {
			boosts: {
				evasion: 1,
			},
			heal: [6, 20],
		},
		onHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Taunt", target);
			this.add('-anim', source, "Double Team", source);
		},
		target: "Normal",
		type: "Dark",
	},
	// Fleur Fee
	bloodyrose: {
		category: "Status",
		id: "bloodyrose",
		isNonstandard: true,
		name: "Bloody Rose",
		pp: 10,
		priority: 0,
		self: {
			boosts: {
				def: 1,
			},
			heal: [7, 20],
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Iron Defense", source);
		},
		drain: [7, 20], //35%
		target: "Normal",
		type: "Fire",
	},
	// Imp Latios
	dracoshower: {
		accuracy: 100,
		basePower: 140,
		category: "Special",
		id: "dracoshower",
		isNonstandard: true,
		name: "Draco Shower",
		pp: 10,
		priority: 0,
		target: "Normal",
		type: "Dark",
		secondary: {
			chance: 30,
			volatileStatus: 'tox',
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Blizzard", target);
		},
	},
	// MeltyMoltenGalaxy
	crestofdeath: {
		category: "Special",
		basePower: 150,
		id: "crestofdeath",
		isNonstandard: true,
		name: "Crest of Death",
		pp: 15,
		priority: 0,
		self: {
			boosts: {
				def: -1,
				spd: -1,
			},
		},
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Hyper Voice", source);
		},
		target: "Normal",
		type: "Fairy",
	},
	// EmberBoTT
	emberstorm: {
		category: "Physical",
		basePower: 150,
		id: "emberstorm",
		isNonstandard: true,
		name: "Ember Storm",
		self: {
			volatileStatus: 'mustrecharge',
		},
		secondary: {
			chance: 30,
			self: {
				boosts: {
					spa: 1,
					spe: 1,
					spd: 1,
					atk: 1,
					def: 1,
				},
			},
		},
		pp: 15,
		priority: 0,
		onHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', target, "Sacred Sword", target);
		},
		target: "Normal",
		type: "Rock",
	},
	// RevivalLeaderClair
	dragonblitz: {
		category: "Special",
		basePower: 140,
		id: "dragonblitz",
		isNonstandard: true,
		name: "Dragon Blitz",
		secondary: {
			chance: 100,
			self: {
				boosts: {
					spa: 2,
				},
				heal: [1, 5],
			},
		},
		pp: 10,
		priority: 0,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', target, "Glare", target);
			this.add('-anim', source, "Leaf Storm", target);
		},
		target: "Normal",
		type: "Grass",
	},
	// Legacy Saffron
	powercut: {
		category: "Status",
		id: "powercut",
		isNonstandard: true,
		name: "Power Cut",
		pp: 10,
		priority: 0,
		self: {
			boosts: {
				spe: 1,
				atk: 1,
			},
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Sunny Day", target);
		},
		weather: 'sunnyday',
		target: "Normal",
		type: "Fire",
	},
	// Perfect Rose
	trihornbash: {
		accuracy: 100,
		basePower: 100,
		category: "Special",
		id: "trihornbash",
		isNonstandard: true,
		name: "Tri-Horn Bash",
		pp: 10,
		priority: 1,
		target: "Normal",
		type: "Fire",
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Aerial Ace", source);
			this.add('-anim', source, "Mach Punch", target);
		},
	},
	// VaporeonHydroxide
	devotion: {
		category: "Physical",
		id: "devotion",
		isNonstandard: true,
		basePower: 40,
		name: "Devotion",
		pp: 20,
		secondary: {
			chance: 30,
			status: 'par',
			volatileStatus: ['flinch', 'confusion',
			],
		},
		priority: 0,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Thrash", target);
		},
		target: "Normal",
		type: "Normal",
	},
	// Revival Jackie
	hurricaneslicer: {
		category: "Status",
		id: "hurricaneslicer",
		isNonstandard: true,
		name: "Hurricane Slicer",
		self: {
			boosts: {
				def: 1,
				spa: 1,
				spd: 1,
			},
		},
		pp: 10,
		priority: 0,
		onHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Charm", source);
		},
		target: "self",
		type: "Fairy",
	},
	// Hanna
	dnaevolution: {
		category: "Status",
		id: "dnaevolution",
		isNonstandard: true,
		name: "DNA Evolution",
		pp: 10,
		secondary: {
			volatileStatus: 'attract',
		},
		priority: 0,
		self: {
			boosts: {
				atk: 1,
			},
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Charm", source);
		},
		target: "Normal",
		type: "Normal",
	},
	// Blooded Kitten
	crystallizedukaku: {
		category: "Physical",
		basePower: 90,
		id: "crystallizedukaku",
		isNonstandard: true,
		name: "Crystallized Ukaku",
		pp: 15,
		priority: 0,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Head Smash", target);
		},
		target: "Normal",
		type: "Steel",
	},
	// HurriKaine
	mysticmirage: {
		category: "Status",
		id: "mysticmirage",
		isNonstandard: true,
		name: "Mystic Mirage",
		pp: 10,
		priority: 0,
		self: {
			boosts: {
				spe: 1,
				atk: 1,
			},
			heal: [5, 20],
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Dragon Dance", source);
		},
		target: "Normal",
		type: "Dragon",
	},
};
