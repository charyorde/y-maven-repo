package com.gigya.bean;

import org.springframework.security.core.Authentication;

import com.gigya.dao.GigyaLoginDao;
import com.jivesoftware.base.UserTemplate;
import com.jivesoftware.cache.Cache;
import com.jivesoftware.community.aaa.sso.ConfirmableAuthenticationToken;
import com.jivesoftware.community.aaa.sso.SSOGlobalConfiguration;
import com.jivesoftware.community.aaa.sso.SSOUserSynchronizerProvider;
import com.jivesoftware.community.aaa.sso.gigya.GigyaAuthenticationToken;
import com.jivesoftware.community.aaa.sso.gigya.GigyaUserSynchronizer;
import com.jivesoftware.community.action.JiveActionSupport;

/**
 * @author Msawenkosi Ntuli
 *
 */
public class GigyaSSOBean extends JiveActionSupport{

	protected static final String LINK = "link";
	protected String firstName; 
	protected String lastName;	
	protected String username;
	protected String password;
	protected String confirmPassword;
	protected String email;	 
	protected String gender;
	protected String company;
	@Deprecated protected String birthdate;
	protected String birthday;
	@Deprecated protected String birthmonth;
	@Deprecated protected String birthyear;
	protected String provider;
	protected String state;
	protected String city;
	protected String thumbnailURL;
	protected String photoURL;
	protected String nickname;
	protected String profileURL;
	protected String zip;
	protected String bio;
	protected String country;
	protected String cookieName; 
	protected String cookieValue;
	protected String cookiePath;
	protected GigyaLoginDao gigyaLoginDao;
	protected GigyaLoginDetails gigyaLoginDetails;
	protected Authentication authentication;
	protected SSOGlobalConfiguration ssoGlobalConfiguration;
	protected SSOUserSynchronizerProvider ssoUserSynchronizerProvider;
	protected ConfirmableAuthenticationToken confirmToken;
	protected GigyaAuthenticationToken auth;
	protected Cache<String, Authentication> confirmableAuthenticationCache;
	protected Cache<String, Boolean> newUserCache;
	protected GigyaUserSynchronizer gigyaUserSynchronizer;	
	protected UserTemplate userTemplate;	
	protected RequiredFields requiredFields;
	public static final String GENDER_PROFILE_FIELD = "Gender";
    public static final String BIRTHDATE_PROFILE_FIELD = "Birthdate";
    public static final String BIO_PROFILE_FIELD = "Biography";
    public static final String COUNTRY_PROFILE_FIELD = "Country";
    public static final String COMPANY_PROFILE_FIELD = "Company";
    public static final String RELATIONSHIP_STATUS_PROFILE_FIELD = "relationshipstatus";
    
	public String getFirstName() {
		return firstName;
	}
	
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	
	public String getLastName() {
		return lastName;
	}
	
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	
	public String getUsername() {
		return username;
	}
	
	public void setUsername(String username) {
		this.username = username;
	}
	
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getEmail() {
		return email;
	}
	
	public void setEmail(String email) {
		this.email = email;
	}
	
	public String getGender() {
		return gender;
	}
	
	public void setGender(String gender) {
		this.gender = gender;
	}
	
	public String getBirthdate() {
		return birthdate;
	}
	
	public void setBirthdate(String birthdate) {
		this.birthdate = birthdate;
	}
	
	public String getCountry() {
		return country;
	}
	
	public void setCountry(String country) {
		this.country = country;
	}
	
	public void setConfirmableAuthenticationCache(Cache<String, Authentication> confirmableAuthenticationCache) {
		this.confirmableAuthenticationCache = confirmableAuthenticationCache;
	}

	public void setGigyaUserSynchronizer(GigyaUserSynchronizer gigyaUserSynchronizer) {
		this.gigyaUserSynchronizer = gigyaUserSynchronizer;
	}

	public RequiredFields getRequiredFields() {
		return requiredFields;
	}

	public void setRequiredFields(RequiredFields requiredFields) {
		this.requiredFields = requiredFields;
	}

	public UserTemplate getUserTemplate() {
		return userTemplate;
	}

	public void setUserTemplate(UserTemplate userTemplate) {
		this.userTemplate = userTemplate;
	}

	public SSOGlobalConfiguration getSsoGlobalConfiguration() {
		return ssoGlobalConfiguration;
	}

	public void setSsoGlobalConfiguration(SSOGlobalConfiguration ssoGlobalConfiguration) {
		this.ssoGlobalConfiguration = ssoGlobalConfiguration;
	}

	public SSOUserSynchronizerProvider getSsoUserSynchronizerProvider() {
		return ssoUserSynchronizerProvider;
	}

	public void setSsoUserSynchronizerProvider(SSOUserSynchronizerProvider ssoUserSynchronizerProvider) {
		this.ssoUserSynchronizerProvider = ssoUserSynchronizerProvider;
	}

	public GigyaLoginDao getGigyaLoginDao() {
		return gigyaLoginDao;
	}

	public void setGigyaLoginDao(GigyaLoginDao gigyaLoginDao) {
		this.gigyaLoginDao = gigyaLoginDao;
	}

	public String getConfirmPassword() {
		return confirmPassword;
	}

	public void setConfirmPassword(String confirmPassword) {
		this.confirmPassword = confirmPassword;
	}

	public String getCookieName() {
		return cookieName;
	}

	public void setCookieName(String cookieName) {
		this.cookieName = cookieName;
	}

	public String getCookieValue() {
		return cookieValue;
	}

	public void setCookieValue(String cookieValue) {
		this.cookieValue = cookieValue;
	}

	public String getCookiePath() {
		return cookiePath;
	}

	public void setCookiePath(String cookiePath) {
		this.cookiePath = cookiePath;
	}

	public String getBirthday() {
		return birthday;
	}

	public void setBirthday(String birthday) {
		this.birthday = birthday;
	}

	public String getBirthmonth() {
		return birthmonth;
	}

	public void setBirthmonth(String birthmonth) {
		this.birthmonth = birthmonth;
	}

	public String getBirthyear() {
		return birthyear;
	}

	public void setBirthyear(String birthyear) {
		this.birthyear = birthyear;
	}

	public String getProvider() {
		return provider;
	}

	public void setProvider(String provider) {
		this.provider = provider;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getThumbnailURL() {
		return thumbnailURL;
	}

	public void setThumbnailURL(String thumbnailURL) {
		this.thumbnailURL = thumbnailURL;
	}

	public String getPhotoURL() {
		return photoURL;
	}

	public void setPhotoURL(String photoURL) {
		this.photoURL = photoURL;
	}

	public String getNickname() {
		return nickname;
	}

	public void setNickname(String nickname) {
		this.nickname = nickname;
	}

	public String getProfileURL() {
		return profileURL;
	}

	public void setProfileURL(String profileURL) {
		this.profileURL = profileURL;
	}

	public String getZip() {
		return zip;
	}

	public void setZip(String zip) {
		this.zip = zip;
	}

	public Cache<String, Boolean> getNewUserCache() {
		return newUserCache;
	}

	public void setNewUserCache(Cache<String, Boolean> newUserCache) {
		this.newUserCache = newUserCache;
	}
	
	public String getCompany() {
		return company;
	}

	public void setCompany(String company) {
		this.company = company;
	}

	public String getBio() {
		return bio;
	}

	public void setBio(String bio) {
		this.bio = bio;
	}

}
