/**
 * This class represents an audit log entry
 */

class AuditLogEntry {
  constructor(raw, client) {

    /**
     * The target id
     * @type {String}
     */

    this.targetID = raw.target_id;

    /**
     * The changes made
     * @type {Array}
     */

    this.changes = raw.changes;

    /**
     * The user who made triggered the entry
     * @type {User}
     */

    this.user = client.users.get(raw.user_id);

    /**
     * The entry's id
     * @type {String}
     */

    this.id = raw.id;

    /**
     * The type of action {@see https://discordapp.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-events}
     * @type {String}
     */

    this.actionType = types.getKeyByValue(raw.action_type);

    /**
     * Additional information
     * @type {Object}
     */

    this.options = raw.options;

    /**
     * The reason if there is one
     * @type {String}
     */

    this.reason = raw.reason;

    /**
     * The client that is logged in 
     * @type {Client}
     */

    this.client = client;
  }
}

module.exports = AuditLogEntry;

const types = {
  'GUILD_UPDATE':	1,
  'CHANNEL_CREATE':	10,
  'CHANNEL_UPDATE':	11,
  'CHANNEL_DELETE':	12,
  'CHANNEL_OVERWRITE_CREATE':	13,
  'CHANNEL_OVERWRITE_UPDATE':	14,
  'CHANNEL_OVERWRITE_DELETE':	15,
  'MEMBER_KICK':	20,
  'MEMBER_PRUNE':	21,
  'MEMBER_BAN_ADD':	22,
  'MEMBER_BAN_REMOVE':	23,
  'MEMBER_UPDATE':	24,
  'MEMBER_ROLE_UPDATE':	25,
  'ROLE_CREATE':	30,
  'ROLE_UPDATE':	31,
  'ROLE_DELETE':	32,
  'INVITE_CREATE':	40,
  'INVITE_UPDATE':	41,
  'INVITE_DELETE':	42,
  'WEBHOOK_CREATE':	50,
  'WEBHOOK_UPDATE':	51,
  'WEBHOOK_DELETE':	52,
  'EMOJI_CREATE':	60,
  'EMOJI_UPDATE':	61,
  'EMOJI_DELETE':	62,
  'MESSAGE_DELETE':	72
};

Object.prototype.getKeyByValue = function(value) {
  for (var prop in this) {
    if (this.hasOwnProperty(prop)) {
      if (this[prop] === value)
        return prop;
    }
  }
};