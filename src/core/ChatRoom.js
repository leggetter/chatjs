var PlatformAdapter = require( './PlatformAdapter' );
var ChatMessage = require( './ChatMessage' );

var emitr = require( 'emitr' );
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

  /**
   * @private
   */
  this._emitr = new emitr();
}

/**
 * New message recieved event name.
 * @type String
 */
ChatRoom.MESSAGE_RECEIVED_EVENT = 'new-message';

/**
 * Send the message.
 *
 * @param {ChatMessage} message
 */
ChatRoom.prototype.send = function( message ) {
  using( arguments )
    .verify( 'message' ).fulfills( ChatMessage );

  this._adapter.send( this, message );
};

/**
 * Called when a new message is recieved.
 *
 * @param {ChatMessage} message
 *    The incoming message.
 */
ChatRoom.prototype.receive = function( message ) {
  // TODO: update message collection
  this._emitr.trigger( ChatRoom.MESSAGE_RECEIVED_EVENT, message );
};

/**
 * Bind to chat room events.
 *
 * @param {String} eventName
 *    The name of the event to bind to.
 * @param {Function} callback
 *    The callback to be invoked when the event is triggered.
 * @param {Object} context
 *    The context to apply to the callback. For example, for maintaining the
 *    context of `this`.
 *
 * @fires ChatRoom#MESSAGE_RECEIVED_EVENT
 */
ChatRoom.prototype.on = function( eventName, callback, context ) {
  this._emitr.on( eventName, callback, context );
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
