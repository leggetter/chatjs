var PlatformAdapter = require( '../../../src/core/PlatformAdapter' );
var PusherChatAdapter = require( '../../../src/platforms/pusher/PusherChatAdapter' );

var topiarist = require( 'topiarist' );
var ChatRoom = require( '../../../src/core/ChatRoom' );
var ChatMessage = require( '../../../src/core/ChatMessage' );
var ChatUser = require( '../../../src/core/ChatUser' );

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

  it( 'should trigger a message via Pusher when a message is sent', function() {
    var fakeChannel = {
      trigger: function() {}
    };
    var fakePusher = {
      config: {
        clientAuth: {}
      },
      subscribe: function() {
        return fakeChannel;
      }
    };

    spyOn( fakeChannel, 'trigger' );

    var adapter = new PusherChatAdapter( fakePusher );
    var user = new ChatUser( 'test-user' );
    adapter.setUser( user );
    var room = new ChatRoom( 'lobby', adapter );
    adapter.addRoom( room );

    var message = new ChatMessage( 'some-user', 'some text' );
    adapter.send( room, message );

    expect( fakeChannel.trigger ).toHaveBeenCalledWith( PusherChatAdapter.NEW_MESSAGE_EVENT, message );
  } );
} );
