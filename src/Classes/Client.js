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

    if (this.length === 0) throw new Error('The first Parameter must be a token!');

    if (typeof this.token !== 'string') throw new Error('Token must be a string!');

    this.Connect = Connect;
    this.Connect(this.token);

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