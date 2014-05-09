/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * @depends path=/resources/scripts/jive/model/ajax.js
 * @depends path=/resources/scripts/jive/model/login.js
 * @depends path=/resources/scripts/jive/model/settings.js
 * @depends path=/resources/scripts/jive/model/refresh.js
 * @depends path=/resources/scripts/jive/model/language.js
 * @depends path=/resources/scripts/jive/model/project.js
 * @depends path=/resources/scripts/jive/model/user.js
 * @depends path=/resources/scripts/jive/model/task.js
 * @depends path=/resources/scripts/jive/model/places.js
 */
jive.model.Controller = function(){

    var that = this;

    //
    // fake default language for now
    //
    var def_lang = new Object();
    def_lang.childNodes = new Array();


    //
    // return an object to help us ajax
    this.newAjax = function(rdyFun, errFun){
        return new jive.model.Ajax(that, rdyFun, errFun);
    };

    //
    //
    // settings / etc managers here
    //
    var login_manager = new jive.model.LoginManager(that);

    this.getLoginManager = function(){
        return login_manager;
    }

    var settings_manager = new jive.model.SettingsManager(that);

    this.getSettingsManager = function(){
        return settings_manager;
    }

    var refresh_manager = new jive.model.RefreshManager(that);

    this.getRefreshManager = function(){
        return refresh_manager;
    }

    var language_manager = new jive.model.LanguageManager(that, default_lang);

    this.getLanguageManager = function(){
        return language_manager;
    }




    //
    //
    // model below here
    //

    var project_cache = new jive.model.ProjectCache(that);

    this.getProjectCache = function(){
        return project_cache;
    }

    var user_cache = new jive.model.UserCache(that);

    this.getUserCache = function(){
        return user_cache;
    }

    var task_cache = new jive.model.TaskCache(that);

    this.getTaskCache = function(){
        return task_cache;
    }

    // to prevent data collisions, places and spaces widgets have their own cache instance
    var places_cache = new jive.model.PlacesCache(that);

    this.getPlacesCache = function(){
        return places_cache;
    }

    var task_manager = null;
    
    this.getTaskManager = function(){
        return task_manager;
    }

    this.setTaskManager = function(mgr){
        task_manager = mgr;
    }

    var checkpoint_manager = null;

    this.getCheckPointManager = function(){
        return checkpoint_manager;
    }

    this.setCheckPointManager = function(mgr){
        checkpoint_manager = mgr;
    }

    var user_id= null;

    this.getUserID = function(){
        return user_id;
    }

    this.setUserID = function(id){
        user_id = id;
    }


    //
    // we found out that we're logged out
    // when we tried to thunk(). log back
    // in, and thunk() again.
    this.handleLogIn = function(thunk){
        // uh oh, tell the refresh manager
        // that we're logged out

        that.getRefreshManager().loggedOut();

        //
        // optionally let the user login again via ajax
        // if successful, be sure to call thunk();

    }

    // an ajax call succeeded
    // tell the refresh manager
    this.poke = function(){
        that.getRefreshManager().poke();
    }

    //
    // return true if the calendar/project is
    // visible, false otherwise
    this.isCalendarVisibleHuh = function(id){
        return true;
    }

    this.isReadOnly = function(){
        return false;
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
    this.notifyTinyMCELoaded = function(){
        for(var i=0;i<listeners.length;i++){
            listeners[i].tinyMCELoaded();
        }
        that.executeListenerActions();
    }
}

define('jive.model.Controller', function() {
    return jive.model.Controller;
});