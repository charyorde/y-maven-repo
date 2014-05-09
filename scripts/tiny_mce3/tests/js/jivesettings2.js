
jive.rte.macros.push(new jive.rte.Macro("color","","TEXT", true, false, [], [{name: "0",value: ""},{name: "__default_attr",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("size","","TEXT", true, false, [], [{name: "0",value: ""},{name: "__default_attr",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("font","","TEXT", true, false, [], [{name: "0",value: ""},{name: "__default_attr",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("toc","","IMAGE", true, true, [], [], true,false));
jive.rte.macros.push(new jive.rte.Macro("code","","TEXT", false, true, [{ name: "sql", deleteAll: true, params: [{ name: "__default_attr", value :"sql"} ]},{ name: "html", deleteAll: true, params: [{ name: "__default_attr", value :"html"} ]},{ name: "xml", deleteAll: true, params: [{ name: "__default_attr", value :"xml"} ]},{ name: "java", deleteAll: true, params: [{ name: "__default_attr", value :"java"} ]},{ name: "plain", deleteAll: true, params: [{ name: "__default_attr", value :"plain"} ]}], [{name: "__default_attr",value: ["sql","html","xml","java","plain"]}], true,false));
jive.rte.macros.push(new jive.rte.Macro("noformat","","TEXT", true, false, [], [], true,false));
jive.rte.macros.push(new jive.rte.Macro("thread","thread/","INLINE", true, false, [], [{name: "id",value: ""},{name: "0",value: ""},{name: "__default_attr",value: ""},{name: "title",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("message","message/","INLINE", true, false, [], [{name: "id",value: ""},{name: "__default_attr",value: ""},{name: "title",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("external-site","bookmarks/","INLINE", false, false, [], [{name: "id",value: ""},{name: "__default_attr",value: ""},{name: "title",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("document","docs/","INLINE", true, false, [], [{name: "id",value: ""},{name: "__default_attr",value: ""},{name: "title",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("tag","tags/","INLINE", true, false, [], [{name: "id",value: ""},{name: "tag",value: ""},{name: "title",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("microblog","status/","INLINE", true, false, [], [{name: "id",value: ""},{name: "__default_attr",value: ""},{name: "title",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("polls","polls/","INLINE", true, false, [], [{name: "id",value: ""},{name: "__default_attr",value: ""},{name: "title",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("blogpost","blogs/","INLINE", true, false, [], [{name: "id",value: ""},{name: "__default_attr",value: ""},{name: "title",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("blog","blogs/","INLINE", true, false, [], [{name: "id",value: ""},{name: "name",value: ""},{name: "__default_attr",value: ""},{name: "title",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("community","community/","INLINE", true, false, [], [{name: "id",value: ""},{name: "__default_attr",value: ""},{name: "title",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("space","community/","INLINE", true, false, [], [{name: "id",value: ""},{name: "__default_attr",value: ""},{name: "title",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("user","","INLINE", true, false, [], [{name: "id",value: ""},{name: "username",value: ""},{name: "__default_attr",value: ""},{name: "title",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("project","project/","INLINE", true, false, [], [{name: "id",value: ""},{name: "__default_attr",value: ""},{name: "title",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("task","view-task.jspa?task=","INLINE", true, false, [], [{name: "id",value: ""},{name: "0",value: ""},{name: "__default_attr",value: ""},{name: "title",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("group","groups/","INLINE", true, false, [], [{name: "id",value: ""},{name: "__default_attr",value: ""},{name: "title",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("quote","","TEXT", false, true, [], [{name: "title",value: ""},{name: "__default_attr",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("vimeo","","IMAGE", false, false, [], [{name: "__default_attr",value: ""},{name: "width",value: ""},{name: "height",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("veoh","","IMAGE", false, false, [], [{name: "__default_attr",value: ""},{name: "width",value: ""},{name: "height",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("dailymotion","","IMAGE", false, false, [], [{name: "__default_attr",value: ""},{name: "width",value: ""},{name: "height",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("google","","IMAGE", false, false, [], [{name: "__default_attr",value: ""},{name: "width",value: ""},{name: "height",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("youtube","","IMAGE", false, false, [], [{name: "__default_attr",value: ""},{name: "width",value: ""},{name: "height",value: ""}], true,false));
jive.rte.macros.push(new jive.rte.Macro("application","","INLINE", true, false, [], [{name: "id",value: ""},{name: "__default_attr",value: ""},{name: "__title",value: ""},{name: "__view",value: ""},{name: "__params",value: ""}], true,false));

tinyMCE.addI18n('en.jivestyle',{
    title : 'Style'
});


function FakeSoy(){
	this.call = function(){
		return "<div>soy</div>";
	}
}


// jive.namespace("StatusInput.soy.ddLoading", new FakeSoy());
jive.namespace("StatusInput.soy");
jive.namespace("statusinput.dropdown");

jive.statusinput.dropdown.ddLoading = function(opt_data, opt_sb) {
	var output = opt_sb || new soy.StringBuilder();
	output.append('<div class="j-autocomplete j-pop j-js-autocomplete"><span class="belowArrow pointer"></span><div class="loading"></div></div>');
	if (!opt_sb) return output.toString();
};
function computeStyle(str){
	return str;
}


function checkReady(){
    var rte = editor.get("wysiwygtext");
    if(rte.isReady()){
        QUnit.start();
    }else{
        console.log("waiting on RTE to init");
        setTimeout(checkReady, 500);
    }
}

window.jive_settings = {
		mode : "exact",
		elements : "wysiwygtext",
		add_unload_trigger : false,
		init_instance_callback : function(ed) {
			window.ed = ed;
            setTimeout(checkReady, 500);
		},
        theme_advanced_fonts : "Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Calibri=calibri, verdana, arial, sans-serif;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats",
        ie7_css : "a{\nborder: 1px solid transparent;\n}\nspan.jive_macro.active_link, a.jive_macro.active_link, a.active_link{\nborder: 1px solid blue;\n}\nspan.jive_macro, a.jive_macro{\nborder: 1px solid transparent;\n}",
        keep_values : true,
        convert_urls : true,
        inline_styles : false,
        default_height : 58,
        theme_advanced_buttons1 : "fontselect, fontsizeselect, removeformat, magicspacer, spacerbutton,bullist, numlist, outdent, indent, spacerbutton,jivevideo,spacerbutton,jivelink,jivetablebutton,extra,spellchecker,html",
        theme_advanced_buttons2 : "bold,italic,underline,strikethrough,forecolor,jivestyle, magicspacer, spacerbutton, justifyleft,justifycenter,justifyright,justifyfull, spacerbutton,jiveimage,spacerbutton,jiveemoticons, jivemacros ",
        theme_advanced_buttons3 : "tablecontrols",
        fix_list_elements : false,
        save_callback : "RawHTMLSaveFunction",
        convert_fonts_to_spans : true,
        font_size_style_values : "8pt,10pt,12pt,14pt,18pt,24pt,36pt",
        max_header_count : 4,
        strict_loading_mode : true,
        body_class : "tiny_mce_content jive-widget-formattedtext",
        theme : "advanced",
        // jivemacros must be at the end, b/c it's context menu must override all other plugins
        plugins : "jiveutil,jivescroll,jiveresize,jiveblackout,jivecontextmenu,jivebuttons,jiveemoticons,jivestyle,jivelink,jivekeyboard,jivequote,jivevideo,jiveimage,spellchecker,html,style,jivelists,table,jivetablecontrols,save,advimage,advlink,inlinepopups,jivemacros,paste,jivemention,jiveapps,jiveselection,jivetable,jivetablebutton,jivemouse,jiveattachment",
        paste_auto_cleanup_on_paste : true,
        paste_conheadvert_middot_lists : true,
        paste_retain_style_properties : "color,background,background-color,font-family,font-weight,text-decoration,text-indent,font-size,margin,margin-left,margin-top,margin-bottom,margin-right,border,border-top,border-bottom,border-left,border-right,border-width,border-style,border-color,padding,padding-left,padding-top,padding-right,padding-bottom,border-top-width,border-bottom-width,border-left-width,border-right-width,border-top-style,border-bottom-style,border-left-style,border-right-style,border-top-color,border-bottom-color,border-left-color,border-right-color",
        paste_strip_class_attributes : "mso",
        paste_remove_spans : false,
        paste_remove_styles : false,
        paste_block_drop : false,
        doctype : '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
        theme_advanced_toolbar_location : "top",
        theme_advanced_toolbar_align : "left",
        theme_advanced_statusbar_location : "bottom",
        content_css : computeStyle(CS_RESOURCE_BASE_URL + "/styles/tiny_mce3/themes/advanced/skins/default/content.css,"
            + CS_RESOURCE_BASE_URL +  "/styles/jive-icons.css"),
        ui_css : computeStyle(CS_RESOURCE_BASE_URL + "/" + "styles/jive.css"),
        theme_advanced_resize_horizontal : false,
        theme_advanced_resizing : true,
        apply_source_formatting : true,
        spellchecker_languages : SPELL_LANGS,
        spellchecker_rpc_url : CS_BASE_URL + "/spellcheck.jspa",
        jive_image_picker_url: _jive_image_picker_url,
        jive_video_picker_url: _jive_video_picker__url,
        relative_urls : false, // this prevents TinyMCE from converting absolute URLs to relative one's in the editor
        valid_elements : ""
                    +"a[accesskey|charset|class|coords|dir<ltr?rtl|href|hreflang|id|lang|name"
                      +"|onblur|onclick|ondblclick|onfocus|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|rel|rev"
                      +"|shape<circle?default?poly?rect|style|tabindex|title|target|type|jivemacro|_.*],"
                    +"abbr[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"acronym[class|dir<ltr?rtl|id|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"address[class|align|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title],"
                    +"applet[align<bottom?left?middle?right?top|alt|archive|class|code|codebase"
                      +"|height|hspace|id|name|object|style|title|vspace|width],"
                    +"area[accesskey|alt|class|coords|dir<ltr?rtl|href|id|lang|nohref<nohref"
                      +"|onblur|onclick|ondblclick|onfocus|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup"
                      +"|shape<circle?default?poly?rect|style|tabindex|title|target],"
                    +"base[href|target],"
                    +"basefont[color|face|id|size],"
                    +"bdo[class|dir<ltr?rtl|id|lang|style|title],"
                    +"big[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"blockquote[cite|class|dir<ltr?rtl|id|lang|onclick|ondblclick"
                      +"|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout"
                      +"|onmouseover|onmouseup|style|title],"
                    +"body[alink|background|bgcolor|class|dir<ltr?rtl|id|lang|link|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onload|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|onunload|style|title|text|vlink],"
                    +"br[class|clear<all?left?none?right|id|style|title],"
                    +"button[accesskey|class|dir<ltr?rtl|disabled<disabled|id|lang|name|onblur"
                      +"|onclick|ondblclick|onfocus|onkeydown|onkeypress|onkeyup|onmousedown"
                      +"|onmousemove|onmouseout|onmouseover|onmouseup|style|tabindex|title|type"
                      +"|value],"
                    +"caption[align<bottom?left?right?top|class|dir<ltr?rtl|id|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"center[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"cite[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"code[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"col[align<center?char?justify?left?right|char|charoff|class|dir<ltr?rtl|id"
                      +"|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown"
                      +"|onmousemove|onmouseout|onmouseover|onmouseup|span|style|title"
                      +"|valign<baseline?bottom?middle?top|width],"
                    +"colgroup[align<center?char?justify?left?right|char|charoff|class|dir<ltr?rtl"
                      +"|id|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown"
                      +"|onmousemove|onmouseout|onmouseover|onmouseup|span|style|title"
                      +"|valign<baseline?bottom?middle?top|width],"
                    +"dd[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style|title],"
                    +"del[cite|class|datetime|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title],"
                    +"dfn[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"dir[class|compact<compact|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title],"
                    +"div[align<center?justify?left?right|class|dir<ltr?rtl|id|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"dl[class|compact<compact|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title],"
                    +"dt[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style|title],"
                    +"em/i[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"embed[width|height|src|pluginspage|name|swliveconnect|play<true?false|loop<true?false"
                      + "|menu<true?false|quality<low?autolow?autohigh?high?medium?high?best"
                      + "|scale<default?exact?noorder|salign<l?t?r?b?tl?tr?bl?br|wmode<window?opaque?transparent"
                      + "|bgcolor|base|flashvars|type|allowfullscreen],"
                    +"fieldset[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"font[class|color|dir<ltr?rtl|face|id|lang|size|style|title],"
                    +"form[accept|accept-charset|action|class|dir<ltr?rtl|enctype|id|lang"
                      +"|method<get?post|name|onclick|ondblclick|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|onreset|onsubmit"
                      +"|style|title|target],"
                    +"frame[class|frameborder|id|longdesc|marginheight|marginwidth|name"
                      +"|noresize<noresize|scrolling<auto?no?yes|src|style|title],"
                    +"frameset[class|cols|id|onload|onunload|rows|style|title],"
                    +"h1[align<center?justify?left?right|class|dir<ltr?rtl|id|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"h2[align<center?justify?left?right|class|dir<ltr?rtl|id|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"h3[align<center?justify?left?right|class|dir<ltr?rtl|id|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"h4[align<center?justify?left?right|class|dir<ltr?rtl|id|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"h5[align<center?justify?left?right|class|dir<ltr?rtl|id|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"h6[align<center?justify?left?right|class|dir<ltr?rtl|id|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"head[dir<ltr?rtl|lang|profile],"
                    +"hr[align<center?left?right|class|dir<ltr?rtl|id|lang|noshade<noshade|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|size|style|title|width],"
                    +"html[dir<ltr?rtl|lang|version],"
                    +"iframe[align<bottom?left?middle?right?top|class|frameborder|height|id"
                      +"|longdesc|marginheight|marginwidth|name|scrolling<auto?no?yes|src|style"
                      +"|title|width],"
                    +"img[align<bottom?left?middle?right?top|alt|border|class|dir<ltr?rtl|height"
                      +"|hspace|id|ismap<ismap|lang|longdesc|name|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|src|style|title|usemap|vspace|width|jivemacro|_.*|param_.*],"
                    +"input[accept|accesskey|align<bottom?left?middle?right?top|alt"
                      +"|checked<checked|class|dir<ltr?rtl|disabled<disabled|id|ismap<ismap|lang"
                      +"|maxlength|name|onblur|onclick|ondblclick|onfocus|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|onselect"
                      +"|readonly<readonly|size|src|style|tabindex|title"
                      +"|type<button?checkbox?file?hidden?image?password?radio?reset?submit?text"
                      +"|usemap|value],"
                    +"ins[cite|class|datetime|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title],"
                    +"isindex[class|dir<ltr?rtl|id|lang|prompt|style|title],"
                    +"kbd[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"label[accesskey|class|dir<ltr?rtl|for|id|lang|onblur|onclick|ondblclick"
                      +"|onfocus|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout"
                      +"|onmouseover|onmouseup|style|title],"
                    +"legend[align<bottom?left?right?top|accesskey|class|dir<ltr?rtl|id|lang"
                      +"|onclick|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"li[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style|title|type],"
                    +"link[charset|class|dir<ltr?rtl|href|hreflang|id|lang|media|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|rel|rev|style|title|target|type],"
                    +"map[class|dir<ltr?rtl|id|lang|name|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"menu[class|compact<compact|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title],"
                    +"meta[content|dir<ltr?rtl|http-equiv|lang|name|scheme],"
                    +"noframes[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"noscript[class|dir<ltr?rtl|id|lang|style|title],"
                    +"object[align<bottom?left?middle?right?top|archive|border|class|classid"
                      +"|codebase|codetype|data|declare|dir<ltr?rtl|height|hspace|id|lang|name"
                      +"|onclick|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|standby|style|tabindex|title|type|usemap"
                      +"|vspace|width],"
                    +"ol[class|compact<compact|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|start|style|title|type],"
                    +"optgroup[class|dir<ltr?rtl|disabled<disabled|id|label|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"option[class|dir<ltr?rtl|disabled<disabled|id|label|lang|onclick|ondblclick"
                      +"|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout"
                      +"|onmouseover|onmouseup|selected<selected|style|title|value],"
                    +"p[align<center?justify?left?right|class|dir<ltr?rtl|id|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"param[id|name|type|value|valuetype<DATA?OBJECT?REF],"
                    +"pre/listing/plaintext/xmp[align|class|dir<ltr?rtl|id|lang|onclick|ondblclick"
                      +"|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout"
                      +"|onmouseover|onmouseup|style|title|width|jivemacro|_.*],"
                    +"q[cite|class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"s[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style|title],"
                    +"samp[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"script[charset|defer|language|src|type],"
                    +"select[class|dir<ltr?rtl|disabled<disabled|id|lang|multiple<multiple|name"
                      +"|onblur|onchange|onclick|ondblclick|onfocus|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|size|style"
                      +"|tabindex|title],"
                    +"small[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"span[align<center?justify?left?right|class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title|jivemacro|_.*],"
                    +"strike[class|class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title],"
                    +"strong/b[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"style[dir<ltr?rtl|lang|media|title|type],"
                    +"sub[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"sup[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"table[align<center?left?right|bgcolor|border|cellpadding|cellspacing|class"
                      +"|dir<ltr?rtl|frame|height|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|rules"
                      +"|style|summary|title|width],"
                    +"tbody[align<center?char?justify?left?right|char|class|charoff|dir<ltr?rtl|id"
                      +"|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown"
                      +"|onmousemove|onmouseout|onmouseover|onmouseup|style|title"
                      +"|valign<baseline?bottom?middle?top],"
                    +"td[abbr|align<center?char?justify?left?right|axis|bgcolor|char|charoff|class"
                      +"|colspan|dir<ltr?rtl|headers|height|id|lang|nowrap<nowrap|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|rowspan|scope<col?colgroup?row?rowgroup"
                      +"|style|title|valign<baseline?bottom?middle?top|width],"
                    +"textarea[accesskey|class|cols|dir<ltr?rtl|disabled<disabled|id|lang|name"
                      +"|onblur|onclick|ondblclick|onfocus|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|onselect"
                      +"|readonly<readonly|rows|style|tabindex|title],"
                    +"tfoot[align<center?char?justify?left?right|char|charoff|class|dir<ltr?rtl|id"
                      +"|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown"
                      +"|onmousemove|onmouseout|onmouseover|onmouseup|style|title"
                      +"|valign<baseline?bottom?middle?top],"
                    +"th[abbr|align<center?char?justify?left?right|axis|bgcolor|char|charoff|class"
                      +"|colspan|dir<ltr?rtl|headers|height|id|lang|nowrap<nowrap|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|rowspan|scope<col?colgroup?row?rowgroup"
                      +"|style|title|valign<baseline?bottom?middle?top|width],"
                    +"thead[align<center?char?justify?left?right|char|charoff|class|dir<ltr?rtl|id"
                      +"|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown"
                      +"|onmousemove|onmouseout|onmouseover|onmouseup|style|title"
                      +"|valign<baseline?bottom?middle?top],"
                    +"title[dir<ltr?rtl|lang],"
                    +"tr[abbr|align<center?char?justify?left?right|bgcolor|char|charoff|class"
                      +"|rowspan|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title|valign<baseline?bottom?middle?top],"
                    +"tt[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style|title],"
                    +"u[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style|title],"
                    +"ul[class|compact<compact|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title|type],"
                    +"var[class|dir<ltr?rtl|id|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title]",
        valid_children: "+pre[p]"
    };
