/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * jive.PollView
 *
 * View class representing a viewable poll.  Create an instance of this class
 * with a DOM element representing a viewable poll option as an argument.  The instance will
 * set up event listeners for that poll option and will provide rendering helpers.
 *
 * Mixes in jive.conc.observable.
 *
 * @depends template=jive.polls.view.soy.results
 * @depends template=jive.polls.view.soy.renderCount
 * @depends template=jive.polls.view.soy.renderProcessing
 * @depends template=
 * @depends template=
 * @depends template=
 */

jive.namespace('PollView');

jive.PollView.PollFormView = function(pollElement, options) {

    // Mixes in `addListener` and `emit` methods so that other classes can
    // listen to events from this one.
    jive.conc.observable(this);

    var     that = this,
            pollID = options.pollID,
            poll;

    /**
     * Sets the poll content to render for this view.
     * @param data the poll to render
     */
    function setContent(data) {
        poll = data;
    }

    /**
     * Toggles the results section of the form.
     */

    function adjustPollCounts() {
            /* handle the positioning of the result numbers */
            $j('.j-vote-count').each(function() {
                var $that = $j(this);
                var myWidth = parseInt($that.outerWidth());
                var barWidth = parseInt($that.parent('.j-val-poll-bar').outerWidth());

//                console.log(myWidth);
//                console.log(barWidth);
                if (!(myWidth + 36 < barWidth) && myWidth != 0 && barWidth != 0) {
//                    console.log('adjusting');
                    $that.css({'right': Math.min(-(myWidth + 9), -27) + 'px', 'text-shadow': '0 1px 1px white'});
                    $that.addClass('font-color-normal').removeClass('font-color-white');

                }
            })
        };

    function results(mode) {
//        console.log('resultsmode');
        if (mode == "showOptions") {
            $j(pollElement).find('.jive-poll-vote-list').hide();
            $j(pollElement).find('.jive-poll-results-lists').fadeIn('fast');
            $j(pollElement).find('.jive-poll-optionstgle').fadeIn('fast');
            $j(pollElement).find('.jive-poll-resulttgle').hide();
            $j(pollElement).find('.j-poll-buttons #vote').prop('disabled', true);
            $j(pollElement).find('.jive-warn-box').hide();
        }
        else
        {
            $j(pollElement).find('.jive-poll-vote-list').fadeIn('fast');
            $j(pollElement).find('.jive-poll-results-lists').hide();
            $j(pollElement).find('.jive-poll-optionstgle').hide();
            $j(pollElement).find('.jive-poll-resulttgle').fadeIn('fast');
            $j(pollElement).find('.j-poll-buttons #vote').prop('disabled', false);
        }
        adjustPollCounts();
        return false;

    }

    /**
     * Displays the results section after a vote, shows confirmation message.
     */
    function vote() {

        // display the success message
        $j(pollElement).find('.jive-success-box-vote').fadeIn('fast').delay(6000).fadeOut("slow");

        // hide the vote form
        $j(pollElement).find('.jive-warn-box-vote').hide();
        $j(pollElement).find('.jive-poll-vote-list').hide();
        $j(pollElement).find('.jive-poll-resulttgle').hide();
        $j(pollElement).find('.jive-poll-votebtn').hide();

        // show the vote complete text
        $j(pollElement).find('.jive-poll-vote-complete').fadeIn('fast');

        // render the vote results
        var output = jive.polls.view.soy.results({poll: poll});
        $j(pollElement).find('.jive-poll-results-lists').html(output);
        $j(pollElement).find('.jive-poll-results-lists').fadeIn('fast');

        // update the vote count
        var countOutput = jive.polls.view.soy.renderCount({count: poll.votesCount});
        $j(pollElement).find('.jive-vote-count').html(countOutput);
        adjustPollCounts();
    }

    /* ** public methods ** */
    this.results = results;
    this.vote = vote;
    this.setContent = setContent;

    $j(document).ready(function() {

        $j(pollElement)
        .find('div.jive-success-box').delay(2000).fadeOut("slow").end()
        .find('.jive-poll-votebtn').click(function() {
            var optionIndex = $j(pollElement).find('input.vote[type="radio"]:checked');
            if (optionIndex.is('*')) {
                var processingOutput = jive.polls.view.soy.renderProcessing();
                $j(pollElement).find("input#vote").val(processingOutput).prop('disabled', true);
                that.emit('vote', pollID, optionIndex.val());
            }
            else {
                $j(pollElement).find('.jive-warn-box-vote').show();
            }
            return false;
        }).end()
        .find('.jive-poll-results-toggle').click(function() {
            that.results('showOptions');
            return false;
        }).end()
        .find('.jive-poll-options-toggle').click(function() {
            that.results('showVotes');
            return false;
        });

        /* handle the sweet fancy check boxes that overlay on top of the radio buttons */
        $j('.j-poll-view ul li input:radio').each(function() {
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
            var $parent = $box.closest('ul');


            $parent.find('.j-check').remove();
            $parent.find('.j-choice').removeClass('j-choice');
            $parent.find('.font-color-okay').removeClass('font-color-okay');

            $box.after($check);
            $box.closest('li').addClass('j-choice').find('label').addClass('font-color-okay');

        }


        adjustPollCounts();





    });
}

