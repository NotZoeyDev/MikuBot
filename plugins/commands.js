/*
    Commands Handler
    By @ZoeyLovesMiki, 2019
*/

// Imports
const youtube = require('ytdl-core'), youtubeSearch = require('youtube-search'), Discord = require('discord.js');

// Class to store song's info
class Song {
    constructor(stream, name, channel, poster) {
        this.stream = stream;
        this.name = name;
        this.channel = channel;
        this.poster = poster;
    }
}

// Commands class
class Commands {
    constructor(Miku) {
        this.miku = Miku;

        // Maps of the commands
        this.commands = new Map();

        // Load the commands
        for (let command of Object.getOwnPropertyNames(Commands.prototype)) {
            // Make sure it has the keyword "command"
            if (command.toLocaleLowerCase().includes("command")) {
                // Add the command to the list
                this.add(command.replace("Command", ""), (options) => this[command](options));
            }
        }
    }

    // Add a command
    add(commandName, commandFunction) {
        if (!this.check(commandName))
            this.commands.set(commandName, (options) => commandFunction(options));
        else
            throw `${commandName} already exists!`;
    }

    // Check if commands exists
    check(commandName) {
        return this.commands.has(commandName);
    }

    // Run a command
    run(commandName, options) {
        this.commands.get(commandName)(options);
    }

    /*
        Commands list
    */

    // Add a song (via its url)
    addCommand(options) {
        // Check if we have a param
        if (options.params.length < 1) {
            options.channel.send(`Missing song URL.`);
            return;
        }

        // Check if the user is in a voice chat
        if (!options.message.member.voiceChannel) {
            options.channel.send(`You have to be in a voice chat to use the bot.`);
            return;
        }

        // Miku object access
        let miku = this.miku;

        // Get song info
        youtube.getBasicInfo(options.params[0], { filter: 'audioonly' }, (err, info) => {
            // Check for error
            if (err) {
                options.channel.send(`Invalid URL!`);
                return;
            }

            // Song info
            let songInfo = info.player_response.videoDetails;

            // Get our song stream via youtube
            let songStream = youtube(options.params[0], { filter: "audioonly" });

            // Add that song to the player
            miku.player.check(options.message.member.voiceChannel, () => {
                miku.player.add(new Song(songStream, songInfo.title, options.channel, options.message.member));
            });
        });
    }

    // Search for a song
    playCommand(options) {
        // Check if we have params
        if (options.params.length < 1) {
            options.channel.send(`Missing search query.`);
            return;
        }

        // Search query for Youtube
        let searchQuery = options.params.join(" ").trim();

        // Do the search
        youtubeSearch(searchQuery, {key: this.miku.configs.key}, (err, results) => {
            // Go through each results and find the first song (Filters out playlists)
            for(let r in results) {
                let result = results[r];

                // Check if it's a video
                if(result.kind == "youtube#video") {
                    // Replace the params with the video url
                    options.params = [];
                    options.params.push(result.link);

                    // Simulate adding a song like if it was a command
                    this.addCommand(options);

                    // Exits for loop
                    break;
                }
            }
        });
    }

    // Stop the player
    stopCommand(options) {
        this.miku.player.stop();
    }

    // Skip command
    skipCommand(options) {
        this.miku.player.skip();
    }

    // Volume command
    volumeCommand(options) {
        // Make sure the player is on (Yes, player.player is redundant, fuck off)
        if(!this.miku.player.player.dispatcher) {
            options.channel.send(`There's no music playing currently.`);
            return;
        }

        // Get current volume
        if(options.params.length <= 0) {
            options.channel.send(`The current volume is at ${this.miku.player.player.dispatcher.volume * 100}%!`);
        }

        // Set the volume
        if(isNaN(parseInt(options.params[0]))) {
            options.channel.send(`${options.params[0]} isn't a valid number!`);
            return;
        }

        // Get the volume we're about to set
        let volume = parseInt(options.params[0]);

        // Make sure it's between 0 and 100
        if(volume < 0 || volume > 100) {
            options.channel.send(`The volume has to be set between 0 and 100!`);
            return;
        }

        // Set the volume
        this.miku.player.player.dispatcher.setVolume(volume / 100);
        options.channel.send(`The volume has been set to ${volume}!`);
    }

    // Queue command
    queueCommand(options) {
        // Make sure there's something in the queue (Yes, player.player is redundant, fuck off)
        if(this.miku.player.player.queue.length == 0) {
            options.channel.send(`The queue is currently empty.`);
            return;
        }

        // Queue embed
        let queueEmbed = new Discord.RichEmbed();

        // Set embed data
        queueEmbed.setTitle("Music queue");
        queueEmbed.setDescription("");

        // Add items to the embed
        for(let s in this.miku.player.player.queue) {
            let song = this.miku.player.player.queue[s];
            queueEmbed.description += `${parseInt(s) + 1}. \`${song.name}\` added by \`${song.poster.displayName}\`.\n`;
        }

        // Post the embed
        options.channel.send("", queueEmbed);
    }
}

module.exports = (miku) => new Commands(miku);