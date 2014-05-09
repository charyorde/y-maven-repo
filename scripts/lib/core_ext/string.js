/*extern $j */

/**
 * String#startsWith(prefix) -> boolean
 * - prefix (String): substring to check
 *
 * Returns true if the given string argument exactly matches the beginning of
 * the receiver string.
 *
 * This implementation comes from the Prototype JavaScript framework.
 **/
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(prefix) {
        return this.indexOf(prefix) === 0;
    };
}

/**
 * String#endsWith(suffix) -> boolean
 * - suffix (String): substring to check
 *
 * Returns true if the given string argument exactly matches the end of the
 * receiver string.
 *
 * This implementation comes from the Prototype JavaScript framework.
 **/
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(suffix) {
        var d = this.length - suffix.length;
        return d >= 0 && this.lastIndexOf(suffix) === d;
    };
}


/**
 * Creates a new, camel-cased string from an existing string. For example, 'margin-right' becomes 'marginRight'.
 *
 * @param separator {string} (optional) used to break apart the string. defaults to hyphen (-)
 * @requires String.prototype.capitalize
 * @return {string}
 **/
if (!String.prototype.camelize) {
    String.prototype.camelize = function(separator) {
        var pieces = this.toLowerCase().split(separator || '-');
        for (var i=1; i < pieces.length; i++) {
            pieces[i] = pieces[i].capitalize();
        }

        return pieces.join('');
    };
}


/**
 * Creates a new string with the first letter capitalized and subsequent letters lowercased. For
 * example, 'test' becomes 'Test'.
 *
 * @return {string}
 **/
if (!String.prototype.capitalize) {
    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
    };
}

/**
 * Trims whitespace from the ends of a string.
 *
 * @return {string}
 **/
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}
