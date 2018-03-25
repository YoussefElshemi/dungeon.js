//var web = require("./lib/connection.js");
var WebSocket = require("ws");
var event_list = require("./Events");

module.exports = function(TOKEN) {
  var _this = this;

  function _(t, s) {
    if (_this._events[event_list[t]] != undefined) {
      _this._events[event_list[t]](s);
    }
  }

  _this.token || (_this.token = TOKEN);

  var wss = new WebSocket("wss://gateway.discord.gg/?v=6&encoding=json");

  wss.on("message", m => {
    var message = JSON.parse(m);

    if (message.op == 10) {
      _this.heartbeat_int = message.d.heartbeat_interval;


      setInterval(function beginHeartbeat() {
        wss.send(JSON.stringify({
          op: 1,
          d: null
        }));
      }, _this.heartbeat_int);

      wss.send(JSON.stringify({
        op: 2,
        d: {
          token: _this.token,
          properties: {
            "$os": "windows",
            "$browser": "FuckNeko.js",
            "$device": "FuckNeko.js"
          },
          compress: false,
          large_threshold: 250,
          shard: [0, 1],
          presence: {}
        }
      }));
    }
    if (message.op == 1) {
      wss.send(JSON.stringify({
        op: 1,
        d: null
      }));
    }
    if (message.op == 0) {
      var t = message.t;

      if (t == "READY") {
        _this.amOfGuilds = message.d.guilds.length;
        _this.guilds = new Set();
        _this.channels = new Set();
        _this.message_methods = require("./Methods/Messages.js");
        _this.channel_methods = require("./Methods/Channels.js");
        _this.guild_methods = require("./Methods/Guilds.js");
        _this.permission_methods = require("./Methods/Permissions.js");
        _this.role_methods = require("./Methods/Roles.js");
        _this.emoji_methods = require("./Methods/Emojis.js");
        _this.cat_methods = require("./Methods/Category.js");
        _this.gu_methods = require("./Methods/Members.js");
      }

      if (t == "GUILD_CREATE") {
        _this.guilds[message.d.id] = message.d;

        var guild = _this.guild_methods().fromRaw(message.d);

        _this.guilds[guild.id] = guild;

        for (let i = 0; i < Object.keys(guild.channels).length; i++) {
          var item = guild.channels[Object.keys(guild.channels)[i]];

          _this.channels[item.id] = item;
        }

        if (Object.keys(_this.guilds).length == _this.amOfGuilds) {
          _("READY", "");
        }
        if (Object.keys(_this.guilds).length > _this.amOfGuilds) {
          _(t, guild);
        }
      }
      if (t == "CHANNEL_CREATE") {
        const channel = _this.channel_methods().fromRaw(message.d);

        _this.channels[channel.id] = channel;

        _(t, channel);
      }
      if (t == "CHANNEL_DELETE") {
        const channel = _this.channel_methods().fromRaw(message.d);
        _this.channels[channel.id] = undefined;

        _(t, channel);
      }
      if (t == "MESSAGE_CREATE") {
        var mesData = _this.message_methods().fromRaw(message.d);
        _(t, mesData);
      }
    }
  });
};
