const Permissions = require('./Permissions');

/**
 * This class represents a role of a member
 */

class Role {
  constructor(raw, client) {

    /**
     * The name of the role
     * @type {String}
     */

    this.name = raw.name;

    /**
     * The permissions of the role
     * @type {Array}
     */

    this.permissions = new Permissions().toArray(raw.permissions);

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
  }

}

module.exports = Role;