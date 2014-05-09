/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2010 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

function toggleVCardActionButtons() {
    var checkboxes = $j(":checkbox[name ='vCardObjectTypes'][checked]");

    if(checkboxes.length > 0) {
        $j('#vcard-download-button').prop('disabled', false);
        $j('#vcard-email-button').prop('disabled', false);
    } else {
        $j('#vcard-download-button').prop('disabled', true);
        $j('#vcard-email-button').prop('disabled', true);
    }
}

function downloadVCard(baseVCardDownloadURL) {

    var downloadVCardURL = constructVCardURL(baseVCardDownloadURL);

    if(downloadVCardURL && downloadVCardURL.length > 0) {
        document.location.href = downloadVCardURL;
    } else {
        alert('You must select at least one content type.');
        return false;
    }
    return false;
}

function emailSingleVCard(checkbox, baseVCardURL) {
    $j(":checkbox[name ='vCardObjectTypes'][checked]").prop('checked', false);
    checkbox.prop('checked', true);
    emailVCard(baseVCardURL);
    return false;
}

function emailVCard(baseVCardEmailURL) {
    var emailVCardURL = constructVCardURL(baseVCardEmailURL);

    if(emailVCardURL && emailVCardURL.length > 0) {
            // todo check for err in callback function
            try {
                $j('#vcard-modal-results').load(emailVCardURL, null, function() {
                   $j('#vcard-modal-prompt').hide();
                   $j('#vcard-modal-results').show();
                });
            } catch(err) {
                $j('#vcard-modal-prompt').hide();
                $j('#vcard-modal-results').html('There was an unexpected error.<br><br>' + err);
                $j('#vcard-modal-results').show();
            }
    } else {
        alert('You must select at least one content type.');
    }

    return false;
}

function constructVCardURL(baseUrlString) {
    var checkboxes = $j(":checkbox[name ='vCardObjectTypes'][checked]");

    if(checkboxes.length > 0) {
        var vCardLinkUrl = baseUrlString;

        for(var i=0; i < checkboxes.length; i++) {
            vCardLinkUrl = vCardLinkUrl + ((vCardLinkUrl.indexOf('?') > -1)? '&' : '?')  +
                                                        'objectTypes=' + checkboxes[i].value;
        }

        return vCardLinkUrl;
    } else {
        return '';
    }
}
