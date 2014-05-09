/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('MembershipApp');

/**
 * jive.MembershipApp.MembershipView
 * 
 * View class for handling click events from Join/Leave group links.  Leverages membership.soy
 * for client side tempates.  Displays confirmation messages and error messages in standard
 * notification areas ([id=object-follow-notify] and [id=jive-ajax-error-box]).
 *
 * @depends template=jive.socialgroups.soy.joinConfirmation
 * @depends template=jive.socialgroups.soy.leaveGroup
 * @depends template=jive.socialgroups.soy.leaveConfirmation
 * @depends template=jive.socialgroups.soy.renderError
 */
jive.MembershipApp.MembershipView = jive.oo.Class.extend(function(protect) {
    var BROWSE  = 'browse',
        LANDING = 'landing';

    // Mixes in `addListener` and `emit` methods so that other classes can
    // listen to events from this one.
    jive.conc.observable(this);

    this.init = function(joinContainer, leaveContainer, options) {
        var view = this;
        this.joinContainer = joinContainer;
        this.leaveContainer = leaveContainer;
        this.options    = options || {};

        /*
         * This code assumes that if an objectID is passed then we are on the group landing page. Perhaps we should pass
         * this information in via an option in the constructor.
         */
        var page = 'objectID' in options ? LANDING : BROWSE;
        this.isPage = function(location) {
            return page === location;
        };

        $j(document).ready(function() {
        	
        	if (view.isPage(LANDING)) {
                // a single group page
        		$j(document).delegate(view.joinContainer, "click", function(e) {
        			view.joinGroup($j(this));
                    e.preventDefault();
        		});
                $j(document).delegate(view.leaveContainer, "click", function(e) {
                	view.displayLeaveGroupModal($j(this));
                    e.preventDefault();
                });
            } else {
                // a list of groups
                $j('body').on('click', '.sgroup-join, .sgroup-leave', function(e) {
                    e.preventDefault();
                    var $this = $j(this);

                    if ($this.is('.sgroup-join')) {
                        view.joinGroup($this);
                    } else {
                        view.displayLeaveGroupModal($this);
                    }
                });
            }
        });
    };

    this.joinGroup = function(link) {
    	var view = this;    	
        var objectID = view.determineObjectID(link);
    	// TODO disable the link, or swap it out prior to emitting the event
        view.emitP('join', objectID).addCallback(function(data) {
            var callback = $j.noop;

            if (view.isPage(LANDING)) {
            	if (!data.banned) {
	                $j(view.leaveContainer).show();
	                $j(view.joinContainer).hide();
            	}

                callback = function() {
                    if (data.memberToContribute) {
                        window.location = changeQuestStepLocation(1);
                    }
                };
            } else {
                $j(link).closest('.j-thumb-back, .j-td-follow-action').find('a.sgroup-leave').show();
                $j(link).hide();
            }

            view.displayMessage(jive.socialgroups.soy.joinConfirmation(data), callback);

            // hide the stop following link, show the start following link
            $j("#jive-link-socialgroup-startFollowing").hide();
            $j("#jive-link-socialgroup-following").show();
        })
        .addErrback(function(message, code) {
        	console.log('got error message: ' + message + ' code: ' + code);
        	view.displayError(message, code);            
        });
    };
    
    this.displayLeaveGroupModal = function(link) {
    	var view = this;
    	var objectID = view.determineObjectID(link);
    	// emit a leave event to the controller, along with a callback that contains
    	// membership info for the leave modal
    	
    	// TODO add a modal loading spinner here prior to loading the modal.
    	view.emitP('prepareLeave', objectID).addCallback(function(data) {
    		// TODO close the modal loading spinner
    		var $modal = $j(jive.socialgroups.soy.leaveGroup(data));
        	$j("body").append($modal);
        	var $modalDiv = $j("body").find('#jive-modal-leave-group');
        	$modalDiv.lightbox_me({closeSelector: ".jive-modal-close, .close", destroyOnClose: true});
        	$modalDiv.find('#group-leave-submit').click(function() {
        		view.leaveGroup(link, data);
        		// close the lightbox via an event.  Putting the ".jive-modal-close" selector
        		// directly on the "join" button causes the modal to close without propogating
        		// to this click handler.  Therefore, we do not place that class on the "join"
        		// button and close the modal manually.
        		$modalDiv.trigger('close');
        	});
    	})
    	.addErrback(function(message, code) {
        	view.displayError(message, code);            
        });
    };

    this.leaveGroup = function(link, data) {
        var view = this;
        var objectID = view.determineObjectID(link);
    	view.emitP('leave', objectID).addCallback(function() {
            var callback = $j.noop;

            if (view.isPage(LANDING)) {
                $j(view.joinContainer).show();
                $j(view.leaveContainer).hide();
                // hide the stop following link, show the start following link
                $j("#jive-link-socialgroup-following").hide();
                $j("#jive-link-socialgroup-startFollowing").show();
                // check to see if the user can view the social group (it could be private or secret)
                callback = function() {
                    if (!data.visibleAfterLeaving) {
                        window.location = jive.app.url({path:"/groups"});
                    }
                    else if (data.memberToContribute) {
                       window.location = changeQuestStepLocation(-1)
                    }
                };
                
            } else {
                $j(link).closest('.j-thumb-back, .j-td-follow-action').find('a.sgroup-join').show();
                $j(link).hide();
            }

            view.displayMessage(jive.socialgroups.soy.leaveConfirmation(data), callback);
        })
        .addErrback(function(message, code) {
            view.displayError(message, code);
        });
    };

    this.displayMessage = function(msg, callback) {
        $j('<p />').html(msg).message({
            style: 'success',
            dismissCallback: callback || $j.noop
        });
    };

    this.displayError = function(msg, code) {
        var errorP = jive.socialgroups.soy.renderError({ message: msg, code: code, href: window.location.href });
        $j(errorP).message({ style: 'error', showClose: true });
    };

    this.determineObjectID = function($link) {
        var objectID = this.options.objectID || $link.attr("data-objectid") || 0;
        return parseInt(objectID, 10);
    };

    function changeQuestStepLocation(change){
        return window.location.href.replace(/\?(.*&)?qstep=(\d+)/,
            function(value, group1, group2){
                var step = parseInt(group2) + change;
                return "?" + group1+ "qstep="+step;
            }
        )
    }

    this.tearDown = function() {
        var view = this;
        if (view.isPage(LANDING)) {
            // a single group page
            $j(view.joinContainer).off("click");
            $j(view.leaveContainer).off("click");
        } else {
            // a list of groups
            $j('.sgroup-join').off('click');
            $j('.sgroup-leave').off('click');
        }
    }
});
