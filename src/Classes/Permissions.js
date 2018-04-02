const permission = {
  'ADMINISTRATOR': 8,
  'VIEW_AUDIT_LOG': 128,
  'MANAGE_SERVER': 32,
  'MANAGE_ROLES': 268435456,
  'MANAGE_CHANNELS': 16,
  'KICK_MEMBERS': 2,
  'BAN_MEMBERS': 4,
  'CREATE_INSTANT_INVITE': 1,
  'CHANGE_NICKNAME': 67108864,
  'MANAGE_NICKNAMES': 134217728,
  'MANAGE_EMOJIS': 1073741824,
  'MANAGE_WEBHOOKS': 536870912,
  'VIEW_CHANNELS': 1024,
  'SEND_MESSAGES': 2048,
  'SEND_TTS_MESSAGES': 4096,
  'MANAGE_MESSAGES': 8192,
  'EMBED_LINKS': 16384,
  'ATTACH_FILES': 32768,
  'READ_MESSAGE_HISTORY': 65536,
  'MENTION_EVERYONE': 131072,
  'CONNECT': 1048576,
  'SPEAK': 2097152,
  'MUTE_MEMBERS': 4194304,
  'DEAFEN': 8388608,
  'USE_MEMBERS': 16777216,
  'USE_VOICE_ACTIVITY': 33554432
};

class Permissions extends Number {
  constructor(array) {
    if (array.indexOf('ADMINISTRATOR') + 1) super(8);
    else {
      let int = 0;

      array.forEach(c => {
        int += permission[c] || 0;
      });

      super(int);
    }

    this.permissions = array;
  }
}

module.exports = Permissions;