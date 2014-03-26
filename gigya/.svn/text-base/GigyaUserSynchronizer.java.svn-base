package com.jivesoftware.community.aaa.sso.gigya;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;

import com.jivesoftware.base.EmailAlreadyExistsException;
import com.jivesoftware.base.User;
import com.jivesoftware.base.UserAlreadyExistsException;
import com.jivesoftware.base.UserTemplate;
import com.jivesoftware.community.JiveConstants;
import com.jivesoftware.community.aaa.sso.AbstractSSOUserSynchronizer;
import com.jivesoftware.util.StringUtils;
import com.jivesoftware.util.ValidationUtil;

public class GigyaUserSynchronizer extends AbstractSSOUserSynchronizer<GigyaAuthenticationToken> {

    private static final Logger log = Logger.getLogger(GigyaUserSynchronizer.class);

    private GigyaConfiguration gigyaConfiguration;

    @Override
    public User update(GigyaAuthenticationToken token) {

        UserTemplate toUpdate = new UserTemplate(token.getJiveUserDetails().getUser());
        UserTemplate extracted = extractUserTemplate(token);

        //just overwrite the old properties with the new ones
        toUpdate.getProperties().putAll(extracted.getProperties());
        toUpdate.setFirstName(extracted.getFirstName());
        toUpdate.setLastName(extracted.getLastName());

        User user = updateUser(toUpdate);

        updateAvatar(user, getAvatarURL(token));

        return user;
    }

    @Override
    public User create(UserTemplate template, GigyaAuthenticationToken token) throws UserAlreadyExistsException, EmailAlreadyExistsException {

        //because these users arent exactly federated completely like ldap, we will leave them as unfederated
        template.setFederated(false);
        
        //template object contains user password: >> template.setPassword(StringUtils.randomString(64));

        User user = super.create(template, token);

        //the external identity will be the uid of the user. ex: 1367440427
        externalIdentityManager.addIdentity(user, GigyaTypeProvider.GIGYA, String.valueOf(token.getPrincipal()));

        updateAvatar(user, getAvatarURL(token));

        return user;
    }

    @Override
    public UserTemplate extractUserTemplate(GigyaAuthenticationToken token) {
        //make our default user setup
        UserTemplate template = newDefaultTemplate();

        //attributes used to populate the user template
        Map<String, String> attributes = loadUserData(token);

        for (Map.Entry<String, String> entry : attributes.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            
            if (GigyaConstants.UID_KEY.equals(key)) {
                template.setUsername(getSafeUsername(value));
            }
            else if (GigyaConstants.FIRST_NAME_KEY.equals(key)) {
                template.setFirstName(value);
            }
            else if (GigyaConstants.LAST_NAME_KEY.equals(key)) {
                template.setLastName(value);
            }
            else if (GigyaConstants.EMAIL_KEY.equals(key)) {
                template.setEmail(value);
            }
            else if (GigyaConstants.TIMEZONE_KEY.equals(key)) {
                template.getProperties().put(JiveConstants.USER_TIMEZONE_PROP_NAME, value);
            }
            else if (GigyaConstants.LOCALE_KEY.equals(key)) {
                template.getProperties().put(JiveConstants.USER_LOCALE_PROP_NAME, value);
            }
        }

        return template;
    }

    public Map<String, String> loadUserData(GigyaAuthenticationToken token) {
        Map<String, String> values = new HashMap<String, String>();

        JSONObject loginObj = (JSONObject) token.getDetails();
        JSONObject identityObj = getIdentityObject(loginObj);
        
        if (identityObj == null) {
            return values;
        }
        
        //lets unwrap the keys for the login object and user object and put them in a map
        Iterator<String> keys = identityObj.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            Object val = identityObj.opt(key);
            
            if (val != null) {
                values.put(key, String.valueOf(val));
            }
        }
        
        //add the gigya uid to the map as well
        values.put(GigyaConstants.UID_KEY, loginObj.getString(GigyaConstants.UID_KEY));

        return values;
    }
    
    public JSONObject getIdentityObject(JSONObject loginObj) {
        if (loginObj == null) {
            log.warn("No login object found in gigya auth token");
            return null;
        }

        String provider = loginObj.optString(GigyaConstants.PROVIDER_KEY);
        if (provider == null) {
            log.warn("No provider found in gigya login object");
            return null;
        }

        JSONObject userObj = loginObj.optJSONObject(GigyaConstants.USER_KEY);
        if (userObj == null) {
            log.warn("No user object found in gigya login object");
            return null;
        }
        
        JSONObject identitiesObj = userObj.optJSONObject(GigyaConstants.IDENTITIES_KEY);
        if (identitiesObj == null) {
            log.warn("No identities found in gigya login object");
            return null;
        }
        
        return identitiesObj.optJSONObject(provider);
    }
    
    private String getSafeUsername(String username) {
        String safeUsername = username;
        
        for (Character character : ValidationUtil.getUsernameDisallowedChars()) {
            safeUsername = safeUsername.replace(character, '_');
        }
        
        return safeUsername;
    }
    
    private String getAvatarURL(GigyaAuthenticationToken token) {
        Map<String, String> attributes = loadUserData(token);
        
        String url = attributes.get(GigyaConstants.THUMBNAIL_KEY);
        
        if (StringUtils.isBlank(url)) {
            return attributes.get(GigyaConstants.PHOTO_KEY);
        }
        else {
            return url;
        }
    }

    @Required
    public void setGigyaConfiguration(GigyaConfiguration gigyaConfiguration) {
        this.gigyaConfiguration = gigyaConfiguration;
    }
}
