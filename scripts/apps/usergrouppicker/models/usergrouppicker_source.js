/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */



jive.namespace('UserGroupPicker');

/**
 * This class handles fetching autocomplete info for the user picker.
 */
jive.UserGroupPicker.Source = jive.oo.Class.extend(function(protect) {

    this.init = function(options){
        this.options = options;
        this.urls = {
            groupAutocomplete: _jive_base_url + '/group-autocomplete.jspa',
            browseModal: _jive_base_url + '/group-autocomplete-modal.jspa'
        };

    }



	this.autocomplete = function(query) {
        var promise = new jive.conc.Promise(), that = this;

        if(that.lastAjaxObj) that.lastAjaxObj.abort();


        var params = {
            groupAllowed : true,
            includeGuestUsers : false,
            includeRegisteredUsers : true
        };

        that.lastAjaxObj = $j.ajax({
            url : _jive_base_url + '/__services/v2/rest/groups/search/' + encodeURI(query),
            data : params,
            dataType : "json",
            success : function(results){
                promise.emitSuccess(results);
            },
            error : function(e){
                promise.emitError();
            }
        });

        return promise;
    }

	this.save = function(resource) {
        var promise = new jive.conc.Promise(),
            source = this;

        // Serialize resource data.
        var data = {};
        data[this.resourceType] = resource;

        $j.ajax({
            type: "POST",
            url: this.RESOURCE_ENDPOINT + "/" + resource.objectID + "/members",
            dataType: "json",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            success: function(data, textStatus, xhr) {
                promise.emitSuccess(data);
            },
            error: function(data, textStatus, xhr) {
                try {
                    var jsonResp  = $j.parseJSON(data.responseText);

                    if (jsonResp && jsonResp.error && jsonResp.error.message) {
                        promise.emitError(jsonResp.error.message, jsonResp.error.code);
                    }
                }
                catch(_) {
                    promise.emitError(null, data && data.status);
                }
            }
        });

        return promise;
    }

});