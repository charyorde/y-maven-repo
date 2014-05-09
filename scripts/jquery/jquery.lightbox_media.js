/* 100% dependent on lightbox_me, so make sure that is included before calling & invoking this plugin! */
/**
 * @depends path=/resources/scripts/apps/shared/views/loader_view.js
 */
(function($) {

    var loadingTimer, loadingFrame = 1, imgPreloader = new Image;

    $.fn.lightbox_media = function(options) {
        return this.each(function() {
            var
                opts = $.extend({}, $.fn.lightbox_media.defaults, options),
                $self = $(this),
                $loading, $img;

            if ($self.get(0).lightboxBound) {
                return;
            }
            else {
                $self.get(0).lightboxBound = true;
            }

            $self.click(function() {
                /* Generate Loading Div */
                $loading = $('<div class="modal-loading j-rc5"></div>');
                var spinner = new jive.loader.LoaderView();
                spinner.appendTo($loading);

                /* show loader */
                $loading.lightbox_me({showOverlay: true, centered: true, destroyOnClose: true});


                /* Build DOM */

                var $dom = $('<div class="jive-modal" id="lb_image_wrapper"/>');
                $dom.append($('<a class="j-icon-close jive-close" href="#"/>'));
                if (opts.type == "image") {
                    /* Preload Image */
                    imgPreloader = new Image;

                    imgPreloader.onload = function() {
                        imgPreloader.onload = null;
                        imgPreloader.onerror = null;

                        $img = $('<img/>').attr({
                            id      : 'lb_image',
                            src     : $self.attr('href')
                        });

                        if($.browser.msie) {
                            $img.css('width', '100%');
                            $img.css('height', '100%');
                        }
                        else {
                            $img.css('max-width', '100%');
                            $img.css('max-height', '100%');
                        }

                        $dom.append($img);

                        $loading.trigger('close');
                        spinner.destroy();
                        /* display: block, but visibility: hidden allows width calculation */
                        $('body').append($dom);
                        $('body').append($dom.css({'position': 'absolute', 'left': '-1000px', 'visibility': 'hidden', 'display': 'block'}));

                        if ($img.outerWidth() + parseInt($dom.css('padding-left')) * 2 > $(window).width()) {
                            var newWidth = $(window).width() - (parseInt($dom.css('padding-left')) * 4);

                            // IE 6 & 7 won't scale height with width when using css to scale the width.
                            if ($.browser.msie && $.browser.version < 8) {
                                var ratio = newWidth / $img.outerWidth();
                                $img.height($img.height() * ratio);
                            }
                            $img.width(newWidth);
                        }
                        $dom.css({'position': 'static', 'left': 'auto', 'display': 'none', 'visibility': 'visible'});
                        $dom.lightbox_me({closeSelector: '.jive-close', destroyOnClose: true, centered: true});

                    }

                    imgPreloader.onerror = function() {
                        imgPreloader.onload = null;
                        imgPreloader.onerror = null;
                        setTimeout(function() {
                            $loading.trigger('close');
                            spinner.destroy();
                        }, 1000);

                    }

                } else if (opts.type == "video") {
                    // replace any occurences of watch with v/vVal where vVal is the v parameter value.  The v
                    // parameter can show up anywehere in the url.  We also need to remove the v parameter from the url.
                    var src = $self.attr('href'),
                        vParamRegExp = /[&?]v=([^&?]+)/i,
                        vParam = src.match(vParamRegExp);

                    if(vParam == null || vParam.length < 2){
                        // failed to get v parameter value, probably a bad url
                        throw 'Error lightboxing video with url ' + href;
                    }

                    // remove v param from url,
                    // add it back to url in embed format
                    src = src.replace(vParamRegExp, '').replace(/watch[?]?/, 'v/' + vParam[1] + '?');

                    var str = '',
                        emb = '';

                    str += '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="480" height="385"><param name="movie" value="' + src + '"></param>';


                    str += '<param name="wmode" value="transparent"></param>';
                    str += '<param name="allowfullscreen" value="true"></param>';

                    emb += ' wmode="transparent"';
                    emb += ' allowfullscreen="true"';


                    str += '<embed src="' + src + '" type="application/x-shockwave-flash" width="480" height="385"' + emb + '></embed></object>';



                    $loading.trigger('close');
                    spinner.destroy();

                    $dom.html(str).append($('<a class="j-icon-close jive-close" href="#"/>'));
                    $dom.lightbox_me({closeSelector: '.jive-close', destroyOnClose: true, centered: true});
                    $('body').append($dom);

                }
                imgPreloader.src = $self.attr('href');




                return false;
            });

            
                
        });
    };


     $.fn.lightbox_media.defaults = {
        type: 'image'
    };

})(jQuery);


(function(){
    var imageSuffix = /\.(?:jpg|jpeg|jpe|png|gif)$/i;
    var isDownload = /\/JiveServlet\/downloadBody\//;
    function bindLightboxImages($context) {

        $j("a[href]", $context || document).filter(function(){
            return imageSuffix.test(this.href) && !isDownload.test(this.href);
        }).lightbox_media();
    }

    function bindLightboxVideos($context) {
        $j("a.j-js-youtube, a[rel=fb]", $context || document).each(function(){$j(this).lightbox_media({type:'video'}); });
    }

    // called from soy templates to lightbox images and video
    jive.bindLightboxMedia = function(options, opt_sb){
        var output = opt_sb || new soy.StringBuilder();

        var $context = null;
        if(options && options.context){
            $context = options.context;
        }
        // need to call this async to avoid race conditions
        window.setTimeout(function(){
            bindLightboxImages($context);
            bindLightboxVideos($context);
        }, 1);
        
        if (!opt_sb) return output.toString();
    };
})();



