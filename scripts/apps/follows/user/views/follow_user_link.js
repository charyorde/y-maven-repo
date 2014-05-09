/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('FollowUserApp');

/**
 * Handles UI for following a user from their profile.
 *
 * @extends jive.AbstractView
 * @depends template=jive.people.profile.friendListChooserLabel
 * @depends template=jive.people.profile.streamsAssociatedCount
 * @depends template=jive.eae.activitystream.builder.followInStreamsMenu
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 */
jive.FollowUserApp.ProfileFollowView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery
      , _ = jive.FollowApp;

    this.init = function(opts) {
        var view = this;
        view.bidirectional = opts.bidirectional;

        // private methods
        view.message = function(type, userName, options) {
            options = $.extend({ showClose: true, style: 'success' }, options || {});
            var messages = {
                    follow: opts.i18n.startFollowingMessage,
                    pending: opts.i18n.pendingConnectionMessage,
                    unfollow: opts.i18n.stopFollowingMessage
                },
                message = messages[type].replace('{0}', userName);

            $(message).message(options);
        };

        //follow a user
        $j('body').delegate('a.js-follow, a.js-following', 'click', function(e) {
            var $link = $j(this),
                $parent = $link.closest('div.js-follow-user-link'),
                userID = $parent.attr("data-userid");
            view.$parentContainer = $parent;
            view.bidirectional = view.$parentContainer.attr("data-bidirectional") == 'true';
            view.manageAssociations(userID, $link, $parent, function(approved) {
                if (!approved) {
                    $parent.find('.js-follow').hide();
                    $parent.find('.js-pending').show();
                    view.message('pending', $parent.attr("data-displayname"), { style: 'info' });
                }
            });
            e.preventDefault();
        });

        // Update UI on follow
        jive.switchboard.addListener('follow.user', function(payload) {
            var selector = '.js-follow-user-link[data-userid=' + payload.id + ']',
                userNames = [];

            $j(selector).each(function() {
                var $parent = $j(this),
                    count = $parent.attr('data-follower-count') * 1;

                userNames.push($parent.attr('data-displayname'));

                $parent.attr('data-follower-count', ++count)
                    .find('.js-follower-count').text(count);

                var $browseRow = $parent.closest('.js-browse-row'),
                    $browseThumb = $parent.closest('.js-browse-thumbnail');
                if ($browseRow.length) {
                    var $followersCount = $browseRow.find('.j-td-followers .j-user-follow-info');
                    if ($followersCount.length) {
                        $followersCount.data('count', count);
                        $followersCount.text(count);
                    }
                }
                else if ($browseThumb.length) {
                    $followersCount = $browseThumb.find('.j-user-info .j-user-follow-info[data-command="showFollowers"]');
                    if ($followersCount.length) {
                        $followersCount.data('count', count);
                        $followersCount.text(count);
                    }
                }
            });

            var $viewingUserItem = $j('.js-follow-user-link[data-userid=' + window._jive_effective_user_id + ']');
            if ($viewingUserItem.length) {
                var $browseRow = $viewingUserItem.closest('.js-browse-row'),
                    $browseThumb = $viewingUserItem.closest('.js-browse-thumbnail');
                if ($browseRow.length) {
                    var $followingCount = $browseRow.find('.j-td-following .j-user-follow-info'),
                        count = $followingCount.data('count') * 1;
                    ++count;
                    if ($followingCount.length) {
                        $followingCount.data('count', count);
                        $followingCount.text(count);
                    }
                }
                else if ($browseThumb.length) {
                    $followingCount = $browseThumb.find('.j-user-info .j-user-follow-info[data-command="showConnections"]');
                    count = $followingCount.data('count') * 1;
                    ++count;
                    if ($followingCount.length) {
                        $followingCount.data('count', count);
                        $followingCount.text(count);
                    }
                }
            }

            if (userNames.length > 0) {  // see JIVE-2018
                // view.message('follow', userNames.shift());
                jive.switchboard.emit('follow.user.complete', payload);
            }
        });

        // Update UI on unfollow
        jive.switchboard.addListener('unfollow.user', function(payload) {
            var selector = '.js-follow-user-link[data-userid=' + payload.id + ']',
                userNames = [];
            
            $j(selector).each(function(userId) {
                var $parent = $j(this),
                    count = $parent.attr('data-follower-count') * 1;
                userNames.push($parent.attr('data-displayname'));

                // update count, hide/show the proper elements
                $parent.attr('data-follower-count', --count)
                    .find('.js-follower-count').text(count)
                    .end();

                var $browseRow = $parent.closest('.js-browse-row'),
                    $browseThumb = $parent.closest('.js-browse-thumbnail');
                if ($browseRow.length) {
                    var $followersCount = $browseRow.find('.j-td-followers .j-user-follow-info');
                    if ($followersCount.length) {
                        $followersCount.data('count', count);
                        $followersCount.text(count);
                    }
                }
                else if ($browseThumb.length) {
                    $followersCount = $browseThumb.find('.j-user-info .j-user-follow-info[data-command="showFollowers"]');
                    if ($followersCount.length) {
                        $followersCount.data('count', count);
                        $followersCount.text(count);
                    }
                }

                // labelMenu
                $j(".js-connection-labels-menu[data-userid='" + userId + "'] .js-label-option")
                    .removeClass("selected")
                    .find("input:checked").prop('checked', false);
            }.partial(payload.id));

            var $viewingUserItem = $j('.js-follow-user-link[data-userid=' + window._jive_effective_user_id + ']');
            if ($viewingUserItem.length) {
                var $browseRow = $viewingUserItem.closest('.js-browse-row'),
                    $browseThumb = $viewingUserItem.closest('.js-browse-thumbnail');
                if ($browseRow.length) {
                    var $followingCount = $browseRow.find('.j-td-following .j-user-follow-info'),
                        count = $followingCount.data('count') * 1;
                    --count;
                    if ($followingCount.length) {
                        $followingCount.data('count', count);
                        $followingCount.text(count);
                    }
                }
                else if ($browseThumb.length) {
                    $followingCount = $browseThumb.find('.j-user-info .j-user-follow-info[data-command="showConnections"]');
                    count = $followingCount.data('count') * 1;
                    --count;
                    if ($followingCount.length) {
                        $followingCount.data('count', count);
                        $followingCount.text(count);
                    }
                }
            }

            if (userNames.length > 0) {  // see JIVE-2018
                // show alert message
                // view.message('unfollow', userNames.shift());
            }
        });

        //handle label logic
        function openLabelsMenu($button, onClose) {
            var userID = $button.closest(".js-follow-user-link").attr("data-userid");
            var $labelMenuTemplate = view.getMenu(userID);
            var $labelMenu = $labelMenuTemplate.clone();

            $labelMenu.delegate('a.js-label-option', 'click', function(e) {
                var $item = $(this),
                    $checkbox = $item.find(':checkbox'),
                    listID = $checkbox.val();
                if ($checkbox.is(":checked")) {
                    $checkbox.prop('checked', false);
                    $item.removeClass('selected');
                    view.emitP('removeLabel', userID, listID).addErrback(function() {
                        $checkbox.prop('checked', true);
                        $item.addClass('selected');
                    });
                } else {
                    $checkbox.prop('checked', true);
                    $item.addClass('selected');
                    view.emitP('addLabel', userID, listID).addErrback(function() {
                        $checkbox.prop('checked', false);
                        $item.removeClass('selected');
                    });
                }
                e.preventDefault();
            });

            $labelMenu.popover({
                context: $button,
                darkPopover: true,
                destroyOnClose: true,
                onClose: onClose
            });
        }

        $(document).delegate('a.js-connection-label-btn', 'click', function(event) {
            var $that = $(this);
            if (!$that.hasClass('active')) {
                $that.addClass('active');
                openLabelsMenu($that, function() {
                    jive.conc.nextTick(function() {
                        $that.removeClass('active');
                    });
                });
            }
            event.preventDefault();
        });
    };

    this.manageAssociations = function(userID, $link, $parent, callback) {
        var view = this,
            currentStreamAssocCount = $parent.data('streamsassoc');
        view.emitP('manageAssociations', '3', userID, currentStreamAssocCount).addCallback(function (dataList) {
            var data = dataList[0];
            if (data.approved) {
                var streams = data.streams;
                if (data.addedRelationship) {
                    streams[0].selected = true;
                }
                var newAssocStreamCount = 0;
                for (var i = 0, streamsLength = streams.length; i < streamsLength; i++) {
                    if (streams[i].selected) {
                        newAssocStreamCount++;
                    }
                }
                $parent.closest('#jiveTT-note').addClass('snb-pinned');
                var $followLink = $parent.find('.js-follow'),
                    $followingLink = $parent.find('.js-following'),
                    $connectionLabelBtn = $parent.find('a.js-connection-label-btn');
                if (newAssocStreamCount != currentStreamAssocCount) {
                    $parent.data('streamsassoc', newAssocStreamCount);
                    $followingLink.find('.j-js-streams-assoc-count').replaceWith(jive.people.profile.streamsAssociatedCount({
                        count: newAssocStreamCount,
                        renderLocation: $parent.data('location')
                    }));
                }
                $link.hide();
                $followingLink.show();
                if ($connectionLabelBtn.length) {
                    $connectionLabelBtn.show();
                }

                var removeAllAssnI18nKey = 'eae.activitystream.builder.followlink.removeall';
                if (view.bidirectional) {
                    removeAllAssnI18nKey = 'profile.friends.remove.link';
                }
                view.$streamsMenu = $j(jive.eae.activitystream.builder.followInStreamsMenu({
                    objectID: userID,
                    objectType: '3',
                    streams: streams,
                    removeAllAssnI18nKey: removeAllAssnI18nKey
                }));
                view.$streamsMenu.popover({
                    context: $parent,
                    darkPopover: false,
                    destroyOnClose: true,
                    putBack: false,
                    closeOnClickSelector: 'body, .js_lb_overlay',
                    onLoad: function() {
                        view.$streamsMenu.delegate('a.j-js-remove-all-assns', 'click', function(e) {
                            var $streamLink = $j(this),
                                $menu = $streamLink.closest('.j-js-follow-in-streams-menu');
                            //pass along selected labels
                            var appliedLabelIDs = $j(".js-connection-labels-menu[data-userid='" + $menu.data('objectid') + "'] .js-label-option.selected").map(function(){
                                return $j(this).attr("data-list-id");
                            }).toArray();
                            view.emitP('removeAllAssociations', $menu.data('objecttype'), $menu.data('objectid'), appliedLabelIDs).addCallback(function () {
                                $followLink.show();
                                $followingLink.hide();
                                $connectionLabelBtn.hide();
                                view.$streamsMenu.trigger('close');
                                $parent.data('streamsassoc', 0);
                            });
                            e.preventDefault();
                        });
                        view.$streamsMenu.delegate('input', 'change', function(e) {
                            var $checkbox = $j(this),
                                $menu = $checkbox.closest('.j-js-follow-in-streams-menu'),
                                streamID = $checkbox.val(),
                                objectType = $menu.data('objecttype'),
                                objectID = $menu.data('objectid'),
                                checked = $checkbox.is(":checked"),
                                currentASAssocCount = $menu.find('label.j-js-stream-option.selected').length;
                            view.emitP('setItemAssociation', objectType, objectID, streamID, checked, currentASAssocCount).addCallback(function (data) {
                                var newCount = currentASAssocCount;
                                if (checked) {
                                    $checkbox.closest('label').addClass('selected');
                                    newCount++;
                                }
                                else {
                                    $checkbox.closest('label').removeClass('selected');
                                    newCount--;
                                    if (currentASAssocCount == 1 && objectType == 3 && objectID == window._jive_current_user.ID) {
                                        // we're managing our self-associations and we just removed the last one.  Since we don't
                                        // manage user assns for ourselves, show the follow button again like we just clicked
                                        // removeAllAssociations
                                        $followLink.show();
                                        $followingLink.hide();
                                    }
                                }
                                $followingLink.find('.j-js-streams-assoc-count').replaceWith(jive.people.profile.streamsAssociatedCount({
                                    count: newCount,
                                    renderLocation: $parent.data('location')
                                }));
                                $parent.data('streamsassoc', newCount);
                            });
                        });
                        view.$streamsMenu.delegate('.j-js-close', 'click', function() {
                            view.$streamsMenu.trigger('close');
                        });
                    },
                    onClose: function() {
                        var $tt = $followingLink.closest('#jiveTT-note'),
                            $reco = $followingLink.closest('.j-js-recommendation');
                        if ($tt.length) {
                            // if follow button was part of our tooltips, remove the pinning of the tooltip so it
                            // can be closed now
                            $tt.removeClass('snb-pinned');
                            $j(document).bind('mousemove.follow-in', function(e) {
                                if (!$j(e.target).closest('#jiveTT-note').length) {
                                    $tt.trigger('mouseout');
                                }
                                $j(document).unbind('mousemove.follow-in');
                            });
                        }
                        else if ($reco.length) {
                            // if the follow button was a part of the Recommended People, remove the recommendation/container as
                            // the recommended person is now probably followed.
                            $reco.fadeOut(400, function() {
                                var $container = $followingLink.closest('.j-js-recommendation-people-module');
                                $reco.remove();
                                if (!$container.find('li.j-js-recommendation').length) {
                                    $container.fadeOut('fast');
                                }
                            });
                        }
                    }
                });
            }
            if (callback) {callback(data.approved)}
        });
    };

    this.addLabelItem = function(label){
        var $containers = $j('#j-browse-item-grid .j-js-friend-list-chooser-container');

        // add the label item to the chooser
        $containers.find('.j-js-friend-list-chooser').each(function() {
           label.userID = $j(this).closest(".js-connection-labels-menu").attr("data-userid");
           $j(this).append(jive.people.profile.friendListChooserLabel(label));
        });

        // JIVE-11287 if this is the first label added, make sure that the container is displaying correctly
        if (!$containers.is(':visible')) {
            // alter the display of the "following in" buttons
            $j('#j-browse-item-grid .js-following').addClass('j-split-button notlast');
            $containers.show();
        }
    };

    this.updateLabelItem = function(label) {
        $j(".js-label-option[data-list-id='" + label.listID + "']").each(function() {
            var $userLabel = $j(this);
            label.selected = $userLabel.hasClass("selected");  //persist checked state
            label.userID = $userLabel.closest(".js-connection-labels-menu").attr("data-userid");
            $userLabel.replaceWith(jive.people.profile.friendListChooserLabel(label));
        });
    };

    this.removeLabelItem = function(id){
        $j(".js-label-option[data-list-id='" + id + "']").remove();
    };

    this.apply = function(label, userID) {
        this.getMenuItem(userID, label.id).addClass('selected').find(':checkbox').prop('checked', true);
    };

    this.unapply = function(label, userID) {
        this.getMenuItem(userID, label.id).removeClass('selected').find(':checkbox').prop('checked', false);
    };

    protect.getMenu = function(userID) {
        return $(".js-connection-labels-menu[data-userid='" + userID + "']");
    };

    protect.getMenuItem = function(userID, listID) {
        return $(".js-connection-labels-menu[data-userid='" + userID + "'] a.js-label-option[data-list-id='"+ listID +"']");
    };

    protect.createSpinner = function(link) {
        link.addClass('font-color-meta-light');
    };

    protect.destroySpinner = function(link) {
        link.removeClass('font-color-meta-light');
    };
});
