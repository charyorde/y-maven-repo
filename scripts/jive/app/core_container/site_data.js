/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * An instance of this is stored with every gadget site created.
 */

function JiveSiteData(mvcView, app, viewParams) {
    return {
        mvcView: mvcView,
        app: app,
        view: app.view,
        viewParams: viewParams,

        getAppView: function() {
            return this.view;
        },

        // the following are all optional

        getActionInfo: function() {
            return this.actionInfo;
        },

        setActionInfo: function(actionInfo) {
            this.actionInfo = actionInfo;
        },

        getGadgetMetaData: function() {
            return this.gadgetInfo;
        },

        setGadgetMetaData: function(gadgetMetaData) {
            this.gadgetInfo = gadgetMetaData;
        },

        getEEContext: function() {
            return this.context;
        },

        setEEContext: function(context) {
            this.context = context;
            if(context && context.target && context.target.view) {
                this.view = context.target.view;
            }
        },

        getSelection: function() {
            return this.selection;
        },

        setSelection: function(selection) {
            this.selection = selection;
        }
    };
}

// static methods
JiveSiteData.get = function(rpcArgs) {
    var site = rpcArgs[osapi.container.GadgetSite.RPC_ARG_KEY];
    return site.jiveData;
}