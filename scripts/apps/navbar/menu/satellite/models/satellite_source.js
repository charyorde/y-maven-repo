/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Navbar.Menu.Satellite');
/**
 * Interface to satellite menu REST service.
 *
 * @extends jive.RestService
 */
jive.Navbar.Menu.Satellite.Source = jive.RestService.extend(function(protect) {
    protect.resourceType = protect.pluralizedResourceType = "satellitemenu";
});

