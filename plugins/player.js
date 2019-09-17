/*
    Music player and such
    By @ZoeyLovesMiki, 2019
*/

// Default options for a Music Player
class MusicPlayer {
    constructor() {
        this.queue = [];
        this.dispatcher = null;
        this.connection = null;
        this.volume = 0.25;
    }
}

class Player {
    constructor(Miku) {
        this.miku = Miku;

        // Audio player object
        this.player = new MusicPlayer();
    }

    // Check voice chat
    check(voiceChannel, callback) {
        if(this.player.connection == null) {
            this.miku.self.joinVoiceChannel(voiceChannel.id, (connection) => {
                this.player.connection = connection;
                callback();
            });
        } else {
            callback();
        }
    }

    // Music player stuff
    play() {
        // Is there music remaining ?
        if(this.player.queue && this.player.queue.length == 0) {
            // Stop the player
            this.stop();

            // Cancel the function
            return;
        }

        // Check if the player isn't running already and starts it
        if(!this.player.dispatcher || this.player.dispatcher.destroyed) {
            // Create our dispatcher via the Youtube audio stream
            this.player.dispatcher = this.player.connection.playStream(this.player.queue[0].stream, {volume: this.player.volume});

            // Wait for the song to start
            this.player.dispatcher.on('start', () => {

                // Annonce that the song is playing
                this.player.queue[0].channel.send(`\`${this.player.queue[0].name}\` is now playing!`);

                // Annonce the next song in the queue if there's any
                if(this.player.queue.length > 0) {
                //    this.player.queue[0].channel.send(`\`${this.player.queue[1].name}\` is coming up next!`);
                }

                // Change Miku's activity to "Listeng to X"
                this.miku.self.setListening(this.player.queue[0].name);

                // Wait for the song to be over
                this.player.dispatcher.on('end', () => {
                    // Remove the song that just played from the queue
                    this.player.queue.splice(0, 1);

                    // Play the next song
                    this.play();
                });
            });
        }
    }

    // Add a song
    add(song) {
        // Add the song to the queue
        this.player.queue.push(song);

        // Added to the queue
        if(this.player.queue.length > 1) {
            song.channel.send(`\`${song.name}\` has been added to the queue!`);
        }

        // Play the song
        this.play();
    }

    // Skip a song
    skip() {
        // Make sure a song is on
        if(this.player.dispatcher) {
            this.player.dispatcher.end("skip");
        }
    }

    // Stop the player entirely
    stop() {
        // Reset the player object
        this.player = new MusicPlayer();

        // Disconnect from voice chat
        this.miku.self.leaveVoiceChannel();
        this.miku.self.stopListening();
    }
}

module.exports = (miku) => new Player(miku);