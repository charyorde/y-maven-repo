/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
define('jive.Announcements.Flipper.AnnouncementFlipper', function() {
return function(options){

    // rotation frequency and timer.
    var speed = 7000;
    var run = setInterval(rotate, speed);
    var pause = false;

    var $carousel = $j('#j-announcement-carousel'),
        $announcements = $carousel.find('.j-announcement'),
        $more = $announcements.find('.j-announcement-more'),
        $controls = $carousel.find('#j-announcement-controls'),
        $buttons = $controls.find('.j-announcement-button'),
        announcement_count = $announcements.length,
        announcement_width = $announcements.outerWidth(),
        defaultHeight = getDefaultHeight($announcements.eq(0));

    /*** Initialization ***/

    // set first announcement as active, hide rest.
    $announcements.eq(0).addClass('active');

    // first button as active and setup handler.
    $buttons.eq(0).addClass('active');
    $buttons.click(function() {
        var next_index = $buttons.index($j(this));

        if($j("body").scrollTop() > $carousel.offset().top){
            $j("body").animate({"scrollTop": $carousel.offset().top}, 100);
        }
        makeActive(next_index);

        pause = false;
    });

    // display 'more' button if appropriate and setup handler.
    populateMoreLink(true);
    $more.click(function() {
        var $active = getActive();

        $active.addClass("full-text").css("height", "");

        $more.hide();

        stopRotate(true);

        return false;
    });

    // pause rotation on mouse over -- resume on mouse out.
    $carousel.hover(
        function() {
            stopRotate();
        },
        function() {
            startRotate();
        }
    );

    /*** Helper Functions ***/
    function getNextIndex() {
        var index = getActiveIndex();

        if(index + 1 >= announcement_count) {
            return 0; // wrap back to first announcement
        }
        return index + 1;
    }

    function getActive() {
        return $announcements.parent().find('.active');
    }

    function getActiveIndex() {
        var $active = getActive();
        return $announcements.index($active);
    }

    function getActiveImage() {
        return getActive().find('.j-announcement-body img');
    }

    function getHeight($active) {
        $active.addClass("full-text").css("height", "");
        var height = $active.height();
        $active.removeClass("full-text");

        return height;
    }

    function getDefaultHeight($announcement) {
        if($announcement.is(':hidden')) {   // temporarily display to gather height
            $announcement.addClass("active").css("height", "");

            var defaultBodyHeight = $announcement.height();
            $announcement.removeClass("active");

            return defaultBodyHeight;
        }
        return $announcement.find('.j-announcement-body').height();
    }

    function populateMoreLink(initialization) {
        var $img = getActiveImage();

        // announcement bodies with images needs to wait for image to load before getting heights (only on init)
        if(initialization && $img.length > 0) {
            $img.load(function() {
                showMore();
            });
        }
        else {
            showMore();
        }
    }

    function showMore() {
        if(getHeight(getActive()) > defaultHeight) {
            $more.show();
        } else {
            $more.hide();
        }
    }

    function rotate() {
        makeActive(getNextIndex());
    }

    function stopRotate(lock) {
        clearInterval(run);
        if(lock)
            pause = true;
    }

    function startRotate() {
        if(!pause)
            run = setInterval(rotate, speed);
    }

    function makeActive(index) {
        var active_index = getActiveIndex();

        // defines which direction items announcement slide towards.
        if (index != active_index) {
            var exitOffset = announcement_width;
            var entranceClass = "enter-left";
            if (active_index < index) {
                entranceClass = "enter-right";
                exitOffset *= -1;
            }

            var $active = getActive();
            var $next = $announcements.eq(index);
            $active.removeClass("active").addClass("exit");
            $next.addClass(entranceClass);

            // slide current announcement away.
            var exiting = new $j.Deferred();
            $active.animate({'left': exitOffset}, 200, function () {
                exiting.resolve();
            });

            // position and slide in newly selected announcement.
            var entering = new $j.Deferred();
            $next.animate({'left': 0}, 200, function () {
                entering.resolve();
            });

            // update controls.
            $buttons.eq(active_index).removeClass('active');
            $buttons.eq(index).addClass('active');

            //after both have completed
            $j.when(exiting, entering).done(function(){
                $active.removeClass("exit full-text").css("left", "");
                $next.removeClass(entranceClass).addClass('active').css("left", "");
                populateMoreLink(false);
            });
        }
    }
};
});
