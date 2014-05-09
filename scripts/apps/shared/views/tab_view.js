/**
 * jive.TabView
 *
 * Provides logic for switching between tabs.  The class constructor takes two
 * arguments.
 * - tabBar (Element): a DOM element or a selector that contains all of the
 *   tabs that this app should switch between.
 * - options (Object): options for customizing tab behavior:
 *   - activeClass (String): HTML class to assign to the active tab
 *   - tabSelector (String): jQuery selector to find tabs relative to `tabBar`
 *   - nameFromTab (jQuery => String): Function that returns the name of a tab
 *     given that tab as a jQuery instance.
 *
 * You can get multiple tabbed interfaces on a page by creating an instance of
 * jive.TabView with different `tabBar` arguments for each.
 *
 * Events:
 * - tabSwitch (tabName, $tab): fires when a tab is clicked
 */

/*jslint browser:true */
/*extern jive $j */

jive.TabView = function(tabBar, options) {
    // Mixes in `addListener` and `emit` methods so that other classes can
    // listen to events from this one.
    jive.conc.observable(this);
    options = options || {};
    var activeClass = options.activeClass || 'jive-body-tabcurrent',
        tabSelector = options.tabSelector || '.jive-body-tab',
        nameFromTab = options.nameFromTab || function(tab) {
            return tab.attr('id').replace(/-tab$/, '');
        },
        that = this;

    /**
     * Returns a jQuery instance representing the tabs managed by this
     * instance.
     */
    function tabs() {
        return $j(tabBar).find(tabSelector);
    }

    /**
     * Returns a jQuery instance representing the currently active tab.
     */
    function activeTab() {
        return tabs().filter(function() {
            return $j(this).hasClass(activeClass);
        });
    }

    /**
     * Returns the name of the currently active tab.
     */
    function activeTabName() {
        return nameFromTab(tabs().filter(function() {
            return $j(this).hasClass(activeClass);
        }));
    }

    /**
     * Activates the given tab and deactivates other tabs.
     */
    function toggleTab(tabName) {
        tabs().each(function() {
            var tab = $j(this),
                name = nameFromTab(tab);
            tab.toggleClass(activeClass, name == tabName);
        });

        // Default panel toggling behavior - define your own behavior by
        // registering a 'tabSwitch' listener.
        tabs().each(function() {
            var tab = $j(this),
                name = nameFromTab(tab),
                panel = $j('[id="'+ name +'"]');
            if (name == tabName) {
                panel.show();
            } else {
                panel.hide();
            }
        });
    }

    /**
     * Emits a 'tabSwitch' event with the given tab name as the first event
     * parameter.  Subsequent event parameters may be included based on the
     * options given to the constructor.
     */
    function emitSwitch(tabName) {
        that.emit('tabSwitch', tabName, activeTab());
    }

    /**
     * switchTo(tabName)
     *
     * Switches to the named tab and fires a 'tabSwitch' event.  `tabName`
     * should match the id of the corresponding tab, but without the '-tab'
     * suffix.
     */
    function switchTo(tabName) {
        toggleTab(tabName);
        emitSwitch(tabName);
    }

    /**
     * setVisibility
     *
     * hides or shows a tab and it's panel, can be used to dynamically display to a user a tab
     * Note: assumes the tab is not selected by default
     *
     * @param tabName - string, name of the tab
     * @param visible - boolean, true makes tab visible, false hides tab
     */
    function setVisibility(tabName, visible){
        var activeTab = tabs().filter(function() {
            return nameFromTab($j(this)) == tabName;
        });
        activeTab.toggle(!!visible);
    }

    /* ** public interface ** */
    this.switchTo = switchTo;
    this.setVisibility = setVisibility;
    this.activeTabName = activeTabName;
    this.activeTab = activeTab;

    /* ** initialization ** */
    $j(document).ready(function() {
        // Switch tabs when a tab is clicked.
        $j(tabBar).delegate(tabSelector, 'click', function(event) {
            var tab = $j(this),
                name = nameFromTab(tab);

            switchTo(name);
            event.preventDefault();
        });

        // Make sure that at least one tab is active on initialization.
        // Activate the first tab if no tab is active.
        if (!tabs().hasClass(activeClass)) {
            tabs().first().trigger('click');
        }
    });
};
