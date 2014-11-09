!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.NullChatAdapter=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

function NullChatAdapter() {
}

NullChatAdapter.prototype.setUser = function( user ) {
  console.log( 'NullChatAdapter:setUser', user );
};

NullChatAdapter.prototype.addRoom = function( room ) {
  console.log( 'NullChatAdapter:addRoom', room );
};

NullChatAdapter.prototype.send = function( message ) {
  console.log( 'NullChatAdapter:send', message );
};

module.exports = NullChatAdapter;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9zcmMvcGxhdGZvcm1zL251bGwvZmFrZV9kOTMxMjMzMC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbmZ1bmN0aW9uIE51bGxDaGF0QWRhcHRlcigpIHtcbn1cblxuTnVsbENoYXRBZGFwdGVyLnByb3RvdHlwZS5zZXRVc2VyID0gZnVuY3Rpb24oIHVzZXIgKSB7XG4gIGNvbnNvbGUubG9nKCAnTnVsbENoYXRBZGFwdGVyOnNldFVzZXInLCB1c2VyICk7XG59O1xuXG5OdWxsQ2hhdEFkYXB0ZXIucHJvdG90eXBlLmFkZFJvb20gPSBmdW5jdGlvbiggcm9vbSApIHtcbiAgY29uc29sZS5sb2coICdOdWxsQ2hhdEFkYXB0ZXI6YWRkUm9vbScsIHJvb20gKTtcbn07XG5cbk51bGxDaGF0QWRhcHRlci5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKCBtZXNzYWdlICkge1xuICBjb25zb2xlLmxvZyggJ051bGxDaGF0QWRhcHRlcjpzZW5kJywgbWVzc2FnZSApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBOdWxsQ2hhdEFkYXB0ZXI7XG4iXX0=
(1)
});
