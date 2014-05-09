/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */


jive.namespace('JAF.Apps');

/**
 * @depends path=/resources/scripts/lib/jiverscripts/src/oo/class.js
 **/
jive.JAF.Apps.Disabled = jive.oo.Class.extend(function(protect) {

    this.init = function( i18nText, options ) {

        function optionallyOpenLink( event, msg, linkUrl ) {
            if ( linkUrl === 'javascript:;' ) {
                // if empty link url, then you must login to view
                event.preventDefault();
                $j("<p/>").html(msg).message({"style":'warn'});
            } else {
                // otherwise open link in new window
                window.open( linkUrl );
            }
        }

        if ( options.disabled ) {
            $j('.j-apps-feature-disabled').live('click', function(event) {
                optionallyOpenLink( event, i18nText.apps_feature_disabled, $j(this).attr("href") );
            });
        } else if ( options.anonymous ) {
            $j('.jive_macro_appEmbeddedView').live('click', function(event) {
                optionallyOpenLink( event, i18nText.apps_feature_disabled_for_anonymous, $j(this).attr("href") );
            });
        } else if ( options.partner ) {
            $j('.jive_macro_appEmbeddedView').live('click', function(event) {
                optionallyOpenLink( event, i18nText.apps_feature_disabled_for_partners, $j(this).attr("href") );
            });
        }

    };

});
