'use strict';
exports.BattleStatuses = {
	crystalgray: {
		exists: true,
		onStart: function () {
			this.add('c', '+Crystal Gray', 'Ayyyyyyy lmao');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+Crystal Gray', 'you can get wet later ;)');
		},
		onFaint: function (pokemon) {
			this.add('c', '+Crystal Gray', 'Shit I got cleaned');
		},
	},
	meltymoltengalaxy: {
		exists: true,
		onStart: function () {
			this.add('c', '%MeltyMoltenGalaxy', 'Imp Latios Sucks');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '%MeltyMoltenGalaxy', 'Lemme Go Sleep');
		},
		onFaint: function (pokemon) {
			this.add('c', '%MeltyMoltenGalaxy', 'llamatea');
		},
	},
	implatios: {
		exists: true,
		onStart: function () {
			this.add('c', '@Imp Latios', 'My powers have doubled since last time we\'ve met.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '@Imp Latios', 'I\'ll be back!');
		},
		onFaint: function (pokemon) {
			this.add('c', '@Imp Latios', 'You had the high ground...');
		},
	},
	revivalleaderclair: {
		exists: true,
		onStart: function () {
			this.add('c', '$RevivalLeaderClair', 'Good Luck');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '$RevivalLeaderClair', 'I\'ll be back!');
		},
		onFaint: function (pokemon) {
			this.add('c', '$RevivalLeaderClair', 'I have been defeated');
		},
	},
	fleurfee: {
		exists: true,
		onStart: function () {
			this.add('c', '&Fleur Fee', 'Ohayo-yo!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '&Fleur Fee', 'Oyasumi-mi! <3');
		},
		onFaint: function (pokemon) {
			this.add('c', '&Fleur Fee', 'Owchies...');
		},
	},
	revivalviosmic: {
		exists: true,
		onStart: function () {
			this.add('c', '~Revival Viosmic', 'You done goofed!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '~Revival Viosmic', 'About 99.9% done.');
		},
		onFaint: function (pokemon) {
			this.add('c', '~Revival Viosmic', 'I done goofed.');
		},
	},
	legacysaffron: {
		exists: true,
		onStart: function () {
			this.add('c', '+Legacy Saffron', 'Hello.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+Legacy Saffron', 'I\'ll be right back.');
		},
		onFaint: function (pokemon) {
			this.add('c', '+Legacy Saffron', 'Well played.');
		},
	},
	deltaskiez: {
		exists: true,
		onStart: function () {
			this.add('c', '~DeltaSkiez', 'Good luck you\'ll need it!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '~DeltaSkiez', 'I\'ll be back.');
		},
		onFaint: function (pokemon) {
			this.add('c', '~DeltaSkiez', 'I have failed.');
		},
	},
	emberbott: {
		exists: true,
		onStart: function () {
			this.add('c', '*EmberBoTT', 'You will never beat me!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '*EmberBoTT', 'You haven\'t won yet I shall return.');
		},
		onFaint: function (pokemon) {
			this.add('c', '*EmberBoTT', 'That was not fair I\'m out.');
		},
	},
	bloodedkitten: {
		exists: true,
		onStart: function () {
			this.add('c', '&Blooded Kitten', 'This battle will be amewsing :]');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '&Blooded Kitten', 'Brb, I\'ll be mewting someone :]');
		},
		onFaint: function (pokemon) {
			this.add('c', '&Blooded Kitten', 'Turn off the mewsic! I\'m out!');
		},
	},
	hurrikaine: {
		exists: true,
		onStart: function () {
			this.add('c', '~HurriKaine', 'I will scorch you with 628 blue flames!!! ...I\'m really bad at this.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '~HurriKaine', 'I\'ll be back, I have a lot of free time');
		},
		onFaint: function (pokemon) {
			this.add('c', '~HurriKaine', 'The flames are dowsed.');
		},
	},
	hanna: {
		exists: true,
		onStart: function () {
			this.add('c', '@Hanna', 'Sigh. Guess I have time for a quick ace before going back to sleep.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '@Hanna', 'Man, I\'m getting tired of this shit.');
		},
		onFaint: function (pokemon) {
			this.add('c', '@Hanna', 'Well you\'re a little bit of a bitch, aren\'t you?');
		},
	},
	revivaljackie: {
		exists: true,
		onStart: function () {
			this.add('c', '%Revival Jackie', 'Gotcha ;)');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '%Revival Jackie', 'Byeeeeeeeeee :3');
		},
		onFaint: function (pokemon) {
			this.add('c', '%Revival Jackie', 'Bleh x_x');
		},
	},
	vaporeonhydroxide: {
		exists: true,
		onStart: function () {
			this.add('c', '$VaporeonHydroxide', 'I\'m here to help!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '$VaporeonHydroxide', 'I\'ll be back soon');
		},
		onFaint: function (pokemon) {
			this.add('c', '$VaporeonHydroxide', 'Guess I couldn\'t help out after all...');
		},
	},
	perfectrose: {
		exists: true,
		onStart: function () {
			this.add('c', '+Perfect Rose', 'You\'re a figment of my imagination.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+Perfect Rose', 'I\'ll come back later.');
		},
		onFaint: function (pokemon) {
			this.add('c', '+Perfect Rose', 'I will never fall.');
		},
	},
};
