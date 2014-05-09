/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Navbar.Menu.Home');

/**
 * Abstract controller class for Home unread count drop down
 * @depends template=jive.nav.menu.home.main
 * @depends template=jive.nav.menu.home.content
 * @depends template=jive.home.countForTitle
 * @depends template=jive.welcome.updateIndicator
 * @depends path=/resources/scripts/apps/activity_stream/activity_notifier.js
 * @depends path=/resources/scripts/apps/activity_stream/models/activity_stream_source.js
 */
jive.Navbar.Menu.Home.Main = jive.oo.Class.extend(function(protect) {

    this.init = function(navSelector) {
        var self = this;
        self.$button = $j(navSelector);
        self.menuSource = new jive.ActivityStream.StreamSource();
        self.counts = {inbox:   0,
                       actions: 0,
                       tasks:   0};
        self.pendingActionsCount = 0;

        $j(navSelector).delegate('.j-js-update-indicator', 'click', function(e) {
            var $badgeBtn = $j(this),
                $badgeMenu = $j('#j-home-global-nav-menu');
            if (!$badgeMenu.length) {
                var $countButton = $j(this);
                self.$menu = $j(jive.nav.menu.home.main({data: '', counts: ''}));
                self.spinner = new jive.loader.LoaderView();
                self.$menu.html(self.spinner.getContent());
                self.$menu.delegate('div.j-aq-entry', 'click', function(e2) {
                    if (!$j(e.target).is('a')) {
                        window.location=jive.app.url({path:"/actions"});
                        e2.preventDefault();
                    }
                });
                self.$menu.popover({
                    context: $countButton,
                    darkPopover: false,
                    destroyOnClose: true,
                    putBack: false,
                    onLoad: function() {
                        self.menuSource.getGlobalNavMenu().addCallback(function(data) {
                            if (data.inboxItems.activityContainerList.length || data.actionItems.actionQueueList.length ||
                                data.taskItems.taskList.length) {
                                var $menuContent = $j(jive.nav.menu.home.content({data: data, counts: self.counts}));
                                self.$menu.trigger('popover.html', [$menuContent]);
                                self.spinner.destroy();
                            }
                            else {
                                self.spinner.destroy();
                                self.$menu.trigger('close');
                                $badgeBtn.hide();
                                $badgeBtn.data('count', 0);
                                $badgeBtn.html("0");

                                // also make sure counts in home left nav are cleared
                                $j("#jive-nav-link-communications .j-js-update-indicator").hide().data('count', 0).html("0");
                                $j("#jive-nav-link-actions .j-js-update-indicator").hide().data('count', 0).html("0");
                            }
                        });
                    }
                });
            }
            else {
                $badgeMenu.trigger('close');
            }
            e.preventDefault();
        });

        // polling listeners
        jive.ActivityStream.activityNotifier.addListener('activityStream.poll', function(data) {
            self.updateCount(data);
        });

        jive.switchboard.addListener('inbox.read', function() {
            self.decrementNewCount('inbox', 1);
        }).addListener('inbox.unread', function() {
            self.decrementNewCount('inbox', -1);
        }).addListener('inbox.markAllRead', function() {
            self.decrementNewCount('inbox', 10000);
        }).addListener('actions.actionTaken', function() {
            self.decrementNewCount('actions', 1);
        }).addListener('tasks.taskComplete', function() {
            self.decrementNewCount('tasks', 1);
        }).addListener('tasks.taskIncomplete', function() {
            self.decrementNewCount('tasks', -1);
        });
    };

    this.updateCount = function(data) {
        var self = this;
        self.counts['inbox'] = data.fullCounts.communications.unreadCount;
        self.counts['actions'] = data.fullCounts.actions;
        self.counts['tasks'] = data.fullCounts.overdueTasks;
        self.renderCounts();
    };

    this.decrementNewCount = function(type, count) {
        var self = this;
        if (self.counts[type] <= 50 || count > 1000) {
            self.counts[type] = self.counts[type]-count;
            if (self.counts[type] < 0) {
                self.counts[type] = 0;
            }
            self.renderCounts();
        }
    };

    this.renderCounts = function() {
        var self = this,
            fullCount = self.counts['inbox'] + self.counts['actions'] + self.counts['tasks'],
            $newCount = $j(jive.welcome.updateIndicator({
                            type: 'count',
                            count: fullCount,
                            extraCssClasses: 'j-navbadge-count j-ui-elem'}));
        // update Global Home Nav Count
        var $count = self.$button.find('.j-js-update-indicator');
        if ($count.length) {
            $count.replaceWith($newCount);
        }
        else {
            self.$button.append($newCount);
        }

        if(self.$button.hasClass('active')) {
            self.updateTitleCount(fullCount);
        }
    };

    this.updateTitleCount = function(count) {
        var title = document.title,
            indexOfEndParen = title.indexOf(")");
        if (indexOfEndParen != -1) {
            title = title.substring(title.indexOf(")")+2);
        }

        var countText = '';
        if (count > 0) {
            countText = jive.home.countForTitle({ count: count });
        }
        document.title = countText  + ' ' + title;
    };
});