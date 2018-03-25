const request = require("../Connection");

module.exports = function() {
  const _this = this;

  return {
    fromRaw: function(raw, op) {
      raw.type = ["text", "dm", "voice", "group_dm", "category"][raw.type];
      if (raw.type == "category") {
        return _this.cat_methods().fromRaw(raw);
      }

      if (op && op.id) {
        raw.guild_id = op.id;
        raw.guild = _this.guilds.get(op.id);
      }

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
                if (error.status === 403) throw new Error("Missing Permissions");
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
                if (error.status === 403) throw new Error("Missing Permissions");
              }); 
          }     
        });
      };

      /**
       * @description This method will get the most recent message sent
       * @returns {Promise<Message>} Returns a promise and a discord message
       */

      raw.lastMessage = function() {
        return new Promise((res) => {
          request.req("GET",`/channels/${raw.id}/messages/${raw.last_message_id}`, {}, _this.token)
            .then(m => {
              setTimeout(res, 100, res(_this.message_methods().fromRaw(m)));
            })
            .catch(console.log);
        });
      };

      /**
       * @description Will fetch a message if not cached
       * @param {String} id The ID of the message
       * @returns {Promise<Message>} Returns a promise and a discord message
       */

      raw.getMessage = function(id) {
        return new Promise((res) => {
          request.req("GET", `/channels/${raw.id}/messages/${id}`, {}, _this.token)
            .then(m => {
              setTimeout(res, 100, res(_this.message_methods().fromRaw(m)));
            });
        });
      };

      /**
       * @description Will fetch a group of messages if not cached
       * @param {Array} id An array of message snowflakes
       * @returns {Promise<Message>} Returns a promise and (a) discord message(s)
       */

      raw.getMessages = function(id) {
        const messages = [];
        return new Promise((res) => {
          for (let i = 0; i < id.length; i++) {
            request.req("GET", `/channels/${raw.id}/messages/${id[i]}`, {}, _this.token)
              .then(m => {
                messages.push(_this.message_methods().fromRaw(m));
                if (i == id.length - 1) setTimeout(res, 100, res(messages));
              });
          }
        });
      };

      return raw;
    }
  };
};