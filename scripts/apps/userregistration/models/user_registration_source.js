/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */



jive.namespace('UserRegistration');

/**
 * This class handles fetching autocomplete info for the user picker.
 */
jive.UserRegistration.Source = jive.RestService.extend(function(protect) {

    protect.resourceType = protect.pluralizedResourceType = "userregistration";

    this.getForm = function(requiredOnly){
        var url = this.RESOURCE_ENDPOINT + "/?requiredOnly=" + requiredOnly;
        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url});
    };

    this.validate = function(params) {
        var url = this.RESOURCE_ENDPOINT + "/field/validation";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data:JSON.stringify(params)});
    };

    this.checkPasswordStrength = function(params) {
        var url = this.RESOURCE_ENDPOINT + "/passwordstrength";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data:JSON.stringify({val: params})});
    };

    this.saveForm = function(params) {
        var url = this.RESOURCE_ENDPOINT + "/";
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data:JSON.stringify(params)});
    };

    this.showGenericSaveError = function(){
        this.displayError(this.errorSaving());
    };

    this.showGenericFindError = function(){
        this.displayError(this.errorFinding());
    };

    this.errorCallback = function(promise, genericError) {
            var source = this;

            return function(xhr, textStatus, err) {
                var jsonResp, message, code;

                try {
                    jsonResp = JSON.parse(xhr.responseText);
                }
                catch(e) {
                    if (e instanceof SyntaxError) {
                        // do nothing
                    }
                    else {
                        throw e;
                    }
                }

                message = jsonResp ? jsonResp.message : null;
                code = (jsonResp && jsonResp.code) ? jsonResp.code : xhr.status;

                // Ajax requests that are in progress when the page is
                // unloaded will be aborted with an error.  We want to
                // ignore those errors.
                if (!source.unloaded) {
                    source.maybeEmitError(promise, genericError, [message, code, jsonResp]);
                }
            };
        };

});