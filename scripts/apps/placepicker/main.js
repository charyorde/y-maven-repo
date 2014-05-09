/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint laxbreak: true */

jive.namespace('Placepicker');  // Creates the jive.Placepicker namespace if it does not already exist.

/**
 * Entry point for the Placepicker App.  When a container is ultimately selected, a 'container' event
 * is fired with the targetContainerID, targetContainerType, and targetContainerName.
 *
 * @param options the parameter containing options for this instance
 * @param options.pickerContext the context for using the place picker: "create", "move", "app", default is "create"
 * @param options.objectType = options.objectType the type of object for the purpose of the place picker, optional
 * @param options.objectID the ID of the object type if known, optional
 * @param options.upload if the content type is an upload
 * @param options.personalContainerTitleKey the i18n key for the personal container link
 * @param options.personalContainerCaptionKey the i18n key for the personal container caption
 * @param options.searchPlaceholderKey the i18n key for the search text
 * @param options.containerType the current containerType the user is in
 * @param options.containerID the ID of the container the user is in
 * @param options.filterGroupBean the filter group definition from the PlacePickerFilterGroupProvider
 * @param options.parent the parent element for the modal, optional
 * @param options.followLinks whether or not to follow the container link directly, default is false
 * @param options.closeOnSelect whether or not to close the modal after a container is selected, default is false
 * @param options.showUserContainer whether or not to show the user container as an option to select.
 *
 * @depends path=/resources/scripts/apps/placepicker/views/container_browse_view.js
 * @depends path=/resources/scripts/apps/placepicker/models/browse_containers_source.js
 * @depends path=/resources/scripts/apps/placepicker/models/search_containers_source.js
 * @depends path=/resources/scripts/apps/placepicker/models/place_picker_source.js
 */
jive.Placepicker.Main = jive.oo.Class.extend(function(protect) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    protect.init = function(options) {
        var main = this;

        this.pickerContext = options.pickerContext || "create";
        this.objectType = options.objectType;
        this.objectID = options.objectID || -1;
        this.upload = options.upload;
        this.personalContainerTitleKey = options.personalContainerTitleKey;
        this.personalContainerCaptionKey = options.personalContainerCaptionKey;
        this.searchPlaceholderKey = options.searchPlaceholderKey;
        this.containerType = options.containerType;
        this.containerID = options.containerID;
        this.filterGroup = options.filterGroup;
        this.followLinks = options.followLinks || false;
        this.parent = options.parent || null;
        this.closeOnSelect = options.closeOnSelect || false;
        this.filterByContainer = options.filterByContainer || false;
        this.hideUserContainer = options.hideUserContainer || false;
        this.fromQuest = options.fromQuest;
        this.containers = new jive.Placepicker.SearchContainersSource();

        this.browseContainers = new jive.Placepicker.BrowseContainersSource();

        this.placePicker = new jive.Placepicker.PlacePickerSource(this.pickerContext, {
            containerType: this.containerType,
            containerID: this.containerID
        });

        this.containerBrowseView = new jive.Placepicker.ContainerBrowseView({
            filterGroup: this.filterGroup,
            parent: this.parent,
            followLinks: this.followLinks,
            closeOnSelect: this.closeOnSelect,
            hideUserContainer: this.hideUserContainer
        });

        this.containerBrowseView.addListener('browseLoad', function(serviceParams, promise) {
            var args = jQuery.extend({contentType: main.objectType, contentID: main.objectID}, serviceParams);
            if (main.filterByContainer) {
                args = jQuery.extend({}, {containerType: main.containerType, containerID: main.containerID}, args);
            }
            main.browseContainers.findAll(args).addCallback(function(data) {
                 promise.emitSuccess({
                        contentType: main.objectType,
                        containerType: main.containerType,
                        containerID: main.containerID,
                        upload: main.upload,
                        containers: data.items,
                        containerName: data.containerName,
                        parentName: data.parentName
                    });
                });
        });

        this.containerBrowseView.addListener('search', function(query, promise) {
            main.containers.findAll({
                query: query,
                contentType: main.objectType,
                contentID: main.objectID
            }).addCallback(function(data) {
                promise.emitSuccess(jQuery.extend({
                    contentType: main.objectType,
                    containerType: main.containerType,
                    containerID: main.containerID,
                    upload: main.upload
                }, data));
            });
        });

        this.containerBrowseView.addListener('container', function(containerParams) {
            main.emit('container', containerParams);
        });

     };

    this.showPicker = function() {
        var main = this;

        main.placePicker.findAll({contentType: main.objectType, contentID: main.objectID}).addCallback(function(config) {
            main.containerBrowseView.render(jQuery.extend({
                contentID: main.contentID,
                contentType: main.objectType,
                containerType: main.containerType,
                containerID: main.containerID,
                hideUserContainer: main.hideUserContainer,
                selectedContentType: {id: main.objectType,
                    personalContainerTitleKey: main.personalContainerTitleKey,
                    personalContainerCaptionKey: main.personalContainerCaptionKey,
                    searchPlaceholderKey: main.searchPlaceholderKey}}, config));
        });
    }
});
