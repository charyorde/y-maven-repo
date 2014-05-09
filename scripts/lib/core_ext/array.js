/*extern $j */

/**
 * Array#inject(init, fun[, thisp]) -> a
 * - init (Object): initial value
 * - fun (Function(accumulator, element, index) -> a)
 *   - accumulator (a): result of application of `fun` to the previous
 *   array element, or `init` for the first application
 *   - element (b): an element from the array
 *   - index (Number): index of `element` in the array
 * - thisp (Object): context in which fun will be invoked - `this` in `fun`
 *   will refer to `thisp`.
 *
 * Applies `fun` to `init` and the first element of the array, and then to the
 * result and the second element, and so on.  Returns the result of applying
 * `fun` to the accumulated value and the last element of the array.
 *
 * The 'inject' algorithm is also known as 'reduce' and 'fold'.
 *
 * This definition is compatible with the definition of `Array#inject` in the
 * Prototype library.  It is *not* compatible with the definitions of
 * `Array#reduce` in the Prototype library or in JavaScript 1.6 in
 * Spidermonkey.
 *
 * This method is provided for compatibility with Prototype, because Prototype
 * defines a method called `Array#reduce` that is not actually a reduce
 * function.
 **/
if (!Array.prototype.inject) {
    Array.prototype.inject = function(init, fun, thisp) {
        var len = this.length >>> 0,
        result = init,
        i;

        if (typeof fun != "function") {
            throw new TypeError();
        }

        for (i = 0; i < len; i += 1) {
            result = fun.apply(thisp, [result, this[i], i]);
        }
        return result;
    };
}

/**
 * Array#first() -> Object
 *
 * Returns the first element of an array.
 **/
if (!Array.prototype.first) {
    Array.prototype.first = function() {
        return this[0];
    };
}

/**
 * Array#last() -> Object
 *
 * Returns the last element of an array.
 **/
if (!Array.prototype.last) {
    Array.prototype.last = function() {
        var len = this.length >>> 0;
        return this[len - 1];
    };
}

/**
 * Array#unique() -> Array
 *
 * Returns a new array where all duplicate items have been removed
 */
if (!Array.prototype.unique) {
    Array.prototype.unique = function unique() {
        var arr = this;
        return this.filter(function(item, i) { return $j.inArray(item, arr) >= i; });
    };
}

/**
 * Array#flat() -> Array
 *
 * Returns a new version of this array which has been flattened Flattening
 * turns an array like [[1,2,3], [4,5,6], [7,8,9]]; into one like
 * [1,2,3,4,5,6,7,8,9];
 **/
if (!Array.prototype.flat) {
    Array.prototype.flat = function() {
        return this.inject([], function(l, e) {
            if ($j.isArray(e)) {
                e.map(function(ee) { l.push(ee); });
            } else {
                l.push(e);
            }
            return l;
        });
    };
}

/**
 * Array#zip(otherArray[, thirdArray ...]) -> Array
 *
 * Returns a new array by combining the receiver with any arguments.  For each
 * index in the receiver the new array has a nested array of the elements from
 * the receiver, `otherArray`, and so on at the same index.  For example:
 *
 *     [1,2,3].zip([4,5,6], [7,8,9,10]) //=> [[1,4,7], [2,5,8], [3,6,9]]
 *
 * If one of the arguments is shorter than the receiver then `null` is
 * substituted for any missing values.
 **/
if (!Array.prototype.zip) {
    Array.prototype.zip = function(/* args */) {
        var args = [this].concat(Array.prototype.slice.call(arguments, 0));
        return this.map(function(e, i) {
            return args.map(function(a) {
                return typeof a[i] != 'undefined' ? a[i] : null;
            });
        });
    };
}
