class Embed {
  constructor(data = {}) {

    this.title = data.title;
  
    this.description = data.description;
  
    this.url = data.url;
  
    this.color = data.color;
    
    this.author = data.author;
  
    this.timestamp = data.timestamp;
  
    this.fields = data.fields || [];
  
    this.thumbnail = data.thumbnail;
  
    this.image = data.image;

    this.footer = data.footer;

    return this;

  }

  title(title) {
    this.title = title;
    return this;
  }

  body(body) {
    this.description = body;
    return this;
  }

  footer(footer) {
    this.footer = footer;
    return this;
  }

  image(image) {
    this.image = image;
    return this;
  }

  thumbnail(thumbnail) {
    this.thumbnail = thumbnail;
    return this;
  }

  color(color) {
    this.color = color;
    return this;
  }

  timestamp(timestamp = new Date()) {
    this.title = timestamp;
    return this;
  }
}

module.exports = Embed;