/*jslint browser:true */

var JiveTaskList = $Class.extend({

    /*
     * Initialize the JiveWidgets object.
     * @containerID The id of the task list container
     * @completeURL The url to mark a task complete
     * @incompleteURL The url to mark a task incomplete
     * @takeURL The url to take an unassigned task
     * @deleteURL The url to delete a task
     * @taskListURL The url to load the task list
     * @deleteConfirmMsg The i18n msg for confirming a delete
     * @unauthMsg The i18n msg for a 403 response
     * @errorMsg The i18n msg for a 500 response
     */
    init: function(containerID, completeURL, incompleteURL, takeURL, deleteURL, taskListURL, deleteConfirmMsg,
                   unauthMsg, errorMsg)
    {
        this.containerID = containerID;
        this.completeURL = completeURL;
        this.incompleteURL = incompleteURL;
        this.takeURL = takeURL;
        this.deleteURL = deleteURL;
        this.taskListURL = taskListURL;
        this.deleteConfirmMsg = deleteConfirmMsg;
        this.unauthMsg = unauthMsg;
        this.errorMsg = errorMsg;
        this.start = 0;
    },

    toggleTaskDetails: function(taskID) {
        $j('#jive-task-body-' + taskID).toggle();
        if ($j('#jive-task-body-' + taskID + ':visible').size()) {
            $j('#jive-task-' + taskID + '-less').css({'display' : ""});
            $j('#jive-task-' + taskID + '-more').css({'display' : 'none'});
            $j('#jive-task-' + taskID).addClass('jive-task-open');
        }
        else {
            $j('#jive-task-' + taskID + '-more').css({'display' : ""});
            $j('#jive-task-' + taskID + '-less').css({'display' : 'none'});
            $j('#jive-task-' + taskID).removeClass('jive-task-open');
        }
    },

    markTaskComplete: function(taskID, callback) {
        var instance = this,
            $task = $j('#jive-task-' + taskID);
        $j('#jive-task-checkbox-' + taskID).prop('disabled', true);
        $task.addClass('jive-task-markcomplete');
        $j.post(instance.completeURL, { 'task' : taskID}, function(data) {
            $j.ajax({
                type: 'GET',
                url: instance.taskListURL,
                data: {
                    'start':instance.start,
                    'filter':instance.filter
                },
                cache: false,  // for IE
                success: function(data) {
                    instance._insertHTML(data, callback);
                    if ($task.hasClass('jive-task-overdue')) {
                        instance.emit('overdueTaskComplete', taskID);
                    }
                }
            });
        });
    },

    markTaskIncomplete: function(taskID, callback) {
        var instance = this,
            $task = $j('#jive-task-' + taskID);
        $j('#jive-task-checkbox-' + taskID).prop('disabled', true);
        $j('#jive-task-' + taskID).addClass('jive-task-markincomplete');
        $j.post(instance.incompleteURL, { 'task' : taskID}, function(data) {
            $j.ajax({
                type: 'GET',
                url: instance.taskListURL,
                data: {
                    'start':instance.start,
                    'filter':instance.filter
                },
                cache: false,  // for IE
                success: function(data) {
                    instance._insertHTML(data, callback);
                    if (!$task.hasClass('jive-task-overdue')) {
                        instance.emit('overdueTaskIncomplete', taskID);
                    }
                }
            });
        });
    },

    takeTask: function(taskID) {
        var instance = this;
        $j.ajax({
            url: this.takeURL,
            type: 'POST',
            data: { task: taskID },
            success: function() {
                instance.reload();
            },
            error: function(xhr) {
                if (xhr.status == 403) {
                    alert(instance.unauthMsg);
                } else if (xhr.status == 500) {
                    alert(instance.errorMsg);
                }
            }
        });
    },

    deleteTask: function(taskID) {
        if (confirm(this.deleteConfirmMsg)) {
            var instance = this;
            $j.ajax({
                url: this.deleteURL,
                type: 'POST',
                data: { task: taskID },
                success: function() {
                    instance.reload();
                },
                error: function(xhr) {
                    if (xhr.status == 403) {
                        alert(instance.unauthMsg);
                    } else if (xhr.status == 500) {
                        alert(instance.errorMsg);
                    }
                }
            });
        }
    },

    reloadAndHighlight: function(id2highlight, callback) {
        var instance = this;
        $j.ajax({
            url: this.taskListURL,
            type: 'GET',
            cache: false,   // For IE
            data: {
                start: this.start,
                filter: this.filter,
                ownerID: this.ownerID,
                projectID: this.projectID
            },
            success: function(data) {
                instance._insertHTML(data, callback);
                $j('[id="' + id2highlight + '"]').effect('highlight');
            },
            error: function(xhr) {
                if (xhr.status == 403) {
                    alert(instance.unauthMsg);
                } else if (xhr.status == 500) {
                    alert(instance.errorMsg);
                }
            }
        });
    },

    reload: function(callback) {
        var instance = this;
        $j.ajax({
            url: this.taskListURL,
            type: 'GET',
            cache: false,   // For IE
            data: {
                start: this.start,
                filter: this.filter,
                mode: this.mode,
                ownerID: this.ownerID,
                projectID: this.projectID
            },
            success: function(data) {
                instance._insertHTML(data, callback);
            },
            error: function(xhr) {
                if (xhr.status == 403) {
                    alert(instance.unauthMsg);
                } else if (xhr.status == 500) {
                    alert(instance.errorMsg);
                }
            }
        });
    },

    setStart: function(start) {
        this.start = start;
    },

    setFilter: function(filter) {
        this.filter = filter;
        this.start = 0;
    },

    setMode: function(mode) {
        this.mode = mode;
        this.start = 0;
    },

    setOwnerID: function(ownerID) {
        this.ownerID = ownerID;
        this.start = 0;
    },

    setProjectID: function(projectID) {
        this.projectID = projectID;
        this.start = 0;
    },

    _scripts: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,

    _insertHTML: function(html, callback) {
        var withoutScripts = html.replace(this._scripts, '');
        var container = $j('[id="' + this.containerID + '"]').html(withoutScripts);
        jive.rte.renderedContent.emit("renderedContent", container);

        if (callback) {
            callback();
        }
    }
});

jive.conc.observable(JiveTaskList.prototype);
