var Base64 = require( 'js-base64' ).Base64;

/**
 * Pusher adapter for the chat engine.
 *
 * @param {Pusher} pusher
 *    A Pusher instance.
 */
function PusherChatAdapter( pusher ) {
  this._pusher = pusher;
  this._roomChannels = {};
}

PusherChatAdapter.prototype.addRoom = function( room ) {
  var roomName = roomNameToValidChannelName( room.name );
  setTimeout( function() {
    var channel = this._pusher.subscribe( roomName );
    this._roomChannels[ roomName ] = channel;
  }.bind( this ), 1000 );
};

PusherChatAdapter.prototype.send = function( message ) {
  console.log( 'PusherChatAdapter:send', message );
};

function roomNameToValidChannelName( name ) {
  // ensure any name is allowed as a channel
  // TODO: what about + sign?
  name = Base64.encode( name );
  return 'presence-' + name;
}

module.exports = PusherChatAdapter;
