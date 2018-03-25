var request = require("../Connection");

module.exports = function() {
  var _this = this;

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

      raw.lastMessage = function(cb) {
        request.req("GET",
          `/channels/${raw.id}/message/${raw.last_message_id}`, {}, _this.token)
          .then(m => {
            cb(_this.message_methods().fromRaw(m));
          })
          .catch(console.log);
      };

      return raw;
    }
  };
};
