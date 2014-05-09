/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('content.blogs');

/**
 * @class
 * @extends jive.RestService
 * @depends path=/resources/scripts/jive/rest.js
 */
jive.content.blogs.BlogIDLookup = jive.RestService.extend(function(protect, _super) {

    this.init = function init(options) {
        protect.resourceType = "container";
        this.options = $j.extend({
            ajaxType: 'GET',
            ajaxSettings: {
                contentType: "application/json; charset=utf-8"
            }
        }, options);
        _super.init.call(this, this.options);
    };

    this.getBlogForContainer = function(containerType, containerID) {
        var id = containerType + "/" + containerID + "/blog";
        var url = this.RESOURCE_ENDPOINT + '/' + id;
        var blog;
        $j.ajax({
            url: url,
            async: false,
            dataType: 'json',
            success: function(json) {
                blog = json;
            }
        });

        return blog;
    };

});

