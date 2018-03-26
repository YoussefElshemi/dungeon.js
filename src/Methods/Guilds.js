const request = require("../Connection");
const Collection = require("../Collection");

module.exports = function() {
  const _this = this;

  return {
    fromRaw: function(raw) {
      const newChannels = new Collection();

      for (let i = 0; i < raw.channels.length; i++) {
        newChannels.set(raw.channels[i].id, _this.channel_methods().fromRaw(raw.channels[i], raw));
      }
      raw.channels = newChannels;

      /**
       * @description This method will create a channel in the guild
       * @param {String} name The name of the channel to create
       * @param {String} type The type of the channel, available ones: text, dm, voice, group_dm, category
       * @param {Object} opt The options for the channel, available: bitrate, userLimit, permissions, parent, nsfw
       * @returns {Promise<Channel>} Returns the newly created Discord Channel
       */

      raw.createChannel = function(name, type, opt) {
        return new Promise((res, rej) => {
          request.req("POST", `/guilds/${raw.id}/channels`, {
            name: name,
            type: ["text", "dm", "voice", "group_dm", "category"].indexOf(type) || 0,
            bitrate: (type === "voice" && opt && opt.bitrate) || null,
            user_limit: (type === "voice" && opt && opt.userlimit) || null,
            permissions: (opt && opt.permissions) || [],
            parent_id: (opt && opt.parent) || null,
            nsfw: (type === "text" && opt && opt.nsfw) || null,
            topic: (type === "text" && opt && opt.topic) || null
          }, _this.token).then(c => {
            setTimeout(res, 100, res(_this.channel_methods().fromRaw(c)));
            
          }).catch(rej);
        });
      };

      return raw;
    }
  };
};
