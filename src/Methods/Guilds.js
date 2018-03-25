var request = require("../Connect");

module.exports = function() {
  var _this = this;

  return {
    fromRaw: function(raw) {
      const newChannels = new Map();

      for (let i = 0; i < raw.channels.length; i++) {
        newChannels.set(raw.channels[i].id, _this.channel_methods().fromRaw(raw.channels[i], raw));
      }
      raw.channels = newChannels;

      raw.createChannel = function(name, type, opt) {
        return new Promise((res, rej) => {
          request.req("POST", `/guilds/${raw.guild_id}/channels`, {
            name: name,
            type: ["text", "dm", "voice", "group_dm", "category"].indexOf(type) || "",
            bitrate: opt.bitrate || "",
            user_limit: opt.userlimit || "",
            permissions: opt.permissions || "",
            parent_id: opt.parentCat.id || "",
            nsfw: opt.nsfw || false
          }).then(c => {
            res(_this.channel_methods().fromRaw(c));
          }).catch(rej);
        });
      };
      return raw;
    }
  };
};
