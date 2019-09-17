/*
    Functions for the bot client
    By @ZoeyLovesMiki, 2019
*/

// Imports
const fs = require('fs');

// Self class
class Self {
    constructor(Miku) {
        this.miku = Miku;
        this.user = () => this.miku.client.user;
    }

    // Start the bot
    start() {
        this.miku.client.login(this.miku.configs.token);
    }

    // Set the current song
    setListening(songName) {
        this.user().setActivity(songName, {type: "LISTENING"});
    }

    // Remove the listening status
    stopListening() {
        this.user().setActivity();
    }

    // Join voice chat
    joinVoiceChannel(voiceChannel, callback) {
        this.miku.client.channels.get(voiceChannel).join()
            .then(connection => callback(connection));
    }

    // Leave voice chat
    leaveVoiceChannel() {
        this.miku.client.voiceConnections.first().disconnect();
    }

    // Loop changing the profile picture
    avatarLoop() {
        // Select a random picture from the pictures folder
        fs.readdir("./pictures", (err, files) => {
            let file = files[Math.floor(Math.random() * files.length)];
            this.miku.client.user.setAvatar(`./pictures/${file}`);
        });

        // Rerun the avatar loop
        setTimeout(() => this.avatarLoop(), 1000*60*10);
    }
}

module.exports = (miku) => new Self(miku);