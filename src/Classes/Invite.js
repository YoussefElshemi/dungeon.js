const request = require('../Connection');

/**
 * This class represents an invite object
 */

class Invite {
  constructor(raw, client) {
    this.client = client;

    this.code = raw.code;

    this.guild = raw.guild;

    this.channel = raw.channel;
  }
}
