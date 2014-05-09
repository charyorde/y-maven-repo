/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Announcements');
/**
 * Interface to announcements REST service.
 *
 * @extends jive.RestService
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.Announcements.Source = jive.RestService.extend(function(protect, _super) {

    protect.resourceType = "announcement";

    this.init = function(opts){
        _super.init.call(this);
        this.suppressGenericErrorMessages();
    };

    this.expire = function(id) {
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {
            url: this.RESOURCE_ENDPOINT + '/expire/' + id
        });
    };
    
    this.dismiss = function(id) {
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {
            url: this.RESOURCE_ENDPOINT + '/dismiss/' + id
        });
    };    

    this.showGenericSaveError = function(){
        this.displayError(this.errorSaving());
    };

    // Customize findAll() to add a cache-busting parameter.  For some
    // reason IE is caching announcement lists when it shouldn't be.
    this.findAll = function(params) {
        return _super.findAll.call(this, jQuery.extend({
            nonce: (new Date()).getTime()
        }, params));
    };
});
