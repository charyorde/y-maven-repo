<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Yookos</title>
		<link href="<@resource.url pluginName='shareplugin' value='/images/favicon.ico' />" type="image/x-icon" rel="shortcut icon">
		
		<script type="text/javascript" src="<@resource.url value='/plugins/social-integration/resources/script/jquery-1.6.2.min.js' />"></script>

		<script type="text/javascript">
			$(function() {
				
				var additional_content = $("#txta_share_additional_content");
				if(additional_content.val().toLowerCase().replace(/^\s+|\s+$/g,"") == 'write something to include') { 
					additional_content.addClass('blank_text');
				};
				
				$("#txta_share_additional_content").bind({
					click: 	function() { 
								if($(this).val().toLowerCase().replace(/^\s+|\s+$/g,"") == 'write something to include') { 
									$(this).val('');
									$(this).removeClass('blank_text');
								}
							},
					blur: 	function() {
								if($(this).val().replace(/^\s+|\s+$/g,"") == '') { 
									$(this).val('write something to include');
									$(this).addClass('blank_text');
								}
							}
				});
				
				$("#btn_share").click(function(){
					
					var comment = ($("#txta_share_additional_content").val() == "write something to include") ? "" : $("#txta_share_additional_content").val();
					var url = $("#txtUrl").val();
					var title = $("#txtTitle").val();
					var description = $("#txtDescription").val();
					var screenshot = $("#txtImageurl").val();
					var swfurl = $("#txtSwfurl").val();
					
					var json = "{'data': {'url': '" + url + "', 'title': '" 
								+ title + "', 'description': '" + description + "', 'screenshot': '"
								+ screenshot +"', 'swfurl': '" + swfurl  + "', 'comment': '" + comment + "'}}";
					
					//make ajax call
					var HOST 
					$.ajax({
						  url: "http://${JiveGlobals.getJiveProperty('yookos.share.host')}/__services/shareservice/share",
						  type: "POST",
						  data: json,
						  beforeSend: function(xhr) {
						  	xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
						  }
					}).done(function(response) {
						window.close();
					}).fail(function(e, err) {
						window.close();
					}).always(function(data) {
						window.close();
					});					
				});
			});
			
		</script>
		
		<style type="text/css">
			body, html {
				height: 100%;
				margin:	auto 0;
				text-align: left !important;
			}
			
			.blank_text {
				color: #CCC !important;	
			}
			
			#site_header {
			    background: none repeat scroll 0 0 #0A99F9;
			    color: #FFFFFF;
			    padding: 8px 12px;
				font-family: Verdana, Geneva, sans-serif;
				font-weight: bold;
				font-size: 12px;
				display: block;
				height: 16px;
				line-height: 16px;
			}
			
			#sub_header {
			    font-family: verdana;
			    font-size: 12px;
			    padding: 8px 6px;
				border-bottom:	1px solid #CCC;
				margin-bottom: 12px;
			}
			
			#share_content_image_thumbnail_wrapper {
			    display: block;
			    float: left;
			    height: auto;
			    margin: 0 8px 0 0;
			    max-height: 90px;
			    max-width: 150px;
			    overflow: hidden;
			    width: auto;
			}
			
			#share_content_image_thumbnail {
				max-width: 150px !important;
				width: 150px;
			}
			
			#share_content_video_thumbnail {
				max-width: 150px !important;
				width: 150px;
			}
			
			#share_content_header {
				font-weight: bold;
				padding-bottom: 4px;
			}
			
			#share_content {
			    display: inline-block;
			    padding: 6px;
			    width: 100%;
			}
			
			#share_additional_content {
				clear: both;
			    display: inline-block;
			    width: 100%;
			}
			
			#txta_share_additional_content {
			    font-family: Arial,Helvetica,sans-serif;
			    font-size: 12px;
			    max-width: 98%;
			    width: 100%;
				background-color: transparent;
			    border: 0 none;
			    outline: 0 none;
				padding: 6px;
				resize: none;
			}
			
			#txta_share_additional_content_wrapper {
				padding: 20px;
			
			}
			
			#txta_outilner {
				border: 1px solid #CCCCCC;
			}
			
			#sub_wrapper_block {
				padding: 0 12px;
				font-family: Verdana, Geneva, sans-serif;
				font-size: 12px;
			}
			
			#main_wrapper_block {
				height: 100%;
			}
			
			#share_buttons {
			    bottom: 0;
			    display: block;
			    margin-top: 10px;
			    text-align: right;
			    width: 100%;
			}
			
			#share_buttons input {
				border: 1px solid #CCC;
				padding: 2px 6px;
				border-right: 2px;
				font-weight: bold;
			}
			
			#btn_share {
				background: none repeat scroll 0 0 #0A99F9;
				color: #FFF;
			}
			
			#btn_cancel {
				background: none repeat scroll 0 0 #CCCCCC;
				
			}
			
			#share_buttons_wrapper {
				border-top: 1px solid #CCCCCC;
			    padding: 10px 12px 20px;
			}
			
			#yookos_icon {
				background: url(<@resource.url themeName='yookos-2-1-1_theme' value='/images/favicon.ico' />) no-repeat left top;
				display: block;
				width: 16px;
				height: 16px;
				float: left;
				margin-right: 4px;
			}
			
			#share_content_body a {
				font-size: 10px;
				font-weight: 700;
				text-decoration: none;
			}
		</style>
	</head>
	<body>
		<div id="main_wrapper_block">
			<div id="site_header">
				<span id="yookos_icon"></span>
				<span>Share</span>
			</div>
		    <form action="#" method="POST">
		        <div id="sub_wrapper_block">
		            <div id="sub_header">Share on Yookos</div>
		            <div id="yookos-avatar">
                         <img src="people/${username}/avatar/"/>
		            </div>
		            <div id="share_content">
		                <div id="share_content_image_thumbnail_wrapper">
		                	<#if screenshot?has_content>
		                		<img id="share_content_image_thumbnail" src='${screenshot}' />
		                	<#elseif swfurl?has_content>
		             			<embed src='${swfurl}' height="150" width="150"/>
		                   	<#else>
		             			
		                   	</#if>
		                </div>
		                <div id="share_content_wrapper">
		                    <div id="share_content_header">${title}</div>
		                    <div id="share_content_body">${description} <a href='${url}'>Read More</a><!-- end replace content body --></div>
		                </div>
		            </div>
		            <div id="share_additional_content">
		                <div id="txta_share_additional_content_wrapper">
		                    <div id="txta_outilner"><textarea cols="40" rows="2" id="txta_share_additional_content" name="txta_share_additional_content">write something to include</textarea></div>
		                    </div>
		            </div>
		        </div>
		        <div id="share_buttons">
		            <div id="share_buttons_wrapper">
		                <span id="extra_elements_hidden_fields"><!-- place Hidden fields Here --></span>
		                <span><input type="button" value="Share" id="btn_share" /></span>
		                <span><input type="button" value="Cancel" id="btn_cancel" onclick="javascript: window.close();" /></span>
		            </div>
		        </div>
		        
		        <input type="text" value='${url}' name="txtUrl" id="txtUrl" style="visibility:hidden" />
				<input type="text" value='${title}' name="txtTitle" id="txtTitle" style="visibility:hidden" />
				<input type="text" value='${description}' name="txtDescription" id="txtDescription" style="visibility:hidden" />
				<input type="text" value='${screenshot}' name="txtImageurl" id="txtImageurl" style="visibility:hidden" />
				<input type="text" value='${swfurl}' name="txtSwfurl" id="txtSwfurl" style="visibility:hidden" />
				<input type="text" value='#' name="txtIncludeText" id="txtIncludeText" style="visibility:hidden" />

				
		    </form>
		</div>
	</body>
</html>
