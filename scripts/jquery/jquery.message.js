/**
 * @depends template=jive.shared.displayutil.*
 */

(function($){
    
    $.fn.message = function(options){

        return this.each(function() {
            var opts = $.extend({}, $.fn.message.defaults, options || {}),
                $popup = $(jive.shared.displayutil.messagePopup(opts)),
                $msg = $popup.find('.j-alert:eq(0)').css({ bottom: '-40px', display: 'block', opacity: 0 }),
                $container = $('.j-alert-container');

            $msg.find('.j-js-alert-message').replaceWith(this);

            if (!$container.length) {
                $container = $popup;
            } else {
                $container.html($popup.html());
                $msg = $container.find('.j-alert:eq(0)');
            }

            $container.appendTo('body').find('.j-js-message-popup-close-button').click(closeMe);

            $msg.animate({ bottom: 0, opacity: 1 });
            opts.dismissIn > 0 && setTimeout(closeMe, opts.dismissIn);

            function closeMe() {
                $msg.animate({ opacity: '0', bottom: '-20px' }, 100, function() {
                    $msg.remove();
                    opts.dismissCallback();
                });
            }
        });
    };

    $.fn.message.defaults = {
        dismissCallback: $.noop,
        dismissIn:       5000, // if set to 0, it will not autodismiss
        showClose:       true,
        style:           'info' // valid: 'error', 'warn', 'success', 'info'
    };




})(jQuery);