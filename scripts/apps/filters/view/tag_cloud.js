/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('Filters');  // Creates the jive.Filters namespace if it does not already exist.

/**
 * Displays a tag cloud.
 *
 * @depends path=/resources/scripts/jquery/jquery.lightbox_me.js
 * @depends template=jive.browse.tagautocomplete.tagCloud
 */
jive.Filters.TagCloud = jive.AbstractView.extend(function(protect) {
    var $ = jQuery;

    protect.init = function(element) {
        var view = this;

        $(element).parent().find('.js-open-tag-cloud').click(function(event) {
            view.emit('cloud');
            event.preventDefault();
        });
    };

    this.show = function(tagPromise, selected, maxCount) {
        var promise = new jive.conc.Promise()
          , view = this;

        this.showSpinner();

        tagPromise.addCallback(function(availableTags) {
            view.hideSpinner();

            view.render({
                availableTags: availableTags,
                selectedTags: selected,
                maxCount: maxCount
            });

            view.content.lightbox_me({
                destroyOnClose: true,
                onClose: function() {
                    promise.emitSuccess(view.getTags());
                }
            });
        });

        return promise;
    };

    this.render = function(data) {
        this.content = $(jive.browse.tagautocomplete.tagCloud(data));

        this.content.find('.js-tag a').click(function(event) {
            $(this).closest('.js-tag').toggleClass('js-selected');
            event.preventDefault();
        });
    };

    protect.getTags = function() {
        return this.content.find('.js-selected').toArray().map(function(tag) {
            return $(tag).data('value');
        });
    };
});
