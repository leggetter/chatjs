describe( 'Chat', function() {
  var Chat = require( '../src/Chat' );

  it( 'should contain a list of rooms', function() {
    var chat = new Chat();
    expect( chat.rooms ).toBeDefined();
  } );

  it( 'should be possible to add a room to the chat', function() {
    var chat = new Chat();
    var roomName = 'test';
    var room = chat.addRoom( roomName );
    expect( room ).toBeDefined();
    expect( room.name ).toBe( roomName );
  } );

  it( 'should not be possible to add a duplicate room to the chat', function() {
    var chat = new Chat();
    var roomName = 'test';
    var firstRoom = chat.addRoom( roomName );

    var addSecondRoom = function() {
      chat.addRoom( roomName );
    };
    expect( addSecondRoom ).toThrow();
  } );

} );
