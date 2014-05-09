/*
 * Jive Software licenses this file to you under the Apache
 * License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

if (typeof(osapi) == "undefined") {
    var osapi = {};
}

if (typeof(osapi.jive) == "undefined") {
    osapi.jive = {};
}

osapi.jive.extend = function() {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if ( typeof target === "boolean" ) {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if ( typeof target !== "object" && !osapi.jive.isFunction(target) ) {
        target = {};
    }

    // extend osapi.jive itself if only one argument is passed
    if ( length === i ) {
        target = this;
        --i;
    }

    for ( ; i < length; i++ ) {
        // Only deal with non-null/undefined values
        if ( (options = arguments[ i ]) != null ) {
            // Extend the base object
            for ( name in options ) {
                src = target[ name ];
                copy = options[ name ];

                // Prevent never-ending loop
                if ( target === copy ) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if ( deep && copy && ( osapi.jive.isPlainObject(copy) || (copyIsArray = osapi.jive.isArray(copy)) ) ) {
                    if ( copyIsArray ) {
                        copyIsArray = false;
                        clone = src && osapi.jive.isArray(src) ? src : [];

                    } else {
                        clone = src && osapi.jive.isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[ name ] = osapi.jive.extend( deep, clone, copy );

                    // Don't bring in undefined values
                } else if ( copy !== undefined ) {
                    target[ name ] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
};

osapi.jive.extend(osapi.jive, {

    inArray: function( elem, array ) {

        if ( Array.prototype.indexOf ) {
            return Array.prototype.indexOf.call( array, elem );
        }

        for ( var i = 0, length = array.length; i < length; i++ ) {
            if ( array[ i ] === elem ) {
                return i;
            }
        }

        return -1;
    },

    // See test/unit/core.js for details concerning isFunction.
    // Since version 1.3, DOM methods and functions like alert
    // aren't supported. They return false on IE (#2968).
    isFunction: function( obj ) {
        return osapi.jive.type(obj) === "function";
    },

    isArray: Array.isArray || function( obj ) {
        return osapi.jive.type(obj) === "array";
    },

    isPlainObject: function( obj ) {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if ( !obj || osapi.jive.type(obj) !== "object" || obj.nodeType || osapi.jive.isWindow( obj ) ) {
            return false;
        }

        // Not own constructor property must be Object
        if ( obj.constructor &&
            !Object.prototype.hasOwnProperty.call(obj, "constructor") &&
            !Object.prototype.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.

        var key;
        for ( key in obj ) {}

        return key === undefined || Object.prototype.hasOwnProperty.call( obj, key );
    },

    type: function( obj ) {
        return obj == null ?
            String( obj ) :
            osapi.jive.class2type[ Object.prototype.toString.call(obj) ] || "object";
    },

    class2type: {},

    // A crude way of determining if an object is a window
    isWindow: function( obj ) {
        return obj && typeof obj === "object" && "setInterval" in obj;
    },

    // args is for internal usage only
    each: function( object, callback, args ) {
        var name, i = 0,
            length = object.length,
            isObj = length === undefined || osapi.jive.isFunction( object );

        if ( args ) {
            if ( isObj ) {
                for ( name in object ) {
                    if ( callback.apply( object[ name ], args ) === false ) {
                        break;
                    }
                }
            } else {
                for ( ; i < length; ) {
                    if ( callback.apply( object[ i++ ], args ) === false ) {
                        break;
                    }
                }
            }

            // A special, fast, case for the most common use of each
        } else {
            if ( isObj ) {
                for ( name in object ) {
                    if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
                        break;
                    }
                }
            } else {
                for ( ; i < length; ) {
                    if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
                        break;
                    }
                }
            }
        }

        return object;
    },

    // arg is for internal usage only
    map: function( elems, callback, arg ) {
        var value, key, ret = [],
            i = 0,
            length = elems.length,
            isArray = osapi.jive.isArray( elems );

        // Go through the array, translating each of the items to their
        if ( isArray ) {
            for ( ; i < length; i++ ) {
                value = callback( elems[ i ], i, arg );

                if ( value != null ) {
                    ret[ ret.length ] = value;
                }
            }

            // Go through every key on the object,
        } else {
            for ( key in elems ) {
                value = callback( elems[ key ], key, arg );

                if ( value != null ) {
                    ret[ ret.length ] = value;
                }
            }
        }

        // Flatten any nested arrays
        return ret.concat.apply( [], ret );
    }

});

// Populate the class2type map
osapi.jive.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
    osapi.jive.class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

osapi.jive.extend(osapi.jive, {

    /*
     * jive.namespace(name[, obj = {}]) -> obj
     * - name (String): New namespace to create under `jive`.
     *
     * Creates a new namespace under `jive` and returns it.  If the given
     * namespace is already defined returns the existing value.
     *
     * The name of the new namespace may contain dots (.) in which case nested
     * namespaces are conditionally created for each component of the name.
     */
    namespace: function(name, obj) {
        var parts = name.split('.'),
            space = this,
            i;
        for (i = 0; i < parts.length; i += 1) {
            if (typeof(space[parts[i]]) === 'undefined') {
                if (i == parts.length - 1 && typeof(obj) != 'undefined') {
                    space[parts[i]] = obj;
                } else {
                    space[parts[i]] = {};
                }
            }
            space = space[parts[i]];
        }
        return space;
    }
});
