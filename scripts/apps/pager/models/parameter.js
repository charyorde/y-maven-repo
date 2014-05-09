/*extern jive $j */

jive.namespace('Pager');

jive.Pager.Parameter = function(key, default_value) {
    var value = default_value,
        numeric = Number(default_value) === default_value,
        array   = $j.isArray(default_value);

    // Given a number, or a reference like 'next', updates the internal value
    // with the appropriately.
    function set_numeric_value(n) {
        switch(n) {
        case 'next':
            set_numeric_value(value + 1);
            break;
        case 'previous':
            set_numeric_value(value - 1);
            break;
        case 'first':
            set_numeric_value(1);
            break;
        default:
            if (Number(n) === n || n && n.match && n.match(/^[0-9]+/)) {
                value = Number(n);
                if (value < 1) {
                    value = 1;
                }
            } else {
                value = default_value;
            }
        }
    }

    function set_array_value(l) {
        if (l) {
            if (typeof(l.split) == 'function') {
                value = l.split('+');
            } else {
                value = l;
            }
        } else {
            value = default_value;
        }
    }

    function set_value(v) {
        if (typeof(v) != 'undefined') {
            value = v;
        } else {
            value = default_value;
        }
    }

    // Read-only attributes.  Or at least changing these values will have no
    // effect and they will be reset after every `set()` call.

    /**
     * jive.Pager.Parameter#key -> String
     *
     * Read-only key attribute.
     **/
    this.key = key;

    /**
     * jive.Pager.Parameter#value -> Object
     *
     * Read-only value attribute.
     **/
    this.value = value;

    /**
     * jive.Pager.Parameter#value -> Object
     *
     * Read-only default value attribute.
     **/
    this.default_value = default_value;

    /**
     * jive.Pager.Parameter#set(val) -> val
     * - val (Object): new parameter value to set
     * 
     * Sets `val` as the new parameter value.  
     *
     * If the parameter is numeric `val` will be cast to a Number and the
     * special values 'next', 'previous', 'first', will increment, decrement,
     * and reset the value to 1 respectively.
     *
     * If the parameter has an array value and `val` is a String it will be
     * treated as a plus sign-delimited list.
     **/
    this.set = function(val) {
        if (numeric) {
            set_numeric_value(val);
        } else if (array || $j.isArray(val) || (val && typeof val.match == 'function' && val.match(/\+/))) {
            set_array_value(val);
        } else {
            set_value(val);
        }
        this.key           = key;
        this.value         = value;
        this.default_value = default_value;
        return value;
    };
};

jive.Pager.Parameter.prototype = {

    /**
     * jive.Pager.Parameter#add(val) -> Array
     * - val (Object): value to append
     *
     * If the parameter value is an array appends `val` to that value.
     * Otherwise throws a `TypeError`.
     **/
    add: function(val) {
        if (!$j.isArray(this.value)) {
            throw new TypeError();
        }
        return this.set(this.value.concat(val).unique());
    },

    /**
     * jive.Pager.Parameter#remove(val) -> Array
     * - val (Object): value to remove
     *
     * If the parameter value is an array removes an occurrences of `val` from
     * that value.  Otherwise throws a `TypeError`.
     **/
    remove: function(val) {
        if (!$j.isArray(this.value)) {
            throw new TypeError();
        }
        return this.set(this.value.filter(function(v) { return v !== val; }));
    },

    /**
     * jive.Pager.Parameter#unset() -> undefined
     *
     * Sets the parameter value to `undefined`.
     **/
    unset: function() {
        return this.set();
    }
};
