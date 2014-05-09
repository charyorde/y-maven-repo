/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */


/**
 * @depends path=/resources/scripts/apps/shared/views/abstract_view.js
 */
define('jive.JAF.Configuration.ServiceBlocks', ['jquery'], function($j) {
return jive.AbstractView.extend(function(protect) {

    this.init = function() {
        this.blocks = $j(".app-services-section .j-service-block-alert");
    };

    this.validate = function( validator ) {
        return validator( this.blocks );
    };

    this.get_services = function() {
        var services = [];
        this.blocks.each( function() {
            var serviceId = $j(this).attr("data-serviceid");
            if ( serviceId ) {
                services.push( { "serviceID": serviceId, "alias": $j(this).attr("data-alias") } );                
            } else {
                var chosenService = $j(this).find("input.j-service-radio:checked");
                if ( chosenService ) {
                    services.push({
                        "serviceID": chosenService.attr("data-serviceid"), 
                        "alias": chosenService.attr("data-alias") });
                }
            }
        });

        return services;
    };

});
});
