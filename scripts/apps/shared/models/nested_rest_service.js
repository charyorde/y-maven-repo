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
 * Interface to REST API endpoints that are represented as nested resources.
 *
 * This is an abstract class.  To use it, create a subclass and override the
 * `resourceType` property.
 *
 * @class
 * @extends jive.RestService
 * @param {Object}  options
 * @config {number} parentType  type of resource that this service is nested under - types are jive globals
 * @config {number} parentID    ID of the specific resource that this service is nested under
 */
jive.NestedRestService = jive.RestService.extend(function(protect, _super) {
    protect.init = function(options) {
        _super.init.call(this, options);

        this.parentType = options.parentType;
        this.parentID   = options.parentID;

        this.POST_RESOURCE_ENDPOINT = [this.RESOURCE_ENDPOINT, this.parentType, this.parentID].join("/");
    };
});
