const request = require('../Connection');

class Invite {
    constructor(raw, client) {
        this.client = client;

        this.code = raw.code;

        this.guild = raw.guild;

        this.channel = raw.channel;
    }
}
