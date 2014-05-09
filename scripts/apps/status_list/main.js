jive.app('StatusList');

jive.StatusList.Main = function(options) {
    var activityView = new jive.StatusList.ActivityView(options.activityContainer, options),
        activityPager,
        activityState         = Object.create(options.initialState),  // stores a copy of initialState
        filterTabRssMap       = options.filterTabRssMap,
        wallEntryTypeID       = options.wallEntryTypeID,
        listActionUrl         = options.listActionUrl,
        listCommentsActionUrl = options.listCommentsActionUrl,
        canComment            = options.canComment,
        canCreateImage        = options.canCreateImage,
        i18n                  = options.i18n,
        newEntryPollPeriod    = options.newEntryPollPeriod,
        newWallIntervalId     = 0,
        zeroItem              = '',
        widgetID              = $j(options.activityContainer).parent().parent().attr("id").split("_")[1];;

    /**
     * Registers the active tab with the server so that the next time the
     * widget loads it opens to the same tab.
     *
     */
    function storeTabPreference(tabName) {
        $j.post(jive.rest.url("/wall/tab"),  {'tab':tabName, 'widgetID': widgetID});
    }

    /**
     * Registers the active filter with the server so that the next time the
     * widget loads it filter by the same criteria.
     */
    function storeFilterPreference(filterName) {
        $j.post(jive.rest.url("/wall/filter"), {'type':filterName, 'widgetID': widgetID});
    }

    function updateRssSource(filter, tabName) {
        var rssUrl = filterTabRssMap[filter][tabName];
        activityView.rssSource(rssUrl);
    }

    /**
     * Returns an instance of jive.WidgetPager initialized with the given
     * state.  The WidgetPager instance is responsible for loading more
     * statuses when 'more' is clicked.
     */
    function pager(state) {
        var superState = $j.extend(state, {zeroItem : zeroItem});
        return new jive.WidgetPager(
            options.activityContainer,
            // Capture the current state to send to the pager
            $j.extend({}, options, { initialState:  superState})
        );
    }

    function loadStatusList() {
        activityView.loading();  // displays loading indicator

        $j.ajax({
            url: listActionUrl,
            type: 'GET',
            dataType: 'html',
            data: $j.extend({'zeroItem' : zeroItem},activityState),
            success: function(responseText) {
                // Load response text into the status list.  Hides loading
                // indicator.
                activityView.html(responseText);



                updateRssSource(activityState.activityFilterValue,
                                activityState.wallView);

                jive.Wall.Main.bindComments(wallEntryTypeID, {
                    canComment: canComment,
                    canCreateImage: canCreateImage,
                    i18n: i18n
                });

                // Setup repost functionality
                jive.Wall.RepostHelper.bindRepostAnchors({
                    canComment: canComment,
                    canCreateImage: canCreateImage,
                    i18n: i18n
                });

                zeroItem = $j(responseText).find('[name=zeroItem]').val();

                activityPager = pager(activityState);
                
                // Setup polling for new entries since load
                if (newWallIntervalId != 0) {
                    clearInterval(newWallIntervalId);
                }
                newWallIntervalId = setInterval(getNewWallEntryCount, newEntryPollPeriod);
            }
        });
    }

    jive.Wall.Main.bindRowHover();

    activityView.addListener('filter', function(value) {
        activityState.activityFilterValue = value;
        loadStatusList();
        storeFilterPreference(activityState.activityFilterValue);
    }).addListener('tabSwitch', function(tabName) {
        activityState.wallView = tabName;  // store new active tab value
        loadStatusList();
        storeTabPreference(activityState.wallView);
    });

    jive.Wall.Main.bindRepostAndComments(wallEntryTypeID, listCommentsActionUrl);
    

    // Switch to the default tab on when initialized.
    activityView.switchTo(activityState.wallView);

    function getNewWallEntryCount() {
        $j.ajax({
            url:      jive.rest.url("/wall/new/count"),
            type:     'POST',
            dataType: 'json',
            data: "{\"count\": {\"tabName\": \""+activityState.wallView+"\",\"filterType\": \""+activityState.activityFilterValue+"\", \"widgetID\": "+widgetID+"} }",
            contentType: 'application/json',
            success: function(data) {
                if (data == null) {
                    return false;
                }
                activityView.updateNewEntryCount(data['count']['newEntryCount'], data['count']['mentionCount']);
            },
            error: function(data) {
                // Did the user log out from a different browser tab?
                if (data.status == 401 || data.status == 403) {
                    // If so, cancel the timer
                    clearInterval(newWallIntervalId);
                }
            }
        });
    }
};
