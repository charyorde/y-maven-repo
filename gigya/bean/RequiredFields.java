package com.gigya.bean;

import java.io.Serializable;

/**
 * @author Msawenkosi Ntuli
 *
 */
public class RequiredFields implements Serializable {
	 
	 private boolean firstName; 
	 private boolean lastName;
	 private boolean username;
	 private boolean email;	 
	 private boolean password;	
	 private boolean gender;
	 private boolean birthdate;
	 private boolean country;
	 
	 public RequiredFields(){
		 
		this.firstName = true;
		this.lastName = true;
		this.username = true;
		this.email = true;
		this.password = true;
		this.gender = true;
		this.birthdate = true;
		this.country = true;
	 }

	public boolean isFirstName() {
		return firstName;
	}

	public void setFirstName(boolean firstName) {
		this.firstName = firstName;
	}

	public boolean isLastName() {
		return lastName;
	}

	public void setLastName(boolean lastName) {
		this.lastName = lastName;
	}

	public boolean isUsername() {
		return username;
	}

	public void setUsername(boolean username) {
		this.username = username;
	}

	public boolean isEmail() {
		return email;
	}

	public void setEmail(boolean email) {
		this.email = email;
	}

	public boolean isPassword() {
		return password;
	}

	public void setPassword(boolean password) {
		this.password = password;
	}

	public boolean isGender() {
		return gender;
	}

	public void setGender(boolean gender) {
		this.gender = gender;
	}

	public boolean isBirthdate() {
		return birthdate;
	}

	public void setBirthdate(boolean birthdate) {
		this.birthdate = birthdate;
	}

	public boolean isCountry() {
		return country;
	}

	public void setCountry(boolean country) {
		this.country = country;
	}	 
}
