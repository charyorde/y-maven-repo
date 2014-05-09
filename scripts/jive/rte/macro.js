/**
 * defines a simple Macro interface to mimic the RenderMacro class on the server
 */
jive.rte.Macro = function(shortname, url, macrotag, settingsHuh, displayHuh, paramSets, params, enabled, button){
    var that = this;

    var custommacro = null;

    if(typeof(jive.rte.plugin[shortname]) != "undefined"){
        custommacro = new jive.rte.plugin[shortname](shortname, url, macrotag, settingsHuh, displayHuh, paramSets, params, enabled, button);
    }

    /**
     * gets the unique name for this macro
     * i.e. "code" or "youtube"
     */
    this.getName = function(){
        if(custommacro != null) return custommacro.getName();
        return shortname;
    };

    /**
     * gets the optional url for this macro
     */
    this.getUrl = function(){
        if(custommacro != null) return custommacro.getUrl();
        return url;
    };

    /**
     * returns true if it should be a button or not
     */
    this.isButton = function(){
        if(custommacro != null) return custommacro.isButton();
        return button;
    };

    this.isEnabled = function(){
        if(custommacro != null) return custommacro.isEnabled();
        return enabled;
    };

    this.isShowSettings = function(){
        if(custommacro != null) return custommacro.isShowSettings();
        return settingsHuh;
    };

    /**
     * Display in RTE Insert List?
     */
    this.isShowInMacroList = function(){
        if(custommacro != null) return custommacro.isShowInMacroList();
        return displayHuh;
    };
    
    /**
     * returns true if this macro accepts
     * raw text input, like a code macro,
     * or false if it doesn't, like
     * a youtube macro
     */
    this.getMacroType = function(){
        if(custommacro != null) return custommacro.getMacroType();
        return macrotag;
    };

    /**
     * returns all param sets for this macro
     */
    this.getParameterSets = function(){
        if(custommacro != null) return custommacro.getParameterSets();
        return paramSets;
    };

    /**
     * returns an array of allowed parameters
     */
    this.getAllowedParameters = function(){
        if(custommacro != null) return custommacro.getAllowedParameters();
        return params;
    };

    this.refreshPosition= function(rte, ele, $ele, offset){
        if(custommacro != null) return custommacro.refreshPosition(rte, ele, $ele, offset);
    };
    this.usesCustomBackground = function(){
        if(custommacro != null) return custommacro.usesCustomBackground();
        return false;
    };

    /**
     * @param rte the rte object
     * @param ele the element inside the RTE that is the macro element
     * @param selNode the currently selected node in the RTE
     */
    this.caresAboutChangeTo = function(rte, ele, selNode){
        if(custommacro != null && custommacro.caresAboutChangeTo) return custommacro.caresAboutChangeTo(rte, ele, selNode);
        return false;
    };

    /**
     * update the element's display w/ the latest
     * parameter value.
     */
    this.refresh = function(rte, ele){
        if(custommacro != null) return custommacro.refresh(rte, ele);
        if(ele.getAttribute("jivemacro") == this.getName()){
            if(this.getMacroType().toLowerCase() == "inline"){
                var str = ele.getAttribute("_title");
                if($def(str) && str != null && str.length > 0){
                    // `_title` attribute will be garbled if it contains
                    // escaped HTML; so do not update display if that is the
                    // case.
                    if (!str.match(/<[^<]+=/)) {
                        ele.innerHTML = str;
                    }
                    ele.attributes.removeNamedItem("_title");
                }else if(!tinyMCE.activeEditor.dom.getAttrib(ele, "_modifiedtitle")){
                    var type = ele.getAttribute("jivemacro");
                    var id = ele.getAttribute("___default_attr");
                    var title = tinyMCE.activeEditor.plugins.jivemacros.getTitleFor(type, id);
                    if(title && ele.innerHTML != title[0]){
                        ele.innerHTML = "";
                        ele.appendChild(rte.getDoc().createTextNode(title[0]));
                    }
                    if(ele.innerHTML == ""){
                        ele.innerHTML = "unknown";
                    }
                }
            }else if(this.getMacroType().toLowerCase() == "image"){
                if (ele.src == "") {
                    var src = window.CS_RESOURCE_BASE_URL + "/images/tiny_mce3/plugins/jiveemoticons/images/spacer.gif";
                    ele.setAttribute("src", src);
                    ele.setAttribute("data-mce-src", src);
                }
            }
        }
    }
};
