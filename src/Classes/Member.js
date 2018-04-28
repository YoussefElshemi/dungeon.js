const User = require('../Classes/User');
const Message = require('./Message');
const Guild = require('./Guild');
const request = require('../Connection');
const Collection = require('./Collection');
const Role = require('./Role');

/**
 * This class represents a member object
 */

class Member {
  constructor(raw, guild, client) {
    const allRoles = new Collection();

    if (raw && raw.roles) {
      for (let i = 0; i < raw.roles.length; i++) {
        allRoles.set(raw.roles[i], new Role(guild.roles.get(raw.roles[i]), guild, client));
      }
    }

    if (raw && raw.user) {

      /**
       * The ID of the member
       * @type {Number}
       */

      this.id = raw.user.id;

      /**
       * The user object of the member
       * @type {User}
       */

      this.user = new User(raw.user, client);

      /**
       * The roles that the member has 
       * @type {Collection}
       */

      this.roles = allRoles;

      /**
       * The client object which is logged in
       * @type {Client}
       */

      this.client = client;

      /**
       * The guild object of the member
       * @type {Guild}
       */

      this.guild = guild;

      /**
       * The nickname of the member if there is one
       * @type {String}
       */

      this.nickname = raw.nick;

      /**
       * If the member is muted
       * @type {Boolean}
       */

      this.mute = raw.mute;

      /**
       * If the member is deafened
       * @type {Boolean}
       */

      this.deaf = raw.deaf;

      /**
       * The date of when the member joined the guild
       * @type {Date}
       */

      this.joinedAt = new Date(raw.joined_at);

      /**
       * The timestamp of when the member joined the guild
       * @type {Date}
       */

      this.joinedTimestamp = new Date(raw.joined_at).getTime();

      const perms = [];
      this.roles.forEach(r => {
        for (let x = 0; x < r.permissions.length; x++) {
          perms.push(r.permissions[x]);
        }
      });

      /**
       * The permissions of the member
       * @type {Array}
       */

      this.permissions = perms.filter((v, i, a) => a.indexOf(v) === i);
      
    }

  }

  /**
   * @description This method adds a role to the member
   * @param {RoleResolvable} role The role to add to the member 
   * @returns {Promise<Member>} Returns a promise and a GuildMember object
   */

  addRole(role) {
    return new Promise((res) => {
      request.req('PUT', `/guilds/${this.guild.id}/members/${this.id}/roles/${role.id || role}`, {}, this.client.token)
        .then(m => {
          setTimeout(res, 100, res(this.client.role_methods().fromRaw(m)));
        });
    });
  }


  /**
   * @description This method removes a role to the member
   * @param {RoleResolvable} role The role to remove from the member 
   * @returns {Promise<Member>} Returns a promise and a GuildMember object
   */

  removeRole(role) {
    return new Promise((res) => {
      request.req('DELETE', `/guilds/${this.guild.id}/members/${this.id}/roles/${role.id || role}`, {}, this.client.token)
        .then(m => {
          setTimeout(res, 100, res(this.client.role_methods().fromRaw(m)));
        });
    });
  }


  /**
   * @description This method will ban a member
   * @param {Object} [opt = {}] The options to pass: days, number from 0-7 and reason, string      
   * @returns {Promise<Member>} Returns a promise and a GuildMember object
   */

  ban(opt = {}) {
    return new Promise((res) => {
      request.req('PUT', `/guilds/${this.guild.id}/bans/${this.id}`, {
        'delete-message-days': (opt && opt.days) || 0,
        reason: (opt && opt.reason) || ''
      }, this.client.token)
        .then(m => {
          request.req('GET', `/users/${this.id}`, {}, this.client.token).then(c => {
            setTimeout(res, 100, res(new User(c, this.client)));
          });        
        });
    });
  }

  /**
   * @description This method will kick a member from a guild
   * @param {String} [reason = ""] The options to pass: reason, a string
   * @returns {Promise<Member>} Returns a promise and a GuildMember object
   */

  kick(reason) {
    return new Promise((res) => {
      request.req('DELETE', `/guilds/${this.guild.id}/members/${this.id}`, {
        reason: reason || ''
      }, this.client.token)
        .then(m => {
          setTimeout(res, 100, res(new this.constructor(m, this.guild, this.client)));
        });
    });
  }

  /**
   * @description This method will send a message to the member
   * @param {String|Object} [content] The string if it's a normal message or object if it's a richembed
   * @param {Object} [opt = {}] The options, nonce and tts
   * @returns {Promise<Message>} Returns a promise and discord message
   * @example
   * // Sending an embed
   * Member.send({title: "Ping!", description: "This User Was Pinged!", color: 0x00AE86});
   * @example
   * // Sending a tts message
   * Member.send("Hi!", {tts: true});
   */

  send(content, opt = {}) {
    if (!content) throw new this.client.MissingParameter('You are missing the parameter \'content\'!');
    let embed;
    if (typeof content === 'object') {
      embed = {
        title: (content && content.title) || null,
        description: (content && content.description) || null,
        url: (content && content.url) || null,
        timestamp: (content && content.timestamp) || null,
        color: (content && content.color) || null,
        footer: (content && content.footer) || null,
        author: (content && content.author) || null,
        fields: (content && content.fields) || null
      };
    }
    return new Promise((res) => {
      if (embed) {
        request.req('POST', '/users/@me/channels', {
          recipient_id: this.id
        }, this.client.token).then(c => {
          request.req('POST', `/channels/${c.id}/messages`, {
            embed: embed
          }, this.client.token)
            .then(m => {
              const Message = require('./Message');
              setTimeout(res, 100, res(new Message(m, this.client)));
            }).catch(error => {
              if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
            });  
        });
      } else {
        request.req('POST', '/users/@me/channels', {
          recipient_id: this.id
        }, this.client.token).then(c => {
          request.req('POST', `/channels/${c.id}/messages`, {
            nonce: (opt && opt.nonce) || false,
            tts: (opt && opt.tts) || false,
            content: content || null
          }, this.client.token)
            .then(m => {
              const Message = require('./Message');
              setTimeout(res, 100, res(new Message(m, this.client)));          
            }).catch(error => {
              if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
            }); 
        });
      }     
    });
  }

  /**
   * @description This method checks whether a member has a single permission
   * @param {String} perm The permission
   * @returns {Boolean} True if the member has the permission, else it's false
   * @example 
   * // If the member is an admin
   * member.hasPermission('ADMINISTRATOR');
   * // If the member does, it'll return true else, it'll return false
   */

  hasPermission(perm) {
    if (this.id === this.guild.ownerID) return true;
    if (this.roles.some(r => r.permissions.includes(perm))) return true;
    else return false;
  }

  /**
   * @description This method checks whether a member has multiple permissions
   * @param {Array} perms The array of permissions
   * @returns {Boolean} True if the member has the permissions, else it's false
   * @example 
   * // If the member can send messages and manage messages
   * member.hasPermissions(['SEND_MESSAGES', 'MANAGE_MESSAGES']);
   * // If the member does, it'll return true else, it'll return false
   */

  hasPermissions(perms) {
    if (this.id === this.guild.ownerID) return true;
    const perm = [];
    for (let i = 0; i < perms.length; i++) {
      if (this.roles.some(r => r.permissions.includes(perms[i]))) perm.push(perms.length);
    }
    if (perm && perm.length && perm.length === perms.length) return true;
    else return false;
  }

  /**
   * @description This method sets the nickname of the member
   * @param {String} newnick The new nickname of the member
   * @returns {Promise<Member>} The new member
   */

  setNickname(newnick) {
    return new Promise((res, rej) => {
      request.req('PATCH', `/guilds/${this.guild.id}/members/${this.id}`, {
        nick: newnick
      }, this.client.token).then(c => {
        request.req('GET', `/guilds/${this.guild.id}/members/${this.id}`, {}, this.client.token).then(b => {
          setTimeout(res, 100, res(new this.constructor(b, this.client.guilds.get(this.guild.id), this.client)));
        });
      });
    });
  }

  /**
   * @description This method mutes a member in a voice channel
   * @param {Boolean} boolean True if the member should be muted, and false if they should be unmuted
   * @returns {Promise<Member>} The new member
   */

  setMute(boolean) {
    return new Promise((res, rej) => {
      request.req('PATCH', `/guilds/${this.guild.id}/members/${this.id}`, {
        mute: boolean
      }, this.client.token).then(c => {
        request.req('GET', `/guilds/${this.guild.id}/members/${this.id}`, {}, this.client.token).then(b => {
          setTimeout(res, 100, res(new this.constructor(b, this.client.guilds.get(this.guild.id), this.client)));
        });      
      });
    });
  }

  /**
   * @description This method deafens a member in a voice channel
   * @param {Boolean} boolean True if the member should be deafened, and false if they should be undeafened
   * @returns {Promise<Member>} The new member
   */

  setDeaf(boolean) {
    return new Promise((res, rej) => {
      request.req('PATCH', `/guilds/${this.guild.id}/members/${this.id}`, {
        deaf: boolean
      }, this.client.token).then(c => {
        request.req('GET', `/guilds/${this.guild.id}/members/${this.id}`, {}, this.client.token).then(b => {
          setTimeout(res, 100, res(new this.constructor(b, this.client.guilds.get(this.guild.id), this.client)));
        });      
      });
    });
  }

  /**
   * @description This method sets the voice channel of the member
   * @param {String} id The voice channel's id to move the member to 
   * @returns {Promise<Member>} The new member
   */

  moveCall(id) {
    return new Promise((res, rej) => {
      request.req('PATCH', `/guilds/${this.guild.id}/members/${this.id}`, {
        channel_id: id
      }, this.client.token).then(c => {
        request.req('GET', `/guilds/${this.guild.id}/members/${this.id}`, {}, this.client.token).then(b => {
          setTimeout(res, 100, res(new this.constructor(b, this.client.guilds.get(this.guild.id), this.client)));
        });     
      });
    });
  }

  toString() {
    return `<@${this.id}>`;
  }
}

module.exports = Member;
