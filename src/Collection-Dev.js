class CollectionDev extends Map {
  constructor(it) {
    super(it);
    Object.defineProperty(this, '_values', {
      writable: false,
      configurable: true,
      value: this.values
    });

    Object.defineProperty(this, '_keys', {
      writable: false,
      configurable: true,
      value: this.keys
    });
    
  }
  
  values() {
    return Array.from(super._values());
  }
  keys() {
    return Array.from(super._keys());
  }
}
  
module.exports = CollectionDev;