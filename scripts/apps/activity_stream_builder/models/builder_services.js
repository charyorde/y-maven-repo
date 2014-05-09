/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('ActivityStream');

/**
 * Activity Stream Edit REST service.
 *
 * @class
 * @extends jive.RestService
 * @param {Object}  options
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/promise.js
 * @depends path=/resources/scripts/jquery/jquery.ba-bbq.js
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 */
jive.ActivityStream.BuilderServices = jive.RestService.extend(function(protect) {

    protect.resourceType = "stream-config";
    protect.pluralizedResourceType = protect.resourceType;

    /**
     * Loads a list of activity for a  particular user, using userId
     *
     * @methodOf jive.ActivityStream.StreamSource#
     * @param {Object}  resource Contains property String userId, that specifies the user's id
     * @returns {jive.conc.Promise} promise that is fulfilled when the list of activity is ready
     */
    this.getInitialViewData = function(resource){
        var url = this.RESOURCE_ENDPOINT + '/getInitialView';

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data: resource.selectedStreamID+''});
    };

    this.getActivityStreams = function (objectType, objectID) {
        var url = this.RESOURCE_ENDPOINT + '/user/activity/streams';
        if (objectType != undefined && objectID != undefined) {
            url += '/' + objectType + '/' + objectID;
        }

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url});
    };

    this.getActivityStream = function (streamID) {
        var url = this.RESOURCE_ENDPOINT + '/' + streamID;

        return this.commonAjaxRequest(new jive.conc.Promise(), 'GET', {url:url});
    };

    this.manageAssociations = function(objList, queryParams) {
        var url = this.RESOURCE_ENDPOINT + '/user/associations/manage',
            promise = new jive.conc.Promise();
        if (queryParams) {
            url = $j.param.querystring(url, queryParams);
        }
        var tidList = [],
            itemStreamCounts = {};
        for (var i = 0, objListLength = objList.length; i < objListLength; i++) {
            tidList.push({objectType: objList[i].objectType, objectID: objList[i].id});
            if (!itemStreamCounts[objList[i].objectType+'']) {
                itemStreamCounts[objList[i].objectType+''] = {};
            }
            itemStreamCounts[objList[i].objectType+''][objList[i].id+''] = objList[i].itemStreamCounts;
        }
        promise.addCallback(function(dataList) {
            for (var i = 0, listLength = dataList.length; i < listLength; i++) {
                var data = dataList[i];
                if (data.addedRelationship) {
                    // the press of the follow button triggered a new UserRelationship to be created,
                    // send out switchboard events for the fact that a new follow occurred and the user just followed
                    // was just added to the connections stream of the button-pressing user.

                    // if the user just managed is yourself, don't send out the follow.user notification
                    if (!(data.associatedObjectType == 3 && data.associatedObjectID == window._jive_current_user.ID)) {
                        jive.switchboard.emit('follow.user', jQuery.extend({}, {id: data.associatedObjectID}));
                    }
                    jive.switchboard.emit('associations.create', data.addedRelationshipStreamViewBean.streamViewBean);
                }
                else if (data.associatedObjectType != 3) {
                    if (itemStreamCounts[data.associatedObjectType+''][data.associatedObjectID+''] == 0) {
                        var obj = {
                            objectType: data.associatedObjectType,
                            objectID: data.associatedObjectID};
                        jive.switchboard.emit('follow.create', obj);
                    }
                }
            }
        });
        return this.commonAjaxRequest(promise, 'POST', {url:url, data:JSON.stringify(tidList)});
    };

    this.createNewStream = function(initialItemDescriptors) {
        var url = this.RESOURCE_ENDPOINT;
        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {
            url:url,
            data: JSON.stringify(initialItemDescriptors.map(function(item){
                return {objectType: item.type,
                        objectID:   item.id};
            }))
        });
    };

    this.deleteStream = function(streamID, promise) {
        var url = this.RESOURCE_ENDPOINT + '/' + streamID;

        promise.addCallback(function(streamViewBeanMap) {
            var deletedViewBean = streamViewBeanMap['deletedStream'];
            jive.switchboard.emit('associations.destroy', deletedViewBean);

            var removedPlaces = deletedViewBean.specifiedPlaces;
            for (var i = 0, removedPlacesLength = removedPlaces.length; i < removedPlacesLength; i++) {
                var type = removedPlaces[i].type+'',
                    id = removedPlaces[i].id+'';
                if (removedPlaces[i].prop.followInfo.streamsAssociatedBean.streamIDs.length == 1) {
                    // the deletedViewBean has the JOViewBeans of the objects just before the association with the
                    // deleted stream was removed, so if they were only associated with the 1 deleted stream, the
                    // follow should be removed
                    var obj = {objectType: type,
                               objectID: id};
                    jive.switchboard.emit('follow.destroy', obj);
                }
            }
        });

        return this.commonAjaxRequest(promise, 'DELETE', {
            url:url
        });
    };

    this.modifyConfig = function(configData) {
        var url = this.RESOURCE_ENDPOINT + "/" + configData.id + "/modify";

        return this.commonAjaxRequest(new jive.conc.Promise(), 'POST', {url:url, data:
            JSON.stringify({
                name: configData.name,
                receiveEmails: configData.receiveEmails,
                defaultStream: configData.defaultStream
            })
        });
    };

    this.pinHomeNav = function(linkID, promise) {
        var url = this.RESOURCE_ENDPOINT + "/pinHomeNavView";

        this.commonAjaxRequest(promise, 'POST', {url:url, data: linkID});
    };

    this.addItemsToStream = function(promise, itemDescriptors, streamID, itemStreamCounts, queryParams) {
        var url = this.RESOURCE_ENDPOINT + '/' + streamID + '/objects';
        if (queryParams) {
            url = $j.param.querystring(url, queryParams);
        }
        promise.addCallback(function(modifiedViewBean) {
            jive.switchboard.emit('associations.create', modifiedViewBean.streamViewBean);

            // emit switchboard event for any new user relationships
            for (var i = 0, newUserRelsLength = modifiedViewBean.addedRelationships.length; i < newUserRelsLength; i++) {
                jive.switchboard.emit('follow.user', jQuery.extend({}, {id: modifiedViewBean.addedRelationships[i]}));
            }

            var newPlaces = modifiedViewBean.streamViewBean.specifiedPlaces;
            for (var j = 0, addedPlacesLength = newPlaces.length; j < addedPlacesLength; j++) {
                var type = newPlaces[j].type+'',
                    id = newPlaces[j].id+'';
                if (itemStreamCounts[type] && !itemStreamCounts[type][id]) {
                    var obj = {objectType: type,
                               objectID: id};
                    jive.switchboard.emit('follow.create', obj);
                }
            }
        });

        return this.commonAjaxRequest(promise, 'POST', {
            url:url,
            data: JSON.stringify(itemDescriptors.map(function(item){
                return {objectType: item.type,
                        objectID:   item.id};
            }))
        });
    };

    this.removeItemsFromStream = function(promise, itemDescriptors, streamID, itemStreamCounts, queryParams) {
        var url = this.RESOURCE_ENDPOINT + '/' + streamID + '/objects/remove';
        if (queryParams) {
            url = $j.param.querystring(url, queryParams);
        }
        promise.addCallback(function(modifiedViewBean) {
            jive.switchboard.emit('associations.destroy', modifiedViewBean.streamViewBean);

            var removedPlaces = modifiedViewBean.streamViewBean.specifiedPlaces;
            for (var i = 0, removedPlacesLength = removedPlaces.length; i < removedPlacesLength; i++) {
                var type = removedPlaces[i].type+'',
                    id = removedPlaces[i].id+'';
                if (itemStreamCounts[type] && itemStreamCounts[type][id] == 1) {
                    var obj = {objectType: type,
                               objectID: id};
                    jive.switchboard.emit('follow.destroy', obj);
                }
            }
        });

        return this.commonAjaxRequest(promise, 'POST', {
            url:url,
            data: JSON.stringify(itemDescriptors.map(function(item){
                return {objectType: item.type,
                        objectID:   item.id};
            }))
        });
    };

    this.setItemAssociations = function(itemDescriptors, streamID, isAssociated, itemStreamCounts, queryParams) {
        var promise = new jive.conc.Promise();
        if (isAssociated) {
            return this.addItemsToStream(promise, itemDescriptors, streamID, itemStreamCounts, queryParams);
        }
        else {
            return this.removeItemsFromStream(promise, itemDescriptors, streamID, itemStreamCounts, queryParams);
        }
    };

    this.removeAllAssociations = function(type, id, queryParams) {
        var url = this.RESOURCE_ENDPOINT + '/' + type + '/' + id,
            promise = new jive.conc.Promise();
        if (queryParams) {
            url = $j.param.querystring(url, queryParams);
        }
        promise.addCallback(function() {
            var obj = {objectType: type,
                       objectID: id};
            jive.switchboard.emit('follow.destroy', obj);
        });
        return this.commonAjaxRequest(promise, 'DELETE', {url:url});
    };

});