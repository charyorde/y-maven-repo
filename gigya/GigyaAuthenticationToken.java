package com.jivesoftware.community.aaa.sso.gigya;

import java.util.Collections;

import net.sf.json.JSONObject;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.util.Assert;

import com.jivesoftware.community.aaa.JiveUserDetails;

public class GigyaAuthenticationToken extends AbstractAuthenticationToken {

    private JSONObject loginObj;
    private JiveUserDetails jiveUserDetails;

    public GigyaAuthenticationToken(JSONObject loginObj) {
        super(Collections.<GrantedAuthority>emptySet());
        this.loginObj = loginObj;

        Assert.notNull(this.loginObj, "GigyaAuthenticationToken requires a login object to be present in the payload");
    }

    @Override
    public Object getCredentials() {
        return loginObj.getString(GigyaConstants.SIGNATURE_KEY);
    }

    @Override
    public Object getDetails() {
        return loginObj;
    }
    
    @Override
    public Object getPrincipal() {
        return loginObj.getString(GigyaConstants.UID_KEY);
    }

    public JiveUserDetails getJiveUserDetails() {
        return jiveUserDetails;
    }

    public void setJiveUserDetails(JiveUserDetails jiveUserDetails) {
        this.jiveUserDetails = jiveUserDetails;
    }
}
