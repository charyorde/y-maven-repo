/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * An in-memory- only implementation of LocationState.  This implementation tracks state
 * but does not persist it anywhere.
 *
 * @depends path=/resources/scripts/apps/shared/models/location_state.js
 */
jive.TransitoryLocationState = jive.LocationState.extend(function(protect, _super) {
    var $ = jQuery;

    protect.init = function(options) {
        var opts = $.extend(options, {
            supportPushState: false,
            supportFragment: false
        });
        _super.init.call(this, opts);
        this.state = {};
    };

    this.get = function(key) {
        return this.current()[key];
    };

    this.getState = function() {
        return this.current();
    };

    this.getEphemeralState = function() {
        return {};
    };

    this.setState = function(params, description, newPath) {
        this.description = description || '';
        this.state = $.extend(true, {}, params);
        if (this.state != params) {
            this.emit('change', this.current(), description, window.location);
        } else {
            this.emit('noChange', this.current(), description, window.location);
        }
    };

    protect.current = function() {
        return $.extend(true, {}, this.state);
    };

});
