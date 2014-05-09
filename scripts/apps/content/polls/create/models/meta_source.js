/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('content.polls');

//noinspection JSUnusedLocalSymbols
jive.content.polls.MetaSource = $Class.extend({
   create: function(pollOption, data, callback) {

   },
   remove: function(id) {
        var options = {
            type: "GET",
            url: this.META_ENDPOINT + "/remove/" + id,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(data) {
            },
            error: function(data, textStatus, errorThrown) {
                console.log('Error jive.content.polls.MetaSource fetch' + id+', ' + errorThrown);
            }
        };

        $j.ajax(options);
    }

});