/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
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
jive.MicroBlogging.MBCreateModalController = jive.MicroBlogging.CommonController.extend(function(protect, _super) {
    this.init = function (options) {
        if(!options){
            options = {};
        }
        options.trackingID = 'cmenu';
        this.options = options;
        _super.init.call(this, options);
    };

    protect.initMBView = function(){
        // setup microblogging view here
        var container = $j('#j-js-mb-modal-editor');
        this.microbloggingView = new jive.MicroBlogging.MicroBloggingView({
            selector:'#j-js-mb-modal-editor',
            idPostfix:'mbASHeader',
            atMentionBtn: container.find('a.jive-js-mention-button'),
            imgAttachmentBtn: container.find('a.jive-js-imgattach-button'),
            submitBtn: container.find('a.j-status-input-submit'),
            maxCharCount: 420
        });
    };

    protect.submitSuccessCallback = function(data, promise){
        _super.submitSuccessCallback.call(this, data, promise);
        $j('div.jive-modal-quickcreate').trigger('close');
        $j(jive.statusinput.containers.microbloggingStatusInputModalSuccess({wallentry: data.wallentry})).message({style: 'success'});
    };

});
