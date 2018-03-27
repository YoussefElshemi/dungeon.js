const request = require("../Connection");

module.exports = function() {
  const _this = this;
  return {
    fromRaw: function(raw) {
      raw.client = _this;
      raw.tag = `${raw.username}#${raw.discriminator}`;
      raw.presence = _this.presences.get(raw.id);


      /**
       * @description Returns the avatar's url of a user
       * @param {Object} [options = {}] The options, format eg. "png" and size, eg. 256
       * @returns {String} The user's avatar as a URL
       */

      raw.avatarURL = function(options) {
        if (options) {
          return `https://cdn.discordapp.com/avatars/${raw.id}/${raw.avatar}.${options.format || "png"}${options.size ? `?size=${options.size}` : ""}`;
        } else {
          return `https://cdn.discordapp.com/avatars/${raw.id}/${raw.avatar}.png`;
        }
      };

      /**
       * @description This method will send a mssage to the channel specified
       * @param {String|Object} [content] The string if it's a normal message or object if it's a richembed
       * @param {Object} [opt = {}] The options, nonce and tts
       * @returns {Promise<Message>} Returns a promise and discord message
       * @example
       * msg.channel.send({title: "Ping!", body: "This User Was Pinged!", color: 0x00AE86});
       * msg.channel.send("Hi!", {tts: true});
       */

      raw.send = function(content, opt = {}) {
        if (!content) throw new _this.MissingParameter("You are missing the parameter 'content'!");
        let embed;
        if (typeof content === "object") {
          embed = {
            title: (content && content.title) || null,
            description: (content && content.body) || null,
            url: (content && content.url) || null,
            timestamp: (content && content.timestamp) || null,
            color: (content && content.color) || null,
            //footer: { }
          };
        }

        return new Promise((res) => {
          if (embed) {
            request.req("POST", `/channels/${raw.id}/messages`, {
              nonce: (opt && opt.nonce) || false,
              tts: (opt && opt.tts) || false,
              embed: embed || null
            }, _this.token)
              .then(m => {
                setTimeout(res, 100, res(_this.message_methods().fromRaw(m)));
              }).catch(error => {
                if (error.status === 403) throw new _this.MissingPermissions("I don't have permissions to perform this action!");
              });  
          } else {
            request.req("POST", `/channels/${raw.id}/messages`, {
              nonce: (opt && opt.nonce) || false,
              tts: (opt && opt.tts) || false,
              content: content || null
            }, _this.token)
              .then(m => {
                setTimeout(res, 100, res(_this.message_methods().fromRaw(m)));
              }).catch(error => {
                if (error.status === 403) throw new _this.MissingPermissions("I don't have permissions to perform this action!");
              }); 
          }     
        });
      };

      return raw;


    }
  };
};
  