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
        allRoles.set(raw.roles[i], new Role(guild.roles.get(raw.roles[i]), client));
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

      this.user = new User(client.gu_methods().fromRaw(raw.user), client);

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
   * @param {RoleObject|RoleID} role The role to add to the member 
   * @returns {Promise<Member>} Returns a promise and a GuildMember object
   */

  addRole(role) {
    let roleid;
    if (typeof role === 'string') roleid = role;
    if (typeof role === 'object') roleid = role.id;
    return new Promise((res) => {
      request.req('PUT', `/guilds/${this.guild.id}/members/${this.id}/roles/${roleid}`, {}, this.client.token)
        .then(m => {
          setTimeout(res, 100, res(this.client.role_methods().fromRaw(m)));
        });
    });
  }


  /**
   * @description This method removes a role to the member
   * @param {RoleObject|RoleID} role The role to remove from the member 
   * @returns {Promise<Member>} Returns a promise and a GuildMember object
   */

  removeRole(role) {
    let roleid;
    if (typeof role === 'string') roleid = role;
    if (typeof role === 'object') roleid = role.id;
    return new Promise((res) => {
      request.req('DELETE', `/guilds/${this.guild.id}/members/${this.id}/roles/${roleid}`, {}, this.client.token)
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

  ban(opt) {
    return new Promise((res) => {
      request.req('PUT', `/guilds/${this.guild.id}/bans/${this.id}`, {
        days: opt.days || 0,
        reason: opt.reason || ''
      }, _this.token)
        .then(m => {
          setTimeout(res, 100, res(this.client.gu_methods().fromRaw(m, this.guild)));
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
      }, _this.token)
        .then(m => {
          setTimeout(res, 100, res(this.client.gu_methods().fromRaw(m, this.guild))); // needs fixing here
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
        request.req('POST', `/channels/${this.id}/messages`, {
          embed: embed
        }, this.client.token)
          .then(m => {
            const Message = require('./Message');
            setTimeout(res, 100, res(new Message(this.client.message_methods().fromRaw(m), this.client)));
          }).catch(error => {
            if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
          });  
      } else {
        request.req('POST', `/channels/${this.id}/messages`, {
          nonce: (opt && opt.nonce) || false,
          tts: (opt && opt.tts) || false,
          content: content || null
        }, this.client.token)
          .then(m => {
            const Message = require('./Message');
            setTimeout(res, 100, res(new Message(this.client.message_methods().fromRaw(m), this.client)));          
          }).catch(error => {
            if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
          }); 
      }     
    });
  }

  /**
   * @description This method returns a boolean if the member has a certain permission
   * @param {String} perm The permission eg:
   * 'ADMINISTRATOR'
   * @returns {Boolean}
   */

  hasPermission(perm) {
    if (this.roles.some(r => r.permissions.includes(perm))) return true;
    else return false;
  }
}

module.exports = Member;