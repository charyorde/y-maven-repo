/**
 * $Id: editor_plugin_src.js 776 2008-04-08 17:00:39Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright � 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var DOM = tinymce.DOM, Element = tinymce.dom.Element, Event = tinymce.dom.Event, each = tinymce.each, is = tinymce.is;

	tinymce.create('tinymce.plugins.InlinePopups', {
		init : function(ed, url) {
			// Replace window manager
			ed.onBeforeRenderUI.add(function() {
				ed.windowManager = new tinymce.InlineWindowManager(ed);
//                DOM.loadCSS(ed.baseURI.toAbsolute('plugins/inlinepopups/skins/' + (ed.settings.inlinepopups_skin || 'clearlooks2') + "/window.css"));
//               DOM.loadCSS(CS_RESOURCE_BASE_URL + '/styles/tiny_mce3/plugins/inlinepopups/skins/' + (ed.settings.inlinepopups_skin || 'clearlooks2') + "/window.css");
			});
		},

		getInfo : function() {
			return {
				longname : 'InlinePopups',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/inlinepopups',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	tinymce.create('tinymce.InlineWindowManager:tinymce.WindowManager', {
		InlineWindowManager : function(ed) {
			var t = this;

			t.parent(ed);
			t.zIndex = 300000;
			t.count = 0;
		},

        doc : null,

        open : function(f, p) {
			var t = this, id, opt = '', ed = t.editor, dw = 0, dh = 0, vp, po, mdf, clf, we, w, u;
            var offsetLeft=0, offsetTop = 0;
            var w = window;
            try{
                while(w.parent && w != w.parent && typeof(w.parent.jive) != "undefined"){
                    if(w.frameElement){
                        offsetLeft += jive.ext.x.xPageX(w.frameElement);
                        offsetTop += jive.ext.x.xPageY(w.frameElement);
                    }
                    w = w.parent;
                    w.editor = window.editor;
                    w.jiveRTE = window.jiveRTE;
                    w.tinymce = window.tinymce;
                    w.tinyMCE = window.tinyMCE;
                }
            }catch(e){ /* permission denied b/c jive is in an iframe probably */ }
            ed.plugins.inlinepopups.doc = w.document;

            var doc = ed.plugins.inlinepopups.doc;
            var dom = new tinymce.dom.DOMUtils(doc);

            if(!$def(ed.plugins.inlinepopups.overlay)){
                var d = doc.createElement('DIV');
                d.className = "overlay";
                d.setAttribute("class","overlay");
                doc.body.appendChild(d);
                ed.plugins.inlinepopups.overlay = d;
                jive.ext.x.xAddEventListener(d, "click", function(){
                    var editors = window.editor.toArray(function(ed){ return $def(ed.closeAllDialogs); });
                    for(var i=0;i<editors.length;i++){
                        editors[i].closeAllDialogs();
                    }
                })
            }


            f = f || {};
			p = p || {};

			// Run native windows
			if (!f.inline)
				return t.parent(f, p);

			// Only store selection if the type is a normal window
			if (!f.type)
				t.bookmark = ed.selection.getBookmark('simple');

			id = dom.uniqueId() + Math.round(Math.random()*10000000);
			vp = dom.getViewPort();
			f.width = parseInt(f.width || 320);
			f.height = parseInt(f.height || 240);
			f.min_width = parseInt(f.min_width || 150);
			f.min_height = parseInt(f.min_height || 100);
			f.max_width = parseInt(f.max_width || 2000);
			f.max_height = parseInt(f.max_height || 2000);
			f.left = f.left || Math.round(Math.max(vp.x, vp.x + (vp.w / 2.0) - (f.width / 2.0)));
			f.top = f.top || Math.round(Math.max(vp.y, vp.y + (vp.h / 2.0) - (f.height / 2.0)));
            f.left += offsetLeft;
            f.top += offsetTop;
            f.movable = f.resizable = true;
			p.mce_width = f.width;
			p.mce_height = f.height;
			p.mce_inline = true;
			p.mce_window_id = id;
			p.mce_auto_focus = f.auto_focus;

			// Transpose
//			po = DOM.getPos(ed.getContainer());
//			f.left -= po.x;
//			f.top -= po.y;

			t.features = f;
			t.params = p;
			t.onOpen.dispatch(t, f, p);

			if (f.type) {
				opt += ' mceModal';

				if (f.type)
					opt += ' mce' + f.type.substring(0, 1).toUpperCase() + f.type.substring(1);

				f.resizable = false;
			}

			if (f.statusbar)
				opt += ' mceStatusbar';

			if (f.resizable)
				opt += ' mceResizable';

			if (f.minimizable)
				opt += ' mceMinimizable';

			if (f.maximizable)
				opt += ' mceMaximizable';

			if (f.movable)
				opt += ' mceMovable';

			// Create DOM objects
			t._addAll(doc.body,
				['div', {id : id, 'class' : ed.settings.inlinepopups_skin || 'clearlooks2', style : 'width:100px;height:100px'},
					['div', {id : id + '_wrapper', 'class' : 'mceWrapper' + opt},
						['div', {id : id + '_top', 'class' : 'mceTop'},
							['div', {'class' : 'mceLeft'}],
							['div', {'class' : 'mceCenter'}],
							['div', {'class' : 'mceRight'}],
							['span', {id : id + '_title'}, f.title || '']
						],

						['div', {id : id + '_middle', 'class' : 'mceMiddle'},
							['div', {id : id + '_left', 'class' : 'mceLeft'}],
							['span', {id : id + '_content','class' : 'mceMessage j-rc3'}],
							['div', {id : id + '_right', 'class' : 'mceRight'}]
						],

						['div', {id : id + '_bottom', 'class' : 'mceBottom'},
							['div', {'class' : 'mceLeft'}],
							['div', {'class' : 'mceCenter'}],
							['div', {'class' : 'mceRight'}],
							['span', {id : id + '_status'}, 'Content']
						],

						['a', {'class' : 'mceMove', tabindex : '-1', href : 'javascript:;'}],
						['a', {'class' : 'mceMin', tabindex : '-1', href : 'javascript:;', onmousedown : 'return false;'}],
						['a', {'class' : 'mceMax', tabindex : '-1', href : 'javascript:;', onmousedown : 'return false;'}],
						['a', {'class' : 'mceMed', tabindex : '-1', href : 'javascript:;', onmousedown : 'return false;'}],
						['a', {'class' : 'mceClose j-ui-elem', tabindex : '-1', href : 'javascript:;', onmousedown : 'return false;'}],
						['a', {id : id + '_resize_n', 'class' : 'mceResize mceResizeN', tabindex : '-1', href : 'javascript:;'}],
						['a', {id : id + '_resize_s', 'class' : 'mceResize mceResizeS', tabindex : '-1', href : 'javascript:;'}],
						['a', {id : id + '_resize_w', 'class' : 'mceResize mceResizeW', tabindex : '-1', href : 'javascript:;'}],
						['a', {id : id + '_resize_e', 'class' : 'mceResize mceResizeE', tabindex : '-1', href : 'javascript:;'}],
						['a', {id : id + '_resize_nw', 'class' : 'mceResize mceResizeNW', tabindex : '-1', href : 'javascript:;'}],
						['a', {id : id + '_resize_ne', 'class' : 'mceResize mceResizeNE', tabindex : '-1', href : 'javascript:;'}],
						['a', {id : id + '_resize_sw', 'class' : 'mceResize mceResizeSW', tabindex : '-1', href : 'javascript:;'}],
						['a', {id : id + '_resize_se', 'class' : 'mceResize mceResizeSE', tabindex : '-1', href : 'javascript:;'}]
					]
				]
			);

			dom.setStyles(id, {top : -10000, left : -10000});

			// Fix gecko rendering bug, where the editors iframe messed with window contents
			if (tinymce.isGecko)
				dom.setStyle(id, 'overflow', 'auto');

			// Measure borders
			if (!f.type) {
				dw += dom.get(id + '_left').clientWidth;
				dw += dom.get(id + '_right').clientWidth;
				dh += dom.get(id + '_top').clientHeight;
				dh += dom.get(id + '_bottom').clientHeight;
			}

			// Resize window
			dom.setStyles(id, {top : f.top, left : f.left, width : f.width + dw, height : f.height + dh});

			u = f.url || f.file;
			if (u) {
				if (tinymce.relaxedDomain)
					u += (u.indexOf('?') == -1 ? '?' : '&') + 'mce_rdomain=' + tinymce.relaxedDomain;

				u = tinymce._addVer(u);
			}

			if (!f.type) {
				dom.add(id + '_content', 'iframe', {id : id + '_ifr', src : 'javascript:""', frameBorder : 0, style : 'border:0;width:10px;height:10px'});
				dom.setStyles(id + '_ifr', {width : f.width, height : f.height});
				dom.setAttrib(id + '_ifr', 'src', u);
			} else {
                var ele = dom.get(id +'_wrapper');
                t._addAll(ele, ['input', {id : id + '_ok', 'class' : 'mceOk', value : 'OK', type :'button'}]);

				if (f.type == 'confirm')
					dom.add(id + '_wrapper', 'input', {'class' : 'mceCancel', value : 'Cancel', type :'button'});

				dom.add(id + '_middle', 'div', {'class' : 'mceIcon'});
				dom.setHTML(id + '_content', f.content.replace('\n', '<br />'));
			}

			// Register events
			mdf = Event.add(id, 'mousedown', function(e) {
				var n = e.target, w, vp;

				w = t.windows[id];
				t.focus(id);

				if (n.nodeName.toLowerCase() == 'a' || n.nodeName.toLowerCase() == 'input') {
                    if (n.className == 'mceClose j-ui-elem') {
                        t.close(null, id);
                        return Event.cancel(e);
                    }else if (n.className == 'mceOk' || n.className == 'mceCancel') {
                        f.button_func(n.className == 'mceOk');
                        return Event.cancel(e);
                    }else if (n.className == 'mceMax') {
						w.oldPos = w.element.getXY();
						w.oldSize = w.element.getSize();

						vp = dom.getViewPort();

						// Reduce viewport size to avoid scrollbars
						vp.w -= 2;
						vp.h -= 2;

						w.element.moveTo(vp.x, vp.y);
						w.element.resizeTo(vp.w, vp.h);
						dom.setStyles(id + '_ifr', {width : vp.w - w.deltaWidth, height : vp.h - w.deltaHeight});
						dom.addClass(id + '_wrapper', 'mceMaximized');
					} else if (n.className == 'mceMed') {
						// Reset to old size
						w.element.moveTo(w.oldPos.x, w.oldPos.y);
						w.element.resizeTo(w.oldSize.w, w.oldSize.h);
						w.iframeElement.resizeTo(w.oldSize.w - w.deltaWidth, w.oldSize.h - w.deltaHeight);

						dom.removeClass(id + '_wrapper', 'mceMaximized');
					} else if (n.className == 'mceMove')
						return t._startDrag(id, e, n.className);
					else if (dom.hasClass(n, 'mceResize'))
						return t._startDrag(id, e, n.className.substring(13));
				}
			});

            clf = function(e){
                var n = e.target || e.srcElement;
                if($def(n) && n){
                    t.focus(id);
                    if (n.nodeName == 'INPUT' || n.nodeName == 'input' || n.nodeName == 'A' || n.nodeName == 'a') {
                        switch (n.className) {
                            case 'mceClose j-ui-elem':
                                    var editors = window.editor.toArray(function(ed){ return $def(ed.closeAllDialogs); });
                                    for(var i=0;i<editors.length;i++){
                                        editors[i].closeAllDialogs();
                                    }
//                                t.close(null, id);
                                return Event.cancel(e);

                            case 'mceOk':
                            case 'mceCancel':
                                f.button_func(n.className == 'mceOk');
                                return Event.cancel(e);
                        }
                    }
                }
            };

            dom.bind(id, "click", clf);

			// Add window
			t.windows = t.windows || {};
			w = t.windows[id] = {
				id : id,
				mousedown_func : mdf,
				click_func : clf,
				element : new Element(id, {blocker : 1, container : ed.getContainer()}),
				iframeElement : new Element(id + '_ifr'),
				features : f,
				deltaWidth : dw,
				deltaHeight : dh
			};

			w.iframeElement.on('focus', function() {
				t.focus(id);
			});

			// Setup blocker
			if (t.count == 0 && t.editor.getParam('dialog_type') == 'modal') {
				dom.add(dom.doc.body, 'div', {
					id : 'mceModalBlocker',
					'class' : (t.editor.settings.inlinepopups_skin || 'clearlooks2') + '_modalBlocker',
					style : {left : vp.x, top : vp.y, zIndex : t.zIndex - 1}
				});

				dom.show('mceModalBlocker'); // Reduces flicker in IE
			} else
				dom.setStyle('mceModalBlocker', 'z-index', t.zIndex - 1);

			t.focus(id);
			t._fixIELayout(id, 1);

			// Focus ok button
			if (dom.get(id + '_ok'))
				dom.get(id + '_ok').focus();

			t.count++;

            ed.plugins.inlinepopups.overlay.style.height = jive.ext.x.xDocHeight(doc) + "px";
            ed.plugins.inlinepopups.overlay.style.display = "block";

            return w;
		},

		focus : function(id) {
            var ed = tinyMCE.activeEditor;
            if(ed.plugins.inlinepopups.doc == null){
                var w = window;
                while(w.parent && w != w.parent){
                    w = w.parent;
                    if(!$def(w.tinymce)){
                        w.tinymce = window.tinymce;
                        w.tinyMCE = window.tinyMCE;
                    }
                }
                ed.plugins.inlinepopups.doc = w.document;
            }

            var t = this, w = t.windows[id], doc = tinyMCE.activeEditor.plugins.inlinepopups.doc, dom = new tinymce.dom.DOMUtils(doc);

            if($def(w) && w){
                w.zIndex = this.zIndex++;
                w.element.setStyle('zIndex', w.zIndex);
                w.element.update();
            }

			id = id + '_wrapper';
			dom.removeClass(t.lastId, 'mceFocus');
			dom.addClass(id, 'mceFocus');
			t.lastId = id;
		},

		_addAll : function(te, ne) {
			var i, n, t = this, doc = tinyMCE.activeEditor.plugins.inlinepopups.doc, dom = new tinymce.dom.DOMUtils(doc);

			if (is(ne, 'string'))
				te.appendChild(dom.doc.createTextNode(ne));
			else if (ne.length) {
				te = te.appendChild(dom.create(ne[0], ne[1]));

				for (i=2; i<ne.length; i++)
					t._addAll(te, ne[i]);
			}
		},

		_startDrag : function(id, se, ac) {
			var t = this, mu, mm, doc = tinyMCE.activeEditor.plugins.inlinepopups.doc, dom = new tinymce.dom.DOMUtils(doc);
            var eb, w = t.windows[id], we = w.element, sp = we.getXY(), p, sz, ph, cp, vp, sx, sy, sex, sey, dx, dy, dw, dh;

			// Get positons and sizes
//			cp = DOM.getPos(t.editor.getContainer());
			cp = {x : 0, y : 0};
			vp = dom.getViewPort();

			// Reduce viewport size to avoid scrollbars while dragging
			vp.w -= 2;
			vp.h -= 2;

			sex = se.screenX;
			sey = se.screenY;
			dx = dy = dw = dh = 0;

			// Handle mouse up
			mu = Event.add(doc, 'mouseup', function(e) {
				Event.remove(doc, 'mouseup', mu);
				Event.remove(doc, 'mousemove', mm);

				if (eb)
					eb.remove();

				we.moveBy(dx, dy);
				we.resizeBy(dw, dh);
				sz = we.getSize();
				dom.setStyles(id + '_ifr', {width : sz.w - w.deltaWidth, height : sz.h - w.deltaHeight});
				t._fixIELayout(id, 1);

				return Event.cancel(e);
			});

			if (ac != 'Move')
				startMove();

			function startMove() {
                var doc = tinyMCE.activeEditor.plugins.inlinepopups.doc, dom = new tinymce.dom.DOMUtils(doc);
                if (eb)
					return;

				t._fixIELayout(id, 0);

				// Setup event blocker
				dom.add(d.body, 'div', {
					id : 'mceEventBlocker',
					'class' : 'mceEventBlocker ' + (t.editor.settings.inlinepopups_skin || 'clearlooks2'),
					style : {left : vp.x, top : vp.y, zIndex : t.zIndex + 1}
				});
				eb = new Element('mceEventBlocker');
				eb.update();

				// Setup placeholder
				p = we.getXY();
				sz = we.getSize();
				sx = cp.x + p.x - vp.x;
				sy = cp.y + p.y - vp.y;
				dom.add(eb.get(), 'div', {id : 'mcePlaceHolder', 'class' : 'mcePlaceHolder', style : {left : sx, top : sy, width : sz.w, height : sz.h}});
				ph = new Element('mcePlaceHolder');
			};

			// Handle mouse move/drag
			mm = Event.add(d, 'mousemove', function(e) {
				var x, y, v;

				startMove();

				x = e.screenX - sex;
				y = e.screenY - sey;

				switch (ac) {
					case 'ResizeW':
						dx = x;
						dw = 0 - x;
						break;

					case 'ResizeE':
						dw = x;
						break;

					case 'ResizeN':
					case 'ResizeNW':
					case 'ResizeNE':
						if (ac == "ResizeNW") {
							dx = x;
							dw = 0 - x;
						} else if (ac == "ResizeNE")
							dw = x;

						dy = y;
						dh = 0 - y;
						break;

					case 'ResizeS':
					case 'ResizeSW':
					case 'ResizeSE':
						if (ac == "ResizeSW") {
							dx = x;
							dw = 0 - x;
						} else if (ac == "ResizeSE")
							dw = x;

						dh = y;
						break;

					case 'mceMove':
						dx = x;
						dy = y;
						break;
				}

				// Boundary check
				if (dw < (v = w.features.min_width - sz.w)) {
					if (dx !== 0)
						dx += dw - v;

					dw = v;
				}
	
				if (dh < (v = w.features.min_height - sz.h)) {
					if (dy !== 0)
						dy += dh - v;

					dh = v;
				}

				dw = Math.min(dw, w.features.max_width - sz.w);
				dh = Math.min(dh, w.features.max_height - sz.h);
				dx = Math.max(dx, vp.x - (sx + vp.x));
				dy = Math.max(dy, vp.y - (sy + vp.y));
				dx = Math.min(dx, (vp.w + vp.x) - (sx + sz.w + vp.x));
				dy = Math.min(dy, (vp.h + vp.y) - (sy + sz.h + vp.y));

				// Move if needed
				if (dx + dy !== 0) {
					if (sx + dx < 0)
						dx = 0;
	
					if (sy + dy < 0)
						dy = 0;

					ph.moveTo(sx + dx, sy + dy);
				}

				// Resize if needed
				if (dw + dh !== 0)
					ph.resizeTo(sz.w + dw, sz.h + dh);

				return Event.cancel(e);
			});

			return Event.cancel(se);
		},

		resizeBy : function(dw, dh, id) {
			var w = this.windows[id];

			if (w) {
				w.element.resizeBy(dw, dh);
				w.iframeElement.resizeBy(dw, dh);
			}
		},

		close : function(win, id) {
            setTimeout(function(win, id, t){
                return function(){
                    var doc = tinyMCE.activeEditor.plugins.inlinepopups.doc, dom = new tinymce.dom.DOMUtils(doc);
                    var w, ix = 0, fw;

                    t.count--;

                    if (t.count == 0)
                        dom.remove('mceModalBlocker');

                    // Probably not inline
                    if (!id && win) {
                        t.parent(win);
                        return;
                    }

                    if (w = t.windows[id]) {
                        tinyMCE.activeEditor.plugins.inlinepopups.overlay.style.display = "none";
                        t.onClose.dispatch(t);
                        Event.remove(doc, 'mousedown', w.mousedownFunc);
                        Event.remove(doc, 'click', w.clickFunc);
                        Event.clear(id);
                        Event.clear(id + '_ifr');

                        dom.setAttrib(id + '_ifr', 'src', 'javascript:""'); // Prevent leak
                        var ele = doc.getElementById(w.id);
                        try{
                            w.element.remove();
                            ele.parentNode.removeChild(ele);
                        }catch(e){ }

                        delete t.windows[id];
                    }else{
                        // console.log("can't close the window.")
                    }
                    tinyMCE.activeEditor.focus();
                    tinyMCE.activeEditor.undoManager.add();
                }
            }(win, id, this), 33);
		},

		setTitle : function(ti, id) {
            var doc = tinyMCE.activeEditor.plugins.inlinepopups.doc, dom = new tinymce.dom.DOMUtils(doc);
			var e;

			if (e = dom.get(id + '_title'))
				e.innerHTML = dom.encode(ti);
		},

		alert : function(txt, cb, s) {
            var ed = tinyMCE.activeEditor;
            if(ed.plugins.inlinepopups.doc == null){
                var w = window;
                while(w.parent && w != w.parent){
                    w = w.parent;
                    if(!$def(w.tinymce)){
                        w.tinymce = window.tinymce;
                        w.tinyMCE = window.tinyMCE;
                    }
                }
                ed.plugins.inlinepopups.doc = w.document;
            }


            var doc = tinyMCE.activeEditor.plugins.inlinepopups.doc, dom = new tinymce.dom.DOMUtils(doc);
			var t = this, w;

			w = t.open({
				title : t,
				type : 'alert',
				button_func : function(s) {
					if (cb)
						cb.call(s || t, s);

					t.close(null, w.id);
				},
				content : dom.encode(t.editor.getLang(txt, txt)),
				inline : 1,
				width : 400,
				height : 130
			});
		},

		confirm : function(txt, cb, s) {
            var ed = tinyMCE.activeEditor;
            if(ed.plugins.inlinepopups.doc == null){
                var w = window;
                while(w.parent && w != w.parent){
                    w = w.parent;
                    if(!$def(w.tinymce)){
                        w.tinymce = window.tinymce;
                        w.tinyMCE = window.tinyMCE;
                    }
                }
                ed.plugins.inlinepopups.doc = w.document;
            }


            var doc = tinyMCE.activeEditor.plugins.inlinepopups.doc, dom = new tinymce.dom.DOMUtils(doc);
			var t = this, w;

			w = t.open({
				title : t,
				type : 'confirm',
				button_func : function(s) {
					if (cb)
						cb.call(s || t, s);

					t.close(null, w.id);
				},
				content : dom.encode(t.editor.getLang(txt, txt)),
				inline : 1,
				width : 400,
				height : 130
			});
		},

		// Internal functions

		_fixIELayout : function(id, s) {
            var doc = tinyMCE.activeEditor.plugins.inlinepopups.doc, dom = new tinymce.dom.DOMUtils(doc);
			var w, img;

			if (!tinymce.isIE6)
				return;

			// Fixes the bug where hover flickers and does odd things in IE6
			each(['n','s','w','e','nw','ne','sw','se'], function(v) {
				var e = dom.get(id + '_resize_' + v);

				dom.setStyles(e, {
					width : s ? e.clientWidth : '',
					height : s ? e.clientHeight : '',
					cursor : dom.getStyle(e, 'cursor', 1)
				});

				dom.setStyle(id + "_bottom", 'bottom', '-1px');

				e = 0;
			});

			// Fixes graphics glitch
			if (w = this.windows[id]) {
				// Fixes rendering bug after resize
				w.element.hide();
				w.element.show();

				// Forced a repaint of the window
				//DOM.get(id).style.filter = '';

				// IE has a bug where images used in CSS won't get loaded
				// sometimes when the cache in the browser is disabled
				// This fix tries to solve it by loading the images using the image object
				each(dom.select('div,a', id), function(e, i) {
					if (e.currentStyle.backgroundImage != 'none') {
						img = new Image();
						img.src = e.currentStyle.backgroundImage.replace(/url\(\"(.+)\"\)/, '$1');
					}
				});

				dom.get(id).style.filter = '';
			}
		}
	});

	// Register plugin
	tinymce.PluginManager.add('inlinepopups', tinymce.plugins.InlinePopups);
})();

