/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * jive.MembershipApp.Main
 * 
 * Main class for controlling interactions for joining and leaving social groups.
 *
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 */
jive.namespace('MembershipApp');

jive.MembershipApp.Main = jive.oo.Class.extend(function(protect) {

	this.init = function(options) {
		var main = this;
		
		this.membershipSource = new jive.MembershipApp.MembershipSource(options);

		this.membershipView = new jive.MembershipApp.MembershipView("#jive-link-joinSocialGroup,.jive-link-joinSocialGroup", "#jive-link-leaveSocialGroup,.jive-link-leaveSocialGroup", options);

		this.membershipView.addListener('join', function(id, promise) {
			main.membershipSource.save( {				
				objectID : id
			})
			.addCallback(function(data) {
				promise.emitSuccess(data);
                jive.switchboard.emit('sgroup.member.join', data);
			})
			.addErrback(function(error, status) {
				console.log('got a err in main.js');
				promise.emitError(error, status);
			});
		})
		.addListener('leave', function(id, promise) {
			main.membershipSource.destroy( {
				objectID : id
			})
			.addCallback(function() {
                jive.switchboard.emit('sgroup.member.leave', id);
				promise.emitSuccess();
			})
			.addErrback(function(error, status) {
				console.log('got a err in main.js');
				promise.emitError(error, status);
			});
		})
		.addListener('prepareLeave', function(id, promise) {
			main.membershipSource.get( { 
				objectID : id
			})
			.addCallback(function(data) {
				promise.emitSuccess(data);
			})
			.addErrback(function(error, status) {
				console.log('got a err in main.js');
				promise.emitError(error, status);
			});
		});
	}

    this.tearDown = function() {
        this.membershipView.removeListener('join')
            .removeListener('leave')
            .removeListener('prepareLeave')
            .tearDown();
    }
});

define('jive.membershipApp.Main', function() {
    return jive.MembershipApp.Main;
});
