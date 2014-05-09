/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Asks the Jive container to prompt the user to select a place.
 *
 * @method requestPicker
 * @param options {Object} The following options are supported:
 * <p></p>
 * <table>
 *     <tr>
 *         <th>Name</th>
 *         <th class="wider">Type</th>
 *         <th>Required</th>
 *         <th>Description</th>
 *     </tr>
 *     <tr>
 *         <td>type</td>
 *         <td>String</td>
 *         <td>false</td>
 *         <td>The place type to be returned ("blog", "group", "project", or "space").
 *             If not specified, "group" will be assumed.</td>
 *     </tr>
 *     <tr>
 *         <td>error</td>
 *         <td>function</td>
 *         <td>false</td>
 *         <td>Jive will call this method when an error occurs</td>
 *     </tr>
 *     <tr>
 *         <td>success</td>
 *         <td>function</td>
 *         <td>true</td>
 *         <td>Jive will call this method on success, passing a response object that is
 *             the selected place.  If the user dod not select a place, this method will
 *             not be called.</td>
 *     </tr>
 * </table>
 *
 * @static
 */
osapi.jive.corev3.places.requestPicker = function(options) {
    options = options || {};
    options.type = options.type || "group";
    var containerType = 0;
    switch (options.type) {
        case "space":
            containerType = 14;
            break;
        case "group":
            containerType = 700;
            break;
        case "project":
            containerType = 600;
            break;
        case "blog":
            containerType = 37;
            break;
        default:
            throw options.type + " is not a valid type";
    }
    var contentType = (containerType == 37) ? 38 : 102; // Post or Document
    var success = options.success || function() {};
    var error =   options.error   || function() {};
    var pickerOptions = {
        containerType : containerType,
        contentType : contentType
    }

    var placeLoaderCallback = function(data) {
        if (data && !data.error) {
            success(data.list[0]);
        }
        else {
            error(data && data.error || {message:"unknown error"});
        }
    }

    var pickerCallback = function(data) {
        var containerID = data.targetContainerID;
        var containerTYpe = data.targetContainerType;
        osapi.jive.corev3.places.get({
            entityDescriptor : "" + containerType + "," + containerID
        }).execute(placeLoaderCallback);
    }

    gadgets.rpc.call(null, 'request_place_picker', pickerCallback, pickerOptions);

}

