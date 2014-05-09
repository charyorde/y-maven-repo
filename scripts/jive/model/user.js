jive.model.User = function(){

    var that = this;

    /**
     * if saving the settings fails,
     * then the revert() will be called
     * and we'll need to revert all our values
     *
     * this array will hold thunks that can
     * revert the changes
     */
    var revert_actions = new Array();

    function createRevertAction(func, value){
        return function(){ func(value); }
    }
    /**
     * we don't need to save our revert actions anymore
     * probably b/c a save to DB went ok,
     * so set it as an emtpy array
     */
    this.clearRevertActions = function(){
        revert_actions = new Array();
    }
    /**
     * we need to revert to our old values
     * probably b/c a save to the DB when wrong
     */
    this.revert = function(){
        while(revert_actions.length > 0){
            revert_actions[0]();
            revert_actions.splice(0,1);
        }
    }

    //
    // properties
    var id;
    var username;
    var fullname;
    var url;

    this.getID = function(){
        return id;
    }
    this.getUsername = function(){
        return username;
    }
    this.getFullName = function(){
        return fullname;
    }
    this.getURL = function(){
        return url;
    }

    this.setID = function(i){
        id = i;
    }
    this.setUsername = function(n){
        username = n;
    }
    this.setFullName= function(n){
        revert_actions.push(createRevertAction(function(val){ fullname = val; }, fullname));
        fullname = n;
    }
    this.setURL = function(u){
        url = u;
    }
    /**
     * This function removes all setters for
     * properties that should never be reset after
     * the object has been loaded into the cache.
     *
     * physically removing these functions after
     * init will help us stop devs from calling
     * them accidentally.
     */
    this.cleanAfterInit = function(){
        that.clearRevertActions();
        that.setID = null;
        that.setUsername = null;
        this.setURL = null;
    }
}


jive.model.UserCache = function(control){

    var that = this;

    var cache = new jive.ext.y.HashTable();


    function refreshUserInCache(user){
        var u = cache.get(user.getID());
        if($obj(u)){
            u.setFullName(user.getFullName());
            u.clearRevertActions();
        }else{
            cache.put(user.getID(), user);
        }
        that.notifyLoadUser(user);
    }

    function loadUserXML(list){
        var user = new jive.model.User();
        for(var j=0;j<list.childNodes.length;j++){
            if(list.childNodes[j].tagName == "i"){
                if(list.childNodes[j].childNodes.length > 0)
                    user.setID(parseInt(list.childNodes[j].childNodes[0].nodeValue));
            }else if(list.childNodes[j].tagName == "u"){
                user.setUsername(list.childNodes[j].childNodes[0].nodeValue);
            }else if(list.childNodes[j].tagName == "n"){
                user.setFullName(list.childNodes[j].childNodes[0].nodeValue);
            }else if(list.childNodes[j].tagName == "url"){
                user.setURL(list.childNodes[j].childNodes[0].nodeValue);
            }
        }
        user.cleanAfterInit();
        refreshUserInCache(user);
        return user;
    }


    //
    // expects a <user> tag
    this.loadExternalUser = function(list){
        that.notifyLoadBegin();
        try{
            var u = loadUserXML(list);
            that.notifyLoadFinish();
            return u;
        }catch(e){
            that.notifyLoadFail();
        }
        return null;
    }

    /******************************************
     * listener functions
     ******************************************/
    this.addListener = function(list){
        listeners.push(list);
    }

    var listeners = new Array();
    var listener_actions = new Array();
    /**
     * act must be a thunk (a function without arguments)
     * it will be executed after either
     * notifyLoadFinish or notifyLoadFail
     */
    this.addListenerAction = function(act){
        listener_actions.push(act);
    }

    /**
     * private
     * executes all the listener actions
     */
    this.executeListenerActions = function(){
        while(listener_actions.length > 0){
            listener_actions[0]();
            listener_actions.splice(0,1);
        }
    }

    this.removeListener = function(list){
        for(var i=0;i<listeners.length;i++){
            if(listeners[i] == list){
                listeners.splice(i, 1);
            }
        }
    }

    /**
     * notification functions
     */
    this.notifyLoadUser = function(p){
        for(var i=0;i<listeners.length;i++){
            listeners[i].loadUser(p);
        }
        that.executeListenerActions();
    }

    this.notifyLoadBegin = function(){
        for(var i=0;i<listeners.length;i++){
            listeners[i].beginLoadingUsers();
        }
        that.executeListenerActions();
    }

    this.notifyLoadFinish = function(){
        for(var i=0;i<listeners.length;i++){
            listeners[i].doneLoadingUsers();
        }
        that.executeListenerActions();
    }

	this.notifyLoadFail = function(){
		for(var i=0;i<listeners.length;i++){
			listeners[i].loadingUsersFailed();
		}
		that.executeListenerActions();
	}

}