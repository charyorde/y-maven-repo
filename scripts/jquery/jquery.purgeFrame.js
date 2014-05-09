/*
 * In IE up through version 8 adding an iframe to a page and removing it
 * produces a memory leak in some cases.  The pattern seems to be that
 * iframes that display an image produce leaks.  In IE7 that memory is
 * not reclaimed when the top page unloads.  In IE8 the memory is
 * usually mostly reclaimed when the top page unloads.
 *
 * This method cleans iframes before removing them to avoid memory
 * leaks.  This prevents a leak in certain cases - for example, when
 * loading //google.com/ in an iframe.  Unfortunately there are cases
 * where it does not help, such as //en.wikipedia.org/wiki/Memory_leak.
 */

(function($) {
    $.fn.purgeFrame = function() {
        var deferred;

        if ($.browser.msie && parseFloat($.browser.version, 10) < 9) {
            deferred = purge(this);
        } else {
            this.remove();
            deferred = $.Deferred();
            deferred.resolve();
        }

        return deferred;
    };

    function purge($frame) {
        var sem = $frame.length
          , deferred = $.Deferred();

        $frame.load(function() {
            var frame = this;
            frame.contentWindow.document.innerHTML = '';

            sem -= 1;
            if (sem <= 0) {
                $frame.remove();
                deferred.resolve();
            }
        });
        $frame.attr('src', 'about:blank');

        if ($frame.length === 0) {
            deferred.resolve();
        }

        return deferred.promise();
    }
})(jQuery);
