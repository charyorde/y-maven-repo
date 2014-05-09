/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

window.RawHTMLSaveFunction = function(element_id, html, body){
    var text = $j('#wysiwygtext');
    if (text.is(':not(:visible)')) {
        return html;
    }else{
        return text.val();
    }
};


/**
 * return true if the selected content has value somewhere in the attr
 * @param content the jQuery object content to look inside of
 * @param selector the selector to narrow down $content
 * @param attr the attribute name
 * @param value the value that must be contained in the attribute. can be a string, or an array of strings
 */
function has(content, selector, attr, value){
    try{
        if(typeof(value) == "string"){
            return $j(content).find(selector).attr(attr).toLowerCase().indexOf(value.toLowerCase()) >= 0
        }
        var ret = false;
        for(var i=0;i<value.length;i++){
            ret = ret || $j(content).find(selector).attr(attr).toLowerCase().indexOf(value[i].toLowerCase()) >= 0
        }
        return ret;
    }catch(e){
        return false;
    }
}

function push(result, actual, expected, message) {
	message = message || (result ? "okay" : "failed");
	QUnit.ok( result, result ? message + ": " + QUnit.jsDump.parse(expected) : message + ", expected: " + QUnit.jsDump.parse(expected) + " result: " + QUnit.jsDump.parse(actual) );
    if(!result){
        console.log("actual  : " + actual);
        console.log("expected: " + expected);
    }
    return result;
}

/**
 * return true if the selected content has value somewhere in the css attr
 * @param content the jQuery object content to look inside of
 * @param selector the selector to narrow down $content
 * @param attr the attribute name
 * @param value the value that must be contained in the attribute. can be a string, or an array of strings
 */
function hasStyle(content, selector, attr, value, message){
    try{

        var expected = value;
        var ret = false;

        if(typeof(attr) == "string"){
            attr = [attr];
        }
        if(typeof(value) != "string"){
            expected = value.join (" or ");
        }
        if(typeof(value) == "string"){
            value = [value];
        }

        var cssText = $j(content).find(selector).get(0).style.cssText.toLowerCase();
        var cssSplit = cssText.split(";");
        for(var i=0;i<cssSplit.length;i++){
            var cssVarVal = $j.trim(cssSplit[i]).split(":");
            if(cssVarVal.length > 1){
                for(var j=0;j<attr.length;j++){
                    if(cssVarVal[0].indexOf(attr[j]) === 0){
                        for(var k=0;k<value.length;k++){
                            value[k] = value[k].toLowerCase();
                            if(cssVarVal[1].indexOf(value[k]) >= 0){
                                // the css value exists
                                return push(true, cssSplit, attr[j] + ":" + expected, message);
                            }
                        }
                    }
                }
            }
        }

        return push(false, cssText, attr.join(" or ") + ":" + expected, message);
    }catch(e){
        return false;
    }
}

var editor = new jive.ext.y.HashTable();
var tinyRTE;


var CS_RESOURCE_BASE_URL = "/6.0.0.Custom";
var CS_BASE_URL = "";
var _jive_base_url = "";
var SPELL_LANGS = "en";
var _jive_image_picker_url = null;
var _jive_video_picker__url = null;
