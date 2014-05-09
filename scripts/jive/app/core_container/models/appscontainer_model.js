/*
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */
jive.namespace('JAF.CoreContainer');

/**
 * Base class that manages both modal and canvas views.
 * Handles gadget rendering using Shindig's common container
 *
 * @class
 * @param commonContainer
 * @param options
 *
 * @depends path=/resources/scripts/jive/app/core_container/token_provider.js
 */
define('jive.JAF.CoreContainer.AppsContainerModel',
['jive.JAF.CoreContainer.TokenProvider'],
function(TokenProvider) {
return jive.oo.Class.extend(function(protect) {
    // Mix in observable to make this class an event emitter.
    jive.conc.observable(this);

    var apps = {}; // a cache of apps whose view metadata have already been fetched.
    var model;

    this.init = function (commonContainer, options) {
        model = this;
        this.commonContainer = commonContainer;
        this.options = options;
        // Init the security token container

        this.tokenProvider = new TokenProvider(model);
        this.tokenProvider.updateContainerSecurityToken();

        // re-emit the container refreshed event whenever the token provider gets one
        this.tokenProvider.addListener( 'container.token.refreshed', function(token) {
            model.emit( 'container.token.refreshed', token );
        });
    };

    // Get app info via JAF REST endpoint
    this.getApp = function(appUUID, appInstanceUUID) {
        var app = apps[appUUID];
        var ENDPOINT;
        var promise = new jive.conc.Promise();
        var self = this;
        if (app && !app.outdated) {
            promise.emitSuccess(app);
        }
        else {
            var onSuccess = function (data) {
                app = self.cacheApp(data, false, appUUID);
                promise.emitSuccess(app);
            };
            var onError = function (xhr) {
                var marketApp = null;
                if (xhr.status == 404) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        if (data.appUUID) {
                            // this is the market app
                            marketApp = app = self.cacheApp(data, true);
                        }
                    }
                    catch (e) {
                        // ignore it
                    }
                }
                promise.emitError(marketApp);
            };
            if (appInstanceUUID) {
                ENDPOINT = jive.api.apps("instances/appinstance");
                $j.ajax({
                    url:ENDPOINT + "/" + appInstanceUUID,
                    contentType:"application/json",
                    dataType:"json",
                    type:'GET',
                    cache:false,
                    success:onSuccess,
                    error:onError
                });
            }
            else if (appUUID) {
                ENDPOINT = jive.api.apps("instances/my");
                $j.ajax({
                    url:ENDPOINT + "/" + appUUID,
                    contentType:"application/json",
                    dataType:"json",
                    type:'GET',
                    cache:false,
                    success:onSuccess,
                    error:onError
                });
            }
        }
        return promise;
    };

    // Get security token for container
    this.getContainerSecurityToken = function() {
        var ENDPOINT = jive.api.apps("containersecuritytoken");
        var promise = new jive.conc.Promise();
        $j.ajax({
            url: ENDPOINT,
            contentType: "application/json",
            dataType: "json",
            type: 'GET',
            cache: false,
            success: function(data) {
                promise.emitSuccess(data);
            },
            error: function(xhr) {
                promise.emitError(xhr.status);
            }
        });
        return promise;
    };

    this.getAppsMarketApp = function() {
        var app = apps["market"];
        var ENDPOINT;
        var promise = new jive.conc.Promise();
        var self = this;
        if (app) {
            promise.emitSuccess(app);
        }
        else {
            ENDPOINT = jive.api.apps("instances/market");
            $j.ajax({
                url: ENDPOINT,
                contentType: "application/json",
                dataType: "json",
                type: 'GET',
                cache: false,
                success: function(data) {
                    app = self.cacheApp(data, true);
                    promise.emitSuccess(app);
                },
                error: function( xhr ) {
                    promise.emitError();
                }
            });
        }
        return promise;
    };

    this.cacheApp = function(app, isMarket, cacheKey) {
        app.appURL = app.src ? decodeURIComponent(app.src).match(/url=(.*?)&/)[1] : null;

        var noCache = app.src ? decodeURIComponent(app.src).match(/nocache=([01]{1})&/)[1] : "0";
        if(noCache === "1") {
          app.nocache = true;
        } else {
          app.nocache = false;
        }

        cacheKey = isMarket ? "market" : (cacheKey ? cacheKey : app.appUUID);
        app = apps[cacheKey] = apps[cacheKey] ? $j.extend(apps[cacheKey], app) : app;
        delete app.outdated;
        return app;
    };

    this.deleteApp = function(appInstanceUUID, successCallback, errorCallback) {
        successCallback = successCallback || function() {};
        errorCallback = errorCallback || function() {};
        var ENDPOINT = jive.api.apps("instances/instance/" + appInstanceUUID);
        $j.ajax({
            url: ENDPOINT,
            contentType: "application/json",
            dataType: "json",
            type: 'DELETE',
            success: successCallback,
            error: errorCallback
        });
    };


    this.refreshApp = function(endpoint, successCallback, errorCallback) {
        successCallback = successCallback || function() {};
        errorCallback = errorCallback || function() {};
        $j.ajax({
            url: endpoint,
            dataType: 'json',
            type: 'POST',
            success: successCallback,
            error: errorCallback
        })
    };

    this.appRemove = function( action, appId, successCallback, errorCallback ) {
        successCallback = successCallback || function() {};
        errorCallback = errorCallback || function() {};
        $j.ajax({
            type: "PUT",
            url: jive.api.apps("instances/" + action + "/" + appId),
            success: successCallback,
            error: errorCallback
        });
    };

    this.acknowledgeThrottle = function( appId, successCallback, errorCallback ) {
        successCallback = successCallback || function() {};
        errorCallback = errorCallback || function() {};
        $j.ajax({
            type: "PUT",
            url: jive.api.apps("instances/throttle/violation/" + appId),
            success: successCallback,
            error: errorCallback
        });
    };

    this.appHide = function( appId, successCallback, errorCallback ) {
        successCallback = successCallback || function() {};
        errorCallback = errorCallback || function() {};
        $j.ajax({
            type: "PUT",
            url: jive.api.apps("instances/hide/" + appId),
            success: successCallback,
            error: errorCallback
        });
    };

});
});
