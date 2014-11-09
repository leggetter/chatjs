!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self),o.ConsoleChat=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
 * A chat message
 *
 * @param {String} userId
 *    The id of the user sending the message
 * @param {String} text
 *    The message text contents
 * @param {Date} sentTime
 *    The time the message was sent. Optional: defaults to the current time.
 */
function ChatMessage( userId, text, sentTime ) {
  sentTime = sentTime || new Date();

  this.userId = userId;
  this.text = text;
  this.sentTime = sentTime;
}

/**
 * Unique ID of the user sending the message
 *
 * @type String
 */
ChatMessage.prototype.userId = '';

/**
 * Message text
 *
 * @type String
 */
ChatMessage.prototype.text = '';

/**
 * Time the message was sent.
 *
 * @type Date
 */
ChatMessage.prototype.sentTime = new Date();

module.exports = ChatMessage;

},{}],2:[function(_dereq_,module,exports){
var ChatMessage = _dereq_( '../../core/ChatMessage' );

function ConsoleChat( engine ) {
  this.engine = engine;
}

ConsoleChat.prototype.send = function( text ) {
  var message = new ChatMessage( this.engine.user.id, text );
  this.engine.send( message );
};

module.exports = ConsoleChat;

},{"../../core/ChatMessage":1}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9zcmMvY29yZS9DaGF0TWVzc2FnZS5qcyIsIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvc3JjL3VpLWZyYW1ld29ya3MvY29uc29sZS9mYWtlXzFjNGY1Njk0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBBIGNoYXQgbWVzc2FnZVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VySWRcbiAqICAgIFRoZSBpZCBvZiB0aGUgdXNlciBzZW5kaW5nIHRoZSBtZXNzYWdlXG4gKiBAcGFyYW0ge1N0cmluZ30gdGV4dFxuICogICAgVGhlIG1lc3NhZ2UgdGV4dCBjb250ZW50c1xuICogQHBhcmFtIHtEYXRlfSBzZW50VGltZVxuICogICAgVGhlIHRpbWUgdGhlIG1lc3NhZ2Ugd2FzIHNlbnQuIE9wdGlvbmFsOiBkZWZhdWx0cyB0byB0aGUgY3VycmVudCB0aW1lLlxuICovXG5mdW5jdGlvbiBDaGF0TWVzc2FnZSggdXNlcklkLCB0ZXh0LCBzZW50VGltZSApIHtcbiAgc2VudFRpbWUgPSBzZW50VGltZSB8fCBuZXcgRGF0ZSgpO1xuXG4gIHRoaXMudXNlcklkID0gdXNlcklkO1xuICB0aGlzLnRleHQgPSB0ZXh0O1xuICB0aGlzLnNlbnRUaW1lID0gc2VudFRpbWU7XG59XG5cbi8qKlxuICogVW5pcXVlIElEIG9mIHRoZSB1c2VyIHNlbmRpbmcgdGhlIG1lc3NhZ2VcbiAqXG4gKiBAdHlwZSBTdHJpbmdcbiAqL1xuQ2hhdE1lc3NhZ2UucHJvdG90eXBlLnVzZXJJZCA9ICcnO1xuXG4vKipcbiAqIE1lc3NhZ2UgdGV4dFxuICpcbiAqIEB0eXBlIFN0cmluZ1xuICovXG5DaGF0TWVzc2FnZS5wcm90b3R5cGUudGV4dCA9ICcnO1xuXG4vKipcbiAqIFRpbWUgdGhlIG1lc3NhZ2Ugd2FzIHNlbnQuXG4gKlxuICogQHR5cGUgRGF0ZVxuICovXG5DaGF0TWVzc2FnZS5wcm90b3R5cGUuc2VudFRpbWUgPSBuZXcgRGF0ZSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXRNZXNzYWdlO1xuIiwidmFyIENoYXRNZXNzYWdlID0gcmVxdWlyZSggJy4uLy4uL2NvcmUvQ2hhdE1lc3NhZ2UnICk7XG5cbmZ1bmN0aW9uIENvbnNvbGVDaGF0KCBlbmdpbmUgKSB7XG4gIHRoaXMuZW5naW5lID0gZW5naW5lO1xufVxuXG5Db25zb2xlQ2hhdC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKCB0ZXh0ICkge1xuICB2YXIgbWVzc2FnZSA9IG5ldyBDaGF0TWVzc2FnZSggdGhpcy5lbmdpbmUudXNlci5pZCwgdGV4dCApO1xuICB0aGlzLmVuZ2luZS5zZW5kKCBtZXNzYWdlICk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnNvbGVDaGF0O1xuIl19
(2)
});
