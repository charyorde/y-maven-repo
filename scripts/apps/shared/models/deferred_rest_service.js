/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint undef:true laxbreak:true */
/*global jive $j */

/**
 * Interface to REST API endpoints.  This is an abstract class.  To use it,
 * create a subclass and override the {@link jive.RestService#resourceType}
 * property.
 *
 * This implementation returns jQuery Deferred objects rather than jive promises
 *
 * @class
 *
 * @depends path=/resources/scripts/jive/rest.js
 * @depends path=/resources/scripts/jquery/jquery.message.js
 * @depends template=jive.error.rest.soy.*
 */
jive.DeferredRestService = jive.oo.Class.extend(function(protect) {
    var $ = jQuery;

    /**
     * Specifies the resource type that subclasses represent. Examples of
     * values that could be used here are "comment" or "document".  Subclasses
     * should override this property.
     *
     * @name resourceType
     * @fieldOf jive.RestService#
     * @type string
     * @protected
     */
    protect.resourceType = "abstract";
    protect.displayGenericErrorMessages = true;

    /**
     * For compatibility with existing service implementations, we use
     * POST requests for creating and updating resources by default.
     * Switch this flag to `true` in a subclass to use PUT requests for
     * updates.
     */
    protect.putOnUpdate = false;

    protect.init = function(options) {
        var self = this;

        this.pluralizedResourceType = this.pluralizedResourceType || this.resourceType +"s";
        var endpoint = jive.rest.url("/"+ this.pluralizedResourceType);

        this.RESOURCE_ENDPOINT = (options && options.forceSecure) ? jive.secure(endpoint) : endpoint;
        this.POST_RESOURCE_ENDPOINT = this.RESOURCE_ENDPOINT;

        this.defaultParams = {};
    };

    this.suppressGenericErrorMessages = function() {
        this.displayGenericErrorMessages = false;
    };

    /**
     * Common helper class for ajax requests
     * @methodOf jive.RestService#
     * @param {jQuery.Deferred} promise, pre-initialized promise object
     * @param {string} type     Ajax type, POST, GET, etc.
     * @param {Object} settings Ajax settings that can be used to override the defaults
     * @param {Object} resource The object being sent
     * @returns {jQuery.Deferred} promise that is fulfilled when the resource is successfully sent
     * @protected
     */
    protect.commonAjaxRequest = function(promise, type, settings, resource){
        var source = this,
            success, error,
            ajaxSettings;

        type = type.toUpperCase();
        if(type == "POST"){
            // default settings for post
            ajaxSettings = {
                contentType: "application/json; charset=utf-8"
            };
            error = this.errorSaving;
        } else if (type == "GET"){
            error = this.errorFinding;
        } else if (type == "PUT") {
            ajaxSettings = {
                contentType: "application/json; charset=utf-8"
            };
            error = this.errorUpdating;
        } else if (type == "DELETE"){
            // default settings for delete
            error = this.errorDestroying;
        }

        $.ajax($.extend({
            type: type,
            dataType: 'json',
            success: success || function(data, textStatus, xhr) {
                source.normalizeID(data);
                promise.resolve(data);
            },
            error: this.errorCallback(promise, error),
            timeout: 30000
        }, ajaxSettings || {}, settings));

        return promise;
    };

    /**
     * Updates the server with the given object data.  If the given `resource`
     * instance has an `id` attribute then this method updates an existing
     * resource on the server.  If the given `resource` does not have an `id`
     * attribute then this method posts a new resource.
     *
     * @methodOf jive.RestService#
     * @param {Object}  resource    object representing a resource to create or update
     * @config {string} [id]    ID of the resource to update; if no ID is given a new resource is created
     * @returns {jQuery.Deferred} promise that is fulfilled when the resource is successfully saved
     */
    this.save = function(resource) {
        // Either post a new resource or update an existing resource depending
        // on whether the given resource has an `id` parameter.
        this.normalizeID(resource);

        var url = this.saveUrl(resource);
        var method = this.saveMethod(resource);

        return this.commonAjaxRequest(new $.Deferred(), method, {
            url: url,
            data: JSON.stringify(this.withoutId(resource))
        }, resource);
    };

    this.get = function(id, params) {
        var url = this.RESOURCE_ENDPOINT +'/'+ id
          , data = jQuery.extend({}, this.defaultParams, params || {});

        return this.commonAjaxRequest(new $.Deferred(), 'GET', {
            url: url,
            data: data
        });
    };

    this.findAll = function(params) {
        var url = this.RESOURCE_ENDPOINT
          , data = $.extend({}, this.defaultParams, params);
        
        return this.commonAjaxRequest(new $.Deferred(), 'GET', {url:url, data:data});
    };

    /**
     * Deletes the given resource from the server.  The given resource must
     * have an `id` attribute for this method to succeed.
     *
     * @methodOf jive.RestService#
     * @param {Object}  resource    object representing a resource to remove from the server
     * @config {string|Object} id  ID of the resource to delete or an object that has an id property
     * @returns {jQuery.Deferred} promise that is fulfilled when the resource is successfully deleted
     */
    this.destroy = function(id) {
        var promise = new $.Deferred()
          , source = this;

        // Accept either a bare id or a resource object with an id property.
        if (id.hasOwnProperty('id')) {
            id = id.id;
        }

        $.ajax({
            type: "DELETE",
            url: this.RESOURCE_ENDPOINT + "/" + id,
            success: function() {
                promise.emitSuccess();
            },
            error: function(xhr) {
                source.maybeEmitError(promise, source.errorDestroying, [null, xhr && xhr.status]);
            },
            timeout: 30000
        });

        return promise;
    };

    protect.normalizeID = function(resource) {
        var id = resource ? (resource.id || resource[this.resourceType +"ID"]) : null;
        if (resource && id) {
            resource.id = id;
        }
    };

    // Peel off the root-level element in JSON responses.
    protect.unwrapResponse = function(resp) {
        if (Object.keys(resp).length === 1) {
            return resp[Object.keys(resp)[0]];
        } else {
            return resp;
        }
    };

    // General-purpose error callback
    protect.errorCallback = function(promise, genericError) {
        var source = this;

        return function(xhr, textStatus, err) {
            var jsonResp, message, code;

            try {
                jsonResp = JSON.parse(xhr.responseText);
            } catch(e) {
                // JIVE-16575
                // IE7 will throw a TypeError on JSON.parse(undefined)
                // (which will happen if request times-out).  Just eat
                // all exception types.
//                if (e instanceof SyntaxError) {
                    // do nothing
//                } else {
//                    throw e;
//                }
            }

            message = jsonResp ? jsonResp.message : null;
            code = (jsonResp && jsonResp.code) ? jsonResp.code : xhr.status;

            // Ajax requests that are in progress when the page is
            // unloaded will be aborted with an error.  We want to
            // ignore those errors.
            if (textStatus !== 'error' || xhr.status >= 100) {
                source.maybeEmitError(promise, genericError, [message, code]);
            }
        };
    };

    protect.maybeEmitError = function(promise, genericError, args) {
        if (this.displayGenericErrorMessages) {
            this.displayError(genericError());
        }

        // Emit an error whether there are listeners or not to trigger the
        // promise's "complete" event.
        promise.reject.apply(promise, args);
    };

    protect.displayError = function(message) {
        $(message).message({
            style: 'error'
        });
    };

    protect.errorSaving = function() {
        return jive.error.rest.soy.errorSaving({ href: window.location });
    };

    protect.errorFinding = function() {
        return jive.error.rest.soy.errorFinding({ href: window.location });
    };

    protect.errorUpdating = function() {
        return jive.error.rest.soy.errorUpdating({ href: window.location });
    };

    protect.errorDestroying = function() {
        return jive.error.rest.soy.errorDestroying({ href: window.location });
    };

    // Do not submit an 'id' field with a resource on update.  Not all of our
    // resources include 'id' fields in the server-side representations yet; so
    // the presence of this field can cause an error on deserialization.
    protect.withoutId = function(resource) {
        var obj = {};

        Object.keys(resource).forEach(function(k) {
            if (k != 'id') {
                obj[k] = resource[k];
            }
        });

        return obj;
    };

    protect.saveUrl = function(resource) {
        if (resource.id) {
            return this.RESOURCE_ENDPOINT + '/' + resource.id;  // Update an existing resource.
        } else {
            return this.POST_RESOURCE_ENDPOINT;  // Create a new resource.
        }
    };
    
    protect.saveMethod = function(resource) {
        if (resource.id && this.putOnUpdate) {
            return 'PUT';
        } else {
            return 'POST';
        }
    };
});

define('jive.DeferredRestService', function() {
    return jive.DeferredRestService;
});
