jive.model.RefreshManager = function(control){

	var that = this;

	// listeners who want to know
	// what' we're doing
	var listeners = new Array();

	//
	// we need to keep track of the last time we
	// *know* that we were logged in
	// so that if we get logged out, we can
	// refresh all things that've been changed
	// since the last time we were logged in.
	//
	var last_session_date = control.getSettingsManager().getGMT();

	// lets keep track of the last time that we successfully
	// refreshed everything.
	var last_refresh = control.getSettingsManager().getGMT();

	// this tells whether we need to update last_login_date
	// when we're poked.
	//
	// we should not track login times if we have just been
	// asked to login again.
	//
	// once we know that we're logged out. we shouldn't track
	// login times until we've refreshed using the
	// refresh manager (which gets all changes since the
	// last time we *know* we're logged in).
	var tracking_session = true;

	// this is called after every successful ajax attempt
	// where we were logged in.
	//
	// if we had to re-login for the ajax to succeed,
	// then this is not called.
	//
	// this way, after every ajax call, we know the last
	// time that we were definately logged in.
	this.poke = function(){
		try{
			if(tracking_session){
				last_session_date = control.getSettingsManager().getGMT();
			}
		}catch(e){
			alert("refresh error:" + e);
		}
	}


	// the controller is letting us know that we're logged out
	// now all ajax calls that succeed will be after we've re-logged in
	this.loggedOut = function(){
		tracking_session = false;
	}



	function sendAjaxRefresh(dt, allHuh){
		try{
			that.notifyRefreshing();
			// subtract 5 seconds,
			// so that if anything, we sync more than
			// we need to
			dt.setTime(dt.getTime() - 5);
			var dh = new jive.model.DateHelper(control);
			var datestr = dh.formatToDateTime(dt);
			var a = control.newAjax(loadXML, loadFail);

			var min = dh.formatToDateTime(control.getEventCache().getMinTime());
			var max = dh.formatToDateTime(control.getEventCache().getMaxTime());

//			alert("min: " + min);

			a.POST(HOSTURL + AJAXPATH + "?refresh","dt=" + encodeURIComponent(datestr) + "&mindt=" + min + "&maxdt=" + max + (allHuh ? "&all" : ""));
		}catch(e){
			alert("refreshing: " + e);
		}
	}


	this.refresh = function(){
		// refresh from last_refresh
		// but only if we think we're logged in.
		//
		// there's no use in refreshing if we're
		// not logged in
		if(tracking_session){
			// normal login code here.
			sendAjaxRefresh(last_refresh, false);
		}
	}



	/**
	 * load in some refresh xml from somewhere else
	 */
	this.reload = function(list){
		var last_refresh_temp = last_refresh;
		that.notifyRefreshing();
		loadXML(list);
		last_refresh = last_refresh_temp;
	}


	var caches = new jive.ext.y.HashTable();
	this.getCustomCache = function(name){
		var c = caches.get(name);
		if(!$obj(c)){
			c = new jive.ext.y.HashTable();
			caches.put(name, c);
		}
		return c;
	}

	function resetCache(name){
		var c = new jive.ext.y.HashTable()
		caches.put(name, c);
		return c;
	}



	function loadEventCacheXML(list){
		for(var i=0;i<list.childNodes.length;i++){
			var c = resetCache(list.childNodes[i].tagName);
			for(var j=0;j<list.childNodes[i].childNodes.length;j++){
				var id = parseInt(list.childNodes[i].childNodes[j].childNodes[0].nodeValue);
				c.put(id, true);
			}
		}
	}


	/**
	 * loads an xml reply
	 *
	 * this will parse out the various responses,
	 * and send them to the approprate objects for
	 * continued refreshing.
	 *
	 * ie, the response will contain a
	 * <calendars></calendars> node
	 * and we'll send this node to the
	 * calendar manager, which will handle
	 * actually refreshing the calendar objects
	 * and notifying everyone of the change
	 */
	function loadXML(list){
		try{
			// now that we've refreshed, we can
			// refresh normally again
			tracking_session = true;


			for(var i=0;i<list.childNodes.length;i++){
				if(list.childNodes[i].tagName == "projects"){
					if(list.childNodes[i].childNodes.length > 0){
						control.getProjectCache().loadExternalProjects(list.childNodes[i]);
					}
				}else if(list.childNodes[i].tagName == "events"){
					if(list.childNodes[i].childNodes.length > 0){
						control.getEventCache().reloadEvents(list.childNodes[i]);
					}
				}else if(list.childNodes[i].tagName == "del_cals"){
					//
					// these are calendars that have been deleted
					//
					try{
						if(list.childNodes[i].childNodes.length > 0){
							control.getCalendarCache().unloadCalendars(list.childNodes[i]);
						}
					}catch(e){
						alert("error unloading calendars: " + e);
					}
				}else if(list.childNodes[i].tagName == "del_events"){
					//
					// these are events that have been deleted
					//
					try{
						if(list.childNodes[i].childNodes.length > 0){
							control.getEventCache().unloadEvents(list.childNodes[i]);
						}
					}catch(e){
						alert("error unloading calendars: " + e);
					}
				}else if(list.childNodes[i].tagName == "event_cache"){
					//
					// these are event caches
					//
					try{
						if(list.childNodes[i].childNodes.length > 0){
							loadEventCacheXML(list.childNodes[i]);
						}
					}catch(e){
						alert("error unloading calendars: " + e);
					}
				}else if(list.childNodes[i].tagName == "reminders"){
					if(list.childNodes[i].childNodes.length > 0){
						control.getReminderCache().reloadReminders(list.childNodes[i]);
					}
				}else if(list.childNodes[i].tagName == "comments"){
					if(list.childNodes[i].childNodes.length > 0){
						control.getCommentCache().reloadComments(list.childNodes[i]);
					}
				}else if(list.childNodes[i].tagName == "forms"){
					if(list.childNodes[i].childNodes.length > 0){
						control.getFormManager().reloadForms(list.childNodes[i]);
					}
				}else if(list.childNodes[i].tagName == "sync"){
					if($def(control.getSyncManager)){
						control.getSyncManager().reloadSync(list.childNodes[i]);
					}
				}else if(list.childNodes[i].tagName == "calendars"){
					if(list.childNodes[i].childNodes.length > 0){
						control.getCalendarCache().reloadCalendars(list.childNodes[i]);
					}
				}else if(list.childNodes[i].tagName == "settings"){
					control.getSettingsManager().reloadSettings(list.childNodes[i]);
				}else if(list.childNodes[i].tagName == "deleted"){
					// here we refresh items that have been deleted
					//
					// the xml is of the format <type>id</type>
					// for instance,
					// <event>3423</event>
					// or <calendar>452</calendar>
					try{
						var list2 = list.childNodes[i];
						for(var j=0;j<list2.childNodes.length;j++){
							if(list2.childNodes[i].tagName == "event"){
								var event_id = parseInt(list2.childNodes[j].nodeValue);
								// delete event event_id
								var event = control.getEventCache().getTaskSilent(task_id);
								control.getEventCache().notifyDeletingEvent(event);
								control.getEventCache().notifyDoneDeletingEvent(event);
							}else if(list2.childNodes[i].tagName == "task"){
								var task_id = parseInt(list2.childNodes[j].nodeValue);
								// delete event event_id
								var task = control.getEventCache().getTaskSilent(task_id);
								control.getEventCache().notifyDeletingTask(task);
								control.getEventCache().notifyDoneDeletingTask(task);
							}else if(list2.childNodes[i].tagName == "calendar"){
								var cal_id = parseInt(list2.childNodes[j].nodeValue);
								// delete event event_id
								var cal = control.getCalendarCache().getCalendar(cal_id);
								if($obj(cal) && cal != null){
									control.getCalendarCache().notifyDeletingCalendar(cal);
									control.getCalendarCache().notifyDoneDeletingCalendar(cal);
								}
							}

						}
					}catch(e){
						alert("exception refreshing deleted items: " + e);
					}
				}
			}

			// lets keep track of the last time that we successfully
			// refreshed everything.
			last_refresh = control.getSettingsManager().getGMT();
			that.notifyDoneRefreshing();
//			alert("refreshed at:" + last_refresh);
		}catch(e){
			alert("refresh.js:loadXML: " + e);
		}
	}

	function loadFail(){
		that.notifyRefreshingFailed();
		// bummmer!
		//
		// we won't do anything here yet :(
	}

	this.loadRemoteXML = function(list){
		that.notifyRefreshing();
		loadXML(list);
	}


	/******************************************
	 * listener functions
	 ******************************************/
	this.addListener = function(list){
		listeners.push(list);
	}

	/**
	 * removes a listener
	 */
	this.removeListener = function(list){
		for(var i=0;i<listeners.length;i++){
			if(listeners[i] == list){
				listeners.splice(i, 1);
			}
		}
	}


	/**
	 * notify listeners that we're refreshing
	 */
	this.notifyRefreshing = function(){
		for(var i=0;i<listeners.length;i++){
			listeners[i].refreshing();
		}
	}

	/**
	 * notify listeners that we're done refreshing
	 */
	this.notifyDoneRefreshing = function(){
		for(var i=0;i<listeners.length;i++){
			listeners[i].doneRefreshing();
		}
	}

	/**
	 * notify listeners that we're refreshing failed
	 */
	this.notifyRefreshingFailed = function(){
		for(var i=0;i<listeners.length;i++){
			listeners[i].refreshingFailed();
		}
	}


	//
	//
	// listen to the login manager
	//
	//
	var list = new Object();
	list.loginOk = function (){
		// we've logged in successfully
		// after being logged out.
		//
		// now we need to refresh from
		// last_session_date
		//
		// actually, we don't need to
		// b/c we were trying to refresh
		// when we found out that we're
		// logged out, and that request
		// will get resent automatically
		// when we get logged back in,
		// so lets not do it twice.
		//


		if(last_session_date.getTime() < last_refresh.getTime()){
			var dt = last_session_date;
		}else{
			var dt = last_refresh;
		}
		sendAjaxRefresh(dt, true);
	}
	list.loginFail = function(){
		// we don't care about this.
	}
	control.getLoginManager().addListener(list);

}