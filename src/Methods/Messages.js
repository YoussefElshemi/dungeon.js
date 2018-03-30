const request = require('../Connection');
const Collection = require('../Classes/Collection');
const User = require('../Classes/User');
const Member = require('../Classes/Member');
const Guild = require('../Classes/Guild');


module.exports = function() {
  const _this = this;
  return {
    fromRaw: function(raw) {
      raw.channel = _this.channels.get(raw.channel_id);

      if (raw.channel && raw.channel.guild) {
        raw.guild = raw.channel.guild;
        raw.member = _this.gu_methods().fromRaw(raw.author, raw.guild);
      }

      raw.user = new User(_this.gu_methods().fromRaw(raw.author, raw.guild), _this);
      raw.author = raw.user;
      raw.user = null;
      raw.clean = cleanMessage(raw.content);
      raw.client = _this;
      raw.createdAt = new Date(raw.timestamp).toLocaleString();
      raw.mentioned = raw.mentions;
      raw.mentionedUsers = new Collection();

      for (let i = 0; i < raw.mentions.length; i++) {
        raw.mentionedUsers.set(raw.mentions[i].id, raw.mentions[i]);
      }

      raw.mentioned = null;
      raw.mentions = null;

      return raw;
    }
  };
};

const cleanMessage = function(text)  {
  if (typeof(text) === 'string')
    return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
  else
    return text;
};