package com.gigya.dao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.RowMapper;

import com.gigya.bean.CustomJiveUser;
import com.gigya.bean.GigyaLoginDetails;
import com.jivesoftware.base.database.dao.JiveJdbcDaoSupport;

/**
 * @author Msawenkosi Ntuli
 *
 */
public class GigyaLoginDaoImpl extends JiveJdbcDaoSupport implements GigyaLoginDao{

	private static final String SELECT_EMAIL_FROM_JIVEUSER = "SELECT * FROM jiveuser WHERE email = ?";
	private static final String SELECT_ALL_FROM_GIGYA_LOGIN = "SELECT * FROM yookosgigyalogin WHERE uid = ?";
	private static final String LINK_ACCOUNT = "INSERT INTO yookosgigyalogin(uid, userId, provider) VALUES(?, ?, ?)";
	private static final String ENABLE_ACCOUNT = "UPDATE jiveuser SET userenabled=? WHERE userid=?;";
	private List<?> list;
	
	@Override
	public CustomJiveUser getCustomJiveUser(String email) {
		
		if (email == null || email.isEmpty()){
			return null;
		}
		
		list = new ArrayList<CustomJiveUser>();
		list = getSimpleJdbcTemplate().query(SELECT_EMAIL_FROM_JIVEUSER, new CustomJiveUserRowMapper(), email);
		return ((list.size() > 0)? ((CustomJiveUser)list.get(0)) : null);
	}
	
	@Override
	public GigyaLoginDetails getGigyaLoginDetails(String uid) {
		
		list = new ArrayList<GigyaLoginDetails>();
		list = getSimpleJdbcTemplate().query(SELECT_ALL_FROM_GIGYA_LOGIN, new GigyaLoginUidRowMapper(), uid);
		return ((list.size() > 0)? (GigyaLoginDetails)list.get(0) : null);
	}	
	
	@Override
	public void linkAccounts(String uid, long userId, String provider) {
		
		getSimpleJdbcTemplate().update(LINK_ACCOUNT, uid, userId, provider);
	}
	
	@Override
	public void enableAccounts(long userId) {
		
		getSimpleJdbcTemplate().update(ENABLE_ACCOUNT, 1, userId);
	}
			
	private static class CustomJiveUserRowMapper implements RowMapper<CustomJiveUser>{


		@Override
		public CustomJiveUser mapRow(ResultSet rs, int rowNum) throws SQLException {
			
			return (rs == null)? null : new CustomJiveUser(rs.getLong("userId"), 
														   rs.getString("name"), 
														   rs.getString("username"),
														   rs.getString("firstName"), 
														   rs.getString("lastName"), 
														   true,
														   rs.getString("passwordHash"), 
														   rs.getString("email"),
														   true);
		}
	}	
	
	private static class GigyaLoginUidRowMapper implements RowMapper<GigyaLoginDetails>{

		private static final String UID = "uid";
		private static final String USER_ID = "userId";
		private static final String PROVIDER = "provider";
		
		@Override
		public GigyaLoginDetails mapRow(ResultSet rs, int rowNum) throws SQLException {
			
			return (rs == null)? null : new GigyaLoginDetails(rs.getString(UID), 
															  rs.getLong(USER_ID),
															  rs.getString(PROVIDER));
		}
	}	
}
