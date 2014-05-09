function fontFace(face) {
	if (tinymce.isOpera) {
		return '&quot;' + face + '&quot;';
	} else {
		return face;
	}
}

function trimContent(content) {
    content = content.replace(/<p><\/p>$/, '');

	if (tinymce.isOpera)
		return content.replace(/^<p>&nbsp;<\/p>/, '').replace(/<p>&nbsp;<\/p>$/, '');

	return content;
}

function normalizeContentWhitespace(content){
    return trimContent(content.replace(/[\r\n]+/g, ''));
}

function stripIEProblems(ed, html){
    //TODO: normalize styles instead
    var elem = $j("<div>" + html + "</div>").find("*").removeAttr("style").end()
            .find("img").removeAttr("height").removeAttr("width").end().get(0);
    return ed.serializer.serialize(elem, {format: "html", getInner: true});
}

function checkContent(ed, expected, message, stripProblems){
    if(message == null){
        message = "Document content";
    }

    var actual = ed.getContent();
    actual = actual.replace(/(_jivemacro_uid_\d+)/gi, "").replace(/( _jivemacro_uid=['"][^"']*['"])/gi, "");
    actual = normalizeContentWhitespace(actual);
    expected = normalizeContentWhitespace(expected);
    if(actual == expected){
        equal(actual, expected, message);
    }else{
        if(tinymce.isIE || stripProblems){
            actual = normalizeContentWhitespace(stripIEProblems(ed, actual));
            expected = normalizeContentWhitespace(stripIEProblems(ed, expected));
        }
        equal(actual, expected, message);
    }
}

function rangeEqual(value, expected){
    var result = equal(value.startContainer, expected.startContainer, "start container");
    if(!result){
        console.error("start container mismatch: actual, expected", value.startContainer, expected.startContainer);
    }
    equal(value.startOffset, expected.startOffset, "start offset");
    if(expected.collapsed && value.collapsed){
        ok(true, "collapsed");
    }else{
        result = equal(value.endContainer, expected.endContainer, "end container");
        if(!result){
            console.error("end container mismatch: actual, expected", value.endContainer, expected.endContainer);
        }
        equal(value.endOffset, expected.endOffset, "end offset");
    }
}

function near(testVal, targetVal, err, msg){
    if(!msg){
        msg = "";
    }
    var diff = testVal - targetVal;
    if(diff > err){
        msg += " ERR: " + testVal + " > " + targetVal + " + " + err;
        console.log(msg);
        ok(false, msg);
    }else if(-diff > err){
        msg += " ERR: " + testVal + " < " + targetVal + " - " + err;
        console.log(msg);
        ok(false, msg);
    }else{
        ok(true, msg);
    }
}

/**
 * Fakes a mouse event.
 *
 * @param {Element/String} e DOM element object or element id to send fake event to.
 * @param {String} na Event name to fake like "click".
 * @param {Object} o Optional object with data to send with the event like cordinates.
 */
function fakeMouseEvent(e, na, o) {
	var ev;

	e = tinymce.DOM.get(e);

    var rect = tinymce.DOM.getRect(e);

    //middle of the element
    //todo: screen coordinates
    var defaults = {
        detail : 1,
        screenX : 0,
        screenY : 0,
        clientX : rect.x + (rect.w/2),
        clientY : rect.y + (rect.h/2),
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        button: 0
    };

    o = tinymce.extend(defaults, o);

	if (e.fireEvent) {
		ev = document.createEventObject();
		tinymce.extend(ev, o);
		e.fireEvent('on' + na, ev);
		return;
	}

	ev = document.createEvent('MouseEvents');

	if (ev.initMouseEvent)
		ev.initMouseEvent(na, true, true, window, o.detail, o.screenX, o.screenY, o.clientX, o.clientY, o.ctrlKey, o.altKey, o.shiftKey, o.metaKey, o.button, null);

	e.dispatchEvent(ev);
}

/**
 * Fake a click sequence, either synchronously or asynchronously.
 * @param elem
 * @param cb null (default) for synchronous, function for async.  cb is called after the click event.
 */
function click(elem, cb){
    try{
        var seq = ["mousedown", "mouseup", "click"];

        var ed = tinymce.activeEditor;
        if(ed.getDoc() == elem.ownerDocument){
            var rng = ed.dom.createRng();

            if(elem.hasChildNodes()){
                rng.setStart(elem, 0);
                rng.collapse(true);
            }else{
                var nodeIndex = ed.dom.nodeIndex(elem);
                rng.setStart(elem.parentNode, nodeIndex);
                rng.setEnd(elem.parentNode, nodeIndex+1);
            }

            //console.log("setting selection", rng);
            ed.selection.setRng(rng);
        }

        mouseSequence(elem, seq, cb);
    }catch(e){
        // noop
    }
}

/**
 * Fake an arbitrary sequence of mouse events on an element, and call a callback after.
 * @param elem The target element for the events
 * @param seq The sequence of events.
 * @param cb The callback.  Optional.  If present, it's scheduled for the next tick after the final event.
 */
function mouseSequence(elem, seq, cb){
    function mouseTick(seqNum){
        setTimeout(function(){
            var eventParams = seq[seqNum];
            if(typeof(eventParams) == "string"){
                fakeMouseEvent(elem, eventParams);
            }else{
                //object
                var type = eventParams.type;
                delete eventParams.type;
                fakeMouseEvent(elem, type, eventParams);
            }
            ++seqNum;
            if(seqNum < seq.length){
                mouseTick(seqNum);
            }else{
                setTimeout(cb, 0);
            }
        }, 0);
    }

    if(cb){
        mouseTick(0);
    }else{
        for(var i = 0; i < seq.length; ++i){
            var eventParams = seq[i];
            if(typeof(eventParams) == "string"){
                fakeMouseEvent(elem, eventParams);
            }else{
                //object
                var type = eventParams.type;
                delete eventParams.type;
                fakeMouseEvent(elem, type, eventParams);
            }
        }
    }
}

/**
 * Fakes a key event.
 *
 * @param {Element/String} e DOM element object or element id to send fake event to.
 * @param {String} na Event name to fake like "keydown".
 * @param {Object} o Optional object with data to send with the event like keyCode and charCode.
 */
function fakeKeyEvent(e, na, o) {
	var ev;

	o = tinymce.extend({
		keyCode : 13,
		charCode : 0
	}, o);

	e = tinymce.DOM.get(e);

	if (e.fireEvent) {
		ev = document.createEventObject();
		tinymce.extend(ev, o);
		e.fireEvent('on' + na, ev);
		return;
	}

    try {
        // Fails in Safari
        ev = document.createEvent('KeyEvents');
        ev.initKeyEvent(na, true, true, window,
                !!o.ctrlKey, !!o.altKey, !!o.shiftKey, !!o.metaKey,
                o.keyCode, o.charCode);
    } catch (ex) {
        try{
            ev = document.createEvent('Events');
            ev.initEvent(na, true, true);

            ev.ctrlKey = !!o.ctrlKey;
            ev.altKey = !!o.altKey;
            ev.shiftKey = !!o.shiftKey;
            ev.metaKey = !!o.metaKey;

            ev.keyCode = o.keyCode;
            ev.charCode = o.charCode;
        }catch(ex2){
            ev = document.createEvent('UIEvents');

            if (ev.initUIEvent)
                ev.initUIEvent(na, true, true, window, 1);
            ev.initEvent(na, true, true);

            ev.ctrlKey = !!o.ctrlKey;
            ev.altKey = !!o.altKey;
            ev.shiftKey = !!o.shiftKey;
            ev.metaKey = !!o.metaKey;

            ev.keyCode = o.keyCode;
            ev.charCode = o.charCode;
        }
    }

	e.dispatchEvent(ev);
}


function type(ed, keyCode, obj){
    if(!obj) obj = {};
    obj = tinymce.extend({ keyCode : keyCode }, obj);
    fakeKeyEvent(ed.selection.getNode(), "keydown", obj);
    fakeKeyEvent(ed.selection.getNode(), "keypress", obj);
    fakeKeyEvent(ed.selection.getNode(), "keyup", obj);
}

function writeScript(file){
    $j("head").append("<" + "script type='text/javascript' src='js/" + file + "' ><" + "/script>");
}
