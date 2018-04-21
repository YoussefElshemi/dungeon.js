const request = require('../Connection');
const Permissions = require('./Permissions');
const Guild = require('./Guild');
const Webhook = require('./Webhook');
const snekfetch = require('snekfetch');
const Collection = require('./Collection');

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
     * The permission overwrites of the channel
     * @type {Array}
     */

    this.permission_overwrites = raw.permission_overwrites;

    /**
     * The guild the channel is in
     * @type {Guild}
     */
    this.guild = guild;
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
        const GuildChannel = require('./GuildChannel');
        const TextChannel = require('./TextChannel');
        const VoiceChannel = require('./VoiceChannel');
        if (this.type === 'text') return setTimeout(res, 100, res(new TextChannel(c, this.client)));
        if (this.type === 'voice') return setTimeout(res, 100, res(new VoiceChannel(c, this.client)));
        setTimeout(res, 100, res(new GuildChannel(m, this.client)));
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
        position: Number(position)
      }, this.client.token).then(c => {
        const GuildChannel = require('./GuildChannel');
        const TextChannel = require('./TextChannel');
        const VoiceChannel = require('./VoiceChannel');
        if (this.type === 'text') return setTimeout(res, 100, res(new TextChannel(c, this.client)));
        if (this.type === 'voice') return setTimeout(res, 100, res(new VoiceChannel(c, this.client)));
        setTimeout(res, 100, res(new GuildChannel(m, this.client)));
      });
    });
  }

  /**
   * @description Sets the parent of the channel
   * @param {String} setParent The parent channel or parent channel id
   * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
   */

  setParent(newparent) {
    let parent;
    if (typeof newparent === 'string') parent = newparent;
    if (typeof newparent === 'object') parent = newparent.id;
    return new Promise((res) => {
      request.req('PATCH', `/channels/${this.id}`, {
        parent_id: parent
      }, this.client.token).then(c => {
        const GuildChannel = require('./GuildChannel');
        const TextChannel = require('./TextChannel');
        const VoiceChannel = require('./VoiceChannel');
        if (this.type === 'text') return setTimeout(res, 100, res(new TextChannel(c, this.client)));
        if (this.type === 'voice') return setTimeout(res, 100, res(new VoiceChannel(c, this.client)));
        setTimeout(res, 100, res(new GuildChannel(m, this.client)));
      });
    });
  }

  /**
   * @description Deletes the channel
   * @returns {Promise<GuildChannel>} Returns a promise and the Guild Channel deleted
   */

  delete() {
    return new Promise((res) => {
      request.req('DELETE', `/channels/${this.id}`, {}, this.client.token)
        .then(c => {
          const GuildChannel = require('./GuildChannel');
          const TextChannel = require('./TextChannel');
          const VoiceChannel = require('./VoiceChannel');
          if (this.type === 'text') return setTimeout(res, 100, res(new TextChannel(c, this.client)));
          if (this.type === 'voice') return setTimeout(res, 100, res(new VoiceChannel(c, this.client)));
          setTimeout(res, 100, res(new GuildChannel(m, this.client)));
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
          const GuildChannel = require('./GuildChannel');
          const TextChannel = require('./TextChannel');
          const VoiceChannel = require('./VoiceChannel');
          if (this.type === 'text') return setTimeout(res, 100, res(new TextChannel(c, this.client)));
          if (this.type === 'voice') return setTimeout(res, 100, res(new VoiceChannel(c, this.client)));
          setTimeout(res, 100, res(new GuildChannel(m, this.client)));
        });
    });
  }

  /**
   * @description Edit permissions of the channels
   * @param {role} RoleOrMember The role or the member to overwrite the permissions
   * @param {Object} opt Available options: Allow (Bitfield of Permissions) and Deny (Bitfield of Permissions)
   */

  editPermissions(RoleOrMember, opt = {}) {
    return new Promise((res) => {
      request.req('PUT', `/channels/${this.id}/permissions/${RoleOrMember.id}`, {
        allow: new Permissions().toBitField(opt.allow) || 0,
        deny: new Permissions().toBitField(opt.deny) || 0,
        type: RoleOrMember.constructor.name.toLowerCase()
      }, this.client.token).then(success => {
        request.req('GET', `/channels/${this.id}`, {}, this.client.token).then(channel => {
          setTImeout(res, 100, res(new this.constructor(channel, this.client)));
        });
      }).catch(error => {
        if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
      });
    });
  }

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
