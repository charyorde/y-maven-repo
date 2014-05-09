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
 * Displays a list of suggested completions in a popover.
 *
 * @extends jive.AbstractView
 *
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 * @depends path=/resources/scripts/jquery/jquery.autocomplete.js
 */
jive.Filters.Suggestions = jive.AbstractView.extend(function(protect) {
    var $ = jQuery
      , _ = jive.Filters;

    protect.init = function(context) {
        this.context = context;
        this.hidden = true;
    };

    this.render = function(content) {
        var view = this;

        if (this.hidden && this.context.is(':visible')) {
            this.content = $(content);
            this.keyTargets = $(this.context).add(this.content);
            this.keyHandler = this.handleKeydown.bind(this);

            this.selectedIndex = 0;

            this.content.delegate('.js-suggestion a', 'click', function(e) {
                var value = $(this).data('value');
                view.emitSelection(value);
                e.preventDefault();
            });

            this.content.bind('focus click', function() {
                view.emit('focus');
            });

            this.content.autocomplete({
                context: this.context,
                addClass: 'j-autocomplete'
            });

            this.context.prop('autocomplete', 'off');

            // Keep track of whether the popover is open.
            this.content.one('close', function() {
                view.hide();
            });

            this.keyTargets.keydown(this.keyHandler);

            this.hidden = false;
        }
    };

    this.hide = function() {
        if (!this.hidden) {
            this.content.trigger('close');
            this.keyTargets.unbind('keydown', this.keyHandler);
            this.emit('blur');
            this.emit('close');

            this.hidden = true;
        }
    };

    this.isVisible = function() {
        return !this.hidden;
    };

    this.html = function(content) {
        if (content) {
            this.content.html(content);

            // Re-applies "j-selected" class to appropriate suggestion.
            var index = this.selectedIndex
              , current = $('.js-suggestion:visible:nth-child('+ index +') a', content);

            if (index > 0) {
                current.addClass('j-selected');
            }

        } else {
            return this.content.children();
        }
    };

    protect.handleKeydown = function(event) {
        switch(event.keyCode) {
            case $.ui.keyCode.UP:
                this.selectPrevious();
                event.preventDefault();
                break;
            case $.ui.keyCode.DOWN:
                this.selectNext();
                event.preventDefault();
                break;
            case $.ui.keyCode.TAB:
                this.hide(); //dismiss the dialog and go to the next control.  Don't preventDefault, for accessibility reasons.
                break;
            case $.ui.keyCode.ENTER:
                this.selectCurrent();
                event.preventDefault();
                break;
            case $.ui.keyCode.ESCAPE:
                this.hide();
                event.preventDefault();
                break;
        }
    };

    protect.incrementSelection = function(n) {
        var index = this.selectedIndex + n
          , next = this.content.find('.js-suggestion:visible:nth-child('+ (index) +') a');

        if (next.length > 0 && index > 0) {
            this.content.find('.j-selected').removeClass('j-selected');
            next.addClass('j-selected');
            this.selectedIndex = index;
        }
    };

    protect.resetSelection = function() {
        this.selectedIndex = 0;
        this.content.find('.j-selected').removeClass('j-selected');
    };

    protect.selectNext = function() {
        this.incrementSelection(1);
    };

    protect.selectPrevious = function() {
        this.incrementSelection(-1);
    };

    protect.selectCurrent = function() {
        var current = this.content.find('.js-suggestion:visible a.j-selected')
          , view = this;

        if (current.length > 0) {
            this.emitSelection(current.data('value'));
        }
    };

    protect.emitSelection = function(value) {
        var view = this;

        this.emitP('selection', value).addCallback(function() {
            view.resetSelection();
        });
    };
});
