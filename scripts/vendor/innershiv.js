/*global soy */

// http://jdbartlett.github.com/innershiv
var innerShiv = (function() {
    var d, r;

    return function(h, u, doc) {
        doc = doc || document;

        if (!d) {
            d = doc.createElement('div');
            r = doc.createDocumentFragment();
            /*@cc_on d.style.display = 'none';@*/
        }

        var e = d.cloneNode(true);
        /*@cc_on doc.body.appendChild(e);@*/
        e.innerHTML = h.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        /*@cc_on doc.body.removeChild(e);@*/

        if (u === false) { return e.childNodes; }

        var f = r.cloneNode(true), i = e.childNodes.length;
        while (i--) { f.appendChild(e.firstChild); }

        return f;
    };
}());

// patch soy to apply innerShiv automatically
if (typeof soy != 'undefined' && soy.StringBuilder) {
    (function() {
        var proto = soy.StringBuilder.prototype
          , expr = /^[^<]*(<[\w\W]+>)[^>]*$/;

        proto.toStringWithoutInnerShiv = proto.toString;
        proto.toStringWithInnerShiv = function() {
            var str = proto.toStringWithoutInnerShiv.apply(this, arguments)
              , ret;
            if (str.match(expr)) {
                ret = jQuery(innerShiv(str, false));
                // allow jQuery object to masquerade as a string
                ret.toString = function() { return str; };
                return ret;
            } else {
                return str;
            }
        };

        proto.toString = proto.toStringWithInnerShiv;
    })();
}
