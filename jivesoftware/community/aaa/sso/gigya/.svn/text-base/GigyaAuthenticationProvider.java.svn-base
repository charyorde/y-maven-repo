package com.jivesoftware.community.aaa.sso.gigya;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;

import com.jivesoftware.base.User;
import com.jivesoftware.community.aaa.JiveUserDetails;

public class GigyaAuthenticationProvider implements AuthenticationProvider {

    private UserDetailsService userDetailsService;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        GigyaAuthenticationToken token = (GigyaAuthenticationToken) authentication;

        //look up the user by uid. if they dont exist an anon user will be returned
        User user = ((JiveUserDetails) userDetailsService.loadUserByUsername(String.valueOf(token.getPrincipal()))).getUser();

        //principal is the updated user details or anonymous
        token.setJiveUserDetails(new JiveUserDetails(user));

        return token;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return GigyaAuthenticationToken.class.isAssignableFrom(authentication);
    }

    @Required
    public void setUserDetailsService(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

}
