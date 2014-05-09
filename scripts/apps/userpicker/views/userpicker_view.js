/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*globals innerShiv _jive_base_url */
/*jshint curly:false boss:true */

jive.namespace('UserPicker');

/**
 * this class replaces an <input> with a user autocomplete input
 *
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/apps/userpicker/models/result_store.js
 * @depends path=/resources/scripts/apps/userpicker/views/select_people_view.js
 * @depends path=/resources/scripts/apps/userpicker/views/userpicker_message_view.js
 * @depends path=/resources/scripts/apps/userpicker/views/result_list_view.js
 * @depends path=/resources/scripts/jquery/jquery.scrollTo.js
 * @depends path=/resources/scripts/jquery/ui/ui.core.js
 * @depends template=jive.UserPicker.soy.inputPlaceholder
 * @depends template=jive.UserPicker.soy.renderModalBrowseButton
 * @depends template=jive.UserPicker.soy.renderSelectedUsersList
 * @depends template=jive.UserPicker.soy.renderSelectedUser
 */
jive.UserPicker.View = jive.AbstractView.extend(function(protect) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    /**
     * the jquery object to use to create the user picker input
     * @param $input
     */
    this.init = function($input, opts) {

        this.options = opts;

        var that = this;

        this.$input = $input;

        if (opts.placeholder){
            this.setPlaceholder(opts.placeholder);
        } else {
            this.setPlaceholder(jive.UserPicker.soy.inputPlaceholder(opts));
        }

        this.$input.attr('autocomplete','off');
        this.$input.parents('form').attr('autocomplete','off');

        if (opts.emailAllowed && !opts.userAllowed){
            this.$input.addClass('j-user-autocomplete-email');
        }

        this.urls = {
            userAutocomplete: _jive_base_url + '/user-autocomplete.jspa'
        };

        this.changes = {};

        this.selectPeopleView = new jive.UserPicker.SelectPeopleView();
        this.selectionCallbacks = opts.selectionCallbacks || [];
        this.messagesView = new jive.UserPicker.Messages($input, opts);
        this.resultStore = new jive.UserPicker.ResultStore();

        this.showNoPicker = false;

        this.selectedUsers = [];
        this.selectedLists = [];

        $input.addClass('jive-chooser-input jive-form-textinput-variable');

        // create an input that'll actually hold the user ids / email addresses
        $input.before("<input type='hidden'/>");
        this.$valueStore = $input.prev();
        this.$valueStore.attr("name", opts.userParam || $input.attr("name"));
        $input.removeAttr("name");

        // create selected block
        this.$selected = $j('<div class="jive-chooser-list j-result-list j-people-list  clearfix"></div>');
        if (this.options.resultListAllowed) {
            $input.after(this.$selected.hide());
        }

        var canInvitePartners = false;
        if (opts.canInvitePartners) {
            canInvitePartners = opts.canInvitePartners;
        }

        var canInvitePreprovisioned = false;
        if (opts.canInvitePreprovisioned) {
            canInvitePreprovisioned = opts.canInvitePreprovisioned;
        }

        var invitePreprovisionedDomainRestricted = false;
        if (opts.invitePreprovisionedDomainRestricted) {
            invitePreprovisionedDomainRestricted = opts.invitePreprovisionedDomainRestricted;
        }

        // create results block
        var $chooser = $j('<div class="jive-chooser-autocomplete j-result-list j-rc4"></div>');
        this.chooserView = new jive.UserPicker.ResultListView({
            $chooser: $chooser,
            $input: $input,
            emailAllowed: opts.emailAllowed,
            userAllowed: opts.userAllowed,
            listAllowed: opts.listAllowed,
            domains: opts.domains,
            trial: opts.trial,
            canInvitePartners: canInvitePartners,
            canInvitePreprovisioned : canInvitePreprovisioned,
            invitePreprovisionedDomainRestricted : invitePreprovisionedDomainRestricted,
            onHide: function() {
                that.selectBestMatch(false);
                that.hideTheUserList(true);
            },
            onSelect: function(anchor) {
                that.clickTheSelectedResult(anchor);
            }
        });

        this.maxSelectedCount = opts.maxSelectedCount;
        this.isRelationshipRestricted = opts.relatedMessage ? true : false;

        if (that.options.userAllowed &&  opts.filterIDs.length === 0){
            that.$browse = $j(jive.UserPicker.soy.renderModalBrowseButton({ plural : that.options.multiple }));
            if (that.options.browseAllowed) {
                $input.after(that.$browse);
                that.$browse.click(function(){
                    that.loadBrowseModal();
                });
            }
        }

        this.lastAjaxAsk = "";
        this.keyPressReturn = true;
        this.pasting = false;

        $input.bind('paste', function () {
            that.pasting = true;
            //if the user pastes a bunch of crap in, parse out any valid email addresses immediately
            jive.conc.nextTick(function () {
                if ($j.trim($input.val()).length > 0) {
                    that.handlePaste();
                } else {
                    that.pasting = false;
                }
            });
        });

        $input.keydown(
            function (e) {
                if (that.pasting){
                    return false;
                } else if (e.shiftKey){
                    that.shiftPressed = true;
                } else {
                    return that.keyPressReturn = that.observeUserAutocompleteQuery(e);
                }
        });

        $input.keypress(
            function () {
                if (that.pasting){
                    return false;
                }
                return that.keyPressReturn;
        });

        $input.keyup(
            function (e) {
                if (that.pasting){
                    return false;
                } else if (e.shiftKey){
                    that.shiftPressed = false;
                } else if (that.keyPressReturn) {
                    that.ajaxTheUserList();
                }
                if (that.isEmptyInput()){
                    that.hideTheUserList();
                }
                return that.keyPressReturn;
        });

        $input.focus(function(){
            that.ajaxTheUserList();
        });

        // init default value
        this.setSelectedUsers(that.options.startingUsers.users);
        this.setSelectedLists(that.options.startingUsers.userlists);
    };

    protect.selectAction = function(payload) {
        var that = this;
        var selected = payload.users;
        that.changes = { added : []};
        if (selected.length > 0) {
            var count = selected.length;
            selected.forEach(function(selectedUser) {
                that.emitP("loadUser", selectedUser.userID).addCallback(
                    function(user) {
                        count--;
                        if (user && !that.containsItem(that.selectedUsers, user)) {
                            that.changes.added.push(user);
                            that.selectedUsers.push(user);
                            that.refreshSelectedUserListDisplayAndHiddenInput();
                        }
                        if (count === 0) {
                            that.selectPeopleView.close();
                            that.messagesView.showUserMessages(that.changes);
                            that.emit("selectedUsersChanged", that.getSelectedUsersAndLists());
                        }
                    }).addErrback(function() {
                        count--;
                        if (count === 0) {
                            that.selectPeopleView.close();
                            that.messagesView.showUserMessages(that.changes);
                            that.emit("selectedUsersChanged", that.getSelectedUsersAndLists());
                        }
                    }
                );
            });
        }
    };

    this.removeList = function(list_id, shouldRemove) {
        var that = this;
        if (list_id) {
            var removedList;
            if (that.showNoPicker) {
                that.selectedLists = that.selectedLists.map(function(list) {
                    if (list.id == list_id) {
                        removedList = that.cloneList(list);
                        list.excluded = shouldRemove;
                    }
                    return list;
                });
            }
            else {
                that.selectedLists = that.selectedLists.filter(function(list) {
                    if (list.id == list_id) {
                        removedList = that.cloneList(list);
                    }
                    return list.id != list_id;
                });
            }
            if (shouldRemove && removedList) {
                that.changes = {removed: removedList};
            }
        }
    };

    this.removeUser = function(user_id, user_email, shouldRemove) {
        var that = this;
        var removedUser;
        if (user_id && user_id != -1) {
            if (that.showNoPicker) {
                that.selectedUsers = that.selectedUsers.map(function(user) {
                    if (user.id == user_id) {
                        removedUser = that.cloneUser(user);
                        user.excluded = shouldRemove;
                    }
                    return user;
                });
            }
            else {
                that.selectedUsers = that.selectedUsers.filter(function(user) {
                    if (user.id == user_id) {
                        removedUser = that.cloneUser(user);
                    }
                    return user.id != user_id;
                });
            }
        }
        else if (user_email) {
            that.selectedUsers = that.selectedUsers.filter(function(user) {
                if (user.email == user_email) {
                    removedUser = that.cloneUser(user);
                }
                return user.email != user_email;
            });
        }
        if (shouldRemove && removedUser) {
            that.changes = {removed: removedUser};
        }
    };

    protect.setPlaceholder = function(val){
        this.$input.attr('placeholder',val);
        if (this.$input.placeHeld){
            this.$input.placeHeld();
        }
    };

    /**
     * this function is responsible for rendering the list
     * of selected users and user-lists. it is also responsible
     * for setting the value of the hidden input to an list
     * of user ids
     */
    protect.refreshSelectedUserListDisplayAndHiddenInput = function(){
        var that = this;
        var userList = [];
        var userIdList = [];
        // if this var is false,
        // then we show() $permissionmsg
        // otherwise hide()
        var hasPermission = true;
        var hasRelationship = true;
        var overResultLimit = false;
        $j(that.selectedUsers).each(function(index, user) {
            hasPermission = hasPermission && user.entitled;
            user.prop.directMessageActionLinkShown = (typeof(user.prop) != "undefined" ?
                (typeof(user.prop.directMessageActionLinkShown) != "undefined" ? user.prop.directMessageActionLinkShown : true ) : true);
            user.prop.isVisibleToPartner = (typeof(user.prop) != "undefined" ?
                (typeof(user.prop.isVisibleToPartner) != "undefined" ? user.prop.isVisibleToPartner : false ) : false);
            hasRelationship = hasRelationship && user.prop.directMessageActionLinkShown;
            if (!that.containsItem(userList, user) && !user.excluded) {
                if (that.inSelectedCountLimit(userIdList)){
                    userList.push(user);
                    if (user.id == -1) {
                        userIdList.push(user.email);
                    }
                    else {
                        if (that.options.valueIsUsername) {
                            userIdList.push(user.username);
                        }
                        else {
                            userIdList.push(user.id);
                        }
                    }
                } else {
                    that.removeUser(user.id, user.email, false);
                    overResultLimit = true;
                }
            }
        });
        $j(that.selectedLists).each(function(index, list) {
            if (!list.excluded) {
                var listHasPermission = true;
                $j(list.users).each(function(index, user) {
                    listHasPermission = listHasPermission && user.entitled;

                    user.prop.directMessageActionLinkShown = (typeof(user.prop) != "undefined" ?
                        (typeof(user.prop.directMessageActionLinkShown) != "undefined" ? user.prop
                            .directMessageActionLinkShown : true ) : true);
                    hasRelationship = hasRelationship && user.prop.directMessageActionLinkShown;
                    if (!that.containsItem(userList, user)) {
                        if (that.inSelectedCountLimit(userIdList)){
                            userList.push(user);
                            if (user.id == -1) {
                                userIdList.push(user.email);
                            }
                            else {
                                if (that.options.valueIsUsername) {
                                    userIdList.push(user.username);
                                }
                                else {
                                    userIdList.push(user.id);
                                }
                            }
                        } else {
                            that.removeUser(user.id, user.email, false);
                            overResultLimit = true;
                        }
                    }
                });
                list.entitled = listHasPermission;
                hasPermission = hasPermission && listHasPermission;
            }
        });

        that.messagesView.togglePermissionMessage(hasPermission);
        that.messagesView.toggleRelatedMessage(hasRelationship);
        that.messagesView.toggleLimitMessage(overResultLimit);
        that.messagesView.hideUserMessages();

        that.$valueStore.val(userIdList.join(","));

        if (that.selectedLists.length || that.selectedUsers.length) {
            if (that.options.multiple) {
                that.$selected.html(jive.UserPicker.soy.renderSelectedUsersList({results : { users : that
                    .selectedUsers, userlists : that.selectedLists}, message: that.options.message, disabled : that
                    .options.disabled, relationship : that.isRelationshipRestricted })).show();
            }
            else {
                that.$selected.html(jive.UserPicker.soy.renderSelectedUser({results : { users : that
                    .selectedUsers, userlists : that.selectedLists }, disabled : that.options.disabled })).show();
                if (that.selectedUsers.length) {
                    that.$input.hide();
                    that.$browse.hide();
                }
            }
            var $li;
            that.$selected.find("li").each(function() {
                $li = $j(this);
                $li.find("a.showConnections").click(function() {
                    var theOther = this;
                    var theDiv = $j.find("#listContents"+$j(theOther).closest('li').data("list-id"));
                    $j(theDiv).popover({context: $j(theOther),
                                        putBack: true,
                                        destroyOnClose: false,
                                        container: that.$selected.closest('.j-modal')});
                    return false;
                });

                $li.find("em a.add, em a.remove").parent().click(function(e) {
                    var $container = $j(this).closest('li'),
                        $anchor    = $j("a.add, a.remove", this),
                        shouldRemove = $anchor.hasClass('remove'),
                        list_id    = $container.data("list-id"),
                        user_id    = $container.data("user-id"),
                        user_email = $container.data("user-email");

                    // JIVE-18461 remove any popovers that may be hanging around
                    $container.closest('.j-modal').find('.js-pop').remove();

                    if (list_id){
                        that.removeList(list_id, shouldRemove);
                    }
                    if (user_id || user_email){
                        that.removeUser(user_id, user_email, shouldRemove);
                    }

                    that.emit("selectedUsersChanged", that.getSelectedUsersAndLists());
                    that.refreshSelectedUserListDisplayAndHiddenInput();

                    e.preventDefault();
                });
            });

            //scroll to the last item in the list
            if ($li){
                that.$selected.find('ul').scrollTo($li);
            }
        }
        else {
            that.$selected.html("");
            that.$selected.hide();
            that.show();
        }

        that.selectionCallbacks.forEach(function(callback){
            callback(that.$selected, that.selectedUsers, that.selectedLists);
        });
    };

    protect.inSelectedCountLimit = function(selectedList){
        return !this.maxSelectedCount || selectedList.length < this.maxSelectedCount;
    };

    /**
     * the function is called when the user clicks or
     * presses [enter] for either a list, an email
     * address, or a User
     */
    this.clickTheSelectedResult = function(anchor) {
        var that = this;
        var $selectedItemAnchor = anchor ? $j(anchor) : that.chooserView.findSelectedItem().find("a");
        var user_id = $selectedItemAnchor.data("user-id");
        var email = $selectedItemAnchor.data("user-email");
        var list_id = $selectedItemAnchor.data("list-id");
        var user = that.chooseResult(user_id, email, list_id);
        if (user){
            var token = (user.prop && user.prop.matchToken) ? user.prop.matchToken : $j.trim(that.$input.val());
            that.$input.val(that.$input.val().replace(new RegExp(token + "([,;|\\s])?"),''));
            that.$input.focus();
            that.refreshSelectedUserListDisplayAndHiddenInput();
            that.hideTheUserList(!user_id && !list_id);
            var changes = { added : [user]};
            that.messagesView.showUserMessages(changes);
        }
    };

    protect.chooseResult = function(user_id, email, list_id){
        var that = this;
        var result;
        if (user_id || email) {
            // add the user to the selected items
            var user = that.resultStore.getUser(user_id, email);
            if (user && !that.containsItem(that.selectedUsers, user)) {
                that.selectedUsers.push(user);
                that.changes = {added: user};

                that.emit("selectedUsersChanged", that.getSelectedUsersAndLists());
                result = user;
            }
        } else if (list_id) {
            var list = that.resultStore.getList(list_id);
            if (list && !that.containsItem(that.selectedLists, list)) {
                that.selectedLists.push(list);
                that.changes = {added: list};

                that.emit("selectedUsersChanged", that.getSelectedUsersAndLists());
                result = list;
            }
        }
        return result;
    };

    protect.containsItem = function(arr, ask) {
        var that = this;
        var has = false;
        $j(arr).each(function(index, item) {
            if (ask.id == -1) {
                has = has || (jive.util.equalsIgnoreCaseAndPadding(item.email, ask.email));
            }
            else {
                has = has || (item.id == ask.id && item.objectType == ask.objectType);
            }
        });
        return has;
    };

    protect.cloneUser = function(user) {
        return {
            displayName:user.displayName,
            id:         user.id,
            anonymous:  user.anonymous,
            external:   user.external,
            enabled:    user.enabled,
            visible:    user.visible,
            objectType: user.objectType,
            username:   user.username,
            email:      user.email,
            entitled:   user.entitled,
            prop:       { directMessageActionLinkShown: (typeof(user.prop) != "undefined" ?
                (typeof(user.prop.directMessageActionLinkShown) != "undefined" ? user.prop
                    .directMessageActionLinkShown : true ) : true),
                        isVisibleToPartner: (typeof(user.prop) != "undefined" ?
                (typeof(user.prop.isVisibleToPartner) != "undefined" ? user.prop
                    .isVisibleToPartner : false ) : false)
                },
            avatarID:   user.avatarID,
            excluded:   (typeof(user.excluded) != "undefined" ? user.excluded : false),
            disabled:   (typeof(user.disabled) != "undefined" ? user
                .disabled : false) //applies to take action on the selected user, unrelated to 'enabled' param
        };
    };

    protect.cloneList = function(list) {
        var view = this;
        var ret = {
            displayName:list.displayName,
            id:         list.id,
            objectType: list.objectType,
            style:      list.style,
            users:      [],
            excluded:   (typeof(list.excluded) != "undefined" ? list.excluded : false)
        };
        $j(list.users).each(function(index, user) {
            ret.users.push(view.cloneUser(user));
        });
        return ret;
    };

    this.shiv = function(html) {
        if (typeof innerShiv != 'undefined') {
            return innerShiv(html);
        }
        else {
            return html;
        }
    };

    /**
     * make sure that this.selectedUsers contains every user
     * in the input array
     *
     * be sure to maintain the .excluded bit on every user
     * object currently in the this.selectedUsers array
     * @param arr
     */
    this.setSelectedUsers = function(arr) {
        if(!arr) arr = [];
        var that = this;
        $j(arr).each(function(index, item) {
            if (!that.containsItem(that.selectedUsers, item)) {
                that.selectedUsers.push(that.cloneUser(item));
            }
        });
        for (var i = 0; i < that.selectedUsers.length; i++) {
            if (!that.containsItem(arr, that.selectedUsers[i])) {
                that.selectedUsers.splice(i, 1);
                i--;
            }
        }
        this.refreshSelectedUserListDisplayAndHiddenInput();
    };

    this.setSelectedLists = function(arr) {
        if(!arr) arr = [];
        var that = this;
        $j(arr).each(function(index, item) {
            if (!that.containsItem(that.selectedLists, item)) {
                that.selectedLists.push(that.cloneList(item));
            }
        });
        for (var i = 0; i < this.selectedLists.length; i++) {
            if (!that.containsItem(arr, that.selectedLists[i])) {
                this.selectedLists.splice(i, 1);
                i--;
            }
        }
        this.refreshSelectedUserListDisplayAndHiddenInput();
    };

    this.getSelectedUsersAndLists = function(includeListUsers) {
        var that = this;
        var users = $j.merge([], this.selectedUsers);
        if (includeListUsers){
            that.selectedLists.forEach(function(list){
                list.users.forEach(function(user){
                    if (!that.containsItem(users, user)){
                        users.push(user);
                    }
                })
            });
        }
        return {
            users: users,
            userlists: this.selectedLists,
            changes: this.changes
        };
    };

    this.val = function() {
        return this.$valueStore.val();
    };

    /**
     * the dropdown needs to be dismissed, hide it from view
     */
    protect.hideTheUserList = function(dontReset) {
        this.chooserView.hide();
        this.chooserView.clearHighlight();
        if(!dontReset) {
            this.$input.val("");
        }
    };

    /**
     * make sure that our dropdown is showing the latest
     * and greatest list of users/lists/emails, and if not,
     * then ajax in the new values for it
     */
    protect.ajaxTheUserList = function() {
        // fire off an ajax to load the popup if needed
        if (this.lastAjaxAsk != this.$input.val() && this.$input.val().length) {
            if (this.$input.val().length > 1) { // Don't bother the server until there are at least 2 characters to match
                this.lastAjaxAsk = this.$input.val();
                this.emit('autocompleteRequest', this.lastAjaxAsk.replace(";","|"));
            }
        } else if (this.lastAjaxAsk.length && this.$input.val().length) {
            this.chooserView.highlightFirst();
            this.chooserView.show();
        }

        return true;
    };

    /**
     * the user has typed a something into the input,
     * so we need to check if it's a command like
     * an up/down arrow or [enter] key, or if we should
     * let the browser handle the key event
     * @param event
     */
    protect.observeUserAutocompleteQuery = function (event) {
        var that = this;
        switch (event.keyCode) {
            case $j.ui.keyCode.UP:
                // move mouse up
                that.chooserView.highlightPrev();
                return false;
            case $j.ui.keyCode.DOWN:
                // move down
                that.chooserView.highlightNext();
                return false;
            case $j.ui.keyCode.TAB:
                // if there's input, add the currently selected item to the values
                if (that.$input.val().length > 0) {
                    that.clickTheSelectedResult();
                    return false;
                }
                else {
                    return true;
                }
            case $j.ui.keyCode.SPACE:
                return that.selectBestMatch(false);
            case $j.ui.keyCode.COMMA:
                return that.selectBestMatch(true);
            case 59:    //semicolon for firefox
                return that.selectBestMatch(true);
            case 220:   //pipe
                return that.selectBestMatch(true);
            case 186:   //semicolon for others
                return that.selectBestMatch(true);
            case $j.ui.keyCode.ENTER:
                // add the currently selected item to the values
                if (that.$input.val().length > 0) {
                    that.clickTheSelectedResult();
                }
                return false;
            case $j.ui.keyCode.ESCAPE:
                // exit out the autocomplete
                that.hideTheUserList();
                return false;
            case $j.ui.keyCode.HOME:
            case $j.ui.keyCode.END:
            case $j.ui.keyCode.PAGE_UP:
                if (that.shiftPressed) {
                    that.$input.select();
                }
                return false;
            case $j.ui.keyCode.PAGE_DOWN:
                return false;
        }
        return true;
    };

    protect.isEmptyInput = function(){
        return $j.trim(this.$input.val()).length === 0;
    };

    protect.selectBestMatch = function(matchName){
        var that = this;
        var val = $j.trim(this.$input.val());
        if (val && val.length > 0){
            if (that.chooserView.resultSize() == 1){
                that.clickTheSelectedResult();
                return false;
            } else if (that.isValidEmailAddress(val.toLowerCase())){
                //if token is email address (case insensitive), add user
                var $item = this.chooserView.findSelectedItem();
                if (jive.util.equalsIgnoreCaseAndPadding($item.find("a").data("user-email"), val)){
                    that.clickTheSelectedResult();
                }
                return false;
            } else if (matchName) {
                //if token is exact match of name or username (case sensitive) or only one result, add user
                if (that.chooserView.findNameMatches(val).length == 1){
                    that.clickTheSelectedResult();
                }
                return false;
            }
        }
        return true;
    };

    protect.handlePaste = function(){
        var that = this;
        var spinnerContext = {context: $j(".jive-chooser-browse")};
        that.showSpinner(spinnerContext);
        that.emitP('batchRequest', $j.trim(that.$input.val()).replace(';','|')).addCallback(
            function (data) {
                if (data.users){
                    that.resultStore.storeResults(data);
                    var selected = [];
                    $j.each(data.users, function(i, user){
                        var token = $j.trim(user.prop.matchToken);
                        var tokenReplaceRegex = new RegExp(token + "([,;|\\s])?");
                        if (that.pasteMatches(user, token, data.users)){
                            var result = that.chooseResult(user.id, user.email);
                            if (result){
                                selected.push(result);
                            }
                            that.$input.val(that.$input.val().replace(tokenReplaceRegex, ''));
                        }
                    });
                    that.$input.val($j.trim($j.trim(that.$input.val()).replace("[,;|]+$", '')));     //clean up token crap
                    //parse out any real users if possible
                    if (selected.length){
                        that.changes = {added: selected[0], pasted: selected};    //do this so messages work as expected
                    }
                    that.refreshSelectedUserListDisplayAndHiddenInput();
                    if (data.limitExceeded){
                        that.messagesView.toggleLimitMessage(true);
                    }
                }
            }).always(function(){
                that.pasting = false;
                that.hideSpinner(spinnerContext);
            });
    };

    protect.pasteMatches = function(user, token, users){
        return user.prop.matchType == 'email' && jive.util.equalsIgnoreCaseAndPadding(token, user.email) || this.nameMatches(users, token).length === 1;
    };

    protect.nameMatches = function(users, token){
        return users.filter(function(user){
            return token && ($j.trim(user.username.toLowerCase()).startsWith(token) || jive.util.equalsIgnoreCaseAndPadding(token, user.displayName));
        });
    };

    protect.loadBrowseModal = function() {
        var that = this;
        that.selectPeopleView
            .setOptions(that.options)
            .addListener('select' + that.options.name, function(payload){
                that.selectAction(payload);
            })
            .open();
        return false;
    };

    this.setCanInvitePartners = function(b) {
        this.options.canInvitePartners = b;
        this.refreshSelectedUserListDisplayAndHiddenInput();
    };

    this.setDisabled = function(b) {
        this.options.disabled = b;
        this.refreshSelectedUserListDisplayAndHiddenInput();
    };

    /**
     * hide the input box + the "select people" link
     */
    this.hide = function () {
        this.$input.hide();
        if (this.$browse) {
            this.$browse.hide();
        }
    };

    this.show = function () {
        if (!this.showNoPicker) {
            this.$input.show();
            if (this.$browse) {
                this.$browse.show();
            }
        }
        else {
            this.hide();
        }
    };

    this.setNoPicker = function(b) {
        console.log("setting user picker to be fake read only: " + b);
        this.showNoPicker = b;
        this.show();
    };

    /**
     * results for the autocomplete ask
     * @param results
     */
    this.autocompleteResponse = function(results) {
        var that = this;
        that.resultStore.storeResults(results);
        that.chooserView.render(results);
        that.chooserView.highlightFirst();
    };

    protect.isValidEmailAddress = function(emailAddress) {
        //regex is reused from StringUtils#isValidEmailAddress but matches any domain
        return emailAddress.match("^([\\w\\.!#$%&*\\+/?\\^`{}\\|~_'=-]+)@([\\w\\.-]+)\\.([\\w\\.-]+)$");
    };
});
