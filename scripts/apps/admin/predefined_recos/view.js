/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
/*
 * @depends template=jive.admin.recommendations.*
 */

jive.namespace("PredefinedRecos");

jive.PredefinedRecos.PredefinedRecoView = $Class.extend({
    init: function(options) {
        var that = this;
        $j("#predefined-reco-table").delegate(".remove-reco", "click", function(e) {
            var row = $j(this).closest("tr.j-reco-info");
            var type = row.data("type");
            var id = row.data("id");
            that.emitP("remove-reco", type, id).addCallback(function(){
                row.remove();
            });
            e.preventDefault();
        });

        $j("#add-reco").click(function(e) {
            var contentURL = $j("#contentURL");
            that.emitP("add-reco", contentURL.val()).addCallback(function(result){
                if (result.status) {
                    $j(".predefined-reco-error").show().html(result.status).delay(3000).fadeOut(2000);
                }
                else {
                    contentURL.val("");
                    $j("#predefined-reco-table tbody").append(jive.admin.recommendations.predefinedRecoRow({
                        objectType:result.objectType,
                        objectID:result.objectID,
                        url:result.url,
                        title:result.title
                    }));
                }
            });
            e.preventDefault();
        });
    }
});

jive.conc.observable(jive.PredefinedRecos.PredefinedRecoView.prototype);
