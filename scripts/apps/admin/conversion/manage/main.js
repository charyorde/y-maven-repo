/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('admin.conversion.manage');

/**
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/jive/i18n.js
 * @depends path=/resources/scripts/soy/soyutils.js
 * @depends path=/resources/scripts/soy/goog_stub.js
 * @depends path=/resources/scripts/soy/soydata.js
 * @depends path=/resources/scripts/jive/soy_functions.js
 * @depends path=/resources/scripts/apps/admin/conversion/manage/models/manage_model.js
 * @depends path=/resources/scripts/apps/admin/conversion/manage/views/manage_view.js
 */
jive.admin.conversion.manage.Main = jive.oo.Class.extend(function(protect) {
    var _ = jive.admin.conversion.manage;

    this.init = function(options) {
        var main = this;
        options = options || {};

        this.updateInterval = (options.updateInterval || 15) * 1000;
        this.view = new _.View(options);
        this.model = new _.Model(options);
        this.view
                .addListener('ready', function() {
                    main.updateInflightConversions();
                    main.updateErrorConversions();
                });
    };

    this.updateInflightConversions = function updateInflightConversions() {
        var main = this;
        setTimeout(function() {
            main.model.getInFlightConversions().
                addCallback(function(data) {
                    main.view.updateInflightList(data);
                });

            main.updateInflightConversions();
        }, main.updateInterval);
    };

    this.updateErrorConversions = function updateErrorConversions() {
        var main = this;
        setTimeout(function() {
            main.model.getErrorConversions().
                addCallback(function(data) {
                    main.view.updateErrorList(data);
                });

           main.updateErrorConversions();
        }, main.updateInterval);
    };
});