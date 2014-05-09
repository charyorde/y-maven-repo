/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('content.documents');

/**
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/apps/content/documents/upload_view.js
 * @depends path=/resources/scripts/apps/content/common/main.js
 *
 */
jive.content.documents.Main = jive.content.common.Main.extend(function(protect, _super) {
    var _ = jive.content.documents;

    this.init = function(options) {
        if (options.upload) {
            this.options = $j.extend({
                resourceType: 'document/upload',
                rteOptions: {
                    preset: 'mini',
                    height: 200
                }
            }, options)
        } else {
            this.options = $j.extend({
                resourceType: 'document'
            }, options)
        }

         // attach the focus RTE capability to its label
        $j('#jive-upload-description-label').click(function (e) {
            if (window.editor && window.editor.toArray().length > 0) {
                window.editor.toArray()[0].focus();
                e.preventDefault();
            }
        });
        
        _super.init.call(this, this.options);

        // add the comments to the edit screen
        if (options.actionBean.commentBean && options.actionBean.commentBean.canViewComments) {
            $j('#jive-comments').load(_jive_base_url + '/doc-comments.jspa?document=' + options.actionBean.documentID + '&mode=comments')
        }

    };


    protect.createView = function(options) {
        if (this.options.upload) {
            return new _.UploadView(options);
        } else {
            return _super.createView.call(this, options);
        }
    };

});

