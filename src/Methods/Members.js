const request = require("../Connection");

module.exports = function () {
  const _this = this;

  return {
    fromRaw: function (raw, guild) {
      raw.tag = `${raw.username}#${raw.discriminator}`;

      console.log(raw);

      raw.addRole = function (role) {
        let roleid;
        if (typeof role === "string") roleid = role;
        if (typeof role === "object") roleid = role.id;
        return new Promise((res) => {
          request.req("PUT", `/guilds/${guild.id}/members/${raw.id}/roles/${roleid}`, {}, _this.token)
            .then(m => {
              setTimeout(res, 100, _this.role_methods().fromRaw(m));
            });
        });
      };

      raw.removeRole = function (role) {
        let roleid;
        if (typeof role === "string") roleid = role;
        if (typeof role === "object") roleid = role.id;
        return new Promise((res) => {
          request.req("DELETE", `/guilds/${guild.id}/members/${raw.id}/roles/${roleid}`, {}, _this.token)
            .then(m => {
              setTimeout(res, 100, _this.role_methods().fromRaw(m));
            });
        });
      };

      raw.ban = function (opt) {
        return new Promise((res) => {
          request.req("PUT", `/guilds/${guild.id}/bans/${raw.id}`, {
              days: opt.days || 0,
              reason: opt.reason || ""
            }, _this.token)
            .then(m => {
              setTimeout(res, 100, res(_this.gu_methods().fromRaw(m, m.guild.id)));
            });
        });
      };
      raw.unban = function (opt) {
        return new Promise((res) => {
          request.req("DELETE", `/guilds/${guild.id}/bans/${raw.id}`, {}, _this.token)
            .then(m => {
              setTimeout(res, 100, res(_this.gu_methods().fromRaw(m, m.guild.id)));
            });
        });
      };

      raw.kick = function (opt) {
        return new Promise((res) => {
          request.req("DELETE", `/guilds/${guild.id}/members/${raw.id}`, {
              reason: opt.reason || ""
            }, _this.token)
            .then(m => {
              setTimeout(res, 100, res(_this.gu_methods().fromRaw(m, m.guild.id)));
            });
        });
      };

      /*raw.addRole = function(id) {
        request.re

      }*/

      /**
       * @description This method will send a mssage to the channel specified
       * @param {String|Object} [content] The string if it's a normal message or object if it's a richembed
       * @param {Object} [opt = {}] The options, nonce and tts
       * @returns {Promise<Message>} Returns a promise and discord message
       * @example
       * msg.channel.send({title: "Ping!", body: "This User Was Pinged!", color: 0x00AE86});
       * msg.channel.send("Hi!", {tts: true});
       */

      raw.send = function (content, opt = {}) {
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

      raw.avatarURL = function (options) {
        if (options) {
          return `https://cdn.discordapp.com/avatars/${raw.id}/${raw.avatar}.${options.format || "png"}${options.size ? `?size=${options.size}` : ""}`;
        } else {
          return `https://cdn.discordapp.com/avatars/${raw.id}/${raw.avatar}.png`;
        }
      };

      return raw;
    }
  };
};
