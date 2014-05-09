/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('UserPicker');

/**
 * Handles results for userpicker source calls.
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/jive/ext/y/y_core.js
 */
jive.UserPicker.ResultStore  = jive.oo.Class.extend(function(protect) {

    this.init = function(options){
        this.userStore = new jive.ext.y.HashTable();
        this.listStore = new jive.ext.y.HashTable();
    };

    this.storeResults = function(results) {
        var that = this;
        // store ajax results in our cache
        $j(results.users).each(function (index, user) {
            if (user.id == -1) {
                that.userStore.put(user.email, user);
            }
            else {
                that.userStore.put(user.id, user);
            }
        });
        $j(results.userlists).each(function (index, list) {
            that.listStore.put(list.id, list);
        });
    };

    this.getUser = function(user_id, email){
        return this.userStore.get((user_id > -1) ? user_id : email);
    };

    this.getList = function(list_id){
        return this.listStore.get(list_id);
    };

});