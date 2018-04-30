const EventEmitter = require('events');

/**
 * This class is for the message collector for text channels
 */

class ReactionCollector extends EventEmitter {
  constructor(channel, opt = {}, filter) {
    super();

    /**
     * The textchannel the collector was called in
     * @type {TextChannel}
     */

    this.channel = channel;

    /**
     * The client that is logged in
     * @type {Client}
     */

    this.client = this.channel.client;

    /**
     * The options defined in the constructor
     * @type {Object}
     */

    this.opt = opt;

    /**
     * The filter to pass onto the collector
     * @type {Function}
     */

    this.filter = filter;

    const date = new Date().getTime();
    channel.client.once('messageReactionAdd', (reaction, user) => {
      if (reaction.message.channel.id === this.channel.id && date + opt.time >= new Date().getTime() && filter(reaction, user)) {
        this.emit('collect', reaction, user);
      } else {
        this.waitForMessage(date);
      }
    });

    const interval = setInterval(() => {
      if (((date + opt.time) - new Date().getTime()) <= 0) {
        this.emit('end');
        clearInterval(interval);
      }
    }, 1);

  }

  waitForMessage(date) {
    this.client.once('messageReactionAdd', (reaction, user) => {
      if (reaction.message.channel.id === this.channel.id && date + this.opt.time >= new Date().getTime() && this.filter(reaction, user)) {
        this.emit('collect', reaction, user);
      } else {
        this.waitForMessage(date);
      }
    });
  }

}

module.exports = ReactionCollector;

/**
 * This event is emitted whenever the requirements for the collector are met
 * @event ReactionCollector#collect
 * @param {MessageReaction} Reaction The emoji that was reacted
 * @param {User} User The user who reacted
 */

/**
 * This event is emitted whenever the requirements for the collector aren't met
 * @event ReactionCollector#end
 */