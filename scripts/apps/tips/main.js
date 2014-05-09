/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint laxbreak: true */

jive.namespace('Tips');  // Creates the namespace if it does not already exist.

/**
 * Entry point for the Tips App.
 *
 * @depends path=/resources/scripts/apps/browse/user/model/user_source.js
 * @depends path=/resources/scripts/apps/tips/views/page_view.js
 * @depends path=/resources/scripts/jquery/jquery.ba-bbq.js
 */

jive.Tips.Main = jive.oo.Class.extend(function(protect) {

    protect.init = function(options) {
        var main = this;

        if (!$j.deparam.querystring().fromQ) {
            //temporarily hide system tips if we're doing a quest (trial or onboarding). The tip shouldn't even
            //be loaded if questing is enabled in anyway, but jic.
            main.userSource = options.userSource || new jive.Browse.User.ItemSource();
            main.tipView = new jive.Tips.PageView(options);
            main.skippedTipGroupIDs = options.skippedTipGroupIDs || [];

            //handle persisting state
            main.tipView.addListener('state', function(state) {
                if (state) {
                    if (!state.isSkipped()) {
    //                    console.info("updating tip state: " + state.serialize());
                        main.userSource.setUserProperty({userID: 'current', propName: state.getKey(), propValue: state.serialize()});
                    } else {
    //                    console.info("skipping tip group: " + state.getKey());
                        main.skippedTipGroupIDs.push(state.getKey());
                        document.cookie = "jive.tipGroups.skipped=" + main.skippedTipGroupIDs.unique().join("|");
                    }
                }

            });
        }
    };

});