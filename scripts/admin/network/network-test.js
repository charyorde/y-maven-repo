/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 *
 * @depends template=jive.admin.network.tools.testConnectivityResults
 */
$j(document).ready(function() {
    $j("#js-network-test-execute").click(function() {
        var req = {
            url: $j("#js-network-test-url").val()
        };
        var button = $j(this);
        if (req.url) {
            $j("#js-network-test-results").remove();
            button.attr("disabled","disabled");
            var results = $j("<div/>").attr("id","js-network-test-results");
            results.text("An error occurred communicating with the Jive server");
            $j.ajax({
                type: "POST",
                url: _jive_base_url + "/__services/v2/rest/admin/network/tools/test",
                data: JSON.stringify(req),
                contentType: "application/json",
                dataType: "json",
                success: function(data) {
                    results.html(jive.admin.network.tools.testConnectivityResults({results:data}));
                    results.insertAfter($j("#js-network-test-form"));
                },
                complete: function() {
                    button.removeAttr("disabled");
                    results.insertAfter($j("#js-network-test-form"));
                }
            });
        }
    });
});
