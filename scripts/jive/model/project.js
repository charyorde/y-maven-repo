/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.model.isCheckPoint = function(cp){
    return $def(cp) && $obj(cp) && cp != null && $def(cp.isCheckPoint);
}

jive.model.CheckPoint = function(p){
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

    var proj = p;

    this.getProject = function(){
        return proj;
    }

    var id;
    var created_on = null;
    var last_modified = null;
    var name = "";
    var desc = "";
    var due = null;

    this.isCheckPoint = function(){ return true; };    

    this.getID = function(){
        return id;
    }
    this.getCreatedOn = function(){
        return created_on;
    }
    this.getLastModifiedOn = function(){
        return last_modified;
    }
    this.getName = function(){
        return name;
    }
    this.getDescription = function(){
        return desc;
    }
    this.getDueDate = function(){
        return due;
    }

    this.setID = function(i){
        id = i;
    }
    this.setCreatedOn = function(n){
        created_on = n;
    }
    this.setLastModifiedOn = function(n){
        last_modified = n;
    }
    this.setName = function(n){
        revert_actions.push(createRevertAction(function(val){ name = val; }, name));
        name = n;
    }
    this.setDescription = function(d){
        revert_actions.push(createRevertAction(function(val){ desc = val; }, desc));
        desc = d;
    }
    this.setDueDate = function(d){
        revert_actions.push(createRevertAction(function(val){ due = val; }, due));
        due = d;
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
        that.setCreatedOn = null;
        that.setLastModifiedOn = null;
    }

}


jive.model.Project = function(){

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
    var name = "";
    var desc = "";
    var creator;
    var due;
    var last_modified;
    var tasks;
    var editable = false;
    var cps = new Array();

    this.getID = function(){
        return id;
    }
    this.getCreator = function(){
        return creator;
    }
    this.getLastModifiedOn = function(){
        return last_modified;
    }
    this.getName = function(){
        return name;
    }
    this.getDescription = function(){
        return desc;
    }
    this.getDueDate = function(){
        return due;
    }
    this.getTasks = function(){
        return tasks;
    }
    this.isEditable = function(){
        return editable;
    }
    this.getCheckPoints = function(){
        return cps;
    }

    this.setID = function(i){
        id = i;
    }
    this.setCreator = function(i){
        creator = i;
    }
    this.setEditable = function(b){
        editable = b;
    }
    this.setLastModifiedOn = function(n){
        last_modified = n;
    }
    this.setName = function(n){
        revert_actions.push(createRevertAction(function(val){ name = val; }, name));
        name = n;
    }
    this.setDescription = function(d){
        revert_actions.push(createRevertAction(function(val){ desc = val; }, desc));
        desc = d;
    }
    this.setDueDate = function(d){
        revert_actions.push(createRevertAction(function(val){ due = val; }, due));
        due = d;
    }
    this.setTasks = function(t){
        tasks = t;
    }
    this.setCheckPoints = function(c){
        cps = c;
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
        that.setCreator = null;
        that.setEditable = null;
        that.setLastModifiedOn = null;
        that.setCheckPoints = null;
    }
}


jive.model.ProjectCache = function(control){

    var that = this;

    var cache = new jive.ext.y.HashTable();

    this.getProject = function(pID){
        return cache.get(pID);
    }

    this.getProjects = function(){
        return cache.toArray();
    }

    function refreshProjectInCache(proj){
        var p = cache.get(proj.getID());
        if($obj(p)){
            p.setCreator(proj.getCreator());
            p.setDescription(proj.getDescription());
            p.setDueDate(proj.getDueDate());
            p.clearRevertActions();
        }else{
            cache.put(proj.getID(), proj);
        }
        that.notifyLoadProject(proj);
    }

    function loadProjectsXML(list){
        var ret = new Array();
        for(var i=0;i<list.childNodes.length;i++){
            var proj = new jive.model.Project();
            var list2 = list.childNodes[i];
            var cps = new Array();
            for(var j=0;j<list2.childNodes.length;j++){
                if(list2.childNodes[j].tagName == "id"){
                    if(list2.childNodes[j].childNodes.length > 0)
                        proj.setID(list2.childNodes[j].childNodes[0].nodeValue);
                }else if(list2.childNodes[j].tagName == "name"){
                    if(list2.childNodes[j].childNodes.length > 0)
                        proj.setName(list2.childNodes[j].childNodes[0].nodeValue);
                }else if(list2.childNodes[j].tagName == "desc"){
                    if(list2.childNodes[j].childNodes.length > 0)
                        proj.setDescription(list2.childNodes[j].childNodes[0].nodeValue);
                }else if(list2.childNodes[j].tagName == "creator"){
                    var list3 = list2.childNodes[j];
                    var u = control.getUserCache().loadExternalUser(list3.childNodes[0]);
                    proj.setCreator(u);
                }else if(list2.childNodes[j].tagName == "d_on"){
                    var dt = list2.childNodes[j].childNodes[0].nodeValue;
                    if(dt != null){
                        proj.setDueDate(new Date(dt.replace(/-/g,"/")));
                    }else{
                        proj.setDueDate(null)
                    }
                }else if(list2.childNodes[j].tagName == "m_on"){
                    var dt = list2.childNodes[j].childNodes[0].nodeValue;
                    if(dt != null){
                        proj.setLastModifiedOn(new Date(dt.replace(/-/g,"/")));
                    }else{
                        proj.setLastModifiedOn(null)
                    }
                }else if(list2.childNodes[j].tagName == "editable"){
                    proj.setEditable(true);
                }else if(list2.childNodes[j].tagName == "tasks"){
                    var list3 = list2.childNodes[j];
                    var u = control.getTaskCache().loadExternalTasks(list3);
                    proj.setTasks(u);
                }else if(list2.childNodes[j].tagName == "cps"){
                    var list3 = list2.childNodes[j];
                    for(var k=0;k<list3.childNodes.length;k++){
                        var listcp = list3.childNodes[k];
                        var cp = new jive.model.CheckPoint(proj);
                        for(var l=0;l<listcp.childNodes.length;l++){
                            if(listcp.childNodes[l].tagName == "id"){
                                if(listcp.childNodes[l].childNodes.length > 0)
                                    cp.setID(listcp.childNodes[l].childNodes[0].nodeValue);
                            }else if(listcp.childNodes[l].tagName == "c_on"){
                                var dt = listcp.childNodes[l].childNodes[0].nodeValue;
                                if(dt != null){
                                    cp.setCreatedOn(new Date(dt.replace(/-/g,"/")));
                                }else{
                                    cp.setCreatedOn(null)
                                }
                            }else if(listcp.childNodes[l].tagName == "m_on"){
                                var dt = listcp.childNodes[l].childNodes[0].nodeValue;
                                if(dt != null){
                                    cp.setLastModifiedOn(new Date(dt.replace(/-/g,"/")));
                                }else{
                                    cp.setLastModifiedOn(null)
                                }
                            }else if(listcp.childNodes[l].tagName == "nm"){
                                if(listcp.childNodes[l].childNodes.length > 0)
                                    cp.setName(listcp.childNodes[l].childNodes[0].nodeValue);
                            }else if(listcp.childNodes[l].tagName == "desc"){
                                if(listcp.childNodes[l].childNodes.length > 0)
                                    cp.setDescription(listcp.childNodes[l].childNodes[0].nodeValue);
                            }else if(listcp.childNodes[l].tagName == "due"){
                                if(listcp.childNodes[l].childNodes.length > 0){
                                    var dt = listcp.childNodes[l].childNodes[0].nodeValue;
                                    if(dt != null){
                                        cp.setDueDate(new Date(dt.replace(/-/g,"/")));
                                    }else{
                                        cp.setDueDate(null)
                                    }
                                }
                            }
                        }
                        cps.push(cp);
                        proj.setCheckPoints(cps);
                    }
                }
            }
            refreshProjectInCache(proj);
            ret.push(proj);
        }
        return ret;
    }

    //
    // expects a <projects> tag
    this.loadExternalProjects = function(list){
        that.notifyLoadBegin();
        try{
            var ret = loadProjectsXML(list);
            that.notifyLoadFinish();
            return ret;
        }catch(e){
            that.notifyLoadFail();
        }
        return null;
    }

    /**
     * return true if the user can edit the project
     * false otherwise
     * @param pID the id of the project
     */
    this.canEditProjectHuh = function(pID){
        if(pID == 0) return true;
    }

    /******************************************
     * listener functions
     ******************************************/
    this.addListener = function(list){
        listeners.push(list);
    }

    var listeners = new Array();
    var working = 0;
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
        if(working == 0){
            for(var i=0;i<listeners.length;i++){
                if(listeners[i] == list){
                    listeners.splice(i, 1);
                }
            }
        }else{
            that.addListenerAction(function(list){
                return function(){
                   that.removeListener(list);
                }
            }(list));
        }
    }

    /**
     * notification functions
     */
    this.notifyLoadProject = function(p){
        working++;
        for(var i=0;i<listeners.length;i++){
            listeners[i].loadProject(p);
        }
        working--;
        that.executeListenerActions();
    }

    this.notifyLoadBegin = function(){
        working++;
        for(var i=0;i<listeners.length;i++){
            listeners[i].beginLoadingProjects();
        }
        working--;
        that.executeListenerActions();
    }

    this.notifyLoadFinish = function(){
        working++;
        for(var i=0;i<listeners.length;i++){
            listeners[i].doneLoadingProjects();
        }
        working--;
        that.executeListenerActions();
    }

	this.notifyLoadFail = function(){
        working++;
		for(var i=0;i<listeners.length;i++){
			listeners[i].loadingProjectsFailed();
		}
        working--;
		that.executeListenerActions();
	}

}