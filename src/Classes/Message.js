const request = require('../Connection');
const Guild = require('./Guild');
const Member = require('./Member');
const TextChannel = require('./TextChannel');
const Snowflake = require('../util/Snowflake');
const GuildChannel = require('./GuildChannel');
const User = require('./User');
const Collection = require('./Collection');
const Role = require('./Role');
const Emoji = require('./Emoji');

/**
 * This class represents a message object
 */

class Message {
  constructor(raw, client) {

    /**
     * The channel the message was sent in
     * @type {TextChannel}
     */

    this.channel = client.channels.get(raw.channel_id);

    /**
     * The ID of the message sent
     * @type {String}
     */

    this.id = raw.id;

    /**
     * The guild the message was sent it
     * @type {Guild}
     */

    this.guild = this.channel && this.channel.guild ? this.channel.guild : null;

    /** 
     * The user object of the person who sent the message
     * @type {User}
     */

    this.author = new User(raw.author, client);

    /**
     * The guild member object of the person who sent the message
     * @type {Member}
     */

    this.member = this.guild && this.guild.members.has(this.author.id) ? this.guild.members.get(this.author.id) :	null;

    /**
     * The client object which is logged in
     * @type {Client}
     */

    this.client = client;

    /**
     * A formated date in which the message was created at
     * @type {Date}
     */

    this.createdAt = new Date(raw.timestamp);

    /**
     * The timestamp in which the message was created at
     * @type {Date}
     */

    this.createdTimestamp = Snowflake.deconstruct(this.id).timestamp;

    this.mentionedUsers = new Collection();
    this.mentionedMembers = new Collection();
    this.mentionedRoles = new Collection();

    if (raw.mentions) {
      for (let i = 0; i < raw.mentions.length; i++) {
        this.mentionedMembers.set(raw.mentions[i].id, this.guild.members.get(raw.mentions[i].id));
        this.mentionedUsers.set(raw.mentions[i].id, new User(raw.mentions[i], this.client));
      }
    }

    if (raw.mention_roles) {
      for (let i = 0; i < raw.mention_roles.length; i++) {
        this.mentionedRoles.set(raw.mention_roles[i].id, new Role(raw.mentions[i], this.guild, this.client));
      }
    }

    /**
     * A collection of all of the users mentioned in the message
     * @type {Collection}
     */

    this.mentionedUsers;

    /**
     * A collection of all of the members mentioned in the message
     * @type {Collection}
     */

    this.mentionedMembers;

    /**
     * A collection of all of the roles mentioned in the message
     * @type {Collection}
     */

    this.mentionedRoles;
    

    /**
     * The content of the message
     * @type {String}
     */

    this.content = raw.content;

    /**
     * The clean content of the message which replaces <@id> to @Youssef#0001 for example
     * @type {String}
     */

    this.cleanContent = cleanMessage(this);

    /**
     * The embeds in the message
     * @type {Array}
     */

    this.embeds = raw.embeds;

    /**
     * Whether the message is pinned or not
     * @type {Boolean}
     */

    this.pinned = raw.pinned;

    /**
     * Whether the message has a nonce or not
     * @type {Boolean}
     */

    this.nonce = raw.nonce;

    /**
     * If the message was editted, what time was it editted
     * @type {Number}
     */

    this.editedTimestamp = raw.edited_timestamp;

    /**
     * The attachments in the message
     * @type {Array}
     */

    this.attachments = raw.attachments;

    /**
     * Whether the message mentions everyone
     * @type {Boolean}
     */

    this.mentionsEveryone = raw.mention_everyone;

    /**
     * The type of message
     * @type {String}
     */

    this.type = ['DEFAULT', 'RECIPIENT_ADD', 'RECIPIENT_REMOVE', 'CALL', 'CHANNEL_NAME_CHANGE','CHANNEL_ICON_CHANGE','CHANNEL_PINNED_MESSAGE', 'GUILD_MEMBER_JOIN'][raw.type];

    /**
     * The reactions on the message
     * @type {Object}
     */
    
    this.reactions = new Collection();

    if (raw.reactions) {
      for (let i = 0; i < raw.reactions.length; i++) {
        const Emoji = require('./Emoji');
        this.reactions.set(raw.reactions[i].emoji.id ||	raw.reactions[i].emoji.name, { count: raw.reactions[i].count, me: raw.reactions[i].me, emoji: new Emoji(raw.reactions[i].emoji, this.guild, this.client) });
      }
    }
  }

  /**
   * @description This method will reply by mentioning the user first
   * @param {String} content The string to send the message with
   * @returns {Promise<Message>} Returns a promise and discord message
   */

  reply(content) {
    return new Promise((res) => {
      request.req('POST', `/channels/${this.channel.id}/messages`, {
        content: `<@${this.author.id}>, ${content}`
      }, this.client.token).then(m => {
        setTimeout(res, 100, res(new this.constructor(m, this.client)));
      }).catch(error => {
        if (error.status === 403) throw new Error('Missing Permissions');
      });        
    });
  }

  /**
   * @description This method will delete a message
   * @param {String} [reason = ''] The reason why the message is deleted
   * @returns {Promise<Message>} Returns a promise and the message deleted
   */

  delete(reason = '') {
    return new Promise((res) => {
      request.req('DELETE', `/channels/${this.channel.id}/messages/${this.id}`, {reason: reason} , this.client.token).then(m => {
        this.client.messages.delete(this.id);
        setTimeout(res, 100, res(new this.constructor(m, this.client)));
      }).catch(error => {
        if (error.status === 403) throw new Error('Missing Permissions');
      });
    });
  }

  /**
    * @description This method will edit a message sent by the client
    * @param {String} newmessage The string to edit the current message with
    * @returns {Promise<Message>} Returns a promise and discord message
    */

  edit(newmessage) {
    return new Promise((res) => {
      request.req('PATCH', `/channels/${this.channel.id}/messages/${this.id}`, {content: newmessage} , this.client.token).then(m => {
        //const Message = require('./Message');
        setTimeout(res, 100, res(new this.constructor(m, this.client)));
      }).catch(error => {
        if (error.status === 403) throw new Error('Missing Permissions');
      });
    });
  }

  /**
    * @description This method will pin a discord message in a channel
    * @returns {Promise<Message>} Returns a promise and discord message (pin)
    */

  pin() {
    return new Promise((res) => {
      request.req('PUT', `/channels/${this.channel.id}/pins/${this.id}`, {} , this.client.token).then(m => {
        const Message = require('./Message');
        setTimeout(res, 100, res(new this.constructor(m, this.client)));
      }).catch(error => {
        if (error.status === 403) throw new Error('Missing Permissions');
      });
    });
  }

  /**
    * @description This method will unpin a discord message in a channel
    * @returns {Promise<Message>} Returns a promise and discord message (unpinned message)
    */

  unpin() {
    return new Promise((res) => {
      request.req('DELETE', `/channels/${this.channel.id}/pins/${this.id}`, {} , this.client.token).then(m => {
        //const Message = require('./Message');
        setTimeout(res, 100, res(new this.constructor(m, this.client)));
      }).catch(error => {
        if (error.status === 403) throw new Error('Missing Permissions');
      });
    });
  }

  /**
    * @description This method will make the client react to a message
    * @param {EmojiResolvable} emoji The unicode emoji or the emoji
    */

  react(emoji) {
    let reaction;
    if (encodeURI(emoji) !== emoji) {
      reaction = encodeURI(emoji);
    } else if (typeof parseInt(emoji) === 'number') {
      reaction = `${this.client.emojis.get(emoji).name}:${this.client.emojis.get(emoji).id}`;
    } else {
      reaction = `${this.client.emojis.get(emoji.id).name}:${emoji.id}`;
    }
    return new Promise((res) => {
      request.req('PUT', `/channels/${this.channel.id}/messages/${this.id}/reactions/${reaction}/@me`, {}, this.client.token).then(m => {
        setTimeout(res, 100, res(this));
      }).catch(error => {
        if (error.status === 403) throw new Error('Missing Permissions');
      });
    });
  }

  /**
   * @description Remove a certain reaction of a certain user
   * @param {User} user The user whos reaction you want to remove
   * @param {EmojiResolvable} emoji The emoji you want to remove
   */

  removeReaction(user, emoji) {
    let reaction;
    if (encodeURI(emoji) !== emoji) {
      reaction = encodeURI(emoji);
    } else if (typeof parseInt(emoji) === 'number') {
      reaction = `${this.client.emojis.get(emoji).name}:${this.client.emojis.get(emoji).id}`;
    } else {
      reaction = `${this.client.emojis.get(emoji.id).name}:${emoji.id}`;
    }
    return new Promise((res) => {
      if (user.id === this.client.user.id) {
        request.req('DELETE', `/channels/${this.channel.id}/messages/${this.id}/reactions/${reaction}/@me`, {}, this.client.token).then(m => {
          setTimeout(res, 100, res(m));
        }).catch(error => {
          if (error.status === 403) throw new Error('Missing Permissions');
        });
      } else {
        request.req('DELETE', `/channels/${this.channel.id}/messages/${this.id}/reactions/${reaction}/${user.id}`, {}, this.client.token).then(m => {
          setTimeout(res, 100, res(this));
        }).catch(error => {
          if (error.status === 403) throw new Error('Missing Permissions');
        });
      }
    });
  }

  /**
   * @description This method will clear all reactions on a message
   */

  clearReactions() {
    return new Promise((res) => {
      request.req('DELETE', `/channels/${this.channel.id}/messages/${this.id}/reactions`, {}, this.client.token).then(m => {
        setTimeout(res, 100, res(m));
      }).catch(error => {
        if (error.status === 403) throw new Error('Missing Permissions');
      });
    });
  }


  /**
    * @description This method checks if a user is mentioned
    * @param {UserResolvable} user The user
    * @returns {Boolean} If the id given belonged to a mentioned user, it will return true, vice versa
    */

  isMentioned(user) {
    if (this.mentionedUsers.exists('id', user.id || user)) return true;
    else return false;
  }

  /**
   * @description This method will wait for a reaction on the message
   * @param {Function} filter The filter to use 
   * @param {Object} [opt = {}] The options
   * @returns {ReactionCollector} The reaction collector class, with two events, ReactionCollector.on('collect', message) and ReactionCollector.on('end')
   */

  collectReaction(filter, opt = {}) {
    const ReactionCollector = require('./ReactionCollector');
    return new ReactionCollector(this.channel, opt, filter);
  }

  /**
   * @description This method will fetch all of the users who reacted with a certain emoji
   * @param {EmojiResolvable} emoji The emoji to look for
   * @param {Object} [opt = {}] The otpions: before, after and limit 
   * @returns {Promise<Collection>} A collection of all the users who reacted with the certain emoji
   */

  fetchReactions(emoji, opt = {}) {
    let reaction;
    if (encodeURI(emoji) !== emoji) {
      reaction = encodeURI(emoji);
    } else if (typeof parseInt(emoji) === 'number') {
      reaction = `${this.client.emojis.get(emoji).name}:${this.client.emojis.get(emoji).id}`;
    } else {
      reaction = `${this.client.emojis.get(emoji.id).name}:${emoji.id}`;
    }
    return new Promise((res, rej) => {
      request.req('GET', `/channels/${this.channel.id}/messages/${this.id}/reactions/${reaction}`, {
        before: opt.before,
        after: opt.after,
        limit: opt.limit
      }, this.client.token).then(c => {
        const returned = new Collection();
        for (let i = 0; i < c.length; i ++) {
          returned.set(c[i].id, new User(c[i], this.client));
        }
        setTimeout(res, 100, res(returned));
      });
    });
  }
}

module.exports = Message;

function cleanMessage(message) {
  return message.content
    .replace(/@(everyone|here)/g, '@\u200b$1')
    .replace(/<@!?[0-9]+>/g, input => {
      const id = input.replace(/<|!|>|@/g, '');
      if (message.channel.type === 'dm') {
        return message.client.users.has(id) ? `@${message.client.users.get(id).username}` : input;
      }

      const member = message.channel.guild.members.get(id);
      if (member) {
        if (member.nickname) return `@${member.nickname}`;
        return `@${member.user.username}`;
      } else {
        const user = message.client.users.get(id);
        if (user) return `@${user.username}`;
        return input;
      }
    })
    .replace(/<#[0-9]+>/g, input => {
      const channel = message.client.channels.get(input.replace(/<|#|>/g, ''));
      if (channel) return `#${channel.name}`;
      return input;
    })
    .replace(/<@&[0-9]+>/g, input => {
      if (message.channel.type === 'dm') return input;
      const role = message.guild.roles.get(input.replace(/<|@|>|&/g, ''));
      if (role) return `@${role.name}`;
      return input;
    });
}

/**
 * @typedef {Object} MessageResolvable
 * @property {String} Snowflake This could be the ID of the message
 * @property {Message} Message This could be an actual message class
 */