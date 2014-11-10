# ChatJS

A realtime platform and UI framework independent JavaScript chat engine.

There are lots and lots of realtime chat solutions. However, all these solutions have some sort of tie-in to a realtime platform (e.g. Socket.IO), a front-end framework (e.g. jQuery) or both. The purpose of ChatJS is to offer a core chat engine that provides all the functionality needed for chat and extension points to plug in any realtime framework and any UI framework.

## Example

```html
<script src="chatjs.js"></script>
<script src="your-realtime-platform-adapter.js"></script>
<script>
// Create the current user
var user = new chatjs.ChatUser( 'some-user-id' );

// Create a platform adapter for your chose realtime platform
// Obviously, you'll need to write the implementation that fulfils
// the require adapter contract.
var adapter = new YourRealtimePlatformAdapter();

// Create the chat engine
var chatEngine = new chatjs.Chat( user, adapter );

// Register to receive new message events
chat.on( 'new-message', function( message ) {
  // Add to UI or UI model
} );

// Send a message
var message = chatjs.ChatMessage( user.id, 'some text' );
chat.send( message );
</script>
```

## How to integrate with a Realtime Platform

*This section is a work in progress*

Realtime frameworks are plugged in by fulfilling a `PlatformAdapter` contract and by interacting with a set of core objects.

The core chat objects include:

* `ChatRoom`
* `ChatUser`
* `ChatMessage`

## How to integrate with a UI framework

*This section is a work in progress*

As with the realtime framework the UI framework should interact with a set of core objects and receive information from those core object when building an manipulating the UI.

## Todo

### Planned

* User join and leave
* Support for multiple chat rooms
* Get list of rooms from the chat engine
* Get list of messages from a chat room
* Set user status e.g. away, busy, online, offline

### Under Consideration

* Private message another user
