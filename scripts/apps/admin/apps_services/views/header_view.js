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
 * Handles display of an individual header.
 *
 * @depends template=jive.admin.apps.services.header scope=client
 *
 * @class
 * @extends jive.admin.apps.services.AbstractView
 */
jive.admin.apps.services.HeaderView = jive.admin.apps.services.AbstractView.extend(function(protect) {

    this.init = function(index, service, editing) {

        // Save a self reference
        var headerView = this;

        // Define the DOM content of this view
        this.content = editing
                ? $j(jive.admin.apps.services.headerEdit({ index : index, service : service }))
                : $j(jive.admin.apps.services.header({ index : index, service : service }));

        // Define event handlers depending upon our mode

        if (editing) {

            // Handle clicks on the "edit header cancel" button
            this.content.find("#settings-edit-header-cancel").click(function() {
                var data = { index : index, service : service };
//                alert("edit-header-cancel handler, data=" + JSON.stringify(data));
                headerView.emit('edit-header-cancel', data);
                return false;
            });

            // Handle clicks on the "edit header save" button
            this.content.find("#settings-edit-header-save").click(function() {
                var data = { index : index, service : service };
//                alert("edit-header-save handler, data=" + JSON.stringify(data));
                headerView.emit('edit-header-save', data);
                return false;
            });

            // Handle changes on the edit header name or edit header value
            this.content.find(".settings-edit-header-field").change(function() {
//                alert("edit-header-field handler");
                if (($j("#settings-edit-header-name").val().length > 0) &&
                    ($j("#settings-edit-header-value").val().length > 0)) {
                    $j("#settings-edit-header-save").prop('disabled', false).focus();
                }
                else {
                    $j("#settings-add-header-save").prop('disabled', true);
                }
            });

        }
        else {

            // Handle clicks on the "edit" link
            this.content.find("#settings-edit-header-" + index).click(function(event) {
                var data = { index : index, service : service };
//                alert("edit-header handler, data=" + JSON.stringify(data));
                headerView.emit('edit-header', data);
                return false;
            });

            // Handle clicks on the "remove" link
            this.content.find("#settings-remove-header-" + index).click(function(event) {
                var data = { index : index, service : service };
//                alert("remove-header handler, data=" + JSON.stringify(data));
                headerView.emit('remove-header', data);
                return false;
            });

        }

     };

    this.getContent = function() {
        return this.content;
    };

    this.getEditName = function() {
        return this.content.find("#settings-edit-header-name").val();
    };

    this.getEditValue = function() {
        return this.content.find("#settings-edit-header-value").val();  
    };

});
