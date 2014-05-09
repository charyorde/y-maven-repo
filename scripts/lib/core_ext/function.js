/**
 * Core extensions for Function
 *
 * Much of this code is borrowed from Functional JavaScript[1] which is
 * Copyright 2007 by Oliver Steele and is licensed under the MIT license[2].
 *
 * [1]: http://osteele.com/sources/javascript/functional/
 * [2]: http://osteele.com/sources/javascript/functional/MIT-LICENSE
 **/

/*globals _ */

if (typeof(_) == 'undefined') {
    _ = undefined;
}

/**
 * Function#bind(object[, a[, b[, c, ...]]]) -> Function
 *
 * Returns a copy of the original function such that when the copy is invoked
 * it will run as a method of `object` no matter what context it was invoked
 * in.  Additional optional arguments to `bind` act as curried arguments on the
 * copied function.
 */
if (!Function.prototype.bind) {
    Function.prototype.bind = function(object/*, args... */) {
        var fn = this;
        var args = Array.prototype.slice.call(arguments, 1);
        return function() {
            return fn.apply(object, args.concat(Array.prototype.slice.call(arguments, 0)));
        };
    };
}

if (!Function.prototype.curry) {
    /**
     * Creates a function that applies the original arguments, then the remaining arguments
     *
     * @param {mixed} [args] original arguments
     * @returns {function}
     */
    Function.prototype.curry = function() {
        var fn   = this,
            args = Array.prototype.slice.call(arguments);

        return function() {
            var _arguments = args.concat(Array.prototype.slice.call(arguments));
            return fn.apply(this, _arguments);
        };
    };
}

/**
 * Function#partial([a[, b[, c, ...]]]) -> Function
 * 
 * Returns a copy of the original function with one or more argument positions
 * filled in.  For example, given a function `add` that returns the sum of its
 * arguments you could define a function that increments its argument by one
 * like this:
 *
 *     var inc = add.partial(1);
 *     inc(2);  //=> 3
 * 
 * You can fill in arguments out of order by passing an undefined value to
 * `partial` for argument positions that should not be filled in.  For your
 * convenience, `_` is defined as an undefined value.  For example:
 *
 *     var dec = subtract(_, 1);
 *     dec(2);  //=> 1
 **/
if (!Function.prototype.partial) {
    Function.prototype.partial = function(/*args*/) {
        var fn = this,
            args = Array.prototype.slice.call(arguments),
            i;
        //substitution positions
        var subpos = [], value;
        for (i = 0; i < args.length; i += 1) {
            if (typeof(args[i]) == 'undefined') { subpos.push(i); }
        }
        return function() {
            var specialized = args.concat(Array.prototype.slice.call(arguments, subpos.length)),
                i;
            for (i = 0; i < Math.min(subpos.length, arguments.length); i += 1) {
                specialized[subpos[i]] = arguments[i];
            }
            for (i = 0; i < specialized.length; i += 1) {
                if (typeof(specialized[i]) == 'undefined') {
                    return fn.partial.apply(fn, specialized);
                }
            }
            return fn.apply(this, specialized);
        };
    };
}

/**
 * Function#aritize(n) -> Function
 * - n (Number): fixed arity for the new function
 * 
 * Returns a copy of the original function but with a fixed arity.  For
 * example, given an `add` function that returns the sum of its arguments you
 * can define a function that returns the sum of only its first two arguments
 * like this:
 *
 *     add(1,1,1,1);            //=> 4
 *     var binary_add = add.aritize(2);
 *     binary_add(1, 1);        //=> 2
 *     binary_add(1, 1, 1, 1);  //=> 2
 **/
if (!Function.prototype.aritize) {
    Function.prototype.aritize = function(n) {
        var fn = this;
        return function() {
            return fn.apply(this, Array.prototype.slice.call(arguments, 0, n));
        };
    };
}

/**
 * Pass the result of the target function to another function (afterFn).
 *
 * For example:
 *      var addOne   = function(a) { return a + 1; }
 *      var timesTwo = function(a) { return a * 2; }
 *
 *      // (3 + 1) * 2
 *      addOne.sequence(timesTwo)(3) => 8
 *
 * @param {function} afterFn
 * @returns {function}
 */
if (!Function.prototype.sequence) {
    Function.prototype.sequence = function(afterFn) {
        var fn = this;
        return function() {
            return afterFn.call(this, fn.apply(this, Array.prototype.slice.call(arguments)));
        };
    };
}

/**
 * Creates a function that will wait for a specified interval before executing.
 *
 * @param {number} [delayInMs=0] the amount of time (in milliseconds) to wait before calling the function.
 * @returns {function}
 */
Function.prototype.delayed = function(delayInMs) {
    var fn = this;

    return function() {
        var args    = Array.prototype.slice.call(arguments),
            context = this;

        setTimeout(function() {
            fn.apply(context, args);
        }, delayInMs || 0);
    };
};