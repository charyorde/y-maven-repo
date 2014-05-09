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
 * Handles display of top level actions
 *
 * @depends template=jive.admin.apps.services.actions scope=client
 *
 * @class
 * @extends jive.admin.apps.services.AbstractView
 */
jive.admin.apps.services.ActionsView = jive.admin.apps.services.AbstractView.extend(function(protect) {

    this.init = function() {

        // Save a self reference
        var actionsView = this;

        // Define the DOM content of this view
        this.content = $j(jive.admin.apps.services.actions({}));

     };

    this.getContent = function() {
        return this.content;
    };

    this.render = function() {

        // Render our view within the appropriate element
        var actionsView = this;
        $j("#render-actions-div").html(actionsView.getContent());

        // Define relevant event handlers (don't know why we can't do this in init like all the other views)

        // Handle clicks on the "add service" link
        $j("#add-service").click(function(event) {
            var data = {  };
//            alert("add-service handler, data=" + JSON.stringify(data));
            actionsView.emit('add-service', data);
            return false;
        });

        // Handle clicks on the "filter services" link
        $j("#filter-services").click(function(event) {
            var data = {  };
//            alert("filter-services handler, data=" + JSON.stringify(data));
            actionsView.emit('filter-services', data);
            return false;
        });

    };

    this.setFilterTooltip = function(showing) {
        var title = showing
            ? "Click to clear all filters and close the filter dialog"
            : "Filter the list of services to those available to a specific user, and/or those that contain any of a specified set of tags";
        $j("#filter-services").attr("title", title);

    }

});
