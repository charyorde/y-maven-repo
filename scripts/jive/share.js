/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 * 
 * This will handle the gigya flavour of sharing... - Jome.
 */

/**
 * Handles Share functionality
 * 
 * @depends path=/resources/scripts/jive/dispatcher.js
 * @depends path=/resources/scripts/apps/share/main.js
 */

jive.dispatcher.listen('gigyashare', function(payload) {
	var baseUrl = window._jive_base_absolute_url
	showGigyaShare(payload, baseUrl);
	return {};
});

jive.dispatcher.listen('lrshare', function(payload) {
    var baseUrl = window._jive_base_absolute_url;
    var share = new jive.ShareApp.Main();
    share.showLRModal(payload, baseUrl);
    return {};
})

if (!jive.share) {
	jive.share = (function(share) {
		jive.dispatcher.listen('share', function(payload) {
			share = share || new jive.ShareApp.Main();
			share.showModal(payload.objectId, payload.objectType);
		});

		return {};
	})(undefined);
}

// using the default for now
/*if (!jive.share) {
    jive.share = (function(share) {
        jive.dispatcher.listen('share', function(payload) {
            share = share || new jive.ShareApp.Main();

            share.showModal(payload.objectId, payload.objectType);
        });


        return {};
    })(undefined);
}*/

this.showGigyaShare = function(content, baseUrl) {

	var windowUrl = window.location.pathname;
	var photoTypeString = "com.jivesoftware.plugin.photo.impl";
	
	if(content.objectLinkback == null){
		//GRab the url from the current window.
		content.objectLinkback = window.location.pathname;
	}
	var ua = new gigya.socialize.UserAction();
	
	// Define a UserAction onject

	ua.setLinkBack(baseUrl + content.objectLinkback);	
	
	if(content.hasOwnProperty('objectPhotourl')){
		var image = {
				type : 'image',
				src : content.objectPhotourl,
				href : baseUrl + content.objectLinkback
			};
		//console.log('Image object is: ' + image);
		ua.addMediaItem(image);
		ua.setTitle(content.objectPhototitle);	
	}
	
	//testing for the /photos/ url so we can retrieve the photo link
	if( windowUrl.search(/photos/) && windowUrl.indexOf('/photos/') == 0){
		var currentPhotoUrl = jQuery('.jive-photo-current > div > a').attr('href');
		var image = {
				type : 'image',
				src : currentPhotoUrl,
				href: baseUrl + content.objectLinkback 
			};
			ua.addMediaItem(image);
			
		
	}
	
	if (content.hasOwnProperty('objectImageurl')) {
		var image = {
			type : 'image',
			src : baseUrl + content.objectImageurl,
			href: baseUrl + content.objectLinkback 
		};
		ua.addMediaItem(image);
	}


	if ((/<span>/g).test(content.objectBody)) {
		var bodyText = content.objectBody.split("<span>")[1];
		bodyText = bodyText.split("</span>")[0];
	} else {
		bodyText = content.objectBody;
	}
	
	//In this scenario, we want to make sure that the title is
	//not null.
	if	(content.objectTitle == null){
		ua.setTitle(content.objectBody);
	}
	else{
		ua.setTitle(content.objectTitle);		
	}

	ua.setDescription(bodyText);
	ua.addActionLink("Read more", baseUrl + content.objectLinkback);

	console.log(ua);
	// Publish the action
	gigya.socialize.showShareUI({
		userAction : ua
	});
};
