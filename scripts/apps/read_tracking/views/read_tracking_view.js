/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('ReadTracking');

jive.ReadTracking.ReadTrackingView = jive.AbstractView.extend(function(protect) {

    // Mixes in `addListener` and `emit` methods so that other classes can
    // listen to events from this one.
    jive.conc.observable(this);

    this.init = function(options) {
        this.i18n       = options.i18n;
        this.options    = options;
        this.readTrackLock = false;
    };

    this.postRender = function(){
        var view = this;
        $j('#j-dynamic-pane').undelegate();
        $j('#j-dynamic-pane').delegate('#j-js-communications a.j-js-read-trigger', 'click', function(e) {
            view.markRead($j(this), e);
        }).delegate('#j-js-communications a.j-js-unread-trigger', 'click', function(e) {
            view.markUnread($j(this), e);
        }).delegate('#communications-mark-all-read', 'click', function(e) {
            view.markAllRead($j(this), e);
        });

        jive.switchboard.addListener('inbox.read', function(objectType, objectID, linkedDOMID) {
            $j('#'+linkedDOMID).removeClass('j-act-unread').addClass('j-act-read');
            $j('[data-linkedid='+linkedDOMID+']').removeClass('j-act-unread').addClass('j-act-read');
        }).addListener('inbox.unread', function(objectType, objectID, linkedDOMID) {
            $j('#'+linkedDOMID).removeClass('j-act-read').addClass('j-act-unread');
            $j('[data-linkedid='+linkedDOMID+']').removeClass('j-act-read').addClass('j-act-unread');
        }).addListener('inbox.markAllRead', function() {
            $j('#j-comm-activity-list').find('div.j-js-ibx-item').removeClass('j-act-unread').addClass('j-act-read');
            $j('#j-js-communications-exp').find('div.j-act-exp-view').removeClass('j-act-unread').addClass('j-act-read');
        });
    };

    this.markRead = function($link, e) {
        var view = this;
        if (e) {e.stopPropagation();}
        if (view.isReadTrackUnlocked()) {
            var linkedID, objectType, objectID, isRead;
            if ($link.closest('div.j-act-exp-view').length) {
                // reading pane read/unread link
                var $expView = $link.closest('div.j-act-exp-view');
                linkedID = $expView.attr('data-linkedid');
                objectType = linkedID.split('_')[1];
                objectID = linkedID.split('_')[2];
                isRead = $expView.hasClass('j-act-read');
            }
            else {
                // comm item list read/unread link
                var $article = $link.closest('div.j-js-ibx-item');
                linkedID = $article.attr('id');
                objectType = linkedID.split('_')[1];
                objectID = linkedID.split('_')[2];
                isRead = $article.hasClass('j-act-read');
            }

            if (!isRead) {
                var link = this;
                view.emitP('markRead', objectType, objectID, linkedID, true);
            }
        }
        if (e) {e.preventDefault();}
    };

    this.markUnread = function($link, e) {
        var view = this;
        if (e) {e.stopPropagation();}
        if (view.isReadTrackUnlocked()) {
            var linkedID, objectType, objectID, isRead;
            if ($link.closest('div.j-act-exp-view').length) {
                // reading pane read/unread link
                var $expView = $link.closest('div.j-act-exp-view');
                linkedID = $expView.attr('data-linkedid');
                objectType = linkedID.split('_')[1];
                objectID = linkedID.split('_')[2];
                isRead = $expView.hasClass('j-act-read');
            }
            else {
                // comm item list read/unread link
                var $article = $link.closest('div.j-js-ibx-item');
                linkedID = $article.attr('id');
                objectType = linkedID.split('_')[1];
                objectID = linkedID.split('_')[2];
                isRead = $article.hasClass('j-act-read');
            }

            if (isRead) {
                var link = this;
                view.emitP('markRead', objectType, objectID, linkedID, false);
            }
        }
        if (e) {e.preventDefault();}
    };

    this.markAllRead = function($link, e) {
        var view = this;
        if (e) {e.stopPropagation();}

        var shouldEmitMarkAllRead = true;
        if (jive.ActivityStream.activityNotifier && jive.ActivityStream.activityNotifier.getPollCount()) {
            var $tabCounter = $j('#jive-nav-link-communications').find('.j-js-update-indicator'),
                currentCount = parseInt($tabCounter.data('count'), 10);
            if (currentCount == 0) {
                shouldEmitMarkAllRead = false;
            }
        }

        if (shouldEmitMarkAllRead) {
            view.emitP('markAllRead');
        }
        if (e) {e.preventDefault();}
    };

    this.isReadTrackUnlocked = function () {
        // short timing lock to help prevent dual reads/un-reads in the db level due to race conditions.
        var view = this;
        if (!view.readTrackLock) {
            view.readTrackLock = true;
            setTimeout(function(){
                view.readTrackLock = false;
            }, 400);
            return true;
        }
        else {
            return false;
        }
    }

});
