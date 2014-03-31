package com.jivesoftware.community.aaa.sso.gigya;


import net.sf.json.JSONObject;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import com.gigya.api.GigyaApi;
import com.gigya.bean.GigyaSSOBean;
import com.gigya.util.GigyaUtils;
import com.jivesoftware.base.User;
import com.jivesoftware.base.UserNotFoundException;
import com.jivesoftware.community.aaa.JiveUserDetails;
import com.jivesoftware.community.aaa.sso.ConfirmableAuthenticationToken;
import com.jivesoftware.community.action.util.AlwaysAllowAnonymous;
import com.jivesoftware.community.user.profile.ProfileFieldManager;
import com.jivesoftware.community.user.profile.ProfileManager;
import com.jivesoftware.community.web.struts.SetReferer;
import com.yookos.util.ProfileFieldUtils;

/**
 * @author Msawenkosi Ntuli
 *
 */
@SetReferer(false)
@AlwaysAllowAnonymous
public class GigyaLinkAccounts extends GigyaSSOBean {

	private String uid;
	private String userId;
	private String provider;
	private String password;
	private User user;
	private GigyaApi gigyaApi;
	private AuthenticationManager authenticationManager;
	private static final String UNAUTHORIZED = "unauthorized";
	private ProfileManager profileManager;
    private ProfileFieldManager profileFieldManager;
	
	public GigyaAuthenticationToken getAuth(){
		
		Authentication authentication = authProvider.getAuthentication();
		confirmToken = (ConfirmableAuthenticationToken) authentication;
        return (GigyaAuthenticationToken)confirmableAuthenticationCache.get(confirmToken.getPrincipalID());
	}	
	
	public String execute(){
		
		long id = GigyaUtils.convertStringToLong(this.userId);
		
		if (id == -1){
    		return ERROR;
    	}
		
		if ((uid != null && !uid.isEmpty()) && 
			(provider != null && !provider.isEmpty()) &&	
			(user = getUser(id)) != null){
			username = user.getUsername();
			if (isPasswordValid()){
				if (gigyaApi.notifyRegistration(uid, userId).equalsIgnoreCase(GigyaApi.STATUS_SUCCESS)){					
					JSONObject loginObj = (JSONObject)getAuth().getDetails();	
					try{
					 	JiveUserDetails details = getAuth().getJiveUserDetails();
					 	String userInfo = gigyaApi.getUserInfo(String.format("%s", details.getUserID()));
			        	JSONObject json = new JSONObject(userInfo);
			        	if (json.optString(GigyaConstants.PROVIDER_KEY).equals("facebook")){
				        	String company = json.getJSONArray(GigyaConstants.WORK_KEY).getJSONObject(0).optString(GigyaConstants.COMPANY_KEY);
				    		String bio = json.optString(GigyaConstants.BIO_KEY);
				    		String gender = loginObj.optString(GigyaConstants.GENDER_KEY);   
				    		String birthday = loginObj.optString(GigyaConstants.BIRTH_DAY_KEY);		
				    		String country = loginObj.optString(GigyaConstants.COUNTRY_KEY);
				    		User user = details.getUser();
				    		if (gender != null && !(gender.isEmpty())){
				    			ProfileFieldUtils.setProfileFieldValue(user, profileFieldManager, profileManager, GigyaSSOBean.GENDER_PROFILE_FIELD, gender);				
							}
							if ((birthday != null) && !(birthday.isEmpty())){
				    			ProfileFieldUtils.setProfileFieldValue(user, profileFieldManager, profileManager, GigyaSSOBean.BIRTHDATE_PROFILE_FIELD, birthday);				
							}
							if ((bio != null) && !(bio.isEmpty())){
				    			ProfileFieldUtils.setProfileFieldValue(user, profileFieldManager, profileManager, GigyaSSOBean.BIO_PROFILE_FIELD, bio);				
							}
							if ((company != null) && !(company.isEmpty())){
				    			ProfileFieldUtils.setProfileFieldValue(user, profileFieldManager, profileManager, GigyaSSOBean.COMPANY_PROFILE_FIELD, company);				
							}
							if ((country != null) && !(country.isEmpty())){
				    			ProfileFieldUtils.setProfileFieldValue(user, profileFieldManager, profileManager, GigyaSSOBean.COUNTRY_PROFILE_FIELD, country);				
							}
			        	}
			        }
			        catch (Exception e){
			        	e.printStackTrace();
			        }	
				 	gigyaUserSynchronizer.update(getAuth());					
					GigyaUtils.logIn(user);
					return SUCCESS;
				}
			}
			else{
				return UNAUTHORIZED;
			}
		}
		return ERROR;
	}
	
	public boolean isPasswordValid(){		
		
		try{
			UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken(username, password);
			org.springframework.security.core.Authentication auth = authenticationManager.authenticate(authRequest);
			
			if (auth != null && auth.isAuthenticated()){
				return true;
			}
			else{
				return false;
			}	
		}
		catch (Exception e){
			return false;
		}			
	}
	
	public String input(){
		
		return execute();
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

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getProvider() {
		return provider;
	}

	public void setProvider(String provider) {
		this.provider = provider;
	}

	public GigyaApi getGigyaApi() {
		return gigyaApi;
	}

	public void setGigyaApi(GigyaApi gigyaApi) {
		this.gigyaApi = gigyaApi;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public AuthenticationManager getAuthenticationManager() {
		return authenticationManager;
	}

	public void setAuthenticationManager(AuthenticationManager authenticationManager) {
		this.authenticationManager = authenticationManager;
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
