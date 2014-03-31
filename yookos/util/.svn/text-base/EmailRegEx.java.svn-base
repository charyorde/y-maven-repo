package com.yookos.util;

import com.jivesoftware.community.JiveGlobals;

/**
 * @author Msawenkosi Ntuli
 *
 */
public enum EmailRegEx {
	
	EMAIL_REG_EX(JiveGlobals.getJiveProperty("regex.mail", "^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$")); 
	
	private EmailRegEx(String value){
		
		this.value = value;
	}
	
	private String value;

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}
}
