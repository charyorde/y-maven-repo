/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jslint browser:true */
/*extern jive $j $Class */

jive.namespace('Projectpicker');  // Creates the jive.Move.Content namespace if it does not already exist.

/**
 * @depends path=/resources/scripts/apps/placepicker/main.js
 */
jive.Projectpicker.Main = jive.oo.Class.extend(function(protect) {

    protect.init = function(options) {

        var main = this;

        main.objectType= options.objectType;    //task
        main.containerType = containerType;     //pick up globals set in template
        main.containerID = containerID;         //pick up globals set in template
        main.triggerSelector = options.triggerSelector;

        this.placePicker = new jive.Placepicker.Main($j.extend({
            pickerContext: "create",
            parent: options.triggerSelector,
            containerType: main.containerType,
            containerID: main.containerID,
            searchPlaceholderKey: 'nav.bar.create.search.task',
            closeOnSelect: true},
                options));

        
        // Listen to container selected events
        this.placePicker.addListener('container', function(data, promise) {
            main.addProject(data.targetContainerID, data.targetContainerName);
        });
    };

    this.handleChange = function(elem) {
        var main = this;
        if ($j(elem).attr('value') == -1) {
            main.placePicker.showPicker();
        }
    };

    this.addProject = function(value, description) {
        var select = $j(this.triggerSelector);
        var options = select.find('option');
        var opt = options.filter('[value="' + value + '"]');
        if (opt.length < 1) {
            // option doesn't exist in the list, so create it
            var newOption = $j('<option/>', { value: value, text: description });
            
            // insert before other, if exists
            select.find('[value=""]:first').after(newOption);

            select.prop('selectedIndex', -1);
            newOption.prop('selected', true);
        } else {
            select.prop('selectedIndex', -1);
            opt.prop('selected', true);
        }
        select.focus();
    }
});
