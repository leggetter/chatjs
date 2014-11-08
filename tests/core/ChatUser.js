var ChatUser = require( '../../src/core/ChatUser' );

describe( 'ChatUser', function() {

  it( 'should set the userId when creating a new ChatUser', function() {
    var userId = 'test-user';
    var chatUser = new ChatUser( userId );
    expect( chatUser.id ).toBe( userId );
  } );

} );
