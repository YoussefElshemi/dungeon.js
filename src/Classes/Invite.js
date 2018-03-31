const request = require('../Connection');

class Invite {
  constructor(raw, client) {
    this.client = client;

    this.code = raw.code;

    this.guild = raw.guild;

    this.channel = raw.channel;
  }

  delete() {
    return new Promise((res, rej) => {
      request.req('DELETE', `/invites/${this.code}`, {}, this.client.token).then(i => {
        var invite = new Invite(i, this.client.token);
        setTimeout(res, 100, res(invite));
      }).catch(rej);
    });
  }
}

module.exports = Invite;