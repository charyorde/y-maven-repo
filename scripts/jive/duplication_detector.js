/*globals console Worker jive */

(function($) {
    var workerLocation = '/resources/scripts/jive/duplication_detector_worker.js';

    function init() {
        var worker = new Worker(jive.resource.url({ path: workerLocation }))
          , scripts = $('script').toArray()
          , len = scripts.length
          , i = 0;

        function pushScriptData() {
            if (i < len) {
                worker.postMessage(JSON.stringify(scriptData(scripts[i])));
                i += 1;
            } else {
                worker.postMessage('$');
            }
        }

        worker.addEventListener('message', function(e) {
            var message = JSON.parse(e.data);
            if (message.counts) {
                report(message.counts);
            } else {
                pushScriptData();
            }
        }, false);

        pushScriptData();
    }

    function scriptData(script) {
        if (script.src) {
            return { source: $(script).attr('src') };
        } else {
            return { body: $(script).html() };
        }
    }

    function report(counts) {
        Object.keys(counts).forEach(function(source) {
            var count = counts[source];

            if (count > 1) {
                console.warn(source +' is referenced '+ count +' times!');
            }
        });
    }

    if (typeof Worker != 'undefined') {
        $(function() {
            try {
                init();
            } catch(e) {
                // Firefox 8.0 is not able to create web workers when
                // running on localhost.  Do not spam the log if we hit
                // that error.  Otherwise, display an error message.
                if (!e.toString().match(/Could not get domain/)) {
                    console.error('unable to initialize duplication_detector.js', e);
                }
            }
        });
    }
})(jQuery);
