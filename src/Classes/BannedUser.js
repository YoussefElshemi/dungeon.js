const User = require('./User');

/**
 * This class represents a banned user
 */

class BannedUser {
  constructor(raw, client) {

    /**
     * The client that is logged in
     * @type {Client}
     */

    this.client = client;

    /**
     * The reason the member was banned
     * @type {String}
     */

    this.reason = raw.reason;

    /**
     * The user that was banned
     * @type {User}
     */

    this.user = new User(raw.user, this.client);
  }
}

module.exports = BannedUser;