/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
$j(document).ready(function() {

    $j('#j-place-parents-link').click(function(e) {
        $j("#j-place-parents-container").popover({
            context: $j("#j-place-parents-link"),
            darkPopover: true,
            destroyOnClose: false
        });
        e.preventDefault();
    });

});