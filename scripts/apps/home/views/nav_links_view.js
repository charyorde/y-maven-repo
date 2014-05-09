/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('HomeNav');

/**
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/activity_stream/activity_notifier.js
 * @depends template=jive.welcome.*
 * @depends template=jive.eae.activitystream.builder.deleteStreamModal
 */
jive.HomeNav.LinksView = jive.AbstractView.extend(function(protect) {

    this.init = function (options) {
        var linksView = this;
        this.editMode = false;
        this.pollingEnabled = options.pollingEnabled;
        this.canPin = options.canPin;
        this.supportPushState = options.supportPushState;
        this.maxCustomStreams = options.maxCustomStreams;
        this.lastEditNameSuccess = true;
    };

    this.getContent = function() {
        return $j('#j-home-side-nav');
    };

    this.setEditMode = function(editMode) {
        var linksView = this,
            content = linksView.getContent();
        if (editMode == false) {
            linksView.endStreamNameEditing();
            content.find('li.editing').removeClass('editing');
        }
        this.editMode = editMode;
    };

    this.postRender = function(options) {
        var linksView = this,
            content = linksView.getContent();

        jive.ActivityStream.activityNotifier.addListener('activityStream.poll', function(data) {
            linksView.updateCounts(data);
        });

        jive.switchboard.addListener('inbox.read', function() {
            linksView.decrementNavCount('communications', 1);
        }).addListener('inbox.unread', function() {
            linksView.decrementNavCount('communications', -1);
        }).addListener('inbox.markAllRead', function() {
            linksView.decrementNavCount('communications', 10000);
        }).addListener('actions.actionTaken', function() {
            linksView.decrementNavCount('actions', 1);
        }).addListener('tasks.taskComplete', function() {
            linksView.decrementNavCount('actions', 1);
        }).addListener('tasks.taskIncomplete', function() {
            linksView.decrementNavCount('actions', -1);
        }).addListener('onboarding.state.update', function(viewData) {
            linksView.updateOnboardingProgress(viewData);
        });

        content.delegate('.j-js-pin-stream', 'click', function(e) {
            linksView.pin($j(this).closest('li'));
            e.stopPropagation();
            e.preventDefault();
        }).delegate('.j-js-stream-options', 'click', function(e) {
            linksView.streamConfigMenu($j(this));
            e.preventDefault();
        }).delegate('.j-js-edit-stream', 'click', function(e) {
            // for create stream button
            if (linksView.lastEditNameSuccess && !linksView.creatingNewStream) {
                linksView.creatingNewStream = true;
                linksView.endStreamNameEditing();
                linksView.setEditMode(false);
                var $navItem = $j(this).closest('li'),
                    streamID = $navItem.data('streamid');
                if (!$navItem.hasClass('j-max-streams-reached')) {
                    linksView.emitP('loadBuilderView', streamID).addCallback(function() {
                        linksView.creatingNewStream = false;
                    });
                }
            }
            e.preventDefault();
        }).delegate('.j-js-done-building', 'click', function(e) {
            e.preventDefault();
            if (linksView.lastEditNameSuccess) {
                linksView.endStreamNameEditing();
                linksView.setEditMode(false);
                linksView.emitP('closeBuilder');
            }
        }).delegate('.j-js-side-nav-link', 'click', function(e) {
            var $navLink = $j(this),
                $parentNavItem = $navLink.closest('li'),
                id = $parentNavItem.attr('id'),
                type = '',
                streamID = '',
                success = true;
            e.preventDefault();
            if (linksView.lastEditNameSuccess) {
                linksView.endStreamNameEditing();
                linksView.setEditMode(false);
                if (id == 'jive-nav-link-dashboard') {
                    type = 'dashboard';
                }
                else if (id == 'jive-nav-link-activity') {
                    type = 'all';
                    streamID = '0';
                }
                else if (id == 'jive-nav-link-communications') {
                    type = 'communications';
                }
                else if (id == 'jive-nav-link-actions') {
                    type = 'actions';
                }
                else if (id == 'jive-nav-link-moderation') {
                    type = 'moderation';
                }
                else if (id == 'jive-nav-link-get-started') {
                    type = 'onboarding';
                }
                else {
                    type = $parentNavItem.data('source');
                    streamID = $parentNavItem.data('streamid');
                }
                if (type) {
                    linksView.emitP('loadView', type, streamID).addCallback(function() {
                        linksView.updateSelectedNavItem($parentNavItem);
                    });
                }
            }
        });
    };

    this.editStreamName = function($navItem, focus) {
        var linksView = this,
            $newForm = $j(jive.welcome.streamNameEditForm({streamName: $navItem.find('.j-js-nav-stream-name').text()})),
            $navLink = $navItem.find('.j-js-as-nav-link');
        if ($navItem.data('source') != 'connections') {
            $navLink.hide();
            $navLink.after($newForm);
            var $streamNameInput = $newForm.find('.j-js-stream-name-input');
            if (focus) {
                $streamNameInput.focus();
                $streamNameInput.select();
            }
            $streamNameInput.unbind().bind('keypress', function(e) {
                if (e.which == '13') {
                    e.preventDefault();
                }
            }).bind('blur', function(e) {
                linksView.lastEditNameSuccess = linksView.saveStreamName(e, false);
            });
        }
        else {
            $navItem.find('a.j-js-as-nav-link').hide();
            $navItem.find('span.js-conns-display-name').show();
        }
    };

    this.saveStreamName = function(e, onBuilderClose) {
        var linksView = this,
            content = linksView.getContent(),
            $nameInput = content.find('.j-js-stream-name-input'),
            newName = $nameInput.val(),
            $navItem = $nameInput.closest('li'),
            $displayNameLink = $navItem.find('.j-js-as-nav-link'),
            oldName = $displayNameLink.find('.j-js-nav-stream-name').text(),
            configObj = {};
        if (!$nameInput.length) {
            // connections stream won't be editable/have form
            return true;
        }
        if (!newName || !$j.trim(newName)) {
            $j('<p>'+jive.eae.activitystream.builder.jsI18nHelper(
                {key:'eae.activitystream.builder.displayname.blankerror'})+'</p>').message({style: 'error'});
            e.stopImmediatePropagation();
            return false;
        }
        else if (newName.indexOf("|") != -1 || newName.indexOf("(") != -1 || newName.indexOf(")") != -1) {
            $j('<p>'+jive.eae.activitystream.builder.jsI18nHelper(
                {key:'eae.activitystream.builder.displayname.badcharacters'})+'</p>').message({style: 'error'});
            e.stopImmediatePropagation();
            return false;
        }
        else {
            if (oldName != newName) {
                configObj.name = newName;
                configObj.id = $navItem.data('streamid');
                configObj.source = $navItem.data('source');
                configObj.receiveEmails = $j('#stream-builder .j-js-emails').hasClass('on');
                linksView.emitP('saveStreamName', configObj).addCallback(function(streamBean) {
                    if (streamBean.message && streamBean.message == 'name-not-unique') {
                        $j('<p>'+jive.eae.activitystream.builder.jsI18nHelper({
                            key:'api.core.v3.error.duplicate_stream',
                            param1: '"'+newName+'"'
                        })+'</p>').message({style: 'error'});
                    }
                    else if (streamBean.message && streamBean.message == 'name-too-long') {
                        $j('<p>'+jive.eae.activitystream.builder.jsI18nHelper({
                            key:'api.core.v3.error.invalid_name_length',
                            param1: ''+streamBean.param1
                        })+'</p>').message({style: 'error'});
                    }
                    else {
                        $displayNameLink.find('.j-js-nav-stream-name').text(newName);
                        if (onBuilderClose) {
                            linksView.endStreamNameEditing();
                        }
                    }
                });
            }
            else if (onBuilderClose) {
                linksView.endStreamNameEditing();
            }
            return true;
        }
    };

    this.endStreamNameEditing = function() {
        var linksView = this,
            content = linksView.getContent(),
            $nameInput = content.find('.j-js-stream-name-input'),
            $inputForm = $nameInput.closest('form'),
            $navItem = $nameInput.closest('li'),
            $displayNameLink = $navItem.find('.j-js-as-nav-link');
        if ($inputForm.length) {
            $displayNameLink.show();
            $inputForm.remove();
        }
        else {
            //comms stream
            $navItem = content.find('li[data-source=connections]');
            $navItem.find('span.js-conns-display-name').hide();
            $navItem.find('a.j-js-as-nav-link').show();
        }
    };

    this.streamConfigMenu = function($configButton) {
        var linksView = this,
            $navItem = $configButton.closest('li'),
            streamID = $navItem.data('streamid'),
            pinned = $navItem.hasClass('pinned'),
            canDelete = $navItem.data('source') != 'connections',
            $configPop = $j(jive.welcome.navConfigMenuPopover({
                canDelete: canDelete,
                canPin: (!pinned && linksView.canPin)
            }));
        $configPop.delegate('.j-js-pin-stream', 'click', function(e) {
            linksView.pin($navItem);
            $configPop.trigger('close');
            e.preventDefault();
        }).delegate('.j-js-edit-stream', 'click', function(e) {
            var streamID = $navItem.data('streamid');
            linksView.emitP('loadBuilderView', streamID).addCallback(function() {
                $navItem.addClass('editing');
            });
            $configPop.trigger('close');
            e.preventDefault();
        }).delegate('.j-js-delete-stream', 'click', function(e) {
            var $confirmModal = $j(jive.eae.activitystream.builder.deleteStreamModal({streamID: streamID}));
            $confirmModal.lightbox_me({destroyOnClose: true, centered: true,
                onLoad:function(){
                    $confirmModal.delegate('#stream-delete-submit-button', 'click', function(e2) {
                        var $button = $j(this),
                            streamID = $button.data('id');
                            linksView.emitP('deleteStream', streamID).addCallback(function(data) {
                                linksView.removeDeletedStream(data);
                                $confirmModal.trigger('close');
                            });
                        e2.preventDefault();
                    });
                }
            });
            $configPop.trigger('close');
            e.preventDefault();
        });
        $configPop.popover({
            context: $configButton,
            darkPopover: true
        });
    };

    this.postBuilderLoad = function(streamViewBean) {
        var linksView = this,
            content = linksView.getContent();
        linksView.editMode = true;
        if (streamViewBean.configuration.newStream) {
            var $newNavItem = $j(jive.welcome.activityStreamNavItem({
                id: streamViewBean.configuration.id,
                url: '#',
                name: streamViewBean.configuration.name,
                source: streamViewBean.configuration.source,
                canPin: linksView.canPin,
                pollingEnabled: linksView.pollingEnabled
            }));
            var $newStreamButton = content.find('li[data-streamid=new]');
            content.find('li.j-js-as-nav-item').removeClass('editing');
            $newNavItem.addClass('editing');
            $newStreamButton.before($newNavItem);
            linksView.updateSelectedNavItem($newNavItem);
            linksView.editStreamName($newNavItem, true);
            var customStreamsCount = content.find('li.j-js-as-nav-item').length - 1; // subtract one for the "new stream" button
            if (customStreamsCount >= linksView.maxCustomStreams) {
                $newStreamButton.addClass('j-max-streams-reached');
            }
        }
        else {
            var $navItem = content.find('li[data-streamid=' + streamViewBean.configuration.id + ']');
            $navItem.addClass('editing');
            linksView.updateSelectedNavItem($navItem);
            linksView.editStreamName($navItem, false);
        }
    };

    this.removeDeletedStream = function(data) {
        var linksView = this,
            content = linksView.getContent(),
            $streamNavItem = content.find('li[data-streamid=' + data['deletedStream'].configuration.id + ']');
        if ($streamNavItem.next().data('streamid') != 'new') {
            $streamNavItem.next().find('a.j-js-as-nav-link').click();
        }
        else {
            $streamNavItem.prev().find('a.j-js-as-nav-link').click();
        }
        $streamNavItem.remove();
        content.find('li.j-js-side-nav-item').removeClass('pinned');
        var pinnedNavItemSource = data.pinnedHomeNavView.split(":")[0],
            pinnedNavItemStreamID = data.pinnedHomeNavView.split(":")[1],
            $newPinnedItem;
        if (pinnedNavItemStreamID == "0") {
            $newPinnedItem = content.find('li[data-source=' + pinnedNavItemSource + ']');
        }
        else {
            $newPinnedItem = content.find('li[data-source=' + pinnedNavItemSource + '][data-streamid=' +
                pinnedNavItemStreamID + ']');
        }
        $newPinnedItem.addClass('pinned');
        var customStreamsCount = content.find('li.j-js-as-nav-link').length;
        if (customStreamsCount < linksView.maxCustomStreams) {
            $j('#jive-nav-link-new').removeClass('j-max-streams-reached');
        }
    };

    this.updateStreamName = function(configData) {
        var linksView = this,
            content = linksView.getContent();
        content.find('li[data-streamid=' + configData.id + '] .j-js-nav-stream-name').text(configData.name);
    };

    this.forceUpdateSelectedNavItem = function(params, mode) {
        var linksView = this,
            content = linksView.getContent(),
            $navItem;
        if (mode == 'activity') {
            var source = params.streamSource;
            if (source == 'all' || !source) {
                $navItem = $j('#jive-nav-link-activity');
            }
            else if (source == 'connections') {
                $navItem = $j('#jive-nav-link-connections');
            }
            else if (source == 'watches') {
                $navItem = $j('#jive-nav-link-watches');
            }
            else {
                $navItem = content.find('li[data-streamid=' + params.streamID + '][data-source=' + source + ']');
            }
        }
        else {
            if (mode == 'inbox') {
                mode = 'communications';
            }
            else if (mode.indexOf('actions') != -1) {
                mode = 'actions';
            }
            else if (mode == 'welcome') {
                mode = 'dashboard';
            }
            $navItem = $j('#jive-nav-link-' + mode);
        }
        if (!$navItem.hasClass('selected')) {
            linksView.updateSelectedNavItem($navItem);
        }
    };

    this.updateSelectedNavItem = function($navItem) {
        var linksView = this,
            content = linksView.getContent();
        content.find('.j-js-side-nav-item').removeClass('selected');
        $navItem.addClass('selected');
    };

    this.clearUpdates = function(streamType, streamID) {
        var linksView = this,
            content = linksView.getContent(),
            linkID = '';
        if (streamType == "connections" || streamType == "watches") {
            linkID = '#jive-nav-link-' + streamType;
        }
        else if (streamType == "custom") {
            linkID = '#jive-nav-link-custom-' + streamID;
        }
        if (linkID) {
            var $updateIndicator = content.find(linkID + ' .j-js-update-indicator');
            if ($updateIndicator.length) {
                $updateIndicator.replaceWith(
                    jive.welcome.updateIndicator({
                        type: 'gauge',
                        count: 0
                    })
                );
            }
        }
    };

    this.pin = function($parentNavItem) {
        var linksView = this,
            content = linksView.getContent();

        linksView.emitP('pin', $parentNavItem.attr('id')).addCallback(function() {
            content.find('li.j-js-side-nav-item').removeClass('pinned');
            $parentNavItem.addClass('pinned');
            var streamName = '';
            if ($parentNavItem.hasClass('j-js-as-nav-item')) {
                streamName = $parentNavItem.find('.j-js-nav-stream-name').text();
            }
            else {
                streamName = $parentNavItem.find('.nav-link').text();
            }
            $j(jive.welcome.pinnedMessage({streamName: streamName})).message();
        });
    };


    this.updateCounts = function(data) {
        var linksView = this,
            content = linksView.getContent();
        // update "Custom" Activity Stream Gauges
        $j.each(data.newActivityCounts, function(type, streamIDMap) {
            if (type == "connections" || type == "watches" || type == "custom") {
                $j.each(streamIDMap, function(streamID, count) {
                    if (count) {
                        var linkID = '';
                        if (type == "connections" || type == "watches") {
                            linkID = '#jive-nav-link-' + type;
                        }
                        else {
                            linkID = '#jive-nav-link-' + type + '-' + streamID;
                        }
                        var $updateIndicator = content.find(linkID + ' .j-js-update-indicator');
                        if ($updateIndicator.length) {
                            $updateIndicator.replaceWith(
                                jive.welcome.updateIndicator({
                                    type: 'gauge',
                                    count: count
                                })
                            );
                        }
                    }
                });
            }
        });

        // update Actions Home Nav Count
        var $actionsCount = content.find('#jive-nav-link-actions .j-js-update-indicator');
        if ($actionsCount.length) {
            var grandTotal = data.fullCounts["actions"] + data.fullCounts["overdueTasks"];
            $actionsCount.replaceWith(jive.welcome.updateIndicator({
                type: 'count',
                count: grandTotal,
                extraCssClasses: 'j-sidenav-count j-navbadge-count j-ui-elem'
            }));
        }

        // update Communications Home Nav Count
        var $commsCount = content.find('#jive-nav-link-communications .j-js-update-indicator');
        if ($commsCount.length) {
            $commsCount.replaceWith(jive.welcome.updateIndicator({
                type: 'count',
                count: data.fullCounts.communications.unreadCount,
                extraCssClasses: 'j-sidenav-count j-navbadge-count j-ui-elem'
            }));
        }

        // update Moderation Home Nav Count
        var $modCount = content.find('#jive-nav-link-moderation .j-js-update-indicator');
        if ($modCount.length) {
            $modCount.replaceWith(jive.welcome.updateIndicator({
                type: 'count',
                count: data.fullCounts.moderations,
                extraCssClasses: 'j-sidenav-count j-navbadge-count j-ui-elem'
            }));
        }
    };

    this.decrementNavCount = function(sourceType, decCount) {
        var linksView = this,
            content = linksView.getContent(),
            $navItem = content.find('li[data-source=' + sourceType + ']'),
            $updateIndicator = $navItem.find('.j-js-update-indicator'),
            currentCount = parseInt($updateIndicator.attr('data-count')),
            newCount = currentCount - decCount;

        if (currentCount <= 50 || decCount > 1000) {
            // if current count is greater than 50, don't decrement/increment... Unless we're marking all read (decCount > 1000).
            // Polling should re-up the count as it occurs.
            if (newCount < 0) {
                newCount = 0;
            }
            $updateIndicator.replaceWith(jive.welcome.updateIndicator({
                type: 'count',
                count: newCount,
                extraCssClasses: 'j-sidenav-count j-navbadge-count j-ui-elem'
            }));
        }
    };

    this.updateOnboardingProgress = function(viewData) {
        var linksView = this,
            content = linksView.getContent();
        content.find('#j-onb-nav-progress').replaceWith(
            jive.welcome.onboardingNavProgress({
                percentComplete: viewData.percentComplete,
                questData: viewData.quests})
        );
    };

    this.hideView = function(source) {
        var linksView = this,
            $viewItem = linksView.getViewItem(source);
        if ($viewItem.length) {
            if ($viewItem.hasClass('selected')) {
                jive.locationState.setState({}, '' , 'activity');
                $j('html, body').animate({ scrollTop: 0 }, 'fast');
            }
            $viewItem.remove();
        }
    };

    this.getViewItem = function(source) {
        var linksView = this,
            content = linksView.getContent();
        return content.find('li[data-source='+source+']');
    }
});
