/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('discussions');

/**
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/apps/content/common/main.js
 *
 */
jive.discussions.Main = jive.content.common.Main.extend(function(protect, _super) {

    this.init = function(options) {
        this.options = $j.extend({
            resourceType: 'discussion',
            autoSave: {
                properties: ['markAsQuestion']
            }
        }, options);
        _super.init.call(this, this.options);

        var editByBox = $j("#jive-edit-by-box");
        editByBox.hide();
        $j("#jive-edit-by-checkbox").click(function() {
            // TODO - need UI love on this
            if ($j(this).is(":checked")) {
                editByBox.fadeIn(50);
            } else {
                editByBox.fadeOut(50);
            }
        })
    };

    this.getObjectId = function() {
        return this.options.actionBean.threadID;
    };

});

