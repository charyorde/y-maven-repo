/**
 * Adds functionality to an element allowing it to spawn a file dialog when clicked. Emits a 'choose' event which passes
 * a jQuery event object followed by a jQuery-wrapped file element.
 *
 * default options:
 *      name = 'file' - the name attribute of the file input
 *
 * @param {object} [options] contains options for the button and file input
 */
(function($) {
    $.fn.jiveFileButton = function(options) {
        var $button = this;
        options = $.extend({ name: 'file' }, options || {});

        function onChange() {
            var $input = $(this).unbind('change', onChange).remove();
            $button.trigger('choose', $input);
            $button.jiveFileButton(options); // reset the button
        }

        // create the file input and attach change event
        $('<input type="file" />').attr('name', options.name).appendTo($button).change(onChange);

        
        return $button;
    }
})(jQuery);