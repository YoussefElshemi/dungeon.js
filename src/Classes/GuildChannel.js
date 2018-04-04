const request = require('../Connection');

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
     * The type of channel
     * @type {String}
     */

    this.genre = ['text', 'dm', 'voice', 'group_dm', 'category'][raw.type];
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
   */

  setName(newname) {
    return new Promise((res) => {
      request.req('PATCH', `/channels/${this.id}`, {
        name: newname
      }, this.client.token).then(m => {
        const GuildChannel = require('./GuildChannel');
        const TextChannel = require('./TextChannel');
        const VoiceChannel = require('./VoiceChannel');
        if (this.genre === 'text') return setTimeout(res, 100, res(new TextChannel(c, this.client)));
        if (this.genre === 'voice') return setTimeout(res, 100, res(new VoiceChannel(c, this.client)));
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
      }, this.client.token).then(m => {
        const GuildChannel = require('./GuildChannel');
        const TextChannel = require('./TextChannel');
        const VoiceChannel = require('./VoiceChannel');
        if (this.genre === 'text') return setTimeout(res, 100, res(new TextChannel(c, this.client)));
        if (this.genre === 'voice') return setTimeout(res, 100, res(new VoiceChannel(c, this.client)));
        setTimeout(res, 100, res(new GuildChannel(m, this.client)));  
      });
    });
  }

  /**
   * @description Sets the parent of the channel
   * @param {Snowflake} setParent The parent channel or parent channel id
   * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
   */

  setParent(newparent) {
    let parent;
    if (typeof newparent === 'string') parent = newparent;
    if (typeof newparent === 'object') parent = newparent.id;
    return new Promise((res) => {
      request.req('PATCH', `/channels/${this.id}`, {
        parent_id: parent
      }, this.client.token).then(m => {
        const GuildChannel = require('./GuildChannel');
        const TextChannel = require('./TextChannel');
        const VoiceChannel = require('./VoiceChannel');
        if (this.genre === 'text') return setTimeout(res, 100, res(new TextChannel(c, this.client)));
        if (this.genre === 'voice') return setTimeout(res, 100, res(new VoiceChannel(c, this.client)));
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
        .then(m => {
          const GuildChannel = require('./GuildChannel');
          const TextChannel = require('./TextChannel');
          const VoiceChannel = require('./VoiceChannel');
          if (this.genre === 'text') return setTimeout(res, 100, res(new TextChannel(c, this.client)));
          if (this.genre === 'voice') return setTimeout(res, 100, res(new VoiceChannel(c, this.client)));
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
        .then(m => {
          const GuildChannel = require('./GuildChannel');
          const TextChannel = require('./TextChannel');
          const VoiceChannel = require('./VoiceChannel');
          if (this.genre === 'text') return setTimeout(res, 100, res(new TextChannel(c, this.client)));
          if (this.genre === 'voice') return setTimeout(res, 100, res(new VoiceChannel(c, this.client)));
          setTimeout(res, 100, res(new GuildChannel(m, this.client)));   
        });
    });
  }
  
}

module.exports = GuildChannel;