/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace("Accessibility");

jive.Accessibility = jive.oo.Class.extend(function(protect){

    protect.init = function init(options){
        var that = this;
        this.hotkeys = {};

        options = $j.extend({}, {
            hoverSelection: false,
            focusableSelector: jive.Accessibility.DEFAULT_FOCUSABLE_SELECTOR,
            focusOnHover: true //irrelevant if hoverSelection is false
        }, options);

        this._$keydownScope = $j(options.scope);
        if(options.hotkeys){
            $j.each(options.hotkeys, function(){
                var hk = this;
                that.addHotkey(hk.ch, hk.ctrl, hk.alt, hk.shift, hk.action);
            });
        }

        if(options.otherActions){
            this._$keydownScope.on("keydown.jiveAccess", function(ev){
                if(protect.isTextField(ev.target)){
                    return;
                }

                for(var i = 0; i < options.otherActions.length; ++i){
                    var ret = options.otherActions[i](ev);
                    if(ret === false){
                        return false;
                    }
                }
            });
        }

        if(options.hoverSelection){
            this._$keydownScope.on("mousemove.jiveAccess", function(ev){
                //move selection to the item we're hovering over
                var $focusTarget = $j(ev.target).closest(options.focusableSelector);
                that._$keydownScope.find("." + jive.Accessibility.SELECTED_CLASS).removeClass(jive.Accessibility.SELECTED_CLASS);
                $focusTarget.addClass(jive.Accessibility.SELECTED_CLASS);

                //Move focus too, if it isn't suppressed.
                if(options.focusOnHover){
                    $focusTarget.focus();
                }
            });
        }
    };

    this.teardown = function(){
        this._$keydownScope.off("keydown.jiveAccess mousemove.jiveAccess");
    };

    var isMac = navigator.userAgent.indexOf('Mac') != -1;

    this.addHotkey = function addHotkey(ch, ctrl, alt, shift, action){
        if(typeof ch != "string" || !/^[a-z]$/i.test(ch)){
            throw new Error("hotkeys require an alphabet character");
        }

        if(!this._hotkeyHandler){
            this._hotkeyHandler = this.hotkeyHandler.bind(this);
            this._$keydownScope.on("keydown.jiveAccess", this._hotkeyHandler);
        }

        var hk = {
            ctrl: !!ctrl,
            alt: !!alt,
            shift: !!shift,
            charCode: ch.charCodeAt(0),
            keyCode: ch.toUpperCase().charCodeAt(0),
            action: action
        };
        var key = (hk.shift ? "shift+" : "") + (hk.ctrl ? "ctrl+" : "") + (hk.alt ? "alt+" : "") + ch.toUpperCase();
        this.hotkeys[key] = hk;
    };

    protect.isTextField = function (target){
        return $j(target).filter('textarea, input, *[contentEditable="true"]')
            .not("input[type=radio], input[type=checkbox], input[type=submit], input[type=file], input[type=image], input[type=reset], input[type=button]").length > 0;
    };

    protect.hotkeyHandler = function hotkeyHandler(ev){
        if(!(ev.metaKey || ev.ctrlKey || ev.altKey) && this.isTextField(ev.target)){
            //Ignore what might be normal typing in regular text inputs
            return;
        }

        var key = "";

        if (ev.shiftKey){
            key += "shift+";
        }
        if ((isMac && ev.metaKey) || ev.ctrlKey){
            key += "ctrl+";
        }
        if (ev.altKey){
            key += "alt+";
        }
        key += String.fromCharCode(ev.keyCode);

        if(this.hotkeys[key]){
            this.hotkeys[key].action(ev);
        }
    };

});
jive.Accessibility.filterFocusable = function filterFocusable($focusable){
    return $focusable.filter(":visible").not(":disabled");
};

jive.Accessibility.DEFAULT_FOCUSABLE_SELECTOR = "a, input, select, textarea, button";
jive.Accessibility.SELECTED_CLASS = "j-selected";

jive.Accessibility.focusAction = function(element){
    return function focusAction(){
        $j(element).focus();
    }
};

jive.Accessibility.clickAction = function(element, focusTarget){
    return function clickAction(){
        if(!focusTarget){
            focusTarget = element;
        }
        $j(focusTarget).focus();
        $j(element).click();
    }
};

jive.Accessibility.focusRingAction = function(container, focusableSelector){
    if(!focusableSelector){
        focusableSelector = jive.Accessibility.DEFAULT_FOCUSABLE_SELECTOR;
    }

    function focusable() {
        return jive.Accessibility.filterFocusable($j(container).find(focusableSelector));
    }

    return function focusRingAction(ev){
        if(65 <= ev.keyCode && ev.keyCode <= 90){
            var $focusable = focusable(),
                ch = String.fromCharCode(ev.keyCode), //this will do weird things for certain chars, but it's better than not handling things with accent marks.  I think.
                i, $elem,
                currentIndex = $focusable.index($j(container).get(0).ownerDocument.activeElement);
            if(currentIndex >= 0){
                //Find a node s.t. node.text().startsWith(char(ev.keyCode)) and $focusable.index(node) > currentIndex mod $focusable.length
                for(i = (currentIndex + 1) % $focusable.length; i != currentIndex; i = (i + 1) % $focusable.length){
                    $elem = $focusable.eq(i);
                    if($elem.text().charAt(0).toUpperCase() == ch){
                        $elem.focus();
                        return false;
                    }
                }
            }else{
                for(i = 0; i < $focusable.length; ++i){
                    $elem = $focusable.eq(i);
                    if($elem.text().charAt(0).toUpperCase() == ch){
                        $elem.focus();
                        return false;
                    }
                }
            }
        }
    }
};

jive.Accessibility.menuSelectAction = function (container, focusableSelector, moveFocus){
    if(!focusableSelector){
        focusableSelector = jive.Accessibility.DEFAULT_FOCUSABLE_SELECTOR;
    }

    function focusable() {
        return jive.Accessibility.filterFocusable($j(container).find(focusableSelector));
    }

    return function menuSelectAction(ev){
        if($j(ev.target).is("select, input:radio, input:text, textarea")){
            return;
        }

        if(ev.keyCode == 38 || ev.keyCode == 40 || ev.keyCode == 9){
            var $focusable = focusable(),
                index,
                focusedElement = $focusable.find("." + jive.Accessibility.SELECTED_CLASS);
            if(focusedElement.length == 0){
                focusedElement = $j(container).get(0).ownerDocument.activeElement;
            }
            index = $focusable.index(focusedElement);

            $focusable.removeClass(jive.Accessibility.SELECTED_CLASS);
            if(ev.keyCode == 38 || (ev.keyCode == 9 && ev.shiftKey)){ //up-arrow or shift-tab
                if(index <= 0){
                    index = $focusable.length - 1;
                }else{
                    index -= 1;
                }
            }else{ //down-arrow or tab
                if(index == $focusable.length - 1){
                    index = 0;
                }else{
                    index += 1;
                }
            }
            $focusable.eq(index).addClass(jive.Accessibility.SELECTED_CLASS);
            if(moveFocus){
                $focusable.eq(index).focus();
            }
            return false;
        }
    }
};


jive.Accessibility.main = new jive.Accessibility({scope: "body"});
