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
 * Handles display of the selected tags criteria for subsetting the services list
 *
 * @depends template=jive.admin.apps.services.tags scope=client
 *
 * @class
 * @extends jive.admin.apps.services.AbstractView
 */
jive.admin.apps.services.TagsView = jive.admin.apps.services.AbstractView.extend(function(protect) {

    this.init = function(availableTags, selectedTags) {

        // Save a self reference
        var tagsView = this;

        // Calculate our custom "tags" data structure
        var tags = [ ];
        $j(availableTags).each(function(index, availableTag) {
            if ($j.inArray(availableTag, selectedTags) >= 0) {
                tags.push({ tag : availableTag, checked : true });
            }
            else {
                tags.push({ tag : availableTag, checked : false });
            }
        });

        // Define the DOM content of this view
        this.content = $j(jive.admin.apps.services.tags({ tags : tags }));

        // Define event handlers

        this.content.find("input[type='checkbox']").click(function() {
            if ($j(this).is(":checked")) {
                $j(this).closest("li").addClass("checked");
            }
            else {
                $j(this).closest("li").removeClass("checked");
            }
        });

        this.content.find(".jive-form-lookup").click(function() {
            var selectedTags = [ ];
            tagsView.content.find("input[type='checkbox']").each(function(index, checkbox) {
                if ($j(this).is(":checked")) {
                    selectedTags.push($j(this).attr("data-tag"));
                }
            });
            var data = { selectedTags : selectedTags };
//            alert("select-tags listener, data=" + JSON.stringify(data));
            tagsView.emit('select-tags', data);
        });

     };

    this.getContent = function() {
        return this.content;
    };

    this.render = function() {
        var tagsView = this;
        $j("#render-tags-div").html("").html(tagsView.getContent()).lightbox_me().show();
        this.content.find(".jive-form-lookup").addClass("jive-modal-close").addClass("close"); // Close when "Continue" is clicked
    };

});
