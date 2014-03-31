package com.yookos.bean;

import com.jivesoftware.base.User;
import com.jivesoftware.base.UserManager;
import com.jivesoftware.base.aaa.AuthenticationProvider;
import com.jivesoftware.community.UserStatus;
import com.jivesoftware.community.UserStatusManager;
import com.jivesoftware.community.action.JiveActionSupport;

/**
 * @author Msawenkosi Ntuli
 *
 */
public class ShareActionBean extends JiveActionSupport{

	protected UserManager userManager;
    protected User user;
	protected AuthenticationProvider authenticationProvider;
	protected UserStatusManager userStatusManager;
	protected UserStatus userStatus;
	
	//article
	protected String url = "";
	protected String title = "";
	protected String description ="";
	protected String screenshot = "";
	protected String swfurl = "";
    protected String username ="";
    
    public UserManager getUserManager() {
		return super.userManager;
	}

	public UserStatusManager getUserStatusManager() {
		return userStatusManager;
	}

	public void setUserStatusManager(UserStatusManager userStatusManager) {
		this.userStatusManager = userStatusManager;
	}

	public UserStatus getUserStatus() {
		return userStatus;
	}

	public void setUserStatus(UserStatus userStatus) {
		this.userStatus = userStatus;
	}

    public String getUsername()  {
        return username;
    }

    public void setUsername(String username){
        this.username = username;
    }

	public String getUrl() {
		return url;
	}
	
	public void setUrl(String url) {
		this.url = url;
	}
	
	public String getTitle() {
		return title;
	}
	
	public void setTitle(String title) {
		this.title = title;
	}
	
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
		
	public String getScreenshot() {
		return screenshot;
	}

	public void setScreenshot(String screenshot) {
		this.screenshot = screenshot;
	}

	public String getSwfurl() {
		return swfurl;
	}

	public void setSwfurl(String swfurl) {
		this.swfurl = swfurl;
	}
	
}
