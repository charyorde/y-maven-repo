/**
 * @depends path=/resources/scripts/jive/ext/x/x_core.js
 */
jive.model.isLanguage = function(lang){
	return $def(lang) && $obj(lang) && lang != null && $def(lang.translate) && $def(lang.getId);
}

/**
 * represents a single language
 */
jive.model.Language = function(id, name, hash){

	var that = this;

	this.getId = function(){
		return id;
	}

	this.getName = function(){
		return name;
	}

	this.translate = function(key){
		var val = hash.get(key);
		if(val == false){
			alert("Language Exception: key \"" + key + "\" not found");
		}else{
			if(val == "_"){
				return " ";
			}else{
				val = val.replace(/#xD#xA/g,"\r\n");
				return val;
			}
		}
	}

    var colors = new Array();
    colors.push("red"),
    colors.push("blue"),
    colors.push("green"),
    colors.push("pink"),
    colors.push("purple"),
    colors.push("orange"),
    colors.push("yellow"),
    colors.push("grey");
	this.color = function(i){
		return that.translate("color_" + colors[i]);
	}

	this.longMonth = function(i){
		var names = new Array();
		names.push("january");
		names.push("february");
		names.push("march");
		names.push("april");
		names.push("may");
		names.push("june");
		names.push("july");
		names.push("august");
		names.push("september");
		names.push("october");
		names.push("november");
		names.push("december");
		return that.translate(names[i]);
	}

	this.shortMonth = function(i){
		var names = new Array();
		names.push("sh_january");
		names.push("sh_february");
		names.push("sh_march");
		names.push("sh_april");
		names.push("sh_may");
		names.push("sh_june");
		names.push("sh_july");
		names.push("sh_august");
		names.push("sh_september");
		names.push("sh_october");
		names.push("sh_november");
		names.push("sh_december");
		return that.translate(names[i]);
	}

	this.longDay = function(i){
		var names = new Array();
		names.push("sunday");
		names.push("monday");
		names.push("tuesday");
		names.push("wednesday");
		names.push("thursday");
		names.push("friday");
		names.push("saturday");
		return that.translate(names[i]);
	}

	this.shortDay = function(i){
		var names = new Array();
		names.push("sh_sunday");
		names.push("sh_monday");
		names.push("sh_tuesday");
		names.push("sh_wednesday");
		names.push("sh_thursday");
		names.push("sh_friday");
		names.push("sh_saturday");
		return that.translate(names[i]);
	}

	this.weekNumber = function(i){
		var names = new Array();
		names.push("recur_first");
		names.push("recur_second");
		names.push("recur_third");
		names.push("recur_fourth");
		names.push("recur_fifth");
		names.push("recur_last");
		return that.translate(names[i]);
	}
}


// checks for the existance of var default_lang
//
// if present, it parses it and stores it as the active language



/**
 * caches all day's comments objects that might show up in main views
 * (especially day view)
 */
jive.model.LanguageManager = function(control, default_lang){

	/**
	 * to reference other functions in this object
	 * from functions in this object,
	 * use that.func() sytax
	 */
	var that = this;

	/**
	 * the currently active language
	 * this will be what jotlet uses to translate the UIs
	 */
	var active_lang = null;


	/**
	 * the list of allowed languages
	 */
	var language_list = new Array();

	/**
	 * the cache of buddy objects
	 */
	var cache = new jive.ext.y.HashTable();


	/**
	 * the array of CommentCacheListener objects
	 *
	 * the object must have the following functions
	 *
	 * beginLoadingComments() // called when loading begins
	 * loadingCommentsFailed() // called when loading fails
	 * loadComment(comment) // the event parameter has been [re]loaded
	 * doneLoadingComment() // called when all calendars have been loaded
	 */
	var listeners = new Array();

	/**
	 * returns the active language
	 */
	this.getActiveLanguage = function(){
		return active_lang;
	}

	/**
	 * sets the active language
	 */
	this.setActiveLanguage = function(lang){
		if(jive.model.isLanguage(lang)){
			active_lang = lang;
			that.notifyLanguageChanged(active_lang);
		}else{
			return false;
		}
	}

	/**
	 * get languages that are loaded in the cache
	 */
	this.getLanguageList = function(){
		return cache.toArray();
	}

	/**
	 * get the available languages
	 */
	this.getSilentLanguages = function(){
		return language_list;
	}

	/**
	 * load buddies from DB and save in cache
	 */
	this.loadLanguage = function(lang){
		that.notifyLoadBegin();
		var a = control.newAjax(that.loadOk,that.loadFail);
		a.POST(HOSTURL + AJAXPATH + "?load_language","lang_id=" + lang);
	}

	/**
	 * save the active language
	 * and load it as active if it's in the cache,
	 * otherwise parse it
	 */
	this.saveLanguage = function(lang_id){
		that.notifyLoadBegin();
		// default load function will parse the language
		// and set it as active
		var okfun = function(lang_id){ return function(list){
			that.loadOk(list);
			var lang = cache.get(lang_id);
			if($obj(lang) && lang != null){
				that.setActiveLanguage(lang);
			}
		}}(lang_id);
		// if it's already parsed though, then just load it
		// from the cache
		var lang = cache.get(lang_id);
		if($obj(lang) && lang != null){
			okfun = function (lang_id){ return function(list){
				that.setActiveLanguage(cache.get(lang_id));
			}}(lang_id);
		}
		var a = control.newAjax(okfun, that.loadFail);
		a.POST(HOSTURL + AJAXPATH + "?save_language","lang_id=" + lang_id);
	}

	function parse(list){
		// reply is the message from the server
		// it should contain info about the calendars
		var tlang;

		if(list.childNodes.length > 0){
			if(list.childNodes[0].tagName == "language"){
				// it's a new language
				if(list.childNodes[0].childNodes.length > 0){
					lang = list.childNodes[0];
					var name = "";
					var id = 0;
					var hash = new jive.ext.y.HashTable();
					for(var j=0;j<lang.childNodes.length;j++){
						if(lang.childNodes[j].tagName == "name"){
							name = lang.childNodes[j].childNodes[0].nodeValue;
						}else
						if(lang.childNodes[j].tagName == "lang_id"){
							id = lang.childNodes[j].childNodes[0].nodeValue;
						}else
						if(lang.childNodes[j].tagName == "lang_table"){
							var table = lang.childNodes[j];
							for(var k=0;k<table.childNodes.length;k++){
								hash.put(table.childNodes[k].tagName, table.childNodes[k].childNodes[0].nodeValue);
							}
						}
					}
					lang = new jive.model.Language(id, name, hash);
					cache.put(lang.getId(), lang);
				}else{
					// fail, we loaded a blank language
					return false;
				}
			}else{
				return false;
			}
		}else{
			return false;
		}
		return lang;
	}


	/**
	 * loading buddies is successful
	 */
	this.loadOk = function(list){
		if(!parse(list)){
			that.notifyLoadFail();
		}else{
			that.notifyLoadFinish();
		}
	}

	/**
	 * loading buddies failed
	 */
	this.loadFail = function(){
		// notify listeners that the loading failed
		that.notifyLoadFail();
	}


	/******************************************
	 * listener functions
	 ******************************************/
	this.addListener = function(list){
		listeners.push(list);
	}

	this.removeListener = function(list){
		for(var i=0;i<listeners.length;i++){
			if(listeners[i] == list){
				listeners.splice(i, 1);
			}
		}
	}

	this.notifyLoadBegin = function(){
		for(var i=0;i<listeners.length;i++){
			listeners[i].beginLoadingLanguages();
		}
	}

	this.notifyLoad = function(lang){
		for(var i=0;i<listeners.length;i++){
			listeners[i].loadLanguage(lang);
		}
	}

	this.notifyLoadFinish = function(){
		for(var i=0;i<listeners.length;i++){
			listeners[i].doneLoadingLanguages();
		}
	}

	this.notifyLoadFail = function(){
		for(var i=0;i<listeners.length;i++){
			listeners[i].loadingLanguagesFailed();
		}
	}

	this.notifyLanguageChanged = function(lang){
		for(var i=0;i<listeners.length;i++){
			listeners[i].languageChanged(lang);
		}
	}



	try{
		/**
		 * we're checking to see if a language variable is
		 * already defined for us
		 * this way we don't have to ajax in the language
		 */
		if($def(default_lang)){
			var lang = parse(default_lang);
			if($obj(lang) && lang != null){
				that.setActiveLanguage(lang);
			}else{
				alert("error parsing");
			}
		}else{
			alert("no default langauge");
		}
	}catch(e){
		alert("language: " + e);
	}

    
//	try{
//		/**
//		 * get the list of default languages
//		 * this variable is defined at run time,
//		 * so we don't have to load in the list of languages
//		 * by ajax
//		 */
//		if($def(lang_list) && $def(lang_list[1]) && $def(lang_list.length)){
//			language_list = lang_list;
//		}else{
//			alert("empty language list");
//		}
//	}catch(e){
//		alert("language: " + e);
//	}

}


