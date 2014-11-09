
function NullChatAdapter() {
}

NullChatAdapter.prototype.setUser = function( user ) {
  console.log( 'NullChatAdapter:setUser', user );
};

NullChatAdapter.prototype.addRoom = function( room ) {
  console.log( 'NullChatAdapter:addRoom', room );
};

NullChatAdapter.prototype.send = function( message ) {
  console.log( 'NullChatAdapter:send', message );
};

module.exports = NullChatAdapter;
