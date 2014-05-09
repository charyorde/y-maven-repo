/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 **/
define('jive.JAF.Alerts.BlockingView', ['jquery'], function($j) {
return jive.oo.Class.extend(function(protect) {
    // emit events
    jive.conc.observable(this);

    protect.init = function( app) {
        this.app = app;
    };

    this.applyBlockingAlert = function( targetDomElement, alert ) {
        var alertDomHtml = this.prepareBlockingAlertHtml( this.app, alert );
        $j(targetDomElement).append( alertDomHtml );
        return alertDomHtml;
    };

    protect.prepareBlockingAlertHtml = function( app, alert ) {

        var setupHandler;
        var overlay = this;
        var appId = app.id;
        var modifier = '';

        if ( alert ) {
            switch( alert.code ) {
                case 1000:
                case 1010:
                    //
                    // configuration
                    //
                    if ( app.configurationError ) {
                        modifier = 'configurationError';
                    }
                    setupHandler = function( appHalt, errorHtml ) {
                        errorHtml.find(".j-error-msg-configure-app-btn").click( function() {
                            overlay.emit( "app.block", { type:"app.launch.config", app: app } );
                        });
                    };
                    break;
                case 2010:
                    //
                    // banned
                    //
                    setupHandler = function( appHalt, errorHtml ) {
                        errorHtml.find(".j-error-msg-remove-banned-app-btn").click( function() {
                            overlay.emit( "app.block", { type:"app.remove.banned", app: app } );
                        });
                        errorHtml.find(".j-error-msg-delete-app-btn").click( function() {
                            overlay.emit( "app.block", { type:"app.delete", app: app } );
                        });
                        errorHtml.find(".j-launch-market-faq").click( function() {
                            overlay.emit( "app.block", { type:"launch.market.faq", app: app } );
                        });
                    };
                    break;
                case 2020:
                    //
                    // blacklist
                    //
                    setupHandler = function( appHalt, errorHtml ) {
                        errorHtml.find(".j-error-msg-remove-blacklisted-app-btn").click( function() {
                            overlay.emit( "app.block", { type:"app.remove.blacklisted", app: app } );
                        });
                        errorHtml.find(".j-error-msg-delete-app-btn").click( function() {
                            overlay.emit( "app.block", { type:"app.delete", app: app } );
                        });
                        errorHtml.find(".j-launch-market-faq").click( function() {
                            overlay.emit( "app.block", { type:"launch.market.faq", app: app } );
                        });
                    };
                    break;
                case 2040:
                    //
                    // subscription expired
                    //
                    setupHandler = function( appHalt, errorHtml ) {
                        errorHtml.find(".j-error-msg-remove-subscription-expired-app-btn").click( function() {
                            overlay.emit( "app.block", { type:"app.launch.account", app: app } );
                        });
                        errorHtml.find(".j-visit-app-market-link").click( function() {
                            overlay.emit( "app.block", { type:"launch.market.faq", app: app } );
                        });
                    };
                    break;
                case 2050:
                    //
                    // instance disable
                    //
                    setupHandler = function( appHalt, errorHtml ) {
                        errorHtml.find(".j-error-msg-app-more-info-btn").click( function() {
                            overlay.emit( "app.block", { type:"launch.market.faq", app: app } );
                        });
                        errorHtml.find(".j-error-msg-delete-app-btn").click( function() {
                            overlay.emit( "app.block", { type:"app.delete", app: app } );
                        });
                    };
                    break;
                case 5010:
                    //
                    // instance disable
                    //
                    setupHandler = function( appHalt, errorHtml ) {
                        errorHtml.find(".j-error-msg-remove-throttle-violation-btn").click( function() {
                            overlay.emit( "app.block", { type:"app.remove.throttle.violation", app: app } );
                        });
                        errorHtml.find(".j-why-apps-may-be-suspended").click( function() {
                            overlay.emit( "app.block", { type:"launch.market.faq", app: app } );
                        });
                    };
                    break;
                case 5020:
                    setupHandler = function( appHalt, errorHtml ) {
                        errorHtml.find(".j-error-msg-delete-app-btn").click( function() {
                            overlay.emit( "app.block", { type:"app.delete", app: app } );
                        });
                        errorHtml.find(".j-error-msg-purchase-app-btn").click( function() {
                            overlay.emit( "app.block", { type:"app.launch.market", app: app } );
                        });
                    };
                    break;
                case 10404:
                    //
                    // unavailable (due to fetaure, service, permissions, etc.)
                    //
                    setupHandler = function( appHalt, errorHtml ) {
                        errorHtml.find(".j-error-msg-refresh-app-btn").click( function() {
                            overlay.emit( "app.block", { type:"app.refresh", app: app } );
                        });
                    };
                    break;
                case 10500:
                    //
                    // cannot load
                    //
                    setupHandler = function( appHalt, errorHtml ) {
                        errorHtml.find(".j-error-msg-delete-app-btn").click( function() {
                            overlay.emit( "app.block", { type:"app.delete", app: app } );
                        });
                        errorHtml.find(".j-error-msg-refresh-app-btn").click( function() {
                            overlay.emit( "app.block", { type:"app.refresh", app: app } );
                        });
                    };
                    break;
                case 6000:
                break;
            }
        }
        if ( !setupHandler ) {
            setupHandler = function( appHalt, errorHtml ) {
                errorHtml.find(".j-error-msg-refresh-app-btn").click( function() {
                    overlay.emit( "app.block", { type:"app.refresh", app: app } );
                });
            };
        }

        var templateArguments = {
            code: alert.code,
            modifier: modifier,
            message: alert.message,
            creator: alert.creator,
            errorMessage: alert.errorMessage,
            iconSrc: app.iconSrc,
            appTitle: app.title
        };

        // generate alert dom element
        var alertHtml = $j(jive.apps.alerts.renderAppHalt( templateArguments ) );

        // wire up the buttons
        setupHandler( this, alertHtml );

        // return the newly constructed alert dom
        return alertHtml;
    };

});
});
