/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Data source for Jive user group model objects.
 *
 * @class
 */

jive.admin.apps.services.GroupSource = jive.oo.Class.extend(function(protect) {

    var GROUPS_URL = jive.app.url({path : '/__services/v2/rest/groups'});

    this.init = function() {
        var groupSource = this;
    }

    /**
     * Return the Jive user group with the specified ID, or null if there is no such user group.
     *
     * @param id the user ID of the requested user group
     */
    this.getGroup = function(id) {
        if (id == 0) {
            return null;
        }
        var group = null;
        $j.ajax({
            async : false,
            dataType : 'json',
            success : function(data) {
                group = data;
            },
            url : GROUPS_URL + "/" + id
        });
        return group;
    };

    /**
     * Return an array of Jive user groups with the specified IDs, or an empty list if there are no IDs
     *
     * @param ids array of Jive user group ids
      */
    this.getGroups = function(ids) {
        var groupSource = this;
        if (!ids || (ids.length < 1)) {
            return [];
        }
        var groups = [];
        $j(ids).each(function(index, id) {
            var group = groupSource.getGroup(id);
            if (group) {
                groups.push(group);
            }
        });
        return groups;
    };

});
