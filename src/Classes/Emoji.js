const Guild = require('./Guild');
const Collection = require('./Collection');
const Role = require('./Role');
const request = require('../Connection');

/**
 * This class represents an emoji
 */

class Emoji {
  constructor(raw, guild, client) {

  /**
   * A collection of roles that are whitelisted to use this emoji
   * @type {Collection}
   */

    this.roles = new Collection();

    for (let i = 0; i < raw.roles.length; i++) {
      this.roles.set(raw.roles[i].id, new Role(raw.roles[i], guild, client));
    }

    /**
     * The name of the emoji
     * @type {String}
     */

    this.name = raw.name;

    /**
     * The client in which is logged in
     * @type {Client}
     */

    this.client = client;

    /**
     * The guild in which the emoji is in 
     * @type {Guild}
     */

    this.guild = guild;

    /**
     * Whether the emoji is managed or not
     * @type {Boolean}
     */

    this.managed = raw.managed;

    /**
     * Whether the emoji is animated or not
     * @type {Boolean}
     */

    this.animated = raw.animated;

    /**
     * The id of the emoji
     * @type {String}
     */

    this.id = raw.id;

    /**
     * Whether the emoji requires colons or not
     * @type {Boolean}
     */

    this.requireColons = raw.require_colons;

    /**
     * The URL of the emoji
     * @type {String}
     */

    this.url = `https://cdn.discordapp.com/emojis/${this.id}${this.animated ? '.gif' : '.png'}`;
  }

  /**
   * @description This method deletes the emoji from the guild
   * @returns {Promise<Emoji>} The emoji that was deleted
   */

  delete() {
    return new Promise((res, rej) => {
      request.req('GET', `/guilds/${this.guild.id}/emojis/${this.id}`, {}, this.client.token).then(d => {
        request.req('DELETE', `/guilds/${this.guild.id}/emojis/${this.id}`, {}, this.client.token).then(c => {
          setTimeout(res, 100, new this.constructor(d, this.guild, this.client));
        });
      });
    });
  }

  toString() {
    return this.animated ? `<:a:${this.name}:${this.id}>`: `<:${this.name}:${this.id}>`;
  }
}

module.exports = Emoji;