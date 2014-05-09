/**
 * The view/controller for the search page
 *
 * @depends path=/resources/scripts/jive/search/search.js
 * @depends path=/resources/scripts/jive/search/search-params.js
 * @depends path=/resources/scripts/jive/search/search-metrics.js
 * @depends path=/resources/scripts/apps/shared/models/location_state.js
 * @depends path=/resources/scripts/jquery/jquery.suggest.js
 */

(function($, undefined) {
    var search = jive.search,
        locationState = jive.locationState,
        page, // for paging
        pages = 0,
        loading = { content: null, people: null, places: null }, // store loading promises so we can abort if needed
        searchParams = new jive.search.SearchParams(jive.locationState.getState()),
        cache = {},
        manuallyChangingLocation = false,
        manuallyChangingParams = false,
        metrics = new jive.search.SearchMetrics('search-page'),
        MetricsQuery = jive.search.SearchMetricsQuery;

    function addUrlQuery() {
        var pageName = location.pathname.split('/').pop();
        if (!searchParams.getParam('q') && pageName !== 'search.jspa') {
            searchParams.setParam('q', pageName);
        }
    }
    addUrlQuery();

    // log errors
    function errorHandler(jqXHR, status, error) {
        var aborted = error === 'abort' || (jqXHR.status === 0 && error === '');
        if (!aborted) {
            console.error(error);
            var msg = jive.error.rest.soy.errorFinding({ href: window.location });
            $(msg).message({ style: 'error' });
        }
    }

    function escapeHTML(html) {
        return $('<div></div>').text(html || '').html();
    }

    function parseDate(almostISOString) {
        // from 2011-09-19T20:38:23.954+0000 to 2011-09-19T20:38:23.954Z the ecmascript standard
        var isoString = almostISOString.replace(/\+\d+/, 'Z');
        var date = new Date(isoString);
        if (isNaN(date.getTime())) {
            // from 2011-09-19T20:38:23.954Z to 2011/09/19 20:38:23 GMT the lame hack for IE
            var formatForIE7etall = isoString.replace(/-/, '/').replace('T', ' ').replace(/\.\d+Z/, ' GMT');
            date = new Date(formatForIE7etall);
        }
        return date;
    }


    // format dates etc. in the return results (if necessary)
    function formatResults(facet, result) {
        //set icon
        if (facet == 'content') {
            //format icon
            if(result.type == "file" && result.binaryURL){
                result.extension = result.binaryURL.split('.').slice(-1).join('.').toLowerCase();
            }

            // figure out whether to display external access warning
            result.displayExternalAccess = (!_jive_current_user.partner) && result.visibleToExternalContributors;

            // add highlighted versions of the text
            result.summary = result.highlightBody;
            result.subject = result.highlightSubject || escapeHTML(result.subject);

            result.publishedDate = parseDate(result.published).getTime();
            result.updatedDate =parseDate(result.updated).getTime();
            // 2011-09-19T20:38:23.423+0000

            // set name to use for display
            if (result.author && !result.author.displayName) {
                result.author.displayName = result.author.name.formatted || result.author.jive.username;
            }
        } else if (facet == 'people') {
            //format email
            if (result.emails && result.emails instanceof Array && result.emails.length > 0 && result.emails[0].value) {
                result.email = result.emails[0].value;
                //TODO maybe search through and find primary email?
            }
            //format title and department
            if (result.jive && result.jive.profile && result.jive.profile instanceof Array) {
                $(result.jive.profile).each(function(i, field) {
                    if (field.jive_label == "Title") {
                        result.title = field.value;
                    } else if (field.jive_label == "Department") {
                        result.department = field.value;
                    }
                });
            }

            // figure out whether to display external contributor warning
            result.displayExternalContributor = (!_jive_current_user.partner) && result.jive && result.jive.externalContributor;

            // figure out whether to display org chart link
            result.displayOrgChart = !_jive_current_user.partner && !result.displayExternalContributor;

            // set name to use for display
            if (!result.displayName) {
                result.displayName = result.name.formatted || result.jive.username;
            }
            
            if (result.highlightSubject) {
                result.displayName = result.highlightSubject;
            }
        } else if (facet == 'places') {
            //format project status
            if (result.type == "project") {
                if (result.projectStatus == "MEDIUM") {
                    result.projectStatus = "med";
                } else if (result.projectStatus) {
                    result.projectStatus = result.projectStatus.toLowerCase();
                }
            }

            // add highlighted versions of the text
            result.description = result.highlightBody || escapeHTML(result.description);
            result.name = result.highlightSubject || escapeHTML(result.name);


            // figure out whether to display external access warning
            result.displayExternalAccess = (!_jive_current_user.partner) && result.visibleToExternalContributors;

            //format data id type for hover card
            if (result.type == "space") {
                result.typeid = 14;
            } else if (result.type == "group") {
                result.typeid = 700;
            } else if (result.type == "project") {
                result.typeid = 600;
            } else if (result.type == "blog") {
                result.typeid = 37;
            }
        }
    }

    // package up results for the view templates
    function packageResults(facet, results) {
        var packagedResults = { view: facet, results: []};
        // format results and return view params
        if (results.data) {
            $(results.data).each(function (i, result) {
                formatResults(facet, result);
            });
            packagedResults['results'] = results.data;
        } else if (results.list) {
            $(results.list).each(function (i, result) {
                formatResults(facet, result);
            });
            packagedResults['results'] = results.list;
        }
        return packagedResults;
    }


    function toMetricInfo(result) {
        return {
            id: result.id,
            type: result.type
        }
    }


    // load content into the main area of results
    function queryMain() {
        var facet = searchParams.getParam('facet');
        var query;
        var top = $('.j-column-l').offset().top;
        if ($(window).scrollTop() > top) {
            $(window).scrollTop(top);
        }

        if (loading[facet]) {
            metrics.getQuery('main').abort();
            loading[facet].abort();
        }

        if (searchParams.getParam('q').replace(/\s+/, '') === '') {
            $('#j-main-results ol').html(jive.search.noResults({}));
            return;
        }

        $('#j-main-results ol').html(jive.search.loadingBar());
        var spinner = new jive.loader.LoaderView({size: 'small', showLabel: false});
        spinner.appendTo('#j-main-results li.j-loading-bar .j-loading-content');


        var promise = search.query(facet, searchParams.getSearchParams()).then(function(results) {
            pages = 1;

            if (results.suggestedQuery) {
                results.suggestedQuery = results.suggestedQuery.replace(/^search\(|\)$/g, '');
            }

            loading[facet] = null;

            query.addResults(results.list.map(toMetricInfo)).setReturnedDate(promise.returnedDate);

            try {
                var viewParams = packageResults(facet, results);
                var html = jive.search.searchResults(viewParams); // soy template
                $('#j-main-results').html(html);
            } catch(e) {
                errorHandler(null, null, e);
                $('#j-main-results ol').html({});
            }

            updateRssLink();

            if ($('#j-main-results li').length) {
                if (page.next) {
                    $('#j-main-results li.j-loading-bar').html(jive.search.loadMore());
                } else {
                    $('#j-main-results li.j-loading-bar').html(jive.search.noMore());
                    
                    if (pages === 1 && results.suggestedQuery) {
                        $('#j-main-results ol').prepend(jive.search.noResults(results));
                    }
                }
            } else {
                $('#j-main-results ol').html(jive.search.noResults(results));
            }

        }, function(jqXHR, status, error) {
            if (error !== 'abort') {
                $('#j-main-results ol').html(jive.search.noResults({}));
                errorHandler(jqXHR, status, error);
            }
        });

        loading[facet] = page = promise;

        // create and add query, we want to log it even if it never returns
        query = new MetricsQuery(promise.query, promise.sentDate);
        metrics.addQuery(query, 'main');
    }


    // load content into an alternate area (right-side) by index
    function queryAlt(facet, index) {
        var query;

        if (loading[facet]) {
            metrics.getQuery('alt'+index).abort(true);
            loading[facet].abort();
        }

        var limited = { count: 6, filter: searchParams.getFormattedFilter('q') };
        $('div.j-search-results-aside > div').eq(index).html('');

        if (searchParams.getParam('q').replace(/\s+/, '') === '') {
            return;
        }

        var promise = search.query(facet, limited).then(function(results) {
            var promise = loading[facet];
            delete loading[facet];

            query.addResults(results.list.map(toMetricInfo)).setReturnedDate(promise.returnedDate);

            var viewParams = packageResults(facet, results);
            var html = jive.search.altSearchResults(viewParams); // soy template
            $('div.j-search-results-aside > div').eq(index).html(html);
        }, errorHandler);

        loading[facet] = promise;

        query = new MetricsQuery(promise.query, promise.sentDate);
        metrics.addQuery(query, 'alt'+index);
    }


    function queryOpenSearch() {
        $('#j-communities dd[data-id]').each(function() {
            var elem = $(this);
            var engineId = elem.data('id');
            var container = $('#j-engine-results-' + engineId);

            container.find('ol').html(jive.search.loadingBar());
            var spinner = new jive.loader.LoaderView({size: 'small', showLabel: false});
            spinner.appendTo(container.find('li.j-loading-bar .j-loading-content'));


            OpenSearchQuery.getSearchResultsByEngineID(engineId, searchParams.getParam('q'), {
                callback: function(data) {
                    data.results.forEach(function(result) {
                        result.lastUpdatedDate = result.lastUpdatedDate.getTime();
                        result.publishedDate = result.publishedDate.getTime();
                    });

                    if (data.results.length) {
                        data.name = elem.data('name');
                        data.url = elem.data('url').replace('{searchTerms}', decodeURIComponent(searchParams.getParam('q')));
                        elem.find('.j-name').text(data.name + ' (' + data.totalItemCount + ')');
                        container.html(jive.search.openSearchResults(data));
                    } else {
                        container.find('ol').html(jive.search.noResults({}));
                    }
                },
                errorHandler: function(errorString, exception) {
                    console.error(errorString);
                    container.find('ol').html(jive.search.noResults({}));
                }
            });
        });
    }


    // reload all facets, such as when the query or the community changes
    function reload(allSections) {
        updateViewForState();

        // load main section
        queryMain();

        if (allSections) {
            var facet = searchParams.getParam('facet');

            // load other sections
            if (facet !== 'content') queryAlt('content', 0);
            if (facet !== 'people') queryAlt('people', facet === 'content' ? 0 : 1);
            if (facet !== 'places') queryAlt('places', 1);

            queryOpenSearch();
        }
    }


    // next page
    function next() {
        var facet = searchParams.getParam('facet');
        if (loading[facet] || !page || !page.next) return;

        $('#j-main-results li.j-loading-bar').remove();
        $('#j-main-results ol').append(jive.search.loadingBar());
        var spinner = new jive.loader.LoaderView({size: 'small', showLabel: false});
        spinner.appendTo('#j-main-results li.j-loading-bar .j-loading-content');


        page = page.next().then(function(results) {
            pages += 1;

            loading[facet] = null;
            metrics.getQuery('main').incPage().addResults(results.list.map(toMetricInfo));

            var viewParams = packageResults(facet, results);
            var html = jive.search.searchResults(viewParams); // soy template
            $('#j-main-results li.j-loading-bar').before('<li class="j-divider"></li>');
            $('#j-main-results li.j-loading-bar').before($(html).find('li:not(.j-loading-bar)'));
            $('#j-main-results li.j-loading-bar').html(page.next ? jive.search.loadMore() : jive.search.noMore());

        }, errorHandler);

        loading[facet] = page;
    }

    function updateAutocompleteView(filter, type, input, template) {
        var url;

        function createSelectedAutocomplete() {
            var obj = {};
            obj[type] = cache[url];

            $(input).next('ul').remove();
            $(template(obj)).insertAfter($(input).hide()).data('filter', filter);
        }

        if (searchParams.getParam(filter)) {
            url = searchParams.getParam(filter);

            if (!cache[url]) {
                $.getJSON(jive.search.getBaseUrl() + url).then(function(result) {
                    cache[url] = result;
                    createSelectedAutocomplete();
                    updateRssLink();
                });
            } else {
                createSelectedAutocomplete();
            }
        } else {
            $(input).next('ul').remove();
            $(input).show();
        }
    }

    function updateRssLink() {

        var rssParams = { q: searchParams.getParam('q') };
        if (searchParams.getParam('facet') !== 'content') {
            rssParams.view = searchParams.getParam('facet');
        }
        if (searchParams.getParam('after')) {
            rssParams.dateRange = {
                'day': 'yesterday',
                'week': 'last7days',
                'month': 'last30days',
                'quarter': 'lastyear', // doesn't support the quarter, make it a year
                'year': 'lastyear'
            }[searchParams.getParam('after')];
        }
        if (searchParams.getParam('nameonly')) {
            rssParams.peopleNameOnly = 'true';
        }
        if (searchParams.getParam('type')) {
            rssParams.resultTypes = searchParams.getParam('type');
        }
        if (searchParams.getParam('author')) {
            rssParams.userID = searchParams.getParam('author').split('/').pop();
        }
        if (searchParams.getParam('place') && cache[searchParams.getParam('place')]) {
            var place = cache[searchParams.getParam('place')];
            rssParams.containerName = place.displayName;
        }

        var rssLink = jive.app.url({ path: '/community/feeds/search'} ) + '?' + $.param(rssParams);
        $('#j-main-results .j-search-rss-link a').attr('href', rssLink);
    }


    // content types: "discussion", "document", "message", "post", "dm", "update", "share"


    // execute a search based off of state
    function updateViewForState() {
        $('#j-search-input').val(searchParams.getParam('q') || '');
        var facet = searchParams.getParam('facet');
        $('html').removeClass('j-content j-people j-places').addClass('j-' + facet);

        document.title = (searchParams.getParam('q') || '[empty search]') + ' | ' + document.title.split(' | ').pop();

        // "relevance", "likes", "subject", "date" (modification) :: "descending", "ascending"
        $('#sort').val(searchParams.getParam('sort'));

        $('div.j-column-s ul[data-param]').each(function() {
            var ul = $(this);
            var forFacet = ul.data('facet');
            if (forFacet && forFacet !== facet) return;

            var param = ul.data('param');
            var value = searchParams.getParam(param);

            if (value) {
                ul.find('li[data-value=' + value.replace(/ /g, '-') + ']').addClass('j-active').siblings().removeClass('j-active');
            } else {
                ul.find('li[data-value]:first').addClass('j-active').siblings().removeClass('j-active');
            }
        });

        $('div.j-column-s :checkbox').each(function() {
            var checkbox = $(this);
            var param = checkbox.attr('name');
            var value = checkbox.val();

            checkbox.prop('checked', searchParams.getParam(param) === value)
        });

        updateRssLink();

        updateAutocompleteView('author', 'user', '#author', jive.search.facets.selectedUserAutocomplete);
        updateAutocompleteView('place','place', '#place', jive.search.facets.selectedPlaceAutocomplete);
    }

    // LISTEN to state changes
    locationState.addListener('change', function(state) {
        if (!manuallyChangingLocation) {
            manuallyChangingParams = true;
            searchParams.setUrlParams(state);
            addUrlQuery();
        } else {
            manuallyChangingLocation = false;
        }
    });

    searchParams.addListener('change', function() {
        if (!manuallyChangingParams) {
            if (!searchParams.matches(locationState.getState())) {
                manuallyChangingLocation = true;
                locationState.setState(searchParams.getUrlParams());
            }
        } else {
            manuallyChangingParams = false;
        }

        reload(searchParams.getUpdateAll());
    });





    //// CONTROLLER SECTION, ATTACH LISTENERS TO DOM FOR USER INTERACTION ////

    $(function() {

        $('#j-search-form').submit(function(event){
            event.preventDefault();
            var query = $('#j-search-input').val();
            if (searchParams.getParam('q') === query) {
                reload(); // force reload if the user presses
            } else {
                searchParams.setParam('q', $('#j-search-input').val());
            }
        });

        $('#j-communities img').bind('error', function() {
            $(this).replaceWith('<span class="j-favicon-placeholder j-rc4"></span>');
        });


        // AUTOCOMPLETE

        // suggest doesn't allow us to specify the dataType is JSON, so fix
        $.ajaxSetup({
            dataFilter: function(data, type) {
                return data.replace(/^throw [^;]*;\n/, '');
            }
        });

        $.fn.setupAutocomplete = function(options) {
            this.suggest(options.url, {
                attachObject: $('#autocomplete-results').appendTo('body').css('z-index', 10000),
                paramName: 'filter',
                liClass: 'user-autocomplete-item clearfix',
                minchars: 2,
                extraParams: {
                    count: '6'
                },
                transformParams: function(params) {
                    params.filter = 'search(' + params.filter.replace(/\*?$/, '*') + ')';
                },
                transformData: function(data) {
                    var list = data.list
                    list.forEach(function(item) {
                        item.url = item.resources.self.ref.split(search.getBaseUrl()).pop();
                    });
                    var ul = $(options.template({ results: list }));
                    return $.makeArray(ul.find('li')).map(function(item) {
                        return [$(item).html()];
                    });
                },
                onSelect: function(key, value) {
                    var element = $(value);
                    var data = element.data();
                    data.avatarHtml = element.find('span').remove().end().html()
                    cache[data.url] = data;
                    searchParams.setParam(options.type, data.url);
                    $(this).val('');
                }
            });
        };

        $('#author').setupAutocomplete({
            type: 'author',
            url: search.getUrl('people'),
            template: jive.search.facets.userAutocomplete
        });

        $('#place').setupAutocomplete({
            type: 'place',
            url: search.getUrl('places'),
            template: jive.search.facets.placeAutocomplete
        });


        $('a.j-searchtips-link').click(function(event) {
            event.preventDefault();
            $(jive.search.helpTips()).lightbox_me({
                destroyOnClose: true
            });
        });


        $('div.j-autocomplete-options').delegate('a.remove', 'click', function(event) {
            event.preventDefault();
            var filter = $(this).closest('ul').data('filter');
            searchParams.removeParam(filter);
        });

        // AUTOCOMPLETE DONE


        // PARAMS AND FILTERS

        // left-sidebar "View more people" click
        $('div.j-column-s').delegate('li[data-value] a', 'click', function(event) {
            event.preventDefault();
            var param = $(this).closest('ul').data('param');
            var value = $(this).closest('li').data('value').replace(/-/g, ' ');
            if (value === 'all') {
                value = '';
            }

            searchParams.setParam(param, value);
        });

        $('div.j-column-s :checkbox').change(function(event) {
            event.preventDefault();
            var param = $(this).attr('name');
            var value = $(this).val();

            if ($(this).prop('checked')) {
                searchParams.setParam(param, value);
            } else {
                searchParams.removeParam(param, value);
            }
        });


        // right-sidebar "View more people" click
        $('div.j-search-results-aside-container').delegate('.j-view-more a', 'click', function(event) {
            event.preventDefault();
            var facet = $(this).closest('.j-view-more').data('facet');
            searchParams.setParam('facet', facet);
        });


        $('#sort').change(function() {
            searchParams.setParam('sort', $(this).val());
        });

        $('#j-main-results').delegate('.j-disambiguation a', 'click', function(event) {
            event.preventDefault();
            searchParams.setParam('q', $(this).text());
        });


        $('#j-main-results').delegate('li.j-loading-bar a', 'click', function(event) {
            event.preventDefault();
            next();
        });

        $('#j-main-results, .j-search-results-aside').delegate('a', 'click', function(event) {
            var anchor = $(this);
            var li = anchor.closest('li');
            var link = li.find('.j-search-result-value');
            if (!link.length) {
                return;
            }

            var url = anchor.get(0) !== link.get(0) ? anchor.attr('href') : undefined;
            var index = li.prevAll('.j-search-result').length;
            var query = 'main';

            if (!$(this).closest('#j-main-results').length) {
                // find out if this is the first div or the second in the side-bar search
                var altIndex = $(this).closest('div.j-alternate-search').prevAll().length;
                query = 'alt'+altIndex;
            }

            metrics.setChoice(query, index, url);
        });



        // fixed positioning for facet navigation
        $(window).load(function(){
            refreshPositioning();
        });
        $(window).resize(function(){
            refreshPositioning();
        });

        $(window).scroll(function(){
            // pagination
            if  (pages < 3 && $(window).scrollTop() >= $(document).height() - $(window).height() - 100) {
                next();
            }
            refreshPositioning();
        });


        var searchContainer = $('div.j-search-container');
        var sidebar = $('div.j-column-content');
        var offsetTop = searchContainer.offset().top;
        var footerHeight = $('body').height() - $('.j-body-main').outerHeight() - $('.j-body-main').offset().top

        function refreshPositioning() {
            var scroll = $(window).scrollTop();
            var atMinHeight = $('.j-search-results-main').height() === 860;
            var height = Math.max(searchContainer.outerHeight(), sidebar.outerHeight());

            if (!atMinHeight && scroll >= offsetTop && height < $(window).height() - footerHeight) {
                $('body').addClass('fixed');
                var middleColumn = $('.j-search-results-main-container');
                var rightColumn = $('.j-search-results-aside-container > *:first');
                $('.j-search-container').css(
                    {
                        left: middleColumn.offset().left + 1,
                        right: $(window).width() - rightColumn.offset().left - rightColumn.width()
                    }
                );
            } else {
                $('body').removeClass('fixed');
                $('.j-search-container').css({ left: '', right: '' });
            }
        }



        $('#j-communities a').click(function(event) {
            event.preventDefault();
            var elem = $(this).closest('dd');
            if (elem.is('.j-active')) {
                return;
            }

            var id = elem.data('id');
            elem.addClass('j-active').siblings('.j-active').removeClass('j-active');
            var filters = '.j-facets, .j-sub-facets, .j-sort-attr';
            var altResults = 'div.j-search-results-aside > div';

            if (id) { // a bridged community
                $(filters).hide();
                $(altResults).hide();
                $('#j-engine-results-' + id).show().siblings().hide();
            } else { // this community
                $(filters).css('display', '');
                $(altResults).css('display', '');
                $('#j-main-results').show().siblings().hide();
            }

        });

        reload(true);
    });

})(jQuery);

