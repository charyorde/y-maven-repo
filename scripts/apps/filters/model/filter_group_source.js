/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Filters');
/**
 * Interface to the browse filter service for obtaining filter groups.
 *
 * @extends jive.RestService
 */
jive.Filters.FilterGroupSource = jive.RestService.extend(function(protect, _super) {
    protect.resourceType = "view";

    protect.init = function(params) {
        _super.init.call(this, params);
        this.containerType = params.containerType;
        this.containerID = params.containerID;
    };

    /**
     * Loads a single filter group, which will contain a list of filters.
     *
     * @methodOf jive.Filters.FilterGroupSource#
     * @param {Object} name Contains property String id, which is a
     * @param {Object} contentTypeID the id of the content type being created
     * @returns {jive.conc.Promise} promise that is fulfilled when the filter is ready
     */
    this.find = function(name, contentTypeID) {
        contentTypeID = contentTypeID ? contentTypeID : -1;
        var url = this.RESOURCE_ENDPOINT + "/" + name + "/filterGroup";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {
            url:url,
            data:{containerType: this.containerType, containerID: this.containerID, contentTypeID: contentTypeID}
        });
    };
});

