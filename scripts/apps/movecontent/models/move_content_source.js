/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Move.Content');  // Creates the jive.Move.Content namespace if it does not already exist.


jive.Move.Content.CapabilitiesSource = jive.NestedRestService.extend(function(protect, _super) {

    protect.resourceType = "capability";

    protect.init = function(options) {
        _super.init.call(this, options);
        this.pluralizedResourceType = "capabilities";
        this.RESOURCE_ENDPOINT = jive.rest.url("/" + ["content", this.parentType, this.parentID, this.pluralizedResourceType].join("/"));
        this.POST_RESOURCE_ENDPOINT = this.RESOURCE_ENDPOINT;
    };

});
