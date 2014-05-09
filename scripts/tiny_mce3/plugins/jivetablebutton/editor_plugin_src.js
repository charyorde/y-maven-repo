/**
 * $Id: editor_plugin_src.js 201 2007-02-12 15:56:56Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright � 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {

	tinymce.create('tinymce.plugins.JiveTableButtonPlugin', {


        $menu : null,
        cellWidth : 0,
        cellHeight : 0,

        maxWidth : 0,
        maxHeight : 0,

        insertTable : function(ed, cols, rows) {


            var border = 1;
            var bordercolor = "#000000";
            var html = '';

            // Create new table
            html += '<table ';

            html += 'class="jiveBorder" ';
            html += 'border="' + border + '" width="100%" ';
            html += 'style="border: ' + border + 'px solid ' + bordercolor + '" ';
            html += '>';
            html += "<tbody>";
            html += "<tr>";
                for (var x=0; x<cols; x++) {
                        html += '<th valign="middle" style="text-align:center;background-color:#6690BC;color:#ffffff;padding:2px;"><strong>Header ' + (x+1) + '</strong></th>';
                }
            html += "</tr>";
            for (var y=0; y<rows; y++) {
                html += "<tr>";

                for (var x=0; x<cols; x++) {
                    if (!tinymce.isIE)
                        html += '<td style="padding:2px;"><br mce_bogus="1"/></td>';
                    else
                        html += '<td style="padding:2px;"></td>';
                }
                html += "</tr>";
            }
            html += "</tbody>";
            html += "</table>";

            ed.focus();
            if(this.book) this.ed.selection.moveToBookmark(this.book);{}
            ed.undoManager.add();
//            ed.selection.setContent(html);
            ed.execCommand('mceInsertContent', false, html);
            this.book = null;
            ed.addVisual();
            ed.undoManager.add();
        },



        setMenuSize : function(w,h){
            var $innerMenu = this.$menu.find(".mceMenu");

            if(!this.$menu.is(":visible")) $innerMenu.children(":not(:nth(0))").remove();

            for(var r=0;r<h;r++){
                var $row = $innerMenu.find(".row:nth(" + r + ")");
                if(!$row.length){
                    $row = $j("<div class='row'></div>");
                    $innerMenu.append($row);
                }
                for(var c=$row.children().length;c<w;c++){
                    var $cell = $j("<div class='cell'><div class='cellInner'></div></div>");
                    $cell.css({top : r * this.cellHeight, left: c * this.cellWidth});
                    $row.append($cell);
                    if(!this.cellHeight) this.cellHeight = $cell.outerHeight(true);
                    if(!this.cellWidth) this.cellWidth = $cell.outerWidth(true);
                }
                $row.width(w*this.cellWidth);
                $row.height(this.cellHeight);
            }
            $row = $j("<div class='row label'></div>");
            $innerMenu.append($row);
            $innerMenu.width(w*this.cellWidth).height(h*this.cellHeight + $row.outerHeight(true));

            this.maxWidth = Math.max(this.maxWidth, w);
            this.maxHeight = Math.max(this.maxHeight, h);
        },

        hideMenu :function(){
            if(this.$menu) this.$menu.hide();
            this.maxWidth = 0;
            this.maxHeight = 0;
            if(this.$menu) this.$menu.find(".blue").width(0).height(0);
        },


        resetMenu :function(ed){
            if(!this.$menu){
                var that = this;
                this.$menu = $j("<div class='defaultSkin'><a href='javascript:' class='tableMenuFocusTarget' tabindex='0' style='position: absolute;'>a</a><div class='mceMenu newTable'><div class='blue'></div></div></div>").css("position", "absolute").appendTo(document.body);

                function expandTo(rows, cols){
                    cols = Math.max(cols, 1);
                    rows = Math.max(rows, 1);

                    if(cols >= that.maxWidth - 1 ||
                            rows >= that.maxHeight - 1){
                        that.setMenuSize(Math.max(cols+1, that.maxWidth), Math.max(rows + 1, that.maxHeight))
                    }

                    that.$menu.find(".label").text(cols + " x " + rows);
                    that.$menu.find(".blue").width(that.cellWidth * cols);
                    that.$menu.find(".blue").height(that.cellHeight * rows);
                }

                this.$menu.mousemove(function(e){
                    var top = e.pageY - that.$menu.offset().top;
                    var left = e.pageX - that.$menu.offset().left;

                    var rows = Math.floor((top + that.cellHeight) / that.cellHeight);
                    var cols = Math.floor((left + that.cellWidth) / that.cellWidth);

                    expandTo(rows, cols);
                    return false;
                });
                this.$menu.click(function(e){
                    var top = e.pageY - that.$menu.offset().top;
                    var left = e.pageX - that.$menu.offset().left;
                    var rows = Math.floor((top + that.cellHeight) / that.cellHeight);
                    var cols = Math.floor((left + that.cellWidth) / that.cellWidth);

                    that.hideMenu();
                    that.insertTable(ed, cols, rows);
                    return false;
                }).keydown(function(e){
                    var $blue = that.$menu.find(".blue");
                    var cols = $blue.width() / that.cellWidth;
                    var rows = $blue.height() / that.cellHeight;

                    if(e.keyCode == 37){
                        //left
                        expandTo(rows, cols-1);
                        return false;
                    }else if (e.keyCode == 38){
                        //up
                        expandTo(rows-1, cols);
                        return false;
                    }else if(e.keyCode == 39){
                        //right
                        expandTo(rows, cols+1);
                        return false;
                    }else if(e.keyCode == 40){
                        //down
                        expandTo(rows+1, cols);
                        return false;
                    }else if(e.keyCode == 13){
                        //enter
                        that.hideMenu();
                        that.insertTable(ed, cols, rows);
                        return false;
                    }else if(e.keyCode == 27){
                        //escape
                        that.hideMenu();
                        that.ed.focus();
                        if(that.book) {
                            that.ed.selection.moveToBookmark(that.book);
                            that.book = null;
                        }
                        return false;
                    }
                });
            }
            this.$menu.show();
            this.setMenuSize(3,3);
        },

		/**
		 * Initializes the plugin, this will be executed after the plugin has been created.
		 * This call is done before the editor instance has finished it's initialization so use the onInit event
		 * of the editor instance to intercept that event.
		 *
		 * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
		 * @param {string} url Absolute URL to where the plugin is located.
		 */
		init : function(ed, url) {
            var t = this;
            t.ed = ed;
            t.book = null;

            ed.onInit.add(function(){
                $j(ed.getContainer()).find("a.mce_jivetablebutton").click(function(){
                    return false;
                }).keydown(function(ev){
                    if(ev.keyCode == 13){
                        t.showTableMenu();
                        t.$menu.find("a.tableMenuFocusTarget").focus();
                        return false;
                    }
                });
            }, this);
            $j(document.body).click(function(){
                t.hideMenu();
            });
            ed.onClick.add(function(){
                this.hideMenu();
            },this)
		},


        mceJiveTableMenu : function(ed, cmd, ui, val){
            try{
                var $button = $j(ed.getContainer()).find("a.mce_jivetablebutton");

                this.resetMenu(ed);

                var pos = $button.offset();
                pos.top += $button.height();

                this.$menu.css($j.extend({zIndex:1000},pos));
            }catch(e){
                for(var foo in e){
                    console.log(foo + ": " + e[foo]);
                }
            }
        },

		/**
		 * Creates control instances based in the incomming name. This method is normally not
		 * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
		 * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
		 * method can be used to create those.
		 *
		 * @param {String} n Name of the control to create.
		 * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
		 * @return {tinymce.ui.Control} New control instance or null if no control was created.
		 */
		createControl: function(n, cm) {
            var that = this;
			switch (n) {
				case 'jivetablebutton':
                    var c = cm.createButton('jivetablebutton', {
						title : 'tabletoolbar.title',
                        onclick: function(){
                            that.showTableMenu();
                        }
                    });

				  // Return the new menubutton instance
				  return c;
			}
			return null;
		},

        showTableMenu: function showTableMenu(){
            this.ed.focus();
            this.book = this.ed.selection.getBookmark(BOOKMARKTYPE);
            this.mceJiveTableMenu(this.ed);
        },

		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname : 'Jive Table Button',
				author : 'Adam Wulf',
				authorurl : 'http://www.jivesoftware.com',
				infourl : '',
				version : "1.0"
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('jivetablebutton', tinymce.plugins.JiveTableButtonPlugin);
})();
