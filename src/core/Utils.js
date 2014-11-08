var Utils = {};

Utils.fulfills = function(instance, protocol) {

  var protocolIsConstructor = typeof protocol === 'function';
  var requirement = protocolIsConstructor ? protocol.prototype : protocol;
  for (var item in requirement) {
  	var type = typeof instance[item];
  	var required = requirement[item];

    // console.log( 'item', item );
    // console.log( 'type', type );
    // console.log( 'required', required );

  	if (required === Number) {
  		if (type !== 'number') {
  			return false;
  		}
  	} else if (required === Object) {
  		if (type !== 'object') {
  			return false;
  		}
  	} else if (required === String) {
  		if (type !== 'string') {
  			return false;
  		}
  	} else if (required === Boolean) {
  		if (type !== 'boolean') {
  			return false;
  		}
  	} else {
  		if (type !== typeof required) {
  			return false;
  		}
  	}
  }

  return true;
};

module.exports = Utils;
