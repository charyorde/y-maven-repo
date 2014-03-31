package com.jivesoftware.community.aaa.sso.gigya;

import com.jivesoftware.community.JiveGlobals;

public class JiveGlobalsGigyaConfiguration implements GigyaConfiguration {

    private static final String ENABLED = "gigya.enabled";
    private static final String APPLICATION_ID = "gigya.applicationID";
    private static final String APPLICATION_SECRET = "gigya.applicationSecret";
    private static final String API_KEY = "gigya.apiKey";

    @Override
    public boolean isEnabled() {
        return JiveGlobals.getJiveBooleanProperty(ENABLED);
    }

    @Override
    public void setEnabled(boolean enabled) {
        JiveGlobals.setJiveProperty(ENABLED, String.valueOf(enabled));
    }

    @Override
    public String getApplicationID() {
        return JiveGlobals.getJiveProperty(APPLICATION_ID);
    }

    @Override
    public void setApplicationID(String applicationID) {
        JiveGlobals.setJiveProperty(APPLICATION_ID, String.valueOf(applicationID));
    }

    @Override
    public String getApplicationSecret() {
        return JiveGlobals.getJiveProperty(APPLICATION_SECRET);
    }

    @Override
    public void setApplicationSecret(String secret) {
        JiveGlobals.setJiveProperty(APPLICATION_SECRET, secret);
    }

    @Override
    public boolean isDebug() {
        return false;
    }

    @Override
    public void setDebug(boolean debug) {

    }

	@Override
	public String getApiKey() {
		return JiveGlobals.getJiveProperty(API_KEY);
	}

	@Override
	public void setApiKey(String apiKey) {
		JiveGlobals.setJiveProperty(API_KEY, apiKey);		
	}
}
