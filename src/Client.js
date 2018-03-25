const Connect = require("./Connect");

/**
 * This Class is the base client for this API
 */

class Client {
  constructor(token, options) {
    
    /**
     * @type {String}
     */

    this.token = token;

    if (this.length === 0) throw new Error("The first Parameter must be a token!");

    if (typeof this.token !== "string") throw new Error("Token must be a string!");

    //this.Connect(token);
    this.Connect = Connect;
    this.Connect(this.token);
    
    /**
     * @type {Object}
     */

    this.options = options;

    if (options && typeof this.options !== "object") throw new Error("Options must be an object!");

    this._events = {};

    this.amOfGuilds = 0;


  }

  on(event, callback) {
    this._events[event] = callback;
  }
}

module.exports = Client;