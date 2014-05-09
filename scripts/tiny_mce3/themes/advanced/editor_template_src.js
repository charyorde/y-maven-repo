/**
 * $Id: editor_template_src.js 793 2008-04-10 17:32:40Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright � 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

var foo = (function() {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, extend = tinymce.extend, each = tinymce.each, Cookie = tinymce.util.Cookie, lastExtID, explode = tinymce.explode;

	// Tell it to load theme specific language pack(s)
	tinymce.ThemeManager.requireLangPack('advanced');

	tinymce.create('tinymce.themes.AdvancedTheme', {
		// Control name lookup, format: title, command
		controls : {
			bold : ['bold_desc', 'Bold'],
			italic : ['italic_desc', 'Italic'],
			underline : ['underline_desc', 'Underline'],
			strikethrough : ['striketrough_desc', 'Strikethrough'],
			justifyleft : ['justifyleft_desc', 'JustifyLeft'],
			justifycenter : ['justifycenter_desc', 'JustifyCenter'],
			justifyright : ['justifyright_desc', 'JustifyRight'],
			justifyfull : ['justifyfull_desc', 'JustifyFull'],
			bullist : ['bullist_desc', 'jiveInsertUnorderedList'],
			numlist : ['numlist_desc', 'jiveInsertOrderedList'],
			outdent : ['outdent_desc', 'mceOutdent'],
			indent : ['indent_desc', 'mceIndent'],
			cut : ['cut_desc', 'Cut'],
			copy : ['copy_desc', 'Copy'],
			paste : ['paste_desc', 'Paste'],
			link : ['link_desc', 'mceLink'],
			unlink : ['unlink_desc', 'unlink'],
			image : ['image_desc', 'mceImage'],
            undo : ['undo_desc', 'Undo'],
            redo : ['redo_desc', 'Redo'],
            sub : ['sub_desc', 'subscript'],
            sup : ['sup_desc', 'superscript'],
//			cleanup : ['cleanup_desc', 'mceCleanup'],
			code : ['code_desc', 'mceCodeEditor'],
			hr : ['hr_desc', 'InsertHorizontalRule'],
			removeformat : ['removeformat_desc', 'mceRemoveFullFormat'],
			forecolor : ['forecolor_desc', 'ForeColor'],
			forecolorpicker : ['forecolor_desc', 'mceForeColor'],
			backcolor : ['backcolor_desc', 'HiliteColor'],
			backcolorpicker : ['backcolor_desc', 'mceBackColor'],
			blockquote : ['blockquote_desc', 'mceBlockQuote']
		},

		stateControls : ['bold', 'italic', 'underline', 'strikethrough', 'bullist', 'numlist', 'justifyleft', 'justifycenter', 'justifyright', 'justifyfull', 'blockquote'],

        removeListsFromHelper : function(ed, pre, currNode, lastNode){
            // if it's the final node, quit
            var ret = false;
            if(currNode == null) return true;
            if(currNode == lastNode){
//                console.log(currNode.nodeType == 3 ? "text" : currNode.tagName);
                ret = true;
            }
            var doc = ed.getDoc();
            if(currNode.nodeType == 3 || currNode.nodeName.toLowerCase() != "ol" && currNode.nodeName.toLowerCase() != "ul"){ // text node
                pre.appendChild(currNode);
                return false;
            }
            // add all my children
            while(currNode.childNodes.length > 0){
                var node = currNode.childNodes[0];
                if(this.removeListsFromHelper(ed, pre, node, lastNode)){
                    if(currNode.nodeName.toLowerCase() == "ol" || currNode.nodeName.toLowerCase() == "ul") currNode.removeChild(node);
                    return true;
                }
                if(currNode.nodeName.toLowerCase() == "ol" || currNode.nodeName.toLowerCase() == "ul") currNode.removeChild(node);
            }
            if(this.shouldEndLine(currNode)){
                pre.appendChild(doc.createTextNode("\n"));
            }

            if(ret) return ret;

            // add my next sibling, if any
            if(currNode.nextSibling != null){
                if(this.removeListsFromHelper(ed, pre, currNode.nextSibling, lastNode)){
                    return true;
                }
            }
            return false;
        },

        getParentNode : function(ed, node){
            return (new tinymce.dom.DOMUtils(ed.getDoc())).getParent(node, function(x){ return x == ed.getBody() || x != node; });
        },

        removeListsFrom : function(ed, pre, currNode, lastNode){
            // if it's the final node, quit
            var ret = false;
            if(currNode == null) return true;
            if(currNode == lastNode){
                ret = true;
            }
            var doc = ed.getDoc();
            if(currNode.nodeType == 3 || currNode.nodeName.toLowerCase() != "ol" && currNode.nodeName.toLowerCase() != "ul"){ // text node
                pre.appendChild(currNode);
                return false;
            }
            // add all my children
            while(currNode.childNodes.length > 0){
                var node = currNode.childNodes[0];
                if(this.removeListsFromHelper(ed, pre, node, lastNode)){
                    if(currNode.nodeName.toLowerCase() == "ol" || currNode.nodeName.toLowerCase() == "ul") currNode.removeChild(node);
                    return true;
                }
                if(currNode.nodeName.toLowerCase() == "ol" || currNode.nodeName.toLowerCase() == "ul") currNode.removeChild(node);
            }
            if(this.shouldEndLine(currNode)){
                pre.appendChild(doc.createTextNode("\n"));
            }

            if(ret){
                if(currNode.nodeName.toLowerCase() == "ol" || currNode.nodeName.toLowerCase() == "ul"){
                    var par = this.getParentNode(ed, currNode);
                    par.removeChild(currNode);
                }
                return ret;
            }

            // add my next sibling, if any
            if(currNode.nextSibling != null){
                var next = currNode.nextSibling;
                if(currNode.nodeName.toLowerCase() == "ol" || currNode.nodeName.toLowerCase() == "ul"){
                    var par = this.getParentNode(ed, currNode);
                    par.removeChild(currNode);
                }
                if(this.removeListsFromHelper(ed, pre, next, lastNode)){
                    return true;
                }
            }
            // go up to my parent, and start adding again with my parent's next sibling
            var next = this.getNextSibling(ed, currNode);
            if(currNode.nodeName.toLowerCase() == "ol" || currNode.nodeName.toLowerCase() == "ul"){
                var par = this.getParentNode(ed, currNode);
                par.removeChild(currNode);
            }
            if(this.removeListsFrom(ed, pre, next, lastNode)){
                return true;
            }

            return false;
        },

        init : function(ed, url) {
			var t = this, s, v;

            // Register commands
			ed.addCommand('mceRemoveFullFormat', function() {
                if(!ed.selection.isCollapsed()){

                    /**
                     * code to remove list formatting - in process...
                    var sel = ed.selection;
                    var start = sel.getStart();
                    start = tinyMCE.activeEditor.plugins.jivemacros.getOldestNode(ed, sel.getNode(), start);

                    var par = tinyMCE.activeEditor.plugins.jivemacros.getParentNode(ed, start);
                    var end = sel.getEnd();
                    var pre = ed.getDoc().createElement('DIV');
                    par.insertBefore(pre, start);

                    ed.theme.removeListsFrom(ed, pre, start,end);

                    // now remove the div
                    for(var i=0;i<pre.childNodes.length;i++){
                        par.insertBefore(pre.childNodes[0], pre);
                    }
                    par.removeChild(pre);
                    */

                    ed.execCommand("RemoveFormat");
                    var n = ed.selection.getNode();
                    var p = ed.dom.getParent(n, "table");
                    if(p == null){
                        ed.execCommand("FormatBlock",false,"<p>");
                    }
                }
            });


            t.editor = ed;
			t.url = url;
            t.onResolveName = new tinymce.util.Dispatcher(this);
            t.onResize = new tinymce.util.Dispatcher(this);

			// Default settings
			t.settings = s = extend({
				theme_advanced_path : true,
				theme_advanced_toolbar_location : 'bottom',
				theme_advanced_blockformats : "p,address,pre,h1,h2,h3,h4,h5,h6",
				theme_advanced_toolbar_align : "center",
				theme_advanced_fonts : "Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats",
				theme_advanced_font_sizes : "1,2,3,4,5,6,7",
				theme_advanced_more_colors : 1,
				theme_advanced_row_height : 23,
				theme_advanced_resize_horizontal : 1,
				theme_advanced_resizing_use_cookie : 1
			}, ed.settings);

			if ((v = s.theme_advanced_path_location) && v != 'none')
				s.theme_advanced_statusbar_location = s.theme_advanced_path_location;

			if (s.theme_advanced_statusbar_location == 'none')
				s.theme_advanced_statusbar_location = 0;

			// Init editor
			ed.onInit.add(function() {
                ed.onNodeChange.add(t._nodeChanged, t);
                ed.onKeyDown.add(t._keyDown, t);
				jive.ext.x.xTimer.set("timeout",t, "_refreshFont", 33);
                jive.ext.x.xTimer.set("timeout",t, "_refreshFont", 500);
                jive.ext.x.xTimer.set("timeout",t, "_refreshFontColor", 33);
                jive.ext.x.xTimer.set("timeout",t, "_refreshFontColor", 500);
                jive.ext.x.xTimer.set("timeout",t, "_refreshFontSize", 33);
                jive.ext.x.xTimer.set("timeout",t, "_refreshFontSize", 500);

                //
                // IE does not register key commands
                // after starting a bulletted list.
                // we need to refocus the RTE after
                // CS-15305
                ed.addCommand('jiveInsertUnorderedList', function() {
                    ed.execCommand("mceInsertUnorderedList");
                    window.focus();
                    ed.focus();
                });
                ed.addCommand('jiveInsertOrderedList', function() {
                    ed.execCommand("mceInsertOrderedList");
                    window.focus();
                    ed.focus();
                });


                var c = ed.controlManager.get('fontsizeselect');
                if (c) {
                    var div = document.createElement('DIV');
                    var lo = [
                        "8 pt",
                        "10 pt",
                        "12 pt",
                        "14 pt",
                        "18 pt",
                        "24 pt",
                        "36 pt"
                    ], fz = [8, 10, 12, 14, 18, 24, 36];
                    c.computed = new Array();
                    document.body.appendChild(div);
                    each(explode(t.settings.theme_advanced_font_sizes), function(v) {
                        div.style.fontSize = fz[v - 1] + 'pt';
                        var computedValue = jive.ext.x.xGetCS(div, "font-size");
                        c.computed.push(computedValue);
                        c.add(lo[parseInt(v) - 1], v, {'style' : 'font-size:' + fz[v - 1] + 'pt', 'class' : 'mceFontSize' + v});
                    });
                    document.body.removeChild(div);

                    ed.onKeyUp.add(function(ed){
                        var cm = ed.controlManager;
                        cm.setActive('bold', ed.queryCommandState('Bold'));
                        cm.setActive('italic', ed.queryCommandState('Italic'));
                        cm.setActive('underline', ed.queryCommandState('Underline'));
                        cm.setActive('strikethrough', ed.queryCommandState('Strikethrough'));
                    })
                    ed.onBeforeExecCommand.add(function(ed, cmd, ui, val) {
                        var cm = ed.controlManager;
                        if(cmd == "Bold")          cm.get("bold").setActive(ed.queryCommandState('Bold'));
                        if(cmd == "Italic")        cm.get("italic").setActive(ed.queryCommandState('Italic'));
                        if(cmd == "Underline")     cm.get("underline").setActive(ed.queryCommandState('Underline'));
                        if(cmd == "Strikethrough") cm.get("strikethrough").setActive(ed.queryCommandState('Strikethrough'));
                        if(cmd == "mceOutdentComplete" || cmd == "mceIndentComplete"){
                            cm.setDisabled('outdent', !ed.queryCommandState('Outdent'));
                        }
                        if(cmd == "FontSize"){
                            // remove inline style size on all nodes in selection
                            // http://jira.jiveland.com/browse/CS-8010
                            if(!ed.selection.isCollapsed()){
                                var rng = ed.selection.getRng(true);
                                ed.plugins.jiveutil.walkDOMTree(rng.startContainer, rng.endContainer, function(node){
                                    // safari only works with inline style, not font tags...
                                    // so if we're safari, ignore this line
                                    if(!tinymce.isWebKit && node.style){
                                        node.style.fontSize = "";
                                    }
                                    if(node.nodeType == 1 && node.nodeName.toLowerCase() == "font" && node.getAttribute("size") != val){
                                        node.setAttribute("size", val);
                                    }
                                });
                            }
                        }
                    });
                }
            });

			ed.onSetProgressState.add(function(ed, b, ti) {
				var co, id = ed.id, tb;

				if (b) {
					t.progressTimer = setTimeout(function() {
						co = ed.getContainer();
						co = co.insertBefore(DOM.create('DIV', {style : 'position:relative'}), co.firstChild);
						tb = DOM.get(ed.id + '_tbl');

						DOM.add(co, 'div', {id : id + '_blocker', 'class' : 'mceBlocker', style : {width : tb.clientWidth + 2, height : tb.clientHeight + 2}});
						DOM.add(co, 'div', {id : id + '_progress', 'class' : 'mceProgress', style : {left : tb.clientWidth / 2, top : tb.clientHeight / 2}});
					}, ti || 0);
				} else {
					DOM.remove(id + '_blocker');
					DOM.remove(id + '_progress');
					clearTimeout(t.progressTimer);
				}
			});

            DOM.loadCSS(window.CS_RESOURCE_BASE_URL + "/" + (s.editor_css || "styles/tiny_mce3/themes/advanced/skins/" + ed.settings.skin + "/ui.css"));
            if(s.ui_css){
                DOM.loadCSS(s.ui_css);
            }
            DOM.loadCSS(window.CS_RESOURCE_BASE_URL + "/" + (s.editor_css || "styles/tiny_mce3/themes/advanced/skins/" + ed.settings.skin + "/content.css"));

			if (s.skin_variant)
				DOM.loadCSS(ed.baseURI.toAbsolute(s.editor_css || "themes/advanced/skins/" + ed.settings.skin + "/ui_" + s.skin_variant + ".css"));
		},

		createControl : function(n, cf) {
			var cd, c;

			if (c = cf.createControl(n))
				return c;

			switch (n) {
				case "styleselect":
					return this._createStyleSelect();

				case "formatselect":
					return this._createBlockFormats();

				case "fontselect":
					return this._createFontSelect();

				case "fontsizeselect":
					return this._createFontSizeSelect();

				case "forecolor":
					return this._createForeColorMenu();

				case "backcolor":
					return this._createBackColorMenu();
			}

			if ((cd = this.controls[n]))
				return cf.createButton(n, {title : "advanced." + cd[0], cmd : cd[1], ui : cd[2], value : cd[3]});
		},

		execCommand : function(cmd, ui, val) {
			var f = this['_' + cmd];

			if (f) {
				f.call(this, ui, val);
				return true;
			}

			return false;
		},

		_importClasses : function() {
			var ed = this.editor, c = ed.controlManager.get('styleselect');

			if (c.getLength() == 0) {
				each(ed.dom.getClasses(), function(o) {
					c.add(o['class'], o['class']);
				});
			}
		},

		_createStyleSelect : function(n) {
			var t = this, ed = t.editor, cf = ed.controlManager, c = cf.createListBox('styleselect', {
				title : 'advanced.style_select',
				onselect : function(v) {
					if (c.selectedValue === v) {
						ed.execCommand('mceSetStyleInfo', 0, {command : 'mceRemoveFullFormat'});
						c.select();
						return false;
					} else
						ed.execCommand('mceSetCSSClass', 0, v);
				}
			});

			if (c) {
				each(ed.getParam('theme_advanced_styles', '', 'hash'), function(v, k) {
					if (v)
						c.add(t.editor.translate(k), v);
				});

				c.onPostRender.add(function(ed, n) {
					Event.add(n, 'focus', t._importClasses, t);
					Event.add(n, 'mousedown', t._importClasses, t);
				});
			}

			return c;
		},

		_createFontSelect : function() {
			var c, t = this, ed = t.editor;

			c = ed.controlManager.createListBox('fontselect', {title : 'advanced.fontdefault', cmd : 'FontName'});
			if (c) {
				each(ed.getParam('theme_advanced_fonts', t.settings.theme_advanced_fonts, 'hash'), function(v, k) {
                    c.add(ed.translate(k), v.toLowerCase(), {style : v.indexOf('dings') == -1 ? 'font-family:' + v : ''});
				});
			}

			return c;
		},

		_createFontSizeSelect : function() {
            var  t = this, ed = t.editor;
			var c = ed.controlManager.createListBox('fontsizeselect', {title : 'advanced.font_size', cmd : 'FontSize'});

			return c;
		},

		_createBlockFormats : function() {
			var c, fmts = {
				p : 'advanced.paragraph',
				address : 'advanced.address',
				pre : 'advanced.pre',
				h1 : 'advanced.h1',
				h2 : 'advanced.h2',
				h3 : 'advanced.h3',
				h4 : 'advanced.h4',
				h5 : 'advanced.h5',
				h6 : 'advanced.h6',
				div : 'advanced.div',
				blockquote : 'advanced.blockquote',
				code : 'advanced.code',
				dt : 'advanced.dt',
				dd : 'advanced.dd',
				samp : 'advanced.samp'
			}, t = this;

			c = t.editor.controlManager.createListBox('formatselect', {title : 'advanced.block', cmd : 'FormatBlock'});
			if (c) {
				each(t.editor.getParam('theme_advanced_blockformats', t.settings.theme_advanced_blockformats, 'hash'), function(v, k) {
					c.add(t.editor.translate(k != v ? k : fmts[v]), v, {'class' : 'mce_formatPreview mce_' + v});
				});
			}

			return c;
		},

		_createForeColorMenu : function() {
			var c, _theme = this, s = _theme.settings, o = {}, v;

			if (s.theme_advanced_more_colors) {
				o.more_colors_func = function() {
					_theme._mceColorPicker(0, {
						color : c.value,
						func : function(co) {
                            c.setColor(co);
						}
					});
				};
			}

			if (v = s.theme_advanced_text_colors)
				o.colors = v;

			o.title = 'advanced.forecolor_desc';
			o.cmd = 'ForeColor';
			o.scope = this;

			c = _theme.editor.controlManager.createColorSplitButton('forecolor', o);
            c.oldSetColor = c.setColor;
            c.setColor = function(co){
                _theme.ignoreRefreshCommand = true;
                this.oldSetColor(co);
                _theme.ignoreRefreshCommand = false;
            }
            return c;
		},

		_createBackColorMenu : function() {
			var c, _theme = this, s = _theme.settings, o = {}, v;

			if (s.theme_advanced_more_colors) {
				o.more_colors_func = function() {
					_theme._mceColorPicker(0, {
						color : c.value,
						func : function(co) {
							c.setColor(co);
						}
					});
				};
			}

			if (v = s.theme_advanced_background_colors)
				o.colors = v;

			o.title = 'advanced.backcolor_desc';
			o.cmd = 'HiliteColor';
			o.scope = this;

			c = _theme.editor.controlManager.createColorSplitButton('backcolor', o);
            c.oldSetColor = c.setColor;
            c.setColor = function(co){
                _theme.ignoreRefreshCommand = true;
                this.oldSetColor(co);
                _theme.ignoreRefreshCommand = false;
            }

			return c;
		},

		renderUI : function(o) {
			var n, ic, tb, t = this, ed = t.editor, s = t.settings, sc, p, nl;

			n = p = DOM.create('span', {id : ed.id + '_parent', 'class' : 'mceEditor ' + ed.settings.skin + 'Skin' + (s.skin_variant ? ' ' + ed.settings.skin + 'Skin' + t._ufirst(s.skin_variant) : '')});

			if (!DOM.boxModel)
				n = DOM.add(n, 'div', {'class' : 'mceOldBoxModel'});

			n = sc = DOM.add(n, 'table', {id : ed.id + '_tbl', 'class' : 'mceLayout', cellSpacing : 0, cellPadding : 0});
			n = tb = DOM.add(n, 'tbody');

			switch ((s.theme_advanced_layout_manager || '').toLowerCase()) {
				case "rowlayout":
					ic = t._rowLayout(s, tb, o);
					break;

				case "customlayout":
					ic = ed.execCallback("theme_advanced_custom_layout", s, tb, o, p);
					break;

				default:
					ic = t._simpleLayout(s, tb, o, p);
			}

			n = o.targetNode;

			// Add classes to first and last TRs
			nl = DOM.stdMode ? sc.getElementsByTagName('tr') : sc.rows; // Quick fix for IE 8
			DOM.addClass(nl[0], 'mceFirst');
            DOM.addClass(nl[1], 'mceIframeRow');
			DOM.addClass(nl[nl.length - 1], 'mceLast');

			// Add classes to first and last TDs
			each(DOM.select('tr', tb), function(n) {
				DOM.addClass(n.firstChild, 'mceFirst');
				DOM.addClass(n.childNodes[n.childNodes.length - 1], 'mceLast');
			});

			if (DOM.get(s.theme_advanced_toolbar_container))
				DOM.get(s.theme_advanced_toolbar_container).appendChild(p);
			else
				DOM.insertAfter(p, n);

			Event.add(ed.id + '_path_row', 'click', function(e) {
				e = e.target;

				if (e.nodeName == 'A') {
					t._sel(e.className.replace(/^.*mcePath_([0-9]+).*$/, '$1'));

					return Event.cancel(e);
				}
			});
/*
			if (DOM.get(ed.id + '_path_row')) {
				Event.add(ed.id + '_tbl', 'mouseover', function(e) {
					var re;

					e = e.target;

					if (e.nodeName == 'SPAN' && DOM.hasClass(e.parentNode, 'mceButton')) {
						re = DOM.get(ed.id + '_path_row');
						t.lastPath = re.innerHTML;
						DOM.setHTML(re, e.parentNode.title);
					}
				});

				Event.add(ed.id + '_tbl', 'mouseout', function(e) {
					if (t.lastPath) {
						DOM.setHTML(ed.id + '_path_row', t.lastPath);
						t.lastPath = 0;
					}
				});
			}
*/

			if (!ed.getParam('accessibility_focus') || ed.getParam('tab_focus'))
				Event.add(DOM.add(p, 'a', {href : '#'}, '<!-- IE -->'), 'focus', function() {tinyMCE.get(ed.id).focus();});

			if (s.theme_advanced_toolbar_location == 'external')
				o.deltaHeight = 0;

			t.deltaHeight = o.deltaHeight;
			o.targetNode = null;

			return {
				iframeContainer : ic,
				editorContainer : ed.id + '_parent',
				sizeContainer : sc,
				deltaHeight : o.deltaHeight
			};
		},

		getInfo : function() {
			return {
				longname : 'Advanced theme',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			}
		},

		resizeBy : function(dw, dh) {
			var e = DOM.get(this.editor.id + '_tbl');

			this.resizeTo(e.clientWidth + dw, e.clientHeight + dh);
		},

		resizeTo : function(w, h) {
			var ed = this.editor, s = ed.settings, e = DOM.get(ed.id + '_tbl'), ifr = DOM.get(ed.id + '_ifr'), dh;

			// Boundery fix box
			w = Math.max(s.theme_advanced_resizing_min_width || 100, w);
			h = Math.max(s.theme_advanced_resizing_min_height || 100, h);
			w = Math.min(s.theme_advanced_resizing_max_width || 0xFFFF, w);
			h = Math.min(s.theme_advanced_resizing_max_height || 0xFFFF, h);

			// Calc difference between iframe and container
			dh = e.clientHeight - ifr.clientHeight;

			// Resize iframe and container
			DOM.setStyle(ifr, 'height', h - dh);
			DOM.setStyles(e, {width : w, height : h});
		},

		destroy : function() {
			var id = this.editor.id;

			Event.clear(id + '_resize');
			Event.clear(id + '_path_row');
			Event.clear(id + '_external_close');
		},

		// Internal functions

		_simpleLayout : function(s, tb, o, p) {
			var t = this, ed = t.editor, lo = s.theme_advanced_toolbar_location, sl = s.theme_advanced_statusbar_location, n, ic, etb, c;

			// Create toolbar container at top
			if (lo == 'top')
				t._addToolbars(tb, o);

			// Create external toolbar
			if (lo == 'external') {
				n = c = DOM.create('div', {style : 'position:relative'});
				n = DOM.add(n, 'div', {id : ed.id + '_external', 'class' : 'mceExternalToolbar'});
				DOM.add(n, 'a', {id : ed.id + '_external_close', href : 'javascript:;', 'class' : 'mceExternalClose'});
				n = DOM.add(n, 'table', {id : ed.id + '_tblext', cellSpacing : 0, cellPadding : 0});
				etb = DOM.add(n, 'tbody');

				if (p.firstChild.className == 'mceOldBoxModel')
					p.firstChild.appendChild(c);
				else
					p.insertBefore(c, p.firstChild);

				t._addToolbars(etb, o);

				ed.onMouseUp.add(function() {
					var e = DOM.get(ed.id + '_external');
					DOM.show(e);

					DOM.hide(lastExtID);

					var f = Event.add(ed.id + '_external_close', 'click', function() {
						DOM.hide(ed.id + '_external');
						Event.remove(ed.id + '_external_close', 'click', f);
					});

					DOM.show(e);
					DOM.setStyle(e, 'top', 0 - DOM.getRect(ed.id + '_tblext').h - 1);

					// Fixes IE rendering bug
					DOM.hide(e);
					DOM.show(e);
					e.style.filter = '';

					lastExtID = ed.id + '_external';

					e = null;
				});
			}

			if (sl == 'top')
				t._addStatusBar(tb, o);

			// Create iframe container
//			if (!s.theme_advanced_toolbar_container) {
				n = DOM.add(tb, 'tr');
				n = ic = DOM.add(n, 'td', {'class' : 'mceIframeContainer'});
//			}

			// Create toolbar container at bottom
			if (lo == 'bottom')
				t._addToolbars(tb, o);

			if (sl == 'bottom')
				t._addStatusBar(tb, o);

			return ic;
		},

		_rowLayout : function(s, tb, o) {
			var t = this, ed = t.editor, dc, da, cf = ed.controlManager, n, ic, to, a;

			dc = s.theme_advanced_containers_default_class || '';
			da = s.theme_advanced_containers_default_align || 'center';

			each(explode(s.theme_advanced_containers || ''), function(c, i) {
				var v = s['theme_advanced_container_' + c] || '';

				switch (c.toLowerCase()) {
					case 'mceeditor':
						n = DOM.add(tb, 'tr');
						n = ic = DOM.add(n, 'td', {'class' : 'mceIframeContainer'});
						break;

					case 'mceelementpath':
						t._addStatusBar(tb, o);
						break;

					default:
						a = s['theme_advanced_container_' + c + '_align'].toLowerCase();
						a = 'mce' + t._ufirst(a);

						n = DOM.add(DOM.add(tb, 'tr'), 'td', {
							'class' : 'mceToolbar ' + (s['theme_advanced_container_' + c + '_class'] || dc) + ' ' + a || da
						});

						to = cf.createToolbar("toolbar" + i);
						t._addControls(v, to);
						DOM.setHTML(n, to.renderHTML());
						o.deltaHeight -= s.theme_advanced_row_height;
				}
			});

			return ic;
		},

		_addControls : function(v, tb) {
			var t = this, s = t.settings, di, cf = t.editor.controlManager;

			if (s.theme_advanced_disable && !t._disabled) {
				di = {};

				each(explode(s.theme_advanced_disable), function(v) {
					di[v] = 1;
				});

				t._disabled = di;
			} else
				di = t._disabled;

			each(explode(v), function(n) {
				var c;

				if (di && di[n])
					return;

				// Compatiblity with 2.x
				if (n == 'tablecontrols') {
					each(["table","delete_table","|","row_props","cell_props","|","row_before","row_after","delete_row","|","col_before","col_after","delete_col","|","row_up","row_down","col_left","col_right","|","split_cells","merge_cells"], function(n) {
						n = t.createControl(n, cf);

						if (n)
							tb.add(n);
					});

					return;
				}

				c = t.createControl(n, cf);

				if (c)
					tb.add(c);
			});
		},

		_addToolbars : function(c, o) {
			var t = this, i, tb, ed = t.editor, s = t.settings, v, cf = ed.controlManager, di, n, h = [], a;

			a = s.theme_advanced_toolbar_align.toLowerCase();
			a = 'mce' + t._ufirst(a);

			n = DOM.add(DOM.add(c, 'tr'), 'td', {'class' : 'mceToolbar ' + a});

			if (!ed.getParam('accessibility_focus') || ed.getParam('tab_focus'))
				h.push(DOM.createHTML('a', {href : '#', onfocus : 'tinyMCE.get(\'' + ed.id + '\').focus();'}, '<!-- IE -->'));

			h.push(DOM.createHTML('a', {href : '#', accesskey : 'q', title : ed.getLang("advanced.toolbar_focus"), onclick: 'this.focus(); return false;', 'class': 'js-toolbarFocus'}, '<!-- IE -->'));

			// Create toolbar and add the controls
			for (i=1; (v = s['theme_advanced_buttons' + i]); i++) {
				tb = cf.createToolbar("toolbar" + i, {'class' : 'mceToolbarRow' + i});

				if (s['theme_advanced_buttons' + i + '_add'])
					v += ',' + s['theme_advanced_buttons' + i + '_add'];

				if (s['theme_advanced_buttons' + i + '_add_before'])
					v = s['theme_advanced_buttons' + i + '_add_before'] + ',' + v;

				t._addControls(v, tb);

				//n.appendChild(n = tb.render());
				h.push(tb.renderHTML());

				o.deltaHeight -= s.theme_advanced_row_height;
			}

			h.push(DOM.createHTML('a', {href : '#', accesskey : 'z', title : ed.getLang("advanced.toolbar_focus"), onfocus : 'tinyMCE.getInstanceById(\'' + ed.id + '\').focus();'}, '<!-- IE -->'));

            // DOM.setHTML runs the html through all kinds of cleanup
            // and since we know our HTMLis safe, just set it outright
            n.innerHTML = h.join('');
//			DOM.setHTML(n, h.join(''));
		},

		_addStatusBar : function(tb, o) {
			var n, t = this, ed = t.editor, s = t.settings, r, mf, me, td;

			n = DOM.add(tb, 'tr');
			n = td = DOM.add(n, 'td', {'class' : 'mceStatusbar'});
			n = DOM.add(n, 'div', {id : ed.id + '_path_row'});
			DOM.add(n, 'a', {href : '#', accesskey : 'x'});

			if (s.theme_advanced_resizing && !tinymce.isOldWebKit) {
				DOM.add(td, 'a', {id : ed.id + '_resize', href : 'javascript:;', onclick : "return false;", 'class' : 'mceResize', 'tabindex': '-1'});

				if (s.theme_advanced_resizing_use_cookie) {
					ed.onPostRender.add(function() {
						var o = Cookie.getHash("TinyMCE_" + ed.id + "_size"), c = DOM.get(ed.id + '_tbl');

						if (!o)
							return;

						if (s.theme_advanced_resize_horizontal)
							c.style.width = Math.max(10, o.cw) + 'px';

						c.style.height = Math.max(10, o.ch) + 'px';
						DOM.get(ed.id + '_ifr').style.height = Math.max(10, parseInt(o.ch) + t.deltaHeight) + 'px';
					});
				}

				ed.onPostRender.add(function() {
					Event.add(ed.id + '_resize', 'mousedown', function(e) {
						var c, p, w, h, n, pa;

						// Measure container
						c = DOM.get(ed.id + '_tbl');
						w = c.clientWidth;
						h = c.clientHeight;

						miw = s.theme_advanced_resizing_min_width || 100;
						mih = s.theme_advanced_resizing_min_height || 100;
						maw = s.theme_advanced_resizing_max_width || 0xFFFF;
						mah = s.theme_advanced_resizing_max_height || 0xFFFF;

						// Setup placeholder
						p = DOM.add(DOM.get(ed.id + '_parent'), 'div', {'class' : 'mcePlaceHolder'});
						DOM.setStyles(p, {width : w, height : h});

						// Replace with placeholder
						DOM.hide(c);
						DOM.show(p);

						// Create internal resize obj
						r = {
							x : e.screenX,
							y : e.screenY,
							w : w,
							h : h,
							dx : null,
							dy : null
						};

						// Start listening
						mf = Event.add(DOM.doc, 'mousemove', function(e) {
							var w, h;

							// Calc delta values
							r.dx = e.screenX - r.x;
							r.dy = e.screenY - r.y;

							// Boundery fix box
							w = Math.max(miw, r.w + r.dx);
							h = Math.max(mih, r.h + r.dy);
							w = Math.min(maw, w);
							h = Math.min(mah, h);

							// Resize placeholder
							if (s.theme_advanced_resize_horizontal)
								p.style.width = w + 'px';

							p.style.height = h + 'px';

							return Event.cancel(e);
						});

						me = Event.add(DOM.doc, 'mouseup', function(e) {
							var ifr;

							// Stop listening
							Event.remove(DOM.doc, 'mousemove', mf);
							Event.remove(DOM.doc, 'mouseup', me);

							c.style.display = '';
							DOM.remove(p);

							if (r.dx === null)
								return;

							ifr = DOM.get(ed.id + '_ifr');

							if (s.theme_advanced_resize_horizontal)
								c.style.width = Math.max(10, r.w + r.dx) + 'px';

							c.style.height = Math.max(10, r.h + r.dy) + 'px';
							ifr.style.height = Math.max(10, ifr.clientHeight + r.dy) + 'px';

							if (s.theme_advanced_resizing_use_cookie) {
								Cookie.setHash("TinyMCE_" + ed.id + "_size", {
									cw : r.w + r.dx,
									ch : r.h + r.dy
								});
							}

                            ed.theme.onResize.dispatch(ed.theme, true);
                        });

						return Event.cancel(e);
					});
				});
			}

			o.deltaHeight -= 21;
			n = tb = null;
		},

        _getCurrentNode : function(ed){
            var node = ed.selection.getNode();
            if(node == null || node == ed.getDoc()){
                if(ed.getBody().childNodes.length > 0){
                    return ed.getBody().childNodes[0];
                }else{
                    return null;
                }
            }
            return node;
        },

        ignoreRefreshCommand : false,

        _refreshFontColor : function(computedStyle){
            if(!this.ignoreRefreshCommand){
                var ed = tinyMCE.activeEditor;
                var preview = $j('[id="'+ ed.id + '_forecolor_preview"]', ed.getContainer());
                var color;
                if(preview.length > 0){
                    if(typeof(computedStyle) != "function"){
                        var node = this._getCurrentNode(ed);
                        color = jive.ext.x.xGetCS(node, "color");
                    }else{
                        color = computedStyle("color");
                    }
                    preview.css('background-color', color);
                    var cm = ed.controlManager;
                    cm.get('forecolor').value = color;
                }
            }
        },

        _refreshFont : function(computedStyle){
            var ed = tinyMCE.activeEditor;
            var cm = ed.controlManager;
            var c = cm.get('fontselect');
            var font;
            if(c){
                if(typeof(computedStyle) != "function"){
                    var node = this._getCurrentNode(ed);
                    font = jive.ext.x.xGetCS(node, "font-family");
                }else{
                    font = computedStyle("font-family");
                }
                if(font.indexOf(",") >= 0){
                    // the value is a list of fonts, like "arial,helvetica,sans-serif" which is what we want
                    c.select(font.toLowerCase());
                }else{
                    // the value is 1 font, like "arial", which is not what we want
                    var done = false;

                    // check to see if we have an exact match
                    each(ed.getParam('theme_advanced_fonts', this.settings.theme_advanced_fonts, 'hash'), function(v, k) {
                        if(!done){
                            var values = v.split(',');
                            if($j.inArray(font, values) == 0){
                                done = true;
                                c.select(v.toLowerCase());
                            }
                        }
                    });
                    if(done) return;

                    // it doesn't match an exact font name,
                    // check to see if it matches any of the secondary font
                    // choices
                    each(ed.getParam('theme_advanced_fonts', this.settings.theme_advanced_fonts, 'hash'), function(v, k) {
                        if(!done){
                            var values = v.split(',');
                            if($j.inArray(font, values) >= 0){
                                done = true;
                                c.select(v.toLowerCase());
                            }
                        }
                    });
                }
            }
        },

        _refreshFontSize : function(computedStyle){
            var ed = tinyMCE.activeEditor;
            var cm = ed.controlManager;
            var c = cm.get('fontsizeselect');
            var size;
            if(c){
                if(typeof(computedStyle) != "function"){
                    var node = this._getCurrentNode(ed);
                    size = jive.ext.x.xGetCS(node, "font-size");
                }else{
                    size = computedStyle("font-size");
                }
                //depending on browser, c.computed will be either an array of ints, or an array of strings.  But size's type will match.
                var index = tinyMCE.inArray(c.computed, size);
                c.select(index+1);
            }
        },

        _keyDown :function(ed, evt){
            if(evt.keyCode == 13){
                // user hit return key
            }
        },

        _nodeChanged : function(ed, cm, n, co) {
			var t = this, p, de = 0, v, c, s = t.settings;

			tinymce.each(t.stateControls, function(c) {
				cm.setActive(c, ed.queryCommandState(t.controls[c][1]));
			});

			cm.setActive('visualaid', ed.hasVisual);
			cm.setDisabled('undo', !ed.undoManager.hasUndo() && !ed.typing);
			cm.setDisabled('redo', !ed.undoManager.hasRedo());
			cm.setDisabled('outdent', !ed.queryCommandState('Outdent'));

			p = DOM.getParent(n, 'A');
			if (c = cm.get('link')) {
				if (!p || !p.name) {
					c.setDisabled(!p && co);
					c.setActive(!!p);
				}
			}

			if (c = cm.get('unlink')) {
				c.setDisabled(!p && co);
				c.setActive(!!p && !p.name);
			}

			if (c = cm.get('anchor')) {
				c.setActive(!!p && p.name);

				if (tinymce.isWebKit) {
					p = DOM.getParent(n, 'IMG');
					c.setActive(!!p && DOM.getAttrib(p, '_mce_name') == 'a');
				}
			}

			p = DOM.getParent(n, 'IMG');
			if (c = cm.get('image'))
				c.setActive(!!p && n.className.indexOf('mceItem') == -1);

			if (c = cm.get('styleselect')) {
				if (n.className) {
					t._importClasses();
					c.select(n.className);
				} else
					c.select();
			}

			if (c = cm.get('formatselect')) {
				p = DOM.getParent(n, DOM.isBlock);

				if (p)
					c.select(p.nodeName.toLowerCase());
			}

            var node = this._getCurrentNode(ed);
            var computedStyle = jive.ext.x.xGetCSFunc(node);

			if (c = cm.get('fontselect')){
				c.select(ed.queryCommandValue('FontName'));
                this._refreshFont(computedStyle);
            }

            if(c = cm.get('forecolor')){
                this._refreshFontColor(computedStyle);
            }

            if (c = cm.get('fontsizeselect')){
                this._refreshFontSize(computedStyle);
            }

            if (s.theme_advanced_path && s.theme_advanced_statusbar_location) {
				p = DOM.get(ed.id + '_path') || DOM.add(ed.id + '_path_row', 'span', {id : ed.id + '_path'});
				DOM.setHTML(p, '');

				ed.dom.getParent(n, function(n) {
					var na = n.nodeName.toLowerCase(), u, pi, ti = '';

					// Ignore non element and hidden elements
					if (n.nodeType != 1 || (DOM.hasClass(n, 'mceItemHidden') || DOM.hasClass(n, 'mceItemRemoved')))
						return;

					// Fake name
					if (v = DOM.getAttrib(n, '_mce_name'))
						na = v;

					// Handle prefix
					if (tinymce.isIE && n.scopeName !== 'HTML')
						na = n.scopeName + ':' + na;

					// Remove internal prefix
					na = na.replace(/mce\:/g, '');

					// Handle node name
					switch (na) {
						case 'b':
							na = 'strong';
							break;

						case 'i':
							na = 'em';
							break;

						case 'img':
							if (v = DOM.getAttrib(n, 'src'))
								ti += 'src: ' + v + ' ';

							break;

						case 'a':
							if (v = DOM.getAttrib(n, 'name')) {
								ti += 'name: ' + v + ' ';
								na += '#' + v;
							}

							if (v = DOM.getAttrib(n, 'href'))
								ti += 'href: ' + v + ' ';

							break;

						case 'font':
							if (s.convert_fonts_to_spans)
								na = 'span';

							if (v = DOM.getAttrib(n, 'face'))
								ti += 'font: ' + v + ' ';

							if (v = DOM.getAttrib(n, 'size'))
								ti += 'size: ' + v + ' ';

							if (v = DOM.getAttrib(n, 'color'))
								ti += 'color: ' + v + ' ';

							break;

						case 'span':
							if (v = DOM.getAttrib(n, 'style'))
								ti += 'style: ' + v + ' ';

							break;
					}

					if (v = DOM.getAttrib(n, 'id'))
						ti += 'id: ' + v + ' ';

					if (v = n.className) {
						v = v.replace(/(webkit-[\w\-]+|Apple-[\w\-]+|mceItem\w+|mceVisualAid)/g, '');

						if (v && v.indexOf('mceItem') == -1) {
							ti += 'class: ' + v + ' ';

							if (DOM.isBlock(n) || na == 'img' || na == 'span')
								na += '.' + v;
						}
					}

					na = na.replace(/(html:)/g, '');
					na = {name : na, node : n, title : ti};
					t.onResolveName.dispatch(t, na);
					ti = na.title;
					na = na.name;

					//u = "javascript:tinymce.EditorManager.get('" + ed.id + "').theme._sel('" + (de++) + "');";
					pi = DOM.create('a', {'href' : "javascript:;", onmousedown : "return false;", title : ti, 'class' : 'mcePath_' + (de++)}, na);

					if (p.hasChildNodes()) {
						p.insertBefore(DOM.doc.createTextNode(' \u00bb '), p.firstChild);
						p.insertBefore(pi, p.firstChild);
					} else
						p.appendChild(pi);
				}, ed.getBody());
			}

            this.prepForReturn = false;
        },

		// Commands gets called by execCommand

		_sel : function(v) {
			this.editor.execCommand('mceSelectNodeDepth', false, v);
		},

		_mceInsertAnchor : function(ui, v) {
			var ed = this.editor;

			ed.windowManager.open({
				url : tinymce.baseURL + '/themes/advanced/anchor.htm',
				width : 320 + parseInt(ed.getLang('advanced.anchor_delta_width', 0)),
				height : 90 + parseInt(ed.getLang('advanced.anchor_delta_height', 0)),
				inline : true
			}, {
				theme_url : this.url
			});
		},

		_mceCharMap : function() {
			var ed = this.editor;

			ed.windowManager.open({
				url : tinymce.baseURL + '/themes/advanced/charmap.htm',
				width : 550 + parseInt(ed.getLang('advanced.charmap_delta_width', 0)),
				height : 250 + parseInt(ed.getLang('advanced.charmap_delta_height', 0)),
				inline : true
			}, {
				theme_url : this.url
			});
		},

		_mceHelp : function() {
			var ed = this.editor;

			ed.windowManager.open({
				url : tinymce.baseURL + '/themes/advanced/about.htm',
				width : 480,
				height : 380,
				inline : true
			}, {
				theme_url : this.url
			});
		},

		_mceColorPicker : function(u, v) {
			var ed = this.editor;

			v = v || {};

			ed.windowManager.open({
				url : tinymce.baseURL + '/themes/advanced/color_picker.htm',
				width : 385 + parseInt(ed.getLang('advanced.colorpicker_delta_width', 0)),
				height : 260 + parseInt(ed.getLang('advanced.colorpicker_delta_height', 0)),
				close_previous : false,
				inline : true
			}, {
				input_color : v.color,
				func : v.func,
				theme_url : this.url,
                cs_resource_base_url : CS_RESOURCE_BASE_URL
			});
		},

		_mceCodeEditor : function(ui, val) {
			var ed = this.editor;

			ed.windowManager.open({
				url : tinymce.baseURL + '/themes/advanced/source_editor.htm',
				width : parseInt(ed.getParam("theme_advanced_source_editor_width", 720)),
				height : parseInt(ed.getParam("theme_advanced_source_editor_height", 580)),
				inline : true,
				resizable : true,
				maximizable : true
			}, {
				theme_url : this.url
			});
		},

		_mceImage : function(ui, val) {
			var ed = this.editor;

			// Internal image object like a flash placeholder
			if (ed.dom.getAttrib(ed.selection.getNode(), 'class').indexOf('mceItem') != -1)
				return;

			ed.windowManager.open({
				url : tinymce.baseURL + '/themes/advanced/image.htm',
				width : 355 + parseInt(ed.getLang('advanced.image_delta_width', 0)),
				height : 275 + parseInt(ed.getLang('advanced.image_delta_height', 0)),
				inline : true
			}, {
				theme_url : this.url
			});
		},

		_mceLink : function(ui, val) {
			var ed = this.editor;

			ed.windowManager.open({
				url : tinymce.baseURL + '/themes/advanced/link.htm',
				width : 310 + parseInt(ed.getLang('advanced.link_delta_width', 0)),
				height : 200 + parseInt(ed.getLang('advanced.link_delta_height', 0)),
				inline : true
			}, {
				theme_url : this.url
			});
		},

		_mceNewDocument : function() {
			var ed = this.editor;

			ed.windowManager.confirm('advanced.newdocument', function(s) {
				if (s)
					ed.execCommand('mceSetContent', false, '');
			});
		},

		_mceForeColor : function() {
			var t = this;

			this._mceColorPicker(0, {
				color: t.fgColor,
				func : function(co) {
					t.fgColor = co;
					t.editor.execCommand('ForeColor', false, co);
				}
			});
		},

		_mceBackColor : function() {
			var t = this;

			this._mceColorPicker(0, {
				color: t.bgColor,
				func : function(co) {
					t.bgColor = co;
					t.editor.execCommand('HiliteColor', false, co);
				}
			});
		},

		_ufirst : function(s) {
			return s.substring(0, 1).toUpperCase() + s.substring(1);
		}
	});

	tinymce.ThemeManager.add('advanced', tinymce.themes.AdvancedTheme);
}());
