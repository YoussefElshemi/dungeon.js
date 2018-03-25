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

      /**
       * @description Sets the name of the channel
       * @param {String} newname The name of the channel
       * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
       */

      raw.setName = function(newname) {
        return new Promise((res) => {
          request.req("PATCH", `/channels/${raw.id}`, {
            name: newname
          }, _this.token).then(m => {
            setTimeout(res, 100, res(_this.channel_methods().fromRaw(m)));
          });
        });
      };

      /**
       * @description Sets the position of the channel
       * @param {Number} position The position of the channel
       * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
       */

      raw.setPosition = function(position) {
        return new Promise((res) => {
          request.req("PATCH", `/channels/${raw.id}`, {
            osition: Number(position)
          }, _this.token).then(m => {
            setTimeout(res, 100, res(_this.channel_methods().fromRaw(m)));
          });
        });
      };

      /**
       * @description Sets the topic of the channel
       * @param {String} newtopic The topic of the channel
       * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
       */

      raw.setTopic = function(newtopic) {
        return new Promise((res) => {
          request.req("PATCH", `/channels/${raw.id}`, {
            topic: newtopic
          }, _this.token).then(m => {
            setTimeout(res, 100, res(_this.channel_methods().fromRaw(m)));
          });
        });
      };

      /**
       * @description Sets the nsfw of the channel
       * @param {Boolean} falseortrue Whether the channel should be nsfw or not
       * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
       */

      raw.setNSFW = function(falseortrue) {
        return new Promise((res) => {
          request.req("PATCH", `/channels/${raw.id}`, {
            nsfw: falseortrue
          }, _this.token).then(m => {
            setTimeout(res, 100, res(_this.channel_methods().fromRaw(m)));
          });
        });
      };

      /**
       * @description Sets the bitrate of the channel
       * @param {Number} bitrate The bitrate of the channel
       * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
       */

      raw.setBitrate = function(bitrate) {
        return new Promise((res) => {
          request.req("PATCH", `/channels/${raw.id}`, {
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
        return new Promise((res) => {
          request.req("PATCH", `/channels/${raw.id}`, {
            user_limit: Number(limit)
          }, _this.token).then(m => {
            setTimeout(res, 100, res(_this.channel_methods().fromRaw(m)));
          });
        });
      };

      /**
       * @description Sets the parent of the channel
       * @param {Snowflake} setParent The id of the parent channel
       * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
       */

      raw.setParent = function(newparent) {
        return new Promise((res) => {
          request.req("PATCH", `/channels/${raw.id}`, {
            parent_id: newparent
          }, _this.token).then(m => {
            setTimeout(res, 100, res(_this.channel_methods().fromRaw(m)));
          });
        });
      };

      /**
       * @description Edits the channel 
       * @param {Object} options Available options: name, position, topic, nsfw, bitrate, userlimit and parent, similar to above methods
       * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
       */

      raw.edit = function(options) {
        return new Promise((res) => {
          request.req("POST", `/guilds/${raw.id}/channels`, 
            {
              name: (options && options.name) || null,
              position: (options && options.position) || null,
              topic: (raw.type === "text" && options && options.topic) || null,
              nsfw: (raw.type === "text" && options && options.nsfw) || null,
              bitrate: (raw.type === "voice" && options && options.bitrate) || null,
              user_limit: (raw.type === "voice" && options && options.userlimit) || null,
              parent_id: ((raw.type === "text" || raw.type === "voice") && options && options.parent) || null  
            }, _this.token)
            .then(m => {
              setTimeout(res, 100, res(_this.channel_methods().fromRaw(m)));  
            });
        });
      };

      /**
       * @description Deletes the channel
       * @returns {Promise<GuildChannel>} Returns a promise and the Guild Channel deleted
       */

      raw.delete = function() {
        return new Promise((res) => {
          request.req("DELETE", `/channels/${raw.id}`, {}, _this.token)
            .then(m => {
              setTimeout(res, 100, res(_this.channel_methods().fromRaw(m)));
            });
        });
      };

      return raw;
    }
  };
};