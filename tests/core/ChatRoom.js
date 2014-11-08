var ChatRoom = require( '../../src/core/ChatRoom.js' );

describe( 'ChatRoom', function() {

  it( 'should be possible to construct a ChatRoom with a name', function() {
    var name = 'test';
    var room = new ChatRoom( name );
    expect( room.name ).toBe( name );
  } );

  it( 'should be possible to send a message', function() {
    var room = new ChatRoom();
    expect( room.send ).toBeDefined();
  } );

} );
