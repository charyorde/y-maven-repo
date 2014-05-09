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
define('jive.JAF.Configuration.Validate', ['jquery'], function($j) {
return jive.AbstractView.extend(function(protect) {

    this.init = function( serviceBlock, errorOptions, invalidFields ) {
        this.serviceBlock = serviceBlock;
        this.errorOptions = errorOptions;
        this.invalidFields = invalidFields;
    };

    this.work = function() {
        var self = this;
        this.serviceBlock.find(".j-service-error").removeClass("j-service-error");
        var radios = this.serviceBlock.find("INPUT.j-service-radio:visible");
        if (radios.filter(":checked").length == 0) {
            // we need to select a radio button here
            this.errorOptions.missing_endpoint = true;
            radios.each(function() { self.invalidFields.push(this); });
        }
        this.serviceBlock.find("INPUT.j-service-credential:visible").each(function() {
            var credential = $j.trim($j(this).val());
            $j(this).val(credential);
            if (!credential) {
                // we are missing a text or password credential
                self.errorOptions.missing_credential = true;
                self.invalidFields.push(this);
            }
        });
        this.serviceBlock.find("textarea.j-service-credential:visible").each(function() {
            var credential = $j.trim($j(this).val());
            $j(this).val(credential);
            if (!credential) {
                // we are missing a textarea credential
                self.errorOptions.missing_credential = true;
                self.invalidFields.push(this);
            }
        });
    };

});
});
