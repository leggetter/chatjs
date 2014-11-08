/**
 * The interface that specific platform adapters must implement.
 * It will be interacted with via the core and each platform must provide its own implementation.
 */
function PlatformAdapter() {
}

/**
 * Add a room to the chat.
 * In an implementation this may subscribe to a channel with
 * the name of the room.
 *
 * @param {ChatRoom} room
 *    The room to add to the chat.
 */
PlatformAdapter.prototype.addRoom = function( room ) {};

/**
 * Send a message.
 * In an implementation this may trigger or publish a message on a channel.
 *
 * @param {ChatMessage} message
 *    The message to send.
 */
PlatformAdapter.prototype.send = function( message ) {};

module.exports = PlatformAdapter;
