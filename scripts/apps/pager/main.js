/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern jive $j */

//= require <jquery>
//= require <jquery.scrollTo>
//= require <sammy>
//= require <jive/namespace>
//= require <core_ext/object>
//= require <core_ext/array>
//= require "models/parameter"
//= require "views/main_view"

jive.namespace('Pager');

/**
 * This class is deprecated.  Use jive.Paginated or jive.locationState instead.
 *
 * Creates a controller that watches the window location for fragments of the
 * form:
 *
 *     #/?page=3&per_page=15&sort=updated
 *
 * When the window location is updated the jive.Pager.Main instance will parse
 * paging parameters and will update paged content appropriately.  Relevant
 * parameters are:
 * - page (Number): page number to display
 * - per_page (Number): number of items to display on each page
 * - sort (String): order in which to display items.  Possible values are
 * 'updated', 'created', and 'alpha'.
 * - prefix (String): prefix filter; only items with titles that begin with
 * the given prefix will be displayed.  This parameter is only allowed with
 * the 'alpha' sort option.
 * - tags (String): list of tags to display separated by plus signs.  Only
 * items tagged with all of the given tags will be displayed.
 *
 * Additional arbitrary parameters can be set using the `#/parameters/` route.
 *
 * jive.Pager.Main instances can update parameters one at a time based on
 * certain routes.  Here are example link `href` attributes that demonstrate
 * those routes:
 *
 *     #/pages/3  --  Redirects to page 3.
 *     #/page_sizes/10  --  Sets items-per-page to 10.
 *     #/sorts/alpha?prefix=z  --  Sets sort to 'alpha' and prefix to 'z'.
 *     #/with_tags/foo  --  Adds 'foo' to list of previously selected tags.
 *     #/without_tags/foo  --  Removes 'foo' from the list of selected tags.
 *     #/with_no_tags/ -- Clears the list of selected tags.
 *     #/parameters/?filter=collab&showPrivate=true  -- Sets filter to
 *     'collab' and showPrivate to 'true'.
 *
 * @deprecated
 * @class
 * @extends jive.conc.observable
 * @param   {jQuery|DOMElement|string}  content_container    element or selector specifying paginated content
 * @param   {string}    resources_url   URL to fetch pageable content from
 * @param   {Object}    overrides       default values to use for Pager parameters such as `page`, `per_page`, etc.
 * @param   {Object}    [options]       optional configuration parameters
 */
jive.Pager.Main = function(content_container, resources_url, overrides, options) {
    jive.conc.observable(this);

    options = $j.extend({
        showLoadingIndicator : true,
        updateLocation       : true
    }, options || {});

    var app,
        allowed_sorts = ['updated', 'created', 'alpha'],
        parameters = [],
        defaults = { page: 1, per_page: 15, tags: [] },
        view = new jive.Pager.MainView(content_container, options),
        skipShow = false,
        that = this;

    // Initialize Pager parameters based on hard-coded default values and
    // default values passed via the `overrides` argument.
    $j.extend(defaults, overrides || {});
    Object.keys(defaults).map(function(key) {
        parameters.push(new jive.Pager.Parameter(key, defaults[key]));
    });

    // Returns the parameter object that corresponds to the given key.  If no
    // such parameter object exists then a new one is created, added to the
    // parameters list, and returned.
    function parameter(key) {
        var param = parameters.filter(function(p) {
            return p.key == key;
        }).first();
        if (!param) {
            param = new jive.Pager.Parameter(key);
            parameters.push(param);
        }
        return param;
    }

    function set_page(n) {
        return parameter('page').set(n);
    }

    // Constructs a query string to send to the server in order to retrieve the
    // appropriate page of results.  The parameters are serialized in
    // alphabetical order for easier testing.
    function server_params() {
        var params = {};
        parameters.forEach(function(p) {
            if (p.key == 'page') {
                params.start = (parameter('page').value - 1) * parameter('per_page').value;
            } else if (p.key == 'per_page') {
                // Some views use `range` to mean `per_page` and some use
                // `numResults`.  So emit both.
                params.range = parameter('per_page').value;
                params.numResults = parameter('per_page').value;
            } else {
                params[p.key] = p.value;
            }
        });
        return params;
    }

    // Returns a URL hash that carries the user's browsing state.  Parameters
    // are serialized in alphabetical order for easier testing.
    function current_page_address() {
        return ['#/', parameters.filter(function(p) {
            // Only put parameter values in the URL if they are defined and do
            // not match the default values.
            return p.value && (!$j.isArray(p.value) || p.value.length > 0) && p.value != p.default_value;
        }).sort(function(a,b) {
            return a.key < b.key ? -1 : (a.key > b.key ? 1 : 0);
        }).map(function(p) {
            if ($j.isArray(p.value)) {
                // Array values are represented by a plus-sign-separated
                // string.
                return [p.key, p.value.join('+')];
            } else {
                return [p.key, p.value];
            }
        }).map(function(p) {
            return p.join('=');
        }).join('&')].filter(function(c) { return c; }).join('?');
    }

    // Retrieves a page of results from the server and displays it.
    function show(eventContext, callback) {
        function onLoad() {
            view.update();  // Signals MainView to perform any actions that should 
                            // be performed whenever a new page is loaded.
            eventContext.trigger('changed');  // Signals Sammy to re-bind event handlers.
            if (typeof callback == 'function') {
                callback();
            }
            that.emit('load');
        }

        view.loading();
        if ($j.isFunction(resources_url)) {
            resources_url(server_params(), onLoad);
        } else {
            // Accept jQuery#load() style URL format.  E.g. "/docs > *".
            var url = resources_url,
                off = resources_url.indexOf(" "),
                selector;
            if ( off >= 0 ) {
                selector = url.slice(off, url.length);
                url = url.slice(0, off);
            }

            // Configure ajax settings to serialize array values in the old
            // way.  E.g. "tags=foo&tags=bar" instead of
            // "tags[]=foo&tags[]=bar".
            var traditional = $j.ajaxSettings.traditional;
            $j.ajaxSettings.traditional = true;

            var jqxhr = $j.get(url, server_params(), function(html) {
                var content;
                if (selector) {
                    html = jive.util.withoutScripts(html);  // Remove script tags.
                    content = $j('<div/>').append(
                        $j('<div/>').append(html).find(selector)
                    ).html();
                } else {
                    content = html;
                }
                if (window.innerShiv) {
                    content = window.innerShiv(content);
                }
                $j(content_container).html(content);
                onLoad();
            }, 'html');
            jqxhr.error(function() {
                that.emit('serverError', jqxhr.status, jqxhr.statusText, that.get_parameters());
                view.stopLoading();
            });

            // Restore previous ajax settings.
            $j.ajaxSettings.traditional = traditional;
        }
    }

    app = $j.sammy(function() {

        // Whenever the hash portion of the window location changes to '#/?...'
        // this action will be invoked.  Any key-value pairs in the hash
        // will be set as attributes on the `params` object.
        this.get(/^(?:#\/)?$/, function() {
            var that = this;

            // Unset existing parameter values.
            parameters.map(function(p) { p.unset(); });

            // Set new parameter values.
            Object.keys(this.params).map(function(key) {
                parameter(key).set(that.params[key]);
            });

            if (!skipShow) {
                show(this);
            } else {
                // We should only skip the show() call once.
                skipShow = false;
            }
        });

        this.get('#/pages/:page_number', function() {
            set_page(this.params.page_number);
            redirectHelper.apply(this);
        });

        this.get(/^#\/page_sizes\/(\d*)$/, function() {
            parameter('per_page').set(this.params.splat[0] || this.params.numResults);
            set_page(1);
            redirectHelper.apply(this);
        });

        // 'sort' and 'prefix' are generally set together.  'prefix' will be
        // passed as part of the query string.
        this.get('#/sorts/:sort_type', function() {
            parameter('sort').set(this.params.sort_type);
            parameter('prefix').set(this.params.prefix);
            set_page(1);
            redirectHelper.apply(this);
        });

        this.get('#/with_tags/:tags', function() {
            var param = parameter('tags');
            this.params.tags.split('+').map(function(tag) {
                param.add(encodeURIComponent(tag));
            });
            set_page(1);
            redirectHelper.apply(this);
        });

        this.get('#/without_tags/:tags', function() {
            var param = parameter('tags');
            this.params.tags.split('+').map(function(tag) {
                param.remove(encodeURIComponent(tag));
            });
            set_page(1);
            redirectHelper.apply(this);
        });

        // This route is used to set arbitrary parameters, which are
        // represented in a query string.  For example
        //
        //     #/parameters/?filter=collaborative&showPrivate=1
        //
        this.get('#/parameters/', function() {
            var that = this;
            Object.keys(this.params).map(function(key) {
                parameter(key).set(that.params[key]);
            });
            set_page(1);
            redirectHelper.apply(this);
        });

        this.bind('update', function() {
            show(this);
        });

    });

    /**
     * Helper function to handle redirection and the user hitting the back button
     *
     * Without this helper function the user will be not be able to navigate back. They will be stuck on the current page because
     * they will be redirected to that page when they hit the back button.
     */
    function redirectHelper(){
        // If the last_location is equal to the current page address then the user must have hit the back button.
        // If this is the case use the history object to go back one entry in the history
        // Else just redirect
        if(app.last_location && app.last_location == current_page_address()){
            history.back();
        } else {
            var currentPageAddress = current_page_address();
            this.redirect(currentPageAddress);
        }
    }

    // Avoid loading the first page twice.
    if (app.getLocation().indexOf('#') < 0) {
        skipShow = true;
    }

    app.run();

    // Register a callback that will be called whenever a pager link is
    // clicked.
    view.addListener('click', function(addr) {
        try {
            app.runRoute('get', addr);

        // RunRoute will throw a '404' error if the link `href` does not match
        // one of the routes above.  If that happens suppress the error and do
        // nothing.
        } catch(e) {
            if (!e.toString().match(/^404/)) {
                throw(e);
            }
        }
    });

   /**
    * Set arbitrary parameter values.  Each the parameter corresponding to each
    * attribute on `params` will be set with the given value.  Each key-value
    * pair will be sent with server calls when fetching pages of content.
    * Values will be cast to strings when sent to the server.  The new
    * parameter values will be represented in the URL hash unless they match
    * the default values for those parameters.
    *
    * This call causes the Pager to reset to page 1 and to refresh its content.
    *
    * @param    {Object}    params  parameters and values to set
    * @returns  {Object}    returns pager parameters merged with the given values
    */
   this.set_parameters = function(params) {
       var new_values = {};
       if (typeof(params.page) == 'undefined') {
           set_page(1);
       }
       Object.keys(params).map(function(key) {
           new_values[key] = parameter(key).set(params[key]);
       });
       if (options.updateLocation) {
           app.setLocation(current_page_address());
       }
       else {
           show(app);
       }
       return new_values;
   };

   /**
    * Returns an object representing the current state of the pager.
    *
    * @returns  {Object}    the current parameter values of the pager
    */
   this.get_parameters = function() {
       var params = {};
       parameters.map(function(p) { params[p.key] = p.value; });
       return params;
   };

   /**
    * Load a page corresponding to the given parameters composed with the
    * current state.  This method does not store the new parameters or change
    * the window location, so it can be used for a "one off" load.
    *
    * @param    {Object}    params  parameters for the page to load
    */
   this.load_page = function(params, callback) {
       // Get a snapshot of the current state.
       var oldParameters = parameters;
       var oldState = this.get_parameters();

       // Replace the current state based on the given params.
       parameters = [];
       var newState = $j.extend(oldState, params);

       if (typeof(params.page) == 'undefined') {
           set_page(1);
       }
       Object.keys(newState).map(function(key) {
           parameter(key).set(newState[key]);
       });

       // Load the new page.
       show(app, function() {
           // Restore the original state.
           parameters = oldParameters;
           if (typeof callback == 'function') {
               callback();
           }
       });
   };

   /**
    * Causes Pager to reload the current page.
    */
   this.update = function() {
       app.trigger('update');
   };

   /**
    * Shuts down the app by unbinding event listeners and intervals.
    */
    this.unload = function() {
        app.unload();
        view.unload();
    };

    // Expose the Sammy app in the controller's public interface for testing
    // purposes.
    this._app = app;
};
