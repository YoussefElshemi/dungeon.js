
/**
 * This class represents a User Object
 */

class User {
  constructor(raw) {

    this.id = raw.id;

    this.username = raw.username;

    this.discriminator = raw.discriminator;

    this.tag = raw.tag;

    this.avatarURL = `https://cdn.discordapp.com/avatars/${this.id}/${this.avatar}.png`;
      
  }

}

module.exports = User;