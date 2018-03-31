const GuildChannel = require('./GuildChannel');
const request = require('../Connection');
const Collection = require('./Collection');

class CategoryChannel extends GuildChannel {
  constructor(raw, client) {
    super(raw, client);
  }
}
  
module.exports = CategoryChannel;