const User = require('./User');
const request = require('../Connection');
const Message = require('./Message');

/**
 * This class represents a webhook
 */

class Webhook {
  constructor(raw, client) {

    /**
     * The webhook's token
     * @type {String}
     *
     */
    
    this.token = raw.token;

    /**
     * The webhook's name
     * @type {String}
     */

    this.name = raw.name;

    /**
     * The webhook's channel
     * @type {GuildChannel}
     */

    this.channel = client.channels.get(raw.channel_id);

    /**
     * The webhook's guild
     * @type {Guild}
     */

    this.guild = client.guilds.get(raw.guild_id);

    /**
     * The webhook's id
     * @type {String}
     */

    this.id = raw.id;

    /**
     * The webhook's avatar hash
     * @type {String}
     */

    this.avatar = raw.avatar;

    /**
     * The webhook's user
     * @type {User}
     */

    if (raw.user) this.user = new User(raw.user, client) || null;

    /**
     * The client that is logged in
     * @type {Client}
     */
    
    this.client = client;
  }

  /**
   * @description This method will send a message as a webhook
   * @param {String|Object} content The string if it's a normal message or object if it's a richembed
   * @param {Object} [opt = {}] The options, nonce and tts {@link MessageOptions}
   * @returns {Promise<Webhook>} The webhook used to send the message
   */

  send(content, opt = {}) {
    if (!content) throw new this.client.MissingParameter('You are missing the parameter \'content\'!');
    let embed;
    if (typeof content === 'object') {
      embed = {
        title: (content && content.title) || null,
        description: (content && content.description) || null,
        url: (content && content.url) || null,
        timestamp: (content && content.timestamp) || null,
        color: (content && content.color) || null,
        footer: (content && content.footer) || null,
        author: (content && content.author) || null,
        fields: (content && content.fields) || null
      };
    }
    return new Promise((res) => {
      if (embed) {
        request.req('POST', `/webhooks/${this.id}/${this.token}`, {
          embeds: [embed]
        }, this.client.token)
          .then(m => {
            const Message = require('./Message');
            setTimeout(res, 100, res(this));
          }).catch(error => {
            if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
          });
      } else {
        request.req('POST', `/webhooks/${this.id}/${this.token}`, {
          nonce: (opt && opt.nonce) || false,
          tts: (opt && opt.tts) || false,
          content: content || null
        }, this.client.token)
          .then(m => {
            const Message = require('./Message');
            setTimeout(res, 100, res(this));
          }).catch(error => {
            if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
          });
      }
    });
  }

  /**
   * @description This method deletes a webhook
   * @returns {Promise<Webhook>} The deleted webhook
   */

  delete() { 
    return new Promise((res, rej) => {
      request.req('DELETE', `/webhooks/${this.id}/${this.token}`, {}, this.client.token).then(c => {
        setTimeout(res, 100, res(this));
      });
    });
  }

  /**
   * @description This method edits a webhook
   * @param {Object} opt The options: avatar, name and channel id
   * @returns {Promise<Webhook>} The editted webhook
   */

  edit(opt) {
    return new Promise((res, rej) => {
      let finalicon;
      if (opt && opt.avatar) {
        snekfetch.get(opt.avatar).then(c => {
          finalicon = 'data:' + c.headers['content-type'] + ';base64,' + c.body.toString('base64');
        });
      }
      request.req('PATCH', `/webhooks/${this.id}`, {
        name: (opt && opt.name) || null,
        channel_id: (opt && opt.channelID) || null,
        avatar: finalicon || null,
      }, this.client.token).then(c => {
        setTimeout(res, 100, res(new this.constructor(c, this.client)));
      });
    });
  }
}

module.exports = Webhook;