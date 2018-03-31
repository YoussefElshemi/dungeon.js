class Embed {
  constructor(data = {}) {

    this.title = data.title || null;
  
    this.description = data.description || null;
  
    this.url = data.url || null;
  
    this.color = data.color || null;
    
    this.author = data.author || null;
  
    this.timestamp = data.timestamp || null;
  
    this.fields = data.fields || [];
  
    this.thumbnail = data.thumbnail || null;
  
    this.image = data.image || null;

    this.footer = data.footer || null;

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