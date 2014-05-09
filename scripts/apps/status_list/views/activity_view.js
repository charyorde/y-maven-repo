/*extern jive $j */

jive.app('StatusList');

jive.StatusList.ActivityView = function(container, options) {
    jive.conc.observable(this);

    var $container = $j(container),
        $list      = $container.find('.status-list'),
        i18n       = options.i18n,
        $overlay   = $j('<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5; background: white; opacity: .7; display: none;" class="loading-overlay" />'),
        $loader    = $j('<div class="j-loader-box"><strong class="font-color-meta">' + i18n.loadingText + '</strong></div>'),

        /* Enum-like structure that represents available tabs */
        TABS = {
            everyone:   'everyone',
            friends:    'friends',
            colleagues: 'colleagues',
            mentions:   'mentions'
        },

        tabView = new jive.TabView($container.find('.jive-widget-tabs'), {
            tabSelector: 'ul li',
            activeClass: 'active',
            nameFromTab: function(tab) {
                var tabClassname = tab.attr('class');
                if(!tabClassname){
                    return '';
                } else {
                    return tabClassname.split(/\s+/).filter(function(t) {
                        return typeof TABS[t] != 'undefined';
                    }).first();
                }
            }
        }),

        that = this;

    /**
     * Displays loading indicator.
     */
    function loading() {
        $list.append($overlay).append($loader);
        $overlay.show();
    }

    /**
     * Sets html content for the status-list.  Also hides the loading indicator if necessary.
     */
    function html(content) {
        $list.html(content);
        $overlay.fadeOut('fast');
    }

    /**
     * Sets the URL of the RSS feed link.
     */
    function rssSource(url) {
        $container.find('.statusrss').attr('href', url);
    }

    /**
     * Switches to the given tab.
     */
    function switchTo(tabName) {
        tabView.switchTo(tabName);
    }

    /**
     * Toggles the show/hide statuses combobox.  If a boolean value is given
     * for `sw` the filter will be shown or hidden depending on the value
     * of `sw`.
     */
    function toggleFilter(sw) {
        var elem = $container.find('label');
        if (typeof sw == 'undefined') {
            elem.toggle();
        } else if (sw) {
            elem.show();
        } else {
            elem.hide();
        }
    }

    /**
     * Updates previously rendered 'new entry count', or injects a row into the activity table DOM indicating
     * how many entries have been added since the current view has been loaded. This count takes in to account
     * the current tab being viewed, and the filter that is set.
     *
     * @param count how many new wall entries have been added to the system since the view was last loaded
     */
    function updateNewEntryCount(count, mentionCount) {
        var $mentionsLink = $j(tabView.activeTab()).parent().find('.mentions').find('a');
        var currentText= $mentionsLink.text();
        if (mentionCount > 0 && tabView.activeTabName() != TABS.mentions) {

            if (!$mentionsLink.hasClass('font-color-notify')) {
                $mentionsLink.addClass('font-color-notify');
                var countNumStr = mentionCount < 26 ? mentionCount : '25+';
                $mentionsLink.text(currentText + " (" + countNumStr + ")");
            } else {
                $mentionsLink.text(currentText.substring(0,currentText.indexOf('(') -1)+" ("+mentionCount+")");
            }
        } else if (mentionCount == 0 && tabView.activeTabName() != TABS.mentions) {
            if ($mentionsLink.hasClass('font-color-notify')) {
                $mentionsLink.removeClass('font-color-notify');
                $mentionsLink.text(currentText.substring(0,currentText.indexOf('(') -1));
            }
        }

        if (count <= 0) {
            return;
        }

        var $tbody = $container.find('.jive-table-activity').filter(':first').find('tbody:first');
        if ($tbody.length > 0) {
            var $row = $tbody.find('tr.j-new-wall-entry-count-row');

            /* check if old count exists, if so update count */
            if ($row.length > 0) {
                $row.find('a').replaceWith($j('<a href="#" class="j-new-wall-entry-count-anchor font-color-notify">' + count + ' ' + i18n.newText + ' ' + (count > 1 ? i18n.updatesText : i18n.updateText) + '</a>'));
            } else {
                // Inject the 'New Entry Count' row into the table body
                $tbody.prepend('<tr class="j-new-wall-entry-count-row "><td colspan="3"><div class="j-new-wall-entry-count" style="display:none;"><a href="#" class="j-new-wall-entry-count-anchor font-color-notify">'
                        + count + ' ' + i18n.newText + ' ' + (count > 1 ? i18n.updatesText : i18n.updateText) + '</a></div></td></tr>');
                $tbody.find('.j-new-wall-entry-count').slideDown();
            }



            $tbody.find('a.j-new-wall-entry-count-anchor').click(function() {
                // Simulate a tab switch to reload the list
                switchTo(tabView.activeTabName());
                return false;
            });
        }
    }


    /* initialization */

    // Emit a 'filter' event whenever the filter selector value changes.
    $container.find('.j-update-filter').change(function() {
        var $selected = $j(this).find(':selected');
        that.emit('filter', $selected.val());
    });

    // Listen for tab changes and perform custom behavior based on which tab
    // was just activated.
    tabView.addListener('tabSwitch', function(tabName, tab) {
        // Hide filter on the mentions tab only.
        toggleFilter(tabName != TABS.mentions);

        if (tabName == TABS.mentions) {
            // Remove notifications on the mentions tab when it is activated.
            var link = tab.find('a'),
                mentionsLabel = link.text().replace(/\s*\(.*\)\s*$/, '');
            link.removeClass('font-color-notify').text(mentionsLabel);
        }

        // Bubble 'tabSwitch' event to the controller.
        that.emit('tabSwitch', tabName);
    });


    /* public interface */
    this.loading    = loading;
    this.html       = html;
    this.rssSource  = rssSource;
    this.switchTo   = switchTo;
    this.updateNewEntryCount = updateNewEntryCount;
};
