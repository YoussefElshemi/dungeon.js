const GuildChannel = require('./GuildChannel');
const request = require('../Connection');
const Collection = require('./Collection');

/**
 * This class represents a Text Channel
 * @extends {GuildChannel}
 */

class TextChannel extends GuildChannel {
  constructor(raw, guild, client) {
    super(raw, guild, client);

    /**
     * The type of channel
     * @type {String}
     */

    this.type = 'text';

    /**
     * This is the ID of the last message in the channel
     * @type {String}
     */

    this.lastMessageID = raw.last_message_id;

    /**
     * Whether the channel is nsfw or not
     * @type {Boolean}
     */

    this.nsfw = raw.nsfw;

    /**
     * The topic of the channel
     * @type {String}
     */

    this.topic = raw.topic;

  }

  /**
   * @description This method will send a message to the channel specified
   * @param {String|Object} content The string if it's a normal message or object if it's a richembed
   * @param {Object} [opt = {}] The options, nonce and tts {@link MessageOptions}
   * @returns {Promise<Message>} Returns a promise and discord message
   * @example
   * // Sending an embed
   * TextChannel.send({ title: "Ping!", description: "This User Was Pinged!", color: 0x00AE86 });
   * @example
   * // Sending a tts message
   * TextChannel.send("Hi!", { tts: true });
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
        request.req('POST', `/channels/${this.id}/messages`, {
          embed: embed
        }, this.client.token)
          .then(m => {
            const Message = require('./Message');
            setTimeout(res, 100, res(new Message(m, this.client)));
          }).catch(error => {
            if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
          });
      } else {
        request.req('POST', `/channels/${this.id}/messages`, {
          nonce: (opt && opt.nonce) || false,
          tts: (opt && opt.tts) || false,
          content: content || null
        }, this.client.token)
          .then(m => {
            const Message = require('./Message');
            setTimeout(res, 100, res(new Message(m, this.client)));
          }).catch(error => {
            if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
          });
      }
    });
  }

  /**
   * @description This method will get the most recent message sent
   * @returns {Promise<Message>} Returns a promise and a discord message
   */

  lastMessage() {
    return new Promise((res) => {
      request.req('GET',`/channels/${this.id}/messages/${this.lastMessageID}`, {}, this.client.token)
        .then(m => {
          const Message = require('./Message');
          setTimeout(res, 100, res(new Message(m, this.client)));
        })
        .catch(error => {
          if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
        });
    });
  }

  /**
   * @description Will fetch a message if not cached
   * @param {String} id The ID of the message
   * @returns {Promise<Message>} Returns a promise and a discord message
   */

  fetchMessage(id) {
    if (!id) throw new this.client.MissingParameter('You are missing the parameter \'snowflake\'!');
    return new Promise((res) => {
      request.req('GET', `/channels/${this.id}/messages/${id}`, {}, this.client.token)
        .then(msg => {
          const Message = require('./Message');
          const m = new Message(msg, this.client);
          setTimeout(res, 100, res(m));
        })
        .catch(error => {
          if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
        });
    });
  }

  /**
   * @description Will fetch a group of messages if not cached
   * @param {Object} opt The options: around, before, after and limit
   * @returns {Promise<Message>} Returns a promise and (a) discord message(s)
   */

  fetchMessages(opt) {
    return new Promise((res) => {
      request.req('GET', `/channels/${this.id}/messages${opt && opt.around ? `?around=${opt && opt.around}`: ''}${opt && opt.before ? `?before=${opt && opt.before}`: ''}${opt && opt.after ? `?around=${opt && opt.around}`: ''}?limit=${opt && opt.limit || 50}`, {}, this.client.token)
        .then(m => {
          const Message = require('./Message');
          const msgs = new Collection();
          for (let i = 0; i < m.length; i++) {
            msgs.set(m[i].id, new Message(m[i], this.client));
          }
          setTimeout(res, 100, res(msgs));
        })
        .catch(error => {
          if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
        });
    });
  }


  /**
   * @description Sets the nsfw of the channel
   * @param {Boolean} boolean Whether the channel should be nsfw or not
   * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
   */

  setNSFW(boolean) {
    return new Promise((res) => {
      request.req('PATCH', `/channels/${this.id}`, {
        nsfw: boolean
      }, this.client.token)
        .then(m => {
          const channel = new this.constructor(m, this.guild, this.client);
          this.guild.channels.set(channel.id, channel);
          this.client.channels.set(channel.id, channel);
          setTimeout(res, 100, res(channel));
        }).catch(error => {
          if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
        });
    });
  }


  /**
   * @description Sets the topic of the channel
   * @param {String} newtopic The topic of the channel
   * @returns {Promise<GuildChannel>} Returns a promise and a Guild Channel
   */

  setTopic(newtopic) {
    return new Promise((res) => {
      request.req('PATCH', `/channels/${this.id}`, {
        topic: newtopic
      }, this.client.token)
        .then(m => {
          const TextChannel = require('./TextChannel');
          const channel = new this.constructor(m, this.guild, this.client);
          this.guild.channels.set(channel.id, channel);
          this.client.channels.set(channel.id, channel);
          setTimeout(res, 100, res(channel));        
        }).catch(error => {
          if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
        });
    });
  }

  /**
   * @description This method will create an invite on the certain channel
   * @param {Object} opt The options: maxAge, maxUses, temp and unique
   * @returns {Promise<Invite>} Returns a promise and an invite
   */

  createInvite(opt) {
    return new Promise((res) => {
      request.req('POST', `/channels/${this.id}/invites`, {
        max_age: (opt && opt.maxAge) || 86400,
        max_uses: (opt && opt.maxUses)  || 0,
        temporary: (opt && opt.temp) || false,
        unique: (opt && opt.unique) || false
      }, this.client.token).then(m => {
        const Invite = require('./Invite.js');
        setTimeout(res, 100, res(new Invite(m, this.client)));
      });
    });
  }

  /**
   * @description This method will bulk delete messages
   * @param {Number} number The number of messages to delete
   */

  bulkDelete(number) {
    return new Promise((res) => {
      this.fetchMessages({limit: number}).then(c => {
        const array = c.map(c => c.id);
        return new Promise((res) => {
          request.req('POST', `/channels/${this.id}/messages/bulk-delete`, { messages: array }, this.client.token)
            .then(d => {
              setTimeout(res, 100, res(c));
            }).catch(error => {
              if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
            });
        });
      });
    });
  }

  /**
   * @description This will make the client type in this channel
   * @param {Nunber} [loops=1] How many loops to make, each loop lasts 10 seconds
   */

  startTyping(loops = 1) {
    return new Promise((res) => {
      for (let i; i < loops; i++) {
        request.req('POST', `/channels/${this.id}/typing`, {}, this.client.token).then(c => {
          setTimeout(res, 100, res(c));
        }).catch(error => {
          if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
        });
      }
    });
  }

  /**
   * @description This will retreive all pinned messages on the channel.
   * @returns {Array} Returns an array of messages
    */

  fetchPins() {
    return new Promise((res) => {
      request.req('GET', `/channels/${this.id}/pins`, {}, this.client.token).then(m => {
        const Message = require('./Message');
        const messages = m.map(c => new Message(c, this.client));
        setTimeout(res, 100, res(messages));
      }).catch(error => {
        if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
      });
    });
  }

  /**
   * @description Will add a pinned message to the channel.
   * @param {MessageResolvable} message The message to pin
   * @returns {Message} The messages that was pinned
   */

  pinMessage(message) {
    return new Promise((res) => {
      request.req('PUT', `/channels/${this.id}/pins/${message.id || message}`, {}, this.client.token).then(m => {
        request.req('GET', `/channels/${this.id}/messages/${message.id || message}`, {}, this.client.token).then(message => {
          const Message = require('./Message');
          const msg = new Message(message, this.client);
          setTimeout(res, 100, res(msg));
        });
      });
    });
  }

  /**
   * @description Removes a pinned Message from the channel.
   * @param {MessageResolvable} message The message to unpin
   * @returns {Message} The messages that was pinned
   */

  removePinned(message) {
    return new Promise((res) => {
      request.req('DELETE', `/channels/${this.id}/pins/${message.id || message}`, {}, this.client.token).then(()=> {
        request.req('GET', `/channels/${this.id}/messages/${message.id || message}`, {}, this.client.token).then(message => {
          const Message = require('./Message');
          const msg = new Message(message, this.client);
          setTimeout(res, 100, res(msg));
        });
      });
    });
  }

  /**
   * @description This will wait for a message to be send which matches a certain filter and time
   * @param {Function} filter The filter to pass through which will make sure the message matches those requirements
   * @returns {MessageCollector} The message collector class, with two events, MessageCollector.on('collect', message) and MessageCollector.on('end')
   * @example 
   * // Waiting for a message response sent by the author and with the content of 'Hello there!'
   * message.channel.send('Type `Hello there!` in 10 seconds');
   * const collector = message.channel.collectMessage(m => m.content === 'Hello there!' && m.author.id === message.author.id);
   * collector.on('collect', m => {
   *    // m is our message object
   *    console.log(m.content); // Returns 'Hello there!'
   * });
   * 
   * client.on('end', () => {
   *    console.log('Unfortunately, the author didn't responde in time with the correct message!');
   * });
   */

  collectMessage(filter, opt = {}) { 
    const MessageCollector = require('./MessageCollector');
    return new MessageCollector(this, opt, filter);
  }

  toString() {
    return `<#${this.id}>`;
  }
}

/**
 * The options for sending/editting a message
 * @typedef {Object} MessageOptions
 * @property {Boolean} [tts = false] Whether the message should be sent as TTS or not
 * @property {String} [nonce = ''] The nonce for the message
 */

module.exports = TextChannel;
