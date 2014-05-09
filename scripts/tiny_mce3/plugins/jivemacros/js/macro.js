// tinyMCEPopup.requireLangPack();

var action, orgTableWidth, orgTableHeight, dom = tinyMCEPopup.editor.dom;

function editMacro(){
    var ed = tinyMCEPopup.editor;
    var dom = ed.dom;
    var elm = ed.selection.getNode();
    var macro = tinyMCEPopup.params.macro;

    var params = macro.getAllowedParameters()
    for(var i=0;i<params.length;i++){
        var input = document.getElementById("_" + params[i].name);
        if(input.value.length > 0){
            elm.setAttribute("_" + params[i].name, input.value);
        }else{
            elm.removeAttribute("_" + params[i].name);
        }
    }
    ed.plugins.jivemacros.removeDuplicateMacros(ed, ed.getBody());
    tinyMCEPopup.close();
}


function init() {
	tinyMCEPopup.resizeToInnerSize();
    var ed = tinyMCEPopup.editor;
    var macro = tinyMCEPopup.params.macro;
    var dom = ed.dom;
    var elm = ed.selection.getNode();

    var table = document.getElementById("macrotable");
    var params = macro.getAllowedParameters();
    for(var i=params.length-1;i>=0;i--){
        var param = params[i];
        var row = table.insertRow(0);
        var paramCell = row.insertCell(0);
        var label = document.createElement("label");
        label.setAttribute("for",param.name);
        label.appendChild(document.createTextNode(ed.getLang("jivemacros.macro." + macro.getName() + ".attr." + param.name, param.name)));
        paramCell.appendChild(label);
        var valueCell = row.insertCell(1);
        if($str(param.value)){
            var input = document.createElement('INPUT');
            input.setAttribute("name",param.name);
            input.setAttribute("type","text");
            input.setAttribute("id","_" + param.name);
            input.value = elm.getAttribute("_" + param.name);
        }else{
            var input = document.createElement('SELECT');
            input.setAttribute("name",param.name);
            input.setAttribute("id","_" + param.name)
            for(var j=0;j<param.value.length;j++){
                var opt = document.createElement('OPTION');
                var preset_name = ed.getLang("jivemacros.macro." + macro.getName() + ".preset." + param.value[j], param.value[j]);
                opt.appendChild(document.createTextNode(preset_name));
                opt.value = param.value[j];
                if(elm.getAttribute("_" + param.name) == param.value[j]){
                    opt.selected = true;
                }
                input.appendChild(opt);
            }
        }

        var attr = elm.attributes[param];
        if(attr != null){
            input.value = attr.nodeValue;
        }
        valueCell.appendChild(input);
    }

}

tinyMCEPopup.onInit.add(init);
