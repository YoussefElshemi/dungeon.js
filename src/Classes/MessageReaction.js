const Emoji = require('./Emoji');

/**
 * This class represents a message reaction
 */

class MessageReaction {
  constructor(raw, client) {

    /**
     * The message that was reacted on
     * @type {Message}
     */

    this.message = client.messages.get(raw.message_id);

    /**
     * The emoji that was reacted
     * @type {Emoji}
     */

    this.emoji = new Emoji(raw.emoji, this.message.guild, this.client);
  }
}

module.exports = MessageReaction;