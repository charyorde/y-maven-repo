<html>
	<head>
		<link href="<@resource.url themeName='yookos6' value="/styles/yookos.css" />" rel="stylesheet" />
		<link rel="stylesheet" href="/themes/yookos6/css/yookos.css">
		<script type="text/javascript" lang="javascript"
                src="http://cdn.gigya.com/JS/socialize.js?apikey=${JiveGlobals.getJiveProperty('gigya.apiKey')}">
                gigya.socialize.logout();
        </script>
	</head>
	<body >
		<!-- BEGIN main body -->
        <div id="msg-body-main">
            <!-- BEGIN main body column -->
            <div id="msg-body-maincol-container">
                <div id="msg-body-maincol">
                    <div class="sso-block msg-box msg-box-form msg-standard-formblock-container msg-login-reg-formblock clearfix size_3">
                        <#-- <div>${loginObj}</div> -->
                        <div class="yookos-welcome-top bbs1 mll mrl ptl pbm">
                            <div class="yookos-user-avatar">
                                <img src='${thumbnailURL}' class="yookos-avatar-img" />
                            </div>
                            <div class="yookos-sso-greeting"><span class="yookos-greeting-name">Welcome ${customJiveUser.firstName}!</span>
                            <span>Please select one of the following options:</div>
                        </div>
                        <div class="jive-standard-formblock dib ptl prxl pbm plxl">
                            <div>
                                <div class="info_text _10px">
                                    <h1 class="c_header_1">Link your existing Yookos account</h1>
                                </div>
                                <!--<div class="yookos-user-detail-row mtl">

                                    <div class="yookos-user-avatar">
                                        <img src='${thumbnailURL}' class="yookos-avatar-img" />
                                    </div>
                                    <div class="yookos-greeting-name">Welcome ${customJiveUser.firstName}!</div>
                                    <div class="yookos-greeting-message">Enter your current Yookos.com password to
                                    link your existing account with ${provider}</div>
                                </div>-->
                                <div class="yookos-info-row mtl">Enter your current Yookos.com password to link to your existing account with ${provider}.</div>
                            </div>
                        </div>
                        <div class="yookos-form-row yookos-sso-link-account">
                            <form action="link-accounts!input.jspa" method="POST">
                                <div class="jive-standard-formblock dib ptm prxl pbm plxl">
                                    <div id="yookosEmail" class="yookosLinkAccounts">
                                        Account email: <strong>${email}</strong>
                                    </div>
                                    <div id="yookosPassword" class="clearfix mtl">
                                        <label for="password01" class="yookosLinkAccounts font-color-meta clearfix"><@s.text name="global.password"/></label>
                                        <input type="password" id="password" name="password" class="mts" />
                                    </div>
                                </div>

                                <div class="plxl prxl pbxl">
                                    <div id="jive-login-button" class="clearfix">
                                        <#-- Login -->
                                        <input type="button" onclick="javascript:history.go(-1);" value="Cancel" />

                                        <input type="submit" name="login" id="login-submit"
                                               class="jive-form-button-submit j-btn-callout" value="Link accounts"/>


                                        <#-- <div id="yookosCancelButton" class="yookosLinkAccounts">
                                            <input type="button" onclick="javascript:history.go(-1);" value="Cancel" />
                                            <input type="submit" class="jive-form-button-submit j-btn-callout" value="Link accounts" />
                                        </div> -->
                                        <!-- hidden fields -->
                                        <input type="hidden" name="uid" id="uid" value="${uid}" />
                                        <input type="hidden" name="userId" id="userId" value="${customJiveUser.ID?c}" />
                                        <input type="hidden" name="provider" id="provider" value="${provider}" />
                                        <input type="hidden" name="username" id="username" value="${CustomJiveUser.username}" />
                                    </div>
                                    <div class="ptl">
                                        <#if (JiveGlobals.getJiveBooleanProperty("passwordReset.enabled", true))>
                                            <#-- I forgot my password -->
                                            <div id="jive-login-forgotpwd" class="jive-login-forgotpwd">
                                                <a href="<@s.url action='emailPasswordToken' method='input'/>"><@s.text name="login.forgot_pwd.link"/></a>
                                            </div>
                                        </#if>
                                        <#if (JiveGlobals.getJiveBooleanProperty("forgot.username.enabled", true))>
                                            <#-- I forgot my username -->
                                            <div id="jive-login-forgot-username" class="jive-login-forgot-username mts">
                                                <a href="<@s.url action='forgot-username' method='input'/>"><@s.text name="login.forgot_username.link"/></a>
                                            </div>
                                        </#if>
                                    </div>
                                </div>
                                <!-- <div class="yookos-deactivate-account-button-row">

                                </div> -->
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
	</body>
</html>