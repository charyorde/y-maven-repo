/*
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 */

(function() {
	var each = tinymce.each,
		entities = null,
		defs = {
			paste_auto_cleanup_on_paste : true,
			paste_block_drop : false,
			paste_retain_style_properties : "none",
			paste_strip_class_attributes : "mso",
			paste_remove_spans : false,
			paste_remove_styles : false,
			paste_remove_styles_if_webkit : false,
			paste_convert_middot_lists : true,
			paste_convert_headers_to_strong : false,
			paste_dialog_width : "450",
			paste_dialog_height : "400",
			paste_text_use_dialog : false,
			paste_text_sticky : false,
			paste_text_notifyalways : false,
			paste_text_linebreaktype : "p",
			paste_text_replacements : [
				[/\u2026/g, "..."],
				[/[\x93\x94\u201c\u201d]/g, '"'],
				[/[\x60\x91\x92\u2018\u2019]/g, "'"]
			]
		};

	function getParam(ed, name) {
		return ed.getParam(name, defs[name]);
	}

    function hexDump(s){
        //00001590  72 69 6e 67 20 74 68 65  20 6c 6f 61 64 62 61 6c  |ring the loadbal|
        var offset = 0;
        var BYTES = 16;
        var lines = [];

        function makeLine(s, off, size){
            var offStr = "00000000" + off.toString(16);
            offStr = offStr.substring(offStr.length-8);
            var codes = [];
            size = Math.min(size, s.length-off);
            for(var i = 0; i < size; ++i){
                var code = "00" + s.charCodeAt(off + i).toString(16);
                codes.push(code.substring(code.length-2));
                if(i > 0 && i % 8 == 0){
                    codes.push(""); //produces double-space every 8 code points
                }
            }

            var displayStr = s.substr(off, size).replace(/[\x00-\x1f]/g, ".");

            return offStr + "  " + codes.join(" ") + "  |" + displayStr + "|";
        }

        while(offset < s.length){
            lines.push(makeLine(s, offset, BYTES));
            offset += BYTES;
        }
        return lines.join("\n");
    }

	tinymce.create('tinymce.plugins.PastePlugin', {
		init : function(ed, url) {
			var t = this;

			t.editor = ed;
			t.url = url;

			// Setup plugin events
			t.onPreProcess = new tinymce.util.Dispatcher(t);
			t.onPostProcess = new tinymce.util.Dispatcher(t);
			t.onPasteComplete = new tinymce.util.Dispatcher(t);

			// Register default handlers
			t.onPreProcess.add(t._preProcess);
			t.onPostProcess.add(t._postProcess);

			// Register optional preprocess handler
			t.onPreProcess.add(function(pl, o) {
				ed.execCallback('paste_preprocess', pl, o);
			});

			// Register optional postprocess
			t.onPostProcess.add(function(pl, o) {
				ed.execCallback('paste_postprocess', pl, o);
			});

			// Initialize plain text flag
			ed.pasteAsPlainText = false;

			// This function executes the process handlers and inserts the contents
			// force_rich overrides plain text mode set by user, important for pasting with execCommand
			function process(o, force_rich) {
				var dom = ed.dom;

                ed.undoManager.add();

				// Execute pre process handlers
				t.onPreProcess.dispatch(t, o);

				// Create DOM structure
				o.node = dom.create('div', 0, o.content);

//                console.log("");
//                console.log("");
//                console.log("before postprocess: " + o.node.innerHTML);

				// Execute post process handlers
				t.onPostProcess.dispatch(t, o);

//                console.log("");
//                console.log("");
//                console.log("after postprocess: " + o.node.innerHTML);


				// Serialize content
				o.content = ed.serializer.serialize(o.node, {getInner : 1, forced_root_block : ''});

                o.content = o.content.replace(/\n/gi, "").replace(/\r/gi, "");

//                console.log("");
//                console.log("");
//                console.log("after serializer: " + o.content);

				// Plain text option active?
				if ((!force_rich) && (ed.pasteAsPlainText)) {
					t._insertPlainText(ed, dom, o.content);

					if (!getParam(ed, "paste_text_sticky")) {
						ed.pasteAsPlainText = false;
						ed.controlManager.setActive("pastetext", false);
					}
				} else if (/<(p|h[1-6]|ul|ol)/.test(o.content)) {
					// Handle insertion of contents containing block elements separately
					t._insertBlockContent(ed, dom, o.content);
				} else {
					t._insert(o.content, 1);
				}
                t.onPasteComplete.dispatch(t, ed);
                ed.undoManager.add();
			}

			// Add command for external usage
			ed.addCommand('mceInsertClipboardContent', function(u, o) {
//                console.log(o.content);
				process(o, true);
			});

			if (!getParam(ed, "paste_text_use_dialog")) {
				ed.addCommand('mcePasteText', function(u, v) {
					var cookie = tinymce.util.Cookie;

					ed.pasteAsPlainText = !ed.pasteAsPlainText;
					ed.controlManager.setActive('pastetext', ed.pasteAsPlainText);

					if ((ed.pasteAsPlainText) && (!cookie.get("tinymcePasteText"))) {
						if (getParam(ed, "paste_text_sticky")) {
							ed.windowManager.alert(ed.translate('paste.plaintext_mode_sticky'));
						} else {
							ed.windowManager.alert(ed.translate('paste.plaintext_mode_sticky'));
						}

						if (!getParam(ed, "paste_text_notifyalways")) {
							cookie.set("tinymcePasteText", "1", new Date(new Date().getFullYear() + 1, 12, 31))
						}
					}
				});
			}

			ed.addButton('pastetext', {title: 'paste.paste_text_desc', cmd: 'mcePasteText'});
			ed.addButton('selectall', {title: 'paste.selectall_desc', cmd: 'selectall'});

			// This function grabs the contents from the clipboard by adding a
			// hidden div and placing the caret inside it and after the browser paste
			// is done it grabs that contents and processes that
            function grabContent(e) {
                var n, or, rng, oldRng, sel = ed.selection, dom = ed.dom, body = ed.getBody(), posY, textContent;

                // Check if browser supports direct plaintext access
                if (e.clipboardData || dom.doc.dataTransfer) {
                    if (ed.pasteAsPlainText) {
                        textContent = (e.clipboardData || dom.doc.dataTransfer).getData('Text');
                        e.preventDefault();
                        process({content : textContent.replace(/\r?\n/g, '<br />')});
                        return;
                    }
                }

                if (dom.get('_mcePaste'))
                    return;

                // Create container to paste into
                n = dom.add(body, 'div', {id : '_mcePaste', 'class' : 'mcePaste', 'data-mce-bogus' : '1'}, '\uFEFF\uFEFF');

                // If contentEditable mode we need to find out the position of the closest element
                if (body != ed.getDoc().body)
                    posY = dom.getPos(ed.selection.getStart(), body).y;
                else
                    posY = body.scrollTop + dom.getViewPort().y;

                // Styles needs to be applied after the element is added to the document since WebKit will otherwise remove all styles
                dom.setStyles(n, {
                    position : 'absolute',
                    left : -10000,
                    top : posY,
                    width : 1,
                    height : 1,
                    overflow : 'hidden'
                });

                if (tinymce.isIE) {
                    // Store away the old range
                    oldRng = sel.getRng();

                    // Select the container
                    rng = dom.doc.body.createTextRange();
                    rng.moveToElementText(n);
                    rng.execCommand('Paste');

                    // Remove container
                    dom.remove(n);

                    // Check if the contents was changed, if it wasn't then clipboard extraction failed probably due
                    // to IE security settings so we pass the junk though better than nothing right
                    if (n.innerHTML === '\uFEFF\uFEFF') {
                        ed.execCommand('mcePasteWord');
                        e.preventDefault();
                        return;
                    }

                    // Restore the old range and clear the contents before pasting
                    sel.setRng(oldRng);
                    sel.setContent('');

                    // For some odd reason we need to detach the the mceInsertContent call from the paste event
                    // It's like IE has a reference to the parent element that you paste in and the selection gets messed up
                    // when it tries to restore the selection
                    setTimeout(function() {
                        // Process contents
                        process({content : n.innerHTML});
                    }, 0);

                    // Block the real paste event
                    return tinymce.dom.Event.cancel(e);
                } else {
                    function block(e) {
                        e.preventDefault();
                    };

                    // Block mousedown and click to prevent selection change
                    dom.bind(ed.getDoc(), 'mousedown', block);
                    dom.bind(ed.getDoc(), 'keydown', block);

                    or = ed.selection.getRng();

                    // Move select contents inside DIV
                    n = n.firstChild;
                    rng = ed.getDoc().createRange();
                    rng.setStart(n, 0);
                    rng.setEnd(n, 2);
                    sel.setRng(rng);

                    // Wait a while and grab the pasted contents
                    window.setTimeout(function() {
						var h = '', nl = dom.select('div.mcePaste');
                        if(nl.length > 1) nl = dom.select('div.mcePaste:not(:first)');

                            // WebKit will split the div into multiple ones so this will loop through then all and join them to get the whole HTML string
                            each(nl, function(n) {
                                var child = n.firstChild;

                                // WebKit inserts a DIV container with lots of odd styles
                                if (child && child.nodeName == 'DIV' && child.style.marginTop && child.style.backgroundColor) {
                                    dom.remove(child, 1);
                                }

							// WebKit duplicates the divs so we need to remove them
							each(dom.select('div.mcePaste', n), function(n) {
								dom.remove(n, 1);
							});

                                // Remove apply style spans
                                each(dom.select('span.Apple-style-span', n), function(n) {
                                    dom.remove(n, 1);
                                });

                            // Remove apply style spans
                            each(dom.select('span.Apple-tab-span', n), function(n) {
                                var str = n.innerHTML;
                                while(str != str.replace("\t", "     ")) str = str.replace("\t", "     ");
                                n.parentNode.insertBefore(n.ownerDocument.createTextNode(str), n);
                                dom.remove(n, 1);
                            });

                                // Remove bogus br elements
							each(dom.select('br[_mce_bogus]', n), function(n) {
                                    dom.remove(n);
                                });

							h += n.innerHTML + "<br/>";
                            });

                        // Remove the nodes
						each(nl, function(n) {
							dom.remove(n);
						});

                        each(dom.select('div.mcePaste'), function(n){
                            dom.remove(n);
                        });

                        // Restore the old selection
                        if (or)
                            sel.setRng(or);

                        process({content : h});

                        // Unblock events ones we got the contents
                        dom.unbind(ed.getDoc(), 'mousedown', block);
                        dom.unbind(ed.getDoc(), 'keydown', block);
                    }, 0);
                }
            }

			// Check if we should use the new auto process method
			if (getParam(ed, "paste_auto_cleanup_on_paste")) {
				// Is it's Opera or older FF use key handler
				if (tinymce.isOpera || /Firefox\/2/.test(navigator.userAgent)) {
					ed.onKeyDown.add(function(ed, e) {
						if (((tinymce.isMac ? e.metaKey : e.ctrlKey) && e.keyCode == 86) || (e.shiftKey && e.keyCode == 45))
							grabContent(e);
					});
				} else {
					// Grab contents on paste event on Gecko and WebKit
					ed.onPaste.addToTop(function(ed, e) {
						return grabContent(e);
					});
				}
			}

			// Block all drag/drop events
			if (getParam(ed, "paste_block_drop")) {
				ed.onInit.add(function() {
					ed.dom.bind(ed.getBody(), ['dragend', 'dragover', 'draggesture', 'dragdrop', 'drop', 'drag'], function(e) {
						e.preventDefault();
						e.stopPropagation();

						return false;
					});
				});
			}

			// Add legacy support
            if(getParam(ed, "paste_legacy_support")){
			    t._legacySupport();
            }
		},

		getInfo : function() {
			return {
				longname : 'Paste text/word',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/paste',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		},

		_preProcess : function(pl, o) {
//			console.log('Before preprocess:\n' + hexDump(o.content));
//			console.log('Before preprocess:' + o.content);

            // strip leading whitespace on each line

            var ed = this.editor,
				h = o.content,
				grep = tinymce.grep,
				explode = tinymce.explode,
				trim = tinymce.trim,
				len, stripClass;

			function process(items) {
				each(items, function(v) {
					// Remove or replace
					if (v.constructor == RegExp){
						h = h.replace(v, '');
                    }else{
						h = h.replace(v[0], v[1]);
                    }
				});
			}

            //tab-delimited table detection and parsing
            function makeRow(cells, out) {
                out.push('<tr>');
                each(cells, function(cell) {
                    out.push('<td>');
                    out.push(cell);
                    out.push('</td>');
                });
                out.push('</tr>');
            }

            (function(){
                //Webkit's funky tab-delimited table format, which involves no tabs
                var tabLine = /\x0a\x20((?:\x0a\x20\x20[^<\x0a]*)+)\x0a\x20/g;
                var match = tabLine.exec(h);
                if(match){
                    var out = [h.substring(0, match.index), '<table><tbody>'];
                    tabLine.lastIndex = 0;
                    var lastMatchEnd = match.index;
                    //not actually replacing; just iterating over the string
                    h.replace(tabLine, function(wholeLine, cellsStr, offset, wholeString){
                        if(offset > lastMatchEnd){
                            out.push('</tbody></table>');
                            out.push(wholeString.substring(lastMatchEnd, offset));
                            out.push('<table><tbody>');
                        }
                        lastMatchEnd = offset + wholeLine.length;
                        var cells = cellsStr.split(/\x0a\x20\x20/).slice(1); //need to slice off the empty prefix element
                        makeRow(cells, out);

                        return wholeLine;
                    });
                    out.push(h.substring(lastMatchEnd));
                    h = out.join("");
                }
            })();
            //"Plain text" tables, such as result from pasting Excel into Notepad.
            //Chrome preserves actual \t characters.  FF replaces them with three NBSPs.  IE uses one NBSP, which is useless, as expected.
            (function(){
                var tab = "\t";
                if(tinymce.isGecko){
                    tab = "(?:(?:&nbsp;){3} )";
                }else if(tinymce.isWebKit){
                    tab = "(?: *\t)";
                }else if(tinymce.isIE){
                    //tab = "(?:&nbsp;)"; //sigh.  This is so common as to be useless.
                    return;
                }
                var tabTableRe = new RegExp("^(?:[^<>]*?" + tab + ")+[^<>]*<br */?>", "i");
                var tabRowRe = new RegExp("(?:[^<>]*?" + tab + ")+[^<>]*", "i");
                var tabRe = new RegExp(tab, "i");
                if(tabTableRe.test(h)){
                    function table(lines, out){
                        out.push('<table><tbody>');
                        tabRowRe.lastIndex = 0;
                        while(lines.length && tabRowRe.test(lines[0])){
                            var cells = lines.shift().split(tabRe);
                            makeRow(cells, out);
                        }

                        out.push('</tbody></table>');
                    }
                    function preProcessTabTable(h){
                        var lines = h.split(/<br *\/?>/ig);
                        var out = [];
                        while(lines.length){
                            tabRowRe.lastIndex = 0;
                            if(tabRowRe.test(lines[0])){
                                table(lines, out);
                            }else{
                                out.push(lines.shift());
                                out.push("<br />");
                            }
                        }
                        return out.join("");
                    }
                    h = preProcessTabTable(h);
                }
            })();

            // remove style tags
            h = h.replace(/<style([^>]*)>([^<]*?)<\/style>/gi, "");

            // remove trailing <br/> if the content is plain text
            process([
						[/^([^<]+)<br\s*\/?>$/gi, '$1']
					]);


            // remove id=_mcePaste if the content is plain text
            process([
						[/(<[a-z][^>]*)\sid="?_mcePaste"?/gi, '$1']
					]);

            (function(){
                //detect paste of URLs
                var urlRe = /^https?:\/\/(?:[^:]+:[^@])?[\w\.]+(?::\d+)?\S*$/;
                var breaks = /<br[^>]*>/;
                if(urlRe.test(h) && !breaks.test(h)){
                    h = "<a href='" + h + "' title='" + h + "' class='loading'>" + h + "</a>";
                }
            })();



			// Detect Word content and process it more aggressive
			if (/class="?Mso|style="[^"]*\bmso-|w:WordDocument/i.test(h) || o.wordContent) {
				o.wordContent = true;			// Mark the pasted contents as word specific content
				//console.log('Word contents detected.');

				// Process away some basic content
				process([
					/^\s*(?:&nbsp;)+/gi,				// &nbsp; entities at the start of contents
					/(?:&nbsp;|<br[^>]*>)+\s*$/gi		// &nbsp; entities at the end of contents
				]);

				if (getParam(ed, "paste_convert_headers_to_strong")) {
					h = h.replace(/<p [^>]*class="?MsoHeading"?[^>]*>(.*?)<\/p>/gi, "<p><strong>$1</strong></p>");
				}

				if (getParam(ed, "paste_convert_middot_lists")) {
					process([
						[/<!--\[if !supportLists\]-->/gi, '$&__MCE_ITEM__'],					// Convert supportLists to a list item marker
                        [/(<span[^>]+(?:mso-list:|:\s*symbol|:\s*wingdings)[^>]+>)/gi, '$1__MCE_ITEM__'],		// Convert mso-list and symbol spans to item markers
                        [/<span[^>]+mso-list:\s+Ignore[^>]+>/gi, '<span class="pasted-list-info">']		// This span tells us about the bullet type; keep it around
					]);

                    do{
                        var oldH = h;
                        process([
                                // remove spans that only contain &nbsp; or whitespace, but leave the whitespace
                                // this will be necessary later for list processing
                            [/<span[^>]*>((?:&nbsp;|\s|\u00a0)*)<\/span>/gi, '$1'],
                                // remove spans that wrap around list item markers,
                                // but leave the marks and the contents around them
                            [/<span[^>]+(?:mso-list:|:\s*symbol|:\s*wingdings)[^>]+>(__MCE_ITEM__)([^<]*?)<\/span>/gi, '$1$2'],
                            [/(__MCE_ITEM__)(?:&nbsp;|\s|\u00a0)*/gi, '$1']
                        ]);
                    }while(oldH != h);

				}

				process([
					// Word comments like conditional comments etc
					/<!--[\s\S]+?-->/gi,

					// Remove comments, scripts (e.g., msoShowComment), XML tag, VML content, MS Office namespaced tags, and a few other tags
					/<(?:!|script[^>]*>.*?<\/script(?=[>\s])|\/?(?:\?xml(?::\w+)?|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi,

					// Convert <s> into <strike> for line-though
					[/<(\/?)s>/gi, "<$1strike>"],

					// Replace nsbp entites to char since it's easier to handle
					[/&nbsp;/gi, "\u00a0"]
				]);

				// Remove bad attributes, with or without quotes, ensuring that attribute text is really inside a tag.
				// If JavaScript had a RegExp look-behind, we could have integrated this with the last process() array and got rid of the loop. But alas, it does not, so we cannot.
				do {
					len = h.length;
					h = h.replace(/(<[a-z][^>]*\s)(?:id|name|language|type|on\w+|\w+:\w+)=(?:"[^"]*"|\w+)\s?/gi, "$1");
				} while (len != h.length);



                //
                //
                // the following regular expressions strip out <strong> tags or font-weight
                // if they're redundant
                //
                // once http://dev.jquery.com/ticket/7078 is fixed, we'll be able to use
                // jQuery to do this more effectively
                //
                // right now, the following will not get unredundanted :D
                //
                // <strong><span style="font-weight:normal;">foo<span style="color:red;">bar</span></span></strong>

                //
                // replace <strong><span style="... font-weight: normal; ...">foo</span></strong>
                // with <span style="...">foo</span>
                h = h.replace(/<strong><span([^>]*)font-weight:([^<;"]*)normal[;]?([^>]*)>([^<]*?)<\/span><\/strong>/gi, "<span$1$3>$4</span>");

                //
                // replace <strong><span style="... font-weight: bold[er]; ...">foo</span></strong>
                // with <strong><span style="...">foo</span></strong>
                // remove the font-weight from the span style
                h = h.replace(/<strong><span([^>]*)font-weight:([^<;"]*)bold[er]?[;]?([^>]*)>([^<]*?)<\/span><\/strong>/gi, "<strong><span$1$3>$4</span></strong>");


				// Remove all spans if no styles is to be retained
				if (getParam(ed, "paste_retain_style_properties").replace(/^none$/i, "").length == 0) {
					h = h.replace(/<\/?span[^>]*>/gi, "");
				} else {
					// We're keeping styles, so at least clean them up.
					// CSS Reference: http://msdn.microsoft.com/en-us/library/aa155477.aspx

					process([
						// Convert <span style="mso-spacerun:yes">___</span> to string of alternating breaking/non-breaking spaces of same length
						[/<span\s+style\s*=\s*"\s*mso-spacerun\s*:\s*yes\s*;?\s*"\s*>([\s\u00a0]*)<\/span>/gi,
							function(str, spaces) {
								return (spaces.length > 0)? spaces.replace(/./, " ").slice(Math.floor(spaces.length/2)).split("").join("\u00a0") : "";
							}
						]
					]);
				}
			}

            // Examine all styles: delete junk, transform some, and keep the rest
			process([[/(<[a-z][^>]*)\sstyle="([^"]*)"/gi,
                    function wordStyleTransform(str, tag, style) {
                        var n = [],
                            i = 0,
                            s = explode(trim(style).replace(/&quot;/gi, "'"), ";");


                        // keep track of how far indented
                        // the list item should be
                        var listDepth = false;

                        // true if the list *must* be forced to OL
                        // false if it can be UL or OL
                        var forceOL = false;

                        // true if the tag should be removed altogether but it's children kept
                        // false otherwise
                        //
                        // useful for removing <em style="font-style:normal"> etc
                        var removeTag = false;

                        // Examine each style definition within the tag's style attribute
                        each(s, function wordStyleTransformInnerLoop(v) {
                            var name, value,
                                parts = explode(v, ":");

                            function ensureUnits(v) {
                                return v + (((v !== "0") && (/\d$/.test(v)))? "px" : "");
                            }

                            if (parts.length == 2) {
                                name = parts[0].toLowerCase();
                                value = parts[1].toLowerCase();

                                // Translate certain MS Office styles into their CSS equivalents
                                var lowerTag = tag.toLowerCase();
                                switch (name) {
                                    case "text-decoration":
                                        if(value != "none"){
                                            n[i++] = name + ":" + value;
                                        }
                                        return;
                                    case "font-style":
                                        if((lowerTag.indexOf("<em") === 0 ||
                                                lowerTag.indexOf("<i") === 0) &&
                                                trim(value) == "normal"){
                                            // it's an <em style="font-style:normal"> ...
                                            removeTag = true;
                                        }else if((lowerTag.indexOf("<em") === 0 ||
                                                lowerTag.indexOf("<i") === 0) &&
                                                trim(value) == "oblique"){
                                            // it's an <em style="font-style:oblique"> ...
                                            // leave the tag, remove the style
                                        }else{
                                            n[i++] = name + ":" + value;
                                        }
                                        return;
                                    case "font-weight":
                                        if((lowerTag.indexOf("<strong") === 0 ||
                                                lowerTag.indexOf("<b") === 0) &&
                                                trim(value) == "normal"){
                                            // it's a <strong style="font-weight:normal"> ...
                                            removeTag = true;
                                        }else if((lowerTag.indexOf("<strong") === 0 ||
                                                lowerTag.indexOf("<b") === 0) &&
                                                trim(value).indexOf("bold") >= 0){
                                            // it's an <strong style="font-style:bold[er]"> ...
                                            // leave the tag, remove the style
                                        }else{
                                            n[i++] = name + ":" + value;
                                        }
                                        return;
                                    case "list-style":
                                    case "list-style-type":
                                    case "list-style-image":
                                    case "list-style-position":
                                        if(lowerTag.indexOf("<ul") === 0 ||
                                                lowerTag.indexOf("<ol") === 0 ||
                                                lowerTag.indexOf("<li") === 0){
                                            n[i++] = name + ":" + value;
                                        }
                                        return;
                                    case "border-collapse":
                                        return;
                                    case "border":
                                    case "border-width":
                                    case "border-style":
                                    case "border-color":
                                        if(lowerTag.indexOf("<table") === 0 ||
                                                lowerTag.indexOf("<tr") === 0 ||
                                                lowerTag.indexOf("<td") === 0 ||
                                                lowerTag.indexOf("<th") === 0 ||
                                                lowerTag.indexOf("<img") === 0){
                                            if(value != "inherit" && value != "initial"){
                                                value = value.replace(/(?:^|\s*)-moz[-\w]+\b/g, ""); //strip out -moz styles
                                                n[i++] = name + ":" + value;
                                            }
                                        }
                                        return;
                                    case "margin":
                                    case "margin-left":
                                    case "margin-right":
                                    case "margin-top":
                                    case "margin-bottom":
                                    case "mso-padding-alt":
                                    case "mso-padding-top-alt":
                                    case "mso-padding-right-alt":
                                    case "mso-padding-bottom-alt":
                                    case "mso-padding-left-alt":
                                    case "mso-margin-alt":
                                    case "mso-margin-top-alt":
                                    case "mso-margin-right-alt":
                                    case "mso-margin-bottom-alt":
                                    case "mso-margin-left-alt":
                                    case "mso-table-layout-alt":
                                    case "mso-height":
                                    case "mso-width":
                                    case "mso-vertical-align-alt":
                                        value = value.replace(/^0(?:[\w]+)/gi, "0").replace(/(?:\s)0(?:[\w]+)/gi, " 0").replace(/(?:\s)0\.00(?:[\d|\w]+)/gi, " 0");
                                        value = value.replace(/^[0\s]*$/gi, "0");
                                        if(value != "0"){
                                            name = name.replace(/^mso-|-alt$/g, "").toLowerCase();
                                            if(name == "margin-left" && trim(lowerTag) == "<p"){
                                                var val = parseFloat(value);
                                                var unit = value.replace(/[\d\.]*([^\d]*)$/g, "$1").toLowerCase();
                                                if(unit == "in"){
                                                    val = val * 90; // 90px per inch
                                                    n[i++] = "padding-left:" + val + "px";
                                                    return;
                                                }
                                            }else{
                                                if (parts[1] != "0" && parts[1] != "initial"){
                                                    if(lowerTag.indexOf("<table") === 0 ||
                                                            lowerTag.indexOf("<tr") === 0 ||
                                                            lowerTag.indexOf("<td") === 0 ||
                                                            lowerTag.indexOf("<th") === 0 ||
                                                            lowerTag.indexOf("<img") === 0){
                                                        // don't allow margin's on tables/cells to have
                                                        // negative values
                                                        if(value.indexOf("-") !== 0){
                                                            n[i++] = name + ":" + value;
                                                        }
                                                    }else{
                                                        n[i++] = name + ":" + value;
                                                    }
                                                }
                                            }
                                        }
                                        return;
                                    case "mso-list":
                                            // save list indentation information
                                        listDepth = value.replace(/.*level(\d*).*/gi, "$1");
                                        return;
                                    case "mso-bidi-theme-font":
                                        forceOL = true;
                                        return;
                                    case "horiz-align":
                                    case "text-align":
                                        n[i++] = "text-align:" + value;
                                        return;
                                    case "text-indent":
                                        n[i++] = "text-indent:" + value;
                                        return;

                                    case "vert-align":
                                        n[i++] = "vertical-align:" + value;
                                        return;

                                    case "color":
                                    case "font-color":
                                    case "mso-foreground":
                                        if(value != "transparent"){
                                            n[i++] = "color:" + value;
                                        }
                                        return;

                                    case "mso-background":
                                    case "mso-highlight":
                                        n[i++] = "background:" + value;
                                        return;

                                    case "background-color":
                                        // JIVE-16661: don't copy white background-color
                                        if(value != "transparent" && value != 'rgb(255, 255, 255)'){
                                            n[i++] = "background-color:" + value;
                                        }
                                        return;

                                    case "background-position":
                                    case "background-repeat":
                                        if(value != "initial initial" && value != "repeat repeat" && value != "0px 0px"){
                                            n[i++] = "background-position:" + value;
                                        }
                                        return;

                                    case "background-image":
                                        return;

                                    case "font-size":
                                        if(value != "1em"){
                                            n[i++] = "font-size:" + value;
                                        }
                                        return;

                                    case "mso-default-height":
                                        if(value != "0px"){
                                            n[i++] = "min-height:" + ensureUnits(value);
                                        }
                                        return;

                                    case "mso-default-width":
                                        if(value != "0px"){
                                            n[i++] = "min-width:" + ensureUnits(value);
                                        }
                                        return;

                                    case "mso-padding-between-alt":
                                        n[i++] = "border-collapse:separate;border-spacing:" + ensureUnits(value);
                                        return;

                                    case "text-line-through":
                                        if ((value == "single") || (value == "double")) {
                                            n[i++] = "text-decoration:line-through";
                                        }
                                        return;

                                    case "mso-zero-height":
                                        if (value == "yes") {
                                            n[i++] = "display:none";
                                        }
                                        return;
                                }

                                // Eliminate all MS Office style definitions that have no CSS equivalent by examining the first characters in the name
                                if (/^(?:mso|column|font-emph|lang|layout|line-break|list-image|nav|panose|punct|row|ruby|sep|size|src|tab-|table-border|text-(?!decor|trans)|top-bar|version|vnd|word-break)/.test(name)) {
                                    return;
                                }

                                if(lowerTag.indexOf("<p") === 0 && (name == "min-height" || name == "height")){
                                    //
                                    // don't allow paragraphs to have a height
                                    return;
                                }

                                // change all 0px and 0cm etc to just 0
                                // also round down for any 0.00*cm to just 0
                                parts[1] = parts[1].replace(/^0(?:[\w]+)/gi, "0").replace(/(?:\s)0(?:[\w]+)/gi, " 0").replace(/(?:\s)0.00(?:[\d|\w]+)/gi, " 0");
                                parts[1] = parts[1].replace(/^[0\s]*$/gi, "0");


                                // Process styles
                                var styleProps = getParam(ed, "paste_retain_style_properties"); // retained properties
                                // Process only if a string was specified and not equal to "all" or "*"
                                if ((tinymce.is(styleProps, "string")) && (styleProps !== "all") && (styleProps !== "*")) {
                                    styleProps = tinymce.explode(styleProps.replace(/^none$/i, ""));
                                }else{
                                    styleProps = [];
                                }

                                // If it reached this point, it must be a valid CSS style
                                if ((!styleProps.length || tinymce.inArray(styleProps, name)) >= 0 && parts[1] != "0" && parts[1] != "initial") {
                                    n[i++] = name + ":" + parts[1];		// Lower-case name, but keep value case
                                }
                            }
                        });

                        // If style attribute contained any valid styles the re-write it; otherwise delete style attribute.
                        tag = tag + (forceOL ? " jive-list-ol='1'" : "")
                                + (listDepth ? " jive-list-info='" + listDepth + "'" : "")
                                + (removeTag ? " jive-remove-tag='1'" : "");
                        if (i > 0) {
                            return tag + ' style="' + n.join(';') + '"';
                        } else {
                            return tag;
                        }
                    }
                ]
            ]);

			// Replace headers with <strong>
			if (getParam(ed, "paste_convert_headers_to_strong")) {
				process([
					[/<h[1-6][^>]*>/gi, "<p><strong>"],
					[/<\/h[1-6][^>]*>/gi, "</strong></p>"]
				]);
			}

			// Class attribute options are: leave all as-is ("none"), remove all ("all"), or remove only those starting with mso ("mso").
			// Note:-  paste_strip_class_attributes: "none", verify_css_classes: true is also a good variation.
			stripClass = getParam(ed, "paste_strip_class_attributes");

			if (stripClass !== "none") {
				function removeClasses(match, g1) {
						if (stripClass === "all")
							return '';

						var cls = grep(explode(g1.replace(/^(["'])(.*)\1$/, "$2"), " "),
							function(v) {
								return (/^(?!mso)/i.test(v));
							}
						);

						return cls.length ? ' class="' + cls.join(" ") + '"' : '';
				};

				h = h.replace(/ class="([^"]+)"/gi, removeClasses);
				h = h.replace(/ class=([\w-]+)/gi, removeClasses);
			}

			// Remove spans option
			if (getParam(ed, "paste_remove_spans")) {
				h = h.replace(/<\/?span[^>]*>/gi, "");
			}





            // Examine all styles: delete junk, transform some, and keep the rest
			process([[/<li[^>]*>(.*)<\/li>/gi,
                    function(outer, inner) {

                        var start = outer.substr(0,outer.indexOf(">")+1);
                        var end = outer.substr(start.length + inner.length);

                        inner = inner.replace(/<p([^>]*)>(.*?)<\/p>/gi, "<span$1>$2</span>");
                        inner = inner.replace(/<div([^>]*)>(.*?)<\/div>/gi, "<span$1>$2</span>");

                        inner = inner.replace(/<br><\/span>/gi, "</span>");
                        do{
                            var prevInner = inner;
                            inner = inner.replace(/<span[^>]*><\/span>/gi, "");
                        }while(prevInner != inner);

                        return start + inner + end;
                    }
                ]
            ]);



            // remove meta tags
            h = h.replace(/<meta[^>]*>/gi, "");
            h = h.replace(/<\/meta>/gi, "");
            h = h.replace(/<br[^>]*>$/i, ""); //we don't need the terminal br that some browsers (e.g. Chrome) add to copied content

            //Plain text files copied from browsers are usually surrounded with pre tags.  Ditch them, and use br to terminate lines.
            var plainTextPasteRe = /^<pre[^>]*>([\s\S]*)<\/pre[^>]*>$/i;
            var match = plainTextPasteRe.exec(h);
            if(match != null){
                h = match[1].replace(/\n/g, "<br />");
            }else{
                h = h.replace(/\r/gi, "\n");
                var lines = h.split("\n");
                var out = [];
                each(lines, function(value){
                    out.push(trim(value));
                });
                h = out.join(" ");
            }

            // remove title tags
            h = h.replace(/<title([^>]*)>([^<]*?)<\/title>/gi, "");
            // remove line breaks
            h = h.replace(/\n/gi, "").replace(/\r/gi, "");
            // remove unstyled spans
//            h = h.replace(/<span>(.*?)<\/span>/gi, "$1");
            var newH = h;
            do{
                h = newH;
                newH = h.replace(/<span>(.*?)<\/span>/gi, "$1");
            }while(newH != h);
            // remove <div> ending a <li> item
            h = h.replace(/<pre>/gi, "<pre class='jive-pre'>");
            h = h.replace(/<div><br><\/div>/gi, "");
            h = h.replace(/<div([^>]*)>(\s?)<\/div>/gi, "");
            // unstyle <li> items
            h = h.replace(/<li[^>]*>(.*?)<\/li>/gi, "<li>$1</li>");
            // unstyle <ul> items
            h = h.replace(/<ul[^>]*>(.*?)<\/ul>/gi, "<ul>$1</ul>");
            // remove <p> from <li>
            h = h.replace(/<li[^>]*>(.*?)<p[^>]*>(.*?)<\/li>/gi, "<li>$1$2</li>");
            h = h.replace(/<li[^>]*>(.*?)<\/p>(.*?)<\/li>/gi, "<li>$1$2</li>");
            h = h.replace(/<li><p>(.*?)<\/p><\/li>/gi, "<li>$1</li>");
            // remove empty <ul></ul>
            h = h.replace(/<ul><\/ul>/gi, "");
            h = h.replace(/<ol><\/ol>/gi, "");

            h = h.replace(/>([\s|^\u00a0]*)<td/gi, "><td");
            h = h.replace(/<\/td>([\s|^\u00a0]*)</gi, "<\/td><");
            h = h.replace(/<\/li>([\s&&[^\u00a0]]*)<\/ul>/gi, "<\/li><\/ul>");
            h = h.replace(/<\/li>([\s&&[^\u00a0]]*)<\/ol>/gi, "<\/li><\/ol>");
            h = h.replace(/<ul>([\s&&[^\u00a0]]*)<li>/gi, "<ul><li>");
            h = h.replace(/<ol>([\s&&[^\u00a0]]*)<li>/gi, "<ol><li>");
            h = h.replace(/<\/li>([\s&&[^\u00a0]]*)<li>/gi, "<li><li>");

            // preserve leading/trailing spaces in IE
            var blockR = "(?:H[1-6R]|P|DIV|ADDRESS|PRE|FORM|TABLE|TBODY|THEAD|TFOOT|TH|TR|TD|LI|OL|UL|CAPTION|BLOCKQUOTE|CENTER|DL|DT|DD|DIR|FIELDSET|NOSCRIPT|MENU|ISINDEX|SAMP)";
            h = h.replace(new RegExp("(<\/?" + blockR + "[^>]*>)\\s+(?=<" + blockR + ")", "gi"), "$1");
            h = h.replace(new RegExp("(<\/" + blockR + "[^>]*>)\\s+(?=<\/" + blockR + ")", "gi"), "$1");
            //for all other cases, make the space an nbsp
            h = h.replace(/> /gi, ">&nbsp;");
            h = h.replace(/ </gi, "&nbsp;<");

            process([[/<div([^>]*)>((.(?!<div))*?)<\/div>/gi,
                function(str, div, contents){
                    var lowerContents = contents.toLowerCase();
                    if(lowerContents.indexOf("<ul") >= 0 ||
                            lowerContents.indexOf("<ol") >= 0 ||
                            lowerContents.indexOf("<blockquote") >= 0 ||
                            lowerContents.indexOf("<p") >= 0){
                        return contents;
                    }
                    return str;
                }
            ]]);

            // convert remaining <div> "paragraphs" to <p>
            h = h.replace(/<div([^>]*)>(.*?)<\/div>/gi, "<p$1>$2</p>");

            // unwrap <ul> and <ol> from <p>
            // unstyle <ul> items
//            h = h.replace(/<p[^>]*><ul/gi, "<ul");
//            h = h.replace(/<p[^>]*><ol/gi, "<ol");
//            h = h.replace(/<\/ul><\/p>/gi, "</ul>");
//            h = h.replace(/<\/ol><\/p>/gi, "</ol>");

            h = h.replace(/<\/strong><strong(?:\s*)>/gi, "");
            h = h.replace(/<\/b><b(?:\s*)>/gi, "");
            h = h.replace(/<\/u><u(?:\s*)>/gi, "");
            h = h.replace(/<\/em><em(?:\s*)>/gi, "");
            h = h.replace(/<\/i><i(?:\s*)>/gi, "");
            h = h.replace(/(_jivemacro_uid_\d+)/gi, "");
            h = h.replace(/(_jivemacro_uid=['"][^"']*['"])/gi, "");
            h = h.replace(/<br class="Apple-interchange-newline">/gi, "");


//			console.log('After preprocess:' + h);

			o.content = h;
		},

		/**
		 * Various post process items.
		 */
		_postProcess : function(pl, o) {
			var t = this, ed = t.editor, dom = ed.dom, styleProps;


            t._removeNodes(pl, o);
            t._fixOrphanLIs(pl, o);

			if (o.wordContent) {
				// Remove named anchors or TOC links
				each(dom.select('a', o.node), function(a) {
					if (!a.href || a.href.indexOf('#_Toc') != -1)
						dom.remove(a, 1);
				});

				if (getParam(ed, "paste_convert_middot_lists")) {
					t._convertLists(pl, o);
				}

				// Process only if a string was specified and not equal to "all" or "*"
                // Retains some style properties
                each(dom.select('*', o.node), function(el) {
                    if (el.nodeName == 'SPAN' && !el.className && !dom.getAttrib(el, "style")){
                        dom.remove(el, true);
                    }
                });
			}

			// Remove all style information or only specifically on WebKit to avoid the style bug on that browser
			if (getParam(ed, "paste_remove_styles") || (getParam(ed, "paste_remove_styles_if_webkit") && tinymce.isWebKit)) {
				each(dom.select('*[style]', o.node), function(el) {
					el.removeAttribute('style');
					el.removeAttribute('data-mce-style');
				});
			} else {
				if (tinymce.isWebKit) {
					// We need to compress the styles on WebKit since if you paste <img border="0" /> it will become <img border="0" style="... lots of junk ..." />
					// Removing the mce_style that contains the real value will force the Serializer engine to compress the styles
					each(dom.select('*', o.node), function(el) {
                        if(el.getAttribute("data-mce-style")){
                            el.setAttribute("style", el.getAttribute("data-mce-style"));
                        }
						el.removeAttribute('data-mce-style');
					});
				}
			}

            //
            // remove whitespace from beginning
            // of pasted content
            //
            // IE does not count \s to include &nbsp;,
            // so we need to account for it manually
            for(var i=0;i<o.node.childNodes.length;i++){
                var kid = o.node.childNodes[i];
                var isTextNode = kid.nodeType == 3;
                var isWhiteSpace = /^[\s\u00a0]*$/gi.test(kid.nodeValue);
                if(isTextNode && isWhiteSpace){
                    kid.parentNode.removeChild(kid);
                    i--;
                }else{
                    break;
                }
            }

            //
            // remove whitespace from end
            // of pasted content
            for(var i=o.node.childNodes.length-1;i>=0;i--){
                var kid = o.node.childNodes[i];
                var isTextNode = kid.nodeType == 3;
                var isWhiteSpace = /^[\s\u00a0]*$/gi.test(kid.nodeValue);
                if(isTextNode && isWhiteSpace){
                    kid.parentNode.removeChild(kid);
                    // since we're moving from the back of the list
                    // forward, we don't need to adjust i++ after
                    // removing a node
                }else{
                    break;
                }
            }



            //If we have block nodes, make sure everything is wrapped in block nodes.
            //
            // this also changes all top level <br>'s
            // to be proper <p>'s
            if(o.node.childNodes.length > 1){
                //
                // we only wrap text in <p> if we have more than 1 node to paste
                var flush = false;
                var kids = new Array();
                var currentChild = o.node.firstChild;
                var blockKids = 0;
                while(currentChild != null){
                    var sib = currentChild.nextSibling;
                    var currentName = currentChild.nodeName.toLowerCase();
                    var sibName = sib ? sib.nodeName.toLowerCase() : null;
                    if(currentChild.nodeType == 3 || !dom.isBlock(currentChild) && currentName != "br"){
                        //currentChild is text or non-block, non-br element
                        if(sib && sibName == "p" && sib.innerHTML.length == 0){
                            //remove empty p tags
                            sib.parentNode.removeChild(sib);
                        }else if(sib && sibName == "br"){
                            //remove breaks and force a new P tag
                            sib.parentNode.removeChild(sib);
                            flush = true;
                        }
                        kids.push(currentChild);
                    }else if(currentName == "br"){
                        var p = dom.create("p");
                        currentChild.parentNode.insertBefore(p, currentChild);
                        p.appendChild(currentChild);
                        currentChild = p;
                        ++blockKids;
                    }
                    if(sib && sib.nodeType == 1 && dom.isBlock(sib) || flush){
                        if(kids.length){
                            var p = kids[0].ownerDocument.createElement("p");
                            o.node.insertBefore(p, kids[0]);
                            do{
                                p.appendChild(kids.shift());
                            }while(kids.length);
                            currentChild = p;
                            ++blockKids;

                            kids = new Array();
                        }
                    }
                    flush = false;
                    currentChild = currentChild.nextSibling;
                }
                if(kids.length && blockKids > 0){
                    var p = kids[0].ownerDocument.createElement("p");
                    o.node.insertBefore(p, kids[0]);
                    do{
                        p.appendChild(kids.shift());
                    }while(kids.length);
                }
            }

            //only allow tbody and tr as direct children of table; pastes sometimes add other odd nodes here.
            each(dom.select('table', o.node), function(t) {
                var n = t.firstChild;
                while(n){
                    var c = n;
                    n = n.nextSibling;
                    if(c.nodeType != 1){
                        t.removeChild(c);
                    }else{
                        var name = c.nodeName.toLowerCase();
                        if(name != 'tbody' && name != 'tr'){
                            t.removeChild(c);
                        }
                    }
                }
            });

            //Apparently we need to be careful about bad dom structure in pasted tables
            function filterChildNodes(parent, validChildNameTest){
                var n = parent.firstChild;
                while(n){
                    var c = n;
                    n = n.nextSibling;
                    if(!validChildNameTest.test(c.nodeName)){
                        parent.removeChild(c);
                    }
                }
            }
            each(dom.select("tr", o.node), function(tr){
                filterChildNodes(tr, /t[hd]/i);
            });
            each(dom.select("tbody", o.node), function(tb){
                filterChildNodes(tb, /tr/i);
            });

            var childParas = dom.select("p p", o.node);
            each(childParas, function(childP){
                var parentP = dom.getParent(childP, "p", o.node);
                dom.split(parentP, childP);
            });

            // in FF, some attributes don't get copied over
            // during a copy/paste. this fixes that.
            // JIVE-599
            each(dom.select("a.jive_macro", o.node), function(macroElem){
                if(dom.getAttrib(macroElem, "href")){
                    dom.setAttrib(macroElem, "href", "javascript:;")
                }
                if(!dom.getAttrib(macroElem, "jivemacro")){
                    var classList = macroElem.className.split(/\s+/);
                    each(classList, function(item){
                        if (item.indexOf("jive_macro_") === 0) {
                           //do something
                            var macroType = item.substr("jive_macro_".length);
                            dom.setAttrib(macroElem, "jivemacro", macroType);
                        }
                    });
                }
            });

            if(ed.plugins.jiveimage){
                each(dom.select('img', o.node), function(img) {
                    dom.addClass(img, "jiveImage");
                    //find pasted images with dataURL src and run them through the uploader
                    if(/^(?:data|blob):/.test(img.src)){
                        //TODO: no one implements blob paste today, so I don't know if they'll make it through the scaler without violating the same origin policy
                        dom.addClass(img, "toUpload");
                        dom.setStyles(img, {
                            "max-width": "1200px",
                            "max-height": "900px"
                        });
                    }else if(/^(?:file|webkit-fake-url):/.test(img.src)){
                        //file URLs and webkit's fakes don't post right, so let's not tease the user
                        dom.remove(img);
                    }
                });
            }

            if(o.node.childNodes.length == 1 && o.node.firstChild.nodeName.toLowerCase() == "a") {
                var aTag = o.node.firstChild;
                if (!(dom.hasClass(aTag, "jive_macro") || dom.getAttrib(aTag, "jivemacro"))) {
                    var href = dom.getAttrib(aTag, "href");
                    var text = ed.convertURL(tinymce.trim(aTag.textContent));
                    //Sometimes, the href has been converted to a relative URL, so we suffix match
                    if (href == text || new RegExp(encodeURIComponent(href) + "$").test(encodeURIComponent(text))) {
                        dom.addClass(aTag, "loading");
                    }
                }
            }

            if(o.node.childNodes.length == 1 && o.node.firstChild.nodeName.toLowerCase() == "p"){
                dom.remove(o.node.firstChild, true);
            }

            ed.addVisual(o.node);
		},


        _fixOrphanLIs : function(pl, o){
            var dom = pl.editor.dom, listElm, li, lastMargin = -1, margin, levels = [], lastType, html;

            // Added this check for JIVE-3881
            if (pl.editor.selection.getNode().nodeName.toLowerCase() !== 'li') {
                // Convert middot lists into real semantic lists
                each(dom.select('li', o.node), function(li) {
                    if(li.parentNode.nodeName.toLowerCase() != "ul" &&
                            li.parentNode.nodeName.toLowerCase() != "ol"){
                        // :( the li is not a child of a ul or ol, likely b/c
                        // someone pasted a single list item in IE
                        var ul = li.ownerDocument.createElement("ul");
                        li.parentNode.insertBefore(ul, li);
                        ul.appendChild(li);
                    }
                });
            }
        },

        _removeNodes : function(pl, o){
			var dom = pl.editor.dom, listElm, li, lastMargin = -1, margin, levels = [], lastType, html;

			// Convert middot lists into real semantic lists
			each(dom.select('[jive-remove-tag=1]', o.node), function(remove_me) {
                if(remove_me.nodeType == 1){
                    while(remove_me.childNodes.length){
                        remove_me.parentNode.insertBefore(remove_me.childNodes[0], remove_me);
                    }
                    remove_me.parentNode.removeChild(remove_me);
                }
			});
		},

		/**
		 * Converts the most common bullet and number formats in Office into a real semantic UL/LI list.
		 */
		_convertLists : function(pl, o) {
			var dom = pl.editor.dom, listElm, li, lastMargin = -1, margin, levels = [], lastType, html;

            function createList(params) {
                var list  = dom.create(params.listType),
                    style = 'list-style-type: ' + params.subType;

                // IE doesn't allow you to set the style attribute on DOM elements
                // http://www.quirksmode.org/bugreports/archives/2005/03/setAttribute_does_not_work_in_IE_when_used_with_th.html
                if (tinymce.isIE) {
                    list.style.setAttribute('cssText', style);
                } else {
                    list.setAttribute('style', style);
                }

                return list;
            }

            function getParagraphMetaData(p) {
                //don't strip out all the markup here; we need to differentiate between actual content and the bullet text.
                var listInfoSpans = dom.select(".pasted-list-info", p);
                var text;
                if(listInfoSpans.length > 0){
                    text = listInfoSpans[0].textContent;
                }else{
                    text   = p.innerHTML.replace(/<\/?\w+[^>]*>/gi, '').replace(/&nbsp;/g, '\u00a0');
                }
                var result = {
                    // is a list item if the text:
                    //      contains __MCE_ITEM__
                    //          OR
                    //      begins with a number (eg: 1.)
                    //          OR
                    //      begins with the letter v followed by white space
                    //          OR
                    //      begins with a letter followed by a period
                    isListItem: /__MCE_ITEM__+/.test(text) || /^(\d)+\./.test(text) || /^v\s+/.test(text) || /^[a-z]+\./i.test(text)
                };

                var forceType = null;
                if(dom.select("span[jive-list-ol=1]", p).length){
                    forceType = "ol";
                }
                if(dom.select("span[jive-list-ul=1]", p).length){
                    forceType = "ul";
                }

                if (result.isListItem) {
                    var indicator = text.match(/^[^\s]+/)[0].replace(/^(?:__MCE_ITEM__)*/, '');
                        if(!result.subType ){
                            result.subType = (function() {
                                if(/^0\d/.test(indicator)){
                                    return "decimal-leading-zero";
                                }else if(/^\d/.test(indicator)){
                                    return "decimal";
                                }else if(/^[i]/.test(indicator)){
                                    return "lower-roman";
                                }else if(/^[I]/.test(indicator)){
                                    return "upper-roman";
                                }else if(/^v/.test(indicator) && (!forceType || forceType == "ul")){
                                    return "disc";
                                }else if(/^o/.test(indicator) && (!forceType || forceType == "ul")){
                                    return "circle";
                                }else if(/^[a-z]/.test(indicator)){
                                    return "lower-alpha";
                                }else if(/^[A-Z]/.test(indicator)){
                                    return "upper-alpha";
                                }else if(/^[\u03b1-\u03c8]/.test(indicator)){
                                    return "lower-greek";
                                }else{
                                    return "disc";
                                }
                        })();
                    }
                    result.listType = /disc|circle|square/.test(result.subType) ? "ul" : "ol";
                }

                return result;
            }


			// Convert middot lists into real semantic lists
			each(dom.select('p', o.node), function(p) {
				var sib, html, idx, parents, meta = getParagraphMetaData(p);

				// if type is set (ol or ul), this will be treated as a list item
				if (meta.isListItem) {
					var margin = parseFloat(p.getAttribute("jive-list-info") || 0);

					if (margin > lastMargin) {
						levels.push(margin);
                    }

					if (!listElm || (meta.listType != lastType && margin == lastMargin)) {
                        //
                        // start a new list if:
                        // 1) i dont' have a list started yet
                        // 2) the list is a different type + at the same list level
                        listElm = createList(meta);
						dom.insertAfter(listElm, p);
					} else {
						// Nested list element
						if (margin > lastMargin) {
                            // nested lists should not be nested inside ofthe <li>
                            // instead, they should be nested inside of <ul> or <ol>
                            //
                            // ex:
                            // <ul>
                            //     <li>item</li>
                            //     <ul>
                            //         <li>subitem</li>
                            //     </ul>
                            // </ul>
                            var oldListElm = listElm;
                            listElm = createList(meta);
							oldListElm.appendChild(listElm);
						} else if (margin < lastMargin) {
							// Find parent level based on margin value
							idx = tinymce.inArray(levels, margin);
							parents = dom.getParents(listElm.parentNode, "ol,ul");
							listElm = parents[parents.length - 1 - idx] || listElm;

                            if(listElm.nodeName.toLowerCase() == meta.listType){
                                // it's the correct list type
                            }else{
                                // it's the wrong list type
                                var oldListElm = listElm;
                                listElm = createList(meta);
						        dom.insertAfter(listElm, oldListElm);
                            }
						}
					}

					// Remove middot or number spans if they exists
                    each(dom.select(".pasted-list-info", p), function(elem){
                        dom.remove(elem);
                    });
					each(dom.select('span', p), function(span) {
                        if(span.childNodes.length == 0){
                            dom.remove(span);
                            return;
                        }

						var html = span.innerHTML.replace(/<\/?\w+[^>]*>/gi, '');

						// Remove span with the middot or the number
						if (meta.listType == 'ul' && /^.?\s*(&nbsp;|\u00a0)+\s*/.test(html)) {
							dom.remove(span);
                        } else if (/^__MCE_ITEM__[\s\S]*\w+[\.|\)|:]?(&nbsp;|\u00a0)+\s*/.test(html)) {
							dom.remove(span);
                        }
					});

                    if (/alpha$/.test(meta.subType)) {
                        p.innerHTML = p.innerHTML.replace(/^[a-z]+\.(\s|\u00a0|&nbsp;)+/i, '');
                    }

					html = p.innerHTML;

					// Remove middot/list items
					if (meta.listType == 'ul') {
						html = html.replace(/(__MCE_ITEM__)+.?\s*(&nbsp;|\u00a0|\u00b7)+\s*/, '');
                    } else {
						html = html.replace(/(__MCE_ITEM__)+\s*\w+[\.|\)|:]?(&nbsp;|\u00a0)+\s*/, '').replace(/^\d+\.(\s|\u00a0|&nbsp;)+/, '');
                        html = html.replace(/__MCE_ITEM__(\w)+\.\s?/, '')
                    }

					// Create li and add paragraph data into the new li
					li = listElm.appendChild(dom.create('li', 0, html));
					dom.remove(p);

					lastMargin = margin;
					lastType = meta.listType;
				} else {
					listElm = lastMargin = 0; // End list element
                }
			});

			html = o.node.innerHTML;
            // Remove any left over makers
            html = html.replace(/__MCE_ITEM__/g, '');
            // remove empty tags
            // and since some tags can contain only empty tags,
            // this needs to be looped so we can remove those
            // newly emptied tags
            do{
                var oldHTML = html;
                html = html.replace(/<(\w+)[^>]*?>\s*<\/[^>]*>/gi, "");
            }while(oldHTML != html);
            o.node.innerHTML = html;
		},

		/**
		 * This method will split the current block parent and insert the contents inside the split position.
		 * This logic can be improved so text nodes at the start/end remain in the start/end block elements
		 */
		_insertBlockContent : function(ed, dom, content) {
			var parentBlock, marker, sel = ed.selection, last, elm, vp, y, elmHeight, markerClass = "mce_paste_marker";

			function select(n) {
				var r;

				if (tinymce.isIE) {
					r = ed.getDoc().body.createTextRange();
                    try{
					    r.moveToElementText(n);
                    }catch(e){
                        try{
                            r.moveToElementText(n.parentNode);
                        }catch(e2){ /* die silently */ }
                    }
					r.collapse(false);
					r.select();
				} else {
					sel.select(n, 1);
					sel.collapse(false);
				}
			}

            function findMarker(className){
                var elems = dom.select("."+className);
                if(elems && elems.length > 0){
                    return elems[0];
                }
                return null;
            }

            function isEmptyListItem(li) {
                if(dom.isEmpty(li))
                    return true;

                var c = li.firstChild;
                while(c) {
                    if(c.nodeType == 1 && dom.isEmpty(c) && c.nodeName.toLowerCase() != "img") {
                        return true;
                    }
                    c = c.firstChild;
                }
                return false;
            }

            var isFrontOfLi = ed.selectionUtil.atStartOf(sel.getNode());

			// Insert a marker for the caret position
			this._insert('<span class="' + markerClass + '"></span>', 1);
			marker = findMarker(markerClass);
			parentBlock = dom.getParent(marker, 'p,h1,h2,h3,h4,h5,h6,ul,ol,th,td');

            // Adjust marker before/after LI when pasting into a LIST, as splitting can cause unnecessary LIs.
            if(ed.dom.getParent(sel.getNode(), 'li')) {
                var li = ed.dom.getParent(sel.getNode(), 'li');
                var l = ed.dom.getParent(li, "ol,ul");

                if(isFrontOfLi) {
                    l.insertBefore(marker, li);
                    parentBlock = l;
                } else if (ed.selectionUtil.atEndOf(li)) {
                    l.insertBefore(marker, li.nextSibling)
                    parentBlock = l;
                }

                // Effectively replace list item with block, if list item is empty.
                if(isEmptyListItem(li)) {
                    l.removeChild(li);
                }
            }

			// it's a parent block but not a table cell
			if (parentBlock && !/TD|TH/.test(parentBlock.nodeName)) {
				// Split parent block
				marker = dom.split(parentBlock, marker);
            }
            // Insert nodes before the marker
            each(dom.create('div', 0, content).childNodes, function(n) {
                last = n.cloneNode(true);
                marker.parentNode.insertBefore(last, marker);
            });

            // Move caret after marker
            select(last);

			// Remove marker if it's left
            each(dom.select("." + markerClass), function(n){
                dom.remove(n);
            });

			// Get element, position and height
			elm = sel.getStart();
			vp = dom.getViewPort(ed.getWin());
			y = ed.dom.getPos(elm).y;
			elmHeight = elm.clientHeight;

			// Is element within viewport if not then scroll it into view
            if (y < vp.y || y + elmHeight > vp.y + vp.h)
                ed.getWin().scrollTo(0, y < vp.y ? y : y - vp.h + elmHeight);
		},

		/**
		 * Inserts the specified contents at the caret position.
		 */
		_insert : function(h, skip_undo) {
			var ed = this.editor, r = ed.selection.getRng();

			// First delete the contents seems to work better on WebKit when the selection spans multiple list items or multiple table cells.
			if (!ed.selection.isCollapsed() && r.startContainer != r.endContainer)
				ed.getDoc().execCommand('Delete', false, null);

			ed.execCommand('mceInsertContent', false, h, {skip_undo : skip_undo});
		},

		/**
		 * Instead of the old plain text method which tried to re-create a paste operation, the
		 * new approach adds a plain text mode toggle switch that changes the behavior of paste.
		 * This function is passed the same input that the regular paste plugin produces.
		 * It performs additional scrubbing and produces (and inserts) the plain text.
		 * This approach leverages all of the great existing functionality in the paste
		 * plugin, and requires minimal changes to add the new functionality.
		 * Speednet - June 2009
		 */
		_insertPlainText : function(ed, dom, h) {
			var i, len, pos, rpos, node, breakElms, before, after,
				w = ed.getWin(),
				d = ed.getDoc(),
				sel = ed.selection,
				is = tinymce.is,
				inArray = tinymce.inArray,
				linebr = getParam(ed, "paste_text_linebreaktype"),
				rl = getParam(ed, "paste_text_replacements");

			function process(items) {
				each(items, function(v) {
					if (v.constructor == RegExp)
						h = h.replace(v, "");
					else
						h = h.replace(v[0], v[1]);
				});
			};

			if ((typeof(h) === "string") && (h.length > 0)) {
				if (!entities)
					entities = ("34,quot,38,amp,39,apos,60,lt,62,gt," + ed.serializer.settings.entities).split(",");

				// If HTML content with line-breaking tags, then remove all cr/lf chars because only tags will break a line
				if (/<(?:p|br|h[1-6]|ul|ol|dl|table|t[rdh]|div|blockquote|fieldset|pre|address|center)[^>]*>/i.test(h)) {
					process([
						/[\n\r]+/g
					]);
				} else {
					// Otherwise just get rid of carriage returns (only need linefeeds)
					process([
						/\r+/g
					]);
				}

				process([
					[/<\/(?:p|h[1-6]|ul|ol|dl|table|div|blockquote|fieldset|pre|address|center)>/gi, "\n\n"],		// Block tags get a blank line after them
					[/<br[^>]*>|<\/tr>/gi, "\n"],				// Single linebreak for <br /> tags and table rows
					[/<\/t[dh]>\s*<t[dh][^>]*>/gi, "\t"],		// Table cells get tabs betweem them
					/<[a-z!\/?][^>]*>/gi,						// Delete all remaining tags
					[/&nbsp;/gi, " "],							// Convert non-break spaces to regular spaces (remember, *plain text*)
					[
						// HTML entity
						/&(#\d+|[a-z0-9]{1,10});/gi,

						// Replace with actual character
						function(e, s) {
							if (s.charAt(0) === "#") {
								return String.fromCharCode(s.slice(1));
							}
							else {
								return ((e = inArray(entities, s)) > 0)? String.fromCharCode(entities[e-1]) : " ";
							}
						}
					],
					[/(?:(?!\n)\s)*(\n+)(?:(?!\n)\s)*/gi, "$1"],	// Cool little RegExp deletes whitespace around linebreak chars.
					[/\n{3,}/g, "\n\n"],							// Max. 2 consecutive linebreaks
					/^\s+|\s+$/g									// Trim the front & back
				]);

				h = dom.encode(h);

				// Delete any highlighted text before pasting
				if (!sel.isCollapsed()) {
					d.execCommand("Delete", false, null);
				}

				// Perform default or custom replacements
				if (is(rl, "array") || (is(rl, "array"))) {
					process(rl);
				}
				else if (is(rl, "string")) {
					process(new RegExp(rl, "gi"));
				}

				// Treat paragraphs as specified in the config
				if (linebr == "none") {
					process([
						[/\n+/g, " "]
					]);
				}
				else if (linebr == "br") {
					process([
						[/\n/g, "<br />"]
					]);
				}
				else {
					process([
						/^\s+|\s+$/g,
						[/\n\n/g, "</p><p>"],
						[/\n/g, "<br />"]
					]);
				}

				// This next piece of code handles the situation where we're pasting more than one paragraph of plain
				// text, and we are pasting the content into the middle of a block node in the editor.  The block
				// node gets split at the selection point into "Para A" and "Para B" (for the purposes of explaining).
				// The first paragraph of the pasted text is appended to "Para A", and the last paragraph of the
				// pasted text is prepended to "Para B".  Any other paragraphs of pasted text are placed between
				// "Para A" and "Para B".  This code solves a host of problems with the original plain text plugin and
				// now handles styles correctly.  (Pasting plain text into a styled paragraph is supposed to make the
				// plain text take the same style as the existing paragraph.)
				if ((pos = h.indexOf("</p><p>")) != -1) {
					rpos = h.lastIndexOf("</p><p>");
					node = sel.getNode();
					breakElms = [];		// Get list of elements to break

					do {
						if (node.nodeType == 1) {
							// Don't break tables and break at body
							if (node.nodeName == "TD" || node.nodeName == "BODY") {
								break;
							}

							breakElms[breakElms.length] = node;
						}
					} while (node = node.parentNode);

					// Are we in the middle of a block node?
					if (breakElms.length > 0) {
						before = h.substring(0, pos);
						after = "";

						for (i=0, len=breakElms.length; i<len; i++) {
							before += "</" + breakElms[i].nodeName.toLowerCase() + ">";
							after += "<" + breakElms[breakElms.length-i-1].nodeName.toLowerCase() + ">";
						}

						if (pos == rpos) {
							h = before + after + h.substring(pos+7);
						}
						else {
							h = before + h.substring(pos+4, rpos+4) + after + h.substring(rpos+7);
						}
					}
				}

				// Insert content at the caret, plus add a marker for repositioning the caret
				ed.execCommand("mceInsertRawHTML", false, h + '<span id="_plain_text_marker">&nbsp;</span>');

				// Reposition the caret to the marker, which was placed immediately after the inserted content.
				// Needs to be done asynchronously (in window.setTimeout) or else it doesn't work in all browsers.
				// The second part of the code scrolls the content up if the caret is positioned off-screen.
				// This is only necessary for WebKit browsers, but it doesn't hurt to use for all.
				window.setTimeout(function() {
					var marker = dom.get('_plain_text_marker'),
						elm, vp, y, elmHeight;

					sel.select(marker, false);
					d.execCommand("Delete", false, null);
					marker = null;

					// Get element, position and height
					elm = sel.getStart();
					vp = dom.getViewPort(w);
					y = dom.getPos(elm).y;
					elmHeight = elm.clientHeight;

					// Is element within viewport if not then scroll it into view
					if ((y < vp.y) || (y + elmHeight > vp.y + vp.h)) {
						d.body.scrollTop = y < vp.y ? y : y - vp.h + 25;
					}
				}, 0);
			}
		},

		/**
		 * This method will open the old style paste dialogs. Some users might want the old behavior but still use the new cleanup engine.
		 */
		_legacySupport : function() {
			var t = this, ed = t.editor;

			// Register command(s) for backwards compatibility
			ed.addCommand("mcePasteWord", function() {
				ed.windowManager.open({
					file: CS_RESOURCE_BASE_URL + "/resources/scripts/tiny_mce3/plugins/paste/pasteword.htm",
					width: parseInt(getParam(ed, "paste_dialog_width")),
					height: parseInt(getParam(ed, "paste_dialog_height")),
					inline: 1
				});
			});

			if (getParam(ed, "paste_text_use_dialog")) {
				ed.addCommand("mcePasteText", function() {
					ed.windowManager.open({
						file : t.url + "/pastetext.htm",
						width: parseInt(getParam(ed, "paste_dialog_width")),
						height: parseInt(getParam(ed, "paste_dialog_height")),
						inline : 1
					});
				});
			}

			// Register button for backwards compatibility
			ed.addButton("pasteword", {title : "paste.paste_word_desc", cmd : "mcePasteWord"});
		}
	});

	// Register plugin
	tinymce.PluginManager.add("paste", tinymce.plugins.PastePlugin);
})();
