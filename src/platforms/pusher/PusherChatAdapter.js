var Base64 = require( 'js-base64' ).Base64;
var using = require( 'typester' ).using;
var ChatRoom = require( '../../core/ChatRoom' );
var ChatMessage = require( '../../core/ChatMessage' );

var NEW_MESSAGE_EVENT = 'client-new-message';

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

/**
 * Event name for new messages.
 * @type String
 */
PusherChatAdapter.NEW_MESSAGE_EVENT = NEW_MESSAGE_EVENT;

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

  var encodedRoomName = roomNameToValidChannelName( room.name );
  var channel = this._pusher.subscribe( encodedRoomName );
  this._roomChannels[ room.name ] = channel;
};

PusherChatAdapter.prototype.send = function( room, message ) {
  using( arguments )
    .verify( 'room' ).fulfills( ChatRoom )
    .verify( 'message' ).fulfills( ChatMessage );

  var roomChannel = this._roomChannels[ room.name ];
  roomChannel.trigger( NEW_MESSAGE_EVENT, message );
};

function roomNameToValidChannelName( name ) {
  // ensure any name is allowed as a channel
  // TODO: what about + sign?
  name = Base64.encode( name );
  return 'presence-' + name;
}

module.exports = PusherChatAdapter;
