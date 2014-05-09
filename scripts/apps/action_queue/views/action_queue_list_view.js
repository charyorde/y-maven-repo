/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/**
 * Main ui view for action queue
 *
 * @depends path=/resources/scripts/apps/action_queue/views/action_queue_item_view.js
 */
jive.namespace('ActionQueue');

jive.ActionQueue.ListView = jive.AbstractView.extend(function(protect, _super) {
    this.init = function(options) {
        var aqListView = this;
        _super.init.call(this, options);
        aqListView.archived = false;
        aqListView.actionQueueItems = [];
    };

    this.postRender = function() {
        var aqListView = this,
            content = aqListView.getContent();

        aqListView.actionQueueItems = [];

        content.delegate('a.j-js-load-more', 'click', function(e) {
            var $moreLink = $j(this),
                queueList = aqListView.actionQueueItems;

            this.spinner = new jive.loader.LoaderView({size: 'small', showLabel: false});
            this.spinner.appendTo($moreLink);
            $moreLink.find('.j-more-label').hide();
            $moreLink.addClass('j-append-active');

            aqListView.emitP('loadMore', queueList[queueList.length - 1].getCreationDate())
                .addCallback(function(data) {
                    var renderedData = $j(jive.eae.actionqueue.actionQueueList({'actionQueue': data}));
                    renderedData.hide();
                    $moreLink.before(renderedData);
                    $moreLink.remove();
                    renderedData.fadeIn(2000);
                    renderedData.filter('div.j-aq-entry').each(function(i) {
                        aqListView.initQueueItem($j(this), i, true);
                    });
                });
            e.preventDefault();
        });

        $j('#j-action-queue div.j-aq-entry').each(function(i) {
            aqListView.initQueueItem($j(this), i, true);
        });
    };

    this.initQueueItem = function($listElem, streamItemIndex, doAppend) {
        var aqListView = this,
            queueList = aqListView.actionQueueItems,
            actionQueueItem = new jive.ActionQueue.ListItemView({
                selector: '#' + $listElem.attr('id'),
                itemID: parseInt($listElem.attr('id').split('_')[2]),
                creationDate: $listElem.attr('data-creationDate')
            });

        actionQueueItem.addListener('performAction',
            function(itemID, actionCode, message) {
                aqListView.emit('performAction', itemID, actionCode, message);
            }).addListener('actionCompleted', function() {
                var oldestTime = queueList[queueList.length - 1].getCreationDate();
                aqListView.emitP('actionCompleted', oldestTime).addCallback(function(data) {
                    var $queueContent = $j('#j-action-queue');
                    if (data.actionQueueList.length) {
                        var $moreLink = $queueContent.find('a.j-js-load-more');
                        $moreLink.addClass('j-append-active');
                        $moreLink.remove();
                        var renderedData = $j(jive.eae.actionqueue.actionQueueList({'actionQueue': data}));
                        renderedData.hide();
                        $queueContent.append(renderedData);
                        renderedData.fadeIn(2000);
                        renderedData.filter('div.j-aq-entry').each(function(i) {
                            aqListView.initQueueItem($j(this), i, true);
                        });
                    }
                    else if (!$queueContent.find('div.j-aq-entry').length) {
                        // set the contents of the inner div with the same id to get around popover issue of creating the wrapper div w/same id
                        $queueContent.prepend(jive.eae.actionqueue.noActionQueueResults({
                            archived: aqListView.archived
                        }));
                    }
                })
            });

        actionQueueItem.postRender();

        if (doAppend) {
            queueList.push(actionQueueItem);
        }
        else {
            return actionQueueItem;
        }
    };

    this.actionTaken = function(itemID, data) {
        var aqListView = this,
            queueList = aqListView.actionQueueItems;

        for (var i = 0; i < queueList.length; i++) {
            var item = queueList[i];
            if (item.getID() == itemID) {
                item.actionTaken(data);
            }
        }
    };

    this.reset = function(viewData) {
        var aqListView = this;
        var $newQueuesView = $j(jive.eae.actionqueue.actionQueue(
            {'actionQueue': viewData,
             'archived':viewData.archived}));
        $j('#j-action-queue').html($newQueuesView);
        aqListView.actionQueueItems = [];
        $j('#j-action-queue div.j-aq-entry').each(function(i) {
            aqListView.initQueueItem($j(this), i, true);
        });
    };

    /**
     * Method to add new items to the start of the list.  Also called on initial async load of list or when a reload of list is forced.
     */
    this.refresh = function(data) {
        var aqListView = this,
            $queueContent = $j('#j-action-queue'),
            noResultsLink = $queueContent.find('.j-js-aq-noresults');
        noResultsLink.remove();

        $queueContent.empty();
        aqListView.actionQueueItems = [];

        var renderedData = $j(jive.eae.actionqueue.actionQueueList({'actionQueue': data}));
        $queueContent.prepend(renderedData);
        renderedData.show();


        var tempItemArray = [];
        renderedData.filter('div.j-aq-entry').each(function(i) {
            tempItemArray.push(aqListView.initQueueItem($j(this), i, false));
        });
        aqListView.actionQueueItems = tempItemArray.concat(aqListView.actionQueueItems);
    };

});
