const request = require('../Connection');
const Collection = require('../Classes/Collection');

module.exports = function() {
  const _this = this;
  return {
    fromRaw: function(raw) {
      raw.channel = _this.channels.get(raw.channel_id);
      if (raw.channel && raw.channel) {
        raw.guild = raw.channel.guild;
        raw.member = _this.gu_methods().fromRaw(raw.author, raw.guild);
      }

      raw.author = _this.user_methods().fromRaw(raw.author);
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