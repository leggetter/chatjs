var ChatRoom = require( '../../src/core/ChatRoom.js' );
var ChatUser = require( '../../src/core/ChatUser' );
var ChatMessage = require( '../../src/core/ChatMessage' );
var PlatformAdapter = require( '../../src/core/PlatformAdapter' );

describe( 'ChatRoom', function() {

  var emptyAdapter = null;

  beforeEach( function() {
    emptyAdapter = new PlatformAdapter();
  } );

  it( 'should be possible to construct a ChatRoom with a name', function() {
    var name = 'test';
    var room = new ChatRoom( name, emptyAdapter );
    expect( room.name ).toBe( name );
  } );

  it( 'should be possible to send a message', function() {
    spyOn( emptyAdapter, 'send' );

    var room = new ChatRoom( 'test-room', emptyAdapter );
    var message = new ChatMessage( 'test-user', 'some text' );

    room.send( message );

    expect( emptyAdapter.send ).toHaveBeenCalledWith( room, message );
  } );

  it( 'should ensure a message provides the required properties', function() {

    var room = new ChatRoom( 'test-room', emptyAdapter );

    var sendNullObject = function() {
      room.send( null );
    };

    var sendEmptyObject = function() {
      room.send( {} );
    };

    expect( sendNullObject ).toThrow();
    expect( sendEmptyObject ).toThrow();
  } );

  it( 'should be possible for a user to join a room', function() {
    var userId = 'test-user';
    var room = new ChatRoom( 'test-room', emptyAdapter );
    var user = new ChatUser( userId );
    room.join( user );

    expect( room.users[ userId ] ).toBeDefined();
  } );

  it( 'should not be possible to add a user with the same id to a room twice', function() {
    var userId = 'test-user';
    var room = new ChatRoom( 'test-room', emptyAdapter );
    var user = new ChatUser( userId );
    room.join( user );

    var addUserAgain = function() {
      var secondUserWithSameId = new ChatUser( userId );
      room.join( secondUserWithSameId );
    };
    expect( addUserAgain ).toThrow();
  } );

  it( 'should trigger a new message event when a message is received', function() {
    var room = new ChatRoom( 'test-room', emptyAdapter );

    var receivedMessage = null;
    room.on( ChatRoom.MESSAGE_RECEIVED_EVENT, function( msg ) {
      receivedMessage = msg;
    } );

    var message = new ChatMessage( 'test-user', 'some-text' );
    room.send( message );
  } );

} );
