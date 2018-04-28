const Webhook = require('./Webhook');
const User = require('./User');
const AuditLogEntry = require('./AuditLogEntry');
const Collection = require('./Collection');

/**
 * This class repesents a guild's audit log
 */

class AuditLog {
  constructor(raw, client) {

    /**
     * The webhooks of the audit log
     * @type {Collection}
     */
    
    this.webhooks = new Collection();

    for (let i = 0; i < raw.webhooks.length; i++) {
      this.webhooks.set(raw.webhooks[i].id, new Webhook(raw.webhooks[i], client));
    }

    /**
     * The users of the audit log
     * @type {Collection}
     */

    this.users = new Collection();

    for (let i = 0; i < raw.users.length; i++) {
      this.users.set(raw.users[i].id, new User(raw.users[i], client));
    }


    /**
     * The entries of the audit log
     * @type {Collection}
     */

    this.entries = new Collection();

    for (let i = 0; i < raw.audit_log_entries.length; i++) {
      this.entries.set(raw.audit_log_entries[i].id, new AuditLogEntry(raw.audit_log_entries[i], client));
    }  

  }
}

module.exports = AuditLog;