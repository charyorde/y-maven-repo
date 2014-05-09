/*
	CRIR - Checkbox & Radio Input Replacement
	Author: Chris Erwin (me[at]chriserwin.com)
	www.chriserwin.com/scripts/crir/

	Updated July 27, 2006.
	Jesse Gavin added the AddEvent function to initialize
	the script. He also converted the script to JSON format.

	Updated July 30, 2006.
	Added the ability to tab to elements and use the spacebar
	to check the input element. This bit of functionality was
	based on a tip from Adam Burmister.
*/

function addLabelFocus() {
    var item = document.getElementById(this.getAttribute("for"));
    item.focus();
    if (item.getAttribute("type") == "checkbox") {
        if (!item["checked"]) {
            item["checked"] = true;
            this.className = "checkbox_checked";
        }
        else
        {
            item["checked"] = false;
            this.className = "checkbox_unchecked";
        }
    }
    else if (item.getAttribute("type") == "radio") {
        var allRadios = document.getElementsByTagName("input");
        var radios = new Array();
        for (var i = 0; i < allRadios.length; i++) {
            if (allRadios[i].getAttribute("name") == item.getAttribute("name")) {
                radios.push(allRadios[i]);
            }
        }
        for (i = 0; i < radios.length; i++) {
            if (radios[i]["checked"] && radios[i].getAttribute("id") != item.getAttribute("id")) {
                radios[i]["checked"] = false;
            }
        }
        item["checked"] = true;
    }
}

function safariCheck() {
    if ((navigator.userAgent.indexOf("Safari") > 0) && (navigator.platform.indexOf("Mac") != -1)
            && (navigator.userAgent.indexOf("Version/") == -1))
    {

        var labels = document.getElementsByTagName("label");
        for (var i = 0; i < labels.length; i++) {
            labels[i].addEventListener("click", addLabelFocus, false);
        }
    }
}

var crir = {
    init: function() {
        var arrLabels = document.getElementsByTagName('label');

        for (var i = 0; i < arrLabels.length; i++) {
            // get the input element based on the for attribute of the label tag
            if (arrLabels[i].getAttributeNode('for') && arrLabels[i].getAttributeNode('for').value != '') {
                var labelElementFor = arrLabels[i].getAttributeNode('for').value;
                var inputElement = document.getElementById(labelElementFor);
            }
            else
            {
                continue;
            }

            var inputElementClass = inputElement.className;

			// if the input is specified to be hidden intiate it
            if (inputElementClass == 'crirHiddenJS') {
                inputElement.className = 'crirHidden';

                var inputElementType = inputElement.getAttributeNode('type').value;

				// add the appropriate event listener to the input element
                if (inputElementType == "checkbox") {
                    inputElement.onclick = crir.toggleCheckboxLabel;
                }
                else
                {
                    inputElement.onclick = crir.toggleRadioLabel;
                }

				// set the initial label state
                if (inputElement.checked) {
                    if (inputElementType == 'checkbox') {
                        arrLabels[i].className = 'checkbox_checked'
                    }
                    else
                    {
                        arrLabels[i].className = 'radio_checked'
                    }
                }
                else
                {
                    if (inputElementType == 'checkbox') {
                        arrLabels[i].className = 'checkbox_unchecked'
                    }
                    else
                    {
                        arrLabels[i].className = 'radio_unchecked'
                    }
                }
            }
            else if (inputElement.nodeName != 'SELECT' && inputElement.getAttributeNode('type').value
                    == 'radio')
            { // this so even if a radio is not hidden but belongs to a group of hidden radios it will still work.
                arrLabels[i].onclick = crir.toggleRadioLabel;
                inputElement.onclick = crir.toggleRadioLabel;
            }
        }
    },

    findLabel: function (inputElementID) {
        var arrLabels = document.getElementsByTagName('label');

        for (var i = 0; i < arrLabels.length; i++) {
            if (arrLabels[i].getAttributeNode('for') && arrLabels[i].getAttributeNode('for').value == inputElementID) {
                return arrLabels[i];
            }
        }
    },

    toggleCheckboxLabel: function () {
        var labelElement = crir.findLabel(this.getAttributeNode('id').value);

        if (labelElement.className == 'checkbox_checked') {
            labelElement.className = "checkbox_unchecked";
        }
        else
        {
            labelElement.className = "checkbox_checked";
        }
    },

    toggleRadioLabel: function () {
        var clickedLabelElement = crir.findLabel(this.getAttributeNode('id').value);

        var clickedInputElement = this;
        var clickedInputElementName = clickedInputElement.getAttributeNode('name').value;

        var arrInputs = document.getElementsByTagName('input');

		// uncheck (label class) all radios in the same group
        for (var i = 0; i < arrInputs.length; i++) {
            var inputElementType = arrInputs[i].getAttributeNode('type').value;
            if (inputElementType == 'radio') {
                var inputElementName = arrInputs[i].getAttributeNode('name').value;
                var inputElementClass = arrInputs[i].className;
				// find radio buttons with the same 'name' as the one we've changed and have a class of chkHidden
                // and then set them to unchecked
                if (inputElementName == clickedInputElementName && inputElementClass == 'crirHidden') {
                    var inputElementID = arrInputs[i].getAttributeNode('id').value;
                    var labelElement = crir.findLabel(inputElementID);
                    labelElement.className = 'radio_unchecked';
                }
            }
        }

		// if the radio clicked is hidden set the label to checked
        if (clickedInputElement.className == 'crirHidden') {
            clickedLabelElement.className = 'radio_checked';
        }
    },

    addEvent: function(element, eventType, doFunction, useCapture) {
        if (element.addEventListener) {
            element.addEventListener(eventType, doFunction, useCapture);
            return true;
        }
        else if (element.attachEvent) {
            return element.attachEvent('on' + eventType, doFunction);
        }
        else
        {
            element['on' + eventType] = doFunction;
        }
    }
}

crir.addEvent(window, 'load', crir.init, false);
crir.addEvent(window, 'load', safariCheck, false);
