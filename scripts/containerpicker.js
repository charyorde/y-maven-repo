/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 * @depends path=/resources/scripts/jquery/jquery.suggest.js
 */

/*extern $j $Class */

var JiveContainerPicker = $Class.extend({
    defaults: {
        chooser : 'jive-container-chooser',
        chooserChoices : 'jive-container-chooser-choices',
        containerSelected : 'jive-container-chooser-selected',
        containerTypeField : 'jive-container-chooser-type',
        containerIDField : 'jive-container-chooser-id',
        validTypes: [],
        contentType: -1,
        bridge: -1,
        showRootCommunity: true,
        excludeResultIfUserCannotViewContent: false
    },

    init: function(custom) {
        this.options = $j.extend({}, this.defaults, custom);
        this.startAutoCompleter();
    },

    startAutoCompleter: function() {
        var url = (this.options.bridge > -1) ? "bridge-widget-container-autocomplete.jspa" : "container-autocomplete.jspa";
        var extraParams = {
            bridge: this.options.bridge > -1 ? this.options.bridge : [],
            contentType: this.options.contentType > 0 ? this.options.contentType : [],
            showRootCommunity: this.options.showRootCommunity,
            excludeResultIfUserCannotViewContent: this.options.excludeResultIfUserCannotViewContent
        };
        if (this.options.validTypes && this.options.validTypes.length) {
            extraParams.validTypes = this.options.validTypes;
        }

        $j('#' + this.options.chooser).suggest(url, {
            attachObject: '#' + this.options.chooserChoices,
            onSelect: this.addContainer.bind(this),
            minchars: 1,
            requestMethod: 'POST',
            paramName: 'query',
            extraParams: extraParams,
            transformData: function(data) {
                return $j.makeArray($j(data).find('li')).map(function(item) {
                    var id = $j(item).attr('id').split('-').last();
                    return [$j(item).html(), id];
                });
            },
            position: function($input, $results) {
                var input = $input.get(0);
                $results.css({
                    top: (input.offsetTop + input.offsetHeight) + 'px',
                    left: input.offsetLeft + 'px'
                });
            },
            liClass: 'jive-container'
        });
    },

    addContainer: function(containerTypeAndID, selected) {
        var containerType = containerTypeAndID.split('_').first(),
            containerID   = containerTypeAndID.split('_').last();
        if (containerType && containerID) {
            // set hidden containerType and containerID
            $j('#' + this.options.containerTypeField).val(containerType);
            $j('#' + this.options.containerIDField).val(containerID);
                                                 
            // show $selected value
            $j('#' + this.options.chooser).hide().val('').prop('disabled', true);
            $j('#' + this.options.containerSelected)
                .find('.j-js-change').remove().end()
                .append(selected + '<a class="j-js-change" href="#" class="font-color-meta">Change</a>').show();
            this.addContainerHook(selected);
        }
    },

    addContainerHook: function(selected) {

    },

    removeContainer: function() {
        // reset hidden containerType and containerID
        $j('#' + this.options.containerTypeField).val('-1');
        $j('#' + this.options.containerIDField).val('-1');

        // show chooser
        $j('#' + this.options.containerSelected).hide().html('');
        $j('#' + this.options.chooser).prop('disabled', false).val('').show();

        this.removeContainerHook();
    },

    removeContainerHook: function() {

    }
});
