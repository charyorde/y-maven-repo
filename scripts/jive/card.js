/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Avatar/space card hover functionality.  There are two possible hover types:
 *      user       - identified by .jiveTT-hover-user
 *      container  - identified by .jivecontainerTT-hover-container
 *
 * This module emits three events:
 *      cardShow   - triggered when the user has indicated they would like a card to be displayed
 *      cardShown  - triggered after the card has been shown
 *      cardHidden - triggered after the card has been hidden
 * The cardShow and cardShown events pass a descriptor as the second argument to any listeners which contains a
 * type (user or container) and any type-specific information.
 *
 * Related posts:
 *      Implementation details (UPCOMING)
 *      IE7 and Supernote (https://brewspace.jiveland.com/docs/DOC-80840)
 *
 * @depends path=/resources/scripts/json/json2.js
 * @depends path=/resources/scripts/jive/xhr_stack.js
 */

define(['jive.XhrStack'], function(Stack) {
    function getEventDescriptor($target) {
        var descriptors = {
            container : {
                type       : 'container',
                objectId   : $target.data('objectId') || $target.data('objectid'),
                objectType : $target.data('objectType') || $target.data('objecttype')
            },

            user : {
                type   : 'user',
                userId : $target.data('userid') || $target.data('userId') || $target.data('objectid')
            }
        };

        return $target.is('.jiveTT-hover-user') ? descriptors.user : descriptors.container;
    }


    $j(function() {
        /*
         * Handles the mouseenter event on the avatar/user name/space. Fires the 'cardShow' event after a brief delay
         */
        (function(selector, timeout) {
            $j(document.body).on('mouseenter', selector, function(e) {
                var $target = $j(this),
                    xy      = [e.pageX, e.pageY],
                    delay   = ('ontouchstart' in window) ? 0 : 750;       // JIVE-7551: touch support in mobile safari


                if ($target.closest('#j-main, .jive-modal').length > 0) {
                    var descriptor   = getEventDescriptor($target);
                        descriptor.x = e.pageX;
                        descriptor.y = e.pageY;

                    window.clearTimeout(timeout);
                    timeout = window.setTimeout(function() {
                        // Trigger the cardShow event
                        $target.off('.cardHovering')
                            .trigger('cardShow', descriptor);
                    }, delay);

                    // track the current x/y coordinates
                    $target.on('mousemove.cardHovering', function(e) {
                        xy = [e.pageX, e.pageY];
                    });

                    // cancel if the user mouses out
                    $target.one('mouseleave.cardHovering', function() {
                        window.clearTimeout(timeout);
                        $target.off('.cardHovering');
                    });
                }
            });
        })('a.jiveTT-hover-user, a.jivecontainerTT-hover-container, img.jivecontainerTT-hover-container', undefined);





        /*
         * Responds to the 'cardShow' event
         */
        (function($card, stack) {
            // Helpers
            var $body    = $card.find('.j-js-note-body'),
                populate = $body.html.bind($body).aritize(1),
                request  = { abort : $j.noop },

                /**
                 * @param {jQuery} $group a reference to both the $card and the target of the cardShow event
                 */
                attachEvents = function($group) {
                    var timeout;

                    // hook in to the mousemove event to determine if the cursor is still contained within the card or the trigger element
                    $j(document.body).on('mousemove.cardHovered', function(e) {
                        var isContained = $group.is(e.target) || $group.find(e.target).length > 0;

                        // could use jQuery.contains() for the second check here. We should do whichever is fastest.
                        if (!isContained && !timeout) {
                            timeout = window.setTimeout(function() {
                                // hide the card
                                $group.add(document.body).off('.cardHovered');
                                $card.css('visibility', 'hidden').removeClass('snb-pinned').removeAttr('id');
                                request.abort();

                                var cardHiddenEvent = $j.Event('cardHidden', { relatedTarget : $card[0] });
                                $group.not('.jive-tooltip2').trigger(cardHiddenEvent);
                            }, 250);
                        } else if (isContained) {
                            window.clearTimeout(timeout);
                            timeout = undefined;
                        }
                    });
                },

                /**
                 * Positions and displays the card. Triggers a cardShown event once complete.
                 *
                 * @param {array} xy the x and y coordinates of the card's initial position
                 * @param {jQuery} $target the DOM element which triggered the cardShow event
                 */
                showCard = function(xy, $target) {
                    // initial positioning of the card
                    $card.css({ left: xy[0], top: xy[1] });

                    /*
                     * Adjust the position of the card if it is off-screen
                     */
                    var x       = xy[0] + $card.outerWidth(),          // the $card's right-most x coordinate
                        y       = xy[1] + $card.outerHeight(),         // the $card's bottom-most y coordinate
                        $win    = $j(window),                          // a jQuery-wrapped window
                        winX    = $win.width()  + $win.scrollLeft(),   // the window's right-most x coordinate
                        winY    = $win.height() + $win.scrollTop(),    // the window's bottom-most y coordinate
                        barSize = 16;                                  // an adjustment for the scroll bar (roughly 16 pixels)


                    // Adjust the x/left position if the card is displayed off the screen
                    if (x > winX) {
                        $card.css('left', '-=' + (x - winX + barSize));
                    }

                    // Adjust the y/top position if the card is displayed off the screen
                    if (y > winY) {
                        $card.css('top', '-=' + (y - winY + barSize));
                    }

                    // create cardShown event and event-specific descriptor
                    var cardShownEvent = $j.Event('cardShown', { relatedTarget : $card[0] });

                    $card.css('visibility', 'visible');
                    $target.trigger(cardShownEvent, getEventDescriptor($target));
                };


            // listen for the cardShow event
            $j(document.body).on('cardShow', function(e, descriptor) {
                var $target     = $j(e.target),
                    $container  = $card.children('.jive-tooltip2-mid').removeClass('j-mini-modal-user j-mini-modal-place'),
                    displayCard = showCard.curry([descriptor.x, descriptor.y], $target),
                    ajaxOptions = {
                        data     : { tooltip  : true },
                        dataType : 'html',
                        type     : 'GET'
                    };


                /*
                 * There are three possible values for descriptor.type:
                 *      user       - maps to .jiveTT-hover-user
                 *      container  - maps to .jivecontainerTT-hover-container
                 */
                switch (descriptor.type) {
                    case 'user':
                        $container.addClass('j-mini-modal-user');
                        $card.attr('id', 'jive-note-user-body');

                        var presenceRaw = $target.data('presence');
                        var presenceObj = presenceRaw ? eval( presenceRaw ) : null;
                            presenceObj = presenceObj && presenceObj.getPresencePostfix ? presenceObj : null;
                        $j.extend(true, ajaxOptions, {
                            url  : window.profileShortUrl,
                            data : {
                                userID : descriptor.userId,
                                presencePostfix : presenceObj ? presenceObj.getPresencePostfix() : null,
                                presence        : presenceObj ? presenceRaw : null
                            }
                        });

                        break;

                    case 'container':
                        $card.attr('id', 'jive-note-container-body');
                        $container.addClass('j-mini-modal-place');
                        ajaxOptions.data.container     = descriptor.objectId;
                        ajaxOptions.url                = window.containerShortUrl;
                        ajaxOptions.data.containerType = descriptor.objectType;
                        break;

                    default:
                        throw new Error('Unrecognized card type.');
                }


                // Populate and show the loading text in the $card
                var loadingText = jive.shared.displayutil.cardLoading({ type : descriptor.type }),
                    errorText   = jive.shared.displayutil.cardError({   type : descriptor.type });

                attachEvents($card.add($target));
                $body.html(loadingText);

                // Request the profile data and populate the card for user and container
                request = $j.ajax(ajaxOptions);
                stack.add(request
                    .then(populate)
                    .then(displayCard)
                    .fail(populate.curry(errorText))
                );
            });
        })($j('#jiveTT-note'), new Stack());
    });
});
