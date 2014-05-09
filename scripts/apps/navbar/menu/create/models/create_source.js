/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('Navbar.Menu.Create');
/**
 * Interface to create menu REST service.
 *
 * @extends jive.RestService
 */
jive.Navbar.Menu.CreateSource = jive.RestService.extend(function(protect) {
    protect.resourceType = protect.pluralizedResourceType = "createmenu";
});

