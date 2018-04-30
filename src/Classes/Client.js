const EventEmitter = require('events');
const snekfetch = require('snekfetch');
const request = require('../Connection');
const WebSocket = require('ws');
const Message = require('../Classes/Message');
const Guild = require('../Classes/Guild');
const Collection = require('../Classes/Collection');
const GuildChannel = require('../Classes/GuildChannel');
const TextChannel = require('../Classes/TextChannel');
const VoiceChannel = require('../Classes/VoiceChannel');
const DMChannel = require('../Classes/DMChannel');
const User = require('../Classes/User');
const Presence = require('./Presence');
const Member = require('./Member');
const CategoryChannel = require('./CategoryChannel');
const MessageReaction = require('./MessageReaction');

/**
 * This Class is the base client for this API
 */

class Client extends EventEmitter {
  constructor(token) {
    super();

    /**
     * @type {String}
     */

    this.token = token;

    if (this.length === 0) throw new Error('The first Parameter must be a token!');

    if (typeof this.token !== 'string') throw new Error('Token must be a string!');

    this.amOfGuilds = 0;

    this.MissingPermissions = require('../Errors/MissingPermissions');

    this.DiscordAPIError = require('../Errors/DiscordAPIError');

    this.WrongType = require('../Errors/WrongType');

    this.MissingParameter = require('../Errors/MissingParameter');


    const wss = new WebSocket('wss://gateway.discord.gg/?v=6&encoding=json');

    setInterval(() => {});

    wss.on('message', m => {
      const message = JSON.parse(m);
      if (message.op == 10) {
        this.heartbeat_int = message.d.heartbeat_interval;
        this.sessionID = message.d.session_id;
        this.receivedAck;
        this.awaitingconnection = false;
        this.lastSeq = 0;
        const _this = this;
        setInterval(function beginHeartbeat() {
          wss.send(JSON.stringify({
            op: 1,
            d: null
          }));

          if (_this.receivedAck) {
            _this.receivedAck = false;

            if (_this.awaitingconnection) {
              wss.send(JSON.stringify({
                op: 6,
                d: {
                  token: _this.token,
                  session_id: _this.sessionID,
                  seq: _this.lastSeq
                }
              }));

              _this.awaitingconnection = false;
            }
          } else {
            _this.awaitingconnection = true;
          }
        }, _this.heartbeat_int);

        wss.send(JSON.stringify({
          op: 2,
          d: {
            token: this.token,
            properties: {
              '$os': 'windows',
              '$browser': 'dungeon.js',
              '$device': 'dungeon.js'
            },
            compress: false,
            large_threshold: 250,
            shard: [0, 1],
            presence: {}
          }
        }));
      }
      this.lastSeq = m.s;

      if (message.op == 11) {
        this.receivedACK = true;
      }
      if (message.op == 1) {
        wss.send(JSON.stringify({
          op: 1,
          d: null
        }));
      }
      if (message.op == 0) {
        const t = message.t;
        this.emit('raw', message);

        if (t == 'READY') {
          this.amOfGuilds = message.d.guilds.length;

          /**
            * Used for RESUMEing.
            * @type {String}
            */

          this.sessionID = message.d.session_id;

          /**
           * A collection of all the users the client shares guilds with
           * @type {Collection}
           */

          this.users = new Collection();

          /**
           * A collection of all the guilds the client is in
           * @type {Collection}
           */

          this.guilds = new Collection();

          /**
           * A collection of all the channels the client shares guilds with
           * @type {Collection}
           */

          this.channels = new Collection();

          /**
           * A collection of all of the messages sent when the client was ready
           * @type {Collection}
           */

          this.messages = new Collection();

          /**
           * A collection of all of the presences of the user's the client shares guilds with
           * @type {Collection}
           */

          this.presences = new Collection();

          /**
           * The date when the client logged in
           * @type {Date}
           */

          this.readyTime = new Date();

          /**
           * The pings of the client
           * @type {Array}
           */

          this.pings = [];

          /**
           * The latency of the client, an average of pings
           * @type {Number}
           */

          this.latency = 0;

          /**
           * The client's user object
           * @type {User}
           */

          this.user = new User(message.d.user, this);

          /**
           * A collection of the client's emojis
           * @type {Collection}
           */

          this.emojis = new Collection();

          this.ping = function ping() {
            const t1 = new Date();
            return new Promise((res, rej) => {
              snekfetch.get('https://discordapp.com/api/v6/ping').catch(c => {
                const t2 = new Date();
                this.pings.splice(0, 0, t2 - t1);
                if (this.pings.length == 11) this.pings.pop();
                this.latency = Math.round((this.pings.reduce((c, p) => c + p, 0)));
                this.emit('ping');
              });
            });
          };
          this.ping();

          setInterval(() => {
            this.uptime = new Date() - this.readyTime;
          }, 1);

          setInterval(() => {
            this.ping();
          }, 60000);
        }

        if (t == 'GUILD_CREATE') {
          let chn;
          const guild = new Guild(message.d, this);
          this.guilds.set(guild.id, guild);

          for (let i = 0; i < Array.from(guild.channels.keys()).length; i++) {
            const item = guild.channels.get(Array.from(guild.channels.keys())[i]);
            if (item.type == 0) {
              this.channels.set(item.id, new TextChannel(item, guild, this));
              guild.channels.set(item.id, new TextChannel(item, guild, this));
            } else if (item.type == 2) {
              this.channels.set(item.id, new VoiceChannel(item, guild, this));
              guild.channels.set(item.id, new VoiceChannel(item, guild, this));
            } else if (item.type == 4) {
              this.channels.set(item.id, new CategoryChannel(item, guild, this));
              guild.channels.set(item.id, new CategoryChannel(item, guild, this));
            } else {
              this.channels.set(item.id, item);
              guild.channels.set(item.id, item);
            }
          }

          guild.members.forEach(c => {
            const user = new User(c.user, this);
            this.users.set(user.id, user);
          });

          if (Array.from(this.guilds.keys()).length == this.amOfGuilds) {
            this.emit('ready');
          }
          if (Array.from(this.guilds.keys()).length > this.amOfGuilds) {
            this.emit('guildCreate', guild);
          }
        }

        if (t == 'CHANNEL_CREATE') {
          let chn;
          if (message.d.type === 1) chn = new DMChannel(message.d, this);
          if (message.d.type === 0) chn = new TextChannel(message.d, this.guilds.get(message.d.guild_id), this);
          if (message.d.type === 2) chn = new VoiceChannel(message.d, this.guilds.get(message.d.guild_id), this);
          if (message.d.type === 4) chn = new CategoryChannel(message.d, this.guilds.get(message.d.guild_id), this);

          this.channels.set(chn.id, chn);
          this.emit('channelAdded', chn);
        }

        if (t == 'CHANNEL_DELETE') {
          let chn;
          if (message.d.type === 1) chn = new DMChannel(message.d, this);
          if (message.d.type === 0) chn = new TextChannel(message.d, this.guilds.get(message.d.guild_id), this);
          if (message.d.type === 2) chn = new VoiceChannel(message.d, this.guilds.get(message.d.guild_id), this);
          if (message.d.type === 4) chn = new CategoryChannel(message.d, this.guilds.get(message.d.guild_id), this);
          this.channels.delete(chn.id);
          this.emit('channelRemoved', chn);
        }

        if (t == 'MESSAGE_CREATE') {
          const msg = new Message(message.d, this);
          this.messages.set(msg.id, msg);
          this.emit('message', msg);
        }

        if (t == 'MESSAGE_REACTION_ADD') {
          const reaction = new MessageReaction(message.d, this);
          const user = this.channels.get(message.d.channel_id).guild.members.get(message.d.user_id).user;
          this.emit('messageReactionAdd', reaction, user);
        }
        if (t == 'PRESENCE_UPDATE') {
          const presence = new Presence(message.d, this);
          this.emit('presenceUpdate', presence);
        }

        if (t === 'MESSAGE_DELETE') {
          const msg = this.messages.get(message.d.id) || null;
          this.emit('messageRemoved', msg);
        }

        if (t === 'MESSAGE_UPDATE') {
          if (!message.d.content) return;
          const newmsg = new Message(message.d, this);
          const oldmsg = this.messages.get(message.d.id) || null;
          this.messages.set(newmsg.id, newmsg);
          this.emit('messageUpdated', oldmsg, newmsg);
        }

        if (t == 'TYPING_START') {
          const user = this.users.get(message.d.user_id);
          const channel = this.channels.get(message.d.channel_id);
          this.emit('startTyping', user, channel);
        }

        if (t == 'VOICE_STATE_UPDATE') {
          const member = this.guilds.get(message.d.guild_id).members.get(message.d.user_id) || null;
          const channel = this.guilds.get(message.d.guild_id).channels.get(message.d.channel_id) || null;
          this.emit('voiceStateUpdate', member, channel);
        }

        if (t == 'GUILD_MEMBER_UPDATE') {
          const oldm = this.guilds.get(message.d.guild_id).members.get(message.d.user.id);
          const newm = new Member(message.d, this.guilds.get(message.d.guild_id), this);
          this.emit('guildMemberUpdate', oldm, newm);
        }
      }
    });

    wss.on('close', error => {
      if (error === 4004) throw new Error('Your token is invalid');
    });

  }


  /**
   * @description Destroys the client process
   */

  destroy() {
    process.exit();
  }

  /**
   * @description If a user isn't cached, this will fetch the user object
   * @param {UserResolvable} user The user to fetch
   * @returns {Promise<User>} The user that was fetched
   */

  fetchUser(user) {
    return new Promise((res) => {
      request.req('GET', `/users/${user.id ||	user}`, {}, this.token).then(m => {
        const fetchedUser = new User(m, this);
        this.users.set(fetchedUser.id, user);
        setTimeout(res, 100, res(fetchedUser));
      }).catch(error => {
        if (error.status === 403) throw new Error('Missing Permissions');
      });
    });
  }

  /**
   * @description This method will create a guild and the client will own it
   * @param {String} name The name of the guild
   * @param {Object} [obj = {}] The options for the guild {@link GuildOptions}
   * @returns {Promise<Guild>} The guild created
   */

  createGuild(name, obj = {}) {
    return new Promise((res, rej) => {
      request.req('POST', '/guilds', obj, this.token).then(c => {
        const g = new Guild(c, this);      
        this.guilds.set(g.id, g);
        setTimeout(res, 100, res(g));
      });
    });
  }

  /**
   * @description This method will set the username of the client
   * @param {String} newusername The new username
   * @returns {Promise<User>} The updated user for the client
   */

  setUsername(newusername) {
    return new Promise((res, rej) => {
      request.req('PATCH', '/users/@me', {
        username: newusername
      }, this.token).then(c => {
        const user = new User(c, this);
        this.user = user;
        this.users.set(user.id, user);
        setTimeout(res, 100, res(user));
      });
    });
  }

  /**
   * @description This method will set the avatar of the client
   * @param {String} url The new avatar url
   * @returns {Promise<User>} The updated user for the client
   */

  setAvatar(url) {
    return new Promise((res, rej) => {
      let newavatar;
      snekfetch.get(url).then(c => {
        newavatar = 'data:' + c.headers['content-type'] + ';base64,' + c.body.toString('base64');
        request.req('PATCH', '/users/@me', {
          avatar: newavatar
        }, this.token).then(c => {
          const user = new User(c, this);
          this.user = user;
          this.users.set(user.id, user);
          setTimeout(res, 100, res(user));
        });
      });
    });
  }

  /**
   * @description Fetches all the client's dms
   * @returns {Promise<Collection>} A collection of all of the dms mapped by their ids
   */

  fetchDMs() {
    return new Promise((res, rej) => {
      request.req('GET', '/users/@me/channels', {}, this.token).then(c => {
        const dms = c.map(d => new DMChannel(d, this));
        const returned = new Collection();
        for (let i = 0; i < dms.length; i++) {
          returned.set(dms[i].id, dms[i]);
          this.channels.set(dms[i].id, dms[i]);
        }
        setTimeout(res, 100, res(returned));
      });
    });
  }

  /**
   * @description Fetches the client user's connections
   * @returns {Array} An array of all of the connections
   */

  fetchUserConnections() {
    return new Promise((res, rej) => {
      request.req('GET', '/users/@me/connections', {}, this.token).then(d => {
        setTimeout(res, 100, res(d));
      });
    });
  }
}

module.exports = Client;