/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */



jive.namespace('UserPicker');

/**
 * This class handles fetching autocomplete info for the user picker.
 */
jive.UserPicker.Source = jive.oo.Class.extend(function(protect) {

    this.init = function(options){
        this.options = options;
        this.urls = {
            userAutocomplete: jive.app.url('/user-autocomplete.jspa'),
            browseModal: jive.app.url('/user-autocomplete-modal.jspa')
        };
    };

	this.autocomplete = function(query) {
        var promise = new jive.conc.Promise(), that = this, args = "", charLimit = 6500;

        if (that.lastAjaxObj) {
            that.lastAjaxObj.abort();
        }

        var params = {
            emailAllowed : that.options.emailAllowed,
            userAllowed : that.options.userAllowed,
            listAllowed : that.options.listAllowed,
            canInvitePartners : that.options.canInvitePartners,
            canInviteJustPartners : that.options.canInviteJustPartners,
            canInvitePreprovisioned : that.options.canInvitePreprovisioned,
            invitePreprovisionedDomainRestricted : that.options.invitePreprovisionedDomainRestricted,
            propNames: ['avatarID','directMessageActionLinkShown']
        };

        if(that.options.object){
            params = $j.extend(params, {
                objectID : that.options.object.objectID,
                objectType : that.options.object.objectType,
                entitlement :that.options.entitlement
            });
        }

        if (this.options && this.options.filterIDs){
            this.options.filterIDs.forEach(function(filterID){
                args += (args == "") ? "?" : "&";
                args +="args=" + encodeURIComponent(filterID);
            });
        }

        if (this.options && this.options.resultLimit){
            args += (args == "") ? "?" : "&";
            args +="numResults=" + encodeURIComponent(this.options.resultLimit);
        }

        if (query && query.length > charLimit) {
            query = query.substring(0, charLimit);
        }

        that.lastAjaxObj = $j.ajax({
            url : jive.rest.url('/users/search/' + encodeURI(query) + args),
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
    };

    this.load = function(userid) {
        var promise = new jive.conc.Promise();
        var that = this;
        var params = {};
        if(that.options.object){
            params = $j.extend(params, {
                objectID : that.options.object.objectID,
                objectType : that.options.object.objectType,
                entitlement :that.options.entitlement
            });
        };

        $j.ajax({
            url : jive.rest.url('/users/' + userid),
            dataType : "json",
            data : params,
            success : function(user) {
                promise.emitSuccess(user);
            },
            error : function(e) {
                promise.emitError(e)
            }
        });
        return promise;
    };

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
