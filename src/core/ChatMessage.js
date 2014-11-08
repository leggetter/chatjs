function ChatMessage() {
  /**
   * Unique ID of the user sending the message
   *
   * @type String
   */
  this.userId = null;

  /**
   * Time the message was sent.
   *
   * @type Date
   */
  this.sentTime = null;

  /**
   * Message text
   *
   * @type String
   */
  this.text = null;
}

module.exports = ChatMessage;
