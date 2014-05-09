/*jslint browser:true */
/*extern jive $j autoSave */

/**
 * Resizing code is modified version of code from the tinyMCE editor.
 *
 * Resizing functions are thus licensed under the LGPL.
 */

function addEvent(obj, name, handler) {
	if (obj.attachEvent) {
		obj.attachEvent("on" + name, handler);
    }
    else {
		obj.addEventListener(name, handler, true);
    }
}


function setCookie(name, value, expires, path, domain, secure) {
    var curCookie = name + "=" + encodeURIComponent(value) +
        ((expires) ? "; expires=" + expires.toGMTString() : "") +
        ((path) ? "; path=" + escape(path) : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");

    document.cookie = curCookie;
}

function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);

    if (begin == -1) {
        begin = dc.indexOf(prefix);

        if (begin !== 0) {
            return null;
        }
    }
    else {
        begin += 2;
    }

    var end = document.cookie.indexOf(";", begin);

    if (end == -1) {
        end = dc.length;
    }

    return decodeURIComponent(dc.substring(begin + prefix.length, end));
}

function addImageElement(name, id, value) {
     if ($j('#' + id).length > 0) {
        // already exists
        return;
    }

    createImageElement(name, id, value);
}

function createImageElement(name, id, value) {
    var inputNode = document.createElement("INPUT");
    inputNode.setAttribute("type", "hidden");
    inputNode.setAttribute("name", name);

    inputNode.setAttribute("id", id);
    inputNode.setAttribute("value", value);
    $j('#postform').append(inputNode);
}

function removeImageElement(name) {
    $j('#'+ name).remove();
}
