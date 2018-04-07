const Util = require('../util/Util');

// Discord epoch (2015-01-01T00:00:00.000Z)
const EPOCH = 1420070400000;
let INCREMENT = 0;

class SnowflakeUtil {
  constructor() {
    throw new Error(`The ${this.constructor.name} class cannot be instantiated.`);
  }

  /**
   * Generates a Discord snowflake.
   * <info>This hardcodes the worker ID as 1 and the process ID as 0.</info>
   * @returns {Snowflake} The generated snowflake
   */
  static generate() {
    if (INCREMENT >= 4095) INCREMENT = 0;
    // eslint-disable-next-line max-len
    const BINARY = `${(Date.now() - EPOCH).toString(2).padStart(42, '0')}0000100000${(INCREMENT++).toString(2).padStart(12, '0')}`;
    return Util.binaryToID(BINARY);
  }

  /**
   * A deconstructed snowflake.
   * @typedef {Object} DeconstructedSnowflake
   * @property {Number} timestamp Timestamp the snowflake was created
   * @property {Date} date Date the snowflake was created
   * @property {Number} workerID Worker ID in the snowflake
   * @property {Number} processID Process ID in the snowflake
   * @property {Number} increment Increment in the snowflake
   * @property {String} binary Binary representation of the snowflake
   */

  /**
   * Deconstructs a Discord snowflake.
   * @param {Snowflake} snowflake Snowflake to deconstruct
   * @returns {DeconstructedSnowflake} Deconstructed snowflake
   */
  static deconstruct(snowflake) {
    const BINARY = Util.idToBinary(snowflake).toString(2).padStart(64, '0');
    const res = {
      timestamp: parseInt(BINARY.substring(0, 42), 2) + EPOCH,
      workerID: parseInt(BINARY.substring(42, 47), 2),
      processID: parseInt(BINARY.substring(47, 52), 2),
      increment: parseInt(BINARY.substring(52, 64), 2),
      binary: BINARY,
    };
    Object.defineProperty(res, 'date', {
      get: function get() { return new Date(this.timestamp); },
      enumerable: true,
    });
    return res;
  }

}

module.exports = SnowflakeUtil;