class MissingParameter extends Error {
  constructor(message) {
    super(message);
    this.name = "WrongType";
  }
}
    
module.exports = MissingParameter;