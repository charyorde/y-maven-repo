/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace('PublishBar');

/**
 * Handles UI for a list of places in the publish bar places option.
 *
 * emits "search", "browse", "suggest", "selectPlace"
 *
 * @extends jive.AbstractView
 * @param {jQuery|Element|String} input search field
 * @param {jQuery|Element|String} target element in which to render search results
 *
 * @depends path=/resources/scripts/apps/shared/views/typeahead_input.js
 * @depends template=jive.publishbar.placeSearchResults scope=client
 */
jive.PublishBar.PlaceView = jive.oo.Class.extend(function(protect) {
    jive.conc.observable(this);

    this.init = function(input, searchTarget) {
        var view = this;
        this.$searchTarget = $j(searchTarget);
        this.$input = $j(input);


        // handle focus/blur on the place picker control
        this.$input.focus(function() {
            var container   = $j('#js-visibility-place')[0],
                hideResults = view.clearContainerResults.bind(view).delayed(250);

            // hide the results if the click took place outside of the container element
            $j(document.body).off('click.placeViewInput').on('click.placeViewInput', function(e) {
                if (!$j.contains(container, e.target)) {
                    $j(document.body).off('click.placeViewInput');
                    hideResults();
                }
            });
        });


        // add events to place input box
        $j(input).each(function() {
            // show suggested containers on focus
            $j(this).focus(function() {
                if (!$j(this).val() || $j(this).val().trim() == '') {
                    view.emitP('suggest').addCallback(function(data) {
                        view.showContainerResults($j.extend({suggested: true}, data));
                    });
                }
                else {
                    view.emitP('search', $j(this).val()).addCallback(function(data) {
                        view.showContainerResults($j.extend({suggested: false}, data));
                    });
                }
            });

            var typeahead = new jive.TypeaheadInput(this);
            typeahead.addListener('change', function(value) {
                view.emitP('search', value).addCallback(function(data) {
                    view.showContainerResults($j.extend({suggested: false}, data));
                });
            });

            // JIVE-16404: Allow the use of arrow keys to select a place to put content
            $j(this).keydown(function(event) {
                switch (event.keyCode) {
                    case $j.ui.keyCode.UP:
                        view.highlightPrev();
                        return false;
                    case $j.ui.keyCode.DOWN:
                        // move down
                        view.highlightNext();
                        return false;
                    case $j.ui.keyCode.ESCAPE:
                        view.clearContainerResults();
                        return false;
                    case $j.ui.keyCode.ENTER:
                        var $targetContainer = view.findSelectedItem();
                        if ($targetContainer.length) {
                            view.selectPlace($targetContainer.attr('data-objecttype'), $targetContainer.attr('data-objectid'));
                        }
                        event.preventDefault();
                        return false;
                }
                return true;
            });

        });

        $j('#js-publishbar-place-browse').click(function(e) {
            view.emit('browse');
            e.preventDefault();
        });
    };

    protect.clearContainerResults = function() {
        this.$searchTarget.empty().hide();
        this.$input.val('');
    };

    // used to show search results
    protect.showContainerResults = function(data) {
        var view = this;

        // clear any previous results
        if (view.searchResults) {
            view.searchResults.remove();
        }

        // add search results to dom
        view.searchResults = $j(jive.publishbar.placeSearchResults($j.extend({
            communityFeatureVisible: jive.global.communityFeatureVisible
        }, data)));
        view.$searchTarget.empty().append(view.searchResults).show();

        // handle click on results.
        view.$searchTarget.find('a.js-target-container').click(function(e) {
            var $targetContainer = $j(this);
            view.selectPlace($targetContainer.attr('data-objecttype'), $targetContainer.attr('data-objectid'));
            e.preventDefault();
        });


    };


    // JIVE-16404: Some helpful methods that support arrow key scrolling through
    // the places list
    this.findSelectedItem = function () {
        return this.$searchTarget.find('a.j-selected');
    };

    this.highlightFirst = function () {
        this.findSelectedItem().removeClass('j-selected');
        this.$searchTarget.find('a.js-target-container:first').addClass('j-selected');
    };

    this.highlightLast = function() {
        this.findSelectedItem().removeClass('j-selected');
        this.$searchTarget.find('a.js-target-container:last').addClass('j-selected');
    }

    this.highlightNext = function() {
        var that = this;
        var $item = that.findSelectedItem();
        if ($item.parent().nextAll().find('a.js-target-container').length) {
            $item.removeClass('j-selected');
            $item.parent().nextAll().find('a.js-target-container').first().addClass('j-selected');
        } else {
            $item.removeClass('j-selected');
            that.highlightFirst();
        }
    }

    this.highlightPrev = function() {
        var that = this;
        var $item = that.findSelectedItem();
        if ($item.parent().prevAll().find('a.js-target-container').length) {
            $item.removeClass('j-selected').parent().prevAll().find('a.js-target-container').first().addClass('j-selected');
        } else {
            $item.removeClass('j-selected');
            that.highlightLast();
        }
    }


    // used to render the place view after a place is selected.
    this.selectPlace = function(containerType, containerID) {
        this.emit('selectPlace', containerType, containerID);
    };
});
