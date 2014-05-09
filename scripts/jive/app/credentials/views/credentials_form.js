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
 * @depends path=/resources/scripts/jive/app/configure/views/validate.js
 * @depends path=/resources/scripts/jive/app/configure/views/error.js
 * @depends path=/resources/scripts/jive/app/configure/views/msgposter.js
 */
define('jive.JAF.Configuration.CredentialsForm',
['jquery',
 'jive.JAF.Configuration.MsgPoster',
 'jive.JAF.Configuration.Validate',
 'jive.JAF.Configuration.Error'],
function($j, MsgPoster, Validate, Error) {
return jive.AbstractView.extend(function(protect) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    protect.init = function(options) {
        var self = this;
        this.content = options.domTarget;
        this.approved = [];
        this.denied = [];
        this.currentService = 1;
        this.configuredServices = [];
        this.totalServices = 0;
        this.msg_poster = new MsgPoster();
    };

    this.render = function( credentialsSetup ) {
        var self = this;
        var html = $j(jive.apps.configure.renderConfigureCredentialBlocks( { credentialsSetupView: credentialsSetup } ));
        this.content.append( html.html() );
        this.servicesCount = credentialsSetup.serviceOptionView.length;

        if ( this.servicesCount < 2 ) {
            this.content.find("#current-service-counter").remove();
        } else {
            this.content.find("#current-service").text( this.currentService );
        }

        this.processServices( this.content.find(".j-service-block-container:first") );
    };

    this.activate = function() {
        this.content.find( ".j-service-focus-hint").first().focus();
    };

    protect.save = function() {
        var container = this.content.find(".j-service-block-container:first");
        var serviceBlock = container.find(".j-service-block:first");
        var connectionId  = serviceBlock.attr("data-connectionid");
        if ( this.validate_block(serviceBlock) ) {
            this.approved.push( Number( connectionId ) );
            this.process_block(serviceBlock);
            this.currentService++;
            this.content.find("#current-service").text( this.currentService );
            if ( this.currentService <= this.servicesCount ) {
                container.hide().next().show();
            } else {
                this.postConfigurations();
            }
        }
    };

    protect.process_block = function( serviceBlock ) {
        var self = this;
        var service = { "serviceID": serviceBlock.attr("data-serviceid"), "alias": serviceBlock.attr("data-alias") };
        service.credentials = self.get_credentials( serviceBlock );
        this.configuredServices.push( service );
    };

    protect.get_credentials = function( context ) {
        var credentials = [ ];
        context.find(".j-service-credential").each(function () {
            credentials.push({ name : this.getAttribute("data-name"), value : this.value });
        });
        return credentials;
    };

    protect.cancel = function() {
        var container = this.content.find(".j-service-block-container:first");
        var serviceBlock = container.find(".j-service-block:first");
        var connectionId  = serviceBlock.attr("data-connectionid");
        this.denied.push( Number( connectionId ) );
        this.currentService++;
        this.content.find("#current-service").text( this.currentService );
        if ( this.currentService <= this.servicesCount ) {
            container.hide().next().show();
        } else {
            this.postConfigurations();
        }
    };

    this.completed = function() {
        return this.currentService > this.servicesCount;
    };

    protect.processServices = function ( firstService ) {
        var first = true;
        var service  = firstService;
        var self = this;
        var formElement;
        while (service.length) {

            var foo = service.find(".app-config-save");
            // on approve click
            service.find(".app-config-save").click( function() {
                self.save();
            });

            // on deny click
            service.find(".app-config-cancel").click( function() {
                self.cancel();
            });

            service.find(".j-service-credential").keypress( function(event) {
                var key = event.which || event.keyCode;
                if (key === jive.Event.KEY_RETURN) {
                    foo.click();
                }
            });

            if (first && service.css("display") != "none") {
                formElement = service.find(".j-service-focus-hint");
                if (formElement.length) {
                    first = false;
                }
            }

            service = service.next();
        }
    };

    protect.validate_block = function( serviceBlock ) {
        var err = new Error();
        err.clear();
        var errorOptions = {};
        var invalidFields = [];
        serviceBlock.find(".j-service-error").removeClass("j-service-error");
        var validate = new Validate( serviceBlock, errorOptions, invalidFields );
        validate.work();
        if (invalidFields.length) {
            err.render(errorOptions);
            err.fieldsToVisualMarkers(invalidFields);
        }
        return invalidFields.length == 0;
    };

    protect.postConfigurations = function() {
        if ( !this.denied || this.denied.length < 1 ) {
            this.emit("app.credentials_done", {
                "services": this.configuredServices,
                "approved": this.approved,
                "denied": this.denied
            } );
        } else {
            // cancelled
            this.emit("app.credentials_cancelled" );
        }
    };

    this.msgSuccess = function( result ) {
        this.msg_poster.post_message( "credentials.success", "success" );
    };

    this.msgFailed = function( result ) {
        this.msg_poster.post_message( "credentials.fail", "success" );
    };

    this.msgCancelled = function( result ) {
        this.msg_poster.post_message( "credentials.cancel", "warn" );
    };

});
});
