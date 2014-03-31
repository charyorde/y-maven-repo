<html>
<head>
    <title><@s.text name="login.user_login.title"/> - Gigya</title>
    <meta name="nouserbar" content="true"/>
    <meta name="nofooter" content="true"/>

    <#if externalLoginEnabled>
        <!-- BEGIN Gigya Login -->
        <#-- <link rel="stylesheet" type="text/css" href="<@s.url value="/plugins/social-integration/resources/styles/gigya-login.css?v=1.0.0" />" /> -->
        <script type="text/javascript" lang="javascript"
                src="http://cdn.gigya.com/JS/socialize.js?apikey=${JiveGlobals.getJiveProperty('gigya.apiKey')}">
        </script>

        <script type="text/javascript" src="<@resource.url value='/plugins/social-integration/resources/script/jquery.base64.js' />"></script>
        <script type="text/javascript" src="<@resource.url value='/plugins/social-integration/resources/script/gigya-login.js' />"></script>
        <!-- END Gigya Login -->

        <link rel="stylesheet" type="text/css" href="<@s.url value="/styles/jive-external-login.css" />" />
<#--
        <script type="text/javascript">
            jive.i18n.addMsgs({
                'sso.openid.invalid_url': '<@s.text name="sso.openid.invalid_url"/>',
                'sso.openid.implicit_upgrade': '<@s.text name="sso.openid.implicit_upgrade"/>',
                'sso.openid.implicit_downgrade': '<@s.text name="sso.openid.implicit_downgrade"/>'
            });
        </script>
        <@resource.javascript file="/resources/scripts/sso/external-login.js" />

        <#if facebookEnabled>
            <script src="https://connect.facebook.net/${locale}/all.js"></script>
            <script type="text/javascript">
                var appId = '${facebookApplicationID}';
            </script>
        </#if>
 -->
    </#if>

    <#-- The approved email domain list tooltip uses this -->
    <@resource.javascript file="/resources/scripts/jquery/jquery.tooltip.js" />

    <style type="text/css">
        a.tooltip {
            text-decoration: none;
            border-bottom: dotted 1px;
            font-size: 11px;
        }
        #tooltip {
            position:absolute;
            border:1px solid #dadada;
            background:#ffc;
            padding:8px 12px;
            color:#333;
            display:none;
            -moz-border-radius: 4px;
            -webkit-border-radius: 4px;
            border-radius: 4px;
            z-index: 99;
            width: 180px;
            text-align: left;
            font-size: 11px;
        }

        /* Hide header bar */
        #j-header-wrap {
            display: none !important;
        }
    </style>
</head>
<body class="jive-body-formpage jive-body-formpage-login login">

    <script type="text/javascript">
        $j(function () {

            $j("input#login-submit").prop('disabled', false);
            $j("form#loginform").submit( function() {
                $j("input#login-submit").val("<@s.text name="login.processing.text"/>");
                $j("input#login-submit").prop('disabled', true);
            });
            $j("input#register-submit").prop('disabled', false);
            $j("form#registerform").submit( function() {
                $j("input#register-submit").val("<@s.text name="login.processing.text"/>");
                $j("input#register-submit").prop('disabled', true);
            });
        });

    </script>

    <!-- BEGIN layout -->
    <div class="j-layout j-layout-l clearfix">
        <div id="logo-login"></div>
        <div id="logo-slogan" class="clearfix">
            <div class="glow"><@s.text name="yookos.login.logo.slogan"/></div>
        </div>
        <!-- BEGIN large column -->
        <div class="j-column-wrap-l">
            <div class="j-column j-column-l">

            <#assign showRegisterForm = (newAccountCreationEnabled && !jive.isSeatStatusBlocked())/>
            <#if showRegisterForm || externalLoginEnabled>
                <#if customIntro??>
                ${customIntro}
                <#else>
                <#-- Remove Section header
                 <section id="j-login-intro">
                    <h2><@s.text name="login.intro.header"/></h2>
                    <p><@s.text name="login.intro.text"/></p>
                </section>  -->
                </#if>
            </#if>

            <!-- BEGIN login form -->

            <div class="j-box j-enhanced jive-box jive-box-form jive-standard-formblock-container jive-login-reg-formblock clearfix <#if (!showRegisterForm || registerOnly) && (!externalLoginEnabled)>jive-login-short-width</#if>">
                <#include "/template/global/include/form-message.ftl" />
                <div class="jive-box-body jive-standard-formblock clearfix">

                    <#if approvalRequired>
                    <div class="jive-info-box">
                        <div>
                            <span class="jive-icon-med jive-icon-redalert"></span>
                            <@s.text name="login.info.acctNotApproved.text" />
                        </div>
                    </div>
                    </#if>

                    <#if accountExists>
                    <div class="jive-info-box">
                        <div>
                            <span class="jive-icon-med jive-icon-redalert"></span>
                            <@s.text name="login.info.acctAlreadyExists.text" />
                        </div>
                    </div>
                    </#if>


                    <#if !registerOnly>
                    <div id="jive-login-formblock" <#if (!showRegisterForm) && (!externalLoginEnabled)>class="jive-login-only-box"</#if>>

                        <h1><@s.text name="login.user_login.title"/></h1>
                        <p><@s.text name="login.description.text"/></p>

                        <#if JiveGlobals.getJiveBooleanProperty("jive.auth.forceSecure", false)>
                        <#assign loginURI><@s.url value="/cs_login" scheme="https"/></#assign>
                        <#else>
                        <#assign loginURI><@s.url value="/cs_login"/></#assign>
                        </#if>

                        <form action="${loginURI}" id="loginform" method="post" class="j-form" name="loginform01" autocomplete="off">

                            <#if (successURL?exists)>
                            <input type="hidden" name="successURL" value="${successURL?html}"/>
                            </#if>
                            <#if (cancelURL?exists)>
                            <input type="hidden" name="cancelURL" value="${cancelURL?html}"/>
                            </#if>

                            <#-- Username -->
                            <div id="jive-login-username" class="clearfix">
                                <#if usernameIsEmail>
                                    <label for="username01" class="font-color-meta"><@s.text name="global.email_address"/></label>
                                <#else>
                                    <label for="username01" class="font-color-meta"><@s.text name="global.username"/></label>
                                </#if>
                                <input type="text" name="username" size="30" maxlength="150" value="" id="username01"/>
                                <@macroFieldErrors name="username"/>
                            </div>

                            <#-- Password: -->
                            <div id="jive-login-password" class="clearfix">
                                <label for="password01" class="font-color-meta"><@s.text name="global.password"/></label>
                                <input type="password" name="password" size="30" maxlength="150" value="" id="password01" autocomplete="off" />
                                <@macroFieldErrors name="password"/>
                            </div>

                            <#if captchaImageUrl?has_content>
                            <#-- Captcha: -->
                            <div id="jive-login-captcha" class="clearfix">
                                <img src="${captchaImageUrl}" alt="">
                                <label for="user_guess" class="font-color-meta"><@s.text name="login.captcha.text" /></label>
                                <input type="text" name="user_guess" size="30" maxlength="150" value="" id="user_guess">
                                <@macroFieldErrors name="password"/>
                            </div>
                            </#if>

                            <#-- Remember Me -->
                            <#if action.isRememberMeEnabled() >
                            <div id="jive-login-rememberme" class="clearfix">
                                <input type="checkbox" name="autoLogin" id="autoLoginCb" value="true"/>
                                <label for="autoLoginCb"><@s.text name="global.remember_me"/></label>
                            </div>
                            </#if>

                            <div id="jive-login-button" class="clearfix">
                                <#-- Login -->
                                <input type="submit" name="login" id="login-submit"
                                       class="jive-form-button-submit j-btn-callout" <#if action.isLoginThrottled()>
                                       disabled='disabled' </#if> value="<@s.text name="global.login" />"/>
                            </div>


                            <#if (JiveGlobals.getJiveBooleanProperty("passwordReset.enabled", true))>
                                <#-- I forgot my password -->
                                <div id="jive-login-forgotpwd" class="jive-login-forgotpwd">
                                    <a href="<@s.url action='emailPasswordToken' method='input'/>"><@s.text name="login.forgot_pwd.link"/></a>
                                </div>
                            </#if>
                            <#if (JiveGlobals.getJiveBooleanProperty("forgot.username.enabled", true))>
                                <#-- I forgot my username -->
                                <div id="jive-login-forgot-username" class="jive-login-forgot-username">
                                    <a href="<@s.url action='forgot-username' method='input'/>"><@s.text name="login.forgot_username.link"/></a>
                                </div>
                            </#if>

                        </form>

                    </div>
                    </#if>
                   <div class="yookos-login-right-box">
                       <#if showRegisterForm>
                           <#if validationEnabled>

                           <#-- send validation email -->
                           <div id="jive-validate-formblock">
                               <#if validationSent>

                               <h2><@s.text name="login.validate.title"/></h2>
                               <p class="jive-validation-sent">
                                   <@s.text name="login.validate.desc">
                                       <@s.param><strong>${emailAddress!?html}</strong></@s.param>
                                   </@s.text>
                               </p>
                               <#else>

                               <h2><@s.text name="login.no_account.title"/></h2>
                               <p>
                               <#if SkinUtils.isDomainRestrictionEnabled() >
                                   <#if SkinUtils.getCompanyName()?? >
                                       <@s.text name="login.no_account.desc"><@s.param>${SkinUtils.getCompanyName()}</@s.param></@s.text>
                                   <#else>
                                       <@s.text name="login.no_account.desc.noCompany" />
                                   </#if>
                               <#else>
                                   <@s.text name="login.no_account.unrestrict.desc"/>
                               </#if>
                               </p>
                               <form action="<@s.url action='login'/>" method="post" id="registerform" class="j-form j-form-domaincheck" name="registerform01" autocomplete="off">
                                   <label for="emailAddress">
                                   <strong><@s.text name="login.email.text"/></strong>
                                       <#if SkinUtils.isDomainRestrictionEnabled() >
                                        <#if SkinUtils.isSingleDomain()>
                                           <span><@s.text name="login.email.info"><@s.param>${SkinUtils.getCompanyDomain()}</@s.param></@s.text></span>
                                        <#else>
                                            <a href="#" onClick="return false;" class="tooltip"
                                               title="<@s.text name="login.email.info.domains"> <@s.param>${SkinUtils.getAllCompanyDomainsHTML()}</@s.param> </@s.text>">
                                               <#if SkinUtils.getCompanyName()?? >
                                                   <span><@s.text name="login.email.info.multi"><@s.param>${SkinUtils.getCompanyName()}</@s.param></@s.text></span>
                                               <#else>
                                                   <span><@s.text name="login.email.info.multi.noCompany"/></span>
                                               </#if>
                                            </a>
                                        </#if>
                                       </#if>
                                   </label>
                                   <input type="text" name="emailAddress" id="emailAddress" value="${emailAddress!?html}" class="jive-validate-email"/>
                                   <input type="submit" id="register-submit" name="regsubmit" value="<@s.text name='login.email.confirm.button'/>"  class="jive-validate-confirm"/>
                                   <input type="hidden" name="method:register" value="true" />
                                   <input type="hidden" name="registerOnly" value=<#if registerOnly> "true" <#else> "false" </#if> />
                                   <@macroFieldErrors name="emailAddress"/>
                               </form>

                               </#if>

                           </div>

                           <#else>

                           <#-- create user account -->

                               <h3><@s.text name="login.no_account.title"/></h3>
                               <p id="jive-create-account-formblock">
                                   <@s.text name="login.create_account.text">
                                   <@s.param><a href="create-account.jspa"></@s.param>
                                       <@s.param></a></@s.param>
                                   </@s.text>
                               </p>

                           </#if>
                       </#if>

    <#-- Social Login -->
                        <#if externalLoginEnabled>
                            <div class="j-login-ext-login <#if (!showRegisterForm || registerOnly)>j-login-ext-login-noreg</#if>">
                            <#-- <h4><@s.text name="sso.external-login.login" /></h4>  -->

    <#--  OLD SOCIAL LOGIN BLOCK - TO BE REMOVED
                                <form id="external-login-choice" method="post" action="<@s.url value="/openid/sso" />" class="j-form">
                                    <p class="font-color-meta"><@s.text name="sso.external-login.provider" /></p>

                                    <div class="openid_provider_btns clearfix">
                                        <#list externalLogins as extLogin>
                                            <a href="${extLogin.URL}" class="${extLogin.name} ext_login_large_btn"></a>
                                        </#list>
                                    </div>

                                    <div class="js-openid-login-row">
                                        <div class="j-form-row js-openid-url-row">
                                            <label for="openid_url"><@s.text name="sso.openid.url" /></label>
                                            <input type="text" disabled="disabled" id="openid_url" />
                                        </div>
                                        <div class="j-form-row">
                                            <label for="openid_username" id="openid_username_label"><@s.text name="global.username" /></label>
                                            <input id="openid_username" type="text" />
                                        </div>
                                        <div class="j-form-row">
                                            <input type="submit" class="jive-form-button-submit j-btn-callout" value="<@s.text name="global.login" />" />
                                            <input type="submit" class="cancel" value="<@s.text name="global.cancel" />" />
                                        </div>
                                    </div>

                                    <input type="hidden" id="openid_identifier" name="openid_identifier" />
                                </form>
    -->

                                <!-- BEGIN Gigya Login -->
                                <div class="j-login-gigya-login">
                                    <#-- <p class="font-color-meta">
                                    <@s.text name="yookos.sso.external-login.login" />
                                    </p> -->
                                    <div id="loginDiv" class="mtl"></div>
                                    <script type="text/javascript">

                                        var params = {
                                            width: 300,
                                            enabledProviders : "facebook, twitter, google, linkedin, yahoo",
                                            showTermsLink:false, // remove 'Terms' link
                                            hideGigyaLink:true, // remove 'Gigya' link
                                            buttonsStyle: 'standard', // Change the default buttons design to "Full Logos" design
                                            showWhatsThis: true, // Pop-up a hint describing the Login Plugin, when the user rolls over the Gigya link.
                                            containerID: 'loginDiv', // The component will embed itself inside the loginDiv Div
                                            cid:'',
                                            lastLoginIndication : "welcome",
                                            lastLoginButtonSize: 25,
                                            height: 80,
                                            forceAuthentication: true,
                                            headerText : '<h4><@s.text name="sso.external-login.login" /></h4><p class="font-color-meta"><@s.text name="yookos.sso.external-login.login" /></p>'
                                        }

                                        gigya.socialize.showLoginUI(params);
                                        gigya.socialize.logout();
                                    </script>
                                    <#-- REVISIT FOR LOGOUT
                                    <br /><br />
                                    <p class="font-color-meta">Click the button below to sign out from Gigya platform:</p><br />
                                    <input id="btnLogout" type="button" value="Sign Out"
                                            onclick="gigyaLogin.logout()"/>
                                    <br />
                                    <br /> -->

                                </div>
                                <!-- END Gigya Login -->

                               <#if showRegisterForm>
                               <#-- create user account
                                   <h3><@s.text name="login.no_account.title"/></h3>
                                   <p id="jive-create-account-formblock">
                                       <@s.text name="login.create_account.text">
                                       <@s.param><a href="create-account.jspa"></@s.param>
                                           <@s.param></a></@s.param>
                                       </@s.text>
                                   </p>-->
                               </#if>

                            </div>
                        </#if>
                         <#-- End Social Login -->
                    </div>

                    <script type="text/javascript" language="JavaScript">
                        $j('#username01').focus();
                        <#if action.isLoginThrottled()>
                        var delay = ${loginDelay};
                        setTimeout(function() {
                            $j('#jive-error-box').fadeOut("fast");
                            $j('#login01').prop('disabled', false);
                        }, delay * 1000);
                        </#if>
                    </script>

                </div>
            </div>
            <!-- END login form -->


            </div>
        </div>
        <!-- END large column -->

    </div>
    <!-- END layout -->


</body>
</html>
