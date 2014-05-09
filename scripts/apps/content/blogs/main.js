/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern jive $j */

/**
 * @depends path=/resources/scripts/jive/namespace.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/apps/content/common/main.js
 * @depends path=/resources/scripts/apps/content/blogs/models/blog_lookup.js
 */

/**
 * @name jive.content.blogs.Main
 */
jive.namespace('content.blogs');

jive.content.blogs.Main = jive.content.common.Main.extend(function(protect, _super) {

    this.init = function(options) {
        this.options = $j.extend({
            resourceType: 'blogPosts',
            edit: false,
            rteOptions: {}
        }, options);
        this.options.rteOptions = $j.extend({
            preset: "blog"
        }, this.options.rteOptions);
        _super.init.call(this, this.options);

        this.blogIDLookup = new jive.content.blogs.BlogIDLookup();
    };

    protect.contributeOptions = function(data) {
        var func = (this.options.edit) ? this.ajaxOptionsForEdit : this.ajaxOptionsForCreate;
        var opts = func(this.options.postID);
        return opts;
    };

    protect.ajaxOptionsForCreate = function(postID) {
        return {
            ajaxType: 'POST',
            suffix: '/'
        };
    };

    protect.ajaxOptionsForEdit = function(postID) {
        return {
            ajaxType: 'PUT',
            suffix: '/' + postID
        };
    };

});
