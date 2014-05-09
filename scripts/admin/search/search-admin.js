/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

function showTasksPane() {
    $j('#jive-tasks').empty();

    // TODO: retrieve the current status
    
}

function showContentPane(contentPaneID) {
    if (contentPaneID == 'tasks') {
        showTasksPane();
    }
    else {
        // The other panes are already loaded so we can just show them
        $j('#' + contentPaneID).show();
    }
}

$j(function() {
    $j('#jive-search-control .jive-body-tabbar a').click(function(eventObj) {
        var tabID = $j(this).parent().attr('id');
        var contentPaneID = tabID.replace('-tab', '');

        // Make sure all other tabs are not selected
        $j('#jive-search-control .jive-body-tabbar span').each(function(idx) {
            if ($j(this).attr('id') != tabID) {
                $j(this).removeClass('jive-body-tabcurrent active');
            }
        });

        // Set this tab as selected
        $j('#' + tabID).addClass('jive-body-tabcurrent active');

        // Hide all other content panes
        $j('#jive-tab-content div').each(function(idx) {
           if ($j(this).attr('id') != contentPaneID) {
               $j(this).hide();
           }
        });

        showContentPane(contentPaneID);

        eventObj.preventDefault();
    });
});
