/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*
 * View for poll form data that is not inside the option_list_vew.js.  Currently used to track 
 * start/end date change events.
 *
 * @param pollElement the parent element the date fields occur in.
 */

/*jslint browser:true */
/*extern jive $j */

jive.namespace('content.polls');

jive.content.polls.PollView = function(pollElement) {

    jive.conc.observable(this);

    var pollView = this;

    $j(document).ready(function() {

        var form = $j(pollElement).find('form');

        form.bind('restore', function(e, data) {
            var options = [];
            $j.each(data.properties.options, function(i, v) {
                options.push($j.extend({
                    id: v.ID,
                    contentMeta: [],
                    meta: []
                }, v));
            });

            //clear existing options
            form.find('.jive-voting-option').remove();

            pollView.emit('restoreOptions', options);
        });

        // start dates
        $j(pollElement).find("input[name='activeMode']").change(function() {
            if ( $j('#active-later').is(':checked') ) {
                $j('.activeDatePicker').show();
            } else {
                $j('.activeDatePicker').hide();
                $j('#activeDate').val('');
            }
        });

        // end dates
        $j(pollElement).find("input[name='endsMode']").change(function() {
            if ($j(pollElement).find('#ends-never').is(':checked')) {
                $j(pollElement).find('.expiresDatePicker').hide();
                $j(pollElement).find('#endsDays').val('');
                $j(pollElement).find('#endsDate').val('');
            }
            else if ($j(pollElement).find('#ends-relative').is(':checked')) {
                $j(pollElement).find('.expiresDatePicker').hide();
                $j(pollElement).find('#endsDate').val('');
            }
            else if ($j(pollElement).find('#ends-later').is(':checked')) {
                $j(pollElement).find('#endsDays').val('');
                $j(pollElement).find('.expiresDatePicker').show();
            }
            else if ($j(pollElement).find('#ends-now').is(':checked')){
                $j(pollElement).find('.expiresDatePicker').hide();
                $j(pollElement).find('#endsDays').val('');
                $j(pollElement).find('#endsDate').val('');
            }
        });

        $j('#jive-post-bodybox [name=name]').focus();
    });

}
