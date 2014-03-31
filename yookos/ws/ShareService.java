package com.yookos.ws;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import com.yookos.ws.*;

/**
 * @author Msawenkosi Ntuli
 *
 */
public interface ShareService{
	
	@Path("/share")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.TEXT_PLAIN)
	String setShareContentAsStatusUpdate(ShareData share_data);
}