package com.jivesoftware.community.aaa.sso.gigya;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import org.apache.commons.codec.binary.Base64;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;

import com.gigya.api.GigyaApi;
import com.gigya.bean.GigyaSSOBean;
import com.gigya.socialize.SigUtils;
import com.jivesoftware.base.User;
import com.jivesoftware.cache.Cache;
import com.jivesoftware.community.JiveGlobals;
import com.jivesoftware.community.aaa.JiveUserAuthentication;
import com.jivesoftware.community.aaa.JiveUserDetails;
import com.jivesoftware.community.aaa.PostAuthenticationSetupStrategy;
import com.jivesoftware.community.aaa.sso.ConfirmableAuthenticationToken;
import com.jivesoftware.community.aaa.sso.SSOAuthenticationException;
import com.jivesoftware.community.aaa.sso.external.ExternalType;
import com.jivesoftware.community.user.profile.ProfileFieldManager;
import com.jivesoftware.community.user.profile.ProfileManager;
import com.jivesoftware.util.StringUtils;
import com.yookos.util.ProfileFieldUtils;

public class GigyaAuthenticationFilter extends AbstractAuthenticationProcessingFilter {

    private static final Logger log = Logger.getLogger(GigyaAuthenticationFilter.class);

    private GigyaConfiguration gigyaConfiguration;
    private GigyaAuthenticationProvider gigyaAuthenticationProvider;
    private GigyaUserSynchronizer gigyaUserSynchronizer;
    private PostAuthenticationSetupStrategy postAuthenticationSetupStrategy;
    private Cache<String, Authentication> confirmableAuthenticationCache;
    private GigyaApi gigyaApi;
    private ProfileManager profileManager;
    private ProfileFieldManager profileFieldManager;
    
    public GigyaAuthenticationFilter(String defaultFilterProcessesUrl) {
        super(defaultFilterProcessesUrl);
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException, IOException, ServletException {

        String base64LoginObj = request.getParameter("login_obj");

        if (StringUtils.isBlank(base64LoginObj)) {
            log.warn("Gigya authentication filter was accessed without a valid user object");
            throw new SSOAuthenticationException("Gigya authentication failed");
        }

        JSONObject loginObj =  new JSONObject(new String(Base64.decodeBase64(base64LoginObj.getBytes(JiveGlobals.getCharset())), JiveGlobals.getCharset()));

        verifySignature(loginObj);
        
        GigyaAuthenticationToken auth = (GigyaAuthenticationToken) gigyaAuthenticationProvider.authenticate(new GigyaAuthenticationToken(loginObj));

        //so if the user template exists, this means they need to be confirmed
        JiveUserDetails details = auth.getJiveUserDetails();
        
        //logout from Gigya
        gigyaApi.logOut(loginObj.optString(GigyaConstants.UID_KEY), "Logout: ", true, null);

        if (details.isAnonymous()) {
            confirmableAuthenticationCache.put(String.valueOf(auth.getPrincipal()), auth);

            ConfirmableAuthenticationToken confirmableToken = new ConfirmableAuthenticationToken(GigyaTypeProvider.GIGYA,
                    String.valueOf(auth.getPrincipal()));

            SecurityContextHolder.getContext().setAuthentication(confirmableToken);

            response.sendRedirect(JiveGlobals.getDefaultBaseURL() + "/gigya-sso-confirm!input.jspa");

            return null;
        }
      
        //todo, under pressure. sorry for the copy paste. herpy derpy.
        if (details.getUser().getStatus().equals(User.Status.awaiting_moderation)) {

            response.sendRedirect(JiveGlobals.getDefaultBaseURL() + "/account-pending.jspa");

            return null;
        }
        
        String userInfo = null;
        try{
        	if (loginObj.optString(GigyaConstants.PROVIDER_KEY).equals("facebook")){
	        	userInfo = gigyaApi.getUserInfo(String.format("%s", details.getUserID()));
	        	JSONObject json = new JSONObject(userInfo);
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
        catch(Exception e){
        	e.printStackTrace();
        }	
        //the user already exists if here
        return new JiveUserAuthentication(gigyaUserSynchronizer.update(auth));
    }
    
    private void verifySignature(JSONObject data) {
       
    	String uid = (data.optString(GigyaConstants.UID_KEY));
    	String signatureTimestamp = (data.optString(GigyaConstants.SIGNATURE_TIMESTAMP_KEY));;
    	String secreteKey = gigyaConfiguration.getApplicationSecret();
    	String uidSignature = (data.optString(GigyaConstants.UID_SIGNATURE_KEY));;
        
        if (StringUtils.isBlank(uidSignature)) {
            log.warn("Gigya authentication filter was accessed without a valid signature");
            throw new SSOAuthenticationException("Gigya authentication failed");
        }
        try {
			if (!SigUtils.validateUserSignature(uid, signatureTimestamp, secreteKey, uidSignature)){
				log.warn("Gigya authentication filter was accessed without a valid signature");
	            throw new SSOAuthenticationException("Gigya authentication failed");
			}
		} 
        catch (InvalidKeyException e) {
        	throw new SSOAuthenticationException("Gigya authentication failed");
		} 
		catch (UnsupportedEncodingException e) {
			throw new SSOAuthenticationException("Gigya authentication failed");
		}
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
            Authentication authResult) throws IOException, ServletException {

        //post authentication strategy needs to be called before the response is committed in the parent method
        postAuthenticationSetupStrategy.setup(request, response);

        // TODO: User Gigya SDK to make callback to notify of successful login
        // Use the Gigya SDK to properly notify of the login and Jive UID
        // http://developers.gigya.com/030_Server_SDKs/Java
        // http://developers.gigya.com/037_API_reference/020_REST_API/socialize.notifyLogin
        
        super.successfulAuthentication(request, response, authResult);
    }

    @Required
    public void setGigyaConfiguration(GigyaConfiguration gigyaConfiguration) {
        this.gigyaConfiguration = gigyaConfiguration;
    }

    @Required
    public void setGigyaAuthenticationProvider(GigyaAuthenticationProvider gigyaAuthenticationProvider) {
        this.gigyaAuthenticationProvider = gigyaAuthenticationProvider;
    }

    @Required
    public void setGigyaUserSynchronizer(GigyaUserSynchronizer gigyaUserSynchronizer) {
        this.gigyaUserSynchronizer = gigyaUserSynchronizer;
    }

    @Required
    public void setConfirmableAuthenticationCache(Cache<String, Authentication> confirmableAuthenticationCache) {
        this.confirmableAuthenticationCache = confirmableAuthenticationCache;
    }

    @Required
    public void setPostAuthenticationSetupStrategy(PostAuthenticationSetupStrategy postAuthenticationSetupStrategy) {
        this.postAuthenticationSetupStrategy = postAuthenticationSetupStrategy;
    }

	public GigyaApi getGigyaApi() {
		return gigyaApi;
	}

	public void setGigyaApi(GigyaApi gigyaApi) {
		this.gigyaApi = gigyaApi;
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
