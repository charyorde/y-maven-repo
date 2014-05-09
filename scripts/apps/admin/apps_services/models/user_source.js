/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Data source for Jive user model objects.
 *
 * @class
 */

jive.admin.apps.services.UserSource = jive.oo.Class.extend(function(protect) {

    var USERS_URL = jive.app.url({path : '/__services/v2/rest/users'});

    this.init = function() {
        var userSource = this;
    };

    /**
     * Return the Jive user with the specified ID, or null if there is no such user.
     *
     * @param id the user ID of the requested user
     */
    this.getUser = function(id) {
        if (id < 0) {
            return null;
        }
        var user = null;
        $j.ajax({
            async : false,
            dataType : 'json',
            success : function(data) {
                user = data;
            },
            url : USERS_URL + "/" + id
        });
        return user;
    };

    /**
     * Return an array of Jive users with the specified IDs, or an empty list if there are no IDs.
     *
     * @param ids array of Jive user ids
      */
    this.getUsers = function(ids) {
        var userSource = this;
        if (!ids || (ids.length < 1)) {
            return [];
        }
        var users = [];
        $j(ids).each(function(index, id) {
            var user = userSource.getUser(id);
            if (user) {
                users.push(user);
            }
        });
        return users;
    };

});
