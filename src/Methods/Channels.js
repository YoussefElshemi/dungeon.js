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
       * @param {String} [content] The string to send the message with
       * @returns {Promise<Message>} Returns a promise and discord message
       */

      raw.send = function(content) {
        return new Promise((res) => {
          request.req("POST", `/channels/${raw.id}/messages`, {
            content: content
          }, _this.token).then(m => {
            setTimeout(res, 100, res(_this.message_methods().fromRaw(m)));
          }).catch(error => {
            if (error.status === 403) throw new Error("Missing Permissions");
          });       
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
        return new Promise((res) => {
          for (var i = 0; i < id.length; i++) {
            request.req("GET", `/channels/${raw.id}/messages/${id[i]}`, {}, _this.token)
              .then(m => {
                setTimeout(res, 100, res(_this.message_methods().fromRaw(m)));
              });
          }
        });
      };

      return raw;
    }
  };
};