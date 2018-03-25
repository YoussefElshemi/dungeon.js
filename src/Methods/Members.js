const request = require("../Connection");

module.exports = function() {
  const _this = this;

  return {
    fromRaw: function(raw, guild) {
      raw.ban = function(opt) {
        request.req("PUT", `/guilds/${guild.id}/bans/${raw.id}`, {
          days: opt.days || 0,
          reason: opt.reason || ""
        }, _this.token);
      };
      raw.kick = function(opt) {
        request.req("DELETE", `/guilds/${guild.id}/members/${raw.id}`, {
          days: opt.days || 0,
          reason: opt.reason || ""
        }, _this.token);
      };
      raw.send = function(message) {
        new Promise((res, rej) => {
          request.req("POST", "/users/@me/channels", {
            recipient_id: raw.id
          }, _this.token).then(c => {
            request.req("POST", `/channels/${c.id}/messages`, {
              content: message
            }, _this.token).then(m => {
              res(_this.message_methods().fromRaw(m));
            }).catch(rej);
          }).catch(rej);
        });
      };
      raw.avatarURL = function(options) {
        if (options) {
          if (options.size && options.format) return `https://cdn.discordapp.com/avatars/${raw.id}/${raw.avatar}.${options.format}?size=${options.size}`;
          if (options.format) return `https://cdn.discordapp.com/avatars/${raw.id}/${raw.avatar}.${options.format}`;
          if (options.size) return `https://cdn.discordapp.com/avatars/${raw.id}/${raw.avatar}.png?size=${options.size}`;
        } else {
          return `https://cdn.discordapp.com/avatars/${raw.id}/${raw.avatar}.png`;
        }
      };

      return raw;
    }
  };
};
