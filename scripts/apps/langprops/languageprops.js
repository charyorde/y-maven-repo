$j(document).ready(function(){
	//get current url and assign it to the callingPage hidden input 	
	var url=document.location.href;
	$j("#callingPage").val(url);
	
    // first check if overlay exist
    var $overlay = $j(".ui-widget-overlay");
    if($overlay.length <= 0) {
         $overlay = $j('<div class="ui-widget-overlay"></div>').prependTo('body').hide(); // .hide().
    }

    $j('#preferred-language').click(function(){
        $j('.ui-widget-overlay').fadeIn();
        $j('.language-chooser-wrapper').show().appendTo('body');
        setOverlayDimensionsToCurrentDocumentDimensions(); //call when document dimensions changes
    });

    $j(window).resize(function(){
        setOverlayDimensionsToCurrentDocumentDimensions();
    });

    $j(document).keydown(function(e) {
       // ESCAPE key pressed
       if (e.keyCode == 27) {
           $j('.ui-widget-overlay').fadeOut();
           $j('.language-chooser-wrapper').hide();
       }
    });

   $j('.jive-form-button-cancel').live('click',function() {
       $j('.ui-widget-overlay').fadeOut();
       $j('.language-chooser-wrapper').hide();
       return false;
    });

    function setOverlayDimensionsToCurrentDocumentDimensions() {
        $j('.ui-widget-overlay').width($j(document).width());
        $j('.ui-widget-overlay').height($j(document).height());
    }
});