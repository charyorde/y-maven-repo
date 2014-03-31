package com.yookos.util;

/**
 * @author Msawenkosi Ntuli
 *
 */
public final class ShareServiceUtil {

	public static final String SUCCESS = "success";
	public static final String FAILURE = "failure";
	public static final String NOTLOGGEDIN = "notloggedin";	
	public static final String screenshotTemplate = "<div id='imgcontainer' name='imgcontainer' style='float: left; padding: 0px; margin: 0px'><img width='100px' height='75px' style='position:absolute; z-index:1' src='%s' &#047;><div style='position:absolute; z-index: 2;height: 75px; width: 100px'>&nbsp;</div></div><div id='sharedimgcontainer' name='sharedimgcontainer'style='height: 75px; padding: 0px; margin: 0px; margin-left: 110px;'><a href='%s'>%s</a><br/>%s</div>";
	public static final String swfurlTemplate = "<div id='swfvideocontainer' name='swfvideocontainer' style='float: left; padding: 0px; margin: 0px'>" + 
											     "<embed id='swfvideo' name='swfvideo' width='420' height='345' videolink='%s' type='application/x-shockwave-flash'></embed>" +
											     "</div><div id='sharedswfcontainer' name='sharedswfcontainer' style='float: left; padding: 0px; margin: 0px; margin-left: 10px; margin-top: 22px'><a href='%s'>%s</a><br/>%s</div>";
	public static final String defaultTemplate = "<div id='sharedcontentcontainer' name='sharedcontentcontainer' style='float: left; padding: 0px; margin: 0px'><a href='%s'>%s</a><br/>%s</div>";
	public static final String URL = "url";
	public static final String TITLE = "title";
	public static final String DESCRIPTION ="description";
	public static final String SCREENSHOT = "";
	public static final String SWFURL = "swfurl";
    
	private ShareServiceUtil(){};
}
