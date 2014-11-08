var ChatMessage = require( '../../src/core/ChatMessage.js' );

describe( 'ChatMessage', function() {

  it( 'should initialise with a userId and text', function() {
    var userId = 'test-user';
    var text = 'some message text';
    var message = new ChatMessage( userId, text );

    expect( message.userId ).toBe( userId );
    expect( message.text ).toBe( text );
  } );

  it( 'should set the time if one is passed to the constructor', function() {
    var date = new Date();
    var message = new ChatMessage( 'test-user', 'some text', date );

    expect( message.sentTime ).toBe( date );
  } );

  it( 'should set the time to the current time if one is not supplied to the constructor', function() {
    var date = new Date();
    var message = new ChatMessage( 'test-user', 'some text' );

    expect( message.sentTime ).toBeDefined();
  } );

} );
