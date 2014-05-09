/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*
 * @depends path=/resources/scripts/apps/admin/predefined_recos/view.js
 * @depends path=/resources/scripts/apps/admin/predefined_recos/model.js
 */

jive.namespace("PredefinedRecos");

jive.PredefinedRecos.Main = function(options) {
    var predefinedRecoSource = new jive.PredefinedRecos.PredefinedRecoSource(options);
    var predefinedRecoView = new jive.PredefinedRecos.PredefinedRecoView(options);

    predefinedRecoView.addListener("remove-reco", function(type, id, promise) {
        predefinedRecoSource.remove(type, id, promise);
    }).addListener("add-reco", function(url, promise) {
        predefinedRecoSource.add(url, promise);
    });
};