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
 * Handles display of the headers view for a service entry
 *
 * @depends template=jive.admin.apps.services.header scope=client
 * @depends template=jive.admin.apps.services.headers scope=client
 *
 * @class
 * @extends jive.admin.apps.services.AbstractView
 */
jive.admin.apps.services.HeadersView = jive.admin.apps.services.AbstractView.extend(function(protect) {

    this.init = function(service) {

        // Save a self reference
        var headersView = this;

        // Define the DOM content of this view
        this.content = $j(jive.admin.apps.services.headers({}));

        // Handle clicks on the "add new header" link
        this.content.find("#settings-add-header").click(function() {
            var data = { service : service };
//            alert("add-header handler, data=" + JSON.stringify(data));
            headersView.emit('add-header', data);
            return false;
        });

        // Handle clicks on the "add header add" button
        this.content.find("#settings-add-header-add").click(function() {
            var data = { service : service };
//            alert("add-header-add handler, data=" + JSON.stringify(data));
            headersView.emit('add-header-add', data);
            return false;
        });

        // Handle clicks on the "add header cancel" button
        this.content.find("#settings-add-header-cancel").click(function() {
            var data = { service : service };
//            alert("add-header-cancel handler, data=" + JSON.stringify(data));
            headersView.emit('add-header-cancel', data);
            return false;
        });

        // Handle changes on the add header name or add header value
        this.content.find(".settings-add-header-field").change(function() {
//            alert("add-header-field handler");
            if (($j("#settings-add-header-name").val().length > 0) &&
                ($j("#settings-add-header-value").val().length > 0)) {
                $j("#settings-add-header-add").prop('disabled', false).focus();
            }
            else {
                $j("#settings-add-header-add").prop('disabled', true);
            }
        });

     };

    // Append the table row for a header to our table body element
    this.append = function(item) {
//        this.content.find('#services-headers-body').append(item);
        this.content.find("#settings-add-row").before(item);
    };

    // Erase just the table rows for previously defined headers
    this.erase = function() {
        this.content.find(".settings-header-row").remove();
    };

    this.getContent = function() {
        return this.content;
    };

    // Hide the "add header" row
    this.hideAddHeaderRow = function() {
        this.content.find("#settings-add-row").hide();
    };

    this.render = function() {
        var headersView = this;
        $j("#service-headers-div").html("").html(headersView.getContent());
    };

    // Set focus on the add header control
    this.setAddFocus = function() {
        this.content.find("#settings-add-header").focus();
    };

    // Set focus on the first editing field
    this.setEditFocus = function() {
        this.content.find("#settings-edit-header-name").focus();
    };

    // Show the "add header" row
    this.showAddHeaderRow = function() {
        this.content.find("#settings-add-header-name").val("");
        this.content.find("#settings-add-header-value").val("");
        this.content.find("#settings-add-row").show();
        this.content.find("#settings-add-header-name").focus();
    };

    this.showNoHeadersMessage = function(service) {
        var headersView = this;
        if (service.headers.length > 0) {
            this.content.find(".settings-no-headers-exist").hide();
        }
        else {
           this.content.find(".settings-no-headers-exist").show();
        }
    };

});
