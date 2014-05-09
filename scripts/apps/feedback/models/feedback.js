define('jive.Feedback.Feedback', function() {
return function(data) {
    var maxDepth = 4
      , $ = jQuery;

    function capture(object, depth) {
        depth = depth || 1;
        var target, key, i, len, capturedValue;

        try {
            if (depth > maxDepth) {
                return null;
            } else if ($.isFunction(object)) {
                target = 'function';
            } else if ($.isArray(object)) {
                target = [];
                len = object.length;
                for (i = 0; i < len; i += 1) {
                    target.push(capture(object[i], depth + 1));
                }
            } else if (object && typeof object == 'object') {
                target = {};
                for (key in object) {
                    capturedValue = capture(object[key], depth + 1);
                    if (capturedValue !== null && key != 'enabledPlugin' && key != 'mimeTypes') {
                        target[key] = capturedValue;
                    }
                }
            } else {
                target = object;
            }
        } catch(_) {
            target = null;
        }

        return target;
    }

    this.name = data.name;
    this.email = data.email;
    this.comments = data.comments;
    this.currentURL = window.location.href;
    this.referringURL = document.referrer;
    this.browserInfo = capture(navigator);
};
});
