/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Events emitted:
 *      container.token.refreshed
 *
 * @class
 */
define('jive.JAF.CoreContainer.TokenProvider', function() {
return jive.oo.Class.extend(function(protect) {

    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    var tokenFetchHandle = null;
    var TOKEN_FETCH_TIMEOUT_MS = 10000;
    var NUM_TRIES_FETCH_TOKEN = 5;
    var numTriesFetchToken = 0;

    this.init = function(model) {
        this.model = model;
    };

    // update the current container security token
    this.updateContainerSecurityToken = function() {
        var self = this;
        numTriesFetchToken++;
        if (tokenFetchHandle != null) {
            window.clearTimeout(tokenFetchHandle);
            tokenFetchHandle = null;
        }

        var tokenRetrieverPromise = self.model.getContainerSecurityToken();
        tokenRetrieverPromise.addCallback(function(tokenData) {
            if(tokenData && tokenData.token) {
                var token = tokenData.token;
                shindig.auth.updateSecurityToken(token);

                var ttlMs = TOKEN_FETCH_TIMEOUT_MS;
                if (tokenData.ttl) {
                    ttlMs = tokenData.ttl * 1000;
                }

                numTriesFetchToken = 0;
                self.emit("container.token.refreshed", tokenData.token);

                tokenFetchHandle = window.setTimeout(self.updateContainerSecurityToken.bind(self), ttlMs * 0.9);
            } else {
                this.handleFailSecurityTokenUpdate_();
            }
        }.bind(self)).addErrback(function(status) {
            this.handleFailSecurityTokenUpdate_();
        }.bind(self));
    };

    // Handle fail token fetch
    this.handleFailSecurityTokenUpdate_ = function() {
        var self = this;

        if (console) {
            console.log( "Fail to update container security token");
        }

        if(numTriesFetchToken < NUM_TRIES_FETCH_TOKEN) {
            if (console) {
                console.log( "Will try to update container security token later.");
            }

            tokenFetchHandle =
                window.setTimeout(self.updateContainerSecurityToken.bind(self), TOKEN_FETCH_TIMEOUT_MS);
        }
        else {
            if (console) {
                console.log( "Max number of tries to update container security token has expired.");
            }

            numTriesFetchToken = 0;
            self.emit("container.token.refreshed", "");
        }
    };

    this.getSecurityToken = function() {
        return shindig.auth.getSecurityToken();
    };

});
});