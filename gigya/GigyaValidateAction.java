package com.jivesoftware.community.aaa.sso.gigya;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;

import com.gigya.api.GigyaApi;
import com.gigya.util.GigyaUtils;
import com.google.com.UAgentInfo;
import com.jivesoftware.base.User;
import com.jivesoftware.base.UserManager;
import com.jivesoftware.base.UserTemplate;
import com.jivesoftware.cache.Cache;
import com.jivesoftware.community.action.ValidateAction;
import com.jivesoftware.community.action.util.AlwaysAllowAnonymous;
import com.jivesoftware.community.lifecycle.JiveApplication;
import com.jivesoftware.community.mail.util.EmailValidationHelper;
import com.jivesoftware.community.web.struts.SetReferer;
import com.jivesoftware.util.StringUtils;

/**
 * @author Msawenkosi Ntuli
 *
 */
@AlwaysAllowAnonymous
@SetReferer(false)
public class GigyaValidateAction extends ValidateAction {

	public static Logger log = Logger.getLogger(GigyaValidateAction.class.getName());
	private String email = null;
    private String validationKey = null;
    private String gigyaKey = null;
    private EmailValidationHelper emailValidationHelper;
	private static final String CREATE_ACCOUNT = "create-account";
	private static final String REFERER = "referer";
	private static final String VALIDATE_INPUT = "/validate!input.jspa?gigyaKey=true";
	private GigyaApi gigyaApi;
	private Cache<String, Boolean> newUserCache;
	
	@Override
	public String input(){
		
		return super.input();
	}
	
	/**Gets timestamp using this format yyyymmddhhmmss
	 * @return
	 */
	private long getCurrentTimeStamp(){
		
		DateFormat dateFormat = new SimpleDateFormat("yyyyMMddHHmmss");
		Date date = new Date();
		
		return Long.parseLong(dateFormat.format(date));
	}
	
	private String isThisRequestCommingFromAMobileDevice(HttpServletRequest request){

	    String userAgent = request.getHeader("User-Agent");
	    String httpAccept = request.getHeader("Accept");

	    UAgentInfo detector = new UAgentInfo(userAgent, httpAccept);

	    if (detector.detectMobileQuick()) {
	        return "y";
	    }
	    return "n";
	}
		
	@Override
	public String execute(){		
		
        HttpServletRequest request = super.getRequest();
		String url = request.getHeader(REFERER);
		
		if ((StringUtils.isBlank(email))) {
            addFieldError("email", getText("reg.validate.mustEntrUsrname.text"));
        }
        
        if (StringUtils.isBlank(validationKey)) {
            addFieldError("validationKey", getText("reg.validate.invalid_token.text"));
        }

        if (!hasFieldErrors() && !emailValidationHelper.validate(email, validationKey)) {
            addFieldError("validationKey", getText("reg.validate.invalid_token.text"));
        }

        if (hasFieldErrors()) {
            return INPUT;
        }
        
		if ((url != null && !url.contains(VALIDATE_INPUT))){
			newUserCache.put(email, new Boolean(true));			
			return CREATE_ACCOUNT;
		}
		
		if (url == null){
			if (gigyaKey == null || gigyaKey.isEmpty()){			
				newUserCache.put(email, new Boolean(true));			
				return CREATE_ACCOUNT;
			}		
			if (!gigyaKey.equalsIgnoreCase("true")){
				return ERROR;
			}	
		}

		UserManager userManager = JiveApplication.getContext().getUserManager();
		UserTemplate userTemplate = new UserTemplate();
		User user;
		
		try {			
			userTemplate.setEmail(email);	        
			user = userManager.getUser(userTemplate);
			//enable user
			userManager.enableUser(user);
			gigyaApi.notifyLogin(String.format("%s", user.getID()), GigyaUtils.userInfoJsonString(user), true);
			GigyaUtils.logIn(user);
            return SUCCESS;
		} 
		catch (Exception e) {
			e.printStackTrace();
			return ERROR;
		}	
	}	
	
	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getValidationKey() {
		return validationKey;
	}

	public void setValidationKey(String validationKey) {
		this.validationKey = validationKey;
	}

	public EmailValidationHelper getEmailValidationHelper() {
		return emailValidationHelper;
	}

	public void setEmailValidationHelper(EmailValidationHelper emailValidationHelper) {
		this.emailValidationHelper = emailValidationHelper;
	}

	public String getGigyaKey() {
		return gigyaKey;
	}

	public void setGigyaKey(String gigyaKey) {
		this.gigyaKey = gigyaKey;
	}

	public GigyaApi getGigyaApi() {
		return gigyaApi;
	}

	public void setGigyaApi(GigyaApi gigyaApi) {
		this.gigyaApi = gigyaApi;
	}

	public Cache<String, Boolean> getNewUserCache() {
		return newUserCache;
	}

	public void setNewUserCache(Cache<String, Boolean> newUserCache) {
		this.newUserCache = newUserCache;
	}
}
