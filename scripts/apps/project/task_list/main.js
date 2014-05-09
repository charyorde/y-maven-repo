/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*globals jivetasklist */

jive.namespace('project.TaskList');

/**
 * JavaScript for task lists.  Currently this class acts as a view while
 * controller and model code are mostly still in jivetasklist.js.
 *
 * @depends path=/resources/scripts/jivetasklist.js
 * @depends template=jive.project.tasks.markCompleteConfirm
 */
jive.project.TaskList = jive.oo.Class.extend(function(protect) {
    var MODE_GROUPED = "grouped"
      , MODE_FLAT = "flat"
      , FILTER_TASKS_INCOMPLETE = "incomplete"
      , FILTER_TASKS_COMPLETE = "complete"
      , $ = jQuery;

    protect.init = function(mode, filter, userID) {
        var jiveFollow = new jive.FollowApp.Main({
              objectType: 602,
              objectID:null,
              featureName:'task',
              i18n:null
          })
          , initMode = this.initMode.bind(this)
          , main = this;

        this.mode = mode;
        this.filter = filter;
        this.userID = userID;

        // For mysterious reasons, the ordering of delegate bindings below is
        // important in IE.  The 'click' handler on '#show-completed' must be
        // delegated before either 'change' handler on '#task-assignee' or
        // '#task-project' or it will not function.
        $(document).ready(function() {
            var $list = $('[id="'+ jivetasklist.containerID +'"]');

            initMode();

            $list.delegate('#j-task-groupview-sel', 'click', function(event) {
                main.switchToGrouped();
                event.preventDefault();
            });

            // checkbox
            $list.delegate('#show-completed', 'click', function(event) {
                var newFilter = main.filter == FILTER_TASKS_COMPLETE ? FILTER_TASKS_INCOMPLETE : FILTER_TASKS_COMPLETE;

                jivetasklist.setMode(MODE_GROUPED);
                jivetasklist.setFilter(newFilter);
                jivetasklist.reload(function() {
                    main.filter = newFilter;
                    initMode();
                });

                // Does not prevent default.
            });

            $list.delegate('#task-assignee', 'change', function() {
                jivetasklist.setOwnerID(this.value);
                jivetasklist.reload(initMode);
            });

            $list.delegate('#task-project', 'change', function() {
                jivetasklist.setProjectID(this.value);
                jivetasklist.reload(initMode);
            });

            // link
            $list.delegate('#j-task-flatview-sel', 'click', function(event) {
                main.switchToFlat();
                event.preventDefault();
            });

            // radio button
            $list.delegate('#task-state-incomplete', 'click', function(event) {
                jivetasklist.setMode(MODE_FLAT);
                jivetasklist.setFilter(FILTER_TASKS_INCOMPLETE);
                jivetasklist.reload(initMode);
                // event.preventDefault();
            });

            // radio button
            $list.delegate('#task-state-complete', 'click', function(event) {
                jivetasklist.setMode(MODE_FLAT);
                jivetasklist.setFilter(FILTER_TASKS_COMPLETE);
                jivetasklist.reload(initMode);
                // event.preventDefault();
            });

            $list.delegate('.js-pagination', 'click', function(event) {
                jivetasklist.setStart($(this).data('start'));
                jivetasklist.reload(initMode);
                event.preventDefault();
            });

            // checkbox
            $list.delegate('.js-task-checkbox', 'click', function(event) {
                var $task = $(this)
                  , completed = !$task.is(':checked')
                  , id = $task.data('id')
                  , ownerID = $task.data('owner-id');

                if (completed) {
                    jivetasklist.markTaskIncomplete(id, initMode);
                } else if (ownerID && main.userID != ownerID) {
                    if (window.confirm(jive.project.tasks.markCompleteConfirm())) {
                        jivetasklist.markTaskComplete(id, initMode);
                    } else {
                        event.preventDefault();
                    }
                } else {
                    jivetasklist.markTaskComplete(id, initMode);
                }
            });

            $list.delegate('.js-task-more, .js-task-less', 'click', function(event) {
                jivetasklist.toggleTaskDetails($(this).data('id'));
                event.preventDefault();
            });

            $list.delegate('.js-delete-task', 'click', function(event) {
                jivetasklist.deleteTask($(this).data('id'));
                event.preventDefault();
            });

            $list.delegate('.js-take-task', 'click', function(event) {
                jivetasklist.takeTask($(this).data('id'));
                event.preventDefault();
            });
        });
    };

    protect.initMode = function() {
        if (this.mode == MODE_GROUPED) {
            this.selectGrouped();
        } else {
            this.selectFlat();
        }
    };

    protect.selectGrouped = function() {
        $('#flat-options').hide();
        $('#grouped-options').fadeIn('fast');
        $('#task-view-f').removeClass('selected');
        $('#task-view-g').addClass('selected');
        $('#task-view-g a').hide();
        $('#task-view-f a').show();
        $('#task-view-g strong').show();
        $('#task-view-f strong').hide();
    };

    protect.switchToGrouped = function() {
        var main = this;
        this.selectGrouped();
        jivetasklist.setMode(MODE_GROUPED);
        jivetasklist.reload(function() {
            main.mode = MODE_GROUPED;
            main.initMode();
        });
    };

    protect.selectFlat = function() {
        $('#grouped-options').hide();
        $('#flat-options').fadeIn('fast');
        $('#task-view-g').removeClass('selected');
        $('#task-view-f').addClass('selected');
        $('#task-view-g a').show();
        $('#task-view-f a').hide();
        $('#task-view-g strong').hide();
        $('#task-view-f strong').show();
    };

    protect.switchToFlat = function() {
        var main = this;
        this.selectFlat();
        jivetasklist.setMode(MODE_FLAT);
        jivetasklist.reload(function() {
            main.mode = MODE_FLAT;
            main.initMode();
        });
    };
});
