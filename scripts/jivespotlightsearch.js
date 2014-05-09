/**
 * @class
 * @param   {jQuery|DomElement|string}  spotlightSearchInput    Reference or
 * selector to the spotlight search input element - jive-userbar-search-field
 * @param   {jQuery|DomElement|string}  spotlightSearchContainer    Reference
 * or selector to the spotlight search results container - jive-spotlight-search-container
 * @param   {string}  spotlightSearchURL    The url to perform the search - action 'spotlight-search'
 * @param   {number}  containerType         The object type of the current container which may be filtered on
 * @param   {number}  containerID           The object id of the current container which may be filtered on
 *
 * @depends path=/resources/scripts/jive/search/search-metrics.js
 * @depends path=/resources/scripts/jive/xhr_stack.js
 */
define('JiveSpotlightSearch', ['jive.XhrStack'], function(XhrStack) {
    // get the type of search (content, people, places) for metrics
    $j.fn.searchType = function() {
        var list = $j(this).closest('ul');
        if (list.hasClass('j-content-results')) {
            return 'content';
        } else if (list.hasClass('j-people-list')) {
            return 'people';
        } else {
            return 'places';
        }
    };
    
    return jive.oo.Class.extend({
        init: function(spotlightContainer, spotlightSearchURL,
                             containerType, containerID)
        {
            var that = this;
            var metrics = this.metrics = new jive.search.SearchMetrics('spotlight-search');
            this.spotlightSearchContainer = spotlightContainer;
            this.spotlightSearchInput = spotlightContainer.find('input.jive-userbar-search-field');
            this.spotlightSearchResultsContainer = spotlightContainer.find('.j-spotlight-results');
            this.spotlightSearchURL = spotlightSearchURL;
            this.containerType = containerType;
            this.containerID = containerID;
            this.containerSearch = false;
            this.spotlightSearchInputHasFocus = false;

            this.spinner = {};
            this.queue   = new XhrStack();
            this.queue.addListener('success', this.showResults.bind(this));
            this.queue.addListener('error', this.handleAborts.bind(this));

            this.spotlightSearchIndex = 0;

            this.spotlightSearchInput.bind("keyup", this.observeSpotlightSearchQuery.bind(this));
            this.spotlightSearchInput.bind("blur", this.onBlur.bind(this));
            this.spotlightSearchResultsContainer.delegate(".jive-spotlight-global-search", "click", this.executeGlobalSpotlightSearch.bind(this));
            this.spotlightSearchResultsContainer.delegate(".jive-spotlight-container-search", "click", this.executeContainerSpotlightSearch.bind(this));
            this.spotlightSearchResultsContainer.delegate(".jive-spotlight-viewall", "click", function(e) {
                var filterContainer = $j(this).data("filterContainer");
                var currentUser = $j(this).data("currentUser");
                that.viewAllResults(filterContainer, currentUser);
                e.preventDefault();
            });
            this.spotlightSearchResultsContainer.delegate('ul a', 'click', function(e) {
                var index = $j(this).closest('li').prevAll().length;
                var type = $j(this).searchType();
                metrics.setChoice(type, index);
            });
        },

        observeSpotlightSearchQuery: function(event) {
            switch(event.keyCode) {
                case $j.keyCode.UP:
                    this.selectIndex(this.spotlightSearchIndex - 1);
                    return false;
                case $j.keyCode.DOWN:
                    this.selectIndex(this.spotlightSearchIndex + 1);
                    return false;
                case $j.keyCode.ENTER:
                    this.clearSpotlightSearchEvent();
                    $j.stop(event, true, true);
                    if (this.spotlightSearchIndex > 0) {
                        this.loadSelectedIndex();
                    }
                    return false;
                case $j.keyCode.ESCAPE:
                    this.clearSpotlightSearch();
                    return false;
                case $j.keyCode.LEFT:
                case $j.keyCode.RIGHT:
                case $j.keyCode.TAB:
                case $j.keyCode.HOME:
                case $j.keyCode.END:
                case $j.keyCode.PAGE_UP:
                case $j.keyCode.PAGE_DOWN:
                    return false;
            }

            this.clearSpotlightSearchEvent();
            this.spotlightSearchEvent = setTimeout(this.executeSpotlightSearch.bind(this), 800);
        },

        onBlur: function() {
            // needed to make click events working
            this.spotlightSearchInputHasFocus = false;
            setTimeout(this.clearSpotlightSearch.bind(this), 250);
        },

        clearSpotlightSearch: function() {
            if (!this.spotlightSearchInputHasFocus) {
                this.spotlightSearchResultsContainer.trigger('close');
            }
        },

        executeSpotlightSearch: function() {
            var query = $j(this.spotlightSearchInput).val()
              , searchContainer = this.spotlightSearchResultsContainer;

            if ((query.match(/[^\s]/g)||[]).length > 2) {
				query = $j.trim(query).replace(/\s+/g,' ').substr(0,128);
				while (query.length > 2 && query.match(/\s\w$/)) {
					query = $j.trim(query.substring(0, query.length - 2));
				}
				if (query.length > 2) {
					query = query + '*';
				} else {
					return;
				}
                this.spinner =  new jive.loader.LoaderView({showLabel: false, size: 'small'});
                this.spinner.appendTo(searchContainer);

                var request = {
                    containerType   : this.containerType,
                    containerID     : this.containerID,
                    filterContainer : this.containerSearch,
                    query           : $j.trim(query) + '*'
                };
                this.queue.add($j.get(this.spotlightSearchURL, request, 'html'));
                
                var params = {
                    filter: [ 'search(' + request.query + ')' ],
                    count: request.filterContainer ? 10 : 5
                };
                
                this.metrics.addQuery(new jive.search.SearchMetricsQuery('/api/core/v3/content?' + $j.param(params)), 'content');
                if (!request.filterContainer) {
                    this.metrics.addQuery(new jive.search.SearchMetricsQuery('/api/core/v3/people?' + $j.param(params)), 'people');
                    this.metrics.addQuery(new jive.search.SearchMetricsQuery('/api/core/v3/places?' + $j.param(params)), 'places');
                }
            } else {
                this.clearSpotlightSearch();
            }
            this.spotlightSearchIndex = 0;
        },

        executeContainerSpotlightSearch: function() {
            this.containerSearch = true;
            this.spotlightSearchInputHasFocus = true;
            setTimeout(this.executeSpotlightSearch.bind(this), 50);
            $j(this.spotlightSearchInput).focus();
        },

        executeGlobalSpotlightSearch: function() {
            this.containerSearch = false;
            this.spotlightSearchInputHasFocus = true;
            setTimeout(this.executeSpotlightSearch.bind(this), 50);
            $j(this.spotlightSearchInput).focus();
        },

        viewAllResults: function(filterOnContainer, userContainer) {
            var query = $j(this.spotlightSearchInput).val();
            if (query.length <= 0) {
                return;
            }
            query = query + '*';

            $j(this.spotlightSearchInput).val(query);
            this.submitQuery();
        },

        selectIndex: function(index) {
            if (index > 0) {
                var elem = $j('.spotlight-index-' + index).addClass("hover").get(0);
                if (elem) {
                    $j('.jive-spotlight-search li.hover:not(.spotlight-index-' + index +')').removeClass('hover');
                    var $elem = $j(elem);
                    var scrollTop = $j(window).scrollTop();
                    // calculate if the element is in view before calling scrollIntoView. Otherwise scrollIntoView seems to scroll regardless.
                    if (!(($elem.offset().top + $elem.height() >= scrollTop) && ($elem.offset().top <= scrollTop + $j(window).height()))) {
                        elem.scrollIntoView(false);
                    }
                    this.spotlightSearchIndex = index;
                }
            }
            else {
                $j('.jive-spotlight-search li.hover').removeClass('hover');
                $j(this.spotlightSearchInput)[0].scrollIntoView(false);
                this.spotlightSearchIndex = 0;
            }
        },

        loadSelectedIndex: function() {
            var elem = $j('.spotlight-index-' + this.spotlightSearchIndex)[0];
            if (elem && $j(elem).children("a")[0]) {
                location.href = $j(elem).children("a")[0].href;
            }
        },

        submitQuery: function() {
            if (this.containerSearch) {
                // update form, values come from jive constants
                if (this.containerType == 3 || this.containerType == 2020) {
                    this.spotlightSearchInput.find('input[name=userID]').val(this.containerID);
                }
                else {
                    this.spotlightSearchInput.find('input[name=containerType]').val(this.containerType);
                    this.spotlightSearchInput.find('input[name=container]').val(this.containerID);
                }
            }
            this.spotlightSearchContainer.find('form').submit();
        },

        clearSpotlightSearchEvent: function() {
            if (this.spotlightSearchEvent) {
                clearTimeout(this.spotlightSearchEvent);
            }
        },

        showResults: function(html) {
            var searchContainer = this.spotlightSearchResultsContainer.html(html),
                destroySpinner  = function() {
                    if (this.spinner) {
                        this.spinner.getContent().remove();
                        this.spinner.destroy();
                    }
                }.bind(this);

            destroySpinner();

            searchContainer.trigger('close');
            searchContainer.popover({
            context: this.spotlightSearchContainer.find('.j-search-left'),
                closeOnClick: false,
                closeOtherPopovers: true,
                putBack: true,
                destroyOnClose: false,
                focusPopover: false,
                onClose: destroySpinner
            });
            
            var metrics = this.metrics;
            var returnedDate = new Date().getTime();
            metrics.forEachCurrent(function(query) {
                query.setReturnedDate(returnedDate);
            });
            
            this.spotlightSearchResultsContainer.find('ul').each(function() {
                var type = $j(this).searchType();
                var itemData = $j(this).find('a').map(function() {
                    return $j(this).data();
                }).toArray();
                var query = metrics.getQuery(type);
                if (query) {
                    query.addResults(itemData);
                }
            });
        },
        
        handleAborts: function(jqXHR, status, error) {
            if (error === 'abort') {
                this.metrics.forEachCurrent(function(query) {
                    query.abort();
                });
            }
        }
    });
});