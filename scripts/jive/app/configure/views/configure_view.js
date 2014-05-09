/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/jive/app/configure/views/serviceblocks.js
 * @depends path=/resources/scripts/jive/app/configure/views/validate.js
 * @depends path=/resources/scripts/jive/app/configure/views/error.js
 */

define('jive.JAF.Configuration.ConfigureView',
['jquery',
 'jive.JAF.Configuration.ServiceBlocks',
 'jive.JAF.Configuration.Validate',
 'jive.JAF.Configuration.Error'],
function($j, ServiceBlocks, Validate, Error) {
return jive.AbstractView.extend(function(protect) {

    this.init = function ( app, configSetupData, domTarget) {
        this.instanceAppID = app.instanceAppID;
        this.configSetupData = configSetupData;
        this.configSetupData.app = app;

        if(configSetupData.requiresServices) {
            // if requires services configure the clicks
            // render view, and attach to the domTarget
            this.content = $j(jive.apps.configure.renderConfigureApp( { configureAppView: configSetupData } ));
            domTarget.html('');
            domTarget.append( this.content );

            // set focus
            $j("#app-config-save").focus();

            this.bindClickEvents();
        } else {
            // otherwise render no-op message
            this.content = $j(jive.apps.configure.renderConfigureAppNotNeeded());
            domTarget.html('');
            domTarget.append( this.content );
        }
    };

    protect.bindClickEvents = function() {
        var self = this;
        var modalDiv = this.content;

        // close
        self.emit("app.service.wire.cancel", {
            callback: function() {
                self.emit( "app.cancel_configuration" );
            }
        });

        // save
        self.emit("app.service.wire.submit", {
            callback: function() {
                var serviceBlocks = new ServiceBlocks();
                var validateResult = serviceBlocks.validate( self.validate );
                if ( validateResult ) {
                    // signal to controller that we're ready to save out the
                    // services which were configured
                    var services = serviceBlocks.get_services();
                    self.emit( "app.save_configuration", services )
                }
            }
        });

        modalDiv.find(".j-service-radio").each( function() {
            var optionGroupID = $j(this).attr("data-optiongroupid");
            var optionID = $j(this).attr("data-optionid");
            $j(this).click( function() {
                // hide all in option group
                $j(".j-service-credentials[data-optiongroupid=" + optionGroupID + "]").hide();

                // show the credential
                $j(".j-service-credentials[data-optionid=" + optionID + "]").show();
            });
        });
    };

    protect.validate = function( serviceBlocks ) {
        var err = new Error();
        err.clear();
        var errorOptions = {};
        var invalidFields = [];
        serviceBlocks.find(".j-service-error").removeClass("j-service-error");
        serviceBlocks.each(function() {
            var validate = new Validate(  $j(this), errorOptions, invalidFields );
            validate.work();
        });
        if (invalidFields.length) {
            err.render(errorOptions);
            err.fieldsToVisualMarkers(invalidFields);
        }
        return invalidFields.length == 0;
    };

});
});
