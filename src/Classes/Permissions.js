const permission = {
  'CREATE_INSTANT_INVITE': 1,
  'KICK_MEMBERS': 2,
  'BAN_MEMBERS': 4,
  'ADMINISTRATOR': 8,
  'MANAGE_CHANNELS': 16,
  'MANAGE_SERVER': 32,
  'ADD_REACTIONS': 64,
  'VIEW_AUDIT_LOG': 128,

  'VIEW_CHANNELS': 1024,
  'SEND_MESSAGES': 2048,
  'SEND_TTS_MESSAGES': 4096,
  'MANAGE_MESSAGES': 8192,
  'EMBED_LINKS': 16384,
  'ATTACH_FILES': 32768,
  'READ_MESSAGE_HISTORY': 65536,
  'MENTION_EVERYONE': 131072,
  'USE_EXTERNAL_EMOJIS': 262144,

  'CONNECT': 1048576,
  'SPEAK': 2097152,
  'MUTE_MEMBERS': 4194304,
  'DEAFEN': 8388608,
  'USE_MEMBERS': 16777216,
  'USE_VOICE_ACTIVITY': 33554432,
  'CHANGE_NICKNAME': 67108864,
  'MANAGE_ROLES': 268435456,
  'MANAGE_WEBHOOKS': 536870912,
  'MANAGE_EMOJIS': 1073741824
};

/**
 * This class represents permissions
 */


class Permissions extends Number {
  constructor(array) {
    if (array && array.indexOf('ADMINISTRATOR') + 1) super(8);
    else {
      let int = 0;

      if (array) array.forEach(c => {
        int += permission[c] || 0;
      });

      super(int);
    }

    /**
     * The permissions provided in the constructor
     * @type {Array}
     */

    this.permissions = array;
  }

  /**
   * This method returns the bitfield of the permissions provided as an array in the constrcutor
   * @returns {Number} The bitfield of the permissions
   */

  toBitField() {
    return Number(this);
  }

  /**
   * This method returns an array of permissions based on the bitfield provided
   * @param {Number} number The bitfield
   * @returns {Array} Array of permissions
   */

  toArray(number) {
    const bitfields = bitfieldCheck(number);
    const perms = [];
    for (let i = 0; i < bitfields.length; i++) {
      perms.push(permission.getKeyByValue((bitfields[i])));
    }
    return perms;
  } 
}

module.exports = Permissions;

Object.prototype.getKeyByValue = function(value) {
  for (var prop in this) {
    if (this.hasOwnProperty( prop )) {
      if (this[ prop ] === value)
        return prop;
    }
  }
};

function bitfieldCheck(number) {
  return number.toString(2).split('').reverse().map((x, idx) => x == '1' ? 2 ** idx : false).filter(x => x);
}