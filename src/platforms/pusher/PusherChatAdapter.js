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
  var channel = this._pusher.subscribe( roomName );
  this._roomChannels[ roomName ] = channel;
};

function roomNameToValidChannelName( name ) {
  return name;
}

module.exports = PusherChatAdapter;
