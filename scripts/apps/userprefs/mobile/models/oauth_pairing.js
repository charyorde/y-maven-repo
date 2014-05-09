/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Interface to OAuth pairing REST service
 *
 * @class
 * @extends jive.RestResource
 *
 * @depends path=/resources/scripts/apps/shared/models/rest_service.js
 */
jive.namespace("UserPrefs.Mobile");

jive.UserPrefs.Mobile.OAuthPairing = jive.RestService.extend(function(protect, _super) {

//    long oAuthPairingID;
//    String displayName;
//    String activationCode;
//    String activationURL;
//    OAuthPairingSubTypeViewBean subType;
//    String expires;
//    String activated;
//    boolean expired;
//    String lastAccess;

    protect.init = function(providerName) {
        this.resourceType = "oauth2/pairing/" + providerName;
        this.pluralizedResourceType = "oauth2/pairing/" + providerName;
        _super.init.call(this);
    };

    this.validate = function(pairing) {
        var promise = new jive.conc.Promise();
        var errors = [];
        if (!pairing.displayName) {
            errors.push({message:"displayName",code:4002});
        }
        if (pairing.passCodeEnabled === "true") {
            if (!pairing.tempPassCodeEncoded || !pairing.tempPassCodeEncodedRepeat) {
                errors.push({message:"passCode",code:4003});
            } else {
                if ( (pairing.tempPassCodeEncoded.length != pairing.tempPassCodeEncodedRepeat.length) ||
                    (pairing.tempPassCodeEncoded !== pairing.tempPassCodeEncodedRepeat) ) {
                    errors.push({message:"passCode",code:4004});
                } else{
                    if (pairing.tempPassCodeEncoded.length < pairing.passCodeMinLength) {
                        errors.push({message:"passCode",code:4005});
                    }
                }
            }
        }
        if (!pairing.subType) {
            errors.push({message:"subType",code:4002});
        }
        else if (!pairing.subType.id) {
            errors.push({message:"subType.id",code:4002});
        }
        if (errors.length) {
            promise.emitError(errors);
        }
        else {
            promise.emitSuccess(pairing);
        }
        return promise;
    };

    this.markFirstVisit = function() {
        return this.save({"id":"firstVisit"});
    };

    this.renew = function(id) {
        return this.save({"id":id});
    }
});

