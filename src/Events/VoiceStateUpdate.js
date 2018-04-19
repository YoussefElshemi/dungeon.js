class VoiceStateUpdate {
  /**
   * This event is emitted whenever a member's voice state changes, eg. they mute themselves
   * @event Client#voiceStateUpdate
   * @param {Member} Member The member that voice state was updated
   * @param {VoiceChannel} VoiceChannel The voice channel the member was in when their voice state was updated
   */
}

module.exports = VoiceStateUpdate;