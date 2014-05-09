/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.model.CheckPointController = function() {

    var that = this;

    var projectID = null;
    this.getProjectID = function(){
        return this.projectID;
    }
    this.setProjectID = function(id){
        this.projectID = id;
    }
    
    this.getCanCreate = function(){
        return this.canCreate;
    }
    this.setCanCreate = function(val){
        this.canCreate = val;
    }

    var containerID = null;
    this.getContainerID = function(){
        return this.containerID;
    }
    this.setContainerID = function(id){
        this.containerID = id;
    }


    var deleteURL = null;
    this.getDeleteURL = function(){
        return this.deleteURL;
    }
    this.setDeleteURL = function(id){
        this.deleteURL= id;
    }

    var deleteConfirmMsg = null;
    this.getDeleteConfirmMsg = function(){
        return this.deleteConfirmMsg;
    }
    this.setDeleteConfirmMsg = function(id){
        this.deleteConfirmMsg = id;
    }

    var unauthMsg = null;
    this.getUnauthMsg = function(){
        return this.unauthMsg;
    }
    this.setUnauthMsg = function(id){
        this.unauthMsg = id;
    }

    var errorMsg = null;
    this.getErrorMsg= function(){
        return this.errorMsg;
    }
    this.setErrorMsg = function(id){
        this.errorMsg = id;
    }

    var createURL = null;
    this.setCreateURL = function(url){
        this.createURL = url;
    }
    this.getCreateURL = function(){
        return this.createURL;
    }

    this.addCheckPoint = function(date){
        document.location.href = that.getCreateURL() + "?dueDateTime=" + date + "&project=" + that.getProjectID();
    }

    this.deleteCheckPoint = function(id){
        document.location.href = that.getDeleteURL() + "?checkPointID=" + id + "&project=" + that.getProjectID();
    }


    this.reload = function() {
        window.location.reload();
    }
}