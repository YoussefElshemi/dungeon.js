const snekfetch = require('snekfetch');
const request = require('../Connection');
const Snowflake = require('../util/Snowflake');
const TextChannel = require('./TextChannel');
const VoiceChannel = require('./VoiceChannel');
const Collection = require('./Collection');
const Role = require('./Role');
const Member = require('./Member');
const User = require('./User');

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

    this.afkChannel = client.channels.get(raw.afk_channel_id) || null;

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

    this.systemChannel = client.channels.get(raw.system_channel_id);

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
   * @description This method bans a member by id
   * @param {String} id The id of the user to ban
   * @param {Object} [opt = {}] The options: days and reason
   * @returns {Promise<User>} The user object of the member that was banned
   */

  ban(id, opt = {}) {
    return new Promise((res, rej) => {
      request.req('PUT', `/guilds/${this.id}/bans/${id}`, {
        'delete-message-days': (opt && opt.days) ||	0,
        reason: (opt && opt.reason) ||	''
      }, this.client.token).then(c => {
        request.req('GET', `/users/${id}`, {}, this.client.token).then(c => {
          setTimeout(res, 100, res(new User(c, this.client)));
        });
      });
    });
  }

  /**
   * @description This method unbans a member by id
   * @returns {Promise<User>} The user object of the member that was unbanned
   */

  unban(id) {
    return new Promise((res, rej) => {
      request.req('DELETE', `/guilds/${this.id}/bans/${id}`, {}, this.client.token).then(c => {
        request.req('GET', `/users/${id}`, {}, this.client.token).then(c => {
          setTimeout(res, 100, res(new User(c, this.client)));
        });
      });
    });
  }

  /**
   * @description This method will kick a member from a guild
   * @param {String} id The id of the member to kick
   * @param {String} [reason = ''] The options to pass: reason, a string
   * @returns {Promise<Member>} Returns a promise and a GuildMember object
   */

  kick(id, reason) {
    return new Promise((res) => {
      request.req('DELETE', `/guilds/${this.id}/members/${id}`, {
        reason: reason || ''
      }, this.client.token)
        .then(m => {
          request.req('GET', `/users/${id}`, {}, this.client.token).then(c => {
            setTimeout(res, 100, res(new User(c, this.client)));
          });        
        });
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
   * @returns {Array} The audit log entries
   */

  fetchAuditLogs(opt = {}) {
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

  /**
   * @description Fetchs the guilds emojis and caches them
   * @returns {Collection} A collection of the emojis
   */

  fetchEmojis() {
    return new Promise((res, rej) => {
      request.req('GET', `/guilds/${this.id}/emojis`, {}, this.client.token).then(c => {
        const emojis = new Collection();
        for (let i = 0; i < c.length; i++) {
          emojis.set(c[i].id, c[i]);
        }
        this.emojis = emojis;
        setTimeout(res, 100, res(emojis));
      });
    });
  }

  /**
   * @description Fetches a single emoji by id and caches it
   * @returns {Object} The emoji
   */

  fetchEmoji(id) {
    return new Promise((res, rej) => {
      request.req('GET', `/guilds/${this.id}/emojis/${id}`, {}, this.client.token).then(c => {
        this.emojis.set(c.id, c);
        setTimeout(res, 100, res(c));
      });
    });
  }

  /**
   * @description This method will create an emoji
   * @param {String} name The name of the emoji
   * @param {String} image The url of the image of the emoji to create
   */

  createEmoji(name, image) {
    return new Promise((res, rej) => {
      snekfetch.get(image).then(c => {
        data = 'data:' + c.headers['content-type'] + ';base64,' + c.body.toString('base64');
        request.req('POST', `/guilds/${this.id}/emojis`, { 
          name: name,
          image: data
        }, this.client.token).then(d => {
          this.emojis.set(d.id, d);
          setTimeout(res, 100, res(d));
        });
      });
    });
  }

  /**
   * @description This method will delete an emoji id
   * @param {String} id The id of the emoji
   * @returns {Object} The deleted emoji
   */

  deleteEmoji(id) {
    return new Promise((res, rej) => {
      request.req('DELETE', `/guilds/${this.id}/emojis/${id}`, {}, this.client.token).then(c => {
        this.emojis.delete(d.id);
        setTimeout(res, 100, res(this));
      });
    });
  }

  /**
   * @description This method will rename a guild
   * @param {String} newname The name of the guild
   * @returns {Promise<Guild>} The edited guild
   */

  setName(newname) {
    return new Promise((res, rej) => {
      request.req('PATCH', `/guilds/${this.id}`, {
        name: newname
      }, this.client.token).then(c => {
        setTimeout(res, 100, res(this));
      });
    });
  }

  /**
   * @description This method will set the region of a guild
   * @param {String} newregion The new region of the guild
   * @returns {Promise<Guild>} The edited guild
   */

  setRegion(newregion) {
    return new Promise((res, rej) => {
      request.req('PATCH', `/guilds/${this.id}`, {
        region: newregion
      }, this.client.token).then(c => {
        setTimeout(res, 100, res(this));
      });
    });
  }

  /**
   * @description This method will set the verification level of a guild
   * @param {String} newlevel The verification level of the guild
   * @returns {Promise<Guild>} The edited guild
   */

  setVerificationLevel(newlevel) {
    return new Promise((res, rej) => {
      request.req('PATCH', `/guilds/${this.id}`, {
        verification_level: newlevel
      }, this.client.token).then(c => {
        setTimeout(res, 100, res(this));
      });
    });
  }

  /**
   * @description This method will set the afk channel of a guild
   * @param {String} id The id of the channel
   * @returns {Promise<Guild>} The edited guild
   */

  setAFKChannel(id) {
    return new Promise((res, rej) => {
      request.req('PATCH', `/guilds/${this.id}`, {
        afk_channel_id: id
      }, this.client.token).then(c => {
        setTimeout(res, 100, res(this));
      });
    });
  }

  /**
   * @description This method will set the afk timeout of a guild
   * @param {Number} time The time of the new afk timeout
   * @returns {Promise<Guild>} The edited guild
   */

  setAFKTimeout(time) {
    return new Promise((res, rej) => {
      request.req('PATCH', `/guilds/${this.id}`, {
        afk_timeout: time
      }, this.client.token).then(c => {
        setTimeout(res, 100, res(this));
      });
    });
  }

  /**
   * @description This method will set the icon of a guild
   * @param {String} url The url of the icon for the guild
   * @returns {Promise<Guild>} The edited guild
   */

  setIcon(url) {
    return new Promise((res, rej) => {
      snekfetch.get(image).then(c => {
        data = 'data:' + c.headers['content-type'] + ';base64,' + c.body.toString('base64');
        request.req('PATCH', `/guilds/${this.id}`, {
          icon: data
        }, this.client.token).then(c => {
          setTimeout(res, 100, res(this));
        });
      }); 
    });
  }

  /**
   * @description This method will set the owner of the guild
   * @param {String} newname The new owner's id of the guild
   * @returns {Promise<Guild>} The edited guild
   */

  setOwner(id) {
    return new Promise((res, rej) => {
      request.req('PATCH', `/guilds/${this.id}`, {
        owner_id: id
      }, this.client.token).then(c => {
        setTimeout(res, 100, res(this));
      });
    });
  }

  /**
   * @description This method will set the splash of a guild
   * @param {String} url The url for the splash of the guild
   * @returns {Promise<Guild>} The edited guild
   */

  setSplash(url) {
    return new Promise((res, rej) => {
      snekfetch.get(image).then(c => {
        data = 'data:' + c.headers['content-type'] + ';base64,' + c.body.toString('base64');
        request.req('PATCH', `/guilds/${this.id}`, {
          splash: data
        }, this.client.token).then(c => {
          setTimeout(res, 100, res(this));
        });
      }); 
    });
  }

  /**
   * @description This method will set the system channel of a guild
   * @param {String} id The id of the channel
   * @returns {Promise<Guild>} The edited guild
   */

  setSystemChannel(id) {
    return new Promise((res, rej) => {
      request.req('PATCH', `/guilds/${this.id}`, {
        system_channel_id: id
      }, this.client.token).then(c => {
        setTimeout(res, 100, res(this));
      });
    });
  }

  /**
   * @description This method will edit the guild
   * @param {String} [obj={}] The options {@link GuildOptions}
   * @returns {Promise<Guild>} The edited guild
   */

  edit(obj = {}) {
    let finalicon;
    if (obj && obj.icon) {
      snekfetch.get(obj.icon).then(c => {
        finalicon = 'data:' + c.headers['content-type'] + ';base64,' + c.body.toString('base64');
      });
    }
    return new Promise((res, rej) => {
      request.req('PATCH', `/guilds/${this.id}`, {
        name: (obj && obj.name) || null,
        region:	(obj && obj.region) || null,
        verification_level: (obj && obj.verificationLevel) || null,
        default_message_notifications: (obj && obj.defaultMessageNotifications) || null,
        explicit_content_filter: (obj && obj.explicitContentFilter) || null,
        afk_channel_id: (obj && obj.afkChannelID) || null,
        afk_timeout: (obj && obj.afkTimeout) || null,
        icon:	finalicon || null,
        owner_id:	(obj && obj.ownerID) || null,
        splash:	(obj && obj.splash)  || null,
        system_channel_id: (obj && obj.systemChannelID) || null
      }, this.client.token).then(c => {
        setTimeout(res, 100, res(this));
      });
    });
  }

  delete() {
    return new Promise((res, rej) => {
      request.req('DELETE', `/guilds/${this.id}`, {}, this.client.token).then(c => {
        setTimeout(res, 100, res(this));
      });
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

/**
 * The options for editting a guild
 * @typedef {Object} GuildOptions
 * @property {String} [name = null] The guild's name
 * @property {String} [region = null] The guild's region
 * @property {Number} [verificationLevel = null] The guild's verification level
 * @property {Number} [defaultMessageNotifications = null] The guild's default message notifications
 * @property {Number} [explicitContentFilter = null] The guild's explicit content filter
 * @property {String} [afkChannelID = null] The guild's afk channel id
 * @property {Number} [aftTimeout = null] The guild's afk timeout
 * @property {String} [icon = null] The guild's icon
 * @property {String} [splash = null] The guild's splash 
 * @property {String} [systemChannelID = null] The guild's system channel id
 */