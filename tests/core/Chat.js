var Chat = require( '../../src/core/Chat' );
var ChatUser = require( '../../src/core/ChatUser' );
var ChatRoom = require( '../../src/core/ChatRoom' );
var ChatMessage = require( '../../src/core/ChatMessage' );
var PlatformAdapter = require( '../../src/core/PlatformAdapter' );

describe( 'Chat', function() {

  var emptyAdapter = null;

  beforeEach( function() {
    emptyAdapter = new PlatformAdapter();
  } );

  it( 'should contain a list of rooms', function() {
    var chat = new Chat( emptyAdapter );
    expect( chat.rooms ).toBeDefined();
  } );

  it( 'should be possible to add a room to the chat', function() {
    var chat = new Chat( emptyAdapter );
    var roomName = 'test';
    var room = chat.addRoom( roomName );
    expect( room ).toBeDefined();
    expect( room.name ).toBe( roomName );
  } );

} );

describe( 'Chat.addRoom', function() {

  var emptyAdapter = null;

  beforeEach( function() {
    emptyAdapter = new PlatformAdapter();
  } );

  it( 'should not be possible to add a duplicate room to the chat', function() {
    var chat = new Chat( emptyAdapter );
    var roomName = 'test';
    var firstRoom = chat.addRoom( roomName );

    var addSecondRoom = function() {
      chat.addRoom( roomName );
    };
    expect( addSecondRoom ).toThrow();
  } );

  it( 'should inform the PlatformAdapter when a room is added', function() {
    spyOn( emptyAdapter, 'addRoom' );
    var chat = new Chat( emptyAdapter );

    chat.addRoom( 'test' );

    expect( emptyAdapter.addRoom ).toHaveBeenCalled();
  } );

} );

describe( 'Chat.setUser', function() {

  var emptyAdapter = null;

  beforeEach( function() {
    emptyAdapter = new PlatformAdapter();
  } );

  it( 'should only accept a valid ChatUser', function() {
    var chat = new Chat( emptyAdapter );
    var user = new ChatUser();

    var setInvalidUser = function() {
      chat.setUser( {} );
    };

    expect( setInvalidUser ).toThrow();
  } );

  it( 'should be possible to set the chat user', function() {
    var chat = new Chat( emptyAdapter );
    var user = new ChatUser( 'test-user' );
    chat.setUser( user );

    expect( chat.user ).toBe( user );
  } );

} );

describe( 'Chat should offer ChatRoom functionality', function() {

  var emptyAdapter = null;

  beforeEach( function() {
    emptyAdapter = new PlatformAdapter();
  } );

  it( 'should create a default room', function() {
    var chat = new Chat( emptyAdapter );
    expect( chat.defaultRoom ).toBeDefined();
  } );

  it( 'should be possible to send a message', function() {
    var chat = new Chat( emptyAdapter );
    var message = new ChatMessage( 'test-user', 'test message' );
    var room = new ChatRoom( 'room name' );

    spyOn( room, 'send' );
    chat.defaultRoom = room;

    chat.send( message );

    expect( room.send ).toHaveBeenCalledWith( message );
  } );

  // it( 'should be possible for a user to join the chat', function() {
  //   var chat = new Chat( emptyAdapter );
  //   var user = new ChatUser( 'test-user' );
  //   chat.join( user );
  // } );

} );
