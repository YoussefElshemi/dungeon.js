const request = require('../Connection');

class Invite {
  constructor(raw, client) {
    this.client = client;

    this.code = raw.code;

    this.guild = raw.guild;

    this.channel = raw.channel;
  }
  
  delete() {
    return new Promise((res) => {
      request.req('DELETE', `/invites/${this.code}`, {}, this.client.token).then(m => {
        setTimeout(res, 100, res(new Invite(m, this.client)));
      });
    });
  }
}
