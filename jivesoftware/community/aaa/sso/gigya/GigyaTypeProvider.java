package com.jivesoftware.community.aaa.sso.gigya;

import javax.annotation.PostConstruct;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;

import com.jivesoftware.community.aaa.sso.SSOUserSynchronizerProvider;
import com.jivesoftware.community.aaa.sso.external.ExternalType;

public class GigyaTypeProvider {
    
    private static final Logger log = LogManager.getLogger(GigyaTypeProvider.class);

    public static final ExternalType GIGYA;

    static {
        GIGYA = ExternalType.register(1234);
    }

    private GigyaUserSynchronizer gigyaUserSynchronizer;
    private SSOUserSynchronizerProvider ssoUserSynchronizerProvider;
    

    @PostConstruct
    public void init() {
        ssoUserSynchronizerProvider.register(gigyaUserSynchronizer, GIGYA);
        log.info("Registered GigyaUserSynchronizer");
    }
    
    @Required
    public void setGigyaUserSynchronizer(GigyaUserSynchronizer gigyaUserSynchronizer) {
        this.gigyaUserSynchronizer = gigyaUserSynchronizer;
    }
    
    @Required
    public void setSsoUserSynchronizerProvider(SSOUserSynchronizerProvider ssoUserSynchronizerProvider) {
        this.ssoUserSynchronizerProvider = ssoUserSynchronizerProvider;
    }
}
