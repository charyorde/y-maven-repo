/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/**
 * @depends path=/resources/scripts/apps/userpicker/models/userpicker_source.js
 * @depends path=/resources/scripts/apps/userpicker/views/userpicker_view.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 */
jive.namespace('UserPicker');


jive.UserPicker.Main = jive.oo.Class.extend(function(protect) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    /**
     * initialize the user picker
     * @param options
     */
    this.init = function(options){
        var that = this;

        /**
         * initialize the options to the input
         */
        var defaults = {
            // a JSON array of user data to initialize the input
            startingUsers: { users : [], userlists : [] },
            // if we should accept > 1 user in the input
            multiple: false,
            // if we should allow email addresses as well as user's as input
            emailAllowed: false,
            // if we should allow selecting Jive users or not
            userAllowed: true,
            // if we should allow lists
            listAllowed : false,
            // if the "select person" link should be displayed
            browseAllowed : true,
            // if the result list should be displayed
            resultListAllowed : true,
            // if the picker should be disabled or not
            disabled : false,
            // if we should put the username in the value of the field instead of userID
            valueIsUsername :false,
            // Allows user-browse modal to be displayed in top-level window.
            // should probably change this to window
            document: $j(document),
            // if partner users can be invited
            canInvitePartners : false,
            // if ONLY partner users can be invited
            canInviteJustPartners : false,

            canInvitePreprovisioned : false,

            invitePreprovisionedDomainRestricted : false,

            object : null,

            entitlement : "VIEW",

            name : '',

            // a jquery selected object to use as the input
            $input : null,
            //
            // hopefully i can not have htis option. look into why
            // it's used for threads
            existingModal: {
                modalContainer: '',
                prevContainer: '',
                browseContainer: ''
            },

            //the IDs any filters that should be applied at the service level
            filterIDs : [],

            // the maximum number of results allowed to be selected before displaying a warning message
            // and blocking the addition of more results -- default is 100
            maxSelectedCount: 100

        };
        that.options = $j.extend(defaults, options);

        /**
         * initialize default UI + default mdoel
         */
        if(!that.options.view){
            that.options.view = new jive.UserPicker.View(that.options.$input, that.options);
        }
        if(!that.options.model){
            that.options.model = new jive.UserPicker.Source($j.extend(that.options, {resultLimit: that.options.maxSelectedCount}));
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
        this.options.view.addListener('batchRequest', function (query, promise) {
            that.options.model.autocomplete(query).addCallback(
                function (data) {
                    if(typeof(data) == "object"){
                        promise.emitSuccess(data);
                    } else {
                        promise.emitSuccess({});
                    }
                }).addErrback(function (e) {
                    promise.emitError(e);
                });
        });
        this.options.view.addListener('loadUser', function(userID, promise) {
            that.options.model.load(userID).addCallback(
                function(data) {
                    promise.emitSuccess(data);
                }).addErrback(function(e) {
                    promise.emitError(e);
                });
        });
        // Set up handlers after StatusInput instance is fully initialized.
        this.options.view.addListener('selectedUsersChanged', function(usersAndLists) {
            that.emit("selectedUsersChanged", usersAndLists);
        });
    };


    this.setDisabled = function(b){
        this.options.view.setDisabled(b);
    };

    this.setCanInvitePartners = function(b){
        this.options.view.setCanInvitePartners(b);
    };

    this.setUsers = function(users){
        this.options.view.setSelectedUsers(users);
    };

    this.setLists = function(lists){
        this.options.view.setSelectedLists(lists);
    };

    this.hide = function(){
        this.options.view.hide();
    };

    this.show = function(){
        this.options.view.show();
    };

    this.val = function(){
        return this.options.view.val();
    };

    this.getSelectedUsersAndLists = function(includeListUsers) {
        var selected = this.options.view.getSelectedUsersAndLists(includeListUsers);
        selected.changes = {};
        return selected;
    };

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
    };

    this.reset = function(){
        this.options.view.setSelectedUsers(this.options.startingUsers.users);
        this.options.view.setSelectedLists(this.options.startingUsers.userlists);
    };
    
});
