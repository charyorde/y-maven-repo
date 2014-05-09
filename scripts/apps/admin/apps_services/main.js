/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('admin.apps.services');  // Creates the jive.admin.apps.services namespace if it does not already exist.

/**
 * Entry point for the Apps Services App.
 *
 * @depends path=/resources/scripts/jive/rest.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/observable.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/conc/promise.js
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 * @depends path=/resources/scripts/soy/soyutils.js
 *
 * @class
 * @param {jQuery|DOMElement|String} element reference or selector to the DOM container for this app
 */
jive.admin.apps.services.Main = jive.oo.Class.extend(function(protect) {

    var _ = jive.admin.apps.services;  // Creates a shortcut for referring to the app namespace.

//    this.init = function(element) {
    this.init = function() {

        // Captures a reference to this instance
        var main = this;

        // Initialize properties of this class
        this.actionsView = null;
        this.entryView = null;
        this.filtersView = null;
        this.filtersViewShowing = false;
        this.headersView = null;
        this.listView = null;
        this.tagsView = null;
        this.authStyleSource = null;
        this.groupSource = null;
        this.serviceSource = null;
        this.userSource = null;

        // Set up and render our views when page loading completes
        $j(document).ready(function() {
            // Set up component instances.
            main.actionsView = main.buildActionsView();
            main.entryView = null;
            main.filtersView = null;
            main.headersView = null;
            main.listView = main.buildListView();
            main.tagsView = null;
            main.authStyleSource = new _.AuthStyleSource();
            main.groupSource = new _.GroupSource();
            main.serviceSource = new _.ServiceSource();
            main.userSource = new _.UserSource();
            // Render dynamically composed views
            main.actionsView.render();
            main.listView.render();
            // Initial data requests for auth styles and services
            main.authStyleSource.findAll(function(data) {
                main.authStyles = data;
                main.populateServices();
            });
        });

    };

    protect.buildActionsView = function() {

        var main = this;

        // Set up a new view
        var actionsView = new _.ActionsView();

        // Respond to relevant events

        actionsView.addListener('add-service', function(data) {
//            alert("add-service listener, data=" + JSON.stringify(data));
            var service = main.serviceSource.create();
            main.entryView = main.buildEntryView(service);
            main.headersView = main.buildHeadersView(service);
            main.listView.hide();
            main.entryView.render();
            main.populateHeaders(service, -1);
            main.headersView.render();
            main.entryView.show();
        });

        actionsView.addListener('filter-services', function(data) {
//            alert("filter-services listener, data=" + JSON.stringify(data));
            if (!main.filtersViewShowing) {
                var selectedUser = main.userSource.getUser(main.serviceSource.getUserFilter());
                main.filtersView = main.buildFiltersView(main.serviceSource.getTagFilter(), selectedUser);
                main.filtersView.render();
                $j("#render-filters-div").show();
                $j("#filter-services").addClass("adding");
                main.filtersViewShowing = true;
            }
            else {
                $j("#filter-services").removeClass("adding");
                $j("#render-filters-div").hide();
                main.filtersViewShowing = false;
                main.serviceSource.setTagFilter([]);
                main.serviceSource.setUserFilter(-1);
                main.populateServices();
            }
            main.actionsView.setFilterTooltip(main.filtersViewShowing);
        });

        // Return the composed view
        return actionsView;
        
    };

    protect.buildEntryView = function(service) {

        var main = this;

        // Retrieve the related data for this service
        var groups = [];
        if (service.groups) {
            groups = main.groupSource.getGroups(service.groups);
        }
        var owners = [];
        if (service.owners) {
            owners = main.userSource.getUsers(service.owners);
        }
        var users = [];
        if (service.users) {
            users = main.userSource.getUsers(service.users);
        }

        // Set up a new view for this service
        var entryView = new _.EntryView(service, main.authStyles,
                                        groups, owners, users);

        // Respond to relevant events

        entryView.addListener('cancel-service', function(data) {
//            alert("cancel-service listener, data=" + JSON.stringify(data));
            main.entryView.hide();
            main.populateServices();
            main.listView.show();
        });

        entryView.addListener('save-service', function(data) {
//            alert("save-service listener, data=" + JSON.stringify(data));
            if (main.entryView.validate()) {
                var service = data.service;
                main.entryView.populate(service);
                main.serviceSource.save(service, function(message) {
                    if (message) {
                        alert(message); // TODO - visualize in UI somehow?
                    }
                    else {
                        main.entryView.hide();
                        main.populateServices();
                        main.listView.show();
                    }
                });
            }
        });

        entryView.addListener('test-service', function(data) {
//            alert("test-service listener, data=" + JSON.stringify(data));
            if (main.entryView.validate()) {
                // We have to save the service to the server before we can test it
                var service = data.service;
                main.entryView.populate(service);
                main.serviceSource.save(service, function(message) {
                    if (message) {
                        alert(message); // TODO - visualize in UI somehow?
                    }
                    else {
                        main.serviceSource.test(service, function(message) {
                            main.entryView.testResults(message);
                        })
                    }
                });
            }
            else {
                main.entryView.testResults("Cannot test until validation errors have been fixed");
            }
        });

        // Return the composed view
        return entryView;

    };

    protect.buildFiltersView = function(selectedTags, selectedUser) {

        var main = this;

        // Set up a new view for the filters
        var filtersView = new _.FiltersView(selectedTags, selectedUser);

        // Respond to relevant events

        filtersView.addListener('remove-filter', function(data) {
//            alert("remove-filter listener, data=" + JSON.stringify(data));
            var tags = main.serviceSource.getTagFilter();
            tags = main.removeTag(tags, data.tag);
            main.serviceSource.setTagFilter(tags);
            main.populateServices();
            var selectedUser = main.userSource.getUser(main.serviceSource.getUserFilter());
            main.filtersView = main.buildFiltersView(main.serviceSource.getTagFilter(), selectedUser);
            main.filtersView.render();
        });

        filtersView.addListener('tag-chooser', function(data) {
//            alert("tag-chooser listener, data=" + JSON.stringify(data));
            var availableTags = main.serviceSource.getUniqueTags();
            var selectedTags = main.serviceSource.getTagFilter();
            main.tagsView = main.buildTagsView(availableTags, selectedTags);
            main.tagsView.render();
        });

        filtersView.addListener('user-chooser', function(data) {
//            alert("user-chooser listener, data=" + JSON.stringify(data));
            main.serviceSource.setUserFilter(data.userID);
            main.populateServices();
        });

        // Return the composed view
        return filtersView;

    };

    protect.buildHeaderView = function(index, service, editing) {

        var main = this;

        // Set up a new view for this header
        var headerView = new _.HeaderView(index, service, editing);

        // Respond to relevant events

        if (editing) {

            headerView.addListener('edit-header-cancel', function(data) {
//                alert("edit-header-cancel listener, data=" + JSON.stringify(data));
                main.populateHeaders(service, -1);
                main.headersView.setAddFocus();
            });

            headerView.addListener('edit-header-save', function(data) {
//                alert("edit-header-save listener, data=" + JSON.stringify(data));
                service.headers[index].name = headerView.getEditName();
                service.headers[index].value = headerView.getEditValue();
                main.populateHeaders(service, -1);
                main.headersView.setAddFocus();
            });

        }
        else {

            headerView.addListener('edit-header', function(data) {
//                alert("edit-header listener, data=" + JSON.stringify(data));
                main.populateHeaders(service, index);
                main.headersView.setEditFocus();
             });

            headerView.addListener('remove-header', function(data) {
//                alert("remove-header listener, data=" + JSON.stringify(data));
                var confirmation = confirm("Are you sure you want to header '" + service.headers[data.index].name + "'?");
                if (confirmation) {
                    var prefix = service.headers.slice(0, data.index);
                    var suffix = service.headers.slice(data.index + 1);
                    service.headers = prefix.concat(suffix);
                    main.populateHeaders(service, -1);
                }
            });

        }

        // Return the composed view
        return headerView;

    };

    protect.buildHeadersView = function(service) {

        var main = this;

        // Set up a new view for this service
        var headersView = new _.HeadersView(service);

        // Respond to relevant events

        headersView.addListener('add-header', function(data) {
//            alert("add-header listener, data=" + JSON.stringify(data));
            headersView.showAddHeaderRow();
        });

        headersView.addListener('add-header-add', function(data) {
//            alert("add-header-add listener, data=" + JSON.stringify(data));
            var header = {
                name : $j("#settings-add-header-name").val(),
                value : $j("#settings-add-header-value").val()
            };
            data.service.headers.push(header);
            main.populateHeaders(data.service, -1);
            headersView.hideAddHeaderRow();
        });

        headersView.addListener('add-header-cancel', function(data) {
//            alert("add-header-cancel listener, data=" + JSON.stringify(data));
            headersView.hideAddHeaderRow();
        });

        // Return the composed view
        return headersView;

    };

    protect.buildItemView = function(index, service) {

        var main = this;

        // Set up a new view for this service (per service, so not global to the main object)
        var itemView = new _.ItemView(index, service);

        // Respond to relevant events

        itemView.addListener('delete-service', function(data) {
//            alert("delete-service listener, data=" + JSON.stringify(data));
            var confirmation = confirm("Are you sure you want to remove this service?");
            if (confirmation) {
                var service = data.service;
                main.serviceSource.remove(service, function(message) {
                    if (message) {
                        alert(message); // TODO - visualize in UI somehow?
                    }
                    main.populateServices();
                });
            }
        });

        itemView.addListener('edit-service', function(data) {
//            alert("edit-service listener, data=" + JSON.stringify(data));
            main.entryView = main.buildEntryView(data.service);
            main.headersView = main.buildHeadersView(data.service);
            main.listView.hide();
            main.entryView.render();
            main.populateHeaders(data.service, -1);
            main.headersView.render();
            main.entryView.show();
        });

        itemView.addListener('update-enabled', function(data, promise) {
            data.service.enabled = data.enabled;
            main.serviceSource.updateEnabled(data.service, function() {
                promise.emitSuccess();
            })
        });

        // Return the composed view
        return itemView;

    };

    protect.buildListView = function() {

        var main = this;

        // Set up a new view
        var listView = new _.ListView();

        // Respond to relevant events

        // Return the composed view
        return listView;

    };

    protect.buildTagsView = function(availableTags, selectedTags) {

        var main = this;

        // Set up a new view
        var tagsView = new _.TagsView(availableTags, selectedTags);

        // Respond to relevant events

        tagsView.addListener('select-tags', function(data) {
//            alert("select-tags listener, data=" + JSON.stringify(data));
            main.serviceSource.setTagFilter(data.selectedTags);
            main.populateServices();
            var selectedUser = main.userSource.getUser(main.serviceSource.getUserFilter());
            main.filtersView = main.buildFiltersView(main.serviceSource.getTagFilter(), selectedUser);
            main.filtersView.render();
        });

        // Return the composed view
        return tagsView;

    };

    // editIndex is the row we are editing, or -1 if no row is being edited
    protect.populateHeaders = function(service, editIndex) {
        var main = this;
        main.headersView.erase();
        var index = 0;
        $j(service.headers).each(function (index, header) {
            var headerView = main.buildHeaderView(index, service, index == editIndex);
            main.headersView.append(headerView.getContent());
            index++;
        });
        main.headersView.showNoHeadersMessage(service);
    };

    protect.populateServices = function() {
        var main = this;
        main.listView.erase();
        var index = 0;
        main.serviceSource.findAll(function(services) {
            $j(services).each(function (index,service) {
                var itemView = main.buildItemView(index, service);
                main.listView.append(itemView.getContent());
                index++;
            });
        });
    };

    // Remove the specified "tag" from "tags" and return the updated list
    protect.removeTag = function(tags, tag) {
        var results = [];
        $j(tags).each(function(index, value) {
            if (!(tag == value)) {
                results.push(value);
            }
        });
        return results;
    };

});
