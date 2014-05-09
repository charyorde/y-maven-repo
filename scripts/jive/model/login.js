jive.model.LoginManager = function(control){

	var that = this;

	var listeners = new Array();

	/**
	 * if listeners want to modify themselves
	 * (ie, take itself out of the list)
	 * then they have to add a listener action
	 * which will be executed after all listeners
	 * have been notified of all events
	 * ie, these will only be executed after
	 * notifyLoadFinish and notifyLoadFail
	 */
	var listener_actions = new Array();

	function loginOk(reply){
		try{
			// reply is the message from the server
			// it should contain info about the calendars
			var parser = new jive.xml.XMLParser();
			var list = parser.parse(reply);
			// list is a ROOT xml object
			// and holds the actual document in the
			// documentElement attribute
			if($obj(list.documentElement) && list.documentElement != null){
				// if it returned results at all
				// then get them
				list = list.documentElement;
			}else{
				// otherwise show empty results
				list = new Object();
				list.childNodes = new Array();
				list.tagName = "failed";
			}
			if(list.tagName == "success"){
				that.notifyLoginOk();
			}else{
				that.notifyLoginFail();
			}
		}catch(e){
			alert(e);
		}
	}

	function loginFail(){
		that.notifyLoginFail();
	}

	this.login = function(password){
		var a = new jotlet.external.y.yAjax(loginOk, loginFail);
        alert("logging in via ajax");
//        a.POST(HOSTURL + AJAXPATH + "?login","username=" + control.getSettingsManager().getUserName() + "&password=" + password);
	}

	/******************************************
	 * listener functions
	 ******************************************/
	var lock = false;

	function executeListenerActions(){
		while(listener_actions.length > 0){
			listener_actions[0]();
			listener_actions.splice(0,1);
		}
	}

	this.addListener = function(list){
		if(!lock){
			listeners.push(list);
		}else{
			listener_actions.push(function(){that.addListener(list);});
		}
	}

	/**
	 * removes a listener
	 */
	this.removeListener = function(list){
		if(!lock){
			for(var i=0;i<listeners.length;i++){
				if(listeners[i] == list){
					listeners.splice(i, 1);
				}
			}
		}else{
			listener_actions.push(function(){that.removeListener(list);});
		}
	}


	/**
	 * notify listeners that the user is logged in
	 */
	this.notifyLoginOk = function(){
		lock = true;
		for(var i=0;i<listeners.length;i++){
			listeners[i].loginOk();
		}
		lock = false;
		executeListenerActions();
	}

	/**
	 * notify listeners that the user is logged in
	 */
	this.notifyLoginFail = function(){
		lock = true;
		for(var i=0;i<listeners.length;i++){
			listeners[i].loginFail();
		}
		lock = false;
		executeListenerActions();
	}
	/******************************************
	 * end listener functions
	 ******************************************/
}