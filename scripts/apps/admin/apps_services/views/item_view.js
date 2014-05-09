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
 * Handles display of an individual service.
 *
 * @depends template=jive.admin.apps.services.item scope=client
 *
 * @class
 * @extends jive.admin.apps.services.AbstractView
 */
jive.admin.apps.services.ItemView = jive.admin.apps.services.AbstractView.extend(function(protect) {

    this.init = function(index, service) {

        // Save a self reference
        var itemView = this;

        // Define the DOM content of this view
        this.content = $j(jive.admin.apps.services.item({
            index : index,
            service : service
        }));

        // Handle clicks on the "enabled" checkbox
        this.content.find(".service-enabled-checkbox").click(function() {
            var data = { service : service, enabled : $j(this).is(":checked") };
            itemView.emitP('update-enabled', data).addCallback(function() {
                itemView.updateEnabled(data.enabled);
            });
            return false;
        });

        // Handle clicks on the "edit" link
        this.content.find("#manage-edit-service-" + index).click(function(event) {
            var data = { service : service };
//            alert("edit-service handler, data=" + JSON.stringify(data));
            itemView.emit('edit-service', data);
            return false;
        });

        // Handle clicks on the "delete" link
        this.content.find("#manage-delete-service-" + index).click(function(event) {
            var data = { service : service };
//            alert("delete-service handler, data=" + JSON.stringify(data));
            itemView.emit('delete-service', data);
            return false;
        });

     };

    this.getContent = function() {
        return this.content;
    };

    this.updateEnabled = function(enabled) {

        // Save a self reference
//        var itemView = this;

        if (enabled) {
            this.content.find(".service-enabled-checkbox")
                    .prop('checked', true)
                    .addClass("jive-icon-check").removeClass("jive-icon-forbidden");
            this.content.find(".service-enabled-label")
                    .attr("title", "Enabled")
                    .addClass("jive-icon-check").removeClass("jive-icon-forbidden");
        } else {
            this.content.find(".service-enabled-checkbox")
                    .prop('checked', false).attr("title", "Disabled")
                    .removeClass("jive-icon-check").addClass("jive-icon-forbidden");
            this.content.find(".service-enabled-label")
                    .attr("title", "Disabled")
                    .removeClass("jive-icon-check").addClass("jive-icon-forbidden");
        }
    };

});
