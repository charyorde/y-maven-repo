/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/**
 * @depends path=/resources/scripts/jquery/jquery.form.js
 */
$j(function(){
    $j("#imageUploadForm").ajaxForm({
        dataType: "json",
        beforeSubmit: function(data){
            //Images specified by external URL don't need a form submit; handle them here.
            var imageUrl, hasFile = false;
            $j.each(data, function(){
                if(this.name == "imageUrl"){
                    imageUrl = this.value;
                }else if(this.name == "imageFile" && this.value.length > 0){
                    hasFile = true;
                }
            });
            if(imageUrl && !hasFile){
                var imageName = imageUrl;
                var match = /\/([^\/]+)(?:\?|$)/.exec(imageUrl);
                if(match){
                    imageName = match[1];
                }
                tinyMCEPopup.execCommand("jiveInsertImage", false, {
                    url: imageUrl,
                    name: imageName
                });
                tinyMCEPopup.close();
                return false;
            }
        },
        success: function(response){
            $j.each(response.images, function(){
                tinyMCEPopup.execCommand("jiveInsertImage", false, this);
            });
            tinyMCEPopup.close();
        },
        error: function(response, statusText){
            console.log("failed to upload image", response, statusText);
            tinyMCEPopup.close();
        }
    });

    // workaround for JIVE-19923 -- chrome not displaying iframe, repaint by calling resize.
    function adjustForTabs() {
        var t = this, vp = t.dom.getViewPort(window),
            dw = t.getWindowArg('mce_width') - vp.w,
            dh = t.getWindowArg('mce_height') - vp.h + 1;

        if (t.isWindow)
            window.resizeBy(dw, dh);
        else
            t.editor.windowManager.resizeBy(dw, dh, t.id);
    }
    tinyMCEPopup.resizeToInnerSize = adjustForTabs;
    // end of workaround for JIVE-19923

    //Set up tab flipping
    $j(".jive-body-tab a").click(function(){
        var $tabs = $j(this).closest(".j-tabbar").find(".jive-body-tab");
        $tabs.removeClass("active");
        $tabs.each(function(){
            $j("#" + $j(this).data("for")).hide();
        });
        var $thisTab = $j(this).closest(".jive-body-tab");
        $thisTab.addClass("active");
        $j("#" + $thisTab.data("for")).show();

        return false;
    });
    $j(".jive-body-tab.active a").click();

    $j("#objectId").val(tinyMCEPopup.params["objectId"]);
    $j("#objectType").val(tinyMCEPopup.params["objectType"]);
});