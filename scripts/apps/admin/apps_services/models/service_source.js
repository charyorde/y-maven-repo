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
 * Data source for service model objects.
 *
 * @class
 */

jive.admin.apps.services.ServiceSource = jive.oo.Class.extend(function(protect) {

    var SERVICES_URL = jive.app.url({path : '/api/connects/v1/connectsServices'});

    protect.services = [ ];
    protect.tag_filter = [ ]; // Empty array means no filtering by tag
    protect.unique_tags = [ ];
    protect.user_filter = 0; // Zero means no filtering by user

    this.init = function() {
        var serviceSource = this;
    };

    /**
     * Append the specified tag to the unique tags list, if it is not already present.
     * TODO - we will need a different strategy if we ever implement pagination of services
     *
     * @param tag tag to be added
     */
    protect.appendTag = function(tag) {
        serviceSource = this;
        if ($j.inArray(tag, serviceSource.unique_tags) < 0) {
            serviceSource.unique_tags.push(tag);
        }
    };

    /**
     * Instantiate and return an empty service instance suitable for service creation
     *
     * @methodOf jive.admin.apps.services.ServiceSource
     */
    this.create = function() {
        var service = {
            authStyle : "basic",
            description : "",
            displayName : "",
            documentationURL : "",
            enabled : true,
            groups : [ -2 ],
            headers : [ ],
            iconURL : "",
            id : 0,
            lenient : false,
            name : "",
            owners : [ ],
            properties : {
                oauth2AccessTokenURL : "",
                oauth2AuthenticationURL : "",
                oauth2ClientID : "",
                oauth2ClientSecret : "",
                oauth2RedirectURL : "",
                oauth2Scope : ""
            },
            serviceURL : "",
            tags : [ ],
            tags_text : "",
            users : [ ],
            wsdlURL : ""
        };
        return service;
    };

    /**
     * Return all services defined by this Jive instance.
     *
     * @methodOf jive.admin.apps.services.ServiceSource
     */
    this.findAll = function(callback) {
        var serviceSource = this;
        var url = SERVICES_URL;
        var first = true;
        if (serviceSource.getUserFilter() != 0) {
            if (first) {
                url += "?userID=" + serviceSource.getUserFilter();
                first = false;
            }
            else {
                url += "&userID=" + serviceSource.getUserFilter();
            }
        }
        $j(serviceSource.getTagFilter()).each(function(index,tag) {
            if (first) {
                url += "?tag=";
                first = false;
            }
            else {
                url += "&tag=";
            }
            url += encodeURI(tag);
        });
        $j.ajax({
            success : function(data) {
                serviceSource.services = data;
                $j(serviceSource.services).each(function (index, service) {
                    serviceSource.populate(service);
                });
                if (serviceSource.unique_tags.length == 0) {
                    serviceSource.loadTags(callback, data);
                }
                else {
                    callback(data);
                }
            },
            url : url
        });
    };

    /**
     * Return the previously cached service with the specified id, if any; otherwise, return null.
     *
     * @param id the ID of the requested service
     * @methodOf jive.admin.apps.services.ServiceSource
     */
    this.findOne = function(id) {
        var match = null;
        $j(services).each(function(index, service) {
            if (id == service.id) {
                match = service;
            }
        });
        return match;
    };

    /**
     * Return an array of tags on which we are currently filtering, or an empty array for none.
     */
    this.getTagFilter = function() {
        return this.tag_filter;
    };

    /**
     * Return a list of the unique tags for all currently displayed services.  TODO - refactor to a separate web service call if we ever paginate
     */
    this.getUniqueTags = function() {
        return this.unique_tags;
    };

    /**
     * Return the user id of the user we are currently filtering for, or -1 for none.
     */
    this.getUserFilter = function() {
        return this.user_filter;
    };

    /**
     * Load all unique tags and call the specified callback function.
     *
     * @param callback the function to be called upon completion of loading unique tags
     * @param data the parameter to be passed to the callback function
     */
    protect.loadTags = function(callback, data) {
        var serviceSource = this;
        var url = SERVICES_URL + "Tags/unique";
        $j.ajax({
            success : function(data2) {
                serviceSource.unique_tags = data2;
                callback(data);
            },
            url : url
        });
    };

    /**
     * Extract and return the embedded error message, if it is present, else return the status from the status line
     *
     * @param request the XmlHTTPRequest instance passed to the "error" handler of an Ajax call
     */
    protect.message = function(request) {
        var responseText = request.responseText;
        if (responseText && responseText.startsWith("{")) {
            var response = JSON.parse(responseText);
            if (response.code && response.message) {
                return response.message;
            }
        }
        return request.statusText;
    };

    /**
     * Populate the fields in the specified service that might be missing because they are optional.
     *
     * @param service
     */
    protect.populate = function(service) {
        if (!service.description) {
            service.description = "";
        }
        if (!service.documentationURL) {
            service.documentationURL = "";
        }
        if (!service.iconURL) {
            service.iconURL = "";
        }
        if (!service.properties) {
            service.properties = {};
        }
        if (!service.properties.oauth2AccessTokenURL) {
            service.properties.oauth2AccessTokenURL = "";
        }
        if (!service.properties.oauth2AuthenticationURL) {
            service.properties.oauth2AuthenticationURL = "";
        }
        if (!service.properties.oauth2ClientID) {
            service.properties.oauth2ClientID = "";
        }
        if (!service.properties.oauth2ClientSecret) {
            service.properties.oauth2ClientSecret = "";
        }
        if (!service.properties.oauth2RedirectURL) {
            service.properties.oauth2RedirectURL = "";
        }
        if (!service.properties.oauth2Scope) {
            service.properties.oauth2Scope = "";
        }
        if (!service.tags) {
            service.tags = [ ];
        }
        service.tags_text = service.tags.join(" ");
        if (!service.wsdlURL) {
            service.wsdlURL = "";
        }
    };

    /**
     * Remove the specified service on the server.
     *
     * @param service the service to be removed
     * @param callback the callback function to call when the remove is complete.  The callback function
     *   will receive an error message parameter if a problem occurred, or null for a successful remove
     */
    this.remove = function(service, callback) {
        var serviceSource = this;
        var options = {
            error : function(xhr, status) {
                if ((xhr.status == 201) || (xhr.status == 204)) {
                    callback(null);
                }
                else {
                    var message = serviceSource.message(xhr);
                    callback(message);
                }
            },
            success : function() {
                serviceSource.loadTags(callback, null);
            },
            type : 'DELETE',
            url : SERVICES_URL + "/" + service.id
        };
        $j.ajax(options);
    };

    /**
     * Save the specified service on the server.
     *
     * @param service the service whose information is to be updated
     * @param callback the callback function to call when the update is complete.  The callback function
     *  will receive an error message parameter if a problem occurred, or null for a successful save
     */
    this.save = function(service, callback) {
        var serviceSource = this;
        var text = Object.toJSON ? Object.toJSON(service) : JSON.stringify(service);
        var options = {
            contentType : 'application/json',
            data : text,
            error : function(xhr, status) {
                if ((xhr.status == 201) || (xhr.status == 204)) {
                    serviceSource.loadTags(callback, null);
                }
                else {
                    var message = serviceSource.message(xhr);
                    serviceSource.loadTags(callback, message);
                }
            },
            processData : false,
            success : function(data, status, xhr) {
                if (xhr.status == 201) {
                    service.id = data.id;
                }
                serviceSource.loadTags(callback, null);
            },
            type : 'PUT',
            url : SERVICES_URL + "/" + service.id
        };
        if (service.id <= 0) {
            options.type = 'POST';
            options.url = SERVICES_URL;
        }
        $j.ajax(options);
    };

    /**
     * Set the array of tags on which we are filtering, or an empty array for  none.
     *
     * @param filter an array of tags on which to filter
     */
    this.setTagFilter = function(tag_filter) {
        this.tag_filter = tag_filter;
    };

    /**
     * Set the array of unique tags present on all of the defined services.
     *
     * @param unique_tags the array of unique tags
     */
    protect.setUniqueTags = function(unique_tags) {
        this.unique_tags = unique_tags;
    };

    /**
     * Set the flag indicating whether the unique tags list has been initialized yet
     *
     * @param unique_tags_initialized the new flag value
     */
    protect.setUniqueTagsInitialized = function(unique_tags_initialized) {
        this.unique_tags_initialized = unique_tags_initialized;
    };

    /**
     * Set the user id of the user on which we are filtering, or a negative number for none.
     *
     * @param id the user id on which to filter
     */
    this.setUserFilter = function(user_filter) {
        if (user_filter < 0) {
            this.user_filter = -1;
        }
        else {
            this.user_filter = user_filter;
        }
    }

    /**
     * Test the specified service, passing the response to the specified callback method.
     *
     * @param service the service to be tested
     * @param callback the callback to be called with the error message (if error) or null (if success)
     */
    this.test = function(service, callback) {
        var serviceSource = this;
        var options = {
            error : function(xhr, status) {
                if ((xhr.status == 201) || (xhr.status == 204)) {
                    callback(null);
                }
                else {
                    var message = serviceSource.message(xhr);
                    callback(message);
                }
            },
            success : function() {
                callback(null);
            },
            type : 'POST',
            url : SERVICES_URL + "/" + service.id + "/test"
        };
        $j.ajax(options);
    }

    /**
     * Update the state information for the specified service.
     *
     * @param service the service whose state information is to be updated
     * @param callback the callback function to be called when the update is complete
     */
    this.updateEnabled = function(service, callback) {
        var state = { enabled : service.enabled };
        if (service.audited) {
            state.audited = service.audited;
        }
        $j.ajax({
            contentType : 'application/json',
            data : JSON.stringify(state),
            processData : false,
            success : callback,
            type : 'PUT',
            url : SERVICES_URL + "/" + service.id + "/state"
        });
    };

});
