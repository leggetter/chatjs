var ChatRoom = require( './ChatRoom' );
var PlatformAdapter = require( './PlatformAdapter' );
var Utils = require( './Utils' );

/**
 * A chat engine.
 *
 * @constructor
 *
 * @param {PlatformAdapter} adapter
 *    The hooks the core functionality up to a specific platform implemenation.
 */
function Chat( adapter ) {
  if( !Utils.fulfills( adapter, PlatformAdapter ) ) {
    throw new Error( 'The "adapter" must implement the PlatformAdapter interface' );
  }

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
}

/**
 * Add a new room to the chat.
 * @param {String} name - The name of the chat room to be added.
 * @return {ChatRoom} The newly created room
 */
Chat.prototype.addRoom = function( name ) {
  if( this.rooms[ name ] !== undefined ) {
    throw new Error( 'Room with name "' + name + '" already exists' );
  }

  var room = new ChatRoom( name );
  this.rooms[ name ] = room;

  this._adapter.addRoom( room );

  return room;
};

module.exports = Chat;





// on( 'new-message' )
// on( 'new')

// addMessageListener( listener )
