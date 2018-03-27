class Collection extends Map {
  constructor(it) {
    super(it);
    Object.defineProperty(this, "_values", {
      writable: false,
      configurable: true,
      value: this.values
    });
    Object.defineProperty(this, "_keys", {
      writable: false,
      configurable: true,
      value: this.keys
    });

    console.log(this._values());

    super.delete(this.values);
    super.delete(this.keys);

    console.log(this._values());
  }

  values() {
    return Array.from(super._values());
  }
  keys() {
    return Array.from(super._keys());
  }
}

module.exports = Collection;
