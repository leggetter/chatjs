var ChatRoom = require( '../../src/core/ChatRoom.js' );
var ChatUser = require( '../../src/core/ChatUser' );

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

  it( 'should be possible for a user to join a room', function() {
    var userId = 'test-user';
    var room = new ChatRoom();
    var user = new ChatUser( userId );
    room.join( user );

    expect( room.users[ userId ] ).toBeDefined();
  } );

  it( 'should not be possible to add a user with the same id to a room twice', function() {
    var userId = 'test-user';
    var room = new ChatRoom();
    var user = new ChatUser( userId );
    room.join( user );

    var addUserAgain = function() {
      var secondUserWithSameId = new ChatUser( userId );
      room.join( secondUserWithSameId );
    };
    expect( addUserAgain ).toThrow();
  } );

} );
