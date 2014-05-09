/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('advancedComment');

/**
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/apps/content/common/main.js
 *
 */
jive.advancedComment.Main = jive.content.common.Main.extend(function (protect, _super) {

    this.init = function (options) {
        this.options = $j.extend({
            resourceType:'advancedComment'
        }, options);
        _super.init.call(this, this.options);
    };

    this.getParent = function() {
        return this.options.actionBean.parentMessage;
    };

    this.getObjectId = function() {
        return this.options.actionBean.messageID;
    };

    this.getAppContext = function() {
        return this.options.actionBean.appContextBean;
    }
});

