
function NullChatAdapter() {
}

NullChatAdapter.prototype.addRoom = function( room ) {
  console.log( 'addRoom', room );
};

NullChatAdapter.prototype.send = function( message ) {
  console.log( 'send', message );
};

module.exports = NullChatAdapter;
