var request = require("../Connection");

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
          request.req("POST", `/guilds/${raw.id}/channels`, {
            name: name,
            type: ["text", "dm", "voice", "group_dm", "category"].indexOf(type) || 0,
            bitrate: (type === "voice" && opt && opt.bitrate) || 64,
            user_limit: (type === "voice" && opt && opt.userlimit) || 0,
            permissions: (opt && opt.permissions) || [],
            parent_id: (opt && opt.parent) || null,
            nsfw: (type === "text" && opt && opt.nsfw) || false
          }, _this.token).then(c => {
            res(_this.channel_methods().fromRaw(c));
          }).catch(rej);
        });
      };

      return raw;
    }
  };
};
