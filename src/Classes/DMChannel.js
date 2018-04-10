const Collection = require('./Collection');
const User = require('./User');

/**
 * This class represents a DM Channel object
 */

class DMChannel {
  constructor(raw, client) {

    /**
     * The type of channel
     * @type {String}
     */

    this.type = 'dm';

    /**
     * The client object which is logged in
     * @type {Client}
     */

    this.client = client;

    /**
     * The ID of the DM channel
     * @type {String}
     */

    this.id = raw.id;

    const recipients = new Collection();

    for (let i = 0; i < raw.recipients.length; i++) {
      recipients.set(raw.recipients[i].id,  new User(raw.recipients[i], this.client));
    }

    /**
     * A collection of the members in the DM mapped by their ID
     * @type {Collection}
     */

    this.recipients = recipients;

    /**
     * The ID of the last message sent in the DM Channel
     */

    this.lastMessageID = raw.last_message_id;

    this.guild = null;

  }

  /**
   * @description This method will send a message to the channel specified
   * @param {String|Object} content The string if it's a normal message or object if it's a richembed
   * @param {Object} [opt = {}] The options, nonce and tts {@link MessageOptions}
   * @returns {Promise<Message>} Returns a promise and discord message
   * @example
   * // Sending an embed
   * DMChannel.send({ title: "Ping!", description: "This User Was Pinged!", color: 0x00AE86 });
   * @example
   * // Sending a tts message
   * DMChannel.send("Hi!", { tts: true });
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
   * @description This method adds a user to a group DM
   * @param {User} user The user to add to a DM, can be a user object or id
   * @param {String} accessToken Access token of a user that has granted your app the gdm.join scope
   * @param {String} nick The nickname of the user being added
   * @returns {Promise<DMChannel>} Returns a promise and a DM Channel 
   */

  addRecipient(user, accessToken, nick) {
    let userid;
    if (typeof user === 'string') userid = user;
    if (typeof user === 'object') userid = user.id;

    request.req('PUT', `/channels/${this.id}/recipients/${userid}`, {
      access_token: accessToken || null,
      nick: nick || null
    }, this.client.token).then(c => {
      setTimeout(res, 100, res(new this.constructor(c, this.client)));
    }).catch(error => {
      if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
    });
  }

  /**
   * @description This method removes a user to a group DM
   * @param {User} user The user to remove from the DM, can be a user object or id
   * @returns {Promise<DMChannel>} Returns a promise and a DM Channel 
   */

  removeRecipient(user) {
    let userid;
    if (typeof user === 'string') userid = user;
    if (typeof user === 'object') userid = user.id;

    request.req('DELETE', `/channels/${this.id}/recipients/${userid}`, {}, this.client.token).then(c => {
      setTimeout(res, 100, res(new this.constructor(c, this.client)));
    }).catch(error => {
      if (error.status === 403) throw new this.client.MissingPermissions('I don\'t have permissions to perform this action!');
    });
  }
}

module.exports = DMChannel;