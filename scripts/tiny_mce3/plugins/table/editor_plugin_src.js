/**
 * $Id: editor_plugin_src.js 792 2008-04-10 16:37:29Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright � 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var each = tinymce.each;

	tinymce.create('tinymce.plugins.TablePlugin', {


        putCursorInCell : function(ed, td){
            var remFirst = false;
            if(td.childNodes.length == 0){
                if(td.childNodes.length == 0){
                    td.appendChild(ed.plugins.jivemacros.createEmptyPara());
                    remFirst = true;
                }
            }
            var node = td.childNodes[0];
            var lastEle = td;
            while(node.nodeType == 1 && node.childNodes.length){
                lastEle = node;
                node = node.childNodes[0];
            }
            ed.selection.select(tinymce.isIE ? lastEle : node);
            ed.selection.collapse(true);
            if(remFirst){
                td.removeChild(td.childNodes[0]);
            }
        },

        tempTable : null,

        fixTable : function(){
            if(this.tempTable != null && $def(this.tempTable) && this.tempTable.getAttribute('width')){
                var w = this.tempTable.getAttribute("width");
                if(w.indexOf("%") == -1) w += "px";
                this.tempTable.style.width = w;
                this.tempTable.removeAttribute("width");
                this.tempTable.setAttribute("data-mce-style", this.tempTable.getAttribute("style"));
            }
            if(this.tempTable.childNodes.length){
                // we need to look for and fix: <table><tbody><tr><tr>....</tr></tr></tbody></table>
                var tbody = this.tempTable.childNodes[0];
                if(tbody.childNodes.length){
                    var tr1 = tbody.childNodes[0];
                    if(tr1.childNodes.length){
                        var tr2 = tr1.childNodes[0];
                        if(tr1.nodeName == tr2.nodeName && tr1.nodeName.toLowerCase() == "tr"){
                            // nested tr's :(
                            while(tr1.childNodes.length){
                                tbody.appendChild(tr1.childNodes[0]);
                            }
                            tbody.removeChild(tr1);
                        }
                    }
                }
            }
        },


        fixInvisibleTableBorders : function(ed, node){
            if(node.nodeType == 1 && node.nodeName.toLowerCase() == "table"){
                if(node.style.borderCollapse == "collapse"){
                    node.style.borderCollapse = "separate";
                    setTimeout(function() {
                        node.style.borderCollapse = "collapse";
                    }, 330);
                }
            }else if(node.nodeType == 1){
                for(var i=0;i<node.childNodes.length;i++){
                    this.fixInvisibleTableBorders(ed, node.childNodes[i]);
                }
            }
        },

        init : function(ed, url) {
			var t = this;

			t.editor = ed;
			t.url = url;
			// Register buttons
			each([
				['table', 'table.props_desc', 'mceInsertTable', true],
				['delete_table', 'table.del', 'mceTableDelete'],
				['delete_col', 'table.delete_col_desc', 'mceTableDeleteCol'],
				['delete_row', 'table.delete_row_desc', 'mceTableDeleteRow'],
				['col_after', 'table.col_after_desc', 'mceTableInsertColAfter'],
				['col_before', 'table.col_before_desc', 'mceTableInsertColBefore'],
				['row_after', 'table.row_after_desc', 'mceTableInsertRowAfter'],
				['row_before', 'table.row_before_desc', 'mceTableInsertRowBefore'],
				['row_props', 'table.row_desc', 'mceTableRowProps', true],
				['cell_props', 'table.cell_desc', 'mceTableCellProps', true],
				['split_cells', 'table.split_cells_desc', 'mceTableSplitCells', true],
                ['merge_cells', 'table.merge_cells_desc', 'mceTableMergeCells', true],
                ['row_up', 'table.row_up', 'mceTableRowUp', true],
                ['row_down', 'table.row_down', 'mceTableRowDown', true],
                ['col_left', 'table.col_left', 'mceTableColLeft', true],
                ['col_right', 'table.col_right', 'mceTableColRight', true]
			], function(c) {
				ed.addButton(c[0], {title : c[1], cmd : c[2], ui : c[3]});
			});

			ed.onInit.add(function() {

                if(tinymce.isGecko){
                    ed.plugins.table.fixInvisibleTableBorders(ed, ed.getBody());
                }



                if (ed && ed.plugins.contextmenu) {
					ed.plugins.contextmenu.onContextMenu.add(function(th, m, e) {
						var sm, se = ed.selection, el = se.getNode() || ed.getBody();

                        if (ed.dom.getParent(e, 'td') || ed.dom.getParent(e, 'th')) {
                            m.removeAll();

                            if (el.nodeName == 'A' && !ed.dom.getAttrib(el, 'name')) {
//                                m.add({title : 'advanced.link_desc', icon : 'link', cmd : ed.plugins.advlink ? 'mceAdvLink' : 'mceLink', ui : true});
                                m.add({title : 'advanced.unlink_desc', icon : 'unlink', cmd : 'UnLink'});
                                m.addSeparator();
                            }

                            if (el.nodeName == 'IMG' && el.className.indexOf('mceItem') == -1) {
                                m.add({title : 'advanced.image_desc', icon : 'image', cmd : ed.plugins.advimage ? 'mceAdvImage' : 'mceImage', ui : true});
                                m.addSeparator();
                            }

                            m.add({title : 'table.props_desc', icon : 'table_props', cmd : 'mceInsertTable', ui : true});
                            m.add({title : 'table.del', icon : 'delete_table', cmd : 'mceTableDelete', ui : true});
                            m.addSeparator();

                            // Cell menu
                            sm = m.addMenu({title : 'table.cell'});
                            sm.add({title : 'table.cell_desc', icon : 'cell_props', cmd : 'mceTableCellProps', ui : true});
                            sm.add({title : 'table.split_cells_desc', icon : 'split_cells', cmd : 'mceTableSplitCells', ui : true});
                            sm.add({title : 'table.merge_cells_desc', icon : 'merge_cells', cmd : 'mceTableMergeCells', ui : true});

                            // Row menu
                            sm = m.addMenu({title : 'table.row'});
                            sm.add({title : 'table.row_desc', icon : 'row_props', cmd : 'mceTableRowProps', ui : true});
                            sm.add({title : 'table.row_before_desc', icon : 'row_before', cmd : 'mceTableInsertRowBefore'});
                            sm.add({title : 'table.row_after_desc', icon : 'row_after', cmd : 'mceTableInsertRowAfter'});
                            sm.add({title : 'table.delete_row_desc', icon : 'delete_row', cmd : 'mceTableDeleteRow'});
                            sm.addSeparator();
                            sm.add({title : 'table.cut_row_desc', icon : 'cut', cmd : 'mceTableCutRow'});
                            sm.add({title : 'table.copy_row_desc', icon : 'copy', cmd : 'mceTableCopyRow'});
                            if(ed.tableRowClipboard){
                                sm.add({title : 'table.paste_row_before_desc', icon : 'paste', cmd : 'mceTablePasteRowBefore'});
                                sm.add({title : 'table.paste_row_after_desc', icon : 'paste', cmd : 'mceTablePasteRowAfter'});
                            }

                            // Column menu
                            sm = m.addMenu({title : 'table.col'});
                            sm.add({title : 'table.col_before_desc', icon : 'col_before', cmd : 'mceTableInsertColBefore'});
                            sm.add({title : 'table.col_after_desc', icon : 'col_after', cmd : 'mceTableInsertColAfter'});
                            sm.add({title : 'table.delete_col_desc', icon : 'delete_col', cmd : 'mceTableDeleteCol'});
                        } else if(ed.dom.getParent(e, 'img') == null){
                            m.add({title : 'table.desc', icon : 'table', cmd : 'mceInsertTable', ui : true, value : {action : 'insert'}});
                        }
                    });
                }
			});

            ed.onKeyUp.add(function(ed, e) {
                if(e.keyCode == 9 && !e.ctrlKey && !e.altKey){
                    var p = ed.dom.getParent(ed.selection.getNode(), 'li,td,th,caption');
                    if(p != null && p.nodeName.toLowerCase() != "li"){
                        if(e.shiftKey){
                            if(p.previousSibling != null){
                                this.putCursorInCell(ed, p.previousSibling);
                            }else{
                                var row = ed.dom.getParent(p, 'tr');
                                if(row.previousSibling){
                                    this.putCursorInCell(ed, row.previousSibling.cells[row.previousSibling.childNodes.length-1]);
                                }else{
                                    this.putCursorInCell(ed, p);
                                }
                            }
                        }else{
                            if(p.nextSibling != null){
                                this.putCursorInCell(ed, p.nextSibling);
                            }else{
                                var row = ed.dom.getParent(p, 'tr');
                                if(row.nextSibling){
                                    this.putCursorInCell(ed, row.nextSibling.cells[0]);
                                }else{
                                    // insert a row
                                    ed.execCommand("mceTableInsertRowAfter");
                                    this.putCursorInCell(ed, row.nextSibling.cells[0]);
                                }
                            }
                        }
                        ed.nodeChanged();
                        tinymce.dom.Event.cancel(e);
                    }
                }
            }, this);
            // Add undo level when new rows are created using the tab key
            ed.onKeyDown.add(function(ed, e) {
                if (e.keyCode == 9 && !e.ctrlKey && !e.altKey && ed.dom.getParent(ed.selection.getNode(), 'TABLE'))
                    ed.undoManager.add();

                if(e.keyCode == 9 && !e.ctrlKey && !e.altKey){
                    var p = ed.dom.getParent(ed.selection.getNode(), 'td,th,caption');
                    if(p != null){
                        tinymce.dom.Event.cancel(e);
                    }
                }
            });
            ed.onKeyPress.add(function(ed, e) {
                if(e.keyCode == 9 && !e.ctrlKey && !e.altKey){
                    var p = ed.dom.getParent(ed.selection.getNode(), 'td,th,caption');
                    if(p != null){
                        tinymce.dom.Event.cancel(e);
                    }
                }
            });

			// Select whole table is a table border is clicked
			if (!tinymce.isIE) {
				if (ed.getParam('table_selection', true)) {
					ed.onClick.add(function(ed, e) {
						e = e.target;

						if (e.nodeName === 'TABLE')
							ed.selection.select(e);
					});
				}
			}

            ed.onMouseUp.add(function(ed, e){
                var n = ed.selection.getNode();
                var table = ed.dom.getParent(n, 'table');
                if(table){
                    ed.plugins.table.tempTable = table;
                    if(e.target.nodeName.toLowerCase() == "tr" || e.target.nodeName.toLowerCase() == "table"){
                        ed.plugins.table._doExecCommand("fixMissingCells", table);
                    }
                    jive.ext.x.xTimer.set("timeout",ed.plugins.table, "fixTable", 33);
                }
            });

            ed.onNodeChange.add(function(ed, cm, n) {
                var p = ed.dom.getParent(n, 'td,th,caption');
                var cell = ed.dom.getParent(n, 'td,th');
                if(cell && ed.selection.isCollapsed()){
                    var colspan = ed.dom.getAttrib(cell, "colspan");
                    var rowspan = ed.dom.getAttrib(cell, "rowspan");
                    colspan = colspan == "" ? 1 : parseInt(colspan);
                    rowspan = rowspan == "" ? 1 : parseInt(rowspan);

                    cm.setDisabled('split_cells', colspan == 1 && rowspan == 1);
                    cm.setDisabled('merge_cells', !(colspan == 1 && rowspan == 1));
                }else if(cell){
                    cm.setDisabled('split_cells', false);
                    cm.setDisabled('merge_cells', false);
                }else {
                    cm.setDisabled('split_cells', true);
                    cm.setDisabled('merge_cells', true);
                }

                if (p && p.nodeName === 'CAPTION')
					p = null;

				cm.setDisabled('delete_table', !p);
				cm.setDisabled('delete_col', !p);
				cm.setDisabled('delete_table', !p);
				cm.setDisabled('delete_row', !p);
				cm.setDisabled('col_after', !p);
				cm.setDisabled('col_before', !p);
				cm.setDisabled('row_after', !p);
				cm.setDisabled('row_before', !p);
				cm.setDisabled('row_props', !p);
				cm.setDisabled('cell_props', !p);
			});

			// Padd empty table cells
			if (!tinymce.isIE) {
				ed.onBeforeSetContent.add(function(ed, o) {
					if (o.initial)
						o.content = o.content.replace(/<(td|th)([^>]+|)>\s*<\/(td|th)>/g, tinymce.isOpera ? '<$1$2>&nbsp;</$1>' : '<$1$2><br mce_bogus="1" /></$1>');
				});
			}

            // begin edits //
            // https://brewspace.jiveland.com/docs/DOC-10757 //
            //
            // track the node that we are moving from
            ed.onKeyDown.addToTop(function(ed, evt){
                var rng = ed.selection.getRng(true);
                if(rng.collapsed){
                    if(evt.keyCode == 39 || evt.keyCode == 40){ //down or right
                        //handle movement into a table, possibly from an empty paragraph
                        var para = ed.dom.getParent(rng.startContainer, "p");
                        if(para && ed.selectionUtil.isEffectivelyEmpty(para) && this.isFirst(ed.getBody(), para)){
                            var n = para.nextSibling;
                            while(n && n.nodeType != 1) {  //find an element
                                n = n.nextSibling;
                            }
                            if(n && n.nodeName.toLowerCase() == "p"){ //if it's a p, work on its first child
                                n = n.firstChild;
                            }
                            if(n && n.nodeName.toLowerCase() == "table"){
                                //our next cursor container is a table, and we're coming from an empty paragraph.
                                //schedule immediate delete of the empty, but after the keyboard event happens
                                setTimeout(function(){
                                    para.parentNode.removeChild(para);
                                }, 0);
                            }
                        }
                    }else if(evt.keyCode == 38){ //up; left puts us in a weird spot in WebKit
                        //handle movement out of the top of a table
                        var cell = ed.dom.getParent(rng.startContainer, "td, th");
                        if(cell){
                            var table = ed.dom.getParent(cell, "table");
                            if(this.isFirst(ed.getBody(), table)){
                                //We're in a cell in a table, and the table is the first element in the body.  We need to insert a P before the table, if we're moving out of it.
                                var tr = ed.dom.getParent(cell, "tr");
                                if(this.isFirst(table, cell)){
                                    //we're going up and it's the first row, or left and it's the first cell
                                    var p = ed.plugins.jivemacros.createEmptyPara();
                                    var beforeElement = table;
                                    while(beforeElement.parentNode.nodeName.toLowerCase() != "body"){
                                        beforeElement = beforeElement.parentNode;
                                    }
                                    beforeElement.parentNode.insertBefore(p, beforeElement);
                                }
                            }
                        }
                    }
                }
            }, this);
        },

        // checks to see if descendentNode or one of
        // its ancestors is the first node
        // in the container
        isFirst : function(containerElem, descendentNode){
            if(containerElem.childNodes.length == 0) return false;
            return (containerElem.childNodes[0] == descendentNode || this.isFirst(containerElem.childNodes[0], descendentNode));
        },
        //
        // end edits //

        execCommand : function(cmd, ui, val) {
			var ed = this.editor, b;

			// Is table command
			switch (cmd) {
				case "mceInsertTable":
				case "mceTableRowProps":
				case "mceTableCellProps":
				case "mceTableSplitCells":
				case "mceTableMergeCells":
				case "mceTableInsertRowBefore":
				case "mceTableInsertRowAfter":
				case "mceTableDeleteRow":
				case "mceTableInsertColBefore":
				case "mceTableInsertColAfter":
				case "mceTableDeleteCol":
				case "mceTableCutRow":
				case "mceTableCopyRow":
				case "mceTablePasteRowBefore":
				case "mceTablePasteRowAfter":
				case "mceTableDelete":
                case "JustifyLeft":
                case "JustifyCenter":
                case "JustifyRight":
                case "JustifyFull":
                case "mceTableRowUp":
                case "mceTableRowDown":
                case "mceTableColLeft":
                case "mceTableColRight":
                    ed.execCommand('mceBeginUndoLevel');
					var ret = this._doExecCommand(cmd, ui, val);
                    if(ret == -1) return false;
					if(ret){
                        ed.execCommand('mceEndUndoLevel');
                        ed.undoManager.add(false, true);
                    }

					return true;
			}

			// Pass to next handler in chain
			return false;
		},

		getInfo : function() {
			return {
				longname : 'Tables',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/table',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		},

		// Private plugin internal methods

		/**
		 * Executes the table commands.
		 */
		_doExecCommand : function(command, user_interface, value) {
			var inst = this.editor, ed = inst, url = this.url;
			var focusElm = inst.selection.getNode();

            if(typeof(value) != "undefined" && typeof(value['cell']) != "undefined"){
                focusElm = value['cell'];
            };

			var trElm = inst.dom.getParent(focusElm, "tr");
			var tdElm = inst.dom.getParent(focusElm, "td,th");
            if(typeof(value) != "undefined" && typeof(value['cell']) != "undefined"){
                tdElm = value['cell'];
            };
			var tableElm = inst.dom.getParent(focusElm, "table");
			var doc = inst.contentWindow.document;
			var tableBorder = tableElm ? tableElm.getAttribute("border") : "";

			// Get first TD if no TD found
			if (trElm && tdElm == null)
				tdElm = trElm.cells[0];

			function inArray(ar, v) {
				for (var i=0; i<ar.length; i++) {
					// Is array
					if (ar[i].length > 0 && inArray(ar[i], v))
						return true;

					// Found value
					if (ar[i] == v)
						return true;
				}

				return false;
			}

			function select(dx, dy) {
				var td;

				grid = getTableGrid(tableElm);
				dx = dx || 0;
				dy = dy || 0;
				dx = Math.max(cpos.cellindex + dx, 0);
				dy = Math.max(cpos.rowindex + dy, 0);

				// Recalculate grid and select
				inst.execCommand('mceRepaint');
				td = getCell(grid, dy, dx);

				if (td) {
					inst.selection.select(td.firstChild || td);
					inst.selection.collapse(1);
				}
			};

			function makeTD() {
				var newTD = doc.createElement("td");

				if (!tinymce.isIE)
					newTD.innerHTML = '<br mce_bogus="1"/>';
                return newTD;
            }

			function getColRowSpan(td) {
                var colspan = 1, rowspan = 1, v;
				if(v = td.getAttribute("colspan")){
                    if(typeof(v.nodeValue) != "undefined"){
                        colspan = v.nodeValue;
                    }else{
                        colspan = v;
                    }
                }
                if(v = td.getAttribute("rowspan")){
                    if(typeof(v.nodeValue) != "undefined"){
                        rowspan = v.nodeValue;
                    }else{
                        rowspan = v;
                    }
                }
				colspan = parseInt(colspan);
				rowspan = parseInt(rowspan);

				return {colspan : colspan, rowspan : rowspan};
			}

			function getCellPos(grid, td) {
				var x, y;

				for (y=0; y<grid.length; y++) {
					for (x=0; x<grid[y].length; x++) {
						if (grid[y][x] == td)
							return {cellindex : x, rowindex : y};
					}
				}

				return null;
			}

			function getCell(grid, row, col) {
				if (grid[row] && grid[row][col])
					return grid[row][col];

				return null;
			}

            /**
             * returns the youngest node and removes all text nodes
             * @param node
             * @param curr
             */
            function findYoungestAndRemoveText(node, curr){
                if(node.nodeName.toLowerCase() == "br") return curr;
                if(node.childNodes.length == 0) return node;
                for(var i=0;i<node.childNodes.length;i++){
                    if(node.childNodes[i].nodeType == 3){
                        node.removeChild(node.childNodes[i]);
                        i--;
                    }else{
                        curr = findYoungestAndRemoveText(node.childNodes[i], node);
                    }
                }
                if(node.childNodes.length == 0) return node;
                return curr;
            }

            /**
             * replace the text in node with the text parameter
             * @param node
             * @param text
             */
            function fillTextAndSelect(node, text){
                var youngest = findYoungestAndRemoveText(node, node);
                if(youngest.childNodes.length == 0){
                    youngest.appendChild(text);
                }else{
                    youngest.insertBefore(text, youngest.childNodes[youngest.childNodes.length-1]);
                }
                inst.focus();
            }

            function getTableGrid(table) {
				var grid = [], rows = table.rows, x, y, td, sd, xstart, x2, y2;

				for (y=0; y<rows.length; y++) {
                    if(rows[y].cells.length == 0){
                        rows[y].parentNode.removeChild(rows[y]);
                        y--;
                        continue;
                    }
					for (x=0; x<rows[y].cells.length; x++) {
						td = rows[y].cells[x];
						sd = getColRowSpan(td);

						// All ready filled
						for (xstart = x; grid[y] && grid[y][xstart]; xstart++) ;

						// Fill box
						for (y2=y; y2<y+sd['rowspan']; y2++) {
							if (!grid[y2])
								grid[y2] = [];

							for (x2=xstart; x2<xstart+sd['colspan']; x2++)
								grid[y2][x2] = td;
						}
					}
				}

				return grid;
			}

			function trimRow(table, tr, td, new_tr) {
				var grid = getTableGrid(table), cpos = getCellPos(grid, td);
				var cells, lastElm;

				// Time to crop away some
				if (new_tr.cells.length != tr.childNodes.length) {
					cells = tr.childNodes;
					lastElm = null;

					for (var x=0; td = getCell(grid, cpos.rowindex, x); x++) {
						var remove = true;
						var sd = getColRowSpan(td);

						// Remove due to rowspan
						if (inArray(cells, td)) {
							new_tr.childNodes[x]._delete = true;
						} else if ((lastElm == null || td != lastElm) && sd.colspan > 1) { // Remove due to colspan
							for (var i=x; i<x+td.colSpan; i++)
								new_tr.childNodes[i]._delete = true;
						}

						if ((lastElm == null || td != lastElm) && sd.rowspan > 1)
							td.rowSpan = sd.rowspan + 1;
                        if(td.rowSpan == 1){
                            td.removeAttribute("rowspan");
                        }
						lastElm = td;
					}

					deleteMarked(tableElm);
				}
			}

			function prevElm(node, name) {
				while ((node = node.previousSibling) != null) {
					if (node.nodeName == name)
						return node;
				}

				return null;
			}

			function nextElm(node, names) {
				var namesAr = names.split(',');

				while ((node = node.nextSibling) != null) {
					for (var i=0; i<namesAr.length; i++) {
						if (node.nodeName.toLowerCase() == namesAr[i].toLowerCase() )
							return node;
					}
				}

				return null;
			}

			function deleteMarked(tbl) {
				if (tbl.rows == 0)
					return;

				var tr = tbl.rows[0];
                for(var i=0;i<tbl.rows.length;i++){
                    var tr = tbl.rows[i];
                    // Delete row
                    if (tr._delete) {
                        tr.parentNode.removeChild(tr);
                        i--;
                        continue;
                    }

                    // Delete cells
                    var td = tr.cells[0];
                    if (td.cells > 1) {
                        do {
                            var nexttd = nextElm(td, "TD,TH");

                            if (td._delete)
                                td.parentNode.removeChild(td);
                        } while ((td = nexttd) != null);
                    }

                }
			}

			function addRows(td_elm, tr_elm, rowspan) {
				// Add rows
                td_elm.rowspan = 1;
                td_elm.setAttribute("rowSpan","1");
                td_elm.removeAttribute("rowSpan");
				var trNext = nextElm(tr_elm, "TR");
				for (var i=1; i<rowspan && trNext; i++) {
					var newTD = doc.createElement("td");
					if (!tinymce.isIE)
						newTD.innerHTML = '<br mce_bogus="1"/>';

					if (tinymce.isIE) {
						// JIVE-13323. IE9 doesn't handle insertBefore with undefined reference node.
						if(tinymce.isIE9 && typeof trNext.cells(td_elm.cellIndex) === 'undefined')
						    trNext.appendChild(newTD);
						else
						    trNext.insertBefore(newTD, trNext.cells(td_elm.cellIndex));
				    }
					else
						trNext.insertBefore(newTD, trNext.cells[td_elm.cellIndex]);

					trNext = nextElm(trNext, "TR");
				}
			}

			function copyRow(doc, table, tr) {
				var grid = getTableGrid(table);
				var newTR = tr.cloneNode(false);
				var cpos = getCellPos(grid, tr.cells[0]);
				var lastCell = null;
				var tableBorder = inst.dom.getAttrib(table, "border");
				var tdElm = null;

				for (var x=0; tdElm = getCell(grid, cpos.rowindex, x); x++) {
					var newTD = null;

					if (lastCell != tdElm) {
						for (var i=0; i<tr.cells.length; i++) {
							if (tdElm == tr.cells[i]) {
								newTD = tdElm.cloneNode(true);
								break;
							}
						}
					}

					if (newTD == null) {
						newTD = doc.createElement("td");

						if (!tinymce.isIE)
							newTD.innerHTML = '<br mce_bogus="1"/>';
					}

					// Reset col/row span
                    newTD.removeAttribute("colSpan");
                    newTD.removeAttribute("rowspan");

					newTR.appendChild(newTD);

					lastCell = tdElm;
				}

				return newTR;
			}

			// ---- Commands -----

			// Handle commands
			switch (command) {
                case "fixMissingCells":
                    var grid = getTableGrid(user_interface);
                    // first, find the max colspan for the table
                    var cells_per_row = 0;
                    for(var r=0;r<grid.length;r++){
                        if(grid[r].length > cells_per_row) cells_per_row = grid[r].length;
                    }
                    // now add missing cells, if any
                    for(var r=0;r<grid.length;r++){
                        if(grid[r].length < cells_per_row){
                            user_interface.rows[r].appendChild(makeTD());
//                            console.log("added missing cell in row " + (r+1));
                        }
                    }
                    // next, make sure each row is colspan long
                    // now make sure each column is rowspan long
                    return false;
                case "mceTableRowUp" :
                    if (trElm == null)
                        return false;
                    if(trElm.previousSibling != null){
                        var sel = inst.selection.getNode();
                        trElm.parentNode.insertBefore(trElm, trElm.previousSibling);
                        if(sel.childNodes.length && !tinymce.isIE) sel = sel.childNodes[0];
                        inst.selection.select(sel);
                        inst.selection.collapse(true);
                        inst.nodeChanged(false, true);
                    }
                    return true;
                case "mceTableRowDown" :
                    if (trElm == null)
                        return false;
                    if(trElm.nextSibling != null){
                        var sel = inst.selection.getNode();
                        trElm.parentNode.insertBefore(trElm.nextSibling, trElm);
                        if(sel.childNodes.length && !tinymce.isIE) sel = sel.childNodes[0];
                        inst.selection.select(sel);
                        inst.selection.collapse(true);
                        inst.nodeChanged(false, true);
                    }
                    return true;
                case "mceTableColRight" :
                    if (!trElm || !tdElm)
                        return false;

                    var grid = getTableGrid(tableElm);
                    var cpos = getCellPos(grid, tdElm);
                    var lastTDElm = null;

                    var sel = inst.selection.getNode();
                    for (var y=0; tdElm = getCell(grid, y, cpos.cellindex); y++) {
                        if (tdElm != lastTDElm) {

                            var next = $j(tdElm).next("td, th");
                            if(next.length > 0){
                                tdElm.parentNode.insertBefore(next.get(0), tdElm);
                            }

                            lastTDElm = tdElm;
                        }
                    }
                    if(sel.childNodes.length && !tinymce.isIE) sel = sel.childNodes[0];
                    inst.selection.select(sel);
                    inst.selection.collapse(true);
                    inst.nodeChanged(false, true);
                    return true;
                case "mceTableColLeft" :
                    if (!trElm || !tdElm)
                        return false;

                    var grid = getTableGrid(tableElm);
                    var cpos = getCellPos(grid, tdElm);
                    var lastTDElm = null;

                    var sel = inst.selection.getNode();
                    for (var y=0; tdElm = getCell(grid, y, cpos.cellindex); y++) {
                        if (tdElm != lastTDElm) {

                            var prev = $j(tdElm).prev("td, th");
                            if(prev.length > 0){
                                tdElm.parentNode.insertBefore(tdElm, prev.get(0));
                            }

                            lastTDElm = tdElm;
                        }
                    }
                    if(sel.childNodes.length && !tinymce.isIE) sel = sel.childNodes[0];
                    inst.selection.select(sel);
                    inst.selection.collapse(true);
                    inst.nodeChanged(false, true);
                    return true;
                case "mceTableRowProps":
					if (trElm == null)
						return false;

					if (user_interface) {
						inst.windowManager.open({
							url : CS_BASE_URL + '/resources/scripts/tiny_mce3/plugins/table/row.htm',
							width : 400 + parseInt(inst.getLang('table.rowprops_delta_width', 0)),
							height : 245 + parseInt(inst.getLang('table.rowprops_delta_height', 0)),
							inline : 1
						}, {
							plugin_url : url,
                            cs_resource_base_url : CS_RESOURCE_BASE_URL
						});
					}

					return false;

				case "mceTableCellProps":
					if (tdElm == null)
						return false;

					if (user_interface) {
						inst.windowManager.open({
							url : CS_BASE_URL + '/resources/scripts/tiny_mce3/plugins/table/cell.htm',
							width : 400 + parseInt(inst.getLang('table.cellprops_delta_width', 0)),
							height : 275 + parseInt(inst.getLang('table.cellprops_delta_height', 0)),
							inline : 1
						}, {
							plugin_url : url,
                            cs_resource_base_url : CS_RESOURCE_BASE_URL
						});
					}

					return false;

				case "mceInsertTable":
					if (user_interface) {
                        if(value && value.action == "insert"){
                            inst.windowManager.open({
                                url : CS_BASE_URL + '/resources/scripts/tiny_mce3/plugins/table/table.htm',
                                width : 420 + parseInt(inst.getLang('table.table_delta_width', 0)),
                                height : 298 + parseInt(inst.getLang('table.table_delta_height', 0)),
                                inline : 1
                            }, {
                                plugin_url : url,
                                action : value ? value.action : 0,
                                cs_resource_base_url : CS_RESOURCE_BASE_URL
                            });
                        }else{
                            inst.windowManager.open({
                                url : CS_BASE_URL + '/resources/scripts/tiny_mce3/plugins/table/table_edit.htm',
                                width : 420 + parseInt(inst.getLang('table.table_delta_width', 0)),
                                height : 258 + parseInt(inst.getLang('table.table_delta_height', 0)),
                                inline : 1
                            }, {
                                plugin_url : url,
                                action : value ? value.action : 0,
                                cs_resource_base_url : CS_RESOURCE_BASE_URL
                            });
                        }
					}

					return false;

				case "mceTableDelete":
					var table = inst.dom.getParent(inst.selection.getNode(), "table");
					if (table) {
						table.parentNode.removeChild(table);
                        inst.nodeChanged(false, true);
						inst.execCommand('mceRepaint');
					}
					return true;

				case "mceTableSplitCells":
				case "mceTableMergeCells":
				case "mceTableInsertRowBefore":
				case "mceTableInsertRowAfter":
				case "mceTableDeleteRow":
				case "mceTableInsertColBefore":
				case "mceTableInsertColAfter":
				case "mceTableDeleteCol":
				case "mceTableCutRow":
				case "mceTableCopyRow":
				case "mceTablePasteRowBefore":
				case "mceTablePasteRowAfter":
                case "JustifyLeft":
                case "JustifyCenter":
                case "JustifyRight":
                case "JustifyFull":
					// No table just return (invalid command)
					if (!tableElm){
                        switch(command){
                            case "JustifyLeft":
                            case "JustifyCenter":
                            case "JustifyRight":
                            case "JustifyFull":
                                return -1;
                            default:
                                return true;
                        }
                    }

                    // Table has a tbody use that reference
					// Changed logic by ApTest 2005.07.12 (www.aptest.com)
					// Now lookk at the focused element and take its parentNode.  That will be a tbody or a table.
					if (trElm && tableElm != trElm.parentNode)
						tableElm = ed.dom.getParent(trElm, "table");


                    if (tableElm && (trElm || tinymce.isIE || tinymce.isWebKit)) {
						switch (command) {
                            case "JustifyLeft":
                            case "JustifyCenter":
                            case "JustifyRight":
                            case "JustifyFull":

                            var rows = [];
							var sel = inst.selection.getSel();
							var grid = getTableGrid(tableElm);

                            if (tinymce.isIE || tinymce.isWebKit){
                                var start = ed.dom.getParent(inst.selection.getStart(), "td,th");
                                var end = ed.dom.getParent(inst.selection.getEnd(), "td,th");

                                //console.log("start: " + start);
                                //console.log("end: " + end);
                                if(start && end){
                                    inst.plugins.jiveutil.walkDOMTree(start, end, function(n){
                                        //console.log("walking on: " + n);
                                        if(n.nodeType == 1 && (n.nodeName.toLowerCase() == "td" || n.nodeName.toLowerCase() == "th")){
                                            var td = n;
                                            if(command == "JustifyLeft"){
                                                td.style.textAlign="left";
                                                td.setAttribute("data-mce-style", td.getAttribute("style"));
                                            }else if(command == "JustifyRight"){
                                                td.style.textAlign="right";
                                                td.setAttribute("data-mce-style", td.getAttribute("style"));
                                            }else if(command == "JustifyCenter"){
                                                td.style.textAlign="center";
                                                td.setAttribute("data-mce-style", td.getAttribute("style"));
                                            }else if(command == "JustifyFull"){
                                                td.style.textAlign="justify";
                                                td.setAttribute("data-mce-style", td.getAttribute("style"));
                                            }
                                        }
                                    });

                                }
                                break;
                            }else if (sel.rangeCount == 1) {
                                var cpos = getCellPos(grid, tdElm);

                                // Get rows and cells
                                var tRows = tableElm.rows;
                                for (var y=cpos.rowindex; y<grid.length; y++) {
                                    var rowCells = [];

                                    for (var x=cpos.cellindex; x<grid[y].length; x++) {
                                        var td = getCell(grid, y, x);

                                        if (td && !inArray(rows, td) && !inArray(rowCells, td)) {
                                            var cp = getCellPos(grid, td);

                                            // Within range
                                            if (cp.cellindex < cpos.cellindex+1 && cp.rowindex < cpos.rowindex+1)
                                                rowCells[rowCells.length] = td;
                                        }
                                    }
                                    if (rowCells.length > 0)
                                        rows[rows.length] = rowCells;
                                }
							} else {
								var cells = [];
								var sel = inst.selection.getSel();
								var lastTR = null;
								var curRow = null;
								var x1 = -1, y1 = -1, x2, y2;

								// Get all selected cells
								for (var i=0; i<sel.rangeCount; i++) {
									var rng = sel.getRangeAt(i);
									var tdElm = rng.startContainer.childNodes[rng.startOffset];

									if (!tdElm)
										break;

									if (tdElm.nodeName == "TD" || tdElm.nodeName == "TH")
										cells[cells.length] = tdElm;
								}

								// Get rows and cells
								var tRows = tableElm.rows;
								for (var y=0; y<tRows.length; y++) {
									var rowCells = [];

									for (var x=0; x<tRows[y].cells.length; x++) {
										var td = tRows[y].cells[x];

										for (var i=0; i<cells.length; i++) {
											if (td == cells[i]) {
												rowCells[rowCells.length] = td;
											}
										}
									}

									if (rowCells.length > 0)
										rows[rows.length] = rowCells;
								}
							}

							// set alignment
							for (var y=0; y<rows.length; y++) {
								for (var x=0; x<rows[y].length; x++) {
									var td = rows[y][x];
									if(command == "JustifyLeft"){
                                        td.style.textAlign="left";
                                        td.setAttribute("data-mce-style", td.getAttribute("style"));
                                    }else if(command == "JustifyRight"){
                                        td.style.textAlign="right";
                                        td.setAttribute("data-mce-style", td.getAttribute("style"));
                                    }else if(command == "JustifyCenter"){
                                        td.style.textAlign="center";
                                        td.setAttribute("data-mce-style", td.getAttribute("style"));
                                    }else if(command == "JustifyFull"){
                                        td.style.textAlign="justify";
                                        td.setAttribute("data-mce-style", td.getAttribute("style"));
                                    }
                                }
							}
							break;
                            case "mceTableCutRow":
								if (!trElm || !tdElm)
									return true;

								inst.tableRowClipboard = copyRow(doc, tableElm, trElm);
								inst.execCommand("mceTableDeleteRow");
								break;

							case "mceTableCopyRow":
								if (!trElm || !tdElm)
									return true;

								inst.tableRowClipboard = copyRow(doc, tableElm, trElm);
								break;

							case "mceTablePasteRowBefore":
								if (!trElm || !tdElm)
									return true;

								var newTR = inst.tableRowClipboard.cloneNode(true);

								var prevTR = prevElm(trElm, "TR");
								if (prevTR != null)
									trimRow(tableElm, prevTR, prevTR.cells[0], newTR);

								trElm.parentNode.insertBefore(newTR, trElm);
								break;

							case "mceTablePasteRowAfter":
								if (!trElm || !tdElm)
									return true;

								var nextTR = nextElm(trElm, "TR");
								var newTR = inst.tableRowClipboard.cloneNode(true);

								trimRow(tableElm, trElm, tdElm, newTR);

								if (nextTR == null)
									trElm.parentNode.appendChild(newTR);
								else
									nextTR.parentNode.insertBefore(newTR, nextTR);

								break;

							case "mceTableInsertRowBefore":
								if (!trElm || !tdElm)
									return true;

                                var book = ed.selection.getBookmark();
								var grid = getTableGrid(tableElm);
								var cpos = getCellPos(grid, tdElm);
								var newTR = doc.createElement("tr");
								var lastTDElm = null;

								cpos.rowindex--;
								if (cpos.rowindex < 0)
									cpos.rowindex = 0;

								// Create cells
								for (var x=0; tdElm = getCell(grid, cpos.rowindex, x); x++) {
									if (tdElm != lastTDElm) {
										var sd = getColRowSpan(tdElm);

										if (sd['rowspan'] == 1) {
											var newTD = doc.createElement("td");

											if (!tinymce.isIE)
												newTD.innerHTML = '<br mce_bogus="1"/>';

											newTD.colSpan = tdElm.colSpan;

											newTR.appendChild(newTD);
										} else
											tdElm.rowSpan = sd['rowspan'] + 1;
                                        if(tdElm.rowSpan == 1){
                                            tdElm.removeAttribute("rowspan");
                                        }
                                        if(tdElm.colSpan == 1){
                                            tdElm.removeAttribute("colSpan");
                                        }

										lastTDElm = tdElm;
									}
								}

								trElm.parentNode.insertBefore(newTR, trElm);
								ed.selection.moveToBookmark(book);
							break;

							case "mceTableInsertRowAfter":
								if (!trElm || !tdElm)
									return true;

                                var book = ed.selection.getBookmark();
								var grid = getTableGrid(tableElm);
								var cpos = getCellPos(grid, tdElm);
								var newTR = doc.createElement("tr");
								var lastTDElm = null;

								// Create cells
								for (var x=0; tdElm = getCell(grid, cpos.rowindex, x); x++) {
									if (tdElm != lastTDElm) {
										var sd = getColRowSpan(tdElm);

										if (sd['rowspan'] == 1) {
											var newTD = doc.createElement("td");

											if (!tinymce.isIE)
												newTD.innerHTML = '<br mce_bogus="1"/>';

											newTD.colSpan = tdElm.colSpan;
                                            if(newTD.colSpan == 1){
                                                newTD.removeAttribute("colSpan");
                                            }

											newTR.appendChild(newTD);
										} else
											tdElm.rowSpan = sd['rowspan'] + 1;
                                        if(tdElm.rowSpan == 1){
                                            tdElm.removeAttribute("rowspan");
                                        }

										lastTDElm = tdElm;
									}
								}

								if (newTR.hasChildNodes()) {
									var nextTR = nextElm(trElm, "TR");
									if (nextTR)
										nextTR.parentNode.insertBefore(newTR, nextTR);
									else{
                                        var tbody;
                                        if(tableElm.childNodes.length > 0){
                                            tbody = tableElm.childNodes[0];
                                        }else{
                                            tbody = tableElm;
                                        }
                                        if(tbody.nodeName.toLowerCase() == "tbody"){
                                            tbody.appendChild(newTR);
                                        }else{
                                            tableElm.appendChild(newTR);
                                        }
                                    }
								}

								ed.selection.moveToBookmark(book);
							break;

							case "mceTableDeleteRow":
								if (!trElm || !tdElm)
									return true;

								var grid = getTableGrid(tableElm);
								var cpos = getCellPos(grid, tdElm);

								// Only one row, remove whole table
								if (grid.length == 1) {
									inst.dom.remove(inst.dom.getParent(tableElm, "table"));
									return true;
								}

								// Move down row spanned cells
								var cells = trElm.cells;
								var nextTR = nextElm(trElm, "TR");
								for (var x=0; x<cells.length; x++) {
									if (cells[x].rowSpan > 1) {
										var newTD = cells[x].cloneNode(true);
										var sd = getColRowSpan(cells[x]);

										newTD.rowSpan = sd.rowspan - 1;
                                        if(newTD.rowSpan == 1){
                                            newTD.removeAttribute("rowspan");
                                        }

										var nextTD = nextTR.cells[x];

										if (nextTD == null)
											nextTR.appendChild(newTD);
										else
											nextTR.insertBefore(newTD, nextTD);
									}
								}

								// Delete cells
								var lastTDElm = null;
								for (var x=0; tdElm = getCell(grid, cpos.rowindex, x); x++) {
									if (tdElm != lastTDElm) {
										var sd = getColRowSpan(tdElm);

										if (sd.rowspan > 1) {
											tdElm.rowSpan = sd.rowspan - 1;
										} else {
											trElm = tdElm.parentNode;

											if (trElm.parentNode)
												trElm._delete = true;
										}
                                        if(trElm.rowSpan == 1){
                                            trElm.removeAttribute("rowspan");
                                        }

										lastTDElm = tdElm;
									}
								}

								deleteMarked(tableElm);

								select(0, -1);
							break;

							case "mceTableInsertColBefore":
								if (!trElm || !tdElm)
									return true;

                                var book = ed.selection.getBookmark();
								var grid = getTableGrid(tableElm);
								var cpos = getCellPos(grid, tdElm);
								var lastTDElm = null;

								for (var y=0; tdElm = getCell(grid, y, cpos.cellindex); y++) {
									if (tdElm != lastTDElm) {
										var sd = getColRowSpan(tdElm);

										if (sd['colspan'] == 1) {
                                            var newTD = tdElm.cloneNode(true);
//                                            var newTD = doc.createElement(tdElm.nodeName);

                                            if(newTD.nodeName.toLowerCase() == "th"){
                                                // copy the contents of newTD, but change the text to Header #
                                                fillTextAndSelect(newTD, ed.getDoc().createTextNode("Header " + (cpos.cellindex+y+1)));
                                            }else if (!tinymce.isIE){
												newTD.innerHTML = '<br mce_bogus="1"/>';
                                            }else{
                                                newTD.innerHTML = '';
                                            }

                                            newTD.rowSpan = tdElm.rowSpan;
                                            if(newTD.rowSpan == 1){
                                                newTD.removeAttribute("rowspan");
                                            }

											tdElm.parentNode.insertBefore(newTD, tdElm);
										} else
											tdElm.colSpan++;

                                        if(tdElm.colSpan == 1){
                                            tdElm.removeAttribute("colSpan");
                                        }

                                        lastTDElm = tdElm;
									}
								}
                                ed.selection.moveToBookmark(book);

//								select();
							break;

							case "mceTableInsertColAfter":
								if (!trElm || !tdElm)
									return true;

                                var book = ed.selection.getBookmark();
								var grid = getTableGrid(tableElm);
								var cpos = getCellPos(grid, tdElm);
								var lastTDElm = null;

								for (var y=0; tdElm = getCell(grid, y, cpos.cellindex); y++) {
									if (tdElm != lastTDElm) {
										var sd = getColRowSpan(tdElm);

										if (sd['colspan'] == 1) {
                                            var newTD = tdElm.cloneNode(true);
//											var newTD = doc.createElement(tdElm.nodeName);
                                            if(newTD.nodeName.toLowerCase() == "th"){
                                                // add 2 to cellindex+y. adding 1 gets the human readable index of the right clicked cell. add 1 more for the next column
                                                fillTextAndSelect(newTD, ed.getDoc().createTextNode("Header " + (cpos.cellindex+y+2)));
                                            }else if (!tinymce.isIE){
												newTD.innerHTML = '<br mce_bogus="1"/>';
                                            }else{
                                                newTD.innerHTML = '';
                                            }

											newTD.rowSpan = tdElm.rowSpan;
                                            if(newTD.rowSpan == 1){
                                                newTD.removeAttribute("rowspan");
                                            }

											var nextTD = nextElm(tdElm, "TD,TH");
											if (nextTD == null)
												tdElm.parentNode.appendChild(newTD);
											else
												nextTD.parentNode.insertBefore(newTD, nextTD);
										} else
											tdElm.colSpan++;

                                        if(tdElm.colSpan == 1){
                                            tdElm.removeAttribute("colSpan");
                                        }

                                        lastTDElm = tdElm;
									}
								}
                                ed.selection.moveToBookmark(book);


//								select(1);
							break;

							case "mceTableDeleteCol":
								if (!trElm || !tdElm)
									return true;

								var grid = getTableGrid(tableElm);
								var cpos = getCellPos(grid, tdElm);
								var lastTDElm = null;

								// Only one col, remove whole table
								if (grid.length > 1 && grid[0].length <= 1) {
									inst.dom.remove(inst.dom.getParent(tableElm, "table"));
									return true;
								}

								// Delete cells
								for (var y=0; tdElm = getCell(grid, y, cpos.cellindex); y++) {
									if (tdElm != lastTDElm) {
										var sd = getColRowSpan(tdElm);

										if (sd['colspan'] > 1)
											tdElm.colSpan = sd['colspan'] - 1;
										else {
											if (tdElm.parentNode)
												tdElm.parentNode.removeChild(tdElm);
										}
                                        if(tdElm.colSpan == 1){
                                            tdElm.removeAttribute("colSpan");
                                        }

										lastTDElm = tdElm;
									}
								}

								select(-1);
							break;

						case "mceTableSplitCells":
							if (!trElm || !tdElm)
								return true;

							var spandata = getColRowSpan(tdElm);

							var colspan = spandata["colspan"];
							var rowspan = spandata["rowspan"];

							// Needs splitting
							if (colspan > 1 || rowspan > 1) {
								// Generate cols
								tdElm.colSpan = 1;
								for (var i=1; i<colspan; i++) {
									var newTD = doc.createElement("td");

									if (!tinymce.isIE)
										newTD.innerHTML = '<br mce_bogus="1"/>';

									trElm.insertBefore(newTD, nextElm(tdElm, "TD,TH"));

									if (rowspan > 1)
										addRows(newTD, trElm, rowspan);
								}
                                if(tdElm.colSpan == 1){
                                    tdElm.removeAttribute("colSpan");
                                }

								addRows(tdElm, trElm, rowspan);
                            }
                            if(tdElm.childNodes.length == 0) tdElm.innerHTML = '<br mce_bogus="1"/>';
                            if(typeof(value) != "undefined" && typeof(value["cell"]) == "undefined"){
                                inst.selection.select(tdElm.childNodes[0]);
                                inst.selection.collapse(true);

                                // Apply visual aids
                                tableElm = inst.dom.getParent(inst.selection.getNode(), "table");
                            }
							break;

						case "mceTableMergeCells":
							var rows = [];
							var sel = inst.selection.getSel();
							var grid = getTableGrid(tableElm);

							if (tinymce.isIE || sel.rangeCount <= 1) {
								if (user_interface) {
									// Setup template
									var sp = getColRowSpan(tdElm);

                                    // find out how many cells are allowed to be merged to the right/down
                                    var max_cols = 0; // relative to current colspan
                                    var max_rows = 0; // relative to current rowspan
                                    var temp = tdElm;
                                    while(temp && temp.nextSibling){
                                        var crs = getColRowSpan(tdElm);
                                        max_cols += crs.colspan;
                                        temp = temp.nextSibling;
                                    }
                                    var temp = trElm;
                                    while(temp && temp.nextSibling){
                                        max_rows += 1;
                                        temp = temp.nextSibling;
                                    }

                                    inst.windowManager.open({
										url : CS_BASE_URL + '/resources/scripts/tiny_mce3/plugins/table/merge_cells.htm',
										width : 360 + parseInt(inst.getLang('table.merge_cells_delta_width', 0)),
										height : 140,
										inline : 1
									}, {
										action : "update",
                                        numcols : sp.colspan,
                                        numrows : sp.rowspan,
                                        maxcols : max_cols,
                                        maxrows : max_rows,
										plugin_url : url,
                                        cs_resource_base_url : CS_RESOURCE_BASE_URL
									});

									return false;
								} else {
									var numRows = parseInt(value['numrows']);
									var numCols = parseInt(value['numcols']);

                                    var cpos = getCellPos(grid, tdElm);

									if (("" + numRows) == "NaN")
										numRows = 1;

									if (("" + numCols) == "NaN")
										numCols = 1;

									// Get rows and cells
									var tRows = tableElm.rows;
									for (var y=cpos.rowindex; y<grid.length; y++) {
										var rowCells = [];

										for (var x=cpos.cellindex; x<grid[y].length; x++) {
											var td = getCell(grid, y, x);

											if (td && !inArray(rows, td) && !inArray(rowCells, td)) {
												var cp = getCellPos(grid, td);

												// Within range
												if (cp.cellindex < cpos.cellindex+numCols && cp.rowindex < cpos.rowindex+numRows)
													rowCells[rowCells.length] = td;
											}
										}

										if (rowCells.length > 0)
											rows[rows.length] = rowCells;

										var td = getCell(grid, cpos.rowindex, cpos.cellindex);
										each(ed.dom.select('br', td), function(e, i) {
											if (i > 0 && ed.dom.getAttrib('mce_bogus'))
												ed.dom.remove(e);
										});
									}

									//return true;
								}
							} else {
								var cells = [];
								var sel = inst.selection.getSel();
								var lastTR = null;
								var curRow = null;
								var x1 = -1, y1 = -1, x2, y2;

								// Only one cell selected, whats the point?
								if (sel.rangeCount < 2)
									return true;

								// Get all selected cells
								for (var i=0; i<sel.rangeCount; i++) {
									var rng = sel.getRangeAt(i);
									var tdElm = rng.startContainer.childNodes[rng.startOffset];

									if (!tdElm)
										break;

									if (tdElm.nodeName == "TD" || tdElm.nodeName == "TH")
										cells[cells.length] = tdElm;
								}

								// Get rows and cells
								var tRows = tableElm.rows;
								for (var y=0; y<tRows.length; y++) {
									var rowCells = [];

									for (var x=0; x<tRows[y].cells.length; x++) {
										var td = tRows[y].cells[x];

										for (var i=0; i<cells.length; i++) {
											if (td == cells[i]) {
												rowCells[rowCells.length] = td;
											}
										}
									}

									if (rowCells.length > 0)
										rows[rows.length] = rowCells;
								}

								// Find selected cells in grid and box
								var curRow = [];
								var lastTR = null;
								for (var y=0; y<grid.length; y++) {
									for (var x=0; x<grid[y].length; x++) {
										grid[y][x]._selected = false;

										for (var i=0; i<cells.length; i++) {
											if (grid[y][x] == cells[i]) {
												// Get start pos
												if (x1 == -1) {
													x1 = x;
													y1 = y;
												}

												// Get end pos
												x2 = x;
												y2 = y;

												grid[y][x]._selected = true;
											}
										}
									}
								}

								// Is there gaps, if so deny
								for (var y=y1; y<=y2; y++) {
									for (var x=x1; x<=x2; x++) {
										if (!grid[y][x]._selected) {
											alert("Invalid selection for merge.");
											return true;
										}
									}
								}
							}

							// Validate selection and get total rowspan and colspan
							var rowSpan = 1, colSpan = 1;

							// Validate horizontal and get total colspan
							var lastRowSpan = -1;
							for (var y=0; y<rows.length; y++) {
								var rowColSpan = 0;

								for (var x=0; x<rows[y].length; x++) {
									var sd = getColRowSpan(rows[y][x]);

									rowColSpan += sd['colspan'];

									if (lastRowSpan != -1 && sd['rowspan'] != lastRowSpan) {
										alert("Invalid selection for merge.");
										return true;
									}

									lastRowSpan = sd['rowspan'];
								}

								if (rowColSpan > colSpan)
									colSpan = rowColSpan;

								lastRowSpan = -1;
							}

							// Validate vertical and get total rowspan
							var lastColSpan = -1;
							for (var x=0; x<rows[0].length; x++) {
								var colRowSpan = 0;

								for (var y=0; y<rows.length; y++) {
									var sd = getColRowSpan(rows[y][x]);

									colRowSpan += sd['rowspan'];

									if (lastColSpan != -1 && sd['colspan'] != lastColSpan) {
										alert("Invalid selection for merge.");
										return true;
									}

									lastColSpan = sd['colspan'];
								}

								if (colRowSpan > rowSpan)
									rowSpan = colRowSpan;

								lastColSpan = -1;
							}

							// Setup td
							tdElm = rows[0][0];
							tdElm.rowSpan = rowSpan;
							tdElm.colSpan = colSpan;
                            if(tdElm.rowSpan == 1){
                                tdElm.removeAttribute("rowspan");
                            }
                            if(tdElm.colSpan == 1){
                                tdElm.removeAttribute("colSpan");
                            }

							// Merge cells
							for (var y=0; y<rows.length; y++) {
								for (var x=0; x<rows[y].length; x++) {
									var html = rows[y][x].innerHTML;
									var chk = html.replace(/[ \t\r\n]/g, "");

									if (chk != "<br/>" && chk != "<br>" && chk != '<br mce_bogus="1"/>' && (x+y > 0))
										tdElm.innerHTML += html;

									// Not current cell
									if (rows[y][x] != tdElm && !rows[y][x]._deleted) {
										var cpos = getCellPos(grid, rows[y][x]);
										var tr = rows[y][x].parentNode;

										tr.removeChild(rows[y][x]);
										rows[y][x]._deleted = true;

										// Empty TR, remove it
										if (!tr.hasChildNodes()) {
											tr.parentNode.removeChild(tr);

											var lastCell = null;
											for (var x=0; cellElm = getCell(grid, cpos.rowindex, x); x++) {
												if (cellElm != lastCell && cellElm.rowSpan > 1)
													cellElm.rowSpan--;

												lastCell = cellElm;
											}

											if (tdElm.rowSpan > 1)
												tdElm.rowSpan--;
                                            if(tdElm.rowSpan == 1){
                                                tdElm.removeAttribute("rowspan");
                                            }
										}
									}
								}
							}

							// Remove all but one bogus br
							each(ed.dom.select('br', tdElm), function(e, i) {
								if (i > 0 && ed.dom.getAttrib(e, 'mce_bogus'))
									ed.dom.remove(e);
							});

							break;
						}

						tableElm = inst.dom.getParent(inst.selection.getNode(), "table");
						inst.addVisual(tableElm);
						inst.nodeChanged(false, true);
					}

				return true;
			}

			// Pass to next handler in chain
			return false;
		}
	});

	// Register plugin
	tinymce.PluginManager.add('table', tinymce.plugins.TablePlugin);
})();
