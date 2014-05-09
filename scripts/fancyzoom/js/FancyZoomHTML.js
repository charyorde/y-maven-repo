// FancyZoomHTML.js - v1.0
// Used to draw necessary HTML elements for FancyZoom
//
// Copyright (c) 2008 Cabel Sasser / Panic Inc
// All rights reserved.

/*jslint browser:true */
/*extern $j */
/*extern browserIsIE zoomOut zoomImagesURI shadowSettings includeCaption */

function insertZoomHTML() {

    // All of this junk creates the three <div>'s used to hold the closebox, image, and zoom shadow.
    var inBody = $j('body').children();

    // WAIT SPINNER
    var inSpinbox = $j(document.createElement('div')).attr('id', 'ZoomSpin')
    .css('position', 'absolute')
    .css('left', '10px')
    .css('top', '10px')
    .hide()
    .css('z-index', '525')
    .append(
        $j(document.createElement('img')).attr('id', 'SpinImage').attr('src', zoomImagesURI + 'zoom-spin-1.png')
    )
    .prependTo('body');

    // ZOOM IMAGE
    //
    // <div id="ZoomBox">
    //   <a href="javascript:zoomOut();"><img src="/images/spacer.gif" id="ZoomImage" border="0"></a> <!-- THE IMAGE -->
    //   <div id="ZoomClose">
    //     <a href="javascript:zoomOut();"><img src="/images/closebox.png" width="30" height="30" border="0"></a>
    //   </div>
    // </div>

    $j(document.createElement('div')).attr('id', 'ZoomBox')
    .css('position', 'absolute')
    .css('left', '10px')
    .css('top', '10px')
    .hide()
    .css('z-index', '499')
    .append(
        $j(document.createElement('img')).attr('id', 'ZoomImage')
        .click(function(event) {
            zoomOut(this, event);
            return false;
        })
        .attr('src', zoomImagesURI + 'spacer.gif')
        .css('border', 'none')
        .css('-webkit-box-shadow', shadowSettings + '0.0)')
        .show()
        .css('width', '10px')
        .css('height', '10px')
        .css('cursor', 'pointer')
    )
    .append(
        $j(document.createElement('div')).attr('id', 'ZoomClose')
        .css('position', 'absolute')
        .css('left', browserIsIE ? '-1px' : '-15px')
        .css('top',  browserIsIE ?  '0px' : '-15px')
        .hide()
        .append(
            $j(document.createElement('img'))
            .click(function(event) {
                    zoomOut(this, event);
                    return false;
                })
            .attr('src', zoomImagesURI + 'closebox.png')
            .width(30).height(30)
            .css('border', 'none')
            .css('cursor', 'pointer')
        )
    )
    .insertAfter('#ZoomSpin');

    // SHADOW
    // Only draw the table-based shadow if the programatic webkitBoxShadow fails!
    // Also, don't draw it if we're IE -- it wouldn't look quite right anyway.

    if (!browserIsIE && !$j('#ZoomImage').css('-webkit-box-shadow')) {

        // SHADOW BASE

        $j(document.createElement('div')).attr('id', 'ShadowBox')
        .css('position', 'absolute')
        .css('left', '50px')
        .css('top',  '50px')
        .width('100px').height('100px')
        .hide()
        .css('z-index', '498')
        .append(

            // SHADOW
            // Now, the shadow table. Skip if not compatible, or irrevelant with -box-shadow.

            // <div id="ShadowBox"><table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0"> X
            //   <tr height="25">
            //   <td width="27"><img src="/images/zoom-shadow1.png" width="27" height="25"></td>
            //   <td background="/images/zoom-shadow2.png">&nbsp;</td>
            //   <td width="27"><img src="/images/zoom-shadow3.png" width="27" height="25"></td>
            //   </tr>

            $j(document.createElement('table'))
            .css('border', 'none')
            .width('100%').height('100%')
            .attr('cellpadding', '0')
            .attr('cellspacing', '0')
            .append(
                $j(document.createElement('tbody'))    // Needed for IE (for HTML4).
                .append(
                    $j(document.createElement('tr')).height('25px')
                    .append(
                        $j(document.createElement('td')).width('27px')
                        .append(
                            $j(document.createElement('img'))
                            .attr('src', zoomImagesURI + 'zoom-shadow1.png')
                            .width(27).height(25)
                            .show()
                        )
                    )
                    .append(
                        $j(document.createElement('td'))
                        .css('background-image', 'url(' + zoomImagesURI + 'zoom-shadow2.png)')
                        .append(
                            $j(document.createElement('img'))
                            .attr('src', zoomImagesURI + 'spacer.gif')
                            .width(1).height(1)
                            .show()
                        )
                    )
                    .append(
                        $j(document.createElement('td')).width('27px')
                        .append(
                            $j(document.createElement('img'))
                            .attr('src', zoomImagesURI + 'zoom-shadow3.png')
                            .width(27).height(25)
                            .show()
                        )
                    )
                )
                .append(

                    //   <tr>
                    //   <td background="/images/zoom-shadow4.png">&nbsp;</td>
                    //   <td bgcolor="#ffffff">&nbsp;</td>
                    //   <td background="/images/zoom-shadow5.png">&nbsp;</td>
                    //   </tr>

                    $j(document.createElement('tr'))
                    .append(
                        $j(document.createElement('td'))
                        .css('background-image', 'url(' + zoomImagesURI + 'zoom-shadow4.png)')
                        .append(
                            $j(document.createElement('img'))
                            .attr('src', zoomImagesURI + 'spacer.gif')
                            .width(1).height(1)
                            .show()
                        )
                    )
                    .append(
                        $j(document.createElement('td')).attr('bgcolor', '#ffffff')
                        .append(
                            $j(document.createElement('img'))
                            .attr('src', zoomImagesURI + 'spacer.gif')
                            .width(1).height(1)
                            .show()
                        )
                    )
                    .append(
                        $j(document.createElement('td'))
                        .css('background-image', 'url(' + zoomImagesURI + 'zoom-shadow5.png)')
                        .append(
                            $j(document.createElement('img'))
                            .attr('src', zoomImagesURI + 'spacer.gif')
                            .width(1).height(1)
                            .show()
                        )
                    )
                )
                .append(

                    //   <tr height="26">
                    //   <td width="27"><img src="/images/zoom-shadow6.png" width="27" height="26"</td>
                    //   <td background="/images/zoom-shadow7.png">&nbsp;</td>
                    //   <td width="27"><img src="/images/zoom-shadow8.png" width="27" height="26"></td>
                    //   </tr>  
                    // </table>

                    $j(document.createElement('tr')).height('26px')
                    .append(
                        $j(document.createElement('td')).width('27px')
                        .append(
                            $j(document.createElement('img'))
                            .attr('src', zoomImagesURI + 'zoom-shadow6.png')
                            .width(27).height(26)
                            .show()
                        )
                    )
                    .append(
                        $j(document.createElement('td'))
                        .css('background-image', 'url(' + zoomImagesURI + 'zoom-shadow7.png)')
                        .append(
                            $j(document.createElement('img'))
                            .attr('src', zoomImagesURI + 'spacer.gif')
                            .width(1).height(1)
                            .show()
                        )
                    )
                    .append(
                        $j(document.createElement('td')).width('27px')
                        .append(
                            $j(document.createElement('img'))
                            .attr('src', zoomImagesURI + 'zoom-shadow8.png')
                            .width(27).height(26)
                            .show()
                        )
                    )
                )
            )
        )
        .insertAfter('#ZoomBox');
    }

    if (includeCaption) {

        // CAPTION
        //
        // <div id="ZoomCapDiv" style="margin-left: 13px; margin-right: 13px;">
        // <table border="1" cellpadding="0" cellspacing="0">
        // <tr height="26">
        // <td><img src="zoom-caption-l.png" width="13" height="26"></td>
        // <td rowspan="3" background="zoom-caption-fill.png"><div id="ZoomCaption"></div></td>
        // <td><img src="zoom-caption-r.png" width="13" height="26"></td>
        // </tr>
        // </table>
        // </div>

        $j(document.createElement('div')).attr('id', 'ZoomCapDiv')
        .css('position', 'absolute')
        .hide()
        .css('margin-left', 'auto')
        .css('margin-right', 'auto')
        .css('z-index', '501')
        .append(
            $j(document.createElement('table'))
            .css('border', 'none')
            .attr('cellPadding', '0')    // Wow. These honestly need to
            .attr('cellSpacing', '0')    // be intercapped to work in IE. WTF?
            .append(
                $j(document.createElement('tbody'))    // Needed for IE (for HTML4).
                .append(
                    $j(document.createElement('tr'))
                    .append(
                        $j(document.createElement('td'))
                        .attr('align', 'right')
                        .append(
                            $j(document.createElement('img'))
                            .attr('src', zoomImagesURI + 'zoom-caption-l.png')
                            .width(13).height(26)
                            .show()
                        )
                    )
                    .append(
                        $j(document.createElement('td')).attr('id', 'ZoomCaption')
                        .css('background-color', 'black')
                        .css('opacity', '0.75')
                        .css('filter', 'alpha(opacity=75)')
                        .attr('valign', 'middle')
                        .css('font-size', '14px')
                        .css('font-family', 'Helvetica')
                        .css('font-weight', 'bold')
                        .css('color', '#ffffff')
                        .css('text-shadow', '0px 2px 4px #000000')
                        .css('white-space', 'nowrap')
                    )
                    .append(
                        $j(document.createElement('td'))
                        .append(
                            $j(document.createElement('img'))
                            .attr('src', zoomImagesURI + 'zoom-caption-r.png')
                            .width(13).height(26)
                            .show()
                        )
                    )
                )
            )
        )
        .insertAfter('#ZoomBox');

    }
}
