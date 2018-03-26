const WebSocket = require("ws");
const event_list = require("./Events");
const Collection = require("./Collection");

module.exports = function (TOKEN) {
  const _this = this;

  function _(t, s) {
    if (_this._events[event_list[t]] != undefined) {
      _this._events[event_list[t]](s);
    }
  }

  _this.token || (_this.token = TOKEN);

  const wss = new WebSocket("wss://gateway.discord.gg/?v=6&encoding=json");

  wss.on("message", m => {
    const message = JSON.parse(m);

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
      const t = message.t;

      if (t == "READY") {
        _this.amOfGuilds = message.d.guilds.length;
        _this.guilds = new Collection();
        _this.channels = new Collection();
        _this.messages = new Collection();
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
        _this.guilds.set(message.d.id, message.d);

        const guild = _this.guild_methods().fromRaw(message.d);

        _this.guilds.set(guild.id, guild);
        for (let i = 0; i < Array.from(guild.channels.keys()).length; i++) {
          const item = guild.channels.get(Array.from(guild.channels.keys())[i]);
          _this.channels.set(item.id, item);
        }

        if (Array.from(_this.guilds.keys()).length == _this.amOfGuilds) {
          _("READY", "");
        }
        if (Array.from(_this.guilds.keys()).length > _this.amOfGuilds) {
          _(t, guild);
        }
      }
      if (t == "CHANNEL_CREATE") {
        const channel = _this.channel_methods().fromRaw(message.d);

        _this.channels.set(channel.id, channel);

        _(t, channel);
      }
      if (t == "CHANNEL_DELETE") {
        const channel = _this.channel_methods().fromRaw(message.d);
        _this.channels.set(channel.id, undefined);

        _(t, channel);
      }
      if (t == "MESSAGE_CREATE") {
        const mesData = _this.message_methods().fromRaw(message.d);
        _this.messages.set(mesData.id, mesData);
        _(t, mesData);
      }
    }
  });
};
