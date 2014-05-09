/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('AnnouncementsAction');
/**
 * Handles UI for a list of link items
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 */
jive.AnnouncementsAction.ActionView = jive.AbstractView.extend(function(protect) {

    var $ = jQuery;
    this.init = function(options) {
        var view = this;
        
        // bind expire button
        $j('.announcement-expire').bind('click', function(e) {        	
        	var annID = $j(this).attr("data-object-id");
        	view.emitP('expire',annID).addCallback(function(data){
        		window.location.reload();
        	});        	
        });
        
        // bind remove button
        $j('.announcement-remove').bind('click', function(e) {        	
        	var annID = $j(this).attr("data-object-id");
        	view.emitP('remove',annID).addCallback(function(data){
        		window.location.reload();
        	});        	
        });
        
        // bind dismiss button
        $j('.announcement-dismiss').bind('click', function(e) {        	
        	var annID = $j(this).attr("data-object-id");
        	$j('#jive-body-announcements-dismiss-' + annID).fadeIn(3000,function(){
            	view.emitP('dismiss',annID).addCallback(function(data){
            		window.location.reload();
            	});        	
        	}); 
        	$j('.jive-alert-userRemove-message').hide(); 
        	$j('#jive-body-announcements-expire-' + annID).hide(); 
        	$j('#jive-body-announcements-delete-' + annID).hide();
        });          
      
    };
    
});
