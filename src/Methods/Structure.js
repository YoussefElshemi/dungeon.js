class Structures {
  constructor() {
    throw new Error(`The ${this.constructor.name} class cannot be instantiated.`);
  }

  static get(structure) {
    if (typeof structure ==='string') return structures[structure];
    throw new TypeError(`'structure' argument must be a string. Received ${typeof structure}`);
  }
}

const structures = {
  Category: require('./Category'),
  Channel: require('./Channels'),
  Emoji: require('./Emojis'),
  Guild: require('./Guilds'),
  Member: require('./Members'),
  Message: require('./Messages'),
  Permissions: require('./Permissions'),
  User: require('./Users')
};

module.exports = Structures;