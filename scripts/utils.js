var pc = navigator.userAgent.toLowerCase();
var ie4_win = (pc.indexOf("win")!=-1) && (pc.indexOf("msie") != -1)
    && (parseInt(navigator.appVersion) >= 4);

// only builds based upon gecko later than Jan 8th support the selectionStart, selectionEnd properly
var is_gecko = pc.indexOf("gecko/") != -1 &&
    parseFloat(pc.substring(pc.indexOf("gecko/") + 6, pc.indexOf("gecko/") + 14)) > 20030108;

function styleTag(tag, endtag, ta) {
    var end = 0;
    var scrollTop = ta.scrollTop;
    var r;
    if (document.selection) {
        if (document.selection.createRange().parentElement().tagName == 'TEXTAREA') {
            var selected = document.selection.createRange().text;

            // now determine the cursor position
            end = getSelectionRangeEnd(ta);

            // r is an array
            r = _markupText(selected, tag, endtag);
            // update text
            document.selection.createRange().text = r[0];
            // update end position
            end += r[1];
        }
    }
    else if (typeof(ta.selectionStart) != 'undefined' && typeof(ta.selectionEnd) != 'undefined') {
        if (ta.selectionStart == ta.selectionEnd) {
            return;
        }
        var selLength = ta.textLength;
        var selStart = ta.selectionStart;
        var selEnd = ta.selectionEnd;
        if (selEnd == 1 || selEnd == 2) {
            selEnd = selLength;
        }
        var s1 = (ta.value).substring(0, selStart);
        var s2 = (ta.value).substring(selStart, selEnd);
        var s3 = (ta.value).substring(selEnd, selLength);

        // r is an array
        r = _markupText(s2, tag, endtag);
        // update text
        ta.value = s1 + r[0] + s3;
        // update end position
        end = selEnd + r[1];
    }
    else {
        return;
    }

    if (end > 0) {
        setCaretTo(ta, end, scrollTop);
    }
}

function _markupText(text, tag, endtag) {
    // trim off leading whitespace from selection (includes newlines)
    var r = trimLeadingSpace(text);
    text = r[0];
    var removeSpace = r[1];

    // trim off trailing whitespace from selection (includes newlines)
    r = trimTrailingSpace(text);
    text = r[0];
    var addSpace = r[1];

    // determine if selection crosses multiple lines
    var addedCharacters = 0;

    if (text.indexOf('\n') > 0) {
        // wrap whole lines in the tag
        var lines = text.split('\n');
        var newText = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            r = trimLeadingSpace(line);
            line = r[0];
            var leadingSpaces = r[1];

            // trim off trailing whitespace from selection (includes newlines)
            r = trimTrailingSpace(line);
            line = r[0];
            var trailingSpaces = r[1];

            if (line == '') {
                newText += leadingSpaces + line + trailingSpaces;
            }
            else {
                newText += leadingSpaces + tag + line + endtag + trailingSpaces;
                addedCharacters += (tag.length + endtag.length);
            }

            if (i < lines.length -1) {
                newText += '\n';
            }
        }
        text = removeSpace + newText + addSpace;
    }
    else {
        text = removeSpace + tag + text + endtag + addSpace;
    }

    r = new Array(2);
    r[0] = text;
    r[1] = addedCharacters;

    return r;
}

function trimLeadingSpace(text) {
    var removeSpace = "";
    while (text.length > 0 && 
           (text.charAt(0) == ' ' || 
            text.charAt(0) == '\n' ||
            text.charAt(0) == '\r')) 
    {
        removeSpace += text.charAt(0);
        text = text.substring(1);
    }
    
    var r = new Array(2);
    r[0] = text;
    r[1] = removeSpace;
    return r;
}

function trimTrailingSpace(text) {
    var addSpace = "";
    while (text.length > 0 && 
           (text.charAt(text.length-1) == ' ' || 
            text.charAt(text.length-1) == '\n' || 
           text.charAt(text.length-1) == '\r')) 
    {
        addSpace += text.charAt(text.length-1);        
        text = text.substring(0, text.length-1);
    }
    
    var r = new Array(2);
    r[0] = text;
    r[1] = addSpace;
    return r;
}

function getSelectionRangeText(ta) {
    if (document.selection) {
        // The current selection
        return document.selection.createRange().text;
    }
    else if (is_gecko) {
        var start = ta.selectionStart;
        var end   = ta.selectionEnd;
        return ta.value.substr(start, end-start);
    }
    else {
        return '';
    }
}

function getSelectionRangeEnd(ta) {
    if (document.selection) { 
        // The current selection 
        var range = document.selection.createRange(); 
        // We'll use this as a 'dummy' 
        var stored_range = range.duplicate(); 
        // Select all text 
        stored_range.moveToElementText(ta); 
        // Now move 'dummy' end point to end point of original range 
        stored_range.setEndPoint('EndToEnd', range); 
        
        // Now we can calculate start and end points
        var start = stored_range.text.length - range.text.length; 
        return start + range.text.length;
    }
    else if (is_gecko) {
        return ta.selectionEnd;
    }
    else {
        return 0;
    }
}
function setCaretTo(ta, pos, scrollTop) { 
    ta.focus();
    if (ta.createTextRange) {         
        // we need to determine the number of \r\n in IE because while they are two separate
        // characters they are treated as one for the purposes of position
        var i = 0;
        var count = 0;
        var text = ta.value;
        while (i > -1 && i < pos) {
            i = text.indexOf("\r\n", i);
            if (i >= 0) {
                count++;
                i += 2;
            }
        }
        // knock one off of count 
        if (count > 1) {
            count--;
        }
        
        // position cursor
        var range = ta.createTextRange();        
        range.move("character", (pos - count)); 
        range.select(); 
    } 
    else if (ta.selectionStart) {
        ta.setSelectionRange(pos, pos);        
    }
    
    // scroll to the same location that the textarea was previously scrolled to
    if (scrollTop > 0) {
        ta.scrollTop = scrollTop;
    }
}

function caret(ta) {
    if (ie4_win && ta.createTextRange &&
            document.selection.createRange().parentElement().tagName == 'TEXTAREA')
    {
        ta.caretPos = document.selection.createRange().duplicate();
    }
}

// This function returns the name of a given function. It does this by
// converting the function to a string, then using a regular expression
// to extract the function name from the resulting code.
function funcname(f) {
    var s = f.toString().match(/function (\w*)/)[1];
    if ((s == null) || (s.length == 0)) return "anonymous";
    return s;
}

// This function returns a string that contains a "stack trace."
function stacktrace() {
    var s = "";  // This is the string we'll return.
    // Loop through the stack of functions, using the caller property of
    // one arguments object to refer to the next arguments object on the
    // stack.
    for(var a = arguments.caller; a != null; a = a.caller) {
        // Add the name of the current function to the return value.
        s += funcname(a.callee) + "\n";

        // Because of a bug in Navigator 4.0, we need this line to break.
        // a.caller will equal a rather than null when we reach the end
        // of the stack. The following line works around this.
        if (a.caller == a) break;
    }
    return s;
}

function printStackTrace() {
    alert('stack trace is ' + stacktrace());
}
