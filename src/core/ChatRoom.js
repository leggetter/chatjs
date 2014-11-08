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

/**
 * Adds a user to a room.
 */
ChatRoom.prototype.join = function( user ) {
  if( this.users[ user.id ] !== undefined ) {
    throw new Error( 'A user with the id "' + user.id + '" is already in the room. Cannot join the room twice.' );
  }
  this.users[ user.id ] = user;
};

module.exports = ChatRoom;
