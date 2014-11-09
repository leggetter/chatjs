var PlatformAdapter = require( './PlatformAdapter' );
var ChatMessage = require( './ChatMessage' );
var using = require( 'typester' ).using;

/**
 * A chat room.
 */
function ChatRoom( name, adapter ) {
  using( arguments )
    .verify( 'name' ).fulfills( String )
    .verify( 'adapter' ).fulfills( PlatformAdapter );

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

  // TODO: messages?

  /**
   * @type PlatformAdapter
   * @private
   */
  this._adapter = adapter;
}

/**
 * Send the message.
 *
 * @param {ChatMessage} message
 */
ChatRoom.prototype.send = function( message ) {
  using( arguments )
    .verify( 'message' ).fulfills( ChatMessage );

  this._adapter.send( message );
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
