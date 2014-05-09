// TODO: this shouldn't be conceptually tied to a "row"

// "hashmap" for the row elements so we can remember the style before switching to the hilite one
var hoverElements = new Array();

function onhover(el) {
    if (typeof(el) == "undefined" || typeof(el.className) != "undefined") {
        return;
    }
    hoverElements[el] = el.className;
    el.className = el.className + " hilite";
}

function onhoverbyclass(el, cl) {
    hoverElements[el] = el.className;
    el.className = el.className + " " + cl;
}

function offhover(el) {
    if (hoverElements[el]) {
        el.className = hoverElements[el];
    }
}

function onclick(el) {
    onhover(el);
}

/* todo: not working right now! */
function clearhover(el) {
    el.className = el.className.replace(/hilite/g, "")
}