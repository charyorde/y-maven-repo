/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * jive.FollowApp.Main
 * 
 * Main class for controlling interactions for following containers and content.
 *
 * @depends path=/resources/scripts/apps/activity_stream_builder/models/builder_services.js
 * @depends path=/resources/scripts/apps/follows/models/follow_source.js
 * @depends path=/resources/scripts/apps/follows/views/follow_view.js
 */

jive.namespace('FollowApp');

jive.FollowApp.Main = jive.oo.Class.extend(function(protect) {

	this.init = function(options) {
        var main = this;

        this.objectID = options.objectID;
        this.objectType = options.objectType;
        this.i18n = options.i18n;
        this.featureName = options.featureName;

        this.followSource = new jive.FollowApp.FollowSource(options);
        this.streamsSource = new jive.ActivityStream.BuilderServices(options);

        this.followView = new jive.FollowApp.FollowView(this.featureName,
				options);

        this.followView.addListener('manageAssociations', function(objectType, objectID, curASAssocCount, promise) {
            var objType = main.objectType;
            if (!objType) {
                objType = objectType;
            }
            var objId = main.objectID;
            if (!objId) {
                objId = objectID;
            }
            var requestObj = {
                objectType: objType,
                id: objId,
                itemStreamCounts: curASAssocCount
            };
            main.streamsSource.manageAssociations([requestObj]).addCallback(function(dataList) {
                promise.emitSuccess(dataList);
            }).addErrback(function(error, status) {
                promise.emitError(error, status);
            });
        }).addListener('setItemAssociation', function(objectType, objectID, streamID, isSelected, curASAssocCount, promise) {
            var objType = main.objectType;
            if (!objType) {
                objType = objectType;
            }
            var objId = main.objectID;
            if (!objId) {
                objId = objectID;
            }
            var obj = {type: objType,
                       id: objId},
                countObject = {};
            countObject[objectType+''] = {};
            countObject[objectType+''][objectID+''] = curASAssocCount;
            main.streamsSource.setItemAssociations([obj], streamID, isSelected, countObject).addCallback(function() {
                promise.emitSuccess();
            }).addErrback(function(error, status) {
                promise.emitError(error, status);
            });
        }).addListener('removeAllAssociations', function(objectType, objectID, promise) {
            var objType = main.objectType;
            if (!objType) {
                objType = objectType;
            }
            var objId = main.objectID;
            if (!objId) {
                objId = objectID;
            }
            main.streamsSource.removeAllAssociations(objType, objId).addCallback(function() {
                promise.emitSuccess();
            }).addErrback(function(error, status) {
                promise.emitError(error, status);
            });
        });

	};

    this.tearDown = function() {
        this.followView.removeListener('manageAssociations')
            .removeListener('setItemAssociation')
            .removeListener('removeAllAssociations')
            .tearDown();
    };
});

define('jive.followApp.Main', function() {
    return jive.FollowApp.Main;
});