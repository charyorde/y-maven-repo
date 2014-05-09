/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Base class for view classes.
 *
 * @class
 * @extends jive.conc.observable
 */
jive.admin.apps.services.AbstractView = jive.oo.Class.extend(function(protect) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    // Subclasses must implement a getContent() method. Eventually
    // we will get support for proper abstract declarations.
    protect.getContent = "abstract";

    /**
     * Appends content represented by this view to the given parent.
     * The given parent must have an `append()` method that accepts
     * DOM instances.
     *
     * @methodOf jive.admin.apps.services.AbstractView
     * @param {jQuery|jive.admin.apps.services.AbstractView} parent element that content will be appended to
     */
    this.appendTo = function(parent) {
        parent.append(this.getContent());
    };

    /**
     * Accepts content to append to this view's content.
     *
     * @methodOf jive.admin.apps.services.AbstractView
     * @param {jQuery|DOMElement|String} child content to append
     */
    this.append = function(child) {
        this.getContent().append(child);
    };

});
