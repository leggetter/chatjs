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

  this.userId = userId;
  this.text = text;
  this.sentTime = sentTime;
}

/**
 * Unique ID of the user sending the message
 *
 * @type String
 */
ChatMessage.prototype.userId = '';

/**
 * Message text
 *
 * @type String
 */
ChatMessage.prototype.text = '';

/**
 * Time the message was sent.
 *
 * @type Date
 */
ChatMessage.prototype.sentTime = new Date();

module.exports = ChatMessage;
