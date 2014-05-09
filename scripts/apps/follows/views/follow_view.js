/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('FollowApp');

/**
 * Handles UI for following a user from their profile.
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 * @depends template=jive.eae.activitystream.builder.followInStreamsMenu
 * @depends template=jive.eae.activitystream.builder.jsI18nHelper
 */
jive.FollowApp.FollowView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery
      , _ = jive.FollowApp;

    // Mixes in `addListener` and `emit` methods so that other classes can
    // listen to events from this one.
    jive.conc.observable(this);

    this.init = function(featureName, options) {
        var view = this;
        this.i18n       = options.i18n;
        this.options    = options;
        this.addFollowLinkID = "#jive-link-" + featureName + "-startFollowing";
        this.followingLinkID = "#jive-link-" + featureName + "-following";

        $(document).ready(function() {
            if (view.options.objectID) {
                // a single followable object
                $(view.addFollowLinkID+", "+view.followingLinkID).click(function(e) {
                    var $link = $(this),
                        newFollow = $link.hasClass('j-button-follow');
                    view.manageAssociations(view.options.objectType,
                                            view.options.objectID,
                                            $link,
                                            $j(view.addFollowLinkID),
                                            $j(view.followingLinkID),
                                            $link.closest('.j-js-follow-controls'));

                    e.preventDefault();
                });
            } else {
                // a list of followable objects
                $('body').off('click.followbtn').on('click.followbtn', '.start-follow a, .following a', function(e) {
                    var that = this,
                        $link = $j(this),
                        $followControls = $link.closest('.j-js-follow-controls'),
                        objecttype = $link.attr("data-objecttype"),
                        objectid = $link.attr("data-objectid");
                    if ($link.parent().hasClass('start-follow')) {
                        var $followLink = $link,
                            $followingLink = $link.parent().siblings('.following').find('a');
                    }
                    else {
                        $followingLink = $link,
                        $followLink = $link.parent().siblings('.start-follow').find('a');
                    }

                    view.manageAssociations(objecttype, objectid, $link, $followLink, $followingLink, $followControls);

                    e.preventDefault();
                });
            }
        });

        // Update UI on follow
        jive.switchboard.removeListener('follow.create', view.followCreated)
            .addListener('follow.create', view.followCreated);

        // Update UI on unfollow
        jive.switchboard.removeListener('follow.destroy', view.followDestroyed)
            .addListener('follow.destroy', view.followDestroyed);

    };

    this.followCreated = function(payload) {
        var $browseThumb = $j('.js-browse-thumbnail[data-object-type='+payload.objectType+'][data-object-id='+payload.objectID+']'),
            $browseRow = $j('.js-browse-item[data-object-type='+payload.objectType+'][data-object-id='+payload.objectID+']');
        if ($browseThumb.length) {
            $followersCount = $browseThumb.find('[data-command="showFollowers"]');
            count = $followersCount.data('count');
            count = count + 1;
            if ($followersCount.length) {
                $followersCount.data('count', count);
                $followersCount.text(count);
            }
        }
        else if ($browseRow.length) {
            var $followersCount = $browseRow.find('.j-td-followers [data-command="showFollowers"]'),
                count = $followersCount.data('count');
            count = count + 1;
            if ($followersCount.length) {
                $followersCount.data('count', count);
                $followersCount.text(count);
            }
        }
    };

    this.followDestroyed = function(payload) {
        var $browseThumb = $j('.js-browse-thumbnail[data-object-type='+payload.objectType+'][data-object-id='+payload.objectID+']'),
            $browseRow = $j('.js-browse-item[data-object-type='+payload.objectType+'][data-object-id='+payload.objectID+']');
        if ($browseThumb.length) {
            $followersCount = $browseThumb.find('[data-command="showFollowers"]');
            count = $followersCount.data('count');
            count = count - 1;
            if ($followersCount.length) {
                $followersCount.data('count', count);
                $followersCount.text(count);
            }
        }
        else if ($browseRow.length) {
            var $followersCount = $browseRow.find('.j-td-followers [data-command="showFollowers"]'),
                count = $followersCount.data('count');
            count = count - 1;
            if ($followersCount.length) {
                $followersCount.data('count', count);
                $followersCount.text(count);
            }
        }
    };

    this.updateBrowseFollowUI = function(followed, payload) {
        var $browseThumb = $j('.js-browse-thumbnail[data-object-type='+payload.objectType+'][data-object-id='+payload.objectID+']'),
            $browseRow = $j('.js-browse-item[data-object-type='+payload.objectType+'][data-object-id='+payload.objectID+']');
        if ($browseThumb.length) {
            $followersCount = $browseThumb.find('[data-command="showFollowers"]');
            count = $followersCount.data('count');
            count = followed ? count + 1 : count - 1;
            if ($followersCount.length) {
                $followersCount.data('count', count);
                $followersCount.text(count);
            }
        }
        else if ($browseRow.length) {
            var $followersCount = $browseRow.find('.j-td-followers [data-command="showFollowers"]'),
                count = $followersCount.data('count');
            count = followed ? count + 1 : count - 1;
            if ($followersCount.length) {
                $followersCount.data('count', count);
                $followersCount.text(count);
            }
        }
    };

    this.manageAssociations = function(objectType, objectID, $linkClicked, $followLink, $followingLink, $followControls) {
        var view = this,
            streamAssocCount = $followControls.data('streamsassoc');
        view.emitP('manageAssociations', objectType, objectID, streamAssocCount).addCallback(function (dataList) {
            var data = dataList[0],
                streams = data.streams;
            // every time they click the follow button, they will automatically be following the object in at least
            // one stream, so make sure to change the link
            $followLink.hide();
            var newAssocStreamCount = 0;
            for (var i = 0, streamsLength = streams.length; i < streamsLength; i++) {
                if (streams[i].selected) {
                    newAssocStreamCount++;
                }
            }
            var currentStreamAssocCount = $followControls.data('streamsassoc');
            if (newAssocStreamCount != currentStreamAssocCount) {
                $followControls.data('streamsassoc', newAssocStreamCount);
                $followingLink.find('.j-js-streams-assoc-count').replaceWith(jive.people.profile.streamsAssociatedCount({
                    count: newAssocStreamCount,
                    renderLocation: $followControls.data('location')
                }));
            }
            $followingLink.show();
            $linkClicked.closest('#jiveTT-note').addClass('snb-pinned');

            view.$streamsMenu = $j(jive.eae.activitystream.builder.followInStreamsMenu({
                objectID: objectID,
                objectType: objectType,
                streams: streams,
                removeAllAssnI18nKey: 'eae.activitystream.builder.followlink.removeall'
            }));
            view.$streamsMenu.popover({
                context: $followControls,
                darkPopover: false,
                destroyOnClose: true,
                putBack: false,
                onLoad: function() {
                    view.$streamsMenu.delegate('a.j-js-remove-all-assns', 'click', function(e) {
                        view.emitP('removeAllAssociations', objectType, objectID).addCallback(function () {
                            $followingLink.hide();
                            $followLink.show();
                            $followControls.data('streamsassoc', 0);
                            view.$streamsMenu.trigger('close');
                        });
                        e.preventDefault();
                    });
                    view.$streamsMenu.delegate('input', 'change', function(e) {
                        var $checkbox = $j(this),
                            $parent = $checkbox.closest('.j-js-follow-in-streams-menu'),
                            streamID = $checkbox.val(),
                            checked = $checkbox.is(":checked"),
                            currentASAssocCount = $parent.find('label.j-js-stream-option.selected').length;

                        view.emitP('setItemAssociation', objectType, objectID, streamID, checked, currentASAssocCount).addCallback(function (data) {
                            if (checked) {
                                $checkbox.closest('label').addClass('selected');
                            }
                            else {
                                $checkbox.closest('label').removeClass('selected');
                            }
                            var $optionLinks = view.$streamsMenu.find('.j-js-stream-option'),
                                streamsSelected = 0;
                            $optionLinks.each(function() {
                                if ($j(this).hasClass('selected')) {
                                    streamsSelected++;
                                }
                            });
                            $followControls.data('streamsassoc', streamsSelected);
                            if (streamsSelected == 0) {
                                $followingLink.hide();
                                $followingLink.find('.j-js-streams-assoc-count').replaceWith(jive.people.profile.streamsAssociatedCount({
                                    count: streamsSelected,
                                    renderLocation: $followControls.data('location')
                                }));
                                $followLink.show();
                            }
                            else {
                                $followingLink.find('.j-js-streams-assoc-count').replaceWith(jive.people.profile.streamsAssociatedCount({
                                    count: streamsSelected,
                                    renderLocation: $followControls.data('location')
                                }));
                                $followingLink.show();
                                $followLink.hide();
                            }
                        });
                    });
                    view.$streamsMenu.delegate('.j-js-close', 'click', function() {
                        view.$streamsMenu.trigger('close');
                    });
                },
                onClose: function() {
                    var $tt = $followingLink.closest('#jiveTT-note');
                    if ($tt.length) {
                        $tt.removeClass('snb-pinned');
                        $j(document).bind('mousemove.follow-in', function(e) {
                            if (!$j(e.target).closest('#jiveTT-note').length) {
                                $tt.trigger('mouseout');
                            }
                            $j(document).unbind('mousemove.follow-in');
                        });
                    }
                }
            });
        });
    };

    this.displayConfirmation = function(msg) {
        if (msg) {
            $j('<p />').html(msg).message({ style: 'success' });
        }
    };
    
    this.updateYourProjects = function(projectID, show) {
        // this updates the "Projects you are following" sidebar on the Browse Projects page
        if (show) {
            $('#sidebar-yourprojects-row-' + projectID).show().effect('highlight', {}, 5000);
        } else {
            $('#sidebar-yourprojects-row-' + projectID).fadeOut('slow');
        }
    };

    this.tearDown = function() {
        var view = this;
        jive.switchboard.removeListener('follow.create', view.followCreated);
        jive.switchboard.removeListener('follow.destroy', view.followDestroyed);
    };

    protect.createSpinner = function(link, text) {
        link.addClass('font-color-meta-light');
    };

    protect.destroySpinner = function(link) {
        link.removeClass('font-color-meta-light');
    };
});
