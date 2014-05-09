/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2011 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

jive.namespace("UserPrefs.Mobile");

jive.UserPrefs.Mobile.Main = jive.oo.Class.extend(function(protect) {

    var oauthPairing = new jive.UserPrefs.Mobile.OAuthPairing("mobile-client");

    protect.init = function() {
        var firstVisit = new jive.UserPrefs.Mobile.FirstVisit("#js-first-visit");
        var pendingView = new jive.UserPrefs.Mobile.PairingList("#pending_pairings");
        var activeView = new jive.UserPrefs.Mobile.PairingList("#active_pairings");
        var generateForm = new jive.UserPrefs.Mobile.GenerateForm("#generate_pairing");
        var main = this;

        firstVisit.addListener("close", function() {
            firstVisit.hide();
            generateForm.showForm();
            oauthPairing.markFirstVisit();
        });

        pendingView.addListener("remove", buildRemoveListener(pendingView));

        pendingView.addListener("show-activation-popup", function(id) {
            oauthPairing.get(id).addCallback(function(pairing) {
                showActivationPopup(pairing);
            });
        });

        activeView.addListener("remove", buildRemoveListener(activeView));

        activeView.addListener("renew", function(id) {
            oauthPairing.renew(id).addCallback(function(pairing) {
                activeView.removeRow(id);
                pendingView.addNew(pairing);
                showActivationPopup(pairing);
            });
        });

        function buildRemoveListener(view) {
            return function(id) {
                var confirmation = new jive.UserPrefs.Mobile.RemoveConfirmation(id);
                confirmation.addListener("confirm", function() {
                    confirmation.getContent().trigger("close");
                    oauthPairing.destroy(id).addCallback(function() {
                        view.removeRow(id);
                    });
                });
                var opts = {
                    closeSelector: ".close",
                    destroyOnClose: true
                };
                confirmation.getContent().lightbox_me(opts);
            }
        }

        generateForm.addListener("create", function(pairing) {
            (oauthPairing.validate(pairing)).addErrback(function(errors) {
                generateForm.handleError(errors);
            }).addCallback(function() {
                oauthPairing.save(pairing).addCallback(function(newPairing) {
                    pendingView.addNew(newPairing);
                    generateForm.resetForm();
                    showActivationPopup(newPairing);
                }).addErrback(function(message, code) {
                    generateForm.handleError([{message:message, code:code}]);
                });
            });
        });

        function showActivationPopup (pairing) {
            var activateModal = new jive.UserPrefs.Mobile.ActivateModal(pairing, main.mobileURL, main.communityName);
            var opts = {
                closeSelector: ".close",
                destroyOnClose: true
            };
            activateModal.getContent().lightbox_me(opts);
        }
    };

    this.setMobileURL = function(mobileURL) {
        this.mobileURL = mobileURL;
    };

    this.setCommunityName = function(communityName) {
        this.communityName = communityName;
    };
});
