const request = require('../Connection');
const Snowflake = require('../util/Snowflake');
const TextChannel = require('./TextChannel');
const VoiceChannel = require('./VoiceChannel');
const Collection = require('./Collection');
const Role = require('./Role');
const Member = require('./Member');

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
     * @type {Collection}
     */

    this.channels = raw.channels;

    /**
     * The guild's name
     * @type {String}
     */

    this.name = raw.name;

    /**
     * A collection of all the roles in the guild
     * @type {Collection}
     */

    this.roles = raw.roles;

    /**
     * A collection of all the emojis in the guild
     * @type {Collection}
     */

    this.emojis = raw.emojis;

    /**
     * A collection of all the members in the guild
     * @type {Collection}
     */

    this.members = raw.members;

    /**
     * A collection of all the user's presences in the guild
     * @type {Collection}
     */

    this.presences = raw.presences;

    /**
     * A URL to the guild's icon
     * @type {String}
     */
    this.iconURL = `https://cdn.discordapp.com/icons/${this.id}/${raw.icon}.png`;

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
    * @example 
    * // Creating a text-channel
    * guild.createChannel('general', 'text').then(c => {
    *     c.send('Hi');
    * })
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
        if (type === 'text') return setTimeout(res, 100, res(new TextChannel(c, this, this.client)));
        if (type === 'voice') return setTimeout(res, 100, res(new VoiceChannel(c, this, this.client)));
      }).catch(rej);
    });
  }

  /**
   * @description This method will create a role in the guild
   * @param {String} name The name of the role
   * @param {Object} [opt={}] The options for the role: color, permissions, hoist, mentionable
   * @returns {Promise<Role>} Returns the newly created Discord Role
   * @example 
   * // Creating a role 
   * guild.createRole('role').then(c => {
   *    member.addRole(c);
   * });
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
        setTimeout(res, 100, res(new Role(role, this.client)));
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
      }, this.client.token).then(prune => {
        setTimeout(res, 100, res(this));
      }).catch(rej);
    });
  }

  /**
   * @description Returns all of the invites from the guild
   * @returns {Promise<Collection>} An array of all of the invites
    */

  fetchInvites() {
    return new Promise((res, rej) => {
      request.req('GET', `/guilds/${this.id}/invites`, {}, this.client.token).then(invites => {
        const invite_methods = invites.map(i => this.client.invite_methods().fromRaw(i));
        const returned = new Collection();
        for (let i = 0; i < invite_methods.length; i++) {
          returned.set(invite_methods[i].code, invite_methods[i]);
        }
        setTimeout(res, 100, res(returned));
      }).catch(rej);
    });
  }

  /**
   * @description Returns all members of the guild if not cached
   * @param {Object} [opt = {}] The options: limit and after
   * @returns {Promise<Collection>} A collection of all of the  members
   */

  fetchMembers(opt = {}) {
    return new Promise((res, rej) => {
      request.req('GET', `/guilds/${this.id}/members?limit=${opt.limit || this.memberSize}&after=${opt.after || 0}`, {}, this.client.token).then(members => {
        const returned = new Collection();
        for (let i = 0; i < members.length; i++) {
          returned.set(members[i].user.id, new Member(members[i], this, this.client));
          this.members.set(members[i].user.id, new Member(members[i], this, this.client));
        }        
        setTimeout(res, 100, res(returned));
      }).catch(rej);
    });
  }

  /**
   * @description Fetches the member by id and caches them
   * @param {String} id The ID of the user to fetch
   * @returns {Promise<Member>} A collection of all of the  members
   */

  fetchMember(id) {
    return new Promise((res, rej) => {
      request.req('GET', `/guilds/${this.id}/members/${id}`, {}, this.client.token).then(member => {
        setTimeout(res, 100, res(new Member(member, this, this.client)));
        this.members.set(member.user.id, new Member(member, this, this.client));        
      }).catch(rej);
    });
  }

  /**
   * @description Returns all users who are banned in the guild
   * @returns {Promise<Collection>} A collection of all banned members
   */

  fetchBans() {
    return new Promise((res, rej) => {
      request.req('GET', `/guilds/${this.id}/bans`, {}, this.client.token).then(bans => {
        const ban_methods = bans.map(i => new Member(i, this.guild, this.client));
        const returned = new Collection();
        for (let i = 0; i < ban_methods.length; i++) {
          returned.set(ban_methods[i].id, ban_methods[i]);
        }    
        setTimeout(res, 100, res(returned));
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
        const role_methods = roles.map(i => new Role(i, this.client));
        const returned = new Collection();
        for (let i = 0; i < role_methods.length; i++) {
          returned.set(role_methods[i].id, role_methods[i]);
          this.roles.set(role_methods[i].id, role_methods[i]);
        }
        setTimeout(res, 100, res(returned));
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

  /**
   * @description Fetchs the guilds audit log
   * @param {Object} opt The options for getting the audit logs {@link AuditOptions}
   */

  getAuditLogs(opt = {}) {
    return new Promise((res, rej) => {
      request.req('GET', `/guilds/${this.id}/audit-logs`, {
        user_id: opt.target || null,
        action_type: opt.actionType || null,
        before: opt.before || null,
        limit: opt.limit || null
      }, this.client.token).then(c => {
        setTimeout(res, 100, res(c));
      }).catch(rej);
    });
  }
}

module.exports = Guild;

/**
 * The options for fetching audit logs
 * @typedef {Object} AuditOptions
 * @property {String} [target = null] The target's id (the user that the action was performed on)
 * @property {Number} [actionType = null] The action type {@see https://discordapp.com/developers/docs/resources/audit-log#DOCS_AUDIT_LOG/audit-log-entry-object-audit-log-events}
 * @property {String} [before = null] Filter the log before a certain entry ID
 * @property {Number} [limit = null] How many entries are returned (default 50, minimum 1, maximum 100)
 */