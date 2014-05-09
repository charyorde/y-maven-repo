/*jslint browser:true */
/*extern jive $j */

jive.app('WidgetPager');

/**
 * jive.WidgetPager
 *
 * Support class for widgets that need to be paginated.
 */
jive.WidgetPager.Main = function(container, options) {
    jive.conc.observable(this);

    var $container    = $j(container),
        tableSelector = options.resultTableSelector || '.jive-table-activity',
        listActionUrl = options.listActionUrl,
        pagerState    = Object.create(options.initialState),  // stores a copy of initialState
        self          = this;

    if (typeof pagerState.start == 'undefined') {
        // Assume the first page has already been loaded if not specified
        // otherwise.
        pagerState.start = pagerState.numResults;
    }

    function hideMoreLink() {
        $container.find('.jive-more-content').hide();
    }

    /**
     * Looks for a hidden input in `responseText` that indicates whether there
     * are more results available after those in `responseText`.  Returns true
     * or false depending on the value of that hidden input.
     */
    function moreResults(responseText) {
        var more = $j(responseText)
            .find('[name=moreResultsAvailable]').andSelf()
            .filter('[name=moreResultsAvailable]');
        return more.val() != 'false';
    }

    /**
     * Returns a reference to the element that loaded results should be appended to.
     */
    function resultTable() {
        var $table = $container.find(tableSelector).filter(':first'),
            $tbody = $table.find('tbody:first');
        return $tbody.length > 0 ? $tbody : $table;
    }

    $container.find('.jive-more-content').click(function() {
        $j.ajax({
            url: listActionUrl,
            type: 'GET',
            dataType: 'html',
            data: pagerState,
            success: function(responseText) {
                var more = moreResults(responseText);

                // Find all table rows in the server response and append them
                // to the results table.
                var $trElems = $j('tr', responseText);
                // javascript could be moved from the dom outside of tr elements, remove any script tags and re-add to the dom below
                $trElems.find('script').remove();
                $trElems.appendTo(resultTable());
                // re-add script tags
                var jsElems = responseText.match(/<script[^>]*>([^<])*<\/script>/g);
                if(jsElems != null){
                    jsElems.forEach(function(jsElem){
                        $j(document.body).append(jsElem);
                    });
                }
                pagerState.start += pagerState.numResults;

                if (!more) {
                    hideMoreLink();
                }

                self.emit('load', responseText, more);
            },
            error: function(xhr, textStatus, errorThrown) {
                self.emit('error', xhr, textStatus, errorThrown);
            }
        });
        return false;
    });
};
