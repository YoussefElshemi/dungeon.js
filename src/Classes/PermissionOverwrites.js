const Permissions = require('./Permissions');
const Member = require('./Member');

/**
 * This class represents a channels permission overwrites
 */

class PermissionOverwrites {
  constructor(raw, channel, client) {

    /**
     * The channel the permissions affect
     * @type {GuildChannel}
     */

    this.channel = channel;

    /**
     * The client that is logged in
     * @type {client}
     */

    this.client = client;

    /**
     * The permissions denied
     * @type {Array} 
     */

    this.denied = new Permissions().toArray(raw.deny);

    /**
     * The permissions allowed
     * @type {Array} 
     */

    this.allowed = new Permissions().toArray(raw.allow);

    /**
     * The role that is affected, null if it affects a member
     * @type {Role} 
     */

    this.role = this.channel.guild.roles.get(raw.id) ||	null;

    /**
     * The member that is affected, null if it affects a role
     * @type {Role} 
     */

    this.member = this.channel.guild.members.get(raw.id) ||	null;

    /**
     * The type of overwrite, either 'role' or 'member'
     * @type {String}
     */

    this.type = raw.type;

  }
}

module.exports = PermissionOverwrites;