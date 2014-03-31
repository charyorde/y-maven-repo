package com.gigya.bean;

import java.io.Serializable;
import java.util.Date;
import java.util.Map;

import com.jivesoftware.base.UnauthorizedException;
import com.jivesoftware.base.User;

public class CustomJiveUser implements User{

	private long ID;
	private String name;
	private String username;
	private String firstName; 
	private String lastName;	
	private boolean nameVisible;
	private String passwordHash;
	private String password;
	private String email;	
	private boolean emailVisible;
		
	public CustomJiveUser(long ID, String name, String username,
			String firstName, String lastName, boolean nameVisible,
			String passwordHash, String email,
			boolean emailVisible) {
		
		this.ID = ID;
		this.name = name;
		this.username = username;
		this.firstName = firstName;
		this.lastName = lastName;
		this.nameVisible = nameVisible;
		this.passwordHash = passwordHash;
		this.password = password;
		this.email = email;
		this.emailVisible = emailVisible;
	}

	@Override
	public int getObjectType() {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public long getID() {
		// TODO Auto-generated method stub
		return this.ID;
	}

	@Override
	public String getUsername() {
		// TODO Auto-generated method stub
		return this.username;
	}

	@Override
	public String getName() {
		// TODO Auto-generated method stub
		return this.name;
	}

	@Override
	public String getFirstName() {
		// TODO Auto-generated method stub
		return this.firstName;
	}

	@Override
	public String getLastName() {
		// TODO Auto-generated method stub
		return this.lastName;
	}

	@Override
	public boolean isNameVisible() {
		// TODO Auto-generated method stub
		return this.nameVisible;
	}

	@Override
	public String getPasswordHash() throws UnauthorizedException {
		// TODO Auto-generated method stub
		return this.passwordHash;
	}

	@Override
	public String getPassword() throws UnauthorizedException {
		// TODO Auto-generated method stub
		return this.password;
	}

	@Override
	public String getEmail() {
		// TODO Auto-generated method stub
		return this.email;
	}

	@Override
	public boolean isEmailVisible() {
		// TODO Auto-generated method stub
		return this.emailVisible;
	}

	@Override
	public Date getCreationDate() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Date getModificationDate() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Map<String, String> getProperties() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Date getLastLoggedIn() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Date getLastProfileUpdate() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean isEnabled() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isFederated() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isExternal() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isPartner() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public Type getType() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean isVisible() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isSetPasswordSupported() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isGetPasswordHashSupported() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isSetPasswordHashSupported() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isSetNameSupported() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isSetUsernameSupported() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isSetEmailSupported() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isSetNameVisibleSupported() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isSetEmailVisibleSupported() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isPropertyEditSupported() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public Status getStatus() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean isAnonymous() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean isProfileVisible() {
		// TODO Auto-generated method stub
		return false;
	}

	public void setID(long ID) {
		this.ID = ID;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public void setNameVisible(boolean nameVisible) {
		this.nameVisible = nameVisible;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public void setEmailVisible(boolean emailVisible) {
		this.emailVisible = emailVisible;
	}

}
