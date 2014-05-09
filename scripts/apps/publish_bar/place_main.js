/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint laxbreak: true */

jive.namespace('PublishBar');  // Creates the jive.PublishBar namespace if it does not already exist.

/**
 * Entry point for the PublishBar Place App.
 *
 * @param options the parameter containing options for this instance
 * @param options.objectType = options.objectType the type of content being created
 * @param options.upload = options.upload true for doc upload, false for regular doc
 * @param options.containerType = options.containerType the optional type of the current container
 * @param options.containerID = options.containerID the optional id of the current container
 *
 * @depends path=/resources/scripts/apps/publish_bar/views/place_view.js
 * @depends path=/resources/scripts/apps/publish_bar/models/search_places_source.js
 * @depends path=/resources/scripts/apps/publish_bar/models/suggested_places_source.js
 * @depends path=/resources/scripts/apps/placepicker/main.js
 */
jive.PublishBar.PlaceMain = jive.oo.Class.extend(function(protect) {
    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    protect.init = function(options) {
        var main = this;

        // options
        var objectType = options.objectType || -1;
        var upload = options.upload || false;
        var containerType = options.containerType || -1;
        var containerID = options.containerID || -1;

        // sources
        var suggestedPlacesSource = new jive.PublishBar.SuggestedContainersSource({containerType: containerType, containerID: containerID});
        var searchPlacesSource = new jive.PublishBar.SearchPlacesSource();

        // view
        var placeView = new jive.PublishBar.PlaceView($j('#js-publishbar-place-input'),
            $j('#js-publishbar-place-results'));

        // suggested places
        placeView.addListener('suggest', function(promise) {
            suggestedPlacesSource.get(objectType).addCallback(function(data) {
                promise.emitSuccess(data);
            });
        });
        // end suggested places


        // place search
        placeView.addListener('search', function(query, promise) {
            searchPlacesSource.findAll({
                query: query,
                contentType: objectType
            }).addCallback(function(data) {
                promise.emitSuccess(data);
            });
        });
        // end place search

        // browse places
        placeView.addListener('browse', function() {
            var placePicker = new jive.Placepicker.Main({
                pickerContext:"create",
                objectType: objectType,
                containerType: containerType,
                containerID: containerID,
                upload: upload,
                closeOnSelect: true,
                hideUserContainer: true
            });
            placePicker.showPicker();
            placePicker.addListener('container', function(targetContainer, promise) {
                placeView.selectPlace(targetContainer.targetContainerType, targetContainer.targetContainerID);
            });
        });
        // end browse places

        // place selected view
        placeView.addListener('selectPlace', function(containerType, containerID) {
            main.emit("selectPlace", containerType, containerID);
        });
        // end place selected view
     };
});
