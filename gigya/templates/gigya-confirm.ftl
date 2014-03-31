<html>
	<head>
		<title>Social login</title>
		<script type="text/javascript">
		
			function validate(){
				
				return true;
			}
		
		</script>
	</head>
	<body>
		<form method="POST" action="gigya-sso-confirm.jspa" onSubmit="validate()">		
			We still need some details from you
			<br/>
			
			<#if requiredFields.firstName>
			<#else>
				<div>
					First Name:<br/>
					<input type="text" id="firstName" name="firstName" />				
				</div>
			</#if>
			
			<#if requiredFields.lastName>
			<#else>
				<div>
					Last Name:<br/>
					<input type="text" id="lastName" name="lastName" />				
				</div>
			</#if>
			
			<#if requiredFields.email>
			<#else>
				<div>
					Email:<br/>
					<input type="text" id="email" name="email" />				
				</div>
			</#if>
			
			<#if requiredFields.gender>
			<#else>
				<div>
					Gender:<br/>
					Male<input type="radio" id="gender" name="gender" />&nbsp;	
					Female<input type="radio" id="gender" name="gender" />			
				</div>
			</#if>
			
			<#if requiredFields.birthdate>
			<#else>
				<div>
					Date of birth:<br/>
					<input type="text" id="birthdate" name="birthdate" />		
				</div>
			</#if>
			
			<#if requiredFields.country>
			<#else>
				<div>
					Country:<br/>
					<select id="country" name="country">
						<option value="South Africa">South Africa</option>
					</select>			
				</div>
			</#if>	
			<div class="j-form-buttons clearfix">
                 <input type="submit" id="sso-confirm-save" value="{i18nText('global.login')}" />
            </div>		
		<form>		
	</body>
</html>