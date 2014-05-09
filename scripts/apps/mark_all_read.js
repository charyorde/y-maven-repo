/*extern jive $j */

//= require <jquery>
//= require <jive/namespace>
//= require <core_ext/object>
//= require <core_ext/array>

/**
 * new jive.MarkAllRead(pager)
 * - pager (jive.Pager.Main): pager app to fetch discussion parameters from
 * 
 * Updates the 'read' property of a page of resources, such as discussions.
 * Depends on the presence of a Pager app to inform MarkAllRead what the
 * parameters that identify the current page of results are.
 **/
jive.MarkAllRead = function(resources_url, pager) {

    // Constructs a query string to send to the server in order to retrieve the
    // appropriate page of results.  The parameters are serialized in
    // alphabetical order for easier testing.
    function server_params(params) {
        return Object.keys(params).sort().map(function(key) {
            if (key == 'page') {
                // Convert page number to the index of the first item to appear
                // on the page.
                return [['start', (params.page - 1) * params.per_page]];
            } else if (key == 'per_page') {
                // Some views use `range` to mean `per_page` and some use
                // `numResults`.  So emit both.
                return [['range', params.per_page], ['numResults', params.per_page]];
            } else if ($j.isArray(params[key])) {
                // If the parameter value is an array then serialize each value
                // in a separate key-value pair.
                return params[key].map(function(v) { return [key, v]; });
            } else {
                // For other parameters no translation is required.
                return [[key, params[key]]];
            }
        }).flat().filter(function(p) {
            // Only send parameters with defined values to the server.
            return p[1] || p[1] === 0;
        }).map(function(p) {
            return p.join('=');
        }).join('&');
    }

    $j(document).delegate('.mark-all-read', 'submit', function(event) {
        var form = this,
            params = $j.extend({ markAllRead: true }, pager.get_parameters());

        $j.ajax({
            url: resources_url,
            type: 'GET',
            data: server_params(params),
            dataType: 'html',
            success: function() {
                $j('.mark-all-read :submit').prop('disabled', true);
                pager.update();
            }
        });

        event.preventDefault();
    });

    // Submit forms when a submit link is clicked.
    $j(document).delegate('.mark-all-read a.submit', 'click', function(event) {
        $j(this).parents('form').trigger('submit');
        event.preventDefault();
    });
};
