/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('FollowUserApp');

/**
 * Displays dots on browse cards and rows for each label applied to
 * a connection.
 *
 * @extends jive.AbstractView
 * @depends template=jive.browse.user.labelDot
 */
jive.FollowUserApp.LabelsView = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    protect.init = function(userID) {
        var users = $('.js-browse-thumbnail, .js-browse-row');
        if (userID) {
            users = users.filter('[data-object-id="'+ userID +'"]');
        }
        this.content = users.find('.j-label-dot-list');
    };

    /*
     * Adds a label dot based on the given label object.
     */
    this.add = function(label) {
        var indicator = $(jive.browse.user.labelDot(label));
        if (this.get(label.id).length < 1) {
            this.content.append(indicator);
        }
    };

    /*
     * Removes any label dots that correspond to the given label object.
     */
    this.remove = function(label) {
        var indicator = this.get(label.id);
        indicator.remove();
    };

    /*
     * Re-renders any label dots that correspond to the given label
     * object to reflect new color and so forth.
     */
    this.update = function(label) {
        var indicator = this.get(label.id);
        indicator.each(function() {
            var updated = $(jive.browse.user.labelDot(label));
            $(this).replaceWith(updated);
        });
    };

    protect.get = function(id) {
        return this.content.find('.j-label-dot[data-list-id="'+ id +'"]');
    };
});
