/*
 * Jive Software licenses this file to you under the Apache
 * License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// This file provides the default namespaces for the Jive JavaScript Library

/*extern $j */
/*globals jive console */

/**
 * <p class="definition">A set of functions that allow an app to communicate with the Jive container.</p>
 * @class container
 * @namespace osapi.jive
 * @static
 */
osapi.jive.namespace('core.container', {

    /**
     * <p>Maximize the app</p>
     */
    maximizeApp : function() {
        gadgets.rpc.call('', 'maximize_app', null, null);
    },

    /**
     * <p>Close the open app</p>
     * @param options  object
     * @param options.navigateTo  a relative url within Jive to navigate to after the app closes
     * @param options.message  a message to display to the user (can be used if not using navigateTo)
     * @param options.severity   intended for use with message, defaults to 'info', and can also be 'success' or 'error'
     * @param options.data  data to return to the container
     * @param callback
     */
    closeApp : function(options, callback) {
        options = options || {};
        if(typeof(options.message) != 'undefined' && typeof(options.navigateTo) != 'undefined') {
            throw "Invalid call to closeApp. Either message/severity or navigateTo should be specified, but not both.";
        }
        osapi.jive.core.container.sendNotification(options, callback);
        gadgets.rpc.call('', 'close_app', null, options); // this must be the last rpc call from the app.
    },

    /**
     * Returns a an object exposing methods useful for manipulating the RTE:
     *      void insert( html ): inserts the supplied HTML into the RTE, and closes the embedded experience
     */
    editor: function() {
        return  {
            insert: function( html ) {
                gadgets.rpc.call('', 'editor_insert', null, {html:html} );
            }
        }
    },

    /**
     * <p>Request that the container display a notification message to the user</p>
     * @param options  object
     * @param options.message  the string to display to the user
     * @param options.severity   defaults to 'info', and can also be 'success' or 'error'
     * @param callback
     */
    sendNotification : function(options, callback) {
        gadgets.rpc.call('', 'send_notification', callback, options);
    },

    initPlacePicker: function(options, callback) {
        gadgets.rpc.call('', 'request_place_picker', callback, options);
    },

    initUserPicker: function(options, callback) {
        gadgets.rpc.call('', 'request_user_picker', callback, options);
    },

    requestNavigateTo: function(view, data) {
        gadgets.rpc.call('', 'requestNavigateTo', function(){}, view, options);
    },

    gatherCredentials: function(options, callback) {
        gadgets.rpc.call('', 'halt_app', callback, options);
    },

    requestCoreApiUpload: function(key, options, token, callback) {
        gadgets.rpc.call('', 'request_core_api_upload', callback, key, options, token);
    },

    requestCoreApiUploadMediaItem: function(key, options, token, callback) {
        gadgets.rpc.call('', 'request_upload_app_data_media_item', callback, key, options, token);
    },

    artifacts: {
        create: function(artifactJson, actionId, artifactReadyCallback, suppressImageUpload, rteBound ) {
            gadgets.rpc.call('', 'build_artifact_markup', artifactReadyCallback, { artifactJson: artifactJson, actionId: actionId, suppressImageUpload: suppressImageUpload, rteBound: rteBound });
        },

        hostIcon: function(appIconUrl, iconHostedCallback) {
            gadgets.rpc.call('', 'host_app_icon', iconHostedCallback, { iconUrl: appIconUrl });
        }
    }
});