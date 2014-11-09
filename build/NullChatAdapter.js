!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.NullChatAdapter=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

function NullChatAdapter() {
}

NullChatAdapter.prototype.addRoom = function( room ) {
  console.log( 'addRoom', room );
};

NullChatAdapter.prototype.send = function( message ) {
  console.log( 'send', message );
};

module.exports = NullChatAdapter;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9zcmMvcGxhdGZvcm1zL251bGwvZmFrZV8xYzNiMGRlNi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5mdW5jdGlvbiBOdWxsQ2hhdEFkYXB0ZXIoKSB7XG59XG5cbk51bGxDaGF0QWRhcHRlci5wcm90b3R5cGUuYWRkUm9vbSA9IGZ1bmN0aW9uKCByb29tICkge1xuICBjb25zb2xlLmxvZyggJ2FkZFJvb20nLCByb29tICk7XG59O1xuXG5OdWxsQ2hhdEFkYXB0ZXIucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiggbWVzc2FnZSApIHtcbiAgY29uc29sZS5sb2coICdzZW5kJywgbWVzc2FnZSApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBOdWxsQ2hhdEFkYXB0ZXI7XG4iXX0=
(1)
});
