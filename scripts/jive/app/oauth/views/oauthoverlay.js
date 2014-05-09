/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */


/**
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 */
define('jive.JAF.Configuration.OAuthOverlay', function() {
return jive.AbstractView.extend(function(protect) {

    this.init = function ( popupWrapper, overlay, alias ) {
        this.content = overlay;
        var self = this;

        // add alias so that it can be found later
        overlay.find(".j-oauth-authorize")
               .append("<input type='hidden' id='_alias' value='" + alias + "'/>");

        // bind events
        var grantBtn = this.content.find(".j-error-msg-grant-oauth-access-btn");
        grantBtn.bind("click", popupWrapper.get_oauth_popup().createOpenerOnClick() );

        var authorizedBtn = this.content.find(".j-error-msg-granted-oauth-access-btn");
        authorizedBtn.bind("click", popupWrapper.get_oauth_popup().createApprovedOnClick() );

        var approvedBtn = this.content.find(".j-error-msg-oauth-approved-btn");
        approvedBtn.click( function() {
            self.emit("oauth.approved");   
        });
    };

    this.hideGrant = function() {
        this.content.find(".j-oauth-grant").hide();
    };

    this.showWaiting = function() {
        this.content.find(".j-oauth-authorize").show();  
    };

    this.hideWaiting = function() {
        this.content.find(".j-oauth-authorize").hide();  
    };

});
});
