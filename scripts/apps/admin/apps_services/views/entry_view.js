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
 * Handles edit of the details of an individual service.
 *
 * @depends template=jive.admin.apps.services.entry scope=client
 *
 * @class
 * @extends jive.admin.apps.services.AbstractView
 */
jive.admin.apps.services.EntryView = jive.admin.apps.services.AbstractView.extend(function(protect) {

    protect.REQUIRED_FIELDS_ALL = [
        "service-field-name",
        "service-field-tags",
        "service-field-uri"
    ];

    protect.REQUIRED_FIELDS_OAUTH2 = [
        "service-field-oauth2-client-id",
        "service-field-oauth2-client-secret",
        "service-field-oauth2-authentication-url",
        "service-field-oauth2-access-token-url"
    ];

    protect.errors = -1;

    this.init = function(service, authStyles, groups, owners, users) {

        // Save a self reference
        var entryView = this;

        // Define the DOM content of this view
        this.content = $j(jive.admin.apps.services.entry({ service : service, authStyles : authStyles }));
        if (service.authStyle == "oauth2") {
            this.content.find(".oauth2-only").show();
        }

        // Handle changes on the "authStyle" dropdown
        this.content.find("#service-field-authentication").change(function() {
            if (service.id > 0) {
                entryView.content.find("#service-field-help-warn").fadeIn('slow', function() {});
            }
            if (entryView.content.find("#service-field-authentication").val() == "oauth2") {
                entryView.content.find(".oauth2-only").slideDown('slow');
                entryView.content.find("#service-field-oauth2-client-id").focus();
            }
            else {
                entryView.content.find(".oauth2-only").slideUp('fast');
            }
            return false;
        });

        // Handle clicks on the "cancel" button
        this.content.find("#cancel-service-button").click(function(event) {
            var data = { service : service };
//            alert("cancel-service handler, data=" + JSON.stringify(data));
            entryView.emit('cancel-service', data);
            return false;
        });

        // Handle clicks on the "save" button
        this.content.find("#save-service-button").click(function(event) {
            var data = { service : service };
//            alert("save-service handler, data=" + JSON.stringify(data));
            entryView.emit('save-service', data);
            return false;
        });

        // Handle clicks on the "test" button
        this.content.find("#test-service-button").click(function(event) {
            var data = { service : service };
//            alert("test-service handler, data=" + JSON.stringify(data));
            entryView.content.find("#test-service-working").show();
            entryView.content.find("#test-service-success").hide();
            entryView.content.find("#test-service-failure").hide();
            entryView.content.find("#test-service-message").text("").hide();
            entryView.emit('test-service', data);
            return false;
        });

        // Create an autocomplete widget for the groups list
        var groupsFilter = this.content.find("#groups-filter");
        var startingGroups = { groups : groups, groupLists : [] };
        var groupsParams = {
            multiple : true,
            startingGroups : startingGroups,
            $input : groupsFilter
        };
        var groupsFilterAutocomplete = new jive.UserGroupPicker.Main(groupsParams);

        // Create an autocomplete widget for the users list
        var usersFilter = this.content.find("#users-filter");
        var startingUsers = { users : users, userlists : [] };
        var usersParams = {
            multiple : true,
            startingUsers : startingUsers,
            $input : usersFilter,
            name : 'users'
        };
        var usersFilterAutocomplete = new jive.UserPicker.Main(usersParams);

        // Create an autocomplete widget for the owners list
        var ownersFilter = this.content.find("#owners-filter");
        var startingOwners = { users : owners, userlists : [] };
        var ownersParams = {
            multiple : true,
            startingUsers : startingOwners,
            $input : ownersFilter,
            name : 'owners'
        };
        var ownersFilterAutocomplete = new jive.UserPicker.Main(ownersParams);

    };

    this.erase = function() {
        $j('#services-entry-div').html("");
    };

    this.getContent = function() {
        return this.content;
    };

    this.getServiceID = function() {
        var serviceID = $j("#serviceID").val();
        return serviceID; 
    };

    this.hide = function() {
        $j('#services-entry-div').fadeOut();
    };

    // Populate the properties of the specified service from the current values of our input fields.
    this.populate = function(service) {
        service.authStyle = $j("#service-field-authentication").val();
        service.description = $j("#service-field-description").val();
        service.displayName = $j("#service-field-name").val();
        // "enabled" is not present in this form
        service.groups = [ ];
        var groupsList = $j("#groups-select div ul");
        if (groupsList) {
            $j(groupsList).find("li").each(function(index, item) {
                service.groups.push($j(item).attr("data-group-id"));
            });
        }
        // headers are maintained automatically by the add/edit/remove headers logic
        service.iconURL = $j("#service-field-iconURL").val();
        // "id" should not be modified
        service.lenient = $j("#lenient").is(":checked");
        service.name = $j("#service-field-name").val();
        service.owners = [ ];
        var ownersList = $j("#owners-select div ul");
        if (ownersList) {
            $j(ownersList).find("li").each(function(index, item) {
                service.owners.push($j(item).attr("data-user-id"));
            });
        }
        service.properties.oauth2AccessTokenURL = $j("#service-field-oauth2-access-token-url").val();
        service.properties.oauth2AuthenticationURL = $j("#service-field-oauth2-authentication-url").val();
        service.properties.oauth2ClientID =  $j("#service-field-oauth2-client-id").val();
        service.properties.oauth2ClientSecret = $j("#service-field-oauth2-client-secret").val();
        service.properties.oauth2RedirectURL = $j("#service-field-oauth2-redirect-url").val();
        service.properties.oauth2Scope = $j("#service-field-oauth2-scope").val();
        service.serviceURL = $j("#service-field-uri").val();
        service.tags = $j("#service-field-tags").val().split(" ");
        service.users = [ ];
        var usersList = $j("#users-select div ul");
        if (usersList) {
            $j(usersList).find("li").each(function(index, item) {
                service.users.push($j(item).attr("data-user-id"));
            });
        }
        service.wsdlURL = $j("#service-field-wsdlURL").val();
    };

    this.render = function() {
        var entryView = this;
        $j("#services-entry-div").html("").html(entryView.getContent());
    };

    this.show = function() {
        $j(".jive-error-text").html("").hide();
        $j('#services-entry-div').fadeIn();
        $j("#service-field-name").focus();
    };

    this.testResults = function(message) {
        var entryView = this;
        entryView.content.find("#test-service-working").hide();
        if (message) {
            entryView.content.find("#test-service-failure").show();
            entryView.content.find("#test-service-message").text(message).show();
        }
        else {
            entryView.content.find("#test-service-success").show();
        }
    };

    // Return true if validation is successful
    this.validate = function() {
        var entryView = this;
        entryView.errors = 0;
        $j(".jive-error-text").html("").hide();
        entryView.validateRequired(entryView.REQUIRED_FIELDS_ALL);
        if ($j("#services.field-authentication").val() == "oauth2") {
            entryView.validateRequired(entryView.REQUIRED_FIELDS_OAUTH2);
        }
        if (entryView.errors > 0) {
            entryView.validateError("service-field-summary", "Please correct the errors shown above and try saving again");
        }
        return (entryView.errors == 0);
    };

    this.validateError = function(field, message) {
        var entryView = this;
        $j("#" + field + "-error").html("<p>" + message + "</p>").show();
        entryView.errors++;
    };

    this.validateRequired = function(fields) {
        var entryView = this;
        $j(fields).each(function(index, field) {
            var val = $j("#" + field).val();
            if (!val || (val == "")) {
                entryView.validateError(field, "This field is required");
            }
        });
    };

});
