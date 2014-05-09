/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('admin.conversion.settings');

/**
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/jive/i18n.js
 * @depends path=/resources/scripts/soy/soyutils.js
 * @depends path=/resources/scripts/soy/goog_stub.js
 * @depends path=/resources/scripts/soy/soydata.js
 * @depends path=/resources/scripts/jive/soy_functions.js
 * @depends path=/resources/scripts/apps/admin/conversion/settings/views/settings_view.js
 * @depends path=/resources/scripts/apps/admin/conversion/settings/models/settings_model.js
 */
jive.admin.conversion.settings.Main = jive.oo.Class.extend(function(protect) {
    var _ = jive.admin.conversion.settings;

    this.init = function(options) {
        var main = this;

        this.view = new _.View(options);
        this.model = new _.Model(options);

        this.view
            .addListener('fullTest', function($button) {
                main.model.test()
                    .addCallback(function() {
                            $button.next().empty().append(" Success!");
                    })
                    .addErrback(function(data) {
                            $button.next().empty().append("Error: " + data);
                    });                    
            })
            .addListener('serviceStats', function($link) {
                var host = $link.closest('.node-fieldset').find('input[name="processingNodes"]').val();
               main.model.serviceStats(host)
                    .addCallback(function(data) {
                        delete data.id;
                        main.view.displayStats(data, $link.closest('.node-fieldset'));
                    });
            })
            .addListener('settingsSaved', function(settings) {
                main.model.saveSettings(settings);
                //TODO Failure callback/Validation
                main.view.saveSuccess(settings['conversionEnabled'] == "true");
            })
            .addListener('testOfficeToPDF', function($button) {
                var host = $button.closest('.node-fieldset').find('input[name="processingNodes"]').val();
                main.model.testOfficeToPDF(host)
                    .addCallback(function() {
                        $button.next().empty().append("Success!");
                    })
                    .addErrback(function(data) {
                        $button.next().empty().append("Error: " + data);
                    });
            })
            .addListener('testPdfToSwf', function($button) {
                var host = $button.closest('.node-fieldset').find('input[name="processingNodes"]').val();
                main.model.testPdfToSwf(host)
                    .addCallback(function() {
                        $button.next().empty().append("Success!");
                    })
                    .addErrback(function(data) {
                        $button.next().empty().append("Error: " + data);
                    });
            });
    };

    protect.checkStatus = function checkStatus(conversionMetaDataID, isConverting, data) {
        var main = this;
        data = data || {};

        if (isConverting) {
            setTimeout(function() {
                main.model.testStatus(conversionMetaDataID).addCallback(function(data) {
                    main.checkStatus(conversionMetaDataID, data.converting, data);
                });
            }, 2000);
        } else {
            main.view.displayTestResults(data);
        }
    };
});