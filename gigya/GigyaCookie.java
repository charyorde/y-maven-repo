package com.jivesoftware.community.aaa.sso.gigya;

import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

import com.gigya.socialize.SigUtils;

/**
 * @author Msawenkosi Ntuli
 *
 */
public class GigyaCookie {

	private String name;
	private String value;
	private String path;
	private String domain;
	private SigUtils sigUtils;
	private GigyaConfiguration gigyaConfiguration;
	private static final int SECONDS_TO_EXPIRATION = 60 * 60 * 1 *1; //Make the cookie last 3 minutes!
	
	private void init() throws InvalidKeyException, UnsupportedEncodingException {
		
		name = "gltexp_" + gigyaConfiguration.getApiKey();
		value = sigUtils.getDynamicSessionSignature(this.name, SECONDS_TO_EXPIRATION, gigyaConfiguration.getApplicationSecret());
		path = "/";
		domain = "localhost";
	}

	public GigyaConfiguration getGigyaConfiguration() {
		return gigyaConfiguration;
	}

	public void setGigyaConfiguration(GigyaConfiguration gigyaConfiguration) {
		this.gigyaConfiguration = gigyaConfiguration;
	}

	public final String getName() throws InvalidKeyException, UnsupportedEncodingException {
		if (name == null || name.isEmpty()){
			init();
		}
		return name;
	}

	public final String getValue() throws InvalidKeyException, UnsupportedEncodingException {
		if (value == null || value.isEmpty()){
			init();
		}
		return value;
	}

	public final String getPath() throws InvalidKeyException, UnsupportedEncodingException {
		if (path == null || path.isEmpty()){			
			init();
		}
		return path;
	}

	public SigUtils getSigUtils() {
		return sigUtils;
	}

	public void setSigUtils(SigUtils sigUtils) {
		this.sigUtils = sigUtils;
	}	
}
