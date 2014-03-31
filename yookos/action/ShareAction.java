package com.yookos.action;

import com.jivesoftware.community.action.util.AlwaysAllowAnonymous;
import com.jivesoftware.community.action.util.Decorate;
import com.jivesoftware.community.web.struts.SetReferer;
import com.yookos.bean.ShareActionBean;

import javax.servlet.http.HttpServletRequest;
import static com.yookos.util.ShareServiceUtil.*;

/**
 * @author Msawenkosi Ntuli
 *
 */
@SuppressWarnings("serial")
@Decorate(false)
@SetReferer(true)
@AlwaysAllowAnonymous
public class ShareAction extends ShareActionBean{
	
	private boolean invoke = true;

	public void getParams(){
		
		HttpServletRequest request = super.getRequest();

		if (request.getParameter(URL) != null){
			this.setUrl(request.getParameter(URL));
			if (request.getParameter(TITLE) != null){
				this.setTitle(request.getParameter(TITLE).trim());
			}
			if (request.getParameter(DESCRIPTION) != null){
				this.setDescription(request.getParameter(DESCRIPTION).trim());
			}
			if (request.getParameter(SCREENSHOT) != null){
				this.setScreenshot(request.getParameter(SCREENSHOT));
			}
			if (request.getParameter(SWFURL) != null){
				this.setSwfurl(request.getParameter(SWFURL));
			}
		}
		else{
			this.invoke = false;
		}
	}
	
	public String execute(){

        user = super.getUser();
        this.setUsername(user.getUsername());

		if(super.isGuest()){
			return NOTLOGGEDIN;	
		}
		else{
			this.getParams();
			return SUCCESS;
		}
	}	
}