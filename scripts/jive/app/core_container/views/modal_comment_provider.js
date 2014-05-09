/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @class
 */
define('jive.JAF.CoreContainer.CommentProvider', ['jquery'], function($j) {
    return jive.oo.Class.extend(function(protect) {

        // Mix in observable to make this class an event emitter.
        jive.conc.observable(this);

        var EmptyCommentContext = { type: 'osapi.jive.core.Comment' };
        var EmptyMessageContext = { type: 'osapi.jive.core.Message' };

        protect.listeningForActivityStreamsForms = false;
        protect.listeningForInboxForms = false;

        this.init = function() {
            this.commentContext = null;
            this.activityStreamContext = null;
        };

        this.getCommentContext = function() {
            return this.commentContext;
        };

        this.getActivityStreamContext = function() {
            return this.activityStreamContext;
        };

        this.getInboxEntryContext = function() {
            return this.activityStreamContext;
        };

        /**
         * add listeners for comment creation/edit/reply and reset.
         * edit and reply are called in the context of an existing comment.
         */
        this.addListeners = function() {
            var self = this;
            self.commentContext = null;

            var calculateCommentContext = function(eventData) {
                var context = {content:{}};
                $j.extend(context.content, eventData, EmptyCommentContext);
                if(context.content.inReplyTo) {
                    $j.extend(context.content.inReplyTo, EmptyCommentContext);
                }
                return context;
            };

            var setCommentContext = function(eventData) {
                self.commentContext = calculateCommentContext(eventData);
            };

            var calculateDiscussionContext = function(eventData) {
                // re-purposing comment context for discussion thread message.
                var context = {content:{}};
                $j.extend(context.content, {
                    id: 0
                }, EmptyMessageContext);
                if(eventData.isReply) {
                    $j.extend(context.content, {
                        inReplyTo: {
                            id: eventData.parentMessageId
                        }
                    });
		    context.content.parent = eventData.parent;
                }
                if(context.content.inReplyTo) {
                    $j.extend(context.content.inReplyTo, EmptyMessageContext); //sets the replyTo type
                }
                return context;
            };

            var setDiscussionContext = function(eventData) {
                self.commentContext = calculateDiscussionContext(eventData);
            };

            var lookupCoreAPITypeByObjectType = function(objectType) {
                var type = 'osapi.jive.core.Unsupported(' + objectType + ')';
                switch(objectType) {
                    case 2:
                    case '2':
                        type = 'osapi.jive.core.Discussion';
                        break;
                    case 38:
                    case '38':
                        type = 'osapi.jive.core.Post';
                        break;
                    case 102:
                    case '102':
                        type = 'osapi.jive.core.Document';
                        break;
                    case 105:
                    case '105':
                        type = 'osapi.jive.core.Comment';
                        break;
                }
                return type;
            };

            var setActivityStreamContext = function(eventData) {
                self.init();
                var context;
                switch(eventData.objectType) {
                    // handle inline discussion replies
                    case '2':
                        context = calculateDiscussionContext({
                            discussionId: eventData.parent.jiveObject.id,
                            parentMessageId: eventData.objectID,
                            isReply: true,
                            parent: {
                                id: eventData.parent.jiveObject.threadID,
                                type: lookupCoreAPITypeByObjectType(eventData.objectType)
                            }
                        });
                        break;
                    // handle inline poll replies
                    case '18':
                        context = calculateCommentContext({
                            id: 0,
                            parent: {
                                id: eventData.parent.jiveObject.id,
                                type: lookupCoreAPITypeByObjectType(eventData.objectType)
                            }
                        });
                        break;
                    // handle inline blog post comments
                    case '38':
                        context = calculateCommentContext({
                            id: 0,
                            parent: {
                                id: eventData.parent.jiveObject.id,
                                type: lookupCoreAPITypeByObjectType(eventData.objectType)
                            }
                        });
                        break;
                    // handle inline top level comments
                    case '102':
                        context = calculateCommentContext({
                            id: 0,
                            parent: {
                                id: eventData.parent.jiveObject.id,
                                type: lookupCoreAPITypeByObjectType(eventData.objectType)
                            }
                        });
                        break;
                    // handle inline comment replies
                    case '105':
                        context = calculateCommentContext({
                            id: 0,
                            inReplyTo: {
                                id: eventData.objectID,
                                type: lookupCoreAPITypeByObjectType(eventData.objectType)
                            },
                            parent: {
                                id: eventData.parent.jiveObject.id,
                                type: lookupCoreAPITypeByObjectType(eventData.parent.jiveObject.objectType)
                            }
                        });
                        break;
                }
                self.activityStreamContext = context;
            };

            if(jive.CommentApp && jive.CommentApp.comments) {
                jive.CommentApp.comments.addCommentListViewListener("createComment", setCommentContext);
                jive.CommentApp.comments.addCommentListViewListener("editComment", setCommentContext);
                jive.CommentApp.comments.addCommentListViewListener("replyComment", setCommentContext);
                jive.CommentApp.comments.addCommentListViewListener("formClosed", function(eventData) {
                    self.commentContext = null;
                });
            }

            if(jive.DiscussionApp && jive.DiscussionApp.instance) {
                jive.DiscussionApp.instance.addDiscussionListViewListener('formReady', setDiscussionContext);
            }

            function listenToActivityStreamsForms() {
                if(!self.listeningForActivityStreamsForms) {
                    if(jive.ActivityStreamApp && jive.ActivityStreamApp.instance) {
                        jive.ActivityStreamApp.instance.addActivityStreamListViewListener('formReady', setActivityStreamContext);
                        self.listeningForActivityStreamsForms = true;
                    }
                }
            }

            // activity stream
            jive.switchboard.addListener("activity.stream.controller.initialized", listenToActivityStreamsForms);
            listenToActivityStreamsForms();

            // communications (inbox)
            function listenToInboxForms() {
                if(!self.listeningForInboxForms) {
                    if(jive.ActivityStream && jive.ActivityStream.GlobalCommunicationStreamController) {
                        jive.ActivityStream.GlobalCommunicationStreamController.attachListEventListener('showRTE',
                            function(itemData, $replyActivity, promise) {
                                setActivityStreamContext(itemData);
                            });
                        self.listeningForInboxForms = true;
                    }
                }
            }
            jive.switchboard.addListener("activity.communication.controller.initialized", listenToInboxForms);
            listenToInboxForms();

            // bind to app artifacts in the RTE (RTE itself need not necessarily be visible). So any rendered content.
            if(jive.rte && jive.rte.renderedContent) {
                jive.rte.renderedContent.addListener("renderedContentWithSelector", function($renderedContent, opts) {
                    self.emit( 'modifyRenderedContent', $renderedContent, opts );
                });
            }
        };
    });
});

