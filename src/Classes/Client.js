const Connect = require('../Connect');
const request = require('../Connection');
const https = require('https');

/**
 * This Class is the base client for this API
 */

class Client {
  constructor(token) {
    
    /**
     * @description The token for your client
     * @type {String}
     */

    this.token = token;

    if (this.token && typeof this.token !== 'string') throw new Error('Token must be a string!');

    /**
     * @description This method will log the client user in
     * @param {String} token The client's token
     */

    this.connect = Connect;

    this.connect(this.token);

    this._events = {};

    this.amOfGuilds = 0;

    this.MissingPermissions = require('../Errors/MissingPermissions');

    this.DiscordAPIError = require('../Errors/DiscordAPIError');

    this.WrongType = require('../Errors/WrongType');

    this.MissingParameter = require('../Errors/MissingParameter');

    /**
     * @description An array of pings made by the client 
     * @type {Array}
     */

    this.pings = [];

    /**
     * @description A ping for the client, an average of client#pings
     * @type {Number}
     */

    this.latency;

    /**
     * @description The guilds the client is in
     * @type {Collection}
     */

    this.guilds;

    /**
     * @description The users the client shares guilds with
     * @type {Collection}
     */

    this.users;

    /**
     * @description The client's uptime in ms
     * @type {Number}
     */

    this.uptime;

    /**
     * @description The client's user object
     * @type {User}
     */

    this.user;

    /**
     * @description The channels the client has access to
     * @type {Collection}
     */
  
    this.channels;

    /**
     * @description The messages been sent after the client logged in
     * @type {Collection}
     */

    this.messages;

    /**
     * @description The presences of each user the client shares a guild with
     * @type {Collection}
     */

    this.presences;
  }

  on(event, callback) {
    this._events[event] = callback;
  }

  /**
   * @description Destroys the client process
   */

  destroy() {
    process.exit();
  }

  /**
   * @description If a user isn't cached, this will fetch the user object
   * @param {String} id The ID of the user to fetch;
   * @example 
   * // Fetching a user
   * client.getUser('id').then(c => {
   *    c.send('Test!');
   * })
   */

  getUser(id) {
    return new Promise((res) => {
      request.req('GET', `/users/${id}`, {}, this.token).then(m => {
        setTimeout(res, 100, res(new User(m, this)));
      }).catch(error => {
        if (error.status === 403) throw new Error('Missing Permissions');
      });        
    });
  }
}

module.exports = Client;