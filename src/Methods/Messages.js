const request = require("../Connection");

module.exports = function() {
  const _this = this;
  return {
    fromRaw: function(raw) {
      raw.channel = _this.channels.get(raw.channel_id);
      if (raw.channel && raw.channel.guild) {
        raw.guild = raw.channel.guild;
        raw.author = _this.gu_methods().fromRaw(raw.author, raw.guild);
      }

      /**
       * @description This method will send a mssage to the channel specified
       * @param {String} [content] The string to send the message with
       * @returns {Promise<Message>} Returns a promise and discord message
       */

      raw.send = function(content) {
        return new Promise((res) => {
          request.req("POST", `/channels/${raw.channel_id}/messages`, {
            content: content
          }, _this.token).then(m => {
            setTimeout(res, 100, res(_this.message_methods().fromRaw(m)));
          }).catch(error => {
            if (error.status === 403) throw new Error("Missing Permissions");
          });       
        });
      };

      /**
       * @description This method will reply by mentioning the user first
       * @param {String} [content] The string to send the message with
       * @returns {Promise<Message>} Returns a promise and discord message
       */

      raw.reply = function(content) {
        return new Promise((res) => {
          request.req("POST", `/channels/${raw.channel_id}/messages`, {
            content: `<@${raw.author.id}>, ${content}`
          }, _this.token).then(m => {
            setTimeout(res, 100, res(_this.message_methods().fromRaw(m)));
          }).catch(error => {
            if (error.status === 403) throw new Error("Missing Permissions");
          });        
        });
      };

      /**
       * @description This method will delete a message
       * @param {String} [reason = ""] The reason why the message is deleted
       * @returns {Promise<Message>} Returns a promise and the message deleted
       */

      raw.delete = function(reason = "") {
        return new Promise((res) => {
          request.req("DELETE", `/channels/${raw.channel_id}/messages/${raw.id}`, {reason: reason} , _this.token).then(m => {
            setTimeout(res, 100, res(_this.message_methods().fromRaw(m)));
          }).catch(error => {
            if (error.status === 403) throw new Error("Missing Permissions");
          });
        });
      };

      /**
       * @description This method will edit a message sent by the client
       * @param {String} [content] The string to edit the current message with
       * @returns {Promise<Message>} Returns a promise and discord message
       */

      raw.edit = function(newmessage) {
        return new Promise((res) => {
          request.req("PATCH", `/channels/${raw.channel_id}/messages/${raw.id}`, {content: newmessage} , _this.token).then(m => {
            setTimeout(res, 100, res(_this.message_methods().fromRaw(m)));
          }).catch(error => {
            if (error.status === 403) throw new Error("Missing Permissions");
          });
        });
      };

      /**
       * @description This method will pin a discord message in a channel
       * @returns {Promise<Message>} Returns a promise and discord message (pin)
       */

      raw.pin = function() {
        return new Promise((res) => {
          request.req("POST", `/channels/${raw.channel.id}/pins/${raw.id}`, {} , _this.token).then(m => {
            setTimeout(res, 100, res(_this.message_methods().fromRaw(m)));
          }).catch(error => {
            if (error.status === 403) throw new Error("Missing Permissions");
          });
        });
      };

      /**
       * @description This method will unpin a discord message in a channel
       * @returns {Promise<Message>} Returns a promise and discord message (unpinned message)
       */

      raw.unpin = function() {
        return new Promise((res) => {
          request.req("DELETE", `/channels/${raw.channel_id}/pins/${raw.id}`, {} , _this.token).then(m => {
            setTimeout(res, 100, res(_this.message_methods().fromRaw(m)));
          }).catch(error => {
            if (error.status === 403) throw new Error("Missing Permissions");
          });
        });
      };

      /**
       * @description This method will make the client react to a message
       * @param emoji The unicode emoji or the emoji id if it's custom
       */

      raw.react = function(emoji) {
        let reaction;
        if (encodeURI(emoji) !== emoji) reaction = encodeURI(emoji);
        return new Promise((res) => {
          request.req("PUT", `/channels/${raw.channel.id}/messages/${raw.id}/reactions/${reaction}/@me`, {}, _this.token).then(m => {
            setTimeout(res, 100, res(_this.message_methods().fromRaw(m)));
          }).catch(error => {
            if (error.status === 403) throw new Error("Missing Permissions");
          });
        });
      };

      return raw;
    }
  };
};
