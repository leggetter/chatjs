var ChatRoom = require( './ChatRoom.js' );

function Chat() {
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
  return room;
};

module.exports = Chat;





// on( 'new-message' )
// on( 'new')

// addMessageListener( listener )
