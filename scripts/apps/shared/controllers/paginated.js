/**
 * Abstract trait to be mixed in to a class to add behavior for stateful
 * properties that are kept in sync with a location hash or with query
 * parameters.
 *
 * @class
 * @param {Object} defaultState default values for given keys
 * @param {Object} [options] configuration options
 * @config {Function} [paramFilter] function that takes parameters from
 * locationState and returns a normalized set of parameters.  Use this option
 * if you are going to have query string or hash values that are not of the
 * usual key=value format.  Defaults to undefined.
 * @config {Function} [viewClass] constructor for a class that will be used to
 * manage pagination links; defaults to jive.PaginationLinks
 * @config {jive.LocationState} [locationState] object to manage interactions
 * with the window location; defaults to jive.locationState
 *
 * @depends path=/resources/scripts/apps/shared/models/location_state.js
 * @depends path=/resources/scripts/apps/shared/views/pagination_links.js
 */
jive.Paginated = jive.oo.Class.extend(function(protect) {
    var $ = jQuery
      , undef;  // intentionally set to `undefined`

    /**
     * Abstract method, should accept a map of stateful property names and
     * values and should return a promise.  That promise should emit success
     * when a page is rendered based on the given parameters.  Fulfilling the
     * promise will cause the paginator to update its page links.
     *
     * @methodOf jive.Paginated#
     */
    protect.loadPage = jive.oo._abstract;

    protect.initPagination = function(defaultState, options) {
        var controller = this;

        options = options || {};

        this.defaultState = $.extend({
            start: 0,
            numResults: 20
        }, defaultState);

        this.promises = [];
        this.locationState = options.locationState || jive.locationState;
        this.paramFilter = options.paramFilter;
        this.linkViewClass = options.viewClass || jive.PaginationLinks;
        this.scrollTo = options.scrollTo;
        this.links = [];

        this.locationState.addListener('change', function(state) {
            if (controller.rollingBack) {
                controller.rollingBack = false;
                return;
            }

            controller.emitChange(state);
        });

        // If any value is present in the hash on page load then emit an event.
        $(document).ready(function() {
            // Make sure that this is executed asynchronously to prevent race
            // conditions in init() methods in classes that mix in this trait.
            jive.conc.nextTick(function() {
                var startingState = controller.locationState.getEphemeralState();

                if (Object.keys(startingState).length > 0) {
                    controller.emitChange(controller.locationState.getState());
                }
            });

            // Try to attach new link class instances to existing DOM elements.
            // But if pagination elements are present then give the link class
            // the opportunity to build some itself.
            if ($(options.paginationSelector || '.j-pagination').length > 0) {
                controller.links = $(options.paginationSelector || '.j-pagination').toArray().map(function(element) {
                    return controller.buildLinks({ element: element });
                });
            } else {
                controller.links = [controller.buildLinks()];
            }
        });
    };

    /**
     * Merges the given parameters with the existing location state.
     */
    protect.pushState = function(params) {
        var startState = this.locationState.getState()
          , filtered = this.paramFilter ? this.paramFilter(startState) : startState
          , promise = new jive.conc.Promise()
          , controller = this;

        // Remove parameters that match their default values.
        var state = Object.keys(params).reduce(function(state, k) {
            if (controller.defaultState.hasOwnProperty(k) &&
            controller.deepEqual(controller.defaultState[k], params[k])) {
                state[k] = undef;
            } else {
                state[k] = params[k];
            }
            return state;
        }, {});

        // Remove parameters that are unset by paramFilter.
        Object.keys(filtered).forEach(function(k) {
            if (filtered.hasOwnProperty(k) && typeof filtered[k] == 'undefined') {
                state[k] = undef;
            }
        });

        this.lastState = this.locationState.getState();
        this.locationState.pushState(state);

        this.promises.push(promise);

        return promise;
    };

    protect.getState = function() {
        return this.normalized(this.locationState.getState());
    };

    /**
     * Reverts the window location to its previous value.
     */
    protect.rollback = function() {
        if (this.lastState) {
            this.rollingBack = true;
            this.locationState.setState(this.lastState);
        }
    };

    /**
     * Fills in default values for any parameters that are not explicitly set
     * in the location state.
     */
    protect.normalized = function(state) {
        var filteredState = this.paramFilter ? this.paramFilter(state) : state
          , withDefaults = $.extend({}, this.defaultState, filteredState)
          , controller = this;

        // Make sure that parameters that are expected to be arrays are
        // consistently represented as arrays and that empty array values are
        // filled in with the default for that value.
        Object.keys(withDefaults).forEach(function(k) {
            if ($.isArray(controller.defaultState[k]) && !$.isArray(withDefaults[k])) {
                withDefaults[k] = [withDefaults[k]];
            } else if ($.isArray(controller.defaultState[k]) && withDefaults[k].length < 1) {
                withDefaults[k] = controller.defaultState[k];
            }
        });

        return withDefaults;
    };

    /**
     * Invoked when a location state change occurs.
     */
    protect.emitChange = function(state) {
        var controller = this;

        controller.loadPage(controller.normalized(state)).addCallback(function(pageNumber, totalPages) {
            controller.updatePaginationLinks(pageNumber, totalPages);

            // Fulfill any promises returned from pushState().
            controller.promises.forEach(function(promise) {
                promise.emitSuccess();
            });
            controller.promises = [];

            // Update the href attributes of any links on the page with the
            // "js-updatable-link" class.
            $('.js-updatable-link').each(function() {
                var $link = $(this)
                  , params = $link.data('urlParams');

                if (params) {
                    $link.attr('href', location.pathname +'?'+ $.param($.extend(state, params)));
                }
            });
        }).addErrback(function() {
            // Fulfill any promises returned from pushState().
            controller.promises.forEach(function(promise) {
                promise.emitError();
            });
            controller.promises = [];

            controller.rollback();
        });
    };

    protect.buildLinks = function(options) {
        options = options || {};

        var links = new this.linkViewClass($.extend({}, options, {
              params: $.extend({
                  urlParams: this.locationState.getState(),
                  urlPath: location.pathname,
                  pageSize: this.getState().numResults
              }, options.params),
              scrollTo: this.scrollTo
          }))
          , controller = this;

        if (!links._paginatedListening) {  // Avoid adding duplicate listeners.
            links.addListener('start', function(start) {
                controller.setStart(start);
            });

            links.addListener('page', function(page) {
                controller.setPage(page);
            });

            links._paginatedListening = true;
        }

        return links;
    };

    protect.updatePaginationLinks = function(pageNumber, totalPages) {
        var oldLinks = this.links
          , controller = this;

        this.links = oldLinks.map(function() {
            return controller.buildLinks({ params: { current: pageNumber, max: totalPages } });
        });

        oldLinks.forEach(function(l,i) {
            l.replaceWith(controller.links[i]);
        });
    };

    protect.setStart = function(rawStart) {
        var start = parseInt(rawStart, 10) || 0;
        this.pushState({ start: start });
    };

    protect.setPage = function(page) {
        this.setStart(this.pageToStart(page));
    };

    protect.pageToStart = function(page, numResults) {
        numResults = numResults || this.getState().numResults;
        return (page - 1) * numResults;
    };

    protect.startToPage = function(start, numResults) {
        numResults = numResults || this.getState().numResults;
        return (start / numResults) + 1;
    };

    protect.deepEqual = function(a, b) {
        if ($.isArray(a) && $.isArray(b)) {
            return a.length == b.length && a.every(function(e, i) {
                return e == b[i];
            });
        } else if ($.isArray(a) || $.isArray(b)) {
            return false;
        } else {
            return a == b;
        }
    };
});
