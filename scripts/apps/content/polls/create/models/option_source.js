/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*extern jive $j */

jive.namespace('content.polls');

jive.content.polls.OptionSource = function(options) {

    var pollID                  = options.pollID,
        pollOptions             = options.pollOptions,
        POLL_ENDPOINT           = jive.rest.url("/polls"),
        OPTION_ENDPOINT         = POLL_ENDPOINT + "/" + pollID + "/pollOptions";

  /**
     * Most of the methods in this class can take either a success callback or
     * an object representing a success callback and an error callback.  This
     * function handles either case: it returns a normalized form, an object.
     */
    function normalizeOptions(options) {
        if (typeof options == 'function') {
            options = { success: options };
        }
        return options;
    }

  /**
     * Creates a new poll option.
     *
     */
    function newOption(options) {

        options = normalizeOptions(options);

        $j.ajax({
            type: "POST",
            url: OPTION_ENDPOINT,
            async: false,
            dataType: "json",
            data: {},
            success: function(data) {
                if (typeof options.success == 'function') {
                    pollOptions.push(data);
                    options.success.call(pollID, data);
                }
            },
            error: function(data) {
                if (typeof options.error == 'function') {
                    options.error.call(pollID, data);
                }
            }

        });

    }

    function move(pollOption, newIndex, options) {

        options = normalizeOptions(options);

        $j.ajax({
            type: "POST",
            url: OPTION_ENDPOINT + "/" + pollOption.id + "/index",
            dataType: "json",
            async: false,
            data: {index:newIndex},
            success: function(data) {
                if (typeof options.success == 'function') {
                    pollOptions = data;
                    options.success.call(pollID, data);
                }
            },
            error: function(data) {
                if (typeof options.error == 'function') {
                    options.error.call(pollID, data);
                }
            }
        });
    }

    function remove(pollOption, options) {

        options = normalizeOptions(options);

        $j.ajax({
            type: "DELETE",
            url: OPTION_ENDPOINT + "/" + pollOption.id,
            dataType: "json",
            async: false,
            data: {},
            success: function(data) {
                if (typeof options.success == 'function') {
                    pollOptions = data;
                    options.success.call(pollID, pollOptions);
                }
            },
            error: function(data) {
                if (typeof options.error == 'function') {
                    options.error.call(pollID, data);
                }
            }
        });
    }

    function getAll(options) {

        options = normalizeOptions(options);

        // no need to fetch the data, currently
        if (typeof options.success == 'function') {
            options.success.call(pollID, pollOptions);
        }

        return this;
    }

    function get(optionID, options) {

        options = normalizeOptions(options);

        pollOptions.forEach(function(pollOption) {
            if (pollOption.id == optionID) {
                options.success.call(pollID, pollOption);
            }
        });

        return this;
    }

    /* Public methods */
    this.getAll = getAll;
    this.move = move;
    this.newOption = newOption;
    this.remove = remove;
    this.get = get;

}