/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*globals containerType containerID */

jive.namespace('places.Manage');

/**
 * Handles interactions for managing a place.
 *
 * @depends path=/resources/scripts/apps/places/manage/views/category_controls.js
 * @depends path=/resources/scripts/apps/places/manage/views/archive_controls.js
 * @depends path=/resources/scripts/apps/places/manage/views/author_by_email_controls.js
 * @depends path=/resources/scripts/apps/places/manage/views/custom_controls.js
 * @depends path=/resources/scripts/apps/shared/views/menu_view.js
 *
 * TODO: Many of these dependency declarations should be moved into files that
 * this class depends on.
 * @depends template=jive.socialgroups.soy.*
 * @depends path=/resources/scripts/apps/socialgroup/membership/views/membership_view.js
 * @depends path=/resources/scripts/apps/socialgroup/membership/models/membership_source.js
 * @depends path=/resources/scripts/apps/socialgroup/membership/main.js
 * @depends path=/resources/scripts/jive/share.js
 * @depends path=/resources/scripts/jive/author-by-email.js
 * @depends path=/resources/scripts/jive/model/project_control.js
 * @depends path=/resources/scripts/apps/movecontent/main.js
 * @depends path=/resources/scripts/apps/email_notification/main.js
 * @depends path=/resources/scripts/apps/modalizer/main.js
 * @depends path=/resources/scripts/apps/follows/main.js
 * @depends dwr=ManageTagSet
 */
jive.places.Manage.Main = jive.oo.Class.extend(function(protect) {
    var $ = jQuery
      , _ = jive.places.Manage;

    protect.init = function(place, options) {
        var main = this;

        this.objectType             = place.objectType;
        this.objectID               = place.id;
        this.membershipSupported    = place.membershipSupported;
        this.canArchive             = place.canArchive;
        this.placeI18nKeyPrefix     = place.placeI18nKeyPrefix;
        this.objectURL              = place.objectURL;
        this.parentID               = place.parentID;
        this.parentType             = place.parentType;

        this.canCreateByEmail       = place.canCreateByEmail;
        this.canManageAnnouncements = options.canManageAnnouncements;
        this.canManageCategories    = options.canManageCategories;
        this.canMoveContainer       = options.canMoveContainer;
        this.canManageContainer     = options.canManageContainer;
        this.i18n                   = options.i18n;

        if (this.canCreateByEmail) {
            // Export a function because that is the original behavior of this
            // code.
            var that = this;
            window.launchAuthorByEmailModal = function() {
                var controls = new _.AuthorByEmailControls();
                controls.addListener('load', main.modalLoader('/author-by-email.jspa', {
                    view: 'place',
                    containerType: that.objectType,
                    container: that.objectID
                }));
            };
        }

        if (this.canManageCategories) {
            this.categoryControls = new _.CategoryControls();
            this.categoryControls.addListener('load', this.modalLoader('/manage-category.jspa'));
        }

        if (this.canArchive) {
            this.archiveControls = new _.ArchiveControls();
            this.archiveControls.addListener('load', this.modalLoader('/archive-project.jspa'));
        }

        // only projects can be moved at this point
        if (this.canMoveContainer) {
            this.jiveMoveContent = new jive.Move.Content.Main({
                objectType: this.objectType,
                objectID: this.objectID,
                objectUrl: this.objectURL,
                isContainer: true,
                containerID: this.parentID,
                containerType: this.parentType,
                searchPlaceholderKey:'place.picker.move.search.project'
            });
        }

        if (this.canManageContainer) {
            this.deleteControls = new jive.Modalizer.Main({liveTriggers:['#jive-place-link-manage-delete'], width: 'narrow'});
        }

        this.jiveFollow = new jive.FollowApp.Main({
            objectType: containerType,
            objectID: containerID,
            featureName: place.placeI18nKeyPrefix,
            i18n: this.i18n
        });

        if (this.membershipSupported) {
            this.jiveMembership = new jive.MembershipApp.Main({
                objectID: containerID
            });
        }

        this.customControls = new _.CustomControls();
        this.customControls.addListener('load', this.modalLoader(''));

        $(document).ready(function() {
            main.menuView = new jive.MenuView(function() {
                return $("#j-place-manage-container");
            }, '#jive-place-link-manage', {
                darkPopover: true,
                destroyOnClose: false
            });

            $('#j-place-manage-container').click(function(event) {
                main.menuView.close();
            });

            new jive.EmailNotification.Main(place.id, place.objectType);
        });
    };

    protect.modalLoader = function(path, extraParams) {
        var main = this;

        return function(objectID, url, promise) {
            var params = $.extend({
                containerType: main.objectType,
                container: main.objectID
            }, extraParams);

            if (typeof promise == 'undefined') {
                promise = objectID;
                objectID = null;
            }

            if (objectID) {
                params.editID = objectID;
            }

            if (!path && url) {
                path = url;
            }

            $.get(jive.app.url({ path: path }), params, function(data) {
                promise.emitSuccess(data);
            });
        };
    };
});
