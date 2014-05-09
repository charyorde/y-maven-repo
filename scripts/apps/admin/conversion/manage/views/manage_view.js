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
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 * @depends template=jive.admin.conversion.manage.*
 */
jive.admin.conversion.manage.View = jive.oo.Class.extend(function(protect) {
    jive.conc.observable(this);

    this.init = function init(options) {
        var view = this;
        $j(document).ready(function() {
            view.emit('ready');
        });
    };

    protect.testObject = [{"error":false,"errorMessage":null,"converting":true,"pdfGenerated":true,"previewsGenerated":0,"previewsTotal":5,"thumbnailsGenerated":1,"conversionStartedTime":1293064742245,"thumbnailsTotal":1,"conversionProgressTime":1293064761783}];

    this.updateInflightList = function updateInflightList(conversions) {
        var $container = $j('#conversion-table-container');

        $container.empty();
        $container.append($j(jive.admin.conversion.manage.table({conversions: conversions})));
    };


    this.updateErrorList = function updateErrorList(conversionErrors) {
        var $container = $j('#conversion-error-table-container');

        $container.empty();
        $container.append($j(jive.admin.conversion.manage.errorTable({conversionErrors: conversionErrors})));
    };
});