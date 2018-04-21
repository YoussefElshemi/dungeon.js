const request = require('../Connection');
const Collection = require('../Classes/Collection');
const GuildChannel = require('../Classes/GuildChannel');
const Member = require('../Classes/Member');
const Guild = require('../Classes/Guild');
const TextChannel = require('../Classes/TextChannel');
const Presence = require('../Classes/Presence');
const Emoji = require('../Classes/Emoji');
const Role = require('../Classes/Role');

module.exports = function() {
  const _this = this;
  return {
    fromRaw: function(raw) {
      const newChannels = new Collection();
      const allRoles = new Collection();
      const allEmojis = new Collection();
      const allMembers = new Collection();
      const allPresences = new Collection();

      for (let i = 0; i < raw.channels.length; i++) {
        newChannels.set(raw.channels[i].id, raw.channels[i]);
      }

      raw.channels = newChannels;

      for (let i = 0; i < raw.roles.length; i++) {
        allRoles.set(raw.roles[i].id, new Role(raw.roles[i], new Guild(raw, _this), _this));
      }

      raw.roles = allRoles;

      for (let i = 0; i < raw.members.length; i++) {
        allMembers.set(raw.members[i].user.id, new Member(raw.members[i], new Guild(raw, _this), _this));
      }
      
      raw.members = allMembers;

      for (let i = 0; i < raw.presences.length; i++) {
        allPresences.set(raw.presences[i].user.id, new Presence(raw.presences[i], _this));
        _this.presences.set(raw.presences[i].user.id, new Presence(raw.presences[i], _this));
      }

      raw.presences = allPresences;

      for (let i = 0; i < raw.emojis.length; i++) {
        allEmojis.set(raw.emojis[i].id, raw.emojis[i]);
        _this.emojis.set(raw.emojis[i].id, new Emoji(raw.emojis[i], new Guild(raw, _this), _this));
      }

      raw.emojis = allEmojis;

      return raw;
    }
  };
};