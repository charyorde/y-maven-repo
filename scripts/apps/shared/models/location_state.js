/**
 * @depends path=/resources/scripts/jquery/jquery.ba-bbq.js
 */
jive.LocationState = jive.oo.Class.extend(function(protect) {
    var $ = jQuery;

    jive.conc.observable(this);

    protect.defaults = {
        supportPushState: true,
        supportFragment: true
    };

    protect.init = function(options) {
        var opts = $.extend({}, this.defaults, options || {})
          , initLocation = location.href
          , state = this;

        // It is necessary to store the current location in a variable because
        // calling history.pushState() in Safari 5 does not update the value of
        // window.location.toString();
        this.location = initLocation;
        this.description = '';

        this.manuallyUpdatingHash = false;
        this.supportPushState = opts.supportPushState && !!(window.history && window.history.pushState);
        this.supportFragment = opts.supportFragment;

        var events = [
            this.supportPushState ? 'popstate' : null,
            this.supportFragment ? 'hashchange' : null
        ].filter(function(e) {
            return !!e;
        }).join(' ');

        $(window).bind(events, function(event) {
            var url = location.href;
            if (state.afterInit || url !== initLocation) {
                state.location = url;
                // if we're updating the hash manually through setState (IE<=9), emitChange will have already been called
                if (!state.manuallyUpdatingHash) {
                    state.emitChange(state.current(), state.description, url);
                }
                state.manuallyUpdatingHash = false;
            }
        });
    };

    this.get = function(key) {
        return this.current()[key];
    };

    this.getState = function() {
        return this.current();
    };

    this.getEphemeralState = function() {
        return $.deparam.fragment();
    };

    /**
     * Merges the given parameters with the existing location state.
     */
    this.pushState = function(params, description) {
        var newState = $.extend(this.current(), params);

        // Strip out any properties that were explicitly set to `undefined` or
        // that are empty arrays.
        Object.keys(params).forEach(function(k) {
            if (typeof params[k] == 'undefined' || ($.isArray(params[k]) && params[k].length < 1)) {
                delete newState[k];
            }
        });

        this.setState(newState, description);
    };

    /**
     * Replaces existing location state with state represented by the given
     * parameters.
     */
    this.setState = function(params, description, newPath) {
        var lastLocation = this.lastLocation;
        this.location = this.supportPushState ? this.newLocation(params, newPath) : this.newFragment(params, newPath);
        this.description = description || '';

        // Emit change before updating location so that event
        // handlers will run before location is updated in IE.
        this.emitChange(params, description, this.location);

        if (this.location !== lastLocation) {
            if (this.supportPushState) {
                history.pushState(this.current(), this.description, this.location);
            } else if (this.supportFragment) {
                this.updateLocationHash(this.location);
            }
        }
    };

    protect.current = function() {
        var queryParams = this.location.match(/\?/) ? $.deparam.querystring(this.location) : {}
          , fragmentParams = this.location.match(/#/) ? $.deparam.fragment(this.location) : {};

        return $.extend({}, queryParams, fragmentParams);
    };

    protect.newLocation = function(params, newPath) {
        var withoutFragmentOrQuery;
        if (!newPath) {
            withoutFragmentOrQuery = location.href.split(/[?#]/)[0];
        }
        else {
            // get the url domain and tack on the new path
            withoutFragmentOrQuery = jive.app.url({path:"/"+newPath});
        }
        return $.param.querystring(withoutFragmentOrQuery, params);
    };

    protect.newFragment = function(params, newPath) {
        var hashParams = {}
          , query = $.deparam.querystring()
          , withoutFragment;

        withoutFragment = location.href.split('#')[0];

        if (newPath) {
            params['nPLoc'] = newPath;
        }
        // Filter out any params that are already represented by the query
        // string.
        Object.keys(params).forEach(function(k) {
            if (query[k] !== String(params[k])) {
                hashParams[k] = params[k];
            }
        });

        var url = $.param.fragment(withoutFragment, hashParams);

        if(/#[^=&]+=$/.test(url)){
            //if there's a single hash param with an empty value, then treat it as a straight fragment identifier and strip the trailing =
            url = url.substring(0, url.length-1);
        }

        return url;
    };

    protect.emitChange = function(state, description, url) {
        if (url !== this.lastLocation) {
            this.emit('change', state, description, url);
            this.lastLocation = url;
            this.afterInit = true;
        }
        else {
            this.emit('noChange', state, description, url);
        }
    };

    protect.updateLocationHash = function(url) {
        var self = this;

        function update() {
            // Preserve scroll position if the new hash is empty.
            self.preserveScrollPosition(url.split('#')[1], function() {
                self.manuallyUpdatingHash = true;
                location.href = url;
            });
        }

        // Updating the location hash is very expensive in IE7 in our
        // app: it takes 1500 - 2200 ms.  By delaying the update we can
        // allow any loading spinners and ajax requests to start up
        // before making the expensive update.
        //
        // Nested timeouts are used to ensure that the location update
        // is really delayed until after other async operations.
        if ($.browser.msie && $.browser.version < 8) {
            (this.locationHashTimeouts || []).forEach(function(t) { clearTimeout(t); });
            this.locationHashTimeouts = [];
            this.locationHashTimeouts.push(setTimeout(function() {
                self.locationHashTimeouts.push(setTimeout(update, 100));
            }, 100));
        } else {
            update();
        }
    };

    protect.preserveScrollPosition = function(toggle, callback) {
        var pos;

        if (toggle) {
            pos = $(window).scrollTop();
            callback();
            $(window).scrollTop(pos);
        } else {
            callback();
        }
    };
});

jive.locationState = new jive.LocationState();
