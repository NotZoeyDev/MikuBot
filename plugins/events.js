/*
    Discord events
    By @ZoeyLovesMiki, 2019
*/

// Events class
class Events {
    constructor(Miku) {
        this.miku = Miku;

        // Events
        this.miku.client.on('ready', () => this.readyEvent());
        this.miku.client.on('message', (message) => this.messageHandler(message));
    }

    // On ready
    readyEvent() {
        this.miku.self.avatarLoop();
    }

    // On message
    messageHandler(message) {
        // Make sure we're in a server and message isn't from a bot
        if(!message.guild)
            return;

        if(message.author.bot)
            return;

        // Make sure the message starts with the prefix
        if(!message.content.toLowerCase().startsWith("miku"))
            return;

        // Get the "command" for Miku
        let command = message.content.replace("miku", "").trim().split(" ")[0];

        // Make sure the command exists and available
        if(command && this.miku.commands.check(command)) {
            // Parse the params
            let params = message.content.replace(`miku ${command}`, "").trim().split(" ");

            // Clean up the params
            for(let p in params) {
                let param = params[p];

                if(param.trim() == "" || param == "" || param.length == 0) 
                    params.splice(p, 1);
            }

            // Execute the command
            this.miku.commands.run(command, {
                message: message,
                text: message.content,
                channel: message.channel,
                author: message.author,
                params: params
            });
        }
    }
}

module.exports = (miku) => new Events(miku);