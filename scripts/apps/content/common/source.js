/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('content.common');

/**
 * @class
 * @extends jive.RestService
 * @depends path=/resources/scripts/jive/rest.js
 * @depends path=/resources/scripts/apps/shared/models/file_uploader.js
 */
jive.content.common.Model = jive.RestService.extend(function(protect, _super) {

    this.init = function init(options) {
        protect.resourceType = options.resourceType;
        protect.pluralizedResourceType = options.resourceType;
        _super.init.call(this, options);
        this.options = $j.extend({
            ajaxType: options.method || 'POST',
            ajaxSettings: {
                contentType: "application/json; charset=utf-8"
            }
        }, options);
    };

    this.save = function save(data, options) {
        options = $j.extend({}, this.options, options);
        var suffix = data.formAction || options.suffix || '';
        var url = this.RESOURCE_ENDPOINT + suffix;
        var promise = new jive.conc.Promise();
        var method = data.formMethod || options.ajaxType;

        // jive.content.common.Model is used to represent several
        // different resources, and the logic in this method switches
        // between them.  But jive.RestService was really designed to
        // use a separate class to represent each resource.
        define(['jive.RestService'], function(RestService) {
            var source = new (RestService.extend(function(protect) {
                protect.saveUrl = function(resource) {
                    return url;
                };
                protect.saveMethod = function(resource) {
                    return method;
                };
            }))();

            promise.proxy(source.save(data));
        });

        return promise;
    };

    this.saveMultipart = function saveMultipart(form, options) {
        options = $j.extend({}, this.options, options);
        options.ajaxType = 'POST'; // always post multipart
        var suffix = form.data('formaction') || options.suffix || '';
        var url = this.RESOURCE_ENDPOINT + suffix;
        var promise = new jive.conc.Promise();

        // jive.content.common.Model is used to represent several
        // different resources, and the logic in this method switches
        // between them.  But jive.RestService was really designed to
        // use a separate class to represent each resource.
        define(['jive.FileUploader'], function(FileUploader) {
            var source = new (FileUploader.extend(function(protect) {
                protect.saveUrl = function(resource) {
                    return url;
                };
            }))();

            promise.proxy(source.save(form));
        });

        return promise;
    };

    this.unload = function unload(data, options) {
        options = $j.extend(this.options, options);
        var suffix = data.formAction || options.suffix || '';
        var url = this.RESOURCE_ENDPOINT + suffix;
        var method = 'POST';
        return this.commonAjaxRequest(new jive.conc.Promise(), method, $j.extend({
            url: url,
            data: JSON.stringify(data),
            async:false
        }, options.ajaxSettings));
    };

});

