var ChatMessage = require( '../../core/ChatMessage' );
var ChatUser = require( '../../core/ChatUser' );

function ConsoleChat( engine ) {
  this.user = null;

  this.engine = engine;
}

ConsoleChat.prototype.setUser = function( username ) {
  this.user = new ChatUser( username );

  this.engine.setUser( this.user );
};

ConsoleChat.prototype.send = function( text ) {
  if( !this.user ) {
    console.warn( 'Please set a user using "setUser( username )" before sending a message' );
    return;
  }

  var message = new ChatMessage( this.user.id, text );
  this.engine.send( message );
};

module.exports = ConsoleChat;
