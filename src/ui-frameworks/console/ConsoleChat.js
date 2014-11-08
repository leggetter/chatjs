var ChatMessage = require( '../../core/ChatMessage' );

function ConsoleChat( engine ) {
  this.user = null;

  this.engine = engine;
}

ConsoleChat.prototype.setUser = function( user ) {
  this.user = user;

  this.engine.setUser( user );
};

ConsoleChat.prototype.send = function( text ) {
  var message = new ChatMessage( this.user.id, text );
  // this.
};

module.exports = ConsoleChat;
