/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Activity.Info');  // Creates the jive.Activity namespace if it does not already exist.

/**
 * Handles UI for a list of link items
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends template=jive.browse.activityinfo.*
 *
 * @depends template=jive.soy.acclaim.*
 */
jive.Activity.Info.ActivityInfoView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    // a piece of content can have bookmarks that are both public and private. the UI needs to indicate that there may
    // be items that are not shown
    function isBookmarkType(value) {
        return value === 'bookmark';
    }


    this.init = function(options) {
        // properties
        var view = this;
        this.$modal = null;
        this.pageSize = options.pageSize;
        this.soyParams = {};

        
        // private methods
        this.renderModal = function(soyParams) {
            return $j(jive.soy.acclaim.renderAcclaimModal(soyParams));
        };

        /*
         * This exists so that if an unfollowed user listed in the Everyone tab becomes followed,
         * a row will be added to the Connections tab.
         */
        this.handleFollow = function(data) {
            if (this.$modal) {
                var $tables = this.$modal.find('table.js-everyone-list, table.js-friends-list'),
                    rowSelector = 'tr[data-user-id=' + data.id + ']';

                if (!$tables.eq(1).find(rowSelector).length) {
                    $tables.eq(0).find(rowSelector).clone().prependTo($tables.eq(1).find('tbody'));
                }
            }
        };


        // listen to events
        jive.switchboard.addListener('follow.user.complete', this.handleFollow.bind(this));

        // removed as part of JIVE-10173.
//        jive.switchboard.addListener('follow.create', function(follow) {
//            view.updateBrowseItemCounts('follow', follow.objectType, follow.objectID, true);
//        });
//
//        jive.switchboard.addListener('follow.destroy', function(follow) {
//            view.updateBrowseItemCounts('follow', follow.objectType, follow.objectID, false);
//        });
    };

    this.showUsers = function (userData, params) {
        var view = this,
            options = {
                centered       : true,
                destroyOnClose : true,
                onClose        : function() {
                    $j('.js-pop').remove();
                }
            };

        this.soyParams = protect.buildSoyParams(userData, params);
        this.$modal && this.$modal.remove(); // ensure only one instance of the modal
//        console.debug('%i users shown', this.soyParams.users.length);

        var $content = this.renderModal(this.soyParams);
        if (isBookmarkType(userData.activityType)) {
            var row = jive.soy.acclaim.privateBookmarkNotification();
            $content.find('table.js-everyone-list tbody').each(function() {
                $j(this).append(row);
            });
        }
        this.$modal = $content.lightbox_me(options);

        // attach radio events
        this.$modal.find('#jive-view-picker input:checkbox').click(function() {

            // 4 possible tables: all (0) friends (1), all with notes (2), friends with notes (3)
            var $filters = $j('#jive-view-picker input:checked');

            // if nothing is checked, default to table 0
            var tableIndex = 0;
            // one checked, use it's value as a table index
            if ($filters.length == 1) {
                tableIndex = $filters.val();
            }
            // two checked, use table index 3
            else if ($filters.length == 2) {
                tableIndex = 3;
            }
            view.$modal.find('table').hide();
            view.$modal.find('table').eq(tableIndex).show();
        });

        
        // attach endless scroll
        this.$modal.find('.jive-modal-content').endlessScroll({
            fireDelay : false,
            callback  : function(i) {
                if (view.soyParams.moreResults) {
                    view.emitP('loadUsersFromIndex', params, view.pageSize * i).addCallback(function(userData) {
                        view.soyParams.moreResults = userData.moreResults;
                        view.appendUsers(userData);
                    });
                }
            }
        });
    };


    this.appendUsers = function(userData) {
        var users = userData && userData.items ? userData.items : [];
        if (users.length > 0) {
            //console.debug('%i users appended', users.length);
            this.$modal.find('.j-js-private-bookmark-notification').remove();
            //grab rows from rendered table with same id as the currently visible table
            var $tbody = this.$modal.find('.jive-modal-content tbody:visible');
            var tableId = $tbody.parent().attr('id');
            var $renderedModal = this.renderModal($j.extend({}, this.soyParams, { users: users }));
            var $rows = $renderedModal.find('table#' + tableId + ' tr');
            $tbody.append($rows.clone());
            if (isBookmarkType(this.soyParams.activityType)) {
                var row = jive.soy.acclaim.privateBookmarkNotification();
                $tbody.append(row);
            }
        }
    };


    protect.buildSoyParams = function(userData, params) {
        return {
            activityType       : params.activityType,
            bidirectionalGraph : userData.bidirectionalGraph,
            currentUserID      : userData.currentUserID,
            currentUserPartner : userData.currentUserPartner,
            moreResults        : userData.moreResults,
            objectID           : params.objectID,
            objectType         : params.objectType,
            totalCount         : userData.totalCount,
            users              : userData.items,
            youID              : params.youID || userData.currentUserID,
            youPartner         : params.youPartner || userData.currentUserPartner
       };
    };

    // removed as part of JIVE-10173
//    protect.updateBrowseItemCounts = function(type, objectType, objectID, increment){
//        var $browseItem = $j('.js-browse-item[data-object-type=' + objectType + '][data-object-id=' + objectID + ']');
//        var $activitySource = $browseItem.find("a.js-activityinfo-source[data-activity-type='" + type + "']");
//        var countData = $activitySource.data("activity-count");
//        var count = countData ? parseInt(countData) : 0;  //because IE8 is that lame
//        count = (increment) ? ++count : --count;
//        count = (count < 0) ? 0 : count;    //just in case something is really off, make sure we never go negative
//        $activitySource.text(count);
//        $activitySource.data("activity-count", count);    //make sure data is kept in the loop
//    };
});
