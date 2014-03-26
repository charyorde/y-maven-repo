package com.jivesoftware.community.aaa.sso.gigya;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.jivesoftware.base.User;
import com.jivesoftware.base.UserNotFoundException;
import com.jivesoftware.community.aaa.AnonymousUser;
import com.jivesoftware.community.aaa.JiveUserDetails;
import com.jivesoftware.community.aaa.sso.external.identity.ExternalIdentityManager;

public class GigyaUserDetailsService implements UserDetailsService {

    private ExternalIdentityManager externalIdentityManager;

    @Override
    public UserDetails loadUserByUsername(String uid) throws UsernameNotFoundException, DataAccessException {

        User user;
        try {
            user = externalIdentityManager.getUser(GigyaTypeProvider.GIGYA, uid);
        }
        catch (UserNotFoundException e) {
            user = new AnonymousUser();
        }

        //for gigya, we dont want to let in or re-enable disabled users
        if (!user.isEnabled()) {
            user = new AnonymousUser();
        }

        return new JiveUserDetails(user);
    }

    @Required
    public void setExternalIdentityManager(ExternalIdentityManager externalIdentityManager) {
        this.externalIdentityManager = externalIdentityManager;
    }
}
