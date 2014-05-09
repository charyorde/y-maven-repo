/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/**
 * ui view for activity tab
 *
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 */
jive.namespace('ActionQueue');

define('jive.ActionQueue.ActionQueueTabView', [
    'jquery'
], function($) {
    return jive.AbstractView.extend(function(protect, _super) {
        this.init = function (options) {
            _super.init.call(this, options);
            var tabView = this,
                content = tabView.getContent();

            content.on('click', 'a', function(e) {
                var $tabLink = $(this);
                tabView.emitP('switchTabs', $tabLink);
                e.preventDefault();
            });
        };

        this.selectTab = function (tabID) {
            this.getContent().find('a').removeClass('j-sub-selected font-color-normal');
            $('#'+tabID).addClass('j-sub-selected font-color-normal');
        };
    });
});

