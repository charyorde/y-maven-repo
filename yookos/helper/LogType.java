package com.yookos.helper;

/**
 * @author Msawenkosi Ntuli
 *
 */
public enum LogType {

	REGISTER(0),
	LOGGIN(1);
	
	private LogType(int type){
		
		this.type = type;
	}
	
	private int type;

	public int getType() {
		return type;
	}

	public void setType(int type) {
		this.type = type;
	}	
}
