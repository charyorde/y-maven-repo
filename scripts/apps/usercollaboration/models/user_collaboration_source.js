/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('UserCollaboration');

/**
 * @class
 * @extends jive.RestService
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.UserCollaboration.Model = jive.RestService.extend(function(protect) {

    protect.resourceType = "directmessage";
    protect.pluralizedResourceType = protect.resourceType;

    this.addCollaborators = function(directMessageID, collaborators) {
        var url = this.RESOURCE_ENDPOINT + '/addcollaborators/';
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {
            url: url,
            data: JSON.stringify({
                directMessageID: directMessageID,
                collaborators: collaborators
            })
        });
    };

    this.addShareCollaborators = function(shareID, collaborators) {
        var url = jive.rest.url("/objects") + '/addcollaborators/';
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {
            url: url,
            data: JSON.stringify({
                shareID: shareID,
                collaborators: collaborators
            })
        });
    };
});
