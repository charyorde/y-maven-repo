/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('ReadTracking');

jive.ReadTracking.ReadTrackingSource = jive.RestService.extend(function(protect, _super) {

    protect.resourceType = "readtracking";
    protect.pluralizedResourceType = protect.resourceType;

    /**
     * Marks an object as read by the current user.
     *
     * @param objectType
     * @param objectID
     */
    this.save = function(objectType, objectID, markRead){
        var promise = new jive.conc.Promise(),
            urlAction = 'read';
        if (!markRead) {
            urlAction = 'unread';
        }
        $j.ajax({
            type: "POST",
            dataType: "json",
            url: this.RESOURCE_ENDPOINT + "/" + objectType + "/" + objectID + "/" + urlAction,

            success: function(data) {
                promise.emitSuccess();
            }
        });

        return promise;
    };

    /**
     * Marks all items in the inbox read for the current user
     */
    this.markAllRead = function(asOf) {
        var url = this.RESOURCE_ENDPOINT + '/markallread';
        var asOf = asOf == null ? "" : asOf;

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: JSON.stringify(asOf)});
    };

});
