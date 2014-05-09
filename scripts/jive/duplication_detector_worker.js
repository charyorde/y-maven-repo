/*globals self */

var sourcePattern = /['"][^'"]+\.js['"]/gi;
var counts = {};

function countSource(source) {
    var count = counts[source] || 0;
    counts[source] = count + 1;
}

function parseSources(body) {
    return (body.match(sourcePattern) || []).map(function(source) {
        return source.slice(1, -1);
    });
}

self.addEventListener('message', function(e) {
    var message = e.data == '$' ? e.data : JSON.parse(e.data);

    if (message == '$') {
        self.postMessage(JSON.stringify({ counts: counts }));
        self.close();
        return;

    } else if (message.source) {
        countSource(message.source);

    } else if (message.body) {
        parseSources(message.body).forEach(function(source) {
            countSource(source);
        });
    }

    self.postMessage(JSON.stringify({ ready: true }));
}, false);
