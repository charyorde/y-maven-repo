// begin edits //
// https://brewspace.jiveland.com/docs/DOC-10757 //
// tinyMCEPopup.requireLangPack();
// end edits //

function init() {
	var f = document.forms[0], v;

	tinyMCEPopup.resizeToInnerSize();

    var numcols = tinyMCEPopup.getWindowArg('numcols', 1);
    var numrows = tinyMCEPopup.getWindowArg('numrows', 1);
    var max_cols = tinyMCEPopup.getWindowArg('maxcols', 1);
    var max_rows = tinyMCEPopup.getWindowArg('maxrows', 1);

    if(max_cols == 0){
        f.numcols.disabled = true;
        var opt = document.createElement('OPTION');
        opt.value = 0;
        opt.appendChild(document.createTextNode("0"));
        f.numcols.appendChild(opt);
    }else{
        for(var i=0;i<=max_cols;i++){
            var opt = document.createElement('OPTION');
            opt.value = i;
            if(i==1) opt.selected = true;
            opt.appendChild(document.createTextNode(i));
            f.numcols.appendChild(opt);
        }
    }
    if(max_rows == 0){
        f.numrows.disabled = true;
        var opt = document.createElement('OPTION');
        opt.value = 0;
        opt.appendChild(document.createTextNode("0"));
        f.numrows.appendChild(opt);
    }else{
        for(var i=0;i<=max_rows;i++){
            var opt = document.createElement('OPTION');
            opt.value = i;
            if(i==1) opt.selected = true;
            opt.appendChild(document.createTextNode(i));
            f.numrows.appendChild(opt);
        }
    }
}

function mergeCells() {
	var args = [], f = document.forms[0];

	tinyMCEPopup.restoreSelection();

    var num_cols = tinyMCEPopup.getWindowArg('numcols', 1);
    var num_rows = tinyMCEPopup.getWindowArg('numrows', 1);

    args["numcols"] = parseInt(num_cols) + parseInt(f.numcols.options[f.numcols.selectedIndex].value);
	args["numrows"] = parseInt(num_cols) + parseInt(f.numrows.options[f.numrows.selectedIndex].value);

	tinyMCEPopup.execCommand("mceTableMergeCells", false, args);
	tinyMCEPopup.close();
}

tinyMCEPopup.onInit.add(init);
