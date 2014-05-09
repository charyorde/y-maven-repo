/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('UserGroupPicker');

jive.UserGroupPicker.Main = jive.oo.Class.extend(function(protect) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    /**
     * initialize the user group picker
     * @param options
     */
    this.init = function(options){
        var that = this;

        /**
         * initialize the options to the input
         */
        var defaults = {
            // a JSON array of user data to initialize the input
            startingGroups: { groups : [], groupLists : [] },
            // if we should accept > 1 user in the input
            multiple: false,
            // if we should allow selecting Jive user groups or not
            groupAllowed: true,
            // if we should allow lists
            listAllowed : false,
            // if the picker should be disabled or not
            disabled : false,
            // if we should put the username in the value of the field instead of userID
            valueIsUserGroupName :false,
            // Allows user-browse modal to be displayed in top-level window.
            // should probably change this to window
            document: $j(document),

            object : null,

            entitlement : "VIEW",

            // a jquery selected object to use as the input
            $input : null,
            //
            // hopefully i can not have htis option. look into why
            // it's used for threads
            existingModal: {
                modalContainer: '',
                prevContainer: '',
                browseContainer: ''
            }

        };
        that.options = $j.extend(defaults, options);

        /**
         * initialize default UI + default mdoel
         */
        if(!that.options.view){
            that.options.view = new jive.UserGroupPicker.View(that.options.$input, that.options);
        }
        if(!that.options.model){
            that.options.model = new jive.UserGroupPicker.Source(that.options);
        }

        /**
         * tie up the listeners for the model / UI
         */

        // Set up handlers after StatusInput instance is fully initialized.
        this.options.view.addListener('autocompleteRequest', function(query) {
            that.options.model.autocomplete(query).addCallback(function(results){
                if(typeof(results) == "object"){
                    that.options.view.autocompleteResponse(results);
                }
            });
        });
        // Set up handlers after StatusInput instance is fully initialized.
        this.options.view.addListener('selectedUserGroupsChanged', function(groupsAndLists) {
            that.emit("selectedUserGroupsChanged", groupsAndLists);
        });
    }


    this.setDisabled = function(b){
        this.options.view.setDisabled(b);
    }

    this.setUserGroups = function(groups){
        this.options.view.setSelectedGroups(groups);
    }

    this.setLists = function(groupLists){
        this.options.view.setSelectedLists(groupLists);
    }

    this.hide = function(){
        this.options.view.hide();
    }

    this.show = function(){
        this.options.view.show();
    }

    this.val = function(){
        return this.options.view.val();
    }

    /**
     * determines if the UI should only display a list of users w/ the option
     * to turn each user "on/off", or if the UI should also let the user
     * pick new users to add to the list.
     *
     * this is used in document collaboration in particular
     * @param b if the user picker input/link should be not shown and the users list toggleable
     */
    this.setNoPicker = function(b){
        this.options.view.setNoPicker(b);
    }

    this.reset = function(){
        this.options.view.setSelectedGroups(this.options.startingGroups.groups);
        this.options.view.setSelectedLists(this.options.startingGroups.groupLists);
    }
    
});