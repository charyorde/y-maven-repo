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
jive.model.TaskController = function() {

    var that = this;

    var projectID = null;
    this.getProjectID = function(){
        return this.projectID;
    };
    this.setProjectID = function(id){
        this.projectID = id;
    };
    
    this.getCanCreate = function(){
        return this.canCreate;
    }
    this.setCanCreate = function(val){
        this.canCreate = val;
    }

    var containerID = null;
    this.getContainerID = function(){
        return this.containerID;
    };
    this.setContainerID = function(id){
        this.containerID = id;
    };

    var completeURL = null;
    this.getCompleteURL = function(){
        return this.completeURL;
    };
    
    this.setCompleteURL = function(id){
        this.completeURL = id;
    };


    var incompleteURL = null;
    this.getIncompleteURL = function(){
        return this.incompleteURL;
    };
    this.setIncompleteURL = function(id){
        this.incompleteURL = id;
    };

    var takeURL = null;
    this.getTakeURL = function(){
        return this.takeURL;
    };
    this.setTakeURL = function(id){
        this.takeURL = id;
    };

    var deleteURL = null;
    this.getDeleteURL = function(){
        return this.deleteURL;
    };
    this.setDeleteURL = function(id){
        this.deleteURL= id;
    };

    var deleteConfirmMsg = null;
    this.getDeleteConfirmMsg = function(){
        return this.deleteConfirmMsg;
    };
    this.setDeleteConfirmMsg = function(id){
        this.deleteConfirmMsg = id;
    };

    var unauthMsg = null;
    this.getUnauthMsg = function(){
        return this.unauthMsg;
    };
    this.setUnauthMsg = function(id){
        this.unauthMsg = id;
    };

    var errorMsg = null;
    this.getErrorMsg= function(){
        return this.errorMsg;
    };
    this.setErrorMsg = function(id){
        this.errorMsg = id;
    };

    var createURL = null;
    this.setCreateURL = function(url){
        this.createURL = url;
    };
    this.getCreateURL = function(){
        return this.createURL;
    };

    var dateI18nURL = null;
    this.setDateI18nURL = function(url){
        this.dateI18nURL = url;
    };
    this.getDateI18nURL = function() {
        return this.dateI18nURL;
    };

    var i18n = {delete_task_msg: "This action will delete the task and all it's subtask. Are you sure?",
                delete_task : "Delete Task", delete_sub_task :"Delete Sub Tasks", cancel : "Cancel",
                complete_task_msg: "This action will complete the task and all it's subtask. Are you sure?",
                complete_task : "Complete Task", complete_sub_task :"Complete Sub Tasks",
                incomplete_task_msg: "This action will mark the task and all it's subtask as incomplete. Are you sure?",
                incomplete_task : "Mark I", complete_sub_task :"Complete Sub Tasks",
                assign_task_msg: "This action will assign this task and all it's subtask. Are you sure?",
                assign_task : "Assign Task", assign_sub_task :"Assign Sub Tasks"
    };

    this.setI18n = function(messages){
        i18n = messages;
    };


    this.markTaskComplete = function(taskID, isParent) {
        if(isParent){
            $j("#dialog-confirm-message").text(i18n.complete_task_msg);
            $j(function() {
                var buttons = {};
                buttons[i18n.complete_task] = function() {
                            $j(this).dialog('close');
                            that.ajaxCompleteTask(taskID, false);
                        };
                buttons[i18n.complete_sub_task] =  function() {
                            $j(this).dialog('close');
                            that.ajaxCompleteTask(taskID, true);
                        };
                buttons[i18n.cancel] = function() {
                            $j(this).dialog('close');
                        };

                $j("#dialog-confirm").dialog({
                    autoOpen: false,
                    resizable: false,
                    height:150,
                    width: 400,
                    modal: true,
                    buttons: buttons
                });
                $j("#dialog-confirm").dialog('open');
            });
        }else{
            that.ajaxCompleteTask(taskID, false);
        }
    };

    this.markTaskIncomplete = function(taskID) {
        $j.post(this.getIncompleteURL(), { 'task' : taskID},that.reload);
    };

    this.takeTask = function(taskID) {
        $j.ajax({
            url: this.getTakeURL(),
            type: 'POST',
            data: { task: taskID },
            success: function() {
                that.reload();
            },
            error: function(xhr) {
                if (xhr.status == 403) {
                    alert(that.getUnauthMsg());
                } else if (xhr.status == 500) {
                    alert(that.getErrorMsg());
                }
            }
        });
    };

    this.deleteTask = function(taskID, isParent) {
        if(isParent){
            $j("#dialog-confirm-message").text(i18n.delete_task_msg);
            $j(function() {
                var buttons = {};
                buttons[i18n.delete_task] = function() {
                            $j(this).dialog('close');
                            that.ajaxDeleteTask(taskID, false);
                        };
                buttons[i18n.delete_sub_task] =  function() {
                            $j(this).dialog('close');
                            that.ajaxDeleteTask(taskID, true);
                        };
                buttons[i18n.cancel] = function() {
                            $j(this).dialog('close');
                        };

                $j("#dialog-confirm").dialog({
                    autoOpen: false,
                    resizable: false,
                    height:150,
                    width: 400,
                    modal: true,
                    buttons: buttons
                });
                $j("#dialog-confirm").dialog('open');
            });
        }else{
            that.ajaxDeleteTask(taskID, false);
        }
    };

    this.ajaxCompleteTask = function(taskID, completeChildren){
        $j.ajax({
            url: that.getCompleteURL(),
            type: 'POST',
            data: { task: taskID, "applyToChildren": completeChildren},
            success: function() {
                that.reload();
            },
            error: function(xhr) {
                if (xhr.status == 403) {
                    alert(that.getUnauthMsg());
                } else if (xhr.status == 500) {
                    alert(that.getErrorMsg());
                }
            }
        });
    };

    this.addTask = function(date){
        document.location.href = that.getCreateURL() + "&dueDateTime=" + date;
    };

    this.dateI18nTask = function(date, callback) {
        $j.ajax({
            url: that.getDateI18nURL(),
            type: 'POST',
            data: { time: date.getTime() },
            dataType: 'json',
            success: function(data, type) {
                callback(data.date);
            },
            error: function(xhr) {
                if (xhr.status == 403) {
                    alert(that.getUnauthMsg());
                } else if (xhr.status == 500) {
                    alert(that.getErrorMsg());
                }
            }
        });
    };

    this.ajaxDeleteTask= function(taskID, deleteChildren) {
        $j.ajax({
            url: that.getDeleteURL(),
            type: 'POST',
            data: { task: taskID, "applyToChildren": deleteChildren},
            success: function() {
                that.reload();
            },
            error: function(xhr) {
                if (xhr.status == 403) {
                    alert(that.getUnauthMsg());
                } else if (xhr.status == 500) {
                    alert(that.getErrorMsg());
                }
            }
        });
    }

    this.reload = function() {
        window.location.reload();
    };
};
