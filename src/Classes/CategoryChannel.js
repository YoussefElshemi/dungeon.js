const GuildChannel = require('./GuildChannel');

class CategoryChannel extends GuildChannel {
  constructor(raw, guild, client) {
    super(raw, guild, client);

    /**
     * The type of channel
     * @type {String}
     */

    this.type === 'category';
  }
}

module.exports = CategoryChannel;