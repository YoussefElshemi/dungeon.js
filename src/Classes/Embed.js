/**
 * This class represents an embed object
 */

class Embed {
  constructor(data = {}) {

    /**
     * The title of the embed 
     * @type {String}
     */

    this.title = data.title;

    /**
     * The description of the embed
     * @type {String}
     */
  
    this.description = data.description;

    /**
     * The URL for the embed
     * @type {String}
     */
  
    this.url = data.url;

    /**
     * The color of the embed
     * @type {Color}
     */
  
    this.color = data.color;

    /**
     * The author of the embed
     * @type {Object}
     */
    
    this.author = data.author;

    /**
     * The timestamp of the embed
     * @type {Date}
     */
  
    this.timestamp = data.timestamp;

    /**
     * The fields of the embed
     * @type {Array}
     */
  
    this.fields = data.fields || [];

    /**
     * The thumbnail of the embed
     * @type {String}
     */
  
    this.thumbnail = data.thumbnail;

    /**
     * The image of the embed
     * @type {String}
     */
  
    this.image = data.image;

    /**
     * The footer of the embed 
     * @type {Object}
     */

    this.footer = data.footer;
    
  }

  /**
   * @description This method sets the title of the embed
   * @param {String} title The title of the embed
   */

  setTitle(title) {
    this.title = title;
    return this;
  }

  /**
   * @description This method sets the description of the embed
   * @param {String} description The description of the embed
   */

  setDescription(description) {
    this.description = description;
    return this;
  }

  /**
   * @description This method sets the footer of the embed
   * @param {String} footerText The footer text of the embed
   * @param {String} [footerImage=''] The image placed in the footer
   */

  setFooter(footerText, footerImage = '') {
    this.footer = { text: footerText, icon_url: footerImage };
    return this;
  }

  /**
   * @description This method sets the image of the embed
   * @param {String} image The image URL of the embed
   */

  setImage(image) {
    this.image = image;
    return this;
  }

  /**
   * @description This method sets the thumbnail of the embed
   * @param {String} thumbnail The thumbnail image URL of the embed
   */

  setThumbnail(thumbnail) {
    this.thumbnail = thumbnail;
    return this;
  }

  /**
   * @description This method sets the color of the embed
   * @param {Color} color The color of the embed
   */

  setColor(color) {
    this.color = color;
    return this;
  }

  /**
   * @description This method sets the date of the embed
   * @param {String} [timestamp = new Date()] The date of the embed
   */

  setTimestamp(timestamp = new Date()) {
    this.timestamp = timestamp;
    return this;
  }

  /**
   * @description This method sets the author of the embed
   * @param {String} authorText The author text of the embed
   * @param {String} [authorImage=''] The image placed in the author area
   */

  setAuthor(authorText, authorImage = '') {
    this.author = { name: authorText, icon_url: authorImage };
    return this;
  }

  /**
   * @description This method adds a field to the embed
   * @param {String} name The name of the field
   * @param {String} value The value of the field
   * @param {Boolean} [inline=false] Set the field to display inline
   */

  addField(name, value, inline = false) {
    this.fields.push({ name, value, inline });
    return this;
  }

  /**
   * @description This method sets the URL of the embed
   * @param {String} url the URL
  */

  setURL(url) {
    this.url = url;
    return this;
  }
}

module.exports = Embed;