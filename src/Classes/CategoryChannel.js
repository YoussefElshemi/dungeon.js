const GuildChannel = require('./GuildChannel');

/**
 * This class represents a category channel in a guild
 */

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