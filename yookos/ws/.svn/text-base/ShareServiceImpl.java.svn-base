package com.yookos.ws;

import javax.ws.rs.Consumes;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.jivesoftware.base.UnauthorizedException;
import com.jivesoftware.base.User;
import com.jivesoftware.base.UserNotFoundException;
import com.jivesoftware.community.comments.Comment;
import com.jivesoftware.community.comments.CommentContentResource;
import com.jivesoftware.community.lifecycle.JiveApplication;
import com.jivesoftware.community.microblogging.WallEntry;
import com.jivesoftware.community.*;
import com.yookos.bean.ShareServiceBean;
import com.yookos.ws.*;
import static com.yookos.util.ShareServiceUtil.*;

public class ShareServiceImpl extends ShareServiceBean implements ShareService
{
	@Override
	@Path("/share")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.TEXT_PLAIN)
	public String setShareContentAsStatusUpdate(ShareData shareData) {
		
		User user = authenticationProvider.getJiveUser();
		
		String url  = shareData.getUrl();
		String title = (shareData.getTitle() == null || shareData.getTitle().equals(""))? "Shared link: ": shareData.getTitle();
		String description = (shareData.getDescription()== null || shareData.getDescription().equals(""))? url: shareData.getDescription() ;
		String screenshot = (shareData.getScreenshot() == null)? "" : shareData.getScreenshot(); 
		String swfurl = (shareData.getSwfurl() == null)? "" : shareData.getSwfurl();
		String comment = shareData.getComment();
				
		//check if the user exists
		if (isExistingUser(user.getID())){
			
			String status_update;
			
			if (((url != null) && (!url.equals("")))){
				//check if article has an image
				if (!screenshot.equals("")){
					status_update = String.format(screenshotTemplate, 
												  screenshot, 
												  url, 
												  title, 
												  description);
				}
				else if (!swfurl.equals("")){
					status_update = String.format(swfurlTemplate, 
												  swfurl, 
												  url, 
												  title, 
												  description);				
				}
				else{
					status_update = String.format(defaultTemplate, 
												  url, 
												  title, 
												  description);
				}
				//update user status
				userStatusManager = JiveApplication.getContext().getStatusManager();
				userStatus = userStatusManager.setCurrentStatus(user, status_update);
					
				//add comment
				if (!comment.equals("")){
					commentContentResource = getCommentContentResource(WallEntry.OBJECTID, userStatus.getID());
					Comment statusUpdatecomment = null;
					
					if (commentContentResource != null) {
						statusUpdatecomment = commentManager.createComment(commentContentResource, user, comment);
				        commentManager.addComment(commentContentResource, statusUpdatecomment);
				    }
				}
			}
			else{
				return FAILURE;
			}
		}
		else{
			return FAILURE;
		}		
		return SUCCESS;
	}
		
	/**
     * Returns the content resource a comment was made upon.
     *
     * @param objectType resource's object type
     * @param objectID resource's object id
     * @return the content resource a comment was made upon.
     */
    private CommentContentResource getCommentContentResource(int objectType, long objectID) {
    	try {
            JiveObject jiveObject = jiveObjectLoader.getJiveObject(objectType, objectID);
            if (jiveObject instanceof CommentContentResource) {
                return (CommentContentResource) jiveObject;
            }
        }
        catch(UnauthorizedException e){
            //log.error(e.getMessage());
        }
        catch (NotFoundException e) {
            //log.error(e.getMessage());
        }
        return null;
    }

	private boolean isExistingUser(long id){
		try {
			userManager.getUser(id);
		} catch (UserNotFoundException e) {
			return false;
		}
		return true;
	}
	
	
}