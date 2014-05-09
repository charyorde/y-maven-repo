/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * jive.FollowUserApp.Main
 *
 * Main class for controlling interactions for following a user.
 *
 * @depends path=/resources/scripts/apps/follows/user/views/labels_view.js
 * @depends path=/resources/scripts/apps/shared/models/user_relationship_source.js
 * @depends path=/resources/scripts/apps/shared/models/user_relationship_list_source.js
 * @depends path=/resources/scripts/apps/activity_stream_builder/models/builder_services.js
 * @depends path=/resources/scripts/apps/shared/controllers/switchboard.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/synchronize.js
 */

jive.namespace('FollowUserApp');

jive.FollowUserApp.Main = jive.oo.Class.extend(function(protect) {
    var _ = jive.FollowUserApp;

    this.init = function(options) {
        var main = this;

        this.followView = options.followView;

        this.relSource = new jive.UserRelationshipSource();
        this.labelSource = new jive.UserRelationshipListSource();
        this.streamsSource = new jive.ActivityStream.BuilderServices();

        this.followView.addListener('manageAssociations', function(objectType, objectID, curStreamAssocCount, promise) {
            var requestObj = {
                objectType: objectType,
                id: objectID,
                itemStreamCounts: curStreamAssocCount
            };
            main.streamsSource.manageAssociations([requestObj]).addCallback(function(dataList) {
                promise.emitSuccess(dataList);
            }).addErrback(function(error, status) {
                promise.emitError(error, status);
            });
        }).addListener('setItemAssociation', function(objectType, objectID, streamID, isFollowed, curASAssocCount, promise) {
            var obj = {type: objectType,
                       id: objectID},
                countObject = {};
            countObject[objectType] = {};
            countObject[objectType][objectID] = curASAssocCount;

            main.streamsSource.setItemAssociations([obj], streamID, isFollowed, countObject).addCallback(function(modifiedViewBean) {
                promise.emitSuccess(modifiedViewBean);
            }).addErrback(function(error, status) {
                promise.emitError(error, status);
            });
        }).addListener('removeAllAssociations', function(objectType, objectID, appliedLabelIDs, promise) {
            main.streamsSource.removeAllAssociations(objectType, objectID).addCallback(function() {
                promise.emitSuccess();
                if (!(objectType == 3 && objectID == window._jive_current_user.ID)) {
                    setTimeout(function() {
                        jive.switchboard.emit('unfollow.user', jQuery.extend({}, {id: objectID, labelIDs: appliedLabelIDs}));
                    }, 200);
                }
            }).addErrback(function(error, status) {
                promise.emitError(error, status);
            });
        }).addListener('addLabel', function(userID, listID, promise) {
            jive.conc.synchronize({
                add: main.labelSource.addListMember(listID, userID),
                label: main.labelSource.get(listID)
            }).addCallback(function(responses) {
                jive.switchboard.emit('userlabel.applied', responses.label, userID);
                promise.emitSuccess();
            }).addErrback(function(error, status) {
                promise.emitError(error, status);
            });
        }).addListener('removeLabel', function(userID, listID, promise) {
            main.labelSource.removeListMember(listID, userID).addCallback(function() {
                jive.switchboard.emit('userlabel.unapplied', { id: listID }, userID);
                promise.emitSuccess();
            }).addErrback(function(error, status) {
                promise.emitError(error, status);
            });
        });

        jive.switchboard.addListener('userlabel.created', function(label) {
            main.followView.addLabelItem(label);
        });

        jive.switchboard.addListener('userlabel.updated', function(label) {
            main.followView.updateLabelItem(label);
            main.labelView().update(label);
        });

        jive.switchboard.addListener('userlabel.removed', function(obj) {
            main.followView.removeLabelItem(obj.id);
            main.labelView().remove(obj);
        });

        jive.switchboard.addListener('userlabel.applied', function(label, userID) {
            main.followView.apply(label, userID);
            main.labelView(userID).add(label);
        });

        jive.switchboard.addListener('userlabel.unapplied', function(label, userID) {
            main.followView.unapply(label, userID);
            main.labelView(userID).remove(label);
        });
    };

    /*
     * Given a user ID returns a view instance representing the label
     * indicators corresponding to that user.
     *
     * If no userID is given returns an instance representing label
     * indicators for all users.
     */
    protect.labelView = function(userID) {
        return new _.LabelsView(userID);
    };
});
