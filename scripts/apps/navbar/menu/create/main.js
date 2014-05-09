/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint laxbreak: true */
/*global containerType containerID */

jive.namespace('Navbar.Menu.Create');  // Creates the jive.Navbar.Menu.Create namespace if it does not already exist.

/**
 * Entry point for the Navbar.Menu.Create App.
 *
 * @param {jQuery|DOMElement|String} buttonSelector reference or selector to the menu button
 * @param {jQuery|DOMElement|String} menuSelector reference or selector to the menu container
 *
 * @depends path=/resources/scripts/apps/navbar/menu/main.js 
 * @depends path=/resources/scripts/apps/navbar/menu/create/controllers/create_flow_controller.js
 * @depends path=/resources/scripts/apps/navbar/menu/create/views/type_chooser_view.js
 * @depends path=/resources/scripts/apps/navbar/menu/create/views/quick_create_view.js 
 * @depends path=/resources/scripts/apps/navbar/menu/create/views/container_chooser_view.js 
 * @depends path=/resources/scripts/apps/navbar/menu/create/models/quick_create_source.js
 * @depends path=/resources/scripts/apps/navbar/menu/create/models/create_source.js
 * @depends path=/resources/scripts/apps/placepicker/main.js
 * @depends path=/resources/scripts/apps/placepicker/models/suggested_containers_source.js
 * @depends path=/resources/scripts/apps/placepicker/models/search_containers_source.js
 * @depends path=/resources/scripts/apps/placepicker/models/browse_containers_source.js
 * @depends path=/resources/scripts/apps/placepicker/models/place_picker_source.js
 * @depends path=/resources/scripts/apps/browse/user/model/user_source.js
 * @depends path=/resources/scripts/jive/accessibility.js
 * @depends path=/resources/scripts/jquery/jquery.ba-bbq.js
 * @depends path=/resources/scripts/apps/shared/controllers/localexchange.js
 * @depends path=/resources/scripts/apps/direct_messaging/factory.js
 */
jive.Navbar.Menu.Create.Main = jive.Navbar.Menu.Main.extend(function(protect, _super) {

    var _ = jive.Navbar.Menu.Create;  // Creates a shortcut for referring to the app namespace.

    protect.init = function(buttonSelector, menuSelector) {
        var main = this;

        _super.init.call(this, buttonSelector, menuSelector);

        this.suggestedContainers = new jive.Placepicker.SuggestedContainersSource({
            containerType: containerType,  // global variable
            containerID: containerID  // global variable
        });

        this.containers = new jive.Placepicker.SearchContainersSource();
        this.browseContainers = new jive.Placepicker.BrowseContainersSource();

        this.placePicker = new jive.Placepicker.PlacePickerSource("create", {
            containerType: containerType,  // global variable
            containerID: containerID  // global variable
        });

        this.quickCreateSource = new _.QuickCreateSource();
        this.userPrefSource = new jive.Browse.User.ItemSource();

        this.contentTypes = {};

        this.currentContainerType = containerType;
        this.currentContainerID = containerID;

        // Listen in on the REST service call that initially populates the
        // create menu to record properties of each content type.
        this.listView.addListener('toggle', function(promise) {
            promise.addCallback(function(data) {
                main.initializeData(data);
            });
        });

        // Listen in on home page action links for creating content.
        jive.localexchange.addListener('actions.create', function(params) {
            main.selectedContentType = params.contentType;
            main.upload = params.upload;

            main.populate(new jive.conc.Promise()).addCallback(function(data) {
                main.initializeData(data);

                var placePicker = new jive.Placepicker.Main($j.extend({
                    pickerContext:"create",
                    followLinks:true,
                    objectType: main.selectedContentType,
                    upload: main.upload
                    }, main.contentTypes[main.selectedContentType]));

                placePicker.showPicker();
                main.invalidate();
            });
        });

        jive.Accessibility.main.addHotkey("c", false, false, false, jive.Accessibility.clickAction($j(buttonSelector)));
    };

    protect.buildListView = function(buttonSelector, menuSelector) {
        var typeChooserView = new _.TypeChooserView()
          , containerChooserView = new _.ContainerChooserView()
          , quickCreateView = new _.QuickCreateView()
          , main = this;

        main.flowController = new _.CreateFlowController(buttonSelector, menuSelector, {
            contentType: containerChooserView,
            toggleView: typeChooserView
        }, typeChooserView);

        // Keep track of the content type that the user selected.
        typeChooserView.addListener('contentType', function(contentType, upload) {
            main.selectedContentType = contentType;
            main.upload = upload;
        }).addListener('toggleView', function(value) {
            main.userPrefSource.setUserProperty({
                userID: 'current',
                propName: 'CreateMenuService.smallView',
                propValue: String(value)
            });
        });

        // Load data for containerChooserView when a content type is selected.
        containerChooserView.addListener('render', function(promise) {
            main.suggestedContainers.get(main.selectedContentType).addCallback(function(data) {
                promise.emitSuccess(jQuery.extend({
                    upload: main.upload,
                    selectedContentType: main.contentTypes[main.selectedContentType]
                }, data));
            });
        });

        containerChooserView.addListener('search', function(query, promise) {
            main.containers.findAll({
                query: query,
                contentType: main.selectedContentType,
                maxReturned: 10
            }).addCallback(function(data) {
                promise.emitSuccess(jQuery.extend({
                    contentType: main.selectedContentType,
                    containerType: containerType,
                    containerID: containerID,
                    upload: main.upload
                }, data));
            });
        });

        // Begin loading the place picker
        containerChooserView.addListener('browse', function(data) {
            var placePicker = new jive.Placepicker.Main($j.extend({
                pickerContext:"create",
                followLinks:true,
                objectType: main.selectedContentType,
                containerType: data.containerType,
                containerID: data.containerID,
                upload: main.upload
            }, data.selectedContentType));
            placePicker.showPicker();
        });

        //deal with "quick" views
        typeChooserView.addListener('quickCreate', function(contentType, url) {
            main.selectedContentType = contentType;
            main.url = url;

            // perform different actions based on content type
            if (jive.DirectMessaging.isContentTypeEqualTo(contentType)) {
                    // Direct messaging content type
                    main.flowController.close();
                    jive.DirectMessaging.create({trackingID: 'cmenu'}).showModal();
            } else {
                quickCreateView.render();
            }
        });

        quickCreateView.addListener("fetch", function(promise) {
            main.flowController.close();
            main.quickCreateSource.fetch(main.url, promise);
        });

        return main.flowController;
    };

    protect.buildItemSource = function() {
        return new jive.Navbar.Menu.CreateSource();
    };

    protect.sourceParams = function() {
        return {
            containerType : containerType,
            containerID : containerID };
    };

    protect.initializeData = function(data) {
        var main = this;
        if (data) {
            data.sections.reduce(function(items, section) {
                return items.concat(section.items);
            }, []).filter(function(item) {
                return item.urlParams && item.urlParams.contentType;
            }).forEach(function(item) {
                // null values make life harder
                if (item.id === null) {
                    delete item.id;
                }

                main.contentTypes[item.urlParams.contentType] = jQuery.extend({
                    id: item.urlParams.contentType,
                    headingKey: item.headingKey,
                    personalContainerTitleKey: item.personalContainerTitleKey,
                    personalContainerCaptionKey: item.personalContainerCaptionKey,
                    searchPlaceholderKey: item.searchPlaceholderKey
                }, item);
            });
        }

        $j('a.js-container-context').each(function() {
            $j(this).querystring("containerType=" + main.currentContainerType + "&containerID=" + main.currentContainerID);
            $j(this).removeClass('js-container-context');
        });
    };
});
