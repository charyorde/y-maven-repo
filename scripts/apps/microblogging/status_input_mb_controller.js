/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('MicroBlogging');

/**
 * Controller for EAE activity Stream
 *
 * @class
 *
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/apps/microblogging/status_input_common_controller.js
 * @depends path=/resources/scripts/apps/microblogging/views/microblogging_view.js
 */
jive.MicroBlogging.MBController = jive.MicroBlogging.CommonController.extend(function(protect, _super) {
    this.init = function (options) {
        this.options = options;
        _super.init.call(this, options);
    };

    protect.initMBView = function(){
        // setup microblogging view here
        var container = $j('#j-js-mb-header-editor');
        this.microbloggingView = new jive.MicroBlogging.MicroBloggingView({
            selector:'#j-js-mb-header-editor',
            idPostfix:'mbASHeader',
            atMentionBtn: container.find('a.jive-js-mention-button'),
            imgAttachmentBtn: container.find('a.jive-js-imgattach-button'),
            submitBtn: container.find('a.j-status-input-submit'),
            cancelBtn: container.find('a.j-status-input-cancel'),
            maxCharCount: 420
        });
    };

});
