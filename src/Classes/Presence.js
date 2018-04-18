const User = require('./User');

/**
 * This class represents a user's presence
 */

class Presence {
  constructor(raw, client) {

    /**
     * The client object that is logged in
     * @type {Client}
     */

    this.client = client;

    /**
     * The user that the presence of updated
     * @type {User}
     */
    this.user = this.client.users.get(raw.user.id);

    /**
     * The status of the user
     * @type {String}
     */

    this.status = raw.status || 'offline';

    const game = { 
      type: ['PLAYING', 'STREAMING', 'LISTENING'][raw.game && raw.game.type] || null, 
      name: (raw.game && raw.game.name) || null,
      timestamps: (raw.game && raw.game.timestamps) || null,
      state: (raw.game && raw.game.state) || null,
      details: (raw.game && raw.game.details) || null,
      assets: (raw.game && raw.game.assets) || null,
      applicationID: (raw.game && raw.game.application_id) || null
    };

    /**
     * The game for the presence
     * @type {Object}
     */

    this.game = game;
  }
}

module.exports = Presence;

/**
 * @typedef {Object} Game
 * @property {String} type The type of game eg: PLAYING, STREAMING AND LISTENING
 * @property {String} name The name of the presence
 * @property {Object} timestamps The timestamps of the presence
 * @property {String} state The state of the presence
 * @property {String} details The details of the presence
 * @property {Object} assets The assets of the presence
 * @property {String} applicationID The application ID of the presence
 */