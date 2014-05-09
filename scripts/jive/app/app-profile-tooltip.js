/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @param options
 */
define('jive.AppProfileTooltip', ['jquery'], function($j) {
return $Class.extend({

    init: function(app) {
        this.app = app;
        this.appIframe = $j('#' + app.iframeId);
        this.presence = false;

        // these profile* variables are available globally. at some point they might not be
        this.urlToLoad   = profileShortUrl;
        this.loadingText = profileLoadingTooltip;
        this.errorText   = profileErrorTooltip;

        this.loadingHTML = '<strong class="jive-tooltip2-loading">' + this.loadingText + '</strong>';
    },

    show: function(userId, iframeMousePos) {
        var tooltipPos = this.getTooltipPos(iframeMousePos);

        this.hide();
        var html = $j(jive.apps.base.renderAppProfileTooltip({top: tooltipPos.top, left: tooltipPos.left}));

        $j('body').append(html);

        this.getUserProfileTooltip(userId, this.presence);
    },

    hide: function() {
        $j('#jive-app-profile-toolip').remove();
    },

    getTooltipPos: function(iframeMousePos) {
        var iframeOffset = this.appIframe.offset();

        var htmlEl = $j('html');
        var bodyEl = $j('body');

        var bodyMarginTop  = ( htmlEl.height() - bodyEl.height() ) / 2;
        var bodyMarginLeft = ( htmlEl.width()  - bodyEl.width()  ) / 2;

        var tooltipTop  = iframeMousePos.top  + iframeOffset.top  - bodyMarginTop;
        var tooltipLeft = iframeMousePos.left + iframeOffset.left - bodyMarginLeft;

        // adjustment so tooltip ends up under the mouse
        tooltipTop  -= 10;
        tooltipLeft -= 10;

        return {
            top  : tooltipTop,
            left : tooltipLeft
        };
    },

    getUserProfileTooltip: function(targetUserID, presence) {
        if ( presence ) {
            this.presence = presence;
        }
        this.cancelTooltip();
        $j('#jive-app-profile-toolip-body').html(this.loadingHTML);
        this.timeoutExecutor = new TimeoutExecutor(this.getUserProfile.bind(this, targetUserID), 700);
    },

    getUserProfile: function(userID) {
        var instance = this;
        var presence = this.presence;
        var urlToLoad = this.urlToLoad;
        if ( this.presence ) {
            urlToLoad = this.urlToLoad + "&presencePostfix=" + this.presence.getPresencePostfix();
        }

        $j.ajax({
            url: urlToLoad,
            type: 'GET',
            dataType: 'html',
            data: {
                userID: userID,
                presence: this.presence
            },
            success: function(data) {
                $j('#jive-app-profile-toolip-body').html(data);
            },
            error: function() {
                $j('#jive-app-profile-toolip-body').text(instance.profileErrorTooltip);
            },
            complete: function() {
                if ( presence && presence.start ) {
                    presence.start();
                }
            }
        });
    },

    cancelTooltip: function() {
        if (this.timeoutExecutor) {
            this.timeoutExecutor.cancel();
        }
        if ( this.presence ) {
            this.presence.stop();
        }
    }

});
});
