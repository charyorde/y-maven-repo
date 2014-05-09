/*jslint browser:true */
/*globals jive $j tinymce */
/*globals jiveToggleTab i18nStrings */

jive.namespace('rte.ContentPicker');
jive.rte.ContentPicker.MainPage = function(controller) {
    var that = this;

    // Listen for tab switch events.
    function activateTabs(tabs) {
        var id;

        tabs.map(function(tab) {
            id = tab + '-tab';
            $j('#' + id + ' a').click(function() {
                jiveToggleTab(tab, tabs.filter(function(t) { return t != tab; }));
                return false;
            });
        });
    }

    // The URL entry text box is set up as part of a form for UI niceness.  For
    // example you can insert the URL by pressing Enter.
    function interceptURLFormSubmission(form) {
        $j(form).submit(function() {
            var address = $j(this).find('input[type=text]').val();
            if (tinymce.isIE) {
                // Pushing `addWebLink` call out of the event handler with
                // `window.setTimeout` reduces the severity of an IE6 bug that
                // is triggered when the form is submitted by a keyboard event.
                // See CS-8688.
                window.setTimeout(function() { controller.addWebLink(address); }, 1);
            } else {
                controller.addWebLink(address);
            }

            return false;
        });
    }

    function highlightOnHover(selector) {
        var elem = $j(selector),
            className = 'search-result-row-hover';
        elem.mouseover(function() {
            $j(this).addClass(className);
        });
        elem.mouseout(function() {
            $j(this).removeClass(className);
        });
    }

    function toggleSearchExcerpts() {
        $j('.jive-search-result-moreless a').click(function() {
            var excerpt = $j(this).parents('.search-result-row').find('.jive-search-result-excerpt'),
                toggle  = $j(this);
            if (excerpt.is(':visible')) {
                excerpt.hide();
                toggle.html(i18nStrings.contentpickerShowExcerptLink);
            } else {
                excerpt.show();
                toggle.html(i18nStrings.contentpickerHideExcerptText);
            }
            return false;
        });
    }

    function handleSearch() {
        $j('[name=searchform]').submit(function() {
            var submit = $j(this).find(':submit');
            submit.prop('disabled', true);
            submit.val(i18nStrings.globalSearching + '...');
            this.submit();
            return false;
         });
    }

    // Retrieves specific details of a result that are stored in a hidden input
    // with the result.
    function getResultContent(result) {
        var content = {};
        $j(result).find('input').each(function(i, e) {
            content[e.name] = e.value;
        });
        return content;
    }

    function highlight(elem, className) {
        // Remove selected class from other results.
        $j('.' + className).removeClass(className);

        // Apply selected class to this result.
        $j(elem).addClass(className);
    }

    function formatTitle(title) {
        if (title.length > 100) {
            title = title.substr(0, 70) + "...";
        }
        return title;
    }

    // Abstracts common behavior for handling search result and history result
    // clicks.
    function handleResultClicks(selector, selected_class, title_selector) {
        $j(selector).click(function() {
            var content, title;

            // Retrieve specific details of the result that are stored in a
            // hidden input with the result.
            content = getResultContent(this);
            title = content.title;

            // Check the checkbox for this result.
            $j(this).find('input[name=result]').prop('checked', true);

            // Apply selected class to this result.
            highlight(this, selected_class);

            // Set the search result title.
            $j(title_selector).html(formatTitle(title));
        });
    }

    function handleSearchResultClicks() {
        handleResultClicks(
            '#jive-search-results-content .search-result-row',
            'search-result-row-select',
            '#jive-search-selection-title');
    }

    function handleHistoryResultClicks() {
        handleResultClicks(
            '#jive-history .search-result-row',
            'history-row-select',
            '#jive-history-selection-title');
    }

    function handleInsert(submit_selector, controller_method) {
        $j(submit_selector).submit(function() {
            var result = $j(this).find('.search-result-row:has(:checked)'),
                content = getResultContent(result);
            controller.addContentMacro(content.objectType, content.objectID);
            return false;
        });
    }
    
    // Initialize event handlers.
    activateTabs(['jive-web', 'jive-search', 'jive-history']);
    interceptURLFormSubmission('#jive-web form');
    handleSearch();
    highlightOnHover('.search-result-row');
    toggleSearchExcerpts();
    handleSearchResultClicks();
    handleHistoryResultClicks();
    handleInsert('#jive-insert-search-result, #jive-insert-history-result');

};
