/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
// TODO this functionality is only used by the video plugin and should be migrated to that project
function JiveViewVideos() {

    this.reload = function(shouldScroll) {
        $j('#jive-viewvideos-form').ajaxSubmit({success : function(data) {
            $j('#jive-view-videos-container').html(data);
        }
        });

        return false;
    }

    this.changeView = function(view) {
        $j('#jiveviewvideosform-view').val(view);
        this.reload(false);
    }



    this.resetSort = function (sort) {
        $j('#jiveviewvideosform-sort').val(sort);
        this.setStart(0);
    }



    this.setStart = function(start) {
        $j('#jiveviewvideosform-start').val(start);
        this.reload(false);
    }

    this.setStartAndScroll = function(start) {
        $j('#jiveviewvideosform-start').val(start);
        this.reload(true);
    }

}

var jiveviewvideos = new JiveViewVideos(); 



