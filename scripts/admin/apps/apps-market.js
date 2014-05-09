/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jiveJAFAdminAppsMarket = $Class.extend({

    init:  function( appsEnabled ) {
        var self = this;
            self.wireEvents();
            self.radioCheck();
            self.enabledSectionsCheck(true);
    },

    enabledSectionsCheck: function( fast ) {
        var enabled = $j('input[type="radio"]:checked').val() === "enableapps";
        if ( enabled ) {
            if ( fast ) {
                $j(".config-section").show();
            } else {
                $j(".config-section").fadeIn();
            }
        } else {
            if ( fast ) {
                $j(".config-section").hide();
            } else {
                $j(".config-section").fadeOut();
            }
        }
    },

    wireEvents: function() {
        var self = this;
        $j('input[type="radio"]').change(self.radioCheck);

        $j('.info-message').hide();
        $j('[type="submit"]').click( function(e){
            e.preventDefault();
            var enabled = $j('input[type="radio"]:checked').val() === "enableapps";
            var ENDPOINT = jive.api.apps("admin") + "/enabled/" + enabled;
            var msg = $j(this).siblings(".success.info-message");
            var err = $j(this).siblings(".error.info-message");
            $j.ajax( {
                url: ENDPOINT,
                contentType: "application/json",
                dataType: "json",
                type: 'PUT',
                success: function( data ) {
                    msg.fadeIn();
                    setTimeout( function() { msg.fadeOut() }, 3000);
                    self.enabledSectionsCheck();
                },
                error: function( xhr ) {
                    err.fadeIn();
                    setTimeout( function() { err.fadeOut() }, 3000);
                }
            } );
        });

        $j('.btn-generate-new-credentials').click( function(e) {
            e.preventDefault();
            $j('.registration-started').show();
            var ENDPOINT = jive.api.apps("admin") + "/regenoauth";
            $j.ajax( {
                url: ENDPOINT,
                contentType: "application/json",
                dataType: "json",
                type: 'PUT',
                success: function( data ) {
                    $j('.registration-started').hide();
                    $j('.registration-failed').hide();
                    $j('.registration-success').fadeIn();
                    $j( "span.oauth-status-txt").text("Successful");
                    $j('.oauth-status.valid').show();
                },
                error: function( xhr ) {
                    $j('.registration-started').hide();
                    $j('.registration-success').hide();
                    $j('.registration-failed').fadeIn();
                    $j('.oauth-status.invalid').show();
                    $j("span.oauth-error-message-lbl").text("Last error encountered:");
                    $j("span.oauth-error-message-txt").text( JSON.parse( xhr.responseText ).message );
                }
            } );
        });

        $j('.btn-start-poller').click( function(e) {
            e.preventDefault();
            var msg = $j(this).siblings(".success.info-message");
            var err = $j(this).siblings(".error.info-message");
            var ENDPOINT = jive.api.apps("admin") + "/runpoller/true";
            $j.ajax( {
                url: ENDPOINT,
                contentType: "application/json",
                dataType: "json",
                type: 'PUT',
                success: function( data ) {
                    msg.fadeIn();
                    setTimeout( function() { msg.fadeOut() }, 3000);
                },
                error: function( xhr ) {
                    err.fadeIn();
                    setTimeout( function() { err.fadeOut() }, 3000);
                }
            } );
        });

        $j('.btn-start-pusher').click( function(e) {
            e.preventDefault();
            var ENDPOINT = jive.api.apps("admin") + "/runpusher/true";
            var msg = $j(this).siblings(".success.info-message");
            var err = $j(this).siblings(".error.info-message");
            $j.ajax( {
                url: ENDPOINT,
                contentType: "application/json",
                dataType: "json",
                type: 'PUT',
                success: function( data ) {
                    msg.fadeIn();
                    setTimeout( function() { msg.fadeOut() }, 3000);
                },
                error: function( xhr ) {
                    err.fadeIn();
                    setTimeout( function() { err.fadeOut() }, 3000);
                }
            } );
        });

        $j('.btn-test-gateway').click( function(e) {
            e.preventDefault();
            var ENDPOINT = jive.api.apps("admin") + "/gatewayup";
            var msg = $j(this).siblings(".success.info-message");
            var err = $j(this).siblings(".error.info-message");
            $j.ajax( {
                url: ENDPOINT,
                contentType: "application/json",
                dataType: "json",
                type: 'GET',
                success: function( data ) {
                    msg.fadeIn();
                    setTimeout( function() { msg.fadeOut() }, 3000);
                    if ( data ) {
                        $j('.gateway-status').hide();
                        $j('.gateway-status.valid').fadeIn();
                    } else {
                        $j('.gateway-status').hide();
                        $j('.gateway-status.invalid').fadeIn();
                    }
                },
                error: function( xhr ) {
                    err.fadeIn();
                    setTimeout( function() { err.fadeOut() }, 3000);
                }
            } );
        });

        $j(document).ready(function() {
           self.startAppDiagnostics();
        });
    },

    radioCheck: function() {
        $j('.info-message').hide();
        $j('input[type="radio"]').each(
            function() {
                if($j(this).is(":checked")) {
                    $j(this).closest('li').addClass('checked').find('.test-row').fadeIn(300);
                } else {
                    $j(this).closest('li').removeClass('checked').find('.test-row').fadeOut(300);
                }
            }
        );
    },

    startAppDiagnostics: function() {

        var serviceUrl = '/__services/v2/rest/admin/network/tools/echo/diagnostic';
        this.appDiagnosticTests = [
            {
                method: 'GET',
                url: serviceUrl + '?test=get',
                description: 'Unable to perform http GET request'
            },
            {
                method: 'POST',
                url: serviceUrl + '?test=post',
                description: 'Unable to perform http POST request'
            },
            {
                method: 'PUT',
                url: serviceUrl + '?test=put',
                description: 'Unable to perform http PUT request'
            },
            {
                method: 'DELETE',
                url: serviceUrl + '?test=delete',
                description: 'Unable to perform http DELETE request'
            },
            {
                method: 'GET',
                url: serviceUrl + '?test%3Dthis%2Bthat',
                description: 'Unable to perform http GET request containing percentage'
            },
            {
                method: 'GET',
                url: serviceUrl + '?test=this:that',
                description: 'Unable to perform http GET request containing colon'
            }
        ];

        var customUrl = $j('#appsconnectivity-url').html();
        if (customUrl.length > 0) {

            this.appDiagnosticTests.unshift({
                method: 'GET',
                url: customUrl,
                description: 'Unable to perform custom GET request'
            });

        }

        this.resetAppDiagnostics();
        this.runAppDiagnostics();

    },

    resetAppDiagnostics: function() {

        this.appDiagnosticsFailure = null;
        this.displayAppDiagnostics('', '');

    },

    runAppDiagnostics: function() {

        if (this.appDiagnosticTests.length === 0) {
            this.reportAppDiagnostics(true);
            return;
        }

        var self = this;
        var diagnosticTest = this.appDiagnosticTests.shift();
        diagnosticTest.success = false;

        $j.ajax({
            type: diagnosticTest.method,
            url: _jive_base_url + diagnosticTest.url,
            contentType: "application/json",
            dataType: "json",
            complete: function(xhr, status) {
                if (!diagnosticTest.success) {
                    self.failedAppDiagnostics(diagnosticTest, 'Request did not complete successfully');
                }
                else {
                    self.runAppDiagnostics();
                }
            },
            success: function(data) {
                diagnosticTest.success = true;
            },
            error: function(xhr, status, error) {
                self.failedAppDiagnostics(diagnosticTest, 'Request error');
            }
        });

    },
    
    failedAppDiagnostics: function(test, error) {
        this.appDiagnosticsFailure = error + '<br>' + test.description + '<br>(method: '+test.method+', url: '+test.url+')';
        this.reportAppDiagnostics(false);
    },

    reportAppDiagnostics: function(success) {
        var t = 'Success', s = '', c = 'valid', icon = 'check';
        if (!success) {
            t = 'Failed';
            s = this.appDiagnosticsFailure;
            c = 'invalid';
            icon = 'redalert';
        }
        this.displayAppDiagnostics('<span class="jive-icon-sml jive-icon-'+icon+'"></span>' + t, s, 'market-status ' + c);
    },

    displayAppDiagnostics: function(status, report, c) {
        $j('#appsconnectivity-status').attr('class', c || '').html(status);
        if (report.length > 0)
            $j('#appsconnectivity-report').html(report).show();
    }

});

