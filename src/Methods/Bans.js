const request = require('../Connection');

module.exports = function() {
  const _this = this;

  return {
    fromRaw: function(raw, guild) {
      /* raw.lift = function() {
        return new Promise((res, rej) => {
          request.req("DELETE", `/guilds/${guild}/bans/${raw.user.id}`, {}, _this.token).then(() => {
            setTimeout(res, 100, res(_this.ban_methods().fromRaw(raw, guild)));
          }).catch(rej);
        });
      } BUGGED */
      raw.user = _this.user_methods().fromRaw(raw.user);

      return raw;
    }
  };
};
  