/*
 * $Revision$
 * $Date$
 *
 * Copyright (C) 1999-2012 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/**
 * Asks the Jive container to prompt the user to select one or more people.
 *
 * @method requestPicker
 * @param options {Object} The following options are supported:
 * <p></p>
 * <table>
 *     <tr>
 *         <th>Name</th>
 *         <th class='wider'>Type</th>
 *         <th>Required</th>
 *         <th>Description</th>
 *     </tr>
 *     <tr>
 *         <td>multiple</td>
 *         <td>boolean</td>
 *         <td>false</td>
 *         <td>Flag indicating whether multiple people can be selected (default is false)</td>
 *         <td>&nbsp;</td>
 *     </tr>
 *     <tr>
 *         <td>success</td>
 *         <td>function</td>
 *         <td>true</td>
 *         <td>
 *             Jive will call this method on success, passing a response object that is an
 *             osapi.jive.corev3.people.Person object (if there is exactly one result) the
 *             typical collection with a list of Person objects (if there is more than one
 *             result.  If the user did not select any people, this method will not be called.
 *
 *         </td>
 *     </tr>
 *     <tr>
 *         <td>error</td>
 *         <td>function</td>
 *         <td>false</td>
 *         <td>
 *             Jive will call this method when an error occurs
 *         </td>
 *     </tr>
 * </table>
 *
 * @static
 */
osapi.jive.corev3.people.requestPicker = function(options) {

    options = options || {};
    var success = options.success || function() {};
    var error   = options.error   || function() {};
    var pickerOptions = {};
    pickerOptions.multiple = options.multiple || false;

    // Take the osapi.jive.corev3.people.Person object(s) returned from pickerCallback
    // and execute the originally requested callback function
    var personLoaderCallback = function(data) {
        if (data && !data.error) {
            success(data);
        }
        else {
            error(data && data.error || {message:"unknown error"});
        }
    }

    // Take the data returned by the picker and convert to full osapi.jive.corev3.people.Person object(s)
    var pickerCallback = function(data) {
        if (data.users.length == 1) {
            osapi.jive.corev3.people.get({ id : data.users[0].userID }).execute(function(response) {
                personLoaderCallback(response);
            })
        }
        else if (data.users.length > 1) {
            var results = [ ];
            var ids = "";
            for (var i = 0; i < data.users.length; i++) {
                if (ids != "") {
                    ids += ",";
                }
                ids += "" + data.users[i].userID;
            }
            var href = '/people?ids=' + ids;
            console.log("href=" + href);
            var response = osapi.jive.core.get({
                href : href,
                v : 'v3'
            }).execute(function(response) {
                personLoaderCallback(response);
            });
        }
    }

    gadgets.rpc.call(null, "request_user_picker", pickerCallback, pickerOptions);

}
