/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Placepicker');

/**
 * Handles browse UI for container navigation.  All accordion sections are lazy loaded when clicked.
 *
 * @extends jive.AbstractView
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/apps/placepicker/views/container_search_view.js
 * @depends path=/resources/scripts/jquery/jquery.endless-scroll-1.3.js
 * @depends path=/resources/scripts/jquery/ui/ui.accordion.js
 * @depends template=jive.placepicker.browseContainers
 * @depends template=jive.placepicker.searchResults
 */
jive.Placepicker.ContainerBrowseView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;


    protect.init = function(options) {
        this.containerStack = new Array(); // used for tracking space hierarchy traversal
        
        options = options || {};
        this.filterGroup = options.filterGroup || "placePicker";
        this.followLinks = options.followLinks || false;
        this.parent = options.parent || null;
        this.closeOnSelect = options.closeOnSelect || false;
        this.hideUserContainer = options.hideUserContainer || false;
    };

    /**
     * Renders out and sets up the accordion for the place picker.
     *
     * @param data.contentType the content type being created or moved
     * @param data.contentID the ID of the content type if known
     * @param data.containerType the current containerType the user is in
     * @param data.containerID the ID of the container the user is in
     * @param data.selectedContentType contains the ID and label for the content being created
     * @param data.rootCommunity optional PlaceItemBean, used when the content type can be created in the root community
     * @param data.userContainer optional PlaceItemBean, used when the content type can be created in the user container
     * @param data.filterGroupBean the filter group definition from the PlacePickerFilterGroupProvider
     */
    this.render = function(data) {
        var promise = new jive.conc.Promise()
          , view = this;

        // set a few instance variables, these will determine behavior in the spaces section
        view.rootCommunity = data.rootCommunity;
        view.showRootCommunity = data.showRootCommunity;
        view.contentType = data.contentType;

        // render out the initial accordion html from soy
        view.modal = $(jive.placepicker.browseContainers(data));

        view.modal.delegate('.js-target-container', 'click', function(event) {
            var targetContainerType = $(this).data('objecttype');
            var targetContainerID = $(this).data('objectid');
            var targetContainerName = $j(this).find(".js-container-title").text();
            view.emit('container', {targetContainerType: targetContainerType, targetContainerID: targetContainerID, targetContainerName: targetContainerName});
            if (view.closeOnSelect) {
               view.modal.trigger('close');
            }
            if (!view.followLinks) {
                event.preventDefault();
            }
        });

        var initModal = function() {
            // set up click handlers for subspace click events.
            view.setupSubspaceHandlers(view.modal);

            // load up the followed containers section first
            var followedContainerArgs = view.serviceArgs('following');
            view.showSpinner();
            view.emitP('browseLoad', followedContainerArgs).addCallback(function(data) {

                // call the soy template with data from the model
                var followedContainers = $(jive.placepicker.containerList(jQuery.extend({emptyKey: 'browse.places.empty.message'},
                        data)));
                view.addListToAccordionSection(view.modal.find('.j-places-list').first(), followedContainers, true);

                // set up accordion section clicks for remaining container lists (spaces, groups, projects)
                var accordion = view.modal.find('.j-accordion-container').accordion({
                    changestart:function(event, ui) {
                        if (ui.newContent.find('li').length == 0) {
                            var sectionLink = ui.newHeader.find('.js-accordion-link');
                            var serviceArgs = view.serviceArgs(sectionLink.data('placefilter'));
                            view.setupAccordionSection(ui.newHeader.next(), serviceArgs, true);
                        }
                    }
                });

                // set up the search text input
                var searchView = new jive.Placepicker.ContainerSearchView(view.modal.find('input[name=container-filter]'),
                        view.modal.find('.js-place-picker-content'));

                // Listens for a 'search' event from searchView and re-emits the
                // event.
                view.proxyListener(searchView, 'search');

            }).always(function(){
                view.hideSpinner();
            });
        };

        view.modal.lightbox_me({
            closeSelector: ".close",
            destroyOnClose: true,
            onLoad: initModal,
            showOverlay: true,
            parentLightbox: $(view.parent).closest(".jive-modal:visible")
        });

        return promise;
    };

    this.close = function(){
        if (this.modal){
            this.modal.trigger("close");
        }
    };

    /**
     * Loads a section of the accordion, emits an event to load the accordion section when necessary.
     *
     * @param element the container list div to load
     * @param serviceArgs the arguments to propogate when the accordion section is clicked
     */
    protect.setupAccordionSection = function(element, serviceArgs, addScroller) {
        var view = this;
        var isSpacesSection = view.isSpacesSection(serviceArgs.filterID);
        var isFollowingSection = view.isFollowingSection(serviceArgs.filterID);

        if (isSpacesSection) {
            // check if a container has been set, won't be for the top level spaces accordion
            serviceArgs = view.setupSpaceArgs(serviceArgs);
            // store the current container as data in the element
            element.data('containerType', serviceArgs.containerType);
            element.data('containerID', serviceArgs.containerID);

            if (view.isRootCommunity(serviceArgs)) {
                // don't emit the event, root community data is already loaded
                var list = view.rootCommunityList();
                return view.addListToAccordionSection(element, list, addScroller);
            }
        }

        var emptyKey = null;

        if (isFollowingSection) {
            emptyKey = 'browse.places.empty.message';
        }
        
        // go grab the containers for this accordion section
        view.showSpinner(element);
        view.emitP('browseLoad', serviceArgs).addCallback(function(data) {
            view.hideSpinner(element);            

            // remove root community link for types that can't navigate back to the root community
            if (isSpacesSection) {
                if (view.isRootCommunityChildren(serviceArgs) && !view.showRootCommunity) {
                    data.containerName = null;
                }
            }

            // apply the soy template
            var list = $(jive.placepicker.containerList(jQuery.extend({showSubspaces: isSpacesSection, emptyKey: emptyKey}, data)));
            return view.addListToAccordionSection(element, list, addScroller);
        });
    };

    /**
     * Adds a endless scroller to the container list.  Loads 20 more items when the scroll bar hits the bottom.
     *
     * @param listContainer the div containing the container list.
     */
    protect.addScroller = function(listContainer) {
        var view = this;
        listContainer.endlessScroll({
            fireDelay: false,
            callback: function() {

                var startIndex = $(this).find('li').size();
                if (startIndex % 20 == 0) {
                    var sectionLink = $(this).prev().find('a');
                    var filterID = sectionLink.data('placefilter');
                    var params = view.serviceArgs(filterID, startIndex);
                    // check to see if we are in a child space section
                    var containerID = $(this).data('containerID');
                    var containerType = $(this).data('containerType');
                    if (containerID > -1) {
                        params = $.extend({containerType: containerType, containerID: containerID}, params);
                    }
                    view.emitP('browseLoad', params).addCallback(function(data) {
                        var list = $(jive.placepicker.moreContainers($.extend({showSubspaces: view.isSpacesSection(filterID)}, data)));
                        listContainer.find('ul').append(list);
                    });
                }
            }
        });
    };

    /**
     * Spaces have special logic for tree traversal.  Live click handlers are set up for
     * navigating down and up the tree.
     *
     * @param element the div containing the container list
     */
    protect.setupSubspaceHandlers = function(element) {
        var view = this;

        // -1 represents the root node, add it to the stack to represent depth of 0.
        view.containerStack.push({containerType: view.rootCommunity.type, containerID: -1});

        // child space clicks, traversing down the tree
        element.delegate('.js-child-spaces', 'click', function(event) {

            // grab the filterID for this section
            var sectionLink = $(this).closest('.j-places-list').prev('.j-accordion-toggle').find('.js-accordion-link');
            var filterID = sectionLink.data('placefilter');

            var serviceArgs = $.extend({containerType: $(this).data('objecttype'), containerID: $(this).data('objectid')}, view.serviceArgs(filterID));

            // update parent information for back clicks when navigating spaces
            view.containerStack.push({containerType: $(this).data('parent-objecttype'), containerID: $(this).data('parent-objectid')});            
            view.setupAccordionSection($(this).closest('.j-places-list'), serviceArgs, false);
            event.preventDefault();
        });

        // back to parent list clicks , traversing back up the tree
        element.delegate('.js-parent-container', 'click', function(event) {

            // grab the filterID for this section
            var sectionLink = $(this).closest('.j-places-list').prev('.j-accordion-toggle').find('.js-accordion-link');
            var filterID = sectionLink.data('placefilter');

            var parentContainer = view.containerStack.pop();
            if (view.isRootCommunity(parentContainer)) {
                // Don't load the root community, we've already got it
                var list = view.rootCommunityList();
                view.addListToAccordionSection($(this).closest('.j-places-list'), list, false);
            }
            else {
                var serviceArgs = $.extend({containerType: parentContainer.containerType,containerID: parentContainer.containerID}, view.serviceArgs(filterID));
                view.setupAccordionSection($(this).closest('.j-places-list'), serviceArgs, false);
            }
            event.preventDefault();
        });
    };

    /**
     * Finds an element that may be a child of the given element or that may be
     * the element itself.
     */
    protect.flatFind = function(element, selector) {
        return element.find('*').andSelf().filter(selector);
    };

    /**
     * Indicates if this accordion section is for spaces
     */
    protect.isSpacesSection = function(filterID) {
        return filterID == 'space';
    };

    /**
     * Indicates if this accordion section is for followed containers
     */
    protect.isFollowingSection = function(filterID) {
        return filterID == 'following';
    };

    /**
     * Indicates if the service args are for the root communities children
     */
    protect.isRootCommunityChildren = function(serviceArgs) {
        var view = this;
        return serviceArgs.containerType == view.rootCommunity.type && serviceArgs.containerID == view.rootCommunity.id;
    };

    /**
     * Indicates if the service args are for the root community itself
     */
    protect.isRootCommunity = function(serviceArgs) {
        var view = this;
        return serviceArgs.containerType == view.rootCommunity.type && serviceArgs.containerID == -1;
    };

    /**
     * Sets up arguments for the spaces section
     */
    protect.setupSpaceArgs = function(serviceArgs) {
        var view = this;

        if (!serviceArgs.containerType && !serviceArgs.containerID) {
            if (view.showRootCommunity) {
                // we only want to display the root community, not it's children
                serviceArgs.containerType = view.rootCommunity.type;
                serviceArgs.containerID = -1;
            }
            else {
                 // set up the service to get children of the root community
                serviceArgs.containerType = view.rootCommunity.type;
                serviceArgs.containerID = view.rootCommunity.id;
            }
        }
        return serviceArgs;
    };

    /**
     * Appends a list to the accordion section, adds a scroll listener if specified.
     */
    protect.addListToAccordionSection = function(element, list, addScroller) {
        var view = this;

        element.html(list);
        element.show();

        // bind scroller to the list
        if (addScroller) {
            view.addScroller(element);
        }
    };

    /**
     * Returns service args for the container sections
     */
    protect.serviceArgs = function (filterID, startIndex) {
        var view = this;
        var sort = view.isSpacesSection(filterID) ? 'spaceOrder' : 'subject';

        return {
        	filterGroupID: view.filterGroup,
            filterID: filterID,
            start: startIndex ? startIndex : 0,
            sortKey: sort,
            numResults: 20
        };
    };

    /**
     * Renders out the root community link as a list
     */
    protect.rootCommunityList = function() {
        var view = this;

        // set of the link for the root community and don't emit an event to get it's data
        return $(jive.placepicker.containerList({
            showSubspaces: true,
            containers: [view.rootCommunity],
            contentType: view.contentType,
            containerType: -1, // not necessary for this view
            containerID: -1 // not necessary for this view.
        }));
    };

    protect.createSpinner = function(element) {
        this.$spinner = $(jive.shared.soy.loading());
        if (element) {
            element.append(this.$spinner);
        }
    };

    protect.destroySpinner = function(element) {
        if (this.$spinner) {
            this.$spinner.remove();
        }
    };
});
