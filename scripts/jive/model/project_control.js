/*jslint browser:true */
/*extern jive $j */

/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.model.ProjectController = function(baseURL, objectType) {

    var that = this;
    this.projectObjectType = objectType;

    this.archiveURL = jive.rest.url("/project/archive");
    this.unarchiveURL = jive.rest.url("/project/unarchive");
    this.locatorURL = jive.rest.url("/objectType/url/findURL");
    this.statusURL = jive.rest.url("/project/status");

    this.doArchive = function(projectID, callback){
        $j.post(this.archiveURL + "/" + projectID, callback);
    };

    this.doUnarchive = function(projectID, callback){
        $j.post(this.unarchiveURL + "/" + projectID, callback);
    };

    this.doStatus = function(text, statusType, projectID, callback){
        $j.post(this.statusURL + "/" + projectID + "/"+ statusType, {'text': text}, callback);
    };

    this.doLocate = function(projectID, callback){
        $j.getJSON(this.locatorURL + "/" + objectType + "/" + projectID, callback);
    };

};

