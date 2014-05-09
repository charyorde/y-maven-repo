/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('admin.apps.services');  // Creates the jive.admin.apps.services namespace if it does not already exist.

/**
 * Handles display of the services list.
 *
 * @depends template=jive.admin.apps.services.list scope=client
 *
 * @class
 * @extends jive.admin.apps.services.AbstractView
 */
jive.admin.apps.services.ListView = jive.admin.apps.services.AbstractView.extend(function(protect) {

    this.init = function() {
        this.content = $j(jive.admin.apps.services.list({}));
    };

    this.getContent = function() {
        return this.content;
    };

    /**
     * Append content (which must be a <tr> element with nested columns describing an individual service)
     * to the table body of our view.
     *
     * @methodOf jive.admin.apps.services.ListView
     * @param {jQuery|DOMElement|String} item content to append (must be a table row)
     */
    this.append = function(item) {
        this.getContent().find('#services-table-body').append(item);
    };

    this.erase = function() {
        $j(this.getContent().find('#services-table-body')).html("");
    };

    this.hide = function() {
        $j('#services-list-div').fadeOut();
    };

    this.render = function() {
        var listView = this;
        $j("#render-list-div").html(listView.getContent());
    };

    this.show = function() {
        $j('#services-list-div').fadeIn();
    };

});
