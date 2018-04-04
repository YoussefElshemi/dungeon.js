const request = require('../Connection');

module.exports = function() {
  const _this = this;

  return {
    fromRaw: function(raw, op) {
      raw.genre = ['text', 'dm', 'voice', 'group_dm', 'category'][raw.type];

      if (raw.type == 'category') {
        return _this.cat_methods().fromRaw(raw);
      }

      raw.guild = _this.guilds.get(raw.guild_id);

      if (op && op.id) {
        raw.guild_id = op.id;
        raw.guild = _this.guilds.get(op.id);
      }

      /**
       * @description Sets the bitrate of the channel
       * @param {Number} bitrate The bitrate of the channel
       * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
       */

      raw.setBitrate = function(bitrate) {
        if (raw.type !== 'voice') throw new _this.WrongType('This method only available on voice based channels');
        return new Promise((res) => {
          request.req('PATCH', `/channels/${raw.id}`, {
            bitrate: bitrate
          }, _this.token).then(m => {
            setTimeout(res, 100, res(_this.channel_methods().fromRaw(m)));
          });
        });
      };

      /**
       * @description Sets the user limit of the channel
       * @param {Number} limit The user limit of the channel
       * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
       */

      raw.setUserLimit = function(limit) {
        if (raw.type !== 'voice') throw new _this.WrongType('This method only available on voice based channels');
        return new Promise((res) => {
          request.req('PATCH', `/channels/${raw.id}`, {
            user_limit: Number(limit)
          }, _this.token).then(m => {
            setTimeout(res, 100, res(_this.channel_methods().fromRaw(m)));
          });
        });
      };

      return raw;
    }
  };
};