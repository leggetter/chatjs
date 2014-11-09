var ChatRoom = require( './ChatRoom' );
var ChatUser = require( './ChatUser' );
var PlatformAdapter = require( './PlatformAdapter' );
var using = require( 'typester' ).using;

/**
 * A chat engine.
 *
 * @constructor
 *
 * @param {ChatUser} user
 *    The user of the chat.
 * @param {PlatformAdapter} adapter
 *    The hooks the core functionality up to a specific platform implemenation.
 */
function Chat( user, adapter ) {
  using( arguments )
    .verify( 'user' ).fulfills( ChatUser )
    .verify( 'adapter' ).fulfills( PlatformAdapter );

  /**
   * The current user in the chat.
   * @type ChatUser
   */
  this.user = user;

  /**
   * @type PlatformAdapter
   */
  this._adapter = adapter;

  /**
   * Chat rooms that are available.
   * A map of chat room name to ChatRoom object.
   * @type Map
   */
  this.rooms = {};

  this._adapter.setUser( user );

  /**
   * The default room for the chat
   * @type ChatRoom
   */
  this.defaultRoom = this.addRoom( 'lobby' );
}

/**
 * Send a message to the default chat room.
 *
 * @param {ChatMessage} message
 *    The message to send to the default chat room
 */
Chat.prototype.send = function( message ) {
  this.defaultRoom.send( message );
};

/**
 * Add a new room to the chat.
 * @param {String} name - The name of the chat room to be added.
 * @return {ChatRoom} The newly created room
 */
Chat.prototype.addRoom = function( name ) {
  if( this.rooms[ name ] !== undefined ) {
    throw new Error( 'Room with name "' + name + '" already exists' );
  }

  var room = new ChatRoom( name, this._adapter );
  this.rooms[ name ] = room;

  this._adapter.addRoom( room );

  return room;
};

/**
 * @see ChatRoom#on
 */
Chat.prototype.on = function( eventName, callback, context ) {
  this.defaultRoom.on( eventName, callback, context );
};

module.exports = Chat;
