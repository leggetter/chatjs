/**
 * A chat room.
 */
function ChatRoom( name ) {
  /**
   * The name of the room
   * @type String
   */
  this.name = name;

  /**
   * The users in the chat room.
   * A lookup of user ID to chat user
   * @type Map
   */
  this.users = {};
}

/**
 * Send the message.
 *
 * @param {ChatMessage} message
 */
ChatRoom.prototype.send = function( message ) {
};

module.exports = ChatRoom;
