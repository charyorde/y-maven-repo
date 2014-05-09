/**
 * @depends path=/resources/scripts/jive/ext/x/x_core.js
 * @depends path=/resources/scripts/jive/ext/y/y_core.js
 * @depends path=/resources/scripts/jive/model/date.js
 * @depends path=/resources/scripts/jive/model/task_list.js
 */
jive.model.isEvent = function(t){
    return $obj(t) && t != null && $def(t.getStart) && $def(t.getEnd)
}

jive.model.isTask = function(t){
    return $obj(t) && t != null && $def(t.getDueDate) && $def(t.getProjectID)
}

jive.model.Task = function(){

    var that = this;

    var PERSONAL = 0;

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

    this.confirm = function(){
        that.notifyTaskChanged();
    }
    
    //
    // properties
    var id;
    var project_id = PERSONAL; // personal task
    var due = null;
    var subject;
    var description;
    var created_by;
    var created_on;
    var assigned_to;
    var assigned_by;
    var complete;
    var url;
    var parentTaskID = -1;
    var isParent = false;

    this.getID = function(){
        return id;
    }
    this.getProjectID = function(){
        return project_id;
    }
    this.getDueDate = function(){
        return due;
    }
    this.hasDueDate = function(){
        return due != null;
    }
    this.getSubject = function(){
        return subject;
    }
    this.getDescription = function(){
        return description;
    }
    this.getCreatedBy = function(){
        return created_by;
    }
    this.getCreatedOn = function(){
        return created_on;
    }
    this.getAssignedBy = function(){
        return assigned_by;
    }
    this.getAssignedTo = function(){
        return assigned_to;
    }
    this.getURL = function(){
        return url;
    }
    this.isComplete = function(){
        return complete;
    }
    this.getParentTaskID = function(){
        return parentTaskID;
    }
    this.isParent = function(){
        return isParent;
    }
    this.setIsParent = function(parent){
        isParent = parent;
    }
    this.setParentTaskID = function(id){
        parentTaskID = id;
    }
    this.setID = function(i){
        id = i;
    }
    this.setProjectID = function(i){
        project_id = i;
    }
    this.setCreatedBy = function(n){
        created_by = n;
    }
    this.setCreatedOn = function(n){
        created_on = n;
    }
    this.setComplete = function(b){
        complete = b;
    }
    this.setURL = function(u){
        url = u;
    }


    this.setDueDate = function(d){
        revert_actions.push(createRevertAction(function(val){ due = val; }, due));
        due = d;
    }
    this.setSubject = function(n){
        revert_actions.push(createRevertAction(function(val){ subject = val; }, subject));
        subject = n;
    }
    this.setDescription = function(d){
        revert_actions.push(createRevertAction(function(val){ description = val; }, description));
        description = d;
    }
    this.setAssignedBy = function(u){
        revert_actions.push(createRevertAction(function(val){ assigned_by = val; }, assigned_by));
        assigned_by = u;
    }
    this.setAssignedTo = function(d){
        revert_actions.push(createRevertAction(function(val){ assigned_to = val; }, assigned_to));
        assigned_to = d;
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
        that.setCreatedBy = null;
        that.setCreatedOn = null;
        that.setURL = null;
    }


    /******************************************
     * listener functions
     ******************************************/
    var listeners = new Array();
    
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
     * notify listeners that the task has changed
     */
    this.notifyTaskChanged = function(){
        for(var i=0;i<listeners.length;i++){
            listeners[i].taskChanged(that);
        }
    }
    /******************************************
     * end listener functions
     ******************************************/


}


jive.model.TaskCache = function(control){

    var that = this;

    var cache = new jive.ext.y.HashTable();

    /**
     * define a task listener class
     * this will listen to task objects that are
     * added to this cache.
     *
     * if any task changes, then we'll update our listeners
     * about it
     */
    function TaskListener(){
        this.taskChanged = function(ttask){
            that.notifyTaskChanged(ttask);
        }
    }

    function refreshTaskInCache(ttask){
        var t = cache.get(ttask.getID());
        if($obj(t)){
            t.setDueDate(ttask.getDueDate());
            t.setSubject(ttask.getSubject());
            t.setDescription(ttask.getDescription());
            t.setAssignedTo(ttask.getAssignedTo());
            t.setAssignedBy(ttask.getAssignedBy());
            t.setParentTaskID(ttask.getParentTaskID());
            t.setIsParent(ttask.isParent());
            t.clearRevertActions();
        }else{
            ttask.addListener(new TaskListener());
            cache.put(ttask.getID(), ttask);
        }
        that.notifyLoadTask(ttask);
    }

    /**
     * save the calendar to the DB
     */
    this.saveTask= function(ttask){
        that.notifySavingTask(ttask);
        try{
            var settings = control.getSettingsManager();
            var dh = new jive.model.DateHelper(control);
            var a = control.newAjax(
                function(list){
                    try{
                        if(list.tagName == "success"){
                            that.notifyDoneSavingTask(ttask);
                        }else{
                            that.notifySavingTaskFailed(ttask);
                        }
                    }catch(e){
                        alert(e);
                    }
                },
                function(){
                    try{
                        that.notifySavingTaskFailed(ttask);
                    }catch(e){
                        alert("saving failed: " + e);
                    }
                });
            var due      = ttask.getDueDate();
            due          = (due != null) ? dh.formatToDateTime(due) : "";
            var nd = ! ttask.hasDueDate();
            var status   = ttask.getStatus();
            var title = ttask.getSubject();
            var description = ttask.getDescription();
            var projID = ttask.getProjectID();

            a.POST(HOSTURL + AJAXPATH + "?save_task","task_id=" + encodeURIComponent(ttask.getID()) + "&due=" + encodeURIComponent(due) + "&status=" + encodeURIComponent(status) + "&title=" + encodeURIComponent(title) + "&description=" + encodeURIComponent(description) + "&never_due=" + encodeURIComponent(nd ? "1" : "0") + "&project_id=" + projID);
        }catch(e){
            that.notifySavingTaskFailed(ttask);
        }
    }



    function loadTasksXML(list){
        var ret = new Array();
        for(var i=0;i<list.childNodes.length;i++){
            var task = new jive.model.Task();
            var list2 = list.childNodes[i];
            for(var j=0;j<list2.childNodes.length;j++){
                if(list2.childNodes[j].tagName == "id"){
                    if(list2.childNodes[j].childNodes.length > 0)
                        task.setID(list2.childNodes[j].childNodes[0].nodeValue);
                }else if(list2.childNodes[j].tagName == "pid"){
                        if(list2.childNodes[j].childNodes.length > 0)
                            task.setProjectID(list2.childNodes[j].childNodes[0].nodeValue);
                }else if(list2.childNodes[j].tagName == "due"){
                    var dt = list2.childNodes[j].childNodes[0].nodeValue;
                    if(dt != null){
                        task.setDueDate(new Date(dt.replace(/-/g,"/")));
                    }else{
                        task.setDueDate(null)
                    }
                }else if(list2.childNodes[j].tagName == "subj"){
                    task.setSubject(list2.childNodes[j].childNodes[0].nodeValue);
                }else if(list2.childNodes[j].tagName == "desc"){
                    if(list2.childNodes[j].childNodes.length > 0)
                        task.setDescription(list2.childNodes[j].childNodes[0].nodeValue);
                }else if(list2.childNodes[j].tagName == "c_on"){
                    var dt = list2.childNodes[j].childNodes[0].nodeValue;
                    if(dt != null){
                        task.setCreatedOn(new Date(dt.replace(/-/g,"/")));
                    }else{
                        task.setCreatedOn(null)
                    }
                }else if(list2.childNodes[j].tagName == "c_by"){
                    task.setCreatedBy(control.getUserCache().loadExternalUser(list2.childNodes[j].childNodes[0]));
                }else if(list2.childNodes[j].tagName == "a_by"){
                    task.setAssignedBy(control.getUserCache().loadExternalUser(list2.childNodes[j].childNodes[0]));
                }else if(list2.childNodes[j].tagName == "a_to"){
                    task.setAssignedTo(control.getUserCache().loadExternalUser(list2.childNodes[j].childNodes[0]));
                }else if(list2.childNodes[j].tagName == "url"){
                    task.setURL(list2.childNodes[j].childNodes[0].nodeValue);
                }else if(list2.childNodes[j].tagName == "status"){
                    task.setComplete(list2.childNodes[j].nodeValue == "c");
                }else if(list2.childNodes[j].tagName == "parent_task_id"){
                    task.setParentTaskID(list2.childNodes[j].childNodes[0].nodeValue);
                }else if(list2.childNodes[j].tagName == "is_parent"){
                    task.setIsParent(list2.childNodes[j].childNodes[0].nodeValue == "true");
                }
            }
            ret.push(task);
            task.cleanAfterInit();
            refreshTaskInCache(task);
        }
        return ret;
    }


    //
    // expects a <tasks> tag
    this.loadExternalTasks = function(list){
        that.notifyLoadBegin();
        try{
            var u = loadTasksXML(list);
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
    this.notifyTaskChanged = function(p){
        for(var i=0;i<listeners.length;i++){
            listeners[i].taskChanged(p);
        }
        that.executeListenerActions();
    }

    this.notifyLoadTask = function(p){
        for(var i=0;i<listeners.length;i++){
            listeners[i].loadTask(p);
        }
        that.executeListenerActions();
    }

    this.notifyLoadBegin = function(){
        for(var i=0;i<listeners.length;i++){
            listeners[i].beginLoadingTasks();
        }
        that.executeListenerActions();
    }

    this.notifyLoadFinish = function(){
        for(var i=0;i<listeners.length;i++){
            listeners[i].doneLoadingTasks();
        }
        that.executeListenerActions();
    }

	this.notifyLoadFail = function(){
		for(var i=0;i<listeners.length;i++){
			listeners[i].loadingTasksFailed();
		}
		that.executeListenerActions();
	}


    var list = new jive.model.TaskCacheListener();
    list.taskChanged = function(t){
        that.saveTask(t);
    }
    that.addListener(list);

}