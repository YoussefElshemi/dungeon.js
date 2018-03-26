const Connect = require("./Connect");
const request = require("./Connection");
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

    this.Connect = Connect;
    this.Connect(this.token);
    
    /**
     * @type {Object}
     */

    this.options = options;

    if (options && typeof this.options !== "object") throw new Error("Options must be an object!");

    this._events = {};

    this.amOfGuilds = 0;

    this.MissingPermissions = require("./Errors/MissingPermissions");

    this.DiscordAPIError = require("./Errors/DiscordAPIError");

    this.WrongType = require("./Errors/WrongType");

    this.MissingParameter = require("./Errors/MissingParameter");
  }

  user() {
    new Promise((res) => {
      request.req("GET", "./users/@me", {}, this.token).then(m => {
        console.log(m);
        setTimeout(res, 100, res(this.gu_methods().fromRaw(m)));
      });
    });
  }

  on(event, callback) {
    this._events[event] = callback;
  }

  destroy() {
    process.exit();
  }

  getUser(id) {
    return new Promise((res) => {
      request.req("GET", `/users/${id}`, {}, this.token).then(m => {
        setTimeout(res, 100, res(this.gu_methods().fromRaw(m)));
      }).catch(error => {
        if (error.status === 403) throw new Error("Missing Permissions");
      });        
    });
  }
}

module.exports = Client;