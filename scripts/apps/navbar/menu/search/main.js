/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Navbar.Menu.Search');  // Creates the jive.Navbar.Menu.Search namespace if it does not already exist.

/**
 * Abstract controller class for a search box and spotlight search (if enabled)
 * 
 * @depends path=/resources/scripts/apps/navbar/menu/search/view/searchbox_view.js
 * @depends path=/resources/scripts/jivespotlightsearch.js
 */
define('jive.Navbar.Menu.Search.Main', ['JiveSpotlightSearch', 'jive.Navbar.Search.SearchBox'], function(JiveSpotlightSearch, SearchBox) {
    return jive.oo.Class.extend(function(protect) {

        this.init = function(spotlightContainer, spotlightSearchURL, containerType, containerID) {
            this.searchBox = new SearchBox(spotlightContainer);
            this.searchObj = new JiveSpotlightSearch(spotlightContainer, spotlightSearchURL, containerType, containerID);
        };

        this.getSpotlightSearch = function() {
            return this.searchObj;
        };
    });
});
