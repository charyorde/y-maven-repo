/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('admin.apps.services');  // Creates the jive.admin.apps.services namespace if it does not already exist.

/**
 * Data source for authentication style model objects.
 *
 * @class
 */

jive.admin.apps.services.AuthStyleSource = jive.oo.Class.extend(function(protect) {

    var BASE_URL = jive.app.url({path : '/api/connects/v1/authStyles'});
    var _ = jive.admin.apps.services;  // Creates a shortcut for referring to the app namespace.

    this.init = function() {
        var authStyleSource = this;
    };

    /**
     * Return all authentication styles defined by this Jive instance.
     *
     * @methodOf jive.admin.apps.services.AuthStyleSource
     */
    this.findAll = function(callback) {
        var authStyleSource = this;
        $j.ajax({
            success : function(data) {
                authStyles = data;
                callback(authStyles);
            },
            url : BASE_URL
        });
    }

});
