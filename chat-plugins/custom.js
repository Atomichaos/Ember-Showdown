'use strict';

exports.commands = {
serverrules: 'emberrules',
	emberrules: function (target, room, user) {
		this.popupReply("|html|" + "<font size=4><b>Ember Server Rules:</b></font><br />" +
					"<br />" +
					"<b>1.</b> No sex. Don't discuss anything sexually explicit, not even in private messages, not even if you're both adults.<br />" +
					"<br />" +
					"<b>2.</b> Moderators have discretion to punish any behaviour they deem inappropriate, whether or not it's on this list.<br />" +
					"<br />" +
					"<b>3.</b> Do not spam, flame, or troll. This includes advertising, raiding, asking questions with one-word answers in the lobby, and flooding the chat such as by copy/pasting logs in the lobby.<br />" +
					"<br />" +
					"<b>4.</b> No minimodding: don't mod if it's not your job. Don't tell people they'll be muted, don't ask for people to be muted, and don't talk about whether or not people should be muted. This applies to bans and other punishments, too.<br />" +
					"<br />" +
					"<b>5.</b> Spam is not permitted this included but not limited to server links, 18+ links, etc.<br />" +
					"<br />" +
					"<b>6.</b> Usernames may not directly reference sexual activity, or be excessively disgusting.<br />" +
					"<br />" +
					"<b>7.</b> Please treat everyone with respect this included staff and regular users.<br />" +
					"<br />" +
					"<b>8.</b> Do not flood chats with spam that has no purpose.<br />" +
					"<br />" +
					"<i>Please follow these rules to make the server a friendly and enjoyable place to be. Breaking any rules will result in punishment.</i><br />");
	},
	
	'!discord': true,
	    discord: function (target, room, user) {
		        if (!this.runBroadcast()) return;
		        this.sendReplyBox('Join our server discord by clicking <a href="https://discord.gg/pBxqYyZ">here</a>.');
	},
	
	fleur : 'fleur',
    	fleur: function(target, room, user) {
            if (!this.runBroadcast()) return;
            this.sendReplyBox('<center><tbody><table height="100%" width="100%" padding:5px; style="background-image: url(&quot;http://i.imgur.com/fpc8bl1.jpg&quot;); background-size: cover" table border="0"><tbody><tr><td width="25%" height="100%"><center><img height="180" src="https://s29.postimg.org/u6brormg7/yozora_g1.gif">' +
                '<a href="http://picosong.com/rbeq/" target="_blank"><img src="https://s27.postimg.org/nd0zdnvur/fleur_text.png" height="125" alt="Theme" /></a>' +
                '<img src="https://s29.postimg.org/9ngvjp8iv/yozora_g2.gif" height="180"><br />' +
                '<b>Catchphrase: </b>"What kind of style do you desire to change into? Mesmerize your identity with fashion and make up. Blossom into an elegant flower, so that you may live your life with freedom and happiness."</center>');
    	},
};
