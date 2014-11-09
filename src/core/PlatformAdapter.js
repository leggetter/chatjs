/**
 * The interface that specific platform adapters must implement.
 * It will be interacted with via the core and each platform must provide its own implementation.
 */
function PlatformAdapter() {
}

/**
 * Set the current user for the chat.
 * An implementation should use this for presence information.
 *
 * @param {ChatUser} user
 *   The chat user.
 */
PlatformAdapter.prototype.setUser = function( user ) {};

/**
 * Add a room to the chat.
 * In an implementation this may retrieve information about the channel.
 * Some implementations may subscribe to a channel, but it may be more efficient
 * to only subscribe if the current user joins a room.
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
