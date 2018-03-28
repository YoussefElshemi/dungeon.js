class DiscordAPIError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DiscordAPIError';
  }
}

module.exports = DiscordAPIError;