/**
 * since emoticons are encoded in the XHTML as macros,
 * but implemented onthe server as a filter, this class
 * will define the client side "macro" class for emotes,
 * since once is not generated on the fly from the
 * server
 *
 * alternatively, i could have refactored emoticons into
 * a macro from a filter on the server, but don't fix
 * what isn't broken :)
 */
jive.rte.EmoticonMacro = function(){

    var params = new Array();
    var paramSets = new Array();
    params.push({
        name: "__jive_emoticon_name",
        value: [
            "happy",
            "laugh",
            "silly",
            "wink",
            "plain",
            "angry",
            "blush",
            "confused",
            "cool",
            "cry",
            "devil",
            "grin",
            "love",
            "mischief",
            "sad",
            "shocked",
            "info",
            "plus",
            "minus",
            "alert",
            "check",
            "x"
        ]
    });

    for(var i=0;i<params[0].value.length;i++){
        paramSets.push({
            name : params[0].value[i],
            deleteAll: true,
            params: [ {
                name: params[0].name,
                value: params[0].value[i]
            }]
        });
    }
    var macro = new jive.rte.Macro("emoticon", "", "img", false, true, paramSets, params, true, false);

    this.getName = macro.getName;

    this.getUrl = macro.getUrl;

    this.isShowInMacroList = macro.isShowInMacroList;

    this.isShowSettings = macro.isShowSettings;

    this.getMacroType = macro.getMacroType;

    this.getParameterSets = macro.getParameterSets;

    this.getAllowedParameters = macro.getAllowedParameters;

    this.usesCustomBackground = function(){ return false; };

    this.refresh = function(rte, ele){
        macro.refresh(rte, ele);
        var grin = ele.getAttribute("_" + params[0].name);
        // also, update the icon
        var url = window.CS_RESOURCE_BASE_URL + "/images/emoticons/" + grin + ".png";
        $j(ele).addClass("jive_macro").addClass("jive_emote").removeClass("jive_emoticon")
                .attr("src", url).attr("data-mce-src", url);
    }

};
jive.rte.macros.push(new jive.rte.EmoticonMacro());
