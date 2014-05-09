
/*
	 *	jquery.suggest 1.3 - 2009-05-28
	 *
	 *  Original Script by Peter Vulgaris (www.vulgarisoip.com)
	 *  Updates by Chris Schuld (http://chrisschuld.com/)
	 *  Updates by Jive Software to allow client side searches
	 */

(function($) {
    $.suggest = function(input, options) {

        var $input = $(input).attr("autocomplete", "off");
        var $results;

        var timeout = false;		// hold timeout ID for suggestion results to appear
        var prevLength = 0;			// last recorded length of $input.val()
        var cache = [];				// cache MRU list
        var cacheSize = 0;			// size of cache in chars (bytes?)

        // Automatically switch between looking for suggestions from a local
        // data structure or from a URL based on the type of source option that
        // is given.
        if ($.isArray(options.source)) {
            $input.data("results", options.source);
            options.clientSearch = true;
        }

        if( ! options.attachObject )
            options.attachObject = $(document.createElement("ul")).appendTo('body');

        $results = $(options.attachObject);
        $results.addClass(options.resultsClass);

        resetPosition();
        $(window)
            .load(resetPosition)		// just in case user is changing size of page while loading
            .resize(resetPosition);


        // handle focus/blur events
        $input.focus(function() {
            var container = $input.closest('.j-js-picker-container')[0];

            $(document.body).off('click.suggestPlugin').on('click.suggestPlugin', function(e) {
                if (container && !$.contains(container, e.target)) {
                    $(document.body).off('click.suggestPlugin');
                    $results.hide();
                }
            });
        });


        // help IE users if possible
        try {
            $results.bgiframe();
        } catch(e) { }


        // I really hate browser detection, but I don't see any other way
        if ($.browser.mozilla)
            $input.keypress(processKey);	// onkeypress repeats arrow keys in Mozilla/Opera
        else
            $input.keydown(processKey);		// onkeydown repeats arrow keys in IE/Safari

        /**
         * Utility method to encode a string which will be used in a regular expression.
         *
         * @param s the string which is to be encoded.
         */
        function encodeRegExp(s) { return s.replace(/([.*+?\^${}()|\[\]\/\\])/g, '\\$1'); }

        function resetPosition() {
            if ($.isFunction(options.position)) {
                options.position($input, $results);
            } else {
                // requires jquery.dimension plugin
                var offset = $input.offset();
                $results.css({
                    top: (offset.top + input.offsetHeight) + 'px',
                    left: offset.left + 'px'
                });
            }
        }


        function processKey(e) {

            // handling up/down/escape requires results to be visible
            // handling enter/tab requires that AND a result to be selected
            if ((/27$|38$|40$/.test(e.keyCode) && $results.is(':visible')) ||
                (/^13$|^9$/.test(e.keyCode) && getCurrentResult())) {

                if (e.preventDefault)
                    e.preventDefault();
                if (e.stopPropagation)
                    e.stopPropagation();

                e.cancelBubble = true;
                e.returnValue = false;

                switch(e.keyCode) {

                    case 38: // up
                        prevResult();
                        break;

                    case 40: // down
                        nextResult();
                        break;

                    case 9:  // tab
                    case 13: // return
                        var $currentResult = getCurrentResult();
                        if ($currentResult) {
                            selectCurrentResult.apply($currentResult);
                        }
                        break;

                    case 27: //	escape
                        $results.hide();
                        break;

                }

            } else if ($input.val().length != prevLength) {

                if (timeout)
                    clearTimeout(timeout);
                timeout = setTimeout(function(){suggestLimited(options.limit);}, options.delay);
                prevLength = $input.val().length;
            }
        }

        function getQuery($input) {
            var raw = $input.val(),
                value;
            if (options.multiple) {
                value = raw.split(options.multipleSeparator).last();
            } else {
                value = raw;
            }
            return $.trim(value);
        }

        function serverParams(query) {
            var params = $.extend({}, options.extraParams);
            params[options.paramName] = query;
            if (options.transformParams) {
                options.transformParams(params);
            }
            return params;
        }

        function suggest() {
            suggestLimited(Number.MAX_VALUE);
        }

        function suggestLimited(limit) {
            var q = getQuery($input);
            var results = $input.data("results");
            if (q.length >= options.minchars) {
                var cached = checkCache(q);

                if (cached && options.useCache === true) {
                    displayLimitedItems(cached['items'], limit);
                } else {
                    if (options.clientSearch && results && options.useCache === true) {
                        parseLimitedResults(results, q, limit);
                    }
                    else {
                        $.ajax({
                            url: options.source,
                            type: options.requestMethod,
                            data: serverParams(q),
                            success: function(txt) {
                                $input.data("results", txt);
                                parseLimitedResults(txt, q, limit);
                            }
                        });
                    }
                }

            } else {
                $results.hide();
            }
        }

        function parseResults(txt, q) {
            parseLimitedResults(txt, q, Number.MAX_VALUE);
        }

        function parseLimitedResults(txt, q, limit) {
            $results.hide();

            var items = parse(txt, q);

            displayLimitedItems(items, limit);
            addToCache(q, items, txt.length);
        }


        function checkCache(q) {
            for (var i = 0; i < cache.length; i++)
                if (cache[i]['q'] == q) {
                    cache.unshift(cache.splice(i, 1)[0]);
                    return cache[0];
                }

            return false;

        }

        function addToCache(q, items, size) {

            while (cache.length && (cacheSize + size > options.maxCacheSize)) {
                var cached = cache.pop();
                cacheSize -= cached['size'];
            }

            cache.push({
                q: q,
                size: size,
                items: items
                });

            cacheSize += size;

        }

        function displayLimitedItems(items, limit) {
            if (!items)
                return;

            if (!items.length) {
                $results.hide();
                return;
            }

            if (items.length < limit) {
                limit = items.length;
            }

            // Sort the items by the given sort function if one is present in
            // the options.
            if ($.isFunction(options.sort)) {
                items.sort(function(item_a, item_b) {
                    return options.sort(item_a.originalValue[0], item_b.originalValue[0]);
                });
            }

            resetPosition();
            $results.html('');
            for (var i = 0; i < limit; i++) {
                var value = options.template;
                var valueArray = items[i]['value'];
                var original = items[i]['originalValue'];
                var selectedByDeafult = items[i]['selectedByDeafult'];
                for (var k = 0; k < original.length; k++) {
                    var toReplaceOriginal = "%\\{" + k + "\\}";
                    value = value.replace(new RegExp( toReplaceOriginal, "g" ), original[k]);
                }
                for (var j = 0; j < valueArray.length; j++) {
                    var toReplace = "\\{" + j + "\\}";
                    value = value.replace(new RegExp( toReplace, "g" ), valueArray[j]);
                }
                var $result = $('<li>' + value + '</li>');
                if (options.liClass != '') {
                    $result.addClass(options.liClass);
                }
                if (selectedByDeafult || items.length <= 1) {
                    $result.addClass(options.selectClass);
                }
                $result.data('key', items[i]['key']);
                $result.data('value', original[0]);
                $results.append($result);
            }

            $results.show();

            $results
                .children('li')
                .mouseover(function() {
                    $results.children('li').removeClass(options.selectClass);
                    $(this).addClass(options.selectClass);
                })
                .click(function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    selectCurrentResult.apply(this);
                });

            nextResult();
        }

        function displayItems(items) {
            displayLimitedItems(items, Number.MAX_VALUE);
        }

        function parse(data, q) {
            var transformed = options.transformData ? options.transformData(data) : data;
            if ($.isArray(transformed)) {
                return parseArray(transformed, q);
            } else {
                return parseTxt(transformed, q);
            }
        }

        function parseArray(tokens, q) {
            var qRegEx = new RegExp(encodeRegExp(q), 'ig');
            return tokens.map(parseToken.partial(_, qRegEx)).filter(function(item) {
                var hasMatch = item.value.some(function(value) {
                    return value.match(qRegEx) || !options.clientSearch;
                });
                return hasMatch && item.value.length > 0;
            });
        }

        function parseTxt(txt, q) {
            var tokens = txt.split(options.delimiter);
            return parseArray(tokens, q);
        }

        function parseToken(token, qRegEx) {
            var parts  = $.isArray(token) ? token : $.trim(token).split(options.dataDelimiter),
                values = parts.slice(0, Math.max(parts.length - 1, 1)),  // All but the last part, but at least one part, are values.
                key    = parts.length > 1 ? parts.last() : '',  // If there are multiple parts the last one is a key.
                fullMatch = values.some(function(v) {
                    var matches = v.match(qRegEx);
                    return matches && matches[0].length == v;
                });
            return {
                value: values.map(highlightMatch.partial(_, qRegEx)).filter(function(value) {
                    return $.trim(value)
                }),
                key: key,
                originalValue: parts,
                selectedByDefault: fullMatch
            };
        }

        function highlightMatch(value, qRegEx) {
            function highlight(node) {
                return node.contents().map(function() {
                    var c;
                    if (this.nodeType == 3) {  // text nodes
                        return this.data.replace(qRegEx, '<span class="'+ options.matchClass +'">$&</span>')
                    } else {
                        $j(this).html(highlight($j(this), qRegEx));
                        c = $j('<div/>', { html: this });
                        return c.html();
                    }
                }).toArray().join('');
            }

            var content = $j('<div/>', { html: value });
            return highlight(content);
        }

        function getCurrentResult() {

            if (!$results.is(':visible')) {
                return false;
            }

            var $currentResult = $results.children('li.' + options.selectClass);

            if (!$currentResult.length) {
                $currentResult = false;
            }

            return $currentResult;

        }

        function selectCurrentResult() {
            var $currentResult = $(this);

            setValue($input, $currentResult.data("value"));
            $results.hide();
            $input.focus();
            $(document.body).off('click.suggestPlugin');

            if ($(options.dataContainer)) {
                $(options.dataContainer).val($currentResult.data("key"));
            }

            if (options.onSelect) {
                options.onSelect.call($input[0], $currentResult.data("key"), $currentResult.data("value"));
            }
        }

        // If 'multiple' option is true then appends the given value to
        // existing value of $input.  Otherwise replaces the value of $input
        // with the given value.
        function setValue($input, value) {
            var sep = options.multipleSeparator,
                oldVals, newVal;
            if (options.multiple) {
                oldVals = $input.val().split(sep).slice(0, -1);  // Eliminate partial entry of new value.
                newVal  = oldVals.concat([value, '']).join(sep);
            } else {
                newVal = value;
            }
            $input.val(newVal);
        }

        function nextResult() {

            var $currentResult = getCurrentResult();

            if ($currentResult)
                $currentResult
                    .removeClass(options.selectClass)
                    .next()
                        .addClass(options.selectClass);
            else
                $results.children('li:first-child').addClass(options.selectClass);

        }

        function prevResult() {

            var $currentResult = getCurrentResult();

            if ($currentResult)
                $currentResult
                    .removeClass(options.selectClass)
                    .prev()
                        .addClass(options.selectClass);
            else
                $results.children('li:last-child').addClass(options.selectClass);

        }

    };

    $.fn.suggest = function(source, options) {

        if (!source)
            return;

        options = options || {};
        options.source = source;
        options.delay = options.delay || 150;
        options.resultsClass = options.resultsClass || 'ac_results';
        options.selectClass = options.selectClass || 'ac_over';
        options.matchClass = options.matchClass || 'ac_match';
        options.liClass = options.liClass || '';
        options.minchars = options.minchars || 2;
        options.delimiter = options.delimiter || '\n';
        options.onSelect = options.onSelect || false;
        options.maxCacheSize = options.maxCacheSize || 65536;
        options.dataDelimiter = options.dataDelimiter || '\t';
        options.dataContainer = options.dataContainer || '#SuggestResult';
        options.attachObject = options.attachObject || null;
        options.clientSearch = options.clientSearch || false;
        options.template = options.template || "{0}";
        options.limit = options.limit && options.limit > 0 ? options.limit : Number.MAX_VALUE;
        options.multiple = options.multiple || false;  // whether to allow multiple auto-completed values in a field
        options.multipleSeparator = options.multipleSeparator || ", ";  // separator to put between values when using 'multiple' option
        options.sort = options.sort || null;
        options.paramName = options.paramName || 'q';  // parameter name associated with server queries
        options.extraParams = options.extraParams || {};  // extra parameters to be included in server queries - must be an object
        options.requestMethod = options.requestMethod || 'GET';
        options.transformData = options.transformData;  // Function to transform data suggest data before it is parsed by jquery.suggest.
        options.useCache = options.useCache || true;
        options.position = options.position;
        options.transformParams = options.transformParams || null;

        this.each(function() {
            $.suggest(this, options);
        });

        return this;

    };

})(jQuery);

