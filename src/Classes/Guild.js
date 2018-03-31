const request = require('../Connection');
const Invite = require('./Invite');
const Snowflake = require('../util/Snowflake');

/**
 * This class represents a guild object
 */

class Guild {
  constructor(raw, client) {

    /**
     * The client object which is logged in
     * @type {Client}
     */

    this.client = client;

    /**
     * The ID of the guild
     * @type {String}
     */

    this.id = raw.id;

    /**
     * A collection of all the channels in the guild
     * @type {Collection<ID, Channel>}
     */

    this.channels = raw.channels;

    /**
     * The guild's name
     * @type {String}
     */

    this.name = raw.name;

    /**
     * A collection of all the roles in the guild
     * @type {Collection<ID, Role>}
     */

    this.roles = raw.roles;

    /**
     * A collection of all the emojis in the guild
     * @type {Collection<ID, Emoji>}
     */

    this.emojis = raw.emojis;

    /**
     * A collection of all the members in the guild
     * @type {Collection<ID, Emoji>}
     */

    this.members = raw.members;

    /**
     * A collection of all the user's presences in the guild
     * @type {Collection<ID, Presence>}
     */

    this.presences = raw.presences;

    /**
     * A URL to the guild's icon
     * @type {String}
     */

    this.icon = `https://cdn.discordapp.com/icons/${this.id}/${raw.icon}.png`;

    /**
     * The guild owner's ID
     * @type {String}
     */

    this.ownerID = raw.owner_id;

    /**
     * The AFK Channel the guild has set
     * @type {TextChannel}
     */

    this.afkChannel = this.channels.get(raw.afk_channel_id) || null;

    /**
     * The AFK Time in seconds
     */

    this.afkTimeout = raw.afk_timeout || null;

    /**
     * The Verification Level of the guild from 0-4
     * @type {String}
     */

    this.verificationLevel = raw.verification_level;

    /**
     * The guild's system channel
     * @type {TextChannel}
     */

    this.systemChannel = this.channels.get(raw.system_channel_id);

    /**
     * The date the guild was created at
     * @type {Date}
     */

    //this.createdAt = new Date(this.joined_at).toLocaleString();

    /**
     * Whether the guild is considered large by the Discord API
     * @type {Boolean}
     */

    this.large = raw.large;

    /**
     * Whether the guild is available or not
     * @type {Boolean}
     */

    this.available = !raw.unavailable;

    /**
     * The amount of members in the guild
     * @type {Number}
     */

    this.memberSize = raw.member_count;

    /**
     * The timestamp the guild was created at
     * @type {Date}
     */

    this.createdTimestamp = Snowflake.deconstruct(this.id).timestamp;

    /**
     * The date the guild was created at
     * @type {Date}
     */

    this.createdAt = new Date(this.createdTimestamp);
  }


  /**
    * @description This method will create a channel in the guild
    * @param {String} name The name of the channel to create
    * @param {String} type The type of the channel, available ones: text, dm, voice, group_dm, category
    * @param {Object} [opt={}] The options for the channel: bitrate, userLimit, permissions, parent, nsfw
    * @returns {Promise<Channel>} Returns the newly created Discord Channel
    */

  createChannel(name, type, opt = {}) {
    return new Promise((res, rej) => {
      request.req('POST', `/guilds/${this.id}/channels`, {
        name: name,
        type: ['text', 'dm', 'voice', 'group_dm', 'category'].indexOf(type) || 0,
        bitrate: (type === 'voice' && opt && opt.bitrate) || null,
        user_limit: (type === 'voice' && opt && opt.userlimit) || null,
        permissions: (opt && opt.permissions) || [],
        parent_id: (opt && opt.parent) || null,
        nsfw: (type === 'text' && opt && opt.nsfw) || null,
        topic: (type === 'text' && opt && opt.topic) || null
      }, this.client.token).then(c => {
        setTimeout(res, 100, res(this.client.channel_methods().fromRaw(c)));
      }).catch(rej);
    });
  }

  /**
   * @description This method will create a role in the guild
   * @param {String} name The name of the role
   * @param {Object} [opt={}] The options for the role: color, permissions, hoist, mentionable
   * @returns {Promise<Role>} Returns the newly created Discord Role
   */

  createRole(name, opt = {}) {
    return new Promise((res, rej) => {
      request.req('POST', `/guilds/${this.id}/roles`, {
        color: opt.color || 0,
        permissions: opt.permissions || 0,
        name: name,
        hoist: opt.hoist || false,
        mentionable: opt.mentionable || false
      }, this.client.token).then(role => {
        setTimeout(res, 100, res(this.client.role_methods().fromRaw(role)));
      }).catch(rej);
    });
  }

  /**
   * @description Removes members from the guild who have been offline for a certain amount of time
   * @param {Number} days The amount of the days the users are required to be offline to be kicked
   * @returns {Promise<Guild>} The guild in which the prune method was performed on
   */

  pruneMembers(days) {
    return new Promise((res, rej) => {
      request.req('POST', `/guilds/${this.id}/prune`, {
        days: days
      }, _this.token).then(prune => {
        setTimeout(res, 100, res(this.client.guild_methods().fromRaw(prune)));
      }).catch(rej);
    });
  }

  /**
   * @description Returns all of the invites from the guild
   * @returns {Promise<Invite>} An array of all of the invites
    */

  fetchInvites() {
    return new Promise((res, rej) => {
      request.req('GET', `/guilds/${this.id}/invites`, {}, this.client.token).then(invites => {
        const invite_methods = invites.map(i => new Invite(this.client.invite_methods().fromRaw(i), this.client));
        setTimeout(res, 100, res(invite_methods));
      }).catch(rej);
    });
  }

  /**
   * @description Returns all members of the guild if not cached
   * @returns {Promise<Member>} An array of all members
   */

  fetchMembers() {
    return new Promise((res, rej) => {
      request.req('GET', `/guilds/${this.id}/members`, {}, this.client.token).then(members => {
        const member_methods = members.map(i => this.client.gu_methods().fromRaw(i));
        setTimeout(res, 100, res(member_methods));
      }).catch(rej);
    });
  }

  /**
   * @description Returns all users who are banned in the guild
   * @returns {Promise<Member>} An array of all ban items
   */

  fetchBans() {
    return new Promise((res, rej) => {
      request.req('GET', `/guilds/${this.id}/bans`, {}, this.client.token).then(bans => {
        const ban_methods = bans.map(i => this.client.ban_methods().fromRaw(i));
        setTimeout(res, 100, res(ban_methods, this.id));
      }).catch(rej);
    });
  }

  /**
   * @description Returns all users who are banned in the guild
   * @returns {Promise<Member>} An array of all ban items
   */

  fetchRoles() {
    return new Promise((res, rej) => {
      request.req('GET', `/guilds/${this.id}/roles`, {}, this.client.token).then(roles => {
        const role_methods = roles.map(i => this.client.role_methods().fromRaw(i));
        setTimeout(res, 100, res(role_methods));
      }).catch(rej);
    });
  }

  /**
   * @description Returns the count of members who will be kicked upon prune
   * @returns {Promise<Number>} A number of the amount of members who will be kicked
   */

  testPrune(days) {
    return new Promise((res, rej) => {
      request.req('GET', `/guilds/${this.id}/prune`, {
        days: days
      }, this.client.token).then(gu => {
        setTimeout(res, 100, res(gu.pruned));
      }).catch(rej);
    });
  }
}

module.exports = Guild;
