const User = require('../Classes/User');
const Message = require('../Classes/Message');
const request = require('../Connection');

/**
 * This class represents a member object
 */

class Member {
  constructor(raw, guild, client) {

    /**
     * The ID of the member
     * @type {Number}
     */

    this.id = raw.id;

    /**
     * The user object of the member
     * @type {User}
     */

    this.user = new User(raw, client);

    /**
     * The roles that the member has 
     * @type {Collection<ID, Role>}
     */

    this.roles = raw.roles;

    /**
     * The client object which is logged in
     * @type {Client}
     */

    this.client = client;

    /**
     * The guild object of the member
     * @type {Guild}
     */

    this.guild = raw.guild;

    /**
     * The nickname of the member if there is one
     * @type {String}
     */

    this.nickname = raw.nickname;

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
          setTimeout(res, 100, res(this.client.gu_methods().fromRaw(m, this.guild))); // needs fixing here
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
          setTimeout(res, 100, res(this.client.gu_methods().fromRaw(m, this.guild))); // needs fixing here
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
   * <Member>.send({title: "Ping!", body: "This User Was Pinged!", color: 0x00AE86});
   * <Member>.send("Hi!", {tts: true});
   */

  send(content, opt = {}) {
    if (!content) throw new this.client.MissingParameter('You are missing the parameter \'content\'!');
    let embed;
    if (typeof content === 'object') {
      embed = {
        title: (content && content.title) || null,
        description: (content && content.body) || null,
        url: (content && content.url) || null,
        timestamp: (content && content.timestamp) || null,
        color: (content && content.color) || null,
        //footer: {} 
      };
    }
    return new Promise((res) => {
      if (embed) {
        request.req('POST', `/channels/${this.id}/messages`, {
          nonce: (opt && opt.nonce) || false,
          tts: (opt && opt.tts) || false,
          embed: embed || null
        }, this.client.token)
          .then(m => {
            setTimeout(res, 100, res(new Message(m, this.client)));
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
            setTimeout(res, 100, res(new Message(m, this.client)));
          }).catch(error => {
            if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
          }); 
      }     
    });
  }
}

module.exports = Member;