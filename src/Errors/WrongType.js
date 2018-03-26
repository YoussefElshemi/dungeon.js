class WrongType extends Error {
  constructor(message) {
    super(message);
    this.name = "WrongType";
  }
}
  
module.exports = WrongType;