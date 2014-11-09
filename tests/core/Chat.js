var Chat = require( '../../src/core/Chat' );
var ChatUser = require( '../../src/core/ChatUser' );
var ChatRoom = require( '../../src/core/ChatRoom' );
var ChatMessage = require( '../../src/core/ChatMessage' );
var PlatformAdapter = require( '../../src/core/PlatformAdapter' );

describe( 'Chat', function() {

  var emptyAdapter = null;
  var user = null;

  beforeEach( function() {
    emptyAdapter = new PlatformAdapter();
    user = new ChatUser( 'test-user' );
  } );

  it( 'should have a user set', function() {
    var chat = new Chat( user, emptyAdapter );
    expect( chat.user ).toBe( user );
  } );

  it( 'should have a user set on adapter', function() {
    spyOn( emptyAdapter, 'setUser' );
    var chat = new Chat( user, emptyAdapter );
    expect( emptyAdapter.setUser ).toHaveBeenCalledWith( user );
  } );

  it( 'should contain a list of rooms', function() {
    var chat = new Chat( user, emptyAdapter );
    expect( chat.rooms ).toBeDefined();
  } );

  it( 'should be possible to add a room to the chat', function() {
    var chat = new Chat( user, emptyAdapter );
    var roomName = 'test';
    var room = chat.addRoom( roomName );
    expect( room ).toBeDefined();
    expect( room.name ).toBe( roomName );
  } );

} );

describe( 'Chat.addRoom', function() {

  var emptyAdapter = null;
  var user = null;

  beforeEach( function() {
    emptyAdapter = new PlatformAdapter();
    user = new ChatUser( 'test-user' );
  } );

  it( 'should not be possible to add a duplicate room to the chat', function() {
    var chat = new Chat( user, emptyAdapter );
    var roomName = 'test';
    var firstRoom = chat.addRoom( roomName );

    var addSecondRoom = function() {
      chat.addRoom( roomName );
    };
    expect( addSecondRoom ).toThrow();
  } );

  it( 'should inform the PlatformAdapter when a room is added', function() {
    spyOn( emptyAdapter, 'addRoom' );
    var chat = new Chat( user, emptyAdapter );

    chat.addRoom( 'test' );

    expect( emptyAdapter.addRoom ).toHaveBeenCalled();
  } );

} );

describe( 'Chat should offer ChatRoom functionality', function() {

  var emptyAdapter = null;
  var user = null;

  beforeEach( function() {
    emptyAdapter = new PlatformAdapter();
    user = new ChatUser();
  } );

  it( 'should create a default room', function() {
    var chat = new Chat( user, emptyAdapter );
    expect( chat.defaultRoom ).toBeDefined();
  } );

  it( 'should be possible to send a message', function() {
    var chat = new Chat( user, emptyAdapter );
    var message = new ChatMessage( 'test-user', 'test message' );
    var room = new ChatRoom( 'room name', emptyAdapter );

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
