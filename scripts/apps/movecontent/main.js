/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint laxbreak: true */

jive.namespace('Move.Content');  // Creates the jive.Move.Content namespace if it does not already exist.

/**
 * Entry point for the Move.Content App.
 *
 * @depends path=/resources/scripts/apps/shared/models/nested_rest_service.js
 * @depends path=/resources/scripts/apps/browse/content/model/content_source.js
 * @depends path=/resources/scripts/apps/browse/container/model/container_source.js
 * @depends path=/resources/scripts/apps/movecontent/views/move_view.js
 * @depends path=/resources/scripts/apps/movecontent/models/move_content_source.js
 * @depends path=/resources/scripts/apps/movecontent/models/move_container_source.js
 * @depends path=/resources/scripts/apps/placepicker/main.js
 */

jive.Move.Content.Main = jive.oo.Class.extend(function(protect) {

    protect.init = function(options) {
        var main = this;

        // the content or container being moved
        this.objectType = options.objectType;
        this.objectID = options.objectID;
        // the current container the object is in
        this.containerType = options.containerType;
        this.containerID = options.containerID;
        this.isContainer = options.isContainer || false;

        this.contentCapabilitiesSource = new jive.Move.Content.CapabilitiesSource({
            parentID: this.objectID,
            parentType: this.objectType
        });

        this.containerCapabilitiesSource = new jive.Move.Container.CapabilitiesSource({
            parentID: this.objectID,
            parentType: this.objectType
        });

        this.contentSource = new jive.Browse.Content.ItemSource();
        this.containerSource = new jive.Browse.Container.ItemSource();

        this.moveView = new jive.Move.Content.MoveView();

        this.placePicker = new jive.Placepicker.Main($j.extend({pickerContext: "move"}, options));

        this.moveView.addListener('browse', function(data) {
            main.placePicker.showPicker();
        });

        // Listen to move confirmation events
        this.moveView.addListener('moveConfirmed', function(data) {
            if (main.isContainer) {
                main.handleConfirmation(main.containerSource, data);
            }
            else {
                main.handleConfirmation(main.contentSource, data);
            }
        });

        // Listen to container selected events
        this.placePicker.addListener('container', function(targetContainer, promise) {
            if (main.isContainer) {
                main.handleContainerSelected(main.containerCapabilitiesSource, targetContainer);
            }
            else {
                main.handleContainerSelected(main.contentCapabilitiesSource, targetContainer);
            }
        });

     };

    protect.handleConfirmation = function(source, data) {
        var main = this;
        source.save({id: main.objectType + "/" + main.objectID,
            objectType: data.targetContainerType, objectID: data.targetContainerID}).addCallback(function(updatedObject) {
                window.location = jive.app.url({
                    path:updatedObject.link + "?prevContainerType=" + main.containerType + "&prevContainerID=" + main.containerID
                });
        });
    };

    protect.handleContainerSelected = function(source, targetContainer) {
        var main = this;
        source.findAll({containerType: targetContainer.targetContainerType, containerID: targetContainer.targetContainerID}).addCallback(function(data) {
            main.moveView.confirm(data);
        });

    }

});
