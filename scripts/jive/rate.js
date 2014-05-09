/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2009 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.Rate = function(containerType, containerID, objectType, objectID, shortObjectType, i18n, allowComments, guid, rteOptions) {

    var RATE_ENDPOINT = jive.rest.url("/rating/" + objectType + "/" + objectID);

    var ratingInfo;
    var userRating;
    var ratingDescription;
    var inProgress;
    var scores;
    var commentable;
    var $container;

    $j.getJSON(RATE_ENDPOINT, function(data) {
        ratingInfo = data.ratingInfo;
        initRatings();
        findContainer();
        initHtml();

        if (commentable) {
            var options = {body: "", element: $container, i18n:i18n, containerType: containerType, containerID: containerID, resourceType: objectType, resourceID: objectID, rteOptions: rteOptions};
            new jive.Rate.Main(options);
        }
    });

    /**
     * Finds the div that holds the html representing this Rate instance and
     * stores a reference to it.
     */
    function findContainer() {
        if (guid) {
            $container = $j('.jive-content-rating[data-guid="'+ guid +'"]');
        } else {
            $container = $j('#jive-content-rating');
        }
    }

    function initRatings() {
        userRating = (ratingInfo.ratedByUser && ratingInfo.userRating.score > 0) ? ratingInfo.userRating.score : 0;
        ratingDescription = ratingInfo.userRating ? ratingInfo.userRating.description : '';
        inProgress = false;
        scores = ratingInfo.availableRatings;
        commentable = ratingInfo.commentable && allowComments;
    }

    function update() {

        $j.getJSON(RATE_ENDPOINT + "/mean", function(data) {
            updateMeanRating(data);
        });

        $j.getJSON(RATE_ENDPOINT + "/count", function(data) {
            updateRatingCount(data);
        });
        
        return false;
    }

    function updateMeanRating(data) {
        // change the title of the span to reflect the new mean rating
        $container.find('.jive-content-avgrating-score').attr('title', i18n.avgUserRatingLabeli18n + ': ' + data);

        // loop though each mean rating icon and change according to the new mean rating
        $j.each(scores, function(i, rating) {
            $container.find('.jive-icon-avgrating-' + rating.score)
                .toggleClass('jive-icon-rate-avg-on', data >= rating.score)
                .toggleClass('jive-icon-rate-avg-half', data < rating.score && data >= rating.score - 0.50)
                .toggleClass('jive-icon-rate-avg-off', data < rating.score - 0.50);
        });
    }

    function updateRatingCount(data) {
        // update the rating count based on the new rating
        var ratingString = (data == 1) ? i18n.rateRatingLabel : i18n.rateRatingsLabel;
        $container.find('.jive-content-avgrating-count').text('(' + data + ' ' + ratingString + ')');
    }

    function addRating(score) {
        inProgress = true;

        // show saving message
        var $saving = $container.find('.j-rating-comment-instruct .font-color-okay strong')
        $saving.html(i18n.rateSavingText);

        if (!$container.find('.j-rating-container').hasClass('j-rating-container-active')) {
            $container.find(".j-rating-container").addClass("j-rating-container-active");
            if (!$container.find('.j-rating-container').hasClass('j-rating-container-active-tab')) {
                $container.find(".j-rating-comment-instruct").css('opacity', '0').animate({width: 'toggle', opacity: 1}, 500);
            }
        }
        
        // dwr call to add rating
        $j.post(RATE_ENDPOINT, {'score':score}, function() {
            update();

            userRating = score;
            showUserRating(score);

            // changed saving message to saved
            $saving.html(i18n.rateSavedText);

            // hide saved message
            if(!commentable) {
                $container.find('.j-rating-comment-instruct').fadeOut(2500, function() {
                    $container.find(".j-rating-container").removeClass("j-rating-container-active");
                });
            }

            inProgress = false;
        });
    }

    function showUserRating(score) {
        $j.each(scores, function(i, rating) {
            if (score == 0) {
                $container.find('.jive-content-userrating-desc').html('');
            }
            if (score == rating.score) {
                $container.find('.jive-content-userrating-desc').html(rating.description);
            }
            $container.find('.jive-icon-userrating-'+ rating.score)
                .toggleClass('jive-icon-rate-usr-on', score >= rating.score)
                .toggleClass('jive-icon-rate-usr-off', score < rating.score);
        });
    }

    function initHtml() {
        var output = jive.rate.soy.renderRating({
            ratingInfo: ratingInfo,
            i18n: i18n
        });

        if (ratingInfo.rateable) {
            output += jive.rate.soy.renderUserRating({
                ratingInfo: ratingInfo,
                userRating: userRating,
                commentable: commentable,
                ratingDescription: ratingDescription,
                i18n: i18n
            });
        }

        $container.append(output);
        $container.find('.jive-content-userrating').show();

        $j.each(ratingInfo.availableRatings, function(i, availableRating) {
            $container.find('.jive-icon-userrating-' + availableRating.score).bind('click', function() {
                addRating(availableRating.score);
            });

            $container.find('.jive-icon-userrating-' + availableRating.score).hover(
                function() {
                    showUserRating(availableRating.score);
                },
                function() {
                    showUserRating(userRating);
                }
            );
        });
    }
};
