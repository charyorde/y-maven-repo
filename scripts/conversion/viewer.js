/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern $j jive */
/*extern document conversion tabView showInlineCommentsTab hideInlineCommentsTab loadComments */

jive.namespace('conversion');

jive.conversion.Viewer = function(options) {
    // Assign default values to any arguments that are not given.
    options = options || {};
    var viewerShown   = options.viewerShown   || false;
    var viewerHeight = options.viewerHeight || 600;
    var viewerCutoff  = options.viewerCutoff  || 5;     //previews generated before viewer is shown
    var pollIncrement = options.pollIncrement || 3000; //ms

    // Assign variables that do not have default values.
    var stepMessage = options.stepMessage;
    var stepDoc     = options.stepDoc;
    var stepPreview = options.stepPreview;
    var stepSub     = options.stepSub;

    var viewerURL = options.viewerURL;
    var cmID = options.pbType;
    var viewAttempts = 0;

    var statusURL    = options.statusURL;

    var conversionTimer;

    function updateProcessingMessage(msg){
        $j("#jive-oi-conversion-step").text(stepMessage.replace("{0}", msg));
    }

    function updateSubstepMessage(msg, step, total){
       return msg.replace("{0}", step).replace("{1}", total);
    }

    function showViewer() {

        //show viewer and inline comments tab
        if (viewerShown) return;
        
        // JIVE-11008 we want $j(document).ready(), but we're appending to the DOM
        // so it's already ready (really!).  I'm not sure who triggered the load
        // or we'd just wait on that load.  Instead, we have this timeout hack.
        // (keep delay * attempts about 10 seconds) 
        if($j("#docverse-viewer-holder").length == 0 && (++viewAttempts) <= 50) {
            return setTimeout(showViewer, 200);
        }
        $j("#docverse-viewer-holder").show();
        $j("#document-viewer-frame-holder").show().append(
            $j("<iframe/>").attr("id",'docverse-viewer-frame')
               .attr("width",'100%').attr("height",viewerHeight)
               .attr("scrolling",'no').attr("frameborder",'0')
               .attr("marginheight",'0').attr("marginwidth",'0')
               .attr("src",viewerURL));
        viewerShown = true;
        //show inline comments if it's hidden
        if (window.tabView && $j("#jive-inlinecomments").is(":hidden")){
            window.tabView.setVisibility('jive-inlinecomments', true);
        }
    }

    function checkConversionProcessing() { 
        conversionTimer = setTimeout(pollConversionStatus, pollIncrement);
    }

    function pollConversionStatus(){

        $j.ajax({ type: "GET",
            url: statusURL,
            dataType: "json",
            contentType: "application/json; charset=utf-8",

            success:function(status) {
                // still in flight
                if (status.converting && !status.error) {

                    //update step message
                    if (!status.pdfGenerated){
                        updateProcessingMessage(stepDoc);
                    } else if ( status.previewsGenerated < status.previewsTotal && status.previewsGenerated > 0) {

                        var msg = stepPreview;

                        msg = msg + updateSubstepMessage(stepSub, status.previewsGenerated, status.previewsTotal);

                        updateProcessingMessage(msg);

                        //if we're past view cuttOff pages, load the viewer
                        if (status.previewsGenerated > viewerCutoff || (status.previewsGenerated > 0 && status.previewsGenerated == status.previewsTotal)
                                && !viewerShown){
                           //show viewer
                           $j("#jive-oi-conversion-msg").hide('fast',function(){
                               showViewer();
                           });
                        }                        
                    }
                    conversionTimer = setTimeout(pollConversionStatus, pollIncrement);
                } else {

                    clearTimeout(conversionTimer);

                    //hide "converting" mssage
                    $j("#jive-oi-conversion-msg").hide();
                    if (status.error || !status.pdfGenerated || (status.previewsGenerated != status.previewsTotal && status.previewsGenerated < viewerCutoff )) {
                        //show failed message
                        $j("#jive-oi-error-text").text(status.errorMessage);
                        
                        if (!status.reconvertable) {
                            $j("jive-oi-error-reconvert").remove();    
                        }
                        
                        $j("#jive-oi-failed-msg").show();

                        // disable the inline comments if there are there
                     //   if ($j("#jive-inlinecomments-tab")) {
                         if (window.tabView) {
                            window.tabView.setVisibility('jive-inlinecomments-tab', false);
                         }
                       // }                                                

                    }
                    else {
                        
                        //show viewer
                        showViewer();
                    }
                }



        }});
        }

    /* ** public interface ** */
    this.checkConversionProcessing = checkConversionProcessing;
    this.show = showViewer;
};

/* ** static methods ** */
(function(klass) {
    /* Gets the document for the iframe. Does a little magic to get past conflicting
     * implementations of how to get the actual document. Returns null if no suitable
     * document can be found.
     *
     * @return DOMDocument The document for the loaded iframe.
     */
    function getIFrameDocument(iframe) {
        if (iframe.contentDocument) {
            // For NS6
            return iframe.contentDocument;
        }
        else if (iframe.contentWindow) {
            // For IE5.5 and IE6
            return iframe.contentWindow.document;
        }
        else if (iframe.document) {
            // For IE5
            return iframe.document;
        }
        else {
            return null;
        }
    }

    function selectInlineComment(id) {
        getIFrameDocument(document.getElementById("docverse-viewer-frame")).DocVerse.selectComment(id, false);
    }

    function doDvSelectComment() {
        tabView.switchTo('jive-inlinecomments');
        jive.CommentApp.inline.refresh();
        return false;
    }

    /* ** public static interface ** */
    klass.selectInlineComment = selectInlineComment;
    klass.doDvSelectComment   = doDvSelectComment;
})(jive.conversion.Viewer);
