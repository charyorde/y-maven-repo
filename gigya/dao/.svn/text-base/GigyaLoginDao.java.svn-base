package com.gigya.dao;

import com.gigya.bean.CustomJiveUser;
import com.gigya.bean.GigyaLoginDetails;


/**
 * @author Msawenkosi Ntuli
 *
 */
public interface GigyaLoginDao {

	public void linkAccounts(String uid, long userId, String provider);
	public GigyaLoginDetails getGigyaLoginDetails(String uid);
	public CustomJiveUser getCustomJiveUser(String email);
	public void enableAccounts(long userId);
}
