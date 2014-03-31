package com.yookos.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.jivesoftware.base.UnauthorizedException;
import com.jivesoftware.base.User;
import com.jivesoftware.base.UserTemplate;
import com.jivesoftware.community.lifecycle.JiveApplication;
import com.jivesoftware.community.user.profile.ProfileField;
import com.jivesoftware.community.user.profile.ProfileFieldManager;
import com.jivesoftware.community.user.profile.ProfileFieldOption;
import com.jivesoftware.community.user.profile.ProfileFieldValue;
import com.jivesoftware.community.user.profile.ProfileManager;

/**
 * @author msawenkosi
 *
 */
public class ProfileFieldUtils {
	
	private ProfileFieldUtils(){
	}

	public static void setProfileFieldValue(User user, ProfileFieldManager profileFieldManager, ProfileManager profileManager,  String profileFieldName, String profileFieldValue) {		
			
		try{
			profileFieldManager = JiveApplication.getContext().getProfileFieldManager();
			profileManager = JiveApplication.getContext().getProfileManager();
			
			Map<Long, ProfileFieldValue> profile = profileManager.getProfile(getTargetUser(user));
			
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
	
	private static boolean isValidOption(ProfileField field, String value) {
        
		for (ProfileFieldOption option : field.getOptions()) {
            if (option.getValue().equals(value)) {
                return true;
            }
        }
        return false;
	}
	
	private static UserTemplate getTargetUser(User user){
		
		return (user == null)? null : (new UserTemplate(user));
	}
}
