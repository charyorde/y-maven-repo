/*
 * Tooltip script
 * powered by jQuery (http://www.jquery.com)
 *
 * written by Alen Grakalic (http://cssglobe.com)
 *
 * for more info visit http://cssglobe.com/post/1695/easiest-tooltip-and-image-preview-using-jquery
 *
 */

(function($) {
    $.fn.tooltip = function() {
        /* CONFIG */
        var xOffset = 50;
        var yOffset = 20;
        // these 2 variable determine popup's distance from the cursor
        // you might want to adjust to get the right result
        /* END CONFIG */
        if ($(this).data("hasHover")) {
            return;
        }
        $(this).hover(function(e) {
            $(this).data("title", $(this).attr("title"));
            $(this).removeAttr("title");
            $("body").append("<p id='tooltip'>" + $(this).data("title") + "</p>");
            $("#tooltip").css("top", (e.pageY - xOffset) + "px").css("left", (e.pageX + yOffset) + "px").fadeIn("fast");
        }, function() {
            $(this).attr("title", $(this).data("title"));
            $(this).removeData("title");
            $("#tooltip").remove();
        }).mousemove(function(e) {
            $("#tooltip").css("top", (e.pageY - xOffset) + "px").css("left", (e.pageX + yOffset) + "px");
        });

        $(this).data("hasHover", true);
    };

    // starting the script on page load
    $(document).ready(function() {
        $("a.tooltip").tooltip();
    });
})(jQuery);