/*jslint browser:true */
/*globals jive $j */
/*globals tinyMCE tinymce tinyMCEPopup URLLookup i18nStrings */
/*globals is_gecko setCaretTo */

jive.namespace('rte.ContentPicker');
jive.rte.ContentPicker.ContentPickerController = function() {
    var that = this;

    function setAttrib(elm, attrib, value) {
        if (typeof(value) == "undefined" || value === null) {
            value = "";
        }

        if (value !== "") {
            elm.setAttribute(attrib.toLowerCase(), value);

            if (attrib == "style") {
                attrib = "style.cssText";
            }

            if (attrib.substring(0, 2) == 'on') {
                value = 'return true;' + value;
            }

            if (attrib == "class") {
                attrib = "className";
            }

            elm[attrib] = value;
        }
        else
        {
            elm.removeAttribute(attrib);
        }
    }

    /**
     * @param id the id of the content
     * @param url the link to the content
     * @param subject the title of teh content
     * @param clazz the type of content
     */
    function addContentMacroReply(id, url, subject, clazz) {
        var ed = tinyMCE.activeEditor,
            i,
            elementArray;

        ed.plugins.jivemacros.cache(id, url, subject, clazz);

        function setAllAttribs(elm) {
            setAttrib(elm, '___default_attr', id);
            setAttrib(elm, 'href', "javascript:;");
            setAttrib(elm, 'data-mce-href', "javascript:;");
            setAttrib(elm, 'title', subject); // this is not the macro's title parameter, it's just for the tooltip
            setAttrib(elm, 'class', "jive_macro jive_macro_" + clazz);
            setAttrib(elm, 'jivemacro', clazz);

            // Refresh in old MSIE
            if (tinyMCE.isMSIE5) {
                elm.outerHTML = elm.outerHTML;
            }
        }

        if (ed.selection.isCollapsed()) {
            var link = ed.getDoc().createElement('A');
            link.id = "mceLinkInsert";
            link.appendChild(ed.getDoc().createTextNode("---"));
            setAttrib(link, 'href', "#mce_temp_url#");
            setAttrib(link, 'data-mce-href', "#mce_temp_url#");
            ed.selection.setNode(link);
            link = ed.getDoc().getElementById("mceLinkInsert");
            setAllAttribs(link);
            $j(link).removeAttr("id");
            ed.plugins.jivemacros.removeDuplicateMacros(ed, false);
            ed.selection.select(link);
        } else {
            tinyMCEPopup.execCommand("CreateLink", false, "#mce_temp_url#", {skip_undo : 1});
            elementArray = tinymce.grep(ed.dom.select("a"), function(n) {
                return ed.dom.getAttrib(n, 'href') == '#mce_temp_url#';
            });
            for (i = 0; i < elementArray.length; i++) {
                setAllAttribs(elementArray[i]);
                setAttrib(elementArray[i], "_modifiedtitle", "true");
            }
        }
        tinyMCEPopup.close();
        ed.focus();
        ed.selection.collapse();

        
        // the cursor is now at the end+inside the <a> tag
        // we need to move it to immediately outside the link

        var a = ed.selection.getNode();
        if(a.nodeName.toLowerCase() == "a"){
            $j(a).removeClass("active_link");
            ed.selection.select(a);
            ed.selection.collapse();
        }
    }

    // Given a string, returns a well formed URL.  If the string represents a web
    // host and path with no scheme, this function adds a default 'http:' scheme.
    // If the string represents an email address, this function adds a 'mailto:'
    // scheme.
    //
    // Theoretically returns `null` if the string cannot be converted to a well
    // formed URL. But in its current implementation any input will produce a URL.
    function castToUrl(s) {
        var scheme = /^[a-z][a-z0-9+\-.]+:/i;
        var email  = /^[^\s]+@[^\s\/]+$/i;
    
        if (scheme.test(s)) {
            return s;
        } else if (email.test(s)) {
            return 'mailto:' + s;
        } else {
            return 'http://' + s;
        }
    }

    this.addWebLink = function(s) {
        var rawAddress = $j.trim(s);
        var wellFormedURL = castToUrl(rawAddress);
    
        if (rawAddress) {
            if (!wellFormedURL) {
                alert(rawAddress + " " + i18nStrings.contentpickerNotValidURLText);
                return false;
            }
            else
            {
                var ed = tinyMCE.activeEditor;
                setTimeout(function(ed, wellFormedURL, rawAddress){ return function(){
                    var sel = ed.selection;
                    // first, check to see if any text is selected in the RTE.
                    // if so, we're going to use that text as the link's text
                    if (!sel.isCollapsed()) {
                        tinyMCEPopup.execCommand("CreateLink", false, wellFormedURL);
                    }
                    else
                    {
                        var link = ed.getDoc().createElement('A');
                        link.appendChild(ed.getDoc().createTextNode(rawAddress));
                        setAttrib(link, 'href', wellFormedURL);
                        setAttrib(link, 'data-mce-href', wellFormedURL);
                        try
                        {
                            ed.focus();
                            ed.selection.setNode(link);
                        }
                        catch(e) {
                        } // ie6 hates it when this function is called from a keyboard event vs mouse event CS-8688 die silently.
                    }
                    tinyMCEPopup.close();
                    ed.focus();
                    ed.selection.collapse();

                    // the cursor is now at the end+inside the <a> tag
                    // we need to move it to immediately outside the link

                    var a = ed.selection.getNode();
                    if(a.nodeName.toLowerCase() == "a"){
                        $j(a).removeClass("active_link");
                        ed.selection.select(a);
                        ed.selection.collapse();
                    }

                }}(ed, wellFormedURL, rawAddress), 333);
                return;
            }
        }
    
        alert(i18nStrings.contentpickerValidURLReqdText);
        return false;
    };

    this.addContentMacro = function(contentType, contentID) {
        var link,
            linkText,
            isValid = true;
        if (contentType && contentID) {
            // insert the content macro
            // try loading details about the type
            URLLookup.retrieveURLAndSubject(contentType, contentID, {
                callback: function(dataFromServer) {
                    if (dataFromServer !== null) {
                        addContentMacroReply(dataFromServer[0], dataFromServer[1], dataFromServer[2], dataFromServer[3]);
                    } else {
                        isValid = false;
                    }
                },
                timeout:20000,
                async: false
            });

            if (!isValid) {
                // if loading details was not possible for the type, it must be an unsupported type
                alert(i18nStrings.contentpickerTypeNotValidText);
                return false;
            } else {
                return true;
            }
        } else {
            alert(i18nStrings.contentpickerSlctCtToLinkText);
            return false;
        }
    };

};
