/*jslint browser:true */
/*extern jive $j moreOptionsLinkText lessOptionsLinkText */

/**
 * A search model for Jive search
 *
 */

jive.namespace('search');  // Creates the jive.search namespace if it does not already exist.

// adding the jive.search.load() method, the rest is view code
(function($) {
    var search = jive.search,
        apiBaseUrl = jive.app.url({ path: '/api/core/v3'} ),
        facets = {
            content: {
                url: apiBaseUrl + '/search/contents',
                validParams: [ 'count', 'startIndex', 'sort' ],
                validFilters: [ 'search', 'type', 'tag', 'author', 'place', 'after' ],
                defaults: {
                    collapse: 'true',
                    fields: 'rootType,type,subject,author,question,answer,parentPlace,parentContent,highlightSubject,highlightBody,highlightTags,published,updated,replyCount,likeCount,viewCount,visibleToExternalContributors,binaryURL'
                }
            },
            people: {
                url: apiBaseUrl + '/search/people',
                validParams: [ 'count', 'startIndex', 'sort' ],
                validFilters: [ 'search', 'nameonly' ],
                defaults: { }
            },
            places: {
                url: apiBaseUrl + '/search/places',
                validParams: [ 'count', 'startIndex', 'sort'],
                validFilters: [ 'search', 'type', 'tag' ],
                defaults: { }
            }
        };


    function getBaseUrl() {
        return apiBaseUrl;
    }

    function getUrl(facet) {
        return facets[facet].url;
    }

    /**
     * private
     */
    function request(url, params) {
        var promise = $.getJSON(url, params).done(function(results) {
            // if there are more results add them to the promise object
            if (results.links && results.links.next) {
                promise.next = request.bind(this, results.links.next, {});
            }

            promise.returnedDate = new Date().getTime();
        });

        promise.query = url + '?' + $.param(params);
        promise.sentDate = new Date().getTime();

        return promise;
    }

    /**
     * Queries the search API by the type provided. Returns a jQuery promise (jqXHR object) with possible next()
     * and prev() methods on it to query the next and previous pages. If either of these methods do not exist there are
     * no more pages in that direction.
     *
     * @param facet The type of objects to search, content, people, or places
     * @param params Params for the search include q, after, to, limit, etc.
     */
    function query(facet, params) {
        if (!facets.hasOwnProperty(facet))
            throw new Error('Invalid type, must be content, people, or places');

        if (!params)
            throw new Error('Must provide params to query');


        var subset = $.extend({}, facets[facet].defaults),
            validParams = facets[facet].validParams;

        var url = search.getUrl(facet);

        // prepare parameters, limit to only valid ones to make logging/analytics more accurate and relevant
        validParams.forEach(function(param) {
            if (params[param]) {
                subset[param] = params[param];
            }
        });

        var filters = params.filter;

        if (filters instanceof Array) {
            filters = filters.map(function(filter) {
                return filter.replace(/^after\((.*)\)$/, function(match, time) {
                    return 'after(' + convertSince(time) + ')';
                });
            });
        }

        subset.filter = filters;

        return request(url, subset);
    }


    function logMonitoring(data, sync) {
        var jsonBody = JSON.stringify(data);
        return $.ajax({
            type: 'POST',
            url: apiBaseUrl + '/search/monitor',
            data: jsonBody,
            async: !sync,
            contentType: 'application/json',
            dataType: 'json'
        });
    }


    // add a filter to the subset params formatting correctly
    function addFilter(params, filter, values) {
        if (!params.hasOwnProperty('filter')) params.filter = [];
        if ($.isArray(values)) values = values.join(',');
        params.filter.push(filter + '(' + values + ')');
    }




    var sinceValues = {
        day: 1,
        week: 7,
        month: 30,
        quarter: 90,
        year: 365
    };


    function convertSince(since) {
        var day = 86400000;
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var time = today.getTime();
        var days = sinceValues[since];

        if (!days) return false;
        var isoFormat = new Date(time - day*days).toISOString();
        return isoFormat.replace(/Z$/, '+0000');
    }

    if ( !Date.prototype.toISOString ) {

        ( function() {

            function pad(number) {
                var r = String(number);
                if ( r.length === 1 ) {
                    r = '0' + r;
                }
                return r;
            }

            Date.prototype.toISOString = function() {
                return this.getUTCFullYear()
                    + '-' + pad( this.getUTCMonth() + 1 )
                    + '-' + pad( this.getUTCDate() )
                    + 'T' + pad( this.getUTCHours() )
                    + ':' + pad( this.getUTCMinutes() )
                    + ':' + pad( this.getUTCSeconds() )
                    + '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
                    + 'Z';
            };

        }() );
    }


    search.query = query;
    search.logMonitoring = logMonitoring;
    search.getBaseUrl = getBaseUrl;
    search.getUrl = getUrl;

})(jQuery);
