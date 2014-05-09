/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Entry point for the App.PlacePicker App.
 *
 * @depends path=/resources/scripts/apps/placepicker/main.js
 */
define('jive.Apps.PlacePicker.Main', function() {
return jive.oo.Class.extend(function(protect) {
    protect.init = function(options) {
        var main = this;

        this.personalContainerTitleKey = options.personalContainerTitleKey;
        this.personalContainerCaptionKey = options.personalContainerCaptionKey;
        this.searchPlaceholderKey = options.searchPlaceholderKey;
        this.closeOnSelect = true;

        this.placePicker = new jive.Placepicker.Main({
            closeOnSelect: this.closeOnSelect,
            filterGroup: "appPlacePicker",
            personalContainerTitleKey: main.personalContainerTitleKey,
            personalContainerCaptionKey: main.personalContainerCaptionKey,
            searchPlaceholderKey: main.searchPlaceholderKey,
            containerType: options.containerType,
            pickerContext: "app",
            filterByContainer: (options.containerType) ? true : false,
            objectType: options.contentType
        });
    };

    this.showPicker = function(callback) {
        var main = this;

        main.placePicker.showPicker();

        main.placePicker.addListener('container', function(data) {
            callback(data);
            main.placePicker.removeListener('container');
        });
    };
});
});