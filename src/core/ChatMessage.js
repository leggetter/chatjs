/**
 * A chat message
 *
 * @param {String} userId
 *    The id of the user sending the message
 * @param {String} text
 *    The message text contents
 * @param {Date} sentTime
 *    The time the message was sent. Optional: defaults to the current time.
 */
function ChatMessage( userId, text, sentTime ) {
  sentTime = sentTime || new Date();

  /**
   * Unique ID of the user sending the message
   *
   * @type String
   */
  this.userId = userId;

  /**
   * Message text
   *
   * @type String
   */
  this.text = text;

  /**
   * Time the message was sent.
   *
   * @type Date
   */
  this.sentTime = sentTime;
}

module.exports = ChatMessage;
