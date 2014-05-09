/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Filters');  // Creates the jive.Filters namespace if it does not already exist.

/**
 * Interface to REST service for available tags.
 *
 * @extends jive.RestService
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.Filters.TagService = jive.RestService.extend(function(protect, _super) {
    protect.resourceType = "tag";

    var cache = {};

    protect.init = function(options) {
        _super.init.call(this, options);
        this.RESOURCE_ENDPOINT = jive.rest.url("/tags/cloud");
        this.defaultParams = options;
    };

    this.findAll = function(params) {
        params = jQuery.extend({}, this.defaultParams, params || {});

        var max = params.max
          , withoutMax = {}
          , key = this.cacheKey(params)
          , data = cache[key]
          , promise = new jive.conc.Promise()
          , source = this;

        if (data) {
            promise.emitSuccess(data);

        } else {
            Object.keys(params).forEach(function(key) {
                if (key != 'max') {
                    withoutMax[key] = params[key];
                }
            });

            this.get(max, withoutMax).addCallback(function(data) {
                var tags = data.contentTagCloudBean;
                cache[key] = tags;

                promise.emitSuccess(tags);
            }).addErrback(function() {
                promise.emitError.apply(promise, arguments);
            });
        }

        return promise;
    };

    protect.cacheKey = function(params) {
        return Object.keys(params).sort().map(function(key) {
            return key +"="+ JSON.stringify(params[key]);
        }).join('&');
    };
});
