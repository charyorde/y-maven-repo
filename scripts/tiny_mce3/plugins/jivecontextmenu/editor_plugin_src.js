/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

// Plugin to handle the context popup menu system in a generic, stackable fashion.
(function() {
    /**
    * Create a new context menu by specifying a context locator function, and the menu structure.  The leaf menu options
    * should run functions or execCommands.
    *
    * Contexts may overlap: an image in a list in a table should display the context menus for all three, until something is selected.
    *
    * The general idea here is that the plugin has a single root Menu, which is a list of MenuItems.  Each MenuItem
    * can examine its context and determine whether it's valid or not. MenuItems have an action, which might be
    * a new submenu.
    *
    */

    function arrayEquals(left, right){
        if(left === right){
            return true;
        }
        if(left == null || right == null || left.length !== right.length){
            return false;
        }
        for(var i = 0; i < left.length; ++i){
            if(left[i] !== right[i]){
                return false;
            }
        }
        return true;
    }

    function makeFindContextNode(re){
        if(re == null){
            re = /./;
        }
        return function elementContainer(rng){
            var n = rng.startContainer.childNodes[rng.startOffset];
            if(!n){
                n = rng.startContainer;
            }
            while(n && (n.nodeType != 1 || !re.test(n.nodeName))){
                n = n.parentNode;
            }
            return n;
        };
    }

    var findCursorNode = makeFindContextNode();
    var ARROW_WIDTH = 10;

    function PositionStrategy(){
        this._bound = function bound(target, upper, lower){
            if(upper < lower){
                return null;
            }
            return Math.min(Math.max(target, lower), upper);
        };


        this._positionArrow = function(menuDims){
            return {top: menuDims.height/2.0 - 9};
        };

        this._positionMenuLeft = function(innerDims, outerDims, constraints, clickPos){
            var contextLeft = constraints.contextPos.left,
                    contextWidth = constraints.contextWidth,
                    contextMarginLeft = constraints.contextMarginLeft,
                    width = outerDims.width,
                    minX = constraints.minX - constraints.leftSlop,
                    maxX = constraints.minX + constraints.contentAreaW;
            //test four discrete positions and pick the first that works

            function decideBetween(func1, func2){
                return function(){
                    var ret = func1();
                    if(!ret) ret = func2();
                    return ret;
                };
            }

            function leftOutsidePosition(){
                //menu to the left of context node, outside
                if(contextLeft + contextMarginLeft - width - ARROW_WIDTH >= minX){
                    return {
                        left: contextLeft  + contextMarginLeft - width - ARROW_WIDTH,
                        arrowPos: "left"
                    }
                }
                //menu to the left of context node, outside, intruding on padding
                if(contextLeft + contextMarginLeft + constraints.contextPaddingLeft - width - ARROW_WIDTH >= minX){
                    return {
                        left: contextLeft  + contextMarginLeft + constraints.contextPaddingLeft - width - ARROW_WIDTH,
                        arrowPos: "left"
                    }
                }
            }
            function rightOutsidePosition(){
                //menu to right of context node, outside
                if(contextLeft + contextWidth + width + ARROW_WIDTH <= maxX){
                    return {
                        left: contextLeft + contextWidth + ARROW_WIDTH,
                        arrowPos: "right"
                    };
                }
                //menu on the right of the context node, inside
                if(contextLeft + contextWidth <= maxX){
                    return {
                        left: contextLeft + contextWidth - width - ARROW_WIDTH,
                        arrowPos: "left"
                    }
                }
            }

            function leftInsidePosition(){
                //menu on the left of the context node, inside
                if(contextLeft + contextMarginLeft >= minX){
                    return {
                        left: contextLeft + contextMarginLeft + ARROW_WIDTH,
                        arrowPos: "right"
                    }
                }
            }

            function lastOption(){
                //no way to satisfy above rules.  Default to inside right, which is likely to be almost ok
                return {
                    left: contextLeft + contextWidth - width - ARROW_WIDTH,
                    arrowPos: "left"
                }
            }


            if($j(constraints.contextNodes).filter("th,td").length){
                return decideBetween(rightOutsidePosition, decideBetween(leftOutsidePosition,decideBetween(leftInsidePosition, lastOption)))();
            }
            return decideBetween(leftOutsidePosition, decideBetween(rightOutsidePosition ,decideBetween(leftInsidePosition, lastOption)))();
        };

        this._positionMenuTop = function(innerDims, outerDims, constraints, clickPos){
            var target = constraints.cursorPos.top + constraints.cursorHeight/2,
                topBound = constraints.minY,
                bottomBound = constraints.minY + constraints.contentAreaH,
                height = outerDims.height,
                contextTop = constraints.contextPos.top + constraints.contextMarginTop,
                contextBottom = constraints.contextPos.top + constraints.contextMarginTop + constraints.contextHeight;

            var extent = height/2;
            var viewBounded = this._bound(target, bottomBound - extent, topBound + extent);
            return this._bound(viewBounded, contextBottom, contextTop) - height/2;
        };

        this.position = function(innerDims, outerDims, constraints, clickPos){
            var leftResult = this._positionMenuLeft(innerDims, outerDims, constraints, clickPos);
            var menuPos = {
                //position vertically so the arrow points at the middle of the cursor node, if that fits within the viewport.  Must fit within the context node's vertical span.
                top: this._positionMenuTop(innerDims, outerDims, constraints, clickPos),
                left: leftResult.left
            };
            return {
                menuPos: menuPos,
                menuDims: innerDims,
                arrow: this._positionArrow(innerDims),
                arrowClass: leftResult.arrowPos + "Arrow"
            }
        };
    }

    /**
     * Position the menu so that it's to whichever side of the context element has more empty space.
     */
    function EmptySpacePositionStrategy(){
        this._superPositionLeft = this._positionMenuLeft;

        this._positionMenuLeft = function(innerDims, outerDims, constraints, clickPos){
            var contextLeft = constraints.contextPos.left,
                    contextWidth = constraints.contextWidth,
                    contextMarginLeft = constraints.contextMarginLeft,
                    width = outerDims.width,
                    minX = constraints.minX - constraints.leftSlop,
                    maxX = constraints.minX + constraints.contentAreaW;

            var leftSpace = contextLeft + contextMarginLeft - minX;
            var rightSpace = maxX - (contextLeft + contextWidth + width);
            if(leftSpace > rightSpace && leftSpace >= outerDims.width){
                //left-outside
                return {
                    left: contextLeft  + contextMarginLeft - width - ARROW_WIDTH,
                    arrowPos: "left"
                }
            }else if(leftSpace <= rightSpace && rightSpace >= outerDims.width){
                return {
                    left: contextLeft + contextWidth + ARROW_WIDTH,
                    arrowPos: "right"
                };
            }else{
                return this._superPositionLeft(innerDims, outerDims, constraints, clickPos);
            }
        };

    }
    EmptySpacePositionStrategy.prototype = new PositionStrategy();

    /**
     * Keep the menu in the same place, but don't have it falling off the screen if it grows.
     */
    function StaticPositionStrategy(){
        var contextPlugin = tinymce.activeEditor.plugins.jivecontextmenu;

        //topOffset keeps the arrow in the same absolute positon when changing the menu dimensions
        function topOffset(oldHeight, newHeight){
            return (oldHeight - newHeight)/2.0;
        }

        this.position = function(innerDims, outerDims, constraints, clickPos){
            var deltaTop = topOffset(contextPlugin.lastPosition.menuDims.height, innerDims.height);
            var deltaLeft = 0;
            if(contextPlugin.$arrow.hasClass("leftArrow")){
                deltaLeft = contextPlugin.lastPosition.menuDims.width - innerDims.width;
            }
            var props = $j.extend(true, {}, contextPlugin.lastPosition, {menuDims: innerDims});
            props.menuPos.top += deltaTop;
            props.menuPos.left += deltaLeft;
            props.menuPos.left = this._bound(props.menuPos.left, constraints.minX + constraints.contentAreaW, constraints.minX - constraints.leftSlop);
            return $j.extend(true, props, {arrow: this._positionArrow(props.menuDims)});
        };
    }
    StaticPositionStrategy.prototype = new PositionStrategy();


    tinymce.create('tinymce.plugins.JiveContextMenuPlugin', {
        /**
         * MenuItem class.  Has submenu, function callback, or command, plus resources, and knows how to render itself.
         * @param id {string} an id for the menu item.  Needs to be unique within the Menu object the item is attached to.
         * @param findContextNode {function, RegExp} function(rng), returns the context node for the menu item, or null.
         *  Or a regexp to match the nodeName. May also be null, in which case contextNode will be the cursor node.
         * @param title {string} title text
         * @param renderer {function, string, object} function(item, ed, $menu)->Element or image URL string, or object of the form
         *  {
         *      url: "url",
         *      xOffset: x,
         *      yOffset: y,
         *      width: w,
         *      height: h
         *  }
         * where x, y, w, h are in pixels.
         * @param action {function, string, or Menu} Return true from the function to hide the menu after running the action.
         * A string is the execCommand to execute.  A Menu is a submenu to display.
         * @param getDims {function} returns the dimensions of the rendered object.  Overridden by the object form of render.
         * @param mouseenter {function} this will be the MenuItem.
         * @param mouseleave {function} this will be the MenuItem.
         * @param displayCallback {function} function(contextNode, menuItemNode) Called when the menu is displayed. this will be the MenuItem.
         */
        MenuItem: function(id, findContextNode, title, renderer, action, getDims, mouseenter, mouseleave, displayCallback){
            var ed = tinymce.activeEditor;

            if(!findContextNode){
                findContextNode = makeFindContextNode();
            }else if(findContextNode.constructor == RegExp){
                findContextNode = makeFindContextNode(findContextNode);
            }

            var renderFunction;
            if(typeof(renderer) == "string"){
                //string is an image URL
                renderFunction = function(){
                    var $elem = $j("<a class='button' href='javascript:;' style='float: left; width: auto; height: auto;'></a>");
                    return $elem.append("<img src='" + renderer + "' />").get(0);
                }
            }else if(typeof(renderer) == "function"){
                //function is a complete render function
                renderFunction = renderer;
            }else{
                //object is a shorthand style specification
                var styleObj = {
                    backgroundImage: "url(" + renderer.url + ")",
                    backgroundPosition: -renderer.xOffset + "px " + (-renderer.yOffset) + "px",
                    width: renderer.width + "px",
                    height: renderer.height + "px"
                };

                if(!getDims){
                    //default dims to width and heigh of rendered content
                    getDims = function(n){
                        return {
                            width: renderer.width,
                            height: renderer.height
                        };
                    };
                }

                renderFunction = function(){
                    var $elem = $j("<a class='button' href='javascript:;' style='float: left;'></a>");
                    $elem.css(getDims());
                    var $div = $j("<div />").css(styleObj);
                    return $elem.append($div).get(0);
                };
            }

            var actionHandler;
            if(typeof(action) == "string"){
                //String is a command to execute.  Closes the menu after by returning true.
                actionHandler = function(node, rng){
                    ed.execCommand(action, false, {node: node,
                        rng: rng});
                    return true;
                }
            }else if(typeof(action) == "function"){
                actionHandler = action;
            }else{
                //action is a submenu
                actionHandler = function(node, rng){
                    action.show(ed, rng, null, action.items);
                }
            }

            if(!getDims){
                getDims = function(n){
                    return {
                        width: 20,
                        height: 20
                    };
                };
            }else if(typeof(getDims) == "object"){
                var dims = getDims;
                getDims = function(){
                    return dims;
                };
            }

            //distance is the number of parentNode hops from the cursor to the context node
            function distance(rng){
                var context = this.findContextNode(rng);
                if(context){
                    var distance = 0;
                    var n = rng.startContainer.childNodes[rng.startOffset];
                    if(!n){
                        ++distance;
                        n = rng.startContainer;
                    }
                    while(n != context){
                        n = n.parentNode;
                        ++distance;
                    }
                    return distance;
                }
                return -1
            }

            $j.extend(this, {
                id: id,
                findContextNode: findContextNode,
                distance: distance,
                title: title,
                render: renderFunction,
                action: $j.proxy(actionHandler, this),
                getDims: getDims,
                mouseenter: mouseenter ? $j.proxy(mouseenter, this) : null,
                mouseleave: mouseleave ? $j.proxy(mouseleave, this) : null,
                displayCallback: displayCallback ? $j.proxy(displayCallback, this) : null
            });
        },

        PositionStrategy: PositionStrategy,
        StaticPositionStrategy: StaticPositionStrategy,

        MenuDisplayManager: function(ed, isVertical){
            var contextPlugin = ed.plugins.jivecontextmenu;
            var MAX_DIST = 300;

            this.isVertical = isVertical;

            var defaultPositionStrategy = new EmptySpacePositionStrategy();
            var staticPositionStrategy = new StaticPositionStrategy();

            var arrayEquals = ed.plugins.jiveutil.arrayEquals;

            $j.extend(this, {
                lastItems: null, //Item cache

                renderItems: function(rng, menu, contextPlugin, items){
                    var $menuItemContainer = menu.getDOM();
                    var $menu = contextPlugin.$menu;

                    if(!arrayEquals(this.lastItems, items)){
                        this.lastItems = items;
                        //items have changed; re-render them to $menu
                        $menuItemContainer.children().remove();
                        $j.each(items, function(){
                            var item = this;

                            var $elem = $j(item.render(item, ed, contextPlugin.$menu)).addClass("menuItem_" + item.id);

                            //hook up title change events
                            if(menu.title != null && item.title != null){
                                function getShowTitle(title){
                                    return function(){
                                        contextPlugin.setItemTitle(title);
                                    }
                                }
                                $elem.mouseenter(getShowTitle(item.title));
                            }

                            //hook up hover and action
                            $elem.click(function(evt){
    //                            try{
                                    if(tinymce.isIE){
                                        //IE has no concept of cursor pos when the editor isn't focused.
                                        ed.focus();
                                    }
                                    var rng = ed.selection.getRng(true);
                                    var node = item.findContextNode(rng);
                                    contextPlugin.clearHideTimeout();
                                    var ret = item.action(node, rng);
                                    if(ret !== false){
                                        //an action can return false to prevent menu teardown, but mostly, it's the right thing to do.
                                        menu.tearDownMenu();
                                    }
                                    if(ret === true){
                                        //an action can return true to hide the menu after execution
                                        menu.hide();
                                    }
                                    return false;
    //                            }catch(ex){
      //                              console.log("Exception in menu action: ", ex);
        //                        }
                            });
                            if(item.mouseenter){
                                $elem.mouseenter(item.mouseenter);
                            }
                            if(item.mouseleave){
                                $elem.mouseleave(item.mouseleave);
                            }
                            $menuItemContainer.append($elem);
                        });
                    }
                    $menu.find(".menuItems").hide(); //hide any other visible menuItem containers
                    $menuItemContainer.show();

                    //notify each item that it is being displayed
                    $j.each(items, function(){
                        if(this.displayCallback){
                            var contextNode = this.findContextNode(rng);
                            this.displayCallback(contextNode, $menuItemContainer.children(".menuItem_"+this.id).get(0));
                        }
                    });
                },

                getConstraints: function(ed, cursorNode, items){
                    var rng = ed.selection.getRng(true);
                    var jivescroll = ed.plugins.jivescroll;
                    var contextPlugin = ed.plugins.jivecontextmenu;

                    function pxFromCss(val){
                        var ret = parseFloat(val);
                        return isNaN(ret) ? 0 : ret;
                    }

                    var contextNode = items[0].findContextNode(rng);
                    var contextNodes = [];
                    $j.each(items, function(){
                        var node = this.findContextNode(rng);
                        if(node) contextNodes.push(node);
                    });
                    var $contextNode = $j(contextNode);
                    var contextMarginTop = pxFromCss($contextNode.css("margin-top"));
                    var contextMarginLeft = pxFromCss($contextNode.css("margin-left"));

                    var $cursorNode = $j(cursorNode);

                    return {
                        contentAreaH: contextPlugin.rte.getContentAreaHeight(),
                        contentAreaW: contextPlugin.rte.getContentAreaWidth(),
                        minY: jivescroll.lastScrollY,
                        minX: jivescroll.lastScrollX, //the RTE is 40px in from the outer viewport edge
                        leftSlop: 40,

                        contextNode: contextNode,
                        contextNodes: contextNodes,
                        contextPos: $contextNode.position(),
                        contextHeight: $contextNode.outerHeight() + contextMarginTop,
                        contextWidth: $contextNode.outerWidth() + contextMarginLeft,
                        contextMarginTop: contextMarginTop,
                        contextMarginLeft: contextMarginLeft,
                        contextPaddingLeft: pxFromCss($contextNode.css("padding-left")),

                        cursorPos: $cursorNode.position(),
                        cursorHeight: $cursorNode.outerHeight(true),
                        cursorPaddingLeft: pxFromCss($cursorNode.css("padding-left"))
                    };
                },

                findDimensions: function(menu, items){
                    //first, compute dimensions
                    var dims = {
                        width: 0,
                        height: 0
                    };

                    if(this.isVertical){
                        $j.each(items, function(){
                            var itemDims = this.getDims();
                            dims.width = Math.max(itemDims.width, dims.width);
                            dims.height += itemDims.height;
                        });
                        dims.width += 6; //margins
                        dims.height += (items.length) * 6; //internal margins
                    }else{
                        $j.each(items, function(){
                            var itemDims = this.getDims();
                            dims.width += itemDims.width;
                            dims.height = Math.max(itemDims.height, dims.height);
                        });
                        dims.width += (items.length) * 6; //internal margins
                        dims.height += 6; //margins
                    }

                    if(menu.title != null && !this.isVertical){
                        var longTitle = "";
                        $j.each(items, function(){
                            //find the longest title among the items
                            if(this.title != null && this.title.length > longTitle){
                                longTitle = this.title;
                            }
                        });

                        contextPlugin.setMenuTitle(menu.title);

                        //use the longest title to compute width for the $textLabel
                        var textDims = contextPlugin.getTextDims(menu.title, longTitle + "m");
                        dims.width = Math.max(dims.width, textDims.width + 6);
                        dims.height += textDims.height;

                        contextPlugin.setItemTitle("");
                        contextPlugin.$textLabel.show();
                    }else{
                        contextPlugin.$textLabel.hide();
                    }

                    var outerDims = {
                        width: dims.width + 10, //border and padding
                        height: dims.height + 10 //border and padding
                    };

                    return {
                        inner: dims,
                        outer: outerDims
                    };
                },

                position: function(dims, outerDims, constraints, clickPos){
                    //if we're too far from the click point, switch to clickPositionStrategy, if possible.
                    //Also, if we were using click postitioning before, and it's a menu navigation (clicking on a submenu), don't move the menu.
                    function isToFar(pos, objBounds){
                        function dist(x1, y1, x2, y2){
                            var dx = x1-x2;
                            var dy = y1-y2;
                            return Math.sqrt(dx*dx + dy*dy);
                        }

                        //check each corner
                        var x1 = pos.x,
                            y1 = pos.y,
                            x2 = objBounds.left,
                            y2 = objBounds.top;
                        //NW
                        if(dist(x1, y1, x2, y2) <= MAX_DIST){
                            return false;
                        }
                        //NE
                        x2 += objBounds.width;
                        if(dist(x1, y1, x2, y2) <= MAX_DIST){
                            return false;
                        }
                        //SE
                        y2 += objBounds.height;
                        if(dist(x1, y1, x2, y2) <= MAX_DIST){
                            return false;
                        }
                        //SW
                        x2 -= objBounds.width;
                        return dist(x1, y1, x2, y2) > MAX_DIST;
                    }

                    var isVisible = contextPlugin.$menu.filter(":visible").length > 0;

                    var pos = null;
                    if(isVisible){
                        pos = staticPositionStrategy.position(dims, outerDims, constraints, clickPos);
                    }
                    if(!pos){
                        pos = defaultPositionStrategy.position(dims, outerDims, constraints, clickPos);
                    }
                    contextPlugin.$arrow.removeClass().addClass(pos.arrowClass + ' pointer');

                    return pos;
                },

                clip: function(props, constraints){
                    //clip the menu to the viewport
                    if(props.menuPos.top + props.menuDims.height < constraints.minY - 3){
                        // if the bottom is above the viewable area of the RTE,
                        // then remove the menu, but allow a bit of buffer
                        return null;
                    }else if(props.menuPos.top > constraints.minY + constraints.contentAreaH){
                        // if the top of the menu starts below the viewable area
                        // of the RTE, then just remove it
                        return null;
                    }else if(props.menuPos.left + props.menuDims.width < constraints.minX - constraints.leftSlop){
                        // if the right is left of the viewable area of the RTE,
                        // then remove the menu
                        return null;
                    }else if(props.menuPos.left > constraints.minX + constraints.contentAreaW){
                        // if the left is right of the viewable area
                        // of the RTE, then just remove it
                        return null;
                    }else{
                        return props;
                        //Menu is in bounds.  Show it.
                    }
                },

                layoutMenu: function layoutMenu(menu, cursorNode, pos, items, ed){
                    this.renderItems(ed.selection.getRng(true), menu, contextPlugin, items);

                    var constraints = this.getConstraints(ed, cursorNode, items);
                    var dims = this.findDimensions(menu, items);
                    var props = this.position(dims.inner, dims.outer, constraints, pos);

                    //Now, we've figured out where to put the menu.  It still may be out of bounds, so check that before display.
                    return this.clip(props, constraints);
                }
            });
        },

        /**
         * The Menu object.  Represents a collection of menu items, which it manages.  Can be shown and hidden.
         * This class handles all the popover positioning magic.
         * @param menuItems {Array} List of menu items.  May be empty or null.
         * @param fixedOrder {boolean} True if order of items is list order, false to sort by context distance.
         * @param isVertical {boolean} True to render the list vertically, false for horizontal.
         * @param title {string} menu title.  Menu does not display titles if set to null.
         * @param mouseenter {function} mouseenter handler for menu. Optional.
         * @param mouseleave {function} mouseleave handler for menu. Optional.
         */
        Menu: function(menuItems, fixedOrder, isVertical, title, mouseenter, mouseleave, displayManager){
            if(menuItems == null){
                menuItems = [];
            }

            var contextPlugin = tinymce.activeEditor.plugins.jivecontextmenu;

            if(displayManager == null){
                displayManager = new contextPlugin.MenuDisplayManager(tinymce.activeEditor, isVertical);
            }

            var that = this;

            var $menuPopover = contextPlugin.$menuPopover;
            var $menu = contextPlugin.$menu;
            var $arrow = contextPlugin.$arrow;

            var $menuItemContainer = $j("<div class='menuItems'></div>");
            $menuItemContainer.hide();
            if(mouseenter != null){
                mouseenter = $j.proxy(mouseenter, this);
                $menuPopover.mouseenter(mouseenter);
            }
            if(mouseleave != null){
                mouseleave = $j.proxy(mouseleave, this);
                $menuPopover.mouseleave(mouseleave);
            }
            contextPlugin.$menu.append($menuItemContainer);

            function tearDownMenu(){
                if(mouseenter){
                    $menuPopover.unbind("mouseenter", mouseenter);
                }
                if(mouseleave){
                    $menuPopover.unbind("mouseleave", mouseleave);
                }
            }

            //Hide the menu
            function hide(){
                $menuPopover.find(".menuItems").hide();
                $menuPopover.hide();
                tearDownMenu();
                contextPlugin.onHideMenu.dispatch(that);
                contextPlugin.clearHideTimeout();
            }

            //Show the menu, if there are valid items
            /**
             * Show the menu.
             * @param ed {Editor} The editor
             * @param rng {Range} The cursor position from which to calculate the context node.
             * @param pos {object} The document-absolute mouse position, in pixels.  {x: number, y: number}
             * @param items {Array} Optional.  If specified, the items to display in the order to display them.
             * If not specified, each item in the menu is checked for context, and optionally ordered
             * by distance (depending on the fixedOrder Menu construction parameter).
             */
            function show(ed, rng, pos, items){
                function getValidItems(){
                    var itemList = [];
                    //figure out what menus are valid, order them by distance
                    var validItems = {};
                    $j.each(that.items, function(){
                        validItems[this.id] = this.distance(rng);
                    });
                    //make a copy of the menus, sorted by distance
                    itemList = that.items.slice();
                    if(!fixedOrder){
                        itemList.sort(function(left, right){
                            return validItems[left.id] - validItems[right.id];
                        });
                    }
                    //remove the ones with negative distances
                    itemList = $j.map(itemList, function(item){
                        return (validItems[item.id] < 0) ? null : item;
                    });

                    return itemList;
                }

                if(items == null){
                    items = getValidItems();
                }

                if(items.length == 0){
                    this.hide();
                }else{
                    var cursorNode = findCursorNode(rng);
                    displayMenu(cursorNode, pos, items, ed);
                    contextPlugin.onShowMenu.dispatch(that);
                }
            }

            function displayMenu(cursorNode, pos, items, ed){
                var props = displayManager.layoutMenu(that, cursorNode, pos, items, ed);
                if(props){
                    if($menuPopover.is(":visible")){
                        //menu is already visible, animate into new config
                        var setFocus = false;
                        if($menuPopover.has(document.activeElement).length > 0){
                            setFocus = true;
                        }
                        $arrow.hide().css(props.arrow);
                        $menuPopover.animate(props.menuPos, {
                            complete: function(){
                                $arrow.show();
                                $menuPopover.find("a:visible, input:visible").first().focus();
                            }
                        });
                        $menu.animate(props.menuDims);
                    }else{
                        //menu is not visible, just bring it up
                        $arrow.css(props.arrow);
                        $menuPopover.css(props.menuPos);
                        $menu.css(props.menuDims);
                        $menuPopover.show();
                        contextPlugin.createHideTimeout(ed);
                    }

                    contextPlugin.lastPosition = props;
                }else{
                    that.hide();
                }
            }

            function isVisible(){
                return $menuItemContainer.is(":visible");
            }

            function getDOM(){
                return $menuItemContainer;
            }

            //public interface
            $j.extend(this, {
                items: menuItems,
                show: show,
                hide: hide,
                tearDownMenu: tearDownMenu,
                title: title,
                isVisible: isVisible,
                getDOM: getDOM
            });
        },

        setRootMenu: function(menu){
            this.rootMenu = menu;
        },

        addRootItem: function(item){
            this.rootMenu.items.push(item);
        },

        hideMenu: function(){
            if(this.rootMenu){
                this.rootMenu.hide();
            }
            this.clearHideTimeout();
        },

        setItemTitle: function(text){
            this.$textLabel.children(".itemTitle").text(text);
        },

        setMenuTitle: function(text){
            this.$textLabel.children(".menuTitle").text(text);
        },

        getTextDims: function(menuTitle, itemTitle){
            var oldItemTitle = this.$textLabel.children(".itemTitle").text();
            var oldMenuTitle = this.$textLabel.children(".menuTitle").text();

            this.setMenuTitle(menuTitle);
            this.setItemTitle(itemTitle);
            var ret = {};

            var isVisible = this.$textLabel.is(":visible");
            this.$poc.append(this.$textLabel);
            this.$textLabel.show().css("opacity", "0%").css("position", "absolute");

            ret.width = this.$textLabel.outerWidth(true);
            ret.height = this.$textLabel.outerHeight(true);

            this.$textLabel.css("opacity", "").css("position", "");
            if(!isVisible){
                this.$textLabel.hide();
            }
            this.$menu.prepend(this.$textLabel);

            this.setMenuTitle(oldMenuTitle);
            this.setItemTitle(oldItemTitle);

            return ret;
        },

        makeFindContextNode: makeFindContextNode,

        rte: null, //set in rte.js

        rootMenu: null,
        $menuPopover: null, //constructed during init
        $menu: null, //constructed during init

        fullPopOverWidth: 230,
        fullPopOverHeight: 400,
        MENU_TIMEOUT: 2000, //2000ms

        // we track this for hide on scroll.
        lastPosition : null,

        // holds the id for the timeout that will hide
        // the popover if its not clicked on
        theHideTimeout: null,
        /**
         * Hide the menu after 2 seconds.
         * @param ed
         * @param menu {Menu} The menu object to hide
         */
        createHideTimeout: function(ed){
            this.clearHideTimeout();
            var that = this;
            this.theHideTimeout = setTimeout(function(){
                that.hideMenu();
            }, this.MENU_TIMEOUT);
        },
        clearHideTimeout: function(){
            if(this.theHideTimeout != null){
                clearTimeout(this.theHideTimeout);
                this.theHideTimeout = null;
            }
        },

        setRTE : function(rte){
            this.rte = rte;
            this.completeInit();
        },

        completeInit : function(){
            if(this.rte && !this.initialized){
                this.initialized = true;
                var $poc = this.rte.getPopOverContainer();
                $poc.append(this.$menuPopover);
                this.$poc = $poc;
            }
        },

        init : function(ed){
            var that = this;

            this.onShowMenu = new tinymce.util.Dispatcher();
            this.onHideMenu = new tinymce.util.Dispatcher();

            var lastPos = null;
            function showIfMoved(pos){
                if(pos){
                    lastPos = pos;
                }else{
                    pos = lastPos; //resize events won't have coordinates; use the last ones.
                }
                if(that.rootMenu && ed.selection){
                    //TODO: make sure something has changed, so we don't re-show a menu already dismissed.
                    that.rootMenu.hide();
                    that.rootMenu.show(ed, ed.selection.getRng(true), pos);
                }
            }

            function hideMenu(){
                that.hideMenu();
            }

            function clickHandler(ed, evt){
                var jivescroll = ed.plugins.jivescroll;
                //need to translate from viewport space to document space
                var pos = {
                    x: evt.clientX + jivescroll.lastScrollX,
                    y: evt.clientY + jivescroll.lastScrollY
                };
                that.lastPosition = null;
                showIfMoved(pos);
            }
            ed.onClick.add(clickHandler);
            ed.addShortcut("alt+c", "Context Menu", function(){
                showIfMoved();
                that.clearHideTimeout();
                that.$menuPopover.find("a").first().focus();
            });
            if(tinymce.isIE){
                //IE doesn't raise a click event on images the first time they're clicked.  We get mouseup though.
                ed.onMouseUp.add(function(ed, evt){
                    if(evt.target.nodeName.toLowerCase() == "img"){
                        clickHandler(ed, evt);
                    }
                });
            }

            ed.onKeyDown.addToTop(function(){
                if(that.theHideTimeout != null){
                    hideMenu();
                }
            });

            function resizeHandler(){
                showIfMoved();
            }
            ed.theme.onResize.add(resizeHandler);
            $j(window).resize(resizeHandler);

            var mceIframeRow = $j(ed.getContainer()).children('table:first tr.mceIframeRow');
            ed.onScroll.add(function(scrollX, scrollY){
                if(this.lastPosition){
                    if((this.lastPosition.menuPos.top + 20) - scrollY <= 0){
                        hideMenu();
                    }else{
                        var contentAreaH = mceIframeRow.height();
                        if((this.lastPosition.menuPos.top + 20) - scrollY >= contentAreaH){
                            hideMenu();
                        }
                    }
                }
            }, this);

            ed.onInit.add(function(){
                this.completeInit();
            }, this);

            this.$menuPopover = $j("<div class='j-pop js-pop j-rte-popover j-table-popover popover'>"
                    + "<div class='j-pop-main j-rte'>"
                        + "<h3 class='textLabel'><span class='menuTitle'></span><span class='itemTitle'></span></h3>"
                    + "</div>"
                    + "<span class='pointer'></span>"
                + "</div>");
            this.$menu = this.$menuPopover.children(".j-pop-main");
            //construct $menu, the Menu's container.
            this.$menuPopover.css("position", "absolute").hide();
            this.$arrow = this.$menuPopover.children(".pointer");
            this.$textLabel = this.$menu.children(".textLabel");
            this.$menuPopover.mouseenter(function(){
                that.clearHideTimeout();
            }).mouseleave(function(){
                if(that.rootMenu.isVisible()){
                    that.createHideTimeout(ed);
                }
            }).keydown(function(ev){
                if(ev.keyCode == 27){ //esc
                    hideMenu();
                    ed.focus();
                    return false;
                }
            });

            var rootMenu = new this.Menu([], false, true);
            this.setRootMenu(rootMenu);
        },

        getInfo : function() {
            return {
                longname : 'Jive Context',
                author : 'Jive Software',
                authorurl : 'http://jivesoftware.com',
                infourl : 'http://jivesoftware.com',
                version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
            };
        }


    });
	// Register plugin
	tinymce.PluginManager.add('jivecontextmenu', tinymce.plugins.JiveContextMenuPlugin);})();
