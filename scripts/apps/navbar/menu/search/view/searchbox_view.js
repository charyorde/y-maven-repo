/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Navbar.Search');

/**
 * Handles UI for a the search box.
 *
 * @param {string} The selector for the form input field.
 *
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 */
define('jive.Navbar.Search.SearchBox', function() {
    return jive.AbstractView.extend(function(protect) {

        this.init = function(spotlightContainer) {
            var form = spotlightContainer.first('form');
            var field = spotlightContainer.first('.jive-userbar-search-field');
            form.submit(function() {
                var query = field.val();
                var isWildcard = query.charAt(query.length - 1) == '*';
                if (query && !isWildcard) {
                    form.find('input[name=spotlight]').val("true");
                }
            });
            return this;
        };

    });
});