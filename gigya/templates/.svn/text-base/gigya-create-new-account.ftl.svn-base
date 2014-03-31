<html>
	<head>
		<title>Social login</title>
		<script type="text/javascript">
            $j(function() {

                var $selectDay =  $("#birthdate");
                var $selectMonth = $("#birthmonth");
                var $selectYear = $j("#birthyear");
                var selectedDay = $selectDay.val();

                var populateDays = function(maxValue) {
                    if(yookos.isEmpty(maxValue)) {
                        return false;
                    }
                    maxValue = parseInt(maxValue);

                    // get current selected value
                    $selectDay.empty();
                    var optVal;
                    $selectDay.append($j("<option></option>")
                                                 .text("-- day --"));

                    for(var i=1; i<=maxValue; i++) {
                        optVal = i;
                        if(i <= 9) {
                           optVal = '0' + i;
                        }
                        $selectDay.append($j("<option></option>")
                             .attr("value",optVal)
                             .text(optVal));
                    }

                    // reset to previous value
                    $selectDay.val(selectedDay);
                }

                for(var i=1960; i<2012; i++) {
                    $selectYear.append($j("<option></option>")
                         .attr("value",i)
                         .text(i));
                }

                function validateDate() {
                    // check leap year for february
                    // get value for year
                    var selYear = parseInt($selectYear.val());
                    var maxDays = 31;

                    switch ($selectMonth.val()) {
                        case "FEB" :    maxDays = 28;
                                        if(selYear % 4 == 0 && selYear != 0) {  // no remainder means year is a leap year
                                            // rebuild days to end in 29 days if selected month is feb
                                            maxDays = 29;
                                        }

                            break;
                        case "APR" :
                        case "JUN" :
                        case "SEP" :
                        case "NOV" :    maxDays = 30;
                            break;

                    }
                    populateDays(maxDays);

                }

                populateDays(31);
                $selectDay.change(function() {
                    selectedDay = $(this).val();
                });
                $selectMonth.change(function() {
                    validateDate();
                });
                $selectYear.change(function() {
                    validateDate();
                });
				
			$("#password").bind({
					mouseover	: function(){
				$("#yookos-gigya-tooltip").removeClass().show();
				},
					mouseout	: function() {
				$("#yookos-gigya-tooltip").hide();
				}
		
			});
	
			$("#yookos-gigya-password-text").bind({
				mouseover	: function(){
                    $("#yookos-gigya-tooltip").removeClass().show();
                },
				mouseout	: function() {
                    $("#yookos-gigya-tooltip").hide();
                }
			});
	
			$("#yookos-gigya-tipicon").bind({
				mouseover	: function(){
                    $("#yookos-gigya-tooltip").removeClass().show();
                },
				mouseout	: function() {
                    $("#yookos-gigya-tooltip").hide();
                }
			});
				
				

            });

        </script>
	</head>
	<body>
        <!-- BEGIN main body -->
        <div id="msg-body-main">
            <!-- BEGIN main body column -->
            <div id="msg-body-maincol-container">
                <div id="msg-body-maincol">
                    <div class="sso-block msg-box msg-box-form msg-standard-formblock-container msg-login-reg-formblock clearfix size_3">
                        <#include "/template/global/include/form-message.ftl" />
                        <div class="jive-standard-formblock dib ptxl prxl pbm plxl">
                            <div>
                                <div class="info_text _10px">
                                    <h1 class="c_header_1">Create your account</h1>
                                </div>
                                <div class="yookos-user-detail-row mtl">
                                    <div class="yookos-user-avatar">
                                        <img src='${loginObj.thumbnailURL}' class="yookos-avatar-img" />
                                    </div>
                                    <div class="yookos-greeting-name">Welcome ${firstName}!</div>
                                    <div class="yookos-greeting-message">You're almost done...</div>

                                </div>
                                <div class="yookos-info-row mtl">We still need some details from you. Please confirm your information and complete any missing fields</div>
                            </div>
                        </div>
                        <div class="yookos-form-row">
                        <form method="POST" action="gigya-create-new-account.jspa" onSubmit="validate()">
                            <div class="jive-standard-formblock dib ptm prxl pbxl plxl">
                                <div id="yookosFirstName" class="yookosRegistration mrm dib">
                                    <div>First Name:</div>
                                    <input type="text" id="firstName"<#if loginObj.firstName?has_content> readonly="readonly" value="${loginObj.firstName}"</#if> name="firstName" />
                                    <@macroFieldErrors name="firstName"/>
                                </div>

                                <div id="yookosLastName" class="yookosRegistration dib">
                                    <div>Last Name:</div>
                                    <input type="text" id="lastName"<#if loginObj.lastName?has_content> readonly="readonly" value="${loginObj.lastName}" </#if> name="lastName" />
                                </div>
                                <div id="yookosUsername" class="yookosRegistration mtm">
                                    <div>Username:</div>
                                    <input type="text" id="username" name="username" value="" />
                                    <@macroFieldErrors name="username"/>
                                </div>

                                <div id="yookosEmail" class="yookosRegistration mtm">
                                    <div>Email:</div>
                                    <input type="text" id="email"<#if loginObj.email?has_content> readonly="readonly" value="${loginObj.email}"</#if> name="email" />
                                    <input type="hidden" id="validateEmail" name="validateEmail" value="<#if loginObj.email?has_content>false<#else>true</#if>" />
                                    <@macroFieldErrors name="email"/>
                                </div>

                                <div id="yookosPassword" class="yookosRegistration mtm mrm dib">
                                    <div>Password:</div>
                                    <input type="password" id="password" name="password" />
                                    <@macroFieldErrors name="password"/>
                                </div>

                                <div id="yookosConfirmPassword" class="yookosRegistration mtm mrm dib">
                                    <div>Confirm password:</div>
                                    <input type="password" id="confirmPassword" name="confirmPassword" />
                                    <@macroFieldErrors name="confirmPassword"/>
                                </div>
                                <div id="yookosGender" class="yookosRegistration mtm dib">
                                    <div>Gender:</div>
                                    <select id="gender" name="gender">
                                        <option></option>
                                        <option>Male</option>
                                        <option>Female</option>
                                    </select>
                                </div>

                                <div id="yookosDateOfBirth" class="yookosRegistration mtm dib">
                                    <div>Date of Birth:</div>
                                    <div class="select">
                                        <select id="birthdate" name="birthdate">
                                            <option>-- day --</option>

                                        </select>
                                    </div>
                                    <div class="select">
                                        <select id="birthmonth" name="birthmonth">
                                            <option>-- month --</option>
                                            <option value="JAN">January</option>
                                            <option value="FEB">February</option>
                                            <option value="MAR">March</option>
                                            <option value="APR">April</option>
                                            <option value="MAY">May</option>
                                            <option value="JUN">June</option>
                                            <option value="JUL">July</option>
                                            <option value="AUG">August</option>
                                            <option value="SEP">September</option>
                                            <option value="OCT">October</option>
                                            <option value="NOV">November</option>
                                            <option value="DEC">December</option>
                                        </select>
                                    </div>
                                    <div class="select">
                                        <select id="birthyear" name="birthyear">
                                            <option>-- year --</option>
                                        </select>
                                    </div>
                                    <#--<input type="text" id="birthyear" name="birthyear" />
                                     <select id="birthyear" name="birthyear">
                                        <option>-- year --</option>
                                        <option value="1960">1960</option>
                                        <option value="1961">1961</option>
                                    </select> -->
                                </div>


                            </div>
                            <div class="yookos-message-box-button-row">
                                <input type="submit" id="sso-confirm-save" value="Create new account" />
                                <input type="reset" id="sso-reset" value="Reset" />
                                <input type="button" id="sso-cancel-create" onclick="javascript: window.location.href='/'" value="Cancel" />
                            </div>
							 <div id="yookos-gigya-tooltip" >
								<div id="yookos-gigya-tipPointer">
									<div id="yookos-gigya-tipPointerWhite"></div>
								</div>
								<div id="yookos-gigya-innerToolTip">
										<div id="yookos-gigya-tooltiptext">
											<@s.text name="yookos.gigya.createaccount.password.tooltip"/>
										</div>			
									</div>
							</div>
                        <form>
                    </div>
                </div>
            </div>
        </div>
	</body>
</html>