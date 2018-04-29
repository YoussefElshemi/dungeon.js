const Permissions = require('./Permissions');
const Collection = require('./Collection');
const request = require('../Connection');

/**
 * This class represents a role of a member
 */

class Role {
  constructor(raw, guild, client) {

    /**
     * The roles ID
     * @type {String}
     */

    this.id = raw.id;

    /**
     * The name of the role
     * @type {String}
     */

    this.name = raw.name;

    /**
     * The permissions of the role
     * @type {Array}
     */

    this.permissions = typeof raw.permissions === 'number' ? new Permissions().toArray(raw.permissions) : raw.permissions.filter(c => c != undefined);

    /**
     * If the role is managed or not
     * @type {Boolean}
     */

    this.managed = raw.managed;

    /**
     * The position of the role
     * @type {Number}
     */

    this.position = raw.position;

    /**
     * If the role is mentionable or not
     * @type {Boolean}
     */

    this.mentionable = raw.mentionable;

    /**
     * If the role is hoisted or not
     * @type {Boolean}
     */

    this.hoisted = raw.hoist;

    /**
     * The color of the role
     * @type {Number}
     */

    this.color = raw.color;

    /**
     * The client that is logged in
     * @type {Client}
     */

    this.client = client;

    /**
     * The guild the role is in
     * @type {Guild}
     */

    this.guild = guild;
  }

  /**
   * @description This delete's the role
   * @returns {Promise<Role>} The role that was deleted
   */

  delete() {
    return new Promise((res, rej) => {
      request.req('DELETE', `/guilds/${this.guild.id}/roles/${this.id}`, {}, this.client.token).then(c => {
        this.guild.roles.delete(this.id);
        setTimeout(res, 100, res(this));
      });
    });
  }

  /**
   * @description This sets the position of the role
   * @param {Number} number The position of the role
   * @returns {Promise<Collection>} A collection of all of the roles as all of their positions update
   */

  setPosition(number) {
    return new Promise((res, rej) => {
      request.req('PATCH', `/guilds/${this.guild.id}/roles`, {
        id: this.id,
        position: number
      }, this.client.token).then(c => {
        const newRoles = c.map(d => new this.constructor(d, this.guild, this.client));
        const returned = new Collection();
        for (let i = 0; i < newRoles.length; i++) {
          returned.set(newRoles[i].id, newRoles[i]);
        }
        this.guild.roles = newRoles;
        setTimeout(res, 100, res(returned));
      });
    });
  }

  toString() {
    return `<@&${this.id}>`;
  }

}

module.exports = Role;

/**
 * @typedef {Object} RoleResolvable
 * @property {String} Snowflake This could be the ID of the role
 * @property {Role} Role This could be an actual role class
 */