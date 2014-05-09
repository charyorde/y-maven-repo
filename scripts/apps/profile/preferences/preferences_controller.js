/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ProfilePreferences');

/**
 * Controller for profile preferences page
 *
 * @class
 *
 * @depends path=/resources/scripts/apps/activity_stream/models/activity_stream_source.js
 * @depends path=/resources/scripts/apps/activity_stream/models/activity_stream_exclusion.js
 * @depends path=/resources/scripts/apps/profile/preferences/views/preferences_view.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 */
jive.ProfilePreferences.Controller = jive.oo.Class.extend(function(protect) {
    this.init = function (options) {
        var profilePreferencesController = this;

        profilePreferencesController.streamService = new jive.ActivityStream.StreamSource();
        profilePreferencesController.preferencesView = new jive.ProfilePreferences.PreferencesView(options);

        profilePreferencesController.preferencesView
            .addListener('getHiddenRules', function(promise) {
                profilePreferencesController.streamService.getHiddenRules(promise);
            }).addListener('hidingRuleAction', function(data, promise) {
                var exclusionData = new jive.ActivityStream.ActivityStreamExclusion({
                    userID:window._jive_effective_user_id, excludeAction: data.hideType,
                    interactedObjectType: -1, interactedObjectID: -1});
                exclusionData.setObjectType(data.objectType);
                exclusionData.setObjectID(data.objectID);
                if (data.ruleType == 'type-context') {
                    exclusionData.setContentType(data.contentType);
                }
                profilePreferencesController.streamService.exclude(data.ruleType, exclusionData).addCallback(function (data) {
                    promise.emitSuccess(data);
                });
            });
    };
});
