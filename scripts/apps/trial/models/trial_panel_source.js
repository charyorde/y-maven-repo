/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint undef:true laxbreak:true */
/*global jive $j */

jive.namespace('Trial');  // Creates the jive.Trial namespace if it does not already exist.

/**
 * Interface to history REST service filtered to return only places.
 *
 * @extends jive.RestService
 * @param {Object} options
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.Trial.PanelSource = jive.RestService.extend(function(protect, _super) {
    protect.resourceType = "container";

    protect.init = function(options) {
        options = options || {};
        _super.init.call(this, options);

        this.RESOURCE_ENDPOINT =  jive.rest.url("/trial");
    };

    this.getShouldShowTips = function(questID, questStep, promise) {
        var url = this.RESOURCE_ENDPOINT + '/shouldShowTips/' + questID + '/' + questStep;

        return this.commonAjaxRequest(promise, 'GET', { url: url });
    };

    /**
     *
     * @param {String} questName the quest name to persist
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.saveLastViewedQuest = function(questName) {
        var url = this.RESOURCE_ENDPOINT + '/lastViewedQuest?q='+questName;

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', { url: url, data: questName });
    };

    this.saveProgress = function(newestItemTime) {
        var url = this.RESOURCE_ENDPOINT + '/saveProgress';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', { url: url, data: newestItemTime });
    };

    this.clearUserTipQueue = function() {
        var url = this.RESOURCE_ENDPOINT + '/userTipQueue';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'DELETE', { url: url});
    };
});

define('jive.trial.PanelSource', function() {
    return jive.Trial.PanelSource;
});
