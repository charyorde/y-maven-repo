/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('ShareApp');
/**
 * Interface to share content REST service.
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 * @extends jive.RestService
 */
jive.ShareApp.ShareSource = jive.RestService.extend(function(protect) {

    this.init = function() {
        this.suppressGenericErrorMessages();
    };

    this.save = function(type, id, resource) {
        var promise = new jive.conc.Promise(),
            source = this;

        $j.ajax({
            type: "POST",
            url:  jive.rest.url("/objects/") + type + "/" + id + "/shares",
            dataType: "json",
            data: JSON.stringify(resource),
            contentType: "application/json; charset=utf-8",
            success: function(data, textStatus, xhr) {
                if (data) {
                    source.merge(resource, data);
                }
                promise.emitSuccess(resource);
            },
            error: source.errorCallback(promise),
            timeout: 30000
        });

        return promise;
    };


    this.get = function(type, id) {

        var promise = new jive.conc.Promise(),
            source = this;

        $j.ajax({
            type: "GET",
            url:  jive.rest.url("/objects/") + type + "/" + id + "/sharetemplate",
            dataType: "json",
            data: {},
            contentType: "application/json; charset=utf-8",
            success: function(data, textStatus, xhr) {
                promise.emitSuccess(data);
            },
            error: source.errorCallback(promise),
            timeout: 30000
        });

        return promise;
    };

});
