/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */



jive.namespace('UserGroupPicker');

/**
 * this class replaces an <input> with a user group autocomplete input
 * @depends path=/resources/scripts/apps/usergrouppicker/views/select_usergroups_view.js
 */
jive.UserGroupPicker.View = jive.oo.Class.extend(function(protect) {
    var selectGroupView = new jive.UserGroupPicker.SelectGroupsView();

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);


    function contains(arr, ask){
        var has = false;
        $j(arr).each(function(index, item){
            if(ask.id == -1){
                has = has || (item.displayName == ask.displayName);
            }else{
                has = has || (item.id == ask.id && item.objectType == ask.objectType);
            }
        });
        return has;
    }


    function cloneGroup(group){
        return {
            displayName:group.displayName,
            id:         group.id,
            enabled:    group.enabled,
            objectType: group.objectType,
            name:       group.name,
            entitled:   group.entitled,
            avatarID:   group.avatarID,
            excluded:   (typeof(group.excluded) != "undefined" ? group.excluded : false)
        }
    }

    function cloneList(list){
        var ret = {
            displayName:list.displayName,
            id:         list.id,
            objectType: list.objectType,
            style:      list.style,
            groups: [],
            excluded:   (typeof(list.excluded) != "undefined" ? list.excluded : false)
        }
        $j(list.groups).each(function(index,group){
            ret.groups.push(cloneGroup(group));
        });
        return ret;
    }

    function shiv(html) {
        if (typeof innerShiv != 'undefined') {
            return innerShiv(html);
        } else {
            return html;
        }
    }

    /**
     * make sure that this.selectedGroups contains every user group
     * in the input array
     *
     * be sure to maintain the .excluded bit on every user group
     * object currently in the this.selectedGroups array
     * @param arr
     */
    this.setSelectedGroups = function(arr){
        if(!arr) arr = [];
        var that = this;
        $j(arr).each(function(index, item){
            if(!contains(that.selectedGroups, item)){
                that.selectedGroups.push(cloneGroup(item));
            }
        });
        for(var i=0;i<this.selectedGroups.length;i++){
            if(!contains(arr, this.selectedGroups[i])){
                this.selectedGroups.splice(i, 1);
                i--;
            }
        }
        this.refreshSelectedGroupsDisplayAndHiddenInput();
    }

    this.setSelectedLists = function(arr){
        if(!arr) arr = [];
        var that = this;
        $j(arr).each(function(index, item){
            if(!contains(that.selectedLists, item)){
                that.selectedLists.push(cloneList(item));
            }
        });
        for(var i=0;i<this.selectedLists.length;i++){
            if(!contains(arr, this.selectedLists[i])){
                this.selectedLists.splice(i, 1);
                i--;
            }
        }
        this.refreshSelectedGroupsDisplayAndHiddenInput();
    }




    this.val = function(){
        return this.$valueStore.val();
    }



    /**
     * the jquery object to use to create the user picker input
     * @param $input
     */
    this.init = function($input, opts){

        var that = this;

        this.$input = $input;

        this.urls = {
            groupAutocomplete: _jive_base_url + '/group-autocomplete.jspa',
            browseModal: _jive_base_url + '/group-autocomplete-modal.jspa'
        };


        this.showNoPicker = false;
        this.options = opts;
        this.groupStore = new jive.ext.y.HashTable();
        this.listStore = new jive.ext.y.HashTable();
        this.selectedGroups = [];
        this.selectedLists = [];

        $input.addClass('jive-chooser-input jive-form-textinput-variable');

        // create an input that'll actually hold the user group ids
        $input.before("<input type='hidden'/>");
        this.$valueStore = $input.prev();
        this.$valueStore.attr("name", $input.attr("name"));
        $input.removeAttr("name");

        // create selected block
        var $selected = $j('<div class="jive-chooser-list j-result-list j-people-list j-rc4 clearfix"></div>')
        $input.before($selected.hide());

        // create results block
        this.$chooser = $j('<div class="jive-chooser-autocomplete j-result-list j-rc4"></div>')
        $j("body").append(this.$chooser.hide());


        var $permissionmsg = this.options.permissionsMessage;
        if($permissionmsg){
            $input.before($permissionmsg.hide());
        }

        function selectAction(payload) {
            var selected = payload.groups;
            if (selected.length > 0) {
                var count = selected.length;
                for(var i=0;i<selected.length;i++){
                    $j.ajax({
                        url : _jive_base_url + '/__services/v2/rest/groups/' + selected[i].groupID,
                        dataType : "json",
                        success : function(group){
                            console.log('success');
                            count--;
                            if(group && !contains(that.selectedGroups, group)){
                                that.selectedGroups.push(group);
                                that.refreshSelectedGroupsDisplayAndHiddenInput();
                            }
                            if(count == 0){
                                selectGroupView.close();
                                that.emit("selectedGroupssChanged", { groups : that.selectedGroups, grouplists : that.selectedLists });
                            }
                        },
                        error : function(){
                            count--;
                            if(count == 0){
                                selectGroupView.close();
                                that.emit("selectedGroupssChanged", { groups : that.selectedGroups, grouplists : that.selectedLists });
                            }
                        }
                    });
                }
            }
        }

        function loadBrowseModal() {
            selectGroupView
                .setOptions(that.options)
                .addListener('select', selectAction)
                .open();

            return false;
        };


        if (that.options.groupAllowed) {
            that.$browse = $j(jive.UserGroupPicker.soy.renderModalBrowseButton({ plural : that.options.multiple }));
            $input.after(that.$browse);
            that.$browse.click(loadBrowseModal);
        }

        var lastAjaxAsk = "";

        /**
         * this function is responsible for rendering the list
         * of selected user groups and user group lists. it is also responsible
         * for setting the value of the hidden input to an list
         * of user group ids
         */
        this.refreshSelectedGroupsDisplayAndHiddenInput = function(){
            var groupList = [];
            var groupIdList = [];
            // if this var is false,
            // then we show() $permissionmsg
            // otherwise hide()
            var hasPermission = true;
            $j(that.selectedGroups).each(function(index, group){
                hasPermission = hasPermission && group.entitled;
                if(!contains(groupList, group) && !group.excluded){
                    groupList.push(group);
                    if(group.id == -1){
                        groupIdList.push(group.name);
                    }else{
                        if(that.options.valueIsUserGroupName){
                            groupIdList.push(group.name);
                        }else{
                            groupIdList.push(group.id);
                        }
                    }
                }
            });
            $j(that.selectedLists).each(function(index, list){
                if(!list.excluded){
                    $j(list.groups).each(function(index, group){
                        hasPermission = hasPermission && group.entitled;
                        if(!contains(groupList, group)){
                            groupList.push(group);
                            if(group.id == -1){
                                groupIdList.push(group.name);
                            }else{
                                if(that.options.valueIsUserGroupName){
                                    groupIdList.push(group.name);
                                }else{
                                    groupIdList.push(group.id);
                                }
                            }
                        }
                    });
                }
            });

            if($permissionmsg){
                if(hasPermission){
                    $permissionmsg.hide();
                }else{
                    $permissionmsg.show();
                }
            }

            this.$valueStore.val(groupIdList.join(","));

            if(that.selectedLists.length || that.selectedGroups.length){
                if(that.options.multiple){
                    $selected.html(jive.UserGroupPicker.soy.renderSelectedGroupsList({results : { groups : that.selectedGroups, groupLists : that.selectedLists}, message: that.options.message, disabled : that.options.disabled })).show();
                }else{
                    $selected.html(jive.UserGroupPicker.soy.renderSelectedGroup({results : { groups : that.selectedGroups, groupLists : that.selectedLists }, disabled : that.options.disabled })).show();
                    if(that.selectedGroups.length){
                        $input.hide();
                        that.$browse.hide();
                    }
                }
                $selected.find("li").each(function(){
                    var $li = $j(this);
                    $li.find("a.showConnections").click(function(){
                        $li.find(".js-grouped-users-popover").popover({context: $j(this), putBack: true, destroyOnClose: false, container: $selected.closest('.j-modal')});

                        return false;
                    });


                    function createClickHandler(shouldRemove){
                        return function(){
                            var list_id = $li.attr("data-list-id");
                            if(list_id){
                                if(that.showNoPicker){
                                    that.selectedGroupLists = that.selectedGroupLists.map(function(list){
                                        if(list.id == list_id){
                                            list.excluded = shouldRemove;
                                        }
                                        return list;
                                    });
                                }else{
                                    that.selectedGroupLists = that.selectedGroupLists.filter(function(list){
                                        return list.id != list_id;
                                    });
                                }
                            }
                            var group_id = $li.attr("data-group-id");
                            if(group_id && group_id != -1){
                                if(that.showNoPicker){
                                    that.selectedGroups = that.selectedGroups.map(function(group){
                                        if(group.id == group_id){
                                            group.excluded = shouldRemove;
                                        }
                                        return group;
                                    });
                                }else{
                                    that.selectedGroups = that.selectedGroups.filter(function(group){
                                        return group.id != group_id;
                                    });
                                }
                            }else{
                                var group_name = $li.attr("data-group-name");
                                if(group_name){
                                    that.selectedGroups = that.selectedGroups.filter(function(group){
                                        return group.name != group_name;
                                    });
                                }
                            }
                            that.emit("selectedGroupsChanged", { groups : that.selectedGroups, groupLists : that.selectedLists });
                            that.refreshSelectedGroupsDisplayAndHiddenInput();
                        }
                    }

                    $li.find("em a.add").click(createClickHandler(false));
                    $li.find("em a.remove").click(createClickHandler(true));
                });
            }else{
                $selected.html("");
                $selected.hide();
                that.show();
            }
        }

        /**
         * the function is called when the user clicks or
         * presses [enter] for either a list, an email
         * address, or a User
         */
        this.clickTheSelectedGroup = function(){
            var group_id = that.$chooser.find("li.hover a").attr("data-group-id");
            var list_id = that.$chooser.find("li.hover a").attr("data-list-id");
            that.$chooser.val("");

            if(group_id){
                // add the group to the selected items
                var group = that.groupStore.get(group_id);
                if(group && !contains(that.selectedGroups, group)){
                    that.selectedGroups.push(group);
                    that.emit("selectedGroupsChanged", { groups : that.selectedGroups, groupLists : that.selectedLists });
                }
            }else if(list_id){
                var list = that.listStore.get(list_id);
                if(list && !contains(that.selectedLists, list)){
                    that.selectedLists.push(list);
                    that.emit("selectedGroupsChanged", { groups : that.selectedGroups, groupLists : that.selectedLists });
                }
            }

            $input.focus();
            that.refreshSelectedGroupsDisplayAndHiddenInput();
            hideTheGroupList();
        }

        /**
         * the following functions are responsible for
         * setting the highlight style for the rows
         * in the dropdown
         * @param $item
         */
        this.highlightRow = function($item){
            that.$chooser.find("li.hover").removeClass("hover");
            $item.addClass("hover");
        }
        this.highlightFirst = function(){
            that.$chooser.find("li.hover").removeClass("hover");
            that.$chooser.find("li:first").addClass("hover");
        }
        function highlightNext(){
            if(that.$chooser.find("li.hover").next().length){
                that.$chooser.find("li.hover").removeClass("hover").next().addClass("hover");
            }else if(that.$chooser.find("li.hover").parent("ul").nextAll("ul:first").length){
                that.$chooser.find("li.hover").removeClass("hover").parent("ul").nextAll("ul:first").find("li:first").addClass("hover");
            }
        }
        function highlightPrev(){
            if(that.$chooser.find("li.hover").prev().length){
                that.$chooser.find("li.hover").removeClass("hover").prev().addClass("hover");
            }else if(that.$chooser.find("li.hover").parent("ul").prevAll("ul:first").length){
                that.$chooser.find("li.hover").removeClass("hover").parent("ul").prevAll("ul:first").find("li:last").addClass("hover");
            }
        }

        /**
         * the dropdown needs to be dismissed, hide it from view
         */
        function hideTheGroupList(dontReset){
            that.$chooser.hide();
            if(!dontReset) $input.val("");
        }

        /**
         * make sure that our dropdown is showing the latest
         * and greatest list of groups/lists, and if not,
         * then ajax in the new values for it
         */
        function ajaxTheGroupList(){
            // fire off an ajax to load the popup if needed
            if(lastAjaxAsk != $input.val() && $input.val().length){
                lastAjaxAsk = $input.val();

                that.emit('autocompleteRequest', lastAjaxAsk);
                
            }else if(lastAjaxAsk.length && $input.val().length){
                that.highlightFirst();
                that.$chooser.css({ left : that.$input.offset().left, top : that.$input.offset().top + that.$input.height() + 10 });
                that.$chooser.show();
            }

            return true;
        }

        /**
         * the user has typed a something into the input,
         * so we need to check if it's a command like
         * an up/down arrow or [enter] key, or if we should
         * let the browser handle the key event
         * @param event
         */
        function observeGroupAutocompleteQuery(event) {
            switch(event.keyCode) {
                case $j.ui.keyCode.UP:
                    // move mouse up
                    highlightPrev();
                    return false;
                case $j.ui.keyCode.DOWN:
                    // move down
                    highlightNext();
                    return false;
                case $j.ui.keyCode.ENTER:
                    // add the currently selected item to the
                    // values
                    that.clickTheSelectedGroup();
                    return false;
                case $j.ui.keyCode.ESCAPE:
                    // exit out the autocomplete
                    hideTheGroupList();
                    return false;
                case $j.ui.keyCode.LEFT:
                case $j.ui.keyCode.RIGHT:
                case $j.ui.keyCode.HOME:
                case $j.ui.keyCode.END:
                case $j.ui.keyCode.PAGE_UP:
                case $j.ui.keyCode.PAGE_DOWN:
                return false;
            }
            return true;
        };



        var keyPressReturn = true;
        $input.keydown(function(e){
            return keyPressReturn = observeGroupAutocompleteQuery(e);
        }).keypress(function(){ return keyPressReturn; }).keyup(function(e){
            if(keyPressReturn){
                ajaxTheGroupList();
            }
            return keyPressReturn;
        });
        $input.blur(function(){
            setTimeout(function(){
                hideTheGroupList(true);
            }, 250);
        }).focus(function(){
            ajaxTheGroupList();
        });

        // init default value
        this.setSelectedGroups(that.options.startingGroups.groups);
        this.setSelectedLists(that.options.startingGroups.groupLists);
    }


    this.setDisabled = function(b){
        this.options.disabled = b;
        this.refreshSelectedGroupsDisplayAndHiddenInput();
    }

    /**
     * hide the input box + the "select people" link
     */
    this.hide = function(){
        this.$input.hide();
        if(this.$browse) this.$browse.hide();
    }

    this.show = function(){
        if(!this.showNoPicker){
            this.$input.show();
            if(this.$browse) this.$browse.show();
        }else{
            this.hide();
        }
    }

    this.setNoPicker = function(b){
        this.showNoPicker = b;
        this.show();
    }

    /**
     * results for the autocomplete ask
     * @param results
     */
    this.autocompleteResponse = function(results){
        var that = this;
        // store ajax results in our cache
        $j(results.groups).each(function(index, group){
            that.groupStore.put(group.id, group);
        });
        $j(results.groupLists).each(function(index, list){
            that.listStore.put(list.id, list);
        });

        var msg;
        if(!this.options.groupAllowed && !this.options.listAllowed){
            msg = jive.UserGroupPicker.soy.pleaseEnterValidName();
        }else{
            msg = jive.UserGroupPicker.soy.noUserGroupsMatchMessage();
        }


        this.$chooser.html(jive.UserGroupPicker.soy.renderGroupsList({results : results, noResultsMessage : msg})).show();
        this.$chooser.css({ left : this.$input.offset().left, top : this.$input.offset().top + this.$input.height() + 10 });
        this.highlightFirst();
        this.$chooser.find("a").mouseover(function(){
            that.highlightRow($j(this).parent("li"));
        }).click(function(){
            that.clickTheSelectedGroup();
            return false;
        });
    }
});
