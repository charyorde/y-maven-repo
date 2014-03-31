/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2009 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
package com.jivesoftware.community.web.struts;

import com.jivesoftware.community.web.struts.util.ActionInvocationUtils;
import com.opensymphony.xwork2.ActionInvocation;
import com.opensymphony.xwork2.validator.ValidationInterceptor;
import com.google.common.collect.Maps;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import com.google.common.collect.Maps;

import javax.servlet.http.Cookie; 
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import com.jivesoftware.community.action.util.CookieUtils;
import javax.servlet.http.HttpSession;
import org.apache.struts2.ServletActionContext;

import java.util.Map;

/**
 * A wrapper to the struts validation interceptor which adds the ability to skip validation
 * on a method if it has the @NoValidation annotation on it
 */
public class YookosInvitationValidationInterceptor extends ValidationInterceptor {

    protected static final org.apache.log4j.Logger log = LogManager.getLogger(YookosInvitationValidationInterceptor.class);
    
    protected boolean applyInterceptor(ActionInvocation invocation) {
        boolean applyMethod = false;

        // We want to ensure that the method we are invoking actually exists on the action before going any further
        // and fail fast if it does not. If we do not fail-fast we may short circuit proper validation which is present
        // in the action and preventing nasty things like XSS. http://jira.jiveland.com/browse/CS-20789
        /*if (!ActionInvocationUtils.isAnnotationPresent(NoValidation.class, invocation)) {
            applyMethod = super.applyInterceptor(invocation);
        }*/
        log.info("calling overriden YookosInvitationValidationInterceptor");
        final String YOOKOS_INVITEDUSER_TOKEN = "yookos.user.invited";

        HttpServletRequest request = ServletActionContext.getRequest();
        HttpServletResponse response = ServletActionContext.getResponse();
        HttpSession session = request.getSession();

        String emailInCurrentSession = (String) session.getAttribute(YOOKOS_INVITEDUSER_TOKEN);

        String email = ""; // retrieve the value from url query param
        String jiveURL = request.getRequestURL().toString();
        log.info("jiveURL is: " + jiveURL);

        String query = request.getQueryString();
        String[] params = query.split("&");
        Map<String, String> paramMap = Maps.newHashMap();
        for (String param : params) {
            String name = param.split("=")[0];
            String value = param.split("=")[1];
            paramMap.put(name, value);
        }
        email = paramMap.get("email");
        log.info("Retrieved email is: " + email);

        Cookie cookie = CookieUtils.getCookie(request, YOOKOS_INVITEDUSER_TOKEN);
        if(cookie != null) {
            emailInCurrentSession = cookie.getValue();
            // update the cookie in the session
            log.info("YOOKOS_INVITEDUSER_TOKEN Cookie is not null. Value is: " + cookie.getValue());
        } else {
            session.setAttribute(YOOKOS_INVITEDUSER_TOKEN, email);
            CookieUtils.setCookie(request, response, YOOKOS_INVITEDUSER_TOKEN, email);
            log.info("Successfully stored invited user cookie");
        }


        return applyMethod;
    }
}
