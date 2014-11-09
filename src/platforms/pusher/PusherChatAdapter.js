var Base64 = require( 'js-base64' ).Base64;

/**
 * Pusher adapter for the chat engine.
 *
 * @param {Pusher} pusher
 *    A Pusher instance.
 */
function PusherChatAdapter( pusher ) {
  this._pusher = pusher;
  this.user = null;
  this._roomChannels = {};
}

PusherChatAdapter.prototype.setUser = function( user ) {
  this.user = user;

  if( !this._pusher.config.clientAuth ) {
    // TODO: future versions can allow:
    // 1. user information to either be sent to the server with the auth request
    // 2. make a call to the server so it can store the user information for later use with auth
    throw new Error( 'Right now the PusherChatAdapter only works with client authentication' );
  }

  this._pusher.config.clientAuth.user_id = user.id;
};

PusherChatAdapter.prototype.addRoom = function( room ) {
  if( !this.user ) {
    throw new Error( 'A user must be set before adding a room/subscribing to a channel' );
  }

  var roomName = roomNameToValidChannelName( room.name );
  var channel = this._pusher.subscribe( roomName );
  this._roomChannels[ roomName ] = channel;
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
