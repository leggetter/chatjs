var PlatformAdapter = require( '../../../src/core/PlatformAdapter' );
var PusherChatAdapter = require( '../../../src/platforms/pusher/PusherChatAdapter' );

var topiarist = require( 'topiarist' );
var ChatRoom = require( '../../../src/core/ChatRoom' );

describe( 'PusherChatAdapter', function() {
  it( 'should fulfil PlatformAdapter', function() {
    expect( topiarist.fulfills( PusherChatAdapter.prototype, PlatformAdapter ) ).toBe( true );
  } );

  it( 'should throw and Error if a room is added before a user is set', function() {
    var adapter = new PusherChatAdapter( null );
    var addRoom = function() {
      adapter.addRoom( new ChatRoom( 'test-room', adapter ) );
    };
    expect( addRoom ).toThrow();
  } );
} );
