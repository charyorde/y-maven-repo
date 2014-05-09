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
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/promise.js
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 * @depends path=/resources/scripts/jive/json-security.js
 */
jive.admin.conversion.settings.Model = jive.RestService.extend(function(protect) {

    protect.resourceType = protect.pluralizedResourceType = "conversion/settings";

    this.saveSettings = function saveSettings(settings) {
        var url = this.RESOURCE_ENDPOINT + '/save';
        //This is necessary for admin console apps due to the continued inclusion of prototype... PROTOTYYYPE!
        var data = Object.toJSON ? Object.toJSON(settings) : JSON.stringify(settings);

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url: url, data: data});
    };

    this.test = function test() {
        var url = this.RESOURCE_ENDPOINT + '/test';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url: url});
    };

    this.testOfficeToPDF = function testOfficeToPDF(hostname) {
        var url = this.RESOURCE_ENDPOINT + '/testOfficeToPDF';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url: url, data: hostname});
    };

    this.testPdfToSwf = function testPdfToSwf(hostname) {
        var url = this.RESOURCE_ENDPOINT + '/testPdfToSwf';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url: url, data: hostname});
    };

    this.serviceStats = function serviceStats(hostname) {
        var url = this.RESOURCE_ENDPOINT + '/serviceStats';
        var obj = {};
        obj.hostname = hostname;
        
        //This is necessary for admin console apps due to the continued inclusion of prototype... PROTOTYYYPE!
        var data = Object.toJSON ? Object.toJSON(obj) : JSON.stringify(obj);

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url: url, data: data});
    };

    this.testStatus = function testStatus(conversionMetaDataID) {
        var url = '/__services/v2/rest/office/status/' + conversionMetaDataID;

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url: url});
    };
});
