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
 * Handles display of the filters criteria for subsetting the services list
 *
 * @depends template=jive.admin.apps.services.filters scope=client
 *
 * @class
 * @extends jive.admin.apps.services.AbstractView
 */
jive.admin.apps.services.FiltersView = jive.admin.apps.services.AbstractView.extend(function(protect) {

    /**
     * Create a new instance of this view.
     *
     * @param selectedTags array of the currently selected tags (if any)
     * @param selectedUser the currently selected Jive user (if any), or null if there is no selected user
     */
    this.init = function(selectedTags, selectedUser) {

        // Save a self reference
        var filtersView = this;

        // Define the DOM content of this view
        this.content = $j(jive.admin.apps.services.filters({ selectedTags : selectedTags }));

        // Define event handlers

        this.content.find("#tag-chooser").click(function() {
            var data = { };
//            alert("tag-chooser handler, data=" + JSON.stringify(data));
            filtersView.emit('tag-chooser', data);
        });

        this.content.find(".tag-filter").click(function() {
            var data = { tag : $j(this).attr("data-tag") };
//            alert("remove-filter handler, data=" + JSON.stringify(data));
            filtersView.emit('remove-filter', data);
        });

        // Create a user picker, and have it fire an event when selected user is changed

        var userFilter = this.content.find("#user-filter");
        var params = {
            multiple : false,
            $input : userFilter
        }
        if (selectedUser) {
            params.startingUsers = { users : [ selectedUser ], userlists : [] };
        }
        var userFilterAutocomplete = new jive.UserPicker.Main(params);

        userFilterAutocomplete.addListener('selectedUsersChanged', function(event) {
//            alert("selectedUsersChanged handler, data=" + JSON.stringify(event));
            var data = { };
            if (event.users.length > 0) {
                data.userID = event.users[0].id;
            }
            else {
                data.userID = -1;
            }
            filtersView.emit('user-chooser', data);
        });


     };

    this.getContent = function() {
        return this.content;
    };

    this.render = function() {
        var filtersView = this;
        $j("#render-filters-div").html("").html(filtersView.getContent());
    };

});
