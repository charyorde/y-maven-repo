/**
 * This code creates a filter that removes obfuscation from JSON data.  This
 * filter will automatically apply to responses from every ajax request for
 * JSON data that is handled by jQuery.
 *
 * The purpose of obfuscating JSON data is to avoid CSRF vulnerabilities by
 * preventing JSON data from being executable.
 * http://en.wikipedia.org/wiki/Cross-site_request_forgery
 */
jQuery.ajaxSetup({
    dataFilter: function(data, type) {
        return (type === 'json' && data) ? jQuery.trim(data.replace(/^throw [^;]*;/, '')) : data;
    },

    'beforeSend' : function(xhr) {
        // token should be globally defined on all pages
        if (typeof _jive_auth_token != 'undefined') {
            xhr.setRequestHeader('X-J-Token', _jive_auth_token);
        }
    }

});
