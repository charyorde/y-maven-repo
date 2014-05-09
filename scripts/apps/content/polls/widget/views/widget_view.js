/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Represent an item in the activity stream list
 *
 * @depends template=jive.eae.poll.common.voteCount
 * @depends template=jive.polls.widget.soy.errorWithLink
 * @depends template=jive.polls.widget.soy.error
 * @depends template=jive.polls.widget.soy.poll
 * @depends template=jive.polls.widget.soy.voteProcessing
 *
 */
jive.namespace('PollWidget');

jive.PollWidget.WidgetView = function(widgetElement, options) {

    // Mixes in `addListener` and `emit` methods so that other classes can
    // listen to events from this one.
    jive.conc.observable(this);

    var poll,
        pollID = options.pollID,
        pollIndex = 0,
        nextIndex,
        prevIndex,
        moreUrl = options.moreUrl,
        widgetID = options.widgetID,
        createUrl = options.createUrl,
        that = this;

    /**
     * Called after setContent() when new content is successfully loaded.
     */
    function next() {
        $j(widgetElement).find('#load-indicator').hide();
        return this;

    }

    /**
     * Called after setContent() when new content is successfully loaded.
     */
    function previous() {
        $j(widgetElement).find('#load-indicator').hide();
        return this;
    }

    /**
     * Called after setContent() when new content is successfully loaded.
     */
    function vote(poll) {
        var $pollWidget = $j(widgetElement);
        $pollWidget.find("input#vote").prop('disabled', false);
        // Update vote count in activity streams
        if ($pollWidget.closest('div.js-full-content-container').length && poll.votesCount) {
            var $voteCount = $pollWidget.closest('div.js-full-content-container').find('.j-act-poll-votect');
            $voteCount.html(jive.eae.poll.common.voteCount({numOfVotes: poll.votesCount}));
        }
        return this;
    }

    /**
     * Sets the poll content to render for this view.
     * @param data the poll to render
     */
    function setContent(data) {
        poll = data;
        pollID = poll.id;
        pollIndex = poll.index;
        renderView();
    }

    function displayError(message, displayCreateLink) {
    	var output;
    	if (displayCreateLink) {
    		output = jive.polls.widget.soy.errorWithLink({createUrl:createUrl});
    	}
    	else {
    		output = jive.polls.widget.soy.error({message:message});
    	}
        $j(widgetElement).html(output);
    }

    function getDOMElement() {
        return $j(widgetElement);
    }

    function renderView() {

        var output = jive.polls.widget.soy.poll({
            poll: poll,
            moreUrl: moreUrl,
            widgetID: widgetID
        });

        $j(widgetElement).html(output);
    }

    /* ** public interface ** */

    this.next = next;
    this.previous = previous;
    this.vote = vote;
    this.setContent = setContent;
    this.displayError = displayError;

    $j(document).ready(function() {

        $j(widgetElement)
        .find('.j-pgnav-next').live('click', function() {
            nextIndex = ($j(this).attr('id') || '').split('-').last();
            $j(widgetElement).find('#load-indicator').fadeIn('fast');
            that.emit('next', nextIndex);
            return false;
        }).end()
        .find('.j-pgnav-prev').live('click', function() {
            prevIndex = ($j(this).attr('id') || '').split('-').last();
            $j(widgetElement).find('#load-indicator').fadeIn('fast');
            that.emit('previous', prevIndex);
            return false;
        }).end()
        .find('.jive-poll-votebtn').live('click', function() {
            var optionIndex = $j(widgetElement).find('input[type=radio]:checked');
            if (optionIndex.is('*')) {
                $j(widgetElement).find("input#vote").val(jive.polls.widget.soy.voteProcessing()).prop('disabled', true);
                that.emit('vote', pollID, optionIndex.val(), pollIndex);
            }
            else {
                $j(widgetElement).find(".jive-warn-box").fadeIn('fast');
            }
            return false;
        });

        /* handle the sweet fancy check boxes that overlay on top of the radio buttons,
         * (this is only used in the activity streams for the widget view) */
        $j(widgetElement).find('.j-poll-stream ol li input:radio').each(function() {
            var $input = $j(this);
            var $box = $j('<a href="#" class="j-vote-box j-ui-elem j-empty-check" />');
            var $label = $j(this).closest('li').find('label');

            $input.css('opacity', '0').after($box);

            if ($input.is(':disabled')) {
                $box.removeClass('j-empty-check').addClass('j-disabled');
            }
            /* bind events - mouse */
            if (!$input.is(':disabled')) {
                $box.add($label)

                .hover(function() {
                    hoverItem($label, $box, $input);
                }, function() {
                    unHoverItem($label, $box, $input);
                });
                $box.click(function(e) {
                    $input.trigger('click');
                    e.preventDefault();
                });
            }

            /* bind events - keyboard / select */
            $input.focusin(function() {
                hoverItem($label, $box, $input);
            }).focusout(function() {
                unHoverItem($label, $box, $input);
            });

            /* FYI .click handles both keyboard and mouse. WTG browsers */
            $input.click(function() {
                selectItem($label, $box, $input);
            })

        });

        function hoverItem($label, $box, $input) {
            $label.addClass('font-color-link');
            $box.addClass('hover');
        }
        function unHoverItem($label, $box, $input) {
            $label.removeClass('font-color-link');
            $box.removeClass('hover');
        }
        function selectItem($label, $box, $input) {


            var $check = $j('<span class="j-vote-box j-ui-elem j-check popped" />');
            var $parent = $box.closest('ol');


            $parent.find('.j-check').remove();
            $parent.find('.j-choice').removeClass('j-choice');
            $parent.find('.font-color-okay').removeClass('font-color-okay');

            $box.after($check);
            $box.closest('li').addClass('j-choice').find('label').addClass('font-color-okay');

        }
    });

}
