var ChatMessage = require( '../../core/ChatMessage' );

function ConsoleChat( engine ) {
  this.engine = engine;
}

ConsoleChat.prototype.send = function( text ) {
  var message = new ChatMessage( this.engine.user.id, text );
  this.engine.send( message );
};

module.exports = ConsoleChat;
