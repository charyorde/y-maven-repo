package com.jivesoftware.community.aaa.sso.gigya;

import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.springframework.security.authentication.encoding.MessageDigestPasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

import com.gigya.api.GigyaApi;
import com.gigya.bean.CustomJiveUser;
import com.gigya.bean.GigyaSSOBean;
import com.gigya.bean.RequiredFields;
import com.gigya.util.GigyaUtils;
import com.jivesoftware.base.EmailAlreadyExistsException;
import com.jivesoftware.base.UnauthorizedException;
import com.jivesoftware.base.User;
import com.jivesoftware.base.UserAlreadyExistsException;
import com.jivesoftware.base.UserNotFoundException;
import com.jivesoftware.base.UserTemplate;
import com.jivesoftware.base.aaa.JiveUserDetailAdapter;
import com.jivesoftware.community.JiveGlobals;
import com.jivesoftware.community.aaa.sso.ConfirmableAuthenticationToken;
import com.jivesoftware.community.action.util.AlwaysAllowAnonymous;
import com.jivesoftware.community.lifecycle.JiveApplication;
import com.jivesoftware.community.mail.EmailManager;
import com.jivesoftware.community.mail.EmailMessage;
import com.jivesoftware.community.mail.util.EmailValidationHelper;
import com.jivesoftware.community.trial.TrialManager;
import com.jivesoftware.community.user.profile.ProfileField;
import com.jivesoftware.community.user.profile.ProfileFieldManager;
import com.jivesoftware.community.user.profile.ProfileFieldOption;
import com.jivesoftware.community.user.profile.ProfileFieldValue;
import com.jivesoftware.community.user.profile.ProfileManager;
import com.jivesoftware.community.user.registration.UserAccountFormValidator;
import com.jivesoftware.community.validation.form.FormFieldError;
import com.jivesoftware.community.validation.form.KeyedFormFieldError;
import com.jivesoftware.community.web.JiveResourceResolver;
import com.jivesoftware.community.web.struts.SetReferer;
import net.sf.json.JSONObject;
import org.springframework.security.core.Authentication;

import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.regex.Pattern;

/**
 * @author Msawenkosi Ntuli
 *
 */
@SetReferer(false)
@AlwaysAllowAnonymous
public class GigyaCreateNewAccount extends GigyaSSOBean {

	private User user;
	private GigyaApi gigyaApi;
	private String uid;
	private CustomJiveUser customJiveUser;
	private JSONObject loginObj;
	private String provider;
	private String validateEmail;
    private UserAccountFormValidator userAccountFormValidator;
    private GigyaCookie gigyaCookie;
    private EmailValidationHelper emailValidationHelper;
    private ProfileManager profileManager;
    private ProfileFieldManager profileFieldManager;
    private TrialManager trialManager;
    private EmailManager emailManager;
    public static final Pattern VALID_EMAIL_ADDRESS_REGEX = Pattern.compile(com.yookos.util.EmailRegEx.EMAIL_REG_EX.getValue(), Pattern.CASE_INSENSITIVE);
    private static final String PROPERTY_EMAIL_SUBJECT = "validation.email.subject";
    private static final String PROPERTY_EMAIL_BODY = "validation.email.textBody";
    private static final String PROPERTY_EMAIL_HTML = "validation.email.htmlBody";
    public static final String VALIDATION_LINK_ATTR = "gigyaKey"; //flags link generate via Gigya registration flow
    public static Map<String, String> month = new HashMap<String, String>(){{
    		put("January", "01");
    		put("February", "02");
    		put("March", "03");
    		put("April", "04");
    		put("May", "05");
    		put("June", "06");
    		put("July", "07");
    		put("August", "08");
    		put("September", "09");
    		put("October", "10");
    		put("November", "11");
    		put("December", "12");
    	}
    };
    
	public void init(Authentication authentication){
		
		confirmToken = (ConfirmableAuthenticationToken) authentication;
        auth = (GigyaAuthenticationToken)confirmableAuthenticationCache.get(confirmToken.getPrincipalID());
        userTemplate = gigyaUserSynchronizer.extractUserTemplate(auth);
        loginObj = gigyaUserSynchronizer.getIdentityObject(getJSONObject());
	}	
	
	public String execute(){
		
		Authentication authentication = authProvider.getAuthentication();

        if (!(authentication instanceof ConfirmableAuthenticationToken)) {
            return UNAUTHENTICATED;
        }        
        
        init(authentication); 
		
		if (!isValid()){
			return input();
		}
		
		uid = userTemplate.getUsername();
		
		if ((customJiveUser = gigyaLoginDao.getCustomJiveUser(email)) == null){
			if (validateEmail != null && validateEmail.equalsIgnoreCase("true")){
				return (this.isValidationRequestSent() && (isRegistrationSuccess(false)))? SUCCESS : ERROR;
			}
			//Email already validated by service provider
			if (isRegistrationSuccess(true)){
				gigyaApi.notifyRegistration(uid, String.format("%s", user.getID()));
				GigyaUtils.logIn(user);
				return LOGIN;
			}
			return ERROR;
		}
		extractFields();
		return LINK;
	}
	
	public String input(){
		
		Authentication authentication = authProvider.getAuthentication();

        if (!(authentication instanceof ConfirmableAuthenticationToken)) {
            return UNAUTHENTICATED;
        }        
        
        init(authentication); 
        
		requiredFields();
		return INPUT;
	}
	
	@Deprecated
	private void createCookie(){
    	
		try {
			cookieName = gigyaCookie.getName();
			cookieValue = gigyaCookie.getValue();
			cookiePath = gigyaCookie.getPath();
		} 
		catch (InvalidKeyException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 
		catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
    }

	/*
	  	  Fields received from Facebook;
		  firstName						
		  lastName						
		  nickname						
		  email		 				
		  age		 			 	 
		  birthDay		 			 	 
		  birthMonth		 			 	 
		  birthYear		 			 	 
		  gender		 			 	
		  city		 		 	 	 
		  state		 	 	 		 
		  country			 			 
		  photoURL						
		  thumbnailURL			 	 		
		  interests		 	 	 		 
		  activities		 	 	 	 	 
		  profileURL				 		
		  likes		 	 	 	 	 
		  languages		 	 	 		 
		  address	 	 	 	 		 
		  phones	 	 	 	 		 
		  education		 	 	 		 
		  honors	 	 	 	 		 
		  publications	 	 	 	 		 
		  patents	 	 	 	 		 
		  certifications	 	 	 	 		 
		  professionalHeadline	 	 	 	 		 
		  bio		 	 	 		 
		  industry	 	 	 	 		 
		  specialties	 	 	 	 		 
		  work		 	 	 		 
		  skills	 	 	 	 		 
		  religion		 	 	 	 	 
		  politicalView		 	 	 	 	 
		  interestedIn		 	 	 	 	 
		  relationshipStatus		 	 	 	 	 
		  hometown		 	 	 	 	 
		  favorites		 	 	 		 
		  username		 	 	 	 	 
		  locale		 			 	 
		  verified		 	 	 	 	 
		  timezone		 	 	 	 	 
		  UID						
		  UIDSignature						
		  capabilities						
		  identities						
		  isConnected						
		  isLoggedIn						
		  isSiteUID						
		  isSiteUser						
		  loginProvider						
		  loginProviderUID						
		  providers						
	 */
	public void extractFields(){
		
		firstName = userTemplate.getFirstName();
		lastName = userTemplate.getLastName();
		nickname = loginObj.optString(GigyaConstants.NICKNAME_KEY);
		email = userTemplate.getEmail();
		gender = loginObj.optString(GigyaConstants.GENDER_KEY);
		birthday = loginObj.optString(GigyaConstants.BIRTH_DAY_KEY);		
		birthdate = loginObj.optString(GigyaConstants.BIRTH_MONTH_KEY);
		birthyear = loginObj.optString(GigyaConstants.BIRTH_YEAR_KEY);
		country = loginObj.optString(GigyaConstants.COUNTRY_KEY);
		state = loginObj.optString(GigyaConstants.STATE_KEY);		
		city = loginObj.optString(GigyaConstants.CITY_KEY);
		provider = loginObj.optString(GigyaConstants.PROVIDER_KEY);
		thumbnailURL = loginObj.optString(GigyaConstants.THUMBNAIL_KEY);
		photoURL = loginObj.optString(GigyaConstants.PHOTO_KEY);
		zip = loginObj.optString(GigyaConstants.ZIP_KEY);
		
		String userInfo = null;
        try{
        	if (loginObj.optString(GigyaConstants.PROVIDER_KEY).equals("facebook")){
	        	userInfo = gigyaApi.getUserInfo(userTemplate.getUsername());
	        	JSONObject json = new JSONObject(userInfo);
	        	company = json.getJSONArray(GigyaConstants.WORK_KEY).getJSONObject(0).optString(GigyaConstants.COMPANY_KEY);
	    		bio = json.optString(GigyaConstants.BIO_KEY);
        	}
        }
        catch(Exception e){
        	e.printStackTrace();
        }		
	}
	
	public void requiredFields(){
		
		requiredFields = new RequiredFields();		
		extractFields();
		
		if ((firstName != null) && (!firstName.isEmpty())){			
			requiredFields.setFirstName(false);
		}
		if ((lastName != null) && (!lastName.isEmpty())){			
			requiredFields.setLastName(false);
		}
		if ((email != null) && (!email.isEmpty())){			
			requiredFields.setEmail(false);
		}
		if ((gender != null) && (gender.isEmpty())){
			requiredFields.setGender(false);
		}
		if ((country != null) && (country.isEmpty())){			
			requiredFields.setCountry(false);
		}
	}
	
	private boolean isRegistrationSuccess(boolean enabled){
		
		uid = userTemplate.getUsername();
		userTemplate.setUsername(username);
		userTemplate.setPassword(password);
		userTemplate.setEmail(email);
		userTemplate.setFirstName(firstName);
		userTemplate.setLastName(lastName);
		userTemplate.setEnabled(enabled);
		
		try {
			user = gigyaUserSynchronizer.create(userTemplate, auth);
			if (gender != null && !(gender.isEmpty())){
				setProfileFieldValue(GENDER_PROFILE_FIELD, gender);				
			}
			if ((birthday != null) && !(birthday.isEmpty())){
				setProfileFieldValue(BIRTHDATE_PROFILE_FIELD, birthday);
			}
			if ((bio != null) && !(bio.isEmpty())){
				setProfileFieldValue(BIO_PROFILE_FIELD, bio);
			}
			if ((company != null) && !(company.isEmpty())){
				setProfileFieldValue(COMPANY_PROFILE_FIELD, company);
			}
			if ((country != null) && !(country.isEmpty())){
				setProfileFieldValue(COUNTRY_PROFILE_FIELD, country);
			}
			
		} 
		catch (UserAlreadyExistsException e) {
			e.printStackTrace();
			return false;
		} 
		catch (EmailAlreadyExistsException e) {
			e.printStackTrace();
			return false;
		}
		catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		return true;
	}
	
	private boolean isValid(){
		
		Collection<FormFieldError> errors;
		boolean valid = true;
		
		errors = userAccountFormValidator.validateFirstName(firstName).getErrors();
		if ((errors != null) && (!errors.isEmpty())){
			addFieldErrors("firstName", errors);
			errors = null;
			valid = false;
		}
		
		errors = userAccountFormValidator.validateLastName(lastName).getErrors();
		if ((errors != null) && (!errors.isEmpty())){
			addFieldErrors("lastName", errors);
			errors = null;
			valid = false;
		}
		
		errors = userAccountFormValidator.validateUsername(username).getErrors();
		if ((errors != null) && (!errors.isEmpty())){
			addFieldErrors("username", errors);
			errors = null;
			valid = false;
		}
		
		errors = userAccountFormValidator.validatePassword(password).getErrors();
		if ((errors != null) && (!errors.isEmpty())){
			addFieldErrors("password", errors);
			errors = null;
			valid = false;
		}
		
		errors = userAccountFormValidator.validatePasswordConfirm(password, confirmPassword).getErrors();
		if ((errors != null) && (!errors.isEmpty())){
			addFieldErrors("confirmPassword", errors);
			errors = null;
			valid = false;
		}
		
		if (validateEmail != null && validateEmail.equalsIgnoreCase("true")){
			//custom email validation - do not check if email has already been taken
			if (!isEmail(email)){
				addFieldError("emailAddress", "Invalid email address.");
				valid = false;
			}
		}
		
		return valid;
	}
	
	public boolean isEmail(String emailStr){
		
		return (VALID_EMAIL_ADDRESS_REGEX.matcher(emailStr)).find();
	}
	
	protected void addFieldErrors(String fieldName, Collection<FormFieldError> fieldErrors) {
		
        for (FormFieldError fieldError : fieldErrors) {
            if (fieldError instanceof KeyedFormFieldError) {
                KeyedFormFieldError keyedError = (KeyedFormFieldError) fieldError;
                addFieldError(fieldName, getText(keyedError.getTextKey(), keyedError.getArgs()));
            }
        }
    }
	
	public void setProfileFieldValue(String profileFieldName, String profileFieldValue) {		
		
		try{
			profileFieldManager = JiveApplication.getContext().getProfileFieldManager();
			profileManager = JiveApplication.getContext().getProfileManager();
			
			Map<Long, ProfileFieldValue> profile = profileManager.getProfile(getTargetUser());
			
			ProfileField pField = profileFieldManager.getProfileField(profileFieldName);
			ProfileFieldValue pFieldValue = profile.get(pField.getID());
			
			if (pFieldValue == null){
				pFieldValue = new ProfileFieldValue(pField);
			}
			
			if (pField.getType() == ProfileField.Type.SINGLELIST){
				if (!isValidOption(pField, profileFieldValue)){
					throw new Exception("Invalid profile field option");
				}
			}
			pFieldValue.setValue(profileFieldValue);
			
			List<ProfileFieldValue> list = new ArrayList<ProfileFieldValue>();  
			
			for (ProfileFieldValue value : profile.values()){
				if (value.getFieldID() != pFieldValue.getFieldID()){
					list.add(value);
				}
				continue;
			}
			list.add(pFieldValue);
			profileManager.setProfile(user, list);			
		}
		catch (UnauthorizedException e){
			e.printStackTrace();
			System.out.print(e.getMessage());
		}
		catch (Exception e){
			e.printStackTrace();
			System.out.print(e.getMessage());
		}		
	}
	
	public boolean isValidOption(ProfileField field, String value) {
        
		for (ProfileFieldOption option : field.getOptions()) {
            if (option.getValue().equals(value)) {
                return true;
            }
        }
        return false;
	}
		
	public UserTemplate getTargetUser(){
		
		return (user == null)? null : (new UserTemplate(user));
	}
	
	 /**
     * Sends a validation request to the new user with a link to validate their account.
     *
     * @param email the email address to validate
     * @throws com.jivesoftware.base.EmailAlreadyExistsException if the email address exists
     */
    public boolean isValidationRequestSent(){
        
    	try{
    		UserTemplate template = new UserTemplate();
            template.setEmail(email);
            User user = userManager.getUser(template);
            if (user != null) {
                throw new EmailAlreadyExistsException();
            }
            String validationKey = emailValidationHelper.generateValidationKey(email);

            EmailMessage message = new EmailMessage();
            message.setHtmlBodyProperty(PROPERTY_EMAIL_HTML);
            message.setTextBodyProperty(PROPERTY_EMAIL_BODY);
            message.setSubjectProperty(PROPERTY_EMAIL_SUBJECT);
            message.addRecipient(null, email);
            message.setLocale(JiveGlobals.getLocale());
            message.getContext().put("link", String.format("%s&%s=true", 
            											    emailValidationHelper.generateValidationLink(email, validationKey),
            												VALIDATION_LINK_ATTR));
            //message.getContext().put("formLink", emailValidationHelper.generateValidationFormLink());
            message.getContext().put("formLink", this.generateValidationFormLink());
            message.getContext().put("email", email);
            message.getContext().put("validationKey", validationKey);
            message.getContext().put("trialEnabled", trialManager.isTrialInProgress());
            emailManager.send(message);
    	}
    	catch (EmailAlreadyExistsException e) {
            List<String> args = new ArrayList<String>(1);
            args.add(email);
            addFieldError("emailAddress", getText("register.email.exists", args));
            return false;
        }  
        return true;
    }
    
    public String generateValidationFormLink() {
    	
        String jiveURL = JiveResourceResolver.getEmailBaseURL();
        StringBuffer formLink = new StringBuffer();
        
        if (jiveURL != null) {
            formLink.append(jiveURL);
            formLink.append(String.format("/validate!input.jspa?%s=true", VALIDATION_LINK_ATTR));
        }
        else {
            log.error("jiveURL property is not specified, link will not be added to the email");
        }
        return formLink.toString();
    }
		
	private User getUser(long id){
		
		try{
			return userManager.getUser(id);
		}
		catch (UserNotFoundException e){
			return null;
		}		
	}

	public GigyaApi getGigyaApi() {
		return gigyaApi;
	}

	public void setGigyaApi(GigyaApi gigyaApi) {
		this.gigyaApi = gigyaApi;
	}	
	
	private JSONObject getJSONObject(){
		
		return (JSONObject)auth.getDetails();
	}

	public String getUid() {
		return uid;
	}

	public void setUid(String uid) {
		this.uid = uid;
	}

	public CustomJiveUser getCustomJiveUser() {
		return customJiveUser;
	}

	public void setCustomJiveUser(CustomJiveUser customJiveUser) {
		this.customJiveUser = customJiveUser;
	}

	public String getProvider() {
		return provider;
	}

	public void setProvider(String provider) {
		this.provider = provider;
	}

	public UserAccountFormValidator getUserAccountFormValidator() {
		return userAccountFormValidator;
	}

	public void setUserAccountFormValidator(UserAccountFormValidator userAccountFormValidator) {
		this.userAccountFormValidator = userAccountFormValidator;
	}

	public String getValidateEmail() {
		return validateEmail;
	}

	public void setValidateEmail(String validateEmail) {
		this.validateEmail = validateEmail;
	}

	public GigyaCookie getGigyaCookie() {
		return gigyaCookie;
	}

	public void setGigyaCookie(GigyaCookie gigyaCookie) {
		this.gigyaCookie = gigyaCookie;
	}

	public EmailValidationHelper getEmailValidationHelper() {
		return emailValidationHelper;
	}

	public void setEmailValidationHelper(EmailValidationHelper emailValidationHelper) {
		this.emailValidationHelper = emailValidationHelper;
	}

	public ProfileManager getProfileManager() {
		return profileManager;
	}

	public void setProfileManager(ProfileManager profileManager) {
		this.profileManager = profileManager;
	}

	public ProfileFieldManager getProfileFieldManager() {
		return profileFieldManager;
	}

	public void setProfileFieldManager(ProfileFieldManager profileFieldManager) {
		this.profileFieldManager = profileFieldManager;
	}

	public JSONObject getLoginObj() {
		return loginObj;
	}

	public void setLoginObj(JSONObject loginObj) {
		this.loginObj = loginObj;
	}

	public TrialManager getTrialManager() {
		return trialManager;
	}

	public void setTrialManager(TrialManager trialManager) {
		this.trialManager = trialManager;
	}

	public EmailManager getEmailManager() {
		return emailManager;
	}

	public void setEmailManager(EmailManager emailManager) {
		this.emailManager = emailManager;
	}
}
