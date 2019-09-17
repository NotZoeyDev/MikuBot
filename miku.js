/*
	MikuBot by @ZoeyLovesMiki, 2019
	Dedicated to Miki, the Miku in my life 💜
*/

// Imports
const Discord = require('discord.js'), fs = require('fs'), path = require('path');

// MikuBot class
new class MikuBot {
	constructor() {
		// Create our Discord client
		this.client = new Discord.Client();

		// Load the configs
		this.configs = require('./config.js');
		
		// Load the plugins
		this.loadPlugins();

		// Start the bot
		this.self.start();
	}

	// Load "plugins" from the plugins folder
	loadPlugins() {
		let pluginsFolder = "./plugins";

		let plugins = fs.readdirSync(pluginsFolder);

		for(let plugin of plugins) {
			this[path.basename(plugin, path.extname(plugin))] = require(`${pluginsFolder}/${plugin}`)(this);
		}
	}
}