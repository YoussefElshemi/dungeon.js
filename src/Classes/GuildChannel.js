const request = require('../Connection');
const Permissions = require('./Permissions');
const Guild = require('./Guild');
const Webhook = require('./Webhook');
const snekfetch = require('snekfetch');
const Collection = require('./Collection');
const PermissionOverwrites = require('./PermissionOverwrites');

/**
 * This class represents any Guild Channel
 */

class GuildChannel {
  constructor(raw, guild, client) {

    /**
     * The ID of the channel
     * @type {String}
     */

    this.id = raw.id;

    /**
     * The client object which is logged in
     * @type {Client}
     */

    this.client = client;

    /**
     * The name of the channel
     * @type {String}
     */

    this.name = raw.name;

    /**
     * The position of the channel on the left-hand side
     * @type {Number}
     */

    this.position = raw.position;

    /**
     * The guild the channel is in
     * @type {Guild}
     */
    this.guild = guild;

    /**
     * The permission overwrites of the channel
     * @type {Collection}
     */

    this.permissionOverwrites = new Collection();


    for (let i = 0; i < raw.permission_overwrites.length; i ++) {
      this.permissionOverwrites.set(raw.permission_overwrites[i].id, new PermissionOverwrites(raw.permission_overwrites[i], this, this.client));
    }
  }

  /**
   * @description Sets the name of the channel
   * @param {String} newname The name of the channel
   * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
   * @example
   * //Naming a channel 'general'
   * channel.setName('general')
   * // This example is for most methods on this constructor
   */

  setName(newname) {
    return new Promise((res) => {
      request.req('PATCH', `/channels/${this.id}`, {
        name: newname
      }, this.client.token).then(c => {
        const CategoryChannel = require('./CategoryChannel');
        const TextChannel = require('./TextChannel');
        const VoiceChannel = require('./VoiceChannel');
        if (this.type === 'text') {
          const channel = new TextChannel(c, this.guild, this.client);
          this.client.channels.set(channel.id, channel);
          this.guild.channels.set(channel.id, channel);
          setTimeout(res, 100, res(channel));
        } else if (this.type === 'voice') {
          const channel = new VoiceChannel(c, this.guild, this.client);
          this.client.channels.set(channel.id, channel);
          this.guild.channels.set(channel.id, channel);
          setTimeout(res, 100, res(channel));        
        } else if (this.type === 'category') {
          const channel = new CategoryChannel(c, this.guild, this.client);
          this.client.channels.set(channel.id, channel);
          this.guild.channels.set(channel.id, channel);
          setTimeout(res, 100, res(channel));
        } else {
          const channel = new this.constructor(c, this.guild, this.client);          
          this.client.channels.set(channel.id, channel);
          this.guild.channels.set(channel.id, channel);
          setTimeout(res, 100, res(channel));
        }
      });
    });
  }

  /**
   * @description Sets the position of the channel
   * @param {Number} position The position of the channel
   * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
   */

  setPosition(position) {
    return new Promise((res) => {
      request.req('PATCH', `/channels/${this.id}`, {
        position: position
      }, this.client.token).then(c => {
        const CategoryChannel = require('./CategoryChannel');
        const TextChannel = require('./TextChannel');
        const VoiceChannel = require('./VoiceChannel');
        if (this.type === 'text') {
          const channel = new TextChannel(c, this.guild, this.client);
          this.client.channels.set(channel.id, channel);
          this.guild.channels.set(channel.id, channel);
          setTimeout(res, 100, res(channel));
        } else if (this.type === 'voice') {
          const channel = new VoiceChannel(c, this.guild, this.client);
          this.client.channels.set(channel.id, channel);
          this.guild.channels.set(channel.id, channel);
          setTimeout(res, 100, res(channel));        
        } else if (this.type === 'category') {
          const channel = new CategoryChannel(c, this.guild, this.client);
          this.client.channels.set(channel.id, channel);
          this.guild.channels.set(channel.id, channel);
          setTimeout(res, 100, res(channel));
        } else {
          const channel = new this.constructor(c, this.guild, this.client);          
          this.client.channels.set(channel.id, channel);
          this.guild.channels.set(channel.id, channel);
          setTimeout(res, 100, res(channel));
        }
      });
    });
  }

  /**
   * @description Sets the parent of the channel
   * @param {GuildChannelResolvable} newparent The parent channel
   * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
   */

  setParent(newparent) {
    return new Promise((res, rej) => {
      request.req('PATCH', `/channels/${this.id}`, {
        parent_id: newparent
      }, this.client.token).then(c => {
        const CategoryChannel = require('./CategoryChannel');
        const TextChannel = require('./TextChannel');
        const VoiceChannel = require('./VoiceChannel');
        if (this.type === 'text') {
          const channel = new TextChannel(c, this.guild, this.client);
          this.client.channels.set(channel.id, channel);
          this.guild.channels.set(channel.id, channel);
          setTimeout(res, 100, res(channel));
        } else if (this.type === 'voice') {
          const channel = new VoiceChannel(c, this.guild, this.client);
          this.client.channels.set(channel.id, channel);
          this.guild.channels.set(channel.id, channel);
          setTimeout(res, 100, res(channel));        
        } else if (this.type === 'category') {
          const channel = new CategoryChannel(c, this.guild, this.client);
          this.client.channels.set(channel.id, channel);
          this.guild.channels.set(channel.id, channel);
          setTimeout(res, 100, res(channel));
        } else {
          const channel = new this.constructor(c, this.guild, this.client);          
          this.client.channels.set(channel.id, channel);
          this.guild.channels.set(channel.id, channel);
          setTimeout(res, 100, res(channel));
        }
      });
    });
  }

  /**
   * @description Deletes the channel
   * @returns {Promise<GuildChannel>} Returns a promise and the Guild Channel deleted
   */

  delete() {
    return new Promise((res) => {
      request.req('DELETE', `/channels/${this.id}`, {}, this.client.token).then(c => {
        this.guild.channels.delete(this.id);
        this.client.channels.delete(this.id);
        const CategoryChannel = require('./CategoryChannel');
        const TextChannel = require('./TextChannel');
        const VoiceChannel = require('./VoiceChannel');
        if (this.type === 'text') {
          const channel = new TextChannel(c, this.guild, this.client);
          setTimeout(res, 100, res(channel));
        } else if (this.type === 'voice') {
          const channel = new VoiceChannel(c, this.guild, this.client);
          setTimeout(res, 100, res(channel));        
        } else if (this.type === 'category') {
          const channel = new CategoryChannel(c, this.guild, this.client);
          setTimeout(res, 100, res(channel));
        } else {
          const channel = new this.constructor(c, this.guild, this.client);          
          setTimeout(res, 100, res(channel));
        }
      });
    });
  }

  /**
   * @description Edits the channel
   * @param {Object} options Available options: name, position, topic, nsfw, bitrate, userlimit and parent, similar to above methods
   * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
   */

  edit(options) {
    return new Promise((res) => {
      request.req('POST', `/guilds/${this.id}/channels`,
        {
          name: (options && options.name) || null,
          position: (options && options.position) || null,
          topic: (this.type === 'text' && options && options.topic) || null,
          nsfw: (this.type === 'text' && options && options.nsfw) || null,
          bitrate: (this.type === 'voice' && options && options.bitrate) || null,
          user_limit: (this.type === 'voice' && options && options.userlimit) || null,
          parent_id: ((this.type === 'text' || this.type === 'voice') && options && options.parent) || null
        }, this.client.token)
        .then(c => {
          const CategoryChannel = require('./CategoryChannel');
          const TextChannel = require('./TextChannel');
          const VoiceChannel = require('./VoiceChannel');
          if (this.type === 'text') {
            const channel = new TextChannel(c, this.guild, this.client);
            this.client.channels.set(channel.id, channel);
            this.guild.channels.set(channel.id, channel);
            setTimeout(res, 100, res(channel));
          } else if (this.type === 'voice') {
            const channel = new VoiceChannel(c, this.guild, this.client);
            this.client.channels.set(channel.id, channel);
            this.guild.channels.set(channel.id, channel);
            setTimeout(res, 100, res(channel));        
          } else if (this.type === 'category') {
            const channel = new CategoryChannel(c, this.guild, this.client);
            this.client.channels.set(channel.id, channel);
            this.guild.channels.set(channel.id, channel);
            setTimeout(res, 100, res(channel));
          } else {
            const channel = new this.constructor(c, this.guild, this.client);          
            this.client.channels.set(channel.id, channel);
            this.guild.channels.set(channel.id, channel);
            setTimeout(res, 100, res(channel));
          }
        });
    });
  }

  /**
   * @description Edit permissions of the channels
   * @param {role} RoleOrMember The role or the member to overwrite the permissions
   * @param {Object} opt Available options: Allow (Bitfield of Permissions) and Deny (Bitfield of Permissions)
   * @example 
   * // Here we will stop a member from sending a message in a certain channel
   * guildchannel.editPermissions(message.member, {allow: [], deny: ['SEND_MESSAGES']}).then(c => {
   *    console.log(`Updated permissions for ${message.author.username}, and stopped them from sending messages`);
   * });
   */

  editPermissions(RoleOrMember, opt = {}) {
    return new Promise((res) => {
      request.req('PUT', `/channels/${this.id}/permissions/${RoleOrMember.id}`, {
        allow: new Permissions(opt.allow).toBitField() || 0,
        deny: new Permissions(opt.deny).toBitField() || 0,
        type: RoleOrMember.constructor.name.toLowerCase()
      }, this.client.token).then(success => {
        request.req('GET', `/channels/${this.id}`, {}, this.client.token).then(channel => {
          setTimeout(res, 100, res(new this.constructor(channel, this.guild, this.client)));
        });
      }).catch(error => {
        if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
      });
    });
  }

  /**
   * @description This method creates a webhook
   * @param {String} name The name of webhook
   * @param {String} icon The url of the icon for the webhook
   * @returns {Promise<Webhook>} The created webhook
   */

  createWebhook(name, icon) {
    return new Promise((res, rej) => {
      let finalicon;
      snekfetch.get(icon).then(c => {
        finalicon = 'data:' + c.headers['content-type'] + ';base64,' + c.body.toString('base64');
        request.req('POST' , `/channels/${this.id}/webhooks`, {
          name: name ||	null,
          avatar: finalicon || null
        }, this.client.token).then(d => {
          setTimeout(res, 100, res(new Webhook(d, this.client)));
        });
      });
    });
  } 

  /**
   * @description This method will fetch a guilds webhooks
   * @returns {Promise<Collection>} A collection of fetched webhooks
   */

  fetchWebhooks() {
    return new Promise((res, rej) => {
      request.req('GET', `/channels/${this.id}/webhooks`, {}, this.client.token).then(webhooks => {
        const webhook_methods = webhooks.map(i => new Webhook(i, this.client));
        const returned = new Collection();
        for (let i = 0; i < webhook_methods.length; i++) {
          returned.set(webhook_methods[i].id, webhook_methods[i]);
        }
        setTimeout(res, 100, res(returned));
      });
    });
  }

  /**
   * @description This method fetches a webhook
   * @param {String} id The id of the webhook to fetch
   * @returns {Promise<Webhook>} The fetched webhook
   */

  fetchWebhook(id) {
    return new Promise((res, rej) => {
      request.req('GET', `/webhooks/${id}`, {}, this.client.token).then(i => {
        setTimeout(res, 100, res(new Webhook(i, this.client)));
      });
    });
  }
}

/**
 * The options for making/editing a channel
 * @typedef {Object} ChannelOptions
 * @property {String} [name = null] The name of the channel
 * @property {Number} [position = null] Position of the channel
 * @property {String} [topic = null] The topic of the channel (textchannel only)
 * @property {Boolean} [nsfw = null] If the channel is NSFW or not (textchannel only)
 * @property {Number} [bitrate = null] The bitrate of the channel (voicechannel only)
 * @property {Number} [userlimit = null] The user limit of the channel (voicechannel only)
 * @property {String} [parent = null] The parent channel's ID of the channel
 */


module.exports = GuildChannel;

/**
 * @typedef {Object} GuildChannelResolvable
 * @property {String} Snowflake This could be the ID of the channel
 * @property {GuildChannel} User This could be an actual guildchannel class
 */