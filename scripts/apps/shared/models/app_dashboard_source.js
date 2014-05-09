/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint undef:true */
/*global jive $j */

/**
 * Interface to app dashboard REST service
 *
 * @class
 */
jive.AppDashboardSource = jive.RestService.extend(function(protect) {

    protect.init = function(options) {
        this.resourceType = "dashboard";
        this.pluralizedResourceType = "dashboards";
        this.RESOURCE_ENDPOINT =  jive.api.apps(this.pluralizedResourceType);
    };

});
