const request = require('../Connection');
const Snowflake = require('../util/Snowflake');

module.exports = function() {
  const _this = this;
  return {
    fromRaw: function(raw) {
      raw.client = _this;
      raw.tag = `${raw.username}#${raw.discriminator}`;
      raw.presence = _this.presences.get(raw.id);
      raw.createdTimestamp = Snowflake.deconstruct(raw.id).timestamp;
      raw.createdAt = new Date(raw.createdTimestamp);
      return raw;

    }
  };
};
  