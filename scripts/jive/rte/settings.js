jive.rte.settings = function(id){

    if(typeof(id) == "object"){
        // they passed in a settings object already,
        // so just give it back to them
        return id;
    }

    //
    // else, they passed in a string/int
    // and we can return the settings for that key

    function computeStyle(str){
        return computeRTEPluginStyle(str);
    }


    if(id=="mini-w-quote"){
        var _jive_image_picker_url = false;
        var _jive_video_picker__url = false;
        var ret = jive.rte.settings(0);
        ret.theme_advanced_buttons1 = "bold,italic,underline,strikethrough,spacerbutton,bullist,numlist,spacerbutton,jiveimage,jivevideo,spacerbutton,jivelink,jiveemoticons,jivequote,spellchecker,html";
        delete ret.theme_advanced_buttons2;
        delete ret.theme_advanced_buttons3;
        ret.default_height = 29;
        return ret;
    }else if(id=="mini"){
        var _jive_image_picker_url = false;
        var _jive_video_picker__url = _jive_video_picker__url;
        var ret = jive.rte.settings(0);
        ret.theme_advanced_buttons1 = "bold,italic,underline,strikethrough,spacerbutton,bullist,numlist,spacerbutton,jiveimage,jivevideo,spacerbutton,jivelink,jiveemoticons,spellchecker,html";
        delete ret.theme_advanced_buttons2;
        delete ret.theme_advanced_buttons3;
        ret.default_height = 29;
        return ret;
    }else if(id=="terms-and-conditions"){
        var _jive_image_picker_url = false;
        var _jive_video_picker__url = false;
        var ret = jive.rte.settings(0);
        ret.theme_advanced_buttons1 = "bold,italic,underline,strikethrough,bullist,numlist,html";
        delete ret.theme_advanced_buttons2;
        delete ret.theme_advanced_buttons3;
        ret.default_height = 29;
        // remove jivementions and jiveapps
        ret.plugins = ret.plugins.replace(',jivemention', '');
        ret.plugins = ret.plugins.replace(',jiveapps', '');
        return ret;
    }else if(id=="stream-narrow"){
        var _jive_image_picker_url = false;
        var _jive_video_picker__url = false;
        var ret = jive.rte.settings(0);
        ret.theme_advanced_buttons1 = "bold,italic,underline,strikethrough,bullist,numlist,jiveimage,jivevideo,jivelink,jiveemoticons,jivequote,spellchecker";
        delete ret.theme_advanced_buttons2;
        delete ret.theme_advanced_buttons3;
        ret.default_height = 29;
        return ret;
    }else if(id=="widget"){
        var _jive_image_picker_url = false;
        var ret = jive.rte.settings(0);
        ret.rte_image_modal_url =  CS_BASE_URL + "/rte-image-modal.jspa?fromWidget=true";
        ret.theme_advanced_statusbar_location = "none";
        return ret;
    }else if(id=="wiki"){
        var ret = jive.rte.settings(0);
        return ret;
    }else if(id=="blog"){
        var ret = jive.rte.settings(0);
        return ret;
    }else if(id=="thread"){
        var ret = jive.rte.settings(0);
        return ret;
    }else if(id=="poll" || id=="task"){
        var ret = jive.rte.settings("mini");
        ret.rte_image_webonly = true;
        ret.rte_image_modal_url =  CS_BASE_URL + "/rte-image-modal.jspa?webOnly=true";
        return ret;
    }else if(id==0){
        return {
            rte_image_modal_url: CS_BASE_URL + "/rte-image-modal.jspa",
            gecko_spellcheck : true,
            theme_advanced_fonts : "Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Calibri=calibri, verdana, arial, sans-serif;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats",
            ie7_css : "a{\nborder: 1px solid transparent;\n}\nspan.jive_macro.active_link, a.jive_macro.active_link, a.active_link{\nborder: 1px solid blue;\n}\nspan.jive_macro, a.jive_macro{\nborder: 1px solid transparent;\n}",
            keep_values : true,
            convert_urls : true,
            relative_urls : false, //convert URLs to absolute
            popup_css : false,
            default_height : 58,
            bool_attrs : /(checked|disabled|readonly|selected|nowrap)/,
            valid_child_elements : 0,
            theme_advanced_buttons1 : "fontselect, fontsizeselect, removeformat, magicspacer, spacerbutton,bullist, numlist, outdent, indent, spacerbutton,jivevideo,spacerbutton,jivelink,jivetablebutton,extra,spellchecker,html",
            theme_advanced_buttons2 : "bold,italic,underline,strikethrough,forecolor,jivestyle, magicspacer, spacerbutton, justifyleft,justifycenter,justifyright,justifyfull, spacerbutton,jiveimage,spacerbutton,jiveemoticons, jivemacros ",
            fix_list_elements : false,
            save_callback : "RawHTMLSaveFunction",
            convert_fonts_to_spans : true,
            font_size_style_values : "8pt,10pt,12pt,14pt,18pt,24pt,36pt",
            max_header_count : 6,
            strict_loading_mode : true,
            body_class : "tiny_mce_content jive-widget-formattedtext",
            theme : "advanced",
            // jivemacros must be at the end, b/c it's context menu must override all other plugins; jiveutil at the front makes findMacro available to others.
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
            tab_focus_toolbar: true,
            content_css : computeStyle(CS_RESOURCE_BASE_URL + "/styles/tiny_mce3/themes/advanced/skins/default/content.css,"
                + CS_RESOURCE_BASE_URL +  "/styles/jive-icons.css"),
            theme_advanced_resize_horizontal : false,
            theme_advanced_resizing : true,
            apply_source_formatting : true,
            spellchecker_languages : SPELL_LANGS,
            spellchecker_rpc_url : CS_BASE_URL + "/spellcheck.jspa",
            jive_image_picker_url: _jive_image_picker_url,
            jive_video_picker_url: _jive_video_picker__url,
            language_load: false, //we handle string resources via FTL
            language: _jive_locale.replace(/(\w\w)(?:_\w\w)?/, "$1"),
            add_form_submit_trigger : false,
            valid_elements : ""
                    +"a[accesskey|charset|class|coords|dir<ltr?rtl|href|hreflang|lang|name"
                      +"|onblur|onclick|ondblclick|onfocus|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|rel|rev"
                      +"|shape<circle?default?poly?rect|style|tabindex|title|target|type|jivemacro|_.*],"
                    +"abbr[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"acronym[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"address[class|align|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title],"
                    +"applet[align<bottom?left?middle?right?top|alt|archive|class|code|codebase"
                      +"|height|hspace|name|object|style|title|vspace|width],"
                    +"area[accesskey|alt|class|coords|dir<ltr?rtl|href|lang|nohref<nohref"
                      +"|onblur|onclick|ondblclick|onfocus|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup"
                      +"|shape<circle?default?poly?rect|style|tabindex|title|target],"
                    +"base[href|target],"
                    +"basefont[color|face|size],"
                    +"bdo[class|dir<ltr?rtl|lang|style|title],"
                    +"big[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"blockquote[cite|class|dir<ltr?rtl|lang|onclick|ondblclick"
                      +"|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout"
                      +"|onmouseover|onmouseup|style|title],"
                    +"body[alink|background|bgcolor|class|dir<ltr?rtl|lang|link|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onload|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|onunload|style|title|text|vlink],"
                    +"br[class|clear<all?left?none?right|style|title],"
                    +"button[accesskey|class|dir<ltr?rtl|disabled<disabled|lang|name|onblur"
                      +"|onclick|ondblclick|onfocus|onkeydown|onkeypress|onkeyup|onmousedown"
                      +"|onmousemove|onmouseout|onmouseover|onmouseup|style|tabindex|title|type"
                      +"|value],"
                    +"caption[align<bottom?left?right?top|class|dir<ltr?rtl|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"center[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"cite[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"code[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"col[align<center?char?justify?left?right|char|charoff|class|dir<ltr?rtl|id"
                      +"|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown"
                      +"|onmousemove|onmouseout|onmouseover|onmouseup|span|style|title"
                      +"|valign<baseline?bottom?middle?top|width],"
                    +"colgroup[align<center?char?justify?left?right|char|charoff|class|dir<ltr?rtl"
                      +"|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown"
                      +"|onmousemove|onmouseout|onmouseover|onmouseup|span|style|title"
                      +"|valign<baseline?bottom?middle?top|width],"
                    +"dd[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style|title],"
                    +"del[cite|class|datetime|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title],"
                    +"dfn[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"dir[class|compact<compact|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title],"
                    +"div[align<center?justify?left?right|class|dir<ltr?rtl|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"dl[class|compact<compact|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title],"
                    +"dt[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style|title],"
                    +"em/i[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"embed[width|height|src|pluginspage|name|swliveconnect|play<true?false|loop<true?false"
                      + "|menu<true?false|quality<low?autolow?autohigh?high?medium?high?best"
                      + "|scale<default?exact?noorder|salign<l?t?r?b?tl?tr?bl?br|wmode<window?opaque?transparent"
                      + "|bgcolor|base|flashvars|type|allowfullscreen],"
                    +"fieldset[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"font[class|color|dir<ltr?rtl|face|lang|size|style|title],"
                    +"form[accept|accept-charset|action|class|dir<ltr?rtl|enctype|lang"
                      +"|method<get?post|name|onclick|ondblclick|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|onreset|onsubmit"
                      +"|style|title|target],"
                    +"frame[class|frameborder|longdesc|marginheight|marginwidth|name"
                      +"|noresize<noresize|scrolling<auto?no?yes|src|style|title],"
                    +"frameset[class|cols|onload|onunload|rows|style|title],"
                    +"h1[align<center?justify?left?right|class|dir<ltr?rtl|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"h2[align<center?justify?left?right|class|dir<ltr?rtl|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"h3[align<center?justify?left?right|class|dir<ltr?rtl|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"h4[align<center?justify?left?right|class|dir<ltr?rtl|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"h5[align<center?justify?left?right|class|dir<ltr?rtl|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"h6[align<center?justify?left?right|class|dir<ltr?rtl|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"head[dir<ltr?rtl|lang|profile],"
                    +"hr[align<center?left?right|class|dir<ltr?rtl|lang|noshade<noshade|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|size|style|title|width],"
                    +"html[dir<ltr?rtl|lang|version],"
                    +"iframe[align<bottom?left?middle?right?top|class|frameborder|height|id"
                      +"|longdesc|marginheight|marginwidth|name|scrolling<auto?no?yes|src|style"
                      +"|title|width],"
                    +"img[align<bottom?left?middle?right?top|alt|border|class|dir<ltr?rtl|height"
                      +"|hspace|ismap<ismap|lang|longdesc|name|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|src|style|title|usemap|vspace|width|jivemacro|_.*|param_.*],"
                    +"input[accept|accesskey|align<bottom?left?middle?right?top|alt"
                      +"|checked<checked|class|dir<ltr?rtl|disabled<disabled|ismap<ismap|lang"
                      +"|maxlength|name|onblur|onclick|ondblclick|onfocus|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|onselect"
                      +"|readonly<readonly|size|src|style|tabindex|title"
                      +"|type<button?checkbox?file?hidden?image?password?radio?reset?submit?text"
                      +"|usemap|value],"
                    +"ins[cite|class|datetime|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title],"
                    +"isindex[class|dir<ltr?rtl|lang|prompt|style|title],"
                    +"kbd[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"label[accesskey|class|dir<ltr?rtl|for|lang|onblur|onclick|ondblclick"
                      +"|onfocus|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout"
                      +"|onmouseover|onmouseup|style|title],"
                    +"legend[align<bottom?left?right?top|accesskey|class|dir<ltr?rtl|lang"
                      +"|onclick|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"li[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style|title|type],"
                    +"link[charset|class|dir<ltr?rtl|href|hreflang|lang|media|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|rel|rev|style|title|target|type],"
                    +"map[class|dir<ltr?rtl|lang|name|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"menu[class|compact<compact|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title],"
                    +"meta[content|dir<ltr?rtl|http-equiv|lang|name|scheme],"
                    +"noframes[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"noscript[class|dir<ltr?rtl|lang|style|title],"
                    +"object[align<bottom?left?middle?right?top|archive|border|class|classid"
                      +"|codebase|codetype|data|declare|dir<ltr?rtl|height|hspace|lang|name"
                      +"|onclick|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|standby|style|tabindex|title|type|usemap"
                      +"|vspace|width],"
                    +"ol[class|compact<compact|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|start|style|title|type],"
                    +"optgroup[class|dir<ltr?rtl|disabled<disabled|label|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"option[class|dir<ltr?rtl|disabled<disabled|label|lang|onclick|ondblclick"
                      +"|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout"
                      +"|onmouseover|onmouseup|selected<selected|style|title|value],"
                    +"p[align<center?justify?left?right|class|dir<ltr?rtl|lang|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|style|title],"
                    +"param[id|name|type|value|valuetype<DATA?OBJECT?REF],"
                    +"pre/listing/plaintext/xmp[align|class|dir<ltr?rtl|lang|onclick|ondblclick"
                      +"|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout"
                      +"|onmouseover|onmouseup|style|title|width|jivemacro|_.*],"
                    +"q[cite|class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"s[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style|title],"
                    +"samp[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"script[charset|defer|language|src|type],"
                    +"select[class|dir<ltr?rtl|disabled<disabled|lang|multiple<multiple|name"
                      +"|onblur|onchange|onclick|ondblclick|onfocus|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|size|style"
                      +"|tabindex|title],"
                    +"small[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"span[align<center?justify?left?right|class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title|jivemacro|_.*],"
                    +"strike[class|class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title],"
                    +"strong/b[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"style[dir<ltr?rtl|lang|media|title|type],"
                    +"sub[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"sup[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title],"
                    +"table[align<center?left?right|bgcolor|border|cellpadding|cellspacing|class"
                      +"|dir<ltr?rtl|frame|height|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|rules"
                      +"|style|summary|title|width|jive.*],"
                    +"tbody[align<center?char?justify?left?right|char|class|charoff|dir<ltr?rtl|id"
                      +"|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown"
                      +"|onmousemove|onmouseout|onmouseover|onmouseup|style|title"
                      +"|valign<baseline?bottom?middle?top],"
                    +"td[abbr|align<center?char?justify?left?right|axis|bgcolor|char|charoff|class"
                      +"|colspan|dir<ltr?rtl|headers|height|lang|nowrap<nowrap|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|rowspan|scope<col?colgroup?row?rowgroup"
                      +"|style|title|valign<baseline?bottom?middle?top|width],"
                    +"textarea[accesskey|class|cols|dir<ltr?rtl|disabled<disabled|lang|name"
                      +"|onblur|onclick|ondblclick|onfocus|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|onselect"
                      +"|readonly<readonly|rows|style|tabindex|title],"
                    +"tfoot[align<center?char?justify?left?right|char|charoff|class|dir<ltr?rtl|id"
                      +"|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown"
                      +"|onmousemove|onmouseout|onmouseover|onmouseup|style|title"
                      +"|valign<baseline?bottom?middle?top],"
                    +"th[abbr|align<center?char?justify?left?right|axis|bgcolor|char|charoff|class"
                      +"|colspan|dir<ltr?rtl|headers|height|lang|nowrap<nowrap|onclick"
                      +"|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove"
                      +"|onmouseout|onmouseover|onmouseup|rowspan|scope<col?colgroup?row?rowgroup"
                      +"|style|title|valign<baseline?bottom?middle?top|width],"
                    +"thead[align<center?char?justify?left?right|char|charoff|class|dir<ltr?rtl|id"
                      +"|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup|onmousedown"
                      +"|onmousemove|onmouseout|onmouseover|onmouseup|style|title"
                      +"|valign<baseline?bottom?middle?top],"
                    +"title[dir<ltr?rtl|lang],"
                    +"tr[abbr|align<center?char?justify?left?right|bgcolor|char|charoff|class"
                      +"|rowspan|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title|valign<baseline?bottom?middle?top],"
                    +"tt[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style|title],"
                    +"u[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress|onkeyup"
                      +"|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style|title],"
                    +"ul[class|compact<compact|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown"
                      +"|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover"
                      +"|onmouseup|style|title|type],"
                    +"var[class|dir<ltr?rtl|lang|onclick|ondblclick|onkeydown|onkeypress"
                      +"|onkeyup|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|style"
                      +"|title]",
            valid_children: "+pre[p|pre|ol|ul|blockquote|table|#text],+blockquote[p|pre|ol|ul|blockquote|table|#text]"

        };
    } else {
        //custom settings for example when a custom RTE is needed for a plugin. all necessary values must be initialized
        //and passed as the argument.
        //Example rte instantiation: 
        //    var pluginRTESettings = jive.rte.settings(0);
        //    pluginRTESettings.content_css = computeRTEPluginStyle("custom_rte_style.css");
        //    new jive.rte.RTE(jiveControl, jive.rte.multiRTE[i], pluginRTESettings);
        return id;
    }
};

function computeRTEPluginStyle(str) {
    for (var i = 0; i < jive.rte.defaultStyles.length; i++) {
        str += "," + jive.rte.defaultStyles[i];
    }
    return str;
}
