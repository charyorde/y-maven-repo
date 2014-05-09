/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Handles all like/unlike functionality
 *
 * @depends path=/resources/scripts/apps/like/models/like_source.js
 * @depends path=/resources/scripts/jive/dispatcher.js
 * @depends template=jive.eae.acclaim.*
 * @throws throws an exception if the widget type is unknown
 */

jive.namespace('Like', (function(model, likeControl) {
    function updateUI($element, isLiked, objectType, objectId) {
        var $container      = $element.closest('.js-acclaim-container'),
            likeCount       = $container.data('likes'),
            soyParams       = {
                canLike    : true,
                liked      : isLiked,
                objectId   : objectId,
                objectType : objectType,
                type       : $container.data('type'),
                showIcon   : $container.data('showicon')
            };


        // adjust the likeCount. ensure it is always 0 or more
        likeCount += isLiked ? 1 : -1;
        likeCount  = likeCount < 0 ? 0 : likeCount;
        soyParams.likeCount = likeCount;

        /*
         * Widget type can be one of the following values:
         *
         * mini   - used in the activity stream (see acclaim.soy)
         * small  - identical to mini in presentation, but the DOM structure is a little different (see acclaim.ftl)
         * medium - used on a content detail page. a larger like/count display area (see acclaim.ftl)
         */
        switch (soyParams.type) {
        case 'mini':
            $element.closest('.j-js-liking-control').html(likeControl(soyParams));
            break;

        case 'medium':
            $container.data('likes', likeCount).html(likeControl(soyParams));
            break;

        case 'small':
            var $new     = $j(likeControl($j.extend({ showGlyph: true }, soyParams))),
                $control = $container.closest('.j-js-liking-control');

            if ($control.length > 0) {
                $control.replaceWith($new);
            } else {
                $container.replaceWith($new);
            }
            break;

        default:
            throw 'Unknown widget type';
        }
    }

    var inFlightRequests = {};
    jive.dispatcher.listen(['like', 'unlike'], function(payload, event, target) {
        var key = payload.objectType + "_" + payload.objectId;
        if(inFlightRequests[key]){
            //For any given entity descriptor, we can have at most one request pending.
            //This partially mitigates a data design issue in the acclaim subsystem that allows duplicate likes.
            console.log("duplicate like request, ignoring", payload, event, target);
            return;
        }else{
            inFlightRequests[key] = true;
        }

        var isLiked = event === 'like';
        model.setLiked(isLiked, payload.objectType, payload.objectId).addCallback(function() {
            updateUI($j(target), isLiked, payload.objectType, payload.objectId);
            jive.switchboard.emit("acclaim.recorded", isLiked, payload.objectType, payload.objectID);
        }).always(function (){
            delete inFlightRequests[key];
        });
    });


    return {};
})(new jive.Liking.LikeSource({}), jive.eae.acclaim.likeControl));
