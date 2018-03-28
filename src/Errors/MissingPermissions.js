class MissingPermissions extends Error {
  constructor(message) {
    super(message);
    this.name = 'Missing Permissions';
  }
}

module.exports = MissingPermissions;