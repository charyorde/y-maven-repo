/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true laxbreak:true */
/*extern jive $j $Class TimeoutExecutor SuperNote */

/*
 * @depends path=/resources/scripts/supernote.js
 */
var JiveProjectTooltip = $Class.extend({
    init: function(projectID, checkpointTT, taskTT, createTT, taskTTURL, textTTLoading, textTTError, textCPEdit, textCPDelete, forceMouseEvents) {
        this.loadingContent = $j('<strong/>').addClass('jive-tooltip2-loading').text(textTTLoading);
        this.timeoutExecutor = null;
        this.projectID = projectID;
        this.checkpointTT = checkpointTT;
        this.taskTT = taskTT;
        this.createTT = createTT;
        this.taskTTURL = taskTTURL;
        this.textTTError = textTTError;
        this.textCPEdit = textCPEdit;
        this.textCPDelete = textCPDelete;
        this.jiveUserTips = new SuperNote('jiveTT', {showDelay: 700, hideDelay: 30, cssProp: 'visibility', cssVis: 'visible', cssHid: 'hidden', forceMouseEvents: forceMouseEvents});
    },

    getCheckpointsTooltip: function(checkpoints) {
        this.cancelTooltip();
        $j('#' + this.checkpointTT).html(this.loadingContent);
        this.timeoutExecutor = new TimeoutExecutor(this.getCheckpoints.bind(this, checkpoints), 700);
    },

    getCheckpoints: function(checkpoints) {
        var that = this;
        $j('#' + this.checkpointTT).html('');
        checkpoints.forEach(function(checkpoint) {
            $j('#' + that.checkpointTT).append(

            $j('<h4/>').append(
                $j('<span/>').addClass('jive-icon-med jive-icon-checkpoint')
            ).append(
                document.createTextNode(checkpoint.name)
            )

            ).append(
                checkpoint.duedate ? $j('<div/>').addClass('j-cpdue clearfix').text(checkpoint.duedate) : ''
            ).append(
                checkpoint.description ? $j('<div/>').addClass('j-cpdesc clearfix').text(checkpoint.description) : ''
            ).append(
                (checkpoint.editURL && checkpoint.deleteURL) ?
                    $j('<div/>').addClass('j-cplink clearfix').append(
                        $j('<a/>').attr('href', checkpoint.editURL).text(that.textCPEdit)
                    ).append(
                        $j('<a/>').attr('href', checkpoint.deleteURL).text(that.textCPDelete)
                    ) : ''

            );
        });
    },

    getTasksTooltip: function(day) {
        this.cancelTooltip();
        $j('#' + this.taskTT).html(this.loadingContent);
        this.timeoutExecutor = new TimeoutExecutor(this.getTasks.bind(this, day), 700);
    },

    getTasks: function(day) {
        $j.ajax({
            type: 'GET',
            url: this.taskTTURL,
            data: {
                project: this.projectID,
                day: day
            },
            dataType: 'html',
            success: function(content) {
                $j('#' + this.taskTT).html(content);
            },
            error: function() {
                $j('#' + this.taskTT).text(this.textTTError);
            }
        });
    },

    getDOM: function(){
        return $j('#' + this.taskTT).get(0);
    },

    getCreateLinkDOM: function(){
        return $j('#' + this.createTT).get(0);
    },

    getCheckPointDOM: function(){
        return $j('#' + this.checkpointTT).get(0);
    },

    cancelTooltip: function() {
        if (this.timeoutExecutor) {
            this.timeoutExecutor.cancel();
        }
    }
});
