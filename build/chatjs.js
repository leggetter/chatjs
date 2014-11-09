!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.chatjs=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var ArgumentError = _dereq_('./ArgumentError');
var topiarist = _dereq_('topiarist');

function verifierMethod() {
  if(!this.skipVerification) {
    if(this.argValue === undefined) throw new this.ArgumentError(this.argName + ' argument must be provided.');

    this.METHOD_NAME(arg);
  }

  if(this.argsVerifier.argIndex < this.argsVerifier.arguments.length) {
    this.argsVerifier.constructor.pendingVerifier = this.argsVerifier;
  }

  return this.argsVerifier;
}
var verifierMethodStr = verifierMethod.toString().substring(verifierMethod.toString().indexOf('{') + 1, verifierMethod.toString().lastIndexOf('}'));

function ArgVerifier(argsVerifier, argName, argValue) {
  this.argsVerifier = argsVerifier;
  this.argName = argName;
  this.argValue = argValue;
}

ArgVerifier.addVerifier = function(verifier) {
  for(var methodName in verifier) {
    ArgVerifier.prototype['_' + methodName] = verifier[methodName];
    ArgVerifier.prototype[methodName] = new Function('arg', verifierMethodStr.replace('METHOD_NAME', '_' + methodName));
  }
};

Object.defineProperty(ArgVerifier.prototype, 'optionally', {
  get: function optionally() {
    if((this.argValue === undefined) || (this.argValue === null)) {
      this.skipVerification = true;
    }

    return this;
  }
});

ArgVerifier.prototype.ArgumentError = ArgumentError;

module.exports = ArgVerifier;

},{"./ArgumentError":3,"topiarist":9}],2:[function(_dereq_,module,exports){
var ArgVerifier = _dereq_('./ArgVerifier');
var ArgumentError = _dereq_('./ArgumentError');

function ArgsVerifier(arguments) {
  if(ArgsVerifier.pendingVerifier) throw pendingVerifierError();
  if(arguments === undefined) throw new ArgumentError('arguments argument must be provided');

  this.arguments = arguments;
  this.argIndex = 0;
}

ArgsVerifier.prototype.verify = function(argName) {
  ArgsVerifier.pendingVerifier = null;
  if(typeof(argName) != 'string') throw new TypeError('argName argument must be a String');

  return new ArgVerifier(this, argName, this.arguments[this.argIndex++]);
};

function pendingVerifierError() {
  var pendingVerifier = ArgsVerifier.pendingVerifier;
  var pendingVerifierArgs = Array.prototype.slice.call(pendingVerifier.arguments);
  ArgsVerifier.pendingVerifier = null;

  return new ArgumentError('only ' + pendingVerifier.argIndex + ' argument(s) verified but ' + pendingVerifierArgs.length +
    ' were provided: [' + pendingVerifierArgs.join(', ') + ']');
}

module.exports = ArgsVerifier;

},{"./ArgVerifier":1,"./ArgumentError":3}],3:[function(_dereq_,module,exports){
var topiarist = _dereq_('topiarist');

function ArgumentError(message) {
  this.name = 'ArgumentError';
  this.message = message;
}
topiarist.extend(ArgumentError, Error);
ArgumentError.prototype.constructor = ArgumentError;

module.exports = ArgumentError;

},{"topiarist":9}],4:[function(_dereq_,module,exports){
var topiarist = _dereq_('topiarist');

function ValidationError(message) {
  this.name = 'ValidationError';
  this.message = message;
}
topiarist.extend(ValidationError, Error);
ValidationError.prototype.constructor = ValidationError;

module.exports = ValidationError;

},{"topiarist":9}],5:[function(_dereq_,module,exports){
var ArgsVerifier = _dereq_('./ArgsVerifier');
var ArgVerifier = _dereq_('./ArgVerifier');
var TopiaristVerifier = _dereq_('./verifiers/TopiaristVerifier');
var NumberVerifier = _dereq_('./verifiers/NumberVerifier');
var NonEmptyVerifier = _dereq_('./verifiers/NonEmptyVerifier');
var ArgumentError = _dereq_('./ArgumentError');
var ValidationError = _dereq_('./ValidationError');

ArgVerifier.addVerifier(new TopiaristVerifier());
ArgVerifier.addVerifier(new NumberVerifier());
ArgVerifier.addVerifier(new NonEmptyVerifier());

exports.using = function(arguments) {
  return new ArgsVerifier(arguments);
};

exports.addVerifier = function(verifier) {
  ArgVerifier.addVerifier(verfier);
};

exports.ArgumentError = ArgumentError;
exports.ValidationError = ValidationError;

},{"./ArgVerifier":1,"./ArgsVerifier":2,"./ArgumentError":3,"./ValidationError":4,"./verifiers/NonEmptyVerifier":6,"./verifiers/NumberVerifier":7,"./verifiers/TopiaristVerifier":8}],6:[function(_dereq_,module,exports){
var ValidationError = _dereq_('../ValidationError');

function NonEmptyVerifier() {
}

NonEmptyVerifier.prototype.nonEmptyString = function() {
  this.isA(String);
  if(this.argValue === '') throw new ValidationError(this.argName + ' argument must be a non-empty string.');
};

NonEmptyVerifier.prototype.nonEmptyArray = function() {
  this.isA(Array);
  if(this.argValue.length == 0) throw new ValidationError(this.argName + ' argument must be a non-empty array.');
};

NonEmptyVerifier.prototype.object = function() {
  if(typeof(this.argValue) != 'object') throw new ValidationError(this.argName + ' argument must be an object.');
};

module.exports = NonEmptyVerifier;

},{"../ValidationError":4}],7:[function(_dereq_,module,exports){
var ValidationError = _dereq_('../ValidationError');

function NumberVerifier() {
}

NumberVerifier.prototype.number = function() {
  this.isA(Number);
  if((Number.isNaN(this.argValue)) || (this.argValue == Number.POSITIVE_INFINITY) ||
    (this.argValue == Number.NEGATIVE_INFINITY)) throw new ValidationError(this.argName + ' argument must be a real number.');
};

NumberVerifier.prototype.positiveNumber = function() {
  this.number();
  if(this.argValue <= 0) throw new ValidationError(this.argName + ' argument must be a positive number.');
};

NumberVerifier.prototype.negativeNumber = function() {
  this.number();
  if(this.argValue >= 0) throw new ValidationError(this.argName + ' argument must be a negative number.');
};

NumberVerifier.prototype.integerNumber = function() {
  this.number();
  if((this.argValue % 1) != 0) throw new ValidationError(this.argName + ' argument must be an integer number.');
};

module.exports = NumberVerifier;

},{"../ValidationError":4}],8:[function(_dereq_,module,exports){
var topiarist = _dereq_('topiarist');

function TopiaristVerifier() {
}

TopiaristVerifier.prototype.isA = function(type) {
  if(!topiarist.isA(this.argValue, type)) throw new TypeError(this.argName + ' argument must be a ' + type.name + '.');
};

TopiaristVerifier.prototype.classIsA = function(type) {
  if(!topiarist.classIsA(this.argValue, type)) throw new TypeError(this.argName + ' argument must be a ' + type.name + ' class.');
};

TopiaristVerifier.prototype.fulfills = function(type) {
  if(!topiarist.fulfills(this.argValue, type)) throw new TypeError(this.argName + ' argument must fulfill ' + type.name + '.');
};

TopiaristVerifier.prototype.classFulfills = function(type) {
  if(!topiarist.classFulfills(this.argValue, type)) throw new TypeError(this.argName + ' argument must fulfill ' + type.name + ' class.');
};

module.exports = TopiaristVerifier;

},{"topiarist":9}],9:[function(_dereq_,module,exports){
/**
 * @namespace
 * The topiarist namespace contains a number of functions for creating and querying a class hierarchy.
 * @name topiarist
 */
;(function(definition) {
	// export mechanism that works in node, browser and some other places.
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		// node style commonJS.
		module.exports = definition();
	} else if (typeof define === 'function') {
		if (define.amd) {
			define(definition);
		} else {
			define('topiarist', definition);
		}
	} else {
		// setting a global, as in e.g. a browser.
		this.topiarist = definition();
	}
})(function() {
	'use strict';

	var ERROR_MESSAGES = {
		SUBCLASS_NOT_CONSTRUCTOR: 'Subclass was not a constructor.',
		SUPERCLASS_NOT_CONSTRUCTOR: 'Superclass was not a constructor when extending {0}.',
		PROTOTYPE_NOT_CLEAN: 'Prototype must be clean to extend another class. {1} has already been defined on the ' +
			'prototype of {0}.',
		NOT_CONSTRUCTOR: '{0} definition for {1} must be a constructor, was {2}.',
		DOES_NOT_IMPLEMENT: 'Class {0} does not implement the attributes \'{1}\' from protocol {2}.',
		PROPERTY_ALREADY_PRESENT: 'Could not copy {0} from {1} to {2} as it was already present.',
		NULL: '{0} for {1} must not be null or undefined.',
		ALREADY_PRESENT: 'Could not copy {0} from {1} to {2} as it was already present.',
		WRONG_TYPE: '{0} for {1} should have been of type {2}, was {3}.',
		TWO_CONSTRUCTORS: 'Two different constructors provided for {0}, use only one of the classDefinition argument ' +
			'and extraProperties.constructor.',
		BAD_INSTALL: 'Can only install to the global environment or a constructor, can\'t install to a {0}.'
	};

	// Main API ////////////////////////////////////////////////////////////////////////////////////

	// only used for compatibility with shimmed, non es5 browsers.
	var internalUseNames = ['__multiparents__', '__interfaces__', '__assignable_from_cache__', '__id__'];

	/**
	 * Sets up the prototype chain for inheritance.
	 *
	 * <p>As well as setting up the prototype chain, this also copies so called 'class' definitions from the superclass
	 *  to the subclass and makes sure that constructor will return the correct thing.</p>
	 *
	 * @throws Error if the prototype has been modified before extend is called.
	 *
	 * @memberOf topiarist
	 * @param {?function} classDefinition The constructor of the subclass.
	 * @param {!function} superclass The constructor of the superclass.
	 * @param {?object} [extraProperties] An object of extra properties to add to the subclasses prototype.
	 */
	function extend(classDefinition, superclass, extraProperties) {
		var subclassName = className(classDefinition, 'Subclass');

		// Find the right classDefinition - either the one provided, a new one or the one from extraProperties.
		var extraPropertiesHasConstructor = typeof extraProperties !== 'undefined' &&
			extraProperties.hasOwnProperty('constructor') &&
			typeof extraProperties.constructor === 'function';

		if (classDefinition != null) {
			if (extraPropertiesHasConstructor && classDefinition !== extraProperties.constructor) {
				throw new Error(msg(ERROR_MESSAGES.TWO_CONSTRUCTORS, subclassName));
			}
		} else if (extraPropertiesHasConstructor) {
			classDefinition = extraProperties.constructor;
		} else {
			classDefinition = function() {
				superclass.apply(this, arguments);
			};
		}

		// check arguments
		assertArgumentOfType('function', classDefinition, ERROR_MESSAGES.SUBCLASS_NOT_CONSTRUCTOR);
		assertArgumentOfType('function', superclass, ERROR_MESSAGES.SUPERCLASS_NOT_CONSTRUCTOR, subclassName);
		assertNothingInObject(classDefinition.prototype, ERROR_MESSAGES.PROTOTYPE_NOT_CLEAN, subclassName);

		// copy class properties
		for (var staticPropertyName in superclass) {
			if (superclass.hasOwnProperty(staticPropertyName)) {
				// this is because we shouldn't copy nonenumerables, but removing enumerability isn't shimmable in ie8.
				// We need to make sure we don't inadvertently copy across any of the 'internal' fields we are using to
				//  keep track of things.
				if (internalUseNames.indexOf(staticPropertyName) >= 0) {
					continue;
				}

				classDefinition[staticPropertyName] = superclass[staticPropertyName];
			}
		}

		// create the superclass property on the subclass constructor
		Object.defineProperty(classDefinition, 'superclass', { enumerable: false, value: superclass });

		// create the prototype with a constructor function.
		classDefinition.prototype = Object.create(superclass.prototype, {
			"constructor": { enumerable: false,	value: classDefinition }
		});

		// copy everything from extra properties.
		if (extraProperties != null) {
			for (var property in extraProperties) {
				if (extraProperties.hasOwnProperty(property) && property !== 'constructor') {
					classDefinition.prototype[property] = extraProperties[property];
				}
			}
		}

		// this is purely to work around a bad ie8 shim, when ie8 is no longer needed it can be deleted.
		if (classDefinition.prototype.hasOwnProperty('__proto__')) {
			delete classDefinition.prototype['__proto__'];
		}

		clearAssignableCache(classDefinition, superclass);

		return classDefinition;
	}

	/**
	 * Mixes functionality in to a class.
	 *
	 * <p>Only functions are mixed in.</p>
	 *
	 * <p>Code in the mixin is sandboxed and only has access to a 'mixin instance' rather than the real instance.</p>
	 *
	 * @memberOf topiarist
	 * @param {function} target
	 * @param {function|Object} mix
	 */
	function mixin(target, mix) {
		assertArgumentOfType('function', target, ERROR_MESSAGES.NOT_CONSTRUCTOR, 'Target', 'mixin');

		mix = toFunction(
			mix,
			new TypeError(
				msg(
					ERROR_MESSAGES.WRONG_TYPE,
					'Mix',
					'mixin',
					'non-null object or function',
					mix === null ? 'null' : typeof mix
				)
			)
		);

		var targetPrototype = target.prototype, mixinProperties = mix.prototype, resultingProperties = {};
		var mixins = nonenum(target, '__multiparents__', []);
		var myMixId = mixins.length;

		for (var property in mixinProperties) {
			// property might spuriously be 'constructor' if you are in ie8 and using a shim.
			if (typeof mixinProperties[property] === 'function' && property !== 'constructor') {
				if (property in targetPrototype === false) {
					resultingProperties[property] = getSandboxedFunction(myMixId, mix, mixinProperties[property]);
				} else if (targetPrototype[property].__original__ !== mixinProperties[property]) {
					throw new Error(
						msg(
							ERROR_MESSAGES.PROPERTY_ALREADY_PRESENT,
							property,
							className(mix, 'mixin'),
							className(target, 'target')
						)
					);
				}
			} // we only mixin functions
		}

		copy(resultingProperties, targetPrototype);
		mixins.push(mix);

		clearAssignableCache(target, mix);

		return target;
	}

	/**
	 * Provides multiple inheritance through copying.
	 *
	 * <p>This is discouraged; you should prefer to use aggregation first, single inheritance (extends) second, mixins
	 *  third and this as a last resort.</p>
	 *
	 * @memberOf topiarist
	 * @param {function} target the class that should receive the functionality.
	 * @param {function|Object} parent the parent that provides the functionality.
	 */
	function inherit(target, parent) {
		assertArgumentOfType('function', target, ERROR_MESSAGES.NOT_CONSTRUCTOR, 'Target', 'inherit');
		parent = toFunction(
			parent,
			new TypeError(
				msg(
					ERROR_MESSAGES.WRONG_TYPE,
					'Parent',
					'inherit',
					'non-null object or function',
					parent === null ? 'null' : typeof parent
				)
			)
		);

		if (classIsA(target, parent)) {
			return target;
		}

		var resultingProperties = {};
		var targetPrototype = target.prototype;
		for (var propertyName in parent.prototype) {
			// These properties should be nonenumerable in modern browsers, but shims might create them in ie8.
			if (propertyName === 'constructor' || propertyName === '__proto__') {
				continue;
			}

			var notInTarget = targetPrototype[propertyName] === undefined;
			var parentHasNewerImplementation = notInTarget || isOverriderOf(propertyName, parent, target);
			if (parentHasNewerImplementation) {
				resultingProperties[propertyName] = parent.prototype[propertyName];
			} else {
				var areTheSame = targetPrototype[propertyName] === parent.prototype[propertyName];
				var targetIsUpToDate = areTheSame || isOverriderOf(propertyName, target, parent);
				if (targetIsUpToDate === false) {
					// target is not up to date, but we can't bring it up to date.
					throw new Error(
						msg(
							ERROR_MESSAGES.ALREADY_PRESENT,
							propertyName,
							className(parent, 'parent'),
							className(target, 'target')
						)
					);
				}
				// otherwise we don't need to do anything.
			}
		}

		copy(resultingProperties, targetPrototype);
		var multiparents = nonenum(target, '__multiparents__', []);
		multiparents.push(parent);

		clearAssignableCache(target, parent);

		return target;
	}

	/**
	 * Declares that the provided class will implement the provided protocol.
	 *
	 * <p>This involves immediately updating an internal list of interfaces attached to the class definition,
	 * and after a <code>setTimeout(0)</code> verifying that it does in fact implement the protocol.</p>
	 *
	 * <p>It can be called before the implementations are provided, i.e. immediately after the constructor.</p>
	 *
	 * @throws Error if there are any attributes on the protocol that are not matched on the class definition.
	 *
	 * @memberOf topiarist
	 * @param {function} classDefinition A constructor that should create objects matching the protocol.
	 * @param {function} protocol A constructor representing an interface that the class should implement.
	 */
	function implement(classDefinition, protocol) {
		doImplement(classDefinition, protocol);

		setTimeout(function() {
			assertHasImplemented(classDefinition, protocol);
		}, 0);

		return classDefinition;
	}

	/**
	 * Declares that the provided class implements the provided protocol.
	 *
	 * <p>This involves checking that it does in fact implement the protocol and updating an internal list of
	 *  interfaces attached to the class definition.</p>
	 *
	 * <p>It should be called after implementations are provided, i.e. at the end of the class definition.</p>
	 *
	 * @throws Error if there are any attributes on the protocol that are not matched on the class definition.
	 *
	 * @memberOf topiarist
	 * @param {function} classDefinition A constructor that should create objects matching the protocol.
	 * @param {function} protocol A constructor representing an interface that the class should implement.
	 */
	function hasImplemented(classDefinition, protocol) {
		doImplement(classDefinition, protocol);
		assertHasImplemented(classDefinition, protocol);

		return classDefinition;
	}

	/** @private */
	function doImplement(classDefinition, protocol) {
		assertArgumentOfType('function', classDefinition, ERROR_MESSAGES.NOT_CONSTRUCTOR, 'Class', 'hasImplemented');
		assertArgumentOfType('function', protocol, ERROR_MESSAGES.NOT_CONSTRUCTOR, 'Protocol', 'hasImplemented');

		var interfaces = nonenum(classDefinition, '__interfaces__', []);
		interfaces.push(protocol);

		clearAssignableCache(classDefinition, protocol);

		return classDefinition;
	}

	function assertHasImplemented(classDefinition, protocol) {
		var missing = missingAttributes(classDefinition, protocol);
		if (missing.length > 0) {
			throw new Error(
				msg(
					ERROR_MESSAGES.DOES_NOT_IMPLEMENT,
					className(classDefinition, 'provided'),
					missing.join('\', \''),
					className(protocol, 'provided')
				)
			);
		}
	}

	function fallbackIsAssignableFrom(classDefinition, parent) {
		if (classDefinition === parent || classDefinition.prototype instanceof parent) {
			return true;
		}
		var i, mixins = classDefinition.__multiparents__ || [], interfaces = classDefinition.__interfaces__ || [];

		// parent
		var superPrototype = (classDefinition.superclass && classDefinition.superclass.prototype) ||
			getPrototypeOf(classDefinition.prototype);

		if (
			superPrototype != null &&
			superPrototype !== classDefinition.prototype &&
			classIsA(superPrototype.constructor, parent)
		) {
			return true;
		}

		// mixin chain
		for (i = 0; i < mixins.length; ++i) {
			if (classIsA(mixins[i], parent)) {
				return true;
			}
		}

		// interfaces chain
		for (i = 0; i < interfaces.length; ++i) {
			if (classIsA(interfaces[i], parent)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Checks to see if a class is a descendant of another class / interface / mixin.
	 *
	 * <ul><li>A class is a descendant of another class if the other class is in its prototype chain.
	 * </li><li>A class is a descendant of an interface if it has called implement that class or
	 * any class that this class is a descendant of has called implement for that class.
	 * </li><li>A class is a descendant of a mixin if it has called mixin for that mixin or
	 * any class that this class is a descendant of has called mixin for that mixin.
	 * </li></ul>
	 *
	 * @memberOf topiarist
	 * @param {function} classDefinition the child class.
	 * @param {function} constructor the class to check if this class is a descendant of.
	 * @returns {boolean} true if the class is a descendant, false otherwise.
	 */
	function classIsA(classDefinition, constructor) {
		// sneaky edge case where we're checking against an object literal we've mixed in or against a prototype of
		//  something.
		if (typeof constructor === 'object' && constructor.hasOwnProperty('constructor')) {
			constructor = constructor.constructor;
		}

		assertArgumentOfType('function', classDefinition, ERROR_MESSAGES.NOT_CONSTRUCTOR, 'Class', 'classIsA');
		assertArgumentOfType('function', constructor, ERROR_MESSAGES.NOT_CONSTRUCTOR, 'Parent', 'classIsA');

		// This is just a caching wrapper around fallbackIsAssignableFrom.
		var cache = nonenum(classDefinition, '__assignable_from_cache__', {});
		var parentId = classId(constructor);
		if (cache[parentId] == null) {
			cache[parentId] = fallbackIsAssignableFrom(classDefinition, constructor);
		}

		return cache[parentId];
	}

	/**
	 * Checks to see if an instance is defined to be a child of a parent.
	 *
	 * @memberOf topiarist
	 * @param {Object} instance An instance object to check.
	 * @param {function} parent A potential parent (see classIsA).
	 * @returns {boolean} true if this instance has been constructed from something that is assignable from the parent
	 *  or is null, false otherwise.
	 */
	function isA(instance, parent) {
		if(instance == null) {
			return false;
		}

		// sneaky edge case where we're checking against an object literal we've mixed in or against a prototype of
		//  something.
		if (typeof parent === 'object' && parent.hasOwnProperty('constructor')) {
			parent = parent.constructor;
		}

		if((instance.constructor === parent) || (instance instanceof parent)) {
			return true;
		}

		return classIsA(instance.constructor, parent);
	}

	/**
	 * Does duck typing to determine if an instance object implements a protocol.
	 * <p>The protocol may be either an adhoc protocol, in which case it is an object or it can be a formal protocol in
	 *  which case it's a function.</p>
	 *
	 * <p>In an adhoc protocol, you can use Number, Object, String and Boolean to indicate the type required on the
	 *  instance.</p>
	 *
	 * @memberOf topiarist
	 * @param {Object} instance the object to check.
	 * @param {function|Object} protocol the description of the properties that the object should have.
	 * @returns {boolean} true if all the properties on the protocol were on the instance and of the right type.
	 */
	function fulfills(instance, protocol) {
		assertArgumentNotNullOrUndefined(instance, ERROR_MESSAGES.NULL, 'Object', 'fulfills');
		assertArgumentNotNullOrUndefined(protocol, ERROR_MESSAGES.NULL, 'Protocol', 'fulfills');

		// console.log( 'instance', instance );

		var protocolIsConstructor = typeof protocol === 'function';
		// console.log( 'protocolIsConstructor', protocolIsConstructor );
		if (protocolIsConstructor && isA(instance, protocol)) {
			// console.log( 'isA(instance, protocol)', isA(instance, protocol) );
			return true;
		}

		var requirement = protocolIsConstructor ? protocol.prototype : protocol;

		// console.log( 'requirement', requirement );

		for (var item in requirement) {
			var type = typeof instance[item];
			var required = requirement[item];

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

		// console.log( 'returning true' );
		return true;
	}

	/**
	 * Checks that a class provides a prototype that will fulfil a protocol.
	 *
	 * @memberOf topiarist
	 * @param {function} classDefinition
	 * @param {function|Object} protocol
	 * @returns {boolean}
	 */
	function classFulfills(classDefinition, protocol) {
		assertArgumentNotNullOrUndefined(classDefinition, ERROR_MESSAGES.NULL, 'Class', 'classFulfills');
		assertArgumentNotNullOrUndefined(protocol, ERROR_MESSAGES.NULL, 'Protocol', 'classFulfills');

		return fulfills(classDefinition.prototype, protocol);
	}

	// Auxillaries /////////////////////////////////////////////////////////////////////////////////

	var slice = Array.prototype.slice;

	function assertArgumentOfType(type, argument) {
		var actualType = typeof argument;
		if (actualType !== type) {
			var args = slice.call(arguments, 2);
			args.push(actualType);
			throw new TypeError(msg.apply(null, args));
		}
	}

	function assertNothingInObject(object) {
		for (var propertyName in object) {
			var args = slice.call(arguments, 1);
			args.push(propertyName);
			throw new Error(msg.apply(null, args));
		}
	}

	function assertArgumentNotNullOrUndefined(item) {
		if (item == null) {
			var args = slice.call(arguments, 1);
			throw new TypeError(msg.apply(null, args));
		}
	}

	function isOverriderOf(propertyName, sub, ancestor) {
		if (sub.prototype[propertyName] === ancestor.prototype[propertyName]) {
			return false;
		}

		var parents = getImmediateParents(sub);
		for (var i = 0; i < parents.length; ++i) {
			var parent = parents[i];
			if (parent.prototype[propertyName] === ancestor.prototype[propertyName]) return true;
			if (isOverriderOf(propertyName, parent, ancestor)) return true;
		}

		return false;
	}

	function getImmediateParents(sub) {
		var parents = (sub.__multiparents__ || []).slice();
		var parentPrototype = (sub.superclass && sub.superclass.prototype) || getPrototypeOf(sub.prototype);
		if (parentPrototype !== null && parentPrototype.constructor !== null && parentPrototype.constructor !== sub) {
			parents.push(parentPrototype.constructor);
		}
		return parents;
	}

	/**
	 * Interpolates a string with the arguments, used for error messages.
	 * @private
	 */
	function msg(str) {
		if (str == null) {
			return null;
		}

		for (var i = 1, len = arguments.length; i < len; ++i) {
			str = str.replace('{' + (i - 1) + '}', String(arguments[i]));
		}

		return str;
	}

	/**
	 * Returns a nonenumerable property if it exists, or creates one and returns that if it does not.
	 * @private
	 */
	function nonenum(object, propertyName, defaultValue) {
		var value = object[propertyName];

		if (typeof value === 'undefined') {
			value = defaultValue;
			Object.defineProperty(object, propertyName, {
				enumerable: false,
				value: value
			});
		}

		return value;
	}

	/**
	 * Easier for us if we treat everything as functions with prototypes. This function makes plain objects behave that
	 *  way.
	 * @private
	 */
	function toFunction(obj, couldNotCastError) {
		if (obj == null) {
			throw couldNotCastError;
		}

		var result;
		if (typeof obj === 'object') {
			if (obj.hasOwnProperty('constructor')) {
				if (obj.constructor.prototype !== obj) throw couldNotCastError;
				result = obj.constructor;
			} else {
				var EmptyInitialiser = function() {};
				EmptyInitialiser.prototype = obj;
				Object.defineProperty(obj, 'constructor', {
					enumerable: false, value: EmptyInitialiser
				});
				result = EmptyInitialiser;
			}
		} else if (typeof obj === 'function') {
			result = obj;
		} else {
			throw couldNotCastError;
		}
		return result;
	}

	/** @private */
	var currentId = 0;

	/**
	 * Returns the nonenumerable property __id__ of an object if it exists, otherwise adds one and returns that.
	 * @private
	 */
	function classId(func) {
		var result = func.__id__;
		if (result == null) {
			result = nonenum(func, '__id__', currentId++);
		}
		return result;
	}

	var nameFromToStringRegex = /^function\s?([^\s(]*)/;

	/**
	 * Gets the classname of an object or function if it can.  Otherwise returns the provided default. Getting the name
	 *  of a function is not a standard feature, so while this will work in many cases, it should not be relied upon
	 *  except for informational messages (e.g. logging and Error messages).
	 * @private
	 */
	function className(object, defaultName) {
		if (object == null) {
			return defaultName;
		}

		var result = '';
		if (typeof object === 'function') {
			if (object.name) {
				result = object.name;
			} else {
				var match = object.toString().match(nameFromToStringRegex);
				if (match !== null) {
					result = match[1];
				}
			}
		} else if (typeof object.constructor === 'function') {
			result = className(object.constructor, defaultName);
		}

		return result || defaultName;
	}

	/**
	 * Returns an array of all of the properties on a protocol that are not on classdef or are of a different type on
	 *  classdef.
	 * @private
	 */
	function missingAttributes(classdef, protocol) {
		var result = [], obj = classdef.prototype, requirement = protocol.prototype;
		for (var item in requirement) {
			if (typeof obj[item] !== typeof requirement[item]) {
				result.push(item);
			}
		}

		for (var item in protocol) {
			if (protocol.hasOwnProperty(item) &&  typeof classdef[item] !== typeof protocol[item]) {
				// If we're in ie8, our internal variables won't be nonenumerable, so we include a check for that here.
				if (internalUseNames.indexOf(item) < 0) {
					result.push(item + ' (class method)');
				}
			}
		}

		return result;
	}

	/**
	 * Copies all properties from the source to the target (including inherited properties) and optionally makes them
	 *  not enumerable.
	 * @private
	 */
	function copy(source, target, hidden) {
		for (var key in source) {
			Object.defineProperty(target, key, {
				enumerable: hidden !== true,
				configurable: true, writable: true,
				value: source[key]
			});
		}

		return target;
	}

	/**
	 * Turns a function into a method by using 'this' as the first argument.
	 * @private
	 */
	function makeMethod(func) {
		return function() {
			var args = [this].concat(slice.call(arguments));
			return func.apply(null, args);
		};
	}

	/**
	 * Mixin functions are sandboxed into their own instance.
	 * @private
	 */
	function getSandboxedFunction(myMixId, mix, func) {
		var result = function() {
			var mixInstances = nonenum(this, '__multiparentInstances__', []);
			var mixInstance = mixInstances[myMixId];
			if (mixInstance == null) {
				if (typeof mix === 'function') {
					mixInstance = new mix();
				} else {
					mixInstance = Object.create(mix);
				}
				// could add a nonenum pointer to __this__ or something if we wanted to allow escape from the sandbox.
				mixInstances[myMixId] = mixInstance;
			}
			return func.apply(mixInstance, arguments);
		};

		nonenum(result, '__original__', func);
		nonenum(result, '__source__', mix);

		return result;
	}

	/**
	 * Clears the `__assignable_from_cache__` cache for target and parent.
	 * @private
	 */
	function clearAssignableCache(target, parent) {
		if ('__assignable_from_cache__' in target) {
			delete target.__assignable_from_cache__[classId(parent)];
		}
	}


	function getPrototypeOf(obj) {
		if (Object.getPrototypeOf) {
			var proto = Object.getPrototypeOf(obj);

			// to avoid bad shams...
			if (proto !== obj) {
				return proto;
			}
		}

		// this is what most shams do, but sometimes it's wrong.
		if (obj.constructor && obj.constructor.prototype && obj.constructor.prototype !== obj) {
			return obj.constructor.prototype;
		}

		// this works only if we've been kind enough to supply a superclass property (which we do when we extend classes)
		if (obj.constructor && obj.constructor.superclass) {
			return obj.constructor.superclass.prototype;
		}

		// can't find a good prototype.
		return null;
	}


	// Exporting ///////////////////////////////////////////////////////////////////////////////////

	var methods = {
		'extend': extend, 'inherit': inherit, 'mixin': mixin, 'implement': implement,
		'hasImplemented': hasImplemented, 'classIsA': classIsA, 'isAssignableFrom': classIsA,
		'isA': isA, 'fulfills': fulfills, 'classFulfills': classFulfills
	};

	/* jshint evil:true */
	var global = (new Function('return this;'))();

	var exporting = {
		'exportTo': function(to) {
			copy(methods, to || global, true);
		},
		'install': function(target) {
			if (arguments.length > 0 && typeof target !== 'function') {
				throw new Error(msg(ERROR_MESSAGES.BAD_INSTALL, typeof target));
			}
			var isGlobalInstall = arguments.length < 1

			copy({
				isA: makeMethod(methods.isA),
				fulfills: makeMethod(methods.fulfills)
			}, isGlobalInstall ? Object.prototype : target.prototype, true);

			var itemsToInstallToFunction = {
				'classIsA': makeMethod(methods.classIsA),
				'implements': makeMethod(methods.implement),
				'hasImplemented': makeMethod(methods.hasImplemented),
				'fulfills': makeMethod(methods.classFulfills),
				// we can 'extend' a superclass to make a subclass.
				'extend': function(properties) {
					if (typeof properties === 'function') {
						return extend(properties, this);
					}
					return extend(null, this, properties);
				},
				'mixin': makeMethod(methods.mixin),
				'inherits': makeMethod(methods.inherit)
			};
			if (isGlobalInstall) {
				// no point in having subclass.extends unless it's global.
				itemsToInstallToFunction['extends'] = makeMethod(methods.extend);
			}

			copy(itemsToInstallToFunction, isGlobalInstall ? Function.prototype : target, isGlobalInstall);

			return target;
		}
	};
	exporting.export = exporting.exportTo; // for backwards compatibility

	methods.Base = exporting.install(function BaseClass() {});

	copy(methods, exporting);

	// not sure if this works in node-jasmine....
	if ('jasmine' in global) {
		var err = {};
		var getErr = function(key) {
			return function() {
				var message = ERROR_MESSAGES[key];
				var args = slice.call(arguments);
				args.unshift(message);
				var result = msg.apply(null, args);
				if (result === null) {
					throw new Error("No such error message " + key);
				}
				return result;
			};
		};
		for (var key in ERROR_MESSAGES) {
			err[key] = getErr(key);
		}
		exporting._err = err;
	}

	return exporting;
});

},{}],10:[function(_dereq_,module,exports){
var ChatRoom = _dereq_( './ChatRoom' );
var ChatUser = _dereq_( './ChatUser' );
var PlatformAdapter = _dereq_( './PlatformAdapter' );
var using = _dereq_( 'typester' ).using;

/**
 * A chat engine.
 *
 * @constructor
 *
 * @param {ChatUser} user
 *    The user of the chat.
 * @param {PlatformAdapter} adapter
 *    The hooks the core functionality up to a specific platform implemenation.
 */
function Chat( user, adapter ) {
  using( arguments )
    .verify( 'user' ).fulfills( ChatUser )
    .verify( 'adapter' ).fulfills( PlatformAdapter );

  /**
   * The current user in the chat.
   * @type ChatUser
   */
  this.user = user;

  /**
   * @type PlatformAdapter
   */
  this._adapter = adapter;

  /**
   * Chat rooms that are available.
   * A map of chat room name to ChatRoom object.
   * @type Map
   */
  this.rooms = {};

  this._adapter.setUser( user );

  /**
   * The default room for the chat
   * @type ChatRoom
   */
  this.defaultRoom = this.addRoom( 'lobby' );
}

/**
 * Send a message to the default chat room.
 *
 * @param {ChatMessage} message
 *    The message to send to the default chat room
 */
Chat.prototype.send = function( message ) {
  this.defaultRoom.send( message );
};

/**
 * Add a new room to the chat.
 * @param {String} name - The name of the chat room to be added.
 * @return {ChatRoom} The newly created room
 */
Chat.prototype.addRoom = function( name ) {
  if( this.rooms[ name ] !== undefined ) {
    throw new Error( 'Room with name "' + name + '" already exists' );
  }

  var room = new ChatRoom( name, this._adapter );
  this.rooms[ name ] = room;

  this._adapter.addRoom( room );

  return room;
};

module.exports = Chat;





// on( 'new-message' )
// on( 'new')

// addMessageListener( listener )

},{"./ChatRoom":12,"./ChatUser":13,"./PlatformAdapter":14,"typester":5}],11:[function(_dereq_,module,exports){
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

},{}],12:[function(_dereq_,module,exports){
var PlatformAdapter = _dereq_( './PlatformAdapter' );
var ChatMessage = _dereq_( './ChatMessage' );
var using = _dereq_( 'typester' ).using;

/**
 * A chat room.
 */
function ChatRoom( name, adapter ) {
  using( arguments )
    .verify( 'name' ).fulfills( String )
    .verify( 'adapter' ).fulfills( PlatformAdapter );

  /**
   * The name of the room
   * @type String
   */
  this.name = name;

  /**
   * The users in the chat room.
   * A lookup of user ID to chat user
   * @type Map
   */
  this.users = {};

  // TODO: messages?

  /**
   * @type PlatformAdapter
   * @private
   */
  this._adapter = adapter;
}

/**
 * Send the message.
 *
 * @param {ChatMessage} message
 */
ChatRoom.prototype.send = function( message ) {
  using( arguments )
    .verify( 'message' ).fulfills( ChatMessage );

  this._adapter.send( message );
};

/**
 * Adds a user to a room.
 */
ChatRoom.prototype.join = function( user ) {
  if( this.users[ user.id ] !== undefined ) {
    throw new Error( 'A user with the id "' + user.id + '" is already in the room. Cannot join the room twice.' );
  }
  this.users[ user.id ] = user;
};

module.exports = ChatRoom;

},{"./ChatMessage":11,"./PlatformAdapter":14,"typester":5}],13:[function(_dereq_,module,exports){
function ChatUser( userId ) {
  /**
   * Unique ID of the user sending the message
   *
   * @type String
   */
  this.id = userId;
}

module.exports = ChatUser;

},{}],14:[function(_dereq_,module,exports){
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

},{}],15:[function(_dereq_,module,exports){
module.exports = {
  Chat: _dereq_( './Chat' ),
  ChatUser: _dereq_( './ChatUser' ),
  ChatMessage: _dereq_( './ChatMessage' )
};

},{"./Chat":10,"./ChatMessage":11,"./ChatUser":13}]},{},[15])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9ub2RlX21vZHVsZXMvdHlwZXN0ZXIvbGliL0FyZ1ZlcmlmaWVyLmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9ub2RlX21vZHVsZXMvdHlwZXN0ZXIvbGliL0FyZ3NWZXJpZmllci5qcyIsIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvbm9kZV9tb2R1bGVzL3R5cGVzdGVyL2xpYi9Bcmd1bWVudEVycm9yLmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9ub2RlX21vZHVsZXMvdHlwZXN0ZXIvbGliL1ZhbGlkYXRpb25FcnJvci5qcyIsIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvbm9kZV9tb2R1bGVzL3R5cGVzdGVyL2xpYi90eXBlc3Rlci5qcyIsIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvbm9kZV9tb2R1bGVzL3R5cGVzdGVyL2xpYi92ZXJpZmllcnMvTm9uRW1wdHlWZXJpZmllci5qcyIsIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvbm9kZV9tb2R1bGVzL3R5cGVzdGVyL2xpYi92ZXJpZmllcnMvTnVtYmVyVmVyaWZpZXIuanMiLCIvVXNlcnMvbGVnZ2V0dGVyL2xlZ2dldHRlci9naXQvY2hhdGpzL25vZGVfbW9kdWxlcy90eXBlc3Rlci9saWIvdmVyaWZpZXJzL1RvcGlhcmlzdFZlcmlmaWVyLmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9ub2RlX21vZHVsZXMvdHlwZXN0ZXIvbm9kZV9tb2R1bGVzL3RvcGlhcmlzdC9saWIvdG9waWFyaXN0LmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9zcmMvY29yZS9DaGF0LmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9zcmMvY29yZS9DaGF0TWVzc2FnZS5qcyIsIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvc3JjL2NvcmUvQ2hhdFJvb20uanMiLCIvVXNlcnMvbGVnZ2V0dGVyL2xlZ2dldHRlci9naXQvY2hhdGpzL3NyYy9jb3JlL0NoYXRVc2VyLmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9zcmMvY29yZS9QbGF0Zm9ybUFkYXB0ZXIuanMiLCIvVXNlcnMvbGVnZ2V0dGVyL2xlZ2dldHRlci9naXQvY2hhdGpzL3NyYy9jb3JlL2Zha2VfYjYyZGU3MzMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3IxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBBcmd1bWVudEVycm9yID0gcmVxdWlyZSgnLi9Bcmd1bWVudEVycm9yJyk7XG52YXIgdG9waWFyaXN0ID0gcmVxdWlyZSgndG9waWFyaXN0Jyk7XG5cbmZ1bmN0aW9uIHZlcmlmaWVyTWV0aG9kKCkge1xuICBpZighdGhpcy5za2lwVmVyaWZpY2F0aW9uKSB7XG4gICAgaWYodGhpcy5hcmdWYWx1ZSA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgdGhpcy5Bcmd1bWVudEVycm9yKHRoaXMuYXJnTmFtZSArICcgYXJndW1lbnQgbXVzdCBiZSBwcm92aWRlZC4nKTtcblxuICAgIHRoaXMuTUVUSE9EX05BTUUoYXJnKTtcbiAgfVxuXG4gIGlmKHRoaXMuYXJnc1ZlcmlmaWVyLmFyZ0luZGV4IDwgdGhpcy5hcmdzVmVyaWZpZXIuYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuYXJnc1ZlcmlmaWVyLmNvbnN0cnVjdG9yLnBlbmRpbmdWZXJpZmllciA9IHRoaXMuYXJnc1ZlcmlmaWVyO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuYXJnc1ZlcmlmaWVyO1xufVxudmFyIHZlcmlmaWVyTWV0aG9kU3RyID0gdmVyaWZpZXJNZXRob2QudG9TdHJpbmcoKS5zdWJzdHJpbmcodmVyaWZpZXJNZXRob2QudG9TdHJpbmcoKS5pbmRleE9mKCd7JykgKyAxLCB2ZXJpZmllck1ldGhvZC50b1N0cmluZygpLmxhc3RJbmRleE9mKCd9JykpO1xuXG5mdW5jdGlvbiBBcmdWZXJpZmllcihhcmdzVmVyaWZpZXIsIGFyZ05hbWUsIGFyZ1ZhbHVlKSB7XG4gIHRoaXMuYXJnc1ZlcmlmaWVyID0gYXJnc1ZlcmlmaWVyO1xuICB0aGlzLmFyZ05hbWUgPSBhcmdOYW1lO1xuICB0aGlzLmFyZ1ZhbHVlID0gYXJnVmFsdWU7XG59XG5cbkFyZ1ZlcmlmaWVyLmFkZFZlcmlmaWVyID0gZnVuY3Rpb24odmVyaWZpZXIpIHtcbiAgZm9yKHZhciBtZXRob2ROYW1lIGluIHZlcmlmaWVyKSB7XG4gICAgQXJnVmVyaWZpZXIucHJvdG90eXBlWydfJyArIG1ldGhvZE5hbWVdID0gdmVyaWZpZXJbbWV0aG9kTmFtZV07XG4gICAgQXJnVmVyaWZpZXIucHJvdG90eXBlW21ldGhvZE5hbWVdID0gbmV3IEZ1bmN0aW9uKCdhcmcnLCB2ZXJpZmllck1ldGhvZFN0ci5yZXBsYWNlKCdNRVRIT0RfTkFNRScsICdfJyArIG1ldGhvZE5hbWUpKTtcbiAgfVxufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEFyZ1ZlcmlmaWVyLnByb3RvdHlwZSwgJ29wdGlvbmFsbHknLCB7XG4gIGdldDogZnVuY3Rpb24gb3B0aW9uYWxseSgpIHtcbiAgICBpZigodGhpcy5hcmdWYWx1ZSA9PT0gdW5kZWZpbmVkKSB8fCAodGhpcy5hcmdWYWx1ZSA9PT0gbnVsbCkpIHtcbiAgICAgIHRoaXMuc2tpcFZlcmlmaWNhdGlvbiA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn0pO1xuXG5BcmdWZXJpZmllci5wcm90b3R5cGUuQXJndW1lbnRFcnJvciA9IEFyZ3VtZW50RXJyb3I7XG5cbm1vZHVsZS5leHBvcnRzID0gQXJnVmVyaWZpZXI7XG4iLCJ2YXIgQXJnVmVyaWZpZXIgPSByZXF1aXJlKCcuL0FyZ1ZlcmlmaWVyJyk7XG52YXIgQXJndW1lbnRFcnJvciA9IHJlcXVpcmUoJy4vQXJndW1lbnRFcnJvcicpO1xuXG5mdW5jdGlvbiBBcmdzVmVyaWZpZXIoYXJndW1lbnRzKSB7XG4gIGlmKEFyZ3NWZXJpZmllci5wZW5kaW5nVmVyaWZpZXIpIHRocm93IHBlbmRpbmdWZXJpZmllckVycm9yKCk7XG4gIGlmKGFyZ3VtZW50cyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgQXJndW1lbnRFcnJvcignYXJndW1lbnRzIGFyZ3VtZW50IG11c3QgYmUgcHJvdmlkZWQnKTtcblxuICB0aGlzLmFyZ3VtZW50cyA9IGFyZ3VtZW50cztcbiAgdGhpcy5hcmdJbmRleCA9IDA7XG59XG5cbkFyZ3NWZXJpZmllci5wcm90b3R5cGUudmVyaWZ5ID0gZnVuY3Rpb24oYXJnTmFtZSkge1xuICBBcmdzVmVyaWZpZXIucGVuZGluZ1ZlcmlmaWVyID0gbnVsbDtcbiAgaWYodHlwZW9mKGFyZ05hbWUpICE9ICdzdHJpbmcnKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdhcmdOYW1lIGFyZ3VtZW50IG11c3QgYmUgYSBTdHJpbmcnKTtcblxuICByZXR1cm4gbmV3IEFyZ1ZlcmlmaWVyKHRoaXMsIGFyZ05hbWUsIHRoaXMuYXJndW1lbnRzW3RoaXMuYXJnSW5kZXgrK10pO1xufTtcblxuZnVuY3Rpb24gcGVuZGluZ1ZlcmlmaWVyRXJyb3IoKSB7XG4gIHZhciBwZW5kaW5nVmVyaWZpZXIgPSBBcmdzVmVyaWZpZXIucGVuZGluZ1ZlcmlmaWVyO1xuICB2YXIgcGVuZGluZ1ZlcmlmaWVyQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHBlbmRpbmdWZXJpZmllci5hcmd1bWVudHMpO1xuICBBcmdzVmVyaWZpZXIucGVuZGluZ1ZlcmlmaWVyID0gbnVsbDtcblxuICByZXR1cm4gbmV3IEFyZ3VtZW50RXJyb3IoJ29ubHkgJyArIHBlbmRpbmdWZXJpZmllci5hcmdJbmRleCArICcgYXJndW1lbnQocykgdmVyaWZpZWQgYnV0ICcgKyBwZW5kaW5nVmVyaWZpZXJBcmdzLmxlbmd0aCArXG4gICAgJyB3ZXJlIHByb3ZpZGVkOiBbJyArIHBlbmRpbmdWZXJpZmllckFyZ3Muam9pbignLCAnKSArICddJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXJnc1ZlcmlmaWVyO1xuIiwidmFyIHRvcGlhcmlzdCA9IHJlcXVpcmUoJ3RvcGlhcmlzdCcpO1xuXG5mdW5jdGlvbiBBcmd1bWVudEVycm9yKG1lc3NhZ2UpIHtcbiAgdGhpcy5uYW1lID0gJ0FyZ3VtZW50RXJyb3InO1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxudG9waWFyaXN0LmV4dGVuZChBcmd1bWVudEVycm9yLCBFcnJvcik7XG5Bcmd1bWVudEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFyZ3VtZW50RXJyb3I7XG5cbm1vZHVsZS5leHBvcnRzID0gQXJndW1lbnRFcnJvcjtcbiIsInZhciB0b3BpYXJpc3QgPSByZXF1aXJlKCd0b3BpYXJpc3QnKTtcblxuZnVuY3Rpb24gVmFsaWRhdGlvbkVycm9yKG1lc3NhZ2UpIHtcbiAgdGhpcy5uYW1lID0gJ1ZhbGlkYXRpb25FcnJvcic7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG50b3BpYXJpc3QuZXh0ZW5kKFZhbGlkYXRpb25FcnJvciwgRXJyb3IpO1xuVmFsaWRhdGlvbkVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFZhbGlkYXRpb25FcnJvcjtcblxubW9kdWxlLmV4cG9ydHMgPSBWYWxpZGF0aW9uRXJyb3I7XG4iLCJ2YXIgQXJnc1ZlcmlmaWVyID0gcmVxdWlyZSgnLi9BcmdzVmVyaWZpZXInKTtcbnZhciBBcmdWZXJpZmllciA9IHJlcXVpcmUoJy4vQXJnVmVyaWZpZXInKTtcbnZhciBUb3BpYXJpc3RWZXJpZmllciA9IHJlcXVpcmUoJy4vdmVyaWZpZXJzL1RvcGlhcmlzdFZlcmlmaWVyJyk7XG52YXIgTnVtYmVyVmVyaWZpZXIgPSByZXF1aXJlKCcuL3ZlcmlmaWVycy9OdW1iZXJWZXJpZmllcicpO1xudmFyIE5vbkVtcHR5VmVyaWZpZXIgPSByZXF1aXJlKCcuL3ZlcmlmaWVycy9Ob25FbXB0eVZlcmlmaWVyJyk7XG52YXIgQXJndW1lbnRFcnJvciA9IHJlcXVpcmUoJy4vQXJndW1lbnRFcnJvcicpO1xudmFyIFZhbGlkYXRpb25FcnJvciA9IHJlcXVpcmUoJy4vVmFsaWRhdGlvbkVycm9yJyk7XG5cbkFyZ1ZlcmlmaWVyLmFkZFZlcmlmaWVyKG5ldyBUb3BpYXJpc3RWZXJpZmllcigpKTtcbkFyZ1ZlcmlmaWVyLmFkZFZlcmlmaWVyKG5ldyBOdW1iZXJWZXJpZmllcigpKTtcbkFyZ1ZlcmlmaWVyLmFkZFZlcmlmaWVyKG5ldyBOb25FbXB0eVZlcmlmaWVyKCkpO1xuXG5leHBvcnRzLnVzaW5nID0gZnVuY3Rpb24oYXJndW1lbnRzKSB7XG4gIHJldHVybiBuZXcgQXJnc1ZlcmlmaWVyKGFyZ3VtZW50cyk7XG59O1xuXG5leHBvcnRzLmFkZFZlcmlmaWVyID0gZnVuY3Rpb24odmVyaWZpZXIpIHtcbiAgQXJnVmVyaWZpZXIuYWRkVmVyaWZpZXIodmVyZmllcik7XG59O1xuXG5leHBvcnRzLkFyZ3VtZW50RXJyb3IgPSBBcmd1bWVudEVycm9yO1xuZXhwb3J0cy5WYWxpZGF0aW9uRXJyb3IgPSBWYWxpZGF0aW9uRXJyb3I7XG4iLCJ2YXIgVmFsaWRhdGlvbkVycm9yID0gcmVxdWlyZSgnLi4vVmFsaWRhdGlvbkVycm9yJyk7XG5cbmZ1bmN0aW9uIE5vbkVtcHR5VmVyaWZpZXIoKSB7XG59XG5cbk5vbkVtcHR5VmVyaWZpZXIucHJvdG90eXBlLm5vbkVtcHR5U3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXNBKFN0cmluZyk7XG4gIGlmKHRoaXMuYXJnVmFsdWUgPT09ICcnKSB0aHJvdyBuZXcgVmFsaWRhdGlvbkVycm9yKHRoaXMuYXJnTmFtZSArICcgYXJndW1lbnQgbXVzdCBiZSBhIG5vbi1lbXB0eSBzdHJpbmcuJyk7XG59O1xuXG5Ob25FbXB0eVZlcmlmaWVyLnByb3RvdHlwZS5ub25FbXB0eUFycmF5ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXNBKEFycmF5KTtcbiAgaWYodGhpcy5hcmdWYWx1ZS5sZW5ndGggPT0gMCkgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvcih0aGlzLmFyZ05hbWUgKyAnIGFyZ3VtZW50IG11c3QgYmUgYSBub24tZW1wdHkgYXJyYXkuJyk7XG59O1xuXG5Ob25FbXB0eVZlcmlmaWVyLnByb3RvdHlwZS5vYmplY3QgPSBmdW5jdGlvbigpIHtcbiAgaWYodHlwZW9mKHRoaXMuYXJnVmFsdWUpICE9ICdvYmplY3QnKSB0aHJvdyBuZXcgVmFsaWRhdGlvbkVycm9yKHRoaXMuYXJnTmFtZSArICcgYXJndW1lbnQgbXVzdCBiZSBhbiBvYmplY3QuJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE5vbkVtcHR5VmVyaWZpZXI7XG4iLCJ2YXIgVmFsaWRhdGlvbkVycm9yID0gcmVxdWlyZSgnLi4vVmFsaWRhdGlvbkVycm9yJyk7XG5cbmZ1bmN0aW9uIE51bWJlclZlcmlmaWVyKCkge1xufVxuXG5OdW1iZXJWZXJpZmllci5wcm90b3R5cGUubnVtYmVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXNBKE51bWJlcik7XG4gIGlmKChOdW1iZXIuaXNOYU4odGhpcy5hcmdWYWx1ZSkpIHx8ICh0aGlzLmFyZ1ZhbHVlID09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkgfHxcbiAgICAodGhpcy5hcmdWYWx1ZSA9PSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpKSB0aHJvdyBuZXcgVmFsaWRhdGlvbkVycm9yKHRoaXMuYXJnTmFtZSArICcgYXJndW1lbnQgbXVzdCBiZSBhIHJlYWwgbnVtYmVyLicpO1xufTtcblxuTnVtYmVyVmVyaWZpZXIucHJvdG90eXBlLnBvc2l0aXZlTnVtYmVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMubnVtYmVyKCk7XG4gIGlmKHRoaXMuYXJnVmFsdWUgPD0gMCkgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvcih0aGlzLmFyZ05hbWUgKyAnIGFyZ3VtZW50IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXIuJyk7XG59O1xuXG5OdW1iZXJWZXJpZmllci5wcm90b3R5cGUubmVnYXRpdmVOdW1iZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5udW1iZXIoKTtcbiAgaWYodGhpcy5hcmdWYWx1ZSA+PSAwKSB0aHJvdyBuZXcgVmFsaWRhdGlvbkVycm9yKHRoaXMuYXJnTmFtZSArICcgYXJndW1lbnQgbXVzdCBiZSBhIG5lZ2F0aXZlIG51bWJlci4nKTtcbn07XG5cbk51bWJlclZlcmlmaWVyLnByb3RvdHlwZS5pbnRlZ2VyTnVtYmVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMubnVtYmVyKCk7XG4gIGlmKCh0aGlzLmFyZ1ZhbHVlICUgMSkgIT0gMCkgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvcih0aGlzLmFyZ05hbWUgKyAnIGFyZ3VtZW50IG11c3QgYmUgYW4gaW50ZWdlciBudW1iZXIuJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE51bWJlclZlcmlmaWVyO1xuIiwidmFyIHRvcGlhcmlzdCA9IHJlcXVpcmUoJ3RvcGlhcmlzdCcpO1xuXG5mdW5jdGlvbiBUb3BpYXJpc3RWZXJpZmllcigpIHtcbn1cblxuVG9waWFyaXN0VmVyaWZpZXIucHJvdG90eXBlLmlzQSA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYoIXRvcGlhcmlzdC5pc0EodGhpcy5hcmdWYWx1ZSwgdHlwZSkpIHRocm93IG5ldyBUeXBlRXJyb3IodGhpcy5hcmdOYW1lICsgJyBhcmd1bWVudCBtdXN0IGJlIGEgJyArIHR5cGUubmFtZSArICcuJyk7XG59O1xuXG5Ub3BpYXJpc3RWZXJpZmllci5wcm90b3R5cGUuY2xhc3NJc0EgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmKCF0b3BpYXJpc3QuY2xhc3NJc0EodGhpcy5hcmdWYWx1ZSwgdHlwZSkpIHRocm93IG5ldyBUeXBlRXJyb3IodGhpcy5hcmdOYW1lICsgJyBhcmd1bWVudCBtdXN0IGJlIGEgJyArIHR5cGUubmFtZSArICcgY2xhc3MuJyk7XG59O1xuXG5Ub3BpYXJpc3RWZXJpZmllci5wcm90b3R5cGUuZnVsZmlsbHMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmKCF0b3BpYXJpc3QuZnVsZmlsbHModGhpcy5hcmdWYWx1ZSwgdHlwZSkpIHRocm93IG5ldyBUeXBlRXJyb3IodGhpcy5hcmdOYW1lICsgJyBhcmd1bWVudCBtdXN0IGZ1bGZpbGwgJyArIHR5cGUubmFtZSArICcuJyk7XG59O1xuXG5Ub3BpYXJpc3RWZXJpZmllci5wcm90b3R5cGUuY2xhc3NGdWxmaWxscyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYoIXRvcGlhcmlzdC5jbGFzc0Z1bGZpbGxzKHRoaXMuYXJnVmFsdWUsIHR5cGUpKSB0aHJvdyBuZXcgVHlwZUVycm9yKHRoaXMuYXJnTmFtZSArICcgYXJndW1lbnQgbXVzdCBmdWxmaWxsICcgKyB0eXBlLm5hbWUgKyAnIGNsYXNzLicpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUb3BpYXJpc3RWZXJpZmllcjtcbiIsIi8qKlxuICogQG5hbWVzcGFjZVxuICogVGhlIHRvcGlhcmlzdCBuYW1lc3BhY2UgY29udGFpbnMgYSBudW1iZXIgb2YgZnVuY3Rpb25zIGZvciBjcmVhdGluZyBhbmQgcXVlcnlpbmcgYSBjbGFzcyBoaWVyYXJjaHkuXG4gKiBAbmFtZSB0b3BpYXJpc3RcbiAqL1xuOyhmdW5jdGlvbihkZWZpbml0aW9uKSB7XG5cdC8vIGV4cG9ydCBtZWNoYW5pc20gdGhhdCB3b3JrcyBpbiBub2RlLCBicm93c2VyIGFuZCBzb21lIG90aGVyIHBsYWNlcy5cblx0aWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHQvLyBub2RlIHN0eWxlIGNvbW1vbkpTLlxuXHRcdG1vZHVsZS5leHBvcnRzID0gZGVmaW5pdGlvbigpO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicpIHtcblx0XHRpZiAoZGVmaW5lLmFtZCkge1xuXHRcdFx0ZGVmaW5lKGRlZmluaXRpb24pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRkZWZpbmUoJ3RvcGlhcmlzdCcsIGRlZmluaXRpb24pO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHQvLyBzZXR0aW5nIGEgZ2xvYmFsLCBhcyBpbiBlLmcuIGEgYnJvd3Nlci5cblx0XHR0aGlzLnRvcGlhcmlzdCA9IGRlZmluaXRpb24oKTtcblx0fVxufSkoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgRVJST1JfTUVTU0FHRVMgPSB7XG5cdFx0U1VCQ0xBU1NfTk9UX0NPTlNUUlVDVE9SOiAnU3ViY2xhc3Mgd2FzIG5vdCBhIGNvbnN0cnVjdG9yLicsXG5cdFx0U1VQRVJDTEFTU19OT1RfQ09OU1RSVUNUT1I6ICdTdXBlcmNsYXNzIHdhcyBub3QgYSBjb25zdHJ1Y3RvciB3aGVuIGV4dGVuZGluZyB7MH0uJyxcblx0XHRQUk9UT1RZUEVfTk9UX0NMRUFOOiAnUHJvdG90eXBlIG11c3QgYmUgY2xlYW4gdG8gZXh0ZW5kIGFub3RoZXIgY2xhc3MuIHsxfSBoYXMgYWxyZWFkeSBiZWVuIGRlZmluZWQgb24gdGhlICcgK1xuXHRcdFx0J3Byb3RvdHlwZSBvZiB7MH0uJyxcblx0XHROT1RfQ09OU1RSVUNUT1I6ICd7MH0gZGVmaW5pdGlvbiBmb3IgezF9IG11c3QgYmUgYSBjb25zdHJ1Y3Rvciwgd2FzIHsyfS4nLFxuXHRcdERPRVNfTk9UX0lNUExFTUVOVDogJ0NsYXNzIHswfSBkb2VzIG5vdCBpbXBsZW1lbnQgdGhlIGF0dHJpYnV0ZXMgXFwnezF9XFwnIGZyb20gcHJvdG9jb2wgezJ9LicsXG5cdFx0UFJPUEVSVFlfQUxSRUFEWV9QUkVTRU5UOiAnQ291bGQgbm90IGNvcHkgezB9IGZyb20gezF9IHRvIHsyfSBhcyBpdCB3YXMgYWxyZWFkeSBwcmVzZW50LicsXG5cdFx0TlVMTDogJ3swfSBmb3IgezF9IG11c3Qgbm90IGJlIG51bGwgb3IgdW5kZWZpbmVkLicsXG5cdFx0QUxSRUFEWV9QUkVTRU5UOiAnQ291bGQgbm90IGNvcHkgezB9IGZyb20gezF9IHRvIHsyfSBhcyBpdCB3YXMgYWxyZWFkeSBwcmVzZW50LicsXG5cdFx0V1JPTkdfVFlQRTogJ3swfSBmb3IgezF9IHNob3VsZCBoYXZlIGJlZW4gb2YgdHlwZSB7Mn0sIHdhcyB7M30uJyxcblx0XHRUV09fQ09OU1RSVUNUT1JTOiAnVHdvIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgcHJvdmlkZWQgZm9yIHswfSwgdXNlIG9ubHkgb25lIG9mIHRoZSBjbGFzc0RlZmluaXRpb24gYXJndW1lbnQgJyArXG5cdFx0XHQnYW5kIGV4dHJhUHJvcGVydGllcy5jb25zdHJ1Y3Rvci4nLFxuXHRcdEJBRF9JTlNUQUxMOiAnQ2FuIG9ubHkgaW5zdGFsbCB0byB0aGUgZ2xvYmFsIGVudmlyb25tZW50IG9yIGEgY29uc3RydWN0b3IsIGNhblxcJ3QgaW5zdGFsbCB0byBhIHswfS4nXG5cdH07XG5cblx0Ly8gTWFpbiBBUEkgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblx0Ly8gb25seSB1c2VkIGZvciBjb21wYXRpYmlsaXR5IHdpdGggc2hpbW1lZCwgbm9uIGVzNSBicm93c2Vycy5cblx0dmFyIGludGVybmFsVXNlTmFtZXMgPSBbJ19fbXVsdGlwYXJlbnRzX18nLCAnX19pbnRlcmZhY2VzX18nLCAnX19hc3NpZ25hYmxlX2Zyb21fY2FjaGVfXycsICdfX2lkX18nXTtcblxuXHQvKipcblx0ICogU2V0cyB1cCB0aGUgcHJvdG90eXBlIGNoYWluIGZvciBpbmhlcml0YW5jZS5cblx0ICpcblx0ICogPHA+QXMgd2VsbCBhcyBzZXR0aW5nIHVwIHRoZSBwcm90b3R5cGUgY2hhaW4sIHRoaXMgYWxzbyBjb3BpZXMgc28gY2FsbGVkICdjbGFzcycgZGVmaW5pdGlvbnMgZnJvbSB0aGUgc3VwZXJjbGFzc1xuXHQgKiAgdG8gdGhlIHN1YmNsYXNzIGFuZCBtYWtlcyBzdXJlIHRoYXQgY29uc3RydWN0b3Igd2lsbCByZXR1cm4gdGhlIGNvcnJlY3QgdGhpbmcuPC9wPlxuXHQgKlxuXHQgKiBAdGhyb3dzIEVycm9yIGlmIHRoZSBwcm90b3R5cGUgaGFzIGJlZW4gbW9kaWZpZWQgYmVmb3JlIGV4dGVuZCBpcyBjYWxsZWQuXG5cdCAqXG5cdCAqIEBtZW1iZXJPZiB0b3BpYXJpc3Rcblx0ICogQHBhcmFtIHs/ZnVuY3Rpb259IGNsYXNzRGVmaW5pdGlvbiBUaGUgY29uc3RydWN0b3Igb2YgdGhlIHN1YmNsYXNzLlxuXHQgKiBAcGFyYW0geyFmdW5jdGlvbn0gc3VwZXJjbGFzcyBUaGUgY29uc3RydWN0b3Igb2YgdGhlIHN1cGVyY2xhc3MuXG5cdCAqIEBwYXJhbSB7P29iamVjdH0gW2V4dHJhUHJvcGVydGllc10gQW4gb2JqZWN0IG9mIGV4dHJhIHByb3BlcnRpZXMgdG8gYWRkIHRvIHRoZSBzdWJjbGFzc2VzIHByb3RvdHlwZS5cblx0ICovXG5cdGZ1bmN0aW9uIGV4dGVuZChjbGFzc0RlZmluaXRpb24sIHN1cGVyY2xhc3MsIGV4dHJhUHJvcGVydGllcykge1xuXHRcdHZhciBzdWJjbGFzc05hbWUgPSBjbGFzc05hbWUoY2xhc3NEZWZpbml0aW9uLCAnU3ViY2xhc3MnKTtcblxuXHRcdC8vIEZpbmQgdGhlIHJpZ2h0IGNsYXNzRGVmaW5pdGlvbiAtIGVpdGhlciB0aGUgb25lIHByb3ZpZGVkLCBhIG5ldyBvbmUgb3IgdGhlIG9uZSBmcm9tIGV4dHJhUHJvcGVydGllcy5cblx0XHR2YXIgZXh0cmFQcm9wZXJ0aWVzSGFzQ29uc3RydWN0b3IgPSB0eXBlb2YgZXh0cmFQcm9wZXJ0aWVzICE9PSAndW5kZWZpbmVkJyAmJlxuXHRcdFx0ZXh0cmFQcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KCdjb25zdHJ1Y3RvcicpICYmXG5cdFx0XHR0eXBlb2YgZXh0cmFQcm9wZXJ0aWVzLmNvbnN0cnVjdG9yID09PSAnZnVuY3Rpb24nO1xuXG5cdFx0aWYgKGNsYXNzRGVmaW5pdGlvbiAhPSBudWxsKSB7XG5cdFx0XHRpZiAoZXh0cmFQcm9wZXJ0aWVzSGFzQ29uc3RydWN0b3IgJiYgY2xhc3NEZWZpbml0aW9uICE9PSBleHRyYVByb3BlcnRpZXMuY29uc3RydWN0b3IpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKG1zZyhFUlJPUl9NRVNTQUdFUy5UV09fQ09OU1RSVUNUT1JTLCBzdWJjbGFzc05hbWUpKTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGV4dHJhUHJvcGVydGllc0hhc0NvbnN0cnVjdG9yKSB7XG5cdFx0XHRjbGFzc0RlZmluaXRpb24gPSBleHRyYVByb3BlcnRpZXMuY29uc3RydWN0b3I7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNsYXNzRGVmaW5pdGlvbiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdC8vIGNoZWNrIGFyZ3VtZW50c1xuXHRcdGFzc2VydEFyZ3VtZW50T2ZUeXBlKCdmdW5jdGlvbicsIGNsYXNzRGVmaW5pdGlvbiwgRVJST1JfTUVTU0FHRVMuU1VCQ0xBU1NfTk9UX0NPTlNUUlVDVE9SKTtcblx0XHRhc3NlcnRBcmd1bWVudE9mVHlwZSgnZnVuY3Rpb24nLCBzdXBlcmNsYXNzLCBFUlJPUl9NRVNTQUdFUy5TVVBFUkNMQVNTX05PVF9DT05TVFJVQ1RPUiwgc3ViY2xhc3NOYW1lKTtcblx0XHRhc3NlcnROb3RoaW5nSW5PYmplY3QoY2xhc3NEZWZpbml0aW9uLnByb3RvdHlwZSwgRVJST1JfTUVTU0FHRVMuUFJPVE9UWVBFX05PVF9DTEVBTiwgc3ViY2xhc3NOYW1lKTtcblxuXHRcdC8vIGNvcHkgY2xhc3MgcHJvcGVydGllc1xuXHRcdGZvciAodmFyIHN0YXRpY1Byb3BlcnR5TmFtZSBpbiBzdXBlcmNsYXNzKSB7XG5cdFx0XHRpZiAoc3VwZXJjbGFzcy5oYXNPd25Qcm9wZXJ0eShzdGF0aWNQcm9wZXJ0eU5hbWUpKSB7XG5cdFx0XHRcdC8vIHRoaXMgaXMgYmVjYXVzZSB3ZSBzaG91bGRuJ3QgY29weSBub25lbnVtZXJhYmxlcywgYnV0IHJlbW92aW5nIGVudW1lcmFiaWxpdHkgaXNuJ3Qgc2hpbW1hYmxlIGluIGllOC5cblx0XHRcdFx0Ly8gV2UgbmVlZCB0byBtYWtlIHN1cmUgd2UgZG9uJ3QgaW5hZHZlcnRlbnRseSBjb3B5IGFjcm9zcyBhbnkgb2YgdGhlICdpbnRlcm5hbCcgZmllbGRzIHdlIGFyZSB1c2luZyB0b1xuXHRcdFx0XHQvLyAga2VlcCB0cmFjayBvZiB0aGluZ3MuXG5cdFx0XHRcdGlmIChpbnRlcm5hbFVzZU5hbWVzLmluZGV4T2Yoc3RhdGljUHJvcGVydHlOYW1lKSA+PSAwKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjbGFzc0RlZmluaXRpb25bc3RhdGljUHJvcGVydHlOYW1lXSA9IHN1cGVyY2xhc3Nbc3RhdGljUHJvcGVydHlOYW1lXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBjcmVhdGUgdGhlIHN1cGVyY2xhc3MgcHJvcGVydHkgb24gdGhlIHN1YmNsYXNzIGNvbnN0cnVjdG9yXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGNsYXNzRGVmaW5pdGlvbiwgJ3N1cGVyY2xhc3MnLCB7IGVudW1lcmFibGU6IGZhbHNlLCB2YWx1ZTogc3VwZXJjbGFzcyB9KTtcblxuXHRcdC8vIGNyZWF0ZSB0aGUgcHJvdG90eXBlIHdpdGggYSBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cblx0XHRjbGFzc0RlZmluaXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlcmNsYXNzLnByb3RvdHlwZSwge1xuXHRcdFx0XCJjb25zdHJ1Y3RvclwiOiB7IGVudW1lcmFibGU6IGZhbHNlLFx0dmFsdWU6IGNsYXNzRGVmaW5pdGlvbiB9XG5cdFx0fSk7XG5cblx0XHQvLyBjb3B5IGV2ZXJ5dGhpbmcgZnJvbSBleHRyYSBwcm9wZXJ0aWVzLlxuXHRcdGlmIChleHRyYVByb3BlcnRpZXMgIT0gbnVsbCkge1xuXHRcdFx0Zm9yICh2YXIgcHJvcGVydHkgaW4gZXh0cmFQcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGlmIChleHRyYVByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpICYmIHByb3BlcnR5ICE9PSAnY29uc3RydWN0b3InKSB7XG5cdFx0XHRcdFx0Y2xhc3NEZWZpbml0aW9uLnByb3RvdHlwZVtwcm9wZXJ0eV0gPSBleHRyYVByb3BlcnRpZXNbcHJvcGVydHldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gdGhpcyBpcyBwdXJlbHkgdG8gd29yayBhcm91bmQgYSBiYWQgaWU4IHNoaW0sIHdoZW4gaWU4IGlzIG5vIGxvbmdlciBuZWVkZWQgaXQgY2FuIGJlIGRlbGV0ZWQuXG5cdFx0aWYgKGNsYXNzRGVmaW5pdGlvbi5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkoJ19fcHJvdG9fXycpKSB7XG5cdFx0XHRkZWxldGUgY2xhc3NEZWZpbml0aW9uLnByb3RvdHlwZVsnX19wcm90b19fJ107XG5cdFx0fVxuXG5cdFx0Y2xlYXJBc3NpZ25hYmxlQ2FjaGUoY2xhc3NEZWZpbml0aW9uLCBzdXBlcmNsYXNzKTtcblxuXHRcdHJldHVybiBjbGFzc0RlZmluaXRpb247XG5cdH1cblxuXHQvKipcblx0ICogTWl4ZXMgZnVuY3Rpb25hbGl0eSBpbiB0byBhIGNsYXNzLlxuXHQgKlxuXHQgKiA8cD5Pbmx5IGZ1bmN0aW9ucyBhcmUgbWl4ZWQgaW4uPC9wPlxuXHQgKlxuXHQgKiA8cD5Db2RlIGluIHRoZSBtaXhpbiBpcyBzYW5kYm94ZWQgYW5kIG9ubHkgaGFzIGFjY2VzcyB0byBhICdtaXhpbiBpbnN0YW5jZScgcmF0aGVyIHRoYW4gdGhlIHJlYWwgaW5zdGFuY2UuPC9wPlxuXHQgKlxuXHQgKiBAbWVtYmVyT2YgdG9waWFyaXN0XG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IHRhcmdldFxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufE9iamVjdH0gbWl4XG5cdCAqL1xuXHRmdW5jdGlvbiBtaXhpbih0YXJnZXQsIG1peCkge1xuXHRcdGFzc2VydEFyZ3VtZW50T2ZUeXBlKCdmdW5jdGlvbicsIHRhcmdldCwgRVJST1JfTUVTU0FHRVMuTk9UX0NPTlNUUlVDVE9SLCAnVGFyZ2V0JywgJ21peGluJyk7XG5cblx0XHRtaXggPSB0b0Z1bmN0aW9uKFxuXHRcdFx0bWl4LFxuXHRcdFx0bmV3IFR5cGVFcnJvcihcblx0XHRcdFx0bXNnKFxuXHRcdFx0XHRcdEVSUk9SX01FU1NBR0VTLldST05HX1RZUEUsXG5cdFx0XHRcdFx0J01peCcsXG5cdFx0XHRcdFx0J21peGluJyxcblx0XHRcdFx0XHQnbm9uLW51bGwgb2JqZWN0IG9yIGZ1bmN0aW9uJyxcblx0XHRcdFx0XHRtaXggPT09IG51bGwgPyAnbnVsbCcgOiB0eXBlb2YgbWl4XG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpO1xuXG5cdFx0dmFyIHRhcmdldFByb3RvdHlwZSA9IHRhcmdldC5wcm90b3R5cGUsIG1peGluUHJvcGVydGllcyA9IG1peC5wcm90b3R5cGUsIHJlc3VsdGluZ1Byb3BlcnRpZXMgPSB7fTtcblx0XHR2YXIgbWl4aW5zID0gbm9uZW51bSh0YXJnZXQsICdfX211bHRpcGFyZW50c19fJywgW10pO1xuXHRcdHZhciBteU1peElkID0gbWl4aW5zLmxlbmd0aDtcblxuXHRcdGZvciAodmFyIHByb3BlcnR5IGluIG1peGluUHJvcGVydGllcykge1xuXHRcdFx0Ly8gcHJvcGVydHkgbWlnaHQgc3B1cmlvdXNseSBiZSAnY29uc3RydWN0b3InIGlmIHlvdSBhcmUgaW4gaWU4IGFuZCB1c2luZyBhIHNoaW0uXG5cdFx0XHRpZiAodHlwZW9mIG1peGluUHJvcGVydGllc1twcm9wZXJ0eV0gPT09ICdmdW5jdGlvbicgJiYgcHJvcGVydHkgIT09ICdjb25zdHJ1Y3RvcicpIHtcblx0XHRcdFx0aWYgKHByb3BlcnR5IGluIHRhcmdldFByb3RvdHlwZSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0XHRyZXN1bHRpbmdQcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IGdldFNhbmRib3hlZEZ1bmN0aW9uKG15TWl4SWQsIG1peCwgbWl4aW5Qcm9wZXJ0aWVzW3Byb3BlcnR5XSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAodGFyZ2V0UHJvdG90eXBlW3Byb3BlcnR5XS5fX29yaWdpbmFsX18gIT09IG1peGluUHJvcGVydGllc1twcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0XHRtc2coXG5cdFx0XHRcdFx0XHRcdEVSUk9SX01FU1NBR0VTLlBST1BFUlRZX0FMUkVBRFlfUFJFU0VOVCxcblx0XHRcdFx0XHRcdFx0cHJvcGVydHksXG5cdFx0XHRcdFx0XHRcdGNsYXNzTmFtZShtaXgsICdtaXhpbicpLFxuXHRcdFx0XHRcdFx0XHRjbGFzc05hbWUodGFyZ2V0LCAndGFyZ2V0Jylcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IC8vIHdlIG9ubHkgbWl4aW4gZnVuY3Rpb25zXG5cdFx0fVxuXG5cdFx0Y29weShyZXN1bHRpbmdQcm9wZXJ0aWVzLCB0YXJnZXRQcm90b3R5cGUpO1xuXHRcdG1peGlucy5wdXNoKG1peCk7XG5cblx0XHRjbGVhckFzc2lnbmFibGVDYWNoZSh0YXJnZXQsIG1peCk7XG5cblx0XHRyZXR1cm4gdGFyZ2V0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb3ZpZGVzIG11bHRpcGxlIGluaGVyaXRhbmNlIHRocm91Z2ggY29weWluZy5cblx0ICpcblx0ICogPHA+VGhpcyBpcyBkaXNjb3VyYWdlZDsgeW91IHNob3VsZCBwcmVmZXIgdG8gdXNlIGFnZ3JlZ2F0aW9uIGZpcnN0LCBzaW5nbGUgaW5oZXJpdGFuY2UgKGV4dGVuZHMpIHNlY29uZCwgbWl4aW5zXG5cdCAqICB0aGlyZCBhbmQgdGhpcyBhcyBhIGxhc3QgcmVzb3J0LjwvcD5cblx0ICpcblx0ICogQG1lbWJlck9mIHRvcGlhcmlzdFxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSB0YXJnZXQgdGhlIGNsYXNzIHRoYXQgc2hvdWxkIHJlY2VpdmUgdGhlIGZ1bmN0aW9uYWxpdHkuXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb258T2JqZWN0fSBwYXJlbnQgdGhlIHBhcmVudCB0aGF0IHByb3ZpZGVzIHRoZSBmdW5jdGlvbmFsaXR5LlxuXHQgKi9cblx0ZnVuY3Rpb24gaW5oZXJpdCh0YXJnZXQsIHBhcmVudCkge1xuXHRcdGFzc2VydEFyZ3VtZW50T2ZUeXBlKCdmdW5jdGlvbicsIHRhcmdldCwgRVJST1JfTUVTU0FHRVMuTk9UX0NPTlNUUlVDVE9SLCAnVGFyZ2V0JywgJ2luaGVyaXQnKTtcblx0XHRwYXJlbnQgPSB0b0Z1bmN0aW9uKFxuXHRcdFx0cGFyZW50LFxuXHRcdFx0bmV3IFR5cGVFcnJvcihcblx0XHRcdFx0bXNnKFxuXHRcdFx0XHRcdEVSUk9SX01FU1NBR0VTLldST05HX1RZUEUsXG5cdFx0XHRcdFx0J1BhcmVudCcsXG5cdFx0XHRcdFx0J2luaGVyaXQnLFxuXHRcdFx0XHRcdCdub24tbnVsbCBvYmplY3Qgb3IgZnVuY3Rpb24nLFxuXHRcdFx0XHRcdHBhcmVudCA9PT0gbnVsbCA/ICdudWxsJyA6IHR5cGVvZiBwYXJlbnRcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdCk7XG5cblx0XHRpZiAoY2xhc3NJc0EodGFyZ2V0LCBwYXJlbnQpKSB7XG5cdFx0XHRyZXR1cm4gdGFyZ2V0O1xuXHRcdH1cblxuXHRcdHZhciByZXN1bHRpbmdQcm9wZXJ0aWVzID0ge307XG5cdFx0dmFyIHRhcmdldFByb3RvdHlwZSA9IHRhcmdldC5wcm90b3R5cGU7XG5cdFx0Zm9yICh2YXIgcHJvcGVydHlOYW1lIGluIHBhcmVudC5wcm90b3R5cGUpIHtcblx0XHRcdC8vIFRoZXNlIHByb3BlcnRpZXMgc2hvdWxkIGJlIG5vbmVudW1lcmFibGUgaW4gbW9kZXJuIGJyb3dzZXJzLCBidXQgc2hpbXMgbWlnaHQgY3JlYXRlIHRoZW0gaW4gaWU4LlxuXHRcdFx0aWYgKHByb3BlcnR5TmFtZSA9PT0gJ2NvbnN0cnVjdG9yJyB8fCBwcm9wZXJ0eU5hbWUgPT09ICdfX3Byb3RvX18nKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgbm90SW5UYXJnZXQgPSB0YXJnZXRQcm90b3R5cGVbcHJvcGVydHlOYW1lXSA9PT0gdW5kZWZpbmVkO1xuXHRcdFx0dmFyIHBhcmVudEhhc05ld2VySW1wbGVtZW50YXRpb24gPSBub3RJblRhcmdldCB8fCBpc092ZXJyaWRlck9mKHByb3BlcnR5TmFtZSwgcGFyZW50LCB0YXJnZXQpO1xuXHRcdFx0aWYgKHBhcmVudEhhc05ld2VySW1wbGVtZW50YXRpb24pIHtcblx0XHRcdFx0cmVzdWx0aW5nUHJvcGVydGllc1twcm9wZXJ0eU5hbWVdID0gcGFyZW50LnByb3RvdHlwZVtwcm9wZXJ0eU5hbWVdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIGFyZVRoZVNhbWUgPSB0YXJnZXRQcm90b3R5cGVbcHJvcGVydHlOYW1lXSA9PT0gcGFyZW50LnByb3RvdHlwZVtwcm9wZXJ0eU5hbWVdO1xuXHRcdFx0XHR2YXIgdGFyZ2V0SXNVcFRvRGF0ZSA9IGFyZVRoZVNhbWUgfHwgaXNPdmVycmlkZXJPZihwcm9wZXJ0eU5hbWUsIHRhcmdldCwgcGFyZW50KTtcblx0XHRcdFx0aWYgKHRhcmdldElzVXBUb0RhdGUgPT09IGZhbHNlKSB7XG5cdFx0XHRcdFx0Ly8gdGFyZ2V0IGlzIG5vdCB1cCB0byBkYXRlLCBidXQgd2UgY2FuJ3QgYnJpbmcgaXQgdXAgdG8gZGF0ZS5cblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0XHRtc2coXG5cdFx0XHRcdFx0XHRcdEVSUk9SX01FU1NBR0VTLkFMUkVBRFlfUFJFU0VOVCxcblx0XHRcdFx0XHRcdFx0cHJvcGVydHlOYW1lLFxuXHRcdFx0XHRcdFx0XHRjbGFzc05hbWUocGFyZW50LCAncGFyZW50JyksXG5cdFx0XHRcdFx0XHRcdGNsYXNzTmFtZSh0YXJnZXQsICd0YXJnZXQnKVxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gb3RoZXJ3aXNlIHdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcuXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29weShyZXN1bHRpbmdQcm9wZXJ0aWVzLCB0YXJnZXRQcm90b3R5cGUpO1xuXHRcdHZhciBtdWx0aXBhcmVudHMgPSBub25lbnVtKHRhcmdldCwgJ19fbXVsdGlwYXJlbnRzX18nLCBbXSk7XG5cdFx0bXVsdGlwYXJlbnRzLnB1c2gocGFyZW50KTtcblxuXHRcdGNsZWFyQXNzaWduYWJsZUNhY2hlKHRhcmdldCwgcGFyZW50KTtcblxuXHRcdHJldHVybiB0YXJnZXQ7XG5cdH1cblxuXHQvKipcblx0ICogRGVjbGFyZXMgdGhhdCB0aGUgcHJvdmlkZWQgY2xhc3Mgd2lsbCBpbXBsZW1lbnQgdGhlIHByb3ZpZGVkIHByb3RvY29sLlxuXHQgKlxuXHQgKiA8cD5UaGlzIGludm9sdmVzIGltbWVkaWF0ZWx5IHVwZGF0aW5nIGFuIGludGVybmFsIGxpc3Qgb2YgaW50ZXJmYWNlcyBhdHRhY2hlZCB0byB0aGUgY2xhc3MgZGVmaW5pdGlvbixcblx0ICogYW5kIGFmdGVyIGEgPGNvZGU+c2V0VGltZW91dCgwKTwvY29kZT4gdmVyaWZ5aW5nIHRoYXQgaXQgZG9lcyBpbiBmYWN0IGltcGxlbWVudCB0aGUgcHJvdG9jb2wuPC9wPlxuXHQgKlxuXHQgKiA8cD5JdCBjYW4gYmUgY2FsbGVkIGJlZm9yZSB0aGUgaW1wbGVtZW50YXRpb25zIGFyZSBwcm92aWRlZCwgaS5lLiBpbW1lZGlhdGVseSBhZnRlciB0aGUgY29uc3RydWN0b3IuPC9wPlxuXHQgKlxuXHQgKiBAdGhyb3dzIEVycm9yIGlmIHRoZXJlIGFyZSBhbnkgYXR0cmlidXRlcyBvbiB0aGUgcHJvdG9jb2wgdGhhdCBhcmUgbm90IG1hdGNoZWQgb24gdGhlIGNsYXNzIGRlZmluaXRpb24uXG5cdCAqXG5cdCAqIEBtZW1iZXJPZiB0b3BpYXJpc3Rcblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gY2xhc3NEZWZpbml0aW9uIEEgY29uc3RydWN0b3IgdGhhdCBzaG91bGQgY3JlYXRlIG9iamVjdHMgbWF0Y2hpbmcgdGhlIHByb3RvY29sLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwcm90b2NvbCBBIGNvbnN0cnVjdG9yIHJlcHJlc2VudGluZyBhbiBpbnRlcmZhY2UgdGhhdCB0aGUgY2xhc3Mgc2hvdWxkIGltcGxlbWVudC5cblx0ICovXG5cdGZ1bmN0aW9uIGltcGxlbWVudChjbGFzc0RlZmluaXRpb24sIHByb3RvY29sKSB7XG5cdFx0ZG9JbXBsZW1lbnQoY2xhc3NEZWZpbml0aW9uLCBwcm90b2NvbCk7XG5cblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0YXNzZXJ0SGFzSW1wbGVtZW50ZWQoY2xhc3NEZWZpbml0aW9uLCBwcm90b2NvbCk7XG5cdFx0fSwgMCk7XG5cblx0XHRyZXR1cm4gY2xhc3NEZWZpbml0aW9uO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlY2xhcmVzIHRoYXQgdGhlIHByb3ZpZGVkIGNsYXNzIGltcGxlbWVudHMgdGhlIHByb3ZpZGVkIHByb3RvY29sLlxuXHQgKlxuXHQgKiA8cD5UaGlzIGludm9sdmVzIGNoZWNraW5nIHRoYXQgaXQgZG9lcyBpbiBmYWN0IGltcGxlbWVudCB0aGUgcHJvdG9jb2wgYW5kIHVwZGF0aW5nIGFuIGludGVybmFsIGxpc3Qgb2Zcblx0ICogIGludGVyZmFjZXMgYXR0YWNoZWQgdG8gdGhlIGNsYXNzIGRlZmluaXRpb24uPC9wPlxuXHQgKlxuXHQgKiA8cD5JdCBzaG91bGQgYmUgY2FsbGVkIGFmdGVyIGltcGxlbWVudGF0aW9ucyBhcmUgcHJvdmlkZWQsIGkuZS4gYXQgdGhlIGVuZCBvZiB0aGUgY2xhc3MgZGVmaW5pdGlvbi48L3A+XG5cdCAqXG5cdCAqIEB0aHJvd3MgRXJyb3IgaWYgdGhlcmUgYXJlIGFueSBhdHRyaWJ1dGVzIG9uIHRoZSBwcm90b2NvbCB0aGF0IGFyZSBub3QgbWF0Y2hlZCBvbiB0aGUgY2xhc3MgZGVmaW5pdGlvbi5cblx0ICpcblx0ICogQG1lbWJlck9mIHRvcGlhcmlzdFxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjbGFzc0RlZmluaXRpb24gQSBjb25zdHJ1Y3RvciB0aGF0IHNob3VsZCBjcmVhdGUgb2JqZWN0cyBtYXRjaGluZyB0aGUgcHJvdG9jb2wuXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IHByb3RvY29sIEEgY29uc3RydWN0b3IgcmVwcmVzZW50aW5nIGFuIGludGVyZmFjZSB0aGF0IHRoZSBjbGFzcyBzaG91bGQgaW1wbGVtZW50LlxuXHQgKi9cblx0ZnVuY3Rpb24gaGFzSW1wbGVtZW50ZWQoY2xhc3NEZWZpbml0aW9uLCBwcm90b2NvbCkge1xuXHRcdGRvSW1wbGVtZW50KGNsYXNzRGVmaW5pdGlvbiwgcHJvdG9jb2wpO1xuXHRcdGFzc2VydEhhc0ltcGxlbWVudGVkKGNsYXNzRGVmaW5pdGlvbiwgcHJvdG9jb2wpO1xuXG5cdFx0cmV0dXJuIGNsYXNzRGVmaW5pdGlvbjtcblx0fVxuXG5cdC8qKiBAcHJpdmF0ZSAqL1xuXHRmdW5jdGlvbiBkb0ltcGxlbWVudChjbGFzc0RlZmluaXRpb24sIHByb3RvY29sKSB7XG5cdFx0YXNzZXJ0QXJndW1lbnRPZlR5cGUoJ2Z1bmN0aW9uJywgY2xhc3NEZWZpbml0aW9uLCBFUlJPUl9NRVNTQUdFUy5OT1RfQ09OU1RSVUNUT1IsICdDbGFzcycsICdoYXNJbXBsZW1lbnRlZCcpO1xuXHRcdGFzc2VydEFyZ3VtZW50T2ZUeXBlKCdmdW5jdGlvbicsIHByb3RvY29sLCBFUlJPUl9NRVNTQUdFUy5OT1RfQ09OU1RSVUNUT1IsICdQcm90b2NvbCcsICdoYXNJbXBsZW1lbnRlZCcpO1xuXG5cdFx0dmFyIGludGVyZmFjZXMgPSBub25lbnVtKGNsYXNzRGVmaW5pdGlvbiwgJ19faW50ZXJmYWNlc19fJywgW10pO1xuXHRcdGludGVyZmFjZXMucHVzaChwcm90b2NvbCk7XG5cblx0XHRjbGVhckFzc2lnbmFibGVDYWNoZShjbGFzc0RlZmluaXRpb24sIHByb3RvY29sKTtcblxuXHRcdHJldHVybiBjbGFzc0RlZmluaXRpb247XG5cdH1cblxuXHRmdW5jdGlvbiBhc3NlcnRIYXNJbXBsZW1lbnRlZChjbGFzc0RlZmluaXRpb24sIHByb3RvY29sKSB7XG5cdFx0dmFyIG1pc3NpbmcgPSBtaXNzaW5nQXR0cmlidXRlcyhjbGFzc0RlZmluaXRpb24sIHByb3RvY29sKTtcblx0XHRpZiAobWlzc2luZy5sZW5ndGggPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdG1zZyhcblx0XHRcdFx0XHRFUlJPUl9NRVNTQUdFUy5ET0VTX05PVF9JTVBMRU1FTlQsXG5cdFx0XHRcdFx0Y2xhc3NOYW1lKGNsYXNzRGVmaW5pdGlvbiwgJ3Byb3ZpZGVkJyksXG5cdFx0XHRcdFx0bWlzc2luZy5qb2luKCdcXCcsIFxcJycpLFxuXHRcdFx0XHRcdGNsYXNzTmFtZShwcm90b2NvbCwgJ3Byb3ZpZGVkJylcblx0XHRcdFx0KVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBmYWxsYmFja0lzQXNzaWduYWJsZUZyb20oY2xhc3NEZWZpbml0aW9uLCBwYXJlbnQpIHtcblx0XHRpZiAoY2xhc3NEZWZpbml0aW9uID09PSBwYXJlbnQgfHwgY2xhc3NEZWZpbml0aW9uLnByb3RvdHlwZSBpbnN0YW5jZW9mIHBhcmVudCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHZhciBpLCBtaXhpbnMgPSBjbGFzc0RlZmluaXRpb24uX19tdWx0aXBhcmVudHNfXyB8fCBbXSwgaW50ZXJmYWNlcyA9IGNsYXNzRGVmaW5pdGlvbi5fX2ludGVyZmFjZXNfXyB8fCBbXTtcblxuXHRcdC8vIHBhcmVudFxuXHRcdHZhciBzdXBlclByb3RvdHlwZSA9IChjbGFzc0RlZmluaXRpb24uc3VwZXJjbGFzcyAmJiBjbGFzc0RlZmluaXRpb24uc3VwZXJjbGFzcy5wcm90b3R5cGUpIHx8XG5cdFx0XHRnZXRQcm90b3R5cGVPZihjbGFzc0RlZmluaXRpb24ucHJvdG90eXBlKTtcblxuXHRcdGlmIChcblx0XHRcdHN1cGVyUHJvdG90eXBlICE9IG51bGwgJiZcblx0XHRcdHN1cGVyUHJvdG90eXBlICE9PSBjbGFzc0RlZmluaXRpb24ucHJvdG90eXBlICYmXG5cdFx0XHRjbGFzc0lzQShzdXBlclByb3RvdHlwZS5jb25zdHJ1Y3RvciwgcGFyZW50KVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gbWl4aW4gY2hhaW5cblx0XHRmb3IgKGkgPSAwOyBpIDwgbWl4aW5zLmxlbmd0aDsgKytpKSB7XG5cdFx0XHRpZiAoY2xhc3NJc0EobWl4aW5zW2ldLCBwYXJlbnQpKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGludGVyZmFjZXMgY2hhaW5cblx0XHRmb3IgKGkgPSAwOyBpIDwgaW50ZXJmYWNlcy5sZW5ndGg7ICsraSkge1xuXHRcdFx0aWYgKGNsYXNzSXNBKGludGVyZmFjZXNbaV0sIHBhcmVudCkpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyB0byBzZWUgaWYgYSBjbGFzcyBpcyBhIGRlc2NlbmRhbnQgb2YgYW5vdGhlciBjbGFzcyAvIGludGVyZmFjZSAvIG1peGluLlxuXHQgKlxuXHQgKiA8dWw+PGxpPkEgY2xhc3MgaXMgYSBkZXNjZW5kYW50IG9mIGFub3RoZXIgY2xhc3MgaWYgdGhlIG90aGVyIGNsYXNzIGlzIGluIGl0cyBwcm90b3R5cGUgY2hhaW4uXG5cdCAqIDwvbGk+PGxpPkEgY2xhc3MgaXMgYSBkZXNjZW5kYW50IG9mIGFuIGludGVyZmFjZSBpZiBpdCBoYXMgY2FsbGVkIGltcGxlbWVudCB0aGF0IGNsYXNzIG9yXG5cdCAqIGFueSBjbGFzcyB0aGF0IHRoaXMgY2xhc3MgaXMgYSBkZXNjZW5kYW50IG9mIGhhcyBjYWxsZWQgaW1wbGVtZW50IGZvciB0aGF0IGNsYXNzLlxuXHQgKiA8L2xpPjxsaT5BIGNsYXNzIGlzIGEgZGVzY2VuZGFudCBvZiBhIG1peGluIGlmIGl0IGhhcyBjYWxsZWQgbWl4aW4gZm9yIHRoYXQgbWl4aW4gb3Jcblx0ICogYW55IGNsYXNzIHRoYXQgdGhpcyBjbGFzcyBpcyBhIGRlc2NlbmRhbnQgb2YgaGFzIGNhbGxlZCBtaXhpbiBmb3IgdGhhdCBtaXhpbi5cblx0ICogPC9saT48L3VsPlxuXHQgKlxuXHQgKiBAbWVtYmVyT2YgdG9waWFyaXN0XG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGNsYXNzRGVmaW5pdGlvbiB0aGUgY2hpbGQgY2xhc3MuXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbnN0cnVjdG9yIHRoZSBjbGFzcyB0byBjaGVjayBpZiB0aGlzIGNsYXNzIGlzIGEgZGVzY2VuZGFudCBvZi5cblx0ICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGNsYXNzIGlzIGEgZGVzY2VuZGFudCwgZmFsc2Ugb3RoZXJ3aXNlLlxuXHQgKi9cblx0ZnVuY3Rpb24gY2xhc3NJc0EoY2xhc3NEZWZpbml0aW9uLCBjb25zdHJ1Y3Rvcikge1xuXHRcdC8vIHNuZWFreSBlZGdlIGNhc2Ugd2hlcmUgd2UncmUgY2hlY2tpbmcgYWdhaW5zdCBhbiBvYmplY3QgbGl0ZXJhbCB3ZSd2ZSBtaXhlZCBpbiBvciBhZ2FpbnN0IGEgcHJvdG90eXBlIG9mXG5cdFx0Ly8gIHNvbWV0aGluZy5cblx0XHRpZiAodHlwZW9mIGNvbnN0cnVjdG9yID09PSAnb2JqZWN0JyAmJiBjb25zdHJ1Y3Rvci5oYXNPd25Qcm9wZXJ0eSgnY29uc3RydWN0b3InKSkge1xuXHRcdFx0Y29uc3RydWN0b3IgPSBjb25zdHJ1Y3Rvci5jb25zdHJ1Y3Rvcjtcblx0XHR9XG5cblx0XHRhc3NlcnRBcmd1bWVudE9mVHlwZSgnZnVuY3Rpb24nLCBjbGFzc0RlZmluaXRpb24sIEVSUk9SX01FU1NBR0VTLk5PVF9DT05TVFJVQ1RPUiwgJ0NsYXNzJywgJ2NsYXNzSXNBJyk7XG5cdFx0YXNzZXJ0QXJndW1lbnRPZlR5cGUoJ2Z1bmN0aW9uJywgY29uc3RydWN0b3IsIEVSUk9SX01FU1NBR0VTLk5PVF9DT05TVFJVQ1RPUiwgJ1BhcmVudCcsICdjbGFzc0lzQScpO1xuXG5cdFx0Ly8gVGhpcyBpcyBqdXN0IGEgY2FjaGluZyB3cmFwcGVyIGFyb3VuZCBmYWxsYmFja0lzQXNzaWduYWJsZUZyb20uXG5cdFx0dmFyIGNhY2hlID0gbm9uZW51bShjbGFzc0RlZmluaXRpb24sICdfX2Fzc2lnbmFibGVfZnJvbV9jYWNoZV9fJywge30pO1xuXHRcdHZhciBwYXJlbnRJZCA9IGNsYXNzSWQoY29uc3RydWN0b3IpO1xuXHRcdGlmIChjYWNoZVtwYXJlbnRJZF0gPT0gbnVsbCkge1xuXHRcdFx0Y2FjaGVbcGFyZW50SWRdID0gZmFsbGJhY2tJc0Fzc2lnbmFibGVGcm9tKGNsYXNzRGVmaW5pdGlvbiwgY29uc3RydWN0b3IpO1xuXHRcdH1cblxuXHRcdHJldHVybiBjYWNoZVtwYXJlbnRJZF07XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIHRvIHNlZSBpZiBhbiBpbnN0YW5jZSBpcyBkZWZpbmVkIHRvIGJlIGEgY2hpbGQgb2YgYSBwYXJlbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJPZiB0b3BpYXJpc3Rcblx0ICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlIEFuIGluc3RhbmNlIG9iamVjdCB0byBjaGVjay5cblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gcGFyZW50IEEgcG90ZW50aWFsIHBhcmVudCAoc2VlIGNsYXNzSXNBKS5cblx0ICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBpbnN0YW5jZSBoYXMgYmVlbiBjb25zdHJ1Y3RlZCBmcm9tIHNvbWV0aGluZyB0aGF0IGlzIGFzc2lnbmFibGUgZnJvbSB0aGUgcGFyZW50XG5cdCAqICBvciBpcyBudWxsLCBmYWxzZSBvdGhlcndpc2UuXG5cdCAqL1xuXHRmdW5jdGlvbiBpc0EoaW5zdGFuY2UsIHBhcmVudCkge1xuXHRcdGlmKGluc3RhbmNlID09IG51bGwpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBzbmVha3kgZWRnZSBjYXNlIHdoZXJlIHdlJ3JlIGNoZWNraW5nIGFnYWluc3QgYW4gb2JqZWN0IGxpdGVyYWwgd2UndmUgbWl4ZWQgaW4gb3IgYWdhaW5zdCBhIHByb3RvdHlwZSBvZlxuXHRcdC8vICBzb21ldGhpbmcuXG5cdFx0aWYgKHR5cGVvZiBwYXJlbnQgPT09ICdvYmplY3QnICYmIHBhcmVudC5oYXNPd25Qcm9wZXJ0eSgnY29uc3RydWN0b3InKSkge1xuXHRcdFx0cGFyZW50ID0gcGFyZW50LmNvbnN0cnVjdG9yO1xuXHRcdH1cblxuXHRcdGlmKChpbnN0YW5jZS5jb25zdHJ1Y3RvciA9PT0gcGFyZW50KSB8fCAoaW5zdGFuY2UgaW5zdGFuY2VvZiBwYXJlbnQpKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY2xhc3NJc0EoaW5zdGFuY2UuY29uc3RydWN0b3IsIHBhcmVudCk7XG5cdH1cblxuXHQvKipcblx0ICogRG9lcyBkdWNrIHR5cGluZyB0byBkZXRlcm1pbmUgaWYgYW4gaW5zdGFuY2Ugb2JqZWN0IGltcGxlbWVudHMgYSBwcm90b2NvbC5cblx0ICogPHA+VGhlIHByb3RvY29sIG1heSBiZSBlaXRoZXIgYW4gYWRob2MgcHJvdG9jb2wsIGluIHdoaWNoIGNhc2UgaXQgaXMgYW4gb2JqZWN0IG9yIGl0IGNhbiBiZSBhIGZvcm1hbCBwcm90b2NvbCBpblxuXHQgKiAgd2hpY2ggY2FzZSBpdCdzIGEgZnVuY3Rpb24uPC9wPlxuXHQgKlxuXHQgKiA8cD5JbiBhbiBhZGhvYyBwcm90b2NvbCwgeW91IGNhbiB1c2UgTnVtYmVyLCBPYmplY3QsIFN0cmluZyBhbmQgQm9vbGVhbiB0byBpbmRpY2F0ZSB0aGUgdHlwZSByZXF1aXJlZCBvbiB0aGVcblx0ICogIGluc3RhbmNlLjwvcD5cblx0ICpcblx0ICogQG1lbWJlck9mIHRvcGlhcmlzdFxuXHQgKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2UgdGhlIG9iamVjdCB0byBjaGVjay5cblx0ICogQHBhcmFtIHtmdW5jdGlvbnxPYmplY3R9IHByb3RvY29sIHRoZSBkZXNjcmlwdGlvbiBvZiB0aGUgcHJvcGVydGllcyB0aGF0IHRoZSBvYmplY3Qgc2hvdWxkIGhhdmUuXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGFsbCB0aGUgcHJvcGVydGllcyBvbiB0aGUgcHJvdG9jb2wgd2VyZSBvbiB0aGUgaW5zdGFuY2UgYW5kIG9mIHRoZSByaWdodCB0eXBlLlxuXHQgKi9cblx0ZnVuY3Rpb24gZnVsZmlsbHMoaW5zdGFuY2UsIHByb3RvY29sKSB7XG5cdFx0YXNzZXJ0QXJndW1lbnROb3ROdWxsT3JVbmRlZmluZWQoaW5zdGFuY2UsIEVSUk9SX01FU1NBR0VTLk5VTEwsICdPYmplY3QnLCAnZnVsZmlsbHMnKTtcblx0XHRhc3NlcnRBcmd1bWVudE5vdE51bGxPclVuZGVmaW5lZChwcm90b2NvbCwgRVJST1JfTUVTU0FHRVMuTlVMTCwgJ1Byb3RvY29sJywgJ2Z1bGZpbGxzJyk7XG5cblx0XHQvLyBjb25zb2xlLmxvZyggJ2luc3RhbmNlJywgaW5zdGFuY2UgKTtcblxuXHRcdHZhciBwcm90b2NvbElzQ29uc3RydWN0b3IgPSB0eXBlb2YgcHJvdG9jb2wgPT09ICdmdW5jdGlvbic7XG5cdFx0Ly8gY29uc29sZS5sb2coICdwcm90b2NvbElzQ29uc3RydWN0b3InLCBwcm90b2NvbElzQ29uc3RydWN0b3IgKTtcblx0XHRpZiAocHJvdG9jb2xJc0NvbnN0cnVjdG9yICYmIGlzQShpbnN0YW5jZSwgcHJvdG9jb2wpKSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyggJ2lzQShpbnN0YW5jZSwgcHJvdG9jb2wpJywgaXNBKGluc3RhbmNlLCBwcm90b2NvbCkgKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHZhciByZXF1aXJlbWVudCA9IHByb3RvY29sSXNDb25zdHJ1Y3RvciA/IHByb3RvY29sLnByb3RvdHlwZSA6IHByb3RvY29sO1xuXG5cdFx0Ly8gY29uc29sZS5sb2coICdyZXF1aXJlbWVudCcsIHJlcXVpcmVtZW50ICk7XG5cblx0XHRmb3IgKHZhciBpdGVtIGluIHJlcXVpcmVtZW50KSB7XG5cdFx0XHR2YXIgdHlwZSA9IHR5cGVvZiBpbnN0YW5jZVtpdGVtXTtcblx0XHRcdHZhciByZXF1aXJlZCA9IHJlcXVpcmVtZW50W2l0ZW1dO1xuXG5cdFx0XHQvLyBjb25zb2xlLmxvZyggJ3R5cGUnLCB0eXBlICk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyggJ3JlcXVpcmVkJywgcmVxdWlyZWQgKTtcblxuXHRcdFx0aWYgKHJlcXVpcmVkID09PSBOdW1iZXIpIHtcblx0XHRcdFx0aWYgKHR5cGUgIT09ICdudW1iZXInKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHJlcXVpcmVkID09PSBPYmplY3QpIHtcblx0XHRcdFx0aWYgKHR5cGUgIT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHJlcXVpcmVkID09PSBTdHJpbmcpIHtcblx0XHRcdFx0aWYgKHR5cGUgIT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHJlcXVpcmVkID09PSBCb29sZWFuKSB7XG5cdFx0XHRcdGlmICh0eXBlICE9PSAnYm9vbGVhbicpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICh0eXBlICE9PSB0eXBlb2YgcmVxdWlyZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBjb25zb2xlLmxvZyggJ3JldHVybmluZyB0cnVlJyApO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyB0aGF0IGEgY2xhc3MgcHJvdmlkZXMgYSBwcm90b3R5cGUgdGhhdCB3aWxsIGZ1bGZpbCBhIHByb3RvY29sLlxuXHQgKlxuXHQgKiBAbWVtYmVyT2YgdG9waWFyaXN0XG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGNsYXNzRGVmaW5pdGlvblxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufE9iamVjdH0gcHJvdG9jb2xcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRmdW5jdGlvbiBjbGFzc0Z1bGZpbGxzKGNsYXNzRGVmaW5pdGlvbiwgcHJvdG9jb2wpIHtcblx0XHRhc3NlcnRBcmd1bWVudE5vdE51bGxPclVuZGVmaW5lZChjbGFzc0RlZmluaXRpb24sIEVSUk9SX01FU1NBR0VTLk5VTEwsICdDbGFzcycsICdjbGFzc0Z1bGZpbGxzJyk7XG5cdFx0YXNzZXJ0QXJndW1lbnROb3ROdWxsT3JVbmRlZmluZWQocHJvdG9jb2wsIEVSUk9SX01FU1NBR0VTLk5VTEwsICdQcm90b2NvbCcsICdjbGFzc0Z1bGZpbGxzJyk7XG5cblx0XHRyZXR1cm4gZnVsZmlsbHMoY2xhc3NEZWZpbml0aW9uLnByb3RvdHlwZSwgcHJvdG9jb2wpO1xuXHR9XG5cblx0Ly8gQXV4aWxsYXJpZXMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblx0dmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG5cdGZ1bmN0aW9uIGFzc2VydEFyZ3VtZW50T2ZUeXBlKHR5cGUsIGFyZ3VtZW50KSB7XG5cdFx0dmFyIGFjdHVhbFR5cGUgPSB0eXBlb2YgYXJndW1lbnQ7XG5cdFx0aWYgKGFjdHVhbFR5cGUgIT09IHR5cGUpIHtcblx0XHRcdHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuXHRcdFx0YXJncy5wdXNoKGFjdHVhbFR5cGUpO1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihtc2cuYXBwbHkobnVsbCwgYXJncykpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGFzc2VydE5vdGhpbmdJbk9iamVjdChvYmplY3QpIHtcblx0XHRmb3IgKHZhciBwcm9wZXJ0eU5hbWUgaW4gb2JqZWN0KSB7XG5cdFx0XHR2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblx0XHRcdGFyZ3MucHVzaChwcm9wZXJ0eU5hbWUpO1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKG1zZy5hcHBseShudWxsLCBhcmdzKSk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gYXNzZXJ0QXJndW1lbnROb3ROdWxsT3JVbmRlZmluZWQoaXRlbSkge1xuXHRcdGlmIChpdGVtID09IG51bGwpIHtcblx0XHRcdHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihtc2cuYXBwbHkobnVsbCwgYXJncykpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGlzT3ZlcnJpZGVyT2YocHJvcGVydHlOYW1lLCBzdWIsIGFuY2VzdG9yKSB7XG5cdFx0aWYgKHN1Yi5wcm90b3R5cGVbcHJvcGVydHlOYW1lXSA9PT0gYW5jZXN0b3IucHJvdG90eXBlW3Byb3BlcnR5TmFtZV0pIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHR2YXIgcGFyZW50cyA9IGdldEltbWVkaWF0ZVBhcmVudHMoc3ViKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBhcmVudHMubGVuZ3RoOyArK2kpIHtcblx0XHRcdHZhciBwYXJlbnQgPSBwYXJlbnRzW2ldO1xuXHRcdFx0aWYgKHBhcmVudC5wcm90b3R5cGVbcHJvcGVydHlOYW1lXSA9PT0gYW5jZXN0b3IucHJvdG90eXBlW3Byb3BlcnR5TmFtZV0pIHJldHVybiB0cnVlO1xuXHRcdFx0aWYgKGlzT3ZlcnJpZGVyT2YocHJvcGVydHlOYW1lLCBwYXJlbnQsIGFuY2VzdG9yKSkgcmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0SW1tZWRpYXRlUGFyZW50cyhzdWIpIHtcblx0XHR2YXIgcGFyZW50cyA9IChzdWIuX19tdWx0aXBhcmVudHNfXyB8fCBbXSkuc2xpY2UoKTtcblx0XHR2YXIgcGFyZW50UHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzICYmIHN1Yi5zdXBlcmNsYXNzLnByb3RvdHlwZSkgfHwgZ2V0UHJvdG90eXBlT2Yoc3ViLnByb3RvdHlwZSk7XG5cdFx0aWYgKHBhcmVudFByb3RvdHlwZSAhPT0gbnVsbCAmJiBwYXJlbnRQcm90b3R5cGUuY29uc3RydWN0b3IgIT09IG51bGwgJiYgcGFyZW50UHJvdG90eXBlLmNvbnN0cnVjdG9yICE9PSBzdWIpIHtcblx0XHRcdHBhcmVudHMucHVzaChwYXJlbnRQcm90b3R5cGUuY29uc3RydWN0b3IpO1xuXHRcdH1cblx0XHRyZXR1cm4gcGFyZW50cztcblx0fVxuXG5cdC8qKlxuXHQgKiBJbnRlcnBvbGF0ZXMgYSBzdHJpbmcgd2l0aCB0aGUgYXJndW1lbnRzLCB1c2VkIGZvciBlcnJvciBtZXNzYWdlcy5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIG1zZyhzdHIpIHtcblx0XHRpZiAoc3RyID09IG51bGwpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIGkgPSAxLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcblx0XHRcdHN0ciA9IHN0ci5yZXBsYWNlKCd7JyArIChpIC0gMSkgKyAnfScsIFN0cmluZyhhcmd1bWVudHNbaV0pKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc3RyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBub25lbnVtZXJhYmxlIHByb3BlcnR5IGlmIGl0IGV4aXN0cywgb3IgY3JlYXRlcyBvbmUgYW5kIHJldHVybnMgdGhhdCBpZiBpdCBkb2VzIG5vdC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIG5vbmVudW0ob2JqZWN0LCBwcm9wZXJ0eU5hbWUsIGRlZmF1bHRWYWx1ZSkge1xuXHRcdHZhciB2YWx1ZSA9IG9iamVjdFtwcm9wZXJ0eU5hbWVdO1xuXG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHZhbHVlID0gZGVmYXVsdFZhbHVlO1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgcHJvcGVydHlOYW1lLCB7XG5cdFx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxuXHRcdFx0XHR2YWx1ZTogdmFsdWVcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB2YWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFYXNpZXIgZm9yIHVzIGlmIHdlIHRyZWF0IGV2ZXJ5dGhpbmcgYXMgZnVuY3Rpb25zIHdpdGggcHJvdG90eXBlcy4gVGhpcyBmdW5jdGlvbiBtYWtlcyBwbGFpbiBvYmplY3RzIGJlaGF2ZSB0aGF0XG5cdCAqICB3YXkuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiB0b0Z1bmN0aW9uKG9iaiwgY291bGROb3RDYXN0RXJyb3IpIHtcblx0XHRpZiAob2JqID09IG51bGwpIHtcblx0XHRcdHRocm93IGNvdWxkTm90Q2FzdEVycm9yO1xuXHRcdH1cblxuXHRcdHZhciByZXN1bHQ7XG5cdFx0aWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG5cdFx0XHRpZiAob2JqLmhhc093blByb3BlcnR5KCdjb25zdHJ1Y3RvcicpKSB7XG5cdFx0XHRcdGlmIChvYmouY29uc3RydWN0b3IucHJvdG90eXBlICE9PSBvYmopIHRocm93IGNvdWxkTm90Q2FzdEVycm9yO1xuXHRcdFx0XHRyZXN1bHQgPSBvYmouY29uc3RydWN0b3I7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgRW1wdHlJbml0aWFsaXNlciA9IGZ1bmN0aW9uKCkge307XG5cdFx0XHRcdEVtcHR5SW5pdGlhbGlzZXIucHJvdG90eXBlID0gb2JqO1xuXHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCAnY29uc3RydWN0b3InLCB7XG5cdFx0XHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsIHZhbHVlOiBFbXB0eUluaXRpYWxpc2VyXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXN1bHQgPSBFbXB0eUluaXRpYWxpc2VyO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0cmVzdWx0ID0gb2JqO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBjb3VsZE5vdENhc3RFcnJvcjtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKiBAcHJpdmF0ZSAqL1xuXHR2YXIgY3VycmVudElkID0gMDtcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbm9uZW51bWVyYWJsZSBwcm9wZXJ0eSBfX2lkX18gb2YgYW4gb2JqZWN0IGlmIGl0IGV4aXN0cywgb3RoZXJ3aXNlIGFkZHMgb25lIGFuZCByZXR1cm5zIHRoYXQuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBjbGFzc0lkKGZ1bmMpIHtcblx0XHR2YXIgcmVzdWx0ID0gZnVuYy5fX2lkX187XG5cdFx0aWYgKHJlc3VsdCA9PSBudWxsKSB7XG5cdFx0XHRyZXN1bHQgPSBub25lbnVtKGZ1bmMsICdfX2lkX18nLCBjdXJyZW50SWQrKyk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHR2YXIgbmFtZUZyb21Ub1N0cmluZ1JlZ2V4ID0gL15mdW5jdGlvblxccz8oW15cXHMoXSopLztcblxuXHQvKipcblx0ICogR2V0cyB0aGUgY2xhc3NuYW1lIG9mIGFuIG9iamVjdCBvciBmdW5jdGlvbiBpZiBpdCBjYW4uICBPdGhlcndpc2UgcmV0dXJucyB0aGUgcHJvdmlkZWQgZGVmYXVsdC4gR2V0dGluZyB0aGUgbmFtZVxuXHQgKiAgb2YgYSBmdW5jdGlvbiBpcyBub3QgYSBzdGFuZGFyZCBmZWF0dXJlLCBzbyB3aGlsZSB0aGlzIHdpbGwgd29yayBpbiBtYW55IGNhc2VzLCBpdCBzaG91bGQgbm90IGJlIHJlbGllZCB1cG9uXG5cdCAqICBleGNlcHQgZm9yIGluZm9ybWF0aW9uYWwgbWVzc2FnZXMgKGUuZy4gbG9nZ2luZyBhbmQgRXJyb3IgbWVzc2FnZXMpLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gY2xhc3NOYW1lKG9iamVjdCwgZGVmYXVsdE5hbWUpIHtcblx0XHRpZiAob2JqZWN0ID09IG51bGwpIHtcblx0XHRcdHJldHVybiBkZWZhdWx0TmFtZTtcblx0XHR9XG5cblx0XHR2YXIgcmVzdWx0ID0gJyc7XG5cdFx0aWYgKHR5cGVvZiBvYmplY3QgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGlmIChvYmplY3QubmFtZSkge1xuXHRcdFx0XHRyZXN1bHQgPSBvYmplY3QubmFtZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBtYXRjaCA9IG9iamVjdC50b1N0cmluZygpLm1hdGNoKG5hbWVGcm9tVG9TdHJpbmdSZWdleCk7XG5cdFx0XHRcdGlmIChtYXRjaCAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdHJlc3VsdCA9IG1hdGNoWzFdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0eXBlb2Ygb2JqZWN0LmNvbnN0cnVjdG9yID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRyZXN1bHQgPSBjbGFzc05hbWUob2JqZWN0LmNvbnN0cnVjdG9yLCBkZWZhdWx0TmFtZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdCB8fCBkZWZhdWx0TmFtZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGFsbCBvZiB0aGUgcHJvcGVydGllcyBvbiBhIHByb3RvY29sIHRoYXQgYXJlIG5vdCBvbiBjbGFzc2RlZiBvciBhcmUgb2YgYSBkaWZmZXJlbnQgdHlwZSBvblxuXHQgKiAgY2xhc3NkZWYuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBtaXNzaW5nQXR0cmlidXRlcyhjbGFzc2RlZiwgcHJvdG9jb2wpIHtcblx0XHR2YXIgcmVzdWx0ID0gW10sIG9iaiA9IGNsYXNzZGVmLnByb3RvdHlwZSwgcmVxdWlyZW1lbnQgPSBwcm90b2NvbC5wcm90b3R5cGU7XG5cdFx0Zm9yICh2YXIgaXRlbSBpbiByZXF1aXJlbWVudCkge1xuXHRcdFx0aWYgKHR5cGVvZiBvYmpbaXRlbV0gIT09IHR5cGVvZiByZXF1aXJlbWVudFtpdGVtXSkge1xuXHRcdFx0XHRyZXN1bHQucHVzaChpdGVtKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmb3IgKHZhciBpdGVtIGluIHByb3RvY29sKSB7XG5cdFx0XHRpZiAocHJvdG9jb2wuaGFzT3duUHJvcGVydHkoaXRlbSkgJiYgIHR5cGVvZiBjbGFzc2RlZltpdGVtXSAhPT0gdHlwZW9mIHByb3RvY29sW2l0ZW1dKSB7XG5cdFx0XHRcdC8vIElmIHdlJ3JlIGluIGllOCwgb3VyIGludGVybmFsIHZhcmlhYmxlcyB3b24ndCBiZSBub25lbnVtZXJhYmxlLCBzbyB3ZSBpbmNsdWRlIGEgY2hlY2sgZm9yIHRoYXQgaGVyZS5cblx0XHRcdFx0aWYgKGludGVybmFsVXNlTmFtZXMuaW5kZXhPZihpdGVtKSA8IDApIHtcblx0XHRcdFx0XHRyZXN1bHQucHVzaChpdGVtICsgJyAoY2xhc3MgbWV0aG9kKScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb3BpZXMgYWxsIHByb3BlcnRpZXMgZnJvbSB0aGUgc291cmNlIHRvIHRoZSB0YXJnZXQgKGluY2x1ZGluZyBpbmhlcml0ZWQgcHJvcGVydGllcykgYW5kIG9wdGlvbmFsbHkgbWFrZXMgdGhlbVxuXHQgKiAgbm90IGVudW1lcmFibGUuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBjb3B5KHNvdXJjZSwgdGFyZ2V0LCBoaWRkZW4pIHtcblx0XHRmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHtcblx0XHRcdFx0ZW51bWVyYWJsZTogaGlkZGVuICE9PSB0cnVlLFxuXHRcdFx0XHRjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHR2YWx1ZTogc291cmNlW2tleV1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiB0YXJnZXQ7XG5cdH1cblxuXHQvKipcblx0ICogVHVybnMgYSBmdW5jdGlvbiBpbnRvIGEgbWV0aG9kIGJ5IHVzaW5nICd0aGlzJyBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBtYWtlTWV0aG9kKGZ1bmMpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgYXJncyA9IFt0aGlzXS5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcblx0XHRcdHJldHVybiBmdW5jLmFwcGx5KG51bGwsIGFyZ3MpO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogTWl4aW4gZnVuY3Rpb25zIGFyZSBzYW5kYm94ZWQgaW50byB0aGVpciBvd24gaW5zdGFuY2UuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBnZXRTYW5kYm94ZWRGdW5jdGlvbihteU1peElkLCBtaXgsIGZ1bmMpIHtcblx0XHR2YXIgcmVzdWx0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgbWl4SW5zdGFuY2VzID0gbm9uZW51bSh0aGlzLCAnX19tdWx0aXBhcmVudEluc3RhbmNlc19fJywgW10pO1xuXHRcdFx0dmFyIG1peEluc3RhbmNlID0gbWl4SW5zdGFuY2VzW215TWl4SWRdO1xuXHRcdFx0aWYgKG1peEluc3RhbmNlID09IG51bGwpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBtaXggPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRtaXhJbnN0YW5jZSA9IG5ldyBtaXgoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRtaXhJbnN0YW5jZSA9IE9iamVjdC5jcmVhdGUobWl4KTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBjb3VsZCBhZGQgYSBub25lbnVtIHBvaW50ZXIgdG8gX190aGlzX18gb3Igc29tZXRoaW5nIGlmIHdlIHdhbnRlZCB0byBhbGxvdyBlc2NhcGUgZnJvbSB0aGUgc2FuZGJveC5cblx0XHRcdFx0bWl4SW5zdGFuY2VzW215TWl4SWRdID0gbWl4SW5zdGFuY2U7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZnVuYy5hcHBseShtaXhJbnN0YW5jZSwgYXJndW1lbnRzKTtcblx0XHR9O1xuXG5cdFx0bm9uZW51bShyZXN1bHQsICdfX29yaWdpbmFsX18nLCBmdW5jKTtcblx0XHRub25lbnVtKHJlc3VsdCwgJ19fc291cmNlX18nLCBtaXgpO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDbGVhcnMgdGhlIGBfX2Fzc2lnbmFibGVfZnJvbV9jYWNoZV9fYCBjYWNoZSBmb3IgdGFyZ2V0IGFuZCBwYXJlbnQuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBjbGVhckFzc2lnbmFibGVDYWNoZSh0YXJnZXQsIHBhcmVudCkge1xuXHRcdGlmICgnX19hc3NpZ25hYmxlX2Zyb21fY2FjaGVfXycgaW4gdGFyZ2V0KSB7XG5cdFx0XHRkZWxldGUgdGFyZ2V0Ll9fYXNzaWduYWJsZV9mcm9tX2NhY2hlX19bY2xhc3NJZChwYXJlbnQpXTtcblx0XHR9XG5cdH1cblxuXG5cdGZ1bmN0aW9uIGdldFByb3RvdHlwZU9mKG9iaikge1xuXHRcdGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YpIHtcblx0XHRcdHZhciBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopO1xuXG5cdFx0XHQvLyB0byBhdm9pZCBiYWQgc2hhbXMuLi5cblx0XHRcdGlmIChwcm90byAhPT0gb2JqKSB7XG5cdFx0XHRcdHJldHVybiBwcm90bztcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyB0aGlzIGlzIHdoYXQgbW9zdCBzaGFtcyBkbywgYnV0IHNvbWV0aW1lcyBpdCdzIHdyb25nLlxuXHRcdGlmIChvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICE9PSBvYmopIHtcblx0XHRcdHJldHVybiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlO1xuXHRcdH1cblxuXHRcdC8vIHRoaXMgd29ya3Mgb25seSBpZiB3ZSd2ZSBiZWVuIGtpbmQgZW5vdWdoIHRvIHN1cHBseSBhIHN1cGVyY2xhc3MgcHJvcGVydHkgKHdoaWNoIHdlIGRvIHdoZW4gd2UgZXh0ZW5kIGNsYXNzZXMpXG5cdFx0aWYgKG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3Iuc3VwZXJjbGFzcykge1xuXHRcdFx0cmV0dXJuIG9iai5jb25zdHJ1Y3Rvci5zdXBlcmNsYXNzLnByb3RvdHlwZTtcblx0XHR9XG5cblx0XHQvLyBjYW4ndCBmaW5kIGEgZ29vZCBwcm90b3R5cGUuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXG5cdC8vIEV4cG9ydGluZyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cdHZhciBtZXRob2RzID0ge1xuXHRcdCdleHRlbmQnOiBleHRlbmQsICdpbmhlcml0JzogaW5oZXJpdCwgJ21peGluJzogbWl4aW4sICdpbXBsZW1lbnQnOiBpbXBsZW1lbnQsXG5cdFx0J2hhc0ltcGxlbWVudGVkJzogaGFzSW1wbGVtZW50ZWQsICdjbGFzc0lzQSc6IGNsYXNzSXNBLCAnaXNBc3NpZ25hYmxlRnJvbSc6IGNsYXNzSXNBLFxuXHRcdCdpc0EnOiBpc0EsICdmdWxmaWxscyc6IGZ1bGZpbGxzLCAnY2xhc3NGdWxmaWxscyc6IGNsYXNzRnVsZmlsbHNcblx0fTtcblxuXHQvKiBqc2hpbnQgZXZpbDp0cnVlICovXG5cdHZhciBnbG9iYWwgPSAobmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpczsnKSkoKTtcblxuXHR2YXIgZXhwb3J0aW5nID0ge1xuXHRcdCdleHBvcnRUbyc6IGZ1bmN0aW9uKHRvKSB7XG5cdFx0XHRjb3B5KG1ldGhvZHMsIHRvIHx8IGdsb2JhbCwgdHJ1ZSk7XG5cdFx0fSxcblx0XHQnaW5zdGFsbCc6IGZ1bmN0aW9uKHRhcmdldCkge1xuXHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIHR5cGVvZiB0YXJnZXQgIT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKG1zZyhFUlJPUl9NRVNTQUdFUy5CQURfSU5TVEFMTCwgdHlwZW9mIHRhcmdldCkpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGlzR2xvYmFsSW5zdGFsbCA9IGFyZ3VtZW50cy5sZW5ndGggPCAxXG5cblx0XHRcdGNvcHkoe1xuXHRcdFx0XHRpc0E6IG1ha2VNZXRob2QobWV0aG9kcy5pc0EpLFxuXHRcdFx0XHRmdWxmaWxsczogbWFrZU1ldGhvZChtZXRob2RzLmZ1bGZpbGxzKVxuXHRcdFx0fSwgaXNHbG9iYWxJbnN0YWxsID8gT2JqZWN0LnByb3RvdHlwZSA6IHRhcmdldC5wcm90b3R5cGUsIHRydWUpO1xuXG5cdFx0XHR2YXIgaXRlbXNUb0luc3RhbGxUb0Z1bmN0aW9uID0ge1xuXHRcdFx0XHQnY2xhc3NJc0EnOiBtYWtlTWV0aG9kKG1ldGhvZHMuY2xhc3NJc0EpLFxuXHRcdFx0XHQnaW1wbGVtZW50cyc6IG1ha2VNZXRob2QobWV0aG9kcy5pbXBsZW1lbnQpLFxuXHRcdFx0XHQnaGFzSW1wbGVtZW50ZWQnOiBtYWtlTWV0aG9kKG1ldGhvZHMuaGFzSW1wbGVtZW50ZWQpLFxuXHRcdFx0XHQnZnVsZmlsbHMnOiBtYWtlTWV0aG9kKG1ldGhvZHMuY2xhc3NGdWxmaWxscyksXG5cdFx0XHRcdC8vIHdlIGNhbiAnZXh0ZW5kJyBhIHN1cGVyY2xhc3MgdG8gbWFrZSBhIHN1YmNsYXNzLlxuXHRcdFx0XHQnZXh0ZW5kJzogZnVuY3Rpb24ocHJvcGVydGllcykge1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgcHJvcGVydGllcyA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGV4dGVuZChwcm9wZXJ0aWVzLCB0aGlzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIGV4dGVuZChudWxsLCB0aGlzLCBwcm9wZXJ0aWVzKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0J21peGluJzogbWFrZU1ldGhvZChtZXRob2RzLm1peGluKSxcblx0XHRcdFx0J2luaGVyaXRzJzogbWFrZU1ldGhvZChtZXRob2RzLmluaGVyaXQpXG5cdFx0XHR9O1xuXHRcdFx0aWYgKGlzR2xvYmFsSW5zdGFsbCkge1xuXHRcdFx0XHQvLyBubyBwb2ludCBpbiBoYXZpbmcgc3ViY2xhc3MuZXh0ZW5kcyB1bmxlc3MgaXQncyBnbG9iYWwuXG5cdFx0XHRcdGl0ZW1zVG9JbnN0YWxsVG9GdW5jdGlvblsnZXh0ZW5kcyddID0gbWFrZU1ldGhvZChtZXRob2RzLmV4dGVuZCk7XG5cdFx0XHR9XG5cblx0XHRcdGNvcHkoaXRlbXNUb0luc3RhbGxUb0Z1bmN0aW9uLCBpc0dsb2JhbEluc3RhbGwgPyBGdW5jdGlvbi5wcm90b3R5cGUgOiB0YXJnZXQsIGlzR2xvYmFsSW5zdGFsbCk7XG5cblx0XHRcdHJldHVybiB0YXJnZXQ7XG5cdFx0fVxuXHR9O1xuXHRleHBvcnRpbmcuZXhwb3J0ID0gZXhwb3J0aW5nLmV4cG9ydFRvOyAvLyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcblxuXHRtZXRob2RzLkJhc2UgPSBleHBvcnRpbmcuaW5zdGFsbChmdW5jdGlvbiBCYXNlQ2xhc3MoKSB7fSk7XG5cblx0Y29weShtZXRob2RzLCBleHBvcnRpbmcpO1xuXG5cdC8vIG5vdCBzdXJlIGlmIHRoaXMgd29ya3MgaW4gbm9kZS1qYXNtaW5lLi4uLlxuXHRpZiAoJ2phc21pbmUnIGluIGdsb2JhbCkge1xuXHRcdHZhciBlcnIgPSB7fTtcblx0XHR2YXIgZ2V0RXJyID0gZnVuY3Rpb24oa2V5KSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBtZXNzYWdlID0gRVJST1JfTUVTU0FHRVNba2V5XTtcblx0XHRcdFx0dmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cdFx0XHRcdGFyZ3MudW5zaGlmdChtZXNzYWdlKTtcblx0XHRcdFx0dmFyIHJlc3VsdCA9IG1zZy5hcHBseShudWxsLCBhcmdzKTtcblx0XHRcdFx0aWYgKHJlc3VsdCA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIk5vIHN1Y2ggZXJyb3IgbWVzc2FnZSBcIiArIGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH07XG5cdFx0fTtcblx0XHRmb3IgKHZhciBrZXkgaW4gRVJST1JfTUVTU0FHRVMpIHtcblx0XHRcdGVycltrZXldID0gZ2V0RXJyKGtleSk7XG5cdFx0fVxuXHRcdGV4cG9ydGluZy5fZXJyID0gZXJyO1xuXHR9XG5cblx0cmV0dXJuIGV4cG9ydGluZztcbn0pO1xuIiwidmFyIENoYXRSb29tID0gcmVxdWlyZSggJy4vQ2hhdFJvb20nICk7XG52YXIgQ2hhdFVzZXIgPSByZXF1aXJlKCAnLi9DaGF0VXNlcicgKTtcbnZhciBQbGF0Zm9ybUFkYXB0ZXIgPSByZXF1aXJlKCAnLi9QbGF0Zm9ybUFkYXB0ZXInICk7XG52YXIgdXNpbmcgPSByZXF1aXJlKCAndHlwZXN0ZXInICkudXNpbmc7XG5cbi8qKlxuICogQSBjaGF0IGVuZ2luZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqXG4gKiBAcGFyYW0ge0NoYXRVc2VyfSB1c2VyXG4gKiAgICBUaGUgdXNlciBvZiB0aGUgY2hhdC5cbiAqIEBwYXJhbSB7UGxhdGZvcm1BZGFwdGVyfSBhZGFwdGVyXG4gKiAgICBUaGUgaG9va3MgdGhlIGNvcmUgZnVuY3Rpb25hbGl0eSB1cCB0byBhIHNwZWNpZmljIHBsYXRmb3JtIGltcGxlbWVuYXRpb24uXG4gKi9cbmZ1bmN0aW9uIENoYXQoIHVzZXIsIGFkYXB0ZXIgKSB7XG4gIHVzaW5nKCBhcmd1bWVudHMgKVxuICAgIC52ZXJpZnkoICd1c2VyJyApLmZ1bGZpbGxzKCBDaGF0VXNlciApXG4gICAgLnZlcmlmeSggJ2FkYXB0ZXInICkuZnVsZmlsbHMoIFBsYXRmb3JtQWRhcHRlciApO1xuXG4gIC8qKlxuICAgKiBUaGUgY3VycmVudCB1c2VyIGluIHRoZSBjaGF0LlxuICAgKiBAdHlwZSBDaGF0VXNlclxuICAgKi9cbiAgdGhpcy51c2VyID0gdXNlcjtcblxuICAvKipcbiAgICogQHR5cGUgUGxhdGZvcm1BZGFwdGVyXG4gICAqL1xuICB0aGlzLl9hZGFwdGVyID0gYWRhcHRlcjtcblxuICAvKipcbiAgICogQ2hhdCByb29tcyB0aGF0IGFyZSBhdmFpbGFibGUuXG4gICAqIEEgbWFwIG9mIGNoYXQgcm9vbSBuYW1lIHRvIENoYXRSb29tIG9iamVjdC5cbiAgICogQHR5cGUgTWFwXG4gICAqL1xuICB0aGlzLnJvb21zID0ge307XG5cbiAgdGhpcy5fYWRhcHRlci5zZXRVc2VyKCB1c2VyICk7XG5cbiAgLyoqXG4gICAqIFRoZSBkZWZhdWx0IHJvb20gZm9yIHRoZSBjaGF0XG4gICAqIEB0eXBlIENoYXRSb29tXG4gICAqL1xuICB0aGlzLmRlZmF1bHRSb29tID0gdGhpcy5hZGRSb29tKCAnbG9iYnknICk7XG59XG5cbi8qKlxuICogU2VuZCBhIG1lc3NhZ2UgdG8gdGhlIGRlZmF1bHQgY2hhdCByb29tLlxuICpcbiAqIEBwYXJhbSB7Q2hhdE1lc3NhZ2V9IG1lc3NhZ2VcbiAqICAgIFRoZSBtZXNzYWdlIHRvIHNlbmQgdG8gdGhlIGRlZmF1bHQgY2hhdCByb29tXG4gKi9cbkNoYXQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbiggbWVzc2FnZSApIHtcbiAgdGhpcy5kZWZhdWx0Um9vbS5zZW5kKCBtZXNzYWdlICk7XG59O1xuXG4vKipcbiAqIEFkZCBhIG5ldyByb29tIHRvIHRoZSBjaGF0LlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgY2hhdCByb29tIHRvIGJlIGFkZGVkLlxuICogQHJldHVybiB7Q2hhdFJvb219IFRoZSBuZXdseSBjcmVhdGVkIHJvb21cbiAqL1xuQ2hhdC5wcm90b3R5cGUuYWRkUm9vbSA9IGZ1bmN0aW9uKCBuYW1lICkge1xuICBpZiggdGhpcy5yb29tc1sgbmFtZSBdICE9PSB1bmRlZmluZWQgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCAnUm9vbSB3aXRoIG5hbWUgXCInICsgbmFtZSArICdcIiBhbHJlYWR5IGV4aXN0cycgKTtcbiAgfVxuXG4gIHZhciByb29tID0gbmV3IENoYXRSb29tKCBuYW1lLCB0aGlzLl9hZGFwdGVyICk7XG4gIHRoaXMucm9vbXNbIG5hbWUgXSA9IHJvb207XG5cbiAgdGhpcy5fYWRhcHRlci5hZGRSb29tKCByb29tICk7XG5cbiAgcmV0dXJuIHJvb207XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXQ7XG5cblxuXG5cblxuLy8gb24oICduZXctbWVzc2FnZScgKVxuLy8gb24oICduZXcnKVxuXG4vLyBhZGRNZXNzYWdlTGlzdGVuZXIoIGxpc3RlbmVyIClcbiIsIi8qKlxuICogQSBjaGF0IG1lc3NhZ2VcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkXG4gKiAgICBUaGUgaWQgb2YgdGhlIHVzZXIgc2VuZGluZyB0aGUgbWVzc2FnZVxuICogQHBhcmFtIHtTdHJpbmd9IHRleHRcbiAqICAgIFRoZSBtZXNzYWdlIHRleHQgY29udGVudHNcbiAqIEBwYXJhbSB7RGF0ZX0gc2VudFRpbWVcbiAqICAgIFRoZSB0aW1lIHRoZSBtZXNzYWdlIHdhcyBzZW50LiBPcHRpb25hbDogZGVmYXVsdHMgdG8gdGhlIGN1cnJlbnQgdGltZS5cbiAqL1xuZnVuY3Rpb24gQ2hhdE1lc3NhZ2UoIHVzZXJJZCwgdGV4dCwgc2VudFRpbWUgKSB7XG4gIHNlbnRUaW1lID0gc2VudFRpbWUgfHwgbmV3IERhdGUoKTtcblxuICB0aGlzLnVzZXJJZCA9IHVzZXJJZDtcbiAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgdGhpcy5zZW50VGltZSA9IHNlbnRUaW1lO1xufVxuXG4vKipcbiAqIFVuaXF1ZSBJRCBvZiB0aGUgdXNlciBzZW5kaW5nIHRoZSBtZXNzYWdlXG4gKlxuICogQHR5cGUgU3RyaW5nXG4gKi9cbkNoYXRNZXNzYWdlLnByb3RvdHlwZS51c2VySWQgPSAnJztcblxuLyoqXG4gKiBNZXNzYWdlIHRleHRcbiAqXG4gKiBAdHlwZSBTdHJpbmdcbiAqL1xuQ2hhdE1lc3NhZ2UucHJvdG90eXBlLnRleHQgPSAnJztcblxuLyoqXG4gKiBUaW1lIHRoZSBtZXNzYWdlIHdhcyBzZW50LlxuICpcbiAqIEB0eXBlIERhdGVcbiAqL1xuQ2hhdE1lc3NhZ2UucHJvdG90eXBlLnNlbnRUaW1lID0gbmV3IERhdGUoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGF0TWVzc2FnZTtcbiIsInZhciBQbGF0Zm9ybUFkYXB0ZXIgPSByZXF1aXJlKCAnLi9QbGF0Zm9ybUFkYXB0ZXInICk7XG52YXIgQ2hhdE1lc3NhZ2UgPSByZXF1aXJlKCAnLi9DaGF0TWVzc2FnZScgKTtcbnZhciB1c2luZyA9IHJlcXVpcmUoICd0eXBlc3RlcicgKS51c2luZztcblxuLyoqXG4gKiBBIGNoYXQgcm9vbS5cbiAqL1xuZnVuY3Rpb24gQ2hhdFJvb20oIG5hbWUsIGFkYXB0ZXIgKSB7XG4gIHVzaW5nKCBhcmd1bWVudHMgKVxuICAgIC52ZXJpZnkoICduYW1lJyApLmZ1bGZpbGxzKCBTdHJpbmcgKVxuICAgIC52ZXJpZnkoICdhZGFwdGVyJyApLmZ1bGZpbGxzKCBQbGF0Zm9ybUFkYXB0ZXIgKTtcblxuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIHJvb21cbiAgICogQHR5cGUgU3RyaW5nXG4gICAqL1xuICB0aGlzLm5hbWUgPSBuYW1lO1xuXG4gIC8qKlxuICAgKiBUaGUgdXNlcnMgaW4gdGhlIGNoYXQgcm9vbS5cbiAgICogQSBsb29rdXAgb2YgdXNlciBJRCB0byBjaGF0IHVzZXJcbiAgICogQHR5cGUgTWFwXG4gICAqL1xuICB0aGlzLnVzZXJzID0ge307XG5cbiAgLy8gVE9ETzogbWVzc2FnZXM/XG5cbiAgLyoqXG4gICAqIEB0eXBlIFBsYXRmb3JtQWRhcHRlclxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdGhpcy5fYWRhcHRlciA9IGFkYXB0ZXI7XG59XG5cbi8qKlxuICogU2VuZCB0aGUgbWVzc2FnZS5cbiAqXG4gKiBAcGFyYW0ge0NoYXRNZXNzYWdlfSBtZXNzYWdlXG4gKi9cbkNoYXRSb29tLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oIG1lc3NhZ2UgKSB7XG4gIHVzaW5nKCBhcmd1bWVudHMgKVxuICAgIC52ZXJpZnkoICdtZXNzYWdlJyApLmZ1bGZpbGxzKCBDaGF0TWVzc2FnZSApO1xuXG4gIHRoaXMuX2FkYXB0ZXIuc2VuZCggbWVzc2FnZSApO1xufTtcblxuLyoqXG4gKiBBZGRzIGEgdXNlciB0byBhIHJvb20uXG4gKi9cbkNoYXRSb29tLnByb3RvdHlwZS5qb2luID0gZnVuY3Rpb24oIHVzZXIgKSB7XG4gIGlmKCB0aGlzLnVzZXJzWyB1c2VyLmlkIF0gIT09IHVuZGVmaW5lZCApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdBIHVzZXIgd2l0aCB0aGUgaWQgXCInICsgdXNlci5pZCArICdcIiBpcyBhbHJlYWR5IGluIHRoZSByb29tLiBDYW5ub3Qgam9pbiB0aGUgcm9vbSB0d2ljZS4nICk7XG4gIH1cbiAgdGhpcy51c2Vyc1sgdXNlci5pZCBdID0gdXNlcjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hhdFJvb207XG4iLCJmdW5jdGlvbiBDaGF0VXNlciggdXNlcklkICkge1xuICAvKipcbiAgICogVW5pcXVlIElEIG9mIHRoZSB1c2VyIHNlbmRpbmcgdGhlIG1lc3NhZ2VcbiAgICpcbiAgICogQHR5cGUgU3RyaW5nXG4gICAqL1xuICB0aGlzLmlkID0gdXNlcklkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXRVc2VyO1xuIiwiLyoqXG4gKiBUaGUgaW50ZXJmYWNlIHRoYXQgc3BlY2lmaWMgcGxhdGZvcm0gYWRhcHRlcnMgbXVzdCBpbXBsZW1lbnQuXG4gKiBJdCB3aWxsIGJlIGludGVyYWN0ZWQgd2l0aCB2aWEgdGhlIGNvcmUgYW5kIGVhY2ggcGxhdGZvcm0gbXVzdCBwcm92aWRlIGl0cyBvd24gaW1wbGVtZW50YXRpb24uXG4gKi9cbmZ1bmN0aW9uIFBsYXRmb3JtQWRhcHRlcigpIHtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGN1cnJlbnQgdXNlciBmb3IgdGhlIGNoYXQuXG4gKiBBbiBpbXBsZW1lbnRhdGlvbiBzaG91bGQgdXNlIHRoaXMgZm9yIHByZXNlbmNlIGluZm9ybWF0aW9uLlxuICpcbiAqIEBwYXJhbSB7Q2hhdFVzZXJ9IHVzZXJcbiAqICAgVGhlIGNoYXQgdXNlci5cbiAqL1xuUGxhdGZvcm1BZGFwdGVyLnByb3RvdHlwZS5zZXRVc2VyID0gZnVuY3Rpb24oIHVzZXIgKSB7fTtcblxuLyoqXG4gKiBBZGQgYSByb29tIHRvIHRoZSBjaGF0LlxuICogSW4gYW4gaW1wbGVtZW50YXRpb24gdGhpcyBtYXkgcmV0cmlldmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGNoYW5uZWwuXG4gKiBTb21lIGltcGxlbWVudGF0aW9ucyBtYXkgc3Vic2NyaWJlIHRvIGEgY2hhbm5lbCwgYnV0IGl0IG1heSBiZSBtb3JlIGVmZmljaWVudFxuICogdG8gb25seSBzdWJzY3JpYmUgaWYgdGhlIGN1cnJlbnQgdXNlciBqb2lucyBhIHJvb20uXG4gKlxuICogQHBhcmFtIHtDaGF0Um9vbX0gcm9vbVxuICogICAgVGhlIHJvb20gdG8gYWRkIHRvIHRoZSBjaGF0LlxuICovXG5QbGF0Zm9ybUFkYXB0ZXIucHJvdG90eXBlLmFkZFJvb20gPSBmdW5jdGlvbiggcm9vbSApIHt9O1xuXG4vKipcbiAqIFNlbmQgYSBtZXNzYWdlLlxuICogSW4gYW4gaW1wbGVtZW50YXRpb24gdGhpcyBtYXkgdHJpZ2dlciBvciBwdWJsaXNoIGEgbWVzc2FnZSBvbiBhIGNoYW5uZWwuXG4gKlxuICogQHBhcmFtIHtDaGF0TWVzc2FnZX0gbWVzc2FnZVxuICogICAgVGhlIG1lc3NhZ2UgdG8gc2VuZC5cbiAqL1xuUGxhdGZvcm1BZGFwdGVyLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oIG1lc3NhZ2UgKSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF0Zm9ybUFkYXB0ZXI7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ2hhdDogcmVxdWlyZSggJy4vQ2hhdCcgKSxcbiAgQ2hhdFVzZXI6IHJlcXVpcmUoICcuL0NoYXRVc2VyJyApLFxuICBDaGF0TWVzc2FnZTogcmVxdWlyZSggJy4vQ2hhdE1lc3NhZ2UnIClcbn07XG4iXX0=
(15)
});
