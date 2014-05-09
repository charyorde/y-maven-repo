/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern jive $j VideoActionBean */

function featureVideo(videoID, containerID, containerType, uiFunction, uiParams) {
    VideoActionBean.hasExistingFeaturedVideo(containerID, containerType, {
        callback:function(result) {
            if('false' == result) {
                //nothing featured yet go ahead and do it
                saveFeaturedVideo(videoID, containerID, containerType, uiFunction, uiParams);
            } else {
                //existing featured item exists, represented as JSON object
                $j("#modal_replace_featured").lightbox_me({closeSelector: ".jive-modal-close, .close",
                    onLoad: function() {
                        try {
                            var featuredVid = JSON.parse(result);
                            var featSpan = $j("#featured-vid-to-replace");
                            if(featSpan && featSpan.length > 0) {
                                $j("#feat-replace-info")[0].hide();
                                featSpan[0].innerHTML = "<a href='" + featuredVid.url + "'>" + featuredVid.description + "</a>";
                                $j("#feat-replace-prompt")[0].show();                                                                
                            }
                        } catch(err){
                            //ignore - warning is already displayed in modal
                        }
                    }
                });

            }
        },
        errorHandler: function() {
            //some problem was encountered. do the action the user requested anyway.
            saveFeaturedVideo(videoID, containerID, containerType, uiFunction, uiParams);
        }
    });
}

function saveFeaturedVideo(videoID, containerID, containerType, uiFunction, uiParams) {
    VideoActionBean.featureVideo(videoID, containerID, containerType, {
        callback:function() {
            if (uiParams) {
                uiFunction.apply(this, uiParams);
            }
            else if(uiFunction)
            {
                uiFunction.call();
            }
        },
        errorHandler: function(errorResult) {
            alert('Error featuring video: ' + errorResult);
        }
    });
}

function clearFeaturedVideo(containerID, containerType, uiFunction, uiParams) {
    VideoActionBean.clearFeaturedVideo(containerID, containerType, {
        callback:function() {
            if (uiParams) {
                uiFunction.apply(this, uiParams);
            }
            else if(uiFunction)
            {
                uiFunction.call();
            }
        },
        errorHandler: function(errorResult) {
            alert('Error clearing featured video: ' + errorResult);
        }
    });
}

function videoFeaturedSucces() {
    $j('#jive-link-feature').hide();
    $j('#jive-link-unfeature').show();
    $j('#jive-vid-featured').fadeIn();
}

function videoClearFeaturedSucces() {
    $j('#jive-link-feature').show();
    $j('#jive-link-unfeature').hide();
    $j('#jive-vid-featured').fadeOut();
}

