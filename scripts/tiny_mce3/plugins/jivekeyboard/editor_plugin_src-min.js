(function(){function a(b){return(b.shiftKey?"Shift":"")+(b.ctrlKey||b.metaKey?"Ctrl":"")+(b.altKey?"Alt":"")}tinymce.create("tinymce.plugins.JiveKeyboardPlugin",{init:function(b){var d={};function c(h){var k=d[h.type];if(!k){return null}var i=h.keyCode;if(h.type=="keypress"){if(h.which!=null&&h.which!=0&&h.charCode!=0){i=h.which}}var j=k[i];if(!j){return null}var g=a(h);return j[g]}function e(i,h,k,j){if(k==null){k={}}if(!d[i]){d[i]={}}if(!d[i][h]){d[i][h]={}}var g=a(k);d[i][h][g]=j}function f(h,g){var i=c(g);if(i){return i(h,g)}}b.onKeyDown.add(f);b.onKeyPress.add(f);b.onKeyUp.add(f);e("keydown",27,{},function(h,g){$j("button:submit:visible, input:submit:visible",h.getContentAreaContainer().ownerDocument).get(0).focus();return tinymce.dom.Event.cancel(g)});e("keydown",27,{shiftKey:true},function(h,g){$j("input:text[name=subject]:visible",h.getContentAreaContainer().ownerDocument).get(0).focus();return tinymce.dom.Event.cancel(g)});this.addHandler=e},getInfo:function(){return{longname:"Jive Keyboard",author:"Jive Software",authorurl:"http://jivesoftware.com",infourl:"http://jivesoftware.com",version:tinyMCE.majorVersion+"."+tinyMCE.minorVersion}}});tinymce.PluginManager.add("jivekeyboard",tinymce.plugins.JiveKeyboardPlugin)})();