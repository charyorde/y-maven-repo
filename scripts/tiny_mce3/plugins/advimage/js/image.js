var ImageDialog = {
	preInit : function() {
		var url;

		tinyMCEPopup.requireLangPack();

		if (url = tinyMCEPopup.getParam("external_image_list_url"))
			document.write('<script language="javascript" type="text/javascript" src="' + tinyMCEPopup.editor.documentBaseURI.toAbsolute(url) + '"></script>');
	},

	init : function(ed) {
		var f = document.forms[0], nl = f.elements, ed = tinyMCEPopup.editor, dom = ed.dom, n = ed.selection.getNode();

		tinyMCEPopup.resizeToInnerSize();
		TinyMCE_EditableSelects.init();

		if (n.nodeName == 'IMG') {
			nl.src.value = dom.getAttrib(n, 'src');
//			nl.width.value = dom.getAttrib(n, 'width');
//			nl.height.value = dom.getAttrib(n, 'height');
//			nl.title.value = dom.getAttrib(n, 'title');
//            var align_val = this.getAttrib(n, 'align');
//            if(n.style.display.toLowerCase() == "block"){
//                selectByValue(f, 'align', "block");
//            }else{
//                selectByValue(f, 'align', align_val);
//            }
			nl.insert.value = ed.getLang('update');
            nl.style.value = dom.getAttrib(n, 'style');

			if (ed.settings.inline_styles) {
				// Move attribs to styles
				if (dom.getAttrib(n, 'align'))
					this.updateStyle('align');
			}
		}

		this.changeAppearance();
	},

	insert : function(file, title) {
		var ed = tinyMCEPopup.editor, t = this, f = document.forms[0];

		if (f.src.value === '') {
			if (ed.selection.getNode().nodeName == 'IMG') {
				ed.dom.remove(ed.selection.getNode());
				ed.execCommand('mceRepaint');
			}
			tinyMCEPopup.close();
			return;
		}

		t.insertAndClose();
	},

	insertAndClose : function() {
		var ed = tinyMCEPopup.editor, f = document.forms[0], nl = f.elements, v, args = {}, el;

		tinyMCEPopup.restoreSelection();

		// Fixes crash in Safari
		if (tinymce.isWebKit)
			ed.getWin().focus();

        tinymce.extend(args, {
			src : nl.src.value,
			style : nl.style.value
		});

		el = ed.selection.getNode();

		if (el && el.nodeName == 'IMG') {
			ed.dom.setAttribs(el, args);
		} else {
            ed.undoManager.add();
			ed.execCommand('mceInsertContent', false, ed.dom.createHTML('img', args), {skip_undo : 1});
			ed.undoManager.add();
		}
		tinyMCEPopup.close();
	},

	getAttrib : function(e, at) {
		var ed = tinyMCEPopup.editor, dom = ed.dom, v, v2;

		if (ed.settings.inline_styles) {
			switch (at) {
				case 'align':
					if (v = dom.getStyle(e, 'float'))
						return v;

					if (v = dom.getStyle(e, 'vertical-align'))
						return v;

					break;
			}
		}

		if (v = dom.getAttrib(e, at))
			return v;

		return '';
	},

	fillClassList : function(id) {
		var dom = tinyMCEPopup.dom, lst = dom.get(id), v, cl;

		if (v = tinyMCEPopup.getParam('theme_advanced_styles')) {
			cl = [];

			tinymce.each(v.split(';'), function(v) {
				var p = v.split('=');

				cl.push({'title' : p[0], 'class' : p[1]});
			});
		} else
			cl = tinyMCEPopup.editor.dom.getClasses();

		if (cl.length > 0) {
			lst.options[lst.options.length] = new Option(tinyMCEPopup.getLang('not_set'), '');

			tinymce.each(cl, function(o) {
				lst.options[lst.options.length] = new Option(o.title || o['class'], o['class']);
			});
		} else
			dom.remove(dom.getParent(id, 'tr'));
	},

	fillFileList : function(id, l) {
		var dom = tinyMCEPopup.dom, lst = dom.get(id), v, cl;

		l = window[l];

		if (l && l.length > 0) {
			lst.options[lst.options.length] = new Option('', '');

			tinymce.each(l, function(o) {
				lst.options[lst.options.length] = new Option(o[0], o[1]);
			});
		} else
			dom.remove(dom.getParent(id, 'tr'));
	},

	resetImageData : function() {
		var f = document.forms[0];

		f.elements.width.value = f.elements.height.value = '';
	},

	updateImageData : function(img, st) {
		var f = document.forms[0];

		if (!st) {
			f.elements.width.value = img.width;
			f.elements.height.value = img.height;
		}

		this.preloadImg = img;
	},

	changeAppearance : function() {
		var ed = tinyMCEPopup.editor, f = document.forms[0], img = document.getElementById('alignSampleImg');

		if (img) {
			if (ed.getParam('inline_styles')) {
				ed.dom.setAttrib(img, 'style', f.style.value);
			} else {
				img.align = f.align.value;
			}
		}
	},

	changeHeight : function() {
		var f = document.forms[0], tp, t = this;

		if (f.width.value == "" || f.height.value == "")
			return;

		tp = (parseInt(f.width.value) / parseInt(t.preloadImg.width)) * t.preloadImg.height;
		f.height.value = tp.toFixed(0);
	},

	changeWidth : function() {
		var f = document.forms[0], tp, t = this;

		if (f.width.value == "" || f.height.value == "")
			return;

		tp = (parseInt(f.height.value) / parseInt(t.preloadImg.height)) * t.preloadImg.width;
		f.width.value = tp.toFixed(0);
	},

	updateStyle : function(ty) {
		var dom = tinyMCEPopup.dom;
        var st, v, f = document.forms[0];
        var img = dom.create('img', {style : dom.get('style').value});

		if (tinyMCEPopup.editor.settings.inline_styles) {
			// Handle align
			if (ty == 'align') {
				dom.setStyle(img, 'float', '');
				dom.setStyle(img, 'vertical-align', '');

				v = getSelectValue(f, 'align');
				if (v) {
                    if(v == 'inline'){
                        dom.setStyle(img, 'display', v);
                        dom.setStyle(img, 'float', "none");
                    }else if(v == 'block'){
                        dom.setStyle(img, 'display', v);
                        dom.setStyle(img, 'float', "none");
                    }else if (v == 'left' || v == 'right'){
                        dom.setStyle(img, 'display', "inline");
						dom.setStyle(img, 'float', v);
                    }else{
						img.style.verticalAlign = v;
                    }
                }
			}


			// Merge
			dom.get('style').value = dom.serializeStyle(dom.parseStyle(img.style.cssText));
		}
	},

	changeMouseMove : function() {
	}
};

ImageDialog.preInit();
tinyMCEPopup.onInit.add(ImageDialog.init, ImageDialog);
