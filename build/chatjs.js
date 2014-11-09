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
 * @param {PlatformAdapter} adapter
 *    The hooks the core functionality up to a specific platform implemenation.
 */
function Chat( adapter ) {
  using( arguments )
    .verify( 'adapter' ).fulfills( PlatformAdapter );

  /**
   * @type PlatformAdapter
   */
  this._adapter = adapter;

  /**
   * The default room for the chat
   * @type ChatRoom
   */
  this.defaultRoom = new ChatRoom( 'lobby', this._adapter );

  /**
   * The current user in the chat.
   * @type ChatUser
   */
  this.user = null;

  /**
   * Chat rooms that are available.
   * A map of chat room name to ChatRoom object.
   * @type Map
   */
  this.rooms = {};
}

/**
 * Set the current user for the chat engine.
 *
 * @param {ChatUser} user
 *    The current user
 */
Chat.prototype.setUser = function( user ) {
  if( !user.id ) {
    throw new Error( 'The "user" must implement the ChatUser interface' );
  }
  this.user = user;
};

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

  var room = new ChatRoom( name, this );
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
var ChatMessage = _dereq_( './ChatMessage' );
var using = _dereq_('typester').using;

/**
 * A chat room.
 */
function ChatRoom( name, adapter ) {
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

},{"./ChatMessage":11,"typester":5}],13:[function(_dereq_,module,exports){
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
var Chat = _dereq_( './Chat.js' );
module.exports = {
  Chat: Chat
};

},{"./Chat.js":10}]},{},[15])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9ub2RlX21vZHVsZXMvdHlwZXN0ZXIvbGliL0FyZ1ZlcmlmaWVyLmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9ub2RlX21vZHVsZXMvdHlwZXN0ZXIvbGliL0FyZ3NWZXJpZmllci5qcyIsIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvbm9kZV9tb2R1bGVzL3R5cGVzdGVyL2xpYi9Bcmd1bWVudEVycm9yLmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9ub2RlX21vZHVsZXMvdHlwZXN0ZXIvbGliL1ZhbGlkYXRpb25FcnJvci5qcyIsIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvbm9kZV9tb2R1bGVzL3R5cGVzdGVyL2xpYi90eXBlc3Rlci5qcyIsIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvbm9kZV9tb2R1bGVzL3R5cGVzdGVyL2xpYi92ZXJpZmllcnMvTm9uRW1wdHlWZXJpZmllci5qcyIsIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvbm9kZV9tb2R1bGVzL3R5cGVzdGVyL2xpYi92ZXJpZmllcnMvTnVtYmVyVmVyaWZpZXIuanMiLCIvVXNlcnMvbGVnZ2V0dGVyL2xlZ2dldHRlci9naXQvY2hhdGpzL25vZGVfbW9kdWxlcy90eXBlc3Rlci9saWIvdmVyaWZpZXJzL1RvcGlhcmlzdFZlcmlmaWVyLmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9ub2RlX21vZHVsZXMvdHlwZXN0ZXIvbm9kZV9tb2R1bGVzL3RvcGlhcmlzdC9saWIvdG9waWFyaXN0LmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9zcmMvY29yZS9DaGF0LmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9zcmMvY29yZS9DaGF0TWVzc2FnZS5qcyIsIi9Vc2Vycy9sZWdnZXR0ZXIvbGVnZ2V0dGVyL2dpdC9jaGF0anMvc3JjL2NvcmUvQ2hhdFJvb20uanMiLCIvVXNlcnMvbGVnZ2V0dGVyL2xlZ2dldHRlci9naXQvY2hhdGpzL3NyYy9jb3JlL0NoYXRVc2VyLmpzIiwiL1VzZXJzL2xlZ2dldHRlci9sZWdnZXR0ZXIvZ2l0L2NoYXRqcy9zcmMvY29yZS9QbGF0Zm9ybUFkYXB0ZXIuanMiLCIvVXNlcnMvbGVnZ2V0dGVyL2xlZ2dldHRlci9naXQvY2hhdGpzL3NyYy9jb3JlL2Zha2VfNmViMDk5OTguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3IxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgQXJndW1lbnRFcnJvciA9IHJlcXVpcmUoJy4vQXJndW1lbnRFcnJvcicpO1xudmFyIHRvcGlhcmlzdCA9IHJlcXVpcmUoJ3RvcGlhcmlzdCcpO1xuXG5mdW5jdGlvbiB2ZXJpZmllck1ldGhvZCgpIHtcbiAgaWYoIXRoaXMuc2tpcFZlcmlmaWNhdGlvbikge1xuICAgIGlmKHRoaXMuYXJnVmFsdWUgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IHRoaXMuQXJndW1lbnRFcnJvcih0aGlzLmFyZ05hbWUgKyAnIGFyZ3VtZW50IG11c3QgYmUgcHJvdmlkZWQuJyk7XG5cbiAgICB0aGlzLk1FVEhPRF9OQU1FKGFyZyk7XG4gIH1cblxuICBpZih0aGlzLmFyZ3NWZXJpZmllci5hcmdJbmRleCA8IHRoaXMuYXJnc1ZlcmlmaWVyLmFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLmFyZ3NWZXJpZmllci5jb25zdHJ1Y3Rvci5wZW5kaW5nVmVyaWZpZXIgPSB0aGlzLmFyZ3NWZXJpZmllcjtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmFyZ3NWZXJpZmllcjtcbn1cbnZhciB2ZXJpZmllck1ldGhvZFN0ciA9IHZlcmlmaWVyTWV0aG9kLnRvU3RyaW5nKCkuc3Vic3RyaW5nKHZlcmlmaWVyTWV0aG9kLnRvU3RyaW5nKCkuaW5kZXhPZigneycpICsgMSwgdmVyaWZpZXJNZXRob2QudG9TdHJpbmcoKS5sYXN0SW5kZXhPZignfScpKTtcblxuZnVuY3Rpb24gQXJnVmVyaWZpZXIoYXJnc1ZlcmlmaWVyLCBhcmdOYW1lLCBhcmdWYWx1ZSkge1xuICB0aGlzLmFyZ3NWZXJpZmllciA9IGFyZ3NWZXJpZmllcjtcbiAgdGhpcy5hcmdOYW1lID0gYXJnTmFtZTtcbiAgdGhpcy5hcmdWYWx1ZSA9IGFyZ1ZhbHVlO1xufVxuXG5BcmdWZXJpZmllci5hZGRWZXJpZmllciA9IGZ1bmN0aW9uKHZlcmlmaWVyKSB7XG4gIGZvcih2YXIgbWV0aG9kTmFtZSBpbiB2ZXJpZmllcikge1xuICAgIEFyZ1ZlcmlmaWVyLnByb3RvdHlwZVsnXycgKyBtZXRob2ROYW1lXSA9IHZlcmlmaWVyW21ldGhvZE5hbWVdO1xuICAgIEFyZ1ZlcmlmaWVyLnByb3RvdHlwZVttZXRob2ROYW1lXSA9IG5ldyBGdW5jdGlvbignYXJnJywgdmVyaWZpZXJNZXRob2RTdHIucmVwbGFjZSgnTUVUSE9EX05BTUUnLCAnXycgKyBtZXRob2ROYW1lKSk7XG4gIH1cbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcmdWZXJpZmllci5wcm90b3R5cGUsICdvcHRpb25hbGx5Jywge1xuICBnZXQ6IGZ1bmN0aW9uIG9wdGlvbmFsbHkoKSB7XG4gICAgaWYoKHRoaXMuYXJnVmFsdWUgPT09IHVuZGVmaW5lZCkgfHwgKHRoaXMuYXJnVmFsdWUgPT09IG51bGwpKSB7XG4gICAgICB0aGlzLnNraXBWZXJpZmljYXRpb24gPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59KTtcblxuQXJnVmVyaWZpZXIucHJvdG90eXBlLkFyZ3VtZW50RXJyb3IgPSBBcmd1bWVudEVycm9yO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFyZ1ZlcmlmaWVyO1xuIiwidmFyIEFyZ1ZlcmlmaWVyID0gcmVxdWlyZSgnLi9BcmdWZXJpZmllcicpO1xudmFyIEFyZ3VtZW50RXJyb3IgPSByZXF1aXJlKCcuL0FyZ3VtZW50RXJyb3InKTtcblxuZnVuY3Rpb24gQXJnc1ZlcmlmaWVyKGFyZ3VtZW50cykge1xuICBpZihBcmdzVmVyaWZpZXIucGVuZGluZ1ZlcmlmaWVyKSB0aHJvdyBwZW5kaW5nVmVyaWZpZXJFcnJvcigpO1xuICBpZihhcmd1bWVudHMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEFyZ3VtZW50RXJyb3IoJ2FyZ3VtZW50cyBhcmd1bWVudCBtdXN0IGJlIHByb3ZpZGVkJyk7XG5cbiAgdGhpcy5hcmd1bWVudHMgPSBhcmd1bWVudHM7XG4gIHRoaXMuYXJnSW5kZXggPSAwO1xufVxuXG5BcmdzVmVyaWZpZXIucHJvdG90eXBlLnZlcmlmeSA9IGZ1bmN0aW9uKGFyZ05hbWUpIHtcbiAgQXJnc1ZlcmlmaWVyLnBlbmRpbmdWZXJpZmllciA9IG51bGw7XG4gIGlmKHR5cGVvZihhcmdOYW1lKSAhPSAnc3RyaW5nJykgdGhyb3cgbmV3IFR5cGVFcnJvcignYXJnTmFtZSBhcmd1bWVudCBtdXN0IGJlIGEgU3RyaW5nJyk7XG5cbiAgcmV0dXJuIG5ldyBBcmdWZXJpZmllcih0aGlzLCBhcmdOYW1lLCB0aGlzLmFyZ3VtZW50c1t0aGlzLmFyZ0luZGV4KytdKTtcbn07XG5cbmZ1bmN0aW9uIHBlbmRpbmdWZXJpZmllckVycm9yKCkge1xuICB2YXIgcGVuZGluZ1ZlcmlmaWVyID0gQXJnc1ZlcmlmaWVyLnBlbmRpbmdWZXJpZmllcjtcbiAgdmFyIHBlbmRpbmdWZXJpZmllckFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChwZW5kaW5nVmVyaWZpZXIuYXJndW1lbnRzKTtcbiAgQXJnc1ZlcmlmaWVyLnBlbmRpbmdWZXJpZmllciA9IG51bGw7XG5cbiAgcmV0dXJuIG5ldyBBcmd1bWVudEVycm9yKCdvbmx5ICcgKyBwZW5kaW5nVmVyaWZpZXIuYXJnSW5kZXggKyAnIGFyZ3VtZW50KHMpIHZlcmlmaWVkIGJ1dCAnICsgcGVuZGluZ1ZlcmlmaWVyQXJncy5sZW5ndGggK1xuICAgICcgd2VyZSBwcm92aWRlZDogWycgKyBwZW5kaW5nVmVyaWZpZXJBcmdzLmpvaW4oJywgJykgKyAnXScpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFyZ3NWZXJpZmllcjtcbiIsInZhciB0b3BpYXJpc3QgPSByZXF1aXJlKCd0b3BpYXJpc3QnKTtcblxuZnVuY3Rpb24gQXJndW1lbnRFcnJvcihtZXNzYWdlKSB7XG4gIHRoaXMubmFtZSA9ICdBcmd1bWVudEVycm9yJztcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cbnRvcGlhcmlzdC5leHRlbmQoQXJndW1lbnRFcnJvciwgRXJyb3IpO1xuQXJndW1lbnRFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBcmd1bWVudEVycm9yO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFyZ3VtZW50RXJyb3I7XG4iLCJ2YXIgdG9waWFyaXN0ID0gcmVxdWlyZSgndG9waWFyaXN0Jyk7XG5cbmZ1bmN0aW9uIFZhbGlkYXRpb25FcnJvcihtZXNzYWdlKSB7XG4gIHRoaXMubmFtZSA9ICdWYWxpZGF0aW9uRXJyb3InO1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxudG9waWFyaXN0LmV4dGVuZChWYWxpZGF0aW9uRXJyb3IsIEVycm9yKTtcblZhbGlkYXRpb25FcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBWYWxpZGF0aW9uRXJyb3I7XG5cbm1vZHVsZS5leHBvcnRzID0gVmFsaWRhdGlvbkVycm9yO1xuIiwidmFyIEFyZ3NWZXJpZmllciA9IHJlcXVpcmUoJy4vQXJnc1ZlcmlmaWVyJyk7XG52YXIgQXJnVmVyaWZpZXIgPSByZXF1aXJlKCcuL0FyZ1ZlcmlmaWVyJyk7XG52YXIgVG9waWFyaXN0VmVyaWZpZXIgPSByZXF1aXJlKCcuL3ZlcmlmaWVycy9Ub3BpYXJpc3RWZXJpZmllcicpO1xudmFyIE51bWJlclZlcmlmaWVyID0gcmVxdWlyZSgnLi92ZXJpZmllcnMvTnVtYmVyVmVyaWZpZXInKTtcbnZhciBOb25FbXB0eVZlcmlmaWVyID0gcmVxdWlyZSgnLi92ZXJpZmllcnMvTm9uRW1wdHlWZXJpZmllcicpO1xudmFyIEFyZ3VtZW50RXJyb3IgPSByZXF1aXJlKCcuL0FyZ3VtZW50RXJyb3InKTtcbnZhciBWYWxpZGF0aW9uRXJyb3IgPSByZXF1aXJlKCcuL1ZhbGlkYXRpb25FcnJvcicpO1xuXG5BcmdWZXJpZmllci5hZGRWZXJpZmllcihuZXcgVG9waWFyaXN0VmVyaWZpZXIoKSk7XG5BcmdWZXJpZmllci5hZGRWZXJpZmllcihuZXcgTnVtYmVyVmVyaWZpZXIoKSk7XG5BcmdWZXJpZmllci5hZGRWZXJpZmllcihuZXcgTm9uRW1wdHlWZXJpZmllcigpKTtcblxuZXhwb3J0cy51c2luZyA9IGZ1bmN0aW9uKGFyZ3VtZW50cykge1xuICByZXR1cm4gbmV3IEFyZ3NWZXJpZmllcihhcmd1bWVudHMpO1xufTtcblxuZXhwb3J0cy5hZGRWZXJpZmllciA9IGZ1bmN0aW9uKHZlcmlmaWVyKSB7XG4gIEFyZ1ZlcmlmaWVyLmFkZFZlcmlmaWVyKHZlcmZpZXIpO1xufTtcblxuZXhwb3J0cy5Bcmd1bWVudEVycm9yID0gQXJndW1lbnRFcnJvcjtcbmV4cG9ydHMuVmFsaWRhdGlvbkVycm9yID0gVmFsaWRhdGlvbkVycm9yO1xuIiwidmFyIFZhbGlkYXRpb25FcnJvciA9IHJlcXVpcmUoJy4uL1ZhbGlkYXRpb25FcnJvcicpO1xuXG5mdW5jdGlvbiBOb25FbXB0eVZlcmlmaWVyKCkge1xufVxuXG5Ob25FbXB0eVZlcmlmaWVyLnByb3RvdHlwZS5ub25FbXB0eVN0cmluZyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmlzQShTdHJpbmcpO1xuICBpZih0aGlzLmFyZ1ZhbHVlID09PSAnJykgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvcih0aGlzLmFyZ05hbWUgKyAnIGFyZ3VtZW50IG11c3QgYmUgYSBub24tZW1wdHkgc3RyaW5nLicpO1xufTtcblxuTm9uRW1wdHlWZXJpZmllci5wcm90b3R5cGUubm9uRW1wdHlBcnJheSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmlzQShBcnJheSk7XG4gIGlmKHRoaXMuYXJnVmFsdWUubGVuZ3RoID09IDApIHRocm93IG5ldyBWYWxpZGF0aW9uRXJyb3IodGhpcy5hcmdOYW1lICsgJyBhcmd1bWVudCBtdXN0IGJlIGEgbm9uLWVtcHR5IGFycmF5LicpO1xufTtcblxuTm9uRW1wdHlWZXJpZmllci5wcm90b3R5cGUub2JqZWN0ID0gZnVuY3Rpb24oKSB7XG4gIGlmKHR5cGVvZih0aGlzLmFyZ1ZhbHVlKSAhPSAnb2JqZWN0JykgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvcih0aGlzLmFyZ05hbWUgKyAnIGFyZ3VtZW50IG11c3QgYmUgYW4gb2JqZWN0LicpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBOb25FbXB0eVZlcmlmaWVyO1xuIiwidmFyIFZhbGlkYXRpb25FcnJvciA9IHJlcXVpcmUoJy4uL1ZhbGlkYXRpb25FcnJvcicpO1xuXG5mdW5jdGlvbiBOdW1iZXJWZXJpZmllcigpIHtcbn1cblxuTnVtYmVyVmVyaWZpZXIucHJvdG90eXBlLm51bWJlciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmlzQShOdW1iZXIpO1xuICBpZigoTnVtYmVyLmlzTmFOKHRoaXMuYXJnVmFsdWUpKSB8fCAodGhpcy5hcmdWYWx1ZSA9PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpIHx8XG4gICAgKHRoaXMuYXJnVmFsdWUgPT0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKSkgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvcih0aGlzLmFyZ05hbWUgKyAnIGFyZ3VtZW50IG11c3QgYmUgYSByZWFsIG51bWJlci4nKTtcbn07XG5cbk51bWJlclZlcmlmaWVyLnByb3RvdHlwZS5wb3NpdGl2ZU51bWJlciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm51bWJlcigpO1xuICBpZih0aGlzLmFyZ1ZhbHVlIDw9IDApIHRocm93IG5ldyBWYWxpZGF0aW9uRXJyb3IodGhpcy5hcmdOYW1lICsgJyBhcmd1bWVudCBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyLicpO1xufTtcblxuTnVtYmVyVmVyaWZpZXIucHJvdG90eXBlLm5lZ2F0aXZlTnVtYmVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMubnVtYmVyKCk7XG4gIGlmKHRoaXMuYXJnVmFsdWUgPj0gMCkgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvcih0aGlzLmFyZ05hbWUgKyAnIGFyZ3VtZW50IG11c3QgYmUgYSBuZWdhdGl2ZSBudW1iZXIuJyk7XG59O1xuXG5OdW1iZXJWZXJpZmllci5wcm90b3R5cGUuaW50ZWdlck51bWJlciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm51bWJlcigpO1xuICBpZigodGhpcy5hcmdWYWx1ZSAlIDEpICE9IDApIHRocm93IG5ldyBWYWxpZGF0aW9uRXJyb3IodGhpcy5hcmdOYW1lICsgJyBhcmd1bWVudCBtdXN0IGJlIGFuIGludGVnZXIgbnVtYmVyLicpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBOdW1iZXJWZXJpZmllcjtcbiIsInZhciB0b3BpYXJpc3QgPSByZXF1aXJlKCd0b3BpYXJpc3QnKTtcblxuZnVuY3Rpb24gVG9waWFyaXN0VmVyaWZpZXIoKSB7XG59XG5cblRvcGlhcmlzdFZlcmlmaWVyLnByb3RvdHlwZS5pc0EgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmKCF0b3BpYXJpc3QuaXNBKHRoaXMuYXJnVmFsdWUsIHR5cGUpKSB0aHJvdyBuZXcgVHlwZUVycm9yKHRoaXMuYXJnTmFtZSArICcgYXJndW1lbnQgbXVzdCBiZSBhICcgKyB0eXBlLm5hbWUgKyAnLicpO1xufTtcblxuVG9waWFyaXN0VmVyaWZpZXIucHJvdG90eXBlLmNsYXNzSXNBID0gZnVuY3Rpb24odHlwZSkge1xuICBpZighdG9waWFyaXN0LmNsYXNzSXNBKHRoaXMuYXJnVmFsdWUsIHR5cGUpKSB0aHJvdyBuZXcgVHlwZUVycm9yKHRoaXMuYXJnTmFtZSArICcgYXJndW1lbnQgbXVzdCBiZSBhICcgKyB0eXBlLm5hbWUgKyAnIGNsYXNzLicpO1xufTtcblxuVG9waWFyaXN0VmVyaWZpZXIucHJvdG90eXBlLmZ1bGZpbGxzID0gZnVuY3Rpb24odHlwZSkge1xuICBpZighdG9waWFyaXN0LmZ1bGZpbGxzKHRoaXMuYXJnVmFsdWUsIHR5cGUpKSB0aHJvdyBuZXcgVHlwZUVycm9yKHRoaXMuYXJnTmFtZSArICcgYXJndW1lbnQgbXVzdCBmdWxmaWxsICcgKyB0eXBlLm5hbWUgKyAnLicpO1xufTtcblxuVG9waWFyaXN0VmVyaWZpZXIucHJvdG90eXBlLmNsYXNzRnVsZmlsbHMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmKCF0b3BpYXJpc3QuY2xhc3NGdWxmaWxscyh0aGlzLmFyZ1ZhbHVlLCB0eXBlKSkgdGhyb3cgbmV3IFR5cGVFcnJvcih0aGlzLmFyZ05hbWUgKyAnIGFyZ3VtZW50IG11c3QgZnVsZmlsbCAnICsgdHlwZS5uYW1lICsgJyBjbGFzcy4nKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVG9waWFyaXN0VmVyaWZpZXI7XG4iLCIvKipcbiAqIEBuYW1lc3BhY2VcbiAqIFRoZSB0b3BpYXJpc3QgbmFtZXNwYWNlIGNvbnRhaW5zIGEgbnVtYmVyIG9mIGZ1bmN0aW9ucyBmb3IgY3JlYXRpbmcgYW5kIHF1ZXJ5aW5nIGEgY2xhc3MgaGllcmFyY2h5LlxuICogQG5hbWUgdG9waWFyaXN0XG4gKi9cbjsoZnVuY3Rpb24oZGVmaW5pdGlvbikge1xuXHQvLyBleHBvcnQgbWVjaGFuaXNtIHRoYXQgd29ya3MgaW4gbm9kZSwgYnJvd3NlciBhbmQgc29tZSBvdGhlciBwbGFjZXMuXG5cdGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0Ly8gbm9kZSBzdHlsZSBjb21tb25KUy5cblx0XHRtb2R1bGUuZXhwb3J0cyA9IGRlZmluaXRpb24oKTtcblx0fSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0aWYgKGRlZmluZS5hbWQpIHtcblx0XHRcdGRlZmluZShkZWZpbml0aW9uKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGVmaW5lKCd0b3BpYXJpc3QnLCBkZWZpbml0aW9uKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gc2V0dGluZyBhIGdsb2JhbCwgYXMgaW4gZS5nLiBhIGJyb3dzZXIuXG5cdFx0dGhpcy50b3BpYXJpc3QgPSBkZWZpbml0aW9uKCk7XG5cdH1cbn0pKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIEVSUk9SX01FU1NBR0VTID0ge1xuXHRcdFNVQkNMQVNTX05PVF9DT05TVFJVQ1RPUjogJ1N1YmNsYXNzIHdhcyBub3QgYSBjb25zdHJ1Y3Rvci4nLFxuXHRcdFNVUEVSQ0xBU1NfTk9UX0NPTlNUUlVDVE9SOiAnU3VwZXJjbGFzcyB3YXMgbm90IGEgY29uc3RydWN0b3Igd2hlbiBleHRlbmRpbmcgezB9LicsXG5cdFx0UFJPVE9UWVBFX05PVF9DTEVBTjogJ1Byb3RvdHlwZSBtdXN0IGJlIGNsZWFuIHRvIGV4dGVuZCBhbm90aGVyIGNsYXNzLiB7MX0gaGFzIGFscmVhZHkgYmVlbiBkZWZpbmVkIG9uIHRoZSAnICtcblx0XHRcdCdwcm90b3R5cGUgb2YgezB9LicsXG5cdFx0Tk9UX0NPTlNUUlVDVE9SOiAnezB9IGRlZmluaXRpb24gZm9yIHsxfSBtdXN0IGJlIGEgY29uc3RydWN0b3IsIHdhcyB7Mn0uJyxcblx0XHRET0VTX05PVF9JTVBMRU1FTlQ6ICdDbGFzcyB7MH0gZG9lcyBub3QgaW1wbGVtZW50IHRoZSBhdHRyaWJ1dGVzIFxcJ3sxfVxcJyBmcm9tIHByb3RvY29sIHsyfS4nLFxuXHRcdFBST1BFUlRZX0FMUkVBRFlfUFJFU0VOVDogJ0NvdWxkIG5vdCBjb3B5IHswfSBmcm9tIHsxfSB0byB7Mn0gYXMgaXQgd2FzIGFscmVhZHkgcHJlc2VudC4nLFxuXHRcdE5VTEw6ICd7MH0gZm9yIHsxfSBtdXN0IG5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZC4nLFxuXHRcdEFMUkVBRFlfUFJFU0VOVDogJ0NvdWxkIG5vdCBjb3B5IHswfSBmcm9tIHsxfSB0byB7Mn0gYXMgaXQgd2FzIGFscmVhZHkgcHJlc2VudC4nLFxuXHRcdFdST05HX1RZUEU6ICd7MH0gZm9yIHsxfSBzaG91bGQgaGF2ZSBiZWVuIG9mIHR5cGUgezJ9LCB3YXMgezN9LicsXG5cdFx0VFdPX0NPTlNUUlVDVE9SUzogJ1R3byBkaWZmZXJlbnQgY29uc3RydWN0b3JzIHByb3ZpZGVkIGZvciB7MH0sIHVzZSBvbmx5IG9uZSBvZiB0aGUgY2xhc3NEZWZpbml0aW9uIGFyZ3VtZW50ICcgK1xuXHRcdFx0J2FuZCBleHRyYVByb3BlcnRpZXMuY29uc3RydWN0b3IuJyxcblx0XHRCQURfSU5TVEFMTDogJ0NhbiBvbmx5IGluc3RhbGwgdG8gdGhlIGdsb2JhbCBlbnZpcm9ubWVudCBvciBhIGNvbnN0cnVjdG9yLCBjYW5cXCd0IGluc3RhbGwgdG8gYSB7MH0uJ1xuXHR9O1xuXG5cdC8vIE1haW4gQVBJIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cdC8vIG9ubHkgdXNlZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIHNoaW1tZWQsIG5vbiBlczUgYnJvd3NlcnMuXG5cdHZhciBpbnRlcm5hbFVzZU5hbWVzID0gWydfX211bHRpcGFyZW50c19fJywgJ19faW50ZXJmYWNlc19fJywgJ19fYXNzaWduYWJsZV9mcm9tX2NhY2hlX18nLCAnX19pZF9fJ107XG5cblx0LyoqXG5cdCAqIFNldHMgdXAgdGhlIHByb3RvdHlwZSBjaGFpbiBmb3IgaW5oZXJpdGFuY2UuXG5cdCAqXG5cdCAqIDxwPkFzIHdlbGwgYXMgc2V0dGluZyB1cCB0aGUgcHJvdG90eXBlIGNoYWluLCB0aGlzIGFsc28gY29waWVzIHNvIGNhbGxlZCAnY2xhc3MnIGRlZmluaXRpb25zIGZyb20gdGhlIHN1cGVyY2xhc3Ncblx0ICogIHRvIHRoZSBzdWJjbGFzcyBhbmQgbWFrZXMgc3VyZSB0aGF0IGNvbnN0cnVjdG9yIHdpbGwgcmV0dXJuIHRoZSBjb3JyZWN0IHRoaW5nLjwvcD5cblx0ICpcblx0ICogQHRocm93cyBFcnJvciBpZiB0aGUgcHJvdG90eXBlIGhhcyBiZWVuIG1vZGlmaWVkIGJlZm9yZSBleHRlbmQgaXMgY2FsbGVkLlxuXHQgKlxuXHQgKiBAbWVtYmVyT2YgdG9waWFyaXN0XG5cdCAqIEBwYXJhbSB7P2Z1bmN0aW9ufSBjbGFzc0RlZmluaXRpb24gVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBzdWJjbGFzcy5cblx0ICogQHBhcmFtIHshZnVuY3Rpb259IHN1cGVyY2xhc3MgVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBzdXBlcmNsYXNzLlxuXHQgKiBAcGFyYW0gez9vYmplY3R9IFtleHRyYVByb3BlcnRpZXNdIEFuIG9iamVjdCBvZiBleHRyYSBwcm9wZXJ0aWVzIHRvIGFkZCB0byB0aGUgc3ViY2xhc3NlcyBwcm90b3R5cGUuXG5cdCAqL1xuXHRmdW5jdGlvbiBleHRlbmQoY2xhc3NEZWZpbml0aW9uLCBzdXBlcmNsYXNzLCBleHRyYVByb3BlcnRpZXMpIHtcblx0XHR2YXIgc3ViY2xhc3NOYW1lID0gY2xhc3NOYW1lKGNsYXNzRGVmaW5pdGlvbiwgJ1N1YmNsYXNzJyk7XG5cblx0XHQvLyBGaW5kIHRoZSByaWdodCBjbGFzc0RlZmluaXRpb24gLSBlaXRoZXIgdGhlIG9uZSBwcm92aWRlZCwgYSBuZXcgb25lIG9yIHRoZSBvbmUgZnJvbSBleHRyYVByb3BlcnRpZXMuXG5cdFx0dmFyIGV4dHJhUHJvcGVydGllc0hhc0NvbnN0cnVjdG9yID0gdHlwZW9mIGV4dHJhUHJvcGVydGllcyAhPT0gJ3VuZGVmaW5lZCcgJiZcblx0XHRcdGV4dHJhUHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eSgnY29uc3RydWN0b3InKSAmJlxuXHRcdFx0dHlwZW9mIGV4dHJhUHJvcGVydGllcy5jb25zdHJ1Y3RvciA9PT0gJ2Z1bmN0aW9uJztcblxuXHRcdGlmIChjbGFzc0RlZmluaXRpb24gIT0gbnVsbCkge1xuXHRcdFx0aWYgKGV4dHJhUHJvcGVydGllc0hhc0NvbnN0cnVjdG9yICYmIGNsYXNzRGVmaW5pdGlvbiAhPT0gZXh0cmFQcm9wZXJ0aWVzLmNvbnN0cnVjdG9yKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihtc2coRVJST1JfTUVTU0FHRVMuVFdPX0NPTlNUUlVDVE9SUywgc3ViY2xhc3NOYW1lKSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChleHRyYVByb3BlcnRpZXNIYXNDb25zdHJ1Y3Rvcikge1xuXHRcdFx0Y2xhc3NEZWZpbml0aW9uID0gZXh0cmFQcm9wZXJ0aWVzLmNvbnN0cnVjdG9yO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjbGFzc0RlZmluaXRpb24gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0c3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQvLyBjaGVjayBhcmd1bWVudHNcblx0XHRhc3NlcnRBcmd1bWVudE9mVHlwZSgnZnVuY3Rpb24nLCBjbGFzc0RlZmluaXRpb24sIEVSUk9SX01FU1NBR0VTLlNVQkNMQVNTX05PVF9DT05TVFJVQ1RPUik7XG5cdFx0YXNzZXJ0QXJndW1lbnRPZlR5cGUoJ2Z1bmN0aW9uJywgc3VwZXJjbGFzcywgRVJST1JfTUVTU0FHRVMuU1VQRVJDTEFTU19OT1RfQ09OU1RSVUNUT1IsIHN1YmNsYXNzTmFtZSk7XG5cdFx0YXNzZXJ0Tm90aGluZ0luT2JqZWN0KGNsYXNzRGVmaW5pdGlvbi5wcm90b3R5cGUsIEVSUk9SX01FU1NBR0VTLlBST1RPVFlQRV9OT1RfQ0xFQU4sIHN1YmNsYXNzTmFtZSk7XG5cblx0XHQvLyBjb3B5IGNsYXNzIHByb3BlcnRpZXNcblx0XHRmb3IgKHZhciBzdGF0aWNQcm9wZXJ0eU5hbWUgaW4gc3VwZXJjbGFzcykge1xuXHRcdFx0aWYgKHN1cGVyY2xhc3MuaGFzT3duUHJvcGVydHkoc3RhdGljUHJvcGVydHlOYW1lKSkge1xuXHRcdFx0XHQvLyB0aGlzIGlzIGJlY2F1c2Ugd2Ugc2hvdWxkbid0IGNvcHkgbm9uZW51bWVyYWJsZXMsIGJ1dCByZW1vdmluZyBlbnVtZXJhYmlsaXR5IGlzbid0IHNoaW1tYWJsZSBpbiBpZTguXG5cdFx0XHRcdC8vIFdlIG5lZWQgdG8gbWFrZSBzdXJlIHdlIGRvbid0IGluYWR2ZXJ0ZW50bHkgY29weSBhY3Jvc3MgYW55IG9mIHRoZSAnaW50ZXJuYWwnIGZpZWxkcyB3ZSBhcmUgdXNpbmcgdG9cblx0XHRcdFx0Ly8gIGtlZXAgdHJhY2sgb2YgdGhpbmdzLlxuXHRcdFx0XHRpZiAoaW50ZXJuYWxVc2VOYW1lcy5pbmRleE9mKHN0YXRpY1Byb3BlcnR5TmFtZSkgPj0gMCkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2xhc3NEZWZpbml0aW9uW3N0YXRpY1Byb3BlcnR5TmFtZV0gPSBzdXBlcmNsYXNzW3N0YXRpY1Byb3BlcnR5TmFtZV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gY3JlYXRlIHRoZSBzdXBlcmNsYXNzIHByb3BlcnR5IG9uIHRoZSBzdWJjbGFzcyBjb25zdHJ1Y3RvclxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbGFzc0RlZmluaXRpb24sICdzdXBlcmNsYXNzJywgeyBlbnVtZXJhYmxlOiBmYWxzZSwgdmFsdWU6IHN1cGVyY2xhc3MgfSk7XG5cblx0XHQvLyBjcmVhdGUgdGhlIHByb3RvdHlwZSB3aXRoIGEgY29uc3RydWN0b3IgZnVuY3Rpb24uXG5cdFx0Y2xhc3NEZWZpbml0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJjbGFzcy5wcm90b3R5cGUsIHtcblx0XHRcdFwiY29uc3RydWN0b3JcIjogeyBlbnVtZXJhYmxlOiBmYWxzZSxcdHZhbHVlOiBjbGFzc0RlZmluaXRpb24gfVxuXHRcdH0pO1xuXG5cdFx0Ly8gY29weSBldmVyeXRoaW5nIGZyb20gZXh0cmEgcHJvcGVydGllcy5cblx0XHRpZiAoZXh0cmFQcm9wZXJ0aWVzICE9IG51bGwpIHtcblx0XHRcdGZvciAodmFyIHByb3BlcnR5IGluIGV4dHJhUHJvcGVydGllcykge1xuXHRcdFx0XHRpZiAoZXh0cmFQcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSAmJiBwcm9wZXJ0eSAhPT0gJ2NvbnN0cnVjdG9yJykge1xuXHRcdFx0XHRcdGNsYXNzRGVmaW5pdGlvbi5wcm90b3R5cGVbcHJvcGVydHldID0gZXh0cmFQcm9wZXJ0aWVzW3Byb3BlcnR5XTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIHRoaXMgaXMgcHVyZWx5IHRvIHdvcmsgYXJvdW5kIGEgYmFkIGllOCBzaGltLCB3aGVuIGllOCBpcyBubyBsb25nZXIgbmVlZGVkIGl0IGNhbiBiZSBkZWxldGVkLlxuXHRcdGlmIChjbGFzc0RlZmluaXRpb24ucHJvdG90eXBlLmhhc093blByb3BlcnR5KCdfX3Byb3RvX18nKSkge1xuXHRcdFx0ZGVsZXRlIGNsYXNzRGVmaW5pdGlvbi5wcm90b3R5cGVbJ19fcHJvdG9fXyddO1xuXHRcdH1cblxuXHRcdGNsZWFyQXNzaWduYWJsZUNhY2hlKGNsYXNzRGVmaW5pdGlvbiwgc3VwZXJjbGFzcyk7XG5cblx0XHRyZXR1cm4gY2xhc3NEZWZpbml0aW9uO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1peGVzIGZ1bmN0aW9uYWxpdHkgaW4gdG8gYSBjbGFzcy5cblx0ICpcblx0ICogPHA+T25seSBmdW5jdGlvbnMgYXJlIG1peGVkIGluLjwvcD5cblx0ICpcblx0ICogPHA+Q29kZSBpbiB0aGUgbWl4aW4gaXMgc2FuZGJveGVkIGFuZCBvbmx5IGhhcyBhY2Nlc3MgdG8gYSAnbWl4aW4gaW5zdGFuY2UnIHJhdGhlciB0aGFuIHRoZSByZWFsIGluc3RhbmNlLjwvcD5cblx0ICpcblx0ICogQG1lbWJlck9mIHRvcGlhcmlzdFxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSB0YXJnZXRcblx0ICogQHBhcmFtIHtmdW5jdGlvbnxPYmplY3R9IG1peFxuXHQgKi9cblx0ZnVuY3Rpb24gbWl4aW4odGFyZ2V0LCBtaXgpIHtcblx0XHRhc3NlcnRBcmd1bWVudE9mVHlwZSgnZnVuY3Rpb24nLCB0YXJnZXQsIEVSUk9SX01FU1NBR0VTLk5PVF9DT05TVFJVQ1RPUiwgJ1RhcmdldCcsICdtaXhpbicpO1xuXG5cdFx0bWl4ID0gdG9GdW5jdGlvbihcblx0XHRcdG1peCxcblx0XHRcdG5ldyBUeXBlRXJyb3IoXG5cdFx0XHRcdG1zZyhcblx0XHRcdFx0XHRFUlJPUl9NRVNTQUdFUy5XUk9OR19UWVBFLFxuXHRcdFx0XHRcdCdNaXgnLFxuXHRcdFx0XHRcdCdtaXhpbicsXG5cdFx0XHRcdFx0J25vbi1udWxsIG9iamVjdCBvciBmdW5jdGlvbicsXG5cdFx0XHRcdFx0bWl4ID09PSBudWxsID8gJ251bGwnIDogdHlwZW9mIG1peFxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KTtcblxuXHRcdHZhciB0YXJnZXRQcm90b3R5cGUgPSB0YXJnZXQucHJvdG90eXBlLCBtaXhpblByb3BlcnRpZXMgPSBtaXgucHJvdG90eXBlLCByZXN1bHRpbmdQcm9wZXJ0aWVzID0ge307XG5cdFx0dmFyIG1peGlucyA9IG5vbmVudW0odGFyZ2V0LCAnX19tdWx0aXBhcmVudHNfXycsIFtdKTtcblx0XHR2YXIgbXlNaXhJZCA9IG1peGlucy5sZW5ndGg7XG5cblx0XHRmb3IgKHZhciBwcm9wZXJ0eSBpbiBtaXhpblByb3BlcnRpZXMpIHtcblx0XHRcdC8vIHByb3BlcnR5IG1pZ2h0IHNwdXJpb3VzbHkgYmUgJ2NvbnN0cnVjdG9yJyBpZiB5b3UgYXJlIGluIGllOCBhbmQgdXNpbmcgYSBzaGltLlxuXHRcdFx0aWYgKHR5cGVvZiBtaXhpblByb3BlcnRpZXNbcHJvcGVydHldID09PSAnZnVuY3Rpb24nICYmIHByb3BlcnR5ICE9PSAnY29uc3RydWN0b3InKSB7XG5cdFx0XHRcdGlmIChwcm9wZXJ0eSBpbiB0YXJnZXRQcm90b3R5cGUgPT09IGZhbHNlKSB7XG5cdFx0XHRcdFx0cmVzdWx0aW5nUHJvcGVydGllc1twcm9wZXJ0eV0gPSBnZXRTYW5kYm94ZWRGdW5jdGlvbihteU1peElkLCBtaXgsIG1peGluUHJvcGVydGllc1twcm9wZXJ0eV0pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHRhcmdldFByb3RvdHlwZVtwcm9wZXJ0eV0uX19vcmlnaW5hbF9fICE9PSBtaXhpblByb3BlcnRpZXNbcHJvcGVydHldKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdFx0bXNnKFxuXHRcdFx0XHRcdFx0XHRFUlJPUl9NRVNTQUdFUy5QUk9QRVJUWV9BTFJFQURZX1BSRVNFTlQsXG5cdFx0XHRcdFx0XHRcdHByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XHRjbGFzc05hbWUobWl4LCAnbWl4aW4nKSxcblx0XHRcdFx0XHRcdFx0Y2xhc3NOYW1lKHRhcmdldCwgJ3RhcmdldCcpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSAvLyB3ZSBvbmx5IG1peGluIGZ1bmN0aW9uc1xuXHRcdH1cblxuXHRcdGNvcHkocmVzdWx0aW5nUHJvcGVydGllcywgdGFyZ2V0UHJvdG90eXBlKTtcblx0XHRtaXhpbnMucHVzaChtaXgpO1xuXG5cdFx0Y2xlYXJBc3NpZ25hYmxlQ2FjaGUodGFyZ2V0LCBtaXgpO1xuXG5cdFx0cmV0dXJuIHRhcmdldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBQcm92aWRlcyBtdWx0aXBsZSBpbmhlcml0YW5jZSB0aHJvdWdoIGNvcHlpbmcuXG5cdCAqXG5cdCAqIDxwPlRoaXMgaXMgZGlzY291cmFnZWQ7IHlvdSBzaG91bGQgcHJlZmVyIHRvIHVzZSBhZ2dyZWdhdGlvbiBmaXJzdCwgc2luZ2xlIGluaGVyaXRhbmNlIChleHRlbmRzKSBzZWNvbmQsIG1peGluc1xuXHQgKiAgdGhpcmQgYW5kIHRoaXMgYXMgYSBsYXN0IHJlc29ydC48L3A+XG5cdCAqXG5cdCAqIEBtZW1iZXJPZiB0b3BpYXJpc3Rcblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gdGFyZ2V0IHRoZSBjbGFzcyB0aGF0IHNob3VsZCByZWNlaXZlIHRoZSBmdW5jdGlvbmFsaXR5LlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufE9iamVjdH0gcGFyZW50IHRoZSBwYXJlbnQgdGhhdCBwcm92aWRlcyB0aGUgZnVuY3Rpb25hbGl0eS5cblx0ICovXG5cdGZ1bmN0aW9uIGluaGVyaXQodGFyZ2V0LCBwYXJlbnQpIHtcblx0XHRhc3NlcnRBcmd1bWVudE9mVHlwZSgnZnVuY3Rpb24nLCB0YXJnZXQsIEVSUk9SX01FU1NBR0VTLk5PVF9DT05TVFJVQ1RPUiwgJ1RhcmdldCcsICdpbmhlcml0Jyk7XG5cdFx0cGFyZW50ID0gdG9GdW5jdGlvbihcblx0XHRcdHBhcmVudCxcblx0XHRcdG5ldyBUeXBlRXJyb3IoXG5cdFx0XHRcdG1zZyhcblx0XHRcdFx0XHRFUlJPUl9NRVNTQUdFUy5XUk9OR19UWVBFLFxuXHRcdFx0XHRcdCdQYXJlbnQnLFxuXHRcdFx0XHRcdCdpbmhlcml0Jyxcblx0XHRcdFx0XHQnbm9uLW51bGwgb2JqZWN0IG9yIGZ1bmN0aW9uJyxcblx0XHRcdFx0XHRwYXJlbnQgPT09IG51bGwgPyAnbnVsbCcgOiB0eXBlb2YgcGFyZW50XG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpO1xuXG5cdFx0aWYgKGNsYXNzSXNBKHRhcmdldCwgcGFyZW50KSkge1xuXHRcdFx0cmV0dXJuIHRhcmdldDtcblx0XHR9XG5cblx0XHR2YXIgcmVzdWx0aW5nUHJvcGVydGllcyA9IHt9O1xuXHRcdHZhciB0YXJnZXRQcm90b3R5cGUgPSB0YXJnZXQucHJvdG90eXBlO1xuXHRcdGZvciAodmFyIHByb3BlcnR5TmFtZSBpbiBwYXJlbnQucHJvdG90eXBlKSB7XG5cdFx0XHQvLyBUaGVzZSBwcm9wZXJ0aWVzIHNob3VsZCBiZSBub25lbnVtZXJhYmxlIGluIG1vZGVybiBicm93c2VycywgYnV0IHNoaW1zIG1pZ2h0IGNyZWF0ZSB0aGVtIGluIGllOC5cblx0XHRcdGlmIChwcm9wZXJ0eU5hbWUgPT09ICdjb25zdHJ1Y3RvcicgfHwgcHJvcGVydHlOYW1lID09PSAnX19wcm90b19fJykge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIG5vdEluVGFyZ2V0ID0gdGFyZ2V0UHJvdG90eXBlW3Byb3BlcnR5TmFtZV0gPT09IHVuZGVmaW5lZDtcblx0XHRcdHZhciBwYXJlbnRIYXNOZXdlckltcGxlbWVudGF0aW9uID0gbm90SW5UYXJnZXQgfHwgaXNPdmVycmlkZXJPZihwcm9wZXJ0eU5hbWUsIHBhcmVudCwgdGFyZ2V0KTtcblx0XHRcdGlmIChwYXJlbnRIYXNOZXdlckltcGxlbWVudGF0aW9uKSB7XG5cdFx0XHRcdHJlc3VsdGluZ1Byb3BlcnRpZXNbcHJvcGVydHlOYW1lXSA9IHBhcmVudC5wcm90b3R5cGVbcHJvcGVydHlOYW1lXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBhcmVUaGVTYW1lID0gdGFyZ2V0UHJvdG90eXBlW3Byb3BlcnR5TmFtZV0gPT09IHBhcmVudC5wcm90b3R5cGVbcHJvcGVydHlOYW1lXTtcblx0XHRcdFx0dmFyIHRhcmdldElzVXBUb0RhdGUgPSBhcmVUaGVTYW1lIHx8IGlzT3ZlcnJpZGVyT2YocHJvcGVydHlOYW1lLCB0YXJnZXQsIHBhcmVudCk7XG5cdFx0XHRcdGlmICh0YXJnZXRJc1VwVG9EYXRlID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdC8vIHRhcmdldCBpcyBub3QgdXAgdG8gZGF0ZSwgYnV0IHdlIGNhbid0IGJyaW5nIGl0IHVwIHRvIGRhdGUuXG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdFx0bXNnKFxuXHRcdFx0XHRcdFx0XHRFUlJPUl9NRVNTQUdFUy5BTFJFQURZX1BSRVNFTlQsXG5cdFx0XHRcdFx0XHRcdHByb3BlcnR5TmFtZSxcblx0XHRcdFx0XHRcdFx0Y2xhc3NOYW1lKHBhcmVudCwgJ3BhcmVudCcpLFxuXHRcdFx0XHRcdFx0XHRjbGFzc05hbWUodGFyZ2V0LCAndGFyZ2V0Jylcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIG90aGVyd2lzZSB3ZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nLlxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvcHkocmVzdWx0aW5nUHJvcGVydGllcywgdGFyZ2V0UHJvdG90eXBlKTtcblx0XHR2YXIgbXVsdGlwYXJlbnRzID0gbm9uZW51bSh0YXJnZXQsICdfX211bHRpcGFyZW50c19fJywgW10pO1xuXHRcdG11bHRpcGFyZW50cy5wdXNoKHBhcmVudCk7XG5cblx0XHRjbGVhckFzc2lnbmFibGVDYWNoZSh0YXJnZXQsIHBhcmVudCk7XG5cblx0XHRyZXR1cm4gdGFyZ2V0O1xuXHR9XG5cblx0LyoqXG5cdCAqIERlY2xhcmVzIHRoYXQgdGhlIHByb3ZpZGVkIGNsYXNzIHdpbGwgaW1wbGVtZW50IHRoZSBwcm92aWRlZCBwcm90b2NvbC5cblx0ICpcblx0ICogPHA+VGhpcyBpbnZvbHZlcyBpbW1lZGlhdGVseSB1cGRhdGluZyBhbiBpbnRlcm5hbCBsaXN0IG9mIGludGVyZmFjZXMgYXR0YWNoZWQgdG8gdGhlIGNsYXNzIGRlZmluaXRpb24sXG5cdCAqIGFuZCBhZnRlciBhIDxjb2RlPnNldFRpbWVvdXQoMCk8L2NvZGU+IHZlcmlmeWluZyB0aGF0IGl0IGRvZXMgaW4gZmFjdCBpbXBsZW1lbnQgdGhlIHByb3RvY29sLjwvcD5cblx0ICpcblx0ICogPHA+SXQgY2FuIGJlIGNhbGxlZCBiZWZvcmUgdGhlIGltcGxlbWVudGF0aW9ucyBhcmUgcHJvdmlkZWQsIGkuZS4gaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGNvbnN0cnVjdG9yLjwvcD5cblx0ICpcblx0ICogQHRocm93cyBFcnJvciBpZiB0aGVyZSBhcmUgYW55IGF0dHJpYnV0ZXMgb24gdGhlIHByb3RvY29sIHRoYXQgYXJlIG5vdCBtYXRjaGVkIG9uIHRoZSBjbGFzcyBkZWZpbml0aW9uLlxuXHQgKlxuXHQgKiBAbWVtYmVyT2YgdG9waWFyaXN0XG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IGNsYXNzRGVmaW5pdGlvbiBBIGNvbnN0cnVjdG9yIHRoYXQgc2hvdWxkIGNyZWF0ZSBvYmplY3RzIG1hdGNoaW5nIHRoZSBwcm90b2NvbC5cblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gcHJvdG9jb2wgQSBjb25zdHJ1Y3RvciByZXByZXNlbnRpbmcgYW4gaW50ZXJmYWNlIHRoYXQgdGhlIGNsYXNzIHNob3VsZCBpbXBsZW1lbnQuXG5cdCAqL1xuXHRmdW5jdGlvbiBpbXBsZW1lbnQoY2xhc3NEZWZpbml0aW9uLCBwcm90b2NvbCkge1xuXHRcdGRvSW1wbGVtZW50KGNsYXNzRGVmaW5pdGlvbiwgcHJvdG9jb2wpO1xuXG5cdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdGFzc2VydEhhc0ltcGxlbWVudGVkKGNsYXNzRGVmaW5pdGlvbiwgcHJvdG9jb2wpO1xuXHRcdH0sIDApO1xuXG5cdFx0cmV0dXJuIGNsYXNzRGVmaW5pdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWNsYXJlcyB0aGF0IHRoZSBwcm92aWRlZCBjbGFzcyBpbXBsZW1lbnRzIHRoZSBwcm92aWRlZCBwcm90b2NvbC5cblx0ICpcblx0ICogPHA+VGhpcyBpbnZvbHZlcyBjaGVja2luZyB0aGF0IGl0IGRvZXMgaW4gZmFjdCBpbXBsZW1lbnQgdGhlIHByb3RvY29sIGFuZCB1cGRhdGluZyBhbiBpbnRlcm5hbCBsaXN0IG9mXG5cdCAqICBpbnRlcmZhY2VzIGF0dGFjaGVkIHRvIHRoZSBjbGFzcyBkZWZpbml0aW9uLjwvcD5cblx0ICpcblx0ICogPHA+SXQgc2hvdWxkIGJlIGNhbGxlZCBhZnRlciBpbXBsZW1lbnRhdGlvbnMgYXJlIHByb3ZpZGVkLCBpLmUuIGF0IHRoZSBlbmQgb2YgdGhlIGNsYXNzIGRlZmluaXRpb24uPC9wPlxuXHQgKlxuXHQgKiBAdGhyb3dzIEVycm9yIGlmIHRoZXJlIGFyZSBhbnkgYXR0cmlidXRlcyBvbiB0aGUgcHJvdG9jb2wgdGhhdCBhcmUgbm90IG1hdGNoZWQgb24gdGhlIGNsYXNzIGRlZmluaXRpb24uXG5cdCAqXG5cdCAqIEBtZW1iZXJPZiB0b3BpYXJpc3Rcblx0ICogQHBhcmFtIHtmdW5jdGlvbn0gY2xhc3NEZWZpbml0aW9uIEEgY29uc3RydWN0b3IgdGhhdCBzaG91bGQgY3JlYXRlIG9iamVjdHMgbWF0Y2hpbmcgdGhlIHByb3RvY29sLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwcm90b2NvbCBBIGNvbnN0cnVjdG9yIHJlcHJlc2VudGluZyBhbiBpbnRlcmZhY2UgdGhhdCB0aGUgY2xhc3Mgc2hvdWxkIGltcGxlbWVudC5cblx0ICovXG5cdGZ1bmN0aW9uIGhhc0ltcGxlbWVudGVkKGNsYXNzRGVmaW5pdGlvbiwgcHJvdG9jb2wpIHtcblx0XHRkb0ltcGxlbWVudChjbGFzc0RlZmluaXRpb24sIHByb3RvY29sKTtcblx0XHRhc3NlcnRIYXNJbXBsZW1lbnRlZChjbGFzc0RlZmluaXRpb24sIHByb3RvY29sKTtcblxuXHRcdHJldHVybiBjbGFzc0RlZmluaXRpb247XG5cdH1cblxuXHQvKiogQHByaXZhdGUgKi9cblx0ZnVuY3Rpb24gZG9JbXBsZW1lbnQoY2xhc3NEZWZpbml0aW9uLCBwcm90b2NvbCkge1xuXHRcdGFzc2VydEFyZ3VtZW50T2ZUeXBlKCdmdW5jdGlvbicsIGNsYXNzRGVmaW5pdGlvbiwgRVJST1JfTUVTU0FHRVMuTk9UX0NPTlNUUlVDVE9SLCAnQ2xhc3MnLCAnaGFzSW1wbGVtZW50ZWQnKTtcblx0XHRhc3NlcnRBcmd1bWVudE9mVHlwZSgnZnVuY3Rpb24nLCBwcm90b2NvbCwgRVJST1JfTUVTU0FHRVMuTk9UX0NPTlNUUlVDVE9SLCAnUHJvdG9jb2wnLCAnaGFzSW1wbGVtZW50ZWQnKTtcblxuXHRcdHZhciBpbnRlcmZhY2VzID0gbm9uZW51bShjbGFzc0RlZmluaXRpb24sICdfX2ludGVyZmFjZXNfXycsIFtdKTtcblx0XHRpbnRlcmZhY2VzLnB1c2gocHJvdG9jb2wpO1xuXG5cdFx0Y2xlYXJBc3NpZ25hYmxlQ2FjaGUoY2xhc3NEZWZpbml0aW9uLCBwcm90b2NvbCk7XG5cblx0XHRyZXR1cm4gY2xhc3NEZWZpbml0aW9uO1xuXHR9XG5cblx0ZnVuY3Rpb24gYXNzZXJ0SGFzSW1wbGVtZW50ZWQoY2xhc3NEZWZpbml0aW9uLCBwcm90b2NvbCkge1xuXHRcdHZhciBtaXNzaW5nID0gbWlzc2luZ0F0dHJpYnV0ZXMoY2xhc3NEZWZpbml0aW9uLCBwcm90b2NvbCk7XG5cdFx0aWYgKG1pc3NpbmcubGVuZ3RoID4gMCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRtc2coXG5cdFx0XHRcdFx0RVJST1JfTUVTU0FHRVMuRE9FU19OT1RfSU1QTEVNRU5ULFxuXHRcdFx0XHRcdGNsYXNzTmFtZShjbGFzc0RlZmluaXRpb24sICdwcm92aWRlZCcpLFxuXHRcdFx0XHRcdG1pc3Npbmcuam9pbignXFwnLCBcXCcnKSxcblx0XHRcdFx0XHRjbGFzc05hbWUocHJvdG9jb2wsICdwcm92aWRlZCcpXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gZmFsbGJhY2tJc0Fzc2lnbmFibGVGcm9tKGNsYXNzRGVmaW5pdGlvbiwgcGFyZW50KSB7XG5cdFx0aWYgKGNsYXNzRGVmaW5pdGlvbiA9PT0gcGFyZW50IHx8IGNsYXNzRGVmaW5pdGlvbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBwYXJlbnQpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHR2YXIgaSwgbWl4aW5zID0gY2xhc3NEZWZpbml0aW9uLl9fbXVsdGlwYXJlbnRzX18gfHwgW10sIGludGVyZmFjZXMgPSBjbGFzc0RlZmluaXRpb24uX19pbnRlcmZhY2VzX18gfHwgW107XG5cblx0XHQvLyBwYXJlbnRcblx0XHR2YXIgc3VwZXJQcm90b3R5cGUgPSAoY2xhc3NEZWZpbml0aW9uLnN1cGVyY2xhc3MgJiYgY2xhc3NEZWZpbml0aW9uLnN1cGVyY2xhc3MucHJvdG90eXBlKSB8fFxuXHRcdFx0Z2V0UHJvdG90eXBlT2YoY2xhc3NEZWZpbml0aW9uLnByb3RvdHlwZSk7XG5cblx0XHRpZiAoXG5cdFx0XHRzdXBlclByb3RvdHlwZSAhPSBudWxsICYmXG5cdFx0XHRzdXBlclByb3RvdHlwZSAhPT0gY2xhc3NEZWZpbml0aW9uLnByb3RvdHlwZSAmJlxuXHRcdFx0Y2xhc3NJc0Eoc3VwZXJQcm90b3R5cGUuY29uc3RydWN0b3IsIHBhcmVudClcblx0XHQpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIG1peGluIGNoYWluXG5cdFx0Zm9yIChpID0gMDsgaSA8IG1peGlucy5sZW5ndGg7ICsraSkge1xuXHRcdFx0aWYgKGNsYXNzSXNBKG1peGluc1tpXSwgcGFyZW50KSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBpbnRlcmZhY2VzIGNoYWluXG5cdFx0Zm9yIChpID0gMDsgaSA8IGludGVyZmFjZXMubGVuZ3RoOyArK2kpIHtcblx0XHRcdGlmIChjbGFzc0lzQShpbnRlcmZhY2VzW2ldLCBwYXJlbnQpKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgdG8gc2VlIGlmIGEgY2xhc3MgaXMgYSBkZXNjZW5kYW50IG9mIGFub3RoZXIgY2xhc3MgLyBpbnRlcmZhY2UgLyBtaXhpbi5cblx0ICpcblx0ICogPHVsPjxsaT5BIGNsYXNzIGlzIGEgZGVzY2VuZGFudCBvZiBhbm90aGVyIGNsYXNzIGlmIHRoZSBvdGhlciBjbGFzcyBpcyBpbiBpdHMgcHJvdG90eXBlIGNoYWluLlxuXHQgKiA8L2xpPjxsaT5BIGNsYXNzIGlzIGEgZGVzY2VuZGFudCBvZiBhbiBpbnRlcmZhY2UgaWYgaXQgaGFzIGNhbGxlZCBpbXBsZW1lbnQgdGhhdCBjbGFzcyBvclxuXHQgKiBhbnkgY2xhc3MgdGhhdCB0aGlzIGNsYXNzIGlzIGEgZGVzY2VuZGFudCBvZiBoYXMgY2FsbGVkIGltcGxlbWVudCBmb3IgdGhhdCBjbGFzcy5cblx0ICogPC9saT48bGk+QSBjbGFzcyBpcyBhIGRlc2NlbmRhbnQgb2YgYSBtaXhpbiBpZiBpdCBoYXMgY2FsbGVkIG1peGluIGZvciB0aGF0IG1peGluIG9yXG5cdCAqIGFueSBjbGFzcyB0aGF0IHRoaXMgY2xhc3MgaXMgYSBkZXNjZW5kYW50IG9mIGhhcyBjYWxsZWQgbWl4aW4gZm9yIHRoYXQgbWl4aW4uXG5cdCAqIDwvbGk+PC91bD5cblx0ICpcblx0ICogQG1lbWJlck9mIHRvcGlhcmlzdFxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjbGFzc0RlZmluaXRpb24gdGhlIGNoaWxkIGNsYXNzLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjb25zdHJ1Y3RvciB0aGUgY2xhc3MgdG8gY2hlY2sgaWYgdGhpcyBjbGFzcyBpcyBhIGRlc2NlbmRhbnQgb2YuXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBjbGFzcyBpcyBhIGRlc2NlbmRhbnQsIGZhbHNlIG90aGVyd2lzZS5cblx0ICovXG5cdGZ1bmN0aW9uIGNsYXNzSXNBKGNsYXNzRGVmaW5pdGlvbiwgY29uc3RydWN0b3IpIHtcblx0XHQvLyBzbmVha3kgZWRnZSBjYXNlIHdoZXJlIHdlJ3JlIGNoZWNraW5nIGFnYWluc3QgYW4gb2JqZWN0IGxpdGVyYWwgd2UndmUgbWl4ZWQgaW4gb3IgYWdhaW5zdCBhIHByb3RvdHlwZSBvZlxuXHRcdC8vICBzb21ldGhpbmcuXG5cdFx0aWYgKHR5cGVvZiBjb25zdHJ1Y3RvciA9PT0gJ29iamVjdCcgJiYgY29uc3RydWN0b3IuaGFzT3duUHJvcGVydHkoJ2NvbnN0cnVjdG9yJykpIHtcblx0XHRcdGNvbnN0cnVjdG9yID0gY29uc3RydWN0b3IuY29uc3RydWN0b3I7XG5cdFx0fVxuXG5cdFx0YXNzZXJ0QXJndW1lbnRPZlR5cGUoJ2Z1bmN0aW9uJywgY2xhc3NEZWZpbml0aW9uLCBFUlJPUl9NRVNTQUdFUy5OT1RfQ09OU1RSVUNUT1IsICdDbGFzcycsICdjbGFzc0lzQScpO1xuXHRcdGFzc2VydEFyZ3VtZW50T2ZUeXBlKCdmdW5jdGlvbicsIGNvbnN0cnVjdG9yLCBFUlJPUl9NRVNTQUdFUy5OT1RfQ09OU1RSVUNUT1IsICdQYXJlbnQnLCAnY2xhc3NJc0EnKTtcblxuXHRcdC8vIFRoaXMgaXMganVzdCBhIGNhY2hpbmcgd3JhcHBlciBhcm91bmQgZmFsbGJhY2tJc0Fzc2lnbmFibGVGcm9tLlxuXHRcdHZhciBjYWNoZSA9IG5vbmVudW0oY2xhc3NEZWZpbml0aW9uLCAnX19hc3NpZ25hYmxlX2Zyb21fY2FjaGVfXycsIHt9KTtcblx0XHR2YXIgcGFyZW50SWQgPSBjbGFzc0lkKGNvbnN0cnVjdG9yKTtcblx0XHRpZiAoY2FjaGVbcGFyZW50SWRdID09IG51bGwpIHtcblx0XHRcdGNhY2hlW3BhcmVudElkXSA9IGZhbGxiYWNrSXNBc3NpZ25hYmxlRnJvbShjbGFzc0RlZmluaXRpb24sIGNvbnN0cnVjdG9yKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY2FjaGVbcGFyZW50SWRdO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyB0byBzZWUgaWYgYW4gaW5zdGFuY2UgaXMgZGVmaW5lZCB0byBiZSBhIGNoaWxkIG9mIGEgcGFyZW50LlxuXHQgKlxuXHQgKiBAbWVtYmVyT2YgdG9waWFyaXN0XG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZSBBbiBpbnN0YW5jZSBvYmplY3QgdG8gY2hlY2suXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb259IHBhcmVudCBBIHBvdGVudGlhbCBwYXJlbnQgKHNlZSBjbGFzc0lzQSkuXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoaXMgaW5zdGFuY2UgaGFzIGJlZW4gY29uc3RydWN0ZWQgZnJvbSBzb21ldGhpbmcgdGhhdCBpcyBhc3NpZ25hYmxlIGZyb20gdGhlIHBhcmVudFxuXHQgKiAgb3IgaXMgbnVsbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuXHQgKi9cblx0ZnVuY3Rpb24gaXNBKGluc3RhbmNlLCBwYXJlbnQpIHtcblx0XHRpZihpbnN0YW5jZSA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gc25lYWt5IGVkZ2UgY2FzZSB3aGVyZSB3ZSdyZSBjaGVja2luZyBhZ2FpbnN0IGFuIG9iamVjdCBsaXRlcmFsIHdlJ3ZlIG1peGVkIGluIG9yIGFnYWluc3QgYSBwcm90b3R5cGUgb2Zcblx0XHQvLyAgc29tZXRoaW5nLlxuXHRcdGlmICh0eXBlb2YgcGFyZW50ID09PSAnb2JqZWN0JyAmJiBwYXJlbnQuaGFzT3duUHJvcGVydHkoJ2NvbnN0cnVjdG9yJykpIHtcblx0XHRcdHBhcmVudCA9IHBhcmVudC5jb25zdHJ1Y3Rvcjtcblx0XHR9XG5cblx0XHRpZigoaW5zdGFuY2UuY29uc3RydWN0b3IgPT09IHBhcmVudCkgfHwgKGluc3RhbmNlIGluc3RhbmNlb2YgcGFyZW50KSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNsYXNzSXNBKGluc3RhbmNlLmNvbnN0cnVjdG9yLCBwYXJlbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIERvZXMgZHVjayB0eXBpbmcgdG8gZGV0ZXJtaW5lIGlmIGFuIGluc3RhbmNlIG9iamVjdCBpbXBsZW1lbnRzIGEgcHJvdG9jb2wuXG5cdCAqIDxwPlRoZSBwcm90b2NvbCBtYXkgYmUgZWl0aGVyIGFuIGFkaG9jIHByb3RvY29sLCBpbiB3aGljaCBjYXNlIGl0IGlzIGFuIG9iamVjdCBvciBpdCBjYW4gYmUgYSBmb3JtYWwgcHJvdG9jb2wgaW5cblx0ICogIHdoaWNoIGNhc2UgaXQncyBhIGZ1bmN0aW9uLjwvcD5cblx0ICpcblx0ICogPHA+SW4gYW4gYWRob2MgcHJvdG9jb2wsIHlvdSBjYW4gdXNlIE51bWJlciwgT2JqZWN0LCBTdHJpbmcgYW5kIEJvb2xlYW4gdG8gaW5kaWNhdGUgdGhlIHR5cGUgcmVxdWlyZWQgb24gdGhlXG5cdCAqICBpbnN0YW5jZS48L3A+XG5cdCAqXG5cdCAqIEBtZW1iZXJPZiB0b3BpYXJpc3Rcblx0ICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlIHRoZSBvYmplY3QgdG8gY2hlY2suXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb258T2JqZWN0fSBwcm90b2NvbCB0aGUgZGVzY3JpcHRpb24gb2YgdGhlIHByb3BlcnRpZXMgdGhhdCB0aGUgb2JqZWN0IHNob3VsZCBoYXZlLlxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBhbGwgdGhlIHByb3BlcnRpZXMgb24gdGhlIHByb3RvY29sIHdlcmUgb24gdGhlIGluc3RhbmNlIGFuZCBvZiB0aGUgcmlnaHQgdHlwZS5cblx0ICovXG5cdGZ1bmN0aW9uIGZ1bGZpbGxzKGluc3RhbmNlLCBwcm90b2NvbCkge1xuXHRcdGFzc2VydEFyZ3VtZW50Tm90TnVsbE9yVW5kZWZpbmVkKGluc3RhbmNlLCBFUlJPUl9NRVNTQUdFUy5OVUxMLCAnT2JqZWN0JywgJ2Z1bGZpbGxzJyk7XG5cdFx0YXNzZXJ0QXJndW1lbnROb3ROdWxsT3JVbmRlZmluZWQocHJvdG9jb2wsIEVSUk9SX01FU1NBR0VTLk5VTEwsICdQcm90b2NvbCcsICdmdWxmaWxscycpO1xuXG5cdFx0Ly8gY29uc29sZS5sb2coICdpbnN0YW5jZScsIGluc3RhbmNlICk7XG5cblx0XHR2YXIgcHJvdG9jb2xJc0NvbnN0cnVjdG9yID0gdHlwZW9mIHByb3RvY29sID09PSAnZnVuY3Rpb24nO1xuXHRcdC8vIGNvbnNvbGUubG9nKCAncHJvdG9jb2xJc0NvbnN0cnVjdG9yJywgcHJvdG9jb2xJc0NvbnN0cnVjdG9yICk7XG5cdFx0aWYgKHByb3RvY29sSXNDb25zdHJ1Y3RvciAmJiBpc0EoaW5zdGFuY2UsIHByb3RvY29sKSkge1xuXHRcdFx0Ly8gY29uc29sZS5sb2coICdpc0EoaW5zdGFuY2UsIHByb3RvY29sKScsIGlzQShpbnN0YW5jZSwgcHJvdG9jb2wpICk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHR2YXIgcmVxdWlyZW1lbnQgPSBwcm90b2NvbElzQ29uc3RydWN0b3IgPyBwcm90b2NvbC5wcm90b3R5cGUgOiBwcm90b2NvbDtcblxuXHRcdC8vIGNvbnNvbGUubG9nKCAncmVxdWlyZW1lbnQnLCByZXF1aXJlbWVudCApO1xuXG5cdFx0Zm9yICh2YXIgaXRlbSBpbiByZXF1aXJlbWVudCkge1xuXHRcdFx0dmFyIHR5cGUgPSB0eXBlb2YgaW5zdGFuY2VbaXRlbV07XG5cdFx0XHR2YXIgcmVxdWlyZWQgPSByZXF1aXJlbWVudFtpdGVtXTtcblxuXHRcdFx0Ly8gY29uc29sZS5sb2coICd0eXBlJywgdHlwZSApO1xuXHRcdFx0Ly8gY29uc29sZS5sb2coICdyZXF1aXJlZCcsIHJlcXVpcmVkICk7XG5cblx0XHRcdGlmIChyZXF1aXJlZCA9PT0gTnVtYmVyKSB7XG5cdFx0XHRcdGlmICh0eXBlICE9PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChyZXF1aXJlZCA9PT0gT2JqZWN0KSB7XG5cdFx0XHRcdGlmICh0eXBlICE9PSAnb2JqZWN0Jykge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChyZXF1aXJlZCA9PT0gU3RyaW5nKSB7XG5cdFx0XHRcdGlmICh0eXBlICE9PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChyZXF1aXJlZCA9PT0gQm9vbGVhbikge1xuXHRcdFx0XHRpZiAodHlwZSAhPT0gJ2Jvb2xlYW4nKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAodHlwZSAhPT0gdHlwZW9mIHJlcXVpcmVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gY29uc29sZS5sb2coICdyZXR1cm5pbmcgdHJ1ZScgKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgdGhhdCBhIGNsYXNzIHByb3ZpZGVzIGEgcHJvdG90eXBlIHRoYXQgd2lsbCBmdWxmaWwgYSBwcm90b2NvbC5cblx0ICpcblx0ICogQG1lbWJlck9mIHRvcGlhcmlzdFxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjbGFzc0RlZmluaXRpb25cblx0ICogQHBhcmFtIHtmdW5jdGlvbnxPYmplY3R9IHByb3RvY29sXG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0ZnVuY3Rpb24gY2xhc3NGdWxmaWxscyhjbGFzc0RlZmluaXRpb24sIHByb3RvY29sKSB7XG5cdFx0YXNzZXJ0QXJndW1lbnROb3ROdWxsT3JVbmRlZmluZWQoY2xhc3NEZWZpbml0aW9uLCBFUlJPUl9NRVNTQUdFUy5OVUxMLCAnQ2xhc3MnLCAnY2xhc3NGdWxmaWxscycpO1xuXHRcdGFzc2VydEFyZ3VtZW50Tm90TnVsbE9yVW5kZWZpbmVkKHByb3RvY29sLCBFUlJPUl9NRVNTQUdFUy5OVUxMLCAnUHJvdG9jb2wnLCAnY2xhc3NGdWxmaWxscycpO1xuXG5cdFx0cmV0dXJuIGZ1bGZpbGxzKGNsYXNzRGVmaW5pdGlvbi5wcm90b3R5cGUsIHByb3RvY29sKTtcblx0fVxuXG5cdC8vIEF1eGlsbGFyaWVzIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cdHZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuXHRmdW5jdGlvbiBhc3NlcnRBcmd1bWVudE9mVHlwZSh0eXBlLCBhcmd1bWVudCkge1xuXHRcdHZhciBhY3R1YWxUeXBlID0gdHlwZW9mIGFyZ3VtZW50O1xuXHRcdGlmIChhY3R1YWxUeXBlICE9PSB0eXBlKSB7XG5cdFx0XHR2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcblx0XHRcdGFyZ3MucHVzaChhY3R1YWxUeXBlKTtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IobXNnLmFwcGx5KG51bGwsIGFyZ3MpKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBhc3NlcnROb3RoaW5nSW5PYmplY3Qob2JqZWN0KSB7XG5cdFx0Zm9yICh2YXIgcHJvcGVydHlOYW1lIGluIG9iamVjdCkge1xuXHRcdFx0dmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cdFx0XHRhcmdzLnB1c2gocHJvcGVydHlOYW1lKTtcblx0XHRcdHRocm93IG5ldyBFcnJvcihtc2cuYXBwbHkobnVsbCwgYXJncykpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGFzc2VydEFyZ3VtZW50Tm90TnVsbE9yVW5kZWZpbmVkKGl0ZW0pIHtcblx0XHRpZiAoaXRlbSA9PSBudWxsKSB7XG5cdFx0XHR2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IobXNnLmFwcGx5KG51bGwsIGFyZ3MpKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBpc092ZXJyaWRlck9mKHByb3BlcnR5TmFtZSwgc3ViLCBhbmNlc3Rvcikge1xuXHRcdGlmIChzdWIucHJvdG90eXBlW3Byb3BlcnR5TmFtZV0gPT09IGFuY2VzdG9yLnByb3RvdHlwZVtwcm9wZXJ0eU5hbWVdKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dmFyIHBhcmVudHMgPSBnZXRJbW1lZGlhdGVQYXJlbnRzKHN1Yik7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwYXJlbnRzLmxlbmd0aDsgKytpKSB7XG5cdFx0XHR2YXIgcGFyZW50ID0gcGFyZW50c1tpXTtcblx0XHRcdGlmIChwYXJlbnQucHJvdG90eXBlW3Byb3BlcnR5TmFtZV0gPT09IGFuY2VzdG9yLnByb3RvdHlwZVtwcm9wZXJ0eU5hbWVdKSByZXR1cm4gdHJ1ZTtcblx0XHRcdGlmIChpc092ZXJyaWRlck9mKHByb3BlcnR5TmFtZSwgcGFyZW50LCBhbmNlc3RvcikpIHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldEltbWVkaWF0ZVBhcmVudHMoc3ViKSB7XG5cdFx0dmFyIHBhcmVudHMgPSAoc3ViLl9fbXVsdGlwYXJlbnRzX18gfHwgW10pLnNsaWNlKCk7XG5cdFx0dmFyIHBhcmVudFByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyAmJiBzdWIuc3VwZXJjbGFzcy5wcm90b3R5cGUpIHx8IGdldFByb3RvdHlwZU9mKHN1Yi5wcm90b3R5cGUpO1xuXHRcdGlmIChwYXJlbnRQcm90b3R5cGUgIT09IG51bGwgJiYgcGFyZW50UHJvdG90eXBlLmNvbnN0cnVjdG9yICE9PSBudWxsICYmIHBhcmVudFByb3RvdHlwZS5jb25zdHJ1Y3RvciAhPT0gc3ViKSB7XG5cdFx0XHRwYXJlbnRzLnB1c2gocGFyZW50UHJvdG90eXBlLmNvbnN0cnVjdG9yKTtcblx0XHR9XG5cdFx0cmV0dXJuIHBhcmVudHM7XG5cdH1cblxuXHQvKipcblx0ICogSW50ZXJwb2xhdGVzIGEgc3RyaW5nIHdpdGggdGhlIGFyZ3VtZW50cywgdXNlZCBmb3IgZXJyb3IgbWVzc2FnZXMuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBtc2coc3RyKSB7XG5cdFx0aWYgKHN0ciA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBpID0gMSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG5cdFx0XHRzdHIgPSBzdHIucmVwbGFjZSgneycgKyAoaSAtIDEpICsgJ30nLCBTdHJpbmcoYXJndW1lbnRzW2ldKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHN0cjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgbm9uZW51bWVyYWJsZSBwcm9wZXJ0eSBpZiBpdCBleGlzdHMsIG9yIGNyZWF0ZXMgb25lIGFuZCByZXR1cm5zIHRoYXQgaWYgaXQgZG9lcyBub3QuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBub25lbnVtKG9iamVjdCwgcHJvcGVydHlOYW1lLCBkZWZhdWx0VmFsdWUpIHtcblx0XHR2YXIgdmFsdWUgPSBvYmplY3RbcHJvcGVydHlOYW1lXTtcblxuXHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHR2YWx1ZSA9IGRlZmF1bHRWYWx1ZTtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIHByb3BlcnR5TmFtZSwge1xuXHRcdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHRcdFx0dmFsdWU6IHZhbHVlXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogRWFzaWVyIGZvciB1cyBpZiB3ZSB0cmVhdCBldmVyeXRoaW5nIGFzIGZ1bmN0aW9ucyB3aXRoIHByb3RvdHlwZXMuIFRoaXMgZnVuY3Rpb24gbWFrZXMgcGxhaW4gb2JqZWN0cyBiZWhhdmUgdGhhdFxuXHQgKiAgd2F5LlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gdG9GdW5jdGlvbihvYmosIGNvdWxkTm90Q2FzdEVycm9yKSB7XG5cdFx0aWYgKG9iaiA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBjb3VsZE5vdENhc3RFcnJvcjtcblx0XHR9XG5cblx0XHR2YXIgcmVzdWx0O1xuXHRcdGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuXHRcdFx0aWYgKG9iai5oYXNPd25Qcm9wZXJ0eSgnY29uc3RydWN0b3InKSkge1xuXHRcdFx0XHRpZiAob2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAhPT0gb2JqKSB0aHJvdyBjb3VsZE5vdENhc3RFcnJvcjtcblx0XHRcdFx0cmVzdWx0ID0gb2JqLmNvbnN0cnVjdG9yO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIEVtcHR5SW5pdGlhbGlzZXIgPSBmdW5jdGlvbigpIHt9O1xuXHRcdFx0XHRFbXB0eUluaXRpYWxpc2VyLnByb3RvdHlwZSA9IG9iajtcblx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgJ2NvbnN0cnVjdG9yJywge1xuXHRcdFx0XHRcdGVudW1lcmFibGU6IGZhbHNlLCB2YWx1ZTogRW1wdHlJbml0aWFsaXNlclxuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmVzdWx0ID0gRW1wdHlJbml0aWFsaXNlcjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHJlc3VsdCA9IG9iajtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgY291bGROb3RDYXN0RXJyb3I7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKiogQHByaXZhdGUgKi9cblx0dmFyIGN1cnJlbnRJZCA9IDA7XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIG5vbmVudW1lcmFibGUgcHJvcGVydHkgX19pZF9fIG9mIGFuIG9iamVjdCBpZiBpdCBleGlzdHMsIG90aGVyd2lzZSBhZGRzIG9uZSBhbmQgcmV0dXJucyB0aGF0LlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gY2xhc3NJZChmdW5jKSB7XG5cdFx0dmFyIHJlc3VsdCA9IGZ1bmMuX19pZF9fO1xuXHRcdGlmIChyZXN1bHQgPT0gbnVsbCkge1xuXHRcdFx0cmVzdWx0ID0gbm9uZW51bShmdW5jLCAnX19pZF9fJywgY3VycmVudElkKyspO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0dmFyIG5hbWVGcm9tVG9TdHJpbmdSZWdleCA9IC9eZnVuY3Rpb25cXHM/KFteXFxzKF0qKS87XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGNsYXNzbmFtZSBvZiBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gaWYgaXQgY2FuLiAgT3RoZXJ3aXNlIHJldHVybnMgdGhlIHByb3ZpZGVkIGRlZmF1bHQuIEdldHRpbmcgdGhlIG5hbWVcblx0ICogIG9mIGEgZnVuY3Rpb24gaXMgbm90IGEgc3RhbmRhcmQgZmVhdHVyZSwgc28gd2hpbGUgdGhpcyB3aWxsIHdvcmsgaW4gbWFueSBjYXNlcywgaXQgc2hvdWxkIG5vdCBiZSByZWxpZWQgdXBvblxuXHQgKiAgZXhjZXB0IGZvciBpbmZvcm1hdGlvbmFsIG1lc3NhZ2VzIChlLmcuIGxvZ2dpbmcgYW5kIEVycm9yIG1lc3NhZ2VzKS5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIGNsYXNzTmFtZShvYmplY3QsIGRlZmF1bHROYW1lKSB7XG5cdFx0aWYgKG9iamVjdCA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gZGVmYXVsdE5hbWU7XG5cdFx0fVxuXG5cdFx0dmFyIHJlc3VsdCA9ICcnO1xuXHRcdGlmICh0eXBlb2Ygb2JqZWN0ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRpZiAob2JqZWN0Lm5hbWUpIHtcblx0XHRcdFx0cmVzdWx0ID0gb2JqZWN0Lm5hbWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgbWF0Y2ggPSBvYmplY3QudG9TdHJpbmcoKS5tYXRjaChuYW1lRnJvbVRvU3RyaW5nUmVnZXgpO1xuXHRcdFx0XHRpZiAobWF0Y2ggIT09IG51bGwpIHtcblx0XHRcdFx0XHRyZXN1bHQgPSBtYXRjaFsxXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodHlwZW9mIG9iamVjdC5jb25zdHJ1Y3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0cmVzdWx0ID0gY2xhc3NOYW1lKG9iamVjdC5jb25zdHJ1Y3RvciwgZGVmYXVsdE5hbWUpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQgfHwgZGVmYXVsdE5hbWU7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgb2YgdGhlIHByb3BlcnRpZXMgb24gYSBwcm90b2NvbCB0aGF0IGFyZSBub3Qgb24gY2xhc3NkZWYgb3IgYXJlIG9mIGEgZGlmZmVyZW50IHR5cGUgb25cblx0ICogIGNsYXNzZGVmLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gbWlzc2luZ0F0dHJpYnV0ZXMoY2xhc3NkZWYsIHByb3RvY29sKSB7XG5cdFx0dmFyIHJlc3VsdCA9IFtdLCBvYmogPSBjbGFzc2RlZi5wcm90b3R5cGUsIHJlcXVpcmVtZW50ID0gcHJvdG9jb2wucHJvdG90eXBlO1xuXHRcdGZvciAodmFyIGl0ZW0gaW4gcmVxdWlyZW1lbnQpIHtcblx0XHRcdGlmICh0eXBlb2Ygb2JqW2l0ZW1dICE9PSB0eXBlb2YgcmVxdWlyZW1lbnRbaXRlbV0pIHtcblx0XHRcdFx0cmVzdWx0LnB1c2goaXRlbSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgaXRlbSBpbiBwcm90b2NvbCkge1xuXHRcdFx0aWYgKHByb3RvY29sLmhhc093blByb3BlcnR5KGl0ZW0pICYmICB0eXBlb2YgY2xhc3NkZWZbaXRlbV0gIT09IHR5cGVvZiBwcm90b2NvbFtpdGVtXSkge1xuXHRcdFx0XHQvLyBJZiB3ZSdyZSBpbiBpZTgsIG91ciBpbnRlcm5hbCB2YXJpYWJsZXMgd29uJ3QgYmUgbm9uZW51bWVyYWJsZSwgc28gd2UgaW5jbHVkZSBhIGNoZWNrIGZvciB0aGF0IGhlcmUuXG5cdFx0XHRcdGlmIChpbnRlcm5hbFVzZU5hbWVzLmluZGV4T2YoaXRlbSkgPCAwKSB7XG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goaXRlbSArICcgKGNsYXNzIG1ldGhvZCknKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogQ29waWVzIGFsbCBwcm9wZXJ0aWVzIGZyb20gdGhlIHNvdXJjZSB0byB0aGUgdGFyZ2V0IChpbmNsdWRpbmcgaW5oZXJpdGVkIHByb3BlcnRpZXMpIGFuZCBvcHRpb25hbGx5IG1ha2VzIHRoZW1cblx0ICogIG5vdCBlbnVtZXJhYmxlLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gY29weShzb3VyY2UsIHRhcmdldCwgaGlkZGVuKSB7XG5cdFx0Zm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCB7XG5cdFx0XHRcdGVudW1lcmFibGU6IGhpZGRlbiAhPT0gdHJ1ZSxcblx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSxcblx0XHRcdFx0dmFsdWU6IHNvdXJjZVtrZXldXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGFyZ2V0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFR1cm5zIGEgZnVuY3Rpb24gaW50byBhIG1ldGhvZCBieSB1c2luZyAndGhpcycgYXMgdGhlIGZpcnN0IGFyZ3VtZW50LlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gbWFrZU1ldGhvZChmdW5jKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGFyZ3MgPSBbdGhpc10uY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG5cdFx0XHRyZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmdzKTtcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIE1peGluIGZ1bmN0aW9ucyBhcmUgc2FuZGJveGVkIGludG8gdGhlaXIgb3duIGluc3RhbmNlLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gZ2V0U2FuZGJveGVkRnVuY3Rpb24obXlNaXhJZCwgbWl4LCBmdW5jKSB7XG5cdFx0dmFyIHJlc3VsdCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIG1peEluc3RhbmNlcyA9IG5vbmVudW0odGhpcywgJ19fbXVsdGlwYXJlbnRJbnN0YW5jZXNfXycsIFtdKTtcblx0XHRcdHZhciBtaXhJbnN0YW5jZSA9IG1peEluc3RhbmNlc1tteU1peElkXTtcblx0XHRcdGlmIChtaXhJbnN0YW5jZSA9PSBudWxsKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgbWl4ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0bWl4SW5zdGFuY2UgPSBuZXcgbWl4KCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bWl4SW5zdGFuY2UgPSBPYmplY3QuY3JlYXRlKG1peCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gY291bGQgYWRkIGEgbm9uZW51bSBwb2ludGVyIHRvIF9fdGhpc19fIG9yIHNvbWV0aGluZyBpZiB3ZSB3YW50ZWQgdG8gYWxsb3cgZXNjYXBlIGZyb20gdGhlIHNhbmRib3guXG5cdFx0XHRcdG1peEluc3RhbmNlc1tteU1peElkXSA9IG1peEluc3RhbmNlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZ1bmMuYXBwbHkobWl4SW5zdGFuY2UsIGFyZ3VtZW50cyk7XG5cdFx0fTtcblxuXHRcdG5vbmVudW0ocmVzdWx0LCAnX19vcmlnaW5hbF9fJywgZnVuYyk7XG5cdFx0bm9uZW51bShyZXN1bHQsICdfX3NvdXJjZV9fJywgbWl4KTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYXJzIHRoZSBgX19hc3NpZ25hYmxlX2Zyb21fY2FjaGVfX2AgY2FjaGUgZm9yIHRhcmdldCBhbmQgcGFyZW50LlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gY2xlYXJBc3NpZ25hYmxlQ2FjaGUodGFyZ2V0LCBwYXJlbnQpIHtcblx0XHRpZiAoJ19fYXNzaWduYWJsZV9mcm9tX2NhY2hlX18nIGluIHRhcmdldCkge1xuXHRcdFx0ZGVsZXRlIHRhcmdldC5fX2Fzc2lnbmFibGVfZnJvbV9jYWNoZV9fW2NsYXNzSWQocGFyZW50KV07XG5cdFx0fVxuXHR9XG5cblxuXHRmdW5jdGlvbiBnZXRQcm90b3R5cGVPZihvYmopIHtcblx0XHRpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKSB7XG5cdFx0XHR2YXIgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKTtcblxuXHRcdFx0Ly8gdG8gYXZvaWQgYmFkIHNoYW1zLi4uXG5cdFx0XHRpZiAocHJvdG8gIT09IG9iaikge1xuXHRcdFx0XHRyZXR1cm4gcHJvdG87XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gdGhpcyBpcyB3aGF0IG1vc3Qgc2hhbXMgZG8sIGJ1dCBzb21ldGltZXMgaXQncyB3cm9uZy5cblx0XHRpZiAob2JqLmNvbnN0cnVjdG9yICYmIG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgJiYgb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAhPT0gb2JqKSB7XG5cdFx0XHRyZXR1cm4gb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcblx0XHR9XG5cblx0XHQvLyB0aGlzIHdvcmtzIG9ubHkgaWYgd2UndmUgYmVlbiBraW5kIGVub3VnaCB0byBzdXBwbHkgYSBzdXBlcmNsYXNzIHByb3BlcnR5ICh3aGljaCB3ZSBkbyB3aGVuIHdlIGV4dGVuZCBjbGFzc2VzKVxuXHRcdGlmIChvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLnN1cGVyY2xhc3MpIHtcblx0XHRcdHJldHVybiBvYmouY29uc3RydWN0b3Iuc3VwZXJjbGFzcy5wcm90b3R5cGU7XG5cdFx0fVxuXG5cdFx0Ly8gY2FuJ3QgZmluZCBhIGdvb2QgcHJvdG90eXBlLlxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblxuXHQvLyBFeHBvcnRpbmcgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXHR2YXIgbWV0aG9kcyA9IHtcblx0XHQnZXh0ZW5kJzogZXh0ZW5kLCAnaW5oZXJpdCc6IGluaGVyaXQsICdtaXhpbic6IG1peGluLCAnaW1wbGVtZW50JzogaW1wbGVtZW50LFxuXHRcdCdoYXNJbXBsZW1lbnRlZCc6IGhhc0ltcGxlbWVudGVkLCAnY2xhc3NJc0EnOiBjbGFzc0lzQSwgJ2lzQXNzaWduYWJsZUZyb20nOiBjbGFzc0lzQSxcblx0XHQnaXNBJzogaXNBLCAnZnVsZmlsbHMnOiBmdWxmaWxscywgJ2NsYXNzRnVsZmlsbHMnOiBjbGFzc0Z1bGZpbGxzXG5cdH07XG5cblx0LyoganNoaW50IGV2aWw6dHJ1ZSAqL1xuXHR2YXIgZ2xvYmFsID0gKG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXM7JykpKCk7XG5cblx0dmFyIGV4cG9ydGluZyA9IHtcblx0XHQnZXhwb3J0VG8nOiBmdW5jdGlvbih0bykge1xuXHRcdFx0Y29weShtZXRob2RzLCB0byB8fCBnbG9iYWwsIHRydWUpO1xuXHRcdH0sXG5cdFx0J2luc3RhbGwnOiBmdW5jdGlvbih0YXJnZXQpIHtcblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCAmJiB0eXBlb2YgdGFyZ2V0ICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihtc2coRVJST1JfTUVTU0FHRVMuQkFEX0lOU1RBTEwsIHR5cGVvZiB0YXJnZXQpKTtcblx0XHRcdH1cblx0XHRcdHZhciBpc0dsb2JhbEluc3RhbGwgPSBhcmd1bWVudHMubGVuZ3RoIDwgMVxuXG5cdFx0XHRjb3B5KHtcblx0XHRcdFx0aXNBOiBtYWtlTWV0aG9kKG1ldGhvZHMuaXNBKSxcblx0XHRcdFx0ZnVsZmlsbHM6IG1ha2VNZXRob2QobWV0aG9kcy5mdWxmaWxscylcblx0XHRcdH0sIGlzR2xvYmFsSW5zdGFsbCA/IE9iamVjdC5wcm90b3R5cGUgOiB0YXJnZXQucHJvdG90eXBlLCB0cnVlKTtcblxuXHRcdFx0dmFyIGl0ZW1zVG9JbnN0YWxsVG9GdW5jdGlvbiA9IHtcblx0XHRcdFx0J2NsYXNzSXNBJzogbWFrZU1ldGhvZChtZXRob2RzLmNsYXNzSXNBKSxcblx0XHRcdFx0J2ltcGxlbWVudHMnOiBtYWtlTWV0aG9kKG1ldGhvZHMuaW1wbGVtZW50KSxcblx0XHRcdFx0J2hhc0ltcGxlbWVudGVkJzogbWFrZU1ldGhvZChtZXRob2RzLmhhc0ltcGxlbWVudGVkKSxcblx0XHRcdFx0J2Z1bGZpbGxzJzogbWFrZU1ldGhvZChtZXRob2RzLmNsYXNzRnVsZmlsbHMpLFxuXHRcdFx0XHQvLyB3ZSBjYW4gJ2V4dGVuZCcgYSBzdXBlcmNsYXNzIHRvIG1ha2UgYSBzdWJjbGFzcy5cblx0XHRcdFx0J2V4dGVuZCc6IGZ1bmN0aW9uKHByb3BlcnRpZXMpIHtcblx0XHRcdFx0XHRpZiAodHlwZW9mIHByb3BlcnRpZXMgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdHJldHVybiBleHRlbmQocHJvcGVydGllcywgdGhpcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBleHRlbmQobnVsbCwgdGhpcywgcHJvcGVydGllcyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdtaXhpbic6IG1ha2VNZXRob2QobWV0aG9kcy5taXhpbiksXG5cdFx0XHRcdCdpbmhlcml0cyc6IG1ha2VNZXRob2QobWV0aG9kcy5pbmhlcml0KVxuXHRcdFx0fTtcblx0XHRcdGlmIChpc0dsb2JhbEluc3RhbGwpIHtcblx0XHRcdFx0Ly8gbm8gcG9pbnQgaW4gaGF2aW5nIHN1YmNsYXNzLmV4dGVuZHMgdW5sZXNzIGl0J3MgZ2xvYmFsLlxuXHRcdFx0XHRpdGVtc1RvSW5zdGFsbFRvRnVuY3Rpb25bJ2V4dGVuZHMnXSA9IG1ha2VNZXRob2QobWV0aG9kcy5leHRlbmQpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb3B5KGl0ZW1zVG9JbnN0YWxsVG9GdW5jdGlvbiwgaXNHbG9iYWxJbnN0YWxsID8gRnVuY3Rpb24ucHJvdG90eXBlIDogdGFyZ2V0LCBpc0dsb2JhbEluc3RhbGwpO1xuXG5cdFx0XHRyZXR1cm4gdGFyZ2V0O1xuXHRcdH1cblx0fTtcblx0ZXhwb3J0aW5nLmV4cG9ydCA9IGV4cG9ydGluZy5leHBvcnRUbzsgLy8gZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG5cblx0bWV0aG9kcy5CYXNlID0gZXhwb3J0aW5nLmluc3RhbGwoZnVuY3Rpb24gQmFzZUNsYXNzKCkge30pO1xuXG5cdGNvcHkobWV0aG9kcywgZXhwb3J0aW5nKTtcblxuXHQvLyBub3Qgc3VyZSBpZiB0aGlzIHdvcmtzIGluIG5vZGUtamFzbWluZS4uLi5cblx0aWYgKCdqYXNtaW5lJyBpbiBnbG9iYWwpIHtcblx0XHR2YXIgZXJyID0ge307XG5cdFx0dmFyIGdldEVyciA9IGZ1bmN0aW9uKGtleSkge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgbWVzc2FnZSA9IEVSUk9SX01FU1NBR0VTW2tleV07XG5cdFx0XHRcdHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXHRcdFx0XHRhcmdzLnVuc2hpZnQobWVzc2FnZSk7XG5cdFx0XHRcdHZhciByZXN1bHQgPSBtc2cuYXBwbHkobnVsbCwgYXJncyk7XG5cdFx0XHRcdGlmIChyZXN1bHQgPT09IG51bGwpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyBzdWNoIGVycm9yIG1lc3NhZ2UgXCIgKyBrZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9O1xuXHRcdH07XG5cdFx0Zm9yICh2YXIga2V5IGluIEVSUk9SX01FU1NBR0VTKSB7XG5cdFx0XHRlcnJba2V5XSA9IGdldEVycihrZXkpO1xuXHRcdH1cblx0XHRleHBvcnRpbmcuX2VyciA9IGVycjtcblx0fVxuXG5cdHJldHVybiBleHBvcnRpbmc7XG59KTtcbiIsInZhciBDaGF0Um9vbSA9IHJlcXVpcmUoICcuL0NoYXRSb29tJyApO1xudmFyIENoYXRVc2VyID0gcmVxdWlyZSggJy4vQ2hhdFVzZXInICk7XG52YXIgUGxhdGZvcm1BZGFwdGVyID0gcmVxdWlyZSggJy4vUGxhdGZvcm1BZGFwdGVyJyApO1xudmFyIHVzaW5nID0gcmVxdWlyZSggJ3R5cGVzdGVyJyApLnVzaW5nO1xuXG4vKipcbiAqIEEgY2hhdCBlbmdpbmUuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIHtQbGF0Zm9ybUFkYXB0ZXJ9IGFkYXB0ZXJcbiAqICAgIFRoZSBob29rcyB0aGUgY29yZSBmdW5jdGlvbmFsaXR5IHVwIHRvIGEgc3BlY2lmaWMgcGxhdGZvcm0gaW1wbGVtZW5hdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2hhdCggYWRhcHRlciApIHtcbiAgdXNpbmcoIGFyZ3VtZW50cyApXG4gICAgLnZlcmlmeSggJ2FkYXB0ZXInICkuZnVsZmlsbHMoIFBsYXRmb3JtQWRhcHRlciApO1xuXG4gIC8qKlxuICAgKiBAdHlwZSBQbGF0Zm9ybUFkYXB0ZXJcbiAgICovXG4gIHRoaXMuX2FkYXB0ZXIgPSBhZGFwdGVyO1xuXG4gIC8qKlxuICAgKiBUaGUgZGVmYXVsdCByb29tIGZvciB0aGUgY2hhdFxuICAgKiBAdHlwZSBDaGF0Um9vbVxuICAgKi9cbiAgdGhpcy5kZWZhdWx0Um9vbSA9IG5ldyBDaGF0Um9vbSggJ2xvYmJ5JywgdGhpcy5fYWRhcHRlciApO1xuXG4gIC8qKlxuICAgKiBUaGUgY3VycmVudCB1c2VyIGluIHRoZSBjaGF0LlxuICAgKiBAdHlwZSBDaGF0VXNlclxuICAgKi9cbiAgdGhpcy51c2VyID0gbnVsbDtcblxuICAvKipcbiAgICogQ2hhdCByb29tcyB0aGF0IGFyZSBhdmFpbGFibGUuXG4gICAqIEEgbWFwIG9mIGNoYXQgcm9vbSBuYW1lIHRvIENoYXRSb29tIG9iamVjdC5cbiAgICogQHR5cGUgTWFwXG4gICAqL1xuICB0aGlzLnJvb21zID0ge307XG59XG5cbi8qKlxuICogU2V0IHRoZSBjdXJyZW50IHVzZXIgZm9yIHRoZSBjaGF0IGVuZ2luZS5cbiAqXG4gKiBAcGFyYW0ge0NoYXRVc2VyfSB1c2VyXG4gKiAgICBUaGUgY3VycmVudCB1c2VyXG4gKi9cbkNoYXQucHJvdG90eXBlLnNldFVzZXIgPSBmdW5jdGlvbiggdXNlciApIHtcbiAgaWYoICF1c2VyLmlkICkge1xuICAgIHRocm93IG5ldyBFcnJvciggJ1RoZSBcInVzZXJcIiBtdXN0IGltcGxlbWVudCB0aGUgQ2hhdFVzZXIgaW50ZXJmYWNlJyApO1xuICB9XG4gIHRoaXMudXNlciA9IHVzZXI7XG59O1xuXG4vKipcbiAqIFNlbmQgYSBtZXNzYWdlIHRvIHRoZSBkZWZhdWx0IGNoYXQgcm9vbS5cbiAqXG4gKiBAcGFyYW0ge0NoYXRNZXNzYWdlfSBtZXNzYWdlXG4gKiAgICBUaGUgbWVzc2FnZSB0byBzZW5kIHRvIHRoZSBkZWZhdWx0IGNoYXQgcm9vbVxuICovXG5DaGF0LnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oIG1lc3NhZ2UgKSB7XG4gIHRoaXMuZGVmYXVsdFJvb20uc2VuZCggbWVzc2FnZSApO1xufTtcblxuLyoqXG4gKiBBZGQgYSBuZXcgcm9vbSB0byB0aGUgY2hhdC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGNoYXQgcm9vbSB0byBiZSBhZGRlZC5cbiAqIEByZXR1cm4ge0NoYXRSb29tfSBUaGUgbmV3bHkgY3JlYXRlZCByb29tXG4gKi9cbkNoYXQucHJvdG90eXBlLmFkZFJvb20gPSBmdW5jdGlvbiggbmFtZSApIHtcbiAgaWYoIHRoaXMucm9vbXNbIG5hbWUgXSAhPT0gdW5kZWZpbmVkICkge1xuICAgIHRocm93IG5ldyBFcnJvciggJ1Jvb20gd2l0aCBuYW1lIFwiJyArIG5hbWUgKyAnXCIgYWxyZWFkeSBleGlzdHMnICk7XG4gIH1cblxuICB2YXIgcm9vbSA9IG5ldyBDaGF0Um9vbSggbmFtZSwgdGhpcyApO1xuICB0aGlzLnJvb21zWyBuYW1lIF0gPSByb29tO1xuXG4gIHRoaXMuX2FkYXB0ZXIuYWRkUm9vbSggcm9vbSApO1xuXG4gIHJldHVybiByb29tO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGF0O1xuXG5cblxuXG5cbi8vIG9uKCAnbmV3LW1lc3NhZ2UnIClcbi8vIG9uKCAnbmV3JylcblxuLy8gYWRkTWVzc2FnZUxpc3RlbmVyKCBsaXN0ZW5lciApXG4iLCIvKipcbiAqIEEgY2hhdCBtZXNzYWdlXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJJZFxuICogICAgVGhlIGlkIG9mIHRoZSB1c2VyIHNlbmRpbmcgdGhlIG1lc3NhZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0XG4gKiAgICBUaGUgbWVzc2FnZSB0ZXh0IGNvbnRlbnRzXG4gKiBAcGFyYW0ge0RhdGV9IHNlbnRUaW1lXG4gKiAgICBUaGUgdGltZSB0aGUgbWVzc2FnZSB3YXMgc2VudC4gT3B0aW9uYWw6IGRlZmF1bHRzIHRvIHRoZSBjdXJyZW50IHRpbWUuXG4gKi9cbmZ1bmN0aW9uIENoYXRNZXNzYWdlKCB1c2VySWQsIHRleHQsIHNlbnRUaW1lICkge1xuICBzZW50VGltZSA9IHNlbnRUaW1lIHx8IG5ldyBEYXRlKCk7XG5cbiAgdGhpcy51c2VySWQgPSB1c2VySWQ7XG4gIHRoaXMudGV4dCA9IHRleHQ7XG4gIHRoaXMuc2VudFRpbWUgPSBzZW50VGltZTtcbn1cblxuLyoqXG4gKiBVbmlxdWUgSUQgb2YgdGhlIHVzZXIgc2VuZGluZyB0aGUgbWVzc2FnZVxuICpcbiAqIEB0eXBlIFN0cmluZ1xuICovXG5DaGF0TWVzc2FnZS5wcm90b3R5cGUudXNlcklkID0gJyc7XG5cbi8qKlxuICogTWVzc2FnZSB0ZXh0XG4gKlxuICogQHR5cGUgU3RyaW5nXG4gKi9cbkNoYXRNZXNzYWdlLnByb3RvdHlwZS50ZXh0ID0gJyc7XG5cbi8qKlxuICogVGltZSB0aGUgbWVzc2FnZSB3YXMgc2VudC5cbiAqXG4gKiBAdHlwZSBEYXRlXG4gKi9cbkNoYXRNZXNzYWdlLnByb3RvdHlwZS5zZW50VGltZSA9IG5ldyBEYXRlKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hhdE1lc3NhZ2U7XG4iLCJ2YXIgQ2hhdE1lc3NhZ2UgPSByZXF1aXJlKCAnLi9DaGF0TWVzc2FnZScgKTtcbnZhciB1c2luZyA9IHJlcXVpcmUoJ3R5cGVzdGVyJykudXNpbmc7XG5cbi8qKlxuICogQSBjaGF0IHJvb20uXG4gKi9cbmZ1bmN0aW9uIENoYXRSb29tKCBuYW1lLCBhZGFwdGVyICkge1xuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIHJvb21cbiAgICogQHR5cGUgU3RyaW5nXG4gICAqL1xuICB0aGlzLm5hbWUgPSBuYW1lO1xuXG4gIC8qKlxuICAgKiBUaGUgdXNlcnMgaW4gdGhlIGNoYXQgcm9vbS5cbiAgICogQSBsb29rdXAgb2YgdXNlciBJRCB0byBjaGF0IHVzZXJcbiAgICogQHR5cGUgTWFwXG4gICAqL1xuICB0aGlzLnVzZXJzID0ge307XG5cbiAgLy8gVE9ETzogbWVzc2FnZXM/XG5cbiAgLyoqXG4gICAqIEB0eXBlIFBsYXRmb3JtQWRhcHRlclxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdGhpcy5fYWRhcHRlciA9IGFkYXB0ZXI7XG59XG5cbi8qKlxuICogU2VuZCB0aGUgbWVzc2FnZS5cbiAqXG4gKiBAcGFyYW0ge0NoYXRNZXNzYWdlfSBtZXNzYWdlXG4gKi9cbkNoYXRSb29tLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oIG1lc3NhZ2UgKSB7XG4gIHVzaW5nKCBhcmd1bWVudHMgKVxuICAgIC52ZXJpZnkoICdtZXNzYWdlJyApLmZ1bGZpbGxzKCBDaGF0TWVzc2FnZSApO1xuXG4gIHRoaXMuX2FkYXB0ZXIuc2VuZCggbWVzc2FnZSApO1xufTtcblxuLyoqXG4gKiBBZGRzIGEgdXNlciB0byBhIHJvb20uXG4gKi9cbkNoYXRSb29tLnByb3RvdHlwZS5qb2luID0gZnVuY3Rpb24oIHVzZXIgKSB7XG4gIGlmKCB0aGlzLnVzZXJzWyB1c2VyLmlkIF0gIT09IHVuZGVmaW5lZCApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdBIHVzZXIgd2l0aCB0aGUgaWQgXCInICsgdXNlci5pZCArICdcIiBpcyBhbHJlYWR5IGluIHRoZSByb29tLiBDYW5ub3Qgam9pbiB0aGUgcm9vbSB0d2ljZS4nICk7XG4gIH1cbiAgdGhpcy51c2Vyc1sgdXNlci5pZCBdID0gdXNlcjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hhdFJvb207XG4iLCJmdW5jdGlvbiBDaGF0VXNlciggdXNlcklkICkge1xuICAvKipcbiAgICogVW5pcXVlIElEIG9mIHRoZSB1c2VyIHNlbmRpbmcgdGhlIG1lc3NhZ2VcbiAgICpcbiAgICogQHR5cGUgU3RyaW5nXG4gICAqL1xuICB0aGlzLmlkID0gdXNlcklkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENoYXRVc2VyO1xuIiwiLyoqXG4gKiBUaGUgaW50ZXJmYWNlIHRoYXQgc3BlY2lmaWMgcGxhdGZvcm0gYWRhcHRlcnMgbXVzdCBpbXBsZW1lbnQuXG4gKiBJdCB3aWxsIGJlIGludGVyYWN0ZWQgd2l0aCB2aWEgdGhlIGNvcmUgYW5kIGVhY2ggcGxhdGZvcm0gbXVzdCBwcm92aWRlIGl0cyBvd24gaW1wbGVtZW50YXRpb24uXG4gKi9cbmZ1bmN0aW9uIFBsYXRmb3JtQWRhcHRlcigpIHtcbn1cblxuLyoqXG4gKiBBZGQgYSByb29tIHRvIHRoZSBjaGF0LlxuICogSW4gYW4gaW1wbGVtZW50YXRpb24gdGhpcyBtYXkgcmV0cmlldmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGNoYW5uZWwuXG4gKiBTb21lIGltcGxlbWVudGF0aW9ucyBtYXkgc3Vic2NyaWJlIHRvIGEgY2hhbm5lbCwgYnV0IGl0IG1heSBiZSBtb3JlIGVmZmljaWVudFxuICogdG8gb25seSBzdWJzY3JpYmUgaWYgdGhlIGN1cnJlbnQgdXNlciBqb2lucyBhIHJvb20uXG4gKlxuICogQHBhcmFtIHtDaGF0Um9vbX0gcm9vbVxuICogICAgVGhlIHJvb20gdG8gYWRkIHRvIHRoZSBjaGF0LlxuICovXG5QbGF0Zm9ybUFkYXB0ZXIucHJvdG90eXBlLmFkZFJvb20gPSBmdW5jdGlvbiggcm9vbSApIHt9O1xuXG4vKipcbiAqIFNlbmQgYSBtZXNzYWdlLlxuICogSW4gYW4gaW1wbGVtZW50YXRpb24gdGhpcyBtYXkgdHJpZ2dlciBvciBwdWJsaXNoIGEgbWVzc2FnZSBvbiBhIGNoYW5uZWwuXG4gKlxuICogQHBhcmFtIHtDaGF0TWVzc2FnZX0gbWVzc2FnZVxuICogICAgVGhlIG1lc3NhZ2UgdG8gc2VuZC5cbiAqL1xuUGxhdGZvcm1BZGFwdGVyLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oIG1lc3NhZ2UgKSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF0Zm9ybUFkYXB0ZXI7XG4iLCJ2YXIgQ2hhdCA9IHJlcXVpcmUoICcuL0NoYXQuanMnICk7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ2hhdDogQ2hhdFxufTtcbiJdfQ==
(15)
});
