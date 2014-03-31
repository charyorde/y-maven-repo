<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Yookos</title>
		<link href="<@resource.url value='/plugins/social-integration/resources/images/favicon.ico'/>" type="image/x-icon" rel="shortcut icon" />
		
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
									$(this).val('Write something to include');
									$(this).addClass('blank_text');
								}
							}
				});
			});
		</script>

		<style type="text/css">
		body, html {
			height: 100%;
			margin:	auto 0;
		}

		.blank_text {
			color: #CCC !important;	
		}

		#site_header {
		    /* background: none repeat scroll 0 0 #0A99F9; */
		    background: none;
		    color: #FFFFFF;
		    padding: 20px 20px 8px;
			font-family: Verdana, Geneva, sans-serif;
			font-weight: bold;
			font-size: 12px;
			height: auto;
			line-height: 16px;
		}

		#sub_header_wrapper {
		    font-family: verdana;
		    font-size: 12px;
		    padding: 16px 0;
			border-bottom:	1px solid #CCC;
			margin-bottom: 12px;
		}

		#sub_header {
		    margin: auto;
		    max-width: 860px;
		}


		#share_content_image_thumbnail {
			max-width: 150px !important;
			width: 150px;
		}

		#login_contents {
		    background: none repeat scroll 0 0 #FFFFFF;
		    border: 1px solid #DDDDDD;
		    border-radius: 3px 3px 3px 3px;
		    clear: both;
		    left: 0;
		    margin: 40px auto 0;
		    padding: 15px;
		    right: 0;
		    width: 500px;
		}

		#sub_wrapper_block {
			padding: 0 20px;
			font-family: Verdana, Geneva, sans-serif;
			font-size: 12px;
		}

		#main_wrapper_block {
			height: 100%;
		}

		#login_buttons {
		    bottom: 0;
		    display: block;
		    margin-left: 80px;
		    padding: 10px 0;
		    width: 100%;
		}

		#login_buttons input {
			border: 1px solid #CCC;
			padding: 2px 6px;
			border-right: 2px;
			font-weight: bold;
		}

		#btn_login {
			background: none repeat scroll 0 0 #0A99F9;
			color: #FFF;
			padding: 1px 10px 2px !important;
		}

		#share_buttons_wrapper {
			border-top: 1px solid #CCCCCC;
		    padding: 10px 12px 20px;
		}

		#yookos_logo { 
			background: url(<@resource.url value='/plugins/social-integration/resources/images/logo-login.png' />) no-repeat left top;
			display: block;
		    height: 46px;
		    margin: auto;
		    max-width: 860px;
		}

		#share_content_body a {
			font-size: 10px;
			font-weight: 700;
			text-decoration: none;
		}

		#login_header {
		    border-bottom: 1px dotted #BBBBBB;
		    font-weight: bold;
		    padding: 6px 0;
		}

		#login_header h2 {
		    font-family: tahoma;
		    margin-bottom: 0;
		    margin-top: 0;
		}

		#login_elements {
		    margin: auto;
		    padding: 15px 0 10px;
		    width: 350px;
		}

		#login_elements label {
			display: inline-block;
		    font-family: verdana;
		    font-weight: bold;
		    min-width: 80px;
		}

		#login_elements input {
		    border: 1px solid #0A99F9;
		    font-family: helvetica;
		    padding: 2px;
		}

		#yookos-login-username {
			padding: 8px 0;
		}

		.form_label {
			font-weight: normal !important;
		}

		#remember_me_wrapper {
		    margin-left: 80px;
		    padding: 6px 0;
		}

		#sub_header a, .login_links_bold {
			font-family: Verdana, Geneva, sans-serif;
			font-weight: bold;
			text-decoration: none;
			color: #ffffff;
		}
		
		#login_sign_up_link_bold {
			font-family: Verdana, Geneva, sans-serif;
			font-weight: bold;
			text-decoration: none;
			color: #0a99F9;
		}
		
		#sub_header a:hover, .login_links_bold:hover {
			text-decoration: underline;
			color: #0a99F9;
		}

		.login_links {
			font-family: Verdana, Geneva, sans-serif;
			text-decoration: none;
			color: #00548d;
		}

		.login_links:hover {
			text-decoration: underline;
			color: #0a99F9;
		}

		#forgotten_password {
			padding-top: 12px;
		}

		#main_wrapper_background, .main_bdg {
		    background: url(<@resource.url value='/plugins/social-integration/resources/images/login-bgd-new.jpg' />) no-repeat scroll 0 0 transparent;
		    height: 100%;
			display: inline-block;
			width: 100%;
		}

		.transparent {
		   filter:alpha(Opacity=70); 
		   -moz-opacity: 0.70; 
		   opacity: 0.70; 
		}

		#footer_wrapper {
		    font-family: verdana;
		    font-size: 10px;
		    padding: 16px 20px;
			border-top:	1px solid #CCC;
			margin-top: 50px;
		}

		#footer {
		    margin: auto;
		    max-width: 860px;
		}

		</style>
	</head>
	<body class="main_bdg">
		<div id="main_wrapper_block">
			<div id="site_header"><span id="yookos_logo"></span></div>
				<form action="$/jive/cs_login" method="post" name="loginform" autocomplete="off">
					<div id="sub_wrapper_block">
						<div id="sub_header_wrapper">
							<div id="sub_header">
								<a href="/jive/create-account.jspa">Don't have an account? Click here to get one</a>
							</div>
						</div>
						<div id="login_contents" class="transparent">
							<div id="login_wrapper">
								<div id="login_header">
									<h2>Login to Yookos</h2>
								</div>
								<div id="login_elements">
									<div class="clearfix" id="yookos-login-username">
										<label for="username01" class="login_label">Username:</label>
										<input type="text" name="username" size="30" maxlength="150" value="" tabindex="1" id="username01">
									</div>
									<div class="clearfix_none" id="jive-login-password">
										<label for="password01" class="login_label">Password:</label>
										<input type="password" name="password" size="30" maxlength="150" value="" tabindex="2" id="password01">
									</div>
									<div id="remember_me_wrapper">
										<input type="checkbox" id="remember_me" />
										<label for="remember_me" class="form_label">Remember me</label>
									</div>
									<div id="login_buttons">
										<div id="login_buttons_wrapper">
										    <span id="extra_elements_hidden_fields"><!-- place Hidden fields Here --></span>
										    <span><input type="submit"  name="login" value="Login" id="btn_login" /></span>
										    <span>or <a href="/jive/create-account.jspa" id="login_sign_up_link_bold">Signup to Yookos</a></span>
										</div>
										<div id="forgotten_password">
											<a href="emailPasswordToken!input.jspa" class="login_links">I forgot my password</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				
				</form>
			<div id="footer_wrapper">
				<div id="footer">&copy; 2012 Yookos</div>
			</div>
		</div>
		<!-- <div id="main_wrapper_background2">
		</div>-->
	</body>
</html>
