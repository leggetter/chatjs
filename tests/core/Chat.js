var Chat = require( '../../src/core/Chat' );
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
