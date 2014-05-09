/**
 * Controller for EAE action queue
 *
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/jivetasklist.js
 * @depends path=/resources/scripts/apps/activity_stream/activity_notifier.js
 * @depends path=/resources/scripts/apps/action_queue/views/action_queue_list_view.js
 * @depends path=/resources/scripts/apps/action_queue/models/action_queue_source.js
 * @depends path=/resources/scripts/apps/action_queue/models/action_queue_action_result.js
 * @depends path=/resources/scripts/apps/action_queue/views/action_queue_tab_view.js
 * @depends path=/resources/scripts/apps/shared/views/loader_view.js
 * @depends template=jive.eae.actionqueue.*
 * @depends template=jive.welcome.updateIndicator
 */
define('jive.ActionQueue.Main', [
    'jquery',
    'jive.ActionQueue.ActionQueueTabView'
], function($, AQTabView) {
    return jive.oo.Class.extend(function(protect) {
        this.init = function (options) {
            this.userId = window._jive_effective_user_id;

            var aqController = this;

            aqController.actionQueueService = new jive.ActionQueue.ListSource();

            aqController.tabsView = new AQTabView({selector: '#j-actions-page-tabs' });

            aqController.currentTab = options.currentTab;
            aqController.userId = window._jive_effective_user_id;
            aqController.$contentArea = $('#j-actions-page-content');

            aqController.tabsView.addListener('switchTabs', function(tabLink) {
                aqController.spinner = new jive.loader.LoaderView();
                aqController.spinner.prependTo('#j-dynamic-pane');
                if (tabLink.attr('id') == 'jive-aq-pending') {
                    jive.locationState.setState({}, '', 'actions');
                }
                else if (tabLink.attr('id') == 'jive-aq-archived') {
                    jive.locationState.setState({}, '', 'actions/archived');
                }
                else if (tabLink.attr('id') == 'jive-tasks') {
                    jive.locationState.setState({}, '', 'actions/tasks');
                }
            });

            if(aqController.currentTab == 'jive-tasks') {
                aqController.initializeTaskView(aqController.currentTab);
            }
            else {
                if (aqController.currentTab == 'jive-aq-archived') {
                    aqController.archived = true;
                }
                else {
                    aqController.archived = false;
                }
                aqController.queueView = new jive.ActionQueue.ListView({selector:'#j-action-queue'});
                aqController.attachQueueListeners();
            }
        };

        this.attachGlobalEventListeners = function() {
            var aqController = this;
            this.aqPollHandler = function(data) {
                aqController.autoUpdate(data);
            };
            this.actionTakenHandler = function(itemID, data) {
                aqController.decrementTabCount('jive-aq-pending', 1);
                aqController.queueView.actionTaken(itemID, data);
            };
            this.taskCompleteHandler = function(taskID) {
                aqController.decrementTabCount('jive-tasks', 1);
            };
            this.taskIncompleteHandler = function(taskID) {
                aqController.decrementTabCount('jive-tasks', -1);
            };
            jive.ActivityStream.activityNotifier.addListener('activityStream.poll', this.aqPollHandler);

            jive.switchboard.addListener('actions.actionTaken', this.actionTakenHandler)
                .addListener('tasks.taskComplete', this.taskCompleteHandler)
                .addListener('tasks.taskIncomplete', this.taskIncompleteHandler);
        };

        this.loadView = function(tabID, promise) {
            var aqController = this;
            if(tabID == 'jive-tasks') {
                aqController.initializeTaskView(tabID, promise);
            }
            else {
                aqController.initializeActionView(tabID, promise);
            }
        };

        this.initializeTaskView = function(tabID, promise) {
            var aqController = this;
            aqController.$contentArea.html('<div id="jive-inbox-task-container"></div>');
            var editTaskCompleteAction = jive.app.url({path:"/edit-task!complete.jspa"}),
                editTaskIncompleteAction = jive.app.url({path:"/edit-task!incomplete.jspa"}),
                editTaskTakeAction = jive.app.url({path:"/edit-task!take.jspa"}),
                editTaskDeleteAction = jive.app.url({path:"/edit-task!delete.jspa"}),
                viewTaskListAction = jive.app.url({path:"/view-task-list.jspa?owner=" + aqController.userId}),
                taskDeleteConfirmation = jive.eae.actionqueue.jsI18nHelper({key: 'task.delete.confirm.msg'}),
                taskListUnauthorizedMessage = jive.eae.actionqueue.jsI18nHelper({key: 'task.list.unauth'}),
                taskListErrorMessage = jive.eae.actionqueue.jsI18nHelper({key: 'task.list.error'});
            //global
            jivetasklist = new JiveTaskList("jive-inbox-task-container",
                editTaskCompleteAction,
                editTaskIncompleteAction,
                editTaskTakeAction,
                editTaskDeleteAction,
                viewTaskListAction,
                taskDeleteConfirmation,
                taskListUnauthorizedMessage,
                taskListErrorMessage);
            jivetasklist.addListener('overdueTaskComplete', function(taskID) {
                jive.switchboard.emit('tasks.taskComplete', taskID);
            }).addListener('overdueTaskIncomplete', function(taskID) {
                jive.switchboard.emit('tasks.taskIncomplete', taskID);
            });
            $('#jive-inbox-task-container').load(viewTaskListAction, function() {
                if (aqController.spinner) {
                    aqController.spinner.getContent().remove();
                    aqController.spinner.destroy();
                    aqController.spinner = null;
                }
            });
            aqController.tabsView.selectTab(tabID);
            aqController.currentTab = "jive-tasks";
            if (promise) {
                promise.emitSuccess();
            }
        };

        this.initializeActionView = function(tabID, promise) {
            var aqController = this;
            if (tabID == 'jive-aq-archived') {
                aqController.archived = true;
            }
            aqController.actionQueueService.initializeView(tabID).addCallback(function(viewData) {
                var $newContent = $(jive.eae.actionqueue.actionsContent(viewData));
                aqController.$contentArea.html($newContent);
                aqController.queueView = new jive.ActionQueue.ListView(
                    {selector:'#j-action-queue'});
                aqController.attachQueueListeners();
                aqController.spinner.getContent().remove();
                aqController.spinner.destroy();
                if (promise) {
                    promise.emitSuccess();
                }
            });
            aqController.tabsView.selectTab(tabID);
            aqController.currentTab = tabID;
        };

        this.attachQueueListeners = function() {
            var aqController = this;
            aqController.queueView.addListener('performAction',
                function(itemID, actionCode, message) {
                    var postData = new jive.ActionQueue.ActionResult(aqController.userId, itemID, actionCode, message);
                    aqController.actionQueueService.performAction(postData).addCallback(function(data) {
                        jive.switchboard.emit('actions.actionTaken', itemID, data);
                    });
                }).addListener('actionCompleted',
                function(lastItemTime, promise) {
                    aqController.actionQueueService.getMore(lastItemTime, 1, aqController.dismissed)
                        .addCallback(function(data) {
                            promise.emitSuccess(data);
                        });
                }).addListener('loadMore',
                function(beforeThisTime, promise) {
                    aqController.actionQueueService.getMore(beforeThisTime, 10, aqController.archived)
                        .addCallback(function(data) {
                            promise.emitSuccess(data);
                        });
                });
            aqController.queueView.postRender();
        };

        this.autoUpdate = function(data) {
            var aqController = this;
            if (data.newActivityCounts['actions'] &&
                data.newActivityCounts['actions'][0] &&
                $('#j-action-queue').length) {
                if ($('#jive-aq-pending').hasClass('j-sub-selected')) {
                    aqController.actionQueueService.list().addCallback(function(actionQueueData) {
                        aqController.queueView.refresh(actionQueueData);
                    });
                }
            }
            $('#jive-aq-pending .j-js-update-indicator').replaceWith(
                jive.eae.actionqueue.aqTabCount({'count': data.fullCounts['actions']}));
        };

        this.decrementTabCount = function(tabId, countValue) {
            var $tab = $('#' + tabId),
                $tabCounter = $tab.find('.j-js-update-indicator'),
                currentCount = parseInt($tabCounter.data('count'), 10),
                newCount = currentCount - countValue;

            if (newCount < 0) {
                newCount = 0;
            }
            if (newCount == 0) {
                $tabCounter.hide();
            }
            $tabCounter.replaceWith(jive.eae.actionqueue.aqTabCount({'count': newCount}));
        };
    });
});
