const request = require('../Connection');
const Guild = require('./Guild');
const User = require('./User');

/**
 * This class represents an invite object
 */

class Invite {
  constructor(raw, client) {

    /**
     * The client object which is logged in
     * @type {Client}
     */

    this.client = client;

    /**
     * The invites code
     * @type {String}
     */

    this.code = raw.code;

    /**
     * The guild the invite is in
     * @type {Guild}
     */

    this.guild = this.client.channels.get(raw.channel.id).guild;

    /**
     * The channel the invite was created on
     * @type {GuildChannel}
     */

    this.channel = this.client.channels.get(raw.channel.id);

    /**
     * How many times the invite has been used
     * @type {Number}
     */

    this.uses = raw.uses;

    /**
     * The user that created the invite
     * @type {User}
     */

    this.inviter = new User(raw.inviter, this.client);

    /**
     * The date in which the invite was created at
     * @type {Date}
     */

    this.createdAt = new Date(raw.created_at);

    /**
     * The timestamp in which the invite was created at
     * @type {Date}
     */

    this.createdTimestamp = new Date(raw.created_at).getTime();

    /**
     * The max uses of the invite
     * @type {Number}
     */

    this.maxUses = raw.max_uses;

    /**
     * Whether the invite is temporary or not
     * @type {Boolean}
     */

    this.temporary = raw.temporary;
  }

  /**
   * @description This method will delete an invite
   * @returns {Invite} The deleted invite, but will include a lot of missing properties
   */
  
  delete() {
    return new Promise((res) => {
      request.req('DELETE', `/invites/${this.code}`, {}, this.client.token).then(m => {
        setTimeout(res, 100, res(new this.constructor(m, this.client)));
      });
    });
  }
}

module.exports = Invite;