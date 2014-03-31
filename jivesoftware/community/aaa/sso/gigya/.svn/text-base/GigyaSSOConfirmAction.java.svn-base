package com.jivesoftware.community.aaa.sso.gigya;

import com.gigya.api.GigyaApi;
import com.gigya.bean.CustomJiveUser;
import com.gigya.bean.GigyaSSOBean;
import com.gigya.bean.RequiredFields;
import com.gigya.util.GigyaUtils;
import com.jivesoftware.base.User;
import com.jivesoftware.base.UserNotFoundException;
import com.jivesoftware.community.aaa.sso.ConfirmableAuthenticationToken;
import com.jivesoftware.community.action.util.AlwaysAllowAnonymous;
import com.jivesoftware.community.user.profile.ProfileFieldManager;
import com.jivesoftware.community.user.profile.ProfileManager;
import com.jivesoftware.community.web.struts.SetReferer;
import com.yookos.util.ProfileFieldUtils;

import net.sf.json.JSONObject;
import org.springframework.security.core.Authentication;

/**
 * @author Msawenkosi Ntuli
 *
 */
@SetReferer(false)
@AlwaysAllowAnonymous
public class GigyaSSOConfirmAction extends GigyaSSOBean{
	
	private static final String REGISTER = "register";
	private String uid;
	private long userId;
	private CustomJiveUser customJiveUser;
	private String provider;
	private User user;
	private JSONObject loginObj;
	private GigyaApi gigyaApi;
	private ProfileManager profileManager;
    private ProfileFieldManager profileFieldManager;
	
	public void init(Authentication authentication){
		
		confirmToken = (ConfirmableAuthenticationToken) authentication;
        auth = (GigyaAuthenticationToken)confirmableAuthenticationCache.get(confirmToken.getPrincipalID());
        userTemplate = gigyaUserSynchronizer.extractUserTemplate(auth);
        loginObj = getJSONObject();
	}
	
	@Override
    public String input() {
		
		Authentication authentication = authProvider.getAuthentication();

        if (!(authentication instanceof ConfirmableAuthenticationToken)) {
            return UNAUTHENTICATED;
        }        
        
        init(authentication);
        
        if (isSiteUid()){
        	
        	userId = GigyaUtils.convertStringToLong(userTemplate.getUsername());        	
        	if (userId == -1){
        		return ERROR;
        	}
        	
	       	user = getUser(userId);
	       	if (user == null){
		       	return ERROR; 
	       	}
	       	
	       	//update profile fields
	       	String userInfo = null;
	        try{
	        	if (loginObj.optString(GigyaConstants.PROVIDER_KEY).equals("facebook")){
		        	userInfo = gigyaApi.getUserInfo(userTemplate.getUsername());
		        	JSONObject json = new JSONObject(userInfo);
		        	company = json.getJSONArray(GigyaConstants.WORK_KEY).getJSONObject(0).optString(GigyaConstants.COMPANY_KEY);
		    		bio = json.optString(GigyaConstants.BIO_KEY);
		    		
		    		if (gender != null && !(gender.isEmpty())){
		    			ProfileFieldUtils.setProfileFieldValue(user, profileFieldManager, profileManager, GENDER_PROFILE_FIELD, gender);				
					}
					if ((birthday != null) && !(birthday.isEmpty())){
		    			//ProfileFieldUtils.setProfileFieldValue(user, profileFieldManager, profileManager, GENDER_PROFILE_FIELD, birthday);				
					}
					if ((bio != null) && !(bio.isEmpty())){
		    			ProfileFieldUtils.setProfileFieldValue(user, profileFieldManager, profileManager, BIO_PROFILE_FIELD, bio);				
					}
					if ((company != null) && !(company.isEmpty())){
		    			ProfileFieldUtils.setProfileFieldValue(user, profileFieldManager, profileManager, COMPANY_PROFILE_FIELD, company);				
					}
					if ((country != null) && !(country.isEmpty())){
		    			ProfileFieldUtils.setProfileFieldValue(user, profileFieldManager, profileManager, COUNTRY_PROFILE_FIELD, country);				
					}
	        	}
	        }
	        catch(Exception e){
	        	e.printStackTrace();
	        }		
	       	
	       	GigyaUtils.logIn(user);
	       	
	       	return SUCCESS;	       	
        }   
        //convert object structure
        loginObj = gigyaUserSynchronizer.getIdentityObject(loginObj);
        
        if (isEmailFoundInJiveUser()){
        	
        	user = getUser(customJiveUser.getID());
           	if (user == null){
		       	return ERROR; 
	       	}
	       	
           	email = userTemplate.getEmail();
        	uid = userTemplate.getUsername();
        	provider = loginObj.optString(GigyaConstants.PROVIDER_KEY);
        	extractFields();
        	logOut(uid);
        	return LINK;
        }
        else{
        	requiredFields();
        	return INPUT;
        } 
	}	
	
	protected boolean isSiteUid(){
		
		return loginObj.optBoolean(GigyaConstants.IS_SITE_UID);
	}
	
	protected boolean isEmailFoundInJiveUser(){
		
		requiredFields = new RequiredFields();
		
		if ((userTemplate.getEmail() == null) || (userTemplate.getEmail().isEmpty())){
			requiredFields.setEmail(false);
			return false;
		}
		else if ((customJiveUser = gigyaLoginDao.getCustomJiveUser(userTemplate.getEmail())) == null){
			return false;
		}
		else{
			return true;		
		}
	}
	
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
	
	@Override
	public String execute(){
		
		return SUCCESS;
	}
	
	private void logOut(String uid){
		
		gigyaApi.logOut(uid, "Logout: " + userTemplate.getUsername(), true, null);
	}
	
	private JSONObject getJSONObject(){
		
		return (JSONObject)auth.getDetails();
	}
	
	private User getUser(long id){
		
		try{
			return userManager.getUser(id);
		}
		catch (UserNotFoundException e){
			return null;
		}		
	}

	public String getUid() {
		return uid;
	}

	public void setUid(String uid) {
		this.uid = uid;
	}

	public long getUserId() {
		return userId;
	}

	public void setUserId(long userId) {
		this.userId = userId;
	}

	public String getProvider() {
		return provider;
	}

	public void setProvider(String provider) {
		this.provider = provider;
	}

	public CustomJiveUser getCustomJiveUser() {
		return customJiveUser;
	}

	public void setCustomJiveUser(CustomJiveUser customJiveUser) {
		this.customJiveUser = customJiveUser;
	}

	public GigyaApi getGigyaApi() {
		return gigyaApi;
	}

	public void setGigyaApi(GigyaApi gigyaApi) {
		this.gigyaApi = gigyaApi;
	}

	public JSONObject getLoginObj() {
		return loginObj;
	}

	public void setLoginObj(JSONObject loginObj) {
		this.loginObj = loginObj;
	}

	/**
	 * @return the profileManager
	 */
	public ProfileManager getProfileManager() {
		return profileManager;
	}

	/**
	 * @param profileManager the profileManager to set
	 */
	public void setProfileManager(ProfileManager profileManager) {
		this.profileManager = profileManager;
	}

	/**
	 * @return the profileFieldManager
	 */
	public ProfileFieldManager getProfileFieldManager() {
		return profileFieldManager;
	}

	/**
	 * @param profileFieldManager the profileFieldManager to set
	 */
	public void setProfileFieldManager(ProfileFieldManager profileFieldManager) {
		this.profileFieldManager = profileFieldManager;
	}
}
