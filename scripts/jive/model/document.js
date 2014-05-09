jive.model.isDocument = function(t){
    return $obj(t) && t != null && $def(t.getBody) && $def(t.getSubject)
}

jive.model.Document = function(){

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

    this.confirm = function(){
        that.notifyTaskChanged();
    }
    
    //
    // properties
    var id;
    var html;

    this.getID = function(){
        return id;
    }
    this.getHTML = function(){
        return html;
    }

    this.setID = function(i){
        id = i;
    }
    this.setHTML = function(h){
        revert_actions.push(createRevertAction(function(val){ html = val; }, html));
        html = h;
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
    }

    /**
     * converts this document's HTML to wiki
     * format
     * @param list
     */
    this.convertToWiki = function(){
        objectLookupSessionKey
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
    this.notifyDocumentChanged = function(){
        for(var i=0;i<listeners.length;i++){
            listeners[i].documentChanged(that);
        }
    }
    /******************************************
     * end listener functions
     ******************************************/


}


jive.model.DocumentCache = function(control){

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
    function DocumentListener(){
        this.documentChanged = function(doc){
            that.notifyDocumentChanged(doc);
        }
    }

    function refreshDocumentInCache(ttask){
        var t = cache.get(ttask.getID());
        if($obj(t)){
            //
            //  update properties of doc  here
            //
            t.clearRevertActions();
        }else{
            ttask.addListener(new DocumentListener());
            cache.put(ttask.getID(), ttask);
        }
        that.notifyLoadDocument(ttask);
    }

    /**
     * save the calendar to the DB
     */
    this.saveDocument= function(ttask){
        that.notifySavingDocument(ttask);
        try{
            var settings = control.getSettingsManager();
            var a = control.newAjax(
                function(list){
                    try{
                        if(list.tagName == "success"){
                            that.notifyDoneSavingDocument(ttask);
                        }else{
                            that.notifySavingDocumentFailed(ttask);
                        }
                    }catch(e){
                        alert(e);
                    }
                },
                function(){
                    try{
                        that.notifySavingDocumentFailed(ttask);
                    }catch(e){
                        alert("saving failed: " + e);
                    }
                });

            // save document here
//            a.POST(HOSTURL + AJAXPATH + "?save_task","task_id=" + encodeURIComponent(ttask.getID()) + "&due=" + encodeURIComponent(due) + "&status=" + encodeURIComponent(status) + "&title=" + encodeURIComponent(title) + "&description=" + encodeURIComponent(description) + "&never_due=" + encodeURIComponent(nd ? "1" : "0") + "&project_id=" + projID);
        }catch(e){
            that.notifySavingDocumentFailed(ttask);
        }
    }

    function newDocumentFromWikiHelper(html){
        that.notifyNewDocumentFromWiki(new jive.model.Document("",html));
    }

    /**
     * Creates a document object from wiki markup
     * (the document is loaded in after AJAX
     * @param list
     */
    this.newDocumentFromWiki = function(wiki){
        if(!$def(window.objectLookupSessionKey)){
            throw "window.objectLookupSessionKey must be defined to use newDocumentFromWiki()";
        }
        if(!$def(WikiTextConverter)){
            throw "WikiTextConverter must be defined to use newDocumentFromWiki()";
        }
        WikiTextConverter.convertFromWiki(wiki, window.objectLookupSessionKey,
            {
                callback: newDocumentFromWikiHelper,
                timeout: DWRTimeout, // 20 seconds
                errorHandler: that.notifyNewDocumentFromWikiFailed
            }
        );
    }


    function loadTasksXML(list){
        var ret = new Array();
        for(var i=0;i<list.childNodes.length;i++){
            var task = new jive.model.Document();
            var list2 = list.childNodes[i];
            for(var j=0;j<list2.childNodes.length;j++){
                if(list2.childNodes[j].tagName == "id"){
                    if(list2.childNodes[j].childNodes.length > 0)
                        task.setID(list2.childNodes[j].childNodes[0].nodeValue);
                }
            }
            ret.push(task);
            task.cleanAfterInit();
            refreshDocumentInCache(task);
        }
        return ret;
    }


    //
    // expects a <tasks> tag
    this.loadExternalDocuments = function(list){
        that.notifyLoadBegin();
        try{
            var u = loadDocumentsXML(list);
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
    this.notifyDocumentChanged = function(p){
        for(var i=0;i<listeners.length;i++){
            listeners[i].documentChanged(p);
        }
        that.executeListenerActions();
    }

    this.notifyLoadDocument = function(p){
        for(var i=0;i<listeners.length;i++){
            listeners[i].loadDocument(p);
        }
        that.executeListenerActions();
    }

    this.notifyLoadBegin = function(){
        for(var i=0;i<listeners.length;i++){
            listeners[i].beginLoadingDocuments();
        }
        that.executeListenerActions();
    }

    this.notifyLoadFinish = function(){
        for(var i=0;i<listeners.length;i++){
            listeners[i].doneLoadingDocuments();
        }
        that.executeListenerActions();
    }

	this.notifyLoadFail = function(){
		for(var i=0;i<listeners.length;i++){
			listeners[i].loadingDocumentsFailed();
		}
		that.executeListenerActions();
	}

    this.notifySavingDocument = function(p){
        for(var i=0;i<listeners.length;i++){
            listeners[i].savingDocument(p);
        }
        that.executeListenerActions();
    }

    this.notifyDoneSavingDocument = function(p){
        for(var i=0;i<listeners.length;i++){
            listeners[i].doneSavingDocument(p);
        }
        that.executeListenerActions();
    }

    this.notifySavingDocumentFailed = function(p){
        for(var i=0;i<listeners.length;i++){
            listeners[i].savingDocumentFailed(p);
        }
        that.executeListenerActions();
    }
    this.notifyNewDocumentFromWiki = function(doc){
        for(var i=0;i<listeners.length;i++){
            listeners[i].newDocumentFromWiki(doc);
        }
        that.executeListenerActions();
    }
    this.notifyNewDocumentFromWikiFailed = function(){
        for(var i=0;i<listeners.length;i++){
            listeners[i].newDocumentFromWikiFailed(p);
        }
        that.executeListenerActions();
    }

    var list = new jive.model.DocumentCacheListener();
    list.documentChanged = function(t){
        that.saveDocument(t);
    }
    that.addListener(list);

}