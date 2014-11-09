var ChatMessage = require( '../../core/ChatMessage' );

function ConsoleChat( chat ) {
  this.chat = chat;

  this.chat.on( 'new-message', this.newMessage.bind( this ) );
  // this.engine.on( 'user-added', this.userJoined.bind( this ) );
  // this.engine.on( 'user-removed', this.userLeaves.bind( this ) );
}

ConsoleChat.prototype.send = function( text ) {
  var message = new ChatMessage( this.chat.user.id, text );
  this.chat.send( message );
};

ConsoleChat.prototype.newMessage = function( message ) {
  // TODO: format sentTime
  console.log( '%s said "%s" at %s', message.userId, message.text, message.sentTime );
};

module.exports = ConsoleChat;
