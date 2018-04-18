const EventEmitter = require('events');
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
const https = require('https');
const Presence = require('./Presence');

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

    this._events = {};

    this.amOfGuilds = 0;

    this.MissingPermissions = require('../Errors/MissingPermissions');

    this.DiscordAPIError = require('../Errors/DiscordAPIError');

    this.WrongType = require('../Errors/WrongType');

    this.MissingParameter = require('../Errors/MissingParameter');


    const wss = new WebSocket('wss://gateway.discord.gg/?v=6&encoding=json');

    wss.on('message', m => {
      const message = JSON.parse(m);
  
      if (message.op == 10) {
        this.heartbeat_int = message.d.heartbeat_interval;
  
        setInterval(function beginHeartbeat() {
          wss.send(JSON.stringify({
            op: 1,
            d: null
          }));
        }, this.heartbeat_int);
  
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
      if (message.op == 1) {
        wss.send(JSON.stringify({
          op: 1,
          d: null
        }));
      }
      if (message.op == 0) {
        const t = message.t;
        console.log(t);
        this.emit('raw', message);
  
        if (t == 'READY') {
          this.amOfGuilds = message.d.guilds.length;

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
          
          this.guild_methods = require('../Methods/Guilds');
          this.permission_methods = require('../Methods/Permissions');
          this.role_methods = require('../Methods/Roles');
          this.emoji_methods = require('../Methods/Emojis');
          this.cat_methods = require('../Methods/Category');
          this.invite_methods = require('../Methods/Invites');
          this.ban_methods = require('../Methods/Bans');
  
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
  
          this.ping = function ping() {
            const t1 = new Date();
            return new Promise((res, rej) => {
              https.get('https://discordapp.com/api/v6/ping', r => { // not a real endpoint, but works for 404 error response.
                r.on('data' , () => {
                  const t2 = new Date();
                  this.pings.splice(0, 0, t2 - t1);
                  if (this.pings.length == 11) this.pings.pop();
                  this.latency = Math.round((this.pings.reduce((c, p) => c+p, 0)) / this.pings.length);                
                  this.emit('ping', res);
                });
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
          const guildData = this.guild_methods().fromRaw(message.d);
          const guild = new Guild(guildData, this);
          this.guilds.set(guild.id, guild);
  
          for (let i = 0; i < Array.from(guild.channels.keys()).length; i++) {
            const item = guild.channels.get(Array.from(guild.channels.keys())[i]);
            if (item.type === 0) chn = new TextChannel(item, guild, this);
            if (item.type === 2) chn = new VoiceChannel(item, guild, this);
            if (chn) this.channels.set(chn.id, chn);
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
          this.channels.set(chn.id, chn);
          this.emit('channelAdded', chn);
        }
  
        if (t == 'CHANNEL_DELETE') {
          let chn;
          if (message.d.type === 0) chn = new TextChannel(message.d, this);
          if (message.d.type === 2) chn = new VoiceChannel(message.d, this);
          this.channels.delete(chn.id);
          this.emit('channelRemoved', chn);
        }
  
        if (t == 'MESSAGE_CREATE') {
          const msg = new Message(message.d, this);
          this.messages.set(msg.id, msg);
          this.emit('message', msg);      
        }
  
        if (t == 'MESSAGE_REACTION_ADD') {
          const reaction = message.d.emoji;
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
      }
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
   * @param {String} id The ID of the user to fetch;
   */

  getUser(id) {
    return new Promise((res) => {
      request.req('GET', `/users/${id}`, {}, this.token).then(m => {
        setTimeout(res, 100, res(new User(m, this)));
      }).catch(error => {
        if (error.status === 403) throw new Error('Missing Permissions');
      });        
    });
  }
}

module.exports = Client;

/*MapIterator {
  '407673106174443520',
  '407673632492355602',
  '407673703753711616',
  '407680037958189066',
  '407680128747962368',
  '415983484432023583',
  '418892643091611665',
  '419685679233105921',
  '428259877786484737',
  '431109705998532618',
  '431109846851518475',
  '431109855789711361',
  '431110400327680010',
  '431110644662665267',
  '431110801223450634',
  '431111005641244682',
  '431185477484412938',
  '427501045057454092',
  '427501045057454094',
  '427502686628478990',
  '427559950101774346',
  '427560514269478923',
  '427560883162578956',
  '427564367509192724',
  '427570594033434644',
  '427579278394392587',
  '427579495294173202',
  '427581370580074496',
  '429993376331464705',
  '430531604927086603',
  '431068120279678979' }*/