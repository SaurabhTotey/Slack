class ChallengeBot{

    /**
     * A constructor for a ChallengeBot
     * Takes in a token and then initialized class properties as well as
     * Sets bot handlers for events
     */
    constructor(token){
        this.token = token;
        this.isConnected = false;
        this.challenges = {};
        this.currentChallenge = "";
        this.lastTimeChallenging = null;

        var RtmClient = require('@slack/client').RtmClient;
        var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

        this.rtm = new RtmClient(token);
        rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
            console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`);
        });
        rtm.start();

        rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
            this.isConnected = true;
        });
        rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
            try{interpretText(message);}catch(e){}
        });
    }

    /**
     * Takes a message the user enterred and handles any commands they gave
     */
    function interpretText(message){
        //TODO restructure all of below so it isn't all just if statements (eg. move them into their own functions or something)
        args = message.text.split(" ");
        if(args[0] != "@challengebot"){return;}
        if(args[1] == "add"){ //Will add a challenge for the possible selection of challenges that this has
            if(args.length < 4){
                this.rtm.sendMessage("Sorry, but the incorrect amount of parameters were provided for the 'add' command. Correct usage is '@challengebot add [challenge name (only 1 word)] [challenge description]'", message.channel);
                return;
            }
            this.challenges[args[3]] = args.splice(4, args.length).join(" ");
        }else if(args[1] == "remove"){ //Will remove a challenge from the possible selection of challenges this bot has
            this.rtm.sendMessage(this.removeChallenge(args[3]), message.channel);
        }else if(args[1] == "possible"){ //Will list all possible challenges this bot has
            this.rtm.sendMessage(String(Object.keys(this.challenges).join(", ")), message.channel);
        }else if(args[1] == "describe"){ //Will describe a challenge given the name of the challenge
            if(args.length < 3){
                this.rtm.sendMessage("Sorry, but the incorrect amount of parameters were provided for the 'describe' command. Correct usage is '@challengebot describe [challenge name]'", message.channel);
                return;
            }
            this.rtm.sendMessage(this.describeChallenge(args[2]), message.channel);
        }else if(args[1] == "current"){ //Will display or update and then display the current challenge
            if(this.lastTimeChallenging == null || this.lastTimeChallenging < new Date(getYear(), getMonth(), getDate(), 7, 30)){
                this.lastTimeChallenging = new Date(getYear(), getMonth(), getDate(), getHours(), getMinutes());
                var oldChallenge = this.currentChallenge;
                do{
                    this.currentChallenge = Object.keys(this.challenges)[Math.floor(Math.random() * this.challenges.length)];
                }while(this.currentChallenge == oldChallenge);
                this.removeChallenge(oldChallenge);
            }
            this.rtm.sendMessage(this.describeChallenge(this.currentChallenge), message.channel);
        }else{ //Will display what to do to get started with the bot
            this.rtm.sendMessage("Command not understood; use this bot, type out '@challengebot' and then either 'add', 'remove', 'possible', 'describe', or 'current'.", message.channel);
        }
    }

    /**
     * Will attempt to remove a challenge and will return a message based on the success of deleting the challenge
     * Will not delete a challenge if the challenge is the current challenge
     */
    function removeChallenge(challengeName){
        if(challengeName == this.currentChallenge){
            return "The challenge can't be deleted because it is the current challenge.";
        }
        delete this.challenges[challengeName];
        return "The challenge was successfully deleted."
    }

    /**
     * Will, given a challenge name, return a description of the challenge
     */
    function describeChallenge(challengeName){
        return challengeName + ":\n" + this.challenges[challengeName];
    }

}
